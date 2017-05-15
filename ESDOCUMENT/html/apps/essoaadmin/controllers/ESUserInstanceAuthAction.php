<?php
class ESUserInstanceAuthAction extends ESActionBase
{
	/**
	 * @see ESActionBase::index()
	 */
	public function index(){
		return $this->renderTemplate();
	}
	
	
	/** 分配用户 **/
	public function saveUsers() {
		$saasid = $_POST['saasid'];
		$userids = $_POST['userids'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//shiyangtao add 20140830 增加后台日志需要的参数
		$instanceId=$this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_userInstanceAuthws');
		echo $proxy->saveUsers(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr, 'saasid'=>$saasid,'instanceId'=>$instanceId, 'userids'=>$userids)));
	}
	
	/**
	 * 获取SAAS机构用户列表
	 */
	public function getUsers(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$saasId = isset($_GET['saasId']) ? $_GET['saasId'] : '';
		$keyword = isset($_POST['query']) ? $_POST['query'] : '';
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//shiyangtao add 20140830 增加后台日志需要的参数
		$instanceId=$this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_userInstanceAuthws');
		$result = $proxy->getUsers(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr,'instanceId'=>$instanceId, 'page'=>$page, 'pageSize'=>$rp, 'saasId'=>$saasId, 'keyword'=>$keyword)));
		$total = $result->total;
		$list = $result->list;
		$jsonData = array('page'=>$page, 'total'=>$total, 'rows'=>array());
		$start=($page-1)*$rp;
		foreach ($list as $row){
			$entry = array("id"=>$row->ID,
					"cell"=>array(
							"serialNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="usercbx" value="'.$row->ID.'" userid= "'.$row->USERID.'"id="usercbx">',
							"ID"=>$row->ID,
							"USERID"=>$row->USERID,
							"FIRSTNAME"=>$row->FIRSTNAME,
							"LASTNAME"=>$row->LASTNAME,
							"USERSTATUS"=>$row->USERSTATUS,
							"MOBTEL"=>$row->MOBTEL,
							"FULLNAME"=>$row->LASTNAME.$row->FIRSTNAME
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取还未分配的用户列表
	 */
	public function getNoAuthUsers(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyword = isset($_POST['query']) ? $_POST['query'] : '';
		$saasid=$_GET['saasid'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		$proxy = $this->exec ('getProxy', 'escloud_userInstanceAuthws');
		//shiyangtao add 20140830 增加后台日志需要的参数
		$instanceId=$this->getAppInstance()->getInstanceId();
		$result = $proxy->getNoAuthUsers(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr, 'instanceId'=>$instanceId,'page'=>$page, 'pageSize'=>$rp, 'keyword'=>$keyword,'saasid'=>$saasid)));
		$total = $result->total;
		$list = $result->list;
		$jsonData = array('page'=>$page, 'total'=>$total, 'rows'=>array());
		$start=($page-1)*$rp;
		foreach ($list as $row){
			$entry = array("id"=>$row->ID,
					"cell"=>array(
							"serialNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="noAuthUsercbx" value="'.$row->ID.'" userid= "'.$row->USERID.'"id="noAuthUsercbx">',
							"ID"=>$row->ID,
							"USERID"=>$row->USERID,
							"FIRSTNAME"=>$row->FIRSTNAME,
							"LASTNAME"=>$row->LASTNAME,
							"USERSTATUS"=>$row->USERSTATUS,
							"MOBTEL"=>$row->MOBTEL,
							"FULLNAME"=>$row->LASTNAME.$row->FIRSTNAME
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 渲染分配用户界面
	 */
	public function addUsers(){
		$saasid=$_GET['saasid'];
		return $this->renderTemplate(array('saasid'=>$saasid));
	}
	
	/** 取消用户 **/
	public function deleteUsers() {
		$saasid = $_POST['saasid'];
		$userIds = $_POST['userIds'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//shiyangtao add 20140830 增加后台日志需要的参数
		$instanceId=$this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_userInstanceAuthws');
		echo $proxy->deleteUsers(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr, 'saasid'=>$saasid,'instanceId'=>$instanceId, 'userIds'=>$userIds)));
	}
	
	/** 同步用户 **/
	public function syncUsers() {
		$saasid = $_POST['saasid'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//shiyangtao add 20140830 增加后台日志需要的参数
		$instanceId=$this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_userInstanceAuthws');
		echo $proxy->syncUsers(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr, 'saasid'=>$saasid,'instanceId'=>$instanceId)));
	}

}