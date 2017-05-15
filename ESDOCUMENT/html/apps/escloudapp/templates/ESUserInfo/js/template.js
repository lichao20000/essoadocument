var dia1 = "";//add框
var dia2 = "";//edit框
$(document).ready(function(){
	$("#estabs").esTabs("open", {title:"人员管理", content:"#ESUserInfo"});
	$("#estabs").esTabs("onTopToggle", sizeChanged);
	
	$(".editbtn").live("click", function(){
		edituserinfo($(this).closest("tr").prop("id").substr(3));
	});
	
	$("#ids").live("click", function(){
		$("#userInfo").find("input[id='id']").prop("checked", this.checked);
	});
	// 生成表格
	$("#userInfo").flexigrid({
		url: $.appClient.generateUrl({ESUserInfo:'listInfo'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '<input type="checkbox" id="ids" name="ids">', name : 'id', width : 40, align: 'center'},
			{display: '编辑', name : 'editbtn', width : 30, align: 'center'},
			{display: '姓名', name : 'name', width : 100, sortable : true, align: 'left'},
			{display: '年龄', name : 'age', width : 100, sortable : true, align: 'left'},
			{display: 'email', name : 'email', width : 200, sortable : true, align: 'center'},
			{display: '地址', name : 'address', width : 300, sortable : true, align: 'center'},
			{display: '部门', name : 'department', width : 100, sortable : true, align: 'left'}
			],
		buttons : [
		           {name: '添加', bclass: 'add', onpress:adduserinfo},
		           {name: '删除', bclass: 'delete', onpress:deleteuserinfo}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '人员列表',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		width: 'auto',
		height: 'auto',
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...'
	});

	var id=0;
    function adduserinfo(name,grid)
    {
    	$.ajax({
    	    url:$.appClient.generateUrl({ESUserInfo:'insert'},'x'),
    	    success:function(data){
    	    	dia1 =$.dialog({
    		    	title:'添加用户信息',
    	    		width: '500px',
    	    	    height: '250px',
    	    	   	fixed:true,
    	    	    resize: false,
    		    	content:data,
    		    	button: [
    		 	            {id:'btnStart', name: '添加', disabled: false, callback: function(){return false;}}
    		 			],
    		 		cancelVal: '关闭',
    		 		cancel: true
    		    });},
    		    cache:false
    	});
    };
    
    function deleteuserinfo(name,grid){
    	var checkboxs = $(grid).find("input[name='id']:checked");
    	if(checkboxs.length > 00){
    		$.dialog({
    			okVal:'确定',
			    cancelVal: '取消',
			    content:"删除操作不可恢复,确定删除选择的用户信息吗？",
			    icon:'warning',
			    cancel: true,
			    ok: function(){
			    	var ids = [], idstr = "";
		    		checkboxs.each(function(){
		    			var id = $(this).closest("tr").prop("id").substr(3);
		    			ids.push(id);
		    		}); 
		    		$.ajax({
		    			url:$.appClient.generateUrl({ESUserInfo:'do_delete', ids:ids.join(',')}, 'x'),
		    			success:function(data){
			    			if(data){
			    				$("#userInfo").flexOptions({newp:1}).flexReload();
			    				$.dialog.notice({icon:'succeed', content:"删除用户信息成功!", time:3});
			    			} else {
			    				$.dialog.notice({icon:'error', content:"删除用户信息失败!", time:3});
			    			}
		    			},
		    			error: function(){
		    				$.dialog.notice({icon:'error', content:"删除用户信息失败!", time:3});
		    			},
		    			cache:false
		    		});
			    }
    		});
    	} else {
    		$.dialog.notice({icon:'warning',content:"请选择用户信息!",time:3});
    	}
    };

	function edituserinfo(id){
    	$.ajax({
    	    url:$.appClient.generateUrl({ESUserInfo:'edit',id:id},'x'),
    	    success:function(data){
	    	    	dia2 = $.dialog({
	    		    	title:'编辑用户信息',
	    	    		width: '500px',
	    	    	   	fixed:true,
	    	    	    resize: false,
	    	    	    padding:0,
	    		    	content:data,
	    		    	button: [
	     		 	            {id:'btnStart', name: '确定', disabled: false, callback: function(){return false;}}
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
		var h = $(window).height() - $("#ESUserInfo").position().top;
		var flex = $("#userInfo").closest("div.flexigrid");
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
