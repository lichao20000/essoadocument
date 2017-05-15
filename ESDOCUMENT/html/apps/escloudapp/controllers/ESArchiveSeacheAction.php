<?php
class ESArchiveSeacheAction extends ESActionBase
{
	public function index(){
		return $this->renderTemplate();
	}
	/**
	 * 检索方法  普通检索
	 * @author yzh
	 * @date   20131107
	 */
	public function admin()
	{
		$SESScommon=array();
		if(isset($_SESSION['shopcar'])){
			$SESScommon=$_SESSION['shopcar'];
		}
		$proxy = $this->exec('getProxy', 'escloud_searchws');
		$archiveTypes = $proxy->getArchiveTypes() ;
		return $this->renderTemplate(array('SESScommon'=>$SESScommon,'archiveTypes'=>$archiveTypes));
	}
	
	/**
	 * 检索方法  高级检索
	 * @author yzh
	 * @date   20131107
	 */
	public function intricate()
	{
		$SESSsenior=array();
		if(isset($_SESSION['shopcar'])){
			$SESSsenior=$_SESSION['shopcar'];
		}
		$proxy = $this->exec('getProxy', 'escloud_searchws');
		$archiveTypes = $proxy->getArchiveTypes() ;
		$RetentionPeriodLst = $proxy->getRetentionPeriodValMetadata();
		return $this->renderTemplate(array('SESSsenior'=>$SESSsenior,'archiveTypes'=>$archiveTypes,'RetentionPeriodLst'=>$RetentionPeriodLst));
	}
	
	/**
	 * 获取市级机构
	 * @author yzh
	 * @date   20131031
	 */ 
	public function getCityCompanyList()
	{

	 	$orgId = $_POST['id'];
		$proxy = $this->exec('getProxy', 'escloud_searchws');
		$list = $proxy->getCityCompanyList($orgId);
		echo json_encode($list);
	}
	
	/**
	 * 获取部门
	 * @author yzh
	 * @date   20131101
	 */
	 public function getDeptList(){
	 	$orgId=$_GET['orgId'];
	 	$archiveClass=$_GET['archiveClass'];
	 	$proxy = $this->exec('getProxy', 'escloud_searchws');
	 	$list = $proxy->getDeptList($orgId,$archiveClass);
	 	foreach ($list as $map)
		{
			$json[] = array(
					'pId'=> 0,
					'id'=> $map->orgId,
					'name'=> $map->orgName,
					//'level'=> $map->orgLevel,
					'archiveClass'=>$archiveClass,
					'isParent'=>true
			);
		}
		echo json_encode($json);
	 }
	 /**
	  * 获取二级及以后的树结构
	  * @author yzh
	  * @date   20131101
	  */
	  public function getErDeptList(){
	  	$orgId = $_POST['id'];
	 	$archiveClass=$_POST['archiveClass'];
	 	$proxy = $this->exec('getProxy', 'escloud_searchws');
	 	$list = $proxy->getDeptList($orgId,$archiveClass);
	 	if($list){
	 		foreach ($list as $map)
			{
				$json[] = array(
							'pId'=> $orgId,
							'id'=> $map->orgId,
							'name'=> $map->orgName,
							//'level'=> $map->orgLevel,
							'archiveClass'=>$archiveClass,
							'isParent'=>$orgId==$map->orgId?false:true
					);
			}
			echo json_encode($json);
	 	}
	  }
	  
	/**
	 * 根据文档类型获取著录项
	 * @author yzh
	 * 
	 */
	public function getArchiveClassFields()
	{
		$docClass = $_POST['docClass'];
		$proxy = $this->exec('getProxy', 'escloud_searchws');
		$list = $proxy->getArchiveClassFields($docClass);
		$li = '';
		foreach ($list as $map)
		{
			if(isset($map->propvalue)){ // 下拉控件
				
				$area = '<select name="metafield,'. $map->name .'">';
				foreach ($map->propvalue as $key=>$value){
					$area .= '<option value="'. $key .'">'. $value .'</option>';
				}
				$area .= '</select>';
				
			}else if($map->type === 'NUMBER'){ // 数字
				
				$area = '<input type="text" name="metafield,'. $map->name .'" validate="number" />';
				
			}else if($map->type === 'DATE'){ // 时间
				
				$area = '<input type="text" name="metafield,'. $map->name .'" validate="date" class="Wdate" />';
				
			}else{ // 文本
				
				$area = '<input type="text" name="metafield,'. $map->name .'" />';
				
			}
			if(strlen($map->title)>15){
				$li .= '<li><div class="longTitle">'. $map->title .'</div>'. $area .'</li>';
			}else{
				$li .= '<li><div class="shortTitle">'. $map->title .'</div>'. $area .'</li>';
			}
		}
		
		echo $li;
	}
	
