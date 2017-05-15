$(document).ready(
		function() {
			// 所有用户
			var colModelAllUsers = [ {
				display : '<input type="checkbox" id="userIdList">',
				name : 'ids',
				width : 20,
				align : 'center'
			}, {
				display : 'ID',
				name : 'ID',
				hide : true,
				width : 50,
				align : 'right'
			}, {
				display : '用户名',
				name : 'userid',
				width : 200,
				align : 'left'
			}, {
				display : '姓名',
				name : 'name',
				width : 200,
				align : 'left'
			}, {
				display : '邮箱',
				name : 'emailAddress',
				hide : true,
				width : 220,
				align : 'left'
			}, {
				display : '手机',
				name : 'mobtel',
				hide : true,
				width : 180,
				align : 'left'
			} ];
			// 所有角色
			var colModelAllRoles = [ {
				display : '<input type="checkbox" id="roleIdList">',
				name : 'ids',
				width : 20,
				align : 'center'
			}, {
				display : 'ID',
				name : 'ID',
				hide : true,
				width : 50,
				align : 'right'
			}, {
				display : '角色标识',
				name : 'roleId',
				width : 100,
				align : 'left'
			}, {
				display : '角色名称',
				name : 'roleName',
				width : 100,
				align : 'left'
			}, {
				display : '创建时间',
				name : 'createTime',
				hide : true,
				width : 150,
				align : 'center'
			}, {
				display : '修改时间',
				name : 'updateTime',
				hide : true,
				width : 150,
				align : 'center'
			}, {
				display : '是否为系统角色',
				name : 'isSystem',
				hide : true,
				width : 80,
				align : 'center'
			}, {
				display : '描述',
				name : 'roleRemark',
				hide : true,
				width : 250,
				align : 'left'
			} ];
			// 已选择用户
			var colModelSelectedUsers = [ {
				display : '<input type="checkbox" id="selectedUser">',
				name : 'ids',
				width : 20,
				align : 'center'
			}, {
				display : 'ID',
				name : 'ID',
				hide : true,
				width : 50,
				align : 'right'
			}, {
				display : '标识',
				name : 'user',
				width : 100,
				align : 'left'
			}, {
				display : '名称',
				name : 'name',
				width : 100,
				align : 'left'
			}, {
				display : '类型',
				name : 'flag',
				width : 50,
				align : 'left'
			} ];
			// 查询所有用户
			$("#select_User").flexigrid({
				url : $.appClient.generateUrl({
					ESTransferFlow : 'getSelectUserList',
					key : '1',
					ids : $("#partId").val(),
					searchKeyword : ''
				}, 'x'),
				dataType : 'json',
				border : true,
				colModel : colModelAllUsers,
				buttons : [ {
					name : '选择',
					bclass : 'btnToRight',
					onpress : function() {
						modelStep.toRight4User();
					}
				} ],
				singleSelect : true,
				usepager : true,
				useRp : true,
				rp : 20,
				nomsg : "没有数据",
				showTableToggleBtn : true,
				pagetext : '第',
				outof : '页 /共',
				width : 532,
				height : 120,
				pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条',
				procmsg : '正在加载数据，请稍候...'
			});

			// 全选
			$("#userIdList").die().live(
					'click',
					function() {
						$("#select_User input[type='checkbox']").attr(
								'checked', $(this).is(':checked'));
					});

			// 查询已选择用户
			$("#selected_User").flexigrid({
				url : false,
				dataType : 'json',
				editable : true,
				colModel : colModelSelectedUsers,
				showTableToggleBtn : true,
				buttons : [ {
					name : '去掉',
					bclass : 'toLeft',
					onpress : function() {
						modelStep.toLeft();
					}
				} ],
				height : 348,
				width : 212
			});

			// 全选
			$("#selectedUser").die().live(
					'click',
					function() {
						$("#selected_User input[type='checkbox']").attr(
								'checked', $(this).is(':checked'));
					});

			// 查询所有角色
			$("#select_List_Role").flexigrid({
				url : false,
				dataType : 'json',
				border : true,
				colModel : colModelAllRoles,
				buttons : [ {
					name : '选择',
					bclass : 'btnToRight',
					onpress : function() {
						modelStep.toRight4Role();
					}
				} ],
				singleSelect : true,
				usepager : true,
				useRp : true,
				rp : 20,
				nomsg : "没有数据",
				showTableToggleBtn : true,
				pagetext : '第',
				outof : '页 /共',
				width : 532,
				height : 82,
				pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条',
				procmsg : '正在加载数据，请稍候...'
			});

			// 全选
			$("#roleIdList").die().live(
					'click',
					function() {
						$("#select_List_Role input[type='checkbox']").attr(
								'checked', $(this).is(':checked'));
						if ($(this).attr('checked')) {
							modelStep.rowClick_stepSelected_role($(this));
						}
					});
		});

