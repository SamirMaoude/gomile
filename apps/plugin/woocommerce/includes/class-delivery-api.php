<?php
/**
 * @file
 * @brief Client HTTP et mapping des payloads vers l'API Gomile.
 * @package GomileShipment
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * @brief Client HTTP du plugin pour parler a l'API Gomile.
 *
 * Cette classe contient :
 * - la construction des payloads de devis et de livraison,
 * - la gestion de l'authentification,
 * - les appels HTTP,
 * - le parsing des reponses,
 * - le cache des devis.
 *
 * @package GomileShipment
 */
class Gomile_Shipment_Delivery_API {
    protected static $instance = null;
    protected $logger = null;

    /**
     * @brief Retourne l'instance unique du client API.
     *
     * @return self
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * @brief Demande un devis de livraison a l'API.
     *
     * Le resultat est mis en cache pour limiter les appels pendant les
     * recalculs repetes du panier et du checkout.
     *
     * @param $package Package WooCommerce.
     * @param $shipping_method Methode d'expedition courante.
     * @return array<string,mixed>|WP_Error
     */
    public function get_delivery_quote($package, $shipping_method = null) {

        $cache_key = $this->get_quote_cache_key($package, $shipping_method);
        $cached_quote = $this->get_cached_quote($cache_key);

        if (false !== $cached_quote) {
            $cached_quote['cached'] = true;
            return $cached_quote;
        }

        $payload = $this->build_quote_payload($package, $shipping_method);
        $method = strtoupper((string) Gomile_Shipment_Admin_Settings::get_option('quote_method', 'POST'));
        $request_args = array(
            'context' => array(
                'action'             => 'get_delivery_quote',
                'shipping_method_id' => $shipping_method instanceof WC_Shipping_Method ? $shipping_method->id : 'gomile_shipment',
                'instance_id'        => $shipping_method instanceof WC_Shipping_Method ? $shipping_method->instance_id : 0,
            ),
        );


        $request_args['body'] = $payload['body'];


        $response = $this->request(
            $method,
            Gomile_Shipment_Admin_Settings::get_option('quote_endpoint', '/quotes'),
            $request_args
        );

        if (is_wp_error($response)) {
            return $response;
        }

        $body = $response['body'];
        $price = $this->extract_quote_price($body);

        if (null === $price) {
            return new WP_Error('gomile_quote_missing_price', __('The quote response does not contain a valid price.', 'gomile-shipment'), $body);
        }

        $quote = array(
            'price'       => $price,
            'currency'    => $body['currency'] ?? 'EUR',
            'body'        => $body,
            'status_code' => $response['status_code'],
            'cached'      => false,
        );

        $this->cache_quote($cache_key, $quote);

        return $quote;
    }

    /**
     * @brief Cree une mission de livraison pour une commande WooCommerce.
     *
     * @param $order Commande WooCommerce.
     * @return array<string,mixed>|WP_Error
     */
    public function create_delivery($order) {
        if (!$order instanceof WC_Order) {
            return new WP_Error('gomile_invalid_order', __('The provided order is invalid.', 'gomile-shipment'));
        }

        $payload = $this->build_delivery_payload($order);

        if (is_wp_error($payload)) {
            return $payload;
        }

        $response = $this->request(
            'POST',
            Gomile_Shipment_Admin_Settings::get_option('create_endpoint', '/plugin/orders'),
            array(
                'body' => $payload,
                'context' => array(
                    'action' => 'create_delivery',
                    'order_id' => $order->get_id(),
                ),
            )
        );

        if (is_wp_error($response)) {
            return $response;
        }

        $body = isset($response['body']) ?$response['body'] : array();
        $delivery_id = isset($body['orderId']) ? (string) $body['orderId'] : '';

        if ($delivery_id === '') {
            return new WP_Error(
                'gomile_create_missing_order_id',
                __('The create order response does not contain an orderId.', 'gomile-shipment'),
                $body
            );
        }

        return array(
            'delivery_id'   => $delivery_id,
            'status'        => isset($body['delivery_status']) ? (string) $body['delivery_status'] : 'searching_driver',
            'tracking_url'  => isset($body['tracking_url']) ? esc_url_raw($body['tracking_url']) : '',
            'delivery_code' => isset($body['deliveryCode']) ? (string) $body['deliveryCode'] : '',
            'delivery_fee'  => isset($body['deliveryFee']) ? (float) $body['deliveryFee'] : null,
            'distance_km'   => isset($body['distanceKm']) ? (float) $body['distanceKm'] : null,
            'message'       => isset($body['message']) ? (string) $body['message'] : '',
            'body'          => $body,
            'status_code'   => $response['status_code'],
        );
    }

