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

	//元数据
	/**
	 * @author ldm
	 * 元数据集的包含的元数据显示
	 */
	public  function task_json()
	{
		$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$arrayKeyWord['keyWord']="ILoveU";
		$jsonKeyWord = json_encode($arrayKeyWord);
		$data['outFields']= "id2,operate,jobName,recordTime,description,state";
		$data['startNo']  = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['keyWord'] = $keyWord;
		$jobpropertites = json_encode($data);
		$rows = $taskSchedul->getJobDataList($jobpropertites);
		$total = $taskSchedul->getCountAll($jsonKeyWord);
		$start=($page-1)*$rp;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start+1,
							"id2"=>'<input type="checkbox"  class="checkbox"  name="id2" value="'.$row->id.'">',
							"jobName"=>$row->jobName,
							"recordTime"=>$row->recordTime,
							"description"=>$row->description,
							"state"=>$row->state,
							"triggerName"=>$row->triggerName,
							"triggerGroupName"=>$row->triggerGroupName
							
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}

	public function saveJob(){
		$datas = isset($_POST['data']) ? $_POST['data'] : '';
		$flag = 	isset($_GET['flag']) ? '' : $_GET['flag'] ;
		parse_str($datas,$out);
		$list = array(
				'jobName'=>$out['jobName'],
				'description'=>$out['description'],
				'jobClass'=>$out['jobClass'],
				'flag'=>$out['flag'],
				'triggerName'=>$out['triggerName'],
				'triggerGroupName'=>$out['triggerGroupName'],
				'isHasEndtime'=>$out['isHasEndtime'],
				'start'=>$out['start'],
				'end'=>$out['end'],
				'seleteNumber'=>$out['seleteNumber'],
				'ererydaytime'=>$out['ererydaytime'],
				'weekday'=>$out['weekday'],
				'ereryweek'=>$out['ereryweek'],
				'ererymonth'=>$out['ererymonth'],
				'flag'=>$flag
		);
		$list = json_encode($list);

		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->saveJob($list);
		echo $total;
	}

	public function editJob(){	
		
		$colValues=$_GET['data'];
		$data = explode('|',$colValues);
		if(count($data)==6){
			$data[6]='';
		}
		return $this->renderTemplate(array('data'=>$data));
	}
	
	public function pauseJob(){

		$jobName = $_GET['jobName'];
		$triggerGroupName=$_GET['triggerGroupName'];
		$list = array(
				'jobName'=>$jobName,
				'triggerGroupName'=>$triggerGroupName
		);
		$list = json_encode($list);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->pauseJob($list);
		echo $triggerName;
	}

	public function resumeJob(){
		$datas = isset($_POST['data']) ? $_POST['data'] : '';
		parse_str($datas,$out);
		$list = array(
				'jobName'=>$out['jobName'],
				'triggerGroupName'=>$out['triggerGroupName']
		);
		$list = json_encode($list);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->resumeJob($list);
		echo $total;
	}

	public function deleteJobTrigger(){
		$triggerName = empty($_GET['triggerName'])?1:$_GET['triggerName'];
		$triggerGroupName=$_GET['triggerGroupName'];
		$list = array(
				'triggerName'=>$triggerName,
				'triggerGroupName'=>$triggerGroupName
		);
		$list = json_encode($list);
		$taskSchedul = $this->exec("getProxy", 'escloud_triggerws');
		$total = $taskSchedul->deleteJobTrigger($list);
		echo $triggerName;
	}


}
?>