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
				
				var rightWidth = width;
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
	$("#orgRegisterGrid").flexigrid({
		url : $.appClient.generateUrl({ESOrgRegister:'getList'}, 'x'),
		dataType : 'json',
		colModel : [ {
			display : '',
			name : 'serialNum',
			width : 30,
			align : 'center'
		}, {
			display : '',
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
			name : 'id',
			metadata : 'id',
			align : 'center',
			hide : true
		}, {
			display : '机构组织名称',
			name : 'bigOrgName',
			metadata : 'bigOrgName',
			width : 200,
			align : 'left'
		}, {
			display : '申请应用',
			name : 'applyAppName',
			metadata : 'applyAppName',
			width : 160,
			align : 'left'
		}, {
			display : '管理员名称',
			name : 'superUserName',
			metadata : 'superUserName',
			width : 160,
			align : 'left'
		}, {
			display : '姓名',
			name : 'fullName',
			width : 160,
			sortable : true,
			align : 'left'
		}, {
			display : '名',
			name : 'firstName',
			metadata : 'firstName',
			hide : true
		}, {
			display : '姓',
			name : 'lastName',
			metadata : 'lastName',
			hide : true
		}, {
			display : '手机',
			name : 'cellPhone',
			metadata : 'cellPhone',
			width : 160,
			sortable : true,
			align : 'left'
		}  ],
		buttons : [ {
						name : '注册',
						bclass : 'add',
						onpress : register
					},{
						name : '删除',
						bclass : 'delete',
						onpress : deleteOrg
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
	
	//注册
	function register(){
		$.ajax({
	        url : $.appClient.generateUrl({ESOrgRegister : 'register'},'x'),
		    success:function(data){
		    	$.dialog({
		    		id:'saasRegisterDialog',
			    	title:'注册',
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
				    	var emailaddressZZ = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				   	 	var emailaddress = $("#registerForm input[name='superUserName']").val();
				   	 	emailaddress=emailaddress.replace(/[ ]/g,"");
				   	 	if(emailaddressZZ.test(emailaddress)==false){
				   	 		$.dialog.notice({icon:'warning',content:'管理员名称必须为邮箱格式！',time:3});
				   	 		return false;
				   	 	}
				    	if($("#password").val()!=$("#confirmPassword").val()){
				    		$("#confirmPassword").addClass("invalid-text");
				    		$.dialog.notice({icon:'warning',content:'确认密码与密码输入不同！',time:3});
				    		return false;
				    	}else{
				    		$("#confirmPassword").removeClass("invalid-text");
				    	}
//						$.dialog.notice({icon:'warning',content:'飞扬小伙伴正在努力的工作，请您耐心等待！',time:3,title:'消息提示(3秒钟后自动关闭)'});
				    	$.ajax({
				    		url:$.appClient.generateUrl({ESOrgRegister : 'addOrEdit'},'x'),
				    		type:'post',
				    		timeout: 1000000,
				    		dataType:'json',
				    		data:{formData:$("#registerForm").serialize()},
				    		success:function(rt){
				    			if(rt.success == "true"){
					    			$("#orgRegisterGrid").flexReload();
					    			$.dialog.notice({icon:'succeed',content:rt.msg,time:10,title:'消息提示(10秒钟后自动关闭)'});
					    			art.dialog.list['saasRegisterDialog'].close() ;
				    			}else{
				    				$.dialog.notice({icon:'error',content:rt.msg,time:10,title:'消息提示(10秒钟后自动关闭)'});
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
	
	function deleteOrg(){
		var checkboxs = $('#orgRegisterGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择删除的数据',time:3});
			return;
		} else if(checkboxlength > 1){
			$.dialog.notice({icon:'warning',content:'每次只能删除一条数据',time:3});
			return;
		}
		var id;
		checkboxs.each(function() {
			id = $(this).val() ;
		});
		$.dialog({
			content : '确定要删除吗？删除后不能恢复！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				$.ajax({
					url:$.appClient.generateUrl({ESOrgRegister : 'deleteOrg'},'x'),
					type:'post',
					data:{id:id},
					success:function(rt){
						if(rt == "true"){
							$("#orgRegisterGrid").flexReload();
							$.dialog.notice({icon:'succeed',content:"SAAS机构删除成功！",time:3});
						}else{
							$.dialog.notice({icon:'error',content:"SAAS机构删除失败！",time:3});
						}
					}
				});
			}
		});
	}
	
	//编辑
	$(".editbtn").die().live("click", function(){
		var tr = $(this).closest("tr");
		var columns = ['id','bigOrgName','superUserName','firstName','lastName','cellPhone'];
		var datas = $("#orgRegisterGrid").flexGetColumnValue(tr,columns);
		$.ajax({
			type:'POST',
		    url : $.appClient.generateUrl({ESOrgRegister:'edit'},'x'),
		    data:{data:datas},
		    success:function(data){
		      $.dialog({
		    	title:'机构注册信息编辑',
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
			    		url:$.appClient.generateUrl({ESOrgRegister : 'addOrEdit'},'x'),
			    		type:'post',
			    		dataType:'json',
			    		data:{formData:$("#registerForm").serialize()},
			    		success:function(rt){
			    			if(rt.success == "true"){
			    				that.close();
				    			$("#orgRegisterGrid").flexReload();
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