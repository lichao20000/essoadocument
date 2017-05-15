var _table = {
		total : false, // 用于保存接口消息总条数,该参数只在第一次得到	
		init:function(){
		var col_ = url_ = title_ = button_ = false;	
		button_=[  {
						name : '服务授权',
						bclass : 'add',
						onpress : reply_app
				   } 
		       ];
		col_= [ 
			       {
						display : '',
						name : 'startNum',
						width : 30,
						align : 'center'
				   }, 
					{
						display : '<input type="checkbox" id="appidlist">',
						name : 'ids',
						width : 50,
						align : 'center'
					}, 
					{
						name : 'id',
						metadata : 'id',
						width : 170,
						align : 'center',
						hide : true
					}, 
					{
						display : ' 申请人',
						name : 'userid',
						metadata : 'userid',
						width : 170,
						align : 'left'
					}, 
					{
						name : 'applyappid',
						metadata : 'applyappid',
						width : 170,
						align : 'center',
						hide : true
					}, 
					{
						name : 'saasid',
						metadata : 'saasid',
						width : 170,
						align : 'center',
						hide : true
					}, 
					{
						display : '应用名称',
						name : 'appname',
						metadata : 'appname',
						width : 170,
						align : 'left'
					}, 
					{
						display : '应用中文名称',
						name : 'appnamecn',
						metadata : 'appnamecn',
						width : 170,
						align : 'left'
					}, 
					{
						display : 'SAAS子系统',
						name : 'bigorgname',
						metadata : 'bigorgname',
						width : 150,
					
						align : 'left'
					}, 
					{
						display : '授权信息',
						name : 'status',
						metadata : 'status',
						width : 150,
						align : 'center',
						process : formatValue
					} 
		];
		title_ = '应用设置';
		url_= $.settingClient.generateUrl({ESOrder : 'getOrderInfo',orderid : $("#orderid").val()}, 'x')
		$("#replyListGrid").flexigrid({
			url : url_,
			dataType : 'json',
			colModel : col_,
			buttons : button_,
			/** wanghongchen 20141013 设置宽度 **/
			width:600,
			usepager : true,
			title : title_,
			useRp : true,
			showTableToggleBtn : false,
			rp : 20,
			nomes : '没有数据',
			pagetext : '第',
			outof : '页 /共',
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
		});	
		function formatValue(tdDiv) {
			if (tdDiv.innerHTML == '1'){
				tdDiv.innerHTML = '已授权';
			} else if(tdDiv.innerHTML == '2'){
				//wanghongchen 20141013 添加“拒绝申请”
				tdDiv.innerHTML = '拒绝申请';
			}else{
				tdDiv.innerHTML = '未处理';
			}
		}
		;
		// 全选
		$("#appidlist").die().live('click',function() {
			$("input[name='appServerlist']").attr('checked', $(this).is(':checked'));
		});
		$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="appKeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="appKeyWord" value="请输入关键字" /><span onclick="applyQuery()"></span></div>');
	},
	
	
};
$(document).keydown(function(event) {
	if (event.keyCode == 13 && document.activeElement.id == 'appKeyWord') {
		applyQuery();
	}
});
function applyQuery() {
	var keyword = $.trim($('input[name="appKeyWord"]').val());
	if (keyword == '' || keyword == '请输入关键字') {
		keyword = '';
	}
	var url = $.settingClient.generateUrl({
		ESOrder : 'getOrderInfo',
		orderid : $("#orderid").val(),
		keyWord : encodeURI(keyword)
	}, 'x');
	$("#replyListGrid").flexOptions({
		url : url
	}).flexReload();
	return false;
}
function reply_app() {
	var checkboxlength = $("input[type='checkbox'][name='appServerlist']:checked").length;
	if (checkboxlength == 0) {
		$.dialog.notice({
			icon : 'warning',
			content : '请选择要授权给用户的系统！',
			time : 3
		});
		return;
	}
	var ids = '';
	$("input[type='checkbox'][name='appServerlist']:checked").each(function(i) {
		ids += $(this).val() + ',';
	});
	ids = ids.substring(0, ids.length - 1);
	var Actionurl = $.settingClient.generateUrl({
		ESOrder : 'grantApp'
	}, 'x');
	$.post(Actionurl, {
		ids : ids,
		orderid : $("#orderid").val()
	}, function(res) {
		if (res == 'true') {
			$("#replyListGrid").flexReload();
			$.dialog.notice({
				icon : 'succeed',
				content : '授权成功!',
				title : '3秒后自动关闭',
				time : 3
			});
			return;
		} else {
			$.dialog.notice({
				icon : 'error',
				content : '申请失败！',
				title : '3秒后自动关闭',
				time : 3
			});
			return;
		}
	});
}
$(document).ready(function() {
	_table.init();	
});