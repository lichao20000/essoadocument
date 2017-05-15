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
				
				var rightWidth = width;
				var tblHeight = height - 142;
				
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
	
	/** 生成grid **/
	$("#formAccreditDataGrid").flexigrid({url :$.appClient.generateUrl({ESFormAccredit: 'getRoles'}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 30,align : 'center'}, 
		    {
				display : 'id',
				name : 'id',
				metadata:'id',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : '授权',
				name : 'modify',
				metadata : 'modify',
				width : 30,
				sortable : false,
				align : 'left'
			},{
				display : '角色编码',
				name : 'rolecode',
				metadata : 'rolecode',
				width : 200,
				sortable : true,
				align : 'left'
			},{
				display : '角色名称',
				name : 'rolename',
				metadata : 'rolename',
				width : 300,
				sortable : true,
				align : 'left'
			},{
				display : '角色描述',
				name : 'description',
				metadata : 'description',
				width : 500,
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
		var h = $(window).height() - $("#formAccreditDataGridDiv").position().top;
		var flex = $("#formAccreditDataGrid").closest("div.flexigrid");
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
	$('div[class="tDiv2"]').append('<span style="float:left;margin-bottom:5px;">&nbsp;</span><div class="find-dialog"><input id="roleAccreditQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="formAccredit.queryData()"></span></div>');
//	sizeChanged();
	
	/** 授权按钮 **/
	$("#formAccreditDataGrid .editbtn").die().live("click", function(){
		formAccredit.toAccreditPage($(this).closest("tr"));
	});  

	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'roleAccreditQuery') {
			formAccredit.queryData();
		}
	});
	
});