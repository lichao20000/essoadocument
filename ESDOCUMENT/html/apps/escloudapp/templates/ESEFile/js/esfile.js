$(function(){
	function wSize() // 函数：获取尺寸
	{
		var width;
		var height;
		// 获取窗口高度
		if (window.innerHeight) {
			height = window.innerHeight;
		} else if ((document.body) && (document.body.clientHeight)) {
			height = document.body.clientHeight;
		}
		//获取窗口宽度
		if (window.innerWidth) {
			width = window.innerWidth;
		} else if ((document.body) && (document.body.clientWidth)) {
			height = document.body.clientWidth;
		}
		// 通过深入 Document 内部对 body 进行检测，获取窗口大小
		if (document.documentElement && document.documentElement.clientHeight&&document.documentElement.clientWidth) {
			height = document.documentElement.clientHeight;
			width =  document.documentElement.clientWidth;
		}
		document.getElementById('main').style.height = height - 110 + 'px';
		document.getElementById('main').style.width = width*0.96  + 'px';
		//document.getElementById('main').style.left = 9 + 'px';
	}
	wSize();
	window.onresize = wSize;

});
	

