<?php
/**
 *
 * ProxyLog
 * @author cheguoli
 *
 */
class ProxyLog extends AgentProxyAbstract {

	/**
	 *
	 * Log服务名称
	 * @var const
	 */
	const LOG_SERVICE_NAME = 'escloud_baseLogServiceImpl';

	/**
	 *
	 * 构造函数
	 * @return void
	 */
	public function __construct(array $appInfo) {
		parent::__construct($appInfo);
	}
	/**
	 * 2014.07.07 xuekun
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("saveAuditLog")
	 * @Consumes({ "application/json;charset=UTF-8" })
	 * @Produces({ "text/plain;charset=UTF-8" })
	 * public Boolean saveAuditLog(HashMap map);
	 */
	public function saveAuditLog($params){
		return  $this->post(self::LOG_SERVICE_NAME, 'saveAuditLog',json_encode($params),'application/json;charset=UTF-8');
	}

	/**
	 *
	 * 写日志
	 * @param string $appId
	 * @param string $message
	 * @param int $level
	 * @param int $type 账号管理 = 1， 认证管理=2， 授权管理=3， 登入登出=4， 业务操作=5
	 * @return boolean
	 * @POST
	 * @Path("saveAuditLog")
	 * @Consumes({ "application/json;charset=UTF-8" })
	 * @Produces({ "text/plain;charset=UTF-8" })
	 * public Boolean saveAuditLog(HashMap map);
	 */
	public function writeLog($appId, $message, $level = 1, $type = 5) {
		$logInfo = array(
				'appId' => $appId,
				'level' => $level,
				'type' => $type,
				'message' => $message,
		);
		return  $this->post(self::LOG_SERVICE_NAME, 'saveAuditLog',json_encode($logInfo),'application/json;charset=UTF-8');
	}

	/**
	 *
	 * 查询日志
	 * @param array $condition
	 * @param array $sort array('field_1' => 'asc' , 'field_2' => 'desc')
	 * @param int $start
	 * @param int $limit
	 * @return array
	 *
	 * @POST
	 * @Path("findAuditLog/{authId}/{authToken}/{condition}/{sort}/{skip}/{limit}")
	 */
	public function getLogList(array $condition,array $sort = array(), $page = 1, $pageSize = 10) {

		if(!isset($sort['auditTime'])){
			$sort += array('auditTime' => 'desc');//默认是按时间排序
		}
		foreach ($sort as $key => $value) {
			$sort[$key] = ($value == 'asc') ? 'ASCENDING' : 'DESCENDING';
		}
		$urlParam = array($this->getAppId(), $this->getAppToken());
		array_unshift($urlParam, 'findAuditLog');

		$condition['appId'] =$this->getAppId();
		//php 5.4 才支持JSON_UNESCAPED_UNICODE属性
		//array_push($urlParam, urlencode(json_encode($condition,JSON_UNESCAPED_UNICODE)));
		//手动转格式
		$conditionString = '{';
		foreach($condition as $key => $val) {
			$conditionString .= '"'.$key.'":'.'"'.$val.'",';
		}
		$conditionString = substr($conditionString, 0, strlen($conditionString)-1);
		$conditionString .='}';
		array_push($urlParam, urlencode($conditionString));
		array_push($urlParam, urlencode(json_encode($sort)));
		array_push($urlParam, ($page-1)*$pageSize);
		array_push($urlParam, $pageSize);
		$url = implode('/', $urlParam);
		$result = $this->post(self::LOG_SERVICE_NAME, $url,json_encode(array()),'application/json');
		return $result;
	}

