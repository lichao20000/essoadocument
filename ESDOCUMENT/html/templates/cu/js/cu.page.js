/*jslint plusplus: true, undef: true, sloppy: true, vars: true, white: true, devel: true */

App.developing = function() {
  alert('该功能开发中...');
  return false;
};

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

ChinaUnicom.unblockUI = function(){
  $.unblockUI();
};

ChinaUnicom.confirm = function (content,callback){
  var pw = ChinaUnicom.dialog.pageWidth(),ph = ChinaUnicom.dialog.pageHeight();
  var left = (1-370/pw)/2;
  //var top = (1-self.config.height/ph)/2;
  left = parseInt(left*100);
  //top = parseInt(top*100);
  msg = '<div class="error" style="width:370px;">';
  msg += '<div class="errorTitle">';
  msg += '<h1>操作提示</h1>';
  msg += '<span><a href="javascript:ChinaUnicom.unblockUI();"><img src="/templates/cu/images/close.gif" width="10" height="10" alt="关闭" /></a></span> </div>';
  msg += '<div class="errorIcon"><img src="/templates/cu/images/icons/error_3.gif" width="48" height="48" alt="操作提示" /></div>';
  msg += '<div class="errorText" style="min-height:38px;width:200px; text-align:left;">'+content+'</div>';
  msg += '<div class="openBut" style=" padding:10px 0 0 102px; width:190px;">';
  msg += '<div class="release" id="confirm_ok"><a href="javascript:;">确定</a></div>';
  msg += '<div class="menuBut" style="width:70px;" id="confirm_cancel"><a href="javascript:;">取消</a></div>';
  msg += '</div>';
  msg += '</div>';
  jQuery.blockUI.defaults.css = jQuery.extend(jQuery.blockUI.defaults.css,{cursor:'default',border:'0',background:'none',left:left+'%'});
  jQuery.blockUI.defaults.overlayCSS = jQuery.extend(jQuery.blockUI.defaults.overlayCSS,{cursor:'default'});
  jQuery.blockUI({ message: msg,draggable : true }); 
  jQuery('#confirm_ok').click(function(){
    callback();
    ChinaUnicom.unblockUI();
  });
  jQuery('#confirm_cancel').click(function(){
    ChinaUnicom.unblockUI();
  });
  return ;
};

