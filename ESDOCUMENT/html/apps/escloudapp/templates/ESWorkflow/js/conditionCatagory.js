//机构树结构
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
//			async : {
//				enable : true,
//				type : "get",
//				autoParam : [ 'id' ],
//				url : $.appClient.generateUrl({ESOrgAndUser : 'expandOrgListTree'}, 'x')
//			},
		callback: {
			onClick: ClickNode
		}
};

function ClickNode(e,treeId, treeNode) {
	var esDisplayFields=$('.esDisplayField',$('#esOrganForm'));
	var esValueFields=$('.esValueField',$('#esOrganForm'));
	if(esDisplayFields.length>0){
		$(esDisplayFields.eq(index)).val(treeNode.name);
		$(esValueFields.eq(index)).val(treeNode.id);
		return false;
	}
}

//所有角色
var colModelRoles = [
		{display : '',name : 'startNum',width : 20,align : 'center'},
	    {display : 'ID',name : 'id',metadata : 'id',hide : true}, 
		{display : '角色名称',name : 'name',metadata : 'name',width : 380,sortable : true,align : 'left'},
		{display : 'RoleId',name : 'roleId',metadata : 'roleId',hide : true,align : 'left'}
	];

function hideCata() {
	$("#catagory,#catagoryRole").fadeOut("fast");
}

function clickBodyDown(event) {
	if (!(event.target.id == "catagory" || event.target.id == "fication" || $(event.target).parents("#catagory").length>0) && 
		!(event.target.id == "catagoryRole" || event.target.id == "esConditionRole" || $(event.target).parents("#catagoryRole").length>0)) {
		hideCata();
	}
}

var conditionMgr = {
	getRoleQuery: function() {
		var roleKeyword = $('#catagoryRole #roleKeyWordCond').val();
		if (roleKeyword == '请输入关键字') {
			roleKeyword = '';
		}
		$("#esConditionRole").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getAllRolesNew'}, 'x'),query:{searchKeyword:roleKeyword}, newp:1}).flexReload();
	}
}

$(function() {
	$.getJSON($.appClient.generateUrl({ESOrgAndUser:'getAllOrgList'}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#fication"), setting, zNodes);
	});
	
	//查询所有角色
	$("#esConditionRole").flexigrid({
		url : $.appClient.generateUrl({ESWorkflow : 'getAllRolesNew'}, 'x'),
//		url : false,
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
	
	$('#esConditionRole').find("tr").die().live("click", function(){
		var roleName = $('#esConditionRole').flexGetColumnValue($(this),['name']);
		var roleId = $('#esConditionRole').flexGetColumnValue($(this),['roleId']);
		var esDisplayFields=$('.esDisplayField',$('#esOrganForm'));
		var esValueFields=$('.esValueField',$('#esOrganForm'));
		if(esDisplayFields.length>0){
			$(esDisplayFields.eq(index)).val(roleName);
			$(esValueFields.eq(index)).val(roleId);
			$('#catagoryRole').hide();
		}
	});	
});
	
	

	