    /**
     * @brief Interroge l'API pour connaitre le statut courant d'une livraison.
     *
     * @param $delivery_id Identifiant de livraison cote API.
     * @return array<string,mixed>|WP_Error
     */
    public function get_delivery_status($delivery_id) {
        return array();
    }

    /**
     * @brief Demande l'annulation d'une mission cote API.
     *
     * @param $delivery_id Identifiant de livraison cote API.
     * @return array<string,mixed>|WP_Error
     */
    public function cancel_delivery($order_reference) {
        return $this->request(
            'POST',
            Gomile_Shipment_Admin_Settings::get_option('cancel_endpoint', '/plugin/orders/cancel'),
            array(
                'context' => array(
                    'action' => 'cancel_delivery',
                    'order_reference' => $order_reference,
                ),
                'query_args' => array(
                    'orderReference' => $order_reference,
                ),
            )
        );
    }

    /**
     * @brief Construit le payload envoye a l'endpoint de creation de livraison.
     *
     * @param $order Commande WooCommerce.
     * @return array<string,mixed>|WP_Error
     */
    public function build_delivery_payload($order) {
        if (!$order instanceof WC_Order) {
            return new WP_Error('gomile_invalid_order', __('The provided order is invalid.', 'gomile-shipment'));
        }

        $customer_name = $this->get_order_customer_name($order);
        $customer_phone = trim((string) $order->get_billing_phone());
        $dropoff_address = $this->get_order_dropoff_address($order);
        $weight = $this->get_order_total_weight($order);

        if ($customer_name === '') {
            return new WP_Error('gomile_missing_customer_name', __('The order does not contain a customer name.', 'gomile-shipment'));
        }

        if ($customer_phone === '') {
            return new WP_Error('gomile_missing_customer_phone', __('The order does not contain a customer phone number.', 'gomile-shipment'));
        }

        if ($dropoff_address === '') {
            return new WP_Error('gomile_missing_dropoff_address', __('The order does not contain a dropoff address.', 'gomile-shipment'));
        }

        return array(
            'customerName'   => $customer_name,
            'customerPhone'  => $customer_phone,
            'dropOffAddress' => $dropoff_address,
            'type'           => 'OTHER',
            'weight'         => $weight,
            'orderReference' => (string) $order->get_id(),
        );
    }

