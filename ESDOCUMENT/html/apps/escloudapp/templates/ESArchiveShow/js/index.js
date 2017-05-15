$(function(){
		_i={
				_rightP:function(show){
					show = show||false;
					if(!show){
						$(".arrR").hide();
						$(".btnNext").hide();
					}else{
						$(".arrR").show();
						$(".btnNext").show();
					}
					return this;
				},
				_leftP:function(show){
					show=show||false;
					if(!show){
						$(".arrL").hide();
						$(".btnPrev").hide();
					}else{
						$(".arrL").show();
						$(".btnPrev").show();
					}
					return this;
				}
		}
	$('#showBox').mousemove(function(e){
		if (e.pageX < ($('#showBox').offset().left + $('#showBox').width() / 2)) {
			_i._leftP(true);
			_i._rightP(false);
		} else {
			_i._rightP(true);
			_i._leftP(false);
		};
		return this;
	}).mouseout(function(e){
		_i._rightP(false);
		_i._leftP(false);
		return this;
	});
});
/*
 * 系统首页
 * 方吉祥
 * 
 * boardId = {1:档案新闻, 2:档案故事, 3:大事记, 4:档案规范, 5:图说档案, 6:我的待办(不是数据库取值,只做版块标准)}
 * .mores,.details 样式做为单击事件不能再做其它用途
 * 
 */
var formSubmit={
		submitByKey:function(){
			document.onkeyup = function (e){
				var e_ = window.event || e;
				if(e_.keyCode===13){
					formSubmit.submitByClick();
				}
			}
		},
		submitByClick:function(){
			//$url=$.appClient.generateUrl({ESArchiveSeache:'searchresults'});
			//$("#searchForm").attr('action',$url).submit();
			var keyVal=$("input[name='key']",$("#searchForm")).val();
			if(keyVal=='')return;
			var url = $.appClient.generateUrl({ESArchiveSeache:"admin"});
			window.location.href =encodeURI(url+'#tag|'+keyVal+'|'+new Date().getTime());
			return;
		}
		
};
$(":input",$("#searchForm")).keydown(formSubmit.submitByKey);
$(".go",$("#searchForm")).click(formSubmit.submitByClick);
var _global = {
	
	boardId: false, // 信息ID
	page: 1,  // 默认转入列表页面时开始页数
	limit: 20,  // 默认转入列表页面时条数
	total: false, // 总页数
	interval: false, // 定时器
	picthumlist: document.getElementById('picthumlist'), // 浏览图片ul列表对象
	thepicworld: document.getElementById('thepicworld'),
	browser: false
};

