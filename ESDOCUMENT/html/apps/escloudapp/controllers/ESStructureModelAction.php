<?php
/**
 * 结构模版定义
 * @author shimiao
 *@DATE 20140429
 */
class ESStructureModelAction extends ESActionBase
{

	/**
	 * shimiao 20140428 打开日志管理的时候，记录日志
	 */
	public function index()
	{
// 		$uId = $this->getUser()->getId();
// 		$class=$this->exec('getProxy','escloud_logservice');
// 		$map = array();
// 		$map['userid'] = $uId;
// 		$map['ip'] =$this->getip();
// 		$map['model'] = "日志管理";
// 		$flag=$class->saveAccessModel(json_encode($map));
		return $this->renderTemplate();
	}
	
	/** xiaoxiong 20140729 添加档案类型设置子功能 **/
	public function archiveTypeSet() {
		return $this->renderTemplate();
	}
	
	/** xiaoxiong 20140729 添加档案类型界面跳转 **/
	public function addArchiveType() {
		return $this->renderTemplate();
	}
	
	/** xiaoxiong 20140729 添加档案类型界面跳转 **/
	public function editArchiveType() {
		$values = $_POST['values'] ;
		$data = explode('|',$values);
		return $this->renderTemplate(array('data'=>$data));
	}
	
