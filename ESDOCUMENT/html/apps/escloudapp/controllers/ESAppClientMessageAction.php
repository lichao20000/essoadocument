<?php
class ESAppClientMessageAction extends ESActionBase {

	public function index()
	{
		return $this->renderTemplate();
	}

	function getip ()
	{
		if (getenv('http_client_ip')) {
			$ip = getenv('http_client_ip');
		} else if (getenv('http_x_forwarded_for')) {
			$ip = getenv('http_x_forwarded_for');
		} else if (getenv('remote_addr')) {
			$ip = getenv('remote_addr');
		} else {
			$ip = $_server['remote_addr'];
		}
		return $ip;
	}
	
	public function detail()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$message = $appclient->getAPPMessageById(json_encode($params));
		$type = $message->pushType;
		if ($type == 'SYSTEM') {
			$type = '系统消息';
		} else if ($type == 'SUBSCRIBE') {
			$type = '订阅消息';
		} else if ($type == 'ESSWORKFLOW') {
			$type = '工作流消息';
		} else if ($type == 'ANNOUNCEMENT') {
			$type = '活动公告';
		} else if ($type == 'DOWNLOAD') {
			$type = '下载消息';
		} else if ($type == 'RUSHRETURN') {
			$type = '催还消息';
		} else if ($type == 'ESSMESSAGE') {
			$type = '档案消息';
		}
		$message->pushType = $type;
		$messageHanderType = $message->messageHanderType;
		if ($messageHanderType == 'BROWSER') {
			$messageHanderType = '外部浏览器';
		} else if ($messageHanderType == 'APP') {
			$messageHanderType = '内部浏览器';
		} else if ($messageHanderType == 'NON') {
			$messageHanderType = '无';
		} else if ($messageHanderType == 'CUSTOM') {
			$messageHanderType = '自定义处理';
		}
		$receiver = $message->receiver;
		if ($receiver == '-1') {
			$receiver = '所有用户';
		} else {
			$receiver = $message->receiver;
		}
		$message->receiver = $receiver;
		$sender = $message->sender;
		if ($sender == '-1') {
			$sender = '系统';
		} else {
			$sender = $message->sender;
		}
		$message->sender = $sender;
		$message->messageHanderType = $messageHanderType;
		return $this->renderTemplate(array("message"=>$message));
	}
	
	public function do_delete()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$userId=$this->getUser()->getId();
	
		$results = array(
				'ids'=>$_GET['ids'],
				'operator'=>$userId,
				'ip'=>$this->getip(),
		);
		$results = json_encode($results);
		$success = $appclient->deleteMessages($results);
		echo json_encode($success);
	}
	
	public function send()
	{
		return $this->renderTemplate();
	}
	
	public function edit()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$message = $appclient->getAPPMessageById(json_encode($params));
		return $this->renderTemplate(array("message"=>$message));
	}
	
	public function do_edit()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		parse_str($_POST['param'],$param);
		$userId=$this->getUser()->getId();
		$param['operator'] = $userId;
		$param['ip'] = $this->getip();
		$messageHanderType=$param['messageHanderType'];
		if($messageHanderType == 1) {
			$messageHanderType = 'BROWSER';
		} else if ($messageHanderType == 0) {
			$messageHanderType = 'APP';
		} else if ($messageHanderType == 2) {
			$messageHanderType = 'CUSTOM';
		}
		$param['messageHanderType'] = $messageHanderType;
		$messagePushType=$param['messagePushType'];
		$param['pushType'] = $messagePushType == 0 ? 'ANNOUNCEMENT' : 'SYSTEM';
		$success = $appclient->updateAPPMessage(json_encode($param));
		echo json_encode($success);
	}
	
	public function sendMessage()
	{
		parse_str($_POST['param'],$param);
		$content=$param['message'];
		$messageHanderType=$param['messageHanderType'];
		$messagePushType=$param['messagePushType'];
		if($messageHanderType == 1) {
			$messageHanderType = 'BROWSER';
		} else if ($messageHanderType == 0) {
			$messageHanderType = 'APP';
		} else if ($messageHanderType == 2) {
			$messageHanderType = 'CUSTOM';
		}
		$data=$param['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$userId=$this->getUser()->getId();
		$params['pushType'] = $messagePushType == 0 ? 'ANNOUNCEMENT' : 'SYSTEM';
		$params['content'] = $content;
		$params['messageHanderType'] = $messageHanderType;
		$params['data'] = $data;
		$params['operator'] = $userId;
		$params['ip'] = $this->getip();
		$params['sender'] = $userId;
		$success = $appclient->sendMessageToAllUser(json_encode($params));
		return $this->renderTemplate($success);
	}

	public function getMessageListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$message = $this->exec("getProxy", 'escloud_appclientservice');
		$params['condition'] = "";
		$total = $message->getAPPMessageCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $message->getAPPMessageList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$type = $row->pushType;
			if ($type == 'SYSTEM') {
				$type = '系统消息';
			} else if ($type == 'SUBSCRIBE') {
				$type = '订阅消息';
			} else if ($type == 'ESSWORKFLOW') {
				$type = '工作流消息';
			} else if ($type == 'ANNOUNCEMENT') {
				$type = '活动公告';
			} else if ($type == 'DOWNLOAD') {
				$type = '下载消息';
			} else if ($type == 'RUSHRETURN') {
				$type = '催还消息';
			} else if ($type == 'ESSMESSAGE') {
				$type = '档案消息';
			}
			$messageHanderType = $row->messageHanderType;
			if ($messageHanderType == 'BROWSER') {
				$messageHanderType = '外部浏览器';
			} else if ($messageHanderType == 'APP') {
				$messageHanderType = '内部浏览器';
			} else if ($messageHanderType == 'NON') {
				$messageHanderType = '无';
			} else if ($messageHanderType == 'CUSTOM') {
				$messageHanderType = '自定义处理';
			}
			$sender = $row->sender;
			if ($sender == '-1') {
				$sender = '系统';
			} else {
				$sender = $row->sender;
			}
			$receiver = $row->receiver;
			if ($receiver == '-1') {
				$receiver = '所有用户';
			} else {
				$receiver = $row->receiver;
			}
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"checkbox"=>'<input type="checkbox" class="checkbox" name="id">',
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"type"=>$type,
							"sender"=>$sender,
							"receiver"=>$receiver,
							"content"=>$row->content,
							"data"=>$row->data,
							"messageHanderType"=>$messageHanderType,
							"time"=>gmdate("Y-m-d H:i:s", ($row->timeStamp / 1000) + 8*3600)
								
					),
						
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	public function publish()
	{
		return $this->renderTemplate();
	}
	
	public function getPublishTopicById()
	{
		$id = $_POST['id'];
		$publish=$this->exec('getProxy','escloud_appclientservice');
		$params['id'] = $id;
		$data=$publish->getPublishTopicById(json_encode($params));
		echo $data;
	}
	
	
	public function getPublishListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$type = $_GET['type'];
		$publish = $this->exec("getProxy", 'escloud_appclientservice');
		if ($type == '1') {
			$params['boardId'] = "1";
		} else if ($type == '2') {
			$params['boardId'] = "2";
		} else if ($type == '3') {
			$params['boardId'] = "3";
		} else if ($type == '4') {
			$params['boardId'] = "4";
		} else if ($type == '5') {
			$params['boardId'] = "5";
		} else {
			$params['boardId'] = "0";
		}
		$total = $publish->getPublishTopicCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['boardId'] = $params['boardId'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $publish->getPublishTopicList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox" name="id" value="'.$row->id.'" id="id">',
							"title"=>$row->title,
					),
	
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}