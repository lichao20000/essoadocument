<?php
class ServiceController extends AopController {

  public function tttAction($name = null){
    echo json_encode($_POST);exit;

  }

  public function virtualsnsadminAction($username){
    AopCore::loadLibrary('app');

    $info = AopApp::getInfo('system');
    $instance = AopApp::getInstance($info);
    $r = $instance->invokePublic('department','getAdminInstances','sns',$username);
    echo json_encode($r);
    exit;
  }

  public function virtualsnsadminlistAction($instanceid){
    AopCore::loadLibrary('app');

    $info = AopApp::getInfo('system');
    $instance = AopApp::getInstance($info);
    $r = $instance->invokePublic('department','getAdminList','sns',$instanceid);
    echo json_encode($r);
    exit;
  }

  public function virtualsnsownAction($username){
    AopCore::loadLibrary('app');

    $info = AopApp::getInfo('system');
    $instance = AopApp::getInstance($info);
    $r = $instance->invokePublic('department','getInstances',$username);
    echo json_encode($r);
    exit;
  }

  public function htmlAction($name = null){
    $username = isset($_GET['username']) ? trim($_GET['username']) : '';
    global $user;
    $user = new stdClass();
    if (strlen($username) > 0){
       $cacheId = 'user_'.$username;
       $userObj = cache::get($cacheId);
       if (0&&$userObj) {

         $user = json_decode($userObj->data,true);
         $user = (object)$user;

       }else {
         $user->id = $username;
         AopCore::loadLibrary('app');
         $appInfo = AopApp::getInfo('system');
         $system = AopApp::getInstance($appInfo);
         $userProxy = $system->getProxyInstance('user');
         $userInfo = $userProxy->getUser($username);//echo 111;exit;
         $user->id = trim($username);
          $user->loginName = trim($username);
          $user->userName = $userInfo->empName;
          $user->desc = $userInfo->companyEntry->orgName;
          $user->dept = $userInfo->deptEntry->orgName;
          $user->status = $userInfo->userStatus;
          $user->email = $userInfo->emailAddress;
          $user->isLeader = $userProxy->isLeader();
          //$user->apps = $appList;
          $this->_pullData();
          $cacheId = 'user_'.$username;

          cache::set($cacheId, json_encode($user));
       }
       $user->cas = $system->invoke('setting', 'getCommonAppShow');

    }
    $templateName = AopConfig::get('template', 'default');
    $tplP = $GLOBALS['basePath'] . 'templates/' . $templateName;
    $tplP = substr($tplP, 1);
    $view = new AopView();

    $html = $view->render('service_header.phtml', array(

    ));

    $js = array(
      //url('js/jquery.js',true),
      url('js/easySlider1.7.js', true),
      url($tplP.'/js/cu.page.head.js',true)
    );


    $css = array(
      url($tplP.'/css/red_header.css',true),
    );

    $data = array(
      'js' => $js,
      'css' => $css,
      'html' => $html,
    );
    echo json_encode($data);
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

    foreach($offerInstances as $v){
      if(!isset($productList[$v->productId]))continue;
      $appId = $productList[$v->productId]['appId'];
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
    }//print_r($subscribedAppList);exit;
    $user->apps = $subscribedAppList;
  }


  /**
   * 微博内容写入sns数据库
   * @param unknown_type $param
   */
  public function weiboAction() {
  	if (strtolower($_SERVER['REQUEST_METHOD']) == 'post'){
	  	$weibo = $_POST;
			if (is_array($weibo) && count($weibo) > 0) {
		    AopCore::loadLibrary('app');
		    // 默认首页
		    $appInfo = AopApp::getInfo('system');
		    $appInstance = AopApp::getInstance($appInfo);
		    $result = $appInstance->invoke('sns','send_weibo',$weibo);
				//$snsProxy = $appInstance->getProxy('sns');
				print_r($result);exit;
				/* $result = $snsProxy->sendWeibo($weibo); */
				echo $result;exit;

			}
			echo 'error';exit;
  	}
    echo 'error';exit;
  }



  public function userinfoAction($username) {
    if (strlen($username) === 0) {
      echo json_encode(array());
      exit;
    }
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $userProxy = $system->getProxyInstance('user');
    $userInfo = $userProxy->getUser($username);
    echo json_encode($userInfo);
    exit;
  }

  public function orginfoAction($orgid) {
    $orgid = trim($orgid);
    if (strlen($orgid) === 0) {
      echo json_encode(array());
      exit;
    }
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $userProxy = $system->getProxyInstance('user');
    $orgidInfo = $userProxy->getOrgInfo($orgid);
    echo json_encode($orgidInfo);
    exit;
  }

