<?php
define('URL_CALLBACK_LAYOUT', 'callback_layout');

final class AopApp
{
  const SUFFIX_INFO = 'info';
  const SUFFIX_PHP = 'ps';
  const SUFFIX_CONSOLE = 'console.ps';
  const SUFFIX_PROXY = 'proxy.ps';
  const SUFFIX_TPL = 'phtml';

  const DISPLAY_HTML = 'html';
  const DISPLAY_FRAME = 'frame';
  const DISPLAY_AJAX = 'ajax';
  const DISPLAY_HIDDEN = 'hidden';

  const DEFAULT_VIEW_ENGINE = 'php';

  const TARGET_SELF = 'self';
  const TARGET_NEW = 'new';

  public static function getPath($appId = null)
  {
    if (isset($appId)) {
      return APPPATH . '/' . strtolower($appId);
    } else {
      return APPPATH;
    }
  }

  public static function getList($reset = false, $path = null)
  {
    static $apps = null;
    if (!isset($apps) || $reset) {
      $cacheId = 'appslist';
      if ($reset || !($cache = cache::get($cacheId))) {
        if (!isset($path) || !is_dir($path)) {
          $path = self::getPath();
        }
        $apps = array();
        if (is_dir($path) && $dh = opendir($path)) {
          while (false !== ($file = readdir($dh))) {
            if ($file[0] == '.' || !is_dir($path . '/' . $file)) {
              continue;
            }
            $file = strtolower($file);
            $filePrefix = $path . '/' . $file . '/' . $file . '.';
            if (!is_file($filePrefix . self::SUFFIX_INFO)) {
              continue;
            }
            $appInfo = parse_ini_file($filePrefix . self::SUFFIX_INFO);
            if (!isset($appInfo['appid'])) {
              continue;
            }
            // TODO 获取 token 写入 $appInfo['apptoken']
            $isApp = is_file($filePrefix . self::SUFFIX_PHP);
            $isConsole = is_file($filePrefix . self::SUFFIX_CONSOLE);
            if (!$isApp && !$isConsole) {
              continue;
            }
            if ($isApp) {
              $appClassname = 'App' . ucfirst(strtolower($file));
              require_once $filePrefix . self::SUFFIX_PHP;
              $parentClassname = get_parent_class($appClassname);
              if (!class_exists($appClassname) || !in_array($parentClassname, array(
                'AppAbstract',
                'AppGroupAbstract',
                'AppPackageAbstract',
                'AppGroupPackageAbstract',
              ))) {
                continue;
              }
              $appInfo['is_group'] = in_array($parentClassname, array('AppGroupAbstract', 'AppGroupPackageAbstract'));
              $appInfo['is_package'] = in_array($parentClassname, array('AppPackageAbstract', 'AppGroupPackageAbstract'));
              // 是否独立应用, 非独立应用必须可被群组应用包含
              $appInfo['is_single'] = isset($appInfo['is_single']) ? (boolean) $appInfo['is_single'] : true;
              // 是否可为子应用, 子应用可被群组应用包含
              $appInfo['is_child'] = isset($appInfo['is_child']) ? (boolean) $appInfo['is_child'] : false;
              // 是否单实例应用, 单实例应用不能被订购多次
              $appInfo['is_singleton'] = isset($appInfo['is_singleton']) ? (boolean) $appInfo['is_singleton'] : true;
              // 是否公共应用
              $appInfo['is_public'] = isset($appInfo['is_public']) ? (boolean) $appInfo['is_public'] : false;
              // 是否多产品应用
              $appInfo['is_multi_product'] = isset($appInfo['is_multi_product']) ? (boolean) $appInfo['is_multi_product'] : false;
              //是否自动开通；1：需要审核，即需要在后台开通；0：不需要审核，即自动开通
              $appInfo['is_check'] = isset($appInfo['is_check']) ? (boolean) $appInfo['is_check'] : true;
            }
            if ($isConsole) {
              $consoleClassname = 'AppConsole' . ucfirst(strtolower($file));
              require_once $filePrefix . self::SUFFIX_CONSOLE;
              if (!class_exists($consoleClassname) || get_parent_class($consoleClassname) != 'AppConsoleAbstract') {
                continue;
              }
            }
            $info = array();
            $info['id'] = $file;
            $info['productid'] = $file;
            $appInfo += array(
              'name' => 'App #' . $appInfo['appid'],
              'description' => '',
              'version' => '1.0',
              'display' => self::DISPLAY_HTML,
              'target' => self::TARGET_SELF,
              'template_engine' => self::DEFAULT_VIEW_ENGINE,
            );
            if (!in_array($appInfo['display'], array(
                self::DISPLAY_AJAX,
                self::DISPLAY_FRAME,
                self::DISPLAY_HIDDEN,
              ))) {
              $appInfo['display'] = self::DISPLAY_HTML;
            }
            if (!in_array($appInfo['target'], array(
                self::TARGET_NEW
              ))) {
              $appInfo['target'] = self::TARGET_SELF;
            }
            if (!isset($appInfo['tag'])) {
              $appInfo['tag'] = array();
            } else if (!is_array($appInfo['tag'])) {
              $appInfo['tag'] = array($appInfo['tag']);
            }
            if (isset($appInfo['icon'])) {
              $appInfo['icon'] = url('apps/' . $file . '/' .$appInfo['icon']);
            }
            $info += $appInfo;

            $info['app_classname'] = $isApp ? $appClassname : null;
            $info['console_classname'] = $isConsole ? $consoleClassname : null;
            $info['is_app'] = $isApp;
            $info['is_console'] = $isConsole;
            $apps[$file] = $info;
          }
          closedir($dh);
        }
        if ($path == self::getPath()) {
          cache::set($cacheId, $apps);
        }
      } else {
        $apps = $cache->data;
      }

      if ($reset) {
        // 同时更新 Hook 和 Proxy 列表
        self::getHookList($reset);
        self::getProxyList($reset);
      }
    }
    return $apps;
  }

  public static function getInfo($appId)
  {
    $list = self::getList();
    $appInfo = array();
    $part = explode('-', $appId, 2);
    if (isset($part[1])) {
      $appInfo['productid'] = $appId;
      $appId = $part[0];
      $multiProduct = true;
    } else {
      $multiProduct = false;
    }
    if (!isset($list[$appId])) {
      return false;
    }
    $appInfo += $list[$appId];
    if ($multiProduct && !$appInfo['is_multi_product']) {
      return false;
    }
    $appInfo['instance_id'] = 0;
    return $appInfo;
  }

