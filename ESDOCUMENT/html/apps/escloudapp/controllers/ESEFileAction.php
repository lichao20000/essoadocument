<?php
/**
 *
 * @author ldm
 * @Date 20120824
 */
class ESEFileAction extends ESActionBase{
	/**
	 * 电子文件中心
	 * @see ESActionBase::index()
	 * @author ldm
	 * 首页显示数据
	 */
	public  function index(){
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$lists = $proxy->getlist($this->getUser()->getBigOrgId());//liqiubo 20140618 支持saas 加入bigOrgId进行查询
	//	var_dump($lists);return ;
		if($lists==null){
			return $this->renderTemplate();
			return;
		}
		return $this->renderTemplate(array('list'=>$lists));
	}
	/**
	 * 电子文件中心，ajax请求子页面
	 * @author ldm
	 */
	public function access(){
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$id = isset($_POST['param'])?$_POST['param']:0;
		$lists = $proxy->getSubFolder($id,$this->getUser()->getBigOrgId());//liqiubo 20140618 支持saas 加入bigOrgId进行查询
		if($lists==null){
			echo json_encode(0);
			return;
		}
		foreach ($lists as $node) {
			$node->iconSkin = 'folder';
		}
		echo json_encode($lists);
	}
	/**
	 * //新建文件夹
	 * @author ldm
	 * 当前页面下新建并显示
	 */
	
	public function do_add(){
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$data = $_POST['data'];
		$id= $_POST['id'];
		$esViewTitle= $_POST['esViewTitle'];
		parse_str($data,$output);
		$param=array('estitle'=>$output['create'],'esViewTitle'=>$esViewTitle);//liqiubo 20140618 加入saas支持
		$param = json_encode($param);
		$add = $proxy->addSubFolder($id,$param);
		echo json_encode($add);
		
	}
	/**
	 * 根据parentid获得上一级信息
	 * @author ldm
	 */
	public function getup(){
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$id = $_POST['param'];
		$now = $proxy->getNowFolder($id);
		$pid = $now->parentid;
		$lists = $proxy->getSubFolder($pid,$this->getUser()->getBigOrgId());//liqiubo 20140618 加入saas支持
		if($lists==null){
			echo json_encode('0');
			return;
		}
		echo json_encode($lists);
	}
	
