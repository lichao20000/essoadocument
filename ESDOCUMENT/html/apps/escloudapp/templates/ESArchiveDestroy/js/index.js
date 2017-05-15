/*
 * author # fangjixiang
 * date # 20121031
 * 
 */
/**
  			width: $size.init().tblWidth,
			height: $size.init().tblHeight,
 * **/
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
//var approveUserId='';

var $globalVal = {

	workId : undefined, // 流程ID
	taskId : undefined, // 待办ID
	formId : undefined, // 表单ID
	statusNode : undefined, // 状态节点
	archiveTypeNode : undefined, // 文档类型节点
	functionNode : undefined, // 功能节点
	container : undefined, // 监销人,销毁负责人按钮对象
	isSave : false, // 表单是否保存 
	fnTreeObj : undefined, // 功能树
	statusTreeObj : undefined, // 状态树
	taskFlag: false, // = false|identify|destroy
	taskEvent: false, // = false|back...
	taskSize: 0, // type = {destroy:3,}
	approveUserId:''
};

(function (){ // 验证数据
	var hashStr = window.location.hash; // #task|identify,back|workId|taskId|formId
	var hash = hashStr.split('|');
	if(hash[0] == '#task'){
		var p = hash[1].split(','); // =identify,back
		$globalVal.taskFlag = p[0];
		$globalVal.taskEvent = p[1];
		
		hash.shift(); // identify,back|385=formId
		hash.shift(); // 385=formId
		hash.pop(); // 385=formId
		
		$globalVal.taskSize = hash.length;
		window.location.hash = hash.join('|');
	}
})();

//---------------------------华丽的分隔线---------------------------------------//


// 销毁清册状态树 //
var statusTree = {
	setting : {
		view:{
			dblClickExpand : true,
			showLine:false
		},
		data : {
		    simpleData : {
		        enable : true
		    }

		},
		callback: {
			onClick: function (event, treeId, treeNode){
				if(treeNode.enlogo){
					$globalVal.statusNode = treeNode;
//					if(treeNode.enlogo=='destroy'){
//						DestroyListTbl.init('destroy'); 
//					}else{
						DestroyListTbl.init(treeNode.enlogo);
//					}
					
					var url = $.appClient.generateUrl({ESArchiveDestroy : "GetIdentificationList", status:treeNode.enlogo}, 'x');
					$("#Destroy_list_tbl").flexOptions({url:url}).flexReload();
					$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="identifyKeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="identifyKeyWord" value="请输入关键字" /><span id="identifyQuery"></span></div>');
					
				}else{
					$globalVal.statusNode = undefined;
				}
			}
		}
	},
	nodes : [
  		{name:'鉴定销毁', id:1, pId:0, enlogo:null, open:true},
// 		{name:'待鉴定', id:101, pId:1, enlogo:'edit'},
 		{name:'鉴定中', id:102, pId:1, enlogo:'identify'},
 		{name:'待销毁', id:103, pId:1, enlogo:'destroy'},
 		{name:'已销毁', id:104, pId:1, enlogo:'destroyed'},
 		{name:'不销毁', id:105, pId:1, enlogo:'reserve'}
 	]
	
};
// 销毁清册状态树结束 //

$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'identifyKeyWord') {
		identifyQuery();
	}
});

$("#identifyQuery").die().live("click",function(){
	identifyQuery();
});

function identifyQuery(){
	var keyword = $.trim($('#identifyKeyWord').val());
	if(keyword == '' || keyword=='请输入关键字') {
		keyword = '';
	}
	$("#Destroy_list_tbl").flexOptions({newp : 1, query : keyword}).flexReload();
}

// 档案类型树 //
var archiveTypeTree = {
	setting : {
		view:{
			dblClickExpand : true,
			showLine:false
		},
		data : {
		    simpleData : {
		        enable : true
		    }
		},
		callback: {
			onClick : function(event,treeId,treeNode){
				if(treeNode.archivetype){
					$globalVal.archiveTypeNode = treeNode;
				}else{
					$globalVal.archiveTypeNode = undefined;
				}
			}
		}
	}
};
// 档案类型树结束  //


// 销毁功能树节点  //
var functionTree = {
		setting : {
			view:{
				dblClickExpand : true,
				showLine:false
			},
			data : {
			    simpleData : {
			        enable : true
			    }

			},
			callback: {
				onClick: function(event, treeId, treeNode){
					
					/*
					 * if(isset($_GET['cb'])) $rows['cb'] = '<input type="checkbox" name="inputs" value="'.$row->id.'" />';
					 * if(isset($_GET['ext'])){ // 保留列表中的延长保管期限,保留原因
					 *		$rows['ext_years'] = $row->extendedRetentionPeriod.'年';
					 *  	$rows['because'] = $row->reason;
					 * }
					 * 
					 */
					
						if(!treeNode.enlogo){ return;}
						
						$globalVal.functionNode = treeNode;
						defaultTbl.init();
						
						$globalVal.fnTree = $.fn.zTree.getZTreeObj('functionTree');
						
						var formId = $globalVal.formId;
						if(formId == undefined) return;
						var url = null;
						if(treeNode.enlogo == 'destroyReport'){
							$.post(
								$.appClient.generateUrl({ESArchiveDestroy : "GetIdentification", status:treeNode.enlogo}, 'x'),
								{ formId: formId},
								function (jsonData){
								
										document.getElementById('destroyNumber').value = jsonData.destroyNumber; // 销毁数据
										
										if($globalVal.statusNode.enlogo != 'edit'){ // 编辑状态无保留数量
											
											document.getElementById('retentionNumber').value = jsonData.retentionNumber;
										
										}
								
								},
								'json'
							);
						}if(treeNode.enlogo == 'identifyAuthorized'){
							url = $.appClient.generateUrl({ESArchiveDestroy:"GetUserGroupList", formId: formId}, 'x');
						}else if(treeNode.enlogo == 'destroy'){
							url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList', formId:formId, status:'destroy', cb:'true', ext:'false'});
						}else if(treeNode.enlogo == 'reserve'){
							url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList', formId:formId, status:'reserve', cb:'true', ext:'true'});
						}
						$("#default_tbl").flexOptions({url:url}).flexReload();
						
					}
				}
		},
		nodes : [
    	    {name:'销毁清册',id:1, pId:0, open:true, enlogo:null},
    	    {name:'销毁报告',id:101, pId:1, enlogo:'destroyReport'},
    	    {name:'鉴定授权',id:102, pId:1, enlogo:'identifyAuthorized'},
    	    {name:'销毁清单',id:103, pId:1, enlogo:'destroy'},
    	    {name:'保留清单',id:104, pId:1, enlogo:'reserve'}
    	]
};
//销毁功能树节点结束  //