    /**
     * @brief Construit le payload envoye a l'endpoint de devis.
     *
     * Le payload est volontairement generique en attendant le contrat final
     * de l'API Gomile.
     *
     * @param $package Package WooCommerce.
     * @param $shipping_method Methode d'expedition courante.
     * @return array<string,mixed>
     */
    public function build_quote_payload($package, $shipping_method = null) {

        $pickup_address = array();

        $pickup_address["streetNumber"] = Gomile_Shipment_Admin_Settings::get_option('sender_address_street_number', '');
        $pickup_address["streetName"] = Gomile_Shipment_Admin_Settings::get_option('sender_address_street_name', '');
        $pickup_address["postalCode"] = Gomile_Shipment_Admin_Settings::get_option('sender_address_postal_code', '');
        $pickup_address["city"] = Gomile_Shipment_Admin_Settings::get_option('sender_address_city', '');
        $pickup_address["country"] = Gomile_Shipment_Admin_Settings::get_option('sender_address_country', '');
        $pickup_address["fullAddress"] = $this->get_full_adress($pickup_address);

        if($pickup_address["fullAddress"] === '') {
            $pickup_address["fullAddress"] = $this->get_pickup_address();
        }

        $dropoff_address["streetName"] = isset($package['destination']['address']) ? $package['destination']['address'] : '';
        $dropoff_address["city"] = isset($package['destination']['city']) ? $package['destination']['city'] : '';
        $dropoff_address["postalCode"] = isset($package['destination']['postcode']) ? $package['destination']['postcode'] : '';
        $dropoff_address["country"] = isset($package['destination']['country']) ? $package['destination']['country'] : '';
        $dropoff_address["fullAddress"] = $this->get_full_adress($dropoff_address);

        $package_totals = $this->get_package_totals($package);
        $payload = array(
            'shipping_method' => array(
                'id'          => $shipping_method instanceof WC_Shipping_Method ? $shipping_method->id : 'gomile_shipment',
                'instance_id' => $shipping_method instanceof WC_Shipping_Method ? (int) $shipping_method->instance_id : 0,
                'title'       => $shipping_method instanceof WC_Shipping_Method ? $shipping_method->title : '',
            ),
            'body' => array(
                'pickupAddress' => $pickup_address,
                'dropoffAddress' => $dropoff_address,
                'weightKg' => isset($package_totals['total_weight']) ?$package_totals['total_weight']  : 0
            )
        );

        return $payload;
    }

