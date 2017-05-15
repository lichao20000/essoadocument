<?php 
/**
 * 借阅利用模版设置
 * @author shimiao 20140529 
 * @Date 20121107
 */
class ESArchiveUsingModelAction extends ESActionBase{
	/**
	 * @see ESActionBase::index()
	 * shimiao 20140529 加日志
	 */
	public function index()
	{
		return $this->renderTemplate();
	}
	
	public function getRoleData(){
		//startNo limit  keyWord appId ids
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp).'';
		$limit = ($rp*$page).'';
		$keyWord = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$map = array();
		$map['startNo'] = $start;
		$map['limit'] = $limit;
		$map['keyWord'] = $keyWord;
		$map['bigOrgId'] = $this->getUser()->getBigOrgId();
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getRoleData($map);
		$lists = $data->data;
		$count = $data->count;
		$jsonData = array('page'=>$page,'total'=>$count,'rows'=>array());
		$row = 0;
		foreach($lists as $list){
		/**
		 * 返回值
		 * m.put("roleId", trole.getRoleId());
		 m.put("roleCode", trole.getRoleCode());
		 m.put("roleName", trole.getRoleName());
		 m.put("roleRemark", trole.getRoleRemark());
		 m.put("createTime", trole.getCreateTime());
		 m.put("provinceCode", trole.getProvinceCode());
		 m.put("updateTime", trole.getUpdateTime());
		 m.put("isSystem", trole.getIsSystem());
		 */
			$check = $row==0?'checked':'';
			$entry=array(
					'id'=>$list->roleId,
					'cell'=>array(
							'id'=>$list->roleId,
							'radio'=>'<input type="radio" name="id2" '.$check.' value="'.$list->roleId.'|'.$list->roleName.'|'.$list->roleRemark.'"  onChange="changeRadio(\''.$list->roleId.'|'.$list->roleName.'|'.$list->roleRemark.'\')"/>',
							'roleName'=>$list->roleName,
							'roleCode'=>$list->roleCode,
							'roleRemark'=>$list->roleRemark
					)
			);
			$row ++;
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	public function saveLendCount(){
		$datas = array();
		$datas = $_POST['datas']; // [['','','','','','','','',''],...]
		$Proxy = $this->exec('getProxy','escloud_usingformws');
		$userId = isset($_POST['userId'])?$_POST['userId']:'0';
		$roleId = isset($_POST['roleId'])?$_POST['roleId']:'0';
		$map =array();
		$map['roleId'] = $roleId;
		$map['userId'] =$userId;
		$map['data'] = $datas;
		$result = $Proxy->saveRelendRoleLend(json_encode($map));
		echo json_encode($result);
	}
	public function getLendData(){
		//startNo limit  keyWord appId ids
		$map = array();
		$map['roleId'] = isset($_GET['roleId'])?$_GET['roleId']:'';
		$map['userId'] =isset( $_GET['userId'])?$_GET['userId']:'';
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp).'';
		$limit = ($rp*$page).'';
		$map['start'] = $start;
		$map['limit'] = $limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getRelendRoleLend(json_encode($map));
		$total = $data->count;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$lists = $data->data;
		$row = 1;
		foreach($lists as $list){
			$entry=array(
					'RELENDCOUNTID'=>$list->RELENDCOUNTID,
					'cell'=>array(
							'order'=> $row,
							'RELENDCOUNTID'=>$list->RELENDCOUNTID,
							'lendNumber'=>$list->lendNumber,
							'lendCount'=>$list->lendCount,
							'userId'=>$list->userId,
							'roleId'=>$list->roleId
					)
			);
			$row ++;
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	public function saveRoleLend(){
		$map = array();
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:'';
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:'';
		$map['lendCount'] = $_POST['lendCount'];
		$map['lendDay'] = $_POST['lendDay'];
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->saveRoleLends(json_encode($map));
		echo $data;
	}
	public function getRoleLend(){
		$map = array();
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:'';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getRoleLend(json_encode($map));
		echo json_encode($data);
	}
	public function deleteRelendMax(){
		$map = array();
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:'';
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:'';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->deleteRelendMax(json_encode($map));
		echo $data;
	}
	public function getCommonUser(){
		//startNo limit  keyWord appId ids
		$map = array();
		$map['roleId'] = isset($_GET['roleId'])?$_GET['roleId']:'';
		$keyWord = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$map['keyWord'] =$keyWord ;
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp).'';
		$limit = ($rp*$page).'';
		$map['start'] = $start;
		$map['limit'] = $limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getCommonUserByRole(json_encode($map));
		$total = $data->totalCount;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array(),'keyWord'=>$keyWord);
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$lists = $data->resultList;
		$row = 1;
		foreach($lists as $list){
			
			if($data->tempUser!="true"){
				$dep = $list->deptEntry->orgName;
			}else{
				$dep = $list->orgName;
			}
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'cbox'=> '<input type="checkbox" name="commUser" value="'.$list->id.'">',
							'id'=>$list->id,
							'seqid'=>$row,
							'userName'=>$list->userid,
							'displayName'=>isset($list->displayName)?$list->displayName:$list->userid,
							'userOrg'=>$dep,
							'lendCount'=>$data->lendCount,
							'edit'=>'<span class="chooseRightUser" ></span>'
					)
			);
			$row ++;
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	public function removeCommonUserToVip(){
		$map = array();
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:'';
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:'';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->removeCommonUserToVip(json_encode($map));
		echo $data;
	}
	public function getVipUser(){
		
		//startNo limit  keyWord appId ids
		$map = array();
		$map['roleId'] = isset($_GET['roleId'])?$_GET['roleId']:'';
		$map['keyWord'] = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp).'';
		$limit = ($rp*$page).'';
		$map['start'] = $start;
		$map['limit'] = $limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getVipUserByRole(json_encode($map));
		$total = $data->totalCount;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$lists = $data->resultList;
		$row = 1;
		foreach($lists as $list){
				
			if($data->tempUser!="true"){
				$dep = $list->deptEntry->orgName;
				$id = $list->id;
				$lendDay = $data->$id;
			}else{
				$dep = $list->orgName;
				$lendDay = $list->lendDay;
			}
			
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'cbox'=> '<input type="checkbox" name="vipUser" value="'.$list->id.'|'.$list->userid.'|'.$dep.'">',
							'id'=>$list->id,
							'userName'=>$list->userid,
							'displayName'=>isset($list->displayName)?$list->displayName:$list->userid,
							'userOrg'=>$dep,
							'lendDay'=>$lendDay,
							'edit'=>'<span class="chooseLeftUser" ></span>'
					)
			);
			$row ++;
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
		
	}
	function moveVipToCommon(){
		
		$map = array();
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:'';
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:'';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->moveVipToCommon(json_encode($map));
		echo $data;
		
	}
	function editVipUser(){
		$map = array();
		$resMap = array();
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:"";
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:"";
		$resMap['userName'] = isset($_POST['userName'])?$_POST['userName']:"";
		$resMap['dep'] = isset($_POST['dep'])?$_POST['dep']:"";
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getVipUserNews(json_encode($map));
		$resMap['lendCount'] = $data->lendCount;
		$resMap['lendDay'] = $data->lendDay;
		$resMap['userId'] = isset($_POST['userId'])?$_POST['userId']:"";
		$resMap['roleId'] =  isset($_POST['roleId'])?$_POST['roleId']:"";
		return $this->renderTemplate($resMap);
	}
	function saveVipRelendCount(){
		$datas = array();
		$datas = $_POST['datas']; 
		$Proxy = $this->exec('getProxy','escloud_usingformws');
		$userId = isset($_POST['userId'])?$_POST['userId']:'0';
		$roleId = isset($_POST['roleId'])?$_POST['roleId']:'0';
		$map =array();
		$map['roleId'] = $roleId;
		$map['userId'] =$userId;
		$map['data'] = $datas;
		$result = $Proxy->saveVipRelendCount(json_encode($map));
		echo json_encode($result);
	}
	function saveVipUser(){
		$map = array();
		$map['userId'] = isset($_POST['userId'])?$_POST['userId']:"";
		$map['roleId'] = isset($_POST['roleId'])?$_POST['roleId']:"";
		$map['lendDay'] = isset($_POST['lendDay'])?$_POST['lendDay']:"";
		$map['lendCount'] = isset($_POST['lendCount'])?$_POST['lendCount']:"";
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->saveVipUser(json_encode($map));
		echo $data;
	}
	function saveTempUser(){
		$map = array();
		$map['id'] = isset($_POST['id'])?$_POST['id']:"";
		$map['userName'] = isset($_POST['userName'])?$_POST['userName']:"";
		$map['dep'] = isset($_POST['dep'])?$_POST['dep']:"";
		$map['identity'] = isset($_POST['identity'])?$_POST['identity']:"";
		$map['phone'] = isset($_POST['phone'])?$_POST['phone']:"";
		$map['email'] = isset($_POST['email'])?$_POST['email']:"";
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->saveTempUser(json_encode($map));
		echo $data;
	}
	function  getTempUsers(){
		$map = array();
		$map['keyWord'] = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp).'';
		$limit = ($rp*$page).'';
		$map['start'] = $start;
		$map['limit'] = $limit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->getTempUsers(json_encode($map));
		$total = $data->count;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$lists = $data->list;
		$row = 1;
		foreach($lists as $list){
			if(!isset($_GET['showUser'])){
				$input = '<input type="checkbox" name="tempUser" value="'.$list->id.'|'.$list->userName.'|'.$list->dep.'|'.$list->identity.'|'.$list->phone.'|'.$list->email.'">';
			}else{
				$input = '<input type="radio" name="tempUser" value="'.$list->id.'|'.$list->userName.'|'.$list->dep.'|'.$list->identity.'|'.$list->phone.'|'.$list->email.'">';
			}
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'cbox'=> $input,
							'id'=>$list->id,
							'userName'=>$list->userName,
							'dep'=>$list->dep,
							'identity'=>$list->identity,
							'phone'=>$list->phone,
							'email'=>$list->email,
							'edit'=>'<span class="" ></span>'
					)
			);
			$row ++;
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	function editTempUser(){
		$map = array();
		$map['userName'] = isset($_POST['userName'])?$_POST['userName']:"";
		$map['dep'] = isset($_POST['dep'])?$_POST['dep']:"";
		$map['identity'] = isset($_POST['identity'])?$_POST['identity']:"";
		$map['phone'] = isset($_POST['phone'])?$_POST['phone']:"";
		$map['email'] = isset($_POST['email'])?$_POST['email']:"";
		$map['id'] = isset($_POST['id'])?$_POST['id']:"";
		echo $this->renderTemplate($map);
	}
	function deleteTampUsers(){
		$map = array();
		$map['id'] = isset($_POST['id'])?$_POST['id']:"";
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->deleteTampUsers(json_encode($map));
		echo  $data;
	}
	/**
	 * shimiao 字段中已经存在的字段自动不予添加
	 */
	public function showFormDataGrid(){
		$map= array();
		$map[0] = array();
		$map[0]['field'] = "借阅人";
		$map[0]['metadata']='';
		$map[0]['text'] = '文本';
		$map[0]['isNull'] = true;
		$map[0]['length'] = '50';
		$map[0]['doLength']='0';
		$map[0]['desc']='借阅档案的利用人！';
		$map[0]['edit'] = false;
		
		
		$map[1] = array();
		$map[1]['field'] = "单位";
		$map[1]['metadata']='';
		$map[1]['text'] = '文本';
		$map[1]['isNull'] = false;
		$map[1]['length'] = '50';
		$map[1]['doLength']='0';
		$map[1]['desc']='借阅档案的利用人所在的单位';
		$map[1]['edit'] = false;
		
		
		$map[2] = array();
		$map[2]['field'] = "电话";
		$map[2]['metadata']='';
		$map[2]['text'] = '文本';
		$map[2]['isNull'] = false;
		$map[2]['length'] = '20';
		$map[2]['doLength']='0';
		$map[2]['desc']='借阅档案的利用人的联系电话';
		$map[2]['edit'] = false;
		
		
		$map[3] = array();
		$map[3]['field'] = "邮箱";
		$map[3]['metadata']='';
		$map[3]['text'] = '文本';
		$map[3]['isNull'] = false;
		$map[3]['length'] = '50';
		$map[3]['doLength']='0';
		$map[3]['desc']='借阅档案的利用人的邮箱';
		$map[3]['edit'] = false;
		
		
		$map[4] = array();
		$map[4]['field'] = "利用目的";
		$map[4]['metadata']='';
		$map[4]['text'] = '文本';
		$map[4]['isNull'] = true;
		$map[4]['length'] = '50';
		$map[4]['doLength']='0';
		$map[4]['desc']='借阅档案的利用目的';
		$map[4]['edit'] = false;
		
		
		$map[5] = array();
		$map[5]['field'] = "催还提前天数";
		$map[5]['metadata']='';
		$map[5]['text'] = '数值';
		$map[5]['isNull'] = true;
		$map[5]['length'] = '9';
		$map[5]['doLength']='0';
		$map[5]['desc']='借阅档案的提前几天给出提示消息';
		$map[5]['edit'] = false;
		
		
		$map[6] = array();
		$map[6]['field'] = "登记人";
		$map[6]['metadata']='';
		$map[6]['text'] = '文本';
		$map[6]['isNull'] = true;
		$map[6]['length'] = '50';
		$map[6]['doLength']='0';
		$map[6]['desc']='记录借阅档案信息的工作人员姓名';
		$map[6]['edit'] = false;
		
		$map[7] = array();
		$map[7]['field'] = "登录日期";
		$map[7]['metadata']='';
		$map[7]['text'] = '文本';
		$map[7]['isNull'] = true;
		$map[7]['length'] = '10';
		$map[7]['doLength']='0';
		$map[7]['desc']='记录借阅档案信息的日期';
		$map[7]['edit'] = false;
		
		$map[8] = array();
		$map[8]['field'] = "状态";
		$map[8]['metadata']='';
		$map[8]['text'] = '文本';
		$map[8]['isNull'] = true;
		$map[8]['length'] = '10';
		$map[8]['doLength']='0';
		$map[8]['desc']='记录借阅档案信息的状态';
		$map[8]['edit'] = false;
		
		$map[9] = array();
		$map[9]['field'] = "身份证";
		$map[9]['metadata']='';
		$map[9]['text'] = '文本';
		$map[9]['isNull'] = false;
		$map[9]['length'] = '50';
		$map[9]['doLength']='0';
		$map[9]['desc']='借阅档案的利用人的身份证';
		$map[9]['edit'] = false;
		
		
		$map[10] = array();
		$map[10]['field'] = "备注";
		$map[10]['metadata']='';
		$map[10]['text'] = '文本';
		$map[10]['isNull'] = false;
		$map[10]['length'] = '200';
		$map[10]['doLength']='0';
		$map[10]['desc']='借阅档案的具体信息';
		$map[10]['edit'] = false;
		return $map;
	}
	public function showStoreDataGrid(){
		$map[0] = array();
		$map[0]['field'] = "档号";
		$map[0]['metadata']='';
		$map[0]['text'] = '文本';
		$map[0]['isNull'] = 'true';
		$map[0]['length'] = '4000';
		$map[0]['doLength']='0';
		$map[0]['desc']='';
		$map[0]['edit'] = false;
		
		$map[1] = array();
		$map[1]['field'] = "题名";
		$map[1]['metadata']='';
		$map[1]['text'] = '文本';
		$map[1]['isNull'] = 'true';
		$map[1]['length'] = '4000';
		$map[1]['doLength']='0';
		$map[1]['desc']='';
		$map[1]['edit'] = false;
		
		$map[2] = array();
		$map[2]['field'] = "借阅类型";
		$map[2]['metadata']='';
		$map[2]['text'] = '文本';
		$map[2]['isNull'] = 'true';
		$map[2]['length'] = '10';
		$map[2]['doLength']='0';
		$map[2]['desc']='';
		$map[2]['edit'] = false;
		
		$map[3] = array();
		$map[3]['field'] = "状态";
		$map[3]['metadata']='';
		$map[3]['text'] = '文本';
		$map[3]['isNull'] = 'true';
		$map[3]['length'] = '10';
		$map[3]['doLength']='0';
		$map[3]['desc']='';
		$map[3]['edit'] = false;
		
		$map[4] = array();
		$map[4]['field'] = "发生日期";
		$map[4]['metadata']='';
		$map[4]['text'] = '文本';
		$map[4]['isNull'] = 'true';
		$map[4]['length'] = '20';
		$map[4]['doLength']='0';
		$map[4]['desc']='';
		$map[4]['edit'] = false;
		
		$map[5] = array();
		$map[5]['field'] = "卷数";
		$map[5]['metadata']='';
		$map[5]['text'] = '数值';
		$map[5]['isNull'] = 'true';
		$map[5]['length'] = '11';
		$map[5]['doLength']='0';
		$map[5]['desc']='';
		$map[5]['edit'] = false;
		
		$map[6] = array();
		$map[6]['field'] = "件数";
		$map[6]['metadata']='';
		$map[6]['text'] = '数值';
		$map[6]['isNull'] = 'true';
		$map[6]['length'] = '11';
		$map[6]['doLength']='0';
		$map[6]['desc']='';
		$map[6]['edit'] = false;
		
		$map[7] = array();
		$map[7]['field'] = "备注";
		$map[7]['metadata']='';
		$map[7]['text'] = '文本';
		$map[7]['isNull'] = 'true';
		$map[7]['length'] = '200';
		$map[7]['doLength']='0';
		$map[7]['desc']='';
		$map[7]['edit'] = false;
		
		return $map;
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
// 		$medata_list = $medataProxy->getMetadata(1,$page,$rp);
// 		$total = $medata_list->total;
		//print_r($medata_list); die();
		$map = array();
		$map['keyword'] = isset($_POST['query']['keyWord'])?$_POST['query']['keyWord']:'';
		$map['start'] = ($page-1)*$rp.'';
		$map['limit'] = $rp.'';
	    $medata_list = $medataProxy->getMetadataByKeyword(json_encode($map));
	    $total = $medata_list->count;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($medata_list->list AS $row)
			{
				$entry = array('id'=>$row->id,
						// radio name ident type search desc
						'cell'=>array(
								'radio'=>'<input type="radio" name="metadata" value="'.$row->id.'|'.$row->esidentifier.'">',
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
	public function saveField(){
		$field = isset($_POST['field'])?$_POST['field']:'';
		$id = isset($_POST['id'])?$_POST['id']:'';
		$type = isset( $_POST['type'])? $_POST['type']:'';
		$length = isset($_POST['length'])?$_POST['length']:'';
		$doLength = isset($_POST['doLength'])?$_POST['doLength']:'';
		$isNull= isset($_POST['isNull'])?$_POST['isNull']:'';
		$des = isset($_POST['desc'])?$_POST['desc']:'';
		$metadata = isset($_POST['metaData'])?$_POST['metaData']:'';
		$map = array();
		$map['field'] = $field;
		$map['id'] = $id;
		$map['type'] = $type;
		if($id != ''){
			$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL');
			$typecn = array('文本','数值','日期','浮点','时间','布尔');
			foreach ($typecn as $n => $type1)
			{
				if($type1 == $type) $map['type'] = $typeen[$n];
			}
		}
		$map['length'] = $length;
		$map['doLength'] = $doLength;
		$map['isNull'] = $isNull;
		$map['desc'] = $des;
		$map['metaData'] = $metadata;
		$map['data'] = isset($_POST['data'])?$_POST['data']:'';
		$map['metaDataId'] = isset($_POST['metaDataId'])?$_POST['metaDataId']:'0';
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$data=$proxy->saveUsingField(json_encode($map));
		echo  json_encode($data);
		
	}
	public function getUsingFields(){
		$data = $_GET['data'];
		$page=$_POST['page'];
		$page = isset($page) ? $page : 1;
		$rp=$_POST['rp'];
		$start = (($page-1)*$rp);
		$limit = ($rp*$page);
		$map = array();
		$map['data'] = $data;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getUsingFields(json_encode($map));
		$total = $res->count;
		if($data == 'form'){
			$jsonData = array('page'=>$page,'total'=>($total+11),'rows'=>array());
		}else{
			$jsonData = array('page'=>$page,'total'=>($total+8),'rows'=>array());
			
		}
		$id = 0;
		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOLEAN');
		$typecn = array('文本','数值','日期','浮点','时间','布尔');
		if($data == 'form'){
			$resData = $this->showFormDataGrid();
		}else{
			$resData = $this->showStoreDataGrid();
		}
			$count = 0;
			for($i = 0;$i<count($resData);$i++){
					$rowData = $resData[$i];
					$entry = array('id'=>$id,
							'cell'=>array(
									'ESIDENTIFIER'=>$rowData['field'],
									'id'=>'0',
									'cbox'=>'<input type="checkbox" name="fieldCheck'.$data.'"  value = "0|false"/>',
									'METADATA'=>isset($rowData['metadata'])?$rowData['metadata']:'',
									'ESTYPE'=>$rowData['text'],
									'ESISNULL'=>$rowData['isNull']==true?'是':'否',
									'ESLENGTH'=>$rowData['length'],
									'ESDOTLENGTH'=>isset($rowData['doLength'])?$rowData['doLength']:'',
									'ESDESCRIPTION'=>isset($rowData['desc'])?$rowData['desc']:'',
									'METADATAID' =>isset($rowData['metaDataId'])?$rowData['metaDataId']:'',
									'edit'=>false,
									'system'=>'是'
							),
					);
					if($count >= $start && $count< $limit){
						$jsonData['rows'][] = $entry;
					}
					$count ++;
					$id++;
				}
			if($total>0){
				
				foreach($res->data AS $row)
				{
					foreach ($typeen as $n => $type)
					{
						if($type == $row->type) $ESTYPE = $typecn[$n];
					}
			
					$entry = array('id'=>$id,
							'cell'=>array(
									'ESIDENTIFIER'=>$row->field,
									'id'=>$row->id,
									'cbox'=>'<input type="checkbox" name="fieldCheck'.$data.'"  value =
									"'.$row->id.'|'.true.'|'.$row->field.'|'.$row->id
									.'|'.$row->metaData.'|'.$row->type.'|'.$row->isNull
									.'|'.$row->length.'|'.$row->doLength.'|'.$row->desc
									.'|'.$row->metaDataId.'"/>',
									'METADATA'=>$row->metaData,
									'ESTYPE'=>$ESTYPE,
									'ESISNULL'=>$row->isNull==1?'是':'否',
									'ESLENGTH'=>$row->length,
									'ESDOTLENGTH'=>$row->doLength,
									'ESDESCRIPTION'=>$row->desc,
									'METADATAID' =>$row->metaDataId,
									'edit'=>true,
									'system'=>'否'
							),
					);
					if($count >= $start && $count< $limit){
						$jsonData['rows'][] = $entry;
					}
					$count ++;
					$id ++;
				}
			}
		echo json_encode($jsonData);
	}
	public function editField(){
		$map = array();
		$map['id'] = $_POST['id'];
		$map['field'] = $_POST['field'];
		$map['metaData'] = $_POST['metaData'];
// 		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL');
// 		$typecn = array('文本','数值','日期','浮点','时间','布尔');
// 		foreach ($typeen as $n => $type)
// 		{
// 			if($type == $_POST['type']) $map['type'] = $typecn[$n];
// 		}
		$map['type']=$_POST['type'];
		$map['isNull'] = $_POST['isNull']==0?'false':'true';
		$map['length'] = $_POST['length'];
		$map['doLength'] = $_POST['doLength'];
		$map['desc'] = $_POST['desc'];
		$map['metaDataId'] = $_POST['metaDataId'];
		return $this->renderTemplate($map);
	}
	public function deleteField(){
		$map = array();
		$map['id'] = $_POST['id'];
		$map['data'] = $_POST['data'];
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->deleteUsingField(json_encode($map));
		echo $res;
	}
	public function checkTempUserIdLive(){
		$map =array();
		$map['userName'] = $_POST['userName'];
		$map['identity'] = $_POST['identity'];
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res=$proxy->getTempUserByUserName(json_encode($map));
		echo $res;
	}
}

?>