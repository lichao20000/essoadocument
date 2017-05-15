/**
 * 分支角色和参见单位选择弹出框
 */
$(function() {
	//单位部门树结构
	var setting = {
			view: {
				dblClickExpand: false,
				showLine: false,
				selectedMulti: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			edit:{
				enable:true
			},
			callback: {
				onClick: ClickNode
			}
	};

	//参见单位树单击事件
	function ClickNode(e,treeId, treeNode) {
		var esDisplayFields=$('.esDisplayField',$('#esPartForm'));
		var esValueFields=$('.esValueField',$('#esPartForm'));
		if(esDisplayFields.length>0){
			var index=$("#catagoryIndex").val();
			$(esDisplayFields.eq(index)).val(treeNode.name);
			$(esValueFields.eq(index)).val(treeNode.id);
			return false;
		}
	}

	//加载树结构
	$.getJSON($.appClient.generateUrl({ESParticipatory:'getTree'}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#fication"), setting, zNodes);
	});
	
	//所有角色
	var colModelRoles = [
			{display : '',name : 'num',width : 20,align : 'center'},
			{display : '',name : 'ids', width : 20,align : 'center'}, 
		    {display : 'ID',name : 'ID',hide : true,width : 50,align: 'center'}, 
		    {display : '角色标识',name : 'roleId', metadata:'roleId',width : 100,align : 'center'},
		    {display : '角色名称',name : 'roleName', metadata:'roleName',width : 100,align : 'left'},
		    {display : '创建时间',name : 'createTime',hide : true,width : 150,align : 'left'},
		    {display : '修改时间',name : 'updateTime',hide : true,width : 150,align : 'left'},
		    {display : '是否为系统角色',name : 'isSystem',hide : true,width : 80,align : 'left'},
		    {display : '描述',name : 'roleRemark',hide : true,width : 250,align : 'left'}
		];
	
	//查询所有角色
	$("#esConditionRole").flexigrid({
		url : $.appClient.generateUrl({ESTransferFlow : 'findRoleList'}, 'x'),
		dataType : 'json',
		query:{searchKeyword:''},
		border:true,
		colModel : colModelRoles,
		buttons : [{
			name : '选择',
			bclass : 'btnToRight',
			onpress : function(){}
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
		height : 135,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	
	//角色数据单击事件
	$('#esConditionRole').find("tr").die().live("click", function(){
		$("#esConditionRole input[type='checkbox']").attr('checked',false);
		$(this).find("input[type='checkbox']").attr('checked',true);
		var roleName = $('#esConditionRole').flexGetColumnValue($(this),['roleName']);
		var roleId = $('#esConditionRole').flexGetColumnValue($(this),['roleId']);
		var esDisplayFields=$('.esDisplayField',$('#esPartForm'));
		var esValueFields=$('.esValueField',$('#esPartForm'));
		if(esDisplayFields.length>0){
			var index=$("#catagoryIndex").val();
			$(esDisplayFields.eq(index)).val(roleName);
			$(esValueFields.eq(index)).val(roleId);
			$('#catagoryRole').hide();
		}
	});
});