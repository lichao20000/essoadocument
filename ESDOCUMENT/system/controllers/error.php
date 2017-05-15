<?php
class ErrorController extends AopController
{
  public function errorAction(Exception $e)
  {
    $view = $this->getView();
    // TODO 异常
    if ($e instanceof AppException) {
      // 应用异常
      return $view->render('error.phtml', array('title' => '应用异常', 'exception' => $e));
    } else if ($e instanceof Aop404Exception) {
      // 404 错误
      return $view->render('error404.phtml', array('exception' => $e));
    } else if ($e instanceof Aop403Exception) {
      // 403 错误
      return $view->render('error.phtml', array('title' => '无权访问', 'exception' => $e));
    } else if ($e instanceof Aop503Exception || $e instanceof AopDbException) {
      // 503 错误
      return $view->render('error503.phtml', array('exception' => $e));
    } else if ($e instanceof AopException) {
      // 通用平台错误
      return $view->render('error.phtml', array('title' => '平台错误', 'exception' => $e));
    } else {
      return $view->render('error.phtml', array('title' => '未知错误', 'exception' => $e));
    }
  }
}
