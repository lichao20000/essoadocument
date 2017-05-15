/**
 * 工作流管理模块
 */
$(document).ready(function() {
	var $size = {
		init : function (){
			var width = $(document).width()*0.96;
			var height = $(document).height()-110;
			var leftWidth = 230;
			if(navigator.userAgent.indexOf("MSIE 6.0")>0){
				width = width-6;
			}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
				width = width-4;
				height = height-4;
			}
			var rightWidth = width-leftWidth ;
			var tblHeight = height - 147;
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
	var setting = {
		view : {
			dblClickExpand : true,
			selectedMulti : false,
			showLine : false
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		callback : {
			onClick : onZTreeObjClick
		}
	};
	function onZTreeObjClick(e,treeId, treeNode) {
		var url=$.appClient.generateUrl({ESTransferFlow: 'getWfModelDataList',type_id:treeNode.id}, 'x');
		$("#modelDataGrid").flexOptions({url:url, newp:1}).flexReload();
	}
	$.ajax({
		dataType : "json",
		url : $.appClient.generateUrl({ESTransferFlow : 'showModelTypeTree'}, 'x'),
		error : function() {
			alert('请求失败');
		},
		success : function(zTreeNodes) {
			zTreeObj = $.fn.zTree.init($("#modelTypeTree"), setting, zTreeNodes);
			var root=zTreeObj.getNodes()[0];
    		zTreeObj.selectNode(root);
		}
	});
	
	//给ztree上边的按钮添加点击事件
	$(".treeTbar").find("span").each(function(){
		$(this).click(function(){
			var hander = $(this).attr("hander") ;
	    	eval("treeTbar."+hander);
		});
	});
	
	//添加ztree上边的按钮点击事件相关处理方法
	var treeTbar = {		
		//左侧分类树添加方法
		addFun: function (){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var selectedParentNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'warning',content : "请先选择工作流类型树根节点，再进行此操作",time : 3});
					return false;
				}else if(nodes[0].name!="工作流类型" || nodes[0].id!=0){
					$.dialog.notice({icon : 'warning',content : "只有根节点可以添加类型节点，当前选择节点不能进行此操作",time : 3});
					return false;
				}
				selectedParentNode = nodes[0] ;
			}else{
				$.dialog.notice({icon : 'warning',content : "工作流类型树不存在，不能进行此操作",time : 3});
				return false;
			}
			var url=$.appClient.generateUrl({ESTransferFlow : 'addModelTypePage'},'x');
			$.ajax({
				url : url,
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
					    init: function(){
					    	$('#modelTypeForm').autovalidate();
					    },
					    ok:function(){
					    	if(!$('#modelTypeForm').validate())return false ;
					    	var modelTypeName = $("#modelTypeForm input[name='modelTypeName']") ;
					    	if(!uniqueName(modelTypeName,"",selectedParentNode.id)) return false;					    	
					    	confirmAdd({pId : selectedParentNode.id,name : modelTypeName.val()},treeObj,selectedParentNode);
					    }			
				    });
			    },
			    cache:false
			});
		},
		
		//左侧分类树编辑方法
		editFun: function (){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var modelTypeId = 0 ;
			var selectedNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'warning',content : "请先选择一个工作流类型树的叶子节点，再进行此操作",time : 3});
					return false;
				}else if(nodes[0].name == "工作流类型" || nodes[0].id==0){
					$.dialog.notice({icon : 'warning',content : "只可以对叶子节点进行编辑操作，当前选择节点不能进行此操作",time : 3});
					return false;
				}
				modelTypeId = nodes[0].id;
				selectedNode = nodes[0] ;
			}else{
				$.dialog.notice({icon : 'warning',content : "工作流类型树不存在，不能进行此操作",time : 3});
				return false;
			}
			var url=$.appClient.generateUrl({ESTransferFlow : 'editModelTypePage',id:modelTypeId},'x');
			$.ajax({
		        url : url,
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
					    init: function(){
					    	$('#modelTypeForm').autovalidate();
					    },
					    ok:function(){
					    	if(!$('#modelTypeForm').validate())return false ;
					    	var modelTypeName = $("#modelTypeForm input[name='modelTypeName']") ;
					    	var oldModelTypeName = $("#modelTypeForm input[name='oldModelTypeName']").val() ;
					    	if(modelTypeName.val()!=oldModelTypeName){
					    		if(!uniqueName(modelTypeName,oldModelTypeName,selectedNode.pId)) return false;
					    		confirmEdit({id:modelTypeId,name:modelTypeName.val()},treeObj,selectedNode);
					    	}else{
					    		$.dialog.notice({icon : 'success',content : "修改成功",time : 3});
					    	}
					    }							    
				    });
			    },
			    cache:false
			});
		},
				
		//左侧分类树删除方法
		deleteFun: function (){
			var treeObj = $.fn.zTree.getZTreeObj("modelTypeTree");
			var modelTypeId = 0 ;
			var modelTypeName = "";
			var selectedNode = null ;
			if(treeObj != null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length <= 0){
					$.dialog.notice({icon : 'warning',content : "请先选择一个工作流类型树的叶子节点，再进行此操作",time : 3});
					return false;
				}else if(nodes[0].name=="工作流类型" || nodes[0].id==0){
					$.dialog.notice({icon : 'warning',content : "只可以对叶子节点进行删除操作，当前选择节点不能进行此操作",time : 3});
					return false;
				}
				modelTypeId = nodes[0].id;
				modelTypeName=nodes[0].name;
				selectedNode = nodes[0] ;
			}else{
				$.dialog.notice({icon : 'warning',content : "工作流类型树不存在，不能进行此操作",time : 3});
				return false;
			}
			$.dialog({
				title:'删除分类',
				content : "<div style='padding:20px 20px;vertical-align:middle'>确定要<span style='color:red'>删除</span>“<span style='color:red'>"+modelTypeName+"</span>”吗？</div>",
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					var ids=[];
		    		ids.push(modelTypeId);
		    		confirmDel({ids:getChildren(ids,selectedNode)},treeObj,selectedNode);//确定删除类型
				}
			});
		}
	}
	
	//确定添加类型
	function confirmAdd(param,treeObj,selectedParentNode){
		var url=$.appClient.generateUrl({ESTransferFlow : 'addModelType'} , 'x');
    	$.post(url,param, function(data){
			if (data) {
				$.dialog.notice({icon : 'success',content : "添加成功",time : 3});
				treeObj.addNodes(selectedParentNode,data);
			} else {
				$.dialog.notice({icon : 'error',content : "添加失败，请检查类型名称是否重复",time : 3});
				return false;
			}
		},"json");
	}
	
	//确定编辑类型
	function confirmEdit(param,treeObj,selectedNode){
		var url= $.appClient.generateUrl({ESTransferFlow : 'editModelType'}, 'x');
		$.post(url,param, function(data){
			if (data) {
				$.dialog.notice({icon : 'error',content : data,time : 3});
				return false;
			} else {
				$.dialog.notice({icon : 'success',content : "修改成功",time : 3});
				selectedNode.name=param.name;
				treeObj.updateNode(selectedNode);
			}
		});
	}
	
	//确定删除类型
	function confirmDel(param,treeObj,selectedNode){
		var url=$.appClient.generateUrl({ESTransferFlow : 'deleteModelType'}, 'x');
		$.post( url,param, function(data){
			if (data) {
				var icon=(data.indexOf("失败")==-1)?'warning':'error';
				$.dialog.notice({icon : icon,content : data,time : 3});
				return false;
			} else {
				$.dialog.notice({icon : 'success',content : "删除成功",time : 3});
				treeObj.removeNode(selectedNode);
			}
		});
	}
	
	//获取选中节点下的所有子节点id
	function getChildren(ids,treeNode){
		if (treeNode.isParent){
			for(var obj in treeNode.children){
				ids.push(treeNode.children[obj].id);
				getChildren(ids,treeNode.children[obj]);
			}
		}
		return ids;
	}
	
	//流程类型名称唯一验证
	function uniqueName(name,oldName,pId){
		var flag=true;
		var partName=name.val();
		if(partName!=oldName){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESTransferFlow:'uniqueName'},'x'),
				data:{name:partName,pId:pId},
				async:false,//同步设置
				success:function(data){
					if(data=="false"){
						name.addClass("invalid-text");
						name.attr('title',"此流程类型名称已存在");
	    				flag=false;
	    				return false;
	    			}
					name.removeClass("invalid-text");
					name.attr('title',"");
				}
			});
		}
		return flag;
	}
	
	//生成右侧的grid
	$("#modelDataGrid").flexigrid({url :$.appClient.generateUrl({ESTransferFlow: 'getWfModelDataList'}, 'x'),
		dataType : 'json',
		colModel : [ 
		    {display : '数据标识',name :'id',hide:true,width:30,align:'center'},        
	        {display : '序号',name : 'num',width :10,align : 'center'}, 
		    {display : '',name : 'ids',width : 15,align : 'center'}, 
		    {display : '操作',name : 'modify',width : 30,sortable : true,align : 'center'},
		    {display : 'flowId',name : 'modelId',width : 30,hide:true,sortable : true,align : 'right'},
			{display : 'flowTypeId',name : 'modelTypeId',width : 40,hide:true,align : 'right'},
			{display : '状态',name : 'status',metadata:'status',width : 30,sortable : true,align : 'center'},
			{display : '工作流名称',name : 'name',metadata:'name',width : 150,align : 'left'},
			{display : '收集范围',name : 'business_relation',metadata:'business_relation',width : 120,align : 'left'},
			{display : '关联表单',name : 'form_relation',metadata:'form_relation',width : 120,sortable : true,align : 'left'},
			{display : '描述',name : 'describtion',width : 150,align : 'left'},
			{display : '创建人',name : 'creater',width : 80,align : 'left'},
			{display : '创建时间',name : 'createtime',width : 120,align : 'center'},
			{display : '修改人',name : 'modifyer',width : 80,align : 'left'},
			{display : '修改时间',name : 'modifytime',width : 120,align : 'center'},
			{display : '版本',name : 'version',width : 30,align : 'right'}],
		buttons : [ {name : '定制流程',bclass : 'wf_add',	onpress : function(){workFlowManage.createWorkFlow();}}, 
		            {name : '删除',bclass : 'wf_delete',	onpress : function(){workFlowManage.deleteWorkflow();}}, 
		            {name : '发布',bclass : 'wf_public',	onpress : function(){workFlowManage.publicWorkFlow();}},
		            /** lujixiang 20150421 添加暂停流程功能 **/
		            {name : '暂停',bclass : 'wf_public',	onpress : function(){workFlowManage.haltWorkFlow();}},
		            {name : '复制',bclass : 'wf_copy',	onpress : function(){workFlowManage.copyWorkflow();}}, 
		            {name : '测试',bclass : 'wf_test',	onpress : function(){workFlowManage.detectionWorkflow();}},
		            {name : '导入',bclass : 'wf_import',	onpress : function(){showImportWorkflowWin();}}, 
		            {name : '导出',bclass : 'wf_exort',	onpress : function(){workFlowManage.exportWorkflow();}},
		            {name : '函数设置',bclass : 'wf_functionSet',	onpress : function(){workFlowManage.functionSet();}}],
		singleSelect:true,
		usepager: true,
		title: '工作流管理',
		nomsg:"没有数据",
		useRp: true,
		width: $size.init().rightWidth,
		height: $size.init().tblHeight,
		showTableToggleBtn: true,
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...'
	});

	//单选
	$("#modelDataGrid tbody tr").die().live('click',function(){
		if($(this).find("input[type='checkbox']").attr('checked')=="checked"){
			$("#modelDataGrid input[type='checkbox']").attr('checked',false);
			$(this).find("input[type='checkbox']").attr('checked',true);
		}
	});
	
	//工作流编辑按钮
	$("#modelDataGrid .editbtn").die().live("click", function(){
		workFlowManage.editWorkFlow_before($(this).closest("tr").prop("id").substr(3));
	});  

	/**
	 * 弹出导入窗口
	 */
	function showImportWorkflowWin() {
		
		/** lujixiang 20150422 添加选择树判断 **/
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
		
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESTransferFlow:'importWorkflowPage'},'x'),
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
	    					$.dialog.notice({icon:'warning',content:"请选择文件！", time:2});
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