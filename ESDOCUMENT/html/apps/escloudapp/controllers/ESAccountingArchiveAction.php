<?php
/**
 * 会计档案借阅
 * @author yuanzhonghua
 * @date   2013-07-02
 *
 */
class ESAccountingArchiveAction extends ESActionBase{
	/**
	 * @author yzh
	 * 跳到指定的会计档案借阅主页面
	 * @return string
	 */
	public function index()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author yzh
	 * 跳到指定的添加会计档案借阅单页面
	 * 
	 */
	public function add()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author yzh   201307
	 * @date   201307
	 * 执行添加借阅管理表单数据操作
	 */
	public function addAccountForm()
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
		$usingform=array(
			'registerid'=>$userId,
			'readerid'=>isset($output['readerid'])?$output['readerid']:'',
			'reader'=>isset($output['reader'])?$output['reader']:'',
			'deptcode'=>isset($output['deptcode'])?$output['deptcode']:'',
			'dept'=>isset($output['dept'])?$output['dept']:'',
			'tel'=>isset($output['tel'])?$output['tel']:'',
			'email'=>isset($output['email'])?$output['email']:'',
			'usepurpose'=>$output['usepurpose'],
			'duration'=>$output['validdate'],
			'register'=>$output['register'],
			'registdate'=>$output['registdate'],
			'status'=>'完成',
			//'status'=>$output['status'],
			'description'=>isset($output['description'])?$output['description']:''
		);
		if(isset($_POST['paths'])){
			$paths = $_POST['paths'];
			$rows=explode(',', $paths);
			$jsonData = array('usingform'=>$usingform,'usingdetail'=>array(),'userid'=>$userId,'operation'=>'添加','operationdetail'=>'添加借阅管理表单数据');
			foreach($rows as $row){
				$list=explode('|', $row);
				$usingdetail=array(
						'archivecode'=>$list[0],
						'title'=>$list[1],
						'readtype'=>$list[3],
						'description'=>$list[2],
						'path'=>$list[4],
						'archivetype'=>$list[5],
						'status'=>'未借阅'
				);
				$jsonData['usingdetail'][]=$usingdetail;
			}
		}else{
			$jsonData = array('usingform'=>$usingform,'userid'=>$userId,'operation'=>'添加','operationdetail'=>'添加借阅管理表单数据');
		}
		$jsonData = json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formdate=$proxy->addAccountForm($jsonData);
		echo $formdate;
	}
	/**
	 * @author yzh  201307
	 * @date   201307
	 * 借阅管理的数据显示操作
	 */
	public function account_json(){
		$userId=$this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$orgid=$userInfo->deptEntry->orgid;
		$formdate=$this->exec('getProxy','escloud_usingformws');
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$lists=$formdate->getAccountList($orgid,$start,$limit);
		if ($lists->list==""){
			return;
		}
		$total=$lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($lists->list as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" id="'.$list->id_reader.'" name="id" value='.$list->id.'>',
							'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->code,
							'c5'=>$list->reader,
							'c6'=>$list->dept,
							'c7'=>$list->tel,
							'c8'=>$list->email,
							'c9'=>$list->use_purpose,
							'c10'=>$list->duration,
							'c11'=>$list->valid_date,
							'c12'=>$list->register,
							'c13'=>$list->regist_date,
							'c14'=>$list->status,
							'c15'=>$list->description
					)
			);
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * @author yzh  201307
	 * 会计档案借阅删除操作
	 */
	public function delAccountBorrowList(){
		$userId=$this->getUser()->getId();
		$id=$_GET['id'];
		$lists = explode(",", $id);
		$jsonData = array('userid'=>$userId,'ids'=>array());
		foreach($lists as $list){
			$jsonData['ids'][]=$list;
		}
		$jsonData=json_encode($jsonData);
		$proxy=$this->exec("getProxy","escloud_usingformws");
		$del=$proxy->delAccountList($jsonData);
		echo $del;
	}
	/**
	 * @author yzh   201307
	 * 实现筛选借阅管理表单功能
	 */
	public function filterAccount_sql(){
		$userId=$this->getUser()->getId();
		$sql_string=$_GET['sql'];
		if($sql_string=="")return;
		$listw=explode("|",$sql_string);
		$listw=json_encode($listw);
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$proxy = $this->exec('getProxy','escloud_usingformws');
		$lists=$proxy->filterAccountBorrow($userId,$start,$limit,$listw);
		if ($lists==""){
			return;
		}
		$total=$lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($lists->list as $list){
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id" value='.$list->id.'>',
							'c3'=>'<span class="editbtn" onclick=show_items('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->code,
							'c5'=>$list->reader,
							'c6'=>$list->dept,
							'c7'=>$list->tel,
							'c8'=>$list->email,
							'c9'=>$list->use_purpose,
							'c10'=>$list->duration,
							'c11'=>$list->valid_date,
							'c12'=>$list->register,
							'c13'=>$list->regist_date,
							'c14'=>$list->status,
							'c15'=>$list->description
					)
			);
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author yzh  201307
	 * 会计档案借阅表单的打印
	 */
	public function getAcBorrowDataByBorrowModel(){
		$borrowModel=$_GET['borrowModel'];
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$data=$proxy->getReportIdByReporttype($borrowModel);
		echo json_encode($data);
	}
	/**
	 * @author yzh   201307
	 * 会计档案借阅报表打印
	 */
	public function printAccountBorrowPage(){
		$borrowId=$_POST['borrowId'];
		$borrowType=$_POST['borrowType'];
		$reportTitle=$_POST['reportTitle'];
		$ids=explode(',',$_POST['ids']);
		$userId = $this->getUser()->getId();
		if(empty($userId)) exit(null);
			$param=array(
				'userid'=>$userId,
				"ids"=>$ids,
 				"reportId"=>$borrowId,
				 "reportType"=>$borrowType,
				 "reportTitle"=>$reportTitle
		
		);
		$proxy=$this->exec("getProxy","escloud_reportservice");
		$addr=$proxy->printAccountBorrowForm(json_encode($param));
		echo $addr;
	}
	/**
	 * 查询借阅报表文件
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
				@$info[$i]->downurl = '<a onclick="openUrl(this)" title="下载借阅报表" target="_blank" href="javascript:void(0);" path_data="'.($info[$i]->address).'" path_id="'.$info[$i]->id.'">点击下载</a>';
			}
		}
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>$info);
		echo json_encode($jsonData);
		exit;
	}
	
	/**
	 * 修改打印借阅报表生成的文件的下载状态
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
	 * @date   201307
	 * @author yzh
	 * 编辑借阅管理表单数据
	 */
	public function eidtAccountBorrow(){
		$request=$this->getRequest();
		$id=$request->getGet('idm');
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formData=$proxy->getAccountItem($id);
		$start=0;
		$limit=50;
		$rows=$proxy->getAccountDetails($id,$start,$limit);
		$arType='';
		if(count($rows->list)!=0){
			foreach($rows->list as $val){
				if($val->archive_type!=''){
					$arType=$val->archive_type;
					break;
				}
			}
		}
		$item=array(
			'readerid'=>$formData->id_reader,
			'reader'=>$formData->reader,
			'deptcode'=>$formData->id_dept,
			'dept'=>$formData->dept,
			'tel'=>$formData->tel,
			'email'=>$formData->email,
			'usepurpose'=>$formData->use_purpose,
			'validdate'=>$formData->duration,
			'register'=>$formData->register,
			'registdate'=>$formData->regist_date,
			'status'=>$formData->status,
			'description'=>$formData->description,
			'arType'=>$arType
		);
		return $this->renderTemplate($item,'ESAccountingArchive/modify');
	}
	/**
	 * @date   201307
	 * @author yzh
	 * 编辑借阅表单管理数据时显示借阅明细
	 */
	public function showDetails(){
		$request=$this->getRequest();
		$id=$request->getGet('idm');
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$rows=$proxy->getAccountDetails($id,$start,$limit);
		//var_dump($rows);exit;
		$total=$rows->total;
		$i=1;
		$num=$start+1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows->list AS $row){
			if($row->read_type=="电子借阅"){
				$check1="checked";$check2=false;$check3=false;
			}elseif($row->read_type=="实体借阅"){
				$check2="checked";$check1=false;$check3=false;
			}elseif($row->read_type=="实体借出"){
				$check3="checked";$check1=false;$check2=false;
			}
			$pp='';
			if($row->espath==''){
				$pp=$row->id;
			}else{
				$pp=$row->espath;
			}
			$entry = array(
					'id'=>$i,
					'cell'=>array(
							'num'=>$num++,
							'id3'=>"<input type='checkbox' name='id3' id='".$row->id."' value='".$row->espath."|".$row->id_using_form_account."|".$row->archive_type."'/>",
							'c3'=>$row->archive_code,
							'c4'=>$row->title,
							'c5'=>$row->espath!=''?'<input type="radio" name='.$pp.' '.$check1.' value="电子借阅"/>电子借阅<input type="radio" name='.$pp.' '.$check2.' value="实体借阅"/>实体借阅<input type="radio" name='.$pp.' '.$check3.' value="实体借出"/>实体借出':'<input type="radio" name='.$pp.' '.$check2.' value="实体借阅"/>实体借阅<input type="radio" name='.$pp.' '.$check3.' value="实体借出"/>实体借出',
							'c6'=>$row->status,
							'c8'=>$row->regist_date,
							'c7'=>'<input name="mark" type="text" size="12" value="'.$row->description.'" placeholder="请填写备注"/>'
					)
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
			echo json_encode($jsonData);
	}
	/**
	 * @author yzh  201307
	 * 改变会计档案借阅列表的相关明细
	 */
	public function changeAccountLinkDetails(){
		$userId=$this->getUser()->getId();
		if(!isset($_POST['details'])) return ;
		$details = $_POST['details'];
		$rows=explode(',', $details);
		$jsonDate=array('userid'=>$userId,'usingdetail'=>array());
		foreach($rows as $row){
			$list=explode('|', $row);
			$usingdetail=array(
				'id'=>$list[0],
				'status'=>$list[1],	
				'description'=>$list[2],
				'path'=>$list[3],
				'readtype'=>$list[4]
			);
			$jsonDate['usingdetail'][]=$usingdetail;
		}
		$jsonDate=json_encode($jsonDate);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$detailsdate=$proxy->changeAccountDetails($jsonDate);
		echo $detailsdate;
	}
	/**
	 * @author yzh  201307
	 * 保存修改后的借阅管理表单数据
	 */
	public function saveAccountModify(){
		$userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost();
		$id=$request->getGet('idm');
		if(!isset($_POST['IreaderD'])) return ;
		$IreaderD=$_POST['IreaderD'];
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
				'id_reader'=>isset($output['readerid'])?$output['readerid']:'',
				'reader'=>isset($output['reader'])?$output['reader']:'',
				'id_dept'=>isset($output['deptcode'])?$output['deptcode']:'',
				'dept'=>isset($output['dept'])?$output['dept']:'',
				'tel'=>isset($output['tel'])?$output['tel']:'',
				'email'=>isset($output['email'])?$output['email']:'',
				'use_purpose'=>$output['usepurpose'],
				'duration'=>$output['validdate'],
				'id'=>$id,
				'description'=>isset($output['description'])?$output['description']:''
		);
		if(isset($_POST['paths'])){
			$jsonData = array('usingform'=>$item,'usingdetail'=>array());
			$paths=$_POST['paths'];
			$rows=explode(',',$paths);
			foreach($rows as $row){
				$list=explode('|',$row);
				if($list[0]=='undefined'){$list[0]='';}
				$index=array(
						'id'=>$list[0],
						'read_type'=>$list[1],
						'description'=>$list[2],
						'archive_code'=>$list[3],
						'title'=>$list[4],
						'espath'=>$list[5],
						'status'=>$list[6],
						'archive_type'=>$list[7]
				);
				$jsonData['usingdetail'][]=$index;
			}
		}else{
			$jsonData = array('usingform'=>$item);
		}
		$jsonDate=json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$formdate=$proxy->saveAccountForm($userId,$jsonDate);
		echo $formdate;
	}
	/**
	 * @author yzh 201307
	 * 获得整理编目文档类型树
	 */
	public function getTree()
	{
		$proxy = $this->exec('getProxy','escloud_businesstreews');
		$status = $_GET['status'];//获取当前业务的状态
		$userId = $this->getUser()->getId();
		$treelist = $proxy->getBusinessAuthorTree('1',$status,$userId);
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
	 * @author yzh 201307
	 * 在页面上显示著录明细
	 */
	public function datalist(){
		$path=$_GET['path'];
		$fields=$this->getFields($path,'string');
		return $this->renderTemplate(array('fields'=>$fields,'path'=>$path));
	}
	/**
	 * 201307
	 * 获取列表内容
	 */
	public function set_json()
	{
		if(!isset($_GET['keyword'])) return ;
		$keyword=$_GET['keyword'];
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
		if(empty($query)){
			$query=array();
		}else{
			$temp=explode('@',rtrim($query,'@'));
			$query=$temp;
		}
		$rp = isset($rp) ? $rp : 20;
		$json=$this->getFields($path,'array');
		$arr=array('keyword'=>$keyword,'columns'=>$json,'parentPath'=>$prePath);
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
							'operate'=>$boxfile?'<span title="编辑" class="editbtn" onclick=showBoxFile("'.$row["path"].'")>&nbsp;</span></a>&nbsp;&nbsp;<span title ="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>':'<span class="editbtn" title="编辑档案" onclick=show_items("'.$row["path"].'")>&nbsp;</span></a>&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>',
							'relation'=>$row['relation']=='true'?1:'',
							'bussystemid'=>$row['bussystemid']
					),
					'classname'=>$row['relation']=='true'?'flag':''
			);
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
	 * 201307
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
	 * 201307
	 * 获取相关文件的字段值
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
	 * @date   201307
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
		$rows=explode(',', $files);
		$jsonData = array('usingformid'=>$usingformid,'usingdetaillist'=>array());
		foreach($rows as $row){
			$list=explode('|', $row);
			$usingdetaillist=array(
					'archive_code'=>$list[0],
					'title'=>$list[1],
					'espath'=>$list[2],
					'archive_type'=>$archiveType,
					'read_type'=>'电子借阅',
					'status'=>'未借阅',
					'description'=>''
			);
			$jsonData['usingdetaillist'][]=$usingdetaillist;
		}
		$jsonDate=json_encode($jsonData);
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$result=$proxy->addAccountDetails($jsonDate);
		echo $result;
	}
	/**
	 * @author yzh  201307
	 * 编辑借阅明细时,批量删除不需要的数据
	 */
	public function delAccountDetails(){
		$ids=$_GET['ids'];
		$lists = explode(",", $ids);
		$jsonData=json_encode($lists);
		$proxy=$this->exec("getProxy","escloud_usingformws");
		$del=$proxy->delAccountDetails($jsonData);
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
		$rows=$proxy->getAccountDetails($idm,$start,$limit);
		$total=$rows->total;
		echo $total;
	}
	/**
	 * @author yzh
	 * @date   20130903
	 * 根据元数据名获取著录项
	 */
	public function getTagByMetadata(){
		$userId = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$userInfo->mainSite;
		$arType=$_POST['arType'];
		$ACodeMeta=$_POST['ACodeMeta'];
		$titleMeta=$_POST['titleMeta'];
		$list=array($ACodeMeta,$titleMeta);
		$list=json_encode($list);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->getTagNameByMetadata($mainsite,$arType,$list);
		echo json_encode($result);
	}
}