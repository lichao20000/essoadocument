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
				
				$("#formBuilder_model_type").height(height-33);
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
//		var zTree = $.fn.zTree.getZTreeObj("formBuilderTypeTree");
//		zTree.expandNode(treeNode);
		$("#formBuilderDataGrid").flexOptions({url:$.appClient.generateUrl({ESFormBuilder: 'getFormBuilderDataList',typeID:treeNode.id}, 'x')}).flexReload();
	}
	
	$.ajax({
		dataType : "json",
		url : $.appClient.generateUrl({
			ESFormBuilder : 'showFormTypeTree'
		}, 'x'),// 请求的action路径
		error : function() {// 请求失败处理函数
			alert('请求失败');
		},
		success : function(data) { // 请求成功后处理函数。
			zTreeNodes = data; // 把后台封装好的简单Json格式赋给treeNodes
			zTreeObj = $.fn.zTree.init($("#formBuilderTypeTree"), setting, zTreeNodes);
    		zTreeObj.selectNode(zTreeObj.getNodes()[0]);
		}
	});
	
	/** 给ztree上边的按钮添加点击事件 **/
	$(".treeTbar").find("span").each(function(){
		$(this).click(function(){
			var hander = $(this).attr("hander") ;
	    	eval("treeTbar."+hander);
		});
	});
	
	/** 添加ztree上边的按钮点击事件相关处理方法 **/
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
			var treeObj = $.fn.zTree.getZTreeObj("formBuilderTypeTree");
			var selectedParentNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'error',content : '请先选择工作流类型树根节点，再进行此操作！',title : '3秒后自动关闭',time : 3});
					return ;
				}else if(nodes[0].name!="表单类型"){
					$.dialog.notice({icon : 'error',content : '只有根节点可以添加类型节点，当前选择节点不能进行此操作！',title : '3秒后自动关闭',time : 3});
					return ;
				}
				selectedParentNode = nodes[0] ;
			}else{
				$.dialog.notice({icon : 'error',content : '工作流类型树不存在，不能进行此操作！',title : '3秒后自动关闭',time : 3});
				return ;
			}
			$.ajax({
			        url : $.appClient.generateUrl({ESFormBuilder : 'addFormTypePage',data:''},'x'),
				    success:function(data){
					    	$.dialog({
					    		id:'addFormTypeDialog',
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
							    	$.post( $.appClient.generateUrl({ESFormBuilder : 'addFormType'}, 'x')
							    			,{data : postData}, function(res){
							    				var jsonDX = eval('(' + res + ')');
								    			if (jsonDX.res == 'true') {
								    				$.dialog.notice({icon : 'succeed',content : '添加成功！',title : '3秒后自动关闭',time : 3});
								    				var newNode = {name:modelTypeName,id:jsonDX.id};
								    				treeObj.addNodes(selectedParentNode,newNode);
								    				art.dialog.list['addFormTypeDialog'].close();
								    			} else {
								    				$.dialog.notice({icon : 'error',content : '添加失败，请检查类型名称是否重复！',title : '3秒后自动关闭',time : 3});
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
			var treeObj = $.fn.zTree.getZTreeObj("formBuilderTypeTree");
			var modelTypeId = -1 ;
			var modelTypeName = -1 ;
			var selectedNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'error',content : '请先选择一个工作流类型树的叶子节点，再进行此操作！',title : '3秒后自动关闭',time : 3});
					return ;
				}else if(nodes[0].name=="表单类型"){
					$.dialog.notice({icon : 'error',content : '只可以对叶子节点进行编辑操作，当前选择节点不能进行此操作！',title : '3秒后自动关闭',time : 3});
					return ;
				}
				modelTypeId = nodes[0].id;
				modelTypeName = nodes[0].name;
				selectedNode = nodes[0] ;
			}else{
				$.dialog.notice({icon : 'error',content : '工作流类型树不存在，不能进行此操作！',title : '3秒后自动关闭',time : 3});
				return ;
			}
			var data = modelTypeId+','+modelTypeName ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormBuilder : 'editFormTypePage'},'x'),
			        data: {data:data},
			        success:function(data){
					    	$.dialog({
					    		id:'editFormTypeDialog',
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
							    		$.post( $.appClient.generateUrl({ESFormBuilder : 'editFormType'}, 'x')
							    				,{data:postData}, function(res){
					    					if (res == 'true') {
					    						selectedNode.name=modelTypeName;
					    						treeObj.updateNode(selectedNode);
					    						$.dialog.notice({icon : 'succeed',content : '修改成功！',title : '3秒后自动关闭',time : 3});
					    						art.dialog.list['editFormTypeDialog'].close();
					    					} else {
					    						$.dialog.notice({icon : 'error',content : '修改失败,请检查类型名称是否重复！',title : '3秒后自动关闭',time : 3});
					    					}
					    				});
							    		return false;
							    	} else {
							    		$.dialog.notice({icon : 'succeed',content : '修改成功！',title : '3秒后自动关闭',time : 3});
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
			var treeObj = $.fn.zTree.getZTreeObj("formBuilderTypeTree");
			var modelTypeId = -1 ;
			var selectedNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'error',content : '请先选择一个工作流类型树的叶子节点，再进行此操作！',title : '3秒后自动关闭',time : 3});
					return ;
				}else if(nodes[0].name=="表单类型"){
					$.dialog.notice({icon : 'error',content : '只可以对叶子节点进行删除操作，当前选择节点不能进行此操作！',title : '3秒后自动关闭',time : 3});
					return ;
				}
				modelTypeId = nodes[0].id;
				selectedNode = nodes[0] ;
			}else{
				$.dialog.notice({icon : 'error',content : '工作流类型树不存在，不能进行此操作！',title : '3秒后自动关闭',time : 3});
				return ;
			}
			$.dialog({
				content : '确定要删除吗？删除后不能恢复！',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESFormBuilder : 'deleteFormType'}, 'x')
			    			,{modelTypeId:modelTypeId}, function(res){
	    				var json = eval("("+res+")");
        				if (json.success && json.isOK=='true') {
        					treeObj.removeNode(selectedNode);
        					$.dialog.notice({icon : 'succeed',content : '删除成功！',title : '3秒后自动关闭',time : 3});
        				} else if (!json.success && json.isOK=='false') {
        					$.dialog.notice({icon : 'warning',content : '该类型下有表单数据，不能直接删除！',title : '3秒后自动关闭',time : 3});
        				} else {
        					$.dialog.notice({icon : 'error',content : '删除失败！',title : '3秒后自动关闭',time : 3});
        				}
        			});
				}
			});
		}
	}
	
	//生成右侧的grid
	$("#formBuilderDataGrid").flexigrid({url :$.appClient.generateUrl({ESFormBuilder: 'getFormBuilderDataList'}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 15,align : 'center'}, 
		    {display : '',name : 'ids',width : 15,align : 'center'}, 
		    {
				display : 'id',
				name : 'id',
				metadata:'id',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : 'formTypeId',
				name : 'formTypeId',
				metadata:'formTypeId',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : 'esmodelid',
				name : 'esmodelid',
				metadata:'esmodelid',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : '操作',
				name : 'modify',
				metadata : 'modify',
				width : 30,
				sortable : false,
				align : 'left'
			},{
				display : '状态',
				name : 'state',
				metadata : 'state',
				width : 30,
				sortable : true,
				align : 'left'
			},{
				display : '是否建表',
				name : 'isCreate',
				metadata : 'isCreate',
				metadata : 'isCreate',
				width : 50,
				sortable : true,
				align : 'left'
			},{
				display : '名称',
				name : 'title',
				metadata : 'title',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '关联流程',
				name : 'esModelName',
				metadata : 'esModelName',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '创建人',
				name : 'creater',
				metadata : 'creater',
				width : 100,
				sortable : true,
				align : 'left'
			},{
				display : '创建时间',
				name : 'createTime',
				metadata : 'createTime',
				width : 120,
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : '修改人',
				name : 'updateBy',
				metadata : 'updateBy',
				width : 100,
				sortable : true,
				align : 'left'
			},{
				display : '修改时间',
				name : 'updateTime',
				metadata : 'updateTime',
				width : 120,
				sortable : true,
				align : 'left'
			},{
				display : '版本',
				name : 'version',
				metadata : 'version',
				width : 30,
				sortable : true,
				align : 'left'
		}],
		buttons : [ {
				name : '定制表单',
				bclass : 'formbuilder_add',
				onpress : function(){formBuilderManage.createForm();}
			}, {
				name : '删除',
				bclass : 'formbuilder_delete',
				onpress : function(){formBuilderManage.deleteForm();}
			}, {
				name : '发布',
				bclass : 'formbuilder_public',
				onpress : function(){formBuilderManage.publicForm();}
			}, {
				name : '重新启用',
				bclass : 'formbuilder_reRun',
				onpress : function(){formBuilderManage.reStartForm();}
			}, {
				name : '停用',
				bclass : 'formbuilder_stop',
				onpress : function(){formBuilderManage.stopForm();}
			}, {
				name : '复制',
				bclass : 'formbuilder_copy',
				onpress : function(){formBuilderManage.copyForm();}
			},{
				name: '更多操作&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', 
				bclass: 'more',
				//guolanrui 20140723 暂时将更多操作中提示信息里的 ‘统计’ 去掉，二期开发需要统计功能的时候再添加BUG:55
//				tooltip:'包含新建流程、关联流程、取消关联、数据字典、统计、导入、导出。',
				tooltip:'包含新建流程、关联流程、取消关联、数据字典、导入、导出。',
				id:'do_more',
				more:[
	                 {name: '新建流程', bclass: 'formbuilder_newWorkFlow',tooltip:'给表单创建一个流程',onpress:formBuilderManage.createWorkflow},
	 				 {name: '关联流程', bclass: 'formbuilder_addLink',tooltip:'给表单关联已发布的流程',onpress:formBuilderManage.relationWorkFlow},
	 				 {name: '取消关联', bclass: 'formbuilder_dropLink',tooltip:'取消表单与流程的关联',onpress:formBuilderManage.cancelRelationWorkflow},
	                 {name: '数据字典',bclass:"formbuilder_book",tooltip:'下拉框组件元数据设置',onpress:formBuilderManage.comboMetadata},
	                 {name: '导入',bclass:"formbuilder_Import",tooltip:'导入从其他同版本产品中导出的表单',onpress:showImportFormWin},
	                 {name: '导出',bclass:"formbuilder_Exort",tooltip:'导出已正常发布的表单',onpress:formBuilderManage.exportFormbuilder}
	 				]
		}],
		singleSelect:true,
		usepager : true,
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
		var h = $(window).height() - $("#formBuilderDataGridDiv").position().top;
		var flex = $("#formBuilderDataGrid").closest("div.flexigrid");
		var bDiv = flex.find('.bDiv');
	    var contentHeight = bDiv.height();
	    //gengqianfeng 20140918 修改分页控件下边界距离
	    var headflootHeight = flex.height() - contentHeight  + 10; 
	    bDiv.height(h - headflootHeight);
		flex.height(h);
		// 修改IE表格宽度兼容
		if($.browser.msie && $.browser.version==='6.0'){
			flex.css({width:"-=3px"});
		}
	};
	sizeChanged();
	$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="formBuilderQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="formBuilderManage.queryFormBuilderList()"></span></div>');
	 function formatValue(tdDiv){
			if(tdDiv.innerHTML=='1')
				tdDiv.innerHTML='是';
			else 
				tdDiv.innerHTML='否';
	};
	//单选
	$("#formBuilderDataGrid tbody tr").die().live('click',function(){
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
	$(".editbtn").die().live("click", function(){
		formBuilderManage.editFormBuilder_before($(this).closest("tr"));
	});  

	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'formBuilderQuery') {
			formBuilderManage.queryFormBuilderList();
		}
	});
	
	/**
	 * 弹出导入窗口
	 * @author longjunhao 20140606
	 */
	function showImportFormWin() {
		var treeObj = $.fn.zTree.getZTreeObj("formBuilderTypeTree");
		var modelTypeId = -1 ;
		var modelTypeName = -1 ;
		var selectedNode = null ;
		if(treeObj != null){
			var nodes = treeObj.getSelectedNodes();
			modelTypeId = nodes[0].id;
			modelTypeName = nodes[0].name;
			selectedNode = nodes[0];
		}
		var data = modelTypeId+','+modelTypeName ;
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormBuilder:'importFormPage'},'x'),
	        data: {data:data},
	        success:function(data){
	        	$.dialog({
	        		id : 'importFormDialog',
	    			content:data,
	    			title:'数据导入',
	    			okVal:"确定",
	    			cancelVal:"取消",
	        	    fixed:true,
	        	    resize: false,
	    			cancel:true,
	    			ok:function(){
	    				// 检测表单文件是否已经选择
	    				if(!$("[name='formFile']").val()) {
	    					$.dialog.notice({icon:'error',content:"请选择文件！", time:2});
	    				} else {
	    					formBuilderManage.importFormbuilder($('#importForm'));
	    				}
	    				return false;
	    			}
	    		});
	        },
		    cache:false
		});
	}
});



