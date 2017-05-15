<?php
class ESUserInfoAction extends ESActionBase{
	
	const SERVICE_NAME = "escloud_userinfoservice";

	public function index()
	{
		return $this->renderTemplate();
	}
	
	public function listInfo()
	{
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 10;
		$userinfos = $this->exec("getProxy", self::SERVICE_NAME);
		$total = $userinfos->getCountAll();
		$start = ($page - 1) * $rp + 1;
		$rows = $userinfos->getAllUserInfo();
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach ($rows as $row){
			$entry = array("id"=>$row->id,
					"cell"=>array(
							"rownum"=>$start,
							"id"=>"<input type='checkbox' name='id'>",
							"editbtn"=>"<span class='editbtn'>&nbsp;</span>",
							"name"=>$row->name,
							"age"=>$row->age,
							"email"=>$row->email,
							"address"=>$row->address,
							"department"=>$row->department
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	
	public function insert()
	{
		return $this->renderTemplate();
	}
	
	public function edit()
	{
		$id = $_GET['id'];
		$userinfos=$this->exec('getProxy',self::SERVICE_NAME);
		$userinfo = $userinfos->getUserInfo($id);
		return $this->renderTemplate(array("userinfo"=>$userinfo));
	}
	
	public function do_add() 
	{
		$userinfos=$this->exec('getProxy',self::SERVICE_NAME);
		parse_str($_POST['param'],$param);
			$results = array(
					'name'=>$param['name'],
					'age'=>$param['age'],
					'address'=>$param['address'],
					'email'=>$param['email'],
					'department'=>$param['department'],
			);
		$results = json_encode($results);
		$userinfo = $userinfos->addUserInfo($results);
		echo json_encode($userinfo);	
	}
	
	public function do_edit()
	{
		$userinfos=$this->exec('getProxy',self::SERVICE_NAME);
		parse_str($_POST['param'],$param);
		$results = array(
				'id'=>$param['id'],
				'name'=>$param['name'],
				'age'=>$param['age'],
				'address'=>$param['address'],
				'email'=>$param['email'],
				'department'=>$param['department'],
		);
		$results = json_encode($results);
		$userinfo = $userinfos->updateUserInfo($results);
		echo json_encode($userinfo);
	}
	
	public function do_delete() {
		$ids = isset($_GET['ids'])?$_GET['ids']:"";
		if ($ids=="")return;
		$ids = explode(",", $ids);
		$ids = json_encode($ids);
		$userinfos=$this->exec('getProxy',self::SERVICE_NAME);
		$userinfo = $userinfos->deleteUserInfo($ids);
		echo json_encode($userinfo);
	}
}