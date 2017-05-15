/**
 * 流程函数设置
 */
$(document).ready(function(){
	 $("#workFlowFunGrid").flexigrid({url :$.appClient.generateUrl({ESTransferFlow: 'findFunctionList'}, 'x'),
			dataType : 'json',
			method : "POST" ,
			query : '',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			   {display : '<input type="checkbox" id="workFlowFunIdList">',name : 'ids',width : 30,align : 'center'}, 
			   {display : '操作',name : 'operate',width : 30,align : 'center'},
			   {name : 'id',metadata:'id',hide:true}, 
			   {display : '方法名称',name : 'functionName',metadata:'functionName',width : 120,align : 'left'},
			   {display : 'rest服务全类名',name : 'restFullClassName',metadata:'restFullClassName',width : 150,align : 'left'}, 
			   {display : '执行方法',name : 'exeFunction',metadata:'exeFunction',width : 100,align : 'left'},
			   {display : '收集范围',name : 'relationBusiness',metadata:'relationBusiness',width : 100,align : 'left'}, 
			   {display : '收集范围ID',name : 'stageId',metadata:'stageId',width : 80,hide : true,align : 'left'}, 
			   {display : '描述信息',name : 'description',metadata:'description',width : 100,align : 'left'} 
			],
			buttons : [{name : '添加',bclass : 'add',onpress : function(){functionSet.addWFF();} }, 
			           {name : '删除',bclass : 'delete',onpress : function(){functionSet.deleteWFF();} }
			],
			singleSelect:true,
			usepager : true,
			title : '工作流调用方法设置管理',
			useRp : true,
			rp : 20,
			nomsg : "没有数据",
			showTableToggleBtn : false,
			width : '400',
			height : '400',
			pagetext: '第',
			itemtext: '页',
			outof: '页 /共',
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
			procmsg:'正在加载数据，请稍候...'
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
		if($.browser.msie && $.browser.version==='6.0'){
			flex.css({width:"-=3px"});
		}
	};
	
	$('#workFlowFun div[class="tDiv2"]').append('<div class="find-dialog"><input id="funkeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="funkeyWord" value="请输入关键字" /><span onclick="functionSet.getWFFQuery()"></span></div>');
	$('#workFlowFun div[class="tDiv"]').css("border-top","1px solid #ccc");
	sizeChanged();
	
	//编辑
	$("#workFlowFunGrid .editbtn").die().live("click", function(){
		functionSet.editWFF($(this).closest("tr"));
	});
	 
	//回车搜索
	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'funkeyWord') {
			functionSet.getWFFQuery();
		}
	});
});

var functionSet = {
		//添加
		addWFF: function(){
			$.ajax({
		        url : $.appClient.generateUrl({ESTransferFlow : 'add_workFlowFun'},'x'),
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
					    init: function(){
					    	$('#addWorkFlowFun').autovalidate();
					    },
					    ok:function(){    
					    	if(!$('#addWorkFlowFun').validate())return false ;	
					    	if(!functionSet.uniqueFunName($("#functionName"))) return false;
					    	var restFullClassName=$("#addWorkFlowFun input[name='restFullClassName']").val();
					    	var data1 = $("#addWorkFlowFun").serialize();
					    	var stageId = $("#relationBusiness").attr("code");
					    	var Actionurl = $.appClient.generateUrl({ESTransferFlow : 'addWorkFlowFun'}, 'x');				    		
				    		$.post(Actionurl,{data : data1,stageId : stageId}, function(res){
				    			if (res) {
				    				$.dialog.notice({icon : 'success',content : '添加成功',time : 3});
				    				$("#workFlowFunGrid").flexReload();
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '添加失败',time : 3});
				    				return false;
				    			}
				    		});
						 }
			    });
		    },
		    cache:false
		});
	},
	
	//删除
	deleteWFF: function(){
		var checkboxlength = $('#workFlowFunGrid input:checked').length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
			return false;
		}
		$.dialog({
			content : '确定要删除吗？删除后不能恢复！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				var idStr = [];
				$('#workFlowFunGrid input:checked').each(function(i) {
					idStr.push($('#workFlowFunGrid input:checked:eq(' + i+ ')').val());
				});
				var url = $.appClient.generateUrl({ESTransferFlow : 'delWorkFlowFun'}, 'x');
				$.post(url, {data : idStr}, function(res) {
					if(res){
						if(res.indexOf("成功")>-1){
							$.dialog.notice({icon : 'success',content :res,time : 3});
							$("#workFlowFunGrid").flexReload();
						}else{
							var icon=(res.indexOf("失败")==-1)?'warning':'error';
							$.dialog.notice({icon : icon,content :res,time : 3});
							return false;
						}
					}else{
						$.dialog.notice({icon : "error",content :"删除失败！",time : 3});
						return false;
					}
				});
			}
		});
	},
	
	//编辑
	editWFF: function(tr){
		var columns = ['id','functionName','restFullClassName','exeFunction','relationBusiness','stageId','description'];
		var colValues = $("#workFlowFunGrid").flexGetColumnValue(tr,columns);
		$.ajax({
		    url : $.appClient.generateUrl({ESTransferFlow : 'edit_workFlowFun'},'x'),
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
					    ok:true,init: function(){
					    	$('#editWorkFlowFun').autovalidate();
					    },
					    ok:function(){    
					    	if(!$('#editWorkFlowFun').validate())return false ;	
					    	if(!functionSet.uniqueFunName($("#functionName"))) return false;
					    	var restFullClassName=$("#addWorkFlowFun input[name='restFullClassName']").val();
					    	var data1 = $("#editWorkFlowFun").serialize();
					    	var stageId = $("#relationBusiness").attr("code");
					    	var Actionurl = $.appClient.generateUrl({ESTransferFlow : 'addWorkFlowFun'}, 'x');
					    	$.post(Actionurl,{data : data1,stageId : stageId}, function(res){
				    			if (res) {
				    				$.dialog.notice({icon : 'success',content : '编辑成功',time : 3});
				    				$("#workFlowFunGrid").flexReload();
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '编辑失败',time : 3});
				    				return false;
				    			}
				    		});
				    	}
				    });
			    },
			    cache:false
		});
	},
	
	//搜索
	getWFFQuery: function(){
		var keyword=$.trim($('input[name="funkeyWord"]').val());
		if(keyword=='' || keyword=='请输入关键字') {
			keyword = '';
		}
		$("#workFlowFunGrid").flexOptions({query:keyword}).flexReload();
		return false;
	},
	
	//函数名称唯一验证
	uniqueFunName: function(name){
		var flag=true;
		var partName=name.val();
		if(partName!=name.attr("oldName")){			
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESTransferFlow:'uniqueFunName'},'x'),
				data:{name:partName},
				async:false,//同步设置
				success:function(data){
					if(data=="false"){
						name.addClass("invalid-text");
						name.attr('title',"此函数名称已存在");
	    				flag=false;
	    				return false;
	    			}
					name.removeClass("invalid-text");
					name.attr('title',"");
				}
			});
		}
		return flag;
	}
}