// 打开方法
var _opens = {
	
	home: function (){ // 首页
		
		window.location.reload();
		
	},
	taskHome: function (){ // 待办首页
		
		var baseUrl = $.appClient.generateUrl({ESCollaborative:'index'});
		window.location.href = baseUrl;
		
	},
	list: function (){
		window.open($.appClient.generateUrl({ESArchiveShow:'list_paper',page: _global.page, limit: _global.limit, boardId: _global.boardId}))
	},
	lists: function (){ // 仅是列表HTML数据不包含渲染页面
	
			$.post(
				$.appClient.generateUrl({ESDefault:'GetPublishTopicList'},'x'),
				{page: _global.page, limit: _global.limit, boardId: _global.boardId},
				function (htm){
					
					$('#archivelist').html(htm);
					
				}
			
		);
		
	},
	detail: function (info){ // 打开详细页面
		var p = info.split('&'); // boardId&topicId
		window.open($.appClient.generateUrl({ESArchiveShow:'detail_paper',boardId: p[0], topicId: p[1]}));	
	},
	task: function (info){ // 打开待办页面
		
		// info = $type.'&'.$workId.'&'.$taskId.'&'.$todo.'&'.$extId.'&'.$formId;
		var p = info.split('&');
		if(p[2] === '0000' && p[5]){ // 组员待办时直接跳转到销毁模块 p[5]='formId'
			var template = p[0] === 'jianding' ? 'identify' : 'destroy';
			var url = $.appClient.generateUrl({ESArchiveDestroy:'index'});
				window.location.href = url+'#task|'+template+',member|'+ p[5] +'|'+new Date().getTime();
				return;
		}
			
		var baseUrl = $.appClient.generateUrl({ESCollaborative:'index'});
		var newUrl = baseUrl+'#task|' + p[0] + '|' + p[1] + '|' + p[2] + '|' + p[3] + '|' + p[4] + '|' + p[5] + '|' + new Date().getTime();
			window.location.href = newUrl;
	
	},
	browsePhoto: function (li){ // 根据topicId去获取一个图集信息
		var topicId = li.id;
		$('.pic a').remove();
		$.post(
			$.appClient.generateUrl({ESDefault:'imageOne'},'x'),
			{topicId:topicId, boardId:5},
			function (data){
			    var flag=true;
				var info = data.info;
				var list = data.list;
				var forNew = data.forNew;
				
				if(!info || !list.length){ // 验证是否打开图集
				
					$.dialog.notice({title:false, icon:'warning', content:'该图集数据不完整！', lock:false, time:2})
					return;
					
				}
				
				// 打开图集
				document.getElementById('lockscreen').style.display = 'block';
				var he = $('#contentA').css('height').substring(0,$('#contentA').css('height').length-2);
				$('#lockscreen').css('height', (parseInt(he) + 230)+"px") ;
//				
				var picinfo = '发布人：'+(info.author)+'&nbsp;&nbsp;&nbsp;&nbsp;发布时间：'+(info.time);
//				// 初始化界面数据
				document.getElementById('ttlForNew').innerHTML = info.title;
				$('#ttlForNew').css('font','"黑体" 24px normal');
//				document.getElementById('atpicinfo').innerHTML = picinfo;
				$('.saveBlog').html('浏览次数：'+(info.browse)+'次');
				var src = list[0].addr.replace(/_thumb/, '');
				$('.curIdx').html(1);
				$('.cntItem').html(list.length);
				$('.pic').append('<a id="pic_a" href="javascript:void(0)"  ><img id="pic_img"  src="'+src+'" style="width:'+list[0].width+'px;height:'+list[0].height+'px;max-width:870px;margin: auto;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
				$('#forText').html(list[0].text);
				$('#forTitle').html("<em>&nbsp;</em>");
				$('#forUser_new').html(picinfo);
//				$('#pic_img').attr('width',list[0].width).attr('height',list[0].height).attr('src',src).attr('title',info.title);
				$('#putAll_pic li').remove();
				_opens.img_little_pic =[];
				img_liitle_li = list; 
				var listLen = 5;
				$('.btn2 span').remove();
				$('.btn2').append("<span class='now' rel='1'></span>");
				if(list.length<=5){
					listLen = list.length;
				}else{
					$('.btnR a').removeClass('stop').attr('onclick','next_Pics_span(\'2\')');
					for(var i=0;i<list.length/5-1;i++){
						$('.btn2').append("<span rel='"+(i+2)+"' onclick='next_Pics_span(\""+(i+2)+"\")'></span>");
					}
				}
				$('.btn2').css('width',list.length/5*45);
				for(var i=0;i<listLen;i++){
					var src1 = list[i].addr.replace(/_thumb/, '');
					if(i==0){
						$('#putAll_pic').append('<li class="now"  sizcache="39" sizset="34"><img height="64" id="img_pic_little'+(i-1)+'"' 
								+' onclick="img_little_picChan(\'img_pic_little'+(i-1)+'\')" rel="'+(i-1)+'" style="height:64px;cursor: pointer;" alt="" src="'+src1+'"></img></li>');
					}else{
						$('#putAll_pic').append('<li sizcache="39" sizset="34"><img height="64" id="img_pic_little'+(i-1)+'" '
								+'onclick="img_little_picChan(\'img_pic_little'+(i-1)+'\')" rel="'+(i-1)+'" style="height:64px;cursor: pointer;" alt="" src="'+src1+'"></img></li>');
					}
				}
				for(var i=0;i<list.length;i++){
					_opens.img_little_pic.push({'count':i-1,'width':list[i].width,'height':list[0].height,'src':list[i].addr.replace(/_thumb/, ''),'text':list[i].text,title:info.title});
				}
				//forNew
				if(forNew[0]!=undefined &&forNew[0] !=null){
					/**
					 * <a id='forNewPre_a' href="javascript:void(0)" title="" href="" >
								<img id='forNewPre' width="94" height="64" alt="" src=''></img>
								<<上一图集
							</a>
					 */
					$('.prevGroup').append('<a id="forNewPre_a" href="javascript:void(0)" title="'+forNew[0]['title']+'" onclick="forNewPre_aClick()" info="'+forNew[0]['id']+'" href="" ><img  width="94" height="64" alt="" style="height:64px;margin:0 auto;" src="'+forNew[0]['adr'].replace(/_thumb/, '')+'"></img><<上一图集</a>');
				}else{
					$('.prevGroup').append('<a id="forNewPre_a" title="已无图片" href="javascript:void(0)" ><img width="94" style="height:64px;margin:0 auto;" height="64" alt="" src="/templates/es/images/warn.gif"></img>已无图片</a>');
				}
				if(forNew[1]!=undefined &&forNew[1] !=null){
					/**
					 * <a title="" href="javascript:void(0)" id='forNewNext_a' >
								<img id='forNewNext' width="94" height="64" alt="" src=""></img>
								下一图集>>
							</a>
					 */
					$('.nextGroup').append('<a id="forNewNext_a" title="'+forNew[1]['title']+'" href="javascript:void(0)" onclick="forNewNext_aClick()" info="'+forNew[1]['id']+'"><img width="94" style="height:64px;margin:0 auto;" height="64" alt="" src="'+forNew[1]['adr'].replace(/_thumb/, '')+'"></img>下一图集>></a>');
				}else{
					$('.nextGroup').append('<a id="forNewNext_a" title="已无图片" href="javascript:void(0)" ><img width="94" style="height:64px;margin:0 auto;" height="64" alt="" src="/templates/es/images/warn.gif"></img>已无图片</a>');
				}

			},
			'json'
		);
	
	},
	img_little_pic:[],
	img_liitle_li:[],
	clickRight:function(){
		if($('li[class="now"]').length<1){
			var curIdx = parseInt($('.curIdx').html());
			var cntItem = parseInt($('.cntItem').html());
			if(cntItem == curIdx){
//				next_Pics_span(1);
//				$('#pic_a').remove();
//				$('li[class="now"]').removeClass('now');
//				$('#img_pic_little-1').parent().attr('class','now');
//				for(var i=0;i<_opens.img_little_pic.length;i++){
//					var t=_opens.img_little_pic[i];
//					if($('#img_pic_little-1').attr('rel') == t.count){
//						$('.curIdx').html(parseInt(t.count) + 2);
//						$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
//						$('#forText').html(t.text);
//						$('#pic_img').attr('src',t.src);
//					}
//				}
				$.dialog.notice({content:'已经到了最后一张图片！' ,icon:'warning',time :3});
			}else{
				next_Pics_span(Math.ceil((curIdx+1)/5));
				$('#pic_a').remove();
				$('li[class="now"]').removeClass('now');
				$('#img_pic_little'+(curIdx-1)).parent().attr('class','now');
				for(var i=0;i<_opens.img_little_pic.length;i++){
					var t=_opens.img_little_pic[i];
					if($('#img_pic_little'+(curIdx-1)).attr('rel') == t.count){
						$('.curIdx').html(parseInt(t.count) + 2);
						$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto 0 auto 0;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
						$('#forText').html(t.text);
						$('#pic_img').attr('src',t.src);
					}
				}
			}
		}else{
			var rel = parseInt($('li[class="now"]').children().attr('rel'));
			if((rel+2) == $('.cntItem').html()){
				$.dialog.notice({content:'已经到了最后一张图片！' ,icon:'warning',time :3});
			}else{
				if(rel == $('#putAll_pic li:last img').attr('rel')){
					next_Pics_span(((rel+2)/5+1));
				}
				$('#pic_a').remove();
				$('li[class="now"]').removeClass('now');
				$('#img_pic_little'+(rel+1)).parent().attr('class','now');
				for(var i=0;i<_opens.img_little_pic.length;i++){
					var t=_opens.img_little_pic[i];
					if($('#img_pic_little'+(rel+1)).attr('rel') == t.count){
						$('.curIdx').html(parseInt(t.count) + 2);
						$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto 0 auto 0;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
						$('#forText').html(t.text);
						$('#pic_img').attr('src',t.src);
					}
				}
			}
		}
	},
	clickLeft:function(){
		if($('li[class="now"]').length<1){
			var curIdx = parseInt($('.curIdx').html());
			var cntItem = parseInt($('.cntItem').html());
			if(1 == curIdx){
//				next_Pics_span(Math.ceil(parseInt($('.cntItem').html())/5));
//				$('#pic_a').remove();
//				$('li[class="now"]').removeClass('now');
//				$('#img_pic_little'+(parseInt($('.cntItem').html())-2)).parent().attr('class','now');
//				for(var i=0;i<_opens.img_little_pic.length;i++){
//					var t=_opens.img_little_pic[i];
//					if($('#img_pic_little'+(parseInt($('.cntItem').html())-2)).attr('rel') == t.count){
//						$('.curIdx').html(parseInt(t.count) + 2);
//						$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto 0 auto 0;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
//						$('#forText').html(t.text);
//						$('#pic_img').attr('src',t.src);
//					}
//				}
				$.dialog.notice({content:'已经到了第一张图片！' ,icon:'warning',time :3});
			}else{
				next_Pics_span(Math.ceil((curIdx-1)/5));
				$('#pic_a').remove();
				$('li[class="now"]').removeClass('now');
				$('#img_pic_little'+(curIdx-3)).parent().attr('class','now');
				for(var i=0;i<_opens.img_little_pic.length;i++){
					var t=_opens.img_little_pic[i];
					if($('#img_pic_little'+(curIdx-3)).attr('rel') == t.count){
						$('.curIdx').html(parseInt(t.count) + 2);
						$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto 0 auto 0;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
						$('#forText').html(t.text);
						$('#pic_img').attr('src',t.src);
					}
				}
			}
		}else{
			var rel = parseInt($('li[class="now"]').children().attr('rel'));
			if((rel+2) == 1){
				$.dialog.notice({content:'已经到了第一张图片！' ,icon:'warning',time :3});
			}else{
				if(rel == $('#putAll_pic li:first img').attr('rel')){
					next_Pics_span((rel+1)/5);
				}
				$('#pic_a').remove();
				$('li[class="now"]').removeClass('now');
				$('#img_pic_little'+(rel-1)).parent().attr('class','now');
				for(var i=0;i<_opens.img_little_pic.length;i++){
					var t=_opens.img_little_pic[i];
					if($('#img_pic_little'+(rel-1)).attr('rel') == t.count){
						$('.curIdx').html(parseInt(t.count) + 2);
						$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto 0 auto 0;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
						$('#forText').html(t.text);
						$('#pic_img').attr('width',t.width).attr('height',t.height).attr('src',t.src).attr('title',t.title);
					}
				}
			}
		}
	
	},
	showPic: function (imgObj){ // 显示大图
		
			// 设置和初始化dom对象
			if(_image.imgDom.width == undefined){ // 打开浏览模式
				
				_image.imgDom = _global.picthumlist.children[0].children[0]; // 小图dom对象
				_image.origImgDom = _global.thepicworld.children[0]; // 小图dom对象
				
				_image.imgDom.style.border = '3px solid #fff';
				_image.origImgDom.className = '';
				
			}else{ // 单击图片列表切换图片
				
				_image.imgDom.removeAttribute('style');
				_image.origImgDom.className = 'none';
				
				_image.imgDom = imgObj; // init
				_image.origImgDom = _global.thepicworld.children[Number(imgObj.id)];
				
				_image.imgDom.style.border = '3px solid #fff';
				_image.origImgDom.className = '';
			}
			// 设置和初始化dom对象结束
			
			// 根据图片高度设置标签高度
			var width = _image.origImgDom.width;
			var height = _image.origImgDom.height;
			if(width > 870){ // 超出外部DIV时初始化为宽870并使高度也随之改变
				
				height = Math.ceil(height/(width/870)); // 2000/(3200/870)
				width = 870;
				
			}
			
			_image.origImgDom.width = width;
			_image.origImgDom.height = height; // 2000/(3200/870)
			
			// 重置放大图DIV高度
			_global.thepicworld.style.height = (height)+'px';
			// 重置左右按钮位置
			var picprev = document.getElementById('picprev');
			var picnext = document.getElementById('picnext');
				picprev.style.marginLeft = picnext.style.marginLeft = '5px';
				picprev.style.marginTop = picnext.style.marginTop = (height-20)/2+'px';
			
			_image.goPosition();
			
	}
	
};

// 收藏夹
var _favorate = {
	isFavorate: false,
	url: window.location.href,
	addFavorate: function (that){
		
		window.location.hash = '';
		var url = window.location.href+'favorate&'+that.getAttribute('info');
		
		var title = that.parentNode.children[1].innerHTML;
		
		if (document.all){
			
			//_global.browser = 'ie';
			window.external.addFavorite(url,title); // ie
			
		}else if(window.sidebar){
			//_global.browser = 'firefox';
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
		
	},
	getFavorate: function (){
		var hash = window.location.hash.split('&');
		if(hash[0] == '#favorate' && hash.length == 3){
			this.isFavorate = true;
			_opens.detail(hash[1]+'&'+hash[2]);
			window.location.hash = '';
		}
	}
};

_favorate.getFavorate(); // 是否是收藏

var _tools = {
	reloadInterval: false,
	download: function (info,obj){  // fileId&mark&mainSite	
		var p = info.split('&');	
//		$.ajax({
//			url: $.appClient.generateUrl({ESInformationPublish:'GetFileUrl'},'x'),
//			data: {fileId: p[0], mark: p[1], mainSite: p[2], index:'true'},
//			type: 'POST',
//			async: false, 
//			success: function(url){
//				// failure:请求资源错误 @ 后台抛错	
//
//				if(url.substring(0, 7) == 'failure'){
//					var failure = url.split(':'); // ['failure', '请求资源错误']
//					$.dialog.notice({title:'错误提示', content: failure[1], icon:'error', time:2});
//					return false;
//				}else{
//					$(obj).attr({'target': '_blank', 'href': url});
//					//window.open(url);
//				}
//			},
//			error: function() {
//				$.dialog.notice({title:'错误提示', content: '服务器异常！', icon: 'error', time: 3});
//			}			
//		});
		
		$.ajax({
			url: $.appClient.generateUrl({ESInformationPublish:'downFile'},'x'),
			data: {fileId: p[0], mark: p[1], index:'true'},
			type: 'POST',
			async: false, 
			success: function(url){
				window.location=url;
			}
		});
	
	},
	init: function (){
		if(document.getElementById('PPlayer_btn') && document.getElementById('PPlayer_btn').children.length){
			
			_image.btnObj = document.getElementById('PPlayer_btn').children[0].children[0];
			_image.photoObj = document.getElementById('PPlayer_photo').children[0]; // 只到li节点
			
			_image.bind('PPlayer_btn');
			_image.bind('PPlayer_photo');
			_global.interval = setInterval(_image.autoPlay, 3000);
			this.reloadInterval = setInterval( this.reload, 500); // 为兼容ie在选择收藏时不能够自动跳转用,每500毫秒刷新页面一次
		}
		
	},
	close: function (){
		
		_image.imgDom = _image.imgDomBetween = _image.origImgDom = {};
		_image.imglength = _image.postotal = _image.pospage = _image.imgNowPos = 126;
	
		document.getElementById('atpictitle').innerHTML = document.getElementById('atpicinfo').innerHTML = document.getElementById('atpicmain').innerHTML = document.getElementById('picthumlist').innerHTML = '';
		document.getElementById('picthumlist').style.left = '0px';
		document.getElementById('lockscreen').style.display = 'none';
		document.getElementById('centerFunc').style.display = 'block';
	
	},
	reload: function (){
		var hash = window.location.hash.split('&');
		if( hash.length>1 && hash[0] == '#favorate'){
			clearInterval(this.reloadInterval);
			if( _global.browser != 'chrome') window.location.reload();
		}
	}

};

var _event = {

	click: function (id, li){ // id = PPlayer_btn|PPlayer_photo
		if(id == 'picthumlist'){
			
			_opens.showPic(li);
			
		}else{
			//var obj = li.children[0];
			_opens.browsePhoto(li);
		}
	},
	over: function (id, li){
		if(id == 'picthumlist'){
		
			li.className = 'border';
			
		}else{
		
			clearInterval(_global.interval);
		
			if(id == 'PPlayer_btn'){
				var btnObjs = document.getElementById(id).children; // id == PPlayer_btn
				var l = btnObjs.length;
				// 按钮
				_image.btnObj.className = '';
				_image.photoObj.className = '';
				
				_image.btnObj = li;
				
				for(var i=0; i<l; i++){
				
					if(btnObjs[i].children[0] == li){
						_image.photoObj = document.getElementById('PPlayer_photo').children[i];
						break;
					}
					
				}
				
				li.className = 'focus';
				_image.photoObj.className = 'block';
				
			}
		
		}
		
	},
	out: function (id, li){
		if(id == 'picthumlist'){
		
			li.className = 'noborder';
			
		}else{
			_global.interval = setInterval(_image.autoPlay, 3000);
			if(id == 'PPlayer_btn'){
				
				_image.btnObj.className = '';
				
			}
		}
	}

};

var _image = {
	
	number: -1, // 自动播放初始下标
	btnObj: {}, // 当前轮播器按钮被单击DIV Dom对象(首页图片播放器右边五个缩略图按钮)
	photoObj: {}, // 当前轮播器显示a Dom对象(首页图片播放器左边大图)
	imgDom: {}, // 浏览模式图片列表中被单击img dom对象
	origImgDom: {}, // 显示大图片dom对象
	imglength: 0, // 浏览模式时列表长度
	postotal: 0, // 浏览模式时列表每5个一页共多少页
	pospage: 1, // 默认第一页浏览模式时当前列表页码
	imgpagelimit: 7, // 图片列表左右翻页按钮每次翻过7张
	imgDomBetween: {}, // 图片列表中间图片
	imgNowPos: 0, // 列表位置
	bind: function(id){
	
		var liObj = document.getElementById(id).children;
		var lilen = liObj.length;
		for(var b=0; b<lilen; b++){
		
			liObj[b].children[0].onclick = function (){
			
				_event.click(id, this);
				
			}
			liObj[b].children[0].onmouseover = function (){
			
				_event.over(id, this);
				
			}
			liObj[b].children[0].onmouseout = function (){
			
				_event.out(id, this);
				
			}
		
		}
	
	},
	autoPlay: function (){
		
		var that = this._image; // this = window
		that.number++;
		
		var btnObjs = document.getElementById('PPlayer_btn');
		
		if(!btnObjs){ // 打开详细页面或都列表页面在清除定时器之前定时器还没有被执行时存丰
			clearInterval(_global.interval);
			return;
		}
		
		btnObjs = btnObjs.children;
		var photoObjs = document.getElementById('PPlayer_photo').children;
		var lilen = btnObjs.length;
		
		if(that.number >= lilen){
		
			that.number = 0;
		
		}
		
		that.btnObj.className = '';// 清除前一个按钮样式
		that.photoObj.className = '';
		
		var btnTmpObj = that.btnObj = btnObjs[that.number].children[0];
		var photoTmpObj = that.photoObj = photoObjs[that.number]; // 只到li节点
		btnTmpObj.className = 'focus';
		photoTmpObj.className = 'block';
	},
	prev: function (){
		var i = Number(_image.imgDom.id);
		if(i-1 < 0){
		
			$.dialog.notice({icon:'warning', content: '当前是第一张', lock: false, time: 2});
			return;
		}
		var imgDom = _global.picthumlist.children[i-1].children[0];
		_opens.showPic(imgDom);
	
	},
	next: function (){
		var that = this;
		if(Number(_image.imgDom.id)+1 >= _image.imglength){
			
			$.dialog({
				icon:'warning',
				content: '当前是最后一张',
				okVal: '重新浏览',
				cancelVal: '结束浏览',
				ok: function (){
					var first = _global.picthumlist.children[0].children[0];
					_image.pospage = 0;
					_image.imgNowPos = 126; // 126-126
					if(_image.imglength > _image.imgpagelimit) _image.imgDomBetween = _global.picthumlist.children[3].children[0];
					_opens.showPic(first);
				},
				cancel: function (){
					_tools.close();			
				}
			});
			return;
		}
		
		var i = Number(_image.imgDom.id);
		var imgDom = _global.picthumlist.children[i+1].children[0];
		_opens.showPic(imgDom);
	
	},
	prevs: function (){
		
		if( this.pospage-1 < 1 || this.imglength <= this.imgpagelimit ) return; // 初始可以显示7张, 总数大于7才执行换下5张图片
		
		this.pospage = this.pospage - 1; // ****
		
		var nowBetweenIndex = (this.pospage-1) * this.imgpagelimit +3; // 
		this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
		this.imgNowPos = (nowBetweenIndex-3)*126;
		
		var left = (this.pospage-1) * this.imgpagelimit * 126;
		
		var pos =  this.pospage === 1 ? '0px' : '-'+ left +'px';
		
		_global.picthumlist.style.left = pos;
		
	},
	nexts: function (){
		
		if( this.imglength <= this.imgpagelimit ) return; // 初始可以显示7张, 总数大于7才执行换下5张图片
		
		this.pospage = (this.pospage+1 > this.postotal) ? 1 : this.pospage + 1; // 返回第一页(1+1=2),0+1是第一页
		
		var nowBetweenIndex = (this.pospage-1) * this.imgpagelimit +3; // 
		this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
		this.imgNowPos = (nowBetweenIndex-3)*126;
		
		var left = (this.pospage-1) * this.imgpagelimit * 126;
		
		var pos =  this.pospage === 1 ? '0px' : '-'+ left +'px';
		_global.picthumlist.style.left = pos;
		
	},
	goPosition: function (){ // 列表定位
	
		if( this.imglength <= this.imgpagelimit ) return; // 初始可以显示7张, 总数大于7才执行换下5张图片
		
		
		var thisIndex = Number(this.imgDom.id); // 当前图片下标
		
		this.pospage = Math.ceil((thisIndex+1)/this.imgpagelimit); // 给当前页码初始化
		
		var cacheBetweenIndex = Number(this.imgDomBetween.id); // 算每页的中间值图片
		
		
		if( thisIndex < cacheBetweenIndex ){ // 向前翻页
			
			//var totalPos = (this.imglength-this.imgpagelimit) * 126;
			
			if(this.imgNowPos-126 >= 0){
				
				this.imgNowPos = this.imgNowPos-126;
				_global.picthumlist.style.left = '-'+ this.imgNowPos +'px';
				
				var nowBetweenIndex = cacheBetweenIndex-1; // 缓存里中间图片下标
				this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
			}
			
		}else if( thisIndex > cacheBetweenIndex ){ // 向后翻页
			
			var totalPos = (this.imglength-this.imgpagelimit) * 126;
			
			if(this.imgNowPos+126 <= totalPos){
				
				this.imgNowPos = this.imgNowPos+126;
				_global.picthumlist.style.left = '-'+ this.imgNowPos +'px';
				
				var nowBetweenIndex = cacheBetweenIndex+1; // 缓存里中间图片下标
				this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
			}
			
		}
		
		
		
	}

};

if(!_favorate.isFavorate){
	// 1:档案新闻
	$.post(
		$.appClient.generateUrl({ESDefault:'archive_list'},'x'),
		{page: 1, limit: 6, boardId:1},
		function (htm){
			
			$('#news').html(htm);
			
		}
	);
	
	// 2:档案故事
	$.post(
		$.appClient.generateUrl({ESDefault:'archive_list'},'x'),
		{page: 1, limit: 6, boardId:2},
		function (htm){
			
			$('#story').html(htm);
			
		}
	);
	
	// 3:大事记
	$.post(
		$.appClient.generateUrl({ESDefault:'archive_list'},'x'),
		{page: 1, limit: 6, boardId:3},
		function (htm){
			
			$('#event').html(htm);
			
		}
	);
	
	// 4:档案规范
	$.post(
		$.appClient.generateUrl({ESDefault:'archive_list'},'x'),
		{page: 1, limit: 16, boardId:4},
		function (htm){
			
			$('#standard').html(htm);
		}
	);
	
	//titleLineRight1Content
	// 4:档案规范
	$.post(
		$.appClient.generateUrl({ESDefault:'archive_list'},'x'),
		{page: 1, limit: 4, boardId:5},
		function (htm){
			$('#titleLineRight1Content').html(htm);
		}
	);
	//获取待办
	$.post(
		$.appClient.generateUrl({ESDefault:'task_list'},'x'),
		{page: 0, limit: 4},
		function (htm){
			$('#Tasks').html(htm);
		}
	);
}

// 更多
$('.mores').live('click', function (){
	
	var boardId = _global.boardId =  this.getAttribute('boardid');
	if( boardId == 6 ){ // 6:我的待办
	
		_opens.taskHome();
		
	}else{
		
		_opens.list();
	
	}
	
	
});

// 单击列表展示内容详细页面
$('.details').live('click', function (){
	var info = this.getAttribute('info');
	if(this.parentNode.parentNode.id == 'Tasks'){
		// publish&65929&65935&no_handle&5,181,22&39
		// $type.'&'.$workId.'&'.$taskId.'&'.$todo.'&'.$extId.'&'.$formId;
		_opens.task(info);
		
	}else if(this.parentNode.parentNode.id  == 'titleLineRight1Content'){
	
		var info = info.split('&');
		var o = {boardId: info[0], id: info[1]}; // id = topicId
		_opens.browsePhoto(o); // 接收参数为某一dom对象(只用到dom.id = topicId)
	
	}else{
	
		_opens.detail(info); // info = boardId,topicId
	
	}
	
});

// 面包屑导航-回首页
$('#goHome').live('click',function (){

	_opens.home();
	
});

// 下载
$('.downloads').live('click', function (){

	_tools.download(this.getAttribute('info'),this);
	
});

// 收藏
$('.favorates').live('click', function (){

	_favorate.addFavorate(this);
	return false;
	
});

// 关闭浏览模式
$('#closelockscreen').click(function (){
	
	_tools.close();
	
});
/*
document.getElementById('lockscreen').ondblclick = function (){

	_tools.close();
	
};
*/
/*
// 上一张
document.getElementById('picprev').onclick = function (){
	
	_image.prev();
	
};
// 下一张
document.getElementById('picnext').onclick = function (){
	
	_image.next();
};

// 向前移动5张
document.getElementById('picprevs').onclick = function (){
	
	_image.prevs();
	
};
// 向后移动5张
document.getElementById('picnexts').onclick = function (){
	
	_image.nexts();
};
*/


/** 年月日的生成 * */
function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var week = today.getDay();
	m = checkTime(m);
	s = checkTime(s);
	$("#daySection").text(day);
	$("#monthSection").text(month + "月");
	$("#weekSection").text("星期" + week);
	if(document.getElementById('hourSection')){
		document.getElementById('hourSection').innerHTML = h + ":" + m + ":" + s;
	}
	t = setTimeout('startTime()', 500);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i
	}
	return i
}

