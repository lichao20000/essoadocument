<?php
/**
 * 日志管理
 */
class ESLogAction extends ESActionBase
{
/**
 * shimiao 20140428 打开日志管理的时候，记录日志
 */
	public function index()
	{
		return $this->renderTemplate();
	}
	/**
	 * shimiao 20140425 获取客户端ip
	 */
	function getip ()
	{
		if (getenv('http_client_ip')) {
			$ip = getenv('http_client_ip');
		} else if (getenv('http_x_forwarded_for')) {
			$ip = getenv('http_x_forwarded_for');
		} else if (getenv('remote_addr')) {
			$ip = getenv('remote_addr');
		} else {
			$ip = $_server['remote_addr'];
		}
		return $ip;
	}
	public function GetLogListByCondition()
	{
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", "log");
		$param = array();
		$param['userid']  = $this->getUser()->getId();
		$param['condition'] = isset($_POST['query']['condition'])?$_POST['query']['condition']:null;
		$param['start'] = $page;
		$param['limit'] = $limit;
		$param['type'] = $_POST['query']['type'];
		
		$lists = $proxy->getLogListByCondition(json_encode($param));
		$total = $lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $limit + 1; // 1-20, 21-40,41-60
		foreach ($lists->list as $list){
		    $entry = array(
					'id'=>$list->id,
		            'cell'=>array(
		            'id'=>$list->id,
            		'line'=> $line++,
            		'cb'=>'<input boxid="'.$list->id.'" type="checkbox" name="checks" class="selectone"  ln="'. ($line-1) .'" value="'.$list->id.'">',
                    'details'=> "<input type='button' class='details' />",
                    'logdate'=> $list->logdate,
                    'logtime'=> $list->logtime,
                    'username'=> $list->username,
                    'orgname'=> $list->orgname,
                    'address'=> $list->address,
                    'operate'=> $list->operate,
                    'module'=> $list->module,
                    'operatedetail'=> $list->operatedetail
		            ),
		    );
		    
		    $jsonData['rows'][] = $entry;
		}
		
		echo json_encode($jsonData);
		
	}
	
	public function filter()
	{
		$type = $_POST['type'];
		$baseOption = array('log_date'=>'登录日期', 'log_time'=>'登录时间', 'userid'=>'登录用户', 'organfullname'=>'用户部门', 'address'=>'IP 地址');
		
		if($type === 'access'){ // 功能访问
			
			$baseOption['log_module'] = '访问模块';
			
		}else if($type === 'operation'){ // 功能操作
			
			$baseOption['log_module'] = '操作功能';
			$baseOption['loginfo'] = '操作明细';
		
		}else if($type == 'job'){
			$baseOption['log_module'] = '操作功能';
			$baseOption['loginfo'] = '操作明细';
		}
		
		$options = '<option value="EMPTY">请选择</option>';
		foreach($baseOption as $name=>$value)
		{
		$options .= '<option value="'. $name .'" >'. $value .'</option>';
		}
		
		return $this->renderTemplate(array('options'=>$options));
	}
	
	// 数据接口筛选
	public function ext_filter()
	{
		$userId = $this->getUser()->getId();
		$mainSite = $this->exec("getProxy", "user")->getUserInfo($userId)->mainSite;
		$sysList = array();
		
		$proxy = $this->exec('getProxy', 'escloud_receivews');
		$sysList = $proxy->getSysNodeListAvailable(strtolower($mainSite));
		//print_r($sysList);die;
		
		$sysOption = $rangeOption = '';
		$rangeList = array(
		
				array('system'=> '0', 'sysName'=> '所有'),
				array('system'=> '1', 'sysName'=> '所有错误'),
				array('system'=> '2', 'sysName'=> '业务系统错误'),
				array('system'=> '3', 'sysName'=> 'EIP系统错误'),
				array('system'=> '4', 'sysName'=> '档案系统错误'),
				array('system'=> '11', 'sysName'=> '反馈错误失败'),
				array('system'=> '12', 'sysName'=> '反馈完成失败'),
				array('system'=> '20', 'sysName'=> '入库成功，有其他错误'),
				array('system'=> '100', 'sysName'=> '归档完成')
		
		);
		
		foreach ($sysList as $sys)
		{
		$sysOption .= '<option value="'. $sys->system .'">'. $sys->sysName .'</option>';
		}

		foreach($rangeList as $row)
		{
		$rangeOption .= '<option value="'. $row['system'] .'">'. $row['sysName'] .'</option>';
		}
		$params['sysOption'] = $sysOption;
		$params['rangeOption'] = $rangeOption;
		return $this->renderTemplate($params);
	}
	
