//author  wangbo  20140403
var emailaddressZZ = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;//验证邮箱的正则
var orgsortZZ =  /^[0-9]*$/;//验证机构的优先级
//gengqianfeng 20140915 验证机构名称内是否包含特殊字符
var orgnameZZ= /^([\u4e00-\u9fa5]|[a-zA-Z0-9])+$/;
//gengqianfeng 20140915 长度限制
var lengthZZ= /.{150}|^\s*$/g;
//给编辑用户按钮绑定事件
$(".editbtn").die().live("click", function(){
	edit_user($(this).closest("tr"));
});
var selectedIds="";
var mark = false;
//删除用户
function delete_user(){
	var checkboxlength = $('#userGrid input:checked').length;
	if (checkboxlength == 0) {
		$.dialog.notice({icon : 'warning',content : '请选择要删除的用户！',time : 3});
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
			var uidStr = "'";
			$('#userGrid input:checked').each(
				function(i) {
					//gengqianfeng 20140915 添加用户名参数多个以','分隔
					var vl=$('#userGrid input:checked:eq(' + i+ ')');
					idStr += vl.val()+ ',';
					uidStr += vl.attr("uids")+"','";
				});
			    idStr=idStr.substring(0,idStr.length-1);
			    uidStr=uidStr.substring(0,uidStr.length-2);
				var url = $.appClient.generateUrl({ESOrgAndUser : 'deleteUserList'}, 'x');
				$.post(url, {ids : idStr,uids:uidStr}, function(res) {
					if(res=='true'){
						$.dialog.notice({
							icon : 'succeed',
							content :'删除成功！',
							time : 3
						});
						$("#userGrid").flexReload();
						return;
					}else{
						$.dialog.notice({
							icon : 'warning',
							content :'不允许删除',
							time : 3
						});
						$("#userGrid").flexReload();
						return;
					}
				});
		}
	});
}


function editMyUserinfo(){
	$.ajax({
	    url : $.appClient.generateUrl({ESOrgAndUser : 'editMyUserinfo'},'x'),
	    type : 'post',
	    success:function(data){
	        $.dialog({
		    	title:'编辑个人信息',
	    	   	fixed:false,
	    	    resize: false,
	    	    lock : true,
				opacity : 0.1,
		    	content:data,
		    	padding:0,
		    	button:[{
		    		id:'imageFile',name:'修改头像',callback:function(){return false;}
		    	},{id:'modifyPassword',name:'修改密码',callback:function(){
		    					var editUserForm = this;
		    					$.ajax({
		    						url : $.appClient.generateUrl({ESOrgAndUser : 'modifyPasswordPage'},'x'),
		    						type : 'post',
		    						success:function(resultform){
							    		$.dialog({
							    			id:'modifyPasswordForm',
							    			title:'修改密码',
							    			content : resultform,
							    			okVal : '确定',
							    			ok : true,
							    			cancelVal : '关闭',
							    			cancel : true,
							    			ok : function() {
							    				var oldPassword = $("#modifyPasswordDIV input[name='oldPassword']").val();
							    				var newPassword = $("#modifyPasswordDIV input[name='newPassword']").val();
							    				var repetPassword = $("#modifyPasswordDIV input[name='repetPassword']").val();
							    				if(oldPassword=='' || newPassword==''){
							    					$("#modifyPasswordDIV input[name='oldPassword']").addClass("warnning");
								    				$("#modifyPasswordDIV input[name='newPassword']").addClass("warnning");
							    					return false;
							    				}
							    				if(newPassword != repetPassword){
							    					$("#modifyPasswordDIV input[name='repetPassword']").addClass("warnning");
							    					return false;
							    				}
							    				
//							    				alert(newPassword);
							    				var modifyurl = $.appClient.generateUrl({ESOrgAndUser : 'modifyPassword'}, 'x');
							    				$.post(modifyurl,{oldPassword:oldPassword,newPassword:newPassword}, function(result){
							    					var isPasswordValid = result.isPasswordValid;//密码是否正确
							    					var isModifySuccess = result.isModifySuccess;//是否重置成功
							    					if(isPasswordValid=='true'){
							    						if(isModifySuccess=='1'){
							    							$.dialog.notice({icon : 'succeed',content : '修改成功！',title : '3秒后自动关闭',time : 3});
							    							art.dialog.list['modifyPasswordForm'].close();
							    						}else{
							    							$.dialog.notice({icon : 'error',content : '修改失败！',title : '3秒后自动关闭',time : 3});
							    							art.dialog.list['modifyPasswordForm'].close();
							    						}
							    					}else{
							    						$.dialog.notice({icon : 'warning',content : '您输入的密码不正确！',title : '3秒后自动关闭',time : 3});
							    						$("#modifyPasswordDIV input[name='oldPassword']").addClass("warnning");
							    					}
							    					
									    		},'json');
							    				return false;
							    			}
							    		});
		    						}
		    					});
					    		return false;
		    				}
		    			}],
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'保存',
			    ok:true,
			    ok:function()
		    	{ 
			    	var userid = $("#editUser input[name='userid']").val();
			    	var firstname = $("#editUser input[name='firstname']").val();
			    	var lastname = $("#editUser input[name='lastname']").val();
			    	var emailaddress = $("#editUser input[name='emailaddress']").val();
			    	var mobtel = $("#editUser input[name='mobtel']").val();
			    	var userstatus = $("#editUser select[name='userstatus']").val(); 
			     	var url = $.appClient.generateUrl({ESOrgAndUser : 'updateUser'}, 'x');
			    	$("#editUser input[name='roleIds']").val(selectedIds);
			    	var userInfo = $("#editUser").serialize();
			    	if(userid==''||firstname==''||lastname==''||mobtel==""||userstatus==""){
			    		if(userid=='')
			    			$("#editUser input[name='userid']").addClass("warnning");
			    		if(firstname=='')
			    			$("#editUser input[name='firstname']").addClass("warnning");
			    		if(lastname=='')
			    			$("#editUser input[name='lastname']").addClass("warnning");
			    		if(mobtel=='')
			    			$("#editUser input[name='mobtel']").addClass("warnning");
			    		if(userstatus=='')
			    			$("#editUser select[name='userstatus']").addClass("warnning");
			    		return false;
			    	}else if(emailaddress!='' && emailaddressZZ.test(emailaddress)==false){
			    		$("#editUser input[name='emailaddress']").addClass("warnning");
			    		return false;
			    	}else if(mobtelZZ.test(mobtel)==false){
			    		$("#editUser input[name='mobtel']").addClass("warnning");
			    		return false;
			    	}else if(nameZZ.test(firstname)==false || lengthZZ.test(firstname)==true){
			    		$("#editUser input[name='firstname']").addClass("warnning");
			    		return false;
			    	}else if(nameZZ.test(lastname)==false || lengthZZ.test(lastname)==true){
			    		$("#editUser input[name='lastname']").addClass("warnning");
			    		return false;
			    	}else{
			    		$.post(url,{data : userInfo}, function(res){
			    			if (res == 'true') {
			    				$('#mainPageCurUser').html(lastname+firstname);//修改主页上的名字
			    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
			    				$("#userGrid").flexReload();
			    				mark  = false;
			    				selectedIds  ='';
			    				return;
			    			} else {
			    				$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
			    				mark = false;
								selectedIds='';
			    				return;
			    			}
			    		});
			    	}
				},cancel:function()
				{
					  mark = false;
					  selectedIds='';
				}
		    });
	    }
	});
}