/** liuhezeng  控制滚动条横向滚动 **/

var Browser = function(){
	 var d_ = document,n_ = navigator,t_ = this,s_= screen;
	 
	    var b = n_.appName;
	    var ua = n_.userAgent.toLowerCase();
	    
	 t_.name = "Unknow";
	 
	 t_.safari = ua.indexOf("safari")>-1;  // always check for safari & opera
	    t_.opera = ua.indexOf("opera")>-1;    // before ns or ie
	 t_.firefox = !t_.safari && ua.indexOf('firefox')>-1; // check for gecko engine 
	    t_.ns = !t_.firefox && !t_.opera && !t_.safari && (b=="Netscape");
	    t_.ie = !t_.opera && (b=="Microsoft Internet Explorer");
	 
	 t_.name = (t_.ie ? "IE" : (t_.firefox ? "Firefox" : (t_.ns ? "Netscape" : (t_.opera ? "Opera" : (t_.safari ? "Safari" : "Unknow")))));
	}
	var brw = new Browser();
	var apDiv1 ;
	if($("#mainContentContainer").length>0){
		apDiv1 = document.getElementById("mainContentContainer");
	}else{
		apDiv1 = document.getElementById("lockscreen");
	}
	var perWidth = apDiv1.clientWidth / 2;
	var mouse_wheel = function(e){
	 var evt = window.event || e;
	 if(evt.detail > 0 || evt.wheelDelta < 0)
	  apDiv1.scrollLeft += perWidth;
	 else
	  apDiv1.scrollLeft -= perWidth;
	}
	var mouse_wheel_opera = function(e){
	var obj = e.srcElement;
	 if(obj == apDiv1){
	  mouse_wheel(e);
	 }
	} 
	 
	switch(brw.name){
	 case "IE":
	 case "Safari":
	  apDiv1.onmousewheel = mouse_wheel;
	  break;
	 case "Firefox":
	  apDiv1.addEventListener("DOMMouseScroll", mouse_wheel, false);
	  break;
	 case "Opera":
	  document.onmousewheel = mouse_wheel_opera;
	  break;
	}
	
	/**   词条效果  **/
	$('.lineModelRight14').hover(function(){
		$('.showTextAreaUpRight14').hide(); 
		$('.hideTextAreaUpRight14').slideDown(300); 
	},function(){
		$('.hideTextAreaUpRight14').slideUp(300);
		$('.showTextAreaUpRight14').show(300); 
		}
	);
	
	$('.lineModelLeft2').hover(function(){
		$('.showTextAreaUpLeft2').hide(); 
		$('.hideTextAreaUpLeft2').slideDown(300); 
	},function(){
		$('.hideTextAreaUpLeft2').slideUp(300);
		$('.showTextAreaUpLeft2').show(300); 
		}
	);
	
	$('.lineModelRight3').hover(function(){
		$('.showTextAreaUpRight3').hide(); 
		$('.hideTextAreaUpRight3').slideDown(300); 
	},function(){
		$('.hideTextAreaUpRight3').slideUp(300);
		$('.showTextAreaUpRight3').show(300); 
		}
	);
	
	$('.lineModelRight1Login').hover(function(){
		$('.showTextAreaUpRight1Login').hide(); 
		$('.hideTextAreaUpRight1Login').slideDown(300); 
	},function(){
		$('.hideTextAreaUpRight1Login').slideUp(300);
		$('.showTextAreaUpRight1Login').show(300); 
		}
	);
	function img_little_picChan(id){
		if($('#'+id).parent().attr('class')=='now'){
			return
		}
		$('#pic_a').remove();
		$('li[class="now"]').removeClass('now');
		$('#'+id).parent().attr('class','now');
		for(var i=0;i<_opens.img_little_pic.length;i++){
			var t=_opens.img_little_pic[i];
			if($('#'+id).attr('rel') == t.count){
				$('.curIdx').html(parseInt(t.count) + 2);
				$('#picPlayerWrap').append('<a id="pic_a" href="javascript:void(0)"> <img id="pic_img" style="width:'+t.width+'px;height:'+t.height+'px;margin: auto 0 auto 0;padding-left:auto; display: inline; visibility: visible; filter: none; zoom: 1;"　 src="" ></img></a>');
				$('#forText').html(t.text);
				$('#pic_img').attr('src',t.src);
			}
		}
	
	}
	function forNewPre_aClick(){
		var o = {boardId: 5, id: $('#forNewPre_a').attr('info')};
		$('#putAll_pic li').remove();
		$('.btnL a').attr('class','stop').removeAttr("onclick");
		$('.btnR a').attr('class','stop').removeAttr("onclick");
		$('.prevGroup a').remove();
		$('.nextGroup a').remove();
		$('.btn2 span').remove();
		$('.pic a').remove();
		_opens.browsePhoto(o); 
	}
	function forNewNext_aClick(){
		var o = {boardId: 5, id: $('#forNewNext_a').attr('info')};
		$('.prevGroup a').remove();
		$('.nextGroup a').remove();
		$('#putAll_pic li').remove();
		$('.btnL a').attr('class','stop').removeAttr("onclick");
		$('.btnR a').attr('class','stop').removeAttr("onclick");
		$('.btn2 span').remove();
		$('.pic a').remove();
		_opens.browsePhoto(o); 
	}
	$(function(){
		$('.arrR').click(function(){
			_opens.clickRight();
		});
		$('.arrL').live('click',function(){
			_opens.clickLeft();
		});
		$('.btnNext').live('click',function(){
			_opens.clickRight();
		});
		$('.btnPrev').live('click',function(){
			_opens.clickLeft();
		});
		$('.l .default').live('click',function(){
			window.open($('#pic_a img').attr('src'));
			return;
		});
		$('#showNewsMove').live('click',function(){
			_global.page = 1;
			 _global.limit = 20;
			  _global.boardId =1;
			  _opens.list();
		});
		$('#showEventMove').live('click',function(){
			_global.page = 1;
			 _global.limit = 20;
			  _global.boardId =3;
			  _opens.list();
		});
		$('#showStoryMove').live('click',function(){
			_global.page = 1;
			_global.limit = 20;
			_global.boardId =2;
			_opens.list();
		});
		$('#showPicMove').live('click',function(){
			_global.page = 1;
			_global.limit = 20;
			_global.boardId =5;
			_opens.list();
		});
		$('#showStandardMove').live('click',function(){
			_global.page = 1;
			_global.limit = 20;
			_global.boardId =4;
			_opens.list();
		});
		$('.showLoad_new').live('click',function(){
			_opens.home();
		});
		$('.showMore_data').live('click',function(){
			_global.page = 1;
			_global.limit = 20;
			_global.boardId = $('.showMore_data').attr('rel');
			_opens.list();
		});
	});
	function next_Pics_span(t){
		var tt =$('.btn2 span[class="now"]').attr('rel');
		if(t!=1){
			$('.btnL a').removeClass('stop').attr('onclick','next_Pics_span(\''+(parseInt(t)-1)+'\')');
			if(t==Math.ceil(img_liitle_li.length/5)){
				$('.btnR a').attr('class','stop').removeAttr("onclick");
			}else{
				$('.btnR a').removeClass('stop').attr('onclick','next_Pics_span(\''+(parseInt(t)+1)+'\')');
			}
		}else{
			$('.btnR a').removeClass('stop').attr('onclick','next_Pics_span(\''+(parseInt(t)+1)+'\')');
			$('.btnL a').attr('class','stop').removeAttr("onclick");
		}
		$('.btn2 span[class="now"]').removeClass('now').attr('onclick','next_Pics_span(\''+tt+'\')');
		$('.btn2 span[rel="'+t+'"]').attr('class','now').removeAttr("onclick");
		$('#putAll_pic li').remove();
		var count = 0;
		for(var i=((t-1)*5);i<img_liitle_li.length&& count<5;i++){
			count++;
			var src1 = img_liitle_li[i].addr.replace(/_thumb/, '');
			var curIdx = parseInt($('.curIdx').html());
			if(i==(curIdx-1)){
				$('#putAll_pic').append('<li class="now"  sizcache="39" sizset="34"><img height="64" id="img_pic_little'+(i-1)+'"' 
						+' onclick="img_little_picChan(\'img_pic_little'+(i-1)+'\')" rel="'+(i-1)+'" style="height:64px;cursor: pointer;" alt="" src="'+src1+'"></img></li>');
			}else{
				$('#putAll_pic').append('<li sizcache="39" sizset="34"><img height="64" id="img_pic_little'+(i-1)+'" '
						+'onclick="img_little_picChan(\'img_pic_little'+(i-1)+'\')" rel="'+(i-1)+'" style="height:64px;cursor: pointer;" alt="" src="'+src1+'"></img></li>');
			}
		}
	}