	/**
	 * 检索方法  普通检索及高级检索
	 * @author yzh
	 * @date   20131107
	 */
	public function retrieveQuery()
	{
		$page = $_POST['page'];
		$limit = $_POST['limit'];
		$param = $_POST['data'];
		//组合当前登录用户信息
		$userId=$this->getUser()->getId();
		$param['userId'] = $userId;
		$param['ip'] = $this->getClientIp(); //wanghongchen 20140829 增加ip参数用于记录日志
		//archiveOrgs：[] 每个元素由归档省份简码、地市机构ID、部门ID组成（3个值以;分隔，无则以0代替）
		if(isset($param['OrgsOrgs'])){
			if($param['OrgsOrgs']!=''){
				$OrgsOrgs=explode(',',$param['OrgsOrgs']);
				$v=array();
				foreach($OrgsOrgs as $k){
					if($k!='0;0;0'){
						$v[]=$k;
					}
				}
				$param['archiveOrgs']=$v;
			}
			unset($param['OrgsOrgs']);
		}
		
		//searchFields 元数据{"key":"value"}
		$searchObject=new stdClass();
		if($param['archiveClass']!=''){
			if(isset($param['searchField'])){
				if($param['searchField']!=''){
					$searchFields=explode(',',$param['searchField']);
					$t=array();
					foreach($searchFields as $s){
						$r=explode('|',$s);
						if($r[1]!=''){
							$t[$r[0]]=$r[1];
						}
					}
					if(count($t)==0){
						$t=new stdClass();
					}
					$param['searchFields']=$t;
				}else{
					$param['searchFields']=$searchObject;
				}
				unset($param['searchField']);
			}
		}else{
			unset($param['searchField']);
			$param['archiveClass']='';
			$param['searchFields']=$searchObject;
		}
		if(isset($param['issenior'])){
			unset($param['issenior']);
			unset($param['searchFields']);
		}
		//var_dump($param);exit;
		$proxy = $this->exec('getProxy', 'escloud_searchws');
		$list = $proxy->search($page, $limit, json_encode($param));
		
		//var_dump($list);exit;
		$li = '';
		$keyWord = $param['searchWord'];
// 		$first = $_POST['first'];
		if(isset($list->error)){
			echo 'error: '.$list->error;
		}else{
			$totalResult=$list->resultTotal;
			if($totalResult==0){
				echo 'null';
			}else{
				$pageTotal=ceil($totalResult/$limit);
				$currentPage=$list->currentPage;
				$elapsedTime=$list->elapsedTime;
				foreach($list->displayList as $k=>$resultList){
					$delId='L'.$page.time().$k;
					$id=$resultList->sysItem->espath;
					$label=$resultList->textItem->label;
					$file_no=$resultList->sysItem->archivalCode;
					$carTit=$resultList->sysItem->title;
					$tagItem=$resultList->tagItem;
					$tagItem=(array)$tagItem;
					$tagItemHtml='';
					$ZWDocument = '';
					$FJDocument = '';
					$CLDDocument = '';
// 					foreach($tagItem as $v=>$item){
// 						if($v=='正文内容'){
// 							 $ZWDocument.='<abbr class="itemKey"><a href="javascript:show_fileDetail(\''.$item.'\')">'.$v.'</a>&nbsp;&nbsp;</abbr>';
// 						}else if($v=='附件内容'){
// 							 $FJDocument.='<abbr class="itemKey"><a href="javascript:show_fileDetail(\''.$item.'\')">'.$v.'</a>&nbsp;&nbsp;</abbr>';
// 						}else if($v=='处理单内容'){
// 							 $CLDDocument.='<abbr class="itemKey"><a href="javascript:show_fileDetail(\''.$item.'\')">'.$v.'</a>&nbsp;&nbsp;</abbr>';
// 						}else{
// 							 $tagItemHtml.='<abbr class="itemKey">'.$v.':&nbsp;'.'</abbr>'.$item.'&nbsp;&nbsp;&nbsp;';
// 						}
// 					}
					//liqiubo 20140730 修复bug276
					foreach($tagItem as $v=>$item){
						if($v=='正文内容'){
							 $ZWDocument.='<abbr class="itemKey"><span justdoit=\''.$item.'\' style="color:#08c;cursor: pointer;" onclick="javascript:show_fileDetail(this)">'.$v.'</span>&nbsp;&nbsp;</abbr>';
						}else if($v=='附件内容'){
							 $FJDocument.='<abbr class="itemKey"><span justdoit=\''.$item.'\' style="color:#08c;cursor: pointer;" onclick="javascript:show_fileDetail(this)">'.$v.'</span>&nbsp;&nbsp;</abbr>';
						}else if($v=='处理单内容'){
							 $CLDDocument.='<abbr class="itemKey"><span justdoit=\''.$item.'\' style="color:#08c;cursor: pointer;" onclick="javascript:show_fileDetail(this)">'.$v.'</span>&nbsp;&nbsp;</abbr>';
						}else{
							 $tagItemHtml.='<abbr class="itemKey">'.$v.':&nbsp;'.'</abbr>'.$item.'&nbsp;&nbsp;&nbsp;';
						}
					}
					if(!$ZWDocument==''){
						$tagItemHtml = $tagItemHtml.$ZWDocument;
					}
					if(!$FJDocument==''){
						$tagItemHtml = $tagItemHtml.$FJDocument;
					}
					if(!$CLDDocument==''){
						$tagItemHtml = $tagItemHtml.$CLDDocument;
					}
					$content=$tagItemHtml;
					$carTit= str_replace('_', '', $carTit);
					$li .='<li><div>';
					$li .= '<div class="tapOpen">';
					////$li .='<h3><a href="javascript:void(0);">'. $label .'</a></h3>';
					
					$li .='<h3>';
					/** xiaoxiong 20140805 添加是否存在电子文件标示 **/
					if($resultList->sysItem->documentflag == '1'){
						$viewRight='';
						if($resultList->sysItem->queryType == '2'){
							$viewRight=='false';
						}else{
							$viewRight=$resultList->sysItem->viewRight;
						}
						if($viewRight=='true'){
							//liqiubo 20141011 现在，有电子文件的，点击题名显示档案信息，点击图标显示电子文件信息，修复bug 1329
// 							$li .='<a class="haveViewRight" onclick="show_file(\''.$id.'\',\'true\');">'. $label .'<span class="hasfileviewright" title="原文浏览"></span></a>';
							$li .='<a class="haveViewRight" onclick="show_file(\''.$id.'\',\'false\');">'. $label .'</a><span class="hasfileviewright" title="原文浏览" style="margin-top: 5px;" onclick="show_file(\''.$id.'\',\'true\');"></span>';
						}elseif($viewRight=='false'){
							$li .='<a class="haveViewRight" onclick="show_file(\''.$id.'\',\'false\');">'. $label .'<span class="nofileviewright" title="无原文浏览权限"></span></a>';
// 							$li .='<a class="noViewRight" style="cursor:text;" href="javascript:void(0);">'. $label .'<span class="nofileviewright" title="无原文浏览权限"></span></a>';
						}
					} else {
						$li .='<a class="haveViewRight" onclick="show_file(\''.$id.'\',\'false\');">'. $label .'</a>';
					}
					if(@$param['queryType'] == 2){
						$li .= '<a style="font-size:16px;" href="javascript:void(0);">'. $label .'</a>';
					}
					$li .='</h3>';
					
					if(isset($resultList->textItem->snippet)){
						$tap=$resultList->textItem->snippet;
						$li .= '<div class="boxCovers" style="width:310px;height:auto;display:none;padding:5px 10px 5px 10px;">'.$tap.'</div>';
						////$li .= '<span><a href="javascript:void(0);" class="snippetOpen"><b>....</b></a></span>';
					}
					$li .= '</div>';
					$li .= '<p>'. $content .'</p>';
					$li .= '</div>';
					$li .= '<a href="javascript:void(0);" style="margin-top: 15px;" onclick="addToArchivesCar(this);" class="applyToArchivesCar" id="'.$id.'|'.$carTit.'|'.$file_no.'|'.$delId.'"><span>申请</span></a></li>';//liqiubo 20140929 给申请按钮加个样式，避免bug306提到的不在一条线上的问题
				}
				/** xiaoxiong 20141208 将页码的实现全部移交给PHP端，避免当匹配的数据总数很大时，页面组装过慢 **/
				$pageDivCount = ceil(($page)/10)*10 ;
				$pageDivCount = $pageDivCount<=ceil($totalResult/$limit)?$pageDivCount:ceil($totalResult/$limit) ;
				$startPageNo = ($pageDivCount-9)>0?($pageDivCount-9):1 ;
				if(@$param['queryType'] == 3) {
					$htm = '<ul class="filelist">'. $li .'</ul>';
					$htm .='<div id="filepages" class="pages"><div class="go"><a onclick="getFileListPage(this,-1,'.ceil($totalResult/$limit).');return false;" href="#">上一页</a></div><div class="page"><ul>';
					for($i=$startPageNo; $i<=$pageDivCount; $i++){
						if($i == $page){
							$htm .= '<li><a onclick="getFileListPage(this,'.$i.','.ceil($totalResult/$limit).');return false;" href="#" class="focus">'. $i .'</a></li>';
						}else{
							$htm .= '<li><a onclick="getFileListPage(this,'.$i.','.ceil($totalResult/$limit).');return false;" href="#">'. $i .'</a></li>';
						}
					}
					$htm .= '</ul><div class="clear"></div></div><div class="go"><a onclick="getFileListPage(this,-2,'.ceil($totalResult/$limit).');return false;" href="#">下一页</a></div><div class="msg">共'.ceil($totalResult/$limit).'页<span style="display:none;">'. $totalResult .'</span>　　去第&nbsp;</label><input class="page-num" id="searchChangePageObj" totalPage="'.ceil($totalResult/$limit).'" value="" name="page" type="text" style="text-align: center;color: #9D9D9D;width: 42px; border: 1px solid #DEDEDE;height: 17px; _height: 16px; position: relative;z-index: 1;"><span style="left: -42px;position: relative;_top:-1;"><a onclick="var page = $(this).closest(\'span\').prev(\'input\').val();jump(page,'.ceil($totalResult/$limit).',\'innerfile\',this);" style="background-color: #4A8BC2;color: white;float: none;width: 30px;height: 30px;display: inline;cursor:pointer;border:none;">&nbsp; 确定 &nbsp;</a>&nbsp;页</span></div>';		//liqiubo 20140916 加入border样式，修复bug 313				
				} else {
					$htm = '<ul class="list" id="result">'. $li .'</ul>';
					$htm .='<div class="pages"><div class="go"><a href="javascript:_page.go(-1);" id="prevGo">上一页</a></div><div class="page" id="rePage"><ul>';
					for($i=$startPageNo; $i<=$pageDivCount; $i++){
						if($i == $page){
							$htm .= '<li><a href="javascript:;" class="focus" id="page_'.$i.'">'. $i .'</a></li>';
						}else{
							$htm .= '<li><a href="javascript:;" id="page_'.$i.'">'. $i .'</a></li>';							
						}
					}
					$htm .= '</ul><div class="clear"></div></div><div class="go"><a href="javascript:_page.go(1);" id="nextGo">下一页</a></div><div class="msg">共'.ceil($totalResult/$limit).'页<span id="total" style="display:none;">'. $totalResult .'</span>　　去第&nbsp;</label><input class="page-num" id="searchChangePageObj" totalPage="'.ceil($totalResult/$limit).'" value="" name="page" type="text" style="text-align: center;color: #9D9D9D;width: 42px; border: 1px solid #DEDEDE;height: 17px; _height: 16px; position: relative;z-index: 1;"><span style="left: -43px;position: relative; _top: -1px;"><a onclick="var page = $(this).closest(\'span\').prev(\'input\').val();jump(page,'.ceil($totalResult/$limit).',\'file\',this);" style="background-color: #4A8BC2;color: white;float: none;width: 30px;height: 30px;display: inline;cursor:pointer;border:none;">&nbsp; 确定 &nbsp;</a>&nbsp;页</span></div>';		//liqiubo 20140916 加入border样式，修复bug 313			
				}
				//$htm .='<div'.$class.' class="pages"><div class="go"><a href="javascript:_page.go(-1);" id="prevGo">上一页</a></div><div class="page" id="rePage"><ul>';
				/*for($i=1; $i<$pageTotal+1; $i++){
					
					if($i == 1){
						
						$htm .= '<li><a href="javascript:;" class="focus" id="page_'.$i.'">'. $i .'</a></li>';
						
					}else{
					
						$htm .= '<li><a href="javascript:;" id="page_'.$i.'">'. $i .'</a></li>';
						
					}
				}
				$htm .= '</ul><div class="clear"></div></div><div class="go"><a href="javascript:_page.go(1);" id="nextGo">下一页</a></div><div class="msg">共'.ceil($totalResult/$limit).'页，共<span id="total">'. $totalResult .'</span>条</div>';*/
				if(@$param['queryType'] != 3) {
					$htm .= '<div class="s_param">';
					//$htm .= '<div class="s_name">搜索</div>';
					$htm .= '<div class="s_count">找到约 '.$totalResult.' 条结果 （用时<span>'.$elapsedTime.'</span>）</div>';
					//$htm .= '<div class="clear"></div>';
					$htm .= '</div>'; 
				}
				$htm .= '</div>';
				echo $htm;
			}
		}
	}
	/**
	 * 添加到档案车
	 * 
	 */
	public function addToArchivesCart(){
		//shimiao 20140807 
		if(isset($_POST["id"])){
			//ID
			$id = $_POST["id"];
			
			//标题
			$name = $_POST["title"];
			
			//档号
			$file_no = $_POST["file_no"];
			
			//标识ID
			$delId = $_POST["delId"];
			
			//登陆用户ID
			$user = $this->getUser()->getId();
			
			$addcar = array('id'=>$id,'file_no'=>$file_no,'name'=>$name,'delId'=>$delId);
			
			//如果SESSION['shopcar']存在,插入一条新数据
			if(isset($_SESSION['shopcar'])){
				$i = $this->check($_SESSION['shopcar'],$id);
				if($i == -1){
					array_push($_SESSION['shopcar'],$addcar);
				}
				echo count($_SESSION['shopcar']);
			} else {
				$_SESSION['shopcar'][] = $addcar;
				echo count($_SESSION['shopcar']);
			}
		}else{
			//shimiao 20140807 案卷-》卷内
			$count = 0;
			$data = explode("||",$_POST['data']);
			foreach($data as $row){
				$t = explode("??",$row );
				$id = $t[0];
				
				$name = $t[1];
				
				$file_no = $t[2];
				
				$delId = $_POST['delId'].$count;
				//登陆用户ID
				$user = $this->getUser()->getId();
				
				$addcar = array('id'=>$id,'file_no'=>$file_no,'name'=>$name,'delId'=>$delId);
				//如果SESSION['shopcar']存在,插入一条新数据
				if(isset($_SESSION['shopcar'])){
					$i = $this->check($_SESSION['shopcar'],$id);
					if($i == -1){
						array_push($_SESSION['shopcar'],$addcar);
					}
				} else {
					$_SESSION['shopcar'][] = $addcar;
				}
				$count++;
			}
			echo count($_SESSION['shopcar']);
		}
	}
	//档案车档案删除
	public function delFormArchivesCart(){
		$id = $_POST['id'];
		$shopcar = $_SESSION['shopcar'];
		if($shopcar != null){
			foreach($shopcar as $key=>$arrt){
				if($arrt['id'] == $id){
					unset($shopcar[$key]);
				}
			}
			$_SESSION['shopcar'] = $shopcar;
		}
		echo count($_SESSION['shopcar']);
	}
	//档案车档案清空
	public function clearFormArchivesCart(){
		unset($_SESSION['shopcar']);
		echo 0;
	}
	
	
	
