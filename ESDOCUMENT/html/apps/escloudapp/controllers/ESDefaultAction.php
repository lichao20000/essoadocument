<?php
/**
 * 默认处理首页
 * @author dengguoqi
 *
 */
class ESDefaultAction extends ESActionBase
{
	// 获取用户信息
	public function GetUserInfo()
	{
		$uid = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($uid);
		$info = array(
				'userId' => $userInfo->userid,
				'displayName' => $userInfo->displayName
		);
		return $info;
	}

	public function xmlurl()
	{
		// {dx: 卷,zx: 件}
		echo "<?xml version='1.0' encoding='UTF-8'?>
				<AreaData>
				<AreaItem AreaID='29' dx='657946' zx='106622' na='北京'/>
				<AreaItem AreaID='26' dx='192118' zx='153282' na='天津'/>
				<AreaItem AreaID='25' dx='584599' zx='496415' na='河北'/>
				<AreaItem AreaID='20' dx='55480' zx='210364' na='陕西'/>
				<AreaItem AreaID='30' dx='126158' zx='512768' na='辽宁'/>
				<AreaItem AreaID='32' dx='376609' zx='227708' na='吉林'/>
				<AreaItem AreaID='16' dx='131561' zx='' na='上海'/>
				<AreaItem AreaID='19' dx='100979' zx='139372' na='江苏'/>
				<AreaItem AreaID='11' dx='261476' zx='324043' na='浙江'/>
				<AreaItem AreaID='15' dx='60839' zx='153278' na='安徽'/>
				<AreaItem AreaID='7' dx='68398' zx='290834' na='福建'/>
				<AreaItem AreaID='10' dx='30440' zx='63491' na='江西'/>
				<AreaItem AreaID='22' dx='1023631' zx='812013' na='山东'/>
				<AreaItem AreaID='18' dx='256989' zx='169782' na='河南'/>
				<AreaItem AreaID='28' dx='447119' zx='260658' na='内蒙古'/>
				<AreaItem AreaID='33' dx='313904' zx='310251' na='黑龙江'/>
				<AreaItem AreaID='13' dx='74831' zx='271878' na='湖北'/>
				<AreaItem AreaID='9' dx='55520' zx='9764' na='湖南'/>
				<AreaItem AreaID='5' dx='183399' zx='801636' na='广东'/>
				<AreaItem AreaID='4' dx='27027' zx='99887' na='广西'/>
				<AreaItem AreaID='0' dx='52312' zx='' na='海南'/>
				<AreaItem AreaID='14' dx='107014' zx='90808' na='四川'/>
				<AreaItem AreaID='12' dx='56269' zx='63007' na='重庆'/>
				<AreaItem AreaID='3' dx='' zx='' na='台湾'/>
				<AreaItem AreaID='8' dx='19240' zx='74976' na='贵州'/>
				<AreaItem AreaID='6' dx='25803' zx='' na='云南'/>
				<AreaItem AreaID='17' dx='6169' zx='' na='西藏'/>
				<AreaItem AreaID='24' dx='447768' zx='19866' na='山西'/>
				<AreaItem AreaID='27' dx='18314' zx='178977' na='甘肃'/>
				<AreaItem AreaID='21' dx='7701' zx='25648' na='青海'/>
				<AreaItem AreaID='23' dx='29670' zx='28791' na='宁夏'/>
				<AreaItem AreaID='31' dx='54828' zx='55338' na='新疆'/>
				<AreaItem AreaID='2' dx='' zx='' na='香港'/>
				<AreaItem AreaID='1' dx='' zx='' na='澳门'/>
				<AreaItem AreaID='' dx='' zx='' na='钓鱼岛'/>
				</AreaData>";
	}
	public function html()
	{
		return $this->renderTemplate(Array('result'=>Array('a','b')));
	}

	// 20130724停用
	public function getMenu_disabled()
	{

		if(isset($_SESSION['getArchiveRightMenu'])){
			$menu = $_SESSION['getArchiveRightMenu'];
		}else{
				
			$result = array();
			$menu = array();
			$user = $this->GetUserInfo();
			$userId = $user['userId'];
			$proxy = $this->exec("getProxy", "escloud_menuservice");
			$result = $proxy->getArchiveRightMenu($userId);
			foreach ($result as $value)
			{
				$menu[] = array(
						'id'=>$value->id,
						'pId'=>$value->pId,
						'name'=>$value->name,
						'controller'=>$value->controller,
						'action'=>$value->action
				);
			}
				
			$menu = json_encode($menu);
				
			$_SESSION['getArchiveRightMenu'] = $menu;
		}

		echo $menu;

	}

