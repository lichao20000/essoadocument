(function() {
	window.size = {};
	var width_ = $(document).width()*0.96; // 可见总宽度
	var height_ = $(document).height() - 143; // 可见总高度 - 176为平台头部高度
	if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
		width_ = width_ - 6; // 6为兼容IE6
	} else if (navigator.userAgent.indexOf("MSIE 8.0") > 0) {
		width_ = width_ - 4; // 4为兼容IE8
		height_ = height_ - 4;
	}
	var width_treeDiv_ = 220; // 左侧宽度
	var width_tableDiv_ = width_ - width_treeDiv_-10; // 右侧宽度
	var height_table_ = height_ - 113; // 表格高 - 表格插件(flexigrid)内容外高度,25px
	// IE7.0因插件高度未定导致行高和其它浏览器不一致多出4px
	height_table_ = navigator.userAgent.indexOf("MSIE 7.0") > 0 ? height_table_ + 4
			: height_table_;
	window._size = {
		treeDiv : [ width_treeDiv_, height_ ],
		tableDiv : [ width_tableDiv_, height_ ],
		table : [ width_tableDiv_, height_table_ ]
	};
})();

var searchType = "";
var lucene_TreePath = "";

/** 左侧树 begin **/
/**左侧树相关方法**/
function getUrl(treeId, treeNode){
	return $.appClient.generateUrl({ESIdentify : "getGroupColumn"}, 'x');
}
/**左侧树相关方法**/
function ajaxDataFilter(treeId, parentNode, responseData) {
	   return responseData.nodes;
	}
/**左侧树设置**/

