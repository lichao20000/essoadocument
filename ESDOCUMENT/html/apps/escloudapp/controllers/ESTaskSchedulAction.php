<?php
/**
 *
 * @author liuhezeng
 * @Date 20140331
 */
class ESTaskSchedulAction extends ESActionBase
{
	/**
	 * @see ESActionBase::index()
	 */
	public function index(){
		return $this->renderTemplate();
	}

	/**
	 * @author liuhezeng
	 * 元数据集的包含的元数据显示
	 */
	public  function task_json()
	{
		$keyWord = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$bigOrgId = $this->getUser()->getBigOrgId();
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$arrayKeyWord['keyWord']=$keyWord;
		$arrayKeyWord['bigOrgId'] = $bigOrgId;
		$jsonKeyWord = json_encode($arrayKeyWord);
		$data['outFields']= "id2,operate,jobName,recordTime,description,state";
		$data['start']  = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['keyWord'] = $keyWord;
		$data['bigOrgId'] = $bigOrgId;
		$data['userId'] = $this->getUser()->getId();
		$jobpropertites = json_encode($data);
		$rows = $taskSchedul->getJobDataList($jobpropertites);
		$total = $taskSchedul->getCountAll($jsonKeyWord);
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start,
							"id2"=>'<input type="checkbox"  class="checkbox"  name="id2" value="'.$row->id.'">',
							"taskId"=>$row->id,
							"modify"=>"<span class='editbtn' >&nbsp;</span>",
							"jobName"=>$row->jobName,
							"recordTime"=>$row->recordTime,
							"description"=>$row->description,
							"state"=>$row->state,
							"triggerName"=>$row->triggerName,
							"triggerGroupName"=>$row->triggerGroupName,
							"jobGroupName"=>$row->jobGroupName,
							"jobClassName"=>$row->jobClassName,
							"jobClassValue"=>str_replace('|','●rz',$row->jobClassValue)
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}

	public function saveJob(){
		$datas = isset($_POST['data']) ? $_POST['data'] : '';
		$flag = isset($_GET['flag']) ? $_GET['flag'] : '' ;
		$bigOrgId = $this->getUser()->getBigOrgId();
		parse_str($datas,$out);
		$list = array(
				'jobName'=>$out['jobName'],
				'description'=>$out['description'],
				'jobClass'=>$out['jobClass'],
				'triggerName'=>isset($out['triggerName'])?$out['triggerName']:"",
				'triggerGroupName'=>isset($out['triggerGroupName'])?$out['triggerGroupName']:"",
				'isHasEndtime'=>$out['isHasEndtime'],
				'start'=>$out['start'],
				'end'=>$out['end'],
				'seleteNumber'=>$out['seleteNumber'],
				'ererydaytime'=>$out['ererydaytime'],
				'weekday'=>$out['weekday'],
				'ereryweek'=>$out['ereryweek'],
				'ererymonth'=>$out['ererymonth'],
				'flag'=>$flag,
				'userId'=>$this->getUser()->getId(),
				'bigOrgId'=>$bigOrgId
		);
		$list = json_encode($list);

		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$saveResult = $taskSchedul->saveJob($list);
		
		//wanghongchen 20140901 记录操作日志
		$logProxy = $this->exec('getProxy', 'escloud_logservice');
		$logParam = array();
		$logParam['userid'] = $this->getUser()->getId();
		$logParam['module'] = '任务调度';
		$logParam['type'] = 'operation';
		$logParam['ip'] = $this->getClientIp();
		if($flag == 'edit'){
			$logParam['loginfo'] = '修改并启动任务名称为【'.$out['jobName'].'】的任务';
		}else{
			$logParam['loginfo'] = '添加任务名称为【'.$out['jobName'].'】的任务';
		}
		$logProxy->saveLog(json_encode($logParam));
		
		echo json_encode($saveResult);
	}

