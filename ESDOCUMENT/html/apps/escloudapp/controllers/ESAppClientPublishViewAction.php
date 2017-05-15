<?php
class ESAppClientPublishViewAction extends ESActionBase {

	public function index()
	{
		$topicId = $_REQUEST['topicId'];
		$param['topicId'] = $topicId;
		$client = $this->exec("getProxy", 'escloud_appclientservice');
		$content = $client->getPublishTopicDetail(json_encode($param));
		return $this->renderTemplate(array("content"=>$content));
		
	}

}