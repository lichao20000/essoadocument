<?php
class ESAppClientUpdateAction extends ESActionBase {

	public function index()
	{
		return $this->renderTemplate();
	}
	
	function getip ()
	{
		if (getenv('http_client_ip')) {
			$ip = getenv('http_client_ip');
		} else if (getenv('http_x_forwarded_for')) {
			$ip = getenv('http_x_forwarded_for');
		} else if (getenv('remote_addr')) {
			$ip = getenv('remote_addr');
		} else {
			$ip = $_server['remote_addr'];
		}
		return $ip;
	}
	
	public function detail()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$update = $appclient->getUpdateInfoById(json_encode($params));
		return $this->renderTemplate(array("update"=>$update));
	}
	
	public function edit()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$update = $appclient->getUpdateInfoById(json_encode($params));
		return $this->renderTemplate(array("update"=>$update));
	}
	
	public function do_delete()
	{
		echo($_GET['ids']);
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$userId=$this->getUser()->getId();
	
		$results = array(
				'ids'=>$_GET['ids'],
				'operator'=>$userId,
				'ip'=>$this->getip(),
		);
		$results = json_encode($results);
		$success = $appclient->deleteUpdateInfos($results);
		echo json_encode($success);
	}
	
	public function add()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$update = $appclient->getLatestUpdateInfo();
		$userId=$this->getUser()->getId();
		return $this->renderTemplate(array("update"=>$update->updateInfo, "userId"=>$userId));
	}
	
	public function saveUpdateInfo()
	{
		parse_str($_POST['param'],$param);
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$userId=$this->getUser()->getId();
		$param['operator'] = $userId;
		$param['ip'] = $this->getip();
		$success = $appclient->addOrUpdateUpdateInfo(json_encode($param));
		return $this->renderTemplate($success);
	}
	
	public function getUpdateUrl()
	{
// 		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
// 		$url = $appclient->getUpdateUrl();
//		$url = "http://168.168.168.195:8080/appservice/rest/escloud_appservice/addOrUpdateUpdateInfo";
		$proxy=$this->exec('getProxy','escloud_appclientservice');
		$data=$proxy->getUpdateUrl();
		echo $data;
	}
	
	public function getDownLoadUrl()
	{
		$id=$_GET['data'];
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$res = $proxy->getFileDownLoadUrl($id);
		echo $res;
	}
	
	public function uploadAPKFile()
	{
		// 上传的基础路径
		$basePath = "apk";
		echo json_encode($this->uploadFileToPHP($basePath));
	}

	public function getUpdateListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['condition'] = "";
		$total = $appclient->getUpdateInfoCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $appclient->getUpdateInfoList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"checkbox"=>'<input type="checkbox" class="checkbox" name="id">',
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"downloadbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"id"=>$row->id,
							"appName"=>$row->appName,
							"appDescription"=>$row->appDescription,
							"packageName"=>$row->packageName,
							"versionCode"=>$row->versionCode,
							"versionName"=>$row->versionName,
							"forceUpdate"=>$row->forceUpdate == 1 ? "是":"否",
							"autoUpdate"=>$row->autoUpdate == 1 ? "是":"否",
							"updateTips"=>$row->updateDefaultTip,
							"apkFileId"=>$row->apkFileId,
							"updateTime"=>gmdate("Y-m-d H:i:s", ($row->updateTime / 1000) + 8*3600),
								
					),

			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}