/**
 * @author gengqianfeng
 */
var groupStep = {
	step : 1
};

var groupStatistics = {
	add : function() {
		$.ajax({
			url : $.appClient.generateUrl({
				ESStatistics : 'addGroup'
			}, 'x'),
			success : function(data) {
				var dialog = $.dialog({
					id : 'artAddPanel',
					title : '添加统计方案',
					fixed : false,
					resize : false,
					padding : 0,
					content : data,
					init : function() {
						groupStep.step = 1;
						$('#form_add').autovalidate();
					},
					button : [ {
						name : '上一步',
						callback : null,
						focus : true,
						disabled : true
					}, {
						name : '下一步',
						callback : groupStatistics.nextStep,
						focus : true
					}, {
						name : '完成',
						callback : null,
						focus : true,
						disabled : true
					} ],
					cancel : function() {
						$("#statisticGrid").flexReload();
					},
					cancelVal : '关闭'
				});
			},
			cache : false
		});
	},

	// 下一步
	nextStep : function() {
		if (groupStep.step == 1) {
			if (!$("#form_add").validate()) {
				return false;
			}
			var id = $("#hidden:hidden").val();// 统计主项id
			if (!id)
				id = -1;
			groupStatistics.saveGroupStatisticsTitle(id, this);
			return false;
		} else if (groupStep.step == 2) {
			var stageId = $("#stageId").val();
			if (stageId == "" || parseInt(stageId) <= 0) {
				$.dialog.notice({
					icon : 'warning',
					content : '请选择方案要统计的数据节点！',
					time : 2
				});
				return false;
			}
			groupStatistics.saveGroupStageId($("#hidden:hidden").val(),
					stageId, this);
			return false;
		} else if (groupStep.step == 3) {
			if ($("#g_fieldList2 li").length == 0) {
				$.dialog.notice({
					icon : 'warning',
					content : '请选择方案要进行分组的字段！',
					time : 2
				});
				return false;
			}
			var groups = groupStatistics.getGroupFields();
			var havings = groupStatistics.getGroupHavingFields();
			groupStatistics.saveGroup(groups, havings, this);
			return false;
		} else if (groupStep.step == 4) {
			if ($("#s_fieldList2 li").length == 0) {
				$.dialog.notice({
					icon : 'warning',
					content : '请选择方案要进行统计的字段！',
					time : 2
				});
				return false;
			}
			var f_t = groupStatistics.getStatisticsFields();
			var fields = f_t[1];
			var wheres = groupStatistics.getStatisticsWheresFields();
			groupStatistics.saveColTitleAndColCount(f_t[0]);
			groupStatistics.saveFields(fields, wheres, this);
			return false;
		} else {
			groupStep.step = 0;
		}
		return false;
	},

	// 上一步
	preStep : function() {
		if (groupStep.step == 5) {
			var id = $("#hidden:hidden").val();
			var stageId = $("#stageId").val();
			$.post($.appClient.generateUrl({
				ESStatistics : 'getStatisticsFields'
			}, 'x'), {
				statistics_id : id,
				tree_id : stageId
			}, function(result) {
				var res = eval('(' + result + ')');
				if (!jQuery.isEmptyObject(res)) {
					groupStatistics.gobackSetStatisticsFields(res.fields);
				}
			});
		} else if (groupStep.step == 1) {
			groupStep.step = 2;
		} else {
		}
		groupStatistics.setStep(this, "pre");
		return false;
	},

	// 完成
	overStep : function() {
		return groupStatistics.groupOver();
	},

	// 步骤设置
	setStep : function(obj, flag) {
		$("#groupStep" + groupStep.step).hide();
		if (flag == "pre") {
			groupStep.step = groupStep.step - 1;
		} else {
			groupStep.step = groupStep.step + 1;
		}
		$("#groupStep" + groupStep.step).show();
		groupStatistics.showStep(obj);
	},

	// 步骤显示设置
	showStep : function(obj) {
		// 切换标签
		var val_li = $(".select ul li");
		val_li.each(function(i) {
			$(this).removeClass("selected");
			if (groupStep.step == (i + 1)) {
				$(this).addClass("selected");
			}
		});
		// 切换按钮
		if (groupStep.step == 5) {
			obj.button({
				name : '上一步',
				callback : groupStatistics.preStep,
				focus : true,
				disabled : false
			}, {
				name : '下一步',
				callback : null,
				focus : true,
				disabled : true
			}, {
				name : '完成',
				callback : groupStatistics.overStep,
				focus : true,
				disabled : false
			});
		} else if (groupStep.step == 1) {
			obj.button({
				name : '上一步',
				callback : null,
				focus : true,
				disabled : true
			}, {
				name : '下一步',
				callback : groupStatistics.nextStep,
				focus : true,
				disabled : false
			}, {
				name : '完成',
				callback : null,
				focus : true,
				disabled : true
			});
		} else {
			obj.button({
				name : '上一步',
				callback : groupStatistics.preStep,
				focus : true,
				disabled : false
			}, {
				name : '下一步',
				callback : groupStatistics.nextStep,
				focus : true,
				disabled : false
			}, {
				name : '完成',
				callback : null,
				focus : true,
				disabled : true
			});
		}
	},

	// 保存主项名称
	saveGroupStatisticsTitle : function(id, obj) {
		var title = $("input[name='title']").val();
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESStatistics : 'saveTitle'
			}, 'x'),
			data : {
				id : id,
				title : title,
				type : '1'
			},
			async : false,
			success : function(result) {
				var rt = eval('(' + result + ')');
				if (!rt.success) {
					$.dialog.notice({
						content : rt.msg,
						time : 3,
						icon : 'warning'
					});
					return false;
				}
				id = rt.id;
				if (-1 != id) {
					$("#hidden:hidden").val(id);
					var url = $.appClient.generateUrl({
						ESStatistics : 'getStatisticsGroups'
					}, 'x');
					$.post(url, {
						statistics_id : id
					}, function(data) {
						var json = eval('(' + data + ')');
						if (!jQuery.isEmptyObject(json)) {
							$("#stageId").val(json.tree_id);
							var zTree = $.fn.zTree.getZTreeObj("archives");
							var treeNode = zTree.getNodeByParam("id",
									json.tree_id);
							zTree.selectNode(treeNode);
						}
						groupStatistics.setStep(obj, "next");
					});
					return true;
				} else {
					$.dialog.notice({
						content : '保存失败',
						time : 2,
						icon : 'error'
					});
					return false;
				}
			}
		});
	},

	// 编辑统计方案
	modifyStatistic : function(id, name) {
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESStatistics : 'addGroup'
			}, 'x'),
			data : {
				id : id,
				name : name
			},
			success : function(data) {
				var dialog = $.dialog({
					id : 'artAddPanel',
					title : '编辑统计方案',
					fixed : false,
					resize : false,
					padding : 0,
					content : data,
					init : function() {
						groupStep.step = 1;
						$('#form_add').autovalidate();
					},
					button : [ {
						name : '上一步',
						callback : null,
						focus : true,
						disabled : true
					}, {
						name : '下一步',
						callback : groupStatistics.nextStep,
						focus : true
					}, {
						name : '完成',
						callback : null,
						focus : true,
						disabled : true
					} ],
					cancel : function() {
						$("#statisticGrid").flexReload();
					},
					cancelVal : '关闭'
				});
			},
			cache : false
		});
	},

	saveGroupStageId : function(statisticsId, stageId, obj) {
		$.post($.appClient.generateUrl({
			ESStatistics : 'saveGroupStageId'
		}, 'x'), {
			statisticsId : statisticsId,
			stageId : stageId
		}, function(data) {
			if (data == "") {
				$.post($.appClient.generateUrl({
					ESStatistics : 'getStatisticsGroups'
				}, 'x'), {
					statistics_id : statisticsId
				}, function(result) {
					var res = eval('(' + result + ')');
					if (!jQuery.isEmptyObject(res)) {
						groupStatistics.setGroupFields(res.groups);
						groupStatistics.setGroupHavingFields(res.havings);
					}
					groupStatistics.setStep(obj, "next");
					return true;
				});
			} else {
				$.dialog.notice({
					content : data,
					time : 2,
					icon : 'error'
				});
				return false;
			}
		});
	},

	setGroupFields : function(groups) {
		if (groups != "" && groups != null) {
			var group_arr = groups.split(",");
			$("#g_fieldList li").each(function(index) {
				for (var i = 0; i < group_arr.length; i++) {
					if ($(this).find("span").attr("code") == group_arr[i]) {
						$(this).appendTo("#g_fieldList2");
					}
				}
			});
		}
	},

	setGroupHavingFields : function(havings) {
		if (havings == null || havings == "") {
			return false;
		}
		var filters = havings.split("&");
		for (var i = 0; i < filters.length; i++) {
			var filter = filters[i].split(",");
			if ($("#groupContents p").length < (i + 1)) {
				var up_p = $("#groupContents p").eq(i - 1);
				up_p.clone().insertAfter(up_p);
			}
			var p = $("#groupContents p").eq(i);
			p.find('input').val(filter[2]);
			var select = p.find('select');
			$(select[0]).val(filter[0]);
			$(select[1]).val(filter[1]);
			if (filter[3] == "false") {
				$(select[2]).val("AND");
			} else {
				$(select[2]).val("OR");
			}
		}
	},

	setStatisticsFields : function(statistics) {
		if (statistics != "" && statistics != null) {
			var statistic_arr = statistics.split(",");
			$("#s_fieldList li").each(function(index) {
				for (var i = 0; i < statistic_arr.length; i++) {
					var arr = statistic_arr[i].split(";");
					if ($(this).find("span").attr("code") == arr[0]) {
						$(this).find("span").attr("name", arr[1]);
						$(this).appendTo("#s_fieldList2");
					}
				}
			});
		}
	},

	gobackSetStatisticsFields : function(statistics) {
		if (statistics != "" && statistics != null) {
			var statistic_arr = statistics.split(",");
			$("#s_fieldList2 li").each(function(index) {
				for (var i = 0; i < statistic_arr.length; i++) {
					var arr = statistic_arr[i].split(";");
					if ($(this).find("span").attr("code") == arr[0]) {
						$(this).find("span").attr("name", arr[1]);
					}
				}
			});
		}
	},

	setStatisticsWhereFields : function(wheres) {
		if (wheres == null || wheres == "") {
			return false;
		}
		var filters = wheres.split("&");
		for (var i = 0; i < filters.length; i++) {
			var filter = filters[i].split(",");
			if ($("#statisticsContents p").length < (i + 1)) {
				var up_p = $("#statisticsContents p").eq(i - 1);
				up_p.clone().insertAfter(up_p);
			}
			var p = $("#statisticsContents p").eq(i);
			p.find('input').val(filter[2]);
			var select = p.find('select');
			$(select[0]).val(filter[0]);
			$(select[1]).val(filter[1]);
			if (filter[3] == "false") {
				$(select[2]).val("AND");
			} else {
				$(select[2]).val("OR");
			}
		}
	},

	// 获取进行分组的字段
	getGroupFields : function() {
		var groups = "";
		$("#g_fieldList2 li").each(function(index) {
			groups = groups + "," + $(this).find("span").attr("code");
		});
		return groups.length > 0 ? groups.substr(1) : "";
	},

	// 获取分组条件字符串
	getGroupHavingFields : function() {
		var havings = "";
		$("#groupContents p").each(
				function(index) {
					var input = $(this).find('input').val();
					var select = $(this).find('select');
					var s1 = $(select[0]).val();
					if (input != "" && s1 != "") {
						var s3 = ($(select[2]).val() == "AND") ? "true"
								: "false";
						havings = havings + "&" + s1 + "," + $(select[1]).val()
								+ "," + input + "," + s3;
					}
				});
		return havings.length > 0 ? havings.substr(1) : "";
	},

	// 保存分组对象
	saveGroup : function(groups, havings, obj) {
		var id = $("#hidden:hidden").val();
		var stageId = $("#stageId").val();
		var url = $.appClient.generateUrl({
			ESStatistics : 'saveGroup'
		}, 'x');
		$.post(url, {
			id : id,
			stageId : stageId,
			groups : groups,
			havings : havings
		}, function(data) {
			if (data) {
				$.dialog.notice({
					content : data,
					time : 3,
					icon : 'error'
				});
				return false;
			} else {
				$.post($.appClient.generateUrl({
					ESStatistics : 'getStatisticsFields'
				}, 'x'), {
					statistics_id : id,
					tree_id : stageId
				}, function(result) {
					var res = eval('(' + result + ')');
					if (!jQuery.isEmptyObject(res)) {
						groupStatistics.setStatisticsFields(res.fields);
						groupStatistics.setStatisticsWhereFields(res.wheres);
					}
					groupStatistics.setStep(obj, "next");
					return true;
				});
			}
		});
	},

	// 获取进行分组的字段
	getStatisticsFields : function() {
		var fields = "";
		var titles = "";
		$("#s_fieldList2 li").each(
				function(index) {
					var name = $(this).find("span").attr("name");
					titles = titles
							+ ";"
							+ (jQuery.isEmptyObject(name) ? $(this)
									.find("span").html() : name);
					fields = fields + "," + $(this).find("span").attr("code")
							+ ":" + (index + 1);
				});
		fields = fields.length > 0 ? fields.substr(1) : "";
		titles = titles.length > 0 ? titles.substr(1) : "";
		var f_t = [];
		f_t.push(titles);
		f_t.push(fields);
		return f_t;
	},

	// 获取分组条件字符串
	getStatisticsWheresFields : function() {
		var wheres = "";
		$("#statisticsContents p").each(
				function(index) {
					var input = $(this).find('input').val();
					var select = $(this).find('select');
					var s1 = $(select[0]).val();
					if (input != "" && s1 != "") {
						var s3 = ($(select[2]).val() == "AND") ? "true"
								: "false";
						wheres = wheres + "&" + s1 + "," + $(select[1]).val()
								+ "," + input + "," + s3;
					}
				});
		return wheres.length > 0 ? wheres.substr(1) : "";
	},

	// 保存默认列标题
	saveColTitleAndColCount : function(titles) {
		var data = [];
		var url = $.appClient.generateUrl({
			ESStatistics : 'saveColTitleAndColCount'
		}, 'x');
		$.post(url, {
			data : {
				id : $("#hidden:hidden").val(),
				count : titles.split(";").length,
				title : titles
			}
		}, function(result) {
			if (result != "success") {
				$.dialog.notice({
					content : result,
					time : 3,
					icon : 'error'
				});
				return false;
			}
			return true;
		});
	},

	// 保存字段
	saveFields : function(fields, wheres, obj) {
		var id = $("#hidden:hidden").val();
		var stageId = $("#stageId").val();
		var url = $.appClient.generateUrl({
			ESStatistics : 'saveFields'
		}, 'x');
		$.post(url, {
			id : id,
			stageId : stageId,
			fields : fields,
			wheres : wheres
		}, function(data) {
			if (data) {
				$.dialog.notice({
					content : data,
					time : 3,
					icon : 'error'
				});
				return false;
			} else {
				$.post($.appClient.generateUrl({
					ESStatistics : 'getStatisticById'
				}, 'x'), {
					id : id
				}, function(data) {
					var json = eval('(' + data + ')');
					if (!jQuery.isEmptyObject(json)) {
						var checked = json.isSummary == 0 ? '' : "checked";
						$("#isSummary").attr("checked", checked);
						$("#pic").val(json.pic);
					}
				});
				var url = $.appClient.generateUrl({
					ESStatistics : 'getStatisticsEditFields',
					statistic_id : id,
					tree_id : stageId
				}, 'x');
				$("#showRule").flexOptions({
					url : url,
					newp : 1
				}).flexReload();
				groupStatistics.setStep(obj, "next");
				return true;
			}
		});
	},

	// 分组统计完成
	groupOver : function() {
		if (!jQuery.isEmptyObject($("#colTitle").val())) {
			return false;
		}
		var id = $("#hidden:hidden").val();
		var isSummary = 0;
		if ($("#isSummary").attr("checked") == "checked") {
			isSummary = 1;
		}
		var pic = $("#pic").val();
		var url = $.appClient.generateUrl({
			ESStatistics : 'groupOver'
		}, 'x');
		$.post(url, {
			id : id,
			isSummary : isSummary,
			pic : pic
		}, function(data) {
			if (data) {
				$.dialog.notice({
					content : data,
					time : 3,
					icon : 'error'
				});
				return false;
			} else {
				$.dialog.notice({
					content : "分组统计完成",
					time : 3,
					icon : 'success'
				});
				$("#statisticGrid").flexReload();
				return true;
			}
		});
	},

	groupShow1 : function(id) {
		$.ajax({
			url : $.appClient.generateUrl({
				ESStatistics : 'show1',
				id : id
			}, 'x'),
			success : function(data) {
				var dialog = $.dialog({
					id : 'artShowPanel',
					title : '查看面板',
					fixed : false,
					padding : '0px 0px',
					resize : false,
					content : data,
					cancel : true,
					cancelVal : '关闭'
				});
				var tObjs = $('#showGroupsGrid').find('tr td div');
				tObjs.live('mouseover', function() {
					var text = $(this).text();
					$(this).attr('title', text);
				});
			},
			cache : false
		});
	}
};