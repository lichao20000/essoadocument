/**  从后台数据库中读取message数据然后填充到消息框中 **/
var messageInterval = {
		createMsgInterval: function(){
			setInterval("messageInterval.getSoaMsg('interval')",5000);
			$('#firstPage').click(function(){
				if($('#firstPage').attr('enable') == 'true'){
					$('.msgBox').attr('currPage', '1');
					messageInterval.getSoaMsg('init');
				}
			});
		    $('#prePage').click(function(){
		    	if($('#prePage').attr('enable') == 'true'){
		    		$('.msgBox').attr('currPage', ($('.msgBox').attr('currPage')*1)-1);
		    		messageInterval.getSoaMsg('init');
		    	}
			});
		    $('#nextPage').click(function(){
		    	if($('#nextPage').attr('enable') == 'true'){
		    		$('.msgBox').attr('currPage', ($('.msgBox').attr('currPage')*1)+1);
		    		messageInterval.getSoaMsg('init');
		    	}
			});
		    $('#lastPage').click(function(){
		    	if($('#lastPage').attr('enable') == 'true'){
		    		$('.msgBox').attr('currPage', ($('.msgBox').attr('pageCount')*1));
		    		messageInterval.getSoaMsg('init');
		    	}
			});
		},
		getSoaMsg: function(type){
			var currPage = $('.msgBox').attr('currPage') ;
			var limit = 5 ;
			if($('.msgBox').attr('getSoaMsgUrlForJava') == ''){
				$.ajax({
					url: $('.msgBox').attr('getSoaMsgUrl'),
					type : 'GET',
					beforeSend:function(xhr) {},
					complete:function(){},
					success: function(url){
						$('.msgBox').attr('getSoaMsgUrlForJava', url+"/");
						messageInterval.getSoaMsgForJava(type);
					}
				});
			} else {
				messageInterval.getSoaMsgForJava(type);
			}
		},
		getSoaMsgForJava: function(type){
			var currPage = $('.msgBox').attr('currPage') ;
			var limit = 5 ;
			jQuery.getJSON($('.msgBox').attr('getSoaMsgUrlForJava')+currPage+'/'+limit+'/'+$('.msgBox').attr('userid')+'/'+type+'?callback=?',
					function(json) {
						var total = json.total;  
						var msgs = json.msgs;
						if(total===-1){
							/** 代表为消息没有变化，无需刷新 **/
						} else if(total===0){
							/** 代表为没有待办消息 **/
							messageInterval.clearMsg() ;
							messageInterval.changeMsgCount('0');
							messageInterval.changePageBar('0','0',false);
						} else {
							messageInterval.clearMsg() ;
							messageInterval.showMsgs(msgs);
							messageInterval.changeMsgCount(total);
							messageInterval.changePageBar(currPage,Math.ceil(total/limit),true);
						}  
			});
		},
		clearMsg: function(){
			$('.msgs').empty();
		},
		changeMsgCount: function(count){
			$('#msgHeaderText span').html(count);
			$('#messageConuter').html(count);
			//gaoyide 20141008  bug 960
			if(count==0){
				//$('#preTasksCounter').css("display","none");
				$('#preTasksCounter2').css("display","none");
				$('#msgLogoa').html('<div class = "logoutTextClass">消息</div>');
			}
			else{
				$('#msgLogoa').css("display","block");
				$('#msgLogoa').html('<em style="font-style:normal; font-size:10px; font-family:Arial; color:#fff; background-color:#FF7F24; padding:2px 5px; position:absolute; left: 25px; top: 5px;border-radius:10px;height: -10px;">'+count+'</em><div class = "logoutTextClass">消息</div>');
				//$('#preTasksCounter').css("display","block");
				$('#preTasksCounter2').css("display","block");
				$('#preTasksCounter2').text(count);
			}
			
		},
		changePageBar: function(currPage,pageCount,enable){
			$('.msgBox').attr('currPage', currPage) ;
			$('.msgBox').attr('pageCount', pageCount) ;
			if(pageCount == 1){
				enable = false ;
			}
			$('#firstPage').attr("enable", enable);
			$('#prePage').attr("enable", enable);
			$('#nextPage').attr("enable", enable);
			$('#lastPage').attr("enable", enable);
			if(enable){
				$('.msgDesContainer .currPage').html(currPage);
				$('.msgDesContainer .total').html(pageCount);
				if(currPage == 1){
					$('#firstPage').attr("enable", false);
					$('#prePage').attr("enable", false);
					$('#firstPage').removeClass("firstPage");
					$('#prePage').removeClass("prePage");
					$('#nextPage').removeClass("nextPageDisabled");
					$('#lastPage').removeClass("lastPageDisabled");
					$('#firstPage').addClass("firstPageDisabled");
					$('#prePage').addClass("prePageDisabled");
					$('#nextPage').addClass("nextPage");
					$('#lastPage').addClass("lastPage");
				} else if(currPage == pageCount){
					$('#nextPage').attr("enable", false);
					$('#lastPage').attr("enable", false);
					$('#firstPage').removeClass("firstPageDisabled");
					$('#prePage').removeClass("prePageDisabled");
					$('#nextPage').removeClass("nextPage");
					$('#lastPage').removeClass("lastPage");
					$('#firstPage').addClass("firstPage");
					$('#prePage').addClass("prePage");
					$('#nextPage').addClass("nextPageDisabled");
					$('#lastPage').addClass("lastPageDisabled");
				} else {
					$('#firstPage').removeClass("firstPageDisabled");
					$('#prePage').removeClass("prePageDisabled");
					$('#nextPage').removeClass("nextPageDisabled");
					$('#lastPage').removeClass("lastPageDisabled");
					$('#nextPage').addClass("nextPage");
					$('#lastPage').addClass("lastPage");
					$('#firstPage').addClass("firstPage");
					$('#prePage').addClass("prePage");
				}
			} else {
				$('#currPage').html("0");
				$('#total').html("0");
				$('#firstPage').addClass("firstPageDisabled");
				$('#prePage').addClass("prePageDisabled");
				$('#nextPage').addClass("nextPageDisabled");
				$('#lastPage').addClass("lastPageDisabled");
				$('#nextPage').removeClass("nextPage");
				$('#lastPage').removeClass("lastPage");
				$('#firstPage').removeClass("firstPage");
				$('#prePage').removeClass("prePage");
			}
		},
		showMsgs: function(msgs){
			$msgs = $('.msgs');
			if(msgs.length > 0 ) {
//					var oFrag = document.createDocumentFragment();
				for(var i = 0 ; i <msgs.length ;i ++){
					$msgs.append("<li>"+
									"<fieldset class = 'messageFieldSet'>"+
										"<legend class = 'messageTitle'>"+msgs[i].msgType+"</legend>"+
										"<div class = 'userMessageText' infoId=\""+msgs[i].id+"\" infoTitle=\""+msgs[i].msgType+"\"><a id='messageLink"+i+"' style='"+msgs[i].style+"' style='text-decoration:none' href='#' onclick='messageInterval.messageHandler(\"messageLink"+i+"\")' handler=\""+msgs[i].handler+"\" handlerUrl=\""+msgs[i].handlerUrl+"\" title=\""+msgs[i].content.replace("<font color='green'>","").replace("</font>","").replace("<font color='red'>","")+"\">"+msgs[i].content+"</a></div>"+
										"<div class = 'userPropertiesContainer'>"+
											"<div class = 'userReceiverImg'></div><div class = 'userReceiver' title=\""+msgs[i].recevier+"\">"+msgs[i].recevier+"</div>"+
											"<div class = 'userSenderImg'></div><div class = 'userSender' title=\""+msgs[i].sender+"\">"+msgs[i].sender+"</div>"+
											"<div class = 'userSendTime'>"+msgs[i].sendtime+"</div>"+
										"</div>"+
									"</fieldset>"+
								"</li>"); 
				}
			}
		},
		messageHandler: function(linkId){
			var handlerUrl = $('#'+linkId).attr('handlerUrl') ;
			var handler = $('#'+linkId).attr('handler') ;
			//shimiao 20140717 下载消息进行处理
			if($('#'+linkId).parent().attr('infoTitle')=='下载消息'){
				var infoId = $('#'+linkId).parent().attr('infoId');
				$.ajax({
					  url: $('.msgBox').attr('downFileUrl'),
					  type : 'POST',
					  /** guolanrui 20140922 添加同步属性BUG:1165 **/
					  async:false,
					  data:{id:infoId},
					  success: function(){
//						  alert(data);
					  }
				});
			}
			/** xiaoxiong 20141121 添加索引库创建完成消息点击自动over **/
			if($('#'+linkId).attr('handler').indexOf('OverMessage')>-1){
				var infoId = $('#'+linkId).parent().attr('infoId');
				$.ajax({
					url: $('.msgBox').attr('downFileUrl'),
					type : 'POST',
					async:false,
					data:{id:infoId},
					success: function(){
//						  alert(data);
					}
				});
				return;
			}
			//wanghongchen 20141015 添加订购回复消息处理
			if($('#'+linkId).text() == '订购回复'){
				var infoId = $('#'+linkId).parent().attr('infoId');
				$.ajax({
					  url: $('.msgBox').attr('downFileUrl'),
					  type : 'POST',
					  async:false,
					  data:{id:infoId}
				});
				$.dialog({content:handler,icon:'warning'});
				return false;
			}
			if($('#'+linkId).text() == '应用申请'){
				eval(handler);
				return false;
			}
			if(handler.indexOf("showOrderReply")>-1){
				eval(handler);
				return false;
			}
			if(typeof( _baseUrl) == "undefined"){
				/** 代表此消息不属于当前应用消息，跳转到对应应用，然后打开自动打开待处理界面 **/
				var appName = handlerUrl.substring(0,handlerUrl.indexOf('/')) ;
				var instanceId = handlerUrl.substring(handlerUrl.indexOf('/')+1, handlerUrl.length) ;
				instanceId = instanceId.substring(0,instanceId.indexOf('/')) ;
				var toUrl = "/"+appName ;
				var newWindow = window.open("about:blank",appName+instanceId); 
				if (!newWindow){ 
					return false; 
				} 
				var postDataHtml="<html><head><meta http-equiv='Content-Type' content='application/x-www-form-urlencoded'/></head><body>"; 
				postDataHtml = postDataHtml + "<form id='msgPostDataForm' method='post' action='"+toUrl+"' enctype='application/x-www-form-urlencoded'>"; 
				postDataHtml = postDataHtml + "<input type='hidden' name='handler' value=\""+handler+"\"/>"; 
				postDataHtml = postDataHtml + "</form><script type=\"text/javascript\">document.getElementById(\"msgPostDataForm\").submit();</script><body><html>"; 
				newWindow.document.write(postDataHtml); 
				return newWindow; 
			} else {
				var nowBaseUrl = _baseUrl.substring(1, _baseUrl.lastIndexOf("/") + 1)+'x' ;
				if(handlerUrl.indexOf(nowBaseUrl)==0){
					/** 代表此消息属于当前应用消息，直接指向即可 **/
					eval(handler);
				} else {
					/** 代表此消息不属于当前应用消息，跳转到对应应用，然后打开自动打开待处理界面 **/
					var appName = handlerUrl.substring(0,handlerUrl.indexOf('/')) ;
					var instanceId = handlerUrl.substring(handlerUrl.indexOf('/')+1, handlerUrl.length) ;
					instanceId = instanceId.substring(0,instanceId.indexOf('/')) ;
					var toUrl = "/"+appName ;
					var newWindow = window.open("about:blank",appName+instanceId); 
					if (!newWindow){ 
						return false; 
					} 
					/**liqiubo 20141016 修改一下后台请求的地址,修复bug 1341**/
					var url = "/setting/" + instanceId+ "/x/ESOrder/changeSaasid";
					$.post(url, {saasid : getSaasId()},function(){
						var postDataHtml="<html><head><meta http-equiv='Content-Type' content='application/x-www-form-urlencoded'/></head><body>"; 
						postDataHtml = postDataHtml + "<form id='msgPostDataForm' method='post' action='"+toUrl+"' enctype='application/x-www-form-urlencoded'>"; 
						postDataHtml = postDataHtml + "<input type='hidden' name='handler' value=\""+handler+"\"/>"; 
						postDataHtml = postDataHtml + "</form><script type=\"text/javascript\">document.getElementById(\"msgPostDataForm\").submit();</script><body><html>"; 
						newWindow.document.write(postDataHtml); 
						return newWindow; 
					});
				}
			}
		}
};
jQuery(document).ready(function(){
	messageInterval.getSoaMsg('init');
	messageInterval.createMsgInterval();
});  
//全部消息弹出窗口 wanghongchen 20140715
function allMessageDialog(){
	var url = "/setting/"+getSaasId()+"/message/ESMessage/index";
	$.ajax({
		url:url,
		success:function(data){
			$.dialog({
				id:"allMessage",
				title:"消息管理",
				content:data,
				padding:0,
				width:880,
				height:520
			});
		}
	});
}

//获取saasId wanghongchen 20140715
function getSaasId() {
	var scripts = document.getElementsByTagName('script');
	var me = null;
	var saasId = null;
	for (i in scripts) {
		// 如果通过第三方脚本加载器加载本文件，请保证文件名含有"appclient"字符
		if (scripts[i].src && scripts[i].src.indexOf('appclient') !== -1)
			me = scripts[i];
	}
	// 如果加载的脚本里没有，在获取自己（同步加载可用）
	me = me || script[script.length - 1];
	saasId = me.src.replace(/\\/g, '/').split('baseurl=')[1];
	saasId = saasId.substring(saasId.indexOf("/",2)+1);
	return saasId.substring(0,saasId.indexOf("/"));
}