ChinaUnicom.page = {
  headerHeight: 0,
  dNav: null,
  setHeaderHeight: function() {
    var self = ChinaUnicom.page;
    self.headerHeight = 0;
    if ($('#page-top').length) {
      self.headerHeight += $('#page-top').height(); 
    }
    if (self.dNav.length) {
      self.headerHeight += self.dNav.height(); 
    }
    if ($('#page-tab').length) {
      self.headerHeight += $('#page-tab').height() + 9; 
    }
  },
  
  redraw: function(e) {
    var dContent, self = ChinaUnicom.page;
    dContent = $('#page-body .page-sidebar, #page-body .page-content');
    if (!dContent.length) {
      return;
    }
    ChinaUnicom.page.setHeaderHeight();
    var height = document.documentElement.clientHeight - self.headerHeight - 10 ;
    dContent.css('overflow-y', 'auto').height(height);
    if (dContent.length) {
      self.tabController.resize();
    }
  },
  initialize: function() {
    var dNav, self = ChinaUnicom.page;
    dNav = self.dNav = $('#page-nav');
    if (dNav.length) {
      self.setHeaderHeight();
      $(window).resize(self.redraw).load(self.redraw);
      if (typeof onTabLoad === 'function') {
        self.tabController.initialize(onTabLoad);
      } else {
        self.tabController.initialize();
      }
    }
  },
  tabController: {
    tabs: {},
    contents: {},
    navWidth: 0,
    dBody: null,
    dNavBar: null,
    lastIndex: 0,
    currentIndex: null,
    initialize: function(callback) {
      var navBar, divs, i, parent = ChinaUnicom.page, self = parent.tabController;
      navBar = self.dNavBar = parent.dNav.children('div.topNavC');
      self.dBody = $('#page-body');
      navBar.children('div:eq(0)').each(function(i, obj) {
        self.addTab(obj, null, '', callback);
      });
    },
    resize: function() {
      var i, width, msie6, count = 0, eachWidth, parent = ChinaUnicom.page, self = parent.tabController, tabs = self.tabs;
      msie6 = $.browser.msie && $.browser.version === '6.0';
      // IE6获取宽度方式差异 =.=
      width = self.navWidth = (msie6 ? document.documentElement.clientWidth : document.documentElement.scrollWidth) - parent.dNav.children('div.topNavR').width() - 270;
      self.dNavBar.width(width);
      for (i in tabs) {
        if (tabs.hasOwnProperty(i)) {
          ++count;
        }
      }
      count += 1; // 默认TAB
      eachWidth = parseInt(width / count, 10);
      if (eachWidth > 123) {
        eachWidth = 123;
      }
      aEachWidth = eachWidth -= 38;  // 除去 Padding 部分
      if (msie6) {
        aEachWidth -= 3; // 修复IE6宽度bug =.=
      }
      self.dNavBar.children('div').width(eachWidth).children('a.floatLeft').width(aEachWidth-15);
    },
    addTab: function(title, url, id, onloadCallback, oncloseCallback) {
      var self = ChinaUnicom.page.tabController;
      var result = new ChinaUnicom.page.tab(self.lastIndex, title, url, id, onloadCallback, oncloseCallback);
      self.tabs['tab_' + self.lastIndex] = result;
      result.select();
      self.lastIndex = self.lastIndex + 1;
      return result;
    },
    closeTab: function(index) {
      var result, key, reSwitch = false, self = ChinaUnicom.page.tabController;
      key = 'tab_' + index;
      if (typeof self.tabs[key] === 'object') {
        result = self.tabs[key];
        if (result.edited) {
          //if(!confirm('标签 "' + result.title + '" 正在编辑中,\n\n是否确认放弃已经编辑的内容?')){
        	//return; 
          //}
          $("#dialog-confirm").dialog({
              modal: true,
              resizable: false,
              open: function() {
               $(this).html("<span class='dialog_s' style='font-size: 14px;'>放弃已编辑内容</span>");
              },
              buttons: {
                " 确 认 ": function() {
                	$(this).dialog('close');
                	if (result.tab.hasClass('topNavMenuOn')) {
                        // 移除是当前TAB则跳转至第一个TAB
                        reSwitch = true;
                        self.switchTab(0);
                      }
                      result.close();
                      delete(self.tabs[key]);
                      self.resize();
                },
                " 取 消 ": function(){
                  $(this).dialog('close');
                  return ;
                }
              }
            });
        }else{
        if (result.tab.hasClass('topNavMenuOn')) {
            // 移除是当前TAB则跳转至第一个TAB
            reSwitch = true;
            self.switchTab(0);
          }
          result.close();
          delete(self.tabs[key]);
          self.resize();
        }
      }
    },
    switchTab: function(index) {
      var key, self = ChinaUnicom.page.tabController;
      key = 'tab_' + index;
      if (typeof self.tabs[key] === 'object') {
        self.tabs[key].select();
      }
    },
    indexOf: function(id) {
      var i, result, self = ChinaUnicom.page.tabController, tabs = self.tabs;
      for (i in tabs) {
        if (tabs.hasOwnProperty(i)) {
          if (tabs[i].id === id) {
            return parseInt(i.substr(4), 10);
          }
        }
      }
      return -1;
    },
    indexOfByTitle: function(title) {
      var i, result, self = ChinaUnicom.page.tabController, tabs = self.tabs;
      for (i in tabs) {
        if (tabs.hasOwnProperty(i)) {
          if (tabs[i].title === title) {
            return parseInt(i.substr(4), 10);
          }
        }
      }
      return -1;
    },
    getTab: function(index) {
      var key, self = ChinaUnicom.page.tabController;
      key = 'tab_' + index;
      if (typeof self.tabs[key] === 'object') {
        return self.tabs[key];
      }
      return null;
    }
  },
  tab: function (index, title, url, id, onloadCallback, oncloseCallback) {
    var dTab, dContent, page = ChinaUnicom.page, controller = page.tabController, self = this;
    if (typeof id === 'undefined') {
      id = '';
    }
    this.id = id;
    this.tab = null;
    this.content = null;
    this.title = null;
    this.index = index;
    if (typeof url === 'string' && $.trim(url) !== '') {
      this.url = $.trim(url);
    } else {
      this.url = '';
    }
    this.reload = function() {
      if (this.url !== '') {
        $.get(this.url, function (data) {	
          self.content.html(data);
          page.redraw();
          if (typeof onloadCallback === 'function') {
        	$(function() {if(window.PIE){ $('.but1').each(function() { PIE.attach(this); });} });
            onloadCallback(self.content);
          }
        });
      }
    };
    this.edited = false;
    if (typeof title === 'object') {
      dTab = $(title);
      var dA = dTab.children('a:eq(0)');
      this.title = title = $.trim(dA.text());
      dA.attr('title', title);
      dContent = $('<div class="navtab-content" style="display:none">' + controller.dBody.html() + '</div>');
      controller.dBody.empty().append(dContent) ;
      if (typeof onloadCallback === 'function') {
        onloadCallback(dContent);
      }
    } else {
      dTab = $('<div class="topNavMenuOff"><a href="#" class="floatLeft" style="margin-top:2px;overflow:hidden"></a><a href="#" class="close-tab" title="关闭"><img src="/templates/cu/images/delete.gif" width="10" height="10" class="floatRight" style="margin-top:10px;"></a></div>');
      this.title = title = $.trim(title);
      dTab.children('a:eq(0)').text(title).attr('title', title);
      dContent = $('<div class="navtab-content" style="display:none"><img src="/templates/cu/images/ajaxloader.gif" style="position:absolute;top:50px;left:50%;margin-left:-27px"></div>');
      this.reload();
      controller.dBody.append(dContent);
    }
    controller.dNavBar.append(dTab);
    this.tab = dTab;
    this.content = dContent;
    dTab.click(function(e) {
      e.preventDefault();
      self.select();
    });
    dTab.children('a:eq(1)').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      controller.closeTab(index);
    });
    this.select = function() {
      controller.dNavBar.children('div').removeClass('topNavMenuOn').addClass('topNavMenuOff');
      controller.dBody.children('div').hide();
      this.tab.removeClass('topNavMenuOff').addClass('topNavMenuOn');
      this.content.show();
      controller.currentIndex = this.index;
    };
    this.close = function() {
      this.tab.remove();
      if (typeof oncloseCallback === 'function') {
        oncloseCallback(dContent);
      }
      this.content.remove();
    };
    return this;
  }
};

