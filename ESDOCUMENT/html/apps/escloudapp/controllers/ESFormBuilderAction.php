<?php
/**
 * @author xiaoxiong 20140521
 * 表单管理处理Action
 */
class ESFormBuilderAction extends ESActionBase {
	
	const PROXY_NAME = "escloud_formbuilder";
	
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	//获取表单类型（用于生成左侧树形结构）
	public function showFormTypeTree(){
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$appData = $proxy->showFormTypeTree();
		$jsonData1= array();
		$jsonData = array('id'=>'','name'=>'表单类型','open'=>true,'children'=>array());
		foreach ($appData as $row){
			$entry = array("name"=>$row->text,"id"=>$row->id);
			$jsonData['children'][] = $entry;
		}
		$jsonData1[0]=$jsonData;
		echo json_encode($jsonData1);
	}

	//获取表单数据列表（右侧的grid数据）
	public function getFormBuilderDataList(){
		$typeID = isset($_GET['typeID']) ? $_GET['typeID'] : '';
		$serarchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$userIdNum = isset($_GET['userIdNum']) ? $_GET['userIdNum'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['typeID'] = $typeID;
		$data['serarchKeyword'] = $serarchKeyword;
		$data['userIdNum'] = $userIdNum;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getFormBuilderDataList($postData);
		$total = $returnData->size;
		$rows = $returnData->list;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox" name="selectFormBuilder" value="'.$row->id.'" id="selectFormBuilder">',
							"id"=>$row->id,
							"formTypeId"=>$row->formTypeId,
							"esmodelid"=>$row->esmodelid,
							"esModelName"=>$row->esModelName,
							"title"=>$row->title,
							"modify"=>"<span class='editbtn' >&nbsp;</span>",
							"creater"=>$row->creater,
							"createTime"=>$row->createTime,
							"updateBy"=>$row->updateBy,
							"updateTime"=>$row->updateTime,
							"version"=>$row->version,
							"state"=>$row->state,
							"isCreate"=>$row->isCreate,
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}

	/** 渲染添加分类树节点页面 **/
	public function addFormTypePage(){
		$data = $_GET['data'];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}

	/** 分类树添加处理方法 **/
	public function addFormType(){
		$params = $_POST['data'] ;
		$params = $params."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->addFormType($postData);
		echo $result;
	}

	/** 渲染添加分类树节点页面 **/
	public function editFormTypePage(){
		$data = $_POST['data'];
		$data = htmlspecialchars($data);
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}

	/** 分类树添加处理方法 **/
	public function editFormType(){
		$params = $_POST['data'] ;
		$params = $params."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->editFormType($postData);
		echo $result;
	}
	
	/** 分类树添加处理方法 **/
	public function deleteFormType(){
		$modelTypeId = $_POST['modelTypeId'] ;
		$params = "modelTypeId=".$modelTypeId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->deleteFormType($postData);
		echo $result;
	}

	/** 渲染创建表单页面 **/
	public function createFormBuilderPage(){
		$data = $_POST['data'].','.($this->getUser()->getId());
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}

	/** 根据表单ID获取表单信息 **/
	public function getFormJs(){
		$postData = $_POST['formId'];
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->getFormJs($postData);
		echo $result;
	}

	/** 保存表单信息 **/
	public function saveFormBuilder(){
		$formJs = $_POST['formJs'] ;
		$formId = isset($_POST['formId']) ? $_POST['formId'] : '';
		$formTitle = $_POST['formTitle'] ;
		$id = $_POST['id'] ;
		$formTypeID = $_POST['formTypeID'] ;
		$data['formJs'] = $formJs;
		$data['formId'] = $formId;
		$data['formTitle'] = $formTitle;
		$data['id'] = $id;
		$data['formTypeID'] = $formTypeID;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->saveFormBuilder($postData);
		echo $result;
	}

	/** 根据表单ID获取当前表单是否存在表单数据 **/
	public function getHasDataFlag(){
		$formId = $_POST['formId'] ;
		$params = "formId=".$formId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->getHasDataFlag($postData);
		echo $result;
	}

	/** 根据表单ID发布表单 **/
	public function promulgateForm(){
		$formId = $_POST['formId'] ;
		$params = "formId=".$formId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->promulgateForm($postData);
		echo $result;
	}
	
	/** 渲染关联流程页面 **/
	public function relationWorklfowPage(){
		$data = $_POST['formId'].','.($this->getUser()->getId());
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/** 表单关联流程 **/
	public function relationWorklfow(){
		$formId = $_POST['formId'] ;
		$modelId = $_POST['modelId'] ;
		$params = "formId=".$formId."&modelId=".$modelId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->relationWorklfow($postData);
		echo $result;
	}
	
	/** 取消表单流程关联 **/
	public function cancelRelationWorkflow(){
		$formId = $_POST['formId'] ;
		$modelId = $_POST['modelId'] ;
		$params = "formId=".$formId."&modelId=".$modelId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->cancelRelationWorkflow($postData);
		echo $result;
	}
	
	/** 修改表单状态 **/
	public function changeFormState(){
		$formId = $_POST['formId'] ;
		$formTitle = $_POST['formTitle'] ;
		$state = $_POST['state'] ;
		$params = "formId=".$formId."&state=".$state."&formTitle=".$formTitle."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->changeFormState($postData);
		echo $result;
	}
	
	/** 删除表单 **/
	public function deleteForm(){
		$formId = $_POST['formId'] ;
		$modelId = $_POST['modelId'] ;
		$formTitle = $_POST['formTitle'] ;
		$params = "formId=".$formId."&modelId=".$modelId."&formTitle=".$formTitle."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->deleteForm($postData);
		echo $result;
	}
	
	/** 复制表单 **/
	public function copyForm(){
		$formId = $_POST['formId'] ;
		$formTitle = $_POST['formTitle'] ;
		$params = "formId=".$formId."&formTitle=".$formTitle."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->copyForm($postData);
		echo $result;
	}
	
	/** 渲染数据字典页面 **/
	public function comboMetadataPage(){
		$isFrom = 	isset($_GET['isFrom']) ? $_GET['isFrom'] : 'create';
		$datas = explode(',',$isFrom);
		return $this->renderTemplate(array('data'=>$datas));
	}

	/** 获取数据字典列表 **/
	public function getMetadataList(){
		$serarchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$data['serarchKeyword'] = $serarchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$returnData = $proxy->getMetadataList($postData);
		$total = $returnData->size;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox" name="checkbox" value="'.$row->id.'" id="checkbox">',
							"id"=>$row->id,
							"indetifier"=>$row->identifier,
							"name"=>$row->comboValue,
							"type"=>$row->estype,
							"description"=>$row->describe
// 							"modify"=>"<span class='editbtn' >&nbsp;</span>"
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 渲染添加/编辑数据字典页面 **/
	public function addOrEditComboPage(){
		$data = $_POST['data'];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}

	/** 保存数据字典数据 **/
	public function saveCombo(){
		$data = $_POST['data'] ;
		$params = $data."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->saveCombo($postData);
		echo $result;
	}

	/** 删除数据字典数据 **/
	public function deleteCombo(){
		$id = $_POST['id'] ;
		$indetifier = $_POST['indetifier'] ;
		$name = $_POST['name'] ;
		$type = $_POST['type'] ;
		$params = "id=".$id."&selectidIdentifiers=".$indetifier."&selectidComboValues=".$name."&selectidComboTypes=".$type."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->deleteCombo($postData);
		$success = $result->success;
		if($success=='true'){
			echo 'true';
		}else {
			echo $result->msg;
		}
	}
	
	/** 渲染添加/编辑数据字典选择项页面 **/
	public function addOrEditComboItemPage(){
		$data = $_POST['data'];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/** 保存数据字典选项数据 **/
	public function saveComboItem(){
		$data = $_POST['data'] ;
		$params = $data."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->saveComboItem($postData);
		echo $result;
	}
	
	/** 删除数据字典选项数据 **/
	public function deleteComboItems(){
		$ids = $_POST['ids'] ;
		$params = "ids=".$ids."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->deleteComboItems($postData);
		echo $result;
	}
	
	/** 获取数据字典选择项列表 **/
	public function getMetadataItemList(){
		$comboId = 	isset($_GET['comboId']) ? $_GET['comboId'] : '';
		if('-1' == $comboId){
			$jsonData = array('page'=>1,'total'=>0,'rows'=>array());
			echo json_encode($jsonData);
			return ;
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$data['comboId'] = $comboId;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$returnData = $proxy->getMetadataItemList($postData);
		$total = $returnData->size;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox" name="checkbox" value="'.$row->id.'" id="checkbox">',
							"id"=>$row->id,
							"item"=>$row->item,
							"order"=>$row->order
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}

	/** 获取表达式 **/
	public function queryExpression(){
		$formid = $_POST['formid'] ;
		$params = "formid=".$formid."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->queryExpression($postData);
		echo $result;
	}

	/** 保存表达式 **/
	public function saveExpression(){
		$data['radioNoArys'] = $_POST['radioNoArys'] ;
		$data['radioBoxLabelArys'] = $_POST['radioBoxLabelArys'] ;
		$data['desc'] = $_POST['desc'] ;
		$data['expression'] = $_POST['expression'] ;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->saveExpression($postData);
		echo $result;
	}

	/** 删除表达式 **/
	public function dropExpression(){
		$data['expressionid'] = $_POST['expressionid'] ;
		$data['formid'] = $_POST['formid'] ;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->dropExpression($postData);
		echo $result;
	}

	/** 删除一个表单全部的表达式数据 **/
	public function deleteExpression(){
		$data['formid'] = $_POST['formid'] ;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->deleteExpression($postData);
		echo $result;
	}
	
	/**
	 * 导出表单
	 * @author longjunhao 20140605
	 */
	public function exportFormbuilder(){
		$data['formId'] = $_POST['formId'];
		$data['expType'] = $_POST['expType'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->exportFormbuilder($postData);
		echo $result;
	}
	
	/**
	 * 获取导入的url地址
	 * @author longjunhao 20140606
	 */
	public function importFormbuilder() {
		$proxy=$this->exec('getProxy',self::PROXY_NAME);
		$data=$proxy->importFormbuilder();
		echo $data;
	}
	
	/** 
	 * 渲染导入窗口页面 
	 * @author longjunhao 20140606
	 */
	public function importFormPage(){
		$data = $_POST['data'].",".$this->getUser()->getId().",".$_SERVER["REMOTE_ADDR"];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/**
	 * 渲染选择流程类型窗口页面
	 * @author longjunhao 20140610
	 */
	public function modelTypeTreePage() {
		$data = $_POST['data'].",".$this->getUser()->getId().",".$_SERVER["REMOTE_ADDR"];
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/** 根据表单ID获取表单信息 **/
	public function preViewMyForm(){
		$postData = $_POST['formId'];
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->preViewMyForm($postData);
		echo $result;
	}
	
}
?>