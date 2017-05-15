<?php
/**
 * @author xiaoxiong 20140529
 * 新建协同处理Action
 */
class ESFormStartAction extends ESActionBase {
	
	const PROXY_NAME = "escloud_formstart";
	
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	
	/** 获取当前用户有权限发起的且为启用状态的表单列表 **/
	public function getAccreditedFormBuilder(){
		$searchKeyword = isset($_POST['query']) ? $_POST['query'] : '';
		$formType = isset($_GET['formType']) ? $_GET['formType'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['formType'] = $formType;
		$data['searchKeyword'] = $searchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getAccreditedFormBuilder($postData);
		$total = $returnData->size;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"formid"=>$row->formid,
							"handle"=>"<span class='editbtn' >&nbsp;</span>",
							"formname"=>$row->formname,
							"workflowname"=>$row->workflowname,
							"wfDescription"=>$row->wfDescription
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 在显示表单发起界面前，获取表单相关信息 **/
	public function showMyForm(){
		$data['formid'] = $_POST['formid'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->showMyForm($postData);
		echo $result;
	}
	
	/** 渲染表单发起界面 **/
	public function formStartPage() {
		$startFrom = isset($_POST['startFrom'])?$_POST['startFrom']:'';
		
		$SESScommon=array();
		$dataList = '';
		if($startFrom == 'ESArchiveSeache'){
			if(isset($_SESSION['shopcar'])){
				$SESScommon=$_SESSION['shopcar'];
				foreach($_SESSION['shopcar'] as $row){
					$tempPath = $row['id'];
					$dataList = $dataList.$tempPath.'|';
				}
			}
		}
		$formId = $_POST['formId'];
		$wfModelId = $_POST['wfModelId'];
		$actionId = $_POST['actionId'];
		$actionSize = $_POST['actionSize'];
		$extjs = $_POST['extjs'];

		$relationBusiness = $_POST['relationBusiness'];
		
		$comboIDs = isset($_POST['comboIDs'])?$_POST['comboIDs']:'';
		$gridComBoIDs = isset($_POST['gridComBoIDs'])?$_POST['gridComBoIDs']:'';
// 		$datas = array("data"=>array($formId,$wfModelId,$actionId,$actionSize,$extjs,$relationBusiness,$startFrom,$SESScommon));
		
		
		$dataId = isset($_POST['dataId'])?$_POST['dataId']:'-1';
		$wfId = isset($_POST['wfId'])?$_POST['wfId']:'-1';
		$wfType = isset($_POST['wfType'])?$_POST['wfType']:'';
		$stepId = isset($_POST['stepId'])?$_POST['stepId']:'';
		$printStepId = isset($_POST['printStepId'])?$_POST['printStepId']:'';
		$userFormNo = isset($_POST['userFormNo'])?$_POST['userFormNo']:'';
		
		$oldFileName = isset($_POST['oldFileName'])?$_POST['oldFileName']:'';
		$oldFilePathList = isset($_POST['oldFilePathList'])?$_POST['oldFilePathList']:'';
		
		$datas = array("data"=>array($formId,$wfModelId,$actionId,$actionSize,$extjs,$dataId,$wfId,$wfType,$relationBusiness,$startFrom,$dataList,$printStepId,$userFormNo,$oldFileName,$oldFilePathList,json_encode($comboIDs),json_encode($gridComBoIDs),$stepId));

		return $this->renderTemplate($datas);
	}
	
	/** 渲染表单发起界面 **/
	public function formStartHandlePage() {
 		$data['wfIdentifier'] = $_POST['wfIdentifier'];
 		$data['stepId'] = $_POST['stepId'];
 		$data['userId'] = $this->getUser()->getId();
 		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
 		$postData = json_encode($data);
 		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
 		$actions=$Proxy->getActions($postData);
		$datas = array("data"=>array($actions));
		return $this->renderTemplate($datas);
	}
	
	/** 获取下一步处理人**/
	public function getStepOwner(){
		$formData = isset($_POST['formData'])?$_POST['formData']:'';
		parse_str($formData,$out);
		$data['wfModelId'] = $_POST['wfModelId'];
		$data['formId'] = $_POST['formId'];
		$data['actionId'] = $_POST['actionId'];
		$data['wfId'] = isset($_POST['wfId']) ? $_POST['wfId'] : '';
		$data['dataId'] = isset($_POST['dataId']) ? $_POST['dataId'] : '';
		$data['stepId'] = isset($_POST['stepId']) ? $_POST['stepId'] : '';
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$data = $data + $out;
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->getStepOwner($postData);
		echo $result;
	}
	
	/** 渲染选择下一步处理人界面 **/
	public function selectWfOwnerPage() {
		$userId = $this->getUser()->getId();
		$nextStepOwner = $_POST['nextStepOwner'];
		$datas = array("data"=>array($nextStepOwner,$userId));
		return $this->renderTemplate($datas);
	}
	

	/** 流程发起方法 **/
	public function startWorkflow(){
		$params = $_POST['postData'];
		$params = $params.'&formId='.$_POST['formId']
		.'&wfModelId='.$_POST['wfModelId']
		.'&actionId='.$_POST['actionId']
		.'&filePaths='.$_POST['filePaths']
		.'&dataList='.$_POST['dataList']
		.'&fileNames='.$_POST['fileNames']
		.'&dataHaveRight='.$_POST['dataHaveRight']
		.'&selectUsers='.$_POST['selectUsers']
		.'&condition='.$_POST['condition']
		.'&applyDateCount='.$_POST['applyDateCount']
		.'&readRight='.$_POST['readRight']
		.'&downLoadRight='.$_POST['downLoadRight']
		.'&printRight='.$_POST['printRight']
		.'&lendRight='.$_POST['lendRight']
		.'&userId='.$this->getUser()->getId()
		.'&remoteAddr='.$_SERVER["REMOTE_ADDR"];
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->startWorkflow($postData);
		
		$resultMap = json_decode($result);
		$successFlag=$resultMap->success;
		if($successFlag){
			unset($_SESSION['shopcar']);
			// 			if(isset($_SESSION['shopcar'])){
			// 				$SESScommon=array();;
			// 			}
		}
		echo $result;
	}
	
	/** 保存待发方法 **/
	public function saveWorkflow(){
		$params = $_POST['postData'];
		$params = $params.'&formId='.$_POST['formId']
// 		.'&wfModelId='.$_POST['wfModelId']
// 		.'&actionId='.$_POST['actionId']
		.'&filePaths='.$_POST['filePaths']
		.'&dataList='.$_POST['dataList']
		.'&fileNames='.$_POST['fileNames']
		.'&dataHaveRight='.$_POST['dataHaveRight']
// 		.'&selectUsers='.$_POST['selectUsers']
// 		.'&condition='.$_POST['condition']
// 		.'&applyDateCount='.$_POST['applyDateCount']
// 		.'&readRight='.$_POST['readRight']
// 		.'&downLoadRight='.$_POST['downLoadRight']
// 		.'&printRight='.$_POST['printRight']
// 		.'&lendRight='.$_POST['lendRight']
		.'&userId='.$this->getUser()->getId()
		.'&remoteAddr='.$this->getClientIp();
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->saveWorkflow($postData);
		$successFlag = $result->success;
		$stateFlag = $result->state;
		if($successFlag && $stateFlag){
			unset($_SESSION['shopcar']);
// 			if(isset($_SESSION['shopcar'])){
// 				$SESScommon=array();;
// 			}
		}
		echo json_encode($result);
	}
	/** 查看流程图的方法 **/
	public function showWfGraph(){

		$modelId = isset($_POST['modelId']) ? $_POST['modelId'] : '';
		$stepId = isset($_POST['stepId']) ? $_POST['stepId'] : '';
		$wfId = isset($_POST['wfId']) ? $_POST['wfId'] : '';
		$statue = isset($_POST['statue']) ? $_POST['statue'] : '';
		
		$data['modelId'] = $modelId;
		$data['stepId'] = $stepId;
		$data['wfId'] = $wfId;
		$data['statue'] = $statue;
		$data['userId'] = $this->getUser()->getId();
		
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->showWfGraph($postData);
		
		/** xiaoxiong 20140828 修改流程图展现方法 **/
		$mxGraphHtml = $result->mxGraphHtml;
		$wfStep = $result->wfStep;
		$wfStepOwer = $result->wfStepOwer;
		$hasNowOver = false;
		$x=0;
		$y=0;
		
		$str = substr($mxGraphHtml, strpos($mxGraphHtml,"<svg")) ;
		$str = substr($str, 0, strpos($str,"</svg>")+6) ;
		
		$mxGraphHtml = substr($mxGraphHtml, 0, strpos($mxGraphHtml,"<svg")) ;
		//写入文件
		$datas = explode('id="STEPSVG_'.$wfStep.'"', $str) ;
		if(count($datas) == 2){
			$length = strpos($datas[1]," y=") - strpos($datas[1]," x=")+3 ;
			$x = (int)substr($datas[1], strpos($datas[1]," x=")+4, $length)+30 ;
			$length = strpos($datas[1]," style") - strpos($datas[1]," y=")+3 ;
			$y = (int)substr($datas[1], strpos($datas[1]," y=")+4, $length)+30 ;
			$owers = explode(',', $wfStepOwer) ;
			$vv = '' ;
			foreach($owers as $item){
				if($item!=''){
					if($vv == ''){
						$vv = $item ;
					} else {
						$vv = $vv."，".$item ;
					}
				}
			}
			$datas2 = explode('<g><g>', $datas[0]) ;
			$str = $datas2[0] ;
			if(count($datas2) == 3){
				$str = $str.'<text id="wfStepOwerShowDiv" x="'.$x.'" y="'.$y.'" font-size="12" font-weight="bold" style="pointer-events: all;padding:2px 5px 3px 5px;z-index: 999999999;display:block;background:#E8E8E8;border:solid 1px #C9C9C9;">'.$vv.'</text><script language="JavaScript"><![CDATA[document.getElementById("wfStepOwerShowDiv").style.display="none";function showInfor(evt) {document.getElementById("wfStepOwerShowDiv").style.display = "block" ;}function hideInfor(evt) {if (document.getElementById("wfStepOwerShowDiv")){document.getElementById("wfStepOwerShowDiv").style.display = "none" ;}}]]></script><g><g/><g><g>' ;
				$str = $str.$datas2[2] ;
			} else {
				$str = $str.'<text id="wfStepOwerShowDiv" x="'.$x.'" y="'.$y.'" font-size="12" font-weight="bold" style="pointer-events: all;padding:2px 5px 3px 5px;z-index: 999999999;display:block;background:#E8E8E8;border:solid 1px #C9C9C9;">'.$vv.'</text><script language="JavaScript"><![CDATA[document.getElementById("wfStepOwerShowDiv").style.display="none";function showInfor(evt) {document.getElementById("wfStepOwerShowDiv").style.display = "block" ;}function hideInfor(evt) {if (document.getElementById("wfStepOwerShowDiv")){document.getElementById("wfStepOwerShowDiv").style.display = "none" ;}}]]></script><g></g><g><g>' ;
				$str = $str.$datas2[1] ;
			}
			$str = $str.'id="STEPSVG_'.$wfStep.'" fill="#FF0000" font-weight="bold" ' ;
			$str = $str.' onmouseover="showInfor(evt)" onmouseout="hideInfor(evt)" onmousemove="showInfor(evt)" ' ;
			$str = $str.$datas[1] ;
			$hasNowOver = true ;
		}
		
		// w表示以写入的方式打开文件，如果文件不存在，系统会自动建立
		$file_pointer = fopen(AOPROOT."/html/apps/escloudapp/templates/ESFormStart/WfGraph.svg","w");
		$str = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">'.$str ;
		$str = str_replace('<text ','<text font-family="Simsun" ',$str);
		fwrite($file_pointer,$str);
		fclose($file_pointer);
		
		$jsonData = array('mxGraphHtml'=>$mxGraphHtml);
		
		return $this->renderTemplate($jsonData);
// 		echo json_encode($result);
	}
	
	/**
	 * 跳到初始的添加借阅明细页面
	 */
	public function record(){
		return $this->renderTemplate();
	}
	// 获得文档类型树
	public function getTree()
	{
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$status = $_GET['status'];//获取当前业务的状态
		$userId = $this->getUser()->getId();
		$treelist = $proxy->getBusinessAuthorTreeForWFAttachData('1',$status,$userId);
		foreach($treelist as $k=>$v)
		{
			if($v->pId==0){
				$v->open = true;
				break;
			}
		}
		echo json_encode($treelist);
	}
	
	/**
	 *
	 * 在页面上显示著录明细
	 */
	public function datalist(){
		$path=$_GET['path'];
		$fields=$this->getFields($path,'string');
		return $this->renderTemplate(array('fields'=>$fields,'path'=>$path));
	}
	
	/**
	 * 获取列表内容
	 */
	public function set_json()
	{
		if(!isset($_GET['keyword'])) return ;
		$keyword=$_GET['keyword'];
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$query = $request->getPost('query');
		if(empty($query['groupCondition'])===FALSE) {
			$groupcondition = $query['groupCondition'];
		} else {
			$groupcondition = array();
		}
		//var_dump($groupcondition);exit;
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$itemPath = $request->getGet('itemPath');
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$prePath= isset($_GET['prePath']) ? $_GET['prePath'] : '';//用于获取卷内文件 $prePath当前树节点案卷级PATH
		$boxfile= isset($_GET['boxfile']) ? $_GET['boxfile'] : '';//用于判断是否是浏览盒内数据
		$radio = isset($_GET['radio'])?$_GET['radio']:'';//用于判断显示单选框还是复选框
		if(empty($query)){
			$query=array();
		}else{
			$temp=explode('@',@rtrim($query,'@'));
			$query=$temp;
		}
		$rp = isset($rp) ? $rp : 20;
		$json=$this->getFields($path,'array');
	
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($path);
	
		$arr=array('keyword'=>$keyword,'columns'=>$json,'parentPath'=>$prePath,'groupCondition'=>$groupcondition);
		$list=json_encode($arr);
		$start=($page-1)*$rp;
		if(!empty($itemPath))
		{
			$path=$itemPath;
		}
		$userId=$this->getUser()->getId();
		$userId=!empty($userId)?$userId:0;
		if($boxfile){
			$path=preg_replace('/\_\d{1}/','',$path,1);
		}
		$rows=$this->getDataList($path,$start,$rp,$userId,$list);
		$total = isset($rows['total'])?$rows['total']:0;
		//header("Content-type: application/json");
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		if($radio){
			$type='radio';
		}else{
			$type='checkbox';
		}
		foreach($rows['dataList'] AS $row){
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'ids'=>'<input type="'.$type.'" name="path" value='.$row["path"].'>',
							//'operate'=>$boxfile?'<span title="编辑" class="editbtn" onclick=showBoxFile("'.$row["path"].'")>&nbsp;</span></a>&nbsp;&nbsp;<span title ="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>':'<span class="editbtn" title="编辑档案" onclick=show_items("'.$row["path"].'")>&nbsp;</span></a>&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>',
							'operate'=>$row['filecount']>0?'<span title="编辑" class="editbtn" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span></a>&nbsp;&nbsp;<span title ="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>':'<span class="editbtn" title="编辑档案" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span></a>',
							'relation'=>$row['relation']=='true'?1:'',
							'bussystemid'=>$row['bussystemid']
					),
					'classname'=>$row['relation']=='true'?'flag':''
			);
				
				
			/*if($row['filecount']){
			 $entry['cell']['operate'].='&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
			}*/
			for($j=0;$j<count($data);$j++)
			{
			if(array_key_exists($data[$j]->name,$row))
			{
			//判断是否存在附件数。存在则显示电子列表标签
					
				//存在纸质文件的tr标记不同颜色
				if($data[$j]->metadata=='PaperAttachments' && $row[$data[$j]->name]>0){
				if(isset($entry['cell']['flag'])){
						$entry['cell']['flag'].='<span class="paperflag" title="存在纸质附件" >&nbsp;</span>&nbsp;&nbsp;';
						}else{
								$entry['cell']['flag']='<span class="paperflag" title="存在纸质附件" >&nbsp;</span>&nbsp;&nbsp;';
						}
					}
								//装盒的数据tr标记不同颜色
								if($data[$j]->metadata=='CaseID' && !empty($row[$data[$j]->name])){
								if(isset($entry['cell']['flag'])){
								$entry['cell']['flag'].='<span class="pflag" title="数据已装盒" >&nbsp;</span>&nbsp;&nbsp;';
						}
										else{
										$entry['cell']['flag']='<span class="pflag" title="数据已装盒" >&nbsp;</span>&nbsp;&nbsp;';
										}
										}
										if(($data[$j]->metadata == 'ElectronicAttachmentStatus') && ($row[$data[$j]->name] == '是')){
										if(isset($entry['cell']['flag'])){
										$entry['cell']['flag'].='<span class="efile-int" title="电子附件完整" >&nbsp;</span>&nbsp;&nbsp;';
										}
										else{
											$entry['cell']['flag']='<span class="efile-int" title="电子附件完整" >&nbsp;</span>&nbsp;&nbsp;';
										}
								}
								$entry['cell'][$data[$j]->name]=$row[$data[$j]->name];
			}
				
			}
				
				
			for($j=0;$j<count($json);$j++)
			{
			if(array_key_exists($json[$j],$row))
			{
			$entry['cell'][$json[$j]]=$row[$json[$j]];
			}
	
			}
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	/**
	* 获取数据
	*/
	private function getDataList($path,$start,$limit,$uid,$json)
	{
	$proxy=$this->exec('getProxy','escloud_businesseditws');
	$data=$proxy->getDataListByWord($path,$start,$limit,$uid,$json);
		$rows=json_decode(json_encode($data),true);
		return  $rows;
	}
	/**
	 *
	 * 获取相关著录文件的字段值
	 */
	public function getFields($path,$type)
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($path);
		if($type!=''&& $type=='string')
		{
			$str='';
			foreach ($data as $key=>$value)
			{
				$str.=json_encode($value).',';
			}
			$str=rtrim($str,',');
			return  $str;
		}else{
			$data=json_decode(json_encode($data),true);
			$arr=array();
			foreach ($data as $value)
			{
				$arr[]=$value['name'];
			}
			return $arr;
		}
	}
	
	
	
	/** 判断当前流程当前步骤是否已经审批过 **/
	public function wfIsApprovaled(){
		$data['formId'] = $_POST['formId'];
		$data['wfId'] = $_POST['wfId'];
		$data['stepId'] = $_POST['stepId'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->wfIsApprovaled($postData);
		echo $result;
	}
	
	/** 获取进入审批界面前需要处理信息 **/
	public function approvalForm(){
		$data['formId'] = $_POST['formId'];
		$data['wfId'] = $_POST['wfId'];
		$data['stepId'] = $_POST['stepId'];
		$data['firstStepId'] = $_POST['firstStepId'];
		$data['isLast'] = $_POST['isLast'];
		$data['isSelf'] = $_POST['isSelf'];
		$data['workFlowType'] = $_POST['workFlowType'];
		$data['dataId'] = $_POST['dataId'];
		$data['isResponseOpinion'] = $_POST['isResponseOpinion'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->approvalForm($postData);
		echo $result;
	}
	
	/** 渲染表单审批界面 **/
	public function approvalFormPage() {
		$dataId = $_POST['dataId'];
		$userFormNo = $_POST['userFormNo'];
		$formId = $_POST['formId'];
		$wfModelId = $_POST['wfModelId'];
		$actionId = $_POST['actionId'];
		$actionName = $_POST['actionName'];
		$actionSize = $_POST['actionSize'];
		$wfId = $_POST['wfId'];
		$stepId = $_POST['stepId'];
		$isLastStep = $_POST['isLastStep'];
		$extjs = $_POST['extjs'];
		$simpleMsg = $_POST['simpleMsg'];
		$classicMsg = $_POST['classicMsg'];
		$tableMsg = $_POST['tableMsg'];
		$isForward = $_POST['isForward'];
		$isOver = $_POST['isOver'];
		$isNotice = $_POST['isNotice'];
		$oldFileName = $_POST['oldFileName'];
		$oldFilePathList = $_POST['oldFilePathList'];
		$selectPath = $_POST['selectPath'];
		$firstStepId = $_POST['firstStepId'];
		$comboIDs = isset($_POST['comboIDs'])?$_POST['comboIDs']:'';
		$gridComBoIDs = isset($_POST['gridComBoIDs'])?$_POST['gridComBoIDs']:'';
		$relationBusiness = isset($_POST['relationBusiness'])?$_POST['relationBusiness']:'';
		$datas = array("data"=>array($dataId, $userFormNo, $formId,$wfModelId,$actionId,$actionName,$actionSize,$wfId,$stepId,$isLastStep,$extjs,$simpleMsg,$classicMsg,$tableMsg,$isForward,$isOver,$isNotice, $oldFileName, $oldFilePathList, $selectPath, $firstStepId,json_encode($comboIDs),json_encode($gridComBoIDs),$relationBusiness));
		return $this->renderTemplate($datas);
	}

	/** 渲染表单处理界面 **/
	public function formApprovalHandlePage() {
		if($_POST['isForward'] == 'true' || $_POST['isNotice'] == 'true'){
			$datas = array("data"=>array('none',''));
			return $this->renderTemplate($datas);
		} else {
			$data['wfIdentifier'] = $_POST['wfIdentifier'];
			$data['wfId'] = isset($_POST['wfId'])?$_POST['wfId']:'';
			$data['stepId'] = $_POST['stepId'];
			$data['isFrom'] = 'formApprovalPage';
			$data['userId'] = $this->getUser()->getId();
			$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
			$postData = json_encode($data);
			$Proxy=$this->exec('getProxy',self::PROXY_NAME);
			$actions=$Proxy->getActions($postData);
			$datas = array("data"=>array("''",$actions));
			return $this->renderTemplate($datas);
		}
	}
	
	/** 判断流程是否已经审批过 **/
	public function isApprovalOver(){
		$data['wfId'] = $_POST['wfId'];
		$data['stepId'] = $_POST['stepId'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->isApprovalOver($postData);
		echo $result;
	}
	
	/** 判断当前步骤是否为最后一步 **/
	public function isLastStep(){
		$data['wfModelId'] = $_POST['wfModelId'];
		$data['actionId'] = $_POST['actionId'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->isLastStep($postData);
		echo $result;
	}
	
	/** 提交审批意见 **/
	public function commit_opinion(){
		$data['wfModelId'] = $_POST['wfModelId'];
		$data['actionId'] = $_POST['actionId'];
		$data['opinionStr'] = $_POST['opinionStr'];
		$data['fileAppendixNames'] = isset($_POST['fileAppendixNames'])?$_POST['fileAppendixNames']:'';
		$data['fileAppendixPaths'] = isset($_POST['fileAppendixPaths'])?$_POST['fileAppendixPaths']:'';
		$data['wfId'] = $_POST['wfId'];
		$data['stepId'] = $_POST['stepId'];
		$data['formId'] = $_POST['formId'];
		$data['userFormId'] = $_POST['userFormId'];
		$data['userFormActionName'] = $_POST['userFormActionName'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->commit_opinion($postData);
		echo $result;
	}
	
	/** 流程审批 **/
	public function auditingWorkflow(){
		$params = $_POST['postData'];
		parse_str($params,$data);
		$data['wfId'] = $_POST['wfId'];
		$data['stepId'] = $_POST['stepId'];
		$data['actionId'] = $_POST['actionId'];
		$data['formId'] = $_POST['formId'];
		$data['dataHaveRight'] = $_POST['dataHaveRight'];
		$data['selectUsers'] = $_POST['selectUsers'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->auditingWorkflow($postData);
		echo $result;
	}
	
	/** 获取一个审批意见的文件附件展现字符串 **/
	public function showOpinionFilesPage() {
		$data['id'] = $_POST['id'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$files=$Proxy->getOpinionFiles($postData);
		echo $files;
	}
	
	/** 获取文件下载地址 **/
	public function downloadFile() {
		$fileId = $_GET['fileId'];
		$proxy = $this->exec("getProxy", "escloud_fileEquipmentws");
		$res = $proxy->getFileDownLoadUrl($fileId);
		echo $res;
	}

	
	/** guolanrui 20140617 获取所有有权限的利用表单 **/
	public function showUsingWfList() {
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$result=$Proxy->showUsingWfList($postData);
		$size = $result->size;
// 		$wfStep = $result->wfStep;
// 		$wfStepOwer = $result->wfStepOwer;
		if($size == 0){//TODO 需要增加合理的提示，提示该用户没有可用的利用流程
			echo false;
		}elseif ($size == 1){//guolanrui 20140721 增加只有一个利用流程的情况，直接跳转到发起流程界面，省略掉选择流程的步骤
			$resultData = $result->data;
			echo $resultData[0]->formid;
		}else{
			return $this->renderTemplate(array('size'=>$result->size,'data'=>$result->data));
		}
		
	}
	

	
	/** 渲染流程转发界面 **/
	public function formForwardPage() {
		$datas = array("data"=>array($_POST['wfId'], $_POST['userFormId']));
		return $this->renderTemplate($datas);
	}
	
	/** 渲染按机构选择待转发用户界面 **/
	public function userFromOrgPage() {
		return $this->renderTemplate();
	}
	
	/** 渲染按角色选择待转发用户界面 **/
	public function userFromRolePage() {
		return $this->renderTemplate();
	}
	
	/** 获取可转发用户列表，供选择用户转发 **/
	public function getUsersForForward(){
		$searchKeyword = isset($_POST['query']) ? $_POST['query'] : '';
		$roleId = isset($_GET['roleId']) ? $_GET['roleId'] : '';
		$orgIdseq = isset($_GET['orgIdseq']) ? $_GET['orgIdseq'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['roleId'] = $roleId;
		$data['orgIdseq'] = $orgIdseq;
		$data['searchKeyword'] = $searchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getUsersForForward($postData);
		$total = $returnData->size;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox" name="checkbox" value="'.$row->id.'" id="checkbox">',
							"id"=>$row->id,
							"userid"=>$row->userid,
							"username"=>$row->username
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 组装待转发用户信息列表 **/
	public function getForwardToUsers(){
		$roleId = isset($_GET['roleId']) ? $_GET['roleId'] : '';
		$orgIdseq = isset($_GET['orgIdseq']) ? $_GET['orgIdseq'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['roleId'] = $roleId;
		$data['orgIdseq'] = $orgIdseq;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getForwardToUsers($postData);
		$total = $returnData->size;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"formid"=>$row->formid,
							"handle"=>"<span class='editbtn' >&nbsp;</span>",
							"formname"=>$row->formname,
							"workflowname"=>$row->workflowname,
							"wfDescription"=>$row->wfDescription
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 获取机构树 **/
	public function getOrganTreeNodes(){
		$params = "userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$Proxy=$this->exec('getProxy',self::PROXY_NAME);
		$appData = $Proxy->getOrganTreeNodes($postData);
// 		$jsonData1= array();
// 		$jsonData = array('id'=>'','name'=>'机构设置','open'=>true,'children'=>array());
// 		foreach ($appData as $row){
// 			$entry = array("name"=>$row->name,"id"=>$row->id,"pId"=>$row->pId,"isParent"=>$row->isParent);
// 			$jsonData['children'][] = $entry;
// 		}
// 		$jsonData1[0]=$jsonData;
		echo json_encode($appData);
	}
	
	/** 转发处获取角色列表 **/
	public function getRoles(){
		$searchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", "escloud_formaccredit");
		$data['searchKeyword'] = $searchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getRoles($postData);
		$total = $returnData->size;
		$rows = $returnData->list;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"id"=>$row->id,
							"rolename"=>$row->rolename,
							"description"=>$row->remark
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 执行转发操作 **/
	public function excuteWfForward(){
		$data['userIds'] = $_POST['userIds'];
		$data['wfId'] = $_POST['wfId'];
		$data['userFormId'] = $_POST['userFormId'];
		$data['opinionStr'] = $_POST['opinionStr'];
		$data['fileAppendixNames'] = $_POST['fileAppendixNames'];
		$data['fileAppendixPaths'] = $_POST['fileAppendixPaths'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->excuteWfForward($postData);
		echo $return;
	}
	
	/** 审批转发流程 **/
	public function wfForwardAction(){
		$data['wfId'] = $_POST['wfId'];
		$data['formId'] = $_POST['formId'];
		$data['userFormID'] = $_POST['userFormID'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->wfForwardAction($postData);
		echo $return;
	}
	
	/** 审批只会流程 **/
	public function WfNoticeAction(){
		$data['wfId'] = $_POST['wfId'];
		$data['formId'] = $_POST['formId'];
		$data['opinionValue'] = $_POST['opinionValue'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->WfNoticeAction($postData);
		echo $return;
	}
	

	public function batchChangeFileReadOrDownLoadRight(){
		$data['fileReadOrDownLoad'] = $_POST['fileReadOrDownLoad'];
		$data['isApp'] = isset($_POST['isApp']) ? $_POST['isApp'] : null;
		$data['selectPath'] = isset($_POST['selectPath']) ? $_POST['selectPath'] : '';
		$data['dateRight'] = $_POST['dateRight'];
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->batchChangeFileReadOrDownLoadRight($postData);
		echo true;
	}
	
	public function getAttachDataList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['dataListStr'] = isset($_GET['dataListStr']) ? $_GET['dataListStr'] : '';
		$data['typeWf'] = isset($_GET['typeWf']) ? $_GET['typeWf'] : 'empty';
		$data['dataHaveRight'] = isset($_GET['dataHaveRight']) ? $_GET['dataHaveRight'] : '';
		$data['thisName'] = isset($_GET['thisName']) ? $_GET['thisName'] : 'myFormModel';

		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->getAttachDataList($postData);
		$total = $return->pageInfo;
		$rows = $return->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$isRead='<input type="checkbox" name="isReadChk" id="" value="'.$row->pkgPath.'||"/>';
			$isDownload='<input type="checkbox" name="isDownloadChk" id="" value="'.$row->pkgPath.'||"/>';
			$isPrint='<input type="checkbox" name="isPrintChk" id="" value="'.$row->pkgPath.'||"/>';
			$useEntity='<input type="checkbox" name="useEntityChk" id="" value="'.$row->pkgPath.'||"/>';
			if(isset($row->FileRead)?$row->FileRead:false){
				$isRead='<input type="checkbox" name="isReadChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			if(isset($row->FileDownLoad)?$row->FileDownLoad:false){
				$isDownload='<input type="checkbox" name="isDownloadChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			if(isset($row->FilePrint)?$row->FilePrint:false){
				$isPrint='<input type="checkbox" name="isPrintChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			if(isset($row->FileLend)?$row->FileLend:false){
				$useEntity='<input type="checkbox" name="useEntityChk" id="" value="'.$row->pkgPath.'||" checked/>';
			}
			
			$entry = array(
					"cell"=>array(
							'num'=>$start,
							'id3'=>'<input type="checkbox" name="id3" id="" value="'.$row->pkgPath.'||"/>',
							'handle'=>$row->showpkg,//TODO 换成图标，绑定一个path,点击这个图标可以浏览当前这条数据的详细信息
							'title'=>$row->dataName,//数据的TITLE
							'documentFlag'=>isset($row->documentFlag)?$row->documentFlag :'0',
							'isRead'=>$isRead,
							'readDate'=>isset($row->FileReadTimeControl)?$row->FileReadTimeControl:'0',
							'isDownload'=>$isDownload,
							'downloadDate'=>isset($row->FileDownLoadTimeControl)?$row->FileDownLoadTimeControl:'0',
							'isPrint'=>$isPrint,
							'printDate'=>isset($row->FilePrintTimeControl)?$row->FilePrintTimeControl:'0',
							'useEntity'=>$useEntity,
							'pkgPath'=>$row->pkgPath//数据的PATH
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/** 审批过程中删除上传的文件附件 **/
	public function deleteWfFile(){
		$data['dataId'] = $_POST['dataId'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->deleteWfFile($postData);
		echo $return;
	}
	
	/** 审批过程上传新文件 **/
	public function addWfFile(){
		$data['wfID'] = $_POST['wfID'];
		$data['firstStepId'] = $_POST['firstStepId'];
		$data['fileid'] = $_POST['fileid'];
		$data['filename'] = $_POST['filename'];
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->addWfFile($postData);
		echo $return;
	}
	
	public function myFormModelShowPkg(){
		$selectPath = isset($_POST['selectPath'])?$_POST['selectPath']:'';
		$data['selectPath'] = $selectPath;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->myFormModelShowPkg($postData);
		$structureType = $return->structureType;
		$documentFlag = $return->documentFlag;
		$haveChildFlag = $return->haveChildFlag;
		if("innerFile"==$structureType && "1"==$documentFlag){//表示卷内级数据有电子文件的，直接调用检索那边的查看数据的方法
			echo "1";
		}else{
			$datas = array("data"=>array($return->formHtml,$structureType,$documentFlag,$return->childColModel,$haveChildFlag,$selectPath));
			return $this->renderTemplate($datas);
		}
	}
	
	public function myFormModelShowChildPkg(){
		$selectPath = isset($_POST['selectPath'])?$_POST['selectPath']:'';
		$data['selectPath'] = $selectPath;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->myFormModelShowPkg($postData);
		$structureType = $return->structureType;
		$documentFlag = $return->documentFlag;
		$haveChildFlag = $return->haveChildFlag;
		if("innerFile"==$structureType && "1"==$documentFlag){//表示卷内级数据有电子文件的，直接调用检索那边的查看数据的方法
			echo "1";
		}else{
			$datas = array("data"=>array($return->formHtml,$structureType,$documentFlag,$return->childColModel,$haveChildFlag,$selectPath));
			return $this->renderTemplate($datas);
		}
	}
	
	public function getAttachDataChildDataList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$rp;
		
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['parentPath'] = isset($_GET['parentPath'])?$_GET['parentPath']:'';
		$data['userId'] = $this->getUser()->getId();
		$data['ip'] =$this->getClientIp();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$return = $proxy->getAttachDataChildDataList($postData);
		
		$total = isset($return->total)?$return->total:0;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$rows = $return->dataList;
		$columns = $return->columns;
		foreach($rows AS $row){
				
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'handle'=>'<a href="#" onclick="addAttachData.myFormModelShowChildPkg_event($(this));" title="查看数据"><span class=\'opens\'></span></a>',
// 							'ids'=> '<input boxid="'. $row['boxid'] .'" type="'.$type.'" name="path" class="selectone" del="'. $row['isDelete'] .'" ln="'. ($start+1) .'" value="'.$row["path"].'">',
// 							'operate'=> $row['isitemEdit'] === 'true' ? '<span class="editbtn" title="编辑" onclick='.$operate.'("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span>' : '',
							'relation'=>$row->relation=='true'?1:'',
							'pkgPath'=>$row->path,
					),
			);
			foreach($columns AS $column){
				if(array_key_exists($column,$row)){
					$entry['cell'][$column]=$row->$column;
				}
			}
			
// 			if($row['filecount']){
// 				$entry['cell']['operate'].='&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
// 			}
			$jsonData['rows'][] = $entry;
					$start++;
		}
		echo json_encode($jsonData);
	}
	public function getTempRightByPath(){
		$path = isset($_POST['path']) ? $_POST['path'] : '';
		$wfId = isset($_POST['wfId']) ? $_POST['wfId'] : '';
		$data['path'] = $path;
		$data['wfId'] = $wfId;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$jsonData = $proxy->getTempRightByPath($postData);
		echo json_encode($jsonData);
	}
	

};