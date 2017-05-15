<?php
/**
 * 流程监控
 * @author zhangjirimutu
 *@DATA 20120822
 */
class ESFlowMonitorAction extends ESActionBase
{
  public function index()
   {
	
		return $this->renderTemplate();
	}
	public  function set_json()
	{
// 		$rows = array(
// 				array('c3'=>'',
// 						'c4'=>'1',
// 						'c5'=>'2010年',
// 						'c6'=>'通知',
// 						'c7'=>'2010-12-23',
// 						'c8'=>'张忠义',
// 				),);	
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
	
		if(!isset($usingSQL)){
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
		}
		//header("Content-type: application/json");
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows AS $row){
			//If cell's elements have named keys, they must match column names
			//Only cell's with named keys and matching columns are order independent.
			$entry = array('id'=>$row['c3'],
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id">',
							'c3'=>$row['c3'],
							'c4'=>$row['c4'],
							'c5'=>$row['c5'],
							'c6'=>$row['c6'],
							'c7'=>$row['c7'],
							'c8'=>$row['c8'],
					),
			);
			$jsonData['rows'][] = $entry;
		}
		// 		echo '<pre>';
		// 		print_r($jsonData);
		// 		echo '</pre>';
		// 		die;
		echo json_encode($jsonData);
	}
}