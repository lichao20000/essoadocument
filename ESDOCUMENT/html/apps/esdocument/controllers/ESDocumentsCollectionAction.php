<?php
/**
 * 文件收集模块
 * @author dengguoqi
 *
 */
class ESDocumentsCollectionAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	public function getTree() {
		$treetype = isset ( $_GET ['treetype'] ) ? $_GET ['treetype'] : 1;
		if ($treetype == 1) {
			$proxy = $this->exec ( "getProxy", "documentStage" );
			$tree = $proxy->getTree ( 1 );
			if (count ( $tree ) > 0) {
				$tree [0]->open = true;
			}
			echo json_encode ( $tree );
		} else if ($treetype == 2) {
			$pId = '';
			$where = '';
			$param = array(
					'pId' => $pId,
					'where' => $where
			);
			$participatory = $this->exec ( "getProxy", "participatory" );
			$tree = $participatory->getAllParticipatory ( json_encode($param) );
			if (count ( $tree ) > 0) {
				$tree [0]->open = true;
			}
			echo json_encode ( $tree );
		} else {
			$proxy = $this->exec ( "getProxy", "device" );
			$tree = $proxy->getTree ();
			if (count ( $tree ) > 0) {
				$tree [0]->open = true;
			}
			echo json_encode ( $tree );
		}
	}
	function findDocumentList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$code = isset ( $_POST ['query']['code'] ) ? $_POST ['query']['code'] : "-1";
		$treetype = isset ( $_POST ['query']['treetype'] ) ? $_POST ['query']['treetype'] : '1';
		if($code=='')$code="-1";
		if ($treetype == 1) {
			$type = 'stageCode';
		} else if ($treetype == 2) {
			$type = 'participatoryCode';
		} else {
			$type = 'deviceCode';
		}
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$where = null;
		if ($query !== '') {
			if (isset ( $query ['condition'] )) {
				$where = $query ['condition'];
			}
		}
		$data = array (
				$type => $code,
				'where' => $where 
		);
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$count = $proxy->getCount ( json_encode ( $data ) );
		$list = $proxy->getDataList ( $page, $rp, json_encode ( $data ) );
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array () 
		);
		$start = ($page - 1) * $rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $document ) {
				$document->num = $start + 1;
				$document->ids = "<input type=\"checkbox\" class=\"checkbox\"  name=\"checkname\" value=" . $document->id . " id=\"checkname\">";
				$document->operate = "<span class='editbtn' id=" . $document->id . "> </span>";
				$result ["rows"] [] = array (
						"id" => $document->id,
						"cell" => $document 
				);
				$start ++;
			}
		}
		
		echo json_encode ( $result );
	}
	public function add() {
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '0';
		$name = isset ( $_GET ['name'] ) ? $_GET ['name'] : '';
		$treeType = isset ( $_GET ['treeType'] ) ? $_GET ['treeType'] : 1;
		$typeName = '';
		$typeCode = '';
		$data =$this->getForm ( $id );
		switch ($treeType) {
			case 1 :
				$typeName = 'stage';
				$typeCode = $this->getStageCode ( $id );
				break;
			case 2 :
				$typeName = 'participatory';
				$typeCode = $this->getParticipatoryCode ( $id );
				break;
			default :
				$typeName = 'device';
				$typeCode = $this->getDeviceCode ( $id );
		}
		$uid = $this->getUser ()->getId ();
		$userInfo = $this->exec ( "getProxy", "user" )->getUserInfo ( $uid );
		return $this->renderTemplate ( array (
				$typeName . 'Id' => $id,
				$typeName . 'Code' => $typeCode,
				$typeName . 'Name' => $name,
				'formData' => $data,
				'person_' => $userInfo->lastName . $userInfo->firstName 
		), 'ESDocumentsCollection/add' . $treeType );
	}
	public function getStageCode($id) {
		$proxy = $this->exec ( "getProxy", "documentStage" );
		$data = $proxy->getData ( $id );
		return $data->code;
	}
	public function getDeviceCode($id) {
		$proxy = $this->exec ( "getProxy", "device" );
		$data = $proxy->getDevice ( $id );
		return $data->deviceNo;
	}
	public function getParticipatoryCode($id) {
		$proxy = $this->exec ( "getProxy", "participatory" );
		$data = $proxy->getParticipatoryById ( $id );
		return $data->code;
	}
	public function edit() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : 0;
		$proxyDocument = $this->exec ( "getProxy", "documentsCollection" );
		$stageId = $proxyDocument->getStageId ( $id );
		$data = $this->getForm ( $stageId );
		$stageData = ( array ) $proxyDocument->getStageData ( $stageId, $id );
		$proxy = $this->exec ( "getProxy", "documentStage" );
		$stage = ( array ) $proxy->getData ( $stageId );
		return $this->renderTemplate ( array (
				'formData' => $data,
				'stagData' => $stageData,
				'stageId' => $stageId,
				'stageCode' => $stage ['code'] 
		) );
	}
	public function getForm($stageId=1) {
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$formData = $proxy->getForm ( $stageId );
		$data = json_decode ( json_encode ( $formData ), true );
		
		foreach ( $data as $key => $value ) {
			if ($value ['dotLength'] == null) {
				$value ['dotLength'] = 0;
			}
			$data [$key] ['verify'] = strtolower ( $value ['type'] ) . '/' . $value ['length'] . '/' . $value ['isNull'] . '/' . $value ['dotLength'];
		}
		return $data;
	}
	/**
	 * 获取某节点的数据字段列表(不包含系统字段)
	 * @author xuekun 2015年3月23日 下午2:49:40
	 */
	public function getFileds() {
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : 0;
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$formData = $proxy->getStageField ( $stageId );
		$data = json_decode ( json_encode ( $formData ), true );
		foreach ( $data as $key => $value ) {
			if ($value ['dotLength'] == null) {
				$value ['dotLength'] = 0;
			}
			$data [$key] ['verify'] = strtolower ( $value ['type'] ) . '/' . $value ['length'] . '/' . $value ['isNull'] . '/' . $value ['dotLength'];
		}
		echo json_encode ( $data );
	}
	public function addDocument() {
		$request = $this->getRequest ();
		$data = $request->getPost ();
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$data ['ip'] = $ip;
		$data ['userId'] = $userId;
		$data ['fileList'] = json_decode ( $data ['fileList'] );
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$result = $proxy->addData ( json_encode ( $data ) );
		echo json_encode ( $result );
	}
	public function updateDocument() {
		$request = $this->getRequest ();
		$data = $request->getPost ();
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$data ['ip'] = $ip;
		$data ['userId'] = $userId;
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$result = $proxy->updateData ( json_encode ( $data ) );
		echo $result;
	}
	/**
	 * 删除文件收集范围
	 */
	public function deleteDocument() {
		$param = $_POST;
		if ($param) {
			$ids = isset ( $param ['ids'] ) ? $param ['ids'] : '';
			$flag = false;
			if ($ids != '') {
				$proxy = $this->exec ( "getProxy", "documentsCollection" );
				$flag = $proxy->deleteData ( json_encode ( explode ( ',', $ids ) ) );
			}
			echo json_encode ( $flag );
		}
	}
	/**
	 * 获取流程
	 * xuekun 2014年12月1日
	 *
	 * @return string
	 */
	public function sendFlow() {
		$param = $_POST;
		if ($param) {
			$id = isset ( $param ['id'] ) ? $param ['id'] : 0;
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			$result = $fileSend->getFlowList ( $id );
			echo json_encode ( $result );
		}
	}
	/**
	 * 获取上传文件的url
	 */
	public function getUploadURL() {
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$ip=$this->getClientIp();
	 	$data["clientIP"] = $ip;
	 	$url = $proxy->getNewUploadUrl(json_encode($data));
		echo $url;
	}
	/**
	 * 上传文件存到数据库，此时没有挂接
	 */
	public function addNoLinkFile() {
		if (! isset ( $_POST ['floderid'] ))
			return;
		if (! isset ( $_POST ['files'] ))
			return;
		$floderid = $_POST ['floderid'];
		$files = $_POST ['files'];
		$folderService = $this->exec ( "getProxy", "folderservice" );
		echo $folderService->addNoLinkFile ( $floderid, json_encode ( $files ) );
	}
	/**
	 * 根据档案条目path获取文件一挂接的文件列表
	 *
	 * @author xuekun
	 */
	public function getLinkFiles() {
		if (! isset ( $_GET ['id'] ) || $_GET ['id'] == 0)
			return;
		$id = $_GET ['id'];
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$files = $proxy->getFileInfoByPath ( $id );
		$jsonData = array (
				'page' => 1,
				'total' => count ( $files ),
				'rows' => array () 
		);
		foreach ( $files as $i => $value ) {
			$file = $value->id;
			$file->createTime = date ( 'Y-m-d H:m:s', $file->createTime / 1000 );
			$entry = array (
					'id' => $file->originalId,
					'cell' => array_merge ( array (
							'num' => $i + 1,
							'ids' => '<input type="checkbox" name="id" fileRead="' . $file->fileRead . '" fileDown="' . $file->fileDown . '" filePrint="' . $file->filePrint . '">',
							'ywlj' => $file->folderPath . '/' . $file->estitle 
					), json_decode ( json_encode ( $file ), true ) ) 
			);
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	/**
	 * 删除挂接文件
	 * xuekun 2014年12月9日 add
	 */
	public function deleteLinkFiles() {
		$path = $_POST ['id'];
		$param = array();
		$param['ids'] = $_POST ['ids'];
		$param['treename'] = $_POST['treename'];
		$param['ywlj'] = $_POST['ywlj'];
		$proxy = $this->exec ( "getProxy", "folderservice" );
		echo $proxy->deleteFileInfo ( $path,json_encode ( $param ) );
	}
	/**
	 * 添加挂接文件
	 * xuekun 2014年12月9日 add
	 */
	public function linkFiles() {
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$upload = isset ( $_POST ['upload'] ) ? $_POST ['upload'] : false;
		$folderid = isset ( $_POST ['folderid'] ) ? $_POST ['folderid'] : 0;
		if (! isset ( $_POST ['id'] ))
			return;
		if (! isset ( $_POST ['files'] ))
			return;
		$id = $_POST ['id'];
		$files = $_POST ['files'];
	    $files[0]['userId'] = $userId;
		$files[0]['ip'] = $ip;
		$files[0]['treename'] = $_POST ['treename']; 
		$folderService = $this->exec ( "getProxy", "folderservice" );
		echo $folderService->addFile ( $id, $folderid, json_encode ( $files ), $upload );
	}
	/**
	 * 获取节点字段
	 * xuekun 2014年12月9日 add
	 */
	public function getMetaData() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : 0;
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$dataList = $proxy->getMetaData ( $stageId );
		echo json_encode ( $dataList );
	}
	/**
	 * xuekun 2014年12月9日 add
	 */
	public function getStageDataList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$stageId = isset ( $_POST ['query']['stageId'] ) ? $_POST ['query']['stageId'] : 0;
		$checkType = isset ( $_POST ['query']['checkType'] ) ?$_POST ['query']['checkType'] : 'checkbox';
		$ids=isset($_POST['query']['ids'])?$_POST['query']['ids']:'0';
		$deviceCode = null;
		if (isset ( $_POST ['query'] )) {
			$query = $_POST ['query'];
			if (isset ( $query ['deviceCode'] )) {
				$deviceCode = $query ['deviceCode'];
			}
		}
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$where = null;
		if ($query !== '') {
			if (isset ( $query ['condition'] )) {
				$where = $query ['condition'];
			}
		}
		$data = array (
				'deviceCode' => $deviceCode,
				'where' => $where 
		);
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$count = $proxy->getStageDataCount ( $stageId,$ids,json_encode ( $data ) );
		$list = $proxy->getStageDataList ( $page, $rp, $stageId,$ids,json_encode ( $data ) );
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array () 
		);
		$start = ($page - 1) * $rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $document ) {
				$document->num = $start + 1;
				$document->ids = "<input type=\"" . $checkType . "\" class=\"" . $checkType . "\"  name=\"checkname\" value=" . $document->id . " stageId=" . $document->stageId . " id=\"checkname\">";
				$document->operate = "<span class='editbtn' id=" . $document->id . "> </span>";
				$result ["rows"] [] = array (
						"id" => $document->id,
						"cell" => $document 
				);
				$start ++;
			}
		}
		
		echo json_encode ( $result );
	}
	/**
	 * 目录检查
	 * xuekun 2014年12月22日 add
	 *
	 * @return string
	 */
	public function stageDocument() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : 0;
		$stageName = isset ( $_POST ['stageName'] ) ? $_POST ['stageName'] : '';
		$deviceId = isset ( $_POST ['deviceId'] ) ? $_POST ['deviceId'] : 0;
		$deviceName = isset ( $_POST ['deviceName'] ) ? $_POST ['deviceName'] : '0';
		$formData = $this->getForm ( $stageId );
		$stageCode = $this->getStageCode ( $stageId );
		$uid = $this->getUser ()->getId ();
		$userInfo = $this->exec ( "getProxy", "user" )->getUserInfo ( $uid );
		$data = array (
				'formData' => $formData,
				'stageId' => $stageId,
				'stageCode' => $stageCode,
				'stageName' => $stageName,
				'person_' => $userInfo->lastName . $userInfo->firstName
		);
		if ($deviceId != 0) {
			$deviceCode = $this->getDeviceCode ( $deviceId );
			$data ['deviceCode'] = $deviceCode;
			$data ['deviceName'] = $deviceName;
		}else {
			$data ['deviceCode'] = "0";
			$data ['deviceName'] = "0";
		}
		return $this->renderTemplate ( $data, 'ESDocumentsCollection/stageDocument' );
	}
	/**
	 * 判断是否存在文件编码规则
	 */
	public function judegeIsExitesDocnoRule() {
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : 0;
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$rules = $proxy->getDocRuleTteration ( $stageId );
		echo $rules;
		/* if ($rules == '') {
			echo 'false';
		} else {
			echo 'true';
		} */
	}
	public function printReport() {
		$code = isset ( $_POST ['code'] ) ? $_POST ['code'] : 0;
		$treetype = isset ( $_POST ['treetype'] ) ? $_POST ['treetype'] : '1';
		$type = 'deviceCode';
		if ($treetype == 1) {
			$type = 'stageCode';
		} else if ($treetype == 2) {
			$type = 'participatoryCode';
		}
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$reportId = isset ( $_POST ['reportId'] ) ? $_POST ['reportId'] : '';
		$where = null;
		if ($query !== '') {
			if (isset ( $query ['condition'] )) {
				$where = $query ['condition'];
			}
		}
		$data = array (
				$type => $code,
				'reportId' => $reportId,
				'where' => $where 
		);
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$result = $proxy->printReport ( json_encode ( $data ) );
		echo $result;
	}
	
	// ---------------导入导出功能模块--------------------
	/**
	 * 导出
	 */
	public function export() {
		$display = $_GET ['display'] == 'block' ? true : false; // 是否显示筛选面板
		$treenodeid = intval ( isset ( $_GET ['treenodeid'] ) ? $_GET ['treenodeid'] : 0 );
		$treecode = intval ( isset ( $_GET ['treeCode'] ) ? $_GET ['treeCode'] : 0 );
		$treetype = intval ( isset ( $_GET ['treetype'] ) ? $_GET ['treetype'] : 0 );
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$param = array ();
		$param ["treenodeid"] = $treenodeid;
		$param ["treetype"] = $treetype;
		$param ["treecode"] = $treecode;
		
		$fields = $proxy->getFieldsByTreetype ( json_encode ( $param ) );
		return $this->renderTemplate ( array (
				'display' => $display,
				'searchField' => $fields 
		) );
	}
	// 勾选数据后导出
	public function ExportSelData() {
		$treenodeid = $_POST ['treenodeid'];
		$exportType = $_POST ['exportType'];
		$treename= $_POST ['treename'];
		// 导出增加电子文件
		$resource = $_POST ['resource'];
		$ids = $_POST ['ids'];
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$param = array (
				'ip' => $ip,
				'userId' => $userId,
				'treenodeid' => $treenodeid,
				'treename' => $treename,
				'exportType' => $exportType,
				'resource' => $resource,
				'ids' => $ids 
		);
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$result = $proxy->exportSelData ( json_encode ( $param ) );
		if ($result->msg == "success") {
			$url = $result->path;
			$fileName = basename ( $url ); // 获取下载文件的名称
			$pos = strrpos ( $fileName, '.' );
			$key = substr ( $fileName, 0, $pos ); // 去除文件后缀，作为缓存的KEY
			$cache = $this->exec ( 'getProxy', 'escloud_cachews' );
			$md5Key = md5 ( $key );
			$cache->setCache ( $md5Key, json_encode ( $url ) );
			
			echo $md5Key;
		} else if ($result->msg) { // 无数据
			echo $result->msg;
		} else { // 错误
			echo 'error';
		}
	}
	public function exportFilterData() {
		$treenodeid = $_POST ['treenodeid'];
		$treename = $_POST ['treename'];
		$exportType = $_POST ['exportType'];
		$treetype = $_POST ['treetype'];
		$treecode = $_POST ['treecode'];
		$condition = $_POST ['condition'];
		// 导出增加电子文件
		$resource = $_POST ['resource'];
		// $ids = $_POST['ids'];
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$param = array (
				'ip' => $ip,
				'userId' => $userId,
				'treenodeid' => $treenodeid,
				'exportType' => $exportType,
				'treetype' => $treetype,
				'treecode' => $treecode,
				'treename' => $treename,
				'resource' => $resource,
				'condition' => $condition 
		);
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$result = $proxy->exportFilterData ( json_encode ( $param ) );
		if ($result->msg == "success") {
			$url = $result->path;
			$fileName = basename ( $url ); // 获取下载文件的名称
			$pos = strrpos ( $fileName, '.' );
			$key = substr ( $fileName, 0, $pos ); // 去除文件后缀，作为缓存的KEY
			$cache = $this->exec ( 'getProxy', 'escloud_cachews' );
			$md5Key = md5 ( $key );
			$cache->setCache ( $md5Key, json_encode ( $url ) );
			
			echo $md5Key;
		} else if ($result->msg) { // 无数据
			echo $result->msg;
		} else { // 错误
			echo 'error';
		}
	}
	
	// 下载导出文件
	public function edownload() {
		$date = date ( 'Y年m月d日H时i分s秒' );
		$url = $_GET ['url'];
		header ( "Content-type: application/octet-stream" );
		header ( "Content-Disposition: attatchment; filename=" . $date . ".xls" );
		readfile ( $url );
	}
	/**
	 * 导入
	 */
	public function import() {
		$proxy = $this->exec ( 'getProxy', 'escloud_fileoperationws' );
		$serviceIp = $proxy->getServiceIP ();
		return $this->renderTemplate ( array (
				'serviceIp' => $serviceIp 
		) );
	}
	
	/**
	 * 得到当前结构下的所有子结构的相关信息
	 */
	public function importStep1() {
		$treecode = $_GET ["treecode"];
		$treename = $_GET ["treename"];
		$treenodeid = $_GET ["treenodeid"];
		$treetype = $_GET ["treetype"];
		// 4/4@_/@5
		$path = $treetype .'-' .$treenodeid . '-' . $treecode.'-' .$treename;
		$data = array (
				'title' => $treename,
				'path' => $path 
		);
		// $proxy=$this->exec('getProxy','documentsCollection');
		// $data=$proxy->getChirldStructure($nodePath);
		$userid = $this->getUser ()->getId ();
		return $this->renderTemplate ( array (
				'data' => $data,
				'userId' => $userid 
		) );
	}
	/**
	 * 返回导入设置对应界面
	 */
	public function importSetting() {
		$userid = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$data = $proxy->getImportStructures ( $userid );
		return $this->renderTemplate ( array (
				"data" => $data 
		) );
	}
	
	/**
	 * 获取导入上传服务rest地址
	 */
	public function getImportUrl() {
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$data = $proxy->getImportUrl ();
		echo $data;
	}
	/**
	 * 获取文件头信息
	 */
	public function showFileColumn() {
		$path = $_POST ['query'] ['condition'];
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$map = json_encode ( array (
				"path" => $path,
				"userId" => $userId 
		) );
		$data = $proxy->showFileColumn ( $map );
		$total = $data->total;
		$jsonData = array (
				'total' => $total,
				'rows' => array () 
		);
		foreach ( $data->column as $list ) {
			$entry = array (
					'cell' => array (
							'sourceField' => $list->sourceField,
							'type' => $list->type,
							'maxLength' => $list->maxLength,
							'minLength' => $list->minLength,
							'isnull' => $list->isnull 
					) 
			);
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 * 获取结构信息
	 */
	public function showStructureColumn() {
		$path = $_POST ['query'] ['condition'];
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$map = json_encode ( array (
				"path" => $path 
		) );
		$data = $proxy->showStructureColumn ( $map );
		$total = $data->total;
		$jsonData = array (
				'total' => $total,
				'rows' => array () 
		);
		foreach ( $data->list as $list ) {
			$entry = array (
					'cell' => array (
							'targetField' => $list->name,
							'type' => $list->type,
							'length' => $list->length,
							'isnull' => $list->isNull = 0 ? '否' : '是' 
					) 
			);
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 * 获取文件列模型
	 */
	public function getFileColumnModel() {
		$path = isset ( $_GET ["path"] ) ? $_GET ["path"] : "";
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$map = json_encode ( array (
				"path" => $path,
				"userId" => $userId 
		) );
		$data = $proxy->getFileColumnModel ( $map );
		echo json_encode ( $data );
	}
	
	/**
	 * 获取文件前20条数据，提供预览
	 */
	public function getPreFileData() {
		$path = $_POST ['query'] ['condition'];
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$map = json_encode ( array (
				"path" => $path,
				"userId" => $userId 
		) );
		$data = $proxy->getPreFileData ( $map );
		$column = $proxy->getFileColumnModel ( $map );
		$rows = json_decode ( json_encode ( $data ), true );
		$total = isset ( $rows ['total'] ) ? $rows ['total'] : 0;
		$jsonData = array (
				'total' => $total,
				'rows' => array () 
		);
		if (! $total) {
			echo json_encode ( $jsonData );
			return;
		}
		foreach ( $rows ['list'] as $row ) {
			$entry = array (
					'cell' => array () 
			);
			for($j = 0; $j < count ( $column ); $j ++) {
				if (array_key_exists ( $column [$j]->name, $row )) {
					$entry ['cell'] [$column [$j]->name] = $row [$column [$j]->name];
				}
			}
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 * 向数据库写入导入数据
	 */
	public function realImport() {
		$mData = $_POST ['mData'];
		$path = $_POST ['path'];
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$data = $proxy->realImport ( $userId, json_encode ( array (
				'data' => $mData,
				'ip' => $ip,
				'userId' => $userId,
				'path' => $path 
		) ) );
		echo json_encode ( $data );
	}
	/**
	 *
	 * @author wangtao
	 *         电子文件显示
	 */
	public function file_view() {
		$tempReadRight = isset ( $_GET ['tempReadRight'] ) ? $_GET ['tempReadRight'] : 'false';
		$tempPrintRight = isset ( $_GET ['tempPrintRight'] ) ? $_GET ['tempPrintRight'] : 'false';
		$tempDownloadRight = isset ( $_GET ['tempDownloadRight'] ) ? $_GET ['tempDownloadRight'] : 'false';
		$rightIds=isset($_GET['rightIds'])?$_GET['rightIds']:'';
		$request = $this->getRequest ();
		$id = $request->getGet ( 'id' );
		$stageId = $request->getGet ( 'stageId' );
		if (empty ( $id )) {
			echo 'idErr';
		}
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$userId = $this->getUser ()->getId ();
		$paramIn = array (
				'userId' => $userId,
				'id' => $id,
				'stageId' => $stageId,
				'tempReadRight' => $tempReadRight,
				'tempPrintRight' => $tempPrintRight,
				'tempDownloadRight' => $tempDownloadRight,
				'rightIds'=>$rightIds 
		);
		$paramInfo = json_encode ( $paramIn );
		$filesInfo = $proxy->getDataInfoWhenOnlineView ( $paramInfo );
		$title = $filesInfo->titleInfo;
		$formData = $filesInfo->dataInfo;
		$data = json_decode ( json_encode ( $formData ), true );
		$files = $filesInfo->esFileInfo;
		$index = $filesInfo->index;
		$fileId = false;
		if (isset ( $_GET ['fileId'] ) && $_GET ['fileId']) {
			$fileId = $_GET ['fileId'];
		}
		if (count ( $files )) {
			$newViewFiles = array ();
			foreach ( $files as $i => $value ) {
				$files [$i] = $value->id;
				if ($fileId && $files [$i]->originalId === $fileId) {
					$index = $i;
				}
			}
			$_SESSION ['newViewFiles'] = $newViewFiles;
		}
		return $this->renderTemplate ( array (
				'formData' => $data,
				'id' => $id,
				'title' => $title,
				'files' => $files,
				'index' => $index 
		) );
	}
	
	
	/** lujixiang 20150402 页面详情显示**/
	public function showData(){
		$stageId = isset($_POST['stageId'])?$_POST['stageId']:'';
		$dataId = isset($_POST['dataId'])?$_POST['dataId']:'';
		$data['stageId'] = $stageId;
		$data['dataId'] = $dataId;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "documentsCollection");
		$return = $proxy->collectionDataShowPkg($postData);
		$datas = array("data"=>array($return->formHtml));
		return $this->renderTemplate($datas);
	}
	
	/** lujixiang 20150410  查看电子文件浏览权限 **/
	public function getFileViewRight(){
		
		$dataId = isset($_POST['dataId'])?$_POST['dataId']:'';
		$proxy = $this->exec("getProxy", "documentsCollection");
		$return = $proxy->getFileViewRight($dataId);
		echo json_encode ( $return );
	}
	
	/**
	 * 获取文件编码
	 */
	public function getFileCode() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$tagIds = isset ( $_POST ['tagIds'] ) ? $_POST ['tagIds'] : '';
		//$data = isset ( $_POST ['postData'] ) ? $_POST ['postData'] : '';
		$param = array(
				'stageId'=>$stageId,
				'tagIds'=>$tagIds
		);
		$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
		$res = $proxy->getFileCode ( json_encode ( $param ) );
		echo json_encode ( $res );
	}
	
	/**
	 * 判断文件编码是否重复，重置编码流水号
	 */
	public function judegIsRepeatBydocNoRule() {
		$docNoRule = isset ( $_POST ['docNoRule'] ) ? $_POST ['docNoRule'] : '';
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		if($docNoRule!='' && $stageId!=''){
			$param = array(
					'docNoRule'=>$docNoRule,
					'stageId'=>$stageId
			);
			$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
			echo $res = $proxy->judegIsRepeatBydocNoRule ( json_encode ( $param ) );
		}else{
			echo "false";
		}
	}
	
	/**
	 * rongying 20150508
	 * 根据stageId获取系统字段,跳转至筛选页面
	 */
	public function filter(){
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : 0;
		$proxy = $this->exec ( "getProxy", "documentsCollection" );
		$list = $proxy->getMetaDataField ( $stageId );
		$result = array();
		foreach ($list as $key => $value){
			$filed['code'] = $value->code;
			$filed['name'] = $value->name;
			$filed['type'] = $value->type;
			array_push($result, $filed);
		}
		return $this->renderTemplate ( array (
				'dataList' => $result
		) );
	}
	
	/**
	 * 判断手动输入的类型代码，及专业代码
	 */
	public function checkInputCode() {
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		$name = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		$pId = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		if($type!='' && $name!=''){
			$param = array(
					'type'=>$type,
					'name'=>$name,
					'pId'=>$pId
			);
			$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
			echo $res = $proxy->checkInputCode ( json_encode ( $param ) );
		}else{
			echo "false";
		}
	}
	/**
	 * 根据部门代码获取id
	 */
    public function getPartIdByCode() {
		$partCode = isset ( $_POST ['partCode'] ) ? $_POST ['partCode'] : '';
		if($partCode!=''){
			$param = array(
					'partCode'=>$partCode
			);
			$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
			echo $res = $proxy->getPartIdByCode ( json_encode ( $param ) );
		}else{
			echo "false";
		}
	}
	/**
	 * 检查删除文件是否在文件发送当中
	 */
    public function checkDataIsSend() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
			$param = array(
					'ids'=>$ids
					);
			$proxy = $this->exec ( 'getProxy', 'documentsCollection' );
			echo $res = $proxy->checkDataIsSend ( json_encode ( $param ) );
		
	}
	
	public function report(){
		$display = isset ( $_GET ['display'] ) ? $_GET ['display'] : '';
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : 0;
		if($display == 'black'){
			$proxy = $this->exec ( "getProxy", "documentsCollection" );
			$list = $proxy->getMetaDataField ( $stageId );
			$result = array();
			foreach ($list as $key => $value){
				$filed['code'] = $value->code;
				$filed['name'] = $value->name;
				$filed['type'] = $value->type;
				array_push($result, $filed);
			}
			return $this->renderTemplate ( array (
					'dataList' => $result
			) );
		}else{
			return $this->renderTemplate ();
		}
	}
	
	/**
	 * 通过文件id获取收集节点Id，pId
	 */
	public function getStageIdsByDocId(){
		$docId=isset($_POST['docId'])?$_POST['docId']:'';
		if($docId!=''){
			$proxy = $this->exec ( "getProxy", "documentsCollection" );
			echo $proxy->getStageIdsByDocId($docId);
		}
	}
}
