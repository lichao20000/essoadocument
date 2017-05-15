//左侧树
var setting = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick: onClick
			}
		};

		var zNodes =[
			{ id:0, pId:0, name:"", open:true},
			{ id:1, pId:0, name:"表单类型", open:true},
			{ id:2, pId:1, name:"系统表单", open:true},
			{ id:3, pId:1, name:"档案业务流程表单"},
			{ id:4, pId:1, name:"文件生命周期管理表单"}			
		];

		function onClick(e,treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.expandNode(treeNode);
		}

		$(document).ready(function(){
			$.fn.zTree.init($("#treeDemo"), setting, zNodes);
		});
		//table 设计
		$("#flexme1").flexigrid({
		url: uri,
		dataType: 'json',
		colModel : [
			{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
			{display: '', name : 'c3', width : 100, sortable : true, align: 'center'},
			{display: '启用', name : 'c4', width : 50, sortable : true, align: 'center'},
			{display: '停用', name : 'c5', width : 50, sortable : true, align: 'center'},
			{display: '表单名称', name : 'c6', width : 120, sortable : true, align: 'center'},
			{display: '状态', name : 'c7', width : 60, sortable : true, align: 'center'},
			{display: '是否建表', name : 'c8', width : 120, sortable : true, align: 'center'},
			{display: '关联流程', name : 'c9', width : 120, sortable : true, align: 'center'},
			{display: '创建人', name : 'c10', width : 60, sortable : true, align: 'center'},
			{display: '创建时间', name : 'c11', width : 50, sortable : true, align: 'center'},
			{display: '修改人', name : 'c12', width : 50, sortable : true, align: 'center'},
			{display: '修改时间', name : 'c13', width : 50, sortable : true, align: 'center'},
			{display: '版本', name : 'c14', width : 50, sortable : true, align: 'center'}
			],
		buttons : [
			{name: '添加', bclass: 'add',onpress: add},
			{name: '删除', bclass: 'delete'},
			{name: '发布', bclass: 'delete'},
			{name: '统计', bclass: 'add',onpress: statistics}
			],
		searchitems : [
			{display: 'ISO', name : 'iso'},
			{display: 'Name', name : 'name', isdefault: true}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '借阅目录',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		outof: '页 /共',
		width: 1080,
		height: 500,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});

		//统计table 设计
		$("#statisticstable").flexigrid({
		url: uri,
		dataType: 'json',
		colModel : [
			{display: '工作流名称', name : 'c3', width : 285, sortable : true, align: 'center'},
			{display: '状态', name : 'c4', width : 200, sortable : true, align: 'center'},
			{display: '统计结果', name : 'c5', width : 220, sortable : true, align: 'center'}		
			],
		buttons : [
			{name: '筛选', bclass: 'add',onpress: button}
			],
		searchitems : [
			{display: 'ISO', name : 'iso'},
			{display: 'Name', name : 'name', isdefault: true}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '统计结果',
		useRp: true,
		rp: 10,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		outof: '页 /共',
		width: 750,
		height: 300,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});