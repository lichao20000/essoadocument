<?php
/**
 * @元数据管理
 * @author zhangjirimutu
 * @data 20120822
 */
class ESMetadataAction extends ESActionBase
{
	public function index()
	{
		return $this->renderTemplate();

	}
	//元数据集
	/**
	 * @author ldm
	 * 元数据集对应的元数据的添加/修改
	 */
	public function addsub(){
		
		//print_r($_POST); die;
		$medata=$this->exec('getProxy','escloud_metadataws');
		$param = $_POST['param'];
		//parse_str($param,$output);
		$namespaceid = $_POST['namespaceid'];
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		if($param['id']!=""){
			$results = array(
					'id'=>$param['id'],
					'estitle'=>$param['name'],
					'esidentifier'=>$param['identfy'],
					'estype'=>$param['type'],
					'idNamespace'=>$param['idnamespace'],
					'esdescription'=>$param['discribe'],
					'searchedArchiveClass'=> $param['docClass'],
			);
			$results = json_encode($results);
			$set = $medata->subset($results,$userId,$userIp);
			//var_dump($set);
			echo json_encode($set);
			/*  if ($set==true){
				echo json_encode("1");
			}  
			return; */
		}else{
			$results = array(
					'estitle'=>$param['name'],
					'esidentifier'=>$param['identfy'],
					'estype'=>$param['type'],
					'esdescription'=>$param['discribe'],
					'searchedArchiveClass'=>$param['docClass'],
			);
			$results = json_encode($results);
			$add = $medata->addsub($namespaceid,$results,$userId,$userIp);
			echo json_encode($add);
			/* if ($add==true){
				echo json_encode("1");
			}
			return;   */
		}
	}
	/**
	 * 元数据对应的属性的添加/修改
	 * @author ldm
	 */
	public function addattr(){
		$id = $_POST['metaid'];
 		 if($id==""){
			return;
		}
		$medata=$this->exec('getProxy','escloud_metadataws');
		$param = $_POST['param'];
		// 
		parse_str($param,$output);
		$userIp = $this->getClientIp();
		$userId = $this->getUser()->getId();
		//echo json_encode($id);
		
		 if ($output['atrrid']!=""){
		 	$list = array(
		 			'id'=>$output['atrrid'],
		 			'estitle'=>$output['attr'],
		 			'idMetadata'=>$output['idmeta'],
		 			'esidentifier'=>$output['attr'],
		 			'esdescription'=>$output['describe']
		 	);
	 
			$list = json_encode($list);
			$results = $medata->atrset($list,$userId,$userIp);
			echo json_encode($results);
			return;
		}else {
			$list = array(
					'estitle'=>$output['attr'],
					'esidentifier'=>$output['attr'],
					'esdescription'=>$output['describe']
			);
			$list = json_encode($list);
			$results = $medata->atradd($id,$list,$userId,$userIp);
			echo json_encode($results);
			return ;
		}   
	}
	/**
	 * @author ldm
	 * 元数据集的删除操作
	 */
	public function do_del(){
		$id = $_GET['id'];
		$list = explode(",", $id);
		$medata=$this->exec('getProxy','escloud_metadataws');
		$count = count($list);
		for ($i=0;$i<$count;$i++){
			if ($list[$i]==""){
				continue;
			}else{
				//var_dump($list[$i]);
				$del = $medata->delspace($list[$i]);
			}
			
		}
		echo $del;
		//var_dump($list);
	}
	/**
	 * @author ldm
	 * 元数据的删除包括批量删除操作
	 */
	public function delsub(){
		$id = $_GET['id'];
		$list = explode(",", $id);
		$medata=$this->exec('getProxy','escloud_metadataws');
		//$del = $medata->delspace();
		$count = count($list);
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		for ($i=0;$i<$count;$i++){
			if ($list[$i]==""){
				continue;
			}else{
				//var_dump($list[$i]);
				$del = $medata->delsub($list[$i],$userId,$userIp);
			}
				
		}
		echo json_encode($del);
	}
	/**
	 * @author guolanrui 20140814 
	 * 检查元数据是否已被引用
	 */
	public function checkMetaIsUsed(){
		$id = $_GET['id'];
		$medata=$this->exec('getProxy','escloud_metadataws');
		$isUsed = $medata->checkMetaIsUsed($id);
		echo $isUsed;
	}
	/**
	 * @author ldm
	 * 元数据的属性删除包括批量删除操作
	 */
	public function delattr(){
		$id = $_GET['id'];
		$list = explode(",", $id);
		$medata=$this->exec('getProxy','escloud_metadataws');
		//$del = $medata->delspace();
		$count = count($list);
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		for ($i=0;$i<$count;$i++){
			if ($list[$i]==""){
				continue;
			}else{
				//var_dump($list[$i]);
				$del = $medata->delattr($list[$i],$userId,$userIp);
			}
	
		}
		echo $del;
	}
	
