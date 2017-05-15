<?php
class SearchController extends AopController
{
  //过滤特殊字符
  private $_blakList = array('!'=>'','^'=>'','*'=>'','('=>'',')'=>'','-'=>'','?'=>'','~'=>'','+'=>'','"'=>'');
  public function init()
  {

  }

  public function _checkLogin(){
    if (!isLogin()){
      $url = url('user/login',true);
      //gotoUrl($url);
    }
  }

/*   public function addToWeiboAction(){
  	global $user;
  	AopCore::loadLibrary('app');
  	AopCore::loadLibrary('apache.solr.php');
  	AopCore::loadLibrary('searchlib');
  	$appInfo = AopApp::getInfo('system');
  	$system = AopApp::getInstance($appInfo);

  	$callerUserName = $user->loginName;
  	$followedUserName = $_GET['followname'];
  	try{
	  	$rs = $system->invokePublic('weibo', 'followme',$callerUserName,$followedUserName);
  		if(is_object($rs) && $rs != ''){
	  		echo $rs->data;
	  	}else{
	  		echo '加关注失败，暂时无法添加此人关注';
	  	}
  	}catch(Exception $e){
  		echo '加关注失败，暂时无法添加此人关注.';
  	}
  } */

  public function infoAction() {
    $this->_checkLogin();
    if (!isset($_GET['keywords'])) {
      $_GET['keywords'] = '';
    } else {
      $_GET['keywords'] = trim($_GET['keywords']);
    }
    $keywords = urldecode($_GET['keywords']);
		//$keywords = urldecode($_GET['keywords']);

    //搜索条件
    $pageQueryParams = array();  //获取参数
    $fq = array();
    //if(isset($_GET['adv'])){
      $created_name = isset($_GET['created_name'])?urldecode($_GET['created_name']):'';
      if (trim($created_name)!=''){
        $fq['created_name'] = $created_name;
        $pageQueryParams['created_name'] = $created_name;
      }
      $from = isset($_GET['from'])?urldecode($_GET['from']):'';
      if (!empty($from)) {
        $fq['from'] = $from;  //实际上对应bundle_name
        $pageQueryParams['from'] = $from;
      }
    //}

    //获取menu过滤
    $fqTags = array();
    $bundle_name = isset($_GET['bundle_name'])?urldecode($_GET['bundle_name']):'';
    if (trim($bundle_name)!=''){
      $fqTags['bundle_name']= $bundle_name ;
      $pageQueryParams['bundle_name'] = $bundle_name;
    }
    //$keywords = (string) base64_decode($keywords);
    return $this->doSearch($keywords,array(), 'info', '', $fq, $fqTags, array(), $pageQueryParams);
  }

  public function addindexAction(){
    if (strtolower($_SERVER['REQUEST_METHOD']) == 'post'){
      $documentlist = array();

      $reqired = array('id','type','typename','title','url','content','dateline');
      foreach($reqired as $v){
        if(!isset($_POST[$v]) || empty($_POST[$v])) {
          echo 'error';
          exit;
        }
      }
      $content = new stdClass();
      $content->id = $_POST['id'];
      $content->type = $_POST['type'];
      $content->typename = $_POST['typename'];
      $content->title = $_POST['title'];
      $content->path = 'path';
      $content->url = $_POST['url'];
      $content->content = $_POST['content'];
      $content->teaser = isset($_POST['teaser'])?$_POST['teaser']:'';
      $content->name = isset($_POST['name'])?$_POST['name']:'';
      $content->uid = isset($_POST['username'])?$_POST['username']:'';
      $content->status = 1;
      $content->tnid = 1;
      $content->translate = 1;
      $content->language = 'ch';
      $content->created = $_POST['dateline'];
      $content->changed = $_POST['dateline'];
      $content->exp_date = strval(date('Y', $_POST['dateline']) + 1) . '-' . date('m', $_POST['dateline']) .'-' . date('d', $_POST['dateline']);

      $content->access_uid = 'all';
      $content->access_role = 'all';
      $documentlist[] = $content;

      AopCore::loadLibrary('app');
      AopCore::loadLibrary('apache.solr.php');
      AopCore::loadLibrary('searchlib');
      $appInfo = AopApp::getInfo('system');

      $system = AopApp::getInstance($appInfo);
      $search = $system->getProxyInstance('search');
      $search->index($documentlist);
      echo 'ok';
      exit;
    }
    return Aop404Exception::E_ERROR;
  }