	/**
	 * 打开编辑页面
	 * @author longjunhao 20140822
	 * @return string
	 */
	public function edit_job(){	
		// 'id', 'jobName', 'recordTime', 'description', 'state', 'triggerName', 'triggerGroupName', 'jobGroupName', 'jobClassValue'
		$colValues=$_POST['data'];
		$data = explode('|',$colValues);
		$value = array();
		$value['id'] = $data[0];
		$value['jobName'] = $data[1];
		$recordTime = $data[2];
		$value['description'] = $data[3];
		$value['state'] = $data[4];
		$value['triggerName'] = $data[5];
		$value['triggerGroupName'] = $data[6];
		$value['jobGroupName'] = $data[7];
		$value['jobClassValue'] = str_replace("●rz", "|", $data[8]);
		
		$records = explode("/", $recordTime);
		$records = array_reverse($records); // 倒序， 2014/每月的1号/14:00:00 => 14:00:00/每月的1号/2014
		$everyDay = "";
		$everyWeek = "";
		$weeks = "";
		$days = "";
		$monthDay = "";
		$everyYear = "";
		$startYear = "";
		$endYear = "";
		for ($i=0; $i<count($records);$i++) {
			$everyDay = $records[0];
			$everyWeek = $records[1];
			if (mb_strstr($everyWeek, "每隔")) {
				$weeks = mb_substr($everyWeek, 2, mb_strpos($everyWeek, "周", null, 'utf-8')-2, 'utf-8');
				$days = mb_substr($everyWeek, mb_strpos($everyWeek, "星期",null,'utf-8')+2, mb_strlen($everyWeek,'utf-8'), 'utf-8');
			} else if (mb_strstr($everyWeek, "每周的")) {
				$weeks = "1";
				$days = mb_substr($everyWeek, mb_strpos($everyWeek, "星期", null, 'utf-8'), mb_strlen($everyWeek,'utf-8'), 'utf-8');
			} else if (mb_strstr($everyWeek, "每月的")) {
				$monthDay = mb_substr($everyWeek, 3, mb_strpos($everyWeek, "号", null, 'utf-8')-3, 'utf-8');
				if (mb_strlen($monthDay,'utf-8') == 1) {
					$monthDay = "0".$monthDay;
				}
			}
			if (count($records) > 2) {
				$everyYear = $records[2];
			} else {
				$everyYear = $records[1];
			}
			if (mb_strlen($everyYear) == 4) {
				$startYear = $everyYear;
			} else {
				$years = explode("-", $everyYear);
				$startYear = $years[0];
				$endYear = $years[1];
			}
		}
		
		$value['everyDay'] = $everyDay;
		$value['weeks'] = $weeks;
		$value['days'] = $days;
		$value['monthDay'] = $monthDay;
		$value['startYear'] = $startYear;
		$value['endYear'] = $endYear;
		return $this->renderTemplate($value);
	}
	
	public function pauseJob(){
		$jobName = $_POST['jobName'];
		$jobGroupName=$_POST['jobGroupName'];
		$bigOrgId = $this->getUser()->getBigOrgId();
		$params = "jobName=".$jobName."&jobGroupName=".$jobGroupName."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"]."&bigOrgId=".$bigOrgId;
		parse_str($params,$out);
		$postData=json_encode($out);
		
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		
		//wanghongchen 20140901 记录操作日志
		$logProxy = $this->exec('getProxy', 'escloud_logservice');
		$logParam = array();
		$logParam['userid'] = $this->getUser()->getId();
		$logParam['module'] = '任务调度';
		$logParam['type'] = 'operation';
		$logParam['ip'] = $this->getClientIp();
		$logParam['loginfo'] = '暂停任务名称为【'.$jobName.'】的任务';
		$logProxy->saveLog(json_encode($logParam));
		
