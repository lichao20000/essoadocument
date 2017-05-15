var flag;
var limit=10;
var start=10;
var isnull=true;//用于判断是否还存在信息
var imgs = {
	aoman    : '傲慢',
	bishi    : '鄙视',
	baiyan   : '白眼',
	bizui	 : '闭嘴',
	cahan	 : '擦汗',
	caidao	 : '菜刀',
	chajin	 : '差劲',
	cheer	 : '干杯',
	chong	 : '虫',
	ciya	 : '呲牙',
	da	     : '打',
	dabian	 : '大便',
	dabing	 : '大兵',
	dajiao	 : '大叫',
	daku	 : '大哭',
	dangao	 : '蛋糕',
	danu	 : '大怒',
	dao	     : '刀',
	deyi	 : '得意',
	diaoxie	 : '凋谢',
	e	     : '真香',
	fadai	 : '发呆',
	fadou	 : '发抖',
	fan	     : '饭',
	fanu	 : '发怒',
	feiwen	 : '飞吻',
	fendou	 : '奋斗',
	gangga	 : '尴尬',
	geili	 : '给力',
	gouyin	 : '过瘾',
	guzhang	 : '鼓掌',
	haha	 : '哈哈',
	haixiu	 : '害羞',
	haqian	 : '哈欠',
	hua	     : '花',
	huaixiao : '坏笑',
	hufen	 : '互粉',
	huishou	 : '挥手',
	huitou	 : '回头',
	jingkong : '惊恐',
	jingya	 : '惊讶',
	kafei	 : '咖啡',
	keai	 : '可爱',
	kelian	 : '可怜',
	ketou	 : '磕头',
	kiss	 : '亲吻',
	ku	     : '酷',
	kuaikule : '快哭了',
	kulou	 : '骷髅',
	kun 	 : '困',
	lanqiu	 : '篮球',
	lenghan	 : '冷汗',
	liuhan	 : '流汗',
	liulei	 : '流泪',
	liwu	 : '礼物',
	love	 : '爱',
	ma  	 : '骂',
	meng	 : '萌',
	nanguo	 : '难',
	no  	 : '不行',
	ok  	 : '可以',
	peifu	 : '佩服',
	pijiu	 : '啤酒',
	pingpang : '乒乓',
	pizui	 : '撇嘴',
	qiang	 : '强',
	qinqin	 : '亲亲',
	qioudale : '糗大了',
	qiu	     : '球',
	quantou	 : '拳头',
	ruo	     : '弱',
	se   	 : '色',
	shandian : '闪电',
	shengli	 : '胜利',
	shenma	 : '神马',
	shuai	 : '帅',
	shuijiao : '睡觉',
	taiyang	 : '太阳',
	tiao	 : '跳',
	tiaopi	 : '调皮',
	tiaosheng: '跳绳',
	tiaowu	 : '跳舞',
	touxiao	 : '偷笑',
	tu	     : '吐',
	tuzi	 : '兔子',
	wabi	 : '挖鼻',
	weiqu	 : '委屈',
	weixiao	 : '闭嘴',
	wen	     : '问',
	woshou	 : '握手',
	xia	 	 : '吓',
	xianwen	 : '先问',
	xigua	 : '西瓜',
	xinsui	 : '心碎',
	xu	     : '嘘',
	yinxian	 : '阴险',
	yongbao	 : '拥抱',
	youhengheng: '右哼哼',
	youtaiji : '右太极',
	yueliang : '月亮',
	yun	     : '晕',
	zaijian	 : '再见',
	zhadan	 : '炸弹',
	zhemo	 : '折磨',
	zhuakuang: '抓狂',
	zhuanquan: '转圈',
	zhutou	 : '猪头',
	zuohengheng: '左哼哼',
	zuotaiji : '左太极',
	zuqiu	 : '足球'
};
window.onload = function (){
	$("#estabs").esTabs("open", {title:"交流园地", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "交流园地");
	var style="filter:alpha(opacity=0);";
	if ( ($.browser.msie && $.browser.version>9) || $.browser.mozilla ){
		style="opacity:0;";
	}
	var input='<form style="display:inline;padding:0;margin:0;border:0;outline:none;" enctype="multipart/form-data">';
		input+='<input type="file" name="file_txt" style='+style+' inputname="attach" onchange="uploadImage(this);"  hidefocus="true"></form>';
	$('#image').append(input);

};
//返回顶部
$(window).scroll(function(){
	if($(this).scrollTop()>50){
		$('#backtop').show();
	}else{
		$('#backtop').hide();
	}
	var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)  
	//console.log("滚动条到顶部的垂直高度: "+$(document).scrollTop());  
	//console.log("页面的文档高度 ："+$(document).height());  
	//console.log('浏览器的高度：'+$(window).height());  
	 var totalheight = parseFloat($(window).height()) + parseFloat(srollPos);  
	    if(($(document).height()-200) <= totalheight && isnull) {  
	       var url=$.appClient.generateUrl({ESDiscuss:'getTopicList'},'x');
	    	$.ajax({
	    		type:'post',
	    		url:url,
	    		data:'limit='+limit+'&start='+start,
	    		success:function(data){
	    			if(data){
	    				$('#lay_out').append(data); 
	    			}else{
	    				isnull=false;
	    			}
	    			
	    		}
	    		});
	    		start=start+limit; 
	    	
	   } 

});
$('#backtop').click(function(){
	$(window).scrollTop(0);
});
/*
 * 获取表情列表
 */
