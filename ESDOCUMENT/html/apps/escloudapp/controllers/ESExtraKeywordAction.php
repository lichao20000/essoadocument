<?php 
/**
 * @author xiaoxiong 20140823
 * 全文检索外挂词管理处理action
 */
class ESExtraKeywordAction extends ESActionBase{
	
	/**
	 * 主界面渲染方法
	 */
	public function index(){
		return $this->renderTemplate();
	}
	
	public function addExtraKeywordPage(){
		return $this->renderTemplate();
	}
	
	public function editExtraKeywordPage(){
		$keyword = $_POST['keyword'];
		$id = $_POST['id'];
		return $this->renderTemplate(array('keyword'=>$keyword, 'id'=>$id));
	}
	
	public function importPage(){
		return $this->renderTemplate();
	}
	
	public function getExtraKeywords(){
		$serarchKeyword = 	isset($_POST['query']) ? $_POST['query'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$proxy = $this->exec("getProxy", 'escloud_extraKeyword');
		$data['serarchKeyword'] = $serarchKeyword;
		$data['start'] = ($page-1)*$rp;
		$data['limit'] = $rp;
		$returnData = $proxy->getExtraKeywords(json_encode($data));
		$total = $returnData->total;
		$rows = $returnData->data;
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array(
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="extraKeywordCk" value="'.$row->id.'">',
							"operate"=>'<span class="editbtn"></span>',
							"id"=>$row->id,
							"keyword"=>$row->keyword
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	public function isHased(){
		$keyword = $_POST['keyword'];
		$id = $_POST['id'];
		$data['id'] = $id;
		$data['keyword'] = $keyword;
		$proxy = $this->exec("getProxy", 'escloud_extraKeyword');
		echo $proxy->isHased(json_encode($data));
	}
	
	public function addExtraKeyword(){
		$data['keyword'] = $_POST['keyword'];
		$proxy = $this->exec("getProxy", 'escloud_extraKeyword');
		$data['userId'] = $this->getUser()->getId();
		$data['userIp'] = $this->getClientIp();
		echo $proxy->addExtraKeyword(json_encode($data));
	}
	
	public function updateExtraKeyword(){
		$id = $_POST['id'];
		$keyword = $_POST['keyword'];
		$data['id'] = $id;
		$data['keyword'] = $keyword;
		$data['oldKeyword'] = $_POST['oldKeyword'];
		$data['userId'] = $this->getUser()->getId();
		$data['userIp'] = $this->getClientIp();
		$proxy = $this->exec("getProxy", 'escloud_extraKeyword');
		echo $proxy->updateExtraKeyword(json_encode($data));
	}
	
	public function removeExtraKeywords(){
		$data['ids'] = $_POST['ids'];
		$data['oldKeywords'] = $_POST['oldKeywords'];
		$data['userId'] = $this->getUser()->getId();
		$data['userIp'] = $this->getClientIp();
		$proxy = $this->exec("getProxy", 'escloud_extraKeyword');
		echo $proxy->removeExtraKeywords(json_encode($data));
	}
	
	public function GetImportUrl(){
		$proxy = $this->exec("getProxy", 'escloud_extraKeyword');
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		echo $proxy->GetImportUrl($userId,$userIp);
	}
	
	public function exportData(){
		$proxy=$this->exec('getProxy','escloud_extraKeyword');
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		echo $proxy->exportData($userId,$userIp);
		
	}
	
	/*
	 * 下载
	 */
	public function download(){
		$fileUrl = $_GET['fileName'];
		$filName=basename($fileUrl);
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	}
	
}
