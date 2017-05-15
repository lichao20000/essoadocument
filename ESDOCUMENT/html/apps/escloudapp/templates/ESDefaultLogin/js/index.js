/** 登录窗体自适应 **/
$('#login').toggle();
$("#loginFormSection").css("position","absolute");
$("#loginFormSection").css("top",$(window).height()/2-140 );
$("#loginFormSection").css("left",$(window).width() / 2 -200);

$('#loginButton').click(function() {
	$('#login').toggle(150);
});

$('#cancleSubmit').click(function() {
	$('#login').toggle();
});

window.onload = function() {
	$("#mainContentContainer").css("height", $(window).height() - 120);
	$("#centerFunc").css("margin-top", $(window).height() / 2 - 350);
	startTime();

};

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

	document.getElementById('hourSection').innerHTML = h + ":" + m + ":" + s;
	t = setTimeout('startTime()', 500);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i
	}
	return i
}

/** 系统首页 * */

var formSubmit = {
	submitByKey : function() {
		document.onkeyup = function(e) {
			var e_ = window.event || e;
			if (e_.keyCode === 13) {
				formSubmit.submitByClick();
			}
		}
	},
	submitByClick : function() {
		// $url=$.appClient.generateUrl({ESArchiveSeache:'searchresults'});
		// $("#searchForm").attr('action',$url).submit();
		var keyVal = $("input[name='key']", $("#searchForm")).val();
		if (keyVal == '')
			return;
		var url = $.appClient.generateUrl({
			ESArchiveSeache : "admin"
		});
		window.location.href = encodeURI(url + '#tag|' + keyVal + '|'
				+ new Date().getTime());
		return;
	}

};
$(":input", $("#searchForm")).keydown(formSubmit.submitByKey);
$(".go", $("#searchForm")).click(formSubmit.submitByClick);
var _global = {

	boardId : false, // 信息ID
	page : 1, // 默认转入列表页面时开始页数
	limit : 20, // 默认转入列表页面时条数
	total : false, // 总页数
	interval : false, // 定时器
	picthumlist : document.getElementById('picthumlist'), // 浏览图片ul列表对象
	thepicworld : document.getElementById('thepicworld'),
	browser : false
};

