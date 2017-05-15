$(document).ready(function(){
	 $("#workFlowFunGrid").flexigrid({url :$.appClient.generateUrl({ESWorkflow: 'findList'}, 'x'),
			dataType : 'json',
			method : "POST" ,
			query : '',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			   {display : '<input type="checkbox" id="workFlowFunIdList">',name : 'ids',width : 30,align : 'center'}, 
			   {
					display : '操作',
					name : 'operate',
					width : 30,
					sortable : true,
					align : 'center'
				},
			   { 
					name : 'id',
					metadata:'id',
					hide:true
			   }, 
			   {
					display : '方法名称',
					name : 'functionName',
					metadata : 'functionName',
					width : 150,
					sortable : true,
					align : 'left'
			   },{
					display : 'rest服务全类名',
					name : 'restFullClassName',
					metadata : 'restFullClassName',
					width : 200,
					sortable : true,
					align : 'left'
			  }, {
					display : '执行方法',
					name : 'exeFunction',
					metadata : 'exeFunction',
					width : 100,
					sortable : true,
					align : 'left'
			  }, {
					display : '关联业务',
					name : 'relationBusiness',
					metadata : 'relationBusiness',
					width : 100,
					sortable : true,
					hide : true,
					align : 'left'
			  }, {
					display : '描述信息',
					name : 'description',
					metadata : 'description',
					width : 100,
					sortable : true,
					align : 'left',
			  } ],
			buttons : [{
					name : '添加',
					bclass : 'add',
					onpress : function(){functionSet.addWFF();}
			  }, {
					name : '删除',
					bclass : 'delete',
					onpress : function(){functionSet.deleteWFF();}
			  } ],
				singleSelect:true,
				usepager : true,
				title : '工作流调用方法设置管理',
				useRp : true,
				rp : 20,
				nomsg : "没有数据",
				showTableToggleBtn : false,
				pagetext : '第',
				outof : '页 /共',
				width : 'auto',
				height : 'auto',
				pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
		});
		//全选
		$("#workFlowFunIdList").die().live('click',function(){
			$("input[name='workFlowFunId']").attr('checked',$(this).is(':checked'));
		});
		function sizeChanged(){
			if($.browser.msie && $.browser.version==='6.0'){
				$("html").css({overflow:"hidden"});
			}
			var h = 400;
			var flex = $("#workFlowFunGrid").closest("div.flexigrid");
			var bDiv = flex.find('.bDiv');
		    var contentHeight = bDiv.height();
		    var headflootHeight = flex.height() - contentHeight; 
		    bDiv.height(h - headflootHeight);
			flex.height(h);
			flex.width(730);
			// 修改IE表格宽度兼容
			if($.browser.msie && $.browser.version==='6.0'){
				flex.css({width:"-=3px"});
			}
		};
		$('#workFlowFun div[class="tDiv2"]').append('<div class="find-dialog"><input id="funkeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="funkeyWord" value="请输入关键字" /><span onclick="functionSet.getWFFQuery()"></span></div>');
		$('#workFlowFun div[class="tDiv"]').css("border-top","1px solid #ccc");
		sizeChanged();
		
		 $("#workFlowFunGrid .editbtn").die().live("click", function(){
			functionSet.editWFF($(this).closest("tr"));
		});
		$(document).keydown(function(event){
			if(event.keyCode == 13 && document.activeElement.id == 'funkeyWord') {
				functionSet.getWFFQuery();
			}
		});
		
});