	// 获取栏目 未用到2013/4/3
	public function getMenuList()
	{
		$start = $_GET['start'];
		$limit = $_GET['limit'];
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$result = $proxy->selectAllInfoPublish($start,$limit);	// start:1,limit:9
		foreach ($result as $value)
		{
			$menu[] = array('id'=>$value->id,'title' => $value->title);
		}
		echo json_encode($menu);
	}

	// 档案一个图片集
	public function imageOne()
	{
		$topicId = $_POST['topicId'];
		$boardId=$_POST['boardId'];

		$p = array(
				'accessType'=>'1',
				'userId'=>$this->getUser()->getId(),
				'forNew'=>true
		);


		$proxy = $this->exec("getProxy", "escloud_publishws");
		$result = $proxy->getPublishTopic($boardId, $topicId, json_encode($p));

		//print_r($result);exit;
		$img['info'] = $img['list']=$img['forNew'] = array();

		$img['info'] = array(
				'id'=>$result->topicId,
				'title'=>$result->title,
				'time'=>$result->createTime,
				'browse'=>$result->browseTimes,
				'author'=>$result->authorName,
				'text'=>$result->itemsText[0]->text
		);
		if(isset($result->forNew)){
			$forNew = $result->forNew;
			 if(isset($forNew->pre)){
			 	$img['forNew'][0]=array(
			 			'adr'=>$forNew->pre->address,
			 			'id'=>$forNew->pre->id,
			 			'title'=>$forNew->pre->title
			 			);
			 }
			 if(isset($forNew->next)){
			 	$img['forNew'][1]=array(
			 			'adr'=>$forNew->next->address,
			 			'id'=>$forNew->next->id,
			 			'title'=>$forNew->next->title
			 	);
			 }
		}
		if($result->totalFile){
			$count = 0;
			foreach ($result->itemsFile as $value)
			{
				if($value->realWidth < 870){
					if( $value->realHeight >625){
						$thumbHeight = 625;
						$thumbWidth = (625* $value->realWidth)/$value->realHeight;
					}else{
						$thumbHeight =$value->realHeight;
						$thumbWidth =$value->realWidth;
					}
				}else{
					$thumbHeight = (870 * $value->realHeight ) / $value->realWidth;
					$thumbWidth = 870;
					if($thumbHeight > 625){
						$thumbWidth = (625* $thumbWidth)/$thumbHeight;
						$thumbHeight = 625;
					}
				}
				$img['list'][] = array(
						'id' => $value->id,
						'addr' => $value->address,
						'name'=> $value->fileName,
						'width'=>$thumbWidth,
						'height'=>$thumbHeight,
						'text'=>$value->text,
						'count'=>$count
				);
				$count++;
			}
				
				
		}

		echo json_encode($img);
	}

	// 获取首页内容列表
	public function archive_list()
	{
		$boardId = $_POST['boardId'];
		$page = $_POST['page'];
		$limit = $_POST['limit'];
		$userId = $this->getUser()->getId();

		$params = array(
				'status'=> '1',
				'userId'=>$userId,
				'condition'=>array(),
				'accessType'=>'1'
		);

		$proxy = $this->exec("getProxy", "escloud_publishws");
		$lists = $proxy->getPublishTopicList($boardId, $page, $limit, json_encode($params));

		//print_r($lists); die;

		if(!$lists->total){
				
			echo '<li class="noborder"><u>无数据</u></li>';
			return -1;

		}

		$list = '';
		foreach ($lists->items as $line => $row){
				
			$p = $row->boardId.'&'.$row->topicId;
			if($line == 0){
				$list .= '<li class="noborder"><a href="javascript:void(0)" class="details" info="'. $p .'">'. $row->title .'</a></li>';
			}else{

				$list .= '<li><a href="javascript:void(0)" class="details" info="'. $p .'">'. $row->title .'</a></li>';

			}
				
		}

		echo $list;

	}

