<?php
/**
 * @author ldm
 *归档机构设置
 */
class ESArchiveOrganizationAction extends ESActionBase
{
	/**
	 * yzh  201307  modify
	 */
	public function index()
	{
		$userId = $this->getUser()->getId();
		$info=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$info->mainSite;
		$proxyInfo = $this->exec('getProxy','escloud_receivews');
		$oaLists = $proxyInfo->getSysNodeListByMainsite($mainsite);
		//var_dump($oaLists);exit;
		return $this->renderTemplate(array('oaList'=>$oaLists));
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
			$result[$k]["ppId"] = $val->parentOrgCode;
			$result[$k]["id"] = $val->orgid;
			$result[$k]["mainSite"] = $val->mainSite;
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
			$result[$k]["ppId"] = $val->parentOrgCode;
			$result[$k]["id"] = $val->orgid;
			$result[$k]["mainSite"] = $val->mainSite;
			$result[$k]["isParent"] = true;
		}
		echo json_encode($result);
	}
	/**
	 * 右侧表格数据显示&&归档筛选功能
	 * @author ldm
	 */
	public function organ_json(){
		$sql_str = isset($_GET['sql_str'])?$_GET['sql_str']:"";
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$proxy=$this->exec('getProxy','escloud_archiveorganws');
		if ($sql_str!=""){
			$orgid = $_GET['orgid'];
			$list = explode("-", $sql_str);
			$list[] = "ID_PARENT,equal,".$orgid.",true";
			$list = json_encode($list);
			$lists = $proxy->filte($list,$page,$rp);
			$total = $proxy->filtercount($list);
		}else {
			if ($query){
				$lists = $proxy->getinfo($query,$page,$rp);
				$total = $proxy->countall($query);
			}
			
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
			$sortArray[$key] = $row['id'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i = 1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'number'=>$i,
							'id2'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
							'c3'=>$row['name'],
							'c4'=>$row['archivetype'],
							'c5'=>$row['description']
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 归档添加页面显示
	 * @author ldm
	 * @modify at 2013-10-30 by niyang
	 */
	public function organadd(){
		$id = $_REQUEST['id'];
		$name = $_REQUEST['name'];
		/*$info=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$info->mainSite;
		$proxyInfo = $this->exec('getProxy','escloud_receivews');
		$oaLists = $proxyInfo->getSysNodeListByMainsite($mainsite);
		var_dump($oaLists);exit;
		return $this->renderTemplate(array('oaList'=>$oaLists));*/
		$proxy = $this->exec('getProxy','escloud_archiveorganws');
		$lists = $proxy->gettree($id);
		$result = array();
		foreach ($lists as $k=>$val){
			$result[$k]["name"] = $val->orgNameDisplay;
			$result[$k]["pId"] = $val->parentOrgCode;
			$result[$k]["ppId"] = $val->parentOrgCode;
			$result[$k]["id"] = $val->orgid;
			$result[$k]["mainSite"] = $val->mainSite;
			$result[$k]["isParent"] = true;
		}
		array_unshift($result,array(
			'name'     => $name,
			'pId'      => '0000',
		  	'ppId'     => '0000',
		    'id'       => $id,
		    'mainSite' => '',
		    'isParent' => true,
			'open'	   => true
		));
		return $this->renderTemplate(array('zNodes'=>json_encode($result)));
	}
	/**
	 * 归档添加
	 * @author ldm
	 */
	public function addval(){
		$data = isset($_POST['data']) ? $_POST['data'] : '';
		/*$treeid = $_POST['trid'];
		parse_str($data,$out);
		$list = array(
			    'idParent'=>$treeid,
				'orgid'=>$out['orgid'],
				'name'=>$out['institution'],
				'archivetype'=>$out['selectmodel'],
				'description'=>$out['remark']
		);*/
		$list = json_encode($data);
		$proxy=$this->exec('getProxy','escloud_archiveorganws');
		$result = $proxy->addval($list);
		echo json_encode($result);
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
		$proxy = $this->exec('getProxy','escloud_archiveorganws');
		$del = $proxy->delval($id);
		echo json_encode($del);
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
		$param = $_POST['param'];
		$param = json_encode($param);
		$proxy = $this->exec('getProxy','escloud_archiveorganws');
		$del = $proxy->saveval($param);
		echo $del;
	}
}