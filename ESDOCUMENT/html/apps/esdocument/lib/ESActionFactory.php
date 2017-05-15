<?php
/**
 * Action工厂，根据请求创建处理请求的实例对象
 * @author dengguoqi
 *
 */
class ESActionFactory
{
	/**
	 * 通过反射创建处理请求的实例对象
	 * @param unknown_type $app 应用对象
	 * @param unknown_type $controller 控制器名
	 * @param unknown_type $action 方法名
	 * @return object
	 */
	static function createAction($app, $controller='ESDefault', $action='index', $url='default')
	{
		try {
			// 添加Action后缀，查找对应类
			$controller .= 'Action';
			$controller = str_replace('.', '', $controller);
			$action = str_replace('.', '', $action);
			$reflection = new ReflectionClass($controller);
			return $reflection->newInstance($app, $controller, $action, $url);
		} catch (Exception $e) {
// 			return $e->getMessage();
			return AOP_NOT_FOUND;
		}
	}
	
}