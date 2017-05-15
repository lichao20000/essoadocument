<?php
class ServiceLog {

	private $_serviceUrl;
	private $_message;
	private $_method;
	private $_params;
	private $_contentType;
	private $_os;

	public function __construct($serviceUrl, $method, $params = '' , $contenttype = '', $message) {
		$this->_serviceUrl = $serviceUrl;
		$this->_message = $message;
		$this->_method = $method;
		$this->params = is_array($params) ? json_encode($params) : $params;
		$this->_contentType = $contenttype;
	}

	private function getOs() {
		if(strpos($_SERVER[HTTP_USER_AGENT], 'Linux')) {
			$os = 'Linux';
		} elseif(strpos($_SERVER[HTTP_USER_AGENT], 'Unix')) {
			$os = 'Unix';
		} else {	//其他统一做window处理
			$os = 'Window';
		}
		echo $os;
	}

	private function formatMessage () {
		global $user;
		$username = isset($user->id) ? $user->id : U_ANONYMOUS;
		$date = date("Y-m-d H:i:s");
		$message = 'INFO - {"user":"' . $username . '","time":"' . $date . '"}' . PHP_EOL .
		  'REQUEST - {"url":"' . $this->_serviceUrl . '", "method":"' . $this->_method .
		  '", "params":"' . $this->params . '", "content-type":"' . $this->_contentType . '"}' . PHP_EOL .
		  'RESPONSE - ' . $this->_message . PHP_EOL;
		return $message;
	}

	public function writeLog ($type = 'access') {
		$folderName = LOGPATH . '/' . date('Ym');
		$filename = $folderName . '/' . date('Ymd') . '.' . $type . '.log';
		if (!file_exists($folderName)) {
			mkdir($folderName, 0777);
		}
		$fp = fopen($filename, 'a');
		fwrite($fp, $this->formatMessage() . PHP_EOL);
		fclose($fp);
	}
}

/**
 * Class RestClient
 * Wraps HTTP calls using cURL, aimed for accessing and testing RESTful webservice.
 * By Diogo Souza da Silva <manifesto@manifesto.blog.br>
 */
class RestClient {

  private $curl ;
  private $url ;
  private $response ="";
  private $headers = array();

  private $method="GET";
  private $params=null;
  private $contentType = null;
  private $file =null;

  /**
   * Private Constructor, sets default options
   */
  private function __construct() {
    $this->curl = curl_init();
    curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($this->curl, CURLOPT_AUTOREFERER, true); // This make sure will follow redirects
    curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, true); // This too
    curl_setopt($this->curl, CURLOPT_HEADER, true); // THis verbose option for extracting the headers
    curl_setopt($this->curl, CURLOPT_TIMEOUT, AopConfig::get('service.timeout', 60));//curl执行过程超时
    curl_setopt($this->curl, CURLOPT_CONNECTTIMEOUT, AopConfig::get('service.connecttimeout', 60)); //请求连接超时，如果超时，则返回false

