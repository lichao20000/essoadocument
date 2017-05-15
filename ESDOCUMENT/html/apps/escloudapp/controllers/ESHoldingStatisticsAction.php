<?php
/**
 * @author wangtao
 * 馆藏统计
 */
class ESHoldingStatisticsAction extends ESActionBase{
	/**
	 * @author wangtao
	 * 馆藏统计首页
	 * @return string
	 */
	public function index(){
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 获取树节点
	 *
	 */
	public function getTree()
	{
	
		$business=$this->exec('getProxy','escloud_businesstreews');
		$request=$this->getRequest();
		$id=$request->getGet('id');//获取当前业务的状态
		$userId=$this->getUser()->getId();
		$data=array();
		if($id!=-1){
			$proxy=$this->exec('getProxy','escloud_collectionws');
			$data=$proxy->getCollItems($id);//返回方案的ID
		}
		/** wanghongchen 20141015  获取树节点时不获取分组节点，bug1365**/
		$treelist=$business->getBusinessAuthorTreeForWFAttachData('1',4,$userId);
		foreach($treelist as $val){
			foreach($data as $value){
					if($value->c0->path==$val->path){
						$val->checked=true;
						$val->open=true;
					}
					
			}
		}
		echo json_encode($treelist);
	}
	public  function getDataList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start=($page-1)*$rp;
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$userId=$this->getUser()->getId();
		$rows=$proxy->getDataList($start,$rp,$userId);
		$jsonData = array('page'=>$page,'total'=>$rows->count,'rows'=>array());
		foreach($rows->dataList AS $row){
			$entry = array('id'=>$row->id,
					'cell'=>array(
							'num'=>$start+1,
							"ids" => '<input type="checkbox" name="cbx"  class="cbx" value="' . $row->id . '">',
							'title'=>$row->collname,
							'execute'=>($row->isComplete)?'<span title="执行方案" class="printbtn" onclick=exeCollection("'.$row->id.'") >&nbsp;</span>':'未完成',
							'modify'=>'<span title="编辑方案" class="editbtn" onclick=modifyCollection('.$row->id.',"'.$row->collname.'") >&nbsp;</span>',
							'delete'=>'<span title="删除方案" class="delbtn" onclick=delCollection('.$row->id.') >&nbsp;</span>',
							'show'=>'<span title="查看方案" class="showbtn" onclick=showCollection("'.$row->id.'") >&nbsp;</span>',
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author wangtao
	 * 添加页面
	 */
	public function modify(){
		$request=$this->getRequest();
		$id=$request->getPost('id');
		$name=$request->getPost('name');
		return $this->renderTemplate(array('name'=>$name,'id'=>$id),'ESHoldingStatistics/add');
	}
	/**
	 * @author wangtao
	 * 保存方案名称(统计方案第一步)
	 * @return int
	 */
	public function saveTitle()
	{
		$request=$this->getRequest();
		$title=$request->getPost('title');
		if(!$title && $title!=0)return;
		$id=$request->getPost('id');
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$id=$proxy->saveTitle($id,urlencode($title),$userId);//返回方案的ID
		echo json_encode($id);
	}
	/**
	 * @author wangtao
	 * 保存树节点(统计方案第二步)
	 * @return bool
	 */
	public function saveTreeNodes()
	{
		$userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$nodes=$request->getPost('data');
		$id=intval($request->getPost('id'));
		$nodesJson=json_encode($nodes);
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result=$proxy->saveTreeNodes($userId,$id,$nodesJson);//返回方案的ID
		echo $result;
	}
	/**
	 * @author wangtao
	 * 设置统计方案的列数
	 */
	public function saveCollTitleAndColCount()
	{
		$userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost('data');
		$collId=intval($data['id']);
		$colCount=intval($data['count']);
		$title=urlencode($data['title']);
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result=$proxy->saveCollTitleAndColCount($userId,$collId,$colCount,$title);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 获取方案详细列表(统计方案第三步)
	 * @return mixed
	 */
	public function getCollItems()
	{
		$request=$this->getRequest();
		$id=$request->getPost('id');
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$data=$proxy->getCollItems($id);//返回方案的ID
		$data=json_decode(json_encode($data),true);
		$arr=array();
		foreach($data as $value){
			foreach($value as $key=>$val){
				array_push($arr,$key);
			}
		}
		$str=max(array_unique($arr));
		$count=substr($str,1,strlen($str));
		$colItems=$proxy->getCollById($id);
		$result['data']=$data;
		$result['count']=$count;
		//wanghongchen 20140821 bug676
		$result['classNode'] = $colItems->classNode;
		$result['dataNode'] = $colItems->dataNode;
		$result['isSummary'] = $colItems->isSummary;
		$result['isLayout'] = $colItems->isLayout;
		$result['pic'] = $colItems->pic;
		if($colItems->titles)
		$result['head']=explode(';', $colItems->titles);
		echo json_encode($result);
	}
	
	/*
	 * @author wangtao
	 * 规则设置
	 * */
	public function setRules()
	{
		$request=$this->getRequest();
		$path=$request->getGet('path');
		$id = $_GET['id'];
		$pathLength=strlen($path);//获得path的长度
		$position=strrpos($path,'@');//返回最后一个"@"出现的索引值
		$sid=substr($path,$position+1,$pathLength);//截取path最后的结构ID
		$proxy=$this->exec('getProxy','escloud_structurews');
		$pathInfo=$proxy->getPathInfo($path);
		$list=$proxy->getStructureAllList($sid);
		//wanghongchen 20140821 获取统计项，用于修改时的回显
		$collectionProxy=$this->exec('getProxy','escloud_collectionws');
		$collItem = null;
		if($id != -1){
			$param = json_encode(array('id'=>$id));
			$collItem = $collectionProxy->getCollItemById($param);
		}
		return $this->renderTemplate(array('pathInfo'=>$pathInfo,'list'=>$list,'sId'=>$sid,'collItem'=>$collItem));
	}
	/*
	 * @author wangtao
	 * 条件设置
	* */
	public function setCondition()
	{
		$request=$this->getRequest();
		$sId=$request->getGet('sId');
		//xiewenda 20140928  $_GET["trlength"] 原来是 $_GET("trlength")报错
		$trlength=isset($_GET["trlength"]) ? $_GET["trlength"]:6;
		$proxy=$this->exec('getProxy','escloud_structurews');
		$list=$proxy->getStructureAllList(intval($sId));
		$array=array();
		foreach($list as $value){
			if($value->ESDOTLENGTH==null)
			{
				$value->ESDOTLENGTH=0;
			}
			$array[$value->ESIDENTIFIER]=strtolower($value->ESTYPE).'/'.$value->ESLENGTH.'/'.'0/'.$value->ESDOTLENGTH;
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$rpValLst = $proxy->getRetentionPeriodVal($sId,4);//wanghongchen 20140918 保管期限下拉项改为动态获取 bug1066
		return $this->renderTemplate(array('list'=>$list,'string'=>json_encode($array),'sId'=>$sId,'rpValLst'=>$rpValLst,'trlength'=>$trlength));
	}
	/*
	 * @author wangtao
	 * 保存规则
	* */
	public function saveRules()
	{
		$request=$this->getRequest();
		$data=$request->getPost('data');
		$proxy=$this->exec('getProxy','escloud_collectionws');
		if(!empty($data['condition'])){
			$temp=explode('@',rtrim($data['condition'],'@'));
			$data['condition']=$temp;
		}
		$result=$proxy->saveCollItem(json_encode($data));
		echo $result;
	}
	/**
	 * @author wangtao
	 * 保存设置统计项配置
	 */
	public function saveOptions()
	{
		$userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost('data');
		$names=$request->getPost('names');
		$list=explode('|', $names);
		$dats=array();
		foreach($list as $key=>$val)
		{
			if(!empty($val) && $val!='undefined')
			{
				$dats[]=$val;
			}
		}
		$dataString=implode(",", $dats);
		if($dataString==''){
			$dataString='无';
		}
		$dataStrings='布局设置:'.$dataString;
		$dataOption=array('optionsList'=>$dataStrings);
		$dataOptions=json_encode($dataOption);
		$collId=intval($data['collId']);
		$classNode=intval($data['classNode']);
		$dataNode=intval($data['dataNode']);
		$isSummary=intval($data['isSummary']);
		$isLayout=intval($data['isLayout']);
		$pic = $data['pic'];
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result=$proxy->saveOptions($userId,$collId,$classNode,$dataNode,$isSummary,$isLayout,$pic,$dataOptions);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 删除统计方案
	 * 
	 */
	public function delCollection()
	{
		$userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$id=$request->getPost('id');
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result=$proxy->removeColl($userId,intval($id));
		echo $result;
	}
	/**
	 * @author wangtao
	 * 执行生成excel操作
	 */
	public function exeCollection()
	{
		$request=$this->getRequest();
		$id=$request->getPost('id');
		$ip = $this->getClientIp();
		$userId = $this->getUser()->getId();
		$version=$request->getPost('version');
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result=$proxy->executeColl(intval($id),strval($version),$userId,$ip);
		echo $result;
// 		if($result){
// 			$fileName=basename($result);//获取下载文件的名称
// 			$pos=strrpos($fileName, '.');
// 			$key=substr($fileName, 0,$pos);//去除文件后缀，作为缓存的KEY
// 			$cache = $this->exec('getProxy','cache');
// 			$cache->setCache(md5($key),$result);
// 			echo md5($key);
// 		}else{
// 			echo 0;
// 		}
	}
	/**
	 * @author wangtao
	 * 修改当前步骤
	 * 
	 */
	public function changeCollCurrStep()
	{
		$request=$this->getRequest();
		$data=$request->getGet();
		$collId=intval($data['id']);//方案ID
		$currStep=intval($data['currStep'])+1;//当前步骤
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$proxy->changeCollCurrStep($collId,$currStep);
	}
	/**
	 * @author wangtao
	 * 移除一列
	 */
	public function removeCollItemsByColNo()
	{
		$request=$this->getRequest();
		$data=$request->getGet();
		$collId=intval($data['id']);//方案ID
		$colNo=intval($data['colNo']);//当前步骤
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result=$proxy->removeCollItemsByColNo($collId,$colNo);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 查看面板
	 */
	public function show()
	{
		$request=$this->getRequest();
		$id=$request->getGet('param');
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$colItems=$proxy->getCollById($id);
		$data=$proxy->getCollItems($id);//返回方案的ID
		//print_r($data);die;
		$count=0;
		if(count($data)>0){
			$data=json_decode(json_encode($data),true);
			$arr=array();
			foreach($data as $value){
				foreach($value as $key=>$val){
					array_push($arr,$key);
				}
			}
			//print_r(array_unique($arr));die;
			$str=max(array_unique($arr));
			$count=substr($str,1,strlen($str));
		}
		$result['data']=$data;
		$result['count']=$count;
	//	print_r(re);
		return $this->renderTemplate(array('result'=>$result,'colItems'=>$colItems));
		
	}
	
	/**
	 * @author wanghongchen
	 * 下载
	 */
	public function fileDown()
	{
		$fileUrl = $_GET['fileUrl'];
		$filName=basename($fileUrl);
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	
	}
	
	/**
	 * 批量删除
	 * wanghongchen 20140820
	 */
	public function batchDelete(){
		$ids = $_POST['ids'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array('ids'=>$ids,'userId'=>$userId));
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result = $proxy->batchDelete($param);
		echo $result;
	}
	
	/**
	 * 更新分类节点、数据节点、缩进
	 * wanghongchen 20140822
	 */
	public function updateOption(){
		$id = $_POST['id'];
		$dataNode = $_POST['dataNode'];
		$classNode = $_POST['classNode'];
		$isLayout = $_POST['isLayout'];
		$userId = $this->getUser()->getId();
		$ip = $this->getClientIp();
		$param = json_encode(array('id'=>$id, 'dataNode'=>$dataNode, 'classNode'=>$classNode, 'isLayout'=>$isLayout,'userId'=>$userId,'ip'=>$ip));
		$proxy=$this->exec('getProxy','escloud_collectionws');
		$result = $proxy->updateOption($param);
		echo $result;
	}
	
}