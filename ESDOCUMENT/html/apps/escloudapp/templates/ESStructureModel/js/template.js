(function (){
	window.size = {};
	
	var width_ = $(document).width()*0.96;		// 可见总宽度
	var height_ = $(document).height()-143;	// 可见总高度 - 176为平台头部高度
	if(navigator.userAgent.indexOf("MSIE 6.0")>0){
		width_ = width_-6;	// 6为兼容IE6
	}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
		width_ = width_-4;	// 4为兼容IE8
		height_ = height_-4;
	}
	var width_treeDiv_ = 230; // 左侧宽度
	var width_tableDiv_ = width_ ; // 右侧宽度
	var height_table_ = height_ - 113;	// 表格高 - 表格插件(flexigrid)内容外高度,25px 是插件按钮高度
	// IE7.0因插件高度未定导致行高和其它浏览器不一致多出4px
	height_table_ = navigator.userAgent.indexOf("MSIE 7.0")>0 ? height_table_ + 4 : height_table_;
	window._size = { tableDiv:[width_tableDiv_, height_], table:[width_tableDiv_, height_table_]};
})();

$(".details").live('click',function(){
	_opens.detail(this);
});
var _table = {
		total: false, // 用于保存接口日志总条数,该参数只在第一次得到
		init: function (){
			
			document.getElementById('table').innerHTML = "<table id='structureModel-table'></table>";
			
			var col_ = url_ = title_ = button_ = type_ = false;
				button_ = [{name: '添加', bclass: 'add', tooltip: '添加', onpress: _opens.addData},
				           {name: '编辑', bclass: 'edit2', tooltip: '编辑', onpress: _opens.editData},
				           {name: '删除', bclass: 'delete', tooltip: '删除', onpress: _opens.deleteData},
				           {name: '档案类型设置', bclass: 'group', tooltip: '档案类型设置', onpress: _opens.archiveTypeSet}
				           //{name: '导出', bclass: 'export', tooltip: '导出', onpress: _opens.exportData},
				           //{name: '导入', bclass: 'import', tooltip:'导入',onpress:_opens.importData}
				           ];
				col_ = [
				        {display: '行号', name:'line', width: 50, align: 'center'},
				        {display: '', name:'cb', width: 20, align: 'center'},
				        {display: '操作', name:'details', width: 50, align: 'center'},
			    		{display: '模板类型', name: 'modelType', width: 200, sortable: true, align: 'left'},
			    		{display: '模版名称', name: 'modelName', width: 200, sortable: true, align: 'left'},
			    		{display: '档案类型', name: 'modelClass', width: 200, sortable: true, align: 'left'},
			    		{display: '模版描述', name: 'modelDes', width: 400, sortable: true, align: 'left'},
			    		{display: 'modelTypeHide', name: 'modelTypeHide', hide: true},
			    		{display: 'modelClassHide', name: 'modelClassHide', hide: true},
			    		{display: 'id', name: 'modelId', hide: true}
			    	];
				url_ = $.appClient.generateUrl({ESStructureModel: 'getModelData'},'x');
			
			$("#structureModel-table").flexigrid({
				url: url_,
				dataType: 'json',
				colModel : col_,
				buttons : button_,
				usepager: true,
				useRp: true,
				showTableToggleBtn:false,
				width: _size.table[0],
				height: _size.table[1],
				rp: 20,
				nomes: '没有数据',
				pagetext: '第',
				outof: '页 /共',
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});
			
		}
	};
