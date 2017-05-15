
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
	$("#estabs").esTabs("open", {title:"配置管理", content:"#ESAppClientConfig"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	$(".detailsbtn").die().live("click", function(){
		detailConfig($(this).closest("tr"));
	});
	$(".editbtn").die().live("click", function(){
		editConfig($(this).closest("tr"));
	});
	// 生成表格
	$("#config").flexigrid({
		url: $.appClient.generateUrl({ESAppClientConfig:'getConfigListInfo'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="checkbox" name="checkbox">', name : 'checkbox', width : 40, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '编辑', name : 'editbtn', metadata:'editbtn', width : 30, align: 'center'},
			{display: '属性名', name : 'key', width : 200, sortable : true, align: 'center'},
			{display: '属性值', name : 'value', width : 200, sortable : true, align: 'center'},
			{display: '描述', name : 'describtion', width : 300, sortable : true, align: 'center'}
			],
			buttons : [
					   {name: '添加配置信息', bclass: 'add', onpress:add},
					   {name: '删除配置信息', bclass: 'delete', onpress:onDelete}
				],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: '配置列表',
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
	
	function validate() {
		var regex = /^[^\|"'<>]*$/;
		var regex1 = /[^\x00-\xff]/g;
		
		var key = $("#addConfigForm input[name='key']").val();
		
    	var rkey = trim(key);
    	
    	if(rkey==""){
    		$.dialog.notice({icon:'warning', content:"属性名称不能为空!", time:2});
    		return false;
    	} 
    	
    	if(!regex.test(key)) {
    		$.dialog.notice({icon:'warning', content:"属性名称不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}
    	
    	key = key.replace(regex1, 'xx');
    	if (key.length > 200) {
    		$.dialog.notice({icon:'warning', content:"属性名称不可以超过200个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	var value = $("#addConfigForm input[name='value']").val();
    	
    	if(!regex.test(value)) {
    		$.dialog.notice({icon:'warning', content:"属性值不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}
    	
    	value = value.replace(regex1, 'xx');
    	if (value.length > 500) {
    		$.dialog.notice({icon:'warning', content:"属性值不可以超过500个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	var describtion = $("#addConfigForm textarea[name='describtion']").val();
    	
    	if(!regex.test(describtion)) {
    		$.dialog.notice({icon:'warning', content:"属性描述不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}

    	describtion = describtion.replace(regex1, 'xx');
    	
    	if (describtion.length > 500) {
    		$.dialog.notice({icon:'warning', content:"属性描述不可以超过500个字符，请重新填写!", time:3});
    		return false;
    	}
    	return true;
	}
	
	function add() {
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientConfig:'add'},'x'),
    	    success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'添加配置信息',
    	    		width: '500px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    			    cancelVal: '关闭',
    			    cancel: true,
    			    okVal:'确认添加',
				    ok:true,
    		    	ok:function()
			    	{ 
    		    		if (!validate()) {
    		    			return false;
    		    		}
    		        	var url = $.appClient.generateUrl({ESAppClientConfig : 'setConfigValue'}, 'x');;
    		        	var data = $("#addConfigForm").serialize();
				    	$.post(url,{param: data}, function(res){
				    			if (res = true) {
				    				$.dialog.notice({icon : 'succeed',content : '保存成功',title : '3秒后自动关闭',time : 3});
				    				$("#config").flexReload();
				    				return;
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '保存失败',title : '3秒后自动关闭',time : 3});
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
			    content:"删除操作不可恢复,确定删除选择的配置信息吗？",
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
		    			url:$.appClient.generateUrl({ESAppClientConfig:'do_delete', ids:param}, 'x'),
		    			success:function(data){
			    			if(data){
			    				$("#config").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除配置信息成功!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:"删除配置信息失败!", time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除配置信息失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择要删除的配置信息!",time:3});
    	}
	}
	
	function detailConfig(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientConfig:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看配置信息',
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

	function editConfig(tr) {
		var id = tr.prop("id").substr(3);

		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientConfig:'edit',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'编辑配置信息',
	    	    		width: '500px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    			    cancelVal: '关闭',
	    			    okVal: '保存',
	    		    	content:data,
	    		    	ok:function()
				    	{ 
	    		    		if (!validate()) {
	    		    			return false;
	    		    		}
	    		    		var data = $("#addConfigForm").serialize();
	    		        	var url = $.appClient.generateUrl({ESAppClientConfig:'do_edit'},'x');
	    		        	$.post(url, {param : data}, function(res) {
	    		        		if (res = true) {
	    		        			$.dialog.notice({icon : 'succeed',content : '编辑成功',title : '3秒后自动关闭',time : 3});
	    		        			$("#config").flexReload();
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
		var h = $(window).height() - $("#ESAppClientConfig").position().top;
		var flex = $("#config").closest("div.flexigrid");
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
