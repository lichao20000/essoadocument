<?php
/**
 *
 * ProxyMongo
 * @author cheguoli
 *
 */
class ProxyMongo extends AgentProxyAbstract {

  /**
   *
   * Mongo服务名称
   * @var const
   */
  const MONGO_SERVICE_NAME = 'mongdbservice';

  /**
   *
   * 构造函数
   * @return void
   */
  public function __construct(array $appInfo) {
    parent::__construct($appInfo);
  }

  private function getStmtParams($collection, array $condition) {
    $arr = array(
      array('collection' => $collection),
      $condition
    );
    return json_encode($arr);
  }
  /**
   *
   * 复杂查询
   * @param array $stmt
   * @return array
   *
   * @GET
   * @Path("query/{appId}/{authToken}/{jsonData}")
   * @Produces(MediaType.TEXT_PLAIN + ";chartset=UTF-8")
   * public String query(@PathParam("appId") String appId, @PathParam("authToken") String authToken,
                        @PathParam("jsonData") String jsonQuery);
   */
  public function query($collection, array $condition) {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    //$urlParam = array('app1', $this->getAppToken());
    array_unshift($urlParam, 'query');
    $jsonData = $this->getStmtParams($collection, $condition);
    array_push($urlParam, urlencode($jsonData));
    $url = implode('/', $urlParam);    
    return $this->get(self::MONGO_SERVICE_NAME, $url);
  }

  /**
   *
   * 获取一条数据
   * @param array $stmt
   * @return object
   *
   * @GET
   * @Path("get/{appId}/{authToken}/{jsonData}")
   * @Produces(MediaType.TEXT_PLAIN + ";chartset=UTF-8")
   * public String get(@PathParam("appId") String appId, @PathParam("authToken") String authToken,
                      @PathParam("jsonData") String jsonData);
   */
  public function getOne($collection, array $condition) {
    $urlParam = array($this->getAppId(), $this->getAppToken(), json_encode($stmt));
    //$urlParam = array('app1', $this->getAppToken());
    array_unshift($urlParam, 'get');
    $jsonData = $this->getStmtParams($collection, $condition);
    array_push($urlParam, urlencode($jsonData));
    $url = implode('/', $urlParam);
    return $this->get(self::MONGO_SERVICE_NAME, $url);
  }

  /**
   *
   * 保存数据
   * @param array $stmt
   * @return boolean
   *
   * @POST
   * @Path("save/{appId}/{authToken}")
   * @Produces(MediaType.TEXT_PLAIN + ";chartset=UTF-8")
   * public String save(@PathParam("appId") String appId, @PathParam("authToken") String authToken,
                       String jsonData);
   */
  public function save($collection, array $condition) {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    //$urlParam = array('app1', $this->getAppToken());
    array_unshift($urlParam, 'save');
    $jsonData = $this->getStmtParams($collection, $condition);
    $url = implode('/', $urlParam);
    return $this->post(self::MONGO_SERVICE_NAME, $url, $jsonData, 'application/json');
  }

  /**
   *
   * 删除一条记录
   * @param array $stmt
   * @return boolean
   *
   * @GET
   * @Path("remove/{appId}/{authToken}/{jsonData}")
   * @Produces(MediaType.TEXT_PLAIN + ";chartset=UTF-8")
   * public String remove(@PathParam("appId") String appId,
                         @PathParam("authToken") String authToken,
                         @PathParam("jsonData") String jsonData);
   */
  public function clear($collection, array $condition) {
    $urlParam = array($this->getAppId(), $this->getAppToken());
    //$urlParam = array('app1', $this->getAppToken());
    array_unshift($urlParam, 'remove');
    $jsonData = $this->getStmtParams($collection, $condition);
    array_push($urlParam, urlencode($jsonData));
    $url = implode('/', $urlParam);
    return $this->get(self::MONGO_SERVICE_NAME, $url);
  }
}