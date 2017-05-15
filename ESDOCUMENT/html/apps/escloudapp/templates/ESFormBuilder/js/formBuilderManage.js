var formBuilderManage = {
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
		createForm: function(){
			var treeObj = $.fn.zTree.getZTreeObj("formBuilderTypeTree");
			var formTypeId = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					formBuilderManage.showMsg('请先选择一个工作流类型，再进行此操作！','3') ;
					return ;
				}else if(nodes[0].name=="表单类型"){
					formBuilderManage.showMsg('请选择表单分类，再进行此操作！','3') ;
					return ;
				}
				formTypeId = nodes[0].id ;
			}else{
				formBuilderManage.showMsg('工作流类型树不存在，不能进行此操作！','3') ;
				return ;
			}
			//formId,formTypeID,hasData
			var data = "-1,"+formTypeId+",false" ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormBuilder : 'createFormBuilderPage'},'x'),
			        data: {data:data},
				    success:function(data){
					    	$.dialog({
					    		id:'createFormDialog',
						    	title:'创建表单',
						    	modal:true, //蒙层（弹出会影响页面大小） 
					    	   	fixed:false,
					    	   	stack: true ,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
								width: 1000,
								height: 600,
								left :(document.body.clientWidth - 1000)/2,
								top :(document.body.clientHeight - 650)/2,
								padding: '0 0 0 0',
							    content:data
						    });
				    },
				    cache:false
			});
		},
		editFormBuilder_before: function (tr){
			var columns = ['id',"formTypeId","title"];
			var colValues = $("#formBuilderDataGrid").flexGetColumnValue(tr,columns);
			var colValuesArray = colValues.split("|");
			var formId = colValuesArray[0] ;
			var formTypeId = colValuesArray[1] ;
			var formName = colValuesArray[2] ;
			
			//guolanrui 20140723 增加对流程是否有正在流转的数据，如果有则不能被修改 BUG:53 start
			// longjunhao 20140905 修改为getFlowingWF方法，检查是否有正在流转的流程，有则不允许编辑
			$.post( $.appClient.generateUrl({ESWorkflow : 'getFlowingWF'}, 'x')
					,{formid:formId}, function(res){
				if (res != 'true') {
					formBuilderManage.showMsg('存在正在流转的流程数据，不能进行修改操作！','3');
					return;
				}else{

					$.post( $.appClient.generateUrl({ESWorkflow : 'getFlowingWF'}, 'x')
							,{formid:formId}, function(res){
//								if (res == 'true') {
									formBuilderManage.editFormBuilder(formId, formTypeId,formName);
//								} else {
//									formBuilderManage.showMsg('存在正在流转的流程数据，不能进行修改操作！','3') ;
//								}
					});
				}
			});	
			//guolanrui 20140723 增加对流程是否有正在流转的数据，如果有则不能被修改 BUG:53  end
			
		},
		editFormBuilder: function (formId, formTypeId,formName){
			$.post( $.appClient.generateUrl({ESFormBuilder : 'getHasDataFlag'}, 'x')
					,{formId:formId}, function(hasData){
						//formId,formTypeID,hasData
						var data = formId+","+formTypeId+","+hasData ;
						$.ajax({
							type:'POST',
					        url : $.appClient.generateUrl({ESFormBuilder : 'createFormBuilderPage'},'x'),
					        data: {data:data},
						    success:function(data){
						    	document.body.clientWidth - 1000;
						    	document.body.clientHeight - 500;
						    	// longjunhao 20140911 
						    	var formDisplayName = formName.length < 50 ? formName : formName.substring(0,50) + "...";
						    	$.dialog({
						    		id:'editFormDialog',
							    	title:'编辑表单-'+formDisplayName,
							    	modal:true, //蒙层（弹出会影响页面大小） 
						    	   	fixed:false,
						    	   	stack: true ,
						    	    resize: false,
						    	    lock : true,
									opacity : 0.1,
									width: 1000,
									height: 600,
									left :(document.body.clientWidth - 1000)/2,
									top :(document.body.clientHeight - 650)/2,
									padding: '0 0 0 0',
								    content:data
							    });
						    },
						    cache:false
						});
			});
		},
		publicForm :function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			checkboxs.each(function(i) {
				formId = $(this).val() ;
			});
			$.post( $.appClient.generateUrl({ESFormBuilder : 'promulgateForm'}, 'x')
					,{formId:formId}, function(res){
						var json = eval("(" + res + ")") ;
						if (json.success == 'true') {
							if(json.type&&json.type == "5"){
								formBuilderManage.showMsg('表单发布（创建数据表、启用）成功！','1');
							} else if(json.type&&json.type=="4"){
								formBuilderManage.showMsg('该表单关联的流程没有正常发布，请先发布流程，再执行发布表单！','3');
							} else if(json.type&&json.type=="3"){
								formBuilderManage.showMsg('请先关联流程再执行发布！','3');
							} else if(json.type&&json.type=="2"){
								formBuilderManage.showMsg('表单发布（创建数据表）成功，请关联流程！','1');
							}else{
								formBuilderManage.showMsg('表单发布（启用）成功！','1');
							}
							$("#formBuilderDataGrid").flexReload();
						} else {
							formBuilderManage.showMsg('表单发布失败！','2');
						}
			});
		},
		relationWorkFlow :function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var esmodelid;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["esmodelid","title"];
				var colValues = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				esmodelid = colValuesArray[0] ;
				formTitle = colValuesArray[1] ;
				formId = $(this).val() ;
			});
			if(typeof(esmodelid) != 'undefined' && esmodelid != ""){
				formBuilderManage.showMsg('此表单已关联流程；不允许再关联！','3');
				return ;
			}
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESFormBuilder : 'relationWorklfowPage'},'x'),
		        data: {formId:formId},
			    success:function(data){
			    	$.dialog({
			    		id:'formRelationWorklfowDialog',
				    	title:'关联流程-'+formTitle,
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
		relationWorkFlowAction :function(){
			var checkboxs = $('#formBuilderDataGrid_relation input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var modelId;
			checkboxs.each(function() {
				modelId = $(this).val() ;
			});
			var formId = $("#formBuilder_manager_main_relation").attr("formId") ;
			$.ajax({
				type:'POST',
				url : $.appClient.generateUrl({ESFormBuilder : 'relationWorklfow'},'x'),
				data: {formId:formId,modelId:modelId},
				success:function(res){
					var json = eval("(" + res + ")") ;
					if(json.type&&json.type == 5){
						formBuilderManage.showMsg('关联流程操作成功<br>表单发布（创建数据表、启用）成功！','1');
					} else if(json.type&&json.type==4){
						formBuilderManage.showMsg('关联流程操作成功<br>该表单关联的流程没有正常发布，请先发布流程，再执行发布表单！','1');
					} else if(json.type&&json.type==3){
						formBuilderManage.showMsg('关联流程操作成功！','1');
					} else if(json.type&&json.type==2){
						formBuilderManage.showMsg('关联流程操作成功<br>表单发布（创建数据表）成功！','1');
					}else{
						formBuilderManage.showMsg('关联流程操作成功<br>表单发布（启用）成功！','1');
					}
					$("#formBuilderDataGrid").flexReload();
					art.dialog.list['formRelationWorklfowDialog'].close();
				},
				cache:false
			});
		},
		cancelRelationWorkflow: function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var modelId;
			checkboxs.each(function() {
				var columns = ["esmodelid"];
				modelId = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				formId = $(this).val() ;
			});
			if(typeof(modelId) == 'undefined' || modelId == ""){
				formBuilderManage.showMsg('此表单未关联流程，无需执行此操作！','3');
				return ;
			}
			$.post( $.appClient.generateUrl({ESFormBuilder : 'cancelRelationWorkflow'}, 'x')
					,{formId:formId,modelId:modelId}, function(res){
						var json = eval("(" + res + ")") ;
						formBuilderManage.showMsg(json.message,json.msgType);
						$("#formBuilderDataGrid").flexReload();
			});
		},
		stopForm: function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var state;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["state","title"];
				var colValues = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				state = colValuesArray[0] ;
				formTitle = colValuesArray[1] ;
				formId = $(this).val() ;
			});
			if(typeof(state) == 'undefined' || state != "启用"){
				formBuilderManage.showMsg('只有启用状态的表单才能停用！','3');
				return ;
			}
			$.post( $.appClient.generateUrl({ESFormBuilder : 'changeFormState'}, 'x')
					,{formId:formId,formTitle:formTitle,state:2}, function(res){
						if(res == "true"){
							formBuilderManage.showMsg("表单停用成功！","1");
						} else {
							formBuilderManage.showMsg("表单停用失败！","2");
						}
						$("#formBuilderDataGrid").flexReload();
			});
		},
		reStartForm: function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var state;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["state","title"];
				var colValues = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				state = colValuesArray[0] ;
				formTitle = colValuesArray[1] ;
				formId = $(this).val() ;
			});
			if(typeof(state) == 'undefined' || state != "停用"){
				formBuilderManage.showMsg('只有停用状态的表单才能重新启用！','3');
				return ;
			}
			$.post( $.appClient.generateUrl({ESFormBuilder : 'changeFormState'}, 'x')
					,{formId:formId,formTitle:formTitle,state:1}, function(res){
						if(res == "true"){
							formBuilderManage.showMsg("表单重新启用成功！","1");
						} else {
							formBuilderManage.showMsg("表单重新启用失败！","2");
						}
						$("#formBuilderDataGrid").flexReload();
					});
		},
		deleteForm: function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var modelId;
			var state;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["esmodelid","state","title"];
				var colValues = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				modelId = colValuesArray[0] ;
				state = colValuesArray[1] ;
				formTitle = colValuesArray[2] ;
				formId = $(this).val() ;
			});
			$.post( $.appClient.generateUrl({ESWorkflow : 'isHavedWFData'}, 'x')
					,{formId:formId}, function(res){
						if (res != 'true') {
							// longjunhao 20140826 修改
							formBuilderManage.showMsg("系统中存在相关的流程数据，为了流程可以正常使用，不能进行删除操作！",'3');
							return ;
						}
						if(typeof(modelId) != 'undefined' && modelId != ""){
							formBuilderManage.deleteFormAction(formId, formTitle, modelId, "此表单已关联流程，你确定要删除表单？");
						} else {
							formBuilderManage.deleteFormAction(formId, formTitle, "", "您确定要删除表单吗？");
						}
						
			});
		},
		deleteFormAction: function(formId, formTitle, modelId, msg){
			$.dialog({
				content : msg,
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESFormBuilder : 'deleteForm'}, 'x')
							,{formId:formId,formTitle:formTitle,modelId:modelId}, function(res){
								var json = eval("(" + res + ")") ;
								formBuilderManage.showMsg(json.message,json.msgType);
								$("#formBuilderDataGrid").flexReload();
								
					});
				}
			});
		},
		copyForm: function(){
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["title"];
				formTitle = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				formId = $(this).val() ;
			});
			$.post( $.appClient.generateUrl({ESFormBuilder : 'copyForm'}, 'x')
					,{formId:formId, formTitle:formTitle}, function(res){
						var json = eval("(" + res + ")") ;
						if(json.isOk == 'true'){
							$("#formBuilderDataGrid").flexReload();
							formBuilderManage.showMsg('表单复制成功！','1');
						}else{
							if(json.msg){
								formBuilderManage.showMsg(json.msg,'3');
								return;
							}
							formBuilderManage.showMsg('表单复制失败！','2');
						}
						
			});
		},
		comboMetadata: function(){
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESFormBuilder : 'comboMetadataPage'},'x'),
			    success:function(data){
				    	$.dialog({
				    		id:'comboMetadataDialog',
					    	title:'数据字典',
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
		relationComboMetadata: function(){
			$.ajax({
				type:'POST',
				url : $.appClient.generateUrl({ESFormBuilder : 'comboMetadataPage',isFrom:'relationComboMetadata'},'x'),
				success:function(data){
					$.dialog({
						id:'relationComboMetadataDialog',
						title:'关联数据字典',
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
		queryFormBuilderList: function(){
			var keyword = $.trim($('#formBuilderQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#formBuilderDataGrid").flexOptions({query:keyword}).flexReload();
			return false;
		},
		/**导出表单*/
		exportFormbuilder: function() {
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var formId;
			var esmodelid;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["esmodelid","title"];
				var colValues = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				esmodelid = colValuesArray[0] ;
				formTitle = colValuesArray[1] ;
				formId = $(this).val() ;
			});
			//文件类型： 1 表单文件  2 模版文件  3 表单文件和模版文件
			if(typeof(esmodelid) != 'undefined' && esmodelid != ""){
				// 如果表单关联了流程，询问是否导出表单及关联的工作流模版
				$.dialog({
					content:'是否导出关联的工作流模板</br>是  ：导出表单及模版！</br>否  ：导出表单！</br>关闭：取消导出操作！',
					model:true,
					button: [{
			             name: '是',
			             callback: function () {
			                 formBuilderManage.exportForm(formId,'3');
			             },
			             focus: true
			         },{
			             name: '否',
			             callback: function () {
			            	 formBuilderManage.exportForm(formId,'1');
			             }
			         },{
			             name: '关闭'
			         }]
				});
			} else {
				//直接导出表单
				formBuilderManage.exportForm(formId,'1');
			}
		},
		/**导入表单*/
		importFormbuilder: function(formObj) {
			$.ajax({
				async : false,
				url:$.appClient.generateUrl({ESFormBuilder:'importFormbuilder'},'x'),
				success:function(url){
					formObj.ajaxSubmit({
						url:url,
						dataType:"text",
						success:function(data){
							var obj = eval('(' + data + ')');
							if (obj && obj.success && obj.isOK=='true') {
								// 刷新grid列表
								$("#formBuilderDataGrid").flexReload();
								art.dialog.list['importFormDialog'].close();
							} else {
								$.dialog({title:'操作提示',icon:'error',content:"导入表单失败"});
							}
						},
						error:function(){
							$.dialog({title:'操作提示',icon:'error',content:"系统错误，请联系管理员"});
						}
					});
				}
			});
		},
		exportForm: function(formId,expType){
			$.post($.appClient.generateUrl({ESFormBuilder:'exportFormbuilder'},'x'),{formId:formId,expType:expType},function(data){
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
		// 新建流程 longjunhao 20140610
		createWorkflow: function(){
			// 选择一个表单
			var checkboxs = $('#formBuilderDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择表单，再进行此操作！','3') ;
				return;
			}
			var formId;
			var esmodelid;
			var formTitle;
			checkboxs.each(function() {
				var columns = ["esmodelid","title"];
				var colValues = $("#formBuilderDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				esmodelid = colValuesArray[0] ;
				formTitle = colValuesArray[1] ;
				formId = $(this).val() ;
			});
			if(typeof(esmodelid) != 'undefined' && esmodelid != ""){
				formBuilderManage.showMsg('此表单已关联流程，不能再对其进行新建流程操作！','3') ;
				return;
			}
			var data = formId;
			// 新建流程先选择流程类型
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESFormBuilder:'modelTypeTreePage'},'x'),
		        data: {data:data},
		        success:function(data){
		        	$.dialog({
		        		id:'selectModelType',
		    			content:data,
		    			title:'选择模版类型',
		        	    fixed:true,
		        	    height:300,
		        	    width:300,
		        	    padding:0,
		        	    resize: false,
		        	    cancelVal: '关闭',
					    cancel: true
		    		});
		        },
			    cache:false
			});
		}
}