    //curl_setopt($this->curl, CURLOPT_DNS_USE_GLOBAL_CACHE, false);//nts才有的选项
    //curl_setopt($this->curl, CURLOPT_DNS_CACHE_TIMEOUT, 120);//
  }

 /**
  * Execute the call to the webservice
  * @return RestClient
  */
  public function execute() {
    if($this->method === "POST") {
      curl_setopt($this->curl,CURLOPT_POST,true);
      curl_setopt($this->curl,CURLOPT_POSTFIELDS,$this->params);
    } else if($this->method == "GET"){
      curl_setopt($this->curl,CURLOPT_HTTPGET,true);
      $this->treatURL();
    } else if($this->method === "PUT") {
      curl_setopt($this->curl,CURLOPT_PUT,true);
      $this->treatURL();
      $this->file = tmpFile();
      fwrite($this->file,$this->params);
      fseek($this->file,0);
      curl_setopt($this->curl,CURLOPT_INFILE,$this->file);
      curl_setopt($this->curl,CURLOPT_INFILESIZE,strlen($this->params));
    } else {
      curl_setopt($this->curl,CURLOPT_CUSTOMREQUEST,$this->method);
    }
    $headers = array(
      'Connection: keep-alive',
      'Keep-Alive: 300',
    );
    if (isset($this->contentType)) {
      $headers[] = 'Content-Type: ' . $this->contentType;
    }
    curl_setopt($this->curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($this->curl,CURLOPT_URL,$this->url);
    $r = curl_exec($this->curl);
    $this->treatResponse($r); // Extract the headers and response
    return $this ;
  }

  /**
   * Treats URL
   */
  private function treatURL(){
    if(is_array($this->params) && count($this->params) >= 1) { // Transform parameters in key/value pars in URL
      if(!strpos($this->url,'?'))
      $this->url .= '?' ;
      foreach($this->params as $k=>$v) {
        $this->url .= "&".urlencode($k)."=".urlencode($v);
      }
    }
    return $this->url;
  }

  /**
   *
   * Treats the Response for extracting the Headers and Response
   * @param unknown_type $r
   * @return return_type
   */
  private function treatResponse($r) {
    if ($r === false) {
      $this->headers['content-type'] = 'text/plain';
      $this->headers['code'] = '-100';
      $this->headers['message'] = '请求超时';
      $this->response = "请求超时,服务无响应";
      return;
    }
    if($r == null || strlen($r) < 1) {
      $this->headers['content-type'] = 'text/plain';
      $this->headers['code'] = '0';
      $this->headers['message'] = '服务无响应';
      $this->response = "";
      return;
    }
    $parts  = explode("\n\r",$r); // HTTP packets define that Headers end in a blank line (\n\r) where starts the body
    while(preg_match('@HTTP/1.[0-1] 100 Continue@',$parts[0]) or preg_match("@Moved@",$parts[0])) {
      // Continue header must be bypass
      for($i=1;$i<count($parts);$i++) {
          $parts[$i - 1] = trim($parts[$i]);
      }
      unset($parts[count($parts) - 1]);
    }
    preg_match("@Content-Type: ([a-zA-Z0-9-]+/?[a-zA-Z0-9-]*)@",$parts[0],$reg);// This extract the content type
    //modified by stephen chen 2012.1.17
    $this->headers['content-type'] = isset($reg[1]) ? $reg[1] : '';
    preg_match("@HTTP/1.[0-1] ([0-9]{3}) ([a-zA-Z ]+)@",$parts[0],$reg); // This extracts the response header Code and Message
    $this->headers['code'] = isset($reg[1])?$reg[1]:'0';
    $this->headers['message'] = isset($reg[2])?$reg[2]:'0';
    $this->response = "";
    for($i=1;$i<count($parts);$i++) {//This make sure that exploded response get back togheter
      if($i > 1) {
        $this->response .= "\n\r";
      }
      $this->response .= $parts[$i];
    }
  }

  /**
   *
   * 获取header信息
   * @return array
   */
  public function getHeaders() {
    return $this->headers;
  }

  /**
   *
   * 获取response信息
   * @return string
   */
  public function getResponse() {
    return $this->response ;
  }

  /**
   *
   * 获取Code信息
   * @return int
   */
  public function getResponseCode() {
    return isset($this->headers['code']) ? (int) $this->headers['code'] : '-1';
  }

  /**
   *
   * HTTP response message (Not Found, Continue, etc )
   * @return string
   */
  public function getResponseMessage() {
    return isset($this->headers['message']) ? (int) $this->headers['message'] : '服务无响应';
  }

  /**
   *
   * Content-Type (text/plain, application/xml, etc)
   * @return string
   */
  public function getResponseContentType() {
    return $this->headers['content-type'];
  }

  /**
   *
   * This sets that will not follow redirects
   * @return RestClient
   */
  public function setNoFollow() {
    curl_setopt($this->curl,CURLOPT_AUTOREFERER,false);
    curl_setopt($this->curl,CURLOPT_FOLLOWLOCATION,false);
    return $this;
  }

  /**
   *
   * This closes the connection and release resources
   * @return RestClient
   */
  public function close() {
    curl_close($this->curl);
    $this->curl = null ;
    if($this->file !=null) {
      fclose($this->file);
    }
    return $this ;
  }

  /**
   *
   * Sets the URL to be Called
   * @param string $url
   * @return RestClient
   */
  public function setUrl($url) {
   $this->url = $url;
   return $this;
  }

  /**
   *
   * Set the Content-Type of the request to be send
   * Format like "application/xml" or "text/plain" or other
   * @param string $contentType
   * @return RestClient
   */
  public function setContentType($contentType) {
    $this->contentType = $contentType;
    return $this;
  }

  /**
   *
   * Set the Credentials for BASIC Authentication
   * @param string $user
   * @param string $pass
   * @return RestClient
   */
  public function setCredentials($user,$pass) {
    if($user != null) {
      curl_setopt($this->curl,CURLOPT_HTTPAUTH,CURLAUTH_BASIC);
      curl_setopt($this->curl,CURLOPT_USERPWD,"{$user}:{$pass}");
    }
    return $this;
  }

  /**
   *
   * Set the Request HTTP Method
   * For now, only accepts GET and POST
   * @param string $method
   * @return RestClient
   */
  public function setMethod($method) {
    $this->method=$method;
    return $this;
  }

  /**
   *
   * Set Parameters to be send on the request
   * It can be both a key/value par array (as in array("key"=>"value"))
   * or a string containing the body of the request, like a XML, JSON or other
   * Proper content-type should be set for the body if not a array
   * @param mixed $params
   * @return RestClient
   */
  public function setParameters($params) {
    $this->params=$params;
    return $this;
  }

  /**
   *
   * Creates the RESTClient
   * @param string $url=null [optional]
   * @return RestClient
   */
  public static function createClient($url=null) {
    $client = new RestClient ;
    if($url != null) {
      $client->setUrl($url);
    }
    return $client;
  }

  /**
   *
   * Convenience method wrapping a commom POST call
   * @param string $url
   * @param mixed $params
   * @param string $user=null [optional]
   * @param string $password=null [optional]
   * @param string $contentType="multpary/form-data" [optional] commom post (multipart/form-data) as default
   * @return RestClient
   */
  public static function post($url,$params=null,$user=null,$pwd=null,$contentType="multipart/form-data") {
    return self::call("POST",$url,$params,$user,$pwd,$contentType);
  }

  /**
   *
   * Convenience method wrapping a commom PUT call
   * @param string $url
   * @param string $body
   * @param string $user=null [optional]
   * @param string $password=null [optional]
   * @param string $contentType=null [optional]
   * @return RestClient
   */
  public static function put($url,$body,$user=null,$pwd=null,$contentType=null) {
    return self::call("PUT",$url,$body,$user,$pwd,$contentType);
  }

  /**
   *
   * Convenience method wrapping a commom GET call
   * @param string $url
   * @param array $params
   * @param string $user=null [optional]
   * @param string $password=null [optional]
   * @return RestClient
   */
  public static function get($url,array $params=null,$user=null,$pwd=null) {
    return self::call("GET",$url,$params,$user,$pwd);
  }

  /**
   *
   * Convenience method wrapping a commom PUT call
   * @param string $url
   * @param array $params
   * @param string $user=null [optional]
   * @param string $password=null [optional]
   * @return return_type
   */
  public static function delete($url,array $params=null,$user=null,$pwd=null) {
    return self::call("DELETE",$url,$params,$user,$pwd);
  }

  /**
   *
   * Convenience method wrapping a commom custom call
   * @param string $method
   * @param string $url
   * @param string $body
   * @param string $user=null [optional]
   * @param string $password=null [optional]
   * @param string $contentType=null [optional]
   * @return RestClient
   */
  public static function call($method, $url, $body, $user = null, $pwd = null, $contentType = null) {
  	$counter = min(max(intval(AopConfig::get('service.retry', 1)), 1), 5);
    timer();
  	do {
	    $result = self::createClient($url)
        ->setParameters($body)
        ->setMethod($method)
        ->setCredentials($user,$pwd)
        ->setContentType($contentType)
        ->execute()
        ->close();
      // 计时器
      $servicetime = timer();
    	$message = '{"code":"' . $result->getResponseCode() .
    		'", "content-type":"' . $result->getResponseContentType() .
    		'", "message":"' . $result->getResponseMessage() .
    		'", "reponse":"' . trim($result->getResponse()) .
    		'", "time":"' . $servicetime . '"}';

    	if ($result->getResponseCode() != '200') {	//错误日志
    		$serviceLog = new ServiceLog($url, $method, $body, $contentType, $message);
    		$serviceLog->writeLog('error');
    	} else if (AopConfig::get('debug', false)) {
    		/** xiaoxiong 20140828 暂时将成功日志去掉 **/
//     		$serviceLog = new ServiceLog($url, $method, $body, $contentType, $message);
//     		$serviceLog->writeLog('access');
    	}
    	if (($slowlog = AopConfig::get('service.slowlog', false)) && $servicetime >= $slowlog) {
    		$serviceLog = new ServiceLog($url, $method, $body, $contentType, $message);
    		$serviceLog->writeLog('slow');
    	}

	   	if (is_object($result) && ($code = $result->getResponseCode()) && $code != '') {
	    	return $result;
	    }
	    --$counter;

  	} while ($counter);
  	throw new AopException('java服务调用失败！', 4, '-1', $result);
  }
}

