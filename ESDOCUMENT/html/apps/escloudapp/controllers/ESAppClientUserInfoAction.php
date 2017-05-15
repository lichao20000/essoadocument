<?php
class ESAppClientUserInfoAction extends ESActionBase {

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
		$params['userId'] = $id;
		$userinfo = $appclient->getUserInfoById(json_encode($params));
		return $this->renderTemplate(array("userinfo"=>$userinfo));
	}

	public function getUserListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$userinfo = $this->exec("getProxy", 'escloud_appclientservice');
		$params['condition'] = "";
		$total = $userinfo->getUserInfoCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $userinfo->getUserInfoList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"userid"=>$row->id,
							"username"=>$row->username,
							"realname"=>$row->realname,
							"sex"=>$row->sex == 1 ? "女":"男",
							"birthday"=>$row->birthday == "" ? "" : gmdate("Y-m-d", ($row->birthday / 1000) + 8*3600),
							"phone"=>$row->phone,
							"email"=>$row->email,
							"address"=>$row->address,
							"describtion"=>$row->describtion,
							"registerTime"=>$row->registerTime == "" ? "" : gmdate("Y-m-d H:i:s", ($row->registerTime / 1000) + 8*3600)
					),
					
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}