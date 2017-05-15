		//author  wangbo  20140403
      var emailaddressZZ = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;//验证邮箱的正则
      var mobtelZZ =  /^1[3|4|5|8][0-9]\d{8}$/;//验证手机号的正则
      var orgsortZZ =  /^[0-9]*$/;//验证机构的优先级
		//给编辑用户按钮绑定事件
		$(".editbtn").die().live("click", function(){
			edit_user($(this).closest("tr"));
		});
		var selectedIds="";
		var mark = false;
		//删除用户
		function delete_user(){
			var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
			if(orgTreeObj!=null){
				var nodes = orgTreeObj.getSelectedNodes();
				if(nodes.length<=0){
					return;
				}else if(nodes[0].name=="机构设置"){
					return;
				}
			} 
			var checkboxlength = $('#userGrid input:checked').length;
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
					$('#userGrid input:checked').each(
						function(i) {
							idStr += $('#userGrid input:checked:eq(' + i+ ')').val()+ ',';
						});
					    idStr=idStr.substring(0,idStr.length-1);
						var url = $.appClient.generateUrl({ESOrgAndUser : 'deleteUserList'}, 'x');
						$.post(url, {ids : idStr}, function(res) {
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
		//添加用户
		function add_user(){
			var appId = 0;
			var appTreeObj = $.fn.zTree.getZTreeObj("appTree");
			if(appTreeObj!=null){
				var nodes = appTreeObj.getSelectedNodes();
				appId = nodes[0].id;
			} 
			var orgId = 0;
			var orgSeq = '';
			var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
			if(orgTreeObj!=null){
				var nodes = orgTreeObj.getSelectedNodes();
				if(nodes.length<=0){
					return;
				}else if(nodes[0].name=="机构设置"){
					return;
				}
				orgId = nodes[0].id;
				orgSeq = nodes[0].idseq;
			} 
			var data = appId+','+orgId+','+orgSeq+orgId;
			$.ajax({
			        url : $.appClient.generateUrl({ESOrgAndUser: 'add_user',data:data},'x'),
				    success:function(data){
					    	$.dialog({
						    	title:'添加用户',
					    	   	fixed:false,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
						    	okVal:'保存',
							    ok:true,
							    cancelVal: '关闭',
							    cancel: true,
							    content:data,
							    ok:function()
						    	{ 
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
							    	if(userid==''||firstname==''||lastname==''||emailaddress==''||mobtel==""||userstatus==""||passwordconfirm==""||password==""){
							    		if(userid=='')
							    			$("#addUser input[name='userid']").addClass("warnning");
							    		if(firstname=='')
							    			$("#addUser input[name='firstname']").addClass("warnning");
							    		if(lastname=='')
							    			$("#addUser input[name='lastname']").addClass("warnning");
							    		if(emailaddress=='')
							    			$("#addUser input[name='emailaddress']").addClass("warnning");
							    		if(mobtel=='')
							    			$("#addUser input[name='mobtel']").addClass("warnning");
							    		if(userstatus=='')
							    			$("#addUser select[name='userstatus']").addClass("warnning");
							    		if(passwordconfirm=='')
							    			$("#addUser input[name='passwordconfirm']").addClass("warnning");
							    		if(password=='')
							    			$("#addUser input[name='password']").addClass("warnning");
							    		return false;
							    	}else if(emailaddressZZ.test(emailaddress)==false){
							    		$("#addUser input[name='emailaddress']").addClass("warnning");
							    		return false;
							    	}else   if(mobtelZZ.test(mobtel)==false){
							    		$("#addUser input[name='mobtel']").addClass("warnning");
							    		return false;
							    	}else 	if(passwordconfirm!=password){
							    		$("#addUser input[name='passwordconfirm']").addClass("warnning");
							    		return false;
							    	}	else{
							    		$.post(url,{data : userInfo}, function(res){
							    			if (res == 'true') {
							    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
							    				$("#userGrid").flexReload();
							    				mark = false;
												selectedIds='';
							    				return;
							    			} else {
							    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
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
					    },
					    cache:false
				});
		}
		
		//修改用户
		function edit_user(tr){
			var columns = ['id','userid','lastName','firstName','userStatus','mobTel','emailAddress'];
			var colValues = $("#userGrid").flexGetColumnValue(tr,columns);
				$.ajax({
				    url : $.appClient.generateUrl({ESOrgAndUser : 'edit_user',data:colValues},'x'),
				    success:function(data){
					      $.dialog({
						    	title:'编辑用户',
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
							    	var userid = $("#editUser input[name='userid']").val();
							    	var firstname = $("#editUser input[name='firstname']").val();
							    	var lastname = $("#editUser input[name='lastname']").val();
							    	var emailaddress = $("#editUser input[name='emailaddress']").val();
							    	var mobtel = $("#editUser input[name='mobtel']").val();
							    	var userstatus = $("#editUser select[name='userstatus']").val(); 
							     	var url = $.appClient.generateUrl({ESOrgAndUser : 'updateUser'}, 'x');
							    	$("#editUser input[name='roleIds']").val(selectedIds);
							    	var userInfo = $("#editUser").serialize();
							    	if(userid==''||firstname==''||lastname==''||emailaddress==''||mobtel==""||userstatus==""){
							    		if(userid=='')
							    			$("#editUser input[name='userid']").addClass("warnning");
							    		if(firstname=='')
							    			$("#editUser input[name='firstname']").addClass("warnning");
							    		if(lastname=='')
							    			$("#editUser input[name='lastname']").addClass("warnning");
							    		if(emailaddress=='')
							    			$("#editUser input[name='emailaddress']").addClass("warnning");
							    		if(mobtel=='')
							    			$("#editUser input[name='mobtel']").addClass("warnning");
							    		if(userstatus=='')
							    			$("#editUser select[name='userstatus']").addClass("warnning");
							    		return false;
							    	}else if(emailaddressZZ.test(emailaddress)==false){
							    		$("#editUser input[name='emailaddress']").addClass("warnning");
							    		return false;
							    	}else   if(mobtelZZ.test(mobtel)==false){
							    		$("#editUser input[name='mobtel']").addClass("warnning");
							    		return false;
							    	}else{
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
							    	}
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
					return false;
				}else if(nodes[0].name=="机构设置"){
					return;
				}
				orgId = nodes[0].id;
				orgSeq = nodes[0].idseq;
			} 
			var data = orgSeq+orgId;
			var url=$.appClient.generateUrl({ESOrgAndUser:'findUserListByOrgid',keyWord:keyword,orgSeq:data},'x');
			$("#userGrid").flexOptions({url:url}).flexReload();
			return false;
		}
		function getUserRoleQuery(){
			var keyword=$.trim($('input[name="userRoleKeyWord"]').val());
			if(keyword=='' || keyword=='请输入关键字') {
				keyword = '';
			}
			alert(keyword+"uuu");
		//	$("#editUserRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds,keyWord:keyword}, 'x')}).flexReload();
			return;
		}
		function getEditUserRoleQuery(){
			var keyword=$.trim($('input[name="editUserRoleKeyWord"]').val());
			if(keyword=='' || keyword=='请输入关键字') {
				keyword = '';
			}
			alert(keyword);
			//$("#editUserRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds,keyWord:keyword}, 'x')}).flexReload();
			return;
		}
		$(document).keydown(function(event){
			if(event.keyCode == 13 && document.activeElement.id == 'userKeyWord') {
				getUserQuery();
			}else if(event.keyCode == 13 && document.activeElement.id == 'userRoleKeyWord'){
				getUserRoleQuery();
			}else if(event.keyCode == 13 && document.activeElement.id == 'editUserRoleKeyWord'){
				getEditUserRoleQuery();
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
							    ok:function()
						    	{ 
							    	var idseq = $("#addOrg input[name='idseq']").val();
							    	var orgname = $("#addOrg input[name='orgname']").val();
							    	var address = $("#addOrg input[name='address']").val();
							    	var orgsort = $("#addOrg input[name='orgsort']").val();
							    	
							    	if(orgname==''||address==''||orgsort==''){
							    		if(orgname=='')
							    			$("#addOrg input[name='orgname']").addClass("warnning");
							    		if(address=='')
							    			$("#addOrg input[name='address']").addClass("warnning");
							    		if(orgsort=='')
							    			$("#addOrg input[name='orgsort']").addClass("warnning");
							    		return false;
							    	}else if(orgsortZZ.test(orgsort)==false){
							    		$("#addOrg input[name='orgsort']").addClass("warnning");
							    		return false;
							    	}else{
							    		var url = $.appClient.generateUrl({ESOrgAndUser : 'addOrg'}, 'x');
							    		var orgInfo = $("#addOrg").serialize();
							    		$.post(url,{data : orgInfo}, function(res){//记住这里要返回插入后生成的id
							    			var jsonDX = eval('(' + res + ')');
							    			if (jsonDX.res == 'true') {
							    				var newNode = {name:orgname,id:jsonDX.id,idseq:idseq,address:address,orgsort:orgsort};
							    				orgTreeObj.addNodes(selectedParentNode,newNode);
							    				return;
							    			} else {
							    				return;
							    			}
							    		});
							    	}
								}
						    });
					    },
					    cache:false
				});
			hideRMenu();
		}
		//删除机构
		function delOrg(){
			var orgTreeObj = $.fn.zTree.getZTreeObj("orgListTree");
			if(orgTreeObj!=null){
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
								return;
							} else {
								return;
							}
						});
						hideRMenu();
					}
				});	
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
				data=selectedParentNode.id+',';
				data+=selectedParentNode.name+',';
				data+=selectedParentNode.address+',';
				data+=selectedParentNode.orgsort;
			} 
			$.ajax({
		        url : $.appClient.generateUrl({ESOrgAndUser: 'edit_org',data:data},'x'),
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
						    ok:function()
					    	{ 
						    	var orgname = $("#editOrg input[name='orgname']").val();
						    	var address = $("#editOrg input[name='address']").val();
						    	var orgsort = $("#editOrg input[name='orgsort']").val();
						    	if(orgname==''||address==''||orgsort==''){
						    		if(orgname=='')
						    			$("#editOrg input[name='orgname']").addClass("warnning");
						    		if(address=='')
						    			$("#editOrg input[name='address']").addClass("warnning");
						    		if(orgsort=='')
						    			$("#editOrg input[name='orgsort']").addClass("warnning");
						    		return false;
						    	}else if(orgsortZZ.test(orgsort)==false){
						    		$("#editOrg input[name='orgsort']").addClass("warnning");
						    		return false;
						    	}else{
						    		var url = $.appClient.generateUrl({ESOrgAndUser : 'editOrg'}, 'x');
						    		var orgInfo = $("#editOrg").serialize();
						    		$.post(url,{data : orgInfo}, function(res){ 
						    			if (res == 'true') {
						    				selectedParentNode.name=orgname;
						    				selectedParentNode.address=address;
						    				selectedParentNode.orgsort=orgsort;
						    				orgTreeObj.updateNode(selectedParentNode);
						    				return;
						    			} else {
						    				return;
						    			}
						    		});
						     }
							}
					    });
				    },
				    cache:false
			});
			hideRMenu();
		}
		
		//给用户添加角色
		function addRoleToUser(){
			var appId = 0;
			var appTreeObj = $.fn.zTree.getZTreeObj("appTree");
			if(appTreeObj!=null){
				var nodes = appTreeObj.getSelectedNodes();
				appId = nodes[0].id;
			} 
			var idStr='';
			if(mark==false){
				  idStr='null';
			}else{
				idStr = selectedIds;
			}
			var data = appId+"|"+idStr;
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
			var appId = 0;
			var appTreeObj = $.fn.zTree.getZTreeObj("appTree");
			if(appTreeObj!=null){
				var nodes = appTreeObj.getSelectedNodes();
				appId = nodes[0].id;
			} 
			var idStr='';
			if(mark==false){
				  idStr='null';
			}else{
				idStr = selectedIds;
			}
			var data = appId+"|"+idStr;
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
								$("#editUserRoleGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserRole',selectedRoleId:selectedIds}, 'x')}).flexReload();
					       }
					    });
				    },
				    cache:false
			});
		}
		
		//编辑用户时删除已分配给用户的角色
		function delRoleFromUserOnEdit(){
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
		
		function formatRole(tdDiv){
					if(tdDiv.innerHTML=='1')
						tdDiv.innerHTML='系统角色';
					else 
						tdDiv.innerHTML='普通角色';
		}
