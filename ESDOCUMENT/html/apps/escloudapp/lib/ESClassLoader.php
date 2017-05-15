<?php
/**
 * 类加载器
 * @author dengguoqi
 *
 */
class ESClassLoader
{
	static $loader;
	
	function __construct()
	{
		spl_autoload_register(Array('ESClassLoader', 'autoLoad'));
	}
	/**
	 * 类的自动加载方法。
	 * @param unknown_type $className 类名
	 */
	static function autoLoad($className)
	{
		$libPath = dirname(__FILE__);
		$appPath = substr($libPath, 0, -4);
		$controllersPath = $appPath.DIRECTORY_SEPARATOR.'controllers';
		
		if(strtolower(substr($className, -6)) == 'action')
		{
			include_once $controllersPath.DIRECTORY_SEPARATOR.$className.'.php';
		} else {
			include_once $libPath.DIRECTORY_SEPARATOR.$className.'.php';
		}
	}
	/**
	 * 注册类的自动加载方法。
	 */
	static function registerAutoload()
	{
		if(!self::$loader)
			self::$loader = new ESClassLoader();
	}
}