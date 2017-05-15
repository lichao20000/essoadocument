<?php
define('SYSPATH', AOPROOT . '/system');
define('APPPATH', DOCROOT . '/apps');
define('TMPPATH', DOCROOT . '/files');
define('TPLPATH', DOCROOT . '/templates');
define('REQUEST_TIME', $_SERVER['REQUEST_TIME']);

define('AOP_NOT_FOUND', 0);

final class AopCore
{
  private static $_uri;
  private static $_paths;
  private static $_router = array(
    'controller' => 'default',
    'action'     => 'index',
    'arguments'  => array(),
  );
  private static $_instances = array();
  public static $routed = false;

  public static function loadLibrary($library)
  {
    static $loaded = array();
    $filename = LIBPATH . '/' . strtolower(trim($library, '/')) . '.php';
    if (!in_array($filename, $loaded) && is_file($filename)) {
      require $filename;
      $loaded[] = $filename;
    }
  }

  public static function init()
  {
    $basePath = &$GLOBALS['basePath'];

    self::loadLibrary('common');
    timer();
    ob_start();
    AopConfig::load();
    self::loadLibrary(AopConfig::get('cache.type', 'cache.file'));
    date_default_timezone_set(AopConfig::get('timezone', 'Asia/Shanghai'));

    if ($path = trim(dirname($_SERVER['SCRIPT_NAME']), '\\/')) {
      $basePath = '/' . $path . '/';
    } else {
      $basePath = '/';
    }
    unset($path);

    self::loadLibrary(AopConfig::get('session.type', 'session.standard'));
    session_name(AopConfig::get('session.name', 'sid'));
    //session_set_cookie_params(0, $basePath);
    session::start();

    $uri = isset($_GET['q']) ? $_GET['q'] : AopConfig::get('frontpage', '');
    $uri = trim(preg_replace('/\/{2,}/', '/', $uri), '/');
    self::$_uri = $uri;
  }

  public static function initDevice()
  {
    if (isset($_SERVER['HTTP_USER_AGENT'])) {
      $userAgent = $_SERVER['HTTP_USER_AGENT'];
      $deviceName = null;
      if (strpos($userAgent, 'iPhone')) {
        $deviceName = 'iphone';
      } else if (strpos($userAgent, 'iPad')) {
        $deviceName = 'ipad';
      } else if (strpos($userAgent, 'Android')) {
        $deviceName = 'android';
      }
      if (isset($deviceName)) {
        define('DEVICENAME', $deviceName);
        $templateName = AopConfig::get('template.' . $deviceName);
        if (isset($templateName)) {
          AopConfig::set('template', $templateName);
        }
      }
    }
  }

  public static function run()
  {
    $controller = &self::$_router['controller'];
    $action = &self::$_router['action'];
    $arguments = &self::$_router['arguments'];
    $isApp = false;

    $uri = self::$_uri;
    self::$_paths = $paths = ($uri == '') ? array() : explode('/', $uri);

    if (AopConfig::get('router.static', false)) {
      self::$routed = self::staticRouter($uri);
    }

    if (isset($paths[0])) {
      $controller = strtolower($paths[0]);
    }
    $controllerFile = SYSPATH . '/controllers/' . $controller . '.php';
    if (!is_file($controllerFile) || (self::$routed && !isset($paths[0]))) {
      self::$_paths = $paths = ($uri == '') ? array() : explode('/', $uri);
      if (isset($paths[0])) {
        $controller = strtolower($paths[0]);
      }

      self::loadLibrary('app');
      AopApp::getList(AopConfig::get('debug', false));

      if (false !== ($appInfo = AopApp::getInfo($controller))) {
        $isApp = true;
        $paths[0] = $appInfo;
        if (!isset($paths[1])) {
          $paths[1] = 0;
        }
        $controller = 'app';
        $action = 'call';
        $controllerFile = SYSPATH . '/controllers/' . $controller . '.php';
      } else {
        throw new Aop404Exception('Controller file not found.');
      }
    } else {
      array_shift($paths);
    }
    require $controllerFile;
    $controllerClass = ucfirst($controller) . 'Controller';
    if (!class_exists($controllerClass, false) || !is_subclass_of($controllerClass, 'AopController')) {
      throw new Aop404Exception('Controller class not found.');
    }
    if (!$isApp && isset($paths[0])) {
      $action = strtolower(array_shift($paths));
    }
    if ($action[0] == '_') {
      throw new Aop404Exception('Action is invalid.');
    }
    $actionMethod = $action . (ENV == 'WEB' ? 'Action' : ENV);
    if (!method_exists($controllerClass, $actionMethod)) {
      throw new Aop404Exception('Action method not found.');
    }
    $arguments = $paths;

    $result = self::dispatch();
    self::process($result);
  }

