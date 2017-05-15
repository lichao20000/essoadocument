<?php
/**
 *
 * @author wangbo  机构和用户管理
 * @Date 20140402
 */
class ESOrgAndUserAction extends ESActionBase {
	// 默认访问的方法，渲染主界面
	public function index() {
		return $this->renderTemplate ();
	}
	// 删除用户
	public function deleteUserList() {
		$out['ids'] = $_POST ['ids'];
		//gengqianfeng 20140915 添加用户名参数多个以','分隔
		$out['uids'] = $_POST['uids'];
		$out['userIp'] = $this->getClientIp();
		$out['userId'] = $this->getUser()->getId();
		$data = json_encode ( $out );
		$Proxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$result = $Proxy->deleteUserList ( $data );
		echo $result;
	}
	// 渲染添加用户的页面
	public function add_user() {
		$orgcode = $_POST['orgcode'];
		$orgseq = $_POST['orgseq'];
		return $this->renderTemplate(array('orgseq'=>$orgseq, 'orgcode'=>$orgcode));
	}
	// 添加用户
	public function addUser() {
		parse_str ( $_POST ['data'], $out );
		$out['bigOrgId'] = $this->getUser()->getBigOrgId();
		$out['userIp'] = $this->getClientIp();
		$out['curUserId'] = $this->getUser()->getId();
		$data = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$result = $Proxy->addUser ( $data );
		echo json_encode($result);
	}
	// 更新用户
	public function updateUser() {
		parse_str ( $_POST ['data'], $out );
		$out['userIp'] = $this->getClientIp();
		$out['userId'] = $this->getUser()->getId();
		$data = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$result = $Proxy->updateUser ( $data );
		echo $result;
	}
	// 用户展现
	public function findUserListByOrgid() {
		$request = $this->getRequest ();
		$orgSeq = $request->getGet ( 'orgSeq' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$orgAndUserProxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data ['orgSeq'] = $orgSeq;
		$data['userIp'] = $this->getClientIp();
		$data['userId'] = $this->getUser()->getId();
		$canshu = json_encode ( $data );
		$rows = $orgAndUserProxy->findUserListByOrgid ( $canshu );
		$countData ['keyWord'] = $keyWord;
		$countData ['orgSeq'] = $orgSeq;
		$countCanshu = json_encode ( $countData );
		$total = $orgAndUserProxy->getCountAll ( $countCanshu );
		$start = 1;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							//gengqianfeng 20140915 添加用户名参数uids多个以','分隔
							"ids" => '<input type="checkbox"  class="checkbox"  name="userId" value="' . $row->id . '"  uids="'.$row->userid.'" id="userId">',
							"id" => $row->id,
							"userid" => $row->userid,
							"operate" => "<span class='editbtn' >&nbsp;</span>",
							"firstName" => $row->firstName,
							"lastName" => $row->lastName,
							"Name" => $row->lastName . $row->firstName,
							"userStatus" => ($row->userStatus=='1'||$row->userStatus=='启用')?'启用':'禁用',
							"mobTel" => $row->mobTel,
							"emailAddress" => $row->emailAddress,
							"orgname" => $row->orgname
					) 
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	// 用户展现
	public function findUserListAndOrgName() {
		$request = $this->getRequest ();
		$orgSeq = $request->getGet ( 'orgSeq' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$orgAndUserProxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data ['orgSeq'] = $orgSeq;
		$canshu = json_encode ( $data );
		$rows = $orgAndUserProxy->findUserListAndOrgName ( $canshu );
		$countData ['keyWord'] = $keyWord;
		$countData ['orgSeq'] = $orgSeq;
		$countCanshu = json_encode ( $countData );
		$total = $orgAndUserProxy->getCountAllForSearch ( $countCanshu );
		$start = 1;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox"  class="checkbox"  name="userId" value="' . $row->id . '" id="userId">',
							"id" => $row->id,
							"userid" => $row->userid,
							"operate" => "<span class='editbtn' >&nbsp;</span>",
							"firstName" => $row->firstName,
							"lastName" => $row->lastName,
							"Name" => $row->lastName . $row->firstName,
							"userStatus" => $row->userStatus==='1'?'启用':'禁用',
							"mobTel" => $row->mobTel,
							"orgName" => $row->orgName,
							"emailAddress" => $row->emailAddress
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	// 编辑用户
	public function edit_user() {
		$colValues = $_POST ['data'];
		$data = explode ( '|', $colValues );
		// echo $colValues;
		return $this->renderTemplate ( array (
				'data' => $data
		) );
	}

	
	public function getOrgAllListTree() {
		$oid=isset($_GET['oid'])?$_GET['oid']:'';
		$userId = $this->getUser ()->getId ();
		$data ['userId'] = ($oid=='all') ? 'admin' : $userId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$lists = $proxy->getOrgAllListTree ( $canshu );
		$jsonData[] = array (
				'name' => '机构设置',
				'id' => 'org',
				'open' => true,
				);		
		foreach ( $lists as $row ) {
			$jsonData [] = array (
					"name" => $row->name,
					"id" => $row->id,
					"pId" => $row->pId!="null" ? $row->pId:'org'
			);
		}
		echo json_encode ( $jsonData );
	}
	/**
	 * 左侧树数据显示
	 *
	 * @author ldm
	 */
	public function getOrgListTree() {
		//gengqianfeng 20141015 添加加载所有机构标示
		if(isset($_GET['id'])){
		$this->expandOrgListTree();
		return;
		};
		$oid=isset($_GET['oid'])?$_GET['oid']:'';
		$userId = $this->getUser ()->getId ();
		$data ['userId'] = ($oid=='all') ? 'admin' : $userId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$lists = $proxy->getOrgListTree ( $canshu );
		$jsonData1 = array ();
		$jsonData = array (
				'name' => '机构设置',
				'id' => 'org',
				'open' => true,
				'children' => array ());
		
		foreach ( $lists as $row ) {
			$entry = array (
					"name" => $row->name,
					"id" => $row->id,
					"pId" => $row->pId,
					"isParent" => $row->isParent,
					"idseq" => $row->idseq,
					"cuncorgclass" => $row->cuncorgclass,
					"address" => $row->address,
					"position" => $row->position,
					"orgsort" => $row->orgsort,
					"mainsite" => $row->mainsite,
					"orgstatus" => $row->orgstatus
			);
			$jsonData ['children'] [] = $entry;
		}
		
		$jsonData1 [0] = $jsonData;
		
		echo json_encode ( $jsonData1 );
	}

	/**
	 * 展开树
	 *
	 * @author ldm
	 */
	public function expandOrgListTree() {
		$parentId = $_GET ['id'];
		$data ['parentId'] = $parentId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$lists = $proxy->getOrgListTree ( $canshu );
		$result = array ();
		foreach ( $lists as $k => $val ) {
			$result [$k] ["name"] = $val->name;
			$result [$k] ["pId"] = $val->pId;
			$result [$k] ["id"] = $val->id;
			$result [$k] ["isParent"] = $val->isParent;
			$result [$k] ["idseq"] = $val->idseq;
			$result [$k] ["cuncorgclass"] = $val->cuncorgclass;
			$result [$k] ["address"] = $val->address;
			$result [$k] ["position"] = $val->position;
			$result [$k] ["orgsort"] = $val->orgsort;
			$result [$k] ["mainsite"] = $val->mainsite;
			$result [$k] ["orgstatus"] = $val->orgstatus;
		}
		echo json_encode ( $result );
	}
	// 渲染添加机构页面
	public function add_org() {
		$data = $_GET ['data'];
		$datas = explode ( ',', $data );
		return $this->renderTemplate ( array (
				'data' => $datas
		) );
	}
	// 添加机构
	public function addOrg() {
		parse_str ( $_POST ['data'], $out );
		$out['userIp'] = $this->getClientIp();
		$out['userId'] = $this->getUser()->getId();
		$data = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$result = $Proxy->addOrg ( $data );
		echo json_encode ( $result );
	}
	// 删除机构及其子机构，以及这些机构下的用户
	public function delOrg() {
		$data = $_POST ['data'];
		$josnp ['orgId'] = $data;
		$josnp['userIp'] = $this->getClientIp();
		$josnp['userId'] = $this->getUser()->getId();
		$canshu = json_encode ( $josnp );
		$Proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$result = $Proxy->deleteOrgEntry ( $canshu );
		echo $result;
	}
	// 渲染编辑机构的页面
	public function edit_org() {
		$data = $_POST ['data'];
		$datas = explode ( '&', $data );
		$userIp = $this->getClientIp();
		$userId = $this->getUser()->getId();
		return $this->renderTemplate ( array (
				'data' => $datas,
				'userIp'=>$userIp,
				'userId'=>$userId
		) );
	}
	// 编辑机构
	public function editOrg() {
		parse_str ( $_POST ['data'], $out );
		$data = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$result = $Proxy->modifyOrgEntry ( $data );
		echo json_encode($result);
	}
	// 渲染列举除去用户所属角色之外的所有角色的页面
	public function listRole() {
		$data = $_GET ['data'];
		return $this->renderTemplate ( array (
				'data' => $data
		) );
	}
	// 列举除去用户所属角色之外的所有角色
	public function findRoleList() {
		$request = $this->getRequest ();
		$idStr = $request->getGet ( 'idStr' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$roleServerProxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$bigOrgId = $this->getUser()->getBigOrgId();
		$userId = $this->getUser()->getId();
		$countData ['keyWord'] = $keyWord;
		$countData ['idStr'] = $idStr;
		$countData['userId'] = $userId;
		$countData['bigOrgId'] = $bigOrgId;
		$countCanshu = json_encode ( $countData );
		$total = $roleServerProxy->getCountAllRole ( $countCanshu );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data ['idStr'] = $idStr;
		$data['userId'] = $userId;
		$data['bigOrgId'] = $bigOrgId;
		$canshu = json_encode ( $data );
		$rows = $roleServerProxy->getAllRoleServer ( $canshu );
		$start = 1;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->roleId,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox"  class="checkbox"  name="listRoleServerId" value="' . $row->roleId . '"id="listRoleServerId">',
							"roleId" => $row->roleId,
							"roleCode" => $row->roleCode,
							"roleName" => $row->roleName,
							"roleRemark" => $row->roleRemark,
							"createTime" => $row->createTime,
							"updateTime" => $row->updateTime,
							"isSystem" => $row->isSystem==='1'?'是':'否'
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	public function findUserRole() {
		$request = $this->getRequest ();
		$selectedRoleId = $request->getGet ( 'selectedRoleId' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$roleServerProxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data ['selectedRoleId'] = $selectedRoleId;
		$data['userId'] = $this->getUser()->getId();
		$data['bigOrgId'] =  $this->getUser()->getBigOrgId();
		$canshu = json_encode ( $data );
		$rows = $roleServerProxy->getUserRole ( $canshu );
		$start = 1;
		$total = count ( explode ( ',', $selectedRoleId ) );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->roleId,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox"  class="checkbox"  name="userRoleListId" value="' . $row->roleId . '"id="userRoleListId">',
							"roleId" => $row->roleId,
							"roleCode" => $row->roleCode,
							"roleName" => $row->roleName,
							"roleRemark" => $row->roleRemark,
							"createTime" => $row->createTime,
							"updateTime" => $row->updateTime,
							"isSystem" => $row->isSystem
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	// 根据用户的id获取与该用户关联的角色id列表
	public function getUserRoles() {
		$userId = $_POST ['userId'];
		$userProxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$roleIds = $userProxy->getRolesByUserId ( $userId );
		echo $roleIds;
	}
	/**
	 * 用户添加角色
	 * wanghongchen 20140620
	 */	public function saveUserRole(){
		$roleIds = $_POST['roleIds'];
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array('roleIds'=>$roleIds,'userId'=>$userId,'id'=>$id,'userIp'=>$userIp));
		$proxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$result = $proxy->saveUserRole($param);
		echo $result;
	}

	/**
	 * 删除用户角色
	 * wanghongchen 20140620
	 */
	public function deleteUserRole(){
		$roleIds = $_POST['roleIds'];
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array('roleIds'=>$roleIds,'userId'=>$userId,'id'=>$id,'userIp'=>$userIp));
		$proxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$result = $proxy->deleteUserRole($param);
		echo $result;
	}

	/**
	 * 批量授权
	 * wanghongchen 20140620
	 */
	public function batchSaveUserRole(){
		$ids = $_POST['ids'];
		$roleIds = $_POST['roleIds'];
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$userIp = $this->getClientIp();
		$param = json_encode(array('userId'=>$userId,'ids'=>$ids,'roleIds'=>$roleIds,'bigOrgId'=>$bigOrgId,'userIp'=>$userIp));
		$proxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$result = $proxy->batchSaveUserRole($param);
		echo $result;
	}

	/**
	 * 获取没有机构的用户
	 * wanghongchen 20140620
	 */
	public function findNoOrgUserList(){
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$param = json_encode(array('userId'=>$userId,'bigOrgId'=>$bigOrgId,'start'=>$rp*($page-1),'limit'=>$rp));
		$proxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$result = $proxy->findNoOrgUserList($param);
		$total = $result->total;
		$rows = $result->data;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		$start = 1;
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox"  class="checkbox"  name="userId" value="' . $row->id . '" id="userId">',
							"id" => $row->id,
							"userid" => $row->userid,
							"Name" => $row->lastName . $row->firstName,
							"userStatus" => $row->userStatus==='1'?'启用':'禁用',
							"mobTel" => $row->mobTel,
							"emailAddress" => $row->emailAddress
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}

	/**
	 * 为机构添加用户
	 * wanghongchen 20140621 add
	 */
	public function addUsersForOrg(){
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$userIds = $_POST['userIds'];
		$orgId = $_POST['orgId'];
		$orgIdSeq = $_POST['orgIdSeq'];
		$param = json_encode(array('userId'=>$userId,'userIds'=>$userIds,'bigOrgId'=>$bigOrgId,'orgId'=>$orgId,'orgIdSeq'=>$orgIdSeq));
		$proxy = $this->exec ( "getProxy", 'escloud_organduserws' );
		$resutl = $proxy->addUsersForOrg($param);
		echo $resutl;
	}

	/**
	 * 左侧树数据显示
	 *
	 * @author longjunhao 20140708
	 */
	public function getOrgListTreeNew() {
		$userId = $this->getUser()->getId ();
		$data ['userId'] = $userId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$lists = $proxy->getOrgListTree ( $canshu );
		$jsonData1 = array ();
		$jsonData = array (
				'name' => '系统机构',
				'id' => 'org',
				'open' => true,
				'children' => array ()
		);
		foreach ( $lists as $row ) {
			$entry = array (
					"name" => $row->name,
					"id" => $row->id,
					"pId" => $row->pId,
					"isParent" => $row->isParent,
					"idseq" => $row->idseq,
					"cuncorgclass" => $row->cuncorgclass,
					"address" => $row->address,
					"position" => $row->position,
					"orgsort" => $row->orgsort,
					"mainsite" => $row->mainsite,
					"orgstatus" => $row->orgstatus
			);
			$jsonData ['children'] [] = $entry;
		}
		$jsonData1 [0] = $jsonData;
		echo json_encode ( $jsonData1 );
	}

	/**
	 * 获取所有机构列表
	 */
	public function getAllOrgList() {
		$params = "userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_organduserws');
		$return=$Proxy->getAllOrgList($postData);
		echo $return;
	}
	/**
	 * 判断某机构是否含有用户
	 * xuekun  added in  2014-7-25
	 */
	public function judgeIfHaveUser(){
		$orgseq = $_GET['orgseq'];
		$Proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$result=$Proxy->judgeIfHaveUser($orgseq);
		echo $result;
	}
	/**
	 * 重置密码
	 * guolanrui 20140827
	 */
	public function resetPassword(){
		$curuserId = $this->getUser()->getId ();
		$data ['curuserid'] = $curuserId;
		$data ['idStr'] = $_POST['idStr'];
		$data ['uidStr'] = $_POST['uidStr'];
// 		$data ['edituserid'] = $_POST['edituserid'];
		$data ['writePassword'] = $_POST['writePassword'];
		$postData = json_encode ( $data );
		$Proxy=$this->exec('getProxy','escloud_organduserws');
		$return=$Proxy->resetPassword($postData);
		echo json_encode($return);
	}
	/**
	 * 重置密码
	 * guolanrui 20140827
	 */
	public function modifyPassword(){
		$curuserId = $this->getUser()->getId ();
		$data ['curuserId'] = $curuserId;
		$data ['oldPassword'] = $_POST['oldPassword'];
		$data ['newPassword'] = $_POST['newPassword'];
		$postData = json_encode ( $data );
		$Proxy=$this->exec('getProxy','escloud_organduserws');
		$return=$Proxy->modifyPassword($postData);
		echo json_encode($return);
	}
	
	public function editMyUserinfo(){
		$curuserId = $this->getUser()->getId();
		$Proxy=$this->exec('getProxy','escloud_organduserws');
		$curuserInfo=$Proxy->getUserByUserid($curuserId);
		return $this->renderTemplate ( array('data'=>array (
				$curuserInfo->id,
				$curuserInfo->userid,
				$curuserInfo->lastname,
				$curuserInfo->firstname,
				$curuserInfo->userstatus,
				$curuserInfo->mobtel,
				$curuserInfo->emailaddress
		)) );
	}
	
	/**
	 * 根据userId获取头像的地址
	 * wanghongchen 20140930 
	 */
	public function getIconByUserId(){
		$userId = $this->getUser()->getId();
		$param = json_encode(array('userId'=>$userId));
		$proxy=$this->exec('getProxy','escloud_organduserws');
		echo $proxy->getIconByUserId($param);
	}
	
	/**
	 * 保存用户头像fileid
	 * wanghongchen 20140930
	 */
	public function saveHeaderImageId(){
		$fileId = $_POST['fileId'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('userId'=>$userId,'fileId'=>$fileId));
		$proxy=$this->exec('getProxy','escloud_organduserws');
		$proxy->saveHeaderImageId($param);
	}
	
	public function set_Org(){
		return $this->renderTemplate();
	}
	
	
	/**
	 * 左侧树数据显示
	 *
	 * @author liuhezeng 20141021 
	 */
	public function getOrgListTreeForOrgSet() {
		$userId = $this->getUser()->getId ();
		$data ['userId'] = $userId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$lists = $proxy->getOrgListTree ( $canshu );
		$jsonData1 = array ();
		$jsonData = array (
				'name' => '机构变更',
				'id' => 'org',
				'open' => true,
				'children' => array ()
		);
		foreach ( $lists as $row ) {
			$entry = array (
					"name" => $row->name,
					"id" => $row->id,
					"pId" => $row->pId,
					"isParent" => $row->isParent,
					"idseq" => $row->idseq,
					"cuncorgclass" => $row->cuncorgclass,
					"address" => $row->address,
					"orgsort" => $row->orgsort,
					"mainsite" => $row->mainsite,
					"orgstatus" => $row->orgstatus
			);
			$jsonData ['children'] [] = $entry;
		}
		$jsonData1 [0] = $jsonData;
		echo json_encode ( $jsonData1 );
	}
	
	public function setOrgForNew(){
		
		$data ['orgcode'] = isset ( $_POST ['orgcode'] ) ? $_POST ['orgcode'] : '';
		$data ['orgseq'] = isset ( $_POST ['orgseq'] ) ? $_POST ['orgseq'] : '';
		$data ['idStr'] = isset ( $_POST ['idStr'] ) ? $_POST ['idStr'] : '';
		$postData = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'escloud_organduserws' );
		$return=$proxy->setOrgForNew($postData);
		echo json_encode($return);
	}
	
}
?>