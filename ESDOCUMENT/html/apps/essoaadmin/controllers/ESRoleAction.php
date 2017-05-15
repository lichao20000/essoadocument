<?php
/**
 * 角色管理前台页面
 * @author wangbo
 * @Date 20140423
 */
class ESRoleAction extends ESActionBase
{
	    //默认访问的方法，渲染主页面
         public function index(){
		          return $this->renderTemplate();
	      }
	      //获取所有角色数据信息
	      public function findRoleList(){
	         	$request=$this->getRequest();
	         	$appId = $request->getGet('appId');
		      	$userId = $this->getUser()->getId();
		      	$bigOrgId = $this->getUser()->getBigOrgId();
		      	$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		      	$page = isset($_POST['page']) ? $_POST['page'] : 1;
		      	$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		      	$roleServerProxy = $this->exec("getProxy", 'escloud_roleServerws');
		      	$countData['keyWord'] = $keyWord;
		      	$countData['appId'] = $appId;
		      	$countData['userId'] = $userId;
		      	$countData['bigOrgId'] = $bigOrgId;
		      	$countCanshu = json_encode($countData);
		      	$total = $roleServerProxy->getCountAll($countCanshu);
		      	$roleServerProxy = $this->exec("getProxy", 'escloud_roleServerws');
		      	$data['userId'] = $userId;
		      	$data['bigOrgId'] = $bigOrgId;
		      	$data['startNo']  = ($page-1)*$rp;
		      	$data['limit'] = $rp;
		      	$data['keyWord'] = $keyWord;
		      	$data['appId'] = $appId;
		      	$canshu = json_encode($data);
		      	$rows = $roleServerProxy->getAllRoleServer($canshu);
		      	$start=($page-1)*$rp;
		      	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		      	foreach ($rows as $row){
		      		$entry = array("id"=>$row->roleId,
		      				"cell"=>array(
		      						"startNum"=>$start+1,
		      						"ids"=>'<input type="checkbox"  class="checkbox"  name="roleServerId" value="'.$row->roleId.'"id="roleServerId">',
		      						"operate"=>"<span class='editbtn' >&nbsp;</span>",
		      						"roleId"=>$row->roleId,
		      						"roleCode"=>$row->roleCode,
		      						"roleName"=>$row->roleName,
		      						"roleRemark"=>$row->roleRemark,
		      						"createTime"=>$row->createTime,
		      						"updateTime"=>$row->updateTime,
		      						"isSystem"=>$row->isSystem,
		      				),
		      		);
		      		$jsonData['rows'][] = $entry;
		      		$start++;
		      	}
		      	echo json_encode($jsonData);
	      }
	      //获取左侧的应用列表
	      public function getAppList(){
	      		$userId = $this->getUser()->getId();
	      		$bigOrgId = $this->getUser()->getBigOrgId();
		      	$roleServerProxy = $this->exec("getProxy", 'escloud_roleServerws');
		      	$data['startNo']  = -1;
		      	$data['limit'] = -1;
		      	$data['keyWord'] = '';
		      	$data['userId'] = $userId;
		      	$data['bigOrgId'] = $bigOrgId;
		      	$canshu = json_encode($data);
		      	$appData = $roleServerProxy->getAppList($canshu);
		      	$jsonData1= array();
		      	$jsonData = array('name'=>'应用列表','open'=>true,'children'=>array());
		      	foreach ($appData as $row){
		      		$entry = array("name"=>$row->appNameCn,"appId"=>$row->id);
		      		$jsonData['children'][] = $entry;
		      	}
		      	$jsonData1[0]=$jsonData;
		      	echo json_encode($jsonData1);
	      }
	      //渲染添加角色页面
	      public function add_role(){
		      	$appId=$_GET['appId'];
		      	return $this->renderTemplate(array('appId'=>$appId));
	      }
	      //渲染编辑角色页面
	      public function edit_role(){
	      	$colValues=$_GET['data'];
	      	$data = explode('|',$colValues);
	      	return $this->renderTemplate(array('data'=>$data));
	      }
	      //添加角色
	      public function addRole(){
	      		$bigOrgId = $this->getUser()->getBigOrgId();
		      	parse_str($_POST['data'],$out);
		      	$out['bigOrgId'] = $bigOrgId;
		      	$data=json_encode($out);
		      	$Proxy=$this->exec('getProxy','escloud_roleServerws');
		      	$result=$Proxy->addRole($data);
		      	echo $result;
	      }
	      //删除角色
	      public function deleteRoleList(){
		      	$out= $_POST['data'];
		      	$Proxy=$this->exec('getProxy','escloud_roleServerws');
		      	$result=$Proxy->deleteRoleList($out);
		      	echo $result;
	      }
}
?>