	//搜索结果  暂时不用
	public function searchresults(){
		
		//高级检索
		if(empty($_REQUEST['condition'])){
			$condition = "";
		} else {
			$condition = isset($_POST['condition']) ? $_POST['condition'] : $_GET['condition'];
		}
		//用户ID
		$userId=$this->getUser()->getId();
		
		//接收表单提交的关键字
		if(empty($_REQUEST['key'])){
			$searchWord = "np046";
		} else {
			$searchWord = isset($_POST['key']) ? $_POST['key'] : $_GET['key'];
		}

		//接收判断分页
		if(isset($_GET['page'])){$start = ($_GET['page']-1);}else{$start = 0;}
		
		//接收档案类型
		$scope = isset($_REQUEST['scope']) ? $_REQUEST['scope'] : 'all';
		
		//每页显示条数
		$limit = 10;
		
		//实例化.PS对象
		$proxy = $this->exec('getProxy','escloud_searchws');
		
		//传参数返回数据
		$result = $proxy->getSearch($userId,urlencode($searchWord),$start,$limit,$scope,$condition);
		
		//将数据转成PHP数组
		$resultrow = json_decode(json_encode($result),true);
		
		//将数据中不需要的键名定义成数组，在页面中不显示.
		$preg = array('site','bundle_name','url','content','access_role','teaser','access_org','bundle','exp_date','entity_type','access_uid','id','label','entity_id','created','sort_label','ts_createdyear','ts_retentionperiod','ts_orgId','限制利用','组卷关联','c_bundle_name');
		
		//著录项
		$conclass = array('all'=>'所有结果','document'=>'文书档案','purchase'=>'采购档案','accounting'=>'会计档案','project'=>'工程档案','contract'=>'合同档案');
		
		//取出数据
		$result = $resultrow['data'];
		//print_r($result);exit;
		
		//查询用时
		$elapsedTime = $resultrow['elapsedTime'];
		
		//总数
		$numFound = $resultrow['numFound'];
		
		//分页
		$pager = new ESActionPager();
		$pager->setPageSize($limit);
		if(isset($_GET['page'])){ $pager->setCurrentPage($_GET['page']); }else{ $pager->setCurrentPage(1); }
		$pager->setRecorbTotal($numFound);
		if($searchWord == "np046"){$searchWord = "";}
		$pager->setBaseUri("?key=".urlencode($searchWord)."&condition=".urlencode($condition)."&scope=".$scope."&");
		$pageall = $pager->execute();
		
		return $this->renderTemplate(array('result'=>$result,'elapsedTime'=>$elapsedTime,'searchWord'=>$searchWord,'numFound'=>$numFound,'pageall'=>$pageall,'scope'=>$scope,'preg'=>$preg,'condition'=>$condition,'conclass'=>$conclass));
	}
	
