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
				'userId' => $userInfo->userinfo->userid,
				'displayName' => $userInfo->userinfo->displayName
		);
		return $info;
	}
	//首页渲染图片
	public function index()
	{

		$params = array(
			'status'=> '1',
			'userId'=> $this->getUser()->getId(),
			'condition'=>array(),
			'accessType'=>'1'
		);
		$user = $this->exec('getProxy','user')->getUserInfo($this->getUser()->getId());
		return $this->renderTemplate();
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
		$proxy = $this->exec("getProxy", "escloud_menuservice");
		$result = $proxy->getArchiveAuthMenu($userId);
		//print_r($result);die;

		if(isset($_SESSION['navMenu'])){
			
			$menu = $_SESSION['navMenu'];
			
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
				
			$menu = json_encode($menu);
				
			$_SESSION['navMenu'] = $menu;
		}
		
		echo $menu;
	}
}
