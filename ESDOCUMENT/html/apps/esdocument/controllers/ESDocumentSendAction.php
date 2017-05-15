<?php
/**
 * 文件发放模块
 * @author gengqianfeng
 *
 */
class ESDocumentSendAction extends ESActionBase {
	// 首页渲染图片
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
		$userId = $this->getUser ()->getId ();
		$roleProxy = $this->exec ( "getProxy", "role" );
		$roles = $roleProxy->getRoleListByUserCode ( $userId );
		$admin = 'false-&-' . $userId;
		foreach ( $roles as $r ) {
			if ($r->roleId == "admin" || $r->roleId == "wenkong") {
				$admin = 'true-&-' . $userId;
			}
		}
		$fileSend = $this->exec ( "getProxy", "documentSend" );
		$total = $fileSend->getCount ( $pId, $condition ['condition'], $admin );
		$cells = $fileSend->findDocumentSendList ( $page, $rp, $pId, $condition ['condition'], $admin );
		echo json_encode ( $this->setResult ( $page, $rp, $total, $cells ) );
	}
	
	/**
	 * 构造单位部门列表
	 *
	 * @param unknown $pId        	
	 * @param unknown $page        	
	 * @return multitype:unknown multitype:
	 */
	private function setResult($page, $rp, $total, $cells) {
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
						'id' => $cell->id,
						'num' => $line,
						'ids' => '<input type="checkbox"  class="checkbox" id="'.$cell->id.'" pid="' . $cell->pId . '">',
						'operate' => '<span class="' . ($cell->status == '待发' ? 'editbtn' : 'showbtn') . '" pid="' . $cell->pId . '"> </span>',
						'no' => $cell->no,
						'flowName' => $cell->fileflow_name,
						'file_id' => $cell->file_id,
						'status' => $cell->status,
						'matrix' => '<span pid="' . $cell->pId . '" class="' . ($cell->status == '待发' ? 'detailsbtn' : 'relation') . '"> </span>',
						'creater' => $cell->creater,
						'createTime' => $cell->createtime 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 新建或修改页面
	 */
	public function sendPage() {
		$param = $_POST;
		if ($param) {
			$type = isset ( $param ['type'] ) ? $param ['type'] : '';
			$pid = isset ( $param ['pid'] ) ? $param ['pid'] : 0;
			$result = array ();
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			$result = array (
					'flowList' => $fileSend->getFlowList ( $pid ) 
			);
			if ($type == 'edit') {
				$sendId = isset ( $param ['sendId'] ) ? $param ['sendId'] : '';
				$result ['send'] = $fileSend->getDocumentSendById ( $sendId );
			}
			return $this->renderTemplate ( $result );
		}
	}
	
	public function showSendPage() {
		$param = $_POST;
		if ($param) {
			$type = isset ( $param ['type'] ) ? $param ['type'] : '';
			$pid = isset ( $param ['pid'] ) ? $param ['pid'] : 0;
			$result = array ();
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			$result = array (
					'flowList' => $fileSend->getFlowList ( $pid ) 
			);
			if ($type == 'edit') {
				$sendId = isset ( $param ['sendId'] ) ? $param ['sendId'] : '';
				$result ['send'] = $fileSend->getDocumentSendById ( $sendId );
			}
			return $this->renderTemplate ( $result );
		}
	}
	
	/**
	 * 待发
	 */
	public function momentumSend() {
		$send ['pId'] = isset ( $_POST ['selTreeId'] ) ? $_POST ['selTreeId'] : '';
		$send ['sendId'] = isset ( $_POST ['sendId'] ) ? $_POST ['sendId'] : '';
		$send ['no'] = isset ( $_POST ['no'] ) ? $_POST ['no'] : '';
		$send ['fileflow_id'] = isset ( $_POST ['fileflow_id'] ) ? $_POST ['fileflow_id'] : '';
		$send ['fileflow_name'] = isset ( $_POST ['fileflow_name'] ) ? $_POST ['fileflow_name'] : '';
		$send ['file_id'] = isset ( $_POST ['file_id'] ) ? $_POST ['file_id'] : '';
		$send ['status'] = '待发';
		$send ['creater'] = $this->getUser ()->getId ();
		$send ['createtime'] = date ( 'Y-m-d H:i:s', time () );
		$matrix = isset ( $_POST ['matrix'] ) ? $_POST ['matrix'] : "";
		$send ['strMatrix'] = isset ( $_POST ['strMatrix'] ) ? $_POST ['strMatrix'] : $matrix;
/* 		$mat = "";
		foreach ( $matrix as $row ) {
			$mat = $mat . $row ['code'] . ',' . $row ['copies'] . ',' . $row ['type'] . ';';
		
		} */
		$send ['model'] = isset ($_POST ['model'])?$_POST ['model']:null;
		$send ['titles'] =isset ( $_POST ['titles'])?$_POST ['titles']:'无';
		$send ['userId'] = $this->getUser()->getId();
		$send ['ip'] = $this->getClientIp();
		if ($send ['pId'] != '' && $send ['no'] != '' && $send ['fileflow_id'] != '' && $send ['file_id'] != '') {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			echo json_encode ( $fileSend->momentumSend ( json_encode ( $send ) ) );
		}
	}
	
	/**
	 * 发放
	 */
	public function extendSend() {
		$ip = $this->getClientIp ();
		$userId = $this->getUser ()->getId ();
		$send ['ip'] = $ip;
		$send ['userId'] = $userId;
		$send ['pId'] = isset ( $_POST ['selTreeId'] ) ? $_POST ['selTreeId'] : '';
		$send ['nodeType'] = isset ( $_POST ['nodeType'] ) ? $_POST ['nodeType'] : '';
		$send ['sendId'] = isset ( $_POST ['sendId'] ) ? $_POST ['sendId'] : '';
		$send ['no'] = isset ( $_POST ['no'] ) ? $_POST ['no'] : '';
		$send ['fileflow_id'] = isset ( $_POST ['fileflow_id'] ) ? $_POST ['fileflow_id'] : '';
		$send ['fileflow_name'] = isset ( $_POST ['fileflow_name'] ) ? $_POST ['fileflow_name'] : '';
		$send ['file_id'] = isset ( $_POST ['file_id'] ) ? $_POST ['file_id'] : '';
		$send ['status'] = '发放';
		$send ['creater'] = $this->getUser ()->getId ();
		$send ['createtime'] = date ( 'Y-m-d H:i:s', time () );
		$send ['model'] = isset ($_POST ['model'])?$_POST ['model']:null;
		$matrix = isset ( $_POST ['matrix'] ) ? $_POST ['matrix'] : '';
		$send ['strMatrix'] = isset ( $_POST ['strMatrix'] ) ? $_POST ['strMatrix'] : $matrix;
		$send ['titles'] =isset ( $_POST ['titles'])?$_POST ['titles']:'无';
		 $mat = "";
		foreach ( $matrix as $row ) {
			$mat = $mat . $row ['code'] . ',' . $row ['copies'] . ',' . $row ['type'] . ';';
			
		}
		$send ['matrix'] = substr ( $mat, 0, strlen ( $mat ) - 1 ); 
		if ($send ['pId'] != '' && $send ['no'] != '' && $send ['fileflow_id'] != '' && $send ['file_id'] != '' && $send ['matrix'] != '') {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			echo json_encode ( $fileSend->extendSend ( json_encode ( $send ) ) );
		}
	}
	
	/**
	 * 删除发放单
	 */
	public function delSend() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '' && count ( $ids ) != 0) {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			echo $fileSend->delSend ( $ids );
		}
	}
	
	/**
	 * 获取文件选择列表
	 */
	public function findDocumentList() {
		$code = isset ( $_GET ['code'] ) ? $_GET ['code'] : '';
		$stageId = isset ( $_GET ['stageId'] ) ? $_GET ['stageId'] : '0';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		if ($code == '' || $stageId == '0' || $stageId == '') {
			echo json_encode ( $this->setFileResult ( $page, $rp, 0, null, null ) );
		} else {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			$total = $fileSend->getFileCount ( $code, $stageId );
			$cells = $fileSend->findDocumentList ( $page, $rp, $code, $stageId );
			$moveCols = $fileSend->findMoveCols ( $stageId );
			echo json_encode ( $this->setFileResult ( $page, $rp, $total, $cells, $moveCols ) );
		}
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
						'ids' => '<input type="checkbox" class="checkbox" />',
						'viewfile' => '<span class="viewfile" stageId="' . $cell->stageId . '" title="' . $cell->fileCount . '份"></span>',
						'title' => $cell->title,
						'docNo' => $cell->docNo,
						'itemName' => $cell->itemName,
						'device' => $cell->device,
						'part' => $cell->part,
						'person' => $cell->person,
						'date' => $cell->date 
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
	 * 获取文件列表动态字段
	 */
	public function findMoveCols() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '0';
		$fileSend = $this->exec ( "getProxy", "documentSend" );
		echo json_encode ( $fileSend->findMoveCols ( $stageId ) );
	}
	
	/**
	 * 获取选中文件列表
	 */
	public function findDocumentListByIds() {
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$pre = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		if ($ids != '') {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			$total = $fileSend->getCountById ( $ids );
			$cells = $fileSend->findDocumentListByIds ( $page, $pre, $ids );
			$moveCols = $fileSend->findMoveCols ( "0" );
			echo json_encode ( $this->setFileResult ( $page, $pre, $total, $cells, $moveCols ) );
		}
	}
	
	/**
	 * 获取流程矩阵
	 */
	public function getSendMatrix() {
		$send_id = isset ( $_GET ['sendId'] ) ? $_GET ['sendId'] : 0;
		$nodeType = isset ( $_GET ['type'] ) ? $_GET ['type'] : '1';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$send_id = ($send_id == '') ? 0 : $send_id;
		$fileSend = $this->exec ( "getProxy", "documentSend" );
		$total = $fileSend->getMatrixCount ( $send_id, $nodeType );
		$cells = $fileSend->findSendMatrixList ( $send_id, $nodeType, $page, $rp );
		echo json_encode ( $this->setMatrixResult ( $page, $rp, $total, $cells ) );
	}
	
	/**
	 * 设置流程矩阵结果集
	 *
	 * @param unknown $page        	
	 * @param unknown $rp        	
	 * @param unknown $total        	
	 * @param unknown $cells        	
	 * @return multitype:unknown multitype:
	 */
	private function setMatrixResult($page, $rp, $total, $cells) {
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
						'partName' => $cell->partName,
						'part_code' => $cell->part_code,
						'user_id' => $cell->user_id,
						'copies' => $cell->copies,
						'receiver' => $cell->receiver,
						'sign' => $cell->sign,
						'mobile' => $cell->mobile,
						'reply_content' => $cell->reply_content,
						'receivetime' => $cell->receivetime,
						'fileName' => '<span class="loadSign" filePath="' . $cell->filePath . '"' . (($cell->filePath != '') ? ' title="点击下载签名文件" style="cursor:pointer;text-decoration: underline; color: blue;" ' : '') . ' >' . $cell->fileName . '</span>',
						'status' => '<span class="' . ($cell->status == '0' ? 'norolvedbtn' : 'isrolvedbtn') . '" title="' . ($cell->status == '0' ? '未接收' : '已接收') . '"></span>' 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 待发状态下直接发放
	 */
	public function pubSend() {
		$send ['id'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$send ['no'] = isset ( $_POST ['no'] ) ? $_POST ['no'] : '';
		$send ['file_id'] = isset ( $_POST ['file_id'] ) ? $_POST ['file_id'] : '';
		$send ['nodeType'] = isset ( $_POST ['nodeType'] ) ? $_POST ['nodeType'] : '';
		$send ['pId'] = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$send ['fileflow_id'] = isset ( $_POST ['fileflow_id'] ) ? $_POST ['fileflow_id'] : '';
		$send ['fileflow_name'] = isset ( $_POST ['fileflow_name'] ) ? $_POST ['fileflow_name'] : '';
		$send ['ip'] = $this->getClientIp ();
		$userId = $this->getUser ()->getId ();
		$send ['userId'] = $userId;
		$send ['creater'] = $userId;
		$send ['createtime'] = date ( 'Y-m-d H:i:s', time () );
		$matrix = isset ( $_POST ['matrix'] ) ? $_POST ['matrix'] : '';
		$mat = "";
		foreach ( $matrix as $row ) {
			$mat = $mat . $row ['code'] . ',' . $row ['copies'] . ',' . $row ['type'] . ';';
		}
		$send ['matrix'] = substr ( $mat, 0, strlen ( $mat ) - 1 );
		$fileSend = $this->exec ( "getProxy", "documentSend" );
		echo json_encode ( $fileSend->pubSend ( $send ) );
	}
	
	/**
	 * 获取分发单条数据
	 *
	 * @return string
	 */
	public function getDocumentSendById() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$fileSend = $this->exec ( "getProxy", "documentSend" );
		echo json_encode ( $fileSend->getDocumentSendById ( $id ) );
	}
	
	/**
	 * 通过流程id获取流程实体
	 */
	public function getSendReceiveFlowById() {
		$flowId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
		echo json_encode ( $fileflow->getSendReceiveFlowById ( $flowId ) );
	}
	
	/**
	 * 获取发放单编号
	 */
	public function getSendNo() {
		$pId = isset ( $_GET ['pId'] ) ? $_GET ['pId'] : '';
		if ($pId != '') {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			echo $fileSend->getSendNo ( $pId );
		}
	}
	
	/**
	 * 渲染发放矩阵
	 */
	public function flowChart() {
		$nodeType = isset ( $_POST ['nodeType'] ) ? $_POST ['nodeType'] : '';
		$sendId = isset ( $_POST ['sendId'] ) ? $_POST ['sendId'] : '';
		if ($nodeType != '' && $sendId != '') {
			return $this->renderTemplate ( array (
					'nodeType' => $nodeType,
					'sendId' => $sendId 
			) );
		}
	}
	
	/**
	 * 更新发放单流程名称
	 */
	public function updateFlowNameBySendid() {
		$sendId = isset ( $_POST ['sendId'] ) ? $_POST ['sendId'] : '';
		$flowName = isset ( $_POST ['flowName'] ) ? $_POST ['flowName'] : '';
		if ($sendId != '' && $flowName != '') {
			$fileSend = $this->exec ( "getProxy", "documentSend" );
			echo $fileSend->updateFlowNameBySendid ( $sendId, $flowName );
		}
	}
	
	/**
	 * 查看流程
	 */
	public function flowChart1(){
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		$type =  isset ( $_GET ['type'] ) ? $_GET ['type'] : '';
		$result = array();
		if ($id != '' && !$type =='showChange') {
		$fileflow = $this->exec ( "getProxy", "sendreceiveflow" );
		$result["result"] = $fileflow->getSendReceiveFlowById ($id);
		}else{
		$sendProxy = $this->exec ( "getProxy", "documentSend" );
		$result["result"] = $sendProxy->getDocumentSendById ($id);
		}
		return  $this->renderTemplate($result);
	}
	
	public function callbackSend(){
		$sendId = isset ( $_POST ['sendId'] ) ? $_POST ['sendId'] : '';
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		$param = array(
			'sendId' =>$sendId,
			'type' =>$type,
			'status'=>1
		);
		$sendProxy = $this->exec ( "getProxy", "documentSend" );
		$receiveProxy = $this->exec ( "getProxy", "documentReceive" );
		$count = $receiveProxy->getReceiveBySendId(json_encode($param));
		if($count>0){
			echo "此发放单已经被接收，不能撤回！";
		}else{
			$result =$sendProxy->callbackSend(json_encode($param));
			echo $result;
		}
	}
}

