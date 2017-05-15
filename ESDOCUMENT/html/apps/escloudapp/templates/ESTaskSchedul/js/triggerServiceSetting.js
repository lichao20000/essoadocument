//根据客户端不同屏幕分辩率做到自适应,并将宽高存在window根对象中

$(function() {
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
	
	$('#estabs_2').live('click',function(){
		$("#triggerServiceGrid").flexReload();
	});
	$("#triggerServiceGrid").flexigrid({
		url : $.appClient.generateUrl({ESTaskSchedul : 'triggerService_json' }, 'x'),
		dataType : 'json',
		colModel : [ {
			display : '<input type="checkbox" name="ids3" />',
			name : 'id3',
			width : 40,
			align : 'center'
		}, {
			display : 'id',
			name : 'id',
			metadata : 'id',
			width : 200,
			hide : true,
			sortable : true,
			align : 'center'
		},{
			display : '操作',
			name : 'modify',
			metadata : 'modify',
			width : 30,
			sortable : true,
			align : 'left'
		}, {
			display : '服务名称',
			name : 'restname',
			metadata : 'restname',
			width : 200,
			sortable : true,
			align : 'center'
		}, {
			display : '服务类名',
			name : 'classname',
			metadata : 'classname',
			width : 200,
			sortable : true,
			align : 'center'
		}, {
			display : '执行方法',
			name : 'excutemethodname',
			metadata : 'excutemethodname',
			width : 300,
			sortable : true,
			align : 'center'
		}, {
			display : '服务描述',
			name : 'description',
			metadata : 'description',
			width : 180,
			sortable : true,
			align : 'center'
		} ],
		buttons : [ {
			name : '添加服务',
			bclass : 'add',
			onpress : addtriggerServiceSetting
		}, {
			name : '删除服务',
			bclass : 'delete',
			onpress : deltriggerServiceSetting
		} ],
		sortname : "c3",
		sortorder : "asc",
		usepager : true,
		title : '元数据',
		useRp : true,
		rp : 20,
		procmsg : "正在加载，请稍等",
		nomsg : "没有数据",
		resizable : false,
		singleSelect : true,
		minColToggle : 0,
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});

	$("input[name='ids3']").die().live('click', function() {
		$("input[name='id3']").attr('checked', $(this).is(':checked'));
	});

	function addtriggerServiceSetting() {

		var url = $.appClient.generateUrl({
			ESTaskSchedul : 'add_triggerservice'
		}, 'x');
		$.ajax({
			url : url,
			success : function(data) {
				$.dialog({
					id : 'addtriggerServiceWin',
					title : '添加任务服务',
					width : '350px',
					height : '220px',
					fixed : false,
					padding : '0px',
					resize : false,
					okVal : '保存',
					ok : true,
					cancelVal : '取消',
					cancel : true,
					content : data,
					ok : function() {
						var form = $('#triggerServiceForm');
						if (!form.validate()) {
							return false;
						}
						var datas = form.serialize();
						var url_post = $.appClient.generateUrl({
							ESTaskSchedul : 'addTriggerServiceData'
						}, 'x');
						/** 开始向后台发送数据,之后对返回的数据进行解析 * */
						$.post(url_post, {
							data : datas,
							dataType : 'json'
						}, function(res) {
							$.dialog.notice({
								icon : 'succeed',
								content : '添加成功',
								title : '3秒后自动关闭',
								time : 3
							});
							$("#triggerServiceGrid").flexReload();
							return;
						});

					},
					init : function() {
						$('#triggerServiceForm').autovalidate();
					}
				});
			},
			cache : false
		});
	}

	function deltriggerServiceSetting() {

		var checkboxObj = $("input[name='id3']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog.notice({
				icon : 'warning',
				content : '请选择要删除的服务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog.notice({
				icon : 'warning',
				content : '请只勾选一个服务进行删除！',
				time : 3
			});
			return false;
		}

		$.dialog({
			id : 'deldata',
			content : '确定要删除吗?',
			ok : true,
			okVal : '确定',
			cancel : true,
			cancelVal : '取消',
			ok : function() {
				var triggerName = '';
				var triggerGroupName = '';
				var tr = $(checkboxObj).closest("tr");
				var columns = [ 'id' ];
				var idValue = $("#triggerServiceGrid").flexGetColumnValue(tr,
						columns);
				var url = $.appClient.generateUrl({
					ESTaskSchedul : 'delTriggerServiceData',
					id : idValue
				}, 'x');
				$.post(url, function(data) {
					$.dialog.notice({
						icon : 'succeed',
						content : '删除成功',
						title : '3秒后自动关闭',
						time : 3
					});
					$("#triggerServiceGrid").flexReload();
					return;
				});
			}
		});
	}

	function sizeChangedForService() {
		if ($.browser.msie && $.browser.version === '6.0') {
			$("html").css({
				overflow : "hidden"
			});
		}
		var h = $(window).height() - $("#ESTaskSchedul").position().top;
		var flex = $("#triggerServiceGrid").closest("div.flexigrid");
		var bDiv = flex.find('.bDiv');
		var contentHeight = bDiv.height();
		var headflootHeight = flex.height() - contentHeight;

		bDiv.height(h - headflootHeight);
		flex.height(h);

		// 修改IE表格宽度兼容
		if ($.browser.msie && $.browser.version === '6.0') {
			flex.css({
				width : "-=3px"
			});
		}
	}
	;

//	sizeChangedForService();

	
	/** longjunhao 20140804 任务服务编辑按钮 **/
	$("#triggerServiceGrid .editbtn").die().live("click", function(){
		editTriggerServiceSetting($(this).closest("tr"));
	}); 
	
	function editTriggerServiceSetting(tr) {
		var columns = ['id',"restname",'classname','excutemethodname','description'];
		var colValues = $("#triggerServiceGrid").flexGetColumnValue(tr,columns);
		var colValuesArray = colValues.split("|");
		var id = colValuesArray[0] ;
		var restname = colValuesArray[1] ;
		var classname = colValuesArray[2] ;
		var excutemethodname = colValuesArray[3] ;
		var description = colValuesArray[4] ;
		if(id != null && id != ''){
			$.ajax({
				url : $.appClient.generateUrl({ESTaskSchedul : 'edit_triggerservice' }, 'x'),
				data : {id:id,restname:restname,classname:classname,excutemethodname:excutemethodname,description:description},
				type:'post',
				success : function(data) {
					$.dialog({
						id : 'edittriggerServiceWin',
						title : '编辑任务服务',
						width : '350px',
						height : '220px',
						fixed : false,
						padding : '0px',
						resize : false,
						okVal : '保存',
						ok : true,
						cancelVal : '取消',
						cancel : true,
						content : data,
						ok : function() {
							var form = $('#triggerServiceForm');
							if (!form.validate()) { return false; }
							var datas = form.serialize();
							/** 开始向后台发送数据,之后对返回的数据进行解析 * */
							$.post($.appClient.generateUrl({ESTaskSchedul : 'editTriggerServiceData'}, 'x'), 
								{data : datas}, function(res) {
								$.dialog.notice({ icon : 'succeed', content : '保存成功', title : '3秒后自动关闭',time : 3 });
								$("#triggerServiceGrid").flexReload();
								return;
							});
						},
						init : function() {
							$('#triggerServiceForm').autovalidate();
						}
					});
				},
				cache : false
			});
		}
	}
});