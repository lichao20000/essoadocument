<?php
/**
 * ProxyMessage
 * @author xuekun
 *
 */
class ProxyMessage extends AgentProxyAbstract {
	/**
	 *
	 * @var const
	 */
	const MSG_SERVICE_NAME='messageservice';
	/**
	 *
	 * 构造函数
	 * @return void
	 */
	public function __construct(array $appInfo) {
		parent::__construct($appInfo);
	}
	/**
	 * 增加一条消息
	 * 2014-7-7  xuekun
	 * @param unknown_type $params
	 * @POST
	 * @Path("addEssMessage")
	 * @Consumes("application/json;charset=UTF-8")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * @Deprecated
	 */
	public function addEssMessage($params){
		return $this->post(self::MSG_SERVICE_NAME, 'addEssMessage',$params,"application/json;charset=UTF-8");
	}
	/**
	 * 根据formAndDeliverID(表单ID与动态表数据ID组合的字段)删除交办消息(用于补办与催办).
	 * 2014-7-7  xuekun
	 * @param unknown_type $formAndDeliverID
	 *
	 * @GET
	 * @Path("delEssMessageDeliverByformAndDeliverID/{formAndDeliverID}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean delEssMessageDeliverByformAndDeliverID(
	 * @PathParam("formAndDeliverID") String formAndDeliverID);
	 */
	public function delEssMessageDeliverByformAndDeliverID($formAndDeliverID){
		$urlParam = array($formAndDeliverID);
		array_unshift($urlParam, 'delEssMessageDeliverByformAndDeliverID');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据id删除数据.
	 * 2014-7-7  xuekun
	 * @param unknown_type $id
	 * @GET
	 * @Path("delEssMessageById/{id}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean delEssMessageById(@PathParam("id") Long id;
	 */
	public function delEssMessageById($id){
		$urlParam = array($id);
		array_unshift($urlParam, 'delEssMessageById');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 公告管理,如果记录删除,将消息删除.
	 * 2014-7-7  xuekun
	 * @param stepId 步骤id.
	 *
	 * @GET
	 * @Path("deleteEssMessage/{stepId}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 */
	public function  deleteEssMessageByStepId($stepId){
		$urlParam = array($stepId);
		array_unshift($urlParam, 'deleteEssMessage');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据工作流id和步骤id修改该条工作流消息的状态，修改成Over状态.
	 * 2014-7-7  xuekun
	 * @param id 工作流id.
	 * @param stepId 步骤id.
	 *
	 * @GET
	 * @Path("editMessageWorkFlowStatusByWorkFlowId/{workflowid}/{stepId}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 */
	public function editMessageWorkFlowStatusByWorkFlowId1($workflowid,$stepId){
		$urlParam = array($workflowid,$stepId);
		array_unshift($urlParam, 'editMessageWorkFlowStatusByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据工作流id和步骤id修改该条工作流消息的状态，修改成Over状态(只修改workflowstatus字段---此同步方法用于会签时，只修改用户名为参数username的消息).
	 * 2014-7-7  xuekun
	 * @param unknown_type $id
	 * @param unknown_type $stepId
	 * @param unknown_type $userName
	 * @GET
	 * @Path("editMessageWorkFlowStatusByWorkFlowId/{id}/{stepId}/{userName}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean editMessageWorkFlowStatusByWorkFlowId(@PathParam("id") Long id,
	 * @PathParam("stepId") Long stepId, @PathParam("userName") String userName);
	 */
	public function editMessageWorkFlowStatusByWorkFlowId2($id,$stepId, $userName){
		$urlParam = array($id,$stepId, $userName);
		array_unshift($urlParam, 'editMessageWorkFlowStatusByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据工作流id和接收者姓名以及发送时间修改该条工作流消息的状态，修改成Over状态(只修改workflowstatus字段--此同步方法用于会签时，只修改用户名为参数username的消息
	 * ).
	 * 2014-7-7  xuekun
	 * @param unknown_type $id
	 * @param unknown_type $sendTime
	 * @param unknown_type $reciver
	 * @param unknown_type $state
	 *
	 * @GET
	 * @Path("editMessageWorkFlowStatusByWorkFlowId/{id}/{sendTime}/{reciver}/{state}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 */
	public function editMessageWorkFlowStatusByWorkFlowId3($id,$sendTime, $reciver,$state){
		$urlParam = array($id,$sendTime, $reciver,$state);
		array_unshift($urlParam, 'editMessageWorkFlowStatusByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 *  根据当前用户的userName和formID+动态表数据ID（如2-8）修改该条工作流消息的状态，修改成Over状态
	 * 2014-7-7  xuekun
	 * @param unknown_type $sendUserName
	 * @param unknown_type $userName
	 * @param unknown_type $formAndDeliverID
	 * @param unknown_type $state
	 *
	 * @GET
	 * @Path("editMessageWorkFlowStatusByWorkFlowId/{sendUserName}/{userName}/{formAndDeliverID}/{state}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 */
	public function editMessageWorkFlowStatusByWorkFlowId4( $sendUserName, $userName,$formAndDeliverID, $state){
		$urlParam = array($sendUserName, $userName,$formAndDeliverID, $state);
		array_unshift($urlParam, 'editMessageWorkFlowStatusByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据当前用户的userName和formID+动态表数据ID（如2-8）修改该条工作流消息的状态，修改成Over(工作流状态表示已经处理过的消息)状态.
	 * 2014-7-7  xuekun
	 * @param unknown_type $sendUserName
	 * @param unknown_type $userName
	 * @param unknown_type $formAndDeliverID
	 * @param unknown_type $state
	 * @param unknown_type $stepID
	 *
	 * @GET
	 * @Path("editMessageWorkFlowStatusByWorkFlowId/{sendUserName}/{userName}/{formAndDeliverID}/{state}/{stepID}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean editMessageWorkFlowStatusByWorkFlowId(
	 * @PathParam("sendUserName") String sendUserName, @PathParam("userName") String userName,
	 * @PathParam("formAndDeliverID") String formAndDeliverID, @PathParam("state") String state,
	 * @PathParam("stepID") String stepID);
	 */
	public function editMessageWorkFlowStatusByWorkFlowId5($sendUserName, $userName,$formAndDeliverID, $state,$stepID){
		$urlParam = array($sendUserName, $userName,$formAndDeliverID, $state,$stepID);
		array_unshift($urlParam, 'editMessageWorkFlowStatusByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据id得到一条消息.
	 * 2014-7-7  xuekun
	 * @param id 系统短消息id.
	 * @return EssMessage 返回系统短消息id对应的一条消息.
	 * @GET
	 * @Path("getEssMessageById/{id}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 */
	public function getEssMessageById($id){
		$urlParam = array($id);
		array_unshift($urlParam, 'getEssMessageById');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据用户ID、工作流ID、步骤ID得到该用户未审批过的工作流消息.
	 * 2014-7-7  xuekun
	 * 还需要取workFlowStatus='empty'(即工作流最后一步)的工作流消息.<br>
	 * <p>
	 *
	 * @param userName 系统当前用户名.
	 * @param workflowId 工作流ID.
	 * @param stepId 步骤ID.
	 * @return EssMessage 返回该用户未审批过的工作流消息.
	 * @GET
	 * @Path("getEssMessageByUserNameAndWorkFlowId/{userName}/{workflowId}/{stepId}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public EssMessage getEssMessageByUserNameAndWorkFlowId(@PathParam("userName") String userName,
	 * @PathParam("workflowId") Long workflowId, @PathParam("stepId") Long stepId);
	 */
	public function  getEssMessageByUserNameAndWorkFlowId($userName,$workflowId,$stepId){
		$urlParam = array($userName,$workflowId,$stepId);
		array_unshift($urlParam, 'getEssMessageByUserNameAndWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 获取一个流程中处于Run状态的消息
	 * 2014-7-7  xuekun
	 * @param wfId
	 * @param stepId
	 * @return
	 * @GET
	 * @Path("getEssMessageByWorkFlowIdAndStepId/{wfId}/{stepId}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<EssMessage> getEssMessageByWorkFlowIdAndStepId(@PathParam("wfId") long wfId,
	 * @PathParam("stepId") long stepId);
	 */
	public function getEssMessageByWorkFlowIdAndStepId($wfId,$stepId){
		$urlParam=array($wfId,$stepId);
		array_unshift($urlParam, 'getEssMessageByWorkFlowIdAndStepId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据消息获得流程的第一步发起者.
	 * 2014-7-8  xuekun
	 * @param wfID 工作流id.
	 * @return Long 返回第一步发起者的user对象的ID.

	 * @GET
	 * @Path("getFirstSendUser/{wfID}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Long getFirstSendUser(@PathParam("wfID") Long wfID);
	 */
	public function getFirstSendUser($wfID){
		$urlParam=array($wfID);
		array_unshift($urlParam, 'getFirstSendUser');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据工作流ID获得工作流的发起者用户对象.
	 * 2014-7-8  xuekun
	 * @param wfids 工作流ID集合.
	 * @return Map<Long,Long> 返回key为工作流ID，value为对应工作流的发起者ID.

	 * @POST
	 * @Path("getFirstSendUsersByWFIDS")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public Map<Long, Long> getFirstSendUsersByWFIDS(List<Long> wfids);
	 */
	public function getFirstSendUsersByWFIDS($wfids){
		return $this->post(self::MSG_SERVICE_NAME, 'getFirstSendUsersByWFIDS',$wfids,'application/json;charset=UTF-8');
	}
	/**
	 * 根据用户名得到该用户的未删除的历史消息.
	 * 2014-7-8  xuekun
	 * @param userName 系统当前用户名.
	 * @return List<EssMessage> 返回根据用户名得到该用户的未删除的历史消息.
	 * @GET
	 * @Path("getHistoryMessageByUserName/{userName}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<EssMessage> getHistoryMessageByUserName(@PathParam("userName") String userName);
	 */
	public function getHistoryMessageByUserName($userName){
		$urlParam=array($userName);
		array_unshift($urlParam, 'getHistoryMessageByUserName');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 获得该用户未审批过的交办工作流消息.
	 * 2014-7-8  xuekun
	 * <p>
	 * 查询时，工作流状态应为Run状态，此方法用于交办的验证.<br>
	 *
	 * @param sendUserName 用户名,发送者.
	 * @param userName 用户名,接收者.
	 * @param formAndDeliverID formID和数据ID

	 * @GET
	 * @Path("getMessageWorkFlowByWorkFlowId/{sendUserName}/{userName}/{formAndDeliverID}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<EssMessage> getMessageWorkFlowByWorkFlowId(
	 * @PathParam("sendUserName") String sendUserName, @PathParam("userName") String userName,
	 * @PathParam("formAndDeliverID") String formAndDeliverID);
	 */
	public function getMessageWorkFlowByWorkFlowId($sendUserName, $userName,$formAndDeliverID){
		$urlParam=array($sendUserName, $userName,$formAndDeliverID);
		array_unshift($urlParam, 'getMessageWorkFlowByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据用户名得到该用户的新消息，同时将这些消息状态改为Yes.
	 * 2014-7-8  xuekun
	 * @param userName 当前登录用户.
	 * @return List<EssMessage> 返回当前用户的所有新消息.
	 *
	 * @GET
	 * @Path("getNewMessageByUserName/{userName}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<EssMessage> getNewMessageByUserName(@PathParam("userName") String userName)
	 */
	public function getNewMessageByUserName($userName){
		$urlParam=array($userName);
		array_unshift($urlParam, 'getNewMessageByUserName');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据用户名和分页信息得到请求该用户审批的工作流消息.
	 * 2014-7-8  xuekun
	 * @param userName 系统当前用户名.
	 * @param page 分页信息
	 * @return List<EssMessage> 返回请求该用户审批的工作流消息.

	 * @GET
	 * @Path("getNoApprovalWorkFlowMessageByUserName/{userName}/{start}/{limit}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<EssMessage> getNoApprovalWorkFlowMessageByUserName(
	 * @PathParam("userName") String userName, @PathParam("start") Long start,
	 * @PathParam("limit") Long limit);
	 */
	public function getNoApprovalWorkFlowMessageByUserName($userName, $start,$limit){
		$urlParam=array($userName, $start,$limit);
		if ($start!==null&&$start!==''){
			array_push($urlParam, $start);
		}
		if ($limit!==null&&$limit!==''){
			array_push($urlParam, $limit);
		}
		array_unshift($urlParam, 'getNoApprovalWorkFlowMessageByUserName');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 获取流程中处于Run状态的 处理人
	 * 2014-7-8  xuekun
	 * @param wfId 工作流id
	 * @param stepId 步骤id
	 * @return List<String> 返回请求的下一步审批人
	 *
	 * @GET
	 * @Path("getOwners/{wfId}/{stepId}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<String> getOwners(@PathParam("wfId") long wfId, @PathParam("stepId") long stepId);
	 */
	public function getOwners($wfId, $stepId){
		$urlParam=array($wfId, $stepId);
		array_unshift($urlParam, 'getOwners');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 为了得到工作流中接受人的名字，然后更新缓存使用
	 * 2014-7-8  xuekun
	 * @param wfId
	 * @return List<String>
	 * @GET
	 * @Path("getRecevierByWfId/{wfId}")
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * public List<String> getRecevierByWfId(@PathParam("wfId") long wfId);
	 */
	public function getRecevierByWfId($wfId){
		$urlParam=array($wfId);
		array_unshift($urlParam, 'getRecevierByWfId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据用户名提取消息总数
	 * 2014-7-8  xuekun
	 * @param userName 用户名(登录名)
	 * @return int 消息总数
	 *
	 * @GET
	 * @Path("receiverMessageCount/{userName}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Integer receiverMessageCount(@PathParam("userName") String userName);
	 */
	public function  receiverMessageCount($userName){
		$urlParam=array($userName);
		array_unshift($urlParam, 'receiverMessageCount');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据id删除一条消息.
	 * 2014-7-8  xuekun
	 * @param id 系统消息id.
	 *
	 * @GET
	 * @Path("removeEssMessage/{id}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean removeEssMessage(@PathParam("id") Long id);
	 */
	public function removeEssMessage($id){
		$urlParam=array($id);
		array_unshift($urlParam, 'removeEssMessage');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据工作流id和步骤id删除消息.
	 * 2014-7-8  xuekun
	 * @param id 工作流id.
	 * @param stepId 步骤id.
	 * @GET
	 * @Path("removeEssMessageByWorkFlowId/{id}/{stepId}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean removeEssMessageByWorkFlowId(@PathParam("id") Long id,
	 * @PathParam("stepId") Long stepId);
	 */
	public function removeEssMessageByWorkFlowId($id,$stepId){
		$urlParam=array($id,$stepId);
		array_unshift($urlParam, 'removeEssMessageByWorkFlowId');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 查询出消息状态(新建事项).
	 * 2014-7-8  xuekun
	 * @param id 工作流ID.
	 * @param stepId 步骤ID.
	 * @param receiver 消息接收者.
	 * @param sendUser 消息发送者.
	 * @return String 返回消息的状态.
	 * @GET
	 * @Path("selecteEssMessageWorkFlowStatus/{id}/{stepId}/{receiver}/{sendUser}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public String selecteEssMessageWorkFlowStatus(@PathParam("id") Long id,
	 * @PathParam("stepId") Long stepId, @PathParam("receiver") String receiver,
	 * @PathParam("sendUser") String sendUser);
	 */
	public function selecteEssMessageWorkFlowStatus($id,$stepId,$receiver,$sendUser){
		$urlParam=array($id,$stepId,$receiver,$sendUser);
		array_unshift($urlParam, 'selecteEssMessageWorkFlowStatus');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 根据工作流id和步骤id将该条工作流消息修改成一般的消息(只修改workflowstatus字段---此同步方法用于会签时，只修改用户名为参数username的消息).
	 * 2014-7-8  xuekun
	 * @param workflowid 工作流id.
	 * @param stepId 步骤id.
	 * @param userName 系统当前用户.
	 * @GET
	 * @Path("transWorkFlowMessageToMessage/{workflowId}/{stepId}/{userName}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean transWorkFlowMessageToMessage(@PathParam("workflowId") Long workflowId,
	 * @PathParam("stepId") Long stepId, @PathParam("userName") String userName);
	 */
	public function transWorkFlowMessageToMessage($workflowId,$stepId,$userName){
		$urlParam=array($workflowId,$stepId,$userName);
		if ($userName!==null&&$userName!==''){
			array_push($urlParam,$userName);
		}
		array_unshift($urlParam, 'transWorkFlowMessageToMessage');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}

	/**
	 * 修改一条消息的状态.
	 * 2014-7-8  xuekun
	 * @param id 工作流ID
	 * @param workflowstatus 消息状态.
	 * @param stepId 步骤ID.
	 * @param receiver 接收者.
	 * @param sendUser 发送者.可选
	 * @param msgId 消息id.可选
	 * @GET
	 * @Path("updateEssMessageWorkFlowStatus/{id}/{workflowstatus}/{stepId}/{receiver}/{sendUser}/{msgId}")
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * public Boolean updateEssMessageWorkFlowStatus(@PathParam("id") Long id,
	 * @PathParam("workflowstatus") String workflowstatus, @PathParam("stepId") Long stepId,
	 * @PathParam("receiver") String receiver, @PathParam("sendUser") String sendUser,
	 * @PathParam("msgId") Long msgId);
	 */
	public function updateEssMessageWorkFlowStatus($id,$workflowstatus,$stepId,$receiver=null,$sendUser=null,$msgId=null){
		$urlParam=array($id,$workflowstatus,$stepId,$receiver);
		if ($sendUser!==null&&$sendUser!==''){
			array_push($urlParam,$sendUser);
		}
		if ($msgId!==null&&$msgId!==''){
			array_push($urlParam,$msgId);
		}
		array_unshift($urlParam, 'updateEssMessageWorkFlowStatus');
		$url = implode('/', $urlParam);
		return $this->get(self::MSG_SERVICE_NAME, $url);
	}
	/**
	 * 获取树节点
	 * 2014-7-8  xuekun
	 * @param typeId 节点id
	 * @param userId 用户唯一标识.
	 * @return 树节点信息.
	 * @POST
	 * @Path("showMessageNode")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public List<HashMap<String, Object>> showMessageNode(Map<String, String> map);
	 */
	public function  showMessageNode($params){
		return $this->post(self::MSG_SERVICE_NAME, 'showMessageNode',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 获取消息列表
	 * 2014-7-8  xuekun
	 * @param typeId 节点id.
	 * @param keyword 关键词.
	 * @param searchType 工作流消息状态，run或者over.
	 * @param userId 用户唯一标识.
	 * @param start 起始位置.
	 * @param limit 限制条数.
	 * @return
	 * @POST
	 * @Path("showMessageList")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public Map<String, Object> showMessageList(Map<String, String> map);
	 */
	public function showMessageList($params){
		return $this->post(self::MSG_SERVICE_NAME, 'showMessageList',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 删除数据前判断是否有未处理的消息，返回相应提示.
	 * 2014-7-8  xuekun
	 * @param ids 包含删除数据id的数组.
	 * @return 提示信息.

	 * @POST
	 * @Path("beforeDeleteGridData")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public String beforeDeleteGridData(long[] ids);
	 */
	public function beforeDeleteGridData($ids){
		return $this->post(self::MSG_SERVICE_NAME, 'beforeDeleteGridData',$ids,'application/json;charset=UTF-8');
	}
	/**
	 * 删除数据
	 * 2014-7-8  xuekun
	 * @param userId 用户id.
	 * @param ids 包含删除数据id的数组.
	 * @return 成功：true，失败false.
	 * @POST
	 * @Path("deleteGridData/{userId}")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public Boolean deleteGridData(@PathParam("userId") String userId, long[] ids);
	 */
	public function deleteGridData($userId, $ids){
		$urlParam=array($userId);
		array_unshift($urlParam, 'deleteGridData');
		$url = implode('/', $urlParam);
		return $this->post(self::MSG_SERVICE_NAME, $url,$ids,'application/json;charset=UTF-8');
	}
	/**
	 * 节点下数据清空前验证是否存在Run状态的数据
	 *
	 * @param userId 用户id.
	 * @param nodeId 树节点id.
	 * @POST
	 * @Path("beforeClearNodeData")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public String beforeClearNodeData(Map<String, String> param)
	 */
	public function beforeClearNodeData($params){
		return $this->post(self::MSG_SERVICE_NAME, 'beforeClearNodeData',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 清空节点下数据
	 * 2014-7-8  xuekun
	 * @param userId 用户id.
	 * @param searchType 工作流状态(run over).
	 * @param nodeId 树节点id.
	 * @return 成功true，失败false
	 * @POST
	 * @Path("clearNodeData")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public Boolean clearNodeData(Map<String, String> param);
	 */
	public function clearNodeData($params){
		return $this->post(self::MSG_SERVICE_NAME, 'clearNodeData',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 获取正在运行的消息，组装前段msgBox用
	 * 2014-7-8  xuekun
	 * @return List<EssMessage> 返回当前用户的所有消息
	 * @POST
	 * @Path("getRunningMessageForMsgBox")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public List<EssMessage> getRunningMessageForMsgBox(Map<String, String> param);
	 */
	public function getRunningMessageForMsgBox($params){
		return $this->post(self::MSG_SERVICE_NAME, 'getRunningMessageForMsgBox',$params,'application/json;charset=UTF-8');
	}

	/**
	 * 供JS轮询调用获取待办消息
	 * 2014-7-8  xuekun
	 * @param unknown_type $params
	 * @POST
	 * @Path("getSoaMsg")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function getSoaMsg($params){
		return $this->post(self::MSG_SERVICE_NAME, 'getSoaMsg',$params,'application/json;charset=UTF-8');
	}
	public function getSoaMsgUrl(){
		$iipp=$_SERVER["REMOTE_ADDR"];//客户端IP
		$data['cilentIP'] = $iipp;
		$postData = json_encode($data);
		AopCore::loadLibrary('app');
		$appInfo = AopApp::getInfo('system');
		$system = AopApp::getInstance($appInfo); 
		$proxy = $system->getProxyInstance('loginnetsegment');
		 $loginAddress = $proxy->getDataByCilentIP($postData);
		/* //xiewenda 20150508 获得当前登录ip所对应的网段设置在那个文件存储服务的id
		$returnData = $proxy->getDataByCilentIPNoId($postData);
		//通过文件服务器的id得到 文件服务器对应的ip和端口号 在替换消息url里的IP和端口
		$filesever =  $proxy->getStorageById($returnData->id); */

		$loginIp =$this->getUri(self::MSG_SERVICE_NAME, 'getSoaMsg');
		
		if($loginAddress->loginIP){
		$IP = $loginAddress->loginIP;
		$portNum = $loginAddress->portNum;
		
		if($IP!="-1" && $portNum!="-1"){
			$ipStartPos = stripos($loginIp,"://")+3;
			if($ipStartPos != "-1"){
				$loginIp1 = substr($loginIp,$ipStartPos);
				$ipEndPos =  stripos($loginIp1,"/");
				$loginIp2 = substr($loginIp1,$ipEndPos);
			 	$loginIp = "http://".$IP.':'.$portNum.$loginIp2.'/'.$IP.':'.$portNum;//最后把登录的获取的ip和端口号作为一个参数放在url里 获取消息时替换
				}
			}
			
		}else{
			$fileServer = AopConfig::get('sso.fileServer');
			$ipStartPos = stripos($loginIp,"://")+3;
			$loginIp1 = substr($loginIp,$ipStartPos);
			$ipEndPos =  stripos($loginIp1,"/");
			$loginIp2 = substr($loginIp1,$ipEndPos);
			$address = substr($fileServer,stripos($fileServer,"://")+3);
			$loginIp = $fileServer.$loginIp2.'/'.$address;
		}
		return $loginIp;
		//return $this->getUri(self::MSG_SERVICE_NAME, 'getSoaMsg');
	}

	/**
	 *
	 * 2014-7-8  xuekun
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("deleteMessageOfUsingDetail")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function deleteMessageOfUsingDetail($params){
		return $this->post(self::MSG_SERVICE_NAME, 'deleteMessageOfUsingDetail',$params,'application/json;charset=UTF-8');
	}

	/**
	 * 2014-7-8  xuekun
	 * @param unknown_type $params
	 * @POST
	 * @Path("addMessage")
	 * @Consumes("application/json;charset=UTF-8")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function addMessage($params){
		return $this->post(self::MSG_SERVICE_NAME, 'addMessage',$params,'application/json;charset=UTF-8');
	}
	
	/**
	 * @POST
	 * @Path("updateMessageofDownFile")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function updateMessageDownFile($params){
		return $this->post(self::MSG_SERVICE_NAME, 'updateMessageDownFile',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 
	 * xuekun  added in  2014-10-14 
	 * @param unknown_type $params
	 */
	public function senSaasEmail($params){
		return  $this->post(self::MSG_SERVICE_NAME, 'senSaasEmail',$params,'application/json;charset=UTF-8');
	}
}