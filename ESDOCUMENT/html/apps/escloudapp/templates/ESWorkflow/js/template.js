//生成树形结构的方法
$(document).ready(function() {
	
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 230;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width - leftWidth;
				var tblHeight = height - 147;
				$("#workflow_model_type").height(height-33);
				$('#modelTypeTree').height(height-95);
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};
		
	var zTreeObj;
	var zTreeNodes;
	var setting = {
		view : {
			selectedMulti : false,
			showLine : false
		},
		callback : {
			onClick : onZTreeObjClick
		}
	};

	function onZTreeObjClick(e,treeId, treeNode) {
//		var zTree = $.fn.zTree.getZTreeObj("modelTypeTree");
//		zTree.expandNode(treeNode);
		$("#modelDataGrid").flexOptions({url:$.appClient.generateUrl({ESWorkflow: 'getWfModelDataList',typeID:treeNode.id}, 'x'), newp:1}).flexReload();
	}
	
	$.ajax({
		dataType : "json",
		url : $.appClient.generateUrl({
			ESWorkflow : 'showModelTypeTree'
		}, 'x'),// 请求的action路径
		error : function() {// 请求失败处理函数
			alert('请求失败');
		},
		success : function(data) { // 请求成功后处理函数。
			zTreeNodes = data; // 把后台封装好的简单Json格式赋给treeNodes
			zTreeObj = $.fn.zTree.init($("#modelTypeTree"), setting, zTreeNodes);
    		zTreeObj.selectNode(zTreeObj.getNodes()[0]);
		}
	});
	
	/** xiaoxiong 20140512 给ztree上边的按钮添加点击事件 **/
	$(".treeTbar").find("span").each(function(){
		$(this).click(function(){
			var hander = $(this).attr("hander") ;
	    	eval("treeTbar."+hander);
		});
	});
	
	/** xiaoxiong 20140512 添加ztree上边的按钮点击事件相关处理方法 **/
	var treeTbar = {
		/** 验证左侧分类树表单是否合法 **/
		validateForm: function (){
			var modelTypeNameObj = $("#modelTypeForm input[name='modelTypeName']") ;
	    	var modelTypeName = modelTypeNameObj.val().trim() ;
	    	if(modelTypeName == ''){
	    		modelTypeNameObj.addClass("warnning") ;
	    		modelTypeNameObj.attr("title","不能为空！");
	    		return false ;
	    	} else {
	    		modelTypeNameObj.attr("title","");
	    	}
	    	return true ;
		},
		/** 左侧分类树添加方法 **/
		addFun: function (){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var selectedParentNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					workFlowManage.showMsg('请先选择工作流类型树根节点，再进行此操作！', '3') ;
					return ;
				}else if(nodes[0].name!="工作流类型"){
					workFlowManage.showMsg('只有根节点可以添加类型节点，当前选择节点不能进行此操作！', '3') ;
					return ;
				}
				selectedParentNode = nodes[0] ;
			}else{
				workFlowManage.showMsg('工作流类型树不存在，不能进行此操作！', '3') ;
				return ;
			}
			$.ajax({
			        url : $.appClient.generateUrl({ESWorkflow : 'addModelTypePage',data:''},'x'),
				    success:function(data){
					    	$.dialog({
					    		id : 'addModelTypeDialog',
						    	title:'添加分类',
						    	modal:true, //蒙层（弹出会影响页面大小） 
					    	   	fixed:false,
					    	   	stack: true ,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
						    	okVal:'保存',
							    ok:true,
							    cancelVal: '关闭',
							    cancel: true,
							    content:data,
							    ok:function(){
							    	// longjunhao 20140924 修复bug1209
							    	if(!$('#modelTypeForm').validate())return false ;
//							    	if(!treeTbar.validateForm())return false ;
							    	var postData = $("#modelTypeForm").serialize(); 
							    	var modelTypeName = $("#modelTypeForm input[name='modelTypeName']").val() ;
							    	$.post( $.appClient.generateUrl({ESWorkflow : 'addModelType'}, 'x')
							    			,{data : postData}, function(res){
							    				var jsonDX = eval('(' + res + ')');
								    			if (jsonDX.res == 'true') {
								    				workFlowManage.showMsg('添加成功！', '1') ;
								    				var newNode = {name:modelTypeName,id:jsonDX.id};
								    				treeObj.addNodes(selectedParentNode,newNode);
								    				art.dialog.list['addModelTypeDialog'].close();
								    			} else {
								    				workFlowManage.showMsg('添加失败，请检查类型名称是否重复！', '2') ;
								    			}
				        			});
							    	return false;
							    },
							    init: function(){
							    	$('#modelTypeForm').autovalidate();
							    }
						    });
				    },
				    cache:false
			});
		},
		/** 左侧分类树编辑方法 **/
		editFun: function (){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var modelTypeId = -1 ;
			var modelTypeName = -1 ;
			var selectedNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					workFlowManage.showMsg('请先选择一个工作流类型树的叶子节点，再进行此操作！', '3') ;
					return ;
				}else if(nodes[0].name=="工作流类型"){
					workFlowManage.showMsg('只可以对叶子节点进行编辑操作，当前选择节点不能进行此操作！', '3') ;
					return ;
				}
				modelTypeId = nodes[0].id;
				modelTypeName = nodes[0].name;
				selectedNode = nodes[0] ;
			}else{
				workFlowManage.showMsg('工作流类型树不存在，不能进行此操作！', '3') ;
				return ;
			}
			var data = modelTypeId+','+modelTypeName ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESWorkflow : 'editModelTypePage'},'x'),
			        data: {data:data},
			        success:function(data){
					    	$.dialog({
					    		id:'editModelTypeDialog',
						    	title:'修改分类',
						    	modal:true, //蒙层（弹出会影响页面大小） 
					    	   	fixed:false,
					    	   	stack: true ,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
						    	okVal:'保存',
							    ok:true,
							    cancelVal: '关闭',
							    cancel: true,
							    content:data,
							    ok:function(){
							    	if(!$('#modelTypeForm').validate())return false ;
//							    	if(!treeTbar.validateForm())return false ;
							    	var postData = $("#modelTypeForm").serialize(); 
							    	var modelTypeName = $("#modelTypeForm input[name='modelTypeName']").val() ;
							    	var oldModelTypeName = $("#modelTypeForm input[name='oldModelTypeName']").val() ;
							    	if (oldModelTypeName != modelTypeName) {
							    		$.post( $.appClient.generateUrl({ESWorkflow : 'editModelType'}, 'x')
							    				,{data:postData}, function(res){
							    					if (res == 'true') {
							    						selectedNode.name=modelTypeName;
							    						treeObj.updateNode(selectedNode);
							    						workFlowManage.showMsg('修改成功！', '1') ;
							    						art.dialog.list['editModelTypeDialog'].close();
							    					} else {
							    						workFlowManage.showMsg('修改失败,请检查类型名称是否重复！', '2') ;
							    					}
							    				});
							    		return false;
							    	} else {
							    		workFlowManage.showMsg('修改成功！', '1') ;
							    		return true;
							    	}
							    },
							    init: function(){
							    	$('#modelTypeForm').autovalidate();
							    }
						    });
				    },
				    cache:false
			});
		},
		/** 左侧分类树删除方法 **/
		deleteFun: function (){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var modelTypeId = -1 ;
			var selectedNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					workFlowManage.showMsg('请先选择一个工作流类型树的叶子节点，再进行此操作！', '3') ;
					return ;
				}else if(nodes[0].name=="工作流类型"){
					workFlowManage.showMsg('只可以对叶子节点进行删除操作，当前选择节点不能进行此操作！', '3') ;
					return ;
				}
				modelTypeId = nodes[0].id;
				selectedNode = nodes[0] ;
			}else{
				workFlowManage.showMsg('工作流类型树不存在，不能进行此操作！', '3') ;
				return ;
			}
			$.dialog({
				content : '确定要删除吗？删除后不能恢复！',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESWorkflow : 'deleteModelType'}, 'x')
			    			,{modelTypeId:modelTypeId}, function(res){
	    				var json = eval("("+res+")");
        				if (json.success == 'true' && json.isOK=='true') {
        					treeObj.removeNode(selectedNode);
        					workFlowManage.showMsg('删除成功！', '1') ;
        				} else if(json.success == 'false' && json.isOK=='false'){
        					workFlowManage.showMsg('该类型下有流程模版数据，不能直接删除！', '3') ;
        				} else {
        					workFlowManage.showMsg('删除失败！', '2') ;
        				}
        			});
				}
			});
		}
	}
	
	//生成右侧的grid
	$("#modelDataGrid").flexigrid({url :$.appClient.generateUrl({ESWorkflow: 'getWfModelDataList'}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 15,align : 'center'}, 
		    {display : '',name : 'ids',width : 15,align : 'center'}, 
		    {
				display : 'modelId',
				name : 'modelId',
				metadata:'modelId',
//				width : 30,
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : '唯一标识',
				name : 'identifier',
//				width : 40,
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : 'modelTypeId',
				name : 'modelTypeId',
				metadata:'modelTypeId',
//				width : 40,
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : '关联业务',
				name : 'business',
				metadata:'business',
//				width : 30,
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : '操作',
				name : 'modify',
				metadata : 'modify',
				width : 30,
				sortable : true,
				align : 'left'
			},{
				display : '状态',
				name : 'state',
				metadata : 'state',
				width : 30,
				sortable : true,
				align : 'left'
			},{
				display : '工作流名称',
				name : 'workflowName',
				metadata : 'workflowName',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '描述',
				name : 'description',
				metadata : 'description',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '关联表单',
				name : 'relationFormName',
				metadata : 'relationFormName',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '关联表单ID',
				name : 'relationForm',
				metadata : 'relationForm',
				width : 30,
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : '创建人',
				name : 'creater',
				metadata : 'creater',
				width : 60,
				sortable : true,
				align : 'left'
			},{
				display : '创建时间',
				name : 'createTime',
				width : 120,
				sortable : true,
				align : 'left'
			},{
				display : '修改人',
				name : 'updateBy',
				width : 60,
				sortable : true,
				align : 'left'
			},{
				display : '修改时间',
				name : 'updateTime',
				width : 120,
				sortable : true,
				align : 'left'
			},{
				display : '版本',
				name : 'version',
				width : 30,
				sortable : true,
				align : 'left'
			
//			},{
			//工作流管理字段 end -------------------------------------------------------------------------------------
				
//				display : '注释',
//				name : 'roleRemark',
//				metadata:'roleRemark',
//				width : 300,
//				align : 'left'
		}],
		buttons : [ {
				name : '定制流程',
				bclass : 'wf_add',
				onpress : function(){workFlowManage.createWorkFlow();}
			}, {
				name : '删除',
				bclass : 'wf_delete',
				onpress : function(){workFlowManage.deleteWorkflow();}
			}, {
				name : '发布',
				bclass : 'wf_public',
				onpress : function(){workFlowManage.publicWorkFlow();}
			}, {
				name : '复制',
				bclass : 'wf_copy',
				onpress : function(){workFlowManage.copyWorkflow();}
			}, {
				name : '测试',
				bclass : 'wf_test',
				onpress : function(){workFlowManage.detectionWorkflow();}
			}, {
				name : '导入',
				bclass : 'wf_import',
				onpress : function(){showImportWorkflowWin();}
			}, {
				name : '导出',
				bclass : 'wf_exort',
				onpress : function(){workFlowManage.exportWorkflow();}
			}, {
				name : '函数设置',
				bclass : 'wf_functionSet',
				onpress : function(){workFlowManage.functionSet();}
		}],
		singleSelect:true,
		usepager : true,
		title : '工作流管理',
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#workflowDataGridDiv").position().top;
		var flex = $("#modelDataGrid").closest("div.flexigrid");
		var bDiv = flex.find('.bDiv');
	    var contentHeight = bDiv.height();
	    var headflootHeight = flex.height() - contentHeight; 
	    bDiv.height(h - headflootHeight);
		flex.height(h);
		$('#modelTypeTree').height(h - 55);
		// 修改IE表格宽度兼容
		if($.browser.msie && $.browser.version==='6.0'){
			flex.css({width:"-=3px"});
		}
	};
