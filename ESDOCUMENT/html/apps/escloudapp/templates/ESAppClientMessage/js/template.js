/**
 * APP客户端消息管理
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
				
				var rightWidth = width;
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
	$("#estabs").esTabs("open", {title:"APP客户端消息管理", content:"#ESAppClientMessage"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	$(".detailsbtn").die().live("click", function(){
		detailMessage($(this).closest("tr"));
	});
	$(".editbtn").die().live("click", function(){
		editMessage($(this).closest("tr"));
	});
	// 生成表格
	$("#message").flexigrid({
		url: $.appClient.generateUrl({ESAppClientMessage:'getMessageListInfo'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="checkbox" name="checkbox">', name : 'checkbox', width : 40, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '编辑', name : 'editbtn', metadata:'editbtn', width : 30, align: 'center'},
			{display: '消息类型', name : 'type', metadata:'type', width : 100, sortable : true, align: 'center'},
			{display: '发送方', name : 'sender', metadata:'sender', width : 100, sortable : true, align: 'center'},
			{display: '接收方', name : 'receiver', metadata:'receiver', width : 100, sortable : true, align: 'center'},
			{display: '发送内容', name : 'content', metadata:'content', width : 400, sortable : true, align: 'left'},
			{display: '处理方式', name : 'messageHanderType', metadata:'messageHanderType', width : 400, sortable : true, align: 'center'},
			{display: '附加内容', name : 'data', metadata:'data', width : 400, sortable : true, align: 'center'},
			{display: '发送时间', name : 'time', metadata:'time', width : 200, sortable : true, align: 'center'},
			],
		buttons : [
			           {name: '发送消息', bclass: 'add', onpress:sendMessage},
			           {name: '删除消息', bclass: 'delete', onpress:onDelete}
				],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: 'APP客户端消息列表',
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
	
	function IsURL(str_url){
        var strRegex = "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$";
        var re=new RegExp(strRegex);
        //re.test()
        if (re.test(str_url)){
            return (true);
        }else{
            return (false);
        }
	}
	
	function validate() {
		var regex1 = /[^\x00-\xff]/g;			

		var content = $("#messagePushForm textarea[name='message']").val();

    	var rcontent = trim(content);
    	
    	if(rcontent==""){
    		$.dialog.notice({icon:'warning', content:"消息内容不能为空!", time:2});
    		return false;
    	}
    	
    	content = content.replace(regex1, 'xx')
    	if (content.length > 1000) {
    		$.dialog.notice({icon:'warning', content:"消息内容不可以超过1000个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	var urlstr = $("#messagePushForm textarea[name='data']").val();
    	var rurlstr = trim(urlstr);
    	
    	var handtype = $("#messageHanderType").val();
    	
    	if (handtype != 2 && rurlstr != null && rurlstr != "" && !IsURL(urlstr)) {
    		$.dialog.notice({icon:'warning', content:"【"+urlstr+"】不是有效的weburl，weburl请以“https|http|ftp|rtsp|mms”开头，形如“http://www.flyingsoft.cn”，请重新填写!", time:3});
    		return false;
    	}
    	
    	return true;
	}
	
	// 发送消息
	function sendMessage() {
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientMessage:'send'},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'发送消息',
	    	    		width: '500px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    		    	okVal: '发送',
	    			    cancelVal: '关闭',
	    			    cancel: true,
	    			    ok: true,
	    			    content:data,
	    			    ok:function()
				    	{ 
	    			    	if (!validate()) {
	    		    			return false;
	    		    		}
	    			    	
					    	var url = $.appClient.generateUrl({ESAppClientMessage : 'sendMessage'}, 'x');;
					    	var data = $("#messagePushForm").serialize();
					    	
					    		$.post(url,{param: data}, function(res){
					    			if (res = true) {
					    				$.dialog.notice({icon : 'succeed',content : '发送成功',title : '3秒后自动关闭',time : 3});
					    				$("#message").flexReload();
					    				return true;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : '发送失败',title : '3秒后自动关闭',time : 3});
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
	
    //全选
	$("#checkbox").die().live('click',function(){
		$("input[name='id']").attr('checked',$(this).is(':checked'));
	});
	
	function onDelete(name,grid) {
	   	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 00){
    		$.dialog({
    			okVal:'确定',
			    cancelVal: '取消',
			    content:"删除操作不可恢复,确定删除选择的消息吗？",
			    icon:'warning',
			    cancel: true,
			    ok: function(){
			    	var ids = [], idstr = "";
		    		checkboxs.each(function(){
		    			var id = $(this).closest("tr").prop("id").substr(3);
		    			ids.push(id);
		    		}); 
		    		var param = "[" + ids + "]";
		    		$.ajax({
		    			url:$.appClient.generateUrl({ESAppClientMessage:'do_delete', ids:param}, 'x'),
		    			success:function(data){
			    			if(data){
			    				$("#message").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除消息成功!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:"删除消息失败!", time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除消息失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择要删除的消息!",time:3});
    	}
	}

	// 修改消息
	function editMessage(tr) {
		var id = tr.prop("id").substr(3);
		var columns = ['type'];
		var colValues = $("#message").flexGetColumnValue(tr, columns);
		if (colValues != '活动公告') {
			$.dialog.notice({icon : 'warning',content : '非活动公告类消息不可编辑，请重新选择。',title : '3秒后自动关闭',time : 3});
			return false;
		}
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientMessage:'edit',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'编辑消息',
	    	    		width: '500px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    			    cancelVal: '关闭',
	    			    okVal: '保存',
	    			    cancel: true,
	    			    ok: true,
	    		    	content:data,
	    		    	ok:function()
				    	{ 
	    		    		if (!validate()) {
	    		    			return false;
	    		    		}
	    		    		var data = $("#messagePushForm").serialize();
	    		        	var url = $.appClient.generateUrl({ESAppClientMessage:'do_edit'},'x');
	    		        	$.post(url, {param : data}, function(res) {
	    		        	if (res = true) {
	    		        		$.dialog.notice({icon : 'succeed',content : '编辑成功',title : '3秒后自动关闭',time : 3});
	    		        		$("#message").flexReload();
	    		        		return true;
	    		        	} else {
	    		        		$.dialog.notice({icon : 'error',content : '编辑失败',title : '3秒后自动关闭',time : 3});
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
	
	// 查看详细的档案订阅内容
	function detailMessage(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientMessage:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看APP客户端消息信息',
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
		var h = $(window).height() - $("#ESAppClientMessage").position().top;
		var flex = $("#message").closest("div.flexigrid");
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
