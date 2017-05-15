$(document).ready(function() {
	$("#userGrid").flexigrid({
		url : $.appClient.generateUrl({	ESOrgAndUser : 'findUserListByOrgid'}, 'x'),
		dataType : 'json',
		border:false,
		colModel : [ {
			display : '',
			name : 'startNum',
			width : 30,
			align : 'center'
		}, {
			display : '<input type="checkbox" id="userIdList">',
			name : 'ids',
			width : 30,
			align : 'center'
		}, {
			display : '操作',
			name : 'operate',
			width : 40,
			sortable : true,
			align : 'center'
		}, {
			display : 'ID',
			name : 'id',
			metadata : 'id',
			hide : true,
			align : 'center'
		}, {
			display : '用户名',
			name : 'userid',
			metadata : 'userid',
			width : 100,
			align : 'left'
		}, {
			display : '姓名',
			name : 'Name',
			metadata : 'Name',
			width : 100,
			sortable : true,
			align : 'left',
		}, {
			name : 'lastName',
			metadata : 'lastName',
			width : 50,
			sortable : true,
			align : 'left',
			hide : true
		}, {
			name : 'firstName',
			metadata : 'firstName',
			width : 80,
			sortable : true,
			align : 'left',
			hide : true
		}, {
			display : '状态',
			name : 'userStatus',
			metadata : 'userStatus',
			width : 30,
			sortable : true,
			align : 'left'
		}, {
			display : '手机',
			name : 'mobTel',
			metadata : 'mobTel',
			width : 100,
			sortable : true,
			align : 'left'
		}, {
			display : '邮件',
			name : 'emailAddress',
			metadata : 'emailAddress',
			width : 150,
			sortable : true,
			align : 'left'
		}, {
			display : '机构',
			name : 'orgname',
			metadata : 'orgname',
			width : 200,
			sortable : true,
			align : 'left'
		} ],
		buttons : [{
			name : '添加',
			bclass : 'addUser',
			onpress : addUser
		},{
			//guolanrui 20140725 增加删除用户按钮
			name : '删除',
			bclass : 'deleteUser',
			onpress : delete_user
		}, {
			//xiewenda 20141013 修改分配和批量设置角色的bclass属性
			name : '分配',
			bclass : 'refresh',
			onpress : assignUser
		}, {
			name : '批量设置角色',
			bclass : 'batchmodify',
			onpress : addBatchRole
		}, {
			name : '密码重置',
			bclass : 'resetPassword',
			onpress : resetPassword
		}, {
			name : '机构变更',
			bclass : 'resetOrg',
			onpress : resetOrg
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
	// 全选
	$("#userIdList").die().live('click', function() {
		$("input[name='userId']").attr('checked', $(this).is(':checked'));
	});

});