var _opens={
		addData:function(){
			$.ajax({
			    url:$.appClient.generateUrl({ESStructureModel:'saveOrUpdateModel'},'x'),
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'addModelPanel',
				    	title:'添加模版',
			    	   	fixed:false,
			    	    resize: true,
					    content:data,
					    okVal:'确定',
					    cancel:true,
						cancelVal:'取消',
						ok:function (){
							// longjunhao 20140902 修复验证的bug193
							if(!$('#modelForm').validate()){return false;}
							if($("#modelName").hasClass("warnning")||$("#modelDes").hasClass("warnning")){
					    		return false;
					        }
							var modelType = $('#modelType').val();
							var modelDes = $('#modelDes').val();
							var modelName = $('#modelName').val();
							var modelClass = $('#modelClass').val();
//							alert(modelType+'    '+modelClass+'    '+modelName+'    '+modelDes);
					 		$.post(
									$.appClient.generateUrl({ESStructureModel:'saveModel'},'x'),
									{modelType:modelType,modelClass:modelClass,modelName:modelName,modelDes:modelDes},
									function(result){
										if(result.success=='true'){
											$.dialog.notice({
												icon : 'succeed',
												content :  '添加成功',
												time :2,
												lock:false
											});
										}else{
											$.dialog.notice({
												icon : 'error',
												content : result.message,
												time : 2,
												lock:false
											});
											
										}
										art.dialog.list['addModelPanel'].close();
										url = $.appClient.generateUrl({ESStructureModel: 'getModelData'},'x');
										$("#structureModel-table").flexOptions({url:url}).flexReload();
								    },
									'json'
							);
							return false;
						},
						init: function(){
							$('#modelForm').autovalidate();
						}
				    });
				    },
				    cache:false
			});	
		},
		editData:function(){
			var checkedObj = $("#structureModel-table input[name='checks']:checked");
			if(checkedObj.length>1){
				$.dialog.notice({
					icon : 'warning',
					content : '只能选择一条数据!',
					time :2,
					lock:false
				});
				return false;
			}else if(checkedObj.length < 1){
				$.dialog.notice({
					icon : 'warning',
					content : '请选择一条要编辑的数据!',
					time :2,
					lock:false
				});
				return false;
			}
			trObj = checkedObj.closest("tr");
			modelClass = trObj.find("td[colname='modelClassHide']").text();
			modelType = trObj.find("td[colname='modelType']").text();
			modelName = trObj.find("td[colname='modelName']").text();
			modelDes = trObj.find("td[colname='modelDes']").text();
			$.ajax({
			    url:$.appClient.generateUrl({ESStructureModel:'saveOrUpdateModel'},'x'),
			    type:'post',
			    data:{id:checkedObj.val(), modelType:modelType, modelName: modelName, modelClass: modelClass, modelDes: modelDes},
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'eidtModelPanel',
				    	title:'编辑模版',
				    	fixed:false,
			    	    resize: true,
			    	    okVal:'确定',
			    		cancelVal:'取消',
			    		cancel:true,
			    		ok:function (){
			    			if($("#modelName").hasClass("warnning")||$("#modelDes").hasClass("warnning")){
					    		return false;
			    			}
			    			// longjunhao 20140902 修复验证的bug193
			    			if(!$('#modelForm').validate()){return false;}
			    			var modelType = $('#modelType').val();
							var modelDes = $('#modelDes').val();
							var modelName = $('#modelName').val();
							var modelClass = $('#modelClass').val();
							var id = $('#modelId').val();//模版id
							if($("#modelName").hasClass("warnning")||$("#modelDes").hasClass("warnning")){
						    		return false;
						    }else{
								$.post(
									$.appClient.generateUrl({ESStructureModel:'saveModel'},'x'),
									{id:id,modelType:modelType,modelName:modelName,modelDes:modelDes,modelClass:modelClass},
									function(result){
										if(result.success=='true'){
											$.dialog.notice({
												icon : 'succeed',
												content : '修改成功!',
												time :2,
												lock:false
											});
											art.dialog.list['eidtModelPanel'].close();
										}else{
											$.dialog.notice({
												icon : 'error',
												content : result.message,
												time : 2,
												lock:false
											});
										}
										url = $.appClient.generateUrl({ESStructureModel: 'getModelData'},'x');
										$("#structureModel-table").flexOptions({url:url}).flexReload();
								    },
								    'json'
									);
						        }
							return false;
			    		},
					    content:data,
						init: function(){
							$('#modelForm').autovalidate();
						}
				    });
				    },
				    cache:false
			});	
		},
		deleteData:function(){
			var checkedObj = $("#structureModel-table input[name='checks']:checked");
			if(checkedObj.length>1){
				$.dialog.notice({
					icon : 'warning',
					content : '只能选择一条数据!',
					time :2,
					lock:false
				});
				return false;
			}else if(checkedObj.length < 1){
				$.dialog.notice({
					icon : 'warning',
					content : '请选择一条要编辑的数据!',
					time :2,
					lock:false
				});
				return false;
			}
			$.dialog({
				title:'警告',
				icon:'warning',
				content:'确认删除该模版？',
				okVal:'确认',
				cancelVal:'取消',
				cancel:true,
				ok:function(){
					$.post(
						$.appClient.generateUrl({ESStructureModel:'deleteModel'},'x'),
						{id:checkedObj.val()},
						function(delResult){
							if(delResult == "true"){
								$.dialog.notice({icon:'succeed',content:'删除成功！',time:3});
								$("#structureModel-table").flexReload();
							}else{
								$.dialog.notice({icon:'error',content:'删除失败！',time:3});
							}
						},
						'json'
					);
				}
			});
		},
		archiveTypeSet:function(){
			$.ajax({
			    url:$.appClient.generateUrl({ESStructureModel:'archiveTypeSet'},'x'),
			    success:function(data){
			    	$.dialog({
			    		id:'archiveTypeSetDialog',
				    	title:'档案类型设置',
			    	   	fixed:false,
			    	    resize: true,
					    content:data,
					    cancel:true,
						cancelVal:'关闭',
						padding:0
				    	});
				    },
				    cache:false
			});	
		},
		exportData:function(){
			var checkedObj = $("#structureModel-table input[name='checks']:checked");
			if(checkedObj.length>1){
				$.dialog.notice({
					icon : 'warning',
					content : '只能选择一条数据!',
					time :2,
					lock:false
				});
				return false;
			}else if(checkedObj.length < 1){
				$.dialog.notice({
					icon : 'warning',
					content : '请选择一条要编辑的数据!',
					time :2,
					lock:false
				});
				return false;
			}
			$.post(
				$.appClient.generateUrl({ESStructureModel:'exportModel'},'x'),
				{id:checkedObj.val()},
				function(exportResult){
					if(exportResult.success == "true"){
						var downloadUrl = $.appClient.generateUrl({ESStructureModel:'download',url:exportResult.msg},'x');
						$.dialog.notice({content:'<a href="'+downloadUrl+'">请点击下载文件</a>',icon:'success'});
					}else{
						$.dialog.notice({icon:'error',content:exportResult.msg,time:3});
					}
				},
				'json'
			);
		},
		importData:function(){
			$.ajax({
				url:$.appClient.generateUrl({ESStructureModel:'structureImport'},'x'),
				success:function(importpage){
					$.dialog({
						title:"导入结构模版",
						content:importpage,
						okVal:"导入",
						cancel:true,
						cancelVal:"取消",
						ok:function(){
							$.ajax({
								async:false,
								url:$.appClient.generateUrl({ESStructureModel:'getImportStructureUrl'},'x'),
								success:function(restUrl){
									$('#structureImportForm').ajaxSubmit({
										url:restUrl,
										dataType:'json',
										success:function(sidata){
											alert(sidata.success);
										}
									});
								}
							});
						}
					});
				}
			});
		},
		detail:function(that){
//			var field = [];
//			field = ['line', 'cb', 'details', 'modelType','modelName','modelDes','modelTypeHide','modelId'];
			
			//var tr = that.parentNode.parentNode.parentNode;// td = tr.children;
			var tr = $(that).closest("tr");
//			var fl = field.length;
//			var id = td[7].firstChild.innerHTML;
			var id = tr.find("td[colname='modelId']").text();
//			var modelType = td[6].firstChild.innerHTML;
			var modelType = tr.find("td[colname='modelTypeHide']").text();
			$.ajax({
			    url:$.appClient.generateUrl({ESStructureModel:'getModelTags',modelId:id,modelType:modelType},'x'),
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'modelTags',
				    	title:'设置著入项',
				    	width:800,
				    	padding:0,
				    	fixed:false,
			    	    resize: true,
					    content:data
				    });
				    },
				    cache:false
			});					
		}
}
function queryMetaTable(){

	//wanghongchen 20140903 修改获取元数据列表方法，bug873
	var keyWord = $('#queryMetaWord').val();
	if(keyWord=='请输入关键字' ){
		$("#metadata_tbl").flexOptions({url:$.appClient.generateUrl({ESStructureModel:'meta_json'},'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#metadata_tbl").flexOptions({url:$.appClient.generateUrl({ESStructureModel:'meta_json'},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
}
window.onload = function (){

	$("#estabs").esTabs("open", {title:"结构模版定义", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "结构模版定义");
	
	var table_ = document.getElementById('table');
	
	table_.style.width = _size.tableDiv[0]+'px';
	table_.style.height = _size.tableDiv[1]+'px';
	
	_table.init();
	//元数据事件
	$('#modelTag-table tr td[colname="METADATA"]').live('dblclick',function (){
		$_tdObj = this;
		metadata_dialog = $.dialog({
			title:'元数据选择',
			content:'<div id="metadata_grid"><table id="metadata_tbl"></table></div>',
			width:600,
			padding:'0',
			//shimiao 20140723 取消元数据设置
			button:[{
				name:'取消元数据',
				callback:function(){
					$($_tdObj).find('div').html("");
					$($_tdObj).attr('class','editing'); // 加上被编辑过红标签
					$($_tdObj).closest('tr').attr('datastate','modify'); // 设置该行为修改状态
				}
			},{
			name:'确定',
			focus: true
				}],
			okVal:'确定',
			cancelVal:'取消',
			ok:metadata_Call_back,
			cancel:true
			
		});
		$("#metadata_tbl").flexigrid({
			//wanghongchen 20140903 修改获取元数据列表方法，bug873
			url: $.appClient.generateUrl({ESStructureModel:'meta_json'}),
			dataType: 'json',
			colModel : [
				{display: '', name : 'radio', width : 40, align: 'center'},
				{display: '名称', name : 'name', width : 80, sortable : true, align: 'center'},
				{display: '唯一标识', name : 'ident', width : 80, sortable : true, align: 'center'},
				{display: '类型', name : 'type', width : 80, sortable : true, align: 'center'},
				{display: '是否参与高级检索', name : 'search', width : 80, sortable : true, align: 'center',hide:true},
				{display: '描述', name : 'desc', width : 200, sortable : true, align: 'center'}
				],
			buttons:[],
			usepager: true,
			useRp: true,
			resizable: false,
			rp:20,
			procmsg:"数据加载中,请稍后...",
			nomsg:"没有数据",
			pagetext: '第',
			outof: '页 /共',
			width: 600,
			height: 270,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
		$('#metadata_grid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;">元数据列表</span>').append('<div class="find-dialog"><input id="queryMetaWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryMetaTable()"></span></div>');
		$('#metadata_grid div[class="tDiv"]').css("border-top","1px solid #ccc");
	});
};
