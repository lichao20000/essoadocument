<?php
/**
 *
 * @author zhangyanxin
 * @Date 20120824
 */
class ESInOutAction extends ESActionBase{
	/**
	 * @see ESActionBase::index()
	 */
	public function index(){
		return $this->renderTemplate();
	}
	/**
	 * 出入库数据显示
	 * @author ldm
	 * modify  2013-05-21
	 */
	public  function get_json()
	{
		$userId=$this->getUser()->getId();
		$userInfo=$this->getUser()->getInfo();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$LdapOrgCode = $userInfo->deptEntry->orgid;
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		
		if($query){
			$status = array('STATUS'=>$query,'ORG_ID'=>$LdapOrgCode);//modify 2013-05-21
			$status = json_encode($status);
			$list=$this->exec('getProxy','escloud_inoroutboundws');
			$lists = $list->getInorOutBoundList($status,$page,$rp);
			if ($lists==""){
				return;
			}
			$con = count($lists);
			if ($con==0){return;}
			$total = $lists[$con-1]->total;
		}
		$results = array();
		for($i=0;$i<$con-1;$i++){
			$results[]=json_decode(json_encode($lists[$i]),true);
		}
		/** guolanrui 20140917 去掉根据ID排序 BUG：782 start **/
// 		$sortArray = array();
// 		foreach($results AS $key => $row){
// 			$sortArray[$key] = $row['ID'];
// 		}
// 		$sortMethod = SORT_ASC;
// 		if($sortorder == 'desc'){
// 			$sortMethod = SORT_DESC;
// 		}
// 		array_multisort($sortArray, $sortMethod, $results);
		/** guolanrui 20140917 去掉根据ID排序 BUG：782 end **/
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($results AS $row){
			$entry = array('id'=>$row['ID'],
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id2" value='.$row['ID'].'>',
							'num'=>$row['CODE'],
							'c3'=>$row['ARCHIVE_CODE'],
							'c4'=>$row['TITLE'],
							'c5'=>$row['TYPE'],
							'c6'=>$row['STATUS'],
							'c7'=>$row['REASON'],
							'c8'=>$row['MANAGER'],
							'c9'=>$row['DATE'],
							'c10'=>$row['PAGE'],
							'c11'=>$row['NUMBER']
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData); 
	}
	/**
	 *  @author zhangyanxin
	 *   状态变更
	 * 
	 */
	public function statuschanges(){
		return $this->renderTemplate();
	}
	/**
	 * 出入库数据变更显示
	 * @author ldm
	 */
	public  function change_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
	
		if($query){
			$ids = rtrim($query,',');
			$id = explode(",", $ids);
			$id = json_encode($id);
			$proxy = $this->exec('getProxy','escloud_inoroutboundws');
			$lists = $proxy->getlist($id,($page-1)*$rp,$rp);
			if ($lists==""){
				return;
			}
			$con = count($lists);
			if ($con==0){return;}
			$total = $lists[$con-1]->total;
			
		}
	
		if ($lists==""){
			return;
		}
		$results = array();
		for($i=0;$i<$con-1;$i++){
			$results[]=json_decode(json_encode($lists[$i]),true);
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
		//$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['ID'],
					'cell'=>array(
							//'id'=>'<input type="checkbox" name="id2" value='.$row['ID'].'>',
							'num'=>$row['CODE'],
							'c3'=>$row['ARCHIVE_CODE'],
							'c4'=>$row['TITLE'],
							//'c5'=>$row['TYPE'],
							'c6'=>$row['STATUS'],
							'c7'=>$row['REASON']
							//'c8'=>$row['MANAGER'],
							//'c9'=>$row['DATE']
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 保存修改
	 * @author ldm
	 */
	public function savechange(){
		$param = isset($_POST['param'])?$_POST['param']:"";
		if ($param=="")return;
		$userid = $this->getUser()->getId();
		$param = json_encode($param);
		$proxy = $this->exec('getProxy','escloud_inoroutboundws');
		$saveresult = $proxy->updateStatus($param,$userid);
		echo $saveresult;
	}
	/**
	 * 出入库筛选
	 * @author ldm
	 * modify 2013-05-21
	 */
	public  function filter_json()
	{
		$userId=$this->getUser()->getId();
		$userInfo=$this->getUser()->getInfo();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		$status = urlencode($_GET['status']);
		
		//modify 2013-05-21
		$sqlstr = explode("*", $query);
		$sqlstr = json_encode($sqlstr);
		$list=$this->exec('getProxy','escloud_inoroutboundws');
		$lists = $list->filter($page,$rp,$sqlstr,$status);
		if ($lists==""){
			return;
		}
		$con = count($lists);
		if ($con==0){return;}
		$total = $lists[$con-1]->total; 
		//modify 2013-05-21
		
		if ($lists==""){
			return;
		}
		$results = array();
		for($i=0;$i<$con-1;$i++){
			$results[]=json_decode(json_encode($lists[$i]),true);
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
		foreach($results AS $row){
			$entry = array('id'=>$row['ID'],
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id2" value='.$row['ID'].'>',
							'num'=>$row['CODE'],
							'c3'=>$row['ARCHIVE_CODE'],
							'c4'=>$row['TITLE'],
							'c5'=>$row['TYPE'],
							'c6'=>$row['STATUS'],
							'c7'=>$row['REASON'],
							'c8'=>$row['MANAGER'],
							'c9'=>$row['DATE'],
							'c10'=>$row['PAGE'],
							'c11'=>$row['NUMBER']
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 打印页面
	 * @author ldm
	 */
	public function printview(){
		$param = "inout";
		$list=$this->exec('getProxy','escloud_reportservice');
		$lists = $list->getReportIdByReporttype($param);
		return $this->renderTemplate(array('lists'=>$lists));
	}
	/**
	 * 打印
	 * @author ldm
	 */
	public function myprint(){
		$id = isset($_POST['id'])?$_POST['id']:"";
		$reportTitle = isset($_POST['reportTitle'])?$_POST['reportTitle']:"出入库单";
		$type = isset($_POST['type'])?$_POST['type']:"";
		if ($id==""||$type==""){
			return;
		}
		$myid = $_POST['myprintid'];
		$mycondition = $_POST['mycondition'];
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$userid = $this->getUser()->getId();
		$ip = $this->getClientIp();
		if ($mycondition=='false'){
			$param=array(
				"userid"=>$userid,
 				"ids"=>$myid,
				"reportId"=>$id,
 				"reportType"=>$type,
 				"reportTitle"=>$reportTitle,
				"ip"=>$ip
			);
			$result = $proxy->runSelectHoseReport(json_encode($param));
		}else{
			$sqlstr = explode("*", $mycondition);
			$param=array(
				"userid"=>$userid,
 				"condition"=>$sqlstr,
				"reportId"=>$id,
 				"reportType"=>$type,
 				"reportTitle"=>$reportTitle,
				"ip"=>$ip
				);
			$result = $proxy->runHoseReport(json_encode($param));
		}
		echo $result;
		
	}
	/**
	 * 出入库批量状态变更
	 * @author ldm
	 */
	public function batchopreate(){
	    $userid = $this->getUser()->getId();
		$sql = $_POST['param'];
		$fieldvalue = $_POST['fieldvalue'];
		$state = $_POST['state'];
		$reason = $_POST['reason'];
		$sqlstr = explode("*", $sql);
		//$sqlstr = json_encode($sqlstr);
		$param = array('status'=>$state,'reason'=>$reason,'conditions'=>$sqlstr,'detail'=>$fieldvalue);
		$param = json_encode($param);
		$proxy=$this->exec('getProxy','escloud_inoroutboundws');
		$result = $proxy->updateBatchStatus($param,$userid);
		echo $result;
	}

}