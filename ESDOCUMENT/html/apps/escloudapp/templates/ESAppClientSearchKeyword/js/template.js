/**
 * APP客户端检索关键字管理
 * 
 * yanghuiqiang 20140522
 * 
 */

$(document).ready(function(){
	
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 230;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width - leftWidth;
				var tblHeight = height - 105;
				$("#leftDiv").height(height-33);
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};
var type = 'all';

var _nav = { // 导航
		
		bind: function (){ // 给导航A标签绑定事件
			
			var all_ = document.getElementById('type_all').children;
			var that_ = this,ai = all_.length;

			for(var a=0; a<ai; a++)
			{
				
				all_[a].onclick = function (){
				
					that_.bindEvent(this);
					
				};
				
			}
			
		},
		bindEvent: function (that){ // 初始化样式并获取数据
	
			// +++++ 初始化样式 +++++//
			var p_ = that.parentNode;
			if(p_.id==='type_all'){
				type = that.id; // setting

			}
			var pchild = p_.children;
			for(var pl=0; pl<pchild.length; pl++)
			{
				if(pchild[pl].className){
					pchild[pl].className = '';
				}
			}
			that.className = 'selected';
			// ----- 初始化样式 ------//
			this.getData(that);
		},
		getData: function (that){
			
			var url = $.appClient.generateUrl({
				ESAppClientSearchKeyword: 'getSearchKeywordListInfo',
					type: type
					},'x');
	
			$("#searchKeyword").flexOptions({newp: 1, url: url}).flexReload();
			
		}
			
	};

	_nav.bind(); // 绑定导航
	
	$("#estabs").esTabs("open", {title:"APP客户端档案检索关键字信息列表", content:"#ESAppClientSearchKeyword"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	
	// 生成表格
	$("#searchKeyword").flexigrid({
		url: $.appClient.generateUrl({ESAppClientSearchKeyword:'getSearchKeywordListInfo', type:type},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '检索关键字', name : 'keyword', metadata:'keyword', width : 100, sortable : true, align: 'center'},
			{display: '搜索次数', name : 'searchTime', metadata:'searchTime', width : 100, sortable : true, align: 'center'},
			{display: '用户Id', name : 'userId', metadata:'userId', width : 100, sortable : true, align: 'center'},
			],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: 'APP客户端档案检索关键字信息列表',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...',
		onSuccess: function() {
			if (type == 'all') {
				$("#searchKeyword").flexToggleCol(3,true);
			} else {
				$("#searchKeyword").flexToggleCol(3,false);
			}
		}
	});

	/**
	 * 
	 * 改变浏览器尺寸
	 */ 
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#ESAppClientSearchKeyword").position().top;
		var flex = $("#searchKeyword").closest("div.flexigrid");
		var bDiv = flex.find('.bDiv');
	    var contentHeight = bDiv.height();
	    var headflootHeight = flex.height() - contentHeight; 
	    
	    bDiv.height(h - headflootHeight);
		flex.height(h);

		// 修改IE表格宽度兼容
		if($.browser.msie && $.browser.version==='6.0'){
			flex.css({width:"-=3px"});
		}
	};
//	sizeChanged();
});