$(document).on('click','.insert-face',function(){
	$('input[name="commentid"]').val($(this).attr('pointid'));
	var id = $('input[name="commentid"]').val();
	if(id === '0' ){
	    insertHTML($('#content')[0],'<span style="display: none;"/>');
	}else{
		$($('#reply-'+id).children('.reply-box').children('.reply-box-content')).focus();
		 insertHTML($($('#reply-'+id).children('.reply-box').children('.reply-box-content'))[0],'<span style="display: none;"/>');
	}
	
	
	var id = $('input[name="commentid"]').val();
	var obj=this;
	flag=$(obj).closest('div').prev();
	var left=$(obj).offset().left;
	var top=$(obj).offset().top;
	$("#imageList").css({top:top+22,left:left-30}).toggle();
	if($("#imageList li").length >0){
		return true;
	}
	if($("#bigblog").attr('isRequset') == '1') {
		$("#bigblog").show();
		return;
	}
	var url=$.appClient.generateUrl({ESDiscuss:'getImageList'},'x');
	/*$.ajax({
		url:url,
		dataType:'json',
		success:function(data){
			$("#tips").replaceWith();
			var len=data.length;
			for(var i=0;i<len;i++){
				var sourse=data[i].OriginalFile;
				var title=data[i].Meaning;
				var img='<img alt='+title+' src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/'+sourse+'>';
				$("#imageList").append('<li title='+title+'>'+img+'</li>');
			}
		}
	});*/
	$.ajax({
		url:url,
		dataType:'json',
		success:function(data){
			$("#tips").replaceWith();
			var len=data.length;
			var images = $('#bigblogMap area');
			$("#bigblog").attr('isRequset','1');
			for(var i=0;i<len;i++){
				//var sourse=data[i].OriginalFile;
				var title=data[i];
				images[i].setAttribute('title',imgs[title]);
				images[i].setAttribute('name',title);
				// var img='<img alt='+title+' src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/'+sourse+'>';
				// $("#imageList").append('<li title='+title+'>'+img+'</li>');
			}
			// $('#bigblogMap area').on('mouseover',function() {
				// var html = '<div style="width:30px; height:30px; position:relative; top:-255px; right:-30px; background-color:white;"><img src="/apps/escloudapp/templates/ESDiscuss/img/miniblog/'+title+'.gif"></div>';
				// $(this).after(html);
			// });
		}
	});	
	$("#bigblog").show();
});
//点击表情事件
$('#bigblogMap area').on('click',function() {
	var name = $(this).attr('name');
	var url='<img src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/'+name+'.gif >';
	var id = $('input[name="commentid"]').val();
	id === '0' ? inertText($('#content').get(0), url) : inertText($($('#reply-'+id).children('.reply-box').children('.reply-box-content'))[0], url);
});	

//鼠标滑过显示动态图片
$('#bigblogMap area').hover(
	function() {
		var imgName = $(this).attr('name');
		var imgUrl = '/apps/escloudapp/templates/ESDiscuss/img/miniblog/'+imgName+'.gif';
		var width = this.getAttribute('coords').split(',')[0];
		if(width > 200) {
			$('#bigimg').css('left',0);
		} else {
			$('#bigimg').css('left',368);
		}
		$('#bigimg').children('img').attr('src',imgUrl);
		$('#bigimg').children('div').html(imgs[imgName]);
		$('#bigimg').show();
		
	},
	function() {
		$('#bigimg').hide();
	}
);

//初始化表情框
$('#insert-face').on('click',function(){$('input[name="commentid"]').val('0')});

