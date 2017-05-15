$(function() {
	var uri2 = $.appClient.generateUrl({
		ESTaskSchedul : 'task_json'
	}, 'x');
	$("#flexme2").flexigrid({
		url : uri2,
		dataType : 'json',
		colModel : [ {
			display : '<input type="checkbox" name="id2" />',
			name : 'id2',
			width : 40,
			align : 'center'
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
		} ],
		buttons : [ {
			name : '添加任务',
			bclass : 'add',
			onpress : addSimpleTrigger
		}, {
			name : '暂停任务',
			bclass : 'delete',
			onpress : pauseJob
		}, {
			name : '重新启动',
			bclass : 'delete',
			onpress : resumeJob
		}, {
			name : '删除任务',
			bclass : 'delete',
			onpress : deleteJobTrigger
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
		width : 'auto',
		height : 'auto',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});

	$("input[name='ids']").die().live('click', function() {
		$("input[name='id1']").attr('checked', $(this).is(':checked'));
	});
	$("input[name='ids2']").die().live('click', function() {
		$("input[name='id2']").attr('checked', $(this).is(':checked'));
	});
	$("input[name='ids3']").die().live('click', function() {
		$("input[name='id3']").attr('checked', $(this).is(':checked'));
	});

	$("#flexme1").find("tr").live(
			"click",
			function() {
				var val = $(this).eq(0).find('input').val();
				var html = '<input type="hidden" name="namespaceid" value="'
						+ val + '" />';
				$("#extra").html(html);
				var url = $.appClient.generateUrl({
					ESMetadata : 'task_json',
					id : val
				});
				$("#flexme2").flexOptions({
					newp : 1,
					url : url
				}).flexReload();

			});

	/**
	 * 添加任务
	 */
	function addSimpleTrigger() {
		var url = $.appClient.generateUrl({
			ESTaskSchedul : 'addJob'
		}, 'x');
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
						var datas = form.serialize();
						var url_post = $.appClient.generateUrl({
							ESTaskSchedul : 'saveJob'
						}, 'x');
						/** 开始向后台发送数据,之后对返回的数据进行解析 * */
						$.post(url_post, {
							data : datas,
							dataType : 'json'
						}, function(res) {
							if (res == 'true') {
								$.dialog.notice({
									icon : 'succeed',
									content : '添加成功',
									title : '3秒后自动关闭',
									time : 3
								});
								return;
							} else {
								$.dialog.notice({
									icon : 'error',
									content : '添加失败',
									title : '3秒后自动关闭',
									time : 3
								});
								return;
							}
						});

					},
					init : function() {

					}
				});
			},
			cache : false
		});
	}

	/**
	 * 编辑任务
	 */
	function editJobTrigger() {
		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog({
				content : '请选择要编辑的任务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog({
				content : '请只勾选一个任务进行编辑！',
				time : 3
			});
			return false;
		}
		var tr = $(checkboxObj).closest("tr");
		var columns = ['jobName','recordTime','description','state','triggerName','triggerGroupName'];
		var colValues = $("#flexme2").flexGetColumnValue(tr,columns);
		$.ajax({
		    url : $.appClient.generateUrl({ESTaskSchedul : 'edit_Job',data:colValues},'x'),
		    success:function(data){
		    alert(data);
		    editdia=$.dialog({
			    	title:'编辑任务调度',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'保存',
				    ok:true,
				    ok:function()
			    	{
						var form = $('#editjobForm');
						var datas = form.serialize();
						var url_post = $.appClient.generateUrl({
							ESTaskSchedul : 'saveJob',
							flag : 'edit'
						}, 'x');
						/** 开始向后台发送数据,之后对返回的数据进行解析 * */
						$.post(url_post, {
							data : datas,
							dataType : 'json'
						}, function(res) {
							if (res == 'true') {
								$.dialog.notice({
									icon : 'succeed',
									content : '添加成功',
									title : '3秒后自动关闭',
									time : 3
								});
								return;
							} else {
								$.dialog.notice({
									icon : 'error',
									content : '添加失败',
									title : '3秒后自动关闭',
									time : 3
								});
								return;
							}
						});

					}
			    });
		    	
			    },
			    cache:false
		});
	}

	/**
	 * 暂停任务
	 */
	function pauseJob() {
		
		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog({
				content : '请选择要暂停的任务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog({
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
				var columns = [ 'jobName', 'triggerGroupName' ];
				var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
				var colArray = new Array();
				colArray = colValues.split("|");
				var url = $.appClient.generateUrl({
					ESTaskSchedul : 'pauseJob',
					jobName : colArray[0],
					triggerGroupName : colArray[1]
				}, 'x');
				$.post(url, function(data) {
					
					
				});
			}
		});
	}

	/**
	 * 重启任务
	 */
	function resumeJob() {
		var url = $.appClient.generateUrl({
			ESTaskSchedul : 'pauseJob'
		}, 'x');

		var checkboxObj = $("input[name='id2']:checked");
		if (checkboxObj.length == '0' || checkboxObj.length === 'undefined') {

			$.dialog({
				content : '请选择要启动的任务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog({
				content : '请只勾选一个任务进行启动！',
				time : 3
			});
			return false;
		}

		$.dialog({
			id : 'deldata',
			content : '确定要启动吗?',
			ok : true,
			okVal : '确定',
			cancel : true,
			cancelVal : '取消',
			ok : function() {
				var triggerName = '';
				var triggerGroupName = '';
				var tr = $(checkboxObj).closest("tr");
				var columns = [ 'jobName', 'triggerGroupName' ];
				var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
				var colArray = new Array();
				colArray = colValues.split("|");
				var url = $.appClient.generateUrl({
					ESTaskSchedul : 'deleteJobTrigger',
					jobName : colArray[0],
					triggerGroupName : colArray[1]
				}, 'x');
				$.post(url, function(data) {
					alert("删除成功！");
				});
			}
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

			$.dialog({
				content : '请选择要删除的任务',
				time : 3
			});
			return false;
		}
		if (checkboxObj.length > 1) {
			$.dialog({
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
				var columns = [ 'triggerName', 'triggerGroupName' ];
				var colValues = $("#flexme2").flexGetColumnValue(tr, columns);
				var colArray = new Array();
				colArray = colValues.split("|");
				var url = $.appClient.generateUrl({
					ESTaskSchedul : 'deleteJobTrigger',
					triggerName : colArray[0],
					triggerGroupName : colArray[1]
				}, 'x');
				$.post(url, function(data) {
					alert("删除成功！");
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
		var h = $(window).height() - $("#metadata").position().top;
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
	;
	sizeChanged();
	$('div[class="tDiv2"]')
			.append(
					'<div class="find-dialog"><input id="keyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="keyWordQuery()"></span></div>');

});