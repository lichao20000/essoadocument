<?php
/**
 * 默认处理首页
 * @author dengguoqi
 *
 */
class ESDefaultAction extends ESActionBase
{

	public function html()
	{
		echo 1111;
		return $this->renderTemplate(Array('result'=>Array('a','b')));
	}

	//首页渲染图片
	public function index()
	{   //获取头像
		$userId = $this->getUser()->getId();
		$param = json_encode(array('userId'=>$userId));
		$userproxy=$this->exec('getProxy','role');
		$iconUrl = $userproxy->getIconByUserId($param);
		return $this->renderTemplate(array('iconUrl'=>$iconUrl));
	}

	public function getArchiveAuthMenu()
	{
		$userId = $this->getUser()->getId();
	 	$ip = $this->getClientIp();
	 	$param['userId'] = $userId;
	 	$param['ip'] = $ip;
		$proxy = $this->exec ( "getProxy", 'role' );
		//加入到缓存
		$result = array();
		if(isset($_SESSION['navMenuDocument'.$userId]) && $_SESSION['navMenuDocument'.$userId]!=null){
			$result = $_SESSION['navMenuDocument'.$userId];
		}else{
			$result = $proxy->getArchiveAuthMenu(json_encode($param));
			$_SESSION['navMenuDocument'.$userId] = $result;
		}
		//$result = $proxy->getAllMenu();
		echo json_encode($result);
	}
	
