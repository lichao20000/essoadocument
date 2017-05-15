/**
 * APP客户端升级管理
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
	$("#estabs").esTabs("open", {title:"APP客户端升级管理", content:"#ESAppClientUpdate"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	$(".detailsbtn").die().live("click", function(){
		detailUpdate($(this).closest("tr"));
	});
	$(".editbtn").die().live("click", function(){
		download($(this).closest("tr"));
	});
	$(".downloadbtn").die().live("click", function(){
		download($(this).closest("tr"));
	});
	// 生成表格
	$("#update").flexigrid({
		url: $.appClient.generateUrl({ESAppClientUpdate:'getUpdateListInfo'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="checkbox" name="checkbox">', name : 'checkbox', width : 40, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '下载', name : 'downloadbtn', metadata:'downloadbtn', width : 30, align: 'center'},
			//{display: '编辑', name : 'editbtn', metadata:'editbtn', width : 30, align: 'center'},
			{display: 'id', name : 'id', metadata:'id', width : 100, sortable : true, align: 'center'},
			{display: 'APP名称', name : 'appName', metadata:'appName', width : 100, sortable : true, align: 'center'},
			{display: 'APP描述', name : 'appDescription', metadata:'appDescription', width : 200, sortable : true, align: 'center'},
			{display: 'APP包名', name : 'packageName', metadata:'packageName', width : 200, sortable : true, align: 'center'},
			{display: '内部版本号', name : 'versionCode', metadata:'versionCode', width : 100, sortable : true, align: 'center'},
			{display: '版本名称', name : 'versionName', metadata:'versionName', width : 100, sortable : true, align: 'center'},
			{display: '是否强制更新', name : 'forceUpdate', metadata:'forceUpdate', width : 200, sortable : true, align: 'center'},
			{display: '是否自动更新', name : 'autoUpdate', metadata:'autoUpdate', width : 200, sortable : true, align: 'center'},			
			{display: '更新提示信息', name : 'updateTips', metadata:'updateTips', width : 200, sortable : true, align: 'center'},
			{display: '更新时间', name : 'updateTime', metadata:'updateTime', width : 200, sortable : true, align: 'center'},
			{display: 'APKFileId', name : 'apkFileId', metadata:'apkFileId', width : 200, sortable : true, align: 'center'}
			],
			buttons : [
				   {name: '版本升级', bclass: 'add', onpress:update},
				   {name: '删除版本', bclass: 'delete', onpress:onDelete}
			],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: 'APP客户端版本列表',
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
			    content:"删除操作不可恢复,确定删除选择的版本吗？",
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
		    			url:$.appClient.generateUrl({ESAppClientUpdate:'do_delete', ids:param}, 'x'),
		    			success:function(data){
			    			if(data){
			    				$("#update").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除版本成功!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:"删除版本失败!", time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除版本失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择要删除的版本!",time:3});
    	}
	}
	
	// 下载
	function download(tr) {
		var columns = ['apkFileId'];
		var colValues = $("#update").flexGetColumnValue(tr, columns);
		//alert(colValues);
		window.open(colValues);
	}
	
	// 升级
	function update() {
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientUpdate:'add'},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'升级新的版本',
	    	    		width: '500px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    			    cancelVal: '关闭',
	    			    cancel: true,
	    			    okVal: '提交升级版本',
	    			    ok: true,
	    			    ok:function()
				    	{ 
	    			    	return upload("升级");
						},cancel:function()
						{

						}
	    		    });
    	    	},
    		    cache:false
    	});
	}
	
	function validate() {
		var regex = /^[^\|"'<>]*$/;
		var regex1 = /[^\x00-\xff]/g;
    	var apkFileId = $("#uploadForm input[name='apkFileId']").val();
    	
    	if (apkFileId == "") {
    		$.dialog.notice({icon:'warning', content:"APK不可以为空，请先上传APK文件!", time:3});
    		return false;
    	}
    	
    	var appName = $("#uploadForm input[name='appName']").val();
    	
    	if (appName == "") {
    		$.dialog.notice({icon:'warning', content:"APK名称不可以为空，请先填写APK名称!", time:3});
    		return false;
    	}
    	
    	appName = appName.replace(regex1, 'xx')
    	if (appName.length > 100) {
    		$.dialog.notice({icon:'warning', content:"APK名称不可以超过100个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	if(!regex.test(appName)) {
    		$.dialog.notice({icon:'warning', content:"APK名称不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}
    	
    	var appDescription = $("#uploadForm input[name='appDescription']").val();
    	
    	appDescription = appDescription.replace(regex1, 'xx')
    	if (appDescription.length > 200) {
    		$.dialog.notice({icon:'warning', content:"APK描述不可以超过200个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	if(!regex.test(appDescription)) {
    		$.dialog.notice({icon:'warning', content:"APK描述不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}
    	
    	var versionName = $("#uploadForm input[name='versionName']").val();
    	
    	if (versionName == "") {
    		$.dialog.notice({icon:'warning', content:"版本名称不可以为空，请先填写版本名称!", time:3});
    		return false;
    	}
    	
    	versionName = versionName.replace(regex1, 'xx')
    	if (versionName.length > 10) {
    		$.dialog.notice({icon:'warning', content:"版本名称不可以超过10个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	if(!regex.test(versionName)) {
    		$.dialog.notice({icon:'warning', content:"版本名称不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}

    	var updateTips = $("#uploadForm textarea[name='updateTips']").val();
    	updateTips = updateTips.replace(regex1, 'xx')
    	if (updateTips.length > 900) {
    		$.dialog.notice({icon:'warning', content:"更新提示信息不可以超过900个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	return true;
	}

	function upload($msg)
	{
		if (!validate()) {
			return false;
		}
		
    	var url = $.appClient.generateUrl({ESAppClientUpdate:'saveUpdateInfo'},'x');
    	var data = $("#uploadForm").serialize();
		$.post(url,{param: data}, function(res){
			if (res = true) {
				$.dialog.notice({icon:'succeed', content:"新版本添加成功!", time:2});
				$("#update").flexReload();
				return;
			} else {
				$.dialog.notice({icon:'warning', content:"新版本添加失败!", time:2});
				return;
			}
		});

	}
	
	// 查看
	function detailUpdate(tr) {
		var id = tr.prop("id").substr(3);

		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientUpdate:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看升级信息',
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
	
	// 编辑
	function editUpdate(tr) {
		var id = tr.prop("id").substr(3);

		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientUpdate:'edit',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'编辑升级信息',
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
	    		    		return upload("编辑");
	    		    		
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
		var h = $(window).height() - $("#ESAppClientUpdate").position().top;
		var flex = $("#update").closest("div.flexigrid");
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
