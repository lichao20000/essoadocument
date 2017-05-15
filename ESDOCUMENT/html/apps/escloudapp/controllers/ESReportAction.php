<?php
/**
 * 报表维护
 * @author zhangjirimutu
 * @DATA 20120822
 */
class ESReportAction extends ESActionBase
{
	public function index()
	{
		return $this->renderTemplate();
	}
	public function reportList()
	{
		/** jiangyuntao 20140820 增加传参结构ID和modelID，用于过滤已经设置过的报表记录 **/
		$structureId = isset($_GET['structureId']) ? $_GET['structureId'] : -1;
		$molid = isset($_GET['molid']) ? $_GET['molid'] : -2;
		
		/** guolanrui 20140924 增加传参 reportType,修复模板定义中刷出所有类型的报表 **/
		$postReportType = isset($_GET['reportType']) ? $_GET['reportType'] : '';
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$report = $this->exec("getProxy", "escloud_reportservice");
		$total = $report->countAllForSearch(json_encode(array('keyWord'=>$keyWord,'structureId'=>$structureId,'molid'=>$molid,'reportType'=>$postReportType)));
		$start = ($page - 1) * $rp + 1;
		$data=json_encode(array('start'=>($page-1)*$rp,'limit'=>$rp,'keyWord'=>$keyWord,'structureId'=>$structureId,'molid'=>$molid,'reportType'=>$postReportType));
		$rows = $report->listAllReportForSearch($data);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$reportType = $row->reportType;
			switch ($reportType){
				case "archive": $type = "档案报表";break;
// 				case "voucher": $type = "会计对照表";break;
// 				case "documentForm": $type = "文书移交清单";break;
// 				case "accountingForm": $type = "会计档案移交清单";break;
// 				case "documentDetail": $type = "文书移交明细";break;
// 				case "accountingDetail": $type = "会计档案移交明细";break;
				case "inout": $type = "出入库报表";break;
				case "using": $type = "借阅利用";break;
				case "storm": $type = "库房结构";break;
				//guolanrui 20140909 增加工作流类型
				case "workflow": $type = "工作流";break;
// 				case "compareTable": $type = "文件校验";break;
				default:$type="";break;
			}
			$reportstyle = $row->reportstyle;
			switch ($reportstyle){
				case "rtf": $style = "WORD";break;
				case "pdf": $style = "PDF";break;
				/** guolanrui 20140811 excel输出格式报表列表中输出格式显示为空 BUG:712 **/
// 				case "xml": $style = "EXCEL";break;
				case "xls": $style = "EXCEL";break;
				default:$style="";break;
			}
			$entry = array("id"=>$row->idReport,
					"cell"=>array(
							"rownum"=>$start,
							"id"=>"<input type='checkbox' name='id'>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"title"=>$row->title,
							"reportstyle"=>$style,
							"ishave"=>$row->ishave,
							"reportType"=>$type,
							"uplodaer"=>$row->uplodaer
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}

		echo json_encode($jsonData);
	}
	/**
	 * @author zhangyanxin
	 * 报表添加
	 */
	public function insert(){
		$userID=$this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_reportservice");
		$ip = $proxy->getServiceIP();
		$userIp = $this->getClientIp();
		return $this->renderTemplate(array('userid'=>$userID,'ip'=>$ip,'userIp'=>$userIp));
	}
	/**
	 * 相应插入报表操作
	 */
	public function insertReport(){
		$report = $this->exec("getProxy", "escloud_reportservice");
		$userId = $this->getUser();
		parse_str($_POST['data'], $reportData);
		$newReport = $report->addReport(json_encode($reportData));
		if($newReport) {
			echo true;
		} else {
			echo false;
		}
	}
	/**
	 * @author zhangyanxin
	 * 编辑报表模版
	 */
	public function edit(){
		$reportId = $_GET['reportId'];
		$reportService = $this->exec("getProxy", "escloud_reportservice");
		$report = $reportService->getReport($reportId);
		$ip = $reportService->getServiceIP();
		return $this->renderTemplate(array("report"=>$report,'ip'=>$ip));
	}
	/**
	 * 删除报表
	 * @author ldm
	 */
	public function delete(){
		$ids = isset($_GET['ids'])?$_GET['ids']:"";
		if ($ids=="")return;
		$out['ids'] = $ids;
		$out['userIp'] = $this->getClientIp();
		$out['userId'] = $this->getUser()->getId();
		
		$datas = json_encode($out);
		$report = $this->exec("getProxy", "escloud_reportservice");
		$result = $report->deleteReport($datas);
		if ($result){
			echo "true";
		} else {
			echo "false";
		}

	}
	/**
	 * 导出报表
	 * @author ldm
	 */
	public function export(){
		$ids = isset($_GET['ids'])?$_GET['ids']:"";
		if($ids == ""){
			$data['isAll'] = 'true';
		}else{
// 			$ids = explode(",", $ids);
// 			$ids = json_encode($ids);
			$data['checked'] = $ids;
		}
		$data['userId'] = $this->getUser()->getId();
		$data['userIp'] = $this->getClientIp();
		$postData = json_encode($data);
		$report = $this->exec("getProxy", "escloud_reportservice");
		$result = $report->exportReport($postData);
		echo json_encode($result);
	}
	
	
	/**
	 * 获取报表下载列表
	 * wangtao 2013/10/16
	 * 
	 */
	public  function getReportList()
	{
		
		$page=$_GET['page']?$_GET['page']:1;
		$size=$_GET['size']?$_GET['size']:5;
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_reportservice");
		$result = $proxy->getInfomation($userId,$page,$size);
		echo json_encode($result);
	
	}
	/**
	 * 清空下载文件
	 * wangtao
	 * 20131025
	 * Enter description here ...
	 */
	public  function delReportFile()
	{
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_reportservice");
		$result = $proxy->delReportFile($userId);
		echo $result;
	
	}
	/**
	 * guolanrui 20140716 为模糊检索新增的方法
	 */
	public function reportListForSearch(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		
		$data['keyWord'] = $keyWord;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		
		$countData['keyWord'] = $keyWord;
		$postCountData = json_encode($countData);
		
		$report = $this->exec("getProxy", "escloud_reportservice");
		$total = $report->countAllForSearch($postCountData);
		$start = ($page - 1) * $rp + 1;
		$rows = $report->listAllReportForSearch($postData);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$reportType = $row->reportType;
			switch ($reportType){
				case "archive": $type = "档案报表";break;
// 				case "voucher": $type = "会计对照表";break;
// 				case "documentForm": $type = "文书移交清单";break;
// 				case "accountingForm": $type = "会计档案移交清单";break;
// 				case "documentDetail": $type = "文书移交明细";break;
// 				case "accountingDetail": $type = "会计档案移交明细";break;
				case "inout": $type = "出入库报表";break;
				case "using": $type = "借阅利用";break;
				case "storm": $type = "库房结构";break;
				//guolanrui 20140909 增加工作流类型
				case "workflow": $type = "工作流";break;
// 				case "compareTable": $type = "文件校验";break;
				default:$type="";break;
			}
			$reportstyle = $row->reportstyle;
			switch ($reportstyle){
				case "rtf": $style = "WORD";break;
				case "pdf": $style = "PDF";break;
				/** guolanrui 20140811 excel输出格式报表列表中输出格式显示为空 BUG:712 **/
// 				case "xml": $style = "EXCEL";break;
				case "xls": $style = "EXCEL";break;
				default:$style="";break;
			}
			$entry = array("id"=>$row->idReport,
					"cell"=>array(
							"rownum"=>$start,
							"id"=>"<input type='checkbox' name='id'>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"title"=>$row->title,
							"reportstyle"=>$style,
							"ishave"=>$row->ishave,
							"reportType"=>$type,
							"uplodaer"=>$row->uplodaer
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
	
		echo json_encode($jsonData);
	}
	/**
	 * shimiao 20140714  
	 */
	public function downLoadFile(){
		$id= $_GET['id'];
		$proxy = $this->exec("getProxy", "escloud_reportservice");
		$result = $proxy->downLoadFile($id);
		echo $result;
	}
	/**
	 * guolanrui 20140813 检查title是否重复
	 */
	public function checkTitleUnique(){
// 		$title= $_POST['title'];
		$proxy = $this->exec("getProxy", "escloud_reportservice");
		$data['title'] = $_POST['title'];
		$postData = json_encode($data);
		$result = $proxy->checkTitleUnique($postData);
		echo $result;
	}

	public function saveReportTemForEdit(){
		$data['title'] = $_POST['title'];
		$data['reportid'] = $_POST['reportid'];
		$data['reportstyle'] = $_POST['reportstyle'];
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_reportservice");
		$result = $proxy->saveReportTemForEdit($postData);
		echo $result;
		
	}
	
}