<?php
/**
 *
 * @author caojian
 * @Date 20140324
 */
class ESAppSettingAction extends ESActionBase
{
	    //默认访问的方法，渲染主页面
         public function index(){
		          return $this->renderTemplate();
	      }
	      
		public function getAppList(){
				$keyWord = 	isset($_POST['query']) ? $_POST['query'] : '';
				$page = isset($_POST['page']) ? $_POST['page'] : 1;
				$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
				$userId = $this->getUser()->getId();
				$consoleServerProxy = $this->exec("getProxy", 'escloud_consoleServerws');
				$data['startNo']  = ($page-1)*$rp;
        		$data['limit'] = $rp;
       			$data['keyWord'] = $keyWord;
       			$data['userId'] = $userId;
       			//添加日志 需要ip
       			$data['ip']=$this->getClientIp();
       			$data['instanceId']=$this->getAppInstance()->getInstanceId();
       			$canshu = json_encode($data);
				$total = $consoleServerProxy->getAppCountAll($canshu);
				$rows = $consoleServerProxy->getAllApp($canshu);
				$start=($page-1)*$rp;
				$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
				foreach ($rows as $row){
				$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start+1,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="appServerlist" value="'.$row->id.'"id="appServerlist">',
	                        "id"=>$row->id,
							"operate"=>"<span class='editbtn'>&nbsp;</span>",
							"appName"=>$row->appName,
							"appNameCn"=>$row->appNameCn,
							"appToken"=>$row->appToken,
							"saasSupport"=>$row->saasSupport,
							"remark"=>$row->remark
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
										"appToken"=>$row->appToken
								);
						$jsonData[] = $entry;
					}
					echo json_encode($jsonData);
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
	    	$colValues=$_POST['data'];
	    	$data = explode('|',$colValues);
	    	return $this->renderTemplate(array('data'=>$data));
	    }
	    //删除应用
	    public function delApp(){
	    	//为了加入操作日志 加入userId和ClientIp shiyangtao 20140828
	    	$out['ids']=$_POST['data'];
	    	$out['userId']=$this->getUser()->getId();
	    	$out['clientIp']=$this->getClientIp();
	    	$out['instanceId']=$this->getAppInstance()->getInstanceId();
	    	$data=json_encode($out);
	        $Proxy=$this->exec('getProxy','escloud_consoleServerws');
	        $result=$Proxy->delApp($data);
	         echo $result;
	    }
	    //获取不能删除的应用
	    public function getNoDelApps(){
	    	$ids=$_POST['ids'];
	    	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
	    	$result=$Proxy->getNoDelApps($ids);
	    	echo $result;
	    }
	    public function judgeAppName(){
	    	$id=isset($_POST['id'])?$_POST['id']:'-1';
	    	$appName=isset($_POST['appName'])?$_POST['appName']:'';
	    	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
	    	$result=$Proxy->judgeAppName($appName,$id);
	    	echo $result;
	    	
	    }
	    public function judgeAppNameCn(){
	    	$id=isset($_POST['id'])?$_POST['id']:'-1';
	    	$appNameCn=isset($_POST['appNameCn'])?$_POST['appNameCn']:'';
	    	$Proxy=$this->exec('getProxy','escloud_consoleServerws');
	    	$result=$Proxy->judgeAppNameCn($appNameCn,$id);
	    	echo $result;
	    }
}
?>