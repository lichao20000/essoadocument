<?php
class ESAppClientFeedbackAction extends ESActionBase {

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

	public function reply()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$feedback = $appclient->getFeedBackById(json_encode($params));
		return $this->renderTemplate(array("feedback"=>$feedback));
	}

	public function do_reply()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		parse_str($_POST['param'],$param);
		$userId=$this->getUser()->getId();
		$results = array(
				'id'=>$param['id'],
				'content'=>$param['replyContent'],
				'operator'=>$userId,
				'ip'=>$this->getip(),
		);
		$results = json_encode($results);
		$success = $appclient->replyFeedBack($results);
		echo json_encode($success);
	}
	
	public function detail()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$feedback = $appclient->getFeedBackById(json_encode($params));
		return $this->renderTemplate(array("feedback"=>$feedback));
	}

	public function getAPPLogUrl()
	{
		$id=$_GET['data'];
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$res = $proxy->getFileDownLoadUrl($id);
		echo $res;
	}
	
	public function getFeedBackList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		//echo $type;
		if ($type == 'noreply') {
			$params['condition'] = "isreply = 0";
		} else if ($type == 'reply') {
			$params['condition'] = "isreply = 1";
		} else {
			$params['condition'] = "";
		}
		//echo $params['condition'];
		$total = $appclient->getFeedBackCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['condition'] = $params['condition'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $appclient->getFeedBackList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"logbtn"=>"<span class='logbtn'>&nbsp;</span>",
							"userid"=>$row->userId,
							"content"=>$row->content,
							"contact"=>$row->contact,
							"logFileId"=>$row->logFileId,
							"deviceInfos"=>$row->deviceInfos,
							"isreply"=>$row->reply == 1 ? "是":"否",
							"replyContent"=>$row->replyContent,
							"submitTime"=>gmdate("Y-m-d H:i:s", ($row->submitTime / 1000) + 8*3600),
							"replyTime"=>($row->replyTime == 0 ? "" : gmdate("Y-m-d H:i:s", ($row->replyTime / 1000) + 8*3600)),
								
					),

			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}