<?php
/**
 * 
 * @author wangtao
 * 自定义统计
 *
 */
class ESCustomStatisticsAction extends ESActionBase
{
	/**
	 * 
	 * @return string
	 */
	public function index()
	{
		return $this->renderTemplate();
	}
	/**@ajax请求的方法
	 * 添加面板
	 */
	public function add_panel()
	{
		return $this->renderTemplate();
	}
}