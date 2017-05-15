(function (window){
	
	var getId = function ( elementId ){
		
		return document.getElementById( elementId );
		
	};
	
	window._initSize = function (){
		var width = document.documentElement.clientWidth*0.96,height = document.documentElement.clientHeight-143;
		var leftWidth = 230,rightWidth = width-leftWidth,struTreeHeight = 150;
		var leftDiv_ = getId('leftdiv'),rightDiv_ = getId('rightdiv');
		var leftTop_ = getId('lefttop'),leftTopTree_ = getId('treeDemo');
		var f1_ = getId('f1'),f2_ = getId('f2');
			rightDiv_.style.width = rightWidth + 'px'; // 右div宽度
			leftDiv_.style.height = rightDiv_.style.height = height + 'px'; // 左右div高度
			leftTop_.style.height = height - struTreeHeight-10 + 'px';
			leftTopTree_.style.height = height - struTreeHeight - 48 + 'px';
			f1_.style.marginLeft = f2_.style.marginLeft = '50px';
			f1_.style.marginTop = (115 - f1_.children.length*35)/2 + 'px';
			f2_.style.marginTop = (115 - f2_.children.length*35)/2 + 'px';
			window._size = {tbl: {width: rightWidth, height:height-312}, rule: {width: rightWidth, height:height-155}};
	};
	
})(window);

_initSize();
window.onresize = _initSize;
var is_new; // 'new'|'modify'|'new_child'|'modified'

var $_tdObj,$_metadata,metadata_dialog; // 元数据列,元数据,选择元数据窗口
var zTree,stru_zTree;
var ClickEditNodeObj,ClickEditStruObj;

var input_cache;
var $_del_node_more_id='';

var is_allowed = {
	EDIT_NODE:false,
	EDIT_STRU:false,
	EDIT_RULE:false,
	CHOOSE_STRU_NODE:false,
	QUOTE_STRU_NODE:false,
	DEL_NODE:false,
	SAVE_NODE:false,
	RESET_NODE:false,
	ADD_STRU_CHILD_NODE:false,
	DEL_STRU_NODE:false,
	SAVE_STRU_NODE:false,
	RESET_STRU_NODE:false,
	DELETE_STRU_NODE:false,
	init:function (params){
		
		$.extend(this,params);
		$.each(params,function (id,boo){
			
			boo ? $('#'+id).removeClass('not-allowed') : $('#'+id).addClass('not-allowed');

		});
	}
};

//is_allowed.init({EDIT_STRU:true});

// 显示第t个Tags标签内容
function displayTag(t)	// 1
{
	//tag = tag-1;
	$('.Tags').hide();
	$('#Tag'+t).show();
	$('#subnav li').removeClass('defalutTagOpen');
	$('#subnav li:eq('+(t-1)+')').addClass('defalutTagOpen');
}



var needstr = '#NODENAME,#NODEIDENT,#ESTITLE,#ESDESCRIPTION,#ESTYPE,#ESCLASS';
// 获取输入框内容
$(needstr).live('click',function (){
	input_cache = $(this).val();
});

// 节点编辑保存,重置按钮
$('#NODENAME,#NODEIDENT').keyup(function (){
	if($(this).val() != input_cache && ClickEditNodeObj.id){
		is_allowed.init({SAVE_NODE:true,RESET_NODE:true});
	}else{
		is_allowed.init({SAVE_NODE:false,RESET_NODE:false});
	}
});

// 结构编辑保存,重置按钮
$('#ESTITLE,#ESDESCRIPTION').keyup(function (){
	if($(this).val() != input_cache && ClickEditNodeObj.id){
		is_allowed.init({RESET_STRU_NODE:true,SAVE_STRU_NODE:true});
	}else{
		is_allowed.init({RESET_STRU_NODE:false,SAVE_STRU_NODE:false});
	}
});

//结构编辑保存,重置按钮
$('#ESTYPE,#ESCLASS').change(function (){
	
	is_allowed.init({RESET_STRU_NODE:true,SAVE_STRU_NODE:true});
});

// 新建结构,子结构初始化数据方法
function init_new_stru_node()
{
	is_new = 'new'; // 新建结构模式 'new'|'modify'|'new_child'|'modified'
	
	$('#EDIT_STRU_TBL').hide();	// 隐藏表格
	
	$('#ESTITLE').val('');	// 标题
	$('#ESDESCRIPTION').val('');	// 描述
	$('#ESCREATOR').val('');	// 创建人
	$('#ESDATE').val('');	// 时间
	$('#ESTYPE').val('');	// 结构类型
	$('#ESCLASS').val('');	// 档案类型
	
	var DateNowObj = new Date();
	var datenow = DateNowObj.getFullYear()+'-'+(DateNowObj.getMonth()+1)+'-'+DateNowObj.getDate()+' '+DateNowObj.toLocaleTimeString(); 
	$("#ESDATE").val(datenow);
	$('#ESCREATOR').val($_uInfo.uName);
}

//选择结构节点(案卷级)
$('#CHOOSE_STRU_NODE').click(function (){
	if(!is_allowed.CHOOSE_STRU_NODE){
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'chooseModels',TreeNodeID:ClickEditNodeObj.id},'x'),
	    success:function(data){
	    	comdia = $.dialog({
	    		id:'quoteModelPanel',
		    	title:'选择模板',
		    	width:750,
		    	padding:0,
	    	   	fixed:false,
	    	    resize: true,
			    content:data
		    });
		    },
		    cache:false
	});	
});
$('#DELETE_STRU_NODE').click(function(){
	if(!is_allowed.DELETE_STRU_NODE){
		return;
	}
	$.dialog({
		//gengqianfeng 20140920 添加删除模板标题
		title:'取消模板',
		content:'确定取消模板',
		icon:'warning',
		ok:function (){
			$.ajax({
			    url:$.appClient.generateUrl({ESTemplate:'deleteModel',TreeNodeID:ClickEditNodeObj.id},'x'),
			    success:function(data){
			    	if(data){
			    		ClickEditNodeObj.sId  = 0;
			    		$("#leftbottomul li").remove() ;
			    		is_allowed.init({CHOOSE_STRU_NODE:true,QUOTE_STRU_NODE:true,DELETE_STRU_NODE:false}); // init
			    		$.dialog.notice({
							icon : 'succeed',
							content : '取消模板成功！',
							time :2,
							lock:false
						});
			    	}else{
			    		$.dialog.notice({
							icon : 'error',
							content : '取消模板失败！',
							time :2,
							lock:false
						});
			    	}
				   },
				    cache:false
			});
		},
		cancel:true,
		okVal:'确定',
		cancelVal:'取消'
	});
});
//引用结构节点(案卷级)
$('#QUOTE_STRU_NODE').click(function (){
	if(!is_allowed.QUOTE_STRU_NODE){
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'quoteModel',TreeNodeID:ClickEditNodeObj.id},'x'),
	    success:function(data){
	    	comdia = $.dialog({
	    		id:'quoteModel',
		    	title:'引用模板',
		    	padding:0,
		    	width:750,
	    	   	fixed:false,
	    	    resize: true,
			    content:data
		    });
		    },
		    cache:false
	});	
	
});

// 删除树节点(左上树)
$('#DEL_NODE').click(function(){
	
	if(!is_allowed.DEL_NODE) return;	// 没有选择节点或者节点为你父节点时不能删除
//	
//	$.dialog({
//		title:'',
//		content:'确定删除节点',
//		icon:'warning',
//		ok:function (){
			DEL_NODE_CallBack('one');	// 如果不传参数火狐会处理
//		},
//		cancel:true,
//		okVal:'确定',
//		cancelVal:'取消'
//	});
	

});

