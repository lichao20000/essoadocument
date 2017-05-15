<?php
/**
 * 模板定义
 * @author zhangjirimutu
 * @DATE 20120822
 */
class ESTemplateAction extends ESActionBase
{
	//首页显示数据
	public function index()
	{
		/** xiaoxiong 20140729 动态获取档案类型下拉选项 **/
		$class=$this->exec('getProxy','escloud_structureModelws');
		$data=$class->getArchiveTypes();
		return $this->renderTemplate(array('archiveTypes'=>$data));
	}
	//左侧上树内容(模板定义中树结构停止使用,换为GetOwnBusinessTree)
	public function getTree()
	{
		//实例化服务取得所有树节点
		$class=$this->exec('getProxy','escloud_businesstreews');
		
		$treelist=$class->getlist($id="1",$modelId="0");
		//print_r($treelist); die();
		
		$uId = $this->getUser()->getId();
		$uInfo = $this->exec('getProxy','user')->getUserInfo($uId);
		$uName = $uInfo->displayName;
		
		//echo uName; die();
		echo json_encode(array('zNodes'=>$treelist,'uInfo'=>array('uId'=>$uId,'uName'=>$uName,'mSite'=>$mainSite)));
	}
	
	//左侧下树内容
	public function underTree()
	{
		$sId=$_GET['sid'];
		$class=$this->exec('getProxy','escloud_structurews');
		$underTree=$class->getStructureTreeBysId($sId);
		//print_r($underTree);
		$tmp = array();
		foreach ($underTree as $key => $value)
		{
			$tmp[$key]['id'] =$value->id;
			$tmp[$key]['pId'] = $value->pId;
			$tmp[$key]['name'] = $value->name.'('.$value->id.')';
		}
		
		
		echo json_encode($tmp);
		//echo json_encode($underTree);
	}

	//ajax请求 得到信息
	public function ajax_information(){
		$id=$_GET['id'];		
		//实例化服务取得所有树节点
		$info=$this->exec('getProxy','escloud_structurews');
		$data=$info->information($id);
		echo json_encode($data);
	
	}
	//模板定义表渲染
	public function project()
	{
		return $this->renderTemplate();
	}
	//结构编辑表渲染
	public function structure()
	{
		return $this->renderTemplate();
	}

	//添加新节点
	public function addtreenode()
	{
		
		$nodeId = $_POST['nodeId'];
		//$pId = $_POST['pId'];
		//$isParent = $_POST['isParent'];
		$data_list = $_POST['data_list'];
		//xiewenda  20140916 将分割符改为@@与邮箱地址的用户区分 以免分割错误
		$data_list = explode('@@', $data_list);
		
		//print_r($data_list); die;
		$list = array();
		$title = "";
		foreach ($data_list as $key => $datas)
		{
			
			// id idStructure esorder estitle esidentifier
			$data = explode('|', $datas);
			$params = array();
			if($data[0]!=0){
				$params['id'] = $data[0];	// id
				/** xiaoxiong 20140731 添加创建者 **/
				if($data[5] != '-1'){
					$params['creator']=$data[5];
				}
			} else {
				/** xiaoxiong 20140731 添加创建者 **/
				$params['creator']=$this->getUser()->getId();
			}
			if($data[1]) $params['idStructure'] = $data[1]; // idStructure
			$params['esorder'] = $data[2];
			$params['estitle'] = $data[3];
			$title .= ($data[3].",");
			$params['esidentifier'] = $data[4];
			$params['idParent'] = $nodeId;
			//$params['isParent'] = $isParent;
			$params['essBusinessTree'] = array('id'=>$nodeId);
			$params['idBusiness'] = 1;
			$params['isLeaf'] = 1;
			$params['idSEQ']=$_POST['nodeIdSEQ'].".".$nodeId;
			$list[$key] = $params;
		}
		
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$map=array();
		$map['userid'] = $this->getUser()->getId();
		$map['module'] = '模板定义';
		$map['type'] = 'operation';
		$map['ip'] = $this->getClientIp();
		$map['loginfo'] = '模板定义，为树节点id为'.$nodeId.'添加子节点'.$title;
		$map['operate'] = '模板定义：树节点编辑';
		$logProxy->saveLog(json_encode($map));
		
		//print_r($list); die;
		
		//所有树节点
		$Proxy = $this->exec('getProxy','escloud_businesstreews');
		$zTreedata = $Proxy->setChildadd(json_encode($list),$this->getUser()->getId());
// 		[id] => 2
// 		[pId] => 0
// 		[name] => 中国联通集团总部
// 		[path] => /archive/2@_
// 		[isParent] => true
// 		[esorder] => 0
// 		[sId] => 0
// 		[identifier] => hq
		//print_r($zTreedata);
		echo json_encode($zTreedata); //array('data'=>array(array(),array()),success = true);
		
	}
	
	//添加新节点
	public function addtreenodebefore()
	{
	
		$nodeId = $_POST['nodeId'];
		//$pId = $_POST['pId'];
		//$isParent = $_POST['isParent'];
		$data_list = $_POST['data_list'];
	
		$data_list = explode('@@', $data_list);
	
		//print_r($data_list); die;
		$list = array();
		$title = "";
		foreach ($data_list as $key => $datas)
		{
				
			// id idStructure esorder estitle esidentifier
			$data = explode('|', $datas);
			$params = array();
			if($data[0]!=0){
				$params['id'] = $data[0];	// id
				/** xiaoxiong 20140731 添加创建者 **/
				if($data[5] != '-1'){
					$params['creator']=$data[5];
				}
			} else {
				/** xiaoxiong 20140731 添加创建者 **/
				$params['creator']=$this->getUser()->getId();
			}
			if($data[1]) $params['idStructure'] = $data[1]; // idStructure
			$params['esorder'] = $data[2];
			$params['estitle'] = $data[3];
			$title .= ($data[3].",");
			$params['esidentifier'] = $data[4];
			$params['idParent'] = $nodeId;
			//$params['isParent'] = $isParent;
			$params['essBusinessTree'] = array('id'=>$nodeId);
			$params['idBusiness'] = 1;
			$params['isLeaf'] = 1;
			$params['idSEQ']=$_POST['nodeIdSEQ'].".".$nodeId;
			$list[$key] = $params;
		}
	
	
		//所有树节点
		$Proxy = $this->exec('getProxy','escloud_businesstreews');
		$zTreedata = $Proxy->setChildaddBefore(json_encode($list),$this->getUser()->getId());
		// 		[id] => 2
		// 		[pId] => 0
		// 		[name] => 中国联通集团总部
		// 		[path] => /archive/2@_
		// 		[isParent] => true
		// 		[esorder] => 0
		// 		[sId] => 0
		// 		[identifier] => hq
		//print_r($zTreedata);
		echo json_encode($zTreedata); //array('data'=>array(array(),array()),success = true);
	
	}
	
	//编辑树节点信息#方吉祥
	public function treeedit()
	{
		
		$id = $_GET['id'] ? $_GET['id'] : 1;	// id
		$sId = $_GET['sId'];
		$pId = $_GET['pId'] ? $_GET['pId']: 0;	// parent id
		
		$params['estitle'] = $_POST['estitle'];	// 节点名称
		$params['esidentifier'] = $_POST['esidentifier'];	// 节点标识
		
		$params['id'] = $id;
		$params['idBusiness'] = 1;
		if($sId)$params['idStructure'] = $sId;
		$params['essBusinessTree'] = array('id'=>$pId);
		
		$Proxy = $this->exec('getProxy','escloud_businesstreews');
		$result = $Proxy->setTreeNode(json_encode($params));
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$map=array();
		$map['userid'] = $this->getUser()->getId();
		$map['module'] = '模板定义';
		$map['type'] = 'operation';
		$map['ip'] = $this->getClientIp();
		$map['loginfo'] = '模板定义，编辑树节点id为'.$id.'名称为'.$params['estitle'].'标识为'.$params['esidentifier'].'的树节点';
		$map['operate'] = '模板定义：树节点编辑';
		$logProxy->saveLog(json_encode($map));
		
		echo $result;
		
	}
	//批量/某个删除目录树节点
	public function deleteTreeNode(){
		
		$nodes = $_POST['nodes'];
		//删除节点
		$Proxy = $this->exec('getProxy','escloud_businesstreews');
		$params = array('nodes'=>$nodes);
		$result = $Proxy->deleteTreeNodeList(json_encode($params));
		if($result->SUCCESS=='true'){
			echo 'no-error';
			$logProxy=$this->exec('getProxy','escloud_logservice');
			$map=array();
			$map['userid'] = $this->getUser()->getId();
			$map['module'] = '模板定义';
			$map['type'] = 'operation';
			$map['ip'] = $this->getClientIp();
			$map['loginfo'] = '模板定义，删除节点为'.$nodes.'的树节点';
			$map['operate'] = '模板定义：树节点编辑';
			$logProxy->saveLog(json_encode($map));
		}else{
			echo $result->message;
		}
	}
	//删除单个树节点getdeleteById
	public function getdeleteById(){
		$arr[]=$_POST['data'];
		$data=json_encode($arr);
		//print_r($data);die;
		$Proxy=$this->exec('getProxy','escloud_businesstreews');
		//删除节点
		$result=$Proxy->deleteTreeNodeList($data);
		if($result->SUCCESS==false){
			$err=$result->message;
			echo '';
		}else{
			echo $data;
		}
	}
	