  public function removeindexAction(){
    $ids = $_POST['ids'];

    if (strtolower($_SERVER['REQUEST_METHOD']) == 'post'){
      AopCore::loadLibrary('app');
      AopCore::loadLibrary('apache.solr.php');
      AopCore::loadLibrary('searchlib');
      $appInfo = AopApp::getInfo('system');

      $system = AopApp::getInstance($appInfo);
      $search = $system->getProxyInstance('search');
      $rs = $search->removeByIds($ids);
      echo 'ok';
    }
  }


  public function colleageAction() {
    $this->_checkLogin();
    if (!isset($_GET['keywords'])) {
      $_GET['keywords'] = '';
    } else {
      $_GET['keywords'] = trim(($_GET['keywords']));
    }
    $keywords = urldecode($_GET['keywords']);
		//$keywords = urldecode($_GET['keywords']);
    $addFriend = '';
    if(isset($_POST['h_title']) && !empty($_POST['h_title'])){
      AopCore::loadLibrary('app');
      AopCore::loadLibrary('apache.solr.php');
      AopCore::loadLibrary('searchlib');
      $appInfo = AopApp::getInfo('system');
      $system = AopApp::getInstance($appInfo);
      $username = $_POST['h_title'];
      $groupid = $_POST['group'];
      $note = htmlspecialchars($_POST['note']);

      if (isset($username) && strlen($username) > 0){
        $uid = $system->getContextInstance()->getUser()->getId();
        $s = $system->invoke('setting', 'friendOpen', $username);
        if ($s == 0) {
          $addFriend = '对方禁止添加好友';
        } else if ($s == 1) {
          $addFriend = '需要对方认证';
        } else if ($s == 2 ) {
          $addFriend = $system->invokePublic('sns','addFriend',$username,$groupid,$note,'name');
        } else {
          $addFriend = '设置错误';
        }
      } else {
        $addFriend = '未知错误';
      }
    }

    //搜索条件
    $pageQueryParams = array();  //获取参数
    $fq = array();
    //if(isset($_GET['adv'])){
      $ss_name = isset($_GET['ss_name'])?urldecode($_GET['ss_name']):'';
      if (trim($ss_name)!=''){
        $fq['ss_name'] = $ss_name;
        $pageQueryParams['ss_name'] = $ss_name;
      }
      $ss_orgname = isset($_GET['ss_orgName'])?urldecode($_GET['ss_orgName']):'';
      if (trim($ss_orgname)!=''){
        $fq['ss_orgName'] = $ss_orgname;
        $pageQueryParams['ss_orgName'] = $ss_orgname;
      }
      $ss_position = isset($_GET['ss_position'])?urldecode($_GET['ss_position']):'';
      if (trim($ss_position)!=''){
        $fq['ss_position'] = $ss_position;
        $pageQueryParams['ss_position'] = $ss_position;
      }
      $ss_officephone = isset($_GET['ss_officephone'])?urldecode($_GET['ss_officephone']):'';
      if (trim($ss_officephone)!=''){
        $fq['ss_officephone'] = $ss_officephone;
        $pageQueryParams['ss_officephone'] = $ss_officephone;
      }
      $ss_mobilephone = isset($_GET['ss_mobilephone'])?urldecode($_GET['ss_mobilephone']):'';
      if (trim($ss_mobilephone)!=''){
        $fq['ss_mobilephone'] = $ss_mobilephone;
        $pageQueryParams['ss_mobilephone'] = $ss_mobilephone;
      }
      $ss_email = isset($_GET['ss_email'])?urldecode($_GET['ss_email']):'';
      if (trim($ss_email)!=''){
        $fq['ss_email'] = $ss_email;
        $pageQueryParams['ss_email'] = $ss_email;
      }
      $ss_userid = isset($_GET['ss_userid'])?urldecode($_GET['ss_userid']):'';
      if (trim($ss_userid)!=''){
        $fq['ss_userid'] = $ss_userid;
        $pageQueryParams['ss_userid'] = $ss_userid;
      }
      $ss_roomnumber = isset($_GET['ss_roomnumber'])?urldecode($_GET['ss_roomnumber']):'';
      if (trim($ss_roomnumber)!=''){
        $fq['ss_roomnumber'] = $ss_roomnumber;
        $pageQueryParams['ss_roomnumber'] = $ss_roomnumber;
      }
    //}

    //获取menu过滤
    $fqTags = array();
    $bundle_name = isset($_GET['bundle_name'])?urldecode($_GET['bundle_name']):'';
    if (trim($bundle_name)!=''){
      $fqTags['bundle_name']= $bundle_name ;
      $pageQueryParams['bundle_name'] = $bundle_name;
    }
    //$keywords = (string) base64_decode($keywords);

    //doSearch($keywords,$condition,$area = 'info',$return = '', $fq = array(), $fqTags=array(), $faceQuery = array(), $pageParams = array()) {
    return $this->doSearch($keywords,array(),'colleage',$addFriend,$fq, $fqTags, array(), $pageQueryParams);
  }