var functionSet = {
		 addWFF: function(){
			$.ajax({
			        url : $.appClient.generateUrl({
						ESWorkflow : 'add_workFlowFun'},'x'),
				    success:function(data){
					    	$.dialog({
						    	title:'添加工作流调用方法',
					    	   	fixed:false,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
						    	okVal:'保存',
							    ok:true,
							    cancelVal: '关闭',
							    cancel: true,
							    content:data,
							    ok:function()
						    	{    
							    	var restFullClassNameZZ  =  new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
									var exeFunctionZZ =  /^[A-Za-z]+$/;
							    	var functionName = $("#addWorkFlowFun input[name='functionName']").val();
							    	var restFullClassName = $("#addWorkFlowFun input[name='restFullClassName']").val();
							    	var exeFunction = $("#addWorkFlowFun input[name='exeFunction']").val();
							    	var data1 = $("#addWorkFlowFun").serialize();
							    	var Actionurl = $.appClient.generateUrl({ESWorkflow : 'addWorkFlowFun'}, 'x');
							    	if(functionName==''||restFullClassName==''||exeFunction==''){
							    		if(functionName=='')
							    			$("#addWorkFlowFun input[name='functionName']").addClass("warnning");
							    		if(restFullClassName=='')
							    			$("#addWorkFlowFun input[name='restFullClassName']").addClass("warnning");
							    		if(exeFunction=='')
							    			$("#addWorkFlowFun input[name='exeFunction']").addClass("warnning");
							    		return false;
							    	}else if(restFullClassNameZZ.test(restFullClassName )==true){
							    		$("#addWorkFlowFun input[name='restFullClassName']").addClass("warnning");
							    		return false;
							    	}else   if(exeFunctionZZ.test(exeFunction)==false){
							    		$("#addWorkFlowFun input[name='exeFunction']").addClass("warnning");
							    		return false;
							    	}else{
							    		$.post(Actionurl,{data : data1}, function(res){
							    			if (res == 'true') {
							    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
							    				$("#workFlowFunGrid").flexReload();
							    				return;
							    			} else {
							    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
							    				return;
							    			}
							    		});
							    	}
								 }
						    });
					    },
					    cache:false
				});
	},
	deleteWFF: function(){
		var checkboxlength = $('#workFlowFunGrid input:checked').length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
			return;
		}
		$.dialog({
			content : '确定要删除吗？删除后不能恢复！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				var idStr = '';
				$('#workFlowFunGrid input:checked').each(
					function(i) {
						idStr += $('#workFlowFunGrid input:checked:eq(' + i+ ')').val()+ ',';
					});
				    idStr=idStr.substring(0,idStr.length-1);
					var url = $.appClient.generateUrl({ESWorkflow : 'delWorkFlowFun'}, 'x');
					$.post(url, {data : idStr}, function(res) {
						if(res=='true'){
							$.dialog.notice({
								icon : 'succeed',
								content :'删除成功！',
								time : 3
							});
							$("#workFlowFunGrid").flexReload();
							return;
						}else{
							$.dialog.notice({icon : 'warning',
								content :'不允许删除',
								time : 3
							});
							return;
						}
					});
			}
		});
	},
	editWFF: function(tr){
		var columns = ['id','functionName','restFullClassName','exeFunction','relationBusiness','description'];
		var colValues = $("#workFlowFunGrid").flexGetColumnValue(tr,columns);
			$.ajax({
			    url : $.appClient.generateUrl({ESWorkflow : 'edit_workFlowFun'},'x'),
			    type:'POST',
			    data:{data:colValues},
			    success:function(data){
				     $.dialog({
					    	title:'编辑工作流调用方法',
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
					    	{ 
						    	var restFullClassNameZZ  =  new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
								var exeFunctionZZ =  /^[A-Za-z]+$/;
						    	var functionName = $("#editWorkFlowFun input[name='functionName']").val();
						    	var restFullClassName = $("#editWorkFlowFun input[name='restFullClassName']").val();
						    	var exeFunction = $("#editWorkFlowFun input[name='exeFunction']").val();
						    	var data1 = $("#editWorkFlowFun").serialize();
						    	var Actionurl = $.appClient.generateUrl({ESWorkflow : 'addWorkFlowFun'}, 'x');
						    	if(functionName==''||restFullClassName==''||exeFunction==''){
						    		if(functionName=='')
						    			$("#editWorkFlowFun input[name='functionName']").addClass("warnning");
						    		if(restFullClassName=='')
						    			$("#editWorkFlowFun input[name='restFullClassName']").addClass("warnning");
						    		if(exeFunction=='')
						    			$("#editWorkFlowFun input[name='exeFunction']").addClass("warnning");
						    		return false;
						    	}else if(restFullClassNameZZ.test(restFullClassName )==true){
						    		$("#editWorkFlowFun input[name='restFullClassName']").addClass("warnning");
						    		return false;
						    	}else   if(exeFunctionZZ.test(exeFunction)==false){
						    		$("#editWorkFlowFun input[name='exeFunction']").addClass("warnning");
						    		return false;
						    	}else{
							    	$.post(Actionurl,{data : data1}, function(res){
						    			if (res == 'true') {
						    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
						    				$("#workFlowFunGrid").flexReload();
						    				return;
						    			} else {
						    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
						    				return;
						    			}
						    		});
						    	}
					    	}
					    });
				    },
				    cache:false
			});
	},
	getWFFQuery: function(){
		var keyword=$.trim($('input[name="funkeyWord"]').val());
		if(keyword=='' || keyword=='请输入关键字') {
			keyword = '';
		}
		$("#workFlowFunGrid").flexOptions({query:keyword}).flexReload();
		return false;
	}
}