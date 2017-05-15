<?php
define('U_ANONYMOUS', 'U_ANONYMOUS');

function timer()
{
  static $timer = null;
  if (!isset($timer)) {
    $timer = microtime(true);
    return 0;
  } else {
    $startTimer = $timer;
    $timer = microtime(true);
    return $timer - $startTimer;
  }
}

function anonymousUser($sid = null)
{
  $user = new stdClass();
  $user->id = U_ANONYMOUS;
  $user->sid = isset($sid) ? $sid : session_id();
  return $user;
}

function isLogin()
{
	global $user;
	return isset($user) && isset($user->id) && $user->id != U_ANONYMOUS;
}

function makedir($path, $root = DOCROOT)
{
  $path = explode('/', trim($path, '/'));
  while ($dir = array_shift($path)) {
    $root .= '/' . $dir;
    if (!is_dir($root)) {
      mkdir($root);
    }
  }
}

function url($path, $includeDomain = false)
{
  static $domainUrl;
  if (!isset($domainUrl)) {
    $domainUrl = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https' : 'http') . '://' .
      strtolower($_SERVER['HTTP_HOST']);
  }
  
  if (!strcasecmp(substr($path, 0, 7), 'http://') || !strcasecmp(substr($path, 0, 8), 'https://')) {
    return $path;
  }
  //echo $domainUrl;
  return ($includeDomain ? $domainUrl : '') . $GLOBALS['basePath'] . ltrim($path, '/');
}

function gotoUrl($path, $httpCode = 302)
{
  if (ENV != 'WEB') {
    return;
  }
  if (strcasecmp('http://', substr($path, 0, 7)) && strcasecmp('https://', substr($path, 0, 8))) {
    $path = url($path, false);
  }
  header('Location: ' . $path, true, $httpCode);
  exit;
}

/**
 * 截取字段
 * @param string $str
 * @param int $start
 * @param int $length  字符或者汉字个数
 */
function utf8_substr($str, $start, $length) {
  if (function_exists('mb_substr')) {
    return mb_substr($str, $start, $length, 'UTF-8');
  }
  preg_match_all("/./u", $str, $arr);
  return implode("", array_slice($arr[0], $start, $length));
}

/**
 *
 * @param int $page 当前页 默认为1
 * @param int $total 记录总条数
 * @param int $size 每页限制条数 默认为10
 */
/**
 *
 * @param int $page 当前页 默认为1
 * @param int $total 记录总条数
 * @param string $param 参数 格式：&param1=a&param2=b
 * @param int $size 每页限制条数 默认为10
 * @param string $style
 */