/** wanghongchen 20140930 增加头像上传窗口 **/
$("#imageFile").live('click',function(){
	$.dialog({
		id:'updateImageFileDialog',
		title:'上传文件',
	    fixed:true,
	    resize: false,
	    padding:'0px 0px',
		content:"<div class='fieldset flash' id='fsUploadProgress'></div>",
		cancelVal: '关闭',
		cancel: function (){
		},
		button: [
    		{id:'btnAdd', name: '添加文件'},
            {id:'btnCancel', name: '删除文件', disabled: true},
            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
		],
		init:createSWFUpload
	});	    	
});

//修改用户
function edit_user(tr){
	var columns = ['id','userid','lastName','firstName','userStatus','mobTel','emailAddress'];
	var colValues = $("#userGrid").flexGetColumnValue(tr,columns);
		$.ajax({
		    url : $.appClient.generateUrl({ESOrgAndUser : 'edit_user'},'x'),
		    type : 'post',
		    data : {data:colValues},
		    success:function(data){
			      $.dialog({
				    	title:'编辑用户',
			    	   	fixed:false,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
				    	content:data,
				    	padding:0,
				    	//guolanrui 20140827 暂时将密码重置功能注掉，等需要时再放开
//				    	button:[{id:'resetPassword',name:'密码重置',callback:function(){
//				    					var editUserForm = this;
//							    		$.dialog({
//							    			id:'resetPasswordForm',
//							    			title:'请输入您的登录密码',
//							    			content : '<input type="password" id="writePassword">',
//							    			okVal : '确定',
//							    			ok : true,
//							    			cancelVal : '关闭',
//							    			cancel : true,
//							    			ok : function() {
//							    				var writePassword = $('#writePassword').val();
//							    				var edituserid = $("#editUser input[name='userid']").val();
//							    				if(writePassword==''){
//									    			$("#writePassword").addClass("warnning");
//									    			return false;
//							    				}
//							    				var reseturl = $.appClient.generateUrl({ESOrgAndUser : 'resetPassword'}, 'x');
//							    				$.post(reseturl,{writePassword : writePassword,edituserid:edituserid}, function(result){
//							    					var isPasswordValid = result.isPasswordValid;//密码是否正确
//							    					var isResetSuccess = result.isResetSuccess;//是否重置成功
//							    					if(isPasswordValid=='true'){
//							    						if(isResetSuccess=='1'){
//							    							$.dialog.notice({icon : 'succeed',content : '用户【'+edituserid+'】的登陆密码已成功重置为【000000】',title : '3秒后自动关闭',time : 3});
//							    							art.dialog.list['resetPasswordForm'].close();
//							    						}else{
//							    							$.dialog.notice({icon : 'error',content : '重置失败！',title : '3秒后自动关闭',time : 3});
//							    							art.dialog.list['resetPasswordForm'].close();
//							    						}
//							    					}else{
//							    						$.dialog.notice({icon : 'warning',content : '您输入的密码不正确！',title : '3秒后自动关闭',time : 3});
//							    						$("#writePassword").addClass("warnning");
//							    					}
//							    					
//									    		},'json');
//							    				return false;
//							    			}
//							    		});
//							    		return false;
//				    				}
//				    			}],
					    cancelVal: '关闭',
					    cancel: true,
					    okVal:'保存',
					    ok:true,
					    //gengqianfeng 20140917 用户修改验证初始加载
					    init : function() {
							$('#editUser').autovalidate();
						},
					    ok:function()
				    	{ 
					    	//gengqianfeng 20140917 用户修改验证确定加载
					    	var form=$('#editUser');
				    		if (!form.validate()) {
				    			return false;
				    		}
					    	var userid = $("#editUser input[name='userid']").val();
					    	var firstname = $("#editUser input[name='firstname']").val();
					    	var lastname = $("#editUser input[name='lastname']").val();
					    	var emailaddress = $("#editUser input[name='emailaddress']").val();
					    	var mobtel = $("#editUser input[name='mobtel']").val();
					    	var userstatus = $("#editUser select[name='userstatus']").val(); 
					     	var url = $.appClient.generateUrl({ESOrgAndUser : 'updateUser'}, 'x');
					    	$("#editUser input[name='roleIds']").val(selectedIds);
					    	var userInfo = $("#editUser").serialize();
//					    	if(userid==''||firstname==''||lastname==''||mobtel==""||userstatus==""){
//					    		if(userid=='')
//					    			$("#editUser input[name='userid']").addClass("warnning");
//					    		if(firstname=='')
//					    			$("#editUser input[name='firstname']").addClass("warnning");
//					    		if(lastname=='')
//					    			$("#editUser input[name='lastname']").addClass("warnning");
//					    		if(mobtel=='')
//					    			$("#editUser input[name='mobtel']").addClass("warnning");
//					    		if(userstatus=='')
//					    			$("#editUser select[name='userstatus']").addClass("warnning");
//					    		return false;
//					    	}else if(emailaddress!='' && emailaddressZZ.test(emailaddress)==false){
//					    		$("#editUser input[name='emailaddress']").addClass("warnning");
//					    		return false;
//					    	}else if(mobtelZZ.test(mobtel)==false){
//					    		$("#editUser input[name='mobtel']").addClass("warnning");
//					    		return false;
//					    	}else if(nameZZ.test(firstname)==false || lengthZZ.test(firstname)==true){
//					    		$("#editUser input[name='firstname']").addClass("warnning");
//					    		return false;
//					    	}else if(nameZZ.test(lastname)==false || lengthZZ.test(lastname)==true){
//					    		$("#editUser input[name='lastname']").addClass("warnning");
//					    		return false;
//					    	}else{
					    		$.post(url,{data : userInfo}, function(res){
					    			if (res == 'true') {
					    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
					    				$("#userGrid").flexReload();
					    				mark  = false;
					    				selectedIds  ='';
					    				return;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
					    				mark = false;
										selectedIds='';
					    				return;
					    			}
					    		});
//					    	}
						},cancel:function()
						{
							  mark = false;
							  selectedIds='';
						}
				    });
			    },
			    cache:false
		});
}
function getUserQuery(){
	var keyword=$.trim($('input[name="userKeyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var orgId = '';
	var orgSeq = '';
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	if(orgTreeObj!=null){
		var nodes = orgTreeObj.getSelectedNodes();
		if(nodes.length<=0){
//					return false;
		}else if(nodes[0].name=="机构设置"){
//					return;
		} else {
			orgId = nodes[0].id;
			orgSeq = nodes[0].idseq;
		}
	} 
	var data = orgSeq+orgId;
	var url=$.appClient.generateUrl({ESOrgAndUser:'findUserListByOrgid',keyWord:encodeURI(keyword),orgSeq:data},'x');
	$("#userGrid").flexOptions({url:url}).flexReload();
	return false;
}
function getUserRoleQuery(){
	var keyword=$.trim($('input[name="userRoleKeyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	$("#userRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds,keyWord:encodeURI(keyword)}, 'x')}).flexReload();
}
function getEditUserRoleQuery(){
	var keyword=$.trim($('input[name="editUserRoleKeyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	$("#editUserRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds,keyWord:encodeURI(keyword)}, 'x')}).flexReload();
}
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'userKeyWord') {
		getUserQuery();
	}else if(event.keyCode == 13 && document.activeElement.id == 'userRoleKeyWord'){
		getUserRoleQuery();
	}else if(event.keyCode == 13 && document.activeElement.id == 'editUserRoleKeyWord'){
		getEditUserRoleQuery();
	}else if(event.keyCode == 13 && document.activeElement.id == 'roleKeyWord'){
		getRoleQuery();
	}
});
//增加机构
function addOrg(){
	var appId = 0;
	var appTreeObj = $.fn.zTree.getZTreeObj("appTree");
	if(appTreeObj!=null){
		var nodes = appTreeObj.getSelectedNodes();
		appId = nodes[0].id;
	} 
	var orgId = 0;
	var orgSeq = '';
	var selectedParentNode = null;//记录住点击的父节点，供下面增加子节点使用
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	if(orgTreeObj!=null){
		var nodes = orgTreeObj.getSelectedNodes();
		if(nodes.length<=0){
			return;
		}else if(nodes[0].name=="机构设置"){
			if(nodes[0].isParent){
				return;
			}
		}
		orgId = nodes[0].id;
		orgSeq = nodes[0].idseq;
		selectedParentNode = nodes[0];
	} 
	var data = '';
	if(orgId=="org"){
		data=appId+','+orgId+',0.';
	}else{
		data=appId+','+orgId+','+orgSeq+orgId+'.';
	}
	$.ajax({
	        url : $.appClient.generateUrl({ESOrgAndUser: 'add_org',data:data},'x'),
		    success:function(data){
			    	$.dialog({
				    	title:'添加机构',
			    	   	fixed:false,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
				    	okVal:'保存',
					    ok:true,
					    cancelVal: '关闭',
					    cancel: true,
					    content:data,
					    //gengqianfeng 20140917  机构添加验证初始加载
					    init : function() {
	    					$('#addOrg').autovalidate();
	    				},
					    ok:function()
				    	{ 
					    	//gengqianfeng 20140917 机构添加验证确定加载
					    	var form=$('#addOrg');
				    		if (!form.validate()) {
				    			return false;
				    		}
				    		var that = this; 
					    	var idseq = $("#addOrg input[name='idseq']").val();
					    	var orgname = $("#addOrg input[name='orgname']").val();
					    	var address = $("#addOrg input[name='address']").val();
					    	var position = $("#addOrg input[name='position']").val();
					    	var orgsort = $("#addOrg input[name='orgsort']").val();
//					    	if(orgname==''||address==''||orgsort==''){
//					    		if(orgname=='')
//					    			$("#addOrg input[name='orgname']").addClass("warnning");
//					    		if(address=='')
//					    			$("#addOrg input[name='address']").addClass("warnning");
//					    		if(orgsort=='')
//					    			$("#addOrg input[name='orgsort']").addClass("warnning");
//					    		return false;
//					    	}else if(orgnameZZ.test(orgname)==false){
//					    		//gengqianfeng 20140915 机构名称特殊符号限制
//					    		$("#addOrg input[name='orgname']").addClass("warnning");
//					    		$("#addOrg input[name='orgname']").attr("title","机构名称不允许包含特殊字符");
//					     		return false;
//					    	}else if(execLen(orgname,150)==false){
//					    		//gengqianfeng 20140915 机构名称长度限制
//					    		$("#addOrg input[name='orgname']").addClass("warnning");
//					    		$("#addOrg input[name='orgname']").attr("title","机构名称长度不能超过150个字符");
//					     		return false;
//					    	}else if(execLen(address,150)==false){
//					    		//gengqianfeng 20140915 地址长度限制
//					    		$("#addOrg input[name='address']").addClass("warnning");
//					    		$("#addOrg input[name='address']").attr("title","地址长度不能超过150个字符");
//					     		return false;
//					    	}else if(orgsortZZ.test(orgsort)==false){
//					    		$("#addOrg input[name='orgsort']").addClass("warnning");
//					    		//gengqianfeng 20140915 排序提示
//					    		$("#addOrg input[name='orgsort']").attr("title","排序数字");
//					    		return false;
//					    	}else{
					    		var url = $.appClient.generateUrl({ESOrgAndUser : 'addOrg'}, 'x');
					    		var orgInfo = $("#addOrg").serialize();
					    		$.post(url,{data : orgInfo}, function(res){//记住这里要返回插入后生成的id
					    			var jsonDX = eval('(' + res + ')');
					    			if (jsonDX.res == 'true') {
					    				that.close();
					    				var newNode = {name:orgname,id:jsonDX.id,idseq:idseq,address:address,position:position,orgsort:orgsort};
					    				//wanghongchen 20140902 解决在叶子节点下添加子节点刷不出子节点问题，bug846
					    				if(selectedParentNode.isParent){
					    					orgTreeObj.reAsyncChildNodes(selectedParentNode,"refresh");
					    				}else{
						    				orgTreeObj.addNodes(selectedParentNode,newNode);
					    				}
					    				$.dialog.notice({content:'添加成功!',time:3,icon:'succeed'});
					    			} else {
					    				$.dialog.notice({content:jsonDX.msg,time:3,icon:'error'});
					    			}
					    		});
//					    	}
					    	return false;
						}
				    });
			    },
			    cache:false
		});
}
//删除机构
function delOrg(){
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	if(orgTreeObj!=null){
		//判断该机构中是否有用户var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
		var nodes = orgTreeObj.getSelectedNodes();
		var orgId = nodes[0].id;
		var idseq = nodes[0].idseq;
		var orgseq=idseq+orgId
		$.get($.appClient.generateUrl({ESOrgAndUser : 'judgeIfHaveUser'}, 'x'),{orgseq:orgseq},
				function(res){ 
					if (res == 'true') {//该机构有用户
						$.dialog.notice({content:'该机构下存在用户,不能被删除!',time:3,icon:'error'});
					}else{
						var nodes = orgTreeObj.getSelectedNodes();
						if(nodes.length<=0){
							return;
						}else if(nodes[0].name=="机构设置"){
							return ;
						}
						$.dialog({
							content : '确定要删除吗？删除后不能恢复！',
							okVal : '确定',
							ok : true,
							cancelVal : '关闭',
							cancel : true,
							ok : function() {
								var that = this;
								var orgId = 0;
								var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
								var selectedParentNode = null;//记录住点击的父节点，供下面增加子节点使用
								if(orgTreeObj!=null){
									var nodes = orgTreeObj.getSelectedNodes();
									orgId = nodes[0].id;
									selectedParentNode = nodes[0];
								} 
								var data = orgId;
								var url = $.appClient.generateUrl({ESOrgAndUser : 'delOrg'}, 'x');
								$.post(url,{data : data}, function(res){ 
									if (res == 'true') {
										orgTreeObj.removeNode(selectedParentNode);
										that.close();
										$.dialog.notice({content:'删除成功!',time:3,icon:'succeed'});
									} else {
										$.dialog.notice({content:'删除失败!',time:3,icon:'error'});
									}
								});
							}
						});	
					}
				}
		);
	
	} 
}
//编辑机构
function editOrg(){
	var data=null;
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	var selectedParentNode = null;//记录住点击的父节点，供下面增加子节点使用
	if(orgTreeObj!=null){
		var nodes = orgTreeObj.getSelectedNodes();
		if(nodes.length<=0){
			return;
		}else if(nodes[0].name=="机构设置"){
			return;
		}
		selectedParentNode = nodes[0];
		data=selectedParentNode.id+'&';
		data+=selectedParentNode.name+'&';
		data+=selectedParentNode.address+'&';
		data+=selectedParentNode.position+'&';
		data+=selectedParentNode.orgsort;
	} 
	$.ajax({
        url : $.appClient.generateUrl({ESOrgAndUser: 'edit_org'},'x'),
        type : 'post',
        data : {data:data},
	    success:function(data){
		    	$.dialog({
			    	title:'编辑机构',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    //gengqianfeng 20140917  机构修改验证初始加载
				    init : function() {
    					$('#editOrg').autovalidate();
    				},
				    ok:function()
			    	{ 
				    	//gengqianfeng 20140917 机构修改验证确定加载
				    	var form=$('#editOrg');
			    		if (!form.validate()) {
			    			return false;
			    		}
				    	var that = this;
				    	var orgname = $("#editOrg input[name='orgname']").val();
				    	var address = $("#editOrg input[name='address']").val();
				    	var position = $("#editOrg input[name='position']").val();
				    	var orgsort = $("#editOrg input[name='orgsort']").val();
//				    	if(orgname==''||address==''||orgsort==''){
//				    		if(orgname=='')
//				    			$("#editOrg input[name='orgname']").addClass("warnning");
//				    		if(address=='')
//				    			$("#editOrg input[name='address']").addClass("warnning");
//				    		if(orgsort=='')
//				    			$("#editOrg input[name='orgsort']").addClass("warnning");
//				    		return false;
//				    	}else if(orgnameZZ.test(orgname)==false){
//				    		//gengqianfeng 20140915 机构名称特殊符号限制
//				    		$("#editOrg input[name='orgname']").addClass("warnning");
//				    		$("#editOrg input[name='orgname']").attr("title","机构名称不允许包含特殊字符");
//				     		return false;
//				    	}else if(execLen(orgname,150)==false){
//				    		//gengqianfeng 20140915 机构名称长度限制
//				    		$("#editOrg input[name='orgname']").addClass("warnning");
//				    		$("#editOrg input[name='orgname']").attr("title","机构名称长度不能超过150个字符");
//				     		return false;
//				    	}else if(execLen(address,150)==false){
//				    		//gengqianfeng 20140915 地址长度限制
//				    		$("#editOrg input[name='address']").addClass("warnning");
//				    		$("#editOrg input[name='address']").attr("title","地址长度不能超过150个字符");
//				     		return false;
//				    	}else if(orgsortZZ.test(orgsort)==false){
//				    		$("#editOrg input[name='orgsort']").addClass("warnning");
//				    		//gengqianfeng 20140915 排序提示
//				    		$("#editOrg input[name='orgsort']").attr("title","排序数字");
//				    		return false;
//				    	}else{
				    		var url = $.appClient.generateUrl({ESOrgAndUser : 'editOrg'}, 'x');
				    		var orgInfo = $("#editOrg").serialize();
				    		$.post(url,{data : orgInfo}, function(res){ 
				    			if (res.success) {
				    				that.close();
				    				if(selectedParentNode.getParentNode().name == "机构设置"){
					    				selectedParentNode.name=orgname;
					    				selectedParentNode.address=address;
					    				selectedParentNode.position=position;
					    				selectedParentNode.orgsort=orgsort;
					    				orgTreeObj.updateNode(selectedParentNode);
				    				}else{
				    					orgTreeObj.reAsyncChildNodes(selectedParentNode.getParentNode(),"refresh");
				    				}
				    				$.dialog.notice({content:'编辑成功!',time:3,icon:'succeed'});
				    			} else {
				    				$.dialog.notice({content:res.msg,time:3,icon:'error'});
				    			}
				    		},'json');
//				     }
				     return false;
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

//给用户添加角色
function addRoleToUser(){
	var idStr='';
	if(mark==false){
	}else{
		idStr = selectedIds;
	}
	var data = idStr;
	$.ajax({
        url : $.appClient.generateUrl({ESOrgAndUser: 'listRole',data:data},'x'),
	    success:function(data){
		    	$.dialog({
			    	title:'角色列表',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    padding:0,
				    ok:function()
			    	{ 
				    	var selectedRoleId='';
						$('#listRoleGrid input:checked').each(
								function(i) {
									selectedRoleId += $('#listRoleGrid input:checked:eq(' + i+ ')').val()+ ',';
								}
						);
						if(selectedRoleId==''){//当在角色列表页面没有选择任何角色时，直接结束该方法
							return;
						}
						selectedIds = selectedRoleId+selectedIds;
						if(selectedIds.charAt(selectedIds.length-1)==','){
							selectedIds=selectedIds.substring(0,selectedIds.length-1);
						}
						mark = true;
						$("#userRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds}, 'x')}).flexReload();
			       }
			    });
		    },
		    cache:false
	});
}

//删除已分配给用户的角色
function delRoleFromUser(){
	var selectedRoleId = '';
	var checkboxlength = $('#userRoleGrid input:checked').length;
	if(checkboxlength<=0){
		return;
	}
	$("#userRoleGrid input:checked").each(
			function(i) {
				selectedRoleId += $('#userRoleGrid input:checked:eq(' + i+ ')').val()+ ',';
			}
	);
	selectedRoleId=selectedRoleId.substring(0,selectedRoleId.length-1);
	var selectedIdArray  = selectedIds.split(",");
	var selectedRoleIdArray = selectedRoleId.split(",");
	var wb= '';
	for(var i = 0;i<selectedIdArray.length;i++){
		 if(panduan(selectedIdArray[i],selectedRoleIdArray)){
		 }else{
			 wb+=selectedIdArray[i]+",";
		 }
	}
	wb=wb.substring(0,wb.length-1);
	selectedIds = wb;
	$("#userRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:wb}, 'x')}).flexReload();
}

function panduan(id,ids){
	 for(var i = 0;i<ids.length;i++){
		 if(id==ids[i]){
			 return true;
		 }
	 }
	return false;
}

//在编辑用户时给用户添加角色
function addRoleToUserOnEdit(){
	var idStr='';
	if(mark==false){
	}else{
		idStr = selectedIds;
	}
	var data = idStr;
	$.ajax({
        url : $.appClient.generateUrl({ESOrgAndUser: 'listRole',data:data},'x'),
	    success:function(data){
		    	$.dialog({
			    	title:'角色列表',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
		    	    padding:0,
					opacity : 0.1,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    ok:function()
			    	{ 
				    	var selectedRoleId='';
						$('#listRoleGrid input:checked').each(
								function(i) {
									selectedRoleId += $('#listRoleGrid input:checked:eq(' + i+ ')').val()+ ',';
								}
						);
						if(selectedRoleId==''){//当在角色列表页面没有选择任何角色时，直接结束该方法
							return;
						}
						
						$.ajax({
							url:$.appClient.generateUrl({ESOrgAndUser: 'saveUserRole'},'x'),
							type:'post',
							data:{
								roleIds:selectedRoleId,
								id:$('#editUserid').val()
							},
							success:function(){
								selectedIds = selectedRoleId+selectedIds;
								if(selectedIds.charAt(selectedIds.length-1)==','){
									selectedIds=selectedIds.substring(0,selectedIds.length-1);
								}
								mark = true;
								$("#editUserRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds}, 'x')}).flexReload();
							}
						});
						
			       }
			    });
		    },
		    cache:false
	});
}

//编辑用户时删除已分配给用户的角色
function delRoleFromUserOnEdit(){
	if($("#editUserRoleGrid input:checked").length < 1){
		$.dialog.notice({content:'请选择要删除的角色',icon:'warning',time:3});
		return false;
	}
	$.dialog({
		title:'警告',
		content:'确定删除选中角色？',
		cancelVal:'取消',
		cancel:true,
		icon:'warning',
		okVal:'确定',
		ok:function(){
			var selectedRoleId = '';
			var checkboxlength = $('#editUserRoleGrid input:checked').length;
			if(checkboxlength<=0){
				return;
			}
			$("#editUserRoleGrid input:checked").each(
					function(i) {
						selectedRoleId += $('#editUserRoleGrid input:checked:eq(' + i+ ')').val()+ ',';
					}
			);
			selectedRoleId=selectedRoleId.substring(0,selectedRoleId.length-1);
			$.ajax({
				url:$.appClient.generateUrl({ESOrgAndUser: 'deleteUserRole'}, 'x'),
				type:'post',
				data:{roleIds:selectedRoleId,id:$('#editUserid').val()},
				success:function(){
					var selectedIdArray  = selectedIds.split(",");
					var selectedRoleIdArray = selectedRoleId.split(",");
					var wb= '';
					for(var i = 0;i<selectedIdArray.length;i++){
						if(panduan(selectedIdArray[i],selectedRoleIdArray)){
						}else{
							wb+=selectedIdArray[i]+",";
						}
					}
					wb=wb.substring(0,wb.length-1);
					selectedIds = wb;
					$("#editUserRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:wb}, 'x')}).flexReload();
				}
			});
		}
	});
}

function formatRole(tdDiv){
			if(tdDiv.innerHTML=='1')
				tdDiv.innerHTML='系统角色';
			else 
				tdDiv.innerHTML='普通角色';
}
function getRoleQuery(){
	var keyword=$.trim($('input[name="roleKeyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	$("#listRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findRoleList',idStr:$("#idstrHide").val(),keyWord:encodeURI(keyword)}, 'x')}).flexReload();
}

//批量授权
function addBatchRole(){
	var ids = "";
	$('#userGrid input:checked').each(
		function(i) {
			ids += $('#userGrid input:checked:eq(' + i+ ')').val()+ ',';
		}
	);
	if(ids.length<1){
		$.dialog.notice({content:'请选择需要授权的用户!',icon:'warning',time:3});
		return false;
	}
	ids = ids.substring(0,ids.length-1);
	$.ajax({
        url : $.appClient.generateUrl({ESOrgAndUser: 'listRole',data:null},'x'),
	    success:function(data){
		    	$.dialog({
			    	title:'角色列表',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
		    	    padding:0,
					opacity : 0.1,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    ok:function()
			    	{
				    	that = this;
				    	var selectedRoleId='';
						$('#listRoleGrid input:checked').each(
								function(i) {
									selectedRoleId += $('#listRoleGrid input:checked:eq(' + i+ ')').val()+ ',';
								}
						);
						if(selectedRoleId==''){//当在角色列表页面没有选择任何角色时，直接结束该方法
							return;
						}
						$.ajax({
							url:$.appClient.generateUrl({ESOrgAndUser: 'batchSaveUserRole'},'x'),
							type:'post',
							data:{
								ids:ids,
								roleIds:selectedRoleId
							},
							success:function(){
								that.close();
								$.dialog.notice({content:'授权成功！',icon:'succeed',time:3});
							}
						});
			       }
			    });
		    },
		    cache:false
	});
}

//为机构分配用户
function assignUser(){
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	if(orgTreeObj!=null){
		var nodes = orgTreeObj.getSelectedNodes();
		if(nodes.length<=0 || nodes[0].name=="机构设置"){
			$.dialog.notice({content:'请选择机构！',icon:'warning',time:3});
		}else{
			$.ajax({
				url:$.appClient.generateUrl({ESOrgAndUser: 'users'},'x'),
				success:function(data){
					$.dialog({
						title:'选择用户',
						content:data,
						width:620,
						height:300,
						padding:0,
						cancel:true,
						ok:function(){
							var userIds = "";
							$("#noOrgUserGrid input:checked").each(function(){
								userIds += $(this).val() + ",";
							});
							if(userIds.length > 0){
								userIds = userIds.substring(0,userIds.length-1);
								$.ajax({
									url:$.appClient.generateUrl({ESOrgAndUser: 'addUsersForOrg'},'x'),
									type:'post',
									data:{userIds:userIds,orgId:nodes[0].id,orgIdSeq:nodes[0].idseq},
									success:function(){
										$("#userGrid").flexReload();
									}
								});
							}else{
								$.dialog.notice({content:'请选择用户！',icon:'warning',time:3});
								return false;
							}
						}
					});
				}
			});
		}
	} 
}
//添加用户
function addUser(){
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	if(orgTreeObj!=null){
		var nodes = orgTreeObj.getSelectedNodes();
		if(nodes.length<=0 || nodes[0].name=="机构设置"){
			$.dialog.notice({content:'请选择机构！',icon:'warning',time:3});
		}else{
			$.ajax({
		        url : $.appClient.generateUrl({ESOrgAndUser: 'add_user'},'x'),
		        type : 'post',
		        data : {orgcode:nodes[0].id,orgseq:nodes[0].idseq+nodes[0].id},
			    success:function(data){
				    	var dialog=$.dialog({
					    	title:'添加用户',
				    	   	fixed:false,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	okVal:'保存',
						    ok:true,
						    cancelVal: '关闭',
						    padding:0,
						    cancel: true,
						    content:data,
						    //gengqianfeng 20140913 用户添加验证初始加载
						    init : function() {
		    					$('#addUser').autovalidate();
		    				},
						    ok:function()
					    	{ 
						    	//gengqianfeng 20140913 用户添加验证确定加载
						    	var form=$('#addUser');
					    		if (!form.validate()) {
					    			return false;
					    		}
					    		//gengqianfeng 20140920  用户添加确认密码验证加载
					    		var password= $("#addUser input[name='password']").val();
					    		var passwordconfirm= $("#addUser input[name='passwordconfirm']").val();
					    		if(passwordconfirm==''||passwordconfirm==null){
					    			$("#addUser input[name='passwordconfirm']").addClass("warnning");
					    			$("#addUser input[name='passwordconfirm']").attr("title","此项不能为空");
					    			return false;
					    		}
					    	 	if(password!=passwordconfirm){
					    	 		$("#addUser input[name='passwordconfirm']").addClass("warnning");
					    	 		$("#addUser input[name='passwordconfirm']").attr("title","密码输入不一致");
					    	 		return false;
					    	 	}
						    	var userid = $("#addUser input[name='userid']").val();
						    	var firstname = $("#addUser input[name='firstname']").val();
						    	var lastname = $("#addUser input[name='lastname']").val();
						    	var emailaddress = $("#addUser input[name='emailaddress']").val();
						    	var mobtel = $("#addUser input[name='mobtel']").val();
						    	var userstatus = $("#addUser select[name='userstatus']").val(); 
						    	var passwordconfirm = $("#addUser input[name='passwordconfirm']").val();
						    	var password = $("#addUser input[name='password']").val();
						    	var url = $.appClient.generateUrl({ESOrgAndUser : 'addUser'}, 'x');
						    	$("#addUser input[name='roleIds']").val(selectedIds);
						    	var userInfo = $("#addUser").serialize();
//						    	if(userid==''||firstname==''||lastname==''||mobtel==""||userstatus==""||passwordconfirm==""||password==""){
//						    		if(userid=='')
//						    			$("#addUser input[name='userid']").addClass("warnning");
//						    		if(firstname=='')
//						    			$("#addUser input[name='firstname']").addClass("warnning");
//						    		if(lastname=='')
//						    			$("#addUser input[name='lastname']").addClass("warnning");
//						    		if(mobtel=='')
//						    			$("#addUser input[name='mobtel']").addClass("warnning");
//						    		if(userstatus=='')
//						    			$("#addUser select[name='userstatus']").addClass("warnning");
//						    		if(passwordconfirm=='')
//						    			$("#addUser input[name='passwordconfirm']").addClass("warnning");
//						    		if(password=='')
//						    			$("#addUser input[name='password']").addClass("warnning");
//						    		return false;
//						    	}else if(emailaddress!='' && emailaddressZZ.test(emailaddress)==false){
//						    		$("#addUser input[name='emailaddress']").addClass("warnning");
//						    		return false;
//						    	}else if(emailaddressZZ.test(userid)==false){
//						    		$("#addUser input[name='userid']").addClass("warnning");
//						    		return false;
//						    	}else   if(mobtelZZ.test(mobtel)==false){
//						    		$("#addUser input[name='mobtel']").addClass("warnning");
//						    		return false;
//						    	}else if(passwordconfirm!=password){
//						    		$("#addUser input[name='passwordconfirm']").addClass("warnning");
//						    		return false;
//						    	}else{
						    	    //xiewenda 20141013 添加如果保存成功关闭窗口 否则不关闭窗口 selectedIds不清空
						    	    var thisDialog=this;
						    		$.post(url,{data : userInfo}, function(res){
						    			if (res.success == true) {
						    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
						    				$("#userGrid").flexReload();
						    				mark = false;
											selectedIds='';
											thisDialog.close();
						    				return;
						    			} else {
						    				$.dialog.notice({icon : 'error',content : res.msg,title : '3秒后自动关闭',time : 3});
						    				mark = false;
											//selectedIds='';
						    				return;
						    			}
						    		},'json');
//						    	}
						    		
						    return false;
							},cancel:function()
							{
								  mark = false;
								  selectedIds='';
							}
					    });
				    	//设置窗口位置居中
				    	var wy=$(window).height();
				    	var wx=$(window).width();
				    	var x=$("#eslistAddUser").width();
				    	var y=$("#addUser").height()+$("#eslistAddUser").height();
						dialog.position((wx-x)/2,(wy-y)/2);// 调用它即可居中
				    },
				    cache:false
			});
		}
	}
}

function resetPassword(){
	var checkboxlength = $('#userGrid input:checked').length;
	if (checkboxlength == 0) {
		$.dialog.notice({icon : 'warning',content : '请选择要重置密码的用户！',time : 3});
		return;
	}
	var idStr = '';
	var uidStr = '';
	$('#userGrid input:checked').each(function(i) {
		var vl=$('#userGrid input:checked:eq(' + i+ ')');
		idStr += vl.val()+ ',';
		uidStr += vl.attr("uids")+',';
	});
	idStr=idStr.substring(0,idStr.length-1);
	uidStr=uidStr.substring(0,uidStr.length-1);
	
	$.dialog({
		id:'resetPasswordForm',
		title:'请输入您的登录密码',
		content : '<input type="password" id="writePassword">',
		okVal : '确定',
		ok : true,
		cancelVal : '关闭',
		cancel : true,
		ok : function() {
			var writePassword = $('#writePassword').val();
//			var edituserid = $("#editUser input[name='userid']").val();
			if(writePassword==''){
    			$("#writePassword").addClass("warnning");
    			return false;
			}
			var reseturl = $.appClient.generateUrl({ESOrgAndUser : 'resetPassword'}, 'x');
			$.post(reseturl,{writePassword : writePassword,idStr:idStr,uidStr:uidStr}, function(result){
				var isPasswordValid = result.isPasswordValid;//密码是否正确
				var isResetSuccess = result.isResetSuccess;//是否重置成功
				var resetPasswordStr = result.resetPasswordStr;//重置后的密码
				if(isPasswordValid=='true'){
					if(isResetSuccess=='1'){
						$.dialog.notice({icon : 'succeed',content : '密码已成功重置为【'+resetPasswordStr+'】',title : '3秒后自动关闭',time : 3});
						art.dialog.list['resetPasswordForm'].close();
					}else{
						$.dialog.notice({icon : 'error',content : '重置失败！',title : '3秒后自动关闭',time : 3});
						art.dialog.list['resetPasswordForm'].close();
					}
				}else{
					$.dialog.notice({icon : 'warning',content : '您输入的密码不正确！',title : '3秒后自动关闭',time : 3});
					$("#writePassword").addClass("warnning");
				}
				
    		},'json');
			return false;
		}
	});
	return false;
	
}

function resetOrg(){
	var checkboxlength = $('#userGrid input:checked').length;
	if (checkboxlength == 0) {
		$.dialog.notice({icon : 'warning',content : '请选择要编辑的用户！',time : 3});
		return;
	}
	var idStr = '';
	var uidStr = '';
	$('#userGrid input:checked').each(function(i) {
		var vl=$('#userGrid input:checked:eq(' + i+ ')');
		idStr += vl.val()+ ',';
		uidStr += vl.attr("uids")+',';
	});
	idStr=idStr.substring(0,idStr.length-1);
	uidStr=uidStr.substring(0,uidStr.length-1);
	
	$.ajax({
        url : $.appClient.generateUrl({ESOrgAndUser: 'set_Org'},'x'),
        type : 'post',
	    success:function(data){
		    	var dialog=$.dialog({
			    	title:'机构变更',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'保存',
			    	height:400,
			    	width:350,
				    ok:true,
				    cancelVal: '关闭',
				    padding:0,
				    cancel: true,
				    content:data,
				    ok:function()
			    	{ 
				    	var orgTreeObj = $.fn.zTree.getZTreeObj("setOrgListTree");
				    	if(orgTreeObj!=null){
				    		var nodes = orgTreeObj.getSelectedNodes();
				    		if(nodes.length<=0 || nodes[0].name=="机构变更"){
				    			$.dialog.notice({content:'请选择要变更机构！',icon:'warning',time:3});
				    			return false;
				    		}else{
				    			$.ajax({
				    		        url : $.appClient.generateUrl({ESOrgAndUser: 'setOrgForNew'},'x'),
				    		        type : 'post',
				    		        data : {orgcode:nodes[0].id,orgseq:nodes[0].idseq+nodes[0].id,idStr:idStr,uidStr:uidStr},
				    			    success:function(data){
				    			    	if(data){
				    			    		$.dialog.notice({content:'变更成功！',icon:'succed',time:3});
				    			    		reloadOrgTreeNode();
				    			    	}else{
				    			    		$.dialog.notice({content:'变更失败！',icon:'warning',time:3});
				    			    	}
				    			    }
				    			});
				    		}
				    	}
			    	}
		    	});
	    }
	});
}

function reloadOrgTreeNode() {
	var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
	var treeNode = orgTreeObj.getSelectedNodes()[0];
	if (treeNode.name ==null || treeNode.name == "机构设置") {
		$("#userGrid").flexOptions({url : $.appClient.generateUrl({	ESOrgAndUser : 'findUserListByOrgid'}, 'x'),newp:1}).flexReload();
	}else{
		var orgSeq = treeNode.idseq + treeNode.id;
		$("#userGrid").flexOptions({url : $.appClient.generateUrl({	ESOrgAndUser : 'findUserListByOrgid', orgSeq : orgSeq }, 'x'),newp:1}).flexReload();
	}
}

$(".estransferorg").find('input[name="position"]').live('click',function(){
	var xy = $(this).val();
	$.ajax({
        url : $.appClient.generateUrl({ESOrgAndUser: 'setPosition'},'x'),
	    success:function(data){
		    	$.dialog({
			    	title:'坐标设置',
			    	width:650,
					height:450,
		    	    padding:0,
					opacity : 0.1,
					okVal:'确定',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    ok:function()
			    	{	var xyLocation = $("#xyLocation").val();
				    	$(".estransferorg").find("input[name='position']").val(xyLocation);
			       }
			    });
		    	//把初始化坐标显示在地图上
		    	$("#xyLocation").val(xy);
		    	var xyArr = xy.split(',');
		    	if(xyArr.length==2){
		    	var x=Math.round((xyArr[0]-15)/1.55);
		    	var y=Math.round(xyArr[1]/1.6);
		    	$("#lightPoint").css({
		    		top :  y-6+ "px",
		    		left : x-6+ "px"
		    	}).show();
		    	}
		    },
		    cache:false
	});
})