//点击选择表情事件
$("#imageList").on('click','li',function(){
	flag[0].innerText+='['+this.title+']';
	
});
//点击"清空"执行的事件
$("#clear-say").click(function(){
	$('#content')[0].innerHTML = '';
});
$(document).click(function(event){
	if(event.target.id !='imageList' && event.target.className !='insert-face' && event.target.id !='insert-face' && !($(event.target).closest("#imageList").length)){
		closeList();
	}
});
//关闭表情列表
function closeList()
{
	$("#imageList").hide();
}
/**
 * 闪动对象背景
 * @param obj
 * @returns
 */
var flashTextarea = function(obj){
	var nums = 0;
	var flash = function(){
		if(nums > 3 ){
			return false;
		}
		if(obj.hasClass('fb')){
			obj.removeClass('fb');
		}else{
			obj.addClass('fb');
		}
		setTimeout(flash, 300);
		nums ++;
	};
	flash();
	return false;
};

//发布信息
$('#submit-say').click(function(){
	var content=$('#content').html();
	if(!content){
		flashTextarea($('#content'));
		return;
	}
	var imgObj=$('#insertImage img');//获取上传图片的src
	var imgList=[];
	var param={};
	param.content=content;
	param.imgList=imgList;
	var url=$.appClient.generateUrl({ESDiscuss:'saveTopic'},'x');
	$.ajax({
		type:'post',
		data:param,
		url:url,
		dataType:'json',
		success:function(data){
			if(data.result=='succeed'){
				$('#content')[0].innerHTML='';//将发布信息框内容置为空
				var rep='<img src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/$1.gif >';
				var con=content.replace(/\[([a-zA-Z]+?)\]/g,rep);
				temp = null;
				var msg="<ul class='messages'>";
					msg+="<li class='face'>";
					msg+="<a href='javascript:;'>";
					msg+="<img src='/apps/escloudapp/templates/ESDiscuss/img/logo.png' title='' alt='头像' /></a>";
					msg+="</li>";
					msg+="<li class='message-box'>";
					msg+="<div class='messageContainerBox'>";
					msg+="<h2 class='title'>"+data.authorName+"</h2>";
					msg+="<div class='text'>";
					msg+=con;
					msg+="</div><div class='info'>";
					msg+="<a class='re-list' reply-items='0' id="+data.itemId+" href='javascript:void(0);'>评论</a>";
					msg+='<span>|</span><a href="javascript:void(0);" class="del-item" itemid='+data.itemId+'>删除</a>';
						
					msg+="<i>"+data.createTime+"</i>";
					msg+="</div><ul class='replys'></ul>";
					msg+="</div>";
					msg+="</li>";
					msg+="</ul>";
					$('#lay_out').prepend(msg);
			}else{
				$.dialog.notice({content:'添加失败',time:1,icon:'error'});
			}
		}
	});
});
//点击查看图片，大小图切换
var dialog;
$(document).on('click','.imgzoom',function(event){
		var obj=$(this)[0];
		var childObj = obj.cloneNode ( true );
		childObj.className="imgminify";
		childObj.width=500;
		childObj.height=400;
		childObj.title='点击缩小';
		childObj.dsrc=childObj.src;
		childObj.src=childObj.src.replace(/\_thumb/,'');
		dialog=$.dialog({
			width : 500,   //弹出框宽度
			height : 400,   //弹出框高度
			title : "图片放大展示",  //弹出框标题
			position : "center",  //窗口显示的位置
			content:childObj,
			
		});
	
});
//点击查看图片，大小图切换
$(document).on('click','.imgminify',function(event){
	dialog.close();
});
/**
 * 获取评论列表
 */
var replyList=function(settings){
	
	this.initsetting(settings);
};

replyList.prototype.initsetting=function(settings){
	this.settings=settings;
	this.ensureDefault=function(setname,defaultValue){
		this.settings.setname=(this.settings.setname!=undefined)?this.settings.setname:defaultValue;
	};
	this.ensureDefault('itemId',0);
	this.ensureDefault('start',0);
	this.ensureDefault('limit',10);
	this.ensureDefault('url','');
	this.ensureDefault('type','text');
	
	
};
replyList.prototype.getReplyList=function(){
	var param={};
		param.itemId=this.settings.itemId;
		param.start=this.settings.start;
		param.limit=this.settings.limit;
	$.ajax({
	type:'post',
	url:this.settings.url,
	dataType:this.settings.type,
	data:param,
	success:function(result){
		$('#reply-'+param.itemId).nextAll('ul').remove();
		$('#reply-'+param.itemId).after(result);

	}
		
});
};
$('.re-list').live('click', function() {
	var id = $(this).attr('id');
	if($('#reply-'+id).length == 0) {
		reply_.create(this);
		$('input[name="commentid"]').val($(this).attr('id'));
		if(this.getAttribute('reply-items')==0){//如果不存在评论则不用请求后台
			return;
		}
		var itemId = this.id;
		var re=new replyList({
			'itemId':itemId,
			'start':0,
			'limit':10,
			'url':$.appClient.generateUrl({ESDiscuss:'getReplyList'},'x'),
			'type':'text'
		});
		re.getReplyList(); 
	} else {
		$('#reply-'+id+',ul .replys').remove();
		$(this).attr("style","height:150px;");
	}
});

