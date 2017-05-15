// 所有用户
var colModelAllUsers = [
	    {display : '<input type="checkbox" id="userIdList">',name : 'ids',width : 20,align : 'center'}, 
	    {display : 'ID',name : 'id',metadata : 'id',hide : true}, 
		{display : '用户名称',name : 'name',metadata : 'name',width : 150,sortable : true,align : 'left'},
		{display : '机构名称',name : 'organ',metadata : 'organ',width : 250,sortable : true,align : 'left'}
	];
// 所有角色
var colModelAllRoles = [
	    {display : '<input type="checkbox" id="roleIdList">',name : 'ids',width : 20,align : 'center'}, 
	    {display : 'ID',name : 'id',metadata : 'id',hide : true}, 
		{display : '角色名称',name : 'name',metadata : 'name',width : 450,sortable : true,align : 'left'},
		{display : 'RoleId',name : 'roleId',metadata : 'roleId',hide : true,align : 'left'}
	];
//选中的用户或角色
var colModelSelectedUsers=[
		{display: '<input type="checkbox" id="selectedIdList">', name : 'id3', width : 20, align: 'center'},
		{display: '名称', name : 'name',sortable : false, width : 140,align: 'left',metadata:'name'},
		{display: 'ID', name : 'id',hide:true,metadata:'id'},
		{display: 'roleId', name : 'roleId',hide:true,metadata:'roleId'}
	];
