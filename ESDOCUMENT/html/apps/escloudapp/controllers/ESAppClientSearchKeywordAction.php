<?php
class ESAppClientSearchKeywordAction extends ESActionBase {

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
	
	public function getSearchKeywordListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$searchKeyword = $this->exec("getProxy", 'escloud_appclientservice');
		if ($type == 'order') {
			$params['type'] = "order";
		} else {
			$params['type'] = "all";
		}
		$total = $searchKeyword->getSearchKeywordsCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['type'] = $params['type'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $searchKeyword->getSearchKeywords($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"keyword"=>$row->keyword,
							"searchTime"=>$row->searchTime,
							"userId"=>$row->userId,
					),
						
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
}