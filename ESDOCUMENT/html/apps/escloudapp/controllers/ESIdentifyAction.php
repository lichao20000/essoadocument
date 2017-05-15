<?php
/**
 *
 * @author wangtao
 * 档案收集整理
 *
 */
class ESIdentifyAction extends ESActionBase
{
	
	/**
	 * 数据鉴定销毁前对数据进行验证，检查是否存在正在鉴定销毁的数据
	 * @author wanghongchen 20140516
	 */
	public function checkIdentify(){
		$userId = $this->getUser()->getId();
		$nodePath = $_POST['nodePath'];
		$autoIdentify = $_POST['autoIdentify'];
		$condition = isset($_POST['condition']['condition']) ? $_POST['condition']['condition'] : "";//筛选条件
		//wanghongchen 20140814 增加null判断
		$groupCondition = isset($_POST['groupCondition']) ? $_POST['groupCondition'] : null;
		$paths = isset($_POST['paths']) ? $_POST['paths'] : "";
		$param=json_encode(array('userId'=>$userId,'nodePath'=>$nodePath, 'condition'=>$condition, 'paths'=>$paths, 'autoIdentify'=>$autoIdentify,'groupCondition'=>$groupCondition));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$msg = $proxy->checkIdentify($param); 
		echo json_encode($msg);
	}
	
	/**
	 * 销毁创建销毁单
	 * @author wanghongchen 20140515
	 */
	public function destroyBillCreate(){
		$extjs = $_POST['extjs'];
		return $this->renderTemplate(array('extjs'=>$extjs));
	}
	
