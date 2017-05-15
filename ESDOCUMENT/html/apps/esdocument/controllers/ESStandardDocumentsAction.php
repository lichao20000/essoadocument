<?php
/**
 * 标准文件模块
 * @author dengguoqi
 *
 */
class ESStandardDocumentsAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	public function findDocumentsList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$standardProxy = $this->exec ( "getProxy", 'standarddocument' );
		$condition ['page'] = ($page - 1) * $rp;
		$condition ['pre'] = $rp;
		$total = $standardProxy->getCount ();
		$rows = $standardProxy->getList ( json_encode ( $condition ) );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$startNum = ($page - 1) * $rp + 1;
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $startNum,
							"ids" => "<input type=\"checkbox\" class=\"checkbox\" name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
							"operate" => "<span class='editbtn' relation> </span>",
							"id" => $row->id,
							"no" => $row->no,
							"chineseName" => $row->chineseName,
							"description" => $row->description,
							"regulation_id" => $row->regulation_id,
							"regulation_name" => $row->regulation_name 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	// 弹出添加框
	public function add() {
		return $this->renderTemplate ();
	}
	// 去添加数据
	public function toAdd() {
		parse_str ( $_POST ['data'], $data );
		$ip = $this->getClientIp();
		$userId = $this->getUser()->getId();
		$data['ip']=$ip;
		$data['userId']=$userId;
		$Proxy = $this->exec ( "getProxy", 'standarddocument' );
		$result = $Proxy->add ( json_encode ( $data ) );
		echo $result;
	}
	// 编辑数据将页面
	public function edit() {
		
		$id = $_POST ['id'];
		$Proxy = $this->exec ( "getProxy", 'standarddocument' );
		$data = $Proxy->getStandardById ( $id );
		return $this->renderTemplate ( ( array ) $data );
	}
	// 执行编辑数据
	public function toEdit() {
		parse_str ( $_POST ['data'], $data );
		$ip = $this->getClientIp();
		$userId = $this->getUser()->getId();
		$data['ip']=$ip;
		$data['userId']=$userId;
		$Proxy = $this->exec ( "getProxy", 'standarddocument' );
		$result = $Proxy->edit ( json_encode ( $data ) );
		echo $result;
	}
	// 删除数据
	public function delete() {
		$idStr = $_POST ['idStr'];
		$idArr = explode ( ',', $idStr );
		$Proxy = $this->exec ( "getProxy", 'standarddocument' );
		$result = $Proxy->del ( json_encode ( $idArr ) );
		echo $result;
	}
	public function filter() {
		return $this->renderTemplate ();
	}
	// 根据过滤条件查询数据
	public function getStandardByCondition() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$param ['page'] = ($page - 1) * $rp;
		$param ['pre'] = $rp;
		$param ['condition'] = isset ( $_POST ['query'] ['condition'] ) ? $_POST ['query'] ['condition'] : null;
		$Proxy = $this->exec ( "getProxy", 'standarddocument' );
		$rows = $Proxy->getStandardByCondition ( json_encode ( $param ) );
		$total = $Proxy->getCountByCondition ( json_encode ( $param ) );
		
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$startNum = ($page - 1) * $rp + 1;
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $startNum,
							"ids" => "<input type=\"checkbox\" class=\"checkbox\" name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
							"operate" => "<span class='editbtn' relation> </span>",
							"id" => $row->id,
							"no" => $row->no,
							"chineseName" => $row->chineseName,
							"description" => $row->description,
							"regulation_id" => $row->regulation_id,
							"regulation_name" => $row->regulation_name 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	// 删除文件
	public  function deleteFile()
	{
		$filePath = $_POST ['filePath'];
		$id = isset($_POST ['id']) ? $_POST ['id'] : null;
		// 根路径
		$rootDir = dirname ( dirname ( dirname ( __DIR__ ) ) );
		$param['filePath'] = $filePath;
		$param['id'] = $id;
		$param['rootDir'] = $rootDir;
		$Proxy = $this->exec ( "getProxy", 'standarddocument' );
		$result = $Proxy->deleteFile(json_encode($param));
		echo $result;
	}
	
	/**
	 * 验证编号唯一性
	 */
	public function uniqueNo() {
		$standardDocumentNo = isset ( $_POST ['standardDocumentNo'] ) ? $_POST ['standardDocumentNo'] : '';
		if ($standardDocumentNo != '') {
			$proxy= $this->exec ( "getProxy", 'standarddocument' );
			echo $proxy->uniqueNo ( $standardDocumentNo );
		}
	}
}
