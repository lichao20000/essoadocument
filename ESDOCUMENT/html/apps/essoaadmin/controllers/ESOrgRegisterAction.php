<?php
/**
 * 机构组织注册action
 * @author wanghongchen 20140610
 *
 */
class ESOrgRegisterAction extends ESActionBase {
	// 添加机构
	public function addOrEdit() {
		$formData = $_POST['formData'];
		$data = array();
		parse_str($formData,$data);
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//为后台添加操作日志 准备参数 shiyangtao add 20140830
		$instanceId= $this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_orgRegisterws');
		$result = $proxy->addOrEdit(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr,'instanceId'=>$instanceId, 'data'=>$data)));
		echo json_encode($result);
	}
	
	/***
	 * 删除一个SAAS机构
	 */
	public function deleteOrg() {
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//为后台添加操作日志 准备参数 shiyangtao add 20140830
		$instanceId= $this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_orgRegisterws');
		echo $proxy->deleteOrg(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr,'instanceId'=>$instanceId, 'id'=>$id)));
	}
	
	/**
	 * 获取已注册机构列表
	 */
	public function getList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['$rp']) ? $_POST['$rp'] : 20;
		$keyWord = isset($_POST['query']) ? $_POST['query'] : '';
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//为后台添加操作日志 准备参数 shiyangtao add 20140830
		$instanceId= $this->getAppInstance()->getInstanceId();
		$proxy = $this->exec ('getProxy', 'escloud_orgRegisterws');
		$result = $proxy->getList(json_encode(array('userId'=>$userId, 'remoteAddr'=>$remoteAddr,'instanceId'=>$instanceId, 'page'=>$page, 'pageSize'=>$rp, 'keyWord'=>$keyWord)));
		$total = $result->total;
		$list = $result->list;
		$jsonData = array('page'=>$page, 'total'=>$total, 'rows'=>array());
		$start=($page-1)*$rp;
		foreach ($list as $row){
			$entry = array("id"=>$row->id,
				"cell"=>array(
						"serialNum"=>$start+1,
						"ids"=>'<input type="checkbox"  class="checkbox"  name="ogcbx" value="'.$row->id.'"id="ogcbx" userid="'.$row->superuser.'">',
						"id"=>$row->id,
						"operate"=>"<span class='editbtn'>&nbsp;</span>",
						"bigOrgName"=>$row->bigorgname,
						"applyAppName"=>$row->applyAppName,
						"superUserName"=>$row->superuser,
						"fullName"=>$row->fullname,
						"firstName"=>$row->firstName,
						"lastName"=>$row->lastName,
						"cellPhone"=>$row->mobtel
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
		$data = $_POST['data'];
		$result = explode('|',$data);
		return $this->renderTemplate(array('data'=>$result));
	}
}
?>