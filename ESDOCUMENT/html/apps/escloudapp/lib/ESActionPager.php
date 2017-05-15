<?php
class ESActionPager{
/**
*int总页数
**/
protected $pageTotal;
/**
*int上一页
**/
protected $previous;
/**
*int下一页
**/
protected $next;
/**
*int中间页起始序号
**/
protected $startPage;
/**
*int中间页终止序号
**/
protected $endPage;
/**
*int记录总数
**/
protected $recorbTotal;
/**
*int每页显示记录数
**/
protected $pageSize;
/**
*int当前显示页
**/
protected $currentPage;
/**
*string基url地址
**/
protected $baseUri;

/**
*@returnstring获取基url地址
*/
public function getBaseUri(){
return$this->baseUri;
}

/**
*@returnint获取当前显示页
*/
public function getCurrentPage(){
return $this->currentPage;
}

/**
*@returnint获取每页显示记录数
*/
public function getPageSize(){
return $this->pageSize;
}

/**
*@returnint获取记录总数
*/
public function getRecorbTotal(){
return$this->recorbTotal;
}

/**
*@paramstring$baseUri设置基url地址
*/
public function setBaseUri($baseUri){
$this->baseUri=$baseUri;
}

/**
*@paramint$currentPage设置当前显示页
*/
public function setCurrentPage($currentPage){
$this->currentPage=$currentPage;
}

/**
*@paramint$pageSize设置每页显示记录数
*/
public function setPageSize($pageSize){
$this->pageSize=$pageSize;
}

/**
*@paramint$recorbTotal设置获取记录总数
*/
public function setRecorbTotal($recorbTotal){
$this->recorbTotal=$recorbTotal;
}

/**
*构造函数
**/
public function __construct()
{
$this->pageTotal=0;
$this->previous=0;
$this->next=0;
$this->startPage=0;
$this->endPage=0;

$this->pageSize=20;
$this->currentPage=0;
}

/**
*分页算法
**/
private function arithmetic(){
if($this->currentPage<1)
$this->currentPage=1;

$this->pageTotal=floor($this->recorbTotal/$this->pageSize)+($this->recorbTotal%$this->pageSize>0?1:0);

if($this->currentPage>1&&$this->currentPage>$this->pageTotal)
header('location:'.$this->baseUri.'page='.$this->pageTotal);

$this->next=$this->currentPage+1;
$this->previous=$this->currentPage-1;

$this->startPage=($this->currentPage+5)>$this->pageTotal?$this->pageTotal-10:$this->currentPage-5;
$this->endPage=$this->currentPage<5?11:$this->currentPage+5;

if($this->startPage<1)
$this->startPage=1;

if($this->pageTotal<$this->endPage)
$this->endPage=$this->pageTotal;
}

/**
*分页样式
**/

    
protected function pageStyle(){
$result="共".$this->pageTotal."页&nbsp;&nbsp;";

if($this->currentPage>1)
$result.="<a href=\"".$this->baseUri."page=1\">第1页</a>  <a href=\"".$this->baseUri."page=$this->previous\">前一页</a>";
else
$result.="第1页&nbsp;";

for($i=$this->startPage;$i<=$this->endPage;$i++){
if($this->currentPage==$i)
$result.="$i";
else
$result.="  <a href=\"".$this->baseUri."page=$i\">$i</a>  ";
}

if($this->currentPage!=$this->pageTotal){
$result.="<a href=\"".$this->baseUri."page=$this->next\">后一页</a>";
$result.="&nbsp;<a href=\"".$this->baseUri."page=$this->pageTotal\">最后1页</a>";
}else{
$result.="&nbsp;&nbsp;最后1页";
}
return $result;
}

/**
 *执行分页
 **/
public function execute(){
	if($this->baseUri!=""&&$this->recorbTotal==0)
		return"";
	$this->arithmetic();
	return $this->pageStyle();
}
}
?>
