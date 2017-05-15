<?php
/**
 *
 * @author wangbo
 * @Date 20140324
 */
class ESConsoleServerAction extends ESActionBase
{
	    //默认访问的方法，渲染主页面
         public function index(){
		          return $this->renderTemplate();
	      }
	      //获取所有服务信息
          public function getConsoleServerList(){	
				$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
				$page = isset($_POST['page']) ? $_POST['page'] : 1;
				$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
				$appId = 	isset($_GET['appId']) ? $_GET['appId'] : 0;
				$consoleServerProxy = $this->exec("getProxy", 'escloud_consoleServerws');
				$dataCount['keyWord'] = $keyWord;
				$dataCount['appId'] = $appId;
				$canshuCount = json_encode($dataCount);
			    $total = $consoleServerProxy->getCountAll($canshuCount);
       		    $data['startNo']  = ($page-1)*$rp;
        		$data['limit'] = $rp;
       			$data['keyWord'] = $keyWord;
       			$data['appId'] = $appId;
       			//加入访问日志 shiyangtao add 20140830
       			$data['userId'] = $this->getUser()->getId();
       			//添加日志 需要ip
       			$data['ip']=$this->getClientIp();
       			$data['instanceId']=$this->getAppInstance()->getInstanceId();
       			$canshu = json_encode($data);
				$rows = $consoleServerProxy->getAllConsoleServer($canshu);
				$start=($page-1)*$rp;
				$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
				foreach ($rows as $row){
					$entry = array("id"=>$row->id,
						"cell"=>array(
								"startNum"=>$start+1,
								"ids"=>'<input type="checkbox"  class="checkbox"  name="consoleServerId" value="'.$row->id.'"id="consoleServerId">',
		                        "id"=>$row->id,
								"appId"=>$row->appId,
								"serviceid"=>$row->serviceid,
								"operate"=>"<span class='editbtn' >&nbsp;</span>",
								"serviceName"=>$row->servicename,
								"interface"=>$row->interfacename,
								"url"=>$row->url,
								"isEnabled"=>$row->enablestate,
								"token"=>$row->token,
								"reason"=>$row->reason,
						),
					);
					$jsonData['rows'][] = $entry;
					$start++;
			   }
				echo json_encode($jsonData);
		}
		public function getAppList(){
				$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
				$page = isset($_POST['page']) ? $_POST['page'] : 1;
				$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
				$consoleServerProxy = $this->exec("getProxy", 'escloud_consoleServerws');
			    $total = $consoleServerProxy->getAppCountAll($keyWord);
       		    $data['startNo']  = ($page-1)*$rp;
        		$data['limit'] = $rp;
       			$data['keyWord'] = $keyWord;
       			//加入访问参数 shiyangtao add 20140830
       			$data['userId'] = $this->getUser()->getId();
       			//添加日志 需要ip
       			$data['ip']=$this->getClientIp();
       			$data['instanceId']=$this->getAppInstance()->getInstanceId();
       			$canshu = json_encode($data);
				$rows = $consoleServerProxy->getAllApp($canshu);
				$start=($page-1)*$rp;
				$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
				foreach ($rows as $row){
				$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="appServerlist" value="'.$row->id.'"id="appServerlist">',
	                        "id"=>$row->id,
							"operate"=>"<span class='editbtn1'>&nbsp;</span>",
							"appName"=>$row->appName,
							"appToken"=>$row->appToken
					),
				);
				$jsonData['rows'][] = $entry;
				$start++;
			}
		 echo json_encode($jsonData);
		}
		public function getAppName(){
					$consoleServerProxy = $this->exec("getProxy", 'escloud_consoleServerws');
					$rows = $consoleServerProxy->getAllAppName();
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
		//渲染添加控制台服务的页面
		public function add_ConsoleServer(){
			$appId=$_GET['appId'];
		    return $this->renderTemplate(array('appId'=>$appId));
		}
		//添加控制台服务
		public function addConsoleServer(){
		     parse_str($_POST['data'],$out);
		     //获得用户id用来增加操作日志 shiyangtao 20140828
		     $out['userId']=$this->getUser()->getId();
		     $out['clientIp']=$this->getClientIp();
		     $out['instanceId']=$this->getAppInstance()->getInstanceId();
		     $data=json_encode($out);
		     $Proxy=$this->exec('getProxy','escloud_consoleServerws');
		    $result=$Proxy->addConsoleServer($data);
		    echo $result;
	    }
	    //添加应用
	    public function addApp(){
	    	parse_str($_POST['data'],$out);
	    	//获得用户id用来增加操作日志 shiyangtao 20140827
	    	$out['userId']=$this->getUser()->getId();
	    	$out['clientIp']=$this->getClientIp();
	    	$out['instanceId']=$this->getAppInstance()->getInstanceId();
	    	$data=json_encode($out);
	    	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
	    	$result=$Proxy->addApp($data);
	    	echo $result;
	    }
	    //编辑应用
	    public function edit_app(){
	    	$colValues=$_GET['data'];
	    	$data = explode('|',$colValues);
	    	return $this->renderTemplate(array('data'=>$data));
	    }
	    public function delApp(){
	    	 //为了加入操作日志 加入userId和ClientIp shiyangtao 20140828
	    	 $out['ids']=$_POST['data'];
	    	 $out['userId']=$this->getUser()->getId();
	    	 $out['clientIp']=$this->getClientIp();
	    	 $out['instanceId']=$this->getAppInstance()->getInstanceId();
	    	 $data=json_encode($out);
	         	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
	         	$result=$Proxy->delApp($out);
	         	echo $result;
	    }
      	public function edit_consoleServer(){
		      $colValues=$_POST['data'];
		      $data = explode('|',$colValues);
		     return $this->renderTemplate(array('data'=>$data));
	  }
	  
	  public function deleteConsoleServerList(){
	          //为了加入操作日志 加入userId和ClientIp shiyangtao 20140828
	    	$out['ids']=$_POST['data'];
	    	$out['userId']=$this->getUser()->getId();
	    	$out['clientIp']=$this->getClientIp();
	    	$out['instanceId']=$this->getAppInstance()->getInstanceId();
	    	$data=json_encode($out);
	         	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
	         	$result=$Proxy->deleteConsoleServerList($data);
	         	echo $result;
	  }
	  public function startConsoleServerList(){
			  	$data['ids']= $_POST['data'];
			  	$data['reason'] = isset($_POST['reason'])?$_POST['reason']:'';
			  	$data['userId'] = $this->getUser()->getId();
			  	$data['clientIp']=$this->getClientIp();
			  	$data['instanceId']=$this->getAppInstance()->getInstanceId();
			  	$out = json_encode($data);
			  	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
			  	$result=$Proxy->startConsoleServerList($out);
			  	echo $result;
	  }
	  public function stopConsoleServerList(){
			  	$data['ids']= $_POST['data'];
			  	$data['reason'] = $_POST['reason'];
			  	$data['userId'] = $this->getUser()->getId();
			  	$data['clientIp']=$this->getClientIp();
			  	$data['instanceId']=$this->getAppInstance()->getInstanceId();
			  	$out = json_encode($data);
			  	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
			  	$result=$Proxy->stopConsoleServerList($out);
			  	echo $result;
	  }
	  //验证新增serviceName是否已存在
	  public function ValidateServiceName(){
			  	$serviceName= $_POST['data'];
			  	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
			  	$result=$Proxy->ValidateServiceName($serviceName);
			  	echo $result;
	  }
	  //获取左侧的应用列表
	  public function getAppListTree(){
		  	$Proxy = $this->exec("getProxy", 'escloud_consoleServerws');
		  	$data['startNo']  = -1;
		  	$data['limit'] = -1;
		  	$data['keyWord'] = '';
		  	$canshu = json_encode($data);
		  	$appData = $Proxy->getAllApp($canshu);
		  	$jsonData1= array();
		  	$jsonData = array('name'=>'应用列表','open'=>true,'children'=>array());
		  	foreach ($appData as $row){
		  		$entry = array("name"=>$row->appNameCn,"appId"=>$row->id);
		  		$jsonData['children'][] = $entry;
		  	}
		  	$jsonData1[0]=$jsonData;
		  	echo json_encode($jsonData1);
	  }
}
?>