/**
 *
 * ProxyAbstract抽象类
 * @author cheguoli
 *
 */
abstract class ProxyAbstract
{
}

/**
 *
 * AgentProxyAbstract抽象类
 * @author cheguoli
 *
 */
abstract class AgentProxyAbstract extends ProxyAbstract
{
  /**
   * WebAPP数组信息
   * @var array
   */
  private $_appInfo;

  /**
   * 用户数组信息
   * @var array
   */
  private $_userInfo;

  protected $_baseUrl = null;

  private $_result = null;

  /**
   *
   * 构造函数
   * @param array $appInfo
   * @param int $productType
   * @return void
   */
  public function __construct(array $appInfo)
  {
    global $user;
    $this->_appInfo = $appInfo;
    $this->_userInfo = array(
      'user_id' => isset($user->id) ? $user->id : U_ANONYMOUS,
      'bigOrgId' => isset($user->bigOrgId) ? $user->bigOrgId : 0,
      'user_token' => 'usertoken',
    );
  }

  /**
   *
   * 获取应用的服务地址
   * @param string $service 服务名称
   * @return string
   */
  private function getBaseUri($service)
  {
		if (strtolower($service) == 'authentication') {
      return AopConfig::get('sso.baseurl');
    } else if(isset($this->_baseUrl) && strlen($this->_baseUrl) > 0) {
      return $this->_baseUrl;
    }
    // 会话缓存地址
    if (!isset($_SESSION['baseurls'])) {
      $_SESSION['baseurls'] = array();
    }
    /** xiaoxiong 20141013 完善一个用户拥有多个SAAS系统的访问权限时的请求地址的获取 **/
    $saasid = 0 ;
    if("orderservice" != $service){
    	$saasid = $this->_userInfo['bigOrgId'] ;
    }
    
    if (!isset($_SESSION['baseurls'][$service."_".$saasid])) {
      $baseUrl = AopConfig::get('service.baseurl');
      /** xiaoxiong 20140913 判断是否为基础服务，如果为基础服务时，获取0的数据 **/
      if("orderservice" == $service){
	      $searchUrl = $baseUrl . '/findApp/0/' . $service . '/' . $this->_appInfo['appid'] . '/' . (isset($this->_userInfo['user_id']) ? $this->_userInfo['user_id'] : U_ANONYMOUS);
      } else {
	      $searchUrl = $baseUrl . '/findApp/'.$this->_userInfo['bigOrgId'].'/' . $service . '/' . $this->_appInfo['appid'] . '/' . (isset($this->_userInfo['user_id']) ? $this->_userInfo['user_id'] : U_ANONYMOUS);
      }
      //echo $searchUrl;
      $result = RestClient::get($searchUrl);
      $serviceUrl = $this->_getRestUrlResult($result, $searchUrl);
      if($serviceUrl === ''){
        $message = $service . '&#26381;&#21153;&#22320;&#22336;&#27809;&#25214;&#21040;&#65292;&#35831;&#32852;&#31995;&#31649;&#29702;&#21592;&#65281;';//服务地址没找到，请联系管理员！
        die($message);
      } else {
	  	$_SESSION['baseurls'][$service."_".$saasid] = $serviceUrl;
      }
    }
    return $_SESSION['baseurls'][$service."_".$saasid];
  }

