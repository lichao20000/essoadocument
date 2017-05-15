<?php
/**
 * 文件收发流程定制模块
 * @author dengguoqi
 *
 */
class ESSendReceiveFlowAction extends ESActionBase {
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
		$pId = isset ( $_GET ['pid'] ) ? $_GET ['pid'] : 0;
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$pId = ($pId == '') ? 0 : $pId;
		if (! isset ( $condition ['condition'] )) {
			$condition ['condition'] = null;
		}
		$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
		$total = $fileflow->getCount ( $pId, $condition ['condition'] );
		$cells = $fileflow->findSendReceiveFlowList ( $page, $rp, $pId, $condition ['condition'] );
		echo json_encode ( $this->setResult ( $page, $rp, $total, $cells ) );
	}
	
	/**
	 * 构造收发流程列表集
	 *
	 * @param unknown $page
	 *        	第几页
	 * @param unknown $rp
	 *        	每页显示多少条
	 * @param unknown $total
	 *        	总条数
	 * @param unknown $cells
	 *        	分页查询集合
	 * @return multitype:unknown multitype:
	 */
	private function setResult($page, $rp, $total, $cells) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'id'=>$cell->id,
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox" matrix="' . $cell->flow_matrix . '">',
					'operate' => '<span class="editbtn" ></span>',
					'status' => $cell->status,
					'name' => $cell->name,
					'describtion' => $cell->describtion,
					'typeName' => $cell->typeName,
					'creater' => $cell->creater,
					'createTime' => $cell->createtime,
					'modifyer' => $cell->modifyer,
					'modifyTime' => $cell->modifytime,
					'version' => $cell->version 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 加载流程类型树
	 */
	public function getTree() {
		$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
		$tree = $fileflow->getTree ();
		if (count ( $tree ) > 0) {
			$tree [0]->open = true;
		}
		echo json_encode ( $tree );
	}
	/**
	 * 加载流程类型树
	 */
	public function getTreeByParentName() {
		$name = isset ( $_GET ['name'] ) ? $_GET ['name'] : "";
		$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
		$param = array(
			"parentName"=>$name
		);
		$tree = $fileflow->getTreeByParentName (json_encode($param));
		if (count ( $tree ) > 0) {
			$tree [0]->open = true;
		}
		echo json_encode ( $tree );
	}
	
	/**
	 * 添加或编辑流程类型页面
	 */
	public function flowTypePage() {
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		if ($type == 'add') {
			return $this->renderTemplate ();
		}
		if ($type == 'edit') {
			if (isset ( $_POST ['id'] ) && $_POST ['id'] != '') {
				$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
				$entity = $fileflow->getTreeById ( $_POST ['id'] );
				return $this->renderTemplate ( array (
						'pid' => $entity->pId,
						'name' => $entity->name,
						'sort' => $entity->sort 
				) );
			}
		}
	}
	
	/**
	 * 添加流程类型
	 */
	public function addFlowType() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$type = array ();
			$type ['ip'] = $ip;
			$type ['userId'] = $userId;
			$type ['pid'] = isset ( $param ['pid'] ) ? $param ['pid'] : '';
			$type ['name'] = isset ( $param ['name'] ) ? $param ['name'] : '';
			$type ['sort'] = isset ( $param ['sort'] ) ? $param ['sort'] : '';
			if ($type ['pid'] != '' && $type ['name'] != '' && $type ['sort'] != '') {
				$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
				echo json_encode ( $fileflow->addTree ( json_encode ( $type ) ) );
			}
		}
	}
	
	/**
	 * 修改流程类型
	 */
	public function editFlowType() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$type = array ();
			$type ['ip'] = $ip;
			$type ['userId'] = $userId;
			$type ['id'] = isset ( $param ['id'] ) ? $param ['id'] : '';
			$type ['pid'] = isset ( $param ['pid'] ) ? $param ['pid'] : '';
			$type ['name'] = isset ( $param ['name'] ) ? $param ['name'] : '';
			$type ['sort'] = isset ( $param ['sort'] ) ? $param ['sort'] : '';
			if ($type ['id'] != '' && $type ['pid'] != '' && $type ['name'] != '' && $type ['sort'] != '') {
				$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
				echo $fileflow->updateTree ( json_encode ( $type ) );
			}
		}
	}
	
	/**
	 * 删除流程类型
	 */
	public function delFlowType() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '' && count ( $ids ) > 0) {
			$userId = $this->getUser ()->getId ();
			$ip = $this->getClientIp ();
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			echo $fileflow->delTree ( json_encode ( $ids ), $userId, $ip );
		}
	}
	
	/**
	 * 添加或编辑流程页面
	 */
	public function flowPage() {
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		$result = array ();
		$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
		$result = array ();
		if ($type == 'edit') {
			$flowId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
			$result ['flow'] = $fileflow->getSendReceiveFlowById ( $flowId );
		}
		return $this->renderTemplate ( $result );
	}
	
	/**
	 * 添加流程
	 */
	public function addFlow() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$flow = array ();
			$flow ['ip'] = $ip;
			$flow ['userId'] = $userId;
			$flow ['pid'] = isset ( $param ['pid'] ) ? $param ['pid'] : '';
			$flow ['name'] = isset ( $param ['name'] ) ? $param ['name'] : '';
			$flow ['status'] = '关闭';
			$flow ['typeNo'] = isset ( $param ['typeNo'] ) ? $param ['typeNo'] : '';
			$flow ['version'] = isset ( $param ['version'] ) ? $param ['version'] : '';
			$flow ['describtion'] = isset ( $param ['describtion'] ) ? $param ['describtion'] : '';
			$flow ['creater'] = $this->getUser ()->getId ();
			$flow ['createtime'] = date ( 'Y-m-d H:i:s', time () );
			if ($flow ['pid'] != '' && $flow ['name'] != '' && $flow ['typeNo'] != '' && $flow ['version'] != '') {
				$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
				echo json_encode ( $fileflow->addSendReceiveFlow ( json_encode ( $flow ) ) );
			}
		}
	}
	
	/**
	 * 修改流程
	 */
	public function editFlow() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$flow = array ();
			$flow ['ip'] = $ip;
			$flow ['userId'] = $userId;
			$flow ['id'] = isset ( $param ['flowId'] ) ? $param ['flowId'] : '';
			$flow ['name'] = isset ( $param ['name'] ) ? $param ['name'] : '';
			$flow ['typeNo'] = isset ( $param ['typeNo'] ) ? $param ['typeNo'] : '';
			$flow ['version'] = isset ( $param ['version'] ) ? $param ['version'] : '';
			$flow ['describtion'] = isset ( $param ['describtion'] ) ? $param ['describtion'] : '';
			$flow ['modifyer'] = $this->getUser ()->getId ();
			$flow ['modifytime'] = date ( 'Y-m-d H:i:s', time () );
			if ($flow ['id'] != '' && $flow ['name'] != '' && $flow ['typeNo'] != '' && $flow ['version'] != '') {
				$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
				echo $fileflow->updateSendReceiveFlow ( json_encode ( $flow ) );
			}
		}
	}
	
	/**
	 * 删除流程
	 */
	public function delFlow() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '' && count ( $ids ) > 0) {
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			echo $fileflow->delSendReceiveFlow ( json_encode ( $ids ) );
		}
	}
	
	/**
	 * 定制收发流程图
	 *
	 * @return string
	 */
	public function flowChart() {
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		if ($id != '') {
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			return $this->renderTemplate ( array (
					"result" => $fileflow->getSendReceiveFlowById ( $id ) 
			) );
		}else{
			return $this->renderTemplate ( array ("result" =>"") );
		}
	}
	
	/**
	 * 添加流程矩阵
	 */
	public function editMatrix() {
		$ip = $this->getClientIp();
		$userId = $this->getUser()->getId();
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$matrix = isset ( $_POST ['matrix'] ) ? $_POST ['matrix'] : '';
		$flowname = isset ( $_POST ['flowname'] ) ? $_POST ['flowname'] : '';
		if ($id != '' && $matrix != '') {
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			$params = array (
					'ip'=>$ip,
					'userId'=>$userId,
					'id' => $id,
					'flowname' => $flowname,
					'matrix' => $matrix 
			);
			echo $fileflow->editMatrix ( $params );
		}
	}
	
	/**
	 * 发布或关闭流程
	 */
	public function pubOrCloseFlow() {
		$param = $_POST;
		if ($param) {
			$flow = array ();
			$flow ['id'] = isset ( $param ['id'] ) ? $param ['id'] : '';
			$flow ['status'] = isset ( $param ['status'] ) ? $param ['status'] : '';
			$flow ['name'] = isset ( $param ['name'] ) ? $param ['name'] : '';
			$flow ['userId'] = $this->getUser()->getId();
			$flow ['ip'] = $this->getClientIp();
			$flow ['modifyer'] = $this->getUser ()->getId ();
			$flow ['modifytime'] = date ( 'Y-m-d H:i:s', time () );
			if ($flow ['id'] != '' && $flow ['status'] != '') {
				// 修改流程状态
				$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
				echo $fileflow->pubOrCloseFlow ( json_encode ( $flow ) );
			}
		}
	}
	
	/**
	 * 获取默认选择单位部门
	 */
	public function getPartByCode($code) {
		// $code = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		if ($code != '') {
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			return $fileflow->getPartByCode ( $code );
		}
	}
	
	/**
	 * 获取默认选择用户
	 */
	public function getUserByCode($code) {
		// $code = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		if ($code != '') {
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			return $fileflow->getUserByCode ( $code );
		}
	}
	
	/**
	 * 通过收集范围代码获取收集范围实体对象
	 */
	public function getStageByCode() {
		$code = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		if ($code != '') {
			$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
			echo json_encode ( $fileflow->getStageByCode ( $code ) );
		}
	}
	
	/**
	 * 加载用户部门流程
	 *
	 * @return multitype:
	 */
	public function loadPartAndUser() {
		$result = isset ( $_POST ['result'] ) ? $_POST ['result'] : '';
		if ($result != '') {
			$returnList = array ();
			$key = '';
			foreach ( $result as $res ) {
				$returnMap = array ();
				$type = $res ['type'];
				$code = $res ['code'];
				$copies = $res ['copies'];
				if ($type == 'part') {
					$part = $this->getPartByCode ( $code );
					$returnMap = array (
							'code' => $code,
							'copies' => $copies,
							'type' => $type,
							'name' => $part [0]->name 
					);
				} else if ($type == 'user') {
					$user = $this->getUserByCode ( $code );
					$returnMap = array (
							'code' => $code,
							'copies' => $copies,
							'type' => $type,
							'name' => $user->lastName . $user->firstName 
					);
				} else {
				}
				array_push ( $returnList, $returnMap );
			}
			echo json_encode ( $returnList );
		}
	}
	/**
	 * 验证名称唯一性
	 */
	public function uniqueName() {
		$pId = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$name = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		if ($pId != ''&&$name != ''&&$type != '') {
			$params = array (
					'pId'=>$pId,
					'name'=>$name,
					'type' => $type
			);
			$proxy= $this->exec ( "getProxy", 'sendreceiveflow' );
			echo $proxy->uniqueName ( json_encode($params) );
		}
	}
}