	//添加到档案车   暂时不用
	public function addcart(){
		//ID
		$id = $_POST["id"];
		
		//标题
		$name = $_POST["title"];
		
		//档号
		$file_no = $_POST["file_no"];
		
		//登陆用户ID
		$user = $this->getUser()->getId();
		
		$addcar = array('id'=>$id,'file_no'=>$file_no,'name'=>$name);
		
		//如果SESSION['shopcar']存在,插入一条新数据
		if(isset($_SESSION['shopcar'])){
			$i = $this->check($_SESSION['shopcar'],$id);
			if($i == -1){
				array_push($_SESSION['shopcar'],$addcar);
				echo count($_SESSION['shopcar']);
			} else {
				//$_SESSION['shopcar'][$i]['num'] += $num;
			}
		} else {
			$_SESSION['shopcar'][] = $addcar;
			echo count($_SESSION['shopcar']);
		}
	}
	//档案存在判断----保留利用20131021
	private function check($key,$id){
		foreach ($key as $val){
			if($val['id']==$id){
				return 1;
			}
		}
		return -1;
	}
	//档案车档案删除  暂时不用
	public function delcart(){
		$id = $_POST['id'];
		$shopcar = $_SESSION['shopcar'];
		if($shopcar != null){
			$i = 0;
			foreach($shopcar as $key=>$arrt){
				if($arrt['id'] == $id){
					//array_splice($arrt,$id,1);
					unset($shopcar[$key]);
				}
			}
			$_SESSION['shopcar'] = $shopcar;
			//echo count($_SESSION['shopcar']);
			return $this->renderTemplate(array(),'ESArchiveSeache/addcart');
		}
	}
	
