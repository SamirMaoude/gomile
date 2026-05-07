<?php
/**
 * @file
 * @brief Endpoints REST exposes pour les webhooks Gomile.
 * @package GomileShipment
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * @brief Expose les points d'entree REST utilises par l'API Gomile.
 *
 * @package GomileShipment
 */
class Gomile_Shipment_REST_Endpoints {
    /**
     * @brief Branche l'enregistrement des routes REST.
     *
     * @return void
     */
    public static function init() {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
    }

    /**
     * @brief Enregistre la route de webhook.
     *
     * @return void
     */
    public static function register_routes() {
        register_rest_route(
            'gomile-shipment/v1',
            '/webhook',
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST (create/update)
                'permission_callback' => array(__CLASS__, 'check_webhook_secret'),
                'callback'            => array(__CLASS__, 'handle_webhook'),
            )
        );
    }

    /**
     * @brief Verifie la signature HMAC du webhook.
     *
     * @param $request Requête REST.
     * @return bool
     */
    public static function check_webhook_secret($request) {
        $secret = trim((string) Gomile_Shipment_Admin_Settings::get_webhook_secret());
        $provided_signature = trim((string) $request->get_header('X-Gomile-Webhook-Secret'));

        if ('' === $secret || '' === $provided_signature) {
            return false;
        }

        $expected_signature = 'sha256=' . hash_hmac('sha256', $request->get_body(), $secret);

        return hash_equals($expected_signature, $provided_signature);
    }

    /**
     * @brief Traite l'event du webhook.
     *
     * @param $request Requête REST.
     * @return WP_REST_Response
     */
    public static function handle_webhook($request) {
        $payload = $request->get_json_params();

        $event_type = isset($payload['event']) ? $payload['event'] : '';

        switch ($event_type) {
            case 'delivery.status_changed':
                return self::handle_delivery_status_changed($payload);
            
                case 'delivery.status_completed':
                // Livraison terminée, on peut clôturer la commande
                return self::handle_delivery_completed($payload);
            
            default:
                // Event non géré
                return new WP_REST_Response(array('success' => false, 'message' => 'Event type not handled'), 400);
        }
    }
    
    /**
     * @brief Traite le changement de statut de livraison.
     *
     * @param $payload Données du webhook.
     * @return WP_REST_Response
     */
    protected static function handle_delivery_status_changed($payload) {
        $reference = isset($payload['orderReference']) ? (string) $payload['orderReference'] : '';

        $order = wc_get_order($reference);

        if (!$order) {
            return new WP_REST_Response(array('success' => false, 'message' => 'WooCommerce order not found'), 404);
        }

        $new_status = $payload['status'] ?? null;

        if (!$new_status) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Missing delivery status'), 400);
        }

        $order->update_meta_data('_gomile_shipment_status', sanitize_key($new_status));
        $order->update_meta_data('_gomile_shipment_last_status_update', current_time('Y-m-d H:i:s'));
        $order->save();
        $order->add_order_note(
            sprintf(
                __('Gomile delivery status updated by webhook: %s', 'gomile-shipment'),
                sanitize_text_field((string) $new_status)
            )
        );

        return new WP_REST_Response(array('success' => true), 200);
    }

    protected static function handle_delivery_completed($payload) {

        $status_response = self::handle_delivery_status_changed($payload); // Met à jour le statut de livraison gomile

        if ($status_response->get_status() >= 400) {
            return $status_response;
        }

        $reference = isset($payload['orderReference']) ? (string) $payload['orderReference'] : '';

        $order = wc_get_order($reference);

        if (!$order) {
            return new WP_REST_Response(array('success' => false, 'message' => 'WooCommerce order not found'), 404);
        }

        // Marquer la commande comme terminée au niveau de WooCommerce
        if ($order->get_status() !== 'completed') {
            $order->update_status('completed', __('Order marked as completed by Gomile webhook', 'gomile-shipment'));
        }

        return new WP_REST_Response(array('success' => true), 200);
    }
}
