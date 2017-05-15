<?php
class ProxyLayout extends LocalProxyAbstract {
  public function generateHtml($data, $views, $url, $appId = 'department') {
    
    if($appId == 'desktop') {
    $content = <<<EOF
<style>
#builder{width:680px; padding:20px 50px; background:#f8f8f8; float:left;}
#builder .column{ float: left; padding-bottom: 100px;  }
#builder .columnL{ margin-right:20px; width:400px;}
#builder .columnR{  width:240px; margin-left:20px;}
.appBg{ background:#ddf0f7; margin-bottom:5px; float:left; padding:15px 10px; width:100%; color:#666;}

#builder .placeholder {
  margin-bottom: 10px;
  border: 1px dashed #8b0510;
}
.ui-sortable-placeholder { border: 1px dotted black; visibility: visible !important; height: 110px !important; }
.ui-sortable-placeholder * { visibility: hidden; }

</style>
<div class="" style="width:800px;margin-left:10px;float:left;">
  <div class="" style="width:100%;height:41px;padding-top:8px;background:#fff;">
    <div class="but1" style="width:70px;" id="save_layout">保存</div>
    <div class="but1" style="width:70px;" id="add_block">新增</div>
    <div class="but1" style="width:90px;" id="recovery_layout">恢复默认设置</div>
		<span id="msg" style="display:none;">新增成功</span>
  </div>

  <div id="builder">
      <div class="column columnL c0">

      </div>
      <div class="column columnR c1">

      </div>
  </div>

</div>
<div id="tpl_block" class="appBg" style=" display:none;">
  <p class="hd"><a href="javascript:void(0)" class="btn_close btn_close_bg floatRight">&nbsp;</a></p>
<!--//
  <p class="bold">标题</p>
  <p style="margin-bottom:5px;">
    <label for="textfield3"></label>
    <input name="bt" type="text" id="textfield3" style="width:300px;"  class="globalFormInput inputOn"/>
  </p>
//-->
  <p class="margin5">选择应用</p>
  <p>
    <select name="ba" id="jumpMenu"  style="width:310px;">
EOF;
    } else {
      $content = <<<EOF
<style>
#builder{width:680px; padding:20px 0px; background:#f8f8f8; float:left;}
#builder .column{ float: left; padding-bottom: 100px;  }
#builder .columnL{ margin-right:20px; width:360px;}
#builder .columnR{  width:240px; margin-left:20px;}
.appBg{ background:#ddf0f7; margin-bottom:5px; float:left; padding:15px 10px; width:100%; color:#666;}
      
#builder .placeholder {
  margin-bottom: 10px;
  border: 1px dashed #8b0510;
}
.ui-sortable-placeholder { border: 1px dotted black; visibility: visible !important; height: 110px !important; }
.ui-sortable-placeholder * { visibility: hidden; }
      
</style>
<div class="" style="width:700px;margin-left:10px;float:left;">
  <div class="" style="width:100%;height:41px;padding-top:8px;background:#fff;">
    <div class="but1" style="width:70px;" id="save_layout">保存</div>
    <div class="but1" style="width:70px;" id="add_block">新增</div>
		<span id="msg" style="display:none;">新增成功</span>
  </div>
      
  <div id="builder">
      <div class="column columnL c0">
      
      </div>
      <div class="column columnR c1">
      
      </div>
  </div>
      
</div>
<div id="tpl_block" class="appBg" style=" display:none;">
  <p class="hd"><a href="javascript:void(0)" class="btn_close btn_close_bg floatRight">&nbsp;</a></p>
<!--//
  <p class="bold">标题</p>
  <p style="margin-bottom:5px;">
    <label for="textfield3"></label>
    <input name="bt" type="text" id="textfield3" style="width:300px;"  class="globalFormInput inputOn"/>
  </p>
//-->
  <p class="margin5">选择应用</p>
  <p>
    <select name="ba" id="jumpMenu"  style="width:310px;">
EOF;
      
}
    $views_options = '';
	foreach($views as $key=>$value){
		$views_options .= '<option value="'.$key.'">' . $value['name'] .'</option>';
	}
	$content .= $views_options;
$content .= <<<EOF
    </select>
  </p>
  <p class="margin10">视图</p>
  <p>
    <select name="bv" id="jumpMenu" style="width:310px;">

    </select>
  </p>
</div>
EOF;

    $content .= '<p style="display:none;" id="app_list">'. json_encode($views).'</p>'
                .'<p style="display:none;" id="data">'. json_encode($data).'</p>'
                .'<input type="hidden" id="post_url" value="'.$url.'"/>'
                .'<script type="text/javascript" src="/js/jquery.json-2.3.min.js"></script>'
                .'<script>'
                .'$.getScript("/js/jquery.json-2.3.min.js");'
                .'$.getScript("/js/layout.js",function(){Layout.init();});'
                .'</script>';


    return $content;
  }

  public function render($layout,$apps,$instanceId)
  {
    $content ='<style>.appDesktopL{ margin-right:20px; width:650px; float:left;}.appDesktopR{  width:265px; float:right;}</style>';
    $content .= '<div class="content940"><div id="desktop" class="appDesktop" style="float:left;">';
    foreach ($layout as $i => $column){
      $content .= '<div class="column appDesktop'. ((($i+1)%2 == 0)? 'R': 'L') . ' c'.$i.'">';
      foreach ($column as $block){
        if (!isset($apps[$block[1]])) {
          continue;
        }
        $appInstance = AopApp::getInstance($apps[$block[1]]);
        $views = $appInstance->views();
        if (!isset($views[$block[2]])){
          continue;
        }
        $content .= '<div class="block" style="margin:5px 0; width: 100%;" id="'.$block[1].':'.$block[2].'"><div class="cnt">';
        //$content .= $apps[$block[1]]->draw($block[2], array('instance_id' => $instanceId));
        $content .= '<div style="padding:5px 0;border:1px solid #ccc;width:100%;">正在载入'.$views[$block[2]]['title'].' <img src="/images/ajax-loader-s.gif" style="width:16px;height:16px;border:0;vertical-align:middle;"/></div>';
        $content .= '</div></div>';
      }
      $content .= '</div>';
    }
    $content .= '</div></div>';
    $content .= '<script>$.getScript("/js/layout-render.js", function(){layoutRender.init()});</script>';
    return $content;
  }

  public function filterData($data){
    return $data;
  }
}
