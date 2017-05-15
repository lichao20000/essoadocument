<?php
/**
 * 文件收集范围模块
 * @author xuekun
 *
 */
class ESDocumentStageAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	
	// 生成分类树
	public function getTree() {
		$isnode = isset ( $_GET ['isnode'] ) ? $_GET ['isnode'] : - 1;
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : 0;
		$proxy = $this->exec ( "getProxy", "documentStage" );
		$tree = $proxy->getTree ( $isnode, $id );
		if (count ( $tree ) > 0) {
			$tree [0]->open = true;
		}
		echo json_encode ( $tree );
	}
	
	// 获取文件收集范围列表
	public function findStageList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$pId = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$where = null;
		if ($query !== '') {
			if (isset ( $query ['condition'] )) {
				$where = $query ['condition'];
			}
		}
		
		$data = array (
				'pId' => $pId,
				'where' => $where 
		);
		$proxy = $this->exec ( "getProxy", "documentStage" );
		$count = $proxy->getCount ( json_encode ( array (
				'pId' => $pId,
				'where' => $where 
		) ) );
		$list = $proxy->getDataList ( $page, $rp, json_encode ( $data ) );
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array () 
		);
		$start = ($page - 1) * $rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $Stage ) {
				$Stage->num = $start + 1;
				$Stage->ids = "<input type=\"checkbox\" class=\"checkbox\"  name=\"checkName\" value=" . $Stage->id . " id=\"checkName\">";
				$Stage->operate = "<span class='editbtn' id=" . $Stage->id . "> </span>";
				switch ($Stage->paperWay) {
					case 1 :
						$Stage->paperWay = '单项工程';
						break;
					case 2 :
						$Stage->paperWay = '整体项目';
						break;
					default :
						$Stage->paperWay = '';
				}
				$result ["rows"] [] = array (
						"id" => $Stage->id,
						"cell" => $Stage 
				);
				$start ++;
			}
		}
		
		echo json_encode ( $result );
	}
	/**
	 * 添加文件收集范围
	 */
	public function addStage() {
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if ($param) {
			$pId = isset ( $param ['pId'] ) ? $param ['pId'] : '';
			$level = isset ( $param ['level'] ) ? $param ['level'] : '';
			$name = isset ( $param ['name'] ) ? $param ['name'] : '';
			$code = isset ( $param ['code'] ) ? $param ['code'] : '';
			$period = isset ( $param ['period'] ) ? $param ['period'] : '';
			$id_seq = isset ( $param ['id_seq'] ) ? $param ['id_seq'] : '';
			$isnode = isset ( $param ['isnode'] ) ? $param ['isnode'] : '';
			$tagids = isset ( $param ['tagids'] ) ? $param ['tagids'] : '';
			$paperWay = isset ( $param ['paperWay'] ) ? $param ['paperWay'] : '0';
			if ($name != '' && $pId != '' && $level != '' && $id_seq != '' && $isnode != '') {
				$proxy = $this->exec ( "getProxy", "documentStage" );
				$stage = array (
						'ip'=>$ip,
						'userId'=>$userId,
						'pId' => $pId,
						'level' => $level,
						'name' => $name,
						'code' => $code,
						'period' => $period,
						'id_seq' => $id_seq,
						'isnode' => $isnode,
						'tagids' => $tagids,
						'paperWay' => $paperWay 
				);
				if ($paperWay != '') {
					$stage ['paperWay'] = $paperWay;
				}
				$result = $proxy->addData ( json_encode ( $stage ) );
			}
			echo json_encode ( $result );
		}
	}
	/**
	 * 删除文件收集范围
	 */
	public function deleteStage() {
		$param = $_POST;
		if ($param) {
			$ids = isset ( $param ['ids'] ) ? $param ['ids'] : '';
			$flag = false;
			if ($ids != '') {
				$proxy = $this->exec ( "getProxy", "documentStage" );
				$flag = $proxy->deleteData ( json_encode ( explode ( ',', $ids ) ) );
			}
			echo json_encode ( $flag );
		}
	}
	/**
	 * 编辑文件收集范围
	 */
	public function edit() {
		if (isset ( $_POST ['id'] )) {
			$proxy = $this->exec ( "getProxy", "documentStage" );
			$id = $_POST ['id'];
			$Stage = ( array ) $proxy->getData ( $id );
			return $this->renderTemplate ( $Stage );
		}
	}
	/**
	 * 更新文件收集范围
	 */
	public function updateStage() {
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if (isset ( $param ['id'] )) {
			$pId = isset ( $param ['pId'] ) ? $param ['pId'] : '';
			$level = isset ( $param ['level'] ) ? $param ['level'] : '';
			$name = isset ( $param ['name'] ) ? $param ['name'] : '';
			$code = isset ( $param ['code'] ) ? $param ['code'] : '';
			$period = isset ( $param ['period'] ) ? $param ['period'] : '';
			$id_seq = isset ( $param ['id_seq'] ) ? $param ['id_seq'] : '';
			$isnode = isset ( $param ['isnode'] ) ? $param ['isnode'] : '';
			$tagids = isset ( $param ['tagids'] ) ? $param ['tagids'] : '';
			$paperWay = isset ( $param ['paperWay'] ) ? $param ['paperWay'] : '0';
			if ($name != '' && $pId != '' && $level != '' && $id_seq != '' && $isnode != '') {
				$proxy = $this->exec ( "getProxy", "documentStage" );
				$stage = array (
						'ip'=>$ip,
						'userId'=>$userId,
						'id' => $param ['id'],
						'pId' => $pId,
						'level' => $level,
						'name' => $name,
						'code' => $code,
						'period' => $period,
						'id_seq' => $id_seq,
						'isnode' => $isnode,
						'tagids' => $tagids 
				);
				if ($paperWay != '') {
					$stage ['paperWay'] = $paperWay;
				}
				$flag = $proxy->updateData ( json_encode ( $stage ) );
				echo $flag;
			}
		}
	}
	
	// ---------------导入导出--------------------
	/**
	 * 导出
	 */
	public function export() {
		 $display= $_GET ['display'] == 'block' ? true : false; // 是否显示筛选面板	
		 $searchField = array();
		if($display){
			$table = $_GET ['dataTable'];
			if($table=="ess_document_stage"){
			$searchField['name'] = '名称';
			$searchField['code'] = '分类代码';
			$searchField['period'] = '保管期限';
			}else if($table=="ess_document_type"){
				$searchField['typeName'] = '文件类型名称';
				$searchField['typeNo'] = '文档类型代码';
			}else if($table == "ess_engineering"){
				$searchField['typeName'] = '文件专业名称';
				$searchField['typeNo'] = '文档专业代码';
			} 
		}
		return $this->renderTemplate ( array ('display' => $display,'searchField'=>$searchField) ); 
	}
	// 勾选数据后导出
	public function ExportSelData()
	{
		$treenodeid = $_POST['treenodeid'];
		$treename = $_POST['treename'];
		$exportType = $_POST['exportType'];
		//导出增加电子文件
		$resource = $_POST['resource'];
		$dataTable = $_POST['dataTable'];
		$ids = $_POST['ids'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'treenodeid'=>$treenodeid,
				'treename'=>$treename,
				'exportType'=>$exportType,
				'dataTable'=>$dataTable,
				'ids'=>$ids
		);
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
		$result = $proxy->exportSelData ( json_encode ( $param ) );
		if ($result->msg=="success") {
			$url = $result->path;
			$fileName = basename ( $url ); // 获取下载文件的名称
			$pos = strrpos ( $fileName, '.' );
			$key = substr ( $fileName, 0, $pos ); // 去除文件后缀，作为缓存的KEY
			$cache = $this->exec ( 'getProxy', 'escloud_cachews' );
			$md5Key = md5 ( $key );
			$cache->setCache ( $md5Key, json_encode ( $url ) );
			echo $md5Key;
		} else if($result->msg) { // 无数据
			echo $result->msg;
		}else{
			echo 'error';
		} 
	
		// }
	}
	public function exportFilterData(){
		$treenodeid = $_POST['treenodeid'];
		$treename = $_POST['treename'];
		$exportType = $_POST['exportType'];
		$condition = $_POST['condition'];
		$dataTable = $_POST['dataTable'];
		//导出增加电子文件
		$resource = $_POST['resource'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'treenodeid'=>$treenodeid,
				'treename'=>$treename,
				'exportType'=>$exportType,
				'resource'=>$resource,
				'where'=>$condition,
				'dataTable'=>$dataTable
		);
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
		$result = $proxy->exportFilterData ( json_encode ( $param ) );
		if ($result->msg=="success") {
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
	 * 得到当前结构下的所有子结构的相关信息
	 */
	public function importStep1() {
		$treecode = $_GET ["treecode"];
		$treenodeid = $_GET ["treenodeid"];
		$treename = $_GET ["treename"];
		$treetype = $_GET ["treetype"];  
		$path = $treenodeid . '-' . $treecode. '-' .$treename. '-' . $treetype;
		$data = array (
				'title' => $treename,
				'path' => $path
		);
		$userid = $this->getUser ()->getId ();
		return $this->renderTemplate ( array ('data' => $data,'userId' => $userid) );
	}
	/**
	 *返回导入设置对应界面
	 */
	public function importSetting() {
		$userid = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
		$data = $proxy->getImportStructures ( $userid );
		return $this->renderTemplate (array ("data" => $data));
	}
	
	/**
	 * 获取导入上传服务rest地址
	 */
	public function getImportUrl() {
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
		$data = $proxy->getImportUrl ();
		echo $data;
	}
	/**
	 * 获取文件头信息
	 */
	public function showFileColumn() {
		$path = $_POST ['query'] ['condition'];
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
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
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
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
							'isnull' => $list->isNull
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
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
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
		$proxy = $this->exec ( 'getProxy', 'documentStage' );
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
	public function realImport(){
		$mData = $_POST['mData'];
		$path=$_POST['path'];
		$userId = $this->getUser()->getId();
		$ip=$this->getClientIp();
		$proxy=$this->exec('getProxy','documentStage');
		$data=$proxy->realImport($userId,json_encode(array('data'=>$mData,'ip'=>$ip,'userId'=>$userId,'path'=>$path)));
		echo json_encode($data);
	}
	
	/**
	 * 验证收集范围代码唯一性
	 */
	public function uniqueCode() {
		$code = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		if ($code != '') {
			$part = $this->exec ( "getProxy", 'documentStage' );
			echo $part->uniqueCode ( $code );
		}
	}
	
	
	/**
	 * 验证收集范围名称唯一性
	 */
	public function uniqueName() {
		$name = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		$pId = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$level = isset ( $_POST ['level'] ) ? $_POST ['level'] : '';
		if ($name != '' && $pId != '' && $level != '') {
			$part = $this->exec ( "getProxy", 'documentStage' );
			echo $part->uniqueName ( array (
					'name' => $name,
					'pId' => $pId,
					'level' => $level 
			) );
		}
	}
}
