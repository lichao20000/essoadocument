/**
 * 档案预约管理
 * 
 * yanghuiqiang 20140523
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
				
				var rightWidth = width;
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
					ESAppClientReserve: 'getReserveListInfo',
						type: type,keyword:""
						},'x');
				
				$("#reserve").flexOptions({newp: 1, url: url}).flexReload();
				
			}
				
		};

	window.onresize = function (){
		sizeChanged();
		
	};
	
	$("#estabs").esTabs("open", {title:"档案预约管理", content:"#ESAppClientReserve"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	
	$(".detailsbtn").die().live("click", function(){
		detailReserve($(this).closest("tr"));
	});
	$(".editbtn").die().live("click", function(){
		editReserve($(this).closest("tr"));
	});
	
    //全选
	$("#reserveIdList").die().live('click',function(){
		$("input[name='id']").attr('checked',$(this).is(':checked'));
	});
	// 生成表格
	$("#reserve").flexigrid({
		url: $.appClient.generateUrl({ESAppClientReserve:'getReserveListInfo',type: type,keyword:""},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="reserveIdList" name="ids">', name : 'ids', width : 40, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			//{display: '处理', name : 'editbtn', metadata:'editbtn', width : 30, align: 'center'},
			 { 
				display : 'ID',
				name : 'id',
				metadata:'id',
				hide:true,
				align : 'center'
			}, 
			{display: '用户id', name : 'userid', width : 100, sortable : true, align: 'center'},
			{display: '真实姓名', name : 'realName', width : 200, sortable : true, align: 'center'},
			{display: 'email', name : 'email', width : 200, sortable : true, align: 'center'},
			{display: '联系电话', name : 'phone', width : 200, sortable : true, align: 'center'},
			{display: '预约内容', name : 'content', width : 300, sortable : true, align: 'center'},
			//{display: '预约时间', name : 'reserveTime', width : 200, sortable : true, align: 'center'},
			//{display: '预约状态', name : 'status', width : 100, sortable : true, align: 'center'},
			{display: '提交时间', name : 'time', width : 200, sortable : true, align: 'center'},
			//{display: '备注', name : 'describtion', width : 200, sortable : true, align: 'center'},
			//{display: '最后处理时间', name : 'auditTime', width : 200, sortable : true, align: 'center'},
			],
			//			buttons : [
			//			           {name: '批量审批', bclass: 'add', onpress:batchReserve}
			//				],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: '档案预约列表',
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
	$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="keyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="keyWordQuery()"></span></div>');
	// 查看详细的预约内容
	function detailReserve(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientReserve:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看预约内容',
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
	
	
	var index = 0;
	
	function reserve(selectedIdArray) {
		if (index == selectedIdArray.length) {
			return;
		}
		var id = selectedIdArray[index++];
		$.ajax({
			url:$.appClient.generateUrl({ESAppClientReserve:'edit',data:id},'x'),
			success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'处理档案预约',
    	    		width: '500px',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'确定处理',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
    	    	    padding:0,
    		    	content:data,
    		    	ok:function()
			    	{ 
				    	var url = $.appClient.generateUrl({ESAppClientReserve : 'do_edit'}, 'x');;
				    	var data = $("#detail").serialize();
				
				    		$.post(url,{param : data}, function(res){
				    			if (res = true) {
				    				$.dialog.notice({icon : 'succeed',content : '处理成功',title : '3秒后自动关闭',time : 3});
				    				$("#reserve").flexReload();
				    				reserve(selectedIdArray);
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '处理失败',title : '3秒后自动关闭',time : 3});
				    				return;
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

	// 批量审批
	function batchReserve() {
		index = 0;
		var selectedId = '';
		var checkboxlength = $('#reserve input:checked').length;
		if(checkboxlength<=0){
			return;
		}
		
		$("#reserve input:checked").each(
				function(i) {
					selectedId += $('#reserve input:checked:eq(' + i+ ')').val()+ ',';
				}
		);
		selectedId = selectedId.substring(0,selectedId.length-1);
		//alert(selectedId);
		var selectedIdArray  = selectedId.split(",");
		//alert(selectedIdArray);
		reserve(selectedIdArray);

	
	}
	
	// 处理预约内容
	function editReserve(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
			url:$.appClient.generateUrl({ESAppClientReserve:'edit',data:id},'x'),
			success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'处理档案预约',
    	    		width: '500px',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'确定处理',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
    	    	    padding:0,
    		    	content:data,
    		    	ok:function()
			    	{ 
				    	var url = $.appClient.generateUrl({ESAppClientReserve : 'do_edit'}, 'x');;
				    	var data = $("#detail").serialize();
				
				    		$.post(url,{param : data}, function(res){
				    			if (res = true) {
				    				$.dialog.notice({icon : 'succeed',content : '处理成功',title : '3秒后自动关闭',time : 3});
				    				$("#reserve").flexReload();
				    				return;
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '处理失败',title : '3秒后自动关闭',time : 3});
				    				return;
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
		var h = $(window).height() - $("#ESAppClientReserve").position().top;
		var flex = $("#reserve").closest("div.flexigrid");
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

});

$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'keyWord') {
		keyWordQuery();
	}
	
	function keyWordQuery(){
		var keyword=$.trim($('input[name="keyWord"]').val());
		if(keyword=='' || keyword=='请输入用户真实姓名') {
			keyword = '';
		}
		var url=$.appClient.generateUrl({ESAppClientReserve:'getReserveListInfo',keyword:keyword},'x');
		$("#reserve").flexOptions({url:url}).flexReload();
		return false;
	}
});
