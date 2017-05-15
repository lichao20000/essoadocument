<?php
class ESAppClientResearchFormViewAction extends ESActionBase {

	public function index()
	{
		$fileId = $_REQUEST['fileId'];
		$client = $this->exec("getProxy", 'escloud_appclientservice');
		$content = $client->getResearchFormContent($fileId);
		return $this->renderTemplate(array("content"=>$content));
		//echo $content->content;
	}
	
	public function view()
	{
		$id = $_REQUEST['id'];
		$client = $this->exec("getProxy", 'escloud_appclientservice');
		$researchform = $client->getResearchFormById($id);
		return $this->renderTemplate(array("researchform"=>$researchform));
		//echo $content->content;
	}
	
	

}