// 节点删除回调
function DEL_NODE_CallBack(one_more){	// ids传参
	var id;
	if(one_more=='one'){
		id = ClickEditNodeObj.id;
	}else if(one_more=='more'){
		id = $_del_node_more_id;
		$_del_node_more_id ="";
		//liqiubo 20140814 修复刚添加的tr没保存就删除而报删除失败的问题,修复bug 588
		if(!id){
			var cbObj = $('#edit_node_tbl input[name="sinputA"]:checked');
			if(cbObj.length<1){
				return;
			}
			var delFirstVal=0;
			cbObj.each(function (){
				var trObj = $(this).closest('tr').attr('datastate');
				if(trObj=='new'){
					if(delFirstVal==0){
						delFirstVal = $(this).closest('tr').find('td').eq(0).text();
					}
					$(this).closest('tr').remove();
				}
			});
			var cbNewObj = $('#edit_node_tbl tr');
			if(cbNewObj.length>1){
				cbNewObj.each(function (){
					if("new"==$(this).attr("datastate")){
						if($(this).find("td").eq(0).find("div").eq(0).text()>delFirstVal){
							$(this).find("td").eq(0).find("div").eq(0).text(delFirstVal++);
						}
					}
				});
			}
			return;
		}
		//liqiubo 20140814 修复bug588end
	}
	
				$.dialog({
					title:'警告',
					content:"您确定要删除该节点吗?",
					icon:'warning',
					ok:function (){
						$.post(
							$.appClient.generateUrl({ESTemplate:'deleteTreeNode'},'x'),
							{nodes:id},
							function(result){
								if (result == 'no-error') {
									$.dialog.notice({
										icon : 'succeed',
										content : '删除成功',
										time :2,
										lock:false
									});
									$("#NODEIDENT").val('');	// 清空节点名字,标识输入框
									$("#NODENAME").val('');
//									$.each(id, function(i,v){ // 后台删除成功再移除每个对应的树节点
										var nodes = zTree.getNodeByParam("id",id,null);
										zTree.removeNode(nodes);
										$('#leftbottomul').html('');
//									});
									if(one_more=='more'){$('#edit_node_tbl').flexReload();}
									is_allowed.init({DEL_NODE:false});
									refash_tree_node();
									return;
								} else {
									$.dialog.notice({
										icon : 'error',
										content : result,
										time : 2,
										lock:false
									});
									return;
								}
						});
					},
					cancel:true,
					okVal:'确定',
					cancelVal:'取消'
				});
//			}
//		},'json'
//	);
}


//节点修改保存
$('#SAVE_NODE').click(function (){
	
	if(!is_allowed.SAVE_NODE) return;
	
	var estitle = $('#NODENAME').val();
	var esidentifier = $('#NODEIDENT').val();
	
	$.post(
		$.appClient.generateUrl({ESTemplate:'treeedit', id:ClickEditNodeObj.id, pId:ClickEditNodeObj.pId, sId:ClickEditNodeObj.sId}, 'x'),
		{estitle:estitle,esidentifier:esidentifier},
		function(result) { // 返回值为节点数据
			if (result) {
				$.dialog.notice({
					icon : 'succeed',
					content : '保存成功',
					time :2,
					lock:false
				});
				
				// 更新节点
				ClickEditNodeObj.name = estitle;
				ClickEditNodeObj.identifier = esidentifier;
				zTree.updateNode(ClickEditNodeObj);
				
				
				is_allowed.init({SAVE_NODE:false,RESET_NODE:false}); // init
				return;
				
			} else {
				$.dialog.notice({
					icon:'error',
					content:'保存失败',
					time:2,
					lock:false
				});
				return;
			}
		},
		'json'
	);
	
});


// 节点重置
$('#RESET_NODE').click(function (){
	
	if(!is_allowed.RESET_NODE) return;
	
	$("#NODEIDENT").val(ClickEditNodeObj.identifier);	// 清空节点名字,标识输入框
	$("#NODENAME").val(ClickEditNodeObj.name);
	
	is_allowed.init({SAVE_NODE:false,RESET_NODE:false}); // init
});


// 树节点编辑事件
$('#EDIT_NODE').click(function (){
	
	if(!is_allowed.EDIT_NODE) return;
	
	displayTag(1);
	//load_edit_rule_tbl();
});

// 树节点表格
function load_edit_node_tbl(){
	
	$('#EDIT_NODE_TBL').html('<table id="edit_node_tbl"></table>');
	
	$("#edit_node_tbl").flexigrid({
		url : $.appClient.generateUrl({ESTemplate : 'project_json',id:ClickEditNodeObj.id}, 'x'),
		dataType : 'json',
		editable : true,
		colModel : [
		        {display:'序号', name: 'linenumber', editable:true, validate:/^\d+$/i, validateMsg:"必须为数字", width :24, align : 'center' },
				{display:'<input type="checkbox" id="sinputA">', name:'cbox', width:24, align:'center'},
				{display:'节点名称', name:'treenodename', editable:true, width:300, align:'center'},
				{display:'节点标识', name:'identifier', editable:true, width:300, align:'center'},
				{display:'创建者', name:'creator', hide:true, width:300, align:'center'}
		],
		buttons : [
			{name : '添加', bclass : 'add', onpress : ajax_add },
			{name : '删除', bclass : 'delete', onpress : deleteNode },
			{name : '保存', bclass : 'save', onpress : addTreeNode }
		],
		title : '子节点',
		resizable : false,
		//wanghongchen 20140822 使用分页
		usepager: true,
		useRp: true,
		width : _size.tbl.width+2,
		height : _size.tbl.height
	});
}

// 节点批量添加行
function ajax_add()
{
	
	var linenumber = $("#edit_node_tbl tr").length;
	// value值为该条数据ID,id值为该条数据的idStructure
	$('#edit_node_tbl').flexExtendData([{
		"id" : '',
		"cell" : {
			'linenumber':++linenumber,
			'cbox':'<input type="checkbox" id="0" name="sinputA" value="0" />',
			"treenodename":null,
			"identifier": ''
		}
	}]);
	
	
	
}

// 删除节点(和DEL_NODE事件用同一个方法)
function deleteNode()
{
	var cbObj = $('#edit_node_tbl input[name="sinputA"]:checked');
	if(cbObj.length<1){
		$.dialog.notice({
			title:'',
			content:'请选择要删除节点',
			icon:'warning',
			time:2
		});
		return;
//	}else if(cbObj.length>1){
//		$.dialog.notice({
//			title:'',
//			content:'只能选择一个节点',
//			icon:'warning',
//			time:2
//		});
//		return;
	}
	
	var prompt = null;
	cbObj.each(function (){
		
		var trObj = $(this).closest('tr').attr('datastate');
		if(trObj=='new' || trObj=='modify'){
			prompt = '删除数据中有新建数据或修改数据,确定删除节点'; return;
		}else{
			prompt = '确定删除节点';
			$_del_node_more_id = ($_del_node_more_id==''?'':($_del_node_more_id + ','))  + $(this).val();
		};
		
	});
	DEL_NODE_CallBack('more'); // 和删除一个节点共用一个方法
	
//	$.dialog({
//		content:prompt,
//		icon:'warning',
//		ok:function (){
		
//		},
//		cancel:true,
//		okVal:'确定',
//		cancelVal:'取消'
//	});
}



