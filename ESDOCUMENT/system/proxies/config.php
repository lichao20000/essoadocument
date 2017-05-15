<?php
class ProxyConfig extends AgentProxyAbstract {

  /**
  *
  * Config服务名称
  * @var const
  */

  const CONFIG_SERVICE_NAME = 'configservice';

  /**
   *
   * 构造函数
   * @param array $appInfo
   * @return return_type
   */
  public function __construct(array $appInfo) {
    parent::__construct($appInfo);
  }

  /**
   *
   * 获取列表信息
   * @param array $condition
   * @return mixed
   * @GET
   * @Path("getconfigbykey/{appId}/{authToken}/{jsonData}")
   * @Produces("text/plain")
   * public String getConfigByKey(@PathParam("appId")String appId,
   * 							  @PathParam("authToken") String authToken,
   * 							  @PathParam("jsonData")String jsonData);
   */
  public function searchConfig($key) {
    $urlParam = array($this->getAppId(), $key);
    array_unshift($urlParam, 'getconfigbykey');
    $url = implode('/', $urlParam);
    return $this->get(self::CONFIG_SERVICE_NAME, $url);
  }
  
  /**
   * 针对link来进行的处理
   * @param unknown_type $key
   */
  public function getConfig($appId, $key) {
    $urlParam = array($appId, $key);
    array_unshift($urlParam, 'getconfigbykey');
    $url = implode('/', $urlParam);
    return $this->get(self::CONFIG_SERVICE_NAME, $url);
  }

  /**
   *
   * 获取App配置列表信息
   * @param unknown_type $appId
   * @param unknown_type $appToken
   * @return return_type
   * @GET
   * @Path("getallconfig/{appId}")
   * @Produces("application/json;charset=UTF-8")
   * public Map<String, String> getAllConfig(@PathParam("appId") String appId);
   */
  public function getAppConfigList() {
    $urlParam = array($this->getAppId());
    array_unshift($urlParam, 'getallconfig');
    $url = implode('/', $urlParam);
    return $this->get(self::CONFIG_SERVICE_NAME, $url);
  }

  /**
   *
   * 添加配置信息
   * @param array $config
   * @return void
   * @POST
   * @Path("addconfig/{appId}/{authToken}")
   */
  public function addConfig(array $config) {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    array_unshift($urlParam, 'addconfig');
    $url = implode('/', $urlParam);
    return $this->post(self::CONFIG_SERVICE_NAME, $url, json_encode($config), 'application/json');
  }

  /**
   *
   * 删除配置信息
   * @param array $condition
   * @return return_type
   * @POST
   * @Path("deleteconfigbykey/{appId}/{authToken}/{jsonData}")
   * @Produces("text/plain")
   * public String deleteConfig(@PathParam("appId")String appid,
   * 							@PathParam("authToken") String authToken,
   * 							@PathParam("jsonData") String jsonData);
   */
  public function deleteConfig(array $condition) {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    array_unshift($urlParam, 'deleteconfigbykey');
    $url = implode('/', $urlParam);
    return $this->post(self::CONFIG_SERVICE_NAME, $url, json_encode($condition), 'application/json') ;
  }

  /**
   *
   * 删除App所有配置信息
   * @param array $condition
   * @return return_type
   * @GET
   * @Path("deleteallconfig/{appId}/{authToken}")
   * @Produces("text/plain")
   * public String deleteAllConfig(@PathParam("appId")String appid,
   * 							   @PathParam("authToken")String authToken);
   */
  public function deleteAppConfig() {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    array_unshift($urlParam, 'deleteallconfig');
    $url = implode('/', $urlParam);
    return $this->get(self::CONFIG_SERVICE_NAME, $url);
  }


  /**
   *
   * 更新配置信息
   * @param array $config
   * @return return_type
   * @PUT
   * @Path("updateconfig/{appId}/{authToken}")
   */
  public function updateConfig(array $config) {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    array_unshift($urlParam, 'updateConfig');
    $url = implode('/', $urlParam);
    return $this->put(self::CONFIG_SERVICE_NAME, $url, json_encode($config), 'application/json' );
  }
}