	/**
	 * 获取当前用户所有的功能菜单
	 * @author liuhezeng  20140801
	 * @param userId 当前用户账户id
	 * @return 返回功能全部菜单，并标识有权限的菜单
	 */
	public function getDeskMenuTree()
	{
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param['userId'] = $userId;
		$param['ip'] = $ip;
		$proxy = $this->exec("getProxy", "role");
		$map = $proxy->getDeskMenuTree(json_encode($param));
		$nodes = array();
	 	foreach ($map as $node){
			$nodes[]= array(
					'id'=> $node->id,
					'pId'=> $node->pId,
					'name'=> $node->name,
					'checked'=> isset($node->checked) ? $node->checked : false
			);
		}
		$nodes[0]['open']=true;
		echo json_encode(array('nodes'=>$nodes));
	}
	/**
	 * 获取用户的桌面的APPS的集合
	 * liuhezeng 20140801
	 * longjunhao 20140811 edit
	 * **/
	public function getUserDeskAppsDetails(){
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param['userId'] = $userId;
		$param['ip'] = $ip;
		$proxy = $this->exec ( "getProxy", 'role' );
		$map = $proxy->getUserDeskAppsDetails(json_encode($param));
		if (count($map)>0) {
			foreach ($map as $value)
			{
				$menu[] = array(
						'id'=>$value->id,
						'name'=>$value->name,
						'icon'=>$value->controller.'_'.$value->action,
						'controller'=>$value->controller,
						'action'=>$value->action
				);
			}
			if(count($menu) > 0){
				$menu = json_encode($menu);
			} else {
				$menu = "[]";
			}
		} else {
			$menu = "[]";
		}
	
		echo $menu;
	}
	public function saveUserDeskApps(){
	
		$checkedAppsId = $_POST['checkedAppsId'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$proxy = $this->exec("getProxy", "role");
		$params = json_encode(array("userId" => $userId,"ip"=>$ip,"checkedAppsId" => $checkedAppsId));
		$result = $proxy->saveUserDeskApps($params);
	 echo $result;
	}
	
	// 文件浏览参数
	public function getViewUrl(){
		$fileId = isset($_POST["fileId"])?$_POST["fileId"]:'';
		$parms = array();
		$parms["result"] = "ok";
		$parms["type"] = "swf";
		$parms["fileId"] = $fileId;
		$parms["Scale"] = 1;//1-5-0eb9f49071461032bb960cc47a0c0610.pdf.swf   //bca158729c2048af82c2ff9d0084107d.swf
		$parms["SwfFile"] = 'http://168.168.169.100/apps/esdocument/templates/ESDefault/images/bca158729c2048af82c2ff9d0084107d.swf';//文件浏览地址
		$parms["codeImageUrl"] = 'http://168.168.169.100/apps/esdocument/templates/ESDefault/images/bf09b80ea0c441c8a0b85634fa53333b.jpg';//二维码地址
		$parms["ReadOnly"] = false; //只读控制
		$parms["CanPrint"] = true; //打印控制
		$parms["WatermarkEnabled"] = true; //水印控制
		$parms["WatermarkText"] = '水印内容'; //水印内容
		$parms["WatermarkSize"] = 54; //水印内容
		$parms["WatermarkRotation"] = -45; //水印旋转角度
		// 原文下载控制
		$parms["CanDownload"] = true; //下载控制
		$parms["DownloadUrl"] = '';
		$parms["FileName"] = '文件名';
		echo json_encode($parms);
	}
	/**
	 * 获取首页最新公告的前10条数据
	 * @author 
	 */
	public function getArchiveNewsLists(){
		$page = isset($_GET['page']) ? $_GET['page'] : 1;
		$limit = isset($_GET['limit']) ? $_GET['limit'] : 6;
		$boardId  = isset($_POST['boardId']) ? $_POST['boardId'] : 1;
	
		$boardCn = array('文控新闻','文控公告','文控其他');
	
		$userId = $this->getUser()->getId();
	
		$param = array(
				"page"=>($page - 1) * $limit,
				'pre'=>$limit,
				'boardId'=>$boardId,
				'status'=> '1',
				'userId'=>$userId,
				'condition'=> "",
				'accessType'=>'2'
		);
		$proxy = $this->exec("getProxy", "informationPublish");
		$lists = $proxy->getPublishTopicList(json_encode($param));
		$total = $lists->total; // 总条数
		$list = $btn = '';
		if(!$total){
			$list .= '<dl><dt><a href="#">无数据</a></dd></dl>';
		}else{
			foreach ($lists->items as $li => $row){
				$li++;
				$p = $row->boardId.'&'.$row->id;
				$len = strlen($row->title);
				if ($len > 14) {
					$showTitle = $this->cut_str($row->title, 14);
				} else {
					$showTitle = $row->title;
				}
				$list .= '<dl><dt><a href="#" title="'.$row->title.'" class="details_archiveNews" info="'. $p .'">·'.$showTitle.'</a></dt><dd>'.$row->createTime.'</dd></dl>';
			}
		}
		echo $list;
	}
	
	/**
	 * 截取中文
	 * @author
	 */
	function cut_str($string, $sublen, $start = 0, $code = 'UTF-8') {
		if($code == 'UTF-8') {
			$pa = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|\xe0[\xa0-\xbf][\x80-\xbf]|[\xe1-\xef][\x80-\xbf][\x80-\xbf]|\xf0[\x90-\xbf][\x80-\xbf][\x80-\xbf]|[\xf1-\xf7][\x80-\xbf][\x80-\xbf][\x80-\xbf]/";
			preg_match_all($pa, $string, $t_string);
	
			if(count($t_string[0]) - $start > $sublen) return join('', array_slice($t_string[0], $start, $sublen))."...";
			return join('', array_slice($t_string[0], $start, $sublen));
		}
		else {
			$start = $start*2;
			$sublen = $sublen*2;
			$strlen = strlen($string);
			$tmpstr = '';
	
			for($i=0; $i< $strlen; $i++) {
				if($i>=$start && $i< ($start+$sublen)) {
					if(ord(substr($string, $i, 1))>129) {
						$tmpstr.= substr($string, $i, 2);
					}
					else {
						$tmpstr.= substr($string, $i, 1);
					}
				}
				if(ord(substr($string, $i, 1))>129) $i++;
			}
			if(strlen($tmpstr)< $strlen ) $tmpstr.= "...";
			return $tmpstr;
		}
	}
	// 更新用户
	public function updateUser() {
		parse_str ( $_POST ['data'], $out );
		$out['userIp'] = $this->getClientIp();
		$out['userId'] = $this->getUser()->getId();
		$data = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'role' );
		$result = $Proxy->updateUser ( $data );
		echo $result;
	}
	/**
	 * 重置密码
	 * guolanrui 20140827
	 */
	public function modifyPassword(){
		$curuserId = $this->getUser()->getId ();
		$data ['curuserId'] = $curuserId;
		$data ['oldPassword'] = $_POST['oldPassword'];
		$data ['newPassword'] = $_POST['newPassword'];
		$postData = json_encode ( $data );
		$Proxy=$this->exec('getProxy','role');
		$return=$Proxy->modifyPassword($postData);
		echo json_encode($return);
	}
	public function editMyUserinfo(){
		$userId = $this->getUser()->getId();
		$Proxy=$this->exec('getProxy','role');
		$curuserInfo=$Proxy->getUserByUserid($userId);
		return $this->renderTemplate ( array('data'=>array (
				$curuserInfo->id,
				$curuserInfo->userid,
				$curuserInfo->lastname,
				$curuserInfo->firstname,
				$curuserInfo->userstatus,
				$curuserInfo->mobtel,
				$curuserInfo->emailaddress
		)) );
	}
	public function fileDown()
	{
		$fileUrl = $_GET['fileUrl'];
		$filName=basename($fileUrl);
		Header("Content-type: application/octet-stream;");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	}
	
	public function getBannerUrl()
	{
		$mark = $_POST['mark'];
		$b=pathinfo($mark);
		$proxy = $this->exec("getProxy", "role");
		$res = $proxy->getFileDownLoadUrl($b['filename']);
		echo $res;
	}
	
	/**
	 * 保存用户头像fileid
	 * wanghongchen 20140930
	 */
	public function saveHeaderImageId(){
		$fileId = $_POST['fileId'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('userId'=>$userId,'fileId'=>$fileId));
		$proxy=$this->exec('getProxy','role');
		$proxy->saveHeaderImageId($param);
	}
	/**
	 * 获取上传文件的url
	 */
	public function getUploadURL(){
		$proxy = $this->exec('getProxy','role');
		// 	 	$url = $proxy->getUploadUrl();
		/** guolanrui 20141213 由于文件服务子服务已增加根据网段控制，所以获取上传url改为新方法 **/
		$ip=$this->getClientIp();
		$data["clientIP"] = $ip;
		$url = $proxy->getNewUploadUrl(json_encode($data));
		echo $url;
	}
}
