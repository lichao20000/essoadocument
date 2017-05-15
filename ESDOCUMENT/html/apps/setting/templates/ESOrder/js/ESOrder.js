$(document).ready(
		function() {

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
			$("#appListGrid").flexigrid({
				url : $.appClient.generateUrl({
					ESOrder : 'getGrantApplist'
				}, 'x'),
				dataType : 'json',
				colModel : [ {
					display : '',
					name : 'startNum',
					width : 30,
					align : 'center'
				}, {
					display : '<input type="checkbox" id="appidlist">',
					name : 'ids',
					width : 50,
					align : 'center'
				}, {
					name : 'id',
					metadata : 'id',
					width : 170,
					align : 'center',
					hide : true
				}, {
					name : 'applyappid',
					metadata : 'applyappid',
					width : 170,
					align : 'center',
					hide : true
				}, {
					name : 'saasid',
					metadata : 'saasid',
					width : 170,
					align : 'center',
					hide : true
				}, {
					display : '应用名称',
					name : 'appname',
					metadata : 'appname',
					width : 170,
					align : 'left'
				}, {
					display : '应用中文名称',
					name : 'appnamecn',
					metadata : 'appnamecn',
					width : 170,
					align : 'left'
				}, {
					display : 'SAAS子系统',
					name : 'bigorgname',
					metadata : 'bigorgname',
					width : 150,
					align : 'left'
				}, {
					display : '访问权限',
					name : 'accessright',
					metadata : 'accessright',
					width : 150,
					align : 'center',
					process : formatValue
				}, {
					display : '是否已申请',
					name : 'inorder',
					metadata : 'inorder',
					width : 150,
					align : 'center'
				} ],
				buttons : [ {
					name : '申请权限',
					bclass : 'add',
					onpress : apply_app
				} ],
				singleSelect : true,
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

			function formatValue(tdDiv) {
				if (tdDiv.innerHTML == '1')
					tdDiv.innerHTML = '有访问权限';
				else
					tdDiv.innerHTML = '无访问权限';
			}
			// 全选
			$("#appidlist").die().live(
					'click',
					function() {
						$("input[name='appServerlist']").attr('checked',
								$(this).is(':checked'));
					});
		});