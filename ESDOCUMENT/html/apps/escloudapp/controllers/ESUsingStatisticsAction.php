<?php
/**
 *
 * @author wangtao
 * 利用统计
 */
class ESUsingStatisticsAction extends ESActionBase
{

	public  function getList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$type= isset($_GET['type'])?$_GET['type']:'form';
		$start=($page-1)*$rp;
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		$userId=$this->getUser()->getId();
		$rows=$proxy->getList($type,$page,$rp);
		//print_r($rows);die;
		$jsonData = array('page'=>$page,'total'=>$rows->total,'rows'=>array());
		foreach($rows->list AS $row){
			$entry = array('id'=>$row->id,
					'cell'=>array(
							'num'=>$start+1,
							'title'=>$row->name,
							'execute'=>'<span title="执行方案" class="printbtn" onclick=exeCollection("'.$row->id.'") >&nbsp;</span>',
							'modify'=>'<span title="编辑方案" class="editbtn" onclick=modifyCollection('.$row->id.',"'.$row->name.'") >&nbsp;</span>',
							'delete'=>'<span title="删除方案" class="delbtn" onclick=delCollection('.$row->id.') >&nbsp;</span>',
							//'show'=>'<span title="查看方案" class="showbtn" onclick=showCollection("'.$row->id.'") >&nbsp;</span>',
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		//print_r($jsonData);die;
		echo json_encode($jsonData);
	}
	/**
	 * 保存方案
	 * Enter description here ...
	 */
	public function savePlan(){
		$map=$_POST['data'];
		$userId= $this->getUser()->getId();
		$map['userid']=$userId;
		$map['orgid']='1';
		$map['ip'] = $this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		echo $proxy->savePlan(json_encode($map));
	}
	/**
	 * 编辑方案
	 */
	public function modifyPlan(){
	
		$planId=$_POST['planId'];
		$planName=$_POST['name'];
		$type=$_GET['type'];
		if(!$planId)return;
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		$res1=$proxy->modifyPlan($planId);
//		echo '<pre>';
//		print_r($res);
//		echo '</pre>';
		//echo ; 
		//var_dump($res);exit;
		$map = array();
		$map['data'] =$type;
		$proxy1=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy1->getUsingFieldForForm(json_encode($map));
		$resData = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData[$count] = array();
				$resData[$count]['id'] = $row->id;
				$resData[$count]['field'] = $row->field;
				$resData[$count]['type'] = $row->type;
				$resData[$count]['length'] = $row->length;
				$resData[$count]['doLength'] = $row->doLength;
				$resData[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		return $this->renderTemplate(array('name'=>$planName,'result'=>json_encode($res1),'type'=>$type,'data'=>$resData),'ESUsingStatistics/setCondition');
	}
	
	/**
	 *  保存编辑方案
	 */
	public function doPlan() {
		$map=$_POST['data'];
		$userId= $this->getUser()->getId();
		$oid = $this->exec("getProxy", "user")->getUserInfo($userId)->deptEntry->orgid;
		$map['userid']=$userId;
		$map['orgid']=$oid;		
		$map['ip'] = $this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		echo($proxy->updatePlan(json_encode($map)));
	}
	/**
	 * 删除
	 * 
	 * 
	 */
	public function deletePlan()
	{
		$planId=$_GET['planId'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		$res=$proxy->deletePlan(json_encode(array($planId)),$userId,$ip);
		echo $res;
	}
	/**
	 * 生成并下载excel
	 */
	public function executePlan()
	{
	
		$date=date('Y-m-d',time());
		$planId=$_GET['planId'];
		$xlsversion=$_GET['version'];
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		header("Content-Disposition: attachment; filename=".$date.".xls");
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		return readfile($proxy->executePlan($planId,$xlsversion));
	}
	public function setCondition(){
		$type= $_GET['type'];
		$map = array();
		$map['data'] =$type;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData[$count] = array();
				$resData[$count]['id'] = $row->id;
				$resData[$count]['field'] = $row->field;
				$resData[$count]['type'] = $row->type;
				$resData[$count]['length'] = $row->length;
				$resData[$count]['doLength'] = $row->doLength;
				$resData[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		return $this->renderTemplate(array('data'=>$resData,'type'=>$type));
	}
	public function getStaticDataForCol(){
		$map = array();
		$map['id'] = $_GET['id'];
		$formCondition = $_GET['condition'];
		$type = $_GET['type'];
		if($formCondition!=""){
			$listw=explode("|",$formCondition);
			$map['condition'] = $listw;
		}
		$map['keyWord'] = $_POST['query']['keyWord'];
		$map['type'] = $type;
		$fList1 = $_GET['fs'];
		if($fList1!=""){
			$fList=explode("|",$fList1);
		}
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		$res=$proxy->getStaticDataForCol(json_encode($map));
		$jsonData = array('page'=>0,'total'=>count($res->list),'rows'=>array());
		if(count($res->list)>0){
			$i = 0;
			foreach ($res->list AS $row){
					$entry = array('id'=>$i+1,
							'cell'=>array(),
					);
				for ($i=0;$i<count($fList);$i++){
					$col= $fList[$i];
					$entry['cell'][$col] = $row->$col;
				}
					$jsonData['rows'][] = $entry;
					$i++;
			}
		}
		echo json_encode($jsonData);
	}
	public function getStaticColModel(){
		$planId=$_GET['id'];
		if(!$planId)return;
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		$res=$proxy->modifyPlan($planId);
		echo json_encode($res);
	}
	public function printFile(){
		$map = array();
		$map['id'] = $_GET['id'];
		$formCondition = $_GET['condition'];
		$type = $_GET['type'];
		if($formCondition!=""){
			$listw=explode("|",$formCondition);
			$map['condition'] = $listw;
		}
		$map['keyWord'] = $_POST['keyWord'];
		$map['type'] = $type;
		$map['fs1'] = $_GET['fs1'];
		$map['fs2'] = $_POST['fs2'];
		$map['userId'] = $this->getUser()->getId();
		$map['ip'] = $this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_usingcollectionws');
		echo $proxy->printFile(json_encode($map));
	}
}