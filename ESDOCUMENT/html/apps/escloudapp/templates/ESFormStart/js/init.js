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
				var tblHeight = height - 143;
				$("#formStart_tree").height(height-33);
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
		$("#formStartDataGrid").flexOptions({url:$.appClient.generateUrl({ESFormStart: 'getAccreditedFormBuilder',formType:treeNode.id}, 'x')}).flexReload();
	}
	
	$.ajax({
		dataType : "json",
		url : $.appClient.generateUrl({ESFormBuilder:'showFormTypeTree'}, 'x'),
		error : function() {
			alert('请求失败');
		},
		success : function(data) { // 请求成功后处理函数。
			zTreeNodes = data; // 把后台封装好的简单Json格式赋给treeNodes
			zTreeObj = $.fn.zTree.init($("#formStartTree"), setting, zTreeNodes);
    		zTreeObj.selectNode(zTreeObj.getNodes()[0]);
		}
	});
	
	/** 生成grid **/
	$("#formStartDataGrid").flexigrid({url :$.appClient.generateUrl({ESFormStart: 'getAccreditedFormBuilder'}, 'x'),
		dataType : 'json',
		colModel : [
		            {display : '',name : 'startNum',width : 30,align : 'center'}, 
		    {
				display : '操作',
				name : 'handle',
				metadata : 'handle',
				width : 30,
				sortable : false,
				align : 'left'
			},{
				display : 'formid',
				name : 'formid',
				metadata:'formid',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : '表单名称',
				name : 'formname',
				metadata : 'formname',
				width : 214,
				sortable : true,
				align : 'left'
			},{
				display : '工作流名称',
				name : 'workflowname',
				metadata : 'workflowname',
				width : 215,
				sortable : true,
				align : 'left'
			},{
				display : '工作流描述',
				name : 'wfDescription',
				metadata : 'wfDescription',
				width : 300,
				sortable : true,
				align : 'left'
		}],
		buttons : [],
		singleSelect:true,
		usepager : true,
		title : '表单授权',
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
		var h = $(window).height() - $("#formStartGridDiv").position().top;
		var flex = $("#formStartDataGrid").closest("div.flexigrid");
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
	$('#formStartGridDiv div[class="tDiv2"]').append('<span style="float:left;margin-bottom:5px;">&nbsp;</span><div class="find-dialog"><input id="formStartQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="formStartInit.query()"></span></div>');
//	sizeChanged();
	
	/** 流程发起按钮处理方法 **/
	$("#formStartDataGrid .editbtn").die().live("click", function(){
		$(this).closest("tr");
		var columns = ['formid'];
		var formid = $("#formStartDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
		formStartHandle.toFormStartPage(formid,'ESFormStart');
	});  

	
	/** 生成grid **/
	$("#attachDataGrid").flexigrid({url :$.appClient.generateUrl({ESFormStart: 'getAccreditedFormBuilder'}, 'x'),
		dataType : 'json',
		colModel : [
		            {display : '',name : 'startNum',width : 30,align : 'center'}, 
		    {
				display : '操作',
				name : 'handle',
				metadata : 'handle',
				width : 30,
				sortable : false,
				align : 'left'
			},{
				display : 'formid',
				name : 'formid',
				metadata:'formid',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : '表单名称',
				name : 'formname',
				metadata : 'formname',
				width : 214,
				sortable : true,
				align : 'left'
			},{
				display : '工作流名称',
				name : 'workflowname',
				metadata : 'workflowname',
				width : 215,
				sortable : true,
				align : 'left'
			},{
				display : '工作流描述',
				name : 'wfDescription',
				metadata : 'wfDescription',
				width : 300,
				sortable : true,
				align : 'left'
		}],
		buttons : [],
		singleSelect:true,
		usepager : true,
		title : '表单授权',
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
	
	
	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'formStartQuery') {
			formStartInit.query();
		}
	});
});

var formStartInit = {
		query: function(){
			var keyword = $.trim($('#formStartQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#formStartDataGrid").flexOptions({query:keyword}).flexReload();
		}
}