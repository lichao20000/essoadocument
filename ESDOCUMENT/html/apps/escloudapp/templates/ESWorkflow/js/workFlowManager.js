/** xiaoxiong 20140513 工作流管理处理方法 **/
var workFlowManage = {
		showMsg: function(msg, type){
			if(type == '1'){
				$.dialog.notice({icon : 'succeed',content : msg,title : '3秒后自动关闭',time : 3});
			} else if(type == '2'){
				$.dialog.notice({icon : 'error',content : msg,title : '3秒后自动关闭',time : 3});
			} else {
				$.dialog.notice({icon : 'warning',content : msg,title : '3秒后自动关闭',time : 3});
			}
		},
		/** 定制流程方法 **/
		createWorkFlow: function(){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var modelTypeId = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					workFlowManage.showMsg('请先选择一个工作流类型，再进行此操作！','3') ;
					return ;
				}else if(nodes[0].name=="工作流类型"){
					workFlowManage.showMsg('只可以对叶子节点进行此操作，当前选择节点不能进行此操作！','3') ;
					return ;
				}
				modelTypeId = nodes[0].id ;
			}else{
				workFlowManage.showMsg('工作流类型树不存在，不能进行此操作！','3') ;
				return ;
			}
			//modelTypeID,modelId,formId,esGraphXml
			var data = modelTypeId+",-1,," ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESWorkflow : 'createWorkFlowPage'},'x'),
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
							    content:data
						    });

				    },
				    cache:false
			});
		},
		editWorkFlow_before: function (tr){
			var columns = ['modelId',"modelTypeId",'workflowName','relationForm'];
			var colValues = $("#modelDataGrid").flexGetColumnValue(tr,columns);
			var colValuesArray = colValues.split("|");
			var modelId = colValuesArray[0] ;
			var modelTypeId = colValuesArray[1] ;
			var workflowName = colValuesArray[2] ;
			var relationFormId = colValuesArray[3] ;
			if(relationFormId == null || relationFormId == ''){
				
				workFlowManage.editWorkFlow(modelId, relationFormId, workflowName,modelTypeId);
			} else {
				//guolanrui 20140723 增加对流程是否有正在流转的数据，如果有则不能被修改 BUG:52 start
				// longjunhao 20140905 修改为getFlowingWF方法，检查是否有正在流转的流程，有则不允许编辑
				$.post( $.appClient.generateUrl({ESWorkflow : 'getFlowingWF'}, 'x')
						,{formid:relationFormId}, function(res){
					if (res != 'true') {
						workFlowManage.showMsg('存在正在流转的流程数据，不能进行修改操作！','3');
						return;
					}else{
						$.post( $.appClient.generateUrl({ESWorkflow : 'getFlowingWF'}, 'x')
								,{formid:relationFormId}, function(res){
//							if (res == 'true') {
									workFlowManage.editWorkFlow(modelId, relationFormId, workflowName,modelTypeId);
//							} else {
//								workFlowManage.showMsg('存在正在流转的流程数据，不能进行修改操作！','3') ;
//							}
						});
					}
					//guolanrui 20140723 增加对流程是否有正在流转的数据，如果有则不能被修改 BUG:52  end
				});
			}
		},
		editWorkFlow: function (modelId, relationFormId, workflowName,modelTypeId){
			$.post( $.appClient.generateUrl({ESWorkflow : 'getWorkFlowXml'}, 'x')
					,{modelId:modelId}, function(workFlowXmlValue){
						//modelTypeID,modelId,formId,esGraphXml
						var data = modelTypeId+","+modelId+","+relationFormId+","+workFlowXmlValue ;
						$.ajax({
							type:'POST',
					        url : $.appClient.generateUrl({ESWorkflow : 'createWorkFlowPage'},'x'),
					        data: {data:data},
					        async:false,// 同步 longjunhao 20140717
						    success:function(data){
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
									    content:data
								    });
						    },
						    cache:false
						});
			});
		},
		publicWorkFlow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				workFlowManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var modelId;
			checkboxs.each(function() {
				modelId = $(this).val() ;
			});
			$.post( $.appClient.generateUrl({ESWorkflow : 'publicWorkFlow'}, 'x')
					,{modelId:modelId}, function(res){
						var json = eval("(" + res + ")") ;
						workFlowManage.showMsg(json.message, json.msgType);
						$("#modelDataGrid").flexReload();
			});
		},
		deleteWorkflow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				workFlowManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var modelId;
			var formId;
			checkboxs.each(function() {
				var columns = ['relationForm'];
				formId = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				modelId = $(this).val() ;
			});
			if(typeof(formId) != 'undefined' && formId != ""){
				$.post( $.appClient.generateUrl({ESWorkflow : 'isHavedWFData'}, 'x')
						,{formId:formId}, function(res){
							if (res != 'true') {
								// longjunhao 20140826 修改
								workFlowManage.showMsg("系统中存在相关的流程数据，为了流程可以正常使用，不能进行删除操作！",'3');
								return ;
							}
							workFlowManage.deleteWorkflowAction(modelId, formId, "此工作流模板已与表单关联，您确定要删除此工作流模板？");
							
				});
			} else {
				workFlowManage.deleteWorkflowAction(modelId, "", "您确定要删除此工作流模板吗？");
			}
		},
		deleteWorkflowAction: function (modelId, formId, msg){
			$.dialog({
				content : msg,
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESWorkflow : 'deleteWorkflow'}, 'x')
							,{formId:formId,modelId:modelId}, function(res){
								var json = eval("(" + res + ")") ;
								workFlowManage.showMsg(json.message,json.msgType);
								$("#modelDataGrid").flexReload();
					});
				}
			});
		},
		copyWorkflow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				workFlowManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var modelId;
			var workflowName;
			checkboxs.each(function() {
				var columns = ['workflowName'];
				workflowName = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				modelId = $(this).val() ;
			});
			$.post( $.appClient.generateUrl({ESWorkflow : 'copyWorkflow'}, 'x')
					,{workflowName:workflowName,modelId:modelId}, function(res){
						var json = eval("(" + res + ")") ;
						if(json.isOk == "true"){
							workFlowManage.showMsg('工作流模板复制成功！','1');
							$("#modelDataGrid").flexReload();
						} else {
							if(json.msg) {
								workFlowManage.showMsg(json.msg,'3');
								return;
							} 
							workFlowManage.showMsg('工作流模板复制失败！','2');
						}
			});
		},
		// 测试流程 longjunhao 20140609
		detectionWorkflow: function () {
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				workFlowManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var modelId;
			var workflowName;
			var modelBusiness;
			var relationForm;
			checkboxs.each(function() {
				var columns = ["business","workflowName","relationForm"];
				var colValues = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				modelBusiness = colValuesArray[0];
				workflowName = colValuesArray[1];
				relationForm = colValuesArray[2];
				modelId = $(this).val();
			});
			//判断流程是否关联表单  longjunhao 20140819 add
			if(relationForm == null || relationForm == ''){
				workFlowManage.showMsg("该流程未发布或未关联表单，不需要进行测试，请发布成功后再进行测试！",'3');
				return;
			}
			//先判断流程需不需要进行测试
			$.post($.appClient.generateUrl({ESWorkflow : 'stationWorkflow'}, 'x'),{modelId:modelId,relationForm:relationForm}, 
				function(res){
					var json = eval("(" + res + ")") ;
					if(json.isOk == "false"){
						workFlowManage.showMsg(json.msg,'3');
					} else {
						// 进行测试
						$.post($.appClient.generateUrl({ESWorkflow : 'detectionWorkflow'}, 'x'),
								{modelId:modelId,workflowName:workflowName,modelBusiness:modelBusiness,relationForm:relationForm}, 
							function(res){
								var json = eval("(" + res + ")") ;
								if(json.isOk == "true"){
									workFlowManage.showMsg(json.msg,'1');
								} else {
									workFlowManage.showMsg(json.msg,'3');
								}
							});
					}
			});
		},
		exportWorkflow: function (){
			var checkboxs = $('#modelDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				workFlowManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var modelId;
			var state;
			var formId;
			checkboxs.each(function() {
				var columns = ['state','relationForm'];
				var colValues = $("#modelDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				state = colValuesArray[0] ;
				formId = colValuesArray[1] ;
				modelId = $(this).val() ;
			});
			if(state != '启用'){
				workFlowManage.showMsg('流程没有正常发布!','3');
				return;
			}
			// 如果流程关联了表单，询问是否导出流程及关联的表单
			if (formId==null || formId=='') {
				$.dialog({
					//gengqianfeng 20140918 导出模板提示信息修改
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
			$.post($.appClient.generateUrl({ESWorkflow:'exportWorkflowModel'},'x'),{modelId:modelId,expType:expType},function(data){
				var obj = eval("("+data+")");
				if (obj.success=='true') {
					var fileUrl = decodeURIComponent(obj.fileUrl);
					var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDown',fileUrl:fileUrl});
					window.open(downFile,"_parent");
				} else {
					$.dialog.notice({icon:'error',content:'导出失败',title:'消息',time:2});
				}
			});
		},
		/**导入工作流表单 longjunhao 20140610*/
		importWorkflow: function(formObj) {
			$.ajax({
				async : false,
				url:$.appClient.generateUrl({ESWorkflow:'importWorkflow'},'x'),
				success:function(url){
					formObj.ajaxSubmit({
						url:url,
						dataType:"text",
						success:function(data){
							var obj = eval('(' + data + ')');
							if (obj && obj.success && obj.isOK=="true") {
								// 刷新grid列表
								$("#modelDataGrid").flexReload();
								art.dialog.list['importWorkflowDialog'].close();
							} else {
								$.dialog({title:'操作提示',icon:'error',content:"导入工作流模版失败"});
							}
						},
						error:function(){
							$.dialog({title:'操作提示',icon:'error',content:"系统错误，请联系管理员"});
						}
					});
				}
			});
		},
		query: function(){
			var keyword = $.trim($('#workflowQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#modelDataGrid").flexOptions({query:keyword}).flexReload();
			return false;
		},
		functionSet: function(){
			$.ajax({
		        url : $.appClient.generateUrl({ESWorkflow : 'functionSetPage'},'x'),
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