	// 删除结构节点
	public function DeleteStructure()
	{
		
		$params['ID'] = $_POST['ID'];
		$params['ESTITLE'] = $_POST['ESTITLE'];
		$Proxy = $this->exec('getProxy','escloud_structurews');
		$result = $Proxy->deleteStructure(json_encode($params));
		
		//print_r($result); die();
		
		if($result->SUCCESS=='true'){
			echo 'no-error';
		}else{
			echo $result->message;
		}
	}
	
	//批量删除结构字段
	public function deleteStructureNode(){
		
		
		$structureId = $_POST['structureId'];
		$identifiers = $_POST['identifiers'];
		$modelId = 0;
		
		
		$ident = explode(',', $identifiers);
		$params = array();
		foreach ($ident as $k => $i)
		{
			$params[] = array('ESIDENTIFIER'=>$i);
		}
		
		
		//删除结构节点
		$Proxy = $this->exec('getProxy','escloud_structurews');
		$result = $Proxy->deleteStructureNodeList(json_encode($params),$structureId,$modelId);
		echo $result;
	}
	/**
	 * liqiubo 20140807
	 * 删除字段之前的验证方法，验证待删除字段是否在规则，角色中使用到
	 */
	public function deleteStructureNodeChecked(){
		$structureId = $_POST['structureId'];
		$identifiers = $_POST['identifierIds'];
		$identifierTexts = $_POST['identifierTexts'];
		$modelId = 0;
		$ident = explode(',', $identifiers);
		$identText = explode(',', $identifierTexts);
		$params = array();
		$z=0;
		foreach ($ident as $k => $i)
		{
			$params[] = array('ID'=>$i,'TEXT'=>$identText[$z]);
			$z++;
		}
		$Proxy = $this->exec('getProxy','escloud_structurews');
		$result = $Proxy->deleteStructureNodeChecked(json_encode($params),$structureId,$modelId);
		echo json_encode($result);
	}
	
	//目录树添加结构节点
	public function treenodestructureadd()
	{
		// 标题,描述,结构类型,创建人,时间,档案类型
		// ESTITLE,ESDESCRIPTION,ESTYPE,ESCREATOR,ESDATE,ESCLASS
		$form_val = $_POST['form_val'];
		$id = $_POST['id'];
		$is_new = $_POST['is_new'];
		$key = array('ESTITLE','ESDESCRIPTION','ESTYPE','ESCREATOR','ESDATE','ESCLASS');
		$form_val = explode(',', $form_val);
		$params = array();
		foreach ($form_val as $n=>$p)
		{
			$params[$key[$n]] = $p;
		}
		$params['ID'] = $id;
		$params['IDBUSINESS'] = 1;
		
		//var_dump($data);die;
		//新添加结构节点
		$Proxy = $this->exec('getProxy','escloud_structurews');
		
		if($is_new=='new'){ // 新建结构节点
			$result = $Proxy->addStructureTreeNode(json_encode($params),$id); // node id
		}else if($is_new=='new_child'){ // 新建子结构节点
			$result = $Proxy->addStructureChildNode(json_encode($params),$id); // stru id
		}else if($is_new=='modify'){
			$result = $Proxy->setStructureNode(json_encode($params)); // stru id
		}
		
		echo $result;
	}

	//给结构添加子结构
	public function savestructurechildnode()
	{
		//echo date('Y-m-d',time());die;
		parse_str($_POST['data'],$out);
		//echo $out['ID'];
		$id=isset($_GET['id'])?$_GET['id']:1;
		$data['ID']="";
		$data['IDBUSINESS']=1;
		$data['ESTITLE']=$out['ESTITLE'];
		$data['ESTYPE']=$out['ESTYPE'];
		$data['ESCREATOR']=$out['ESCREATOR'];
		$data['ESDESCRIPTION']=$out['ESDESCRIPTION'];
		$data['ESDATE']=date('Y-m-d H:i:s',time());
		$data['ESCLASS']=$out['ESCLASS'];
		//var_dump($data);die;
		$data=json_encode($data);
		//var_dump($data);die;
		$Proxy=$this->exec('getProxy','escloud_structurews');
		//新添加结构节点
		$result=$Proxy->addChildStruStru($data,$id);
		echo $result;
	}
	//元数据渲染页面
	public function metadata(){
		return $this->renderTemplate();
	}

