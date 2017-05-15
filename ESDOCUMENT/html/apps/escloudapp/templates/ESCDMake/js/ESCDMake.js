  $("#flexme1").flexigrid({
  url: uri,
  dataType: 'json',
  colModel : [
		{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
		{display: '题名', name : 'c3', width : 400, sortable : true, align: 'center'},
		{display: '文号', name : 'c4', width : 80, sortable : true, align: 'center'},
		{display: '分类号', name : 'c5', width : 80, sortable : true, align: 'center'},
		{display: '主题词', name : 'c6', width : 80, sortable : true, align: 'center'},
		{display: '机构', name : 'c7', width : 100, sortable : true, align: 'center'},
		{display: '责任人', name : 'c8', width : 60, sortable : true, align: 'center'}
		],
  buttons : [
		{name: '开始制作', bclass: 'add',onpress:button},
		{name: '设置', bclass: 'modify'}
		],
	searchitems : [
		{display: 'ISO', name : 'iso'},
		{display: 'Name', name : 'name', isdefault: true}
		],
	sortname: "c3",
	sortorder: "asc",
	usepager: true,
	title: '导出设置',
	useRp: true,
	rp: 20,
	nomsg:"没有数据",
	showTableToggleBtn: true,
	pagetext: '第',
	outof: '页 /共',
	width: 980,
	height: 500,
	pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
});
	function button(name,grid,addd)
	{
		alert(name+'======'+grid);
		
	}		