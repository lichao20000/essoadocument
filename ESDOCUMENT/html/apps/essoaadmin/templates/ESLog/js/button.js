//author  wangbo  20140327
//删除部分日志
function delete_log(){
	var checkboxlength = $('#logGrid input:checked').length;
	if (checkboxlength == 0) {
		$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
		return;
	}
	$.dialog({
		content : '确定要删除吗？删除后不能恢复！',
		okVal : '确定',
		ok : true,
		cancelVal : '关闭',
		cancel : true,
		ok : function() {
			var idStr = '';
			$('#logGrid input:checked').each(
				function(i) {
					idStr += $('#logGrid input:checked:eq(' + i+ ')').val()+ ',';
				});
			    idStr=idStr.substring(0,idStr.length-1);
				var url = $.appClient.generateUrl({ESLog : 'deleteLogList'}, 'x');
				$.post(url, {ids : idStr}, function(res) {
					if(res=='true'){
						$.dialog.notice({
							icon : 'succeed',
							content :'删除成功！',
							time : 3
						});
						$("#logGrid").flexReload();
						return;
					}else{
						$.dialog.notice({icon : 'warning',
							content :'不允许删除',
							time : 3
						});
						$("#logGrid").flexReload();
						return;
					}
				});
		}
	});
}
//清空所有日志信息
function delete_allLog(){
	$.dialog({
		content : '确定要清空吗？清空后不能恢复！',
		okVal : '确定',
		ok : true,
		cancelVal : '关闭',
		cancel : true,
		ok : function() {
				var url = $.appClient.generateUrl({ESLog : 'deleteAllLog'}, 'x');
				$.post(url,  function(res) {
					if(res=='true'){
						$.dialog.notice({
							icon : 'succeed',
							content :'清空成功！',
							time : 3
						});
						$("#logGrid").flexReload();
						return;
					}else{
						$.dialog.notice({icon : 'warning',
							content :'清空失败',
							time : 3
						});
						$("#logGrid").flexReload();
						return;
					}
				});
		}
	});
}