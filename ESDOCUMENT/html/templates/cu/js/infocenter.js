document.write("<script language='javascript' src='/templates/virtualsite/js/jquery.block-ui.js'></script>");
document.write("<link href='/templates/virtualsite/css/jquery.ui.core.css' rel='stylesheet' type='text/css' />");
document.write("<link href='/templates/virtualsite/css/jquery.ui.theme.css' rel='stylesheet' type='text/css' />");
var App = {};
var ChinaUnicom = {};

ChinaUnicom.dialog = {
  config : {},
  show : function(){
    config = ChinaUnicom.dialog.config;
    innerW = config.width - 60;
    innerH = config.height - 60;
    var html = '<div class="openW" id="chinaunicom-dialog" style="width:'+config.width+'px;position:relative;z-index:1001;display:none;overflow:hidden;" id="dialog-text">';
    html += '<div class="openTop"><div class="openTL"></div><div class="openTC" style="width:'+innerW+'px;"></div><div class="openTR"></div></div>';
    
    html += '<div class="openCenter" style="width:'+config.width+'px;">';
    html += '<div class="openCL" style="height:'+innerH+'px;"></div>';
    html += '<div class="openCC" style="width:'+innerW+'px; height:'+innerH+'px;overflow:hidden;">';
    html += '<div class="openClose" style="cursor:pointer"><img src="/images/close.gif" width="10" height="10" alt="关闭" id="dialog-close"/></div>';
    html += '<div class="openText" style="text-align:left;">';
    
    html += config.content;
    
    html += '</div>';
    html += '</div>';
    html += '<div class="openCR" style="height:'+innerH+'px;"></div>';
    html += '</div>';
    html += '<div class="openBottom" style="width:'+config.width+'px;"><div class="openBL"></div><div class="openBC" style="width:'+innerW+'px;"></div><div class="openBR"></div></div>';
    html += '</div>';
    
    $('body').append(html);//把窗口代码加入html中
    $.blockUI({ message: $('#chinaunicom-dialog'),draggable : true }); 
    $('.blockOverlay').attr('title','单击关闭').click($.unblockUI); 
    $('#chinaunicom-dialog .openClose').click($.unblockUI);
    if(typeof config.open === 'function') {
      config.open($('#chinaunicom-dialog '));
    }
  },
  close: function(){
    $.unblockUI();
  },
  open : function(config){
    var self = ChinaUnicom.dialog;
    self.config = {url : '',type : 'text',content : '',width: 560,height: 290,open : null};
    self.config = $.extend(self.config, config);
    var pw = self.pageWidth(),ph = self.pageHeight();
    var left = (1-self.config.width/pw)/2, top = (1-self.config.height/ph)/2;
    left = parseInt(left*100);
    top = parseInt(top*100);
    
    $.blockUI.defaults.css = $.extend($.blockUI.defaults.css,{cursor:'default',border:'0',background:'none',left:left+'%',top:top+'%'});
    $.blockUI.defaults.overlayCSS = $.extend($.blockUI.defaults.overlayCSS,{cursor:'default'});
    $.blockUI.defaults.onUnblock = function(element, options){
      $('div.openW').remove();
    };
    if (self.config.type === 'url'){
      $.get(self.config.url, function(data){
        self.config.content = data;
        self.show();
      });
    } else {
      
      self.show();
    }
  },
  pageWidth:function(){ 
    if($.browser.msie){ 
      return document.compatMode == "CSS1Compat"? document.documentElement.clientWidth : document.body.clientWidth; 
    }else{ 
      return self.innerWidth; 
    } 
  },
  pageHeight : function(){ 
    if($.browser.msie){ 
      return document.compatMode == "CSS1Compat"? document.documentElement.clientHeight : document.body.clientHeight; 
    }else{ 
      return self.innerHeight; 
    } 
  }
};

function alert(content){
  var pw = ChinaUnicom.dialog.pageWidth(),ph = ChinaUnicom.dialog.pageHeight();
  var left = (1-310/pw)/2;
  //var top = (1-self.config.height/ph)/2;
  left = parseInt(left*100);
  //top = parseInt(top*100);
  var msg = '<div class="error" style="width:310px;background-color:#fff">';
  msg += '<div class="errorTitle">';
  msg += '<h1>操作提示</h1>';
  msg += '<span><a href="javascript:jQuery.unblockUI();"><img src="/templates/cu/images/close.gif" width="10" height="10" alt="关闭" /></a></span> </div>';
  msg += '<div class="errorIcon"><img src="/templates/cu/images/icons/error_3.gif" width="48" height="48" alt="操作提示" /></div>';
  msg += '<div class="errorText" style="min-height:38px;width:200px; text-align:left;">'+content+'</div>';
  msg += '<div class="openBut" style="margin:0;width:100%;">';
  msg += '<div class="release" style="margin:20px 0 0 110px!important;margin:20px 0 0 60px"><a href="javascript:jQuery.unblockUI();">我知道了</a></div>';
  msg += '</div>';
  msg += '</div>';
  jQuery.blockUI.defaults.css = jQuery.extend(jQuery.blockUI.defaults.css,{cursor:'default',border:'0',background:'none',left:left+'%'});
  jQuery.blockUI.defaults.overlayCSS = jQuery.extend(jQuery.blockUI.defaults.overlayCSS,{cursor:'default'});
  jQuery.blockUI({ message: msg,draggable : true }); 
  return false;
}

function add_friend_agree(id,url){
  url = url+'/?id='+id;
  $.ajax({
    url:url,
    success:function(resp){
      if(resp != 'error'){
    	window.open('/setting/0/');
        alert('操作成功');
        resp = $.trim(resp);
        window.setTimeout("mscCallBack('ucenter', "+resp+")",2000);
      }else{
    	alert('操作失败');
      }
    }
  });
}