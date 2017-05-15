$(document).ready(function(){
	input_v(); g_event(); auto_height();
});

$(window).resize(function(){
	auto_height();
});

// 自动响应文本框初始值
function input_v(){
	var e = $('input[type=text],input[type=password],textarea');
	e.each(function(){
		var t = $(this),
			v = t.val(),
			nv = '';
		if( v != '' ){
			t.focus(function(){
				if(t.attr("id")!='searchWord'){//liqiubo 20150130 跳过检索词文本框
					nv = $(this).val()!=v ? $(this).val() : '';
					t.val(nv);
				}
			}).blur(function(){
				if(t.attr("id")!='searchWord'){//liqiubo 20150130 跳过检索词文本框
					nv = $(this).val()!='' ? $(this).val() : v;
					t.val(nv);
				}
			});
		}
	});
}

// longjunhao 20150130 修改
// 自适应高度
function auto_height(){
	$('.page').height($(window).height()-90); // -30px
	var localHrefUrl = window.location.href;
	if(!(localHrefUrl.indexOf("detail_paper")>0 && localHrefUrl.indexOf("ESPicMove")>0)){
		$('.page_content').height($(window).height()-94);
	}
	$('.page .menu .items').height($(window).height()-210);
	// 调整 “所有功能” 的cell高度
	if($(window).height() < 620){
		$('.page .menu .all li a').css({
			'height': '50px',
			'line-height': '50px'
		});
	}else{
		$('.page .menu .all li a').css({
			'height': '60px',
			'line-height': '60px'
		});
	}
	// 调整右下方“快捷按钮”的大小
	if($(window).height() < 640){
		$('.page .menu .items li .icon').hide();
	}else if($(window).height() < 690){
		$('.page .menu .items li .avatar').css({
			'width': '50px',
			'height': '50px',
			'border-radius': '25px'
		});
		$('.page .menu .items li .icon').show().css({
			'width': '30px',
			'height': '30px'
		});
	}else{
		$('.page .menu .items li .avatar').css({
			'width': '60px',
			'height': '60px',
			'border-radius': '30px'
		});
		$('.page .menu .items li .icon').show().css({
			'width': '40px',
			'height': '40px'
		});
	}
	if($(window).width() < 1165){
		$('.inner-btn li a').css('font-size','12px');
	}else{
		$('.inner-btn li a').css('font-size','14px');
	}
	// 调整右侧高度
//	alert($(window).height()); 
	if($(window).height() <= 550){
		$('.inner-btn li a').height(85);
		$('.inner-btn li a img').css({
			'width': '30px',
			'margin-bottom': '.25em'
		});
		$('.notice-box').height(169);
		$('.notice-box .list dl').css('font-size','12px');
		$('.message-task').height(359); // +10px
		$('.message-task .list li .title a').css('font-size','14px');
		$('.inner-b-btn li a').css('padding-top','88px'); // +18px
	}else if($(window).height() <= 640){
		$('.notice-box').height($(window).height() - 416); // -35px
		$('.message-task').height($(window).height() - 216); // -20px
		$('.inner-btn li a').height(90);	// +10px
		$('.inner-btn li a img').css({
			'width': '30px',
			'margin-bottom': '.25em'
		});
		$('.notice-box .list dl').css('font-size','12px');
		$('.message-task .list li .title a').css('font-size','14px');
		$('.inner-b-btn li a').css('padding-top','114px'); // +60px
	}else{
		$('.notice-box').height($(window).height() - 465); // +30px
		$('.message-task').height($(window).height() - 245); // +30px
		$('#preTaskListsContainer').css("height",$(window).height() - 335).css("overflow-y","auto");
		$('#ArchiveNewsLists').css("height",$(window).height() - 520).css("overflow-y","auto"); // +35px
		$('.inner-btn li a').height(100);
		$('.inner-btn li a img').css({
			'width': '30px',
			'margin-bottom': '.25em'
		});
		$('.notice-box .list dl').css('font-size','14px');
		$('.message-task .list li .title a').css('font-size','16px');
		$('.inner-b-btn li a').css('padding-top','145px');
	}
}

