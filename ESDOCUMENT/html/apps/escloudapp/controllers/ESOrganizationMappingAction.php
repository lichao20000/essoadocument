<?php
/**
 * @author wangtao
 * 机构对应设置
 */
class ESOrganizationMappingAction extends ESActionBase
{
	/**
	 * yzh 201307  modify
	 */
	public function index()
	{
		$userId = $this->getUser()->getId();
		$info=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$info->mainSite;
		$proxyInfo = $this->exec('getProxy','escloud_receivews');
		$oaLists = $proxyInfo->getSysNodeListByMainsite($mainsite);
		//var_dump($oaLists);exit;
		
		$proxy=$this->exec('getProxy','escloud_organcorrespondingws');
		$result = $proxy->getretention(1,"RetentionPeriod");
		
		$proxy = $this->exec('getProxy','escloud_fileoperationws');
		$ip = $proxy->getServiceIP(); // http://10.0.3.155:8888/escloud_service/rest/escloud_fileoperationws
		$ip = str_replace('escloud_fileoperationws', 'escloud_organcorrespondingws/importOrgancorresponding', $ip);
		
		return $this->renderTemplate(array('oaList'=>$oaLists,'list'=>$result, 'ip'=>$ip));
	}
	
	/**
	 * 左侧树数据显示
	 * @author ldm
	 */
	public function tree(){
		$userid = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_consumerservice');
		$lists = $proxy->getOwnOrgByUserId($userid);
		$result = array();
		foreach ($lists->list as $k=>$val){
			$result[$k]["name"] = $val->orgNameDisplay;
			$result[$k]["pId"] = $val->parentOrgCode;
			$result[$k]["id"] = $val->orgid;
			$result[$k]["isParent"] = true;
		}
		echo json_encode($result);
	}
	/**
	 * 左侧树查找子节点
	 * @author ldm
	 */
	public function getnode(){
		$id = $_POST['id'];
		$proxy = $this->exec('getProxy','escloud_archiveorganws');
		$lists = $proxy->gettree($id);
		$result = array();
		foreach ($lists as $k=>$val){
			$result[$k]["name"] = $val->orgNameDisplay;
			$result[$k]["pId"] = $val->parentOrgCode;
			$result[$k]["id"] = $val->orgid;
			$result[$k]["isParent"] = true;
		}
		echo json_encode($result);
	}
	/**
	 * 分类库树
	 * @author ldm
	 */
	public function classictree(){
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$lists = $proxy->gettree(0);
		$zNodes = array();
		$zNodes[] = array('id'=>0,'pId'=>0,'name'=>'分类库管理','open'=>true);
		foreach ($lists as $k=>$val)
		{
			$zNodes[] = array('id'=>$val->id,'pId'=>0,'name'=>$val->className, 'isParent'=>true,'classCode'=>$val->classCode);
		}
		echo json_encode($zNodes);
	}
	/**
	 * 分类库树节点获取
	 * @author ldm
	 */
	public function getclassicnode(){
		$id = $_POST['id'];
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$lists = $proxy->gettree($id);
		$result = array();
		foreach ($lists as $k=>$val){
			if ($proxy->gettree($val->id)!=null){
				$result[$k]["name"] = $val->className;
				$result[$k]["pId"] = $val->idParent;
				$result[$k]["id"] = $val->id;
				$result[$k]["isParent"] = true;
				$result[$k]["classCode"]=$val->classCode;
			}else{
				$result[$k]["name"] = $val->className;
				$result[$k]["pId"] = $val->idParent;
				$result[$k]["id"] = $val->id;
				$result[$k]["classCode"]=$val->classCode;
			}
		}
		echo json_encode($result);
		
	}
	/**
	 * 右侧表格数据显示&&归档筛选功能
	 * @author ldm
	 */
	public function organ_json(){
		$treeid = isset($_GET['trid'])?$_GET['trid']:"";
		//$sql_str = isset($_GET['sql_str'])?$_GET['sql_str']:"";
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$proxy=$this->exec('getProxy','escloud_organcorrespondingws');
		if($treeid=="")
		{
			return;
		}
		$lists = $proxy->getinfo($treeid,($page-1)*$rp,$rp);
		$total = $proxy->countall($treeid);
		if ($lists==""){
			return;
		}
	
	
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$sortArray = array();
		foreach($results AS $key => $row){
			$sortArray[$key] = $row['ID'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i = 1;
		foreach($results AS $row){
			$entry = array('id'=>$row['ID'],
					'cell'=>array(
							'number'=>$i,
							'id2'=>'<input type="checkbox" name="id2" value='.$row['ID'].'>',
							'c3'=>$row['CLASSCODE'],
							'c4'=>$row['STORAGE_TERM'],
							'c5'=>$row['ARCHIVE_TYPE'],
							'c6'=>$row['orgname'],
							'c7'=>$row['DESCRIPTION']
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * yzh   201307
	 * 归档添加页面显示
	 */
	public function organadd(){
		$userId = $this->getUser()->getId();
		$info=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$info->mainSite;
		$proxyInfo = $this->exec('getProxy','escloud_receivews');
		$oaLists = $proxyInfo->getSysNodeListByMainsite($mainsite);
		//var_dump($oaLists);exit;
		
		$proxy=$this->exec('getProxy','escloud_organcorrespondingws');
		$result = $proxy->getretention(1,"RetentionPeriod");
		//var_dump($result);
		return $this->renderTemplate(array('oaList'=>$oaLists,'list'=>$result));
	}
	/**
	 * 机构对应设置添加
	 * @author ldm
	 */
	public function addval(){
		$data = $_POST['data'];
		$treeid = $_POST['trid'];
		$treename=$_POST['trname'];
		parse_str($data,$out);
		$userID=$this->getUser()->getId();
		//echo $userID;return;
		$list = array(
				'CLASSCODE'=>$out['classic'],
				'STORAGE_TERM'=>$out['retention'],
				'ARCHIVE_TYPE'=>$out['selectmodel'],
				'DESCRIPTION'=>$out['remark'],
				'orgname'=>$treename,
				'orgldapId'=>$treeid,
				'ORGAN'=>$userID
		);
		$list = json_encode($list);
		$proxy=$this->exec('getProxy','escloud_organcorrespondingws');
		$result = $proxy->addval($list);
		echo $result;
	}
	/**
	 * 归档删除
	 * @author ldm
	 */
	public function delval(){
		$ids = $_POST['id'];
		$ids = rtrim($ids,",");
		$id = explode(",", $ids);
		$id = json_encode($id);
		//echo $id;return ;
		$proxy = $this->exec('getProxy','escloud_organcorrespondingws');
		$del = $proxy->delval($id);
		echo $del;
	}
	/**
	 * 归档筛选页面显示
	 * @author ldm
	 */
	public function filter(){
		return $this->renderTemplate();
	}
	/**
	 * 归档保存功能
	 * @author ldm
	 */
	public function saveval(){
		$param = isset($_POST['param'])?$_POST['param']:"";
		if ($param==""){
			return;
		}
		$param = json_encode($param);
		//echo ($param);return;
		$proxy = $this->exec('getProxy','escloud_organcorrespondingws');
		$del = $proxy->saveval($param);
		echo $del;
	}
	public function filter_json(){
		$treeid = isset($_GET['trid'])?$_GET['trid']:"";
		//$sql_str = isset($_GET['sql_str'])?$_GET['sql_str']:"";
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$proxy=$this->exec('getProxy','escloud_organcorrespondingws');
		if ($query){
			$list = explode("-", $query);
			$list = json_encode($list);
			$lists = $proxy->filte($list,$treeid,($page-1)*$rp,$rp);
			$total = $proxy->filtercount($list);
		}else{
			return;
		}
		if ($lists==""){
			return;
		}
		
		
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$sortArray = array();
		foreach($results AS $key => $row){
			$sortArray[$key] = $row['ID'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i = 1;
		foreach($results AS $row){
			$entry = array('id'=>$row['ID'],
					'cell'=>array(
							'number'=>$i,
							'id2'=>'<input type="checkbox" name="id2" value='.$row['ID'].'>',
							'c3'=>$row['CLASSCODE'],
							'c4'=>$row['STORAGE_TERM'],
							'c5'=>$row['ARCHIVE_TYPE'],
							'c6'=>$row['orgname'],
							'c7'=>$row['DESCRIPTION']
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
}