  /**
   * @return AppAbstract
   */
  public static function getInstance($appInfo)
  {
    static $list = array();
    if(!is_array($appInfo) || !isset($appInfo['is_app']) || !$appInfo['is_app']) {
      return false;
    }
    $classKey = $appInfo['id'] . '_' . $appInfo['productid'];
    $classname = $appInfo['app_classname'];
    $key = isset($appInfo['instance_id']) ? $appInfo['instance_id'] : 0;
    if (!isset($list[$classKey])) {
      $list[$classKey] = array();
    }
    if (!class_exists($classname, false)) {
      self::loadFile($appInfo['id'], self::SUFFIX_PHP);
    }
    if (!isset($list[$classKey][$key])) {
      $list[$classKey][$key] = new $classname($appInfo);
    }
    return $list[$classKey][$key];
  }

  /**
   * @return AppConsoleAbstract
   */
  public static function getConsoleInstance($appInfo)
  {
    static $list = array();
    if(!isset($appInfo['is_console']) || !$appInfo['is_console']) {
      return false;
    }
    $classname = $appInfo['console_classname'];
    if (!isset($list[$classname])) {
      if (!class_exists($classname, false)) {
        self::loadFile($appInfo['id'], self::SUFFIX_CONSOLE);
      }
      $list[$classname] = new $classname($appInfo);
    }
    return $list[$classname];
  }

  public static function appExists($appId)
  {
    $appInfo = self::getInfo($appId);
    return $appInfo['is_app'];
  }

  private static function loadFile($appId, $suffix)
  {
    require self::getPath($appId) . '/' . $appId . '.' . $suffix;
  }

  public static function getProductList($reset = false)
  {
    $cacheId = 'productslist';
    if ($reset || !$cache = cache::get($cacheId)) {
      $systemInfo = AopApp::getInfo('system');
      $systemInstance = AopApp::getInstance($systemInfo);
      $order = $systemInstance->getProxyInstance('order');
      $temp = $order->getProductList();
      $productList = array();
      foreach ($temp as $k => $v) {
        $id = AopApp::getIdFromAppId($k);
        $v['appId'] = $id;
        $v['newAppId'] = $k;//info文件中的appid
        $productList[$id] = $v;
      }
      cache::set($cacheId, $productList);
    } else {
      $productList = $cache->data;
    }
    return $productList;
  }

  public static function getUserProductList($tagsList)
  {
    global $user;
    if (!isLogin()) {
      return array();
    }
    $myList = isset($user->apps) ? $user->apps : array();
    $appList = AopApp::getList();
    $reset = AopConfig::get('debug', false);
    $productList = self::getProductList($reset);
    $cacheId = 'appslist_' . $user->id;
    if ($reset || !$cache = cache::get($cacheId)) {
      $tags = array();
      foreach ($appList as $appId => $appInfo) {
        foreach ($appInfo['tag'] as $tag) {
          if (!isset($tags[$tag])) {
            $tags[$tag] = array();
          }
          if ($appInfo['display'] == AopApp::DISPLAY_HIDDEN || (!$appInfo['is_public'] && !isset($myList[$appId]))) {
            continue;
          }

          $tags[$tag][$appId] = array(
            'name' => isset($productList[$appId]) ? $productList[$appId]['productName'] : $appInfo['name'],
            'icon' => isset($appInfo['icon']) ? $appInfo['icon'] : '',
            'target' => isset($appInfo['target']) ? $appInfo['target'] : '',
          );
        }
        if ($appInfo['is_multi_product'] && $appInfo['display'] != AopApp::DISPLAY_HIDDEN) {
          // 多产品应用特殊处理
          if ($appInfo['is_public']) {
            // 全局应用
            // 实例化应用，调用身份验证钩子
            $appInstance = self::getInstance($appInfo);
            $checkProductAccess = method_exists($appInstance, 'hook_productAccess');
            foreach ($productList as $id => $app) {
              if (false === strpos($id, '-') || strstr($id, '-', true) != $appId || !isset($app['tag'])) {
                continue;
              }
              // 调用钩子来确认是否有权限显示在应用列表
              if ($checkProductAccess && !$appInstance->hook_productAccess($app)) {
                continue;
              }

              if (!is_array($app['tag'])) {
                $app['tag'] = array($app['tag']);
              }
              foreach ($app['tag'] as $tag) {
                if (!isset($tags[$tag])) {
                  $tags[$tag] = array();
                }
                $tags[$tag][$app['appId']] = array(
                  'name' => $app['productName'],
                  'icon' => $app['icon'],
                  'target' => isset($appInfo['target']) ? $appInfo['target'] : '',
                );
              }
            }
          } else {
            // 订购应用
            foreach ($myList as $id => $app) {
              if (!isset($productList[$id]) || false === strpos($id, '-') || strstr($id, '-', true) != $appId || !isset($productList[$id]['tag'])) {
                continue;
              }
              $app = $productList[$id];
              if (!is_array($app['tag'])) {
                $app['tag'] = array($app['tag']);
              }
              foreach ($app['tag'] as $tag) {
                if (!isset($tags[$tag])) {
                  $tags[$tag] = array();
                }
                $tags[$tag][$app['appId']] = array(
                  'name' => $app['productName'],
                  'icon' => $app['icon'],
                  'target' => isset($appInfo['target']) ? $appInfo['target'] : '',
                );
              }
            }
          }
        }
      }
      $list = array();
      foreach ($tagsList as $key => $tag) {
        if (isset($tags[$tag])) {
          $list[$key] = $tags[$tag];
        } else {
          $list[$key] = array();
        }
      }
      $result = array();
      foreach ($list as $tag => $tagged) {
        $result[$tag] = array();
        foreach ($tagged as $appId => $value) {
          if (isset($myList[$appId]) && isset($myList[$appId]['instance_id'])) {
            foreach ($myList[$appId]['instance_id'] as $instanceId => $instanceName) {
              $result[$tag][] = array(
                'id' => $appId,
                'name' => isset($instanceName['title']) ? $instanceName['title'] : $value['name'],
                'icon' => $value['icon'],
                'url' => url($appId . '/' . $instanceId),
                'target' => $value['target'],
              );
            }
          } else {
            // is_public
            $result[$tag][] = array(
              'id' => $appId,
              'name' => $value['name'],
              'icon' => $value['icon'],
              'url' => url($appId),
              'target' => $value['target'],
            );
          }
        }
      }
      global $user;
      $casList = isset($user->cas) ? (array)$user->cas : array();
      $temp = array();
      foreach($casList as $k => $v){
        foreach ($result as $tagged){
          foreach ($tagged as $value){
            if ($value['id'] == $k){
              $temp[] = $value;
              break;
            }
          }
        }
      }

      array_unshift($result,  $temp);
      cache::set($cacheId, $result);
    } else {
      $result = $cache->data;
    }
    return $result;
  }

