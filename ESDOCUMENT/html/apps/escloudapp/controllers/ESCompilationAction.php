<?php
/**
 *
 *档案编研
 * @author ldm
 * @Date 20120827
 */
class ESCompilationAction extends ESActionBase{
	public function index(){
 		$userId = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_fileoperationws');
 		$uploadpath = $proxy->getServiceIP();
 		$user = $this->exec('getProxy','user');
 		$info = $user->getUserInfo($userId);
 		$mainsite = strtoupper($info->mainSite);
		return $this->renderTemplate(array('uploadpath'=>$uploadpath,'mainsite'=>$mainsite));
	}
	/**
	 * 编研数据展示&&筛选
	 * @author ldm
	 */
	public  function get_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 2;
		$query = isset($_POST['query']['condition'])?$_POST['query']['condition']:false;
		$keyword = isset($_POST['query']['keyword'])?$_POST['query']['keyword']:"";
		$state = isset($_GET['state'])?$_GET['state']:"";
// 		$sql_str = isset($_GET['sql_str'])?$_GET['sql_str']:false;
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$remoteAddr = $this->getClientIp();
// 		if ($sql_str){
// 			$param = array('start'=>($page-1)*$rp,'limit'=>$rp,'state'=>$state,'condition'=>$sql_str,'userId'=>$userId,'bigOrgId'=>$bigOrgId,'remoteAddr'=>$remoteAddr);
// 			$lists = $proxy->findListByCondition(json_encode($param));
// 		}else{
		$param = array('start'=>($page-1)*$rp,'limit'=>$rp,'condition'=>$query,'keyword'=>$keyword,'userId'=>$userId,'bigOrgId'=>$bigOrgId,'remoteAddr'=>$remoteAddr);
		$lists = $proxy->findResearchFormList(json_encode($param));
// 		}
		$total = array_pop($lists)->size;
		if ($total==0)return;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($lists as $k=>$val){
			$entry = array('id'=>$val->id,
					'cell'=>array(
							'id2'=>'<input type="checkbox" name="id2" value='.$val->id.'>',
							'path'=>$val->content,
							'c3'=>$val->state=='发布'?"<span class='detailsbtn' title='查看'></span>":"<span class='editbtn' title='编辑'></span>&nbsp;&nbsp;&nbsp;&nbsp;<span class='detailsbtn' title='预览'></span>",
							'c4'=>$val->tm,
							'c5'=>$val->state,
							'c6'=>$val->type,
							'c7'=>$val->summary,
							'c8'=>$val->createOrg,
							'c9'=>$val->displayName,
							'c10'=>$val->createDate,
// 							'c11'=>$val->submitDate,
							'c12'=>$val->publishDate,
							'c13'=>$val->approvalNote
					),
			);
			$jsonData['rows'][] = $entry;
		}

