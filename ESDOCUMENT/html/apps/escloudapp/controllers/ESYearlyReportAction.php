<?php
/**
 *
 * @author zhangyanxin
 *
 */
class ESYearlyReportAction extends ESActionBase
{
	/**
	 * 模块收入
	 * @see ESActionBase::index()
	 */
	public function index()
	{
		// longjunhao 20140524 修改为能创建任何层级的节点
		
// 		$auth=$this->exec('getProxy','escloud_authservice');
// 		$rolelist=$auth->getRolehasBangUser($this->getUser()->getId());
		// 管理员层级, 1：集团管理员，2：省分管理员，3：地市管理员
		$managerLevel = 1;  // 暂时又4改为1
// 		foreach ($rolelist as $role) {
// 			switch ($role->roleCode) {
// 				case "groupManager":
// 					$managerLevel = min($managerLevel, 1);
// 					break;
// 				case "provinceManager":
// 					$managerLevel = min($managerLevel, 2);
// 					break;
// 				case "cityManager":
// 					$managerLevel = min($managerLevel, 3);
// 					break;
// 			}
// 		}
// 		if($managerLevel==4) $managerLevel = 0; // 无年报管理权限
		$userinfo = $this->exec("getProxy", "user")->getUserInfo($this->getUser()->getId());
		// 省分代码
		$provinceCode = $userinfo->mainSite;
		// 机构ID
		$orgId = $userinfo->deptEntry->orgid;
		
		return $this->renderTemplate(array("managerLevel"=>$managerLevel, "provinceCode"=>strtolower($provinceCode), "orgId"=>$orgId));
	}
	