  /**
   *
   * 获取接口的服务地址
   * edit wanghongchen 修改为public
   * @param string $service	应用名称
   * @param string $relativeUrl 接口相对地址
   * @return string
   */
  public function getUri($service, $relativeUrl) {
  	if (strtolower($service) == 'thirdparty') {
			return $relativeUrl;
  	}
    $baseUrl = $this->getBaseUri($service);

    return $baseUrl . '/' . $relativeUrl;
  }

  protected function getResult(){
    return $this->_result;
  }

  /**
   * xiaoxiong 20140822
   * 添加获取REST服务请求的独有方法，为了处理REST服务获取不到提示信息
   * @param RestClient $result
   * @throws AopException
   * @return return_type
   */
  private function _getRestUrlResult(RestClient &$result, $serviceUrl = '') {
    $this->_result = $result;
    if(method_exists($this, 'hook_response')){
      return $this->hook_response($result);
    }
    $code = $result->getResponseCode();
    $contentType = $result->getResponseContentType();
    $message = $result->getResponseMessage();
    $response = trim($result->getResponse());

    switch ($code) {
      case '200':
        if ($contentType == 'application/json') {
          $return = json_decode($response);
        } else {
          $return = $response;
        }
        break;
      default:
        return "";
    }
    unset($result);
    return $return;
  }

