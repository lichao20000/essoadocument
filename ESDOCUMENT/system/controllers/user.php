<?php
class UserController extends AopController
{
  public function loginAction()
  {
    if (!isLogin()) {
      
      $ssoAppId = AopConfig::get('sso.appid');
      $successUrl = AopConfig::get('sso.loginurl', url('user/token', true));
      $errorUrl = AopConfig::get('sso.error');
      $baseurl = AopConfig::get('sso.baseurl') ;
      
      $httpHost =  $_SERVER['HTTP_HOST'];//地址栏输入IP
      $serverPort = $_SERVER["SERVER_PORT"];//服务端口号
      $iipp=$_SERVER["REMOTE_ADDR"];//客户端IP
//       echo $iipp;
//       exit();
      $data['cilentIP'] = $iipp;
      $postData = json_encode($data);
      AopCore::loadLibrary('app');
      $appInfo = AopApp::getInfo('system');
      $system = AopApp::getInstance($appInfo);
      $proxy = $system->getProxyInstance('loginnetsegment');
      $returnData = $proxy->getDataByCilentIP($postData);
      
      $loginIP = $returnData->loginIP;
      $portNum = $returnData->portNum;
      
      $loginUrl = AopConfig::get('sso.login');
      $loginUrl3 = $loginUrl;
      $baseurl3 = $baseurl;
      $successUrl3 = $successUrl;
      $errorUrl3 = $errorUrl;
      $returnUrl3 = $returnUrl;
      if($loginIP!="-1" && $portNum!="-1"){
	      $ipStartPos = stripos($loginUrl,"://")+3;
	      if($ipStartPos != "-1"){
		      $loginUrl1 = substr($loginUrl,$ipStartPos);
		      $ipEndPos =  stripos($loginUrl1,"/");
		      $loginUrl2 = substr($loginUrl1,$ipEndPos);
		      $loginUrl3 = "http://".$loginIP.":".$portNum.$loginUrl2;
	      }
	      
	      $ipStartPos = stripos($baseurl,"://")+3;
	      if($ipStartPos != "-1"){
		      $baseurl1 = substr($baseurl,$ipStartPos);
		      $ipEndPos =  stripos($baseurl1,"/");
		      $baseurl2 = substr($baseurl1,$ipEndPos);
		      $baseurl3 = "http://".$loginIP.":".$portNum.$baseurl2;
	      }
	      
	      $ipStartPos = stripos($successUrl,"://")+3;
	      if($ipStartPos != "-1"){
		      $successUrl1 = substr($successUrl,$ipStartPos);
		      $ipEndPos =  stripos($successUrl1,"/");
		      $successUrl2 = substr($successUrl1,$ipEndPos);
		      $successUrl3 = "http://".$httpHost.":".$serverPort.$successUrl2;
	      }
	      
	      $ipStartPos = stripos($errorUrl,"://")+3;
	      if($ipStartPos != "-1"){
	      	$errorUrl1 = substr($errorUrl,$ipStartPos);
	      	$ipEndPos =  stripos($errorUrl1,"/");
	      	$errorUrl2 = substr($errorUrl1,$ipEndPos);
	      	$errorUrl3 = "http://".$httpHost.":".$serverPort.$errorUrl2;
	      }
	      
      	  $ipStartPos = stripos($returnUrl,"://")+3;
	      if($ipStartPos != "-1"){
	      	$returnUrl1 = substr($returnUrl,$ipStartPos);
	      	$ipEndPos =  stripos($returnUrl1,"/");
	      	$returnUrl2 = substr($returnUrl1,$ipEndPos);
	      	$returnUrl3 = "http://".$httpHost.":".$serverPort.$returnUrl2;
	      }
      }
      $successUrl3 = urlencode($successUrl3);
      $errorUrl3 = urlencode($errorUrl3);
      
      $returnUrl = isset($_SERVER['HTTP_REFERER']) ? urlencode($_SERVER['HTTP_REFERER']) : '';
      gotoUrl($loginUrl3."?appid=".$ssoAppId."&success=".$successUrl3."&error=".$errorUrl3."&return=".$returnUrl3."&baseurl=".$baseurl3);
     // gotoUrl($loginUrl3."?appid=".$ssoAppId."&success=".$loginUrl3."&error=".$loginUrl3."&return=".$loginUrl3."&baseurl=".$baseurl3);
    } else {
      //成功返回首页
      gotoUrl('');
    }
  }
  
