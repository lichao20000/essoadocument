$(document).ready(function() {
	/** 左侧未授权grid **/
	$("#notAccreditGrid").flexigrid({url :$.appClient.generateUrl({ESFormAccredit: 'getAccreditFormBuilder',accredit:0,roleId:$("#formAccreditDataGrid").attr("rileId")}, 'x'),
		dataType : 'json',
		colModel : [{
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
				width : 214,
				sortable : true,
				align : 'left'
			},{
				display : '授权',
				name : 'modify',
				metadata : 'modify',
				width : 30,
				sortable : false,
				align : 'left'
		}],
		buttons : [],
		singleSelect:true,
		usepager : true,
		title : '未授权表',
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
	function sizeLeftChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = 500;
		var flex = $("#notAccreditGrid").closest("div.flexigrid");
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
	$('#formAccreditPageleftDiv div[class="tDiv2"]').append('<span style="float:left;margin:2px 0px 3px 5px ;;">未授权表单</span><div class="find-dialog"><input id="notAccreditGridQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="accreditPageFun.query(0)"></span></div>');
	$('#formAccreditPageleftDiv div[class="tDiv"]').css("border-top","1px solid #ccc");
	sizeLeftChanged();
	
	/** 授权按钮 **/
	$("#notAccreditGrid .formAccredit_yes").die().live("click", function(){
		accreditPageFun.addAccredit($(this).closest("tr"));
	});  

	/** 右侧已授权grid **/
	$("#accreditedGrid").flexigrid({url :$.appClient.generateUrl({ESFormAccredit: 'getAccreditFormBuilder',accredit:1,roleId:$("#formAccreditDataGrid").attr("rileId")}, 'x'),
		dataType : 'json',
		colModel : [{
				display : '取消',
				name : 'modify',
				metadata : 'modify',
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
		}],
		buttons : [],
		singleSelect:true,
		usepager : true,
		title : '未授权表',
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
	function sizeRightChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = 500;
		var flex = $("#accreditedGrid").closest("div.flexigrid");
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
	$('#formAccreditPageRightDiv div[class="tDiv2"]').append('<span style="float:left;margin:2px 0px 3px 5px ;">已授权表单</span><div class="find-dialog"><input id="accreditedGridQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="accreditPageFun.query(1)"></span></div>');
	$('#formAccreditPageRightDiv div[class="tDiv"]').css("border-top","1px solid #ccc");
	sizeRightChanged();
	
	/** 授权按钮 **/
	$("#accreditedGrid .formAccredit_no").die().live("click", function(){
		accreditPageFun.deleteAccredit($(this).closest("tr"));
	});  

	$(document).keydown(function(event){
		if(event.keyCode == 13) {
			if(document.activeElement.id == 'accreditedGridQuery'){
				accreditPageFun.query(1);
			} else if(document.activeElement.id == 'notAccreditGridQuery'){
				accreditPageFun.query(0);
			}
		}
	});
	
});

var accreditPageFun = {
		query: function(accredit){
			if(accredit == "1"){
				var keyword = $.trim($('#accreditedGridQuery').val());
				if(keyword == '' || keyword=='请输入关键字') {
					keyword = '';
				}
				$("#accreditedGrid").flexOptions({query:keyword}).flexReload();
			} else {
				var keyword = $.trim($('#notAccreditGridQuery').val());
				if(keyword == '' || keyword=='请输入关键字') {
					keyword = '';
				}
				$("#notAccreditGrid").flexOptions({query:keyword}).flexReload();
			}
		},
		addAccredit: function(tr){
			var roleId = $("#formAccreditDataGrid").attr("rileId");
			var formid = $("#notAccreditGrid").flexGetColumnValue(tr,['formid']);
			$.post( $.appClient.generateUrl({ESFormAccredit : 'addAccredit'}, 'x')
					,{roleId:roleId,formid:formid}, function(res){
						$("#notAccreditGrid").flexReload();
						$("#accreditedGrid").flexReload();
			});
		},
		deleteAccredit: function(tr){
			var roleId = $("#formAccreditDataGrid").attr("rileId");
			var formid = $("#accreditedGrid").flexGetColumnValue(tr,['formid']);
			$.post( $.appClient.generateUrl({ESFormAccredit : 'deleteAccredit'}, 'x')
					,{roleId:roleId,formid:formid}, function(res){
						$("#notAccreditGrid").flexReload();
						$("#accreditedGrid").flexReload();
			});
		}
}