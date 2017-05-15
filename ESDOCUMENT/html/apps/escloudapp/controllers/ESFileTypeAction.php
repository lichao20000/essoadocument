<?php
/**
 * @author wangtao
 * 文种对应设置
 */
class ESFileTypeAction extends ESActionBase
{
	
	/**
	 * @author yzh
	 * modify @date 2013-06-04
	 * 下拉框中的值与业务系统设置列表中的值相对应
	 * @return void|string
	 */
	public function index()
	{
		$userId = $this->getUser()->getId();
		$info=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$info->mainSite;
		$proxyInfo = $this->exec('getProxy','escloud_receivews');
		$oaLists = $proxyInfo->getSysNodeListByMainsite($mainsite);
		//print_r($oaLists);exit;
		
		$proxy=$this->exec('getProxy','escloud_organcorrespondingws');
		$result = $proxy->getretention(1,"RetentionPeriod");
		$pro = $this->exec('getProxy','escloud_consumerservice');
		$province = $pro->getOrgList('0000');
		
		$proxy = $this->exec('getProxy','escloud_fileoperationws');
		// http://10.0.3.155:8888/escloud_service/rest/escloud_fileoperationws
		$ip = $proxy->getServiceIP();
		$ip = str_replace('escloud_fileoperationws', 'escloud_recordtypews/importRecordtype', $ip);
		
		return $this->renderTemplate(array('oaList'=>$oaLists,'list'=>$result,'userid'=>$userId,'userinfo'=>$info,'organ'=>$info->deptEntry->ldapOrgCode,'province'=>$province, 'ip'=>$ip));
	}
	/**
	 * 数据的获取
	 * @author ldm
	 */
	public  function getDefaultList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		if ($query){
			$filetype=$this->exec('getProxy','escloud_recordtypews');
			$userId=$this->getUser()->getId();
			$lists = $filetype->getTypeList($userId,$query,($page-1)*$rp,$rp);
			$total = $filetype->countAllByUserid($userId,$query);
		}else{
			/*$type = "OA";
			$filetype=$this->exec('getProxy','escloud_recordtypews');
			$userId=$this->getUser()->getId();
			$lists = $filetype->getTypeList($userId,$type,($page-1)*$rp,$rp);
			$total = $filetype->countAllByUserid($userId,$type);*/
			return;
		}
		if ($lists==null||$lists==""){
			return;
		}
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$sortArray = array();
		foreach($results AS $key => $row){
			$sortArray[$key] = $row['id'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'cx'=>'<input type="checkbox" name="ids" value='.$row['id'].'>',
							'recordclass'=>$row['recordclass'],
							'recordType'=>$row['recordType'],
							'filestatus'=>$row['filestatus'],
							'classCode'=>$row['classCode'],
							'storageTerm'=>$row['storageTerm'],
							'status'=>$row['status'],
							'description'=>$row['description'],
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	
	/**
	 * 数据的获取
	 * @author ldm
	 */
	public  function userdata_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		
			$filetype=$this->exec('getProxy','escloud_recordtypews');
			$userId=$this->getUser()->getId();
			$lists = $filetype->getTypeList($userId,($page-1)*$rp,$rp);
			$total = $filetype->countAllByUserid($userId);
		
		if ($lists==null||$lists==""){
			return;
		}
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$sortArray = array();
		foreach($results AS $key => $row){
			$sortArray[$key] = $row['id'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'cx'=>'<input type="checkbox" name="ids" value='.$row['id'].'>',
							'recordclass'=>$row['recordclass'],
							'recordType'=>$row['recordType'],
							'filestatus'=>$row['filestatus'],
							'classCode'=>$row['classCode'],
							'storageTerm'=>$row['storageTerm'],
							'status'=>$row['status'],
							'description'=>$row['description'],
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 分类号树结构的获取
	 * @author ldm
	 */
	public function tree(){
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$lists = $proxy->gettree(0);
		$tree = '[';
		foreach ($lists as $k=>$val){
			$tree.='{"id":'.$val->id.',"isParent":true,"pId":'.$val->idParent.',"name":"'.$val->className.'","classCode":"'.$val->classCode.'"},';
		}
		$tree=rtrim($tree,',');
		$tree.=']';
		echo $tree;
		
	}
		/**
	 * 获取子节点
	 * @author ldm
	 */
	public function getnode(){
		$id = $_POST['id'];
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$lists = $proxy->gettree($id);
		$tree = '[';
		foreach ($lists as $k=>$val){
			if ($proxy->gettree($val->id)!=null){
				$tree.='{"id":'.$val->id.',"isParent":true,"pId":'.$val->idParent.',"name":"'.$val->className.'","classCode":"'.$val->classCode.'"},';
			}else {
				$tree.='{"id":'.$val->id.',"pId":'.$val->idParent.',"name":"'.$val->className.'","classCode":"'.$val->classCode.'"},';
			}
		}
		$tree=rtrim($tree,',');
		$tree.=']';
		echo $tree;
	}
	
	//筛选渲染模板
	public function filter()
	{
		return $this->renderTemplate();
	}
	/**
	 * 筛选
	 * @author ldm
	 */
	public function filter_sql()
	{
		$sql_string = $_GET['sql_str'];
		$type = $_GET['type'];
		if($sql_string==""){
			//echo 'error';
			return;
		}
		$list = explode("-", $sql_string);
		$list[] = "ARCHIVE_TYPE,equal,".$type.",true";
		$list = json_encode($list);
		$proxy= $this->exec("getProxy", "escloud_recordtypews");
		$lists = $proxy->sqlFilter($list);
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		if($qtype && $query){
			$query = strtolower(trim($query));
			foreach($results AS $key => $row){
				if(strpos(strtolower($row[$qtype]),$query) === false){
					unset($results[$key]);
				}
			}
		}
		$sortArray = array();
		foreach($results AS $key => $row){
			$sortArray[$key] = $row['id'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$total = count($results);
		$results = array_slice($results,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		//$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							//'id'=>$i,
							'cx'=>'<input type="checkbox" name="ids" value='.$row['id'].'>',
							'recordclass'=>$row['recordclass'],
							'recordType'=>$row['recordType'],
							'filestatus'=>$row['filestatus'],
							'classCode'=>$row['classCode'],
							'storageTerm'=>$row['storageTerm'],
							'status'=>$row['status'],
							'description'=>$row['description'],
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	//批量添加
	public function saveFileType()
	{
		$addvalues = $_POST['param'];
		$addvalues = json_encode($addvalues);
		$userId = $this->getUser()->getId();
		$userId=!empty($userId)?$userId:0;
		echo $this->exec("getProxy", "escloud_recordtypews")->saveMoreFileType($addvalues,$userId);
	}
	
	/**
	 * 批量修改
	 * @author ldm
	 */
	public function modifyFileType()
	{
		$modvalues = $_POST['param'];
		$modvalues = json_encode($modvalues);
		//var_dump($modvalues);return;
		//echo $modvalues;return;
		echo $this->exec("getProxy", "escloud_recordtypews")->modMoreFileType($modvalues);
	}
	
	/**
	 * 批量删除
	 * @author ldm
	 */
	public function delFileType()
	{
		$param = $_POST['param'];
		$param = rtrim($param,",");
		$id = explode(",", $param);
		$id = json_encode($id);
		//echo $id;return ;
		$proxy = $this->exec('getProxy','escloud_recordtypews');
		$save = $proxy->delMoreFileType($id);
		echo $save;
	}
	
	
}