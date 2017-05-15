(function(){
	 $("#archiveTypeSetGrid").flexigrid({url :$.appClient.generateUrl({ESStructureModel: 'getArchiveTypeSetList'}, 'x'),
			dataType : 'json',
			method : "POST" ,
			query : '',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			   {display : '',name : 'ids',width : 30,align : 'center'}, 
			   {
					display : '操作',
					name : 'modify',
					width : 30,
					sortable : true,
					align : 'center'
				} , { 
					name : 'id',
					metadata:'id',
					hide:true
				} , { 
					name : 'used',
					metadata:'used',
					hide:true
			   } , {
					display : '唯一标识',
					name : 'SKUNumber',
					metadata : 'SKUNumber',
					width : 150,
					sortable : true,
					align : 'left'
			   } , {
					display : '类型名称',
					name : 'className',
					metadata : 'className',
					width : 200,
					sortable : true,
					align : 'left'
			  } , {
					display : '备注',
					name : 'description',
					metadata : 'description',
					width : 200,
					sortable : true,
					align : 'left',
			  }],
			buttons : [{
					name : '添加',
					bclass : 'add',
					onpress : function(){archiveTypeSet.add();}
			  }, {
					name : '删除',
					bclass : 'delete',
					onpress : function(){archiveTypeSet.drop();}
			  } ],
				singleSelect:true,
				usepager : true,
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
		function sizeChanged(){
			if($.browser.msie && $.browser.version==='6.0'){
				$("html").css({overflow:"hidden"});
			}
			var h = 400;
			var flex = $("#archiveTypeSetGrid").closest("div.flexigrid");
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
		$('#archiveTypeSet div[class="tDiv2"]').append('<div class="find-dialog"><input id="archiveTypeSetKeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="archiveTypeSetKeyWord" value="请输入关键字" /><span id="archiveTypeSetKeyWordButton"></span></div>');
		sizeChanged();
		
		//单选
		$("#archiveTypeSetGrid tbody tr").die().live('click',function(){
			var selectTr = $(this);
			$(".checkbox").each(function(){
				if($(this).attr('checked')=="checked"){
					if($(this).closest("tr")[0]!=selectTr[0]){
						$(this).attr('checked',false);
					}
				}
			});
		});
		
		$("#archiveTypeSetGrid .editbtn").die().live("click", function(){
			archiveTypeSet.edit($(this).closest("tr"));
		});
		$("#archiveTypeSetKeyWordButton").die().live("click", function(){
			archiveTypeSet.query();
		});
		$(document).keydown(function(event){
			if(event.keyCode == 13 && document.activeElement.id == 'archiveTypeSetKeyWord') {
				archiveTypeSet.query();
			}
		});
		var archiveTypeSet = {
				query: function(){
					var keyword = $.trim($('#archiveTypeSetKeyWord').val());
					if(keyword == '' || keyword=='请输入关键字') {
						keyword = '';
					}
					$("#archiveTypeSetGrid").flexOptions({query:keyword}).flexReload();
					return false;
				}, 
				add: function(){
					$.ajax({
					    url:$.appClient.generateUrl({ESStructureModel:'addArchiveType'},'x'),
					    success:function(data){
					    	$.dialog({
					    		id:'addArchiveTypeDialog',
						    	title:'添加档案类型',
					    	   	fixed:false,
					    	    resize: true,
							    content:data,
							    okVal:'确定',
							    cancel:true,
								cancelVal:'取消',
								ok:function(){
									if (!$('#addArchiveType').validate()) {
										return false;
									}
								 	var SKUNumber = $("#addArchiveType input[name='SKUNumber']").val();
								 	var className = $("#addArchiveType input[name='className']").val();
								 	var data = $("#addArchiveType").serialize();
								 	$.post($.appClient.generateUrl({ESStructureModel:'isHased'},'x'),
								 			{id : '-1', SKUNumber:SKUNumber, className:className}, 
								 			function(res){
								 				if (res != '') {
								 					$.dialog.notice({icon : 'warning',content : '['+res+']分类已经存在，不能重复添加！',title : '3秒后自动关闭',time : 3});
								 				} else {
								 					$.post($.appClient.generateUrl({ESStructureModel:'saveArchiveType'},'x'),
								 							{data : data}, 
								 							function(res){
								 								if (res == 'true') {
								 									$.dialog.notice({icon : 'succeed',content : '添加成功！',title : '3秒后自动关闭',time : 3});
								 									$("#archiveTypeSetGrid").flexReload();
								 									art.dialog.list['addArchiveTypeDialog'].close();
								 								} else {
								 									$.dialog.notice({icon : 'error',content : '添加失败！',title : '3秒后自动关闭',time : 3});
								 									art.dialog.list['addArchiveTypeDialog'].close();
								 								}
								 							});
								 				}
								 	});
								 	return false ;
								},
								init: function(){
									$('#addArchiveType').autovalidate();
								}
						    });
						},
						cache:false
					});	
				}, 
				edit: function(tr){
					var columns = ['id','SKUNumber','className','description'];
					var colValues = $("#archiveTypeSetGrid").flexGetColumnValue(tr,columns);
					var used = $("#archiveTypeSetGrid").flexGetColumnValue(tr,['used']);
					$.ajax({
					    url:$.appClient.generateUrl({ESStructureModel:'editArchiveType'},'x'),
					    type:'POST',
					    data:{values:colValues},
					    success:function(data){
					    	$.dialog({
					    		id:'editArchiveTypeDialog',
						    	title:'编辑档案类型',
					    	   	fixed:false,
					    	    resize: true,
							    content:data,
							    okVal:'确定',
							    cancel:true,
								cancelVal:'取消',
								ok:function(){
									if (!$('#addArchiveType').validate()) {
										return false;
									}
								 	var className = $("#addArchiveType input[name='className']").val();
								 	var data = $("#addArchiveType").serialize();
								 	$.post($.appClient.generateUrl({ESStructureModel:'isHased'},'x'),
								 			{id : $("#addArchiveType input[name='id']").val(), SKUNumber:$("#addArchiveType input[name='SKUNumber']").val(), className:className}, 
								 			function(res){
								 				if (res != '') {
								 					$.dialog.notice({icon : 'warning',content : '['+res+']分类已经存在，不能重复！',title : '3秒后自动关闭',time : 3});
								 					return false ;
								 				} else {
								 					$.post($.appClient.generateUrl({ESStructureModel:'saveArchiveType'},'x'),
								 							{data : data}, 
								 							function(res){
								 								if (res == 'true') {
								 									$.dialog.notice({icon : 'succeed',content : '修改成功！',title : '3秒后自动关闭',time : 3});
								 									$("#archiveTypeSetGrid").flexReload();
								 									if(used == 'true')$("#structureModel-table").flexReload();
								 									art.dialog.list['editArchiveTypeDialog'].close();
								 								} else {
								 									$.dialog.notice({icon : 'error',content : '修改失败！',title : '3秒后自动关闭',time : 3});
								 									art.dialog.list['editArchiveTypeDialog'].close();
								 								}
								 							});
								 				}
								 	});
								 	return false ;
								},
								init: function(){
									$('#addArchiveType').autovalidate();
								}
						    });
						},
						cache:false
					});	
				}, 
				drop: function(){
					var checkboxlength = $('#archiveTypeSetGrid input:checked').length;
					if (checkboxlength == 0) {
						$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
						return;
					}
					var id = '';
					$('#archiveTypeSetGrid input:checked').each(
							function(i) {
								id = $('#archiveTypeSetGrid input:checked:eq(' + i+ ')').val();
					});
					var array = id.split('_');
					if(array[1] == 'true'){
						$.dialog.notice({icon : 'warning',content : '当前档案类型已经被引用，不能删除！',time : 3});
						return;
					}
					id = array[0] ;
					$.dialog({
						content : '确定要删除吗？删除后不能恢复！',
						okVal : '确定',
						ok : true,
						cancelVal : '关闭',
						cancel : true,
						ok : function() {
								var url = $.appClient.generateUrl({ESStructureModel : 'dropArchiveType'}, 'x');
								$.post(url, {id : id}, function(res) {
									if(res=='true'){
										$.dialog.notice({icon : 'succeed',content :'删除成功！',time : 3});
										$("#archiveTypeSetGrid").flexReload();
									}else{
										$.dialog.notice({icon : 'warning', content :'删除失败！', time : 3});
									}
								});
						}
					});
				}
		};
})();