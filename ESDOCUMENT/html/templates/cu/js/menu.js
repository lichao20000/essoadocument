$(function(){

$('#cwyw').mouseover(function(){
	$("#panel").load("load/cwyw.html");	
	$(this).css({color : "#666666", 'font-weight' : "bold", 'padding-left' : "6px"});
	$(this).parent().css('background-color','#e8e8e8');
	$(this).parent().siblings().css('background-color','#f4f4f4');
	$(this).parent().siblings().children('a').css({color : "#888888", 'font-weight' : "normal", 'padding-left' : "4px"});
	initMargin();
});

$('#gsyy').mouseover(function(){
	$("#panel").load("load/gsyy.html");
	$(this).css({color : "#666666", 'font-weight' : "bold", 'padding-left' : "6px"});
	$(this).parent().css('background-color','#e8e8e8');
	$(this).parent().siblings().css('background-color','#f4f4f4');
	$(this).parent().siblings().children('a').css({color : "#888888", 'font-weight' : "normal", 'padding-left' : "4px"});
	initMargin();
});

$('#sqpz').mouseover(function(){
	$("#panel").load("load/sqpz.html");
	$(this).css({color : "#666666", 'font-weight' : "bold", 'padding-left' : "6px"});
	$(this).parent().css('background-color','#e8e8e8');
	$(this).parent().siblings().css('background-color','#f4f4f4');
	$(this).parent().siblings().children('a').css({color : "#888888", 'font-weight' : "normal", 'padding-left' : "4px"});
	initMargin();
});

$('#cwkj').mouseover(function(){
	$("#panel").load("load/cwkj.html");
	$(this).css({color : "#666666", 'font-weight' : "bold", 'padding-left' : "6px"});
	$(this).parent().css('background-color','#e8e8e8');
	$(this).parent().siblings().css('background-color','#f4f4f4');
	$(this).parent().siblings().children('a').css({color : "#888888", 'font-weight' : "normal", 'padding-left' : "4px"});
	initMargin();
});

$('#gryy').mouseover(function(){
	$("#panel").load("load/gryy.html");
	$(this).css({color : "#666666", 'font-weight' : "bold", 'padding-left' : "6px"});
	$(this).parent().css('background-color','#e8e8e8');
	$(this).parent().siblings().css('background-color','#f4f4f4');
	$(this).parent().siblings().children('a').css({color : "#888888", 'font-weight' : "normal", 'padding-left' : "4px"});
	initMargin();
});

$('#qtyy').mouseover(function(){
	$("#panel").load("load/qtyy.html");
	$(this).css({color : "#666666", 'font-weight' : "bold", 'padding-left' : "6px"});
	$(this).parent().css('background-color','#e8e8e8');
	$(this).parent().siblings().css('background-color','#f4f4f4');
	$(this).parent().siblings().children('a').css({color : "#888888", 'font-weight' : "normal", 'padding-left' : "4px"});
	initMargin();
});

var initMargin = function(){
	$('#panel').css("margin-left","0px");
	$('#panel ul li a').corner("3px");
	menuSliding({
		stage:'menu-sliding',
		panel:'panel',
		left:'moveLeft',
		right:'moveRight'
	});
}

menuSliding({
		stage:'menu-sliding',
		panel:'panel',
		left:'moveLeft',
		right:'moveRight'
	});
	
$('.provinces_news_top').click(function(){
	$("html, body").animate({ scrollTop: 0 }, 250);
});	

});