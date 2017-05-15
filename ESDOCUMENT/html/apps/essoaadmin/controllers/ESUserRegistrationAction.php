<?php
class ESUserRegistrationAction extends ESActionBase
{
	/**
	 * @see ESActionBase::index()
	 */
	public function index(){
		return $this->renderTemplate();
	}
	
	// 添加机构
	public function addOrEdit() {
		$formData = $_POST['formData'];
		$data = array();
		parse_str($formData,$data);
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//为后台添加操作日志 准备参数 shiyangtao add 20140830
		$instanceId= $this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_userRegistrationws');
		$result = $proxy->addOrEdit(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr,'instanceId'=>$instanceId, 'data'=>$data)));
		echo json_encode($result);
	}
	
	/**
	 * 获取已注册机构列表
	 */
	public function getList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = isset($_POST['query']) ? $_POST['query'] : '';
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		$proxy = $this->exec ('getProxy', 'escloud_userRegistrationws');
		$result = $proxy->getList(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr, 'start'=>($page-1)*$rp, 'limit'=>$rp, 'keyWord'=>$keyWord)));
		$total = $result->size;
		$list = $result->data;
		$jsonData = array('page'=>$page, 'total'=>$total, 'rows'=>array());
		$start=($page-1)*$rp;
		foreach ($list as $row){
			$entry = array("ID"=>$row->ID,
					"cell"=>array(
							"serialNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="usercbx" value="'.$row->ID.'" userid= "'.$row->USERID.'"id="usercbx">',
							"ID"=>$row->ID,
							"operate"=>"<span class='editbtn'>&nbsp;</span>",
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
	 * 生成编辑界面
	 */
	public function edit(){
		$colValues = $_POST['data'];
		$data = explode ( '|', $colValues );
		return $this->renderTemplate(array('data'=>$data));
	}
	
	/**
	 * 启用用户
	 */
	public function enableUsers(){
		$data['ids'] = $_POST['ids'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $this->getClientIp();
		$data['instanceId']=$this->getAppInstance()->getInstanceId();
		$postData = json_encode($data);
		$proxy = $this->exec ('getProxy', 'escloud_userRegistrationws');
		echo $proxy->enableUsers($postData);
	}
	
	/**
	 * 禁用用户
	 */
	public function disableUsers(){
		$data['ids'] = $_POST['ids'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $this->getClientIp();
		$data['instanceId']=$this->getAppInstance()->getInstanceId();
		$postData = json_encode($data);
		$proxy = $this->exec ('getProxy', 'escloud_userRegistrationws');
		echo $proxy->disableUsers($postData);
	}
	
	/**
	 * 删除用户
	 */
	public function deleteUsers(){
		$data['ids'] = $_POST['ids'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $this->getClientIp();
		$data['instanceId']=$this->getAppInstance()->getInstanceId();
		$postData = json_encode($data);
		$proxy = $this->exec ('getProxy', 'escloud_userRegistrationws');
		echo $proxy->deleteUsers($postData);
	}
	
	/**
	 * 渲染用户密码重置界面
	 */
	public function resetUsersPasswordPage(){
		return $this->renderTemplate();
	}
	
	/**
	 * 用户密码重置
	 */
	public function resetUsersPassword(){
		$data['ids'] = $_POST['ids'];
		$data['userids'] = $_POST['userids'];
		$data['password'] = $_POST['password'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $this->getClientIp();
		$data['instanceId']=$this->getAppInstance()->getInstanceId();
		$postData = json_encode($data);
		$proxy = $this->exec ('getProxy', 'escloud_userRegistrationws');
		echo $proxy->resetUsersPassword($postData);
	}

}