// 关闭前事件, IE & FF 支持
window.onbeforeunload = function(event) {
  // 检查是否有编辑中的标签
  var tabs = ChinaUnicom.page.tabController.tabs;
  for (i in tabs) {
    if (tabs.hasOwnProperty(i) && tabs[i].edited) {
      return '标签 "' + tabs[i].title + '" 正在编辑中,';
    }
  }
} 

ChinaUnicom.headerClock = {
  initialize: function() {
    var dClock = $('#header-clock');
    if (dClock.length) {
      var objDate = new Date(), month, day, minute;
      setInterval(function() {
        requestTime += 5000;
        objDate.setTime(requestTime);
        month = objDate.getMonth() + 1;
        if (month < 10) {
          month = '0' + month;
        }
        day = objDate.getDate();
        if (day < 10) {
          day = '0' + day;
        }
        minute = objDate.getMinutes();
        if (minute < 10) {
          minute = '0' + minute;
        }
        dClock.text(objDate.getFullYear() + '-' + month + '-' + day + ' ' + objDate.getHours() + ':' + minute);
      }, 5000);
    }
  }
};

ChinaUnicom.appCenter = {
  list: [],
  current: 'all',
  initializeHeader: function() {
    var value = $('#applist_value');
    if (!value.length) {
      return;
    }
    var self = ChinaUnicom.appCenter;
    self.list = $.parseJSON(value.val());
    var dButtons = $('#appslicerbutton p:lt(5)'), dSearch = $('#appsearch'), textSearch = '搜索应用名称';
    dButtons.click(function(e) {
      e.preventDefault();
      dButtons.filter('.appCenterLOn').removeClass('appCenterLOn');
      $(this).addClass('appCenterLOn');
      var index = $(this).children('a').attr('rel').substr(1), pi, pj, counter;
      self.current = index;
      self.showList(self.getList(index));
      dSearch.val(textSearch);
    });
    if (dSearch.length > 0) {
      dSearch.focus(function(e) {
        if (this.value === textSearch) {
          this.value = '';
        }
      }).blur(function(e) {
        if ($.trim(this.value) === '') {
          this.value = textSearch;
        }
      });
      var doSearch = function() {
        var text = $.trim(dSearch.val()), list = self.getList();
        if (text === '' || text === textSearch) {
          self.showList(list);
          return;
        }
        var result = [], pi, i;
        for (i in list) {
          if (list.hasOwnProperty(i)) {
            pi = list[i];
            if (pi.name.indexOf(text) !== -1) {
              result.push(pi);
            }
          }
        }
        self.showList(result);
      };
      dSearch.keydown(function(e) {
        if (e.keyCode === 13) {
          doSearch();
          return false;
        }
      });
      $('#appsearchbutton').click(function(e) {
        e.preventDefault();
        doSearch();
      });
    }
    $('#appslicerbutton a[rel=k0]').trigger('click');
  },
  getList: function(index) {
    var self = ChinaUnicom.appCenter, list = [];
    if (typeof index === 'undefined') {
      index = self.current;
    }
    if (index === 'all') {
      var i, j, urls = [];
      for (i in self.list) {
        if (self.list.hasOwnProperty(i)) {
          pi = self.list[i];
          for (j in pi) {
            if (pi.hasOwnProperty(j)) {
              pj = pi[j];
              if ($.inArray(pj.url, urls) === -1) {
                list.push(pj);
                urls.push(pj.url);
              }
            }
          }
        }
      }
    } else {
      list = self.list[index];
    }
    return list;
  },
  showList: function(list) {

    var dSlider = $('#appslider');
    if (!dSlider.length) {
      return;
    }
    var self = ChinaUnicom.appCenter;
    $('#usualAPPDisplay_opt').hide();
    if(self.current == 0 ){
      if (list.length == 0){
        dSlider.html('<div class="color999 font14" style="width:200px;">您尚未选择任何常用业务应用！</div><br/><a href="'+baseUrl+'setting/0/appshow" class="font14 fontWeight100 underline color369 ">设置常用业务应用</a>');
        return;
      } 
      $('#usualAPPDisplay_opt').show();
      
    }
    
    var html = [], pi, i;
    html.push('<ul style="float:left;height:175px"><li class="appCenterRIcons" style="height:180px">');
    for (i in list) {
      if (list.hasOwnProperty(i)) {
        pi = list[i];
        html.push('<div class="appCenterRIcons1"><a href="' + pi.url + '"' + (pi.target === 'new' ? ' target="_blank"' : '') + '><img src="' + pi.icon + '" width="32" height="32" alt="' + pi.name + '" align="absmiddle"/><span>' + pi.name + '</span></a></div>');
        if ((parseInt(i, 10) + 1) % 12 === 0 && list.hasOwnProperty( parseInt(i,10) + 1 ) ) {
          html.push('</li><li class="appCenterRIcons" style="height:180px">');
        }
      }
    }
    html.push('</li></ul>');
    if (list.length <= 12) {
      $('#appsliderpage').hide();
    } else {
      $('#appsliderpage').html('<span id="prevslide"><a href="javascript:void(0);"><img src="' + tplPath + '/images/previous.gif"  width="50" height="31" alt="上一页"  align="absmiddle"  style="margin:0 1px 0 10px" /></a></span><span id="nextslide"><a href="javascript:void(0);"><img src="' + tplPath + '/images/next.gif" width="50" height="31" alt="下一页"  align="absmiddle" /></a></span>').show();
    }
    dSlider.html(html.join('')).easySlider({
      auto: false,
      continuous: false,
      prevId : 'prevslide',
      nextId : 'nextslide'
    });
  }
};
var text_info = '搜新闻、通知、待办待阅、其它应用信息';
var text_member = '搜全国通讯录，专业通讯录，个人通讯录';
var text_app = '搜接入云门户的应用';