	/**
	 * @author ldm
	 * 元数据集的包含的元数据显示
	 */
	public  function meta_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		
		$medataProxy = $this->exec('getProxy','escloud_metadataws');
		//$medata_list = $medataProxy->getAllMetadata(1,$page,$rp);
		$medata_list = $medataProxy->getMetadata(1,$page,$rp);
		$total = $medata_list->total;
		//print_r($medata_list); die();
		
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($medata_list->dataList AS $row)
			{
				$entry = array('id'=>$row->id,
						// radio name ident type search desc
						'cell'=>array(
								'radio'=>'<input type="radio" name="metadata" value="'.$row->id.'">',
								'name'=>$row->estitle,
								'ident'=>$row->esidentifier,
								'type'=>$row->estype,
								'search'=>$row->esismetadatasearch ? '是' : '否',
								'desc'=>$row->esdescription
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		
		echo json_encode($jsonData);
	
	}
	//编辑结构节点
	public function structurechildnodeedit()
	{
		
		//echo date('Y-m-d',time());die;
		parse_str($_POST['data'],$out);
		$data['ID']=$_GET['id'];
		$data['IDBUSINESS']=1;
		$data['ESTITLE']=$out['ESTITLE'];
		$data['ESTYPE']=$out['ESTYPE'];
		$data['ESCREATOR']=$out['ESCREATOR'];
		$data['ESDATE']=$out['ESDATE'];
		$data['ESCLASS']=$out['ESCLASS'];
		$data['ESDESCRIPTION']=$out['ESDESCRIPTION'];		
		//var_dump($data);die;
		$data=json_encode($data);
		//var_dump($data);die;
		$Proxy=$this->exec('getProxy','escloud_structurews');
		//新添加结构节点
		$result=$Proxy->setStructureNode($data);
		if($result==true){
			echo $out['ESTITLE'];
		}else{
			echo '';
		}
	}
	//渲染目录树添加子结构页面structurenode
	public function structurenode()
	{
		return $this->renderTemplate();
	}
	//渲染结构树添加子结构页面structurenode
	public function structureaddnode()
	{
		return $this->renderTemplate();
	}
	//结构保存字段[修改时间20130813@方吉祥]
	public function addstructurenode()
	{
		$datas = array();
		$structureId = $_POST['structureId'];
		$datas = $_POST['datas']; // [['','','','','','','','',''],...]
		//print_r($datas); die;
		//echo json_encode($datas); die;
			
		$Proxy = $this->exec('getProxy','escloud_structurews');
		$result = $Proxy->addTagsForStru(json_encode($datas), $structureId);
		//print_r($result); 
		echo json_encode($result);
		
	}
		
	//树节点子节点
	public function project_json(){
		$page= $_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=isset($_POST['rp'])?$_POST['rp']:20;
		$start = ($page-1) * $rp;
		$id = $_GET['id'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array("start"=>$start,"limit"=>$rp,"pid"=>$id,"userId"=>$userId));
		$escloud_businesstreews = $this->exec('getProxy','escloud_businesstreews');
// 		$rows = $escloud_businesstreews->getChildById($_GET['id']);
		//wanghongchen 20140819 增加分页
		$result = $escloud_businesstreews->getChildTreeNode($param);
		$rows = $result->list;
		$total = $result->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows as $linenumber => $row){
			$entry = array('id'=>$row->id,
					'cell'=>array(
							'linenumber'=>$linenumber+1,
							'cbox'=>'<input type="checkbox" name="sinputA" id="'.$row->sId.'" value='.$row->id.'>',
							'treenodename'=>$row->name,
							'identifier'=>$row->identifier,
							'creator'=>($row->creator==''?'-1':$row->creator)
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}

	//返回结构字段数据table
	public  function structure_json()
	{
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		
		$class = $this->exec('getProxy','escloud_structurews');
		$rows = $class->getStructureList($_GET['id'],$page,$rp);
		
		
		$total = $rows->total;
		
		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL','RESOURCE');
		$typecn = array('文本','数值','日期','浮点','时间','布尔','资源');
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($rows->dataList as $row){
				
				foreach ($typeen as $n => $type)
				{
					if($type == $row->ESTYPE) $ESTYPE = $typecn[$n];
				}
				
				switch ($row->ESISNULL){
					case "0": $ESISNULL = '否'; break;
					case "1": $ESISNULL = '是'; break;
				}
				
				switch ($row->ESISSYSTEM){
					case "0": $ESISSYSTEM = '否'; break;
					case "1": $ESISSYSTEM = '是'; break;
				}
	
				$entry = array(
					'id'=>$row->ID,
					'cell'=>array(
						'cbox'=>'<input type="checkbox" name="sinputB" oldText="'.$row->ESIDENTIFIER.'" value="'.$row->ID.'">',//加入新的属性oldText，存储显示的值，以免修改后拿不到原来的值
						'ESIDENTIFIER'=>$row->ESIDENTIFIER,
						'METADATA'=>$row->METADATA,
						'ESTYPE'=>$ESTYPE,
						'ESISNULL'=>$ESISNULL,
						'ESLENGTH'=>$row->ESLENGTH,
						'ESDOTLENGTH'=>$row->ESDOTLENGTH,
						'ESISSYSTEM'=>$ESISSYSTEM,
						'ESDESCRIPTION'=>$row->ESDESCRIPTION
					),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		//var_dump($jsonData);die;
		echo json_encode($jsonData);
		//var_dump($rows);
	}

	/**
	 * 列表显示字段
	 * @author ldm
	 */
	public function listfield(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		//var_dump($molid);
		if ($stid==""||$molid==""){
			//echo "请先选择左侧树节点";
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$left = $proxy->listfieldleft($stid,$molid);
		$right = $proxy->listfieldright($stid,$molid);
		return $this->renderTemplate(array('left'=>$left,'right'=>$right));
	}
	/**
	 * 列表显示字段保存
	 * @author ldm
	 */
	public function listfieldsave(){
		$data = isset($_POST['data'])?$_POST['data']:"";
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		if($stid==""||$molid==""){
			return;
		}
		if($data==""){
			$results=array();
		}else{
			$result = rtrim($data,",");
			$results = explode(',', $result);
		}
		$ss = json_encode($results);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->listfieldsave($stid,$molid,$ss);
		if($save==true){
		echo "1";
		}else {
		echo "0";
		}
	}
	/**
	 * 表单显示字段
	 * @author ldm
	 */
	public function formfield(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$left = $proxy->formfieldleft($stid,$molid);
		//var_dump($left);
		$right = $proxy->formfieldright($stid,$molid);
		return $this->renderTemplate(array('left'=>$left,'right'=>$right));
	}
	/**
	 * 表单显示字段保存
	 * @author ldm
	 */
	public function formfieldsave(){
		$data = isset($_POST['data'])?$_POST['data']:"";
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		if($stid==""||$molid==""){
			return;
		}
		if($data==""){
			$results=array();
		}else{
			$result = rtrim($data,",");
			$results = explode(',', $result);
		}
		$results = json_encode($results);
		//$ss = json_encode($list);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->formfieldsave($stid,$molid,$results);
		if($save==true){
			echo "1";
		}else {
			echo "0";
		}
	}
	/**
	 * 综合查询字段显示
	 * @author ldm
	 */
	public function comprehensivefield(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$left = $proxy->compreshowleft($stid,$molid);
		$right = $proxy->compreshowright($stid,$molid);
		return $this->renderTemplate(array('left'=>$left,'right'=>$right));
	}
	/**
	 * 综合查询字段保存
	 * @author ldm
	 */
	public function compresave(){
		$data = isset($_POST['data'])?$_POST['data']:"";
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		if($stid==""||$molid==""){
			return;
		}
		if($data==""){
			$results=array();
		}else{
			$result = rtrim($data,",");
			$results = explode(',', $result);
		}
		$results = json_encode($results);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->compresave($stid,$molid,$results);
		if($save==true){
			echo "1";
		}else {
			echo "0";
		}
	}
	/**
	 * 排序规则
	 * @author ldm
	 */
	public function sortrules(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$left = $proxy->sortleft($stid,$molid);
		$right = $proxy->sortright($stid,$molid);
		$total = array_merge($left,$right);
		$total = json_encode($total);
		return $this->renderTemplate(array('left'=>$left,'right'=>$right,'merge'=>$total));
	}
	/**
	 * 排序规则保存
	 * @author ldm
	 */
	public function sortrulessave(){
		$data = isset($_POST['data'])?$_POST['data']:"";
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		if($stid==""||$molid==""){
			return;
		}
		
		if ($data==""){
			$data=array();
		}
		$list = json_encode($data);
// 		echo $list;return;
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->sortsave($stid,$molid,$list);
		if($save==true){
			echo "1";
		}else {
			echo "0";
		}
	}
	/**
	 * 代码值规则显示
	 * @author ldm
	 */
	public function codevaluerules(){
		return $this->renderTemplate();
	}
	/**
	 * 代码值上面表数据
	 * @author ldm
	 */
	public function codes_json(){
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""){
			return;
		}
		$medata=$this->exec('getProxy','escloud_structurews');
		$lists = $medata->codetop($stid);
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
			$sortArray[$key] = $row['ID'];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $results);
		$total = count($results);
		$results = array_slice($results,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i = 1;
		foreach($results AS $row){
		$entry = array('id'=>$row['ID'],
			'cell'=>array(
				'id1'=>$i,
				'c3'=>$row['ESIDENTIFIER'],
				'c4'=>$row['ESLENGTH'],
				'c5'=>$row['ESDESCRIPTION'],
				'c6'=>$row['METADATA']
			),
		);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 代码值下表数据显示
	 * @author ldm
	 */
	public function code_json(){
		$id = isset($_GET['id'])?$_GET['id']:"";
		$stid=isset($_GET['stid'])?$_GET['stid']:"";
		$moid =isset($_GET['moid'])?$_GET['moid']:"";
		if ($id==""||$stid==""||$moid==""){
			return;
		}
		$medata=$this->exec('getProxy','escloud_structurews');
		$lists = $medata->codebottom($stid,$moid,$id);
		if($lists==null){
			return ;
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
		$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
				'cell'=>array(
					'id2'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
					'c3'=>$row['tagPropvalue'],
					'c4'=>$row['tagCodevalue'],
					'c5'=>$row['tagDescription']
				),
			);
			$i++;
		$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 代码值保存
	 * @author ldm
	 */
	public function codevaluesave (){
		$param = $_POST['param'];
		$param = json_encode($param);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->codesave($param);
		if($save==true){
			echo "1";
		}else{
			echo "0";
		}
		
	}
	/**
	 * 代码值删除
	 * @author ldm
	 */
	public function codedel(){
		$param = $_POST['param'];
		$param = json_encode($param);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->codedel($param);
		if ($save==true){
			echo "1";
		}else{
			echo "0";
		}
	}
	
	
	

	
	
	/**
	 * 字段值规则保存
	 * @author ldm
	 */
	public function fieldvaluesave(){
		$data = $_POST['data'];
		echo $data;
	}
	/**
	 * 补零规则
	 * @author ldm
	 */
	public function zeropaddingrules(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$zero = $proxy->zeroRuleShow($stid,$molid);
		return $this->renderTemplate(array('list'=>$zero)); 
	}
	/**
	 * 补零规则的保存
	 * @author ldm
	 */
	public function zerorulesave(){
		$data = isset($_POST['data'])?$_POST['data']:"";
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		if($stid==""||$molid==""){
			return;
		}
		if ($data==""){
			$data=array();
		}
		$list = json_encode($data);
		//echo $list;return;
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->zerosave($stid,$molid,$list);
		if($save==true){
			echo "1";
		}else {
			echo "0";
		}
	}
	/**
	 * 组合字段显示
	 * @author ldm
	 */
	
	public function combinationfield(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$combine = $proxy->combineshowtop($stid,$molid);
		return $this->renderTemplate(array('list'=>$combine));
	}
	/**
	 * 组合字段中间数据显示
	 * @author ldm
	 */
	public function comshowcenter(){
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		$tagid = isset($_POST['tagid'])?$_POST['tagid']:"";
		if ($stid==""||$molid==""||$tagid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$combine = $proxy->combineshowcenter($stid,$molid,$tagid);
		//var_dump($combine);
		echo json_encode($combine);
	}
	/**
	 * 组合字段的下表显示
	 * @author ldm
	 */
	public function com_json(){
		$id = isset($_GET['id'])?$_GET['id']:"";
		$stid=isset($_GET['stid'])?$_GET['stid']:"";
		$moid = isset($_GET['moid'])?$_GET['moid']:"";
		$parid = isset($_GET['parid'])?$_GET['parid']:"";
		if ($parid==""||$moid==""||$id==""||$stid==""){
			return;
		}
		$medata=$this->exec('getProxy','escloud_structurews');
		$lists = $medata->combineshowbottom($stid,$moid,$parid,$id);
		//$lists = $medata->combineshowbottom(1,1,4,10);
		if($lists==null){
			return ;
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
		$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'id2'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
							'c1'=>'<a href="javascript:void(0);"><img onclick="getattrdata('.$row['id'].')" class="showout" src="/apps/escloudapp/templates/ESTemplate/img/editor.gif" /></a>' ,
							'c2'=>$row['display'],
							'c3'=>$row['tagPrepropvalue'],
							'c4'=>$row['tagPropvalue'],
							'c5'=>$row['tagDescription']
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 组合字段下表添加/修改
	 * @author ldm
	 */
	public function comadd(){
		$id=isset($_GET['id'])?$_GET['id']:"";
		$tag = isset($_GET['tag'])?$_GET['tag']:"";
		$stid=isset($_GET['stid'])?$_GET['stid']:"";
		$moid = isset($_GET['moid'])?$_GET['moid']:"";
		$parid = isset($_GET['parid'])?$_GET['parid']:"";
		if ($id==""){
			return $this->renderTemplate();
		}else {
			$proxy = $this->exec('getProxy','escloud_structurews');
			$list = $proxy->getinfo($id);
			//var_dump($list);
			return $this->renderTemplate(array('list'=>$list));
		}
		
	}
	/**
	 * 组合字段下表属性删除
	 * @author ldm
	 */
	public function comattrdel(){
		$data=isset($_POST['data'])?$_POST['data']:"";
		$tag = isset($_POST['tag'])?$_POST['tag']:"";
		$stid=isset($_POST['stid'])?$_POST['stid']:"";
		$moid = isset($_POST['moid'])?$_POST['moid']:"";
		$parid = isset($_POST['parid'])?$_POST['parid']:"";
		$data = json_encode($data);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$list = $proxy->combineattrdel($stid,$moid,$parid,$tag,$data);
		echo $list;
	}
	/**
	 * 组合字段下表添加字段保存
	 * @author ldm
	 */
	public function comaddval(){
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		$id = isset($_POST['id'])?$_POST['id']:"";
		$dataid=isset($_POST['dataid'])?$_POST['dataid']:"0";
		$parid = isset($_POST['parid'])?$_POST['parid']:"";
		$data = isset($_POST['data'])?$_POST['data']:"";
		parse_str($data,$output);
		$list = array(
				'TAG_PREPROPVALUE'=>$output['unrep'],
				'TAG_PROPVALUE'=>$output['rep'],
				'TAG_DESCRIPTION'=>$output['descri'],
				'OPER'=>'替换'
				);
		$datamap = json_encode($list);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$combine = $proxy->combineattrUpdateOrSave($dataid,$stid,$molid,$parid,$id,$datamap);
		echo $combine;
	}
	/**
	 * 组合字段下表删除
	 * @author ldm
	 */
	public function comdel(){
		$id = $_GET['id'];
		$list = explode(",", $id);
		$medata=$this->exec('getProxy','escloud_structurews');
		$count = count($list);
		for ($i=0;$i<$count;$i++){
			if ($list[$i]==""){
				continue;
			}else{
				//var_dump($list[$i]);
				$del = $medata->delattr($list[$i]);
			}
	
		}
		echo $del;
	}
	/**
	 * 组合字段保存
	 * @author ldm
	 */
	public function combinationsave(){
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		$tagid = isset($_POST['tagid'])?$_POST['tagid']:"";
		$data = isset($_POST['data'])?$_POST['data']:"";
		$data=rtrim($data,',');
		$list=array(
				'tagIds'=>$data
		);
		$list = json_encode($list);
		//echo $list;return ;
		$medata=$this->exec('getProxy','escloud_structurews');
		$proxy = $medata->combinesave($stid,$molid,$tagid,$list);
		echo $proxy;
	}
	/**
	 * 二维码规则
	 * @author ldm
	 */
	public function twodimensioncoderules(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$twobar = $proxy->towbarshow($stid,$molid);
		return $this->renderTemplate(array('list'=>$twobar));
	}
	/**
	 * 二维码规则保存
	 * @author ldm
	 */
	public function twobarsave(){
		$data = isset($_POST['data'])?$_POST['data']:"";
		$molid = isset($_POST['moid'])?$_POST['moid']:"";
		$stid = isset($_POST['stid'])?$_POST['stid']:"";
		if($stid==""||$molid==""){
			return;
		}
		if($data==""){
			$results=array();
		}else{
			$result = rtrim($data,",");
			$results = explode(',', $result);
		}
		$ss = json_encode($results);
		//echo $ss;return;
		$proxy = $this->exec('getProxy','escloud_structurews');
		$save = $proxy->towbarsave($stid,$molid,$ss);
		if($save==true){
		echo "1";
		}else {
		echo "0";
		}
	}
	
	/**
	 * modify 
	 * @author ldm
	 */
	public  function rules_json()
	{
		
		$sid = $_GET['sid'];
		$mid = $_GET['mid'];
		$isFirstLevel = $_GET['isFirstLevel'];

		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$proxy = $this->exec('getProxy', 'escloud_structurews');
		$map = $proxy->getAllRuleItem($sid, $mid);
		$esType = $map->esType;
		$rows = array(

				'bringFieldToAddRule' => array('name'=>'追加携带规则', 'ope'=> '<input onclick="addrules()" class="see" />'),
				'codeFieldRule' => array('name'=>'代码值规则', 'ope'=>'<input onclick="codevaluerules()" class="see" />'),
				'combinFieldRule' => array('name'=>'组合字段', 'ope'=>'<input onclick="combinationfield()" class="see" />'),
				'advanceSearchFieldRule' => array('name'=>'综合查询规则', 'ope'=>'<input onclick="comprehensivefield()" class="see" />'),
				'computeFieldsRule' => array('name'=>'字段值规则', 'ope'=>'<input onclick="fieldvaluerules()" class="see" />'),
				'displayFieldOfForm' => array('name'=>'表单显示字段规则', 'ope'=>'<input onclick="formfield()" class="see" />'),
				'displayFieldOfGrid' => array('name'=>'列表显示字段规则', 'ope'=>'<input onclick="listfield()" class="see" />'),
				'reportRule' => array('name'=>'报表规则', 'ope'=>'<input onclick="reportingrules()" class="see" />'),
// 				'usingFormFieldRule' => array('name'=>'检索显示字段', 'ope'=>'<input onclick="searchfield()" class="see" />'),//liqiubo 20140709 此规则没有找到使用的地方，暂时先屏蔽，如果需要再打开
				'sortRule' => array('name'=>'排序规则', 'ope'=>'<input onclick="sortrules()" class="see" />'),
// 				'twoBarRule' => array('name'=>'二维码规则', 'ope'=>'<input onclick="twodimensioncoderules()" class="see" />'),//liqiubo 20140626 屏蔽掉二维码规则
				'zeroRule' => array('name'=>'补零规则', 'ope'=>'<input onclick="zeropaddingrules()" class="see" />')
		);
		if($esType=='innerFile'){
			if($mid == -1 || $mid == 4){
				//wanghongchen 20140819 只有默认状态和档案著录显示鉴定规则
				$rows['checkUpRule'] = array('name'=>'档案鉴定规则', 'ope'=>'<input onclick="fileidentificationrules()" class="see" />');
			}
			$rows['scanRule'] = array('name'=>'扫描规则', 'ope'=>'<input onclick="scanningrules()" class="see" />');
		}
		if($esType=='file'){
			$rows['relationRule'] = array('name'=>'关联规则', 'ope'=>'<input onclick="associationrules()" class="see" />');
		}
		/** xiaoxiong 20140819 结构层级中的第一层拥有盒号规则，暂时没有项目级数据，有时再进行完善下 **/
		if($isFirstLevel == 1){
			$rows['boxRule'] = array('name'=>'盒号规则', 'ope'=>'<input onclick="boxRule()" class="see" />');
		}
		
		$jsonData = array('page'=> 1,'total'=> count($map),'rows'=>array());
		foreach($rows as $name => $value){
			
			$entry = array(
					'cell'=>array(
						'ope'=> $value['ope'],
						'name'=> $value['name'],
						'value'=> $map->$name
					)
			);
			
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/*
	 * 获得结构下定义的字段值字段
	 * key= left表示未定义的字段值
	 * key=right表示已定义的字段值
	 * author fangjixiang
	 */
	public function fieldvaluerules()
	{
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$result = $this->exec('getProxy','escloud_structurews')->getcomputefieldslist($sId,$mId);
		return $this->renderTemplate(array('list' => $result));
	}
	
	
	/*
	 * 获得结构下定义的累加参照字段
	* key= left表示未定义的字段值
	* key=right表示已定义的字段值
	* author fangjixiang
	*/
	public function Getreferencetieldstortag()
	{
		$sId = $_POST['sId'];	//获得ajax传递来的数据并转为整型
		$mId = $_POST['mId'];	//获得ajax传递来的数据并转为整型
		$tagId = $_POST['tagId'];				//获得ajax传递来的数据并转为整型
		$proxy = $this->exec('getProxy','escloud_structurews');
		//gengqianfeng 20141015 参数传值顺序出错
		$result = $proxy->getreferencetieldstortag($sId,$mId,$tagId);	//liqiubo 20140820 传值的顺序错了，导致查询不到数据
		//print_r($result); die();
		
		echo  json_encode($result);
	}
	
	/*
	 * 保存字段值字段
	 * author fangjixiang
	 */
	public function SetComputeFieldRule()
	{
		
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$tagId = $_POST['tagId'];
		
		
		$params['idStructure'] = $sId;			//获得ajax传递来的数据并转为整型
		$params['idBusiModel'] = $mId;			//获得ajax传递来的数据并转为整型
		$params['idTag'] = $tagId;				//获得ajax传递来的数据并转为整型
		$params['tagIds'] = $_POST['tagIds'];	//获得ajax传递来的数据并转为整型
		$params['esorder'] = 0;
		$params['esstage'] = null;
		
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result = $proxy->setComputeFieldRule($sId,$mId,$tagId,json_encode(array($params)));
		//var_dump($result);
		echo $result;
	}
	
	/*
	 * 删除字段值字段
	 * 
	 */
	public function DeleteComputeFieldRule()
	{
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$tagId = $_POST['tagId'];
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result = $proxy->deleteComputeFieldRule($sId,$mId,$tagId);
		echo $result;
	}
	
	/**
	 * 报表页面显示
	 * @author ldm
	 */
	public function reportingrules(){
		return $this->renderTemplate();
	}
	/**
	 * 报表数据显示
	 * @author ldm
	 */
	public function report_json(){
		$stid=isset($_GET['stid'])?$_GET['stid']:"";
		$moid = isset($_GET['moid'])?$_GET['moid']:"";
		if ($moid==""||$stid==""){
			return;
		}
		$proxy=$this->exec('getProxy','escloud_structurews');
		$lists = $proxy->getReportRule($stid,$moid);
		if($lists==null){
			return ;
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
		$i=1;
		foreach($results AS $row){
			$entry = array('id'=>$row['id'],
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id2" value='.$row['id'].'>',
							'c3'=>$row['reportstyle'],
							'c4'=>$row['title']
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}

	/**
	 * 报表规则保存
	 * @author ldm
	 */
	public function reportingrulessave(){
		$stid=isset($_POST['stid'])?$_POST['stid']:"";
		$moid = isset($_POST['moid'])?$_POST['moid']:"";
		if ($moid==""||$stid==""){
			return;
		}
		$ids = $_POST['id'];
		$ids=rtrim($ids,',');
		$id = explode(",", $ids);
		$id = json_encode($id);
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->setReportRule($stid,$moid,$id);
		echo $result;
		
	}
	
	public function report(){
		return $this->renderTemplate();
	}
	/**
	 * 删除报表规则
	 * @author ldm
	 */
	public function delreport(){
		$stid=isset($_POST['stid'])?$_POST['stid']:"";
		$moid = isset($_POST['moid'])?$_POST['moid']:"";
		if ($moid==""||$stid==""){
			return;
		}
		$ids = $_POST['id'];
		$ids=rtrim($ids,',');
		$id = explode(",", $ids);
		$id = json_encode($id);
		//echo $id;return;
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->deleteReportRule($stid,$moid,$id);
		echo $result;
	}
	/**
	 * 关联规则显示
	 * @author ldm
	 */
	public function associationrules(){
		$stid = $_GET['stid'];
		$moid = $_GET['moid'];
		$innerid = $_GET['innerid'];
		$proxy=$this->exec('getProxy','escloud_structurews');
		$list = $proxy->getNoRelationTags($stid,$moid);
		$rlist = $proxy->getRelationRule($stid,$innerid,$moid);
		
		if ($list!=null||$rlist!=null){
			$newrlist = array();
			$arr = array();
			foreach ($rlist as $k=>$v){
				if($v->sourcedisplay!=""){
					$newrlist[]=$v->sourcedisplay;
				}
			}
			foreach ($list as $k=>$v){
				if (!in_array($v->display, $newrlist)){
					$arr[] = $v;
				}
			}
		}else{
			$arr = array();
		}
		return $this->renderTemplate(array('lists'=>$arr));
	}


	/**
	 * 关联规则右表数据显示
	 * @author ldm
	 */
	public function association_json(){
		$stid=isset($_GET['stid'])?$_GET['stid']:"";
		$moid = isset($_GET['moid'])?$_GET['moid']:"";
		$innerid = $_GET['innerid'];
		if ($moid==""||$stid==""){
			return;
		}
		$proxy=$this->exec('getProxy','escloud_structurews');
		//$lists = $proxy->getRelationRule($stid,$innerid,$moid);
		$lists = $proxy->getRelationRuleNew($stid,$innerid,$moid);//使用新方法获得关联规则数据
		if($lists==null){
			return ;
		}
		$results = array();
		foreach($lists as $k=>$val)
		{
			$results[]=json_decode(json_encode($val),true);
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'source';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$total = count($results);
		$results = array_slice($results,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($results as $row){
			$compare = $row['relationCompare'];
			switch ($compare){
				case "EQUAL": $relationCompare="相等";break;
				case "SUM": $relationCompare="求和";break;
				case "MIN2MAX":$relationCompare="起始值";break;
				case "STATISTICS":$relationCompare="计数";break;
				default: $relationCompare="";break;
			}
			$ralation = $row['isRelation'];
			if($ralation==0){
				$imgsrc = "/apps/escloudapp/templates/ESTemplate/img/no.gif";
			}else{
				$imgsrc = "/apps/escloudapp/templates/ESTemplate/img/yes.gif";
			}
			$entry = array(
					'cell'=>array(
							'source'=>'<span sourcetagid="'.$row['sourcetagId'].'" targettagid="'.$row['targettagId'].'">'.$row['sourcedisplay'].'</span>',
							'target'=>'<span targettagid="'.$row['targettagId'].'">'.$row['targetdisplay'].'</span>',
							'compare'=>$relationCompare,
							'isrelation'=>'<a href="javascript:void(0);"><img class="changestate" src="'.$imgsrc.'" state="'.$ralation.'"/></a>'
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 右边表中删除组合字段
	 * @author ldm
	 */
	public function deleteCombinFieldRule(){
		$stid = $_POST['stid'];
		$moid = $_POST['moid'];
		$tagid = $_POST['tagid'];
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->deleteCombinFieldRule($stid,$moid,$tagid);
		echo $result;
	}
	/**
	 * 根据案卷级获取卷内级id
	 * @author ldm
	 */
	public function getChildStructure(){
		$stid = $_GET['stid'];
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->getChildStructure($stid);
		$innerFileID = isset($result->ID)?$result->ID:"";
		echo $innerFileID;
		
	}
	/**
	 * 关联规则保存
	 * @author ldm
	 */
	public function saverelation(){
		$stid = $_POST['stid'];
		$innerid = $_POST['innerid'];
		$moid = $_POST['moid'];
		$param = isset($_POST['param'])?$_POST['param']:"";
		//$param = $_POST['param'];
		if($param==""){
			$param=json_encode(array());
		}else{
			$param = json_encode($param);
		}
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->setRelationRule($stid,$innerid,$moid,$param);
		echo $result;
	}
	/**
	 * 关联规则保存
	 * @author ldm
	 */
	public function checkMIN2MAXFieldLength(){
		$stid = $_POST['stid'];
		$innerid = $_POST['innerid'];
		$moid = $_POST['moid'];
		$param = isset($_POST['param'])?$_POST['param']:"";
		//$param = $_POST['param'];
		if($param==""){
			$param=json_encode(array());
		}else{
			$param = json_encode($param);
		}
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->checkMIN2MAXFieldLength($stid,$innerid,$moid,$param);
		echo json_encode($result);
	}
	public function autoModifyTagLength(){
// 		$stid = $_POST['stid'];
// 		$innerid = $_POST['innerid'];
// 		$moid = $_POST['moid'];
		$dataList = isset($_POST['dataList'])?$_POST['dataList']:"";
		if($dataList==""){
			$dataList=json_encode(array());
		}else{
			$dataList = json_encode($dataList);
		}
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result = $proxy->autoModifyTagLength($dataList);
		echo json_encode($result);
	}
	/**
	 * 扫描规则数据获取
	 * @author ldm
	 */
	public function scanningrules(){
				
		$stid = $_GET['stid'];
		$moid = $_GET['moid'];
		$proxy=$this->exec('getProxy','escloud_structurews');
		$lists = $proxy->getScanRule($stid,$moid);
		//print_r($lists);die;
		$left = $right = '';
		
		foreach($lists->left as $row)
		{
		
			$flag = true;
			if(count(isset($lists->right)?$lists->right:null)){
				foreach((isset($lists->right)?$lists->right:null) as $Row)
				{
					$i = strpos($Row->display, $row->display);
					
					if($i !== false){
						$flag = false;
						
					}
				}
			
			}
			
			$left .= $flag ? "<li id='$row->tagId'>$row->display</li>" : '';
		}
		
		if(count(isset($lists->right)?$lists->right:null)){
			foreach((isset($lists->right)?$lists->right:null) as $Row)
			{
					
				$right .= "<li id='$Row->tagId'>$Row->display</li>";
				
			}
		}
		$params['path'] = isset($lists->path) ? $lists->path : '';
		$params['left'] = $left;
		$params['right'] = $right;
		//liqiubo 20140902 获取中文名显示
		$title = '';
		if(isset($lists->path)){
			$proxy=$this->exec('getProxy','escloud_folderservice');
			$patht = str_replace("/","",$lists->path);
			$title = $proxy->getTitlePath($patht);
		}
		$params['title'] = $title;
		return $this->renderTemplate($params);
		
	}
	public function quoteModel(){
		//得到树上节点
		$id = '1';
		$modelId = '0';
		$uId = $this->getUser()->getId();
		$uInfo = $this->exec('getProxy','user')->getUserInfo($uId);
		
		$uName = $uInfo->displayName;
		$userid = $uInfo->userid;
		
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$nodes = $proxy->getOwnBusinessTree($id, $modelId, '*', $userid);
		//print_r($nodes);die;
		$data = array(
				'zNodes'=>$nodes,
				'uInfo'=>array('uId'=>$uId,'uName'=>$uName)
		);
		return $this->renderTemplate($data);
	}
	/**
	 * 电子文件显示
	 * @author ldm
	 */
	public function pathchoose(){
		$proxy = $this->exec('getProxy','escloud_folderservice');
		$lists = $proxy->getlist($this->getUser()->getBigOrgId());//liqiubo 20140618 加入saas支持，加入bigOrgId作为条件查询
		if($lists==null){
			return $this->renderTemplate();
			return;
		}
		return $this->renderTemplate(array('list'=>$lists));
	}
	/**
	 * 扫描规则保存
	 * @author ldm
	 */
	public function savescanrule(){
		$stid = $_POST['stid'];
		$moid = $_POST['moid'];
		$data = $_POST['data'];
		$path = $_POST['path'];
		$param = array(
				'idStructure'=>$stid,
				'filepath'=>$path,
				'filename'=>$data,
				'esstage'=>"",
				'idBusiModel'=>$moid
			);
		$param = json_encode($param);
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result = $proxy->setScanRule($stid,$moid,$param);
		echo $result;
		
	}
	
	// 批量导出著录项#方吉祥#2012/12/20
	public function ExportModel()
	{
		$structureid = $_POST['structureid'];
		$proxy=$this->exec('getProxy','escloud_structurews');
		$addr = $proxy->exportModel($structureid);
		echo $addr;
		//print_r($addr); die();
		
// 		if($addr){
// 			$fileName=basename($addr);//获取下载文件的名称
// 			$pos=strrpos($fileName, '.');
// 			$key=substr($fileName, 0,$pos);//去除文件后缀，作为缓存的KEY
// 			$cache = $this->exec('getProxy','cache');
// 			$cache->setCache(md5($key),$addr);
// 			echo md5($key);
// 		}else{
// 			echo null;
// 		}
	}
	
	/**
	 * 下载
	 */
	public function download()
	{
		$fileUrl = $_GET['fileName'];
		$filName=basename($fileUrl);
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	}
	
	/**
	 * @author fangjixiang
	 * 下载
	 */
	public function downFile()
	{
		$cache = $this->exec('getProxy','cache');
		$fileUrl = $cache->getCache($_GET['fileName']);
		$filName=basename($fileUrl);
		//echo $fileUrl;die;
		// 输入文件标签
		//	header('Content-type: application/pdf');
		//	header('Content-Type: application-x/force-download');
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	}
	
	// 获得上传文件服务器地址
	public function GetServiceIP()
	{
		$proxy = $this->exec("getProxy", "escloud_fileoperationws");
		$serviceip = $proxy->getServiceIP();
		
		$serviceip = str_replace('escloud_fileoperationws', 'escloud_structurews', $serviceip);
		
		echo $serviceip.'/importModel';
	
	}
	
	public function GetMainSite()
	{
		$uId = $this->getUser()->getId();
		$mainSite = $this->exec('getProxy','user')->getUserInfo($uId)->deptEntry->mainSite;
		echo $mainSite;
	}
	/**
	 * 检索显示字段
	 * @author ldm
	 */
	public function searchfield(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$list = $proxy->getUsingGridFieldRule($stid,$molid);
		
		$left = '';
		$right = '';
		foreach ($list->left as $map)
		{
			if(empty($map->esidentifier)){
				continue;
			}
			$left .= '<li id="'. $map->tagId.'" name="'. $map-> esidentifier .'">'. $map->display .'</li>';
		}
		
		foreach ($list->right as $map)
		{
			if(empty($map->esidentifier)){
				continue;
			}
			$right .= '<li id="'. $map->tagId.'" name="'. $map-> esidentifier .'">'. $map->display .'</li>';
		}
		
		return $this->renderTemplate(array('left'=>$left, 'right'=>$right));
	}
	/**
	 * 检索显示字段保存
	 * @author ldm
	 */
	public function setUsingGridFieldRule(){
		
		//print_r($_POST); die;
		$data = isset($_POST['data']) ? $_POST['data'] : array();
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		
		$proxy = $this->exec('getProxy','escloud_structurews');
		echo $proxy->setUsingGridFieldRule($sId, $mId, json_encode($data));
		
	}
	
	
	/* 
	 * 方吉祥
	 * 20121226
	 * 档案鉴定规则
	 * 获取鉴定规则下拉框选项
	 */
	
	public function GetOptions()
	{
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$proxy = $this->exec('getProxy','escloud_structurews');
		
		$alreadyOptions = $proxy->getCheckUpRule($sId,$mId); // 已用object([tagidPreservationperiod] => 26,保管期限,[tagidStartenddate] => 22,归档日期)
		$allOptions = $proxy->getdispalyListNew($sId,$mId); // 全部array()
		
		//print_r($allOptions);
		//echo count($allOptions); die;
		//print_r($alreadyOptions);
		//die();
		
		$rp = explode(',', $alreadyOptions->tagidPreservationperiod); //26,保管期限
		$sd = explode(',',$alreadyOptions->tagidStartenddate); // 22,起始日期
		$selecded = array($sd[0],$rp[0]);

		$all = array(array('','请选择'));
		foreach ($allOptions as $key => $value)
		{
			$all[] = array(substr($key, 1),$value);
		}
		
		echo json_encode(array('selected'=>$selecded,'all'=>$all));
		// selected = ['1','2'];
		// allOptions = [[1,'xxx'],[2,'yyy']];
	}
	
	/* 
	 * 方吉祥
	 * 20121226
	 * 档案鉴定规则
	 * 获取鉴定规则表格数据
	 */
	public function GetCheckUpRulekeyvalue()
	{
		$sId = $_GET['sId'];
		$mId = $_GET['mId'];
		$startDateTagId = $_GET['startDateTagId'];
		$psTagId = $_GET['psTagId'];
		
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result = $proxy->getCheckUpRulekeyvalue($sId,$mId,$startDateTagId,$psTagId);
		//print_r($result);
		
		$jsonData = array('page'=>null,'total'=>null,'rows'=>array());
		foreach($result AS $value)
		{
			$entry = array(
					// radio name ident type search desc
					'cell'=>array(
							//wanghongchen 20140913 checkbox的value设置为id
							'cbox'=>'<input type="checkbox" value="'.$value->id.'" name="sinputC" />',
							'tagKey'=>$value->tagKey,
							'tagValue'=>$value->tagValue
					),
			);
			$jsonData['rows'][] = $entry;
		}
		
		echo json_encode($jsonData);
	}
	
	/*
	 * 方吉祥
	* 20121226
	* 档案鉴定规则
	* 保存鉴定参照字段
	*/
	public function SetCheckUpRule()
	{
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$startDateTagId = $_POST['startDateTagId'];
		$psTagId = $_POST['psTagId'];
		$proxy = $this->exec('getProxy','escloud_structurews');
		$isok = $proxy->setCheckUpRule($sId,$mId,$startDateTagId,$psTagId);
		echo $isok;
		
	}
	
	/* 
	 * 方吉祥
	 * 20121226
	 * 档案鉴定规则
	 * 保存鉴定规则
	 */
	public function SetCheckUpRulekeyvalue()
	{
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$startDateTagId = $_POST['startDateTagId'];
		$psTagId = $_POST['psTagId'];
		$params = $_POST['params'];
		$params = explode('@', $params);
		$p = array();
		foreach ($params as $par)
		{
			$par = explode(',', $par);
			//wanghongchen 20140915 增加ID
			$p[] = array('TAG_KEY'=>$par[0],'TAG_VALUE'=>$par[1],'ID'=>$par[2]);
		}
		//[{},{'':''}]
		$proxy = $this->exec('getProxy','escloud_structurews');
		$isok = $proxy->setCheckUpRulekeyvalue($sId,$mId,$startDateTagId,$psTagId,json_encode($p));
		//print_r($result);
		echo $isok;
		
	}
	
	/*
	 * 方吉祥
	* 20121226
	* 档案鉴定规则
	* 删除鉴定规则
	*/
	public function DeleteCheckUpRulekeyvalue()
	{
		$sId = $_POST['sId'];
		$mId = $_POST['mId'];
		$startDateTagId = $_POST['startDateTagId'];
		$psTagId = $_POST['psTagId'];
		$params = $_POST['params'];
		$params = explode('@', $params);
		$p = array();
		foreach ($params as $par)
		{
			$par = explode(',', $par);
			$p[] = array('TAG_KEY'=>$par[0],'TAG_VALUE'=>$par[1]);
		}
		//[{},{'':''}]
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result = $proxy->deleteCheckUpRulekeyvalue($sId,$mId,$startDateTagId,$psTagId,json_encode($p));
		//print_r($result);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 获得模版定义追加携带规则字段
	 * @date 2013-02-04
	 * @return mixed
	 */
	public function getBringFieldToAdd()
	{
		$request=$this->getRequest();
		$modelId=$request->getGet('moid');
		$sid=$request->getGet('stid');
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result=$proxy->getBringFieldToAdd(intval($sid),intval($modelId));
		$left = '';
		$right = '';
		foreach ($result->left as $map)
		{
			$left .= '<li id="'. $map->tagId.'" >'. $map->display .'</li>';
		}
		
		foreach ($result->right as $map)
		{
			$right .= '<li id="'. $map->tagId.'" >'. $map->display .'</li>';
		}
		return $this->renderTemplate(array('left'=>$left,'right'=>$right),'ESTemplate/searchfield');
	}
	/**
	 * @author wangtao
	 * 设置模版定义追加携带字段
	 * @date 2013-02-04
	 * @return bool
	 */
	public function setBringFieldToAdd()
	{
		$proxy = $this->exec('getProxy','escloud_structurews');
		$request=$this->getRequest();
		$modelId=$request->getPost('moid');
		$sid=$request->getPost('stid');
		$list=$request->getPost('data');
		if(empty($list)) {
			$arrayList = array();
		} else {
			$arrayList=explode(',',rtrim($list,','));
		}
		
		$result=$proxy->setBringFieldToAdd(intval($sid),intval($modelId),json_encode($arrayList));
		echo $result;
	}
	
	/** 
	 * fangjixiang 20130509  获得自己所在省的业务树所有节点 
	 * @param businessId 业务id 
	 * @return 树节点组成的list
	 */
	public function GetOwnBusinessTree()
	{
		
		$id = '1';
		$uId = $this->getUser()->getId();
		$uInfo = $this->exec('getProxy','user')->getUserInfo($uId);
		$modelId = '-1';
		$uName = $uInfo->displayName;
		$userid = $uInfo->userid;
		
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$nodes = $proxy->getOwnBusinessTree($id, $modelId, "*", $userid);
		//print_r($nodes);die;
		$data = array(
			'zNodes'=>$nodes,
			'uInfo'=>array('uId'=>$uId,'uName'=>$uName)
			);
		echo json_encode($data);
	}
	/**
	 * shimiao 20140402 获取没有只有结构的目录树
	 * @param 
	 * @return 树节点的list
	 */
	public function getChildTree(){
		$id=1;
		if($_GET['id']!=null && $_GET['id']>0){
			$id = $_GET['id'];
		}
		$uId = $this->getUser()->getId();
		//$modelId=0;
		$map = Array();
		//$map['modelID'] = $_GET['modelId'];//获取目录树
		$map['businessId'] = '1';
		$map['userId'] = $uId.'';
		$map['nodeId'] = $id.'';
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$nodes = $proxy->getBusinessNotLeafTree(json_encode($map));
		$node = $nodes->nodes;
		echo json_encode(array('zNodes'=>$node));
	}
	/**
	 * shimiao 20140403 得到结构模版
	 * @return 
	 */
	public function getStructureModel(){
	 $nodeId = $_GET['treeNodeId'];
	 //-1 代表改节点下的所有结构，大于1则具体结构
	 $structureId = $_GET['structureId'];
	 $nodeTitle = $_GET['nodeTitle'];
	 $page = isset($_POST['page']) ? $_POST['page'] : 1;
	 $rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
	 $proxy = $this->exec('getProxy','escloud_businesstreews');
	 //目录树节点ID 结构ID 用户ID
	 $rows = $proxy->getStructureModel($nodeId,$structureId,1,($page-1)*$rp,$rp);
	 
	 $total = $rows->total;
	 
	 $typeen = array('innerFile','file','doucument','project');
	 $typecn = array('卷内-文件','案卷-卷内-文件','文件','项目-案卷-卷内-文件');
	 
	 $jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
	 if($total>0){
	 	foreach($rows->dataList as $row){
	 
	 		foreach ($typeen as $n => $type)
	 		{
	 			if($type == $row->modelType) $ESTYPE = $typecn[$n];
	 		}
	 
	 		$entry = array(
	 				'id'=>$row->id,
	 				'cell'=>array(
	 						'cbox'=>'<input type="checkbox" name="sinputB" value="'.$row->id.'">',
	 						'operation'=> '<input onclick="chooseModel('.$row->id.',\''.$row->modelType.'\')" class="see" />',
	 						'modelType'=>$ESTYPE,
	 						'modelName'=>$row->modelName,
	 						'nodeTitle'=>$structureId>0?$nodeTitle:$row->nodeTitle
	 				),
	 		);
	 		$jsonData['rows'][] = $entry;
	 	}
	 }
	 echo json_encode($jsonData);
	}
	public function lookModelContent(){
		$type = $_GET['estype'];
		$sId = $_GET['structureId'];
		$data = array(
				'type'=>$type,
				'sId'=>$sId,
		);
		//获取当前节点所有子结构
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$childStructure = $proxy->getChildOfStructure($sId,$type);
		
		return $this->renderTemplate($childStructure);
	}
	
	function getModelTags(){
		$modelId = $_GET['modelId'] ;
		$modelType = $_GET['modelType'];
		$data = array('modelId'=> $modelId,	'modelType'=>$modelType);
		return $this->renderTemplate($data);
	}
	
	public function chooseModels(){
		$TreeNodeID= $_GET['TreeNodeID'];
		return $this->renderTemplate(array('TreeNodeID'=>$TreeNodeID));
	}
	public function chooseModelStructure(){
		$nodeId = $_POST['nodeId'];
		$modelId = $_POST['modelId'];
		$uId = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_structurews');
		$map = array();
		$map['nodeId'] = $nodeId;
		$map['modelId'] = $modelId;
		$map['userid'] = $uId;
		$result = $proxy->chooseModelStructure($map);
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$map=array();
		$map['userid'] = $uId;
		$map['module'] = '模板定义';
		$map['type'] = 'operation';
		$map['ip'] = $this->getClientIp();
		$map['loginfo'] = '模板定义，为树节点id为'.$nodeId.'的树节点选择模板'.$modelId;
		$map['operate'] = '模板定义：树节点编辑';
		$logProxy->saveLog(json_encode($map));
		
		echo json_encode($result);
	}
	public function getModelByTreeNode(){
		$nodeId = isset($_GET['nodeId']) ? $_GET['nodeId'] : "";
		if($nodeId == ""){
			die;
		}
		$map = array();
		$map['nodeId'] = $nodeId;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$map['start'] = ($page-1)*$rp;
		$map['limit'] = $rp;
		$map['userId'] = $this->getUser()->getId();
		//$map['modelId'] = $_GET['modelId'];
		$proxy=$this->exec('getProxy','escloud_structureModelws');
		$data=$proxy->getModelByTreeNode(json_encode($map));
		
		
		$total = $data->count;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $rp + 1; // 1-20, 21-40,41-60
		foreach ($data->data as $list){
			$business ='';
			if($list->busienss == 'archive'){
				$business = '档案业务';
			}
			$modelType = '';
			if('project' == $list->modelType ){
				$modelType = '项目-案卷-卷内-文件';
			}
			if('innerFile' == $list->modelType){
				$modelType = '卷内-文件';
			}
			if('file' == $list->modelType){
				$modelType = '案卷-卷内-文件';
			}
			$entry = array(
					'id'=>$list->modelId,
					'cell'=>array(
							'line'=> $line++,
							'cb'=>'<input boxid="'.$list->nodeId.'" type="checkbox" name="checks" class="selectone"  ln="'. ($line-1) .'" value="'.$list->nodeId.'">',
							'details'=> "<input type='button' class='details' />",
							'business'=> $business,
							'modelName'=> $list->modelName,
							'modelDes'=> $list->modelDes,
							'modelId'=> $list->modelId,
							'modelTypeHide'=>$list->modelType,
							'modelType'=> $modelType,
							'structureId'=> $list->structureId,
							'nodeId'=> $list->nodeId,
							'nodeTitle'=> $list->nodeTitle
					),
			);
		
			$jsonData['rows'][] = $entry;
		}
			echo json_encode($jsonData);
	}
	function quoteModelForTreeNode(){
		$nid = $_GET['nid'];
		$cnid = $_GET['cnid'];
		$proxy = $this->exec('getProxy','escloud_structurews');
		$map = array();
		$map['nid'] = $nid;
		$map['cnid'] = $cnid;
		$result = $proxy->quoteModelForTreeNode(json_encode($map));
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$map=array();
		$map['userid'] = $this->getUser()->getId();
		$map['module'] = '模板定义';
		$map['type'] = 'operation';
		$map['ip'] = $this->getClientIp();
		$map['loginfo'] = '模板定义，为树节点id为'.$nid.'的树节点引用模板'.$cnid;
		$map['operate'] = '模板定义：树节点编辑';
		$logProxy->saveLog(json_encode($map));
		
		echo json_encode($result);
	}
	/**
	 * 判断节点下是否存在结构和数据
	 */
	function judgeData(){
		$nodeId = $_POST['nodeId'];
		$params = json_encode(array('nodeId'=>$nodeId));
		$proxy = $this->exec('getProxy','escloud_structurews');
		$result = $proxy->judgeData($params);
		echo json_encode($result);
	}
	/**
	 * 	取消关联 shimiao 20140711 
	 */
	function deleteRelation(){
		$stid = $_POST['stid'];
		$innerid = $_POST['innerid'];
		$moid = $_POST['moid'];
		$param = array();
		//long sourceSid, long targetSid, Integer busiModelId
		$param['sourceSid']= $stid."";
		$param['targetSid']= $innerid.'';
		$param['busiModelId']= $moid.'';
		$proxy=$this->exec('getProxy','escloud_structurews');
		$res =  $proxy->deleteRelationRule(json_encode($param));
		if($res->success =='true'){
			$list = $proxy->getNoRelationTags($stid,$moid);
			$rlist = $proxy->getRelationRule($stid,$innerid,$moid);
			
			if ($list!=null||$rlist!=null){
				$newrlist = array();
				$arr = array();
				foreach ($rlist as $k=>$v){
					if($v->sourcedisplay!=""){
						$newrlist[]=$v->sourcedisplay;
					}
				}
				foreach ($list as $k=>$v){
					if (!in_array($v->display, $newrlist)){
						$arr[] = $v;
					}
				}
			}else{
				$arr = array();
			}
			echo json_encode($arr);
		}else{
			echo 'true';
		}
	}
	function deleteModel(){
		$TreeNodeID = $_GET['TreeNodeID'];
		$map = array();
		$map['nodeId'] = $TreeNodeID;
		$proxy=$this->exec('getProxy','escloud_structurews');
		$res =  $proxy->deleteModel(json_encode($map));
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$map=array();
		$map['userid'] = $this->getUser()->getId();
		$map['module'] = '模板定义';
		$map['type'] = 'operation';
		$map['ip'] = $this->getClientIp();
		$map['loginfo'] = '模板定义，为树节点id为'.$TreeNodeID.'的树节点取消模板';
		$map['operate'] = '模板定义：树节点编辑';
		$logProxy->saveLog(json_encode($map));
		
		echo $res;
	}
	function getModelByNodePath(){
		$nodePath = $_POST['nodePath'];
		$map = array();
		$map['nodePath'] = $nodePath;
		$map['userId'] = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_authservice');
		$res =  $proxy->getModelByNodePath(json_encode($map));
		echo $res;
	}
	function saveRoleForTreeNodes(){
		$roleIds = $_POST['roleIds'];
		$ids = $_POST['ids'];
		$map = array();
		$map['roleIds'] = $roleIds;
		$map['ids'] = $ids;
		$map['userId'] = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesstreews');
		$res =  $proxy->saveRoleForTreeNodes(json_encode($map));
		echo $res;
	}
	
	function boxRule(){
		$molid = isset($_GET['moid'])?$_GET['moid']:"";
		$stid = isset($_GET['stid'])?$_GET['stid']:"";
		if ($stid==""||$molid==""){
			return;
		}
		$proxy = $this->exec('getProxy','escloud_structurews');
		$returndata = $proxy->getBoxRole($stid,$molid);
		return $this->renderTemplate(array('left'=>$returndata->left,'right'=>$returndata->data, 'id'=>$returndata->id, 'ids'=>$returndata->ids));
	}
	
	function saveBoxRule(){
		$map = array();
		$map['id'] = $_POST['id'];
		$map['structureId'] = $_POST['structureId'];
		$map['busiModelId'] = $_POST['busiModelId'];
		$map['tagids'] = $_POST['ids'];
		$map['oldids'] = $_POST['oldids'];
		$map['userId'] = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_structurews');
		$res =  $proxy->saveBoxRule(json_encode($map));
		echo $res;
	}
	/**
	 * @author ldm
	 * 元数据集的包含的元数据显示
	 */
	public  function metadatafilter()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$structureId = $_GET['structureId'];
		$medataProxy = $this->exec('getProxy','escloud_metadataws');
		$medata_list = $medataProxy->getMetadataFilter($structureId,1,$page,$rp);
		$total = $medata_list->total;
		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL','RESOURCE');
		$typecn = array('文本','数值','日期','浮点','时间','布尔','资源');
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($medata_list->dataList AS $row)
			{   foreach ($typeen as $n => $type)
				{
					if($type == $row->estype) $ESTYPE = $typecn[$n];
				}
				$entry = array('id'=>$row->id,
						// radio name ident type search desc
						'cell'=>array(
								'radio'=>'<input type="radio" name="metadata" value="'.$row->id.'">',
								'name'=>$row->estitle,
								'ident'=>'<span metadataid="'.$row->id.'" >'.$row->esidentifier.'</span>',
								'type'=>$ESTYPE,
								'search'=>$row->esismetadatasearch ? '是' : '否',
								'desc'=>$row->esdescription
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
	
		echo json_encode($jsonData);
	
	}
	//返回结构字段数据table
	public  function structure_field()
	{
	
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
	
		$class = $this->exec('getProxy','escloud_structurews');
		$rows = $class->getStructureList($_GET['id'],$page,$rp);
	
	
		$total = $rows->total;
	
		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL','RESOURCE');
		$typecn = array('文本','数值','日期','浮点','时间','布尔','资源');
	
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($rows->dataList as $row){
	
				foreach ($typeen as $n => $type)
				{
					if($type == $row->ESTYPE) $ESTYPE = $typecn[$n];
				}
	
				
	//METADATAID
				$entry = array(
						'id'=>$row->ID,
						'cell'=>array(
								'cbox'=>'<input type="checkbox" name="sinputB" oldText="'.$row->ESIDENTIFIER.'" value="'.$row->ID.'">',//加入新的属性oldText，存储显示的值，以免修改后拿不到原来的值
								'ESIDENTIFIER'=>$row->ESIDENTIFIER,
								'METADATA'=>'<span tagid="'.$row->ID.'" metadataid="'.$row->METADATAID.'" tempmetaid="'.$row->ID.'" tempmetaname="'.$row->METADATA.'" >'.$row->METADATA.'</span>',
								'ESTYPE'=>$ESTYPE,
								'ESLENGTH'=>$row->ESLENGTH,
								'ESDOTLENGTH'=>$row->ESDOTLENGTH,
								'ESDESCRIPTION'=>$row->ESDESCRIPTION
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		//var_dump($jsonData);die;
		echo json_encode($jsonData);
		//var_dump($rows);
	}
	function fieldsBatchSpecify(){
		return $this->renderTemplate();
	}
	function bachUpdateTags(){
		$params = isset($_POST['params'])?$_POST['params']:"";
		$proxy=$this->exec('getProxy','escloud_structurews');
		$result=$proxy->bachUpdateTags(json_encode($params));
		echo $result?'true':'false';
	}
	
	public function getAllTagListByStructureId()
	{
		$proxy = $this->exec('getProxy','escloud_structurews');
		$param = json_encode(array('structureId'=>$_GET['id']));
		$rows = $proxy->getAllTagListByStructureId($param);
		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL','RESOURCE');
		$typecn = array('文本','数值','日期','浮点','时间','布尔','资源');
		$jsonData = array('page'=>null,'total'=>null,'rows'=>array());
		foreach($rows as $row){
			foreach ($typeen as $n => $type)
			{
				if($type == $row->ESTYPE) $ESTYPE = $typecn[$n];
			}
			$entry = array(
				'id'=>$row->ID,
				'cell'=>array(
					'cbox'=>'<input type="checkbox" name="sinputB" oldText="'.$row->ESIDENTIFIER.'" value="'.$row->ID.'">',//加入新的属性oldText，存储显示的值，以免修改后拿不到原来的值
					'ESIDENTIFIER'=>$row->ESIDENTIFIER,
					'METADATA'=>'<span tagid="'.$row->ID.'" metadataid="'.$row->METADATAID.'" tempmetaid="'.$row->ID.'" tempmetaname="'.$row->METADATA.'" >'.$row->METADATA.'</span>',
					'ESTYPE'=>$ESTYPE,
					'ESLENGTH'=>$row->ESLENGTH,
					'ESDOTLENGTH'=>$row->ESDOTLENGTH,
					'ESDESCRIPTION'=>$row->ESDESCRIPTION
				),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * wanghongchen 20140902  获取所有元数据
	 */
	public  function getAllMetadata()
	{
		$structureId = $_POST['structureId'];
		$medataProxy = $this->exec('getProxy','escloud_metadataws');
		$medata_list = $medataProxy->getMetadataFilter($structureId,1,1,1000);
		echo json_encode($medata_list->dataList);
	
	}
}