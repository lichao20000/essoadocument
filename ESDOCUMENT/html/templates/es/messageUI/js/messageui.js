/** zhangyuan 20130506 add 消息展现组建处理JS **/
/** xiaoxiong 20130615 完善消息组建 **/
/**type 1：成功；2：失败；3：警告 */
	function showMsg(msg,type){
		 var cWidth = document.documentElement.clientWidth || document.body.clientWidth;
		 document.getElementById('preMsgShowDiv').style.display = 'none' ;
		 document.getElementById('preMsgShowDiv').style.left = (cWidth-100)/2+'px';
		 var timestamp=new Date().getTime();
		 document.getElementById('msgDiv').style.top = -(document.getElementById("msgDiv").offsetHeight*1);
		 document.getElementById('msgDiv').setAttribute('timestamp',timestamp);
		 document.getElementById('msgDiv').setAttribute('close','0');
		 var ns = (navigator.appName.indexOf("Netscape") != -1);
		 document.getElementById('msgContentDiv').style.height = 'auto';
		 document.getElementById('msgContentDiv').style.width = 'auto';
		 document.getElementById('msgContentDiv').style.padding = '0' ;
		 document.getElementById('msgDiv').style.height = 'auto';
		 document.getElementById('msgDiv').style.width = 'auto';
		 document.getElementById('msgContentDiv').innerHTML = msg;
		 if('1' == type){//成功
		 	document.getElementById('messageUIImg').src = '/templates/es/messageUI/images/success.png';
		 }else if('2' == type){//失败
		 	document.getElementById('messageUIImg').src = '/templates/es/messageUI/images/failure.png';
		 }else if('3' == type){//警告
		 	document.getElementById('messageUIImg').src = '/templates/es/messageUI/images/warning.png';
		 }
		 var startY = -(document.getElementById("msgDiv").offsetHeight*1);
		 /** xiaoxiong 20130609 修改提示消息组建的最大宽度为600 **/
		 if(document.getElementById("msgDiv").offsetWidth>600){
		 	document.getElementById('msgDiv').style.width = 600+'px';
		 	document.getElementById('msgDiv').style.left = (cWidth-600)/2+'px';
		 } else {
		 	document.getElementById('msgDiv').style.width = document.getElementById("msgDiv").offsetWidth+'px';
		 	document.getElementById('msgDiv').style.left = (cWidth-document.getElementById("msgDiv").offsetWidth)/2+'px';
		 }
		 document.getElementById('msgContentDiv').style.height =(document.getElementById("msgDiv").offsetHeight-30)+'px';
		 /** xiaoxiong 20130522 完善提示消息居中 **/
		 if(document.getElementById("msgDiv").offsetHeight<=73){
			 var paddingValue = (document.getElementById("msgDiv").offsetHeight-50)/2;
			 document.getElementById('msgContentDiv').style.padding = paddingValue+' 0 '+paddingValue+' 0';
		 }
		 document.getElementById('msgContentDiv').style.top = startY;
		 document.getElementById('msgDiv').setAttribute('showMsgDiv','true');
		 /** xiaoxiong 20130511 将消息提示修改为显示时快些 收缩时慢些 **/
		 window.stayTopLeft=function(timestamp){
		 	  if(document.getElementById('msgDiv').getAttribute('timestamp')!=timestamp){
		 	  		return ;
		 	  }
		 	  if(startY >= 1){
		 	  	 document.getElementById('msgDiv').setAttribute('showMsgDiv','false');
		 	  	 document.getElementById('msgDiv').setAttribute('isShoWoldMsg','0') ;
		 	  	  setTimeout("stayTopLeft('"+timestamp+"')", 2000);
		 	  	  startY = 0.999;
		 	  	  return;
		 	  } else if(startY<(-(document.getElementById("msgDiv").offsetHeight*1))){
		 	  	startY =(-(document.getElementById("msgDiv").offsetHeight*1)) ;
		 	  	document.getElementById('preMsgShowDiv').style.display = '' ;
		 	  	return;
		 	  }
		 	  if(document.getElementById('msgDiv').getAttribute('showMsgDiv') == 'true'){
				  startY += document.getElementById("msgDiv").offsetHeight/20;
			 	  document.getElementById('msgDiv').style.top = startY+'px';
				  setTimeout("stayTopLeft('"+timestamp+"')", 5);
		 	  } else {
				  startY -= document.getElementById("msgDiv").offsetHeight/40;
			 	  document.getElementById('msgDiv').style.top = startY+'px';
				  setTimeout("stayTopLeft('"+timestamp+"')", 10);
		 	  }
		 }
		 
		 window.closeMsgFun=function(){
		 	  	startY =(-(document.getElementById("msgDiv").offsetHeight*1)) ;
				document.getElementById('msgDiv').setAttribute('close','1');
				document.getElementById('msgDivCloseButton').style.display='none';
				/** xiaoxiong 20130707 主动点击关闭消息组建时 展开消息 按钮不显示 **/
				//document.getElementById('preMsgShowDiv').style.display = '' ;
				document.getElementById('msgDiv').style.top = document.getElementById("msgDiv").offsetHeight*(-1)+'px';
		 }
		 
		 stayTopLeft(timestamp);
	}
	/** 鼠标警告消息组建处理方法 **/
	function mouseOver(){
		if(document.getElementById('msgDiv').getAttribute('isShoWoldMsg') == '1'){
			return ;
		}
		var timestamp=new Date().getTime();
		document.getElementById('msgDiv').setAttribute('timestamp',timestamp);
		document.getElementById('msgDiv').setAttribute('showMsgDiv','false');
		document.getElementById('msgDiv').style.top = 1+'px';
		startY = 0.999;
		document.getElementById('msgDivCloseButton').style.display='';
	}
	/** 鼠标移开消息组建处理方法 **/
	function mouseOut(){
		if(document.getElementById('msgDiv').getAttribute('close') == '0'){
			 setTimeout("stayTopLeft('"+document.getElementById('msgDiv').getAttribute('timestamp')+"')", 10);
		}
		document.getElementById('msgDivCloseButton').style.display='none';
	}
	
	/** xiaoxiong 20130615 关闭消息组建 **/
	function closeMsgDivFun(){
		closeMsgFun();
	}
	
	/** xiaoxiong 20130624 添加查看最后一条消息按钮的处理方法 start **/
	function preMsgShowMouseOver(){
		document.getElementById('preMsgShowDiv').style.background = "url('/templates/es/messageUI/images/showPreMsgMouseOver.png')";
	}
	
	function preMsgShowMouseOut(){
		document.getElementById('preMsgShowDiv').style.background = "url('/templates/es/messageUI/images/showPreMsg.png')";
	}
	
	function preMsgShowClick(){
		document.getElementById('msgDiv').setAttribute('close','0');
		document.getElementById('preMsgShowDiv').style.display = 'none' ;
		document.getElementById('msgDiv').setAttribute('isShoWoldMsg','1');
		document.getElementById('msgDiv').setAttribute('showMsgDiv','true');
		stayTopLeft(document.getElementById('msgDiv').getAttribute('timestamp'))
	}
	/** xiaoxiong 20130624 添加查看最后一条消息按钮的处理方法 end **/
	 
