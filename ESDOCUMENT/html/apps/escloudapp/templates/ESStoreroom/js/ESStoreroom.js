var selectid = "";//复选框的值

var _autoSize = function (){
	var width = document.documentElement.clientWidth*0.96;
	var height = document.documentElement.clientHeight-110;	// 可见总高度 - 176为平台头部高度
	var leftWidth = 220;
	if(navigator.userAgent.indexOf("MSIE 6.0")>0){
		
		width = width-6;
		
	}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
		width = width-4;
		height = height-4;
	}
	
	var rightWidth = width ;
	var tblHeight = height - 147;
	
	_size = {
		left: [leftWidth, height],
		right: [rightWidth, height],
		table: [rightWidth, tblHeight]
	};
};
$(document).ready(function(){
			_autoSize();
			$("#flexme1").flexigrid({url :$.appClient.generateUrl({ESStoreroom : 'set_json'}, 'x'),
			dataType : 'json',
			colModel : [ 
			    {display : '<input type="checkbox" id="storeroomidlist">',name : 'id',width : 40,align : 'center'}, 
			    {
				display : '操作',
				name : 'caozuo',
				width : 40,
				sortable : true,
				align : 'center'
			},{
				display : '库房编号',
				name : 'code',
				width : 110,
				sortable : true,
				metadata : 'code',
				align : 'center'
			},{
				display : '责任人',
				name : 'manager',
				width : 100,
				sortable : true,
				align : 'center'
			}, {
				display : '位置',
				name : 'position',
				width : 100,
				sortable : true,
				align : 'center'
			}, {
				display : '面积(平方米)',
				name : 'area',
				width : 100,
				sortable : true,
				align : 'center'
			}, {
				display : '排架数量',
				name : 'framenumber',
				width : 100,
				sortable : true,
				metadata : 'framenumber',
				align : 'center'
			},{
				display : '列',
				name : 'col',
				width : 120,
				sortable : true,
				metadata : 'col',
				align : 'center'
			},{
				display : '层',
				name : 'layer',
				width : 120,
				sortable : true,
				metadata : 'layer',
				align : 'center'
			},{
				display : '消防设备',
				name : 'fireequipment',
				width :110,
				sortable : true,
				align : 'center'
			}, {
				display : '监控设备',
				name : 'monitorequipment',
				width : 110,
				sortable : true,
				align : 'center'
			}, {
				display : '空调',
				name : 'aircondition',
				width : 110,
				sortable : true,
				align : 'center'
			}, {
				display : '加湿/祛湿设备',
				name : 'equipment',
				width : 110,
				sortable : true,
				align : 'center'
			}, {
				display : '库房描述',
				name : 'description',
				width : 120,
				sortable : true,
				align : 'center'
			}, {
				display : '格子宽度(CM)',
				name : 'gridwidth',
				width : 100,
				sortable : true,
				metadata : 'gridwidth',
				align : 'center'
			}, {
				// longjunhao 20141011 add
				display : 'hasStructure',
				name : 'hasStructure',
				width : 80,
				hide : true,
				metadata : 'hasStructure',
				align : 'center'
			}],
			buttons : [ {
				name : '添加',
				bclass : 'add',
				onpress : add_warehouse
			}, {
				name : '删除',
				bclass : 'delete',
				onpress : deletestoreroom
			}, {
				name : '库房结构',
				bclass : 'do_store',
				onpress : structure
			}, {
				name : '库房报表',
				bclass : 'code',
				onpress : warehouseReport
			}, {
				name : '库房监控',
				bclass : 'group',
				onpress : monitoring
			} ],
			sortname : "id",
			sortorder : "asc",
			usepager : true,
			title : '库房管理',
			useRp : true,
			rp : 20,
			nomsg : "没有数据",
			showTableToggleBtn : true,
			pagetext : '第',
			outof : '页 /共',
			width: _size.table[0],
			height: _size.table[1],
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
		
		});
		$('.tDiv .tDiv2').after(createSelect);
			//$('.tDiv .tDiv2').after($('#extras').html());
		$('#esstdright div[class="tDiv2"]').append('<div class="find-dialog"><input id="storeRoomQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="storeRoomQuery()"></span></div>');

//		sizeChanged($("#esstdright"),$("#flexme1"));
		//全选
		$("#storeroomidlist").die().live('click',function(){
			$("input[name='storeroomid']").attr('checked',$(this).is(':checked'));
		});

		
		
});
//库房管理检索 longjunhao 20140809 add
function storeRoomQuery(){
	var keyword = $.trim($('#storeRoomQuery').val());
	if(keyword == '' || keyword=='请输入关键字') {
		keyword = '';
	}
	$("#flexme1").flexOptions({query:keyword}).flexReload();
	return false;
}
// longjunhao 20140915 add 模糊检索添加回车快捷键
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'storeRoomQuery') {
		storeRoomQuery();
		return false;
	}
});