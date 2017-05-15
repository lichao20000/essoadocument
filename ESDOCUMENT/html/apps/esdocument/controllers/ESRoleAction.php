<?php
/**
 * 角色模块
 * @author dengguoqi
 *
 */
class ESRoleAction extends ESActionBase
{
	//首页渲染图片
	public function index()
	{
		return $this->renderTemplate(array('status'=>1));
	}

	public function findRoleList()
	{
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$proxy = $this->exec ( "getProxy", 'role' );
		$condition ['page'] = ($page - 1) * $rp;
		$condition ['pre'] = $rp;
		$total = $proxy->getCount ();
		$rows = $proxy->findRoleList ( json_encode ( $condition ) );
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
				"ids" => "<input type=\"checkbox\" class=\"checkbox\" isSystem=\"$row->isSystem\" name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
				"operate" => "<span class='editbtn' id='$row->id'> </span>",
				"menus" => "<span class='menus'id='$row->id' > </span>",  
                "dirs" => "<span class='dirs' id='$row->id' > </span>", 
                "datas" => "<span class='datas' id='$row->id' > </span>",
				"lends" =>  "<span class='lends' id='$row->id' > </span>",
                "roleId" => $row->roleId, 
                "roleName" => $row->roleName, 
                "createTime" => $row->createTime, 
                "updateTime" => $row->updateTime,
                "isSystem" => $row->isSystem == '1' ? '是':'否',
                "roleRemark" => $row->roleRemark
				)
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	public function getCount(){
		$role = $this->exec("getProxy", "role");
		$result =$role->getCount();
		echo json_encode($result);
		
	}
	// 渲染添加角色页面
	public function add_role() {
		return $this->renderTemplate ();
	}
	// 渲染编辑角色页面
	public function edit_role() {
		$id = $_POST['id'];
		$proxy = $this->exec("getProxy", "role");
		$result = $proxy->getRoleById($id);
		return $this->renderTemplate((array)$result);
	}
	// 添加角色
	public function addRole() {
		parse_str ( $_POST ['data'], $data );
		$data['ip'] = $this->getClientIp();
		$data['userId'] = $this->getUser ()->getId ();
		$proxy = $this->exec("getProxy", "role");
		$result = $proxy->add(json_encode($data));
		echo $result;
	}
	