	/**
	 *
	 * 根据appId删除日志
	 * @param string $appId
	 * @return boolean
	 * @see java public boolean drop(String app_id)
	 */
	public function drop($appId = null) {
		;
	}
	/**
	 * 2014.07.07 xuekun
	 * 得到日志列表
	 * @param unknown_type $id
	 *
	 * @POST
	 * @Path("getAuditLogs")
	 * @Consumes({ "application/json;charset=UTF-8" })
	 * @Produces({ "application/json;charset=UTF-8" })
	 */
	public function getAuditLogs($params){
		return  $this->post(self::LOG_SERVICE_NAME, 'getAuditLogs',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 2014.07.07 xuekun
	 * 根据id获取日志信息
	 * @param unknown_type $id
	 *
	 * @GET
	 * @Path("getAuditLog/{id}")
	 * @Produces({ "application/json;charset=UTF-8" })
	 * public AuditLog getAuditLog(@PathParam("id")int id);
	 */
	public function getAuditLog($id){
		$urlParam = array($id);
		array_unshift($urlParam, 'getAuditLog');
		$url = implode('/', $urlParam);
		return $this->get(self::LOG_SERVICE_NAME, $url);
	}
	/**
	 * 2014.07.07 xuekun
	 * 通过条件获取日志信息
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("getAuditLogByCondition")
	 * @Consumes({ "application/json;charset=UTF-8" })
	 * @Produces({ "application/json;charset=UTF-8" })
	 */
	public function getAuditLogByCondition($params){
		return $this->post(self::LOG_SERVICE_NAME, 'getAuditLogByCondition',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 2014.07.07 xuekun
	 * 删除日志
	 * @param unknown_type $ids
	 *
	 * @GET
	 * @Path("deleteAuditLogByIds/{ids}")
	 * @Produces({ "text/plain;charset=UTF-8" })
	 * public Boolean deleteAuditLogByIds(@PathParam("ids")String ids);
	 */
	public function deleteAuditLogByIds($ids){
		$urlParam = array($ids);
		array_unshift($urlParam, 'deleteAuditLogByIds');
		$url = implode('/', $urlParam);
		return $this->get(self::LOG_SERVICE_NAME, $url);
	}
	/**
	 * 2014.07.07 xuekun
	 * 通过条件删除日志（如果没有条件，则删除全部日志）
	 * @param unknown_type $condition
	 *
	 * @POST
	 * @Path("deleteAuditLogByCondition")
	 * @Consumes({ "application/json;charset=UTF-8" })
	 * @Produces({ "text/plain;charset=UTF-8" })
	 * public Boolean deleteAuditLogByCondition(HashMap map);
	 */
	public function deleteAuditLogByCondition($condition){
		return $this->post(self::LOG_SERVICE_NAME, 'deleteAuditLogByCondition',$condition,'application/json;charset=UTF-8');
	}
	/**
	 * 2014.07.07 xuekun
	 * 通过ids获取日志s
	 * @param ids
	 * @return
	 *
	 * @GET
	 * @Path("getAuditLogByIds/{ids}")
	 * @Produces({"application/json;charset=UTF-8" })
	 * public List<AuditLog> getAuditLogByIds(@PathParam("ids")String ids);
	 */
	public function getAuditLogByIds($ids){
		$urlParams=array($ids);
		array_unshift($urlParams, 'getAuditLogByIds');
		$url=implode('/', $urlParams);
		return $this->get(self::LOG_SERVICE_NAME, $url);
	}
	/**
	 * 2014.07.07 xuekun
	 * 得到日志总数
	 * @param unknown_type $condition
	 *
	 * @POST
	 * @Path("getAuditLogCount")
	 * @Consumes({ "application/json;charset=UTF-8" })
	 * @Produces({"text/plain;charset=UTF-8"})
	 * public String getAuditLogCount(HashMap map);

	 */
	public function getAuditLogCount($condition){
		return $this->post(self::LOG_SERVICE_NAME, 'getAuditLogCount',$condition,'application/json;charset=UTF-8');
	}
   public function saveBaseLog($map){
   	$urlParam = array('saveBaseLog');
   	$url = implode('/', $urlParam);
   	return $this->post(self::LOG_SERVICE_NAME,$url,$map,"application/json;charset=UTF-8");
   }
   
   /**
    * xiaoxiong 20141016 添加登录日志方法
    * @param unknown $map{userid,module,type,ip,loginfo,operate}
    * userid 当前用户ID
    * module 当前模块的名称
    * type 日志类型     操作日志为：operation
    * ip 为当前用户的客户端IP
    * loginfo 日志内容
    * operate 日志名称
    */
   public function saveLog($map){
   	$urlParam = array('saveLog');
   	$url = implode('/', $urlParam);
   	return $this->post('escloud_logservice',$url,$map,"application/json;charset=UTF-8");
   }
}