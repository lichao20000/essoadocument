<?php
/**
 * 文件元数据模块
 * @author dengguoqi
 *
 */
class ESDocumentsMetadataAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	/**
	 * 元数据列表
	 * xuekun 2014年11月19日
	 */
	public function getMetadataList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : '';
		$isSystem = isset ( $_GET ['isSystem'] ) ? $_GET ['isSystem'] : '';
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$where = null;
		if ($query !== '') {
			if (isset ( $query ['condition'] )) {
				$where = $query ['condition'];
			}
		}
		$proxy = $this->exec ( "getProxy", "documentsMetadata" );
		$count = $proxy->getCount ( json_encode ( array (
				'stageId' => $stageId,
				'isSystem' => $isSystem,
				'where' => $where 
		) ) );
		$list = $proxy->getDataList ( $page, $rp, json_encode ( array (
				'stageId' => $stageId,
				'isSystem' => $isSystem,
				'where' => $where 
		) ) );
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array () 
		);
		$start = ($page - 1) * $rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $metadata ) {
				$metadata->num = $start + 1;
				$metadata->ids = "<input type=\"checkbox\" class=\"checkbox\"  name=\"checkName\" value=" . $metadata->id . " id=\"checkName\">";
				$metadata->operate = "<span class='editbtn' id=" . $metadata->id . "> </span>";
				$result ["rows"] [] = array (
						"id" => $metadata->id,
						"cell" => $metadata 
				);
				$start ++;
			}
		}
		
		echo json_encode ( $result );
	}
	/**
	 * 添加元数据
	 * xuekun 2014年11月19日
	 */
	public function addMetadata() {
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if ($param) {
			$name = isset ( $param ['name'] ) ? $param ['name'] : '';
			$code = isset ( $param ['code'] ) ? $param ['code'] : '';
			$type = isset ( $param ['type'] ) ? $param ['type'] : '';
			$length = isset ( $param ['toLength'] ) ? $param ['toLength'] : '';
			$dotLength = isset ( $param ['dotLength'] ) ? $param ['dotLength'] : '';
			$defaultValue = isset ( $param ['defaultValue'] ) ? $param ['defaultValue'] : '';
			$isSystem = isset ( $param ['isSystem'] ) ? $param ['isSystem'] : '1';
			$isNull = isset ( $param ['isNull'] ) ? $param ['isNull'] : '0';
			$stageId = isset ( $param ['stageId'] ) ? $param ['stageId'] : '';
			$metaDataId = isset ( $param ['metaDataId'] ) ? $param ['metaDataId'] : '';
			$esidentifier = isset ( $param ['esidentifier'] ) ? $param ['esidentifier'] : '';
			if ($name != '' && $code != '' && $type != '' && $length != '') {
				$proxy = $this->exec ( "getProxy", "documentsMetadata" );
				$data = array (
						'ip'=>$ip,
						'userId'=>$userId,
						'name' => $name,
						'code' => $code,
						'type' => $type,
						'length' => $length,
						'dotLength' => $dotLength == '' ? 0 : $dotLength,
						'defaultValue' => $defaultValue,
						'metaDataId' => $metaDataId,
						'esidentifier' => $esidentifier,
						'isNull' => $isNull,
						'isSystem' => $isSystem 
				);
				if ($stageId != '') {
					$data ['stageId'] = $stageId;
				}
				$result = $proxy->addData ( json_encode ( $data ) );
			}
			echo json_encode ( $result );
		}
	}
	/**
	 * 编辑元数据
	 * xuekun 2014年11月19日
	 */
	public function edit() {
		if (isset ( $_POST ['id'] )) {
			$proxy = $this->exec ( "getProxy", "documentsMetadata" );
			$id = $_POST ['id'];
			$data = ( array ) $proxy->getData ( $id );
			return $this->renderTemplate ( $data );
		}
	}
	/**
	 * 更新元数据
	 * xuekun 2014年11月19日
	 */
	public function updateMetadata() {
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if (isset ( $param ['id'] )) {
			$name = isset ( $param ['name'] ) ? $param ['name'] : '';
			$code = isset ( $param ['code'] ) ? $param ['code'] : '';
			$type = isset ( $param ['type'] ) ? $param ['type'] : '';
			$length = isset ( $param ['toLength'] ) ? $param ['toLength'] : '';
			$dotLength = isset ( $param ['dotLength'] ) ? $param ['dotLength'] : 0;
			$defaultValue = isset ( $param ['defaultValue'] ) ? $param ['defaultValue'] : null;
			$stageId = isset ( $param ['stageId'] ) ? $param ['stageId'] : null;
			$isSystem = isset ( $param ['isSystem'] ) ? $param ['isSystem'] : '1';
			$isNull = isset ( $param ['isNull'] ) ? $param ['isNull'] : '0';
			$metaDataId = isset ( $param ['metaDataId'] ) ? $param ['metaDataId'] : '';
			$esidentifier = isset ( $param ['esidentifier'] ) ? $param ['esidentifier'] : '';
			if ($name != '' && $code != '' && $type != '' && $length != '') {
				$proxy = $this->exec ( "getProxy", "documentsMetadata" );
				$documentType = array (
						'ip'=>$ip,
						'userId'=>$userId,
						'id' => $param ['id'],
						'name' => $name,
						'code' => $code,
						'type' => $type,
						'length' => $length,
						'dotLength' => $dotLength == '' ? 0 : $dotLength,
						'defaultValue' => $defaultValue,
						'metaDataId' => $metaDataId,
						'esidentifier' => $esidentifier,
						'isNull' => $isNull,
						'isSystem' => $isSystem 
				);
				if ($stageId != '') {
					$documentType ['stageId'] = $stageId;
				}
				$flag = $proxy->updateData ( json_encode ( $documentType ) );
				echo $flag;
			}
		}
	}
	/**
	 * 删除元数据
	 * xuekun 2014年11月19日
	 */
	public function deleteMetadata() {
		$param = $_POST;
		if ($param) {
			$ids = isset ( $param ['ids'] ) ? $param ['ids'] : '';
			$flag = false;
			if ($ids != '') {
				$proxy = $this->exec ( "getProxy", "documentsMetadata" );
				$flag = $proxy->deleteData ( json_encode ( explode ( ',', $ids ) ) );
			}
			echo json_encode ( $flag );
		}
	}
	/**
	 * xuekun 2014年12月18日 add
	 */
	public function docNoRulesToAdd() {
		$stageId = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		$proxy = $this->exec ( 'getProxy', 'documentsMetadata' );
		$result = $proxy->getStageFieldToAdd ( $stageId );
		$docrule = $proxy->getDocRule ( $stageId );
		$left = '';
		foreach ( $result as $map ) {
			$left .= '<li id="' . $map->tagId . '" >' . $map->display . '</li>';
		}
		return $this->renderTemplate ( array (
				'left' => $left,
				'id' => $docrule->id,
				'stageId' => $stageId,
				'tagtexts' => $docrule->tagtexts 
		), 'ESDocumentsMetadata/docNoField' );
	}
	/**
	 */
	public function addDocNoRule() {
		$tagids = isset ( $_POST ['tagids'] ) ? $_POST ['tagids'] : '';
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$proxy = $this->exec ( 'getProxy', 'documentsMetadata' );
		if ($stageId != '') {
			$result = $proxy->addDocNoRule ( json_encode ( array (
					'id' => $id,
					'tagids' => $tagids,
					'stageId' => $stageId 
			) ) );
			echo $result;
		}
	}
	/**
	 * xuekun 2015年1月5日 add
	 */
	public function meta_json() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 10;
		$medataProxy = $this->exec ( 'getProxy', 'escloud_metadataws' );
		$medata_list = $medataProxy->getMetadata ( 1, $page, $rp );
		$total = $medata_list->total;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		if ($total > 0) {
			foreach ( $medata_list->dataList as $row ) {
				$entry = array (
						'id' => $row->id,
						'cell' => array (
								'radio' => '<input type="radio" name="metadata" value="' . $row->id . '">',
								'name' => $row->estitle,
								'ident' => $row->esidentifier,
								'type' => $row->estype,
								'search' => $row->esismetadatasearch ? '是' : '否',
								'desc' => $row->esdescription 
						) 
				);
				$jsonData ['rows'] [] = $entry;
			}
		}
		
		echo json_encode ( $jsonData );
	}
	
	public  function checkedMetadataExists(){
		$value = isset ( $_POST ['value'] ) ? $_POST ['value'] : '';
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$isSystem = isset ( $_POST ['isSystem'] ) ? $_POST ['isSystem'] : '';
		$param = array();
		$param['value'] = $value;
		$param['type'] = $type;
		$param['stageId'] = $stageId;
		$param['id'] = $id;
		$param['isSystem'] = $isSystem;
		
		$medataProxy = $this->exec ( 'getProxy', 'documentsMetadata' );
		$result = $medataProxy->checkedMetadataExists(json_encode($param));
		echo $result;
	}
	
	public  function checkedArchiveMetadataRepeat(){
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] :'0';
		$esidentifier = isset ( $_POST ['esidentifier'] ) ? $_POST ['esidentifier'] :'';
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] :'0';
		$isSystem = isset ( $_POST ['isSystem'] ) ? $_POST ['isSystem'] :'1';
		$param = array();
		$param['stageId'] = $stageId;
		$param['esidentifier'] = $esidentifier;
		$param['id'] = $id;
		$param['isSystem'] = $isSystem;
		if($esidentifier!=''){
			$medataProxy = $this->exec ( 'getProxy', 'documentsMetadata' );
			$result = $medataProxy->checkedArchiveMetadataRepeat(json_encode($param));
			echo $result;
		}
	}
}
