<?php
/**
 * Action基类，处理通用的请求方法。
 * @author dengguoqi
 *
 */
class ESActionBase 
{
	private $app;
	private $appClass;
	private $methods = Array();
	private $appPath;
	private $libPath;
	private $tplPath;
	private $url;
	protected  $controller;
	protected  $action;
	function __construct($obj, $controller, $action='index', $url='default')
	{
		$this->app = $obj;
		$this->controller = $controller;
		$this->action = $action;
		$this->appClass = new ReflectionClass($obj);
		$this->libPath = dirname(__FILE__);
		$this->appPath = substr($this->libPath, 0, -4);
		$this->tplPath = $this->appPath.DIRECTORY_SEPARATOR.'templates';
		$this->url = $url;
	}
	/**
	 * 执行默认请求的方法
	 */
	public function execute()
	{
		try {
			$self = new ReflectionClass($this);
			if($self->hasMethod($this->action))
			{
				$method = $self->getMethod($this->action);
				$method->setAccessible(true); // 避免私有方法不猛访问
				return $method->invoke($this);
			} else {
				return $this->renderTemplate();
			}
		} catch (Exception $e) {
			// 返回异常信息，发布后修改
			return $e->__toString();
			//return AOP_NOT_FOUND;
		}
		
	}

	/**
	 * 渲染模版，
	 * @param unknown_type $parm 模版参数
	 * @param unknown_type $template 模版路径，默认以“控制器/Action方法”为路径查找
	 */
	protected function renderTemplate($parm=array(), $template=null)
	{
		if(!$template)
			$template = substr($this->controller, 0, -6).DIRECTORY_SEPARATOR.$this->action;
		$parm['esaction'] = $this;
		$parm['app'] = $this->app;
		if(is_file($this->tplPath.DIRECTORY_SEPARATOR.$template.'.phtml'))
		{
			return $this->exec('getView')->render($template, $parm);
		} else {
			return AOP_NOT_FOUND;
		}
	}
	/**
	 * 反射执行应用实例对象的方法
	 * @param unknown_type $method 方法名
	 * @param unknown_type $parm 参数
	 * @return multitype:
	 */
	public function exec($method, $parm='')
	{
		if(array_key_exists($method.$parm, $this->methods))
			return $this->methods[$method.$parm];
		$methodInstance = $this->appClass->getMethod ($method);
		$methodInstance->setAccessible(true);
		$this->methods[$method.$parm] = $methodInstance->invoke($this->app, $parm);
		return $this->methods[$method.$parm];
	}
	/**
	 * 反射执行应用实例对象的方法，数组参数方式
	 * @author dengguoqi 20121128
	 * @param unknown_type $method
	 * @param array $parm
	 * @return multitype:
	 */
	public function execArgs($method, array $parm)
	{
		$methodInstance = $this->appClass->getMethod ($method);
		$methodInstance->setAccessible(true);
		return $methodInstance->invokeArgs($this->app, $parm);
	}
	/**
	 * 根据参数生成URL
	 * @param unknown_type $path 数组参数，第一个键值对为“控制器=>方法”，后面为url参数
	 */
	public function generateUrl($path, $url = null)
	{
		$url = is_null($url)?$this->url:$url;
		if(is_array($path))
		{
			$i = 1;
			foreach ($path as $key=>$value)
			{
				switch ($i) {
					case 1:
						$url .= '/'.$key.'/'.$value;
					break;
					case 2:
						$url .= '?'.$key.'='.$value;
					break;
					default:
						$url .= '&'.$key.'='.$value;
					break;
				}
				$i++;
			}
		}
		return url($this->app->getUrl($url));
	}
	
	/**
	 * 返回当前登录用户对象
	 */
	public function getUser(){
		return $this->exec('getContext')->getUser();
	}
	
	/**
	 * 获取当前session
	 */
	function getSession(){
		return $this->exec('getContext')->getSession();
	}
	
	/**
	 * 获取当前请求对象
	 */
	function getRequest(){
		return $this->exec('getContext')->getRequest();
	}

	/**
	 * 获取当前应用实例
	 */
	function getAppInstance(){
		return $this->exec('getContext')->getAppInstance();
	}
	