	//获取借阅列表内容
	public function session_list(){
		
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$rp = isset($rp) ? $rp : 20;
		$i=1;
		$start=($page-1)*$rp;
		$userId=$this->getUser()->getId();
		//获取数据
		if(!isset($_SESSION['shopcar'])){
			echo 1;exit();
		} else {
			$totalnum = 2;
			$total = count($_SESSION['shopcar']);
			if($total==0){
				$totalnum = 1;
			}
			$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array(),'totalnum'=>$totalnum);
			foreach($_SESSION['shopcar'] as $row){
				$entry = array(
						'id'=>$i,
						'cell'=>array(
								'num'=>$i,
								'ids'=>'<input type="checkbox" checked="checked" name="path" value="'.$row['id'].'">',
								'donum'=>empty($row['file_no']) ? '&nbsp;' : $row['file_no'],
								'label'=>empty($row['name']) ? '&nbsp;' : $row['name'],
								'class'=>'<input name="'.$row['id'].'" type="radio" value="电子借阅" checked="checked" />电子借阅<input name="'.$row['id'].'" type="radio" value="实体借阅" />实体借阅<input id="enti" name="'.$row['id'].'" type="radio" value="实体借出" />实体借出 ',
								'remark'=>'<input name="remark" type="text" size="30" value="" placeholder="实体借阅原因" />',
								'file_title'=>'借阅明细'
						),
				);
				$jsonData['rows'][] = $entry;
				$i++;
			}
			echo json_encode($jsonData);
		}
		