  public function eiploginAction()
  {
    if (!isLogin()) {
      $ssoAppId = AopConfig::get('sso.appid');
      $successUrl = urlencode(AopConfig::get('sso.loginurl', url('user/token', true)));
      $errorUrl = urlencode(AopConfig::get('sso.error'));
      $baseurl = AopConfig::get('sso.baseurl') ;
//       $iipp=$_SERVER["REMOTE_ADDR"];
//       echo $iipp;
      $returnUrl = isset($_SERVER['HTTP_REFERER']) ? urlencode($_SERVER['HTTP_REFERER']) : '';
      gotoUrl(AopConfig::get('sso.login')."?appid=".$ssoAppId."&success=".$successUrl."&error=".$errorUrl."&return=".$returnUrl."&baseurl=".$baseurl);
    } else {
      //成功返回首页
      gotoUrl('');
    }
  }
  public function logoutAction()
  {
    AopCore::loadLibrary('app');
    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);
    $result = $systemInstance->invokeAll('logout');

    global $user;
    session_destroy();
    $user = anonymousUser();
    //xiewenda 内外网退出判断
    $httpHost =  $_SERVER['HTTP_HOST'];//地址栏输入IP
    $serverPort = $_SERVER["SERVER_PORT"];//服务端口号
    $iipp=$_SERVER["REMOTE_ADDR"];//客户端IP
    $data['cilentIP'] = $iipp;
    $postData = json_encode($data);
    $proxy = $systemInstance->getProxyInstance('loginnetsegment');
    $returnData = $proxy->getDataByCilentIP($postData);
    
