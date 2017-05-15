/**
 * 工作流管理处理方法
 */
var workFlowManage = {
		//定制流程
		createWorkFlow: function(){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var modelTypeId = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'warning',content : "请先选择一个工作流类型，再进行此操作",time : 3});
					return false;
				}else if(nodes[0].name=="工作流类型" || nodes[0].id==0){
					$.dialog.notice({icon : 'warning',content : "只可以对叶子节点进行此操作，当前选择节点不能进行此操作",time : 3});
					return false;
				}
				modelTypeId = nodes[0].id ;
			}else{
				$.dialog.notice({icon : 'warning',content : "工作流类型树不存在，不能进行此操作",time : 3});
				return false;
			}
			//modelTypeID,modelId,formId,esGraphXml
			var data = modelTypeId+",,," ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESTransferFlow : 'createWorkFlowPage'},'x'),
			        data: {data:data},
				    success:function(data){
					    	$.dialog({
					    		id:'createWorkFlowDialog',
						    	title:'创建工作流',
						    	modal:true, //蒙层（弹出会影响页面大小） 
					    	   	fixed:false,
					    	   	stack: true ,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
								padding: '2px',
							    content:data,
							    close:function(){
							    	workFlowManage.deleteWorkflowByClose();
							    }
						    });
				    },
				    cache:false
			});
		},
		
		//编辑流程
		editWorkFlow_before: function (modelId){
				$.post( $.appClient.generateUrl({ESTransferFlow : 'getWorkFlowXml'}, 'x')
						,{modelId:modelId}, function(data){
						//modelTypeID,modelId,formId,esGraphXml
						$.post( $.appClient.generateUrl({ESTransferFlow : 'getFlowingWF'}, 'x')
								,{formid:data.form_relation}, function(res){
							if (res) {
								var icon=(res.indexOf("失败")==-1)?'warning':'error';
								$.dialog.notice({icon : icon,content : res,time : 3});
								return false;
							}else{
								workFlowManage.editWorkFlow(data.type_id+","+modelId+","+data.form_relation.substring(5)+","+data.graphXml, data.name);
							}
						});
				},"json");
		},
		
		//编辑处理
		editWorkFlow: function (data,workflowName){
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESTransferFlow : 'createWorkFlowPage'},'x'),
		        data: {data:data},
		        async:false,
			    success:function(res){
			    	var workflowDisplayName = workflowName.length < 50 ? workflowName : workflowName.substring(0,50) + '...';
				    	$.dialog({
				    		id:'createWorkFlowDialog',
					    	title:'编辑工作流-'+workflowDisplayName,
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
							padding: '2px',
						    content:res,
						    close:function(){
						    	workFlowManage.deleteWorkflowByClose();
						    }
					    });
			    },
			    cache:false
			});
		},
		
		deleteWorkflowByClose: function(){
			var flowId=Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
			if(flowId!="" && flowId!=null){
				var url=$.appClient.generateUrl({ESTransferFlow : 'getModelInit'}, 'x');
				$.post(url,{modelId:flowId},function(json){
					var graphXml=json.graphXml;
					var flowGraph=json.flowGraph;
					if(graphXml=="" || graphXml==null || flowGraph=="" || flowGraph==null){
						deleteWorkflowByCloseWindow();
					}
				},"json");
			}			
		},
		
		//发布流程
		publicWorkFlow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : "warning",content : "请先选择一条数据，再进行此操作！",time : 3});
				return false;
			}
			var modelId;
			checkboxs.each(function() {
				modelId = $(this).closest("tr").prop("id").substr(3) ;
			});
			$.post( $.appClient.generateUrl({ESTransferFlow : 'publicWorkFlow'}, 'x')
					,{modelId:modelId}, function(res){
						if(res){
							$.dialog.notice({icon : "error",content : res,time : 3});
							return false;
						}else{
							$.dialog.notice({icon : "success",content : "发布成功！",time : 3});
							$("#modelDataGrid").flexReload();
						}				
			});
		},
		
		/** lujixiang 20150421 暂停工作流 --start **/
		haltWorkFlow:	function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : "warning",content : "请先选择一条数据，再进行此操作！",time : 3});
				return false;
			}
			var modelId;
			var formId;
			checkboxs.each(function() {
				var columns = ['form_relation'];
				formId = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				modelId = $(this).closest("tr").prop("id").substr(3);
			});
			if(typeof(formId) != 'undefined' && formId != ""){
				$.post( $.appClient.generateUrl({ESTransferFlow : 'isHavedWFData'}, 'x')
						,{formId:formId,modelId:modelId}, function(res){
							if (res) {
								$.dialog.notice({icon : "warning",content : '系统中存在相关的流程数据，为了流程可以正常使用，不能进行暂停操作',time : 3});
								return false;
							}
							workFlowManage.haltWorkflowAction(modelId);
				});
			}else{
				workFlowManage.haltWorkflowAction(modelId);
			}
			
		},
		
		//暂停处理
		haltWorkflowAction: function (flowId){
			
			$.post( $.appClient.generateUrl({ESTransferFlow : 'haltWorkFlow'}, 'x')
					,{flowId:flowId}, function(res){
					if (res != 'true') {
						$.dialog.notice({icon : "error",content : res,time : 3});
						return false;
					}else{
						$.dialog.notice({icon : "success",content : "此工作流已暂停！",time : 3});
						$("#modelDataGrid").flexReload();
					}
			});
		},
		
		/** lujixiang 20150421 暂停工作流 --end **/
		
		
		//删除流程
		deleteWorkflow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : "warning",content : "请先选择一条数据，再进行此操作！",time : 3});
				return false;
			}
			var modelId;
			var formId;
			checkboxs.each(function() {
				var columns = ['form_relation'];
				formId = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				modelId = $(this).closest("tr").prop("id").substr(3);
			});
			if(typeof(formId) != 'undefined' && formId != ""){
				$.post( $.appClient.generateUrl({ESTransferFlow : 'isHavedWFData'}, 'x')
						,{formId:formId,modelId:modelId}, function(res){
							if (res) {
								$.dialog.notice({icon : "warning",content : res,time : 3});
								return false;
							}
							workFlowManage.deleteWorkflowAction(modelId, formId, "此工作流模板已与表单关联，您确定要删除此工作流模板？");
							
				});
			} else {
				workFlowManage.deleteWorkflowAction(modelId, "", "您确定要删除此工作流模板吗？");
			}
		},
		
		//删除处理
		deleteWorkflowAction: function (modelId, formId, msg){
			$.dialog({
				content : msg,
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESTransferFlow : 'deleteWorkflow'}, 'x')
							,{formId:formId,modelId:modelId}, function(res){
							if (res) {
								$.dialog.notice({icon : "error",content : res,time : 3});
								return false;
							}else{
								$.dialog.notice({icon : "success",content : "删除流程成功！",time : 3});
								$("#modelDataGrid").flexReload();
							}
					});
				}
			});
		},
		
		//复制流程
		copyWorkflow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : "warning",content : "请先选择一条数据，再进行此操作！",time : 3});
				return;
			}
			var modelId;
			var workflowName;
			checkboxs.each(function() {
				var columns = ['name'];
				workflowName = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				modelId = $(this).closest("tr").prop("id").substr(3) ;
			});
			$.post( $.appClient.generateUrl({ESTransferFlow : 'copyWorkflow'}, 'x')
					,{workflowName:workflowName,modelId:modelId}, function(res){
						if(res){
							var icon=(res.indexOf("失败")==-1)?'warning':'error';
							$.dialog.notice({icon : icon,content : res,time : 3});
							return false;
						} else {
							$.dialog.notice({icon : "success",content : "工作流模板复制成功！",time : 3});
							$("#modelDataGrid").flexReload();
						}
			});
		},
		
		// 测试流程
		detectionWorkflow: function () {
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : "warning",content : "请先选择一条数据，再进行此操作！",time : 3});
				return false;
			}
			var modelId;
			var workflowName;
			var modelBusiness;
			var relationForm;
			var status;
			checkboxs.each(function() {
				var columns = ["business_relation","name","form_relation","status"];
				var colValues = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");				
				status = colValuesArray[0];
				workflowName = colValuesArray[1];
				modelBusiness = colValuesArray[2];				
				relationForm = colValuesArray[3];
				modelId = $(this).closest("tr").prop("id").substr(3);
			});
			//判断流程是否发布
			if(status != "启用"){
				$.dialog.notice({icon : "warning",content : "该流程未发布，不需要进行测试，请发布成功后再进行测试！",time : 3});
				return false;
			}
			//先判断流程需不需要进行测试
			$.post($.appClient.generateUrl({ESTransferFlow : 'stationWorkflow'}, 'x'),{modelId:modelId,relationForm:relationForm}, 
				function(res){
					if(res){
						$.dialog.notice({icon : "warning",content : res,time : 3});
						return false;
					} else {
						// 进行测试
						$.post($.appClient.generateUrl({ESTransferFlow : 'detectionWorkflow'}, 'x'),
								{modelId:modelId,workflowName:workflowName,modelBusiness:modelBusiness,relationForm:relationForm}, 
							function(json){
								if(json.isOk == "true"){
									$.dialog.notice({icon : "warning",content : json.msg,time : 3});
									return false;
								} else {
									$.dialog.notice({icon : "success",content : json.msg,time : 3});
								}
							},"json");
					}
			});
		},
		
		//导出流程
		exportWorkflow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : "warning",content : '请先选择一条数据，再进行此操作！',time : 3});
				return false;
			}
			var modelId;
			var state;
			var formId;
			checkboxs.each(function() {
				var columns = ['status','form_relation'];
				var colValues = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				state = colValuesArray[0] ;
				formId = colValuesArray[1] ;
				modelId = $(this).closest("tr").prop("id").substr(3) ;
			});
			if(state != '启用'){
				$.dialog.notice({icon : "warning",content : '流程没有正常发布!',time : 3});
				return false;
			}
			// 如果流程关联了表单，询问是否导出流程及关联的表单
			if (formId==null || formId=='') {
				$.dialog({
					content:'是否导出工作流模版？</br>是  ：导出工作流模版！</br>关闭：取消导出操作！',
					model:true,
					button: [{
						name: '是',
						callback: function () {
							workFlowManage.exportWorkflowModel(modelId,'2');
						},
						focus: true
					},{
						name: '关闭'
					}]
				});
			} else {
				$.dialog({
					content:'是否导出关联的表单？</br>是  ：导出工作流模版及表单！</br>否  ：导出工作流模版！</br>关闭：取消导出操作！',
					model:true,
					button: [{
						name: '是',
						callback: function () {
							workFlowManage.exportWorkflowModel(modelId,'3');
						},
						focus: true
					},{
						name: '否',
						callback: function () {
							workFlowManage.exportWorkflowModel(modelId,'2');
						}
					},{
						name: '关闭'
					}]
				});
			}
		},
		
		// expType 2:导出模版；3：导出模版及表单
		exportWorkflowModel:function (modelId,expType) {
			$.post($.appClient.generateUrl({ESTransferFlow:'exportWorkflow'},'x'),{modelId:modelId,expType:expType},function(data){
				if (data.success=='true') {
//					var fileUrl = decodeURIComponent(data.fileUrl);
//					var downFile=$.appClient.generateUrl({ESTransferFlow:'fileDown',fileUrl:fileUrl});
//					window.open(downFile,"_parent");
					$.dialog.notice({content: '正在努力导出中，稍后请在消息中下载',icon: 'success',time: 3});
				} else {
					$.dialog.notice({icon:'error',content:'导出失败',title:'消息',time:2});
					return false;
				}
			},"json");
		},
		
		//导入工作流表单
		importWorkflow: function(formObj) {
			
			
			/** lujixiang 20150422 判断文件是否为wf格式 **/
			var filePath = $("input[name='workflowFile'] ").val();
			if( !/.wf$/.test(filePath) ){
				
				$.dialog.notice({icon:'warning',content:"请选择wf格式的文件",title:'操作提示'});
				return false;
			}
			
			$.ajax({
				async : false,
				url:$.appClient.generateUrl({ESTransferFlow:'importWorkflow'},'x'),
				success:function(res){
					var ipIndex=res.lastIndexOf('/');
					var ip=res.substr(ipIndex+1);
					var newRes=res.substr(0,ipIndex);
					var userIdIndex=newRes.lastIndexOf('/');
					var userId=newRes.substr(userIdIndex+1);
					var url=newRes.substr(0,userIdIndex);
					
					var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
					var nodes = treeObj.getSelectedNodes();
					var typeId=(nodes.length>0)?nodes[0].id:"";
					var typename=(nodes.length>0)?nodes[0].name:"";

					formObj.ajaxSubmit({
						url:url,
						dataType:"json",
						data:{userId:userId,remoteAddr:ip,typeId:typeId,typename:typename},
						success:function(data){
							if (data && data.success && data.isOK=="true") {
								// 刷新grid列表
								$("#modelDataGrid").flexReload();
								art.dialog.list['importWorkflowDialog'].close();
								$.dialog.notice({icon:'success',content:'导入工作流模版成功',title:'操作提示',time:3});
							} else {
								$.dialog.notice({icon:'error',content:"导入工作流模版失败",title:'操作提示'});
								return false;
							}
						},
						error:function(){
							$.dialog({title:'操作提示',icon:'error',content:"系统错误，请联系管理员"});
							return false;
						}
					});
				}
			});
		},
		
		//函数设置
		functionSet: function(){
			$.ajax({
		        url : $.appClient.generateUrl({ESTransferFlow : 'functionSetPage'},'x'),
			    success:function(data){
				    	$.dialog({
				    		id:'functionSetDialog',
					    	title:'函数设置',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
							padding: '2px',
						    content:data
					    });
			    },
			    cache:false
			});
		}
}