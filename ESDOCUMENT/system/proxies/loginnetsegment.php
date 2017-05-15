<?php

class ProxyLoginnetsegment extends AgentProxyAbstract {
	
	const SERVICE_NAME = "loginNetSegmentWS";
	
	
	/**
	 * 获取目标登录IP
	 */
	public function getDataByCilentIP($postData){
		$urlParam = array('getDataByCilentIP');
		$url = implode('/', $urlParam);
		return $this->post(self::SERVICE_NAME, $url,$postData,"application/json;charset=UTF-8");
	}
	
	/**
	 * 外网访问 文件服务器的ip，端口和网段对应的文件服务器的id
	 */
	public function getDataByCilentIPNoId($postData){
		$urlParam = array('getDataByCilentIPNoId');
		$url = implode('/', $urlParam);
		return $this->post("mainFileServer", $url,$postData,"application/json;charset=UTF-8");
	}
	
	/**
	 * 通过id获得文件服务器的信息 要用到端口号和ip
	 * @param unknown $id
	 */
	public function getStorageById($id){
		$urlParam = array('getStorageById',$id);
		$url = implode('/', $urlParam);
		return $this->get("mainFileServer", $url);
	}
	
}

?>