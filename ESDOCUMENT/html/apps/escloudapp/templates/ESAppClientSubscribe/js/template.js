/**
 * 档案订阅管理
 * 
 * yanghuiqiang 20140521
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
				
				var rightWidth = width ;
				var tblHeight = height - 105;
				
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
	$("#estabs").esTabs("open", {title:"档案订阅管理", content:"#ESAppClientSubscribe"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	$(".detailsbtn").die().live("click", function(){
		detailSubscribe($(this).closest("tr"));
	});
	// 生成表格
	$("#subscribe").flexigrid({
		url: $.appClient.generateUrl({ESAppClientSubscribe:'getSubscribeListInfo'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '用户id', name : 'userid', width : 100, sortable : true, align: 'center'},
			{display: '订阅关键字', name : 'keyword', width : 300, sortable : true, align: 'center'},
			{display: '订阅范围', name : 'scope', width : 300, sortable : true, align: 'center'},
			{display: '订阅时间', name : 'time', width : 300, sortable : true, align: 'center'},
			],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: '档案订阅列表',
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
		procmsg:'正在加载数据，请稍候...'
	});
	
	// 查看详细的档案订阅内容
	function detailSubscribe(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientSubscribe:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看档案订阅',
	    	    		width: '500px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    			    cancelVal: '关闭',
	    			    cancel: true
	    		    });
    	    	},
    		    cache:false
    	});
	}

	/**
	 * 
	 * 改变浏览器尺寸
	 */ 
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#ESAppClientSubscribe").position().top;
		var flex = $("#subscribe").closest("div.flexigrid");
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
	window.onresize = function (){
		sizeChanged();
		
	};
});
