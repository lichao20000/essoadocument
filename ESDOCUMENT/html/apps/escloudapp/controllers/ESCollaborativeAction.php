<?php
/**
 * 个人工作台--我的待办
 * @author ldm
 *
 */
class ESCollaborativeAction extends ESActionBase {
	
	/**
	 * 获取一条待办详细信息
	 * 
	 * @author ldm
	 */
	public function detail() {
		$userId = $this->getUser ()->getId ();
		$userInfo = $this->exec ( "getProxy", "user" )->getUserInfo ( $userId );
		$recordid = isset ( $_GET ['recordid'] ) ? $_GET ['recordid'] : "";
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		if ($recordid == "" || $workid == "")
			return;
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->listTaskBorrowDetail ( $workid, $recordid );
		if ($lists->borrow_base->activity == "submitApply") {
			return $this->renderTemplate ( array (
					'list' => $lists 
			), 'ESCollaborative/application' );
		} else {
			return $this->renderTemplate ( array (
					'list' => $lists,
					'userinfo' => $userInfo 
			) );
		}
	}
	/**
	 * 获取一条已办和已发的详细信息
	 * 
	 * @author ldm
	 */
	public function dodetail() {
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->findTodoDetail ( $workid );
		return $this->renderTemplate ( array (
				'list' => $lists 
		) );
	}
	
	/**
	 * 获取督办详细信息
	 * 
	 * @author niyang
	 *         @date 2013-11-06
	 * @return
	 *
	 */
	public function getInspectTodoDetail() {
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		$proxy = $this->exec ( 'getProxy', 'escloud_usingformws' );
		$lists = $proxy->getInspectTodoDetail ( $workid );
		// echo $lists->title; exit;
		// var_dump((array)$lists);exit;
		// var_dump((array)$lists);die;
		return $this->renderTemplate ( array (
				'lists' => $lists 
		) );
	}
	/**
	 * 领导审批
	 * 
	 * @author niyang
	 * @param
	 *        	appId np046
	 * @param
	 *        	appToken wwwwww
	 * @param
	 *        	taskId 任务ID
	 * @param
	 *        	userId 当前的登陆用户（只有在转审批时传入的是选择人的userId）
	 * @param
	 *        	operation 传入complete
	 * @param
	 *        	localvar 传入false
	 * @return true/false
	 * @return
	 *
	 */
	public function taskInspectOperation() {
		$workflowid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		$taskid = isset ( $_GET ['taskid'] ) ? $_GET ['taskid'] : "";
		$userid = $this->getUser ()->getId ();
		$operation = 'complete';
		$localvar = 'false';
		$proxy = $this->exec ( 'getProxy', 'escloud_usingformws' );
		$res = $proxy->taskInspectOperation ( $taskid, $userid, $operation, $localvar, $workflowid );
		if ($res) {
			$info = array (
					'status' => true,
					'msg' => 'success' 
			);
		} else {
			$info = array (
					'status' => false,
					'msg' => 'error' 
			);
		}
		header ( "Content-type:application/json; charset=utf-8" );
		exit ( json_encode ( $info ) );
	}
	
