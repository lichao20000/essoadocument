<?php
/**
 * 文件归档模块
 * @author dengguoqi
 *
 */
class ESFilingAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	
	/**
	 * 获取待归档文件列表
	 */
	public function findDocumentList() {
		$document ['stageCode'] = isset ( $_GET ['code'] ) ? $_GET ['code'] : '';
		$document ['stageId'] = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : '0';
		$document ['typeNo'] = isset ( $_GET ['typeNo'] ) ? $_GET ['typeNo'] : '';
		$document ['keyWord'] = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$document ['page'] = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$document ['pre'] = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		if (! isset ( $condition ['condition'] )) {
			$condition ['condition'] = null;
		}
		$document ['condition'] = $condition ['condition'];
		$filing = $this->exec ( "getProxy", "filing" );
		$total = $filing->getCount ( $document );
		$cells = $filing->findDocumentList ( $document );
		$moveCols = array ();
		if (isset ( $document ['stageId'] ) && $document ['stageId'] > 0) {
			$moveCols = $this->getMoveCols ( $document ['stageId'] );
		}
		echo json_encode ( $this->setFileResult ( $document ['page'], $document ['pre'], $total, $cells, $moveCols ) );
	}
	
	/**
	 * 设置文件结构集
	 *
	 * @param unknown $page        	
	 * @param unknown $rp        	
	 * @param unknown $total        	
	 * @param unknown $cells        	
	 * @return multitype:unknown multitype:
	 */
	private function setFileResult($page, $rp, $total, $cells, $moveCols) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		if (count ( $cells ) > 0) {
			$line = ($page - 1) * $rp + 1;
			foreach ( $cells as $cell ) {
				$row ['id'] = $cell->id;
				$row ['cell'] = array (
						'num' => $line,
						'ids' => '<input type="checkbox"  class="checkbox" docId="' . $cell->id . '"/>',
						'title' => $cell->title,
						'docNo' => $cell->docNo,
						'device' => $cell->device,
						'part' => $cell->part,
						'person' => $cell->person,
						'date' => $cell->date,
						'itemName' => $cell->itemName,
						'stageName' => $cell->stageName,
						'documentTypeName' => $cell->documentTypeName,
						'engineeringName' => $cell->engineeringName
				);
				foreach ( $moveCols as $col ) {
					$key = $col->code;
					$row ['cell'] [$key] = $cell->$key;
				}
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 获取文件动态列
	 */
	public function findMoveCols() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '0';
		if ($stageId != '' && $stageId != '0') {
			echo json_encode ( $this->getMoveCols ( $stageId ) );
		}
	}
	private function getMoveCols($stageId) {
		$filing = $this->exec ( "getProxy", "filing" );
		$parentStageIds = $filing->getParentStageIds ( $stageId );
		return $filing->findMoveCols ( $parentStageIds );
	}
	/**
	 * 获取归档目标目录树
	 */
	public function getDtree() {
		$status = isset ( $_GET ['status'] ) ? $_GET ['status'] : 1; // 获取当前业务的状态
		$userId = $this->getUser ()->getId ();
		$filing = $this->exec ( 'getProxy', 'filing' );
		$treelist = $filing->getBusinessAuthorTree ( '1', $status, $userId );
		if (count ( $treelist ) > 0) {
			$treelist [0]->open = true;
			$treelist [0]->code = '';
			$treelist [0]->isLeaf = '1';
		}
		echo json_encode ( $treelist );
	}
	
	/**
	 * 通过id获取选择的文档列表
	 */
	public function findDocumentById() {
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : '';
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : '0';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$pre = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		if ($ids != '') {
			$filing = $this->exec ( "getProxy", "filing" );
			$total = $filing->getCountById ( $stageId, $ids );
			$moveCols = $this->getMoveCols ( $stageId );
			$cells = $filing->findDocumentById ( $page, $pre, $stageId, $ids );
			echo json_encode ( $this->setFileResult ( $page, $pre, $total, $cells, $moveCols ) );
		}
	}
	
	/**
	 * 获取元数据字段列表
	 */
	public function findDocumentMetaByStageId() {
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : '';
		if ($stageId != '') {
			$filing = $this->exec ( "getProxy", "filing" );
			echo json_encode ( $this->setMetaResult ( $filing->findDocumentMetaByStageId ( $stageId ) ) );
		}
	}
	
	/**
	 * 设置元数据结果集
	 *
	 * @param unknown $cells        	
	 * @return multitype:number multitype:
	 */
	private function setMetaResult($cells) {
		$total = count ( $cells );
		$page = 1;
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		$typeen = array (
				'TEXT',
				'NUMBER',
				'DATE',
				'FLOAT',
				'TIME',
				'BOOL',
				'RESOURCE' 
		);
		$typecn = array (
				'文本',
				'数值',
				'日期',
				'浮点',
				'时间',
				'布尔',
				'资源' 
		);
		if ($total > 0) {
			$line = ($page - 1) * $total + 1;
			foreach ( $cells as $cell ) {
				foreach ( $typeen as $n => $type ) {
					if ($type == $cell->type)
						$ESTYPE = $typecn [$n];
				}
				switch ($cell->isNull) {
					case "0" :
						$ESISNULL = '是';
						break;
					case "1" :
						$ESISNULL = '否';
						break;
				}
				switch ($cell->isSystem) {
					case "0" :
						$ESISSYSTEM = '是';
						break;
					case "1" :
						$ESISSYSTEM = '否';
						break;
				}
				$row ['id'] = $cell->id;
				$row ['cell'] = array (
						'id' => $cell->id,
						'num' => $line,
						'name' => $cell->name,
						'code' => $cell->code,
						'type' => $ESTYPE,
						'length' => $cell->length,
						'defaultValue' => $cell->defaultValue,
						'isNull' => $ESISNULL,
						'isSystem' => $ESISSYSTEM,
						'metaDataId' => $cell->metaDataId,
						'esidentifier' => $cell->esidentifier 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 依据选择的id归档文件
	 */
	public function idsFiling() {
		$fill ['ids'] = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		$fill ['direct'] = isset ( $_POST ['direct'] ) ? $_POST ['direct'] : '';
		$fill ['stageId'] = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$fill ['stageName'] = isset ( $_POST ['stageName'] ) ? $_POST ['stageName'] : '';
		$fill ['directName'] = isset ( $_POST ['directName'] ) ? $_POST ['directName'] : '';
		$fill ['field'] = isset ( $_POST ['field'] ) ? $_POST ['field'] : array ();
		$fill ['creater'] = $this->getUser ()->getId ();
		$fill ['createtime'] = date ( 'Y-m-d H:i:s', time () );
		if ($fill ['ids'] != '' && $fill ['direct'] != '' && $fill ['stageId'] != '' && $fill ['field'] != ''
			&& $fill ['stageName'] != ''&& $fill ['directName'] != '') {
			$filing = $this->exec ( "getProxy", "filing" );
			echo $filing->idsFiling ( $fill );
		}
	}
	
	/**
	 * 依据筛选条件归档文件
	 */
	public function conditionFiling() {
		$condition = isset ( $_POST ['condition'] ) ? $_POST ['condition'] : '';
		$fill ['direct'] = isset ( $_POST ['direct'] ) ? $_POST ['direct'] : '';
		$fill ['stageId'] = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$fill ['stageCode'] = isset ( $_POST ['stageCode'] ) ? $_POST ['stageCode'] : '';
		$fill ['stageName'] = isset ( $_POST ['stageName'] ) ? $_POST ['stageName'] : '';
		$fill ['directName'] = isset ( $_POST ['directName'] ) ? $_POST ['directName'] : '';
		$fill ['field'] = isset ( $_POST ['field'] ) ? $_POST ['field'] : array ();
		$fill ['creater'] = $this->getUser ()->getId ();
		$fill ['createtime'] = date ( 'Y-m-d H:i:s', time () );
		if ( $fill ['direct'] != '' && $fill ['stageId'] != '' && $fill ['stageCode'] != '' && $fill ['field'] != ''
			&& $fill ['stageName'] != ''&& $fill ['directName'] != '') {
			$filing = $this->exec ( "getProxy", "filing" );
			$fill ['condition'] = $condition ['condition'];
			echo $filing->conditionFiling ( $fill );
		}
	}
	
	/**
	 * 检验收集范围是否定义归档规则
	 */
	public function checkFilingRegulation() {
		$code = isset ( $_GET ['code'] ) ? $_GET ['code'] : '';
		if ($code != '') {
			$filing = $this->exec ( "getProxy", "filing" );
			echo $filing->checkFilingRegulation ( $code );
		}
	}
	
	// 返回结构字段数据table
	public function structure_json() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 10;
		$filing = $this->exec ( "getProxy", "filing" );
		$rows = $filing->getStructureList ( $_GET ['id'], $page, 1000 );
		$total = $rows->total;
		$typeen = array (
				'TEXT',
				'NUMBER',
				'DATE',
				'FLOAT',
				'TIME',
				'BOOL',
				'RESOURCE' 
		);
		$typecn = array (
				'文本',
				'数值',
				'日期',
				'浮点',
				'时间',
				'布尔',
				'资源' 
		);
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		if ($total > 0) {
			foreach ( $rows->dataList as $row ) {
				foreach ( $typeen as $n => $type ) {
					if ($type == $row->ESTYPE)
						$ESTYPE = $typecn [$n];
				}
				switch ($row->ESISNULL) {
					case "0" :
						$ESISNULL = '否';
						break;
					case "1" :
						$ESISNULL = '是';
						break;
				}
				switch ($row->ESISSYSTEM) {
					case "0" :
						$ESISSYSTEM = '否';
						break;
					case "1" :
						$ESISSYSTEM = '是';
						break;
				}
				$entry = array (
						'id' => $row->ID,
						'cell' => array (
								'id' => $row->ID,
								'ESIDENTIFIER' => $row->ESIDENTIFIER,
								'METADATA' => $row->METADATA,
								'ESTYPE' => $ESTYPE,
								'ESISNULL' => $ESISNULL,
								'ESLENGTH' => $row->ESLENGTH,
								'ESDOTLENGTH' => $row->ESDOTLENGTH,
								'ESISSYSTEM' => $ESISSYSTEM,
								'ESDESCRIPTION' => $row->ESDESCRIPTION 
						) 
				);
				$jsonData ['rows'] [] = $entry;
			}
		}
		echo json_encode ( $jsonData );
	}
}
