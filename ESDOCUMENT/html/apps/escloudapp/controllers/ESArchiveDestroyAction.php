<?php
/*
 * 
 * date 20120115
 * author fangjixiang
 * 
 */
class ESArchiveDestroyAction extends ESActionBase{
	
	// 获得文档类型树
	public function getTree()
	{
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$status = $_GET['status'];//获取当前业务的状态
		$userId = $this->getUser()->getId();
		$treelist = $proxy->getNewBusinessAuthTree('1',$status,$userId);
		//print_r($treelist); die;
		
		foreach($treelist as $k=>$v)
		{
			if($v->pId==0) $v->open = true;
		}
		
		echo json_encode($treelist);
	}
	
	
	// 新建销毁清册模板渲染
	public function create_destroy_list()
	{
		$path = $_GET['path'];
		$dt = $_GET['dt']; // 档案类型
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->getCounts($path); // 查找销毁数量、保留数量
		return $this->renderTemplate(array('DN'=>$result->DN,'DT'=>$dt));
	}
	
	// 编辑销毁清册模板渲染
	public function edit_destroy_list()
	{
		$formId = $_POST['formId'];
		$taskFlag = $_POST['taskFlag'];
		//print_r($id); die();
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->getIdentification($formId);
		
		$data['info'] = $result;
		$data['taskFlag'] = $taskFlag; // 为退回待办做标识
		/*
		echo '<pre>';
		print_r($result);
		echo '</pre>';
		die;		
		//*/
		return $this->renderTemplate($data);
	}
	
	// 编辑销毁清册模板渲染
	public function readonly_destroy_list()
	{
		$formId = $_POST['formId'];
		$taskFlag = $_POST['taskFlag']; // 待办标记
		//print_r($id); die();
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->getIdentification($formId);
		
		/*
		echo '<pre>';
		print_r($result);
		echo '</pre>';
		die;		
		//*/
		$data['info'] = $result;
		$data['taskFlag'] = $taskFlag; // 为退回待办做标识
		return $this->renderTemplate($data);
	}
	
	// 筛选表单渲染
	public function public_filter()
	{
		$options = array(
					'CODE'=> '编号',
					'TITLE'=> '标题',
					//'STATUS'=> '状态',
					'ARCHIVE_TYPE'=> '档案类别',
					'DESTROY_NUMBER'=> '销毁数量',
					'RETENTION_NUMBER'=> '保留数量',
					'DESTROY_DATE'=> '销毁日期',
					'LEADER'=> '销毁负责人',
					'SUPERINTENDENT'=> '监销人',
					'DESCRIPTION'=> '备注'
				);
		return $this->renderTemplate(array('options'=>$options));
	}
	
	// 筛选档案
	public function filter_archive()
	{
		$options = array(
				'ARCHIVE_CODE'=> '档号',
				'TITLE'=> '题名',
				'CREATE_DATE'=> '成文日期',
				'ARCHIVE_DATE'=> '归档日期',
				'CREATOR'=> '责任者',
				'RETENTION_PERIOD'=> '保管期限'
				
		);
		return $this->renderTemplate(array('options'=>$options),'ESArchiveDestroy/public_filter');
	}
	
	/*
	 * 1.根据某一状态获取信息
	 * 2.筛选条件获取信息
	 *  
	 */
	public function GetIdentificationList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = isset($_POST['query']) ? $_POST['query'] : "";
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$userId = $this->getUser()->getId();
		$result = array();
// 		if(isset($_GET['status'])){ // 获取某状态信息
		$status = $_GET['status'];
		$params = json_encode(array('pageNum'=>$page, 'pageSize'=>$limit, 'status'=>$status, 'userId'=>$userId, 'keyWord'=>$keyWord));
		$result = $proxy->getIdentificationList($params);
// 		}else{ // 筛选
// 			$condition = explode('@', $_POST['query']);
// 			array_unshift($condition, 'USERID,equal,'.$userId.',true');
// 			$result = $proxy->getIdentificationListByCondition($page,$limit,json_encode($condition));
// 		}
		
