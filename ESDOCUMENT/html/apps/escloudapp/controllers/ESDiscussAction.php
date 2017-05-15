<?php
/**
 * 交流园地
 * 2013-04-27
 */
class ESDiscussAction extends ESActionBase
{
	
	public function index()
	{
		
		$userId=$this->getUser()->getId();
		$start=0;
		$limit=10;
		$condition=new stdClass();
		$condition->itemId='0';
		$result=$this->exec('getProxy','escloud_discussws')->getTopicList($start,$limit,json_encode($condition));
		return $this->renderTemplate(array('result'=>$result,'userId'=>$userId));
		
	}
	/**
	 * 获取信息列表
	 * Enter description here ...
	 */
	public function getTopicList()
	{
		$start=isset($_POST['start'])?$_POST['start']:0;
		$limit=isset($_POST['limit'])?$_POST['limit']:0;
		$condition=new stdClass();
		$userId=$this->getUser()->getId();
		$condition->itemId=isset($_POST['itemId'])?$_POST['itemId']:'0';
		$result=$this->exec('getProxy','escloud_discussws')->getTopicList($start,$limit,json_encode($condition));
		if(count($result)>0){
			$msg='';
			foreach ($result as $val){
			 	$rep='<img src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/$1.gif >';
				$content = preg_replace('/\[([a-zA-Z]+?)\]/i',$rep,$val->msg);
				$msg.="<ul class='messages'>";
					$msg.="<li class='face'>";
					$msg.="<a href='javascript:;'>";
					$msg.="<img src='/apps/escloudapp/templates/ESDiscuss/img/face.gif' title='' alt='头像' /></a>";
					$msg.="</li>";
					$msg.="<li class='message-box'>";
					$msg.="<div class='message'>";
					$msg.="<h2 class='title'>".$val->authorName."</h2>";
					$msg.="<div class='text'>";
					if(isset($val->img_list) > 0){//判断是否存在图片
						for($i=0;$i<count($val->img_list);$i++){
							$msg.="<img width=100 height=75 class='imgzoom' title='点击放大' src=".$val->img_list[$i].">";
						}
					}
					$msg.=$content;
					$msg.="</div><div class='info'>";
					$msg.="<a class='re-buttons' id=".$val->id." href='javascript:void(0);'>评论</a>";
					$msg.='<span>|</span><a href="javascript:void(0);" class="del-item" itemid='.$val->id.'>删除</a>';
						
					$msg.="<i>".$this->formateDate($val->createTime)."</i>";
					$msg.="</div><ul class='replys'></ul>";
					$msg.="</div>";
					$msg.="</li>";
					$msg.="</ul>";
			
			}
			echo $msg;
		}
	}
	/**
	 * 获取评论列表
	 * @author wangtao
	 * 2013-05-09
	 */
	public function getReplyList()
	{
		
		$start=isset($_POST['start'])?$_POST['start']:0;
		$limit=isset($_POST['limit'])?$_POST['limit']:0;
		$condition=new stdClass();
		$userId=$this->getUser()->getId();
		$condition->itemId=isset($_POST['itemId'])?$_POST['itemId']:'0';
		$result=$this->exec('getProxy','escloud_discussws')->getTopicList($start,$limit,json_encode($condition));
		if(count($result)>0){
			$msg='';
			foreach ($result as $val){
				$rep='<img src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/$1.gif >';
				$content = htmlspecialchars_decode(preg_replace('/\[([a-zA-Z]+?)\]/i',$rep,$val->replyContent));
				$msg.="<ul class='replys'>";
				$msg.="<li>";
				//$msg.="<h2 class='re-title'>@邢元：</h2>";
				$msg.="</li>";
				$msg.="<li class='re-text'>".$content;
				$msg.="</li>";
				$msg.="<li class='re-info'>";
				$msg.="<a href='javascript:;' class='re-buttons' id=".$val->msgId.">回复</a>";
				if($val->replyerId==$userId){//如果评论是当前用户则有删除权限
					$msg.="<span>|</span>";
					$msg.="<a href='javascript:void()' id=".$val->msgId." class='del_reply' args=".$val->id.">删除</a>";
				}
				$msg.="<u>".$val->replyerName."</u>";
				$msg.="<i>".$this->formateDate($val->replyTime)."</i>";
				$msg.="</li>";
				$msg.="</ul>";
			
			}
			echo $msg;
		}
		
	}
	/**
	 * 获取表情,生成json
	 * 2013-04-27
	 */
	public function getImageList()
	{
		$dirName = isset($_GET['dirName'])?$_GET['dirName']:'miniblog';
		$xmlName=__DIR__.'/'.$dirName.'.xml';
		$imgDir = ESCLOUDAPP_PATH.'/templates/ESDiscuss/img/'.$dirName.'/';
		if (is_dir($imgDir) && is_readable($imgDir)){
			$handel=@opendir($imgDir);
			if($handel){
				$i=0;
				$arr=$array=array();
				while ($fileName=readdir($handel)){
					if($fileName=='.' || $fileName =='..' || $fileName=='.svn'){//判断是否是特殊文件
						continue;
					}
					$array[] = str_replace('.gif','',$fileName);
				}
				sort($array);
				// foreach($array as $k=>$v) {
					// $arr[$i]['ShortCut']=$v;
					// $arr[$i]['Meaning']=$v;
					// $arr[$i]['OriginalFile']=$v.'.gif';
					// $arr[$i]['FixedFile']=$v.'.gif';
					// $i++;
				// }
				// unset($i);
				// var_dump($arr);
				echo json_encode($array);
			}
			
		}
	}
	/**
	 * @author wangtao
	 * 保存发布的内容
	 * 2013-05-02
	 * 
	 */
	public function saveTopic()
	{
		$userId=$this->getUser()->getId();
		$userInfo=$this->getUser()->getInfo();
		$userName=$userInfo['userName'];
		$ip =$this->getClientIp();
		
		$user = $this->exec('getProxy','user')->getUserInfo($userId);
		$content=isset($_POST['content'])?$_POST['content']:'';
		if(empty($content))exit();
		$content=htmlspecialchars($content);//去除特殊字符
		$arr=array(
			'authorId'=>$userId,
			'authorName'=>$user->displayName,
			'itemInfo'=>$content,
			'createTime'=>date('Y-m-d H:i:s',time()),
			'img_list'=>isset($_POST['imgList'])?$_POST['imgList']:array(),
			'remoteAddr'=>$ip,
			'userName'=>$userName,
			'userId'=>$userId
		);
		$params=json_encode($arr);
		$result=$this->exec('getProxy','escloud_discussws')->saveTopic($params);
		if($result->result=='succeed'){
			$arr['result']=$result->result;
			$arr['itemId']=$result->itemId;
			$arr['createTime']=$arr['createTime']=$this->formateDate($arr['createTime']);
			echo json_encode($arr);
		}else{
			echo json_encode($result);
		}
		
		
	}
	/**
	 * wangtao
	 * 2013-05-08
	 * 添加回复内容
	 */
	public function saveReply()
	{
		$userId=$this->getUser()->getId();
		$user = $this->exec('getProxy','user')->getUserInfo($userId);
		$content=isset($_POST['content'])?$_POST['content']:'';
		$itemId=isset($_POST['itemId'])?$_POST['itemId']:0;
		if(empty($content))exit();
		$content=htmlspecialchars($content);//去除特殊字符
		$ip =$this->getClientIp();
		$arr=array(
			'replyerId'=>$userId,
			'replyerName'=>$user->displayName,
			'replyContent'=>$content,
			'replyTime'=>date('Y-m-d H:i:s',time()),
			'remoteAddr'=>$ip,
				
		);
		$params=json_encode($arr);
		$result=$this->exec('getProxy','escloud_discussws')->addReplyItem($itemId,$params);
		if($result->result=='succeed'){
			$arr['result']=$result->result;
			$arr['replyId']=$result->replyId;
			$arr['itemId']=$itemId;
			$arr['replyTime']=$this->formateDate($arr['replyTime']);
			echo json_encode($arr);
		}else{
			echo json_encode($result);
		}
	}
	public function imagesUpload()
	{
		// 		$maxSize=ini_get("upload_max_filesize");
		// 		$error_code=$_FILES['file_txt']['error'];//上传错误代码
		// 		$content=null;
		// 		$flag=false;
		// 		if($error_code===UPLOAD_ERR_OK){
		// 			$fileName=$_FILES['file_txt']['name'];//上传文件名称
		// 			$fname = explode('.', $fileName); // @author:fangjixiang
		// 			$fileInfo = pathinfo($fileName);
		// 			$extension = strtolower($fileInfo['extension']);
		// 			$randNum = mt_rand(10,99);
		// 			$imageName=date('YmdHis').$randNum.'.'.$extension;
		// 			$tempPath=$_FILES['file_txt']['tmp_name'];//上传临时文件路径
		// 			$filePath=$this->exec("getPublicPath");//上传根路径
		// 			if(!is_dir($filePath)){
		// 				mkdir($filePath);
		// 			}
		// 			$today = getdate();
		// 			$targetDir=$filePath.'/'.$today['year'];
		// 			if(!is_dir($targetDir)){
		// 				mkdir($targetDir);
		// 			}
		// 			if(strlen($today['mon'])==1){
		// 				$today['mon']='0'.$today['mon'];
		// 			}
		// 			if(!is_dir($targetDir.'/'.$today['mon'])){
		// 				mkdir($targetDir.'/'.$today['mon']);
		// 			}
		// 			$dir=$targetDir.'/'.$today['mon'];
		// 			$targetPath=$dir.'/'.$imageName;//目标目录
		// 			if(move_uploaded_file($tempPath,$targetPath)){
		// 				$image= new ESImage($targetPath, 100, 100, $fname[0]);
		// 				$flag=true;
		// 				$content= $image->thumbSize();
		// 			}
		// 		}else{
		// 			$flag=false;
		// 			$content= '对不起，您上传的照片超过了'.$maxSize;
		// 		}
		// 	   echo json_encode(array('result'=>$flag,'content'=>$content));

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

			$config['size'] = ini_get("upload_max_filesize"); // max upload image size 3M
		}