//添加子节点数据
function addTreeNode()
{
	var saveTrObj = $('#edit_node_tbl tr:[datastate="new"],#edit_node_tbl tr:[datastate="modify"]');
	if(!saveTrObj.length){
		$.dialog.notice({
			title:'',
			content:'请添加新数据或更新数据!',
			icon:'warning',
			time:2
		});
		return;
	}
	
	var data_list = [];
	var saveTrEdit = $('#edit_node_tbl tr:[datastate="modify"]');
	if(saveTrEdit.length<1){
	saveTrObj.each(function (){
		var data = [];
		data.push(parseInt($(this).find('td[colname="cbox"] input').val())); // id
		data.push(parseInt($(this).find('td[colname="cbox"] input').attr('id'))); // idStructure
		data.push(parseInt($(this).find('td[colname="linenumber"]').text()));	// esorder
		
		data.push($(this).find('td[colname="treenodename"]').text()); // estitle
		data.push($(this).find('td[colname="identifier"]').text());	// esidentifier
		data.push($(this).find('td[colname="creator"]').text());	// esidentifier
		
		// id idStructure esorder estitle esidentifier
		data_list.push(data.join('|'));
		});
	}
	if(saveTrEdit.length){
		var saveTrAdd = $('#edit_node_tbl tr:[datastate="new"]');
		saveTrEdit.each(function (){
			var data = [];
			data.push(parseInt($(this).find('td[colname="cbox"] input').val())); // id
			data.push(parseInt($(this).find('td[colname="cbox"] input').attr('id'))); // idStructure
			data.push(parseInt($(this).find('td[colname="linenumber"]').text()));	// esorder
			
			data.push($(this).find('td[colname="treenodename"]').text()); // estitle
			data.push($(this).find('td[colname="identifier"]').text());	// esidentifier
			data.push($(this).find('td[colname="creator"]').text());	// esidentifier
			
			// id idStructure esorder estitle esidentifier
			data_list.push(data.join('|'));
		});
	$.post(
			$.appClient.generateUrl({ESTemplate:'addtreenode'}, 'x'),
			{data_list:data_list.join('@@'),nodeId:ClickEditNodeObj.id,nodeIdSEQ:ClickEditNodeObj.idSEQ},
			function (zTree_json){ // {'data':{{},{}...},'success':true}
				if(zTree_json.success){
//					zTree.removeChildNodes(ClickEditNodeObj);
//					zTree.addNodes(ClickEditNodeObj,zTree_json.data,true);
//					zTree.expandNode(ClickEditNodeObj,true,false,true);
//					$('#edit_node_tbl').flexReload();
					//guolanrui 20141010 编辑树节点后，保存时，注释掉上方代码，直接刷新树，避免保存后刷出没有权限的树节点BUG：925
					refash_tree_node();
					is_allowed.init({CHOOSE_STRU_NODE:false,QUOTE_STRU_NODE:false,DEL_NODE:false,DELETE_STRU_NODE:true}); // init	
						$.dialog.notice({
							content:'保存成功',
							icon:'succeed',
							time:2
						});
						return true;
					/*
					 //让用户去决定是否进行授权
					var flag=confirm("您需要给用户角色赋权吗？",function() { }, null);
					if(!flag){
						$.dialog.notice({
							content:'保存成功',
							icon:'succeed',
							time:2
						});
						return;
					}*/
				}else{
					$.dialog.notice({content:'保存失败',icon:'error',time:2});
				}
			},
			'json'
		);
	    return;
	}	
	   $.post(
		$.appClient.generateUrl({ESTemplate:'addtreenodebefore'}, 'x'),
		{data_list:data_list.join('@@'),nodeId:ClickEditNodeObj.id,nodeIdSEQ:ClickEditNodeObj.idSEQ},
		function (zTree_json){ // {'data':{{},{}...},'success':true}
			if(zTree_json.success){
				/*****************************************************************************************************************************/
				/************** guolanrui 20140927 如果有BUG是因为这引起的，改之前请跟我说一下，不要把逻辑改掉引起新的BUG ************************/
				/*****************************************************************************************************************************/
				
				//guolanrui 20140927 修改此处的判断逻辑
				if(zTree_json.HasRole && !zTree_json.isAdmin){
					var htmlContent = "<div class='roleGrid'><table id='roleTable'></table></div>";
					 var linkdialog=$.dialog({
					    	title:'新添加的节点授权给用户拥有的角色',
					    	width: '600px',
					    	height:'380px',
					    	padding:'0px',
				    	   	fixed:  true,
				    	    resize: false,
				    	    okVal:'保存',
						    ok:true,
						    cancelVal: '取消',
						    cancel: true,
					    	content:htmlContent,
					    	ok:function()
					    	{
					    		
					    		var objs = $('#roleTable').find("input[name='roleServerIdLists']:checked");
					    		var roleIds = "";
					    		if(objs.length<1){
					    			$.dialog.notice({icon:'warning',content:"请选择要授权的角色！",time:3});
					    			return false;
					    		}else{
					    			objs.each(function(){
										var id=$(this).val();
										roleIds +=","+id; 
									});
					    		}
                               //-----------------------------
					    		$.post(
					    				$.appClient.generateUrl({ESTemplate:'addtreenode'}, 'x'),
					    				{data_list:data_list.join('@@'),nodeId:ClickEditNodeObj.id,nodeIdSEQ:ClickEditNodeObj.idSEQ},
					    				function (zTree_json1){ // {'data':{{},{}...},'success':true}
					    					if(zTree_json1.success){
					    						
//					    						zTree.removeChildNodes(ClickEditNodeObj);
//					    						zTree.addNodes(ClickEditNodeObj,zTree_json.data,true);
//					    						zTree.expandNode(ClickEditNodeObj,true,false,true);
//					    						$('#edit_node_tbl').flexReload();
					    						is_allowed.init({CHOOSE_STRU_NODE:false,QUOTE_STRU_NODE:false,DEL_NODE:false,DELETE_STRU_NODE:true}); // init
					    						
					    						$.post(
									    				$.appClient.generateUrl({ESTemplate:'saveRoleForTreeNodes'}, 'x'),
									    				{ids:zTree_json1.ids,roleIds:roleIds.substr(1,roleIds.length)},
									    				function (res){ 
									    					if(res == '1'){
									    						refash_tree_node();
//									    						$('#edit_node_tbl').flexReload();
									    						$.dialog.notice({content:"授权成功！",icon : 'succeed',time:3});
												    			return false;
									    					}else{
									    						$.dialog.notice({content:"授权失败！",icon:'error',time:3});
												    			return false;
									    					}
									    				}
									    		);

					    					}else{
					    						$.dialog.notice({content:'保存失败',icon:'error',time:2});
					    					}
					    				},
					    				'json'
					    			);
					    		//-------------------------------
					    	
							},
							init:function(){
								var ModleCol = [ {display : '',name : 'startNum',width : 30,align : 'center'}, 
								         	    {display : '<input type="checkbox" id="roleServerIdList">',name : 'ids',width : 15,align : 'center'},
								         	    {display : 'ID',name : 'roleId',metadata:'roleId',width : 40,align : 'left',hide:true}, 
								         	    {display : '角色标识',name : 'roleCode',metadata:'roleCode',width : 150,align : 'left'},
								         	    {display : '角色名称',name : 'roleName',metadata:'roleName',width : 200,align : 'left'},
									 {display : '创建时间',name : 'createTime',metadata:'createTime',width : 150,align : 'left'}, 
									 {display : '修改时间',name : 'updateTime',metadata:'updateTime',width : 150,sortable : true,align : 'left'},
									 {display : '是否为系统角色',name : 'isSystem',metadata:'isSystem',width : 110,sortable : true,align : 'center'},
									{display : '角色描述',name : 'roleRemark',metadata:'roleRemark',width : 300,align : 'left'}
									];
								$("#roleTable").flexigrid({
									url:false,
									dataType: 'json',
									editable: true,
									colModel : ModleCol,
				    				showTableToggleBtn: false,
				    				width: 600,
				    				height: 320
								});
								for(var i=0;i<zTree_json.roleData[0];i++){
									   var roleDatas = zTree_json.roleData[1][i];
		  				    			$("#roleTable").flexExtendData([{
											'startNum':zTree_json.roleData[1].id,
											'cell':{
  												'ids':'<input type="checkbox" name="roleServerIdLists" value ="'+roleDatas.roleId+'">',
													'roleId':roleDatas.roleId,
													'roleCode':roleDatas.roleCode,
													'roleName':roleDatas.roleName,
													'createTime':roleDatas.createTime,
													'updateTime':roleDatas.updateTime,
													'isSystem':roleDatas.isSystem,
													'roleRemark':roleDatas.roleRemark
												   }
										}]);
		      						}
							   }
						 });
				     }else{
				    	 //guolanrui 20140927 修改此处的逻辑
				    	 if(zTree_json.isAdmin || zTree_json.isOnly){//表示是admin 或者只有当前用户只有一个角色
				    		 var isOnly = zTree_json.isOnly;
				    		$.post(
				    				$.appClient.generateUrl({ESTemplate:'addtreenode'}, 'x'),
				    				{data_list:data_list.join('@@'),nodeId:ClickEditNodeObj.id,nodeIdSEQ:ClickEditNodeObj.idSEQ},
				    				function (zTree_json1){ // {'data':{{},{}...},'success':true}
				    					if(zTree_json1.success){
//				    						zTree.removeChildNodes(ClickEditNodeObj);
//				    						zTree.addNodes(ClickEditNodeObj,zTree_json1.data,true);
//				    						zTree.expandNode(ClickEditNodeObj,true,false,true);
//				    						$('#edit_node_tbl').flexReload();
				    						is_allowed.init({CHOOSE_STRU_NODE:false,QUOTE_STRU_NODE:false,DEL_NODE:false,DELETE_STRU_NODE:true}); // init	
				    						if(!zTree_json.isAdmin){
				    							$.post(
			    									$.appClient.generateUrl({ESTemplate:'saveRoleForTreeNodes'}, 'x'),
			    									{ids:zTree_json1.ids,roleIds:zTree_json1.roleids},
			    									function (res){ 
			    										if(res == '1'){
			    											refash_tree_node();
//								    						$('#edit_node_tbl').flexReload();
			    											$.dialog.notice({content:"保存成功！",icon : 'succeed',time:3});
			    											return false;
			    										}else{
			    											$.dialog.notice({content:"保存失败！",icon:'error',time:3});
			    											return false;
			    										}
			    									}
				    							);
				    						}else{
				    							refash_tree_node();
				    							$.dialog.notice({content:"保存成功！",icon : 'succeed',time:3});
				    							return;
				    						}
				    					}
				    				},'json');
				     		}else{
					    	 $.dialog.notice({content:'保存失败,当前用户没有角色！',icon:'error',time:2});
					     }
				     }
				//shimiao end 
			}else{
				$.dialog.notice({content:'保存失败',icon:'error',time:2});
			}
		},
		'json'
	);
}





