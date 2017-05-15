var searchType = "";

/**
 * 左侧树
 */
var _tree1 = {
	clickNode : {
		type : undefined
	},
	setting : {
		view : {
			dblClickExpand : true,
			showLine : false
		},
		data : {
			simpleData : {
				enable : true,
				idKey : "id"
			}
		},
		async : {
			enable : true,
			type : "post",
			autoParam : ["id"],
			url:$.settingClient.generateUrl({ESMessage:'showMessageNode'},'message')
		},
		callback : {
			onClick : function(e, treeId, treeNode) {
				if (treeNode.type === undefined) {
					return;
				} else {
					_tree1.clickNode = treeNode;
					_table1.init();
					$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="messageKeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="messageKeyWord" value="请输入关键字" /><span id="messageQuery"></span></div>');
				}

			}
		}
	}
};

/**
 * 右侧数据
 */
var _table1 = {
	total : false, // 用于保存接口消息总条数,该参数只在第一次得到
	init : function() {
		document.getElementById('tablemessage').innerHTML = "<table id='message-table'></table>";
		var col_ = url_ = title_ = button_ = condition_ = false;
		button_ = [{
			name : '删除',
			bclass : 'delete',
			tooltip : '删除',
			onpress : _opens1.delMsg
		}, {
			name : '清空',
			bclass : 'empty',
			tooltip : '清空',
			onpress : _opens1.clear
		}, {
			name : '未处理',
			bclass : 'run',
			tooltip : '未处理',
			onpress : _opens1.run
		}, {
			name : '已处理',
			bclass : 'over',
			tooltip : '已处理',
			onpress : _opens1.over
		}, {
			name : '全部',
			bclass : 'all',
			tooltip : '全部',
			onpress : _opens1.all
		} ];
		col_ = [ {
			display: '行号', 
			name:'line', 
			width: 50, 
			align: 'center'
		}, {
			display : '<input id="checkAll" type="checkbox" name="idAll">',
			name : 'id',
			width : 20,
			align : 'center'
		}, {
			display : '发送者',
			name : 'sender',
			width : 150,
			align : 'left'
		}, {
			display : '接收者',
			name : 'recevier',
			width : 150,
			align : 'left'
		}, {
			display : '内容',
			name : 'content',
			width : 550,
			sortable : true,
			align : 'left'
		}, {
			display : '发送时间',
			name : 'sendtime',
			width : 150,
			sortable : true,
			align : 'left'
		} ];

		if (_tree1.clickNode.type === undefined) {
			url_ = false;
			title_ = '消息列表';
		} else {
			url_ = $.settingClient.generateUrl({ESmessage : 'showMessageList'}, 'message');
			title_ = _tree1.clickNode.name + ' ? 消息列表';
			condition_ = {"id":_tree1.clickNode.id,"searchType":""};
		}
		$("#message-table").flexigrid({
			url : url_,
			dataType : 'json',
			colModel : col_,
			buttons : button_,
			usepager : true,
			title : title_,
			useRp : true,
			showTableToggleBtn : false,
			width : 680,
			height : 406,
			rp : 20,
			query : {
				condition : condition_
			},
			nomes : '没有数据',
			pagetext : '第',
			outof : '页 /共',
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
		});
	}
};

