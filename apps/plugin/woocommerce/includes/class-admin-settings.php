<?php
/**
 * @file
 * @brief Configuration admin et helpers de lecture des options Gomile Shipment.
 * @package GomileShipment
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * @brief Gere toute la configuration admin du plugin.
 *
 * Cette classe centralise :
 * - les valeurs par defaut,
 * - l'enregistrement des options,
 * - l'affichage de la page de reglages,
 * - les helpers de lecture des options depuis le reste du plugin.
 *
 * @package GomileShipment
 */
class Gomile_Shipment_Admin_Settings {
    const OPTION_NAME = 'gomile_shipment_settings';
    const PAGE_SLUG = 'gomile-shipment';
    const PRODUCTION_API_BASE_URL = 'https://api.gomile.delivery';

    /**
     * @brief Branche la page de reglages et le lien direct depuis la liste des plugins.
     *
     * @return void
     */
    public static function init() {
        add_action('admin_menu', array(__CLASS__, 'register_menu'));
        add_action('admin_init', array(__CLASS__, 'register_settings'));
        add_filter('plugin_action_links_' . plugin_basename(GOMILE_SHIPMENT_PLUGIN_FILE), array(__CLASS__, 'add_plugin_action_links'));

        self::define_default_constants();
    }

    /**
     * @brief Définit les constantes du plugin à partir des valeurs par défaut.
     *
     * Cela permet d'avoir les constantes disponibles même si elles ne sont pas
     * explicitement définies dans wp-config.php ou l'environnement.
     *
     * @return void
     */
    public static function define_default_constants() {
        $defaults = self::get_defaults();

        foreach (self::get_constant_map() as $key => $constant) {
            if (!defined($constant) && array_key_exists($key, $defaults)) {
                define($constant, $defaults[$key]);
            }
        }
    }

    /**
     * @brief Retourne les valeurs par defaut du plugin.
     *
     * @return array<string,mixed>
     */
    public static function get_defaults() {
        return array(
            'api_base_url'     => 'http://localhost:3000',
            'api_key'          => '',
            'auth_header'      => 'x-api-key',
            'auth_scheme'      => 'Bearer',
            'enable_live_rates'=> 'yes',
            'quote_endpoint'   => '/delivery-estimates',
            'quote_method'     => 'POST',
            'quote_cache_minutes' => 10,
            'create_endpoint'  => '/plugin/orders',
            'status_endpoint'  => '/deliveries/{delivery_id}',
            'cancel_endpoint'  => '/plugin/orders/cancel',
            'timeout'          => 20,
            'auto_create'      => 'yes',
            'webhook_secret'   => '',
            'debug_mode'       => 'yes',
        );
    }

    /**
     * @brief Mappe chaque cle de configuration vers une constante PHP optionnelle.
     *
     * Si la constante est definie, sa valeur est prioritaire sur la base de
     * donnees et sur la valeur par defaut.
     *
     * @return array<string,string>
     */
    public static function get_constant_map() {
        return array(
            'api_base_url'        => 'GOMILE_API_BASE_URL',
            'auth_header'         => 'GOMILE_AUTH_HEADER',
            'auth_scheme'         => 'GOMILE_AUTH_SCHEME',
            'enable_live_rates'   => 'GOMILE_ENABLE_LIVE_RATES',
            'quote_endpoint'      => 'GOMILE_QUOTE_ENDPOINT',
            'quote_method'        => 'GOMILE_QUOTE_METHOD',
            'quote_cache_minutes' => 'GOMILE_QUOTE_CACHE_MINUTES',
            'create_endpoint'     => 'GOMILE_CREATE_ENDPOINT',
            'status_endpoint'     => 'GOMILE_STATUS_ENDPOINT',
            'cancel_endpoint'     => 'GOMILE_CANCEL_ENDPOINT',
            'timeout'             => 'GOMILE_TIMEOUT',
            'auto_create'         => 'GOMILE_AUTO_CREATE',
            'debug_mode'          => 'GOMILE_DEBUG_MODE',
        );
    }

