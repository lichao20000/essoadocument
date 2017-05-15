<?php
/**
 * @author xiaoxiong 20140529
 * 表单授权处理Action
 */
class ESFormAccreditAction extends ESActionBase {
	
	const PROXY_NAME = "escloud_formaccredit";
	
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	
	//获取角色列表
	public function getRoles(){
		$searchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['searchKeyword'] = $searchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getRoles($postData);
		$total = $returnData->size;
		$rows = $returnData->list;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"id"=>$row->id,
							"modify"=>"<span class='editbtn' >&nbsp;</span>",
							"rolecode"=>$row->rolecode,
							"rolename"=>$row->rolename,
							"description"=>$row->remark
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 授权界面渲染 **/
	public function accreditPage() {
		return $this->renderTemplate();
	}
	
	/** 获取一个角色授权与未授权表单列表 **/
	public function getAccreditFormBuilder(){
		$searchKeyword = isset($_POST['query']) ? $_POST['query'] : '';
		$accredit = $_GET['accredit'] ;
		$roleId = $_GET['roleId'] ;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['searchKeyword'] = $searchKeyword;
		$data['accredit'] = $accredit;
		$data['roleId'] = $roleId;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getAccreditFormBuilder($postData);
		$total = $returnData->size;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$modify = "<span class='formAccredit_yes' >&nbsp;</span>" ;
		if($accredit == "1"){
			$modify = "<span class='formAccredit_no' >&nbsp;</span>" ;
		}
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"formid"=>$row->formid,
							"modify"=>$modify,
							"formname"=>$row->formname,
							"workflowname"=>$row->workflowname,
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 授权处理方法 **/
	public function addAccredit(){
		$roleId = $_POST['roleId'] ;
		$formid = $_POST['formid'] ;
		$params = "formId=".$formid."&roleId=".$roleId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->addAccredit($postData);
		echo $result;
	}
	
	/** 取消授权处理方法 **/
	public function deleteAccredit(){
		$roleId = $_POST['roleId'] ;
		$formid = $_POST['formid'] ;
		$params = "formId=".$formid."&roleId=".$roleId."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->deleteAccredit($postData);
		echo $result;
	}
}