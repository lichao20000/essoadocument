<?php
/**
 * 表单管理
 * @author yuanzhonghua
 * @DATA 20121101
 */
class ESFormManageAction extends ESActionBase
{
   public function index()
   {
		return $this->renderTemplate();
   }
   /**
    * @author yzh
    * 表单数据列表的显示
    */
   public function form_json()
	{
		$formdata=$this->exec('getProxy','escloud_formws');
		$lists = $formdata->getlist();
		if ($lists==""){
			return;
		}
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		if($qtype && $query){
			$query = strtolower(trim($query));
			foreach($results AS $key => $row){
				if(strpos(strtolower($row[$qtype]),$query) === false){
					unset($results[$key]);
				}
			}
		}
		$sortArray = array();
		foreach($results AS $key => $row){
			$sortArray[$key] = $row['id'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$total = count($results);
		$results = array_slice($results,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		//var_dump($jsonData);exit;
		foreach($results AS $row){
			$entry = array(
					'id'=>$row['id'],
					'cell'=>array(
							'id2'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
							'c3'=>'<span class="editbtn">&nbsp;</span>',
							'c4'=>$row['title'],
							'c5'=>$row['state'],
							'c6'=>$row['creator'],
							'c7'=>$row['creatTime'],
							'c8'=>$row['updateBy'],
							'c9'=>$row['updateTime'],
							'c10'=>$row['formVersion'],
							'c11'=>$row['mark']
					)
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData); 
	}
	
	/**
	 * 跳到指定的添加表单管理页面
	 * @return string
	 * 
	 */
	public function add()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author yzh
	 * 执行添加表单操作
	 */
	public function saveForm()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		parse_str($data['data'],$output);
// 		var_dump($output);exit;
		$items=array();
		if($output['submit']=='add')
		{
			//去除数据中的空值
			if(is_array($output))
			{
				foreach($output as $key=>$val)
				{
					if(!empty($val))
					{
						$items[$key]=$val;
					}
				}
			}
		
			$output=$items;
		}
		unset($output['submit']);
//  	var_dump($output);exit;
		if(empty($output)) return false;
		$jsonData = json_encode(array('data'=>$output));
		$proxy=$this->exec('getProxy','escloud_formws');
		$formdate=$proxy->addform($jsonData);
		echo $formdate;
	}
	/**
	 * 表单数据的删除包括批量删除操作
	 * @author yzh
	 */
	public function delform(){
		$id = $_GET['id'];
		$list = explode(",", $id);
		$list=json_encode($list);
		$formdata=$this->exec('getProxy','escloud_formws');
		$del = $formdata->delform($list);
		echo $del;
	}
}