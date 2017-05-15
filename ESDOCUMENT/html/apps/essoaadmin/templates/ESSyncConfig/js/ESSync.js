$(document).ready(function() {
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
	$("#syncConfigGrid").flexigrid({
		url : $.appClient.generateUrl({ESSyncConfig:'getList'}, 'x'),
		dataType : 'json',
		colModel : [{
			display : '',
			name : 'startNum',
			width : 30,
			align : 'center'
		}, {
			display : 'id',
			name : 'id',
			metadata : 'id',
			width : 80,
			align : 'center',
			hide : true
		}, {
			display : '<input type="checkbox" id="syncConfigAll">',
			name : 'ids',
			width : 50,
			align : 'center'
		}, {
			display : '操作',
			name : 'operate',
			width : 70,
			sortable : true,
			align : 'center'
		},{
			display : '应用名称',
			name : 'appNameCn',
			metadata : 'appNameCn',
			width : 170,
			align : 'left'
		}, {
			display : '应用ID',
			name : 'applyAppId',
			metadata : 'applyAppId',
			hide:true,
			width : 80,
			align : 'left'
		}, {
			display : '同步类型',
			name : 'syncType',
			metadata : 'syncType',
			width : 150,
			sortable : true,
			align : 'left'
		}, {
			display : '接口名称',
			name : 'restFullClassName',
			metadata : 'restFullClassName',
			width : 230,
			sortable : true,
			align : 'left'
		}, {
			display : '方法名称',
			name : 'functionName',
			metadata : 'functionName',
			width : 150,
			sortable : true,
			align : 'left'
		} ],
		buttons : [ {
			name : '添加',
			bclass : 'add',
			onpress : add
		}, {
			name : '删除',
			bclass : 'delete',
			onpress : deleteById
		} ],
		singleSelect : true,
		usepager : true,
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
	// 全选
	$("#syncConfigAll").die().live('click',	function() {
		$("input[name='syncConfig']").attr('checked', $(this).is(':checked'));
	});
	//添加
	function add(){
		$.ajax({
	        url : $.appClient.generateUrl({ESSyncConfig:'add'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'添加同步配置',
			    	modal:true,  
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    height:200,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    ok:function(){
				    	var form = $("#addConfigForm");
				    	var flag=form.validate();
				    	if(flag){
				    		var formData = form.serialize();
				    		$.ajax({
				    			url : $.appClient.generateUrl({ESSyncConfig:'addOrEdit'},'x'),
				    			type : 'post',
				    			data : {formData : formData},
				    			dataType : 'json',
				    			success : function(rt){
				    				if(rt.success){
				    					$.dialog.notice({content:"添加成功！",icon:'succeed',time:3});
				    					$("#syncConfigGrid").flexReload();
				    				}else{
				    					$.dialog.notice({content:rt.msg,icon:'error',time:3});
				    				}
				    			}
				    		});
				    	}else{
				    		return false;
				    	}
					},
					init:function(){
		    			$("#addConfigForm").autovalidate();
		    		}
			    });
			 },
			 cache:false
		});
	}
	
	/**
	 * 编辑
	 */
	$(".editbtn").die().live("click",function(){
		var trObj = $(this).closest("tr");
		var id = trObj.find("td[colname='id']").text();
		var appnamecn = trObj.find("td[colname='appNameCn']").text();
		var synctype = trObj.find("td[colname='syncType']").text();
		var restfullclassname = trObj.find("td[colname='restFullClassName']").text();
		var functionname = trObj.find("td[colname='functionName']").text();
		var applyappid = trObj.find("td[colname='applyAppId']").text();
		$.ajax({
			url : $.appClient.generateUrl({ESSyncConfig:'edit'},'x'),
			type : 'post',
			data : {
				id:id,
				appnamecn:appnamecn,
				synctype:synctype,
				restfullclassname:restfullclassname,
				functionname:functionname,
				applyappid:applyappid
			},
			success : function(data){
				$.dialog({
			    	title:'编辑同步配置',
			    	modal:true,  
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    height:200,
		    	    lock : true,
					opacity : 0.1,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    content:data,
				    ok:function(){
				    	var form = $("#editConfigForm");
				    	var flag=form.validate();
				    	if(flag){
				    		var formData = form.serialize();
				    		$.ajax({
				    			url : $.appClient.generateUrl({ESSyncConfig:'addOrEdit'},'x'),
				    			type : 'post',
				    			data : {formData : formData},
				    			dataType : 'json',
				    			success : function(rt){
				    				if(rt.success){
				    					$.dialog.notice({content:"修改成功！",icon:'succeed',time:3});
				    					$("#syncConfigGrid").flexReload();
				    				}else{
				    					$.dialog.notice({content:rt.msg,icon:'error',time:3});
				    				}
				    			}
				    		});
				    	}else{
				    		return false;
				    	}
					},
					init:function(){
		    			$("#editConfigForm").autovalidate();
		    		}
			    });
			}
		});
	});
	/**
	 * 删除
	 */
	function deleteById(){
		var cbs = $("input[name='syncConfig']:checked");
		if(cbs.length == 0){
			$.dialog.notice({content:"请选择要删除数据！",icon:'warning',time:3});
		}else{
			$.dialog({
				title:'警告',
				content:'确定删除？',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var ids = "";
					cbs.each(function(){
						ids += $(this).val() + ",";
					});
					ids = ids.substring(0, ids.length-1);
					$.ajax({
						url : $.appClient.generateUrl({ESSyncConfig:'deleteById'},'x'),
						type : 'post',
						data : {ids:ids},
						dataType : 'json',
						success : function(rt){
							if(rt.success){
								$.dialog.notice({content:"删除成功！",icon:'succeed',time:3});
								$("#syncConfigGrid").flexReload();
							}else{
								$.dialog.notice({content:"删除失败！",icon:'error',time:3});
							}
						}
					});
				}
			});
		}
	}
	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'syncKeyWord') {
			syncConfigQuery();
		}
	});

	$("#syncConfigQuery").die().live("click",function(){
		syncConfigQuery();
	});
	
	function syncConfigQuery(){
		var keyword = $.trim($('#syncKeyWord').val());
		if(keyword == '' || keyword=='请输入关键字') {
			keyword = '';
		}
		$("#syncConfigGrid").flexOptions({query:keyword}).flexReload();
	}
});