// 功能对节点操作fnTreeObj //

var _node = {
	init: function (){
		this.selectNode('destroyReport');
		var n = $globalVal.statusNode.enlogo;
		if(n == 'edit'){
			this.rm('reserve'); // 删除保留
			this.rm('identifyAuthorized'); // 删除鉴定授权
		}
	},
	selectNode : function (enlogo){
		var node = $globalVal.fnTreeObj.getNodeByParam('enlogo',enlogo,null); // 默认选中销毁报告
		$globalVal.fnTreeObj.selectNode(node);
	},
	rm: function (enlogo){
		var node = $globalVal.fnTreeObj.getNodeByParam('enlogo',enlogo,null);
		$globalVal.fnTreeObj.removeNode(node);
	},
	add: function (enlogo){
		
	}
	
};

// 功能树节点操作结束 //


// 销毁清册数据列表  //
var DestroyListTbl = {
	init : function (is_show,title){
		$('#rightDiv').html('<table id="Destroy_list_tbl" selectType=""></table>');
		var buttons,title;
		if(is_show=='destroy'){
			buttons = [
				{name: '销毁', bclass:'delete', tooltip:'销毁数据', onpress:this.destroy}
			];
		}else if(is_show == 'edit' || is_show=='identify'){
			buttons = [
				{name: '删除', bclass:'delete', tooltip:'删除销毁单', onpress:this.del}
			];
		}else{
			buttons = [];
		}
		
		if($globalVal.statusNode==undefined){
			title = '鉴定销毁列表';
		}else{
			title = $globalVal.statusNode.name+'状态列表';
		}
		
		
		$("#Destroy_list_tbl").flexigrid({
		  url: false,
		  dataType: 'json',
		  colModel : [
				{display: '<input type="checkbox" id="sinput" />', name : 'cb', width : 24, align: 'center'},
				{display: '查看', name : 'fn', width : 24, align: 'center'},
				{display: '编号', name : 'code', width : 140, align: 'left'},
				{display: '标题', name : 'title', width : 120, align: 'left'},
				{display: '状态', hide: true, name : 'status', width : 50, align: 'center'},
				{display: '发起人', name : 'proposer', width : 100, align: 'center'},
				{display: '发起时间', name : 'starttime', width : 140, align: 'center'},
				{display: '销毁时间', name : 'endtime', width : 140, align: 'center'},
				{display: '销毁人', name : 'destroyperson', width : 100, align: 'center'},
				{display: '销毁数量', name : 'destroynum', width : 60, align: 'center'},
				{hide:true, name : 'userid'},
				{hide:true, name : 'wfid'},
				{hide:true, name : 'formid'},
				{hide:true, name : 'structureid'},
				{hide:true, name : 'oswfformid'}
				],
			buttons : buttons,
			usepager: true,
			title: title,
			useRp: true,
			rp: 20,
			nomsg:"没有数据",
			pagetext: '第',
			outof: '页 /共',
			width: $size.init().tblWidth,
			height: $size.init().tblHeight,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
	},
//	select_archiveType_node : function (){ // 选择档案类型
//		if($globalVal.statusNode==undefined){
//			$.dialog.notice({content:'请选择状态节点',icon:'warning',lock:false,time:2});
//			return;
//		}
//		$globalVal.archiveTypeNode = undefined; // init 文档类型节点
//		
//		// 获得档案类型树
//		$.getJSON(
//			$.appClient.generateUrl({ESArchiveDestroy:"getTree", status:4}, 'x'),
//			function(archiveTypeTree_nodes){
//				$.dialog({
//					title:'选择范围',
//					content:'<div class="ztree" id="archiveType" style="width:260px; height:300px; overflow:auto;"></div>',
//					okVal:'确定',
//					cancelVal:'取消',
//					ok:function (){
//						if($globalVal.archiveTypeNode == undefined){
//							$.dialog.notice({content:'请选择文档类型结点',icon:'warning',time:2});
//							return false; // 不关闭档案选择窗口
//						}
//						
//						$.get( // 新建销毁清册页面
//							$.appClient.generateUrl({ESArchiveDestroy:"create_destroy_list",path:$globalVal.archiveTypeNode.path.replace(/\//g,'-'),dt:encodeURI($globalVal.archiveTypeNode.name)}, 'x'),
//							function(html){
//								$.dialog({
//									title:'销毁清册',
//									id:'_tpl_',
//									content:html,
//									padding:'0',
//									cancelVal:'关闭',
//									cancel:function (){
//										$globalVal.formId = undefined; //init
//									}
//								});
//								
//								// init
//								$('#FORM').show(); // 显示可编辑表单
//								$('#like-title').html($globalVal.statusNode.name+' • 新建销毁报告'); // 动态修改标题
//								$globalVal.fnTreeObj = $.fn.zTree.init($("#functionTree"), functionTree.setting, functionTree.nodes);
//								_node.init();
//								_node.rm('destroy'); // 新建时删除销毁清单
//							}
//						);
//					}, // 显示销毁窗口
//					cancel:true
//				});
//				
//				$.fn.zTree.init($("#archiveType"), archiveTypeTree.setting, archiveTypeTree_nodes); // init文档类型树
//		});
//	},
//	delete_destroy_list : function (){ // 删除销毁清册数据一行或批量
//		if($globalVal.statusNode==undefined){
//			$.dialog.notice({content:'请选择状态节点',icon:'warning',lock:false,time:2});
//			return;
//		}else if(!$('#Destroy_list_tbl input:checked').length){
//			$.dialog.notice({content:'请选择删除数据',icon:'warning',lock:false,time:2});
//			return;
//		}
//		var isDel = true;
//		$('#Destroy_list_tbl input:checked').each(function (){
//			if($(this).attr('process') == 0) 
//			isDel = false;
//		});
//		
//		if(!isDel){
//			$.dialog.notice({content:'删除数据中退回数据，不能删除',icon:'warning',lock:false,time:2});
//			return;
//		}
//		
//		$.dialog({
//			content:'确定删除',
//			icon:'warning',
//			okVal:'确定',
//			cancelVal:'取消',
//			cancel:true,
//			ok:function (){
//				var ids = [];
//				$('#Destroy_list_tbl input:checked').each(function (){
//					ids.push($(this).attr('id'));
//				});
//				
//				$.post(
//					$.appClient.generateUrl({ESArchiveDestroy : "DeleteIdentification"}, 'x'),
//					{ids:ids.join(',')},
//					function (isok){
//						if(isok){
//							
//							$("#Destroy_list_tbl").flexReload();
//							//checkBox.cancelOne($('#sinput'));
//							//$.dialog.notice({content:'删除成功',icon:'succeed',time:2});
//						}else{
//							$.dialog.notice({content:'删除失败',icon:'error',time:2});
//						}
//					}
//				);
//			}
//		});
//	},
//	filter_destroy_list : function (){ // 根据用户筛选条件筛选清册列表
//		if($globalVal.statusNode==undefined){
//			$.dialog.notice({content:'请选择状态节点',icon:'warning',lock:false,time:2});
//			return;
//		}
//		$.get(
//			$.appClient.generateUrl({ESArchiveDestroy : "public_filter"}, 'x'),
//			function (html){
//				$.dialog({
//					title:'筛选',
//					content:html,
//					okVal:'确定',
//					cancelVal:'取消',
//					ok: function (){
//						var relation = compare = key = value = null; // 关系符,比较符,键,值
//						
//						var condition = ['STATUS,equal,'+ $globalVal.statusNode.enlogo +',true'];
//						
//						$('#filter_conditions .filter_condition').each(function (){
//							key = $(this).find('.filter_Field').val();
//							if(key != 'empty'){
//								compare = $(this).find('.filter_Comparison').val();
//								value = $(this).find('.filter_Value').val();
//								relation = $(this).find('.filter_Relation').val();
//								condition.push(key+','+compare+','+value+','+relation);
//							}
//						});
//						
//						if(condition.length < 2) return true; // 用户没有输入任何条件时关闭窗口
//						
//						var url = $.appClient.generateUrl({ESArchiveDestroy:'GetIdentificationList'},'x');
//						$('#Destroy_list_tbl').flexOptions({url:url,query:condition.join('@'), newp: 1}).flexReload();
//					},
//					cancel: true
//				});
//			}
//		);
//		
//	},
//	edit_destroy_list : function (){ // 编辑销毁清单
//		$.post(
//			$.appClient.generateUrl({ESArchiveDestroy : "edit_destroy_list"}, 'x'),
//			{formId: $globalVal.formId, taskFlag: $globalVal.taskFlag},
//			function (html){
//				$.dialog({
//					id:'_tpl_',
//					title:'编辑面版',
//					padding:'0',
//					content:html,
//					cancelVal:'关闭',
//					cancel:function (){
//						$globalVal.taskFlag = $globalVal.taskEvent = false; //init
//						$globalVal.formId = undefined; // init
//					}
//				});
//				$('#FORM').show(); // 只读表单
//				$('#like-title').html($globalVal.statusNode.name+' • 修改销毁报告'); // 动态修改标题
//				$globalVal.fnTreeObj = $.fn.zTree.init($("#functionTree"), functionTree.setting, functionTree.nodes);
//				_node.init();
//			}
//		);
//	},
//	readonly_destroy_list : function (){ // 查看销毁清单
//		var that = this;
//		$.post(
//			$.appClient.generateUrl({ESArchiveDestroy : "readonly_destroy_list"}, 'x'),
//			{formId: $globalVal.formId, taskFlag: $globalVal.taskFlag},
//			function (html){
//				$.dialog({
//					id: '_tpl_',
//					title:'查看面版',
//					padding:'0',
//					content:html,
//					cancelVal:'关闭',
//					cancel:function (){
//						if($globalVal.taskFlag && $globalVal.taskEvent == 'member'){
//							that.close_task(); // 如果是待办过来的数据提示用户结束待办
//							return false; // 不关闭窗口
//						}
//						return true;
//					}
//				});
//				$('#FORM').show(); // 只读表单
//				$('#like-title').html($globalVal.statusNode.name+' • 销毁报告'); // 动态修改标题
//				//if($globalVal.statusNode.enlogo == 'identify' && functionTree.nodes.length<=4) functionTree.nodes.push({name:'保留清单',id:104, pId:1, enlogo:'reserve'});
//				$globalVal.fnTreeObj = $.fn.zTree.init($("#functionTree"), functionTree.setting, functionTree.nodes);
//				_node.init();
//				//if($globalVal.taskFlag == 'destroy'){_node.rm('reserve');} // 销毁流程不显示保留列表
//			}
//		);
//	},
//	close_task : function (){ // 组员在关闭待办时触发
//		$.dialog({
//			content:'待办已处理',
//			icon:'warning',
//			okVal:'确定',
//			cancelVal:'取消',
//			ok:function (){
//				$.get(
//						$.appClient.generateUrl({ESArchiveDestroy: "UpdateMark",formId: $globalVal.formId}, 'x'),
//						function (isok){
//							if(isok){
//								window.location.hash = null; // 清除待办标记(hash锚点值)
//								$globalVal.taskFlag = $globalVal.taskEvent = false; // 清除待办标记
//								$("#Destroy_list_tbl").flexReload(); // 可以不重载
//								$.dialog.list._tpl_.close(); // 关闭窗口
//								$.dialog.notice({content:'成功',icon:'succeed',lock:false,time:2});
//							}else{
//								$.dialog.notice({content:'失败',icon:'error',lock:false,time:2});
//							}
//						}
//					);
//			},
//			cancel: function (){
//				
//				$globalVal.taskFlag = $globalVal.taskEvent = false; //init
//				$.dialog.list._tpl_.close();
//				
//			}
//		});
//	},
//	refresh_destroy_list: function (){
//		var status = $globalVal.statusNode,url=null;
//		if(status == undefined){
//			url = $.appClient.generateUrl({ESArchiveDestroy:'GetIdentificationList', status:'none'},'x');
//		}else{
//			url = $.appClient.generateUrl({ESArchiveDestroy:'GetIdentificationList', status:status.enlogo},'x');
//		}
//		$('#Destroy_list_tbl').flexOptions({url:url, query:'', newp: 1}).flexReload();
//	},
	destroy:function(){
		if(!$('#Destroy_list_tbl input:checked').length){
			$.dialog.notice({content:'请选择销毁数据！',icon:'warning',lock:false,time:3});
			return;
		}
		var wfIds = "";
		//wanghongchen 20140829 传值增加ids
		var ids = "";
		$('#Destroy_list_tbl input:checked').each(function (){
			if($(this).attr('status') != "destroy"){
				$.dialog.notice({content:'待销毁状态数据才能销毁！',icon:'warning',lock:false,time:3});
				return;
			}
			wfIds += $(this).attr('wfid') + ",";
			ids += $(this).attr('id') + ",";
		});
		wfIds = wfIds.substring(0,wfIds.length-1);
		ids = ids.substring(0, ids.length-1);
		$.dialog({
			title:"警告",
			content:"确定销毁？",
			cancel:true,
			okVal:"确定",
			ok:function(){
				$.ajax({
					url:$.appClient.generateUrl({ESArchiveDestroy:'destroy'},'x'),
					type:'post',
					data:{wfIds:wfIds,ids:ids},
					success:function(){
						$.dialog.notice({content:'数据已销毁！',icon:'succeed',time:3});
						$('#Destroy_list_tbl').flexOptions({newp: 1}).flexReload();
					}
				});
			}
		});
	},
	del:function(){
		if(!$('#Destroy_list_tbl input:checked').length){
			$.dialog.notice({content:'请选择删除数据！',icon:'warning',lock:false,time:3});
			return;
		}
		$.dialog({
			title:"警告",
			content:"确定删除？",
			cancel:true,
			okVal:"确定",
			ok:function(){
				var paramStr = "";
				//wanghongchen 20140912 删除时判断销毁单是否已发起流程，发起的不允许删除
				var flag = false;
				var num1 = 0;	//未发起流程的数量
				var num2 = 0;	//已发起流程的数量
				$('#Destroy_list_tbl input:checked').each(function (){
					if($(this).attr('wfid') != -1){
						num2 ++;
						flag = true;
					}else{
						num1 ++;
					}
					paramStr += $(this).attr('id') + "," + $(this).attr('wfid') + "," + $(this).attr('oswfformid') + "|";
				});
				if(flag && num1 == 0){
					$.dialog.notice({content:'所选销毁单均已发起流程，不能删除！',icon:'warning',time:3});
					return;
				}else if(flag && num1 > 0){
					$.dialog.notice({content:'已发起流程的销毁单不能删除，未发起的可正常删除！',icon:'warning',time:3});
				}
				$.ajax({
					url:$.appClient.generateUrl({ESArchiveDestroy:'deleteDestroyForm'},'x'),
					type:'post',
					data:{paramStr:paramStr},
					success:function(){
						$.dialog.notice({content:'删除成功！',icon:'succeed',time:3});
						$('#Destroy_list_tbl').flexOptions({newp: 1}).flexReload();
					}
				});
			}
		});
	}
};
//销毁清册数据列表结束 //

// 保留清单列表  //
var defaultTbl = {
		init:function (){
			var title = null;
			
			var v = {
					snlogo: $globalVal.statusNode.enlogo,
					snname: $globalVal.statusNode.name,
					fnlogo: $globalVal.functionNode.enlogo,
					fnname: $globalVal.functionNode.name,
					formId: $globalVal.formId,
					taskFlag: $globalVal.taskFlag,
					taskEvent: $globalVal.taskEvent
			};
			
			if(v.snlogo == 'edit' && v.formId == undefined && v.fnlogo == 'destroyReport'){
				title = v.snname +' • 新建'+ v.fnname; // 动态修改标题
			}else if(v.snlogo == 'edit' && v.formId && v.fnlogo == 'destroyReport'){
				title = v.snname +' • 修改'+ v.fnname; // 动态修改标题
			}else{
				title = v.snname+' • '+v.fnname; // 动态修改标题
			}
			
			if(v.fnlogo == 'destroyReport'){
				$('#like-title').html(title);
				$('#TBL').hide();
				$('#FORM').show();
			}else{
				$('#FORM').hide();
				$('#TBL').html('<table id="default_tbl"></table>');
				$('#TBL').show();
				var colModel = buttons = hei = null; // init
				if(v.fnlogo == 'identifyAuthorized'){ // 鉴定授权
					colModel = [
						{display: '序号', name : 'linenumber', width : 24, align: 'center'},
						{display: '组长', name : 'radio', width : 40, align: 'center'},
						{display: '姓名', name : 'userName', width : 100, align: 'center'},
						{display: '机构', name : 'orgName', width :100, align: 'center'},
						{display: '职务', name : 'deptPost', width :100, align: 'center'},
						{display: '联系方式', name : 'mobTel', width :100, align: 'center'}
					];
					buttons = false;
					hei = 415;
				}else if(v.fnlogo == 'destroy'){ // 销毁清单
					colModel = [
						{display: '序号', name : 'line', width : 24, sortable : true, align: 'center'},
						{display: '<input type="checkbox" id="sinputB" />', name : 'cb', width : 24, sortable : true, align: 'center'},
						{display: '查看', name : 'see', width : 24, sortable : true, align: 'center'},
						{display: '档号', name : 'code', width : 100, sortable : true, align: 'center'},
						{display: '题名', name : 'title', width : 100, sortable : true, align: 'center'},
						{display: '成文日期', name : 'date', width :100, sortable : true, align: 'center'},
						{display: '归档日期', name : 'createDate', width :100, sortable : true, align: 'center'},
						{display: '责任者', name : 'creator', width :100, sortable : true, align: 'center'},
						{display: '保管期限', name : 'years', width :100, sortable : true, align: 'center'}
					];
					buttons = (v.taskFlag =='identify' || v.taskFlag =='destroy') && v.taskEvent == 'member' ? [{name: '移入保留清单', bclass: 'redo', onpress:this.toReserve},{name: '筛选', bclass: 'filter', onpress:this.filter},{name: '还原', bclass: 'refresh', tooltip:'还原数据', onpress:this.refresh}] : [{name: '筛选', bclass: 'filter', onpress:this.filter},{name: '还原', bclass: 'refresh', tooltip:'还原数据', onpress:this.refresh}];
					hei = 385;
				}else if(v.fnlogo == 'reserve'){ // 保留清单
					colModel = [
					    {display: '序号', name : 'line', width : 24, sortable : true, align: 'center'},
					    {display: '<input type="checkbox" id="sinputB" />', name : 'cb', width : 24, sortable : true, align: 'center'},
						{display: '查看', name : 'see', width : 24, sortable : true, align: 'center'},
						{display: '档号', name : 'code', width : 100, sortable : true, align: 'center'},
						{display: '题名', name : 'title', width : 100, sortable : true, align: 'center'},
						{display: '归档日期', name : 'date', width :100, sortable : true, align: 'center'},
						{display: '成文日期', name : 'createDate', width :100, sortable : true, align: 'center'},
						{display: '责任者', name : 'creator', width :100, sortable : true, align: 'center'},
						{display: '保管期限', name : 'years', width :100, sortable : true, align: 'center'},
						{display: '延长保管期限(年)', name : 'ext_years', width :100, align: 'center'},
						{display: '保留原因', name : 'because', width :100, align: 'center'}
					];
					buttons = (v.taskFlag =='identify' || v.taskFlag =='destroy') && v.taskEvent == 'member' ? [{name: '移入销毁清单', bclass: 'undo', onpress:this.toDestroy},{name: '筛选', bclass: 'filter', onpress:this.filter},{name: '还原', tooltip:'还原数据', bclass: 'refresh', onpress:this.refresh}] : [{name: '筛选', bclass: 'filter', onpress:this.filter},{name: '还原', bclass: 'refresh', tooltip:'还原数据', onpress:this.refresh}];
					hei = 385;
				}
				$("#default_tbl").flexigrid({
					url:false,
					dataType: 'json',
					colModel : colModel,
					buttons : buttons,
					title: title,
					useRp: true,
					usepager: true,
					rp: 20,
					pagetext: '第',
					outof: '页 /共',
					pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
					nomsg:"没有数据",
					width: 670,
					height:hei
				});
			}
		},
		toDestroy : function (){ // 移入销毁清单
			if(!$('#default_tbl tr input:checked').length){
				_validate.alert('请选择移入数据');
				return;
			}
			$.dialog({
				content: '确定移入销毁清单',
				icon: 'warning',
				okVal: '确定',
				cancelVal: '取消',
				ok: function (){ destroyedReport.sendData('destroy');},
				cancel:true
			});
		},
		toReserve : function (){ // 移入保留清单
			var leng = $('#default_tbl tr input:checked').length;
			if(!leng){
				_validate.alert('请选择移入数据');
				return;
			}
			
			var htm = ['<div class="write_reason">'];
				htm.push('<div class="items"><h2>延长保管期限(1-99年)</h2><p><input type="text" id="Years" /></p></div>');
				htm.push('<div class="items"> <h2>延长保管说明(10-200字符)</h2> <p><textarea id="Reason"></textarea></p></div>');
				htm.push('</div>');
			
			$.dialog({
				title: '请输入保管期限和保留原因 (共 '+ leng +'条)',
				content: htm.join(''),
				okVal: '确定',
				cancelVal: '取消',
				ok:function (){
					
					
					if(!_validate.yearsExt('Years')){
						return false;
					}
					if(!_validate.yearsExtDesc('Reason')){
						return false;
					}
										
					destroyedReport.sendData('reserve','true'); // true为是否显示扩展字段
				},
				cancel:true
			});
			
		},
		fileView : function (path){
			$.ajax({
				url:$.appClient.generateUrl({ESIdentify:'isHasFileReadRight',path:path},'x'),
				cache:false,
				success:function(isHas){
					if(isHas === 'false'){
						$.dialog.notice({content: '您对当前数据下的所有原文都没有文件浏览权限，不能进行此操作！', time: 5, icon: 'warning', lock: false});
						return ;
					}
					var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path},'x');
					$.ajax({
						url:url,
						cache:false,
						success:function(data){
							$.dialog({
								id:'artFilesPanel',
								title:'浏览电子文件',
								width: '960px',
								fixed:false,
								resize: false,
								padding: 0,
								top: '10px',
								content:data
							});
						}
					});
				}
			});
		},
		filter: function (){
			
			$.get(
				$.appClient.generateUrl({ESArchiveDestroy:"filter_archive"},'x'),
				function(html){
					$.dialog({
						title:'筛选',
						content:html,
						okVal:'确定',
						cancelVal:'取消',
						ok: function (){
							var relation = compare = key = value = null; // 关系符,比较符,键,值
							var formId = $('#formId').val();
							var status = $globalVal.functionNode.enlogo;
							var condition = ['IDENTIFICATION_ID,equal,'+formId+',true','STATUS,equal,'+status+',true'];
							$('#filter_conditions .filter_condition').each(function (){
								key = $(this).find('.filter_Field').val();
								if(key != 'empty'){
									compare = $(this).find('.filter_Comparison').val();
									value = $(this).find('.filter_Value').val();
									relation = $(this).find('.filter_Relation').val();
									condition.push(key+','+compare+','+value+','+relation);
								}
							});
							
							if(condition.length<3) return true; // 用户没有输入任何条件时关闭窗口
							
							var url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList', filter:true, cb:'true', ext:'false'},'x');
							$('#default_tbl').flexOptions({url:url, query:condition.join('@'), newp: 1}).flexReload();
						},
						cancel: true
					});
				}
			);
		},
		refresh : function (){
			var status = $globalVal.functionNode.enlogo, url = null;
			var formId = $('#formId').val();
			if(status == 'destroy'){
				url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList', formId:formId, status:status, cb:'true', ext:'false'},'x');
			}else{
				url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList', formId:formId, status:status, cb:'true', ext:'false'},'x');
			}
			$('#default_tbl').flexOptions({url:url, query: '', newp: 1}).flexReload();
		}
};
// 保留清单列表结束  //


