<?php
/**
 * 规定规范模块
 * @author xiewenda
 *
 */
class ESRegulationsAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	public function findRegulationList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$regulationProxy = $this->exec ( "getProxy", 'regulation' );
		$condition ['page'] = ($page - 1) * $rp;
		$condition ['pre'] = $rp;
		$total = $regulationProxy->getCount ();
		$rows = $regulationProxy->findRegulationList ( json_encode ( $condition ) );
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
							"ids" => "<input type=\"checkbox\" class=\"checkbox\" isSystem=\"1\" name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
							"operate" => "<span class='editbtn'> </span>",
							"id" => $row->id,
							"no" => $row->no,
							"chineseName" => $row->chineseName,
							"englishName" => $row->englishName,
							"publishTime" => $row->publishTime 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	public function findRegulationList1() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$regulationProxy = $this->exec ( "getProxy", 'regulation' );
		$condition ['page'] = ($page - 1) * $rp;
		$condition ['pre'] = $rp;
		$total = $regulationProxy->getCount ();
		$data = $regulationProxy->findRegulationList ( json_encode ( $condition ) );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$startNum = ($page - 1) * $rp + 1;
		foreach ( $data as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $startNum,
							"ids" => "<input type=\"radio\" name=\"radio\" class=\"changeId\">",
							"id" => $row->id,
							"no" => $row->no,
							"chineseName" => $row->chineseName,
							"englishName" => $row->englishName,
							"publishTime" => $row->publishTime 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	// 跳转到添加页面
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
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$result = $Proxy->add ( json_encode ( $data ) );
		echo $result;
	}
	// 编辑数据将页面
	public function edit() {
		
		$id = $_POST ['id'];
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$data = $Proxy->getRegulationById ( $id );
		return $this->renderTemplate ( ( array ) $data );
	}
	// 执行编辑数据
	public function toEdit() {
		parse_str ( $_POST ['data'], $data );
		$ip = $this->getClientIp();
		$userId = $this->getUser()->getId();
		$data['ip']=$ip;
		$data['userId']=$userId;
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$result = $Proxy->edit ( json_encode ( $data ) );
		echo $result;
	}
	public function delete() {
		$idStr = $_POST ['idStr'];
		$idArr = explode ( ',', $idStr );
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$result = $Proxy->del ( json_encode ( $idArr ) );
		echo $result;
	}
	// 显示过滤的页面
	public function filter() {
		return $this->renderTemplate ();
	}
	// 通过过滤条件查询数据
	public function getRegulationByCondition() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$param ['page'] = ($page - 1) * $rp;
		$param ['pre'] = $rp;
		$param ['condition'] = isset ( $_POST ['query'] ['condition'] ) ? $_POST ['query'] ['condition'] : null;
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$rows = $Proxy->getRegulationByCondition ( json_encode ( $param ) );
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
							"ids" => "<input type=\"checkbox\" class=\"checkbox\"  name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
							"operate" => "<span class='editbtn'> </span>",
							"id" => $row->id,
							"no" => $row->no,
							"chineseName" => $row->chineseName,
							"englishName" => $row->englishName,
							"publishTime" => $row->publishTime 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	// 根据搜索条件查询数据
	public function getRegulationQuery() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$param ['page'] = ($page - 1) * $rp;
		$param ['pre'] = $rp;
		$param ['searchValue'] = isset ( $_POST ['query'] ['searchValue'] ) ? $_POST ['query'] ['searchValue'] : null;
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$total = $Proxy->getCountBySearch ( json_encode ( $param ) );
		$rows = $Proxy->getRegulationQuery ( json_encode ( $param ) );
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
							"ids" => "<input type=\"radio\" name=\"radio\" class=\"changeId\">",
							"id" => $row->id,
							"no" => $row->no,
							"chineseName" => $row->chineseName,
							"englishName" => $row->englishName,
							"publishTime" => $row->publishTime 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	// 上传文件
	public function upload() {
		$res = $this->uploadFile ();
		echo json_encode ( $res );
	}
	// 下载文件
	public function download() {
		// 根路径
		$rootDir = dirname ( dirname ( dirname ( __DIR__ ) ) );
		$filePath = $_POST ['filePath'];
		$fileName = $_POST ['fileName'];
		// 将路径中的/尽行转换否则get请求参数会出错
		$rootDir = str_replace ( "\\", "-", $rootDir );
		$filePath = str_replace ( "/", "-", $filePath );
		$proxy = $this->exec ( "getProxy", 'regulation' );
		$url = $proxy->getServiceIP();
		$url = $url.'/download/' . $rootDir . '/' . $filePath . '/' . $fileName;
		echo $url;
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
		$Proxy = $this->exec ( "getProxy", 'regulation' );
		$result = $Proxy->deleteFile(json_encode($param));
		echo $result;
	}
	
	
	/**
	 * 获取上传文件的url
	 */
	public function getUploadURL() {
		// $proxy = $this->exec('getProxy','escloud_businesseditws');
		$url = 'D:/data/20141020';
		echo $url;
	}
	
	/**
	 * 验证编号唯一性
	 */
	public function uniqueNo() {
		$regulationNo = isset ( $_POST ['regulationNo'] ) ? $_POST ['regulationNo'] : '';
		if ($regulationNo != '') {
			$proxy= $this->exec ( "getProxy", 'regulation' );
			echo $proxy->uniqueNo ( $regulationNo );
		}
	}
}
