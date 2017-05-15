<?php
class ESAppClientPublishAction extends ESActionBase {

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
	
	public function getPublishTopicById()
	{
		$id = $_POST['id'];
		$publish=$this->exec('getProxy','escloud_appclientservice');
		$params['id'] = $id;
		$data=$publish->getPublishTopicById(json_encode($params));
 		echo $data;
	}
	
	public function publish()
	{
		return $this->renderTemplate();
	}
	
	
	public function getPublishListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$publish = $this->exec("getProxy", 'escloud_appclientservice');
		if ($type == '1') {
			$params['boardId'] = "1";
		} else if ($type == '2') {
			$params['boardId'] = "2";
		} else if ($type == '3') {
			$params['boardId'] = "3";
		} else if ($type == '4') {
			$params['boardId'] = "4";
		} else if ($type == '5') {
			$params['boardId'] = "5";
		} else {
			$params['boardId'] = "0";
		}
		$total = $publish->getPublishTopicCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['boardId'] = $params['boardId'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $publish->getPublishTopicList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox" name="id" value="'.$row->id.'" id="id">',
							"title"=>$row->title,
					),
						
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}