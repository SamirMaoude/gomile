<?php

namespace GomileShipment\Tests\Unit;

use GomileShipment\Tests\Support\FakeOrder;
use GomileShipment\Tests\Support\FakeOrderItem;
use GomileShipment\Tests\Support\FakeProduct;
use GomileShipment\Tests\Support\WordPressState;
use GomileShipment\Tests\TestCase;

final class DeliveryApiTest extends TestCase {
    public function test_build_delivery_payload_maps_woocommerce_order_to_plugin_order_contract(): void {
        $api = new \Gomile_Shipment_Delivery_API();
        $order = new FakeOrder(array(
            'id' => 456,
            'billing_phone' => '0611223344',
            'shipping_first_name' => 'Marie',
            'shipping_last_name' => 'Martin',
            'shipping_address' => array(
                'address_1' => '12 rue Exemple',
                'address_2' => 'Etage 2',
                'postcode' => '38000',
                'city' => 'Grenoble',
                'state' => '',
                'country' => 'FR',
            ),
            'items' => array(
                new FakeOrderItem(new FakeProduct('2.5'), 2),
            ),
        ));

        $payload = $api->build_delivery_payload($order);

        self::assertSame(array(
            'customerName' => 'Marie Martin',
            'customerPhone' => '0611223344',
            'dropOffAddress' => '12 rue Exemple, Etage 2, 38000, Grenoble, FR',
            'type' => 'OTHER',
            'weight' => 5.0,
            'orderReference' => '456',
        ), $payload);
    }

    public function test_build_delivery_payload_requires_customer_phone(): void {
        $api = new \Gomile_Shipment_Delivery_API();
        $order = new FakeOrder(array('billing_phone' => ''));

        $payload = $api->build_delivery_payload($order);

        self::assertInstanceOf(\WP_Error::class, $payload);
        self::assertSame('gomile_missing_customer_phone', $payload->get_error_code());
    }

    public function test_build_quote_payload_uses_configured_pickup_and_package_destination(): void {
        $this->setPluginOptions(array(
            'sender_address_street_number' => '12',
            'sender_address_street_name' => 'Rue Exemple',
            'sender_address_postal_code' => '38000',
            'sender_address_city' => 'Grenoble',
            'sender_address_country' => 'France',
        ));

        $api = new \Gomile_Shipment_Delivery_API();
        $payload = $api->build_quote_payload(array(
            'destination' => array(
                'address' => '5 rue Client',
                'postcode' => '38100',
                'city' => 'Grenoble',
                'country' => 'FR',
            ),
            'contents' => array(),
        ));

        self::assertSame('12, Rue Exemple, 38000, Grenoble, France', $payload['body']['pickupAddress']['fullAddress']);
        self::assertSame('5 rue Client, 38100, Grenoble, FR', $payload['body']['dropoffAddress']['fullAddress']);
        self::assertSame(1.0, $payload['body']['weightKg']);
    }

    public function test_cancel_delivery_returns_api_response_and_sends_order_reference_query(): void {
        $this->setPluginOptions(array(
            'api_base_url' => 'http://gomile.test',
            'api_key' => 'secret-key',
            'debug_mode' => 'no',
        ));

        $capturedUrl = null;
        $capturedArgs = null;
        WordPressState::$remoteRequestHandler = function ($url, $args) use (&$capturedUrl, &$capturedArgs) {
            $capturedUrl = $url;
            $capturedArgs = $args;

            return array(
                'response' => array('code' => 200),
                'body' => '{"cancelled":true}',
            );
        };

        $api = new \Gomile_Shipment_Delivery_API();
        $response = $api->cancel_delivery('456');

        self::assertIsArray($response);
        self::assertSame(array('cancelled' => true), $response['body']);
        self::assertSame('http://gomile.test/plugin/orders/cancel?orderReference=456', $capturedUrl);
        self::assertSame('POST', $capturedArgs['method']);
        self::assertSame('secret-key', $capturedArgs['headers']['x-api-key']);
    }
}