$(document).ready(function() {
	// 查询所有用户
	$("#osModel_step_user_select_organ").flexigrid({
		url : $.appClient.generateUrl({ESWorkflow : 'getUserFromOrganNew'}, 'x'),
		dataType : 'json',
		query:{id:'1',searchKeyword:''},
		border:true,
		colModel : colModelAllUsers,
		buttons : [{
			name : '选择',
			bclass : 'btnToRight',
			onpress : function(){}
		}],
		singleSelect : true,
		usepager : true,
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width : 'auto',
		height : '300px',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	// 全选
	$("#userIdList").die().live('click', function() {
		$("input[name='userId']").attr('checked', $(this).is(':checked'));
	});
	
	// 查询已选择用户角色
	$("#osModel_step_user_selected").flexigrid({
		url :false,
		dataType: 'json',
		editable: true,
		colModel:colModelSelectedUsers,
		showTableToggleBtn: false,
		buttons : [{
			name : '去掉',
			bclass : 'toLeft',
			onpress : function(){
				modelStep.toLeft();
			}
		}],
		height: 'auto'
	});
	$("#osModel_step_user_selected").flexReload();
	// 全选
	$("#selectedIdList").die().live('click', function() {
		$("input[name='selectedUserId']").attr('checked', $(this).is(':checked'));
	});
	
	// 查询所有角色
	$("#osModel_step_Role_select").flexigrid({
//		url : $.appClient.generateUrl({ESWorkflow : 'getAllRolesNew'}, 'x'),
		url : false,
		dataType : 'json',
		query:{searchKeyword:''},
		border:true,
		colModel : colModelAllRoles,
		buttons : [{
			name : '选择',
			bclass : 'btnToRight',
			onpress : function(){}
		}],
		singleSelect : true,
		usepager : true,
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
	// 全选
	$("#roleIdList").die().live('click', function() {
		$("input[name='roleId']").attr('checked', $(this).is(':checked'));
		
		if ($(this).attr('checked')) {
			// 获取选择的所有角色
			var checkboxes=$("#osModel_step_Role_select").find("input[name='roleId']:checked");
			if(checkboxes.length==0){
				return;
			}
			var roleIds = '';
			for (var i=0; i<checkboxes.length; i++) {
				roleIds += $(checkboxes[i]).val() + ",";
			}
			modelStep.userRoleListSearchKeyWord(roleIds,'');
		}
	});
});

var modelStep = {
		// 按机构选择
		stepOrganSelect: function(modelId,stepId,checked){
			// 显示系统机构树
			$('#wfModelStep_Select_Organ_Tree').show();
			$('#wfModelStep_Select_Role').hide();
			$('#wfModelStep_Select_Tree').attr('selectNodeId','0');
			// 刷新结构树
			var treeObj = $.fn.zTree.getZTreeObj("wfModelStep_Select_Organ_Tree");
			treeObj.refresh();
			//查询所有用户列表
			modelStep.userOrganListSearchKeyWord(1, "");
			// 查询已选择用户列表
			$("#osModel_step_user_selected").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'showCurrStepUsersNew'}, 'x'),query:{modelId:modelId,stepId:stepId}, newp:1}).flexReload();
		},
		// 按角色选择
		stepRoleSelect: function(modelId,stepId,checked){
			// 显示角色列表grid
			$('#wfModelStep_Select_Role').show();
			$('#wfModelStep_Select_Organ_Tree').hide();
			$('#wfModelStep_Select_Tree').attr('selectNodeId','0');
			//查询所有角色列表
			$("#osModel_step_Role_select").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getAllRolesNew'}, 'x'),query:{searchKeyword:''}, newp:1}).flexReload();
			//查询所有用户列表
			modelStep.userOrganListSearchKeyWord(1, "");
			// 查询已选择用户列表
			$("#osModel_step_user_selected").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'showCurrStepUsersNew'}, 'x'),query:{modelId:modelId,stepId:stepId}, newp:1}).flexReload();
		},
		//点击机构 检索用户
		userOrganListSearchKeyWord: function (id, userList_searchKeyword){
			$("#osModel_step_user_select_organ").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getUserFromOrganNew'}, 'x'),query:{id:id,searchKeyword:userList_searchKeyword}, newp:1}).flexReload();
		},
		//点击角色 检索用户
		userRoleListSearchKeyWord: function(roleId, userList_searchKeyword){
			$("#osModel_step_user_select_organ").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getUserFromRoleNew'}, 'x'),query:{roleId:roleId,searchKeyword:userList_searchKeyword}, newp:1}).flexReload();
	    },
	    getUserQuery: function() {
	    	var userKeyword = $('#userKeyWord').val();
	    	if (userKeyword == '请输入关键字') {
	    		userKeyword = '';
	    	}
	    	// 获取选中的机构树节点id
	    	var orgId = $('#wfModelStep_Select_Tree').attr('selectNodeId');
	    	modelStep.userOrganListSearchKeyWord(orgId,userKeyword);
	    },
	    getRoleQuery: function() {
	    	var roleKeyword = $('#roleKeyWord').val();
	    	if (roleKeyword == '请输入关键字') {
	    		roleKeyword = '';
	    	}
	    	$("#osModel_step_Role_select").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getAllRolesNew'}, 'x'),query:{searchKeyword:roleKeyword}, newp:1}).flexReload();
	    },
		// 去除 已选中的用户或角色
		toLeft: function(){
			var checkboxes=$("#osModel_step_user_selected").find("input[name='selectedUserId']:checked");
			if(checkboxes.length==0){
				return;
			}
			checkboxes.each(function(){
				$(this).closest("tr").remove();
			});
			$("input[name='selectedUserId']").attr("checked",false);
		},
		// 选择用户 追加到右侧
		toRight4User: function(){
			var checkboxes=$("#osModel_step_user_select_organ").find("input[name='userId']:checked");
			if(checkboxes.length==0){
				return;
			}
			var nums='';
			var _ids = []; // 记录已选中的id
			var _type='user';
			var datas=[];
			var msg = '';
			var trs=$("#osModel_step_user_selected").find("input[name='selectedUserId']");
			nums=trs.length;
			if(trs.length > 0){
				trs.each(function(){
					var _value=$(this).val();
					var bothPath=_value.split('|');
					if (bothPath[1] == _type) {
						_ids.push(bothPath[0]);
					}
				});
				_ids=_ids.join(',');
			}
			checkboxes.each(function(){
				var trObj=$(this).closest('tr');
				var userId = $(this).val();
				if(_ids.length>0){
					if (_ids.indexOf(userId)==-1) {
						 _id=$("#osModel_step_user_select_organ").flexGetColumnValue(trObj,['id']);
		         		 _name=$("#osModel_step_user_select_organ").flexGetColumnValue(trObj,['name']);
    					 datas.push(_id+'|'+_type+'|'+_name);
					} else {
						_name=$("#osModel_step_user_select_organ").flexGetColumnValue(trObj,['name']);
						msg = _name+",";
					}
				}else{
					_id=$("#osModel_step_user_select_organ").flexGetColumnValue(trObj,['id']);
	         		_name=$("#osModel_step_user_select_organ").flexGetColumnValue(trObj,['name']);
					datas.push(_id+'|'+_type+'|'+_name);
				}
			});
			if(datas==''){
				$.dialog.notice({title:'操作提示',content:'当前用户已存在！',icon:'warning',time:2});
				return false;
			}else{
				// 添加到右侧已选择的grid中
				for (var t=0; t<datas.length; t++) {
					var i=1;
					var data = datas[t].split('|');
					$('#osModel_step_user_selected').flexExtendData([{
						'id':i++,
						'cell':{
							'startNum':++nums,
							'id3':'<input type="checkbox" name="selectedUserId" value="'+data[0]+'|'+data[1]+'">',
							'id':data[0],
							'name':data[2],
							'organ':'',
							'roleId':''
						}
					}]);
				}
				if (msg!='') {
					$.dialog.notice({title:'操作提示',content:msg+' 用户已存在！',icon:'warning',time:2});
				}
			}
		},
		// 选择角色 追加到右侧
		toRight4Role: function(){
			var checkboxes=$("#osModel_step_Role_select").find("input[name='roleId']:checked");
			if(checkboxes.length==0){
				return;
			}
			var nums='';
			var _ids = []; // 记录已选中的id
			var _type='role';
			var datas=[];
			var msg = '';
			var trs=$("#osModel_step_user_selected").find("input[name='selectedUserId']");
			nums=trs.length;
			if(trs.length > 0){
				trs.each(function(){
					var _value=$(this).val();
					var bothPath=_value.split('|');
					if (bothPath[1] == _type) {
						_ids.push(bothPath[0]);
					}
				});
				_ids=_ids.join(',');
			}
			checkboxes.each(function(){
				var trObj=$(this).closest('tr');
				var userId = $(this).val();
				if(_ids.length>0){
					if (_ids.indexOf(userId)==-1) {
						 _id=$("#osModel_step_Role_select").flexGetColumnValue(trObj,['id']);
		         		 _name=$("#osModel_step_Role_select").flexGetColumnValue(trObj,['name']);
    					 datas.push(_id+'|'+_type+'|'+_name);
					} else {
						_name=$("#osModel_step_Role_select").flexGetColumnValue(trObj,['name']);
						msg = _name+",";
					}
				}else{
					_id=$("#osModel_step_Role_select").flexGetColumnValue(trObj,['id']);
	         		_name=$("#osModel_step_Role_select").flexGetColumnValue(trObj,['name']);
					datas.push(_id+'|'+_type+'|'+_name);
				}
			});
			if(datas==''){
				$.dialog.notice({title:'操作提示',content:'当前角色已存在！',icon:'warning',time:2});
				return false;
			}else{
				// 添加到右侧已选择的grid中
				for (var t=0; t<datas.length; t++) {
					var i=1;
					var data = datas[t].split('|');
					$('#osModel_step_user_selected').flexExtendData([{
						'id':i++,
						'cell':{
							'startNum':++nums,
							'id3':'<input type="checkbox" name="selectedUserId" value="'+data[0]+'|'+data[1]+'">',
							'id':data[0],
							'name':data[2],
							'organ':'',
							'roleId':data[0]
						}
					}]);
				}
				if (msg!='') {
					$.dialog.notice({title:'操作提示',content:msg+' 角色已存在！',icon:'warning',time:2});
				}
			}
		
		},
		// 已选择列表的双击事件方法
		rowDblclick_stepSelected: function(rowData){
			$(rowData).remove();
		},
		// 用户列表双击时间
		rowDblclick_stepSelected_user: function(rowData){
			modelStep.toRight4User();
		},
		// 角色列表单击事件
		rowClick_stepSelected_role: function(rowData){
			// 获取选择的所有角色
			var checkboxes=$("#osModel_step_Role_select").find("input[name='roleId']:checked");
			if(checkboxes.length==0){
				return;
			}
			var roleIds = '';
			for (var i=0; i<checkboxes.length; i++) {
				roleIds += $(checkboxes[i]).val() + ",";
			}
			modelStep.userRoleListSearchKeyWord(roleIds,'');
		},
		// FirstCell（开始紧跟着的节点）的保存事件
		btnSaveStepFirstCell: function(formid,modelid,cell,graph) {
			var selectField='';//表单字段
			var selectFieldPrint='';//表单打印模版
			$('#useRole li :hidden').each(function(i){
				selectField+=$(this).val()+',';
			});
			selectField = selectField.slice(0, -1);
			$('#useRole2 li :hidden').each(function(i){
				selectFieldPrint+=$(this).val()+',';
			});
			selectFieldPrint = selectFieldPrint.slice(0, -1);
				var postData = $("#OsModel_Step_Form_Id").serialize();
	    	postData += "&formid="+formid;
	    	postData += "&modelId="+modelid ;
	    	postData += "&userIds=" ;
	    	postData += "&stepId="+cell.getId() ;
	    	postData += "&selectField="+selectField ;
	    	postData += "&selectFieldPrint="+selectFieldPrint ;
	    	$.post( $.appClient.generateUrl({ESWorkflow : 'saveWfStepInit'}, 'x')
    			,{data:postData}, function(res){
				var json = eval("(" + res + ")") ;
				if(json.success == "true"){
					cell.valueChanged(json.ES_STEP_NAME);
					graph.refresh();
 				    showMsg('保存成功！','1');	
				} else {
					showMsg('保存失败！','2');
				}
			});
		},
		// 一般节点的保存事件
		btnSaveStepNotFirstCell: function(formid,modelid,cell,graph) {
			var userSelected = '';
			var rolesSelected = '';
			// 获取已选择的用户和角色，并区分
			var trs=$("#osModel_step_user_selected").find("input[name='selectedUserId']");
			nums=trs.length;
			if(trs.length > 0){
				trs.each(function(){
					var _value=$(this).val();
					var bothPath=_value.split('|');
					if (bothPath[1] == 'user') {
						userSelected += bothPath[0] + ","; // 为了配合后台的处理...
					} else {
						rolesSelected += "," + bothPath[0];
					}
				});
				rolesSelected = rolesSelected.substring(1);
			} 
			if(userSelected==''&&rolesSelected==''){
				 showMsg('请选择当前步骤的处理人或角色！','2');	
				 return false;
			}
			var selectField='';//表单字段
			var selectFieldPrint='';//表单打印模版
			$('#useRole li :hidden').each(function(i){
				selectField+=$(this).val()+',';
			});
			selectField = selectField.slice(0, -1);
			$('#useRole2 li :hidden').each(function(i){
				selectFieldPrint+=$(this).val()+',';
			});
			selectFieldPrint = selectFieldPrint.slice(0, -1);
				var postData = $("#OsModel_Step_Form_Id").serialize();
	    	postData += "&formid="+formid;
	    	postData += "&modelId="+modelid ;
	    	postData += "&userIds="+userSelected ;
	    	postData += "&roleIds="+rolesSelected ;
	    	postData += "&stepId="+cell.getId() ;
	    	postData += "&selectField="+selectField ;
	    	postData += "&selectFieldPrint="+selectFieldPrint ;
	    	
	    	$.post( $.appClient.generateUrl({ESWorkflow : 'saveWfStepInit'}, 'x')
    			,{data:postData}, function(res){
				var json = eval("(" + res + ")") ;
				if(json.success == "true"){
					cell.valueChanged(json.ES_STEP_NAME);
					graph.refresh();
 				    showMsg('保存成功！','1');	
				} else {
					showMsg('保存失败！','2');
				}
			});
		},
		// organ 设置动作属性中的设置知会人
		stepOrganSelectForActionEvent: function(modelId, actionId) {
			// 显示系统机构树
			$('#wfModelStep_Select_Organ_Tree').show();
			$('#wfModelStep_Select_Role').hide();
			$('#wfModelStep_Select_Tree').attr('selectNodeId','0');
			// 刷新结构树
			var treeObj = $.fn.zTree.getZTreeObj("wfModelStep_Select_Organ_Tree");
			treeObj.refresh();
			//查询所有用户列表
			modelStep.userOrganListSearchKeyWord(1, "");
			// 查询已选择知会人列表
			$("#osModel_step_user_selected").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getNoticeUsersNew'}, 'x'),query:{modelId:modelId,actionId:actionId}, newp:1}).flexReload();
		},
		// role 设置动作属性中的设置知会人
		stepRoleSelectForActionEvent: function(modelId, actionId){
			// 显示角色列表grid
			$('#wfModelStep_Select_Role').show();
			$('#wfModelStep_Select_Organ_Tree').hide();
			$('#wfModelStep_Select_Tree').attr('selectNodeId','0');
			//查询所有角色列表
			$("#osModel_step_Role_select").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getAllRolesNew'}, 'x'),query:{searchKeyword:''}, newp:1}).flexReload();
			//查询所有用户列表
			modelStep.userOrganListSearchKeyWord(1, "");
			// 查询已选择知会人列表
			$("#osModel_step_user_selected").flexOptions({url:$.appClient.generateUrl({ESWorkflow : 'getNoticeUsersNew'}, 'x'),query:{modelId:modelId,actionId:actionId}, newp:1}).flexReload();
		},
		//
		btnSaveAction: function(modelId,cell,graph) {
			var userSelected = '';
			var rolesSelected = '';
			// 获取已选择的用户和角色，并区分
			var trs=$("#osModel_step_user_selected").find("input[name='selectedUserId']");
			nums=trs.length;
			if(trs.length > 0){
				trs.each(function(){
					var _value=$(this).val();
					var bothPath=_value.split('|');
					if (bothPath[1] == 'user') {
						userSelected += "," + bothPath[0];
					} else {
						rolesSelected += "," + bothPath[0];
					}
				});
				userSelected = userSelected.substring(1);
				rolesSelected = rolesSelected.substring(1);
			} 
			
			var selectFun='';//表单字段
			var selectFieldPrint='';//表单打印模版
			$('#useRole li :hidden').each(function(i){
				selectFun+=$(this).val()+',';
			});
			selectFun = selectFun.slice(0, -1);
			var postData = $("#OsModel_Action_Form_Id").serialize();
	    	postData += "&modelId="+modelId ;
	    	postData += "&actionId="+cell.getId() ;
	    	postData += "&stepId="+cell.getTerminal(true).getId() ;
	    	
	    	postData += "&ES_ACTION_SELECTFUNCTION="+selectFun ;
	    	
	    	postData += "&userIds="+userSelected ;
	    	postData += "&roleIds="+rolesSelected ;
	    	if (userSelected!=''||rolesSelected!='') {
	    		$.post( $.appClient.generateUrl({ESWorkflow : 'saveWfActionForNoticeInit'}, 'x')
	    				,{data:postData}, function(res){
					var json = eval("(" + res + ")") ;
					if(!json.success){
						showMsg('设置知会人失败！','2');
						return false;
					}
				});
	    	}
    		postData += "&dataImportPara=" ;
	    	postData += "&updateStatePara=" ;
	    	postData += "&titleAll=" ;
    		$.post( $.appClient.generateUrl({ESWorkflow : 'saveWfActionInit'}, 'x'),{data:postData}, function(res){
				var json = eval("(" + res + ")") ;
				if(json.success == "true"){
					cell.valueChanged(json.ES_ACTION_NAME);
					graph.refresh();
				    showMsg('保存成功！','1');	
				} else {
					showMsg('保存失败！','2');	
					return false;
				}
	    	});
		},
		// 获取条件分支数据
		getConditionsForm: function (type) {
			var cond_string = '';
	    	var count = 0;
			var formObjId = 'esOrganForm'; 
			var condObjId = 'conditionLeft';
	    	if (type == 'right') {
	    		formObjId = 'esFormForm'; 
	    		condObjId = 'conditionRight';
	    	}
	    	var conditionCount = $('#'+condObjId).find('ul').length;
	    	return $('#'+formObjId).serialize() + "&conditionCount="+conditionCount; 
		},
		// 保存分支条件
		saveSplitCondition: function(modelId,formId,cell){
			var check = $('#OsModel_Spit_Wind').attr('currentType');
			var postData = modelStep.getConditionsForm(check)+"&check="+check+"&actionId="+cell.getId()+"&modelId="+modelId+"&stepId="+cell.getTerminal(true).getId()+"&formId="+formId;
			$.post( $.appClient.generateUrl({ESWorkflow : 'saveSplitCondition'}, 'x') ,{data:postData}, function(res){
				var json = eval("(" + res + ")") ;
				if(json.success == "true"){
					showMsg('设置分支条件成功！','1');
				} else {
					showMsg('设置分支条件失败！','2');
				}
			});
			return false;
		},
		// 展示分支条件
		showConditions: function() {
			var fieldList = $('#OsModel_Spit_Wind').attr('fieldList');
			var tempIDs = $('#OsModel_Spit_Wind').attr('tempIDs');
			var rightCondition = $('#OsModel_Spit_Wind').attr('rightCondition');
			var showfieldstr = $('#OsModel_Spit_Wind').attr('showfieldstr');
			// 第一个分支界面已设置的条件自动选择				
			if(fieldList&&fieldList.length>2){
				var condition=fieldList.substring(1,fieldList.length-4);
				var tempConID=tempIDs.substring(1,tempIDs.length-4);
				var strs=condition.split('&|&');
				var idstr=tempConID.split('&|&');
				var j=0;
				for(var i=0;i<strs.length;i++){
					if(j>4) {
						modelStep.addConditionRow('left');
					}
					if(strs[i]&&strs[i].indexOf('(')>-1){
						$('#esOrganForm [name="leftBracketsName'+j+'"]').val(strs[i]);
						i++;
					} else if(strs[i] == ' ') {
						i++;
					}
					$('#esOrganForm [name="fieldName'+j+'"]').val(strs[i]);i++;
					$('#esOrganForm [name="compare'+j+'"]').val(strs[i]);i++;
					$('#esOrganForm [name="inputField'+j+'"]').val(strs[i]);
					$('#esOrganForm [name="hiddenvalue'+j+'"]').val(idstr[i]);i++;
					if(strs[i]&&strs[i].indexOf(')')>-1){
						$('#esOrganForm [name="rightBracketsName'+j+'"]').val(strs[i]);
						i++;
					} else if(strs[i] == ' ') {
						i++;
					}
					if(strs[i]&&$('#esOrganForm [name="relation'+j+'"]')){
						$('#esOrganForm [name="relation'+j+'"]').val(strs[i]);
					}
					j++;
				}
			}
			// 第二个分支界面已设置的条件自动选择				
			if(rightCondition&&rightCondition.length>2){
				var condition=rightCondition.substring(1,rightCondition.length-4);
				var strs=condition.split('&|&');
				var j=0;
				for(var i=0;i<strs.length;i++){
					if(strs[i]&&strs[i].indexOf('(')>-1){
						$('#esFormForm [name="leftBracketsName'+j+'"]').val(strs[i]);i++;
					} else if(strs[i] == ' '){
						i++;
					}
					var count=$('#esFormForm [name="fieldName'+j+'"]').find('option').length;
				    for(var k=0;k<count;k++) {           
				    	if($('#esFormForm [name="fieldName'+j+'"]').find('option')[k].text == strs[i]) {  
				    		$('#esFormForm [name="fieldName'+j+'"]').find('option')[k].selected = true;  
				            break;  
				        }  
				    } 
				    i++;
					$('#esFormForm [name="compare'+j+'"]').val(strs[i]);i++;
					$('#esFormForm [name="hiddenvalue'+j+'"]').val(strs[i]);
					$('#esFormForm [name="inputvalue'+j+'"]').val(strs[i]);i++;
					if(strs[i]&&strs[i].indexOf(')')>-1){
						$('#esFormForm [name="rightBracketsName'+j+'"]').val(strs[i]);i++;
					} else if(strs[i] == ' '){
						i++;
					}
					if(strs[i]&&$('#esFormForm [name="relation'+j+'"]')){
						$('#esFormForm [name="relation'+j+'"]').val(strs[i]);
					}
					j++;
				}
			}	
			
		},
		// 添加行
		addConditionRow: function(type){
			var count = 4;
			var conditionId = 'conditionLeft';
			if (type == 'right') {
				conditionId = 'conditionRight';
			}
			count = parseInt($('#'+conditionId).attr('maxRowNum'));
			var thisObj = $('#'+conditionId+' .add')[count-1];
			
			var newRowNum = count;
			var oldNode = $(thisObj).parent().parent();
			var oldRowNum = $(thisObj).attr('id').substring(9);
			var newNode = oldNode.clone();
			// replace rownum
			$(newNode).find('[name="leftBracketsName'+oldRowNum+'"]').attr('name','leftBracketsName'+newRowNum);
			$(newNode).find('[name="fieldName'+oldRowNum+'"]').attr('name','fieldName'+newRowNum);
			$(newNode).find('[name="compare'+oldRowNum+'"]').attr('name','compare'+newRowNum);
			$(newNode).find('[name="inputField'+oldRowNum+'"]').attr('name','inputField'+newRowNum);
			$(newNode).find('[name="hiddenvalue'+oldRowNum+'"]').attr('name','hiddenvalue'+newRowNum);
			$(newNode).find('[name="rightBracketsName'+oldRowNum+'"]').attr('name','rightBracketsName'+newRowNum);
			$(newNode).find('[name="relation'+oldRowNum+'"]').attr('name','relation'+newRowNum);
			$(newNode).find('#'+conditionId+' #addrowbut'+oldRowNum).attr('id','addrowbut'+newRowNum);
			newNode.appendTo('#'+conditionId);
			newRowNum++;
			$('#'+conditionId).attr('maxRowNum',newRowNum);
		},
		// 删除行
		delConditionRow: function(thisObj,type){
			var conditionId = 'conditionLeft';
			if (type == 'right') {
				conditionId = 'conditionRight';
			}
			if(document.getElementById(conditionId).children.length >1) {
				$(thisObj).parent().parent().remove();
				var count = parseInt($('#'+conditionId).attr('maxRowNum'));
				count--;
				$('#'+conditionId).attr('maxRowNum',count);
			}
		}
} 