	// 我的待办
	public function task_list()
	{
		///*
		$page = isset($_POST['start']) ? $_POST['start'] : 0;
		$limit = isset($_POST['limit']) ? $_POST['limit'] : 4;
		$sort = 'id';
		$order = 'desc';
		$child = 'all';

		$info = $this->GetUserInfo();
		$param = array(
				'assignee'=>$info['userId'],
				'candidate'=>'null',
				'candidateGroup'=>'null',
				'bianyan_workflowDefKey'=>'fileResearchProcess',
				'nianbao_workflowDefKey'=>'fileYearReportProcess',
				'jianding_workflowDefKey'=>'AppraisalApplyProcess',
				'xiaohui_workflowDefKey'=>'DestoryApplyProcess',
				'workflowDefKey'=>'borrowApplyProcess',
				'publish_workflowDefKey'=> 'publishProcess',
				'nianjian_workflowDefKey' => 'fileInspectProcess'
		);

		$proxy = $this->exec('getProxy','escloud_workflowws');
		$lists = $proxy->listTasksArchive($page, $limit, $sort, $order, $child, json_encode($param));

		/*
			echo '<pre>';
		print_r($lists);
		echo '</pre>';
		die;
		//*/
		if( !count($lists) ){ // {''=>'',...,'size'=>23}
				
			echo '<li class="noborder"><u>无待办</u></li>';
			return;

		}

		$list = '';
		foreach ($lists as $line => $row)
		{
			// 判断是否有该属性
			$workId = @$row-> workflowid; // 判空
			$taskId = @$row-> task_id;;
			$todo = @$row-> todo;
			$display_name = @$row-> display_name;
			$date = @$row-> create_time;
			$title = @$row-> title;
			$type = @$row-> workflow_type;
			$formId = @$row-> formId;
			$extId = ',,';
			if($type == 'publish'){ // 信息发布
				$boardType = @$row->boardType;
				$boardId = @$row->boardId;
				$id = @$row->id;

				$extId = $boardId.','.$id.','.$boardType;

			}
			if(!$workId || !$title){
				continue;
			}
			$p = $type.'&'.$workId.'&'.$taskId.'&'.$todo.'&'.$extId.'&'.$formId;
				
			$class = !strlen($list) ? 'noborder' : ''; // 添加样式

			$list .="<li class='". $class ."'><a href='#' class='details' title='".$date."' info='". $p ."'>".$title."</a><span>".$display_name."</span></li>";

		}

		echo $list ? $list : '<li class="noborder"><u>无待办</u></li>';

	}



	// 根据档案类型和某一id获取详细信息@方吉祥 未用到2013/4/3
	public function selectSubDetails()
	{
		$boardId = $_GET['boardId'];
		$topicId = $_GET['id'];
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$userId = $this->getUser()->getId();
		$param=json_encode(array('accessType'=>'1','userId'=>$userId));
		$result = $proxy->selectSubDetails($boardId,$topicId,$param);
		echo json_encode($result);
		//print_r($res); die();

		/*if(property_exists($res,'essfileItem')){
			// 档案规范
			
		$title = $res->essfileItem->title;
		$ID = $res->essfileItem->id;
			
		$standard = array();
		$file = array();
		foreach($res->essfileItem->essFileitemsFiles as $keys => $mess)
		{
		$fileSize = $mess->fileSize ? $mess->fileSize : '暂无';
		$clicks = $mess->seeTimes ? $mess->seeTimes : '0';
		$properties = $mess->properties ? $mess->properties : '暂无';
		$downTimes = $mess->downTimes ? $mess->downTimes : '0';
		$updateTime = $mess->updateTime ? $mess->updateTime : '暂无';
		$author = $mess->author ? $mess->author : '暂无';
		$fileName = $mess->fileName ? $mess->fileName : '暂无';
		$address = $mess->address ? $mess->address : '暂无';
		$document = $mess->document ? $mess->document : '暂无';
		$id = $mess->id ? $mess->id : '';
		//print_r($res->essfileItem->essFileitemsFiles); die();
		$icon = substr($address, strripos($address, '.'));
		if($icon == '.doc' || $icon == '.doc'){
		$icon = 'doc';
		}else if($icon == '.doc' || $icon == '.docx'){
		$icon = 'doc';
		}else if($icon == '.xls' || $icon == '.xlsx'){
		$icon = 'xls';
		}else if($icon == '.ppt' || $icon == '.pptx'){
		$icon = 'ppt';
		}else if($icon == '.zip' || $icon == '.rar'){
		$icon = 'zip';
		}else if($icon == '.pdf'){
		$icon = 'pdf';
		}else if($icon == '.txt'){
		$icon = 'txt';
		}else{
		$icon = 'default';
		}

		$file[] = array(
		'name'=>$fileName,
		'size'=>$fileSize,
		'author'=>$author,
		'clicks'=>$clicks,
		'updateTime'=>$updateTime,
		'downTimes'=>$downTimes,
		'document'=>$document,
		'id'=>$id,
		'icon'=>$icon
		);
		}
			
		$standard = array(
		'title'=>$title,
		'id'=>$ID, // 该条信息id,并不是附件id
		'file'=>$file,
		'is'=>'standard'
		);
			
		echo json_encode($standard);
		}else{
		// 其它三种
		$title = property_exists($res->essTextItem,'infoTitle') ? $res->essTextItem->infoTitle : '暂无';
		$author = property_exists($res->essTextItem,'author') ? $res->essTextItem->author : '暂无';
		$date = property_exists($res->essTextItem,'createTime') ? $res->essTextItem->createTime : '暂无';
		$clicks = property_exists($res->essTextItem,'times') ? $res->essTextItem->times : '0';
		$summary = property_exists($res->essTextItem,'summary') ? $res->essTextItem->summary : '暂无';
		$text = property_exists($res->essTextItem,'text') ? $res->essTextItem->text : '暂无';
		$archive = array(
		'title'=>$title,
		'author'=>$author,
		'date'=>$date,
		'clicks'=>$clicks,
		'summary'=>$summary,
		'text'=>$text,
		'is'=>'archive'
		);
			
		echo json_encode($archive);
			
		}
		*/
	}