//------------------------- edit node end ----------------------------//




// 新建子结构节点
$('#ADD_STRU_CHILD_NODE').click(function (){
	
	if(!is_allowed.ADD_STRU_CHILD_NODE) return;
	
	$('#EDIT_STRU_TBL').hide();
	
	init_new_stru_node(); // init
	is_new = 'new_child'; // 新建子节构模式 'new'|'modify'|'new_child'|'modified'
	is_allowed.init({ADD_STRU_CHILD_NODE:false});
	
});


//保存结构节点
$('#SAVE_STRU_NODE').click(function (){
	
	if(!is_allowed.SAVE_STRU_NODE) return;
	
	var id = null;
	if(is_new == 'new'){
		id = parseInt(ClickEditNodeObj.id);
	}else if(is_new == 'new_child'){
		id = parseInt(ClickEditStruObj.id);
	}else if(is_new == 'modify'){
		id = parseInt(ClickEditStruObj.id);
	}
	
	// 标题,描述,结构类型,创建人,时间,档案类型
	// ESTITLE,ESDESCRIPTION,ESTYPE,ESCREATOR,ESDATE,ESCLASS
	var form_val = [$('#ESTITLE').val(),$('#ESDESCRIPTION').val(),$('#ESTYPE').val(),$('#ESCREATOR').val(),$('#ESDATE').val(),$('#ESCLASS').val()];
	
	///*
	$.post(
		$.appClient.generateUrl({ESTemplate:'treenodestructureadd'}, 'x'),
		{form_val:form_val.join(','), id:id, is_new:is_new},
		function (sid){ // 新建返回结构ID,修改返回布尔值
			if(typeof sid == 'number'){
				
				if(is_new == 'new'){
					ClickEditNodeObj.sId = sid; // 
					get_by_sid();
					ClickEditStruObj.id = sid;
					init_new_stru_node(); // init
					is_new = 'new_child'; // init
					is_allowed.init({DEL_STRU_NODE:false}); // init
				}else if(is_new == 'new_child'){
					get_by_sid();
					init_new_stru_node(); // init
					is_new = 'new_child'; // init
					is_allowed.init({DEL_STRU_NODE:false}); // init
				}
				
				is_allowed.init({SAVE_STRU_NODE:false,RESET_STRU_NODE:false}); // init
				
				$.dialog.notice({
					icon:'succeed',
					content:'保存成功',
					time:2,
					lock:false
				});
				
				return;
			}else if(typeof sid == 'boolean'){
				
				ClickEditStruObj.name = $('#ESTITLE').val()+'('+ClickEditStruObj.id+')';
				stru_zTree.updateNode(ClickEditStruObj);
				is_allowed.init({SAVE_STRU_NODE:false,RESET_STRU_NODE:false}); // init
//				is_new = undefined; // init//liqiubo 20140818 注掉此代码，否则只能修改一次
				
				$.dialog.notice({
					icon:'succeed',
					content:'修改成功',
					time:2,
					lock:false
				});
				return;
			}else {
				$.dialog.notice({
					icon:'error',
					content:'保存失败',
					time:2,
					lock:false
				});
				return;
			}
			
		},
		'json'
	);
	//*/
});

// 删除结构节点
$('#DEL_STRU_NODE').click(function (){

	if(!is_allowed.DEL_STRU_NODE) return;
	
	$.dialog({
		icon:'warning',
		content:'确定要删除',
		okVal:'确定',
		ok:DEL_STRU_CallBack,
		cancelVal : '关闭',
		cancel : true
	});
	
	
});

// 删除结构节点回调
function DEL_STRU_CallBack()
{
	$.post(
		$.appClient.generateUrl({ESTemplate:'DeleteStructure'},'x'),
		{ID:ClickEditStruObj.id,ESTITLE:ClickEditStruObj.name},
		function (result){
			if (result == 'no-error') {
				$.dialog.notice({
					icon : 'succeed',
					content : '删除成功',
					time :2,
					lock:false
				});
				
				
				
				
				if(ClickEditStruObj.pId){ // 删除后还有节点
					stru_zTree.removeNode(ClickEditStruObj); // 移除结构树节点
					is_allowed.init({DEL_STRU_NODE:false}); // init
					$('#EDIT_STRU_TBL').hide();	// 隐藏结构表格
					init_new_stru_node();	// 初始化结构信息(清空)
					is_new = 'new_child'; // init
					
				}else{ // 删除后节点为空
					stru_zTree.removeNode(ClickEditStruObj); // 移除结构树节点
					displayTag(1); // 子结构不存在返回第一个标签
					is_allowed.init({DEL_STRU_NODE:false,DEL_NODE:true,EDIT_STRU:false,CHOOSE_STRU_NODE:true,QUOTE_STRU_NODE:true,DELETE_STRU_NODE:false}); // init
					ClickEditNodeObj.sId = "0";
				}
				
				return;
				
			} else {
				$.dialog.notice({
					icon : 'error',
					content : result,
					time : 2,
					lock:false
				});
				return;
			}
		}
	);
}