	/** xiaoxiong 20140729 获取分类列表 **/
	function getArchiveTypeSetList(){
		$map = array();
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = isset($_POST['query'])?$_POST['query']:'';
		$map['start'] = ($page-1)*$limit;
		$map['limit'] = $limit;
		$map['keyWord'] = $keyWord;
		$map['userId'] = $this->getUser()->getId();
		$map['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$class=$this->exec('getProxy','escloud_structureModelws');
		$data=$class->getArchiveTypeSetList(json_encode($map));
		$total = $data->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total<1){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $limit + 1; 
		foreach ($data->data as $list){
			$entry = array(
					'id'=>$list->ID,
					'cell'=>array(
							"startNum"=>$line++,
							"id"=>$list->ID,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="archiveTypeId" value="'.$list->ID.'_'.$list->used.'"id="archiveTypeId">',
							"modify"=>"<span class='editbtn' >&nbsp;</span>",
							'SKUNumber'=> $list->SKUNumber,
							'className'=> $list->className,
							'description'=> $list->description,
							'used'=> $list->used
					),
			);
	
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/** xiaoxiong 20140729 保存档案分类 **/
	public function saveArchiveType(){
		parse_str($_POST['data'],$out);
		$data=json_encode($out);
		$Proxy=$this->exec('getProxy','escloud_structureModelws');
		$result=$Proxy->saveArchiveType($data);
		echo $result;
	}
	
	/** xiaoxiong 20140729 判断档案分类是否已存在 **/
	public function isHased(){
		$map['id'] = $_POST['id'];
		$map['SKUNumber'] = $_POST['SKUNumber'];
		$map['className'] = $_POST['className'];
		$map['userId'] = $this->getUser()->getId();
		$map['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$Proxy=$this->exec('getProxy','escloud_structureModelws');
		$result=$Proxy->isHased(json_encode($map));
		echo $result;
	}
	
	/** xiaoxiong 20140729 删除档案分类 **/
	public function dropArchiveType(){
		$map['id'] = $_POST['id'];
		$map['userId'] = $this->getUser()->getId();
		$map['remoteAddr'] = $_SERVER["REMOTE_ADDR"];
		$Proxy=$this->exec('getProxy','escloud_structureModelws');
		$result=$Proxy->dropArchiveType(json_encode($map));
		echo $result;
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
	
	function saveOrUpdateModel(){
		/** xiaoxiong 20140729 动态获取档案类型下拉选项 **/
		$class=$this->exec('getProxy','escloud_structureModelws');
		$data=$class->getArchiveTypes();
		$id = isset($_POST['id']) ? $_POST['id'] : ""; 
		if($id == ""){
			return $this->renderTemplate(array('isEdit'=>false,'modelClass'=>'','archiveTypes'=>$data));
		}else{
			$modelType = $_POST['modelType'];
			$modelName = $_POST['modelName'];
			$modelDes = $_POST['modelDes'];
			$modelClass = $_POST['modelClass'];
			return $this->renderTemplate(array('isEdit'=>true,'id'=>$id, 'modelType'=>$modelType, 'modelName'=>$modelName, 'modelClass'=>$modelClass, 'modelDes'=>$modelDes,'archiveTypes'=>$data));
		}
	}
	function saveModel(){
		$param = array();
		$param['modelType'] = $_POST['modelType'];
		$param['modelName'] = $_POST['modelName'];
		$param['modelDes'] = $_POST['modelDes'];
		$param['modelClass'] = $_POST['modelClass'];
		$param['ip'] =$this->getip();
		$param['userid'] = $this->getUser()->getId();
		$param['bigOrgId'] = $this->getUser()->getBigOrgId();//liqiubo 20140618 加入saas支持
		if(isset($_POST['id'])){
			$param['id'] = $_POST['id'];
		}
		$Proxy=$this->exec('getProxy','escloud_structureModelws');
		$result=$Proxy->saveModel(json_encode($param));
		echo json_encode($result);
	}
	
	function getModelData(){
		$map = array();
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		$map['business'] = "archive";
		$map['start'] = $page; 
		$map['limit'] = $limit;
		$map['keyWord'] = $keyWord;
		$map['bigOrgId'] = $this->getUser()->getBigOrgId();//liqiubo 20140618 加入saas支持
		$class=$this->exec('getProxy','escloud_structureModelws');
		$data=$class->getModelData(json_encode($map));
		
		$total = $data->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if($total<1){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $limit + 1; // 1-20, 21-40,41-60
		foreach ($data->data as $list){
			$modelType = '';
			if('innerFile' == $list->modelType){
				$modelType = '卷内';
			}else if('file' == $list->modelType){
				$modelType = '案卷-卷内';
			}
			$entry = array(
					'id'=>$list->modelId,
					'cell'=>array(
							'line'=> $line++,
							'cb'=>'<input boxid="'.$list->modelId.'" type="checkbox" name="checks" class="selectone"  ln="'. ($line-1) .'" value="'.$list->modelId.'">',
							'details'=> "<input type='button' class='details' />",
							'modelName'=> $list->modelName,
							'modelClass'=> $list->modelClass,
							'modelDes'=> $list->modelDes,
							'modelId'=> $list->modelId,
							'modelTypeHide'=>$list->modelType,
							'modelClassHide'=>$list->modelClassHide,
							'modelType'=> $modelType
					),
			);
		
			$jsonData['rows'][] = $entry;
		}
		
		//print_r($jsonData);die;
		echo json_encode($jsonData);
	}
	function getModelTags(){
		$modelId = $_GET['modelId'] ;
		$modelType = $_GET['modelType'];
		$data = array('modelId'=> $modelId,	'modelType'=>$modelType);
		return $this->renderTemplate($data);
	}
	function getModelTags1(){
		$modelId = $_GET['modelId'] ;
		$modelTags = $_GET['tagType'];
	}
	function getTagForModel(){
		$modelId = $_GET['modelId'] ;
		$modelTags = $_GET['modelType'];
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$map = array();
		$map['start'] = $page;
		$map['limit'] = $limit;
		$map['modelId'] = $modelId;
		$map['modelType'] = $modelTags;
		$class=$this->exec('getProxy','escloud_structureModelws');
		$data=$class->getTagForModel(json_encode($map));
		$total = $data->total;
		
// 		$typeen = array('TEXT','NUMBER','DATE','FLOAT','TIME','BOOL','CLOB','RESOURCE');
// 		$typecn = array('文本','数值','日期','浮点','时间','布尔','大文本','资源');
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach($data->data as $row){
		
// 				foreach ($typeen as $n => $type)
// 				{
// 					if($type == $row->ESTYPE) $ESTYPE = $typecn[$n];
// 				}
		
				switch ($row->ESISNULL){
					case "0": $ESISNULL = '否'; break;
					case "1": $ESISNULL = '是'; break;
				}
				switch ($row->ESISEDIT){
					case "0": $ESISEDIT = '否'; break;
					case "1": $ESISEDIT = '是'; break;
				}
				$entry = array(
						'id'=>$row->ID,
						'cell'=>array(
								'cbox'=>'<input type="checkbox" class="sinputItem" name="sinputB" value="'.$row->ID.'">',
								'ESIDENTIFIER'=>$row->ESIDENTIFIER,
								'METADATA'=>$row->METADATA,
								'ESTYPE'=>$row->ESTYPE,
								'ESISNULL'=>$ESISNULL,
								'ESISEDIT'=>$ESISEDIT,
								'ESLENGTH'=>$row->ESLENGTH,
								'ESDOTLENGTH'=>$row->ESDOTLENGTH,
								'ESDESCRIPTION'=>$row->ESDESCRIPTION
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		//var_dump($jsonData);die;
		echo json_encode($jsonData);
	}
	function saveTagForModel(){
		$map = array();
		$modelId = $_POST['modelId'];
		$modelType = $_POST['type'];
		$map['modelId'] = $modelId;
		$map['modelType'] = $modelType;
		$datas = array();
		$datas = $_POST['datas'];
		$Proxy = $this->exec('getProxy','escloud_structureModelws');
		$map['datas'] = $datas;
		$result = $Proxy->saveTagsForModel(json_encode($map));
		echo json_encode($result);
	}
	
	/**
	 * 删除模版
	 */
	function deleteModel(){
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$ip = $this->getip();
		$params = json_encode(array('id'=>$id,'userId'=>$userId,'ip'=>$ip));
		$proxy = $this->exec('getProxy','escloud_structureModelws');
		$result = $proxy->deleteModel($params);
		echo json_encode($result);
	}
	
	/**
	 * 导出模版
	 */
	function exportModel(){
		$id = $_POST['id'];
		$userId = $this->getUser()->getId();
		$ip = $this->getip();
		$params = json_encode(array('id'=>$id,'userId'=>$userId,'ip'=>$ip));
		$proxy = $this->exec('getProxy','escloud_structureModelws');
		$result = $proxy->exportModel($params);
		echo json_encode($result);
	}
	
	/**
	 * 导出tag
	 */
	function exportTags(){
		$id = $_GET['id'];
		$type = $_GET['type'];
		$idString = $_GET['idString'];
		$userId = $this->getUser()->getId();
		$ip = $this->getip();
		$params = json_encode(array('id'=>$id, 'type'=>$type, 'ip'=>$ip, 'idString'=>$idString, 'userId'=>$userId));
		$proxy = $this->exec('getProxy','escloud_structureModelws');
		$result = $proxy->exportTags($params);
		echo json_encode($result);
	}
	
	function importTagsBefore(){
		$id = $_GET['id'];
		$type = $_GET['type'];
		$userId = $this->getUser()->getId();
		$ip = $this->getip();
		return $this->renderTemplate(array('id'=>$id, 'type'=>$type, 'ip'=>$ip, 'userId'=>$userId));
	}
	
	/**
	 * 下载文件
	 */
	function download(){
		$url = $_GET['url'];
		$filName=basename($url);
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		return readfile($url);
	}
	
	function getImportStructureUrl(){
		$proxy=$this->exec('getProxy','escloud_structureModelws');
		$data=$proxy->getRestUrl("importModel");
		echo $data;
	}
	
	/**
	 * 获取导入字段的rest服务的url
	 */
	function getImportTagsUrl(){
		$proxy=$this->exec('getProxy','escloud_structureModelws');
		$data=$proxy->getRestUrl("importTags");
		echo $data;
	}
	
	function deleteTags(){
		$ids = $_POST['ids'];
		$userId = $this->getUser()->getId();
		$ip = $this->getip();
		$params = json_encode(array('ids'=>$ids, 'userId'=>$userId, 'ip'=>$ip));
		$proxy=$this->exec('getProxy','escloud_structureModelws');
		$result = $proxy->deleteTags($params);
		echo json_encode($result);
	}
	
	/**
	 * @author wanghongchen 20140903
	 * 元数据集的包含的元数据显示
	 */
	public  function meta_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$medataProxy = $this->exec('getProxy','escloud_metadataws');
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
				$estype = $row->estype;
				$esType = '文本';
				switch ($estype){
					case 'TEXT': $esType = '文本';break;
					case 'NUMBER': $esType = '数值';break;
					case 'DATE': $esType = '日期';break;
					case 'FLOAT': $esType = '浮点';break;
					case 'TIME': $esType = '时间';break;
					case 'BOOL': $esType = '布尔';break;
					default : $esType = '文本';
				}
				$entry = array('id'=>$row->id,
						'cell'=>array(
								'radio'=>'<input type="radio" name="metadata" value="'.$row->id.'|'.$row->esidentifier.'">',
								'name'=>$row->estitle,
								'ident'=>$row->esidentifier,
								'type'=>$esType,
								'search'=>$row->esismetadatasearch ? '是' : '否',
								'desc'=>$row->esdescription
						),
				);
				$jsonData['rows'][] = $entry;
			}
		}
		echo json_encode($jsonData);
	}
}
?>