	/**
	 * 获取多国语言翻译文本
	 * @param string $text 原语言文本
	 * @return string
	 */
	public function getText($text='')
	{
		return $text;
	}
	/**
	 * xiewenda
	 *
	 */
	final function uploadFile() {
		$error_code=$_FILES['file_txt']['error'];//上传错误代码
		switch ($error_code) {
			case UPLOAD_ERR_INI_SIZE:
				return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
			case UPLOAD_ERR_FORM_SIZE:
				return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
			case UPLOAD_ERR_PARTIAL:
				return 'The uploaded file was only partially uploaded';
			case UPLOAD_ERR_NO_FILE:
				return 'No file was uploaded';
			case UPLOAD_ERR_NO_TMP_DIR:
				return 'Missing a temporary folder';
			case UPLOAD_ERR_CANT_WRITE:
				return 'Failed to write file to disk';
			case UPLOAD_ERR_EXTENSION:
				return 'File upload stopped by extension';
		}
	
		$fileName=$_FILES['file_txt']['name'];//上传文件名称
		$fileInfo = pathinfo($fileName);
		$extension = strtolower($fileInfo['extension']);
		$randNum = mt_rand(10,99);
		$newFileName=date('YmdHis').$randNum.'.'.$extension;
		$tempPath=$_FILES['file_txt']['tmp_name'];//上传临时文件路径
		$filePath=$this->exec("getPublicPath");//上传根路径
		$today = getdate();
		if(!is_dir($filePath)){
			mkdir($filePath);
			chmod($filePath, 0777);
		}
		if(strlen($today['mon'])==1){
			$today['mon']='0'.$today['mon'];
		}
		if(strlen($today['mday'])==1){
			$today['mday']='0'.$today['mday'];
		}
		//拼接上传的子文件夹名为格式为 如：20141113
		$path = $today['year'].$today['mon'].$today['mday'];
		$targetDir=$filePath.'/'.$path;
		if(!is_dir($targetDir.'/')){
			mkdir($targetDir.'/');
			chmod($targetDir, 0777);
		}
		$targetPath=$targetDir.'/'.$newFileName;//目标目录
		if($error_code==UPLOAD_ERR_OK){
			if(move_uploaded_file($tempPath, $targetPath)){//上传文件
				return array('success'=>'true', 'filePath'=>"/".$targetPath, 'fileName'=>$fileName);
			}
		}
	}
	
	
	/**上传测试
	 * @author wangtao
	*/
	final function uploadImage($width, $height)
	{
		$error_code=$_FILES['file_txt']['error'];//上传错误代码
		switch ($error_code) {
			case UPLOAD_ERR_INI_SIZE:
				return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
			case UPLOAD_ERR_FORM_SIZE:
				return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
			case UPLOAD_ERR_PARTIAL:
				return 'The uploaded file was only partially uploaded';
			case UPLOAD_ERR_NO_FILE:
				return 'No file was uploaded';
			case UPLOAD_ERR_NO_TMP_DIR:
				return 'Missing a temporary folder';
			case UPLOAD_ERR_CANT_WRITE:
				return 'Failed to write file to disk';
			case UPLOAD_ERR_EXTENSION:
				return 'File upload stopped by extension';
		}
		$fileName=$_FILES['file_txt']['name'];//上传文件名称
		$fname = explode('.', $fileName); // @author:fangjixiang
		$fileInfo = pathinfo($fileName);
		$extension = strtolower($fileInfo['extension']);
		$randNum = mt_rand(10,99);
		$imageName=date('YmdHis').$randNum.'.'.$extension;
		$tempPath=$_FILES['file_txt']['tmp_name'];//上传临时文件路径
		$filePath=$this->exec("getPublicPath");//上传根路径
		if(!is_dir($filePath)){
			mkdir($filePath);
		}
		$today = getdate();
		$targetDir=$filePath.'/'.$today['year'];
		if(!is_dir($targetDir)){
			mkdir($targetDir);
		}
		if(strlen($today['mon'])==1){
			$today['mon']='0'.$today['mon'];
		}
		if(!is_dir($targetDir.'/'.$today['mon'])){
			mkdir($targetDir.'/'.$today['mon']);
		}
		$dir=$targetDir.'/'.$today['mon'];
		$targetPath=$dir.'/'.$imageName;//目标目录
		if($error_code==UPLOAD_ERR_OK){
			if(move_uploaded_file($tempPath,$targetPath)){
				$image= new ESImage($targetPath, $width, $height, $fname[0]);
				return $image->thumbSize();
			}
		}
	
	
	
	}
	/**
	 * @author wangtao
	 * @date 20130409
	 * 获取客户端的IP
	 */
	 protected function getClientIp()
	 {
	 	
	 	return $_SERVER['REMOTE_ADDR'];
	 }
}