<?php
/**
 * 目录检查模块
 * @author dengguoqi
 *
 */
class ESCatalogCheckAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	/**
	 * 返回目录检查结果
	 * xuekun 2014年12月12日 add
	 */
	public function findNoDataNodeList() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$deviceId = isset ( $_POST ['deviceId'] ) ? $_POST ['deviceId'] : '0';
		if ($stageId != '') {
			$proxy = $this->exec ( 'getProxy', 'catalogcheck' );
			$list = $proxy->findNoDataNodeList ( $stageId, $deviceId );
			echo json_encode ( $list );
		}
	}
	public function checkNode() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$deviceId = isset ( $_POST ['deviceId'] ) ? $_POST ['deviceId'] : '';
		if ($stageId != '') {
			return $this->renderTemplate ( array (
					'stageId' => $stageId,
					'deviceId' => $deviceId 
			), 'ESCatalogCheck/nodeDataList' );
		}
	}
}
