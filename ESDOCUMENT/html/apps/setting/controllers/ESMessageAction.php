<?php
/**
 * 消息服务
 * @author wanghongchen
 * @date 20140421
 */
class ESMessageAction extends ESActionBase
{
	/**
	 * 获取树节点
	 */
	public function	showMessageNode()
	{
 		$id = isset($_POST['id']) ? $_POST['id'] : '-810';
 		$userId = $this->getUser()->getId();
		$map = json_encode(array("id"=> $id, "userId"=> $userId));
		$proxy = $this->exec('getProxy', 'message');
		$string = $proxy->showMessageNode($map);
		echo json_encode($string);
	}
	
	/**
	 * 获取右侧列表数据
	 */
	public function showMessageList()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$condition = json_encode($_POST['query']['condition']);
		$paramObj = json_decode($condition);
		$id = $paramObj->{"id"};
		$searchType = $paramObj->{"searchType"};
		$keyword = isset($_POST['query']['keyword'])?$_POST['query']['keyword']:"";
// 		echo $condition;
		$userId = $this->getUser()->getId();
		$proxy = $this->exec("getProxy", "message");
		$param = json_encode(array("keyword" => $keyword, "id" => $id, "searchType"=>$searchType, "userId" => $userId, "start" => ($page - 1) * $limit, "limit" => $limit));
		$lists = $proxy->showMessageList($param);
		$total = $lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $limit + 1; // 1-20, 21-40,41-60
		foreach ($lists->list as $list){
			$entry = array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" name="id" value='.$list->id.'>',
							'line'=> $line++,
							'sender'=> $list->sender,
							'recevier'=> $list->recevier,
// 							'content'=> $list->content,
							'content'=> $list->workFlowStatus=='Run' ? "<a id=\"allMessageLink".$line."\" onclick='messageInterval.messageHandler(\"allMessageLink".$line."\")' href=\"#\" handlerUrl=\"".$list->handlerUrl."\" handler=\"".$list->handler."\">".$list->content."</a>":$list->content,
							'sendtime'=> $list->sendTime
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 判断是否存在未处理的消息
	 */
	public function beforeDeleteGridData(){
		$ids = $_POST['ids'];
		$list = explode(",", $ids);
		$list=json_encode($list);
		$proxy=$this->exec('getProxy','message');
		$del = $proxy->beforeDeleteGridData( $list);
		echo $del;
	}
	
	/**
	 * 删除消息
	 */
	public function deleteGridData(){
		$ids = $_POST['ids'];
		$list = explode(",", $ids);
		$list=json_encode($list);
		$proxy=$this->exec('getProxy','message');
		$userId = $this->getUser()->getId();
		$del = $proxy->deleteGridData($userId, $list);
		echo $del;
	}
	
	/**
	 * 判断是否存在未处理的消息
	 */
	public function beforeClearNodeData(){
		$nodeId = $_POST['nodeId'];
		$searchType = $_POST['searchType'];
		$param = json_encode(array("nodeId"=> $nodeId, "searchType"=> $searchType));
		$proxy=$this->exec('getProxy','message');
		$del = $proxy->beforeClearNodeData( $param);
		echo $del;
	}
	
	/**
	 * 删除消息
	 */
	public function clearNodeData(){
		$nodeId = $_POST['nodeId'];
		$searchType = $_POST['searchType'];
		$userId = $this->getUser()->getId();
		$param = json_encode(array("nodeId"=> $nodeId, "searchType"=> $searchType, "userId" => $userId));
		$proxy=$this->exec('getProxy','message');
		$del = $proxy->clearNodeData($param);
		echo $del;
	}
	
	/** xiaoxiong 20140611 供JS轮询调用获取待办消息 **/
	public function getSoaMsg(){
		$currPage = $_POST['currPage'];//（页数1、2、3...）
		$limit = $_POST['limit'];
		$proxy = $this->exec("getProxy", "message");
		$param = json_encode(array("currPage" => $currPage, "limit"=>$limit, "userId" => $this->getUser()->getId(), "remoteAddr" => $_SERVER["REMOTE_ADDR"]));
		$lists = $proxy->getSoaMsg($param);
		$total = $lists->total;
		$jsonData = array('total'=>$total,'msgs'=>array());
		foreach ($lists->list as $list){
			$jsonData['msgs'][] = array(
				'id'=>$list->id,
				'sender'=> $list->sender,
				'recevier'=> $list->recevier,
				'content'=> $list->content,
				'sendtime'=> $list->sendTime
			);
		}
		echo json_encode($jsonData);
	}
	
	/** 渲染消息处理页面 **/
	public function handlerMsgPage(){
		$handler = $_POST['handler'];
		return $this->renderTemplate(array('handler'=>$handler));
	}
	
}