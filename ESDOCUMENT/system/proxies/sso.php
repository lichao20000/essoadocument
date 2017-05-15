<?php
class ProxySso extends AgentProxyAbstract {

  /**
  *
  * Config服务名称
  * @var const
  */

  const SSO_SERVICE_NAME = 'authentication';

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
   * 获取当前已登录账号的密码信息[登录后才可以调用此接口]
   * @param $appid 应用系统账号编码
   * @param $password 应用系统账号密码
   * @param $accountid 已登录账号编码
   * @return 已登录账号密码信息
   *
   * @GET
    @Path("getaccountpwd/{appid}/{password}/{accountid}")
    @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
    public String getAccountidPassword(@PathParam("appid") String appid,@PathParam("password") String password,@PathParam("accountid") String accountid);

   */
  public function getUserPassword() {
    $urlParam = array($this->getAppId(), $this->getAppToken(), $this->getUserId());
    array_unshift($urlParam, 'getaccountpwd');
    $url = implode('/', $urlParam);
    return $this->get(self::SSO_SERVICE_NAME, $url);
  }

  /**
   *
   * 断言查询
   * @param unknown_type $token
   * @return return_type
   * @GET
   * @Path("validateAssertion/{assertCode}")
   * public String validateAssertion(@PathParam("assertCode")String assertCode) throws Exception;
   *
   * @GET
   * @Path("check_authentication")
   * @Produces(MediaType.TEXT_XML + ";chartset=UTF-8")
   * public String validateAssertion(@QueryParam("token") String assertCode,@QueryParam("appid") String appid,@Context HttpServletRequest request) ;
   */
  public function validateAssertion($token, $ssoAppId) {
    $url = 'check_authentication?token='.$token.'&appid='.$ssoAppId;
    return $this->get(self::SSO_SERVICE_NAME, $url);
  }

  /**
   * 获取在线人数
   * @GET
   @Path("onlineinfo")
   @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
   public String getOnlineInfo(@Context HttpServletRequest resquest);
   */
  public function getOnlineUsers() {
    $cacheId = 'onlineUsers';
    if($rs = cache::get($cacheId)){
      $fcache = $rs->data;
      return $fcache;
    }else{
      $urlParam = array();
      array_unshift($urlParam, 'onlineinfo');
      $url = implode('/', $urlParam);
      $rs = $this->get(self::SSO_SERVICE_NAME, $url);
      cache::set($cacheId, $rs, 60);
      return $rs;
    }
  }

  /**
   * 校验用户名密码是否正确
   *  @POST
      @Path("checkpwd/{userId}")
      @Consumes(MediaType.TEXT_PLAIN + ";charset=UTF-8")
      @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
      public Boolean checkPassword(@PathParam("userId") String userId,
                                   String password);
   */
  public function checkPassword($userId, $password)
  {
    $urlParam = array('checkpwd', $userId);
    $url = implode('/', $urlParam);
    $data = urlencode($password);
    return $this->post(self::SSO_SERVICE_NAME, $url, $data, 'text/plain;charset=UTF-8');
  }

  /**
   * 用户密码过期提醒，又如下状态以及说明如下：
      -1：密码已过期，强制修改。
      0-N：密码还有0-N天就过期
      100：正常状态。
      101：密码重置后，用户第一次登录，提示用户修改密码。
   * @GET
    @Path("checkpwdindate")
    @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
    public String checkPwdIndate(@Context HttpServletRequest request);
   */
  public function checkPwdIndate()
  {
    $urlParam = array($this->getUserId());
    array_unshift($urlParam, 'checkpwdindate');
    $url = implode('/', $urlParam);
    $rs = $this->get(self::SSO_SERVICE_NAME, $url);
    return $rs;
  }

  /**
   * 密码修改的历史记录查询
   * @GET
   */
  public function getPwdChangeLogs()
  {
    $urlParam = array($this->getUserId());
    array_unshift($urlParam, 'getpwdchangelogs');
    $url = implode('/', $urlParam);
    $rs = $this->get(self::SSO_SERVICE_NAME, $url);
    return $rs;
  }

  /**
   * 密码同步记录查询
   * @GET
   */
  public function getPwdSynchroList()
  {
    $urlParam = array($this->getUserId());
    array_unshift($urlParam, 'getpwdsynchrolist');
    $url = implode('/', $urlParam);
    $rs = $this->get(self::SSO_SERVICE_NAME, $url);
    return $rs;
  }
}