    $loginIP = $returnData->loginIP;
    $portNum = $returnData->portNum;
    if($loginIP!='-1' && $portNum!='-1'){
    	$logout = 'http://'.$loginIP.':'.$portNum.'/flyingoauth/logout?returnUrl=%s';
    	$logoutReturnUrl = 'http://'.$loginIP;
    	gotoUrl(sprintf($logout, urlencode(url($logoutReturnUrl, true))));
    }else{
    gotoUrl(sprintf(AopConfig::get('sso.logout'), urlencode(url(AopConfig::get('sso.logoutReturnUrl', ''), true))));
    }
  }

  public function tokenAction()
  {
    if (!isset($_POST['token'])) {
      throw new Aop404Exception();
    }
    Aopcore::loadLibrary('sso');
    $xmlData = $_POST['token'];
//     $dom = new DOMDocument();
//     $data = $dom->loadXML($xmlData);
//     $token = $dom->getElementsByTagName('AssertionIDRef')->item(0)->nodeValue;
//
//     $assert = SSO::getAssert($token);
//     $r = SSO::validateAssert($assert);
    $r = SSO::validateAssert($xmlData);
    if ($r) {
      $this->_pullData();
      $this->_cacheUser();
      $this->_initCommonAppShow();
      // 清空用户订购列表缓存
      $user = $GLOBALS['user'];
      $cacheId = 'appslist_' . $user->id;
      cache::remove($cacheId);
      gotoUrl('user/synlogin');
    } else {
      $this->loginerrAction();
    }
  }

  public function synloginAction(){
    if (!isLogin()) {
      gotoUrl('user/login');
    }
    AopCore::loadLibrary('app');
    $systemInfo = AopApp::getInfo('system');

    $cacheId = 'syslogin_url';
    $reset = AopConfig::get('debug', false);
    if($reset || !($cache = cache::get($cacheId))) {
      $systemInstance = AopApp::getInstance($systemInfo);
      $syslogin_url = $systemInstance->invokeAll('synlogin');
      cache::set($cacheId, $syslogin_url);
    } else {
      $syslogin_url = $cache->data;
    }

    if(empty($syslogin_url)){
      gotoUrl('');
    }
    global $user;

    $view = new AopView();
    $data = array();
    $data['login_list'] = $syslogin_url;
    $data['jumpto'] = isset($_GET['r']) ? urldecode($_GET['r']):url('');
    echo $view->render('syn_login.phtml',$data);
  }

  public function loginerrAction($msg = NULL)
  {
    throw new AopException('平台登录出错，请稍候重试。');
  }

  public function viewAction($id = NULL)
  {
    global $user;
    if (!isset($id) || ($id == $user->id)) {
      return $this->getView()->render('userinfo.phtml', array(
        'user' => $user,
      ));
    } else {
      throw new Aop404Exception('Only show current user!');
    }
  }

  protected function _pullData()
  {
    global $user;
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $order = $system->getProxyInstance('order');
    $offerInstances = $order->getOfferInstanceList($user->id);

    $tmp = AopApp::getProductList();

    $productList = array();
    foreach($tmp as $k=>$v)
    {
      $productList[$v['id']] = $v;
    }
    $list = AopApp::getList();
    $subscribedAppList = array();
	//liqiubo 20141125 加入空判断，否则log会报错
    if(!empty($offerInstances)){
    	foreach($offerInstances as $v){
    		if(!isset($productList[$v->productId]))continue;
    		$appId = $productList[$v->productId]['appId'];
    		$newAppId = $productList[$v->productId]['newAppId'];
    		if (false === strpos($appId, '-')) {
    			if (!isset($list[$appId])) {
    				continue;
    			}
    			$info = $list[$appId];
    		} else if (($id = strstr($appId, '-', true)) && isset($list[$id])) {
    			if (!$list[$id]['is_multi_product']) {
    				continue;
    			}
    			$info = $list[$id];
    			$info['appid'] = $appId;
    		} else {
    			continue;
    		}
    	
    		$instance_id = isset($v->parentInstanceId) ? $v->parentInstanceId : $v->offerInstanceNo;
    		if(!isset($subscribedAppList[$appId])){
    			$subscribedAppList[$appId]['instance_id'] = array();
    			$subscribedAppList[$appId]['id'] = $v->productId;
    		}
    		$subscribedAppList[$appId]['instance_id'][$instance_id] = null;
    		$info['instance_id'] = $instance_id;
    		$appInstance = AopApp::getInstance($info);
    		if (method_exists($appInstance, 'getTitle')) {
    			$subscribedAppList[$appId]['instance_id'][$instance_id]['title'] = $appInstance->getTitle();
    		} else {
    			$subscribedAppList[$appId]['instance_id'][$instance_id]['title'] = $productList[$v->productId]['productName'];
    		}
    		if (method_exists($appInstance, 'getLevel')) {
    			$subscribedAppList[$appId]['instance_id'][$instance_id]['level'] = $appInstance->getLevel();
    		}
    		$subscribedAppList[$appId]['new_app_id'] = $newAppId;
    	}
    //print_r($subscribedAppList);exit;
    }
    $user->apps = $subscribedAppList;
  }

  private function _cacheUser(){
    global $user;
    $cacheId = 'user_' . $user->id;
    cache::set($cacheId, json_encode($user));
  }

  public function errorAction($errorCode = null) {
    //判断错误
    $errorCode = isset($_GET['errorCode']) ? $_GET['errorCode'] : '';
    switch ($errorCode) {
      case 1:
        throw new AopException('账号或口令错误!');
        break;

      case 2:
        throw new AopException('验证码出错!');
        break;

      case 3:
        throw new AopException('账号停止使用!');
        break;

      case 4:
        throw new AopException('没有访问此站点授权!');
        break;

      case 5:
        throw new AopException('该站点未注册!');
        break;

      case 998:
        throw new AopException('SSO维护中!');
        break;

      case 999:
        throw new AopException('SSO内部错误!');
        break;

      case 21:
        throw new AopException('该用户已退出!');
        break;

      case 22:
        throw new AopException('超时!');
        break;

      default:
        throw new AopException('登录');
        break;
    }
  }

  private function _initCommonAppShow () {
    AopCore::loadLibrary('app');
    $systemInfo = AopApp::getInfo('system');
    $systemInstance = AopApp::getInstance($systemInfo);

    global  $user;
    $list = $systemInstance->invoke('setting', 'getCommonAppShow');
    $user->cas = $list ? (array)$list : array();
  }
}