  public static function getHookList($reset = false)
  {
    static $hooks = null;
    if (!isset($hooks) || $reset) {
      $cacheId = 'hookslist';
      if ($reset || !($cache = cache::get($cacheId))) {
        $hooks = array();
        $apps = self::getList();
        foreach ($apps as $appId => $appInfo) {
          if (!$appInfo['is_app']) {
            continue;
          }
          $appInstance = self::getInstance($appInfo);
          $appHooks = $appInstance->hooks();
          if (!is_array($appHooks) || !$appHooks) {
            continue;
          }

          foreach ($appHooks as $method => $hookInfo) {
            if (is_string($hookInfo)) {
              $hookInfo = array(
                'callback' => $hookInfo,
              );
            }
            if (!isset($hooks[$method])) {
              $hooks[$method] = array();
            }
            $hooks[$method][$appId] = $hookInfo;
          }
        }
        cache::set($cacheId, $hooks);
      } else {
        $hooks = $cache->data;
      }
    }
    return $hooks;
  }

  public static function getProxyList($reset = false)
  {
    static $proxies = null;
    if (!isset($proxies) || $reset) {
      $cacheId = 'proxieslist';
      if ($reset || !($cache = cache::get($cacheId))) {
        AopCore::loadLibrary('proxy');
        $proxies = array();
        // System proxies
        $path = SYSPATH . '/proxies';
        if (is_dir($path) && $dh = opendir($path)) {
          while (false !== ($file = readdir($dh))) {
            if ($file[0] != '.' && is_file($path . '/' . $file) && strlen($file) > 4 && !strcasecmp(substr($file, -4), '.php')) {
              require_once $path . '/' . $file;
              $proxyname = substr($file, 0, -4);
              $classname = 'Proxy' . ucfirst(strtolower($proxyname));
              if (class_exists($classname)) {
                if (!isset($proxies[$proxyname])) {
                  $proxies[$proxyname] = array();
                }
                $proxies[$proxyname]['-'] = array(
                  'file' => $path . '/' . $file,
                  'classname' => $classname,
                );
              }
            }
          }
          closedir($dh);
        }
        // App proxies
        $apps = self::getList();
        $proxySuffixLen = strlen(self::SUFFIX_PROXY) + 1;
        foreach ($apps as $appId => $appInfo) {
          $path = APPPATH . '/' . $appId;
          if (is_dir($path) && $dh = opendir($path)) {
            while (false !== ($file = readdir($dh))) {
              if ($file[0] != '.' && is_file($path . '/' . $file) && strlen($file) > $proxySuffixLen && !strcasecmp(substr($file, -$proxySuffixLen), '.' . self::SUFFIX_PROXY)) {
                require_once $path . '/' . $file;
                $proxyname = substr($file, 0, -$proxySuffixLen);
                $classname = 'Proxy' . ucfirst(strtolower($appId)) . ucfirst(strtolower($proxyname));
                if (class_exists($classname)) {
                  if (!isset($proxies[$proxyname])) {
                    $proxies[$proxyname] = array();
                  }
                  $proxies[$proxyname][$appId] = array(
                    'file' => $path . '/' . $file,
                    'classname' => $classname,
                  );
                }
              }
            }
            closedir($dh);
          }
        }
        cache::set($cacheId, $proxies);
      } else {
        $proxies= $cache->data;
      }
    }
    return $proxies;
  }

  public static function getIdFromAppId($appId)
  {
    $list = self::getList();
    if (strpos($appId, '-')){
      return $appId;
    }
    foreach ($list as $id => $appInfo) {
      if ($appInfo['appid'] == $appId) {
        return $id;
      }
    }
    return false;
  }
}

final class AppContext
{
  /**
   * @var AppAbstract
   */
  private $_appInstance;
  private static $_instances;

  public function __construct(AppAbstract $appInstance)
  {
    $this->_appInstance = $appInstance;
  }

  /**
   * @return AppContextUser
   */
  public function getUser()
  {
    $key = 'USER';
    if (!isset(self::$_instances[$key])) {
      self::$_instances[$key] = new AppContextUser();
    }
    return self::$_instances[$key];
  }

  /**
   * @return AppContextSession
   */
  public function getSession()
  {
    $appInfo = $this->_appInstance->getAppInfo();
    $key = 'SESSION_' . $appInfo['apptoken'];
    if (!isset(self::$_instances[$key])) {
      self::$_instances[$key] = new AppContextSession($appInfo);
    }
    return self::$_instances[$key];
  }

  /**
   * @return AppContextRequest
   */
  public function getRequest()
  {
    $key = 'REQUEST';
    if (!isset(self::$_instances[$key])) {
      self::$_instances[$key] = new AppContextRequest();
    }
    return self::$_instances[$key];
  }

  /**
   * @return AppAbstract
   */
  public function getAppInstance()
  {
    return $this->_appInstance;
  }
}

final class AppContextUser
{
  public function getId()
  {
    global $user;
    return isset($user->id) ? $user->id : U_ANONYMOUS;
  }

  public function getUid()
  {
    return $GLOBALS['user']->uid;
  }

  public function getInfo()
  {
    return (array) $GLOBALS['user'];
  }

  public function checkRole($role)
  {
    global $user;
    return isset($user->roles) && is_array($user->roles) && in_array($role, $user->roles);
  }
  
  /**wanghongchen 20140613 获取注册机构id**/
  public function getBigOrgId()
  {
  	global $user;
  	/** xiaoxiong 20140620 对SAAS机构为空做出判断 **/
  	return (isset($user->bigOrgId)&&''!=$user->bigOrgId) ? $user->bigOrgId : 0;
  }
  
}

final class AppContextSession
{
  private $_sessionKey;

  public function __construct($appInfo)
  {
    $this->_sessionKey = session_id() . $appInfo['appid'];
  }

  public function get($key, $default = null)
  {
    if ($cache = cache::get($this->_sessionKey . $key)) {
      return $cache->data;
    }
    return $default;
  }

  public function set($key, $value)
  {
    $lifetime = AopConfig::get('session.lifetime', 10800);
    cache::set($this->_sessionKey . $key, $value, $lifetime);
  }

  public function remove($key)
  {
    cache::remove($this->_sessionKey . $key);
  }

  public function destroy()
  {
    cache::clear();
  }
}

final class AppContextRequest
{
  private static $_ip = null;

  public function getGet($key = null, $default = null)
  {
    static $get = null;
    if (!isset($get)) {
      $get = $_GET;
      unset($get['q']);
      // TODO 安全校验
    }
    if (isset($key)) {
      if (isset($get[$key])) {
        return $get[$key];
      }
      return $default;
    }
    return $get;
  }

