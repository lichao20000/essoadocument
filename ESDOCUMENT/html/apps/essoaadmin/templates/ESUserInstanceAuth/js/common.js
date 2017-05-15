$(document).ready(function() {
	$("#userInstanceAuthGrid").flexigrid({
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
			name : 'id',
			metadata : 'id',
			align : 'center',
			hide : true
		}, {
			display : '机构组织名称',
			name : 'bigOrgName',
			metadata : 'bigOrgName',
			width : 150,
			align : 'left'
		}, {
			display : '申请应用',
			name : 'applyAppName',
			metadata : 'applyAppName',
			width : 100,
			align : 'left'
		}, {
			display : '管理员名称',
			name : 'superUserName',
			metadata : 'superUserName',
			width : 119,
			align : 'left'
		}, {
			display : '姓名',
			name : 'fullName',
			width : 100,
			sortable : true,
			align : 'left'
		}, {
			display : '手机',
			name : 'cellPhone',
			metadata : 'cellPhone',
			width : 110,
			sortable : true,
			align : 'left'
		}  ],
		buttons : [],
		singleSelect : true,
		usepager : true,
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width : 'auto',
		height : 'auto',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	
	$("#users").flexigrid({
		url : $.appClient.generateUrl({ESUserInstanceAuth:'getUsers'}, 'x'),
		dataType : 'json',
		colModel : [ {
			display : '',
			name : 'serialNum',
			width : 30,
			align : 'center'
		}, {
			display : '<input id="usersIds" type="checkbox"/>',
			name : 'ids',
			width : 30,
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
		}],
		buttons : [{
					name : '分配用户',
					bclass : 'add',
					onpress : addUsers
				},{
					name : '取消用户',
					bclass : 'delete',
					onpress : deleteUsers
				},{
					name : '同步用户',
					bclass : 'transfer',
					onpress : syncUsers
		}],
		singleSelect : true,
		usepager : true,
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width : 'auto',
		height : 'auto',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	
	//单选
	$("#userInstanceAuthGrid tbody tr").die().live('click',function(){
		var selectTr = $(this);
		var saasId = '' ;
		$(".checkbox").each(function(){
			if($(this).attr('checked')=="checked"){
				if($(this).closest("tr")[0]!=selectTr[0]){
					$(this).attr('checked',false);
				} else {
					saasId = $(this).val() ;
				}
			}
		});
		$("#users").flexOptions({url:$.appClient.generateUrl({ESUserInstanceAuth: 'getUsers',saasId:saasId}, 'x')}).flexReload();
	});
	
	//全选
	$("#usersIds").die().live('click',function(){
		$("input[name='usercbx']").attr('checked',$(this).is(':checked'));
	});
	
	/** 分配用户 **/
	function addUsers(){
		var checkboxs = $('#userInstanceAuthGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先在左边选择一条SAAS机构信息，再进行此操作！',time:3});
			return;
		}
		var saasid = '';
		checkboxs.each(function() {
			saasid = $(this).val() ;
		});
		$.ajax({
			url:$.appClient.generateUrl({ESUserInstanceAuth : 'addUsers'},'x'),
			data:{saasid:saasid},
			success:function(data){
				$.dialog({
			    	title:'选择待分配用户',
			    	modal:true, 
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    width:400,
		    	    lock : true,
					opacity : 0.1,
					padding:0,
			    	okVal:'确定',
				    ok:true,
				    cancelVal: '取消',
				    cancel: true,
				    content:data,
				    ok:function(){
				    	var checkboxs = $('#noAuthUsersGrid input:checked') ;
						var checkboxlength = checkboxs.length;
						if (checkboxlength == 0) {
							$.dialog.notice({icon:'warning',content:'请先选择待分配的用户，再进行此操作！',time:3});
							return false;
						}
						var userids = '';
						checkboxs.each(function() {
							userids += ','+$(this).val() ;
						});
						userids = userids.substring(1, userids.length) ;
				    	$.ajax({
							url:$.appClient.generateUrl({ESUserInstanceAuth : 'saveUsers'},'x'),
							type:'post',
							data:{saasid:saasid, userids:userids},
							success:function(rt){
								if(rt == "true"){
									$("#users").flexReload();
									$.dialog.notice({icon:'succeed',content:"分配用户成功！",time:3});
								}else{
									$.dialog.notice({icon:'error',content:"分配用户失败！",time:3});
								}
							}
						});
					},
					init:function(){
						$("#registerForm").autovalidate();
					}
			    });
			}
		});
	}
	
	/** 取消用户 **/
	function deleteUsers(){
		var checkboxs = $('#userInstanceAuthGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先在左边选择一条SAAS机构信息，再进行此操作！',time:3});
			return;
		}
		var saasid = '';
		var userid = '';
		checkboxs.each(function() {
			saasid = $(this).val() ;
			userid = $(this).attr('userid') ;
		});
		var checkboxs = $('#users input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择待处理的数据，再进行此操作！',time:3});
			return;
		}
		var userIds = '';
		var hasSuperAdmin = false ;
		checkboxs.each(function() {
			if(userid == $(this).attr('userid')){
				hasSuperAdmin = true ;
			} else {
				userIds += ','+$(this).val() ;
			}
		});
		if(hasSuperAdmin){
			$.dialog.notice({icon:'warning',content:'SAAS机构的超级管理员是不能取消关联的！',time:3});
			return;
		}
		userIds = userIds.substring(1, userIds.length) ;
		$.dialog({
			content : '确定要取消用户关联吗？',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				$.ajax({
					url:$.appClient.generateUrl({ESUserInstanceAuth : 'deleteUsers'},'x'),
					type:'post',
					data:{saasid:saasid, userIds:userIds},
					success:function(rt){
						if(rt == "true"){
							$("#users").flexReload();
							$.dialog.notice({icon:'succeed',content:"取消用户成功！",time:3});
						}else{
							$.dialog.notice({icon:'error',content:"取消用户失败！",time:3});
						}
					}
				});
			}
		});
	}
	
	/** 同步用户 **/
	function syncUsers(){
		var checkboxs = $('#userInstanceAuthGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon:'warning',content:'请先在左边选择一条SAAS机构信息，再进行此操作！',time:3});
			return;
		}
		var saasid = '';
		checkboxs.each(function() {
			saasid = $(this).val() ;
		});
		$.ajax({
			url:$.appClient.generateUrl({ESSyncConfig : 'syncToAppSystem'},'x'),
			type:'post',
			data:{saasid:saasid,synctype:"user"},
			dataType:'json',
			success:function(rt){
				if(rt.success){
					$("#users").flexReload();
					$.dialog.notice({icon:'succeed',content:"同步用户成功！",time:3});
				}else{
					$.dialog.notice({icon:'error',content:rt.msg,time:3});
				}
			}
		});
	}
});