// 打开方法
var _opens = {

	home : function() { // 首页

		window.location.reload();

	},
	taskHome : function() { // 待办首页

		var baseUrl = $.appClient.generateUrl({
			ESCollaborative : 'index'
		});
		window.location.href = baseUrl;

	},
	list : function() { // 打开列表页面

		$.post($.appClient.generateUrl({
			ESDefault : 'list_paper'
		}, 'x'), {
			page : _global.page,
			limit : _global.limit,
			boardId : _global.boardId
		}, function(htm) {

			$('#Mainer').html(htm);

		}

		);

	},
	lists : function() { // 仅是列表HTML数据不包含渲染页面

		$.post($.appClient.generateUrl({
			ESDefault : 'GetPublishTopicList'
		}, 'x'), {
			page : _global.page,
			limit : _global.limit,
			boardId : _global.boardId
		}, function(htm) {

			$('#archivelist').html(htm);

		}

		);

	},
	detail : function(info) { // 打开详细页面
		var p = info.split('&'); // boardId&topicId
		$.post($.appClient.generateUrl({
			ESDefault : 'detail_paper'
		}, 'x'), {
			boardId : p[0],
			topicId : p[1]
		}, function(htm) {

			$('#Mainer').html(htm);

		}

		);

	},
	task : function(info) { // 打开待办页面

		// info =
		// $type.'&'.$workId.'&'.$taskId.'&'.$todo.'&'.$extId.'&'.$formId;
		var p = info.split('&');
		if (p[2] === '0000' && p[5]) { // 组员待办时直接跳转到销毁模块 p[5]='formId'
			var template = p[0] === 'jianding' ? 'identify' : 'destroy';
			var url = $.appClient.generateUrl({
				ESArchiveDestroy : 'index'
			});
			window.location.href = url + '#task|' + template + ',member|'
					+ p[5] + '|' + new Date().getTime();
			return;
		}

		var baseUrl = $.appClient.generateUrl({
			ESCollaborative : 'index'
		});
		var newUrl = baseUrl + '#task|' + p[0] + '|' + p[1] + '|' + p[2] + '|'
				+ p[3] + '|' + p[4] + '|' + p[5] + '|' + new Date().getTime();
		window.location.href = newUrl;

	},
	browsePhoto : function(li) { // 根据topicId去获取一个图集信息
		var topicId = li.id;
		$
				.post(
						$.appClient.generateUrl({
							ESDefault : 'imageOne'
						}, 'x'),
						{
							topicId : topicId,
							boardId : 5
						},
						function(data) {

							var info = data.info;
							var list = data.list;

							if (!info || !list.length) { // 验证是否打开图集

								$.dialog.notice({
									title : false,
									icon : 'warning',
									content : '该图集数据不完整！',
									lock : false,
									time : 2
								})
								return;

							}

							// 打开图集
							document.getElementById('lockscreen').style.display = 'block';
							var mainter = document.getElementById('Mainer').style.display = 'none';
							// 设置左浮动居中处理
							var atpicturebed = document
									.getElementById('atpicturebed');
							atpicturebed.style.marginLeft = Math
									.round((document.body.scrollWidth - 980) / 2)
									+ 'px';

							var imglistlong = _image.imglength = list.length;
							_image.postotal = Math.ceil(imglistlong
									/ _image.imgpagelimit); // 最多有几页

							var picinfo = '发布人：' + (info.author)
									+ '&nbsp;&nbsp;&nbsp;&nbsp;发布时间：'
									+ (info.time)
									+ '&nbsp;&nbsp;&nbsp;&nbsp;浏览次数：'
									+ (info.browse) + '次';
							// 初始化界面数据
							document.getElementById('atpictitle').innerHTML = info.title;
							document.getElementById('atpicinfo').innerHTML = picinfo;
							document.getElementById('atpicmain').innerHTML = info.text;

							var src = list[0].addr.replace(/_thumb/, '');

							// 图片列表
							var li = [ '<li><img id="0" src="' + list[0].addr
									+ '" title="' + info.title + '" alt="'
									+ info.title + '" width="116" /><b>1/'
									+ imglistlong + '</b></li>' ];
							var img = [ '<img src="' + src
									+ '" title="单击图片可切换下一张" alt="' + info.title
									+ '" />' ];

							for ( var i = 1; i < imglistlong; i++) {

								var src = list[i].addr.replace(/_thumb/, '');

								li.push('<li><img id="' + i + '" src="'
										+ list[i].addr + '" title="'
										+ info.title + '" alt="' + info.title
										+ '" width="116" /><b>' + (i + 1) + '/'
										+ imglistlong + '</b></li>');
								img.push('<img class="none" src="' + src
										+ '" title="' + info.title + '" alt="'
										+ info.title + '" />');

							}

							_global.picthumlist.innerHTML = li.join('');
							_global.thepicworld.innerHTML = img.join('');

							_global.picthumlist.style.width = imglistlong * 126
									+ 'px' // 每个li宽126px

							if (list.length > _image.imgpagelimit) {
								_image.imgDomBetween = _global.picthumlist.children[3].children[0];
							}

							_image.bind('picthumlist');

							setTimeout(_opens.showPic, 300); // 显示大图片

							// 给大图绑定单击事件(下一张)
							var thepicworld = _global.thepicworld.children;
							var pl = thepicworld.length;
							for ( var ind = 0; ind < pl; ind++) {

								thepicworld[ind].onclick = function() {
									_image.next();
								}

							}

						}, 'json');

	},
	showPic : function(imgObj) { // 显示大图

		// 设置和初始化dom对象
		if (_image.imgDom.width == undefined) { // 打开浏览模式

			_image.imgDom = _global.picthumlist.children[0].children[0]; // 小图dom对象
			_image.origImgDom = _global.thepicworld.children[0]; // 小图dom对象

			_image.imgDom.style.border = '3px solid #fff';
			_image.origImgDom.className = '';

		} else { // 单击图片列表切换图片

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
		if (width > 870) { // 超出外部DIV时初始化为宽870并使高度也随之改变

			height = Math.ceil(height / (width / 870)); // 2000/(3200/870)
			width = 870;

		}

		_image.origImgDom.width = width;
		_image.origImgDom.height = height; // 2000/(3200/870)

		// 重置放大图DIV高度
		_global.thepicworld.style.height = (height) + 'px';
		// 重置左右按钮位置
		var picprev = document.getElementById('picprev');
		var picnext = document.getElementById('picnext');
		picprev.style.marginLeft = picnext.style.marginLeft = '5px';
		picprev.style.marginTop = picnext.style.marginTop = (height - 20) / 2
				+ 'px';

		_image.goPosition();

	}

};

// 收藏夹
var _favorate = {
	isFavorate : false,
	url : window.location.href,
	addFavorate : function(that) {

		window.location.hash = '';
		var url = window.location.href + 'favorate&'
				+ that.getAttribute('info');

		var title = that.parentNode.children[1].innerHTML;

		if (document.all) {

			// _global.browser = 'ie';
			window.external.addFavorite(url, title); // ie

		} else if (window.sidebar) {
			// _global.browser = 'firefox';
			window.sidebar.addPanel(title, url, ""); // ff

		} else {

			_global.browser = 'chrome';

			window.location.hash = 'favorate&' + that.getAttribute('info');
			$.dialog({
				title : false,
				content : "请手动添加或按(ctrl+D)，并添加收藏后清除地址栏中“#”以后的参数",
				icon : 'warning',
				time : 3,
				lock : false
			});
		}

	},
	getFavorate : function() {
		var hash = window.location.hash.split('&');
		if (hash[0] == '#favorate' && hash.length == 3) {
			this.isFavorate = true;
			_opens.detail(hash[1] + '&' + hash[2]);
			window.location.hash = '';
		}
	}
};

_favorate.getFavorate(); // 是否是收藏

var _tools = {
	reloadInterval : false,
	download : function(info, obj) { // fileId&mark&mainSite
		var p = info.split('&');
		$.ajax({
			url : $.appClient.generateUrl({
				ESInformationPublish : 'GetFileUrl'
			}, 'x'),
			data : {
				fileId : p[0],
				mark : p[1],
				mainSite : p[2],
				index : 'true'
			},
			type : 'POST',
			async : false,
			success : function(url) {
				// failure:请求资源错误 @ 后台抛错

				if (url.substring(0, 7) == 'failure') {
					var failure = url.split(':'); // ['failure', '请求资源错误']
					$.dialog.notice({
						title : '错误提示',
						content : failure[1],
						icon : 'error',
						time : 2
					});
					return false;
				} else {
					$(obj).attr({
						'target' : '_blank',
						'href' : url
					});
					// window.open(url);
				}
			},
			error : function() {
				$.dialog.notice({
					title : '错误提示',
					content : '服务器异常！',
					icon : 'error',
					time : 3
				});
			}
		});

	},
	init : function() {
		if (document.getElementById('PPlayer_btn')
				&& document.getElementById('PPlayer_btn').children.length) {

			_image.btnObj = document.getElementById('PPlayer_btn').children[0].children[0];
			_image.photoObj = document.getElementById('PPlayer_photo').children[0]; // 只到li节点

			_image.bind('PPlayer_btn');
			_image.bind('PPlayer_photo');
			_global.interval = setInterval(_image.autoPlay, 3000);
			this.reloadInterval = setInterval(this.reload, 500); // 为兼容ie在选择收藏时不能够自动跳转用,每500毫秒刷新页面一次
		}

	},
	close : function() {

		_image.imgDom = _image.imgDomBetween = _image.origImgDom = {};
		_image.imglength = _image.postotal = _image.pospage = _image.imgNowPos = 126;

		document.getElementById('atpictitle').innerHTML = document
				.getElementById('atpicinfo').innerHTML = document
				.getElementById('atpicmain').innerHTML = document
				.getElementById('picthumlist').innerHTML = '';
		document.getElementById('picthumlist').style.left = '0px';
		document.getElementById('lockscreen').style.display = 'none';
		document.getElementById('Mainer').style.display = 'block';

	},
	reload : function() {
		var hash = window.location.hash.split('&');
		if (hash.length > 1 && hash[0] == '#favorate') {
			clearInterval(this.reloadInterval);
			if (_global.browser != 'chrome')
				window.location.reload();
		}
	}

};

var _event = {

	click : function(id, li) { // id = PPlayer_btn|PPlayer_photo
		if (id == 'picthumlist') {

			_opens.showPic(li);

		} else {
			// var obj = li.children[0];
			_opens.browsePhoto(li);
		}
	},
	over : function(id, li) {
		if (id == 'picthumlist') {

			li.className = 'border';

		} else {

			clearInterval(_global.interval);

			if (id == 'PPlayer_btn') {
				var btnObjs = document.getElementById(id).children; // id ==
																	// PPlayer_btn
				var l = btnObjs.length;
				// 按钮
				_image.btnObj.className = '';
				_image.photoObj.className = '';

				_image.btnObj = li;

				for ( var i = 0; i < l; i++) {

					if (btnObjs[i].children[0] == li) {
						_image.photoObj = document
								.getElementById('PPlayer_photo').children[i];
						break;
					}

				}

				li.className = 'focus';
				_image.photoObj.className = 'block';

			}

		}

	},
	out : function(id, li) {
		if (id == 'picthumlist') {

			li.className = 'noborder';

		} else {
			_global.interval = setInterval(_image.autoPlay, 3000);
			if (id == 'PPlayer_btn') {

				_image.btnObj.className = '';

			}
		}
	}

};

var _image = {

	number : -1, // 自动播放初始下标
	btnObj : {}, // 当前轮播器按钮被单击DIV Dom对象(首页图片播放器右边五个缩略图按钮)
	photoObj : {}, // 当前轮播器显示a Dom对象(首页图片播放器左边大图)
	imgDom : {}, // 浏览模式图片列表中被单击img dom对象
	origImgDom : {}, // 显示大图片dom对象
	imglength : 0, // 浏览模式时列表长度
	postotal : 0, // 浏览模式时列表每5个一页共多少页
	pospage : 1, // 默认第一页浏览模式时当前列表页码
	imgpagelimit : 7, // 图片列表左右翻页按钮每次翻过7张
	imgDomBetween : {}, // 图片列表中间图片
	imgNowPos : 0, // 列表位置
	bind : function(id) {

		var liObj = document.getElementById(id).children;
		var lilen = liObj.length;
		for ( var b = 0; b < lilen; b++) {

			liObj[b].children[0].onclick = function() {

				_event.click(id, this);

			}
			liObj[b].children[0].onmouseover = function() {

				_event.over(id, this);

			}
			liObj[b].children[0].onmouseout = function() {

				_event.out(id, this);

			}

		}

	},
	autoPlay : function() {

		var that = this._image; // this = window
		that.number++;

		var btnObjs = document.getElementById('PPlayer_btn');

		if (!btnObjs) { // 打开详细页面或都列表页面在清除定时器之前定时器还没有被执行时存丰
			clearInterval(_global.interval);
			return;
		}

		btnObjs = btnObjs.children;
		var photoObjs = document.getElementById('PPlayer_photo').children;
		var lilen = btnObjs.length;

		if (that.number >= lilen) {

			that.number = 0;

		}

		that.btnObj.className = '';// 清除前一个按钮样式
		that.photoObj.className = '';

		var btnTmpObj = that.btnObj = btnObjs[that.number].children[0];
		var photoTmpObj = that.photoObj = photoObjs[that.number]; // 只到li节点
		btnTmpObj.className = 'focus';
		photoTmpObj.className = 'block';
	},
	prev : function() {
		var i = Number(_image.imgDom.id);
		if (i - 1 < 0) {

			$.dialog.notice({
				icon : 'warning',
				content : '当前是第一张',
				lock : false,
				time : 2
			});
			return;
		}
		var imgDom = _global.picthumlist.children[i - 1].children[0];
		_opens.showPic(imgDom);

	},
	next : function() {
		var that = this;
		if (Number(_image.imgDom.id) + 1 >= _image.imglength) {

			$
					.dialog({
						icon : 'warning',
						content : '当前是最后一张',
						okVal : '重新浏览',
						cancelVal : '结束浏览',
						ok : function() {
							var first = _global.picthumlist.children[0].children[0];
							_image.pospage = 0;
							_image.imgNowPos = 126; // 126-126
							if (_image.imglength > _image.imgpagelimit)
								_image.imgDomBetween = _global.picthumlist.children[3].children[0];
							_opens.showPic(first);
						},
						cancel : function() {
							_tools.close();
						}
					});
			return;
		}

		var i = Number(_image.imgDom.id);
		var imgDom = _global.picthumlist.children[i + 1].children[0];
		_opens.showPic(imgDom);

	},
	prevs : function() {

		if (this.pospage - 1 < 1 || this.imglength <= this.imgpagelimit)
			return; // 初始可以显示7张, 总数大于7才执行换下5张图片

		this.pospage = this.pospage - 1; // ****

		var nowBetweenIndex = (this.pospage - 1) * this.imgpagelimit + 3; // 
		this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
		this.imgNowPos = (nowBetweenIndex - 3) * 126;

		var left = (this.pospage - 1) * this.imgpagelimit * 126;

		var pos = this.pospage === 1 ? '0px' : '-' + left + 'px';

		_global.picthumlist.style.left = pos;

	},
	nexts : function() {

		if (this.imglength <= this.imgpagelimit)
			return; // 初始可以显示7张, 总数大于7才执行换下5张图片

		this.pospage = (this.pospage + 1 > this.postotal) ? 1
				: this.pospage + 1; // 返回第一页(1+1=2),0+1是第一页

		var nowBetweenIndex = (this.pospage - 1) * this.imgpagelimit + 3; // 
		this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
		this.imgNowPos = (nowBetweenIndex - 3) * 126;

		var left = (this.pospage - 1) * this.imgpagelimit * 126;

		var pos = this.pospage === 1 ? '0px' : '-' + left + 'px';
		_global.picthumlist.style.left = pos;

	},
	goPosition : function() { // 列表定位

		if (this.imglength <= this.imgpagelimit)
			return; // 初始可以显示7张, 总数大于7才执行换下5张图片

		var thisIndex = Number(this.imgDom.id); // 当前图片下标

		this.pospage = Math.ceil((thisIndex + 1) / this.imgpagelimit); // 给当前页码初始化

		var cacheBetweenIndex = Number(this.imgDomBetween.id); // 算每页的中间值图片

		if (thisIndex < cacheBetweenIndex) { // 向前翻页

			// var totalPos = (this.imglength-this.imgpagelimit) * 126;

			if (this.imgNowPos - 126 >= 0) {

				this.imgNowPos = this.imgNowPos - 126;
				_global.picthumlist.style.left = '-' + this.imgNowPos + 'px';

				var nowBetweenIndex = cacheBetweenIndex - 1; // 缓存里中间图片下标
				this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
			}

		} else if (thisIndex > cacheBetweenIndex) { // 向后翻页

			var totalPos = (this.imglength - this.imgpagelimit) * 126;

			if (this.imgNowPos + 126 <= totalPos) {

				this.imgNowPos = this.imgNowPos + 126;
				_global.picthumlist.style.left = '-' + this.imgNowPos + 'px';

				var nowBetweenIndex = cacheBetweenIndex + 1; // 缓存里中间图片下标
				this.imgDomBetween = _global.picthumlist.children[nowBetweenIndex].children[0]; // 下标从0开始要减1
			}

		}

	}

};

if (!_favorate.isFavorate) {
	// 1:档案新闻
	$.post($.appClient.generateUrl({
		ESDefault : 'archive_list'
	}, 'x'), {
		page : 1,
		limit : 6,
		boardId : 1
	}, function(htm) {

		$('#news').html(htm);

	});

	// 2:档案故事
	$.post($.appClient.generateUrl({
		ESDefault : 'archive_list'
	}, 'x'), {
		page : 1,
		limit : 6,
		boardId : 2
	}, function(htm) {

		$('#story').html(htm);

	});

	// 3:大事记
	$.post($.appClient.generateUrl({
		ESDefault : 'archive_list'
	}, 'x'), {
		page : 1,
		limit : 6,
		boardId : 3
	}, function(htm) {

		$('#event').html(htm);

	});

	// 4:档案规范
	$.post($.appClient.generateUrl({
		ESDefault : 'archive_list'
	}, 'x'), {
		page : 1,
		limit : 16,
		boardId : 4
	}, function(htm) {

		$('#standard').html(htm);
	});

	// 获取待办
	$.post($.appClient.generateUrl({
		ESDefault : 'task_list'
	}, 'x'), {
		page : 0,
		limit : 4
	}, function(htm) {
		$('#Tasks').html(htm);
	});
}

// 更多
$('.mores').live('click', function() {

	var boardId = _global.boardId = this.getAttribute('boardid');
	if (boardId == 6) { // 6:我的待办

		_opens.taskHome();

	} else {

		_opens.list();

	}

});

// 单击列表展示内容详细页面
$('.details').live('click', function() {

	var info = this.getAttribute('info');
	if (this.parentNode.parentNode.id == 'Tasks') {
		// publish&65929&65935&no_handle&5,181,22&39
		// $type.'&'.$workId.'&'.$taskId.'&'.$todo.'&'.$extId.'&'.$formId;
		_opens.task(info);

	} else if (_global.boardId == 5) {

		var info = info.split('&');
		var o = {
			boardId : info[0],
			id : info[1]
		}; // id = topicId
		_opens.browsePhoto(o); // 接收参数为某一dom对象(只用到dom.id = topicId)

	} else {

		_opens.detail(info); // info = boardId,topicId

	}

});

// 面包屑导航-回首页
$('#goHome').live('click', function() {

	_opens.home();

});

// 下载
$('.downloads').live('click', function() {

	_tools.download(this.getAttribute('info'), this);

});

// 收藏
$('.favorates').live('click', function() {

	_favorate.addFavorate(this);
	return false;

});

// 关闭浏览模式
$('#closelockscreen').click(function() {

	_tools.close();

});


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
	var apDiv1 = document.getElementById("mainContentContainer");
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
	
	
	
	