  public function getPost($key = null, $default = null)
  {
    static $post = null;
    if (!isset($post)) {
      $post = $_POST;
      // TODO 安全校验
    }
    if (isset($key)) {
      if (isset($post[$key])) {
        return $post[$key];
      }
      return $default;
    }
    return $post;
  }

  public function getIp()
  {
    if (!isset(self::$_ip)) {
      if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        self::$_ip = $_SERVER['HTTP_CLIENT_IP'];
      } else if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        self::$_ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
      } else {
        self::$_ip = $_SERVER['REMOTE_ADDR'];
      }
    }
    return self::$_ip;
  }

  public function isGet()
  {
    return $_SERVER['REQUEST_METHOD'] == 'GET';
  }

  public function isPost()
  {
    return $_SERVER['REQUEST_METHOD'] == 'POST';
  }

  public function isAjax()
  {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
      $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest';
  }
}

abstract class AppAbstract
{
  protected $appInfo;

  public function __construct($appInfo = array())
  {
    if (!isset($appInfo['instance_id'])) {
      $appInfo['instance_id'] = 0;
    }
    $this->appInfo = $appInfo;
    $this->init();
  }

  public function getAppInfo()
  {
    return $this->appInfo;
  }

  public function getInstanceByAppId($appId)
  {
    $info = AopApp::getInfo($appId);
    return AopApp::getInstance($info);
  }

  public function getAppUrl($appId, $url='', $absolute = false)
  {
    global $user;
    $apps = $user->apps;
    $info = AopApp::getInfo($appId);
    if (empty($info)){
      return false;
    } elseif ($info['is_public']){
      $apps[$appId] = array();
      $apps[$appId]['instance_id'] = array('0' => '');
    } elseif (!isset($apps[$appId])) {
      return false;
    }
    $urls = array();
    foreach($apps[$appId]['instance_id'] as $ii=>$v){
      $info['instance_id'] = $ii;
      $instance = AopApp::getInstance($info);
      $urls[] = $instance->getUrl($url,$absolute);
    }
    return $info['is_singleton'] ? reset($urls) : $urls;
  }

  public function getId()
  {
    return $this->appInfo['id'];
  }

  public function getInstanceId()
  {
    return isset($this->appInfo['instance_id']) ? $this->appInfo['instance_id'] : 0;
  }

  public function getName()
  {
    return $this->appInfo['name'];
  }

  public function getPath()
  {
    return 'apps/' . $this->getId();
  }

  public function getPublicPath()
  {
    $path = 'files/' . $this->getId();
    $realPath = DOCROOT . '/' . $path;
    if (!is_dir($realPath)) {
      makedir($path);
    } else if (!is_writable($realPath)) {
      return false;
    }
    return $path;
  }

  public function getUrl($url, $absolute = false)
  {
    $url = trim($url);
    if (AopCore::$routed) {
      static $paths = null;
      if (!isset($paths)) {
        $uri = AopCore::getUri();
        AopCore::staticRouter($uri);
        $paths = ($uri == '') ? array() : explode('/', $uri);
      }
      if ($this->getId() == $paths[0] && $this->getInstanceId() == $paths[1]) {
        return ($absolute ? $GLOBALS['basePath'] : '') . $url;
      }
    }
    /** TODO 下面一行代码为获取app实例的正解，
     * 		   由于支持SAAS，修改为假的实例，前台PHP是一套，后台服务是两套，因此修改为之后的代码
     * 		   如存在问题，之后再进行进一步的修改
     **/
//     $instance_id = $this->getInstanceId();
  	/** xiaoxiong 20140620 对SAAS机构为空做出判断 **/
    global $user;
  	$instance_id = (isset($user->bigOrgId)&&''!=$user->bigOrgId) ? $user->bigOrgId : 0;
    $args = func_get_args();
    $code = isset($args[2])?$args[2]:'';
    $instance_id = $code?$code:$instance_id;
    //if ($url != '' || !empty($instance_id)) {
    $url = $instance_id . '/' . $url;
    //}
    return ($absolute ? $GLOBALS['basePath'] : '') . $this->getId() . '/' . $url;
  }

  /**
   * @return AppContext
   */
  protected function getContext()
  {
    static $context = null;
    if (!isset($context)) {
      $context = new AppContext($this);
    }
    return $context;
  }

  /**
   * @return ProxyAbstract
   */
  protected function getProxy($proxyname)
  {
    static $list = array();
    $appId = $this->getId();
    $key = $appId . '-' . $proxyname;
    if (!isset($list[$key])) {
      $proxyList = AopApp::getProxyList();
      if (!isset($proxyList[$proxyname])) {
        return false;
      }
      if (isset($proxyList[$proxyname][$appId])) {
        $proxyInfo = $proxyList[$proxyname][$appId];
      } else if (isset($proxyList[$proxyname]['-'])) {
        $proxyInfo = $proxyList[$proxyname]['-'];
      } else {
        $list[$key] = false;
        return false;
      }
      AopCore::loadLibrary('proxy');
      require_once $proxyInfo['file'];
      $list[$key] = new $proxyInfo['classname']($this->appInfo);
    }
    return $list[$key];
  }

  protected function getForm()
  {
    static $form = null;
    if (!isset($form)) {
      AopCore::loadLibrary('form');
      $form = new AppForm($this);
    }
    return $form;
  }

  /**
   * @return AppViewAbstract
   */
  protected function getView()
  {
    $args = func_get_args();
    $multi = false;
    if(count($args)){
      $multi = $args[0];
    }
    static $view = null;
    if (!isset($view) || $multi) {
      $classname = 'AppView' . ucfirst($this->appInfo['template_engine']);
      if (!class_exists($classname)) {
        return false;
      }
      $view = new $classname($this);
    }
    return $view;
  }

  /**
   * @return AppTheme
   */
  protected function getTheme(){
    AopCore::loadLibrary('theme');
    return AppTheme::getInstance();
  }

  protected function init()
  {
  }

  public function appInit()
  {
  }

  public function hooks()
  {
    return array();
  }

  public function views()
  {
    return array();
  }

  public function urls()
  {
    return array();
  }

  public function resources()
  {
    return array();
  }

  /**
   * 目前不支持*的写法
   * 这里鉴权资源，比如：task.res.foo
   * @param string $permission
   */
  public function access($permission)
  {
    $resources = $GLOBALS['user']->resources;
    if(count($resources)==0){
      return false;
    }
    $permission = $this->appInfo['appid'] . '.res.' . $permission;
    foreach ($resources as $res) {
      if ($res->resourceName == $permission || $res->resourcePath == $permission){
        return true;
      }
    }
    return false;
  }

  public function redirect($url)
  {
    $url = $this->getUrl($url);
    gotoUrl($url);
  }

