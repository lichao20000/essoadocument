//wangbo 20140506
 var appNameZZ =/^[A-Za-z]+$/;
 var appTokenZZ =/^[A-Za-z]+$/;
$(".editbtn1").die().live("click", function(){
	edit_app($(this).closest("tr"));
});

//添加应用
function add_app(){
	$.ajax({
	        url : $.appClient.generateUrl({
			ESAppSetting : 'add_app'},'x'),
		    success:function(data){
			    	$.dialog({
				    	title:'添加应用',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    height:200,
			    	    lock : true,
						opacity : 0.1,
				    	okVal:'保存',
					    ok:true,
					    cancelVal: '关闭',
					    cancel: true,
					    content:data,
					    ok:function()
				    	{    
					    	var appName = $("#addapp input[name='appName']").val();
					    	var appNameCn = $("#addapp input[name='appNameCn']").val();
					    	var appToken = $("#addapp input[name='appToken']").val();
					    	var data1 = $("#addapp").serialize();
					    	var Actionurl = $.appClient.generateUrl({ESAppSetting : 'addApp'}, 'x');
					    	if(appNameCn==''||appName==''||appToken==''){
					    		if(appNameCn=='')
					    			$("#addapp input[name='appNameCn']").addClass("warnning");
					    		if(appName=='')
					    			$("#addapp input[name='appName']").addClass("warnning");
					    		if(appToken=='')
					    			$("#addapp input[name='appToken']").addClass("warnning");
					    		return false;
					    	}else if(appNameZZ.test(appName )==false){
					    		$("#addapp input[name='appName']").addClass("warnning");
					    		return false;
					    	}else   if(appTokenZZ.test(appToken)==false){
					    		$("#addapp input[name='appToken']").addClass("warnning");
					    		return false;
					    	}else{
					    		$.post(Actionurl,{data : data1}, function(res){
					    			if (res == 'true') {
					    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
					    				$("#appSettingGrid").flexReload();
					    				return;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
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
function delete_app(){
	var checkboxlength = $('#appSettingGrid input:checked').length;
	if (checkboxlength == 0) {
		$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
		return;
	}
	$.dialog({
		content : '确定要删除吗？删除后不能恢复！',
		okVal : '确定',
		ok : true,
		cancelVal : '关闭',
		cancel : true,
		ok : function() {
			var idStr = '';
			$('#appSettingGrid input:checked').each(
				function(i) {
					idStr += $('#appSettingGrid input:checked:eq(' + i+ ')').val()+ ',';
				});
			    idStr=idStr.substring(0,idStr.length-1);
				var url = $.appClient.generateUrl({ESAppSetting : 'delApp'}, 'x');
				debugger;
				$.post(url, {data : idStr}, function(res) {
					if(res=='true'){
						$.dialog.notice({
							icon : 'succeed',
							content :'删除成功！',
							time : 3
						});
						$("#appSettingGrid").flexReload();
						return;
					}else{
						$.dialog.notice({icon : 'warning',
							content :'不允许删除',
							time : 3
						});
						$("#appSettingGrid").flexReload();
						return;
					}
				});
		}
	});
}
function edit_app(tr){
	var columns = ['id','appName','appNameCn','appToken','remark'];
	var colValues = $("#appSettingGrid").flexGetColumnValue(tr,columns);
		$.ajax({
		    url : $.appClient.generateUrl({ESAppSetting : 'edit_app',data:colValues},'x'),
		    success:function(data){
			      $.dialog({
				    	title:'编辑应用',
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
					    	var appName = $("#editApp input[name='appName']").val();
					    	var appNameCn = $("#editApp input[name='appNameCn']").val();
					    	var appToken = $("#editApp input[name='appToken']").val();
					    	var Actionurl = $.appClient.generateUrl({ESAppSetting : 'addApp'}, 'x');
					    	var data1 = $("#editApp").serialize();
					    	if(appNameCn==''||appName==''||appToken==''){
					    		if(appNameCn=='')
					    			$("#editApp input[name='appNameCn']").addClass("warnning");
					    		if(appName=='')
					    			$("#editApp input[name='appName']").addClass("warnning");
					    		if(appToken=='')
					    			$("#editApp input[name='appToken']").addClass("warnning");
					    		return false;
					    	}else if(appNameZZ.test(appName )==false){
					    		$("#editApp input[name='appName']").addClass("warnning");
					    		return false;
					    	}else   if(appTokenZZ.test(appToken)==false){
					    		$("#editApp input[name='appToken']").addClass("warnning");
					    		return false;
					    	}else{
					    		$.post(Actionurl,{data : data1}, function(res){
					    			if (res == 'true') {
					    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
					    				$("#appSettingGrid").flexReload();
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
	var url=$.appClient.generateUrl({ESAppSetting:'getAppList',keyWord:keyword},'x');
	$("#appSettingGrid").flexOptions({url:url}).flexReload();
	return false;
}
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'appKeyWord') {
		appQuery();
	}
});
 
