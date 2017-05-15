var ChinaUnicom = {};
var App = {
  developing: function() {
    alert('该功能开发中...');
    return false;
  }
};

ChinaUnicom.headerClock = {
  initialize: function() {
    var dClock = jQuery('#header-clock');
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
}

ChinaUnicom.appCenter = {
  list: [],
  current: 'all',
  initializeHeader: function() {
    var value = jQuery('#applist_value');
    if (!value.length) {
      return;
    }
    var self = ChinaUnicom.appCenter;
    self.list = jQuery.parseJSON(value.val());
    var dButtons = jQuery('#appslicerbutton p:lt(5)'), dSearch = jQuery('#appsearch'), textSearch = '搜索应用名称';
    dButtons.click(function(e) {
      e.preventDefault();
      dButtons.filter('.appCenterLOn').removeClass('appCenterLOn');
      jQuery(this).addClass('appCenterLOn');
      var index = jQuery(this).children('a').attr('rel').substr(1), pi, pj, counter;
      self.current = index;
      self.showList(self.getList(index));
      dSearch.val(textSearch);
    });
    if (dSearch.length > 0) {
      dSearch.focus(function(e) {
        if (this.value == textSearch) {
          this.value = '';
        }
      }).blur(function(e) {
        if (jQuery.trim(this.value) == '') {
          this.value = textSearch;
        }
      });
      var doSearch = function() {
        var text = jQuery.trim(dSearch.val()), list = self.getList();
        if (text == '' || text == textSearch) {
          self.showList(list);
          return;
        }
        var result = [], pi;
        for (var i in list) {
          pi = list[i];
          if (pi.name.indexOf(text) !== -1) {
            result.push(pi);
          }
        }
        self.showList(result);
      }
      dSearch.keydown(function(e) {
        if (e.keyCode == 13) {
          doSearch();
          return false;
        }
      });
      jQuery('#appsearchbutton').click(function(e) {
        e.preventDefault();
        doSearch();
      });
    }
    jQuery('#appslicerbutton a[rel=k0]').trigger('click');
  },
  getList: function(index) {
    var self = ChinaUnicom.appCenter, list = [];
    if (typeof index == 'undefined') {
      index = self.current;
    }
    if (index === 'all') {
      var urls = [];
      for (var i in self.list) {
        pi = self.list[i];
        for (var j in pi) {
          pj = pi[j];
          if (jQuery.inArray(pj.url, urls) === -1) {
            list.push(pj);
            urls.push(pj.url);
          }
        }
      }
    } else {
      list = self.list[index];
    }
    return list;
  },
  showList: function(list) {
    var dSlider = jQuery('#appslider');
    if (!dSlider.length) {
      return;
    }
    var self = ChinaUnicom.appCenter;
    if(self.current == 0 && list.length == 0){
      dSlider.html('<div class="color999 font14" style="width:200px;">您尚未选择任何常用业务应用！</div><br/><a href="'+baseUrl+'setting/0/appshow" class="font14 fontWeight100 underline color369 ">设置常用业务应用</a>');
      return;
    }
    var html = [], pi;
    html.push('<ul style="float:left;height:175px"><li class="appCenterRIcons" style="height:180px">');
    for (var i in list) {
      pi = list[i];
      html.push('<div class="appCenterRIcons1"><a href="' +baseUrl+ pi.url.substr(1) + '"' + (pi.target == 'new' ? ' target="_blank"' : '') + '><img src="' +baseUrl+ pi.icon + '" width="32" height="32" alt="' + pi.name + '" align="absmiddle"/><span>' + pi.name + '</span></a></div>');
      if ((parseInt(i, 10) + 1) % 12 === 0  && list.hasOwnProperty( parseInt(i,10) + 1 ) ) {
        html.push('</li><li class="appCenterRIcons" style="height:180px">');
      }
    }
    html.push('</li></ul>');
    if (list.length <= 12) {
      jQuery('#appsliderpage').hide();
    } else {
      jQuery('#appsliderpage').html('<span id="prevslide"><a href="javascript:void(0);"><img src="' + tplPath + '/images/previous.gif"  width="50" height="31" alt="上一页"  align="absmiddle"  style="margin:0 1px 0 10px" /></a></span><span id="nextslide"><a href="javascript:void(0);"><img src="' + tplPath + '/images/next.gif" width="50" height="31" alt="下一页"  align="absmiddle" /></a></span>').show();
    }
    dSlider.html(html.join('')).easySlider({
      auto: false,
      continuous: false,
      prevId : 'prevslide',
      nextId : 'nextslide'
    });
  }
};

var searchAreaStatus = false;
var searchBoxHide = function() {
  jQuery('#searchInfoBox').hide();
  searchAreaStatus = false;
};

var text_info = '请输入关键词（搜新闻、通知、待办待阅、其它应用信息）';
var text_member = '请输入关键词（搜全国通讯录，专业通讯录，个人通讯录）';
var text_app = '请输入关键词（搜接入云门户的应用）';

jQuery(function(){
  jQuery("#seachKey").click(function () { 
    var check1 = jQuery(this).val(); 
    if (check1 == this.defaultValue) { 
      jQuery(this).removeClass('topInput');
      jQuery(this).val(""); 
    } 
  }).blur(function () { 
    var check1 = jQuery(this).val();
    if (check1.length === 0){
      jQuery(this).addClass('topInput');
      jQuery(this).val(this.defaultValue); 
    } else {
      jQuery(this).removeClass('topInput');
    }
  });
  jQuery('#menu_appcenter').toggle(function(){
    jQuery('.appCenterBox').slideDown('fast');
  },function(){
    jQuery('.appCenterBox').slideUp('fast');
  });
  jQuery('.appCenterRClose').click(function(){
    jQuery('#menu_appcenter').trigger('click');
  });

  jQuery("#appslider").easySlider({
    auto: false,
    continuous: false,
    prevId : 'prevslide',
    nextId : 'nextslide'
  });

  jQuery('#showSearchList').toggle(function(){
    jQuery('#searchListPanel').show();
  },function(){
    jQuery('#searchListPanel').hide();
  });

  jQuery('#searchListPanel').find('a').click(function(){
    var val = jQuery(this).attr('value');
    jQuery('#searchArea').attr('value', val);
    jQuery('#searchArea').html(jQuery(this).html());
    //jQuery('#searchListPanel').find('a').css({fontWeight:'normal'});
    //jQuery(this).css({fontWeight:'bold'});
    var hint;
    if (val === 'info') {
      var hint = text_info;
    }else if(val === 'colleage') {
      var hint = text_member;
    } else {
      var hint = text_app;
    }
    jQuery('#seachKey')[0].defaultValue = hint;
    jQuery('#seachKey').val(hint);
    jQuery('#showSearchList').trigger('click');
  });

  jQuery('#adv_colleage_more').toggle(function(){
    jQuery('ul[name=colleage_more]').show();
    jQuery('#adv_colleage_more_text').html('较少搜索条件');
  },function(){
    jQuery('ul[name=colleage_more]').hide();
    jQuery('#adv_colleage_more_text').html('较多搜索条件');
  });
  
  jQuery('#showSearchListBox').click(function(e){
	//return;
    //e.preventDefault();
    //if (searchAreaStatus) {
    //  searchBoxHide();
    //} else {
	  var val = jQuery('#searchArea').attr('value');
      if (val === 'info') {
    	  jQuery('#searchInfoBox').show();
    	  jQuery('#searchColleageBox').hide();
      }else if(val === 'colleage') {
    	  jQuery('#searchInfoBox').hide(); 
    	  jQuery('#searchColleageBox').show();
      }
    //}
  });
  
  if (typeof menuitem != 'undefined') {
    jQuery('.topMenu').children().removeClass('topMenuOn');
    jQuery('#' + menuitem).addClass('topMenuOn');
  }

  ChinaUnicom.headerClock.initialize();
  ChinaUnicom.appCenter.initializeHeader();
  
	jQuery("#seachKey").keydown(function(e){ 
		var curKey = e.which; 
		if(curKey == 13){ 
			search('common', baseUrl+'search');
			return false; 
		} 
		});
  
  
});

function search(type, baseUrl){
  var key = '';
  var custom = '';
  var a = jQuery('#searchArea').attr('value');
  if(type === 'common'){
    key = jQuery('#seachKey').val();
    if(key.length == 0){
      alert('请输入搜索内容');
      jQuery('#seachKey').focus();
      return;
    }
    if(key == text_info || key == text_member || key == text_app){
      return;
    }
  } else if (type === 'custom') {
    //alert(1);
    var id='';
    if (a === 'info') {
      id = 'searchInfoBox';
    }else if (a === 'colleage') {
      id = 'searchColleageBox';
    }

    if (id.length === 0) {
      return;
    }

    jQuery('#' + id).find('input').each(function(){
      custom += jQuery(this).attr('name') + '=' + jQuery(this).val() + '&';
    });
    jQuery('#' + id).find('select').each(function(){
      custom += jQuery(this).attr('name') + '=' + jQuery(this).val() + '&';
    });
  }
  //key = encodeURIComponent(encodeURIComponent(Base64.encode(key)));
  key = encodeURIComponent(key);
  //window.location.href = baseUrl + '/' + a + '/' + key + '?' + custom;
  //alert(baseUrl + '/' + a + '?keywords=' + key + '&' + custom);
  location.href = baseUrl + '/' + a + '?keywords=' + key + '&' + custom;
}
