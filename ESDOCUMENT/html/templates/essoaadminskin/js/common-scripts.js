var Script = function() {

	$('#main-content').css({
		'margin-left' : '0px'
	});
	
	
	// sidebar dropdown menu

	jQuery('#sidebar .sub-menu > a').click(function() {
		var last = jQuery('.sub-menu.open', $('#sidebar'));
		last.removeClass("open");
		jQuery('.arrow', last).removeClass("open");
		jQuery('.sub', last).slideUp(200);
		var sub = jQuery(this).next();
		if (sub.is(":visible")) {
			jQuery('.arrow', jQuery(this)).removeClass("open");
			jQuery(this).parent().removeClass("open");
			sub.slideUp(200);
		} else {
			jQuery('.arrow', jQuery(this)).addClass("open");
			jQuery(this).parent().addClass("open");
			sub.slideDown(200);
		}
		var o = ($(this).offset());
		diff = 200 - o.top;
		if (diff > 0)
			$(".sidebar-scroll").scrollTo("-=" + Math.abs(diff), 500);
		else
			$(".sidebar-scroll").scrollTo("+=" + Math.abs(diff), 500);
	});

	jQuery(".sidebar-toggle-box").click(function(){
		if(jQuery("#appContainer").is(":visible")){
			jQuery("#appContainer").hide();
		} else {
			jQuery("#appContainer").show();
		}
	});


	/* sidebar toggle
	var meggageTimer = null;
	$(".sidebar-toggle-box,#sidebar > ul,.sidebarContainer").hover(function() {
		
		//$('#main-content').css({
			//'margin-left' : '180px'
		//});
		$('#sidebar > ul').show(500);
		$('#sidebar,#sidebarContainer').css({
			'margin-left' : '0'
		});
		//$("#container").removeClass("sidebar-closed");
		if(meggageTimer != null) clearTimeout(meggageTimer);
		meggageTimer = null;
	}, function() {
		meggageTimer = setTimeout(function(){
			//$('#main-content').css({
			//	'margin-left' : '0px'
			//});
			$('#sidebar,#sidebarContainer').css({
				'margin-left' : '-180px'
			});
			$('#sidebar > ul').hide();
			$("#container").addClass("sidebar-closed");
		}, 100);
	});
	*/
/* 暂时注释掉鼠标点击事件！

	$('.sidebar-toggle-box').click(function() {
		if ($('#sidebar > ul').is(":visible") === true) {
			$('#main-content').css({
				'margin-left' : '0px'
			});
			$('#sidebar,#sidebarContainer').css({
				'margin-left' : '-180px'
			});
			$('#sidebar > ul').hide();
			$("#container").addClass("sidebar-closed");
		} else {
			$('#main-content').css({
				'margin-left' : '180px'
			});
			$('#sidebar > ul').show();
			$('#sidebar,#sidebarContainer').css({
				'margin-left' : '0'
			});
			$("#container").removeClass("sidebar-closed");
		}
	});
*/
	// custom scrollbar
	$(".sidebar-scroll").niceScroll({
		styler : "fb",
		cursorcolor : "#4A8BC2",
		cursorwidth : '5',
		cursorborderradius : '0px',
		background : '#404040',
		cursorborder : ''
	});

	$(".portlet-scroll-1").niceScroll({
		styler : "fb",
		cursorcolor : "#4A8BC2",
		cursorwidth : '5',
		cursorborderradius : '0px',
		background : '#404040',
		cursorborder : ''
	});

	$(".portlet-scroll-2").niceScroll({
		styler : "fb",
		cursorcolor : "#4A8BC2",
		cursorwidth : '5',
		cursorborderradius : '0px',
		autohidemode : false,
		cursorborder : ''
	});

	$(".portlet-scroll-3").niceScroll({
		styler : "fb",
		cursorcolor : "#4A8BC2",
		cursorwidth : '5',
		cursorborderradius : '0px',
		background : '#404040',
		autohidemode : false,
		cursorborder : ''
	});

	$("html").niceScroll({
		styler : "fb",
		cursorcolor : "#4A8BC2",
		cursorwidth : '8',
		cursorborderradius : '0px',
		background : '#404040',
		cursorborder : '',
		zindex : '1000'
	});

	// theme switcher

	var scrollHeight = '60px';
	jQuery('#theme-change')
			.click(
					function() {
						if ($(this).attr("opened") && !$(this).attr("opening")
								&& !$(this).attr("closing")) {
							$(this).removeAttr("opened");
							$(this).attr("closing", "1");

							$("#theme-change")
									.css("overflow", "hidden")
									.animate(
											{
												width : '20px',
												height : '22px',
												'padding-top' : '3px'
											},
											{
												complete : function() {
													$(this).removeAttr(
															"closing");
													$("#theme-change .settings")
															.hide();
												}
											});
						} else if (!$(this).attr("closing")
								&& !$(this).attr("opening")) {
							$(this).attr("opening", "1");
							$("#theme-change").css("overflow", "visible")
									.animate({
										width : '226px',
										height : scrollHeight,
										'padding-top' : '3px'
									}, {
										complete : function() {
											$(this).removeAttr("opening");
											$(this).attr("opened", 1);
										}
									});
							$("#theme-change .settings").show();
						}
					});

	jQuery('#theme-change .colors span').click(function() {
		var color = $(this).attr("data-style");
		setColor(color);
	});

	jQuery('#theme-change .layout input').change(function() {
		setLayout();
	});

	var setColor = function(color) {
		$('#style_color').attr("href", "css/style-" + color + ".css");
	}

	// widget tools

	jQuery('.widget .tools .icon-chevron-down').click(
			function() {
				var el = jQuery(this).parents(".widget").children(
						".widget-body");
				if (jQuery(this).hasClass("icon-chevron-down")) {
					jQuery(this).removeClass("icon-chevron-down").addClass(
							"icon-chevron-up");
					el.slideUp(200);
				} else {
					jQuery(this).removeClass("icon-chevron-up").addClass(
							"icon-chevron-down");
					el.slideDown(200);
				}
			});

	jQuery('.widget .tools .icon-remove').click(function() {
		jQuery(this).parents(".widget").parent().remove();
	});

	// tool tips

	$('.element').tooltip();

	$('.tooltips').tooltip();

	// popovers

	$('.popovers').popover();

	// scroller

	$('.scroller').slimscroll({
		height : 'auto'
	});
	
//	var isShow = false;
	$("#msgLogoa").click(function(){
		$('.msgBox').toggle(150);
		});
	
	$(document).bind("click",function(e){ 
	    var target  = $(e.target); 
	    if(target.closest("#header_inbox_bar").length == 0 && target.closest(".msgBox").length == 0 ){ 
	        $(".msgBox").hide(150); 
	    }
	});
	
	/** 未首页暂时屏蔽消息 **/
	if($(".sidebar-scroll").html() == null){
		$("#msgLogoa").css('display',"none");
//		$("#userMsgToggle").css('display',"none");
		
	}else{
		$("#msgLogoa").css('display',"");
//		$("#userMsgToggle").css('display',"");
	}
	
	
	/** soaadmin跳转 **/
	$("#soaManage").bind("click",function(e){ 
		var urlLocation = window.location.href+"";
		urlLocation = urlLocation.substring(0,urlLocation.indexOf("essoaadmin"));
		var srcLocation = urlLocation + $(this).attr("rel");
		window.open(srcLocation,"_self");
	});
	
}();