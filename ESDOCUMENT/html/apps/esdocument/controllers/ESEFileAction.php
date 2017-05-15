<?php
/**
 * 
 * @author xuekun
 *
 */
class ESEFileAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$lists = $proxy->getlist ();
		return $this->renderTemplate ( array (
				'list' => $lists,
				'status' => 1 
		) );
	}
	public function access() {
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$id = isset ( $_POST ['param'] ) ? $_POST ['param'] : 0;
		$lists = $proxy->getlist ( $id );
		foreach ( $lists as $node ) {
			$node->iconSkin = 'folder';
		}
		echo json_encode ( $lists );
	}
	/**
	 * 根据parentid获得上一级信息
	 * xuekun 2014年12月3日
	 */
	public function getup() {
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$id = $_POST ['param'];
		$now = $proxy->getNowFolder ( $id );
		$pid = $now->parentid;
		$lists = $proxy->getlist ( $pid ); // liqiubo 20140618 加入saas支持
		if ($lists == null) {
			echo json_encode ( '0' );
			return;
		}
		echo json_encode ( $lists );
	}
	/**
	 * 添加虚拟目录
	 * xuekun 2014年12月3日
	 */
	public function do_add() {
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$data = $_POST ['data'];
		$id = $_POST ['id'];
		$esViewTitle = $_POST ['esViewTitle'];
		parse_str ( $data, $output );
		$param = array (
				'estitle' => $output ['create'],
				'esViewTitle' => $esViewTitle 
		);
		$param = json_encode ( $param );
		$add = $proxy->addSubFolder ( $id, $param );
		echo json_encode ( $add );
	}
	/**
	 * 新建文件夹
	 * 
	 * @param unknown_type $id        	
	 * @param unknown_type $param        	
	 */
	public function addSubFolder($id, $param) {
		$urlParam = array (
				'addSubFolder',
				$id 
		);
		$url = implode ( '/', $urlParam );
		return $this->post ( self::SERVICE_NAME, $url, $param, 'application/json;charset=UTF-8' );
	}
	/**
	 * 电子文件总数详细列表
	 * 
	 * @author ldm
	 */
	public function total_json() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : false;
		if (! $query)
			return;
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$lists = $proxy->getfile ( $query, $page, $rp );
		$total = $proxy->getTotalNum ( $query ); // 总数
		if ($lists == "") {
			return;
		}
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$i = 1;
		foreach ( $lists as $k => $row ) {
			$entry = array (
					'id' => $i,
					'cell' => array (
							
							// xiewenda 201401008 添加原文路径数组元素 用于页面展示
							'c2' => $row->id->folderPath,
							'c3' => $row->id->estitle,
							'c4' => $row->id->esmd5,
							'c5' => $row->id->essize,
							'c6' => $row->id->estype,
							'c7' => $row->id->fileVersion 
					) 
			);
			$i ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	/**
	 * 更改文件夹名字
	 */
	public function do_edit() {
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$filename = $_POST ['filename'];
		$folderId = $_POST ['folderId'];
		$esViewTitle = $_POST ['esViewTitle'];
		$param = array (
				'estitle' => $filename,
				'esViewTitle' => $esViewTitle,
				'userId' => $userId,
				'ip' => $ip 
		); // liqiubo 20140618 加入saas支持
		$param = json_encode ( $param );
		$edit = $proxy->editSubFolder ( $folderId, $param );
		echo $edit;
	}
	/**
	 * 未挂接电子文件总数详细列表
	 * 
	 * @author ldm
	 */
	public function nothook_json() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : false;
		if (! $query)
			return;
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$lists = $proxy->getnothookfile ( $query, $page, $rp );
		$total = $proxy->getNotHookNum ( $query ); // 总数
		if ($lists == "") {
			return;
		}
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$i = 1;
		foreach ( $lists as $k => $row ) {
			$entry = array (
					'id' => $i,
					'cell' => array (
							'c2' => $row->id->folderPath,
							'c3' => $row->id->estitle,
							'c4' => $row->id->esmd5,
							'c5' => $row->id->essize,
							'c6' => $row->id->estype,
							'c7' => $row->id->fileVersion 
					) 
			);
			$i ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	public function getFileListForNoLink() {
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : null;
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 50;
		$folderId = isset ( $query ['folderid'] ) ? $query ['folderid'] : 0;
		$keyword = isset ( $query ['keyword'] ) ? $query ['keyword'] : '';
		$json = array (
				'keyword' => $keyword 
		);
		$list = json_encode ( $json );
		$proxy = $this->exec ( 'getProxy', 'folderservice' );
		$files = $proxy->selectFileByFolderIdForNoLink ( $folderId, $page, $rp, $list );
		$total = $proxy->getFileCountByFolderIdForNoLink ( $folderId, $list );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
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
public function getViewUrl() {
		$CanDownload = isset($_GET['fileDownload'])?$_GET['fileDownload']:false;
		$CanPrint = isset($_GET['filePrint'])?$_GET['filePrint']:false;
		$fileId = $_POST ["fileId"];
		$id = isset($_GET ["id"])?$_GET ["id"]:0; 
		$companyCode = "companyCode";
		$displayName = "displayName";
		$watermarkEnabled = false;
		$ip = $this->getClientIp ();
		$folderProxy = $this->exec ( "getProxy", "folderservice" );
		$url = $folderProxy->getViewUrl ( $fileId, $companyCode, $ip );
		$url = json_decode ( json_encode ( $url ), true );
		$fileOperationProxy = $this->exec ( "getProxy", "folderservice" );
		$parms = array ();
		if (isset ( $url ['file'] ) && ! empty ( $url ['file'] )) {
			if (stripos ( $url ['file'], 'error' ) !== false) {
				$parms ["result"] = "fail";
				$parms ["message"] = substr ( $url ['file'], 6 );
				$file = $fileOperationProxy->getSrcFileDownloadUrl ( $fileId, $ip );
				$file = json_decode ( json_encode ( $file ), true );
				if ($file ["fileUrl"] != "" && $file ["fileName"]) {
					$parms ["CanDownload"] = false; // 下载控制
					$parms ["DownloadUrl"] = $file ["fileUrl"];
					$parms ["FileName"] = $file ["fileName"];
					$parms ["result"] = "candown";
					$parms ["type"] = 'down';
					$parms ["message"] = "该文件暂不支持在线浏览，请下载文件";
				}
			} else {
				$parms ["result"] = "ok";
				if (stripos ( $url ['file'], 'rtmp' ) !== false) { // rtmp协议媒体流
					$parms ["type"] = "flv";
					$parms ["fileId"] = $fileId;
					$parms ["source"] = $url ['file'];
				} else { // http协议流
					$parms ["type"] = "swf";
					$parms ["fileId"] = $fileId;
					$parms ["Scale"] = 1;
					$parms ["SwfFile"] = $url ['file']; // 文件浏览地址
					$parms ["codeImageUrl"] = isset ( $url ['code'] ) ? $url ['code'] : ''; // 二维码地址
					$parms ["ReadOnly"] = false; // 只读控制
					                            // $parms["CanPrint"] = true; //打印控制
					$parms ["CanPrint"] = $CanPrint; // 打印控制
					$parms ["WatermarkEnabled"] = $watermarkEnabled; // 水印控制
					$parms ["WatermarkText"] = $displayName . " " . date ( "Y-m-d" ); // 水印内容
					$parms ["WatermarkSize"] = 54; // 水印内容
					$parms ["WatermarkRotation"] = - 45; // 水印旋转角度
				}
				// 原文下载控制
				$file = $fileOperationProxy->getSrcFileDownloadUrl ( $fileId, $ip );
				$file = json_decode ( json_encode ( $file ), true );
				if ($file ["fileUrl"] != "" && $file ["fileName"]) {
					$parms ["CanDownload"] = $CanDownload; // 下载控制
					$parms ["DownloadUrl"] = $file ["fileUrl"];
					$parms ["FileName"] = $file ['fileName'];
				}
			}
		}
		$rtn = json_encode ( $parms );
		echo $rtn;
	}
	/**
	 * 单独提取出来获取阅读文件的url
	 * 
	 * @author longjunhao 20140922
	 */
	public function getFileUrl() {
		$fileId = $_POST ['fileId'];
		// 无用参数
		$companyCode = "companyCode";
		$folderProxy = $this->exec ( "getProxy", "folderservice" );
		$ip = $this->getClientIp ();
		$url = $folderProxy->getViewUrl ( $fileId, $companyCode, $ip );
		$url = json_decode ( json_encode ( $url ), true );
		echo $url ['success'];
	}
	/**
	 * 检查是否存在swf文件
	 * 
	 * @author longjunhao 20140922
	 */
	public function checkSwfFile() {
		$fileId = $_POST ['fileId'];
		$folderProxy = $this->exec ( "getProxy", "folderservice" );
		$result = $folderProxy->checkSwfFile ( $fileId );
		echo $result;
	}
	
}
