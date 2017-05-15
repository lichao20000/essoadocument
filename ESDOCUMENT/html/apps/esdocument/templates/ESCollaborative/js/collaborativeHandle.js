var dataCount = [];
var fileCount = [];
var collaborativeHandle = {
	//待发
	toSendFormPage : function(formUserId,flowId,formId,wfId,stepId,dataId,status,userFormNo) {
		var buttons=[
		             {id:'startForm',name:'提交',callback:function(){collaborativeHandle.formSendBeforeSet(flowId,'-1',stepId);dataCount=[];fileCount=[];return false; }},
		             {id:'saveForm',name:'保存待发',callback:function(){collaborativeHandle.saveOldWorkflow();dataCount=[];fileCount=[];return false; }},
		             {id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();dataCount=[];fileCount=[];return false;}},
		             {id:'wfGraph',name:'查看流程图',callback:function(){collaborativeHandle.myFormModelsshowWorkflowGraph_event();dataCount=[];fileCount=[];return false;}}					 
					];
		if(stepId=="" || stepId==null){
			$.post($.appClient.generateUrl({ESTransferFlow : 'getModelInit'}, 'x'),{modelId:flowId},function(data){
				if(data){
					stepId=data.first_step_id;	
					collaborativeHandle.formStartPage(formUserId,flowId,formId, wfId, stepId, dataId,  '待发流程[' + data.form_relation + '-' + userFormNo + ']',status,userFormNo,buttons);
				}
			},"json");
		}		
	},
	
	// 待发的提交
	formSendBeforeSet : function(flowId,wfId, stepId) {
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'formStartHandlePage'
			}, 'x'),
			data : {
				flowId : flowId,
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
					height : 100,
					content : data,
					okVal : '确定',
					ok : true,
					cancelVal : '关闭',
					cancel : function(){
					},
					init:function(){
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
	
	//选择决策值被修改时 调用方法
	checkAction: function(aId, aName){
		if($('#formStartPage').attr('actionid') != aId){
			$('#formStartPage').attr('actionid', aId) ;
			$('#nextStepOwer').attr('name', '') ;
			$('#nextStepOwer').val('') ;
		}
	},
	
	//获取下一步处理人
	selectWfOwner: function(){
		var formData = collaborativeHandle.getPrintForm($('#formBuilderPanelDiv form:first'));
		var wfId=$('#formStartPage').attr('wfId');
		if($("#mylist").attr("selectType")=="send"){
			wfId="-1";
		}	 
		$.ajax({
		   	  type:'POST',
			  url:$.appClient.generateUrl({ESCollaborative : 'getStepOwner'},'x'),
			  data:{
				  formData : formData,
				  flowId:$('#formStartPage').attr('flowId'),
				  formId:$('#formStartPage').attr('formId'),
				  wfId:wfId,
				  dataId:$('#formStartPage').attr('dataId'),
				  actionId:$('#formStartPage').attr('actionid'),
				  stepId:$('#formStartPage').attr('stepId'),
				  formUserId:$('#formStartPage').attr('formUserId')
			  },
			  success :function(res){
		        	var json = eval('(' + res + ')');		        	
				    var wfModelId = json.wfModelId;  
				    var findNextStep = json.findNextStep;
				    var nextStepOwner = json.nextStepOwner; 
				    if(nextStepOwner == ''){
				    	$.dialog.notice({icon : 'warning',content : '没有找到流程的下一步处理单位部门！' ,title : '3秒后自动关闭',time : 3});
						return false;
				    }
				    collaborativeHandle.selectWfOwnerAction(nextStepOwner,json.userId) ;
				    $('#formStartPage').attr('actionId',json.actionId) ;
	          },error: function(){
	        	  $.dialog.notice({icon : 'error',content : '获取下一步处理单位部门出错！' ,time : 2});
	        	  return false;
	          }
	       });
	},
	
  	//选择处理人确定
  	selectWfOwnerAction: function(nextStepOwner,currentUserId){
  		  $('#nextStepOwners').html(nextStepOwner);
  		  $('#nextStepOwners').attr('currentUserId',currentUserId);
	   	  var $chkarray = $("#nextStepOwners").find("input[name=\'"+currentUserId+"\']");
	   	  var splitStepId = '';
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
	
	// 提交待发
	formSend : function() {
		var selectUsers = "";
		$("#nextStepOwer li").each(function(i) {
			selectUsers = selectUsers + ";" + $(this).attr("name");
		});
		if (selectUsers == '') {
			$.dialog.notice({icon : 'warning',content :'没有下一步处理人，流程不能提交！' ,time : 3});
			return false;
		}
		selectUsers = $("#nextStepOwer").attr("name")+":"+selectUsers.substr(1)+"-";
		var dataId = $('#formStartPage').attr('dataId');
		var relationBusiness = $('#formStartPage').attr('relationBusiness');
		var postData = collaborativeHandle.getPrintForm($("#" + $("#formBuilderPanelDiv").find("form")[0].id));
		$.ajax({	
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'startSavedWorkflow'
			}, 'x'),
			data : {
				postData : postData,
				id : $('#formStartPage').attr('dataId'),
				wfId : $('#formStartPage').attr('wfId'),
				wfModelId : $('#formStartPage').attr('flowId'),
				formId : $('#formStartPage').attr('formId'),
				actionId : $('#formStartPage').attr('actionId'),
				formUserId: $('#formStartPage').attr('formUserId'),
				dataList : $('#formStartPage').attr('dataList'),
				filePaths : $('#attachFileTable').attr('filePaths'),
				fileNames : $('#attachFileTable').attr('fileNames'),
				dataHaveRight : $('#formStartPage').attr(
						'dataHaveRight'),
				selectUsers : selectUsers,
				condition : (document.getElementById('helpSearchText') == undefined ? ""
						: document.getElementById('helpSearchText').value),
				applyDateCount : (document
						.getElementById('helpSearchText') == undefined ? ""
						: document
								.getElementById('helpSearchDataNumber').value),
				readRight : (document.getElementById('helpSearchText') == undefined ? ""
						: document
								.getElementById('helpSearchDataReadRight').checked),
				downLoadRight : (document
						.getElementById('helpSearchText') == undefined ? ""
						: document
								.getElementById('helpSearchDataDownLoadRight').checked),
				printRight : (document.getElementById('helpSearchText') == undefined ? ""
						: document
								.getElementById('helpSearchDataPrintRight').checked),
				lendRight : (document.getElementById('helpSearchText') == undefined ? ""
						: document
								.getElementById('helpSearchDataLendRight').checked)
			},
			success : function(res) {
				var json = eval('(' + res + ')');	
				if (!json.success) {
					$.dialog.notice({icon : 'error',content :json.message ,title : '3秒后自动关闭',time : 3});
					return false;
				}
				$.dialog.notice({icon : 'success',content :json.message ,time : 1});
				$("#mylist").flexReload();
				art.dialog.list['formStartPageDialog'].close();						
			},
			error : function() {
				$.dialog.notice({icon : 'error',content :'工作流启动失败！',title : '3秒后自动关闭',time : 3});
				art.dialog.list['formStartPageDialog'].close();
			}
		});
	},

	formStart: function(){
		var selectUsers = "";
		$("#nextStepOwer li").each(function(i) {
			selectUsers = selectUsers + ";" + $(this).attr("name");
		});
		if (selectUsers == '') {
			$.dialog.notice({icon : 'warning',content :'没有下一步处理人，流程不能提交！' ,time : 3});
			return false;
		}
		selectUsers = $("#nextStepOwer").attr("name")+":"+selectUsers.substr(1)+"-";
		var postData =collaborativeHandle.getPrintForm($("#" + $("#formBuilderPanelDiv").find("form")[0].id));
		$.ajax({    
			   type:'POST',
			   url:$.appClient.generateUrl({ESCollaborative : 'startWorkflow'},'x'),
			   data:{postData:postData
				    ,flowId:$('#formStartPage').attr('flowId')
				    ,formId:$('#formStartPage').attr('formId')
				    ,actionId:$('#formStartPage').attr('actionId')
				    ,dataId:$('#formStartPage').attr('dataId')
				    ,dataList:$('#formStartPage').attr('dataList')
				    ,filePaths:$('#attachFileTable').attr('filePaths')
				    ,fileNames:$('#attachFileTable').attr('fileNames')
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
    			    $.dialog.notice({icon : 'success',content :json.message,title : '3秒后自动关闭',time : 3});
    			    if(json.success){    			    					
    			    }else{
	    			    if(art.dialog.list['formStartPageDialog']){
	    			    	art.dialog.list['formStartPageDialog'].close();
	    			    }
    			    }
		       },
		       error: function(){
		    	   $.dialog.notice({icon : 'error',content :'工作流启动失败！',title : '3秒后自动关闭',time : 3});
		    	   art.dialog.list['formStartPageDialog'].close();
		       }
		});
	},
	
	// 待发保存待发
	saveOldWorkflow : function() {
		var postData =collaborativeHandle.getPrintForm($("#" + $("#formBuilderPanelDiv").find("form")[0].id));// form表单数据组成的字符串，后台需要解析
		var dataId = $('#formStartPage').attr('dataId');
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'saveOldWorkflow'
			}, 'x'),
			data : {
				postData : postData,
				id : $('#formStartPage').attr('dataId'),
				formId : $('#formStartPage').attr('formId'),
				flowId : $('#formStartPage').attr('flowId')
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				$.dialog.notice({icon : json.msgType,content :json.message,title : '3秒后自动关闭',time : 3});
				art.dialog.list['formStartPageDialog'].close();				
			},
			error : function() {
				$.dialog.notice({icon : 'error',content :'工作流保存失败！' ,title : '2秒后自动关闭',time : 2});
				art.dialog.list['formStartPageDialog'].close();
			}
		});

	},
	
	// 保持待批
	wfSaveNotExcuteManager : function(wfId, formId, jsFormId) {
		var postData = collaborativeHandle.getPrintForm($("#" + $("#formBuilderPanelDiv").find("form")[0].id));// form表单数据组成的字符串，后台需要解析
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'wfSaveNotExcuteManager'
			}, 'x'),
			data : {
				postData : postData,
				wfId : $('.formStartPage').attr('wfId'),
				formId : $('.formStartPage').attr('formid'),
				filePaths : $('.formStartPage').attr('filePaths'),
				dataList : $('.formStartPage').attr('dataList'),
				fileNames : $('.formStartPage').attr('fileNames'),
				dataHaveRight : $('.formStartPage').attr('dataHaveRight')
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				if (json.success) {
					$.dialog.notice({icon : json.msgType,content :'保存待批成功！',time : 1});
				} else {
					$.dialog.notice({icon : json.msgType,content :'保存待批失败！',time : 2});
				}
				art.dialog.list['formStartPageDialog'].close();
			},
			error : function() {
				$.dialog.notice({icon : json.msgType,content :'工作流保存失败！',time : 3});
				art.dialog.list['formStartPageDialog'].close();
			}
		});

	},
	
	// 已办页面 
	toHaveTodoFormPage : function(formUserId,flowId,formId, wfId, stepId, dataId, isLast, title, status, userFormNo) {
		var buttons=[
						//{id:'forwardTodo',name:'转发',callback:function(){collaborativeHandle.formForward(flowId,wfId,formUserId);return false;}},
						{id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();return false;}},
						{id:'wfGraph',name:'查看流程图',callback:function(){collaborativeHandle.myFormModelsshowWorkflowGraph_event();return false;}}
					];
		$.post($.appClient.generateUrl({ESTransferFlow : 'getModelInit'}, 'x'),{modelId:flowId},function(data){
			if(data){			
				collaborativeHandle.formStartPage(formUserId,flowId,formId, wfId, stepId, dataId,  '已办流程[' + data.form_relation + '-' + userFormNo + ']',status,userFormNo,buttons);
			}
		},"json");		
	},

	// 已发页面
	toHaveSendFormPage : function(formUserId,flowId,formId, wfId, stepId, dataId, isLast, title, status, userFormNo) {
		var buttons=[
						{id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();return false;}},
						{id:'wfGraph',name:'查看流程图',callback:function(){collaborativeHandle.myFormModelsshowWorkflowGraph_event();return false;}}
					];
		if(stepId=="" || stepId==null){
			$.post($.appClient.generateUrl({ESTransferFlow : 'getModelInit'}, 'x'),{modelId:flowId},function(data){
				if(data){
					stepId=data.first_step_id;	
					collaborativeHandle.formStartPage(formUserId,flowId,formId, wfId, stepId, dataId,  '已发流程[' + data.form_relation + '-' + userFormNo + ']',status,userFormNo,buttons);
				}
			},"json");
		}		
	},
	
	// 根据选择的类型（待办、待发、已发、已办）
	controlButton : function() {
		var selectType = $('#mylist').attr('selectType');
		if (selectType == 'send') {// 待发

		} else if (selectType == 'todo') {// 待办

		} else if (selectType == 'have_send') {// 已发
			// 隐藏数据附件的添加和删除按钮
			$('#addAttachDataBtn').hide();
			$('#deleteAttachDataBtn').hide();
			$('#addAttachFileBtn').hide();
			$('#deleteAttachFileBtn').hide();
		} else if (selectType == 'have_todo') {// 已办
			// 隐藏数据附件的添加和删除按钮
			$('#addAttachDataBtn').hide();
			$('#deleteAttachDataBtn').hide();
			$('#addAttachFileBtn').hide();
			$('#deleteAttachFileBtn').hide();
		}
	},
	
	//打印事件
	myFormModelsPrint_event: function() {
		var wfId = $('.formStartPage').attr('flowId');
		var formId = $('.formStartPage').attr('formId');
		var stepId = $('.formStartPage').attr('stepId');
		var userFormNo = $('.formStartPage').attr('userFormNo');
		collaborativeHandle.workFlowPrint(wfId,formId,stepId,userFormNo);
	},
	
	// 工作流打印表单(工作流表单ID、工作的表单模块id、工作流中的步骤、表单编号)
	workFlowPrint : function(wfId, formId, stepId, userFormNo) {
		var printForm = collaborativeHandle.getPrintForm($("#formBuilderPanelDiv")
				.find("form:first")); // form表单数据组成的字符串，后台需要解析
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({
				ESCollaborative : 'workFlowPrint'
			}, 'x'),
			data : {
				wfId : wfId,
				formId : formId,
				stepId : stepId,
				printForm : printForm,
				userFormNo : userFormNo
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				if (json.exportUrl == '' || json.success == false) {
					$.dialog.notice({icon : 'warning',content : json.message ,title : '3秒后自动关闭',time : 3});
					return false;
				} else {
					$.dialog.notice({icon : 'success',content : json.message ,title : '3秒后自动关闭',time : 3});
				}
			},
			error : function() {
				$.dialog.notice({icon : 'error',content : '打印失败！',title : '3秒后自动关闭',time : 3});
				return false;
			}
		});
	},
	
	// 获取form的字段序列，过滤获取disabled属性标签
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

	// 根据收集范围筛选
	filterUserFormData : function() {
		$.ajax({
			url : $.appClient.generateUrl({
				ESCollaborative : 'filter'
			}, 'x'),
			success : function(data) {
				dia2 = $.dialog({
					title : '筛选数据',
					width : '500px',
					fixed : true,
					resize : false,
					padding : 0,
					content : data,
					cancelVal : '关闭',
					cancel : true,
					okVal : '筛选',
					ok : true,
					ok : function() {
						var stageIds = $("#stageId").val();
						var selectType = $('#mylist').attr('selectType');
						var url = $.appClient.generateUrl({
							ESCollaborative : 'getCollaborativeDataList',
							parent : selectType,
							stageIds : stageIds
						}, 'x');
						$("#mylist").flexOptions({
							newp : 1,
							url : url
						}).flexReload();
					},
					cancel : function() {
					}
				});
			},
			cache : false
		});
	},

	// 删除
	deleteUserFormData : function() {
		var checkboxs = $('#mylist input:checked');
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请先选择一条数据，再进行此操作！',title : '3秒后自动关闭',time : 3});
			return false;
		}
		var userFormNo = "";
		var data = "";
		var title = "";
		var start_time = "";
		var wfState = "";
		var columns = [ 'userFormNo', 'id', 'userId', 'title', 'start_time',
				'wfState' ];
		var canDelCount = 0;
		var flowCount = 0;
		checkboxs.each(function() {
			var colValues = $("#mylist").flexGetColumnValue(
					$(this).closest("tr"), columns);
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
		if (flowCount > 0 && canDelCount == 0) {
			$.dialog.notice({icon : 'success',content : '您共选择了' + checkboxlength + '条数据，其中：'
				+ flowCount + '条正在流转，不允许删除。',title : '3秒后自动关闭',time : 3});
			return false;
		} else if (flowCount == 0 && canDelCount > 0) {
			content = '您共选择了' + checkboxlength + '条数据，其中：' + canDelCount
					+ '条可以删除，是否继续操作？';
		} else if (flowCount > 0 && canDelCount > 0) {
			content = '您共选择了' + checkboxlength + '条数据，其中：' + flowCount
					+ '条正在流转，' + canDelCount + '条可以删除，是否继续操作？';
		}
		$.dialog({
			content : content,
			ok : function() {
				userFormNo = userFormNo.substring(1);
				data = data.substring(1);
				title = title.substring(1);
				start_time = start_time.substring(1);
				wfState = wfState.substring(1);
				$.post($.appClient.generateUrl({
					ESCollaborative : 'deleteUserFormData'
				}, 'x'), {
					data : data,
					userFormNo : userFormNo,
					title : title,
					start_time : start_time,
					wfState : wfState
				}, function(res) {
					var json = eval('(' + res + ')');
					if (json && json.success == 'true') {
						$.dialog.notice({icon : 'success',content : json.msg,title : '3秒后自动关闭',time : 3});
						// 刷新
						$("#mylist").flexReload();
					} else {
						$.dialog.notice({icon : 'error',content : json.msg,title : '3秒后自动关闭',time : 3});
					}
				});
			},
			cancelVal : '关闭',
			cancel : true
		});
	},

	// 待办页面
	toTodoFormPage : function(formUserId,flowId,formId, wfId, stepId, dataId,status,title,userFormNo,workFlowType,isLast,processTime) {
		var buttons=[];
		if(workFlowType=="4"||workFlowType=="5"){
			buttons.push({id:'startForm',name:'已阅',callback:function(){collaborativeHandle.formApprovalBeforeSet(flowId,stepId,workFlowType,processTime);return false;}});
		}else{
			buttons.push({id:'handleTodo',name:'处理',callback:function(){collaborativeHandle.formApprovalBeforeSet(flowId,stepId,workFlowType,processTime);return false;}});
		}
		buttons.push({id:'forwardTodo',name:'转发',callback:function(){collaborativeHandle.formForward(flowId,wfId,formUserId);return false;}});
		if(workFlowType=="4"||workFlowType=="5"){
			buttons.push({id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();return false;}});
		}
		if(stepId=="" && isLast=="1"){
			buttons=[];
			buttons.push({id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();return false;}});
		}
		buttons.push({id:'wfGraph',name:'查看流程图',callback:function(){collaborativeHandle.myFormModelsshowWorkflowGraph_event();return false;}});
		
		collaborativeHandle.approvalForm(formUserId,flowId,formId, wfId, stepId, dataId,status,title,userFormNo,workFlowType,isLast,buttons);		
	},

	// 表单处理页
	formStartPage : function(formUserId,flowId,formId, wfId, stepId, dataId, title,status,userFormNo,buttons) {
		var url = $.appClient.generateUrl({
			ESCollaborative : 'formStartPage'
		}, 'x');
		$.post(url, {		
			flowId : flowId,
			formId : formId,			
			wfId : wfId,
			stepId : stepId,
			dataId : dataId,
			status : status,
			userFormNo : userFormNo,
			formUserId : formUserId
		}, function(data) {
			$.dialog({
				id : 'formStartPageDialog',
				title : title,
				modal : true,
				fixed : false,
				stack : true,
				resize : false,
				lock : true,
				opacity : 0.1,
				padding : '0px',
				width : 760,
				height : 460,
				cancelVal : '关闭',
				cancel : function() {
					var selectType = $('#mylist').attr('selectType');
					if (selectType == 'send') {//待发
						//删除当前添加的附件
						if(dataCount.length>0 && dataCount!=null && dataCount!=[] ){
							collaborativeHandle.deleteAttachDataPageForCancel(dataCount,"data");
						}
						if(fileCount.length>0 && fileCount!=null && fileCount!=[] ){
							collaborativeHandle.deleteAttachDataPageForCancel(fileCount,"file");
						}
						dataCount=[];//删除后还原
						fileCount=[];//删除后还原
					}
					art.dialog.list['formStartPageDialog'].close();
				},
				content : data,
				init:function(){
					collaborativeHandle.controlButton();
				},
				button : buttons
			});
		});
	},
		
	approvalForm: function(formUserId,flowId,formId, wfId, stepId, dataId,status,title,userFormNo,workFlowType,isLast,buttons){
	    if (workFlowType=='5') {
	    	collaborativeHandle.formStartPage(formUserId,flowId,formId, wfId, stepId, dataId, "待办："+title,status,userFormNo,buttons);
	    	return false;
	    }
		$.ajax({
			type:'POST',
    		url:$.appClient.generateUrl({ESCollaborative : 'wfIsApprovaled'}, 'x'),
    		data:{flowId:flowId,wfId:wfId,stepId:stepId},
    		success:function(res){       
    			var json = eval('(' + res + ')');   
    			var state = json.state;
    			if(state=='over'){
    				$.dialog.notice({icon : 'error',content : '此流程已经审批过！',title : '3秒后自动关闭',time : 3});
			   		return false;
    			}
    			var firstStepId = json.firstStepId;   
    			collaborativeHandle.formStartPage(formUserId,flowId,formId, wfId, stepId, dataId, "待办："+title,status,userFormNo,buttons);
    		}
		});
	},
	
	//待办已阅或处理
	formApprovalBeforeSet: function(flowId, stepId,workFlowType,processTime){
		var wfId = $('.formStartPage').attr('wfId');
		var isNotice=(workFlowType=="4")?"true":"false";
		var isForward=(workFlowType=="5")?"true":"false";
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESCollaborative : 'formApprovalHandlePage'},'x'),
	        data: {wfId:wfId,flowId:flowId, stepId:stepId,isNotice:isNotice, isForward:isForward},
		    success:function(data){
			    	$.dialog({
			    		id:'formApprovalHandleDialog',
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
					    init:function(){
							collaborativeHandle.selectWfOwner();
						},
						button:[{name:'上传附件',callback:function(){collaborativeHandle.createMsgFileUploadWin("opinion");return false ;}},
						        {name:'确定',callback:function(){collaborativeHandle.formApproval(isNotice,isForward);return false ;}},
						        {name:'关闭',callback:function(){}}]
				    });
		    },
		    cache:false
		});
	},
	
	//审批
	formApproval: function(isNotice,isForward){
  		if(isForward == 'true'){
  			/** 转发审批 **/
  			var msgText = $('#msgTextArea').val() ;
			if(typeof msgText == "undefined" || msgText == ""){
				$('#msgTextArea').css('border','1px solid red') ;
				$.dialog.notice({icon : 'warning',content : '意见内容不能为空；请填写完审批意见后，再进行此操作！',title : '3秒后自动关闭',time : 3});
				return false;
			}
			$.ajax({
		    	  type:'POST',
		          url : $.appClient.generateUrl({ESCollaborative : 'commit_opinion'},'x') ,
			      data:{wfModelId:$('#formStartPage').attr('flowId'),
			    	  	actionId:$('#formStartPage').attr('actionId'),
			    	  	opinionStr:msgText,
			    	  	fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
			    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths'),
			    	  	wfId:$('#formStartPage').attr('wfId'),
			    	  	stepId:"-5",
			    	  	formId:$('#formStartPage').attr('formId'),
			    	  	dataId:$('#formStartPage').attr('dataId'),
			    	  	userFormId:$('#formStartPage').attr('formUserId'),			    	  	
			    	  	userFormActionName:$('#formStartPage').attr('actionName')},
		          success:function(res){}
		    });
			$.ajax({
	 			type:'POST',
	          	url:$.appClient.generateUrl({ESCollaborative : 'wfForwardAction'},'x'),
		        data:{wfId:$('#formStartPage').attr('wfId'),
		        		formId:$('#formStartPage').attr('formId'),
		        		userFormID:$('#formStartPage').attr('dataId')},
	          	success:function(res){
				   	var json = eval('(' + res + ')');
				   	if(json.success){
				   		$.dialog.notice({icon : 'success',content : '转发处理成功！',time : 1});	
	    				if ($("#mylist").attr("selectType") == "todo") {
	    					$("#mylist").flexReload();
	    				}
				   		// 刷新首页
	    				collaborativeHandle.refreshHomePageToDo();
				   	}else{
				   		$.dialog.notice({icon : 'error',content : '转发处理失败！',title : '3秒后自动关闭',time : 3});				   		
				   	}
				   	art.dialog.list['formApprovalHandleDialog'].close() ;
				   	art.dialog.list['formStartPageDialog'].close() ;    				
				}
			});
  			return ;
  		}
  		if(isNotice == 'true'){
  			/** 知会审批 **/
  			var msgText = $('#msgTextArea').val() ;
  			$.ajax({
		    	  type:'POST',
		          url : $.appClient.generateUrl({ESCollaborative : 'commit_opinion'},'x') ,
			      data:{wfModelId:$('#formStartPage').attr('flowId'),
			    	  	actionId:$('#formStartPage').attr('actionId'),
			    	  	opinionStr:msgText,
			    	  	fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
			    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths'),
			    	  	wfId:$('#formStartPage').attr('wfId'),
			    	  	stepId:'10000',
			    	  	formId:$('#formStartPage').attr('formId'),
			    	  	dataId:$('#formStartPage').attr('dataId'),
			    	  	userFormId:$('#formStartPage').attr('formUserId'),	
			    	  	userFormActionName:$('#formStartPage').attr('actionName')},
		          success:function(res){}
		    });
  			$.ajax({
	 			type:'POST',
	 			url:$.appClient.generateUrl({ESCollaborative : 'WfNoticeAction'},'x'),
    			data:{
    				wfId:$('#formStartPage').attr('wfId'),
    				formId:$('#formStartPage').attr('formId'),
    				flowId:$('#formStartPage').attr('flowId'),
    				opinionValue:msgText},
    			success:function callback(text) {
    				$.dialog.notice({icon : 'success',content : '知会处理成功！',time : 1});		
    				// 判断是否在我的待办中审批
    				if ($("#mylist").attr("selectType") == "todo") {
    					$("#mylist").flexReload();
    				}
    				// 刷新首页
    				collaborativeHandle.refreshHomePageToDo();
    				art.dialog.list['formApprovalHandleDialog'].close() ;
				   	art.dialog.list['formStartPageDialog'].close() ; 
	   			}
			});
  			return ;
  		}
  		var wfId=$('#formStartPage').attr('wfId');
		$.ajax({
				type:'POST',
	    		url : $.appClient.generateUrl({ESCollaborative : 'isApprovalOver'},'x') ,   
	    		data : {wfId:$('#formStartPage').attr('wfId'),
	    				stepId:$('#formStartPage').attr('stepId')},       
	    		success : function(res){
	    			var json = eval('(' + res + ')');
	    			var state = json.state;
	    			if(state!=null && state=='over'){
	    				$.dialog.notice({icon : 'warning',content : '此流程已经审批过！',title : '3秒后自动关闭',time : 3});
	    				art.dialog.list['formApprovalHandleDialog'].close() ;
					   	art.dialog.list['formStartPageDialog'].close() ;
	    				return false;
	    			}
			       	var msgText = $('#msgTextArea').val() ;
					if(typeof msgText == "undefined" || msgText == ""){
						$('#msgTextArea').css('border','1px solid red') ;
						$.dialog.notice({icon : 'warning',content : '意见内容不能为空；请填写完审批意见后，再进行此操作！',title : '3秒后自动关闭',time : 3});
						return false;
					}
					var selectUsers = "";
					$("#nextStepOwer li").each(function(i) {
						selectUsers = selectUsers + ";" + $(this).attr("name");
					});						
					if(selectUsers!=''){
						selectUsers = $("#nextStepOwer").attr("name")+":"+selectUsers.substr(1)+"-";
					}
					if($('#formStartPage').attr('isLastStep')=='false' && selectUsers == ''){						
						$.dialog.notice({icon : 'warning',content : '请您先选择下一步处理人，再进行此操作！',title : '3秒后自动关闭',time : 3});
						return false;
					}
				    $.ajax({
				    	  type:'POST',
				          url : $.appClient.generateUrl({ESCollaborative : 'commit_opinion'},'x') ,
					      data:{wfModelId:$('#formStartPage').attr('flowId'),
					    	  	actionId:$('#formStartPage').attr('actionId'),
					    	  	opinionStr:msgText,
					    	  	fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
					    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths'),
					    	  	wfId:$('#formStartPage').attr('wfId'),
					    	  	stepId:$('#formStartPage').attr('stepId'),
					    	  	formId:$('#formStartPage').attr('formId'),
					    	  	dataId:$('#formStartPage').attr('dataId'),
					    	  	userFormId:$('#formStartPage').attr('formUserId'),
					    	  	userFormActionName:$('#formStartPage').attr('actionName')},
				          success:function(res){}
				    });				
					var postData = collaborativeHandle.getPrintForm($("#" + $("#formBuilderPanelDiv").find("form")[0].id));
					var wfId = $('#formStartPage').attr('wfId');
					$.ajax({
							type:'POST',
							url : $.appClient.generateUrl({ESCollaborative : 'auditingWorkflow'},'x') ,
					    	data:{
					    		postData:postData,
					    		flowId:$('#formStartPage').attr('flowId'),
					    		wfId:$('#formStartPage').attr('wfId'),
					    		stepId:$('#formStartPage').attr('stepId'),
					    		actionId:$('#formStartPage').attr('actionId'),
					    		formId:$('#formStartPage').attr('formId'),
					    		dataId:$('#formStartPage').attr('dataId'),
					    		userFormId:$('#formStartPage').attr('formUserId'),
					    		selectUsers:selectUsers
					    	},       
					        success :function(res){
			      		  		var json = eval('(' + res + ')');
			      		  		if(json.success){				      		  		
				    				if ($("#mylist").attr("selectType") == "todo") {
				    					$("#mylist").flexReload();
				    				}
				    				$.dialog.notice({icon : 'success',content : '审批成功！',time : 1});
				    				art.dialog.list['formApprovalHandleDialog'].close() ;
								   	art.dialog.list['formStartPageDialog'].close() ;
				    				// 刷新首页
								   	collaborativeHandle.refreshHomePageToDo();
			      		  		} else {
			      		  			$.dialog.notice({icon : 'error',content : '审批失败！',title : '3秒后自动关闭',time : 3});
				      		  		art.dialog.list['formApprovalHandleDialog'].close() ;
								   	art.dialog.list['formStartPageDialog'].close() ;
			      		  		}
					      	}	
					});
	    		}
		});
	},
	
	// 刷新首页的我的待办
	refreshHomePageToDo : function() {
		//我的待办
		$.post(
				$.appClient.generateUrl({ESCollaborative:'listWorkFlowToDo'},'x'),
				{page: 1, rp: 6},
				function (htm){
					$('#preTaskListsContainer').html(htm);
				}
			);

		//左侧导航的counter
		$.post(
				$.appClient.generateUrl({ESCollaborative:'listWorkFlowAll'},'x'),
				function (htm){
					var count = parseInt(htm,10);
					if(count>0){
						$('#preTasksCounter').text(htm);
						$('#preTasksCounter').css("display","block");
					}else if(count==0)
						$('#preTasksCounter').css("display","none");
				}
			);
	},
	
	//选择决策值被修改时 调用方法
	checkActionForm: function(aId, aName){
		if($('#formStartPage').attr('actionId') != aId){
			$('#formStartPage').attr('actionId', aId) ;
			$('#formStartPage').attr('actionName', aName) ;
			$('#nextStepOwer').attr('name', '') ;
			$('#nextStepOwer').val('') ;
			if(aId>100000){
				$('#formStartPage').attr('isLastStep', 'true') ;
				if($('#formStartPage').attr('isLastStep') == 'true'){
					document.getElementById('selectNextApprovalUsers').style.display = 'none' ;
				} else {
					document.getElementById('selectNextApprovalUsers').style.display = '' ;
				}
			} else {
				$.ajax({
					type:'POST',
					url:$.appClient.generateUrl({ESCollaborative : 'isLastStep'},'x'), 
					data:{flowId:$('#formStartPage').attr('flowId'),actionId:aId},   		  
				  	success :function(res){
			        	var json = eval('(' + res + ')');
						var isLastStep = json.isLastStep;
						$('#formStartPage').attr('isLastStep', isLastStep) ;
						if(isLastStep == 'true'){
							document.getElementById('selectNextApprovalUsers').style.display = 'none' ;
						} else {
							document.getElementById('selectNextApprovalUsers').style.display = '' ;
						}
					}
				});
			}
		}
	},
	
	//意见框样式
	addInitMsg: function(msg){ 
		$('#msgTextArea').val(msg) ;
		$('#msgTextArea').css('border','1px solid #E2E3EA') ;
	},
	
	//意见框为空样式修改
	changeCurrFieldStyle: function(src){
		if(src.getAttribute('allowBlank') == 'true'){return ;} 
		if(src.value && src.value.length > 0){ 
			src.style.border = '1px solid #E2E3EA';
		}else{
			src.style.border = '1px solid red';
		} 
	},
	
	formForward: function(flowId,wfId, userFormId){
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESCollaborative : 'formForwardPage'},'x'),
	        data: {wfId:wfId, userFormId:userFormId},
		    success:function(data){
			    	$.dialog({
			    		id:'formForwardSetDialog',
				    	title:'设置接收者',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:500,
					    content:data,
					    button:[{name:'上传附件',callback:function(){collaborativeHandle.createMsgFileUploadWin("opinion");return false ;}},
						        {name:'转发',callback:function(){collaborativeHandle.formForwardAction();return false ;}},
						        {name:'关闭',callback:function(){}}]
				    });
		    },
		    cache:false
		});
	},
	
	formForwardAction: function(){
		var userIds = $("#forwardToUsersDiv").attr('userIds');
		if(userIds == ''){
			$.dialog.notice({icon : 'warning',content : '请您先设置待转发人员，再进行此操作！',title : '3秒后自动关闭',time : 3});
			return false;
		}
		var msgText = $('#msgTextArea').val() ;
		if(typeof msgText == "undefined" || msgText == ""){
			$('#msgTextArea').css('border','1px solid red') ;
			$.dialog.notice({icon : 'warning',content : '意见内容不能为空；请填写完审批意见后，再进行此操作！',title : '3秒后自动关闭',time : 3});
			return false;
		}
		userIds = userIds.substring(1, userIds.length-1) ;
		$.ajax({
	    	  type:'POST',
	          url : $.appClient.generateUrl({ESCollaborative : 'excuteWfForward'},'x') ,
		      data:{userIds:userIds,
		    	  	wfId:$('#formStartPage').attr('wfId'),
		    	  	userFormId:$('#formStartPage').attr('formUserId'),
		    	  	dataId:$('#formStartPage').attr('dataId'),
		    	  	stepId:$('formStartPage').attr('stepId'),
		    	  	opinionStr:msgText,
	    	  		fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
		    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths')
		    	  	},
	          success:function(res){
	        	  if(res == 'true'){
	        		  $.dialog.notice({icon : 'success',content : '转发操作成功！',title : '3秒后自动关闭',time : 3});
	        		  art.dialog.list['formForwardSetDialog'].close();
	        		  art.dialog.list['formStartPageDialog'].close();
	        	  } else {
	        		  $.dialog.notice({icon : 'error',content : '转发操作失败！',title : '3秒后自动关闭',time : 3});
	      			return false;
	        	  }
	          }
	    });
	},
	
	//文件附件上传页面
	createMsgFileUploadWin: function(type){		
		$("#formStartPage").attr("fileUploadType",type);
		$.dialog({
			title:'上传文件',
    		width: '450px',
    	   	height: '250px',
    	    fixed:true,
    	    resize: false,
    		content:"<div id='contentForAttachFile'><div class='fieldset flash' id='fsUploadProgressForAttachFile'></div></div>",
    		cancelVal: '关闭',
    		cancel: true,
    		padding: '10px',
			button: [
	    		{id:'btnAddForAttachFile', name: '添加文件'},
	            {id:'btnCancelForAttachFile', name: '删除所有', disabled: true},
	            {id:'btnStartForAttachFile', name: '开始上传', disabled: true, callback: function(){return false;}}
			],
			init:collaborativeHandle.createSWFUpload
    	});	 
	},
	createSWFUpload: function(){
		var tplPath = $('.formStartPage').attr('tplPath') ;
		var files = [];
		var upload = new SWFUpload({
			//提交路径
			upload_url: "",
			file_post_name: "file.txt",		
			file_size_limit : "1048576",
			file_types : "*.*",
			file_types_description : "所有文件",
			file_upload_limit : "0",
			file_queue_limit : "0",

			// 事件处理
			swfupload_loaded_handler : swfuploadLoaded,
			file_dialog_start_handler : fileDialogStart,
			file_queued_handler : fileQueued,
			file_queue_error_handler : fileQueueError,
			file_dialog_complete_handler : fileDialogComplete,
			upload_start_handler : uploadStart,
			upload_progress_handler : uploadProgress,
			upload_error_handler : uploadError,
			upload_success_handler : uploadSuccess,
			upload_complete_handler : uploadComplete,

			// 按钮的处理
			button_image_url : tplPath+"/public/SWFUpload/img/ButtonUpload72.png",
			button_placeholder_id : "btnAddForAttachFile",
			button_width: 72,
			button_height: 28,
			
			// Flash文件地址设置
			flash_url : tplPath+"/public/SWFUpload/js/swfupload.swf",
			
			custom_settings : {
				progressTarget : "fsUploadProgressForAttachFile",
				cancelButtonId : "btnCancelForAttachFile",
				startButtonId : "btnStartForAttachFile",
				// 上传成功的回调函数
				uploadSuccess : function(file, data, remainder){
					var f = $.parseJSON(data);
					var extName = file.name.substr(file.name.lastIndexOf(".")+1);
					extendFile(f.fileId, file.name, extName,f.fileSize);
				}
			},
			debug: false
		});
		$("#btnCancelForAttachFile").click(function(){cancelQueue(upload);});
		$("#btnStartForAttachFile").click(function(){
			$.post($.appClient.generateUrl({ESCollaborative:'getUploadURL'},'x'),  function(data){
				upload.setUploadURL(data);
				startQueue(upload);
			});
		});
		// 挂接文件
		function extendFile(fileid, filename, extName,size){
			var attachTB="attachFileTable";
			if($("#formStartPage").attr("fileUploadType")=="opinion"){
				attachTB="handleWfFileDataTable";
			}
			if($('#'+attachTB).attr('filePaths') == ''){
				$('#'+attachTB).attr('filePaths', fileid) ;
				$('#'+attachTB).attr('fileNames', filename) ;
			}else{
				$('#'+attachTB).attr('filePaths', $('#'+attachTB).attr('filePaths')+'|'+fileid) ;
				$('#'+attachTB).attr('fileNames', $('#'+attachTB).attr('fileNames')+'|'+filename) ;
			}
			collaborativeHandle.addHandleWfRow(fileid, filename, extName,size,attachTB);
		};
	},
	addHandleWfRow: function(fileid, filename, extName,size,attachTB){
		 extName = extName.toLowerCase() ;
		 extName = extName+".png"
	     var root = document.getElementById(attachTB);
	     var newRow = root.insertRow();
	     var newCell1 = newRow.insertCell();
  		 newCell1.align= "left";   
  		 newCell1.innerHTML = "<a href='#' style=\"margin-left:5px;\" title=\"点击下载\" onclick=\"collaborativeHandle.downloadFile('"+fileid+"')\" style=\"color:0000ff;text-decoration:underline\"><span class='fileicon'></span>"+filename+"</a><a style=\"margin-left:10px;\"  href='#' title=\"点击删除\" onclick=\"collaborativeHandle.deleteHandleWfFileData(this,'"+filename+"') ;\" style=\"color:0000ff;text-decoration:underline\">删除</a>";
  		 var allRows = root.getElementsByTagName('tr');
  		 var datas=[];
  		 datas.push(fileid+","+filename+","+size);
  		 if($("#formStartPage").attr("fileUploadType")!="opinion"){
  			 collaborativeHandle.addAttachFileData(datas,"file",attachTB);
  		 }
  	},
  	
	/** 删除文件附件 **/
	deleteHandleWfFileData: function(obj,fileName){
		var attachTB="attachFileTable";
		if($("#formStartPage").attr("fileUploadType")=="opinion"){
			attachTB="handleWfFileDataTable";
		}
		$.dialog({
			content : '您确定要删除当前文件吗？',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				collaborativeHandle.removeHandleWfRow(obj); 
   				var filePaths = $('#'+attachTB).attr('filePaths') ;
   				var fileNames = $('#'+attachTB).attr('fileNames') ;
   				if(filePaths.indexOf('|')==-1){
	   			    $('#'+attachTB).attr('filePaths', '') ;
					$('#'+attachTB).attr('fileNames', '') ;
  			    }else{
  			    	 Array.prototype.remove=function(dx) {
  				 　               if(isNaN(dx)||dx>this.length){return false;}
  				 　               for(var i=0,n=0;i<this.length;i++){
  				 　　　               if(this[i]!=this[dx]){
  				 　　　　　                this[n++]=this[i]
  				 　　　               }
  				 　               }
  				 　               this.length-=1
  				    }
	   			    var filePathsArray = filePaths.split('|');
	   			    var fileNamesArray = fileNames.split('|');
	   			 	for(var i=0; i<fileNamesArray.length; i++) {
		   			 	if(fileNamesArray[i]==fileName){
			   			 	filePathsArray.remove(i);
			   			 	fileNamesArray.remove(i);
			   			 	break ;
		   			 	}
	   			 	}
	   			 	if(filePathsArray.length==1){
	   			 	 	$('#'+attachTB).attr('filePaths', filePathsArray[0]) ;
						$('#'+attachTB).attr('fileNames', fileNamesArray[0]) ;
	   			 	}else{
	   			 		filePaths = filePathsArray[0] ;
	   			 		fileNames = fileNamesArray[0] ;
	   			 		for(j=1; j<filePathsArray.length; j++) {
	   			 			filePaths = filePaths+'|'+filePathsArray[j];
	   			 			fileNames = fileNames+'|'+fileNamesArray[j];
		   			 	}
	   			 	 	$('#'+attachTB).attr('filePaths', filePaths) ;
						$('#'+attachTB).attr('fileNames', fileNames) ;
	   			 	}
  			    }
			}
		});
	},
	
	//界面删除文件附件展现对象
	removeHandleWfRow: function(obj){
	    var tr=obj.parentNode.parentNode; 
		var tbody=tr.parentNode; 
		tbody.removeChild(tr); 
  	},
  	
  	//下载文件
  	downloadFile: function(fileId){
		$.ajax({
			url: $.appClient.generateUrl({ESCollaborative : 'getFileDownLoadUrl',fileId:fileId},'x'),
			success: function(url){
				window.location=url;
			}
		});
	},
	
  	//添加数据附件
  	addAttachDataPage: function(dataIds){
  		$.post($.appClient.generateUrl({ESCollaborative:'linkFile'},'x'),function(data){
  			dia2 = $.dialog({
		    	title:'选择文件',
	    		width: '800px',
	    	   	fixed:true,
	    	    resize: false,
	    	    padding:0,
		    	content:data,
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'确定选择',
			    ok:true,
		    	ok:function(){ 
		    		var checks=$("#esFile").find("input[type='checkbox']:checked");
		    		if(checks.length>0){
		    			var datas=[];
		    			for(var i=0;i<checks.length;i++){
		    				var dataId=$(checks[i]).closest("tr").prop("id").substr(3);
		    				if(dataIds.indexOf(dataId)==-1){
		    					var fileName=$(checks[i]).closest("tr").find("td[colname='title'] div").html();
			    				datas.push(dataId+","+fileName+",0");
		    				}
		    			}
		    			collaborativeHandle.addAttachFileData(datas,"data","attachDataTable");
		    		}else{
		    			$.dialog.notice({icon : 'warning',content : "请选择要添加的数据！",title : '3秒后自动关闭',time : 3});
		    			return false;
		    		}
				},cancel:function(){
					//关闭选择文件窗口
				}
		    });
  		});  		  		
  	},
  	
  	//插入附件信息
  	addAttachFileData: function(datas,type,tableId){
  		if(datas.length>0 && datas!=null && datas!=[] ){
  			var userFormNo=$("#formStartPage").attr("userFormNo");
			var wfId=$("#formStartPage").attr("wfId");
			var stepId=$("#formStartPage").attr("stepId");
			var url=$.appClient.generateUrl({ESCollaborative: 'addAttachFileData'}, 'x');
			$.post(url,{datas:datas,wfId:wfId,stepId:stepId,type:type,userFormNo:userFormNo},function(mes){
				var str = "";
				if(type == "data"){
					str = "数据";
				}else if(type == "file"){
					str = "文件";
				}
				if(mes == "false"){
					$.dialog.notice({icon : 'error',content : '添加'+str+'附件失败！',title : '3秒后自动关闭',time : 3});
	    			return false;
				}else{
					var arr = mes.split(",");
					for(var i = 0;i<arr.length;i++){
						if(type == "data"){
							dataCount.push(arr[i]);
						}else if(type == "file"){
							fileCount.push(arr[i]);
						}
					}
					$.dialog.notice({icon : 'success',content : '添加'+str+'附件成功！',title : '3秒后自动关闭',time : 3});
					$("#"+tableId).flexReload();
				}
			});				    		
		}
  	},
  	
  	//删除数据附件
  	deleteAttachDataPage: function(ids,idTab,type){
  		$.dialog({
	    	title:'删除数据附件',
			width: '300px',
		   	fixed:true,
		    resize: false,
		    padding:0,
	    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>“<span style='color:red'>选择的数据附件</span>”吗？</div>",
		    cancelVal: '取消',
		    cancel: true,
		    okVal:'确定',
		    ok:true,
	    	ok:function(){
	    		var userFormNo=$("#formStartPage").attr("userFormNo");
	    		var url=$.appClient.generateUrl({ESCollaborative: 'deleteAttachFileData'}, 'x');
	    		$.post(url,{ids:ids,type:type,userFormNo:userFormNo},function(mes){
	    			if(mes){
						$.dialog.notice({icon : 'error',content : mes,title : '3秒后自动关闭',time : 3});
		    			return false;
					}else{
						if(type == "data"){
							$.dialog.notice({icon : 'success',content : "删除数据附件成功！",title : '3秒后自动关闭',time : 3});
						}else if(type == "file"){
							$.dialog.notice({icon : 'success',content : "删除文件附件成功！",title : '3秒后自动关闭',time : 3});
						}else{
							$.dialog.notice({icon : 'success',content : "删除附件成功！",title : '3秒后自动关闭',time : 3});
						}
						$("#"+idTab).flexReload();
					}
	    		});
			},cancel:function(){
				//关闭删除窗口
			}
	    });
  	},
  	
  	//查看流程图
  	myFormModelsshowWorkflowGraph_event : function() {
		var Sys = {}; 
        var ua = navigator.userAgent.toLowerCase(); 
        if (window.ActiveXObject) 
            Sys.ie = ua.match(/msie ([\d.]+)/)[1]; 
        //如果浏览器是IE8及IE8一下 
        if(Sys.ie<=8){
        	var obj;
        	try{
        		obj= new ActiveXObject("WScript.Shell");
        	}catch(e){
        		alert("请在Internet选项中设置:对没有标记为安全的activex控件进行初始化和脚本运行”设置成“启用”");
        		return;
        	}
        	var f;
        	try{
        		var setSvg = new ActiveXObject("Adobe.SVGCtl");        		
        		f = setSvg;
        	}catch(e){
        		f=false;
        	}
        	if(!f){
        		var content = "<div style='display:inline;'><label><input type='radio' name='exportType' value='xml' runat='server' checked/>SVGView.exe</label><p style='font-size:12px'>由于您的IE版本过低,无法正常显示图片.需要下载SVGView插件,安装后才能正常浏览.</p></div>";
        		var dlg = $.dialog({
        			content:content,
        			title:"下载相应的控件",
        			width:300,
        			okVal:"确定",
        			cancelVal:"取消",
        			cancel:true,
        			ok:function(){
        				collaborativeHandle.downloadSVG();
        			}
        		});
        		return false;
        	}
        }
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({ESCollaborative : 'showWfGraph'}, 'x'),
			data : {
				flowId:$('.formStartPage').attr('flowId'),
				wfId:$('.formStartPage').attr('wfId'),
				formId:$('.formStartPage').attr('formId'),
				stepId:$('.formStartPage').attr('stepId'),
				status:$('.formStartPage').attr('status')
			},
			success : function(res) {
				$.dialog({
		    		id:'mxGraphHtmlDialog',
			    	title:'查看流程图',
			    	modal:true, //蒙层（弹出会影响页面大小） 
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
					padding: '0px',
					width:400,
					height:100,
					cancelVal: '关闭',
		    		cancel: true,
				    content:res
			    });
			},
			error : function() {
				$.dialog.notice({icon : 'warning',content : "获取流程图失败！",title : '3秒后自动关闭',time : 2});
    			return false;
			}
		});				
	},
	
	//下载流程图查看插件
	downloadSVG: function(){
		var downFile=$.appClient.generateUrl({ESCollaborative:'fileDownSVG'},'x');
		$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载SVGView.exe</a>',icon: 'success'});
	},
	
	//待发，待办，点击关闭时删除附件
  	deleteAttachDataPageForCancel: function(ids,type){
  		var userFormNo=$("#formStartPage").attr("userFormNo");
	    var url=$.appClient.generateUrl({ESCollaborative: 'deleteAttachFileData'}, 'x');
	    $.post(url,{ids:ids,type:type,userFormNo:userFormNo},function(mes){});
  	}
};