		echo json_encode($jsonData);
	}
	/**
	 * 删除操作
	 * @author ldm
	 */
	public function del(){
		$userId = $this->getUser()->getId();
		$param = $_POST['param'];
		$param = rtrim($param,",");
		$id = explode(",", $param);
		$id = json_encode($id);
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$result = $proxy->deleteBatchResearchForm($userId,$id);
		echo $result;
	}
	/**
	 * 上传图片
	 * @author ldm
	 */
	public function imgupload(){
		$ss =  $this->uploadImage(120,80);
		echo $ss['dst_image'];
	}
	/**
	 * ckeditor上传图片
	 * @author ldm
	 */
	public function ckupload(){
		$res =  $this->uploadImage(120,80);
		echo '{"urls":"'.$res['src_image'].'"}';
	}
	/**
	 * 20130730
	 * 添加保存数据&&提交编研
	 * @author ldm
	 */
	public function save(){
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$info = $user->getUserInfo($userId);
		$orgcode = $info->deptEntry->orgid;
		$id = isset($_POST['id'])?$_POST['id']:"";
		$tm=$_POST['title'];
		$state=$_POST['state'];
		$type=$_POST['type'];
		$summary = $_POST['summary'];
		$content = isset($_POST['content'])?$_POST['content']:"";
		$create_org = $_POST['create_org'];
		$create_person=$_POST['create_person'];
		$userid=$_POST['userid'];
		$createdate = $_POST['createdate'];
		$submitdate = isset($_POST['submitdate'])?$_POST['submitdate']:null;
		$publishdate = isset($_POST['publishdate'])?$_POST['publishdate']:null;
		$btn = isset($_POST['clickbtn'])?$_POST['clickbtn']:"";
		$imgurl = isset($_POST['imgurl'])?$_POST['imgurl']:"";
		$accessory = isset($_POST['accessory'])?$_POST['accessory']:"";
		$approveUserId=isset($_POST['approveUserId'])?$_POST['approveUserId']:"";
		$bigOrgId = $this->getUser()->getBigOrgId();
		if($id==""){
			$list = array(
					'tm'=>$tm,
					'title'=>'编研申请单',
					'state'=>$state,
					'type'=>$type,
					'summary'=>$summary,
					'create_org'=>$create_org,
					'display_name'=>$create_person,
					'create_person_id'=>$userid,
					'create_date'=>$createdate,
					'submit_date'=>null,
					'publish_date'=>null,
					'approval_note'=>null,
					'image'=>$imgurl,
					'accessory'=>$accessory,
					'orgId'=>$orgcode,
					'content'=>$content,
					'bigOrgId'=>$bigOrgId
			);
		}else{
			$list = array(
					'id' => $id,
					'tm'=>$tm,
					'title'=>'编研申请单',
					'state'=>$state,
					'type'=>$type,
					'summary'=>$summary,
					'create_org'=>$create_org,
					'display_name'=>$create_person,
					'create_person_id'=>$userid,
					'create_date'=>$createdate,
					'submit_date'=>null,
					'publish_date'=>null,
					'approval_note'=>null,
					'image'=>$imgurl,
					'accessory'=>$accessory,
					'orgId'=>$orgcode,
					'content'=>$content,
					'bigOrgId'=>$bigOrgId
			);
		}
		//var_dump($list);return;
		$proxy = $this->exec('getProxy','escloud_researchformws');
		if($btn=="save"){
			$list = json_encode($list);
			$result = $proxy->saveOrUpdateResearchForm($list);
			echo $result;
		}
		if($btn=="submit"){
			$tempdate = date('Y-m-d');
			$list['submit_date'] = $tempdate;
			$list['bianyan'] = "bianyan";
			$list = json_encode($list);
			$processDefinitionKey = "fileResearchProcess";
			$businessKey = time();
			$result = $proxy->startProcessInstanceAndSubmitResearchByKey($processDefinitionKey,$businessKey,$userid,$list,$approveUserId);
			echo $result;
		}
	}



	/**
	 * 显示信息
	 * @author ldm
	 */
	public function getinfo(){
		$state = $_GET['state'];
		if ($state=='编辑'){
			$userId = $this->getUser()->getId();
			$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
			$info = array(
					'userId'=>$userId,
					'userOrg'=>$userInfo->deptEntry->orgName,
					'userName'=>$userInfo->displayName
			);
			echo json_encode($info);
			return;
		}
	}
	/**
	 * 获取一条记录详细信息
	 * @author ldm
	 */
	public function getinfolist(){
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$info = $user->getUserInfo($userId);
		$orgcode = $info->deptEntry->orgid;
		$id = $_POST['id'];
		if ($id==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$result = $proxy->findResearchFormById($id,$orgcode);
		echo json_encode($result);
	}
	/**
	 * 获取插入档案表格的数据
	 * @author ldm
	 */
	public function archivenav_json(){
		$id = $_GET['trid'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 2;
		//$query = isset($_POST['query'])?$_POST['query']:false;
		$sql_str = isset($_GET['sql_str'])?$_GET['sql_str']:false;
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$lists = $proxy->findResearchFormList(($page-1)*$rp,$rp,$query);
		$total = array_pop($lists)->size;
		if ($total==0)return;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($lists as $k=>$val){
			$entry = array('id'=>$val->id,
					'cell'=>array(
							'id2'=>'<input type="checkbox" name="id2" value='.$val->id.'>',
							'c3'=>"<span class='editbtn'>&nbsp;</span>",
							'c4'=>$val->title,
							'c5'=>$val->state,
							'c6'=>$val->type,
							'c7'=>$val->summary,
							'c8'=>$val->createOrg,
							'c9'=>$val->createPerson,
							'c10'=>$val->createDate,
							'c11'=>$val->submitDate,
							'c12'=>$val->publishDate,
							'c13'=>$val->approvalNote
					),
			);
			$jsonData['rows'][] = $entry;
		}

		echo json_encode($jsonData);
	}

	/**
	 * 插入编研
	 * @author ldm
	 */
	public function parseinsertcomply(){
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$info = $user->getUserInfo($userId);
		$orgcode = $info->deptEntry->orgid;
		$path = $_POST['path'];
		$list = array(
				'address'=>$path,
				'orgId'=>$orgcode
				);
		$list = json_encode($list);
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$result = $proxy->insertResearch($list);
		$parse = isset($result->content)?$result->content:"";
		echo strip_tags($parse);
	}
	/**
	 * 获取档案列表
	 * @author ldm
	 */
	public function datalist(){
		$path=$_GET['path'];
		$fields=$this->getFields($path,'string');
		return $this->renderTemplate(array('fields'=>$fields,'path'=>$path));
	}
	/**
	 *
	 * 获取相关著录文件的字段值
	 */
	public function getFields($path,$type)
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($path);
		if($type!=''&& $type=='string')
		{
			$str='';
			foreach ($data as $key=>$value)
			{
				$str.=json_encode($value).',';
			}
			$str=rtrim($str,',');
			return  $str;
		}else{
			$data=json_decode(json_encode($data),true);
			$arr=array();
			foreach ($data as $value)
			{
				$arr[]=$value['name'];
			}
			return $arr;
		}
	}
	/**
	 * 插入档案
	 * @author ldm
	 */
	public function insertarchive(){
		
		return $this->renderTemplate();
	}
	/**
	 * 显示一个路径下的所有档案
	 * @author ldm
	 */
	public function choosearchive(){
		$path = $_POST['path'];
		$list = array('path'=>$path);
		$list = json_encode($list);
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$result = $proxy->getPdfId($list);
		$length = count($result);
		if ($length==0){
			return;
		}else {
			$_SESSION['archivedatas'] = $result;
			return $this->renderTemplate();
		}
	}
	/**
	 * 加载路径下档案数据
	 * @author ldm
	 */
	public function choose_json(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$lists = $_SESSION['archivedatas'];
		$total = count($lists);
		$rows = array_slice($lists,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $k=>$val){
			$entry = array(
					'cell'=>array(
							'check'=>'<input type="checkbox" name="checkornot" />',
							'pdfid'=>$val->pdfId,
							'title'=>$val->pdfTitle,
							'type'=>$val->pdfType
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 解析插入的档案
	 * @author ldm
	 */
	public function paresarchive(){
		$path = $_REQUEST['path'];
		//$userinfo = $this->exec("getProxy", "user")->getUserInfo($this->getUser()->getId());
		//$companyCode = $userinfo->shengid;
		$param = array(
				//'company'=>$companyCode,
				'clientIp'=>'*',
				'path'=>$path,
				'userId'=>$this->getUser()->getId()
		);
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$result = $proxy->insertFile($param);
		//var_dump(preg_replace('/\s*/','',$result));exit;
		$data = array();
		if(empty($result) || $result == 'null') {
			$data['flag'] = false;
			$data['content'] = '';
		} else {
			$data['flag'] = true;
			$data['content'] = $result;
		}
		echo json_encode($data);
	}
	/**
	 * 下载
	 * @author ldm
	 */
	public function downloads(){
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$info = $user->getUserInfo($userId);
		$mainsite = strtoupper($info->mainSite);
		$path = isset($_POST['path'])?$_POST['path']:"";
		$param = '{}';
		$moudle = "research";
		$clientip = '*';
		$proxy = $this->exec('getProxy','escloud_fileoperationws');
		$url = $proxy->getFileUrl($moudle,$mainsite,$clientip,$path,$param);
		echo $url;return;
		/* $fileName=basename($url);//获取下载文件的名称
		$cache = $this->exec('getProxy','cache');
		$cache->setCache(md5($fileName),$url);
		echo md5($fileName); */
	}
	/**
	 * @author ldm
	 * 下载
	 */
	public function downFile()
	{
		$cache = $this->exec('getProxy','cache');
		$fileUrl = $cache->getCache($_GET['fileName']);
		$filName=basename($fileUrl);
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	
	}
	
  /**
   * 删除档案编研添加的附件
   * @author niyang at 2013-10-30
   * @return bool
   */
	public function delFile() {
		$info = array();
		$filepath = @$_REQUEST['filepath'];
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$info = $user->getUserInfo($userId);
		$orgid = $info->deptEntry->orgid;
		if(empty($filepath)) {
			exit('文件路径非法！');
		}
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$param = array('orgId'=>$orgid,'address'=>$filepath);
		$res = $proxy->delFile(json_encode($param));
		if($res == 'success') {
			$info = array('code'=>200, 'msg'=>'删除成功！');
		} else {
			$info = array('code'=>-1, 'msg'=>'删除失败！');
		}
		header("Content-type:application/json; charset=utf-8");
		exit(json_encode($info));
	}
	
	public function publish(){
		$userId = $this->getUser()->getId();
		$ids = $_POST['ids'];
		$ip = $this->getClientIp();
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$param = json_encode(array('userId'=>$userId,'ids'=>$ids, 'ip'=>$ip));
		$result = $proxy->publish($param);
		echo $result;
	}
	
	public function unPublish(){
		$userId = $this->getUser()->getId();
		$ids = $_POST['ids'];
		$ip = $this->getClientIp();
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$param = json_encode(array('userId'=>$userId,'ids'=>$ids,'ip'=>$ip));
		$result = $proxy->unPublish($param);
		echo $result;
	}

	/**
	 * 查看编研成果
	 * @author longjunhao 20140806
	 */
	public function publishShow(){
		$id = $_GET['id'];
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$info = $user->getUserInfo($userId);
		$orgcode = $info->deptEntry->orgid;
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$result = $proxy->findResearchFormById($id,$orgcode);
		
		$data['id'] = $result->id;
		$data['title'] = $result->tm;
		$data['type'] = $result->type;
		$data['summary'] = $result->summary;
		$data['createOrg'] = $result->createOrg;
		$data['displayName'] = $result->displayName;
		$data['publishDate'] = $result->publishDate;
		$data['image'] = $result->image;
		$data['content'] = $result->content;
		$data['accessory'] = $result->accessory;
		
		return $this->renderTemplate($data);
	}
}