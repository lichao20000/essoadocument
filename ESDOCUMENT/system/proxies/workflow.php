<?php
class ProxyWorkflow extends AgentProxyAbstract{

	/**
	 *
	 * 服务名称
	 * @var const
	 */
	const WORKFLOW_SERVICE_NAME = 'workflowservice';


	public function __construct($appInfo) {
		parent::__construct($appInfo);
		//$this->_baseUrl = 'http://16.187.126.209:8088/aop/rest';
	}

	private function _prepareParam($function){
		$urlParam = array($this->getAppId(), $this->getAppToken());
		array_unshift($urlParam, $function);
		array_unshift($urlParam, 'service');
		return $urlParam;
	}

	public function getProcessDefinitions($start = 0, $pagesize = 20) {
		$urlParam = $this->_prepareParam('process-definitions');
		$urlParam[] = $start;
		$urlParam[] = $pagesize;
		$urlParam[] = 'id';
		$urlParam[] = 'asc';
		$url = implode('/', $urlParam);
		$result = $this->get(self::WORKFLOW_SERVICE_NAME, $url, NULL);
		return $result;
	}

	public function doNewInstance($templateid, $bizid, $args = null) {
		global $user;
		$urlParam = $this->_prepareParam('process-instance');
		$urlParam[] = $templateid;
		$urlParam[] = $bizid;
		$url = implode('/', $urlParam)  . '?userId=' . $user->id;
		$arglist = $args;
		if (!isset($args)){
			//临时数据
			$arglist = array('_abc_'=>2);
		}
		$result = $this->post(self::WORKFLOW_SERVICE_NAME, $url,
			 json_encode($arglist), 'application/json;chartset=UTF-8');
		return $result;
	}

	/**
	 * 获取用户$userId工作情况汇总信息
	 * @param string $userId
	 */
	public function getTaskSummary($userId = NULL){
		if (isset($userId)){
			$id = $userId;
		}else{
			global $user;
			$id = $user->id;
		}
		$urlParam = $this->_prepareParam('tasks-summary');
		$urlParam[] = $id;
		$url = implode('/', $urlParam);
		$result = $this->get(self::WORKFLOW_SERVICE_NAME, $url);
		return $result;
	}

	/**
	 * 获取工作流实例详细情况
	 * @param string $instanceId 实例ID
	 */
	public function getProcessInstance($instanceId){
		$urlParam = $this->_prepareParam('processInstance');
		$urlParam[] = $instanceId;
		$url = implode('/', $urlParam);
		$result = $this->get(self::WORKFLOW_SERVICE_NAME, $url);
		return $result;
	}

	/**
	 * 获取工作流实例流程图
	 * @param string $instanceId 实例ID
	 */
	public function getProcessInstanceDiagram($instanceId){
		$urlParam = $this->_prepareParam('processInstance');
		$urlParam[] = $instanceId;
		$urlParam[] = 'diagram';
		$url = implode('/', $urlParam);
		$result = $this->get(self::WORKFLOW_SERVICE_NAME, $url);
		return $result;
	}

	/**
	 * 获取分配给用户$userId的任务
	 * @param string $userId 用户ID
	 * @param int $start 当前页
	 * @param int $size 页面记录条数
	 */
	public function getTasksAssigned($userId, $start = 0, $size = 0, $asc = TRUE, $processDefineKey = null){
		$urlParam = $this->_prepareParam('tasks');
		$urlParam[] = $start;
		$urlParam[] = $size;
		$urlParam[] = 'id';
		if ($asc){
			$urlParam[] = 'asc';
		}else{
			$urlParam[] = 'desc';
		}
		$url = implode('/', $urlParam) . '?assignee=' . $userId;
		$args = array();
		if (isset($processDefineKey) && strlen($processDefineKey) > 0) {
		  $args['process-define-key'] = $processDefineKey;
		}
		$result = $this->get(self::WORKFLOW_SERVICE_NAME, $url, $args);
		return $result;
	}

	/**
	 * 获取任务信息
	 * @param string $taskId  任务ID
	 */
	public function getTask($taskId){
		$urlParam = $this->_prepareParam('task');
		$urlParam[] = $taskId;
		$url = implode('/', $urlParam);
		$result = $this->get(self::WORKFLOW_SERVICE_NAME, $url);
		return $result;
	}

	/**
	 * 执行任务
	 * @param string $taskId 任务ID
	 * @param string $opCode 操作码，目前支持claim|complete
	 */
	public function opTask($taskId, $userid, $opCode, $args = null){
		$urlParam = $this->_prepareParam('task');
		$urlParam[] = $taskId;
		$urlParam[] = $userid;
		$urlParam[] = $opCode;
		$urlParam[] = 'abc';
		$url = implode('/', $urlParam);

		$arglist = $args;
		if (!isset($args)){
			//临时数据
			$arglist = array('_abc_'=>2);
		}
		$result = $this->put(self::WORKFLOW_SERVICE_NAME, $url, json_encode($arglist,JSON_FORCE_OBJECT), 'application/json' );
		//$result = $this->put(self::WORKFLOW_SERVICE_NAME, $url, json_encode($arglist), 'application/json' );
		return $result;
	}

}