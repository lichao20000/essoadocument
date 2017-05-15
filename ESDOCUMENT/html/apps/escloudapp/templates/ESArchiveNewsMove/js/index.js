var _global = {
	boardId: false, // 信息ID
	page: 1,  // 默认转入列表页面时开始页数
	limit: 20,  // 默认转入列表页面时条数
	total: false, // 总页数
	interval: false, // 定时器
	browser: false
};	
var _opens = {
	list: function (){
		window.open($.appClient.generateUrl({ESArchiveNewsMove:'index',page: _global.page, limit: _global.limit, boardId: _global.boardId}),"_parent")
	},
	lists: function (){ // 仅是列表HTML数据不包含渲染页面
			$.post(
				$.appClient.generateUrl({ESArchiveNewsMove:'GetPublishTopicList'},'x'),
				{page: _global.page, limit: _global.limit, boardId: _global.boardId},
				function (htm){
					$('#archivelist').html(htm);
				}
		);
	},
	detail: function (info){ // 打开详细页面
		var p = info.split('&'); // boardId&topicId
		window.open($.appClient.generateUrl({ESArchiveNewsMove:'detail_paper',boardId: p[0], topicId: p[1]}),"_parent");	
	}
}

//单击列表展示内容详细页面
$('#archivelist .details').live('click', function (){
	var info = this.getAttribute('info');
		_opens.detail(info); // info = boardId,topicId
});

//如果摘要为空那么隐藏摘要内容
if($("#summaryText").text()==""){
	$(".summary").css("display","none");
}

$(function(){
	$('.showMore_data').live('click',function(){
		_global.page = 1;
		_global.limit = 20;
		_global.boardId = $('.showMore_data').attr('rel');
		_opens.list();
	});
});
