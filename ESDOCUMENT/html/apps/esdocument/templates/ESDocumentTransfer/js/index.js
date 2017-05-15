/**
 * 文件收集脚本 xuekun 20141028
 */
$(document).ready(function() {
	var button = [ {
		name : '筛选',
		bclass : 'filter',
		onpress : function() {
			filter();
		}
	}, {
		name : '还原数据',
		bclass : 'back',
		onpress : function() {
			back();
		}
	}, {
		name : '文件流转',
		bclass : 'transfer',
		onpress : function() {
			filetransfer();
		}
	} ];
	var colModel = [ {
		display : '数据标识',
		name : 'id',
		hide : true,
		width : 30,
		align : 'center'
	}, {
		display : '序号',
		name : 'num',
		width : 20,
		align : 'center'
	}, {
		display : '',
		name : 'ids',
		width : 20,
		align : 'center'
	}, {
		display : '项目名称',
		name : 'itemName',
		width : 220,
		align : 'left'
	}, {
		display : '收集范围',
		name : 'stageName',
		width : 120,
		align : 'left'
	}, {
		display : '装置名称',
		name : 'deviceName',
		width : 120,
		align : 'left'
	}, {
		display : '部门',
		name : 'participatoryName',
		width : 120,
		align : 'left'
	}, {
		display : '文件标题',
		name : 'title',
		width : 360,
		align : 'left'
	}, {
		display : '文件编码',
		name : 'docNo',
		width : 120,
		align : 'left'
	}, {
		display : '拟定人',
		name : 'person',
		width : 60,
		align : 'left'
	}, {
		display : '拟定日期',
		name : 'date',
		width : 80,
		align : 'center'
	} ];
	$("#esDataList").flexigrid({
		url : false,
		dataType : 'json',
		colModel : colModel,
		buttons : button,
		usepager : true,
		title : '&nbsp;',
		useRp : true,
		width : width,
		height : height,
		showTableToggleBtn : true,
		dblClickResize : true,
		pagetext : '第',
		itemtext : '页',
		outof : '页 /共',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg : '正在加载数据，请稍候...'
	});
	var setting = {
		view : {
			dblClickExpand : true,
			showLine : false
		},
		data : {
			simpleData : {
				enable : true
			}
		},
		async : {
			autoParam : [ 'id', 'column', 'path', 'number' ],
			enable : true
		},
		callback : {
			onClick : onClick
		}
	};
	function onClick(e, treeId, treeNode) {
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		$("#treenodeid").val(treeNode.id);
		$("#treeCode").val(treeNode.code);
		if (treeNode.id != 0) {
			var param = {stageId: treeNode.id,checkType : 'radio'};
    		var url=$.appClient.generateUrl({ESDocumentsCollection: 'getStageDataList'},'x');
    		initGrid(treeNode.id, url,param);
		}
	};
	function initGrid(stageId, url,param) {
		loadGrid(url, colModel,param);
	};
	function loadGrid(url, colModel,param) {
		$("#eslist").empty().append(
				'<table id="esDataList"></table>');
		$("#esDataList").flexigrid({
			url : url,
			dataType : 'json',
			query:param,
			colModel : colModel,
			buttons : button,
			usepager : true,
			title : '&nbsp;',
			useRp : true,
			width : width,
			height : height,
			showTableToggleBtn : true,
			dblClickResize : true,
			pagetext : '第',
			itemtext : '页',
			outof : '页 /共',
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条',
			procmsg : '正在加载数据，请稍候...'
		});
	};
	$.getJSON($.appClient.generateUrl({
		ESDocumentStage : "getTree"
	}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#esStageTree"), setting, zNodes);
	});
	// 删除收集的文件
	function confirmbatchCollection() {

	};
	// 筛选文件
	function filter() {
		$.ajax({
			url : $.appClient.generateUrl({
				ESDocumentTransfer : 'filterValue'
			}, 'x'),
			success : function(data) {
				dia2 = $.dialog({
					title : '筛选数据',
					width : '600px',
					fixed : true,
					resize : false,
					padding : 0,
					content : data,
					cancelVal : '关闭',
					cancel : true,
					okVal : '筛选',
					ok : true,
					ok : function() {						
						/*var deviceCode = $("#deviceNo").val();
                        var where = {};
                        where.deviceCode = deviceCode;*/
                    	//改为筛选字段查询
                        var where = filterValue();
						$("#esDataList").flexOptions({
							newp : 1,
							query : where
						}).flexReload();                    							
					},
					cancel : function() {
					}
				});
			},
			cache : false
		});
	};
	// 全选
	$("#checkIdList").die().live('click',function() {
		$("input[name='checkname']").attr('checked',$(this).is(':checked'));
	});
	// 获取筛选条件
	function filterValue() {
		var where = {};
		var temp = [];
		$("#contents p").each(
				function(i) {
					var esfields = $("select[name='esfields']")
							.eq(i).val();
					var comparison = $(
							"select[name='comparison']").eq(i)
							.val();
					var esfieldvalue = $(
							"input[name='esfieldvalue']").eq(i)
							.val();
					var relation = $("select[name='relation']")
							.eq(i).val();
					if (esfields) {
						if (relation == "AND") {
							relation = 'true';
						} else {
							relation = 'false';
						}
						temp.push(esfields + ',' + comparison
								+ ',' + esfieldvalue + ','
								+ relation);
					}
				});
		where.condition = temp;
		return where;
	};
	// 还原数据
	function back() {
		$("#esDataList").flexOptions({
			newp : 1,
			query : ''
		}).flexReload();
	};
	//文件流转流程启动
	function filetransfer() {
		var obj = $("#esDataList");
		var checkboxObj = $("input[type='radio'][name='checkname']:checked");
		var checkBoxLen = checkboxObj.length;
		var checkUrl = $.appClient.generateUrl({
			ESDocumentTransfer : 'checkTransfer'
		}, 'x');
		if (checkBoxLen == 0) {
			$.dialog.notice({
				content : '请选择流转数据！',
				time : 3,
				icon : "warning"
			});
		} else {
			var id = checkboxObj.val();
			$.post(checkUrl, {
				id : id,
				stageId : checkboxObj.attr("stageId")
			}, function(data) {
				filetransferConfirm(data, id, checkboxObj
						.attr("stageId"));
			}, "json");
		}
	};
	function filetransferConfirm(data, id, stageId) {
		if (data.transfer) {
			$.dialog({
				content : data.msg,
				ok : true,
				okVal : '确定',
				cancel : true,
				cancelVal : '取消',
				ok : function() {
					transferFun(id, stageId);
				}
			});
		} else {
			$.dialog.notice({
				content : data.msg,
				time : 3,
				icon : "error"
			});
		}
	};
	function transferFun(id, stageId) {
		$.ajax({url : $.appClient.generateUrl({ESDocumentTransfer : "getWfList"}, 'x'),
				type : 'post',
				data : {
					stageId : stageId
				},
				success : function(html) {
					if (!html) {
						$.dialog.notice({
							content : "未找到权限内发布流转流程！",
							icon : 'warning',
							time : 3
						});
					} else if (html.length < 10) {
						var flowId = html;
						showMyform(id, stageId, flowId);
						return;
					} else {
						$.dialog({title : '请选择流转流程',
								width : '25%',
								fixed : true,
								resize : true,
								okVal : '提交',
								ok : true,
								cancelVal : '取消',
								cancel : function() {
								},
								content : html,
								ok : function() {
									var flowId = $('#searchWfSelect option:selected').val();
									showMyform(id,stageId,flowId);
								}
						});
					}
				}
		});
	};
	function showMyform(id, stageId, flowId) {
		$.post($.appClient.generateUrl({ESDocumentTransfer : 'showMyForm'}, 'x'),
			{flowId : flowId,id : id,stageId : stageId},function(data) {
			var identifyTransferBillType = "";
			$.dialog({id : "archiveTransfer",
					title : '起草流转单',
					width : 620,
					height : 350,
					padding : "0",
					content : data,
					calcel : true,
					button : [{name : "保存待发",callback : function() {
							var postData = collaborativeHandle.getPrintForm($('#transferBillCreateForm'));
							var dataId = $('#id').val();
							$.ajax({type : 'POST',
									url : $.appClient.generateUrl({ESDocumentTransfer : 'saveWorkflow'},'x'),
									data : {
										postData : postData,
										id : dataId,
										flowId : $('#flowId').val()
									},
									success : function(res) {
										var json = eval('('+ res+ ')');
										$.dialog.notice({icon : json.msgType,content : json.message,title : '3秒后自动关闭',time : 3});
										if (art.dialog.list['archiveTransfer']) {
											art.dialog.list['archiveTransfer'].close();
										}
										// 保存数据状态为流转
										// 使其不能再次发起流程
										$.ajax({type : 'POST',
												url : $.appClient.generateUrl({ESDocumentTransfer : 'setTransferstaus'},'x'),
												data : {
													dataid : dataId,
													transferStatus : 'edit'
												},
												success : function() {}
										});
									},
									error : function() {
										$.dialog.notice({icon : 'error',content : '工作流保存失败！',title : '2秒后自动关闭',time : 2});
										if (art.dialog.list['archiveTransfer']) {
											art.dialog.list['archiveTransfer'].close();
										}
									}
								});
							}
						},
						{name : "提交流转",callback : function() {
							var flowId = $("#flowId").val();
							$.ajax({url : $.appClient.generateUrl({ESDocumentTransfer : 'getWFModelByFormId'},'x'),
									type : 'post',
									data : {
										flowId : flowId
									},
									dataType : 'json',
									success : function(wfrt) {
										$("#actionId").val(wfrt.actionId);
										collaborativeHandle.formSendBeforeSet(flowId,wfrt.first_step_id);
									}
								});
							return false;
						}
					} ]
				});

		});
	}
});