	// 编辑角色
	public function editRole() {
		parse_str ( $_POST ['data'], $data );
		$data['ip'] = $this->getClientIp();
		$data['userId'] = $this->getUser ()->getId ();
		$proxy = $this->exec("getProxy", "role");
		$result = $proxy->update(json_encode($data));
		echo $result;
	}
	public function listUsers() {
		return $this->renderTemplate ();
	}
	public function findUserListByOrgid() {
		$request = $this->getRequest ();
		//$orgSeq = $request->getGet ( 'orgSeq' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$orgAndUserProxy = $this->exec ( "getProxy", 'role' );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data['userIp'] = $this->getClientIp();
		$data['userId'] = $this->getUser()->getId();
		$canshu = json_encode ( $data );
		$rows = $orgAndUserProxy->findUserListByOrgid ( $canshu );
		$countData ['keyWord'] = $keyWord;
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
							//"ids" => '<input type="checkbox"  class="checkbox"  name="userId" value="' . $row->id . '"  uids="'.$row->userid.'" id="userId">',
							"id" => $row->id,
							"userid" => $row->userid,
							"operate" => "<span class='lends' userId='$row->id' >&nbsp;</span>",
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
	// 编辑用户
	public function edit_user() {
		$colValues = $_POST ['data'];
		$data = explode ( '|', $colValues );
		return $this->renderTemplate ( array (
				'data' => $data
		) );
	}
	// 根据用户的id获取与该用户关联的角色id列表
	public function getUserRoles() {
		$userId = $_POST ['userId'];
		$userProxy = $this->exec ( "getProxy", 'role' );
		$roleIds = $userProxy->getRolesByUserId ( $userId );
		echo $roleIds;
	}
	//获得当前用户的角色列表
	public function findUserRole() {
		$request = $this->getRequest ();
		$selectedRoleId = $request->getGet ( 'selectedRoleId' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$roleServerProxy = $this->exec ( "getProxy", 'role' );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data ['selectedRoleId'] = $selectedRoleId;
		//$data['userId'] = $this->getUser()->getId();
		//$data['bigOrgId'] =  $this->getUser()->getBigOrgId();
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
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox"  class="checkbox"  name="userRoleListId" value="' . $row->id . '"id="userRoleListId">',
							"id" => $row->id,
							"roleId" => $row->roleId,
							"roleName" => $row->roleName,
							"roleRemark" => $row->roleRemark,
							"createTime" => $row->createTime,
							"updateTime" => $row->updateTime,
							"isSystem" => $row->isSystem=='1'?'是':'否'
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	// 渲染列举除去用户所属角色之外的所有角色的页面
	public function listRole() {
		$data = $_GET ['data'];
		return $this->renderTemplate ( array (
				'data' => $data
		) );
	}
	// 列举除去用户所属角色之外的所有角色
	public function findRoleListByUser() {
		$request = $this->getRequest ();
		$idStr = $request->getGet ( 'idStr' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$roleServerProxy = $this->exec ( "getProxy", 'role' );
		//$bigOrgId = $this->getUser()->getBigOrgId();
		//$userId = $this->getUser()->getId();
		$countData ['keyWord'] = $keyWord;
		$countData ['idStr'] = $idStr;
		//$countData['userId'] = $userId;
		//$countData['bigOrgId'] = $bigOrgId;
		$countCanshu = json_encode ( $countData );
		$total = $roleServerProxy->getCountAllRole ( $countCanshu );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		$data ['idStr'] = $idStr;
		//$data['userId'] = $userId;
		//$data['bigOrgId'] = $bigOrgId;
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
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="checkbox"  class="checkbox"  name="listRoleServerId" value="' . $row->id . '"id="listRoleServerId">',
							"id" => $row->id,
							"roleId" => $row->roleId,
							"roleName" => $row->roleName,
							"roleRemark" => $row->roleRemark,
							"createTime" => $row->createTime,
							"updateTime" => $row->updateTime,
							"isSystem" => $row->isSystem=='1'?'是':'否'
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	//添加角色
	public function saveUserRole(){
		$roleIds = $_POST['roleIds'];
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array('roleIds'=>$roleIds,'userId'=>$userId,'id'=>$id,'ip'=>$userIp));
		$proxy = $this->exec ( "getProxy", 'role' );
		$result = $proxy->saveUserRole($param);
		echo $result;
	}
	//删除用下的角色
	public function deleteUserRole(){
		$roleIds = $_POST['roleIds'];
		$userId = $_POST['userId'];
		$user = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array('roleIds'=>$roleIds,'userId'=>$userId,'user'=>$user,'ip'=>$userIp));
		$proxy = $this->exec ( "getProxy", 'role' );
		$result = $proxy->deleteUserRole($param);
		echo $result;
	}
	
	// 删除角色
	public function batchDelete() {
		$idStr = $_POST ['idStr'];
		$idArr = explode ( ',', $idStr );
		$Proxy = $this->exec ( "getProxy", 'role' );
		$result = $Proxy->del ( json_encode ( $idArr ) );
		echo $result;
	}
	//过滤页面
	public function filter(){
  	return $this->renderTemplate();		
	}
	//过滤条件查询
	public function getRoleByCondition(){
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$param ['page'] = ($page - 1) * $rp;
		$param ['pre'] = $rp;
		$param ['condition'] = isset ( $_POST ['query'] ['condition'] ) ? $_POST ['query'] ['condition'] : null;
		$Proxy = $this->exec ( "getProxy", 'role' );
		$rows = $Proxy->getRoleByCondition ( json_encode ( $param ) );
		$total = $Proxy->getCountByCondition ( json_encode ( $param ) );
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
							"startNum" => $startNum,
							"ids" => "<input type=\"checkbox\" class=\"checkbox\" isSystem=\"$row->isSystem\" name=\"changeId\" value=\"$row->id\" id=\"changeId\">",
							"operate" => "<span class='editbtn' id='$row->id'> </span>",
							"menus" => "<span class='menus' id='$row->id' > </span>",  
			                "dirs" => "<span class='dirs' id ='$row->id' > </span>", 
			                "datas" => "<span class='datas' id='$row->id' > </span>", 
							"lends" => "<span class='lends' id='$row->id' > </span>",
			                "roleId" => $row->roleId, 
			                "roleName" => $row->roleName, 
			                "createTime" => $row->createTime, 
			                "updateTime" => $row->updateTime,
			                "isSystem" => $row->isSystem == '1' ? '是':'否',
			                "roleRemark" => $row->roleRemark
					)
			);
			$startNum ++;
			$jsonData ['rows'] [] = $entry;
		}
		echo json_encode ( $jsonData );
	}
	//判断是否已存相同角色标识
	public function  judgeIfExistsRoleId(){
		$id= $_POST['id'];
		$roleId = $_POST['roleId'];
		$Proxy = $this->exec ( 'getProxy', 'role' );
		$result=$Proxy->judgeIfExistsRoleId(json_encode(array('id'=>$id,'roleId'=>$roleId)));
		echo $result;
	}
	//判断是否已存相同角色标识
	public function  judgeIfExistsRoleName(){
		$id= $_POST['id'];
		$roleName = $_POST['roleName'];
		$Proxy = $this->exec ( 'getProxy', 'role' );
		$result=$Proxy->judgeIfExistsRoleName(json_encode(array('id'=>$id,'roleName'=>$roleName)));
		echo $result;
	}
	