	// 根据日志ID查询日志明细  
	public function detail()
	{
		$logId = $_POST['logId'];
		$proxy = $this->exec('getProxy', 'escloud_logservice');
		$detail = $proxy->getLogById($logId);
		return $this->renderTemplate(array('detail'=> $detail));
		
	}
	
	/**
	 * @author shimiao 20140421 导出数据
	 */
	public function exportLogData(){
		$params = $_POST;
		$params['ip'] = $this->getip();
		$uId = $this->getUser()->getId();
		$params['userid'] = $uId;
		$proxy = $this->exec('getProxy', 'log');
		$result = $proxy->exportLogData( json_encode($params));
		echo $result;
	}

	/**
	 * 获取显示SIP文件内容
	 * @author fangjixiang 20130621
	 * @param param
	 * @return
	 */
	public function ShowSIPXml()
	{
		
		$params = $_POST;
		$params['userId'] = $this->getUser()->getId();
		
		
		$proxy = $this->exec('getProxy', 'escloud_receivews');
		$result = $proxy->showSIPXml( json_encode($params) );
		//print_r($result);
		//return;
		
		if(isset($result->error)){
			echo 'error:'.$result->error;
			return;
		}
		
		$xmlData = $result->xml;
		
		$xmlData = str_replace("<", '&lt;', $xmlData);
		$xmlData = str_replace("/>", '/&gt;', $xmlData);
		$xmlData = str_replace("\r\n", '<br/>', $xmlData);
		$xmlData = str_replace("\n", '<br/>', $xmlData);
		$xmlData = '<pre>'.$xmlData.'</pre>';
		return $this->renderTemplate(array('xml' => $xmlData), 'ESLog/native_detail');
	}
	
	/**
	 * 获取显示电子文件上传信息内容
	 * @author fangjixiang 20130621
	 * @param param
	 * @return
	 */
	public function ShowUploadinfo()
	{
		
		$params = $_POST;
		$params['userId'] = $this->getUser()->getId();
		
		
		$proxy = $this->exec('getProxy', 'escloud_receivews');
		$result = $proxy->showUploadinfo( json_encode($params) );
		//print_r($result);
		//return;
		
		if(isset($result->error)){
			echo 'error:'.$result->error;
			return;
		}
		
		$data = $result->uploadinfo;
		$data = implode($data, ',');
		
		$data = '['.$data.']';
		
		echo $data;
		
	}
	
	/**
	 * 将本系统错误数据反馈给业务系统（其他错误已反馈给业务系统）
	 * @author fangjixiang 20130621
	 * @param param
	 * @return
	 */
	
	public function	FeedbackExternalSys()
	{
		
		$params = $_POST;
		$params['userId'] = $this->getUser()->getId();
		
		
		$proxy = $this->exec('getProxy', 'escloud_receivews');
		$string = $proxy->feedbackExternalSys( json_encode($params) );
		echo $string;
		//print_r($result);
	}
	
	/**
	 * 错误数据处理后,导入本系统错误的数据
	 * @author fangjixiang 20130621
	 * @param param
	 * @return
	 */
	
	public function	ImportInternalData()
	{
		$params = $_POST;
		$params['userId'] = $this->getUser()->getId();
		
		//print_r($params); die;
		$proxy = $this->exec('getProxy', 'escloud_receivews');
		$string = $proxy->importInternalData( json_encode($params) );
		//print_r($result);
		echo $string;
	}
	