	//元数据
	/**
	 * @author ldm
	 * 元数据集的包含的元数据显示
	 */
	public  function meta_json()
	{
// 		$medata=$this->exec('getProxy','escloud_metadataws');
// 		$lists = $medata->getsub(1);
// 		if ($lists==""){
// 			return;
// 		}
// 		$results = array();
// 		foreach($lists as $k=>$val)
// 		{
// 			$results[]=json_decode(json_encode($val),true);
// 		}
// 		$page = isset($_POST['page']) ? $_POST['page'] : 1;
// 		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
// 		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
// 		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
// 		$query = isset($_POST['query']) ? $_POST['query'] : false;
// 		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
// 		if($qtype && $query){
// 			$query = strtolower(trim($query));
// 			foreach($results AS $key => $row){
// 				if(strpos(strtolower($row[$qtype]),$query) === false){
// 					unset($results[$key]);
// 				}
// 			}
// 		}
// 		$sortArray = array();
// 		foreach($results AS $key => $row){
// 			$sortArray[$key] = $row['id'];
// 		}
// 		$sortMethod = SORT_ASC;
// 		if($sortorder == 'desc'){
// 			$sortMethod = SORT_DESC;
// 		}
// 		array_multisort($sortArray, $sortMethod, $results);
// 		$total = count($results);
// 		$results = array_slice($results,($page-1)*$rp,$rp);
// 		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
// 		//$i=1;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		
		$medataProxy = $this->exec('getProxy','escloud_metadataws');
		$map = array();
		$map['keyword'] = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$map['start'] = ($page-1)*$rp.'';
		$map['limit'] = $rp.'';
		$medata_list = $medataProxy->getMetadataByKeyword(json_encode($map));
		$total = $medata_list->count;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($medata_list->list AS $row){
				/** guolanrui 20140812 将元数据类型显示成中文 BUG：723 **/
				$estype = $row->estype;
				$esType = '文本';
				switch ($estype){
					case 'TEXT': $esType = '文本';break;
					case 'NUMBER': $esType = '数值';break;
					case 'DATE': $esType = '日期';break;
					case 'FLOAT': $esType = '浮点';break;
					case 'TIME': $esType = '时间';break;
					case 'BOOL': $esType = '布尔';break;
					default : $esType = '文本';
				}

				$entry = array('id'=>$row->id,
						'cell'=>array(
								'id2'=>'<input type="checkbox" name="id2" value='.$row->id.'>',
								'c3'=>'<span class="editbtn">&nbsp;</span>',
								'c4'=>$row->estitle,
								'c5'=>$row->esidentifier,
								'c6'=>$esType,
								'c7'=>$row->esismetadatasearch,
								'c8'=>$row->esdescription
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		echo json_encode($jsonData); 
	}
	/**
	 * 某一元数据属性列表显示
	 * @author ldm
	 */
	
	public  function rules_json()
	{
		$id=isset($_GET['id'])?$_GET['id']:"";
		if($id==""){
			return;
		}
		$medata=$this->exec('getProxy','escloud_metadataws');
		$lists = $medata->atrlist($id);
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
		//$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'id3'=>'<input type="checkbox" name="id3" value='.$row['id'].'>',
							'c3'=>'<span class="editattr">&nbsp;</span>',
							'c4'=>$row['estitle'],
							'c5'=>$row['esidentifier'],
							'c6'=>$row['esdescription'],
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData); 
	}
	/**
	 * 元数据集的显示
	 * @author ldm
	 */
	//
	public function setdataadd()
	{
		$id =isset($_GET['id'])?$_GET['id']:null;
		//$id = 1;
//  		echo "<pre>";
//  		var_dump($id);
//  		echo "</pre>";
		if ($id==null){
			return $this->renderTemplate();
		}
		else {
			$medata=$this->exec('getProxy','escloud_metadataws');
			$find = $medata->getone($id);
			$results = array();
			$results[]=json_decode(json_encode($find),true);
			return $this->renderTemplate(array('list'=>$results));
		}
		
		
	}
	/**
	 * 元数据显示
	 * @author ldm
	 */
	public function metadataadd()
	{
		$unique = isset($_GET['unique'])?$_GET['unique']:"";
		$metaname = isset($_GET['metaname'])?$_GET['metaname']:"";
		$id =isset($_GET['id'])?$_GET['id']:null;
		if ($id==null){
			$list[0]['searchedArchiveClass'] = '';
			return $this->renderTemplate(array('list'=>$list, 'operate'=>"add",'unique'=>$unique,'metaname'=>$metaname));
		}else{
			$medata=$this->exec('getProxy','escloud_metadataws');
			$list = $medata->sublist($id);
			//print_r($list); die;
			$results = array();
			$results[]=json_decode(json_encode($list),true);
			return $this->renderTemplate(array('list'=>$results,'operate'=>"edit",'unique'=>$unique,'metaname'=>$metaname));
		}
		
	}
	/**
	 * 元数据属性添加页面显示
	 * @author ldm
	 */
	public function attributeadd()
	{
		$id =isset($_GET['id'])?$_GET['id']:null;
		if ($id==null){
			return $this->renderTemplate();
		}
		else {
			$medata=$this->exec('getProxy','escloud_metadataws');
			$find = $medata->atrone($id);
			$results = array();
			$results[]=json_decode(json_encode($find),true);
			return $this->renderTemplate(array('list'=>$results));
		}
	}
	/**
	 * 检测唯一性
	 * @author ldm
	 */
	public function checkunique(){
		$param = $_GET['data'];
		$namespaceid = $_GET['namespaceid'];
		$medata=$this->exec('getProxy','escloud_metadataws');
		$check = $medata->checkName($namespaceid,$param);
		echo $check;
	}
	
	public function checkMetaIsUnique(){
		$unique = $_GET['unique'];
		$unMataname = $_GET['unMataname'];
		$namespaceid = $_GET['namespaceid'];
		$metaId = $_GET['metaId'];
		$data = array();
		$data['unique']=$unique;
		$data['unMataname']=$unMataname;
		$data['namespaceid']=$namespaceid;
		$data['metaId']=$metaId;
		
		$medata=$this->exec('getProxy','escloud_metadataws');
		$check = $medata->checkMetaIsUnique(json_encode($data));
		echo json_encode($check);
	}
	
}