		$total = $result->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach ($result->list as $row)
			{
// 				if($row->status == 'edit'){
// 					$status = '待鉴定';
// 					$title = '编辑,提交鉴定申请';
// 				}else 
				if($row->status == 'identify' || $row->status == 'edit'){
					$status = '鉴定中';
					$title = '查看';
				}else if($row->status == 'destroy'){
					$status = '待销毁';
// 					$title = $row->difference == 'destroy' ? '查看' : '查看,提交销毁申请';
				}else if($row->status == 'destroyed'){
					$status = '已销毁';
					$title = '查看';
				}else if($row->status == 'reserve'){
					$status = '不销毁';
				}
				
				$entry = array('id'=>$row->id,
						'cell'=>array(
								'cb'=>'<input type="checkbox" name="inputs" id="'.$row->id.'" wfid="'.$row->wfid.'" status="'.$row->status.'" oswfformid="'.$row->oswfformid.'" />',
								'fn'=>'<span id="'.$row->id.'"  class="destroyopens" wfid="'.$row->wfid.'" title="'.$row->title.'" formid="'.$row->formid.'" oswfformid="'.$row->oswfformid.'" structureid="'.$row->structureid.'" userid="'.$row->userid.'" userFormNo="'.$row->code.'" ></span>',
								'code'=>$row->code,
								'title'=>$row->title,
								'status'=>$status,
								'proposer'=>$row->proposer,
								'starttime'=>$row->starttime,
								'endtime'=>$row->endtime,
								'formid'=>$row->formid,
								'wfid'=>$row->wfid,
								'oswfformid'=>$row->oswfformid,
								'destroynum'=>$row->destroynum,
								'destroyperson'=>$row->destroyperson,
								'structureid'=>$row->structureid,
								'userid'=>$row->userid
						)
				);
				$jsonData['rows'][] = $entry;
					
			}
		}
		
		echo json_encode($jsonData);
		
	}
	
	/*
	 * 新建或修改鉴定销毁单保存方法
	 * 
	 * 
	 */
	public function SaveOrUpdateIdentification()
	{
		$params = $_POST;
		$approveUserId= $_GET['approveUserId'];
		$startProcess = $_GET['startProcess'];
		$Uinfo = $this->Uinfo();
		
		$params['CODE'] = isset($_POST['CODE']) ? $_POST['CODE'] : $Uinfo['mainSite'];
		if(isset($_POST['ID'])) $params['ID'] = $_POST['ID']; // 新建清册无ID
		if(isset($_GET['path'])) $params['path'] = $_GET['path']; // 新建清册有path
		if(isset($_GET['status'])) $params['STATUS'] = $_GET['status']; // 新建清册有STATUS
		$params['USERID'] = $this->getUser()->getId();
		//print_r($params); die;
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->SaveOrUpdateIdentification(json_encode($params));
		
		//var_dump($result); die();
		if($result->success == 'true'){
			
			if($startProcess == 'open'){
				$userId = $Uinfo['uid'];
				$formId = isset($_POST['ID']) ? $_POST['ID'] : $result->id;
				$processDefinitionKey = 'AppraisalApplyProcess';
				$businessKey = 'identify_'.microtime(true)*10000;
				$isok = $proxy->startProcessInstanceAndSubmitIdentifyByKey($processDefinitionKey,$businessKey,$userId,$formId,$approveUserId);
				//var_dump($isok); die();
				
				echo $isok ? 'startProcessOk' : 'startProcessErr';
				return;
			}
			
			echo 'saveOk';
			
		}else{
			echo 'saveErr';
		}
		
	}
	
	// 发起销毁流程20130730
	public function StartProcessOfDestroy()
	{
		$processDefinitionKey = 'DestoryApplyProcess';
		$businessKey = 'destroy_'.microtime(true)*10000;
		$Uinfo = $this->Uinfo();
		$userId = $Uinfo['uid'];
		$formId = $_POST['formId'];
		$approveUserId = $_POST['approveUserId'];
		
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$isok = $proxy->startProcessOfDestroy($processDefinitionKey,$businessKey,$userId,$formId,$approveUserId);
		echo $isok;
	}

	// 根据id批量删除鉴定销毁单
	public function DeleteIdentification()
	{
		$ids = explode(',',$_POST['ids']);
		//print_r($ids); die();
		$userId = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$isok = $proxy->deleteIdentification($userId,json_encode($ids));
		echo $isok;
	}
	
	// 获取用户信息
	public function Uinfo()
	{
		$uid = $this->getUser()->getId();
		$userInfo = $this->exec("getProxy", "user")->getUserInfo($uid);
		//return $userInfo;
		$uname = $userInfo->displayName;
		$mainSite = $userInfo->mainSite;
		$info = array('uid'=>$uid, 'uname'=>$uname, 'mainSite'=>$mainSite);
		return $info;
	}
	
	
	
	// 发起待办暂时未用@2013/2/26
	public function StartProcessInstanceAndSubmitIdentifyByKey()
	{
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$formId = $_POST['formId'];
		$Uinfo = $this->Uinfo();
		$userId = $Uinfo['uid'];
		$processDefinitionKey = 'AppraisalApplyProcess';
		$businessKey = 'identify_'.microtime(true)*10000;
		$isok = $proxy->startProcessInstanceAndSubmitIdentifyByKey($processDefinitionKey,$businessKey,$userId,$formId);
		echo $isok;
	}
	
	/*
	 * 方吉祥
	* 2013/1/29
	* 档案销毁-鉴定流程
	* 根据机构ID查询这个机构下的所有用户@方吉祥
	*/
	public function FindUserListByOrgid()
	{
		$oid = $_GET['oid'];
	
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$pages = ($page-1)*$limit;
		//print_r(array($_POST,$_GET)); die;
		$proxy = $this->exec("getProxy", "escloud_consumerservice");
		$result = $proxy->findUserListByOrgid($oid,$pages,$limit);
		//print_r($result); die;
	
		$total = $result->total ? $result->total : 0;
		$userData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total){
			foreach ($result->dataList as $k=>$value){
	
				$orgName = $value->companyEntry->orgName;
				$userName = $value->userid;
				$displayName = $value->displayName;
				$deptCode = $value->deptCode;
				$ldapOrgCode = $value->companyEntry->orgid;
				$mobTel = $value->mobTel;
				$entry= array(
						'id'=>$value->userid,
						'cell'=>array(
								'linenumber'=>$k+1,
								'radio'=>'<input type="radio" value="'.$userName."@".$displayName."@".$orgName."@".$deptCode."@".$mobTel."@".$ldapOrgCode.'" name="userInfo" />',
								'userName'=>$displayName,
								'orgName'=>$orgName,
								'deptPost'=>$deptCode,
								'mobTel'=>$mobTel
						)
				);
				$userData['rows'][] = $entry;
			}
		}
	
		echo json_encode($userData);
	}
	/*
	 * shimiao 20140805 为了获取的人不是以@的连接符呈现
	* 2013/1/29
	* 档案销毁-鉴定流程
	* 根据机构ID查询这个机构下的所有用户@方吉祥
	*/
	public function FindUserListByOrgidForUsingStatic()
	{
		//xiewenda 20140928 如果oid为null 设置为all 查询所有
		if(isset($_GET['oid'])){
			$oid = $_GET['oid'];
		}else{
			$authProxy = $this->exec( "getProxy", "escloud_authservice" );
			$userId = $this->getUser()->getId();
			$isAdmin = $authProxy->isAdmin($userId);
			if ($isAdmin) {
				$oid = "all";
			} else {
				$orgProxy = $this->exec( "getProxy", "escloud_usingformws" );
				$org = $orgProxy->getOrg($userId);
				$oid = $org->orgid;
			}
		} 
		//$oid = isset($_GET['oid']) ? $_GET['oid'] : "all";
		//print_r($oid); die;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$pages = ($page-1)*$limit;
		//print_r(array($_POST,$_GET)); die;
		$proxy = $this->exec("getProxy", "escloud_consumerservice");
		$result = $proxy->findUserListByOrgid($oid,$pages,$limit);
		//print_r($result); die;
	
		$total = $result->total ? $result->total : 0;
		$userData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total){
			foreach ($result->dataList as $k=>$value){
	
				$orgName = $value->companyEntry->orgName;
				$userName = $value->userid;
				$displayName = $value->displayName;
				$deptCode = $value->deptCode;
				$ldapOrgCode = $value->companyEntry->orgid;
				$mobTel = $value->mobTel;
				$entry= array(
						'id'=>$value->userid,
						'cell'=>array(
								'linenumber'=>$k+1,
								'radio'=>'<input type="radio" value="'.$userName."??".$displayName."??".$orgName."??".$deptCode."??".$mobTel."??".$ldapOrgCode.'" name="userInfo" />',
								'userName'=>$userName,
								'displayName'=>$displayName,
								'orgName'=>$orgName,
								'deptPost'=>$deptCode,
								'mobTel'=>$mobTel
						)
				);
				$userData['rows'][] = $entry;
			}
		}
	
		echo json_encode($userData);
	}
	
	/*
	 * 方吉祥
	* 2013/1/29
	* 档案销毁-鉴定流程
	* 根据销毁清册id查询鉴定小组人员列表
	*/
	public function GetUserGroupList()
	{
		$formId = $_GET['formId'];
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->getUserGroupList($formId);
		//print_r($result); die();
	
		$total = count($result);
		$jsonData = array('page'=>1,'total'=>$total,'rows'=>array());
		if($total){
				
			foreach($result as $lineNumber => $row){
				$userid = $row->userid;
				$name = $row->name;
				$organName = $row->organName;
				$post = $row->post;
				$contact = $row->contact;
				$organid = $row->organid;
				$checked = $row->iszz == 'true' ? 'checked="checked"' : '';
				$info = $userid.'@'.$name.'@'.$organName.'@'.$post.'@'.$contact.'@'.$organid;
				$entry = array(
						'id'=>$row->id,
						'cell'=>array(
								'linenumber'=>$lineNumber+1,
								'cb'=>'<input type="checkbox" value="'.$info.'" name="inputs" />',
								'radio'=>'<input type="radio" value="'.$info.'" name="info" '. $checked .' />',
								'userName'=>$name,
								'orgName'=>$organName,
								'deptPost'=>$post,
								'mobTel'=>$contact
						)
				);
				$jsonData['rows'][] = $entry;
					
			}
		}
		echo json_encode($jsonData);
	
	}
	
	/*
	 * 方吉祥
	* 2013/1/29
	* 档案销毁-档案销毁列表
	* 根据鉴定销毁单id及状态分页查询所有的销毁(保留)清单
	* $_GET['cb'] 是否显示checkbox列
	* $_GET['ext'] 是否显示扩展列(延长时间,延长)
	* 筛选档案
	*/
	public function GetDetailList()
	{
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
	
		$proxy = $this->exec('getProxy','escloud_identificationws');
		if(isset($_GET['filter'])){
			$condition = explode('@', $_POST['query']);
			$result = $proxy->getArchiveByCondition($page,$rp,json_encode($condition));
		}else{
			$formId =  $_GET['formId'];
			$status =  $_GET['status'];
			$result = $proxy->getDetailList($formId,$status,$page,$rp);
		}
		
		//print_r($result); die;
		$total = $result->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total){
			$offset = ($page-1)*$rp +1;
			
			foreach($result->list as $row)
			{
				//$path = str_replace('/', '-', $row->path); // 初始化path
				
				$rows['line'] = $offset++;
				if($_GET['cb'] == 'true') $rows['cb'] = '<input type="checkbox" name="inputs" value="'.$row->id.'" />';
				$rows['see'] = '<input type="button" class="link" id="'.$row->path.'" />';
				$rows['title'] = $row->title;
				$rows['code'] = $row->archiveCode;
				$rows['date'] = $row->archiveDate;
				$rows['createDate'] = $row->createDate;
				$rows['creator'] = $row->creator;
				$rows['years'] = $row->retentionPeriod;
				
				if($_GET['ext'] == 'true'){ // 保留列表中的延长保管期限,保留原因
					$rows['ext_years'] = $row->extendedRetentionPeriod.'年';
					$rows['because'] = $row->reason;
				}
				
				$jsonData['rows'][] = array('id'=>'id', 'cell'=> $rows);
	
			}
		}
		//print_r($jsonData); die;
		echo json_encode($jsonData);
	}
	
	// 新建或修改销毁(保留)清单 @未用到2013/2/28
	public function SaveOrUpdateIdentificationDetail()
	{
		$idstr = $_POST['ids'];
		$status = $_POST['status'];
		$reason = $_POST['reason'];
		$extendedRetentionPeriod = $_POST['extendedRetentionPeriod'];
		$ids = explode('@', $idstr); // '123,destroy@123,destroy@123,destroy'

		$proxy = $this->exec('getProxy','escloud_identificationws');
		$isok = $proxy->saveOrUpdateIdentificationDetail($status,$ids);
		
		echo $isok;
	}
	
	// 移入销毁(保留)清单
	public function UpdateDetailStatus()
	{
		$userId = $this->getUser()->getId();
		$status = $_POST['status'];
		$params['formId'] = $_POST['formId'];
		$params['ids'] = explode('@', $_POST['ids']); // '123,destroy@123,destroy@123,destroy'
		//file_put_contents('F:\data.txt', $_POST['ids']); //////////////////
		$params['reason'] = $_POST['reason'];
		$params['extendedRetentionPeriod'] = $_POST['extendedRetentionPeriod'];
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$isok = $proxy->updateDetailStatus($userId,$status,json_encode($params));
		//print_r($isok); die;
		echo $isok;
	}
	
	// 修改组员模拟待办状态(清除待办)
	public function UpdateMark()
	{
		$formId = $_GET['formId'];
		$userId = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$isok = $proxy->updateMark($formId,$userId);
		echo $isok;
	}
	
	// 获取销毁数量和保留数量
	public function GetIdentification()
	{
		$formId = $_POST['formId'];
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->getIdentification($formId);
		echo json_encode($result);
	}
	
	/**
	 * 添加销毁单
	 */
	public function saveIdentification(){
		$formData = isset($_POST['formData'])?$_POST['formData']:"";
		$output=array();
		if($formData != ""){
			parse_str($formData,$output);
		}else{
			$output = "";
		}
		$nodePath = $_POST['nodePath'];
		$paths = isset($_POST['paths'])?$_POST['paths']:"";
		$condition = isset($_POST['condition']['condition'])?$_POST['condition']['condition']:"";
		$billId = $_POST['billId'];
		$autoIdentify = $_POST['autoIdentify'];
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$userId = $this->getUser()->getId();
		$params = json_encode(Array('formData'=>$output, 'nodePath'=>$nodePath, 'paths'=>$paths, 'condition'=>$condition, 'billId'=>$billId, 'autoIdentify'=>$autoIdentify, 'userId'=>$userId));
		$result = $proxy->saveIdentification($params);
		echo json_encode($result);
	}
	
	/**
	 * 创建销毁单
	 */
	public function createDestroyForm(){
		$postData = isset($_POST['postData'])?$_POST['postData']:"";
		$formId = isset($_POST['formId'])?$_POST['formId']:"";
		$paths = isset($_POST['paths'])?$_POST['paths']:"";
		$condition = isset($_POST['condition']['condition'])?$_POST['condition']['condition']:"";
		$autoIdentify = $_POST['autoIdentify'];
		$nodePath = $_POST['nodePath'];
		$billId = isset($_POST['billId'])?$_POST['billId']:"";
		$groupCondition = isset($_POST['groupCondition'])?$_POST['groupCondition']:"";
		$userId = $this->getUser()->getId();
		$param = json_encode(array('postData'=>$postData, 'formId'=>$formId, 'paths'=>$paths, 'condition'=>$condition, 'autoIdentify'=>$autoIdentify, 'nodePath'=>$nodePath, 'userId'=>$userId, 'billId'=>$billId, 'groupCondition'=>$groupCondition));
		$Proxy=$this->exec('getProxy','escloud_identificationws');
		$result=$Proxy->createDestroyForm($param);
		echo json_encode($result);
	}
	
	/**
	 * 销毁数据
	 */
	public function destroy(){
		$wfIds = $_POST['wfIds'];
		$ids = $_POST['ids'];
		$ip = $this->getClientIp();
		$userId = $this->getUser()->getId();
		$param = json_encode(array('wfIds'=>$wfIds,'userId'=>$userId,'ip'=>$ip,"ids"=>$ids));
		$proxy=$this->exec('getProxy','escloud_identificationws');
		$result = $proxy->destroy($param);
		echo $result;
	}
	
	/**
	 * 提交销毁表单是执行方法
	 */
	public function destroyWorkflowStart(){
		$wfId = $_POST['wfId'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('wfId'=>$wfId, 'userId'=>$userId));
		$proxy=$this->exec('getProxy','escloud_identificationws');
		$result = $proxy->destroyWorkflowStart($param);
		echo $result;		
	}
	
	/**
	 * 根据数据path获取可销毁的数据的path
	 * wanghongchen 20140806
	 */
	public function getDestroyDataList(){
		$dataList = $_POST['dataList'];
		$strucid = $_POST['strucid'];
		$nodePath = $_POST['nodePath'];
		//wanghongchen 20140912 传参增加userId
		$userId = $this->getUser()->getId();
		$param = json_encode(array('dataList'=>$dataList, 'strucid'=>$strucid, 'nodePath'=>$nodePath, 'userId'=>$userId));
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->getDestroyDataList($param);
		echo json_encode($result);
	}
	
	/**
	 * 新建协同中发起销毁流程，保存销毁单
	 * wanghongchen 20140806
	 */
	public function createDestroyFormForStart(){
		$oswfFormId = $_POST['oswfFormId'];
		$type = $_POST['type'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('oswfFormId'=>$oswfFormId,'userId'=>$userId,'type'=>$type));
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->createDestroyFormForStart($param);
		echo json_encode($result);
	}
	
	/**
	 * 更新销毁单销毁数量
	 * wanghongchen 20140807
	 */
	public function updateDestroyNum(){
		$oswfFormId = isset($_POST['oswfFormId']) ? $_POST['oswfFormId'] : '';
		$wfId = isset($_POST['wfId']) ? $_POST['wfId'] : '';
		$type = $_POST['type'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('oswfFormId'=>$oswfFormId,'userId'=>$userId,'type'=>$type,'wfId'=>$wfId));
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->updateDestroyNum($param);
		echo json_encode($result);
	}
	
	/**
	 * 更改数据的销毁状态
	 * wanghongchen 20140807
	 */
	public function updateDataDestroyStatus(){
		$paths = $_POST['paths'];
		$oswfFormId = $_POST['dataid'];
		$wfId = $_POST["wfId"];
		$type = $_POST["type"];
		$param = json_encode(array('paths'=>$paths,'oswfFormId'=>$oswfFormId,'wfId'=>$wfId,'type'=>$type));
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->updateDataDestroyStatus($param);
		echo json_encode($result);
	}
	
	/**
	 * 删除销毁单
	 * wanghongchen 20140807
	 */
	public function deleteDestroyForm(){
		$paramStr = $_POST['paramStr'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param = json_encode(array('paramStr'=>$paramStr,'userId'=>$userId,'ip'=>$ip));
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$result = $proxy->deleteDestroyForm($param);
		echo $result;
	}
	
	/**
	 * 获取可销毁数据的path
	 * wanghongchen 20140917
	 */
	public function getDestroyPathList(){
		$paths = isset($_POST['paths'])?$_POST['paths']:"";
		$condition = isset($_POST['condition']['condition'])?$_POST['condition']['condition']:"";
		$autoIdentify = $_POST['autoIdentify'];
		$nodePath = $_POST['nodePath'];
		$groupCondition = isset($_POST['groupCondition'])?$_POST['groupCondition']:"";
		$userId = $this->getUser()->getId();
		$param = json_encode(array('paths'=>$paths,'userId'=>$userId, 'condition'=>$condition, 'autoIdentify'=>$autoIdentify, 'nodePath'=>$nodePath, 'groupCondition'=>$groupCondition));
		$Proxy=$this->exec('getProxy','escloud_identificationws');
		$result=$Proxy->getDestroyPathList($param);
		echo json_encode($result);
	}
}