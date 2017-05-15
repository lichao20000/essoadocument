<?php
/**
 * 档案权限管理
 * author:zhangjirimutu
 * date:20120822
 * modify auther: fangjixiang
 * modify date: 20130423
 */

class ESArchivePermissionAction extends ESActionBase
{
	
	public function GetUserInfo()
	{
		$uid = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($uid);
		$info = array(
				'userId' => $userInfo->userid,
				'displayName' => $userInfo->displayName,
				'orgCode'=> $userInfo->orgCode,
				'mainSite'=> $userInfo->mainSite,
				'shengName'=> $userInfo->shengName
		);
		return $info;
	}
	
	// 获取权限列表@fangjixiang [20130704 停用]
	public function FindAllRoleList()
	{
		
		$userInfo = $this->GetUserInfo();
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$result = $proxy->findAllRoleList($page,$limit,$userInfo['userId']);
		$total = $result->total;
 		//print_r($result);
 		//die();
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if(!$total){
			
			echo json_encode($jsonData);
			return;
		}
		
		foreach ($result->dataList as $row)
		{
			$entry = array(
					'id'=>'',
					'cell'=>array(
							'cb'=>"<input type='checkbox' id='".$row->roleCode."' />",
							'menu'=>"<input title='功能授权' id='".$row->roleCode."' name='".$row->roleName."' type='button' class='menus' />",
							'folder'=>"<input title='目录授权' id='".$row->roleCode."' name='".$row->roleName."' type='button' class='folders' />",
							'data'=>"<input title='数据授权' id='".$row->roleCode."' name='".$row->roleName."' type='button' class='datas' />",
							'code'=>$row->roleCode,
							'name'=>$row->roleName,
							'remark'=>$row->roleRemark
					)
			);
			$jsonData['rows'][] = $entry;
				
		}
		
		echo json_encode($jsonData);
	}
	
	
	// 添加角色@fangjixiang [20130704 停用]
	public function CreateRole()
	{
		$roleCode = $_POST['code'];
		$roleName = $_POST['name'];
		$roleRemark = $_POST['remark'];
		
		$user = $this->GetUserInfo();
		$userId = $user['userId'];
		// 写日志用
		$operation = array(
				'operation' => '添加',
				'operationdetail'=>'添加'.$roleName.'角色'
			);
		$roleentry = array(
			'roleCode'=>$roleCode,
			'roleName'=>$roleName,
			'roleRemark'=>$roleRemark
		);
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$isok = $proxy->createRole(urlencode($roleCode), urlencode($roleName), urlencode($roleRemark), $userId, json_encode($operation));
		echo $isok;
	}
	
	
	// 获取菜单权限树节点@fangjixiang [暂时未用到20130423]
	public function GetArchiveMenu()
	{
		
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$lists = $proxy->getArchiveMenu();
		
		$nodes = array();
		foreach ($lists as $list)
		{
			$nodes[]= array(
					'id'=> $list->id,
					'pId'=> $list->pid,
					'name'=> $list->title,
					//'isParent'=>$val->isParent,
					'open'=> true
			);
		}
		
		echo json_encode($nodes);
	}
	
	// 获取菜单权限树节点@fangjixiang[20130704 停用]
	public function GetAllMenuWithRightSign()
	{
		$roleCode = $_POST['code'];
		$user = $this->GetUserInfo();
		$userId = $user['userId'];
		
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$lists = $proxy->getAllMenuWithRightSign($userId,$roleCode);
		$nodes = array(); // init
		foreach ($lists as $list)
		{
			$nodes[]= array(
					'id'=>$list->id,
					'pId'=>$list->pId,
					'name'=>$list->name,
					'checked'=>$list->checked,
					//'isParent'=>$val->isParent,
					'open'=>true
			);
		}
		
		echo json_encode($nodes);
	}
	
	
	// 获取目录权限树节点@fangjixiang[20130708停用]
	public function GetAllPkgRightTreeNodes()
	{
		
		
		$businessId = $_POST['bid'];
		$roleCode = $_POST['code'];	// ### temp
		$modelId = $_POST['mid'];
		$user = $this->GetUserInfo();
		$userId = $user['userId'];
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		$lists = $proxy->getAllPkgRightTreeNodes($businessId,$roleCode,$userId,$modelId);
 		//print_r($lists);
 		//die();
		foreach ($lists as $k=>$list)
		{
			
			$path = str_replace('/', '-',$list->path); //replace '/' to '-'
			$flag=false;
			if($k==0){
				$flag=true;
			}
			$nodes[]= array(
					'id'=> $list->id,
					'pId'=> $list->pId,
					'name'=> $list->name,
					'path'=> $path,
					'isParent'=> $list->isParent,
					'sId'=> $list->sId,
					'open'=> $flag,
					'checked'=> $list->checked
				);
		}
		
		echo json_encode($nodes);
	}
	
