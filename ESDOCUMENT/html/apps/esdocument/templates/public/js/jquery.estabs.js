/*!
 * esTabs 1.0.0
 * Date: 2012-08-23 22:57
 */
; (function ($) { 
	var curTab = null;
	var tabs = {};
	var id = 0;
	var optionsDefault = {};
	var topToggleCallback = null;
	var openDefault = {
		title : "新标签",
		content : "",
		canClose : false, 
		activated : true,
		id : 0
	};
	
	var methods = {
		// 初始化方法
		init : function(options){
			var opt = $.extend({},optionsDefault, options);
			return $(this).each(function(){
				$(this).addClass("estabs");
				$(this).height(44);
				$(this).find(".close").live('click', function(){
					$.fn.esTabs("close", $($(this).siblings("span")[0]).text());
				});
				$(this).find("li").live('click', function(){
					$.fn.esTabs("select", $.trim($(this).text()));
				});
				// 切换头部
				$("#topToggle").click(function(){
					$("#page-top").toggle();
					$("#topToggle").toggleClass("show_top", !$("#page-top").is(":visible"));
					$("body").toggleClass("bodybackground", !$("#page-top").is(":visible"));
					if(topToggleCallback) topToggleCallback();
				});
				
			});
		},
		// 打开标签页
		open : function(parm){
			var tab = $.extend({},openDefault, parm);
			if(tabs[tab.title]){
				$.fn.esTabs("select", tab.title);
			} else {
				id++;
				tab.id = "estabs_" + id;
				return $(this).each(function(){
					tab.li = $("<li id=" + tab.id + "><span>" + tab.title + "</span></li>");
					if(tab.canClose){
						tab.li.append("<div id=" + tab.id + "_close class='close'>&nbsp;</div>");
					}
					tab.li.appendTo($(this));
					tabs[tab.title] = tab;
					if(tab.activated){
						$.fn.esTabs("select", tab.title);
					}

				});
			}
			
		},
		// 选择标签页
		select : function(title){
			if(tabs[title] != curTab){
				if(tabs[title]){
					if(curTab){
						curTab.li.removeClass("cur");
						$(curTab.content).hide();
					}
					tabs[title].li.addClass("cur");
					curTab = tabs[title];
					$(curTab.content).show();
				}
			}
			return $(this);
		},
		// 关闭标签页
		close : function(title){
			if(tabs[title]){
				var ele = tabs[title].li;
				if(curTab==tabs[title] && ele.siblings().length > 0) {
					$(ele.siblings()[0]).addClass("cur");
					curTab = tabs[$.trim($(ele.siblings()[0]).text())];
					$(curTab.content).show();
				}
				ele.remove();
				$(tabs[title].content).html("");
				delete tabs[title];
			}
			return $(this);
		},
		// 头部隐藏显示切换回到函数
		onTopToggle : function(toggle){
			topToggleCallback = toggle;
		}
	};
	$.fn.esTabs = function(method){
		if ( methods[method] ) {
	      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'jQuery.esTabs中不存在“' +  method + '”方法' );
	    } 
	};
})(jQuery); 