  public function nameAction() {
  	if (strtolower($_SERVER['REQUEST_METHOD']) == 'post'){
  	  $username = isset($_POST['username']) ? trim($_POST['username']) :'';
  	  $nickname = isset($_POST['nickname']) ? trim($_POST['nickname']) :'';
      if (strlen($username) == 0 || strlen($nickname) == 0) {
        echo 'error';exit;
      }

		  AopCore::loadLibrary('app');
		  $appInfo = AopApp::getInfo('system');
		  $appInstance = AopApp::getInstance($appInfo);
		  $result = $appInstance->invoke('weibo','synUserInfo',$username, $nickname);

			echo 'ok';exit;
  	}
    echo 'error';exit;
  }

  public function sendWeiBoAction(){
    $img = $_POST['img'];
    $username = $_POST['username'];
    $time = date('Y-m-d H:i:s');
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $result = $appInstance->invoke('weibo','send_weibo',$time.' 发布了一张照片',$img,$username);
    echo $result;
    exit;
  }

  public function sendToInfoCenterAction(){
    $message=array(
      'userid' => $_POST['userid'],
      'senduserid' => $_POST['senduserid'],
      'senduseralias' => $_POST['senduseralias'],
      'fromappid' => $_POST['fromappid'],
      'msgtitle' => $_POST['msgtitle'],
      'msgcontent' => $_POST['msgcontent'],
      'id' => $_POST['id'],
      'url'=>$_POST['url'],
    );
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $infoCenter = $appInstance->invoke('unisappxiaoxizhongxin', 'addmessage', $message);
    echo 'success';
  }

  /**
   * 删除solr中的微博信息
   */
  public function delWeiboAction() {
    if (strtolower($_SERVER['REQUEST_METHOD']) == 'post'){
      $id = $_POST['cid'];
      AopCore::loadLibrary('app');
      $appInfo = AopApp::getInfo('system');
      $appInstance = AopApp::getInstance($appInfo);
      $solrId = 'np000/'.$id.'/weibo';//@todo 定义solr规则
      $search = $appInstance->getProxyInstance('search');
      $result = $search->removeByIds(array($solrId));
      //删除sns信息
      $snsResult = $appInstance->invoke('sns', 'deleteFeed','weibo',$id);
    }
    echo 'ok';
    exit;
  }

  public function sendBookmarkAction(){
    $title = $_POST['title'];
    $appid = $_POST['appid'];
    $url = $_POST['url'];
    $username = $_POST['username'];
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $add_bm_button = $appInstance->invoke('bookmark', 'buttonSNS',$appid,'添加书签',$url,$title,$username);
    echo $add_bm_button;
  }

  public function saveBookmarkAction(){
    $arr = $_POST;
    $username = $_POST['username'];
    $arr_json = json_encode($arr);
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $result = $appInstance->invoke('bookmark', 'buttonSNS','','','','',$username,2,$arr_json);
    echo $result;
  }

  public function hasReportAction() {
    $appid = $_POST['appid'];
    $columnid = $_POST['columnid'];
    $type = $_POST['type'];
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $isReport = $appInstance->invoke('report', 'reportWeibo',$columnid,$appid,$type);
    echo $isReport;exit;
  }

  public function reportButtonAction(){
    $title = $_POST['title'];
    $appid = $_POST['appid'];
    $type = isset($_POST['type']) ? trim($_POST['type']) : 'sns';
    $url = $_POST['url'];
    $columnid = $_POST['columnid'];
    $instanceid = isset($_POST['instanceid']) ? trim($_POST['instanceid']):'';
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $report_button = $appInstance->invoke('report', 'reportSNS',$url,$title,$columnid,$appid,$type,$instanceid);
    echo $report_button;
  }

  public function saveReportAction(){
    $args = $_POST;
    $arr_json = json_encode($args);
    $instanceid = isset($args['instanceid']) ? trim($args['instanceid']) : '';
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $appInstance = AopApp::getInstance($appInfo);
    $result = $appInstance->invoke('report', 'submitSNS',$arr_json);
    if ($args['appid'] = 'sns' && strlen($instanceid) > 0 && !in_array($instanceid, array('gonghui','sheying')) && strpos($result, '信息举报成功') !== false) {
      $list = $appInstance->invoke('department', 'getAdminList' , 'sns', $instanceid);
      foreach($list as $v) {
        $this->_sendSms($v, $args['uid'], '[论坛举报]'.$args['content'],$args['url']);
      }
    }
    if(is_array($result['messages']) && count($result['messages'])){
      foreach($result['messages'] as $key => $val){
        $appInstance->invoke('unisappxiaoxizhongxin', 'addmessage', $val);
      }
    }
    echo is_array($result) && isset($result['reuslt']) ? $result['reuslt'] : $result;
  }