// 初始化销毁清册窗口界面 //
var destroyedReport = {
		    
		save : function (startProcess){// 保存新建销毁清册
			var that = this;
			var allowed = true;
			$('#FORM input[type!="hidden"],#FORM textarea').each(function (){
				if(!this.value){
					this.style.border = '1px solid #f00';
					allowed = false;
				}
			});
			if(!allowed) return;
			
			var url = null,alert = null;
			if(!$('#formId').val()){
				url = $.appClient.generateUrl({ESArchiveDestroy:"SaveOrUpdateIdentification", approveUserId:$globalVal.approveUserId, path: $globalVal.archiveTypeNode.path.replace(/\//g,'-'), status: $globalVal.statusNode.enlogo, startProcess: startProcess},'x');
				alert = '保存';
			}else if($('#formId').attr('id')){
				url = $.appClient.generateUrl({ESArchiveDestroy:"SaveOrUpdateIdentification", approveUserId:$globalVal.approveUserId, startProcess: startProcess},'x');
				alert = '修改';
			}
			
			$.post(
				url,
				$('#FORM').serialize(),
				function (msg){
					// msg = 'saveErr';
					if(msg == 'startProcessOk'){
						
						$.dialog.list._tpl_.close();
						
						$globalVal.formId = undefined; // init
						// 提交流程跳至鉴定状态且刷新鉴定状态数据
						DestroyListTbl.init('none');
						var url = $.appClient.generateUrl({ESArchiveDestroy : "GetIdentificationList", status:'identify'}, 'x');
						$("#Destroy_list_tbl").flexOptions({url:url}).flexReload();
						var node = $globalVal.statusTreeObj.getNodeByParam('enlogo','identify',null);
						$globalVal.statusTreeObj.selectNode(node);
						var nodes = $globalVal.statusTreeObj.getSelectedNodes();
						$globalVal.statusNode = nodes[0];
						$.dialog.notice({content:'提交申请成功',icon:'succeed',time:2});
						return;
					}else if(msg == 'saveOk'){
						
						if($globalVal.taskFlag == 'identify' && $globalVal.taskEvent == 'back'){ // 鉴定时
							that.aginSubmit('identify');
							return;
						}
						
						$globalVal.formId = undefined; // init
						$.dialog.list._tpl_.close();
						$("#Destroy_list_tbl").flexReload();
						//$.dialog.notice({content:alert+'成功',icon:'succeed',time:2});
						return;
						
					}else if(msg == 'startProcessErr'){
						
						$.dialog.notice({content:'提交申请失败',icon:'error',time:2});
						return;
					}else if(msg == 'saveErr'){
						
						$.dialog.notice({content:alert+'失败',icon:'error',time:2});
						return;
					}
				}
			);
		},
		startDestroyProcess : function (){
			$.post(
				$.appClient.generateUrl({ESArchiveDestroy:"StartProcessOfDestroy"},'x'),
				{formId: $globalVal.formId,approveUserId:$globalVal.approveUserId},
				function (isok){
					if(isok){
						var url = $.appClient.generateUrl({ESArchiveDestroy : "GetIdentificationList", status:'destroy'}, 'x');
						$("#Destroy_list_tbl").flexOptions({url:url}).flexReload();
						$.dialog.list._tpl_.close();
						$.dialog.notice({content:'提交申请成功',icon:'succeed',time:2});
					}else{
						$.dialog.notice({content:'提交申请失败',icon:'error',time:2});
					}
				}
			);
		},
		sendData : function (status,having){
			var ids = [];
			$('#default_tbl tr').each(function (){
				
				if($(this).find('input').attr('checked')) ids.push($(this).find('input').val());
			});
			var status = $globalVal.functionNode.enlogo == 'destroy' ? 'reserve' : 'destroy';
			
			var data = {ids: ids.join('@'), status: status, formId: document.getElementById('formId').value};
			
			if(having == 'true'){
				data.reason = $('#Reason').val();
				data.extendedRetentionPeriod = $('#Years').val();
			}
			
			$.post(
				$.appClient.generateUrl({ESArchiveDestroy:"UpdateDetailStatus"},'x'),
				data,
				function (isok){
					alert = status == 'destroy' ? '销毁' : '保留';
					if(isok){
						$('#default_tbl').flexReload();
						// $.dialog.notice({content: '移入'+alert+'清册成功', time: 2, lock:false, icon: 'succeed'});
					}else{
						$.dialog.notice({content: '移入'+alert+'清册失败', time: 2, lock:false, icon: 'error'});
					}
				}
			);
			
		},
		aginSubmit: function (whoProcess){
			
			$.post(
				$.appClient.generateUrl({ESCollaborative:"StartProcessAgain"},'x'),
				{
					taskId: $globalVal.taskId,
					workId: $globalVal.workId,
					formId: $globalVal.formId,
					agree: 'Approve',
					difference: whoProcess,
					approveUserId:$globalVal.approveUserId
				},
				function (isok){
					if(isok){
						
						var stree = $globalVal.statusTreeObj;
						var node = stree.getNodeByParam('enlogo',whoProcess,null); // 获取状态树鉴定状态
						stree.selectNode(node); // 选中状态树鉴定状态
						var nodes = stree.getSelectedNodes(); // 获取选中节点数据
						$globalVal.statusNode = nodes[0]; // 集合中第一个
						
						$.dialog.list._tpl_.close();
						
						$globalVal.taskId = $globalVal.workId = $globalVal.formId = undefined; // init
						$globalVal.taskFlag = $globalVal.taskEvent = false; // init
						window.location.hash = null;
						
						var url = $.appClient.generateUrl({ESArchiveDestroy : "GetIdentificationList", status: whoProcess}, 'x')
						$("#Destroy_list_tbl").flexOptions({url:url}).flexReload();
						
						$.dialog.notice({content:'提交成功',icon:'succeed',time:2});
					}else{
						$.dialog.list._tpl_.close();
						$("#Destroy_list_tbl").flexReload();
						$.dialog.notice({content:'提交失败',icon:'error',time:2});
					}
				}
			);
		}
};		

// 初始化销毁清册窗口界面结束 //

//-------------------- 选择用户 -------------------//
var _userTree = {
	setting: {
		view: {
			dblClickExpand: true,
			showLine: false
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		async: {
			enable:true,
			type:'get',
			url:$.appClient.generateUrl({ESIdentify:'GetOrgList'},'x'),
			autoParam:["id=oid"]
		},
		callback: {
			onClick: function (event, nodeId, treeNode){
				
				var url = $.appClient.generateUrl({ESArchiveDestroy:'FindUserListByOrgid',oid:treeNode.id},'x');
				$("#user_list").flexOptions({url:url}).flexReload();
			}
		}
	}
};


var _selectUser = {
	
	init : function (){
		$.getJSON(
			$.appClient.generateUrl({ESIdentify:'GetOrg'},'x'),
			function (nodes){
				var html = ['<div class="select_user_box">'];
				html.push('<div class="ztree org_tree" id="org_tree"></div>');
				html.push('<div class="user_list"><table id="user_list"></table></div>');
				html.push('</div>');
				
				//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
				$.dialog({
					id:'_selectUser_',
					title:'选择鉴定人员',
					content:html.join(''),
					padding:'0',
					cancelVal:'关闭',
					cancel:true
				});
				//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$//
				
				$.fn.zTree.init($('#org_tree'),_userTree.setting,nodes);
				
				// 用户列表
				$("#user_list").flexigrid({
					url:false,
					dataType: 'json',
					colModel : [
						{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
						{display: '选择', name : 'radio', width : 40, align: 'center'},
						{display: '姓名', name : 'userName', width : 80, align: 'center'},
						{display: '部门', name : 'orgName', width : 280, align: 'center'},
						{display: '职务', name : 'deptPost', width : 280, align: 'center'},
						{display: '联系方式', name : 'mobTel', width : 280,align: 'center'}
					],
					usepager: true,
					nomsg: '没有数据',
					useRp:true,
					width:640,
					height:440
				});
			},
			'json'
		);
		
	},
	select : function (that){
	
		var value = that.find('input[type="radio"]').val();
		var info = value.split('@');
		//var uid = info[0]; // 英文名
		var une = info[1]; // 中文名
		$globalVal.container.parent().find('input[type="text"]').val(une);
		//$globalVal.container.parent().find('input[type="hidden"]').val(uid);
		
	}
};

// -------------------- 选择用户结束 -------------------//

/*
 * 复选框全选,取消全选,选中一个
 * checkBox.selectOne(this);
 * checkBox.selectAll(this,$('#Destroy_list_tbl'));
 * checkBox.removeSelect([$('#sinput')]);
 */
var checkBox = {
	selectOne : function (cbObj){ // 单选|取消单选
		if(cbObj.attr('checked')=='checked'){
			cbObj.closest('tr').addClass('trSelected');
		}else{
			cbObj.closest('tr').removeClass('trSelected');
		}
	},
	selectAll : function (cbObj,tblId){ // 全选|取消全选
		if(cbObj.attr('checked')=='checked'){
			cbObj.attr('checked','checked');
			tblId.find('tr').addClass('trSelected');
			tblId.find('tr input[type="checkbox"]').attr('checked','checked');
		}else{
			cbObj.removeAttr('checked');
			tblId.find('tr').removeClass('trSelected');
			tblId.find('tr input[type="checkbox"]').removeAttr('checked');
		}
	},
	cancelOne : function (cbObj){ // $('#id=4')
		
		cbObj.removeAttr('checked');
	},
	cancelAll : function (tblId){ // $('$tbl')
		var inputs = tblId.find('input[checked="checked"]');
		var l = inputs.length;
		for(var i=0; i<l; i++)
		{
		
			inputs.eq(i).removeAttr('checked');
		
		}
	}
};

// 复选框全选,取消全选,选中一个结束  //

// 单选按钮 //

var _radio = {
	
	checked : function (that){
		that.find('input[type="radio"]').attr('checked','checked');
	},
	checkedr : function (that){ // 只选择radio控件
		that.find('input[type="radio"]').attr('checked','checked');
		that.find('input[type="checkbox"]').removeAttr('checked');
	}
	
};

// 单选按钮 //

//---------------------------华丽的分隔线---------------------------------------//

$('.save').live('click',function (){
	var id = this.id;
	if(id == 'newSubmit' || id == 'modifySubmit'){ // 编辑状态新建,修改保存并提交销毁清单
		destroyedReport.save('close');
	}
});
//表单新建,修改提交流程
$('.submit').live('click',function (){
	var id = this.id;
	if(id == 'modifyProcess'){
		$.ajax({
			url:$.appClient.generateUrl({ESWorkflow:"getWfList"},'x'),
			type:'post',
			data:{relationBusiness:'destroy'},
			dataType:'json',
			success:function(rs){
				if(rs.size>0){
					var formId = rs.data[0].formid;
					formStartHandle.toFormStartPage(formId,'ESArchiveDestroy');
				}else{
					$.dialog.notice({content:'没有销毁流程！',icon:'warning',time:3});
				}
			}
		});
	}
	 
});

// 编辑状态-编辑按钮
$('.edit_see').live('click',function (){
	$globalVal.formId = this.id;
	DestroyListTbl.edit_destroy_list();
});

// 鉴定状态-查看按钮
$('.identify_see,.destroy_see,.destroyed_see').live('click',function (){
	$globalVal.formId = this.id;
	DestroyListTbl.readonly_destroy_list();
});

// 显示电子档原文
$('.link').live('click',function (){
	defaultTbl.fileView(this.id);
});

// 选择用户窗口
$('#fuzr,#jianxr').live('click', function (){
	_selectUser.init();
	$globalVal.container = $(this);
});

// 选择时间
$('#E_DESTROY_DATE').live('click',function (){
	WdatePicker({dateFmt:'yyyy-MM-dd'});
});

// 用户中文名写入输入框#单击Radio
$('#user_list tr input[type="radio"]').live('click',function (){
	_selectUser.select($(this).closest('tr'));
	$.dialog.list._selectUser_.close();
});

// 用户中文名写入输入框#双击某行
$('#user_list tr').live('dblclick',function (){
	_selectUser.select($(this));
	$.dialog.list._selectUser_.close();
});


$('#Years').live('blur', function (){
	_validate.yearsExt('Years');
});
$('#Reason').live('blur', function (){
	_validate.yearsExtDesc('Reason');
});

$('#FORM input, #FORM textarea').live('blur',function (){
	if(this.value){
		this.style.border = '1px solid #7F9DB9';
	}else{
		this.style.border = '1px solid #f00';
	}
});

//---------------------------华丽的分隔线---------------------------------------//


//销毁报告按钮样式
$('.buttons span').live('mouseover',function (){
	
	$(this).parent().parent().addClass('extbutton');
	$(this).parent().addClass('div');
	
});
$('.buttons span').live('mouseout',function (){
	
	$(this).parent().parent().removeClass('extbutton');
	$(this).parent().removeClass('div');
	
});

//全选
$('#sinput').live('click',function (){
	checkBox.selectAll($(this),$('#Destroy_list_tbl'));
});
$('#sinputB').live('click',function (){
	checkBox.selectAll($(this),$('#default_tbl'));
});
//单选
$('input[name="inputs"]').live('click',function (){
	checkBox.selectOne($(this));
});

var _validate = {
	alert : function (prompt){
		$.dialog({
			content: prompt,
			 time: 2,
			 lock: false,
			 icon: 'warning'
		});
	},
	yearsExt : function (id){ // 验证延长保管期限
		var dom  = document.getElementById(id);
		var regExp = new RegExp("^[1-9]{1}[0-9]?$"); // 1-99数字
		if(regExp.exec(dom.value)){
			dom.style.border = '1px solid gray';
			return true;
		}else{
			dom.style.border = '1px solid #f00';			
			return false;
		}
	},
	yearsExtDesc : function (id){
		var dom  = document.getElementById(id);
		var domV = dom.value;
		if(domV.length <10 || domV.length>200){
			dom.style.border = '1px solid #f00';
			return false;
		}else{
			dom.style.border = '1px solid gray';			
			return true;
		}
	}
};


var _tasks = {
		running: function (){
			var hashStr = window.location.hash;
			if($globalVal.taskFlag == 'identify' || $globalVal.taskFlag == 'destroy'){ // 各节点退回
				
				var hash = hashStr.split('|'); // ['#workId,'taskId','formId']
				
				if($globalVal.taskSize == 3 && $globalVal.taskEvent == 'back'){ // 退回待办
					$globalVal.workId = hash[0].substring(1);
					$globalVal.taskId = hash[1];
					$globalVal.formId = hash[2];
					
					var status = $globalVal.taskFlag,Status = null;
					
					if(status == 'identify'){ // 鉴定退回 
						Status = 'edit';
						DestroyListTbl.init('display'); // 'display'显示"新建销毁清册"按钮
					}else{ // 销毁退回
						Status = 'destroy';
						DestroyListTbl.init('none');
					}
					
					var stree = $globalVal.statusTreeObj;
					var node = stree.getNodeByParam('enlogo',Status,null); // 获取状态树鉴定状态
					stree.selectNode(node); // 选中状态树鉴定状态
					var nodes = stree.getSelectedNodes(); // 获取选中节点数据
					$globalVal.statusNode = nodes[0]; // 集合中第一个
					
					status == 'identify' ? DestroyListTbl.edit_destroy_list() : DestroyListTbl.readonly_destroy_list();
					
					return;
				}else if($globalVal.taskSize == 1 && $globalVal.taskEvent == 'member'){ // 组员待办
					
					$globalVal.formId = hash[0].substring(1);
					
					var stree = $globalVal.statusTreeObj;
					var node = stree.getNodeByParam('enlogo',$globalVal.taskFlag,null); // 获取状态树鉴定状态
					stree.selectNode(node); // 选中状态树鉴定状态
					var nodes = stree.getSelectedNodes(); // 获取选中节点数据
					$globalVal.statusNode = nodes[0]; // 集合中第一个
					
					DestroyListTbl.readonly_destroy_list();
					
				}
				
			}
		}
};

//$(document).on('click', '.destroyopens', function (){
//	var	userFormNo = this.getAttribute('userFormNo');
//	var	id = this.getAttribute('oswfformid');
//	var	userId = this.getAttribute('userid');
//	var	formId = this.getAttribute('formid');
//	var	wfId = this.getAttribute('wfid');
//	var	stepId = this.getAttribute('stepid');
//	var title = this.getAttribute('title');
//	var selectType = $globalVal.statusNode.enlogo;
//	if (selectType == 'edit') {//待发
//		$("#Destroy_list_tbl").attr("selectType","edit");
//		collaborativeHandle.toSendFormPage(id,formId,wfId,userFormNo);
//	} else if (selectType == 'destroy' || selectType == 'destroyed' || selectType == 'reserve') {//已办
//		$("#Destroy_list_tbl").attr("selectType","destroy");
//		collaborativeHandle.toHaveTodoFormPage(formId,wfId,stepId,'1',title,userFormNo);
//	} else if (selectType == 'identify') {//待办
////		$("#Destroy_list_tbl").attr("selectType","identify");
////		formApprovalHandle.approvalForm(userFormNo, wfId, stepId + "_0", formId);
//		/**已办流程允许查看表单**/
//		$.ajax({
//			type:'POST',
//    		url:$.appClient.generateUrl({ESFormStart : 'wfIsApprovaled'}, 'x'),
//    		data:{formId:formId,wfId:wfId,stepId:stepId},
//    		success:function(res){       
//    			var json = eval('(' + res + ')');   
//    			var state = json.state;
//    			if(state=='over'){
//    				$("#Destroy_list_tbl").attr("selectType","destroy");
//    				collaborativeHandle.toHaveTodoFormPage(formId,wfId,stepId,'1',title,userFormNo);
//    			}else{
//    				$("#Destroy_list_tbl").attr("selectType","identify");
//    				formApprovalHandle.approvalForm(userFormNo, wfId, stepId + "_0", formId);
//    			}
//    		}
//		});
//	}
//});


$(document).on('click', '.destroyopens', function (){
	var	dataId = this.getAttribute('oswfformid');
	var	formId = this.getAttribute('formid');
	var	wfId = this.getAttribute('wfid');
	$.dialog({
		title:"销毁清单",
		padding:0,
		width:660,
		height:400,
		content:"<table id='borrowDetails'></table>"
	});
	$("#borrowDetails").flexigrid({
		url: $.appClient.generateUrl({ ESCollaborative: 'getSavedWfDataList', dataId: dataId, formId: formId, wfId: wfId},'x'),
		dataType : 'json',
		colModel : [
		            {display: '序号', name : 'num', width : 60, align: 'center'},
		            {display: '查看', name : 'handle', width : 60, align: 'center'},
		            {display: '题名', name : 'title', width : 504, align: 'left'},
		            {display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
		],
		singleSelect:true,
		usepager : true,
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width : 660,
		height : 400,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
});

$(document).ready(function(){
	$("#estabs").esTabs("open", {title:"鉴定销毁", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "鉴定销毁");
	
	// 设置树和表格所在DIV样式
	$('#leftDiv').css({width:($size.init().leftWidth-10)+'px',height:($size.init().tblHeight+114)+'px'}).css("margin-right",10);
	$('#rightDiv').css({width:$size.init().rightWidth+'px',height:$size.init().rightHeight+'px'});
	
	// 初始化状态树对象
	if($.fn.zTree.init($('#statusTree'), statusTree.setting, statusTree.nodes)){ // 初始化状态树节点
		$globalVal.statusTreeObj = $.fn.zTree.getZTreeObj('statusTree');
		DestroyListTbl.init('none'); // 初始化列表
		//_tasks.destroy(); // 销毁模块待办过来的数据
		_tasks.running();
	}
	
});