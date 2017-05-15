//caojian 20140512
var valDir=/^[a-zA-Z]:(([a-zA-Z]*)||([a-zA-Z]*\\))*/;
var valNumber=/^[-]?\d+$/;
var valUrl=new RegExp('[a-zA-z]+://[^\s]*');
var valDate=/^\d{4}\-\d{2}\-\d{2}$/;
var valFtp=/ftp:\/\/((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/;
$(".editbtn").die().live("click", function(){
	if($(".checkbox").is(':checked')==true){
		$(".checkbox").each(function(){
			$(this).attr('checked',false);
		});
		//$(this).attr('checked',true);
	}else{
	}
	edit_app($(this).closest("tr"));
});

//系统认证设置
//function sys_config(){
//	$.ajax({
//	        url : $.appClient.generateUrl({
//			ESAppConfig : 'my'},'x'),
//		    success:function(data){
//			    	$.dialog({
//				    	title:'系统认证设置',
//				    	modal:true, //蒙层（弹出会影响页面大小） 
//			    	   	fixed:false,
//			    	   	stack: true ,
//			    	    resize: false,
//			    	    height:100,
//			    	    lock : true,
//						opacity : 0.1,
//				    	okVal:'保存',
//					    ok:true,
//					    cancelVal: '关闭',
//					    cancel: true,
//					    content:data,
//					    ok:function()
//				    	{    
//					    	var title = $("#addapp input[name='title']").val();
//					    	var appConfigKey = $("#addapp input[name='appConfigKey']").val();
//					    	var appConfigValue = $("#addapp input[name='appConfigValue']").val();
//					    	var description = $("#addapp input[name='description']").val();
//					    	var data1 = $("#addapp").serialize();
//					    	var Actionurl = $.appClient.generateUrl({ESAppSetting : 'addApp'}, 'x');
//					    	if(appNameCn==''||appName==''||appToken==''){
//					    		if(appNameCn=='')
//					    			$("#addapp input[name='appNameCn']").addClass("warnning");
//					    		if(appName=='')
//					    			$("#addapp input[name='appName']").addClass("warnning");
//					    		if(appToken=='')
//					    			$("#addapp input[name='appToken']").addClass("warnning");
//					    		return false;
//					    	}else if(appNameZZ.test(appName )==false){
//					    		$("#addapp input[name='appName']").addClass("warnning");
//					    		return false;
//					    	}else   if(appTokenZZ.test(appToken)==false){
//					    		$("#addapp input[name='appToken']").addClass("warnning");
//					    		return false;
//					    	}else{
//					    		$.post(Actionurl,{data : data1}, function(res){
//					    			if (res == 'true') {
//					    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
//					    				$("#appSettingGrid").flexReload();
//					    				return;
//					    			} else {
//					    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
//					    				return;
//					    			}
//					    		});
//					    	}
//						}
//				    });
//			    },
//			    cache:false
//		});
//} 
function edit_app(tr){
	//var length=$("input[name=appServerlist]:checked").length;
	//if(length>1||length==0){
	//	$.dialog.notice({icon : 'error',content : '请选择一条数据进行修改',title : '3秒后自动关闭',time : 3});
	//	return;
	//}
	if(tr=='编辑'){
		tr=$("input[name=appServerlist]:checked").closest("tr");
	}
	var columns = ['id','title','appConfigKey','appConfigValue','description','valueType'];
	var colValues = $("#appConfigSettingGrid").flexGetColumnValue(tr,columns);
	$.ajax({
		    url : $.appClient.generateUrl({ESAppConfig : 'edit_appconfig'},'x'),
		    data : {data:colValues},
		    type : 'POST',
		    success:function(data){
			      $.dialog({
				    	title:'编辑系统应用配置',
			    	   	fixed:false,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
				    	content:data,
					    cancelVal: '关闭',
					    cancel: true,
					    okVal:'保存',
					    ok:true,
					    ok:function()
				    	{
					    	var title = $("#editApp input[name='title']").val();
					    	var appConfigKey = $("#editApp input[name='appConfigKey']").val();
					    	var appConfigValue = $("#editApp input[name='appConfigValue']").val();
					    	var description = $("#editApp input[name='description']").val();
					    	var valueType = $("#editApp select[name='valueType']").val();
					    	var Actionurl = $.appClient.generateUrl({ESAppConfig : 'updateApp'}, 'x');
					    	var data1 = $("#editApp").serialize();
					    	//null++;
					    	if(title==''||appConfigKey==''||appConfigValue==''){
					    		if(title=='')
					    			$("#editApp input[name='title']").addClass("warnning");
					    		if(appConfigKey=='')
					    			$("#editApp input[name='appConfigKey']").addClass("warnning");
					    		if(appConfigValue=='')
					    			$("#editApp input[name='appConfigValue']").addClass("warnning");
					    		return false;
					    	}else if(valueType=='APP_DIRECTORY'&&valDir.test(appConfigValue)==false){ 
					    		$("#editApp input[name='appConfigValue']").addClass("warnning");
					    		return false;
					    	}else if(valueType=='APP_NUMBER'&&valNumber.test(appConfigValue)==false){ 
						    		$("#editApp input[name='appConfigValue']").addClass("warnning");
						    		return false;
						    }else if(valueType=='APP_URL'&&valUrl.test(appConfigValue)==false){ 
						    		$("#editApp input[name='appConfigValue']").addClass("warnning");
						    		return false;
							}else if(valueType=='APP_FTP'&&valFtp.test(appConfigValue)==false){ 
						    		$("#editApp input[name='appConfigValue']").addClass("warnning");
						    		return false;
							}else if(valueType=='APP_DATE'&&valDate.test(appConfigValue)==false){ 
					    		$("#editApp input[name='appConfigValue']").addClass("warnning");
					    		return false;
						    }else{
					    		$.post(Actionurl,{data : data1}, function(res){
					    			if (res == 'true') {
					    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
					    				$("#appConfigSettingGrid").flexReload();
					    				return;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
					    				return;
					    			}
					    		});
					    	}
					    	
						 }
				    });
			    },
			    cache:false
		});
	}

//输入关键字检索应用
function appQuery(){
	//alert("appQuery");
	var keyword=$.trim($('input[name="appKeyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var url=$.appClient.generateUrl({ESAppConfig:'getAppConfigList',keyWord:keyword},'x');
	$("#appConfigSettingGrid").flexOptions({url:url}).flexReload();
	return false;
}
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'appKeyWord') {
		appQuery();
	}
});
//将复选框多选改为单选
$(".checkbox").die().live('click',function(){
	if($(this).is(':checked')==true){
		$(".checkbox").each(function(){
			$(this).attr('checked',false);
		});
		$(this).attr('checked',true);
	}else{
	}
}); 
