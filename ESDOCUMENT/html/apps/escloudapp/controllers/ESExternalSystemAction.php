<?php
/**
 * 业务系统设置
 * @author yzh
 * @Date   2013-05-22
 *
 */
class ESExternalSystemAction extends ESActionBase{
	/**
	 * 业务系统设置首页
	 * @return string
	 */
	public function index(){
		return $this->renderTemplate();
	}
	/**
	 * 跳到指定的添加业务系统表单页面
	 * @author yzh
	 * @date   2013-05-22
	 */
	public function add(){
		return $this->renderTemplate();
	}
	/**
	 * 添加及修改表单数据的保存方法
	 * @author yzh
	 * @date   2013-05-23
	 */
	public function addItems(){
		$userId = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$userInfo->mainSite;
		$request=$this->getRequest();
		$data=$request->getPost();
		parse_str($data['data'],$output);
		$items=array();
		if($output['submit']=='add'){
			if(is_array($output)){
				foreach($output as $key=>$val){
					if(!empty($val)){
						$items[$key]=$val;
					}
				}
			}
			$output=$items;
		}
		unset($output['submit']);
		if(empty($output))return false;
		$output['accessType']=='ftp方式访问'?$output['accessType']=intval(1):$output['accessType']=intval(2);
		$output['publicStatus']=='本省'?$output['publicStatus']=intval(0):$output['publicStatus']=intval(1);
		$output['activting']=='启用'?$output['activting']=intval(1):$output['activting']=intval(0);
		$sysForm=array(
				'id'=>isset($output['sysId'])?$output['sysId']:'',
				'system'=>isset($output['system'])?$output['system']:'',
				'sysName'=>isset($output['sysName'])?$output['sysName']:'',
				'accessType'=>$output['accessType'],
				'ftpserver'=>isset($output['ftpserver'])?$output['ftpserver']:'',
				'ftpport'=>isset($output['ftpport'])?$output['ftpport']:'',
				'ftpuser'=>isset($output['ftpuser'])?$output['ftpuser']:'',
				'ftppw'=>isset($output['ftppw'])?$output['ftppw']:'',
				'publicStatus'=>$output['publicStatus'],
				'activting'=>$output['activting'],
				'sysPath'=>isset($output['sysPath'])?$output['sysPath']:'',
				'ownerMainsite'=>$mainsite
		);
		$jsonData=json_encode($sysForm);
		$proxy=$this->exec('getProxy','escloud_receivews');
		$addResult=$proxy->addItems($jsonData);
		echo $addResult;
	}
	/**
	 * 获取业务系统列表
	 * @author yzh
 	 * @Date   2013-05-22
	 */
	public function getOperationSysList(){
		$userId = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$userInfo->mainSite;
		$proxy = $this->exec('getProxy','escloud_receivews');
		$lists = $proxy->getSysNodeListByMainsite($mainsite);
		if($lists==""){return;}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$total=intval(count($lists));
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($lists as $list){
			$list->accessType==1?$list->accessType='ftp方式访问':$list->accessType='本地读取';
			$list->publicStatus==0?$list->publicStatus='本省':$list->publicStatus='全国';
			$list->activting==1?$list->activting='启用':$list->activting='不启用';
			$entry=array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id" value='.$list->id.'>',
							'c3'=>'<span class="editbtn" id='.$list->id.' onclick=show_items('.$list->id.')>&nbsp;</span>',
							'c4'=>$list->system,
							'c5'=>$list->sysName,
							'c6'=>$list->accessType,
							'c7'=>$list->ftpserver,
							'c8'=>$list->ftpuser,
							'c9'=>"<input type='hidden' value='{$list->ftppw}' name='ftppasswd'/>".'<font style="_font-size:7px;">'.preg_replace('/\S/','●',$list->ftppw).'</font>',
							'c10'=>$list->ftpport,
							'c11'=>$list->sysPath,
							'c12'=>$list->publicStatus,
							'c13'=>$list->activting
					)
			);
			$jsonData['rows'][]=$entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 单个删除业务系统列表的数据
	 * @author yzh
	 * @Date   2013-05-24
	 */
	public function del_items(){
		$id=$_GET['id'];
		if($id=='')return;
		$proxy = $this->exec('getProxy','escloud_receivews');
		$delResult=$proxy->del_items($id);
		echo $delResult;
	}
	/**
	 * 查看编辑页面的渲染
	 * @author yzh
	 * @Date   2013-05-27
	 */
	public function edit_items(){
		$userId = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$mainsite=$userInfo->mainSite;
		$request=$this->getRequest();
		$data=$request->getPost();
		$editId=$data['editId'];
		$baseInf=$data['baseInf'];
		$subBaseInf=explode('|',$baseInf);
		$editSysForm=array(
				'editId'=>$editId,
				'system'=>$subBaseInf[0],
				'sysName'=>$subBaseInf[9],
				'accessType'=>$subBaseInf[1],
				'ftpserver'=>$subBaseInf[2],
				'ftpport'=>$subBaseInf[5],
				'ftpuser'=>$subBaseInf[3],
				'ftppw'=>$subBaseInf[4],
				'publicStatus'=>$subBaseInf[7],
				'activting'=>$subBaseInf[8],
				'sysPath'=>$subBaseInf[6],
				'ownerMainsite'=>$mainsite
		);
		return $this->renderTemplate(array('editSysForm'=>$editSysForm),'ESExternalSystem/add');
	}
}