// 结构重置按钮
$('#RESET_STRU_NODE').click(function (){
	
	if(!is_allowed.RESET_STRU_NODE) return;
	
	if(is_new == 'new' || is_new == 'new_child'){
		init_new_stru_node();
	}else if(is_new == 'modify'){
		get_stru_node_info();
	}
	
	is_allowed.init({SAVE_STRU_NODE:false,RESET_STRU_NODE:false});
	
});


// 结构编辑事件
$('#EDIT_STRU').click(function (){
	
	if(is_allowed.EDIT_STRU){
		displayTag(2);
		//load_edit_rule_tbl();
		
		if(is_new == 'new') $('#EDIT_STRU_TBL').hide(); // 如果是新建结构节点则隐藏表格
	}
	
});
_tagTable = {
		total: false, // 用于保存接口日志总条数,该参数只在第一次得到
		init: function (){
			$('#EDIT_STRU_TBL').html('<table id="edit_stru_tbl"></table>');
			var col_ = url_ = title_ = button_ = type_ = false;
			button_ = [
					           	{ name : '添加', bclass : 'add', onpress : ajax_structureadd },
					           	{ name : '删除', bclass : 'delete', onpress : deletestr	},
					           	{ name : '保存', bclass : 'save',	onpress : addstructure },
					           	{ name : '字段导出', bclass : 'export', onpress : batchexport },
					           	{ name : '字段导入', bclass : 'import', onpress : fieldsImport },
					           	{ name : '批量引用', bclass : 'batchmodify', onpress : fieldsBatchSpecify }
					];
			col_=[// cbox ESIDENTIFIER METADATA ESTYPE ESISNULL ESLENGTH ESDOTLENGTH ESISSYSTEM ESDESCRIPTION
					{display : '<input type="checkbox" id="sinputB">', name:'cbox', width:40, align:'center'},
					{display : '字段名',	name : 'ESIDENTIFIER',editable : true,	width : 100,align : 'center'},
					{display : '元数据',	name : 'METADATA',width : 200,align : 'center'},
					{display : '类型',name : 'ESTYPE',width : 60,align : 'center', editable:true, dropdown:['文本','数值','日期','浮点','时间','布尔']},
					{display : '是否为必填项',name : 'ESISNULL', width : 50, align : 'center', editable : true, dropdown : ['是','否']},
					{display : '字段长度', name : 'ESLENGTH', editable : true, width:80, validate:/^(?!0)\d{1,5}$/i,  validateMsg:"必须大于零的为数字",align :'center'},
					//wanghongchen 20140902 更改小数点位数超长提示
					{display : '小数点位数', name : 'ESDOTLENGTH', editable : true, width : 80, validate:/^\d+$/i,validateMsg:"必须为不大于字段长度减2的数字",align :'center'},
					{display : '是否为系统字段',name:'ESISSYSTEM', width:80,align:'center',editable:true,dropdown:['是','否']},
					{display : '描述', name : 'ESDESCRIPTION', editable : true, width : 150, align : 'center'}
				];
			url_ =$.appClient.generateUrl({ESTemplate : 'structure_json', id:structureID}, 'x');
			$("#edit_stru_tbl").flexigrid({
				url: url_,
				editable:true,
				dataType: 'json',
				title : '著录项',
				colModel : col_,
				buttons : button_,
				onSuccess:_dealData.changeEditable,
				onCellChange:_dealData.onCellChange,
				width : _size.tbl.width,
				height : _size.tbl.height,
				usepager: true,
				useRp: true,
				rp: 20,
				nomes: '没有数据',
				pagetext: '第',
				outof: '页 /共',
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});
			
		}
};
_dealData={
		 changeEditable:function(){
			 //文本、数值、日期、时间 类型字段不能修改小数点位数
			 var trObj = $('#edit_stru_tbl').find("tr");
			 trObj.each(function (){
				 var eslength=$(this).find('td[colname="ESLENGTH"]').text(); //字段长度
					var estype = $(this).find('td[colname="ESTYPE"]').text();
					$(this).find('td[colname="ESDOTLENGTH"]').attr('editable',false);
					$(this).find('td[colname="ESLENGTH"]').attr('editable',false);
					if(estype=='浮点'){
						$(this).find('td[colname="ESLENGTH"]').attr('maxNumber',15);
						$(this).find('td[colname="ESDOTLENGTH"]').attr('maxNumber',eslength-1);//浮点数 小数点位数不能超过字段长度
						$(this).find('td[colname="ESLENGTH"]').attr('editable',true);
						$(this).find('td[colname="ESDOTLENGTH"]').attr('editable',true);
					}else if (estype=='数值'){
						$(this).find('td[colname="ESLENGTH"]').attr('maxNumber',9);
						$(this).find('td[colname="ESLENGTH"]').attr('editable',true);
					}else if (estype=='文本'){
						$(this).find('td[colname="ESLENGTH"]').attr('maxNumber',4000);
						$(this).find('td[colname="ESLENGTH"]').attr('editable',true);
					}
		
				});
		},
		onCellChange:function(obj){
			if(obj.attr('colname')=='ESTYPE'){//字段类型为 文本、数值、日期、时间时 小数点位数不可编辑
				var tr=obj.closest("tr");
				var estype =obj.text();
				tr.find('td[colname="ESDOTLENGTH"]').attr('editable',false);
				tr.find('td[colname="ESLENGTH"]').attr('editable',false);
				tr.find('td[colname="ESDOTLENGTH"] div').html(0);//如果字段类型改变 且不是浮点型 小数点位数设置为0
				if(estype=='浮点'){
					tr.find('td[colname="ESLENGTH"]').attr('maxNumber',15);
					tr.find('td[colname="ESDOTLENGTH"]').attr('maxNumber',14);
					tr.find('td[colname="ESLENGTH"]').attr('editable',true);
					tr.find('td[colname="ESDOTLENGTH"]').attr('editable',true);
					tr.find('td[colname="ESDOTLENGTH"] div').html(0);//如果字段类型改变 且不是浮点型 小数点位数设置为0
					tr.find('td[colname="ESLENGTH"] div').html(15);//如果字段类型改变 且不是浮点型 小数点位数设置为0
				}else if (estype=='数值'){
					tr.find('td[colname="ESLENGTH"]').attr('editable',true);
					tr.find('td[colname="ESLENGTH"] div').text('9');
					tr.find('td[colname="ESLENGTH"]').attr('maxNumber',9);
				}else if (estype=='文本'){
					tr.find('td[colname="ESLENGTH"]').attr('editable',true);
					tr.find('td[colname="ESLENGTH"] div').text("20");
					tr.find('td[colname="ESLENGTH"]').attr('maxNumber',4000);
				}else if (estype=='时间'){
					tr.find('td[colname="ESLENGTH"] div').text("8");
				}else if (estype=='日期'){
					tr.find('td[colname="ESLENGTH"] div').text("10");
			     }else if (estype=='布尔'){
					tr.find('td[colname="ESLENGTH"] div').text("5");
				}
				
		   }else if(obj.attr('colname')=='ESLENGTH'){
			   var tr=obj.closest("tr");
			   var eslength=tr.find('td[colname="ESLENGTH"] div').text();
			   tr.find('td[colname="ESDOTLENGTH"]').attr('maxNumber',eslength-1);//浮点数 小数点位数不能超过字段长度
			}
			
		}
		
};
// 新建著录项行
function ajax_structureadd()
{
	$("#edit_stru_tbl").flexExtendData([{
			"ID" : '0',
			"cell" : {
				'cbox' : '<input type="checkbox" name="sinputB" value="-1" />', // 新建著录项为-1，JAVA后台根据-1判断
				"ESIDENTIFIER" : "",
				"METADATA" : null,
				"ESTYPE" : '文本',
				"ESISNULL" : '否',
				"ESLENGTH" : '20',
				"ESDOTLENGTH" : 0, 
				"ESISSYSTEM" : '否',
				"ESDESCRIPTION" : null
		}
	}]);
}