function paginator($page = 1, $total, $param = '',$size = 10, $style = "default") {
  $pageInfo = new stdClass();
  $totalPage = ceil((float)$total/(float )$size);
  $page = min(max($page, 1), $totalPage);
  $pageInfo->curPage = $page;
  $pageInfo->totalPage = $totalPage;
  if($total > 0){
    $pageInfo->start = (($page > 0) ? ($page - 1) * $size : 0) + 1;
  } else {
   $pageInfo->start = 0;
  }
  if ($pageInfo->curPage == $pageInfo->totalPage) {
    $pageInfo->end = $total;
  } else {
    $pageInfo->end = $pageInfo->curPage * $size;
  }
  $pageInfo->total = $total;
  $pageInfo->pre = $page - 1;
  $pageInfo->next = $page + 1;

  //视图显示
  if ($style == 'default') {
    $html = '<div style="float:left;"><span class="bold font14">'.$pageInfo->start.'-'.$pageInfo->end.'</span> <span>of</span> <span class="bold font14">'.$pageInfo->total.'</span></div>';

    if($pageInfo->pre > 0) {
      $html .= '<div class="but1 butNoBg margin0"><a class="but_pagePre" href="'.$param.'&page='.$pageInfo->pre.'" title="上一页"></a></div>';
    } else {  //不能点击
      $html .= '<div class="but2 butNoBg margin0"><span class="but_pagePre"></span></div>';
    }
    if ($pageInfo->next <= $pageInfo->totalPage) {
      $html .= '<div class="but1 butNoBg margin0"><a class="but_pageNext" href="'.$param.'&page='.$pageInfo->next.'" title="下一页"></a></div>';
    } else {  //不能点击
      $html .= '<div class="but2 butNoBg margin0"><span class="but_pageNext"></span></div>';
    }
  } elseif ($style == 'task') {
    //增加每页显示数量
    $html ='<div id="dispalyNumber"><span>每页显示:</span>';
    if($size != 10){
      $url = $param.'&pagesize=10&page=1';
      //$html .= '<span><a onclick="savePageSize(\'10\',\''.$url.'\');" href="'.$param.'&pagesize=10&page=1">10</a></span>';
      $html .= '<span><a onclick="savePageSize(\'10\',\''.$url.'\');" href="javascript:void(0);">10</a></span>';
    } else {
      $html .= '<span class="selA">10</span>';
    }
    if($size != 25){
      $url = $param.'&pagesize=25&page=1';
      //$html .= '<span><a href="'.$param.'&pagesize=25&page=1">25</a></span>';
      $html .= '<span><a onclick="savePageSize(\'25\',\''.$url.'\');" href="javascript:void(0);">25</a></span>';
    } else {
      $html .= '<span class="selA">25</span>';
    }
    if($size != 50){
      $url = $param.'&pagesize=50&page=1';
      //$html .= '<span><a href="'.$param.'&pagesize=50&page=1">50</a></span>';
      $html .= '<span><a onclick="savePageSize(\'50\',\''.$url.'\');" href="javascript:void(0);">50</a></span>';
    } else {
      $html .= '<span class="selA">50</span>';
    }
    $html .='</div>';

    $html .= '<div style="float:left;"><span class="bold font14">'.$pageInfo->start.'-'.$pageInfo->end.'</span> <span>of</span> <span class="bold font14">'.$pageInfo->total.'</span></div>';

    if($pageInfo->pre > 0) {
      $html .= '<div class="but1 butNoBg margin0"><a class="but_pagePre" href="'.$param.'&pagesize='.$size.'&page='.$pageInfo->pre.'" title="上一页"></a></div>';
    } else {  //不能点击
      $html .= '<div class="but2 butNoBg margin0"><span class="but_pagePre"></span></div>';
    }
    if ($pageInfo->next <= $pageInfo->totalPage) {
      $html .= '<div class="but1 butNoBg margin0"><a class="but_pageNext" href="'.$param.'&pagesize='.$size.'&page='.$pageInfo->next.'" title="下一页"></a></div>';
    } else {  //不能点击
      $html .= '<div class="but2 butNoBg margin0"><span class="but_pageNext"></span></div>';
    }

  }
  return $html;
}


function paginator_new($page = 1, $total, $param = '',$size = 10, $style = "default"){
  $config = array('prev'=>'上一页','next'=>'下一页','first'=>'首页','last'=>'最后页');
  $pageInfo = new stdClass();
  $pageInfo->config = $config;
  $pageInfo->totalRows = $total;
  $pageInfo->parameter = $param;
  $pageInfo->rollPage = 15;
  $pageInfo->listRows = $size;
  $pageInfo->totalPages = ceil($pageInfo->totalRows/$pageInfo->listRows);     //总页数
  $pageInfo->coolPages  = ceil($pageInfo->totalPages/$pageInfo->rollPage);
  $pageInfo->nowPage  = $page;
  $pageInfo->config['last'] = '';
  //$pageInfo->setConfig('last','... '.$pageInfo->totalPages);

  if(!empty($pageInfo->totalPages) && $pageInfo->nowPage>$pageInfo->totalPages) {
   $pageInfo->nowPage = $pageInfo->totalPages;
  }
  $pageInfo->firstRow = $pageInfo->listRows*($pageInfo->nowPage-1);

  if(0 == $pageInfo->totalRows || $pageInfo->totalPages == 1) return;
  $nowCoolPage = ceil($pageInfo->nowPage/$pageInfo->rollPage);
  $url = $pageInfo->parameter;

  //上下翻页字符串
  $upRow   = $pageInfo->nowPage-1;
  $downRow = $pageInfo->nowPage+1;
  if ($upRow>0){
   $upPage="<a href='".$url."&page=$upRow'>".$pageInfo->config['prev']."</a>";
  }else{
   $upPage="<span class=\"disabled\">".$pageInfo->config['prev']."</span>";
  }

  if ($downRow <= $pageInfo->totalPages){
   $downPage="<a href='".$url."&page=$downRow'>".$pageInfo->config['next']."</a>";
  }else{
   $downPage="<span class=\"disabled\">".$pageInfo->config['next']."</span>";
  }
  // << < > >>
  if($nowCoolPage == 1){
   $theFirst = "";
   $prePage = "";
  }else{
   $preRow =  $pageInfo->nowPage-$pageInfo->rollPage;
   $prePage = "<a href='".$url."&page=$preRow' >上".$pageInfo->rollPage."页</a>";
   $theFirst = "<a href='".$url."&page=1' class='first' >".$pageInfo->config['first']."</a>";
  }
  if($nowCoolPage == $pageInfo->coolPages){
   $nextPage = "";
   $theEnd="";
  }else{
   $nextRow = $pageInfo->nowPage+$pageInfo->rollPage;
   $theEndRow = $pageInfo->totalPages;
   $nextPage = "[<a href='".$url."&page=$nextRow' >下".$pageInfo->rollPage."页</a>]";
   $theEnd = "<a href='".$url."&page=$theEndRow' class='last' >".$pageInfo->config['last']."</a>";
  }
  // 1 2 3 4 5
  $linkPage = "";
  for($i=1;$i<=$pageInfo->rollPage;$i++){
   $page=($nowCoolPage-1)*$pageInfo->rollPage+$i;
   if($page!=$pageInfo->nowPage){
    if($page<=$pageInfo->totalPages){
     $linkPage .= "<a href='".$url."&page=$page'>[".$page."]</a>";
    }else{
     break;
    }
   }else{
    if($pageInfo->totalPages != 1){
     $linkPage .= "<span class='current'>[".$page."]</span>";
    }
   }
  }
  $pageStr = $theFirst.$upPage.$linkPage.$downPage.$theEnd;
  return $pageStr;

}

