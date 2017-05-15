<?php
/**
 *
 * @author wangbo  机构和用户管理
 * @Date 20140402
 */
class ESOrgAndUserAction extends ESActionBase
{
	   //默认访问的方法，渲染主界面
       public function index(){
          return $this->renderTemplate();
	   }
	   //删除用户
	   public function deleteUserList(){
	   	  $userIds = $_POST['ids'];
	      $Proxy = $this->exec("getProxy", 'escloud_orgAndUserws');
	      $result = $Proxy->deleteUserList($userIds);
	   	  echo $result;
	   }
	   //渲染添加用户的页面
	   public function add_user(){
		   	$data=$_GET['data'];
		   	$datas = explode(',',$data);
		   	return $this->renderTemplate(array('data'=>$datas));
	   }
	   //添加用户
	   public function addUser(){
		  parse_str($_POST['data'],$out);
		  $data=json_encode($out);
		  $Proxy=$this->exec('getProxy','escloud_orgAndUserws');
		  $result=$Proxy->addUser($data);
		  echo $result;
	   }
	   //添加用户
	   public function updateUser(){
	   	parse_str($_POST['data'],$out);
	   	$data=json_encode($out);
	   	$Proxy=$this->exec('getProxy','onlinefile_orgAndUserws');
	   	$result=$Proxy->updateUser($data);
	   	echo $result;
	   }
	   //用户展现
	   public function findUserListByOrgid(){
		   	$request=$this->getRequest();
		   	$orgSeq = $request->getGet('orgSeq');
		   	$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		   	$page = isset($_POST['page']) ? $_POST['page'] : 1;
		   	$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		   	$orgAndUserProxy = $this->exec("getProxy", 'escloud_orgAndUserws');
		   	$data['startNo']  = ($page-1)*$rp;
		   	$data['limit'] = $rp;
		   	$data['keyWord'] = $keyWord;
		   	$data['orgSeq'] = $orgSeq;
		   	$canshu = json_encode($data);
		   	$rows = $orgAndUserProxy->findUserListByOrgid($canshu);
		   	$countData['keyWord'] = $keyWord;
		   	$countData['orgSeq'] = $orgSeq;
		   	$countCanshu = json_encode($countData);
		   	$total = $orgAndUserProxy->getCountAll($countCanshu);
		  	$start=($page-1)*$rp;
		   	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		   	foreach ($rows as $row){
		   		$entry = array("id"=>$row->id,
		   				"cell"=>array(
		   						"startNum"=>$start+1,
		   						"ids"=>'<input type="checkbox"  class="checkbox"  name="userId" value="'.$row->id.'" id="userId">',
		   						"id"=>$row->id,
		   						"userid"=>$row->userid,
		   						"operate"=>"<span class='editbtn' >&nbsp;</span>",
		   						"firstName"=>$row->firstName,
		   						"lastName"=>$row->lastName,
		   						"Name"=>$row->lastName.$row->firstName,
		   						"userStatus"=>$row->userStatus,
		   						"mobTel"=>$row->mobTel,
		   						"emailAddress"=>$row->emailAddress,
		   				),
		   		);
		   		$jsonData['rows'][] = $entry;
		   		$start++;
		   	}
		   	echo json_encode($jsonData);
	   }
	   //编辑用户
	   public function edit_user(){
		   	$colValues=$_GET['data'];
		   	$data = explode('|',$colValues);
// 		   	echo $colValues;
		   	return $this->renderTemplate(array('data'=>$data));
	   }
	   
