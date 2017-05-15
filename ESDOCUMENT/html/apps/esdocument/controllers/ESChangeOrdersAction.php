<?php
/**
 * 设计变更清单模块
 * @author dengguoqi
 *
 */
class ESChangeOrdersAction extends ESActionBase {
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
	 * 获取变更单列表
	 */
	public function findChangeList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		if (! isset ( $condition ['condition'] )) {
			$condition ['condition'] = null;
		}
		$pId = isset ( $_GET ['pid'] ) ? $_GET ['pid'] : 0;
		$userId = $this->getUser ()->getId ();
		$roleProxy = $this->exec ( "getProxy", "role" );
		$roles = $roleProxy->getRoleListByUserCode ( $userId );
		$admin = 'false';
		foreach ( $roles as $r ) {
			if ($r->roleId == "admin" || $r->roleId == "wenkong") {
				$admin = 'true';
			}
		}
		
		$fileOrders = $this->exec ( "getProxy", "changeOrders" );
		$total = $fileOrders->getCount ( $userId, $admin,$pId, $condition ['condition'] );
		$cells = $fileOrders->findChangeOrdersList ( $page, $rp, $userId, $admin,$pId, $condition ['condition'] );
		echo json_encode ( $this->setResult ( $page, $rp, $total, $cells, $admin ) );
	}
	
	/**
	 * 构造变更单列表
	 *
	 * @param unknown $page
	 *        	第几页
	 * @param unknown $rp
	 *        	每页显示多少条
	 * @param unknown $total
	 *        	总条数
	 * @param unknown $cells
	 *        	获取的列表数据
	 * @return multitype:unknown multitype:
	 */
	private function setResult($page, $rp, $total, $cells, $admin) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		$operate = "";
		
		if (count ( $cells ) > 0) {
			$line = ($page - 1) * $rp + 1;
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
						'ids' => '<input type="checkbox"  class="checkbox"  orderId="' . $cell->id . '">',
						'operate' => $operate,
						'code' => $cell->code,
						'part_code' => $cell->part_code,
						'part_name' => $cell->part_name,
						'copies' => $cell->copies,
						'scanFile' => '<span fileId="' . $cell->file_id . '" class="detailsbtn2"> </span>',
						'creater' => $cell->creater,
						'createtime' => $cell->createtime,
						'receiver' => $cell->receiver,
						'sign' => $cell->sign,
						'receivetime' => $cell->receivetime,
						'status' => ($cell->status == '1') ? '已接收' : '未接收' 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 编辑变更单页面
	 */
	public function edit() {
		$orderId = isset ( $_GET ['orderId'] ) ? $_GET ['orderId'] : '';
		if ($orderId != '') {
			$fileOrders = $this->exec ( "getProxy", "changeOrders" );
			return $this->renderTemplate ( array (
					'result' => $fileOrders->findChangeOrdersById ( $orderId ) 
			) );
		}
	}
	
	/**
	 * 确认修改变更单
	 */
	public function editOrder() {
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		
		$order ['ip'] = $ip;
		$order ['userId'] = $userId;
		$order ['id'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$order ['send_id'] = isset ( $_POST ['sendId'] ) ? $_POST ['sendId'] : '';
		$order ['sign'] = isset ( $_POST ['sign'] ) ? $_POST ['sign'] : '';
		$order ['mobile'] = isset ( $_POST ['mobile'] ) ? $_POST ['mobile'] : '';
		$order ['reply_content'] = isset ( $_POST ['reply_content'] ) ? $_POST ['reply_content'] : '';
		$order ['receiver'] = $this->getUser ()->getId ();
		$order ['receivetime'] = date ( 'Y-m-d H:i:s', time () );
		
		// xiewenda 文件接收时的签字单文件字段
		$order ['fileName'] = isset ( $_POST ['fileName'] ) ? $_POST ['fileName'] : '';
		$order ['filePath'] = isset ( $_POST ['filePath'] ) ? $_POST ['filePath'] : '';
		if ($order ['id'] != '' && $order ['send_id'] != '' && $order ['sign'] != '' && $order ['mobile'] != '') {
			$fileOrders = $this->exec ( "getProxy", "changeOrders" );
			echo $fileOrders->editOrders ( $order );
		}
	}
	public function delOrder() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '') {
			$fileOrders = $this->exec ( "getProxy", "changeOrders" );
			echo $fileOrders->delOrder ( $ids );
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
		$Proxy = $this->exec ( "getProxy", 'changeOrders' );
		$result = $Proxy->deleteFile ( json_encode ( $param ) );
		echo $result;
	}
}
