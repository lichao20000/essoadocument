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
    jQuery('#usualAPPDisplay_opt').hide();
    if(self.current == 0 ){
      if ( list.length == 0){
        dSlider.html('<div class="color999 font14" style="width:200px;">您尚未选择任何常用业务应用！</div><br/><a href="'+baseUrl+'setting/0/appshow" class="font14 fontWeight100 underline color369 ">设置常用业务应用</a>');
        return;
      }
      jQuery('#usualAPPDisplay_opt').show();
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

/*var searchAreaStatus = false;
var searchBoxHide = function() {
  jQuery('#searchInfoBox').hide();
  searchAreaStatus = false;
};*/

//var searchAreaStatus = false;
var searchBoxHide = function(op) {
  if(typeof op == 'undefined' ){
	  //$('#searchInfoBox').hide();
	  //searchAreaStatus = false;
  }	else {
      if (op === 'info') {
        jQuery('#searchInfoBox').hide();
        //jQuery('#searchColleageBox').show();
      }else if(op === 'colleage') {
        //jQuery('#searchInfoBox').show(); 
        jQuery('#searchColleageBox').hide();
      }
      //searchAreaStatus = true; 
  }

};


var text_info = '搜新闻、通知、待办待阅、其它应用信息';
var text_member = '搜全国通讯录，专业通讯录，个人通讯录';
var text_app = '搜接入云门户的应用';

jQuery(function(){
	//首次加载时，加入关键字
  var curSearchKey = decodeURIComponent(jQuery('#seachKey').val());
  if(curSearchKey!=='' && curSearchKey!==text_info && curSearchKey!==text_member && curSearchKey!==text_app){
	jQuery('#seachKey')[0].defaultValue = curSearchKey;
	jQuery('#seachKey').val(curSearchKey);
  }
  jQuery("#seachKey").click(function () { 
    var check1 = decodeURIComponent(jQuery(this).val());
    //if (check1 == this.defaultValue) { 
    if(check1==text_info || check1==text_member || check1==text_app){
      jQuery(this).removeClass('topInput');
      jQuery(this).val(""); 
    } 
  }).blur(function () { 
	var check1 = decodeURIComponent(jQuery(this).val());
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

  jQuery('#closePop').click(function(){
	  jQuery('#topAppCenter_default').hide();
	  jQuery('body').removeClass('body_topapp');
	  jQuery('body').addClass('body_topappclose');
	  jQuery('#topAppCenter_close').show();
    });
    
  jQuery('#openPop').click(function(){
	  jQuery('#topAppCenter_close').hide();
	  jQuery('body').addClass('body_topapp');
	  jQuery('body').removeClass('body_topappclose');
	  jQuery('#topAppCenter_default').show();
    });
  
  jQuery("#slide1").easySlider({
      auto: false,
      continuous: false,
      prevId: 'pop_prev1',
      nextId: 'pop_next1',
      controlsFade: false,
      prevIdFirst: 'pop_prev1_first',
      nextIdLast: 'pop_next1_last'
    });
    
  jQuery("#slide2").easySlider({
      auto: false,
      continuous: false,
      prevId : 'pop_prev2',
      nextId : 'pop_next2',
      controlsFade: false,
      prevIdFirst: 'pop_prev2_first',
      nextIdLast: 'pop_next2_last'
    });
    
  jQuery("#slide3").easySlider({
      auto: false,
      continuous: false,
      prevId : 'pop_prev3',
      nextId : 'pop_next3',
      controlsFade: false,
      prevIdFirst: 'pop_prev3_first',
      nextIdLast: 'pop_next3_last'
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
    jQuery('#searchListPanel').find('a').css({fontWeight:'normal'});
    jQuery(this).css({fontWeight:'bold'});
    var hint;
    var curSearchKey = decodeURIComponent(jQuery('#seachKey').val());
    if (val === 'info') {
  	if(curSearchKey==text_info || curSearchKey==text_member || curSearchKey==text_app){
  		hint = text_info;
  	} else {
  		hint = curSearchKey;
  	} 
    }else if(val === 'colleage') {
  	  if(curSearchKey==text_info || curSearchKey==text_member || curSearchKey==text_app){
  		hint = text_member;
  	} else {
  		hint = curSearchKey;
  	}
    } else {
  	  if(curSearchKey==text_info || curSearchKey==text_member || curSearchKey==text_app){
    		hint = text_app;
    	} else {
    		hint = curSearchKey;
    	}
    }
    jQuery('#seachKey')[0].defaultValue = hint;
    jQuery('#seachKey').val(hint);
    //searchAreaStatus = false;
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

function search(type, baseUrl){
  
  var key = '';
  var custom = '';
  var a = jQuery('#searchArea').attr('value');
  
  if(type === 'common'){
    key = jQuery.trim(jQuery('#seachKey').val());
    key = decodeURIComponent(key);
    if(key.length === 0){
      alert('请输入搜索内容');
      jQuery('#seachKey').focus();
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
      jQuery('#seachKey').focus();
      return;
    }
    
    if(key == text_info || key == text_member || key == text_app){
      return;
    }
  } else if (type === 'custom') {
    var id='';
    if (a === 'info') {
      //判断输入的值不能为空
      var create_name = jQuery.trim(jQuery('#created_name').val());
      var from = jQuery.trim(jQuery('#from').val());
      if(create_name.length === 0 && from.length === 0){
        alert('请输入搜索内容');
        return;
      }
      
      if(create_name.length>0 && (!validateInput(create_name))){
    	  alert('作者中存在不合理字符！');
          jQuery('#create_name').focus();
          return;
      }
      
      if(from.length>0 && (!validateInput(from))){
    	  alert('来源中存在不合理字符！');
          jQuery('#bundle').focus();
          return;
      }
      
      id = 'searchInfoBox';
    }else if (a === 'colleage') {
      //判断输入的值不能为空
      var ss_name = jQuery.trim(jQuery('#ss_name').val());
      var ss_orgName = jQuery.trim(jQuery('#ss_orgName').val());
      
      var ss_position = jQuery.trim(jQuery('#ss_position').val());
      var ss_officephone = jQuery.trim(jQuery('#ss_officephone').val());
      
      var ss_mobilephone = jQuery.trim(jQuery('#ss_mobilephone').val());
      var ss_email = jQuery.trim(jQuery('#ss_email').val());
      
      
      var ss_userid = jQuery.trim(jQuery('#ss_userid').val());
      var ss_roomnumber = jQuery.trim(jQuery('#ss_roomnumber').val());
      
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
          jQuery('#ss_name').focus();
          return;
      }
      
      if(ss_orgName.length>0 && (!validateInput(ss_orgName))){
    	  alert('公司中存在不合理字符！');
          jQuery('#ss_orgName').focus();
          return;
      }
      
      if(ss_position.length>0 && (!validateInput(ss_position))){
    	  alert('职位中存在不合理字符！');
          jQuery('#ss_position').focus();
          return;
      }
      
      if(ss_officephone.length>0 && (!validateInput(ss_officephone))){
    	  alert('办公号码中存在不合理字符！');
          jQuery('#ss_officephone').focus();
          return;
      }
      
      if(ss_mobilephone.length>0 && (!validateInput(ss_mobilephone))){
    	  alert('手机号中存在不合理字符！');
          jQuery('#ss_mobilephone').focus();
          return;
      }
      
      if(ss_email.length>0 && (!validateInput(ss_email))){
    	  alert('电子邮箱中存在不合理字符！');
          jQuery('#ss_email').focus();
          return;
      }
      
      if(ss_userid.length>0 && (!validateInput(ss_userid))){
    	  alert('用户ID中存在不合理字符！');
          jQuery('#ss_userid').focus();
          return;
      }
      
      if(ss_roomnumber.length>0 && (!validateInput(ss_roomnumber))){
    	  alert('房间号中存在不合理字符！');
          jQuery('#ss_roomnumber').focus();
          return;
      }
      
      id = 'searchColleageBox';
    }

    if (id.length === 0) {
      return;
    }

    jQuery('#' + id).find('input').each(function(){
      custom += jQuery(this).attr('name') + '=' + encodeURIComponent(jQuery(this).val()) + '&';
    });
    jQuery('#' + id).find('select').each(function(){
      custom += jQuery(this).attr('name') + '=' + encodeURIComponent(jQuery(this).val()) + '&';
    });
  }
  key = encodeURIComponent(key);

  location.href = baseUrl + '/' + a + '?keywords=' + key + '&' + custom;
}