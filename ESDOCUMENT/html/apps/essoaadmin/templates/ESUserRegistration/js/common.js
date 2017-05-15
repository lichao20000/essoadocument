$(document).ready(function() {
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 230;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width ;
				var tblHeight = height - 137;
				
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};
	$("#ESUserRegistrationGrid").flexigrid({
		url : $.appClient.generateUrl({ESUserRegistration:'getList'}, 'x'),
		dataType : 'json',
		colModel : [ {
			display : '',
			name : 'serialNum',
			width : 30,
			align : 'center'
		}, {
			display : '<input id="UserRegistrationGridIds" type="checkbox"/>',
			name : 'ids',
			width : 30,
			align : 'center'
		}, {
			display : '操作',
			name : 'operate',
			width : 30,
			sortable : true,
			align : 'center'
		}, {
			name : 'ID',
			metadata : 'ID',
			align : 'center',
			hide : true
		}, {
			display : '用户名',
			name : 'USERID',
			metadata : 'USERID',
			width : 160,
			align : 'left'
		}, {
			display : '',
			name : 'LASTNAME',
			metadata : 'LASTNAME',
			width : 30,
			align : 'left',
			hide : true
		}, {
			display : '',
			name : 'FIRSTNAME',
			metadata : 'FIRSTNAME',
			width : 30,
			align : 'left',
			hide : true
		}, {
			display : '姓名',
			name : 'FULLNAME',
			width : 160,
			sortable : true,
			align : 'left'
		}, {
			display : '手机',
			name : 'MOBTEL',
			metadata : 'MOBTEL',
			width : 130,
			sortable : true,
			align : 'left'
		}, {
			display : '状态',
			name : 'USERSTATUS',
			metadata : 'USERSTATUS',
			width : 30,
			sortable : true,
			align : 'left'
		}  ],
		buttons : [ {
						name : '注册',
						bclass : 'add',
						onpress : register
					},{
						name : '启用',
						bclass : 'start',
						onpress : enableUsers
					},{
						name : '禁用',
						bclass : 'stop',
						onpress : disableUsers
					},{
						name : '删除',
						bclass : 'delete',
						onpress : deleteusers
					},{
						name : '密码重置',
						bclass : 'batchmodify',
						onpress : resetUsersPassword
		}],
		singleSelect : true,
		usepager : true,
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	
	//全选
	$("#UserRegistrationGridIds").die().live('click',function(){
		$("#ESUserRegistrationGrid input[type='checkbox']").attr('checked',$(this).is(':checked'));
		$("#UserRegistrationGridIds").attr('checked',$(this).is(':checked'));
	});
	
	//启用
	function enableUsers(){
		var checkboxs = $('#ESUserRegistrationGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择待处理数据，再进行此操作！',time:3});
			return;
		}
		var ids = '';
		checkboxs.each(function() {
			ids += ','+$(this).val() ;
		});
		ids = ids.substring(1, ids.length) ;
		$.ajax({
    		url:$.appClient.generateUrl({ESUserRegistration : 'enableUsers'},'x'),
    		type:'post',
    		data:{ids:ids},
    		success:function(rt){
    			if(rt == "true"){
    				$("#ESUserRegistrationGrid").flexReload();
	    			$.dialog.notice({icon:'succeed',content:"用户启用成功！",time:3});
    			}else{
    				$.dialog.notice({icon:'error',content:"用户启用失败！",time:3});
    			}
    		}
    	});
	}
	
	//禁用
	function disableUsers(){
		var checkboxs = $('#ESUserRegistrationGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择待处理数据，再进行此操作！',time:3});
			return;
		}
		var ids = '';
		var hasAdmin = false ;
		checkboxs.each(function() {
			if('admin' == $(this).attr('userid')){
				hasAdmin = true ;
			} else {
				ids += ','+$(this).val() ;
			}
		});
		if(hasAdmin){
			$.dialog.notice({icon:'warning',content:'admin用户为系统用户，不能禁用！',time:3});
			return false ;
		}
		ids = ids.substring(1, ids.length) ;
		$.dialog({
			content : '确定要禁用所选用户吗？禁用的用户将不能登录系统！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				$.ajax({
					url:$.appClient.generateUrl({ESUserRegistration : 'disableUsers'},'x'),
					type:'post',
					data:{ids:ids},
					success:function(rt){
						if(rt == "true"){
							$("#ESUserRegistrationGrid").flexReload();
							$.dialog.notice({icon:'succeed',content:"用户禁用成功！",time:3});
						}else{
							$.dialog.notice({icon:'error',content:"用户禁用失败！",time:3});
						}
					}
				});
			}
		});
	}
	
	//删除用户
	function deleteusers(){
		var checkboxs = $('#ESUserRegistrationGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择待处理数据，再进行此操作！',time:3});
			return;
		}
		var ids = '';
		var hasAdmin = false ;
		checkboxs.each(function() {
			if('admin' == $(this).attr('userid')){
				hasAdmin = true ;
			} else {
				ids += ','+$(this).val() ;
			}
		});
		if(hasAdmin){
			$.dialog.notice({icon:'warning',content:'admin用户为系统用户，不能删除！',time:3});
			return false ;
		}
		ids = ids.substring(1, ids.length) ;
		$.dialog({
			content : '确定要删除吗？删除后不能恢复！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				$.ajax({
					url:$.appClient.generateUrl({ESUserRegistration : 'deleteUsers'},'x'),
					type:'post',
					data:{ids:ids},
					success:function(rt){
						if(rt == "true"){
							$("#ESUserRegistrationGrid").flexReload();
							$.dialog.notice({icon:'succeed',content:"用户删除成功！",time:3});
						}else{
							$.dialog.notice({icon:'warning',content:"您所勾选的用户中存在saas机构管理员用户，不允许删除！",time:3});
						}
					}
				});
			}
		});
	}
	
	//用户密码重置
	function resetUsersPassword(){
		var checkboxs = $('#ESUserRegistrationGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择待处理数据，再进行此操作！',time:3});
			return;
		}
		var ids = '';
		var userids = '';
		checkboxs.each(function() {
			ids += ','+$(this).val() ;
			userids += ','+$(this).attr('userid') ;
		});
		ids = ids.substring(1, ids.length) ;
		userids = userids.substring(1, userids.length) ;
		$.ajax({
	        url : $.appClient.generateUrl({ESUserRegistration : 'resetUsersPasswordPage'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'用户密码重置',
			    	modal:true, 
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    width:100,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'确定',
				    ok:true,
				    cancelVal: '取消',
				    cancel: true,
				    content:data,
				    ok:function(){
				    	if(!$("#resetUserPasswordForm").validate()){
				    		$.dialog.notice({icon:'warning',content:'表单验证未通过！',time:3});
				    		return false;
				    	}
				    	if($('#password').val() != $('#confirmPassword').val()){
				    		$.dialog.notice({icon:'warning',content:'密码与确认密码不一致！',time:3});
							return false;
				    	}
				    	$.ajax({
							url:$.appClient.generateUrl({ESUserRegistration : 'resetUsersPassword'},'x'),
							type:'post',
							data:{ids:ids, userids:userids, password:$('#password').val()},
							success:function(rt){
								if(rt == "true"){
									$("#ESUserRegistrationGrid").flexReload();
									$.dialog.notice({icon:'succeed',content:"用户密码重置成功！",time:3});
								}else{
									$.dialog.notice({icon:'error',content:"用户密码重置失败！",time:3});
								}
							}
						});
					},
					init:function(){
						$("#registerForm").autovalidate();
					}
			    });
		    },
		    cache:false
		});
	}
	
	//注册
	function register(){
		$.ajax({
	        url : $.appClient.generateUrl({ESUserRegistration : 'register'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'用户注册',
			    	modal:true, 
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    height:200,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'注册',
				    ok:true,
				    cancelVal: '取消',
				    cancel: true,
				    content:data,
				    ok:function(){
				    	if(!$("#registerForm").validate()){
				    		$.dialog.notice({icon:'warning',content:'表单验证未通过！',time:3});
				    		return false;
				    	}
				    	if($("#USERID").val().indexOf(' ')>=0){
				    		$("#USERID").addClass("warnning");
				   	 		$.dialog.notice({icon:'warning',content:'用户名不能有空格！',time:3});
				   	 		return false;
				    	}
				    	var emailaddressZZ = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				   	 	var emailaddress = $("#USERID").val();
				   	 	emailaddress=emailaddress.replace(/[ ]/g,"");
				   	 	if(emailaddressZZ.test(emailaddress)==false){
				   	 		$(this).addClass("invalid-text");
				   	 		$.dialog.notice({icon:'warning',content:'用户名不符合邮箱格式，不能进行注册！',time:3});
				   	 		return false;
				   	 	}else{
				   	 		$(this).removeClass("invalid-text");
				   	 	}
				    	if($("#PASSWORD").val()!=$("#confirmPassword").val()){
				    		$("#confirmPassword").addClass("invalid-text");
				    		$.dialog.notice({icon:'warning',content:'确认密码与密码输入不同！',time:3});
				    		return false;
				    	}else{
				    		$("#confirmPassword").removeClass("invalid-text");
				    	}
				    	var that = this;
				    	$.ajax({
				    		url:$.appClient.generateUrl({ESUserRegistration : 'addOrEdit'},'x'),
				    		type:'post',
				    		dataType:'json',
				    		data:{formData:$("#registerForm").serialize()},
				    		success:function(rt){
				    			if(rt.success == "true"){
				    				that.close();
				    				$("#ESUserRegistrationGrid").flexReload();
					    			$.dialog.notice({icon:'succeed',content:rt.msg,time:3});
				    			}else{
				    				$.dialog.notice({icon:'error',content:rt.msg,time:3});
				    				return false;
				    			}
				    		}
				    	});
				    	return false;
					},
					init:function(){
						$("#registerForm").autovalidate();
					}
			    });
		    },
		    cache:false
		});
	}
	
	//编辑
	$(".editbtn").die().live("click", function(){
		var tr = $(this).closest("tr");
		var columns = ['ID','USERID','LASTNAME','FIRSTNAME','MOBTEL','USERSTATUS'];
		var colValues = $("#ESUserRegistrationGrid").flexGetColumnValue(tr,columns);
		$.ajax({
			type:'POST',
		    url : $.appClient.generateUrl({ESUserRegistration:'edit'},'x'),
		    data:{data:colValues},
		    success:function(data){
		      $.dialog({
		    	title:'用户编辑',
	    	   	fixed:false,
	    	    resize: false,
	    	    lock : true,
				opacity : 0.1,
		    	content:data,
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'保存',
			    ok:true,
			    ok:function(){
			    	if(!$("#registerForm").validate()){
			    		$.dialog.notice({icon:'warning',content:'表单验证未通过！',time:3});
			    		return false;
			    	}
			    	var that = this;
			    	$.ajax({
			    		url:$.appClient.generateUrl({ESUserRegistration : 'addOrEdit'},'x'),
			    		type:'post',
			    		dataType:'json',
			    		data:{formData:$("#registerForm").serialize()},
			    		success:function(rt){
			    			if(rt.success == "true"){
			    				that.close();
			    				$("#ESUserRegistrationGrid").flexReload();
				    			$.dialog.notice({icon:'succeed',content:rt.msg,time:3});
			    			}else{
			    				$.dialog.notice({icon:'error',content:rt.msg,time:3});
			    			}
			    		}
			    	});
			    	return false;
			    },
				init:function(){
					$("#registerForm").autovalidate();
				}
			  });
		    },
		    cache:false
		});
	});
});