		if(!isset($config['type'])){

			$config['type'] = 'jpeg,png,gif,bmp,jpg'; // upload image type

		}

		$sizeAllowed = $typeAllowed = $errorAllowed = false; // 大小,类型,错误默认不允许
		$size = $_FILES['file_txt']['size']; // 201212
		// $type = $_FILES['file_txt']['type']; // image/png...
		$error = $_FILES['file_txt']['error']; // wal.jpg
		$name = explode('.', $_FILES['file_txt']['name']); // ['wal','jpg']
		$tmp_url = $_FILES['file_txt']['tmp_name']; // C:\Windows\php5601.tmp


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

			if( $type === strtolower($name[1]) ){

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
		echo json_encode($data);

	}
	/**
	 * 
	 * 格式化时间.格式为 05月08日 14:34 or 2013年05月08日 14:34 
	 * @param unknown_type $date
	 */
	private function formateDate($date)
	{
		$format = 'Y-m-d H:i:s';
		$year=date('Y年',time());
		$date = DateTime::createFromFormat($format, $date);
		return str_replace("$year", '', $date->format('Y年m月d日 H:i'));
	}
	public function delItems()
	{
		$id=$_GET['id']?$_GET['id']:'';
		if(!$id)return ;
		$user=$this->getUser();
		$ip =$this->getClientIp();
		$userId=$user->getId();
		$userInfo=$user->getInfo();
		$userName=$userInfo['userName'];
		$arr=array(
				'userId'=>$userId,
				'userName'=>$userName,
				'remoteAddr'=>$ip,
				'id'=>$id
		);
		
		$result=$this->exec('getProxy','escloud_discussws')->delTopicItem(json_encode($arr));
		echo $result;
	}
	public function delReply()
	{
		$id=$_GET['id']?$_GET['id']:'';
		if(!$id)return ;
		$user=$this->getUser();
		$ip =$this->getClientIp();
		$userId=$user->getId();
		$userInfo=$user->getInfo();
		$userName=$userInfo['userName'];
		$arr=array(
				'userId'=>$userId,
				'userName'=>$userName,
				'remoteAddr'=>$ip,
				'id'=>$id
		);
		$result=$this->exec('getProxy','escloud_discussws')->delReply(json_encode($arr));
		echo $result;
	}
	
	/**
	 * author:niyang
	 * des:二位数组排序
	 */
	private function array_sort($arr,$keys,$type='asc'){
		$keysvalue = $new_array = array();
		foreach ($arr as $k=>$v) {
			$keysvalue[$k] = $v[$keys];
		}
		if($type == 'asc'){
			asort($keysvalue);
		} else {
			arsort($keysvalue);
		}
		reset($keysvalue);
		foreach ($keysvalue as $k=>$v) {
			$new_array[$k] = $arr[$k];
		}
		return $new_array;
	}
}