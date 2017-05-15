<?php
class AppController extends AopController
{
  private function _checkLogin()
  {
    if (!isLogin()){
      $url = url('user/login',true);
      gotoUrl($url);
    }
  }

  private function _getAppCanvasStatus($info,$instanceId) {
    if ($info['appid'] == 'desktop' || $info['appid'] == 'department'){
      global $user;
      $key = 'appcanvasstatus_'.$info['appid'];
      if(!isset($user->$key)) {
        AopCore::loadLibrary('app');
        $appInfo = AopApp::getInfo('system');
        $systemInstance = AopApp::getInstance($appInfo);
        if ($info['appid'] == 'desktop'){
          $r = $systemInstance->invokePublic('setting', 'getDefaultAppCanvasStatus' ,'desktop');
        }else {
          $r = $systemInstance->invokePublic('setting', 'getDefaultAppCanvasStatus' , $instanceId);
        }
        $user->$key = $r;
      }
      return $user->$key;
    }
    return false;
  }

  public function callAction($appInfo, $instanceId, $method = 'default')
  {
    AopCore::loadLibrary('app');

    $appInfo['instance_id'] = $instanceId;
    $instance = AopApp::getInstance($appInfo);
    $instance->appInit();
    $urls = $instance->urls();
    if (!isset($urls[$method])) {
      if (AopCore::$routed) {
        AopCore::$routed = false;
        $uri = AopCore::getUri();
        $paths = ($uri == '') ? array() : explode('/', $uri);
        if (isset($paths[0])) {
          $controller = strtolower($paths[0]);
        }
        if (($appInfo = AopApp::getInfo($controller)) !== false) {
          $paths[0] = $appInfo;
          if (!isset($paths[1])) {
            $paths[1] = 0;
          }
          return call_user_func_array(array($this, 'callAction'), $paths);
        } else {
          throw new Aop404Exception('Controller file not found.');
        }
      } else {
        return AOP_NOT_FOUND;
      }
    } else {
      $url = $urls[$method];
      if (!is_array($url)) {
        $url = array(
          'callback' => $url,
        );
      }
      $methodName = 'url_' . $url['callback'];
    }
    if ($url['callback'] == URL_CALLBACK_LAYOUT && !in_array(get_parent_class($instance), array(
      'AppPackageAbstract',
      'AppGroupPackageAbstract',
    ))) {
      return AOP_NOT_FOUND;
    }
    if (!method_exists($instance, $methodName)) {
      return AOP_NOT_FOUND;
    }

    if (!isset($url['access']) || true !== $url['access']) {
      // 检查订购关系
      if (!$appInfo['is_public']) {
        // 检查登录
        $this->_checkLogin();
        $apps = $GLOBALS['user']->apps;
        $appId = $appInfo['productid'];
        if (!isset($apps[$appId]) || !isset($apps[$appId]['instance_id']) || !array_key_exists($instanceId, $apps[$appId]['instance_id'])) {
          return AOP_NOT_FOUND;
        }
      }
      // 权限校验
      if (isset($url['access']) && method_exists($instance, $url['access'])) {
        $accessCallback = array($instance, $url['access']);
        $permission = 'url_' . $method;
        if (!call_user_func($accessCallback, $permission)) {
          return AOP_NOT_FOUND;
        }
      }
    }

    $template = isset($url['template']) ? $url['template'] : (isset($appInfo['template']) ? $appInfo['template'] : null);
    if (!isset($template)) {
      // TODO 载入用户自定义主题
    }


    $result = call_user_func_array(array($instance, $methodName), array_slice(func_get_args(), 3));
    if (isset($result)) {
      if (is_array($result) && isset($result['type']) && isset($result['value'])) {
        switch ($result['type']) {
          case 'html':
            if (isset($result['value'])) {
              return array(
                'template' => $template,
                'html' => $result['value'],
              );
            }
          case 'template':
            if (isset($result['template'])) {
              $view = new AppViewPhp($instance);
              return array(
                'template' => $template,
                'html' => $view->render($result['template'], isset($result['value']) ? $result['value'] : array()),
              );
            }
            break;
          case 'json':
            if (isset($result['value'])) {
              echo json_encode($result['value']);
            }
            break;
        }
      } else if (is_string($result)) {
        return array(
          'template' => $template,
          'html' => $result,
        );
      } else {
        if ($this->_getAppCanvasStatus($appInfo, $instanceId)){
          $result .= '<script>var appAreaStatus = 1;</script>';
        }
        return $result;
      }
    }
  }

