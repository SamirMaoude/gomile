<?php
/**
 * @file
 * @brief Hooks WooCommerce liés à la commande et à la création de livraison.
 * @package GomileShipment
 */

if (!defined('ABSPATH')) {
    exit;
}

// creation de la livraison
add_action('woocommerce_checkout_order_processed', 'gomile_shipment_handle_order', 10, 1);
add_action('woocommerce_store_api_checkout_order_processed', 'gomile_shipment_handle_block_order', 10, 1);

// annulation d'une livraison si la commande est annulee
add_action('woocommerce_order_status_cancelled', 'gomile_shipment_cancel_delivery_on_order_cancelled', 10, 1);

/**
 * @brief Point d'entrée checkout classique.
 *
 * @param $order_id Identifiant de commande WooCommerce.
 * @return void
 */
function gomile_shipment_handle_order($order_id) {
    $order = wc_get_order($order_id);

    if (!$order) {
        return;
    }

    gomile_shipment_process_order($order, 'checkout');
}

/**
 * @brief Point d'entrée checkout blocs / Store API.
 *
 * @param $order Commande WooCommerce déjà instanciée.
 * @return void
 */
function gomile_shipment_handle_block_order($order) {
    if (!$order instanceof WC_Order) {
        return;
    }

    gomile_shipment_process_order($order, 'store_api_checkout');
}

/**
 * @brief Initialise les métadonnées Gomile puis crée la commande côté API au checkout.
 *
 * @param $order Commande WooCommerce.
 * @param $trigger Origine de l'appel.
 * @return void
 */
function gomile_shipment_process_order($order, $trigger = 'manual') {
    if (!$order instanceof WC_Order || !gomile_shipment_order_uses_method($order)) {
        return;
    }

    if (!$order->get_meta('_gomile_shipment_status', true)) {
        $order->update_meta_data('_gomile_shipment_status', 'pending');
    }

    if (!$order->get_meta('_gomile_shipment_delivery_id', true)) {
        $order->update_meta_data('_gomile_shipment_delivery_id', '');
    }

    if (!$order->get_meta('_gomile_shipment_delivery_created', true)) {
        $order->update_meta_data('_gomile_shipment_delivery_created', 'no');
    }

    $order->save();

    if (!Gomile_Shipment_Admin_Settings::is_auto_create_enabled()) {
        return;
    }

    gomile_shipment_dispatch_delivery($order, $trigger);
}

/**
 * @brief Crée la commande Gomile si elle n'existe pas déjà.
 *
 * @param $order Commande WooCommerce.
 * @param $trigger Origine de l'appel.
 * @return void
 */
function gomile_shipment_dispatch_delivery($order, $trigger = 'manual') {
    if (!$order instanceof WC_Order) {
        return;
    }

    $already_created = (string) $order->get_meta('_gomile_shipment_delivery_created', true) === 'yes';
    $existing_delivery_id = (string) $order->get_meta('_gomile_shipment_delivery_id', true);

    if ($already_created || $existing_delivery_id !== '') {
        return;
    }

    $status = (string) $order->get_meta('_gomile_shipment_status', true);

    if ($status === 'creating' ) {
        return;
    }

    $api = Gomile_Shipment_Delivery_API::instance();

    if (!$api->is_configured()) {
        $order->update_meta_data('_gomile_shipment_status', 'configuration_missing');
        $order->update_meta_data('_gomile_shipment_delivery_created', 'no');
        $order->save();
        $order->add_order_note(__('Gomile order was not created because the API is not configured yet.', 'gomile-shipment'));
        return;
    }

    $order->update_meta_data('_gomile_shipment_status', 'creating');
    $order->delete_meta_data('_gomile_shipment_last_error');
    $order->save();

    $response = gomile_shipment_create_delivery($order);

    if (is_wp_error($response)) {
        $order->update_meta_data('_gomile_shipment_status', 'api_error');
        $order->update_meta_data('_gomile_shipment_delivery_created', 'no');
        $order->update_meta_data('_gomile_shipment_last_error', $response->get_error_message());
        $order->save();

        $order->add_order_note(
            sprintf(
                __('Gomile order creation failed during %1$s: %2$s', 'gomile-shipment'),
                $trigger,
                $response->get_error_message()
            )
        );

        return;
    }

    $delivery_id = isset($response['delivery_id']) ? (string) $response['delivery_id'] : '';
    $delivery_status = isset($response['status']) ? sanitize_key($response['status']) : 'searching_driver';
    $tracking_url = isset($response['tracking_url']) ? esc_url_raw($response['tracking_url']) : '';
    $delivery_code = isset($response['delivery_code']) ? sanitize_text_field((string) $response['delivery_code']) : '';
    $delivery_fee = isset($response['delivery_fee']) ? (float) $response['delivery_fee'] : null;
    $distance_km = isset($response['distance_km']) ? (float) $response['distance_km'] : null;

    if ('' !== $delivery_id) {
        $order->update_meta_data('_gomile_shipment_delivery_id', $delivery_id);
    }

    if ('' !== $tracking_url) {
        $order->update_meta_data('_gomile_shipment_tracking_url', $tracking_url);
    }

    $order->update_meta_data('_gomile_shipment_delivery_created', 'yes');
    $order->update_meta_data('_gomile_shipment_status', $delivery_status);
    $order->save();

    $note = sprintf(
        __('Gomile order created during %1$s. API order ID: %2$s. Status: %3$s', 'gomile-shipment'),
        $trigger,
        $delivery_id !== '' ? $delivery_id : __('not returned by API', 'gomile-shipment'),
        $delivery_status
    );

    if ($delivery_code !== '') {
        $note .= ' ' . sprintf(__('Delivery code: %s', 'gomile-shipment'), $delivery_code);
    }

    if ($delivery_fee !== null) {
        $note .= ' ' . sprintf(__('Delivery fee: %s EUR', 'gomile-shipment'), wc_format_decimal($delivery_fee));
    }

    if ($distance_km !== null) {
        $note .= ' ' . sprintf(__('Distance: %s km', 'gomile-shipment'), wc_format_decimal($distance_km));
    }

    $order->add_order_note($note);
}

/**
 * @brief Vérifie si la commande utilise la méthode d'expédition Gomile.
 *
 * @param $order Commande WooCommerce.
 * @return bool
 */
function gomile_shipment_order_uses_method($order) {
    if (!$order instanceof WC_Order) {
        return false;
    }

    foreach ($order->get_shipping_methods() as $shipping_item) {
        if ($shipping_item->get_method_id() === 'gomile_shipment') {
            return true;
        }
    }

    return false;
}

/**
 * @brief Annule la livraison Gomile quand la commande WooCommerce est annulée.
 *
 * @param $order_id Identifiant de commande WooCommerce.
 * @return void
 */
function gomile_shipment_cancel_delivery_on_order_cancelled($order_id) {
    $order = wc_get_order($order_id);

    if (!$order) {
        return;
    }

    if (!gomile_shipment_order_uses_method($order)) {
        return;
    }

    $order_reference = (string) $order->get_id();

    if ($order_reference === '') {
        return;
    }

    gomile_shipment_cancel_delivery($order_reference);
}
