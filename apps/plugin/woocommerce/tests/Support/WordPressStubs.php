<?php

namespace {
    if (!defined('MINUTE_IN_SECONDS')) {
        define('MINUTE_IN_SECONDS', 60);
    }

    if (!class_exists('WP_Error')) {
        class WP_Error {
            protected string $code;
            protected string $message;
            protected mixed $data;

            public function __construct($code = '', $message = '', $data = null) {
                $this->code = (string) $code;
                $this->message = (string) $message;
                $this->data = $data;
            }

            public function get_error_code() {
                return $this->code;
            }

            public function get_error_message() {
                return $this->message;
            }

            public function get_error_data() {
                return $this->data;
            }
        }
    }

    if (!class_exists('WP_REST_Response')) {
        class WP_REST_Response {
            protected mixed $data;
            protected int $status;

            public function __construct($data = null, $status = 200) {
                $this->data = $data;
                $this->status = (int) $status;
            }

            public function get_data() {
                return $this->data;
            }

            public function get_status() {
                return $this->status;
            }
        }
    }

    if (!class_exists('WP_REST_Server')) {
        class WP_REST_Server {
            public const CREATABLE = 'POST';
        }
    }

    if (!class_exists('WC_Order')) {
        class WC_Order {
        }
    }

    if (!class_exists('WC_Shipping_Method')) {
        class WC_Shipping_Method {
            public string $id = 'gomile_shipment';
            public int $instance_id = 0;
            public string $title = 'Gomile Delivery';
        }
    }
}

namespace GomileShipment\Tests\Support {
    final class WordPressState {
        public static array $actions = array();
        public static array $filters = array();
        public static array $options = array();
        public static array $transients = array();
        public static array $orders = array();
        public static mixed $remoteRequestHandler = null;
        public static array $registeredRoutes = array();

        public static function reset(): void {
            foreach (array(
                'GOMILE_API_BASE_URL',
                'GOMILE_AUTH_HEADER',
                'GOMILE_AUTH_SCHEME',
                'GOMILE_ENABLE_LIVE_RATES',
                'GOMILE_QUOTE_ENDPOINT',
                'GOMILE_QUOTE_METHOD',
                'GOMILE_QUOTE_CACHE_MINUTES',
                'GOMILE_CREATE_ENDPOINT',
                'GOMILE_STATUS_ENDPOINT',
                'GOMILE_CANCEL_ENDPOINT',
                'GOMILE_TIMEOUT',
                'GOMILE_AUTO_CREATE',
                'GOMILE_DEBUG_MODE',
            ) as $envName) {
                putenv($envName);
            }

            self::$actions = array();
            self::$filters = array();
            self::$options = array();
            self::$transients = array();
            self::$orders = array();
            self::$remoteRequestHandler = null;
            self::$registeredRoutes = array();
        }
    }

    final class FakeProduct {
        public function __construct(private mixed $weight) {
        }

        public function get_weight() {
            return $this->weight;
        }
    }

    final class FakeOrderItem {
        public function __construct(private mixed $product, private int $quantity = 1) {
        }

        public function get_product() {
            return $this->product;
        }

        public function get_quantity() {
            return $this->quantity;
        }
    }

    final class FakeShippingItem {
        public function __construct(private string $methodId) {
        }

        public function get_method_id() {
            return $this->methodId;
        }
    }

    final class FakeOrder extends \WC_Order {
        public array $meta = array();
        public array $notes = array();
        public int $saveCount = 0;
        private int $id;
        private string $billingPhone;
        private string $billingFirstName;
        private string $billingLastName;
        private string $shippingFirstName;
        private string $shippingLastName;
        private array $billingAddress;
        private array $shippingAddress;
        private array $items;
        private array $shippingMethods;
        private string $status;

        public function __construct(array $data = array()) {
            $this->id = (int) ($data['id'] ?? 123);
            $this->billingPhone = (string) ($data['billing_phone'] ?? '0600000000');
            $this->billingFirstName = (string) ($data['billing_first_name'] ?? 'Jean');
            $this->billingLastName = (string) ($data['billing_last_name'] ?? 'Dupont');
            $this->shippingFirstName = (string) ($data['shipping_first_name'] ?? '');
            $this->shippingLastName = (string) ($data['shipping_last_name'] ?? '');
            $this->billingAddress = (array) ($data['billing_address'] ?? array(
                'address_1' => '2 rue Client',
                'address_2' => '',
                'postcode' => '38000',
                'city' => 'Grenoble',
                'state' => '',
                'country' => 'FR',
            ));
            $this->shippingAddress = (array) ($data['shipping_address'] ?? array());
            $this->items = (array) ($data['items'] ?? array());
            $this->shippingMethods = (array) ($data['shipping_methods'] ?? array());
            $this->status = (string) ($data['status'] ?? 'processing');
            $this->meta = (array) ($data['meta'] ?? array());
        }

