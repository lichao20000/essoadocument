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
	public function add_fileEquipment(){
		$appId=$_GET['appId'];
		return $this->renderTemplate(array('appId'=>$appId));
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
		$request=$this->getRequest();
		$appId = $request->getGet('appId');
		$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$fileEquipList = $this->exec("getProxy", 'escloud_fileEquipmentws');
		$arrayKeyWord['keyWord']=$keyWord;
		$arrayKeyWord['appId']=$appId;
		$jsonKeyWord = json_encode($arrayKeyWord);
		$total = $fileEquipList->getCountAll($jsonKeyWord);
        $data['outFields']= "id,ip,port,isEnabled,priority,rootDir,description";
        $data['startNo']  = ($page-1)*$rp;
        $data['limit'] = $rp;
        $data['keyWord'] = $keyWord;
        $data['appId']=$appId;
        $canshu = json_encode($data);
		$rows = $fileEquipList->getAllFileEquip($canshu);
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="fileEquipId" value="'.$row->id.'"id="fileEquipId">',
							"id"=>$row->id,
							"operate"=>"<span class='editbtn'>&nbsp;</span>",
							"ip"=>$row->ip,
							"port"=>$row->port,
							"rootDir"=>$row->rootDir,
							"isEnabled"=>$row->isEnabled,
							"priority"=>$row->priority,
							"description"=>$row->description,
							"appId"=>$appId
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	public function edit_fileEquipment(){
		$colValues=$_GET['data'];
		$data = explode('|',$colValues);
// 		if(count($data)==6){
// 			$data[6]='';
// 		}
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
	
	public function getAppList(){
		$fileServerProxy = $this->exec("getProxy", 'escloud_fileEquipmentws');
		$data['startNo']  = -1;
		$data['limit'] = -1;
		$data['keyWord'] = '';
		$canshu = json_encode($data);
		$appData = $fileServerProxy->getAppList($canshu);
		$jsonData1= array();
		$jsonData = array('name'=>'应用列表','open'=>true,'children'=>array());
		foreach ($appData as $row){
			$entry = array("name"=>$row->appNameCn,"appId"=>$row->id);
			$jsonData['children'][] = $entry;
		}
		$jsonData1[0]=$jsonData;
		echo json_encode($jsonData1);
	}
}

?>
