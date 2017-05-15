<?php
/**
 *
 * ProxyCache
 * @author cheguoli
 *
 */
class ProxyCache extends AgentProxyAbstract {

	/**
	 *
	 * Cache服务名称
	 * @var const
	 */
	const CACHE_SERVICE_NAME = 'escloud_cacheBasews';

	/**
	 *
	 * 构造函数
	 * @return void
	 */
	public function __construct(array $appInfo) {
		parent::__construct($appInfo);
	}

	/**
	 *
	 * 根据$key获取Cache内容
	 * @param string $key
	 * @return string
	 *
	 * @GET
	 * @Path("get/{key}")
	 * @Produces({MediaTypeEx.TEXT_PLAIN_UTF8})
	 * public String get(@PathParam("key") String key);
	 */
	public function getCache($key) {
		$urlParam = array($key);
		array_unshift($urlParam, 'get');
		$url = implode('/', $urlParam);
		$result = $this->get(self::CACHE_SERVICE_NAME, $url);
		return $result === '' ? $result : unserialize($result);
	}

	/**
	 *
	 * 设置Cache
	 * @param string $key
	 * @param string $value
	 * @param int $expire 默认为3600秒
	 * @return boolean
	 *
	 * @POST
	 * @Path("set/{key}/{exp}")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function setCache($key, $value, $expire = 3600) {
		$urlParam = array($key, $expire);
		array_unshift($urlParam, 'set');
		$url = implode('/', $urlParam);
		return $this->post(self::CACHE_SERVICE_NAME, $url, serialize($value), 'application/json;charset=UTF-8');
	}
	/**
	 * 设置Cache无过期时间
	 * @param unknown_type $key
	 * @param unknown_type $value
	 * @return boolean
	 * @POST
	 * @Path("set/{key}")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 *
	 */
	public  function setCacheNoExpire($key,$value){
		$urlParam = array($key);
		array_unshift($urlParam, 'set');
		$url = implode('/', $urlParam);
		return $this->post(self::CACHE_SERVICE_NAME, $url, serialize($value), 'application/json;charset=UTF-8');
	}
	/**
	 * 根据key值删除Cache内容
	 * @param unknown_type $key
	 * @GET
	 * @Path("del/{key}")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function deleteCache($key){
		$urlParam = array($key);
		array_unshift($urlParam, 'delete');
		$url = implode('/', $urlParam);
		return $result = $this->get(self::CACHE_SERVICE_NAME, $url);
	}
}