	/**
	 * 表格数据
	 * 
	 * @author ldm
	 */
	public function get_json() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$sortname = isset ( $_POST ['sortname'] ) ? $_POST ['sortname'] : 'c3';
		$sortorder = isset ( $_POST ['sortorder'] ) ? $_POST ['sortorder'] : 'desc';
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : false;
		$qtype = isset ( $_POST ['qtype'] ) ? $_POST ['qtype'] : false;
		if ($query) {
			$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
			$lists = $proxy->listTaskBorrowDetailPageSize ( $query, ($page - 1) * $rp, $rp );
			if ($lists == "") {
				return;
			}
			$con = count ( $lists );
			if ($con == 0) {
				return;
			}
			$total = $lists [$con - 1]->detail_size;
		}
		// var_dump($lists);exit;
		$results = array ();
		for($i = 0; $i < $con - 1; $i ++) {
			$results [] = json_decode ( json_encode ( $lists [$i] ), true );
		}
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$i = 1;
		foreach ( $results as $row ) {
			/*
			 * $type = explode(',', $row['borrow_type']); $total = count($type); $extra =''; for ($j=0;$j<$total;$j++){ $extra.='<input type="checkbox" class="mytype" checked="checked" name="type" value="'.$type[$j].'" />'.$type[$j]; }
			 */
			$entry = array (
					'id' => $row ['borrow_workflowid'],
					'cell' => array (
							'c3' => $i,
							'c4' => $row ['file_no'],
							'c5' => $row ['file_tm'],
							// 'c6'=>$extra,
							'c6' => $row ['borrow_type'],
							'c7' => $row ['mark'],
							'c8' => $row ['path'] 
					) 
			);
			$i ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	/**
	 * 流程
	 * 
	 * @author ldm
	 */
	public function operate() {
		$taskid = isset ( $_POST ['taskid'] ) ? $_POST ['taskid'] : "";
		$userId = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$operate = isset ( $_POST ['operate'] ) ? $_POST ['operate'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$username = isset ( $_POST ['username'] ) ? $_POST ['username'] : "";
		$nowuse = $_POST ['nowuse'];
		$letin = $_POST ['letin'];
		$workid = $_POST ['workid'];
		$idea = isset ( $_POST ['idea'] ) ? $_POST ['idea'] : "无";
		if ($operate == "转审批") {
			$param = array (
					'opinion_workflowid' => $workid,
					'opinion_desc' => $idea,
					'login_userid' => $userId 
			);
			$param = json_encode ( $param );
			$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
			$lists = $proxy->taskOperationBorrow ( $taskid, $username, $operation, $localvar, $param );
			echo $lists;
			return;
		}
		if ($operate == "退回") {
			$param = array (
					$nowuse => $letin,
					'opinion_workflowid' => $workid,
					'opinion_desc' => $idea 
			);
			$param = json_encode ( $param );
			$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
			$lists = $proxy->taskOperationBorrow ( $taskid, $userId, $operation, $localvar, $param );
			echo $lists;
			return;
		}
		if ($operate == "同意") {
			$param = array (
					'fileClerkConfirm' => $username,
					$nowuse => $letin,
					'opinion_workflowid' => $workid,
					'opinion_desc' => $idea 
			);
			$param = json_encode ( $param );
			$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
			$lists = $proxy->taskOperationBorrow ( $taskid, $userId, $operation, $localvar, $param );
			echo $lists;
			return;
		}
	}
	/**
	 * 第三步同意流程
	 * 
	 * @author ldm
	 */
	public function agree() {
		$taskid = isset ( $_POST ['taskid'] ) ? $_POST ['taskid'] : "";
		$userId = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$nowuse = $_POST ['nowuse'];
		$letin = $_POST ['letin'];
		$workid = $_POST ['workid'];
		$idea = isset ( $_POST ['idea'] ) ? $_POST ['idea'] : "无";
		
		$param = array (
				$nowuse => $letin,
				'opinion_workflowid' => $workid,
				'opinion_desc' => $idea 
		);
		$param = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->taskOperationBorrow ( $taskid, $userId, $operation, $localvar, $param );
		echo $lists;
		return;
	}
	/**
	 * 左侧树数据显示
	 * 
	 * @author ldm
	 */
	public function tree() {
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->findOrgList ( $userId );
		$result = array ();
		foreach ( $lists as $k => $val ) {
			$result [$k] ["name"] = $val->orgNameDisplay;
			$result [$k] ["pId"] = $val->parentOrgCode;
			$result [$k] ["id"] = $val->orgid;
			$result [$k] ["orgclass"] = $val->cuncOrgClass;
			$result [$k] ["isParent"] = true;
		}
		echo json_encode ( $result );
	}
	/**
	 * 左侧树查找子节点
	 * 
	 * @author ldm
	 */
	public function getnode() {
		$id = $_POST ['id'];
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->findSubOrgListByParentid ( $id );
		$result = array ();
		foreach ( $lists as $k => $val ) {
			$result [$k] ["name"] = $val->orgNameDisplay;
			$result [$k] ["pId"] = $val->parentOrgCode;
			$result [$k] ["id"] = $val->orgid;
			$result [$k] ["orgclass"] = $val->cuncOrgClass;
		}
		echo json_encode ( $result );
	}
	/**
	 * 转审批时根据orgid,orgclass,parentorgid查找人员列表信息
	 * 
	 * @author ldm
	 */
	public function user_json() {
		$orgid = isset ( $_GET ['orgid'] ) ? $_GET ['orgid'] : "";
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->findUserListByOrgid ( $orgid );
		$userlist = $lists->userList;
		$total = $lists->size;
		if ($lists == "") {
			return;
		}
		$results = array_slice ( $userlist, ($page - 1) * $rp, $rp );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$i = 1;
		foreach ( $results as $k => $row ) {
			$entry = array (
					'id' => $i,
					'cell' => array (
							'id2' => '<input type="checkbox" name="id2" value=' . $row->userid . '>',
							'c4' => $row->userid,
							'c5' => $row->displayName,
							'c6' => $row->mobTel,
							'c7' => $row->emailAddress,
							'c8' => $row->officeTel 
					) 
			);
			$i ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	/**
	 * 同意时时根据workid查找人员列表信息
	 * 
	 * @author ldm
	 */
	public function agreeuser_json() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : false;
		if (! $query) {
			return;
		}
		$userId = $this->getUser ()->getId ();
		
		$param = array (
				'process_number' => 'borrow',
				'process_param' => 'fileClerkConfirm' 
		);
		$param = json_encode ( $param );
		
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->findRoleUserByOrg ( $userId, $param );
		$userlist = $lists->userList;
		$total = $lists->size;
		if ($lists == "") {
			return;
		}
		$results = array_slice ( $userlist, ($page - 1) * $rp, $rp );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$i = 1;
		foreach ( $results as $k => $row ) {
			$entry = array (
					'id' => $i,
					'cell' => array (
							'id2' => '<input type="checkbox" name="id2" value=' . $row->userid . '>',
							'c4' => $row->userid,
							'c5' => $row->displayName,
							'c6' => $row->mobTel,
							'c7' => $row->emailAddress,
							'c8' => $row->officeTel 
					) 
			);
			$i ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	/**
	 * 退回后提交操作 yzh201307
	 * 
	 * @author @date 2013-06-07 modify
	 */
	public function backopreate() {
		$taskid = isset ( $_POST ['taskid'] ) ? $_POST ['taskid'] : "";
		$workid = isset ( $_POST ['workid'] ) ? $_POST ['workid'] : "";
		$againusername = isset ( $_POST ['againusername'] ) ? $_POST ['againusername'] : "";
		$userId = $this->getUser ()->getId ();
		if (! isset ( $_POST ['borrowData'] ))
			return;
		$borrowData = $_POST ['borrowData'];
		$borrowDataList = explode ( '|', $borrowData );
		$creatime = $_POST ['creatime'];
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$detail = isset ( $_POST ['detail'] ) ? $_POST ['detail'] : "";
		$myform = array (
				'title' => "借阅申请单",
				'jyr_f1' => $borrowDataList [0],
				'lymd_f2' => $borrowDataList [1],
				'dw_f3' => $borrowDataList [2],
				'dh_f4' => $borrowDataList [3],
				'yx_f5' => $borrowDataList [4],
				'jysc_f6' => $borrowDataList [5],
				'jyms_f7' => $borrowDataList [6],
				'create_time' => $creatime,
				'applicant' => $userId 
		);
		$param = array (
				'leaderId' => $againusername,
				'borrow_base' => array (
						$myform 
				),
				'borrow_detail' => $detail,
				'workflowid' => $workid 
		);
		$param = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->taskOperationSubmitBorrow ( $taskid, $userId, $operation, $localvar, $param );
		echo $lists;
	}
	/**
	 * 流程图片显示
	 * 
	 * @author ldm
	 */
	public function imgview() {
		$workid = $_GET ['workid'];
		$proxy = $this->exec ( 'getProxy', 'workflow' );
		$lists = $proxy->getProcessInstanceDiagram ( $workid );
		header ( 'Content-type: image/png' );
		echo $lists;
	}
	/**
	 * 催还借阅单页面显示
	 * 
	 * @author ldm
	 */
	public function getback() {
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		if ($workid == "")
			return;
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->listTaskBorrowIsReturnDetail ( $workid );
		return $this->renderTemplate ( array (
				'list' => $lists,
				'workid' => $workid 
		) );
	}
	/**
	 * 催还借阅单数据处理
	 * 
	 * @author ldm
	 */
	public function doback() {
		$userId = $this->getUser ()->getId ();
		// echo $userId;return;
		$workid = isset ( $_POST ['workid'] ) ? $_POST ['workid'] : "";
		if ($workid == "")
			return false;
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$res = $proxy->getIsReturn ( $userId, $workid );
		echo $res;
	}
	/**
	 * 档案编研--显示编研详细信息
	 * 
	 * @author ldm
	 */
	public function compdetail() {
		$recordid = isset ( $_GET ['recordid'] ) ? $_GET ['recordid'] : "";
		$userId = $this->getUser ()->getId ();
		$userInfo = $this->exec ( "getProxy", "user" )->getUserInfo ( $userId );
		$orgcode = $userInfo->deptEntry->ldapOrgCode;
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		if ($recordid == "" || $workid == "")
			return;
		$proxy = $this->exec ( 'getProxy', 'escloud_researchformws' );
		$lists = $proxy->listTaskDetail ( $workid, $recordid, $orgcode );
		switch ($lists->borrow_base->activity) {
			case "submitApply" :
				return $this->renderTemplate ( array (
						'list' => $lists 
				), 'ESCollaborative/comapplication' );
				break;
			case "releaseApproval" :
				return $this->renderTemplate ( array (
						'list' => $lists 
				), 'ESCollaborative/comdorelease' );
				break;
			case "departmentApproval" :
				return $this->renderTemplate ( array (
						'list' => $lists 
				) );
				break;
			default :
				return $this->renderTemplate ( array (
						'list' => $lists 
				) );
				break;
		}
	}
	/**
	 * 编研流程
	 * 
	 * @author ldm
	 */
	public function compoperate() {
		$taskid = isset ( $_POST ['taskid'] ) ? $_POST ['taskid'] : "";
		$userId = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$operate = isset ( $_POST ['operate'] ) ? $_POST ['operate'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$username = isset ( $_POST ['username'] ) ? $_POST ['username'] : "";
		$nowuse = $_POST ['nowuse'];
		$letin = $_POST ['letin'];
		$workid = $_POST ['workid'];
		$idea = isset ( $_POST ['idea'] ) ? $_POST ['idea'] : "无";
		// echo $taskid,'--',$userId,'--',$operation,'--',$operate,'--',$localvar,'--',$username,'--',$nowuse,'--',$letin,'--',$workid,'--',$idea;
		// return;
		$proxy = $this->exec ( 'getProxy', 'escloud_researchformws' );
		if ($operate == "转审批") {
			$param = array (
					'opinion_workflowid' => $workid,
					'opinion_desc' => $idea,
					'login_userid' => $userId 
			);
			$param = json_encode ( $param );
			$lists = $proxy->taskOperation ( $taskid, $username, $operation, $localvar, $param );
			echo $lists;
			return;
		}
		if ($operate == "退回") {
			$param = array (
					$nowuse => $letin,
					'opinion_workflowid' => $workid,
					'opinion_desc' => $idea 
			);
			$param = json_encode ( $param );
			$lists = $proxy->taskOperation ( $taskid, $userId, $operation, $localvar, $param );
			echo $lists;
			return;
		}
		if ($operate == "同意") {
			$param = array (
					$nowuse => $letin,
					'opinion_workflowid' => $workid,
					'opinion_desc' => $idea 
			);
			$param = json_encode ( $param );
			$lists = $proxy->taskOperation ( $taskid, $userId, $operation, $localvar, $param );
			echo $lists;
			return;
		}
	}
	/**
	 * @yzh 20130730
	 * 编研退回后提交操作
	 * 
	 * @author ldm
	 */
	public function combackopreate() {
		$taskid = isset ( $_POST ['taskid'] ) ? $_POST ['taskid'] : "";
		$workid = isset ( $_POST ['workid'] ) ? $_POST ['workid'] : "";
		$userId = $this->getUser ()->getId ();
		$creatime = $_POST ['creatime'];
		$id = $_POST ['id'];
		$approveUserId = $_POST ['approveUserId'];
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$form = $_POST ['form'];
		parse_str ( $form, $arr );
		$myform = array (
				'title' => "编研申请单",
				'tm' => $arr ['tm'],
				'id' => $id,
				'type' => $arr ['type'],
				'summary' => $arr ['summary'],
				'display_name' => $arr ['createperson'],
				'create_org' => $arr ['createorg'],
				// 'mark'=>$arr['mark'],
				'create_time' => $creatime,
				'applicant' => $userId 
		);
		$param = array (
				'borrow_base' => array (
						$myform 
				),
				'workflowid' => $workid 
		);
		$param = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_researchformws' );
		$lists = $proxy->taskOperationSubmit ( $taskid, $userId, $operation, $localvar, $param, $approveUserId );
		echo $lists;
	}
	/**
	 * 发布调的方法
	 * 
	 * @author ldm
	 */
	public function comreleaseopreate() {
		$taskid = isset ( $_POST ['taskid'] ) ? $_POST ['taskid'] : "";
		$workid = isset ( $_POST ['workid'] ) ? $_POST ['workid'] : "";
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$userId = $this->getUser ()->getId ();
		$id = $_POST ['id'];
		$param = array (
				'id' => $id,
				'opinion_workflowid' => $workid 
		);
		$param = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_researchformws' );
		$lists = $proxy->taskOperation ( $taskid, $userId, $operation, $localvar, $param );
		echo $lists;
	}
	/**
	 * 获取一条编研已办和已发的详细信息
	 * 
	 * @author ldm
	 */
	public function comdodetail() {
		$userId = $this->getUser ()->getId ();
		$user = $this->exec ( 'getProxy', 'user' );
		$info = $user->getUserInfo ( $userId );
		$orgcode = $info->deptEntry->ldapOrgCode;
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		$proxy = $this->exec ( 'getProxy', 'escloud_researchformws' );
		$lists = $proxy->findTodoDetail ( $workid, $orgcode );
		return $this->renderTemplate ( array (
				'list' => $lists 
		) );
	}
	
	/**
	 * 年报1
	 */
	public function yeargetback() {
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		if ($workid == "")
			return;
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$lists = $proxy->listTaskBorrowIsReturnDetail ( $workid );
		return $this->renderTemplate ( array (
				'list' => $lists,
				'workid' => $workid 
		) );
	}
	
	/**
	 * 流程中待办年报和已退回年报页面的渲染
	 * 
	 * @author yzh
	 */
	public function yeardetail() {
		$userId = $this->getUser ()->getId ();
		$userInfo = $this->exec ( "getProxy", "user" )->getUserInfo ( $userId );
		$recordid = isset ( $_GET ['recordid'] ) ? $_GET ['recordid'] : "";
		$workid = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		if ($recordid == "" || $workid == "")
			return;
		$proxy = $this->exec ( 'getProxy', 'escloud_yearnewspaperservice' );
		$lists = $proxy->YearDetail ( $workid, $recordid );
		if ($lists->yearnewspaper_approval->activity == "submitApply") {
			return $this->renderTemplate ( array (
					'list' => $lists 
			), 'ESCollaborative/yearapplication' );
		} else {
			return $this->renderTemplate ( array (
					'list' => $lists,
					'userinfo' => $userInfo 
			) );
		}
	}
	/**
	 * 获取一条年报已办和已发的详细信息
	 * 
	 * @author yzh
	 */
	public function yeardodetail() {
		$workflowInstId = isset ( $_GET ['workid'] ) ? $_GET ['workid'] : "";
		$proxy = $this->exec ( 'getProxy', 'escloud_yearnewspaperservice' );
		$lists = $proxy->findTodoDetail ( $workflowInstId );
		return $this->renderTemplate ( array (
				'list' => $lists 
		) );
	}
	/**
	 * 年报领导审批
	 */
	public function accedeaction() {
		$taskId = isset ( $_POST ['taskId'] ) ? $_POST ['taskId'] : "";
		$userId = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$opinion_workflowid = isset ( $_POST ['opinion_workflowid'] ) ? $_POST ['opinion_workflowid'] : "";
		$opinion_approval = isset ( $_POST ['opinion_approval'] ) ? $_POST ['opinion_approval'] : "";
		$yearnewspaper_id = isset ( $_POST ['yearnewspaper_id'] ) ? $_POST ['yearnewspaper_id'] : "";
		$departmentApprovalResult = isset ( $_POST ['departmentApprovalResult'] ) ? $_POST ['departmentApprovalResult'] : "";
		$param = array (
				'opinion_workflowid' => $opinion_workflowid,
				'opinion_approval' => $opinion_approval,
				'yearnewspaper_id' => $yearnewspaper_id,
				'departmentApprovalResult' => $departmentApprovalResult 
		);
		$vars = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_yearnewspaperservice' );
		echo $result = $proxy->taskOperation ( $taskId, $userId, $operation, $localvar, $vars );
	}
	/**
	 * 年报退回
	 */
	public function untreadaction() {
		$taskId = isset ( $_POST ['taskId'] ) ? $_POST ['taskId'] : "";
		$userId = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$opinion_workflowid = isset ( $_POST ['opinion_workflowid'] ) ? $_POST ['opinion_workflowid'] : "";
		$opinion_approval = isset ( $_POST ['opinion_approval'] ) ? $_POST ['opinion_approval'] : "";
		$yearnewspaper_id = isset ( $_POST ['yearnewspaper_id'] ) ? $_POST ['yearnewspaper_id'] : "";
		$departmentApprovalResult = isset ( $_POST ['departmentApprovalResult'] ) ? $_POST ['departmentApprovalResult'] : "";
		$param = array (
				'opinion_workflowid' => $opinion_workflowid,
				'opinion_approval' => $opinion_approval,
				'yearnewspaper_id' => $yearnewspaper_id,
				'departmentApprovalResult' => $departmentApprovalResult 
		);
		$vars = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_yearnewspaperservice' );
		echo $result = $proxy->taskOperation ( $taskId, $userId, $operation, $localvar, $vars );
	}
	/**
	 * 年报发布
	 */
	public function issueaction() {
		$taskId = isset ( $_POST ['taskId'] ) ? $_POST ['taskId'] : "";
		$userId = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$opinion_workflowid = isset ( $_POST ['opinion_workflowid'] ) ? $_POST ['opinion_workflowid'] : "";
		$opinion_approval = isset ( $_POST ['opinion_approval'] ) ? $_POST ['opinion_approval'] : "";
		$yearnewspaper_id = isset ( $_POST ['yearnewspaper_id'] ) ? $_POST ['yearnewspaper_id'] : "";
		$param = array (
				'opinion_workflowid' => $opinion_workflowid,
				'opinion_approval' => $opinion_approval,
				'yearnewspaper_id' => $yearnewspaper_id 
		);
		$vars = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_yearnewspaperservice' );
		echo $result = $proxy->taskOperation ( $taskId, $userId, $operation, $localvar, $vars );
	}
	/**
	 * 转审批
	 */
	public function changeaction() {
		$taskId = isset ( $_POST ['taskId'] ) ? $_POST ['taskId'] : "";
		$login_userid = $this->getUser ()->getId ();
		$operation = isset ( $_POST ['operation'] ) ? $_POST ['operation'] : "";
		$localvar = isset ( $_POST ['localvar'] ) ? $_POST ['localvar'] : "";
		$opinion_workflowid = isset ( $_POST ['opinion_workflowid'] ) ? $_POST ['opinion_workflowid'] : "";
		$opinion_approval = isset ( $_POST ['opinion_approval'] ) ? $_POST ['opinion_approval'] : "";
		$yearnewspaper_id = isset ( $_POST ['yearnewspaper_id'] ) ? $_POST ['yearnewspaper_id'] : "";
		$departmentApprovalResult = isset ( $_POST ['departmentApprovalResult'] ) ? $_POST ['departmentApprovalResult'] : "";
		$userId = isset ( $_POST ['login_userid'] ) ? $_POST ['login_userid'] : "";
		$param = array (
				'opinion_workflowid' => $opinion_workflowid,
				'opinion_approval' => $opinion_approval,
				'yearnewspaper_id' => $yearnewspaper_id,
				'login_userid' => $login_userid 
		);
		$vars = json_encode ( $param );
		$proxy = $this->exec ( 'getProxy', 'escloud_yearnewspaperservice' );
		echo $result = $proxy->taskOperation ( $taskId, $userId, $operation, $localvar, $vars );
	}
	
	/*
	 * 方吉祥 2013/1/29 档案销毁-鉴定流程,销毁流程 根据流程id查询审批单数据 template = destory|identify
	 */
	public function flowsheet_form() {
		$workId = $_POST ['workId'];
		$taskId = $_POST ['taskId'];
		$template = $_POST ['template'];
		$proxy = $this->exec ( 'getProxy', 'escloud_identificationws' );
		
		if ($taskId) { // 待办
			
			$userId = $this->getUser ()->getId ();
			$result = $proxy->findTaskDetail ( $workId, $taskId, $userId, $template );
			$data ['formMap'] = $result->formMap;
			$data ['opinionList'] = $result->opinionList;
			$data ['otherMap'] = $result->otherMap;
			$data ['iscomplete'] = $result->iscomplete;
		} else { // 已发已办
			
			$result = $proxy->findForm ( $workId, $template );
			$data ['formMap'] = $result->formMap;
			$data ['opinionList'] = $result->opinionList;
			$template = 'des_readonly';
			$data ['iscomplete'] = $result->iscomplete;
		}
		// print_r($result); die;
		return $this->renderTemplate ( $data, 'ESCollaborative/' . $template );
	}
	
	/*
	 * 方吉祥 2013/1/29 档案销毁-鉴定流程 保存鉴定小组人员信息
	 */
	public function SaveUserGroup() {
		// print_r($_POST); die;
		$formId = $_POST ['formId'];
		$workId = $_POST ['workId'];
		if (empty ( $_POST ['users'] )) {
			$users = array ();
		} else {
			$users = explode ( ',', $_POST ['users'] );
		}
		$zz = explode ( '@', $_POST ['zz'] );
		// print_r($users); die;
		
		$key = array (
				'userid',
				'name',
				'organName',
				'post',
				'contact',
				'organid' 
		);
		$datalist = array ();
		
		foreach ( $zz as $iii => $cd ) {
			$datalist [0] [$key [$iii]] = $cd;
			$datalist [0] ['iszz'] = 'true';
		}
		// print_r($datalist); die;
		// print_r($users);die;
		if (empty ( $users ) === FALSE) {
			foreach ( $users as $i => $user ) {
				$u = explode ( '@', $user );
				foreach ( $u as $ii => $cc ) {
					$datalist [$i + 1] [$key [$ii]] = $cc;
					$datalist [$i + 1] ['iszz'] = 'false';
				}
			}
		}
		// print_r($datalist); die;
		
		$group = array (
				'identification_id' => $formId,
				'datalist' => $datalist,
				'workflow_id' => $workId 
		);
		
		$proxy = $this->exec ( 'getProxy', 'escloud_identificationws' );
		$isok = $proxy->saveUserGroup ( json_encode ( $group ) );
		// print_r($isok);
		echo $isok;
	}
	
	/*
	 * 方吉祥 2013/1/29 档案销毁-鉴定流程 下一流程 operation 同意或拒绝传入complete 转审批传入 delegate localvar 只有转审批operation=delegate时传入true 其他传入false departmentApprovalResult/fileClerkApprovalResult(同意拒绝需要传入的参数，转审批不许传入) opinion_desc 审批意见描述 who 最终审批人
	 */
	public function TaskOperationIdentification() {
		$userId = $this->getUser ()->getId ();
		$taskId = $_POST ['taskId'];
		$workId = $_POST ['workId'];
		$formId = $_POST ['formId'];
		$difference = $_POST ['difference'];
		$agree = $_POST ['agree']; // Approve|Reject
		if (isset ( $_POST ['who'] ))
			$who = $_POST ['who']; // 下一个审批人
		$node = $_POST ['node']; // 走到哪个节点
		$desc = $_POST ['desc']; // 审批意见描述
		
		$operation = $agree == 'Approve' || $agree == 'Reject' ? 'complete' : 'delegate';
		
		$localvar = $operation == 'delegate' ? 'true' : 'false';
		
		// /*
		$params = array (
				'opinion_workflowid' => $workId,
				'opinion_desc' => $desc,
				'login_userid' => $userId,
				'id' => $formId,
				$node . 'Result' => $agree,
				'difference' => $difference 
		);
		// */
		if ($agree == 'Approve') {
			if ($node == 'fileDepartmentApproval') { // 部门领导
				
				$params ['jointSignLeader'] = $who;
			} else if ($node == 'jointSignApproval') { // 会签
				$params ['fileSliceLeader'] = $who;
			}
		}
		
		$proxy = $this->exec ( 'getProxy', 'escloud_identificationws' );
		$result = $proxy->taskOperationIdentification ( $taskId, $userId, $operation, $localvar, json_encode ( $params ) );
		// print_r($result); die;
		echo $result;
	}
	
	/**
	 * 获取鉴定待办列表
	 * 
	 * @author fangjixiang 20130311
	 * @param
	 *        	start 分页开始位置
	 * @param
	 *        	size 每页显示数量
	 * @param
	 *        	sort 排序
	 * @param
	 *        	order 排序方式
	 * @param
	 *        	map
	 * @return
	 *
	 */
	public function listTasksIdentification() {
		$start = isset ( $_POST ['page'] ) ? $_POST ['page'] : 0;
		$size = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		// $proxy = $this->exec('getProxy','escloud_workflowws');
		$userId = $this->getUser ()->getId ();
		$params = array (
				"assignee" => $userId,
				"candidate" => null,
				"candidateGroup" => null,
				'workflowDefKey' => $_GET ['workflowDefKey'] 
		);
		
		$proxy = $this->exec ( 'getProxy', 'escloud_identificationws' );
		$result = $proxy->listTasksIdentification ( $start - 1, $size, 'id', 'desc', json_encode ( $params ) );
		$jsonData = array (
				'page' => $start,
				'total' => $result->total,
				'rows' => array () 
		);
		// print_r($result); die;
		
		foreach ( $result->list as $line => $row ) {
			
			$todo_person = $row->todo_person ? $row->todo_person : 'undefined';
			$title = $row->title ? $row->title : 'undefined';
			$display_name = $row->display_name ? $row->display_name : 'undefined';
			$workflowid = $row->workflowid ? $row->workflowid : 'undefined';
			$create_time = $row->create_time ? $row->create_time : 'undefined';
			$task_id = $row->task_id ? $row->task_id : 'undefined';
			$todo = $row->todo ? $row->todo : 'undefined';
			$difference = $row->difference ? $row->difference : 'undefined';
			
			if ($difference == 'identify') {
				$type = 'jianding';
			} else if ($difference == 'destroy') {
				$type = 'xiaohui';
			}
			
			$entry = array (
					'id' => $line + 1,
					'cell' => array (
							// 'c2'=>$todo_person,
							'c3' => $title,
							'c4' => $display_name,
							'c5' => $workflowid,
							'c6' => $create_time,
							'c7' => '<span class="showdetail" workid="' . $workflowid . '" dostate="' . $todo . '" taskid="' . $task_id . '" type="' . $type . '">&nbsp;</span>' 
					) 
			);
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 * 查看信息发布流程的待办列表
	 * 
	 * @param
	 *        	appId np046
	 * @param
	 *        	appToken wwwwww
	 * @param
	 *        	author fangjixiang
	 * @param
	 *        	start 0
	 * @param
	 *        	size 100
	 * @param
	 *        	sort id
	 * @param
	 *        	order asc
	 * @param
	 *        	map (传入参数"assignee":"yangqianya","candidate":"null","candidateGroup":"null","workflowDefKey":"np046_publishProcess")
	 * @return
	 *
	 */
	public function GetPublishHaveToDo() {
		$start = isset ( $_POST ['page'] ) ? $_POST ['page'] : 0;
		$size = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		// $proxy = $this->exec('getProxy','escloud_workflowws');
		$userId = $this->getUser ()->getId ();
		$params = array (
				"assignee" => $userId,
				"candidate" => null,
				"candidateGroup" => null,
				'workflowDefKey' => 'publishProcess' 
		);
		
		$proxy = $this->exec ( 'getProxy', 'escloud_publishws' );
		$result = $proxy->getPublishHaveToDo ( $start - 1, $size, 'id', 'desc', json_encode ( $params ) );
		$jsonData = array (
				'page' => $start,
				'total' => $result->total,
				'rows' => array () 
		);
		// print_r($result); die;
		
		foreach ( $result->list as $line => $row ) {
			
			$todo_person = isset ( $row->todo_person ) ? $row->todo_person : 'undefined';
			$title = isset ( $row->title ) ? $row->title : 'undefined';
			$display_name = isset ( $row->display_name ) ? $row->display_name : 'undefined';
			$workflowid = isset ( $row->workflowid ) ? $row->workflowid : 'undefined';
			$create_time = isset ( $row->create_time ) ? $row->create_time : 'undefined';
			$task_id = isset ( $row->task_id ) ? $row->task_id : 'undefined';
			$todo = isset ( $row->todo ) ? $row->todo : 'undefined';
			$boardType = isset ( $row->boardType ) ? $row->boardType : 'undefined';
			$boardId = isset ( $row->boardId ) ? $row->boardId : 'undefined';
			$topicId = isset ( $row->id ) ? $row->id : 'undefined';
			$extId = $boardId . ',' . $topicId . ',' . $boardType;
			$entry = array (
					'id' => $line + 1,
					'cell' => array (
							// 'c2'=>$todo_person,
							'c3' => $title,
							'c4' => $display_name,
							'c5' => $workflowid,
							'c6' => $create_time,
							'c7' => '<span class="showdetail" id="' . $extId . '" workid="' . $workflowid . '" dostate="' . $todo . '" taskid="' . $task_id . '" type="publish">&nbsp;</span>' 
					) 
			);
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	/*
	 * 信息发布流程表单 方吉祥 20130313
	 */
	public function publish() {
		$id ['workId'] = $_POST ['workId'];
		$id ['taskId'] = $_POST ['taskId'];
		$id ['userId'] = $this->getUser ()->getId ();
		$extId = explode ( ',', $_POST ['extId'] ); // 1,149,1
		
		$boardId = $extId [0];
		$topicId = $extId [1];
		$boardType = $extId [2];
		
		$id ['boardType'] = $boardType;
		$proxy = $this->exec ( "getProxy", "escloud_publishws" );
		$result = $proxy->getPublishToDoDetail ( $boardId, $topicId, '3' );
		/*
		 * echo '<pre>'; print_r($result); echo '</pre>';die; //
		 */
		return $this->renderTemplate ( array (
				'data' => $result,
				'id' => $id 
		) );
	}
	
	/**
	 * 信息发布流程 领导审批
	 * 
	 * @param
	 *        	appId np046
	 * @param
	 *        	appToken wwwwww
	 * @param
	 *        	taskId 任务ID
	 * @param
	 *        	userId 当前的登陆用户（只有在转审批时传入的是选择人的userId）
	 * @param
	 *        	operation 同意或拒绝传入complete 转审批传入 delegate
	 * @param
	 *        	localvar （只有转审批operation=delegate时传入true 其他传入false）
	 * @param
	 *        	vars （传入fileClerkConfirm(下一节点审批人，转审批时不许传入)
	 *        	departmentApprovalResult (同意拒绝需要传入的参数，转审批不许传入)
	 *        	opinion_workflowid(流程ID) opinion_desc(审批意见描述),boardid (模块的id) topicid(这条数据的id)）
	 * @return true/false
	 */
	public function LeadershipApproval() {
		$taskId = $_POST ['taskId'];
		$workId = $_POST ['workId'];
		$agree = $_POST ['agree'];
		$desc = $_POST ['desc'];
		$boardId = $_POST ['boardId'];
		$topicId = $_POST ['topicId'];
		
		$operation = $agree == 'Approve' || $agree == 'Reject' ? 'complete' : 'delegate';
		$localvar = $operation == 'delegate' ? 'true' : 'false';
		$userId = $this->getUser ()->getId ();
		
		$vars = array (
				'fileClerkConfirm' => 'null',
				'departmentApprovalResult' => $agree,
				'opinion_workflowid' => $workId,
				'opinion_desc' => $desc,
				'boardid' => $boardId,
				'topicid' => $topicId 
		)
		;
		// echo $taskId.'--'.$userId.'--'.$operation.'--'.$localvar;
		// print_r($vars);die;
		$proxy = $this->exec ( "getProxy", "escloud_publishws" );
		$isok = $proxy->LeadershipApproval ( $taskId, $userId, $operation, $localvar, json_encode ( $vars ) );
		echo $isok;
	}
	
	/**
	 * 在次发起流程
	 * 
	 * @author fangjixiang 20130315
	 * @param
	 *        	appId
	 * @param
	 *        	appToken
	 * @param
	 *        	taskId
	 * @param
	 *        	userId
	 * @param
	 *        	operation complete
	 * @param
	 *        	localvar false
	 * @param
	 *        	workflowId
	 * @param
	 *        	status
	 * @param
	 *        	publishid
	 * @return
	 *
	 */
	public function AginStartstartInfoPublishFlow() {
		$userId = $this->getUser ()->getId ();
		$taskId = $_POST ['taskId'];
		$workId = $_POST ['workId'];
		$topicId = $_POST ['topicId'];
		$status = $_POST ['status'];
		$agree = $_POST ['agree'];
		$leaderId = $_POST ['leader'];
		$operation = $agree == 'Approve' || $agree == 'Reject' ? 'complete' : 'delegate';
		$localvar = $operation == 'delegate' ? 'true' : 'false';
		
		$proxy = $this->exec ( "getProxy", "escloud_publishws" );
		$isok = $proxy->aginStartstartInfoPublishFlow ( $taskId, $userId, $operation, $localvar, $workId, $status, $topicId, $leaderId );
		echo $isok;
	}
	
	/*
	 * 20130730 方吉祥 2013/1/29 销毁,鉴定流程再次提交 operation 同意或拒绝传入complete 转审批传入 delegate localvar 只有转审批operation=delegate时传入true 其他传入false departmentApprovalResult/fileClerkApprovalResult(同意拒绝需要传入的参数，转审批不许传入)
	 */
	public function StartProcessAgain() {
		$userId = $this->getUser ()->getId ();
		$taskId = $_POST ['taskId'];
		$workId = $_POST ['workId'];
		$formId = $_POST ['formId'];
		$approveUserId = $_POST ['approveUserId'];
		$agree = $_POST ['agree']; // Approve|Reject
		$difference = $_POST ['difference']; // 走到哪个节点
		
		$operation = $agree == 'Approve' || $agree == 'Reject' ? 'complete' : 'delegate';
		$localvar = $operation == 'delegate' ? 'true' : 'false';
		
		$params = array (
				'workflowid' => $workId,
				'identification_id' => $formId,
				'difference' => $difference 
		);
		
		$proxy = $this->exec ( 'getProxy', 'escloud_identificationws' );
		$isok = $proxy->startProcessAgain ( $taskId, $userId, $operation, $localvar, json_encode ( $params ), $approveUserId );
		
		echo $isok;
	}
	
	/*
	 * 获取待办,已发,已办数据 author: fangjixiang date: 20130528
	 */
	public function ListTasksArchiveAndFindListTodo() {
		$userId = $this->getUser ()->getId ();
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$limit = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$offset = ($page - 1) * $limit + 1;
		$parent = isset ( $_GET ['parent'] ) ? $_GET ['parent'] : 'todo'; // 父类型
		$child = isset ( $_GET ['child'] ) ? $_GET ['child'] : 'all'; // 子类型
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		// die($limit);
		if ($parent === 'todo') { // 待办
			$sort = 'id';
			$order = 'desc';
			$param = array (
					'assignee' => $userId,
					'candidate' => 'null',
					'candidateGroup' => 'null',
					'bianyan_workflowDefKey' => 'fileResearchProcess',
					'nianbao_workflowDefKey' => 'fileYearReportProcess',
					'jianding_workflowDefKey' => 'AppraisalApplyProcess',
					'xiaohui_workflowDefKey' => 'DestoryApplyProcess',
					'workflowDefKey' => 'borrowApplyProcess',
					'publish_workflowDefKey' => 'publishProcess',
					'nianjian_workflowDefKey' => 'fileInspectProcess' 
			);
			
			$result = $proxy->listTasksArchive ( $offset - 1, $limit - 1, $sort, $order, $child, json_encode ( $param ) );
		} else { // 已发已办
			
			$result = $proxy->findListTodo ( $userId, $parent, $child, ($page - 1), $limit - 1 );
		}
		// print_r($result); die($parent.'----'.$child);
		
		$total = @$result [count ( $result ) - 1]->size;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		foreach ( $result as $base ) {
			$title = @$base->title;
			$name = @$base->display_name;
			$date = @$base->create_time;
			$dostate = @$base->todo;
			$type = @$base->workflow_type;
			$workId = @$base->workflowid;
			$taskId = @$base->task_id; // 已发,已办为undefined
			$formId = @$base->formId; // 鉴定销毁
			$extId = ',,'; // init
			if ($type == 'publish') { // 信息发布
				
				$boardId = @$base->boardId;
				$id = @$base->id;
				$boardType = @$base->boardType;
				$extId = $boardId . ',' . $id . ',' . $boardType;
			}
			if ($type == 'jieyue' && $dostate == 'no_handle' && $taskId == '') {
				$taskId = 'getBack';
			}
			if (! $title || ! $workId) {
				continue;
			}
			$entry = array (
					'id' => '',
					'cell' => array (
							'opens' => '<span class="opens" formid="' . $formId . '" id="' . $extId . '" workid="' . $workId . '" dostate="' . $dostate . '" taskid="' . $taskId . '" type="' . $type . '"></span>',
							'title' => $title,
							'name' => $name,
							'workid' => $workId,
							'date' => $date 
					) 
			);
			
			$jsonData ['rows'] [] = $entry;
		} // foreach is end //
		  // print_r($jsonData);
		echo json_encode ( $jsonData );
	} // 获取已发,已办数据结束
	
	/**
	 * guolanrui 20140528 获取
	 */
	public function getCollaborativeDataList() {
		$userId = $this->getUser ()->getId();
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$limit = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$offset = ($page - 1) * $limit;
		$parent = isset ( $_GET ['parent'] ) ? $_GET ['parent'] : 'todo'; // 父类型
		$child = isset ( $_GET ['child'] ) ? $_GET ['child'] : 'all'; // 子类型
		$serarchKeyword = isset ( $_GET ['serarchKeyword'] ) ? $_GET ['serarchKeyword'] : '';
		$params = "start=" . $offset . "&limit=" . $limit . "&userId=" . ($this->getUser ()->getId ()) . "&parent=" . $parent . "&child=" . $child . "&serarchKeyword=" . $serarchKeyword;
		$params = $params.'&remoteAddr='.$this->getClientIp();
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$resultData = $proxy->getCollaborativeDataList ( $postData );
		
		$total = $resultData->size;
		$result = $resultData->formList;
		
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		foreach ( $result as $base ) {
// 			$open = @$base->open;
			$userFormNo = @$base->userFormNo;
			$id = @$base->id;
			$userId = @$base->userId;
			$formId = @$base->formId;
			$wfId = @$base->wfId;
			$stepId = @$base->stepId;
			$title = @$base->title;
			$isDealed = @$base->isDealed;
			$start_time = @$base->start_time;
			$dataId = @$base->dataId;
			$firstStepId = @$base->firstStepId;
			$workFlowType = @$base->workFlowType;
			$wfState = @$base->wfState;
			$isSelf = @$base->isSelf;
			$isLast = @$base->isLast;
			$entry = array (
					'id' => '',
					'cell' => array (
							"ids"=>'<input type="checkbox" name="userFormId" value="'.$id.'">',
							'open' => '<span class="opens" userFormNo="' . $userFormNo . '" id="' . $id . '" userId="' . $userId . '" formId="' . $formId . '" wfId="' . $wfId . '" stepId="' . $stepId . '" isDealed="' . $isDealed . '" dataId="' . $dataId . '" workFlowType="' . $workFlowType . '" isLast="' . $isLast . '" wfState="' . $wfState . '" title="' . $title . '"></span>',
							'userFormNo' => $userFormNo,
							'id' => $id,
							'userId' => $userId,
							'formId' => $formId,
							'wfId' => $wfId,
							'stepId' => $stepId,
							'title' => $title,
							'isDealed' => $isDealed,
							'start_time' => $start_time,
							'dataId' => $dataId,
							'firstStepId' => $firstStepId,
							'workFlowType' => $workFlowType,
							'isSelf' => $isSelf,
							'isLast' => $isLast,
							'wfState' => $wfState 
					) 
			);
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	
	//获取我的待办对应表单
	public function getManageredWorkflow(){
		
		$isDealed = isset ( $_POST ['isDealed'] ) ? $_POST ['isDealed'] : false;
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$wfId = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$stepId = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$userId = isset ( $_POST ['userId'] ) ? $_POST ['userId'] : '';
		$workFlowType = isset ( $_POST ['workFlowType'] ) ? $_POST ['workFlowType'] : '';
		
		$params = "isDealed=" . $isDealed . "&formId=" . $formId . "&wfId=" . $wfId . "&stepId=" . $stepId . "&userId=" . $userId . "&workFlowType=" . $workFlowType;
		
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$resultData = $proxy->getManageredWorkflow ( $postData );
		echo $resultData;
	}
	
	/**
	 * 查看待发的工作流信息
	 * @author longjunhao 20140616
	 */
	public function getSavedWorkflow(){
		$data['id'] = $_POST['id'];
		$data['formId'] = $_POST['formId'];
		$data['wfId'] = $_POST['wfId'];
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] = $this->getUser()->getBigOrgId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->getSavedWorkflow($postData);
		echo $result;
	}
	
	/**
	 *  流程发起方法
	 *  @author longjunhao 20140617
	 */
	public function startSavedWorkflow(){
		$params = $_POST['postData'];
		$params = $params.'&formId='.$_POST['formId']
		.'&id='.$_POST['id']
		.'&wfId='.$_POST['wfId']
		.'&wfModelId='.$_POST['wfModelId']
		.'&actionId='.$_POST['actionId']
		.'&dataList='.$_POST['dataList']
		.'&filePaths='.$_POST['filePaths']
		.'&fileNames='.$_POST['fileNames']
		.'&dataHaveRight='.$_POST['dataHaveRight']
		.'&selectUsers='.$_POST['selectUsers']
		.'&condition='.$_POST['condition']
		.'&applyDateCount='.$_POST['applyDateCount']
		.'&readRight='.$_POST['readRight']
		.'&downLoadRight='.$_POST['downLoadRight']
		.'&printRight='.$_POST['printRight']
		.'&lendRight='.$_POST['lendRight']
		.'&userId='.$this->getUser()->getId()
		.'&bigOrgId='.$this->getUser()->getBigOrgId()
		.'&remoteAddr='.$this->getClientIp();
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->startSavedWorkflow($postData);
		echo $result;
	}
	
	/** 
	 * 保存待发方法 
	 * @author longjunhao 20140617
	 */
	public function saveOldWorkflow(){
		$params = $_POST['postData'];
		$params = $params.'&formId='.$_POST['formId']
// 			.'&wfModelId='.$_POST['wfModelId']
			.'&actionId='.$_POST['actionId']
			.'&filePaths='.$_POST['filePaths']
			.'&dataList='.$_POST['dataList']
			.'&fileNames='.$_POST['fileNames']
			.'&dataHaveRight='.$_POST['dataHaveRight']
			.'&id='.$_POST['id']
			.'&userId='.$this->getUser()->getId()
			.'&bigOrgId='.$this->getUser()->getBigOrgId()
			.'&remoteAddr='.$this->getClientIp();
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->saveOldWorkflow($postData);
		echo json_encode($result);
	}
	
	/**
	 * 获取已办表单信息
	 * @author longjunhao 20140620
	 */
	public function getHaveTodoWorkflow() {
		$data['formId'] = $_POST['formId'];
		$data['wfId'] = $_POST['wfId'];
		$data['stepId'] = $_POST['stepId'];
		$data['isLast'] = $_POST['isLast'];
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] = $this->getUser()->getBigOrgId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->getHaveTodoWorkflow($postData);
		echo $result;
	}
	
	/**
	 * 保存待批方法
	 * @author longjunhao 20140619
	 */
	public function wfSaveNotExcuteManager(){
		$params = $_POST['postData'];
		$params = $params.'&formId='.$_POST['formId']
			.'&filePaths='.$_POST['filePaths']
			.'&dataList='.$_POST['dataList']
			.'&fileNames='.$_POST['fileNames']
			.'&dataHaveRight='.$_POST['dataHaveRight']
			.'&wfId='.$_POST['wfId']
			.'&userId='.$this->getUser()->getId()
			.'&bigOrgId='.$this->getUser()->getBigOrgId()
			.'&remoteAddr='.$this->getClientIp();
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->wfSaveNotExcuteManager($postData);
		echo json_encode($result);
	}
	
	/**
	 * 获取数据附件列表
	 * @author longjunhao 20140623
	 */
	public function getSavedWfDataList() {
		$data['dataId'] = $_GET['dataId'];
		$data['formId'] = $_GET['formId'];
		$data['wfId'] = $_GET['wfId'];
		$data['thisName'] = isset($_GET['thisName'])?$_GET['thisName']:'';
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] = $this->getUser()->getBigOrgId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		
		$proxy = $this->exec("getProxy", "escloud_workflowws");
		$returnData = $proxy->getSavedWfDataList($postData);
		$total = $returnData->pageInfo;
		$rows = $returnData->data;
// 		$dataList = $returnData->dataList;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$isRead='<input type="checkbox" name="isReadChk" id="" value="'.$row->pkgPath.'||"/>';
			$isDownload='<input type="checkbox" name="isDownloadChk" id="" value="'.$row->pkgPath.'||"/>';
			$isPrint='<input type="checkbox" name="isPrintChk" id="" value="'.$row->pkgPath.'||"/>';
			$useEntity='<input type="checkbox" name="useEntityChk" id="" value="'.$row->pkgPath.'||"/>';
			if(isset($row->FileRead)?$row->FileRead:false){
				$isRead='<input type="checkbox" name="isReadChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			if(isset($row->FileDownLoad)?$row->FileDownLoad:false){
				$isDownload='<input type="checkbox" name="isDownloadChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			if(isset($row->FilePrint)?$row->FilePrint:false){
				$isPrint='<input type="checkbox" name="isPrintChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			if(isset($row->FileLend)?$row->FileLend:false){
				$useEntity='<input type="checkbox" name="useEntityChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
				
			$entry = array(
					"cell"=>array(
							'num'=>$start,
							'id3'=>'<input type="checkbox" name="id3" id="" value="'.$row->pkgPath.'||'.$row->id.'"/>',
							'handle'=>$row->showpkg,//TODO 换成图标，绑定一个path,点击这个图标可以浏览当前这条数据的详细信息
							'title'=>$row->dataName,//数据的TITLE
							'documentFlag'=>isset($row->documentFlag)?$row->documentFlag :'0',
							'isRead'=>$isRead,
							'readDate'=>isset($row->FileReadTimeControl)?$row->FileReadTimeControl:'0',
							'isDownload'=>$isDownload,
							'downloadDate'=>isset($row->FileDownLoadTimeControl)?$row->FileDownLoadTimeControl:'0',
							'isPrint'=>$isPrint,
							'printDate'=>isset($row->FilePrintTimeControl)?$row->FilePrintTimeControl:'0',
							'useEntity'=>$useEntity,
							'pkgPath'=>$row->pkgPath//数据的PATH
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 添加数据附件到数据库
	 * @author longjunhao 20140624
	 */
	public function addDataDetail() {
		$data['wfId'] = $_POST['wfId'];
		$data['dataId'] = $_POST['dataId'];
		$data['checkPaths'] = $_POST['checkPaths'];
		$data['stepId'] = isset($_POST['stepId'])?$_POST['stepId']:'';
		$data['searchDataType'] = isset($_POST['searchDataType'])?$_POST['searchDataType']:'';
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] = $this->getUser()->getBigOrgId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->addDataDetail($postData);
		echo $result;
	}
	
	/**
	 * 删除数据附件 数据库
	 * @author longjunhao 20140624
	 */
	public function deleteDataDetail() {
		$data['checkIds'] = $_POST['checkIds'];
		$data['checkPaths'] = $_POST['checkPaths'];
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] = $this->getUser()->getBigOrgId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->deleteDataDetail($postData);
		echo $result;
	}
	
	/**
	 * 工作流打印表单
	 * @author longjunhao 20140625
	 */
	public function workFlowPrint(){
		$data['wfId'] = $_POST['wfId'];
		$data['formId'] = $_POST['formId'];
		$data['modelId'] = $_POST['modelId'];
		$data['stepId'] = isset($_POST['stepId'])?$_POST['stepId']:'';
		$data['userFormNo'] = $_POST['userFormNo'];
		$data['printForm'] = $_POST['printForm'];
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] = $this->getUser()->getBigOrgId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->workFlowPrint($postData);
		echo $result;
	}
	
	
	/**
	 * 查询所有待办的总数
	 * 
	 * **/
	public function listWorkFlowAll(){
		$userId = $this->getUser ()->getId();
		$params = "userId=" . $userId;
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		$resultCount = $proxy->listWorkFlowAll( $postData );
		echo $resultCount;
	}
	
	/**
	 * 首页我的待办列表
	 * @author longjunhao 20140728
	 */
	public function listWorkFlowToDo() {
		$userId = $this->getUser ()->getId();
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$limit = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$offset = ($page - 1) * $limit;
		$parent = isset ( $_GET ['parent'] ) ? $_GET ['parent'] : 'todo'; // 父类型
		$child = isset ( $_GET ['child'] ) ? $_GET ['child'] : 'all'; // 子类型
		$serarchKeyword = '';
		$params = "start=" . $offset . "&limit=" . $limit . "&userId=" . ($this->getUser ()->getId ()) . "&parent=" . $parent . "&child=" . $child . "&serarchKeyword=" . $serarchKeyword;
		$params = $params.'&remoteAddr='.$this->getClientIp();
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
	
		$proxy = $this->exec ( 'getProxy', 'escloud_workflowws' );
		$resultData = $proxy->getCollaborativeDataList( $postData );
	
		$total = $resultData->size;
		$result = $resultData->formList;
		
		if(!$total){
			echo '<li class="noborder"><u style="padding-left:15px;line-height:40px;text-decoration:none;">无数据</u></li>';
			return -1;
		}
		
		$list = '';
		$userproxy=$this->exec('getProxy','escloud_organduserws');
		//wanghongchen 20140930  修改首页代办列表头像
		foreach ($result as $line => $row){
			$iconUrl = $userproxy->getIconById($row->userId);
			if($iconUrl == null || $iconUrl == ""){
				$iconUrl = "/apps/escloudapp/templates/ESDefault/images/avatar.jpg";
			}
			$p = $row->wfId.'&'.$row->formId.'&'.$row->stepId.'&'.$row->workFlowType;
			if($line == 0){
				$list .= '<li  class="details" info="'. $p .'"><div class="info"><div class="date"><span>'.$row->month.'</span>'.$row->year.'</div>'.
						'<div class="avatar"><img src="'.$iconUrl.'" /></div>'.
						'<div class="title"><span>'.$row->caller.'</span><a href="javascript:void(0)" >'. $row->displayName .'</a></div></div></li>';
		
			}else{
				$list .= '<li  class="details" info="'. $p .'"><div class="info"><div class="date"><span>'.$row->month.'</span>'.$row->year.'</div>'.
						'<div class="avatar"><img src="'.$iconUrl.'" /></div>'.
						'<div class="title"><span>'.$row->caller.'</span><a href="javascript:void(0)" >'. $row->displayName .'</a></div></div></li>';
			}
		}
		
		echo $list;
	}
	
	/**
	 * 查询所有数据附件的dataList
	 * @author longjunhao 20140731 
	 */
	public function getAllDataListStr() {
		$data['dataId'] = $_POST['dataId'];
		$data['formId'] = $_POST['formId'];
		$data['wfId'] = $_POST['wfId'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $this->getClientIp();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->getAllDataListStr($postData);
		echo $result;
	}
	
	/**
	 * 删除待发、已发数据，已发只能删除自己发起的且已完成的流程数据
	 * @author longjunhao 20140925
	 */
	public function deleteUserformData(){
		$data = $_POST['data']; // 数据ID:发起人ID,数据ID:发起人ID...
		$ids = $_POST['userFormNo'];
		$title = $_POST['title'];
		$date = $_POST['start_time'];
		$state = $_POST['wfState'];
		$params = "data=".$data."&ids=".$ids."&title=".$title."&date=".$date."&state=".$state."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$Proxy->deleteUserformData($postData);
		echo $result;
	}
}