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
	$("#roleGrid").flexigrid({url :$.appClient.generateUrl({ESRole: 'findRoleList'}, 'x'),
		dataType : 'json',
		colModel : [ 
        {display : '',name : 'startNum',width : 30,align : 'center'}, 
	    {display : '<input type="checkbox" id="roleServerIdList">',name : 'ids',width : 15,align : 'center'}, 
	    {
			display : '操作',
			name : 'operate',
			width : 30,
			sortable : true,
			align : 'center'
		},{
			display : 'ID',
			name : 'roleId',
			metadata:'roleId',
			width : 40,
			align : 'left',
			hide:true
		}, {
			display : '角色标识',
			name : 'roleCode',
			metadata:'roleCode',
			width : 150,
			align : 'left'
		},{
			display : '角色名称',
			name : 'roleName',
			metadata:'roleName',
			width : 200,
			align : 'left'
		},
		 {
			display : '创建时间',
			name : 'createTime',
			metadata:'createTime',
			width : 150,
			align : 'left'
		}, 
		 {
			display : '修改时间',
			name : 'updateTime',
			metadata:'updateTime',
			width : 150,
			sortable : true,
			align : 'left'
		}, {
			display : '是否为系统角色',
			name : 'isSystem',
			metadata:'isSystem',
			width : 110,
			sortable : true,
			align : 'center'
		},{
			display : '角色描述',
			name : 'roleRemark',
			metadata:'roleRemark',
			width : 300,
			align : 'left'
			//process : formatValue
		}],
		buttons : [ {
			name : '添加',
			bclass : 'add',
			onpress : add_role
		}, {
			name : '删除',
			bclass : 'delete',
			onpress : delete_role
		}],
		singleSelect:true,
		usepager : true,
		title : '角色管理',
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#eslist").position().top;
		var flex = $("#roleGrid").closest("div.flexigrid");
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
	$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="keyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onClick="roleQuery()"></span></div>');
	// 全选
	$("#roleServerIdList").die().live('click',function(){
		$("input[name='roleServerId']").attr('checked',$(this).is(':checked'));
	});
	var roleCodeZZ =/^[A-Za-z]+$/;
	// 添加角色
	function add_role(){
		$.ajax({
		        url : $.appClient.generateUrl({ESRole : 'add_role'},'x'),
			    success:function(data){
				    	$.dialog({
					    	title:'添加角色',
					    	modal:true, // 蒙层（弹出会影响页面大小）
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	okVal:'保存',
						    ok:true,
						    cancelVal: '关闭',
						    cancel: true,
						    content:data,
						    ok:function()
					    	{	if(!$('#addRole').validate()){return false;}
						    	var roleData = $("#addRole").serialize(); 
						    	var Actionurl = $.appClient.generateUrl({ESRole : 'addRole'}, 'x');
						    	if($("#addRole input[name='roleCode']").hasClass("warnning")||$("#addRole input[name='roleName']").hasClass("warnning")){
						    		return false;
						    	}else if(judgeSummit($("#addRole"))==false){
						    		return false;
						    	}else{
							    	$.post(Actionurl,{data : roleData}, function(res){
				        				if (res == 'true') {
				        					$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
				        					$("#roleGrid").flexReload();
				        					return;
				        				} else {
				        					$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
				        					$("#roleGrid").flexReload();
				        					return;
				        				}
				        			});
							    }
						    },
							init: function(){
								$('#addRole').autovalidate();
							}
					    });
				    },
				    cache:false
			});
     } 
     // 删除角色
	function delete_role(){
		var checkboxlength = $('#roleGrid input:checked').length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
			return;
		}
		var idStr = '';
		var hasSystemRole = false ;
		$('#roleGrid input:checked').each(function(i) {
			if('1' == $(this).attr('isSystem')){
				hasSystemRole = true ;
			}
			idStr += $(this).val()+ ',';
		});
		if(hasSystemRole){
			$.dialog.notice({icon : 'warning',content : '系统角色不能删除！',time : 3});
			return;
		}
		idStr=idStr.substring(0,idStr.length-1);
		$.dialog({
			content : '确定要删除吗？删除后不能恢复！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
					var url = $.appClient.generateUrl({ESRole : 'deleteRoleList'}, 'x');
					$.post(url, {data : idStr}, function(res) {
						if(res=='true'){
							$.dialog.notice({
								icon : 'succeed',
								content :'删除成功！',
								time : 3
							});
							$("#roleGrid").flexReload();
							return;
						}else{
							$.dialog.notice({icon : 'warning',
								content :'不允许删除',
								time : 3
							});
							$("#roleGrid").flexReload();
							return;
						}
					});
			}
		});
	}
	// 编辑角色
	function edit_role(tr){
		var columns = ['roleId'];
		var colValues = $("#roleGrid").flexGetColumnValue(tr,columns);
		var colValuesArray = colValues.split("|");
		if(colValuesArray[3]=="是"){// 系统角色不允许修改
                   return;
		}
		$.ajax({
			    url : $.appClient.generateUrl({ESRole : 'edit_role'},'x'),
			    type:'post',
			    data:{roleid:colValuesArray[0]},
			    success:function(data){
				     $.dialog({
					    	title:'编辑角色',
				    	   	fixed:false,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	content:data,
						    cancelVal: '关闭',
						    cancel: true,
						    okVal:'保存',
						    ok:true,
						    ok:function()
					    	{   if(!$('#editRole').validate()){return false;}
						    	var Actionurl = $.appClient.generateUrl({ESRole : 'addRole'}, 'x');
						    	var roleData = $("#editRole").serialize();
						    	 var id=$("#editRole input[name='roleId']").val()
						        if($("#editRole input[name='roleCode']").hasClass("warnning")||$("#editRole input[name='roleName']").hasClass("warnning")){
						    		return false;
						    	}else if(judgeSummit($("#editRole"))==false){
						    		return false;
						    	}
						        else{
						    		$.post(Actionurl,{data : roleData}, function(res){
						    			if (res == 'true') {
						    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
						    				$("#roleGrid").flexReload();
						    				return;
						    			} else {
						    				$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
						    				return;
						    			}
						    		});
							    }
							 },
							init: function(){
								$('#editRole').autovalidate();
							}
					    });
				    },
				    cache:false
			});
		}
	$(".editbtn").die().live("click", function(){
		edit_role($(this).closest("tr"));
	});  
});
function roleQuery(){
	var keyword=$.trim($('input[name="keyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var url=$.appClient.generateUrl({ESRole: 'findRoleList',keyWord:keyword},'x');
	$("#roleGrid").flexOptions({url:url}).flexReload();
	return false;
}
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'keyWord') {
		roleQuery();
	}
})
function judgeSummit(obj){
	var flag=true;
	var id=$("input[name='roleId']",obj).val();
	$.ajax({ 
        type : "post", 
        url : $.appClient.generateUrl({ESRole : 'judgeIfExistsRoleName'},'x'), 
        data : {id:id,rolename:encodeURI($("input[name='roleName']",obj).val())}, 
        async : false, 
        success : function(data){ 
        	if(data=='true') {
        		flag=false;
        		$("input[name='roleName']",obj).addClass("warnning");
        		$("input[name='roleName']",obj).attr("title","用户名称为["+$("input[name='roleName']",obj).val()+"]的角色已存在");
        	}else{
        		$("input[name='roleName']",obj).removeClass("warnning");
        		flag=true;
        	}
          } 
        }); 
	if(flag){
		$.ajax({ 
	        type : "post", 
	        url : $.appClient.generateUrl({ESRole : 'judgeIfExistsRoleCode'},'x'), 
	        data : {id:id,rolecode:$("input[name='roleCode']",obj).val()}, 
	        async : false, 
	        success : function(data){ 
	        	if(data=='true') {
	        		flag=false;
	        		$("input[name='roleCode']",obj).addClass("warnning");
	        		$("input[name='roleCode']",obj).attr("title","用户标识为["+$("input[name='roleCode']",obj).val()+"]的角色已存在");
	        	}else{
	        		$("input[name='roleCode']",obj).removeClass("warnning");
	        		flag=true;
	        	}
	          } 
	        }); 
	}
	return flag;
}
	
