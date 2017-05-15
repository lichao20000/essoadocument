/**
 * APP客户端异常报告管理
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
						ESAppClientCrashReport: 'getCrashReportListInfo',
							type: type
							},'x');
					
					$("#crashReport").flexOptions({newp: 1, url: url}).flexReload();
					
				}
					
	};
	
	_nav.bind(); // 绑定导航
		
	$("#estabs").esTabs("open", {title:"APP客户端异常报告", content:"#ESAppClientCrashReport"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);

	$(".detailsbtn").die().live("click", function(){
		detailCrashReport($(this).closest("tr"));
	});
	$(".isrolvedbtn").die().live("click", function(){
		$.dialog.notice({icon:'error',content:'此条异常信息已经解决，不可修改其状态！',time:3});
	});
	
	$(".norolvedbtn").die().live("click", function(){
		solvedCrashReport($(this).closest("tr"));
	});
	// 生成表格
	$("#crashReport").flexigrid({
		url: $.appClient.generateUrl({ESAppClientCrashReport:'getCrashReportListInfo', type: 'all'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '解决', name : 'solvedbtn', metadata:'solvedbtn', width : 30, align: 'center'},
			{display: '用户id', name : 'userid', metadata:'userid', width : 100, sortable : true, align: 'center'},
			{display: '异常报告', name : 'crashReport', metadata:'crashReport', width : 200, sortable : true, align: 'center'},
			{display: '版本信息', name : 'versionInfos', metadata:'versionInfos', width : 200, sortable : true, align: 'center'},
			{display: '设备信息', name : 'deviceInfos', metadata:'deviceInfos', width : 200, sortable : true, align: 'center'},
			{display: '报告时间', name : 'time', metadata:'time', width : 150, sortable : true, align: 'center'},
			{display: '是否已处理', name : 'solved', metadata:'solved', width : 100, sortable : true, align: 'center'},
			{display: '处理备注', name : 'solvedDescribtion', metadata:'solvedDescribtion', width : 200, sortable : true, align: 'center'},
			{display: '处理时间', name : 'solvedTime', metadata:'solvedTime', width : 150, sortable : true, align: 'center'},
			],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: 'APP客户端异常报告列表',
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
	
	// 查看详细的异常信息
	function detailCrashReport(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientCrashReport:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看客户端异常信息',
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
	
	// 修改异常信息的状态
	function solvedCrashReport(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
			url:$.appClient.generateUrl({ESAppClientCrashReport:'solve',data:id},'x'),
			success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'异常信息解决',
    	    		width: '500px',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'确认解决',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
    	    	    padding:0,
    		    	content:data,
    		    	ok:function()
			    	{ 
    		    		var regex1 = /[^\x00-\xff]/g;
    		    		var regex2 = /^[^\|"'<>]*$/;
    		    		var content = $("#solveCrashReport textarea[name='solveContent']").val();
    		    		
    		        	if(!regex2.test(content)) {
    		        		$.dialog.notice({icon:'warning', content:"异常解决描述不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		        		return false;
    		        	}

    		    		content = content.replace(regex1, 'xx');
    		        	if (content.length > 200) {
    		        		$.dialog.notice({icon:'warning', content:"异常解决描述不可以超过200个字符，请重新填写!", time:3});
    		        		return false;
    		        	}

				    	var data = $("#solveCrashReport").serialize();
    		    		var url = $.appClient.generateUrl({ESAppClientCrashReport:'do_solve'},'x');
    				    $.post(url, {param : data}, function(res) {
    				    	if (res = true) {
    				    		$.dialog.notice({icon : 'succeed',content : '处理成功',title : '3秒后自动关闭',time : 3});
    				    		$("#crashReport").flexReload();
    				    		return true;
    				    	} else {
    				    		$.dialog.notice({icon : 'error',content : '处理失败',title : '3秒后自动关闭',time : 3});
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
		var h = $(window).height() - $("#ESAppClientCrashReport").position().top;
		var flex = $("#crashReport").closest("div.flexigrid");
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
	//sizeChanged();
});