  /**
   *
   * 统一处理返回结果
   * @param RestClient $result
   * @throws AopException
   * @return return_type
   */
  private function _getResult(RestClient &$result, $serviceUrl = '') {
    $this->_result = $result;
    if(method_exists($this, 'hook_response')){
      return $this->hook_response($result);
    }
    $code = $result->getResponseCode();
    $contentType = $result->getResponseContentType();
    $message = $result->getResponseMessage();
    $response = trim($result->getResponse());

    switch ($code) {
      case '200':
        if ($contentType == 'application/json') {
          $return = json_decode($response);
        } else {
          $return = $response;
        }
        break;
      default:
        throw new Aop503Exception('Code' . $code . ':' . $message, 4, $code, $result);
      	break;
    }
    unset($result);
    return $return;
  }

  public function get($service, $url, array $param = null) {
    $url = $this->getUri($service, $url);
    $result = RestClient::get($url, $param);
    return $this->_getResult($result);
  }

  public function delete($service, $url, array $param = null) {
    $url = $this->getUri($service, $url);
    $result = RestClient::delete($url,$param);
    return $this->_getResult($result);
  }

  public function post($service, $url, $params=null, $contentType="multipart/form-data") {
    $url = $this->getUri($service, $url);
    $result = RestClient::post($url, $params, '', '', $contentType);
    return $this->_getResult($result);
  }

  public function put($service, $url, $body, $contentType = null) {
    $url = $this->getUri($service, $url);
    $result = RestClient::put($url, $body, '', '', $contentType);
    return $this->_getResult($result);
  }

  public function remove($service, $url, array $params=null) {
    $url = $this->getUri($service, $url);
    $result = RestClient::delete($url, $params);
    return $this->_getResult($result);
  }

  public function getAppId() {
  	return $this->_appInfo['appid'];
  }

  public function getAppToken() {
    return $this->_appInfo['apptoken'];
  }

  public function getUserId() {
    return $this->_userInfo['user_id'];
  }

  public function getUserToken() {
    return $this->_userInfo['user_token'];
  }
}

/**
 *
 * LocalProxyAbstract抽象类
 * @author cheguoli
 *
 */
abstract class LocalProxyAbstract extends ProxyAbstract
{
}
