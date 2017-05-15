<?php
class DefaultController extends AopController
{
	public function init()
	{
		if (!isLogin()){
			//       $url = url('user/eiplogin',true);
			$url = url('user/login',true);
			gotoUrl($url);
		}
	}

	public function indexAction()
	{
		AopCore::loadLibrary('app');
		$appInfo = AopApp::getInfo('system');
		$appInstance = AopApp::getInstance($appInfo);
		global $user;
		$orderProxy = $appInstance->getProxyInstance('order');
		//$url=$orderProxy->getDefaultAppName($user->id);
		$url = AopConfig::get('defaultapp') ;
		if(!isset($user->defaultpage)) {
			// TODO 个人设置未实现
// 			$user->defaultpage = $appInstance->invokePublic('setting', 'getDefaultPage' );
			$user->defaultpage='home';
		}
		$page = $user->defaultpage;

		if(!$page){
			$page = 'home';
		}

		if($page == 'home'){
// 			$url = 'default/home';
//guolanrui 20140718 暂时将登陆后的页面改成档案系统页面
			//$url = 'escloudapp';
		} else if ($page == 'desktop') {
			//$url = 'desktop';
		} else {
			if (!$depInfo = AopApp::getInfo('department')){
				return Aop404Exception::E_ERROR;
			}
			//$url = 'department/'.$page;
		}
		gotoUrl($url);
	}

	public function homeAction()
	{
		AopCore::loadLibrary('app');
		$systemInfo = AopApp::getInfo('system');
		$systemInstance = AopApp::getInstance($systemInfo);
		global $user;

		if(!isset($user->appcanvasstatus_home)) {
			$user->appcanvasstatus_home = $systemInstance->invokePublic('setting', 'getDefaultAppCanvasStatus' ,'home');
		}
		$data = array();

		$appInfo = AopApp::getInfo('system');
		$system = AopApp::getInstance($appInfo);
		$onlineProxy = $system->getProxyInstance('sso');
		$online = $onlineProxy->getOnlineUsers();
		if(!empty($online)){
			$online = json_decode($online);
		}
		if(isset($online->total)){
			if($online->total == 0){
				$data['online'] = 1;
			}else{
				$data['online'] = $online->total;
			}
		}else{
			$data['online'] = 1;
		}
		$content = '<script type="text/javascript">var menuitem = "menu_home";var appAreaStatus =  '.$user->appcanvasstatus_home.';</script>';
		$content .= $systemInstance->layout('', array('layoutKey'=>'eip_home_page', 'editable' => false));
		$content .= $this->getView()->render('footer.phtml',$data);
		return $content;

		// 现在从数据库配置获取
		// 默认首页
		$appInfo = AopApp::getInfo('system');
		$appInstance = AopApp::getInstance($appInfo);
		$layout = (array)AopConfig::get('frontpage.layout');
		$data = array();
		$data['layout'] = $layout;
		$data['systemInstance'] = $appInstance;

		global $user;

		if(!isset($user->appcanvasstatus_home)) {
			$user->appcanvasstatus_home = $appInstance->invokePublic('setting', 'getDefaultAppCanvasStatus' ,'home');
		}
		$data['appCanvasStatus'] = $user->appcanvasstatus_home;

		return $this->getView()->render('index.phtml', $data);
	}

	/**
	 * 新手入门
	 */
	public function introAction()
	{
	}

	/**
	 * 使用指南
	 */
	public function guideAction()
	{
		return $this->getView()->render('page_guide.phtml');
	}
}
