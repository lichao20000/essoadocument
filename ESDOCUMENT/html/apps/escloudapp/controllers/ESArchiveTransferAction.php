<?php
/**
 * 
 * @author xuekun
 *
 */
class ESArchiveTransferAction extends ESActionBase {
	
	/**
	 * 创建销毁单
	 */
	public function createTransferForm() {
		$postData = isset ( $_POST ['postData'] ) ? $_POST ['postData'] : "";
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : "";
		$paths = isset ( $_POST ['paths'] ) ? $_POST ['paths'] : "";
		$condition = isset ( $_POST ['condition'] ['condition'] ) ? $_POST ['condition'] ['condition'] : "";
		$nodePath = $_POST ['nodePath'];
		$billId = isset ( $_POST ['billId'] ) ? $_POST ['billId'] : "";
		$groupCondition = isset ( $_POST ['groupCondition'] ) ? $_POST ['groupCondition'] : "";
		$userId = $this->getUser ()->getId ();
		$param = json_encode ( array (
				'postData' => $postData,
				'formId' => $formId,
				'paths' => $paths,
				'condition' => $condition,
				'nodePath' => $nodePath,
				'userId' => $userId,
				'billId' => $billId,
				'groupCondition' => $groupCondition 
		) );
		$Proxy = $this->exec ( 'getProxy', 'escloud_transfercationws' );
		$result = $Proxy->createDestroyForm ( $param );
		echo json_encode ( $result );
	}
	public function getTransferPathList() {
		$paths = isset ( $_POST ['paths'] ) ? $_POST ['paths'] : "";
		$condition = isset ( $_POST ['condition'] ['condition'] ) ? $_POST ['condition'] ['condition'] : "";
		$nodePath = $_POST ['nodePath'];
		$groupCondition = isset ( $_POST ['groupCondition'] ) ? $_POST ['groupCondition'] : "";
		$userId = $this->getUser ()->getId ();
		$param = json_encode ( array (
				'paths' => $paths,
				'userId' => $userId,
				'condition' => $condition,
				'nodePath' => $nodePath,
				'groupCondition' => $groupCondition 
		) );
		$Proxy = $this->exec ( 'getProxy', 'escloud_transfercationws' );
		$result = $Proxy->getTransferPathList ( $param );
		echo json_encode ( $result );
	}
}