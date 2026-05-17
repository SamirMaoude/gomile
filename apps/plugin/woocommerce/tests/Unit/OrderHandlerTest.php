<?php

namespace GomileShipment\Tests\Unit;

use GomileShipment\Tests\Support\FakeOrder;
use GomileShipment\Tests\Support\FakeShippingItem;
use GomileShipment\Tests\TestCase;

final class OrderHandlerTest extends TestCase {
    public function test_order_uses_method_when_gomile_shipping_method_is_present(): void {
        $order = new FakeOrder(array(
            'shipping_methods' => array(
                new FakeShippingItem('flat_rate'),
                new FakeShippingItem('gomile_shipment'),
            ),
        ));

        self::assertTrue(\gomile_shipment_order_uses_method($order));
    }

    public function test_order_does_not_use_method_without_gomile_shipping_method(): void {
        $order = new FakeOrder(array(
            'shipping_methods' => array(
                new FakeShippingItem('flat_rate'),
            ),
        ));

        self::assertFalse(\gomile_shipment_order_uses_method($order));
    }
}
