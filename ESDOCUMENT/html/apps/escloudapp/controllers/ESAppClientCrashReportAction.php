<?php
class ESAppClientCrashReportAction extends ESActionBase {

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
		$crashReport = $appclient->getCrashReportById(json_encode($params));
		return $this->renderTemplate(array("crashReport"=>$crashReport));
	}
	
	public function solve()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$crashReport = $appclient->getCrashReportById(json_encode($params));
		return $this->renderTemplate(array("crashReport"=>$crashReport));
	}

	public function do_solve()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		parse_str($_POST['param'],$param);
		$userId=$this->getUser()->getId();
		$results = array(
				'id'=>$param['id'],
				'solvedDescribtion'=>$param['solveContent'],
				'operator'=>$userId,
				'ip'=>$this->getip(),
		);
		$results = json_encode($results);
		$success = $appclient->solveCrashReport($results);
		echo json_encode($success);
	}

	public function getCrashReportListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$crashReport = $this->exec("getProxy", 'escloud_appclientservice');
		//echo $type;
		if ($type == 'nosolved') {
			$params['condition'] = "isSolved = 0";
		} else if ($type == 'solved') {
			$params['condition'] = "isSolved = 1";
		} else {
			$params['condition'] = "";
		}
		//echo $params['condition'];
		$total = $crashReport->getCrashReportCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['condition'] = $params['condition'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $crashReport->getCrashReportList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$solved = $row->solved;
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"solvedbtn"=>$solved == 1? "<span class='isrolvedbtn'>&nbsp;</span>":"<span class='norolvedbtn'>&nbsp;</span>",
							"solved"=>$solved == 1? "是":"否",
							"userid"=>$row->userId,
							"crashReport"=>$row->crashReport,
							"deviceInfos"=>$row->deviceInfos,
							"time"=>gmdate("Y-m-d H:i:s", ($row->time / 1000) + 8*3600),
							"versionInfos"=>$row->versionInfos,
							"solvedTime"=>$row->solvedTime == "" ? "" : gmdate("Y-m-d H:i:s", ($row->solvedTime / 1000) + 8*3600),
							"solvedDescribtion"=>$row->solvedDescribtion,
					),

			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}