<?php
/**
 * 文件专业代码模块
 * @author dengguoqi
 *
 */
class ESEngineeringAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	/**
	 * 获取文件专业代码列表
	 */
	public function findEngineeringList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$participatoryId = isset ( $_GET ['participatoryId'] ) ? $_GET ['participatoryId'] : '0';
		$selectType = isset ( $_GET ['selectType'] ) ? $_GET ['selectType'] : 'checkbox';
		$keyWord = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$proxy = $this->exec ( "getProxy", "engineering" );
		$count = $proxy->getCount ( json_encode ( array (
				'participatoryId' => $participatoryId,
				'keyWord' => $keyWord 
		) ) );
		$list = $proxy->getDataList ( $page, $rp, json_encode ( array (
				'participatoryId' => $participatoryId,
				'keyWord' => $keyWord 
		) ) );
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array () 
		);
		$start = ($page - 1) * $rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $engineering ) {
				$engineering->num = $start + 1;
				$engineering->ids = "<input type='".$selectType."' class='".$selectType."' typeNo='" . $engineering->typeNo . "' typeName='" . $engineering->typeName . "' name=\"checkName\" value='" . $engineering->id . "' id=\"checkName\">";
				$engineering->operate = "<span class='editbtn' id='" . $engineering->id . "'> </span>";
				$result ["rows"] [] = array (
						"id" => $engineering->id,
						"cell" => $engineering 
				);
				$start ++;
			}
		}
		
		echo json_encode ( $result );
	}
	/**
	 * 添加文件专业代码
	 */
	public function addEngineering() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$typeName = isset ( $param ['typeName'] ) ? $param ['typeName'] : '';
			$typeNo = isset ( $param ['typeNo'] ) ? $param ['typeNo'] : '';
			$participatoryId = isset ( $param ['participatoryId'] ) ? $param ['participatoryId'] : '';
			if ($typeName != '' && $typeNo != '' && $participatoryId != '') {
				$proxy = $this->exec ( "getProxy", "engineering" );
				$data = json_encode ( array (
						'ip' => $ip,
						'userId' => $userId,
						'typeName' => $typeName,
						'typeNo' => $typeNo,
						'participatoryId' => $participatoryId 
				) );
				$result = $proxy->addData ( $data );
			}
			echo json_encode ( $result );
		}
	}
	/**
	 * 编辑文件专业代码
	 */
	public function edit() {
		if (isset ( $_POST ['id'] )) {
			$proxy = $this->exec ( "getProxy", "engineering" );
			$id = $_POST ['id'];
			$data = ( array ) $proxy->getData ( $id );
			return $this->renderTemplate ( $data );
		}
	}
	/**
	 * 更新文件专业代码
	 */
	public function updateEngineering() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if (isset ( $param ['id'] )) {
			$typeName = isset ( $param ['typeName'] ) ? $param ['typeName'] : '';
			$typeNo = isset ( $param ['typeNo'] ) ? $param ['typeNo'] : '';
			if ($typeName != '' && $typeNo != '') {
				$proxy = $this->exec ( "getProxy", "engineering" );
				$data = array (
						'ip' => $ip,
						'userId' => $userId,
						'id' => $param ['id'],
						'typeName' => $typeName,
						'typeNo' => $typeNo 
				);
				$flag = $proxy->updateData ( json_encode ( $data ) );
				echo $flag;
			}
		}
	}
	/**
	 * 删除文件专业代码
	 */
	public function deleteEngineering() {
		$param = $_POST;
		if ($param) {
			$ids = isset ( $param ['ids'] ) ? $param ['ids'] : '';
			$flag = false;
			if ($ids != '') {
				$proxy = $this->exec ( "getProxy", "engineering" );
				$flag = $proxy->deleteData ( json_encode ( explode ( ',', $ids ) ) );
			}
			echo json_encode ( $flag );
		}
	}
	
	/**
	 * 验证文件专业代码唯一性
	 */
	public function uniqueTypeNo() {
		$typeNo = isset ( $_POST ['typeNo'] ) ? $_POST ['typeNo'] : '';
		$participatoryId = isset ( $_POST ['participatoryId'] ) ? $_POST ['participatoryId'] : '';
		if ($typeNo != '' && $participatoryId != '') {
			$proxy= $this->exec ( "getProxy", 'engineering' );
			echo $proxy->uniqueTypeNo ( json_encode(array (
					'typeNo' => $typeNo,
					'participatoryId' => $participatoryId
			)) );
		}
	}
}