	/**
	 * 异步获取年报树节点
	 * @author dengguoqi 2012-11-05
	 * wanghongchen edit 20140617 修改为map传参
	 */
	public function getTree()
	{
		$managerLevel = $_GET['managerLevel'];
		$provinceCode = $_GET['provinceCode'];
		$orgId = $_GET['orgId'];
		if($managerLevel == 0){
			echo json_encode(array(array("id"=>"0","name"=>"无年报管理权限","parentid"=>"-1","level_number"=>"0")));
			return;
		}
		if(!isset($_POST["id"])){
			$parentId = 0;
			$root = array(array("id"=>"0","name"=>"年报目录树","parentid"=>"-1","level_number"=>"0","open"=>true));
		} else {
			$parentId = $_POST["id"];
		}
		$bigOrgId = $this->getUser()->getBigOrgId();
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		$param = json_encode(array('parentId'=>$parentId, 'level_number'=>$managerLevel, 'province_code'=>$provinceCode, 'organization_id'=>$orgId, 'bigOrgId'=>$bigOrgId));
		$treelist=$proxy->findDirTree($param);
		if(count($treelist) > 0) $root[0]["isParent"] = "true";
		if($parentId == 0) $treelist = array_merge($root, $treelist);
		echo json_encode($treelist);
	}
	/**
	 * 获取年报列表，分页排序
	 * @author dengguoqi 20121105
	 * @
	 */
	public function getYearnewsList()
	{
		$jsonData = array('page'=>0,'total'=>0,'rows'=>array());
		if(isset($_GET['treeId'])){
			$page = isset($_POST['page']) ? $_POST['page'] : 1;
			$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
			$treeId = $_GET['treeId'];
			
			$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
			$total=$proxy->yearnewspaperGridbyid($treeId);
			if($total != 0){
				$jsonData["page"] = $page;
				$jsonData["total"] = $total;
				$yearlist=$proxy->getYearnewspaperList($treeId, $page, $rp);
				foreach ($yearlist as $year){
					$oprearte='';
// 					if($year->mark!='汇总年报'){
						$oprearte="<span class='relation' title='设置对应'>&nbsp;</span>";
// 					}
					$entry = array('id'=>$year->id,
							'cell'=>array_merge(array("yearcheckcol"=>"<input type='checkbox' id='tRow".$year->id."' name='yearcheck' value='".$year->id."'>",
									"operate"=>"<span class='editbtn' title='编辑年报'>&nbsp;</span>&nbsp;".$oprearte,
									"yeartype"=>$year->typeid==2?"档基2表":"档基3表"
									), json_decode(json_encode($year), true)),
							);
					$jsonData['rows'][] = $entry;
				}
			} 
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取人员信息列表，分页排序
	 * @author dengguoqi 20121105
	 */
	public function getPersonalList()
	{
		$jsonData = array('page'=>0,'total'=>0,'rows'=>array());
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$query = isset($_POST['query']) ? $_POST['query'] : "";
		
		$managerLevel = $_GET['managerLevel'];
		$provinceCode = $_GET['provinceCode'];
		$orgId = $_GET['orgId'];
		
		$orgQuery = "record_id='".$orgId."'";
		
		if (strlen($query) > 0) {
			$query = "(".$query.") and (".$orgQuery.")";
		} else {
			$query = $orgQuery;
		}
		
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		if (strlen($query) > 0){
			$total=$proxy->personnelScreeningcountall($query);
		} else {
			$total=$proxy->personnelCountAll();
		}
		if($total != 0){
			$jsonData["page"] = $page;
			$jsonData["total"] = $total;
			if(strlen($query) > 0){
				$personallist=$proxy->personnelScreening($page, $rp, $query);
			} else {
				$personallist=$proxy->findEssYearnewspaperPersonnelList($page, $rp);
			}
			foreach ($personallist as $personal){
				$entry = array('id'=>$personal->id,
						'cell'=>array_merge(array("personcheckcol"=>"<input type='checkbox' name='personcheck'>",
								"operate"=>"<span class='editbtn' title='编辑年报'>&nbsp;</span>"
								), json_decode(json_encode($personal), true)),
						);
				$jsonData['rows'][] = $entry;
			}
		} 
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取设备信息列表，分页排序
	 * @author dengguoqi 20121105
	 */
	public function getDeviceList()
	{
		$jsonData = array('page'=>0,'total'=>0,'rows'=>array());
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$query = isset($_POST['query']) ? $_POST['query'] : "";
		
		$managerLevel = $_GET['managerLevel'];
		$provinceCode = $_GET['provinceCode'];
		$orgId = $_GET['orgId'];
		
		$orgQuery = "organization_id='".$orgId."'";
		
		if (strlen($query) > 0) {
			$query = "(".$query.") and (".$orgQuery.")";
		} else {
			$query = $orgQuery;
		}
		
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		if (strlen($query) > 0){
			$total=$proxy->diviceScreeningcountall($query);
		} else {
			$total=$proxy->diviceCountAll();
		}
		if($total != 0){
			$jsonData["page"] = $page;
			$jsonData["total"] = $total;
			if(strlen($query) > 0){
				$devicelist=$proxy->diviceScreening($page, $rp, $query);
			} else {
				$devicelist=$proxy->findEssYearnewspaperDiviceList($page, $rp);
			}
			foreach ($devicelist as $device){
				$entry = array('id'=>$device->id,
						'cell'=>array_merge(array("devicecheckcol"=>"<input type='checkbox' name='devicecheck'>",
								"operate"=>"<span class='editbtn' title='编辑年报'>&nbsp;</span>",
								), json_decode(json_encode($device), true)),
						);
				$jsonData['rows'][] = $entry;
			}
		} 
		echo json_encode($jsonData);
	}
	/**
	 * 添加年报树节点
	 * @author dengguoqi 20121106
	 */
	public function addTreenode(){
		$parentid = isset($_GET["parentid"])?$_GET["parentid"]:"";
		$name = isset($_GET["name"])?$_GET["name"]:"";
		$level_number = isset($_GET["level_number"])?$_GET["level_number"]:"";
		$province_code = isset($_GET["province_code"])?$_GET["province_code"]:"";
		$organization_id = isset($_GET["organization_id"])?$_GET["organization_id"]:"";
		
		$result = array("result"=>"ok");
		$bigOrgId = $this->getUser()->getBigOrgId();
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		$treenode=$proxy->addChildNode(json_encode(array(
				"parentid"=>$parentid,
				"name"=>$name,
				"level_number"=>$level_number,
				"province_code"=>$province_code,
				"organization_id"=>$organization_id,
				"userId"=>$userId,
				"remoteAddr"=>$remoteAddr,
				"bigOrgId"=>$bigOrgId
				)));
		if ($treenode->name) {
			$result["treenode"] = $treenode;
		} else {
			$result["result"] = "";
		}
		echo json_encode($result);
	}
	
	/**
	 * 编辑年报树节点
	 * @author dengguoqi 20121106
	 */
	public function editTreenode(){
		$id = isset($_GET["id"])?$_GET["id"]:"";
		$parentid = isset($_GET["parentid"])?$_GET["parentid"]:"";
		$name = isset($_GET["name"])?$_GET["name"]:"";
		$level_number = isset($_GET["level_number"])?$_GET["level_number"]:"";
		$province_code = isset($_GET["province_code"])?$_GET["province_code"]:"";
		$organization_id = isset($_GET["organization_id"])?$_GET["organization_id"]:"";
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$result = array("result"=>"ok");
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		$treenode=$proxy->updateNode(json_encode(array(
				"id"=>$id,
				"parentid"=>$parentid,
				"name"=>$name,
				"level_number"=>$level_number,
				"province_code"=>$province_code,
				"organization_id"=>$organization_id,
				"userId"=>$userId,
				"ip"=>$ip
				)));
		if (!$treenode) {
			$result["result"] = "";
		}
		echo json_encode($result);
	}

	/**
	 * 删除年报树节点
	 * @author dengguoqi 20121106
	 * modify            20120328
	 */
	public function deleteTreenode(){
		$id = isset($_GET["id"])?$_GET["id"]:"";
		$result = array("result"=>"ok");
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		//wanghongchen 20140829 增加ip，userId参数，用于记录日志
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param = json_encode(array("id"=>$id,"userId"=>$userId,"ip"=>$ip));
		$rtn=$proxy->deleteNode($param);
		if($rtn==0){
			$result["result"]='ok';
		}elseif($rtn==1){
			$result["result"]='nodeFail';
		}elseif($rtn==2){
			$result["result"]='fail';
		}
		echo json_encode($result);
	}
	
	/**
	 * @author dengguoqi
	 * 年报添加页面
	 * */
	public function add(){
		$yearType = $_POST["yearType"];
		$treeId = $_POST["treeId"];
		$nodeText = $_POST["nodeText"];
		$datacsdis = "0";
		$userName = json_decode(json_encode($this->getUser()->getInfo()))->userName;
		$yearnews = array("yearnews"=>array("fillyear"=>date("Y"),"treeid"=>$treeId), "canEdit"=>true, 'datacsdis'=>$datacsdis, "yearPaper_id"=>-1,"userName"=>$userName,"nodeText"=>$nodeText);
		if($yearType == 2) {
			$yearnews["yearnews"]["typeid"] = 2;
			return $this->renderTemplate($yearnews, "ESYearlyReport/yearnews2");
		} else {
			$yearnews["yearnews"]["typeid"] = 3;
			return $this->renderTemplate($yearnews, "ESYearlyReport/yearnews3");
		}
	}
	
	/**
	 * 编辑年报
	 * @author dengguoqi 20121108
	 */
	public function edit(){
		$yearId = $_POST["yearId"];
		$canEdit = $_POST["canEdit"];
		$status = $_POST["status"];
		$datacsdis = true;//$_POST["datacs"];
		$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		$yearnews = $proxy->getYearnewspaper($yearId);
		if($yearnews->typeid == 2) {
			return $this->renderTemplate(array("yearnews"=>$yearnews, "yearPaper_id"=>$yearId, "canEdit"=>$canEdit, "status"=>$status, 'datacsdis'=>$datacsdis,"userName"=>"","nodeText"=>""), "ESYearlyReport/yearnews2");
		} else {
			return $this->renderTemplate(array("yearnews"=>$yearnews, "yearPaper_id"=>$yearId, "canEdit"=>$canEdit, "status"=>$status, 'datacsdis'=>$datacsdis,"userName"=>"","nodeText"=>""), "ESYearlyReport/yearnews3");
		}
	}
	
	/**
	 * 打开设置对应
	 * @author dengguoqi 20121113
	 */
	public function setRelation(){
		$yearId = $_GET["yearId"];
		$typeId = $_GET["typeId"];
		$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		$yearnews = $proxy->getYearnewspaper($yearId);
		$yearnewsCondition = $proxy->getYearnewspaperCondition($yearId);
		$conditionCN = $proxy->getConditionYearNewspaper($yearId);
		if($typeId == 2) {
			return $this->renderTemplate(array("yearnews"=>$yearnews,"conditions"=>$yearnewsCondition, "yearId"=>$yearId, "conditionCN"=>$conditionCN), "ESYearlyReport/setrelation2");
		} else {
			return $this->renderTemplate(array("yearnews"=>$yearnews,"conditions"=>$yearnewsCondition, "yearId"=>$yearId, "conditionCN"=>$conditionCN), "ESYearlyReport/setrelation3");
		}
	}
	
	/**
	 * 保存设置对应条件
	 */
	public function setRelationCondition(){
		if(isset($_POST["condition"]) && isset($_GET["yearId"])){
			$condition = $_POST["condition"];
			$yearId = $_GET["yearId"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->setStatCondition($yearId, json_encode($condition));
// 			echo json_encode($result->pkgpath);
			echo json_encode(array('pathTitle'=>$result->pathTitle,'pkgpath'=>$result->pkgpath));
		} else {
			echo false;	
		}
	}
	
	/**
	 * 获取设置对应条件
	 * @author longjunhao 20140912
	 */
	public function getRelationCondition(){
		if(isset($_POST["field"]) && isset($_POST["yearId"])){
			$field = $_POST["field"];
			$yearId = $_POST["yearId"];
			$param = json_encode(array('field'=>$field,'yearId'=>$yearId));
			
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->getStatCondition($param);
// 			echo json_encode($result->pathTitle);
			echo json_encode($result);
		} else {
			echo false;
		}
	}
	
	/**
	 * -------获取档案库名称和结构名称-------
	 */
	public function getLibAndStructure(){
		$json = array("lib"=>"1", "structure"=>"2");
		if(isset($_POST["path"])){
			$path = $_POST["path"];
			$proxy = $this->exec('getProxy','escloud_structurews');
			$libinfo = $proxy->getPathInfo($path);
			$json["lib"] = $libinfo->node;
			$json["structure"] = $libinfo->strcuture;
		}
		echo json_encode($json);
	}
	
	/**
	 * 渲染设置统计条件模板
	 */
	public function statistic(){
		$yearid = isset($_POST['yearid']) ? $_POST['yearid'] : "";
		$field = isset($_POST['field']) ? $_POST['field'] : "";
		return $this->renderTemplate(array('yearid'=>$yearid,'field'=>$field));
	}
	/**
	 * 获取档案库名称和结构名称列表
	 */
	public function getstatistic(){
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$rp = isset($rp) ? $rp : 10;
		$i=1;
		$start=($page-1)*$rp;
		$userId=$this->getUser()->getId();
		$userInfo=$this->getUser()->getInfo();
		$userId=!empty($userId)?$userId:0;
		
		$yearid = isset($_GET['yearid']) ? $_GET['yearid'] : "";
		$field = isset($_GET['field']) ? $_GET['field'] : "";
		$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		$result = $proxy->getConditions($yearid,$field);
		$result = json_decode(json_encode($result),true);
		$total = count($result);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($result as $row){
			if(!$row['conditions']){
				$condit = '<input id="'.$i.'" name="'.$row['structureid'].'" type="hidden" size="30" value=""/>';
				$condit_cn = '<input id="'.$i.'_cn" name="'.$row['structureid'].'" type="text" size="30" value="" placeholder="单击选择统计条件" />';
				$condit_return = '<input id="'.$i.'_return" name="'.$row['structureid'].'" type="hidden" size="30" value=""/>';
			} else {
				$condit = '<input id="'.$i.'" name="'.$row['structureid'].'" type="hidden" size="30" value="'.$row['conditions'].'"/>';
				$condit_cn = '<input id="'.$i.'_cn" name="'.$row['structureid'].'" type="text" size="30" value="'.$row['conditions_cn'].'" placeholder="单击选择统计条件" />';
				$condit_return = '<input id="'.$i.'_return" name="'.$row['structureid'].'" type="hidden" size="30" value="'.$row['conditions_return'].'"/>';
			}
			$entry = array(
					'cell'=>array(
							'id'=>$i,
							'num'=>$i,
							'ids'=>'<input type="checkbox" name="id" value="'.$row['id'].'">',
							'class'=>empty($row['filetype']) ? '&nbsp;' : $row['filetype'],
							'library'=>empty($row['filelibrary']) ? '&nbsp;' : $row['filelibrary'],
							'condition_cn'=>$condit_cn,
							'condition'=>$condit,
							'condition_return'=>$condit_return
					),
			);
			$jsonData['rows'][] = $entry;
			$i++;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 保存设置统计条件
	 */
	public function savecondition(){
		if(isset($_POST["condition"])){
			$condition = $_POST["condition"];
			$kname = array('id', 'conditions', 'conditions_cn', 'conditions_return');
			for($i=0;$i<count($condition);$i++){
				$temp[$i] = explode('|',$condition[$i]);
				$list[$i] = array_combine($kname, $temp[$i]);
			}
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			echo $proxy->updateConditions(json_encode($list));
		} else {
			echo false;
		}
	}
	
	/**
	 * 取消对应设置
	 * @author dengguoqi 20121113
	 */
	public function cancelRelation(){
		if(isset($_POST["yearId"]) && isset($_POST["field"])){
			$yearId = $_POST["yearId"]; 
			$field = $_POST["field"]; 
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			echo $proxy->deleteCondition($yearId, $field);
		} else {
			echo false;	
		}
	}
	
	public function selectcondition(){
		// longjunhao 20140913 修复bug627
// 		$res = $this->exec("getProxy", "escloud_structurews")->getStrucAllWithSysTagList($_POST['sId']);
		// longjunhao 20141011 修复bug1312
		$res = $this->exec("getProxy", "escloud_structurews")->getStrucAllWithSysTagListForAnnals($_POST['sId']);
		$options = "<option value='-'>-请选择-</option>";
		$datatypes = array();
		$conditions = $_POST['conditions'];
		$conditions_return = $_POST['conditions_return'];
		foreach ($res as $value)
		{
			$datatypes[$value->NAME] = $value->ESTYPE;
			$options .= "<option value='".$value->NAME."'>".$value->ESIDENTIFIER."</option>";
		}
		return $this->renderTemplate(array('options'=>$options, 'datatypes'=>$datatypes, 'conditions'=>$conditions, 'conditions_return'=>$conditions_return));
	}
	/**
	 * 删除选择的年报
	 * @author dengguoqi 20121112
	 */
	public function delete(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["ids"])){
			$ids = $_POST["ids"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->deleteBacthYearnewspaperGrid($userId,json_encode($ids));
			echo $result;
		} else {
			echo 0;
		}
	}
	
	/**
	 * 保存年报
	 * @author dengguoqi 20121108
	 */
	public function save(){
		$userId=$this->getUser()->getId();
		$result = array();
		if(isset($_POST["yearnews"])){
			$yearnews = $_POST["yearnews"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			if($yearnews["id"] > 0){ //编辑保存
				$result["id"] = $proxy->updateYearnewspaperGrid($userId,json_encode($yearnews));
			} else {//添加保存
				$result["id"] = $proxy->addYearnewspaperGrid($userId,json_encode($yearnews));
			}
			$result["result"] = true;
			if ($result["id"] == 0) {
				$result["result"] = false;
				$result["msg"] = "已有同年度的年报，不能重复添加！";
			}
		} else {
			$result["result"] = false;
			$result["msg"] = "不能保存空年报";
		}
		echo json_encode($result);
	}
	
	/**
	 * 自动统计
	 * @author dengguoqi 20121115
	 */
	public function autoStat(){
		if(isset($_GET["yearId"]) && isset($_GET["typeId"])){
			$yearId = $_GET["yearId"];
			$typeId = $_GET["typeId"];
			$userId = $this->getUser()->getId();
			
			$managerLevel = $_GET['managerLevel'];
			$provinceCode = $_GET['provinceCode'];
			$orgId = $_GET['orgId'];
		
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$yearstat = $proxy->autoStatYearnewspaper($yearId, $orgId, $userId);
		} else {
			$yearstat = array();
		}
		echo json_encode($yearstat);
	}
	
	/**
	 * 年报汇总
	 * @author dengguoqi 20121127
	 */
	public function summary(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["treeId"]) && isset($_POST["exType"])){
			$treeId = $_POST["treeId"];
			$exType = $_POST["exType"];
			$textNode = $_POST["textNode"];
			$params = array("treeId" => $treeId, "exType" => $exType, "textNode" => $textNode);
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->yearnewspaperSummary($userId,json_encode($params));
		} else {
			$result = array();
		}
		echo json_encode($result);
	}
	
	/**
	 * 年报导出  下载的都是zip文件
	 * @author longjunhao 20140530
	 */
	public function reportedPlateExport(){
		if(isset($_POST["treeId"])){
			$treeId = $_POST["treeId"];
			$nodeText = isset($_POST["nodeText"]) ? $_POST["nodeText"] : '';
			$params = array("nodeText" => $nodeText,"userId"=>$this->getUser()->getId(),"ip"=>$this->getClientIp());
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->reportedPlateExport($treeId,json_encode($params));//导出上报盘
		} else {
			$result = array();
		}
		echo json_encode($result);
	}
	
	/**
	 * 年报导出 longjunhao 20140528 下载的都是zip文件
	 * @author dengguoqi 20121127
	 */
	public function export(){
		if(isset($_GET["yearId"])){
			$yearId = $_GET["yearId"];
			$type= isset($_GET["type"]) ?$_GET["type"] : 'xls';
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$userId = $this->getUser()->getId();
			$ip = $this->getClientIp();
			$param = json_encode(array("yearId"=>$yearId,"userId"=>$userId,"ip"=>$ip));
			if($type=='xml'){
				$yearnews = $proxy->yearnewspaperExports($param);//导出xml格式
				echo $yearnews;
			}else{
				$yearnews = $proxy->yearnewspaperExport($param);//导出excel格式
				echo $yearnews;
			}
		}
	}
	
	/**
	 * 添加人员界面
	 * @author dengguoqi 20121116
	 * @return string
	 */
	public function addPerson(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["person"])){
			$person = $_POST["person"];
			unset($person["id"]);
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			echo $proxy->addEssYearnewspaperPersonnel($userId,json_encode($person));
		}
	}
	
	/**
	 * 修改人员界面
	 * @author dengguoqi 20121116
	 */
	public function editPerson(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["person"])){
			$person = $_POST["person"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			echo $proxy->updateEssYearnewspaperPersonnel($userId,json_encode($person));
		}
	}
	
	/**
	 * 删除人员
	 * @author dengguoqi 20121116
	 */
	public function deletePerson(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["ids"])){
			$ids = $_POST["ids"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->deleteBatchEssYearnewspaperPersonnel($userId,json_encode($ids));
			echo $result;
		} else {
			echo 0;
		}
	}
	
