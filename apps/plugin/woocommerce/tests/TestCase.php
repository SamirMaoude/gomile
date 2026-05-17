<?php

namespace GomileShipment\Tests;

use GomileShipment\Tests\Support\WordPressState;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

abstract class TestCase extends PHPUnitTestCase {
    protected function setUp(): void {
        parent::setUp();

        WordPressState::reset();
    }

    protected function setPluginOptions(array $options): void {
        WordPressState::$options[\Gomile_Shipment_Admin_Settings::OPTION_NAME] = $options;
    }
}