function random($length = 10, $numeric = 0) {
    $seed = base_convert(md5(microtime().$_SERVER['DOCUMENT_ROOT']), 16, $numeric ? 10 : 35);
    $seed = $numeric ? (str_replace('0', '', $seed).'012340567890') : ($seed.'zZ'.strtoupper($seed));
    $hash = '';
    $max = strlen($seed) - 1;
    for($i = 0; $i < $length; $i++) {
        $hash .= $seed{mt_rand(0, $max)};
    }
    return $hash;
}
/**
 * 格式化待办待阅时间
 * @param string $date
 */
function formatDate($date){
  return date('Y-m-d H:i:s', strtotime($date));
}

function flashUpload(){
  require_once DOCROOT. "/apps/comment/templates/fupload/index.php";
}

function paginationOne($count,$pagesize, $url, $auto = true) {
  $totalpage = intval($count / $pagesize);
  if ($count % $pagesize !== 0 ) $totalpage++;
  if ($totalpage < 2) return '';
  $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
  if ($page < 1) $page = 1;
  else if ($page > $totalpage) $page = $totalpage;

  //$pagination = '<div class="topTabPage">';
  if ($page>1) {
    $pagination .= '<div class="but1 butNoBg margin0 padding0"><a href="'.$url.'&page='.($page-1).'" class="but_pagePre" title="上一页"></a></div>';
  } else {
    $pagination .= '<div class="but2 butNoBg margin0 padding0"><div class="but_pagePre" title="上一页"></div></div>';
  }
  $pagination .= '<div id="pageNumberBox">';
  if($totalpage <= 3) {
    for($i=1;$i<=$totalpage;$i++) {
      if ($page == $i) {
        $pagination .= '<div  class="currentpage">'.$i.'</div>';
      } else {
        $pagination .= '<a href="'.$url.'&page='.$i.'">'.$i.'</a>';
      }
    }
  } elseif($totalpage > 3) {
    if ($page < 3) {
      for ($counter = 1; $counter <= 2; $counter++)
        {
          if ($counter == $page){
            $pagination .= '<div  class="currentpage">'.$counter.'</div>';
          } else {
            $pagination.= '<a href="'.$url.'&page='.$counter.'">'.$counter.'</a>';
          }
        }
        $pagination.= '<div class="ellipsis">...</div>';
        $pagination.= '<a href="'.$url.'&page='.$totalpage.'">'.$totalpage.'</a>';
    } else {
      if ($totalpage - $page >= 2) {
        $pagination.= '<a href="'.$url.'&page=1">1</a>';
        $pagination.= '<div class="ellipsis">...</div>';
        $pagination .= '<div  class="currentpage">'.$page.'</div>';
        $pagination.= '<div class="ellipsis">...</div>';
        $pagination.= '<a href="'.$url.'&page='.$totalpage.'">'.$totalpage.'</a>';
      } else {
        $pagination.= '<a href="'.$url.'&page=1">1</a>';
        $pagination.= '<div class="ellipsis">...</div>';
        for ($counter = $totalpage - 1; $counter <= $totalpage; $counter++)
        {
          if ($counter == $page){
            $pagination .= '<div  class="currentpage">'.$counter.'</div>';
          } else {
            $pagination.= '<a href="'.$url.'&page='.$counter.'">'.$counter.'</a>';
          }
        }
      }
    }
  }
  $pagination .= '</div>';
  if ($page<$totalpage) {
      $pagination .= '<div class="but1 butNoBg margin0 padding0"><a href="'.$url.'&page='.($page+1).'" class="but_pageNext" title="下一页"></a></div>';
  } else {
    $pagination .= '<div class="but2 butNoBg margin0 padding0"><div class="but_pageNext" title="下一页"></div></div>';
  }
  $pagination .= '<div class="floatLeft relative">';
  $pagination .= '<a href="javascript:void(0)" class="gotopageIcon" title="页面跳转"></a><div class="gotoInputBox" style="display:none;"><span>第<input name="pagenation_page_num" type="text" id="textfield" value=""/>页</span><span><a href="javascript:void(0)" class="gray_but">确定</a></span>';
  $pagination .= '<input type="hidden" name="pagination_total_page" value="'.$totalpage.'">';
  $pagination .= '<input type="hidden" name="pagination_url" value="'.$url.'">';
  $pagination .= '</div></div>';

  //$gotoPage = ($totalpage >= ($page + 1)) ? $page + 1 : 1;

  //$pagination .= '<span class="gotopageBox">到第<input name="page_num" type="text" id="page_num" value="'.$gotoPage.'"/>页<button class="gotobut" >确定</button></span>';

  //$pagination .= '</div>';
  if ($auto) {
    $pagination .= <<<EOF
<script>
jQuery().ready(function(){
	jQuery('a.gotopageIcon').click(function(e){
	  e.preventDefault();
		e.stopPropagation();
		jQuery('div.gotoInputBox').show();
	});
	jQuery('div.gotoInputBox').click(function(e){
		e.stopPropagation();
  });
	jQuery(document).click(function(e){
  	jQuery('div.gotoInputBox').hide();
  });
  jQuery('div.gotoInputBox a.gray_but').click(function(e) {
    e.preventDefault();
		jQuery('div.gotoInputBox').hide();
		var page = jQuery('div.gotoInputBox input[name=pagenation_page_num]').val();
		page = parseInt(page);
		var total_page = jQuery('div.gotoInputBox input[name=pagination_total_page]').val();
		if (isNaN(page) || page < 1 || page > total_page) {
			alert('页数错误');
			return;
		}
		var url = jQuery('div.gotoInputBox input[name=pagination_url]').val();
		window.location.href = url + '&page='+page;
	});
});
</script>
EOF;
  }
  return $pagination;

}

