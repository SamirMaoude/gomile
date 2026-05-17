<?php

define('ABSPATH', dirname(__DIR__) . '/');
define('GOMILE_SHIPMENT_PLUGIN_FILE', dirname(__DIR__) . '/gomile-shipment.php');
define('GOMILE_SHIPMENT_PLUGIN_DIR', dirname(__DIR__) . '/');

$autoload = dirname(__DIR__) . '/vendor/autoload.php';

if (file_exists($autoload)) {
    require_once $autoload;
}

require_once __DIR__ . '/Support/WordPressStubs.php';
require_once __DIR__ . '/../includes/class-admin-settings.php';
require_once __DIR__ . '/../includes/class-delivery-api.php';
require_once __DIR__ . '/../includes/class-rest-endpoints.php';
require_once __DIR__ . '/../includes/class-order-handler.php';

if (class_exists(\PHPUnit\Framework\TestCase::class)) {
    require_once __DIR__ . '/TestCase.php';
}
