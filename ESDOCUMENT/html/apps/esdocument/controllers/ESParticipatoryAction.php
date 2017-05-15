<?php
/**
 * 参加单位部门模块
 * @author dengguoqi
 *
 */
class ESParticipatoryAction extends ESActionBase {
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
	 * 获取树目录
	 */
	public function getTree() {
		$pId = isset ( $_GET ['pId'] ) ? $_GET ['pId'] : '';
		$unitstype = isset ( $_GET ['unitstype'] ) ? $_GET ['unitstype'] : '0';
		$where = '';
		if ($unitstype == 1 || $unitstype == 2) {
			$where = "  type='设计单位' or type is null ";
		} else if ($unitstype == 3) {
			$where = "  type='监理单位' or type is null ";
		} else if ($unitstype == 4) {
			$where = '';
		}
		$param = array(
				'pId' => $pId,
				'where' => $where
		);
		$participatory = $this->exec ( "getProxy", "participatory" );
		$tree = $participatory->getAllParticipatory ( json_encode($param));
		if (count ( $tree ) > 0) {
			$tree [0]->open = true;
		}
		echo json_encode ( $tree );
	}
	
	/**
	 * 根据树节点，筛选条件，分页加载列表
	 */
	public function findPartList() {
		$pId = isset ( $_GET ['id'] ) ? $_GET ['id'] : '0';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		if ($pId != '') {
			if (! isset ( $condition ['condition'] )) {
				$condition ['condition'] = null;
			}
			$participatory = $this->exec ( "getProxy", "participatory" );
			$total = $participatory->getCount ( $pId, $condition ['condition'] );
			$cells = $participatory->getParticipatoryList ( $page, $rp, $pId, $condition ['condition'] );
			echo json_encode ( $this->setResult ( $page, $rp, $total, $cells ) );
		}
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
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'id'=>$cell->id,
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox" >',
					'operate' => '<span class="editbtn" pId="' . $cell->pId . '"> </span>',
					'name' => $cell->name,
					'code' => $cell->code,
					'type' => $cell->type,
					'user_id' => $cell->user_id 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 确认添加
	 *
	 * @return string
	 */
	public function confirmAdd() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$part = array ();
			$part ['ip'] = $ip;
			$part ['userId'] = $userId;
			$part ['pId'] = isset ( $param ['selTreeId'] ) ? $param ['selTreeId'] : '';
			$part ['name'] = isset ( $param ['partName'] ) ? $param ['partName'] : '';
			$part ['code'] = isset ( $param ['partCode'] ) ? $param ['partCode'] : '';
			$part ['type'] = isset ( $param ['partType'] ) ? $param ['partType'] : '';
			$part ['level'] = isset ( $param ['level'] ) ? intval ( $param ['level'] ) + 1 : '';
			$part ['user_id'] = isset ( $param ['controler'] ) ? $param ['controler'] : '';
			if ($part ['pId'] != '' && $part ['name'] != '' && $part ['code'] != '' && $part ['type'] != '' && $part ['user_id'] != '') {
				$participatory = $this->exec ( "getProxy", "participatory" );
				echo json_encode ( $participatory->addParticipatory ( json_encode ( $part ) ) );
			}
		}
	}
	
	/**
	 * 修改页面
	 */
	public function edit() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$result = array ();
		if ($id != '') {
			// 通过id获取要修改的单条数据
			$participatory = $this->exec ( "getProxy", "participatory" );
			$result = $participatory->getParticipatoryById ( $id );
			if (count ( $result ) > 0) {
				$result = array (
						'name' => $result->name,
						'code' => $result->code,
						'type' => $result->type,
						'level' => $result->level,
						'user_id' => $result->user_id 
				);
			}
		}
		return $this->renderTemplate ( $result );
	}
	
	/**
	 * 确认修改
	 */
	public function confirmEdit() {
		$param = $_POST;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		if ($param) {
			$part = array ();
			$part ['ip'] = $ip;
			$part ['userId'] = $userId;
			$part ['id'] = isset ( $param ['id'] ) ? $param ['id'] : '';
			$part ['pid'] = isset ( $param ['pid'] ) ? $param ['pid'] : '';
			$part ['name'] = isset ( $param ['partName'] ) ? $param ['partName'] : '';
			$part ['code'] = isset ( $param ['partCode'] ) ? $param ['partCode'] : '';
			$part ['type'] = isset ( $param ['partType'] ) ? $param ['partType'] : '';
			$part ['level'] = isset ( $param ['level'] ) ? $param ['level'] : '';
			$part ['user_id'] = isset ( $param ['controler'] ) ? $param ['controler'] : '';
			$mes = array ();
			if ($part ['id'] != '' && $part ['pid'] != '') {
				$participatory = $this->exec ( "getProxy", "participatory" );
				$mes = $participatory->updateParticipatory ( json_encode ( $part ) );
			}
			echo $mes;
		}
	}
	
	/**
	 * 确认删除
	 */
	public function confirmDel() {
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		$mes = array ();
		if ($ids != '') {
			$participatory = $this->exec ( "getProxy", "participatory" );
			$mes = $participatory->deleteParticipatory ( json_encode ( $ids ) );
		}
		echo $mes;
	}
	
	/**
	 * 加载文控人员列表
	 */
	public function findControlerList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$param ['keyWord'] = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$participatory = $this->exec ( "getProxy", "participatory" );
		$param ['start'] = ($page - 1) * $rp;
		$param ['limit'] = $rp;
		$mp = $participatory->findUserList ( $param );
		$total = $mp->total;
		$cells = $mp->users;
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total,
				'rows' => $rows 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			if ($cell->userStatus == 1) {
				$row ['id'] = $cell->id;
				$row ['cell'] = array (
						'num' => $line,
						'ids' => '<input type="checkbox"  class="checkbox">',
						'operate' => '<span class="editbtn" ></span>',
						'id' => $cell->id,
						'userid' => $cell->userid,
						'name' => $cell->empName,
						'emailAddress' => $cell->emailAddress,
						'mobtel' => $cell->mobTel 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}else{
				$total = $total - 1;
			}
		}
		$result ['rows'] = $rows;
		$result ['total'] = $total;
		echo json_encode ( $result );
	}
	
	/**
	 * 单位部门代码唯一验证
	 */
	public function uniqueCode() {
		$code = isset ( $_POST ['code'] ) ? $_POST ['code'] : '';
		if ($code != '') {
			$part = $this->exec ( "getProxy", 'participatory' );
			echo $part->uniqueCode ( $code );
		}
	}
	
	/**
	 * 总条数
	 *
	 * @param unknown $pId        	
	 */
	public function count() {
		$part = $this->exec ( "getProxy", 'participatory' );
		echo $part->getCount ();
	}
	
	/**
	 * 验证参建单位名称唯一性
	 */
	public function uniqueName() {
		$name = isset ( $_POST ['name'] ) ? $_POST ['name'] : '';
		$pId = isset ( $_POST ['pId'] ) ? $_POST ['pId'] : '';
		$level = isset ( $_POST ['level'] ) ? $_POST ['level'] : '';
		if ($name != '' && $pId != '' && $level != '') {
			$part = $this->exec ( "getProxy", 'participatory' );
			echo $part->uniqueName ( array (
					'name' => $name,
					'pId' => $pId,
					'level' => $level 
			) );
		}
	}
	
	/**
	 * 渲染添加部门员工页面
	 */
	public function addMember() {
		$partId = isset ( $_POST ['partId'] ) ? $_POST ['partId'] : '';
		$partName = isset ( $_POST ['partName'] ) ? $_POST ['partName'] : '';
		return $this->renderTemplate ( array (
				'partId' => $partId,
				'partName' => $partName 
		) );
	}
	
	/**
	 * 渲染编辑部门员工页面
	 */
	public function editMember() {
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$partName = isset ( $_POST ['partName'] ) ? $_POST ['partName'] : '';
		$part = $this->exec ( "getProxy", 'participatory' );
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param = array(
			'id'=>$id,
			'userId'=>$userId,
			'ip'=>$ip
		);
		$member =(array)$part->getMemberById(json_encode($param));
		$role = $this->exec ( "getProxy", 'role' );
		$user=array();
		if($member){
		$user = $role->getUserByid($member['userId']);
		$member['userName'] = $user->userid;
		}
		$member['partName'] = $partName;
		return $this->renderTemplate ( array (
				'member'=>$member
		) );
	}
	
	/**
	 * 添加部门员工
	 */
	public function confirmAddMember() {
		$partId = isset ( $_POST ['partId'] ) ? $_POST ['partId'] : '';
		$userId = isset ( $_POST ['userId'] ) ? $_POST ['userId'] : '';
		$office = isset ( $_POST ['office'] ) ? $_POST ['office'] : '';
		if ($partId != '' && $userId != '' && $office != '') {
			$part = $this->exec ( "getProxy", 'participatory' );
			echo $part->addMember ( $partId, $userId, $office );
		}
	}
	/**
	 * xiewenda 20150504 修改部门员工
	 */
	public function confirmEditMember() {
		$param = $_POST;
		$participatory = $this->exec ( "getProxy", "participatory" );
		$result = $participatory->editMember(json_encode($param));
		echo $result;
	}
	
	/**
	 * 获取部门员工列表
	 */
	public function findPartMemberList() {
		$partId = isset ( $_GET ['id'] ) ? $_GET ['id'] : '0';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$condition = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		if ($partId != '') {
			if (! isset ( $condition ['condition'] )) {
				$condition ['condition'] = null;
			}
			$participatory = $this->exec ( "getProxy", "participatory" );
			$total = $participatory->getMemberCount ( $partId, $condition ['condition'] );
			$cells = $participatory->getMemberList ( $page, $rp, $partId, $condition ['condition'] );
			echo json_encode ( $this->setMemberResult ( $page, $rp, $total, $cells ) );
		}
	}
	
	/**
	 * 设置部门员工结果集
	 *
	 * @return multitype:unknown multitype:
	 */
	public function setMemberResult($page, $rp, $total, $cells) {
		$rows = array ();
		$result = array (
				'page' => $page,
				'total' => $total 
		);
		$line = ($page - 1) * $rp + 1;
		foreach ( $cells as $cell ) {
			$row ['id'] = $cell->id;
			$row ['cell'] = array (
					'num' => $line,
					'ids' => '<input type="checkbox"  class="checkbox">',
					'operate' => '<span class="editMember" id="'.$cell->dataId.'"></span>',
					'id' => $cell->id,
					'partId' => $cell->partId,
					'userid' => $cell->userid,
					'name' => $cell->empName,
					'emailAddress' => $cell->emailAddress,
					'mobtel' => $cell->mobTel,
					'office' => ($cell->office == '1') ? '领导' : (($cell->office == '2') ? '高级工程师' :(($cell->office == '3') ? '文控人员':'普通员工')) 
			);
			array_push ( $rows, $row );
			$line = $line + 1;
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 删除单位员工
	 */
	public function confirmDelMember() {
		$partId = isset ( $_POST ['partId'] ) ? $_POST ['partId'] : '';
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		if ($partId != '' && $ids != '') {
			$part = $this->exec ( "getProxy", 'participatory' );
			echo $part->confirmDelMember ( $partId, $ids );
		}
	}
	
	/**
	 * 渲染筛选页面
	 * 
	 * @return string
	 */
	public function filter() {
		$flag = isset ( $_GET ['flag'] ) ? $_GET ['flag'] : '';
		return $this->renderTemplate ( array (
				'flag' => $flag 
		) );
	}
	
	/**
	 * 判断该部门下是否存在用户
	 */
	public function isExistUsers(){
		$partId = isset ( $_POST ['partId'] ) ? $_POST ['partId'] : '';
		if ($partId != '') {
			$part = $this->exec ( "getProxy", 'participatory' );
			echo $part->isExistUsers ( json_encode(array('partId'=>$partId )));
		}
	}
}
