/**  从后台数据库中读取message数据然后填充到消息框中 **/

function showOaisMsg(mainDivID,dataList,dataCount,refreshMsgWinFlag,currPage){
	var mainDiv = document.getElementById(mainDivID);
    
	if( mainDiv.name &&  mainDiv.name=='noshow'){
		if(refreshMsgWinFlag=='false')return;
	}
	if(refreshMsgWinFlag == 'false' && mainDiv.name)return ;

	if(isDoPlayAudio(mainDivID,dataCount))FY_OAIS_JMS_AUDIO_PLAY();
	
	mainDiv.className = ''
	mainDiv.innerHTML = '';
	mainDiv.name = 'showing-'+dataCount;
	/** config header Serction Start **/
	 	var childHTML = '<div class="info" id="rightBottom"><div class="info_top"> <table border="0" cellpadding="0" cellspacing="0"  width="100%"><tr>'+
			' <td  width="11px"><div class="info_tl"></div></td>'+
		 '<td>'+
		 '   <div class="info_tc">'+
	      '   <div class="info_ticon"></div>'+
		'	 <div class="info_tit">您有 '+dataCount+' 条消息，请查阅！</div>'+
			'<Div class="info_bt01" title="展开/折叠" onclick = "_sliderInit(\'show_top\',0,320,360,0);"><a href="#"></a></Div>'+
		'	 <div class="info_bt02" title="显示全部" onclick="showMessageManagerWin();"><a href="#" ></a></div>'+
		'	 <div class="info_bt03" title="提示：关闭消息后需要刷新页面才能再次显示消息框！" onclick="setOiasMsgWinNoShow(\''+mainDivID+'\');"><a href="#" ></a>'+
		 '    </div>	'+		 
		'	 </td>'+
		' <td width="11px"><div class="info_tr"></div></td> </tr></table>'+
	'</div>'+
	 '<div ><div id="show_top" style ="float:left; width:360px;  overflow:hidden; display:block; height:320px;">'+
			'<div class="info_center"> <table border="0" cellpadding="0" cellspacing="0" width="100%">'+
			'<tr><td width="11px"><div class="info_cl"></div></td> <td valign="top" > <div class="info_cc scllo">'+
			 '<div class="info_center_nav">';
	 	/** config header Serction end **/
	 
	 	/** config body Serction Start **/
	for(var i = 0 ; i < dataList.length ; i++){
		var text = dataList[i].text.replace("style='color:#FF0000'","").replace("style='text-decoration:none'","class='splj'");	
		var sneder = dataList[i].sender ;
		var upStep = (dataList[i].lastStep?dataList[i].lastStep:dataList[i].sender);
		//if(upStep && upStep.length>3)upStep = upStep.substring(0,2)+'..';
		if(!sneder){
			if(upStep)sneder = upStep;
			else sneder = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		}
		if(sneder && sneder.length == 2) sneder +="&nbsp;&nbsp;"
		if(upStep && upStep.length == 2) upStep +="&nbsp;&nbsp;"
		var titleforshow='';
		if(sneder=='administratoradmin')sneder='系统管理员';
		if(upStep=='administratoradmin')upStep='系统管理员';
		var recevier = dataList[i].recevier;
		
		/**  body Content Text **/
		
		if(recevier=='administratoradmin')recevier='系统管理员';
			 childHTML +='<div class="info_box"> <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td  width="10px;">'+
							'<div class="info_boxl"></div></td><td><div class="info_boxc">'+
							'<div class="info_btop f12blue">'+dataList[i].msgType+'</div>';
		if(dataList[i].msgForWfNotice){
				childHTML +='<div class="info_bcenter">'+text+dataList[i].msgForWfNotice+'</div>';
		}else{
				childHTML +='<div class="info_bcenter">'+text+'</div>';
		}
		childHTML +='<div class="info_bfoot f12blue">';
		if(dataList[i].workFlowId==-14){//下载消息（包括：打印报表、数据导出、批量挂接、挂接检测、离线著录工具制作、光盘制作、电子文件校验）
				childHTML +=	'<div class="info_icon"  title="操作人"></div>'+
								'<div class="info_man">'+recevier+'</div>';
		}else if(dataList[i].workFlowId>0){//工作流消息
				childHTML +=	'<div class="info_icon" title="发起人"></div>'+
								'<div class="info_man" title="发起人">'+sneder+'</div>';
				childHTML +=	'<div class="info_icon2"  title="上一步"></div>'+
								'<div class="info_man" title="上一步">'+upStep+'</div>';
		}else if(dataList[i].workFlowId==-9){//即时通讯消息
				childHTML +=	'<div class="info_icon2"  title="消息来自"></div>'+
								'<div class="info_man">'+upStep+'</div>';
		}
		else{
			childHTML +=	'<div class="info_icon"  title=""></div>'+
								'<div class="info_man">'+recevier+'</div>';
		}
		childHTML += '	  <div class="info_date">'+dataList[i].sendTime+'</div>';
		childHTML +='	</div></div> </td><td width="10px;"><div class="info_boxr"></div></td>'+
							'	 </tr></table>'+
							' </div>';
	}
	/** config header Serction End **/
	/** config footer Serction Start **/
		var pageCount = 1;
		pageCount = dataCount%10==0 ? dataCount/10 : parseInt(dataCount/10)+1 ;
					childHTML += '<div class="footheight"></div></div>	 </td> <td width="11px"><div class="info_cr"></div></td> </tr> </table> </div>'+
			'<div class="info_foot "> '+
						'<table border="0" cellpadding="0" cellspacing="0"  width="100%"><tr><td width="11px;"><div class="info_bl"></div></td> <td>'+
						'<div class="info_bc"><div class="info_page2 f12ccc">'+
					 '当前第 '+currPage+' 页，共 '+pageCount+' 页  &nbsp;&nbsp;&nbsp;&nbsp;'+
						'<a href="#" id="oaisMessageFirstPage"  onclick="messageWindowChangePage(this,\'first\','+dataCount+')">首页</a> | '+
						'<a href="#"  id="oaisMessageUpPage" onclick="messageWindowChangePage(this,\'prev\','+dataCount+')">上一页</a> | '+
						'<a href="#"  id="oaisMessageNextPage" onclick="messageWindowChangePage(this,\'next\','+dataCount+')">下一页</a> | '+
						'<a href="#"  id="oaisMessageLastPage" onclick="messageWindowChangePage(this,\'last\','+dataCount+')">末页</a> </div>'+
		   ' </div>	 </td> <td width="11px;"><div class="info_br"></div></td> </tr> </table>  </div> </div>  	</div></div></div>';
		mainDiv.innerHTML = childHTML ;
		document.getElementById('oaisMessageFirstPage').name = currPage;
		document.getElementById(mainDivID).style.display='';
		/** config footer Serction End **/

}