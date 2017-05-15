<?php
/**
 * 网段登录IP设置
 * @author guolanrui 
 *	@DATA 20141208
 */
class ESLoginNetSegmentAction extends ESActionBase
{
	public function index()
	{
		return $this->renderTemplate();
	}
	/**
	 * guolanrui 20141208 获取数据集
	 */
	public function getDataList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		
		$data['keyWord'] = $keyWord;
		$data['startno'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		
// 		$countData['keyWord'] = $keyWord;
// 		$postCountData = json_encode($countData);
		$proxy = $this->exec("getProxy", "escloud_loginNetSegmentws");
// 		$total = $report->countAllForSearch($postCountData);
		$start = ($page - 1) * $rp + 1;
		$returnData = $proxy->getDataList($postData);
		$total = $returnData->total;
		$rows = $returnData->list;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"id"=>"<input type='checkbox' name='id'>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"netSegment"=>$row->startIP.' - '.$row->endIP,
							"startIP"=>$row->startIP,
							"endIP"=>$row->endIP,
							"loginIP"=>$row->loginIP,
							"portNum"=>$row->portNum,
							"userid"=>$row->userid
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
	
		echo json_encode($jsonData);
	}
	
	
	public function insert(){
		$userID=$this->getUser()->getId();
		$userIp = $this->getClientIp();
		return $this->renderTemplate(array('userid'=>$userID,'userIp'=>$userIp));
	}
	
	public function add(){
		$userId=$this->getUser()->getId();
		$fromIPStr1 = isset ( $_POST ['fromIPStr1'] ) ? $_POST ['fromIPStr1'] : '';
		$toIPStr1 = isset ( $_POST ['toIPStr1'] ) ? $_POST ['toIPStr1'] : '';
		$fromIPStr = isset ( $_POST ['fromIPStr'] ) ? $_POST ['fromIPStr'] : '';
		$toIPStr = isset ( $_POST ['toIPStr'] ) ? $_POST ['toIPStr'] : '';
		$loginIPStr = isset ( $_POST ['loginIPStr'] ) ? $_POST ['loginIPStr'] : '';
		$portNum = isset ( $_POST ['portNum'] ) ? $_POST ['portNum'] : '';
		
		$data['userId'] = $userId;
		$data['startIPStr1'] = $fromIPStr1;
		$data['endIPStr1'] = $toIPStr1;
		$data['startIPStr'] = $fromIPStr;
		$data['endIPStr'] = $toIPStr;
		$data['loginIPStr'] = $loginIPStr;
		$data['portNumStr'] = $portNum;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_loginNetSegmentws");
		
		$returnData = $proxy->add($postData);
		
		echo json_encode($returnData);
	}
	
	public function edit(){
		$userId=$this->getUser()->getId();
		$id = isset ( $_POST ['id'] ) ? $_POST ['id'] : '';
		$fromIPStr1 = isset ( $_POST ['fromIPStr1'] ) ? $_POST ['fromIPStr1'] : '';
		$toIPStr1 = isset ( $_POST ['toIPStr1'] ) ? $_POST ['toIPStr1'] : '';
		$fromIPStr = isset ( $_POST ['fromIPStr'] ) ? $_POST ['fromIPStr'] : '';
		$toIPStr = isset ( $_POST ['toIPStr'] ) ? $_POST ['toIPStr'] : '';
		$loginIPStr = isset ( $_POST ['loginIPStr'] ) ? $_POST ['loginIPStr'] : '';
		$portNum = isset ( $_POST ['portNum'] ) ? $_POST ['portNum'] : '';
		
		$data['id'] = $id;
		$data['userId'] = $userId;
		$data['startIPStr1'] = $fromIPStr1;
		$data['endIPStr1'] = $toIPStr1;
		$data['startIPStr'] = $fromIPStr;
		$data['endIPStr'] = $toIPStr;
		$data['loginIPStr'] = $loginIPStr;
		$data['portNumStr'] = $portNum;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_loginNetSegmentws");
		
		$returnData = $proxy->edit($postData);
		
		echo json_encode($returnData);
	}
	
	public function delete(){
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : '';
		$data['ids'] = $ids;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_loginNetSegmentws");
		$returnData = $proxy->deleteByIds($postData);
		echo json_encode($returnData);
	}
	public function editForm(){
// 			$reportId = $_GET['reportId'];
// 			$reportService = $this->exec("getProxy", "escloud_reportservice");
// 			$report = $reportService->getReport($reportId);
// 			$ip = $reportService->getServiceIP();
// 			return $this->renderTemplate(array("report"=>$report,'ip'=>$ip));
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		$data['id'] = $id;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_loginNetSegmentws");
		$returnData = $proxy->getDataById($postData);
		return $this->renderTemplate(array("data"=>$returnData));
	}
	
}