    /**
     * @brief Point unique pour tous les appels HTTP du plugin.
     *
     * Cette methode applique l'authentification, encode le body en JSON,
     * decode la reponse et transforme les erreurs HTTP en WP_Error.
     *
     * @param $method Methode HTTP.
     * @param $endpoint Endpoint relatif ou absolu.
     * @param $args Arguments techniques de la requete.
     * @return array<string,mixed>|WP_Error
     */
    protected function request($method, $endpoint, $args = array()) {
        $settings = Gomile_Shipment_Admin_Settings::get_settings();
        $context = isset($args['context']) ? $args['context'] : array();
        $tokens = isset($args['tokens']) ? (array) $args['tokens'] : array();
        $body = isset($args['body']) ? $args['body'] : null;
        $url = $this->build_url($endpoint, $tokens);
        $query_args = isset($args['query_args']) ? (array) $args['query_args'] : array();


        if (empty($url)) {
            return new WP_Error('gomile_missing_api_url', __('The Gomile API URL is not configured.', 'gomile-shipment'));
        }

        if (!empty($query_args)) {
            $url = add_query_arg($query_args, $url);
        }

        $headers = array(
            'Accept' => 'application/json',
        );

        if (null !== $body) {
            $headers['Content-Type'] = 'application/json';
        }

        if (!empty($settings['api_key']) && !empty($settings['auth_header'])) {
            $auth_value = trim((string) $settings['api_key']);
            $headers[$settings['auth_header']] = $auth_value;
        }

        $request_args = array(
            'method'  => strtoupper($method),
            'timeout' => max(1, (int) $settings['timeout']),
            'headers' => apply_filters('gomile_shipment_delivery_headers', $headers, $context),
        );

        if (null !== $body) {
            $request_args['body'] = wp_json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        $request_args = apply_filters('gomile_shipment_delivery_request_args', $request_args, $url, $context);

        $this->log('Request', array(
            'url'     => $url,
            'context' => $context,
            'args'    => $this->mask_sensitive_request_args($request_args),
        ));

        $response = wp_remote_request($url, $request_args);

        if (is_wp_error($response)) {
            $this->log('Request error', array(
                'url'     => $url,
                'context' => $context,
                'error'   => $response->get_error_message(),
            ));

            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $raw_body = wp_remote_retrieve_body($response);
        $decoded_body = array();

        if ('' !== $raw_body) {
            $decoded_body = json_decode($raw_body, true);

            if (!is_array($decoded_body)) {
                $decoded_body = array(
                    'raw_body' => $raw_body,
                );
            }
        }

        $this->log('Response', array(
            'url'         => $url,
            'context'     => $context,
            'status_code' => $status_code,
            'body'        => $decoded_body,
        ));

        if ($status_code < 200 || $status_code >= 300) {
            $message = $decoded_body['message']
                ?? $decoded_body['error']
                ?? $decoded_body['detail']
                ?? $decoded_body['title']
                ?? $decoded_body['raw_body']
                ?? __('Unknown API error.', 'gomile-shipment');

            return new WP_Error(
                'gomile_api_http_error',
                sprintf(
                    __('Gomile API request failed with HTTP %1$d: %2$s', 'gomile-shipment'),
                    $status_code,
                    wp_strip_all_tags((string) $message)
                ),
                array(
                    'status_code' => $status_code,
                    'body'        => $decoded_body,
                )
            );
        }

        return array(
            'status_code' => $status_code,
            'body'        => $decoded_body,
            'raw_body'    => $raw_body,
        );
    }

    /**
     * @brief Construit l'URL finale a partir de l'URL de base et d'un endpoint.
     *
     * @param $endpoint Endpoint relatif ou absolu.
     * @param $tokens Placeholders a remplacer.
     * @return string
     */
    protected function build_url($endpoint, $tokens = array()) {
        $endpoint = $this->replace_tokens($endpoint, $tokens);

        if (preg_match('#^https?://#i', $endpoint)) {
            return $endpoint;
        }

        $base_url = untrailingslashit((string) Gomile_Shipment_Admin_Settings::get_option('api_base_url', ''));

        if ('' === $base_url) {
            return '';
        }

        return $base_url . '/' . ltrim((string) $endpoint, '/');
    }

    /**
     * @brief Remplace les placeholders du type {delivery_id} dans les endpoints.
     *
     * @param $value Chaine contenant des placeholders.
     * @param $tokens Valeurs de remplacement.
     * @return string
     */
    protected function replace_tokens($value, $tokens = array()) {
        foreach ($tokens as $token => $replacement) {
            $value = str_replace('{' . $token . '}', rawurlencode((string) $replacement), $value);
        }

        return $value;
    }

    protected function get_full_adress($address) {
        $parts = array_filter(array(
            isset($address['streetNumber']) ? $address['streetNumber'] : '',
            isset($address['streetName']) ? $address['streetName'] : '',
            isset($address['postalCode']) ? $address['postalCode'] : '',
            isset($address['city']) ? $address['city'] : '',
            isset($address['country']) ? $address['country'] : '',
        ));

        return implode(', ', $parts);
    }

    /**
     * @brief Retourne l'adresse d'enlevement par defaut.
     *
     * Si aucune adresse personnalisee n'est configuree, le plugin utilise
     * l'adresse de la boutique WooCommerce.
     *
     * @return string
     */
    protected function get_pickup_address() {

        $parts = array_filter(array(
            get_option('woocommerce_store_address'),
            get_option('woocommerce_store_address_2'),
            get_option('woocommerce_store_city'),
            get_option('woocommerce_store_postcode'),
            get_option('woocommerce_default_country'),
        ));

        return implode(', ', $parts);
    }

    /**
     * @brief Calcule les totaux utiles au devis : poids, quantites, sous-total.
     *
     * @param $package Package WooCommerce.
     * @return array<string,mixed>
     */
    protected function get_package_totals($package) {
        $contents = isset($package['contents']) && is_array($package['contents']) ? $package['contents'] : array();
        $subtotal = 0.0;
        $weight = 1.0;
        $quantity = 0;

        foreach ($contents as $content) {
            $line_total = isset($content['line_total']) ? (float) $content['line_total'] : 0.0;
            $item_quantity = isset($content['quantity']) ? (int) $content['quantity'] : 0;
            $product_weight = 0.0;

            if(!empty($content['data']) && is_object($content['data'])) {
                $product_weight = method_exists($content['data'], 'get_weight') ? (float) $content['data']->get_weight() : 0.0;
            }

            $subtotal += $line_total;
            $quantity += $item_quantity;
            $weight += ($product_weight * $item_quantity);
        }

        return array(
            'currency'        => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : '',
            'contents_cost'   => isset($package['contents_cost']) ? (float) $package['contents_cost'] : $subtotal,
            'cart_subtotal'   => $subtotal,
            'item_count'      => $quantity,
            'total_weight'    => $weight,
            'applied_coupons' => isset($package['applied_coupons']) ? array_values((array) $package['applied_coupons']) : array(),
        );
    }

    /**
     * @brief Indique si la configuration minimale est presente pour appeler l'API.
     *
     * @return bool
     */
    public function is_configured() {
        $base_url = trim((string) Gomile_Shipment_Admin_Settings::get_option('api_base_url', ''));
        $api_key = trim((string) Gomile_Shipment_Admin_Settings::get_option('api_key', ''));

        return '' !== $base_url && '' !== $api_key;
    }

    /**
     * @brief Calcule le poids total de la commande, avec fallback pour conserver un devis coherent.
     *
     * @param $order Commande WooCommerce.
     * @return float
     */
    protected function get_order_total_weight($order) {
        $total_weight = 0.0;

        foreach ($order->get_items() as $item) {
            $product = $item->get_product();

            if (!$product || !method_exists($product, 'get_weight')) {
                continue;
            }

            $quantity = (int) $item->get_quantity();
            $weight = (float) $product->get_weight();
            $total_weight += ($weight * $quantity);
        }

        return max(1.0, (float) $total_weight);
    }

    protected function normalize_text($value) {
        $value = html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = wp_strip_all_tags($value);
        $value = preg_replace('/\s+/u', ' ', $value);

        return trim((string) $value);
    }

    /**
     * @brief Construit le nom client a partir des adresses WooCommerce.
     *
     * @param $order Commande WooCommerce.
     * @return string
     */
    protected function get_order_customer_name($order) {
        $shipping_name = trim($order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name());

        if ($shipping_name !== '') {
            return $this->normalize_text($shipping_name);
        }

        return $this->normalize_text(trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()));
    }

    /**
     * @brief Construit l'adresse de livraison en une chaine compatible avec l'API plugin/orders.
     *
     * @param $order Commande WooCommerce.
     * @return string
     */
    protected function get_order_dropoff_address($order) {
        $shipping = $order->get_address('shipping');
        $billing = $order->get_address('billing');
        $address = is_array($shipping) && array_filter($shipping) ? $shipping : $billing;

        $parts = array_filter(array(
            isset($address['address_1']) ? $address['address_1'] : '',
            isset($address['address_2']) ? $address['address_2'] : '',
            isset($address['postcode']) ? $address['postcode'] : '',
            isset($address['city']) ? $address['city'] : '',
            isset($address['state']) ? $address['state'] : '',
            isset($address['country']) ? $address['country'] : '',
        ));

        return $this->normalize_text(implode(', ', $parts));
    }


    /**
     * @brief Extrait un prix depuis des formats de reponse encore non stabilises.
     *
     * @param $body Corps de reponse decode.
     * @return float|null
     */
    protected function extract_quote_price($body) {
        $price = isset($body['deliveryFee']) ? $body['deliveryFee'] : null;

        if (!is_numeric($price)) {
            return null;
        }

        return (float) wc_format_decimal($price);
    }

    /**
     * @brief Cree une cle de cache pour un panier donne.
     *
     * @param $package Package WooCommerce.
     * @param $shipping_method Methode d'expedition courante.
     * @return string
     */
    protected function get_quote_cache_key($package, $shipping_method = null) {
        $cache_payload = array(
            'package'         => $this->build_quote_payload($package, $shipping_method),
            'quote_endpoint'  => Gomile_Shipment_Admin_Settings::get_option('quote_endpoint', '/quotes'),
            'quote_method'    => Gomile_Shipment_Admin_Settings::get_option('quote_method', 'POST'),
            'shipping_method' => $shipping_method instanceof WC_Shipping_Method ? $shipping_method->instance_id : 0,
        );

        return 'gomile_quote_' . md5(wp_json_encode($cache_payload));
    }

    /**
     * @brief Recupere un devis en cache si disponible.
     *
     * @param $cache_key Cle transient.
     * @return array<string,mixed>|false
     */
    protected function get_cached_quote($cache_key) {
        $cached_quote = get_transient($cache_key);

        return is_array($cached_quote) ? $cached_quote : false;
    }

    /**
     * @brief Stocke le devis temporairement pour eviter des appels repetes.
     *
     * @param $cache_key Cle transient.
     * @param $quote Devis a stocker.
     * @return void
     */
    protected function cache_quote($cache_key, $quote) {
        $cache_minutes = (int) Gomile_Shipment_Admin_Settings::get_option('quote_cache_minutes', 10);

        if ($cache_minutes <= 0) {
            return;
        }

        set_transient($cache_key, $quote, $cache_minutes * MINUTE_IN_SECONDS);
    }

    /**
     * @brief Masque les secrets avant ecriture dans les logs.
     *
     * @param $request_args Arguments de requete.
     * @return array<string,mixed>
     */
    protected function mask_sensitive_request_args($request_args) {
        if (empty($request_args['headers']) || !is_array($request_args['headers'])) {
            return $request_args;
        }

        foreach ($request_args['headers'] as $header_name => $value) {
            if (0 === strcasecmp((string) $header_name, (string) Gomile_Shipment_Admin_Settings::get_option('auth_header', 'Authorization'))) {
                $request_args['headers'][$header_name] = '***';
            }
        }

        return $request_args;
    }

    /**
     * @brief Ecrit dans le logger WooCommerce si le mode debug est actif.
     *
     * @param $message Message de log.
     * @param $context Contexte associe.
     * @return void
     */
    protected function log($message, $context = array()) {
        if (!Gomile_Shipment_Admin_Settings::is_debug_enabled()) {
            return;
        }

        $log_data = array(
            'message' => $message,
            'context' => $context,
        );      
        $log_json = wp_json_encode($log_data);

        // Try WooCommerce logger first
        if (null === $this->logger && function_exists('wc_get_logger')) {
            $this->logger = wc_get_logger();
        }

        if ($this->logger) {
            $this->logger->debug($log_json, array('source' => 'gomile-shipment'));
        }

        // Also log to PHP error log for easier access
        error_log('[Gomile Shipment] ' . $log_json);
    }
}

/**
 * @brief Helper procedural pour creer une livraison.
 *
 * @param $order Commande WooCommerce.
 * @return array<string,mixed>|WP_Error
 */
function gomile_shipment_create_delivery($order) {
    return Gomile_Shipment_Delivery_API::instance()->create_delivery($order);
}

/**
 * @brief Helper procedural pour recuperer un devis de livraison.
 *
 * @param $package Package WooCommerce.
 * @param $shipping_method Methode d'expedition courante.
 * @return array<string,mixed>|WP_Error
 */
function gomile_shipment_get_delivery_quote($package, $shipping_method = null) {
    return Gomile_Shipment_Delivery_API::instance()->get_delivery_quote($package, $shipping_method);
}

/**
 * @brief Helper procedural pour recuperer un statut de livraison.
 *
 * @param $delivery_id Identifiant de livraison cote API.
 * @return array<string,mixed>|WP_Error
 */
function gomile_shipment_get_delivery_status($delivery_id) {
    return Gomile_Shipment_Delivery_API::instance()->get_delivery_status($delivery_id);
}

/**
 * @brief Helper procedural pour annuler une livraison.
 *
 * @param $delivery_id Identifiant de livraison cote API.
 * @return array<string,mixed>|WP_Error
 */
function gomile_shipment_cancel_delivery($order_reference) {
    return Gomile_Shipment_Delivery_API::instance()->cancel_delivery($order_reference);
}
