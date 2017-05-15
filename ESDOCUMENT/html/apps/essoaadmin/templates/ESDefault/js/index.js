/*
 * 控制台系统首页
 * 
 */

window.onload = function (){
	$("#mainContentContainer").css("height", $(window).height() - 120);
	$("#centerFunc").css("margin-top", $(window).height() / 2 - 280);
	startTime();
}

/** 年月日的生成 * */
function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var week = today.getDay();
	m = checkTime(m);
	s = checkTime(s);
	$("#daySection").text(day);
	$("#monthSection").text(month + "月");
	$("#weekSection").text("星期" + week);

	document.getElementById('hourSection').innerHTML = h + ":" + m + ":" + s;
	t = setTimeout('startTime()', 500);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i
	}
	return i
}

/** liuhezeng  控制滚动条横向滚动 **/
var Browser = function(){
	var d_ = document,n_ = navigator,t_ = this,s_= screen;
	var b = n_.appName;
	var ua = n_.userAgent.toLowerCase();
	t_.name = "Unknow";
	 
	t_.safari = ua.indexOf("safari")>-1;  // always check for safari & opera
	t_.opera = ua.indexOf("opera")>-1;    // before ns or ie
	t_.firefox = !t_.safari && ua.indexOf('firefox')>-1; // check for gecko engine 
	t_.ns = !t_.firefox && !t_.opera && !t_.safari && (b=="Netscape");
	t_.ie = !t_.opera && (b=="Microsoft Internet Explorer");
	t_.name = (t_.ie ? "IE" : (t_.firefox ? "Firefox" : (t_.ns ? "Netscape" : (t_.opera ? "Opera" : (t_.safari ? "Safari" : "Unknow")))));
}
var brw = new Browser();
var apDiv1 = document.getElementById("mainContentContainer");
var perWidth = apDiv1.clientWidth / 2;
var mouse_wheel = function(e){
	var evt = window.event || e;
	if(evt.detail > 0 || evt.wheelDelta < 0)
		apDiv1.scrollLeft += perWidth;
	else
		apDiv1.scrollLeft -= perWidth;
}
var mouse_wheel_opera = function(e){
	var obj = e.srcElement;
	if(obj == apDiv1){
		mouse_wheel(e);
	}
}
	 
switch(brw.name){
	case "IE":
	case "Safari":
		apDiv1.onmousewheel = mouse_wheel;
		break;
	case "Firefox":
		apDiv1.addEventListener("DOMMouseScroll", mouse_wheel, false);
		break;
	case "Opera":
		document.onmousewheel = mouse_wheel_opera;
		break;
}

$(".centerFunc div").click(function() {
	if($(this).attr("controller") != null || $(this).attr("controller") != undefined){
		var url = {};
		var controller = $(this).attr("controller");
		var action = $(this).attr("action");
		if(typeof controller === "string" && controller.length > 0){
			url[$(this).attr("controller")] = $(this).attr("action");
			window.open($.appClient.generateUrl(url), "_self");
		}
	}
});
	
$("#ControlConsole").height($(window).height()-90);
$( ".subFuncs" ).click(function() {
	var urlLocation = window.location.href+"";
	urlLocation = urlLocation.substring(0,urlLocation.indexOf("essoaadminskin")+14)+"/";
	var srcLocation = urlLocation + $(this).attr("rel");
	$("#ControlConsole").attr("src",srcLocation);
});