var _opens1 = {
	delMsg : function() {
		var checkboxs = $("#message-table").find("input[name='id']:checked");
		if(checkboxs.length==0){
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({icon:'warning',content:'请选择删除的数据',time:3});
			return false;
		}
		var ids = "";
		// 遍历选中的表单复选框
		checkboxs.each(function(i){
			ids+=$(this).val()+',';
		});
		ids = ids.substring(0, ids.length - 1);
		if(ids=='' || ids==='undefined' || ids==0)
		{
			return false;
		}
		$.post($.settingClient.generateUrl({ESmessage : 'beforeDeleteGridData' }, 'message'), {
			ids : ids
		}, function(htm) {
			$.dialog({
				content:htm,
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var url=$.settingClient.generateUrl({ESMessage:'deleteGridData'},'message');
					$.post(url,{ids:ids},function(data){
						if(data=="true"){
							$("input[name='idAll']").attr("checked",false);
							$.dialog.notice({icon:'succeed',content:'数据删除成功',time:3,title:'3秒后自动关闭'});
							$('#message-table').flexOptions({newp: 1}).flexReload();
						}
					});
				}
			});
		});
	},
	clear : function() {
		var nodeId = _tree1.clickNode.id;
		if(nodeId == undefined){
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({icon:'warning',content:'请选择消息类型树节点！',time:3});
			return false;
		}else{
			var checkboxs = $("#message-table").find("input[name='id']");
			if(checkboxs.length==0){
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({icon:'warning',content:'该节点下没有数据！',time:3});
				return false;
			}
		}
		$.post($.settingClient.generateUrl({ESmessage : 'beforeClearNodeData' }, 'message'), {
			nodeId : nodeId,
			searchType : searchType
		}, function(htm) {
			$.dialog({
				content:htm,
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var url=$.settingClient.generateUrl({ESMessage:'clearNodeData'},'message');
					$.post(url,{nodeId : nodeId, searchType : searchType},function(data){
						if(data=="true"){
							var treeObj = $.fn.zTree.getZTreeObj("message-tree");
							treeObj.reAsyncChildNodes(null, "refresh");
							$("input[name='idAll']").attr("checked",false);
							$.dialog.notice({icon:'succeed',content:'数据删除成功',time:3,title:'3秒后自动关闭'});
							$('#message-table').flexOptions({newp: 1}).flexReload();
						}
					});
				}
			});
		});
	},
	all : function() {
		var nodeId = _tree1.clickNode.id;
		if(nodeId == undefined){
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({icon:'warning',content:'请选择消息类型树节点！',time:3});
			return false;
		}
		searchType = "";
		title_ = _tree1.clickNode.name + ' ? 消息列表';
		$('#message-table').flexOptions({
			url : $.settingClient.generateUrl({ESmessage : 'showMessageList'}, 'message'),
			newp : 1,
			query : {
				condition : {"id":_tree1.clickNode.id,"searchType":""}
			}
		}).flexReload();
	},
	run : function() {
		var nodeId = _tree1.clickNode.id;
		if(nodeId == undefined){
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({icon:'warning',content:'请选择消息类型树节点！',time:3});
			return false;
		}
		searchType = "run";
		$('#message-table').flexOptions({
			url : $.settingClient.generateUrl({ESmessage : 'showMessageList'}, 'message'),
			newp : 1,
			query : {
				condition : {"id":_tree1.clickNode.id,"searchType":searchType}
			}
		}).flexReload();
	},
	over : function() {
		var nodeId = _tree1.clickNode.id;
		if(nodeId == undefined){
			//wanghongchen 20141017 修改消息提醒图标
			$.dialog.notice({icon:'warning',content:'请选择消息类型树节点！',time:3});
			return false;
		}
		searchType = "over";
		$('#message-table').flexOptions({
			url : $.settingClient.generateUrl({ESmessage : 'showMessageList'}, 'message'),
			newp : 1,
			query : {
				condition : {"id":_tree1.clickNode.id,"searchType":searchType}
			}
		}).flexReload();
	}
};



/*
 * 复选框全选,取消全选,选中一个 checkBox.selectOne(this); checkBox.selectAll(this,tblId));
 */
var checkBox = {
	selectOne : function(that) { // 单选|取消单选
		if ($(that).attr('checked') == 'checked') {
			$(that).closest('tr').addClass('trSelected');
		} else {
			$(that).closest('tr').removeClass('trSelected');
		}
	},
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
	},
	cancelOne : function(cbObj) { // $('#id=4')
		cbObj.removeAttr('checked');
	},
	cancelAll : function(tblId) { // $('$tbl')
		var inputs = tblId.find('input[checked="checked"]');
		var l = inputs.length;
		for (var i = 0; i < l; i++) {

			inputs.eq(i).removeAttr('checked');

		}
	}
};

// 复选框全选,取消全选,选中一个结束 //
// 全选|不全选@方吉祥
$(document).on('click', '#checkAll', function() {
	checkBox.selectAll(this, 'message-table');
});
// 单选
$(document).on('click', '#message-table input[name="checks"]', function() {
	checkBox.selectOne(this);
});

$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'messageKeyWord') {
		messageQuery();
	}
});

$("#messageQuery").die().live("click",function(){
	messageQuery();
});

function messageQuery(){
	var keyword = $.trim($('#messageKeyWord').val());
	if(keyword == '' || keyword=='请输入关键字') {
		keyword = '';
	}
	condition_ = {"id":_tree1.clickNode.id,"searchType":_tree1.clickNode.type};
	$("#message-table").flexOptions({newp : 1, query : { keyword : keyword,condition:condition_}}).flexReload();
}
$(document).ready(function() {
	var tree_ = document.getElementById('ztreemessage');
	var table_ = document.getElementById('tablemessage');
	tree_.style.width = '200px';
	tree_.style.height = '520px';
	table_.style.width = '680px';
	table_.style.height = '520px';
	$.getJSON($.settingClient.generateUrl({ESMessage:'showMessageNode'}, 'message'), function(zNodes) {
		$.fn.zTree.init($("#message-tree"), _tree1.setting, zNodes);
	});
	_table1.init();
});