	/*
	 * @author wangtao
	* @brief 下载附件
	* @date 20130307
	*/
	public function Download()
	{
		$id = $_GET['id'];
		$addressMark = $_GET['addressMark'];
		//$bom = $_SERVER['HTTP_USER_AGENT'];
		//$fileName = strpos($bom, 'MSIE') ? urlencode($_GET['fileName']) : $_GET['fileName'];
		$proxy = $this->exec("getProxy", "escloud_fileoperationws");
		$module='publish';//业务标识
		$userId=$this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($userId);
		$company=$userInfo->deptCode;
		$clientIp='*';
		$param=json_encode(array('id'=>$id));
		header("Content-type: application/octet-stream; charset=UTF-8");
		header("Content-Disposition: attachment; filename=".$addressMark);
		echo $proxy->downloadFile($module,$company,$clientIp,$addressMark,$param);
	}
	/**上传测试
	 * @author wangtao
	*/
	public function printut()
	{

		echo json_encode($this->uploadImage(800,330));


	}
	/**
	 * 测试
	 */
	function ajaxTest()
	{
		print_r($_GET);
	}

	/*
	 * 根据档案类型和某一id获取详细信息
	* 修改方吉祥2013/4/3
	* 未用到2013/4/7
	*/
	public function GetPublishTopic()
	{
		$boardId = $_POST['boardId'];
		$topicId = $_POST['topicId'];

		$proxy = $this->exec("getProxy", "escloud_publishws");

		$p = array(
				'accessType'=>'1',
				'userId'=>$this->getUser()->getId()
		);

		$lists = $proxy->getPublishTopic($boardId, $topicId, $p);
		print_r($lists); die;
	}

	// 仅获得某一版块列表,生成htm字符串
	public function GetPublishTopicList()
	{
		//print_r($_POST); die;
		$boardId = $_POST['boardId']; // 1-5
		$limit = $_POST['limit'];
		$page = $_POST['page'];

		$userId = $this->getUser()->getId();

		$params = array(
				'status'=> '1',
				'userId'=>$userId,
				'condition'=>array(),
				'accessType'=>'1'
		);

		$proxy = $this->exec("getProxy", "escloud_publishws");
		$lists = $proxy->getPublishTopicList($boardId, $page, $limit, json_encode($params));

		//print_r($lists); die;

		$total = $lists->total; // 总信息数
		//echo $total; die;
		if(!$total){
				
			echo '<li class="noborder"><u>无数据</u></li>';
			return -1;

		}

		$list = '';
		foreach ($lists->items as $li => $row){
			$li++;
			$p = $row->boardId.'&'.$row->topicId;
			$list .= '<li><a href="javascript:void(0)" class="details" info="'. $p .'"><span>'. $li .'.</span><h2>'. $row->title .'</h2><p>'.$row->authorName .'</p><p class="dt">'. $row->createTime .'</p></a></li>';
				
		}

		echo $list;
	}

