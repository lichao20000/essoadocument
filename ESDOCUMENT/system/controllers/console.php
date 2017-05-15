<?php
class ConsoleController extends AopController
{
  public function indexAction()
  {
    if (!isLogin()) {
      gotoUrl('user/login');
    }
    AopCore::loadLibrary('app');
//    $appInfo = AopApp::getInfo('system');
//    $systemInstance = AopApp::getInstance($appInfo);
//    $authProxy = $systemInstance->getProxyInstance('auth');
//    if (!$authProxy->authAppRes('console')) {
//      throw new Aop403Exception();
//    }
    if ($GLOBALS['user']->id != 'eipadmin') {
     // throw new Aop403Exception();
    }

    $view = $this->getView();
    $view->assign('list', self::loadAll());

    echo $view->render('console.phtml');
  }

  public function appAction($name, $url = 'default')
  {
    AopCore::loadLibrary('app');
    if (($appInfo = AopApp::getInfo($name)) === false) {
      return AOP_NOT_FOUND;
    }
    if (empty($url)) {
      $url = 'default';
    }

    $consoleInstance = AopApp::getConsoleInstance($appInfo);
    $urls = $consoleInstance->urls();
    if(!isset($urls[$url])) {
      die('url not found');
    }
    $url = $urls[$url];
    $method = 'url_' . $url;
    $args = func_get_args();
    $args = array_slice($args, 2);
    $result = call_user_func_array(array($consoleInstance, $method), $args);
    $return = array();
    if (is_string($result))
    {
      $return['html'] = $result;
    } elseif (is_array($result)) {
      $return = $result;
    }
    echo json_encode($return);
    exit;
  }

  public static function loadAll()
  {
    $list = AopApp::getList();
    $return = array();
    foreach ($list as $key => $appInfo)
    {
      if ($appInfo['is_console'])
      {
        $return[$key] = $appInfo;
        $consoleInstance = AopApp::getConsoleInstance($appInfo);
        $menu = $consoleInstance->menus();
        foreach ($menu as &$menuitem) {
          if (!is_array($menuitem)) {
            $menuitem = array(
              'title' => $menuitem,
              'weight' => 0,
            );
          }
        }
        $urls = $consoleInstance->urls();
        $return[$key]['hasDefaultPage'] = isset($urls['default']);
        uasort($menu, 'ConsoleController::menuSort');
        $return[$key]['menu'] =$menu;
      }
    }
    return $return;
  }

  public static function menuSort($a, $b)
  {
    if ($a['weight'] === $b['weight']) {
      return 0;
    }
    return ($a['weight'] < $b['weight']) ? -1 : 1;
  }
}
