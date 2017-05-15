//xuekun 20140718

//输入关键字检索应用
function appQuery() {
	var keyword = $.trim($('input[name="appKeyWord"]').val());
	if (keyword == '' || keyword == '请输入关键字') {
		keyword = '';
	}
	var url = $.appClient.generateUrl({
		ESOrder : 'getGrantApplist',
		keyWord : encodeURI(keyword)
	}, 'x');
	$("#appListGrid").flexOptions({
		url : url
	}).flexReload();
	return false;
}
function apply_app() {
	var checkboxlength = $("input[type='checkbox'][name='appServerlist']:checked").length;
	if (checkboxlength == 0) {
		$.dialog.notice({
			icon : 'warning',
			content : '请选择要申请访问权限的系统！',
			time : 3
		});
		return;
	}
	$.ajax({
		url : $.appClient.generateUrl({
			ESOrder : 'apply_app'
		}, 'x'),
		success : function(data) {
			$.dialog({
				title : '申请信息',
				modal : true, // 蒙层（弹出会影响页面大小）
				fixed : false,
				stack : true,
				resize : false,
				height : 200,
				lock : true,
				opacity : 0.1,
				/** wanghongchen 20141013 保存改为提交**/
				okVal : '提交',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				content : data,
				ok : function() {
					var ids = '';
					$("input[type='checkbox'][name='appServerlist']:checked")
							.each(function(i) {
								ids += $(this).val() + ',';
							});
					ids = ids.substring(0, ids.length - 1);
					var comment = $("#comment").val();
					var Actionurl = $.appClient.generateUrl({
						ESOrder : 'applyAccessRight'
					}, 'x');
					$.post(Actionurl, {
						ids : ids,
						comment : encodeURI(comment)
					}, function(res) {
						if (res == 'true') {
							$("#appListGrid").flexReload();
							$.dialog.notice({
								icon : 'succeed',
								/** wanghongchen 20141013 修改提示信息**/
								content : '你订购的服务已经提交给平台管理员进行审批，审批成功之后将给您发送提示信息',
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
			});
		},
		cache : false
	});

}
$(document).keydown(function(event) {
	if (event.keyCode == 13 && document.activeElement.id == 'appKeyWord') {
		appQuery();
	}
});
