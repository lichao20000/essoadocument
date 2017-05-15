<?php
/**
 * 命名空间处理
 * @author dengguoqi
 *
 */
class ESNameSpaceAction extends ESActionBase
{
	public function index()
	{
		return 'fdsafdsafdsa';
	}
	public function html()
	{
		return $this->renderTemplate(Array('result'=>Array('a','b')));
	}
}
