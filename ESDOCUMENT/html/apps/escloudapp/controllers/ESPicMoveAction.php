<?php
/**
 *
 * @author teemoLiu
 * @Date 20140812
 */
class ESPicMoveAction extends ESActionBase{
	/***
	 * 
	 * 统一使用 escloud_desktopappservice.proxy.ps 服务进行跳转
	 * 
	 * *****/
	public  function index(){
		
		$boardId = 5; // 5:图说档案
		$limit = isset($_GET['limit'])?$_GET['limit']:20;
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
			$list .= '<li class="noborder"><u>无数据</u></li>';
		}else{ // start else 0
			foreach ($lists->items as $li => $row){
				$li++;
				$p = $row->boardId.'&'.$row->topicId;
				$len = strlen($row->title);
				if ($len > 8) {
					$showTitle = $this->cut_str($row->title, 8);
				} else {
					$showTitle = $row->title;
				}
				$list .= '<li><a href="javascript:void(0)" class="details" info="'. $p .'" title = "'.$row->title.'"><div class="photo"><img src="'.$row->shownFile->address.'"/><div class="num">'.$row->fileCount.'</div></div><div class="title">'.$showTitle .'</div></a></li>';
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
				$btn .= "<li><span id='null' class='dotted'>...</span></li><li><a href='javascript:void(0)' id='". $pagecount ."'>". $pagecount ."</a></li>";
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
	
	/**
	 * 仅获得某一版块列表,生成htm字符串
	 * @author longjunhao 20140813
	 */
	public function GetPublishTopicList() {
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
			echo '<li class="noborder">无数据</li>';
			return -1;
		}
		$list = '';
		foreach ($lists->items as $li => $row){
			$li++;
			$p = $row->boardId.'&'.$row->topicId;
			$list .= '<li><a href="javascript:void(0)" class="details" info="'. $p .'"><div class="photo"><img src="_temp/002.jpg"/><div class="num">8</div></div><div class="title">'.$row->title .'</div></a></li>';
		}
		echo $list;
	}
	
	/**
	 * @author longjunhao 20140813
	 */
	public function detail_paper(){
		$boardId = $_GET['boardId'];
		$topicId = $_GET['topicId'];
		$data['boardId'] = $boardId;
		$data['topicId'] = $topicId;
		return $this->renderTemplate($data);
	}
	
	/**
	 * 档案一个图片集
	 * @author longjunhao 20140813
	 */
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
	
	/**
	 * 截取PHP字符串
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