$(document).on('click', '.re-buttons', function (){
	
	var that=$(this);
	var html=that.siblings('u').html();//找到被回复者的姓名
	var id=parseInt(that.attr('id'));
	($('#reply-'+id).children('.reply-box').children('.reply-box-content'))[0].innerText='回复@'+html+'：';
	
});
//添加回复
$(document).on('click', '.reply-submit-button', function (){
	
	var conOj=$(this).closest('.reply-box').find('.reply-box-content');
	var content=conOj[0].innerHTML;
	var parrent = /^(回复@)(.*?)：$/;
	if(!content || content.match(parrent)){
		flashTextarea(conOj);
		return;
	}
	var itemId=this.getAttribute('id');
	var url=$.appClient.generateUrl({ESDiscuss:'saveReply'},'x');
	$.ajax({
		type:'post',
		data:{content:content,itemId:itemId},
		url:url,
		dataType:'json',
		success:function(data){
			if(data.result=='succeed'){
				conOj='';//回复框内容置为空
				var rep='<img src=/apps/escloudapp/templates/ESDiscuss/img/miniblog/$1.gif >';
				//var con=content.replace(/\[([a-zA-Z]+?)\]/g,rep);
				var con=content.replace(/\[([a-zA-Z]+?)\]/g,rep);
				var msg="<ul class='replys'>";
					msg+="<li>";
					//msg+="<h2 class='re-title'>@邢元：</h2>";
					msg+="</li>";
					msg+="<li class='re-text'>"+con;
					msg+="</li>";
					msg+="<li class='re-info'>";
					msg+="<a href='javascript:;' class='re-buttons' id="+data.itemId+">回复</a>";
					msg+="<span>|</span>";
					msg+="<a href='javascript:void()' id="+data.itemId+" class='del_reply' args="+data.replyId+">删除</a>";
					msg+="<u>"+data.replyerName+"</u>";
					msg+="<i>"+data.replyTime+"</i>";
					msg+="</li>";
					msg+="</ul>";
					$('#reply-'+itemId).after(msg);
					($('#reply-'+itemId).children('.reply-box').children('.reply-box-content'))[0].innerHTML = '';
					//更新评论数
					var reply=$('#'+itemId);
					var count=reply.attr("reply-items");
					count=parseInt(count)+1;
					reply.attr("reply-items",count);
					reply.text("评论("+count+")");
					
			}else{
				$.dialog.notice({content:'添加失败',time:1,icon:'error'});
			}
		}
	});
	//reply_.remove(this);
});

var reply_ = {
	create: function (that){
		var id = that.id;
		if(document.getElementById('reply-'+id)) return;
		var parent_ = that.parentNode; // .reply-box-button
		var parent__ = parent_.parentNode; // .message
		var width_ = parent_.clientWidth; // 宽
		var reply_box_ = width_ - 30;
		var reply_box_content_ = reply_box_ - 20;
		var reply_box_button_ = reply_box_ - 10;
		
		var htm_ = ["<div class='reply-box' style='width:"+ reply_box_ +"px;'>"];
		htm_.push("<div class='reply-box-content'  contenteditable='true' style='width:"+ reply_box_content_ +"px;'></div>");
		htm_.push("<div class='reply-box-button' style='width:"+ reply_box_button_ +"px;'>");
		htm_.push("<a href='javascript:;' class='insert-face' pointid='"+id+"' title='插入表情'>表情</a>");
		htm_.push("<a href='javascript:;' class='reply-submit-button' id='"+ id +"'>回复</a>");
		//htm_.push("<p class='notice-write-text'>已输入<span id='notice-write-text'>0</span>/200个字</p>");
		htm_.push("</div>");
		htm_.push("</div>");
	
	var parentDom = document.createElement('div');
		parentDom.id = 'reply-'+id;
		parentDom.className = 'reply-box-bg';
		parentDom.style.width = reply_box_+'px';
		parentDom.innerHTML = htm_.join('');
		// longjunhao 20150127 动态获取parent__.children的index
		var cindex = parent__.children.length - 1;
		parent__.insertBefore(parentDom, parent__.children[cindex]);
	},
	remove: function (that){
		
		var parent_ = that.parentNode.parentNode.parentNode.parentNode;
		parent_.removeChild(document.getElementById('reply-'+ that.id));
		
	}
	
};
/*
 * 上传图片
 * 
 */
