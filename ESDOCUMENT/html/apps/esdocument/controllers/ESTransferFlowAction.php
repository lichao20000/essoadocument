<?php
/**
 * 工作流程管理模块
 * @author gengqianfeng
 *
 */
class ESTransferFlowAction extends ESActionBase {
	
	/**
	 * 渲染首页
	 *
	 * @return string
	 */
	public function index() {
		return $this->renderTemplate ();
	}
	
	/**
	 * 获取工作流类型（用于生成左侧树形结构）
	 */
	public function showModelTypeTree() {
		$transfer = $this->exec ( "getProxy", 'transferFlow' );
		$tree = $transfer->getTree ();
		if (count ( $tree ) != 0) {
			$tree [0]->open = true;
		}
		echo json_encode ( $tree );
	}
	
	/**
	 * 获取工作流列表
	 */
	public function getWfModelDataList() {
		$type_id = isset ( $_GET ['type_id'] ) ? $_GET ['type_id'] : 0;
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$type_id = ($type_id == '') ? 0 : $type_id;
		if (! isset ( $condition ['condition'] )) {
			$condition ['condition'] = null;
		}
		$transfer = $this->exec ( "getProxy", "transferFlow" );
		$total = $transfer->getCount ( $type_id, $condition ['condition'] );
		$cells = $transfer->findTransferList ( $page, $rp, $type_id, $condition ['condition'] );
		echo json_encode ( $this->setResult ( $page, $rp, $total, $cells ) );
	}
	
	/**
	 * 构造工作流列表集
	 *
	 * @param unknown $page
	 *        	第几页
	 * @param unknown $rp
	 *        	每页显示多少条
	 * @param unknown $total
	 *        	总条数
	 * @param unknown $cells
	 *        	分页查询集合
	 * @return multitype:unknown multitype:
	 */
	private function setResult($page, $rp, $total, $cells) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'id' => $cell->id,
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox">',
					'modify' => '<span class="editbtn" ></span>',
					'modelId' => $cell->id,
					'modelTypeId' => $cell->type_id,
					'name' => $cell->name,
					'business_relation' => $cell->business_relation,
					'form_relation' => $cell->form_relation,
					'status' => (($cell->status == 0) ? '准备' : (($cell->status == 1) ? '启用' : '关闭')),
					'describtion' => $cell->describtion,
					'creater' => $cell->creater,
					'createtime' => $cell->createtime,
					'modifyer' => $cell->modifyer,
					'modifytime' => $cell->modifytime,
					'version' => $cell->version 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 分类树添加处理方法
	 */
	public function addModelType() {
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$type ['userId'] = $userId;
		$type ['ip'] = $ip;
		$type ['pId'] = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$type ['name'] = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		if ($type ['pId'] != '' && $type ['name'] != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo json_encode ( $transfer->addType ( $type ) );
		}
	}
	
	/**
	 * 渲染编辑分类树节点页面
	 *
	 * @return string
	 */
	public function editModelTypePage() {
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		$result = array ();
		if ($id != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			$type = $transfer->getTypeById ( $id );
			$result = array (
					'id' => $type->id,
					'pId' => $type->pId,
					'name' => $type->name 
			);
		}
		return $this->renderTemplate ( $result );
	}
	
