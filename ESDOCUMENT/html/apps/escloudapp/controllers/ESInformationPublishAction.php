<?php
/*
 * author # fangjixiang
 * date # 20121031
 */
class ESInformationPublishAction extends ESActionBase
{
	
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
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$result = $proxy->selectAllInfoPublish(1,50);
		$NavList[] = array('id'=>-1, 'pId'=>0, 'name'=>'栏目列表', 'open'=>true);
		foreach ($result as $value)
		{
			$NavList[] = array('id'=>$value->id, 'pId'=>-1, 'name'=>$value->name, 'open'=>true,'type'=>$value->boardType);
		}
		//print_r($NavList); die;
		echo json_encode($NavList);
	}
	
	// 添加栏目@未用到@20130407
	public function AddInfoPublish()
	{
		
		$keyWords = $_GET['keyWords'];
		
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$is_ok = $proxy->checkPublishName($keyWords);	// 验证栏目唯一性
// 		echo $is_ok; die();
		if($is_ok){	// 为真时数据库有该栏目不能添加
			echo 'already';
		}else{	// 为假可以添加栏目
			
			$userinfo = $this->GetUserInfo();
			$params['title'] = $keyWords;
			$params['author'] = $userinfo['userId'];
			
			//print_r($_POST); die();
			
			$proxy = $this->exec("getProxy", "escloud_publishws");
			$result = $proxy->addInfoPublish(json_encode(array($params)));
			echo $result ? 'addOk' : 'addErr';	// 访返回值和修改栏目返回值在JS共用一个方法
			
		}	
	}
	
	// 修改栏目@未用到@20130407
	public function UpdateInfoPublish()
	{
		$userinfo = $this->GetUserInfo();
		$params['author'] = $userinfo['userId'];
		
		$params['title'] = $_GET['keyWords'];
		$params['id'] = $_GET['id'];
		
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$result = $proxy->updateInfoPublish(json_encode(array($params)));
		echo $result ? 'modOk' : 'modErr';
	}
	
	// 删除栏目@未用到@20130407
	public function DeleteInfoPublish()
	{
		$ids = array($_GET['ids']);
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$result = $proxy->deleteInfoPublish(json_encode($ids));
		echo $result;
	}

	/*
	 * 获取某个栏目下所有信息(后台)
	 * 筛选
	 * 方吉祥
	 * 201303015
	 */
	public function GetPublishTopicList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$condition = $_POST['query'] ? explode('@', $_POST['query']) : array();
		$info = $this->GetUserInfo();
