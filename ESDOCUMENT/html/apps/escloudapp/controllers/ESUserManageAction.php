<?php
/**
 * 用户管理
 * @author zhangjirimutu
 *@DATA 20120829
 */
class ESUserManageAction extends ESActionBase
{
	// 获取用户信息
	public function GetUserInfo()
	{
		$uid = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($uid);
		$info = array(
				'userId' => $userInfo->userid,
				'displayName' => $userInfo->displayName
		);
		return $info;
	}
	
	
	// 页面载入时获取一级树@方吉祥  return [{},{}]
	public function GetCompanyList()
	{
		$res = $this->exec("getProxy", "escloud_consumerservice")->getCompanyList();
		
// 		var_dump($res);
// 		die();
		
		$zNodes = array();
		$zNodes[] = array('id'=>1,'pId'=>0,'name'=>'用户管理','open'=>true);
		foreach ($res as $value)
		{
			$zNodes[] = array('id'=>$value->orgid,'pId'=>1,'name'=>$value->orgNameDisplay, 'isParent'=>true, 'open'=>false);	
		}
		echo json_encode($zNodes);
	}
	
	// 根据节点id获取二级树@方吉祥  return [{},{}]#不能获取到子节点###暂时不用
	public function GetSubOrgList()
	{
		$id = $_POST['id'];
		$res = $this->exec("getProxy", "escloud_consumerservice")->getSubOrgList($id);
		$zNodes = array();
		foreach ($res as $value)
		{
			$zNodes[] = array('id'=>$value->orgid,'pId'=>$value->parentOrgCode,'name'=>$value->orgNameDisplay,'isParent'=>true, 'open'=>true);
		}
		echo json_encode($zNodes);
	}
	