// 删除著录项
function deletestr()
{
	var cbObj = $('#edit_stru_tbl input[name="sinputB"]:checked');
	if(cbObj.length<1){
		$.dialog.notice({
			content:'请选择删除数据',
			icon:'warning',
			time:2
		});
		return;
	}
	
	var identifiers = [];
	var identifierIds = [];
	var identifierTexts = [];
	var flag = {is_new:false, is_oldata:false};
	cbObj.each(function (){
		var trObj = $(this).closest('tr').attr('datastate');	// 新建修改TR
		if(trObj=='new' ){//liqiubo 20140807 对于修改的，也允许删除
			flag.is_new = true;
		}else{
			identifiers.push($(this).closest('tr').find('td:eq(1)').text());	// 取唯一标识值
			identifierIds.push($(this).closest('tr').find('td:eq(0) input').attr("value"));	//这个拿到的是这条数据的ID
			identifierTexts.push($(this).closest('tr').find('td:eq(0) input').attr("oldtext"));	//这个拿到的是这条数据的显示的名字
			flag.is_oldata = true;
		};
	});
//	var prompt = flag.is_new ? '删除数据中有新建数据或修改数据,确定删除？' : '您确定要删除所勾选的字段吗?';
	var prompt = '您确定要删除所勾选的字段吗?';//liqiubo 20141008 提示就给一种，修复bug 1249
	
	$.dialog({
		content:prompt,
		icon:'warning',
		okVal:'确定',
		cancelVal:'取消',
		ok:function (){
			//加验证，验证是否有待删除的字段在使用
			var identId = flag.is_oldata ? identifierIds.join(',') : '';
			var identText = flag.is_oldata ? identifierTexts.join(',') : '';
			if(identId){
				$.post(
						$.appClient.generateUrl({ESTemplate:'deleteStructureNodeChecked'},'x'),
						{structureId:structureID, identifierIds:identId,identifierTexts:identText},
						function (data){
							var dataJson = eval("("+data+")");
							if("true"==dataJson.flag){
								if(flag.is_new){
									cbObj.each(function (){
										var trObj = $(this).closest('tr');
										if(trObj.attr('datastate') == 'new' ){
											$(trObj).remove();
										}
									});
						 		}
								var ident = flag.is_oldata ? identifierTexts.join(',') : '';//liqiubo 20140928 这个位置既然是删除，就拿数据原来的值，原来的值在oldvalue中，避免先修改，不保存，再删除出错的问题
								if(ident){
									DEL_STRU_TAGS_CallBack(ident);
								}
							}else{
								var msg = '';
								msg = dataJson.msg;
								$.dialog({
									content:msg,
									icon:'warning',
									cancelVal:'确定',
									cancel:true
								});
							}
						}
				);
			}else{
				//liqiubo 20140928 加入当勾选数据都是新加的的时候，同意删除后，将其从页面中remove掉
				if(flag.is_new){
					cbObj.each(function (){
						var trObj = $(this).closest('tr');
						if(trObj.attr('datastate') == 'new' ){
							$(trObj).remove();
						}
					});
					$.dialog.notice({content:'删除成功', icon:'success', time:2});
		 		}
			}
		},
		cancel:true
	});
	
}

// 删除回调
function DEL_STRU_TAGS_CallBack(ident)
{
	$.post(
		$.appClient.generateUrl({ESTemplate:'deleteStructureNode'},'x'),
		{structureId:structureID, identifiers:ident},
		function (is_ok){
			if(is_ok){
				$.dialog.notice({content:'删除成功', icon:'success', time:2});
				$('#edit_stru_tbl').flexReload();
			}else{
				$.dialog.notice({content:'删除失败', icon:'warning', time:2});
			}
		}
	);
}

// 保存新建数据[修改时间20130813@方吉祥]
function addstructure()
{
	var saveTrObj = $('#edit_stru_tbl tr[datastate="new"],#edit_stru_tbl tr[datastate="modify"]');
	if(!saveTrObj.length){
		$.dialog.notice({
			title:'',
			content:'请添加新数据',
			icon:'warning',
			time:2
		});
		return;
	}
	
	var datas = []; // [{},...]
	saveTrObj.each(function (){
		var data = {};
		//id ESIDENTIFIER METADATA ESTYPE ESISNULL ESLENGTH ESDOTLENGTH ESISSYSTEM ESDESCRIPTION
			data.ID = $(this).find('td[colname="cbox"] input').val();
			data.ESIDENTIFIER = $(this).find('td[colname="ESIDENTIFIER"]').text();
			data.METADATA = $(this).find('td[colname="METADATA"]').text();
			data.ESTYPE = $(this).find('td[colname="ESTYPE"]').text();
			data.ESISNULL = $(this).find('td[colname="ESISNULL"]').text();
			data.ESLENGTH = $(this).find('td[colname="ESLENGTH"]').text();
			data.ESDOTLENGTH = $(this).find('td[colname="ESDOTLENGTH"]').text();
			data.ESISSYSTEM = $(this).find('td[colname="ESISSYSTEM"]').text();
			data.ESDESCRIPTION = $(this).find('td[colname="ESDESCRIPTION"]').text();
			datas.push(data);
	});
	
	
	$.post(
		$.appClient.generateUrl({ESTemplate:'addstructurenode'},'x'),
		{structureId:structureID, datas:datas},
		function (is_ok){
			if(is_ok.SUCCESS == 'true'){
				$.dialog.notice({
					content:'保存成功！',
					icon:'succeed',
					time:2
				});
				$('#edit_stru_tbl').flexReload();
			}else{
				$.dialog.notice({
					content:is_ok.MESSAGE,
					icon:'error',
					time:2
				});
			}
		},
		'json'
	);
}

// 字段导入 longjunhao 20140725
function fieldsImport() {
	var data = 
		"<div id='importFieldsDiv'>" +
			"<form id='importFieldsForm' enctype='multipart/form-data' method='post'>" +
		        "<div style='margin-bottom:12px'><div style='width:140px;height:20px;line-height:20px;float:left;'>选择结构字段文件：</div><input type='file' style='width:250px;height:19px;' name='file' /></div>" +
				"<input type='hidden' name='userid' value=''/>" + 
				"<input type='hidden' name='structureid' value=''/>" +
			"</form>" +
		"</div>"; 
	$.dialog({
		id:'importFieldsDialog',
		title:'导入结构字段',
		content:data,
		okVal:"确定",
		cancelVal:"取消",
	    fixed:true,
	    resize: false,
		cancel:true,
		ok:function(){
			importFieldsForm();
			return false;
		}
	});
}
function fieldsBatchSpecify(){
	$.ajax({
		url:$.appClient.generateUrl({ESTemplate:'fieldsBatchSpecify'},'x'),
		success:function(data){
			var structureID =structureID;
			$.dialog({
		    	title:'批量引用',
		    	padding:'0',
		    	fixed:false,
			    resize: false,
			    lock:true,
			    opacity:0.3,
			    content:data,
			    cancel:function(){
			    	$("#edit_stru_tbl").flexReload();
			    }
			});
		},
		cache:false
		
	});	
}

