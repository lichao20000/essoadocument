<?php
/**
 * 报表维护
 * @author zhangjirimutu
 * @DATA 20120822
 */
class ESReportAction extends ESActionBase {
	public function index() {
		return $this->renderTemplate ();
	}
	public function reportList() {
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 10;
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$reportType = isset ( $_GET ['reportType'] ) ? $_GET ['reportType'] : '';
		$dataType = isset ( $_GET ['dataType'] ) ? $_GET ['dataType'] : 'checkbox';
		$report = $this->exec ( "getProxy", "reportService" );
		$total = $report->getReportCount ( json_encode ( array (
				'keyWord' => $keyWord,
				'reportType'=>$reportType
		) ) );
		$rows = $report->getReportList ( $page, $rp, json_encode ( array (
				'keyWord' => $keyWord,
				'reportType'=>$reportType 
		) ) );
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$start = ($page - 1) * $rp + 1;
		foreach ( $rows as $row ) {
			$reportType = $row->reportType;
			switch ($reportType) {
				case "collection" :
					$type = "文件收集";
					break;
				case "using" :
					$type = "文件借阅";
					break;
				case "workflow" :
					$type = "工作流";
					break;
				default :
					$type = "";
					break;
			}
			$reportstyle = $row->reportstyle;
			switch ($reportstyle) {
				case "rtf" :
					$style = "WORD";
					break;
				case "pdf" :
					$style = "PDF";
					break;
				case "xls" :
					$style = "EXCEL";
					break;
				default :
					$style = "";
					break;
			}
			
			$entry = array (
					"id" => $row->idReport,
					"cell" => array (
							'did'=>$row->idReport,
							"rownum" => $start,
							"id" => "<input type='".$dataType."' name='id' value='".$row->idReport."'>",
							"editbtn" => "<span class='editbtn' id='".$row->idReport."'>&nbsp;</span>",
							"title" => $row->title,
							"reportstyle" => $style,
							"ishave" => $row->ishave,
							"reportType" => $type,
							"uplodaer" => $row->uplodaer 
					) 
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		
		echo json_encode ( $jsonData );
	}
	/**
	 *
	 * @author zhangyanxin
	 *         报表添加
	 */
	public function insert() {
		$userID = $this->getUser ()->getId ();
		$proxy = $this->exec ( "getProxy", "reportService" );
		$ip = $proxy->getServiceIP ();
		$userIp = $this->getClientIp ();
		return $this->renderTemplate ( array (
				'userid' => $userID,
				'ip' => $ip,
				'userIp' => $userIp 
		) );
	}
	/**
	 * 相应插入报表操作
	 */
	public function insertReport() {
		$report = $this->exec ( "getProxy", "reportService" );
		$userId = $this->getUser ();
		parse_str ( $_POST ['data'], $reportData );
		$newReport = $report->addReport ( json_encode ( $reportData ) );
		if ($newReport) {
			echo true;
		} else {
			echo false;
		}
	}
	/**
	 *
	 * @author zhangyanxin
	 *         编辑报表模版
	 */
	public function edit() {
		$reportId = $_GET ['reportId'];
		$reportService = $this->exec ( "getProxy", "reportService" );
		$report = $reportService->getReport ( $reportId );
		$ip = $reportService->getServiceIP ();
		return $this->renderTemplate ( array (
				"report" => $report,
				'ip' => $ip 
		) );
	}
	/**
	 * 删除报表
	 *
	 * @author ldm
	 */
	public function delete() {
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : "";
		$title= isset ( $_GET ['title'] ) ? $_GET ['title'] : "";
		if ($ids == "")return;
		$param = array();
		$param['ids'] = $ids;
		$param['title'] = $title;
		$report = $this->exec ( "getProxy", "reportService" );
		$result = $report->deleteReport (json_encode($param));
		if ($result) {
			echo "true";
		} else {
			echo "false";
		}
	}
	/**
	 * 导出报表
	 *
	 * @author ldm
	 */
	public function export() {
		$ids = isset ( $_GET ['ids'] ) ? $_GET ['ids'] : "";
		if ($ids == "") {
			$data ['isAll'] = 'true';
		} else {
			$data ['checked'] = $ids;
		}
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['userIp'] = $this->getClientIp ();
	    $data ['title'] = isset ( $_GET ['title'] ) ? $_GET ['title'] : "";
		$postData = json_encode ( $data );
		$report = $this->exec ( "getProxy", "reportService" );
		$result = $report->exportReport ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 获取报表下载列表
	 * wangtao 2013/10/16
	 */
	public function getReportList() {
		$page = $_GET ['page'] ? $_GET ['page'] : 1;
		$size = $_GET ['size'] ? $_GET ['size'] : 5;
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( "getProxy", "escloud_reportservice" );
		$result = $proxy->getInfomation ( $userId, $page, $size );
		echo json_encode ( $result );
	}
	/**
	 * 清空下载文件
	 * wangtao
	 * 20131025
	 * Enter description here .
	 */
	public function delReportFile() {
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( "getProxy", "escloud_reportservice" );
		$result = $proxy->delReportFile ( $userId );
		echo $result;
	}
	
	/**
	 * shimiao 20140714
	 */
	public function downLoadFile() {
		$id = $_GET ['id'];
		$proxy = $this->exec ( "getProxy", "escloud_reportservice" );
		$result = $proxy->downLoadFile ( $id );
		echo $result;
	}
	/**
	 * 检查title是否重复
	 * xuekun 2014年12月23日 add
	 */
	public function checkTitleUnique() {
		$proxy = $this->exec ( "getProxy", "reportService" );
		$title = $_POST ['title'];
		$result = $proxy->checkTitleUnique ($title);
		echo $result;
	}
	public function saveReportTemForEdit() {
		$data ['title'] = $_POST ['title'];
		$data ['reportid'] = $_POST ['reportid'];
		$data ['reportstyle'] = $_POST ['reportstyle'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['ip'] = $this->getClientIp();
		$postData = json_encode ( $data );
		$proxy = $this->exec ( "getProxy", "reportService" );
		$result = $proxy->saveReportTemForEdit ( $postData );
		echo $result;
	}
}