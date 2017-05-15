<?php
define('DOCROOT', strtr(dirname(__FILE__), '\\', '/'));
define('AOPROOT', dirname(DOCROOT));
define('LIBPATH', AOPROOT . '/libraries');
define('LOGPATH', AOPROOT . '/logs');
define('ENV', 'WEB');

require LIBPATH . '/core.php';
try {
  AopCore::init();
  AopCore::initDevice();
  AopCore::run();
} catch (Exception $e) {
  if ($e instanceof AopException) {
    $e->process();
  }
  AopCore::errorDispatch($e);
}
