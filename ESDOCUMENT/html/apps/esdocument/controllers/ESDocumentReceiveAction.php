<?php
/**
 * 文件接收模块
 * @author dengguoqi
 *
 */
class ESDocumentReceiveAction extends ESActionBase {
	/**
	 * 首页渲染图片
	 *
	 * @return string
	 */
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	
	/**
	 * 加载列表数据
	 */
	public function getLoaderListInfo() {
		$pid = isset ( $_GET ['pid'] ) ? $_GET ['pid'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$pid = ($pid == '') ? 0 : $pid;
		if (! isset ( $condition ['condition'] )) {
			$condition ['condition'] = null;
		}
		$userId = $this->getUser ()->getId ();
		$roleProxy = $this->exec ( "getProxy", "role" );
		$roles = $roleProxy->getRoleListByUserCode ( $userId );
		$admin = 'false';
		foreach ( $roles as $r ) {
			if ($r->roleId == "admin" || $r->roleId == "wenkong") {
				$admin = 'true';
			}
		}
		$fileReceive = $this->exec ( "getProxy", "documentReceive" );
		$param = array (
				'pid' => $pid,
				'user' => $userId,
				'admin' => $admin,
				'condition' => $condition ['condition'] 
		);
		$total = $fileReceive->getCount ( $param );
		$param ['page'] = $page;
		$param ['pre'] = $rp;
		$cells = $fileReceive->findDocumentReceiveList ( $param );
		echo json_encode ( $this->setResult ( $page, $rp, $total, $cells, $admin ) );
	}
	
	/**
	 * 构造接收文件列表
	 *
	 * @param unknown $page
	 *        	第几页
	 * @param unknown $rp
	 *        	每页显示多少条
	 * @param unknown $total
	 *        	总条数
	 * @param unknown $cells
	 *        	分页查询列表集
	 * @return multitype:unknown multitype:
	 */
	private function setResult($page, $rp, $total, $cells, $admin) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		$line = ($page - 1) * $rp + 1;
		$operate = "";
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			if ($admin == 'true') {
				$operate = '<span class="editbtn" sendId="' . $cell->send_id . ' "> </span>';
			} else {
				$operate = '<span class="noeditbtn" sendId="' . $cell->send_id . ' "> </span>';
			}
			$row ['cell'] = array (
					'id' => $cell->id,
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox"  receiveId="' . $cell->id . '">',
					'operate' => $operate,
					'no' => $cell->no,
					'part_code' => $cell->part_code,
					'part_name' => $cell->part_name,
					'copies' => $cell->copies,
					'status' => ($cell->status == '1') ? '已接收' : '未接收',
					'creater' => $cell->creater,
					'createtime' => $cell->createtime,
					'receiver' => $cell->receiver,
					'sign' => $cell->sign,
					'receivetime' => $cell->receivetime,
					'scanFile' => '<span fileId="' . $cell->file_id . '" class="detailsbtn2"> </span>' 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 处理接收单页面
	 *
	 * @return string
	 */
	public function edit() {
		$receiveId = isset ( $_GET ['receiveId'] ) ? $_GET ['receiveId'] : '';
		if ($receiveId != '') {
			$fileReceive = $this->exec ( "getProxy", "documentReceive" );
			return $this->renderTemplate ( array (
					'result' => $fileReceive->getReceiveById ( $receiveId ) 
			) );
		}
	}
	
	/**
	 * 接收文件
	 */
	public function editReceive() {
		$ip = $this->getClientIp ();
		$receive ['ip'] = $ip;
		$receive ['id'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$receive ['send_id'] = isset ( $_POST ['send_id'] ) ? $_POST ['send_id'] : '';
		$receive ['sign'] = isset ( $_POST ['sign'] ) ? $_POST ['sign'] : '';
		$receive ['mobile'] = isset ( $_POST ['mobile'] ) ? $_POST ['mobile'] : '';
		$receive ['reply_content'] = isset ( $_POST ['reply_content'] ) ? $_POST ['reply_content'] : '';
		$receive ['receiver'] = $this->getUser ()->getId ();
		$receive ['receivetime'] = date ( 'Y-m-d H:i', time () );
		// xiewenda 文件接收时的签字单文件字段
		$receive ['fileName'] = isset ( $_POST ['fileName'] ) ? $_POST ['fileName'] : '';
		$receive ['filePath'] = isset ( $_POST ['filePath'] ) ? $_POST ['filePath'] : '';
		if ($receive ['id'] != '' && $receive ['sign'] != '' && $receive ['mobile'] != '') {
			$fileReceive = $this->exec ( "getProxy", "documentReceive" );
			echo $fileReceive->editReceive ( $receive );
		}
	}
	
	/**
	 * 删除
	 */
	public function delReceive() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '' && count ( $ids ) != 0) {
			$fileReceive = $this->exec ( "getProxy", "documentReceive" );
			echo $fileReceive->delReceive ( $ids );
		}
	}
	
	// 删除签字单附件
	public function deleteFile() {
		$filePath = $_POST ['filePath'];
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : null;
		// 根路径
		$rootDir = dirname ( dirname ( dirname ( __DIR__ ) ) );
		$param ['filePath'] = $filePath;
		$param ['id'] = $id;
		$param ['rootDir'] = $rootDir;
		$Proxy = $this->exec ( "getProxy", 'documentReceive' );
		$result = $Proxy->deleteFile ( json_encode ( $param ) );
		echo $result;
	}
}
