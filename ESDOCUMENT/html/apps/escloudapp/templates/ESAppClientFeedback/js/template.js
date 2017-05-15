/**
 * 用户意见反馈管理
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

		var type;
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
						ESAppClientFeedback: 'getFeedBackList',
							type: type
							},'x');
					
					$("#feedbackGrid").flexOptions({newp: 1, url: url}).flexReload();
					
				}
					
			};
		
	_nav.bind(); // 绑定导航
	
	$("#estabs").esTabs("open", {title:"用户意见反馈管理", content:"#ESAppClientFeedback"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	$(".editbtn").die().live("click", function(){
		replyFeedback($(this).closest("tr"));
	});
	$(".detailsbtn").die().live("click", function(){
		detailFeedback($(this).closest("tr"));
	});
	$(".logbtn").die().live("click", function(){
		downLoadLogFile($(this).closest("tr"));
	});
	// 生成表格
	$("#feedbackGrid").flexigrid({
		url: $.appClient.generateUrl({ESAppClientFeedback:'getFeedBackList',type: type},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '回复', name : 'editbtn', metadata:'editbtn', width : 30, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '日志下载', name : 'logbtn', metadata:'logbtn', width : 50, align: 'center'},
			{display: '用户id', name : 'userid', metadata:'userid', width : 50, sortable : true, align: 'center'},
			{display: '反馈内容', name : 'content', metadata:'content', width : 300, sortable : true, align: 'center'},
			{display: '联系方式', name : 'contact', metadata:'contact', width : 100, sortable : true, align: 'center'},
			{display: '设备信息', name : 'deviceInfos', metadata:'deviceInfos', width : 200, sortable : true, align: 'center'},
			{display: '日志信息', name : 'logFileId', metadata:'logFileId', width : 100, sortable : true, align: 'center'},
			{display: '提交时间', name : 'submitTime', metadata:'submitTime', width : 100, sortable : true, align: 'center'},
			{display: '是否回复', name : 'isreply', metadata:'isreply', width : 100, sortable : true, align: 'center'},
			{display: '回复内容', name : 'replyContent', metadata:'replyContent', width : 300, sortable : true, align: 'center'},
			{display: '回复时间', name : 'replyTime', metadata:'replyTime', width : 100, sortable : true, align: 'center'}
			],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: '用户意见反馈列表',
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
	
	// 查看详细的意见反馈内容
	function detailFeedback(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientFeedback:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看意见反馈',
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
	
	function downLoadLogFile(tr) {
		var columns = ['logFileId'];
		var colValues = $("#feedbackGrid").flexGetColumnValue(tr, columns);
		if (colValues == "") {
			$.dialog.notice({icon:'error',content:'此用户没有上传日志文件！',time:3});
		} else {
			var url = $.appClient.generateUrl({ESAppClientFeedback : 'getAPPLogUrl',data:colValues}, 'x');
			$.ajax({
				 url:url,
				 success:function(data){
		    	    	window.open(data);
		    	    },
		    		cache:false
	    	});
				
		}
	}
	
	// 回复意见反馈
	function replyFeedback(tr){
		var columns = ['isreply'];
		var colValues = $("#feedbackGrid").flexGetColumnValue(tr, columns);
		if (colValues == "是") {
			$.dialog.notice({icon:'error',content:'此条反馈意见已经回复，不可再回复！',time:3});
		} else {
			var id = tr.prop("id").substr(3);
			$.ajax({
				url:$.appClient.generateUrl({ESAppClientFeedback:'reply',data:id},'x'),
				success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'回复意见反馈',
	    	    		width: '500px',
			    	   	fixed:false,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
				    	okVal:'回复',
					    ok:true,
					    cancelVal: '关闭',
					    cancel: true,
	    	    	    padding:0,
	    		    	content:data,
	    		    	ok:function()
				    	{ 
	    		    		var regex1 = /^[^\|"'<>]*$/;
	    		    		var regex2 = /[^\x00-\xff]/g;
	    		    		
	    		    		var content = $("#replyFeedback textarea[name='replyContent']").val();
					    	
	    		        	if(!regex1.test(content)) {
	    		        		$.dialog.notice({icon:'warning', content:"回复内容不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
	    		        		return false;
	    		        	}
	    		        	
					    	var rcontent = trim(content);
					    	
					    	if(rcontent==""){
					    		$("#replyFeedback textarea[name='replyContent']").addClass("warnning");
					    		$.dialog.notice({icon:'warning', content:"回复内容不能为空!", time:2});
					    		return false;
					    	} 
					    	
				    		content = content.replace(regex2, 'xx');
	    		        	if (content.length > 500) {
	    		        		$.dialog.notice({icon:'warning', content:"回复内容不可以超过500个字符，请重新填写!", time:3});
	    		        		return false;
	    		        	}
				    		
				    		var url = $.appClient.generateUrl({ESAppClientFeedback : 'do_reply'}, 'x');;
				    		var data = $("#replyFeedback").serialize();
				    		
					    		$.post(url,{param : data}, function(res){
					    			if (res = true) {
					    				$.dialog.notice({icon : 'succeed',content : '回复成功',title : '3秒后自动关闭',time : 3});
					    				$("#feedbackGrid").flexReload();
					    				return true;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : '回复失败',title : '3秒后自动关闭',time : 3});
					    				return false;
					    			}
					    		});
					    	
						},cancel:function()
						{

						}
	    		    });
    	    	},
    		    cache:false
			});
		}
	};
	/**
	 * 去左空格; 
	 * @author ldm
	 */
	function ltrim(s){
		return s.replace( /^\s*/, ""); 
	} 
	/**
	 * 去右空格; 
	 * @author ldm
	 */
	function rtrim(s){
		return s.replace( /\s*$/, ""); 
	} 
	/**
	 * 去左右空格; 
	 * @author ldm
	 */
	function trim(s){
		return rtrim(ltrim(s)); 
	}
	/**
	 * 
	 * 改变浏览器尺寸
	 */ 
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#ESAppClientFeedback").position().top;
		var flex = $("#feedbackGrid").closest("div.flexigrid");
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
	sizeChanged();
});
