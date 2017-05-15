/*caojian 20140512*/
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
				
				var rightWidth = width;
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
	 
			 $("#appConfigSettingGrid").flexigrid({url :$.appClient.generateUrl({ESAppConfig: 'getAppConfigList'}, 'x'),
			dataType : 'json',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			    {display : '<input type="checkbox" hidden="hidden" id="appIdList">',name : 'ids',width : 50,align : 'center'}, 
			    {
				display : '操作',
				name : 'operate',
				width : 50,
				sortable : true,
				align : 'center'
			},{
				name : 'id',
				metadata:'id',
				width : 170,
				align : 'center',
				hide:true
			},{
				 display:'配置名称',
				 name : 'title',
				 metadata:'title',
				 width : 170,
				 align : 'left'
			},{
				 display:'配置键',
				 name : 'appConfigKey',
				 metadata:'appConfigKey',
				 width : 170,
				 align : 'left'
				},{
				display : '配置值',
				name : 'appConfigValue',
				metadata:'appConfigValue',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '配置描述',
				name : 'description',
				metadata:'description',
				width : 350,
				sortable : true,
				align : 'left'
			},{
				display : '配置类型',
				name : 'valueType',
				metadata:'valueType',
				width : 250,
				hide:true,
				sortable : true,
				align : 'left'
			}],
			buttons : [ {
				name : '编辑',
				bclass : 'edit',
			    onpress : edit_app
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
			$("#appIdList").die().live('click',function(){
				$("input[name='appServerlist']").attr('checked',$(this).is(':checked'));
			});
});