// 通用事件
function g_event(){
	/*
	$('.menu .all').hover(function(){
		$(this).find('ul').stop().slideDown();
	},function(){
		$(this).find('ul').stop().slideUp();
	});
	
	$('#allMenusContainer').hover(function(){
		$(this).find('.menuUls').slideDown();
	},function(){
		$(this).find('.menuUls').hide();
	});
	*/
	
	$("#allMenusContainer").click(function(){
		if($(this).find('.menuUls').css("display") != "block"){
			$(this).find('.menuUls').slideDown(100);
		}else{
			$(this).find('.menuUls').hide(100);
		}
			
		});
	
	$('.top-menu').click(function(){
		if ($(this).find('span').attr('class').indexOf('on')!=-1) {
			$(this).find('span').removeClass('on');
			$(this).find('#page_app_list_container').hide(100);
		} else {
			$(this).find('span').addClass('on');
			$(this).find('#page_app_list_container').stop().slideDown(100);
		}
	});
	
	$(document).bind("click",function(e){ 
	    var target  = $(e.target); 
	    if(target.closest("#allMenusContainer").length == 0 && target.closest(".menuUls").length == 0 ){ 
	    	$('.menuUls').hide(100);
	    }
	    if (target.closest(".top-menu").length == 0) {
	    	$(this).find('#page_app_list_container').hide(100);
	    	$(this).find('span').removeClass('on');
	    }
	});
	
	var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	var date = new Date();
	var dateString = (date.getMonth() + 1) + '/'+ date.getDate() + ' ' + date.getFullYear() + ' <span>'+weekDay[date.getDay()]+'</span>';
	$('#show_date').html(dateString);
	
	showTimer();
	
	if(!-[1,]){
		//$('.inner-b-btn li a').css('background-image','none');
	}
	
	$('.p_b .p_po li:nth-child(4n)').addClass('the4n');
	$('.p_b .p_po li:nth-child(4n)').prev().addClass('the3n');
	$('.p_b .p_po li:nth-child(4n)').prev().prev().addClass('the2n');
	$('.p_b .p_po li:nth-child(4n)').prev().prev().prev().addClass('the1n');
	
	/** 消息管理 **/
	$("#msgLogoa").click(function(){
		$('.msgBox').toggle(150);
		});
	
	$(document).bind("click",function(e){ 
	    var target  = $(e.target); 
	    if(target.closest(".msgLogoa").length == 0 && target.closest(".msgBox").length == 0 ){ 
	        $(".msgBox").hide(150); 
	    }
	});
}

function showTimer() {
	var date = new Date();
//	var timeString = IfZero(date.getHours()) + ':' + IfZero(date.getMinutes()) + ':' + IfZero(date.getSeconds());
//	$('#show_time').html(timeString);
	setTimeout('showTimer()', 1000);
}

function IfZero(num) {
	return num <= 9 ? '0' + num : num;
}


//longjunhao 20140811
$("#mainSearchBtn").live('click',function(){
	var wordVal=$("#mainSearchVal").val();
	if(wordVal=='' || wordVal==$('#mainSearchVal').attr('placeholder')){
		return false;
	}
	
	var url = $.appClient.generateUrl({ESArchiveSeache:"admin"});
	if (url.indexOf('essoaadmin') > -1) {
		url = url.replace('essoaadmin','escloudapp');
	}
	window.location.href =encodeURI(url+'#tag|'+wordVal+'|'+new Date().getTime());
	return;
});

$(".left-box .goHomeContainer").click(function() {
	var url = {};
	var controller = $(this).attr("controller");
	var action = $(this).attr("action");
	if(typeof controller === "string" && controller.length > 0){
		url[$(this).attr("controller")] = $(this).attr("action");
		window.open($.appClient.generateUrl(url), "_self");
	}
});

//xiewenda 2015/4/13
$("#page_app_list_container a").die().live("click",function(){
   var appid =$(this).attr('appid');
   var saasid =$(this).attr('saasid');
   //如果是跳转文控系统添加用户文控系统的登录日志 
   if(appid=='esdocument'){
	  // var url = $.appClient.generateUrl({ESLog: 'addLoginLog'},'x');
	   var url = "/"+appid+"/"+saasid+"/default/ESLog/addLoginLog";
	   $.ajax({url: url,
			  type : 'POST',
			  data:{},
			  success:function(msg){
			  }
		});
	}
})