<?php
/**
 *
 * @author zhangyanxin
 * @Date 20120824
 */
class ESStoreroomAction extends ESActionBase
{
	/**
	 * @see ESActionBase::index()
	 * liuhezeng 20140711 去掉orgId 跟mainsite无用字段，新版SAAS设计已经不用这两个字段了
	*/
	public function index(){
		$proxy = $this->exec('getProxy','escloud_consumerservice');
		$userId = $this->getUser()->getId();
		$user = $this->exec('getProxy','user');
		$userinfo = $user->getUserInfo($userId);
		return $this->renderTemplate(array('userinfo'=>$userinfo));
	}
	/**
	 * @see ESActionBase::edit_warehouse()
	 * 编辑库房
	 */
	public function edit_warehouse(){
		$id=empty($_GET['id'])?1:$_GET['id'];
		$class=$this->exec('getProxy','escloud_repositoryws');
		$data=$class->getrepositoryById($id);
		return $this->renderTemplate(array('data'=>$data));
	}
	//添加一个库房addwarehouse
	//liuhezeng 20140711 去掉orgId 跟mainsite无用字段，新版SAAS设计已经不用这两个字段了
	public function addwarehouse(){
		$userId = $this->getUser()->getId();
		parse_str($_POST['data'],$out);
		$data['code']=$out['code'];
		$data['manager']=$out['manager'];
		$data['position']=$out['position'];
		$data['orgId']=$out['orgId'];
		$data['area']=$out['area'];
		$data['fireequipment']=$out['fireequipment'];
		$data['aircondition']=$out['aircondition'];
		$data['monitorequipment']=$out['monitorequipment'];
		$data['equipment']=$out['equipment'];
		$data['description']=$out['description'];
		$data['framenumber']=$out['framenumber'];
		$data['col']=$out['col'];
		$data['layer']=$out['layer'];
		$data['gridwidth']=$out['gridwidth'];
		$data=json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_repositoryws');
		$result=$Proxy->addwarehouse($userId,$data);
		echo $result;
	}
	
	//编辑一个库房addwarehouse
	//liuhezeng 20140711 去掉orgId 跟mainsite无用字段，新版SAAS设计已经不用这两个字段了
	public function editwarehouse(){
		$userId = $this->getUser()->getId();
		$id=$_GET['id'];
		parse_str($_POST['data'],$out);
		$data['id']=$id;
		$data['code']=$out['code'];
		$data['manager']=$out['manager'];
		$data['position']=$out['position'];
		$data['orgId']=$out['orgId'];
		$data['area']=$out['area'];
		$data['fireequipment']=$out['fireequipment'];
		$data['aircondition']=$out['aircondition'];
		$data['monitorequipment']=$out['monitorequipment'];
		$data['equipment']=$out['equipment'];
		$data['description']=$out['description'];
		$data['framenumber']=$out['framenumber'];
		$data['col']=$out['col'];
		$data['layer']=$out['layer'];
		$data=json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_repositoryws');
		$result=$Proxy->editwarehouse($userId,$data);
		echo $result;
	}
	//删除库房deletestoreroomlist
	public function deleteStoreroomList()
	{
		$userId = $this->getUser()->getId();
		$str=trim($_GET['data'],',');
		$arr=explode(',',$str);
		$data=json_encode($arr);
		$Proxy=$this->exec('getProxy','escloud_repositoryws');
		//删除库房服务方法
		$result=$Proxy->deletestoreroomlist($userId,$data);
		echo $result;
	}
	