        public function get_id() {
            return $this->id;
        }

        public function get_billing_phone() {
            return $this->billingPhone;
        }

        public function get_billing_first_name() {
            return $this->billingFirstName;
        }

        public function get_billing_last_name() {
            return $this->billingLastName;
        }

        public function get_shipping_first_name() {
            return $this->shippingFirstName;
        }

        public function get_shipping_last_name() {
            return $this->shippingLastName;
        }

        public function get_address($type) {
            return $type === 'shipping' ? $this->shippingAddress : $this->billingAddress;
        }

        public function get_items() {
            return $this->items;
        }

        public function get_shipping_methods() {
            return $this->shippingMethods;
        }

        public function get_meta($key, $single = true) {
            return $this->meta[$key] ?? '';
        }

        public function update_meta_data($key, $value) {
            $this->meta[$key] = $value;
        }

        public function delete_meta_data($key) {
            unset($this->meta[$key]);
        }

        public function save() {
            $this->saveCount++;
        }

        public function add_order_note($note) {
            $this->notes[] = $note;
        }

        public function update_status($status, $note = '') {
            $this->status = (string) $status;

            if ($note !== '') {
                $this->add_order_note($note);
            }
        }

        public function get_status() {
            return $this->status;
        }
    }

    final class FakeRestRequest {
        public function __construct(
            private array $jsonParams = array(),
            private string $body = '',
            private array $headers = array()
        ) {
        }

        public function get_json_params() {
            return $this->jsonParams;
        }

        public function get_body() {
            return $this->body;
        }

        public function get_header($name) {
            foreach ($this->headers as $headerName => $value) {
                if (strcasecmp((string) $headerName, (string) $name) === 0) {
                    return $value;
                }
            }

            return '';
        }
    }
}

namespace {
    use GomileShipment\Tests\Support\WordPressState;

    if (!function_exists('__')) {
        function __($text, $domain = 'default') {
            return $text;
        }
    }

    if (!function_exists('_x')) {
        function _x($text, $context, $domain = 'default') {
            return $text;
        }
    }

    if (!function_exists('esc_html__')) {
        function esc_html__($text, $domain = 'default') {
            return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
        }
    }

    if (!function_exists('esc_html')) {
        function esc_html($text) {
            return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
        }
    }

    if (!function_exists('esc_url')) {
        function esc_url($url) {
            return (string) $url;
        }
    }

    if (!function_exists('esc_url_raw')) {
        function esc_url_raw($url) {
            return (string) $url;
        }
    }

    if (!function_exists('wp_unslash')) {
        function wp_unslash($value) {
            return is_array($value) ? array_map('wp_unslash', $value) : stripslashes((string) $value);
        }
    }

    if (!function_exists('wp_strip_all_tags')) {
        function wp_strip_all_tags($text) {
            return strip_tags((string) $text);
        }
    }

    if (!function_exists('sanitize_text_field')) {
        function sanitize_text_field($value) {
            return trim(wp_strip_all_tags((string) $value));
        }
    }

    if (!function_exists('sanitize_textarea_field')) {
        function sanitize_textarea_field($value) {
            return trim(wp_strip_all_tags((string) $value));
        }
    }

