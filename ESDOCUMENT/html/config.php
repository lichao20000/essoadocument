<?php
$config = array();
$config['cache.file.path'] = '/offline/feiyang';
$config['cache.lifetime'] = 3600;

$config['debug'] = true;
$config['router.static'] = false;

$config['template'] = 'cu';
//$config['frontpage'] = 'escloudapp';

$config['sso.appid'] = 'np046';
$config['sso.baseurl'] = 'http://127.0.0.1:8080/flyingoauth';
// $config['sso.login'] = 'http://127.0.0.1:8080/oauth/login.jsp?appid=%s&success=%s&error=%s&return=%s';
$config['sso.login'] = 'http://127.0.0.1:8080/flyingoauth/login.jsp';
$config['sso.logout'] = 'http://127.0.0.1:8080/flyingoauth/logout?returnUrl=%s';
/** xiaoxiong 20140506 设置用户注销后的跳转界面 **/
$config['sso.logoutReturnUrl'] = 'http://127.0.0.1';
//xiewenda 20150512 文件服务器部署的ip地址
$config['sso.fileServer'] = 'http://127.0.0.1:8080';
$config['defaultapp'] = 'esdocument';
//如果本地调试，使用本机的ip和端口
//$config['sso.error'] = 'http://127.0.0.1/user/error';
//服务器测试，则使用服务器的ip和端口
//$config['sso.error'] = 'http://16.187.151.69:89/user/error';

// 全部使用远程服务
// $config['service.baseurl'] = 'http://10.0.3.154:8080/eip_naming/rest/namingservice';
// 全部使用本地服务
// $config['service.baseurl'] = 'http://127.0.0.1:8080/eipmock/rest/namingservice-local';
// 平台服务使用远程，其他使用本地
$config['service.baseurl'] = 'http://127.0.0.1:8080/namingService/rest/namingService';

$config['nativemysql'] = array(
  'host' => '127.0.0.1',
  'user' => 'ccda',
  'passwd' => 'ccda',
);


$config['callback.user'] = 'java_server';
$config['callback.password'] = 'java_server';

$config['curl.proxy.host'] = '132.34.194.5';
$config['curl.proxy.port'] = 3128;