    /**
     * @brief Retourne les valeurs forcees par constante PHP ou variable d'environnement.
     *
     * Priorite : constante PHP > variable d'environnement.
     *
     * @return array<string,mixed>
     */
    public static function get_constant_overrides() {
        $overrides = array();

        foreach (self::get_constant_map() as $key => $constant) {
            if (defined($constant)) {
                $overrides[$key] = constant($constant);
            } elseif (false !== getenv($constant)) {
                $overrides[$key] = getenv($constant);
            }
        }

        return $overrides;
    }

    /**
     * @brief Retourne la configuration complete fusionnee avec les valeurs par defaut.
     *
     * Ordre de priorite : constantes PHP > base de donnees > valeurs par defaut.
     *
     * @return array<string,mixed>
     */
    public static function get_settings() {
        $settings = wp_parse_args((array) get_option(self::OPTION_NAME, array()), self::get_defaults());
        $settings = array_merge($settings, self::get_constant_overrides());

        if (getenv('DEBUG') === 'false') {
            $settings['api_base_url'] = self::PRODUCTION_API_BASE_URL;
        }

        return $settings;
    }

    /**
     * @brief Retourne une option unique avec fallback.
     *
     * @param $key Nom de l'option.
     * @param $default Valeur de fallback.
     * @return mixed
     */
    public static function get_option($key, $default = '') {
        $settings = self::get_settings();

        if (array_key_exists($key, $settings)) {
            return $settings[$key];
        }

        return $default;
    }

    /**
     * @brief Indique si une cle API est deja enregistree.
     *
     * @return bool
     */
    public static function has_api_key() {
        return '' !== trim((string) self::get_option('api_key', ''));
    }

    /**
     * @brief Indique si la creation automatique de livraison est active.
     *
     * @return bool
     */
    public static function is_auto_create_enabled() {
        return 'yes' === self::get_option('auto_create', 'yes');
    }

    /**
     * @brief Indique si la tarification dynamique est active.
     *
     * @return bool
     */
    public static function is_live_rates_enabled() {
        return 'yes' === self::get_option('enable_live_rates', 'no');
    }

    /**
     * @brief Indique si le logging debug est active.
     *
     * @return bool
     */
    public static function is_debug_enabled() {
        return 'yes' === self::get_option('debug_mode', 'no');
    }

    /**
     * @brief Retourne l'URL REST du webhook expose par le plugin.
     *
     * @return string
     */
    public static function get_webhook_url() {
        return rest_url('gomile-shipment/v1/webhook');
    }

    /**
     * @brief Retourne le secret du webhook.
     *
     * @return string
     */
    public static function get_webhook_secret() {
        return self::get_option('webhook_secret', '');
    }

    /**
     * @brief Retourne la capacite requise pour acceder a la page de reglages.
     *
     * @return string
     */
    public static function get_required_capability() {
        if (current_user_can('manage_woocommerce')) {
            return 'manage_woocommerce';
        }

        return 'manage_options';
    }

    /**
     * @brief Retourne l'URL admin de la page de reglages.
     *
     * @return string
     */
    public static function get_settings_page_url() {
        return admin_url('options-general.php?page=' . self::PAGE_SLUG);
    }

    /**
     * @brief Enregistre les points d'entree de la page de configuration.
     *
     * @return void
     */
    public static function register_menu() {
        $capability = self::get_required_capability();

        add_submenu_page(
            'woocommerce',
            __('Gomile Shipment', 'gomile-shipment'),
            __('Gomile Shipment', 'gomile-shipment'),
            $capability,
            self::PAGE_SLUG,
            array(__CLASS__, 'render_settings_page')
        );

        add_options_page(
            __('Gomile Shipment', 'gomile-shipment'),
            __('Gomile Shipment', 'gomile-shipment'),
            $capability,
            self::PAGE_SLUG,
            array(__CLASS__, 'render_settings_page')
        );
    }

    /**
     * @brief Ajoute un lien Settings dans la liste des plugins.
     *
     * @param $links Liens existants.
     * @return array<int,string>
     */
    public static function add_plugin_action_links($links) {
        $settings_link = sprintf(
            '<a href="%1$s">%2$s</a>',
            esc_url(self::get_settings_page_url()),
            esc_html__('Settings', 'gomile-shipment')
        );

        array_unshift($links, $settings_link);

        return $links;
    }

