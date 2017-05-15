<?php

/**
 * 装置单元维护模块
 * @author dengguoqi
 *
 */
class ESDeviceAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	
	// 生成装置分类树
	public function getTree() {
		$maxLevel = isset ( $_GET ['maxLevel'] ) ? $_GET ['maxLevel'] : 0;
		$proxy = $this->exec ( "getProxy", "device" );
		$tree = $proxy->getTree ( $maxLevel );
		if (count ( $tree ) > 0) {
			$tree [0]->open = true;
		}
		echo json_encode ( $tree );
	}
	
	// 获取装置或装置分类列表
	public function getDeviceList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$pId = isset ( $_GET ['id'] ) ? $_GET ['id'] : 0;
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
		$proxy = $this->exec ( "getProxy", "device" );
		$count = $proxy->getCount ( json_encode ( array (
				'pId' => $pId,
				'where' => $where 
		) ) );
		$list = $proxy->getDeviceList ( $page, $rp, json_encode ( $data ) );
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array () 
		);
		$start = ($page - 1) * $rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $device ) {
				$device->num = $start + 1;
				$device->ids = "<input type=\"checkbox\" class=\"checkbox\" level=" . $device->level . " name=\"changeId\" value=" . $device->id . " id=\"changeId\">";
				$device->operate = "<span class='editbtn' id=" . $device->id . "> </span>";
				$result ["rows"] [] = array (
						"id" => $device->id,
						"cell" => $device 
				);
				$start ++;
			}
		}
		
		echo json_encode ( $result );
	}
	/**
	 * 添加装置
	 */
	public function addDevice() {
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if ($param) {
			$pId = isset ( $param ['pId'] ) ? $param ['pId'] : '';
			$level = isset ( $param ['level'] ) ? $param ['level'] : '';
			$name = isset ( $param ['name'] ) ? $param ['name'] : '';
			$firstNo = isset ( $param ['firstNo'] ) ? $param ['firstNo'] : '';
			$secondNo = isset ( $param ['secondNo'] ) ? $param ['secondNo'] : '';
			$deviceNo = isset ( $param ['deviceNo'] ) ? $param ['deviceNo'] : '';
			$baseUnits = isset ( $param ['baseUnits'] ) ? $param ['baseUnits'] : '';
			$detailUnits = isset ( $param ['detailUnits'] ) ? $param ['detailUnits'] : '';
			$mainPart = isset ( $param ['mainPart'] ) ? $param ['mainPart'] : '';
			$supervisionUnits = isset ( $param ['supervisionUnits'] ) ? $param ['supervisionUnits'] : '';
			$baseUnitsCode = isset ( $param ['baseUnitsCode'] ) ? $param ['baseUnitsCode'] : '';
			$detailUnitsCode = isset ( $param ['detailUnitsCode'] ) ? $param ['detailUnitsCode'] : '';
			$mainPartCode = isset ( $param ['mainPartCode'] ) ? $param ['mainPartCode'] : '';
			$supervisionUnitsCode = isset ( $param ['supervisionUnitsCode'] ) ? $param ['supervisionUnitsCode'] : '';
			$remarks = isset ( $param ['remarks'] ) ? $param ['remarks'] : '';
			if ($name != '' && $pId != '' && $level != '') {
				$proxy = $this->exec ( "getProxy", "device" );
				$device = json_encode ( array (
						'ip'=>$ip,
						'userId'=>$userId,
						'pId' => $pId,
						'level' => $level,
						'name' => $name,
						'firstNo' => $firstNo,
						'secondNo' => $secondNo,
						'deviceNo' => $deviceNo,
						'baseUnits' => $baseUnits,
						'detailUnits' => $detailUnits,
						'mainPart' => $mainPart,
						'supervisionUnits' => $supervisionUnits,
						'baseUnitsCode' => $baseUnitsCode,
						'detailUnitsCode' => $detailUnitsCode,
						'mainPartCode' => $mainPartCode,
						'supervisionUnitsCode' => $supervisionUnitsCode,
						'remarks' => $remarks 
				) );
				$device = $proxy->addDevice ( $device );
			}
			echo json_encode ( $device );
		}
	}
	/**
	 * 删除装置
	 */
	public function deleteDevice() {
		$param = $_POST;
		if ($param) {
			$ids = isset ( $param ['ids'] ) ? $param ['ids'] : '';
			$flag = false;
			if ($ids != '') {
				$proxy = $this->exec ( "getProxy", "device" );
				$flag = $proxy->deleteDevice ( json_encode ( explode ( ',', $ids ) ) );
			}
			echo json_encode ( $flag );
		}
	}
	/**
	 * 编辑装置
	 */
	public function edit() {
		if (isset ( $_POST ['id'] )) {
			$proxy = $this->exec ( "getProxy", "device" );
			$id = $_POST ['id'];
			$device = ( array ) $proxy->getDevice ( $id );
			return $this->renderTemplate ( $device );
		}
	}
	/**
	 * 更新装置
	 */
	public function updateDevice() {
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if (isset ( $param ['id'] )) {
			$pId = isset ( $param ['pId'] ) ? $param ['pId'] : '';
			$level = isset ( $param ['level'] ) ? $param ['level'] : '';
			$name = isset ( $param ['name'] ) ? $param ['name'] : '';
			$firstNo = isset ( $param ['firstNo'] ) ? $param ['firstNo'] : '';
			$secondNo = isset ( $param ['secondNo'] ) ? $param ['secondNo'] : '';
			$deviceNo = isset ( $param ['deviceNo'] ) ? $param ['deviceNo'] : '';
			$baseUnits = isset ( $param ['baseUnits'] ) ? $param ['baseUnits'] : '';
			$detailUnits = isset ( $param ['detailUnits'] ) ? $param ['detailUnits'] : '';
			$mainPart = isset ( $param ['mainPart'] ) ? $param ['mainPart'] : '';
			$supervisionUnits = isset ( $param ['supervisionUnits'] ) ? $param ['supervisionUnits'] : '';
			$baseUnitsCode = isset ( $param ['baseUnitsCode'] ) ? $param ['baseUnitsCode'] : '';
			$detailUnitsCode = isset ( $param ['detailUnitsCode'] ) ? $param ['detailUnitsCode'] : '';
			$mainPartCode = isset ( $param ['mainPartCode'] ) ? $param ['mainPartCode'] : '';
			$supervisionUnitsCode = isset ( $param ['supervisionUnitsCode'] ) ? $param ['supervisionUnitsCode'] : '';
			$remarks = isset ( $param ['remarks'] ) ? $param ['remarks'] : '';
			if ($name != '' && $pId != '' && $level != '') {
				$proxy = $this->exec ( "getProxy", "device" );
				$device = json_encode ( array (
						'ip'=>$ip,
						'userId'=>$userId,
						'id' => $param ['id'],
						'pId' => $pId,
						'level' => $level,
						'name' => $name,
						'firstNo' => $firstNo,
						'secondNo' => $secondNo,
						'deviceNo' => $deviceNo,
						'baseUnits' => $baseUnits,
						'detailUnits' => $detailUnits,
						'mainPart' => $mainPart,
						'supervisionUnits' => $supervisionUnits,
						'baseUnitsCode' => $baseUnitsCode,
						'detailUnitsCode' => $detailUnitsCode,
						'mainPartCode' => $mainPartCode,
						'supervisionUnitsCode' => $supervisionUnitsCode,
						'remarks' => $remarks 
				) );
				$flag = $proxy->updateDevice ( $device );
				echo $flag;
			}
		}
	}
	public function judgefirstNo() {
		$firstNo = isset ( $_POST ['firstNo'] ) ? $_POST ['firstNo'] : '';
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '-1';
		if ($firstNo != '') {
			$proxy = $this->exec ( "getProxy", "device" );
			$result = $proxy->judgefirstNo ( $firstNo ,$id);
			echo $result;
		}
	}
	public function judgeSecondNo() {
		$firstNo = isset ( $_POST ['firstNo'] ) ? $_POST ['firstNo'] : '';
		$secondNo = isset ( $_POST ['secondNo'] ) ? $_POST ['secondNo'] : '';
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '-1';
		if ($firstNo != '' && $secondNo != '') {
			$proxy = $this->exec ( "getProxy", "device" );
			$result = $proxy->judgeSecondNo ( $firstNo, $secondNo,$id );
			echo $result;
		}
	}
	public function judgeDeviceName() {
		$deviceName = isset ( $_POST ['deviceName'] ) ? $_POST ['deviceName'] : '';
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '-1';
		$param = array(
			'deviceName'=>$deviceName,
			'id'=>$id
		);
		if ($deviceName != '') {
			$proxy = $this->exec ( "getProxy", "device" );
			$result = $proxy->judgeDeviceName ( json_encode($param));
			echo $result;
		}
	}
	public function isExistDevice() {
		$pId = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$param = array('pId'=>$pId);
		if ($pId != '') {
			$proxy = $this->exec ( "getProxy", "device" );
			$result = $proxy->isExistDevice ( json_encode($param));
			echo $result;
		}
	}
	
}