  public function draw($viewName = 'default', $args = null)
  {
    $instanceId = isset($args['instance_id']) ? $args['instance_id'] : 0;
    $views = $this->views($instanceId);
    if (!isset($views[$viewName])) {
      return false;
    }
    $callback = isset($views[$viewName]['callback']) ? $views[$viewName]['callback'] : $viewName;
    return call_user_func(array($this, 'view_' . $callback), $args);
  }

  public function invokeDraw($appId, $viewName, $args = null)
  {
    if (!($info = AopApp::getInfo($appId)))
    {
      return false;
    }
    $appInstance = AopApp::getInstance($info);
    return $appInstance->draw($viewName, $args);
  }

  protected function invoke($appId, $method)
  {
    static $subscribedList = null;
    if (!isset($subscribedList)) {
      global $user;
      if (isset($user->apps)) {
        $subscribedList = $user->apps;
      } else {
        $subscribedList = array();
      }
    }

    if (!($appInfo = AopApp::getInfo($appId)) || !$appInfo['is_app']) {
      return false;
    }

    $hooks = AopApp::getHookList();
    if (!isset($hooks[$method]) || !isset($hooks[$method][$appInfo['id']])) {
      return false;
    }
    $hookInfo = $hooks[$method][$appInfo['id']];

    $method = 'hook_' . $hookInfo['callback'];
    $args = array_slice(func_get_args(), 2);

    if (isset($hookInfo['is_public']) && $hookInfo['is_public']) {

      // 公共钩子不检查订购
      $appInstance = AopApp::getInstance($appInfo);
      if ($appInstance && method_exists($appInstance, $method)) {
        return call_user_func_array(array($appInstance, $method), $args);
      }
    } else {
      // 检查订购
      if (isset($subscribedList[$appId]) || $appInfo['display'] == AopApp::DISPLAY_HIDDEN || $appInfo['is_public']) {
        if (isset($subscribedList[$appId])) {
          $instanceIds = $subscribedList[$appId]['instance_id'];
        } else {
          $instanceIds = array(0);
        }
        $result = array();
        $len = count($instanceIds);
        foreach (array_keys($instanceIds) as $instanceId) {
          $appInfo['instance_id'] = $instanceId;
          $appInstance = AopApp::getInstance($appInfo);
          if ($appInstance && method_exists($appInstance, $method)) {
            $return = call_user_func_array(array($appInstance, $method), $args);
          } else {
            $return = false;
          }
          if ($len == 1) {
            return $return;
          } else {
            $result[$instanceId] = $return;
          }
        }
        return $result;
      }
    }

    return false;
  }

  protected function invokeByInstanceId($instanceId, $method, $appId = null)
  {
    static $subscribedList = null;
    if (!isset($subscribedList)) {
      global $user;
      if (isset($user->apps)) {
        $subscribedList = $user->apps;
      } else {
        $subscribedList = array();
      }
    }

    $hooks = AopApp::getHookList();
    if (!isset($hooks[$method])) {
      return false;
    }

    // 通过订购关系查找应用ID
    $found = false;
    if(!$appId){
      foreach ($subscribedList as $appId => $subscribed) {
        if (array_key_exists($instanceId, $subscribed['instance_id'])) {
          $found = true;
          break;
        }
      }
    }
    if (!$found && !$appId || !($appInfo = AopApp::getInfo($appId)) || !$appInfo['is_app'] || !isset($hooks[$method][$appInfo['id']])) {
      return false;
    }
    $hookInfo = $hooks[$method][$appInfo['id']];
    $method = 'hook_' . $hookInfo['callback'];
    $args = array_slice(func_get_args(), 3);
    $appInfo['instance_id'] = $instanceId;
    $appInstance = AopApp::getInstance($appInfo);
    if ($appInstance && method_exists($appInstance, $method)) {
      return call_user_func_array(array($appInstance, $method), $args);
    }
    return false;
  }

  protected function invokeAll($method)
  {
    static $subscribedList = null;
    if (!isset($subscribedList)) {
      global $user;
      if (isset($user->apps)) {
        $subscribedList = $user->apps;
      } else {
        $subscribedList = array();
      }
    }

    $hooks = AopApp::getHookList();
    if (!isset($hooks[$method])) {
      return false;
    }

    $args = array_slice(func_get_args(), 1);
    $result = array();
    foreach ($hooks[$method] as $appId => $hookInfo) {
      if (!($appInfo = AopApp::getInfo($appId)) || !$appInfo['is_app']) {
        continue;
      }
      $method = 'hook_' . $hookInfo['callback'];

      if (isset($hookInfo['is_public']) && $hookInfo['is_public']) {
        // 公共钩子不检查订购
        $appInstance = AopApp::getInstance($appInfo);
        if ($appInstance && method_exists($appInstance, $method)) {
          $result[] = call_user_func_array(array($appInstance, $method), $args);
        }
      } else {
        // 检查订购
        if (isset($subscribedList[$appId]) || $appInfo['display'] == AopApp::DISPLAY_HIDDEN || $appInfo['is_public']) {
          if (isset($subscribedList[$appId])) {
            $instanceIds = $subscribedList[$appId]['instance_id'];
          } else {
            $instanceIds = array(0);
          }
          foreach (array_keys($instanceIds) as $instanceId) {
            $appInfo['instance_id'] = $instanceId;
            $appInstance = AopApp::getInstance($appInfo);
            if ($appInstance && method_exists($appInstance, $method)) {
              $result[] = call_user_func_array(array($appInstance, $method), $args);
              // $result[$instanceId] = $return; 这样可能存在多个 $instanceId = 0 的结果
            }
          }
        }
      }
    }
    return $result;
  }

  protected function throwException($message, $level = AppException::E_WARNING, $code = 0)
  {
    throw new AppException($message, $level, $code, $this->appInfo['appid']);
  }

  public function hook_install($catalogId, $productId)
  {
    // TODO 注册资源索引
    //获取应用instance
    $appId = $this->appInfo['appid'];
    $appInstance = $this;
    $urlResources = array();
    if(method_exists($appInstance, 'urls')){
      $urlResources = $appInstance->urls();
    }
    $resource = array();
    $authProxy = $this->getProxy('auth');
    foreach ($urlResources as $key => $val) {
      $resource = array(
          'resourceName' => $appId,
          'resourceType' => 1,	//常量
          'resourcePath' => $appId.'.url.'.$key,
          'parentPath' => '/',
          'resourceRemark' => '',
          'resourceStatus' => 'true',
          'createTime' => date('Y-m-d h:i:s'),
          'resourceBelong' => $appId,
      );
      //返回true表明添加成功
      $result = $authProxy->addResource($resource);
    }
    $elementResources = array();
    //注册页面元素资源
    if(method_exists($appInstance, 'resources')){
      $elementResources = $appInstance->resources();
    }
    foreach ($elementResources as $key => $val) {
      $resource = array(
          'resourceName' => $appId,
          'resourceType' => 2,	//常量
          'resourcePath' => $appId.'.res.'.$key,
          'parentPath' => '/',
          'resourceRemark' => '',
          'resourceStatus' => 'true',
          'createTime' => date('Y-m-d h:i:s'),
          'resourceBelong' => $appId,
      );
      $result = $authProxy->addResource($resource);
    }
    return true;
  }