	   /**
	    * 左侧树数据显示
	    * @author ldm
	    */
	   public function getOrgListTree(){
	   		$userId = $this->getUser()->getId();
// 	   		echo json_encode($this->getUser());
	     	$appId=$_GET['appId'];
// 	     	$data['appId']  = $appId;
	     	$data['bigOrgId'] = $this->getUser()->getBigOrgId();
	     	$data['userId'] = $userId;
	     	$canshu = json_encode($data);
		   	$proxy = $this->exec('getProxy','escloud_orgAndUserws');
		   	$lists = $proxy->getOrgListTree($canshu);
		   	$jsonData1= array();
		   	$jsonData = array('name'=>'机构设置','id'=>'org','open'=>true,'children'=>array());
		   	foreach ($lists as $row){
		   		$entry = array("name"=>$row->name,"id"=>$row->id,"pId"=>$row->pId,"isParent"=>$row->isParent,"idseq"=>$row->idseq,"cuncorgclass"=>$row->cuncorgclass,"address"=>$row->address,"orgsort"=>$row->orgsort,"mainsite"=>$row->mainsite,"orgstatus"=>$row->orgstatus);
		   		$jsonData['children'][] = $entry;
		   	}
		   	$jsonData1[0]=$jsonData;
		   	echo json_encode($jsonData1);
		   	
	   }
	   /**
	    * 展开树
	    * @author ldm
	    */
	   public function expandOrgListTree(){
	   	$parentId=$_GET['id'];
	   	$data['parentId']  = $parentId;
	   	$canshu = json_encode($data);
	   	$proxy = $this->exec('getProxy','escloud_orgAndUserws');
	   	$lists = $proxy->getOrgListTree($canshu);
	   	$result = array();
	   	foreach ($lists as $k=>$val){
	   		$result[$k]["name"] = $val->name;
	   		$result[$k]["pId"] = $val->pId;
	   		$result[$k]["id"] = $val->id;
	   		$result[$k]["isParent"] =  $val->isParent;
	   		$result[$k]["idseq"]=$val->idseq;
	   		$result[$k]["cuncorgclass"] = $val->cuncorgclass;
	   		$result[$k]["address"] = $val->address;
	   		$result[$k]["orgsort"] = $val->orgsort;
	   		$result[$k]["mainsite"]=$val->mainsite;
	   		$result[$k]["orgstatus"]=$val->orgstatus;
	   	}
	   	echo json_encode($result);
	   }
	   //获取左侧的应用列表
	   public function getAppList(){
	   	$appproxy = $this->exec("getProxy", 'escloud_orgAndUserws');
	   	$data['startNo']  = -1;
	   	$data['limit'] = -1;
	   	$data['keyWord'] = '';
	   	$canshu = json_encode($data);
	   	$appData = $appproxy->getAppList($canshu);
	   	$jsonData1= array();
	   	$jsonData = array('name'=>'应用列表','open'=>true,'children'=>array());
	   	foreach ($appData as $row){
	   		$entry = array("name"=>$row->appNameCn,"id"=>$row->id);
	   		$jsonData['children'][] = $entry;
	   	}
	   	$jsonData1[0]=$jsonData;
	   	echo json_encode($jsonData1);
	   }
	   //渲染添加机构页面
	   public function add_org(){
		   	$data=$_GET['data'];
		   	$datas = explode(',',$data);
		   	return $this->renderTemplate(array('data'=>$datas));
	   }
	   //添加机构
	   public function addOrg(){
		   	parse_str($_POST['data'],$out);
		   	$data=json_encode($out);
		   	$Proxy=$this->exec('getProxy','escloud_orgAndUserws');
		   	$result=$Proxy->addOrg($data);
		   	$entry = array("res"=>$result->res,"id"=>$result->maxId);
		  	echo json_encode($entry);
	   }
	   //删除机构及其子机构，以及这些机构下的用户
	   public function delOrg(){
		   	$data=$_POST['data'];
		   	$josnp['orgId'] = $data;
		   	$canshu=json_encode($josnp);
		   	$Proxy=$this->exec('getProxy','escloud_orgAndUserws');
		   	$result=$Proxy->deleteOrgEntry($canshu);
		   	echo $result;
	   }
	   //渲染编辑机构的页面
	   public function edit_org(){
		   	$data=$_GET['data'];
		   	$datas = explode(',',$data);
		   	return $this->renderTemplate(array('data'=>$datas));
	   }
	   //编辑机构
	   public function editOrg(){
		   	parse_str($_POST['data'],$out);
		   	$data=json_encode($out);
		   	$Proxy=$this->exec('getProxy','escloud_orgAndUserws');
		   	$result=$Proxy->modifyOrgEntry($data);
		   	echo $result;
	   }
	   //渲染列举除去用户所属角色之外的所有角色的页面
	   public function listRole(){
		   	$data=$_GET['data'];
		   	$datas = explode('|',$data);
		   	return $this->renderTemplate(array('data'=>$datas));
	   }
	   //列举除去用户所属角色之外的所有角色
	   public function findRoleList(){
			   	$request=$this->getRequest();
	         	$appId = $request->getGet('appId');
	         	$idStr = $request->getGet('idStr');
		      	$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		      	$page = isset($_POST['page']) ? $_POST['page'] : 1;
		      	$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		      	$roleServerProxy = $this->exec("getProxy", 'escloud_orgAndUserws');
		      	$countData['keyWord'] = $keyWord;
		      	$countData['appId'] = $appId;
		      	$countData['idStr'] = $idStr;
		      	$countCanshu = json_encode($countData);
		      	$total = $roleServerProxy->getCountAllRole($countCanshu);
		      	$data['startNo']  = ($page-1)*$rp;
		      	$data['limit'] = $rp;
		      	$data['keyWord'] = $keyWord;
		      	$data['appId'] = $appId;
		      	$data['idStr'] = $idStr;
		      	$canshu = json_encode($data);
		      	$rows = $roleServerProxy->getAllRoleServer($canshu);
		      	$start=($page-1)*$rp;
		      	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		      	foreach ($rows as $row){
		      		$entry = array("id"=>$row->roleId,
		      				"cell"=>array(
		      						"startNum"=>$start+1,
		      						"ids"=>'<input type="checkbox"  class="checkbox"  name="listRoleServerId" value="'.$row->roleId.'"id="listRoleServerId">',
		      						"roleName"=>$row->roleName,
		      						"roleRemark"=>$row->roleRemark,
		      						"isSystem"=>$row->isSystem,
		      				),
		      		);
		      		$jsonData['rows'][] = $entry;
		      		$start++;
		      	}
		      	echo json_encode($jsonData);
	   }
	   public function findUserRole(){
			   	$request=$this->getRequest();
			   	$selectedRoleId = $request->getGet('selectedRoleId');
			   	$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
			   	$page = isset($_POST['page']) ? $_POST['page'] : 1;
			   	$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
			   	$roleServerProxy = $this->exec("getProxy", 'escloud_orgAndUserws');
			   	$data['startNo']  = ($page-1)*$rp;
			   	$data['limit'] = $rp;
			   	$data['keyWord'] = $keyWord;
			   	$data['selectedRoleId'] = $selectedRoleId;
			   	$canshu = json_encode($data);
			   	$rows = $roleServerProxy->getUserRole($canshu);
			   	$start=($page-1)*$rp;
			   	$total = count(explode(',',$selectedRoleId));
			   	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
			   	foreach ($rows as $row){
			   		$entry = array("id"=>$row->roleId,
			   				"cell"=>array(
			   						"startNum"=>$start+1,
			   						"ids"=>'<input type="checkbox"  class="checkbox"  name="userRoleListId" value="'.$row->roleId.'"id="userRoleListId">',
			   						"roleName"=>$row->roleName,
			   						"roleRemark"=>$row->roleRemark,
			   						"isSystem"=>$row->isSystem,
			   				),
			   		);
			   		$jsonData['rows'][] = $entry;
			   		$start++;
			   	}
			   	echo json_encode($jsonData);
	   }
	   //根据用户的id获取与该用户关联的角色id列表
	   public function getUserRoles(){
		   
		   	$userId =$_POST['userId'];
		   	 
		   	$userProxy = $this->exec("getProxy", 'escloud_orgAndUserws');
		   	$roleIds = $userProxy->getRolesByUserId($userId);
		   	echo $roleIds;
	   }
}
?>