ChinaUnicom.search = {
  initialize: function() {
	//首次加载时，加入关键字
    var curSearchKey = decodeURIComponent($('#seachKey').val());
    if(curSearchKey!=='' && curSearchKey!==text_info && curSearchKey!==text_member && curSearchKey!==text_app){
		$('#seachKey')[0].defaultValue = curSearchKey;
		$('#seachKey').val(curSearchKey);
    }
    
    $("#seachKey").click(function () { 
      var check1 = decodeURIComponent($(this).val());
      //if (check1 === this.defaultValue) { 
      if(check1==text_info || check1==text_member || check1==text_app){
        $(this).removeClass('topInput');
        $(this).val(''); 
      } 
    }).blur(function () { 
      var check1 = decodeURIComponent($(this).val());
      if (check1.length === 0){
        $(this).addClass('topInput');
        $(this).val(this.defaultValue); 
      } else {
        $(this).removeClass('topInput');
      }
    });
    
    $('#menu_appcenter').toggle(function(){
      $('.appCenterBox').slideDown('fast');
    },function(){
      $('.appCenterBox').slideUp('fast');
    });
    $('.appCenterRClose').click(function(){
      $('#menu_appcenter').trigger('click');
    });
    
    $('#closePop').click(function(){
      $('#topAppCenter_default').hide();
      $('body').removeClass('body_topapp');
      $('body').addClass('body_topappclose');
      $('#topAppCenter_close').show();
      ChinaUnicom.page.redraw();
    });
    
    $('#openPop').click(function(){
    	$('#topAppCenter_close').hide();
        $('body').addClass('body_topapp');
        $('body').removeClass('body_topappclose');
        $('#topAppCenter_default').show();
        ChinaUnicom.page.redraw();
      });

    $("#slide1").easySlider({
      auto: false,
      continuous: false,
      prevId: 'pop_prev1',
      nextId: 'pop_next1',
      controlsFade: false,
      prevIdFirst: 'pop_prev1_first',
      nextIdLast: 'pop_next1_last'
    });
    
    $("#slide2").easySlider({
      auto: false,
      continuous: false,
      prevId : 'pop_prev2',
      nextId : 'pop_next2',
      controlsFade: false,
      prevIdFirst: 'pop_prev2_first',
      nextIdLast: 'pop_next2_last'
    });
    
    $("#slide3").easySlider({
      auto: false,
      continuous: false,
      prevId : 'pop_prev3',
      nextId : 'pop_next3',
      controlsFade: false,
      prevIdFirst: 'pop_prev3_first',
      nextIdLast: 'pop_next3_last'
    });
    
    if (typeof appAreaStatus !== 'undefined' && appAreaStatus) {
      $('#menu_appcenter').trigger('click');
    }
    
    $("#appslider").easySlider({
      auto: false,
      continuous: false,
      prevId : 'prevslide',
      nextId : 'nextslide'
    });

    $('#showSearchList').toggle(function(){
      $('#searchListPanel').show();
    },function(){
      $('#searchListPanel').hide();
    });

    $('#searchListPanel').find('a').click(function(){
      var val = $(this).attr('value');
      $('#searchArea').attr('value', val);
      $('#searchArea').html($(this).html());
      $('#searchListPanel').find('a').css({fontWeight:'normal'});
      $(this).css({fontWeight:'bold'});
      var hint;
      var curSearchKey = decodeURIComponent($('#seachKey').val());
      if (val === 'info') {
    	if(curSearchKey=='' || curSearchKey==text_info || curSearchKey==text_member || curSearchKey==text_app){
    		hint = text_info;
    	} else {
    		hint = curSearchKey;
    	} 
      }else if(val === 'colleage') {
    	  if(curSearchKey=='' || curSearchKey==text_info || curSearchKey==text_member || curSearchKey==text_app){
    		hint = text_member;
    	} else {
    		hint = curSearchKey;
    	}
      } else {
    	  if(curSearchKey=='' || curSearchKey==text_info || curSearchKey==text_member || curSearchKey==text_app){
      		hint = text_app;
      	} else {
      		hint = curSearchKey;
      	}
      }
      
      $('#seachKey')[0].defaultValue = hint;
      $('#seachKey').val(hint);
      //searchAreaStatus = false;
      $('#showSearchList').trigger('click');
      
    });
    
    $('#adv_colleage_more').toggle(function(){
      $('ul[name=colleage_more]').show();
      $('#adv_colleage_more_text').html('较少搜索条件');
    },function(){
      $('ul[name=colleage_more]').hide();
      $('#adv_colleage_more_text').html('较多搜索条件');
    });
    
    
    $('#showSearchListBox').click(function(e){
    	//return;
      //e.preventDefault();
      //if (searchAreaStatus) {
        //searchBoxHide();
      //} else {
        var val = $('#searchArea').attr('value');
        if (val === 'info') {
          $('#searchInfoBox').show();
          $('#searchColleageBox').hide();
        }else if(val === 'colleage') {
          $('#searchInfoBox').hide(); 
          $('#searchColleageBox').show();
        }
        //searchAreaStatus = true;
      //}
    });
    
    if (typeof menuitem !== 'undefined') {
      jQuery('.topMenu').children().removeClass('topMenuOn');
      jQuery('#' + menuitem).addClass('topMenuOn');
    }
    
    $("#seachKey").keydown(function(e){ 
      var curKey = e.which; 
      if(curKey === 13){ 
        search('common', searchBaseUrl);
        return false; 
      } 
    });
  }
};

