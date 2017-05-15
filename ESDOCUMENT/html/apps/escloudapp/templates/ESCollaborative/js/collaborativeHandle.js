var collaborativeHandle = {
	showMsg: function(msg, type){
		if(type == '1'){
			$.dialog.notice({icon : 'succeed',content : msg,title : '3秒后自动关闭',time : 3});
		} else if(type == '2'){
			$.dialog.notice({icon : 'error',content : msg,title : '3秒后自动关闭',time : 3});
		} else {
			$.dialog.notice({icon : 'warning',content : msg,title : '3秒后自动关闭',time : 3});
		}
	},	
	//to待发页面 longjunhao
	toSendFormPage: function(dataId,formId,wfId,userFormNo){
		$.post($.appClient.generateUrl({ESCollaborative : 'getSavedWorkflow'}, 'x')
    			,{id:dataId,formId:formId,wfId:wfId}, function(res){
    				var json = eval('(' + res + ')');
    				if(null != json.message){
    					collaborativeHandle.showMsg(json.message, '3');
    					return ;
    				}
    				collaborativeHandle.realToSendFormPage(json.formId,json.wfModelId,json.actionId,json.actionSize,json.extjs,json.wfId,json.relationBusiness,json.buttons,json.formName,userFormNo,dataId,json.printStepId,'wfSaved',json.oldFileName, json.oldFilePathList,json.comboIDs,json.gridComBoIDs) ;
		});
	},
	realToSendFormPage: function(formId,wfModelId,actionId,actionSize,extjs,wfId,relationBusiness,buttons,formName,userFormNo,dataId,printStepId,wfType,oldFileName, oldFilePathList,comboIDs,gridComBoIDs){
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormStart : 'formStartPage'},'x'),
	        data: {formId:formId, wfModelId:wfModelId, actionId:actionId, actionSize:actionSize, extjs:extjs,dataId:dataId,wfId:wfId,printStepId:printStepId,wfType:wfType, relationBusiness:relationBusiness,userFormNo:userFormNo,oldFileName:oldFileName, oldFilePathList:oldFilePathList,comboIDs:comboIDs,gridComBoIDs:gridComBoIDs},
		    success:function(data){
			    	$.dialog({
			    		id:'formStartDialog',
				    	title:'待发流程['+formName+'-'+userFormNo+']',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:760,
						height:460,
						cancelVal : '关闭',
						cancel : function(){
							Ext.getCmp('formBuilderPanel').destroy();
						},
					    content:data,
					    button:eval('['+buttons+']')
				    });
		    },
		    cache:false
		});
	},
	// 待发的提交
	formSendBeforeSet: function(wfIdentifier, stepId){
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormStart : 'formStartHandlePage'},'x'),
	        data: {wfIdentifier:wfIdentifier, stepId:stepId},
		    success:function(data){
			    	$.dialog({
			    		id:'formStartHandleDialog',
				    	title:'处理',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:400,
						height:100,
					    content:data,
					    okVal : '确定',
						ok : true,
						cancelVal : '关闭',
						cancel : true,
						ok : function() {
							collaborativeHandle.formSend() ;
						}
				    });
		    },
		    cache:false
		});
	},
	// 提交待发
	formSend: function(){
		var selectUsers = document.getElementById('nextStepOwer').name ;
		if(selectUsers == ''){
			collaborativeHandle.showMsg('没有下一步处理人，流程不能提交！', '3');
			return;
		}
		var dataId = $('#formStartPage').attr('dataId');
		var relationBusiness = $('#formStartPage').attr('relationBusiness');
		var postData = $("#"+$("#formBuilderPanel").find("form")[0].id).serialize();
		$.ajax({    
			   type:'POST',
			   url:$.appClient.generateUrl({ESCollaborative : 'startSavedWorkflow'},'x'),
			   data:{postData:postData
				    ,id:$('#formStartPage').attr('dataId')
				    ,wfId:$('#formStartPage').attr('wfId')
				    ,wfModelId:$('#formStartPage').attr('wfmodelid')
				    ,formId:$('#formStartPage').attr('formid')
				    ,actionId:$('#formStartPage').attr('actionid')
				    ,dataList:$('#formStartPage').attr('dataList')
				    ,filePaths:$('#attachFileDataTable').attr('filePaths')
				    ,fileNames:$('#attachFileDataTable').attr('fileNames')
				    ,dataHaveRight:$('#formStartPage').attr('dataHaveRight')
				    ,selectUsers:selectUsers
			   		,condition:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchText').value)
			   		,applyDateCount:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataNumber').value)
			   		,readRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataReadRight').checked)
			   		,downLoadRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataDownLoadRight').checked)
			   		,printRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataPrintRight').checked)
			   		,lendRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataLendRight').checked)
			   },       
		       success :function(res){
    			    var json = eval('(' + res + ')');
    			    if(!json.success){
    			    	collaborativeHandle.showMsg(json.message, 2);
    			    	return;
    			    }
    			    collaborativeHandle.showMsg(json.message, 1);
    			    $("#mylist").flexReload();
    			    art.dialog.list['formStartDialog'].close();
    			    /**wanghongchen 20140806 提交销毁流程时更新销毁单**/
    			    if(relationBusiness == 'destroy'){
    			    	$.ajax({
    			    		url : $.appClient.generateUrl({ESArchiveDestroy : 'destroyWorkflowStart'},'x'),
    			    		type : 'post',
    			    		data : {wfId : dataId},
    			    		success : function(destroyRt){
    			    			if(!destroyRt){
    			    				collaborativeHandle.showMsg("销毁单添加失败", 3);
    			    			}
    			    			if($("#Destroy_list_tbl")){
    			    				$("#Destroy_list_tbl").flexReload();
    			    			}
    			    		}
    			    	});
    			    }
		       },
		       error: function(){
		        	formStartHandle.showMsg('工作流启动失败！', '2');
		        	art.dialog.list['formStartDialog'].close();
		       }
		});
	},
	
	// 待发保存待发的function longjunhao
	saveOldWorkflow : function() {
		// 获取dataList
		var dataList = '';
		$('#borrowDetails').find('input[name="id3"]').each(function(){
			var value = $(this).val();
			dataList += value.split('||')[0] + '|';
		});
		$('#formStartPage').attr('dataList',dataList);
		var postData = $("#" + $("#formBuilderPanel").find("form")[0].id).serialize();// form表单数据组成的字符串，后台需要解析
		var dataId = $('#formStartPage').attr('dataId');
		var relationBusiness = $('#formStartPage').attr('relationBusiness');
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({ESCollaborative : 'saveOldWorkflow'}, 'x'),
			data : {
				postData : postData
				,id : $('#formStartPage').attr('dataId')
//				 ,wfModelId:$('#formStartPage').attr('wfmodelid')
				,formId : $('#formStartPage').attr('formid')
				 ,actionId:$('#formStartPage').attr('actionid')
				,filePaths : $('#formStartPage').attr('filePaths')
				,dataList : $('#formStartPage').attr('dataList')
				,fileNames : $('#formStartPage').attr('fileNames')
				,dataHaveRight : $('#formStartPage').attr('dataHaveRight')
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				collaborativeHandle.showMsg(json.message, json.msgType);
				art.dialog.list['formStartDialog'].close();
				/**wanghongchen 20140806 更新销毁单销毁数量**/
				if(relationBusiness == 'destroy'){
					$.ajax({
						url : $.appClient.generateUrl({ESArchiveDestroy : 'updateDestroyNum'}, 'x'),
						type : 'post',
						data : {oswfFormId:dataId, type:'save'}
					});
				}
			},
			error : function() {
				collaborativeHandle.showMsg('工作流保存失败！', '2');
				art.dialog.list['formStartDialog'].close();
			}
		});

	},
	// 保持待批 longjunhao 20140618
	wfSaveNotExcuteManager:function(wfId,formId,jsFormId) {
		var postData = $("#" + $("#formBuilderPanel").find("form")[0].id).serialize();// form表单数据组成的字符串，后台需要解析
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({ESCollaborative : 'wfSaveNotExcuteManager'}, 'x'),
			data : {
				postData : postData
				,wfId : $('.formStartPage').attr('wfId')
				,formId : $('.formStartPage').attr('formid')
				,filePaths : $('.formStartPage').attr('filePaths')
				,dataList : $('.formStartPage').attr('dataList')
				,fileNames : $('.formStartPage').attr('fileNames')
				,dataHaveRight : $('.formStartPage').attr('dataHaveRight')
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				if (json.success) {
					collaborativeHandle.showMsg('保存待批成功！', '1');
				} else {
					collaborativeHandle.showMsg('保存待批失败！', '2');
				}
				art.dialog.list['formStartDialog'].close();
			},
			error : function() {
				collaborativeHandle.showMsg('工作流保存失败！', '2');
				art.dialog.list['formStartDialog'].close();
			}
		});

	},
	//to已办页面 已废弃 longjunhao 20140911
	toHaveTodoFormPage: function(formId,wfId,stepId,isLast,formName,userFormNo){
		$.post($.appClient.generateUrl({ESCollaborative : 'getHaveTodoWorkflow'}, 'x')
    			,{stepId:stepId,formId:formId,wfId:wfId,isLast:isLast}, function(res){
    				var json = eval('(' + res + ')');
    				if(null != json.message){
    					collaborativeHandle.showMsg(json.message, '3');
    					return ;
    				}
    				collaborativeHandle.realToHaveTodoFormPage(json,userFormNo,'wfSaved') ;
		});
	},
	realToHaveTodoFormPage: function(json,userFormNo,wfType){
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormStart : 'formStartPage'},'x'),
	        data: {formId:json.formId, wfModelId:json.wfModelId, actionId:json.actionId, actionSize:json.actionSize, extjs:json.extjs,wfId:json.wfId, relationBusiness:json.relationBusiness,wfType:wfType,oldFileName:json.oldFileName, oldFilePathList:json.oldFilePathList, stepId:json.stepId,printStepId:json.printStepId},
		    success:function(data){
			    	$.dialog({
			    		id:'formStartDialog',
				    	title:'已办流程['+json.formName+'-'+userFormNo+']',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:760,
						height:460,
						cancelVal : '关闭',
						cancel : function(){
							Ext.getCmp('formBuilderPanel').destroy();
						},
					    content:data,
					    button:eval('['+json.buttons+']')
				    });
		    },
		    cache:false
		});
	},
	// to已发页面
	toHaveSendFormPage: function(formId,wfId,stepId,isLast,formName,userFormNo){
		$.post($.appClient.generateUrl({ESCollaborative : 'getHaveTodoWorkflow'}, 'x')
    			,{stepId:stepId,formId:formId,wfId:wfId,isLast:isLast}, function(res){
    				var json = eval('(' + res + ')');
    				if(null != json.message){
    					collaborativeHandle.showMsg(json.message, '3');
    					return ;
    				}
    				collaborativeHandle.realToHaveSendFormPage(json.dataId, json.userFormNo, json.formId, json.wfModelId, json.formName, json.buttons, json.actionId, json.actionName, json.actionSize, json.wfId, json.stepId, json.isLastStep, json.extjs, json.simpleMsg, json.classicMsg, json.tableMsg, json.isForward, json.isOver, json.isNotice, json.oldFileName, json.oldFilePathList, json.selectPath,json.dataId) ;
		});
	},
	realToHaveSendFormPage: function(dataId, userFormNo, formId, wfModelId, formName, buttons, actionId, actionName, actionSize, wfId, stepId, isLastStep, extjs, simpleMsg, classicMsg, tableMsg, isForward, isOver, isNotice, oldFileName, oldFilePathList, selectPath, firstStepId){
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormStart : 'approvalFormPage'},'x'),
	        data: {dataId:dataId, userFormNo:userFormNo, formId:formId, wfModelId:wfModelId, actionId:actionId, actionName:actionName, actionSize:actionSize, wfId:wfId, stepId:stepId, isLastStep:isLastStep, extjs:extjs, simpleMsg:simpleMsg, classicMsg:classicMsg, tableMsg:tableMsg, isForward:isForward, isOver:isOver, isNotice:isNotice, oldFileName:oldFileName, oldFilePathList:oldFilePathList, selectPath:selectPath, firstStepId:firstStepId},
		    success:function(data){
			    	$.dialog({
			    		id:'approvalFormDialog',
				    	title:'已发流程['+formName+'-'+userFormNo+']',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:760,
						height:460,
						cancelVal : '关闭',
						cancel : function(){
							Ext.getCmp('formBuilderPanel').destroy();
						},
					    content:data,
					    button:eval('['+buttons+']')
				    });
		    },
		    cache:false
		});
	},
	/** 根据选择的类型（待办、待发、已发、已办）,控制按钮的显示 longjunhao */
	controlButton: function(){
		var selectType = $('#mylist').attr('selectType');
		if (selectType == 'send') {//待发
			
		} else if (selectType == 'todo') {//待办
			
		} else if (selectType == 'have_send') {//已发
			// 隐藏数据附件的添加和删除按钮
			$('#addAttachDataBtn').hide();
			$('#deleteAttachDataBtn').hide();
			$('#addAttachFileBtn4Approval').hide();
		} else if (selectType == 'have_todo') {//已办
			// 隐藏数据附件的添加和删除按钮
			$('#addAttachDataBtn').hide();
			$('#deleteAttachDataBtn').hide();
			$('#addAttachFileBtn').hide();
		}
	},
	// 获取数据附件列表 add 20140623
	getSavedWfDataList:function(dataId,formId,wfId,__colModel){
		$("#borrowDetails").flexigrid({
			url: $.appClient.generateUrl({ ESCollaborative: 'getSavedWfDataList', dataId: dataId, formId: formId, wfId: wfId},'x'),
//			url:false,
			editable: true,
			dataType : 'json',
			colModel : __colModel,
			buttons : [],
			singleSelect:true,
			usepager : true,
			useRp : true,
			rp : 20,
			nomsg : "没有数据",
			showTableToggleBtn : false,
			pagetext : '第',
			outof : '页 /共',
			width : 'auto',
			height : 290,
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
		});
		$("#borrowDetails").flexReload();
		// longjunhao 20140731 查询数据附件的dataList
		collaborativeHandle.getAllDataListStr(dataId,formId,wfId);
		
	},
	// 工作流打印表单(工作流表单ID、工作的表单模块id、工作流中的步骤、表单编号)
	workFlowPrint: function(wfId,formId,modelId,stepId,userFormNo){
		var printForm = collaborativeHandle.getPrintForm($("#formBuilderPanel").find("form:first")); // form表单数据组成的字符串，后台需要解析
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({ESCollaborative : 'workFlowPrint'}, 'x'),
			data : {wfId:wfId, formId:formId, modelId:modelId, stepId:stepId, printForm:printForm, userFormNo:userFormNo },
			success : function(res) {
				var json = eval('(' + res + ')');
				var exportUrl = json.exportUrl;
				if(exportUrl == '' || exportUrl == null ){
					collaborativeHandle.showMsg(json.message,'2');
					return;
				} else {
					collaborativeHandle.showMsg(json.message,'1');
				}
			},
			error : function() {
				collaborativeHandle.showMsg('打印失败！', '2');
			}
		});
	},
	// longjunhao 20140911  获取form的字段序列,解决由于form中input为disabled导致不能传值序列化问题
	getPrintForm : function(formObj){
		// 获取disabled的字段
		var disableds = formObj.find(':disabled');
		// 取消disabled属性
		disableds.removeAttr('disabled');
		var strSeri = formObj.serialize();
		// 还原
		disableds.attr('disabled','disabled');
		return strSeri;
	},
	// 模糊检索
	searchKeyword : function () {
		var keyword = $('#searchKeyword').val();
		if (keyword=='请输入关键字') {
			keyword = '';
		}
		var selectType = $('#mylist').attr('selectType');
		var url = $.appClient.generateUrl({ESCollaborative: 'getCollaborativeDataList',parent:selectType,serarchKeyword:keyword},'x');
		$("#mylist").flexOptions({newp: 1, url: url}).flexReload();
	},
	// 添加文件附件到数据库
	addAttachFile2DB : function(fileid, filename,dataId,wfId){
		$.post($.appClient.generateUrl({ESFormStart : 'addWfFile'}, 'x')
			,{firstStepId:dataId,wfID:wfId,filename:filename,fileid:fileid}, function(res){
				if (res == "" || res == null) {
					collaborativeHandle.showMsg('添加数据附件失败！', '2');
				}
		});
	},
	// longjunhao 20140731 查询数据附件的dataList
	getAllDataListStr: function(dataId,formId,wfId) {
		$.post($.appClient.generateUrl({ESCollaborative : 'getAllDataListStr'}, 'x')
			,{dataId:dataId,wfId:wfId,formId:formId}, function(res){
			$('#formStartPage').attr('dataList',res);
		});
	},
	// longjunhao 20140925 删除待发、已发数据，已发只能删除自己发起的且已完成的流程数据
	deleteUserFormData: function() {
		var checkboxs = $('#mylist input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			collaborativeHandle.showMsg('请先选择一条数据，再进行此操作！','3') ;
			return;
		}
		var userFormNo = "";
		var data = "";
		var title = "";
		var start_time = "";
		var wfState = "";
		var columns = ['userFormNo','id','userId','title','start_time','wfState'];
		var canDelCount = 0;
		var flowCount = 0;
		checkboxs.each(function() {
			var colValues = $("#mylist").flexGetColumnValue($(this).closest("tr"),columns);
			var colValuesArray = colValues.split("|");
			if (colValuesArray[5] == '流转') {
				flowCount++;
			} else {
				canDelCount++;
				userFormNo += ',' + colValuesArray[0];
				data += ',' + colValuesArray[1] + ':' + colValuesArray[2];
				title += ',' + colValuesArray[3];
				start_time += ',' + colValuesArray[4];
				wfState += ',' + colValuesArray[5];
			}
		});
		var content = "";
		if (flowCount>0 && canDelCount==0) {
			collaborativeHandle.showMsg('您共选择了'+checkboxlength+'条数据，其中：'+flowCount+'条正在流转，不允许删除。','3') ;
			return;
		} else if (flowCount==0 && canDelCount>0) {
			content = '您共选择了'+checkboxlength+'条数据，其中：'+canDelCount+'条可以删除，是否继续操作？';
		} else if (flowCount>0 && canDelCount>0) {
			content = '您共选择了'+checkboxlength+'条数据，其中：'+flowCount+'条正在流转，'+canDelCount+'条可以删除，是否继续操作？';
		}
		$.dialog({
			content: content,
			ok: function () {
				userFormNo = userFormNo.substring(1);
				data = data.substring(1);
				title = title.substring(1);
				start_time = start_time.substring(1);
				wfState = wfState.substring(1);
				$.post($.appClient.generateUrl({ESCollaborative : 'deleteUserFormData'}, 'x')
						,{data:data,userFormNo:userFormNo,title:title,start_time:start_time,wfState:wfState}, 
					function(res){
						var json = eval('('+res+')');
						if (json && json.success=='true') {
							collaborativeHandle.showMsg(json.msg,json.msgType) ;
							// 刷新
							$("#mylist").flexReload();
						} else {
							collaborativeHandle.showMsg(json.msg,json.msgType) ;
						}
				});
		    },
		    cancelVal: '关闭',
		    cancel: true
		});
	}
};

