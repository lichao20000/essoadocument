var appConsoleList = {};

var appConsole = function(options) {
  var console = {
      id : null,
      dom : null,
      showBg : function(){
        var bh = $(".rightSide").height();
        var bw = $(".rightSide").width();
        var p = $(".rightSide").position();
        $("#fullbg").css({
          height : bh,
          width : bw,
          display : "block",
          left : p.left,
          top : p.top
        });
      },
      closeBg : function(){
        $("#fullbg").hide();
      }
  };
  for(key in options){
    console[key] = options[key];
  }
  
  return console;
};

var operator = {
  appConsole : null,
  preConsole : null,
  options : {},
  ajax : null,
  init : function(options) {
    operator.options = options;
    if (typeof options.loadImage !== 'undefined') {
      operator.options.loadImage = $('<img src="' + operator.options.loadImage
        + '"/>');
    }
  },
  loadConsoleByDom : function(dom) {
    var href = $(dom).attr('href');
    href = href.slice(1);
    var a = href.split('/');
    id = a.shift();
    operator.preConsole = operator.appConsole;
    if (typeof appConsoleList[id] !== 'undefined') {
      operator.appConsole = appConsoleList[id];
   
    } else {
      operator.appConsole = appConsole({
        id : id,
        dom : dom
      });
      appConsoleList[id] = operator.appConsole;
    }
    operator.loadConsoleByUrl(a.join('/'));
  },
  loadConsoleById : function(id) {
    operator.preConsole = operator.appConsole;
    if (typeof appConsoleList[id] !== 'undefined') {
      operator.appConsole = loadConsole(appConsoleList[id]);
    }
    operator.appConsole = {
      id : id
    };
    operator.loadConsoleByUrl('');
  },
  
  loadConsoleByUrl : function(url, hooks) {
    url = operator.options.baseUrl + '/' + operator.appConsole.id + '/'
        + url;
    if (typeof operator.appConsole.dom !== 'undefined') {
      $(operator.appConsole.dom).after(operator.options.loadImage);
    }
    operator.appConsole.showBg(); 
    if( operator.ajax !== null && typeof operator.ajax.abort === 'function'){
      operator.ajax.abort();
      operator.ajax = null;
    }
    
    operator.ajax = $.ajax({
      dataType : 'json',
      type : 'get',
      url : url,
      success : function(resp) {
        if (typeof resp.redirect_url !== 'undefined') {
          operator.loadConsoleByUrl(resp.redirect_url);
          return;
        }
        $('#main').html(resp.html);
        operator.bindHtml();
        if (typeof operator.options.loadImage !== 'undefined') {
          operator.options.loadImage.remove();
        }
        operator.appConsole.closeBg();
      },
      error : function(jqXHR, textStatus, errorThrown) {
       
        var statusCode = parseInt(jqXHR.status);
        if (statusCode === 200){
          alert('返回数据结构错误');
        }else{
          alert(jqXHR.responseText);
        }
        operator.appConsole.closeBg();
        if(operator.preConsole === null){
          operator.appConsole = null;
        }else{
          operator.appConsole = operator.preConsole;
        }
        if (typeof operator.options.loadImage !== 'undefined') {
          operator.options.loadImage.remove();
        }
        
      }
    
    });

  },
  loadConsole : function() {
    
  },
  bindHtml : function() {
    operator.bindHtmlForm();
    operator.bindHtmlA();
  },
  bindHtmlA : function() {

    
    $('#main').find('a').click(function(e) {
      e.preventDefault();
      var host = document.domain;
      var href = $(this).attr('href');
      href = href.replace('http://' + host,'');
      if (href.length === 0 || href.indexOf('javascript:') === 0) {
        return false;
      }
      
      operator.loadConsoleByUrl(href);
      return false;
      
    });
  },
  bindHtmlForm : function() {
    $('#main').find('form').ajaxForm({
      dataType : 'json',
      success : function(resp) {
       	var msg = '';
       	for ( var key in resp.message) {
       		msg += resp.message[key] + '\r\n';
        }
        if(msg.length > 0){
            alert(msg);
        }
        if (resp.status == 'ok') {
          if (typeof resp.redirect_url != 'undefined' && resp.redirect_url.length > 0) {
            operator.loadConsoleByUrl(resp.redirect_url);
          }
        }
      }
    
    });
    return;
    
  }

};
