<?php
/**
 * 借阅管理
 * @author yuanzhonghua
 * @Date 20121107
 */
class ESArchiveLendingAction extends ESActionBase{
	/**
	 * @see ESActionBase::index()
	 */
	public function index()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author yzh
	 * 跳到指定的添加借阅表单管理页面
	 * @return string
	 */
	public function add()
	{
		$map = array();
		$map['data'] ='form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData[$count] = array();
				$resData[$count]['id'] = $row->id;
				$resData[$count]['field'] = $row->field;
				$resData[$count]['type'] = $row->type;
				$resData[$count]['length'] = $row->length;
				$resData[$count]['doLength'] = $row->doLength;
				$resData[$count]['isNull'] = $row->isNull;
				$resData[$count]['metadata'] = $row->metaData;
				if(isset($row->propValue)){
					$resData[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		return $this->renderTemplate(array('data'=>$resData,'inside'=>$_GET['flag']));
	}
	/**
	 * @author yzh
	 * 执行提交审批之前渲染选择审批人的界面
	 */
	public function approveToUser(){
		return $this->renderTemplate();
	}
	/**
	 * @author yzh
	 * 执行提交审批之前渲染选择审批人的界面中审批人列表的获取----【暂时不用】
	 */
	public function approveToUser_json(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$query = isset($_POST['query'])?$_POST['query']:false;
		$userId = $this->getUser()->getId();
		$param = array('process_number'=>'borrow','process_param'=>'fileClerkConfirm');
		$param = json_encode($param);
		$proxy=$this->exec('getProxy','escloud_workflowws');
		$lists = $proxy->findRoleUserByOrg($userId,$param);
		$userlist = $lists->userList;
		$total = $lists->size;
		if ($lists==""){
			return;
		}
		$results = array_slice($userlist,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i=1;
		foreach($results as $k=>$row){
			$entry = array('id'=>$i,
					'cell'=>array(
							'id2'=>'<input type="checkbox" name="ids" value='.$row->userid.'>',
							'c4'=>$row->userid,
							'c5'=>$row->displayName,
							'c6'=>$row->mobTel,
							'c7'=>$row->emailAddress,
							'c8'=>$row->officeTel,
					),
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author yzh
	 * 添加登记人审批意见页面的渲染
	 * @return string
	 */
	public function approveBefore(){
		$userId=$this->getUser()->getId();
		if(!isset($_POST['baseBorrow'])) return ;
		$baseBorrows = $_POST['baseBorrow'];
		$typesour= $_POST['typesour'];
		$baseBorrowList=explode('|',$baseBorrows);
		$borrow_base=array(
				'reader'=>$baseBorrowList[0],
				'purpose'=>$baseBorrowList[4],
				'unit'=>$baseBorrowList[1],
				'phone'=>$baseBorrowList[2],
				'email'=>$baseBorrowList[3],
				'time'=>$baseBorrowList[5],
				'describe'=>$baseBorrowList[9]
		);
		if($_POST['paths']){
			$borrow_details=$_POST['paths'];
		}else{
			$borrow_details='';
		}
		return $this->renderTemplate(array('list'=>$borrow_base,'details'=>$borrow_details,'typesour'=>$typesour));
	}
	/**
	 * @author yzh
	 * 添加登记人审批意见时，借阅明细列表的渲染
	 */
	public function approveGet_json(){
		$details=isset($_POST['query'])?$_POST['query']:'';
		if($details=='')return;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$rows=explode(',', $details);
		$total=count($rows);
		$i=1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows AS $row){
			$list=explode('|', $row);
			$entry = array(
					'id'=>$i,
					'cell'=>array(
							'c3'=>$i,
							'c4'=>$list[0],
							'c5'=>$list[1],
							'c6'=>$list[2],
							'c7'=>$list[3]
					)
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author yzh
	 * 执行添加借阅管理表单数据操作
	 */
	public function addForm()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		parse_str($data['data'],$output);
		if(!isset($_POST['IreaderD'])) return ;
		$IreaderD=$_POST['IreaderD'];
		$userId=$this->getUser()->getId();
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
		if(empty($output)) return false;
		if($IreaderD==0){
			$output['readerid']='';
			$output['deptcode']='';
		}
		$readerIdNew  = isset($output['readerid'])?$output['readerid']:'';
		$map = array();
		$map['data'] = 'form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldId(json_encode($map));
		$usingform=array(
			'registerid'=>$userId,
			'readerid'=>isset($output['readerid'])?$output['readerid']:'',
			'reader'=>isset($output['reader'])?$output['reader']:'',
			'deptcode'=>isset($output['deptcode'])?$output['deptcode']:'',
			'dept'=>isset($output['dept'])?$output['dept']:'',
			'tel'=>isset($output['tel'])?$output['tel']:'',
			'email'=>isset($output['email'])?$output['email']:'',
			'usepurpose'=>$output['usepurpose'],
			'validdate'=>$output['validdate'],
			'register'=>$output['register'],
			'registdate'=>$output['registdate'],
			'identity'=>isset($output['identity'])?$output['identity']:'',
			'status'=>'未结束',
			'description'=>isset($output['description'])?$output['description']:''
		);
		foreach($res as $r){
			$usingform[$r] =$output[$r];
		}
		if(isset($_POST['paths'])){
			$paths = $_POST['paths'];
			$otherValue = $_POST['oValues'];
			$rows=explode(',', $paths);
			$values=explode(',', $otherValue);
			$fileCout = 0;
			$innerFileCount = 0;
			$idParents = '';
			$jsonData = array('usingform'=>$usingform,'usingdetail'=>array(),'fileCount'=>array(),'userid'=>$userId,'operation'=>'添加','operationdetail'=>'添加借阅管理表单数据');
			$count =0;
			foreach($rows as $row){
				$list=explode('|', $row);
				$usingdetail=array(
						'archivecode'=>$list[0],
						'title'=>$list[1],
						'readtype'=>$list[3],
						'description'=>$list[2],
						'path'=>$list[4],
						'archivetype'=>$list[5],
						'fileCount'=>$list[6],
						'innerFileCount'=>$list[7],
						'status'=>'未借阅'
				);
				$flag = count(explode('/,',$list[4]))==4?false:true;
				if($flag){
					$usingdetail['idParent'] = $list[8];
				}else{
					$usingdetail['idParent'] = '-1';
				}
				$v = explode('|',$values[$count]);
				for($t =0;$t<count($v);$t++){
					$v1 = explode(':',$v[$t]);
					$usingdetail[$v1[0]] = isset($v1[1])?$v1[1]:'';
				}
				$count ++;
				$jsonData['usingdetail'][]=$usingdetail;
			}
		}else{
			$jsonData = array('usingform'=>$usingform,'userid'=>$userId,'operation'=>'添加','operationdetail'=>'添加借阅管理表单数据');
		}
		$jsonData = json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formdate=$proxy->addform($jsonData);
		
		/** guolanrui 20140901 记录日志 start **/
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$logMap=array();
		$logMap['userid'] = $userId;
		$logMap['module'] = '借阅管理';
		$logMap['type'] = 'operation';
		$logMap['ip'] = $this->getClientIp();
		$logMap['loginfo'] = '借阅管理，添加借阅单';
		$logMap['operate'] = '借阅管理：添加';
		$logProxy->saveLog(json_encode($logMap));
		/** guolanrui 20140901 记录日志 end **/
		
		echo $formdate;
	}
	/**
	 * @author yzh
	 * 借阅管理的数据显示操作
	 */
	public function form_json(){
		$userId=$this->getUser()->getId();
		$formdate=$this->exec('getProxy','escloud_usingformws');
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$statusForTree = isset($_GET['statusForTree'])?$_GET['statusForTree']:'all';
		$noUser = isset($_GET['noUser'])?$_GET['noUser']:'';
		$lists=$formdate->getList($start,$limit,$userId,$statusForTree);
		if ($lists==""){
			return;
		}
		$map = array();
		$map['data'] = 'form';
		$res=$formdate->getUsingFieldId(json_encode($map));
		$total=$formdate->getTotal($userId);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($lists as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" id="'.$list->idreader.'" name="id" value='.$list->id.'>',
							'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->code,
							'c5'=>$list->reader,
							'c6'=>$list->dept,
							'c7'=>$list->tel,
							'c8'=>$list->email,
							'c9'=>$list->usepurpose,
							'c10'=>$list->validdate,
							'c11'=>$list->duration,
							'c12'=>$list->register,
							'c13'=>$list->registdate,
							'c14'=>$list->status,
							'c16'=>$list->identify,
							'c17'=>$list->fileCount,
							'c18'=>$list->innerFileCount,
							'c15'=>$list->description,
							'edit'=>$list->edit,
							'changeColor'=>isset($list->changeColor)?$list->changeColor:'false'
					)
			);
			foreach($res as $r){
				$r1 = str_replace('c','d',$r);
				$entry['cell'][$r1] = $list->$r;
			}
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * @author yzh
	 * 借阅表单管理的删除操作
	 */
	public function delBorrowList(){
		$userId=$this->getUser()->getId();
		$id=$_GET['id'];
		$lists = explode(",", $id);
		$jsonData = array('userid'=>$userId,'operation'=>'删除','operationdetail'=>'删除借阅管理表单数据','ids'=>array());
		foreach($lists as $list){
			$jsonData['ids'][]=$list;
		}
		$jsonData=json_encode($jsonData);
		$proxy=$this->exec("getProxy","escloud_usingformws");
		$del=$proxy->delList($jsonData);
		/** guolanrui 20140901 记录日志 start **/
		$logProxy=$this->exec('getProxy','escloud_logservice');
		$map=array();
		$map['userid'] = $userId;
		$map['module'] = '借阅管理';
		$map['type'] = 'operation';
		$map['ip'] = $this->getClientIp();
		$map['loginfo'] = '借阅管理，删除id为'.$id.'的借阅单';
		$map['operate'] = '借阅管理：删除';
		$logProxy->saveLog(json_encode($map));
		/** guolanrui 20140901 记录日志 end **/
		echo $del;
	}
	/**
	 * @author yzh
	 * 跳转到筛选借阅管理表单页面
	 */
	public function filter(){
		$map = array();
		$map['data'] ='form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData[$count] = array();
				$resData[$count]['id'] = $row->id;
				$resData[$count]['field'] = $row->field;
				$resData[$count]['type'] = $row->type;
				$resData[$count]['length'] = $row->length;
				$resData[$count]['doLength'] = $row->doLength;
				$resData[$count]['isNull'] = $row->isNull;
				$resData[$count]['metadata'] = $row->metaData;
				if(isset($row->propValue)){
					$resData[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		return $this->renderTemplate(array('data'=>$resData));
	}
	/**
	 * @author yzh
	 * 实现筛选借阅管理表单功能
	 */
	public function filter_sql(){
		$userId=$this->getUser()->getId();
		$sql_string=$_GET['sql'];
		if($sql_string=="")return;
		$listw=explode("|",$sql_string);
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$noUser = isset($_GET['noUser'])?$_GET['noUser']:'';
		$keyWord = isset($_PSOT['query']['keyWord'])?$_PSOT['query']['keyWord']:'';
		$proxy = $this->exec('getProxy','escloud_usingformws');
		$map1 = array();
		$map1['data'] = 'form';
		$res=$proxy->getUsingFieldId(json_encode($map1));
		$pId = $_GET['pId'];
		$id = $_GET['id'];
		if($pId == null || $pId == ''){
			$type= 'all';
		}
		if($pId == '1' ){
			$type='year';
		}
		if($pId > 1 ){
			$type='mouth';
		}
		$statusForTree =isset($_GET['statusForTree'])?$_GET['statusForTree']:'all';
		$param=array('list'=>$listw,'userId'=>$userId,'start'=>$start,'statusForTree'=>$statusForTree,'limit'=>$limit,'treeId'=>$id,'treePId'=>$pId,'type'=>$type,'noUser'=>$noUser,'keyWord'=>$keyWord,'ipStr'=>$this->getClientIp());
		$resData=$proxy->filterBorrow(json_encode($param));
		$total=$resData->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			//shimiao 20140811 
			$num = 1;
			foreach($resData->list as $list){
				$entry=array(
						'id'=>$list->id,
						'cell'=>array(
								'num'=>$num,
								'id'=>'<input type="checkbox" name="id" value='.$list->id.'>',
								'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
								'c4'=>$list->code,
								'c5'=>$list->reader,
								'c6'=>$list->dept,
								'c7'=>$list->tel,
								'c8'=>$list->email,
								'c9'=>$list->usepurpose,
								'c10'=>$list->validdate,
								'c11'=>$list->duration,
								'c12'=>$list->register,
								'c13'=>$list->registdate,
								'c14'=>$list->status,
								'c15'=>$list->description,
								'c16'=>$list->identify,
								'c17'=>$list->fileCount,
								'c18'=>$list->innerFileCount,
								'edit'=>isset($list->edit)?$list->edit:'true',
								'changeColor'=>isset($list->changeColor)?$list->changeColor:'false'
						)
				);
				$num++;
				foreach($res as $r){
					$r1 = str_replace('c','d',$r);
					$entry['cell'][$r1] = $list->$r;
				}
				$jsonData['rows'][]=$entry;
			}
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author yzh
	 * 借阅管理表单的打印
	 */
	public function getBorrowDataByBorrowModel(){
		$borrowModel=$_GET['borrowModel'];
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$data=$proxy->getReportIdByReporttype($borrowModel);
		echo json_encode($data);
	}
	/**
	 * @author yzh
	 * 借阅报表打印
	 */
	public function printBorrowPage(){
		$borrowId=$_POST['borrowId'];
		$borrowType=$_POST['borrowType'];
		$reportTitle=$_POST['reportTitle'];
		$ids=explode(',',$_POST['ids']);
		$userId = $this->getUser()->getId();
		$ipStr = $this->getClientIp();
		if(empty($userId)) exit(null);
		$param=array(
				'userid'=>$userId,
				"ids"=>$ids,
 				"reportId"=>$borrowId,
				 "reportType"=>$borrowType,
				 "ipStr"=>$ipStr,
				 "reportTitle"=>$reportTitle
		
		);
		$proxy=$this->exec("getProxy","escloud_reportservice");
		$addr=$proxy->printBorrowForm(json_encode($param));
		echo $addr;
		
	}
	
	/**
	 * 查询目录报表文件
	 * author: niyang
	 * date: 2013-09-30
	 * return json $jsonData
	 */	
	public function getInfomation() {
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$rp=$request->getPost('rp');
		$rp = isset($rp) ? $rp : 20;				
		$userId = $this->getUser()->getId();
		if(empty($userId)) exit(null);
		$proxy=$this->exec("getProxy","escloud_reportservice");
		$info=$proxy->getInfomation($userId,$page,$rp);
		$total = $info->total;
		$info = $info->list;
		$count = count($info);
		if($total > 0) {
			for($i=0; $i<$count; $i++) {
				if(empty($info[$i]->address) === FALSE && $info[$i]->address!='null') {
					@$info[$i]->downurl = '<a onclick="openUrl(this)" title="下载目录报表" target="_blank" href="javascript:void(0);" path_data="'.($info[$i]->address).'" path_id="'.$info[$i]->id.'">点击下载</a>';
				} else {
					@$info[$i]->downurl = $info[$i]->printStatus.',无法下载';
				}		
			}
		}
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>$info);
		echo json_encode($jsonData);
		exit;
	}
	
	/**
	 * 修改打印目录报表生成的文件的下载状态
	 * author: niyang
	 * date: 2013-09-30
	 * return bool
	 */
	public function updateInfomation(){
		$request=$this->getRequest();
		$id = $request->getGet('id');
		$proxy=$this->exec("getProxy","escloud_reportservice");
		$param = array('id'=>$id,'downloadStatus'=>'已下载');
		$res=$proxy->updateInfomation(json_encode($param));
		echo $res;
		exit;			
	}
	/**
	 * @author yzh
	 * 编辑借阅管理表单数据
	 */
	public function eidtBorrow(){
		$request=$this->getRequest();
		$id=$request->getGet('idm');
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formData=$proxy->getItem($id);
		$start=0;
		$limit=50;
		$rows=$proxy->getDetails($id,'all',$start,$limit);
		$arType='';
		if(count($rows->data)!=0){
			foreach($rows->data as $val){
				if($val->archive_type!=''){
					$arType=$val->archive_type;
					break;
				}
			}
		}
		
		//添加利用单的类型
		$formTypeParams=array('readerid'=>$formData->reader,'identity'=>$formData->identify);
		$formType = $proxy->getFormType(json_encode($formTypeParams));
		
		$item=array(
			'readerid'=>$formData->idreader,
			'reader'=>$formData->reader,
			'deptcode'=>$formData->iddept,
			'dept'=>$formData->dept,
			'tel'=>$formData->tel,
			'email'=>$formData->email,
			'usepurpose'=>$formData->usepurpose,
			'validdate'=>$formData->validdate,
			'register'=>$formData->register,
			'registdate'=>$formData->registdate,
			'status'=>$formData->status,
			'description'=>$formData->description,
			'identity'=>$formData->identify,
			'arType'=>$arType,
			'edit'=>$formData->edit,
			'inside'=>$formType
		);
		
		$map = array();
		$map['data'] ='form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$v = 'c'.$row->id;
				$resData[$count] = array();
				$resData[$count]['id'] = $row->id;
				$resData[$count]['field'] = $row->field;
				$resData[$count]['type'] = $row->type;
				$resData[$count]['length'] = $row->length;
				$resData[$count]['doLength'] = $row->doLength;
				$resData[$count]['isNull'] = $row->isNull;
				$resData[$count]['metadata'] = $row->metaData;
				$resData[$count]['value'] = $formData->$v;
				if(isset($row->propValue)){
					$resData[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		$item['data'] = $resData;
		return $this->renderTemplate($item,'ESArchiveLending/modify');
	}
	/**
	 * @author yzh
	 * 编辑借阅表单管理数据时显示借阅明细
	 */
	public function showDetails(){
		$request=$this->getRequest();
		$id=$request->getGet('idm');
		$status = isset($_GET['status'])?$_GET['status']:'all';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$rows=$proxy->getDetails($id,$status,$start,$limit);
		
		$map = array();
		$map['data'] = 'store';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		
		$total=$rows->total;
		$i=1;
		$num=$start+1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows->data AS $row){
// 			if($row->READ_TYPE=="电子借阅"){
// 				$check1="checked";$check2=false;$check3=false;
// 			}elseif($row->READ_TYPE=="实体借阅"){
// 				$check2="checked";$check1=false;$check3=false;
// 			}elseif($row->READ_TYPE=="实体借出"){
// 				$check3="checked";$check1=false;$check2=false;
// 			}
			$pp='';
			if($row->PATH==''){
				$pp=$row->ID;
			}else{
				$pp=$row->PATH;
			}
			$entry = array(
					'id'=>$i,
					'cell'=>array(
							'num'=>$num++,
							'id3'=>"<input type='checkbox' name='id3' id='".$row->ID."' value='".$row->PATH."|".$row->USINGFORM_ID."|".$row->READ_TYPE."'/>",
							'c3'=>$row->ARCHIVE_CODE,
							'c4'=>$row->TITLE,
							'c5'=>$row->PATH!=''?$row->READ_TYPE:'实体',
							'c6'=>$row->STATUS,
							'c8'=>$row->DATE,
							'c9'=>$row->FILECOUNT,
							'c10'=>$row->INNERFILECOUNT,
							'path'=>$row->PATH,
							'shouldReturnDate'=>$row->shouldReturnDate,
							'c12'=>$row->RETURN_DATE,
							'changeColor' =>isset($row->changeColor)?$row->changeColor:'',
							'c7'=>'<input name="mark" type="text" size="12" value="'.$row->DESCRIPTION.'" placeholder="请填写备注"/>'
					)
			);
			if(isset($res->data)){
				foreach($res->data AS $r)
				{
					$rr = 'c'.$r->id;
					$r1 = 'd'.$r->id;
					if(isset($r->propValue)){
						$tStr = "<select  style='width:80px;' name='".$rr."' id='".$r1.($num-1)."' class='".$r1."' value='".$row->$rr."' >";
						$tStr = $tStr."<option value=''>--请选择--</option>";
						foreach($r->propValue AS $data){
							if($row->$rr == $data->ESIDENTIFIER){
								$tStr = $tStr."<option value='".$data->ESIDENTIFIER."' selected>".$data->ESTITLE."</option>";
							}else{
								$tStr = $tStr."<option value='".$data->ESIDENTIFIER."'>".$data->ESTITLE."</option>";
							}
							
						}
						$tStr = $tStr. "</select>";
						$entry['cell'][$r1] = $tStr;
					}else if($r->type=='TEXT' || $r->type =='NUMBER' || $r->type =='FLOAT'){
						$entry['cell'][$r1] = '<input  style="width:80px;" name="'.$rr.'" id="'.$r1.($num-1).'"  class='.$r1.' type="text" size="'.$r->length.'" value="'.$row->$rr.'"/>';
					}else if($r->type=='BOOLEAN'){
						$tStr = "<select   style='width:80px;' name='".$rr."' id='".$r1.($num-1)."'   class='".$r1."'>";
						if(null == $row->$rr || $row->$rr == "null" || $row->$rr == ""){
							$tStr = $tStr.  "<option value='3' selected='selected'></option>";
							$tStr = $tStr.  "<option value='0'>否</option>";
							$tStr = $tStr. "<option value='1'>是</option></select>";
						}else if(null != $row->$rr && $row->$rr == "1"){
							$tStr = $tStr.  "<option value='0' >否</option>";
							$tStr = $tStr. "<option value='1' selected='selected'>是</option></select>";
						}else{
							$tStr = $tStr.  "<option value='0' selected='selected'>否</option>";
							$tStr = $tStr. "<option value='1'>是</option></select>";
						}
					 	
			 			$entry['cell'][$r1] = $tStr;
					}else if($r->type=='DATE'){
						$entry['cell'][$r1] = '<input  style="width:80px;" name="'.$rr.'" class="Wdate" id="'.$r1.($num-1).'"  class='.$r1.' type="text" size="'.$r->length.'" value="'.$row->$rr.'"/>';
					}else if($r->type=='TIME'){
						$entry['cell'][$r1] = '<input  style="width:80px;" name="'.$rr.'" class="Wdate1" id="'.$r1.($num-1).'"  class='.$r1.' type="text" size="'.$r->length.'" value="'.$row->$rr.'"/>';
					}
				}
			}
			$i++;
			$jsonData['rows'][] = $entry;
		}
			echo json_encode($jsonData);
	}
	/**
	 * @author yzh
	 * 判断实体借阅与实体借出时是否在库
	 */
	public function getState(){
		$path = array('path'=>$_POST['path']);
		$proxy = $this->exec('getProxy','escloud_workflowws');
		$result = $proxy->getPath(json_encode($path));
		echo $result;
	}
	/**
	 * @author yzh
	 * 发起借阅管理表单提交审批流程
	 */
	public function submitApprove(){
		$userId=$this->getUser()->getId();
		$businessKey=time();
		$businessKey="borrow_".$businessKey;
		if(!isset($_POST['opinionId'])) return ;
		$opinionId = $_POST['opinionId'];
		$approveOpinion = $_POST['approveOpinion'];
		if(!isset($_POST['idReader'])) return ;
		$idReader = $_POST['idReader'];
		$distinguish= $_POST['distinguish'];//区分来自于会计借阅管理和借阅管理
		$archiveType = $_POST['archiveType'];
		if($archiveType==''){
			$archiveType='accounting';
		}
		
		if(!isset($_POST['baseBorrow'])) return ;
		$baseBorrows = $_POST['baseBorrow'];
		$baseBorrowList=explode('|',$baseBorrows);
		$borrow_base=array(
				//'manager_id'=>isset($_POST['formId'])?$_POST['formId']:'',
				'isusingaccount'=>$distinguish,
				'archiveType'=>$archiveType,
				'manager_id'=>'',
				'title'=>'借阅申请单',
				'jyr_f1'=>$idReader,
				'lymd_f2'=>$baseBorrowList[4],
				'dw_f3'=>$baseBorrowList[1],
				'dh_f4'=>$baseBorrowList[2],
				'yx_f5'=>$baseBorrowList[3],
				'jysc_f6'=>$baseBorrowList[5],
				'jyms_f7'=>$baseBorrowList[9],
			    'manager_reader'=>$baseBorrowList[0],
				'manager_registerid'=>$userId,
				'applicant'=>$userId
		);
		if($_POST['paths']){
			$jsonData=array('borrow_base'=>array(),'borrow_detail'=>array(),'leaderId'=>$opinionId,'opinion_desc'=>$approveOpinion);
			$paths=$_POST['paths'];
			$rows=explode(',',$paths);
			foreach($rows as $row){
				$list=explode('|',$row);
				$borrow_detail=array(
						'file_no'=>$list[0],
						'file_tm'=>$list[1],
						'borrow_type'=>$list[2],
						'mark'=>$list[3],
						'file_title'=>'借阅明细列表',
						'path'=>$list[4]
				);
				$jsonData['borrow_detail'][]=$borrow_detail;
			}
		}else{
			$jsonData=array('borrow_base'=>array(),'borrow_detail'=>array(),'leaderId'=>$opinionId,'opinion_desc'=>$approveOpinion);
		}
		$jsonData['borrow_base'][]=$borrow_base;
		$jsonDate=json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_workflowws');
		$result=$proxy->startProcess($businessKey,$userId,$jsonDate);
		echo $result;
	}
	/**
	 * @author yzh
	 * 改变借阅列表的相关明细
	 */
	public function changeLinkDetails(){
		$userId=$this->getUser()->getId();
		if(!isset($_POST['details'])) return ;
		$details = $_POST['details'];
		$readerid = $_POST['readerid'];
		$contentIds = isset($_POST['contentIds'])?$_POST['contentIds']:"";
		//identify:identify,readerName:readerName
		$identity=$_POST['identity'];
		$readerName = $_POST['readerName'];
		$rows=explode(',', $details);
		$jsonDate=array('userid'=>$userId,'usingdetail'=>array(),'readerid'=>$readerid,'contentIds'=>$contentIds,'readerName'=>$readerName,'identity'=>$identity);
		foreach($rows as $row){
			$list=explode('|', $row);
			$usingdetail=array(
				'id'=>$list[0],
				'status'=>$list[1],	
				'description'=>$list[2],
				'path'=>$list[3],
				'readtype'=>$list[4],
				'sourceStat'=>$list[5]//guolanrui 20140919 增加原状态参数，当原状态是借阅时，不往出入库中添加记录
			);
			$jsonDate['usingdetail'][]=$usingdetail;
		}
		$jsonDate=json_encode($jsonDate);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$detailsdate=$proxy->changeDetails($jsonDate);
		echo json_encode($detailsdate);
	}
	/**
	 * @author yzh
	 * 保存修改后的借阅管理表单数据
	 */
	public function saveModify(){
		$userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost();
		$id=$request->getGet('idm');
		if(!isset($_POST['IreaderD'])) return ;
		$IreaderD=$_POST['IreaderD'];
		//var_dump($IreaderD);exit;
		parse_str($data['data'],$output);
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
		if(empty($output)) return false;
		if($IreaderD==0){
			$output['readerid']='';
			$output['deptcode']='';
		}
		$item=array(
				'ID_READER'=>isset($output['readerid'])?$output['readerid']:'',
				'READER'=>isset($output['reader'])?$output['reader']:'',
				'ID_DEPT'=>isset($output['deptcode'])?$output['deptcode']:'',
				'DEPT'=>isset($output['dept'])?$output['dept']:'',
				'TEL'=>isset($output['tel'])?$output['tel']:'',
				'EMAIL'=>isset($output['email'])?$output['email']:'',
				'USE_PURPOSE'=>$output['usepurpose'],
				'VALID_DATE'=>$output['validdate'],
				'IDENTITY'=>isset($output['identity'])?$output['identity']:'',
				'ID'=>$id,
				'DESCRIPTION'=>isset($output['description'])?$output['description']:''
		);
		$map = array();
		$map['data'] = 'form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldId(json_encode($map));
		foreach($res as $r){
			$item[$r] = isset($output[$r])?$output[$r]:'';
		}
		if(isset($_POST['paths'])){
			$jsonData = array('usingform'=>$item,'usingdetail'=>array());
			$paths=$_POST['paths'];
			$oValues=$_POST['oValues'];
			$rows=explode(',',$paths);
			$values=explode(',',$oValues);
			$count = 0;
			foreach($rows as $row){
				$list=explode('|',$row);
				if($list[0]=='undefined'){$list[0]='';}
				$idSplite = explode('@@',$list[0]);
				$index=array(
						'ID'=>$idSplite[0],
						'READ_TYPE'=>$list[1],
						'DESCRIPTION'=>$list[2],
						'ARCHIVE_CODE'=>$list[3],
						'TITLE'=>$list[4],
						'PATH'=>$list[5],
						'STATUS'=>$list[6],
						'archive_type'=>$list[7],
						'FILECOUNT'=>$list[8],
						'INNERFILECOUNT'=>$list[9],
						'updateId'=>$idSplite[1]
				);
				$flag = count(explode('/,',$list[4]))==3?false:true;
				if($flag){
					$index['ID_PARENT'] =$list[10];
				}else{
					
					$index['ID_PARENT'] ='-1';
				}
				$v = explode('|',$values[$count]);
				for($t =0;$t<count($v);$t++){
					$v1 = explode('@:@',$v[$t]);
					$index[$v1[0]] = isset($v1[1])?$v1[1]:'';
				}
				$count ++;
				$jsonData['usingdetail'][]=$index;
			}
		}else{
			$jsonData = array('usingform'=>$item);
		}
		$jsonDate=json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formdate=$proxy->saveForm($userId,$jsonDate);
		echo $formdate;
	}
	/**
	 * @author yzh
	 * 左侧机构目录树查找子节点
	 */
	public function getSubOrgList()
	{
		$orgId = $_POST['id'];
		$proxy = $this->exec("getProxy", "escloud_usingformws");
		$map1 = array();
		$map1['parentId'] = $orgId;
		$map = $proxy->getSubOrg1($map1);
		$result = array();
		$lists = $map->data;
		foreach ($lists as $k=>$val){
			$result[$k]["name"] = $val->orgNameDisplay;
			$result[$k]["pId"] = $val->parentOrgCode;
			$result[$k]["id"] = $val->orgid;
			$result[$k]["isParent"] = true;
		}
		echo json_encode($result);
	}
	/**
	 * @author yzh
	 * 初始化机构目录树的结构
	 */
	public function initOrg(){
		$proxy = $this->exec('getProxy','escloud_usingformws');
		$userId= $this->getUser()->getId();
		$map = array();
		$map['userid'] = $userId;
		$lists = $proxy->getOrg1(json_encode($map));
		$flag=isset($_GET['flag'])?$_GET['flag']:true;//用于判断是否显示为父节点图标,目前用于移交清册选择移交部门
		$Nodes[] = array(
				'name'=>$lists->orgNameDisplay,
				'pId'=>$lists->parentOrgCode,
				'id'=>$lists->orgid,
				'isParent'=>true,
				'open'=>true
		);
	
// 		$orgId = $lists->orgid;
// 		$orglist = $proxy->getSubOrg($orgId);
		//var_dump($orglist);exit;
// 		foreach ($orglist as $val)
// 		{
// 			$Nodes[] = array(
// 					'name'=>$val->orgNameDisplay,
// 					'pId'=>$val->parentOrgCode,
// 					'id'=>$val->orgid,
// 					'isParent'=>$flag
// 			);
// 		}
		//二维数组的JSON转换
		echo json_encode($Nodes);
	}
	/**
	 * @author yzh
	 * 获取指定指定机构下的人员列表
	 * @param unknown_type $orgId
	 */
	public function getPersonList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 50;
		$orgId=$_GET['orgid'];
		$proxy = $this->exec('getProxy','escloud_usingformws');
		$lists = $proxy->getPerson($orgId);
		$total=count($lists);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($lists AS $row){
			$entry = array('userid'=>$row->userid,
					'cell'=>array(
							'id2'=>'<input type="radio" name="id2" value='.$row->displayName.'|'.$row->deptEntry->orgNameDisplay.'|'.$row->officeTel.'|'.$row->emailAddress.' id='.$row->userid.'|'.$row->deptEntry->ldapOrgCode.'>',
							'c1'=>$row->displayName,
							'c2'=>$row->officeTel,
							'c3'=>$row->emailAddress,
							'c4'=>$row->deptEntry->orgNameDisplay
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	// 获得文档类型树
	public function getTree()
	{
		$proxy = $this->exec('getProxy','escloud_authservice');
		$status = $_GET['status'];//获取当前业务的状态
		$userId = $this->getUser()->getId();
		$map = array();
		$map['id'] = 1;
		$map['modelId'] = $status;
		$map['userid'] = $userId;
		$map['bigOrgId'] = $this->getUser()->getBigOrgId();
		$treelist = $proxy->getBusinessTreeforAuth(json_encode($map));
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
	 * @author yzh
	 * 跳到指定的添加借阅表单申请页面
	 * @return string
	 *
	 */
	public function apply()
	{
		$userId=$this->getUser()->getId();
		$userInfo=$this->getUser()->getInfo();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$dept = $userInfo->deptEntry->orgNameDisplay;
		$email =  $userInfo->emailAddress;
		$userName = $userInfo->displayName;
		$mobTel = $userInfo->mobTel;
		//print_r($userInfo);
		//$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		return $this->renderTemplate(array('userName'=>$userName,'userId'=>$userId,'email'=>$email,'dept'=>$dept,'mobTel'=>$mobTel));
	}
	/**
	 * @author yzh
	 * 执行添加借阅申请表单操作
	 */
	public function subForm()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		parse_str($data['data'],$output);
		if(empty($output)) return false;
		$businessKey=time();
		$businessKey="borrow_".$businessKey;
		$userId = $this->getUser()->getId();
		$list = array(
				'business_key'=>$businessKey,
				'title'=>"借阅申请审批单",
				'jyr_f1'=>$output['jyr_f1'],
				'lymd_f2'=>$output['lymd_f2'],
				'dw_f3'=>$output['dw_f3'],
				'dh_f4'=>$output['dh_f4'],
				'yx_f5'=>$output['yx_f5'],
				'jysc_f6'=>$output['jysc_f6'],
				'jyms_f7'=>$output['jyms_f7'],
				'applicant'=>$userId
		);
		$jsonData = json_encode($list);
		$proxy=$this->exec('getProxy','escloud_workflowws');
		$formdate=$proxy->subForm($businessKey,$userId,$jsonData);
		echo $formdate;
	}
	/**
	 * @author yzh
	 * 跳到初始的添加借阅明细页面
	 * @return string
	 */
	public function record(){
		return $this->renderTemplate();
	}
	/**
	 * 
	 * 在页面上显示著录明细
	 */
	public function datalist(){
		$path=$_GET['path'];
		$sId=$_GET['sId'];
		$map = array();
		$map['path'] = $path;
		$map['sId'] = $sId;
		
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getNewFields(json_encode($map));
		$str='';
		foreach ($data as $key=>$value)
		{
			$str.=json_encode($value).',';
		}
		$str=rtrim($str,',');
		
		return $this->renderTemplate(array('fields'=>$str,'path'=>$path,'sId'=>$sId));
	}
	
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
// 							'ids'=>'<input type="'.$type.'" name="path" value='.$row["path"].'>',
// 							//'operate'=>$boxfile?'<span title="编辑" class="editbtn" onclick=showBoxFile("'.$row["path"].'")>&nbsp;</span></a>&nbsp;&nbsp;<span title ="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>':'<span class="editbtn" title="编辑档案" onclick=show_items("'.$row["path"].'")>&nbsp;</span></a>&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>',
// 							'operate'=>$row['filecount']>0?'<span title="编辑" class="editbtn" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span></a>&nbsp;&nbsp;<span title ="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>':'<span class="editbtn" title="编辑档案" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span></a>',
							/** xiaoxiong 20140804 添加不可编辑时，显示个灰色的条目浏览按钮 **/
							'ids'=> '<input type="'.$type.'" name="path" class="selectone" del="'. $row['isDelete'] .'" edit="'.$row['isitemEdit'].'" fileread="'.$row['isfileRead'].'" ln="'. ($start+1) .'" value="'.$row["path"].'">',
							'operate'=> $row['isitemEdit'] === 'true' ? '<span class="editbtn" title="编辑" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'","true",this)>&nbsp;</span>' : '<span class="noeditbtn" title="条目浏览" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'","false",this)>&nbsp;</span>',
							'relation'=>$row['relation']=='true'?1:'',
							'bussystemid'=>$row['bussystemid']
					),
					'classname'=>$row['relation']=='true'?'flag':''
			);
			
			/** xiaoxiong 20140804 电子文件标示 **/
			if($row['filecount']){
				if($row['isfileRead'] == 'true'){
					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="原文浏览" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
				} else {
					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="无原文浏览权限" class="nolinkviewright">&nbsp;</span>';
				}
			}
			
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
	 * @author wangtao
	 * 获取列表内容
	 */
	public function set_json_keyWord()
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
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$map1 = array();
		$map1['path'] = $path;
		$data=$proxy->getNewFields(json_encode($map1));
		$json=array();
		foreach ($data as $value)
		{
			$json[]=$value->name;
		}
		$map = array();
		$map['path'] = $path;
		$arr=array('keyword'=>$keyword,'columns'=>$json,'groupCondition'=>$groupcondition);
		$list=$arr;
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
		$map1 = array();
		$map1['path'] = $path;
		$map1['start'] = $start.'';
		$map1['limit'] = $rp.'';
		$map1['userid'] = $userId.'';
		$map1['columnAndcondition'] = $list;
		$map['new'] = 'true';
		$data1=$proxy->getDataListByKeyword(json_encode($map1));
		$rows=json_decode(json_encode($data1),true);
		
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
	 * @author wangtao
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
	/**
	 * @author yzh
	 * 将获取的字段值放入借阅明细列表中.....(暂停使用)
	 * 
	 */
	public function linkBorrowDetails(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		if(!isset($_POST['files'])) return ;
		$files = $_POST['files'];
		$num=isset($_POST['nums'])?$_POST['nums']+1:1;
		$rows=explode(',', $files);
		$total=count($rows);
		$i=1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows AS $row){
			$list=explode('|', $row);
			$entry = array(
					'id'=>$i,
					'cell'=>array(
							'num'=>$num++,
							'id3'=>"<input type='checkbox' name='id3' id='' value='$list[2]'/>",
							'c3'=>$list[0],
							'c4'=>$list[1],
							'c5'=>'<input type="radio" name='.$list[2].' checked value="电子借阅"/>电子借阅<input type="radio" name='.$list[2].' value="实体借阅"/>实体借阅<input type="radio" name='.$list[2].' value="实体借出"/>实体借出',
							'c6'=>'未借阅',
							'c7'=>'<input name="mark" type="text" size="12" value="" placeholder="请填写备注"/>'
					)
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData['rows']);
	}
	/**
	 * @author yzh
	 * 编辑借阅明细时,挂接借阅明细信息直接到数据库
	 */
	public function linkBorrowDetailsTwo(){
		if(!isset($_POST['usingformId'])) return ;
		$usingformid=$_POST['usingformId'];
		if(!isset($_POST['files'])) return ;
		$files = $_POST['files'];
		if(!isset($_POST['archiveType'])) return ;
		$archiveType= $_POST['archiveType'];
		$detailsOtherValue = isset($_POST['detailsOtherValue'])?$_POST['detailsOtherValue']:'';
		$rows=explode(',', $files);
		$jsonData = array('usingformid'=>$usingformid,'usingdetaillist'=>array());
		$rowNum = 0;
		foreach($rows as $row){
			$list=explode('|', $row);
			$usingdetaillist=array(
					'ARCHIVE_CODE'=>$list[0],
					'TITLE'=>$list[1],
					'PATH'=>$list[2],
					'archive_type'=>$archiveType,
					'READ_TYPE'=>'实体',
					'STATUS'=>'未借阅',
					'FILECOUNT'=>'0',
					'INNERFILECOUNT'=>'1',
					'DESCRIPTION'=>''
			);
			$flag = count(explode('/',$list[2]))==4?false:true;
			if($flag){
				$usingdetaillist['idParent'] = $list[3];
			}else{
				$usingdetaillist['idParent'] = '-1';
			}
			if($detailsOtherValue!=null && $detailsOtherValue != ''){
				$otherValueRows = explode(',', $detailsOtherValue);
				$coluNames = explode(';',$otherValueRows[$rowNum]);		
				foreach ($coluNames as $coluName){
					$coluV =  explode(':',$coluName);	
					$usingdetaillist[$coluV[0]] = $coluV[1];	
				}
			}
			$jsonData['usingdetaillist'][]=$usingdetaillist;
			$rowNum ++;
		}
		$jsonDate=json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$result=$proxy->addDetails($jsonDate);
		echo $result;
	}
	/**
	 * @author yzh
	 * 编辑借阅明细时,批量删除不需要的数据
	 */
	public function delDetails(){
		$ids=$_GET['ids'];
		$usingformid=$_GET['usingFormId'];
		$lists = explode(",", $ids);
		$jsonData = array('usingformid'=>$usingformid,'ids'=>array());
		foreach($lists as $list){
			$jsonData['ids'][]=$list;
		}
		$jsonData=json_encode($jsonData);
		$proxy=$this->exec("getProxy","escloud_usingformws");
		$del=$proxy->delDetails($jsonData);
		echo $del;
	}
	/**
	 * @author yzh
	 * 删除明细数据后判断是否还有明细数据
	 */
	public function getLastTotal(){
		$idm=$_POST['idm'];
		$start=0;
		$limit=20;
		$proxy=$this->exec("getProxy","escloud_usingformws");
		$rows=$proxy->getDetails($idm,'all',$start,$limit);
		$total=$rows->total;
		echo $total;
	}
	public function getSubOrg1(){
		
		$orgId = $_POST['id'];
		$proxy = $this->exec("getProxy", "escloud_usingformws");
		$map1 = array();
		$map1['parentId'] = $orgId;
		$map = $proxy->getSubOrg1($map1);
		$lists = $map->data; 
		$result = array();
		foreach ($lists as $k=>$val){
			$result[$k]["name"] = $val->name;
			$result[$k]["pId"] = $val->pId;
			$result[$k]["id"] = $val->id;
			$result[$k]["isParent"] =  $val->isParent;
			$result[$k]["idseq"]=$val->idseq;
			$result[$k]["cuncorgclass"] = $val->cuncorgclass;
			$result[$k]["address"] = $val->address;
			$result[$k]["orgsort"] = $val->orgsort;
			$result[$k]["mainsite"]=$val->mainsite;
			$result[$k]["orgstatus"]=$val->orgstatus;
		}
		echo json_encode($result);
	}
	public function getUserList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 50;
		$keyWord = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$map = array();
		$map['startNo'] =  ($page-1)*$rp.'';
		$map['start'] =  ($page-1)*$rp.'';
		$map['limit'] =  $page*$rp.'';
		$map['keyWord'] = $keyWord;
		$proxy = $this->exec('getProxy','escloud_usingformws');
		$res = $proxy->getPerson1(json_encode($map));
		 $lists = $res->data;
		$jsonData = array('page'=>$page,'total'=>$res->total,'rows'=>array());
		foreach($lists AS $row){
			$entry = array('userid'=>$row->userid,
					'cell'=>array(
							'id2'=>'<input type="radio" name="id2" value='.$row->displayName.'|'.$row->deptEntry->orgNameDisplay.'|'.$row->officeTel.'|'.$row->emailAddress.' id='.$row->userid.'|'.$row->deptEntry->ldapOrgCode.'>',
							'c1'=>$row->displayName,
							'c2'=>$row->officeTel,
							'c3'=>$row->emailAddress,
							'userid'=>$row->userid,
							'c4'=>$row->deptEntry->orgNameDisplay
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	public function subTreeDate(){
		$id = $_POST['id'];
		$pId = $_POST['pId'];
		$userid = $this->getUser()->getId();
		if($pId == '1'){
			$type= 'year';
		}else{
			$type= '';
		}
		$statusForTree = isset($_GET['statusForTree'])?$_GET['statusForTree']:'all';
		$proxy = $this->exec("getProxy", "escloud_usingformws");
		$map = array();
		$map['id'] = $id;
		$map['type'] =$type;
		$map['userid'] =$userid;
		$map['$statusForTree'] = $statusForTree;
		$res = $proxy->getTreeDates(json_encode($map));
		echo json_encode($res->data);
	}
	public function initTree(){
		$Nodes[] = array(
				'name'=>"北京东方飞扬软件股份有限公司",
				'pId'=>"-1",
				'id'=>'1',
				'isParent'=>true,
				'open'=>true
		);
		echo json_encode($Nodes);
	}
	public function form_json_new(){
		$pId = $_GET['pId'];
		$id = $_GET['id'];
		if($pId == null || $pId == ''){
			$type= 'all';
		}
		if($pId == '1' ){
			$type='year';
		}
		if($pId > 1 ){
			$type='mouth';
		}
		$map = array();
		$map['treeId'] = $id;
		$map['treePId'] = $pId;
		$map['type'] = $type;
		$userId=$this->getUser()->getId();
		$formdate=$this->exec('getProxy','escloud_usingformws');
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$statusForTree = isset($_GET['statusForTree'])?$_GET['statusForTree']:'all';
		if($statusForTree == 'all'){
			$statusForTree = isset($_POST['query']['statusForTree'])?$_POST['query']['statusForTree']:'all';
		}
		$start=($page-1)*$limit;
		$map['userid'] = $userId;
		$map['start'] = $start;
		$map['limit'] = $limit;
		$map['statusForTree'] = $statusForTree;
	
		$rows=$formdate->getListNew(json_encode($map));
		$total = $rows->total;
		if ($total==0){
			return;
		}
		$map1 = array();
		$map1['data'] = 'form';
		$res=$formdate->getUsingFieldId(json_encode($map1));
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows->data as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" id="'.$list->idreader.'" name="id" value='.$list->id.'>',
							'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->code,
							'c5'=>$list->reader,
							'c6'=>$list->dept,
							'c7'=>$list->tel,
							'c8'=>$list->email,
							'c9'=>$list->usepurpose,
							'c10'=>$list->validdate,
							'c11'=>$list->duration,
							'c12'=>$list->register,
							'c13'=>$list->registdate,
							'c14'=>$list->status,
							'c16'=>$list->identify,
							'c17'=>$list->fileCount,
							'c18'=>$list->innerFileCount,
							'c15'=>$list->description,
							'edit'=>isset($list->edit)?$list->edit:'true',
							'changeColor'=>isset($list->changeColor)?$list->changeColor:'false'
					)
			);
			foreach($res as $r){
				$r1 = str_replace('c','d',$r);
				$entry['cell'][$r1] = $list->$r;
			}
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author wangtao
	 * 获取列表内容
	 */
	public function set_json_new()
	{
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$itemPath = $request->getGet('itemPath');
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$prePath= isset($_GET['prePath']) ? $_GET['prePath'] : '';//用于获取卷内文件 $prePath当前树节点案卷级PATH
		$boxfile= isset($_GET['boxfile']) ? $_GET['boxfile'] : '';//用于判断是否是浏览盒内数据
		$radio = isset($_GET['radio'])?$_GET['radio']:'';//用于判断显示单选框还是复选框
		$file = isset($_GET['file'])?$_GET['file']:'';//用于判断是否为案卷
		$condition=array();
		$groupCondition=array();
		if(isset($query['condition'])){
			$condition=$query['condition'];//筛选条件
		}
		if(isset($query['groupCondition'])){
			$groupCondition=$query['groupCondition'];//分组条件
		}
		$rp = isset($rp) ? $rp : 20;
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$map1 = array();
		$map1['path'] = $path;
		$data=$proxy->getNewFields(json_encode($map1));
		$json=array();
		foreach ($data as $value)
		{
			$json[]=$value->name;
		}
		$arr=array('condition'=>$condition,'groupCondition'=>$groupCondition,'columns'=>$json,'parentPath'=>$prePath);
		$start=($page-1)*$rp;
		if(!empty($itemPath))
		{
			$path=$itemPath;
		}
		$userId=$this->getUser()->getId();
		$userId=!empty($userId)?$userId:0;
		if($boxfile){
			$path=preg_replace('/\_\d{1}/','',$path,1);//浏览盒内档案明细，可以查看当前盒内所有移交或者未移交的档案
		}
		$map2 = array();
		$map2['path'] = $path;
		$map2['userid'] = $userId;
		$map2['start'] = $start;
		$map2['limit'] = $rp;
		$map2['columnAndcondition'] =$arr;
		$data1=$proxy->getDataListNew(json_encode($map2));
		$rows=json_decode(json_encode($data1),true);
		$total = isset($rows['total'])?$rows['total']:0;
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
		if($boxfile){//查看盒内文件
			$operate='showBoxFile';
		}elseif ($file){//查看案卷
			$operate='modifyGenerate';
		}else {
			$operate='show_items';
		}
		//print_r($rows['dataList']); die;
		// del,ln属性用于删除标识是否有权限
		//liqiubo 20140517 下面的foreach循环中的input标签中的boxid属性的值改变，由id改为boxid
		foreach($rows['dataList'] AS $row){
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'ids'=> '<input boxid="'. $row['boxid'] .'" type="'.$type.'" name="path" class="selectone" del="'. $row['isDelete'] .'" ln="'. ($start+1) .'" value="'.$row["path"].'">',
							'operate'=> $row['isitemEdit'] === 'true' ? '<span class="editbtn" title="编辑" onclick='.$operate.'("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span>' : '',
							'relation'=>$row['relation']=='true'?1:'',
							'idParent'=>$row['idParent'],
							'bussystemid'=>$row['bussystemid'],
							//'boxid' => $row['boxid'],
					),
						
			);
		
			//destory 正在销毁  identify 正在鉴定  edit 正在鉴定 jie
			$destroystatusEn = array('destory','identify','edit','借出','');
			$destroystatusCh = array('正在销毁 ','正在鉴定','正在鉴定','借出','');
			foreach ($destroystatusEn as $n => $destroystatus)
			{
				 if($row['destroystatus'] == $destroystatus ){
				 	$entry['cell']['destroystatus'] = $destroystatusCh[$n];
					 if($row['destroystatus'] != ''){
					 	$entry['cell']['ids'] =$destroystatusCh[$n];
					 }
				 }
			}
			if($row['filecount']){
				$entry['cell']['operate'].='&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
			}
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
				$jsonData['rows'][] = $entry;
				$start++;
					
			}
			echo json_encode($jsonData);
			}
	public function getMaxArchiveCount(){
		$request=$this->getRequest();
		$id=$_POST['idm'];
		$idd = $_POST['idd'];
		$path=$_POST['path'];
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formData=$proxy->getItem($id);
		$userId = $formData->idreader;
		$map=array();
		$map['userid'] = $userId;
		$map['readerid'] = isset($_POST['readerId'])?$_POST['readerId']:$userId;
		$map['identity'] = isset($_POST['identity'])?$_POST['identity']:'';
		$map['readerName'] = isset($_POST['readerName'])?$_POST['readerName']:'';
		$map['path'] = $path;
		$map['id'] = $id;
		$map['idd'] = $idd;
		$data=$proxy->getMaxArchiveCount(json_encode($map));
		echo  json_encode($data);
	}
	public function updateDetailToOrder(){
		$ids = $_POST['ids'];
		$status = $_POST['status'];
		$userId = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$map=array();
		$map['ids'] = $ids;
		$map['userId'] = $userId;
		$map['status'] = $status;
		$map['reader'] = isset($_POST['readerId'])?$_POST['readerId']:'';
		$map['identity'] = isset($_POST['identity'])?$_POST['identity']:'';
		$map['readerName'] = isset($_POST['readerName'])?$_POST['readerName']:'';
		$data=$proxy->updateDetailToOrder(json_encode($map));
		echo $data;
	}
	public function getUsingFormField(){
		echo json_encode($resData);
	}
	public function getfieldData(){
		
		$map = array();
		$map['data'] ='form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData[$count] = array();
				$resData[$count]['id'] = $row->id;
				$resData[$count]['field'] = $row->field;
				$resData[$count]['type'] = $row->type;
				$resData[$count]['length'] = $row->length;
				$resData[$count]['doLength'] = $row->doLength;
				$resData[$count]['metadata'] = $row->metaData;
				$resData[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		
		$map1 = array();
		$map1['data'] ='store';
		$res1=$proxy->getUsingFieldForForm(json_encode($map1));
		$resData1 = array();
		if(isset($res1->data)){
			$count = 0;
			foreach($res1->data AS $row)
			{
				$resData1[$count] = array();
				$resData1[$count]['id'] = $row->id;
				$resData1[$count]['field'] = $row->field;
				$resData1[$count]['type'] = $row->type;
				$resData1[$count]['length'] = $row->length;
				$resData1[$count]['doLength'] = $row->doLength;
				$resData1[$count]['isNull'] = $row->isNull;
				$resData1[$count]['metadata'] = $row->metaData;
				if(isset($row->propValue)){
					$resData1[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData1[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData1[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		$r = array('form'=>$resData,'store'=>$resData1 );
		echo json_encode($r);
	}
	/**
	 * shimiao 20140624 查看消息提示信息
	 * @param unknown_type $map
	 */
	public function showMessageFormUsingForm(){
		$formCode = $_POST['formCode'];
		$id = $_POST['formId'];
		$storeId = $_POST['storeId'];
		$map = array();
		$map['data'] ='form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData2 = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData2[$count] = array();
				$resData2[$count]['id'] = $row->id;
				$resData2[$count]['field'] = $row->field;
				$resData2[$count]['type'] = $row->type;
				$resData2[$count]['length'] = $row->length;
				$resData2[$count]['doLength'] = $row->doLength;
				$resData2[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData2[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData2[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData2[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		
		$map1 = array();
		$map1['data'] ='store';
		$res1=$proxy->getUsingFieldForForm(json_encode($map1));
		$resData1 = array();
		if(isset($res1->data)){
			$count = 0;
			foreach($res1->data AS $row)
			{
				$resData1[$count] = array();
				$resData1[$count]['id'] = $row->id;
				$resData1[$count]['field'] = $row->field;
				$resData1[$count]['type'] = $row->type;
				$resData1[$count]['length'] = $row->length;
				$resData1[$count]['doLength'] = $row->doLength;
				$resData1[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData1[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData1[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData1[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
		
				$count ++;
			}
		}
		$item = array();
		$item['form']=$resData2;
		$item['store'] = $resData1;
		$item['formId'] = $id;
		return $this->renderTemplate($item);
		
	}
	/**
	 * shimiao 20140624 查看消息提示信息
	 * @param unknown_type $map
	 */
	public function showMessageForRegister(){
		$formCode = $_POST['formCode'];
		$id = $_POST['formId'];
		$storeId = $_POST['storeId'];
		$map = array();
		$map['data'] ='form';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$resData2 = array();
		if(isset($res->data)){
			$count = 0;
			foreach($res->data AS $row)
			{
				$resData2[$count] = array();
				$resData2[$count]['id'] = $row->id;
				$resData2[$count]['field'] = $row->field;
				$resData2[$count]['type'] = $row->type;
				$resData2[$count]['length'] = $row->length;
				$resData2[$count]['doLength'] = $row->doLength;
				$resData2[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData2[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData2[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData2[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
	
				$count ++;
			}
		}
	
		$map1 = array();
		$map1['data'] ='store';
		$res1=$proxy->getUsingFieldForForm(json_encode($map1));
		$resData1 = array();
		if(isset($res1->data)){
			$count = 0;
			foreach($res1->data AS $row)
			{
				$resData1[$count] = array();
				$resData1[$count]['id'] = $row->id;
				$resData1[$count]['field'] = $row->field;
				$resData1[$count]['type'] = $row->type;
				$resData1[$count]['length'] = $row->length;
				$resData1[$count]['doLength'] = $row->doLength;
				$resData1[$count]['isNull'] = $row->isNull;
				if(isset($row->propValue)){
					$resData1[$count]['propValue'] = array();
					$t = 0;
					foreach($row->propValue AS $data){
						$resData1[$count]['propValue'][$t]['title'] = $data->ESTITLE;
						$resData1[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
						$t ++;
					}
				}
	
				$count ++;
			}
		}
		$item = array();
		$item['form']=$resData2;
		$item['store'] = $resData1;
		$item['formId'] = $id;
		return $this->renderTemplate($item);
	
	}
	
	public function form_jsonForUsingForm(){
		$formId = $_GET['formId'];
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$list=$proxy->getItem($formId);
		$map = array();
		$map['data'] = 'form';
		$res=$proxy->getUsingFieldId(json_encode($map));
		$jsonData = array('page'=>1,'total'=>1,'rows'=>array());
		$entry=array(
				'id'=>$list->id,
				'cell'=>array(
						'id'=>'<input type="checkbox" id="'.$list->idreader.'" name="id" value='.$list->id.'|'.$list->idreader.'>',
						'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
						'c4'=>$list->code,
						'c5'=>$list->reader,
						'c6'=>$list->dept,
						'c7'=>$list->tel,
						'c8'=>$list->email,
						'c9'=>$list->usepurpose,
						'c10'=>$list->validdate,
						'c11'=>$list->duration,
						'c12'=>$list->register,
						'c13'=>$list->registdate,
						'c14'=>$list->status,
						'c16'=>$list->identify,
						'c17'=>$list->fileCount,
						'c18'=>$list->innerFileCount,
						'c15'=>$list->description,
						'readerId'=>$list->idreader
				)
		);
		foreach($res as $r){
			$r1 = str_replace('c','d',$r);
			$entry['cell'][$r1] = $list->$r;
		}
		$jsonData['rows'][]=$entry;
		echo json_encode($jsonData);
	}
	
	public function showDetailsFormUsing(){
		$formId = $_GET['formId'];
		$map = array();
		$map['formId'] = $formId;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$map['start'] = $start;
		$map['limit'] = $limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$lists=$proxy->showDetailsFormUsing(json_encode($map));
		$map = array();
		$map['data'] = 'store';
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		
		$total=$lists->total;
		if($total>0){
			$i=1;
			$num=$start+1;
			$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
			foreach($lists->data AS $row){
// 				if($row->READ_TYPE=="电子借阅"){
// 					$check1="checked";$check2=false;$check3=false;
// 				}elseif($row->READ_TYPE=="实体借阅"){
// 					$check2="checked";$check1=false;$check3=false;
// 				}elseif($row->READ_TYPE=="实体借出"){
// 					$check3="checked";$check1=false;$check2=false;
// 				}
				$pp='';
				if($row->PATH==''){
					$pp=$row->ID;
				}else{
					$pp=$row->PATH;
				}
				$entry = array(
						'id'=>$i,
						'cell'=>array(
								'num'=>$num++,
								'id3'=>"<input type='checkbox' name='id3' id='".$row->ID."' value='".$row->ID."'/>",
								'c3'=>$row->ARCHIVE_CODE,
								'c4'=>$row->TITLE,
								'c5'=>$row->READ_TYPE,
								'c6'=>$row->STATUS,
								'c8'=>$row->DATE,
								'c9'=>$row->FILECOUNT,
								'c10'=>$row->INNERFILECOUNT,
								'path'=>$row->PATH,
								'c7'=>$row->DESCRIPTION,
								'shouldReturnDate'=>$row->shouldReturnDate
						)
						);
				if(isset($res->data)){
					foreach($res->data AS $r)
					{
						$rr = 'c'.$r->id;
						$r1 = 'd'.$r->id;
						$entry['cell'][$r1] = $row->$rr;
					}
				}
					$i++;
					$jsonData['rows'][] = $entry;
			}
				echo json_encode($jsonData);
		}
	}
	public function checkCanLendArchive(){
		//{readerId:readerId,formId:formId,ids:ids}, 
		$readId = $_POST['readerId'];
		//identify:identify,readerName:readerName
		$identify = $_POST['identity'];
		$readerName = $_POST['readerName'];
		$formId = $_POST['formId'];
		$ids = $_POST['ids'];
		$map = array();
		$map['userid'] = $readId;
		$map['identity']=$identify;
		$map['readerName'] = $readerName;
		$map['formId'] = $formId;
		$map['detailIds'] = $ids;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->checkCanLendArchive(json_encode($map));
		echo json_encode($res);
	}
	public function checkOrderPath(){
		$path = $_POST['paths'];
		$readerId = $_POST['readerId'];
		$formId = $_POST['formId'];
		$identify = $_POST['identity'];
		$readerName = $_POST['readerName'];
		$map = array();
		$map["paths"] = $path;
		$map['identity']=$identify;
		$map['readerName'] = $readerName;
		$map['readerId'] = $readerId;
		$map['formId'] = $formId;
		$map['userId'] = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->checkOrderPath(json_encode($map));
		echo json_encode($res);
	}
	public function getFormDataOfPath(){
		$path = $_GET['path'];
		$userId = $this->getUser()->getId();
		$map = array();
		$map['userId'] = $userId;
		$map['path'] = $path;
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$map['start'] = $start;
		$map['limit'] = $limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$lists=$proxy->getFormDataOfPath(json_encode($map));
		$map['data'] = 'form';
		$res=$proxy->getUsingFieldId(json_encode($map));
		$total=$lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
		foreach($lists->data as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" id="'.$list->idreader.'" name="boxForForm" value='.$list->id.'|'.$list->path.'|'.$list->idreader.'|'.$list->storeId.'  >',
							'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_FormUsingData('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->code,
							'c5'=>$list->reader,
							'c6'=>$list->dept,
							'c7'=>$list->tel,
							'c8'=>$list->email,
							'c9'=>$list->usepurpose,
							'c10'=>$list->validdate,
							'c11'=>$list->duration,
							'c12'=>$list->register,
							'c13'=>$list->registdate,
							'c14'=>$list->status,
							'c16'=>$list->identify,
							'c17'=>$list->fileCount,
							'c18'=>$list->innerFileCount,
							'c15'=>$list->description,
							'hasDetail'=>$lists->hasDetail
					)
			);
			foreach($res as $r){
				$r1 = str_replace('c','d',$r);
				$entry['cell'][$r1] = $list->$r;
			}
			$jsonData['rows'][]=$entry;
		}
		}
		echo json_encode($jsonData);
	}
	public function showOrderPaths(){
		$userId = $this->getUser()->getId();
		$type = $_GET['type'];
		$map = array();
		$map['userId'] = $userId;
		$map['type'] = $type;
		$map['bigOrgId']= $this->getClientIp();
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$map['start'] = $start;
		$map['limit'] = $limit;
		$map['ipStr'] = $this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->showOrderPaths(json_encode($map));
		$total=$res->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			$row = 0;
			foreach($res->list as $list){
			$entry=array(
					'id'=>$row+1,
					'cell'=>array(
						'num'=>$row+1,
			  			'box'=>'<input type="radio" name="orderCheck"  value="'.$list->path.'" onChange="changeOrderForAllForm(\''.$list->path.'\')" />',
						'path'=>$list->path,
						'title'=>$list->title,
						'code'=>$list->archiveCode,
						'status'=>'预约'
					)
				);
			$row++;
			$jsonData['rows'][]=$entry;
		}
	}
	echo json_encode($jsonData);
}
/**
 * @author yzh
 * 借阅管理的数据显示操作
 */
public function form_json_keyWord(){
	$userId=$this->getUser()->getId();
	$formdate=$this->exec('getProxy','escloud_usingformws');
	$page = isset($_POST['page']) ? $_POST['page'] : 1;
	$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
	$start=($page-1)*$limit;
	$noUser = isset($_GET['noUser'])?$_GET['noUser']:'';
	$keyWord = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
	$statusForTree = isset($_POST['query']['statusForTree'])?$_POST['query']['statusForTree']:'all';
	$formCondition = isset($_GET['formCondition'])?$_GET['formCondition']:'';
	$map = array();
	if($formCondition!=""){
		$listw=explode("|",$formCondition);
		$map['conditionStr'] = $listw;
	}
	$pId = isset($_GET['pId'])?$_GET['pId']:'';
	$id = isset($_GET['id'])?$_GET['id']:'';
	if($pId == '1' ){
		$type='year';
		$map['type'] = $type;
		$map['treePId'] = $pId;
		$map['treeId'] = $id;
	}
	if($pId > 1 ){
		$type='mouth';
		$map['type'] = $type;
		$map['treePId'] = $pId;
		$map['treeId'] = $id;
	}
	$map['start'] = $start.'';
	$map['limit'] = $limit.'';
	$map['noUser'] = $noUser;
	$map['userid'] = $userId.'';
	$map['keyWord'] = $keyWord;
	$map['statusForTree'] = $statusForTree;
	$resData=$formdate->getList_keyword(json_encode($map));
	$map = array();
	$map['data'] = 'form';
	$res=$formdate->getUsingFieldId(json_encode($map));
	$total=$resData->total;
	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
	if($total > 0){
		$num  = 1 ;
		foreach($resData->list as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" id="'.$list->idreader.'" name="id" value='.$list->id.'>',
							'num'=>$num,
							'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->code,
							'c5'=>$list->reader,
							'c6'=>$list->dept,
							'c7'=>$list->tel,
							'c8'=>$list->email,
							'c9'=>$list->usepurpose,
							'c10'=>$list->validdate,
							'c11'=>$list->duration,
							'c12'=>$list->register,
							'c13'=>$list->registdate,
							'c14'=>$list->status,
							'c16'=>$list->identify,
							'c17'=>$list->fileCount,
							'c18'=>$list->innerFileCount,
							'c15'=>$list->description,
							'edit'=>isset($list->edit)?$list->edit:'true',
							'changeColor'=>isset($list->changeColor)?$list->changeColor:'false'
					)
			);
			foreach($res as $r){
				$r1 = str_replace('c','d',$r);
				$entry['cell'][$r1] = $list->$r;
			}
			$jsonData['rows'][]=$entry;
			$num++;
		}
	}
	echo json_encode($jsonData);
}
/**
 * @author yzh
 * 借阅管理的数据显示操作
 */
public function store_json_keyWord(){
	$formdate=$this->exec('getProxy','escloud_usingformws');
	$page = isset($_POST['page']) ? $_POST['page'] : 1;
	$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
	$start=($page-1)*$limit;
	$noUser = isset($_GET['noUser'])?$_GET['noUser']:'';
	$keyWord = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
	$formCondition = isset($_GET['storeCondition'])?$_GET['storeCondition']:'';
	$map = array();
	if($formCondition!=""){
		$listw=explode("|",$formCondition);
		$map['conditionStr'] = $listw;
	}
	$map['start'] = $start.'';
	$map['limit'] = $limit.'';
	$map['keyWord'] = $keyWord;
	$resData=$formdate->getList_store_keyword(json_encode($map));
	$map = array();
	$map['data'] = 'store';
	$res=$formdate->getUsingFieldId(json_encode($map));
	$total=$resData->total;
	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
	if($total > 0){
		$num = 1;
		foreach($resData->list as $row){
			$entry=array(
					'id'=>$row->ID,
					'cell'=>array(
							'num'=>$num,
							'c3'=>$row->ARCHIVE_CODE,
							'c4'=>$row->TITLE,
							'c5'=>$row->PATH!=''?$row->READ_TYPE:'实体借出',
							'c6'=>$row->STATUS,
							'c8'=>$row->DATE,
							'c9'=>$row->FILECOUNT,
							'c10'=>$row->INNERFILECOUNT,
							'path'=>$row->PATH,
							'c7'=>$row->DESCRIPTION,
					)
			);
			foreach($res as $r){
				$r1 = str_replace('c','d',$r);
				$entry['cell'][$r1] = $row->$r;
			}
			$jsonData['rows'][]=$entry;
			$num++;
		}
	}
	echo json_encode($jsonData);
}
public function filterStore(){
	$map = array();
	$map['data'] ='store';
	$proxy=$this->exec('getProxy','escloud_usingformws');
	$res=$proxy->getUsingFieldForForm(json_encode($map));
	$resData = array();
	if(isset($res->data)){
		$count = 0;
		foreach($res->data AS $row)
		{
			$resData[$count] = array();
			$resData[$count]['id'] = $row->id;
			$resData[$count]['field'] = $row->field;
			$resData[$count]['type'] = $row->type;
			$resData[$count]['length'] = $row->length;
			$resData[$count]['doLength'] = $row->doLength;
			$resData[$count]['metadata'] = $row->metaData;
			$resData[$count]['isNull'] = $row->isNull;
			if(isset($row->propValue)){
				$resData[$count]['propValue'] = array();
				$t = 0;
				foreach($row->propValue AS $data){
					$resData[$count]['propValue'][$t]['title'] = $data->ESTITLE;
					$resData[$count]['propValue'][$t]['identifier'] = $data->ESIDENTIFIER;
					$t ++;
				}
			}

			$count ++;
		}
	}
	return $this->renderTemplate(array('data'=>$resData));
}
public function endUsingForm(){
	$id = $_GET['id'];
	$proxy=$this->exec('getProxy','escloud_usingformws');
	$res=$proxy->endUsingForm($id);
	/** guolanrui 20140901 记录日志 start **/
	$logProxy=$this->exec('getProxy','escloud_logservice');
	$userId=$this->getUser()->getId();
	$map=array();
	$map['userid'] = $userId;
	$map['module'] = '借阅管理';
	$map['type'] = 'operation';
	$map['ip'] = $this->getClientIp();
	$map['loginfo'] = '借阅管理，结束id为'.$id.'的单子';
	$map['operate'] = '借阅管理：结束';
	$logProxy->saveLog(json_encode($map));
	/** guolanrui 20140901 记录日志 end **/
	echo json_encode($res);
}
public function relendForForm(){
	$id = $_GET['id'];
	$proxy=$this->exec('getProxy','escloud_usingformws');
	$res=$proxy->relendForForm($id);
	//wanghongchen 20140930 获取userId
	$userId = $this->getUser()->getId();
	/** guolanrui 20140901 记录日志 start **/
	$logProxy=$this->exec('getProxy','escloud_logservice');
	$logMap=array();
	$logMap['userid'] = $userId;
	$logMap['module'] = '借阅管理';
	$logMap['type'] = 'operation';
	$logMap['ip'] = $this->getClientIp();
	$logMap['loginfo'] = '借阅管理，续借借阅单ID为【'.$id.'】的档案';
	$logMap['operate'] = '借阅管理：续借';
	$logProxy->saveLog(json_encode($logMap));
	/** guolanrui 20140901 记录日志 end **/
	echo json_encode($res);
}
public function returnForForm(){
	$id = $_GET['id'];
	$proxy=$this->exec('getProxy','escloud_usingformws');
	$map = array();
	$map['id'] = $id;
	$map['userId'] = $this->getUser()->getId();
	$res=$proxy->returnForForm(json_encode($map));
	/** guolanrui 20140901 记录日志 start **/
	$logProxy=$this->exec('getProxy','escloud_logservice');
	$logMap=array();
	$logMap['userid'] = $this->getUser()->getId();
	$logMap['module'] = '借阅管理';
	$logMap['type'] = 'operation';
	$logMap['ip'] = $this->getClientIp();
	$logMap['loginfo'] = '借阅管理，归还借阅单ID为【'.$id.'】的档案';
	$logMap['operate'] = '借阅管理：归还';
	$logProxy->saveLog(json_encode($logMap));
	/** guolanrui 20140901 记录日志 end **/
	echo json_encode($res);
}
public function directForLendUsingForm(){
	$request=$this->getRequest();
	$data=$request->getPost();
	parse_str($data['data'],$output);
	if(!isset($_POST['IreaderD'])) return ;
	$IreaderD=$_POST['IreaderD'];
	$userId=$this->getUser()->getId();
	$items=array();
	$readerId =isset($output['readerid'])?$output['readerid']:'';
	$readerName = isset($output['reader'])?$output['reader']:'';
	$identity = isset($output['identity'])?$output['identity']:'';
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
	if(empty($output)) return false;
	if($IreaderD==0){
		$output['readerid']='';
		$output['deptcode']='';
	}
	$map = array();
	$map['data'] = 'form';
	$proxy=$this->exec('getProxy','escloud_usingformws');
	$res=$proxy->getUsingFieldId(json_encode($map));
	$usingform=array(
			'registerid'=>$userId,
			'readerid'=>isset($output['readerid'])?$output['readerid']:'',
			'reader'=>isset($output['reader'])?$output['reader']:'',
			'deptcode'=>isset($output['deptcode'])?$output['deptcode']:'',
			'dept'=>isset($output['dept'])?$output['dept']:'',
			'tel'=>isset($output['tel'])?$output['tel']:'',
			'email'=>isset($output['email'])?$output['email']:'',
			'usepurpose'=>$output['usepurpose'],
			'validdate'=>$output['validdate'],
			'register'=>$output['register'],
			'registdate'=>$output['registdate'],
			'identity'=>isset($output['identity'])?$output['identity']:'',
			'status'=>'未结束',
			'description'=>isset($output['description'])?$output['description']:''
	);
	foreach($res as $r){
		$usingform[$r] = isset($output[$r])?$output[$r]:'';
	}
	$paths = $_POST['paths'];
	$otherValue = $_POST['oValues'];
	$rows=explode(',', $paths);
	$values=explode(',', $otherValue);
	$fileCout = 0;
	$innerFileCount = 0;
	$idParents = '';
	$status = $_POST['status'];
	$jsonData = array('usingform'=>$usingform,'usingdetail'=>array(),'fileCount'=>array(),
			'userid'=>$userId,'operation'=>'添加','operationdetail'=>'添加借阅管理表单数据',
			'status'=>$status,'countForD'=>count($rows).'','readerId'=>$readerId,
			'readerName'=>$readerName,'identity'=>$identity,'checkPaths'=>'');
	$count =0;
	$checkPaths = '';
	foreach($rows as $row){
		$list=explode('|', $row);
		$usingdetail=array(
				'archivecode'=>$list[0],
				'title'=>$list[1],
				'readtype'=>$list[3],
				'description'=>$list[2],
				'path'=>$list[4],
				'archivetype'=>$list[5],
				'fileCount'=>$list[6],
				'innerFileCount'=>$list[7],
				'status'=>'未借阅'
		);
		$checkPaths = $checkPaths.'|'.$list[4];
		$flag = count(explode('/,',$list[4]))==4?false:true;
		if($flag){
			$usingdetail['idParent'] = $list[8];
		}else{
			$usingdetail['idParent'] = '-1';
		}
		$v = explode('|',$values[$count]);
		for($t =0;$t<count($v);$t++){
			$v1 = explode(':',$v[$t]);
			$usingdetail[$v1[0]] = isset($v1[1])?$v1[1]:'';
		}
		$count ++;
		$jsonData['usingdetail'][]=$usingdetail;
	}
	if(''!=$checkPaths){
		$jsonData['checkPaths'] = substr($checkPaths,1);
	}
	$jsonData = json_encode($jsonData);
	$proxy=$this->exec('getProxy','escloud_usingformws');
	$formdate=$proxy->directForLendUsingForm($jsonData);
	/** guolanrui 20140901 记录日志 start **/
	$logProxy=$this->exec('getProxy','escloud_logservice');
	$logMap=array();
	$logMap['userid'] = $userId;
	$logMap['module'] = '借阅管理';
	$logMap['type'] = 'operation';
	$logMap['ip'] = $this->getClientIp();
	$logMap['loginfo'] = '借阅管理，添加借阅单->直接'.$status;
	$logMap['operate'] = '借阅管理：添加->直接'.$status;
	$logProxy->saveLog(json_encode($logMap));
	/** guolanrui 20140901 记录日志 end **/
	
	echo json_encode($formdate);
}
}?>