  public static function staticRouter(&$uri)
  {
    // TODO 目前只考虑域名路由
    if (false !== ($path = AopRouter::getRouter(strtolower($_SERVER['HTTP_HOST'])))) {
      $uri = $path . (isset($uri[0]) ? '/' : '') . $uri;
      return true;
    }
    return false;
  }

  public static function dispatch($router = null)
  {
    if (!isset($router)) {
      $router = self::$_router;
    }
    $controllerClass = ucfirst($router['controller']) . 'Controller';
    if (!class_exists($controllerClass, false)) {
      $controllerFile = SYSPATH . '/controllers/' . $router['controller'] . '.php';
      if (!is_file($controllerFile)) {
        throw new Aop404Exception('Controller file not found.');
      }
      require $controllerFile;
      if (!class_exists($controllerClass, false) || !is_subclass_of($controllerClass, 'AopController')) {
        throw new Aop404Exception('Controller class not found.');
      }
    }
    if (!isset(self::$_instances[$controllerClass])) {
      self::$_instances[$controllerClass] = new $controllerClass();
    }
    $controllerInstance = self::$_instances[$controllerClass];
    $actionMethod = $router['action'] . (ENV == 'WEB' ? 'Action' : ENV);
    if (!method_exists($controllerClass, $actionMethod)) {
      throw new Aop404Exception('Action method not found.');
    }
    return call_user_func_array(array($controllerInstance, $actionMethod), $router['arguments']);
  }

  public static function errorDispatch(Exception $e)
  {
    ob_clean();
    if (ENV == 'WEB') {
      try {
        $result = AopCore::dispatch(array(
          'controller' => 'error',
          'action' => 'error',
          'arguments' => array('exception'=>$e),
        ));
        self::process($result);
      } catch (Exception $ignoreEx) {
        die($e->getMessage());
      }
    } else {
      die($e->getMessage() . PHP_EOL);
    }
  }

  private static function process($result)
  {
    if (isset($result)) {
      if (is_string($result)) {
        self::layoutRender($result);
      } else if (is_array($result) && isset($result['html'])) {
        if (isset($result['template'])) {
          AopConfig::set('template', $result['template']);
        }
        self::layoutRender($result['html']);
      } else if ($result === AOP_NOT_FOUND) {
        throw new Aop404Exception('Page not found.');
      }
    }
    echo ob_get_clean();
  }

  public static function layoutRender($content)
  {
    $view = new AopView();
    echo $view->render('page.phtml', array(
      'content' => $content,
    ));
  }

  public static function getUri()
  {
    return self::$_uri;
  }

  public static function getRouter()
  {
    return self::$_router;
  }
}

abstract class AopController
{
  public function __construct()
  {
    $this->init();
  }

  protected function init()
  {
  }

  /**
   * @return AopView
   */
  protected function getView()
  {
    static $view = null;
    if (!isset($view)) {
      $view = new AopView();
      $this->_initTemplateName();
    }
    return $view;
  }

  private function _initTemplateName()
  {
    global $user;
    if (isLogin()){
      if(!isset($user->defaulttheme)){
        AopCore::loadLibrary('app');
        $systemInfo = AopApp::getInfo('system');
        $instance = AopApp::getInstance($systemInfo);
        $user->defaulttheme = $instance->invokePublic('setting', 'getDefaultTheme');
      }
      if(strlen($user->defaulttheme) > 0) {
        AopConfig::set('template', $user->defaulttheme);
      }
    }
  }

  public function isPost()
  {
    return $_SERVER['REQUEST_METHOD'] == 'POST';
  }
}

final class AopView
{
  private $_data = array();

  protected function plain($text)
  {
    return htmlspecialchars($text, ENT_QUOTES);
  }