	/**
	 * 分类树编辑处理方法
	 */
	public function editModelType() {
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$type ['userId'] = $userId;
		$type ['ip'] = $ip;
		$type ['id'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$type ['name'] = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		if ($type ['id'] != '' && $type ['name'] != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $transfer->editType ( $type );
		}
	}
	
	/**
	 * 分类树删除处理方法
	 */
	public function deleteModelType() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '' && count ( $ids ) != 0) {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $transfer->delType ( $ids );
		}
	}
	
	/**
	 * 渲染创建工作流页面
	 *
	 * @return string
	 */
	public function createWorkFlowPage() {
		// modelTypeID,modelId,formId,esGraphXml,admin
		$data = isset ( $_POST ['data'] ) ? $_POST ['data'] : '';
		$userId = $this->getUser ()->getId ();
		$data = $data . ',' . $userId;
		$datas = explode ( ',', $data );
		return $this->renderTemplate ( array (
				'data' => $datas 
		) );
	}
	
	/**
	 * 根据工作流ID获取工作流初始化信息
	 */
	public function getModelInit() {
		$modelId = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$result = array ();
		if ($modelId != '') {
			$transfer = $this->exec ( 'getProxy', 'transferFlow' );
			$result = $transfer->getModelInit ( $modelId );
		}
		echo json_encode ( $result );
	}
	
	/**
	 * 保存工作流初始化信息
	 */
	public function saveWFModelInit() {
		$model = isset ( $_POST ['data'] ) ? $_POST ['data'] : '';
		$model ['creater'] = $this->getUser ()->getId ();
		$model ['createtime'] = date ( 'Y-m-d H:i:s', time () );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		$result = $transfer->saveWFModelInit ( $model );
		echo json_encode ( $result );
	}
	
	/**
	 * 保存工作流方法
	 */
	public function saveWfModel() {
		$data = $_POST ['data'];
		parse_str ( $data, $out );
		$out ['graphXml'] = $_POST ['graphXml'];
		$out ['modelId'] = $_POST ['modelId'];
		$out ['isCreateWin'] = $_POST ['isCreateWin'];
		$out ['formId'] = $_POST ['formId'];
		$out ['docHtml'] = $_POST ['docHtml'];
		$out ['typeID'] = $_POST ['typeID'];
		$out ['username'] = $_POST ['username'];
		$out ['userId'] = $this->getUser ()->getId ();
		$out ['ip'] = $this->getClientIp ();
		$out ['remoteAddr'] = $this->getClientIp ();
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->saveWfModel ( $out ) );
	}
	
	/**
	 * 根据工作流ID获取工作流XML值
	 */
	public function getWorkFlowXml() {
		$modelId = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		if ($modelId != '') {
			$transfer = $this->exec ( 'getProxy', 'transferFlow' );
			$result = $transfer->getWorkFlowXml ( $modelId );
			echo json_encode ( $result );
		}
	}
	
	/**
	 * 删除工作流步骤
	 */
	public function deleteCellfromDB() {
		parse_str ( $_POST ['data'], $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->deleteCellfromDB ( $out ) );
	}
	
	/**
	 * 判断待删除工作流步骤是否存在待办数据
	 */
	public function verificationIsHasNotDealWf() {
		parse_str ( $_POST ['data'], $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->verificationIsHasNotDealWf ( $out ) );
	}
	
	/**
	 * 根据流程id删除工作流
	 */
	public function dropWfModel() {
		$modelId = $_POST ['modelId'];
		$params = "modelId=" . $modelId . "&userId=" . ($this->getUser ()->getId ()) . "&ip=" . ($this->getClientIp ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->dropWfModel ( $out ) );
	}
	
	/**
	 * 根据工作流id和actionId获取动作信息 *
	 */
	public function actionCheckMethodNew() {
		$modelId = $_POST ['modelId'];
		$actionId = $_POST ['actionId'];
		$params = "modelId=" . $modelId . "&actionId=" . $actionId . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->actionCheckMethod ( $out );
	}
	
	/**
	 * 保存动作信息
	 */
	public function saveActionInit() {
		$params = $_POST ['data'] . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->saveActionInit ( $out );
	}
	
	/**
	 * 保存知会信息
	 */
	public function saveActionForNoticeInit() {
		$params = $_POST ['data'] . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->saveActionForNoticeInit ( $out );
	}
	
	/**
	 * 保存步骤信息
	 */
	public function saveStepInit() {
		$params = $_POST ['data'] . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->saveStepInit ( $out ) );
	}
	
	/**
	 * 保存分支条件
	 */
	public function saveSplitCondition() {
		$params = $_POST ['data'] . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->saveSplitCondition ( $out );
	}
	
	/**
	 * 判断是否存在流转的数据
	 */
	public function getFlowingWF() {
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		if ($formId != '') {
			$transfer = $this->exec ( 'getProxy', 'transferFlow' );
			echo $transfer->getFlowingWF ( $formId );
		}
	}
	
	/**
	 * 判断是否存在已经流转的数据
	 */
	public function isHavedWFData() {
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$modelId = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$params = "formId=" . $formId . "&userId=" . ($this->getUser ()->getId ()) . "&modelId=" . $modelId;
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->isHavedWFData ( $out );
	}
	
	/**
	 * 发布工作流
	 */
	public function publicWorkFlow() {
		$modelId = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$params = "modelId=" . $modelId . "&userId=" . ($this->getUser ()->getId ()) . "&ip=" . ($this->getClientIp ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->publicWorkFlow ( $out );
	}
	
	/**
	 * 删除工作流
	 */
	public function deleteWorkflow() {
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$modelId = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$params = "modelId=" . $modelId . "&formId=" . $formId . "&userId=" . ($this->getUser ()->getId ()) . "&ip=" . ($this->getClientIp ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->deleteWorkflow ( $out );
	}
	
	/**
	 * 复制工作流
	 */
	public function copyWorkflow() {
		$workflowName = $_POST ['workflowName'];
		$modelId = $_POST ['modelId'];
		$params = "modelId=" . $modelId . "&workflowName=" . $workflowName . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->copyWorkflow ( $out );
	}
	
	/**
	 * 渲染函数设置界面
	 */
	public function functionSetPage() {
		return $this->renderTemplate ();
	}
	
	/**
	 * 获取函数列表
	 */
	public function findFunctionList() {
		$keyWord = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		$dataCount ['keyWord'] = $keyWord;
		$total = $transfer->getFunctionCount ( $dataCount );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$rows = $transfer->getFunctionList ( $data );
		$start = 1;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox" class="checkbox" name="workFlowFunId" value="' . $row->id . '"id="workFlowFunId">',
							"operate" => "<span class='editbtn' >&nbsp;</span>",
							"id" => $row->id,
							"functionName" => $row->functionName,
							"restFullClassName" => $row->restFullClassName,
							"exeFunction" => $row->exeFunction,
							"relationBusiness" => $row->relationBusiness,
							"description" => $row->description,
							"stageId" => $row->stageId 
					) 
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 * 添加工作流调用方法
	 */
	public function addWorkFlowFun() {
		$data = $_POST ['data'] . '&stageId=' . $_POST ['stageId'] . '&userId=' . $this->getUser ()->getId () . "&ip=" . ($this->getClientIp ());
		parse_str ( $data, $out );
		$postData = json_encode ( $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->addFun ( $postData );
	}
	
	/**
	 * 渲染编辑功能的页面
	 *
	 * @return string
	 */
	public function edit_workFlowFun() {
		$colValues = $_POST ['data'];
		$data = explode ( '|', $colValues );
		return $this->renderTemplate ( array (
				'data' => $data 
		) );
	}
	
	/**
	 * 删除选中的工作流调用的方法
	 */
	public function delWorkFlowFun() {
		$ids = isset ( $_POST ['data'] ) ? $_POST ['data'] : '';
		if ($ids != '') {
			$transfer = $this->exec ( 'getProxy', 'transferFlow' );
			echo $transfer->delFun ( $ids );
		}
	}
	
	/**
	 * 判断流程需不需要进行测试
	 */
	public function stationWorkflow() {
		$data ['modelId'] = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$data ['relationForm'] = isset ( $_POST ['relationForm'] ) ? $_POST ['relationForm'] : '';
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->stationWorkflow ( $data );
	}
	
	/**
	 * 测试工作流流程走此方法
	 */
	public function detectionWorkflow() {
		$data ['modelId'] = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$data ['workflowName'] = isset ( $_POST ['workflowName'] ) ? $_POST ['workflowName'] : '';
		$data ['relationForm'] = isset ( $_POST ['relationForm'] ) ? $_POST ['relationForm'] : '';
		$data ['modelBusiness'] = isset ( $_POST ['modelBusiness'] ) ? $_POST ['modelBusiness'] : '';
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->detectionWorkflow ( $data ) );
	}
	
	/**
	 * 导出工作流模版
	 */
	public function exportWorkflow() {
		$data ['modelId'] = $_POST ['modelId'];
		$data ['expType'] = $_POST ['expType'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo json_encode ( $transfer->exportWorkflow ( $data ) );
	}
	
	/**
	 * 渲染导入窗口页面
	 *
	 * @return string
	 */
	public function importWorkflowPage() {
		$data = $this->getUser ()->getId () . "," . $_SERVER ["REMOTE_ADDR"];
		$datas = explode ( ',', $data );
		return $this->renderTemplate ( array (
				'data' => $datas 
		) );
	}
	
	/**
	 * 获取导入的url地址
	 */
	public function importWorkflow() {
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->importWorkflow ();
	}
	
	/**
	 * 工作流初始化设置 页面
	 *
	 * @return string
	 */
	public function osModelInitPage() {
		$data = $this->getUser ()->getId () . "," . $this->getClientIp ();
		$datas = explode ( ',', $data );
		return $this->renderTemplate ( array (
				'data' => $datas 
		) );
	}
	
	/**
	 * 设置分支条件
	 *
	 * @return string
	 */
	public function osModelConditionPage() {
		$modelId = $_POST ['modelId'];
		$formId = $_POST ['formId'];
		$actionId = $_POST ['actionId'];
		$params = "modelId=" . $modelId . "&formId=" . $formId . "&actionId=" . $actionId . "&userId=" . ($this->getUser ()->getId ()) . "&remoteAddr=" . $_SERVER ["REMOTE_ADDR"];
		parse_str ( $params, $out );
		$transfer = $this->exec ( "getProxy", 'transferFlow' );
		$returnData = $transfer->getConditionToShowNew ( $out );
		$showfieldstr = $returnData->showfieldstr;
		$fieldList = $returnData->fieldList;
		$tempIDs = $returnData->tempIDs;
		$rightCondition = $returnData->rightCondition;
		return $this->renderTemplate ( array (
				'showfieldstr' => $showfieldstr,
				'fieldList' => $fieldList,
				'tempIDs' => $tempIDs,
				'rightCondition' => $rightCondition 
		) );
	}
	
	/**
	 * 获取条件字段及结果
	 */
	public function getConditionToShowNew() {
		$modelId = $_POST ['modelId'];
		$formId = $_POST ['formId'];
		$actionId = $_POST ['actionId'];
		$params = "modelId=" . $modelId . "&formId=" . $formId . "&actionId=" . $actionId . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		echo $transfer->getConditionToShowNew ( $out );
	}
	
	/**
	 * 设置步骤属性 页面
	 *
	 * @return string
	 */
	public function osModelStepPage() {
		$isFirstCell = isset ( $_POST ['isFirstCell'] ) ? $_POST ['isFirstCell'] : '';
		$modelId = isset ( $_POST ['modelId'] ) ? $_POST ['modelId'] : '';
		$stepId = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$stepName = isset ( $_POST ['stepName'] ) ? $_POST ['stepName'] : '';
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$data = $isFirstCell . "," . $modelId . "," . $stepId . "," . $formId . "," . $stepName;
		$datas = explode ( ',', $data );
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		$step = $transfer->getStepUser ( $modelId, $stepId );
		$editFields = $this->getEditFields ( $formId, isset ( $step->edit_field ) ? $step->edit_field : '' );
		$printFields = $this->getPrintFields ( isset ( $step->edit_field_print ) ? $step->edit_field_print : '' );
		$iscountersign = isset ( $step->is_countersign ) ? $step->is_countersign : 0;
		return $this->renderTemplate ( array (
				'data' => $datas,
				'noEditFields' => $editFields ['noEditFields'],
				'editFields' => $editFields ['yesEditFields'],
				'noPrintFields' => $printFields ['noPrintFields'],
				'printFields' => $printFields ['yesPrintFields'],
				'iscountersign' => $iscountersign 
		) );
	}
	
	/**
	 * 获取表单字段
	 *
	 * @param unknown $formId        	
	 * @param unknown $modelId        	
	 * @param unknown $stepId        	
	 * @return multitype:
	 */
	private function getEditFields($formId, $editFields) {
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		$stageId = substr ( $formId, 5 );
		$allFields = $transfer->getWorkflowMetaList ( $stageId );
		$noEditFields = array ();
		$yesEditFields = array ();
		foreach ( $allFields as $field ) {
			$flag = true;
			foreach ( explode ( ',', $editFields ) as $edit ) {
				if ($field->code == $edit) {
					$yes ['code'] = $field->code;
					$yes ['name'] = $field->name;
					array_push ( $yesEditFields, $yes );
					$flag = false;
				}
			}
			if ($flag) {
				$no ['code'] = $field->code;
				$no ['name'] = $field->name;
				array_push ( $noEditFields, $no );
			}
		}
		$returnFields = array (
				'noEditFields' => $noEditFields,
				'yesEditFields' => $yesEditFields 
		);
		return $returnFields;
	}
	
	/**
	 * 获取未被选中的打印字段
	 *
	 * @param unknown $printFields        	
	 * @return multitype:
	 */
	private function getPrintFields($printFields) {
		$transfer = $this->exec ( 'getProxy', 'transferFlow' );
		$allPrintFields = $transfer->getWorkflowReportList ();
		$noPrintFields = array ();
		$yesPrintFields = array ();
		foreach ( $allPrintFields as $field ) {
			$flag = true;
			foreach ( explode ( ',', $printFields ) as $print ) {
				if ($field->idReport == $print) {
					$yes ['code'] = $field->idReport;
					$yes ['name'] = $field->title;
					array_push ( $yesPrintFields, $yes );
					$flag = false;
				}
			}
			if ($flag) {
				$no ['code'] = $field->idReport;
				$no ['name'] = $field->title;
				array_push ( $noPrintFields, $no );
			}
		}
		$returnFields = array (
				'noPrintFields' => $noPrintFields,
				'yesPrintFields' => $yesPrintFields 
		);
		return $returnFields;
	}
	
	/**
	 * 设置动作属性页面
	 *
	 * @return string
	 */
	public function osModelActionPage() {
		$modelId = $_POST ['modelId'];
		$actionId = $_POST ['actionId'];
		$stepName = $_POST ['stepName'];
		$actionIsStartAndEnd = $_POST ['actionIsStartAndEnd'];
		$params = "modelId=" . $modelId . "&actionId=" . $actionId . "&userId=" . ($this->getUser ()->getId ());
		parse_str ( $params, $out );
		$transfer = $this->exec ( "getProxy", 'transferFlow' );
		$returnData = $transfer->actionCheckMethodNew ( json_encode ( $out ) );
		$source = $returnData->source;
		$returndata = $returnData->returndata;
		$actionIsSaved = $returnData->actionIsSaved;
		$action_message = $returnData->action_message;
		$isNoticeCaller = $returnData->isNoticeCaller;
		$isSendEmail = $returnData->isSendEmail;
		$isSendMessage = $returnData->isSendMessage;
		$isValidateForm = $returnData->isValidateForm;
		
		// lujixiang 添加处理时间周期
		$processTime = $returnData->process_time;
		$data = $modelId . "," . $actionId . "," . $stepName . "," . $action_message . "," . $isNoticeCaller . "," . $isSendEmail . "," . $isSendMessage . "," . $isValidateForm . "," . $actionIsSaved . "," . $this->getUser ()->getId () . "," . $this->getClientIp () . "," . $processTime . "," . $actionIsStartAndEnd;
		$datas = explode ( ',', $data );
		return $this->renderTemplate ( array (
				'data' => $datas,
				'source' => $source,
				'returndata' => $returndata 
		) );
	}
	
	/**
	 * 获取知会人员列表
	 */
	public function getNoticeUsersNew() {
		$modelId = isset ( $_GET ['modelId'] ) ? $_GET ['modelId'] : '';
		$actionId = isset ( $_GET ['actionId'] ) ? $_GET ['actionId'] : '';
		if ($modelId != '' && $actionId != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $this->setSelectedUserResult ( $transfer->getNoticeUsersNew ( $modelId, $actionId ), 1, 1 );
		}
	}
	
	/**
	 * 获取用户列表
	 */
	public function getSelectUserList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$key = isset ( $_GET ['key'] ) ? $_GET ['key'] : '';
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : '';
		$searchKeyword = isset ( $_GET ['searchKeyword'] ) ? $_GET ['searchKeyword'] : '';
		$param ['keyWord'] = $searchKeyword;
		$param ['start'] = ($page - 1) * $rp;
		$param ['limit'] = $rp;
		$transfer = $this->exec ( "getProxy", 'transferFlow' );
		if ($key == '1' && $ids != '') {
			$participatory = $this->exec ( "getProxy", "participatory" );
			$param ['partId'] = $ids;
			$part = $participatory->getPartUserById ( $param );
			if ($part != null && isset ( $part->total )) {
				echo $this->setUserResult ( $part, $page, $rp );
			} else {
				$result = $participatory->getParticipatoryById ( $ids );
				$userIds = '';
				if (isset ( $result->user_id ) && $result->user_id != "") {
					$userNames = explode ( ',', $result->user_id );
					foreach ( $userNames as $userName ) {
						$userId = $transfer->getUserByName ( $userName )->id;
						$userIds = $userIds . ',' . $userId;
					}
					substr ( $userIds, 1 );
				}
				$param ['userIds'] = $userIds;
			}
		} else if ($key == '2' && $ids != '') {
			$user = $transfer->getUserIdsByRole ( $ids );
			$userIds = "";
			for($i = 0; $i < count ( $user ); $i ++) {
				$userIds = $userIds . $user [$i]->userId . ",";
			}
			$userIds = ($userIds == "") ? $userIds : substr ( $userIds, 0, strlen ( $userIds ) - 1 );
			$param ['userIds'] = $userIds;
		}
		if (isset ( $param ['userIds'] )) {
			if ($param ['userIds'] == "") {
				echo json_encode ( array (
						'page' => 0,
						'total' => 0,
						'rows' => array () 
				) );
			} else {
				$mp = $transfer->findUserList ( $param );
				echo $this->setUserResult ( $mp, $page, $rp );
			}
		}
	}
	
	/**
	 * 设置用户结果集
	 *
	 * @param unknown $mp        	
	 * @param unknown $page        	
	 * @param unknown $rp        	
	 * @return string
	 */
	private function setUserResult($mp, $page, $rp) {
		$total = $mp->total;
		$cells = $mp->users;
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total,
				'rows' => $rows 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox">',
					'ID' => $cell->id,
					'userid' => $cell->userid,
					'name' => $cell->empName,
					'emailAddress' => $cell->emailAddress,
					'mobtel' => $cell->mobTel 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return json_encode ( $result );
	}
	
	/**
	 * 获取选中用户列表
	 */
	public function getSelectedUserList() {
		$modelId = isset ( $_GET ['modelId'] ) ? $_GET ['modelId'] : '';
		$stepId = isset ( $_GET ['stepId'] ) ? $_GET ['stepId'] : '';
		if ($modelId != '' && $stepId != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $this->setSelectedUserResult ( $transfer->findStepUserList ( $modelId, $stepId ), 1, 1 );
		}
	}
	
	/**
	 * 设置选中用户结果集
	 *
	 * @param unknown $mp        	
	 * @param unknown $page        	
	 * @param unknown $rp        	
	 * @return string
	 */
	private function setSelectedUserResult($cells, $page, $rp) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => count ( $cells ),
				'rows' => $rows 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox">',
					'ID' => $cell->id,
					'flag' => $cell->flag,
					'user' => $cell->user,
					'name' => $cell->name 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return json_encode ( $result );
	}
	
	/**
	 * 获取角色列表
	 */
	public function findRoleList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$searchKeyword = isset ( $_GET ['searchKeyword'] ) ? $_GET ['searchKeyword'] : '';
		$transfer = $this->exec ( "getProxy", 'transferFlow' );
		$mp = $transfer->findRoleList ( $page, $rp, $searchKeyword );
		echo $this->setRoleResult ( $mp, $page, $rp );
	}
	
	/**
	 * 设置角色结果集
	 *
	 * @param unknown $mp        	
	 * @param unknown $page        	
	 * @param unknown $rp        	
	 * @return string
	 */
	private function setRoleResult($mp, $page, $rp) {
		$total = $mp->total;
		$cells = $mp->roles;
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total,
				'rows' => $rows 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox" roleId="' . $cell->roleId . '">',
					'ID' => $cell->id,
					'roleId' => $cell->roleId,
					'roleName' => $cell->roleName,
					'roleRemark' => $cell->roleRemark,
					'createTime' => $cell->createTime,
					'isSystem' => $cell->isSystem 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return json_encode ( $result );
	}
	
	/**
	 * 下载
	 *
	 * @return number
	 */
	public function fileDown() {
		$fileUrl = $_GET ['fileUrl'];
		$filName = basename ( $fileUrl );
		$filName = urlencode ( $filName );
		Header ( "Content-type: application/octet-stream;" );
		Header ( "Accept-Ranges: bytes" );
		Header ( "Content-Disposition: attachment; filename=" . $filName );
		if ($fileUrl) {
			return readfile ( $fileUrl );
		}
	}
	
	/**
	 * 验证流程类型名称唯一性
	 */
	public function uniqueName() {
		$flowType ['pId'] = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$flowType ['name'] = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		if ($flowType ['pId'] != '' && $flowType ['name'] != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $transfer->uniqueName ( json_encode ( $flowType ) );
		}
	}
	
	/**
	 * 函数名称唯一性验证
	 */
	public function uniqueFunName() {
		$name = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		if ($name != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $transfer->uniqueFunName ( $name );
		}
	}
	
	/**
	 * lujixiang 20150421
	 * 暂停工作流
	 */
	public function haltWorkFlow() {
		$flowId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		if ($flowId != '') {
			$transfer = $this->exec ( "getProxy", 'transferFlow' );
			echo $transfer->haltWorkFlow ( $flowId );
		}
	}
}