//wangbo 20140506
 var appNameZZ =/^[A-Za-z]+$/;
//gengqianfeng 20141016  应用中文名称验证正则
 var appNameCnZZ =/^([\u4e00-\u9fa5]|[a-zA-Z0-9]|[^|\\'?."><;])+$/;
// var appTokenZZ =/^[A-Za-z]+$/;
$(".editbtn").die().live("click", function(){
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
					    //gengqianfeng 20140917 应用添加验证初始加载
					    init : function() {
	    					$('#addapp').autovalidate();
	    				},
					    ok:function()
				    	{ 
					    	//gengqianfeng 20140917 应用添加验证确定加载
					    	var form=$('#addapp');
				    		if (!form.validate()) {
				    			return false;
				    		}  
					    	var appName = $("#addapp input[name='appName']").val();
					    	var appNameCn = $("#addapp input[name='appNameCn']").val();
					    	var appToken = $("#addapp input[name='appToken']").val();
					      	 $.ajax({
					             type: "POST",
					             url: $.appClient.generateUrl({ESAppSetting : 'judgeAppName'}, 'x'),
					             data: {id : '-1',appName:appName},
					             dataType: "json",
					             async:false,
					             success: function(data){
								 		if(!data){
								 			$("#addapp input[name='appName']").addClass("warnning");
								 			$("#addapp input[name='appName']").attr("title","应用名称不允许重复!");
							 		      }
					                   }
					         });
					    	 $.ajax({
					             type: "POST",
					             url: $.appClient.generateUrl({ESAppSetting : 'judgeAppNameCn'}, 'x'),
					             data: {id : '-1',appNameCn:encodeURI(appNameCn)},
					             dataType: "json",
					             async:false,
					             success: function(data){
					            	 if(!data){
								 			$("#addapp input[name='appNameCn']").addClass("warnning");
								 			$("#addapp input[name='appNameCn']").attr("title","应用中文名称不允许重复!");
								 		}
					                  }
					         });
					    	//gengqianfeng 20140915 备注信息变量添加
					    	var remark = $("#addapp textarea[name='remark']").val();
					    	var data1 = $("#addapp").serialize();
					    	var Actionurl = $.appClient.generateUrl({ESAppSetting : 'addApp'}, 'x');
					    	if(appNameCn==''||appName==''||appToken==''){
					    		if(appNameCn=='')
					    			$("#addapp input[name='appNameCn']").addClass("warnning");
					    		if(appName=='')
					    			$("#addapp input[name='appName']").addClass("warnning");
//					    		if(appToken=='')
//					    			$("#addapp input[name='appToken']").addClass("warnning");
					    		return false;
					    	}else if(appNameZZ.test(appName )==false){
					    		$("#addapp input[name='appName']").addClass("warnning");
					    		//gengqianfeng 20140915 应用名称格式限制提示
					    		$("#addapp input[name='appName']").attr("title","只能输入英文大小写字符或下划线");
					    		return false;
					    	}else if(appNameCnZZ.test(appNameCn)==false){
					    		//gengqianfeng 20141016  应用中文名称字符验证
					    		$("#addapp input[name='appNameCn']").addClass("warnning");
					    		$("#addapp input[name='appNameCn']").attr("title",'该输入项不允许包含'+"|\\'?.\"><;"+'等特殊字符');
					    	 	return false;
					    	}else if(execLen(appName,50)==false){
					    		//gengqianfeng 20140915 应用名称长度验证
					    		$("#addapp input[name='appName']").addClass("warnning");
					    		$("#addapp input[name='appName']").attr("title","数据长度最大为50个字符");
					    	 	return false;
					    	}else if(execLen(appNameCn,150)==false){
					    		//gengqianfeng 20140915 应用中文名称长度验证
					    		$("#addapp input[name='appNameCn']").addClass("warnning");
					    		$("#addapp input[name='appNameCn']").attr("title","数据长度最大为150个字符(75个汉字)");
					    	 	return false;
					    	}
//					    	else if(appTokenZZ.test(appToken)==false){
//					    		$("#addapp input[name='appToken']").addClass("warnning");
//					    		//gengqianfeng 20140915 应用口令格式限制提示
//					    		$("#addapp input[name='appToken']").attr("title","只能输入英文大小写字符");
//					    		return false;
//					    	}else if(execLen(appToken,150)==false){
//					    		//gengqianfeng 20140915 应用口令长度验证
//					    		$("#addapp input[name='appToken']").addClass("warnning");
//					    		$("#addapp input[name='appToken']").attr("title","应用口令长度不能超过150个字符");
//					    	 	return false;
//					    	}
					    	else if(judgeSummit($("#addapp"))==false){
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
	var idStr = '';
     $('#appSettingGrid input:checked').each(function(i) {
	    idStr += $('#appSettingGrid input:checked:eq(' + i + ')').val() + ',';
     });
	 idStr=idStr.substring(0,idStr.length-1);
	//判断是否能删除
    $.post($.appClient.generateUrl({ESAppSetting : 'getNoDelApps'}, 'x'),
    		{ids : idStr}, function(res) {
    			if(res!=""&&res!=null){
    		     $.dialog.notice({icon : 'warning',content : '名称为['+res+']的应用中含有子应用,不能删除！',time : 3});
    			}else{
    				$.dialog({
    					content : '确定要删除吗？删除后不能恢复！',
    					okVal : '确定',
    					ok : true,
    					cancelVal : '关闭',
    					cancel : true,
    					ok : function() {
    							var url = $.appClient.generateUrl({ESAppSetting : 'delApp'}, 'x');
//    							debugger;
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
    });
	
}
function edit_app(tr){
	var columns = ['id','appName','appNameCn','appToken','saasSupport','remark'];
	var colValues = $("#appSettingGrid").flexGetColumnValue(tr,columns);
		$.ajax({
		    url : $.appClient.generateUrl({ESAppSetting : 'edit_app'},'x'),
		    data : {
		    	data:colValues
		    },
		    type : 'post',
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
					    //gengqianfeng 20140917 应用修改验证初始加载
					    init : function() {
	    					$('#editApp').autovalidate();
	    				},
					    ok:function()
				    	{ 
					    	//gengqianfeng 20140917 应用修改验证确定加载
					    	var form=$('#editApp');
				    		if (!form.validate()) {
				    			return false;
				    		}
					    	var appName = $("#editApp input[name='appName']").val();
					    	var appNameCn = $("#editApp input[name='appNameCn']").val();
					    	var appToken = $("#editApp input[name='appToken']").val();
					    	var remark = $("#editApp textarea[name='remark']").val();
						   	 $.ajax({
					             type: "POST",
					             url: $.appClient.generateUrl({ESAppSetting : 'judgeAppName'}, 'x'),
					             data: {id : $("#editApp input[name='id']").val(),appName:appName},
					             dataType: "json",
					             async:false,
					             success: function(data){
								 		if(!data){
								 			$("#editApp input[name='appName']").addClass("warnning");
								 			$("#editApp input[name='appName']").attr("title","应用名称不允许重复!");
							 		      }
					                   }
					         });
					    	 $.ajax({
					             type: "POST",
					             url: $.appClient.generateUrl({ESAppSetting : 'judgeAppNameCn'}, 'x'),
					             data: { id : $("#editApp input[name='id']").val(),appNameCn:encodeURI(appNameCn)},
					             dataType: "json",
					             async:false,
					             success: function(data){
					            	 if(!data){
								 			$("#editApp input[name='appNameCn']").addClass("warnning");
								 			$("#editApp input[name='appNameCn']").attr("title","应用中文名称不允许重复!");
								 		}
					                  }
					         });
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
					    		//gengqianfeng 20140915 应用名称格式限制提示
					    		$("#editApp input[name='appName']").attr("title","只能输入英文大小写字符或下划线");
					    		return false;
					    	}else if(appNameCnZZ.test(appNameCn)==false){
					    		//gengqianfeng 20141016  应用中文名称字符验证
					    		$("#addapp input[name='appNameCn']").addClass("warnning");
					    		$("#addapp input[name='appNameCn']").attr("title",'该输入项不允许包含'+"|\\'?.\"><;"+'等特殊字符');
					    	 	return false;
					    	}else if(execLen(appName,50)==false){
					    		//gengqianfeng 20140915 应用名称长度验证
					    		$("#editApp input[name='appName']").addClass("warnning");
					    		$("#editApp input[name='appName']").attr("title","数据长度最大为50个字符");
					    	 	return false;
					    	}else if(execLen(appNameCn,150)==false){
					    		//gengqianfeng 20140915 应用中文名称长度验证
					    		$("#editApp input[name='appNameCn']").addClass("warnning");
					    		$("#editApp input[name='appNameCn']").attr("title","数据长度最大为150个字符(75个汉字)");
					    	 	return false;
					    	}
//					    	else if(appTokenZZ.test(appToken)==false){
//					    		$("#editApp input[name='appToken']").addClass("warnning");
//					    		//gengqianfeng 20140915 应用口令格式限制提示
//					    		$("#editApp input[name='appToken']").attr("title","只能输入英文大小写字符");
//					    		return false;
//					    	}else if(execLen(appToken,150)==false){
//					    		//gengqianfeng 20140915 应用口令长度验证
//					    		$("#editApp input[name='appToken']").addClass("warnning");
//					    		$("#editApp input[name='appToken']").attr("title","应用口令长度不能超过150个字符");
//					    	 	return false;
//					    	}
					    	else if(!judgeSummit($("#editApp"))){
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
//gengqianfeng 20140915 长度验证
function execLen(value,len){
	 if(value!=''){
    	var strlength =value.replace(/[^\x00-\xff]/g,'aa').length; //字符长度 一个汉字两个字符
    	if(strlength > len ){
    		var charLen = (len%2==0)?(len/2):((len-1)/2);
    		return false;
    	}  
    }
}
function judgeSummit(obj){
	var flag=true;
	$("input[type='text']",obj).each(function(){
		if($(this).hasClass("warnning")){ 
			flag= false;
			return;
	      }
	});
	if($("#saasSupport").hasClass("warnning")){
		flag= false;
	}
	return flag;
}
//输入关键字检索应用
function appQuery(){
	//alert("appQuery");
	var keyword=$.trim($('input[name="appKeyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var url=$.appClient.generateUrl({ESAppSetting:'getAppList',keyWord:keyword},'x');
	$("#appSettingGrid").flexOptions({query:keyword,newp:1}).flexReload();
	return false;
}
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'appKeyWord') {
		appQuery();
	}
});
 