		/*if(!isset($_SESSION['shopcar'])){
			echo 1;exit();
		} else {
			$totan = count($_SESSION['shopcar']);
		}
		if($totan != 0){
			foreach($_SESSION['shopcar'] as $key=>$val){
				$list[] = $val['id'];
			}
			$proxy = $this->exec('getProxy','escloud_searchws');
			$result = $proxy->getList(json_encode($list));
			$resrow = json_decode(json_encode($result),true);
			$total = count($resrow);
			if($totan == 0 && $total == 0){
				echo 4;exit();
			} else {
				$totalnum = 2;
				if($total == 0 || $totan > $total){
					$totalnum = 1;
				}
				$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array(),'totalnum'=>$totalnum);
				foreach($resrow as $row){
					$entry = array(
							'id'=>$i,
							'cell'=>array(
									'num'=>$i,
									'ids'=>'<input type="checkbox" checked="checked" name="path" value="'.$row['path'].'">',
									'donum'=>empty($row['ArchivalCode']) ? '&nbsp;' : $row['ArchivalCode'],
									'label'=>empty($row['Title']) ? '&nbsp;' : $row['Title'],
									'class'=>'<input name="'.$row['path'].'" type="radio" value="电子借阅" checked="checked" />电子借阅<input name="'.$row['path'].'" type="radio" value="实体借阅" />实体借阅<input id="enti" name="'.$row['path'].'" type="radio" value="实体借出" />实体借出 ',
									'remark'=>'<input name="remark" type="text" size="30" value="" placeholder="实体借阅原因" />',
									'file_title'=>'借阅明细'
							),
					);
					$jsonData['rows'][] = $entry;
					$i++;
				}
				echo json_encode($jsonData);
			}
		}*/
	}
	
	/**借阅批单提交数据
	 * 20130731     增加 leaderId
	 */
	public function submitborrowbykey(){
		$businessKey = 'borrow_'.time();
		$userId = $this->getUser()->getId();
		
		//接收数据
		$data = $_POST['data'];
		$approveUserId = $_POST['approveUserId'];//20130731增加
		//转成数组
		parse_str($data,$output);
		$output['title'] = '借阅申请单'; 
		$output['archiveType'] = 'document';//20130905  yzh 增加
		////20131107  yzh 增加
		$output['manager_registerid'] = $userId; 
		//接收LIST循环分割成二维数组
		$path = $_POST['path'];
		$kname = array('file_no', 'file_tm', 'borrow_type', 'mark' ,'file_title','path');
		for($i=0;$i<count($path);$i++){
			$temp[$i] = explode('|',$path[$i]);
			$list[$i] = array_combine($kname, $temp[$i]);
		}
		$vars = array(
			'borrow_base'=>array( $output ),
			'borrow_detail'=>$list,
			'pageSearchLeaderId'=>$approveUserId   //20130731增加//20130905更改找领导的KEY
		);
		$vars = json_encode($vars);
		$proxy = $this->exec('getProxy','escloud_workflowws');
		$result = $proxy->startProcess($businessKey,$userId,$vars);
		if($result){
			unset($_SESSION['shopcar']);
		}
		echo $result;
	}
	//实体借出   
	public function getState(){
		$arcid = array('path'=>$_POST['arcid']);
		$proxy = $this->exec('getProxy','escloud_workflowws');
		$result = $proxy->getPath(json_encode($arcid));
		echo $result;
	}
	//select改变方法    暂时不用
	public function changecontent(){
		$userId=$this->getUser()->getId();
		//select的传进来的值
		$ectval = isset($_POST['ectval']) ? $_POST['ectval'] : 'all';
		$proxy = $this->exec('getProxy','escloud_searchws');
		$result = $proxy->getArchiveClassFields($ectval);
		$row = json_decode(json_encode($result),true);
		//循环HTML返回
		$htmlcont = "";
		foreach($row as $key=>$val){
			if($val['type'] == 'TEXT' && !array_key_exists('propvalue', $val)){
				$htmlcont .= '<div><span class="onchli">'.$val['title'].'</span><span><input type="text" name="'.$val['name'].'" value="" /></span></div>';
			}
			if($val['type'] == 'NUMBER'){
				$htmlcont .= '<div><span class="onchli">'.$val['title'].'</span><span><input type="text" id="number" name="'.$val['name'].'" value="" /></span></div>';
			}
			if($val['type'] == 'DATE'){
				$htmlcont .= "<div><span class='onchli'>".$val['title']."</span><span><input type='text' id='edit_birthday' name='".$val['name']."' value='' onfocus='WdatePicker({dateFmt:\"yyyy-MM-dd\"});'></span></div>";
			}
			if($val['type']  == 'TEXT' && array_key_exists('propvalue', $val)) {
				$htmlcont .= '<div><span class="onchli">'.$val['title'].'</span><span><select name="'.$val['name'].'">';
				$htmlcont .= '<option value=""></option>';
				foreach($val['propvalue'] as $k=>$v){
					$htmlcont .= '<option value="'.$k.'">'.$v.'</option>';
				}
				$htmlcont .= '</select></span></div>';
			}
		}
		echo $htmlcont;
	}
	
	//高级检索结果    暂时不用
	public function adsearchall(){
		
		if(empty($_REQUEST['key'])){
			$searchWord = "np046";
		} else {
			$searchWord = isset($_POST['key']) ? $_POST['key'] : $_GET['key'];
		}
		
		//档案门类下的input-----
		$inputval = explode(',',$_POST['inputval']);
		
		//*------name做为键名 val做为键值
		foreach($inputval as $key=>$val){
			$classa[] = explode('|',$val);
		}
		if(count($classa) == 1){
			$lists['ectval'] = $_POST['ectval'];
		} else {
			foreach($classa as $k=>$v){
				$lists[$v[0]] = $v['1'];
			}
		}

		//select的值
		$lists['ectval'] = $_POST['ectval'];
		
		//年份
		$vrana = $_POST['vrana'];
		
		//开始年份
		$ystart = $_POST['ystart'];
		
		//结束年份
		$yrend = $_POST['yrend'];
		
		//多选年份
		$ckren = $_POST['ckren'] != "undefined" ? $_POST['ckren'] : "";
		
		//所属单位
		$company = $_POST['company'] != "undefined" ? $_POST['company'] : "";
		
		//保管期限
		$timelimit = $_POST['timelimit'] != "undefined" ? $_POST['timelimit'] : "";
		
		$list = array(
				'class'=>$lists,
				'year'=>array(
						'vrana'=>$vrana,
						'ystart'=>$ystart,
						'yrend'=>$yrend,
						'ckren'=>$ckren
				),
				'belong'=>array(
						'company'=>$company
				),
				'time'=>array(
						'timelimit'=>$timelimit
				)
		);
		$list = json_encode($list);
		return $this->renderTemplate(array('condition'=>$list,'searchWord'=>$searchWord),'ESArchiveSeache/location');
	}

	//高级检索     暂时不用
	public function advancesearch(){
		$searchWord = isset($_GET['key']) ? $_GET['key'] : '';
		$res = $this->exec("getProxy", "escloud_consumerservice")->getCompanyList();
		$res = json_decode(json_encode($res),true);
		$list = "";
		$i = 0;
		foreach($res as $key=>$val){
			$i++;
			$list .= '<table cellspacing="0" cellpadding="0"><tr><td valign="top" width="10"><input type="checkbox" value="'.$val['mainSite'].'" /></td><td valign="top" style="padding-left:5px;">'.$val['orgNameDisplay'].'</td></tr></table>';
			if($i == '6'){
				$list .= '<div id="morespan" style="width: 100%; display:none ;">';
			}
		}
		$list .= '</div>';
		return $this->renderTemplate(array('advan'=>$list,'searchWord'=>$searchWord));
	}
	//数据浏览
	public function databrowse(){
		return $this->renderTemplate();
		
	}
	//借阅
	public function approve(){
		return $this->renderTemplate();
	}
	
	//暂时不用
	public function set_json()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$sortname = isset($_POST['sortname']) ? $_POST['sortname'] : 'c3';
		$sortorder = isset($_POST['sortorder']) ? $_POST['sortorder'] : 'desc';
		$query = isset($_POST['query']) ? $_POST['query'] : false;
		$qtype = isset($_POST['qtype']) ? $_POST['qtype'] : false;
		include dirname(__FILE__).'/countryArray.inc.php';
		if($qtype && $query){
			$query = strtolower(trim($query));
			foreach($rows AS $key => $row){
				if(strpos(strtolower($row[$qtype]),$query) === false){
					unset($rows[$key]);
				}
			}
		}
		//Make PHP handle the sorting
		$sortArray = array();
		foreach($rows AS $key => $row){
			$sortArray[$key] = $row[$sortname];
		}
		$sortMethod = SORT_ASC;
		if($sortorder == 'desc'){
			$sortMethod = SORT_DESC;
		}
		array_multisort($sortArray, $sortMethod, $rows);
		$total = count($rows);
		$rows = array_slice($rows,($page-1)*$rp,$rp);
	
		//header("Content-type: application/json");
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		$i=1;
	
		foreach($rows AS $row){
			//If cell's elements have named keys, they must match column names
			//Only cell's with named keys and matching columns are order independent.
			$entry = array('id'=>$row['c3'],
					'cell'=>array(
							'num'=>$i,
							'id'=>'<input type="checkbox" name="id">',
							'operate'=>"<a href='javascript:void(0);'><img src='/apps/escloudapp/templates/ESCompilation/img/operate.gif' /></a>",
							'c3'=>$row['c3'],
							'c4'=>$row['c4'],
							'c5'=>$row['c5'],
							'c6'=>$row['c6'],
							'c7'=>$row['c7'],
							'c8'=>$row['c8'],
					),
			);
			$jsonData['rows'][] = $entry;
			$i++;
		}
		echo json_encode($jsonData);
	}
	
	/***
	 * xiaoxiong 20140805
	 * 组装数据展现form字符串
	 */
	public function showPkg(){
		$selectPath = isset($_POST['path'])?$_POST['path']:'';
		$data['selectPath'] = $selectPath;
		$data['userId'] = $this->getUser()->getId();
		$postData = json_encode($data);
		$proxy = $this->exec("getProxy", "escloud_formstart");
		$return = $proxy->myFormModelShowPkg($postData);
		$datas = array("data"=>array($return->formHtml,$return->structureType,0,$return->childColModel,$return->haveChildFlag,$selectPath));
		return $this->renderTemplate($datas);
	}
	public function showSubmitData(){
		$path = $_POST['id'];
		$title = $_POST['title'];
		$proxy = $this->exec('getProxy','escloud_searchws');
		$map = array();
		$map['path'] = $path;
		$map['title'] = $title;
		$map['userId'] = $this->getUser()->getId();
		$res =  $proxy->showSubmitData(json_encode($map));
		echo json_encode($res);
	}
	
}