  public function hook_uninstall($catalogId, $productId)
  {
    // TODO 卸载资源索引
    return true;
  }

  public function hook_update($catalogId, $productId, $version)
  {
    // TODO 更新资源索引;
    return true;
  }

  public function hook_subscribed($userId, $instanceId, $catalogId, $productId)
  {
    // TODO 应用开通
    return true;
  }
}

abstract class AppConsoleAbstract extends AppAbstract
{
  public function menus()
  {
    return array();
  }

  public function redirect($url)
  {
    return array('redirect_url' => $url);
  }

  public function getUrl($url='default', $appId = null)
  {
    if ($appId === null)
    {
      $appId = $this->getId();
    }
    return 'console/app/' . $appId . '/' . $url;
  }
}

abstract class AppGroupAbstract extends AppAbstract
{
  const ROLE_OWNER = 9;
  const ROLE_MEMBER = 1;
  const ROLE_ORG = 0;

  /**
   * 批量开通可回滚
   * @param string $userId
   * @param array $offerInstanceIds
   */
  public function hook_batonsubscribe($userId, array $offerInstanceIds) {
    $sqlArray = array();
    foreach ($offerInstanceIds as $instanceId) {
      if ($instanceId != '') {
        $sql = 'INSERT INTO `members` (`offer_instance_id`, `member_id`, `org_id`, `role`) VALUES ("%s", "%s", "%s", %d)';
        $sql = sprintf($sql, $mysql->escape($instanceId), $mysql->escape($userId), '', self::ROLE_OWNER);
        $sqlArray[] = $sql;
      }
    }
    if (count($sqlArray) > 0) {
      //批量操作 insert
      $result = $mysql->batchExecute($sqlArray);
      if (is_string($result) && strtolower($result)=='success') {
        return true;
      }
    }
    return false;
  }

  /**
   * 开通操作
   * @see AppAbstract::hook_subscribed()
   */
  public function hook_subscribed($userId, $offerInstanceId, $catalogId, $productId)
  {
    if ($offerInstanceId != '') {
      // 开通者为 Owner
      $mysql = $this->getProxy('mysql');
      $sql = 'INSERT INTO `members` (`offer_instance_id`, `member_id`, `org_id`, `role`) VALUES ("%s", "%s", "%s", %d)';
      $sql = sprintf($sql, $mysql->escape($offerInstanceId), $mysql->escape($userId), '', self::ROLE_OWNER);
      $result = $mysql->execute($sql);
      if (strtolower($result) == 'success') {
        return true;
      }
    }
    return false;
  }

  /**
  * 获取成员列表和角色
  * @param string $offerInstanceId 订购标识
  * @return array
  */
  public function getMemberList($getObject = false)
  {
    static $list = array();
    $instanceId = $this->getInstanceId();
    if (!isset($list[$instanceId])) {
      $mysql = $this->getProxy('mysql');
      $result = $mysql->query('SELECT `member_id`, `org_id`, `role` FROM `members` WHERE `offer_instance_id` = "' . $instanceId . '"');
      $list[$instanceId] = array();
      $userProxy = $this->getProxy('user');
      foreach ($result as $row) {
        if ($getObject) {
          if ($row->role == self::ROLE_ORG) {
            $row->object = $userProxy->getOrgInfoByOrgId($row->org_id);
          } else {
            $row->object = $userProxy->getUser($row->member_id);
          }
        } else {
          $row->object = null;
        }
        $list[$instanceId][] = $row;
      }
    }
    return $list[$instanceId];
  }

  /**
   * 根据成员姓名获取帐号名
   * @param string $name 成员姓名
   * @return array
   */
  public function getMemberListByName($name)
  {
    $list = array();
    $name = trim($name);
    if (strlen($name) === '') {
      return $list;
    }
    $this->buildMemberMap();
    $mysql = $this->getProxy('mysql');
    $sql = 'SELECT `member_id` FROM `members_map` WHERE `offer_instance_id` = "%s" AND (`member_name` = "%s" OR `member_id` = "%s")';
    $sql = sprintf($sql, $mysql->escape($this->getInstanceId()), $mysql->escape($name), $mysql->escape($name));
    $list = $mysql->fetchCol($sql);

    $userProxy = $this->getProxy('user');
    $members = $this->getMemberList();
    foreach ($members as $row) {
      if ($row->role == self::ROLE_ORG) {
        // 返回用户列表
        $result = $userProxy->findUserByUserIdAndOrgId($row->org_id, $name);
        foreach ($result as $r) {
          $list[] = $r->userid;
        }
        $result = $userProxy->findUserListByUserName($row->org_id, $name);
        foreach ($result as $r) {
          $list[] = $r->userid;
        }
      }
    }

    return array_unique($list);
  }

  protected function buildMemberMap()
  {
    $instanceId = $this->getInstanceId();
    $cacheId = 'department_members_' . $instanceId;
    if (!cache::get($cacheId)) {
      set_time_limit(0);
      $userProxy = $this->getProxy('user');
      $members = $this->getMemberList();
      $org = array();
      $people = array();
      $this->deleteOrgMemberMap();
      foreach ($members as $row) {
        if ($row->role == self::ROLE_ORG) {
          // 性能原因，组织不导入
//          $this->insertOrgMemberMap($row->org_id);
        } else {
          $user = $userProxy->getUser($row->member_id);
          $this->insertMemberMap($row->member_id, $user->empName);
        }
      }
      cache::set($cacheId, true, 86400);
    }
  }

  protected function deleteOrgMemberMap()
  {
    $mysql = $this->getProxy('mysql');
    $sql = 'DELETE FROM `members_map` WHERE `offer_instance_id` = "%s"';
    $sql = sprintf($sql, $this->getInstanceId());
    $mysql->execute($sql);
  }

  protected function insertOrgMemberMap($orgId)
  {
    $userProxy = $this->getProxy('user');
    $orgs = $userProxy->findOrgListByParentid($orgId);
    foreach ($orgs as $org) {
      $this->insertOrgMemberMap($org->orgid);
    }
    $users = $userProxy->getUserListByOrgid($orgId);
    foreach ($users as $user) {
      $this->insertMemberMap($user->userid, $user->realname);
    }
  }