var modelStep = {
	// 按单位部门选择
	stepPartSelect : function(partId) {
		modelStep.partSelect(partId);
	},

	partSelect : function(partId) {
		// 显示单位部门树
		$('#select_Tree').show();
		$('#select_Tree').parent().css({
			'overflow-y' : 'auto',
			'border-left' : '1px solid #B5B8C8'
		});
		$('#select_Role').hide();
		// 刷新单位部门树
		var treeObj = $.fn.zTree.getZTreeObj("select_Part_Tree");
		treeObj.refresh();
		// 查询所有用户列表
		modelStep.userListSearchKeyWord('1', partId);
	},

	// 按角色选择
	stepRoleSelect : function(roleIds) {
		modelStep.roleSelect(roleIds);
	},

	roleSelect : function(roleIds) {
		// 显示角色列表grid
		$('#select_Role').show();
		$('#select_Role').parent().css({
			'overflow-y' : 'hidden',
			'border-left' : '0px'
		});
		$('#select_Tree').hide();
		// 查询所有角色列表
		modelStep.getRoleQuery();
		// 查询所有用户列表
		modelStep.userListSearchKeyWord('2', roleIds);
	},

	// 点击检索用户
	userListSearchKeyWord : function(key, ids) {
		var userKeyword = $('#userKeyWord').val();
		if (userKeyword == '请输入关键字') {
			userKeyword = '';
		}
		$("#select_User").flexOptions({
			url : $.appClient.generateUrl({
				ESTransferFlow : 'getSelectUserList',
				key : key,
				ids : ids,
				searchKeyword : userKeyword
			}, 'x'),
			newp : 1
		}).flexReload();
	},

	getUserQuery : function() {
		if ($("#ES_STEP_PART_SELECT").attr("checked") == 'checked') {
			var partId = $('#partId').val();
			modelStep.userListSearchKeyWord('1', partId);
		} else {
			var roleIds = $('#roleIds').val();
			modelStep.userListSearchKeyWord('2', roleIds);
		}
	},

	getRoleQuery : function() {
		var roleKeyword = $('#roleKeyWord').val();
		if (roleKeyword == '请输入关键字') {
			roleKeyword = '';
		}
		$("#select_List_Role").flexOptions({
			url : $.appClient.generateUrl({
				ESTransferFlow : 'findRoleList',
				searchKeyword : roleKeyword
			}, 'x'),
			newp : 1
		}).flexReload();
	},

	// 去除 已选中的用户或角色
	toLeft : function() {
		var checkboxes = $("#selected_User").find(
				"input[type='checkbox']:checked");
		if (checkboxes.length == 0) {
			return false;
		}
		checkboxes.each(function() {
			$(this).closest("tr").remove();
		});
		$("#selected_User input[type='checkbox']").attr("checked", false);
	},

	// 选择用户 追加到右侧
	toRight4User : function() {
		var checkboxes = $("#select_User").find(
				"input[type='checkbox']:checked");
		if (checkboxes.length == 0) {
			return false;
		}
		var _flag = 'user';
		var _id = 'newid';
		var datas = [];
		var selected = $("#selected_User").find("tr");
		checkboxes.each(function() {
			var bo = true;
			var _user = $(this).closest('tr').find("td[colname='userid'] div")
					.html();
			var _name = $(this).closest('tr').find("td[colname='name'] div")
					.html();
			for (var i = 0; i < selected.length; i++) {
				var sel_user = $(selected[i]).find("td[colname='user'] div")
						.html();
				var sel_flag = $(selected[i]).find("td[colname='flag'] div")
						.html();
				if (_user == sel_user && sel_flag == _flag) {
					bo = false;
					i = selected.length;
				}
			}
			if (bo) {
				datas.push(_id + '|' + _flag + '|' + _user + '|' + _name);
			}
		});
		if (datas == '' || datas.length == 0) {
			$.dialog.notice({
				title : '操作提示',
				content : '当前用户已存在！',
				icon : 'warning',
				time : 2
			});
			return false;
		} else {
			// 添加到右侧已选择的grid中
			var nums = selected.length;
			for (var t = 0; t < datas.length; t++) {
				var data = datas[t].split('|');
				$('#selected_User').flexExtendData([ {
					'id' : data[0],
					'cell' : {
						'num' : ++nums,
						'ids' : '<input type="checkbox" class="checkbox" >',
						'ID' : data[0],
						'flag' : data[1],
						'user' : data[2],
						'name' : data[3]
					}
				} ]);
			}
		}
	},

	// 选择角色 追加到右侧
	toRight4Role : function() {
		var checkboxes = $("#select_List_Role").find(
				"input[type='checkbox']:checked");
		if (checkboxes.length == 0) {
			return false;
		}
		var _flag = 'role';
		var _id = 'newid';
		var datas = [];
		var selected = $("#selected_User").find("tr");
		checkboxes.each(function() {
			var bo = true;
			var _role = $(this).closest('tr').find("td[colname='roleId'] div")
					.html();
			var _name = $(this).closest('tr')
					.find("td[colname='roleName'] div").html();
			for (var i = 0; i < selected.length; i++) {
				var sel_role = $(selected[i]).find("td[colname='user'] div")
						.html();
				var sel_flag = $(selected[i]).find("td[colname='flag'] div")
						.html();
				if (_role == sel_role && sel_flag == _flag) {
					bo = false;
					i = selected.length;
				}
			}
			if (bo) {
				datas.push(_id + '|' + _flag + '|' + _role + '|' + _name);
			}
		});
		if (datas == '' || datas.length == 0) {
			$.dialog.notice({
				title : '操作提示',
				content : '当前角色已存在！',
				icon : 'warning',
				time : 2
			});
			return false;
		} else {
			// 添加到右侧已选择的grid中
			var nums = selected.length;
			for (var t = 0; t < datas.length; t++) {
				var data = datas[t].split('|');
				$('#selected_User').flexExtendData([ {
					'id' : data[0],
					'cell' : {
						'num' : ++nums,
						'ids' : '<input type="checkbox" class="checkbox" >',
						'ID' : data[0],
						'flag' : data[1],
						'user' : data[2],
						'name' : data[3]
					}
				} ]);
			}
		}
	},

	// 已选择列表的双击事件方法
	rowDblclick_stepSelected : function(rowData) {
		$(rowData).remove();
	},

	// 用户列表双击事件
	rowDblclick_stepSelected_user : function() {
		modelStep.toRight4User();
	},

	// 角色列表单击事件
	rowClick_stepSelected_role : function() {
		// 获取选择的所有角色
		var checkboxes = $("#select_List_Role").find(
				"input[type='checkbox']:checked");
		if (checkboxes.length == 0) {
			return false;
		}
		var roleIds = "";
		for (var i = 0; i < checkboxes.length; i++) {
			roleIds = roleIds
					+ $(checkboxes[i]).closest("tr").prop("id").substr(3) + ",";
		}
		roleIds = roleIds.substring(0, roleIds.length - 1);
		$("#roleIds").val(roleIds);
		modelStep.userListSearchKeyWord('2', roleIds);
	},

	// （开始紧跟着的节点）的保存事件
	btnSaveStepFirstCell : function(formid, modelid, cell, graph) {
		var selectField = '';// 表单字段
		var selectFieldPrint = '';// 表单打印模版
		$('#useRole li :hidden').each(function(i) {
			selectField += $(this).attr("code") + ',';
		});
		selectField = selectField.slice(0, -1);
		$('#useRole2 li :hidden').each(function(i) {
			selectFieldPrint += $(this).attr("code") + ',';
		});
		selectFieldPrint = selectFieldPrint.slice(0, -1);
		var postData = $("#OsModel_Step_Form_Id").serialize();
		postData += "&formId=" + formid;
		postData += "&modelId=" + modelid;
		postData += "&userIds=";
		postData += "&roleIds=";
		postData += "&stepId=" + cell.getId();
		postData += "&is_countersign=0";
		postData += "&parentStepId=";
		postData += "&selectField=" + selectField;
		postData += "&selectFieldPrint=" + selectFieldPrint;
		$.post($.appClient.generateUrl({
			ESTransferFlow : 'saveStepInit'
		}, 'x'), {
			data : postData
		}, function(res) {
			if (res) {
				cell.valueChanged(res.ES_STEP_NAME);
				graph.refresh();
				$.dialog.notice({
					icon : 'success',
					content : '保存成功',
					time : 3
				});
			} else {
				$.dialog.notice({
					icon : 'error',
					content : '保存失败',
					time : 3
				});
				return false;
			}
		}, "json");
	},

	// 一般节点的保存事件
	btnSaveStepNotFirstCell : function(formid, modelid, cell, graph) {
		var userSelected = '';
		var rolesSelected = '';
		// 获取已选择的用户和角色，并区分
		var trs = $("#selected_User").find("tr");
		nums = trs.length;
		if (trs.length > 0) {
			trs.each(function() {
				var _flag = $(this).find("td[colname='flag'] div").html();
				var _stepUser = $(this).find("td[colname='user'] div").html();
				if (_flag == 'user') {
					userSelected += "," + _stepUser;
				} else {
					rolesSelected += "," + _stepUser;
				}
			});
			userSelected = userSelected.substring(1);
			rolesSelected = rolesSelected.substring(1);
		}
		if (userSelected == '' && rolesSelected == '') {
			$.dialog.notice({
				icon : 'warning',
				content : '请选择当前步骤的处理人或角色',
				time : 3
			});
			return false;
		}
		var selectField = '';// 表单字段
		var selectFieldPrint = '';// 表单打印模版
		var iscountersign = 0;
		$('#useRole li :hidden').each(function(i) {
			selectField += $(this).attr("code") + ',';
		});
		selectField = selectField.slice(0, -1);
		$('#useRole2 li :hidden').each(function(i) {
			selectFieldPrint += $(this).attr("code") + ',';
		});
		selectFieldPrint = selectFieldPrint.slice(0, -1);
		if ($("#ES_STEP_ISCOUNTERSIGN").attr("checked") == "checked") {
			iscountersign = 1;
		}
		var postData = $("#OsModel_Step_Form_Id").serialize();
		postData += "&formId=" + formid;
		postData += "&modelId=" + modelid;
		postData += "&userIds=" + userSelected;
		postData += "&roleIds=" + rolesSelected;
		postData += "&stepId=" + cell.getId();
		postData += "&is_countersign=" + iscountersign;
		postData += "&parentStepId=" + cell.getParent().getId();
		postData += "&selectField=" + selectField;
		postData += "&selectFieldPrint=" + selectFieldPrint;
		$.post($.appClient.generateUrl({
			ESTransferFlow : 'saveStepInit'
		}, 'x'), {
			data : postData
		}, function(res) {
			if (res) {
				cell.valueChanged(res.ES_STEP_NAME);
				graph.refresh();
				$.dialog.notice({
					icon : 'success',
					content : '保存成功',
					time : 3
				});
			} else {
				$.dialog.notice({
					icon : 'error',
					content : '保存失败',
					time : 3
				});
				return false;
			}
		}, "json");
	},

	// part 设置动作属性中的设置知会人
	stepPartSelectForActionEvent : function(partId) {
		modelStep.partSelect(partId);
	},

	// role 设置动作属性中的设置知会人
	stepRoleSelectForActionEvent : function(roleIds) {
		modelStep.roleSelect(roleIds);
	},

	// 保存动作
	btnSaveAction : function(modelId, cell, graph) {
		var userSelected = '';
		var rolesSelected = '';
		// 获取已选择的用户和角色，并区分
		var trs = $("#selected_User").find("tr");
		nums = trs.length;
		if (trs.length > 0) {
			trs.each(function() {
				var _flag = $(this).find("td[colname='flag'] div").html();
				var _stepUser = $(this).find("td[colname='user'] div").html();
				if (_flag == 'user') {
					userSelected += "," + _stepUser;
				} else {
					rolesSelected += "," + _stepUser;
				}
			});
			userSelected = userSelected.substring(1);
			rolesSelected = rolesSelected.substring(1);
		}
		var selectFun = '';// 表单字段
		var selectFieldPrint = '';// 表单打印模版
		$('#useRole li :hidden').each(function(i) {
			selectFun += $(this).val() + ',';
		});
		selectFun = selectFun.slice(0, -1);
		var actionName = $("#ES_ACTION_NAME").val();
		var postData = $("#OsModel_Action_Form_Id").serialize();
		postData += "&modelId=" + modelId;
		postData += "&actionId=" + cell.getId();
		postData += "&stepId=" + cell.getTerminal(true).getId();
		postData += "&ES_ACTION_SELECTFUNCTION=" + selectFun;
		postData += "&userIds=" + userSelected;
		postData += "&roleIds=" + rolesSelected;
		/**
		 * lujixiang 20150421 不用单独针对知会人信息保存 if
		 * (userSelected!=''||rolesSelected!='') { $.post(
		 * $.appClient.generateUrl({ESTransferFlow : 'saveActionForNoticeInit'},
		 * 'x') ,{data:postData}, function(res){ if(res){
		 * $.dialog.notice({icon:'error', content:res, time:3 }); return false; }
		 * }); }
		 */
		postData += "&dataImportPara=";
		postData += "&updateStatePara=";
		postData += "&titleAll=";
		/** lujixiang 20150421 添加处理时间周期 * */
		var processTime = $("#ES_STEP_PROCESSTIME").val();
		if (processTime == null || processTime == "") {
			processTime = "0";
		}
		postData += "&processTime=" + processTime;
		$.post($.appClient.generateUrl({
			ESTransferFlow : 'saveActionInit'
		}, 'x'), {
			data : postData
		}, function(res) {
			if (res) {
				$.dialog.notice({
					icon : 'error',
					content : res,
					time : 3
				});
				return false;
			} else {
				cell.valueChanged(actionName);
				graph.refresh();
				$.dialog.notice({
					icon : 'success',
					content : '保存成功！',
					time : 3
				});
			}
		});
	},

	// 分支获取角色数据
	getConditionRoleQuery : function() {
		var roleKeyword = $('#catagoryRole #roleKeyWordCond').val();
		if (roleKeyword == '请输入关键字') {
			roleKeyword = '';
		}
		$("#esConditionRole").flexOptions({
			url : $.appClient.generateUrl({
				ESTransferFlow : 'findRoleList',
				searchKeyword : roleKeyword
			}, 'x'),
			newp : 1
		}).flexReload();
	},

	// 获取条件分支数据
	getConditionsForm : function(type) {
		var cond_string = '';
		var count = 0;
		var formObjId = 'esPartForm';
		var condObjId = 'conditionLeft';
		if (type == 'right') {
			formObjId = 'esFormForm';
			condObjId = 'conditionRight';
		}
		var conditionCount = $('#' + condObjId).find('ul').length;
		return $('#' + formObjId).serialize() + "&conditionCount="
				+ conditionCount;
	},

	// 保存分支条件
	saveSplitCondition : function(modelId, formId, cell) {
		var check = $('#OsModel_Spit_Wind').attr('currentType');
		var postData = modelStep.getConditionsForm(check) + "&check=" + check
				+ "&actionId=" + cell.getId() + "&modelId=" + modelId
				+ "&stepId=" + cell.getTerminal(true).getId() + "&formId="
				+ formId;
		$.post($.appClient.generateUrl({
			ESTransferFlow : 'saveSplitCondition'
		}, 'x'), {
			data : postData
		}, function(res) {
			if (res) {
				$.dialog.notice({
					icon : 'error',
					content : res,
					time : 3
				});
				return false;
			} else {
				$.dialog.notice({
					icon : 'success',
					content : "设置分支条件成功",
					time : 3
				});
			}
		});
		return false;
	},

	// 展示分支条件
	showConditions : function() {
		var fieldList = $('#OsModel_Spit_Wind').attr('fieldList');
		var tempIDs = $('#OsModel_Spit_Wind').attr('tempIDs');
		var rightCondition = $('#OsModel_Spit_Wind').attr('rightCondition');
		var showfieldstr = $('#OsModel_Spit_Wind').attr('showfieldstr');
		// 第一个分支界面已设置的条件自动选择
		if (fieldList && fieldList.length > 2) {
			var condition = fieldList.substring(1, fieldList.length - 4);
			var tempConID = tempIDs.substring(1, tempIDs.length - 4);
			var strs = condition.split('&|&');
			var idstr = tempConID.split('&|&');
			var j = 0;
			for (var i = 0; i < strs.length; i++) {
				if (j > 4) {
					modelStep.addConditionRow('left');
				}
				if (strs[i] && strs[i].indexOf('(') > -1) {
					$('#esPartForm [name="leftBracketsName' + j + '"]').val(
							strs[i]);
					i++;
				} else if (strs[i] == ' ') {
					i++;
				}
				$('#esPartForm [name="fieldName' + j + '"]').val(strs[i]);
				i++;
				$('#esPartForm [name="compare' + j + '"]').val(strs[i]);
				i++;
				$('#esPartForm [name="inputField' + j + '"]').val(strs[i]);
				$('#esPartForm [name="hiddenvalue' + j + '"]').val(idstr[i]);
				i++;
				if (strs[i] && strs[i].indexOf(')') > -1) {
					$('#esPartForm [name="rightBracketsName' + j + '"]').val(
							strs[i]);
					i++;
				} else if (strs[i] == ' ') {
					i++;
				}
				if (strs[i] && $('#esPartForm [name="relation' + j + '"]')) {
					$('#esPartForm [name="relation' + j + '"]').val(strs[i]);
				}
				j++;
			}
		}
		// 第二个分支界面已设置的条件自动选择
		if (rightCondition && rightCondition.length > 2) {
			var condition = rightCondition.substring(1,
					rightCondition.length - 4);
			var strs = condition.split('&|&');
			var j = 0;
			for (var i = 0; i < strs.length; i++) {
				if (strs[i] && strs[i].indexOf('(') > -1) {
					$('#esFormForm [name="leftBracketsName' + j + '"]').val(
							strs[i]);
					i++;
				} else if (strs[i] == ' ') {
					i++;
				}
				$('#esFormForm [name="fieldName' + j + '"]').val(strs[i]);
				i++;
				$('#esFormForm [name="compare' + j + '"]').val(strs[i]);
				i++;
				$('#esFormForm [name="hiddenvalue' + j + '"]').val(strs[i]);
				$('#esFormForm [name="inputvalue' + j + '"]').val(strs[i]);
				i++;
				if (strs[i] && strs[i].indexOf(')') > -1) {
					$('#esFormForm [name="rightBracketsName' + j + '"]').val(
							strs[i]);
					i++;
				} else if (strs[i] == ' ') {
					i++;
				}
				if (strs[i] && $('#esFormForm [name="relation' + j + '"]')) {
					$('#esFormForm [name="relation' + j + '"]').val(strs[i]);
				}
				j++;
			}
		}
	},

	// 添加行
	addConditionRow : function(type) {
		var count = 4;
		var conditionId = 'conditionLeft';
		if (type == 'right') {
			conditionId = 'conditionRight';
		}
		count = parseInt($('#' + conditionId).attr('maxRowNum'));
		var thisObj = $('#' + conditionId + ' .add')[count - 1];

		var newRowNum = count;
		var oldNode = $(thisObj).parent().parent();
		var oldRowNum = $(thisObj).attr('name').substring(9);
		var newNode = oldNode.clone();
		// replace rownum
		$(newNode).find('[name="leftBracketsName' + oldRowNum + '"]').attr(
				'name', 'leftBracketsName' + newRowNum);
		$(newNode).find('[name="fieldName' + oldRowNum + '"]').attr('name',
				'fieldName' + newRowNum);
		$(newNode).find('[name="compare' + oldRowNum + '"]').attr('name',
				'compare' + newRowNum);
		$(newNode).find('[name="inputField' + oldRowNum + '"]').attr('name',
				'inputField' + newRowNum);
		$(newNode).find('[name="hiddenvalue' + oldRowNum + '"]').attr('name',
				'hiddenvalue' + newRowNum);
		$(newNode).find('[name="rightBracketsName' + oldRowNum + '"]').attr(
				'name', 'rightBracketsName' + newRowNum);
		$(newNode).find('[name="relation' + oldRowNum + '"]').attr('name',
				'relation' + newRowNum);
		$(newNode).find(
				'#' + conditionId + ' [name="addrowbut' + oldRowNum + '"]')
				.attr('name', 'addrowbut' + newRowNum);
		newNode.appendTo('#' + conditionId);
		newRowNum++;
		$('#' + conditionId).attr('maxRowNum', newRowNum);
	},

	// 删除行
	delConditionRow : function(thisObj, type) {
		var conditionId = 'conditionLeft';
		if (type == 'right') {
			conditionId = 'conditionRight';
		}
		if (document.getElementById(conditionId).children.length > 1) {
			$(thisObj).parent().parent().remove();
			var count = parseInt($('#' + conditionId).attr('maxRowNum'));
			count--;
			$('#' + conditionId).attr('maxRowNum', count);
		}
	}
}