<?php
/**
 * @file
 * @brief Bootstrap principal du plugin Gomile Shipment.
 * @package GomileShipment
 */
/**
 * Plugin Name: Gomile Shipment
 * Plugin URI: https://gomile.com
 * Description: WooCommerce shipping method to assign a delivery driver via Gomile.
 * Version: 1.1.0
 * Author: Gomile
 * Text Domain: gomile-shipment
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('GOMILE_SHIPMENT_VERSION', '1.1.0');
define('GOMILE_SHIPMENT_PLUGIN_FILE', __FILE__);
define('GOMILE_SHIPMENT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GOMILE_SHIPMENT_PLUGIN_URL', plugin_dir_url(__FILE__));

add_action('plugins_loaded', 'gomile_shipment_init_plugin', 20);

/**
 * @brief Bootstrap du plugin.
 *
 * Charge d'abord les reglages admin pour rendre la configuration disponible
 * meme si WooCommerce n'est pas actif, puis charge les briques metier
 * dependantes de WooCommerce.
 *
 * @return void
 */
function gomile_shipment_init_plugin() {
    load_plugin_textdomain(
        'gomile-shipment',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );

    require_once GOMILE_SHIPMENT_PLUGIN_DIR . 'includes/class-admin-settings.php';

    if (class_exists('Gomile_Shipment_Admin_Settings')) {
        Gomile_Shipment_Admin_Settings::init();
    }

    if (!class_exists('WooCommerce')) {
        return;
    }

    require_once GOMILE_SHIPMENT_PLUGIN_DIR . 'includes/class-shipping-method.php';
    require_once GOMILE_SHIPMENT_PLUGIN_DIR . 'includes/class-delivery-api.php';
    require_once GOMILE_SHIPMENT_PLUGIN_DIR . 'includes/class-order-handler.php';
    require_once GOMILE_SHIPMENT_PLUGIN_DIR . 'includes/class-rest-endpoints.php';

    if (class_exists('Gomile_Shipment_REST_Endpoints')) {
            Gomile_Shipment_REST_Endpoints::init();
    }
}

add_action('admin_notices', 'gomile_shipment_missing_woocommerce_notice');

/**
 * @brief Affiche un message d'erreur en admin quand WooCommerce est absent.
 *
 * @return void
 */
function gomile_shipment_missing_woocommerce_notice() {
    if (!current_user_can('activate_plugins') || class_exists('WooCommerce')) {
        return;
    }

    echo '<div class="notice notice-error"><p>';
    echo esc_html__('Gomile Shipment requires WooCommerce to be installed and active.', 'gomile-shipment');
    echo '</p></div>';
}
