<?php
/**
 * 文件流转模块
 * @author xuekun
 *
 */
class ESDocumentTransferAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	/**
	 * 数据流转流程启动前对数据进行验证，检查是否存在正在流转的数据
	 *
	 * @author xuekun 2015年2月9日 下午4:53:54
	 */
	public function checkTransfer() {
		$userId = $this->getUser ()->getId ();
		$stageId = $_POST ['stageId'];
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : "";
		$param = json_encode ( array (
				'userId' => $userId,
				'stageId' => $stageId,
				'id' => $id 
		) );
		$proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$msg = $proxy->checkTransfer ( $param );
		echo json_encode ( $msg );
	}
	public function getWfList() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : "0"; // 表单分类Id
		$userId = $this->getUser ()->getId ();
		$bigOrgId = $this->getUser ()->getBigOrgId ();
		$param = json_encode ( array (
				'userId' => $userId,
				'bigOrgId' => $bigOrgId,
				'stageId' => $stageId 
		) );
		$proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$result = $proxy->getWfList ( $param );
		$size = $result->size;
		if ($size == 0) {
			echo false;
		} elseif ($size == 1) {
			$data = $result->data;
			echo $data [0]->flowId;
		} else {
			return $this->renderTemplate ( array (
					'size' => $result->size,
					'data' => $result->data 
			) );
		}
	}
	public function transferBillCreate() {
	}
	public function showMyForm() {
		$flowId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : 0;
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : 0;
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : 0;
		$userId = $this->getUser ()->getId ();
		$remoteAddr = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( array (
				'flowId' => $flowId,
				'id' => $id,
				'userId' => $userId,
				'stageId' => $stageId,
				'ip' => $remoteAddr 
		) );
		$Proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$result = $Proxy->showMyForm ( $postData );
		return $this->renderTemplate ( array (
				'formList' => $result->data,
				'step' => $result->step,
				'flowId' => $flowId,
				'id' => $id,
				'stageId' => $stageId 
		) );
	}
	public function startTransferFlow() {
		$request = $this->getRequest ();
		$data = $request->getPost ();
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$data ['ip'] = $ip;
		$data ['userId'] = $userId;
		$proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$result = $proxy->startTransferFlow ( json_encode ( $data ) );
		echo json_encode ( $result );
	}
	public function getWFModelByFormId() {
		$flowId = $_POST ['flowId'];
		$userId = $this->getUser ()->getId ();
		$param = json_encode ( array (
				'flowId' => $flowId,
				'userId' => $userId 
		) );
		$proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$result = $proxy->getWFModelByflowId ( $param );
		echo json_encode ( $result );
	}
	/**
	 * 渲染表单发起页面
	 *
	 * @return string
	 */
	public function formStartHandlePage() {
		$data ['flowId'] = $_POST ['wfId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['wfId'] = '';
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$Proxy = $this->exec ( 'getProxy', "collaborative" );
		return $this->renderTemplate ( array (
				"data" => array (
						$Proxy->getActions ( $data ) 
				) 
		) );
	}
	/**
	 * 获取步骤处理用户
	 */
	public function getStepOwner() {
		$formData = isset ( $_POST ['formData'] ) ? $_POST ['formData'] : '';
		parse_str ( $formData, $out );
		$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$data ['formId'] = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$data ['actionId'] = isset ( $_POST ['actionId'] ) ? $_POST ['actionId'] : '';
		$data ['dataId'] = isset ( $_POST ['dataId'] ) ? $_POST ['dataId'] : '';
		$data ['stepId'] = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$data ['formUserId'] = isset ( $_POST ['formUserId'] ) ? $_POST ['formUserId'] : '';
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$data = $data + $out;
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo json_encode ( $Proxy->getStepOwner ( $data ) );
	}
	public function startWorkflow() {
		$params = $_POST ['postData'];
		$params = $params . '&formId=' . $_POST ['formId'] . '&flowId=' . $_POST ['flowId'] . '&actionId=' . $_POST ['actionId'] . '&dataId=' . $_POST ['dataId'] . '&selectUsers=' . $_POST ['selectUsers'] . '&userId=' . $this->getUser ()->getId () . '&remoteAddr=' . $_SERVER ["REMOTE_ADDR"];
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$result = $Proxy->startWorkflow ( $postData );
		
		$resultMap = json_decode ( $result );
		$successFlag = $resultMap->success;
		if ($successFlag) {
			unset ( $_SESSION ['shopcar'] );
		}
		echo $result;
	}
	public function setTransferstaus() {
		$dataid = isset ( $_POST ['dataid'] ) ? $_POST ['dataid'] : 0;
		$transferStatus = isset ( $_POST ['transferStatus'] ) ? $_POST ['transferStatus'] : '';
		$Proxy = $this->exec ( 'getProxy', 'documentTransfer' );
		$result = $Proxy->setTransferstaus ( json_encode ( array (
				'dataid' => $dataid,
				'transferStatus' => $transferStatus 
		) ) );
		echo $result;
	}
	public function saveWorkFlow() {
		$params = $_POST ['postData'];
		$flowId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : 0;
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : 0;
		$params = $params . '&flowId=' . $flowId . '&id=' . $id . '&userId=' . $this->getUser ()->getId () . '&remoteAddr=' . $_SERVER ["REMOTE_ADDR"];
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'transferFlow' );
		$result = $Proxy->saveWorkFlow ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 渲染自定义选择部门
	 * @return string
	 */
	public function userDefinedPart() {
		$stepId = $_POST ['stepId'];
		return $this->renderTemplate ( array (
				"stepId" => $stepId 
		) );
	}
}