	/**
	 * 获取历史销毁单
	 */
	public function getHistoryIdentificationList(){
		$userId = $this->getUser()->getId();
		$page = isset($_GET['page'])?$_GET['page']:1;
		$rp = isset($_GET['rp'])?$_GET['rp']:20;
		$nodePath = $_GET['nodePath'];
		$proxy = $this->exec('getProxy','escloud_identificationws');
		$param = json_encode(array('nodePath'=>$nodePath,'userId'=>$userId,'pageNum'=>$page,'pageSize'=>$rp));
		$result = $proxy->getHistoryIdentificationList($param);
		$total = $result->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total>0){
			foreach ($result->list as $row)
			{
				
				$entry = array('id'=>$row->id,
						'cell'=>array(
								'cb'=>'<input type="checkbox" name="inputs" id="'.$row->id.'" value="'.$row->id.'" />',
								'code'=>$row->code,
								'title'=>$row->title,
								'proposer'=>$row->proposer,
								'starttime'=>$row->starttime,
								'endtime'=>$row->endtime,
								'formid'=>$row->formid,
								'wfid'=>$row->wfid,
								'oswfformid'=>$row->oswfformid,
								'destroynum'=>$row->destroynum,
								'destroyperson'=>$row->destroyperson,
								'structureid'=>$row->structureid,
								'userid'=>$row->userid
						)
				);
				$jsonData['rows'][] = $entry;
					
			}
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 销毁选择历史销毁单
	 * @author wanghongchen 20140516
	 */
	public function destroyBillHistory(){
		$nodePath = $_GET['nodePath'];
		return $this->renderTemplate(array('nodePath'=>$nodePath));
	}
	/**
	 * @author wangtao
	 * 获取树节点
	 * 
	 */
	public function getTree()
	{
		
		$proxy=$this->exec('getProxy','escloud_businesstreews');
		$request=$this->getRequest();
		$status=$request->getGet('status');//获取当前业务的状态
		$userId=$this->getUser()->getId();
		$treelist=$proxy->getBusinessAuthorTree('1',$status,$userId);
		foreach($treelist as $val){
			if($val->pId==0)
			{
				$val->open=true;
				break;
			}
		}
		echo json_encode($treelist);
	}
	/**
	 * 获取所有树节点，不走权限，暂时只有索引库管理中用到了
	 */
	public function getAllTree()
	{
	
		$proxy=$this->exec('getProxy','escloud_businesstreews');
		$request=$this->getRequest();
		$status=$request->getGet('status');//获取当前业务的状态
		$userId=$this->getUser()->getId();
		$treelist=$proxy->getAllTree('1',$status,$this->getUser()->getBigOrgId());//liqiubo 20140618 支持saas 加入bigOrgId条件查询
		foreach($treelist as $val){
			if($val->pId==0)
			{
				$val->open=true;
				break;
			}
		}
		echo json_encode($treelist);
	}
	
	/**
	 * @author wangtao
	 * 获取列表内容
	 */
	public function set_json()
	{
		$request=$this->getRequest();
// 		$keyword=isset($_GET['keyword'])?$_GET['keyword']:'';
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$itemPath = $request->getGet('itemPath');
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$prePath= isset($_GET['prePath']) ? $_GET['prePath'] : '';//用于获取卷内文件 $prePath当前树节点案卷级PATH
		$boxfile= isset($_GET['boxfile']) ? $_GET['boxfile'] : '';//用于判断是否是浏览盒内数据
		$radio = isset($_GET['radio'])?$_GET['radio']:'';//用于判断显示单选框还是复选框
		$file = isset($_GET['file'])?$_GET['file']:'';//用于判断是否为案卷
		$condition=array();
		$groupCondition=array();
		/** xiaoxiong 20140806 修改为从$query中获取关键词检索词 **/
		$keyword='';
		if(isset($query['keyword'])){
			$keyword=$query['keyword'];
		}
		if(isset($query['condition'])){
			$condition=$query['condition'];//筛选条件
		}
		if(isset($query['groupCondition'])){
			$groupCondition=$query['groupCondition'];//分组条件
		}
		$rp = isset($rp) ? $rp : 20;
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($path);
		$json=array();
		foreach ($data as $value)
		{
			$json[]=$value->name;
		}
		// longjunhao 20140909 type参数是什么东西？没看懂。
		// 由于type判断,缺少condition的数据，导致一些查询功能无法正常使用。
		// 需要在加上query['type'] = ''; 才能使用。
		if(isset($query['type'])){
			$arr=array('keyword'=>$keyword,'condition'=>$condition,'groupCondition'=>$groupCondition,'columns'=>$json,'parentPath'=>$prePath);
		}else{
			$arr=array('keyword'=>$keyword,'groupCondition'=>$groupCondition,'columns'=>$json,'parentPath'=>$prePath);
		}
		
		$list=json_encode($arr);
		$start=($page-1)*$rp;
		if(!empty($itemPath))
		{
			$path=$itemPath;
		}
		$userId=$this->getUser()->getId();
		$userId=!empty($userId)?$userId:0;
		if($boxfile){
			$path=preg_replace('/\_\d{1}/','',$path,1);//浏览盒内档案明细，可以查看当前盒内所有移交或者未移交的档案
		}
		$rows=$this->getDataList($path,$start,$rp,$userId,$list);
		$total = isset($rows['total'])?$rows['total']:0;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$isGenerate = 'false';
		$editTitle = '编辑';
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		if($radio){
			$type='radio';
		}else{
			$type='checkbox';
		}
		$editbtn = "editbtn";
		if($boxfile){//查看盒内文件
			//liqiubo 20141014 查看盒内数据（案卷级结构，查看卷内数据时使用此方法），统一一下调用的方法，修复bug 1350
			$operate='showBoxFile';
			$editbtn = 'noeditbtn';
			$editTitle = '条目浏览';
		}elseif ($file){//查看案卷
			$operate='show_items';//liqiubo 20140903 案卷和卷内还是一样使用modify页面，但是加入参数，来判断是否显示电子文件列表
			$isGenerate = 'true';
		}else {
			$operate='show_items';
		}
		//print_r($rows['dataList']); die;
		// del,ln属性用于删除标识是否有权限
		//liqiubo 20140517 下面的foreach循环中的input标签中的boxid属性的值改变，由id改为boxid
		foreach($rows['dataList'] AS $row){
			
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'ids'=> '<input boxid="'. $row['boxid'] .'" type="'.$type.'" name="path" class="selectone" del="'. $row['isDelete'] .'" edit="'.$row['isitemEdit'].'" fileread="'.$row['isfileRead'].'" isGenerate="'.$isGenerate.'" ln="'. ($start+1) .'" value="'.$row["path"].'">',
							/** xiaoxiong 20140804 添加不可编辑时，显示个灰色的条目浏览按钮 **/
							'operate'=> $row['isitemEdit'] === 'true' ? '<span class="'.$editbtn.'" title="'.$editTitle.'" onclick='.$operate.'("'.$row["path"].'","'.$isGenerate.'","true",this)>&nbsp;</span>' : '<span class="noeditbtn" title="条目浏览" onclick='.$operate.'("'.$row["path"].'","'.$isGenerate.'","false",this)>&nbsp;</span>',
							'relation'=>$row['relation']=='true'?1:'',
							'bussystemid'=>$row['bussystemid'],
							//'boxid' => $row['boxid'],
					),
					
			);
			if($row['filecount']){
				if($file){
					/** xiaoxiong 20140911 案卷级的原文浏览按钮永远可以操作 **/
					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="原文浏览" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
				} else {
					if($row['isfileRead'] == 'true'){
						$entry['cell']['operate'].='&nbsp;&nbsp;<span title="原文浏览" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
					} else {
						$entry['cell']['operate'].='&nbsp;&nbsp;<span title="无原文浏览权限" class="nolinkviewright">&nbsp;</span>';
					}
				}
			}
			for($j=0;$j<count($data);$j++)
			{
				if(array_key_exists($data[$j]->name,$row))
				{
					//判断是否存在附件数。存在则显示电子列表标签
					
// 					//存在纸质文件的tr标记不同颜色
// 					if($data[$j]->metadata=='PaperAttachments' && $row[$data[$j]->name]>0){
// 						if(isset($entry['cell']['flag'])){
// 							$entry['cell']['flag'].='<span class="paperflag" title="存在纸质附件" >&nbsp;</span>&nbsp;&nbsp;';
// 						}else{
// 							$entry['cell']['flag']='<span class="paperflag" title="存在纸质附件" >&nbsp;</span>&nbsp;&nbsp;';
// 						}
// 					}
					//装盒的数据tr标记不同颜色
					if($data[$j]->metadata=='CaseID' && !empty($row[$data[$j]->name])){
						/** xiaoxiong 20140918 对一条数据属于多个盒进行支持，当属于多盒时，显示多个已装盒图标，支持查看不同盒的盒内数据 **/
						if(strpos($row[$data[$j]->name], ',') > -1){
							$boxValue = $row[$data[$j]->name] ;
							$boxValues = explode (',', $boxValue) ;
							$boxIdStr = $row['boxid'] ;
							$boxIdArrays = explode (',', $boxIdStr) ;
							for($b=0;$b<count($boxValues);$b++){
								if(isset($entry['cell']['flag'])){
									if(isset($boxIdArrays[$b])){//liqiubo 20140923 加入空判断，修复bug 1198
										$entry['cell']['flag'].='<span class="pflag" onclick=showBoxInnerFile("'.$boxValues[$b].'","'. $boxIdArrays[$b] .'") title="数据已装盒，点击查看盒号为['.$boxValues[$b].']的盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
									}
								}
								else{
									$entry['cell']['flag']='<span class="pflag" onclick=showBoxInnerFile("'.$boxValues[$b].'","'. $boxIdArrays[$b] .'") title="数据已装盒，点击查看盒号为['.$boxValues[$b].']的盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
								}
							}
						} else {
							if(isset($entry['cell']['flag'])){
								$entry['cell']['flag'].='<span class="pflag" onclick=showBoxInnerFile("'.$row[$data[$j]->name].'","'. $row['boxid'] .'") title="数据已装盒，点击查看盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
							}
							else{
								$entry['cell']['flag']='<span class="pflag" onclick=showBoxInnerFile("'.$row[$data[$j]->name].'","'. $row['boxid'] .'") title="数据已装盒，点击查看盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
							}
						}
					}
					
// 					if(($data[$j]->metadata == 'ElectronicAttachmentStatus') && ($row[$data[$j]->name] == '是')){
// 						if(isset($entry['cell']['flag'])){
// 							$entry['cell']['flag'].='<span class="efile-int" title="电子附件完整" >&nbsp;</span>&nbsp;&nbsp;';
// 						}
// 						else{
// 							$entry['cell']['flag']='<span class="efile-int" title="电子附件完整" >&nbsp;</span>&nbsp;&nbsp;';
// 						}
// 					}
					$entry['cell'][$data[$j]->name]=$row[$data[$j]->name];
				}
			
			}
			$jsonData['rows'][] = $entry;
			$start++;
			
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author gaoyide 20140924
	 * 档案编研-添加-插入档案.调用
	 * 比set_json方法少拼了edit
	 */
	public function set_json2()
	{
		$request=$this->getRequest();
		// 		$keyword=isset($_GET['keyword'])?$_GET['keyword']:'';
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$itemPath = $request->getGet('itemPath');
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$prePath= isset($_GET['prePath']) ? $_GET['prePath'] : '';//用于获取卷内文件 $prePath当前树节点案卷级PATH
		$boxfile= isset($_GET['boxfile']) ? $_GET['boxfile'] : '';//用于判断是否是浏览盒内数据
		$radio = isset($_GET['radio'])?$_GET['radio']:'';//用于判断显示单选框还是复选框
		$file = isset($_GET['file'])?$_GET['file']:'';//用于判断是否为案卷
		$condition=array();
		$groupCondition=array();
		/** xiaoxiong 20140806 修改为从$query中获取关键词检索词 **/
		$keyword='';
		if(isset($query['keyword'])){
			$keyword=$query['keyword'];
		}
		if(isset($query['condition'])){
			$condition=$query['condition'];//筛选条件
		}
		if(isset($query['groupCondition'])){
			$groupCondition=$query['groupCondition'];//分组条件
		}
		$rp = isset($rp) ? $rp : 20;
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($path);
		$json=array();
		foreach ($data as $value)
		{
			$json[]=$value->name;
		}
		// longjunhao 20140909 type参数是什么东西？没看懂。
		// 由于type判断,缺少condition的数据，导致一些查询功能无法正常使用。
		// 需要在加上query['type'] = ''; 才能使用。
		if(isset($query['type'])){
			$arr=array('keyword'=>$keyword,'condition'=>$condition,'groupCondition'=>$groupCondition,'columns'=>$json,'parentPath'=>$prePath);
		}else{
			$arr=array('keyword'=>$keyword,'groupCondition'=>$groupCondition,'columns'=>$json,'parentPath'=>$prePath);
		}
	
		$list=json_encode($arr);
		$start=($page-1)*$rp;
		if(!empty($itemPath))
		{
			$path=$itemPath;
		}
		$userId=$this->getUser()->getId();
		$userId=!empty($userId)?$userId:0;
		if($boxfile){
			$path=preg_replace('/\_\d{1}/','',$path,1);//浏览盒内档案明细，可以查看当前盒内所有移交或者未移交的档案
		}
		$rows=$this->getDataList($path,$start,$rp,$userId,$list);
		$total = isset($rows['total'])?$rows['total']:0;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$isGenerate = 'false';
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		if($radio){
			$type='radio';
		}else{
			$type='checkbox';
		}
		if($boxfile){//查看盒内文件
			$operate='showBoxFile';
		}elseif ($file){//查看案卷
			$operate='show_items';//liqiubo 20140903 案卷和卷内还是一样使用modify页面，但是加入参数，来判断是否显示电子文件列表
			$isGenerate = 'true';
		}else {
			$operate='show_items';
		}
		//print_r($rows['dataList']); die;
		// del,ln属性用于删除标识是否有权限
		//liqiubo 20140517 下面的foreach循环中的input标签中的boxid属性的值改变，由id改为boxid
		foreach($rows['dataList'] AS $row){
				
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'ids'=> '<input boxid="'. $row['boxid'] .'" type="'.$type.'" name="path" class="selectone" del="'. $row['isDelete'] .'" edit="'.$row['isitemEdit'].'" fileread="'.$row['isfileRead'].'" isGenerate="'.$isGenerate.'" ln="'. ($start+1) .'" value="'.$row["path"].'">',
							/** xiaoxiong 20140804 添加不可编辑时，显示个灰色的条目浏览按钮 **/
							'operate'=> '<span>&nbsp</span>',
							'relation'=>$row['relation']=='true'?1:'',
							'bussystemid'=>$row['bussystemid'],
							//'boxid' => $row['boxid'],
					),
						
			);
			if($row['filecount']){
				if($file){
					/** xiaoxiong 20140911 案卷级的原文浏览按钮永远可以操作 **/
					//xiewenda 20141010 加入onclick 事件
					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="" class="link2" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
				} else {
					if($row['isfileRead'] == 'true'){
						//xiewenda 20141010 加入onclick 事件
						$entry['cell']['operate'].='&nbsp;&nbsp;<span title="" class="link2" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
					} else {
						$entry['cell']['operate'].='&nbsp;&nbsp;<span title="无原文浏览权限" class="nolinkviewright">&nbsp;</span>';
					}
				}
			}
			for($j=0;$j<count($data);$j++)
			{
			if(array_key_exists($data[$j]->name,$row))
			{
			//判断是否存在附件数。存在则显示电子列表标签
					
				// 					//存在纸质文件的tr标记不同颜色
				// 					if($data[$j]->metadata=='PaperAttachments' && $row[$data[$j]->name]>0){
				// 						if(isset($entry['cell']['flag'])){
				// 							$entry['cell']['flag'].='<span class="paperflag" title="存在纸质附件" >&nbsp;</span>&nbsp;&nbsp;';
				// 						}else{
				// 							$entry['cell']['flag']='<span class="paperflag" title="存在纸质附件" >&nbsp;</span>&nbsp;&nbsp;';
				// 						}
				// 					}
				//装盒的数据tr标记不同颜色
				if($data[$j]->metadata=='CaseID' && !empty($row[$data[$j]->name])){
					/** xiaoxiong 20140918 对一条数据属于多个盒进行支持，当属于多盒时，显示多个已装盒图标，支持查看不同盒的盒内数据 **/
					if(strpos($row[$data[$j]->name], ',') > -1){
						$boxValue = $row[$data[$j]->name] ;
						$boxValues = explode (',', $boxValue) ;
						$boxIdStr = $row['boxid'] ;
				$boxIdArrays = explode (',', $boxIdStr) ;
				for($b=0;$b<count($boxValues);$b++){
				if(isset($entry['cell']['flag'])){
						if(isset($boxIdArrays[$b])){//liqiubo 20140923 加入空判断，修复bug 1198
					$entry['cell']['flag'].='<span class="pflag" onclick=showBoxInnerFile("'.$boxValues[$b].'","'. $boxIdArrays[$b] .'") title="数据已装盒，点击查看盒号为['.$boxValues[$b].']的盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
									}
				}
					else{
					$entry['cell']['flag']='<span class="pflag" onclick=showBoxInnerFile("'.$boxValues[$b].'","'. $boxIdArrays[$b] .'") title="数据已装盒，点击查看盒号为['.$boxValues[$b].']的盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
								}
							}
						} else {
					if(isset($entry['cell']['flag'])){
						$entry['cell']['flag'].='<span class="pflag" onclick=showBoxInnerFile("'.$row[$data[$j]->name].'","'. $row['boxid'] .'") title="数据已装盒，点击查看盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
							}
							else{
								$entry['cell']['flag']='<span class="pflag" onclick=showBoxInnerFile("'.$row[$data[$j]->name].'","'. $row['boxid'] .'") title="数据已装盒，点击查看盒内数据" >&nbsp;</span>&nbsp;&nbsp;';
							}
						}
					}
			
// 					if(($data[$j]->metadata == 'ElectronicAttachmentStatus') && ($row[$data[$j]->name] == '是')){
						// 						if(isset($entry['cell']['flag'])){
						// 							$entry['cell']['flag'].='<span class="efile-int" title="电子附件完整" >&nbsp;</span>&nbsp;&nbsp;';
						// 						}
						// 						else{
						// 							$entry['cell']['flag']='<span class="efile-int" title="电子附件完整" >&nbsp;</span>&nbsp;&nbsp;';
						// 						}
						// 					}
						$entry['cell'][$data[$j]->name]=$row[$data[$j]->name];
			}
				
			}
			$jsonData['rows'][] = $entry;
			$start++;
				
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author yuanzhonghua
	 * 盒内档案列表的显示[查看盒内档案信息]
	 */
	public function InnerfileSet_json(){
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$rp=$request->getPost('rp');
		$query=$request->getPost('query');
		/** xiaoxiong 20140807 添加模糊检索词获取 **/
		$keyword = isset($query)?$query:'';
		$page = isset($page) ? $page : 1;
		$rp = isset($rp) ? $rp : 20;
		$path = $request->getGet('path');
		$boxID=$request->getGet('boxID');
		$userid = $this->getUser()->getId();
			/*$query= isset($_POST['query']) ? $_POST['query'] : 0;
			if(empty($query)){
				$query=array();
			}else{
				$temp=explode('@',rtrim($query,'@'));
				$query=$temp;
			}*/
		$boxfile= isset($_GET['boxfile']) ? $_GET['boxfile'] : '';//用于判断是否是浏览盒内数据
		$start=($page-1)*$rp;
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($path);
		//根据盒ID获取盒内信息的列表
		$rows=$proxy->getDataListByBoxID($boxID,$path,$start,$rp,$userid,$keyword);
		$total = isset($rows->total)?$rows->total:0;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		if($boxfile){//查看盒内文件
			$operate='showBoxFile';
		}
		foreach($rows->datalist AS $row){
			$entry= array(
					'id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'ids'=>'<input type="checkbox" name="path" class="selectone" value='.$row->path.' edit="'.$row->isitemEdit.'" fileread="'.$row->isfileRead.'">',
// 							'operate'=>'<span class="editbtn" title="查看" onclick='.$operate.'("'.$row->path.'","'.$row->bussystemid.'","false","'.$row->isfileRead.'",this)>&nbsp;</span>',
							/** xiaoxiong 20140915 添加不可编辑时，显示个灰色的条目浏览按钮 **/
							//'operate'=> $row->isitemEdit === 'true' ? '<span class="editbtn" title="编辑" onclick='.$operate.'("'.$row->path.'","'.$row->bussystemid.'","false","'.$row->isfileRead.'",this)>&nbsp;</span>' : '<span class="noeditbtn" title="条目浏览" onclick='.$operate.'("'.$row->path.'","'.$row->bussystemid.'","false","'.$row->isfileRead.'",this)>&nbsp;</span>',
							//经过跟踪代码 发现该方法不存在编辑的情况，将编辑修改为条目浏览 薛坤 20141008
							'operate'=>  '<span class="noeditbtn" title="条目浏览" onclick='.$operate.'("'.$row->path.'","'.$row->bussystemid.'","false","'.$row->isfileRead.'",this)>&nbsp;</span>',
							'relation'=>$row->relation=='true'?1:'',
							'bussystemid'=>$row->bussystemid,
					),
			);
			
// 			if($file){
// 				/** xiaoxiong 20140911 案卷级的原文浏览按钮永远可以操作 **/
// 				$entry['cell']['operate'].='&nbsp;&nbsp;<span title="原文浏览" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
// 			} else {
// 				if($row['isfileRead'] == 'true'){
// 					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="原文浏览" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
// 				} else {
// 					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="无原文浏览权限" class="nolinkviewright">&nbsp;</span>';
// 				}
// 			}
			
			if($row->filecount){
// 				$entry['cell']['operate'].='&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row->path.'") >&nbsp;</span>';
				/** xiaoxiong 20140915 添加原文浏览权限控制 **/
				if($row->isfileRead == 'true'){
					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="原文浏览" class="link" onclick=show_file("'.$row->path.'") >&nbsp;</span>';
				} else {
					$entry['cell']['operate'].='&nbsp;&nbsp;<span title="无原文浏览权限" class="nolinkviewright">&nbsp;</span>';
				}
			}
			//循环获取对应字段的值，追加到列表中并显示出来
			for($j=0;$j<count($data);$j++)
			{
				if(array_key_exists($data[$j]->name,$row)){
					$sttr=$data[$j]->name;
					$entry['cell'][$sttr]=$row->$sttr;
				}
			}
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author wangtao
	 * 导出
	 */
	public  function export()
	{
		$display = $_GET['display']=='block' ? true : false;	// 是否显示筛选面板	
		$status=intval(isset($_GET['status']) ? $_GET['status'] : 0);
		$strucID=intval(isset($_GET['strucid']) ? $_GET['strucid'] : 0);
		$fields=$this->getQueryField($strucID,$status);
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		$proxyRp=$this->exec('getProxy','escloud_businesseditws');//liqiubo 20140924 加入保管期限字段需要的值，修复bug 911
		$rpValLst = $proxyRp->getRetentionPeriodVal($strucID,$status);
		return $this->renderTemplate(array('display'=>$display,'rpValLst'=>$rpValLst,'struId'=>$strucID,'modelId'=>$status,'searchField'=>$fields,'string'=>json_encode($array)));//liqiubo 20140930 传入结构和业务id，修复bug 492
		
	}
	
	/**
	 * @author fangjixiang
	 * 勾选数据后导出
	 */
	public function ExportSelData()
	{
		$nodePath = $_POST['nodePath'];
		$exportType = $_POST['exportType'];
		//wanghongchen 20140808 导出增加电子文件
		$resource = $_POST['resource'];
		
		$userid = $this->getUser()->getId();
		$formats = explode(',',$_POST['formats']);
		foreach ($formats as $k => $v){
			$fm[$v] = $v ? true : false;
		}
		
		//if($fm['formats_Excel'] ){
			
			$ids = explode(',',str_replace('/','-',$_POST['ids']));
			$proxy = $this->exec('getProxy','escloud_businesseditws');
			$proxy->exportSelData($nodePath,json_encode($ids),$userid,$exportType,$resource);
			// liqiubo 20141125 不要返回结果了，请求发出就OK了，导出后，下载会以消息的方式告知用户，修复bug 1400
			echo 'exporting';
// 			if($result->success){
// 				$url = $result->path;
// 				$fileName=basename($url);//获取下载文件的名称
// 				$pos=strrpos($fileName, '.');
// 				$key=substr($fileName, 0,$pos);//去除文件后缀，作为缓存的KEY
// 				$cache = $this->exec('getProxy','escloud_cachews');
// 				$md5Key =md5($key);
// 				$cache->setCache($md5Key,json_encode($url));
				
// 				echo $md5Key;
// 			}else if($result->msg){	// 无数据
				
// 				echo 'nothing';
				
// 			}else{	// 错误
				
// 				echo 'error';
				
// 			}
			
		//}
	}
	
	
	/**
	 * @author fangjixiang
	 * 筛选数据后导出
	 */
	public function exportData()
	{
		$nodePath = $_POST['nodePath'];
		$columns = $_POST['columns'];
		$exportType = $_POST['exportType'];
		$conditions = isset($_POST['condition'])?$_POST['condition']:'';
		$resource = $_POST['resource'];
		$condition=array();//筛选条件
		$groupCondition=array();//分组设置条件
		if(isset($conditions['condition']) && $conditions){
			$condition=$conditions['condition'];//筛选条件
		}
		$fieldName = isset($_POST['fieldName'])?$_POST['fieldName']:"";
		if(isset($conditions['groupCondition'])){
			$groupCondition=$conditions['groupCondition'];//分组条件
		}
		$columns = explode('@',$columns);	// 筛选字段
		$params = array(
				'columns' => $columns,
				'condition' => $condition,
				'groupCondition'=>$groupCondition,
		        'detail'=>$fieldName
			);
		$userId=$this->getUser()->getId();
		$proxy = $this->exec('getProxy','escloud_businesseditws');
		$proxy->exportDate($nodePath,$userId,json_encode($params),$exportType,$resource);
		echo 'exporting';
		// liqiubo 20141125 不要返回结果了，请求发出就OK了，导出后，下载会以消息的方式告知用户，修复bug 1400
// 		if($result->success){
// 			$url = $result->path;
// 			$fileName=basename($url);//获取下载文件的名称
// 			$pos=strrpos($fileName, '.');
// 			$key=substr($fileName, 0,$pos);//去除文件后缀，作为缓存的KEY
// 			$cache = $this->exec('getProxy','escloud_cachews');
// 			$cache->setCache(md5($key),json_encode($url));//liqiubo 20140627 更改缓存设置方法
// 			echo md5($key);

// 		}else if($result->msg){	// 无数据
		
// 			echo 'nothing';
		
// 		}else{	// 错误
		
// 			echo 'error';
		
// 		}
	}
	
	// 下载导出文件
	public function edownload()
	{
		$date = date('Y年m月d日H时i分s秒');
		$url = $_GET['url'];
		header("Content-type: application/octet-stream");
		header("Content-Disposition: attatchment; filename=".$date.".xls");
		readfile($url);
	}
	
	/**
	 * @author wangtao
	 * 导入
	 */
	public  function import()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		return $this->renderTemplate(array('serviceIp'=>$serviceIp));
	}
	
	/**
	 * @author wanghongchen 20140428
	 * 得到当前结构下的所有子结构的相关信息
	 */
	public function importStep1()
	{
		
		$nodePath = $_GET["nodePath"];
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getChirldStructure($nodePath);
		$userid = $this->getUser()->getId();
		return $this->renderTemplate(array('data'=>$data,'userId'=>$userid));
	}
	/**
	 * @author wanghongchen 20140428
	 * 返回导入设置对应界面
	 */
	public function importSetting()
	{
		$userid = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getImportStructures($userid);
		return $this->renderTemplate(array('data'=>$data));
	}
	
	/**
	 * 获取导入上传服务rest地址
	 * @author wanghongchen 20140430
	 */
	public function getImportUrl(){
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getImportUrl();
		echo $data;
	}
	
	/**
	 * 获取文件头信息
	 * @author wanghongchen 20140506 
	 */
	public function showFileColumn(){
		$path = $_POST['query']['condition'];
		$userId = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$map = json_encode(array("path"=> $path, "userId"=> $userId));
		$data=$proxy->showFileColumn($map);
		$total = $data->total;
		$jsonData = array('total'=>$total,'rows'=>array());
		foreach ($data->column as $list){
			$entry = array(
					'cell'=>array(
							'sourceField'=> $list->sourceField,
							'type'=> $list->type,
							'maxLength'=> $list->maxLength,
							'minLength'=> $list->minLength,
							'isnull'=> $list->isnull
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取结构信息
	 * @author wanghongchen 20140506
	 */
	public function showStructureColumn(){
		$path = $_POST['query']['condition'];
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$map = json_encode(array("path"=> $path));
		$data=$proxy->showStructureColumn($map);
		$total = $data->total;
		$jsonData = array('total'=>$total,'rows'=>array());
		foreach ($data->list as $list){
			$entry = array(
					'cell'=>array(
							'targetField'=> $list->targetField,
							'type'=> $list->type,
							'length'=> $list->length,
							'isnull'=> $list->isnull
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取文件列模型
	 * @author wanghongchen 20140506
	 */
	public function getFileColumnModel()
	{
		$path = isset($_GET["path"])?$_GET["path"]:"";
		$userId = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$map = json_encode(array("path"=> $path, "userId"=>$userId));
		$data=$proxy->getFileColumnModel($map);
		echo json_encode($data);
	}
	
	/**
	 * 获取文件前20条数据，提供预览
	 * @author wanghongchen 20140506
	 */
	public function getPreFileData(){
		$path = $_POST['query']['condition'];
		$userId = $this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$map = json_encode(array("path"=> $path,"userId"=>$userId));
		$data=$proxy->getPreFileData($map);
		$column = $proxy->getFileColumnModel($map);
		$rows = json_decode(json_encode($data),true);
		$total = isset($rows['total'])?$rows['total']:0;
		$jsonData = array('total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		foreach($rows['list'] AS $row){
			$entry= array('cell'=>array(),);
			for($j=0;$j<count($column);$j++)
			{
				if(array_key_exists($column[$j]->name,$row))
				{
					$entry['cell'][$column[$j]->name]=$row[$column[$j]->name];
				}
				
			}
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 向数据库写入导入数据
	 * @author wanghongchen 20140508
	 */
	public function realImport(){
		$mData = $_POST['mData'];
		$path=$_GET['path'];
		$userId = $this->getUser()->getId();
		$ip=$this->getClientIp();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->realImport($userId,json_encode(array('data'=>$mData,'ip'=>$ip,'path'=>$path)));
		echo json_encode($data);
	}
	
	/**
	 * 生成zip导入界面
	 * @author wanghongchen 20140509
	 */
	public function zipImport(){
		$userId = $this->getUser()->getId();
		$path = $_GET["path"];
		return $this->renderTemplate(array('path'=>$path,'userId'=>$userId));
	}
	
	/**
	 * 获取zip导入服务rest地址
	 * @author wanghongchen 20140509
	 */
	public function getZipImportUrl(){
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getZipImportUrl();
		echo $data;
	}
	
	/**
	 *@author wangtao
	 *打印
	 */
	public function printout()
	{
		return $this->renderTemplate();
	}
	/**
	 * @author wangtao
	 * 添加
	 */
	public function filterBox()
	{
		$status = $_GET['status'];
		$strucid = $_GET['strucid'];
		$proxy = $this->exec('getProxy','escloud_structurews');
		$returndata = $proxy->getBoxRole($strucid,$status);
		return $this->renderTemplate(array('BoxRuleRight'=>$returndata->data));
		
	}
	/**
	 * @author wangtao
	 * 添加
	 */
	public function add()
	{
		
		$request=$this->getRequest();
		$path=$request->getGET('path');//'-archive_1-4@_-@1'
		$data=$this->getForm($path);
		/** xiaoxiong 20140913 添加树节点ID的传递 **/
		$nodePathArr = explode('-',$path);
		$nodePathArr = explode('@',$nodePathArr[2]);
		$treeNodeId = $nodePathArr[0];
		return $this->renderTemplate(array('formData'=>$data, 'treeNodeId'=>$treeNodeId));
		
	}
	/**
	 * @author wangtao
	 * 执行添加档案操作
	 */
	public function saveItems()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$output=array();
		parse_str($data['data'],$output);
		$items=array();
		unset($output['submit']);
		if(count($output)==0){ echo  2;return;}
		if(!empty($data['path'])){
			$path=str_replace('/', '-', $data['path']);
		}
		$userId=$this->getUser()->getId();
		$data = array('user'=>$userId,'data'=>$output);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$pkgpath=$proxy->addItems($path,$data);
		echo $pkgpath;
	}
	/**
	 * @author wangtao
	 * 编辑数据
	 */
	public function eidtItem()
	{
		$request=$this->getRequest();
		$path=$request->getGet('path');
		//判断编辑的数据是否为不归档库数据，如果是则将/archive_5/替换为/archive_1，为的是不归档库显示的字段和文件鉴定的字段一致
		if(preg_match('/\/archive_5/', $path)){
			$path=preg_replace('/\/archive_5/', '/archive_1', $path,1);
		}
		/** xiaoxiong 20140805 添加编辑权限与浏览权限的传递 **/
		$itemEdit = isset($_GET['itemEdit'])?$_GET['itemEdit']:'true' ;
		$fileread = isset($_GET['fileread'])?$_GET['fileread']:'true' ;
		$boxfile=isset($_GET['boxfile'])?$_GET['boxfile']:'';//标记是否为接口过来的数据,也可标识是否为盒内数据
		$isGenerate = isset($_GET['isGenerate'])?$_GET['isGenerate']:'false' ;//liqiubo 20140903 加入是否是案卷 标识
		$isBoxFile = isset($_GET['isBoxFile'])?'true':'false' ;
		$treeNodeId = "" ;
		if(!empty($path)){
			$path=str_replace('/', '-', $path);
			//liqiubo 20141014 查看盒内数据时，判断是案卷还是卷内，修复bug 1350
			if($isBoxFile=='true'){
				$proxy=$this->exec('getProxy','escloud_businesseditws');
				$childStru = $proxy->getChildStruIdByPath($path);
				if($childStru!=0){
					$isGenerate = 'true';
				}
			}
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$formData=$proxy->editItem($path);
			
			$data=json_decode(json_encode($formData),true);
			$crossNum=null;//参见号
			foreach($data as $key=>$value){
				if(strtolower($data[$key]['metadata'])=='crossnum' || $data[$key]['lable']=='参见号'){
					$crossNum=$data[$key];
				}
				if($value['dolength']==null)
				{
					$value['dolength']=0;
				}
				
				$data[$key]['verify']=strtolower($value['type']).'/'.$value['length'].'/'.$value['isnull'].'/'.$value['dolength'];
			}
			/** xiaoxiong 20140913 添加树节点ID的传递 **/
			$nodePathArr = explode('-',$path);
			$nodePathArr = explode('@',$nodePathArr[2]);
			$treeNodeId = $nodePathArr[0];
		}
		
		return $this->renderTemplate(array('formData'=>$data,'path'=>$path,'boxfile'=>$boxfile,'crossNum'=>$crossNum,'itemEdit'=>$itemEdit,'fileread'=>$fileread,'isGenerate'=>$isGenerate, 'treeNodeId'=>$treeNodeId),'ESIdentify/modify');
	}
	/**
	 * 渲染关联文件页面
	 * Enter description here ...
	 */
	public function getLinkFileTpl()
	{
		$param=array('path'=>$_POST['path'],'type'=>$_POST['type']);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->getLinkColumn(json_encode($param));
		$column='';$columnList=array();
		foreach ($result as $key=>$value)
		{
			$column.=json_encode($value).',';
			$columnList[]=$value->name;
		}
		$column=rtrim($column,',');
		return $this->renderTemplate(array('param'=>$param,'crossNum'=>$_POST['crossNum'],'column'=>$column,'columnList'=>$columnList),'ESIdentify/getLinkFile');
	}
	/**
	 * 获取关联文件列表
	 */
	public function getLinkFile()
	{
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$query=$request->getPost('query');
		$type=$request->getGet('type');
		$path=$request->getGet('path');
		$size=$request->getPost('rp');
		$start=($page-1)*$size;
		$column=unserialize($request->getPost('qtype'));//列表字段
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$param=array('condition'=>$query,'columns'=>$column,'type'=>$type);
		$rows=$proxy->getLinkFileList($path,$start,$size,$userId,json_encode($param));
		$total = isset($rows->total)?$rows->total:0;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$operate='show_items';
		foreach($rows->dataList AS $row){
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'operate'=>'<span title="查看电子文件" class="link" onclick=show_file("'.$row->path.'") >&nbsp;</span>',
					),
					
			);
			foreach($column as $val){
				if(isset($row->$val)){
					$entry['cell'][$val]=$row->$val;
				}
			
			}
			$jsonData['rows'][] = $entry;
			$start++;
			
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author wangtao
	 * 执行删除操作
	 */
	public function delItems()
	{
		$request=$this->getRequest();
		$data=$request->getPost('path');
		$userID=$this->getuser()->getId();
		$str=rtrim($data,',');
		$path=str_replace('-', '/', $str);
		$pathJson=json_encode(explode(',', $path));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$pkgPath=$proxy->doNotFiling($pathJson,100,8,$userID);
		echo $pkgPath->flag;
	}
	/**
	 * @author wangtao
	 * 批量删除
	 */
	public  function batch_delete()
	{
		$request=$this->getRequest();
		$data=$request->getGet();
		$status=intval(isset($data['status'])?$data['status']:0);
		$strucID=intval(isset($data['strucid'])?$data['strucid']:0);
		$fields=$this->getQueryField($strucID,$status);
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');//liqiubo 20140924 加入保管期限字段需要的值，修复bug 911
		$rpValLst = $proxy->getRetentionPeriodVal($strucID,$status);
		return $this->renderTemplate(array('searchField'=>$fields,'rpValLst'=>$rpValLst,'struId'=>$strucID,'modelId'=>$status,'string'=>json_encode($array)));//liqiubo 20140930 传入结构和业务id，修复bug 492
	}
	/**
	 * @author wangtao
	 * 执行批量删除(动作)
	 */
	public function doBatchDelete()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		if(!isset($data['nodePath']))return;
		$condition=array();//查询条件
		$groupCondition=array();//分组条件
		if(isset($data['condition']) && !empty($data['condition'])){
			if(array_key_exists('condition',$data['condition'])){
				$condition=$data['condition']['condition'];
			}
			if(array_key_exists('groupCondition',$data['condition'])){
				$groupCondition=$data['condition']['groupCondition'];
			}
		}
		$nodePath=$data['nodePath'];
		$userID=$this->getUser()->getId();
		$fieldText = $data['fieldName'];//add @author ldm
		$fieldText = rtrim($fieldText,',');
		$conditionJson=array('groupCondition'=>$groupCondition,'condition'=>$condition,'operate'=>$fieldText);
		$conditionJson=json_encode($conditionJson);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->batchDelete($userID,$nodePath,$conditionJson);
		echo json_encode($result);
	}
	/**
	 * @author wangtao
	 * 批量编辑
	 */
	public  function batch_modify()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$status=intval(isset($data['status'])?$data['status']:0);
		$strucID=intval(isset($data['strucid'])?$data['strucid']:0);
		//xiewenda 20140923 加入type参数判断操作类型
		$type=$data['type'];
		$fieldsForUpdate=$this->getQueryFieldForBatchEdit($strucID,$status,$type);
		$fields=$this->getQueryField($strucID,$status);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$rpValLst = $proxy->getRetentionPeriodVal($strucID,$status);//liqiubo 20140904 获取保管期限列表值，修复bug911
		$flag='';
		if(empty($data['id']))
		{
			$flag=true;
		}
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		return $this->renderTemplate(array('flag'=>$flag,'searchFieldForUpdate'=>$fieldsForUpdate,'rpValLst'=>$rpValLst,'struId'=>$strucID,'modelId'=>$status,'searchField'=>$fields,'string'=>json_encode($array)));//liqiubo 20140930 传入结构和业务id，修复bug 492
	}
	
	/**
	 * 获取查询字段，通过表单规则
	 * @param unknown_type $strucID
	 * @param unknown_type $status
	 */
	private function getQueryFieldForFormRule($strucID,$status)
	{
		$proxy=$this->exec('getProxy','escloud_structurews');
		$searachField=$proxy->getDisplayFieldOfFormEntityListForEdit($strucID,$status);
		return $searachField;
	}
	/**
	 * 获取查询字段，通过表单规则
	 * @param unknown_type $strucID
	 * @param unknown_type $status
	 */
	private function getQueryFieldForBatchEdit($strucID,$status,$type)
	{
		$proxy=$this->exec('getProxy','escloud_structurews');
		$searachField=$proxy->getDisplayFieldOfFormEntityListForBatchEdit($strucID,$status,$type);
		return $searachField;
	}
	/**
	 * @author wangtao
	 * 执行批量修改动作
	 */
	public function doBatchModify()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		parse_str($data['editMap'],$output);
		if(!isset($data['nodePath']))return;
		$nodePath=$data['nodePath'];
		$pkgPath=$data['pkgPath'];
		$userID=$this->getUser()->getId();
		$fieldsList=$this->getFields($nodePath,'array');
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$list=array('editMap'=>$output,'columns'=>$fieldsList);
		$clientIp=$this->getClientIp();
				//记录操作日志
		switch($output['RadioGroup']){
			case 0://替换
					$list['operate']="字段\"{$data['fieldName']}\"中\"{$output['oldValue']}\"被替换为\"{$output['newValue']}\"";
					break;
			case 1://加前缀
					$list['operate']="字段\"{$data['fieldName']}\"加上前缀\"{$output['newValue']}\"";
					break;
			case 2://加后缀
					$list['operate']="字段\"{$data['fieldName']}\"加上后缀\"{$output['newValue']}\"";
					break;
			case 3://自动编号
					$isZero=(isset($output['isZero'])?$output['isZero']:false)?'且自动补零':'且不自动补零';
					$outNewValue=isset($output['newValue'])?$output['newValue']:'0';
					$list['operate']="字段\"{$data['fieldName']}\"设置自动编号，起始编号值为\"{$output['oldValue']}\",编号位数为\"{$outNewValue}\"$isZero";
					break;
		}
		$json=json_encode($list);
		if(empty($pkgPath))
		{
			$condition=isset($data['condition'])?$data['condition']:array();
			if(!isset($condition['groupCondition'])){
				$condition['groupCondition']=null;
			}
			$list['groupCondition']=$condition['groupCondition'];
			$list['condition']=isset($condition['condition'])?$condition['condition']:null;
			$listJson=json_encode($list);
// 			$isExistDataForCond = $proxy->checkIsExistDataForCond($userID,$nodePath,$listJson);//检查是否有符合条件的数据
			
			$result=$proxy->preBatchEdit($userID,$nodePath,$listJson);//编辑数据前对数据权限及正确性进行简单校验
			if($result->selectResult){
				if(isset($result->toLenght) && $result->toLenght){
					echo json_encode($result);
				}else{
					$res=$proxy->excuteBatchEdit($userID,$clientIp,$nodePath,$result->condstr,$json);//执行批量修改
					echo json_encode($res);
				}
			}else {//guolanrui 20140819 增加是否存在符合检索条件的数据的判断，如果没有则给出提示 BUGID：674
				echo "notExistDataForCond";
			}
			
		}else {
			$temp=explode(',',rtrim($pkgPath,','));
			$pkgPath=$temp;
			$list['nodeList']=$pkgPath;
			$listJson=json_encode($list);
			$result=$proxy->preSelectBatchEdit($userID,$listJson);//勾选数据进行编辑前进行权限及正确性简单判断
			if(isset($result->toLenght)){
				echo json_encode($result);
			}else{
				$res=$proxy->excuteSelectBatchEdit($userID,$clientIp,$nodePath,$listJson);//执行选择数据的批量修改
				echo json_encode($res);
			}
			
			
		}
	}
	/**
	 * @author shiyangtao
	 * 执行批量字段组合
	 */
	public function doBatchCombinationModify()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		if(!isset($data['nodePath']))return;
		$nodePath=$data['nodePath'];
		$pkgPath=$data['pkgPath'];
		$userID=$this->getUser()->getId();
		$fieldsList=$this->getFields($nodePath,'array');
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		
		$clientIp=$this->getClientIp();
		$converId=$data['fieldName'];
		//记录操作日志
		$list=array('columns'=>$fieldsList,'converId'=>$converId);
		$json=json_encode($list);
		if(empty($pkgPath))
		{
			$condition=isset($data['condition'])?$data['condition']:array();
			if(!isset($condition['groupCondition'])){
				$condition['groupCondition']=null;
			}
			$list['groupCondition']=$condition['groupCondition'];
			$list['condition']=isset($condition['condition'])?$condition['condition']:null;
			$listJson=json_encode($list);
			// 			$isExistDataForCond = $proxy->checkIsExistDataForCond($userID,$nodePath,$listJson);//检查是否有符合条件的数据
				
			$result=$proxy->preBatchCombinationEdit($userID,$nodePath,$listJson);//编辑数据前对数据权限及正确性进行简单校验
			if($result->selectResult){
				if(isset($result->toLenght) && $result->toLenght){
					return;
				}else{
					$res=$proxy->excuteBatchCombinationEdit($userID,$clientIp,$nodePath,$result->condstr,$json);//执行批量修改
					echo $res;
				}
			}else {//guolanrui 20140819 增加是否存在符合检索条件的数据的判断，如果没有则给出提示 BUGID：674
				echo "notExistDataForCond";
			}
				
		}else {
			$temp=explode(',',rtrim($pkgPath,','));
			$pkgPath=$temp;
			$list['nodeList']=$pkgPath;
			$listJson=json_encode($list);
			$result=$proxy->preBatchCombinationEdit($userID,$nodePath,$listJson);//编辑数据前对数据权限及正确性进行简单校验
			if(isset($result->toLenght)){
				return;
			}else{
				$res=$proxy->excuteSelectBatchCombinationEdit($userID,$clientIp,$nodePath,$listJson);//执行选择数据的批量修改
				echo $res;
			}
				
				
		}
	}
	/**
	 * modify  yzh  20130813
	 * @author yuanzhonghua
	 * 批量挂接(文件鉴定)
	 */
	public function batch_hanging()
	{
		$stid = $_GET['stid'];
		$moid = $_GET['moid'];
		$ids = $_GET['ids'];
		$flagQuery='';
		if(empty($ids))
		{
			$flagQuery=true;
		}
		$proz=$this->exec('getProxy','escloud_structurews');
		$list = $proz->getScanRule($stid,$moid);
		//liqiubo 20140708  如果业务下没设置，则再获取下默认状态下的
		$isHave = isset($list->right)?true:false;
		if(!$isHave){
			$list = $proz->getScanRule($stid,-1);
		}
		$scanPath=isset($list->path)?$list->path:"";
		$left = $list->left;
		$right = isset($list->right)?$list->right:null;
		$batchModifyStruId = isset($list->batchModifyStruId)?$list->batchModifyStruId:"";//liqiubo 20141010  这存的是真正的结构ID，如果当前是从案卷级挂接的，则此为卷内级结构，修复bug 1304
		$batchModifyIsGetChild = isset($list->batchModifyIsGetChild)?$list->batchModifyIsGetChild:"";
		$llen = count($left);
		$rlen = count($right);
		$compare = array();
		if($llen!=0||$rlen!=0){
			for($i=0;$i<$llen;$i++){
				$flag = true;
				for($j=0;$j<$rlen;$j++){
					if ($left[$i]->display==preg_replace("/\|\w+/","",$right[$j]->display)){
						$flag=false;
					}
				}
				if($flag==true){
					$compare[]=$left[$i];
				}
			}
		}
		$str='';
		if($right!=''){
			foreach($right as $val){
				$str.=$val->display.';';
			}
		}
		$fields=$this->getQueryField($stid,$moid);//liqiubo 20140808 加入综合查询页面所需的字段信息
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		$proxyRp=$this->exec('getProxy','escloud_businesseditws');//liqiubo 20140924 加入保管期限字段需要的值，修复bug 911
		$rpValLst = $proxyRp->getRetentionPeriodVal($stid,$moid);
		return $this->renderTemplate(array('scanPath'=>$scanPath,'batchModifyIsGetChild'=>$batchModifyIsGetChild,'batchModifyStruId'=>$batchModifyStruId,'rpValLst'=>$rpValLst,'struId'=>$stid,'modelId'=>$moid,'flagQuery'=>$flagQuery,'left'=>$compare,'str'=>$str,'string'=>json_encode($array),'searchField'=>$fields,'right'=>isset($list->right)?$list->right:null,'business'=>'文件鉴定','status'=>$moid),"ESIdentify/batch_hanging");//liqiubo 20140930 传入结构和业务id，修复bug 492
	}
	/**
	 * @author wangtao
	 * 生成档号
	 */
	public function createFileNum()
	{
		$request=$this->getRequest();
		$data=$request->getPost('path');
		if(empty($data))die;
		$userID=$this->getUser()->getId();
		$path=rtrim($data,',');
		$pathJson=json_encode(explode(',', $path));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->createFileNum($pathJson,$userID);
		echo json_encode($result);
	}
	/**
	 * 生成档号之前添加判断
	 * xuekun  added in  2014-9-24
	 */
	public function judgeCombinValues()
	{
		$request=$this->getRequest();
		$data=$request->getPost('path');
		if(empty($data))die;
		$path=rtrim($data,',');
		$pathJson=json_encode(explode(',', $path));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->judgeCombinValues($pathJson);
		echo json_encode($result);
	}
	
	/**
	 * liqiubo 20140521
	 * 执行批量生成档号功能之前的验证
	 * 验证关联规则，档号组合字段是否都已经设置
	 */
	public function createFileNumBatchVerification(){
		$request=$this->getRequest();
		$data=$request->getGet();
		$status=intval(isset($data['status'])?$data['status']:0);
		$strucID=intval(isset($data['strucid'])?$data['strucid']:0);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->createFileNumBatchVerification($status,$strucID);
		echo json_encode($result);
	}
	
	
	/**
	 * @author wangtao
	 * 撤件
	 */
	public function delFileNum()
	{
	    $userid = $this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost('path');
		if(!empty($data))
		{
			$path=rtrim($data,',');
			$pathJson=json_encode(explode(',', $path));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$result=$proxy->cancelCombinValue($pathJson,$userid);
			echo json_encode($result);
		}
	}
	/**
	 * @author wangtao
	 * 文件整理功能撤件
	 */
	public function unwindInnerFile()
	{
	    $userid = $this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost('path');
		if(!empty($data))
		{
			$path=rtrim($data,',');
			$pathJson=json_encode(explode(',', $path));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$result=$proxy->unwindInnerFile($pathJson,$userid);
			echo $result;
		}
	}
	/**
	 * @author
	 * 设置排序
	 */
	public function set_sort()
	{
		$request=$this->getRequest();
		$path=$request->getGet('path');
		
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$fields=$proxy->getFields($path);
		$userID=$this->getUser()->getId();
		$column=$this->exec('getProxy','escloud_cachews')->getCache(md5($path.$userID.'setSort'));
		$columnArray=array();
		if($column){
			$column = json_decode($column);
// 			$columnArray=explode(',', $column);
		}else {//TODO 去模板定义中拿排序规则
			$column=array();
			
		}
		return $this->renderTemplate(array('searchField'=>$fields,'columnArray'=>$column));
		
	}
	/**
	 * @author wangtao
	 * 保存排序设置
	 */
	public function setOrderColumn()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$userId=$this->getUser()->getId();
		$ip=$this->getClientIp();
		$user=array('user'=>$userId,'ip'=>$ip);
		if(is_array($data) && !empty($data))
		{
			$list=array_merge($data,$user);
		}
		$json=json_encode($list);
// 		echo $json.'        '.$data['datas'];
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->setOrderColumn($json);
		if($result){
			$cache = $this->exec('getProxy','escloud_cachews');//如果设置成功，将选择的字段放入缓存
			$datas = isset($data['datas'])?$data['datas']:'';//guolanrui 20140915 解决排序规则清空时，不管用的BUG：253
			$column = $cache->setCache(md5($data['path'].$userId.'setSort'),json_encode($datas));//转下json
		}
		echo $result;
	}
	/**
	 * @author
	 * 设置分组
	 */
	public function set_group()
	{
		$request=$this->getRequest();
		$path=$request->getGet('path');
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$fields=$proxy->getFields($path);
		$userID=$this->getUser()->getId();
		$column=$this->exec('getProxy','escloud_cachews')->getCache(md5($path.$userID.'setGroup'));
		//如果缓存中不存在 则在数据库中获取
		$columnArray=array();
		if($column){
			$temp=explode('cncolumn',$column);
			$columnArray=explode(',', $temp['0']);
		}else{
			$groupColumn=$proxy->getGroupValue($path.$userID.'setGroup');
			if ($groupColumn!==''){
			$temp=explode('cncolumn',$groupColumn);
			$columnArray=explode(',', $temp['0']);
			}
		}
		return $this->renderTemplate(array('searchField'=>$fields,'columnArray'=>$columnArray));
	}
	/**
	 * @author wangtao
	 * 根据用户ID获取分组设置字段
	 */
	public function getGroupColumn()
	{
		$request=$this->getRequest();
		$contentPath=$request->getPost('path');
		$contentPath=str_replace('/','-',$contentPath);
		$id=null;
		$number='0';
		$column=$request->getPost('column');
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$columnList=$this->exec('getProxy','escloud_cachews')->getCache(md5($contentPath.$userId.'setGroup'));
		
		if(!$columnList || $columnList=='cncolumn'){//如果缓存中不存在 则从数据库中获取
			$columndata=$proxy->getGroupValue($contentPath.$userId.'setGroup');
			if ($columndata!==''){
				$columnList=&$columndata;
			}else{
				return;
			}
			
		}
		$index=0;
		$columnArr=explode('cncolumn',$columnList);//将字段中文名称和英文分割
		$columnArray=explode(',', $columnArr[0]);
		if($column&&$column!='undefined'){
			/**
			 * 点击更多都是返回接收到的字段,反之获取当前字段的所在数组的下一个指针的值
			 */
			if(preg_match('/^\<more\>/i',$id)){//判断用户点击的是更多节点，如果是需要获得当前的字段名称
				$number=$request->getPost('number');
				$curColumn=$column;
			}else{
				$temp=array_flip($columnArray);
				$count=count($temp);
				if(intval($temp[$column]+1) > $count)return;
				$index=intval($temp[$column]+1);
				$curColumn=$columnArray[$index];
			}
			$id=$request->getPost('id');
			
		}else{
			$curColumn=$columnArray[$index];
		}
		$dataList=array('userId'=>$userId,'column'=>$curColumn,'numberLast'=>$number, 'nodeId'=>$id, 'limit'=>'20','columns'=>$columnArr[0]);
		$result=$proxy->getGroupColumn($contentPath,json_encode($dataList));
		$nodes['cncolumn']=$columnArr[1];
		$nodes['nodes']=$result;
		echo json_encode($nodes);
	}
	/**
	 * @author wangtao
	 * 保存分组设置
	 */
	public function setGroupColumn()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$cncolumn=$data['cncolumn'];
		$userId=$this->getUser()->getId();
		$ip =$this->getClientIp();
		$user=array('user'=>$userId,'limit'=>20,'ip'=>$ip);
		if(is_array($data) && !empty($data))
		{
// 			$list=array_merge(array_slice($data,0,2,true),$user);
			$list=array_merge($data,$user);//modify ldm
		}
		$json=json_encode($list);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->setGroupColumn($json);
		if($result->success){
			$cache = $this->exec('getProxy','escloud_cachews');//如果设置成功，将选择的字段放入缓存
			$column = $cache->setCache(md5($data['path'].$userId.'setGroup'),json_encode($data['column'].'cncolumn'.$cncolumn));//转下json再传
			//将选择字段放入数据库
			if($data['column']==''){
				$proxy->delBusinessGroup($data['path'].$userId.'setGroup');
			}else{
				$proxy->setGroupValue(json_encode(array('key'=>$data['path'].$userId.'setGroup','value'=>$data['column'].'cncolumn'.$cncolumn)));
			}

		}
		echo json_encode($result);
		
	}
	/**
	 * @author wangtao
	 * 执行移交档案动作
	 */
	public function setFileStatus()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		if(is_array($data) && !empty($data))
		{
			$userID=$this->getuser()->getId();
			$str=rtrim($data['path'],',');
			$status=intval($data['status']);
			$modelID=$status+1;
			$path=str_replace('-', '/', $str);
			$pathJson=json_encode(explode(',', $path));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			if($status==6){
				$pkgPath=$proxy->doNotFiling($pathJson,$modelID,5,$userID);
			}else if($status==7){
				$pkgPath=$proxy->doNotFiling($pathJson,3,10,$userID);
			}else{
				$pkgPath=$proxy->doNotFiling($pathJson,$modelID,$status,$userID);
			}
			echo json_encode($pkgPath);
		}
		
	}
	/**
	 * @author guolanrui 20140825
	 * 执行批量移交档案动作
	 */
	public function setFileStatusForCond()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$temp=array();
		if(is_array($data) && !empty($data))
		{
			//if(isset($_POST['condition']))$temp['condition']=$_POST['condition'];
			$temp['nodePath']=$_POST['nodePath'];
// 			if($_POST['groupCondition']!=""){
// 				$temp['groupCondition']=$_POST['groupCondition'];
// 			}
			if(isset($_POST['condition']) && !empty($_POST['condition'])){
				if(array_key_exists('condition',$_POST['condition'])){
					$condition=$_POST['condition']['condition'];
					$temp['condition']=$condition;
				}
				if(array_key_exists('groupCondition',$_POST['condition'])){
					$groupCondition=$_POST['condition']['groupCondition'];
				}
			}
			$userID=$this->getuser()->getId();
// 			$str=rtrim($data['path'],',');
			$temp['status']=intval($data['status']);
// 			$modelID=$status+1;
// 			$path=str_replace('-', '/', $str);
// 			$pathJson=json_encode(explode(',', $path));
			if(empty($userID))
			{
				$userID=0;
			}
			$temp['userid']=$userID;
			$postData=json_encode($temp);
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$pkgPath=$proxy->getToSetStatusPathForCond($postData);
// 			if($status==6){
// 				$pkgPath=$proxy->doNotFiling($pathJson,$modelID,5,$userID);
// 			}else if($status==7){
// 				$pkgPath=$proxy->doNotFiling($pathJson,3,10,$userID);
// 			}else{
// 				$pkgPath=$proxy->doNotFiling($pathJson,$modelID,$status,$userID);
// 			}
			echo json_encode($pkgPath);
		}
		
	}
	
	/**
	 * @author wangtao
	 * 执行不归档动作
	 */
	public function do_notfiling()
	{
		$request=$this->getRequest();
		$data=$request->getPost('path');
		$userID=$this->getuser()->getId();
		$str=rtrim($data,',');
		$path=str_replace('-', '/', $str);
		$pathJson=json_encode(explode(',', $path));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$pkgPath=$proxy->doNotFiling($pathJson,5,-4,$userID);
		echo $pkgPath->flag;
	}
	
	/**
	 * @author wangtao
	 * 查看不归档库文件
	 */
	public function notfiling()
	{
		$request=$this->getRequest();
		$data=$request->getGet();
		$fields=$this->getFields($data['path'],'string');
		return $this->renderTemplate(array('fields'=>$fields));
		
	}
	/**
	 * @author wangtao
	 * 执行退回操作
	 */
	public function send_back()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$status=intval($data['status']);
		$modelID=($status-1)>1?$status-1:1;
		if($status==1){
			$noteStatus=-2;
		}else if($status==2){
			$noteStatus=-1;
		}else if($status==6){
				$modelID=1;
				$noteStatus=6;
		}else if($status==7){
				$noteStatus=7;
		}
		$userID=$this->getuser()->getId();
		$str=rtrim($data['path'],',');
		$path=str_replace('-', '/', $str);
		$pathJson=json_encode(explode(',', $path));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$pkgPath=$proxy->doNotFiling($pathJson,$modelID,$noteStatus,$userID);
		echo $pkgPath->flag;
	}
	/**
	 * @author wangtao
	 * 查看日志
	 */
	public function show_note()
	{
	
		$request=$this->getRequest();
		$path=$request->getGet('path');
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$pkgPath=rtrim($path,',');
		$title=$proxy->getTitle($pkgPath);
		$title=json_decode(json_encode($title),true);
		return $this->renderTemplate(array('path'=>$pkgPath,'title'=>$title));
	}
	/**
	 * @author wangtao
	 * 获取日志信息
	 */
	public function getNote()
	{
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$rp=$request->getPost('rp');
		$rp = isset($rp) ? $rp : 20;
		$i=1;
		$start=($page-1)*$rp;
		$rows=$this->getLog($path,$start,$rp);
		$total = $rows['total'];
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows['logList'] AS $row){
			$entry= array('id'=>$i,
					'cell'=>array(
							'num'=>$i,
							'operation'=>$row['operation'],
							'operator'=>$row['operator'],
							'dateline'=>$row['dateline'],
					),
			);
			
			$jsonData['rows'][] = $entry;
			$i++;
				
		}
		echo json_encode($jsonData);
	}
	private function getLog($path,$start,$rp)
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getLog($path,$start,$rp);
		$rows=json_decode(json_encode($data),true);
		return  $rows;
	}
	/**
	 * @author wangtao
	 * 目录报表
	 *
	 */
	public function directory_reports()
	{
	
		$request=$this->getRequest();
		$data=$request->getPost();
		$status=intval(isset($data['status'])?$data['status']:0);
		$strucID=intval(isset($data['strucid'])?$data['strucid']:0);
		$boxThick = isset($data['boxthick'][0])?$data['boxthick'][0]:strval(2);
		$reportType=intval(isset($data['reportType'])?$data['reportType']:0);
		$fields=$this->getQueryField($strucID,$status);
		$flag='';
		if(isset($data['path']) &&  $data['path']==='flag')
		{
			$flag=true;
		}
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		$proxy=$this->exec('getProxy','escloud_structurews');
		$data=$proxy->getReportRuleForPrint($strucID,$status);//获取报表实例
		/** guolanrui 20140813 打印时，当规则中没有设置报表规则时，添加提示消息BUG：675 **/
		if(count($data) == 0){
			echo false;
		}else {
			$proxy=$this->exec('getProxy','escloud_businesseditws');//liqiubo 20140924 加入保管期限字段需要的值，修复bug 911
			$rpValLst = $proxy->getRetentionPeriodVal($strucID,$status);
			return $this->renderTemplate(array('flag'=>$flag,'rpValLst'=>$rpValLst,'struId'=>$strucID,'modelId'=>$status,'searchField'=>$fields,'data'=>$data,'string'=>json_encode($array),'boxthick'=>$boxThick,'reportType'=>$reportType));//liqiubo 20140930 传入结构和业务id，修复bug 492
		}
	
	}
	
	
	/**
	 * guolanrui 20140818 报表导出前，校验是否有符合条件的数据存在
	 */
	public function checkReportDataIsExists()
	{
		$userId=$this->getUser()->getId();
		$userIp=$this->getClientIp();
		$request=$this->getRequest();
		$data=$request->getPost();
		$nodePath=$data['nodePath'];
		$prePath=isset($data['prePath'])?$data['prePath']:'';
		$structureId=$data['strucid'];
		$busiModelId=isset($data['status'])?$data['status']:-100;
		$reportBox=isset($data['reportBox'])?$data['reportBox']:0;
		$groupCondition=array();
		$condition=array();
		if(isset($data['condition']) && !empty($data['condition'])){
			if(array_key_exists('condition',$data['condition'])){
				$condition=$data['condition']['condition'];
			}
			if(array_key_exists('groupCondition',$data['condition'])){
				$groupCondition=$data['condition']['groupCondition'];
			}
		}
		$reportId=$data['reportId'];
		$reportType=$data['style'];
		$isSelectReport = $data['path']=='flag'?'false':'true';
		if($data['path']=='flag'){//判断是否选中数据
			$jsonData=array('groupCondition'=>$groupCondition,'condition'=>$condition);
		}else{
			$str=rtrim($data['path'],',');
			$pathJson=explode(',', $str);
			$jsonData=array('paths'=>$pathJson);
		}
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$array=array(
				'userid'=>$userId,
				'nodePath'=>$nodePath,
				'prePath'=>$prePath,
				'structureId'=>$structureId,
				'busiModelId'=>$busiModelId,
				'reportId'=>$reportId,
				'reportType'=>$reportType,
				'reportTitle'=>$data['reportTitle'],
				'condHm'=>$jsonData,
				'userIp'=>$userIp,
				'reportBox'=>$reportBox
		);
		$result=$proxy->checkReportDataIsExists(json_encode($array));
		echo json_encode($result);
	}
	
	/**
	 * @author   20130808
	 * 执行报表打印动作
	 *
	 */
	public function do_report()
	{
		$userId=$this->getUser()->getId();
		$userIp=$this->getClientIp();
		$request=$this->getRequest();
		$data=$request->getPost();
		$nodePath=$data['nodePath'];
		$prePath=isset($data['prePath'])?$data['prePath']:'';
		$structureId=$data['strucid'];
		$busiModelId=isset($data['status'])?$data['status']:-100;
		$reportBox=isset($data['reportBox'])?$data['reportBox']:0;
		$groupCondition=array();
		$condition=array();
		if(isset($data['condition']) && !empty($data['condition'])){
			if(array_key_exists('condition',$data['condition'])){
				$condition=$data['condition']['condition'];
			}
			if(array_key_exists('groupCondition',$data['condition'])){
				$groupCondition=$data['condition']['groupCondition'];
			}
		}
		$reportId=$data['reportId'];
		$reportType=$data['style'];
		$isSelectReport = $data['path']=='flag'?'false':'true';
		if($data['path']=='flag'){//判断是否选中数据
			$jsonData=array('groupCondition'=>$groupCondition,'condition'=>$condition);
		}else{
			$str=rtrim($data['path'],',');
			$pathJson=explode(',', $str);
			$jsonData=array('paths'=>$pathJson);
		}
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$array=array(
				'userid'=>$userId,
				'nodePath'=>$nodePath,
				'prePath'=>$prePath,
				'structureId'=>$structureId,
				'busiModelId'=>$busiModelId,
				'reportId'=>$reportId,
				'reportType'=>$reportType,
				'reportTitle'=>$data['reportTitle'],
				'condHm'=>$jsonData,
				'userIp'=>$userIp,
				'reportBox'=>$reportBox
		);
		$result=$proxy->runReport(json_encode($array));
		echo $result;		
	}
	/**
	 * @author wangtao
	 * 下载
	 */
	public function downFile()
	{
		$cache = $this->exec('getProxy','escloud_cachews');//liqiubo 20140627 更改缓存服务
		$fileUrl = $cache->getCache($_GET['fileName']);
		$filName=basename($fileUrl);
	//  输入文件标签
	//	header('Content-type: application/pdf');
	//	header('Content-Type: application-x/force-download');
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
		
	}
	/**
	 * @author wangtao
	 * 下载报表
	 * 20131025
	 */
	public function fileDown()
	{
		$proxy=$this->exec('getProxy','escloud_reportservice');
		$fileUrl = $proxy->getFileUrl($_GET['fileId']);
		//$filName=basename($fileUrl->address);
		Header("Content-type: application/octet-stream");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$fileUrl);
		if($fileUrl){
			return readfile($fileUrl);
		}
		
	}
	/**
	 * @author wangtao
	 * 筛选
	 */
	public function filter()
	{
		
		$request=$this->getRequest();
		
		$data=$request->getGet();
		//shiyangtao 拿到path 20140819
		$status=intval(isset($data['status'])?$data['status']:0);
		$strucID=intval(isset($data['strucid'])?$data['strucid']:0);
		$fields=$this->getQueryField($strucID,$status);
		//liqiubo 20140818 业务下没有规则.则获取下默认状态下的规则
		if(empty($fields)){
			$fields = $this->getQueryField($strucID,-1);
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$rpValLst = $proxy->getRetentionPeriodVal($strucID,$status);//liqiubo 20140814 获取一下保管期限的值列表,修复bug509
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		$userid=$this->getUser()->getId();
		
		$path=isset($data['path'])?$data['path']:'';
		//得到筛选规则 shiyangta 20140820
		if($path == ''){
			$condition=null;
		}else{
			$condition=$proxy->searchCondition($userid,$path);
		}
		return $this->renderTemplate(array('searchField'=>$fields,'rpValLst'=>$rpValLst,'struId'=>$strucID,'modelId'=>$status,'condition'=>$condition,'string'=>json_encode($array)));//liqiubo 20140930 传入结构和业务id，修复bug 492
	}
	/**
	 * @author shiyangtao 
	 * 组合字段
	 */
	public function combination()
	{
	
		$request=$this->getRequest();
	
		$data=$request->getGet();
		$moid=intval(isset($data['moid'])?$data['moid']:0);
		$strucID=intval(isset($data['strucid'])?$data['strucid']:0);
		$fields=$this->getQueryField($strucID,$moid);
		//liqiubo 20140818 业务下没有规则.则获取下默认状态下的规则
		if(empty($fields)){
			$fields = $this->getQueryField($strucID,-1);
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$rpValLst = $proxy->getRetentionPeriodVal($strucID,$moid);//liqiubo 20140814 获取一下保管期限的值列表,修复bug509
		//shiyangtao 20140822 获取组合字段
		$combinationFilelds=$this->getQueryCombinationField($strucID, $moid);
		$array=array();
		foreach($fields as $key=>$value){
			if($value->dolength==null)
			{
				$value->dolength=0;
			}
			$array[$value->name]=strtolower($value->type).'/'.$value->length.'/'.'0/'.$value->dolength;
		}
		$flag='';
		if(empty($data['id']))
		{
			$flag=true;
		}
		return $this->renderTemplate(array('flag'=>$flag,'searchField'=>$fields,'rpValLst'=>$rpValLst,'struId'=>$strucID,'modelId'=>$moid,'combinationFilelds'=>$combinationFilelds,'string'=>json_encode($array)));//liqiubo 20140930 传入结构和业务id，修复bug 492
	}
	/*
	 * 保存批量生成档号
	 * @author 倪阳
	 * @date 2013-08-28
	 * @return json
	 */
	public function saveNumFilter() {
		$request=$this->getRequest();
		$path=$request->getGet('path');
		$map = $request->getGet('condition');
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->generateCombinValueByBatch($path,$userId,$_SERVER['REMOTE_ADDR'],json_encode($map));
		echo $result;
	}	
	
	public function packing()
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$request=$this->getRequest();
		$nodePath=$request->getGet('nodePath');
		$data = $proxy->getBoxColumns($nodePath);
		$fields='';
		foreach ($data as $key=>$value)
		{
			$fields.=json_encode($value).',';
		}
		$fields=rtrim($fields,',');
		if($fields != ''){
			$fields = $fields.',';
		}
		return $this->renderTemplate(array('fields'=>$fields, 'fieldList'=>$data));
	}
	/**
	 * @author wangtao
	 * 档案装盒
	 */
	public function doPacking()
	{
	    $userId=$this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost();
		$strucID=intval($data['strucID']);
		$boxID=$data['boxID'];
		$type=$data['type'];
		$strItemID=trim($data['itemID'],',');
		$jsonData=json_encode(explode(',', $strItemID));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->doPacking($strucID,$boxID,$jsonData,$userId,$type);
		echo json_encode($result);
	}
	/**
	 * @author wangtao
	 * 盒上架
	 */
	public function packetUpToStore()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		/** xiaoxiong 20140821 添加4状态值判断，当在档案著录进行上架操作时，状态值不变。 **/
		if($data['status'] == '4'){
			$status=intval($data['status']);
		} else {
			$status=intval($data['status'])+1;
		}
		$path=$data['path'];
		$boxId=trim($data['boxid'],',');
		$totalThickness = $data['totalThickness'];
		$upFlag = $data['upFlag'];
		$dataList=explode(',', $boxId);
		$storePath=str_replace('/', '-', $data['storePath']);
		$repositorypath = $storePath;
		if ($upFlag == 'false'){
			$storePath = "null";
		}
		$jsonData=json_encode($dataList);
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		//liqiubo 20141011 验证一下库位号字段的长度能否存下这个库房,修复bug 1222
		$isGreaterThan = $proxy->checkPacketUpToStore($data['struId'],$storePath);
		if($isGreaterThan=='NODigitalLibraryNum'){
			echo "NODigitalLibraryNum";
		}else if($isGreaterThan=='true'){
			echo "isGreaterThan";
		}else{
			$result=$proxy->packetUpToStore($path,$status,$storePath,$jsonData,$userId);
			
			// 更新上架或下架的格子的剩余宽度 longjunhao 20140827
			if ($upFlag == 'true') {
				$totalThickness = $totalThickness * -1;
			}
			$params = "repositorypath=".$repositorypath."&thickness=".$totalThickness."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
			parse_str($params,$out);
			$postData=json_encode($out);
			$storeRoom=$this->exec('getProxy','escloud_repositoryws');
			$storeRoom->updateRepositorypathThickness($postData);
			if($result==true || $result=="true"){
				echo "true";
			}else{
				echo "false";
			}
		}
	}
	/**
	 * 盒下架，将下架从上架中单独提取出来，解决不必要的逻辑判断麻烦
	 * @author longjunhao 20140916 
	 */
	public function packetDownToStore()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		/** 添加4状态值判断，当在档案著录进行上架操作时，状态值不变。 **/
		if($data['status'] == '4'){
			$status=intval($data['status']);
		} else {
			$status=intval($data['status'])+1;
		}
		$path=$data['path'];
		$boxId=trim($data['boxid'],',');
		$totalThickness = $data['totalThickness'];
		$dataList=explode(',', $boxId);
		$storePath=str_replace('/', '-', $data['storePath']);
		$jsonData=json_encode($dataList);
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->packetDownToStore($path,$status,$storePath,$jsonData,$userId);
	
		$params = "repositorypath=".$storePath."&thickness=".$totalThickness."&userId=".($this->getUser()->getId())."&remoteAddr=".$_SERVER["REMOTE_ADDR"] ;
		parse_str($params,$out);
		$postData=json_encode($out);
		$storeRoom=$this->exec('getProxy','escloud_repositoryws');
		$storeRoom->updateRepositorypathThickness($postData);
	
		echo $result;
	}
	/**
	 * @author wangtao
	 * ajax验证盒号的唯一性
	 */
	public function checkBoxFileNum()
	{
		$request=$this->getRequest();
		$packNo=$request->getGet('packNo');
		$path=$request->getGet('path');
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->checkBoxFileNum($path,$packNo);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 封盒
	 */
	public function packageBox()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$strucID=intval($data['strucid']);
		if(!empty($data))
		{
			$str=rtrim($data['packetId'],',');
			$pidJson=json_encode(explode(',', $str));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$result=$proxy->packageBox($strucID,$pidJson);
			echo $result;
		}
	}
	/**
	 * @author wangtao
	 * 修改盒信息
	 */
	public function modifyboxinfo()
	{
		$request=$this->getRequest();
		$boxID=$request->getGet('boxId');
		$strucID=$request->getGet('strucid');
		$path=$request->getGet('path');
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$boxInfo=$proxy->getBoxInfo($strucID,$boxID);
		
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		
		$formData = $proxy->getBoxFormForUpdate($path);
		$boxNo = $formData->boxNo;
		$boxNoLength = $formData->boxNoLength;
		$data = json_decode(json_encode($formData->form),true);
		foreach($data as $key=>$value){
			if($value['dolength']==null){
				$value['dolength']=0;
			}
			if(strpos($value["name"], 'C') === 0){
				foreach($boxInfo as $k=>$v){
					if($value["name"] == $k){
						$data[$key]["value"] = $v ;
					}
				}
			}
			$data[$key]['verify']=strtolower($value['type']).'/'.$value['length'].'/'.$value['isnull'].'/'.$value['dolength'];
		}
		
		$medata=$this->exec('getProxy','escloud_metadataws');
		/** xiaoxiong 20140819 获取一个元数据的代码值列表 **/
		$boxThicknessMetadataAttrs = $medata->getOneMetadataAttrs('boxThickness');
		return $this->renderTemplate(array('boxNo'=>$boxNo,'boxNoLength'=>$boxNoLength,'formData'=>$data,'boxInfo'=>$boxInfo, 'boxThicknessMetadataAttrs'=>$boxThicknessMetadataAttrs));
	}
	/**
	 * @author wangtao
	 * 更新盒信息(动作)
	 */
	public function updateBoxInfo()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$strucId=intval($data['strucid']);
		$path=$data['path'];
		$ip =$this->getClientIp();
		$userId=$this->getUser()->getId();
		
		parse_str($data['data'],$output);
		$output['userId']=$userId;
		$output['ip']=$ip;
		$jsonData = json_encode($output);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->updateBoxInfoByPath($path,$jsonData);
		echo json_encode($result);
	}
	/**
	 * @author wangtao
	 * 退回盒中的文件
	 */
	public function removeOut()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$path=$_GET['path'];
		$ip =$this->getClientIp();
		$userId=$this->getUser()->getId();
		$log=array();
		$strucId=intval($data['strucid']);
		$packetId=$data['packetId'];
		$type=$data['type'];
		$strItemID=trim($data['pkgPath'],',');
		$jsonData=json_encode(array('data'=>explode(',', $strItemID),'path'=>$path,'userId'=>$userId,'ip'=>$ip));
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->removeOutPacket($strucId,$jsonData,$packetId,$type);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 电子文件显示
	 */
	public function file_view()
	{
		//TODO guolanrui 20141015 获取临时权限将临时权限并到原权限中
		
		$tempReadRight = isset($_GET['tempReadRight']) ? $_GET['tempReadRight'] : 'false';
		$tempPrintRight = isset($_GET['tempPrintRight']) ? $_GET['tempPrintRight'] : 'false';
		$tempDownloadRight = isset($_GET['tempDownloadRight']) ? $_GET['tempDownloadRight'] : 'false';
		
		$request=$this->getRequest();
		$path=$request->getGet('path');
		if(empty($path)){
			echo 'pathErr';
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$path=str_replace('/', '-', $path);
		//20131120   YZH添加查看电子文件的方法统一
		$userId = $this->getUser()->getId();
		$paramIn=array('userId'=>$userId,'path'=>$path,'tempReadRight'=>$tempReadRight,'tempPrintRight'=>$tempPrintRight,'tempDownloadRight'=>$tempDownloadRight);
		$paramInfo=json_encode($paramIn);
		$filesInfo=$proxy->getDataInfoWhenOnlineView($paramInfo);
// 		$rightMap=$filesInfo->rightMap;
		$title=$filesInfo->titleInfo;
		$formData=$filesInfo->dataInfo;
		$data=json_decode(json_encode($formData),true);
		$files=$filesInfo->esFileInfo;
		$index=$filesInfo->index;/** xiaoxiong 20140911 第一条有文件浏览权限数据的位置 **/
		/**
		 * // 标题
		 * $title = $proxy->getTitle($path);
		 * // 条目
		 * $formData=$proxy->editItem($path);
		 * $data=json_decode(json_encode($formData),true);
		 * // 文件
		 * $files = $proxy->getFileInfoByPath($path);
		 */
		// 浏览原文时用户有色选一条或多条时默认取第一个电子文件ID@方吉祥
		$fileId = false;
		if(isset($_GET['fileId']) && $_GET['fileId']){
			$fileId = $_GET['fileId'];
		}
		if(count($files)){
			$newViewFiles = array();
			foreach ($files as $i=>$value){
				$files[$i] = $value->id;
				if($fileId && $files[$i]->originalId === $fileId){
					$index = $i;
				}
				$newViewFiles[$files[$i]->originalId]['fileDown'] = $files[$i]->fileDown ;
				$newViewFiles[$files[$i]->originalId]['filePrint'] = $files[$i]->filePrint ;
			}
			/** xiaoxiong 20140911 将文件的下载与打印权限缓存起来 **/
			$_SESSION['newViewFiles'] = $newViewFiles;
		}
		return $this->renderTemplate(array('formData'=>$data,'path'=>$path, 'title'=>$title, 'files'=>$files, 'index'=>$index));
	}
	public function isHasFileReadRight()
	{
		$request=$this->getRequest();
		$path=$request->getGet('path');
		if(empty($path)){
			echo 'pathErr';
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$path=str_replace('/', '-', $path);
		$userId = $this->getUser()->getId();
		$paramIn=array('userId'=>$userId,'path'=>$path);
		$paramInfo=json_encode($paramIn);
		echo $proxy->isHasFileReadRight($paramInfo);
	}
	/**
	 * YZH201307  MODIFY
	 * @author wangtao
	 * 添加盒信息
	 */
	public function add_packet()
	{
		$userId=$this->getUser()->getId();
		if(!isset($_GET['nodePath'])) return ;
		$path=$_GET['nodePath'];
		
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		
		$formData = $proxy->getBoxForm($path);
		$boxNo = $formData->boxNo;
		$boxNoLength = $formData->boxNoLength;
		$data = json_decode(json_encode($formData->form),true);
		foreach($data as $key=>$value){
			if($value['dolength']==null){
				$value['dolength']=0;
			}
			$data[$key]['verify']=strtolower($value['type']).'/'.$value['length'].'/'.$value['isnull'].'/'.$value['dolength'];
		}
		$medata=$this->exec('getProxy','escloud_metadataws');
		/** xiaoxiong 20140819 获取一个元数据的代码值列表 **/
		$boxThicknessMetadataAttrs = $medata->getOneMetadataAttrs('boxThickness');
		return $this->renderTemplate(array('boxNo'=>$boxNo,'boxNoLength'=>$boxNoLength,'formData'=>$data,'boxThicknessMetadataAttrs'=>$boxThicknessMetadataAttrs),'ESIdentify/add_packet');
	}
	
	/**
	 * 获取盒信息中的盒号返回的值
	 */
	public function getBoxNoVal(){
		$strId = $_POST['strId'];
		$busiId = $_POST['busiId'];
		$boxNoLength = $_POST['boxNoLength'];
		$jsonVal = $_POST['jsonVal'];
		$data = array('val'=>$jsonVal);
		//xiewenda 20140910 获得节点路径 为了得到treeNodeId
		$nodePath = $_GET['nodePath'];
		//转换为数组为了将treeNodeId加入到json数组里
		$jsonArr =json_decode($jsonVal,true);
		//截取路径中的treeNodeId值
		$nodePathArr = explode('-',$nodePath);
		$nodePathArr = explode('@',$nodePathArr[2]);
		$treeNodeId = $nodePathArr[0];
		$jsonArr['fileBoxNumber'][]=array('treeNodeId'=>$treeNodeId);
		$jsonVal =json_encode($jsonArr,true);
		
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->getBoxNoVal($strId,$busiId,$boxNoLength,$jsonVal);
		echo $result;
	}
	
	/**
	 * 201307 MODIFY
	 * @author yuanzhonghua
	 * 自动生成盒号
	 */
	public function checkAdd_packet(){
		$userId=$this->getUser()->getId();
		if(!isset($_POST['nodePath'])) return ;
		if(!isset($_POST['pursuantField'])) return ;
		$path=$_POST['nodePath'];
		$pursuantField=$_POST['pursuantField'];
		$fnsortTable=$_POST['fnsortTable'];
		if($fnsortTable==''){
			$fnsortTable='null';
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$strCode=$proxy->autoGenerationCode($path,urlencode($pursuantField),$fnsortTable,$userId);
		echo isset($strCode->boxnumber)?$strCode->boxnumber:'';
	}
	/**
	 * 201307  yzh  modify
	 * @author wangtao
	 * 保存盒信息
	 */
	public function savePacketInfo()
	{
	    $userid = $this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getPost();
		$archiveType=$data['archiveType'];
		$treeNodeId=$data['treeNodeId'];
		parse_str($data['data'],$output);
		$packetInfo=array();
		if(is_array($output))
		{
			foreach($output as $key=>$val)
			{
				if(!empty($val))
				{
					$packetInfo[$key]=$val;
				}
			}
			$packetInfo['filetype']=$archiveType;
			$packetInfo['treeNodeId'] = $treeNodeId;
		}
		////var_dump($packetInfo);exit;
		$ip=$this->getClientIp();
		$jsonData = json_encode($packetInfo);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->addPacketInfo($jsonData,$data['path'],$userid,$ip);
		echo json_encode($result);
	}
	/**
	 * @author wangtao
	 * 删除盒
	 */
	public function delPacket()
	{
	    $userid = $this->getUser()->getId();
		$request=$this->getRequest();
		$data=$request->getGet();
		if(!empty($data))
		{
			$str=rtrim($data['packetId'],',');
			$pidJson=json_encode(explode(',', $str));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$result=$proxy->delPacketInfo($pidJson,intval($data['strucid']),$data['path'],$userid);
			echo $result;
		}
		
	}
	/**
	 * @author wangtao
	 * modify at 2013-10-11 by niyang
	 * 获取盒信息列表
	 */
	public function getPacketList()
	{
		$userId = $this->getUser()->getId();
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$query=$request->getPost('query');
		$query=isset($query)?$query:'';
		$status = '';
		$status = intval(@$_GET['status']);
// 		$isAll = 'true';
		$treeNodeId = $_GET['treeNodeId'];
		$itemEditRight = $_GET['itemEditRight'];
		//整理编目功能中按照人员过滤档案盒信息
// 		if($status === 2 && @$_GET['isAll'] === 'true') {
// 			$isAll = 'true';
// 		} else if($status === 2 && @$_GET['isAll'] === 'false') {
// 			$isAll = 'false';
// 		} else if($status ===2 ) {
// 			$isAll = 'false';
// 		}
		$page = isset($page) ? $page : 1;
		$rp=$request->getPost('rp');
		$rp = isset($rp) ? $rp : 20;
// 		$condition= isset($_POST['query']) ? $_POST['query'] : '';
// 		if(empty($condition)){
// 			$condition=array();
// 		}else{
// 			if(isset($condition['condition'])){
// 				$condition=$condition['condition'];//筛选条件
// 			}
// 		}
		$i=1;
		$proxy=$this->exec('getProxy','escloud_businesseditws');
// 		$condition=json_encode(array('condition'=>$condition));//筛选条件
		if(isset($_GET['path'])){ // 装盒
			$path=$request->getGet('path');
			$rows=$proxy->getPacketList($path,$page,$rp,$query,$userId,"true",$treeNodeId);
			
		} else { // 移交盒
			
			$transferId=$request->getGet('transferId');
			$rows=$proxy->getTransterBox($transferId,$page,$rp);
		}
		//print_r($rows); die;
		$total = isset($rows->total)?$rows->total:0;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		/** xiaoxiong 20140904 添加数据权限控制盒数据是否可编辑 **/
		$editButtonSpan = '<span class="noeditbtn" title="您没有当前节点下的数据编辑权限，此功能不可用！">&nbsp;</span>' ;
		foreach($rows->datalist AS $row){
			
			$isTrue = $row->filetype === 'accounting'  && !isset($_GET['path']);
			$entry= array('id'=>$i,
					'cell'=>array(
							'num'=>$i,
							'packetIds'=>'<input type="checkbox" name="path" class="selectone" isHaveRepository="'.($row->repositorypath==""?0:1).'" value="'.$row->ID.'">',
							'opreate'=>($itemEditRight=="false"?$editButtonSpan:'<span class="editbtn" title="编辑查看盒信息" onclick=modifyBoxInfo("'.$row->ID.'")>&nbsp;</span></a>').'&nbsp;&nbsp;<span class="show" title="查看盒内档案信息" onclick=showBoxInnerFile("'.$row->fileBoxNumber.'","'.$row->ID.'") >&nbsp;</span>',
							'packetNum'=>$row->fileBoxNumber,
							'boxname'=> $isTrue ? $row->recordType : $row->boxname,
							'thickness'=>$row->boxthickness,
							'volume'=>$row->boxcapability,
							'curVolume'=>$row->curcapability,
							'expires'=>$row->period,
							'year'=>$row->year,
							'accPer'=> $isTrue ? $row->accountingPeriod : '',
							'repositorypath'=> $row->repositorypath,
							'memo'=> $row->memo
					)
			);
			if(isset($_GET['path'])){
				foreach ($row as $key=>$value){
					if(strpos($key, 'C') === 0)$entry['cell'][$key] = $value ;
				}
			}
			$jsonData['rows'][] = $entry;
			$i++;
		
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author wangtao
	 * 查看盒内文件列表
	 */
	/**
	 * @author wangtao
	 * 渲染右侧列表
	 */
	public function project()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$fields='';
		$fields=$this->getFields($data['path'],'string');
		$path=$data['path'];
		$busiModelId=substr($path,strpos($path,'_')+1,1);
		/** xiaoxiong 20140903 获取数据权限 start **/
		$userId=$this->getUser()->getId();
		/**获取权限说明：1、null 			代表拥有全部权限
		 * 			 2、false 			代表没有任何权限
		 * 			 3、(C26 = '短期')	代表部分有权限
		 **/
		$itemEditRight = "null" ;
		$itemDeleteRight = "null" ;
		if("admin" != $userId){
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$itemEditRight = $proxy->getRight($data['path'], $userId, 'itemEdit') ;
			$itemDeleteRight = $proxy->getRight($data['path'], $userId, 'itemDelete') ;
		}
		/** xiaoxiong 20140903 获取数据权限 end **/
		
		$isgroupNode=isset($_POST['isgroupNode'])?$_POST['isgroupNode']:'0';
		if($data['file']=='file')
		{   
			if ($busiModelId!=='1'&&$busiModelId!=='6'){//文件鉴定、案卷整理中，不显示"标识"字段
				$flag='{display:"标识",align: "left",width:50,name: "flag",metadata: "flag"},';//liqiubo 20140915 name属性中加入值，避免案卷刷不出盒标识
				$fields=$flag.$fields;
			}
			$innerFields='';
			if(!empty($data['nextpath'])){
				$innerFields=$this->getFields($data['nextpath'],'string');
			}
			return $this->renderTemplate(array('type'=>$data,'fields'=>$fields,'innerFields'=>$innerFields,'isgroupNode'=>$isgroupNode,'itemEditRight'=>$itemEditRight,'itemDeleteRight'=>$itemDeleteRight),'ESIdentify/project1');
		}elseif ($data['file']=='innerfile'){
			return $this->renderTemplate(array('type'=>$data,'fields'=>$fields,'isgroupNode'=>$isgroupNode,'itemEditRight'=>$itemEditRight,'itemDeleteRight'=>$itemDeleteRight),'ESIdentify/project2');
		}elseif($data['file']=='boxinnerfile'){
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$childStru = $proxy->getChildStruIdByPath($path);
			//liqiubo 20141014 件盒级，案卷级走两个页面，修复bug 1350
			if($childStru==0){
				//说明这个是卷内级结构，直接用原来的逻辑就OK了。
				return $this->renderTemplate(array('type'=>$data,'fields'=>$fields,'itemEditRight'=>$itemEditRight,'itemDeleteRight'=>$itemDeleteRight),'ESIdentify/showBoxInnerFile');
			}else{
				//说明这个是案卷卷内结构
				$innerFilefields='';
				$nextPath = $path.'_@'.$childStru;
				$innerFilefields=$this->getFields($nextPath,'string');
				return $this->renderTemplate(array('type'=>$data,'fields'=>$fields,'nextPath'=>$nextPath,'downFields'=>$innerFilefields,'itemEditRight'=>$itemEditRight,'itemDeleteRight'=>$itemDeleteRight),'ESIdentify/showBoxFile');
			}
		}else{
			if ($busiModelId!=='1'&&$busiModelId!=='6'){//文件鉴定、案卷整理中，不显示"标识"字段
				$flag='{display:"标识",align: "left",width:50,name: "flag",metadata: "flag"},';
				$fields=$flag.$fields;
			}
			
			return $this->renderTemplate(array('type'=>$data,'fields'=>$fields,'isgroupNode'=>$isgroupNode,'itemEditRight'=>$itemEditRight,'itemDeleteRight'=>$itemDeleteRight),'ESIdentify/project3');
		}
		
		
	}
	
	public function isHaveColumnModel(){
		$request=$this->getRequest();
		$data=$request->getPost();
		$isHave='';
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$isHave=$proxy->isHaveColumnModel($data['path']);
		echo $isHave;
	}
	
	
	/**
	 * @author wangtao
	 * 渲染文件鉴定
	 */
	public function identify()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=1;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'文件鉴定','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * liqiubo 20140813
	 * 数据回收站页面
	 */
	public function recycleBin()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=100;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'数据回收站','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * @author wangtao
	 * 文件整理
	 */
	public function collation()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=6;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'案卷整理','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * @author wangtao
	 * 文件编目
	 */
	public function catalogue()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=7;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'案卷编目','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * @author wangtao
	 * 渲染整理编目
	 */
	public function collationCatalogue()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=2;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'整理编目','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * @author wangtao
	 * 渲染归档入库
	 */
	public function putIntoStore()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=3;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'归档入库','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * @author wangtao
	 * 渲染档案著录
	 */
	public function archiveedit()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=4;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'business'=>'档案著录','status'=>$status,'serviceIp'=>$serviceIp),"ESIdentify/index");
	}
	/**
	 * @author wangtao
	 * 获取字段值
	 */
	private function getFields($param,$type)
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($param);
		if($type!=''&& $type=='string')
		{
			$str='';
			foreach ($data as $key=>$value)
			{
				$str.=json_encode($value).',';
			}
			$str=rtrim($str,',');
			return $str;
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
	 * @author wangtao
	 * 获取数据
	 */
	private function getDataList($path,$start,$limit,$uid,$json)
	{	
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getDataList($path,$start,$limit,$uid,$json);
		$rows=json_decode(json_encode($data),true);
		return  $rows;
	}
	/**
	 * @author wangtao
	 * 获取查询字段
	 */
	private function getQueryField($strucID,$status)
	{
		
			$proxy=$this->exec('getProxy','escloud_structurews');
			$searachField=$proxy->compreshowright($strucID,$status);
			if(empty($searachField)){//liqiubo 20140903 如果当前规则没设置，则获取一下默认的
				$searachField=$proxy->compreshowright($strucID,"-1");
			}
			return $searachField;
	}
	/**
	 * @author shiyangtao
	 * 获取组合字段
	 * @param unknown $strucID
	 * @param unknown $moid
	 */
	private function getQueryCombinationField($strucID, $moid)
	{
		$proxy=$this->exec('getProxy','escloud_structurews');
		$combinationFilelds=$proxy->combineshowtop($strucID,$moid);
		return $combinationFilelds;
	}
	/**
	 * @author fangjixiang
	 * 获取清册左侧树
	 */
	public function GetTransferTree()
	{
		$userId=$this->getUser()->getId();
		$res = $this->exec('getProxy','escloud_businesseditws')->getTransferTree($_GET['nodePath'],$userId);	//获得平台代理
		foreach ($res as $k=>$v){
			foreach ($v as $year=>$mon){
				$transfer_Nodes[] = array('id'=>$year, 'pId'=>1, 'name'=>$year.'年', 'open'=>true);
				
				foreach ($mon as $month){
					$transfer_Nodes[] = array('id'=>$year.'-'.$month, 'pId'=>$year, 'name'=>$month.'月');
				}
			}
		}
		$transfer_Nodes[] = array('id'=>1, 'pId'=>0, 'name'=>'移交清册', 'open'=>true);
		echo json_encode($transfer_Nodes);
	}
	
	// 新建移交清册#渲染模板 @ 方吉祥
	public function add_transfer_list()
	{
		
		//print_r($_GET);
		$uid = $this->getUser()->getId();
		$user = $this->exec('getProxy','user')->getUserInfo($uid);
		$getOrgid=$this->exec('getProxy','escloud_authservice');
		$orgid=$getOrgid->getBigDeptOrgId($uid);
		$userOrg = $this->exec('getProxy','user')->getOrgInfoByOrgId($orgid);
		if(isset($_POST['type']) && $_POST['type'] === 'accounting'){ // 会计档案单独处理
			
			$path = $_POST['path'];
			$startName = '会计年度';
			$endName = '会计期间';
			$startVal = '<input type="text" name="accountingYear" class="Wdate" id="accountingYear" value="'. date('Y') .'" />';
			$endVal = '<select name="accountingPeriod" class="select-acc-range"><option value="">请选择</option>';
			
			$proxy = $this->exec('getProxy','escloud_businesseditws');
			$list = $proxy->getAccountingPeriod($path, 'null', $uid);
			
			//print_r($list);
			foreach ($list as $row)
			{
				$endVal .= '<option>'. $row .'</option>';
			}
			
			$endVal .= '</select>';

		}else{
			
			$startName = '移交开始日期';
			$endName = '移交结束日期';
			$startVal = '<input type="text" name="starttime" id="starttime"  class="Wdate" value="'. date('Y-m-d') .'" />';
			$endVal = '<input type="text" name="endtime" id="endtime" class="Wdate" value="'. date('Y-m-d') .'" />';
		}
		$data = array(
				'personal'=> $user->displayName,
				'userid'=> $uid,
				'transferOrg'=>$userOrg->orgName, //$user->bigDeptName,
				'deptCode'=>$orgid, //$user->bigdeptid,
				'startName' => $startName,
				'endName'=> $endName,
				'startVal'=> $startVal,
				'endVal'=> $endVal
				
			);
		
		return $this->renderTemplate($data);
	}
	
	/**
	 * @author fangjixiang
	 * 保存新建清册列表
	 */
	public function SaveTransfer()
	{
		$nodePath = $_GET['nodePath'];
		$request=$this->getRequest();
		$postData=$request->getPost();
		$params = json_encode($postData);
		$result = $this->exec('getProxy','escloud_businesseditws')->saveTransfer($nodePath,$params);
		echo json_encode($result);
	}
	
	/**
	 * @author fangjixiang
	 * 获取清册列表
	 */
	function GetTransferList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$userId=$this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_businesseditws");
		$map = $proxy->getTransferList($userId,$_GET['businessid'],$_GET['strucid'],$_GET['params'],$page,$rp);
		$jsonData = array('page'=>$page,'total'=>$map->total,'rows'=>array());
		if(!$map->total){
			echo json_encode($jsonData);
			return;
		}
		
		foreach ($map->list as $linenumber=>$value)
		{
			$types = array(
					
					'document'=> '文书档案',
					'contract'=> '合同档案',
					'project'=> '工程档案',
					'accounting'=> '会计档案',
					'purchase'=> '采购档案',
					'technical'=> '科技档案',
					'carrierfiles'=> '多种载体档案',
					'personal'=> '员工档案',
					'auditfiles'=> '审计档案'
			);
			
			$entry= array(
					'id'=>$value->id,
					'cell'=>array(
							'linenumber'=> ++$linenumber,
							'checkbox'=> "<input type='checkbox' id='".$value->id."' name='inputsA' istransfer='".$value->isTransfer."' />",
							'showmes'=> "<input title='档案明细' type='button' id='".$value->id."' class='showinfo' istransfer='".$value->isTransfer."' />",
							'person'=> $value->userid,
							'transferTimes'=> $value->transferTimes,
							'startTime'=> $value->type === 'accounting' ? $value->accountYear : $value->starttime,
							'endTime'=> $value->type === 'accounting' ? $value->accountPeriod : $value->endtime,
							'unit'=> $value->orgid,
							'type'=> $types[$value->type],
							'documentType' => $value->type,
							'numbers'=> $value->numbers,
							'remark'=> $value->remark,
							'isTransfer'=> (!$value->isTransfer) ? '否' : '是'
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
		
	}
	
	
	//根据一个ID或多个ID删除清册@方吉祥
	public function DeleteTransfer()
	{

		$path = $_POST['path'];
		$formId = $_POST['formId'];
	    $userid = $this->getUser()->getId();//add ldm
		
		$proxy = $this->exec("getProxy", "escloud_businesseditws");
		$map = $proxy->deleteTransfer(json_encode($formId),$path,$userid);
		echo json_encode($map);
	}
	
	// 根据ID或多个ID删除档案详细
	public function DeleteBatchTransferReference()
	{
	    $path = isset($_GET['path'])?$_GET['path']:"";
	    $userid = $this->getUser()->getId();
		$id = $_GET['id'];
		$ids = explode(',', $_GET['ids']);
		//print_r($_GET); die();
		echo $this->exec("getProxy", "escloud_businesseditws")->deleteBatchTransferReference($id,json_encode($ids),$path,$userid);
	}
	
	
	//根据nodePath得到对应的字段并生成表头@方吉祥
	public function GetTransferdetailColumns()
	{
		$nodePath = $_GET['nodePath'];
		
		$businesseditws = $this->exec("getProxy", "escloud_businesseditws");
		$field = $businesseditws ->getTransferdetailColumns($nodePath);
		$hasChild = $field->hasChild;
		$colModel = array();		
		$column= array();
		foreach ($field->transferColumn as $value)
		{
// 			$colModel[] = array('display'=>$value->display, 'name'=>$value->name, 'width'=>$value->width, 'align'=>$value->align);
			//liqiubo 20140523 取值的时候，后台没有返回width，align字段
			$colModel[] = array('display'=>$value->display, 'name'=>$value->name);
			$column[] = $value->name;
		}
		
		echo json_encode(array('hasChild'=>$hasChild, 'column'=>$column, 'colModel'=>$colModel));
		
	}
	
	

	
	//根据nodePath得到对应的字段@方吉祥
	public function GetFiles()
	{
		
		$columns = explode(',', $_GET['column']);	// 前台传过来的表头列信息
		$nodePath = $_GET['nodePath'];
		$id = $_GET['id'];	// 卷内
		$bgimg = $_GET['hasChild'] == 'false' ? 'showedocument' : 'showchildinfo';	// 是否有卷内
																	
		$userid = $this->getUser()->getId();
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		
		$businesseditws = $this->exec("getProxy", "escloud_businesseditws");
		$result = $businesseditws->getFiles($userid,$nodePath,$id,$page,$rp,json_encode($columns));
		
		$total = property_exists($result, 'total') ? $result->total : '';
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if($total){
			
			foreach ($result->list as $linenumber => $value)
			{
				
				$path = str_replace('/', '-', $value->PATH);
				$entry= array(
						'id'=>$value->ID,
						'cell'=>array(
								'sortlinenumbers'=>$linenumber+1,
								'cbox'=>"<input type='checkbox' id='".$value->ID."' name='inputsB' />",
								'showedocument'=>"<input type='button' id='".$value->ID."' name='".$path."' class='".$bgimg."' />"
						)
				);
				
				foreach ($columns as $title)
				{
					$entry['cell'][$title] = $value->$title;
				}
				
				$jsonData['rows'][] = $entry;
				
			}

		}
		
		echo json_encode($jsonData);
	}
	
	
	// 显示卷内明细
	public function GetTransferdetail()
	{
		$columns = explode(',', $_GET['column']);	// 前台传过来的表头列信息
		$nodePath = $_GET['nodePath'];
		$userid = $this->getUser()->getId();
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		
		$businesseditws = $this->exec("getProxy", "escloud_businesseditws");
		$result = $businesseditws->getTransferdetail($userid,$nodePath,$page,$rp,json_encode($columns));
		
		$total = property_exists($result, 'total') ? $result->total : '';
		
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		
		if($total){
				
			foreach ($result->list as $linenumber => $value)
			{
		
				$path = str_replace('/', '-', $value->PATH);
				$entry= array(
						'id'=>$value->ID,
						'cell'=>array(
								'linenumbers'=>$linenumber+1,
								'cbox'=>"<input type='checkbox' id='".$value->ID."' name='inputsB' />",
								'showedocument'=>"<input type='button' id='".$value->ID."' name='".$path."' class='showedocument' />"
						)
				);
		
				foreach ($columns as $title)
				{
					$entry['cell'][$title] = $value->$title;
				}
		
				$jsonData['rows'][] = $entry;
		
			}
		
		}
		
		echo json_encode($jsonData);
	}
	
	
	/*
	 * author fangjixiang
	* 获取机构树
	*/
	public function GetOrg()
	{
		$orgProxy = $this->exec("getProxy","escloud_usingformws");
		$jsonData = array();
		//gengqianfeng 20141010 添加获取所有机构标示
		$o_id=isset($_GET['oid'])?$_GET['oid']:'';
		//xiewenda 20140929 添加对用户角色的判断 显示可以显示的部门信息
		$authProxy = $this->exec( "getProxy", "escloud_authservice" );
		$uid = $this->getUser()->getId();
		//gengqianfeng 20141015  添加获取所有机构标示
		$isAdmin = $o_id=='all' ? true : $authProxy->isAdmin ($uid);
		if ($isAdmin) {
			$org = $orgProxy->getOrg("admin");
			$oid = $org->orgid;
			$title = $org->orgName;
			$pid = $org->parentOrgId;
			$result = $orgProxy->getSubOrg($oid);
		}else {
			$org = $orgProxy->getOrg($uid);
			$oid = $org->orgid;
			$title = $org->orgName;
			$pid = $org->parentOrgId;
			$result = $orgProxy->getSubOrg($oid);
		}
		
		//xiewenda  20140918 修改参数值 isParent 和 open 改变显示效果
		foreach ($result as $value){
			$jsonData[] = array(
					'id'=>$value->orgid,
					'name'=>$value->orgName,
					'pId'=>$value->parentOrgId,
					'isParent'=>false,
					'open'=>false
			);
		}
		//xiewenda 20140929 判断是否有子节点 当前节点的显示方式
		if(empty($result)){
		// 顶级父节点
		$jsonData[] = array(
				'id'=>$oid,
				'name'=>$title,
				'pId'=>$pid,
				'isParent'=>false,
				'open'=>false);
		}else{
			$jsonData[] = array(
					'id'=>$oid,
					'name'=>$title,
					'pId'=>$pid,
					'isParent'=>true,
					'open'=>true);
		}
			
		echo json_encode($jsonData);
	}
	
	// 根据节点id获取二级树@方吉祥  return [{},{}]
	public function GetOrgList()
	{
		$oid = $_GET['oid'];
		$res = $this->exec("getProxy", "escloud_consumerservice")->getOrgList($oid);
	
		$zNodes = array();
		foreach ($res as $value)
		{
			$zNodes[] = array('id'=>$value->orgid,'pId'=>$value->parentOrgCode,'name'=>$value->orgNameDisplay,'isParent'=>true, 'open'=>true);
		}
		echo json_encode($zNodes);
	}
	
	// 获取机构部门列表@方吉祥
	public function GetSubOrgList()
	{
		$result = $this->exec("getProxy", "escloud_consumerservice")->getSubOrgList($_GET['oid']);
		$jsonData = array();
		foreach ($result as $value){
			$jsonData[] = array(
					'id'=>$value->ldapOrgCode,
					'name'=>$value->orgNameDisplay,
					'pId'=>$value->parentOrgCode,
					'open'=>true
			);
		}
		echo json_encode($jsonData);
	}
	
	// 根据机构ID查询这个机构下的所有用户@方吉祥
	public function FindUserListByOrgid()
	{
		$oid = $_GET['oid'];
		
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$pages = ($page-1)*$limit;
		$result = $this->exec("getProxy", "escloud_consumerservice")->findUserListByOrgid($oid,$pages,$limit);
		$total = $result->total ? $result->total : 0;
		$userData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if($total){
			foreach ($result->dataList as $k=>$value){
				
				$orgName = @$value->companyEntry->orgNameDisplay;
				$userName = @$value->userid;
				$displayName = @$value->displayName;
				
				$entry= array(
						'id'=>$value->userid,
						'cell'=>array(
								'linenumber'=>$k+1,
								'radio'=>"<input type='radio' id='".$userName.'@'.$displayName."' name='userid' />",
								'userName'=>$displayName,
								'orgName'=>$orgName
						)
				);
				$userData['rows'][] = $entry;
			}	
		}
		
		echo json_encode($userData);
	}
	
	/*
	 * author fangjixiang
	* 根据筛选条件筛选移交清册并分页
	*/
	public function GetTransferListByCondition()
	{
		$params = $_GET['params'];
		$params = explode('@', $params);
		$pageNow = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		
		$businessService = $this->exec("getProxy","escloud_businesseditws");
		$result = $businessService ->getTransferListByCondition($pageNow,$limit,$_GET['businessid'],$_GET['strucid'],json_encode($params));
		
		
		$total = $result->total;
		$jsonData = array('page'=>$pageNow,'total'=>$total,'rows'=>array());
		foreach ($result->list as $linenumber=>$value)
		{
			$TYPE = $value->TYPE;
				
			switch ($TYPE){
				case 'document' : $TYPE = '文书档案'; break;
				case 'contract' : $TYPE = '合同档案'; break;
				case 'project' : $TYPE = '工程档案'; break;
				case 'accounting' : $TYPE = '会计档案'; break;
				case 'purchase' : $TYPE = '采购档案'; break;
				case 'technical' : $TYPE = '科技档案'; break;
				case 'carrierfiles' : $TYPE = '多种载体档案'; break;
				case 'personal' : $TYPE = '员工档案'; break;
				case 'auditfiles' : $TYPE = '审计档案'; break;
				default: $TYPE = $TYPE; break;
			}
				
			$entry= array(
					'id'=>$value->ID,
					'cell'=>array(
							'linenumber'=>$linenumber+1,
							'checkbox'=>"<input type='checkbox' id='".$value->ID."' name='inputsA' />",
							'showmes'=>"<input type='button' id='".$value->ID."' class='showinfo' />",
							'person'=>$value->PERSON,
							'transferTimes'=>$value->TIMES,
							'startTime'=>$value->STARTTIME,
							'endTime'=>$value->ENDTIME,
							'unit'=>$value->UNIT,
							'type'=>$TYPE,
							'numbers'=>$value->NUMBERS,
							'remark'=>$value->REMARK
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * @author fangjixiang
	 * 获取移交清册目录报表选项(reportid,reportstyle,title)
	 */
	public function GetReportIdByReporttype()
	{
		$type = $_GET['type'];
		$proxy = $this->exec("getProxy","escloud_reportservice");
		$map = $proxy->getReportIdByReporttype($type);
		echo json_encode($map);
	}
	
	/**
	 * @author fangjixiang
	 * 移交清册目录报表
	 */
	public function PrintTransferReport()
	{
		$id = $_POST['id'];
		$format = $_POST['format'];
		$type = $_POST['type'];
		$checkedId = $_POST['checkedId'];
		$reportTitle = $_POST['reportTitle'];
		$nodePath = $_POST['nodePath'];
		$uid = $this->getUser()->getId();
		$proxy = $this->exec("getProxy","escloud_reportservice");
		$array=array('userid'=>$uid,'ids'=>$checkedId,'reportId'=>$id,'reportType'=>$format,'printType'=>$type,'reportTitle'=>$reportTitle,'nodePath'=>$nodePath);
		$result = $proxy->printTransferReport(json_encode($array));
		echo $result;
	}
	
	
	/**
	 * 根据档案条目path获取文件一挂接的文件列表
	 * @author dengguoqi
	 */
	public function getLinkFiles()
	{
		if(!isset($_GET['path'])) return ;
		$path = $_GET['path'];
		$userId=$this->getUser()->getId();
		$businessService = $this->exec("getProxy","escloud_businesseditws");
		$files = $businessService->getFileInfoByPath($path, $userId);
		$jsonData = array('page'=>1,'total'=>count($files),'rows'=>array());
		foreach ($files as $i=>$value)
		{
			$file = $value->id;
			$file->createTime = date('Y-m-d H:m:s',$file->createTime/1000);
			$entry= array(
					'id'=>$file->originalId,
					'cell'=>array_merge(array(
							'num'=>$i+1,
							'ids'=>'<input type="checkbox" name="id" fileRead="'.$file->fileRead.'" fileDown="'.$file->fileDown.'" filePrint="'.$file->filePrint.'">',
							'ywlj'=>$file->folderPath.'/'.$file->estitle,
						), json_decode(json_encode($file), true)),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 上传挂接文件
	 * @author dengguoqi
	 */
	public function linkFiles()
	{
		$upload = isset($_POST['upload'])?$_POST['upload']:false;
		if(!isset($_POST['path'])) return ;
		if(!isset($_POST['IdBusiModel'])) return ;
		if(!isset($_POST['files'])) return ;
		$path = $_POST['path'];
		$IdBusiModel = $_POST['IdBusiModel'];
		//加入日志所需字段
		$ip =$this->getClientIp();
		$userId=$this->getUser()->getId();
		$files = $_POST['files'];
		$folderService = $this->exec("getProxy","escloud_folderservice");
		echo $folderService->addFile($path, $IdBusiModel, json_encode(array('file'=>$files,'userId'=>$userId,'ip'=>$ip)), $upload);
	}
	
	/**
	 * 上传文件存到数据库，此时没有挂接
	 * @author liqiubo
	 */
	public function addNoLinkFile()
	{
		if(!isset($_POST['floderid'])) return ;
		if(!isset($_POST['files'])) return ;
		$floderid = $_POST['floderid'];
		$files = $_POST['files'];
		$folderService = $this->exec("getProxy","escloud_folderservice");
		echo $folderService->addNoLinkFile($floderid, json_encode($files));
	}
	/**
	 * @author wangtao
	 * 获取添加字段
	 */
	private function getForm($path)
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$formData=$proxy->getForm($path);
		$data=json_decode(json_encode($formData),true);
		
		// 添加归档单位和机构@fjx
// 		$uid = $this->getUser()->getId();
		////$userInfo=$this->exec("getProxy", "user")->getUserInfo($uid);
// 		$getOrgid=$this->exec('getProxy','escloud_authservice');
		//$orgid=$getOrgid->getBigDeptOrgId($uid);
		//$userOrg = $this->exec('getProxy','user')->getOrgInfoByOrgId($orgid);		
		// 结束@fjx
		foreach($data as $key=>$value){
			
			if($value['dolength']==null){
				$value['dolength']=0;
			}
			/*// 添加归档单位和机构@fjx
			if($value['metadata'] === 'ArchiveOrgan' && empty($value['value'])){
				$data[$key]['value'] = $orgid;//$orgId;
			}
			
			if($value['metadata'] === 'Organization' && empty($value['value'])){
				$data[$key]['value'] = $userOrg->orgNameDisplay;//$orgName;
			}
			// 结束@fjx*/
			
			$data[$key]['verify']=strtolower($value['type']).'/'.$value['length'].'/'.$value['isnull'].'/'.$value['dolength'];
		}
		return $data;
	}
	/**
	 * @author xiaoxiong 20140808
	 * 支持新组卷方式做了全面的修改
	 */
	public function generatePaper()
	{
		$request=$this->getRequest();
		$path=$request->getPost('path');
		/** 添加综合条件组卷相关代码 **/
		if(isset($path)){
			$temp['path']=explode(',',rtrim($path,','));
		} else {
			if(isset($_POST['condition']))$temp['condition']=$_POST['condition'];
			$temp['nodePath']=$_POST['nodePath'];
			if($_POST['groupCondition']!=""){
				$temp['groupCondition']=$_POST['groupCondition'];
			}
		}
		$userID=$this->getuser()->getId();
		if(empty($userID))
		{
			$userID=0;
		}
		$temp['user']=$userID;
		$pathjson=json_encode($temp);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$dataForm=$proxy->generateFiling($pathjson);
		if($dataForm->success == 'false'){
			echo "false";
			return ;
		} else if($dataForm->success == ''){
			echo "";
			return ;
		}
		if(isset($path)){
			$parentPath = $temp['path'][0] ;
			$parentPath = substr($parentPath, 0, strripos($parentPath, '/')) ;
			$parentPath=str_replace('/', '-', $parentPath);
			$childPath=str_replace('/', '-', $temp['path'][0]);
		} else {
			$childPath=$_POST['nodePath'];
			$parentPath=substr($childPath, 0, strripos($childPath, '-')) ;;
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
// 		$fieldList=$proxy->getColumnModelForEditor($parentPath);
		//$fieldList=$proxy->getFields($parentPath);
		$fieldList=$proxy->getAllFields($parentPath);//liqiubo 20140917 改为获取所有字段，否则当列表中没有某一字段，而表单有的时候，表单中无法拿到值
		$fields='';
		foreach ($fieldList as $key=>$value){
			$fields.=json_encode($value).',';
		}
		$fields=rtrim($fields,',');
		$childFields=$this->getFields($childPath,'string');
		$data=json_decode(json_encode($dataForm->list),true);
// 		foreach($data as $key=>$value){
// 			if($value['dolength']==null)
// 			{
// 				$value['dolength']=0;
// 			}
// 			$data[$key]['verify']=strtolower($value['type']).'/'.$value['length'].'/'.$value['isnull'].'/'.$value['dolength'];
// 		}
		$start = 1 ;
		$jsonData = array();
		foreach($data AS $row){//$rows['dataList']
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start,
							'operate'=>'<span class="editbtn" title="编辑"></span>',
							'where'=>$row["where"],
					),
						
			);
			for($j=0;$j<count($fieldList);$j++){
				if(array_key_exists($fieldList[$j]->name,$row)){
					$entry['cell'][$fieldList[$j]->name]=$row[$fieldList[$j]->name];
				}
			}
			$jsonData[] = $entry;
			$start++;
		}
		return $this->renderTemplate(array('fields'=>$fields,'data'=>json_encode($jsonData), 'childFields'=>$childFields, 'childPath'=>$childPath),'ESIdentify/generatePaperPage');
	}
	
	/**
	 * xiaoxiong 20140809
	 * 组卷界面点击案卷，获取下面的卷内数据方法
	 * @param unknown $where
	 * @return Ambigous <return_type, mixed, string>
	 */
	public function getGeneratePagerInnerData(){
		$childPath = $_GET['childPath'];
		$where = $_POST['query'];
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$temp['path']=$childPath;
		$temp['where']=$where;
		$pathjson=json_encode($temp);
		$data=$proxy->getGeneratePagerInnerData($pathjson);
		$fieldList=$proxy->getFields($childPath);
		$jsonData = array('page'=>1,'total'=>count($data),'rows'=>array());
		$start = 1 ;
		$data=json_decode(json_encode($data),true);
		foreach($data AS $row){//$rows['dataList']
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start,
					),
		
			);
			for($j=0;$j<count($fieldList);$j++){
				if(array_key_exists($fieldList[$j]->name,$row)){
					$entry['cell'][$fieldList[$j]->name]=$row[$fieldList[$j]->name];
				}
			}
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * xiaoxiong 20140809
	 * 组卷保存处理方法
	 * @return string
	 */
	public function doGeneratePaper()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		if(isset($data['itemPath'])&&!empty($data['itemPath'])){
			$filepath=$data['itemPath'];
		}
		$nodePath=$data['nodePath'];
		$userId=$this->getUser()->getId();
		$jsonData = array('user'=>$userId,'datas'=>$data["datas"],'nodePath'=>$nodePath,'filepath'=>$filepath, 'ip'=>$_SERVER['REMOTE_ADDR']);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$pkgpath=$proxy->doGeneratePaper($jsonData);
		echo $pkgpath;
	}
	/**
	 * @author wangtao
	 * 获取库房结构
	 */
	public function getStoreStructure()
	{
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$userId=$this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
// 		$orgId=$userInfo->shengid;//机构号
		$orgId="1";//liqiubo 20140603 机构号在标准版产品中不走此逻辑，故给个默认值，为以后再次扩展留下基础，而没有进行删除
		$storeList=$proxy->getRepositoryList($orgId);
		$org=array(array('id'=>'orgid','pId'=>'0','name'=>'北京东方飞扬股份有限公司','open'=>true,'isParent'=>true));
		$temp=json_decode(json_encode($storeList),true);
		echo json_encode(array_merge($org,$temp));
	}
	/**
	 * @author wangtao
	 * 根据父节点获取子结构
	 */
	public function getStoreNode()
	{
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$storeList=$proxy->gettree($_POST['repositoryid'],$_POST['id']);
		echo json_encode($storeList);
	}
	
	/**
	 * 删除挂接文件
	 * @author dengguoqi
	 */
	public function deleteLinkFiles()
	{
		$path = $_POST['path'];
		$ids = $_POST['ids'];
		$busiService = $this->exec("getProxy","escloud_businesseditws");
		echo $busiService->deleteFileInfo($path, json_encode($ids));
	}
	
	/**
	 * 修改挂接文件
	 * @author dengguoqi
	 */
	public function modifyLinkFiles()
	{
		$path = $_POST['path'];
		$files = $_POST['files'];
		$busiService = $this->exec("getProxy","escloud_businesseditws");
		echo $busiService->modifyFileInfo($path, json_encode($files));
	}
	/**
	 * @author wangtao
	 * 获取案卷数据
	 */
	public function getArchivesList()
	{
		$request=$this->getRequest();
		$path=$request->getGet('path');
		$fields=$this->getFields($path,'string');
		return $this->renderTemplate(array('fields'=>$fields));
	}
	/**
	 * @author wangtao
	 * 插件
	 */
	public function saveFilingData()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$filepath=$data['itemPath'];
		
		
		$path=rtrim($data['path'],',');
		$tempPath=explode(',', $path);
		$userId=$this->getUser()->getId();
		$jsonData = array('user'=>$userId,'path'=>$tempPath);
		$proxy = $this->exec("getProxy","escloud_businesseditws");
		$result=$proxy->saveFilingData($filepath, $jsonData);
		echo $result;
	}
	/**
	 * 动态分组设置
	 */
	public function setGroup()
	{
		//获取缓存分组字段
		$request=$this->getRequest();
		$path=$request->getGet('path');
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$column=$this->exec('getProxy','escloud_cachews')->getCache(md5($path.$userId.'setGroup'));
		if($column){
			
		}else{
		 $column=$proxy->getGroupValue($path.$userId.'setGroup');
		}
		$columnArr=explode('cncolumn',$column);//将字段中文名称和英文分割
		if(isset($columnArr[0]) && !empty($columnArr[0])){
			$columnArray=$columnArr[0];
		}else{
			echo json_encode(array('success'=>false));
			die;		
		}
		$list=array('user'=>$userId,'path'=>$path,'column'=>$columnArray,'limit'=>20,'cncolumn'=>$columnArray);//add ldm
		$json=json_encode($list);
		$result=$proxy->setGroupColumn($json);
		echo json_encode($result);
	}
	/**
	 * @author wangtao
	 * 根据档案门类获取分类列表
	 */
	public function getClassList()
	{
		$request=$this->getRequest();
		$archiveType=$request->getGet('archiveType');
		$jsonList=$this->exec('getProxy','escloud_essclassws')->getClassList($archiveType);
		echo json_encode($jsonList);
	}
	
	/**
	 * @author wanghongchen 20140717
	 * 根据结构id获取分类列表
	 */
	public function getClassListBySId()
	{
		$sId = $_GET['sId'];
		$params = json_encode(array('sId'=>$sId));
		$jsonList=$this->exec('getProxy','escloud_essclassws')->getClassListBySId($params);
		echo json_encode($jsonList);
	}
	
	/**
	 * @author wangtao
	 * 编辑案卷信息
	 */
	public function modifyGenerate(){
		$request=$this->getRequest();
		$path=$request->getGet('path');
		if(!empty($path)){
			$path=str_replace('/', '-', $path);
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$formData=$proxy->editItem($path);
				
			$data=json_decode(json_encode($formData),true);
			foreach($data as $key=>$value){
				if($value['dolength']==null)
				{
					$value['dolength']=0;
				}
				$data[$key]['verify']=strtolower($value['type']).'/'.$value['length'].'/'.$value['isnull'].'/'.$value['dolength'];
			}
		}
		return $this->renderTemplate(array('formData'=>$data),'ESIdentify/modifyGenerate');
	}
	/**
	 * @author wangtao
	 * 移交盒
	 * 2013-01-08
	 */
	public function sendPacket()
	{
		$request=$this->getRequest();
		$path=$request->getPost('path');
		$boxId=$request->getPost('boxid');
		$userId=$this->getUser()->getId();
		$dataList=explode(',', $boxId);
		if(count($dataList)==0)return;
		$jsonData=json_encode($dataList);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->sendPacket($path,$userId,$jsonData);
		echo $result;
	}
	/**
	 * @author yuanzhonghua
	 * 执行批量挂接（通过扫描规则）
	 * 2013-01-10
	 */
	public function massHanging(){
		$struId=$_POST['strucid'];
		$busiModelId=$_POST['status'];
		$treeNodeId=$_POST['treeNodeId'];
		$allOrPart=$_POST['allOrPart'];//20140729 liqiubo 加入完全匹配挂接，部分匹配挂接
		$pkgPath=$_POST['pkgPath'];
		//liqiubo 20140808 加入获取检索参数
		$condition=array();//查询条件
		$groupCondition=array();//分组条件
		if(isset($_POST['condition']) && !empty($_POST['condition'])){
			if(array_key_exists('condition',$_POST['condition'])){
				$condition=$_POST['condition']['condition'];
			}
			if(array_key_exists('groupCondition',$_POST['condition'])){
				$groupCondition=$_POST['condition']['groupCondition'];
			}
		}
		$conditionJson=array('groupCondition'=>$groupCondition,'condition'=>$condition);
		if(empty($pkgPath)){
			$temp=explode(',','no');
			$pkgPath=$temp;
			$conditionJson['nodeList']=$pkgPath;
		}else{
			$temp=explode(',',rtrim($pkgPath,','));
			$pkgPath=$temp;
			$conditionJson['nodeList']=$pkgPath;
		}
		$conditionJson=json_encode($conditionJson);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$userId=$this->getUser()->getId();//liqiubo 201409101 传入userid，后台好拿权限，修复bug 889
		$result=$proxy->execMassHanging($userId,$struId,$busiModelId,$treeNodeId,$allOrPart,$conditionJson);//20140729 liqiubo 加入完全匹配挂接，部分匹配挂接
		echo $result;
	}
	/**
	 * @author yuanzhonghua
	 * 上传本地文件后的批量挂接
	 * 2013-01-14
	 */
	public function massHangingFiles(){
		if(!isset($_POST['struId'])) return ;
		if(!isset($_POST['busiModelId'])) return ;
		if(!isset($_POST['files'])) return ;
		$struId=$_POST['struId'];
		$treeNodeId=$_POST['treeNodeId'];
		$busiModelId=$_POST['busiModelId'];
		$matchFile=$_POST['matchFile'];
		$allOrPart=$_POST['allOrPart'];//20140729 liqiubo 加入完全匹配挂接，部分匹配挂接
		if($matchFile==''){
			$matchFile='null';
		}
		$files=$_POST['files'];
		$isScan=$_POST['isScan'];
		if($isScan=='true'){
			$isScan='1';
		}else if($isScan=='false'){
			$isScan='0';
		}
		//liqiubo 20140808 加入获取检索参数		
		$pkgPath=$_POST['pkgPath'];
		
		$condition=array();//查询条件
		$groupCondition=array();//分组条件
		if(isset($_POST['condition']) && !empty($_POST['condition'])){
			if(array_key_exists('condition',$_POST['condition'])){
				$condition=$_POST['condition']['condition'];
			}
			if(array_key_exists('groupCondition',$_POST['condition'])){
				$groupCondition=$_POST['condition']['groupCondition'];
			}
		}
		$conditionJson=array('groupCondition'=>$groupCondition,'condition'=>$condition);
		if(empty($pkgPath)){
			$temp=explode(',','no');
			$pkgPath=$temp;
			$conditionJson['nodeList']=$pkgPath;
		}else{
			$temp=explode(',',rtrim($pkgPath,','));
			$pkgPath=$temp;
			$conditionJson['nodeList']=$pkgPath;
		}
		$conditionJson['files'] = $files;
		$conditionJson=json_encode($conditionJson);
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$userId=$this->getUser()->getId();//liqiubo 201409101 传入userid，后台好拿权限，修复bug 889
		$result=$proxy->batchAfterUpload($userId,$struId,$busiModelId,$matchFile,$conditionJson,$isScan,$treeNodeId,$allOrPart);//20140729 liqiubo 加入完全匹配挂接，部分匹配挂接
		echo $result;
	}
	/**
	 * @author wangtao
	 * @brief 生成二维码
	 * @date 2013-03-14
	 * @return string
	 */
	public function createCode()
	{
		$userId=$this->getUser()->getId();
		if(!isset($_POST['nodePath'])){
			$pathList=$_POST['pathList'];//选中的数据的path
			$param=array(
					'pathList'=>$pathList,
					'userId'=>$userId
					);
		}else{
			$path=$_POST['nodePath'];
			$query=$_POST['condition'];
			$condition=array();
			$groupCondition=array();
			if(isset($query['condition'])){
				$condition=$query['condition'];//筛选条件
			}
			if(isset($query['groupCondition'])){
				$groupCondition=$query['groupCondition'];//分组条件
			}
			$param=array(
					'path'=>$path,
					'userId'=>$userId,
					'groupCondition'=>$groupCondition,
					'condition'=>$condition
					);
		}
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->createCode($param);
		if($result && preg_match('/^failure/',$result)){
			echo $result ;
			return;
		}
		$key=md5($result);
		$cache = $this->exec('getProxy','cache');
		$cache->setCache($key,$result);
		echo $key;
	}
	public function test()
	{
		echo '<pre>';
		print_r($_POST);
		echo '</pre>';
	}
	/**
	 * 编辑时获取上一条或者下一条数据
	 * @author wangtao
	 * @date 2013-03-22
	 * @return mixed
	 * 
	 */
	 public function getNextItem()
	 {
	 	$request=$this->getRequest();
		$path=$request->getGet('path');
		//判断编辑的数据是否为不归档库数据，如果是则将/archive_5/替换为/archive_1，为的是不归档库显示的字段和文件鉴定的字段一致
		if(preg_match('/\/archive_5/', $path)){
			$path=preg_replace('/\/archive_5/', '/archive_1', $path,1);
		}
		if(!empty($path)){
			$path=str_replace('/', '-', $path);
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$formData=$proxy->editItem($path);
			
			$data=json_decode(json_encode($formData),true);
			echo json_encode($data);
		}
	 }
	 /**
	  * @author wangtao
	  * 打印盒的二维码
	  */
	  public function printPacketCode()
	  {
	  	$userId=$this->getUser()->getId();
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$_POST['userId']=$userId;
	  	$result=$proxy->createPacketCode($_POST);		
	  	if($result && preg_match('/^failure/',$result)){
			echo $result ;
			return;
		}
		$key=md5($result);
		$cache = $this->exec('getProxy','cache');
		$cache->setCache($key,$result);
		echo $key;
	  }
	  /**
	   * 根据凭证类型和会计期间获得最小的凭证编号
	   * @author wangtao
	   * Enter description here ...
	   */
	  public function getRecordCode()
	  {
	  	$path=$_GET['nodePath'];
	  	$classificationName=$_GET['classficationName'];
	  	$accountingPeriod=$_GET['limitTime'];
	  	$userId=$this->getUser()->getId();
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$result=$proxy->getRecordCode($path,urlencode($classificationName),$accountingPeriod,$userId);
	  	$i = 0;
	  	foreach($result as $k=>$v) {
			$data_1[$i]['id'] = $i+1;
			$data_1[$i]['recordIdMin'] = '<input type="text" value="'.($v->recordIdMin).'" style="width:150px; height:16px; border:1px solid rgb(171,173,179); margin-bottom: 4px;" />';
			$data_1[$i]['companyName'] = $v->companyName;
			$data_1[$i]['ledgerSource'] = $v->ledgerSource;
			$data_1[$i]['companyCode'] = $v->companyCode;
			$data_1[$i]['maxrecordCode'] = '<input type="text" value="" style="width:150px; height:16px; border:1px solid rgb(171,173,179); margin-bottom: 4px;" />';
			$i++;
		}
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$data['page'] = $page;
		$data['total'] = empty($result) ? 0 : count($result);
		$data['rows'] = empty($data_1) ? '[]' : $data_1;
	  	header('Content-type:application/json');
		exit(json_encode($data));
	  }
	  /**
	   * @yzh   20130806
	   * 文件校验页面的渲染
	   */
	  public function file_verification(){
	  	$userId=$this->getUser()->getId();
	  	date_default_timezone_set("PRC");
	  	$res=date("Y-m-d H:i:s",strtotime("-2 months"));
	  	$forceDate=substr($res,0,4);
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$periodDate=$proxy->getAccountingPeriodByDate($userId,$forceDate);
	  	return $this->renderTemplate(array('forceDate'=>$forceDate,'periodDate'=>$periodDate),'ESIdentify/file_verification');
	  }
	  /**
	   * @yzh   20130805
	   * 文件校验---校验会计档案的数据
	   */
	  public function fileVerification(){
	  	$path=$_POST['nodePath'];
	  	parse_str($_POST['data'],$param);
	  	$classificationNameVal=$param['classificationNameVal'];
	  	$accountingPeriodVal=$param['accountingPeriodVal'];
	  	$yearMonthVal=$param['yearMonthVal'];
	  	$userId=$this->getUser()->getId();
	  	$list=array(
	  		'userid'=>$userId,
	  		'path'=>$path,
	  		'recordType'=>$classificationNameVal,
	  		'accountingPeriod'=>$accountingPeriodVal
	  	);
	  	$param=json_encode($list);
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$result=$proxy->fileVerifi($param);
	  	$resultLen=count($result);
	  	if($resultLen==0){
	  		echo "noAccountData";
	  	}else{
	  		return $this->renderTemplate(array('resultLen'=>$resultLen,'path'=>$path,'classificationNameVal'=>$classificationNameVal,'accountingPeriodVal'=>$accountingPeriodVal,'yearMonthVal'=>$yearMonthVal),'ESIdentify/fileVerifiResult');
	  	}
	  }
	  /**
	   * @author yuanzhonghua 20130819
	   * 文件校验结果列表的显示
	   */
	  public function showResultList(){
	  	if(!isset($_GET['path'])) return ;
		$path = $_GET['path'];
	  	if(!isset($_GET['classificationNameVal'])) return ;
		$classificationNameVal = $_GET['classificationNameVal'];
		if(!isset($_GET['accountingPeriodVal'])) return ;
		$accountingPeriodVal = $_GET['accountingPeriodVal'];
		if(!isset($_GET['yearMonthVal'])) return ;
		$yearMonthVal = $_GET['yearMonthVal'];
		$userId=$this->getUser()->getId();
	  	$list=array(
	  		'userid'=>$userId,
	  		'path'=>$path,
	  		'recordType'=>$classificationNameVal,
	  		'accountingPeriod'=>$accountingPeriodVal
	  	);
	  	$param=json_encode($list);
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$resultLists=$proxy->fileVerifi($param);
		$i=1;
		$jsonData = array('page'=>1,'total'=>count($resultLists),'rows'=>array());
		foreach ($resultLists as $val)
		{
			$entry= array(
					'id'=>$i,
					'cell'=>array(
						'num'=>$i,
						'operating'=>"<input type='radio' name='oprate' value='".$val->companyCode."|".$val->accountSource."'/>",
						'accountingPeriod'=>$val->accountingPeriod,
						'recordType'=>$val->recordType,
						'companyName'=>$val->companyName,
						'recordIdMin'=>$val->recordIdMin,
						'recordIdMax'=>$val->recordIdMax,
						'shouldReceive'=>$val->shouldReceive,
						'receive'=>$val->receive
						//'electronicAttachmentStatus'=>$val->electronicAttachmentStatus
					)
			);
			$i++;
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	  }
	  /**
	   * @author   yuanzhonghua   20130809
	   * 文件校验---校验会计档案的数据---导出报表
	   */
	  public function printAccountingReport(){
	  	$userId=$this->getUser()->getId();
	  	$path=$_POST['nodePath'];
	  	$mapData=$_POST['mapData'];
	  	$mapDataList=explode('|',$mapData);
	  	parse_str($_POST['data'],$param);
	  	$accountingPeriod=$param['accountingPeriodVal'];
	  	$list=array(
	  		'userid'=>$userId,
	  		'path'=>$path,
	  		'recordType'=>$mapDataList[6],
	  		'accountingPeriod'=>$accountingPeriod,
	  		'companyCode'=>$mapDataList[0],
	  		'ledgerSource'=>$mapDataList[1],
	  		'companyName'=>$mapDataList[2],
	  		'recordIdMin'=>$mapDataList[3],
	  		'recordIdMax'=>$mapDataList[4],
	  		'recordTotal'=>$mapDataList[5]
	  	);
	  	$param=json_encode($list);
	  	$proxy=$this->exec('getProxy','escloud_reportservice');
	  	$result=$proxy->printAccountReport($param);
	  	if($result){
	  		if($result=='nodata'){
	  			echo 'nodata';
	  		}else{
	  			/*$fileName=basename($result);//获取下载文件的名称
				$pos=strrpos($fileName, '.');
				$key=substr($fileName, 0,$pos);//去除文件后缀，作为缓存的KEY
				$cache = $this->exec('getProxy','cache');
				$cache->setCache(md5($key),$result);
				echo md5($key);*/
				echo 1;
	  		}
		}else{
			echo 0;
		}
	  }
	  /**
	   * @yzh   20130805
	   * 根据年度月份获取会计期间列表
	   */
	  public function getAccountingPeriodVal()
	  {
	  	$userId=$this->getUser()->getId();
	  	$yearMonthVal=$_POST['yearMonthVal'];
	  	if($yearMonthVal=='')return;
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$result=$proxy->getAccountingPeriodByDate($userId,$yearMonthVal);
	  	echo json_encode($result);
	  }
	  /**
	   * 会计档案根据装盒的数据规则装盒
	   * @author wangtao
	   * Enter description here ...
	   */
	  public function addInfoAccountToBox()
	  {
	  	parse_str($_POST['data'],$param);
	  	$data['classificationNameValue'] = $param['classificationNameValue'];
	  	$data['accountingPeriodValue'] = $param['accountingPeriodValue'];
	  	$arr = array();
	  	$arr_minRecordIDValue = explode(',',$param['minRecordIDValue']);
	  	$arr_maxRecordIDValue = explode(',',$param['maxRecordIDValue']);
	  	$arr_ledgerSource = explode(',',$param['ledgerSource']);
	  	$arr_companyCode = explode(',',$param['companyCode']);
	  	for($k=0; $k<count($arr_maxRecordIDValue); $k++) {
	  		if(empty($arr_minRecordIDValue[$k])) continue;
	  		$arr[$k]['minRecordIDValue'] = $arr_minRecordIDValue[$k];
	  		$arr[$k]['maxRecordIDValue'] = $arr_maxRecordIDValue[$k];
	  		$arr[$k]['companyCodeValue'] = $arr_companyCode[$k];
	  		$arr[$k]['ledgerSourceValue'] = $arr_ledgerSource[$k] ? $arr_ledgerSource[$k] : '';
	  	}
	  	$data['detailList'] = $arr;
	  	$path=$_POST['path'];
	  	$boxID=$_POST['boxID'];
	  	$ip=$this->getClientIp();
	  	$userId=$this->getUser()->getId();
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$result=$proxy->addInfoAccountToBox($path,$userId,$boxID,$ip,json_encode($data));
	  	echo json_encode($result);
	  } 
	  /**
	   * 根据凭证类型获得会计期间列表
	   * @author wangtao
	   */
	  public function getAccountingPeriod()
	  {
	  	$path=$_POST['nodePath'];
	  	$classificationName=$_POST['classificationName'];
	  	$userId=$this->getUser()->getId();
	  	$proxy=$this->exec('getProxy','escloud_businesseditws');
	  	$result=$proxy->getAccountingPeriod($path,urlencode($classificationName),$userId);
	 	echo  json_encode($result);	  
	  }
	  
	/**
	  *
	  * @desc：移交档案库 会计档案
	  * @author: fangjixiang 2013-8-5
	  * @param boxId
	  * @param busiModelId
	  * @return
	  */
	 
	 public function setBusiModelForBox()
	 {
	 	$data = $_POST['data'];
	 
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
	  	$isok = $proxy->setBusiModelForBox(json_encode($data));
	  	header('content-type:application/json; charset=utf-8');
	  	echo json_encode($isok);
	 }
	 
	 /**
	  * @desc 根据报账单号查询凭证
	  * @author 倪阳
	  * @return json
	  */
	 public function queryCertificate() {
	 	$path = $_GET['path'];
	 	$number = $_GET['number'];
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
	 	$list = $proxy->getPidByAttachRecordId($path,$number);
	 	if(empty($list)===FALSE) {
	 		$arr = array();
			foreach($list as $v) {
	 			$arr[] = 'ID,equal,'.$v.',false';
	 		}
	 		echo json_encode($arr); 	
	 	}else{
	 		echo json_encode(array('status'=>'0','msg'=>'没有找到该报账单号！'));
	 	}
	 }
	 
	 /**
	  * @desc 获取文件种类
	  * @author 倪阳
	  * @return json
	  */
	 public function getDocumentTypeList() {
	 	$path = isset($_GET['path']) ? $_GET['path'] : '';
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
	 	$OADocumentType = $proxy->getOADocumentTypeList($path);
	 	if(empty($OADocumentType) === FALSE) {
	 		$data = array('status'=>200, 'mag'=>'请求成功！', 'data'=>$OADocumentType);
	 	} else {
	 		$data = array('status'=>-1, 'mag'=>'请求失败！', 'data'=>array());
	 	}
	 	header('Content-Type:application/json; charset=utf-8');
	 	exit(json_encode($data));
	 }	 
	 
	 /**
	  * @desc 获取字段长度
	  * @author wanghongchen
	  * @return json
	  */
	 public function getColumnLen() {
	 	$col = isset($_GET['col'])?$_GET['col']:"";
	 	if ($col=="")return;
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
	 	$columLen = $proxy->getColumnLen($col);
	 	echo $columLen;
	 }
	 /**
	  * 获取上传文件的url
	  */
	 public function getUploadURL(){
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
// 	 	$url = $proxy->getUploadUrl();
		/** guolanrui 20141213 由于文件服务子服务已增加根据网段控制，所以获取上传url改为新方法 **/
	 	$ip=$this->getClientIp();
	 	$data["clientIP"] = $ip;
	 	$url = $proxy->getNewUploadUrl(json_encode($data));
	 	echo $url;
	 }
	 
	 /**
	  * 获取字段值规则返回的值
	  */
	 public function getComputeFieldRuleVal(){
	 	$strId = $_POST['strId'];
	 	$busiId = $_POST['busiId'];
	 	$jsonVal = $_POST['jsonVal'];
	 	$treeNodeId = $_POST['treeNodeId'];	 	
	 	$path = isset($_POST['path'])?$_POST['path']:"-archive_4-1@_-@2";	 	
	 	$data = array('val'=>$jsonVal);
	 	$proxy=$this->exec('getProxy','escloud_businesseditws');
	 	$result=$proxy->getComputeFieldRuleVal($strId,$busiId,$jsonVal,$treeNodeId,$path);
	 	echo json_encode($result);
	 }
	 
	 public function uptostore(){
	 	$proxy=$this->exec('getProxy','escloud_repositoryws');
	 	$storeList=$proxy->getRepositoryListImg();
	 	$temp=json_decode(json_encode($storeList),true);
	 	return $this->renderTemplate(array('storeList'=>$temp));
	 }
	 
	 public function getRepositoryListImgByParentId(){
	 	$parentId = isset($_GET['parentId']) ? $_GET['parentId'] : '';
	 	$proxy=$this->exec('getProxy','escloud_repositoryws');
	 	$storeList=$proxy->getRepositoryListImgByParentId($parentId);
	 	$temp=json_encode($storeList);
	 	echo $temp;
	 }
	 
	 /**
	  * 检查是否设置扫描规则
	  * @author longjunhao 20140725
	  */
	 public function checkFileScanPolicy() {
	 	if(!isset($_POST['path'])) return ;
	 	if(!isset($_POST['IdBusiModel'])) return ;
	 	$path = $_POST['path'];
	 	$IdBusiModel = $_POST['IdBusiModel'];
	 	$param = json_encode(array('path'=>$path,'IdBusiModel'=>$IdBusiModel));
	 	$folderService = $this->exec("getProxy","escloud_folderservice");
	 	echo $folderService->checkFileScanPolicy($param);
	 }
	 /**
	  * 检查是否设置组合字段规则
	  * @author shiyangtao 20140822
	  */
	 public function checkCombinationFiled() {
	 	if(!isset($_POST['moid'])) return ;
	 	if(!isset($_POST['strucid'])) return ;
	 	$moid = $_POST['moid'];
	 	$strucID = $_POST['strucid'];
	 	$status = $moid;
	 	$combinationFilelds=$this->getQueryCombinationField($strucID, $moid);
	 	if(empty($combinationFilelds->right)){
		 	$combinationFilelds=$this->getQueryCombinationField($strucID, "-1");
		 	$status = -1;//liqiubo 20140904 如果当前规则没有，则获取默认状态的，并且将是从哪获取的值传下去，修复bug885
	 	}
	 	$flag='false';
	 	foreach($combinationFilelds->right as $key=>$val){
	 		$flag='true';
	 	}
	 	echo json_encode(array('success'=>$flag,'stau'=>$status));
	 }
	 /**
	  * 根据结构id获取节点名称
	  * wanghongchen 20140805
	  */
	 public function getTreeNodeTitlesByStructureId(){
	 	$sid = $_POST['sid'];
	 	$params = json_encode(array('sid'=>$sid));
	 	$proxy=$this->exec('getProxy','escloud_businesseditws');
	 	echo $proxy->getTreeNodeTitlesByStructureId($params);
	 }
	 
	 /**
	  * 校验选择的数据是否可以上架
	  * @author longjunhao 20140826
	  */
	 public function validateOnShelfIsOk(){
	 	$path = $_POST['path'];
	 	$params = "path=".$path."&userId=".($this->getUser()->getId())."&remoteAddr=".$this->getClientIp();
	 	parse_str($params,$out);
	 	$postData=json_encode($out);
	 	$Proxy=$this->exec('getProxy','escloud_businesseditws');
	 	$result=$Proxy->validateOnShelfIsOk($postData);
	 	echo $result;
	 }
	 
	 /** xiaoxiong 20140917 根据盒ID集合获取其下的所有卷内数据 **/
	 public function getPathsByBoxIds(){
	 	$boxIds = $_POST['boxIds'];
	 	$nodePath = $_POST['nodePath'];
	 	$param = json_encode(array('boxIds'=>$boxIds, 'nodePath'=>$nodePath, 'userId'=>$this->getUser()->getId()));
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
	 	echo $proxy->getPathsByBoxIds($param);
	 }
	 
	 /**
	  * 获取字段下拉列表值
	  * wanghongchen 20140928
	  */
	 public function getTagProperty(){
	 	$structureId = $_POST['structureId'];
	 	$tagId = $_POST['tagId'];
	 	$modelId = $_POST['modelId'];
	 	$param = json_encode(array('tagId'=>$tagId,'structureId'=>$structureId,'modelId'=>$modelId));
	 	$proxy = $this->exec('getProxy','escloud_businesseditws');
	 	$result = $proxy->getTagProperty($param);
	 	$opt = "";
	 	if(count($result) > 0){
	 		foreach($result as $val){
	 			$opt = $opt.'<li>'.$val.'</li>'; //liqiubo 20140930 option改为li，修复bug 492
	 		}
	 	}
	 	echo $opt;
	 }
	 /**
	  * 自动组卷
	  */
	 public function generatingAutomatic(){
	 	$params = isset($_POST['params'])?$_POST['params']:null;
	 	$proxy=$this->exec('getProxy','escloud_businesseditws');
	 	$stage = $proxy->generatingAutomatic(json_encode($params));
	 	 echo $stage;
	 }
}