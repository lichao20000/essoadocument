var dia1 = "";//add框
var dia2 = "";//edit框

//根据客户端不同屏幕分辩率做到自适应,并将宽高存在window根对象中
(function (){

	window._resize = function (){
		
		var width = $(document).width()*0.96;				// 可见总宽度
		var height = $(document).height()-176 - 77;	// 可见总高度 - 176为平台头部高度
		
			if(navigator.userAgent.indexOf("MSIE 6.0")>0){
			
			width = width-6;	// 6为兼容IE6
				
			}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
				width = width-4;	// 4为兼容IE8
				height = height-4;
			}
			
			// IE7.0因插件高度未定导致行高和其它浏览器不一致多出4px
			height = navigator.userAgent.indexOf("MSIE 7.0")>0 ? height + 4 : height;
			_size = {width: width, height: height};
	};
	
})();

_resize();

$(document).ready(function(){
	$("#estabs").esTabs("open", {title:"报表维护", content:"#ESReport"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	
	$(".editbtn").live("click", function(){
		editreport($(this).closest("tr").prop("id").substr(3));
	});
	
	$("#ids").live("click", function(){
		$("#report").find("input[name='id']").prop("checked", this.checked);
	});
	// 生成表格
	$("#report").flexigrid({
		url: $.appClient.generateUrl({ESReport:'reportListForSearch'},'x'),
		dataType: 'json',
		minwidth: 20,
		//editable: true,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="ids" name="ids">', name : 'id', width : 40, align: 'center'},
			{display: '编辑', name : 'editbtn', width : 30, align: 'center'},
			{display: '报表标题', name : 'title', width : 320, sortable : true, align: 'left', validate:/^\d+$/i, validateMsg:"必须为数字"},
			{display: '输出格式', name : 'reportstyle', width : 100, sortable : true, align: 'left'},
			//{display: '报表样式', name : 'resourcelevel', width : 80, sortable : true, align: 'left', dropdown:["", "表格","复合报表","测试"]},
			//{display: '每页条数', name : 'perpage', width : 50, sortable : true, align: 'center'},
			//{display: '报表模板文件', name : 'reportmodel', width : 80, sortable : true, align: 'left'},
			{display: '报表类型', name : 'reportType', width : 80, sortable : true, align: 'left'},
			/** guolanrui 20140811 将是否存在列去掉 BUG：726 **/
//			{display: '是否存在', name : 'ishave', width : 80,hide:true, sortable : true, align: 'center'},
			{display: '上传者', name : 'uplodaer', width : 100, sortable : true, align: 'left'}
			],
		buttons : [
		           {name: '添加', bclass: 'add',onpress: addreport},
		           {name: '删除', bclass: 'delete', onpress: delreport},
		         //  {name: '导入', bclass: 'import'},
		           {name: '导出', bclass: 'export',onpress: exportreport}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '报表列表',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		width: _size.width,
		height: _size.height,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...'
	});
	/** 搜索框 start **/
	setTimeout(function(){
		$("#ESReport").find('div[class="tDiv2"]').append('<div class="find-dialog"><input id="dataQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="dataQueryButton"></span></div>');
//		$("#ESReport .tDiv2").append('<div class="find-dialog"><input id="dataQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="dataQueryButton"></span></div>');
		function dataQuery(){
			var keyword = $.trim($('#dataQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			/** guolanrui 20140811 修改模糊检索后，仍然停留在检索前页面的BUG：725 **/
			$("#report").flexOptions({url:$.appClient.generateUrl({ESReport:'reportListForSearch',keyWord:encodeURI(keyword)}),newp:1}).flexReload();
		};

		$('#dataQueryButton').click(function(e){
			dataQuery();
		});
			
		$(document).keydown(function(event){
			if(event.keyCode == 13 && document.activeElement.id == 'dataQuery') {
				dataQuery();
			}
		});
	},300);
	/** 搜索框 end **/
	/**
    *  @author dengguoqi
    * 添加报表模版
    */
	var id=0;
    function addreport(name,grid)
    {
    	$.ajax({
    	    url:$.appClient.generateUrl({ESReport:'insert'},'x'),
    	    success:function(data){
    	    	dia1 =$.dialog({
//    		    	title:'添加面板',
    		    	title:'添加报表模版',
    	    		width: '500px',
    	    	    height: '250px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    		    	init : function() {
    					$('#addReport').autovalidate();
    				},
    		    	button: [
    		 	            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
    		 			],
    		 		cancelVal: '关闭',
    		 		cancel: true
    		    });},
    		    cache:false
    	});
    };
    
    function delreport(name,grid){
    	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 00){
    		$.dialog({
    			okVal:'确定',
			    cancelVal: '取消',
			    content:"删除报表操作不可恢复,确定删除选择的报表吗？",
			    icon:'warning',
			    cancel: true,
			    ok: function(){
			    	var ids = [], idstr = "";
		    		checkboxs.each(function(){
		    			var id = $(this).closest("tr").prop("id").substr(3);
		    			ids.push(id);
		    		}); 
		    		$.ajax({
		    			url:$.appClient.generateUrl({ESReport:'delete', ids:ids.join(',')}, 'x'),
		    			success:function(data){
			    			if(data){
			    				$("#report").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除报表成功!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:"删除报表失败!", time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除报表失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择报表!",time:3});
    	}
    };
    
    function exportreport(name,grid){
    	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 00){
			var ids = [], idstr = "";
			checkboxs.each(function(){
				var id = $(this).closest("tr").prop("id").substr(3);
				ids.push(id);
			}); 
			$.ajax({
				url:$.appClient.generateUrl({ESReport:'export', ids:ids.join(',')}, 'x'),
				dataType:'json',
				success:function(data){
					var success = data.success;
					var message = data.message;
//					alert(data.success);
					if(success){
//						$("#report").flexOptions({newp:1}).flexReload();
						$.dialog.notice({icon:'succeed', content:message, time:3});
					} else {
						$.dialog.notice({icon:'error', content:message, time:3});
					}
				},
				error: function(){
					$.dialog.notice({icon:'error', content:"报表导出失败!", time:3});
				},
				cache:false
			});
		/** guolanrui 20140819 如果以后报表导出需要支持全部导出，只需将else注释掉即可 **/
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择报表!",time:3});
    	}
    };
	/**
	* @author dengguoqi
	* 编辑报表模版
	* @modify ldm
	*/
	function editreport(id){
    	$.ajax({
    	    url:$.appClient.generateUrl({ESReport:'edit',reportId:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    	    		id:'editReportPanel',
	    		    	title:'编辑报表模版',
	    	    		width: '500px',
	    	    		height: '250px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    		    	init : function() {
	    					$('#editReport').autovalidate();
	    				},
	    		    	//okVal:'保存',
	    			   // ok:true,
	    			    //okId:'btnStart',
	    		    	button: [
	    		    	         //guolanrui 20140830 去掉disabled属性BUG：693
	     		 	            {id:'btnStarts', name: '确定', callback: function(){return false;}}
	     		 			],
	    			    cancelVal: '关闭',
	    			    cancel: true
	    		    });
    	    	},
    		    cache:false
    	});
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
		var h = $(window).height() - $("#ESReport").position().top;
		var flex = $("#report").closest("div.flexigrid");
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