		echo $taskSchedul->pauseJob($postData);
	}

	public function resumeJob(){
		$jobName = $_POST['jobName'];
		$jobGroupName=$_POST['jobGroupName'];
		$bigOrgId = $this->getUser()->getBigOrgId();
		$params = "jobName=".$jobName."&jobGroupName=".$jobGroupName."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"]."&bigOrgId=".$bigOrgId;
		parse_str($params,$out);
		$postData=json_encode($out);
		
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		
		//wanghongchen 20140901 记录操作日志
		$logProxy = $this->exec('getProxy', 'escloud_logservice');
		$logParam = array();
		$logParam['userid'] = $this->getUser()->getId();
		$logParam['module'] = '任务调度';
		$logParam['type'] = 'operation';
		$logParam['ip'] = $this->getClientIp();
		$logParam['loginfo'] = '重新启动任务名称为【'.$jobName.'】的任务';
		$logProxy->saveLog(json_encode($logParam));
		
		echo $taskSchedul->resumeJob($postData);
	}

	public function deleteJobTrigger(){
		$jobName = empty($_GET['jobName'])?1:$_GET['jobName'];
		$triggerName = empty($_GET['triggerName'])?1:$_GET['triggerName'];
		$triggerGroupName=$_GET['triggerGroupName'];
		$list = array(
				'jobName'=>$jobName,
				'triggerName'=>$triggerName,
				'triggerGroupName'=>$triggerGroupName
		);
		$list = json_encode($list);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->deleteJobTrigger($list);
		
		//wanghongchen 20140901 记录操作日志
		$logProxy = $this->exec('getProxy', 'escloud_logservice');
		$logParam = array();
		$logParam['userid'] = $this->getUser()->getId();
		$logParam['module'] = '任务调度';
		$logParam['type'] = 'operation';
		$logParam['ip'] = $this->getClientIp();
		$logParam['loginfo'] = '删除任务名称为【'.$jobName.'】的任务';
		$logProxy->saveLog(json_encode($logParam));
		
		echo $triggerName;
	}


	/**
	 * @author liuhezeng
	 * 元数据集的包含的元数据显示
	 */
	public  function triggerService_json()
	{
		$keyWord = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$bigOrgId = $this->getUser()->getBigOrgId();
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$arrayKeyWord['keyWord']=$keyWord;
		$arrayKeyWord['bigOrgId'] = $bigOrgId;
		$jsonKeyWord = json_encode($arrayKeyWord);
		$data['outFields']= "id3,restname,classname,excutemethodname,description";
		$data['startNo']  = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['keyWord'] = $keyWord;
		$data['bigOrgId'] = $bigOrgId;
		$triggerServicePropertites = json_encode($data);
		$rows = $taskSchedul->getTriggerServiceDataList($triggerServicePropertites);
		$total = $taskSchedul->getCountAllForTriggerService($jsonKeyWord);
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"id3"=>'<input type="checkbox"  class="checkbox"  name="id3" value="'.$row->id.'">',
							"id"=>$row->id,
							"modify"=>"<span class='editbtn' >&nbsp;</span>",
							"restname"=>$row->restname,
							"classname"=>$row->classname,
							"excutemethodname"=>$row->excutemethodname,
							"description"=>$row->description
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * @author liuhezeng
	 * 添加任务服务
	 */
	public function addTriggerServiceData(){
		$datas = isset($_POST['data']) ? $_POST['data'] : '';
		$bigOrgId = $this->getUser()->getBigOrgId();
		$userId = $this->getUser()->getId();
		parse_str($datas,$out);
		$list = array(
				'restname'=>$out['restname'],
				'classname'=>$out['classname'],
				'excutemethodname'=>$out['excutemethodname'],
				'description'=>$out['description'],
				'bigOrgId'=>$bigOrgId
		);
		$list = json_encode($list);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->addTriggerServiceData($list);
		
		//wanghongchen 20140901 记录操作日志
		$logProxy = $this->exec('getProxy', 'escloud_logservice');
		$logParam = array();
		$logParam['userid'] = $userId;
		$logParam['module'] = '任务调度';
		$logParam['type'] = 'operation';
		$logParam['ip'] = $this->getClientIp();
		$logParam['loginfo'] = '添加服务名称为【'.$out['restname'].'】的服务';
		$logProxy->saveLog(json_encode($logParam));
		
		echo $total;
	}
	
	/**
	 * @author liuhezeng
	 * 删除任务服务
	 */
	public  function delTriggerServiceData(){
		$delId=$_GET['id'];
		$list = array(
				'id'=>$delId
		);
		$list = json_encode($list);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->delTriggerServiceData($list);
		
		//wanghongchen 20140901 记录操作日志
		$logProxy = $this->exec('getProxy', 'escloud_logservice');
		$logParam = array();
		$logParam['userid'] = $userId;
		$logParam['module'] = '任务调度';
		$logParam['type'] = 'operation';
		$logParam['ip'] = $this->getClientIp();
		$logParam['loginfo'] = '删除服务ID为【'.$delId.'】的服务';
		$logProxy->saveLog(json_encode($logParam));
		
		echo $triggerName;
	}
	
	public function reconfigSelections(){
		
	   	$Proxy=$this->exec('getProxy','escloud_triggerws');
	   	$triggerServicePropertites = "";
	   	$bigOrgId = $this->getUser()->getBigOrgId();
	   	$data['keyWord'] = "";
	   	$data["bigOrgId"] = $bigOrgId;
		$triggerServicePropertites = json_encode($data);
	   	$result=$Proxy->reconfigSelections($triggerServicePropertites);
	   	$jsonData = array('rows'=>array());
	   	foreach ($result as $row){
			$entry = array(
							"id"=>$row->id,
							"restname"=>$row->restname,
							"classname"=>$row->classname,
							"excutemethodname"=>$row->excutemethodname,
							"description"=>$row->description,
							"bigOrgId"=>$row->bigOrgId
			);
			$jsonData['rows'][] = $entry;
		}
	   	
	   	echo json_encode($jsonData);
	}
	
	/**
	 * 任务服务编辑页面
	 * @author longjunhao 20140804
	 */
	public function edit_triggerservice(){
		$id = isset($_POST['id'])?$_POST['id']:'';
		$restname = isset($_POST['restname'])?$_POST['restname']:'';
		$classname = isset($_POST['classname'])?$_POST['classname']:'';
		$excutemethodname = isset($_POST['excutemethodname'])?$_POST['excutemethodname']:'';
		$description = isset($_POST['description'])?$_POST['description']:'';
		$data = $id.",".$restname.",".$classname.",".$excutemethodname.",".$description;
		$data = htmlspecialchars($data);
		$datas = explode(',',$data);
		return $this->renderTemplate(array('data'=>$datas));
	}
	
	/**
	 * 编辑任务服务
	 * @author longjunhao 20140804
	 */
	public function editTriggerServiceData(){
		$bigOrgId = $this->getUser()->getBigOrgId();
		$params = $_POST['data']."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"]."&bigOrgId=".$bigOrgId;
		parse_str($params,$out);
		$postData=json_encode($out);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$result = $taskSchedul->editTriggerServiceData($postData);
		echo $result;
	}
	
}
?>