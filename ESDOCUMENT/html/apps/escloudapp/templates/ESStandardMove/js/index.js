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
		window.open($.appClient.generateUrl({ESStandardMove:'index',page: _global.page, limit: _global.limit, boardId: _global.boardId}),"_parent")
	},
	lists: function (){ // 仅是列表HTML数据不包含渲染页面
			$.post(
				$.appClient.generateUrl({ESStandardMove:'GetPublishTopicList'},'x'),
				{page: _global.page, limit: _global.limit, boardId: _global.boardId},
				function (htm){
					$('#archivelist').html(htm);
				}
		);
	},
	detail: function (info){ // 打开详细页面
		var p = info.split('&'); // boardId&topicId
		window.open($.appClient.generateUrl({ESStandardMove:'detail_paper',boardId: p[0], topicId: p[1]}),"_parent");	
	}
}

//单击列表展示内容详细页面
$('#archivelist .details').live('click', function (){
	var info = this.getAttribute('info');
		_opens.detail(info); // info = boardId,topicId
});

//下载
$('.downloads').live('click', function (){
	download(this.getAttribute('info'),this);
	//var count = $('#downloadTimes').text()-0;
	var count = $(this).parent().find("#downloadTimes").text()-0;
	$(this).parent().find("#downloadTimes").text(count+1);
});
function download(info,obj){  // fileId&mark&mainSite	
	var p = info.split('&');	
	$.ajax({
		url: $.appClient.generateUrl({ESInformationPublish:'downFile'},'x'),
		data: {fileId: p[0], mark: p[1], index:'true'},
		type: 'POST',
		async: false, 
		success: function(url){
			window.location=url;
		}
	});
}
// 收藏
$('.favorates').live('click', function (){
	addFavorate(this);
	return false;
});
function addFavorate(that){
	window.location.hash = '';
	var url = window.location.href+'favorate&'+that.getAttribute('info');
	var title = that.parentNode.children[1].innerHTML;
	if (document.all){
		window.external.addFavorite(url,title); // ie
	}else if(window.sidebar){
		window.sidebar.addPanel(title, url, ""); //ff
	}else{
		_global.browser = 'chrome';
		window.location.hash = 'favorate&'+that.getAttribute('info');
		$.dialog({
			title:false,
			content:"请手动添加或按(ctrl+D)，并添加收藏后清除地址栏中“#”以后的参数",
			icon:'warning',
			time: 3,
			lock:false
		});
	}
	
}

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