  public function centerAction($index = null)
  {
    $this->_checkLogin();
    AopCore::loadLibrary('app');
    AopCore::loadLibrary('proxy');

    // 通过 Proxy 获取 WebApp 列表
    $result = AopApp::getProductList();

    // 获取当前用户已订购的 WebApp 列表
    $subscribed_apps = $this->getSubscribedList();

    $tagsList = array('专业应用', '数据应用', '工作流程', '其他应用');
    $userProductList = AopApp::getUserProductList($tagsList);
    $temp = array();
    foreach($userProductList as $k => $v) {
      foreach($v as $k1 => $v1) {
        $temp[] = $v1['id'];
      }
    }
    if (!isset($index)) {
      $index = -1;
    } else {
      $index = intval(substr($index, 3));
      if (!isset($tagsList[$index])) {
        $index = -1;
      } else {
        $tag = $tagsList[$index];
      }
    }
//
    $apps = AopApp::getList();


    $list = array();
    foreach ($result as $key => $value) {
      $appid = $value['appId'];
      if (false === strpos($appid, '-')) {
        if (!isset($apps[$appid])) {
          continue;
        }
        $app = $apps[$appid];
      } else if (($id = strstr($appid, '-', true)) && isset($apps[$id])) {
        if (!$apps[$id]['is_multi_product'] || !in_array($appid, $temp)) {
          continue;
        }
        $value['tag'] = (array)$value['tag'];
        $app = $apps[$id];
      } else {
        continue;
      }
      if (!$app['is_app'] || $app['display'] == AopApp::DISPLAY_HIDDEN ) {
        continue;
      }
      if ($index != -1) {
        $found = false;
        if (false === strpos($appid, '-') && in_array($tag, $app['tag'])) {
          $found = true;
        } else {
          if (!isset($value['tag'])) {
            continue;
          }
          if (!is_array($value['tag'])) {
            $value['tag'] = array($value['tag']);
          }
          if (in_array($tag, $value['tag'])) {
            $found = true;
          }
        }
        if (!$found) {
          continue;
        }
      }
      $list[$appid] = $value + $app;
    }
    //print_r($subscribed_apps);exit;
    $view = new AopView();
    return $view->render('app_center.phtml', array(
      'list' => $list,
      'subscribed_apps' => $subscribed_apps,
      'index' => $index,
      'tagsList' => $tagsList,
    ));
  }



  public function subscribeAction($appid, $id)
  {
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo($appid);
    if ($appInfo['is_singleton']) {
      $sl = $this->getSubscribedList();
      if (isset($sl[$appid])){
        echo '已经订购或者等待审批中';
        exit;
      }
    }

    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);
    // 获取当前用户已订购的 WebApp 列表
    $subscribed_apps = $this->getSubscribedList();

