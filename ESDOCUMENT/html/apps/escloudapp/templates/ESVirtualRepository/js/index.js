$(document).ready(function(){
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
	};
	sizeChanged();
	
	$("#b1").click(function(){
		hideAll();
		$("#i2, #b2, #b3").show();
	});
	
	$("#b2").click(function(){
		hideAll();
		$("#i1, #b1").show();
	});
	$("#b3").click(function(){
		hideAll();
		$("#i3, #b4, #b5").show();
	});
	
	$("#b4").click(function(){
		hideAll();
		$("#i2, #b2, #b3").show();
	});
	$("#b5").click(function(){
		hideAll();
		$("#i4, #b6, #b7").show();
	});
	
	$("#b6").click(function(){
		hideAll();
		$("#i3, #b4, #b5").show();
	});
	$("#b7").click(function(){
		$("#i5, #b8").show();
	});
	
	$("#b8").click(function(){
		$("#i5, #b8").hide();
	});
	
	function hideAll(){
		$(".cutImg,.cutMap").hide();
	}
});