	// 获取数据权限树设置@fangjixiang [20130711 停用]
	public function GetPkgRightTreeNodes()
	{
		$businessId = $_POST['bid'];
		$roleCode = $_POST['code'];	// ### temp
		$modelId = $_POST['mid'];
		$haveCheckBox = true;
		//var_dump($_POST);
		//die();
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$lists = $proxy->getPkgRightTreeNodes($businessId, $roleCode, $modelId, $haveCheckBox);

// 		print_r($res);die();
		$nodes = array();
		foreach ($lists as $list)
		{
				
			$path = str_replace('/', '-', $list->path); //replace '/' to '-'
			$nodes[]= array(
				'id'=> $list->id,
				'pId'=> $list->pId,
				'name'=> $list->name,
				'path'=> $path,
				'isParent'=> $list->isParent,
				'sId'=> $list->sId,
				'open'=> true
			);
		}
	
		echo json_encode($nodes);
	}
	
	// 获取要授权的数据节点path@方吉祥[20130709停用]
	public function PreGetPackageRight()
	{
		$path = @$_POST['path'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$lists = $proxy->preGetPackageRight($path);
		$treeid = @$_REQUEST['treeid'];
		//是否跨部门标记
		$secFlag = $proxy->getTransDepartment($treeid);
		//是否跨数据权限标记
		$dataflag = $proxy->getDataAuthPriority($treeid);
		$strus = array();
		foreach($lists as $list)
		{
			
			$path = str_replace('/', '-', $list->path); //replace '/' to '-'
			$strus[] = array(
				'sid'=> $list->sid,
				'title'=> $list->title,
				'path'=>$path,
			    'secflag'=>$secFlag,
				'dataflag'=>$dataflag
			);
			
		}		
		echo json_encode($strus);
	}
	
	// 获取要授权的数据@方吉祥[20130715 停用]
	public function OsGetPackageRight()
	{
		$businessId = $_GET['bid'];
		$roleCode = $_GET['code'];	// ### temp
		$modelId = $_GET['mid'];
		$nodePath = $_GET['path'];
		$inputName = $_GET['input'];
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$lists = $proxy->osGetPackageRight($businessId, $roleCode, $modelId, $nodePath);
		
		//print_r($lists); die();
		
		$jsonData = array('page'=>1,'total'=>1,'rows'=>array());
		foreach ($lists as $list)
		{
			$id = property_exists($list, 'rightId') ? $list->rightId : '';
			$entry = array(
					'id'=>$id,
					'cell'=>array(
							'ids'=>"<input type='checkbox' name='".$inputName."' id='".$id."' />",
							'edits'=>"<input id='".$id."' type='button' class='edits' />",
							'leveltype'=>property_exists($list, 'rightType') ? $list -> rightType : '',
							'condition'=>property_exists($list, 'condition') ? $list -> condition : ''
					)
			);
			
			$jsonData['rows'][] = $entry;
			
		}
		
		echo json_encode($jsonData);
	}
	
	// 保存菜单权限设置@方吉祥 [20130708停用]
	public function OsSaveMenuAuthorize()
	{
		$code = $_POST['code'];
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$isok = $proxy->OsSaveMenuAuthorize($code,$id, $userId);
		echo $isok;
	}
	
	// 保存目录权限设置@方吉祥[20130709停用]
	public function OsSaveCatalogAuthorize()
	{
		$businessId = $_POST['bid'];
		$roleCode = $_POST['code'];
		$modelId = $_POST['mid'];
		$user = $this->GetUserInfo();
		
		//userid,operation,operationdetail 写日志用
		$params = array(
				'selectedNodeIds' => $_POST['path'],
				'userid'=>$user['userId'],
				'operation'=>'保存',
				'operationdetail'=>'保存目录权限'
			);
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$isok = $proxy->osSaveCatalogAuthorize($businessId, $roleCode, $modelId, json_encode($params));
		echo $isok;
	}
	
	// 保存数据权限设置@方吉祥[20130712停用]
	public function OsAddPackageRight()
	{
		$businessId = $_POST['bid'];
		$modelId = $_POST['mid'];
		$roleCode = $_POST['code'];
		$nodePath = $_POST['path'];
		$conditionCn = $_POST['conditionsCn'];
		$conditionAndRights['condition'] =  isset($_POST['conditions']) ? $_POST['conditions'] : array();
		$conditionAndRights['rights'] = isset($_POST['rights']) ? $_POST['rights'] : array();
		$user = $this->GetUserInfo();
		//print_r($conditionAndRights); die();

		$params = array(
				'conditionAndRights' => $conditionAndRights,
				'userid'=> $user['userId'],
				'operation'=> '保存',
				'operationdetail'=> '保存数据权限',
		        'detail'=> $conditionCn
		);
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		if(isset($_POST['deleteId'])){
			$deleteId = $_POST['deleteId'];
			$isMap = $proxy->updateDataAuth($businessId, $modelId, $roleCode, $nodePath, json_encode($params), $deleteId);
		}else{
			$isMap = $proxy->osAddPackageRight($businessId, $modelId, $roleCode, $nodePath, json_encode($params));
		}		
		//print_r($isMap); die();
		echo json_encode($isMap);
	}
	
	// 删除数据权限@方吉祥
	public function OsDeletePackageRight()
	{
		//print_r($_POST); die();
		$userid = $this->getUser()->getId();
		$businessId = $_POST['bid'];
		$modelId = $_POST['mid'];
		$roleCode = $_POST['code'];
		$nodePath = $_POST['path'];
		$rightIds = $_POST['rightIds'];
		
		$authservice = $this->exec("getProxy", "escloud_authservice");
		$result = $authservice->osDeletePackageRight($businessId,$modelId,$roleCode,$nodePath,$rightIds,$userid);
		echo $result;
	}
	
	
	//添加规则
	public function add_rule()
	{
		$sId = $_POST['sId'];
		$isfile = $_POST['isfile'];
		$options = "<option value='EMPTY'>请选择</option>";
		$joptions = array();
		/** xiaoxiong 20140909 对电子文件级做特殊处理 **/
		if($isfile == '0' || $isfile == '2'){
			$proxy = $this->exec("getProxy", "escloud_structurews");
			/** guolanrui 20140728 修改获取字段的方法，将系统字段中去掉 限制利用、销毁状态、是否在库、业务系统标识、案卷卷内关联标识 BUG：192 **/
// 			$lists = $proxy->getStrucAllWithSysTagList($sId);
			$lists = $proxy->getStrucAllWithSysTagListForRole($sId);
			foreach ($lists as $list)
			{
				$options .= "<option value='".$list->NAME."'>".$list->ESIDENTIFIER."</option>";
				$joptions[$list->NAME] = $list->ESIDENTIFIER;
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
		$sId = $_POST['sId'];
		$authId = $_POST['authId'];
		$isfile = $_POST['isfile'];
		/** xiaoxiong 20140909 对电子文件级做特殊处理 **/
		if($isfile == '0'){
			$struProxy = $this->exec("getProxy", "escloud_structurews");
			/** guolanrui 20140728 修改获取字段的方法，将系统字段中去掉 限制利用、销毁状态、是否在库、业务系统标识、案卷卷内关联标识 BUG：192 **/
//	 		$lists = $struProxy->getStrucAllWithSysTagList($sId);
			$lists = $struProxy->getStrucAllWithSysTagListForRole($sId);
			$options = array('EMPTY'=>'请选择');
			foreach ($lists as $list)
			{
				$options[$list->NAME] = $list->ESIDENTIFIER;
			}
		} else {
			$options = array('EMPTY'=>'请选择');
			$options['ESSTYPE'] = '文件类别';
			$options['ESFILETYPE'] = '附件类型';
			$options['ESTITLE'] = '文件名称';
		}
		$authProxy = $this->exec("getProxy", "escloud_authservice");
		$data = $authProxy->getDataAuthById($authId);
		$map['data'] = $data;
		$map['options'] = $options;
		$map['joptions'] = json_encode($options);
		$map['isfile'] = $isfile;
		
		return $this->renderTemplate($map);
	}
	
	//删除规则 [20130704 停用]
	public function BatchDeleteRole()
	{
		$roleCode = $_POST['code'];
		$roleCodes = explode('|', $roleCode);
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$isok = $proxy->batchDeleteRole(json_encode($roleCodes));
		echo $isok; //return bool
	}
	
	/*
	 * 获只取自己省的机构
	 * 方吉祥
	 * 20130509
	 */
	public function GetOwnOrgByUserId()
	{
		$userInfo = $this->GetUserInfo();
		$proxy = $this->exec("getProxy", "escloud_consumerservice");
		$lists = $proxy->getOwnOrgByUserId($userInfo['userId']);
		//print_r($lists); die;
		$nodes = array();
		if(!count($lists->list)){
			echo json_encode($nodes);
			return;
		}
		
		foreach ($lists->list as $i => $list)
		{
			
			$isOpen = $lists->pid == $list->orgid ? true : false;
			$nodes[] = array(
							'id'=> $list->orgid,
							'pId'=> $list->parentOrgCode,
							'name'=> $list->orgNameDisplay,
							'isParent'=> true,
							'open'=> $isOpen
						);
		}
		//print_r($nodes); die;
		echo json_encode($nodes);
		
	}
	
	/*
	 * 添加角色
	 * @author jixiangFang
	 */
	
	public function addRole()
	{
		//print_r($_POST); die;
		$data['roleId'] = $_POST['id'];
		$data['roleCode'] = $_POST['code'];
		$data['roleName'] = $_POST['name'];
		$data['isSystem'] = $_POST['isSystem'];
		$data['roleRemark'] = $_POST['remark'];
		
		$user = $this->GetUserInfo();
		$data['userId'] = $user['userId'];
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		echo $proxy->addRole(json_encode($data));
	}

	/**
	 * 查询系统的所有的角色
	 * @author fangjixiang 20130704
	 * @param start 第几页
	 * @param limt  显示多少
	 * @param  userid
	 * @return
	 */
	public function GetAllRoleList()
	{
		//liuhezeng 20140617 添加大机构ID，支持SAAS
		$userInfo = $this->getUser()->getId();
		$userBigOrgId = $this->getUser()->getBigOrgId() ;
		$keyWord = isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$size = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$dataPos['keyWord'] = $keyWord;
		$dataPos['start'] = $page;
		$dataPos['limit'] = $size;
		$dataPos['userId'] = $userInfo;
		$dataPos['bigOrgId'] = $userBigOrgId;
		$postData = json_encode($dataPos);
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
// 		if(isset($_POST['query']['roleCode'])){ //根据角色标识搜索查询角色
// 			$roleCode = $_POST['query']['roleCode'];
// 			$result = $proxy->secrchRoleCode($page, $size, $roleCode, $userInfo , $userBigOrgId);
// 		}else{
			
// 			$result = $proxy->getAllRoleList($page, $size, $userInfo , $userBigOrgId);
// 		}
		$result = $proxy->getAllRoleListForKeword($postData);
		//判断当前用户是否拥有admin角色 yzh 20131018
		$isAdmin=$this->checkAdmin();
		
		$total = $result->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if(!$total){
		
			echo json_encode($jsonData);
			return;
		}
		$start = ($page-1)*$size+1;
		foreach ($result->list as $row)
		{
				
			$id = $row->roleId;
			$code = $row->roleCode;
			$name = $row->roleName;
			$remark = $row->roleRemark;
			$isSystem = $row->isSystem;
			
			$base = "id='". $id ."' code='". $code ."' isSystem='". $isSystem ."'";
			$public = $base." name='". $name ."' remark='". $remark ."'";
			//判断当前用户是否拥有admin角色进行授权的控制 yzh 20131018
// 			if($isAdmin=='isAdmin'){
				$menu="<input title='功能授权' ". $public ." type='button' class='menus'/>";
				$dir="<input title='目录授权' ". $public ." type='button' class='dirs' />";
				$data="<input title='数据授权' ". $public ." type='button' class='datas' />";
// 			}else{
// 				if($isSystem=='1'){
// 					$menu="<input title='功能授权' ". $public ." type='button' class='menus'/>";
// 					$dir="<input title='目录授权' ". $public ." type='button' class='dirs' />";
// 					$data="<input title='数据授权' ". $public ." type='button' class='datas' />";
// 				}elseif($isSystem=='0'){
// 					$menu="<input title='用户非admin角色，不能功能授权' ". $public ." type='button' class='menus' disabled='disabled' style='cursor:not-allowed;'/>";
// 					$dir="<input title='用户非admin角色，不能目录授权' ". $public ." type='button' class='dirs' disabled='disabled' style='cursor:not-allowed;'/>";
// 					$data="<input title='用户非admin角色，不能数据授权' ". $public ." type='button' class='datas' disabled='disabled' style='cursor:not-allowed;'/>";
// 				}
// 			}
			//$function = "<input title='角色编辑' ". $public ." type='button' class='edits' /><input title='功能授权' ". $public ." type='button' class='menus' /><input title='目录授权' ". $public ." type='button' class='dirs' /><input title='数据授权' ". $public ." type='button' class='datas' />";
			$entry = array(
					'id'=>'',
					'cell'=>array(
							'num'=>$start,
							'cb'=> "<input type='checkbox' checkone='1' ". $base ." />",
							//'function'=> $function,
							'function'=> "<input title='角色编辑' ". $public ." type='button' class='edits' />",
							'menu'=> $menu,
							'dir'=> $dir,
							'data'=> $data,
							'code'=> $code,
							'name'=> $name,
							'remark'=> $remark,
							'isSystem'=> $isSystem == '0' ? '否' : '是'
					)
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		
		echo json_encode($jsonData);
		
	}
	
	/**
	 * 根据角色编码查找角色,修改用
	 * @author fangjixiang 20120703
	 * @param roleid 角色编码
	 * @return 角色对象
	 */
	public function GetRoleByRoleid()
	{
		$roleId = $_POST['roleId'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$mapData = $proxy->getRoleByRoleid( $roleId );
		$isAdmin=$this->checkAdmin();
		$mapData->isAdmin=$isAdmin;
		echo json_encode($mapData);
	}
	/**
	 * 添加角色页面的渲染
	 * @author yzh 20131018
	 */
	public function add_role(){
		$isAdmin=$this->checkAdmin();
		return $this->renderTemplate(array('isAdmin'=>$isAdmin));
	}
	/**
	 * 判断当前用户是否拥有admin角色
	 * @author yzh 20131018
	 */
	private function checkAdmin(){
		$userId=$this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$isAdmin=$proxy->isAdmin($userId);
		if($isAdmin){
			$isAdmin='isAdmin';
		}else{
			$isAdmin='noAdmin';
		}
		return $isAdmin;
	}
	/**
	 * 检测角色编码的唯一性
	 * @author fangjixiang 20130704
	 * @param roleCode
	 * @return true 为唯一的 false 则不是唯一的
	 */
	public function CheckRoleCode()
	{
		$roleCode = $_POST['roleCode'];
	
		//print_r($roleCode); die;
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		echo $proxy->checkRoleCode($roleCode);
		
	}
	
	/*
	 * 
	 * @see 删除角色
	 * @author fangjixiang 20130703 
	 * @param roleId 角色唯一标识
	 * @return
	 */
	public function RemoveRole()
	{
		$roleIds = $_POST['roleIds'];
		
		//print_r($roleIds); die;
		$uId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$isok = $proxy->removeRole($uId, json_encode($roleIds));
		echo $isok;
	}
	

	/**
	 * 获取角色所拥有的功能权限，并标识出勾选该角色具备权限的功能权限
	 * @author yanggaofei  20130705
	* @param roleId 角色编码
	 * @param userId 当前用户账户id
	 * @return 返回全部菜单，并标识有权限的菜单
	 */
	public function getMenuAuth()
	{
		
		$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$userId = $userInfo['userId'];
		$bigOrgId = $this->getUser()->getBigOrgId();
		$proxy = $this->exec("getProxy", "escloud_menuservice");
	 	$map = $proxy->getMenuAuth($userId, $roleId , $bigOrgId );
		//print_r($map);
	 	$nodes = array(); // init
	 	$nodes[0]=array("id"=>0,"name"=>"功能菜单","open"=>true,'checked'=>null);//20140507 wangbo  增加根节点"功能菜单"
	 	$rootNodeChecked = null;//guolanrui 20140716 增加根节点是否选中的标识，用于解决根节点始终是选中状态的BUG
	 	foreach ($map-> menuList as $node){
	 		if($rootNodeChecked == null && $node->checked){
	 			$rootNodeChecked = $node->checked;
	 		}
	 		$nodes[]= array(
	 				'id'=> $node->id,
	 				'pId'=> $node->pid,
	 				'name'=> $node->title,
	 				'checked'=> $node->checked,
	 				//'isParent'=>$val->isParent,
	 			//	'open'=> true
	 		);
	 	}
	 	if($rootNodeChecked != null){
	 		$nodes[0]=array("id"=>0,"name"=>"功能菜单","open"=>true,'checked'=>$rootNodeChecked);
	 	}
// 	 	$mynodes = array("name"=>"功能菜单","open"=>true,"children"=>$nodes);
	 	echo json_encode(array('nodes'=>$nodes, 'resourId'=> $map->resourid));
	}
	
	/**
	 * @see 保存角色的功能权限
	 * @author fangjixiang 20130705
	 * @param resourceId 功能权限的id（若存在为编辑，不存在为添加）
	 * @param roleId 角色编码
	 * @param selectedMenuIds 勾选的目录节点
	 * @return 成功返回true失败返回false
	 */
	public function saveMenuAuth()
	{
		//print_r($_POST); die;
		$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$userId = $userInfo['userId'];
		$resourId = $_POST['resourId'];
		$checkedNodes = $_POST['checkeds'];
		
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		echo $proxy->saveMenuAuth($resourId, $roleId, $checkedNodes, $userId);
		
	}
	
	/**
	 * 保存目录权限
	 * @author fangjixiang 20130708
	 * @param roleId
	 * @param modelId
	 * @param userid
	 * @return
	 */
	public function getTreeNodes()
	{
		//print_r($_POST); die;
		$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$userId = $userInfo['userId'];
		$bussModelId = $_POST['bussModelId'];
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$mapNodes = $proxy->getTreeNodes($roleId, $bussModelId, $userId);
		//print_r($mapNodes); die;
		$nodes = array(); // init
		foreach ($mapNodes as $node)
		{
			$nodes[]= array(
					'id'=> $node->id,
					'pId'=> $node->pId,
					'name'=> $node->name.($node->rights==''?'':('['.$node->rights.']')),
					'realname'=> $node->name,/** xiaoxiong 20140804 节点默认权限 **/
					'checked'=> $node->checked,
					'path'=> $node->path,
					'open'=> $node->pId == '0' ? true : false,
					'isLeaf'=> $node->isLeaf,/** xiaoxiong 20140804 节点默认权限 **/
					'rights'=> ($node->checked?$node->rights:($node->rights==''?'DR,FR':$node->rights)),/** xiaoxiong 20140804 节点默认权限 **/
					'oldrights'=> $node->rights/** xiaoxiong 20140804 节点默认权限 **/
			);
		}
		
		echo json_encode($nodes);
	}
	
	/**
	 *  保存修改目录权限（保存页面最终确定的节点的方法）
	 * @author fangjixiang 20130826
	 * @param roleId
	 * @param bussModelId
	 * @param userid
	 * @param ip
	 * @param nodepathMap map中deletePath 为要删除的节点 savePath为最终要保存的path
	 * @return
	 */
	public function saveAuthTreeNode()
	{
		
		//print_r($_POST); die;
		$userId = $this->getUser()->getId();
		$roleId = $_POST['roleId'];
		$bussModelId = $_POST['bussModelId'];
		$path['savePath'] = isset($_POST['savePath']) ? $_POST['savePath'] : array();
		$path['deletePath'] = isset($_POST['deletePath']) ? $_POST['deletePath'] : array();
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		echo $proxy->saveAuthTreeNode($roleId, $bussModelId, $userId, json_encode($path));
		
	}
	
	/**
	 * 根据角色、model获取一个业务的model下，角色所拥有的目录树节点 （ 用于数据授权时，获取权限范围内的目录树）
	 * @author fangjixiang 20130709
	 * @param roleId
	 * @param modelId
	 * @param userid
	 * @return
	 */
	public function getCheckedTreeNodes()
	{
		$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$userId = $userInfo['userId'];
		$bussModelId = $_POST['bussModelId'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		$mapNode = $proxy->getCheckedTreeNodes($roleId, $bussModelId, $userId);
		//print_r($mapNode);
		$nodes = array();
		foreach ($mapNode as $node)
		{
		
			$path = str_replace('/', '-', $node->path); //replace '/' to '-'
			$nodes[]= array(
					'id'=> $node->id,
					'pId'=> $node->pId,
					'name'=> $node->name,
					'treeId'=> $node->treeId,
					'path'=> $path,
					'isParent'=> $node->isParent,
					'sId'=> $node->sId,
					'open'=> true
			);
		}
		
		echo json_encode($nodes);
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
		//print_r($_POST);die;
		$userInfo = $this->GetUserInfo();
		$roleId = $_POST['roleId'];
		$userId = $userInfo['userId'];
		$bussModelId = $_POST['bussModelId'];
		$treeId = $_POST['treeId'];
		$path = $_POST['path'];
		$data = $_POST['data'];
		//print_r($data);die;
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$result = $proxy->saveDataAuth($treeId, $roleId, $bussModelId, $path, $userId, json_encode($data));
		echo json_encode($result);
		
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
		$userInfo = $this->GetUserInfo();
		$roleId = $_GET['roleId'];
		$userId = $userInfo['userId'];
		$bussModelId = $_GET['bussModelId'];
		$path = $_GET['path'];
		
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$lists = $proxy->getDataAuth($roleId, $bussModelId, $path, $userId);
		$total = $lists->total;
		if(!$total){
			return;
		}
		//print_r($lists);
		$permissions = array('fileDownload','itemDelete','itemEdit','itemRead','filePrint','fileRead');
		$permissionsCn = array('fileDownload'=>'文件下载','itemDelete'=>'条目删除','itemEdit'=>'条目编辑','itemRead'=>'条目浏览','filePrint'=>'文件打印','fileRead'=>'文件浏览');
		/** guolanrui 20140729 修改权限条件显示的样式 BUG:210 **/
		$compareValue = array('lessThan'=>'小于','greaterThan'=>'大于','notEqual'=>'不等于','equal'=>'等于','like'=>'包含','notLike'=>'不包含','greaterEqual'=>'大于等于','lessEqual'=>'小于等于');
// 		$compareValue = array('lessThan'=>'<','greaterThan'=>'>','notEqual'=>'!=','equal'=>'=','like'=>'包含','notLike'=>'不包含','greaterEqual'=>'>=','lessEqual'=>'<=');
		$relationChar = array('true'=>'并且','false'=>'或者');
		$jsonData = array('page'=> $page,'total'=> $total,'rows'=>array());
		foreach ($lists->dataList as $list)
		{
			$psarray = array(); 
			$psarrayCn = array();
			$condarray = array(); 
			$condarrayCn = array();          
			foreach ($permissions as $ps)
			{
				if($list->$ps){
					$psarray[] = $ps;
				}
				//20140508 wangbo  为了在页面显示中文条件
				if($list->$ps){
					$psarrayCn[] = $permissionsCn[$ps];
				}
			}
			//20140508 wangbo  为了在页面显示中文条件
			$eachCount = 0;
			$conditionCount = count($list->dataAuthCn);
			foreach ($list->dataAuthCn as $conditionCn){
				if($conditionCn == '全部数据'){
					$condarrayCn[] = '全部数据';
					continue;
				}
				$eachCount++;
				$conditionArray =  explode(',',$conditionCn);
// 				$condarrayCn[] = $conditionArray[0].','.$compareValue[$conditionArray[1]].','.$conditionArray[2].','.$relationChar[$conditionArray[3]]; 
				if($eachCount == $conditionCount){//guolanrui 20140716 添加判断，用于去掉最后的条件连接符
					$condarrayCn[] = '['.$conditionArray[0].'] '.$compareValue[$conditionArray[1]].' \''.$conditionArray[2].'\' '; 
				}else {
					$condarrayCn[] = '['.$conditionArray[0].'] '.$compareValue[$conditionArray[1]].' \''.$conditionArray[2].'\' &nbsp;'.$relationChar[$conditionArray[3]].'&nbsp;'; 
				}
			}
			foreach ($list->dataAuth as $condition)
			{
				$condarray[] = $condition;
			}
			$entry = array(
					'id'=> $list->id,
					'cell'=>array(
							'cbox'=> "<input type='checkbox' checkone='1' id='". $list->id ."' />",
							'operation'=> "<input id='". $list->id ."' type='button' class='edits' />",
							'condition'=> implode(';', $condarray),
							'permission'=> implode(',', $psarray),
// 							'conditionCn'=> implode(';', $condarrayCn),
							'conditionCn'=> implode(' ', $condarrayCn),
							'permissionCn'=> implode(',', $psarrayCn)
					)
			);
			$jsonData['rows'][] = $entry;
		}
		//print_r($jsonData); die;
		echo json_encode($jsonData);
	}
	
	
	/**
	 * 根据id删除数据权限
	 * @author fangjixiang 20130711
	 * @param ids
	 * @return
	 */
	public function deleteDataAuth()
	{
		//print_r($_POST); die;
		$uId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_authservice");
		echo $proxy->deleteDataAuth($uId, json_encode($_POST['authId']), $_POST['roleId'], $_POST['bussModelId']);
		
	}
	/**
	 * 设置是否跨部门
	 * @author: niyang
	 * @date: 2013-10-14
	 * @return
	 */
	public function setTransDepartment(){
		$treeid = $_GET['treeid'];
		$istransdepartment = $_GET['istransdepartment'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		echo $proxy->setTransDepartment($treeid,$istransdepartment);
	}
	
	/**
	 * 获取是否跨部门
	 * @author: niyang
	 * @date: 2013-10-14
	 * @return
	 */
	public function getTransDepartment(){
		$treeid = $_GET['treeid'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		echo $proxy->getTransDepartment($treeid);
	}	

	/**
	 * 设置数据权限是否优先级
	 * 数据权限是否优先，若为true则获取数据时和org的关系为OR 否则和数据权限的关系为and
	 * @author niyang 2013-10-31
	 */
	public function setDataAuthPriority() {
		$treeid = $_REQUEST['treeid'];
		$isDataAuthPriority = $_REQUEST['isDataAuthPriority'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		echo $proxy->setDataAuthPriority($treeid,$isDataAuthPriority);
	}

	/**
	 * 获取是否优先数据权限（若优先则和org的关系为or否则为and）
	 * @author niyang 2013-10-31
	 */
	public function getDataAuthPriority() {
		$treeid = $_REQUEST['treeid'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		echo $proxy->getDataAuthPriority($treeid);			
	}	
}