    $app_info = AopApp::getInfo($appid);
    if (!$app_info || (isset($subscribed_apps[$appid]) && $app_info['is_singleton'])) {
      return $this->getView()->render('app_error.phtml');
    }
    $user_id = $GLOBALS['user']->id;
    if($app_info['is_check']){  //需要审核
      if ($user_id) {
        $item_list = array(
            array(
                'productId' => (int)$id,
            ),
        );
        $order = $systemInstance->getProxyInstance('order');
        $result = $order->createOrderExt($user_id, $item_list);
        echo json_encode(array('status' => 'ok', 'is_check'=> '1', 'info' =>$result ));
      }
    } else {  //不需要
      if($user_id){
        $order = $systemInstance->getProxyInstance('order');
        $result = $order->dredgeApp(array((int)$id));
        echo json_encode(array('status' => 'ok', 'is_check'=> '0', 'info' => $result ));
      }
    }
  }

  public function unsubscribeAction($appid, $id){
    AopCore::loadLibrary('app');
    $appid = AopApp::getIdFromAppId($appid);
    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);

    //回调钩子处理
    $appInfo = AopApp::getInfo($appid);
    $appInstance = AopApp::getInstance($appInfo);
    $method = 'hook_unsubscribe';
		if (method_exists($appInstance, $method)) {
			if(!$appInstance->$method($id)){
				echo 'error:';exit;
			}
		}

    $order = $systemInstance->getProxyInstance('order');
    $order->updateOfferInstanceStatus($id, 0);
    echo 'ok';
  }



  private function getSubscribedList()
  {
    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);

    $user_id = $systemInstance->getContextInstance()->getUser()->getId();

    // 获取当前用户已订购的 WebApp 列表
    $order = $systemInstance->getProxyInstance('order');
    $tmp = $order->getProductList();
    $product_list = array();
    foreach($tmp as $k=>$v)
    {
      $product_list[$v['id']] = $k;
    }

    $result = $order->getOfferInstanceList($user_id);

    $subscribed_apps = array();
    foreach ($result as $order_instance) {
      if(!isset($product_list[$order_instance->productId]))continue;
      $appid = $product_list[$order_instance->productId];
      $appid = AopApp::getIdFromAppId($appid);
      if (!isset($subscribed_apps[$appid])) {
        $subscribed_apps[$appid] = array();
      }
      $subscribed_apps[$appid][] = array(
        'id'=>$order_instance->offerInstanceNo,
        'ownerName' => $this->getOwnerNameByInstanceId($order_instance->offerInstanceNo, $order_instance->parentInstanceId, $order_instance->ownerId),
        'unsubscribe' => empty($order_instance->parentInstanceId),
        'time' => $order_instance->fulfillmentDate,
        'status'=>1
      );
      continue;
      $subscribed_apps[$appid][] = isset($order_instance->parentInstanceId) && $order_instance->status == '0' ?
      $order_instance->parentInstanceId : $order_instance->id;
    }


    $r = (array)$order->getOrderList(0,$user_id);
    foreach ($r as $v) {
      if (isset($v->orderItems) && is_array($v->orderItems)) {
        foreach ($v->orderItems as $i) {
          if(!isset($product_list[$i->productId]))continue;
          $appid = $product_list[$i->productId];
          $appid = AopApp::getIdFromAppId($appid);
          if (!isset($subscribed_apps[$appid])) {
            $subscribed_apps[$appid] = array();
          }
          $subscribed_apps[$appid][] = array(
            'id'=>$i->productId,
            'status'=>0,
            'time' => $i->fulfillmentDate,
          );
        }
      }
    }

    return $subscribed_apps;
  }

  public function getAppIdMap(){
    static $result = null;
    if (!isset($result)) {
      $apps = AopApp::getList();
      $result = array();
      foreach ($apps as $appid => $app) {
        $result[$app['appid']] = $appid;
      }
    }
    return $result;
  }

  private function getAppPath($appId = null) {
    AopCore::loadLibrary('app');
    return AopApp::getPath($appId);
  }

  public function installAction($appId = null, $catalogId = null, $productId = null) {
    /*     $user = isset($_GET['user'])?$_GET['user'] : '';
     $password = isset($_GET['password'])?$_GET['password'] : '';
    if (!$this->validateUser($user, $password)) {
    throw new AopException('用户验证失败！');
    } */

    //上传文件
    $incomingData = file_get_contents('php://input');
    if (!$incomingData) {
      echo '文件获取错误';
      return;
    }
    if (!isset($appId) || !isset($catalogId) || !isset($productId)) {
      echo '传递的参数错误！';
      return;
    }
    $filename = $appId . '.zip';
    file_put_contents($filename, $incomingData);
    if (!class_exists('ZipArchive')) {
      echo '不存在ZipArchive类，请开启相关的扩展库！';
      return;
    }
    $zip = new ZipArchive;
    if (false === $zip->open($filename)) {
      echo '文件打开出错！';
      return;
    }

    $path = $this->getAppPath();
    //开启权限
    @chmod($path, 0777);
    if (!$zip->extractTo($path)) {
      echo '文件解压失败！';
      return;
    }
    $zip->close();
    unlink($filename);

    AopCore::loadLibrary('app');
    AopApp::getList(true);  // 清空缓存

    if (($id = AopApp::getIdFromAppId($appId)) && ($appInfo = AopApp::getInfo($id))) {
      $appInstance = AopApp::getInstance($appInfo);
      $method = 'hook_install';
      if (method_exists($appInstance, $method)) {
        if (!$appInstance->$method($catalogId, $productId)) {
          echo 'hook_install回调失败！';
          return;
        }
      }
      echo '安装成功。';
    } else {
      echo '找不到应用！';
    }
    return;
  }

  public function uninstallAction($appId, $catalogId, $productId)
  {
    AopCore::loadLibrary('app');
    if (($id = AopApp::getIdFromAppId($appId)) && ($appInfo = AopApp::getInfo($id))) {
      $appInstance = AopApp::getInstance($appInfo);
      $method = 'hook_uninstall';
      if (method_exists($appInstance, $method)) {
        if (!$appInstance->$method($catalogId, $productId)) {
          echo 'hook_uninstall回调失败！';
          return;
        }
      }

      //删除文件
      $directory = $appInstance->getPath();
      $result = $this->delDir($directory);

      AopApp::getList(true);  // 清空缓存
      echo '卸载成功。';
    } else {
      echo '找不到应用！';
    }
    return;
  }

  public function updateAction($appId, $catalogId, $productId, $version=null) {
    //@todo 待部署方式确定
    /*     $user = isset($_GET['user'])?$_GET['user'] : '';
    $password = isset($_GET['password'])?$_GET['password'] : '';
    if (!$this->validateUser($user, $password)) {
    throw new AopException('用户验证失败！');
    }
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo($appId);
    $appInstance = AopApp::getInstance($appInfo);
    $method = 'hook_update';
    if (method_exists($appInstance, $method)) {
    if ($appInstance->$method($catalogId, $productId, $version)) {
    return true;
    }
    return false;
    }
    cache::clear();
    return true; */
  }

  private function delDir($directory)
  {
    if (is_dir($directory) == false)
    {
      throw new AopException("The Directory '$directory' Is Not Exist!");
    }
    $handle = opendir($directory);
    while (($file = readdir($handle)) !== false)
    {
      if ($file != "." && $file != "..")
      {
        if (is_dir("$directory/$file")) {
          $this->delDir("$directory/$file");
        } else {
          chmod("$directory/$file", 0777);
          unlink("$directory/$file");
        }
      }
    }
    if (readdir($handle) == false)
    {
      closedir($handle);
      chmod($directory, 0777);
      rmdir($directory);
    }
  }

  private function validateUser($username, $password) {
    $callbackUser = AopConfig::get('callback.user');
    $callbackPassword = AopConfig::get('callback.password');
    if ($callbackUser != $username || $callbackPassword != $password) {
      return false;
    }
    return true;
  }

  protected function getOwnerNameByInstanceId($id, $pid, $ownerId = null){
    global $user;
    if($user->id == $ownerId && empty($pid)){
      return $user->userName;
    }
    return '被订';
  }

	/**
	 * 适用批量开通，可进行回滚
	 */
  public function batonsubscribeAction() {
  	;
  }

  public function onsubscribeAction() {
    $user = isset($_GET['user'])?$_GET['user'] : '';
    $password = isset($_GET['password'])?$_GET['password'] : '';
    if (!$this->validateUser($user, $password)) {
      echo '用户验证失败！';return;
    }
    $data = $_POST['data'];
    $list = json_decode($data, true);
    AopCore::loadLibrary('app');
    $method = 'hook_subscribed';
    foreach ($list as $info) {
      $appId = $info['appId'];
      $offerInstanceId = $info['offerInstanceNo'];
      $userId = $info['userId'];
      $catalogId = '';
      $sourceId = AopApp::getIdFromAppId($appId);
      $appInfo = AopApp::getInfo($sourceId);
      $appInstance = AopApp::getInstance($appInfo);
      if (method_exists($appInstance, $method)) {
        if ($offerInstanceId !='' && $userId!= '') {
          if (!$appInstance->$method($userId, $offerInstanceId, $catalogId, $appId)) {
            echo 'hook_subscribed回调失败！';return;
          }
        } else {
          echo '用户id或者instanceNo为空';return;
        }

      }
    }
    //清理缓存，解决空格问题
    ob_clean();
    echo 'ok';
    return;
  }
	/**
	 * 定时任务执行
	 */
  public function cronAction() {
  	$appId = isset($_GET['appid'])?$_GET['appid'] : '';
  	$checkUserStatus = false;
  	$user = isset($_GET['user'])?$_GET['user'] : '';
  	$password = isset($_GET['password'])?$_GET['password'] : '';
  	//处理参数问题
  	$args = array();
  	foreach ($_GET as $key => $val) {
  	  if(!in_array($key, array('q','appid','user','password'))){
  	    $args[$key] = $val;
  	  }
  	}
  	if ($this->validateUser($user, $password)) {
  		$checkUserStatus = true;
  	}
  	ignore_user_abort(true);
  	set_time_limit(0);	//响应java请求
		if($checkUserStatus && $appId!= '') {
			AopCore::loadLibrary('app');
		  $appInfo = AopApp::getInfo($appId);
		  $appInstance = AopApp::getInstance($appInfo);
		  $method = 'hook_cron';

		  $systemInfo = AopApp::getInfo('system');
		  $systemInstance = AopApp::getInstance($systemInfo);
		  if (method_exists($appInstance, $method)) {
		    if (count($args)>0) {
		      $result = $appInstance->$method($args);
		    } else {
		      $result = $appInstance->$method();
		    }
			  //写审计日志
  	  	$logProxy = $systemInstance->getProxyInstance('log');
  	  	$message = '在'.date('Y-m-d h:i:s').'应用'.$appId.'的hook_cron方法被调用-'.gettype($result);
  	  	$logProxy->writeLog($appId, $message);
		  }
		}
  }
}