var setting = {
		view: {
			dblClickExpand: false,
			showLine: false
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		async:{
			autoParam:['id','column','path','number'],
			enable:true,
			dataFilter: ajaxDataFilter,
			url:getUrl
		},
		callback: {
			onClick: function (e, treeId, treeNode){
					var treeIdSeq = null;
					if(treeNode.id_seq!=null){
						treeIdSeq = treeNode.id_seq+treeNode.id;
					}else{
						treeIdSeq=0;
					}
					$('#lucene_tree').attr('treePath',treeIdSeq);
					lucene_TreePath = treeIdSeq;
					_tableCreated.init();
					_tableNoCreate.init();
					lucene_TreePath = "";
			}
		}
		
	};

/** 左侧树 end **/

/** 右侧数据 **/
/** 已经创建节点 表格 
 * 已经创建过索引库的节点，去查ess_index_node这张表
 * **/
var _tableCreated = {
	total : false, // 用于保存接口消息总条数,该参数只在第一次得到
	init : function() {
		document.getElementById('tableCreated').innerHTML = "<table id='lucene-tableCreated'></table>";
		var col_ = url_ = title_ = button_ = condition_ = false;
		button_ = [ 
		{
			name : '删除',
			bclass : 'delete',
			tooltip : '删除',
			onpress : deleteIndex
		},
		{
			name : '清空',
			bclass : 'grid_data_batch_delete',
			tooltip : '清空',
			onpress : deleteAllIndex
		},
		{
			name : '优化索引库',
			bclass : 'lucene_plugin',
			tooltip : '优化索引库',
			onpress : optimizeIndex
		},
		{
			name : '重建索引',
			bclass : 'lucene_alreadyExecute',
			tooltip : '重建索引',
			onpress : reCreateIndex
		}];
		col_ = [ {
			display: '序号', 
			name:'line', 
			width: 50, 
			align: 'center'
		}, {
			display : '<input id="checkAllCreated" type="checkbox" name="idAllCreated">',
			name : 'id',
			width : 20,
			align : 'center'
		}, {
			display : '节点名称',
			name : 'nodeName',
			width : (_size.table[0]/2)-70,
			align : 'left'
		}, {
			display : '索引库路径',
			name : 'indexPath',
			width : (_size.table[0]/2)-70,
			align : 'left'
		}];
		url_ = $.appClient.generateUrl({ESLucene: 'getCreatedNodesList'},'x');
		$("#lucene-tableCreated").flexigrid({
			url : url_,
			dataType : 'json',
			colModel : col_,
			buttons : button_,
			usepager : true,
			title : title_,
			useRp : true,
			showTableToggleBtn : false,
			width : _size.table[0],
			height : (_size.table[1]-115)/2,
			rp : 20,
			query : {
				condition : lucene_TreePath
			},
			nomes : '没有数据',
			pagetext : '第',
			outof : '页 /共',
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
		});
	}
};
/** 未创建节点 表格 
 * 没有创建过索引库的，去查ess_business_treenodes表
 * **/
var _tableNoCreate = {
		total : false, // 用于保存接口消息总条数,该参数只在第一次得到
		init : function() {
			document.getElementById('tableNoCreate').innerHTML = "<table id='lucene-tableNoCreate'></table>";
			var col_ = url_ = title_ = button_ = condition_ = false;
			button_ = [ 
			{
				name : '创建索引库',
				bclass : 'add',
				tooltip : '创建索引库',
				onpress : createIndex
			},
			{
				name : '创建所有库',
				bclass : 'lucene_all',
				tooltip : '创建所有库',
				onpress : createAllIndex
			}];
			col_ = [ {
				display: '序号', 
				name:'line', 
				width: 50, 
				align: 'center'
			}, {
				display : '<input id="checkAllNoCreate" type="checkbox" name="idAllNoCreate">',
				name : 'id',
				width : 20,
				align : 'center'
			}, {
				display : '节点的名称',
				name : 'nodeName',
				width : _size.table[0]-125,
				align : 'left'
			},
			{
				display : 'path',
				name : 'nodePath',
				align : 'left',
				hide : true
			}];
			url_ = $.appClient.generateUrl({ESLucene: 'getNoCreateNodesList'},'x');
			$("#lucene-tableNoCreate").flexigrid({
				url : url_,
				dataType : 'json',
				colModel : col_,
				buttons : button_,
				usepager : true,
				title : title_,
				useRp : true,
				showTableToggleBtn : false,
				width : _size.table[0],
				height : (_size.table[1]-115)/2,
				rp : 20,
				query : {
					condition : lucene_TreePath
				},
				nomes : '没有数据',
				pagetext : '第',
				outof : '页 /共',
				pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
			});
		}
	};


	
/**加载页面**/
window.onload = function() {
	$("#estabs").esTabs("open", {title : "索引库管理",content : "#ESLuceneIndex"});
	$("#estabs").esTabs("select", "索引库管理");

	var table_ = document.getElementById('tableCreated');
	var tree_ = document.getElementById('Lucene_treeDiv');

//	tree_.style.width = _size.treeDiv[0] + 'px';
	table_.style.width = _size.tableDiv[0] + 'px';
	table_.style.height = _size.tableDiv[1]/2 + 'px';
	/**加载树**/
	/** rongying 20150306 修改加载树的方法 start **/
	/*$.getJSON($.appClient.generateUrl({ESDocumentStage : "getTree"}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#lucene_tree"), setting, zNodes);
	});*/
	$.getJSON($.appClient.generateUrl({ESDocumentsCollection: "getTree"},'x'),function(zNodes) {
        $.fn.zTree.init($("#lucene_tree"), setting, zNodes);
    });
	/** rongying 20150306 修改加载树的方法 end **/
	/**初始化table**/
	_tableCreated.init();
	_tableNoCreate.init();
	$('#lucene_tree').css('height', _size.treeDiv[1]-20);/** xiaoxiong 20140805 添加左侧树最大高度设置 **/
	$('#Lucene_treeDiv').css('width', _size.treeDiv[0]);/** xiaoxiong 20140805 添加左侧树最大高度设置 **/
};


//复选框全选,取消全选 //
$(document).on('click', '#checkAllNoCreate', function() {
	checkBox.selectAll(this, 'lucene-tableNoCreate');
});
$(document).on('click', '#checkAllCreated', function() {
	checkBox.selectAll(this, 'lucene-tableCreated');
});
var checkBox = {
	selectAll : function(that, tblId) { // 全选|取消全选
		if ($(that).attr('checked') == 'checked') {
			$(that).attr('checked', 'checked');
			$('#' + tblId).find('tr').addClass('trSelected');
			$('#' + tblId).find('tr input[type="checkbox"]').attr('checked',
					'checked');
		} else {
			$(that).removeAttr('checked');
			$('#' + tblId).find('tr').removeClass('trSelected');
			$('#' + tblId).find('tr input[type="checkbox"]').removeAttr(
					'checked');
		}
	}
};

/**
 * 创建索引库
 */
function createIndex(){
	var checkboxs = $("#lucene-tableNoCreate").find("input[name='checkAllNoCreateOne']:checked");
	if(checkboxs.length==0){
		$.dialog.notice({icon : 'warning',content : '请选择要创建索引库的节点',title : '3秒后自动关闭',time : 3});
		return false;
	}else{
		var ids = "";
		var nodeName = [];
		// 遍历选中的表单复选框
		checkboxs.each(function(i){
			ids+=$(this).val()+',';
			var name = $(this).closest('tr').find("td[colname='nodeName'] div").text();
			nodeName.push(name);
		});
		ids = ids.substring(0, ids.length - 1);
		if(ids=='' || ids==='undefined' || ids==0)
		{
			return false;
		}
		toCreateIndex(ids,nodeName);
	}
}

function toCreateIndex(ids,nodeName){
	$.dialog({
		title:'消息提示',
		content:"是否确定创建",
		ok:true,
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function(){
		$.dialog.notice({icon : 'succeed',content : '正在后台建立索引库，请稍后再使用检索功能！',title : '3秒后自动关闭',time : 3});
			var url=$.appClient.generateUrl({ESLucene:'create'},'x');
			$.post(url,{ids:ids,nodeName:nodeName.join(",")},function(data){
				if(data=="true"){
					$("input[name='checkAllNoCreateOne']").attr("checked",false);
					$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
					$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
					$.dialog.notice({icon : 'succeed',content : '索引库创建成功！',title : '3秒后自动关闭',time : 3});
				}else if(data=="false"){
					$.dialog.notice({icon : 'error',content : '索引库建立失败，请稍后重试！',title : '3秒后自动关闭',time : 3});
					}else{
					$.dialog.notice({icon : 'warning',content :data,title : '3秒后自动关闭',time : 3});
					$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
					$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
					}
				});
			}
		});
}

/**
 * 创建所有库
 */
function createAllIndex(){
	$.dialog({
		title:'消息提示',
		content:"是否确定创建所有节点",
		ok:true,
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function(){
			$.dialog.notice({icon : 'succeed',content : '正在后台建立索引库，请稍后再使用检索功能！',title : '3秒后自动关闭',time : 3});
			var url=$.appClient.generateUrl({ESLucene:'createAll'},'x');
			var treePath = $('#lucene_tree').attr('treePath');
			var tr= $('#lucene-tableNoCreate').find("tr");
			var nodeName = [];
			// 遍历选中的表单复选框
			tr.each(function(i){
				var name = $(this).find("td[colname='nodeName'] div").text();
				nodeName.push(name);
			});
			$.post(url,{ids:treePath,nodeName:nodeName.join(",")},function(data){
				if(data=="true"){
					$("input[name='checkAllNoCreateOne']").attr("checked",false);
					$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
					$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
					$.dialog.notice({icon : 'succeed',content : '索引库创建成功！',title : '3秒后自动关闭',time : 3});
				}else if(data=="false"){
					$.dialog.notice({icon : 'error',content : '索引库建立失败，请稍后重试！',title : '3秒后自动关闭',time : 3});
				}else{
					$.dialog.notice({icon : 'warning',content :data,title : '3秒后自动关闭',time : 3});
					$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
					$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
				}
			});
		}
	});
}

/***
 * 删除索引库
 * @returns {Boolean}
 */
function deleteIndex(){
	var checkboxs = $("#lucene-tableCreated").find("input[name='checkCreatedOne']:checked");
	if(checkboxs.length==0){
		$.dialog.notice({icon : 'warning',content : '请选择要删除的索引库节点！',title : '3秒后自动关闭',time : 3});
		return false;
	}else{
		var ids = "";
		var nodeName = [];
		// 遍历选中的表单复选框
		checkboxs.each(function(i){
			ids+=$(this).val()+',';
			var name = $(this).closest('tr').find("td[colname='nodeName'] div").text();
			nodeName.push(name);
		});
		ids = ids.substring(0, ids.length - 1);
		if(ids=='' || ids==='undefined' || ids==0)
		{
			return false;
		}
		
//		var url=$.appClient.generateUrl({ESLucene:'getOtherNodesForCreated'},'x');/**获取同结构下，其他树节点**/
//		$.post(url,{ids:ids},function(data){
//			if(data=="1"){
				$.dialog({
					title:'消息提示',
					content:"是否确定删除索引库",
					ok:true,
					okVal:'确定',
					cancel:true,
					cancelVal:'取消',
					ok:function(){
						var url=$.appClient.generateUrl({ESLucene:'delete'},'x');
						$.post(url,{ids:ids,nodeName:nodeName.join(",")},function(data){
							if(data=="true"){
								$("input[name='checkCreatedOne']").attr("checked",false);
								$.dialog.notice({icon : 'succeed',content : '索引库删除成功！',title : '3秒后自动关闭',time : 3});
								$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
								$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
							}else{
								$.dialog.notice({icon : 'error',content : '索引库删除失败，请稍后重试！',title : '3秒后自动关闭',time : 3});
							}
						});
					}
				});
//			}else{
//				var dataObj = eval('(' + data + ')');
//				$.dialog({
//					content:dataObj.jsonContent,
//					title:'与重建节点同结构下的节点如下，他们被一并删除，是否继续？',
//					ok:true,
//					okVal:'继续',
//					cancel:true,
//					cancelVal:'取消',
//					width:500,
//					ok:function(){
//						ids = ids + "," + dataObj.ids;
//						ids = ids.substring(0, ids.length - 1);
//						var url=$.appClient.generateUrl({ESLucene:'delete'},'x');
//						$.post(url,{ids:ids},function(data){
//							if(data=="true"){
//								$("input[name='checkCreatedOne']").attr("checked",false);
//								$.dialog.notice({icon : 'succeed',content : '索引库删除成功！',title : '3秒后自动关闭',time : 3});
//								$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
//								$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
//							}else{
//								$.dialog.notice({icon : 'error',content : '索引库删除失败，请稍后重试！',title : '3秒后自动关闭',time : 3});
//							}
//						});
//					}
//				});
//			}
//		});
	}
}

/**
 * 删除所有索引库
 */
function deleteAllIndex(){
	$.dialog({
		title:'消息提示',
		content:"是否删除所有索引库",
		ok:true,
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function(){
			var url=$.appClient.generateUrl({ESLucene:'deleteAll'},'x');
			var treePath = $('#lucene_tree').attr('treePath');
			var nodeNameAll = [];
			var trAll =  $('#lucene-tableCreated').find("tr");
			$(trAll).each(function(){
				var name = $(this).find("td[colname='nodeName'] div").text();
				 nodeNameAll.push(name);
			});
			$.post(url,{ids:treePath,nodeNameAll:nodeNameAll.join(',')},function(data){
				if(data=="true"){
					$("input[name='checkCreatedOne']").attr("checked",false);
					$.dialog.notice({icon : 'succeed',content : '索引库删除成功！',title : '3秒后自动关闭',time : 3});
					$('#lucene-tableNoCreate').flexOptions({newp: 1}).flexReload();
					$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
				}else{
					$.dialog.notice({icon : 'warning',content :data,title : '3秒后自动关闭',time : 3});
				}
			});
		}
	});
}

/**
 * 优化索引库
 */
function optimizeIndex(){
	var checkboxs = $("#lucene-tableCreated").find("input[name='checkCreatedOne']:checked");
	if(checkboxs.length==0){
		$.dialog.notice({icon : 'warning',content : '请选择要优化的索引库节点！',title : '3秒后自动关闭',time : 3});
		return false;
	}else{
		var ids = "";
		var nodeName =[];
		// 遍历选中的表单复选框
		checkboxs.each(function(i){
			ids+=$(this).val()+',';
			var name = $(this).closest("tr").find("td[colname='nodeName'] div").text();
			nodeName.push(name);
		});
		ids = ids.substring(0, ids.length - 1);
		if(ids=='' || ids==='undefined' || ids==0)
		{
			return false;
		}
		$.dialog({
			title:'消息提示',
			content:"是否确定优化索引库",
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				var url=$.appClient.generateUrl({ESLucene:'optimize'},'x');
				$.post(url,{ids:ids,nodeName:nodeName.join(',')},function(data){
					if(data=="true"){
						$("input[name='checkCreatedOne']").attr("checked",false);
						$.dialog.notice({icon : 'succeed',content : '索引库优化成功！',title : '3秒后自动关闭',time : 3});
						$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
					}else{
						$.dialog.notice({icon : 'error',content : '索引库优化失败，请稍后重试！',title : '3秒后自动关闭',time : 3});
					}
				});
			}
		});
	}
}