// 		array_unshift($condition);
		$id  = intval($_GET['id']);
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$userId = $this->getUser()->getId();
		$params = array( 
				'status'=> '-1',
				'userId'=>$userId,
				'condition'=> $condition,
				'accessType'=>'2'
			);
		
		//print_r($params); die;
		$result = $proxy->getPublishTopicList($id,$page,$rp,json_encode($params));
		//print_r($result); die;
		$jsonData = array('page'=>$page,'total'=>$result->total,'rows'=>array());
		if(!$result->total){
			echo json_encode($jsonData);
			return;
		}
		foreach ( $result->items as $line => $value)
		{
					
			$status = $value->status == 0 ? '未发布' : '已发布';
			$appStauts = $value->appStatus== 0 ? '未发布' : '已发布';
			switch ($value->process){
				case '-1' : $process = '未提交'; break;
				case '0' : $process = '审批中'; break;
				case '1' : $process = '已完成' ; break;
				case '2' : $process = '退回' ; break;
			}
			
			$entry= array('id'=>$value->topicId,
				'cell'=>array(
						'linenumber' => $line+1,
						'checkbox' => "<input type='checkbox' name='inputsA' process='".$value->process."' id='".$value->topicId."' />",
						'editcontent' => "<span class='editbtn' id='".$value->topicId."' process='".$value->process."'></span>",
						'title' => $value->title,
						'author' => $value->authorName,
						'createTime' => $value->createTime,
						'status' => $status,
						'appStatus' => $appStauts
				),
			);
			$jsonData['rows'][] = $entry;
		}
		//print_r($jsonData); die;
		echo json_encode($jsonData);
	}
	
	
	/*
	 * @author wangtao
	 * @date 20130304
	 * @根据栏目名称和栏目下文章ID查询详细信息(修改回流)
	 * @return mixed
	 */ 
	public function GetPublishTopic()
	{
		$topicId = $_GET['topicId'];
		$boardId = $_GET['boardId'];
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$userId = $this->getUser()->getId();
		$param=json_encode(array('accessType'=>'2','userId'=>$userId));
		$result = $proxy->getPublishTopic($boardId,$topicId,$param);
		//print_r($result); die;
		echo json_encode($result);
	}
	
	/*
	 * 添加档案规范数据
	 * 根据isStartProcess判断是否开始流程
	 * 方吉祥
	 */
	public function savePublishTopicAndStartProcess()
	{
	
		$param = $_POST;
		//print_r($_POST);die;
		$boardId = $param['boardId'];
		$isStartProcess = $param['isStartProcess'];
		unset($param['boardId']);
		unset($param['isStartProcess']);
		$userId = $this->getUser()->getId();
		$param['userId'] = $userId; 
		$proxy = $this->exec("getProxy", "escloud_publishws");
		//print_r($param); die;
		$map = $proxy->savePublishTopic($boardId,json_encode($param)); // {'flag':true, 'topicId':123}
		//print_r($map); die;
		if($map->flag){
			if($isStartProcess == 'true'){
				$status = $param['status']; // 是否发布
				$topicId = $map->topicId; // 表单Id
				$leaderId = $_POST['leader'];
				$processDefinitionKey = 'publishProcess';
				$businessKey = 'escloudPublish'.microtime(true)*10000;
				$startProcess = $proxy->startInfoPublishFlow($processDefinitionKey,$businessKey,$userId,$topicId,$status,$leaderId);
				//print_r($startProcess); die;
				echo $startProcess ? 'startProcessOk' : 'startProcessErr';
				return;
			}
			
			echo 'saveOk';
			if(isset($param['picSrc'])){
				$picSrcs = explode(',',$param['picSrc']);
				foreach ($picSrcs as $row){
					$filePath = $_SERVER['DOCUMENT_ROOT'].$row;
					$res = unlink($filePath);
					$str=explode('.',$row);
					$file1 = substr($row,1,count($row)-11).'.'.$str[count($str)-1];
					$filePath = $_SERVER['DOCUMENT_ROOT'].$file1;
					$res = unlink($filePath);
				}
			}
			return;
		}else{
			echo 'saveErr';
		}
		
	}
	
	// 删除栏目下文章信息
	public function DeletePublishTopic()
	{
		$boardId = intval($_POST['boardId']);
		$ids = explode(',',$_POST['ids']);
		$ids = json_encode(array('topicIdList'=>$ids));
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$result = $proxy->deletePublishTopic($boardId,$ids);
		echo $result;
	}
	
	// 修改状态(是否发布)
	public function ModifyStatus()
	{
		$boardId = $_POST['boardId'];
		$topicId = $_POST['topicId'];
		$permission = $_POST['permission'];
		$proxy = $this->exec("getProxy", "escloud_publishws");
		echo $proxy->modifyStatus($boardId, $topicId, $permission);
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
	
	public function UploadFile()
	{
		$proxy = $this->exec("getProxy", "escloud_publishws");
		echo $proxy->uploadFile();
	}

	// 修改时删除附件
	public function DeleteFile()
	{
		$id = $_POST['fileId'];
		$proxy1 = $this->exec("getProxy", "escloud_publishws");
		$res = $proxy1->deletePublishFileById($id);
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
	/**
	 * shimiao 20140702 上传文件
	 */
	public function uploadImgNew(){
		
	}
	
	// 获取图片列表
	public function GetPictureList()
	{
		
		$year = isset($_GET['year']) ? $_GET['year'] : date("Y");	// 判断
		$month = isset($_GET['month']) ? $_GET['month'] : date("m");
		
		$public_path = $this->exec('getPublicPath');	// files/escloudapp
		$uploadUrl = $public_path.'/images/';			// files/escloudapp/images/
		
		$final_path = $uploadUrl.$year.$month;			// files/escloudapp/images/201212
		
		// 
		if(!file_exists($uploadUrl)){
			mkdir($uploadUrl);
			chmod($uploadUrl,0777);
		}
		// 
		if(!file_exists($final_path)){
			mkdir($final_path);
			chmod($final_path,0777);
		}
		
		// 遍历目录
		$dirlist = scandir($final_path,1);
		$imginfo = array('path' => '','name' => '');	// init
		$name_list = array();	// init
		foreach ($dirlist as $filename)
		{
			if($filename=='.' || $filename == '..'){
				continue;
			}
			
			$name_list[] = $filename;
			
		}
		
		$imginfo = array('path' => $final_path,'names' => $name_list);
		echo json_encode($imginfo);
	}
	
	
	// 获取列表#未用到20130315
	public function GetYearMonth()
	{
		$ym = '{"year":"12","month":"qw"}';
		echo json_decode($ym);
	}
	/**
	 * @author wangtao
	 * 未用到20130315
	 */
	public function getInformation()
	{
		/*
		 * 根据btype属性判断是发布文章还是上传附件或图片
		 * 值 1 ：表示发布文章
		 * 值 2 ：表示上传附件或图片
		 */
		$btype=intval($_GET['btype']);
		$params=array();
		if($btype == 1){
			return $this->renderTemplate($params,'ESInformationPublish/articlesinfo');
		}elseif ($btype == 2){
			return $this->renderTemplate($params,'ESInformationPublish/attachmentsinfo');
		}elseif ($btype ==3){
			return $this->renderTemplate($params,'ESInformationPublish/imagesinfo');
		}else{
			return '不存在对应的模型';
		}
		
	}
	// author wangtao保存添加栏目@未用到@20130407
	public function saveBoards()
	{
		//$boardName=$_POST['boardname'];
		//$boardmodel=$_POST['boardmodel'];
		print_r(rawurldecode($_POST['con']));
		//$proxy = $this->exec("getProxy", "escloud_publishws");
		//$proxy->addInfoPublish(json_encode(array()));
	}
	/**
	 * @author wangtao
	 * 图说档案中上传图片
	 * @date 20130225
	 * @return mixed
	 */
	public function uploadImages()
	{
		echo json_encode($this->uploadImage(300, 300));
	}
	
	/*
	 * 渲染模块
	 * 
	 */
	public function index()
	{
		/*
		$userId = $this->getUser()->getId();
		$userInfo = $this->GetUserInfo($userId);
		$isGroup = $userInfo['mainSite'] == 'HQ' ? true : false;
		$data = array(
					'isGroup' => $isGroup
				);
		*/
		return $this->renderTemplate();
	}
	
	// 筛选表单渲染
	public function public_filter()
	{
		$tpl = $_GET['tpl'];
		//20140924 xiewenda 修改authorId 为authorName
		$options = array(
				'title'=> '标题',
				'authorName'=> '发布人',
				'createTime'=> '发布时间',
				'status'=> '状态'
		);
		//$template = array('tpl'=>$tpl);
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
		
		//$config = array('path','size','type');
		//print_r($_FILES);
		//die;
		
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
	
	/**
	 * 查找部门的领导
	 * @author fangjixiang 20130726
	 * @param userId
	 * @return
	 */
	public function findLeaderByuserId()
	{
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$mapInfo = $proxy->findLeaderByuserId($userId);
		
		if(!count($mapInfo)){
			echo 'false';
			return;
		}else if(count($mapInfo)==1){
			echo 'onlyone'.$mapInfo[0]->userId;
			return;
		}
		$htm = '<form id="check_approval_list"><ul style="width:300px; height:120px; float:left;">';
		
		foreach($mapInfo as $info)
		{
			$checked = count($mapInfo) === 1 ? 'checked="checked"' : '';
			$htm .= '<li style="width:100px; height:30px; float:left;"><label style="float:left;" for="'. $info->userId .'"><input style="vertical-align:middle;margin-right:5px;"'. $checked .' name="check_approval" type="radio" id="'. $info->userId .'" /><span style="width:80px; line-height:30px; font-size:13px; font-family:微软雅黑,黑体,arial;">'. $info->userDisplayName .'</span></label></li>';
			
		}
		
		echo $htm.'</ul></form>';
	}
	
	public function updateTopicStatus(){
		$boardId = $_POST['boardId'];
		$id = $_POST['id'];
		$state = $_POST['status'];
		$canType = isset($_POST['canType'])?$_POST['canType']:'false';
		$fileId = isset($_POST['fileId'])?$_POST['fileId']:'0';
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$params["boardId"] = $boardId;
		$params["topicId"] = $id;
		$params["permission"] = $state;
		$params["fileId"] = $fileId;
		$params["canType"] = $canType.'';
		$res = $proxy->updateTopicStatus(json_encode($params));
		echo $res;
	}
	public function downFile(){
		$mark = $_POST['mark'];
		$fileId = isset($_POST['fileId'])?$_POST['fileId']:''; 
		$b=pathinfo($mark);
		//getFileDownLoadUrl
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$res = $proxy->getFileDownLoadUrl($b['filename']);
		// longjunhao 20140815 更新文件下载次数
		if($fileId != ''){
			$proxy = $this->exec("getProxy", "escloud_publishws");
			$proxy->updateFileDownloadTimes($fileId);
		}
		echo $res;
	}
	/*
	 * shimiao 20140812 删除文件
	 */
	public function deletePics(){
		$file = substr($_POST['filePath'],1);
		$file = str_replace("\\","/",$file);
		$filePath = $_SERVER['DOCUMENT_ROOT'].'/'.$file;
		$res = unlink($filePath);
		$str=explode('.',$file);
		$file1 = substr($_POST['filePath'],1,count($_POST['filePath'])-11).'.'.$str[count($str)-1];
		$filePath = $_SERVER['DOCUMENT_ROOT'].'/'.$file1;
		$res = unlink($filePath);
		echo  'true';
	}
	
}