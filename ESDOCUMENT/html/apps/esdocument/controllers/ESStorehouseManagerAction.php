<?php
/**
 * 虚拟3D库房模块
 * @author gengqianfeng
 *
 */
class ESStorehouseManagerAction extends ESActionBase {
	
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
	 * 获取库房列表
	 */
	public function findStorehouse() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		if (! isset ( $condition ['condition'] )) {
			$condition ['condition'] = null;
		}
		$store = $this->exec ( "getProxy", "storehouseManager" );
		$total = $store->getCount ( $condition ['condition'] );
		$cells = $store->findStorehouse ( $page, $rp, $condition ['condition'] );
		echo json_encode ( $this->setResult ( $page, $rp, $total, $cells ) );
	}
	
	/**
	 * 构造库房列表
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
						'num' => $line,
						'ids' => '<input type="checkbox"  class="checkbox" storeId="' . $cell->id . '" >',
						'operate' => '<span class="editbtn"></span>',
						'code' => $cell->code,
						'name' => $cell->name,
						'manager' => $cell->manager,
						'position' => $cell->position,
						'area' => $cell->area,
						'shelf' => $cell->shelf,
						'layer' => $cell->layer,
						'col' => $cell->col,
						'description' => $cell->description 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 确定添加库房
	 */
	public function confirmAdd() {
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		
		$storehouse ['ip'] = $ip;
		$storehouse ['userId'] = $userId;
		$storehouse ['code'] = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		$storehouse ['name'] = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		$storehouse ['manager'] = isset ( $_POST ['manager'] ) ? $_POST ['manager'] : '';
		$storehouse ['position'] = isset ( $_POST ['position'] ) ? $_POST ['position'] : '';
		$storehouse ['area'] = isset ( $_POST ['area'] ) ? $_POST ['area'] : '';
		$storehouse ['shelf'] = isset ( $_POST ['shelf'] ) ? $_POST ['shelf'] : '';
		$storehouse ['layer'] = isset ( $_POST ['layer'] ) ? $_POST ['layer'] : '';
		$storehouse ['col'] = isset ( $_POST ['col'] ) ? $_POST ['col'] : '';
		$storehouse ['description'] = isset ( $_POST ['description'] ) ? $_POST ['description'] : '';
		if ($storehouse ['code'] != '' && $storehouse ['name'] != '' && $storehouse ['manager'] != '' && $storehouse ['position'] != '' && $storehouse ['area'] != '' && $storehouse ['shelf'] != '' && $storehouse ['layer'] != '' && $storehouse ['col'] != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			echo json_encode ( $store->addStorehouse ( $storehouse ) );
		}
	}
	
	/**
	 * 渲染编辑页面
	 *
	 * @return string
	 */
	public function edit() {
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		if ($id != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			return $this->renderTemplate ( array (
					'store' => $store->getStorehouseById ( $id ) 
			) );
		}
	}
	
	/**
	 * 确定编辑库房
	 */
	public function confirmEdit() {
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		
		$storehouse ['ip'] = $ip;
		$storehouse ['userId'] = $userId;
		$storehouse ['id'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$storehouse ['code'] = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		$storehouse ['name'] = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		$storehouse ['manager'] = isset ( $_POST ['manager'] ) ? $_POST ['manager'] : '';
		$storehouse ['position'] = isset ( $_POST ['position'] ) ? $_POST ['position'] : '';
		$storehouse ['area'] = isset ( $_POST ['area'] ) ? $_POST ['area'] : '';
		$storehouse ['shelf'] = isset ( $_POST ['shelf'] ) ? $_POST ['shelf'] : '';
		$storehouse ['layer'] = isset ( $_POST ['layer'] ) ? $_POST ['layer'] : '';
		$storehouse ['col'] = isset ( $_POST ['col'] ) ? $_POST ['col'] : '';
		$storehouse ['description'] = isset ( $_POST ['description'] ) ? $_POST ['description'] : '';
		if ($storehouse ['code'] != '' && $storehouse ['name'] != '' && $storehouse ['manager'] != '' && $storehouse ['position'] != '' && $storehouse ['area'] != '' && $storehouse ['shelf'] != '' && $storehouse ['layer'] != '' && $storehouse ['col'] != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			echo json_encode ( $store->editStorehouse ( $storehouse ) );
		}
	}
	
	/**
	 * 确定删除库房
	 */
	public function confirmDel() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($ids != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			echo json_encode ( $store->deleteStorehouse ( $ids ) );
		}
	}
	
	/**
	 * 渲染库房结构页面
	 *
	 * @return string
	 */
	public function structure() {
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		if ($id != '') {
			return $this->renderTemplate ( array (
					'id' => $id 
			) );
		}
	}
	
	/**
	 * 通过库id获取排架列表
	 */
	public function findStructureByStoreId() {
		$storehouseId = isset ( $_GET ['storehouseId'] ) ? $_GET ['storehouseId'] : '';
		if ($storehouseId != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			$structure = $store->findStructureByStoreId ( $storehouseId );
			if (count ( $structure ) > 0) {
				$structure [0]->open = true;
			}
			echo json_encode ( $structure );
		}
	}
	
	/**
	 * 确定批量添加结构
	 */
	public function confirmBatchAdd() {
		$storehouseId = isset ( $_GET ['storehouseId'] ) ? $_GET ['storehouseId'] : '';
		$shelf = isset ( $_GET ['shelf'] ) ? $_GET ['shelf'] : 0;
		$layer = isset ( $_GET ['layer'] ) ? $_GET ['layer'] : 0;
		$col = isset ( $_GET ['col'] ) ? $_GET ['col'] : 0;
		if ($storehouseId != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			echo $store->confirmBatchAdd ( $storehouseId, $shelf, $layer, $col );
		}
	}
	
	/**
	 * 渲染编辑结构页面
	 *
	 * @return string
	 */
	public function editStructure() {
		$structureId = isset ( $_GET ['structureId'] ) ? $_GET ['structureId'] : '';
		if ($structureId != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			return $this->renderTemplate ( array (
					'structure' => $store->getStructureById ( $structureId ) 
			) );
		}
	}
	
	/**
	 * 确定编辑结构
	 */
	public function confirmEditStructure() {
		$structure ['id'] = isset ( $_GET ['structureId'] ) ? $_GET ['structureId'] : '';
		$structure ['name'] = isset ( $_GET ['name'] ) ? $_GET ['name'] : '';
		$structure ['sort'] = isset ( $_GET ['sort'] ) ? $_GET ['sort'] : '';
		if ($structure ['id'] != '' && $structure ['name'] != '' && $structure ['sort'] != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			echo $store->confirmEditStructure ( $structure );
		}
	}
	
	/**
	 * 确定删除结构
	 */
	public function confirmDelStructure() {
		$structureId = isset ( $_GET ['structureId'] ) ? $_GET ['structureId'] : '';
		if ($structureId != '') {
			$store = $this->exec ( "getProxy", "storehouseManager" );
			echo $store->confirmDelStructure ( $structureId );
		}
	}
	
	/**
	 * 渲染3D库房页面
	 */
	public function store3D() {
		$store = $this->exec ( "getProxy", "storehouseManager" );
		return $this->renderTemplate ( array (
				'status' => 1,
				'list' => $store->findStorehouse ( 1, 1, null ) 
		) );
	}
}