	public  function set_json()
	{
		//liqiubo 20140603 标准版产品不按照机构分库房了，故给个默认值先，方便日后再扩展
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$serarchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		
		$data['serarchKeyword'] = $serarchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$postData = json_encode($data);
		$class=$this->exec('getProxy','escloud_repositoryws');
		$rows=$class->getListById($postData);
		$total = $class->countall();
		 if($rows==null){
			return;
		} 
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'id';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
			$sortArray = array();
			foreach($rows AS $key => $row){
				$sortArray[$key] = $row->$sortname;
			}
			$sortMethod = SORT_ASC;
			if($sortorder == 'desc'){
				$sortMethod = SORT_DESC;
			}
			array_multisort($sortArray, $sortMethod, $rows);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows AS $row){
			$entry = array('id'=>$row->id,
				'cell'=>array(
					'id'=>'<input type="checkbox" name="storeroomid" value="'.$row->id.'"id="storeroomid">',
					//'caozuo'=>'<img onclick="javascript:edit_warehouse('.$row->id.');" src="/apps/escloudapp/templates/public/img/mess.png" />',
					'caozuo'=>'<span class="editattr">&nbsp;</span>',
					'code'=>$row->code,
					'manager'=>$row->manager,
					'position'=>$row->position,
					'area'=>$row->area,
					'framenumber'=>$row->framenumber,
					'fireequipment'=>$row->fireequipment,
					'monitorequipment'=>$row->monitorequipment,
					'aircondition'=>$row->aircondition,
					'equipment'=>$row->equipment,
					'description'=>$row->description,
					'col'=>$row->col,
					'layer'=>$row->layer,
					'gridwidth'=>$row->gridwidth,
					'orgId'=>$row->orgId
				)
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 库房结构页面
	 */
 	public function warehouse_structure(){
 		// longjunhao 20140915 add 排架数量framenumber
 		$framenumber = isset($_POST['framenumber'])?$_POST['framenumber']:'';
 		$col = isset($_POST['col'])?$_POST['col']:'';
 		$layer = isset($_POST['layer'])?$_POST['layer']:'';
 		$gridwidth = isset($_POST['gridwidth'])?$_POST['gridwidth']:'';
		return $this->renderTemplate(array("framenumber"=>$framenumber,"col"=>$col,"layer"=>$layer,"gridwidth"=>$gridwidth));
	}
	/**
	 * 获取库房结构根节点
	 * @author ldm
	 */
	public function tree()
	{
		$houid = isset($_GET['houid'])?$_GET['houid']:"";
		if ($houid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$lists = $proxy->gettree($houid,0);
		$tree = '[';
		foreach ($lists as $k=>$val){
			$tree.='{"id":'.$val->id.',"isParent":true,"pId":'.$val->parentid.',"name":"'.$val->name.$val->code.'"},';
		}
		$tree=rtrim($tree,',');
		$tree.=']';
		echo $tree;
	}
	/**
	 * 异步获取子节点方法
	 * @author ldm
	 */
	public function getnode(){
		$houid = isset($_GET['houid'])?$_GET['houid']:"";
		$id = isset($_POST['id'])?$_POST['id']:"";
		if($id==""||$houid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$lists = $proxy->gettree($houid,$id);
		$tree = '[';
		foreach ($lists as $k=>$val){
			if ($val->isParent!="false"){
				$tree.='{"id":'.$val->id.',"isParent":true,"pId":'.$val->parentid.',"name":"'.$val->name.$val->code.'"},';
			}else {
				$tree.='{"id":'.$val->id.',"pId":'.$val->parentid.',"name":"'.$val->name.$val->code.'"},';
			}
		}
		$tree=rtrim($tree,',');
		$tree.=']';
		echo $tree;
	
	}
	/**
	 * 添加库房结构的节点页面显示
	 * @author ldm
	 */
	public function addstructure()
	{
		return $this->renderTemplate();
	}
	/**
	 * 添加库房结构的节点
	 * @author ldm
	 */
	public function addstructureval(){
		$userId = $this->getUser()->getId();
		$pid = isset($_POST['pid'])?$_POST['pid']:"";
		$houid = isset($_POST['houid'])?$_POST['houid']:"";
		if($pid==""||$houid==""){
			return;
		}
		$param = $_POST['param'];
		//echo $param;return;
		parse_str($param,$output);
		$list = array(
				'name'=>$output['name'],
				'parentid'=>$pid,
				'code'=>$output['code'],
				'repositoryid'=>$houid
		);
		$list = json_encode($list);
		//echo $list;return;
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$results = $proxy->addstructure($userId,$list);
		echo json_encode($results);
	}
	/**
	 * 批量添加库房结构的节点
	 * @author yuanzhonghua
	 * @data 20130513
	 * @params
	 */
	public function saveRepositoryStructureBatch(){
		$userId = $this->getUser()->getId();
		$parentid = isset($_POST['parentid'])?$_POST['parentid']:"";
		$repositoryid = isset($_POST['repositoryid'])?$_POST['repositoryid']:"";
		if($parentid==""||$repositoryid==""){
			return;
		}
		$param = $_POST['param'];
		parse_str($param,$output);
		$batchList=array(
				'parentid'=>$parentid,
				'repositoryid'=>$repositoryid,
				'jia'=>$output['jia'],
				'lie'=>$output['lie'],
				'ceng'=>$output['ceng'],
				'gridwidth'=>$output['gridwidth']
		);
		$batchList=json_encode($batchList);
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$result=$proxy->saveRepositoryStructureBatch($userId,$batchList);
		echo json_encode($result);
	}
	/**
	 * 库房结构编辑显示
	 * @author ldm
	 */
	public function showeditstructure(){
		$id=$_GET['id'];
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$results = $proxy->showone($id);
		return $this->renderTemplate(array('list'=>$results));
	}
	/**
	 * 库房结构编辑
	 * @author ldm
	 */
	public function editstructure(){
		$userId = $this->getUser()->getId();
		$id = $_POST['id'];
		$param = $_POST['param'];
		parse_str($param,$out);
		$list = array(
				'id'=>$id,
				'name'=>$out['name'],
				'code'=>$out['code']
		);
		$list = json_encode($list);
		//echo $list;
		//return;
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$edit = $proxy->editstructure($userId,$list);
		echo json_encode($edit);
		
	}
	/**
	 * 库房结构删除
	 * @author ldm
	 */
	public function delstructure(){
		$id = isset($_POST['id'])?$_POST['id']:"";
		$repositoryid = isset($_POST['repositoryid'])?$_POST['repositoryid']:"";
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		if ($id==""){return;}
		$params = "id=".$id."&repositoryid=".$repositoryid."&userId=".$userId."&remoteAddr=".$remoteAddr;
		parse_str($params,$out);
		$postData=json_encode($out);
		
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$results = $proxy->delstructure($postData);
		echo $results;
	}
	/**
	 * -----------------库房监控---
	 */
	/**
	 * 显示信息
	 * @author ldm
	 */
	public function monit_json(){
		$houid = isset($_GET['houid'])?$_GET['houid']:"";
		//liqiubo 20140603 标准版产品不按照机构分库房了，故给个默认值先，方便日后再扩展
		$ogid = isset($_GET['ogid'])?"1":"1";
		if($houid==""||$ogid=="")
		{
			return;
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		if($query){
			$sqlstr = explode("*", $query);
			$sqlstr = json_encode($sqlstr);
			$total = $proxy->filmonitor_count($sqlstr);
			$lists = $proxy->filmonitor(($page-1)*$rp,$rp,$houid,$sqlstr);
			if ($lists==""){
				return;
			}
		}else{
			$total = $proxy->count_monitor($houid); 
			$lists = $proxy->monitor_list($houid,($page-1)*$rp,$rp);
			if ($lists==""){
				return;
			}
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
							'ids'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
							'id'=>$row['id'],
							"modify"=>"<span class='editbtn'>&nbsp;</span>",
							'c3'=>$row['date'],
							'c4'=>$row['time'],
							'c5'=>$row['temperature'],
							'c6'=>$row['humidity']
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 库房监控的添加
	 */
	public function do_addrecords(){
		$userId = $this->getUser()->getId();
		$data = $_POST['data'];
		$houid = isset($_POST['houid'])?$_POST['houid']:"";
		//liqiubo 20140603 标准版产品不按照机构分库房了，故给个默认值先，方便日后再扩展
		$ogid = isset($_POST['ogid'])?"1":"1";
		//echo $data;
		if ($houid==""||$ogid==""){
			return;
		}
		parse_str($data,$out);
		$param = array(
				'date'=>$out['date'],
				'time'=>$out['time'],
				'temperature'=>$out['temperature'],
				'humidity'=>$out['humidity'],
				'repositoryid'=>$houid
				);
		$param = json_encode($param);
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$lists = $proxy->addmonitor($userId,$param);
		echo $lists;
	}
	/**
	 * 库房监控删除
	 * @author ldm
	 */
	public function delrecord(){
		$userId = $this->getUser()->getId();
		$ids = $_GET['id'];
		$ids= rtrim($ids,',');
		if($ids==""){return;}
		$id = explode(',', $ids);
		$id = json_encode($id);
		$proxy = $this->exec('getProxy','escloud_repositoryws');
		$result = $proxy->delmonitor($userId,$id);
		echo $result;
	}
	/**
	 * 库房监控图像显示
	 * @return void|string
	 * @author ldm
	 */
	public function line_show(){
		$houid = isset($_GET['houid'])?$_GET['houid']:"";
		$code = isset($_GET['code'])?$_GET['code']:'';
		//liqiubo 20140603 标准版产品不按照机构分库房了，故给个默认值先，方便日后再扩展
// 		$ogid = isset($_GET['ogid'])?"1":"";
// 		if($houid==""||$ogid=="")
// 		{
// 			return;
// 		}

		$proxy=$this->exec('getProxy','escloud_repositoryws');
		
		// longjunhao 20140919 add 过滤
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		if($query){
			$sqlstr = explode("*", $query);
			$sqlstr = json_encode($sqlstr);
			$lists = $proxy->img_list_filter($houid, $sqlstr);
		}else{
			$lists = $proxy->img_list($houid);
		}
		$lists = json_encode($lists);
		return $this->renderTemplate(array('list'=>$lists,'code'=>$code));
	}
	/**
	 * -----------------库房报表---
	 */
	/**
	 * @see ESActionBase::warehouse_report()
	 * 库房报表
	 */
	public function warehouse_report(){
		return $this->renderTemplate();
	}
	/**
	 * 报表数据显示
	 * @author ldm
	 */
	public function report_json(){
		$houid = isset($_GET['houid'])?$_GET['houid']:"";
		$ogid = isset($_GET['ogid'])?$_GET['ogid']:"";
		if($houid==""||$ogid=="")
		{
			return;
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		//$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		if($query){
			$sqlstr = explode("*", $query);
			$sqlstr = json_encode($sqlstr);
			$lists = $proxy->filmonitor($sqlstr);
			if ($lists==""){
				return;
			}
		}else{
				
			$lists = $proxy->monitor_list($houid,$ogid);
			if ($lists==""){
				return;
			}
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
		$total = count($results);
		$results = array_slice($results,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		//$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
							'c3'=>$row['date'],
							'c4'=>$row['time'],
							'c5'=>$row['temperature'],
							'c6'=>$row['humidity']
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author yzh
	 * 验证库房编号的唯一性
	 */
	public function validatewareCode(){
		$code = isset($_POST['code'])?$_POST['code']:'';
		//liqiubo 20140603 标准版产品不按照机构分库房了，故给个默认值先，方便日后再扩展
		$list=array(
				'code'=>$code
			);
		$lists=json_encode($list);
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$data=$proxy->validateCode($lists);
		echo $data;
	}
	/**
	 * @author yzh
	 * 库房报表表单的打印
	 */
	public function getWarehouseDataByModel(){
		$warehouseModel=$_GET['warehouseModel'];
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$data=$proxy->getReportIdByReporttype($warehouseModel);
		echo json_encode($data);
	}
	/**
	 * @author yzh
	 * 库房报表打印
	 */
	public function printWarehousePage(){
		$warehouseId=$_POST['warehouseId'];
		$warehouseType=$_POST['warehouseType'];
		$reportTitle=$_POST['reportTitle'];
		$ids=explode(',',$_POST['ids']);
		$proxy=$this->exec("getProxy","escloud_reportservice");
		$userid = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param=array('userid'=>$userid,
					'ids'=>$ids,
					'reportId'=>$warehouseId,
					'reportType'=>$warehouseType,
					'reportTitle'=>$reportTitle,
					'ip'=>$ip
			);
		$result=$proxy->printWarehouseForm(json_encode($param));
		echo $result;
	}
	
	/**
	 * 编辑库房监控的数据记录
	 * @author longjunhao 20140809
	 */
	public function edit_records(){
		$id = $_POST['id'];
		$date = $_POST['date'];
		$time = $_POST['time'];
		$temperature = $_POST['temperature'];
		$humidity = $_POST['humidity'];
		
		$data = $id.",".$date.",".$time.",".$temperature.",".$humidity;
		$data = htmlspecialchars($data);
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/**
	 * 库房监控的编辑
	 * @author longjunhao 20140809
	 */
	public function do_editrecords(){
		$houid = isset($_POST['houid'])?$_POST['houid']:"";
		//liqiubo 20140603 标准版产品不按照机构分库房了，故给个默认值先，方便日后再扩展
		$ogid = isset($_POST['ogid'])?"1":"1";
		//echo $data;
		if ($houid==""||$ogid==""){
			return;
		}
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$params = $_POST['data']."&repositoryid=".$houid;
		parse_str($params,$out);
		$postData=json_encode($out);
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$lists = $proxy->editmonitor($postData,$userId,$ip);
		echo $lists;
	}
	
	/**
	 * 判断格子的剩余宽度能否上架
	 * @author longjunhao 20140827
	 */
	public function checkRepositorypathThickness(){
		$repositorypath = $_POST['repositorypath'];
		$thickness = $_POST['thickness'];
		$params = "repositorypath=".$repositorypath."&thickness=".$thickness."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_repositoryws');
		$result=$Proxy->checkRepositorypathThickness($postData);
		echo $result;
	}
	
	public function setUserIdFor3DStore(){
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$Proxy=$this->exec('getProxy','escloud_repositoryws');
		$Proxy->setUserIdFor3DStore($userId);
	}
}