  protected function insertMemberMap($memberId, $memberName)
  {
    $mysql = $this->getProxy('mysql');
    $sql = 'INSERT IGNORE INTO `members_map` (`offer_instance_id`, `member_id`, `member_name`) VALUES ("%s", "%s", "%s")';
    $sql = sprintf($sql, $mysql->escape($this->getInstanceId()), $mysql->escape($memberId), $mysql->escape($memberName));
    $mysql->execute($sql);
  }

  /**
  * 设置成员
  * @param string $memberId 成员标识
  */
  protected function setMember($memberId = null, $orgId = null)
  {
    if (isset($memberId) && $this->isOwner($memberId)) {
      // 必须管理员权限且管理员不能被设置
      return;
    }
    $instanceId = $this->getInstanceId();
    $mysql = $this->getProxy('mysql');
    if (isset($memberId) && $memberId) {
      $sql = 'INSERT INTO `members` (`offer_instance_id`, `member_id`, `org_id`, `role`) VALUES ("%s", "%s", "", %d)';
      $sql = sprintf($sql, $instanceId, $memberId, self::ROLE_MEMBER);
    } else if (isset($orgId) && $orgId) {
      $sql = 'INSERT INTO `members` (`offer_instance_id`, `member_id`, `org_id`, `role`) VALUES ("%s", "", "%s", %d)';
      $sql = sprintf($sql, $instanceId, $orgId, self::ROLE_ORG);
    }
    $mysql->execute($sql);
  }

  /**
   *
   * 删除成员
   * @param string $memberId 成员标识
   * @return void
   */
  protected function removeMember($memberId = null, $orgId = null)
  {
    if (isset($memberId) && $this->isOwner($memberId)) {
      // 必须管理员权限且管理员不能被删除
      return;
    }
    $instanceId = $this->getInstanceId();
    $mysql = $this->getProxy('mysql');
    if (isset($memberId) && $memberId) {
      $sql = 'DELETE FROM `members` WHERE `offer_instance_id` = "%s" AND `member_id` = "%s"';
      $sql = sprintf($sql, $this->getInstanceId(), $memberId);
    } else if (isset($orgId) && $orgId) {
      $sql = 'DELETE FROM `members` WHERE `offer_instance_id` = "%s" AND `org_id` = "%s"';
      $sql = sprintf($sql, $this->getInstanceId(), $orgId);
    }
    $mysql->execute($sql);
  }

  /**
   *
   * 获取管理员标识
   * @return string
   */
  protected function getOwners()
  {
    static $list = array();
    $instanceId = $this->getInstanceId();
    /* echo $instanceId; */
    if (!isset($list[$instanceId])) {
      $mysql = $this->getProxy('mysql');
      $sql = 'SELECT `member_id` FROM `members` WHERE `offer_instance_id` = "%s" AND `role` = %d';
      $sql = sprintf($sql, $instanceId, self::ROLE_OWNER);
      $list[$instanceId] = $mysql->fetchCol($sql);
    }
    return $list[$instanceId];
  }

