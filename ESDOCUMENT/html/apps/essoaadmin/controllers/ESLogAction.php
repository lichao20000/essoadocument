<?php
/**
 *
 * @author wangbo
 * @Date 20140327
 */
class ESLogAction extends ESActionBase
{
	     //默认访问的方法，渲染主页面
         public function index(){
		          return $this->renderTemplate();
	      }
	      //获取所有日志信息
	      public function getLogList(){
		      	$keyWord = 	isset($_GET['keyWord']) ? $_GET['keyWord'] : '';
		      	$page = isset($_POST['page']) ? $_POST['page'] : 1;
		      	$rp = isset($_POST['rp']) ? $_POST['rp'] : 20;
		      	$logProxy = $this->exec("getProxy", 'escloud_logws');
		      	$total = $logProxy->getCountAll($keyWord);
		      	$data['startNo']  = ($page-1)*$rp;
		      	$data['limit'] = $rp;
		      	$data['keyWord'] = $keyWord;
		      	$canshu = json_encode($data);
		      	$rows = $logProxy->getAllLog($canshu);
		     	$start=($page-1)*$rp;
		      	$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		      	foreach ($rows as $row){
		      		$entry = array("id"=>$row->_id,
		      				"cell"=>array(
		      						"startNum"=>$start+1,
		      						"ids"=>'<input type="checkbox"  class="checkbox"  name="logId" value="'.$row->_id.'"id="logId">',
		      						"id"=>$row->_id,
		      						"log_year"=>$row->log_year,
		      						"log_month"=>$row->log_month,
		      						"log_day"=>$row->log_day,
		      						"log_quarter"=>$row->log_quarter,
		      						"log_date"=>$row->log_date,
		      						"log_time"=>$row->log_time,
		      						"userid"=>$row->userid,
		      						"username"=>$row->username,
		      						"organpath"=>$row->organpath,
		      						"organfullname"=>$row->organfullname,
		      						"log_module"=>$row->log_module,
		      						"loginfo"=>$row->loginfo,
		      						"address"=>$row->address,
		      				),
		      		);
		      		$jsonData['rows'][] = $entry;
		      		$start++;
		      	}
		      	echo json_encode($jsonData);
	      }
	      //清空日志列表
	      public function deleteAllLog(){
		      	$logProxy = $this->exec("getProxy", 'escloud_logws');
		      	$result = $logProxy->deleteAllLog();
		      	echo $result;
	      }
	      //删除部分日志
	      public function deleteLogList(){
	         	$ids = $_POST['ids'];
		      	$logProxy = $this->exec("getProxy", 'escloud_logws');
		      	$result = $logProxy->deleteLogList($ids);
		      	echo $result;
	      }
}
?>