//var searchAreaStatus = false;
var searchBoxHide = function(op) {
  if(typeof op == 'undefined' ){
	  //$('#searchInfoBox').hide();
	  //searchAreaStatus = false;
  }	else {
      if (op === 'info') {
        $('#searchInfoBox').hide();
        //$('#searchColleageBox').show();
      }else if(op === 'colleage') {
        //$('#searchInfoBox').show(); 
        $('#searchColleageBox').hide();
      }
      //searchAreaStatus = true; 
  }

};
/**
 * 验证单个值
 * @param key
 */
function validateInput(key){
	key = decodeURIComponent(key);
	var pattern = new RegExp("[\\\\\"`~!%@#$^&*()=|{}':;'\\[\\],.<>/?~！￥……*（）——|{}【】‘；：”“'。，、？《》 ·]");
    var rs = '';
    for (var i = 0; i < key.length; i++) { 
      rs = rs + key.substr(i, 1).replace(pattern, ''); 
    }
    key = rs;
    if(key.length === 0){
      return false;
    }    
    return true;
}

function search(type){
  
  var key = '';
  var custom = '';
  var a = $('#searchArea').attr('value');
  
  if(type === 'common'){
    key = $.trim($('#seachKey').val());
    key = decodeURIComponent(key);
    if(key.length === 0){
      alert('请输入搜索内容');
      $('#seachKey').focus();
      return;
    }
    
    if(key == text_info || key == text_member || key == text_app){
    	return;
    }
    
    var pattern = new RegExp("[\\\\\"`~!%@#$^&*()=|{}':;'\\[\\],.<>/?~！￥……*（）——|{}【】‘；：”“'。，、？《》 ·]");
    var rs = '';
    for (var i = 0; i < key.length; i++) { 
      rs = rs + key.substr(i, 1).replace(pattern, ''); 
    }
    key = rs;
    if(key.length === 0){
      alert('请输入合法字符');
      $('#seachKey').focus();
      return;
    }
    
    if(key == text_info || key == text_member || key == text_app){
      return;
    }
  } else if (type === 'custom') {
    var id='';
    if (a === 'info') {
      //判断输入的值不能为空
      var create_name = $.trim($('#created_name').val());
      var from = $.trim($('#from').val());
      if(create_name.length === 0 && from.length === 0){
        alert('请输入搜索内容');
        return;
      }
      
      if(create_name.length>0 && (!validateInput(create_name))){
    	  alert('作者中存在不合理字符！');
          $('#create_name').focus();
          return;
      }
      
      if(from.length>0 && (!validateInput(from))){
    	  alert('来源中存在不合理字符！');
          $('#bundle').focus();
          return;
      }
      
      
      
      id = 'searchInfoBox';
    }else if (a === 'colleage') {
      //判断输入的值不能为空
      var ss_name = $.trim($('#ss_name').val());
      var ss_orgName = $.trim($('#ss_orgName').val());
      
      var ss_position = $.trim($('#ss_position').val());
      var ss_officephone = $.trim($('#ss_officephone').val());
      
      var ss_mobilephone = $.trim($('#ss_mobilephone').val());
      var ss_email = $.trim($('#ss_email').val());
      
      
      var ss_userid = $.trim($('#ss_userid').val());
      var ss_roomnumber = $.trim($('#ss_roomnumber').val());
      
      if(ss_name.length === 0 && ss_orgName.length === 0 && 
    		  ss_position.length === 0 && ss_officephone.length === 0 &&
    		  ss_mobilephone.length === 0 && ss_email.length === 0 &&	
    		  ss_userid.length === 0 && ss_roomnumber.length === 0 ){
        alert('请输入搜索内容');
        return;
      }
      
      //逐个验证
      if(ss_name.length>0 && (!validateInput(ss_name))){
    	  alert('姓名中存在不合理字符！');
          $('#ss_name').focus();
          return;
      }
      
      if(ss_orgName.length>0 && (!validateInput(ss_orgName))){
    	  alert('公司中存在不合理字符！');
          $('#ss_orgName').focus();
          return;
      }
      
      if(ss_position.length>0 && (!validateInput(ss_position))){
    	  alert('职位中存在不合理字符！');
          $('#ss_position').focus();
          return;
      }
      
      if(ss_officephone.length>0 && (!validateInput(ss_officephone))){
    	  alert('办公号码中存在不合理字符！');
          $('#ss_officephone').focus();
          return;
      }
      
      if(ss_mobilephone.length>0 && (!validateInput(ss_mobilephone))){
    	  alert('手机号中存在不合理字符！');
          $('#ss_mobilephone').focus();
          return;
      }
      
      if(ss_email.length>0 && (!validateInput(ss_email))){
    	  alert('电子邮箱中存在不合理字符！');
          $('#ss_email').focus();
          return;
      }
      
      if(ss_userid.length>0 && (!validateInput(ss_userid))){
    	  alert('用户ID中存在不合理字符！');
          $('#ss_userid').focus();
          return;
      }
      
      if(ss_roomnumber.length>0 && (!validateInput(ss_roomnumber))){
    	  alert('房间号中存在不合理字符！');
          $('#ss_roomnumber').focus();
          return;
      }
      
      id = 'searchColleageBox';
    }

    if (id.length === 0) {
      return;
    }

    $('#' + id).find('input').each(function(){
      custom += $(this).attr('name') + '=' + encodeURIComponent($(this).val()) + '&';
    });
    $('#' + id).find('select').each(function(){
      custom += $(this).attr('name') + '=' + encodeURIComponent($(this).val()) + '&';
    });
  }
  
  key = encodeURIComponent(key);

  location.href = searchBaseUrl + '/' + a + '?keywords=' + key + '&' + custom;
}

$(function(){
  ChinaUnicom.page.initialize();
  ChinaUnicom.headerClock.initialize();
  ChinaUnicom.appCenter.initializeHeader();
  ChinaUnicom.search.initialize();
});

function alert(content){
  var pw = ChinaUnicom.dialog.pageWidth(),ph = ChinaUnicom.dialog.pageHeight();
  if(typeof pw == 'undefined'){
    pw = window.screen.width;
  }
  var left = (1-310/pw)/2;
  left = parseInt(left*100);
  
  var msg = '<div class="error" style="width:310px;">';
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
