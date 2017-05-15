$("#flexme1").flexigrid({
url: uri,
dataType: 'json',
colModel : [
	{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
	{display: '', name : 'c3', width : 100, sortable : true, align: 'center'},
	{display: '序号', name : 'c4', width : 100, sortable : true, align: 'center'},
	{display: '树节点名称', name : 'c5', width : 180, sortable : true, align: 'center'},
	{display: '创建时间', name : 'c6', width : 180, sortable : true, align: 'center'},
	{display: '创建人', name : 'c7', width : 180, sortable : true, align: 'center'}
	
	],
buttons : [
	{name: '添加', bclass: 'add',onpress: addkeywords},
	{name: '删除', bclass: 'delete',onpress: editkeywords}
	],
searchitems : [
	{display: 'ISO', name : 'iso'},
	{display: 'Name', name : 'name', isdefault: true}
	],
sortname: "c3",
sortorder: "asc",
usepager: true,
title: '主题词维护',
useRp: true,
rp: 20,
nomsg:"没有数据",
showTableToggleBtn: true,
pagetext: '第',
outof: '页 /共',
width: 1350,
height: 500,
pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
});