function pagenationTwo($count,$pagesize, $url, $auto = true) {
  $totalpage = intval($count / $pagesize);
  if ($count % $pagesize !== 0 ) $totalpage++;
  if ($totalpage < 2) return '';
  $page = isset($_GET['paget']) ? intval($_GET['paget']) : 1;
  if ($page < 1) $page = 1;
  else if ($page > $totalpage) $page = $totalpage;

  $adjacents = 2;
  $pagination = '<div id="bottomPageBox"><div class="bottomPage">';
  if ($page>1) {
    $pagination .= '<a href="'.$url.'&paget='.($page-1).'">上一页</a>';
  } else {
    $pagination .= '<span class="disablebox">上一页</span>';
  }
  if($totalpage <= 7) {
    for($i=1;$i<=$totalpage;$i++) {
      if ($page == $i) {
        $pagination .= '<span class="selectedPage">'.$i.'</span>';
      } else {
        $pagination .= '<a href="'.$url.'&paget='.$i.'">'.$i.'</a>';
      }
    }
  } elseif($totalpage > 7) {
    if ($page < 5) {
      for ($counter = 1; $counter <= 5; $counter++)
        {
          if ($counter == $page)
            $pagination .= '<span class="selectedPage">'.$counter.'</span>';
          else
            $pagination.= '<a href="'.$url.'&paget='.$counter.'">'.$counter.'</a>';
        }
        $pagination.= '<span class=" marginLeft10">...</span>';
        $pagination.= '<a href="'.$url.'&paget='.$totalpage.'">'.$totalpage.'</a>';
    } else {
      if ($totalpage - $page >= 5) {
        $pagination.= '<a href="'.$url.'&paget=1">1</a>';
        $pagination.= '<span class=" marginLeft10">...</span>';
        for ($counter = $page - 2; $counter <= $page + 2; $counter++)
        {
          if ($counter == $page)
            $pagination .= '<span class="selectedPage">'.$counter.'</span>';
          else
            $pagination.= '<a href="'.$url.'&paget='.$counter.'">'.$counter.'</a>';
        }
        $pagination.= '<span class=" marginLeft10">...</span>';
        $pagination.= '<a href="'.$url.'&paget='.$totalpage.'">'.$totalpage.'</a>';
      } else {
        $pagination.= '<a href="'.$url.'&paget=1">1</a>';
        $pagination.= '<span class=" marginLeft10">...</span>';
        for ($counter = $totalpage - 5; $counter <= $totalpage; $counter++)
        {
          if ($counter == $page)
            $pagination .= '<span class="selectedPage">'.$counter.'</span>';
          else
            $pagination.= '<a href="'.$url.'&paget='.$counter.'">'.$counter.'</a>';
        }
      }
    }
  }

  if ($page<$totalpage) {
    $pagination .= '<a href="'.$url.'&paget='.($page+1).'">下一页</a>';
  } else {
    $pagination .= '<span class="disablebox">下一页</span>';
  }
  $gotoPage = ($totalpage >= ($page + 1)) ? $page + 1 : 1;

  $pagination .= '<span class="gotopageBox">到第<input name="page_num" type="text" id="page_num" value="'.$gotoPage.'"/>页<button class="gotobut" >确定</button></span>';
  $pagination .= '<input type="hidden" name="pagination_total_page" value="'.$totalpage.'">';
  $pagination .= '<input type="hidden" name="pagination_url" value="'.$url.'">';
  $pagination .= '</div></div>';
  if ($auto) {
    $pagination .= <<<EOF
<script>
jQuery().ready(function(){
  jQuery('button.gotobut').click(function(e) {
    e.preventDefault();
    var parent = jQuery(this).parent().parent();
		var page = jQuery(parent).find('input[name=page_num]').val();
		page = parseInt(page);
		var total_page = jQuery(parent).find('input[name=pagination_total_page]').val();
		if (isNaN(page) || page < 1 || page > total_page) {
			alert('页数错误');
			return;
		}
		var url = jQuery(parent).find('input[name=pagination_url]').val();
		window.location.href = url + '&paget='+page;
	});
});
</script>
EOF;
  }
  return $pagination;
}

