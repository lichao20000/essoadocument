<?php
class ESAppClientReserveAction extends ESActionBase {

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
		$reserve = $appclient->getReserveById(json_encode($params));
		return $this->renderTemplate(array("reserve"=>$reserve));
	}

	public function edit()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$reserve = $appclient->getReserveById(json_encode($params));
		return $this->renderTemplate(array("reserve"=>$reserve));
	}

	public function do_edit()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		parse_str($_POST['param'],$param);
		$status = "AUDIT_TOTHROUGH";
		if ($param['reserveStatus'] == 1) {
			$status = "AUDIT_THROUGH";
		} else if ($param['reserveStatus'] == 2) {
			$status = "AUDIT_NOTHROUGH";
		} else if ($param['reserveStatus'] == 3) {
			$status = "AUDIT_FAILURE";
		} else if ($param['reserveStatus'] == 4){
			$status = "AUDIT_COMPLETE";
		}
		$userId=$this->getUser()->getId();
		$results = array(
				'id'=>$param['id'],
				'describtion'=>$param['describtion'],
				'status'=>$status,
				'operator'=>$userId,
		);
		$results = json_encode($results);
		$success = $appclient->updateReserveStatus($results);
		echo json_encode($success);
	}

	public function getReserveListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$reserve = $this->exec("getProxy", 'escloud_appclientservice');
		$keyword=$_GET['keyword'];

		if ($keyword == "") {
			$params['condition'] = "";
		} else {
			$params['condition'] = "realName = '".$keyword."'";
		}
		$type = $_GET['type'];
		if ($type == '1') {
			$params['condition'] = $params['condition'] == "" ? $params['condition']."status = '待审核'" : $params['condition']." and status = '待审核'";
		} else if ($type == '2') {
			$params['condition'] = $params['condition'] == "" ? $params['condition']."status = '审核通过'" : $params['condition']." and status = '审核通过'";
		} else if ($type == '3') {
			$params['condition'] = $params['condition'] == "" ? $params['condition']."status = '审核不通过'" : $params['condition']." and status = '审核不通过'";
		} else if ($type == '4') {
			$params['condition'] = $params['condition'] == "" ? $params['condition']."status = '已失效'" : $params['condition']." and status = '已失效'";
		} else if ($type == '5') {
			$params['condition'] = $params['condition'] == "" ? $params['condition']."status = '已完成'" : $params['condition']." and status = '已完成'";
		} else {
			$params['condition'] = $params['condition'];
		}

		$total = $reserve->getReserveCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['condition'] = $params['condition'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $reserve->getReserveList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="id" value="'.$row->id.'" id="id">',
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"userid"=>$row->userId,
							"realName"=>$row->realName,
							"email"=>$row->email,
							"phone"=>$row->phone,
							"content"=>$row->content,
							"status"=>$row->statusString,
							"describtion"=>$row->describtion,
							"time"=>gmdate("Y-m-d H:i:s", ($row->time / 1000) + 8*3600),
							"reserveTime"=>gmdate("Y-m-d H:i:s", ($row->reserveTime / 1000) + 8*3600),
							"auditTime"=>$row->auditTime == "" ? "" : gmdate("Y-m-d H:i:s", ($row->auditTime / 1000) + 8*3600)
					),
						
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}