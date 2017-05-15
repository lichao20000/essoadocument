<?php
/**
 * 角色模块
 * @author dengguoqi
 *
 */
class ESStatisticsAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1 
		) );
	}
	public function findStatisticList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$Proxy = $this->exec ( "getProxy", 'statistic' );
		$condition ['page'] = ($page - 1) * $rp;
		$condition ['pre'] = $rp;
		$total = $Proxy->getCount ();
		$rows = $Proxy->getStatisticByCondition ( json_encode ( $condition ) );
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
							"id" => $row->id,
							"startNum" => $startNum,
							"ids" => "<input type=\"checkbox\" class=\"checkbox\"  name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
							"statisticName" => $row->statisticName,
							"exec" => ($row->isComplete == 1) ? "<span title='执行方案' class='printbtn' printId=\"$row->id\"></span>" : "未完成",
							"operate" => "<span title='编辑方案' class='editbtn'> </span>",
							"del" => "<span title='删除方案' class='delbtn' delId=\"$row->id\" > </span>",
							"view" => "<span title='查看方案' class='showbtn' showId=\"$row->id\" > </span>",
							"statisticType" => "<span name='" . $row->statisticType . "'>" . (($row->statisticType == '1') ? '分组' : '数据节点') . "</span>" 
					) 
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 *
	 * @author wangtao
	 *         获取树节点
	 *        
	 */
	public function getTree() {
		$request = $this->getRequest ();
		$id = $request->getGet ( 'id' ); // 获取当前业务的状态
		$treeType = $request->getGet ( 'treeType' );
		$tree = null;
		if ($treeType == 1) {
			$proxy = $this->exec ( "getProxy", "documentStage" );
			$tree = $proxy->getTree ();
		} else if ($treeType == 2) {
			$participatory = $this->exec ( "getProxy", "participatory" );
			$param = array(
					'pId' => '',
					'where' => ''
			);
			$tree = $participatory->getAllParticipatory ( json_encode($param) );
		} else if ($treeType == 3) {
			$proxy = $this->exec ( "getProxy", "device" );
			$tree = $proxy->getTree ();
		}
		
		if ($id != - 1) {
			$statisticProxy = $this->exec ( 'getProxy', 'statistic' );
			$statistic = $statisticProxy->getStatisticById ( $id );
			$nodeType = $statistic->treeType;
			if ($treeType == $nodeType) {
				$statisticProxy = $this->exec ( 'getProxy', 'statistic' );
				$data = $statisticProxy->getStatisticShowData ( $id ); // 返回方案
				foreach ( $tree as $val ) {
					foreach ( $data as $value ) {
						if ($value->c0->id == $val->id) {
							$val->checked = true;
							$val->open = true;
						}
					}
				}
			}
		}
		// 树根节点总是打开的
		if ($tree != null)
			$tree [0]->open = true;
		echo json_encode ( $tree );
	}
	public function getDataList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$start = ($page - 1) * $rp;
		$proxy = $this->exec ( 'getProxy', 'escloud_collectionws' );
		$userId = $this->getUser ()->getId ();
		$rows = $proxy->getDataList ( $start, $rp, $userId );
		$jsonData = array (
				'page' => $page,
				'total' => $rows->count,
				'rows' => array () 
		);
		foreach ( $rows->dataList as $row ) {
			$entry = array (
					'id' => $row->id,
					'cell' => array (
							'num' => $start + 1,
							"ids" => '<input type="checkbox" name="cbx"  class="cbx" value="' . $row->id . '">',
							'title' => $row->collname,
							'execute' => ($row->isComplete) ? '<span title="执行方案" class="printbtn" onclick=exeCollection("' . $row->id . '") >&nbsp;</span>' : '未完成',
							'modify' => '<span title="编辑方案" class="editbtn" onclick=modifyCollection(' . $row->id . ',"' . $row->collname . '") >&nbsp;</span>',
							'delete' => '<span title="删除方案" class="delbtn" onclick=delCollection(' . $row->id . ') >&nbsp;</span>',
							'show' => '<span title="查看方案" class="showbtn" onclick=showCollection("' . $row->id . '") >&nbsp;</span>' 
					) 
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	/**
	 *
	 * @author wangtao
	 *         添加页面
	 */
	public function modify() {
		$request = $this->getRequest ();
		$id = $request->getPost ( 'id' );
		$name = $request->getPost ( 'name' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$statistic = $proxy->getStatisticById ( $id );
		$treeType = $statistic->treeType;
		return $this->renderTemplate ( array (
				'name' => $name,
				'id' => $id,
				'treeType' => $treeType 
		), 'ESStatistics/add' );
	}
	/**
	 *
	 * @author xiewenda
	 *         保存方案名称(统计方案第一步)
	 */
	public function saveTitle() {
		$request = $this->getRequest ();
		$title = $request->getPost ( 'title' );
		$oldTitle = $request->getPost ( 'oldTitle' );
		$type = $request->getPost ( 'type' );
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		if (! $title && $title != 0)
			return;
		$id = $request->getPost ( 'id' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$param = array(
				'userId'=>$userId,
				'ip'=>$ip,		
				'id'=>$id,
				'title'=>$title,
				'oldTitle'=>$oldTitle,
				'type'=>$type
		);
		$result = $proxy->saveTitle (json_encode($param));
		echo json_encode ( $result );
	}
	/**
	 *
	 * @author xiewenda
	 *         保存树节点(统计方案第二步)
	 * @return bool
	 */
	public function saveTreeNodes() {
		 $userId=$this->getUser()->getId();
		 $ip = $this->getClientIp();
		$request = $this->getRequest ();
		$nodes = $request->getPost ( 'data' );
		$id = intval ( $request->getPost ( 'id' ) );
		$title = $request->getPost ( 'title' );
		$nodeType = intval ( $request->getPost ( 'treeType' ) );
		$param =array(
			'userId'=>$userId,
			'ip'=>$ip,
			'id'=>$id,
			'nodes'=>$nodes,
			'title'=>$title,
			'nodeType'=>$nodeType
		);
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->saveTreeNodes ( json_encode($param)); // 返回方案的ID
		echo $result;
	}
	
	// 设置统计方案的列数
	public function saveColTitleAndColCount() {
		// $userId=$this->getUser()->getId();
		$request = $this->getRequest ();
		$data = $request->getPost ( 'data' );
		$id = $data ['id'];
		$colCount = $data ['count'];
		$colTitle = $data ['title'];
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$param ['id'] = $id;
		$param ['colCount'] = $colCount;
		$param ['colTitle'] = $colTitle;
		$result = $proxy->saveColTitleAndColCount ( json_encode ( $param ) );
		echo $result;
	}
	/**
	 *
	 * @author xiewenda
	 *         获取方案详细列表(统计方案第三步)
	 * @return mixed
	 */
	public function getStatisticItems() {
		$request = $this->getRequest ();
		$id = $request->getPost ( 'id' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$data = $proxy->getStatisticShowData ( $id ); // 返回方案的ID
		$data = json_decode ( json_encode ( $data ), true );
		$arr = array ();
		foreach ( $data as $value ) {
			foreach ( $value as $key => $val ) {
				array_push ( $arr, $key );
			}
		}
		$str = max ( array_unique ( $arr ) );
		$count = substr ( $str, 1, strlen ( $str ) );
		$item = $proxy->getStatisticById ( $id );
		$result ['data'] = $data;
		$result ['count'] = $count;
		$result ['classNode'] = $item->classNode;
		$result ['dataNode'] = $item->dataNode;
		$result ['isSummary'] = $item->isSummary;
		$result ['isLayout'] = $item->isLayout;
		$result ['pic'] = $item->pic;
		if ($item->colTitle)
			$result ['head'] = explode ( ';', $item->colTitle );
		echo json_encode ( $result );
	}
	
	/*
	 * 规则设置
	 */
	public function setRules() {
		$request = $this->getRequest ();
		$treeId = $request->getGet ( 'treeId' );
		$itemId = $request->getGet ( 'itemId' );
		$treeType = $request->getGet ( 'treeType' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		// 得到字段集合
		$fieldList = $proxy->getFieldListByTreeIdAndTreeType ( intval ( $treeId ), intval ( $treeType ) );
		// 得到节点信息
		$nodeInfo = $proxy->getTreeNodeByTreeIdAndTreeType ( intval ( $treeId ), intval ( $treeType ) );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$item = null;
		if ($itemId != - 1) {
			$item = $proxy->getStatisticItemById ( $itemId );
		}
		return $this->renderTemplate ( array (
				'nodeInfo' => $nodeInfo,
				'list' => $fieldList,
				'treeId' => $treeId,
				'treeType' => $treeType,
				'itemId' => $itemId,
				'collItem' => $item 
		) );
	}
	/*
	 * 条件设置
	 */
	public function setCondition() {
		$request = $this->getRequest ();
		$treeId = $request->getGet ( 'treeId' );
		$itemId = $request->getGet ( 'itemId' );
		$treeType = $request->getGet ( 'treeType' );
		$trlength = isset ( $_GET ["trlength"] ) ? $_GET ["trlength"] : 6;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		// 得到字段集合
		$fieldList = $proxy->getFieldListByTreeIdAndTreeType ( intval ( $treeId ), intval ( $treeType ) );
		$array = array ();
		return $this->renderTemplate ( array (
				'list' => $fieldList,
				'string' => json_encode ( $array ),
				'itemId' => $itemId,
				'trlength' => $trlength 
		) );
	}
	/*
	 * 保存规则
	 */
	public function saveRules() {
		$request = $this->getRequest ();
		$data = $request->getPost ( 'data' );
		$ip = $this->getClientIp ();
		$userId = $this->getUser ()->getId ();
		$data ['ip'] = $ip;
		$data ['userId'] = $userId;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		if (! empty ( $data ['condition'] )) {
			$temp = rtrim ( $data ['condition'], '@' );
			$data ['condition'] = $temp;
		}
		$result = $proxy->saveStatisticItemRules ( json_encode ( $data ) );
		echo $result;
	}
	
	// 保存设置统计项配置
	public function saveOptions() {
		$ip = $this->getClientIp ();
		$userId = $this->getUser ()->getId ();
		$request = $this->getRequest ();
		$data = $request->getPost ( 'data' );
		$data ['ip'] = $ip;
		$data ['userId'] = $userId;
		$names = $request->getPost ( 'names' );
		$list = explode ( '|', $names );
		$dats = array ();
		foreach ( $list as $key => $val ) {
			if (! empty ( $val ) && $val != 'undefined') {
				$dats [] = $val;
			}
		}
		$dataString = implode ( ",", $dats );
		if ($dataString == '') {
			$dataString = '无';
		}
		$dataStrings = '布局设置:' . $dataString;
		$data ['dataOptions'] = $dataStrings;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->saveOptions ( json_encode ( $data ) );
		echo $result;
	}
	/**
	 * 删除统计方案
	 */
	public function delStatisticAndItems() {
		// $userId=$this->getUser()->getId();
		$request = $this->getRequest ();
		$id = $request->getPost ( 'id' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->delStatisticAndItems ( $id );
		echo $result;
	}
	
	// 执行生成excel操作
	public function exeStatistic() {
		$request = $this->getRequest ();
		$id = $request->getPost ( 'id' );
		$ip = $this->getClientIp ();
		$userId = $this->getUser ()->getId ();
		$version = $request->getPost ( 'version' );
		$statisticType = $request->getPost ( 'statisticType' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$param = array (
				'ip' => $ip,
				'userId' => $userId,
				'id' => $id,
				'version' => $version 
		);
		$result = array ();
		if ($statisticType == "0") {
			$result = $proxy->exeStatistic ( json_encode ( $param ) );
		}
		if ($statisticType == "1") {
			$result = $proxy->exeGroupStatistic ( json_encode ( $param ) );
		}
		echo json_encode ( $result );
	}
	/**
	 *
	 * @author wangtao
	 *         修改当前步骤
	 *        
	 */
	public function changeCollCurrStep() {
		$request = $this->getRequest ();
		$data = $request->getGet ();
		$collId = intval ( $data ['id'] ); // 方案ID
		$currStep = intval ( $data ['currStep'] ) + 1; // 当前步骤
		$proxy = $this->exec ( 'getProxy', 'escloud_collectionws' );
		$proxy->changeCollCurrStep ( $collId, $currStep );
	}
	
	// 移除一列
	public function delColumnByColNo() {
		$request = $this->getRequest ();
		$data = $request->getGet ();
		$id = $data ['id']; // 方案ID
		$colNo = $data ['colNo']; // 列号
		$colTitle = $data ['title']; // 标题
		$param ['id'] = $id;
		$param ['colNo'] = $colNo;
		$param ['colTitle'] = $colTitle;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->delColumnByColNo ( json_encode ( $param ) );
		echo $result;
	}
	// 移除一列
	public function deleteCheckColumn() {
		$request = $this->getRequest ();
		$data = $request->getGet ();
		$id = $data ['id']; // 方案ID
		$colNo = $data ['colNo']; // 列号
		$colTitle = $data ['title']; // 标题
		$param ['id'] = $id;
		$param ['colNo'] = $colNo;
		$param ['colTitle'] = $colTitle;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->deleteCheckColumn ( json_encode ( $param ) );
		echo $result;
	}
	
	// 查看面板
	public function show() {
		$request = $this->getRequest ();
		$id = $request->getGet ( 'id' );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$data = $proxy->getStatisticShowData ( $id );
		$items = $proxy->getStatisticById ( $id ); // 返回方案的ID
		$count = 0;
		if (count ( $data ) > 0) {
			$data = json_decode ( json_encode ( $data ), true );
			$arr = array ();
			foreach ( $data as $value ) {
				foreach ( $value as $key => $val ) {
					array_push ( $arr, $key );
				}
			}
			$str = max ( array_unique ( $arr ) );
			$count = substr ( $str, 1, strlen ( $str ) );
		}
		
		$result ['data'] = $data;
		$result ['count'] = $count;
		
		return $this->renderTemplate ( array (
				'result' => $result,
				'items' => $items 
		) );
	}
	
	/**
	 * 下载
	 */
	public function fileDown() {
		$fileUrl = $_GET ['fileUrl'];
		$filName = basename ( $fileUrl );
		Header ( "Content-type: application/octet-stream" );
		Header ( "Accept-Ranges: bytes" );
		Header ( "Content-Disposition: attachment; filename=" . $filName );
		if ($fileUrl) {
			return readfile ( $fileUrl );
		}
	}
	// 批量删除
	public function batchDelete() {
		$ids = $_POST ['ids'];
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->batchDelete ( $ids );
		echo $result;
	}
	
	/**
	 * 更新分类节点、数据节点、缩进
	 */
	public function updateOption() {
		$id = $_POST ['id'];
		$dataNode = $_POST ['dataNode'];
		$classNode = $_POST ['classNode'];
		$isLayout = $_POST ['isLayout'];
		$ip = $this->getClientIp ();
		$userId = $this->getUser ()->getId ();
		$param = json_encode ( array (
				'id' => $id,
				'dataNode' => $dataNode,
				'classNode' => $classNode,
				'isLayout' => $isLayout,
				'userId' => $userId,
				'ip' => $ip 
		) );
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		$result = $proxy->updateOption ( $param );
		echo $result;
	}
	
	/**
	 * 获取分组下拉列表选项
	 */
	public function getGroupOptions() {
		$stageId = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : 0;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		echo json_encode ( $proxy->getGroupOptions ( $stageId ) );
	}
	
	/**
	 * 渲染分组添加页面
	 *
	 * @return string
	 */
	public function addGroup() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$name = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		return $this->renderTemplate ( array (
				'id' => $id,
				'name' => $name 
		) );
	}
	
	/**
	 * 获取分组对象
	 */
	public function getStatisticsGroups() {
		$statistics_id = isset ( $_POST ['statistics_id'] ) ? $_POST ['statistics_id'] : 0;
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		echo json_encode ( $proxy->getStatisticsGroups ( $statistics_id ) );
	}
	
	/**
	 * 保存分组收集节点id
	 */
	public function saveGroupStageId() {
		$group ['statisticsId'] = isset ( $_POST ['statisticsId'] ) ? $_POST ['statisticsId'] : 0;
		$group ['stageId'] = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$group ['ip'] = $this->getClientIp ();
		$group ['userId'] = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'statistic' );
		echo $proxy->saveGroupStageId ( json_encode ( $group ) );
	}
	
	/**
	 * 保存分组对象
	 */
	public function saveGroup() {
		$group ['statisticsId'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$group ['stageId'] = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$group ['groups'] = isset ( $_POST ['groups'] ) ? $_POST ['groups'] : '';
		$group ['havings'] = isset ( $_POST ['havings'] ) ? $_POST ['havings'] : '';
		$group ['ip'] = $this->getClientIp ();
		$group ['userId'] = $this->getUser ()->getId ();
		if ($group ['statisticsId'] != '' && $group ['stageId'] != '' && $group ['groups']) {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			echo $proxy->saveGroup ( json_encode ( $group ) );
		}
	}
	
	/**
	 * 获取统计字段
	 */
	public function getStatisticsFields() {
		$field ['statistic_id'] = isset ( $_POST ['statistics_id'] ) ? $_POST ['statistics_id'] : '';
		$field ['tree_id'] = isset ( $_POST ['tree_id'] ) ? $_POST ['tree_id'] : '';
		if ($field ['statistic_id'] != '' && $field ['tree_id'] != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			$group = $proxy->getStatisticsGroups ( $field ['statistic_id'] );
			echo json_encode ( array (
					'fields' => $proxy->getStatisticsFields ( json_encode ( $field ) ),
					'wheres' => $group->wheres 
			) );
		}
	}
	
	/**
	 * 保存统计字段
	 */
	public function saveFields() {
		$field ['statisticsId'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$field ['stageId'] = isset ( $_POST ['stageId'] ) ? $_POST ['stageId'] : '';
		$field ['fields'] = isset ( $_POST ['fields'] ) ? $_POST ['fields'] : '';
		$field ['wheres'] = isset ( $_POST ['wheres'] ) ? $_POST ['wheres'] : '';
		$field ['ip'] = $this->getClientIp ();
		$field ['userId'] = $this->getUser ()->getId ();
		if ($field ['statisticsId'] != '' && $field ['stageId'] != '' && $field ['fields'] != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			echo $proxy->saveFields ( json_encode ( $field ) );
		}
	}
	
	/**
	 * 获取统计字段编辑列表
	 */
	public function getStatisticsEditFields() {
		$field ['statistic_id'] = isset ( $_GET ['statistic_id'] ) ? $_GET ['statistic_id'] : '';
		$field ['tree_id'] = isset ( $_GET ['tree_id'] ) ? $_GET ['tree_id'] : '';
		if ($field ['statistic_id'] != '' && $field ['tree_id'] != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			$dataList = $proxy->getStatisticsEditFields ( json_encode ( $field ) );
			$jsonData = array (
					'page' => 1,
					'total' => 1,
					'rows' => array () 
			);
			$start = 0;
			foreach ( $dataList as $row ) {
				$entry = array (
						'id' => $row->id,
						'cell' => array (
								'num' => $start + 1,
								"colNo" => $row->colNo,
								'colName' => $row->name,
								'ruleField' => $row->ruleField,
								'title' => isset ( $row->title ) ? $row->title : '',
								'ruleMethod' => $row->ruleMethod,
								'collIdentifier' => $row->collIdentifier 
						) 
				);
				$jsonData ['rows'] [] = $entry;
				$start ++;
			}
			echo json_encode ( $jsonData );
		}
	}
	
	/**
	 * 修改统计字段统计规则
	 */
	public function updateStatisticsFieldCount() {
		$itemCount ['id'] = isset ( $_POST ['itemId'] ) ? $_POST ['itemId'] : '';
		$itemCount ['ruleMethod'] = isset ( $_POST ['ruleMethod'] ) ? $_POST ['ruleMethod'] : '';
		$itemCount ['collIdentifier'] = isset ( $_POST ['collIdentifier'] ) ? $_POST ['collIdentifier'] : '';
		if ($itemCount ['id'] != '' && $itemCount ['ruleMethod'] != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			echo $proxy->updateStatisticsFieldCount ( json_encode ( $itemCount ) );
		}
	}
	
	/**
	 * 分组统计完成
	 */
	public function groupOver() {
		$over ['id'] = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$over ['isSummary'] = isset ( $_POST ['isSummary'] ) ? $_POST ['isSummary'] : '';
		$over ['pic'] = isset ( $_POST ['pic'] ) ? $_POST ['pic'] : '';
		$over ['ip'] = $this->getClientIp ();
		$over ['userId'] = $this->getUser ()->getId ();
		if ($over ['id'] != '' && $over ['isSummary'] != '' && $over ['pic'] != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			echo $proxy->groupOver ( json_encode ( $over ) );
		}
	}
	
	/**
	 * 通过id获取统计方案
	 */
	public function getStatisticById() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		if ($id != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			echo json_encode ( $proxy->getStatisticById ( $id ) );
		}
	}
	
	/**
	 * 渲染分组布局浏览页面
	 */
	public function clickGroupShow() {
		$field ['statistic_id'] = isset ( $_GET ['statistic_id'] ) ? $_GET ['statistic_id'] : '';
		if ($field ['statistic_id'] != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			$objGroups = $proxy->getStatisticsGroups ( $field ['statistic_id'] );
			$field ['tree_id'] = $objGroups->tree_id;
			$dataList = $proxy->getStatisticsEditFields ( json_encode ( $field ) );
			$allGroups = $proxy->getGroupOptions ( $field ['tree_id'] );
			$arr = explode ( ',', $objGroups->groups );
			$groups = array ();
			for($i = 0; $i < count ( $arr ); $i ++) {
				foreach ( $allGroups as $group ) {
					if ($arr [$i] == $group->code) {
						array_push ( $groups, $group );
					}
				}
			}
			echo json_encode ( array (
					'dataList' => $dataList,
					'groups' => $groups,
					'stageName' => $objGroups->stageName,
					'statisticName' => $objGroups->statisticName 
			) );
		}
	}
	
	/**
	 * 渲染流程分组结构
	 *
	 * @return string
	 */
	public function show1() {
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		if ($id != '') {
			return $this->renderTemplate ( array (
					'id' => $id 
			) );
		}
	}
	
	/**
	 * 修改统计节点
	 */
	public function delStatisticAndGroup() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		if ($id != '') {
			$proxy = $this->exec ( 'getProxy', 'statistic' );
			echo $proxy->delStatisticAndGroup ( $id );
		}
	}
}
