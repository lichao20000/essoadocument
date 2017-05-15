<?php 
/**
 * 
 * @author ldm
 *
 */
class ESReadingRoomAction extends ESActionBase
{
	/**
	 * 表格数据显示
	 * @author ldm
	 */
	public function data_json(){
		/*$param = $_GET['param'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] :20;
		if ($param=='a'){
			$this->jieyue_json($page,$rp);
			return;
		}else{
			$this->bianyan_json($page,$rp);
			return;
		}*/
	}
	/**
	 * 载入右边表格
	 * @author ldm
	 */
	public function righttable(){
		$archiveType = @$_REQUEST['archiveType'];
		$archiveTypeEngLish = @$_REQUEST['archiveTypeEngLish'];
		if ($archiveType=="")return;
		$proxy = $this->exec('getProxy','escloud_structurews');
		$fields = $proxy->getPathColumnByIdStructure(json_encode(array('idStructure'=>$_REQUEST['idStructure'])));
		$data = array();
		$i = 0;
		switch($archiveTypeEngLish) {
			case 'document':
			case 'contract':
				foreach($fields as $k=>$v) {				
					if(in_array($v->englishName, array('Title','CreateDate','Creator','OADocumentType','RecordID'))) {
						if($v->englishName=='Title') $k = 3;
						$data[$k]['display'] = $v->chinaName;
						$data[$k]['name']    = $v->englishName;
						$data[$k]['width']   = 140;
						$data[$k]['sortable']= false;
						$data[$k]['align']   = 'center';
						$i++;
					}
				}
				ksort($data);
				break;
			case 'project_file':
			case 'project_innerFile':
			case 'purchase_file':
				foreach($fields as $k=>$v) {				
					if(in_array($v->englishName, array('Title','FilesID','ArchiveOrgan','ArchiveDate'))) {
						$data[$i]['display'] = $v->chinaName;
						$data[$i]['name']    = $v->englishName;
						$data[$i]['width']   = 80;
						$data[$i]['sortable']= false;
						$data[$i]['align']   = 'center';
						$i++;
					}
				}
				break;				
			case 'purchase_innerFile':
				foreach($fields as $k=>$v) {				
					if(in_array($v->englishName, array('Title','FilesID','ProjectName','ProjectID'))) {
						$data[$i]['display'] = $v->chinaName;
						$data[$i]['name']    = $v->englishName;
						$data[$i]['width']   = 80;
						$data[$i]['sortable']= false;
						$data[$i]['align']   = 'center';
						$i++;
					}
				}
				break;
			case 'accounting':
				foreach($fields as $k=>$v) {				
					if(in_array($v->englishName, array('CreateDate','Creator','Summary','RecordID'))) {
						if($v->englishName=='Summary') $k = 5;
						$data[$k]['display'] = $v->chinaName;
						$data[$k]['name']    = $v->englishName;
						$data[$k]['width']   = 140;
						$data[$k]['sortable']= false;
						$data[$k]['align']   = 'center';
						$i++;
					}
				}
				ksort($data);
				break;				
		}

		array_unshift($data,array(
			'display'  => '序号',
		    'name'     => 'lineNumber',
		    'width'    => 30,
		    'sortable' => false,
		    'align'    => 'center'
		), array(
			'display'  => '查看',
		    'name'     => 'reading',
		    'width'    => 40,
		    'sortable' => false,
		    'align'    => 'center'		
		));
		return $this->renderTemplate(array('archiveType'=>$archiveType,'archiveTypeEngLish'=>$archiveTypeEngLish,'data'=>json_encode($data)));
	}
	/**
	 * 借阅数据显示
	 * @author ldm
	 * @param unknown_type $page
	 * @param unknown_type $rp
	 */
	public function jieyue_json($page,$rp,$archiveTypeEngLish){
		$proxy = $this->exec('getProxy','escloud_businesseditws');
		$userId = $this->getUser()->getId();
		$archiveType = $_REQUEST['archiveType'];
		$param = json_encode(array('userId'=>$userId,'archiveType'=>$archiveTypeEngLish));
		$lists = $proxy->findPathList($param);
		$total = count($lists);
		$lists = array_slice($lists,($page-1)*$rp,$rp);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($lists as $k => $val){
			// 判断属性是否为空
			$Creator = property_exists($val, 'Creator') ? $val->Creator : null;
			$Title = property_exists($val, 'Title') ? $val->Title : null;
			$RecordID = property_exists($val, 'RecordID') ? $val->RecordID : null;
			$path = property_exists($val, 'path') ? $val->path : null;
			$OADocumentType = property_exists($val, 'OADocumentType') ? $val->OADocumentType : null;
			$CreateDate = property_exists($val, 'CreateDate') ? $val->CreateDate : null;
			$Summary = property_exists($val, 'Summary') ? $val->Summary : null;
			$entry = array('id'=>$path,
					'cell'=>array(
							'lineNumber'=>$k+1,
							'reading'=>"<input type='button' id='".$path."' name='readme' class='reaing' title='浏览电子文件' />",
							'Title'=>$Title,
							'CreateDate'=>$CreateDate,
							'Creator'=>$Creator,
							'OADocumentType'=>$OADocumentType,
							'RecordID'=>$RecordID,
							'Summary'=>$Summary
					),
			);
			$jsonData['rows'][] = $entry;
		}
		header("Content-type: application/json; charset=utf-8");
		echo json_encode($jsonData);
	}
	/**
	 * 编研数据展示
	 * @author ldm
	 */
	public  function bianyan_json($page,$rp)
	{
	    $userid = $this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$query = "publish";
		$lists = $proxy->findResearchFormList(json_encode(array("start"=>($page-1)*$rp,"limit"=>$rp,"condition"=>$query,"userId"=>$userid)));
		$total = array_pop($lists)->size;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($lists as $k=>$val){
			$entry = array('id'=>$val->id,
					'cell'=>array(
							'lineNumber'=>$k+1,
							'reading'=>"<input type='button' orgid='".$val->orgId."' id='".$val->content."' name='readme' class='reaing' title='浏览电子文件' />",
							'Title'=>$val->tm,
							'Date'=>$val->publishDate
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 编研查看
	 * @author ldm
	 */
	public function showedit(){
		$orgid = isset($_GET['orgid'])?$_GET['orgid']:"";
		$path =  isset($_GET['path'])?$_GET['path']:"";
		if ($orgid==""||$path=="")return;
		$proxy = $this->exec('getProxy','escloud_researchformws');
		$lists = $proxy->editParseHtml($path,$orgid);
		return $this->renderTemplate(array('content'=>$lists));
	}

	 /**
	  * 根据mainSite获取当前用户身份的档案类型
	  * @author niyang 2013-10-25
	  * @return json
	  */
	 public function getArchiveTypeByMainSite(){
	 	$userid = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_structurews');
	 	$data = $proxy->getArchiveTypeByMainSite(json_encode(array('userId'=>$userid)));
	 	//var_dump($data);exit;
	 	$arr = array();
		if(empty($data)===FALSE) {
			foreach($data as $k=>$v) {
				$arr[$k]['id']          = $k+3;
				$arr[$k]['pId'] = 1;
				$arr[$k]['isParent']    = false;
				if(in_array($v->archiveType, array('工程档案','采购档案'))) {
					$arr[$k]['isParent'] = true;
				}				
				$arr[$k]['name'] = $v->archiveType;
				$arr[$k]['archiveTypeEngLish'] = $v->archiveTypeEngLish;
				$arr[$k]['idStructure'] = $v->idStructure;
				
				/*
			 	$v->id = $k+3;
	 			$v->isParent = false;
	 			$v->pId = 1;
	 			if(in_array($v->archiveType, array('工程档案','采购档案'))) {
	 				$v->isParent = true;		 				
	 			}
	 			$v->name = $v->archiveType;
			 	$v->idStructure = $v->idStructure;*/
			}
			array_unshift($arr,
				array('id'=>1,'pId'=>0,'isParent'=>true,'name'=>'电子档案阅览','idStructure'=>0), 
				array('id'=>2,'pId'=>0,'isParent'=>false,'name'=>'编研成果阅览','idStructure'=>0)
			);
			/*
	 		$ob = clone $data[0];		 		
	 		$ob->pId = 0;
 			$ob->id = 1;
 			$ob->name = '电子档案阅览';
 			array_unshift($data,$ob);
 			$reob = clone $data[0];
 			$reob->id = 2;
	 		$reob->name = '编研成果阅览';
	 		array_unshift($data,$reob);
			var_dump($data);exit;*/
	 	
	 		header("Content-type: application/json; charset=utf-8");
	 		echo json_encode($arr);
	 	} else {
	 		echo json_encode(array());
	 	}
	 }
	 /**
	  * 查询工程和采购 案卷和卷内
	  * @author niyang 2013-10-28
	  * @return json
	  */
	 public function getProPurByIdStructure() {
	 	$info = array();
	 	if(empty($_REQUEST['idStructure'])===TRUE) {
	 		$info = array('status'=>-1,'data'=>array(),'msg'=>'idStructure为空！');
	 	} else {
			$proxy = $this->exec('getProxy','escloud_structurews');
			$res = $proxy->getProPurByIdStructure(json_encode(array('idStructure'=>$_REQUEST['idStructure'])));
			if(empty($res)===TRUE) {
				$info = array('status'=>-2,'data'=>array(),'msg'=>'请求Java后台服务返回数据结果为空！');
			} else {
				$info = array('status'=>200,'data'=>$res,'msg'=>'操作成功！');
			} 
	 	}
		header("Content-type: application/json; charset=utf-8");
		if($info['status']===200) {
			foreach($info['data'] as $k=>$v) {
				$v->id       = $k;
				$v->pId      = @$_REQUEST['id'];
				$v->isParent = false;
				$v->archiveTypeEngLish = $v->project_purchase;
				switch($v->project_purchase) {
					case 'project_file' :
						$v->name = '案卷目录'; break;
					case 'project_innerFile' :
						$v->name = '卷内目录'; break;
					case 'purchase_file' :
						$v->name = '案卷目录'; break;
					case 'purchase_innerFile' :
						$v->name = '卷内目录'; break;							
				}
			}
			echo json_encode($info['data']);
		} else {
			echo json_encode($info);
		}
		exit;
	 }

	 /**
	  * 获取数据列表
	  * @author niyang 2013-10-28
	  * @return json
	  */
	 public function getList() {
	 	$proxy = $this->exec('getProxy','escloud_structurews');
	 	$archiveType = $_REQUEST['archiveType'];
	 	$archiveTypeEngLish = $_REQUEST['archiveTypeEngLish'];
	 	if($archiveType==='编研成果阅览') {
	 		$page = isset($_POST['page']) ? $_POST['page'] : 1;
			$rp = isset($_POST['rp']) ? $_POST['rp'] :20;
			$this->bianyan_json($page,$rp);
	 		exit;
	 	}

		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] :20;
		$this->jieyue_json($page,$rp,$archiveTypeEngLish);
		exit; 
	 }
}


