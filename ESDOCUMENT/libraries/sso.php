<?php
class SSO
{
  public static function getSSOConfig()
  {
    return array(
      'ssoLoginPost' => AopConfig::get('sso.login'),
      'ssoLoginSuccessPath' => url('user/token', TRUE),
      'ssoLoginErrorPath' => url('user/loginerr', TRUE),
      'ssoCaptchaPath' => AopConfig::get('sso.imagecaptcha'),
      'ssoValidateTokenPath' => AopConfig::get('sso.check'),
    );
  }

  /**
   * Validate the SSO login token.
   * @param string $postToken Equals $_Post['token']
   * @return $token
   */
  public static function getSSOToken( $postToken )
  {
    AopCore::loadLibrary('saml2xml');

    $token = $postToken;
    $xml = SAML_XmlToArray::xml2array($token);
    $token = $xml['SOAP-ENV:Body'][0]['samlp:AssertionIDRequest'][0]['saml:AssertionIDRef']['__v'];

    //@todo Validate token xml format is right.
    //@todo Validate token cert is right.

    return $token;
  }

  static public function getAssert($token)
  {
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
    $sso = $system->getProxyInstance('sso');
    $result = $sso->validateAssertion($token, AopConfig::get('sso.appid'));
    return trim($result);
  }

  static public function validateAssert($assert)
  {
    $doc = new DOMDocument();
    $doc->loadXML($assert);

    //@todo Validate the assert is right.
//     $statusCode = $doc->getElementsByTagName('StatusCode')->item(0)->attributes->getNamedItem('Value')->nodeValue;
//     $statusValues = explode(':', $statusCode);
//     if ($statusValues[7] != 'Success') {
//       echo 'The check_auth fail: ' . $statusValues[7];
//       return FALSE;
//     }
    $nameId = trim($doc->getElementsByTagName('NameID')->item(0)->nodeValue);
    $nameIdValues = explode(',', $nameId);
//     echo '$nameId: ' . $nameId;
    //${accountid!''},${name!''},${userStatus!''},${mail!''},${deptname!''},${orgname!''},${firstname!''},${lastname!''},${userId!''},${mainflag!''}
//     self::registerUser($nameIdValues[0], $nameIdValues[1], $nameIdValues[6], $nameIdValues[2], $nameIdValues[5], $nameIdValues[4], $nameIdValues[3],$nameIdValues[8],$nameIdValues[9],$nameIdValues[10],$nameIdValues[11]);
    self::registerUser($nameIdValues[0], $nameIdValues[1], $nameIdValues[2], $nameIdValues[3], $nameIdValues[4]);

    return TRUE;
  }

  static public function registerUser($accountId, $userName, $userStatus, $saasId, $pass, $extra = array())
  {
    global $user;
    if(!isset($user->id)){
    	$user = new stdClass() ;
    }
    $user->id = trim($accountId);  //帐号id，用来做鉴权
    $user->loginName = trim($accountId);
    $user->userName = trim($userName);
//     $user->desc = $orgName;
//     $user->dept = $deptName;
    $user->status = $userStatus;
    $user->pass = $pass;
//     $user->email = $email;
    //$user->uid = $userid;  //主要做查询用
    $user->mainSite = '0';  //TODO 此值已经没有了，以后后安排人员将其删除
    $user->bigOrgId = $saasId;

    //获取user其他信息
    AopCore::loadLibrary('app');
    $appInfo = AopApp::getInfo('system');
    $system = AopApp::getInstance($appInfo);
//     $userProxy = $system->getProxyInstance('user');
    $user->isLeader = false;
//     //获取用户可以访问的资源
//     $authProxy = $system->getProxyInstance('auth');
//     $user->resources = $authProxy->getResourceListByUid($user->id);
    /** xiaoxiong 20141016 记录登录日志 **/
    try {
	    $localData = json_encode(array('userid'=>$user->id,'ip'=>$_SERVER['REMOTE_ADDR'],'type'=>'login'));
	    $proxy=$system->getProxyInstance('log');
	    $proxy->saveLog($localData);
    } catch (Exception $e) {
    	print "essoaapp项目未启动！";
    }
    
    
    foreach ($extra as $key => $value) {
      $user->$key = $value;
    }
  }

  static public function errorMsg($errCode)
  {
    switch ($errCode) {
      case 1:
        $msg = 'Username or password is wrong.';
        break;
      default:
        $msg = 'Unknown error.';
        break;
    }
    return $msg;
  }
}