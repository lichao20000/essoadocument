<?php
/*
 * 信息发布管理
 */
class ESInformationPublishAction extends ESActionBase{	
	
	public function GetUserInfo()
	{
		$uid = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($uid);
		
		$info = array(
					'userId' => $uid,
					'displayName' => $userInfo->displayName,
					'mainSite' => strtoupper($userInfo->mainSite),
					'deptCode' => $userInfo->deptCode
				);
		return $info;
	}
	
	// 获取导航栏目树节点  @ 方吉祥
	public function GetNavList()
	{
		$proxy = $this->exec("getProxy", "informationPublish");
		$result = $proxy->selectAllType();
		$NavList[] = array('id'=>-1, 'pId'=>0, 'name'=>'栏目列表', 'open'=>true);
  		foreach ($result as $row){
  			$NavList[] = array('id'=>$row->id, 'pId'=>-1, 'name'=>$row->name, 'open'=>true,'boardType'=>$row->boardType);
  		}
		echo json_encode($NavList);
	}
	

	/*
	 * 获取某个栏目下所有信息(后台)
	 * 筛选
	 */
	public function GetPublishTopicList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$condition = $_POST['query'] ? $_POST['query'] : "";
		$boardId  = isset($_GET['boardId']) ? $_GET['boardId'] : 1;
		$proxy = $this->exec("getProxy", "informationPublish");
		$userId = $this->getUser()->getId();
		$param = array(
				"page"=>($page - 1) * $rp,
				'pre'=>$rp,
				'boardId'=>$boardId,
				'status'=> '-1',
				'userId'=>$userId,
				'condition'=> $condition,
				'accessType'=>'1'
			);
		
