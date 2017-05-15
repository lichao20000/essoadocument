<?php
/**
 * 消息服务
 * @author 
 * @date 
 */
class ESMyUserInfoAction extends ESActionBase{
	// 获取用户信息
	public function getMyUserInfo()
	{
		$uid = $this->getUser()->getId();
		$userInfo=$this->exec("getProxy", "user")->getUserInfo($uid);
// 		$info = array(
// 				'userId' => $userInfo->userid,
// 				'displayName' => $userInfo->displayName
// 		);
// 		echo json_encode($userInfo);

		$datas = array("data"=>array($userInfo->id,$userInfo->userid,$userInfo->lastName,$userInfo->firstName,$userInfo->userStatus,$userInfo->mobTel,$userInfo->emailAddress));
		
		return $this->renderTemplate($datas);
	}
	
}