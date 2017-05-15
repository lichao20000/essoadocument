<?php
/**
 * 我的待办模块
 * @author gengqianfeng
 *
 */
class ESCollaborativeAction extends ESActionBase {
	/**
	 * 流程图片显示
	 *
	 * @author ldm
	 */
	public function imgview() {
		$workid = $_GET ['workid'];
		$proxy = $this->exec ( 'getProxy', 'workflow' );
		$lists = $proxy->getProcessInstanceDiagram ( $workid );
		header ( 'Content-type: image/png' );
		echo $lists;
	}
	
	/**
	 * 获取待办列表
	 */
	public function getCollaborativeDataList() {
		$userId = $this->getUser ()->getId ();
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$limit = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$offset = ($page - 1) * $limit;
		$parent = isset ( $_GET ['parent'] ) ? $_GET ['parent'] : 'todo'; // 父类型
		$child = isset ( $_GET ['child'] ) ? $_GET ['child'] : 'all'; // 子类型
		$stageIds = isset ( $_GET ['stageIds'] ) ? $_GET ['stageIds'] : '';
		$params = "start=" . $offset . "&limit=" . $limit . "&userId=" . ($this->getUser ()->getId ()) . "&parent=" . $parent . "&child=" . $child . "&stageIds=" . $stageIds;
		$params = $params . '&remoteAddr=' . $this->getClientIp ();
		parse_str ( $params, $out );
		$proxy = $this->exec ( 'getProxy', 'collaborative' );
		$resultData = $proxy->getCollaborativeDataList ( $out );
		$total = $resultData->size;
		$result = $resultData->formList;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array () 
		);
		$line = ($page - 1) * $limit + 1;
		foreach ( $result as $base ) {
			$userEntity = $proxy->getUserInfoById ( $base->userId );
			$userFormNo = $base->userFormNo;
			$id = $base->id;
			$userId = $base->userId;
			$flowId = $base->flowId;
			$formId = $base->formId;
			$wfId = $base->wfId;
			$stepId = isset ( $base->stepId ) ? $base->stepId : '';
			$title = $base->title;
			$isDealed = isset ( $base->isDealed ) ? $base->isDealed : '';
			$start_time = $base->start_time;
			$dataId = $base->dataId;
			$stageId = $base->stageId;
			$dataNo = $base->dataNo;
			$firstStepId = isset ( $base->firstStepId ) ? $base->firstStepId : '';
			$workFlowType = isset ( $base->workFlowType ) ? $base->workFlowType : '';
			$wfState = $base->wfState;
			$wf_status = $base->wf_status;
			$isSelf = $base->isSelf;
			$isLast = $base->isLast;
			$entry = array (
					'id' => '',
					'cell' => array (
							'num' => $line,
							"ids" => '<input type="checkbox" name="userFormId" value="' . $id . '">',
							'open' => '<span class="opens" userFormNo="' . $userFormNo . '" id="' . $id . '" userId="' . $userId . '" flowId="' . $flowId . '" formId="' . $formId . '" wfId="' . $wfId . '" stepId="' . $stepId . '" isDealed="' . $isDealed . '" dataId="' . $dataId . '" workFlowType="' . $workFlowType . '" isLast="' . $isLast . '" wfState="' . $wfState . '" wf_status="' . $wf_status . '" title="' . $title . '"></span>',
							'viewfile' => '<span class="viewfile" dataId="' . $dataId . '" stageId="' . $stageId . '" title="' . $dataNo . '份"></span>',
							'userFormNo' => $userFormNo,
							'id' => $id,
							'userId' => $userId,
							'formId' => $formId,
							'wfId' => $wfId,
							'stepId' => $stepId,
							'title' => $title,
							'name' => $userEntity->userid,
							'isDealed' => $isDealed,
							'start_time' => $start_time,
							'dataId' => $dataId,
							'firstStepId' => $firstStepId,
							'workFlowType' => $workFlowType,
							'isSelf' => $isSelf,
							'isLast' => $isLast,
							'wfState' => $wfState 
					) 
			);
			$jsonData ['rows'] [] = $entry;
			$line = $line + 1;
		}
		echo json_encode ( $jsonData );
	}
	
	/**
	 * 流程发起方法
	 */
	public function startSavedWorkflow() {
		$params = $_POST ['postData'];
		$params = $params . '&formId=' . $_POST ['formId'] . '&id=' . $_POST ['id'] . '&wfId=' . $_POST ['wfId'] . '&wfModelId=' . $_POST ['wfModelId'] . '&actionId=' . $_POST ['actionId'] . '&formUserId=' . $_POST ['formUserId'] . '&filePaths=' . $_POST ['filePaths'] . '&fileNames=' . $_POST ['fileNames'] . '&selectUsers=' . $_POST ['selectUsers'] . '&condition=' . $_POST ['condition'] . '&applyDateCount=' . $_POST ['applyDateCount'] . '&readRight=' . $_POST ['readRight'] . '&downLoadRight=' . $_POST ['downLoadRight'] . '&printRight=' . $_POST ['printRight'] . '&lendRight=' . $_POST ['lendRight'] . '&userId=' . $this->getUser ()->getId () . '&bigOrgId=' . $this->getUser ()->getBigOrgId () . '&remoteAddr=' . $this->getClientIp ();
		parse_str ( $params, $out );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo json_encode ( $Proxy->startSavedWorkflow ( $out ) );
	}
	
	/**
	 * 保存待发方法
	 */
	public function saveOldWorkflow() {
		$params = $_POST ['postData'];
		$params = $params . '&formId=' . $_POST ['formId'] . '&flowId=' . $_POST ['flowId'] . '&id=' . $_POST ['id'] . '&userId=' . $this->getUser ()->getId () . '&bigOrgId=' . $this->getUser ()->getBigOrgId () . '&remoteAddr=' . $this->getClientIp ();
		parse_str ( $params, $out );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->saveOldWorkflow ( $out );
		echo json_encode ( $result );
	}
	
	/**
	 * 工作流打印表单
	 */
	public function workFlowPrint() {
		$data ['wfId'] = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$data ['formId'] = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$data ['stepId'] = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$data ['userFormNo'] = isset ( $_POST ['userFormNo'] ) ? $_POST ['userFormNo'] : '';
		$data ['printForm'] = isset ( $_POST ['printForm'] ) ? $_POST ['printForm'] : '';
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['bigOrgId'] = $this->getUser ()->getBigOrgId ();
		$data ['remoteAddr'] = $this->getClientIp ();
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo json_encode ( $Proxy->workFlowPrint ( $data ) );
	}
	
	/**
	 * 删除待发、已发数据，已发只能删除自己发起的且已完成的流程数据
	 */
	public function deleteUserformData() {
		$data = isset ( $_POST ['data'] ) ? $_POST ['data'] : '';
		$userFormNo = isset ( $_POST ['userFormNo'] ) ? $_POST ['userFormNo'] : '';
		$title = isset ( $_POST ['title'] ) ? $_POST ['title'] : '';
		$start_time = isset ( $_POST ['start_time'] ) ? $_POST ['start_time'] : '';
		$wfState = isset ( $_POST ['wfState'] ) ? $_POST ['wfState'] : '';
		$params = "data=" . $data . "&userFormNo=" . $userFormNo . "&title=" . $title . "&start_time=" . $start_time . "&wfState=" . $wfState . "&userId=" . ($this->getUser ()->getId ()) . "&remoteAddr=" . $_SERVER ["REMOTE_ADDR"];
		parse_str ( $params, $out );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo json_encode ( $Proxy->deleteUserformData ( $out ) );
	}
	
	/**
	 * 渲染表单
	 *
	 * @return string
	 */
	public function formIndex() {
		$data ['formId'] = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$data ['stepId'] = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$data ['dataId'] = isset ( $_POST ['dataId'] ) ? $_POST ['dataId'] : '';
		$wfId = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '0';
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		return $this->renderTemplate ( array (
				'formList' => $Proxy->getCollaborativeForm ( $data ),
				'opinionList' => $Proxy->getOpinionList ( $wfId ) 
		) );
	}
	
	/**
	 * 渲染待办处理页面
	 *
	 * @return string
	 */
	public function formStartPage() {
		$data ['formId'] = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$data ['wfId'] = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$data ['stepId'] = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$data ['dataId'] = isset ( $_POST ['dataId'] ) ? $_POST ['dataId'] : '';
		$data ['status'] = isset ( $_POST ['status'] ) ? $_POST ['status'] : '';
		$data ['userFormNo'] = isset ( $_POST ['userFormNo'] ) ? $_POST ['userFormNo'] : '';
		$data ['formUserId'] = isset ( $_POST ['formUserId'] ) ? $_POST ['formUserId'] : '';
		$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		return $this->renderTemplate ( array (
				'data' => $data 
		) );
	}
	
	/**
	 * 获取表单附件
	 */
	public function getAppendixList() {
		$wfId = isset ( $_GET ['wfId'] ) ? $_GET ['wfId'] : '-1';
		$stepId = isset ( $_GET ['stepId'] ) ? $_GET ['stepId'] : '';
		$type = isset ( $_GET ['type'] ) ? $_GET ['type'] : '';
		if ($wfId != '-1' && $stepId != '' && $type != '') {
			$Proxy = $this->exec ( 'getProxy', 'collaborative' );
			echo json_encode ( $this->setAppendixResult ( $Proxy->getAppendixList ( $wfId, $stepId, $type ), $type ) );
		}
	}
	private function setAppendixResult($cells, $type) {
		$rows = array ();
		$result = array (
				'page' => 1,
				'total' => count ( $cells ) 
		);
		if (count ( $cells ) > 0) {
			$line = 1;
			foreach ( $cells as $cell ) {
				$row ['id'] = $cell->id;
				$row ['cell'] = array (
						'num' => $line,
						'ids' => '<input type="checkbox"  class="checkbox" />',
						'ID' => $cell->id,
						'fileName' => ($type == 'file') ? ('<span title="点击下载"  onclick="collaborativeHandle.downloadFile(\'' . $cell->dataId . '\')" style="color:0000ff;text-decoration:underline; cursor: pointer;" >' . $cell->fileName . '</span>') : $cell->fileName,
						'fileSize' => $cell->fileSize,
						'dataId' => $cell->dataId,
						'userName' => $cell->userName 
				);
				array_push ( $rows, $row );
				$line = $line + 1;
			}
		}
		$result ['rows'] = $rows;
		return $result;
	}
	
	/**
	 * 添加附件数据
	 */
	public function addAttachFileData() {
		$datas = isset ( $_POST ['datas'] ) ? $_POST ['datas'] : '';
		$wfId = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$stepId = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		$userFormNo = isset ( $_POST ['userFormNo'] ) ? $_POST ['userFormNo'] : '';
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo $Proxy->addAttachFileData ( array (
				"datas" => $datas,
				"wfId" => $wfId,
				"stepId" => $stepId,
				"type" => $type,
				"userFormNo" => $userFormNo,
				"ip" => $this->getClientIp (),
				"userId" => $this->getUser ()->getId () 
		) );
	}
	
	/**
	 * 删除附件数据
	 */
	public function deleteAttachFileData() {
		$type = isset ( $_POST ['type'] ) ? $_POST ['type'] : '';
		$userFormNo = isset ( $_POST ['userFormNo'] ) ? $_POST ['userFormNo'] : '';
		$ids = isset ( $_POST ['ids'] ) ? $_POST ['ids'] : '';
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo $Proxy->deleteAttachFileData ( array (
				"type" => $type,
				"userFormNo" => $userFormNo,
				"ids" => $ids,
				"ip" => $this->getClientIp (),
				"userId" => $this->getUser ()->getId () 
		) );
	}
	
	/**
	 * 获取上传文件的url
	 */
	public function getUploadUrl() {
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo $Proxy->getUploadUrl ();
	}
	
	/**
	 * 获取文件下载路径
	 */
	public function getFileDownLoadUrl() {
		$fileId = isset ( $_GET ['fileId'] ) ? $_GET ['fileId'] : '';
		if ($fileId != '') {
			$Proxy = $this->exec ( 'getProxy', 'collaborative' );
			echo $Proxy->getFileDownLoadUrl ( $fileId );
		}
	}
	
	/**
	 * 查看流程图
	 *
	 * @return string
	 */
	public function showWfGraph() {
		$flowId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$wfId = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$stepId = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$formId = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$status = isset ( $_POST ['status'] ) ? $_POST ['status'] : '';
		
		$data ['flowId'] = $flowId;
		$data ['wfId'] = $wfId;
		$data ['stepId'] = $stepId;
		$data ['formId'] = $formId;
		$data ['status'] = $status;
		$data ['userId'] = $this->getUser ()->getId ();
		
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->showWfGraph ( $data );
		
		$mxGraphHtml = $result->mxGraphHtml;
		$wfStep = $result->wfStep;
		$wfStepOwer = $result->wfStepOwer;
		$wfHisStep = $result->wfHisStep;
		$hasNowOver = false;
		$x = 0;
		$y = 0;
		
		$str = substr ( $mxGraphHtml, strpos ( $mxGraphHtml, "<svg" ) );
		$str = substr ( $str, 0, strpos ( $str, "</svg>" ) + 6 );
		
		$mxGraphHtml = substr ( $mxGraphHtml, 0, strpos ( $mxGraphHtml, "<svg" ) );
		if ($wfHisStep != null) {
			foreach ( $wfHisStep as $hisStep ) {
				$str = $this->setHisStep ( $hisStep->wfHisStep, $hisStep->wfHisStepOwer, $str, '#0000FF' ); // 已处理步骤
			}
		}
		$flag = strpos ( $wfStepOwer, 'sponsor:' );
		if ($flag) {
			$str = $this->setHisStep ( $wfStep, str_replace ( 'sponsor:', '', $wfStepOwer ), $str, '#FF0000' ); // 发起步骤
		} else if ($wfStep == '3') {
			$str = $this->setHisStep ( $wfStep, $wfStepOwer, $str, '#FF0000' ); // 结束步骤
		} else {
			$hasNowOver = true;
			$str = $this->currentStep ( $wfStep, $wfStepOwer, $str ); // 当前待处理步骤
		}
		// w表示以写入的方式打开文件，如果文件不存在，系统会自动建立
		$file_pointer = fopen ( AOPROOT . "/html/apps/esdocument/templates/ESCollaborative/WfGraph.svg", "w" );
		$str = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">' . $str;
		$str = str_replace ( '<text ', '<text font-family="Simsun" ', $str );
		fwrite ( $file_pointer, $str );
		fclose ( $file_pointer );
		$jsonData = array (
				'mxGraphHtml' => $mxGraphHtml 
		);
		return $this->renderTemplate ( $jsonData );
	}
	
	/**
	 * 设置当前步骤样式
	 *
	 * @param unknown $wfStep        	
	 * @param unknown $wfStepOwer        	
	 * @param unknown $str        	
	 * @return string
	 */
	private function currentStep($wfStep, $wfStepOwer, $str) {
		// 写入文件
		$datas = explode ( 'id="STEPSVG_' . $wfStep . '"', $str );
		if (count ( $datas ) == 2) {
			$length = strpos ( $datas [1], " y=" ) - strpos ( $datas [1], " x=" ) + 3;
			$x = ( int ) substr ( $datas [1], strpos ( $datas [1], " x=" ) + 4, $length ) + 30;
			$length = strpos ( $datas [1], " style" ) - strpos ( $datas [1], " y=" ) + 3;
			$y = ( int ) substr ( $datas [1], strpos ( $datas [1], " y=" ) + 4, $length ) + 30;
			$owers = explode ( ',', $wfStepOwer );
			$vv = '';
			$old = '';
			$new = '';
			foreach ( $owers as $item ) {
				if ($item != '') {
					$owersArr = explode ( '-o-', $item );
					if (count ( $owersArr ) == 1 || $owersArr [1] == '0') {
						if ($old == '') {
							$old = $owersArr [0];
						} else {
							$old = $old . ',' . $owersArr [0];
						}
					} else {
						if ($new == '') {
							$new = $owersArr [0];
						} else {
							$new = $new . ',' . $owersArr [0];
						}
					}
				}
			}
			if ($old != '') {
				// $mes = ($new != '') ? '已处理者：' : '';
				$mes = '';
				$vv = '<text name="wfStepOwerShowDiv' . $wfStep . '" x="' . $x . '" y="' . $y . '" font-size="12" font-weight="bold" style="display:none;">' . $mes . $old . '</text>';
			}
			if ($new != '') {
				$mes = "";
				if ($old != '') {
					// $mes = '未处理者：';
					$y = $y + 20;
				}
				$vv = $vv . '<text name="wfStepOwerShowDiv' . $wfStep . '" x="' . $x . '" y="' . $y . '" font-size="12" font-weight="bold" fill="#FF0000" style="display:none;">' . $mes . $new . '</text>';
			}
			$datas2 = explode ( '<g><g>', $datas [0] );
			$str = $datas2 [0];
			if (count ( $datas2 ) == 3) {
				$str = $str . $vv . '<script language="JavaScript"><![CDATA[var wfStepOwerShowDiv' . $wfStep . '=document.getElementsByName("wfStepOwerShowDiv' . $wfStep . '");function showInfor' . $wfStep . '(evt) {for(var i=0;i<wfStepOwerShowDiv' . $wfStep . '.length;i++){wfStepOwerShowDiv' . $wfStep . '[i].style.display = "block";}}function hideInfor' . $wfStep . '(evt) {for(var i=0;i<wfStepOwerShowDiv' . $wfStep . '.length;i++){wfStepOwerShowDiv' . $wfStep . '[i].style.display = "none" ;}}]]></script><g></g><g><g>';
				$str = $str . $datas2 [2];
			} else {
				$str = $str . $vv . '<script language="JavaScript"><![CDATA[var wfStepOwerShowDiv' . $wfStep . '=document.getElementsByName("wfStepOwerShowDiv' . $wfStep . '");function showInfor' . $wfStep . '(evt) {for(var i=0;i<wfStepOwerShowDiv' . $wfStep . '.length;i++){wfStepOwerShowDiv' . $wfStep . '[i].style.display = "block";}}function hideInfor' . $wfStep . '(evt) {for(var i=0;i<wfStepOwerShowDiv' . $wfStep . '.length;i++){wfStepOwerShowDiv' . $wfStep . '[i].style.display = "none" ;}}]]></script><g></g><g><g>';
				$str = $str . $datas2 [1];
			}
			$str = $str . 'id="STEPSVG_' . $wfStep . '" fill="#FF0000"  font-weight="bold" ';
			$str = $str . ' onmouseover="showInfor' . $wfStep . '(evt)" onmouseout="hideInfor' . $wfStep . '(evt)" onmousemove="showInfor' . $wfStep . '(evt)" ';
			$str = $str . $datas [1];
		}
		return $str;
	}
	
	/**
	 * 设置历史步骤样式
	 *
	 * @param unknown $wfStep        	
	 * @param unknown $wfStepOwer        	
	 * @param unknown $str        	
	 * @return string
	 */
	private function setHisStep($wfStep, $wfStepOwer, $str, $color) {
		$datas = explode ( 'id="STEPSVG_' . $wfStep . '"', $str );
		if (count ( $datas ) == 2) {
			$length = strpos ( $datas [1], " y=" ) - strpos ( $datas [1], " x=" ) + 3;
			$x = ( int ) substr ( $datas [1], strpos ( $datas [1], " x=" ) + 4, $length ) + 30;
			$length = strpos ( $datas [1], " style" ) - strpos ( $datas [1], " y=" ) + 3;
			$y = ( int ) substr ( $datas [1], strpos ( $datas [1], " y=" ) + 4, $length ) + 30;
			$owers = explode ( ',', $wfStepOwer );
			$vv = '';
			foreach ( $owers as $item ) {
				if ($item != '') {
					if ($vv == '') {
						$vv = $item;
					} else {
						$vv = $vv . ',' . $item;
					}
				}
			}
			$datas2 = explode ( '<g><g>', $datas [0] );
			$str = $datas2 [0];
			if (count ( $datas2 ) == 3) {
				$str = $str . '<text id="wfStepOwerShowDiv' . $wfStep . '" x="' . $x . '" y="' . $y . '" ' . (($color == '#FF0000') ? 'fill="' . $color . '"' : '') . ' font-size="12" font-weight="bold" style="pointer-events: all;padding:2px 5px 3px 5px;z-index: 999999999;display:block;background:#E8E8E8;border:solid 1px #C9C9C9;">' . $vv . '</text><script language="JavaScript"><![CDATA[document.getElementById("wfStepOwerShowDiv' . $wfStep . '").style.display="none";function showInfor' . $wfStep . '(evt) {document.getElementById("wfStepOwerShowDiv' . $wfStep . '").style.display = "block" ;}function hideInfor' . $wfStep . '(evt) {if (document.getElementById("wfStepOwerShowDiv' . $wfStep . '")){document.getElementById("wfStepOwerShowDiv' . $wfStep . '").style.display = "none" ;}}]]></script><g><g/><g><g>';
				$str = $str . $datas2 [2];
			} else {
				$str = $str . '<text id="wfStepOwerShowDiv' . $wfStep . '" x="' . $x . '" y="' . $y . '" ' . (($color == '#FF0000') ? 'fill="' . $color . '"' : '') . ' font-size="12" font-weight="bold" style="pointer-events: all;padding:2px 5px 3px 5px;z-index: 999999999;display:block;background:#E8E8E8;border:solid 1px #C9C9C9;">' . $vv . '</text><script language="JavaScript"><![CDATA[document.getElementById("wfStepOwerShowDiv' . $wfStep . '").style.display="none";function showInfor' . $wfStep . '(evt) {document.getElementById("wfStepOwerShowDiv' . $wfStep . '").style.display = "block" ;}function hideInfor' . $wfStep . '(evt) {if (document.getElementById("wfStepOwerShowDiv' . $wfStep . '")){document.getElementById("wfStepOwerShowDiv' . $wfStep . '").style.display = "none" ;}}]]></script><g></g><g><g>';
				$str = $str . $datas2 [1];
			}
			$str = $str . 'id="STEPSVG_' . $wfStep . '" fill="' . $color . '"  font-weight="bold" ';
			$str = $str . ' onmouseover="showInfor' . $wfStep . '(evt)" onmouseout="hideInfor' . $wfStep . '(evt)" onmousemove="showInfor' . $wfStep . '(evt)" ';
			$str = $str . $datas [1];
		}
		return $str;
	}
	
	/**
	 * 下载svg
	 *
	 * @return number
	 */
	public function fileDownSVG() {
		$fileUrl = $this->exec ( "getPublicPath" );
		$tempstr = strstr ( $fileUrl, "files" );
		$fileUrl = strstr ( $fileUrl, $tempstr, TRUE );
		$fileUrl = $fileUrl . "files/download/SVGView.exe";
		$filName = basename ( $fileUrl );
		$filName = urlencode ( $filName );
		Header ( "Content-type: application/octet-stream;" );
		Header ( "Accept-Ranges: bytes" );
		Header ( "Content-Disposition: attachment; filename=" . $filName );
		if ($fileUrl) {
			return readfile ( $fileUrl );
		}
	}
	
	/**
	 * 渲染表单发起页面
	 *
	 * @return string
	 */
	public function formStartHandlePage() {
		$data ['flowId'] = $_POST ['flowId'];
		$data ['wfId'] = $_POST ['wfId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$Proxy = $this->exec ( 'getProxy', "collaborative" );
		return $this->renderTemplate ( array (
				"data" => array (
						$Proxy->getActions ( $data ) 
				) 
		) );
	}
	
	/**
	 * 获取步骤处理用户
	 */
	public function getStepOwner() {
		$formData = isset ( $_POST ['formData'] ) ? $_POST ['formData'] : '';
		parse_str ( $formData, $out );
		$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$data ['formId'] = isset ( $_POST ['formId'] ) ? $_POST ['formId'] : '';
		$data ['wfId'] = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$data ['actionId'] = isset ( $_POST ['actionId'] ) ? $_POST ['actionId'] : '';
		$data ['dataId'] = isset ( $_POST ['dataId'] ) ? $_POST ['dataId'] : '';
		$data ['stepId'] = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
		$data ['formUserId'] = isset ( $_POST ['formUserId'] ) ? $_POST ['formUserId'] : '';
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$data = $data + $out;
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo json_encode ( $Proxy->getStepOwner ( $data ) );
	}
	
	// /**
	// * 渲染选择下一步处理人界面
	// *
	// * @return string
	// */
	// public function selectWfOwnerPage() {
	// $userId = $this->getUser ()->getId ();
	// $nextStepOwner = $_POST ['nextStepOwner'];
	// $datas = array (
	// "data" => array (
	// $nextStepOwner,
	// $userId
	// )
	// );
	// return $this->renderTemplate ( $datas );
	// }
	
	/**
	 * 判断当前流程步骤是否已经审批过
	 */
	public function wfIsApprovaled() {
		$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$data ['wfId'] = $_POST ['wfId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->wfIsApprovaled ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 渲染表单处理界面
	 *
	 * @return string
	 */
	public function formApprovalHandlePage() {
		if ($_POST ['isForward'] == 'true' || $_POST ['isNotice'] == 'true') {
			$datas = array (
					"data" => array (
							'none',
							'' 
					) 
			);
			return $this->renderTemplate ( $datas );
		} else {
			$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
			$data ['wfId'] = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
			$data ['stepId'] = isset ( $_POST ['stepId'] ) ? $_POST ['stepId'] : '';
			$data ['isFrom'] = 'formApprovalPage';
			$data ['userId'] = $this->getUser ()->getId ();
			$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
			$Proxy = $this->exec ( 'getProxy', 'collaborative' );
			$actions = $Proxy->getActions ( $data );
			$datas = array (
					"data" => array (
							"''",
							$actions 
					) 
			);
			return $this->renderTemplate ( $datas );
		}
	}
	
	/**
	 * 判断当前步骤是否为最后一步
	 */
	public function isLastStep() {
		$data ['flowId'] = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : '';
		$data ['actionId'] = isset ( $_POST ['actionId'] ) ? $_POST ['actionId'] : '';
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->isLastStep ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 提交审批意见
	 */
	public function commit_opinion() {
		$data ['wfModelId'] = $_POST ['wfModelId'];
		$data ['actionId'] = $_POST ['actionId'];
		$data ['opinionStr'] = $_POST ['opinionStr'];
		$data ['fileAppendixNames'] = isset ( $_POST ['fileAppendixNames'] ) ? $_POST ['fileAppendixNames'] : '';
		$data ['fileAppendixPaths'] = isset ( $_POST ['fileAppendixPaths'] ) ? $_POST ['fileAppendixPaths'] : '';
		$data ['wfId'] = $_POST ['wfId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['formId'] = $_POST ['formId'];
		$data ['dataId'] = $_POST ['dataId'];
		$data ['userFormId'] = $_POST ['userFormId'];
		$data ['userFormActionName'] = $_POST ['userFormActionName'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->commit_opinion ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 审批转发流程
	 */
	public function wfForwardAction() {
		$data ['wfId'] = $_POST ['wfId'];
		$data ['formId'] = $_POST ['formId'];
		$data ['userFormID'] = $_POST ['userFormID'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$proxy = $this->exec ( "getProxy", 'collaborative' );
		$return = $proxy->wfForwardAction ( $postData );
		echo json_encode ( $return );
	}
	
	/**
	 * 判断流程是否已经审批过
	 */
	public function isApprovalOver() {
		$data ['wfId'] = $_POST ['wfId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->isApprovalOver ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 流程审批
	 */
	public function auditingWorkflow() {
		$params = $_POST ['postData'];
		parse_str ( $params, $data );
		$data ['flowId'] = $_POST ['flowId'];
		$data ['wfId'] = $_POST ['wfId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['actionId'] = $_POST ['actionId'];
		$data ['formId'] = $_POST ['formId'];
		$data ['dataId'] = $_POST ['dataId'];
		$data ['userFormId'] = $_POST ['userFormId'];
		$data ['selectUsers'] = $_POST ['selectUsers'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->auditingWorkflow ( $postData );
		echo json_encode ( $result );
	}
	
	/**
	 * 流程发起方法
	 */
	public function startWorkflow() {
		$params = $_POST ['postData'];
		$wfModelId = isset ( $_POST ['flowId'] ) ? $_POST ['flowId'] : 0;
		$filePaths = isset ( $_POST ['filePaths'] ) ? $_POST ['filePaths'] : '';
		$fileNames = isset ( $_POST ['fileNames'] ) ? $_POST ['fileNames'] : "";
		$condition = isset ( $_POST ['condition'] ) ? $_POST ['condition'] : "";
		$applyDateCount = isset ( $_POST ['applyDateCount'] ) ? $_POST ['applyDateCount'] : 0;
		$params = $params . '&formId=' . $_POST ['formId'] . '&flowId=' . $wfModelId . '&actionId=' . $_POST ['actionId'] . '&filePaths=' . $filePaths . '&dataId=' . $_POST ['dataId'] . '&fileNames=' . $fileNames . '&selectUsers=' . $_POST ['selectUsers'] . '&condition=' . $condition . '&applyDateCount=' . $applyDateCount . '&userId=' . $this->getUser ()->getId () . '&remoteAddr=' . $_SERVER ["REMOTE_ADDR"];
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		$Proxy = $this->exec ( 'getProxy', 'collaborative' );
		$result = $Proxy->startWorkflow ( $postData );
		$successFlag = $result->success;
		if ($successFlag) {
			unset ( $_SESSION ['shopcar'] );
		}
		echo json_encode ( $result );
	}
	
	/**
	 * 首页我的待办列表
	 */
	public function listWorkFlowToDo() {
		$userId = $this->getUser ()->getId ();
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$limit = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$offset = ($page - 1) * $limit;
		$parent = isset ( $_GET ['parent'] ) ? $_GET ['parent'] : 'todo'; // 父类型
		$child = isset ( $_GET ['child'] ) ? $_GET ['child'] : 'all'; // 子类型
		$stageIds = isset ( $_GET ['stageIds'] ) ? $_GET ['stageIds'] : '';
		$params = "start=" . $offset . "&limit=" . $limit . "&userId=" . ($this->getUser ()->getId ()) . "&parent=" . $parent . "&child=" . $child . "&stageIds=" . $stageIds;
		$params = $params . '&remoteAddr=' . $this->getClientIp ();
		parse_str ( $params, $out );
		
		$proxy = $this->exec ( 'getProxy', 'collaborative' );
		$resultData = $proxy->getCollaborativeDataList ( $out );
		
		$total = $resultData->size;
		$result = $resultData->formList;
		
		if (! $total) {
			echo '<li class="noborder"><u style="padding-left:15px;line-height:40px;text-decoration:none;">无数据</u></li>';
			return - 1;
		}
		$list = '';
		foreach ( $result as $line => $row ) {
			$user = $proxy->getUserInfoById ( $row->userId );
			$iconUrl = $user->headerFileId;
			if ($iconUrl == null || $iconUrl == "") {
				$iconUrl = "/apps/esdocument/templates/ESDefault/images/avatar.jpg";
			}
			$p = $row->id . '&' . $row->flowId . '&' . $row->formId . '&' . $row->wfId . '&' . $row->stepId . '&' . $row->dataId . '&' . $row->wfState . '&' . $row->title . '&' . $row->userFormNo . '&' . $row->workFlowType . '&' . $row->isLast;
			if ($line == 0) {
				$list .= '<li  class="details" info="' . $p . '"><div class="info"><div class="date"><span>' . $row->month . '</span>' . $row->year . '</div>' . '<div class="avatar"><img src="' . $iconUrl . '" /></div>' . '<div class="title"><span>' . $row->caller . '</span><a href="javascript:void(0)" >' . $row->displayName . '</a></div></div></li>';
			} else {
				$list .= '<li  class="details" info="' . $p . '"><div class="info"><div class="date"><span>' . $row->month . '</span>' . $row->year . '</div>' . '<div class="avatar"><img src="' . $iconUrl . '" /></div>' . '<div class="title"><span>' . $row->caller . '</span><a href="javascript:void(0)" >' . $row->displayName . '</a></div></div></li>';
			}
		}
		echo $list;
	}
	
	/**
	 * 查询所有待办的总数
	 */
	public function listWorkFlowAll() {
		$userId = $this->getUser ()->getId ();
		$params = "userId=" . $userId . "&parent=todo";
		$proxy = $this->exec ( 'getProxy', 'collaborative' );
		parse_str ( $params, $out );
		$postData = json_encode ( $out );
		$resultCount = $proxy->listWorkFlowAll ( $postData );
		echo $resultCount;
	}
	
	/**
	 * 执行转发操作
	 */
	public function excuteWfForward() {
		$data ['userIds'] = $_POST ['userIds'];
		$data ['wfId'] = $_POST ['wfId'];
		$data ['userFormId'] = $_POST ['userFormId'];
		$data ['stepId'] = $_POST ['stepId'];
		$data ['opinionStr'] = $_POST ['opinionStr'];
		$data ['fileAppendixNames'] = $_POST ['fileAppendixNames'];
		$data ['fileAppendixPaths'] = $_POST ['fileAppendixPaths'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$proxy = $this->exec ( "getProxy", 'collaborative' );
		$return = $proxy->excuteWfForward ( $postData );
		echo $return;
	}
	
	/**
	 * 获取消息处理参数
	 *
	 * @return string
	 */
	public function getCollaborativeMsgByWfId() {
		$wfId = isset ( $_POST ['wfId'] ) ? $_POST ['wfId'] : '';
		$state = isset ( $_POST ['state'] ) ? $_POST ['state'] : '';
		$userId = $this->getUser ()->getId ();
		$proxy = $this->exec ( 'getProxy', 'collaborative' );
		echo json_encode ( $proxy->getCollaborativeMsgByWfId ( $wfId, $state, $userId ) );
	}
	
	/**
	 * 审批知会流程
	 */
	public function WfNoticeAction() {
		$data ['wfId'] = $_POST ['wfId'];
		$data ['formId'] = $_POST ['formId'];
		$data ['flowId'] = $_POST ['flowId'];
		$data ['opinionValue'] = $_POST ['opinionValue'];
		$data ['userId'] = $this->getUser ()->getId ();
		$data ['remoteAddr'] = $_SERVER ["REMOTE_ADDR"];
		$postData = json_encode ( $data );
		$proxy = $this->exec ( "getProxy", "collaborative" );
		echo $proxy->WfNoticeAction ( $postData );
	}
	
	/**
	 * 待办处理时间越期提醒
	 */
	public function flowOutOfAuditTime() {
		$proxy = $this->exec ( "getProxy", "collaborative" );
		echo $proxy->flowOutOfAuditTime ();
	}
	
	/**
	 * 获取电子文件字符串
	 */
	public function getDocFiles() {
		$docId = isset ( $_POST ['docId'] ) ? $_POST ['docId'] : '';
		if ($docId != '') {
			$proxy = $this->exec ( "getProxy", "collaborative" );
			echo $proxy->getDocFiles ( $docId );
		}
	}
}