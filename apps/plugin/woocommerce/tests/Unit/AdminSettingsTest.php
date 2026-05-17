<?php

namespace GomileShipment\Tests\Unit;

use GomileShipment\Tests\TestCase;

final class AdminSettingsTest extends TestCase {
    public function test_get_settings_keeps_configured_api_base_url(): void {
        $this->setPluginOptions(array(
            'api_base_url' => 'http://localhost:3000',
            'api_key' => 'store-api-key',
        ));

        $settings = \Gomile_Shipment_Admin_Settings::get_settings();

        self::assertSame('http://localhost:3000', $settings['api_base_url']);
        self::assertSame('store-api-key', $settings['api_key']);
    }

    public function test_sanitize_settings_keeps_existing_secrets_when_submitted_empty(): void {
        $this->setPluginOptions(array(
            'api_base_url' => 'http://localhost:3000',
            'api_key' => 'existing-api-key',
            'webhook_secret' => 'existing-webhook-secret',
        ));

        $settings = \Gomile_Shipment_Admin_Settings::sanitize_settings(array(
            'api_key' => '',
            'webhook_secret' => '',
            'sender_phone' => ' 0612345678 ',
        ));

        self::assertSame('http://localhost:3000', $settings['api_base_url']);
        self::assertSame('existing-api-key', $settings['api_key']);
        self::assertSame('existing-webhook-secret', $settings['webhook_secret']);
        self::assertSame('0612345678', $settings['sender_phone']);
    }

    public function test_sanitize_endpoint_template_keeps_relative_endpoint_absolute_to_api_root(): void {
        self::assertSame(
            '/plugin/orders/cancel',
            \Gomile_Shipment_Admin_Settings::sanitize_endpoint_template('plugin/orders/cancel')
        );
    }
}