/**
 * 重建索引库
 * @returns {Boolean}
 */
function reCreateIndex(){
	var checkboxs = $("#lucene-tableCreated").find("input[name='checkCreatedOne']:checked");
	if(checkboxs.length==0){
		$.dialog.notice({icon : 'warning',content : '请选择要重建的索引库节点！',title : '3秒后自动关闭',time : 3});
		return false;
	}else{
		var ids = "";
		var nodeName = [];
		// 遍历选中的表单复选框
		checkboxs.each(function(i){
			ids+=$(this).val()+',';
			var name = $(this).closest('tr').find("td[colname='nodeName'] div").text();
			nodeName.push(name);
		});
		ids = ids.substring(0, ids.length - 1);
		if(ids=='' || ids==='undefined' || ids==0)
		{
			return false;
		}
		toReCreateIndex(ids,nodeName);
	}
}

function toReCreateIndex(ids,nodeName){
	$.dialog({
		title:'消息提示',
		content:"是否确定重建索引库",
		ok:true,
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function(){
			var url=$.appClient.generateUrl({ESLucene:'reCreate'},'x');
			$.post(url,{ids:ids,nodeName:nodeName.join(',')},function(data){
				if(data=="true"){
					$("input[name='checkCreatedOne']").attr("checked",false);
					$.dialog.notice({icon : 'succeed',content : '索引库重建成功！',title : '3秒后自动关闭',time : 3});
					$('#lucene-tableCreated').flexOptions({newp: 1}).flexReload();
				}else{
					$.dialog.notice({icon : 'error',content : '索引库重建失败，请稍后重试！',title : '3秒后自动关闭',time : 3});
				}
			});
		}
	});
}