		$result = $proxy->getPublishTopicList(json_encode($param));
		$jsonData = array('page'=>$page,'total'=>$result->total,'rows'=>array());
		if(!$result->total){
			echo json_encode($jsonData);
			return;
		}
		foreach ( $result->items as $line => $value)
		{
					
			$status = $value->status == 0 ? '未发布' : '已发布';
			$appStauts = $value->appStatus== 0 ? '未发布' : '已发布';
			
			$entry= array(
				'id'=>$value->id,
				'cell'=>array(
				"id"=>$value->id,
				'linenumber' => ($page - 1) * $rp+$line+1,
				'checkbox' => "<input type='checkbox' name='inputsA'  id='".$value->id."' />",
				'editcontent' => "<span class='editbtn' id='".$value->id."' ></span>",
				'title' => $value->title,
				'author' => $value->authorId,
				'createTime' =>$value->createTime,
				'status' => $status,
				'appStatus' => $appStauts
				),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	

 
 	//根据栏目名称和栏目下文章ID查询详细信息
	public function GetPublishTopic()
	{
		$topicId = $_GET['topicId'];
		$boardId = $_GET['boardId'];
		$proxy = $this->exec("getProxy", "informationPublish");
		$userId = $this->getUser()->getId();
		$param=array(
			'topicId'=>$topicId,
			'boardId'=>$boardId,
			'userId'=>$userId
		);
		$result = $proxy->getPublishTopic(json_encode($param));
		echo json_encode($result);
	}
	

	public function savePublishTopicAndStartProcess()
	{
	    $param =$_POST;
		$boardId = isset($_POST['boardId']) ? $_POST['boardId']:1;
		$isStartProcess = isset($_POST['isStartProcess'])?$_POST['isStartProcess']:false;
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param['userId'] = $userId; 
		$param['ip'] = $ip; 
		$proxy = $this->exec("getProxy", "informationPublish");
		$map = $proxy->savePublishTopic(json_encode($param)); // {'flag':true, 'topicId':123}
		
		echo json_encode($map);
	}
	
	// 删除栏目下文章信息
	public function DeletePublishTopic()
	{
		$boardId =$_POST['boardId'];
		$ids =$_POST['ids'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		
		$param = array(
			'boardId'=>$boardId,
			'ids'=>$ids,
			'userId'=>$userId,
			'ip'=>$ip
		);
		$proxy = $this->exec("getProxy", "informationPublish");
		$result = $proxy->deletePublishTopic(json_encode($param));
		echo $result;
	}
	
	
	// 获得上传文件服务器地址
	public function GetServiceIP()
	{
		$proxy = $this->exec("getProxy", "escloud_fileoperationws");
		$info = $this->GetUserInfo();
		$mainSite = $info['mainSite'];
		$serviceip = $proxy->getServiceIP();
		echo $serviceip."/uploadFile/publish/0/*";
		//echo "http://10.13.125.33:8080/escloud/rest/escloud_fileoperationws/uploadFile/publish/$orgid/*";
		
	}

	// 修改时删除附件
	public function DeleteFile()
	{
		$id = $_POST['fileId'];
		$proxy1 = $this->exec("getProxy", "escloud_publishws");
		$res = $proxy1->deletePublishFileById($id);
		echo $res;
	}
	
	public function updateTopicStatus(){
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$boardId = $_POST['boardId'];
		$id = $_POST['id'];
		//$state = $_POST['status'];
		$canType = isset($_POST['canType'])?$_POST['canType']:'-1';
		$fileId = isset($_POST['fileId'])?$_POST['fileId']:'0';
		$proxy = $this->exec("getProxy", "informationPublish");
		$params["userId"] = $userId;
		$params["ip"] = $ip;
		$params["boardId"] = $boardId;
		$params["topicId"] = $id;
		//$params["permission"] = $state;
		$params["fileId"] = $fileId;
		$params["canType"] = $canType;
		$res = $proxy->updateTopicStatus(json_encode($params));
		echo $res;
	}
	// 上传图片
	public function UploadImg()
	{
		
		$public_path = $this->exec('getPublicPath');	// files/escloudapp
		$uploadUrl = $public_path.'/images/';			// files/escloudapp/images/
		if(!file_exists($uploadUrl)){
			mkdir($uploadUrl);
			chmod($uploadUrl, 0777);
		}
		
		$dateTime = date("Ym");	// 时间 201212
		$fileToUpload = $_FILES['fileToUpload'];	// 上传文件信息
		$name = $fileToUpload['name'];				// 上传文件目录
		$cache_path = $fileToUpload['tmp_name'];	// 上传文件临时位置
		
		// /aa/aa/images/201212
		$final_path = $uploadUrl.$dateTime;	// files/escloudapp/images/201212
		if(!file_exists($final_path)){
			mkdir($final_path);
			chmod($final_path, 0777);
		}
		
		$file_name = $final_path.'/'.$name;	// files/escloudapp/images/201212/a.jpg
		
		$logfilepath = $uploadUrl.'/'.date("Ym").'.list';	// 写数据文件路径
		move_uploaded_file($cache_path, $file_name);
	}

	
	public function uploadImages()
	{
		echo json_encode($this->uploadImage(300, 300));
	}

	public function index()
	{
		return $this->renderTemplate(array ('status' => 1));
	}
	
	// 筛选表单渲染
	public function public_filter()
	{
		$tpl = $_GET['tpl'];
		$options = array(
				'title'=> '标题',
				'authorId'=> '发布人',
				'createTime'=> '发布时间',
				'status'=> '状态',
				'appStatus'=> '手机APP-状态'
		);
		return $this->renderTemplate(array('options'=>$options));
	}
	
	/**
	 * 获取文件下载地址
	 * @author fangjixiang 20130118
	 * @param module 业务功能:publish信息发布 research编研
	 * @param company 机构ID
	 * @param clientIp *
	 * @param addressMark 服务器文件地址标识(fileId.fileType)
	 * @return
	 */
	public function GetFileUrl()
	{
		
		$param = array('id'=>$_POST['fileId']);
		$mark = $_POST['mark'];
		$mainSite = strtoupper($_POST['mainSite']);

		if(isset($_POST['index']))$param['toUpdateTimes'] = 'true';
		$proxy = $this->exec("getProxy", "escloud_fileoperationws");
		$addr = $proxy->getFileUrl('publish',$mainSite,'*',$mark,json_encode($param));
		echo $addr;
	}
	
	/*
	 * 上传图片,每次一张
	 * create_author fangjixiang
	 * create_time 20130329
	 * $config = array([3, 'jpeg,png,gif,bmp']);
	 * 
	 */
	public function insertImg($config = array())
	{
		
		$data = array('err'=>'null', 'title'=>'null', 'url'=>'null'); // init
		
		$date = getdate();
		$year = $date['year'];
		$mon = $date['mon'];
		$mon = strlen($mon) == 1 ? '0'.$mon : $mon;
		
		//print_r($date); die;
		$publicDir = $this->exec("getPublicPath"); //上传根路径 files/escloudapp
		$dir = $publicDir.'/'.$year.'/'.$mon;
		
		//$data['err'] = '创建目录（'.$dir.'）失败';
		//return json_encode($data);
		
		if(!is_dir($dir)){
			
			if(!mkdir($dir, 0777, true)){
				$data['err'] = '创建目录（'.$dir.'）失败';
				return json_encode($data);
			}
			
		}
		
		if(!isset($config['size'])){
		
			$config['size'] = '3'; // max upload image size 3M
		}
		
		if(!isset($config['type'])){
		
			$config['type'] = 'jpg,png,bmp,gif,jpeg'; // upload image type
		
		}
		
		$sizeAllowed = $typeAllowed = $errorAllowed = false; // 大小,类型,错误默认不允许
		$size = $_FILES['insertImgFile']['size']; // 201212
		// $type = $_FILES['insertImgFile']['type']; // image/png...
		$error = $_FILES['insertImgFile']['error']; // wal.jpg
		$name = explode('.', $_FILES['insertImgFile']['name']); // ['wal','jpg']
		$tmp_url = $_FILES['insertImgFile']['tmp_name']; // C:\Windows\php5601.tmp
		
		
		$mict = microtime();
		$second = explode(' ',$mict); // ['0.12312312','123123123']
		$msec = explode('.',$second[0]); // ['0','12312312']
		$rand = rand(1,1000);
		$msec = $second[1].$msec[1].$rand;  // 12312312312312312943
		
		$title = $name[0];
		$url = $dir.'/'.$msec.'.'.$name[1];
		
		// 验证上传图片大小是否在限制范围内
		$allowed_size = $config['size']*1024*1024;
		if($size > 0 && $size <= $allowed_size){
			$sizeAllowed = true;
		}
		
		// 验证上传图片类型是否在限制范围内
		$allowed_type = explode(',',$config['type']); // "jpg,png,bmp,gif,jpeg"
		foreach( $allowed_type as $type )
		{
		
			if( $type === $name[1] ){
			
				$typeAllowed = true;
				break;
			}
		
		}
		
		if($error == 0){
			
			$errorAllowed = true;
			
		}
		
		// 上传图片
		if( $sizeAllowed && $typeAllowed && $errorAllowed ){
		
			$msg = move_uploaded_file($tmp_url, $url) ? 'normal' : '移动文件错误';
			$err = $msg;
			
		}else{ // 抛错误
		
			if(!$errorAllowed){
				switch($error) {   
				    case 1: $err = "文件大小超出了服务器的空间大小"; break;  
					case 2: $err = "要上传的文件大小超出浏览器限制"; break;
				    case 3: $err = "文件仅部分被上传"; break;
				    case 4: $err = "没有找到要上传的文件";  break;
				    case 5: $err = "服务器临时文件夹丢失"; break;
				    case 6: $err = "文件写入到临时文件夹出错"; break;
				    default: $err = "未知错误"; break;
				}
			}else if(!$sizeAllowed){
			
				$err = '上传图片超过规定大小';
			
			}else if(!$typeAllowed){
			
				$err = '上传图片类型不是合法类型';
			
			}
		
		}
		
		 
		$data['err'] = $err;
		$data['title'] = $title;
		$data['url'] = $err == 'normal' ? '/'.$url : 'null';
		
		return json_encode($data);
	
	}
	
	
	
//-------文控新闻动态---------------
	public  function news_index(){
	
		$page = isset($_GET['page']) ? $_GET['page'] : 1;
		$limit = isset($_GET['limit']) ? $_GET['limit'] : 20;
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
			$list .= '<li class="noborder"><u>无数据</u></li>';
		}else{ // start else 0
			foreach ($lists->items as $li => $row){
				$li = ($page - 1) * $limit+$li+1;
				$p = $row->boardId.'&'.$row->id;
				$len = strlen($row->title);
				if ($len > 35) {
					$showTitle = $this->cut_str($row->title, 35);
				} else {
					$showTitle = $row->title;
				}
				$list .= '<li><div class="c1"><a href="javascript:void(0)" class="details" info="'. $p .'" title= "'.$row->title.'">'. $li .'.&nbsp;'. $showTitle .'</a></div><div class="c2">'.$row->authorId .'</div><div class="c3">'. $row->createTime .'</div></li>';
			}
			// 分页按钮处理
			$pagecount = ceil($total/$limit); // 总页数
			$btn .= "<li><a href='javascript:void(0)' id='1' class='pagenow'>1</a></li>";
			if($pagecount <= 10){ // '1,2,3,4,5,6,7,8,9' 按钮
				for($l=2; $l<=$pagecount; $l++){
					$btn .= "<li><a href='javascript:void(0)' id='". $l ."'>". $l ."</a></li>";
				}
			}else{ // 最多显示10个按钮 1,2,3,4,5,6,7,8...10
				for($l=2; $l<9; $l++){
					$btn .= "<li><a href='javascript:void(0)' id='". $l ."'>". $l ."</a></li>";
				}
				$btn .= "<li><span id='null' class='dotted'>...</span></li><li><a href='javascript:void(0)' id='". $pagecount ."'>". $pagecount ."</a></li>";
			}
		} // end else 0
		$info['boardCn'] = $boardCn[$boardId-1];
		$info['boardId'] = $boardId;
		$info['total'] = $total;
	
		$data['info'] = $info;
		$data['list'] = $list;
		$data['btn'] = $btn;
		return $this->renderTemplate($data);
	}
	
	/**
	 * 截取PHP字符串
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
	/**
	 * 渲染模板并生成详细htm
	 * @author longjunhao 20140812
	 * @return string
	 */
	public function detail_paper() {
		$boardId = $_GET['boardId'];
		$topicId = $_GET['topicId'];
		$boardCn = array('文控新闻','文控公告','文控其他'); // 不包括'我的待办'
		$info['boardCn'] = $boardCn[$boardId-1];
		$info['boardId'] = $boardId;
		$info['topicId'] = $topicId;
	
		$proxy = $this->exec("getProxy", "informationPublish");
		$userId = $this->getUser()->getId();
	
		$param = array(
				'boardId'=>$boardId,
				'topicId'=>$topicId,
				'accessType'=>'2',
				'userId'=>$userId
		);
	
		$lists = $proxy->getPublishTopic(json_encode($param));
	
		$data['info'] = $info;
		$data['data'] = $lists;
	
		return $this->renderTemplate($data);
	}
	public function GetPublishTopicHTML() {
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['limit']) ? $_POST['limit'] : 20;
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
		$total = $lists->total; // 总信息数
		if(!$total){
			echo '<li class="noborder"><u>无数据</u></li>';
			return -1;
		}
		$list = '';
		foreach ($lists->items as $li => $row){
			$li = ($page - 1) * $limit+$li+1;
			$p = $row->boardId.'&'.$row->id;
			$list .= '<li><div class="c1"><a href="javascript:void(0)" class="details" info="'. $p .'">'. $li .'.&nbsp;'. $row->title .'</a></div><div class="c2">'.$row->authorId .'</div><div class="c3">'. $row->createTime .'</div></li>';
		}
		echo $list;
	}
}