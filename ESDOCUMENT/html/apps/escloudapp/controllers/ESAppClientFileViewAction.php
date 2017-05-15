<?php
class ESAppClientFileViewAction extends ESActionBase {

	public function index()
	{
		$fileId = $_REQUEST['fileId'];
		return $this->renderTemplate(array("fileId"=>$fileId));
	}

}