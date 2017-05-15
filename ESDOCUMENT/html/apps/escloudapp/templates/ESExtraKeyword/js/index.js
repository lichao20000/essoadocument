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
				
				var rightWidth = width;
				var tblHeight = height - 142;
				
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
	/** 生成grid **/
	$("#extraKeywordGrid").flexigrid({url :$.appClient.generateUrl({ESExtraKeyword: 'getExtraKeywords'}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 30,align : 'center'}, 
	        {display : '<input type="checkbox" id="extraKeywordCheckboxs">',name : 'ids',width : 30,align : 'center'}, 
		    {
				display : 'id',
				name : 'id',
				metadata:'id',
				hide:true,
				sortable : false,
				align : 'left'
		    },{
		    	display : '操作',
		    	name : 'operate',
		    	metadata : 'operate',
		    	width : 30,
		    	sortable : false,
		    	align : 'left'
			},{
				display : '外挂词',
				name : 'keyword',
				metadata : 'keyword',
				width : 300,
				sortable : true,
				align : 'left'
		}],
		buttons : [
                 {name: '添加', bclass: 'add',onpress:function(){addExtraKeyword()}},
 				 {name: '删除', bclass: 'delete',onpress:function(){removeExtraKeyword()}},
 				 {name: 'Excel导入', bclass: 'import',onpress:function(){importExtraKeyword()}},
 				 {name: 'Excel导出', bclass: 'export',onpress:function(){exportExtraKeyword()}}
 		],
		singleSelect:true,
		usepager : true,
		title : '表单授权',
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
	$('#extraKeyword div[class="tDiv2"]').append('<div class="find-dialog"><input id="extraKeywordQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="extraKeywordQueryBut"></span></div>');
	$('#extraKeywordQueryBut').click(function(){
		extraKeywordQueryQuery();
	});
	
	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'extraKeywordQuery') {
			extraKeywordQueryQuery();
		}
	});
	
	function extraKeywordQueryQuery(){
		var qureyKeyword = $('#extraKeywordQuery').val();
		if(qureyKeyword == '' || qureyKeyword=='请输入关键字') {
			qureyKeyword = '';
		}
		$("#extraKeywordGrid").flexOptions({newp:1,query:qureyKeyword}).flexReload();
		return false;
	}
	//全选
	$("#extraKeywordCheckboxs").die().live('click',function(){
		$("#extraKeywordGrid input[name='extraKeywordCk']").attr('checked',$(this).is(':checked'));
		$("#extraKeywordCheckboxs").attr('checked',$(this).is(':checked'));
	});
	
	/** 编辑按钮 **/
	$("#extraKeywordGrid .editbtn").die().live("click", function(){
		var colValues = $("#extraKeywordGrid").flexGetColumnValue($(this).closest("tr"),['id','keyword']);
		var colValuesArray = colValues.split("|");
		var id = colValuesArray[0];
		var oldKeyword = colValuesArray[1];
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESExtraKeyword : 'editExtraKeywordPage'},'x'),
	        data:{'id':id,'keyword':oldKeyword},
		    success:function(data){
			    	$.dialog({
			    		id:'editExtraKeywordDialog',
				    	title:'编辑外挂词',
				    	modal:true, // 蒙层（弹出会影响页面大小）
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding:0,
				    	okVal:'保存',
					    ok:true,
					    cancelVal: '取消',
					    cancel: true,
					    content:data,
					    ok:function(){
					    	var keyword = $("#editExtraKeywordForm input[name='keyword']").val(); 
					    	keyword = $.trim(keyword) ;
					    	if(keyword==""){
					    		$("#editExtraKeywordForm input[name='keyword']").addClass("warnning");
					    		return false;
					    	}
					    	if(keyword.length>512){
					    		$("#editExtraKeywordForm input[name='keyword']").addClass("warnning");
					    		$.dialog.notice({icon : 'error',content : '外挂词的长度不能大于512！',title : '3秒后自动关闭',time : 3});
					    		return false;
					    	}
					    	var dataId = $("#editExtraKeywordForm input[name='id']").val() ;
					    	$.post($.appClient.generateUrl({ESExtraKeyword : 'isHased'}, 'x'),
					    			{keyword : keyword, id:dataId}, function(res){
		        				if (res == 'true') {
		        					$.dialog.notice({icon : 'warning',content : '['+keyword+']已存在，请重新修改！',title : '3秒后自动关闭',time : 3});
		        					return ;
		        				}
		        				$.post($.appClient.generateUrl({ESExtraKeyword : 'updateExtraKeyword'}, 'x'),
		        						{id:dataId, keyword:keyword, oldKeyword:oldKeyword}, function(res){
		        							if (res == 'true') {
		        								$.dialog.notice({icon : 'succeed',content : '修改成功！',title : '3秒后自动关闭',time : 3});
		        								$("#extraKeywordGrid").flexReload();
		        								art.dialog.list['editExtraKeywordDialog'].close();
		        								return;
		        							} else {
		        								$.dialog.notice({icon : 'error',content : '修改失败！',title : '3秒后自动关闭',time : 3});
		        								return;
		        							}
		        				});
					    	});
					    	return false;
					    }
				    });
			    },
			    cache:false
		});
	});  

	function addExtraKeyword(){
		$.ajax({
	        url : $.appClient.generateUrl({ESExtraKeyword : 'addExtraKeywordPage'},'x'),
		    success:function(data){
			    	$.dialog({
			    		id:'addExtraKeywordDialog',
				    	title:'添加外挂词',
				    	modal:true, // 蒙层（弹出会影响页面大小）
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding:0,
				    	okVal:'保存',
					    ok:true,
					    cancelVal: '取消',
					    cancel: true,
					    content:data,
					    ok:function(){
					    	var keyword = $("#addExtraKeywordForm input[name='keyword']").val(); 
					    	keyword = $.trim(keyword) ;
					    	if(keyword==""){
					    		$("#addExtraKeywordForm input[name='keyword']").addClass("warnning");
					    		return false;
					    	}
					    	if(keyword.length>512){
					    		$("#addExtraKeywordForm input[name='keyword']").addClass("warnning");
					    		$.dialog.notice({icon : 'warning',content : '外挂词的长度不能大于512！',title : '3秒后自动关闭',time : 3});
					    		return false;
					    	}
					    	$.post($.appClient.generateUrl({ESExtraKeyword : 'isHased'}, 'x'),
					    			{keyword : keyword, id:'-1'}, function(res){
		        				if (res == 'true') {
		        					$.dialog.notice({icon : 'warning',content : '['+keyword+']已存在，不能重复添加！',title : '3秒后自动关闭',time : 3});
		        					return ;
		        				}
		        				$.post($.appClient.generateUrl({ESExtraKeyword : 'addExtraKeyword'}, 'x'),
		        						{keyword : keyword}, function(res){
		        							if (res == 'true') {
		        								$.dialog.notice({icon : 'succeed',content : '添加成功！',title : '3秒后自动关闭',time : 3});
		        								$("#extraKeywordGrid").flexReload();
		        								art.dialog.list['addExtraKeywordDialog'].close();
		        								return;
		        							} else {
		        								$.dialog.notice({icon : 'error',content : '添加失败！',title : '3秒后自动关闭',time : 3});
		        								return;
		        							}
		        				});
					    	});
					    	return false;
					    }
				    });
			    },
			    cache:false
		});
	}
	
	function removeExtraKeyword(){
		var checkboxs = $('#extraKeywordGrid input:checked') ;
		var checkboxlength = checkboxs.length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'error',content : '请先选择待删除的数据，再进行此操作！',title : '3秒后自动关闭',time : 3});
			return;
		}
		var ids="" ;
		var oldKeywords="" ;
		checkboxs.each(function(i) {
			ids += $(this).val()+"," ;
			oldKeywords += $("#extraKeywordGrid").flexGetColumnValue($(this).closest("tr"),['keyword'])+",";
		});
		ids = ids.substring(0, ids.length-1) ;
		$.dialog({
			content : '您确定要删除选择的外挂词吗？',
			okVal : '确定',
			ok : true,
			cancelVal : '取消',
			cancel : true,
			ok : function() {
				$.post($.appClient.generateUrl({ESExtraKeyword : 'removeExtraKeywords'}, 'x'),
						{ids : ids, oldKeywords:oldKeywords}, function(res){
							if (res == 'true') {
								$.dialog.notice({icon : 'succeed',content : '删除成功！',title : '3秒后自动关闭',time : 3});
								$("#extraKeywordGrid").flexReload();
								return;
							} else {
								$.dialog.notice({icon : 'error',content : '删除失败！',title : '3秒后自动关闭',time : 3});
								return;
							}
				});
			}
		});
		
	}
	
	$.get($.appClient.generateUrl({ESExtraKeyword:'GetImportUrl'},'x'),
			function (ip){
				__serviceIP = ip;
			}
		);
	
	function importExtraKeyword(){
		$.ajax({
	        url : $.appClient.generateUrl({ESExtraKeyword : 'importPage'},'x'),
		    success:function(data){
			    	$.dialog({
			    		id:'importPageDialog',
				    	title:'导入外挂词',
				    	modal:true, // 蒙层（弹出会影响页面大小）
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding:0,
				    	okVal:'确定',
					    ok:true,
					    cancelVal: '取消',
					    cancel: true,
					    content:data,
					    ok:function(){
					    	var keyword = $("#importExtraKeywordForm input[name='importExtraKeywordFile']").val(); 
					    	if(keyword==""){
					    		$.dialog.notice({icon : 'warning',content : '请先选择待导入的外挂词文件，再进行此操作！',title : '3秒后自动关闭',time : 3});
					    		return false;
					    	}
				    		$('#importExtraKeywordForm').ajaxSubmit({
				    			url:__serviceIP,
				    			dataType:"text",
				    			success:function(res){
				    				//0 : 文件名不是excel格式，无法导入 ！
				    				//1 : 成功
				    				//2 : 上传的文件为空文件，请重现选择文件！
				    				//3 : 上传文件内的外挂词全部已经存在，不能重复导入！
				    				//4 : 上传文件内的外挂词部分已存在，没有重复导入！
				    				if(res == "1"){
				    					$.dialog.notice({title:'操作提示',icon:'succeed',content:"导入成功！", time:3});
				    					$('#extraKeywordGrid').flexReload();
				    					art.dialog.list['importPageDialog'].close();
				    				} else if(res == "0"){
				    					//wanghongchen 20141017 修改消息提醒图标
				    					$.dialog.notice({title:'操作提示',icon:'error',content:"文件名不是excel格式，无法导入 ！", time:10});
				    				} else if(res == "2"){
				    					$.dialog.notice({title:'操作提示',icon:'error',content:'上传的文件为空文件，请重现选择文件！', time:10});
				    				} else if(res == "3"){
				    					$.dialog.notice({title:'操作提示',icon:'error',content:'上传文件内的外挂词全部已经存在，不能重复导入！', time:10});
				    					art.dialog.list['importPageDialog'].close();
				    				} else if(res == "4"){
				    					$('#extraKeywordGrid').flexReload();
				    					$.dialog.notice({title:'操作提示',icon:'error',content:'上传文件内的外挂词部分已存在，没有重复导入！', time:10});
				    					art.dialog.list['importPageDialog'].close();
				    				}
				    			}
				    		});
					    	return false;
					    }
				    });
			    },
			    cache:false
		});
	}
	
	function exportExtraKeyword(){
		$.post(
				$.appClient.generateUrl({ESExtraKeyword:'exportData'}),
				function (fileName){
					if(fileName){
						var downFile = $.appClient.generateUrl({ESExtraKeyword:'download',fileName:fileName},'x');
						//wanghongchen 20141017 修改消息提醒图标
						$.dialog.notice({icon:'success',
							content:"<a href='"+downFile+"'>下载导出数据</a>"
						});
					}else{
						$.dialog.notice({content:'导出失败',icon:'error',time:3});
					}
				}
				
			);
	}
	
});