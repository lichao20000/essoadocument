/*wangbo 20140325*/
$(document).ready(function(){
	 
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 220;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width - leftWidth ;
				var tblHeight = height - 137;
				
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
	 $("#consoleServerGrid").flexigrid({url :$.appClient.generateUrl({ESConsoleServer : 'getConsoleServerList'}, 'x'),
			dataType : 'json',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			    {display : '<input type="checkbox" id="consoleServerIdList">',name : 'ids',width : 40,align : 'center'}, 
			    {
				display : '操作',
				name : 'operate',
				width : 40,
				sortable : true,
				align : 'center'
			},{
				name : 'id',
				metadata:'id',
				hide:true
			}, 
			{
				name : 'appId',
				metadata:'appId',
				hide:true
			},
			  
			 {
				display : 'ID',
				name : 'serviceid',
				metadata:'serviceid',
				width : 150,
				align : 'left'
			}, 
			 {
				display : '服务名称',
				name : 'serviceName',
				metadata:'serviceName',
				width : 170,
				sortable : true,
				align : 'left'
			},{
				display : '接口全类名',
				name : 'interface',
				metadata:'interface',
				width : 240,
				sortable : true,
				align : 'left'
			}, {
				display : '访问路径',
				name : 'url',
				metadata:'url',
				width : 320,
				sortable : true,
				align : 'left'
			}, {
				display : '是否启用',
				name : 'isEnabled',
				metadata:'isEnabled',
				width : 100,
				sortable : true,
				align : 'center',
				process:formatValue
			}, {
				display : '口令',
				name : 'token',
				metadata:'token',
				width : 150,
				sortable : true,
				align : 'left'
			}, {
				display : '禁用原因',
				name : 'reason',
				metadata:'reason',
				width : 150,
				hide:true,
				align : 'left'
			}],
			buttons : [ {
				name : '添加',
				bclass : 'add',
				onpress : add_consoleServer
			}, {
				name : '删除',
				bclass : 'delete',
				onpress : delete_consoleServer
			}, {
				name : '启用',
				bclass : 'start',
				onpress : start_consoleServer
			}, {
				name : '禁用',
				bclass : 'stop',
				onpress : stop_consoleServer
			}],
			singleSelect:true,
			usepager : true,
			title : '控制台服务管理',
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
			//全选
			$("#consoleServerIdList").die().live('click',function(){
				$("input[name='consoleServerId']").attr('checked',$(this).is(':checked'));
			});
});