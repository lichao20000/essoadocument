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
			{ id:4, pId:1, name:"文件生命周期管理表单"},
			
		];

		function onClick(e,treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("liebiao");
			zTree.expandNode(treeNode);
		}

		$(document).ready(function(){
			$.fn.zTree.init($("#liebiao"), setting, zNodes);
		});
$("#flexme1").flexigrid({
url: uri,
dataType: 'json',
colModel : [
	{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
	{display: '', name : 'c3', width : 100, sortable : true, align: 'center'},
	{display: '全宗号', name : 'c4', width : 100, sortable : true, align: 'center'},
	{display: '全宗名称', name : 'c5', width : 180, sortable : true, align: 'center'},
	{display: '是否启用', name : 'c6', width : 180, sortable : true, align: 'center'},
	{display: '档案管理员', name : 'c7', width : 180, sortable : true, align: 'center'},
	
	],
buttons : [
	{name: '添加', bclass: 'add',onpress: addfonds},
	{name: '删除', bclass: 'delete'}
	],
searchitems : [
	{display: 'ISO', name : 'iso'},
	{display: 'Name', name : 'name', isdefault: true}
	],
sortname: "c3",
sortorder: "asc",
usepager: true,
title: '案卷目录',
useRp: true,
rp: 20,
nomsg:"没有数据",
showTableToggleBtn: true,
pagetext: '第',
outof: '页 /共',
width: 1270,
height: 500,
pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
});	
