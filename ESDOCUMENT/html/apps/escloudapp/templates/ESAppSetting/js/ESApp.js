/*wangbo 20140325*/
$(document).ready(function(){
	 
			 $("#appSettingGrid").flexigrid({url :$.appClient.generateUrl({ESAppSetting: 'getAppList'}, 'x'),
			dataType : 'json',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			    {display : '<input type="checkbox" id="appIdList">',name : 'ids',width : 50,align : 'center'}, 
			    {
				display : '操作',
				name : 'operate',
				width : 70,
				sortable : true,
				align : 'center'
			},{
				name : 'id',
				metadata:'id',
				width : 170,
				align : 'center',
				hide:true
			},{
				 display:'应用名称',
				 name : 'appName',
				 metadata:'appName',
				 width : 170,
				 align : 'left'
			},{
				 display:'应用中文名称',
				 name : 'appNameCn',
				 metadata:'appNameCn',
				 width : 170,
				 align : 'left'
				},{
				display : '应用口令',
				name : 'appToken',
				metadata:'appToken',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '备注',
				name : 'remark',
				metadata:'remark',
				width : 150,
				sortable : true,
				align : 'left'
			}],
			buttons : [ {
				name : '添加',
				bclass : 'add',
			onpress : add_app
			}, {
				name : '删除',
				bclass : 'delete',
				onpress : delete_app
			}],
			singleSelect:true,
			usepager : true,
			title : '应用设置',
			useRp : true,
			rp : 20,
			nomsg : "没有数据",
			showTableToggleBtn : false,
			pagetext : '第',
			outof : '页 /共',
			width : 'auto',
			height : 'auto',
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
		});
			 
		 
		 function formatValue(tdDiv){
				if(tdDiv.innerHTML=='1')
					tdDiv.innerHTML='启用';
				else 
					tdDiv.innerHTML='禁用';
			};
			//全选
			$("#appIdList").die().live('click',function(){
				$("input[name='appServerlist']").attr('checked',$(this).is(':checked'));
			});
});