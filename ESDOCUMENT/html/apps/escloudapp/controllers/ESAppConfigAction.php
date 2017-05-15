<?php
/**
 *
 * @author caojian
 * @Date 20140512
 */
class ESAppConfigAction extends ESActionBase
{
	    //默认访问的方法，渲染主页面
         public function index(){
		          return $this->renderTemplate();
	      }
	      
		public function getAppConfigList(){
				$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
				$page = isset($_POST['page']) ? $_POST['page'] : 1;
				$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
				$appConfigProxy = $this->exec("getProxy", 'escloud_appConfigws');
			    $total = $appConfigProxy->getAppConfigCount($keyWord);
       		    $data['startNo']  = ($page-1)*$rp;
        		$data['limit'] = $rp;
       			$data['keyWord'] = $keyWord;
       			$canshu = json_encode($data);
				$rows = $appConfigProxy->getAllAppConfigList($canshu);
				$start = 1;
				$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
				foreach ($rows as $row){
				$entry = array("id"=>$row->id,
					"cell"=>array(
							"startNum"=>$start,
							"ids"=>'<input type="checkbox"  class="checkbox"  name="appServerlist" value="'.$row->id.'"id="appServerlist">',
	                        "id"=>$row->id,
							"operate"=>"<span class='editbtn'>&nbsp;</span>",
							"title"=>$row->title,
							"appConfigKey"=>$row->appConfigKey,
							"appConfigValue"=>$row->appConfigValue,
							"description"=>$row->description,
							"valueType"=>$row->valueType
					),
				);
				$jsonData['rows'][] = $entry;
				$start++;
			}
		 echo json_encode($jsonData);
		}
	    //修改应用
	    public function updateApp(){
	    	parse_str($_POST['data'],$out);
	    	$out['userId'] =  $this->getUser()->getId();
	    	$out['userIp'] =  $this->getClientIp();
	    	$data=json_encode($out);
	    	$Proxy=$this->exec('getProxy','escloud_appConfigws');
	    	$result=$Proxy->editApp($data);
	    	echo $result;
	    }
	    //编辑应用
	    public function edit_appconfig(){
	    	$colValues=$_POST['data'];
	    	$data = explode('|',$colValues);
	    	return $this->renderTemplate(array('data'=>$data));
	    }
}
?>