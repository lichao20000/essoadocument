<?php
/**
 * 消息服务
 * @author xuekun
 * @date 20140421
 */
class ESOrderAction extends ESActionBase {
	//订购主页 列出所有应用
	public function index(){
		return $this->renderTemplate();

	}
	public function reply(){
		$orderid=$_GET['orderid'];
		return $this->renderTemplate(array('orderid'=>$orderid));

	}
	/**
	 * 判断当前用户是否有权限访问某服务
	 * xuekun  added in  2014-7-16
	 */
	public function	 judgeAccessRight()

	{	//appid 格式为 applyappid_saasid,如果不支持saas saasid设置为-1
		$applyappid = isset($_GET['applyappid']) ? $_GET['applyappid'] : '-1';
		$saasid = $_GET['saasid'];
		$userId=$this->getUser()->getId();
		return $this->exec('getProxy', 'order')->judgeAccessRight($applyappid,$saasid,$userId);

	}
	/**
	 * 用户所有具有权限的系统列表
	 * xuekun  added in  2014-7-16
	 */
	public function getGrantApplist(){
		$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$userId=$this->getUser()->getId();
		$data['startno']  = ($page-1)*$rp;
		$data['limit'] = $rp;
		$data['keyword'] = $keyWord;
		$data['userid'] = $userId;
		$data['remoteAddr']=$this->getClientIp();
		$data['instanceId']=$this->getAppInstance()->getInstanceId();
		$proxy = $this->exec('getProxy', 'order');
		$applist = $proxy->getAppListWhitUserRight(json_encode($data));
		$count=$proxy->getAppListWhitUserRightCount($keyWord);
		$start = 1;
		$jsonData = array('page'=>$page,'total'=>$count,'rows'=>array());
		foreach ($applist as $row){
			$display=$row->accessright===1||$row->inorder===1?'disabled="disabled" checked="checked" ':'';
			$name=$row->accessright===1||$row->inorder===1?'grantServer':'appServerlist';
			$inorder='';
			if ($row->accessright===1){
				$inorder='';
			}else {
				if ($row->inorder===1){
					$inorder='已申请';
				}else{
					$inorder='未申请';
				}
			}
			$entry = array("id"=>$row->applyappid.'_'.$row->saasid,
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox" class="checkbox"  id="appServerlist" value="'.$row->applyappid.'_'.$row->saasid.'"name="'.$name.'" '.$display.'>',
							"applyappid"=>$row->applyappid,
							"saasid"=>$row->saasid,
							"appname"=>$row->appname,
							"appnamecn"=>$row->appnamecn,
							"bigorgname"=>$row->bigorgname,
							"accessright"=>$row->accessright,
							"inorder"=>$inorder
					),
			);
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 判断是否已经申请过
	 * xuekun  added in  2014-7-19
	 */
	public function judgeIfExistUnauditedOrder(){
		$userId=$this->getUser()->getId();
		return $this->exec('getProxy', 'order')->judgeIfExistUnauditedOrder($userId);
	}
	/**
	 * 权限申请 向管理员发送一条信息 请管理员审核 
	 * xuekun  added in  2014-7-16
	 * @return boolean
	 */
	public function applyAccessRight(){
		//将订购信息 写入系统数据库
		if (isset($_POST['ids'])){
			
			$user=$this->getUser();
			$ip =$this->getClientIp();
			$userId=$user->getId();
			$userInfo=$user->getInfo();
			$userName=$userInfo['userName'];
				
			
			$comment=$_POST['comment'];
			$ids=$_POST['ids'];
			$proxy = $this->exec('getProxy', 'order');
			
			$data['userId']=$userId;
			$data['remoteAddr']=$ip;
			$data['instanceId']=$this->getAppInstance()->getInstanceId();
			$data['orderDate']=time();
			$data['status']='0';
			$data['comment']=$comment;
			$data['userName']=$userName;
			
			$datas=explode(',', $ids);
			$saasidsique=array();
			foreach ($datas as $key=>$saasdata){
				$arr=explode('_', $saasdata);
				$saasidsique[]=$arr[1];
			}
			$saasids = array_unique($saasidsique);
			$msgProxy= $this->exec('getProxy', 'message');
			foreach ($saasids as $saasid){
				//存储订购信息 多条订单
				$orderid=$proxy->addOrder(json_encode($data));
				
				if ($orderid!==-1){
					$orderitems=array();
					foreach ($datas as $key=>$saasdata){
						$arr=explode('_', $saasdata);
						if ($arr[1]==$saasid){
							$orderitem=array(
									'userid'=>$userId,
									'orderid'=>$orderid,
									'applyappid'=>$arr[0],
									'saasid'=>$arr[1],
									'status'=>0,
									'createtime'=>time()
							);
						   $orderitems[]=$orderitem;
						}
					}
				
				}
				$proxy->bachAddOrderitems(json_encode($orderitems));
				
				//向管理员发送信息
				$superUser='admin';
				if ($saasid!=-1){
					$superUser=$proxy->getSuperUserName($saasid);
				}
				$url=$this->generateUrl(array('ESOrder'=>'handlerMsgPage'),'x');
				$handlerUrl='setting/'.$saasid.'/x/ESOrder/handlerMsgPage';
				$hander='$.messageOrder.showOrderReply('.$orderid.')';
				$msg=array(
						'sender'=>$userId,
						'recevier'=>$superUser,
						'content'=>$comment,
						'sendTime'=>date('Y-m-d H:i:s',time()),
						'workFlowStatus'=>'Run',
						'handlerUrl'=>$handlerUrl,
						'handler'=>$hander,
						'stepId'=>$orderid,
						'workFlowId'=>'-12'//其他消息
				);
				$msgProxy->addMessage(json_encode($msg));
				
			}
			echo  'true';
		}
		else {
			echo 'false';
		}

	}
	/**
	 * xuekun  added in  2014-7-21
	 */
	public  function  getOrderInfo(){
		if(isset($_GET['orderid'])){
			$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
			$page = isset($_POST['page']) ? $_POST['page'] : 1;
			$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
			$orderid=$_GET['orderid'];
			$data['startno']  = ($page-1)*$rp;
			$data['limit'] = $rp;
			$data['keyword'] = $keyWord;
			$data['orderid'] = $orderid;
			
			$data['userId'] = $this->getUser()->getId();
			$data['remoteAddr']=$this->getClientIp();
			$data['instanceId']=$this->getAppInstance()->getInstanceId();
			
			$proxy = $this->exec('getProxy', 'order');
			$result=$proxy->getOrderItems(json_encode($data));
			$count=$proxy->getOrderItemsCount($orderid,$keyWord);
			$start = 1;
			$jsonData = array('page'=>$page,'total'=>$count,'rows'=>array());
			foreach ($result as $row){
				$display=$row->status==="1"?'disabled="disabled" checked ':'';
				$name=$row->status==="1"?'grantServer':'appServerlist';
				$entry = array("id"=>$row->id,
						"cell"=>array(
								"startNum"=>$start,
								"ids"=>'<input type="checkbox" class="checkbox"  id="appServerlist" value="'.$row->id.'" name="'.$name.'" '.$display.'>',
								"userid"=>$row->userid,
								"applyappid"=>$row->applyappid,
								"saasid"=>$row->saasid,
								"appname"=>$row->appname,
								"appnamecn"=>$row->appnamecn,
								"bigorgname"=>$row->bigorgname,
								"status"=>$row->status
						),
				);
				$jsonData['rows'][] = $entry;
				$start++;
			}
			echo json_encode($jsonData);

		}

	}
	/**
	 *
	 * xuekun  added in  2014-7-21
	 */
	public function grantApp(){
		if (isset($_POST['ids'])){
			$ids=$_POST['ids'];
			$user=$this->getUser();
			$ip =$this->getClientIp();
			$userId=$user->getId();
			$userInfo=$user->getInfo();
			$userName=$userInfo['userName'];
			$data['userId']=$userId;
			$data['remoteAddr']=$ip;
			$data['instanceId']=$this->getAppInstance()->getInstanceId();
			$data['userName']=$userName;
			$data['ids']=$ids;
			
			$proxy = $this->exec('getProxy', 'order');
			$result1=$proxy->grantApplyAppsByOrderitems(json_encode($data));
			if($result1){
				$result2=$proxy->bachUpdateOrderitemStatus($ids);
				echo $result2;
			}else{
				echo 'false';
			}

		}else{
			echo 'false';
		}
	}
	/**
	 * 改变某订购信息的状态
	 */
	public function changeOrderStatus(){
		if (isset($_POST['orderid'])&&isset($_POST['status'])){
			$userId=$this->getUser()->getId();
			$orderid=$_POST['orderid'];
			$status=$_POST['status'];
			$proxy = $this->exec('getProxy', 'order');
			$result=$proxy->changeOrderStatus($orderid,$status);
			//关闭该条信息
			if ($result){
				$msgproxy = $this->exec('getProxy', 'message');
				$flag= $msgproxy->updateEssMessageWorkFlowStatus('-12','Over',$orderid,$userId);
				echo $flag;
			}else{
				echo 'false';
			}

		}else{
			echo 'false';
		}
	}
	/** 渲染消息处理页面 **/
	public function handlerMsgPage(){
		$handler = $_POST['handler'];
		return $this->renderTemplate(array('handler'=>$handler));
	}
	/**
	 * 获取saas服务
	 * xuekun  added in  2014-8-14
	 */
	public function getAppName(){
		$proxy = $this->exec("getProxy", 'order');
		$rows = $proxy->getAllAppName();
		$jsonData = array();
		foreach ($rows as $row){
			$entry =array(
					"id"=>$row->id,
					"appName"=>$row->appName,
					"appNameCn"=>$row->appNameCn,
					"appToken"=>$row->appToken
			);
			$jsonData[] = $entry;
		}
		echo json_encode($jsonData);
	}
	/**
	 * 生成编辑页面
	 */
	public function applySaas(){
		return $this->renderTemplate();
	}
	// 添加机构
	public function addApplySaas() {
		$formData = $_POST['formData'];
		$data = array();
		parse_str($formData,$data);
		$proxy = $this->exec ('getProxy', 'order');
		$result = $proxy->addApplySaas(json_encode($data));
		//申请成功 给管理员发信息请求获得申请
		$applyid=$result->applyid;
		if ($applyid!='0'){
			$msgProxy= $this->exec('getProxy', 'message');
			$url=$this->generateUrl(array('ESOrder'=>'handlerMsgPage'),'x');
			$handlerUrl=substr($url,strpos($url,'/')+1,strlen($url));
			$hander=$hander='$.messageOrder.showSassReply('.$applyid.',\'admin\')';//先为空
			$msg=array(
					'sender'=>'未登录用户',
					'recevier'=>'admin',
					'content'=>'机构申请',
					'sendTime'=>date('Y-m-d H:i:s',time()),
					'workFlowStatus'=>'Run',
					'handlerUrl'=>$handlerUrl,
					'handler'=>$hander,
					'stepId'=>$applyid,
					'workFlowId'=>'-12'//其他消息
			);
			$msgProxy->addMessage(json_encode($msg));
		}
		echo json_encode($result);
	}
	/**
	 * 消息处理页面
	 */
	public  function delSaasReply(){
		$proxy = $this->exec("getProxy", 'order');
		$appNameList = $proxy->getAllAppName();
		$applyid=$_GET['applyid'];
		$result=$proxy->getSaasApplyById($applyid);
		return $this->renderTemplate(array('applysaas'=>$result,'applist'=>json_decode(json_encode($appNameList), true)));
	}
	
	public function changeSaasStatus(){
		if (isset($_POST['applyid'])&&isset($_POST['applyid'])){
			$applyid=$_POST['applyid'];
			$status=$_POST['status'];
			$superUserName=$_POST['superUserName'];
			//关闭该条信息
			$msgproxy = $this->exec('getProxy', 'message');
			$flag= $msgproxy->updateEssMessageWorkFlowStatus('-12','Over',$applyid,'admin');
			//发邮件
		
			//添加日志 需要ip
			$data['status']=$status;
			$data['superUserName']=$superUserName;
			$data['userId'] = $this->getUser()->getId();
			$data['ip']=$this->getClientIp();
			$data['instanceId']=$this->getAppInstance()->getInstanceId();
			$msgproxy->senSaasEmail(json_encode($data));
			echo $flag;
		
		}else{
			echo 'false';
		}
	}
	
	/**
	 * wanghongchen 20141013 拒绝申请
	 */
	public function refuseApply(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", 'order');
		$param = json_encode(array('ids'=>$ids));
		$proxy->refuseApply($param);
	}
	public function  changeSaasid (){
		$saasid = $_POST['saasid'];
		global $user;	
		$user->bigOrgId=$saasid;
	}
}