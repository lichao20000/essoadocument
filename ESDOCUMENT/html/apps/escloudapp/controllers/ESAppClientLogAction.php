<?php
class ESAppClientLogAction extends ESActionBase {

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
		$log = $appclient->getAPPLogById(json_encode($params));
		return $this->renderTemplate(array("log"=>$log));
	}
	
	public function getLogListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$log = $this->exec("getProxy", 'escloud_appclientservice');
		if ($type == 'user') {
			$params['condition'] = "modelType = '用户管理'";
		} else if ($type == 'update') {
			$params['condition'] = "modelType = '版本管理'";
		} else if ($type == 'reserve') {
			$params['condition'] = "modelType = '预约管理'";
		} else if ($type == 'subscribe') {
			$params['condition'] = "modelType = '订阅管理'";
		} else if ($type == 'searchKeyword') {
			$params['condition'] = "modelType = '检索关键字管理'";
		} else if ($type == 'message') {
			$params['condition'] = "modelType = '消息管理'";
		} else if ($type == 'banner') {
			$params['condition'] = "modelType = 'BANNER管理'";
		} else if ($type == 'loader') {
			$params['condition'] = "modelType = 'LOADER管理'";
		} else if ($type == 'feedback') {
			$params['condition'] = "modelType = '意见反馈管理'";
		} else if ($type == 'crashReport') {
			$params['condition'] = "modelType = '异常管理'";
		} else {
			$params['condition'] = "";
		}
		$total = $log->getLogCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['condition'] = $params['condition'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $log->getLogList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"operation"=>$row->operation,
							"model"=>$row->modelType,
							"userid"=>$row->userid,
							"describtion"=>$row->describtion,
							"time"=>$row->time == "" ? "" : gmdate("Y-m-d H:i:s", ($row->time / 1000) + 8*3600)
					),
						
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
}