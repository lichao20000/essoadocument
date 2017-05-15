<?php
/**
 * 同步配置
 * @author wanghongchen
 * @Date 20140709
 */
class ESSyncConfigAction extends ESActionBase {
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	
	public function getList(){
		$keyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", 'escloud_syncConfigws');
		$data['start']  = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['keyword'] = $keyword; 
		$data['userId'] = $userId;
		//添加日志 需要ip
		$data['ip']=$this->getClientIp();
		$data['instanceId']=$this->getAppInstance()->getInstanceId();
		$param = json_encode($data);
		$result = $proxy->getList($param);
		$total = $result->total;
		$rows = $result->list;
		$start=($page-1)*$rp;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="syncConfig" value="'.$row->id.'">',
							"id"=>$row->id,
							"operate"=>"<span class='editbtn' >&nbsp;</span>",
							"appNameCn"=>$row->appnamecn,
							"applyAppId"=>$row->applyappid,
							"syncType"=>$row->synctype,
							"restFullClassName"=>$row->restfullclassname,
							"functionName"=>$row->functionname
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 添加界面
	 * @return string
	 */
	public function add(){
// 		$orgRegisterProxy = $this->exec ('getProxy', 'escloud_orgRegisterws');
// 		$bigOrgList = $orgRegisterProxy->getDistinctBigOrgNameList();
		
		$userId = $this->getUser()->getId();
		$params = json_encode(array('userId'=>$userId));
		$proxy = $this->exec("getProxy", 'escloud_syncConfigws');
		$result = $proxy->getSupportSaasApps($params);
		return $this->renderTemplate(array('appList'=>$result));
	}
	
	/**
	 * 获取支持saas的应用
	 */
	public function getSupportSaasApps(){
		$userId = $this->getUser()->getId();
		$params = json_encode(array('userId'=>$userId));
		$proxy = $this->exec("getProxy", 'escloud_syncConfigws');
		$result = $proxy->getSupportSaasApps($params);
		echo json_encode($result);
	} 
	/**
	 * 添加或修改
	 */
	public function addOrEdit(){
		$formData = $_POST['formData'];
		parse_str($formData, $params);
		$params['userId'] = $this->getUser()->getId();
		//添加日志 需要ip
		$params['ip']=$this->getClientIp();
		$params['instanceId']=$this->getAppInstance()->getInstanceId();
		$proxy = $this->exec("getProxy", 'escloud_syncConfigws');
		$result = $proxy->addOrEdit(json_encode($params));
		echo json_encode($result);
	}
	
	/**
	 * 修改界面
	 */
	public function edit(){
		$id = $_POST['id'];
		$appnamecn = $_POST['appnamecn'];
		$synctype = $_POST['synctype'];
		$restfullclassname = $_POST['restfullclassname'];
		$functionname = $_POST['functionname'];
		$applyappid = $_POST['applyappid'];
		return $this->renderTemplate(array('id'=>$id, 'appnamecn'=>$appnamecn, 'synctype'=>$synctype, 'restfullclassname'=>$restfullclassname, 'functionname'=>$functionname, 'applyappid'=>$applyappid ));
	}
	
	/**
	 * 根据id删除
	 */
	public function deleteById(){
		$ids = $_POST['ids'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		//shiyangtao add 20140830 增加后台日志需要的参数
		$instanceId=$this->getAppInstance()->getInstanceId();
		$params = json_encode(array('ids'=>$ids,'userId'=>$userId,'ip'=>$remoteAddr, 'instanceId'=>$instanceId));
		$proxy = $this->exec("getProxy", 'escloud_syncConfigws');
		$result = $proxy->deleteById($params);
		echo json_encode($result);
	}
	
	/**
	 * 向应用系统同步数据
	 */
	public function syncToAppSystem(){
		$saasid = $_POST['saasid'];
		$synctype = $_POST['synctype'];
		$userId = $this->getUser()->getId();
		$params = json_encode(array('saasid'=>$saasid,'userId'=>$userId,'synctype'=>$synctype));
		$proxy = $this->exec("getProxy", 'escloud_syncConfigws');
		$result = $proxy->syncToAppSystem($params);
		echo json_encode($result);
	}
}
?>