var collaborativeHandle = {
	formSendBeforeSet : function(wfId, stepId) {
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESDocumentTransfer : 'formStartHandlePage'
			}, 'x'),
			data : {
				wfId : wfId,
				stepId : stepId
			},
			success : function(data) {
				$.dialog({
					id : 'formStartHandleDialog',
					title : '处理',
					modal : true, // 蒙层（弹出会影响页面大小）
					fixed : false,
					stack : true,
					resize : false,
					lock : true,
					opacity : 0.1,
					padding : '0px',
					width : 400,
					height : 175,
					content : data,
					okVal : '确定',
					ok : true,
					cancelVal : '关闭',
					cancel : function() {
					},
					init : function() {
						collaborativeHandle.selectWfOwner();
					},
					ok : function() {
						if ($('#mylist').attr('selectType') == 'send') {
							collaborativeHandle.formSend();
							art.dialog.list['formStartHandleDialog'].close();
						} else {
							collaborativeHandle.formStart();
						}
					}
				});
			},
			cache : false
		});
	},

	// 选择决策值被修改时 调用方法
	checkAction : function(aId, aName) {
		if ($('#actionId').val() != aId) {
			$('#actionId').val(aId)
			// $('#formStartPage').attr('actionid', aId) ;
			$('#nextStepOwer').attr('name', '');
			$('#nextStepOwer').val('');
		}
	},

	selectWfOwner : function() {
		var formData = $('#transferBillCreateForm').serialize();
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'getStepOwner'
			}, 'x'),
			data : {
				formData : formData,
				flowId : $('#flowId').val(),
				formId : 'form-' + $('#stageId').val(),
				dataId : $('#id').val(),
				actionId : $('#actionId').val(),
				wfId : -1,
				stepId : $('#step').val()
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				var wfModelId = json.wfModelId;
				var findNextStep = json.findNextStep;
				var nextStepOwner = json.nextStepOwner;
				if (nextStepOwner == '') {
					$.dialog.notice({
						icon : 'warning',
						content : '没有找到流程的下一步处理人！',
						title : '3秒后自动关闭',
						time : 3
					});
					return false;
				}
				collaborativeHandle.selectWfOwnerAction(nextStepOwner,
						json.userId);
				$('#formStartPage').attr('actionId', json.actionId);
			},
			error : function() {
				$.dialog.notice({
					icon : 'error',
					content : '获取下一步处理人出错！',
					time : 2
				});
				return false;
			}
		});
	},

	selectWfOwnerAction : function(nextStepOwners, currentUserId) {
		$('#nextStepOwners').html(nextStepOwners);
		$('#nextStepOwners').attr('currentUserId', currentUserId);
		var $chkarray = $("#nextStepOwners").find(
				"input[name=\'" + currentUserId + "\']");
		var splitStepId;
		$chkarray.each(function(index) {
			var $item = $chkarray.eq(index);
			if ($item.attr('text')) {
				splitStepId = $item.attr('stepid');
				if(collaborativeHandle.checkIfExist($item)){
					$('#nextStepOwer').append("<li name='"
							+ $item.attr('value')
							+ "'><span style='float:left;width:auto;' title='"
							+ $item.attr('title')
							+ "'>"
							+ $item.attr('text')
							+ '</span><span class="delPart" style="float:right;width:20px;" title="删除"></span></li>');
				}				
			}
		});
		$('#nextStepOwer').attr("name", splitStepId);
	},

	checkIfExist:function($item){
		$("#nextStepOwer li").each(function(i){
			if($item.attr('text')==$(this).find("span:first").html()){
				var name=$(this).attr("name")+";"+$item.attr("value");
				$(this).attr("name",name);
				var title=$(this).find("span:first").attr("title")+","+$item.attr("title");
				$(this).find("span:first").attr("title",title);
				return false;//存在
			}
		});
		return true;//不存在
	},
	
	formStart : function() {
		var selectUsers = "";
		$("#nextStepOwer li").each(function(i) {
			selectUsers = selectUsers + ";" + $(this).attr("name");
		});
		if (selectUsers == '') {
			collaborativeHandle.showMsg('没有下一步处理人，流程不能提交！', '3');
			return;
		}
		selectUsers = $("#nextStepOwer").attr("name")+":"+selectUsers.substr(1)+"-";
		
		var postData = $('#transferBillCreateForm').serialize();
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'startWorkflow'
			}, 'x'),
			data : {
				postData : postData,
				flowId : $('#flowId').val(),
				formId : 'form-' + $('#stageId').val(),
				actionId : $('#actionId').val(),
				dataId : $('#id').val(),
				selectUsers : selectUsers
			},
			success : function(res) {

				var json = eval('(' + res + ')');
				collaborativeHandle.showMsg(json.message, 1);
				if (json.success) {
					var dataid = $(
							"input[type='radio'][name='checkname']:checked")
							.val();
					$.ajax({
						type : 'POST',
						url : $.appClient.generateUrl({
							ESDocumentTransfer : 'setTransferstaus'
						}, 'x'),
						data : {
							dataid : dataid,
							transferStatus : 'edit'
						},
						success : function() {

						}
					});
				}
				/**
				 * wanghongchen 20140916 关闭窗口时判断窗口是否存在，防止在档案著录中直接发起销毁流程出错 *
				 */
				if (art.dialog.list['formStartDialog']) {
					art.dialog.list['formStartDialog'].close();
				}
				if (art.dialog.list['archiveTransfer']) {
					art.dialog.list['archiveTransfer'].close();
				}
			},
			error : function() {
				collaborativeHandle.showMsg('工作流启动失败！', '2');
				art.dialog.list['formStartDialog'].close();
			}
		});

	},

	// 获取form的字段序列
	getPrintForm : function(formObj) {
		// 获取disabled的字段
		var disableds = formObj.find(':disabled');
		// 取消disabled属性
		disableds.removeAttr('disabled');
		var strSeri = formObj.serialize();
		// 还原
		disableds.attr('disabled', 'disabled');
		return strSeri;
	},

	showMsg : function(msg, type) {
		if (type == '1') {
			$.dialog.notice({
				icon : 'succeed',
				content : msg,
				title : '3秒后自动关闭',
				time : 3
			});
		} else if (type == '2') {
			$.dialog.notice({
				icon : 'error',
				content : msg,
				title : '3秒后自动关闭',
				time : 3
			});
		} else {
			$.dialog.notice({
				icon : 'warning',
				content : msg,
				title : '3秒后自动关闭',
				time : 3
			});
		}
	}
}