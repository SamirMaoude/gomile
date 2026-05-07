<?php
/**
 * @file
 * @brief Declaration de la methode d'expedition WooCommerce Gomile.
 * @package GomileShipment
 */

if (!defined('ABSPATH')) {
    exit;
}
/**
 * @brief Point d'entree de la declaration de la methode d'expedition.
 * WooCommerce execute ce code a chaque chargement de page, mais la classe de la
 * methode n'est declaree que si WooCommerce est actif et que la classe n'existe pas deja.
 * Cela permet d'eviter les erreurs fatales si le plugin est desactive ou si WooCommerce n'est pas actif.
 */
add_action('woocommerce_shipping_init', 'gomile_shipment_shipping_init');

/**
 * @brief Declare la methode d'expedition WooCommerce Gomile.
 *
 * @return void
 */
function gomile_shipment_shipping_init() {
    if (!class_exists('WC_Shipping_Method') || class_exists('WC_Gomile_Shipment_Method')) {
        return;
    }

    /**
     * @brief Methode d'expedition visible par le client pendant le checkout.
     *
     * Elle sait afficher un prix fixe et, si active, demander un devis
     * dynamique a l'API Gomile.
     *
     * @package GomileShipment
     */
    class WC_Gomile_Shipment_Method extends WC_Shipping_Method {
        /**
         * @brief Initialise la methode et ses capacites WooCommerce.
         *
         * @param $instance_id Identifiant d'instance WooCommerce dans une zone.
         * @return void
         */
        public function __construct($instance_id = 0) {
            $this->id                 = 'gomile_shipment';
            $this->instance_id        = absint($instance_id);
            $this->method_title       = __('Gomile Shipment', 'gomile-shipment');
            $this->method_description = __('Create a delivery mission in your Gomile API when the customer selects this shipping method.', 'gomile-shipment');
            $this->supports           = array(
                'shipping-zones',
                'instance-settings',
                'instance-settings-modal',
            );

            $this->init();
        }

        /**
         * @brief Charge les options de l'instance de zone de livraison.
         *
         * @return void
         */
        public function init() {
            $this->init_instance_form_fields();
            $this->init_settings();

            $this->enabled = $this->get_option('enabled', 'yes');
            $this->title   = $this->get_option('title', __('Gomile Delivery', 'gomile-shipment'));
            $this->tax_status = $this->get_option('tax_status', 'taxable');

            add_action(
                'woocommerce_update_options_shipping_' . $this->id,
                array($this, 'process_admin_options')
            );
        }

        /**
         * @brief Definit les champs configures dans la zone de livraison WooCommerce.
         *
         * @return void
         */
        public function init_instance_form_fields() {
            $this->instance_form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable', 'gomile-shipment'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable Gomile Shipment', 'gomile-shipment'),
                    'default' => 'yes',
                ),
                'title' => array(
                    'title'       => __('Title', 'gomile-shipment'),
                    'type'        => 'text',
                    'description' => __('Title shown to customers during checkout.', 'gomile-shipment'),
                    'default'     => __('Gomile Delivery', 'gomile-shipment'),
                ),
                'tax_status' => array(
                    'title'       => __('Tax Status', 'gomile-shipment'),
                    'type'        => 'select',
                    'description' => __('Define whether the shipping cost is taxable.', 'gomile-shipment'),
                    'default'     => 'taxable',
                    'options'     => array(
                        'taxable' => __('Taxable', 'gomile-shipment'),
                        'none'    => _x('None', 'Tax status', 'gomile-shipment'),
                    ),
                )
            );
        }

        /**
         * @brief Calcule le tarif expose au panier et au checkout.
         *
         * Le plugin part d'un prix fixe, puis tente un devis API si l'option
         * de tarification dynamique est active.
         *
         * @param $package Donnees du colis/panier fournies par WooCommerce.
         * @return void
         */
        public function calculate_shipping($package = array()) {
            $fallback_cost = $this->get_option('cost', '5.99');
            $cost = '' === $fallback_cost ? 0 : (float) wc_format_decimal($fallback_cost);
            $quote = null;

            
            $quote = gomile_shipment_get_delivery_quote($package, $this);

            if (!is_wp_error($quote) && isset($quote['price']) && is_numeric($quote['price'])) {
                $cost = (float) $quote['price'];
            }

            $rate = array(
                'id'    => $this->get_rate_id(),
                'label' => $this->title,
                'cost'  => $cost,
                'taxes' => '',
            );

            $rate = apply_filters('gomile_shipment_shipping_rate', $rate, $package, $this);
            $this->add_rate($rate);
        }

        /**
         * @brief Normalise le prix saisi dans l'admin WooCommerce.
         *
         * @param $value Valeur brute saisie dans WooCommerce.
         * @return string
         */
        public function sanitize_cost($value) {
            return wc_format_decimal($value);
        }
    }
}

add_filter('woocommerce_shipping_methods', 'gomile_shipment_add_shipping_method');

/**
 * @brief Enregistre l'identifiant de la methode dans la liste WooCommerce.
 *
 * @param $methods Liste des methodes WooCommerce.
 * @return array<string,string>
 */
function gomile_shipment_add_shipping_method($methods) {
    $methods['gomile_shipment'] = 'WC_Gomile_Shipment_Method';
    return $methods;
}
