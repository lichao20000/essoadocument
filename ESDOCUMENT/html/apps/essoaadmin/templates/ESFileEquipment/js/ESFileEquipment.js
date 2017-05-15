/*wangbo 20140318*/
$(document).ready(function(){
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 230;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width ;
				var tblHeight = height - 147;
				
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};
			 $("#fileEquipGrid").flexigrid({url :$.appClient.generateUrl({ESFileEquipment : 'getFileEquipList'}, 'x'),
			dataType : 'json',
			colModel : [ 
               {display : '',name : 'startNum',width : 20,align : 'center'}, 
			    {display : '',name : 'ids',width : 40,align : 'center'}, 
			    {
				display : '操作',
				name : 'operate',
				width : 70,
				sortable : true,
				align : 'center'
			},
			 {
				display : 'ID',
				name : 'id',
				metadata:'id',
				width : 70,
				align : 'center'
			}, 
			 {
				display : 'IP',
				name : 'ip',
				metadata:'ip',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : '端口',
				name : 'port',
				metadata:'port',
				width : 110,
				sortable : true,
				align : 'center'
			}, {
				display : '根路径',
				name : 'rootDir',
				metadata:'rootDir',
				width : 164,
				sortable : true,
				align : 'center'
			}, {
				display : '是否启用',
				name : 'isEnabled',
				metadata:'isEnabled',
				width : 90,
				sortable : true,
				align : 'center',
				process:formatValue
			}, {
				display : '优先级',
				name : 'priority',
				metadata:'priority',
				width : 100,
				sortable : true,
				align : 'center'
			}, {
				display : '备注',
				name : 'description',
				metadata:'description',
				width :210,
				sortable : true,
				align : 'center'
			}],
			buttons : [ {
				name : '添加',
				bclass : 'add',
				onpress : add_fileEquipment
			}, {
				name : '删除',
				bclass : 'delete',
				onpress : delete_fileEquipment
			}, {
				name : '启用',
				bclass : 'start',
				onpress : start_fileEquipment
			}, {
				name : '禁用',
				bclass : 'stop',
				onpress : stop_fileEquipment
			}, {
				name : '设为最优',
				bclass : 'setFirst',
				onpress : setFirst_fileEquipment
			}, {
				name : '网段设置',
				bclass : 'setNetSegment',
				onpress : setNetSegment_fileEquipment
			}],
			singleSelect:true,
			usepager : true,
			title : '文件存储设备管理',
			useRp : true,
			rp : 20,
			nomsg : "没有数据",
			showTableToggleBtn : false,
			pagetext : '第',
			outof : '页 /共',
			width: $size.init().tblWidth,
			height: $size.init().tblHeight,
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
		});
			 
		 
		 function formatValue(tdDiv){
				if(tdDiv.innerHTML=='1')
					tdDiv.innerHTML='启用';
				else 
					tdDiv.innerHTML='禁用';
			};
});