/**
 * 针对待办待阅的特殊处理
 * @param int $count
 * @param int $pagesize
 * @param string $url
 * @param bool $auto
 * @param bool $sizeHtml
 * @param bool $sizeHtml
 */
function paginationThree($count, $pagesize, $url, $auto = true, $sizeHtml = true) {
  $totalpage = intval($count / $pagesize);
  if ($count % $pagesize !== 0 ) $totalpage++;
  //if ($totalpage < 2) return '';
  $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
  if ($page < 1) $page = 1;
  else if ($page > $totalpage) $page = $totalpage;

  
  if ($sizeHtml) {
    //增加每页显示数量
    $html ='<div id="dispalyNumber"><span>每页显示:</span>';
    if($pagesize != 10){
      $html .= '<span><a class="c_pagesize" onclick="savePageSize(\'10\',\''.$url.'&pagesize=10&page=1\');" href="javascript:void(0);">10</a></span>';
    } else {
      $html .= '<span class="selA">10</span>';
    }
    if($pagesize != 25){
      $html .= '<span><a class="c_pagesize" onclick="savePageSize(\'25\',\''.$url.'&pagesize=25&page=1\');" href="javascript:void(0);">25</a></span>';
    } else {
      $html .= '<span class="selA">25</span>';
    }
    if($pagesize != 50){
      $html .= '<span><a class="c_pagesize" onclick="savePageSize(\'50\',\''.$url.'&pagesize=50&page=1\');" href="javascript:void(0);">50</a></span>';
    } else {
      $html .= '<span class="selA">50</span>';
    }
    $html .='</div>';
    $pagination = $html;
  } else {
    $pagination = '';
  }

  if ($sizeHtml) {
    $url .= '&pagesize='.$pagesize;
  }
  
  if ($page>1) {
    $pagination .= '<div class="but1 butNoBg margin0 padding0"><a href="'.$url.'&page='.($page-1).'" class="but_pagePre" title="上一页"></a></div>';
  } else {
    $pagination .= '<div class="but2 butNoBg margin0 padding0"><div class="but_pagePre" title="上一页"></div></div>';
  }
  $pagination .= '<div id="pageNumberBox">';
  if($totalpage <= 3) {
    for($i=1;$i<=$totalpage;$i++) {
      if ($page == $i) {
        $pagination .= '<div  class="currentpage">'.$i.'</div>';
      } else {
        $pagination .= '<a href="'.$url.'&page='.$i.'">'.$i.'</a>';
      }
    }
  } elseif($totalpage > 3) {
    if ($page < 3) {
      for ($counter = 1; $counter <= 2; $counter++)
      {
      if ($counter == $page){
      $pagination .= '<div  class="currentpage">'.$counter.'</div>';
      } else {
      $pagination.= '<a href="'.$url.'&page='.$counter.'">'.$counter.'</a>';
      }
      }
      $pagination.= '<div class="ellipsis">...</div>';
      $pagination.= '<a href="'.$url.'&page='.$totalpage.'">'.$totalpage.'</a>';
    } else {
    if ($totalpage - $page >= 2) {
        $pagination.= '<a href="'.$url.'&page=1">1</a>';
        $pagination.= '<div class="ellipsis">...</div>';
        $pagination .= '<div  class="currentpage">'.$page.'</div>';
        $pagination.= '<div class="ellipsis">...</div>';
        $pagination.= '<a href="'.$url.'&page='.$totalpage.'">'.$totalpage.'</a>';
        } else {
        $pagination.= '<a href="'.$url.'&page=1">1</a>';
        $pagination.= '<div class="ellipsis">...</div>';
        for ($counter = $totalpage - 1; $counter <= $totalpage; $counter++)
        {
        if ($counter == $page){
        $pagination .= '<div  class="currentpage">'.$counter.'</div>';
        } else {
        $pagination.= '<a href="'.$url.'&page='.$counter.'">'.$counter.'</a>';
        }
        }
        }
        }
        }
        $pagination .= '</div>';
        if ($page<$totalpage) {
        $pagination .= '<div class="but1 butNoBg margin0 padding0"><a href="'.$url.'&page='.($page+1).'" class="but_pageNext" title="下一页"></a></div>';
        } else {
        $pagination .= '<div class="but2 butNoBg margin0 padding0"><div class="but_pageNext" title="下一页"></div></div>';
        }
        $pagination .= '<div class="floatLeft relative" style="z-index:100">';
        $pagination .= '<a href="javascript:void(0)" class="gotopageIcon" title="页面跳转"></a><div class="gotoInputBox" style="display:none;"><span>第<input name="pagenation_page_num" type="text" id="textfield" value=""/>页</span><span><a href="javascript:void(0)" class="gray_but">确定</a></span>';
        $pagination .= '<input type="hidden" name="pagination_total_page" value="'.$totalpage.'">';
        $pagination .= '<input type="hidden" name="pagination_url" value="'.$url.'">';
        $pagination .= '</div></div>';

        //$gotoPage = ($totalpage >= ($page + 1)) ? $page + 1 : 1;

        //$pagination .= '<span class="gotopageBox">到第<input name="page_num" type="text" id="page_num" value="'.$gotoPage.'"/>页<button class="gotobut" >确定</button></span>';

        //$pagination .= '</div>';
        if ($auto) {
          $pagination .= <<<EOF
<script>
jQuery().ready(function(){
	jQuery('a.gotopageIcon').click(function(e){
	  e.preventDefault();
		e.stopPropagation();
		jQuery('div.gotoInputBox').show();
	});
	jQuery('div.gotoInputBox').click(function(e){
		e.stopPropagation();
  });
	jQuery(document).click(function(e){
  	jQuery('div.gotoInputBox').hide();
  });
  jQuery('div.gotoInputBox a.gray_but').click(function(e) {
    e.preventDefault();
		jQuery('div.gotoInputBox').hide();
		var page = jQuery('div.gotoInputBox input[name=pagenation_page_num]').val();
		page = parseInt(page);
		var total_page = jQuery('div.gotoInputBox input[name=pagination_total_page]').val();
		if (isNaN(page) || page < 1 || page > total_page) {
			alert('页数错误');
			return;
		}
		var url = jQuery('div.gotoInputBox input[name=pagination_url]').val();
		window.location.href = url + '&page='+page;
	});
});
</script>
EOF;
        }
        return $pagination;

}