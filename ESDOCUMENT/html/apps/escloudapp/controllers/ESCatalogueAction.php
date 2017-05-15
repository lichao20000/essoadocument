<?php
/**
 * @author wangtao
 * 
 */ 
class ESCatalogueAction extends ESActionBase
{
	
	/**
	 * (non-PHPdoc)
	 * @see ESActionBase::index()
	 */
	public function index()
	{
	
		return $this->renderTemplate();
	}
	public  function set_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		include dirname(__FILE__).'/countryArray.inc.php';
		if($qtype && $query){
			$query = strtolower(trim($query));
			foreach($rows AS $key => $row){
				if(strpos(strtolower($row[$qtype]),$query) === false){
					unset($rows[$key]);
				}
			}
		}
		//Make PHP handle the sorting
		$sortArray = array();
		foreach($rows AS $key => $row){
			$sortArray[$key] = $row[$sortname];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $rows);
		$total = count($rows);
		$rows = array_slice($rows,($page-1)*$rp,$rp);
	
		//header("Content-type: application/json");
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i=1;
		foreach($rows AS $row){
			//If cell's elements have named keys, they must match column names
			//Only cell's with named keys and matching columns are order independent.
			$entry = array('id'=>$row['c3'],
					'cell'=>array(
							'num'=>$i,
							'ids'=>'<input type="checkbox" name="id" value='.$i.'>',
							'operate'=>'<a href="javascript:void()">查看</a>&nbsp;&nbsp;<a href="javascript:void()" onclick="show_file('.$i.')" >文件</a>',
							'c3'=>$row['c3'],
							'c4'=>$row['c4'],
							'c5'=>$row['c5'],
							'c6'=>$row['c6'],
							'c7'=>$row['c7'],
							'c8'=>$row['c8'],
					),
			);
			$jsonData['rows'][] = $entry;
			$i++;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author wangtao
	 * 查看日志
	 */
	public function show_note()
	{
		
		$request=$this->getRequest();
		//echo '<pre>';
		$data=$request->getGet();
		//print_r($data);
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 目录报表
	 * 
	 */
	public function directory_reports()
	{

		$flag='';
		$request=$this->getRequest();
		$data=$request->getGet();
		if(isset($data['id']) &&  $data['id']==='flag')
		{
			
			$flag=true;
		}
		return $this->renderTemplate(array('flag'=>$flag));
		
	}
	/*
	 * @author
	 * 执行报表打印动作
	 * 
	 */
	public function do_report()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		parse_str($data['data'],$output);
		echo '<pre>';
		print_r($output);
		echo '</pre>';
	}
	/**
	 * @author wangtao
	 * 筛选
	 */
	public function filter()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 档案装盒
	 */
	public function packing()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 电子文件显示
	 */
	public function file_view()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 添加盒信息
	 */
	public function add_packet()
	{
		return $this->renderTemplate();
	}
	
}