	/**
	 * @author shimiao
	 * 下载
	 */
	public function downFile()
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
	 * @author shimiao 
	 * 删除日志数据
	 */
	public function deleteLogData(){
		$params = $_POST;
		$params['ip'] = $this->getip();
		$uId = $this->getUser()->getId();
		$params['userid'] = $uId;
		$string = '';
		$proxy = $this->exec('getProxy', 'log');
		$string = $proxy->deleteLogData( json_encode($params) );
		echo $string;
	}
	/**
	 * shimiao 20140627 统计日志信息
	 */
	public function statistics(){
		$type = $_POST['type'];
		$baseOption = array(
		'log_year'=>'年',
		'log_month'=>'月',
		'log_day'=>'日',
		'organfullname'=>'部门',
		'address'=>'IP地址',
		'username'=>'登录用户'
		);
		if('access'==$type){//liqiubo 20140919 加入其他的列，修复bug 1114
			$baseOption['log_module']='访问模块';
		}
		if('operation'==$type || 'job'==$type){
			$baseOption['log_module']='操作功能';
			$baseOption['loginfo']='操作明细';
		}
		$options = '<option value="EMPTY">请选择</option>';
		foreach($baseOption as $name=>$value)
		{
		$options .= '<option value="'. $name .'" >'. $value .'</option>';
		}
		
		return $this->renderTemplate(array('options'=>$options,'type'=>$type));
	}
	public function setStatisticsCondition(){
		$userId = $this->getUser()->getId();
		$selected = $_POST["selectSa"];
		$type = $_POST["type"];
		//liqiubo 20140919 去掉原来的限制逻辑，限制显示全部，修复bug 1114
		$baseOption = array(
		'log_year'=>'年',
		'log_month'=>'月',
		'log_day'=>'日',
		'organfullname'=>'部门',
		'address'=>'IP地址',
		'username'=>'登录用户'
		);
		if($type == "access"){
			$baseOption['log_module']='访问模块';
		}else if($type == 'operation' || $type == 'job'){
			$baseOption['log_module']='操作功能';
			$baseOption['loginfo']='操作明细';
		}
		$options = '<option value="EMPTY">请选择</option>';
		foreach($baseOption as $name=>$value)
		{
			$options .= '<option value="'. $name .'" >'. $value .'</option>';
		}
		return $this->renderTemplate(array('options'=>$options));
	}
	public function getStatisticData(){
		$param= array();
		$param['ip'] = $this->getip();
		$param['userid']  = $this->getUser()->getId();
		$param['condition'] = isset($_POST['query']['condition'])?$_POST['query']['condition']:null;
		$param['conName'] = isset($_POST['query']['conName'])?$_POST['query']['conName']:null;
		
		$selectSa = $_POST['query']['selectSe'];
		$param['selectSa'] = $selectSa;
		//加入日志保存的统计中文信息
		$param['selectSaName'] =$this->changeSelectSa ($selectSa);
		$param['type'] = $_POST['query']['type'];
		$proxy = $this->exec('getProxy', 'log');
		$res = $proxy->getStatisticData( json_encode($param) );
		$res1 = array();
		$res1 = json_decode($res);
		$res2= array();
		$res3 = array();
		$res4 = array();
		$count = 0;
		$i=0;
		foreach ($res1 as $row){
			$count = ($row->$selectSa->count)+$count;
			$res2[$row->$selectSa->inspectStatus.$this->changeSelectSa($selectSa)] = array(
								'num'=>$row->$selectSa->count
							);
			$res3[$i]['name'] = $row->$selectSa->inspectStatus.$this->changeSelectSa($selectSa);
			$res3[$i]['count'] = $row->$selectSa->count ;
			$i++;
		}
		for($t=0;$t<count($res3);$t++){
			if(isset($res2[$res3[$t]['name']])){
				$c = sprintf("%.2f", ($res3[$t]['count']/$count)*100);
				$res2[$res3[$t]['name']]['percent'] = $c;
			}
		}
		echo json_encode($res2);
	}
	private function changeSelectSa($data){
		if($data == 'log_year'){
			return '年';
		}else if($data == 'log_month'){
			return '月';
		}else if($data == 'log_day'){
			return '日';
		}else if($data == 'username'){
			return '登录用户';
		}else if($data == 'organfullname'){
			return '部门';
		}else if($data == 'address'){
			return 'IP地址';
		}else if($data == 'log_module'){
			return '操作模块';
		}else if($data == 'loginfo'){
			return '操作明细';
		}
	}
	
	/**
	 * 添加模版访问日志  每次点击功能菜单访问时才调用(刷新不添加日志)
	 */
	public function saveAccessModel() {
		$modelName = $_POST['model'];
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		$logws=$this->exec('getProxy','log');
		$map = array();
		$map['userid'] = $userId;
		$map['ip'] = $remoteAddr;
		$map['model'] = $modelName;
		$flag=$logws->saveAccessModel(json_encode($map));
		echo $flag;
	}
	
	public function saveLog(){
		$modelName = isset($_POST['model']) ? $_POST['model'] :'';
		$type = isset($_POST['type']) ? $_POST['type'] : 'operation';
		$loginfo = isset($_POST['loginfo']) ? $_POST['loginfo'] : '';
		$operate = isset($_POST['operate']) ? $_POST['operate'] : '';
		$userId = $this->getUser()->getId();
		$remoteAddr = $this->getClientIp();
		
		$logProxy=$this->exec('getProxy','log');
		$logMap=array();
		$logMap['userid'] = $userId;
		$logMap['module'] = $modelName;
		$logMap['type'] = $type;
		$logMap['ip'] = $remoteAddr;
		$logMap['loginfo'] = $loginfo;
		$logMap['operate'] = $operate;
		$logProxy->saveLog(json_encode($logMap));
		echo true;
	}
	
//-------------------------文控日志模块对soa服务的引用---------------------------\\
	