	/**
	 * 获取指定文件夹下的文件列表
	 * @author dengguoqi
	 * @param unknown_type $forderId
	 */
	public function getFileList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 50;
		//$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		//$query = isset($_POST['query']) ? $_POST['query'] : false;
		//$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		
		$folderId = isset($_GET['folderid'])?$_GET['folderid']:0;
		$keyword = isset($_GET['keyword'])?$_GET['keyword']:false;
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$files = $proxy->selectFileByFolderId($folderId, $page, $rp, $keyword);
		$total = $proxy->getFileCountByFolderId($folderId);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($files as $i=>$value)
		{
			$file = $value->id;
			$file->createTime = date('Y-m-d H:m:s',$file->createTime/1000);
			$entry= array(
					'id'=>$file->originalId,
					'cell'=>array_merge(array(
							'ids'=>'<input type="checkbox" name="id">',
						), json_decode(json_encode($file), true)),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * liqiubo 20140729
	 * 获取指定文件夹下未挂接的电子文件
	 */
	public function getFileListForNoLink(){
		$query = isset($_POST['query'])?$_POST['query']:null; 
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 50;
		$folderId = isset($query['folderid'])?$query['folderid']:0;
		$keyword = isset($query['keyword'])?$query['keyword']:'';
		$json = array('keyword'=>$keyword);
		$list=json_encode($json);
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$files = $proxy->selectFileByFolderIdForNoLink($folderId, $page, $rp,$list);
		$total = $proxy->getFileCountByFolderIdForNoLink($folderId,$list);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($files as $i=>$value)
		{
			$file = $value->id;
			$file->createTime = date('Y-m-d H:m:s',$file->createTime/1000);
			$entry= array(
					'id'=>$file->originalId,
					'cell'=>array_merge(array(
							'ids'=>'<input type="checkbox" name="id">',
						), json_decode(json_encode($file), true)),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取文件Id的浏览文件地址，即swf文件下载地址  longjunhao 20140522 edit
	 * @author dengguoqi
	 * @param unknown_type $fileId
	 */
	public function getViewUrl()
	{
// 		$filePrint = isset($_GET["filePrint"])?$_GET["filePrint"]:"";
// 		$fileDownload = isset($_GET["fileDownload"])?$_GET["fileDownload"]:"";
// 		$fileDownload = $_GET["fileDownload"];
		$CanDownload = false;
		$CanPrint = false;
// 		if ("true" == $filePrint) {
// 			$CanPrint = true;
// 		}
// 		if ("true" == $fileDownload) {
// 			$CanDownload = true;
// 		}
		$fileId = $_POST["fileId"];
		/** xiaoxiong 20140911 从缓存中获取当前文件的打印与下载权限 **/
		if(isset($_SESSION['newViewFiles'])){
			if(isset($_SESSION['newViewFiles'][$fileId])){
				$CanPrint = $_SESSION['newViewFiles'][$fileId]['filePrint'] == "true";
				$CanDownload = $_SESSION['newViewFiles'][$fileId]['fileDown'] == "true";
			}
		}
		$path = $_GET["path"];//档案条目的pkgPath
		// 前台传的这几个参数后台没用到，所以注释掉
		//$userinfo = $this->exec("getProxy", "user")->getUserInfo($this->getUser()->getId());
		// 无用参数
		$companyCode = "companyCode";
		$displayName = "displayName";
		// longjunhao 20140725 add 控制是否水印标识，可由前台参数获取，暂时false
		$watermarkEnabled = false;
		$ip = $this->getClientIp();
		$folderProxy = $this->exec("getProxy", "escloud_folderservice");
		$url = $folderProxy->getViewUrl($path,$fileId, $companyCode, $ip);
		$url=json_decode(json_encode($url),true);
		$parms = array();
		if(isset($url['file']) && !empty($url['file'])){
			if(stripos($url['file'],'error')!==false){
				$parms["result"] = "fail";
				$parms["message"] = substr($url['file'],6);
				$fileOperationProxy = $this->exec("getProxy", "escloud_fileoperationws");
				$file = $fileOperationProxy->getSrcFileDownloadUrl($fileId, $ip);
				$file = json_decode(json_encode($file),true);
				if($file["fileUrl"] != "" && $file["fileName"]){
					$parms["CanDownload"] = false; //下载控制
					$parms["DownloadUrl"] = $file["fileUrl"];
					$parms["FileName"] = $file["fileName"]; 
					$parms["result"] = "candown";
					$parms["type"]='down';
					$parms["message"]="该文件暂不支持在线浏览，请下载文件";
				}
				
			} else {
				$parms["result"] = "ok";
				if(stripos($url['file'],'rtmp') !== false){ // rtmp协议媒体流
					$parms["type"] = "flv";
					$parms["fileId"] = $fileId;
					$parms["source"] = $url['file'];
				} else { // http协议流
					$parms["type"] = "swf";
					$parms["fileId"] = $fileId;
					$parms["Scale"] = 1;
					$parms["SwfFile"] = $url['file'];//文件浏览地址
					$parms["codeImageUrl"] = isset($url['code'])?$url['code']:'';//二维码地址
					$parms["ReadOnly"] = false; //只读控制
// 					$parms["CanPrint"] = true; //打印控制
					$parms["CanPrint"] = $CanPrint; //打印控制
					$parms["WatermarkEnabled"] = $watermarkEnabled; //水印控制
					$parms["WatermarkText"] = $displayName." ".date("Y-m-d"); //水印内容
					$parms["WatermarkSize"] = 54; //水印内容
					$parms["WatermarkRotation"] = -45; //水印旋转角度
				}
				// 原文下载控制
				$fileOperationProxy = $this->exec("getProxy", "escloud_fileoperationws");
				$file = $fileOperationProxy->getSrcFileDownloadUrl($fileId, $ip);
				$file = json_decode(json_encode($file),true);
				if($file["fileUrl"] != "" && $file["fileName"]){
// 					$parms["CanDownload"] = true; //下载控制
					$parms["CanDownload"] = $CanDownload; //下载控制
					$parms["DownloadUrl"] = $file["fileUrl"];
					$parms["FileName"] = $file['fileName']; 
				}
			}
		}
		$rtn = json_encode($parms);
		echo $rtn;
	}
	
	/**
	 * 获取文件Id的浏览文件地址，即swf文件下载地址  调试flexpaper专用
	 * @author longjunhao 20141028
	 */
	public function getViewUrl_test()
	{
		$CanDownload = true;
		$CanPrint = true;
		$fileId = $_POST["fileId"];
		$path = "-archive_4-220@_-3@135";//档案条目的pkgPath
		// 无用参数
		$companyCode = "companyCode";
		$displayName = "displayName";
		$watermarkEnabled = false;
	
		$folderProxy = $this->exec("getProxy", "escloud_folderservice");
		$url = $folderProxy->getViewUrl($path,$fileId, $companyCode, '*');
		$url=json_decode(json_encode($url),true);
		$parms = array();
		if(isset($url['file']) && !empty($url['file'])){
			if(stripos($url['file'],'error')!==false){
				$parms["result"] = "fail";
				$parms["message"] = substr($url['file'],6);
				$fileOperationProxy = $this->exec("getProxy", "escloud_fileoperationws");
				$file = $fileOperationProxy->getSrcFileDownloadUrl($fileId);
				$file = json_decode(json_encode($file),true);
				if($file["fileUrl"] != "" && $file["fileName"]){
					$parms["CanDownload"] = false; //下载控制
					$parms["DownloadUrl"] = $file["fileUrl"];
					$parms["FileName"] = $file["fileName"];
					$parms["result"] = "candown";
					$parms["type"]='down';
					$parms["message"]="该文件暂不支持在线浏览，请下载文件";
				}
	
			} else {
				$parms["result"] = "ok";
				if(stripos($url['file'],'rtmp') !== false){ // rtmp协议媒体流
					$parms["type"] = "flv";
					$parms["fileId"] = $fileId;
					$parms["source"] = $url['file'];
				} else { // http协议流
					$parms["type"] = "swf";
					$parms["fileId"] = $fileId;
					$parms["Scale"] = 1;
					$parms["SwfFile"] = $url['file'];//文件浏览地址
					$parms["codeImageUrl"] = isset($url['code'])?$url['code']:'';//二维码地址
					$parms["ReadOnly"] = false; //只读控制
					$parms["CanPrint"] = $CanPrint; //打印控制
					$parms["WatermarkEnabled"] = $watermarkEnabled; //水印控制
					$parms["WatermarkText"] = $displayName." ".date("Y-m-d"); //水印内容
					$parms["WatermarkSize"] = 54; //水印内容
					$parms["WatermarkRotation"] = -45; //水印旋转角度
				}
				// 原文下载控制
				$fileOperationProxy = $this->exec("getProxy", "escloud_fileoperationws");
				$file = $fileOperationProxy->getSrcFileDownloadUrl($fileId);
				$file = json_decode(json_encode($file),true);
				if($file["fileUrl"] != "" && $file["fileName"]){
					// 					$parms["CanDownload"] = true; //下载控制
					$parms["CanDownload"] = $CanDownload; //下载控制
					$parms["DownloadUrl"] = $file["fileUrl"];
					$parms["FileName"] = $file['fileName'];
				}
			}
		}
		$rtn = json_encode($parms);
		echo $rtn;
	}
	
	/**
	 * 电子文件总数列表
	 * @author ldm
	 */
	public function openmyfile() {
		return $this->renderTemplate();
	}
	/**
	 * 未挂接电子文件列表
	 * @author ldm
	 * @return void|string
	 */
	public function opennothook(){
		return $this->renderTemplate();
	} 
	/**
	 * 电子文件总数详细列表
	 * @author ldm
	 */
	public function total_json(){
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$query = isset($_POST['query'])?$_POST['query']:false;
		if (!$query)return;
		$proxy=$this->exec('getProxy','escloud_folderservice');
		$lists = $proxy->getfile($query,$page,$rp);
		$total = $proxy->getTotalNum($query);//总数
		if ($lists==""){
			return;
		}
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i=1;
		foreach($lists as $k=>$row){
			$entry = array('id'=>$i,
					'cell'=>array(
							//xiewenda 201401008 添加原文路径数组元素 用于页面展示
							'c2'=>$row->id->folderPath,
							'c3'=>$row->id->estitle,
							'c4'=>$row->id->esmd5,
							'c5'=>$row->id->essize,
							'c6'=>$row->id->estype
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 未挂接电子文件总数详细列表
	 * @author ldm
	 */
	public function nothook_json(){
	
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$query = isset($_POST['query'])?$_POST['query']:false;
		if (!$query)return;
		$proxy=$this->exec('getProxy','escloud_folderservice');
		$lists = $proxy->getnothookfile($query,$page,$rp);
		$total = $proxy->getNotHookNum($query);//总数
		if ($lists==""){
			return;
		}
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i=1;
		foreach($lists as $k=>$row){
			$entry = array('id'=>$i,
					'cell'=>array(
							//xiewenda 201401008 添加原文路径数组元素 用于页面展示
							'c2'=>$row->id->folderPath,
							'c3'=>$row->id->estitle,
							'c4'=>$row->id->esmd5,
							'c5'=>$row->id->essize,
							'c6'=>$row->id->estype
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 根据路径获取中文显示的路径
	 */
	public function getTitlePath(){
		$path = isset($_POST['path'])?$_POST['path']:false;
		if (!$path)return;
		$proxy=$this->exec('getProxy','escloud_folderservice');
		$title = $proxy->getTitlePath($path);
		echo $title;
	}
	
	/**
	 * 单独提取出来获取阅读文件的url
	 * @author longjunhao 20140922
	 */
	public function getFileUrl(){
		$path = $_POST['path'];
		$fileId = $_POST['fileId'];
		// 无用参数
		$companyCode = "companyCode";
		$folderProxy = $this->exec("getProxy", "escloud_folderservice");
		$ip = $this->getClientIp();
		$url = $folderProxy->getViewUrl($path,$fileId, $companyCode, $ip);
		$url = json_decode(json_encode($url),true);	
		echo $url['success'];
	}
	
	/**
	 * 检查是否存在swf文件
	 * @author longjunhao 20140922
	 */
	public function checkSwfFile(){
		$fileId = $_POST['fileId'];
		$folderProxy = $this->exec("getProxy", "escloud_folderservice");
		$result = $folderProxy->checkSwfFile($fileId);
		echo $result;
	}
	/**
	 * 更改文件夹名字
	 */
	public function do_edit(){
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$filename = $_POST['filename'];
		$folderId= $_POST['folderId'];
		$esViewTitle= $_POST['esViewTitle'];
		$param=array('estitle'=>$filename,'esViewTitle'=>$esViewTitle);//liqiubo 20140618 加入saas支持
		$param = json_encode($param);
		$edit = $proxy->editSubFolder($folderId,$param);
		echo $edit;
	
	}
		
}