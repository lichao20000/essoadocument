/**
 * APP客户端Loader管理
 * 
 * yanghuiqiang 20140526
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
				var tblHeight = height - 147;
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
						ESAppClientLoader: 'getLoaderListInfo',
							type: type
							},'x');
					
					$("#loader").flexOptions({newp: 1, url: url}).flexReload();
					
				}
					
			};
		
	_nav.bind(); // 绑定导航
	
	$("#estabs").esTabs("open", {title:"APP客户端Loader管理", content:"#ESAppClientLoader"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);

	$(".detailsbtn").die().live("click", function(){
		detailLoader($(this).closest("tr"));
	});
	$(".editbtn").die().live("click", function(){
		editLoader($(this).closest("tr"));
	});
	// 生成表格
	$("#loader").flexigrid({
		url: $.appClient.generateUrl({ESAppClientLoader:'getLoaderListInfo', type: 'all'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="checkbox" name="checkbox">', name : 'checkbox', width : 40, align: 'center'},
			{display: '查看', name : 'detailsbtn', metadata:'detailsbtn', width : 30, align: 'center'},
			{display: '编辑', name : 'editbtn', metadata:'editbtn', width : 30, align: 'center'},
			{display: '状态', name : 'state', metadata:'state', width : 100, sortable : true, align: 'center'},
			{display: '备注', name : 'describtion', metadata:'describtion', width : 200, sortable : true, align: 'center'},
			{display: '添加时间', name : 'time', metadata:'time', width : 200, sortable : true, align: 'center'},
			],
			buttons : [
					   {name: '添加Loader', bclass: 'add', onpress:add},
					   {name: '删除Loader', bclass: 'delete', onpress:onDelete}
				],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: 'APP客户端Loader列表',
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
	
	// 查看详细的Loader信息
	function detailLoader(tr) {
		var id = tr.prop("id").substr(3);
		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientLoader:'detail',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'查看客户端Loader信息',
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
			    content:"删除操作不可恢复,确定删除选择的Loader信息吗？",
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
		    			url:$.appClient.generateUrl({ESAppClientLoader:'do_delete', ids:param}, 'x'),
		    			success:function(data){
			    			if(data){
			    				$("#loader").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除Loader成功!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:"删除Loader失败!", time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除Loader失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择要删除的Loader!",time:3});
    	}
	}
	
	// 添加loader
	function add() {
		$.ajax({
			url:$.appClient.generateUrl({ESAppClientLoader:'add'},'x'),
			success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'添加Loader',
    	    		width: '500px',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'确认添加',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
    	    	    padding:0,
    		    	content:data,
    		    	ok:function()
			    	{ 
    		    		return upload();
					},cancel:function()
					{

					}
    		    });
	    	},
		    cache:false
		});
	}
	
	function validate() {
		var regex1 = /^[^\|"'<>]*$/;
		var regex2 = /[^\x00-\xff]/g;
		
    	var imageid = $("#addLoaderForm input[name='imageFileId']").val();
    	
    	if (imageid == "") {
    		$.dialog.notice({icon:'warning', content:"图片不可以为空，请先上传图片!", time:3});
    		return false;
    	}

    	var describtion = $("#addLoaderForm textarea[name='describtion']").val();
    	
    	if(!regex1.test(describtion)) {
    		$.dialog.notice({icon:'warning', content:"备注不可以包含\n\n 1 单引号: ' \n 2 双引号: \" \n 3 竖 杠: | \n 4 尖角号: < > \n\n，请重新填写!", time:3});
    		return false;
    	}
    	
    	describtion = describtion.replace(regex2, 'xx')
    	if (describtion.length > 500) {
    		$.dialog.notice({icon:'warning', content:"备注不可以超过500个字符，请重新填写!", time:3});
    		return false;
    	}
    	
    	return true;
	}

	function upload()
	{
		if (!validate()) {
			return false;
		}
		var url = $.appClient.generateUrl({ESAppClientLoader:'saveLoaderInfo'},'x');
    	var data = $("#addLoaderForm").serialize();
		$.post(url,{param: data}, function(res){
			if (res = true) {
				$.dialog.notice({icon:'succeed', content:"信息添加成功!", time:2});
				$("#loader").flexReload();
				return true;
			} else {
				$.dialog.notice({icon:'warning', content:"信息添加失败!", time:2});
				return false;
			}
		});

	}
	// 修改Loader的状态
	function editLoader(tr) {
		var id = tr.prop("id").substr(3);

		$.ajax({
    	    url:$.appClient.generateUrl({ESAppClientLoader:'edit',data:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'编辑Logger信息',
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
	    		    		
	    		    		var data = $("#addLoaderForm").serialize();
	    		        	var url = $.appClient.generateUrl({ESAppClientLoader:'do_edit'},'x');
	    		        	$.post(url, {param : data}, function(res) {
	    		        	if (res = true) {
	    		        		$.dialog.notice({icon : 'succeed',content : '编辑成功',title : '3秒后自动关闭',time : 3});
	    		        		$("#loader").flexReload();
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
		var h = $(window).height() - $("#ESAppClientLoader").position().top;
		var flex = $("#loader").closest("div.flexigrid");
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
