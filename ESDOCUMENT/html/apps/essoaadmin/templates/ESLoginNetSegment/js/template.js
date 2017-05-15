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
	$("#estabs").esTabs("open", {title:"网段登录IP设置", content:"#ESLoginNetSegment"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	
	$(".editbtn").live("click", function(){
		editBtn($(this).closest("tr").prop("id").substr(3));
	});
	
	$("#ids").live("click", function(){
		$("#loginNetSegment").find("input[name='id']").prop("checked", this.checked);
	});
	// 生成表格
	$("#loginNetSegment").flexigrid({
		url: $.appClient.generateUrl({ESLoginNetSegment:'getDataList'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="ids" name="ids">', name : 'id', width : 40, align: 'center'},
			{display: '编辑', name : 'editbtn', width : 30, align: 'center'},
			{display: '网段区段', name : 'netSegment', width : 320, sortable : true, align: 'left', validate:/^\d+$/i, validateMsg:"必须为数字"},
			{display: '网段起始IP', name : 'startIP', width : 100, sortable : true, align: 'left'},
			{display: '网段结束IP', name : 'endIP', width : 100, sortable : true, align: 'left'},
			{display: '登录IP', name : 'loginIP', width : 100, sortable : true, align: 'left'},
			{display: '登录端口', name : 'portNum', width : 80, sortable : true, align: 'left'},
			{display: '添加人', name : 'userid', width : 100, sortable : true, align: 'left'}
			],
		buttons : [
		           {name: '添加', bclass: 'add',onpress: addBtn},
		           {name: '删除', bclass: 'delete', onpress: deleteBtn}
			],
		usepager: true,
		title: '数据列表',
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
		$("#ESLoginNetSegment").find('div[class="tDiv2"]').append('<div class="find-dialog"><input id="dataQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="dataQueryButton"></span></div>');
		function dataQuery(){
			var keyword = $.trim($('#dataQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			/** guolanrui 20140811 修改模糊检索后，仍然停留在检索前页面的BUG：725 **/
			$("#loginNetSegment").flexOptions({url:$.appClient.generateUrl({ESLoginNetSegment:'getDataList',keyWord:encodeURI(keyword)}),newp:1}).flexReload();
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
	
	var id=0;
    function addBtn(name,grid)
    {
    	$.ajax({
    	    url:$.appClient.generateUrl({ESLoginNetSegment:'insert'},'x'),
    	    success:function(data){
    	    	dia1 =$.dialog({
    	    		id:'addPanel',
    		    	title:'添加面板',
    	    		width: '400px',
    	    	    height: '250px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    		    	init : function() {
    					$('#addForm').autovalidate();
    				},
    		    	button: [
    		 	            {id:'saveForAdd', name: '保存', callback: function(){return false;}}
    		 			],
    		 		cancelVal: '关闭',
    		 		cancel: true
    		    });},
    		    cache:false
    	});
    };
    
    function deleteBtn(name,grid){
    	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 00){
    		$.dialog({
    			okVal:'确定',
			    cancelVal: '取消',
			    content:"删除操作不可恢复,确定删除选择的条目吗？",
			    icon:'warning',
			    cancel: true,
			    ok: function(){
			    	var ids = [], idstr = "";
		    		checkboxs.each(function(){
		    			var id = $(this).closest("tr").prop("id").substr(3);
		    			ids.push(id);
		    		}); 
		    		$.ajax({
		    			url:$.appClient.generateUrl({ESLoginNetSegment:'delete', ids:ids.join(',')}, 'x'),
		    			dataType:'json',
		    			success:function(data){
			    			if(data.success == 'true'){
			    				$("#loginNetSegment").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:data.msg, time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:data.msg, time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择条目!",time:3});
    	}
    };
    
    
	function editBtn(id){
    	$.ajax({
    	    url:$.appClient.generateUrl({ESLoginNetSegment:'editForm',id:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    	    		id:'editPanel',
	    		    	title:'编辑面板',
	    		    	width: '400px',
	    	    	    height: '250px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    		    	init : function() {
	    					$('#editForm').autovalidate();
	    				},
	    		    	//okVal:'保存',
	    			   // ok:true,
	    			    //okId:'btnStart',
	    		    	button: [
	     		 	            {id:'saveForEdit', name: '确定', callback: function(){return false;}}
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
		var h = $(window).height() - $("#ESLoginNetSegment").position().top;
		var flex = $("#loginNetSegment").closest("div.flexigrid");
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