// 批量导入 
// longjunhao 20140725 edit 废弃，字段导入改用fieldsImport()方法
function batchimport()
{
	//$.get($.appClient.generateUrl({ESTemplate:'swfupload'},'x'));
	
	$.dialog({
		title:'上传文件(最多同时上传10个附件)',
	    fixed:true,
	    resize: false,
	    padding:'0px 0px',
		content:"<div class='fieldset flash' id='fsUploadProgress'></div>",
		cancelVal: '关闭',
		cancel: function (){
			//$('#UploadAnnexBox').hide();
		},
		button: [
    		{id:'btnAdd', name: '添加文件'},
            {id:'btnCancel', name: '删除所有', disabled: true},
            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
		],
		init:createSWFUpload
	});	
}

// 批量导出 (字段导出)
function batchexport()
{
	$.post(
		$.appClient.generateUrl({ESTemplate:'ExportModel'}),
		{structureid:structureID},
		function (fileName){
			if(fileName){
				var downFile = $.appClient.generateUrl({ESTemplate:'download',fileName:fileName},'x');
				$.dialog.notice({
					content:"<a href='"+downFile+"'>下载导出数据</a>",
					icon:'success',
				});
			}else{
				$.dialog.notice({content:'导出数据失败',icon:'error',time:2});
			}
		}
		
	);
}
function queryMetaTable(){

	var keyWord = $('#queryMetaWord').val();
	if(keyWord=='请输入关键字' ){
		$("#metadata_tbl").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'meta_json'},'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#metadata_tbl").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'meta_json'},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
}
// 元数据事件
$('#edit_stru_tbl tr td[colname="METADATA"]').live('dblclick',function (){
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
		url: $.appClient.generateUrl({ESTemplate:'meta_json'}),
		dataType: 'json',
		onClick:function(td, grid, options){
			$(td).parent().find('td:eq(0) input').attr('checked','checked');
			$_metadata = $(td).parent().find('td:eq(2)').text();
		},
		colModel : [
			{display: '', name : 'radio', width : 40, align: 'center'},
			{display: '名称', name : 'name', width : 80, sortable : true, align: 'center'},
			{display: '唯一标识', name : 'ident', width : 80, sortable : true, align: 'center'},
			{display: '类型', name : 'type', width : 80, sortable : true, align: 'center'},
			{display: '是否参与高级检索', name : 'search', width : 80, sortable : true, align: 'center'},
			{display: '描述', name : 'desc', width : 100, sortable : true, align: 'center'}
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

// 双击元数据列表中的行选择元数据和点击'确定'功能一样
// wanghongchen 20140616 单击双击卸载一个方法中，防止出现单击不起作用
$('#metadata_tbl tr').live('click dblclick',function (){
	$(this).find('td:eq(0) input').attr('checked','checked');
	$_metadata = $(this).find('td:eq(2)').text();
	if(event.type == 'dblclick'){
		metadata_Call_back();
		metadata_dialog.close();
	}
});

// 元数据选择回调函数
function metadata_Call_back ()
{
	if('CaseID'==$_metadata){
		if('文本'!=$($_tdObj).closest('tr').find("td[colname='ESTYPE']").text()){
			$.dialog.notice({icon:'warning',content:'关联盒号元数据的字段类型必须为文本类型',time:2});
			return;
		}
	}//liqiubo 20140915 加入选择元数据的控制，盒号元数据必须是文本类型
	$($_tdObj).find('div').html($_metadata);
	$($_tdObj).attr('class','editing'); // 加上被编辑过红标签
	$($_tdObj).closest('tr').attr('datastate','modify'); // 设置该行为修改状态
}

//------------------------- edit stru end ---------------------------//

//规则编辑事件
$('#EDIT_RULE').click(function (){
	if(!is_allowed.EDIT_RULE) return;
	
	displayTag(3);
	load_edit_rule_tbl();
});

//规则编辑表格
function load_edit_rule_tbl()
{
	
	$('#EDIT_RULE_TBL').html('<table id="edit_rule_tbl"></table>');
	$("#edit_rule_tbl").flexigrid({
		url : $.appClient.generateUrl({ESTemplate : 'rules_json', sid: structureID, mid: molid, isFirstLevel:ClickEditStruObj.pId==null?1:0}, 'x'),
		dataType : 'json',
		colModel : [
			{ display : '操作', name : 'ope', width : 50, sortable : true, align : 'center'},
			{ display : '规则名称', name : 'name', width : 120, sortable : true, align : 'center'},
			{ display : '规则内容', name : 'value', width : 380, sortable : true, align : 'left'}
		],
//gengqianfeng 20140918 删除分页控件
//		usepager : false,
//		title : '规则定义',
//		useRp : false,
//		rp : 20,
//		nomsg : "没有数据",
//		pagetext : '第',
//		outof : '页 /共',
		width : _size.rule.width,
		height : _size.rule.height+28
//		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	$("#edit_rule_tbl tr").die('dblclick').live('dblclick',function(){
		$(this).find('div input').click();
	});
}


//获取结构信息
function get_stru_node_info()
{
	$.getJSON(
		$.appClient.generateUrl({ESTemplate:'ajax_information', id:structureID}, 'x'),
		function (result){
			
			$('#ESTITLE').val(result.ESTITLE);	// 标题
			$('#ESDESCRIPTION').val(result.ESDESCRIPTION);	// 描述
			$('#ESCREATOR').val(result.ESCREATOR);	// 创建人
			$('#ESDATE').val(result.ESDATE);	// 时间
			
			// 结构类型
			$('#ESTYPE').val(result.ESTYPE);//修改下拉框选中方法 薛坤 20140820
			$('#ESTYPE').attr('disabled','disabled');//liqiubo 20140626 加入js控制，使下拉框不可编辑
//			var estype = ['file','innerFile'];	// #ESTYPE option value值
//			$('#ESTYPE option').removeAttr('selected');
//			$('#ESCLASS option').removeAttr('selected');
//			for(var i in estype)
//			{
//				if(estype[i] == result.ESTYPE) {
//				$('#ESTYPE option[value="'+estype[i]+'"]').attr('selected','selected');
//				}
//			}
			
			
			// 档案类型
			
			$('#ESCLASS').val(result.ESCLASS);//修改下拉框选中方法 薛坤 20140820
			$('#ESCLASS').attr('disabled','disabled');//liqiubo 20140626 加入js控制，使下拉框不可编辑
//			var esclass = ['document','contract','project','accounting','purchase','technical','carrierfiles','personal','auditfiles'];
//			for(var i in esclass)
//			{
//				if(esclass[i] == result.ESCLASS) {
//					$('#ESCLASS option[value="'+esclass[i]+'"]').attr('selected','selected');
//					$('#ESCLASS').attr('disabled','disabled');//liqiubo 20140626 加入js控制，使下拉框不可编辑
//				}
//			}
		}
	);
}

// 结构节点单击事件
function editStructure(event, treeId, treeNode)
{
	
	ClickEditStruObj = treeNode;
	
	is_new = 'modify'; // 修改模式 'new'|'modify'|'new_child'|'modified'
	
	displayTag(2); // 显示结构编辑标签
	$('#EDIT_STRU_TBL').show();	// 隐藏表格
	
	structureID = treeNode.id;
	
	is_allowed.init({EDIT_STRU:true,EDIT_RULE:true});
	if(treeNode.isParent){
		is_allowed.init({DEL_STRU_NODE:false,ADD_STRU_CHILD_NODE:false});
	}else{
		is_allowed.init({DEL_STRU_NODE:true,ADD_STRU_CHILD_NODE:true});
	}
	
	// 获取结构节点信息,表格数据
	get_stru_node_info();
	_tagTable.init();
	
}



//节点编辑树(左上树)
function editNode(event, treeId, treeNode)
{
	ClickEditNodeObj = treeNode;
	
	// 初始化按钮为禁用状态
	///*
	is_allowed.init({
		EDIT_NODE:false,
		EDIT_STRU:false,
		EDIT_RULE:false,
		CHOOSE_STRU_NODE:false,
		DELETE_STRU_NODE:false,
		QUOTE_STRU_NODE:false,
		DEL_NODE:false,
		SAVE_NODE:false,
		RESET_NODE:false,
		ADD_STRU_CHILD_NODE:false,
		DEL_STRU_NODE:false,
		SAVE_STRU_NODE:false,
		RESET_STRU_NODE:false
	});
	//*/
	is_allowed.init({EDIT_NODE:true}); // 启用节点编辑选项卡按钮
	!treeNode.isParent && !parseInt(treeNode.sId) ? is_allowed.init({DEL_NODE:true}) : is_allowed.init({DEL_NODE:false}); // 启用删除节点,添加结构按钮
	!treeNode.isParent && parseInt(treeNode.sId)>0 ? is_allowed.init({DEL_NODE:true,CHOOSE_STRU_NODE:false,QUOTE_STRU_NODE:false,DELETE_STRU_NODE:true}):!treeNode.isParent?is_allowed.init({DEL_NODE:true,CHOOSE_STRU_NODE:true,DELETE_STRU_NODE:false,QUOTE_STRU_NODE:true}):is_allowed.init({DEL_NODE:true,CHOOSE_STRU_NODE:false,QUOTE_STRU_NODE:false});
	
	// 回显数据到文本域
	$('#NODENAME').val(treeNode.name);
	$('#NODEIDENT').val(treeNode.identifier);
	
	displayTag(1); // 显示树节点编辑DIV标签
	
	load_edit_node_tbl();	// 载入树节点编辑表格
	molid="-1";//liqiubo 20140918 点击树节点的时候，再将业务置为-1，修复bug 1043
	
	
	// 结构sid有的时候调用关联树结构,没有清空关联树结构DIV
	if(treeNode.sId > 0){
		get_by_sid();
		$('#EDIT_NODE_TBL').html('');
	}else{
		$('#leftbottomul').html('');
	}
	if(!treeNode.isParent){
		$.post(
				$.appClient.generateUrl({ESTemplate:'getModelByNodePath'},'x'),
				{nodePath:treeNode.id},
				function(result){
					var modelTitle= ['文件鉴定','案卷整理','案卷编目','整理编目','归档入库','档案著录'];
					$(".headmess").empty();
					var res = [];
					res = result.split(',');
					var strHtml = '<select id="select" onchange="changemolid()" class="temselect">';
					strHtml =strHtml + '<option value="-1">默认状态</option>';
					for(var i = 0;i<res.length;i++){
						/** xiaoxiong 20140806 添加为0判断，0时说明没有权限 **/
						if(res[i] != '0')strHtml =strHtml +  '<option value="'+res[i]+'">'+modelTitle[i]+'</option>';
					}
					strHtml =strHtml +"</select>";
					$(".headmess").append(strHtml);
				}
			);
	}
}



// 获取结构节点(左下树)
function get_by_sid()
{
	var setting = {
		// zaizheli
		view : {
			dblClickExpand : true,
			showLine : false
		},
		data : {
			simpleData : {
				enable : true
			}
		},
		callback : {
			onClick:editStructure
		}
	};
	$.getJSON(
		$.appClient.generateUrl({ESTemplate:"underTree", sid:ClickEditNodeObj.sId}, 'x'),
		function(result){
			stru_zTree = $.fn.zTree.init($("#leftbottomul"), setting, result);
		}
	);
}
function refash_tree_node()
{var setting = {
		view : {
			dblClickExpand : true,
			showLine : false
		},
		data : {
			simpleData : {
				enable : true
			}
		},
		callback : {
			onClick:editNode,	//clickNode
		}
	};
	// 获取树节点
	$.getJSON(
		$.appClient.generateUrl({ESTemplate : "GetOwnBusinessTree"}, 'x'),
		function(result){
			$_uInfo = result.uInfo;
			zTree = $.fn.zTree.init($("#treeDemo"), setting, result.zNodes);
			$("#treeDemo_1_switch").trigger("click"); 
			$("#treeDemo_1_span").trigger("click"); 
		}
	);
}




//获取结构节点(左上树)
window.onload = function (){
	
	var setting = {
			view : {
				dblClickExpand : true,
				showLine : false
			},
			data : {
				simpleData : {
					enable : true
				}
			},
			callback : {
				onClick:editNode,	//clickNode
			}
		};
		
		// 获取树节点
		$.getJSON(
			$.appClient.generateUrl({ESTemplate : "GetOwnBusinessTree"}, 'x'),
			function(result){
				$_uInfo = result.uInfo;
				zTree = $.fn.zTree.init($("#treeDemo"), setting, result.zNodes);
				/**shimiao 20140401*/
				$("#treeDemo_1_switch").trigger("click"); 
				$("#treeDemo_1_span").trigger("click"); 
			}
		);

		$("#estabs").esTabs("open", {title:"模板定义", content:"#ESSystemIndex"});
	
};


var sinputA=0;
$('#sinputA').live('click',function(){
	sinputA++%2==0 ? $('#edit_node_tbl input[name="sinputA"]').attr('checked','checked') : $('#edit_node_tbl input[name="sinputA"]').removeAttr('checked');
});
var sinputB=0;
$('#sinputB').live('click',function(){
	sinputB++%2==0 ? $('#edit_stru_tbl input[name="sinputB"]').attr('checked','checked') : $('#edit_stru_tbl input[name="sinputB"]').removeAttr('checked');
});
var sinputC=0;
$('#sinputC').live('click',function(){
	sinputC++%2==0 ? $('#edit_code_tbl input[name="sinputC"]').attr('checked','checked') : $('#edit_code_tbl input[name="sinputC"]').removeAttr('checked');
});
$('#roleServerIdList').live('change',function(){
	var flag = $(this).attr('checked');
	if(flag){
		$('input[name="roleServerIdLists"]').attr('checked',true);
	}else{
		$('input[name="roleServerIdLists"]').attr('checked',false);
	}
});
//liqiubo 20140819 修复bug 774
$('#edit_stru_tbl tr td[colname="ESTYPE"]').find("select").live('change',function(){
	if($(this).closest('tr').find('td[colname="cbox"] input').val()=='-1'){
		var val = $(this).val();
		if(val=='时间'){
			$(this).closest('tr').find('td[colname="ESLENGTH"] div').text("10");
		}else if(val=='日期'){
			$(this).closest('tr').find('td[colname="ESLENGTH"] div').text("8");
		}else if(val=='布尔'){
			$(this).closest('tr').find('td[colname="ESLENGTH"] div').text("5");
		}else if(val=='浮点'){
			$(this).closest('tr').find('td[colname="ESLENGTH"] div').text("15");
			$(this).closest('tr').find('td[colname="ESDOTLENGTH"] div').text("1");
		}else{
			$(this).closest('tr').find('td[colname="ESLENGTH"] div').text("20");
		}
	}
});

