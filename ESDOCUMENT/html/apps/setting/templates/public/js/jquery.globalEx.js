/**
 * ajax请求全局提示
 */
;(function($) {
	var requestCount = 0;
	var $msgDiv;
	var defaultMsg = "正在努力为您加载数据!";
	$.ajaxSetup({
		beforeSend:function(){
			if((this.url+"").indexOf('getSoaMsg') == -1){
				if((this.url+"").indexOf('.js?') == -1){
					if(requestCount<0){
						requestCount=0;
					}
					requestCount++;
				}
				showMsg();
			}
		},
		complete:function(response, code){
			if((this.url+"").indexOf('getSoaMsg') == -1){
				/** xiaoxiong 20141007 判断请求是否成功，失败了给出相应提示，失败的原因基本上都是服务为启动 **/
				if(code == 'parsererror'){
					$.dialog.notice({icon: 'error',content: response.responseText, title: '3秒后自动关闭',time: 3});
				}
				if((this.url+"").indexOf('.js?') == -1){
					requestCount--;
					if(requestCount<0){
						requestCount=0;
					}
					if(requestCount<=0){
						hideMsg();
					}
				}else{
					hideMsg();
				}
			}
		},
		success:function(){
			if((this.url+"").indexOf('.js?') == -1){
				requestCount--;
				if(requestCount<0){
					requestCount=0;
				}
				if(requestCount<=0){
					hideMsg();
				}
			}else{
				hideMsg();
			}
		},
		error:function(){
			$.dialog.notice({icon: 'error',content: '请求失败，请联系管理员，确定后台服务是否正常启动！', title: '3秒后自动关闭',time: 3});
		}
	});
	$.setGlobalMsg = function(msg){
		defaultMsg = msg;
	};
	function showMsg(){
		$("#loadingMsgDiv").css("display","block");
//		$("#loadingMsgDiv").slideToggle();
		$("#loadingMsgDiv").fadeIn("slow");
	}
//	function showMsgOld(){
//		if(!$msgDiv) $msgDiv = createMsgDiv(defaultMsg);	
//		$("#gloableMsgContainer").css("left",($(window).width()/2 - 80));
//		$("#gloableMsgContainer").css("top",($(window).height()/2 - 40));
//		$msgDiv.show();
//		$("#bg").css("display","block");
//	}
	function hideMsg(){
		$("#loadingMsgDiv").css("display","none");
//		$("#loadingMsgDiv").slideToggle();
		$("#loadingMsgDiv").fadeOut("slow");
	}
//	function hideMsgOld(){
//		if($msgDiv) $msgDiv.hide();
//		$("#bg").css("display","none");
//	}
	function createMsgDiv(msg){
		var div = $("<div id='gloableMsgBg'></div></div>");
		$(document.body).append(div);
		return $(div);
	}
//	function createMsgDivOld(msg){
//		var div = $("<div id='gloableMsgBg'></div><div id = 'gloableMsgContainer' class = 'gloableMsgContainer'><div class='gloableMsgGif'></div><div class = 'gloableMsgText'>" + msg + "</div></div>");
//		$(document.body).append(div);
//		return $(div);
//	}
	
})(jQuery);