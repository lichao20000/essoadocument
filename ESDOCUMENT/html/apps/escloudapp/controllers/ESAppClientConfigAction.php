<?php
class ESAppClientConfigAction extends ESActionBase {

	public function index()
	{
		return $this->renderTemplate();
	}

	public function detail()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$config = $appclient->getConfigById(json_encode($params));
		return $this->renderTemplate(array("config"=>$config));
	}
	
	public function setConfigValue()
	{
		$userId=$this->getUser()->getId();
		parse_str($_POST['param'],$param);
		$key=$param['key'];
		$value=$param['value'];
		$describtion=$param['describtion'];
		$params['key'] = $key;
		$params['value'] = $value;
		$params['describtion'] = $describtion;
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$success = $appclient->setConfigValue(json_encode($params));
		return $this->renderTemplate($success);
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
		$success = $appclient->deleteConfig($results);
		echo json_encode($success);
	}
	
	public function add()
	{
		$userId=$this->getUser()->getId();
		return $this->renderTemplate(array("userId"=>$userId));
	}
	
	public function edit()
	{
		$id=$_GET['data'];
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		$params['id'] = $id;
		$config = $appclient->getConfigById(json_encode($params));
		return $this->renderTemplate(array("config"=>$config));
	}
	
	public function do_edit()
	{
		$appclient = $this->exec("getProxy", 'escloud_appclientservice');
		parse_str($_POST['param'],$param);
		$userId=$this->getUser()->getId();
		$results = array(
				'id'=>$param['id'],
				'key'=>$param['key'],
				'value'=>$param['value'],
				'describtion'=>$param['describtion'],
				'operator'=>$userId,
				'ip'=>$this->getip(),
		);
		$results = json_encode($results);
		$success = $appclient->setConfigValue($results);
		echo json_encode($success);
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
	
	public function getConfigListInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$config = $this->exec("getProxy", 'escloud_appclientservice');
		$params['condition'] = '';
		$total = $config->getConfigCount(json_encode($params));
		$data['pageIndex']  = $page;
		$data['pageSize'] = $rp;
		$data['condition'] = $params['condition'];
		$pageInfo = json_encode($data);
		$start = ($page - 1) * $rp + 1;
		$rows = $config->getConfigList($pageInfo);
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"checkbox"=>'<input type="checkbox" class="checkbox" name="id">',
							"detailsbtn"=>"<span class='detailsbtn'>&nbsp;</span>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"key"=>$row->key,
							"value"=>$row->value,
							'describtion'=>$row->describtion,
					),
						
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}