	//首页渲染图片
	public function index()
	{

// 		$params = array(
// 				'status'=> '1',
// 				'userId'=> $this->getUser()->getId(),
// 				'condition'=>array(),
// 				'accessType'=>'1'
// 		);
// 		$proxy = $this->exec("getProxy", "escloud_publishws");
// 		$lists = $proxy->getPublishTopicList(5, 1, 5, json_encode($params));

// 		$photo = $btn = '';

// 		if(!$lists->total){
				
// 			$list['btn'] = '';
// 			$list['photo'] = '<li class="block"><u>无数据</u></li>';
// 			return $this->renderTemplate($list);
				
// 		}

// 		foreach($lists->items as $how => $img)
// 		{
// 			$addr = $img->shownFile->address;
// 			$src = str_replace('_thumb', '', $addr);
// 			if($how == 0){
// 				$photo .= '<li class="block"><a id="'. $img->topicId .'" href="javascript:void(0)">';
// 				$photo .= '<span><img width=358 title="'. $img->title .'" id="'. $img->topicId .'" src="'. $src .'" /><div></div><h6>'. $img->title .'</h6></span>';
// 				$photo .= '</a></li>';
// 				$btn .= '<li><div id="'. $img->topicId .'" class="focus"><span><img width="68" src="'. $addr .'" /></span></div></li>';
// 			}else{

// 				$photo .= '<li><a id="'. $img->topicId .'" href="javascript:void(0)">';
// 				$photo .= '<span><img width=358 title="'. $img->title .'" id="'. $img->topicId .'" src="'. $src .'" /><div></div><h6>'. $img->title .'</h6></span>';
// 				$photo .= '</a></li>';
// 				$btn .= '<li><div id="'. $img->topicId .'" ><span><img width="68" id="'. $img->topicId .'" src="'. $addr .'" /></span></div></li>';
// 			}
				
// 		}

// 		$list['photo'] = $photo;
// 		$list['btn'] = $btn;

// 		return $this->renderTemplate($list);
		/** wanghongchen 20140930 获取用户头像地址**/
		$userId = $this->getUser()->getId();
		$param = json_encode(array('userId'=>$userId));
		$userproxy=$this->exec('getProxy','escloud_organduserws');
		//$iconUrl = $userproxy->getIconByUserId($param);
		$iconUrl = "";
		return $this->renderTemplate(array('iconUrl'=>$iconUrl));
	}

	// 渲染模板并生成htm
	public function list_paper()
	{

		$boardId = $_POST['boardId']; // 1-5
		$limit = $_POST['limit'];
		//$page = ($_POST['page']-1)*$limit+1;
		$page = $_POST['page'];

		$boardCn = array('档案新闻','档案故事','大事记','档案规范','图说档案'); // 不包括'我的待办'

		$userId = $this->getUser()->getId();

		$params = array(
				'status'=> '1',
				'userId'=>$userId,
				'condition'=>array(),
				'accessType'=>'1'
		);

		$proxy = $this->exec("getProxy", "escloud_publishws");
		$lists = $proxy->getPublishTopicList($boardId, $page, $limit, json_encode($params));

		//print_r($lists); die;

		$total = $lists->total; // 总条数
		$list = $btn = '';
		if(!$total){
				
			$list .= '<li class="noborder"><u>无数据</u></li>';

		}else{ // start else 0
				
			foreach ($lists->items as $li => $row){
				$li++;
				$p = $row->boardId.'&'.$row->topicId;
				$list .= '<li><a href="javascript:void(0)" class="details" info="'. $p .'"><span>'. $li .'.</span><h2>'. $row->title .'</h2><p>'.$row->authorName .'</p><i>'. $row->createTime .'</i></a></li>';

			}
				
			// 分页按钮处理
			$pagecount = ceil($total/$limit); // 总页数
			$btn .= "<li><a href='javascript:void(0)' id='1' class='pagenow'>1</a></li>";
			if($pagecount <= 10){ // '1,2,3,4,5,6,7,8,9' 按钮

				for($l=2; $l<=$pagecount; $l++){

					$btn .= "<li><a href='javascript:void(0)' id='". $l ."'>". $l ."</a></li>";
						
				}

			}else{ // 最多显示10个按钮 1,2,3,4,5,6,7,8...10

				for($l=2; $l<9; $l++){

					$btn .= "<li><a href='javascript:void(0)' id='". $l ."'>". $l ."</a></li>";
				}

				$btn .= "<li class='dotted'><span id='null'>...</span></li><li><a href='javascript:void(0)' id='". $pagecount ."'>". $pagecount ."</a></li>";
			}
				
				
		} // end else 0

		$info['boardCn'] = $boardCn[$boardId-1];
		$info['boardId'] = $boardId;
		$info['total'] = $total;

		$data['info'] = $info;
		$data['list'] = $list;
		$data['btn'] = $btn;
		return $this->renderTemplate($data);

	}

