$("#flexme1").flexigrid({
url: uri,
dataType: 'json',
colModel : [
	{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
	{display: '', name : 'c3', width : 100, sortable : true, align: 'center'},
	{display: 'ID', name : 'c4', width : 100, sortable : true, align: 'center'},
	{display: '角色名称', name : 'c5', width : 265, sortable : true, align: 'center'},
	{display: '角色描述', name : 'c6', width : 700, sortable : true, align: 'center'}
	],
buttons : [
	{name: '筛选', bclass: 'add'}
	],
searchitems : [
	{display: 'ISO', name : 'iso'},
	{display: 'Name', name : 'name', isdefault: true}
	],
sortname: "c3",
sortorder: "asc",
usepager: true,
title: '角色浏览',
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
	/*
	 * @author zhangyanxin
	 * 未授权表单
	 * */
    $("#unauthorized").flexigrid({
	//url: uri,
	//dataType: 'json',
	colModel : [
		{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
		{display: 'ID', name : 'c3', width : 80, sortable : true, align: 'center'},
		{display: '表单名称', name : 'c4', width : 400, sortable : true, align: 'center'}		
		],
	buttons : [
		{name: '筛选', bclass: 'add'},
		{name: '授权', bclass: 'add'}
		],
	searchitems : [
		{display: 'ISO', name : 'iso'},
		{display: 'Name', name : 'name', isdefault: true}
		],
	sortname: "c3",
	sortorder: "asc",
	usepager: true,
	title: '未授权表单',
	useRp: true,
	rp: 3,
	nomsg:"没有数据",
	showTableToggleBtn: true,
	pagetext: '第',
	outof: '页 /共',
	width: 600,
	height: 80,
	pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	});
    /*
     * @author zhangyanxin
     * 已授权表单
     * */
    $("#authorization").flexigrid({
	//url: uri,
	//dataType: 'json',
	colModel : [
		{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
		{display: 'ID', name : 'c3', width : 80, sortable : true, align: 'center'},
		{display: '表单名称', name : 'c4', width : 400, sortable : true, align: 'center'}		
		],
	buttons : [
		{name: '筛选', bclass: 'add'},
		{name: '授权', bclass: 'add'}
		],
	searchitems : [
		{display: 'ISO', name : 'iso'},
		{display: 'Name', name : 'name', isdefault: true}
		],
	sortname: "c3",
	sortorder: "asc",
	usepager: true,
	title: '未授权表单',
	useRp: true,
	rp: 3,
	nomsg:"没有数据",
	showTableToggleBtn: true,
	pagetext: '第',
	outof: '页 /共',
	width: 600,
	height: 80,
	pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	});