	// 根据节点id获取二级树@方吉祥  return [{},{}]
	public function GetOrgList()
	{
		$id = $_POST['id'];
		$res = $this->exec("getProxy", "escloud_consumerservice")->getOrgList($id);
		
		//print_r($res); die();
		$zNodes = array();
		foreach ($res as $value)
		{
			$zNodes[] = array('id'=>$value->orgid,'pId'=>$value->parentOrgCode,'name'=>$value->orgNameDisplay,'isParent'=>true, 'open'=>true);
		}
		echo json_encode($zNodes);
	}
	
	
	// 根据组织编码(orgid)查找人员@方吉祥  return [''=>{{},''=>{''=>''},{},''=>'']
	public function FindUserListByOrgid()
	{
		$orgid = $_GET['orgid'];	// id == orgid
		$radio = isset($_GET['radio'])?$_GET['radio']:'';//用户判断显示单选框还是复选框
		if($radio){
			$type='radio';
		}else{
			$type='checkbox';
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start = ($page-1)*$limit;
// 		die($orgId);
		$res = $this->exec("getProxy", "escloud_consumerservice")->findUserListByOrgid($orgid,$start,$limit);
		$total = isset($_POST['total']) ? $_POST['total'] : $res->total;
		
// 		print_r($res);
// 		die();
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($res->total > 0){
			foreach($res->dataList AS $value){
				$entry = array(
						'id'=>$value->userid,
						'cell'=>array(
								'id'=>"<input type='".$type."' id='".$value->userid."' name='checks' />",
								'edit'=>"<input type='button' id='".$value->userid."' title='".$value->displayName."' class='edit' />",
								'userid'=>$value->userid,	// user id
								'displayName'=>$value->displayName,	// user name
								'mobTel'=>$value->mobTel,	// user Mobile phone
								'emailAddress'=>$value->emailAddress,	// user email
								'officeTel'=>$value->officeTel,	// Company telephone
								'telephonenumber'=>$value->deptEntry->telephonenumber,	// Home phone
								'orgName'=>$value->deptEntry->orgNameDisplay,	//	user org name
								'userStatus'=>$value->userStatus		// user status
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		echo json_encode($jsonData);
	}
	
	// 获取系统角色
	public function GetSystemRole()
	{
		$user = $this->GetUserInfo();
		$userId = $user['userId'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$systemRole = $proxy ->findRoleList($userId);		// 获取系统所有角色
		
		$systemRolelist = '';
		
		foreach ($systemRole as $value)
		{
			$systemRolelist .= "<li id='".$value->roleCode."' title='".$value->roleName."'>".$value->roleName."</li>";
		}
		
		return $this->renderTemplate(array('systemRolelist'=>$systemRolelist));
	}
	
	
	// 获取角色信息@方吉祥 return [{},{}]
	public function GetUserRole()
	{
		
		$userId = $_POST['userId'];
		$info = $this->exec("getProxy", "user")->getUserInfo($userId);
		//print_r($info); die;
		$uInfo = array(
					'name'=> $info->displayName,
					'org'=> $info->deptEntry->orgNameDisplay,
					'email'=> $info->emailAddress,
					'mobtel'=> $info->mobTel,
					'officetel'=> $info->officeTel,
					'roomtel'=> $info->deptEntry->telephonenumber
				);
		
		$noSelectRolelist = '';	// 系统角色初始化
		$alreadySelectRolelist = '';	// 已选角色初始化
		
		// 查询未选择系统角色信息
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$noSelectRole = $proxy->findNoSelectRoleListByAccountid($userId);	//accountId 当前用户ID
		
		foreach ($noSelectRole as $value)
		{
			$noSelectRolelist .= "<li id='".$value->roleCode."' title='".$value->roleName."'>".$value->roleName."</li>";
		}
		
		// 获取已经选择的角色列表
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$alreadySelectRole = $proxy->findRoleListByAccountid($userId);
		foreach ($alreadySelectRole as $value)
		{
			$alreadySelectRolelist .= "<li id='".$value->roleCode."' title='".$value->roleName."'>".$value->roleName."</li>";
		}
			
		//var_dump($alreadySelectRole);
		return $this->renderTemplate(array('info'=>$uInfo, 'noSelectRolelist'=>$noSelectRolelist,'alreadySelectRolelist'=>$alreadySelectRolelist));
	}
	
	// 设置用户角色@方吉祥 return true/false[20130718 停用]
	public function SaveSelectRoleForAccountid()
	{
	    //print_r($_POST); die;
	    $userid = $this->getUser()->getId();
		$useRole = isset($_POST['useRole']) ? $_POST['useRole'] : array();
		$userId = $_POST['userId'];
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$bool = $proxy->saveSelectRoleForAccountid($userId, json_encode($useRole), $userid);
		echo $bool;
	}
	
	/**
	 *
	 * @see 给用户绑定角色页面
	 * @author lijianguang 2013-7-8
	 * @param accountIds
	 * @param roleCodeList
	 * @param userid
	 * @param ip
	 * @return
	 */
	public function bind_role()
	{

		$batch = $_POST['batch'];
		$uId = $_POST['uId'];
		$onlineUser = $this->getUser()->getId();
				
		
		$info = false;
		$system_role = $use_role = '';
		$proxy = $this->exec("getProxy", "escloud_authservice");
		
		if($batch){
			
			$list = $proxy->getAllroleByUserId($onlineUser);
			foreach($list as $row)
			{
				$system_role .= '<li id="'. $row->roleId .'">'. $row->roleName .'</li>';
			}
			
			$data['batch'] = true;
			$data['system_role'] = $system_role;
			$data['use_role'] = $use_role;
			//print_r($list);die;
			return $this->renderTemplate($data);
			
		}else{
			$info = $this->exec("getProxy", "user")->getUserInfo($uId);
			//print_r($info);die;
			$proxy = $this->exec("getProxy", "escloud_authservice");
			$list = $proxy->getRolesforUser($uId, $onlineUser);
			//print_r($list);die;
			
			foreach($list->noselectroles as $row)
			{
				$system_role .= '<li id="'. $row->roleId .'">'. $row->roleName .'</li>';
			}
			foreach ($list->selectroles as $row)
			{
				$use_role .= '<li id="'. $row->roleId .'">'. $row->roleName .'</li>';
			}
			
			$data['info'] = $info;
			$data['batch'] = false;
			$data['system_role'] = $system_role;
			$data['use_role'] = $use_role;
			
			return $this->renderTemplate($data);
		}
		
	}
	
	/**
	 * 
	 * @see 给用户绑定角色
	 * @author lijianguang 2013-7-8 
	 * @param accountIds
	 * @param roleCodeList
	 * @param userid
	 * @param ip
	 * @return
	 */
	public function bindingRolesForAccountid()
	{
		$uId = $this->getUser()->getId();
		
		
		if(!isset($_POST['roleIds'])){
			$_POST['roleIds'] = array();
		}
		$param = $_POST;
		//print_r($param); die;
		$proxy = $this->exec("getProxy", "escloud_authservice");
		$bool = $proxy->bindingRolesForAccountid($uId, json_encode($param));
		echo $bool;
	}
}