	// 渲染模板并生成详细htm
	public function detail_paper()
	{

		$boardId = $_POST['boardId'];
		$topicId = $_POST['topicId'];
		$boardCn = array('档案新闻','档案故事','大事记','档案规范','图说档案'); // 不包括'我的待办'
		$info['boardCn'] = $boardCn[$boardId-1];
		$info['boardId'] = $boardId;
		$info['topicId'] = $topicId;

		$proxy = $this->exec("getProxy", "escloud_publishws");
		$userId = $this->getUser()->getId();

		$p = array(
				'accessType'=>'1',
				'userId'=>$userId
		);

		$lists = $proxy->getPublishTopic($boardId, $topicId, json_encode($p));

		$data['info'] = $info;
		$data['data'] = $lists;

		return $this->renderTemplate($data);
	}

	/**
	 * 根据当前登录用户获得功能菜单
	 * fangjixiang 20130724
	 * @param userId
	 * @return
	 */
	public function getArchiveAuthMenu()
	{
		$result = array();
		$menu = array();
		$userId = $this->getUser()->getId();
		$bigOrgId = $this->getUser()->getBigOrgId();
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$result = $proxy->getArchiveAuthMenu($userId,$bigOrgId);

		if(isset($_SESSION['navMenu'.$bigOrgId]) && count($_SESSION['navMenu'.$bigOrgId]) > 0){
			$menu = $_SESSION['navMenu'.$bigOrgId];
		}else{
			foreach ($result as $value)
			{
				$menu[] = array(
						'id'=>$value->id,
						'pId'=>$value->pId,
						'name'=>$value->name,
						'controller'=>$value->controller,
						'action'=>$value->action
				);
			}
			if(count($menu) > 0){
				$menu = json_encode($menu);
				$_SESSION['navMenu'.$bigOrgId] = $menu;
			} else {
				$menu = "[]";
			}
		}

		echo $menu;
	}
	
	/**
	 * 获取用户的桌面的APPS的集合  
	 * liuhezeng 20140801
	 * longjunhao 20140811 edit
	 * **/
	public function getUserDeskAppsDetails(){
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$result = $proxy->getUserDeskAppsDetails($userId);
// 		if(isset($_SESSION['userDeskAppsMenu']) && count($_SESSION['userDeskAppsMenu']) > 0){
// 			$menu = $_SESSION['userDeskAppsMenu'];
// 		}else{
		if (count($result)>0) {
			foreach ($result as $value)
			{
				$menu[] = array(
						'id'=>$value->id,
						'name'=>$value->name,
						'icon'=>$value->controller.'_'.$value->action,
						'controller'=>$value->controller,
						'action'=>$value->action
				);
			}
			if(count($menu) > 0){
				$menu = json_encode($menu);
// 				$_SESSION['userDeskAppsMenu'] = $menu;
			} else {
				$menu = "[]";
			}
		} else {
				$menu = "[]";
		}
// 		}
		
		echo $menu;
	}
	