  function hooksAction($appid){
    $className = 'App'.ucwords(strtolower($appid));
    $folder = APPPATH.'/'.strtolower($appid);
    if(!file_exists($folder)){
      die('error1');
    }
    $file = $folder.'/'.strtolower($appid).'.ps';
    if(!file_exists($file)){
      die('error2');
    }
    AopCore::loadLibrary('app');
    include_once $file;
    $class = new ReflectionClass($className);
    $m = $class->getMethods();
    $html = 'public function hooks(){<br>';
    $html .= '&nbsp;&nbsp;return array(<br>';
    foreach($m as $v) {
      if (strpos($v->name, 'hook_') === 0){
        $name = substr($v->name, 5);
          $html .= "&nbsp;&nbsp;&nbsp;'$name' => array('is_public' => 1, 'callback' => '$name'),<br>";
      }
    }
    $html .= '&nbsp;&nbsp;);<br>';
    $html .= '}';
    echo $html;exit;
  }

  public function viewAction($appid, $viewname) {
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo($appid);
    if (!$appInfo){
      echo '';
      exit;
    }
    $app = AopApp::getInstance($appInfo);
    if (!$app){
      echo '';
      exit;
    }
    echo $app->draw( $viewname);
  }

  /**
   * 获取【组织】聚合页的应用和视图信息
   */
  public function configAction() {
    AopCore::loadLibrary('app');
    $appList = AopApp::getList();
    //print_r($appList);exit;
    $html = 'array(';
    $appViewList = array();
    foreach ($appList as $appFolderId => $appInfo) {
      $appInstance =  AopApp::getInstance($appInfo);
      $appViewList[$appFolderId] = array();
      $views = array();

      if (method_exists($appInstance, 'views')) {
        //echo '====';echo $appFolderId;
        $views = $appInstance->views();
        //print_r($views);
      }
      if(count($views)>0){
        $html .= "'$appFolderId'=>array(";
        foreach ($views as $viewname => $val) {
          $appViewList[$appFolderId][] = $viewname;
          $html .= "'$viewname',";
        }
        //去掉多余的，符号
        $html = substr($html, 0, strlen($html)-1);
        $html .="),";
      }
    }
    $html = substr($html, 0, strlen($html)-1);
    echo $html .=');';
    exit;
  }

  public function _sendSms($receiver,$sender,$content,$url = '') {
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $userProxy = $system->getProxyInstance('user');
    $userInfo = $userProxy->getUser($sender);
    $senderName = $userInfo->displayName;
    $message[0]=array(
      'userid' => $receiver,  // 接收人id
      'senduserid' => $sender , // 发送人id
      'senduseralias' => $senderName,  // 发送人姓名
      'fromappid' => 'system', // 来自的应用id
      'msgtitle' => '短信息',  //  标题
      'msgcontent' => $content,  //  说明（可为空）
      'url' => $url
    );

    $result = $system->invoke('unisappxiaoxizhongxin', 'addmessagearray', $message);
    return;
    /*    返回：
     1：  操作成功
    0： 操作数据库失败
    -1： 传值为空-失败
    -2： 不是数组格式-失败
    -3： 必填参数值不能为空-失败
    -4： 不是二维数组格式-失败 */
    if ($result == 1){
      echo json_encode(array('status' => 'ok', 'info' => '发送成功！'));exit;
    } elseif($result == 0) {
      echo json_encode(array('status' => 'error', 'info' => '操作数据库失败！'));exit;
    } elseif($result == -1) {
      echo json_encode(array('status' => 'error', 'info' => '传值为空！'));exit;
    } elseif($result == -2) {
      echo json_encode(array('status' => 'error', 'info' => '不是数组格式！'));exit;
    } elseif($result == -3) {
      echo json_encode(array('status' => 'error', 'info' => '必填参数值不能为空！'));exit;
    } elseif($result == -4) {
      echo json_encode(array('status' => 'error', 'info' => '不是二维数组格式！'));exit;
    } else {
      echo json_encode(array('status' => 'error', 'info' => '未知错误！'));exit;
    }
  }

  public function usersAction($orgid,$startPage = 1, $pagesize = 20) {
    $orgid = trim($orgid);
    if (strlen($orgid) === 0){
      echo json_encode(array());exit;
    }
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $userProxy = $system->getProxyInstance('user');
    //$t = $userProxy->getUser('fanxy23');
    $t = $userProxy->findUserListByOrgCode($orgid,$startPage, $pagesize);
    echo json_encode($t);exit;
  }

  public function userscountAction($orgid) {
    $orgid = trim($orgid);
    if (strlen($orgid) === 0){
      echo json_encode(array());exit;
    }
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $userProxy = $system->getProxyInstance('user');
    //$t = $userProxy->getUser('fanxy23');
    $t = $userProxy->findUserCountByOrgCode($orgid);
    echo intval($t);exit;
  }


  /**
   * 验证用户是否开通微博
   * @param string $userId
   * @return boolean
   */
  public function validateuserhasweiboAction($userId) {
    if($userId == ''){
      echo 0;exit;
    }
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $result = $system->invoke('weibo', 'has_weibo', $userId);
    if($result == true){
      echo 1;exit;
    }
    echo 0;exit;
  }
}