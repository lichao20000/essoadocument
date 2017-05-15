<?php
class ESAppClientLoaderAction extends ESActionBase {

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
		$loader = $appclient->getAPPLoaderById(json_encode($params));
		return $this->renderTemplate(array("loader"=>$loader));
	}
	
	public function add()
	{
		$userId=$this->getUser()->getId();
		return $this->renderTemplate(array("userId"=>$userId));
	}
	
// 	public function do_add()
// 	{
// 		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
// 		parse_str($_POST['param'],$param);
		
// 		$results = array(
// 				'describtion'=>$param['describtion'],
// 				'imageUrl'=>$param['imageUrl'],
// 		);
// 		$results = json_encode($results);
// 		$success = $appclient->addLoader($results);
// 		echo json_encode($success);
// 	}
	
	public function getLoaderUrl()
	{
		$mark = $_POST['mark'];
		$b=pathinfo($mark);
		//getFileDownLoadUrl
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$res = $proxy->getFileDownLoadUrl($b['filename']);
		echo $res;
	}
	
	public function saveLoaderInfo()
	{
		parse_str($_POST['param'],$param);
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$userId=$this->getUser()->getId();
		$param['operator'] = $userId;
		$param['ip'] = $this->getip();
		$success = $appclient->addLoader(json_encode($param));
		return $this->renderTemplate($success);
	}
	
	public function edit()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$loader = $appclient->getAPPLoaderById(json_encode($params));
		return $this->renderTemplate(array("loader"=>$loader));
	}
	
	public function do_edit()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		parse_str($_POST['param'],$param);
		$userId=$this->getUser()->getId();
		$results = array(
				'id'=>$param['id'],
				'describtion'=>$param['describtion'],
				'state'=>$param['state'],
				'operator'=>$userId,
				'ip'=>$this->getip(),
				'imageFileId'=>$param['imageFileId'],
		);
		$results = json_encode($results);
		$success = $appclient->updateLoader($results);
		echo json_encode($success);
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
		$success = $appclient->deleteLoader($results);
		echo json_encode($success);
	}

	public function getLoaderListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$banner = $this->exec("getProxy", 'escloud_appclientservice');
		if ($type == 'enable') {
			$params['condition'] = "state = 1";
		} else if ($type == 'disable') {
			$params['condition'] = "state = 0";
		} else {
			$params['condition'] = "";
		}
		$total = $banner->getLoaderCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['condition'] = $params['condition'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $banner->getLoaderList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"checkbox"=>'<input type="checkbox" class="checkbox" name="id">',
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"state"=>$row->state == 1 ? "开启" : "关闭",
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