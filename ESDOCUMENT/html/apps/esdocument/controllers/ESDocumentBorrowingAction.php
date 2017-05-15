<?php
/**
 * 文件借阅模块
 * @author dengguoqi
 *
 */
class ESDocumentBorrowingAction extends ESActionBase
{
	//首页渲染图片
	public function index()
	{
		return $this->renderTemplate(array('status'=>1));
	}

	public function getTree()
	{
		$id = $_POST['id'];
		$pId = $_POST['pId'];
		$userid = $this->getUser()->getId();
		if($pId == '1'){
			$type= 'year';
		}else{
			$type= '';
		}
		$statusForTree = isset($_GET['statusForTree'])?$_GET['statusForTree']:'all';
		$proxy = $this->exec("getProxy", "documentBorrowing");
		$params = array();
		$params['id'] = $id;
		$params['type'] =$type;
		$params['userid'] =$userid;
		$params['statusForTree'] = $statusForTree;
		$result = $proxy->getTree(json_encode($params));
		echo json_encode($result);
	}
	public function initTree(){
		$Nodes[] = array(
				'name'=>"文件借阅日期",
				'pId'=>"-1",
				'id'=>'1',
				'isParent'=>true,
				'open'=>true
		);
		echo json_encode($Nodes);
	}
	/**
	 * 筛选
	 * @return string
	 */
	public function filter(){
		return $this->renderTemplate();
	}
	/**
	 * 删除
	 */
	public function delBorrowList(){
		$id=isset($_GET['id'])?$_GET['id']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$del=$proxy->delBorrowList($id);
		echo $del;
	}
	/**
	 * 借阅报表
	 */
	public function getBorrowDataByBorrowModel(){
		
	}
	public function showOrderPaths(){
		$page=1;
		$total=1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		echo json_encode($jsonData);
	}
	public function updateDetailToOrder(){
		
	}
	public function getMaxArchiveCount(){
		
	}
	public function endUsingForm(){
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$id = isset($_GET['id'])?$_GET['id']:0;
		$borrowNum= isset($_GET['borrowNum'])?$_GET['borrowNum']:'';
		$param = array(
				'id'=>$id,
				'borrowNum'=>$borrowNum,
				'userId'=>$userId,
				'ip'=>$ip
		);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->endUsingForm(json_encode($param));
		echo $res;
	}
	/**
	 * 
	 * 跳到初始的添加借阅明细页面
	 * @return string
	 */
	public function record(){
		return $this->renderTemplate();
	}
	public function datalist(){
		$type = isset($_GET['type'])?$_GET['type']:0;
		$id = isset($_GET['sId'])?$_GET['sId']:0; 
		return $this->renderTemplate(array('type'=>$type,'id'=>$id));
	}
	public function getJson(){
		$type = isset($_GET['type'])?$_GET['type']:0;
		$id = isset($_GET['id'])?$_GET['id']:0; 
		$page = isset($_POST['page'])?$_POST['page']:1; 
		$rp = isset($_POST['rp'])?$_POST['rp']:20;
		$keyWord = isset($_GET['keyWord'])?$_GET['keyWord']:'';
		$map = array();
		$map['type'] = $type;
		$map['id'] = $id;
		$map['page'] = $page;
		$map['rp'] = $rp;
		$map['keyWord'] = $keyWord;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$list=$proxy->getColumnModel(json_encode($map));
		$count = $proxy->getCount(json_encode($map));
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array ()
		);
		$start = ($page-1)*$rp;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $data ) {
				$data->num=$start+1;
				if(($data->borrowStatus=="") || ($data->borrowStatus==null) || ($data->borrowStatus=="0")|| ($data->borrowStatus=="null")){
					$data->ids = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
				}else{
					$data->ids = "$data->borrowStatus";
					
				}
				$result["rows"][]=array(
						"id"=>$data->id,
						"cell" => $data
				);
				$start++;
			}
		}
		echo json_encode($result);
	}
	public function getfieldData(){
		$id = isset($_GET['id'])?$_GET['id']:'';
		$pId = isset($_GET['pId'])?$_GET['pId']:'';
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
		$map['id'] = $id;
		$map['pId'] = $pId;
		$map['type'] = $type;
		$map['userid'] = $userId=$this->getUser()->getId();
		$map['page'] = $page = isset($_POST['page'])?$_POST['page']:1;
		$map['rp'] =$rp=isset($_POST['rp'])?$_POST['rp']:20;
		$statusForTree = isset($_POST['query']['statusForTree'])?$_POST['query']['statusForTree']:'0';
		$map['statusForTree'] = $statusForTree;
		$map['query'] =isset($_POST['query']['condition'])?$_POST['query']['condition']:'';
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->getUsingFieldForForm(json_encode($map));
		$result = array(
				'page'=>$page,
				'total' => $res->total,
				"rows" => array ()
				);
		$start = ($page-1)*$rp+1;
		$lists = $res->list;
		foreach ($lists as $data){
			$data->num = $start++;
			$data->ids = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
			$data->operate = "<span class=" . ($data->status == '已结束' ? 'showbtn' : 'editbtn') . " id=" . $data->id . "> </span>";
			$result["rows"][]=array(
					"id"=>$data->id,
					"cell" => $data
			);
		}
		echo json_encode($result);
	}
	public function addForm(){
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$borrowdetail = isset($_POST['borrowdetail'])?$_POST['borrowdetail']:null;
		$borrowform = isset($_POST['borrowform'])?$_POST['borrowform']:null;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$params = array(
				'form'=>$borrowform,
				'detail'=>$borrowdetail,
				'userId'=>$userId,
				'ip'=>$ip
				);
		$res=$proxy->addForm(json_encode($params));
		echo $res;
	}
	public function edit(){
		$id = isset($_POST['id'])?$_POST['id']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$result=(array)$proxy->getFormWithId(json_encode($id));
		//echo json_encode($result);
		return $this->renderTemplate($result);
	}
	public function getDetils(){
		$id = isset($_GET['bid'])?$_GET['bid']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$list=$proxy->getDetils(json_encode($id));
		$result = array(
				'page'=>1,
				'total' => 1,
				"rows" => array ()
				);
		$start =1;
		foreach ($list as $data){
			$data->num = $start++;
			$data->id3 = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
			//$data->operate = "<span class='editbtn' id=" . $data->id . "> </span>";
			$result["rows"][]=array(
					"id"=>$data->id,
					"cell" => $data
			);
		}
		echo json_encode($result);
	}
	public function save(){
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$borrowdetail = isset($_POST['borrowdetail'])?$_POST['borrowdetail']:null;
		$borrowform = isset($_POST['borrowform'])?$_POST['borrowform']:null;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$params = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'form'=>$borrowform,
				'detail'=>$borrowdetail
		);
		$res=$proxy->save(json_encode($params));
		echo $res;
	}
	public function listUsers() {
		//$data = $_GET ['data'];
		return $this->renderTemplate ();
	}
	public function findUserListByOrgid() {
		$request = $this->getRequest ();
		//$orgSeq = $request->getGet ( 'orgSeq' );
		$keyWord = isset ( $_GET ['keyWord'] ) ? $_GET ['keyWord'] : '';
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset ( $_POST ['rp'] ) ? $_POST ['rp'] : 20;
		$orgAndUserProxy = $this->exec ( "getProxy", 'role' );
		$data ['startNo'] = ($page - 1) * $rp;
		$data ['limit'] = $rp;
		$data ['keyWord'] = $keyWord;
		//$data ['orgSeq'] = $orgSeq;
		$data['userIp'] = $this->getClientIp();
		$data['userId'] = $this->getUser()->getId();
		$canshu = json_encode ( $data );
		$rows = $orgAndUserProxy->findUserListByOrgid ( $canshu );
		$countData ['keyWord'] = $keyWord;
		//$countData ['orgSeq'] = $orgSeq;
		$countCanshu = json_encode ( $countData );
		$total = $orgAndUserProxy->getCountAll ( $countCanshu );
		$start = 1;
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		foreach ( $rows as $row ) {
			$entry = array (
					"id" => $row->id,
					"cell" => array (
							"startNum" => $start,
							"ids" => '<input type="radio"  class="checkbox"  name="userId" value="' . $row->id . '"  uids="'.$row->userid.'" id="userId">',
							"id" => $row->id,
							"userid" => $row->userid,
							//"operate" => "<span class='editbtn' userId='$row->id' >&nbsp;</span>",
							"firstName" => $row->firstName,
							"lastName" => $row->lastName,
							"Name" => $row->lastName . $row->firstName,
							"userStatus" => ($row->userStatus=='1'||$row->userStatus=='启用')?'启用':'禁用',
							"mobTel" => $row->mobTel,
							"emailAddress" => $row->emailAddress,
							"orgname" => $row->orgname
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode ( $jsonData );
	}
	public function getBorrowRoleWithId(){
		$id = isset($_GET['userid'])?$_GET['userid']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->getBorrowRoleWithId($id);
		echo json_encode ($res);
	}
	public function changeDetails(){
		$details = isset($_POST['details'])?$_POST['details']:null;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->changeDetails(json_encode ($details));
		echo json_encode ($res);
	}
	public function dirChangeStatus(){
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$borrowdetail = isset($_POST['borrowdetail'])?$_POST['borrowdetail']:null;
		$borrowform = isset($_POST['borrowform'])?$_POST['borrowform']:null;
		$borrowtype = isset($_POST['borrowtype'])?$_POST['borrowtype']:null;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$params = array(
				'form'=>$borrowform,
				'detail'=>$borrowdetail,
				'type'=>$borrowtype,
				'userId'=>$userId,
				'ip'=>$ip
		);
		$res=$proxy->dirChangeStatus(json_encode($params));
		echo $res;
	}
	public function returnForForm(){
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$nums = isset($_GET['borrowNum'])?$_GET['borrowNum']:0;
		$id = isset($_GET['id'])?$_GET['id']:0;
		$docId = isset($_GET['docId'])?$_GET['docId']:0;
		$params = array(
				'borrowNums'=>$nums,
				'docId'=>$docId,
				'id'=>$id,
				'userId'=>$userId,
				'ip'=>$ip
		);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->returnForForm(json_encode($params));
		echo $res;
	}
	public function relendForForm(){
		$nums = isset($_GET['borrowNums'])?$_GET['borrowNums']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->relendForForm(json_encode($nums));
		echo $res;
	}
	public function respeak(){
		return $this->renderTemplate();
	}
	/**
	 * 预约
	 */
	public function bespeak(){
		$borrowform = isset($_POST['borrowform'])?$_POST['borrowform']:null;
		$docIdsArray = isset($_POST['docIdsArray'])?$_POST['docIdsArray']:null;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$param = array(
				'borrowform'=>$borrowform,
				'docIdsArray'=>$docIdsArray,
				'userId'=>$userId,
				'ip'=>$ip
				);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->bespeak(json_encode($param));
		echo $res;
	}
	/**
	 * 查看预约(全部/已归还/为归还)
	 */
	public function getBespeakList(){
		$userId = $this->getUser ()->getId ();
		$type = isset($_GET['type'])?$_GET['type']:'';
		$page =  isset($_POST['page'])?$_POST['page']:1;
		$rp =  isset($_POST['rp'])?$_POST['rp']:20;
		$param = array(
				'type'=>$type,
				'userId'=>$userId,
				'page'=>$page,
				'rp'=>$rp
		);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->getBespeakList(json_encode($param));
		/* $condition = "";
		if($type=="all") $condition="";
		if($type=="order") $condition="status = '未归还'";
		if($type=="noOrder") $condition="status = '已归还'"; */
		$tc = array(
				'tname'=>"ess_document_bespeak",
				'condition'=>$type,
				'userId'=>$userId
				);
		$total = $proxy->getCountWithTname(json_encode($tc));
		$jsonData = array (
				'page' => $page,
				'total' => $total,
				'rows' => array ()
		);
		$start =1;
		foreach ($res as $data){
			$entry = array (
					"id" => $data->id,
					"cell" => array (
							"num" => $start,
							"box" => '<input type="radio"  class="checkbox"  name="userId" value="'.$data->borrowNum . '">',
							"id" => $data->id,
							"title"=>$data->title,
							"documentCode"=>$data->documentCode,
							"status"=>$data->status,
							"borrowNum"=>$data->borrowNum,
							"docId" => $data->docId,
							"docNo" => $data->docNo,
							"itemName" => $data->itemName,
							"stageName" => $data->stageName,
							"deviceName" => $data->deviceName,
							"participatoryName" => $data->participatoryName,
							"engineeringCode" => $data->engineeringCode,
							"documentTypeName" => $data->documentTypeName,
							"engineeringName" => $data->engineeringName
					)
			);
			$jsonData ['rows'] [] = $entry;
			$start ++;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 查询预约的利用单数据
	 */
	public function getBespeakDetail(){
		$userId = $this->getUser ()->getId ();
		$type = isset($_GET['type'])?$_GET['type']:'';
		$docId = isset($_GET['docId'])?$_GET['docId']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$param = array(
			'type'=>$type,
			'docId'=>$docId,
			'userId'=>$userId
		);
		$res=$proxy->getBespeakDetail(json_encode($param));
		$jsonData = array (
				'page' => 1,
				'total' => 1,
				'rows' => array ()
		);
		$start =1;
		foreach ($res as $data){
			$data->num = $start++;
			$data->ids = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
			//$data->operate = "<span class='editbtn' id=" . $data->id . "> </span>";
			$jsonData["rows"][]=array(
					"id"=>$data->id,
					"cell" => $data
			);
		}
		echo json_encode($jsonData);
	}
	/**
	 * 借阅已预约的文件
	 */
	public function lendDocumentUpOrder(){
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$type = isset($_GET['type'])?$_GET['type']:'';
		$bNum = isset($_GET['bNum'])?$_GET['bNum']:'';
		$docId = isset($_GET['docId'])?$_GET['docId']:0;
		$param = array(
				'type'=>$type,
				'bNum'=>$bNum,
				'docId'=>$docId,
				'userId'=>$userId,
				'ip'=>$ip
				);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->lendDocumentUpOrder(json_encode($param));
		echo $res;
	}
	public function delFormArchivesCar(){
		$id = isset($_GET['id'])?$_GET['id']:'0';
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->delFormArchivesCar($id);
		echo $res;
	}
	public function printBorrowreport(){
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$borrowId=$_POST['borrowId'];
		$borrowNum=$_POST['borrowNum'];
		$reportId=$_POST['reportId'];
		$reportTitle=$_POST['reportTitle'];
		$reportStyle=$_POST['reportStyle'];
		$condition =isset($_POST['query']['condition'])?$_POST['query']['condition']:'';
		$param=array(
				'borrowId'=>$borrowId,
				'borrowNum'=>$borrowNum,
				'reportId'=>$reportId,
				'reportTitle'=>$reportTitle,
				'reportStyle'=>$reportStyle,
				'condition'=>$condition,
				'userId'=>$userId,
				'ip'=>$ip
		);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->printBorrowreport(json_encode($param));
		echo $res;
	}
	/**
	 * 删除借阅文件
	 */
	public function delDetails(){
		$id=isset($_POST['id'])?$_POST['id']:0;
		$borrowNum = isset($_POST['borrowNum'])?$_POST['borrowNum']:'';
		$docId = isset($_POST['docId'])?$_POST['docId']:'';
		$title = isset($_POST['title'])?$_POST['title']:'';
		$param = array(
				'id'=>$id,
				'borrowNum'=>$borrowNum,
				'docId'=>$docId,
				'title'=>$title
		);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$del=$proxy->delDetails(json_encode($param));
		echo $del;
	}
	/**
	 * 根据借阅单获取借阅借出文件id
	 */
	public function getBorrowFileIdByNum(){
		$borrowNum=isset($_GET['borrowNum'])?$_GET['borrowNum']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->getBorrowFileIdByNum($borrowNum);
		echo $res;
	}
	
	public function getDocumentBorrowStatus(){
		$details = isset($_POST['details'])?$_POST['details']:null;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->getDocumentBorrowStatus(json_encode ($details));
		echo $res;
	}
	
	public function editSave(){
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$borrowdetail = isset($_POST['borrowdetail'])?$_POST['borrowdetail']:null;
		$borrowform = isset($_POST['borrowform'])?$_POST['borrowform']:null;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$params = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'form'=>$borrowform,
				'detail'=>$borrowdetail
		);
		$res=$proxy->editSave(json_encode($params));
		echo $res;
	}
	
	/**
	 * 查看消息提示信息
	 */
	public function showMessageFormUsingForm(){
		$formId = $_POST['formId'];
		$item = array(
			'formId'=>$formId
		);
		return $this->renderTemplate($item);
	
	}
	/**
	 * 查看消息提示信息
	 * @param unknown_type $map
	 */
	public function showMessageForRegister(){
		$formId = $_POST['formId'];
		$item = array(
			'formId'=>$formId
		);
		return $this->renderTemplate($item);
	}
	
	public function getFormDataByFormID(){
		$formId = $_GET['formId'];
		$proxy=$this->exec('getProxy','documentBorrowing');
		$list=$proxy->getFormDataByFormID($formId);
		$result = array(
				'page'=>1,
				'total' => 1,
				"rows" => array ()
				);
		$start =1;
		foreach ($list as $data){
			$data->ids = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
			$result["rows"][]=array(
					"id"=>$data->id,
					"cell" => $data
			);
		}
		echo json_encode($result);
	}
	
	public function getDetailsByFormId(){
		$map = array();
		$map['page'] = $page = isset($_POST['page'])?$_POST['page']:1;
		$map['rp'] =$rp=isset($_POST['rp'])?$_POST['rp']:20;
		$map['formId'] = $formId = $_GET['formId'];
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->getDetailsByFormId(json_encode($map));
		$result = array(
				'page'=>$page,
				'total' => $res->total,
				"rows" => array ()
				);
		$start = ($page-1)*$rp+1;
		$lists = $res->list;
		foreach ($lists as $data){
			$data->num = $start++;
			$data->ids3 = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
			$result["rows"][]=array(
					"id"=>$data->id,
					"cell" => $data
			);
		}
		echo json_encode($result);
	}
	
	public function relendOrReturnForForm(){
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$borrowNum = isset($_POST['borrowNum'])?$_POST['borrowNum']:0;
		$type = isset($_POST['type'])?$_POST['type']:'';
		$proxy=$this->exec('getProxy','documentBorrowing');
		$params = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'borrowNum'=>$borrowNum,
				'type'=>$type
		);
		$res=$proxy->relendOrReturnForForm(json_encode($params));
		echo $res;
	}
	
	public function relendOrReturnForDetails(){
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$ids = isset($_POST['ids'])?$_POST['ids']:0;
		$docId = isset($_POST['docId'])?$_POST['docId']:0;
		$type = isset($_POST['type'])?$_POST['type']:'';
		$proxy=$this->exec('getProxy','documentBorrowing');
		$params = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'ids'=>$ids,
				'docId'=>$docId,
				'type'=>$type
		);
		$res=$proxy->relendOrReturnForDetails(json_encode($params));
		echo $res;
	}
	
	public function addCarForBespeak(){
		$docId = isset($_POST['docId'])?$_POST['docId']:0;
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp ();
		$param = array(
				'docId'=>$docId,
				'userId'=>$userId,
				'ip'=>$ip
		);
		$proxy=$this->exec('getProxy','documentBorrowing');
		$res=$proxy->addCarForBespeak(json_encode($param));
		echo $res;
	}
	
	public function getRespeakDetails(){
		$proxy = $this->exec('getProxy', 'documentBorrowing');
		$userId = $this->getUser()->getId();
		$user=$proxy->getUserByuserId($userId);
		$list=$proxy->getESScommon($user->userid);
		$result = array(
				'page'=>1,
				'total' => 1,
				"rows" => array ()
				);
		$start =1;
		foreach ($list as $data){
			$data->num = $start++;
			$data->ids3 = "<input type='checkbox' name=\"changeId\" value=" . $data->id . " id=\"changeId\">";
			$result["rows"][]=array(
					"id"=>$data->id,
					"cell" => $data
			);
		}
		echo json_encode($result);
	}
	public function showDetails(){
		$id = isset($_POST['id'])?$_POST['id']:0;
		$proxy=$this->exec('getProxy','documentBorrowing');
		$result=(array)$proxy->getFormWithId(json_encode($id));
		return $this->renderTemplate($result);
	}
}