    if (!function_exists('sanitize_key')) {
        function sanitize_key($key) {
            return preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $key));
        }
    }

    if (!function_exists('wp_json_encode')) {
        function wp_json_encode($value, $flags = 0, $depth = 512) {
            return json_encode($value, $flags, $depth);
        }
    }

    if (!function_exists('wp_parse_args')) {
        function wp_parse_args($args, $defaults = array()) {
            return array_merge((array) $defaults, (array) $args);
        }
    }

    if (!function_exists('absint')) {
        function absint($value) {
            return abs((int) $value);
        }
    }

    if (!function_exists('get_option')) {
        function get_option($option, $default = false) {
            return array_key_exists($option, WordPressState::$options)
                ? WordPressState::$options[$option]
                : $default;
        }
    }

    if (!function_exists('update_option')) {
        function update_option($option, $value) {
            WordPressState::$options[$option] = $value;
            return true;
        }
    }

    if (!function_exists('getenv')) {
        function getenv($varname, $local_only = false) {
            return false;
        }
    }

    if (!function_exists('get_transient')) {
        function get_transient($transient) {
            return WordPressState::$transients[$transient] ?? false;
        }
    }

    if (!function_exists('set_transient')) {
        function set_transient($transient, $value, $expiration = 0) {
            WordPressState::$transients[$transient] = $value;
            return true;
        }
    }

    if (!function_exists('delete_transient')) {
        function delete_transient($transient) {
            unset(WordPressState::$transients[$transient]);
            return true;
        }
    }

    if (!function_exists('add_action')) {
        function add_action($hook, $callback, $priority = 10, $accepted_args = 1) {
            WordPressState::$actions[] = compact('hook', 'callback', 'priority', 'accepted_args');
            return true;
        }
    }

    if (!function_exists('add_filter')) {
        function add_filter($hook, $callback, $priority = 10, $accepted_args = 1) {
            WordPressState::$filters[$hook][] = compact('callback', 'priority', 'accepted_args');
            return true;
        }
    }

    if (!function_exists('apply_filters')) {
        function apply_filters($hook, $value, ...$args) {
            if (empty(WordPressState::$filters[$hook])) {
                return $value;
            }

            foreach (WordPressState::$filters[$hook] as $filter) {
                $value = call_user_func($filter['callback'], $value, ...$args);
            }

            return $value;
        }
    }

    if (!function_exists('register_setting')) {
        function register_setting($option_group, $option_name, $args = array()) {
            return true;
        }
    }

    if (!function_exists('add_settings_section')) {
        function add_settings_section($id, $title, $callback, $page) {
            return true;
        }
    }

    if (!function_exists('add_settings_field')) {
        function add_settings_field($id, $title, $callback, $page, $section = 'default', $args = array()) {
            return true;
        }
    }

    if (!function_exists('add_submenu_page')) {
        function add_submenu_page($parent_slug, $page_title, $menu_title, $capability, $menu_slug, $callback = '') {
            return $menu_slug;
        }
    }

    if (!function_exists('add_options_page')) {
        function add_options_page($page_title, $menu_title, $capability, $menu_slug, $callback = '') {
            return $menu_slug;
        }
    }

    if (!function_exists('register_rest_route')) {
        function register_rest_route($namespace, $route, $args = array(), $override = false) {
            WordPressState::$registeredRoutes[] = compact('namespace', 'route', 'args', 'override');
            return true;
        }
    }

    if (!function_exists('current_user_can')) {
        function current_user_can($capability) {
            return true;
        }
    }

    if (!function_exists('rest_url')) {
        function rest_url($path = '') {
            return 'https://example.test/wp-json/' . ltrim((string) $path, '/');
        }
    }

    if (!function_exists('admin_url')) {
        function admin_url($path = '') {
            return 'https://example.test/wp-admin/' . ltrim((string) $path, '/');
        }
    }

    if (!function_exists('plugin_basename')) {
        function plugin_basename($file) {
            return basename((string) $file);
        }
    }

    if (!function_exists('load_plugin_textdomain')) {
        function load_plugin_textdomain($domain, $deprecated = false, $plugin_rel_path = false) {
            return true;
        }
    }

    if (!function_exists('is_wp_error')) {
        function is_wp_error($thing) {
            return $thing instanceof WP_Error;
        }
    }

    if (!function_exists('wc_format_decimal')) {
        function wc_format_decimal($number, $dp = false, $trim_zeros = false) {
            return (string) round((float) str_replace(',', '.', (string) $number), $dp === false ? 6 : (int) $dp);
        }
    }

    if (!function_exists('get_woocommerce_currency')) {
        function get_woocommerce_currency() {
            return 'EUR';
        }
    }

    if (!function_exists('wc_get_logger')) {
        function wc_get_logger() {
            return new class {
                public array $messages = array();

                public function debug($message, $context = array()) {
                    $this->messages[] = compact('message', 'context');
                }
            };
        }
    }

    if (!function_exists('wc_get_order')) {
        function wc_get_order($order_id) {
            return WordPressState::$orders[(string) $order_id] ?? false;
        }
    }

    if (!function_exists('current_time')) {
        function current_time($format) {
            return date((string) $format, 1700000000);
        }
    }

    if (!function_exists('untrailingslashit')) {
        function untrailingslashit($string) {
            return rtrim((string) $string, '/');
        }
    }

    if (!function_exists('add_query_arg')) {
        function add_query_arg($args, $url) {
            $query = http_build_query((array) $args);

            if ($query === '') {
                return $url;
            }

            return $url . (str_contains((string) $url, '?') ? '&' : '?') . $query;
        }
    }

    if (!function_exists('wp_remote_request')) {
        function wp_remote_request($url, $args = array()) {
            if (is_callable(WordPressState::$remoteRequestHandler)) {
                return call_user_func(WordPressState::$remoteRequestHandler, $url, $args);
            }

            return new WP_Error('unexpected_remote_request', 'No remote request handler was configured for this test.');
        }
    }

    if (!function_exists('wp_remote_retrieve_response_code')) {
        function wp_remote_retrieve_response_code($response) {
            return (int) ($response['response']['code'] ?? $response['status_code'] ?? 0);
        }
    }

    if (!function_exists('wp_remote_retrieve_body')) {
        function wp_remote_retrieve_body($response) {
            return (string) ($response['body'] ?? '');
        }
    }
}
