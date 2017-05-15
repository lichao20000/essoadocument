<?php 
/**
 * 默认处理首页
 * @author dengguoqi
 *
 */
class ESArchiveShowAction extends ESActionBase
{
	// 渲染模板并生成htm
	public function list_paper()
	{
	
		$boardId = $_GET['boardId']; // 1-5
		$limit = $_GET['limit'];
		//$page = ($_GET['page']-1)*$limit+1;
		$page = $_GET['page'];
	
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
	
	// 档案一个图片集
	public function imageOne()
	{
		$topicId = $_GET['topicId'];
		$boardId=$_GET['boardId'];
	
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
	// 渲染模板并生成详细htm
	public function detail_paper()
	{
		$boardId = $_GET['boardId'];
		$topicId = $_GET['topicId'];
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
	public function index(){
		$boardId = $_GET['boardId'];
		$topicId = $_GET['topicId'];
		$data['boardId'] = $boardId;
		$data['topicId'] = $topicId;
		return $this->renderTemplate($data);
	}
}
?>