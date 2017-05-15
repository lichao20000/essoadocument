$(document).ready(function() {
	//上面的表格
	$("#comboMetadataTitleDataGrid").flexigrid({url :$.appClient.generateUrl({ESFormBuilder: 'getMetadataList'}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 15,align : 'center'}, 
	        {display : '',name : 'ids',width : 15,align : 'center'}, 
		    {
				display : 'id',
				name : 'id',
				metadata:'id',
				hide:true,
				align : 'left'
		    },{
		    	display : 'indetifier',
		    	name : 'indetifier',
		    	metadata:'indetifier',
		    	hide:true,
		    	align : 'left'
//		    },{
//		    	display : '操作',
//		    	name : 'modify',
//		    	metadata : 'modify',
//		    	width : 30,
//		    	sortable : true,
//		    	align : 'left'
			},{
				display : '属性名称',
				name : 'name',
				metadata : 'name',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '类型',
				name : 'type',
				metadata : 'type',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '描述',
				name : 'description',
				metadata : 'description',
				width : 170,
				sortable : true,
				align : 'left'
		}],
		buttons : [ {
						name : '选择',
						bclass : 'formbuilderMetadata_select',
						id : 'selectButton',
						onpress : function(){comboMetadata.selectCombo();}
					}, {
						name : '添加',
						bclass : 'add',
						onpress : function(){comboMetadata.addCombo();}
					}, {
						name : '编辑',
						bclass : 'formbuilderMetadata_edit',
						onpress : function(){comboMetadata.editCombo();}
					}, {
						name : '删除',
						bclass : 'delete',
						onpress : function(){comboMetadata.deleteCombo();}
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
	$('#comboMetadataTitleDiv div[class="tDiv2"]').append('<div class="find-dialog"><input id="comboMetadataTitleQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="comboMetadata.queryComboMetadaTitleList()"></span></div>');
	$('#comboMetadataTitleDiv div[class="tDiv"]').css("border-top","1px solid #ccc");
//	/** 编辑按钮 **/
//	$("#comboMetadataTitleDiv .editbtn").die().live("click", function(){
//		comboMetadata.editCombo($(this).closest("tr"));
//	});  
	//单选
	$("#comboMetadataTitleDataGrid tbody tr").die().live('click',function(){
		var selectTr = $(this);
		var comboId = -1;
		$("#comboMetadataTitleDataGrid .checkbox").each(function(){
			if($(this).attr('checked')=="checked"){
				if($(this).closest("tr")[0]!=selectTr[0]){
					$(this).attr('checked',false);
				} else {
					comboId = $(this).val() ;
				}
			}
		});
		$("#comboMetadataDataGrid").flexOptions({url:$.appClient.generateUrl({ESFormBuilder: 'getMetadataItemList',comboId:comboId}, 'x')}).flexReload();
	});
	
	function upSizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = 200;
		var flex = $("#comboMetadataTitleDataGrid").closest("div.flexigrid");
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
	upSizeChanged();
	
	//下面的表格//url :$.appClient.generateUrl({ESFormBuilder: 'getMetadataItemList'}, 'x'),
	$("#comboMetadataDataGrid").flexigrid({
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 15,align : 'center'}, 
	        {display : '<input type="checkbox" id="comboItemList" name="checkbox">',name : 'ids',width : 15,align : 'center'}, 
	        {
				display : 'id',
				name : 'id',
				metadata:'id',
				hide:true,
				align : 'left'
//	        },{
//		    	display : '操作',
//		    	name : 'modify',
//		    	metadata : 'modify',
//		    	width : 30,
//		    	sortable : true,
//		    	align : 'left'
			},{
				display : '属性值',
				name : 'item',
				metadata : 'item',
				width : 150,
				sortable : true,
				align : 'left'
			},{
				display : '排序规则',
				name : 'order',
				metadata : 'order',
				width : 100,
				sortable : true,
				align : 'left'
		}],
		buttons : [ {
						name : '添加',
						bclass : 'add',
						onpress : function(){comboMetadata.addComboItem();}
					}, {
						name : '编辑',
						bclass : 'formbuilderMetadata_edit',
						onpress : function(){comboMetadata.editComboItem();}
					}, {
						name : '删除',
						bclass : 'delete',
						onpress : function(){comboMetadata.deleteComboItems();}
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
	
	/** 编辑按钮 **/
	$("#comboMetadataDataDiv .editbtn").die().live("click", function(){
		comboMetadata.editComboItem($(this).closest("tr"));
	}); 
	
	function bottomSizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = 200;
		var flex = $("#comboMetadataDataGrid").closest("div.flexigrid");
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
	bottomSizeChanged();
	//单选
	$("#comboMetadataDataGrid tbody tr").die().live('click',function(){
		var selectTr = $(this);
		var comboId = -1;
		if($("#comboItemList").attr('checked') != "checked"){
			$("#comboMetadataDataGrid .checkbox").each(function(){
				if($(this).attr('checked')=="checked"){
					if($(this).closest("tr")[0]!=selectTr[0]){
						$(this).attr('checked',false);
					} else {
						comboId = $(this).val() ;
					}
				}
			});
//		} else {
//			var isHasChecked = false ;
//			$("#comboMetadataDataGrid .checkbox").each(function(){
//				if($(this).attr('checked')=="checked"){
//					isHasChecked = true ;
//				}
//			});
//			if(!isHasChecked){
//				alert($("#comboItemList").is(':checked'));
//				$("#comboItemList").attr('checked',false);
//			}
		}
	});
	//全选
	$("#comboItemList").die().live('click',function(){
		$("#comboMetadataDataGrid input[name='checkbox']").attr('checked',$(this).is(':checked'));
		$("#comboItemList").attr('checked',$(this).is(':checked'));
	});

	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'comboMetadataTitleQuery') {
			comboMetadata.queryComboMetadaTitleList();
		}
	});
});