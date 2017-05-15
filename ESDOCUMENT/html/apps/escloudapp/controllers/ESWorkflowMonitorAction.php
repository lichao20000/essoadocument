<?php
/**
 * @author xiaoxiong 20140529
 * 流程监控处理Action
 */
class ESWorkflowMonitorAction extends ESActionBase {
	
	const PROXY_NAME = "escloud_workflowmonitor";
	
	// 默认访问的方法，渲染主页面
	public function index() {
		return $this->renderTemplate ();
	}
	
	/** 获取流程监控数据列表 **/
	public function getWfMonitorDataList(){
		$searchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$formType = isset($_GET['formType']) ? $_GET['formType'] : '';
		$status = isset($_GET['status']) ? $_GET['status'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$data['searchKeyword'] = $searchKeyword;
		$data['formType'] = $formType;
		$data['status'] = $status;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$returnData = $proxy->getWfMonitorDataList($postData);
		$total = $returnData->size;
		$rows = $returnData->list;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"id"=>$row->id,
							"userId"=>$row->userId,
							"formId"=>$row->formId,
							"wfId"=>$row->wfId,
							"set"=>"<span class='editbtn' >&nbsp;</span>",
							"wfNo"=>$row->wfNo,
							"wfModelName"=>$row->wfModelName,
							"formModelName"=>$row->formModelName,
							"startPersonName"=>$row->startPersonName,
							"start_time"=>$row->start_time,
							"lookWfPicture"=>$row->lookWfPicture,
							"operate"=>$row->operate
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 终止或结束工作流程
	 * @author 20140612
	 */
	public function stopWorkflow() {
		$data['wfId'] = 	isset($_POST['wfId']) ? $_POST['wfId'] : '';
		$data['type'] = 	isset($_POST['type']) ? $_POST['type'] : '';
		$data['relationBusiness'] = 	isset($_POST['relationBusiness']) ? $_POST['relationBusiness'] : '';
		$data['title'] = 	isset($_POST['title']) ? $_POST['title'] : '';
		$data['relationTitle'] = 	isset($_POST['relationTitle']) ? $_POST['relationTitle'] : '';
		$data['fromUser'] = 	isset($_POST['fromUser']) ? $_POST['fromUser'] : '';
		$data['fromDate'] = 	isset($_POST['fromDate']) ? $_POST['fromDate'] : '';
		$data['userId'] = $this->getUser()->getId();
		$data['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", self::PROXY_NAME);
		$result = $proxy->stopWorkflow($postData);
		echo $result;
	}
	
	/**
	 *  查看流程图的方法
	 *  @author longjunhao 20140617
	 */
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
		$str = '<?xml version="1.0" encoding="UTF-8"?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'.$str ;
		$str = str_replace('<text ','<text font-family="Simsun" ',$str);
		fwrite($file_pointer,$str);
		fclose($file_pointer);
		
		$jsonData = array('mxGraphHtml'=>$mxGraphHtml);
		
		return $this->renderTemplate($jsonData);
	}
}