<?php
/**
 * 角色管理前台页面
 * @author wangbo
 * @Date 20140423
 */
class ESRoleAction extends ESActionBase {
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	// 获取所有角色数据信息
	public function findRoleList() {
		$request = $this->getRequest ();
		$userId = $this->getUser ()->getId ();
		$bigOrgId = $this->getUser ()->getBigOrgId ();
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$roleServerProxy = $this->exec ( "getProxy", 'escloud_rolews' );
		$countData ['keyWord'] = $keyWord;
		$countData ['userId'] = $userId;
		$countData ['bigOrgId'] = $bigOrgId;
		$countCanshu = json_encode ( $countData );
		$total = $roleServerProxy->getCountAll ( $countCanshu );
		$roleServerProxy = $this->exec ( "getProxy", 'escloud_rolews' );
		$data ['userId'] = $userId;
		$data ['bigOrgId'] = $bigOrgId;
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
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
							"ids" => '<input type="checkbox"  class="checkbox" isSystem="'.$row->isSystem.'"  name="roleServerId" value="' . $row->roleId . '" id="roleServerId">',
							"operate" => "<span class='editbtn' >&nbsp;</span>",
							"roleId" => $row->roleId,
							"roleCode" => $row->roleCode,
							"roleName" => $row->roleName,
							"roleRemark" =>'<div class="remark">'.$row->roleRemark.'</div>',
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
	// 渲染添加角色页面
	public function add_role() {
		return $this->renderTemplate ();
	}
	// 渲染编辑角色页面
	public function edit_role() {
		$roleid = $_POST ['roleid'];
		$Proxy = $this->exec ( 'getProxy', 'escloud_rolews' );
		$roleInfo=$Proxy->getRoleByRoleid($roleid);
		return $this->renderTemplate ((array)$roleInfo);
	}
	// 添加角色
	public function addRole() {
		$bigOrgId = $this->getUser ()->getBigOrgId ();
		parse_str ( $_POST ['data'], $out );
		$out ['bigOrgId'] = $bigOrgId;
		$out['userIp'] = $this->getClientIp();
		$out['userId'] = $this->getUser()->getId();
		$data = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'escloud_rolews' );
		$result = $Proxy->addRole ( $data );
		echo $result;
	}
	// 删除角色
	public function deleteRoleList() {
		$ids = $_POST ['data'];
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$userIp = $this->getClientIp();
		$remoteAddr = $this->getClientIp();
		$Proxy = $this->exec ( 'getProxy', 'escloud_rolews' );
		$result = $Proxy->deleteRoleList (json_encode(array('ids'=>$ids,'userId'=>$userId,'bigOrgId'=>$bigOrgId,'remoteAddr'=>$remoteAddr,'userIp'=>$userIp)));
		echo $result;
	}
	//判断是否已存相同角色标识
	public function  judgeIfExistsRoleCode(){
		$id= $_POST['id'];
		$rolecode = $_POST['rolecode'];
		$Proxy = $this->exec ( 'getProxy', 'escloud_rolews' );
		$result=$Proxy->judgeIfExistsRoleCode(json_encode(array('id'=>$id,'rolecode'=>$rolecode)));
		echo $result;
	}
	//判断是否已存相同角色标识
	public function  judgeIfExistsRoleName(){
		$id= $_POST['id'];
		$rolename = $_POST['rolename'];
		$Proxy = $this->exec ( 'getProxy', 'escloud_rolews' );
		$result=$Proxy->judgeIfExistsRoleName(json_encode(array('id'=>$id,'rolename'=>$rolename)));
		echo $result;
	}
}
?>