	/**
	 * 人员筛选条件
	 * @author dengguoqi 20121119
	 */
	public function personcondition(){
		$options = array("<option value='-'>-请选择-</option>");
		$options[] = "<option value='name'>姓名</option>";
		$options[] = "<option value='gender'>性别</option>";
		$options[] = "<option value='birthday'>出生日期</option>";
		$options[] = "<option value='organization'>机构</option>";
		$options[] = "<option value='full_part_time'>专/兼职</option>";
		$options[] = "<option value='cultural_level'>文化程度</option>";
		$options[] = "<option value='file_professional_degree'>档案专业程度</option>";
		$options[] = "<option value='post'>档案干部专业技术职务</option>";
		$datatypes = array();
		return $this->renderTemplate(array('options'=>implode("", $options), "datatypes"=>$datatypes),"ESYearlyReport/selectcondition");
	}
	
	/**
	 * 添加设备界面
	 * @author dengguoqi 20121116
	 * @return string
	 */
	public function addDevice(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["device"])){
			$device = $_POST["device"];
			unset($device["id"]);
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			echo $proxy->addEssYearnewspaperDivice($userId,json_encode($device));
		}
	}
	
	/**
	 * 修改设备界面
	 * @author dengguoqi 20121116
	 */
	public function editDevice(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["device"])){
			$device = $_POST["device"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			echo $proxy->updateEssYearnewspaperDivice($userId,json_encode($device));
		}
	}
	
	/**
	 * 删除设备
	 * @author dengguoqi 20121116
	 */
	public function deleteDevice(){
		$userId=$this->getUser()->getId();
		if(isset($_POST["ids"])){
			$ids = $_POST["ids"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->deleteBatchEssYearnewspaperDivice($userId,json_encode($ids));
			echo $result;
		} else {
			echo 0;
		}
	}
	
	/**
	 * 设备筛选条件
	 * @author dengguoqi 20121119
	 */
	public function devicecondition(){
		$options = array("<option value='-'>-请选择-</option>");
		$options[] = "<option value='organization'>机构</option>";
		$options[] = "<option value='divice_type'>设备类型</option>";
		$options[] = "<option value='divice_name'>设备名称</option>";
		$options[] = "<option value='amount'>数量</option>";
		$datatypes = array();
		return $this->renderTemplate(array('options'=>implode("", $options), "datatypes"=>$datatypes),"ESYearlyReport/selectcondition");
	}
	
	public function setIsReport(){
		if(isset($_POST["yearId"]) && isset($_POST["isReport"])){
			$yearId = $_POST["yearId"];
			$isReport = $_POST["isReport"];
			$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
			$result = $proxy->updateIsreported($yearId, $isReport);
			echo $result;
		} else {
			echo 'false';
		}
		
	}
	/**
	 * @yzh  20130729
	 * 提交审批年报
	 */
	public function submityear(){
		if(isset($_POST["checkboxvalue"])){
			$checkboxvalue = $_POST['checkboxvalue'];
		}
		if(isset($_POST["bewrite"])){
			$bewrite = $_POST['bewrite'];
		}
		if(!isset($_POST['approveUserId'])){
			return ;
		}else{
			$approveUserId=$_POST['approveUserId'];
		}
		$status = isset($_POST['yearstatus']) ? $_POST['yearstatus'] : '';
		$yearunit = isset($_POST['yearunit']) ? $_POST['yearunit'] : '';
		$yeary = isset($_POST['yeary']) ? $_POST['yeary'] : '';
		$yearperson = isset($_POST['yearperson']) ? $_POST['yearperson'] : '';
		$datacs=isset($_POST['datacs']) ? $_POST['datacs'] : '';
		$vars = array('id'=>$checkboxvalue,'yearnewspaper_desc'=>$bewrite,'fillunit'=>$yearunit,'yearnewspaper_type'=>$datacs,'fillyear'=>$yeary,'lister'=>$yearperson,'status'=>$status);
		$userId = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		echo $result = $proxy->startYearnews($userId,json_encode($vars),$approveUserId);
	}

	/**
	 * 提交审批年报列表
	 */
	public function submitok(){
		$disabled = "disabled";
		if(isset($_POST["path"])){
			$path = explode(',',$_POST['path']);
			$kname = array('id','yearclass','yeary','yearstatus','yearperson','yearunit','yearid','datacs');
			for($i=0;$i<count($path);$i++){
				$temp[$i] = explode('|',$path[$i]);
				$list[$i] = array_combine($kname, $temp[$i]);
			}
		}
		return $this->renderTemplate(array('list'=>$list,'disabled'=>$disabled),"ESYearlyReport/submityear");
	}
	/**
	 * 查看附件
	 */
	public function datacs(){
		$yearId = $_GET["yearId"];
		$datacsdis = 'c';
		$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		$yearnews = $proxy->getYearnewspaper($yearId);
		if($yearnews->typeid == 2) {
			return $this->renderTemplate(array("yearnews"=>$yearnews, "datacsdis"=>$datacsdis, 'canEdit'=>true ), "ESYearlyReport/yearnews2");
		} else {
			return $this->renderTemplate(array("yearnews"=>$yearnews, "datacsdis"=>$datacsdis,  'canEdit'=>true ), "ESYearlyReport/yearnews3");
		}
	}
	/**
	 * 复制
	 */
	public function copydata(){
		return $this->renderTemplate();
	}
	public function yearnewspaperCopy(){
		$userId=$this->getUser()->getId();
		$yearId = isset($_POST['yearId']) ? $_POST['yearId'] : '';
		$treeId = isset($_POST['treeId']) ? $_POST['treeId'] : '';
		$proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		echo $result = $proxy->dataCopy($userId,$yearId,$treeId);
	}
	/**
	 * @yzh  20130729
	 * $userId 所选用户ID中的任意一个
	 * 查找部门的领导
	 */
	public function findLeader(){
		$userId=$this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_authservice');
		$result=$proxy->findLeaderByuserId($userId);
		//print_r($result);exit;
		return $this->renderTemplate(array('result'=>$result),"ESYearlyReport/submitUser");
	}
	
	/**
	 * 获取检测接收上报盘文件功能rest服务地址
	 * @author longjunhao 20140603
	 */
	public function checkBeforeAcceptReportedPlate(){
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		$data=$proxy->checkBeforeAcceptReportedPlate();
		echo $data;
	}
	
	/**
	 * 接收上报盘文件功能rest服务地址
	 * @author longjunhao 20140603
	 */
	public function acceptReportedPlate(){
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		$data=$proxy->acceptReportedPlate();
		echo $data;
	}
	
	/**
	 * @author wanghongchen
	 * 下载
	 */
	public function fileDown()
	{
		$fileUrl = $_GET['fileUrl'];
		$filName=basename($fileUrl);
		$filName=urlencode($filName);// longjunhao 20140724 解决年报导出中文乱码问题，不知道会不会引起其它错误
		Header("Content-type: application/octet-stream;");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	
	}
	/**
	 * @author gaoyide
	 * 下载SVG  
	 */
	public function fileDownSVG()
	{
		/* $proxy = $this->exec('getProxy','escloud_yearnewspaperservice');
		$fileUrl = $proxy->getSVGAddress();
		$fileUrl = $fileUrl."/SVGView.exe"; */
		//$fileUrl = $_GET["filepath"];
		$fileUrl = $this->exec("getPublicPath");
		$tempstr = strstr($fileUrl,"files");
		$fileUrl = strstr($fileUrl, $tempstr,TRUE);
		$fileUrl = $fileUrl."files/download/SVGView.exe";
		$filName=basename($fileUrl);
		$filName=urlencode($filName);
		Header("Content-type: application/octet-stream;");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		} 
	}
	/**
	 * 根据id删除条件
	 * @author longjunhao 20140913
	 */
	public function deleteConditionByIds(){
		$ids = $_POST['ids'];
		$params = "ids=".$ids."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$proxy=$this->exec('getProxy','escloud_yearnewspaperservice');
		$result=$proxy->deleteConditionByIds($postData);
		echo $result;
	} 
	
	/**
	 * @author longjunhao 20141013
	 */
	public function getStructureTreeInfo(){
		$sId=$_POST['sid'];
		$path = $_POST['path'];
		$status=$_POST['status'];//获取当前业务的状态
		$params = "sId=".$sId."&path=".$path."&status=".$status."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$proxy=$this->exec('getProxy','escloud_structurews');
		$treelist=$proxy->getStructureTreeInfo($postData);
		$tmp = array();
		foreach ($treelist as $key => $value)
		{
			$tmp[$key]['id'] =$value->id;
			$tmp[$key]['sId'] =$value->id;
			$tmp[$key]['pId'] = $value->pId;
			$tmp[$key]['name'] = $value->name.'('.$value->id.')';
			$tmp[$key]['path'] = $value->path; 
		}
		echo json_encode($tmp);
	}
	
	/**
	 * 获取树节点(不含分组)
	 * @author longjunhao 20141015
	 */
	public function getTreeNodes() {
		$proxy=$this->exec('getProxy','escloud_businesstreews');
		$request=$this->getRequest();
		$status=$request->getGet('status');//获取当前业务的状态
		$userId=$this->getUser()->getId();
		$treelist=$proxy->getBusinessAuthorTreeForWFAttachData('1',$status,$userId);
		foreach($treelist as $val){
			if($val->pId==0)
			{
				$val->open=true;
				break;
			}
		}
		echo json_encode($treelist);
	}
}