function uploadImage(obj)
{
	 insertHTML($('#content')[0],'<span style="display: none;"/>');
	var allowType='jpeg,png,gif,bmp,jpg';
	var fileType=getFileType(obj.value);
	if(allowType.indexOf(fileType.toLowerCase())== -1){//判断图片类型时不再区分大小写 xuekun 20141010
		$.dialog.notice({content:'不支持此类型的图片,请上传 [jpeg,png,gif,bmp,jpg] 格式图片',time:3,title:'错误类型',icon:'error'}); //wanghongchen 20141017 修改消息图标
		return;
	}
	obj.parentNode.method = "post";
	obj.parentNode.action =  $.appClient.generateUrl({ESDiscuss:'imagesUpload'},'x');
	$(obj.parentNode).ajaxSubmit({ 
		dataType:'json',
        success: function (data) {
        	if(data.err == 'normal'){
        		inertText($('#content')[0],'<img width="100" height="75" title="'+ data.title +'" class="imgzoom" title="点击放大" src="'+data.url+'">');
        	}else{
        		$.dialog.notice({content:data.err,time:3,icon:"warning"});
        	}
        }  
    });
	var file = $('input [name="file_txt"]'); 
	file.after(file.clone().val("")); 
	file.remove(); 
}
//获取文件图片的类型
function getFileType(str){
	return str.substr(str.lastIndexOf('.')+1);
	
}
$("#insertImage").on("click",'a',function(event){
	$(event.target).parent('li').remove();
	if(!$("#insertImage li").length){
		$("#insertImage").hide();
	}
	
});
//删除信息
$("#lay_out").on('click','.del-item',function(){
	
	var delObj=$(this);
	var id=delObj.attr('itemid');
	if(!id){
		return;
	}
	var url=$.appClient.generateUrl({ESDiscuss:'delItems',id:id},'x');
	$.ajax({
		url:url,
		type:'get',
		success:function(result){
			if(result){
				delObj.closest(".messages").fadeOut('normal',function(){
					$(this).remove();
				});
			}	
		}
	});
});
//删除回复
$("#lay_out").on('click','.del_reply',function(){
	
	var delObj=$(this);
	var id=delObj.attr('args');
	if(!id){
		return;
	}
	var url=$.appClient.generateUrl({ESDiscuss:'delReply',id:id},'x');
	$.ajax({
		url:url,
		type:'get',
		success:function(result){
			if(result){
				delObj.closest(".replys").fadeOut('normal',function(){
					$(this).remove();
				});
				//更新评论数
				var itemId=delObj.attr("id");
				var reply=$('#'+itemId);
				var count=reply.attr("reply-items");
				count=parseInt(count)-1;
				reply.attr("reply-items",count);
				reply.text("评论("+count+")");
			}
		}
	});
});

/** 修改窗体i自适应 **/
$("#ESSystemIndex").css("height",$(window).height()-144);

//实现在光标处插入图标或图片
function inertText(element,text){
	var content=element.innerHTML;
	if(content.indexOf('<span style="display: none;"></span>') >= 0 ){
		element.innerHTML=content.substr(0,content.indexOf('<span style="display: none;"></span>'))+text+content.substr(content.indexOf('<span style="display: none;"></span>'));
	}else{
	element.innerHTML=content+text;
	}
}
$("#lay_out").on('mousedown','.reply-box-content',function(){
	$('span[style="display: none;"]',$(this)).each(function(){
		$(this).remove();
	});
});
$('#content').mousedown(function(){
	$('span[style="display: none;"]',$(this)).each(function(){
		$(this).remove();
	});
  });
function insertHTML(element,html) {
	var dthis =element;
	var sel, range;
	if (window.getSelection) {
		// IE9 and non-IE
		sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
			//range.deleteContents();
			var el = document.createElement('div');
			el.innerHTML = html;
			var frag = document.createDocumentFragment(), node, lastNode;
			while ((node = el.firstChild)) {
				lastNode = frag.appendChild(node);
			}

			range.insertNode(frag);
			if (lastNode) {
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	} else if (document.selection && document.selection.type != 'Control') {
		$(dthis).focus(); //在非标准浏览器中 要先让你需要插入html的div 获得焦点
		ierange = document.selection.createRange();//获取光标位置
		ierange.pasteHTML(html); //在光标位置插入html 如果只是插入text 则就是fus.text="..."
		$(dthis).focus();

	}
}

