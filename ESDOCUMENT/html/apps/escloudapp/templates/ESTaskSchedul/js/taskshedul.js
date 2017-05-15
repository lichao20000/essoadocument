
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
	
	$("#flexme2").flexigrid({
		url :  $.appClient.generateUrl({ESTaskSchedul : 'task_json'}, 'x'),
		dataType : 'json',
		colModel : [ {
			display : '<input type="checkbox" name="ids2" />',
			name : 'id2',
			metadata : 'id2',
			width : 40,
			align : 'center'
		},{
			display : 'taskId',
			name : 'taskId',
			metadata : 'taskId',
			width : 40,
			hide : true,
			align : 'center'
		},{
			display : '操作',
			name : 'modify',
			metadata : 'modify',
			width : 30,
			sortable : true,
			align : 'left'
		}, {
			display : '任务名称',
			name : 'jobName',
			metadata : 'jobName',
			width : 200,
			sortable : true,
			align : 'center'
		}, {
			display : '调度时间',
			name : 'recordTime',
			metadata : 'recordTime',
			width : 200,
			sortable : true,
			align : 'center'
		}, {
			display : '任务描述',
			name : 'description',
			metadata : 'description',
			width : 300,
			sortable : true,
			align : 'center'
		}, {
			display : '任务状态',
			name : 'state',
			metadata : 'state',
			width : 180,
			sortable : true,
			align : 'center'
		}, {
			display : 'triggerName',
			name : 'triggerName',
			metadata : 'triggerName',
			width : 180,
			sortable : true,
			align : 'center',
			hide : true
		}, {
			display : 'triggerGroupName',
			name : 'triggerGroupName',
			metadata : 'triggerGroupName',
			width : 180,
			sortable : true,
			align : 'center',
			hide : true
		}, {
			display : 'jobGroupName',
			name : 'jobGroupName',
			metadata : 'jobGroupName',
			width : 180,
			sortable : true,
			align : 'center',
			hide : true
		}, {
			display : 'jobClassName',
			name : 'jobClassName',
			metadata : 'jobClassName',
			width : 180,
			sortable : true,
			align : 'center',
			hide : true
		}, {
			display : 'jobClassValue',
			name : 'jobClassValue',
			metadata : 'jobClassValue',
			width : 180,
			sortable : true,
			align : 'center',
			hide : true
		} ],
		buttons : [ {
			name : '添加任务',
			bclass : 'add',
			onpress : addSimpleTrigger
		}, {
			name : '删除任务',
			bclass : 'delete',
			onpress : deleteJobTrigger
		},{
			name : '暂停任务',
			bclass : 'pause',
			onpress : pauseJob
		},{
			name : '重新启动',
			bclass : 'restart',
			onpress : resumeJob
		} ],
		sortname : "c3",
		sortorder : "asc",
		usepager : true,
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

	$("input[name='ids2']").die().live('click', function() {
		$("input[name='id2']").attr('checked', $(this).is(':checked'));
	});

	/**
	 * 添加任务
	 */
	function addSimpleTrigger() {
		var url = $.appClient.generateUrl({ESTaskSchedul : 'addJob'}, 'x');

		var urlConfig = $.appClient.generateUrl({ESTaskSchedul : 'reconfigSelections'}, 'x');
		$.post(urlConfig, function(res) {
			var results = jQuery.parseJSON(res);
			if (results.rows == "") {
				$.dialog.notice({
					icon : 'warning',
					content : '请现在右侧任务服务设置中添加一个任务！',
					title : '3秒后自动关闭',
					time : 3
				});
			} else {
				/** 如果有已经添加了业务调度，那么直接走该方法添加业务 * */
				alertAddDialog(url);
			}
		});

	}

	function alertAddDialog(url) {
		$.ajax({
			url : url,
			success : function(data) {
				$.dialog({
					id : 'addTriggerPanel',
					title : '添加任务调度',
					width : '500px',
					height : '480px',
					fixed : false,
					padding : '0px',
					resize : false,
					okVal : '保存',
					ok : true,
					cancelVal : '取消',
					cancel : true,
					content : data,
					ok : function() {
						var form = $('#jobForm');
						if(!form.validate()){return false;}
						var datas = form.serialize();
						
						/** 添加起止年份验证 **/
						var startYearVal =  $("input[name=start]").val();
						var endYearVal =  $("input[name=end]").val();
						
						var jobName =  $("input[name=jobName]").val();
						
						if( jobName==null || jobName == '' ){
							$.dialog.notice({icon:'warning',content:'请填写任务调度的名称!',title:'1秒后自动关闭',time:2});
							return false;
						}
						
						if(startYearVal >= endYearVal){
							$.dialog.notice({icon:'warning',content:'开始年份必须小于结束年份!',title:'1秒后自动关闭',time:2});
							return false;
						}
						
						/** 开始向后台发送数据,之后对返回的数据进行解析 * */
						$.post($.appClient.generateUrl({ESTaskSchedul : 'saveJob'}, 'x'), {
							data : datas,dataType : 'json' }, function(res) {
							var json = eval("("+res+")");
							if (json.isError == 'true') {
								$.dialog.notice({icon : 'warning',content : json.message,title : '3秒后自动关闭',time : 3});
								return false;
							}
							$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
							$("#flexme2").flexReload();
							art.dialog.list['addTriggerPanel'].close();
							return;
						});
						return false;

					},
					init : function() {
						var form = $('#jobForm');
						form.autovalidate();
					}
				});
			},
			cache : false
		});
	}

	/**
	 * 编辑任务
	 */
	function editTrigger(tr) {
		var columns = [ 'taskId', 'jobName', 'recordTime', 'description', 'state', 'triggerName', 'triggerGroupName', 'jobGroupName', 'jobClassValue' ];
		var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
		var colArray = new Array();
		colArray = colValues.split("|");
		if (colArray[4]=='启动') {
			$.dialog.notice({icon : 'warning',content : '启动状态的任务不能执行编辑操作！', title : '3秒后自动关闭',time : 3 });
			return false;
		}
		$.ajax({
			url : $.appClient.generateUrl({ESTaskSchedul : 'edit_job'}, 'x'),
			type : 'post',
			data : {data : colValues},
			success : function(data) {
				$.dialog({
					id : 'editdia',
					title : '编辑任务调度',
					fixed : false,
					resize : false,
					lock : true,
					opacity : 0.1,
					content : data,
					cancelVal : '关闭',
					cancel : true,
					okVal : '保存并启动',
					ok : true,
					ok : function() {
						var form = $('#editjobForm');
						if(!form.validate()){return false;}
						var datas = form.serialize();
						var url_post = $.appClient.generateUrl({ESTaskSchedul : 'saveJob',flag : 'edit' }, 'x');
						/** 开始向后台发送数据,之后对返回的数据进行解析 * */
						$.post(url_post, {data : datas,dataType : 'json'}, function(res) {
							var json = eval("("+res+")");
							if (json.isError == 'true') {
								$.dialog.notice({icon : 'warning',content : json.message,title : '3秒后自动关闭',time : 3});
								return false;
							}
							$.dialog.notice({icon : 'succeed',content : '保存成功',title : '3秒后自动关闭',time : 3});
							$("#flexme2").flexReload();
							art.dialog.list['editdia'].close();
							return;
						});
						return false;
					},
					init: function(){
						var form = $('#editjobForm');
						form.autovalidate();
					}
				});

			},
			cache : false
		});
	}

	/**
	 * 暂停任务
	 */
	function pauseJob() {

		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog.notice({
				icon : 'warning',
				content : '请选择要暂停的任务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog.notice({
				icon : 'warning',
				content : '请只勾选一个任务进行暂停！',
				time : 3
			});
			return false;
		}

		$.dialog({
			id : 'deldata',
			content : '确定要暂停该任务吗?',
			ok : true,
			okVal : '确定',
			cancel : true,
			cancelVal : '取消',
			ok : function() {
				var triggerName = '';
				var triggerGroupName = '';
				var tr = $(checkboxObj).closest("tr");
				var columns = [ 'jobName','state', 'jobGroupName' ];
				var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
				var colArray = new Array();
				colArray = colValues.split("|");
				if (colArray[1] == '暂停') {
					$.dialog.notice({ icon : 'warning', content : '任务已经处于暂停状态!', title : '提示', time : 2 });
					return false;
				}
				$.post($.appClient.generateUrl({ESTaskSchedul : 'pauseJob'}, 'x'),
						{jobName : colArray[0],jobGroupName : colArray[2]},function(data) {
					$.dialog.notice({
						icon : 'succeed',
						content : '暂停成功',
						title : '3秒后自动关闭',
						time : 3
					});
					$("#flexme2").flexReload();
					return;
				});
			}
		});
	}

	/**
	 * 重启任务
	 */
	function resumeJob() {
		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {
			$.dialog.notice({icon : 'warning',content : '请选择要启动的任务',time : 3});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog.notice({icon : 'warning',content : '请只勾选一个任务进行启动！', time : 3 });
			return false;
		}
		var triggerName = '';
		var triggerGroupName = '';
		var tr = $(checkboxObj).closest("tr");
		var columns = [ 'jobName','state','jobGroupName' ];
		var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
		var colArray = new Array();
		colArray = colValues.split("|");
		if (colArray[1] == '启动') {
			$.dialog.notice({ icon : 'warning', content : '任务已经处于启动状态!', title : '提示', time : 2 });
			return false;
		}
		$.post($.appClient.generateUrl({ESTaskSchedul : 'resumeJob'}, 'x'),
				{jobName : colArray[0],jobGroupName : colArray[2]}, function(data) {
			$.dialog.notice({
				icon : 'succeed',
				content : '启动成功',
				title : '3秒后自动关闭',
				time : 3
			});
			$("#flexme2").flexReload();
			return;
		});
	}

	/**
	 * 删除任务
	 */
	function deleteJobTrigger() {
		var url = $.appClient.generateUrl({
			ESTaskSchedul : 'pauseJob'
		}, 'x');

		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog.notice({
				icon : 'warning',
				content : '请选择要删除的任务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog.notice({
				icon : 'warning',
				content : '请只勾选一个任务进行删除！',
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
				var columns = ['jobName', 'triggerName', 'triggerGroupName' ];
				var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
				var colArray = new Array();
				colArray = colValues.split("|");
				var url = $.appClient.generateUrl({
					ESTaskSchedul : 'deleteJobTrigger',
					jobName : colArray[0],
					triggerName : colArray[1],
					triggerGroupName : colArray[2]
				}, 'x');
				$.post(url, function(data) {
					$.dialog.notice({
						icon : 'succeed',
						content : '删除成功',
						title : '3秒后自动关闭',
						time : 3
					});
					$("#flexme2").flexReload();
					return;
				});
			}
		});
	}

	/**
	 * 判断用户是否勾选数据的Service
	 */
	function check_selected(mes) {
		// 判断用户是否选中数据
		var id = '';
		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog({
				icon : 'warning',
				content : '请选择' + mes + '的数据',
				time : 3
			});
			return false;
		} else {
			// 遍历选中的数据
			checkboxObj.each(function(i) {
				id += $(this).val() + ',';
			});
		}
		return id;

	}
	function sizeChanged() {
		if ($.browser.msie && $.browser.version === '6.0') {
			$("html").css({
				overflow : "hidden"
			});
		}
		var h = $(window).height() - $("#ESTaskSchedul").position().top;
		var flex = $("#flexme2").closest("div.flexigrid");
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
//	sizeChanged();

	/** longjunhao 20140804 任务编辑按钮 **/
	$("#flexme2 .editbtn").die().live("click", function(){
		editTrigger($(this).closest("tr"));
	}); 
});
