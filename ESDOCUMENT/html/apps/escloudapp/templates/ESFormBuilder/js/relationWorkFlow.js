$(document).ready(function() {
	var zTreeObj;
	var zTreeNodes;
	var setting = {
		view : {
			selectedMulti : false
		},
		callback : {
			onClick : onZTreeObjClick
		}
	};

	function onZTreeObjClick(e,treeId, treeNode) {
		$("#formBuilderDataGrid_relation").flexOptions({url:$.appClient.generateUrl({ESWorkflow: 'getWfModelDataList',typeID:treeNode.id,isRelationWf:true}, 'x')}).flexReload();
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
			zTreeObj = $.fn.zTree.init($("#formBuilderTypeTree_relation"), setting, zTreeNodes);
    		zTreeObj.selectNode(zTreeObj.getNodes()[0]);
		}
	});
	
	//生成右侧的grid
	$("#formBuilderDataGrid_relation").flexigrid({url :$.appClient.generateUrl({ESWorkflow: 'getWfModelDataList',isRelationWf:true}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 15,align : 'center'}, 
	        {display : '',name : 'ids',width : 15,align : 'center'}, 
		    {
				display : 'modelId',
				name : 'modelId',
				metadata:'modelId',
				hide:true,
				sortable : true,
				align : 'left'
			},{
				display : '唯一标识',
				name : 'identifier',
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
		}],
		buttons : [ {
				name : '关联流程',
				bclass : 'formbuilder_addLink',
				onpress : function(){formBuilderManage.relationWorkFlowAction();}
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
		width : 'auto',
		height : 'auto',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = 400;
		var flex = $("#formBuilderDataGrid_relation").closest("div.flexigrid");
		var bDiv = flex.find('.bDiv');
	    var contentHeight = bDiv.height();
	    var headflootHeight = flex.height() - contentHeight; 
	    bDiv.height(h - headflootHeight);
		flex.height(h);
		// 修改IE表格宽度兼容
		if($.browser.msie && $.browser.version==='6.0'){
			flex.css({width:"-=3px"});
		}
	};
	$('#formBuilderDataGridDiv_relation div[class="tDiv2"]').append('<div class="find-dialog"><input id="workflowKeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="modelQuery()"></span></div>');
	$('#formBuilderDataGridDiv_relation div[class="tDiv"]').css("border-top","1px solid #ccc");
	sizeChanged();
	 function formatValue(tdDiv){
			if(tdDiv.innerHTML=='1')
				tdDiv.innerHTML='是';
			else 
				tdDiv.innerHTML='否';
	};
	//单选
	$("#formBuilderDataGrid_relation tbody tr").die().live('click',function(){
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
		if(event.keyCode == 13 && document.activeElement.id == 'workflowKeyWord') {
			modelQuery();
		}
	});
});

/**
 * 检索
 * @author longjunhao 20140729
 */
function modelQuery() {
	var keyword = $('#formBuilderDataGridDiv_relation [name="keyWord"]').val();
	if (keyword == '请输入关键字') {
		keyword = '';
	}
	var treeObj = $.fn.zTree.getZTreeObj("formBuilderTypeTree_relation");
	var nodes = treeObj.getSelectedNodes();
	$("#formBuilderDataGrid_relation").flexOptions({url:$.appClient.generateUrl({ESWorkflow: 'getWfModelDataList',typeID:nodes[0].id,isRelationWf:true}, 'x'),query:keyword}).flexReload();
}