	/**
	 * 获取当前用户所有的功能菜单
	 * @author liuhezeng  20140801
	 * @param userId 当前用户账户id
	 * @return 返回功能全部菜单，并标识有权限的菜单
	 */
	public function getDeskMenuTree()
	{
	
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$map = $proxy->getDeskMenuTree($userId);
		$nodes = array(); 
		$nodes[0]=array("id"=>0,"name"=>"功能菜单","open"=>true,'checked'=>null);
		$rootNodeChecked = null;
		foreach ($map-> menuList as $node){
			if($rootNodeChecked == null && $node->checked){
				$rootNodeChecked = $node->checked;
			}
			$nodes[]= array(
					'id'=> $node->id,
					'pId'=> $node->pid,
					'name'=> $node->title,
					'checked'=> $node->checked,
			);
		}
		if($rootNodeChecked != null){
			$nodes[0]=array("id"=>0,"name"=>"功能菜单","open"=>true,'checked'=>$rootNodeChecked);
		}
		echo json_encode(array('nodes'=>$nodes));
	}
	
	public function saveUserDeskApps(){
		
		$checkedAppsId = $_POST['checkedAppsId'];
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$params = json_encode(array("userId" => $userId,"checkedAppsId" => $checkedAppsId));
		$result = $proxy->saveUserDeskApps($params);
		
	}
	
	/** wanghongchen 20140811 添加下载文件方法 **/
	public function fileDown()
	{
		$fileUrl = $_GET['fileUrl'];
		$filName=basename($fileUrl);
// 		$filName=urlencode($filName);
		Header("Content-type: application/octet-stream;");
		Header("Accept-Ranges: bytes");
		Header("Content-Disposition: attachment; filename=" .$filName);
		if($fileUrl){
			return readfile($fileUrl);
		}
	}
	
	/**
	 * 获取首页最新公告的前5条数据
	 * @author longjunhao 20140812
	 */
	public function getArchiveNewsLists(){
		$boardId = 1; // 1:档案新闻
		$limit = isset($_GET['limit'])?$_GET['limit']:5;
		$page = isset($_GET['page'])?$_GET['page']:1;
		
		$boardCn = array('档案新闻','档案故事','大事记','档案规范','图说档案');
		
		$userId = $this->getUser()->getId();
		
		$params = array(
				'status'=> '1',
				'userId'=>$userId,
				'condition'=>array(),
				'accessType'=>'1'
		);
		$proxy = $this->exec("getProxy", "escloud_publishws");
		$lists = $proxy->getPublishTopicList($boardId, $page, $limit, json_encode($params));
		//print_r($lists); die;
		$total = $lists->total; // 总条数
		$list = $btn = '';
		if(!$total){
			$list .= '<dl><dt><a href="#">无数据</a></dd></dl>';
		}else{
			foreach ($lists->items as $li => $row){
				$li++;
				$p = $row->boardId.'&'.$row->topicId;
				$len = strlen($row->title);
				if ($len > 14) {
					$showTitle = $this->cut_str($row->title, 14);
				} else {
					$showTitle = $row->title;
				}
				$list .= '<dl><dt><a href="#" title="'.$row->title.'" class="details_archiveNews" info="'. $p .'">·'.$showTitle.'</a></dt><dd>'.$row->createTime.'</dd></dl>';
			}
		}
		echo $list;
	}
	
	/**
	 * 截取中文
	 * @author longjunhao 20140814
	 */
	function cut_str($string, $sublen, $start = 0, $code = 'UTF-8') {
	    if($code == 'UTF-8') {
	        $pa = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|\xe0[\xa0-\xbf][\x80-\xbf]|[\xe1-\xef][\x80-\xbf][\x80-\xbf]|\xf0[\x90-\xbf][\x80-\xbf][\x80-\xbf]|[\xf1-\xf7][\x80-\xbf][\x80-\xbf][\x80-\xbf]/";
	        preg_match_all($pa, $string, $t_string);
	
	        if(count($t_string[0]) - $start > $sublen) return join('', array_slice($t_string[0], $start, $sublen))."...";
	        return join('', array_slice($t_string[0], $start, $sublen));
	    }
	    else {
	        $start = $start*2;
	        $sublen = $sublen*2;
	        $strlen = strlen($string);
	        $tmpstr = '';
	
	        for($i=0; $i< $strlen; $i++) {
	            if($i>=$start && $i< ($start+$sublen)) {
	                if(ord(substr($string, $i, 1))>129) {
	                    $tmpstr.= substr($string, $i, 2);
	                }
	                else {
	                    $tmpstr.= substr($string, $i, 1);
	                }
	            }
	            if(ord(substr($string, $i, 1))>129) $i++;
	        }
	        if(strlen($tmpstr)< $strlen ) $tmpstr.= "...";
	        return $tmpstr;
	    }
	}
	
}