  public function appAction() {
    AopCore::loadLibrary('app');
    $this->_checkLogin();
    $op = isset($_GET['op']) ? $_GET['op'] : 'all';
    AopCore::loadLibrary('app');
    AopCore::loadLibrary('apache.solr.php');
    AopCore::loadLibrary('searchlib');
    $systemInfo = AopApp::getInfo('system');
    if (!isset($_GET['keywords'])) {
      $_GET['keywords'] = '';
    } else {
      $_GET['keywords'] = trim($_GET['keywords']);
    }
		$keywords = urldecode($_GET['keywords']);

    $systemInstance = AopApp::getInstance($systemInfo);
    $orderProxyInstance = $systemInstance->getProxyInstance('order');
    $condition = array();
    $list = $orderProxyInstance->findProductList($keywords, $condition);

    $tagsList = array('专业应用', '数据应用', '工作流程', '其他应用');
    $showApps = AopApp::getUserProductList($tagsList);
    $subApps = array();
    foreach($showApps as $k=>$v){
      foreach($v as $k1=>$v1) {
        $subApps[$v1['id']] = 1;
        $subApps[$v1['id'] . '_url'] = $v1['url'];
      }
    }

    foreach($list as $appid=>$info) {
      if (!isset($subApps[$appid]) && substr($appid,0,5)=='link-' ) {
        unset($list[$appid]);
      }
    }

    if ($op == 'subscribe') {
      foreach($list as $appid=>$info) {
        if (!isset($subApps[$appid])) {
          unset($list[$appid]);
        }
      }
    } elseif( $op == 'unsubscribe' ) {
        foreach($list as $appid=>$info) {
        if (isset($subApps[$appid]) || substr($appid,0,5)=='link-') {
          unset($list[$appid]);
        }
      }
    }

    global $user;
    if(!empty($user)){
      $user_arr = $user->apps;
      foreach($list as $key => $val){
        if(array_key_exists($val['appId'],$user_arr)){
          $list[$key]['url'] = '/'.$val['appId'].'/'.key($user_arr[$val['appId']]['instance_id']);
        }else{
          $list[$key]['url'] = '';
        }
      }
    }

    $subscribedList = $this->getSubscribedList();
    foreach($list as $appid=>$info ){
      if (isset($subApps[$appid])) {
        $list[$appid]['url'] = $subApps[$appid . '_url'];
      }
      $list[$appid]['status'] = isset($subscribedList[$appid]) ? $subscribedList[$appid][0]['status'] : -1;
    }

    $data['response'] = $list;
    $data['filters'] = array();
    $data['area'] = 'app';
    $data['keywords'] = $keywords;
    $data['op'] = $op;
    $data['userapps'] = $GLOBALS['user']->apps;

    return $this->getView()->render('search_app.phtml', $data);
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

  protected function getOwnerNameByInstanceId($id, $pid, $ownerId = null)
  {
    global $user;
    if($user->id == $ownerId && empty($pid)){
      return $user->userName;
    }
    return '被订';
  }


  protected function doSearch($keywords,$condition,$area = 'info',$return = '', $fq = array(), $fqTags=array(), $faceQuery = array(), $pageParams = array()) {
    //fqTags={!tag=mytag}bundle_name:aaa&tags=mytab
    //fqTags={!tag=mytag}bundle_name:aaa,{!tag=e}entity_type:np020&tags=mytab,e
    //http://10.0.3.160:8080/eip_search/rest/searchservice/query/np020/wwwwww/fanxy23?fqTags=%7B%21tag%3Dmytab%7Dbundle_name%3A陕西省%20&tags=mytab
/*     if (count($this->_blakList) > 0){
      $keywords = strtr($keywords,$this->_blakList);
    } */
    $keywords = trim($keywords);//去掉空格
    AopCore::loadLibrary('app');
    AopCore::loadLibrary('apache.solr.php');
    AopCore::loadLibrary('searchlib');
    $appInfo = AopApp::getInfo('system');

    $system = AopApp::getInstance($appInfo);
    $search = $system->getProxyInstance('search');
    $page = isset($_GET['page']) ? $_GET['page'] : 1;
    $curr = isset($_GET['curr']) ? $_GET['curr'] : 1;
    if (isset($_GET['adv'])){

    }
		define('PERPAGE',15);
		$keywords_show = $keywords;

    //$keywords = preg_replace("/[@#!$%,.\'\"。，；]+/","",$keywords);
		//获取address appid

		$addressAppId = AopConfig::get('search.address.appid','np020');
		if($area == 'info'){
		  $fq['-entity_type'] =  $addressAppId;
		} else {
		  $fq['entity_type'] =  $addressAppId;
		}

    $response = (array) $search->searchKeys($keywords,$condition, 0, $page - 1 ,PERPAGE, $fq, $fqTags);

    $keywords = $keywords_show;
    //过滤标签字符
    //$keywords = preg_replace( "@<(.*?)>@is", "", $keywords);
    $spellcheck = $search->spellcheck($keywords);

    $group = $system->invokePublic('sns', 'getFriendGroupList');

    $filters = SearchLib::getFilters();
    if (!$filters) {
      $filters = array();
    }

   	$data['filters'] = $filters;
    $data['area'] = $area;
    $data['keywords'] = urlencode($keywords);
    $data['group'] = $group;
    $data['numfound'] = $numfound = SearchLib::getTotal();
    $data['keyword'] = $keywords;
		if ($spellcheck && ($spellcheck['numFound'] > 0)){
			$spellword = $spellcheck['alternatives'][0];
			$data['spellword'] = $spellword;
		}

    if( $page > floor($numfound/PERPAGE)){
    	$curr = $numfound - ($page-1) * PERPAGE;
    }else{
    	$curr = PERPAGE;
    }


    //构建分页参数
    $queryString = '';
    $queryString1 = '';//过滤掉制定参数
    if(count($pageParams)>0){
      foreach ($pageParams as $key => $value) {
        if($key != 'bundle_name'){
          $queryString1 .= "&$key=".urlencode($value);
        }
        $queryString .= "&$key=".urlencode($value);
      }
    }
    $data['queryString1'] = $queryString1;
    $data['queryString'] = $queryString;
    //$data['page'] = paginator($page, $numfound, '/search/'.$area.'?keywords=' . $keywords.'&',PERPAGE);
    $data['page'] = paginator_new($page, $numfound, '/search/'.$area.'?keywords=' . urlencode($keywords) . $queryString, PERPAGE);
		if (isset($advs)){
    	foreach($filters as $key => $value){
    		unset($advs[$key]);
    	}
			unset($advs['adv']);
			$g = '';
			foreach($advs as $key=>$value){
				$g .='&' . $key . '=' . $value;
			}
			$data['adv'] = $g . '&adv=adv';
		}else{
			$data['adv'] = '';
		}
    if($area == 'info') {
      $html = 'search.phtml';
      $resultHtml = array();
      $method = 'hook_search_item_view';
      $apps = $GLOBALS['user']->apps;
      foreach($response as $key => $val){
        $appId = AopApp::getIdFromAppId($val['fields']['entity_type']);
        // URL 替换
        $url = $val['fields']['url'];
        if (false !== strpos($url, '%instanceid%')) {
          // 替换订购关系
          $instanceId = isset($apps[$appId]) && $apps[$appId]['instance_id'] ? key($apps[$appId]['instance_id']) : 0;
          $url = strtr($url, array(
            '%instanceid%' => $instanceId,
          ));
        }
        //对url进行处理
        if ($url!='') {
          $urlInfo = parse_url($url);
          if (isset($urlInfo['scheme'])){
            $val['fields']['url'] = $url;  //外部应用或者绝对路径
          } elseif (isset($urlInfo['path'])) {  //判断是否为非法url
            $tempArray = explode('/', $urlInfo['path']);
            if($tempArray[0]!=''){
                if (count(explode('.', $tempArray[0])>1)) {  //外部域名而且没有http的
                  $val['fields']['url'] = 'http://'.$url;
                } else {  //内部应用，相对地址处理
                  $val['fields']['url'] = url($url, true);
                }
            }
          } else {
            $val['fields']['url'] = $url;
          }
        } else {
          $val['fields']['url'] = $url;
        }
        
        
        
        $appInstance = AopApp::getInstance(AopApp::getInfo($appId));
        if ($appInstance && method_exists($appInstance, $method)) {
        	try{
          	$resultHtml[$key] = $appInstance->{$method}($val);
        	}catch (Exception $e){
        		$resultHtml[$key] = $this->getView()->render('search_item_view.phtml', array(
            	'v' => $val,
            ));
        	}
        } else {
          $resultHtml[$key] = $this->getView()->render('search_item_view.phtml', array(
            'v' => $val,
          ));
        }
      }
      $response = $resultHtml;
    } else if($area == 'colleage') {
      $html = 'search_colleage.phtml';
      if(count($response)>0){
        foreach($response as $key => $val){ 
          $title = htmlspecialchars(isset($val['fields']['ss_userid'])?$val['fields']['ss_userid']:'0');
          $response[$key]['imageSrc'] = $system->invokePublic('sns','get_pic', $title, 'small');
          $response[$key]['button'] = $system->invokePublic('ucenter', 'button', isset($val['fields']['ss_userid'])?$val['fields']['ss_userid']:0);
          $response[$key]['followmeButton'] = $system->invoke('weibo', 'followme_button', isset($val['fields']['ss_userid'])?$val['fields']['ss_userid']:0);
        }
      }
      if(isset($_POST['h_title'])){
        $data['finish'] = 1;
      }else{
        $data['finish'] = 0;
      }

    } else{
      $html = 'search.phtml';
    }

    $data['response'] = $response;

    if($return){
    	$data['alert'] = '好友添加成功';
    }else{
    	$data['alert'] = '无法添加该好友，请确认您和该好友都已开通SNS';
    }
    if(isset($responseMenu)){
      $data['responseMenu'] = $responseMenu;
    }
    return $this->getView()->render($html, $data);
  }

/*   public function searchAction($area, $keywords = null)
  {
    $this->_checkLogin();
    AopCore::loadLibrary('app');
    AopCore::loadLibrary('apache.solr.php');
    AopCore::loadLibrary('searchlib');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $data = array();
    //$keywords = htmlentities($keywords);


    if ($area === 'info') {
      $author = isset($_GET['author']) ? $_GET['author'] : '';
      $from = isset($_GET['from']) ? $_GET['from'] : '';

      $search = $system->getProxyInstance('search');
      $condition = array();
      if (!empty($author)) {
        $condition['ss_name'] = $author;
        //$condition['created_name'] = $author;
      }
      if (!empty($from) && $from != 'all') {
        $condition['bundle'] = $from;
      }
      $response = $search->searchKeys($keywords,$condition);

      $data['response'] = $response;
      $data['filters'] = SearchLib::getFilters();

    } else if ($area === 'colleage') {
      $name = isset($_GET['name']) ? $_GET['name'] : '';

      $user = $system->getProxyInstance('search');
      echo 111;
      exit;
    }
    return $this->getView()->render('search.phtml', $data);
  } */

  /**
   * 发短信接口
   * @param unknown_type $param
   */
  public function smsAction() {
    $receivertel = $_POST['receivertel'];
    $content = trim($_POST['smscontent']);
    if ($content == ''){
      echo json_encode(array('status' => 'error','info' => '数据错误！'));exit;
    }
    $sender = $GLOBALS['user']->uid;
    $senderName = $GLOBALS['user']->userName;
    //短信获取接收人号码、短信签名（发送人信息）、发送内容、发送人省份编码
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);

    //@todo发送单条短信
    $messagesign = "$senderName($sender)";
    $sendprovcode = '';
    $result = $system->invoke('unisappgerenduanxin', 'sendsmsservice', $receivertel, $content,$messagesign, $sendprovcode);

    $result = json_decode($result,true);
    if(is_array($result)){
      $result = reset($result);
      /*错误码：
      -1 号码不能为空;
      -2 号码个数超限 最多2000个;
      -3 信息不能为空;
      -4 信息长度超限 最多1024个汉字;
      -5 签名长度超限 最多50个汉字;
      -99 其他异常;
      */
      if ($result > 0){
        echo json_encode(array('status' => 'ok', 'info' => '发送成功！'));exit;
      } elseif($result == -1) {
        echo json_encode(array('status' => 'error', 'info' => '号码不能为空'));exit;
      } elseif($result == -2) {
        echo json_encode(array('status' => 'error', 'info' => '号码个数超限 最多2000个'));exit;
      } elseif($result == -3) {
        echo json_encode(array('status' => 'error', 'info' => '信息不能为空;'));exit;
      } elseif($result == -4) {
        echo json_encode(array('status' => 'error', 'info' => '信息长度超限 最多1024个汉字;'));exit;
      } elseif($result == -5) {
        echo json_encode(array('status' => 'error', 'info' => '签名长度超限 最多50个汉字'));exit;
      }else {
        echo json_encode(array('status' => 'error', 'info' => '未知错误！'));exit;
      }
    }
    echo json_encode(array('status' => 'error', 'info' => '短信服务暂时不可用'));exit;
  }
}