	//soa中ESOrgAndUserAction中的函数引用
	public function getOrgListTree(){
		$oid=isset($_GET['oid'])?$_GET['oid']:'';
		$userId = $this->getUser ()->getId ();
		$data ['userId'] = ($oid=='all') ? 'admin' : $userId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'log' );
		$lists = $proxy->getOrgListTree ( $canshu );
		$jsonData1 = array ();
		$jsonData = array (
				'name' => '机构设置',
				'id' => 'org',
				'open' => true,
				'children' => array ()
		);
		foreach ( $lists as $row ) {
			$entry = array (
				"name" => $row->name,
				"id" => $row->id,
				"pId" => $row->pId,
				"isParent" => $row->isParent,
				"idseq" => $row->idseq,
				"cuncorgclass" => $row->cuncorgclass,
				"address" => $row->address,
				"orgsort" => $row->orgsort,
				"mainsite" => $row->mainsite,
				"orgstatus" => $row->orgstatus
			);
			$jsonData ['children'] [] = $entry;
		}
		$jsonData1 [0] = $jsonData;
		echo json_encode ( $jsonData1 );
	}
	//soa中ESArchiveDestroyAction中的函数引用
	public function FindUserListByOrgidForUsingStatic()
	{
		if(isset($_GET['oid'])){
			$oid = $_GET['oid'];
		}else{
			$authProxy = $this->exec( "getProxy", "log" );
			$userId = $this->getUser()->getId();
			$isAdmin = $authProxy->isAdmin($userId);
			if ($isAdmin) {
				$oid = "all";
			} else {
				$orgProxy = $this->exec( "getProxy", "log" );
				$org = $orgProxy->getOrg($userId);
				$oid = $org->orgid;
			}
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$pages = ($page-1)*$limit;
		$proxy = $this->exec("getProxy", "log");
		$result = $proxy->findUserListByOrgid($oid,$pages,$limit);
	
		$total = $result->total ? $result->total : 0;
		$userData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total){
			foreach ($result->dataList as $k=>$value){
	
				$orgName = $value->companyEntry->orgName;
				$userName = $value->userid;
				$displayName = $value->displayName;
				$deptCode = $value->deptCode;
				$ldapOrgCode = $value->companyEntry->orgid;
				$mobTel = $value->mobTel;
				$entry= array(
				'id'=>$value->userid,
				'cell'=>array(
					'linenumber'=>$k+1,
					'radio'=>'<input type="radio" value="'.$userName."??".$displayName."??".$orgName."??".$deptCode."??".$mobTel."??".$ldapOrgCode.'" name="userInfo" />',
					'userName'=>$userName,
					'displayName'=>$displayName,
					'orgName'=>$orgName,
					'deptPost'=>$deptCode,
					'mobTel'=>$mobTel
					)
				);
				$userData['rows'][] = $entry;
			}
		}
	
		echo json_encode($userData);
	}
	//soa中ESOrgAndUserAction中的函数引用
	public function expandOrgListTree() {
		$parentId = $_GET ['id'];
		$data ['parentId'] = $parentId;
		$canshu = json_encode ( $data );
		$proxy = $this->exec ( 'getProxy', 'log' );
		$lists = $proxy->getOrgListTree ( $canshu );
		$result = array ();
		foreach ( $lists as $k => $val ) {
			$result [$k] ["name"] = $val->name;
			$result [$k] ["pId"] = $val->pId;
			$result [$k] ["id"] = $val->id;
			$result [$k] ["isParent"] = $val->isParent;
			$result [$k] ["idseq"] = $val->idseq;
			$result [$k] ["cuncorgclass"] = $val->cuncorgclass;
			$result [$k] ["address"] = $val->address;
			$result [$k] ["orgsort"] = $val->orgsort;
			$result [$k] ["mainsite"] = $val->mainsite;
			$result [$k] ["orgstatus"] = $val->orgstatus;
		}
		echo json_encode ( $result );
	}
	
	public function addLoginLog(){
		$userId = $this->getUser ()->getId ();
		$ip = $this->getClientIp();
		$param = array(
			'userId'=>$userId,
			'ip'=>$ip
		);
		$proxy = $this->exec ( 'getProxy', 'log' );
		$result = $proxy->addLoginLog (json_encode($param));
		echo $result;
	}
}