var formApprovalHandle={
		approvalForm:function(wfName, wfId, stepId, formId,workFlowType){
			var realstepId = stepId.split('_')[0] ;
		    var isLast = stepId.split('_')[1] ;		   
		    var url=$.appClient.generateUrl({ESCollaborative : 'getCollaborativeMsgByWfId'}, 'x');
		    $.post(url,{wfId:wfId,state:"1"},function(res){
		    	var json = eval('(' + res + ')'); 
		    	var formUserId=json.id;
		    	var flowId=json.flowId;
		    	var formId=json.formId;
		    	var dataId=json.dataId;
		    	var userFormNo=json.userFormNo;		
		    	var status=json.status;
		    	var title=json.title;
		    	var processTime=json.processTime;
		    	var buttons=[];
			    if(workFlowType=="4"||workFlowType=="5"){
					buttons.push({id:'startForm',name:'已阅',callback:function(){collaborativeHandle.formApprovalBeforeSet(flowId,realstepId,workFlowType,processTime);return false;}});
				}else{
					buttons.push({id:'handleTodo',name:'处理',callback:function(){collaborativeHandle.formApprovalBeforeSet(flowId,realstepId,workFlowType,processTime);return false;}});
				}
				buttons.push({id:'forwardTodo',name:'转发',callback:function(){collaborativeHandle.formForward(flowId,wfId,formUserId);return false;}});
				if(workFlowType=="4"||workFlowType=="5"){
					buttons.push({id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();return false;}});
				}
				if(realstepId=="" && isLast=="1"){
					buttons=[];
					buttons.push({id:'printGraph',name:'打印',callback:function(){collaborativeHandle.myFormModelsPrint_event();return false;}});
				}
				buttons.push({id:'wfGraph',name:'查看流程图',callback:function(){collaborativeHandle.myFormModelsshowWorkflowGraph_event();return false;}});
					
		    	collaborativeHandle.approvalForm(formUserId,flowId,formId, wfId, realstepId, dataId,status,title,userFormNo,workFlowType,isLast,buttons);
		    });	
		}
};