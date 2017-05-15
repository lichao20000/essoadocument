<?php
/**
 *
 * @author wangbo
 * @Date 20140318
 */
class ESFileEquipmentAction extends ESActionBase
{
	public function index(){
		return $this->renderTemplate();
	}
	
	public function addFileEquipment(){
		parse_str($_POST['data'],$out);
		$data=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_fileEquipmentws');
		$result=$Proxy->addFileEquipment($data);
		echo $result;
	}
	                         
	public function deleteFileEquipment(){
		$id=empty($_GET['id'])?1:$_GET['id'];
		$priority=$_GET['priority'];
		$Proxy=$this->exec('getProxy','escloud_fileEquipmentws');
		$result=$Proxy->deleteFileEquipment($id,$priority);
		echo $result;
	}
	
	public function getFileEquipList(){
		$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$fileEquipList = $this->exec("getProxy", 'escloud_fileEquipmentws');
		$arrayKeyWord['keyWord']=$keyWord;
		$jsonKeyWord = json_encode($arrayKeyWord);
		$total = $fileEquipList->getCountAll($jsonKeyWord);
        $data['outFields']= "id,ip,port,isEnabled,priority,rootDir,description";
        $data['startNo']  = ($page-1)*$rp;
        $data['limit'] = $rp;
        $data['keyWord'] = $keyWord;
        $canshu = json_encode($data);
		$rows = $fileEquipList->getAllFileEquip($canshu);
		$start=($page-1)*$rp;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="fileEquipId" value="'.$row->id.'"id="fileEquipId">',
							"id"=>$row->id,
							"operate"=>"<span class='editbtn'>&nbsp;</span>",
							"ip"=>$row->ip,
							"port"=>$row->port,
							"rootDir"=>$row->rootDir,
							"isEnabled"=>$row->isEnabled,
							"priority"=>$row->priority,
							"description"=>$row->description,
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	public function edit_fileEquipment(){
		$colValues=$_POST['data'];
		$data = explode('|',$colValues);
		if(count($data)==6){
			$data[6]='';
		}
		return $this->renderTemplate(array('data'=>$data));
	}
	
	public function startOrStopFileEquipment(){
		$id=empty($_GET['id'])?1:$_GET['id'];
		$mark=$_GET['mark'];
		$class=$this->exec('getProxy','escloud_fileEquipmentws');
		$result=$class->startOrStopFileEquipment($id,$mark);
		echo $result;
	}
	
	public function setFirstFileEquipment(){
		$id=empty($_GET['id'])?1:$_GET['id'];
		$priority=$_GET['priority'];
		$class=$this->exec('getProxy','escloud_fileEquipmentws');
		$result=$class->setFirstFileEquipment($id,$priority);
		echo $result;
	}
	
	
	/**
	 * guolanrui 20141208 获取数据集
	 */
	public function getDataList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$fileStoreId = isset ( $_GET ['fileStoreId'] ) ? $_GET ['fileStoreId'] : '';
	
		$data['fileStoreId'] = $fileStoreId;
		$data['keyWord'] = $keyWord;
		$data['startno'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
	
		// 		$countData['keyWord'] = $keyWord;
		// 		$postCountData = json_encode($countData);
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
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
							"editbtn1"=>"<span class='editbtn1'>&nbsp;</span>",
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
		$fileStoreId = isset ( $_GET ['fileStoreId'] ) ? $_GET ['fileStoreId'] : '';
		
		$userID=$this->getUser()->getId();
		$userIp = $this->getClientIp();
		return $this->renderTemplate(array('userid'=>$userID,'userIp'=>$userIp,'fileStoreId'=>$fileStoreId));
	}
	
	public function add(){
		$userId=$this->getUser()->getId();
		$fromIPStr1 = isset ( $_POST ['fromIPStr1'] ) ? $_POST ['fromIPStr1'] : '';
		$toIPStr1 = isset ( $_POST ['toIPStr1'] ) ? $_POST ['toIPStr1'] : '';
		$fromIPStr = isset ( $_POST ['fromIPStr'] ) ? $_POST ['fromIPStr'] : '';
		$toIPStr = isset ( $_POST ['toIPStr'] ) ? $_POST ['toIPStr'] : '';
		$loginIPStr = isset ( $_POST ['loginIPStr'] ) ? $_POST ['loginIPStr'] : '';
		$portNum = isset ( $_POST ['portNum'] ) ? $_POST ['portNum'] : '';
		$fileStoreId = isset ( $_POST ['fileStoreId'] ) ? $_POST ['fileStoreId'] : '';
		
		$data['fileStoreId'] = $fileStoreId;
		$data['userId'] = $userId;
		$data['startIPStr1'] = $fromIPStr1;
		$data['endIPStr1'] = $toIPStr1;
		$data['startIPStr'] = $fromIPStr;
		$data['endIPStr'] = $toIPStr;
		$data['loginIPStr'] = $loginIPStr;
		$data['portNumStr'] = $portNum;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
	
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
		$fileStoreId = isset ( $_POST ['fileStoreId'] ) ? $_POST ['fileStoreId'] : '';
		
		$data['fileStoreId'] = $fileStoreId;
		$data['id'] = $id;
		$data['userId'] = $userId;
		$data['startIPStr1'] = $fromIPStr1;
		$data['endIPStr1'] = $toIPStr1;
		$data['startIPStr'] = $fromIPStr;
		$data['endIPStr'] = $toIPStr;
		$data['loginIPStr'] = $loginIPStr;
		$data['portNumStr'] = $portNum;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
	
		$returnData = $proxy->edit($postData);
	
		echo json_encode($returnData);
	}
	
	public function delete(){
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : '';
		$fileStoreId = isset ( $_GET ['fileStoreId'] ) ? $_GET ['fileStoreId'] : '';
		
		$data['fileStoreId'] = $fileStoreId;
		$data['ids'] = $ids;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$returnData = $proxy->deleteByIds($postData);
		echo json_encode($returnData);
	}
	public function editForm(){
		$id = isset ( $_GET ['id'] ) ? $_GET ['id'] : '';
		$fileStoreId = isset ( $_GET ['fileStoreId'] ) ? $_GET ['fileStoreId'] : '';
		
		$data['fileStoreId'] = $fileStoreId;
		$data['id'] = $id;
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$returnData = $proxy->getDataById($postData);
		return $this->renderTemplate(array("data"=>$returnData,"fileStoreId"=>$fileStoreId));
	}
	public function setNetSegment_fileEquipment(){
		$fileStoreId = isset ( $_POST ['fileStoreId'] ) ? $_POST ['fileStoreId'] : '';
		$priority = isset ( $_POST ['priority'] ) ? $_POST ['priority'] : '';
		return $this->renderTemplate(array("fileStoreId"=>$fileStoreId,"priority"=>$priority));
	}
	
	
}

?>
