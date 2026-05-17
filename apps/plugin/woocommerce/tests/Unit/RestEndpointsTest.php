<?php

namespace GomileShipment\Tests\Unit;

use GomileShipment\Tests\Support\FakeOrder;
use GomileShipment\Tests\Support\FakeRestRequest;
use GomileShipment\Tests\Support\WordPressState;
use GomileShipment\Tests\TestCase;

final class RestEndpointsTest extends TestCase {
    public function test_check_webhook_secret_accepts_valid_hmac_signature(): void {
        $this->setPluginOptions(array('webhook_secret' => 'top-secret'));
        $body = '{"event":"delivery.status_changed","orderReference":"123"}';
        $signature = 'sha256=' . hash_hmac('sha256', $body, 'top-secret');

        $request = new FakeRestRequest(array(), $body, array(
            'X-Gomile-Webhook-Secret' => $signature,
        ));

        self::assertTrue(\Gomile_Shipment_REST_Endpoints::check_webhook_secret($request));
    }

    public function test_check_webhook_secret_rejects_invalid_signature(): void {
        $this->setPluginOptions(array('webhook_secret' => 'top-secret'));

        $request = new FakeRestRequest(array(), '{}', array(
            'X-Gomile-Webhook-Secret' => 'sha256=invalid',
        ));

        self::assertFalse(\Gomile_Shipment_REST_Endpoints::check_webhook_secret($request));
    }

    public function test_status_changed_webhook_updates_order_metadata(): void {
        $order = new FakeOrder(array('id' => 123));
        WordPressState::$orders['123'] = $order;

        $response = \Gomile_Shipment_REST_Endpoints::handle_webhook(new FakeRestRequest(array(
            'event' => 'delivery.status_changed',
            'orderReference' => '123',
            'status' => 'driver_assigned',
        )));

        self::assertSame(200, $response->get_status());
        self::assertSame('driver_assigned', $order->meta['_gomile_shipment_status']);
        self::assertArrayHasKey('_gomile_shipment_last_status_update', $order->meta);
        self::assertNotEmpty($order->notes);
    }

    public function test_completed_webhook_marks_woocommerce_order_completed(): void {
        $order = new FakeOrder(array('id' => 123, 'status' => 'processing'));
        WordPressState::$orders['123'] = $order;

        $response = \Gomile_Shipment_REST_Endpoints::handle_webhook(new FakeRestRequest(array(
            'event' => 'delivery.status_completed',
            'orderReference' => '123',
            'status' => 'completed',
        )));

        self::assertSame(200, $response->get_status());
        self::assertSame('completed', $order->get_status());
        self::assertSame('completed', $order->meta['_gomile_shipment_status']);
    }
}