    /**
     * @brief Declare toutes les sections et tous les champs du plugin.
     *
     * @return void
     */
    public static function register_settings() {
        register_setting(
            'gomile_shipment_settings_group',
            self::OPTION_NAME,
            array(
                'sanitize_callback' => array(__CLASS__, 'sanitize_settings'),
                'default'           => self::get_defaults(),
            )
        );

        add_settings_section(
            'gomile_shipment_api_section',
            __('API Configuration', 'gomile-shipment'),
            array(__CLASS__, 'render_api_section'),
            'gomile-shipment'
        );

        add_settings_field(
            'api_key',
            __('API Key', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_api_section',
            array(
                'key'         => 'api_key',
                'type'        => 'password',
                'description' => __('Shared secret or token sent with each request. Leave empty when saving to keep the current key.', 'gomile-shipment'),
            )
        );  

        add_settings_section(
            'gomile_shipment_delivery_section',
            __('Delivery Defaults', 'gomile-shipment'),
            array(__CLASS__, 'render_delivery_section'),
            'gomile-shipment'
        );

        add_settings_field(
            'sender_name',
            __('Sender Name', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_name',
                'description' => __('Default pickup contact name sent to the API.', 'gomile-shipment'),
            )
        );

        add_settings_field(
            'sender_phone',
            __('Sender Phone', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_phone',
                'description' => __('Default pickup contact phone sent to the API.', 'gomile-shipment'),
            )
        );

        add_settings_field(
            'sender_address_street_number',
            __('Sender Address Street Number', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_address_street_number',
                'description' => __('Primary street number for your pickup address.', 'gomile-shipment'),
            )
        );

        add_settings_field(
            'sender_address_street_name',
            __('Sender Address Street Name', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_address_street_name',
                'description' => __('Primary street name for your pickup address.', 'gomile-shipment'),
            )
        );

        add_settings_field(
            'sender_address_postal_code',
            __('Sender Address Postal Code', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_address_postal_code',
                'description' => __('Primary postal code for your pickup address.', 'gomile-shipment'),
            )
        );

        add_settings_field(
            'sender_address_city',
            __('Sender Address City', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_address_city',
                'description' => __('Primary city for your pickup address.', 'gomile-shipment'),
            )
        );

        add_settings_field(
            'sender_address_country',
            __('Sender Address Country', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_address_country',
                'description' => __('Primary country for your pickup address.', 'gomile-shipment'),
            )
        );



        /*add_settings_field(
            'sender_address',
            __('Sender Address', 'gomile-shipment'),
            array(__CLASS__, 'render_textarea_field'),
            'gomile-shipment',
            'gomile_shipment_delivery_section',
            array(
                'key'         => 'sender_address',
                'description' => __('Optional pickup address override. Leave empty to use the WooCommerce store address.', 'gomile-shipment'),
            )
        );*/

        


        add_settings_section(
            'gomile_shipment_webhook_section',
            __('Webhook', 'gomile-shipment'),
            array(__CLASS__, 'render_webhook_section'),
            'gomile-shipment'
        );

        add_settings_field( 
            'webhook_secret',
            __('Webhook Secret', 'gomile-shipment'),
            array(__CLASS__, 'render_text_field'),
            'gomile-shipment',
            'gomile_shipment_webhook_section',
            array(
                'key'         => 'webhook_secret',
                'type'        => 'password',
                'description' => __('Secret expected in the X-Gomile-Webhook-Secret header for incoming status updates.', 'gomile-shipment'),
            )
        );
    }

    /**
     * @brief Nettoie et normalise la configuration enregistree en base.
     *
     * @param $input Valeur brute soumise par le formulaire.
     * @return array<string,mixed>
     */
    public static function sanitize_settings($input) {
        $defaults = self::get_defaults();
        $sanitized = $defaults;
        $input = is_array($input) ? $input : array();

        $sanitized['api_base_url'] = isset($input['api_base_url']) ? esc_url_raw(trim(wp_unslash($input['api_base_url']))) : '';
        $existing_settings = self::get_settings();
        $submitted_api_key = isset($input['api_key']) ? trim(wp_unslash($input['api_key'])) : '';

        if ('' !== $submitted_api_key) {
            $sanitized['api_key'] = $submitted_api_key;
        } else {
            $sanitized['api_key'] = isset($existing_settings['api_key']) ? (string) $existing_settings['api_key'] : '';
        }

        $sanitized['enable_live_rates'] = !empty($input['enable_live_rates']) ? 'yes' : 'no';
        $sanitized['auth_header'] = isset($input['auth_header']) ? sanitize_text_field(wp_unslash($input['auth_header'])) : $defaults['auth_header'];
        $sanitized['auth_scheme'] = isset($input['auth_scheme']) ? sanitize_text_field(wp_unslash($input['auth_scheme'])) : $defaults['auth_scheme'];
        $sanitized['quote_endpoint'] = isset($input['quote_endpoint']) ? self::sanitize_endpoint_template($input['quote_endpoint']) : $defaults['quote_endpoint'];
        $sanitized['quote_method'] = (isset($input['quote_method']) && in_array(strtoupper((string) $input['quote_method']), array('GET', 'POST'), true)) ? strtoupper((string) $input['quote_method']) : $defaults['quote_method'];
        $sanitized['quote_cache_minutes'] = isset($input['quote_cache_minutes']) ? max(0, absint($input['quote_cache_minutes'])) : absint($defaults['quote_cache_minutes']);
        $sanitized['create_endpoint'] = isset($input['create_endpoint']) ? self::sanitize_endpoint_template($input['create_endpoint']) : $defaults['create_endpoint'];
        $sanitized['status_endpoint'] = isset($input['status_endpoint']) ? self::sanitize_endpoint_template($input['status_endpoint']) : $defaults['status_endpoint'];
        $sanitized['cancel_endpoint'] = isset($input['cancel_endpoint']) ? self::sanitize_endpoint_template($input['cancel_endpoint']) : $defaults['cancel_endpoint'];
        $sanitized['timeout'] = isset($input['timeout']) ? max(1, absint($input['timeout'])) : absint($defaults['timeout']);
        $sanitized['auto_create'] = !empty($input['auto_create']) ? 'yes' : 'no';
        $submitted_webhook_secret = isset($input['webhook_secret']) ? trim(wp_unslash($input['webhook_secret'])) : '';

        if ('' !== $submitted_webhook_secret) {
            $sanitized['webhook_secret'] = $submitted_webhook_secret;
        } else {
            $sanitized['webhook_secret'] = isset($existing_settings['webhook_secret']) ? (string) $existing_settings['webhook_secret'] : '';
        }
        $sanitized['sender_name'] = isset($input['sender_name']) ? sanitize_text_field(wp_unslash($input['sender_name'])) : $defaults['sender_name'];
        $sanitized['sender_phone'] = isset($input['sender_phone']) ? sanitize_text_field(wp_unslash($input['sender_phone'])) : '';
        $sanitized['sender_address_street_number'] = isset($input['sender_address_street_number']) ? sanitize_text_field(wp_unslash($input['sender_address_street_number'])) : '';
        $sanitized['sender_address_street_name'] = isset($input['sender_address_street_name']) ? sanitize_text_field(wp_unslash($input['sender_address_street_name'])) : '';
        $sanitized['sender_address_postal_code'] = isset($input['sender_address_postal_code']) ? sanitize_text_field(wp_unslash($input['sender_address_postal_code'])) : '';
        $sanitized['sender_address_city'] = isset($input['sender_address_city']) ? sanitize_text_field(wp_unslash($input['sender_address_city'])) : '';
        $sanitized['sender_address_country'] = isset($input['sender_address_country']) ? sanitize_text_field(wp_unslash($input['sender_address_country'])) : '';
        $sanitized['sender_address'] = isset($input['sender_address']) ? sanitize_textarea_field(wp_unslash($input['sender_address'])) : '';
        $sanitized['debug_mode'] = !empty($input['debug_mode']) ? 'yes' : 'no';

        return $sanitized;
    }

    /**
     * @brief Autorise soit une URL absolue, soit un endpoint relatif.
     *
     * @param $value Valeur brute saisie dans l'admin.
     * @return string
     */
    public static function sanitize_endpoint_template($value) {
        $value = trim(wp_unslash($value));

        if ('' === $value) {
            return '';
        }

        if (preg_match('#^https?://#i', $value)) {
            return esc_url_raw($value);
        }

        return '/' . ltrim(sanitize_text_field($value), '/');
    }

    /**
     * @brief Rendu principal de la page de configuration.
     *
     * @return void
     */
    public static function render_settings_page() {
        if (!current_user_can(self::get_required_capability())) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('Gomile Shipment', 'gomile-shipment'); ?></h1>
            <p><?php echo esc_html__('Configure the WooCommerce shipping method and map it to your delivery API.', 'gomile-shipment'); ?></p>
            <style>
                .gomile-webhook-url {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .gomile-copy-webhook-url .dashicons {
                    font-size: 16px;
                    line-height: 1.4;
                    width: 16px;
                    height: 16px;
                }
            </style>

            <form method="post" action="options.php">
                <?php
                settings_fields('gomile_shipment_settings_group');
                do_settings_sections('gomile-shipment');
                submit_button();
                ?>
            </form>
            <script>
                (function () {
                    const button = document.querySelector('.gomile-copy-webhook-url');

                    if (!button || !navigator.clipboard) {
                        return;
                    }

                    button.addEventListener('click', function () {
                        const target = document.getElementById(button.dataset.copyTarget);

                        if (!target) {
                            return;
                        }

                        navigator.clipboard.writeText(target.textContent.trim()).then(function () {
                            const originalTitle = button.getAttribute('title');
                            button.setAttribute('title', '<?php echo esc_js(__('Copied!', 'gomile-shipment')); ?>');
                            button.setAttribute('aria-label', '<?php echo esc_js(__('Copied!', 'gomile-shipment')); ?>');
                            button.classList.add('button-primary');

                            window.setTimeout(function () {
                                button.setAttribute('title', originalTitle);
                                button.setAttribute('aria-label', originalTitle);
                                button.classList.remove('button-primary');
                            }, 1200);
                        });
                    });
                })();
            </script>
        </div>
        <?php
    }

    /**
     * @brief Rendu du texte d'introduction de la section API.
     *
     * @return void
     */
    public static function render_api_section() {
        echo '<p>' . esc_html__('These settings define how the plugin authenticates and communicates with your delivery API, including optional live shipping quotes at cart and checkout.', 'gomile-shipment') . '</p>';
    }

    /**
     * @brief Rendu du texte d'introduction de la section des valeurs de livraison.
     *
     * @return void
     */
    public static function render_delivery_section() {
        echo '<p>' . esc_html__('These values are merged into the delivery payload when the customer selects Gomile at checkout.', 'gomile-shipment') . '</p>';
    }

    /**
     * @brief Rendu de la section webhook avec l'URL a configurer cote API.
     *
     * @return void
     */
    public static function render_webhook_section() {
        $webhook_url = self::get_webhook_url();

        echo '<p>' . esc_html__('Paste this URL in your Gomile panel to push delivery status updates back into WooCommerce.', 'gomile-shipment') . '</p>';
        echo '<p class="gomile-webhook-url">';
        echo '<code id="gomile-webhook-url">' . esc_html($webhook_url) . '</code> ';
        echo '<button type="button" class="button button-small gomile-copy-webhook-url" data-copy-target="gomile-webhook-url" aria-label="' . esc_attr__('Copy webhook URL', 'gomile-shipment') . '" title="' . esc_attr__('Copy webhook URL', 'gomile-shipment') . '">';
        echo '<span class="dashicons dashicons-admin-page" aria-hidden="true"></span>';
        echo '</button>';
        echo '</p>';
    }

    /**
     * @brief Champ texte generique reutilise par la plupart des reglages.
     *
     * @param $args Definition du champ.
     * @return void
     */
    public static function render_text_field($args) {
        $settings = self::get_settings();
        $key = $args['key'];
        $type = isset($args['type']) ? $args['type'] : 'text';
        $placeholder = isset($args['placeholder']) ? $args['placeholder'] : '';
        $description = isset($args['description']) ? $args['description'] : '';
        $value = isset($settings[$key]) ? $settings[$key] : '';

        if ('password' === $type) {
            $value = '';
        }

        printf(
            '<input type="%1$s" class="regular-text" name="%2$s[%3$s]" value="%4$s" placeholder="%5$s" autocomplete="off" />',
            esc_attr($type),
            esc_attr(self::OPTION_NAME),
            esc_attr($key),
            esc_attr($value),
            esc_attr($placeholder)
        );

        if ($description) {
            echo '<p class="description">' . esc_html($description) . '</p>';
        }

        if ('api_key' === $key && self::has_api_key()) {
            echo '<p class="description">' . esc_html__('A key is already saved for the API.', 'gomile-shipment') . '</p>';
        }

        if ($key === 'webhook_secret' && trim((string) self::get_webhook_secret()) !== '') {
            echo '<p class="description">' . esc_html__('A webhook secret is already saved.', 'gomile-shipment') . '</p>';
        }
    }

    /**
     * @brief Champ numerique pour timeout, cache, etc.
     *
     * @param $args Definition du champ.
     * @return void
     */
    public static function render_number_field($args) {
        $settings = self::get_settings();
        $key = $args['key'];
        $description = isset($args['description']) ? $args['description'] : '';
        $min = isset($args['min']) ? (int) $args['min'] : 0;
        $value = isset($settings[$key]) ? (int) $settings[$key] : 0;

        printf(
            '<input type="number" class="small-text" min="%1$d" name="%2$s[%3$s]" value="%4$d" />',
            $min,
            esc_attr(self::OPTION_NAME),
            esc_attr($key),
            $value
        );

        if ($description) {
            echo '<p class="description">' . esc_html($description) . '</p>';
        }
    }

    /**
     * @brief Champ select reutilisable pour les options enumerees.
     *
     * @param $args Definition du champ.
     * @return void
     */
    public static function render_select_field($args) {
        $settings = self::get_settings();
        $key = $args['key'];
        $description = isset($args['description']) ? $args['description'] : '';
        $options = isset($args['options']) ? (array) $args['options'] : array();
        $value = isset($settings[$key]) ? (string) $settings[$key] : '';

        printf(
            '<select name="%1$s[%2$s]">',
            esc_attr(self::OPTION_NAME),
            esc_attr($key)
        );

        foreach ($options as $option_value => $option_label) {
            printf(
                '<option value="%1$s" %2$s>%3$s</option>',
                esc_attr($option_value),
                selected($value, (string) $option_value, false),
                esc_html($option_label)
            );
        }

        echo '</select>';

        if ($description) {
            echo '<p class="description">' . esc_html($description) . '</p>';
        }
    }

    /**
     * @brief Champ textarea pour les valeurs multiligne comme l'adresse d'expedition.
     *
     * @param $args Definition du champ.
     * @return void
     */
    public static function render_textarea_field($args) {
        $settings = self::get_settings();
        $key = $args['key'];
        $description = isset($args['description']) ? $args['description'] : '';
        $value = isset($settings[$key]) ? $settings[$key] : '';

        printf(
            '<textarea class="large-text" rows="3" name="%1$s[%2$s]">%3$s</textarea>',
            esc_attr(self::OPTION_NAME),
            esc_attr($key),
            esc_textarea($value)
        );

        if ($description) {
            echo '<p class="description">' . esc_html($description) . '</p>';
        }
    }

    /**
     * @brief Champ checkbox reutilisable.
     *
     * @param $args Definition du champ.
     * @return void
     */
    public static function render_checkbox_field($args) {
        $settings = self::get_settings();
        $key = $args['key'];
        $label = isset($args['label']) ? $args['label'] : '';
        $checked = isset($settings[$key]) ? $settings[$key] : 'no';

        printf(
            '<label><input type="checkbox" name="%1$s[%2$s]" value="yes" %3$s /> %4$s</label>',
            esc_attr(self::OPTION_NAME),
            esc_attr($key),
            checked('yes', $checked, false),
            esc_html($label)
        );
    }

}
