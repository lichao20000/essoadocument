var dia1 = "";//add框
var dia2 = "";//edit框
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
				var tblHeight = height - 147;				
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
	$("#estabs").esTabs("open", {title:"报表维护", content:"#ESReport"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	//编辑报表
	$(".editbtn").live("click", function(){
		editreport($(this).attr('id'));
	});
	//全选
	$("#ids").live("click", function(){
		$("#report").find("input[name='id']").prop("checked", this.checked);
	});
	// 生成表格
	$("#report").flexigrid({
		url: $.appClient.generateUrl({ESReport:'reportList'},'x'),
		dataType: 'json',
		minwidth: 20,
		//editable: true,
		colModel : [
		    {display : '数据标识',name :'did',hide:true,width:30,align:'center'},
			{display: '序号', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="ids" name="ids">', name : 'id', width : 40, align: 'center'},
			{display: '编辑', name : 'editbtn', width : 30, align: 'center'},
			{display: '报表标题', name : 'title', width : 320, sortable : true, align: 'left'},
			{display: '输出格式', name : 'reportstyle', width : 60, sortable : true, align: 'left'},
			{display: '报表类型', name : 'reportType', width : 80, sortable : true, align: 'left'},
			{display: '上传者', name : 'uplodaer', width : 100, sortable : true, align: 'left'}
			],
		buttons : [
		           {name: '添加', bclass: 'add',onpress: addreport},
		           {name: '删除', bclass: 'delete', onpress: delreport},
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
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...'
	});
	
	// 搜索框
	setTimeout(function(){
		$("#ESReport").find('div[class="tDiv2"]').append('<div class="find-dialog"><input id="dataQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="dataQueryButton"></span></div>');
		function dataQuery(){
			var keyword = $.trim($('#dataQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#report").flexOptions({url:$.appClient.generateUrl({ESReport:'reportList',keyWord:encodeURI(keyword)}),newp:1}).flexReload();
		};
		$('#dataQueryButton').click(function(e){
			dataQuery();
		});			
		//搜索回车事件
		$(document).keydown(function(event){
			if(event.keyCode == 13 && document.activeElement.id == 'dataQuery') {
				dataQuery();
			}
		});
	},300);
	
	//添加报表模版
	var id=0;
    function addreport(name,grid){
    	$.ajax({
    	    url:$.appClient.generateUrl({ESReport:'insert'},'x'),
    	    success:function(data){
    	    	dia1 =$.dialog({
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
    
    //删除报表模板
    function delreport(name,grid){
    	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 0){
    		$.dialog({
    			okVal:'确定',
			    cancelVal: '取消',
			    content:"删除报表操作不可恢复,确定删除选择的报表吗？",
			    icon:'warning',
			    cancel: true,
			    ok: function(){
			    	var ids = [], idstr = "" ,title = [];
		    		checkboxs.each(function(){
		    			var id = $(this).val();
		    			ids.push(id);
		    			var name = $(this).closest("tr").find("td[colname='title'] div").text();
		    			title.push(name);
		    		}); 
		    		
		    		$.ajax({
		    			url:$.appClient.generateUrl({ESReport:'delete', ids:ids,title:title}, 'x'),
		    			success:function(data){
			    			if(data == 'true'){
			    				$("#report").flexOptions().flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除报表成功!", time:3});
			    			}else if(data == 'false'){
			    				$.dialog.notice({icon:'error', content:"删除报表失败!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'warning', content:data, time:3});
			    			}
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择报表!",time:3});
    	}
    };
    
    //导出报表模板
    function exportreport(name,grid){
    	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 00){
			var ids = [], idstr = "",title=[];
			checkboxs.each(function(){
				var id = $(this).closest("tr").prop("id").substr(3);
				ids.push(id);
				var name = $(this).closest("tr").find("td[colname='title'] div").text();
    			title.push(name);
			}); 
			$.ajax({
				url:$.appClient.generateUrl({ESReport:'export', ids:ids.join(','),title:title.join(',')}, 'x'),
				dataType:'json',
				success:function(data){
					var success = data.success;
					var message = data.message;
					if(success){
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
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择报表!",time:3});
    	}
    };
    
	//编辑报表模版
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
	    		    	button: [
	     		 	            {id:'btnStarts', name: '确定', callback: function(){return false;}}
	     		 			],
	    			    cancelVal: '关闭',
	    			    cancel: true
	    		    });
    	    	},
    		    cache:false
    	});
	};
	
	//改变浏览器尺寸
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