//	sizeChanged();
	$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="workflowQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="workFlowManage.query()"></span></div>');
	//单选
	$("#modelDataGrid tbody tr").die().live('click',function(){
		var selectTr = $(this);
		$(".checkbox").each(function(){
			if($(this).attr('checked')=="checked"){
				if($(this).closest("tr")[0]!=selectTr[0]){
					$(this).attr('checked',false);
				}
			}
		});
	});
	/** xiaoxiong 20140415 工作流编辑按钮 **/
	$("#modelDataGrid .editbtn").die().live("click", function(){
		workFlowManage.editWorkFlow_before($(this).closest("tr"));
	});  

	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'workflowQuery') {
			workFlowManage.query();
		}
	});
	
	/**
	 * 弹出导入窗口
	 * @author longjunhao 20140610
	 */
	function showImportWorkflowWin() {
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESWorkflow:'importWorkflowPage'},'x'),
	        data: {data:""},
	        success:function(data){
	        	$.dialog({
	        		id:'importWorkflowDialog',
	    			content:data,
	    			title:'数据导入',
	    			okVal:"确定",
	    			cancelVal:"取消",
	        	    fixed:true,
	        	    resize: false,
	    			cancel:true,
	    			ok:function(){
	    				// 检测表单文件是否已经选择
	    				if(!$("[name='workflowFile']").val()) {
	    					$.dialog.notice({icon:'error',content:"请选择文件！", time:2});
	    				} else {
	    					workFlowManage.importWorkflow($('#importWorkflow'));
	    				}
	    				return false;
	    			}
	    		});
	        },
		    cache:false
		});
	}
});