  public function render($templateFile, $variables = null)
  {
    $templateName = AopConfig::get('template', 'default');
    $path = TPLPATH . '/' . $templateName . '/' . $templateFile;
    if (is_file($path)) {
      if ($staticHost = AopConfig::get('template.static.host')) {
        $this->assign('tplPath', $staticHost . 'templates/' . $templateName);
      } else {
        $this->assign('tplPath', $GLOBALS['basePath'] . 'templates/' . $templateName);
      }
      if (isset($variables) && is_array($variables)) {
        $this->assign($variables);
      }

      extract($this->_data, EXTR_OVERWRITE);
      ob_start();
      include $path;
      return ob_get_clean();
    } else {
      throw new AopException('View file "' . $templateFile . '" not found.');
    }
  }

  public function assign($key, $value = null)
  {
    if (is_array($key)) {
      foreach ($key as $k => $value) {
        $this->_data[$k] = $value;
      }
    } else {
      $this->_data[$key] = $value;
    }
    return $this;
  }
}

final class AopConfig
{
  private static $_config;

  public static function load()
  {
    if (!isset(self::$_config)) {
      if (is_file(DOCROOT . '/config.php') && (require DOCROOT . '/config.php') && isset($config)) {
        self::$_config = $config;
        unset($config);
      } else {
        self::$_config = array();
      }
    }
    return self::$_config;
  }

  public static function get($key = null, $default = null)
  {
    if (isset($key)) {
      return key_exists($key, self::$_config) ? self::$_config[$key] : $default;
    } else {
      return self::$_config;
    }
  }

  public static function set($key, $value)
  {
    self::$_config[$key] = $value;
  }
}

final class AopRouter
{
  public static function getRouters($reset = false)
  {
    static $routers = null;
    if (!isset($routers) || $reset) {
      $cacheId = 'routerslist';
      if ($reset || !$cache = cache::get($cacheId)) {
        AopCore::loadLibrary('app');
        // get router list
        if ($appDomain = AopApp::getInstance(AopApp::getInfo('domain'))) {
          $routers = $appDomain->getRouters();
        } else {
          $routers = array();
        }

        cache::set($cacheId, $routers, 604800);  // 7 days
      } else {
        $routers = $cache->data;
      }
    }
    return $routers;
  }

  public static function getRouter($router)
  {
    $routers = self::getRouters();
    return isset($routers[$router]) ? $routers[$router] : false;
  }
}

class AopException extends Exception
{
  const E_NOTICE = 1;
  const E_WARNING = 2;
  const E_ERROR = 4;

  private $_level;
  private $_context = null;

  public function __construct($message, $level = self::E_WARNING, $code = 0, $context = null)
  {
    parent::__construct($message, $code);
    $this->_level = $level;
    $this->_context = $context;
  }

  public function process()
  {
    try {
      // 只有 E_ERROR 才写入日志服务
      if ($this->_level >= self::E_ERROR) {
        AopCore::loadLibrary('app');
        $appInfo = AopApp::getInfo('system');
        $system = AopApp::getInstance($appInfo);
        $system->writeLog($this);
      }
    } catch (Exception $e) {
      // TODO 有异常写入本地日志
    }
  }

  public function getLevel()
  {
    return $this->_level;
  }

  public function getContext()
  {
    return $this->_context;
  }
}

final class Aop503Exception extends AopException
{
  public function __construct($message, $level = self::E_WARNING, $code = 0, $context = null)
  {
    parent::__construct($message, $level, $code, $context);
    if (ENV == 'WEB') {
  		header('HTTP/1.1 503 Service Unavailable');
  	}
  }
}

final class Aop403Exception extends AopException
{
  public function __construct($message = '')
  {
    parent::__construct($message, parent::E_WARNING, 403);
    if (ENV == 'WEB') {
      header('HTTP/1.1 403 Forbidden');
    }
  }
}

final class Aop404Exception extends AopException
{
  private $_uri;
  private $_router;

  public function __construct($message = '')
  {
    parent::__construct($message, parent::E_WARNING, 404);
    $this->_uri = AopCore::getUri();
    $this->_router = AopCore::getRouter();
    /* echo ENV;exit; */
    if (ENV == 'WEB') {
      header('HTTP/1.1 404 Not Found');
    }
  }

  public function getUri()
  {
    return $this->_uri;
  }

  public function getRouter()
  {
    return $this->_router;
  }
}
