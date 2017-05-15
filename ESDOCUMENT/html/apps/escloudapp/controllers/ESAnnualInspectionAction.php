<?php
/**
 *
 * @author wangtao
 * 档案年检
 */
class ESAnnualInspectionAction extends ESActionBase{
	
	public function index(){
		
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 根据机构号获取档案归档情况
	 */
	public function  getOrgArchive()
	{
		
		$request=$this->getRequest();
		$orgID=$request->getPost('orgID');//获取当前机构号
		$archiveType=$request->getPost('archiveType');//获取查询的档案类型
		$year=$request->getPost('year');//获取查询年份
		$proxy=$this->exec('getProxy','escloud_yearlyInspectionws');
		$data=$proxy->getOrgArchive($orgID,$archiveType,$year);
		$data=json_decode(json_encode($data),true);
		$count=0;
		foreach ($data as $k=>$val){
			if($k=='不归档库'){
				unset($data[$k]);
				continue;
			}
			$count+=intval($val);
		}
		$result=array();
		
		foreach ($data as $key=>$val){
			if($count!=0){
					$result[$key]['percent']=sprintf('%.2f',intval($val)/$count*100);
					$result[$key]['num']=intval($val);
			}else{
				$result[$key]['percent']=sprintf('%.2f',intval($val));
				$result[$key]['num']=intval($val);
			}
		}
		
		echo json_encode($result);
		
	}
	/**
	 * @author wangtao
	 * @param appId
	 * @param appToken
	 * @param processDefinitionKey  fileInspectProcess
	 * @param businessKey nianjian+毫秒数
	 * @param userId
	 * @param leaderId
	 * @param map{title,year,level,receive_user,receive_company,start_company,start_user,mark}
	 * 发起督办
	 */
	public function addTask()
	{
		$request=$this->getRequest();
		$pendingData=$request->getPost();
 		//$port    = $_SERVER['SERVER_PORT'] == 80 ? '' : ':'.$_SERVER['SERVER_PORT'];
		/*$host	 = isset($_SERVER['HTTP_X_FORWARDED_HOST']) ? $_SERVER['HTTP_X_FORWARDED_HOST'] : (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '');
		$url = 'http://'.$host.'/escloudapp/0/default/ESCollaborative/index';*/
		$userInfo=$this->getUser()->getInfo();
		$processDefinitionKey = 'fileInspectProcess';
		$businessKey = 'nianjian'.microtime(true)*10000;
		$userId=$this->getUser()->getId();
		$leaderId = $pendingData['pendingUserID'];
		$map = array(
		  "title" => trim($pendingData['title']),
		  "year" => trim($pendingData['year']),
		  "level" => trim($pendingData['level']),
		  "receive_user" => trim($pendingData['pendingUserName']),
		  "receive_company" => trim($pendingData['receive_company']),
		  "start_company" => trim($pendingData['start_company']),
		  "start_user" => trim($pendingData['start_user']),
		  "mark" => trim($pendingData['desc'])
		);
		//print_r($map);exit;
		$proxy=$this->exec('getProxy','escloud_usingformws');
		$res = $proxy->startInspectProcess($processDefinitionKey,$businessKey,$userId,$leaderId,json_encode($map));
		if($res) {
			$info = array('status' => $res, 'msg'=>'操作成功！');
		} else {
			$info = array('status' => $res, 'msg'=>'操作失败！');
		}
		header("Content-type:application/json; charset=utf-8");
		echo json_encode($info);
		/*	
		$pending = array(
		 array(
		 		'pendingCode'=>'DigitArchives'+time(),
		 		'pendingTitle' => $pendingData['title'],
		 		'pendingDate' => date('YmdHms'),
		 		'pendingUserID' => $pendingData['pendingUserID'],
		 		'pendingURL' => $url,
		 		'pendingStatus' => '0',
		 		'pendingLevel' => $pendingData['level'],
		 		'pendingCityCode' => 'na',
		 		'pendingSourceUserID' => $userInfo['id'],
		 		'pendingSource' => $userInfo['userName'],
		 		'pendingNote' => 'na012')
		);
		$proxy=$this->exec('getProxy','taskapp');
		$result=$proxy->addPending($pending);
		foreach ($result as $v)
		{
			$s=$v;
		}
		echo $s;*/
	
	}
	/**
	 * @author wangtao
	 * 根据用户获取机构树，如果是总部的用户则获取所有机构
	 */
	public function initOrg(){
		$proxy = $this->exec('getProxy','escloud_usingformws');
		$userId= $this->getUser()->getId();
		$lists = $proxy->getOrg($userId);
		if($lists->mainSite=='hq'){
			$proxy = $this->exec('getProxy','escloud_archiveorganws');
			$lists = $proxy->gettree("0000");
			$result = array();
			foreach ($lists as $k=>$val){
				$result[$k]["name"] = $val->orgName;
				$result[$k]["pId"] = isset($val->parentOrgCode)?$val->parentOrgCode:'0';
				$result[$k]["id"] = $val->orgid;
				$result[$k]["isParent"] = true;
			}
			echo json_encode($result);
		}else{
			$Nodes[] = array(
					'name'=>$lists->orgName,
					'pId'=>isset($lists->parentOrgCode)?$lists->parentOrgCode:'0',
					'id'=>$lists->orgid,
					'isParent'=>true,
					'open'=>true
			);
			$orgId = $lists->orgid;
			$orglist = $proxy->getSubOrg($orgId);
			foreach ($orglist as $val)
			{
				$Nodes[] = array(
						'name'=>$val->orgName,
						'pId'=>isset($val->parentOrgCode)?$val->parentOrgCode:'0',
						'id'=>$val->orgid,
						'isParent'=>true
				);
			}
			echo json_encode($Nodes);
		}
	}
}