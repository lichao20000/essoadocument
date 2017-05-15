<?php
/**
 * @author guolanrui
 * @Date 20140430
 */
class ESWorkflowAction extends ESActionBase {
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	//获取工作流类型（用于生成左侧树形结构）
	public function showModelTypeTree(){
		$workflowWSProxy = $this->exec("getProxy", 'escloud_workflowws');
		$appData = $workflowWSProxy->showModelTypeTree();
		$jsonData1= array();
		$jsonData = array('id'=>'','name'=>'工作流类型','open'=>true,'children'=>array());
		foreach ($appData as $row){
			$entry = array("name"=>$row->text,"id"=>$row->id);
			$jsonData['children'][] = $entry;
		}
		$jsonData1[0]=$jsonData;
		echo json_encode($jsonData1);
	}
	
	//获取工作流数据信息（右侧的grid数据）
	//getWfModelDataList(String typeID,String serarchKeyword,String start,String limit,String userIdNum);
	public function getWfModelDataList(){
		$typeID = isset($_GET['typeID']) ? $_GET['typeID'] : '';
		$isRelationWf = isset($_GET['isRelationWf']) ? $_GET['isRelationWf'] : '';
		$serarchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$userIdNum = isset($_GET['userIdNum']) ? $_GET['userIdNum'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		
		$workflowWSProxy = $this->exec("getProxy", 'escloud_workflowws');
		
		$data['typeID'] = $typeID;
		$data['isRelationWf'] = $isRelationWf;
		$data['serarchKeyword'] = $serarchKeyword;
		$data['userIdNum'] = $userIdNum;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$returnData = $workflowWSProxy->getWfModelDataList($postData);
		
		$total = $returnData->resultSize;
		$rows = $returnData->modelList;
		
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
      						"ids"=>'<input type="checkbox"  class="checkbox"  name="wfModelId" value="'.$row->modelId.'"id="wfModelId">',
      						"modelId"=>$row->modelId,
      						"modelTypeId"=>$row->modelTypeId,
      						"identifier"=>$row->identifier,
      						"business"=>$row->business,
      						"modify"=>"<span class='editbtn' >&nbsp;</span>",
      						"workflowName"=>$row->workflowName,
      						"description"=>$row->description,
      						"relationFormName"=>$row->relationFormName,
      						"relationForm"=>$row->relationForm,
      						"creater"=>$row->creater,
      						"createTime"=>$row->createTime,
      						"updateBy"=>$row->updateBy,
      						"updateTime"=>$row->updateTime,
      						"version"=>$row->version,
      						"state"=>$row->state,
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** xiaoxiong 20140513 渲染添加分类树节点页面 **/
	public function addModelTypePage(){
		$data = $_GET['data'];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/** xiaoxiong 20140513 分类树添加处理方法 **/
	public function addModelType(){
		$data = $_POST['data'].'&userId='.$this->getUser()->getId().'&remoteAddr='.$this->getClientIp();
		parse_str($data,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->addModelType($postData);
	   	echo $result;
	}
	
	/** xiaoxiong 20140513 渲染添加分类树节点页面 **/
	public function editModelTypePage(){
		$data = $_POST['data'];
		$data = htmlspecialchars($data);
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/** xiaoxiong 20140513 分类树添加处理方法 **/
	public function editModelType(){
		$data = $_POST['data'].'&userId='.$this->getUser()->getId().'&remoteAddr='.$this->getClientIp();
		parse_str($data,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->editModelType($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140513 分类树添加处理方法 **/
	public function deleteModelType(){
		$modelTypeId = $_POST['modelTypeId'] ;
		$out['modelTypeId'] = $modelTypeId;
		$out['userId'] = $this->getUser()->getId();
		$out['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->deleteModelType($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140513 渲染创建工作流页面 **/
	public function createWorkFlowPage(){
		$data = $_POST['data'].','.($this->getUser()->getId());
		$datas = explode(',',$data);
		$datas[0];
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/** xiaoxiong 20140515 根据工作流ID获取工作流初始化信息 **/
	public function getModelInit(){
	   	$modelId = $_POST['modelId'];
	   	$params = "modelId=".$modelId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
	   	parse_str($params,$out);
	   	$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getModelInit($postData);
	   	
	  	echo $result;
	}
	
	/** xiaoxiong 20140513 保存工作流初始化信息 **/
	public function saveWFModelInit(){
		parse_str($_POST['data'],$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->saveWFModelInit($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140513 保存工作流方法 **/
	public function saveWfModel(){
		$data = $_POST['data'];
		parse_str($data,$out);
		$out['graphXml'] = $_POST['graphXml'] ;
		$out['modelId'] = $_POST['modelId'] ;
		$out['isCreateWin'] = $_POST['isCreateWin'] ;
		$out['formId'] = $_POST['formId'] ;
		$out['docHtml'] = $_POST['docHtml'] ;
		$out['typeID'] = $_POST['typeID'] ;
		$out['username'] = $_POST['username'] ;
		$out['userId'] = $this->getUser()->getId() ;
		$out['remoteAddr'] = $this->getClientIp() ;
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->saveWfModel($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140513 根据工作流ID获取工作流XML值 **/
	public function getWorkFlowXml(){
		$postData = $_POST['modelId'] ;
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getWorkFlowXml($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 删除工作流步骤 **/
	public function deleteCellfromDB(){
		parse_str($_POST['data'],$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->deleteCellfromDB($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 判断待删除工作流步骤是否存在待办数据 **/
	public function verificationIsHasNotDealWf(){
		parse_str($_POST['data'],$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->verificationIsHasNotDealWf($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 根据流程id删除工作流 **/
	public function dropWfModel(){
		$modelId = $_POST['modelId'] ;
		$params = "modelId=".$modelId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->dropWfModel($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 获取存储条件 **/
	public function getConditionToShow(){
		$modelId = $_POST['modelId'];
		$formId = $_POST['formId'];
		$actionId = $_POST['actionId'];
		$params = "modelId=".$modelId."&formId=".$formId."&actionId=".$actionId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getConditionToShow($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 根据工作流id和actionId获取动作信息 **/
	public function actionCheckMethod(){
		$modelId = $_POST['modelId'];
		$actionId = $_POST['actionId'];
		$params = "modelId=".$modelId."&actionId=".$actionId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->actionCheckMethod($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 获取关联表单的所有字段，用于字段权限设置 **/
	public function getFormFields(){
		$modelid = $_POST['modelid'];
		$formid = $_POST['formid'];
		$stepid = $_POST['stepid'];
		$params = "modelid=".$modelid."&formid=".$formid."&stepid=".$stepid."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getFormFields($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140515 用于专门获取流程中报表设置 **/
	public function getSetPrints(){
		$modelid = $_POST['modelid'];
		$stepid = $_POST['stepid'];
		$params = "modelid=".$modelid."&stepid=".$stepid."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getSetPrints($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 通过角色ID获取该角色下所有的用户 **/
	public function getUserFromRole(){
		$searchKeyword = $_POST['searchKeyword'];
		$roleId = $_POST['roleId'];
		$start = $_POST['start'];
		$limit = $_POST['limit'];
		$params = "searchKeyword=".$searchKeyword."&roleId=".$roleId."&start=".$start."&limit=".$limit."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getUserFromRole($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 通过机构ID获取该机构下所有的用户 **/
	public function getUserFromOrgan(){
		$id = $_POST['id'];
		$searchKeyword = $_POST['searchKeyword'];
		$start = $_POST['start'];
		$limit = $_POST['limit'];
		$params = "id=".$id."&searchKeyword=".$searchKeyword."&start=".$start."&limit=".$limit."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getUserFromOrgan($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 获取流程中的方法设置信息 **/
	public function formCheckMethod(){
		$functionid = $_POST['functionid'];
		$actionID = $_POST['actionID'];
		$modelID = $_POST['modelID'];
		$params = "functionid=".$functionid."&actionID=".$actionID."&modelID=".$modelID."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->formCheckMethod($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 保存动作信息 **/
	public function saveWfActionInit(){
		$params = $_POST['data']."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->saveWfActionInit($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 保存只会信息 **/
	public function saveWfActionForNoticeInit(){
		$params = $_POST['data']."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->saveWfActionForNoticeInit($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 保存步骤信息 **/
	public function saveWfStepInit(){
		$params = $_POST['data']."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->saveWfStepInit($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 保存分支条件 **/
	public function saveSplitCondition(){
		$params = $_POST['data']."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->saveSplitCondition($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 获取所有角色 **/
	public function getAllRoles(){
		$start = $_POST['start'];
		$limit = $_POST['limit'];
		$searchKeyword = $_POST['searchKeyword'];
		$params = "start=".$start."&limit=".$limit."&searchKeyword=".$searchKeyword."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getAllRoles($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 获取步骤的审批人 **/
	public function showCurrStepUsers(){
		$start = $_POST['start'];
		$limit = $_POST['limit'];
		$wfmodelID = $_POST['wfmodelID'];
		$wfstepID = $_POST['wfstepID'];
		$params = "wfmodelID=".$wfmodelID."&wfstepID=".$wfstepID."&start=".$start."&limit=".$limit."userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->showCurrStepUsers($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516 获取只会人员 **/
	public function getNoticeUsers(){
		$start = $_POST['start'];
		$limit = $_POST['limit'];
		$wfmodelID = $_POST['wfmodelID'];
		$actionId = $_POST['actionId'];
		$params = "wfmodelID=".$wfmodelID."&actionId=".$actionId."&start=".$start."&limit=".$limit."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getNoticeUsers($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516根据机构ID获取子机构实体集合 **/
	public function getOrganTreeNodes4SetWf(){
		$wfModel = $_GET['wfModel'];
		$node = $_GET['node'];
		$params = "wfModel=".$wfModel."&node=".$node."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getOrganTreeNodes4SetWf($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516  获取工作流固定报表列表  **/
	public function getReportDataList(){
		$flag = $_POST['flag'];
		$params = "flag=".$flag."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getReportDataList($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140516  判断是否存在流转的数据  **/
	public function getFlowingWF(){
		$formid = $_POST['formid'];
		$params = "formid=".$formid."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getFlowingWF($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140523  判断是否存在已经流转的数据  **/
	public function isHavedWFData(){
		$formId = $_POST['formId'];
		$params = "formId=".$formId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->isHavedWFData($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140523  发布工作流  **/
	public function publicWorkFlow(){
		$modelId = $_POST['modelId'];
		$params = "modelId=".$modelId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->publicWorkFlow($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140523  删除工作流  **/
	public function deleteWorkflow(){
		$formId = $_POST['formId'];
		$modelId = $_POST['modelId'];
		$params = "modelId=".$modelId."&formId=".$formId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->deleteWorkflow($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140523  赋值工作流  **/
	public function copyWorkflow(){
		$workflowName = $_POST['workflowName'];
		$modelId = $_POST['modelId'];
		$params = "modelId=".$modelId."&workflowName=".$workflowName."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->copyWorkflow($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140523  赋值工作流  **/
	public function getAllDataList(){
		$start = $_POST['start'];
		$limit = $_POST['limit'];
		$keyWord = $_POST['keyWord'];
		$params = "start=".$start."&limit=".$limit."&keyWord=".$keyWord."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getAllDataList($postData);
	  	echo $result;
	}
	
	/** xiaoxiong 20140529 渲染函数设置界面 **/
	public function functionSetPage() {
		return $this->renderTemplate ();
	}
	
	public function findList(){
		$keyWord = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$workFlowFunServerProxy = $this->exec("getProxy", 'escloud_workflowws');
		$dataCount['keyWord'] = $keyWord;
		$canshuCount = json_encode($dataCount);
		$total = $workFlowFunServerProxy->getCountAll($canshuCount);
		$data['startNo']  = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['keyWord'] = $keyWord;
		$canshu = json_encode($data);
		$rows = $workFlowFunServerProxy->getAllWorkFlowFun($canshu);
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="workFlowFunId" value="'.$row->id.'"id="workFlowFunId">',
							"operate"=>"<span class='editbtn' >&nbsp;</span>",
							"id"=>$row->id,
							"functionName"=>$row->functionName,
							"restFullClassName"=>$row->restFullClassName,
							"exeFunction"=>$row->exeFunction,
							"relationBusiness"=>$row->relationBusiness,
							"description"=>$row->description,
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	 
	//添加工作流调用方法
	public function addWorkFlowFun(){
		$data = $_POST['data'].'&userId='.$this->getUser()->getId().'&remoteAddr='.$this->getClientIp();
		parse_str($data,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->addWorkFlowFun($postData);
		echo $result;
	}
	 
	//渲染编辑功能的页面
	public function edit_workFlowFun(){
		$colValues=$_POST['data'];
		$data = explode('|',$colValues);
		return $this->renderTemplate(array('data'=>$data));
	}
	 
	//删除选中的工作流调用的方法
	public function delWorkFlowFun(){
		$out['ids'] = $_POST['data'];
		$out['userId'] = $this->getUser()->getId();
		$out['remoteAddr'] = $this->getClientIp(); 
		$postData = json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->delWorkFlowFun($postData);
		echo $result;
	}
	
	/**
	 * 判断流程需不需要进行测试 
	 * @author longjunhao 20140609
	 */
	public function stationWorkflow() {
		$data['modelId'] = $_POST['modelId'];
		$data['relationForm'] = $_POST['relationForm'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData=json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->stationWorkflow($postData);
		echo $result;
	}
	
	/**
	 * 测试工作流流程走此方法
	 * @author longjunhao 20140609
	 */
	public function detectionWorkflow() {
		$data['modelId'] = $_POST['modelId'];
		$data['workflowName'] = $_POST['workflowName'];
		$data['relationForm'] = $_POST['relationForm'];
		$data['modelBusiness'] = $_POST['modelBusiness'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData=json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->detectionWorkflow($postData);
		echo $result;
	}
	
	/**
	 * 导出工作流模版
	 * @author longjunhao 20140610
	 */
	public function exportWorkflowModel() {
		$data['modelId'] = $_POST['modelId'];
		$data['expType'] = $_POST['expType'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData=json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->exportWorkflowModel($postData);
		echo $result;
	}
	
	/**
	 * 渲染导入窗口页面
	 * @author longjunhao 20140610
	 */
	public function importWorkflowPage() {
		$data = $this->getUser()->getId().",".$_SERVER["REMOTE_ADDR"];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/**
	 * 获取导入的url地址
	 * @author longjunhao 20140610
	 */
	public function importWorkflow() {
		$proxy=$this->exec('getProxy','escloud_workflowws');
		$data=$proxy->importWorkflow();
		echo $data;
	}
	
	/**
	 * 打开 工作流初始化设置 页面
	 * @author longjunhao 20140702
	 */
	public function osModelInitPage(){
		$data = $this->getUser()->getId().",".$this->getClientIp();
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/**
	 * 打开 设置分支条件
	 * @author longjunhao 20140703
	 * @return string
	 */
	public function osModelConditionPage() {
		$modelId=$_POST['modelId'];
		$formId=$_POST['formId'];
		$actionId=$_POST['actionId'];
		
		$params = "modelId=".$modelId."&formId=".$formId."&actionId=".$actionId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->getConditionToShowNew($postData);
		
		$returnData = json_decode($result);
		
		$showfieldstr = $returnData->showfieldstr;
		$fieldList = $returnData->fieldList;
		$tempIDs = $returnData->tempIDs;
		$rightCondition = $returnData->rightCondition;
		
		return $this->renderTemplate(array('showfieldstr'=>$showfieldstr,'fieldList'=>$fieldList,'tempIDs'=>$tempIDs,'rightCondition'=>$rightCondition));
	}
	/**
	 * 获取条件字段及结果
	 * @author longjunhao 20140712
	 */
	public function getConditionToShowNew() {
		$modelId=$_POST['modelId'];
		$formId=$_POST['formId'];
		$actionId=$_POST['actionId'];
		$params = "modelId=".$modelId."&formId=".$formId."&actionId=".$actionId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->getConditionToShowNew($postData);
	  	echo $result;
	}
	
	/**
	 * 获取流程集合的方法（根据表单权限去获取，为发起流程使用）
	 * wanghongchen 20140623
	 */
	public function getWfList(){
		$relationBusiness = $_POST['relationBusiness'];//所关联业务
		$formType = isset($_POST['formType'])?$_POST['formType']:"";//表单分类Id
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$param = json_encode(array('userId'=>$userId,'bigOrgId'=>$bigOrgId,'relationBusiness'=>$relationBusiness,'formType'=>$formType));
		$proxy=$this->exec('getProxy','escloud_workflowws');
		$result = $proxy->getWfList($param);
		$size = $result->size;
		if($size == 0){
			echo false;
		} elseif($size == 1){
			$data = $result->data;
			echo $data[0]->formid;
		}else{
			return $this->renderTemplate(array('size'=>$result->size,'data'=>$result->data));
		}
// 		echo json_encode($result);
	}

	/**
	 * 打开 设置步骤属性 页面
	 * @author longjunhao 20140704
	 */
	public function osModelStepPage(){
		$isFirstCell = $_POST['isFirstCell'];
		$modelId = $_POST['modelId'];
		$stepId = $_POST['stepId'];
		$stepName = $_POST['stepName'];
		$formId = isset($_POST['formId'])?$_POST['formId']:'';
		
		if ($formId!='') {
			$params = "modelid=".$modelId."&formid=".$formId."&stepid=".$stepId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
			parse_str($params,$out);
			$postData=json_encode($out);
			$Proxy=$this->exec('getProxy','escloud_workflowws');
			$result=$Proxy->getFormFieldsNew($postData);
		} else {
			$params = "modelid=".$modelId."&stepid=".$stepId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
			parse_str($params,$out);
			$postData=json_encode($out);
			$Proxy=$this->exec('getProxy','escloud_workflowws');
			$result=$Proxy->getSetPrintsNew($postData);
		}
		$returnData = json_decode($result);
		
		$allFields = $returnData->allFields;
		$editFields = $returnData->editField;
		$allFieldPrint = $returnData->allFieldPrint;
		$editFieldPrint = $returnData->editFieldPrint;
		
		$isRelation = $returnData->isRelation;
		$isRelationByCaller = $returnData->isRelationByCaller;
		$isCountersign = $returnData->isCountersign;
		
		$data = $isFirstCell.",".$modelId.",".$stepId.",".$formId.",".$stepName.",".$isRelation.",".$isRelationByCaller.",".$isCountersign.",".$this->getUser()->getId().",".$this->getClientIp();
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas,'allFields'=>$allFields,'editFields'=>$editFields,'allFieldPrint'=>$allFieldPrint,'editFieldPrint'=>$editFieldPrint));
	}
	
	/**
	 * 设置步骤属性中，查询用户列表
	 * @author longjunhao 20140707
	 */
	public function getUserFromOrganNew(){
		$id = $_POST['query']['id'];
		$searchKeyword = $_POST['query']['searchKeyword'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start =($page-1)*$rp;
		$limit = $rp;
	
		$params = "id=".$id."&searchKeyword=".$searchKeyword."&start=".$start."&limit=".$limit."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$return=$Proxy->getUserFromOrgan($postData);
		$returnData = json_decode($return);
	
		$total = $returnData->size;
		$rows = $returnData->list;
	
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" name="userId" value="'.$row->id.'">',
							"id"=>$row->id,
							"name"=>$row->name,
							"organ"=>$row->organ
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 
	 * 获取步骤的审批人 
	 * @author longjunhao 20140708
	 */
	public function showCurrStepUsersNew(){
		$wfmodelID = $_POST['query']['modelId'];
		$wfstepID = $_POST['query']['stepId'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start =($page-1)*$rp;
		$limit = $rp;
		
		$params = "wfmodelID=".$wfmodelID."&wfstepID=".$wfstepID."&start=".$start."&limit=".$limit."userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->showCurrStepUsers($postData);
		$returnData = json_decode($result);
		
		$total = $returnData->size;
		$rows = $returnData->list;
	
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"id3"=>'<input type="checkbox" name="selectedUserId" value="'.$row->id.'|'.$row->type.'">',
							"id"=>$row->id,
							"name"=>$row->name,
							"organ"=>$row->organ,
							"roleId"=>$row->roleId
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 
	 * 获取所有角色
	 * @author longjunhao 20140708
	 */
	public function getAllRolesNew(){
		$searchKeyword = $_POST['query']['searchKeyword'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start =($page-1)*$rp;
		$limit = $rp;
		
		$params = "searchKeyword=".$searchKeyword."&start=".$start."&limit=".$limit."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$return=$Proxy->getAllRoles($postData);
		$returnData = json_decode($return);
		
		$total = $returnData->size;
		$rows = $returnData->list;
		
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" name="roleId" value="'.$row->id.'">',
							"id"=>$row->id,
							"name"=>$row->name,
							"roleId"=>$row->roleId
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 设置步骤属性中，查询用户列表
	 * @author longjunhao 20140707
	 */
	public function getUserFromRoleNew(){
		$roleId = $_POST['query']['roleId'];
		$searchKeyword = $_POST['query']['searchKeyword'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start =($page-1)*$rp;
		$limit = $rp;
	
		$params = "roleId=".$roleId."&searchKeyword=".$searchKeyword."&start=".$start."&limit=".$limit."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$return=$Proxy->getUserFromRole($postData);
		$returnData = json_decode($return);
	
		$total = $returnData->size;
		$rows = $returnData->list;
	
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" name="userId" value="'.$row->id.'">',
							"id"=>$row->id,
							"name"=>$row->name,
							"organ"=>$row->organ
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 打开 设置动作属性页面
	 * @author longjunhao 20140710
	 */
	public function osModelActionPage() {
		$modelId = $_POST['modelId'];
		$actionId = $_POST['actionId'];
		$stepName = $_POST['stepName'];
		$params = "modelId=".$modelId."&actionId=".$actionId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
	   	$Proxy=$this->exec('getProxy','escloud_workflowws');
	   	$result=$Proxy->actionCheckMethodNew($postData);
		
		$returnData = json_decode($result);
		
		$source = $returnData->source;
		$returndata = $returnData->returndata;
		
		$actionIsSaved = $returnData->actionIsSaved;
		$action_message = $returnData->action_message;
		
		$isNoticeCaller = $returnData->isNoticeCaller;
		$isSendEmail = $returnData->isSendEmail;
		$isSendMessage = $returnData->isSendMessage;
		$isValidateForm = $returnData->isValidateForm;
		
		$data = $modelId.",".$actionId.",".$stepName.",".$action_message.",".$isNoticeCaller.",".$isSendEmail.",".$isSendMessage.",".$isValidateForm.",".$actionIsSaved.",".$this->getUser()->getId().",".$this->getClientIp();
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas,'source'=>$source,'returndata'=>$returndata));
	}
	
	/** 
	 * 获取知会人员列表
	 * @author longjunhao 20140711 
	 */
	public function getNoticeUsersNew(){
		$wfmodelID = $_POST['query']['modelId'];
		$actionId = $_POST['query']['actionId'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start =($page-1)*$rp;
		$limit = $rp;
		
		$params = "wfmodelID=".$wfmodelID."&actionId=".$actionId."&start=".$start."&limit=".$limit."userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->getNoticeUsers($postData);
		$returnData = json_decode($result);
		
		$total = $returnData->size;
		$rows = $returnData->list;
		
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"id3"=>'<input type="checkbox" name="selectedUserId" value="'.$row->id.'|'.$row->type.'">',
							"id"=>$row->id,
							"name"=>$row->name,
							"organ"=>$row->organ,
							"roleId"=>$row->roleId
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 根据formId获取工作流的信息
	 * @author wanghongchen 20140916
	 * @param param
	 * @return
	 */
	public function getWFModelByFormId(){
		$formId = $_POST['formId'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('formId'=>$formId,'userId'=>$userId));
		$proxy = $this->exec('getProxy','escloud_workflowws');
		$result = $proxy->getWFModelByFormId($param);
		echo json_encode($result);
	}
}
?>