  /**
   *
   * 判断是否为成员
   * @param string $userId 用户标识
   * @return boolean
   */
  public function isMember($userId)
  {
    static $list = array();
    $instanceId = $this->getInstanceId();
    if (!isset($list[$instanceId])) {
      $members = $this->getMemberList();
      $list[$instanceId] = array(
        'members' => array(),
        'orgs' => array(),
      );
      foreach ($members as $row) {
        if ($row->role == AppGroupAbstract::ROLE_ORG) {
          $list[$instanceId]['orgs'][] = $row->org_id;
        } else {
          $list[$instanceId]['members'][] = $row->member_id;
        }
      }
    }
    // 是否成员
    if (in_array($userId, $list[$instanceId]['members'])) {
      return true;
    }
    // 是否在部门内
    $userProxy = $this->getProxy('user');
    $userInfo = $userProxy->getUserInfo($userId);
    if ($userInfo->jd_orgid) {
      $orgId = $userInfo->jd_orgid;
    } else {
      $orgId = $userInfo->deptEntry->orgid;
    }
    if (in_array($orgId, $list[$instanceId]['orgs'])) {
      return true;
    }
    $parents = $userProxy->getFatherChainOrg($orgId);
    foreach ($parents as $org) {
      if ($org && in_array($org->orgInfo->orgid, $list[$instanceId]['orgs'])) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   * 判断是否为owner
   * @param string $userId 用户标识
   * @return boolean
   */
  public function isOwner($userId)
  {
    $mysql = $this->getProxy('mysql');
    $sql = 'SELECT COUNT(0) FROM `members` WHERE `offer_instance_id` = "%s" AND `member_id` = "%s" AND `role` = ' . self::ROLE_OWNER;
    $sql = sprintf($sql, $this->getInstanceId(), $userId);
    return intval($mysql->fetchField($sql));
  }

  public function hook_install($catalogId, $productId) {
    if (!parent::hook_install($catalogId, $productId)) {
      return false;
    }

    $mysql = $this->getProxy('mysql');
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `layouts` (
  `offer_instance_id` VARCHAR(50) NOT NULL,
  `data` TEXT NOT NULL,
  PRIMARY KEY (`offer_instance_id`)
) DEFAULT CHARSET=utf8;
SQL;
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }

    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `members` (
  `offer_instance_id` VARCHAR(50) NOT NULL,
  `member_id` CHAR(32) NOT NULL DEFAULT '',
  `org_id` CHAR(32) NOT NULL DEFAULT '',
  `role` TINYINT(2) DEFAULT '0',
  PRIMARY KEY (`offer_instance_id`,`member_id`, `org_id`),
  KEY `member_id` (`member_id`),
  KEY `org_id` (`org_id`)
) DEFAULT CHARSET=utf8;
SQL;
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }

    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `settings` (
  `offer_instance_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(128) NOT NULL DEFAULT '',
  `pic` VARCHAR(128) NOT NULL DEFAULT '',
  `path` VARCHAR(128) NOT NULL DEFAULT '',
  `level` SMALLINT(1) NOT NULL DEFAULT '0' COMMENT '1:全国；2：公司；3：部门',
  `description` TEXT ,
  `data` TEXT,
  PRIMARY KEY (`offer_instance_id`)
) DEFAULT CHARSET=utf8;
SQL;
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS `members_map` (
  `offer_instance_id` VARCHAR(50) NOT NULL,
  `member_id` VARCHAR(32) NOT NULL DEFAULT '',
  `member_name` VARCHAR(16) NOT NULL DEFAULT '',
  PRIMARY KEY (`offer_instance_id`, `member_id`),
  KEY `member_name` (`offer_instance_id`, `member_name`)
) DEFAULT CHARSET=utf8;
SQL;
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }

    return true;
  }

  public function hook_uninstall($catalogId, $productId)
  {
    if (!parent::hook_uninstall($catalogId, $productId)) {
      return false;
    }
    $mysql = $this->getProxy('mysql');

    $sql = 'DROP TABLE IF EXISTS `layouts`;';
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }
    $sql = 'DROP TABLE IF EXISTS `members`;';
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }
    $sql = 'DROP TABLE IF EXISTS `members_map`;';
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }
    $sql = 'DROP TABLE IF EXISTS `settings`;';
    $result = $mysql->execute($sql);
    if (strtolower($result) !== 'success') {
      return false;
    }
    return true;
  }
}

abstract class AppPackageAbstract extends AppAbstract
{
  protected function getChildren()
  {
    if (isset($this->appInfo['children'])) {
      if (is_array($this->appInfo['children'])) {
        $list = $this->appInfo['children'];
      } else if (is_string($this->appInfo['children']) && $this->appInfo['children'] == '*') {
        $app = AopApp::getList();
        $list = array_keys($app);
      }
      if (isset($this->appInfo['block']) && is_array($this->appInfo['block'])) {
        foreach ($list as $k => $appId) {
          if (in_array($appId, $this->appInfo['block'])) {
            unset($list[$k]);
          }
        }
        $list = array_values($list);
      }
    } else {
      $list = array();
    }
    return $list;
  }

  public function getAppList()
  {
    global $user;
    static $list = null;
    if (!isset($list)) {
      $list = array();
      $subscribed_webapp_list = isset($user->apps) ? $user->apps : array();

      foreach ($this->getChildren() as $appId) {
        if ((!$info = AopApp::getInfo($appId)) || !$info['is_app'] || (!$info['is_public'] && !isset($subscribed_webapp_list[$appId]))) {
          continue;
        }
        $info['instance_id'] = isset($subscribed_webapp_list[$appId]) ? key($subscribed_webapp_list[$appId]['instance_id']):'0';
        $info['parent_app'] = $this;
        $list[$appId] = $info;
      }
    }
    return $list;
  }

  public function url_callback_layout($action = null)
  {
    $router = AopCore::getRouter();
    $url = $router['arguments'][2];
    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);

    $order = $systemInstance->getProxyInstance('order');
    $instanceId = $this->getInstanceId();
    $pInstanceId = null;
    if (!empty($instanceId)) {
      $offer = $order->getOfferInstanceByNo($instanceId);
      if(!empty($offer->parentInstanceId)){
        $pInstanceId = trim($offer->parentInstanceId);
      }
    }

    if ($action == 'edit'){
      return $systemInstance->layoutEdit($this, $pInstanceId);
    }
    return $systemInstance->layoutRender($this, $pInstanceId);
  }
}

abstract class AppGroupPackageAbstract extends AppGroupAbstract
{
  protected function getChildren()
  {
    if (isset($this->appInfo['children'])) {
      if (is_array($this->appInfo['children'])) {
        $list = $this->appInfo['children'];
      } else if (is_string($this->appInfo['children']) && $this->appInfo['children'] == '*') {
        $app = AopApp::getList();
        $list = array_keys($app);
      }
      if (isset($this->appInfo['block']) && is_array($this->appInfo['block'])) {
        foreach ($list as $k => $appId) {
          if (in_array($appId, $this->appInfo['block'])) {
            unset($list[$k]);
          }
        }
        $list = array_values($list);
      }
    } else {
      $list = array();
    }
    return $list;
  }

  public function getAppList()
  {
    global $user;
    static $list = null;
    if (!isset($list)) {
      $list = array();
      $subscribed_webapp_list = isset($user->apps) ? $user->apps : array();
      foreach ($this->getChildren() as $appId) {
        if ((!$info = AopApp::getInfo($appId)) || !$info['is_app']) {
          continue;
        }
        $info['instance_id'] = isset($subscribed_webapp_list[$appId]) ? key($subscribed_webapp_list[$appId]['instance_id']) : 0;
        $info['parent_app'] = $this;
        $list[$appId] = $info;
      }
    }
    return $list;
  }

  public function url_callback_layout($action = null)
  {
    $router = AopCore::getRouter();
    $url = $router['arguments'][2];
    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);

    $order = $systemInstance->getProxyInstance('order');
    $instanceId = $this->getInstanceId();
    $pInstanceId = null;
    if (!empty($instanceId)) {
      $offer = $order->getOfferInstanceByNo($instanceId);
      if(!empty($offer->parentInstanceId)){
        $pInstanceId = trim($offer->parentInstanceId);
      }
    }

    if ($action == 'edit'){
      return $systemInstance->layoutEdit($this, $pInstanceId);
    }
    return $systemInstance->layoutRender($this, $pInstanceId);
  }
}






abstract class AppViewAbstract
{
  /**
   * @var AppAbstract
   */
  private $_appInstance;

  public function __construct(AppAbstract $appInstance)
  {
    $this->_appInstance = $appInstance;
    $this->init();
  }

  protected function init()
  {
  }

  protected function getUrl($url, $ab = false, $instanceid = "")
  {
    return $this->_appInstance->getUrl($url, $ab, $instanceid);
  }

  protected function getAppUrl($appId, $url = '', $ab = false)
  {
    return $this->_appInstance->getAppUrl($appId, $url, $ab);
  }

  protected function getPath()
  {
    return $this->_appInstance->getPath() . '/templates';
  }

  protected function plain($text)
  {
    return htmlspecialchars($text, ENT_QUOTES);
  }

  public abstract function render($template, array $args = array());

  protected function getInstance()
  {
    return $this->_appInstance;
  }
}

class AppViewPhp extends AppViewAbstract
{
  public function render($templateFile, array $args = array())
  {
    $path = DOCROOT . '/' . $this->getPath();
    if (defined('DEVICENAME') && is_dir($path . '/' . DEVICENAME)) {
      $path .= '/' . DEVICENAME;
    }
    $templateFile = $path . '/' . $templateFile . '.' . AopApp::SUFFIX_TPL;
    $args['tplPath'] = $GLOBALS['basePath'] . $this->getPath();
    $args['basePath'] = $GLOBALS['basePath'];
    if (!is_file($templateFile)) {
      throw new AopException('Template file "' . $templateFile . '" not found.');
    }
    extract($args, EXTR_OVERWRITE);
    ob_start();
    include $templateFile;
    return ob_get_clean();
  }
}

class AppException extends AopException
{
  private $_appId;

  public function __construct($message, $level = parent::E_NOTICE, $code = 0, $appId = null)
  {
    parent::__construct($message, $level, $code);
    $this->_appId = $appId;
  }

  public function getAppId()
  {
    return $this->_appId;
  }
}