	public function getMenuAuth(){
		$roleId = $_POST['roleId']; 
		$Proxy = $this->exec ( 'getProxy', 'role' );
		$param['roleId'] =$roleId;
		//$param['userId'] = "admin";
		$allMenu = $Proxy ->getAllMenu();
		$authMenu = $Proxy->getArchiveAuthMenuByRole(json_encode($param));
		if(isset($authMenu->resource)){
		$menuArr = explode(',' , $authMenu->resource);
		foreach ($allMenu as $node){
	         if (in_array($node->id, $menuArr)){
	         	$node->checked=true;
	   			$node->open=true;
	         }
		 }
		}
		$allMenu[0]->open=true; 
		$menu['nodes'] = $allMenu;
		$menu['resourId'] = isset ($authMenu->id)?$authMenu->id:null;
		echo json_encode($menu);
	}
	public function	saveMenuAuth(){
		$roleId = $_POST['roleId'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$resourId = isset ($_POST['resourId']) ? $_POST['resourId']:null;
		$checkedNodes = $_POST['checkeds'];
		$param['roleId'] = $roleId;
		$param['userId'] = $userId;
		$param['ip'] = $ip;
		$param['resourId'] = $resourId;
		$param['checkedNodes'] = $checkedNodes;
		$Proxy = $this->exec ( 'getProxy', 'role' );
		$result = $Proxy->saveMenuAuth(json_encode($param));
		echo $result;
	}
	public function getAuthTree()
	{
 		//$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$nodeType = isset($_POST['nodeType'])?$_POST['nodeType']:1;
		
		//$bussModelId = $_POST['bussModelId'];
	
		$proxy = $this->exec("getProxy", "role");
		$param['roleId'] = $roleId;
		$param['nodeType'] = $nodeType;
		$param['userId'] = 'admin';
		$mapNodes = $proxy->getAuthTree(json_encode($param));
		$nodes = array(); 
		foreach ($mapNodes as $node)
		{
			$nodes[]= array(
					'id'=> $node->id,
					'pId'=> $node->pId,
					'name'=> $node->name.($node->rights==''?'':('['.$node->rights.']')),
					'realname'=> $node->name,/** xiaoxiong 20140804 节点默认权限 **/
					'checked'=> $node->checked,
					'authId' =>$node->authId,
					'nodeType'=> $node->nodeType,
					'open'=> $node->pId < 0 ? true : false,
					'isLeaf'=> $node->isLeaf,/** xiaoxiong 20140804 节点默认权限 **/
					'rights'=> ($node->checked?$node->rights:($node->rights==''?'DR,FR':$node->rights)),/** xiaoxiong 20140804 节点默认权限 **/
					'oldrights'=> $node->rights/** xiaoxiong 20140804 节点默认权限 **/
			);
		}  
		echo json_encode($nodes);
	}
	
	/**
	 *  保存修改目录权限（保存页面最终确定的节点的方法）
	 * @author xiewenda
	 * @param roleId
	 * @param userid
	 * @param nodepathMap map中deletePath 为要删除的节点 savePath为最终要保存的path
	 * @return
	 */
	public function saveAuthTreeNodes()
	{
	
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$roleId = $_POST['roleId'];
		$nodeType = $_POST['nodeType'];
		$savePath= isset($_POST['savePath']) ? $_POST['savePath'] : array();
		$deletePath = isset($_POST['deletePath']) ? $_POST['deletePath'] : array();
	
		$proxy = $this->exec("getProxy", "role");
	    $param['roleId'] = $roleId;
	    $param['nodeType'] = $nodeType;
	    $param['savePath'] = $savePath;
	    $param['deletePath'] = $deletePath;
	    $param['userId'] = $userId;
	    $param['ip'] = $ip;
		echo $proxy->saveAuthTreeNodes(json_encode($param));
	
	}
	public function getDataTree()
	{
		//$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$userId = 'admin';//$userInfo['userId'];
		$proxy = $this->exec("getProxy", "role");
	    $param['roleId'] = $roleId;
	    $param['userId'] = $userId;
		$mapNode = $proxy->getDataTree(json_encode($param));
		$nodes = array();
		foreach ($mapNode as $node)
		{
			$nodes[]= array(
					'id'=> $node->id,
					'pId'=> $node->pId,
					'name'=> $node->name,
					'treeId'=>$node->id,
					'authId'=> isset($node->authId)?$node->authId:-1,
					'nodeType'=> isset($node->nodeType)?$node->nodeType:1,
					'isParent'=> isset($node->isParent)?$node->isParent:false,
					'open'=> $node->pId < 0 ? true : false
			);
		}
	 
		echo json_encode($nodes);
	}
	
	/**
	 * 根据目录树角色id，当前状态，和当前节点 获取数据权限
	 * @author fangjixiang 20130711
	 * @param roleId
	 * @param modelId
	 * @param selectedNodePath
	 * @return
	 */
	public function getDataAuth()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		//$userInfo = $this->GetUserInfo();
		$roleId = $_GET['roleId'];
		$treeId = $_GET['treeId'];
		$userId = "admin";
		//$bussModelId = $_GET['bussModelId'];
		$nodeType = $_GET['nodetype'];
		$param = array(
			'roleId'=>$roleId,
			'userId' =>$userId,
			'nodeType'=>$nodeType,
			'treeId' => $treeId
		);
		$proxy = $this->exec("getProxy", "role");
		$lists = $proxy->getDataAuth(json_encode($param));

		$permissions = array('fileDownload','itemDelete','itemEdit','itemRead','filePrint','fileRead');
		$permissionsCn = array('fileDownload'=>'文件下载','itemDelete'=>'条目删除','itemEdit'=>'条目编辑','itemRead'=>'条目浏览','filePrint'=>'文件打印','fileRead'=>'文件浏览');
		$compareValue = array('lessThan'=>'小于','greaterThan'=>'大于','notEqual'=>'不等于','equal'=>'等于','like'=>'包含','notLike'=>'不包含','greaterEqual'=>'大于等于','lessEqual'=>'小于等于');
		$relationChar = array('true'=>'并且','false'=>'或者');
		$jsonData = array('page'=> $page,'total'=> 1,'rows'=>array());

		foreach ($lists as $list)
		{   
			$dataAuthArr =explode(',',$list->dataAuth);
			$dataAuth ='';
			foreach ($dataAuthArr as $data){
				$dataAuth='['.$permissionsCn[$data].'] '.$dataAuth;
			}
			$entry = array(
					'id'=> $list->id,
					'cell'=>array(
							'cbox'=> "<input type='checkbox' checkone='1' id='". $list->id ."' />",
							'operation'=> "<input id='". $list->id ."' type='button' class='edits' />",
							'condition'=> $list->en,
							'permission'=> $list->dataAuth,
							'conditionCn'=>$list->cn,
							'permissionCn'=>$dataAuth
					)
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	// 获取要授权的数据节点path
	public function preGetPackageRight()
	{
	 	//$authId = $_POST['authId'];
	 	$nodeType = $_POST['nodeType'];
		$treeId = $_POST['treeId'];
		//$param['authId'] = $authId;
		$param['nodeType'] = $nodeType;
		$param['treeId'] = $treeId;
		$proxy = $this->exec("getProxy", "role");
		$row = $proxy->preGetPackageRight(json_encode($param));
		//是否跨部门标记
		//$secFlag = $proxy->getTransDepartment($treeid);
		//是否跨数据权限标记
		//$dataflag = $proxy->getDataAuthPriority($treeid);
		$strus = array();
			$strus[] = array(
					'id'=> $row->id,
					'pId'=>$row->pId,
					'name'=> $row->name,			
					'nodeType'=>$nodeType

			);
		
		echo json_encode($strus);
	}
	//添加规则
	public function add_rule()
	{
		$treeId = intval($_POST['treeId']);
		$nodeType = intval($_POST['nodeType']);
		$isfile = $_POST['isfile'];
		$roleId = $_POST['roleId'];
		$param['treeId'] = $treeId;
		$param['nodeType'] = $nodeType;
		//$param['isfile'] = $isfile;
		$param['roleId'] = $roleId;
		$options = "<option value='EMPTY'>请选择</option>";
		$joptions = array();
		/** xiaoxiong 20140909 对电子文件级做特殊处理 **/
		if($isfile == '0' || $isfile == '2'){
			$proxy = $this->exec("getProxy", "statistic");
			/** guolanrui 20140728 修改获取字段的方法，将系统字段中去掉 限制利用、销毁状态、是否在库、业务系统标识、案卷卷内关联标识 BUG：192 **/
			// 			$lists = $proxy->getStrucAllWithSysTagList($sId);
			$lists = $proxy->getFieldListByTreeIdAndTreeType($treeId,$nodeType);
			foreach ($lists as $list)
			{
				$options .= "<option value='".$list->code."'>".$list->name."</option>";
				$joptions[$list->code] = $list->name;
			}
		} else {
			$options .= "<option value='ESSTYPE'>文件类别</option>";
			$joptions['ESSTYPE'] = '文件类别';
			$options .= "<option value='ESFILETYPE'>附件类型</option>";
			$joptions['ESFILETYPE'] = '附件类型';
			$options .= "<option value='ESTITLE'>文件名称</option>";
			$joptions['ESTITLE'] = '文件名称';
		}
		return $this->renderTemplate(array('options'=>$options, 'joptions'=>json_encode($joptions), 'isfile'=>$isfile));
	}
	
	// 编辑规则
	public function edit_rule()
	{
		//$sId = $_POST['sId'];
		$authId = $_POST['authId'];
		$isfile = $_POST['isfile'];
		$treeId = intval($_POST['treeId']);
		$nodeType = intval($_POST['nodeType']);
		$statistic = $this->exec("getProxy", "statistic");
		/** xiaoxiong 20140909 对电子文件级做特殊处理 **/
		if($isfile == '0'){
			/** guolanrui 20140728 修改获取字段的方法，将系统字段中去掉 限制利用、销毁状态、是否在库、业务系统标识、案卷卷内关联标识 BUG：192 **/
			$lists = $statistic->getFieldListByTreeIdAndTreeType($treeId,$nodeType);
			$options = array('EMPTY'=>'请选择');
			foreach ($lists as $list)
			{
				$options[$list->code] = $list->name;
			}
		} else {
			$options = array('EMPTY'=>'请选择');
			$options['ESSTYPE'] = '文件类别';
			$options['ESFILETYPE'] = '附件类型';
			$options['ESTITLE'] = '文件名称';
		}
		$proxy = $this->exec("getProxy", "role");
		$data = $proxy->getDataAuthById($authId);
		$map['data'] = $data;
		$map['options'] = $options;
		$map['joptions'] = json_encode($options);
		$map['isfile'] = $isfile;
	
		return $this->renderTemplate($map);
	}
	/**
	 * 保存,修改，当前角色，modelId，和档案类型下的数据权限
	 * @author fangjixiang 20130709
	 * @param roleId
	 * @param modelId
	 * @param selectedNodeId
	 * @param userid
	 * @param ip
	 * @param map id 若存在则为编辑， 若没有则为添加   fileDownload = 0 没有现在权限 1 有下载权限
	 * fileRead，filePrint，itemRead，itemEdit，itemDelete，
	 * dataAuth value 存数据权限为list
	 * @return
	 */
	public function saveDataAuth()
	{
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$roleId = $_POST['roleId'];
		$treeId = $_POST['treeId'];
		$authId = $_POST['authId'];
		$nodeType = $_POST['nodeType'];
		$rights = $_POST['rights'];
		$en = $_POST['en'];
		$cn = $_POST['cn'];
		$proxy = $this->exec("getProxy", "role");
		$param =array(
			'id'=>$ip,
			'roleId'=>$roleId,
			'userId'=>$userId,
			'treeId'=>$treeId,
			'authId'=>$authId,
			'nodeType'=>$nodeType,
			'rights'=>$rights,
			'en'=>$en,
			'cn'=>$cn
		);
		$result = $proxy->saveDataAuth(json_encode($param));
		echo json_encode($result);
	
	}
	//删除规则 
	public function deleteDataAuth()
	{
		$proxy = $this->exec("getProxy", "role");
		echo $proxy->deleteDataAuth($_POST['authId']);
	}
	
   // --- 借阅权限功能-----
    
	public function lends(){
		$id = $_POST['id'];
		$proxy = $this->exec("getProxy", "role");
		$result = $proxy->getRoleById($id);
		$lend = $proxy->getLendByRole($id);
		$result = (array)$result;
		if(!isset($lend->id)){
			$result['lendId'] = '-1';
			$result['lendCount'] = '';
			$result['lendDays'] = '';
		}else{
			$result['lendId'] = $lend->id;
			$result['lendCount'] = $lend->lendCount;
			$result['lendDays'] = $lend->lendDays;
		}
		
		return $this->renderTemplate($result);	
	}
	public function saveLendCount(){
		$datas = $_POST['datas']; 
		$Proxy = $this->exec('getProxy','role');
		$userId = isset($_POST['userId'])?$_POST['userId']:'0';
		$roleId = isset($_POST['roleId'])?$_POST['roleId']:'0';
		$lendId = isset($_POST['lendId'])?$_POST['lendId']:'-1';
		$map =array();
		$map['roleId'] = $roleId;
		$map['userId'] =$userId;
		$map['lendId'] =$lendId;
		$map['data'] = $datas;
		
		$result = $Proxy->saveRelendRoleLend(json_encode($map));
		echo json_encode($result);
	}
	public function getRelendByRole(){
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp);
		$limit = ($rp*$page);
		$roleId = $_GET['roleId'];
		$map['start'] = $start;
		$map['limit'] = $limit;
		$map['roleId'] = $roleId;
		$Proxy = $this->exec('getProxy','role');
		$result = $Proxy->getRelendByRole(json_encode($map));
		$total = $result ->count;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			$jsonData['total']='0';
			echo json_encode($jsonData);
			return;
		}
		$lists = $result->data;
		$row = 1;
		foreach($lists as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'order'=> $row,
							'id'=>$list->id,
							'relendCount'=>$list->relendCount,
							'relendDays'=>$list->relendDays,
							'userId'=>$list->userId,
							'roleId'=>$list->roleId
					)
			);
			$row ++;
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	public function saveRoleLend(){
		$map = array();
		$user = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$map['ip'] =$userIp;
		$map['user'] = $user;
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:0;
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:0;
		$map['lendId'] = isset($_POST['lendId'])?$_POST['lendId']:"-1";
		$map['lendCount'] = $_POST['lendCount'];
		$map['lendDays'] = $_POST['lendDays'];
		$proxy = $this->exec('getProxy','role');
		$result = $proxy->saveRoleLends(json_encode($map));
		echo $result;
	}
	
	public function deleteRelend(){
		$reLendId = $_POST['reLendId'];
		$proxy = $this->exec('getProxy','role');
		$result = $proxy->deleteRelend($reLendId);
		echo $result;
	}
	
	public function getDirNodeAuth(){
	//	$roleId = $_POST['roleId'];
	//$nodeId = $_POST['nodeId'];
	//	$nodeType = $_POST['nodeType'];
	echo json_encode($_POST);
	die();
		$param = array(
		 'roleId'=>$roleId,
		// 'nodeId'=>$nodeId,
		// 'nodeType'=>$nodeType
		);
		$proxy = $this->exec('getProxy','role');
		$result = $proxy->getDirNodeAuth(json_encode($param));
		echo json_encode($result);
	}
	
	/**
	 * 获取当前登录用户目录树和数据权限
	 */
	public function getTreeAndDataAuth(){
		$userId = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','role');
		$result = $proxy->getTreeAndDataAuth($userId,'admin');
		echo json_encode($result);
	}
	
	/**
	 * 验证是否存在满足筛选条件的文件
	 */
	public function checkDocByFilter(){
		$data['stageId']=$_POST['treeId'];
		$data['fileId']=$_POST['fileId'];
		$data['condition']=explode('&', $_POST['filter']);
		$proxy = $this->exec ( "getProxy", "role" );
		echo $proxy->getDocFilterById ( json_encode ( $data ) );
	}
	
	/**
	 * 验证是否存在满足筛选条件的电子文件
	 */
	public function checkFileByFilter(){
		$data['fileId']=$_POST['fileId'];
		$data['condition']=explode('&', $_POST['filter']);
		$proxy = $this->exec ( "getProxy", "role" );
		echo $proxy->getFileFilterById ( json_encode ( $data ) );
	}
}
