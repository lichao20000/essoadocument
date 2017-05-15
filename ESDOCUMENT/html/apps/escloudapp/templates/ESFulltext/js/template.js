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
			{ id:1, pId:0, name:"档案管理", open:true},
			{ id:2, pId:1, name:"中国联通有限公司", open:true},
			{ id:3, pId:1, name:"中国联合通信有限公司"},
			{ id:4, pId:1, name:"中国网络通信有限公司"}
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
				{display: '节点名称', name : 'c3', width : 350, sortable : true, align: 'center'},
				{display: '索引库路径', name : 'c4', width : 300, sortable : true, align: 'center'},
				{display: '节点路径', name : 'c5', width : 365, sortable : true, align: 'center'}
				],
			buttons : [
				{name: '删除', bclass: 'add',onpress: button},
				{name: '清空', bclass: 'delete'},
				{name: '优化索引', bclass: 'add',onpress: button},
				{name: '重建索引', bclass: 'delete'}
				],
			searchitems : [
				{display: 'ISO', name : 'iso'},
				{display: 'Name', name : 'name', isdefault: true}
				],
			sortname: "c3",
			sortorder: "asc",
			usepager: true,
			title: '已创建索引库节点',
			useRp: true,
			rp: 10,
			nomsg:"没有数据",
			showTableToggleBtn: true,
			pagetext: '第',
			outof: '页 /共',
			width: 1105,
			height: 260,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});

			function button(name,grid,addd)
			{
			  alert(name+'======'+grid);
				
			}	

			$("#flexme2").flexigrid({
				url: uri,
				dataType: 'json',
				colModel : [
				   {display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
				   {display: '节点名称', name : 'c3', width : 350, sortable : true, align: 'center'},
				   {display: '索引库路径', name : 'c4', width : 300, sortable : true, align: 'center'},
				   {display: '节点路径', name : 'c5', width : 365, sortable : true, align: 'center'}
					],
				buttons : [
					{name: '创建', bclass: 'add',onpress: button},
					{name: '创建全部', bclass: 'add'}
					],
				searchitems : [
					{display: 'ISO', name : 'iso'},
					{display: 'Name', name : 'name', isdefault: true}
					],
				sortname: "c3",
				sortorder: "asc",
				usepager: true,
				title: '未创建索引库节点',
				useRp: true,
				rp: 10,
				nomsg:"没有数据",
				showTableToggleBtn: true,
				pagetext: '第',
				outof: '页 /共',
				width: 1105,
				height: 260,
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
				});
