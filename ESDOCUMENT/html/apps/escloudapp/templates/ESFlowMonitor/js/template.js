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
			{ id:2, pId:1, name:"档案业务流程"},
			{ id:3, pId:1, name:"档案借阅", open:true},
			{ id:4, pId:2, name:"综合部"},
			{ id:5, pId:2, name:"人力资源部"},
			{ id:6, pId:3, name:"综合部"},
			{ id:7, pId:3, name:"人力资源部"}
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
			{display: '查看流程图', name : 'c3', width : 100, sortable : true, align: 'center'},
			{display: '中止', name : 'c4', width : 50, sortable : true, align: 'center'},
			{display: '结束', name : 'c5', width : 50, sortable : true, align: 'center'},
			{display: '工作流模板名称', name : 'c6', width : 230, sortable : true, align: 'center'},
			{display: '关联表单名称', name : 'c7', width : 230, sortable : true, align: 'center'},
			{display: '启动人', name : 'c8', width : 120, sortable : true, align: 'center'},
			{display: '启动时间', name : 'c9', width : 120, sortable : true, align: 'center'}
			],
		buttons : [
			{name: '未结束', bclass: 'add',onpress: button},
			{name: '以结束', bclass: 'delete'},
			{name: '全部流程', bclass: 'delete'}			
			],
		searchitems : [
			{display: 'ISO', name : 'iso'},
			{display: 'Name', name : 'name', isdefault: true}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '数据浏览',
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

		function button(name,grid,addd)
		{
		alert(name+'======'+grid);
			
			}	
