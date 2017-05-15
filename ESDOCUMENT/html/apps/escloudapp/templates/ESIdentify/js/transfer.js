
//
var __times;
var __inputObj;
var __id;
var __hasChild;
var __nodeId;
var accCol,accButton;
if(archiveType === 'accounting'){
	
	accCol = [
		{display: '序号', name: 'linenumber', width: 40, align: 'center'}, 
		{display: '<input type="checkbox" id="sinputA">', name: 'checkbox', width: 40, align: 'center'},
		{display: '操作', name: 'showmes', width: 40, align: 'center'},
		{display: '移交人', name: 'person', width: 80, sortable : true, align: 'center'},
		{display: '移交日期', name: 'transferTimes', width : 80, sortable : true, align: 'center'},
		{display: '会计年度', name: 'startTime', metadata:'startTime',width: 80, sortable: true, align: 'center'},
		{display: '会计期间', name: 'endTime', metadata:'endTime',width: 80, sortable: true, align: 'center'},
		{display: '移交部门', name: 'unit', width: 100, sortable: true, align: 'center'},
		{display: '档案类型', name: 'type', width: 100, sortable: true, align: 'center',metadata:'type'},
		{display: '文件种类', name : 'documentType', width : 150, sortable : true, align: 'center'},
		{display: '移交数量', name: 'numbers', width: 100, sortable: true, align: 'center'},
		{display: '备注', name: 'remark', width: 150, sortable: true, align: 'center'},
		{display: '入库状态', name: 'isTransfer', width: 85, sortable: true, align: 'center'}
	];
	
	accButton = [
			{name: '新建', bclass: 'add',onpress: createTransferList},
			{name: '删除', bclass: 'delete',onpress: accDel},
			{name: '筛选', bclass: 'filter',onpress: public_filter},
			{name: '目录报表', bclass: 'report',onpress: transfereports},
			{name: '移入档案库', bclass: 'store',onpress: moveStore}
		];
}else{
	accCol = [
	   		{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
	   		{display: '<input type="checkbox" id="sinputA">', name : 'checkbox', width : 40, align: 'center'},
	   		{display: '操作', name : 'showmes', width : 40, align: 'center'},
	   		{display: '移交人', name : 'person', width : 80, sortable : true, align: 'center'},
	   		{display: '移交日期', name : 'transferTimes', width : 80, sortable : true, align: 'center'},
	   		{display: '移交开始日期', name : 'startTime', metadata:'startTime',width : 80, sortable : true, align: 'center'},
	   		{display: '移交结束日期', name : 'endTime', metadata:'endTime',width : 80, sortable : true, align: 'center'},
	   		{display: '移交部门', name : 'unit', width : 100, sortable : true, align: 'center'},
	   		{display: '档案类型', name : 'type', width : 100, sortable : true, align: 'center',metadata:'type'},
	   		{display: '文件种类', name : 'documentType', width : 150, sortable : true, align: 'center'},
	   		{display: '移交数量', name : 'numbers', width : 100, sortable : true, align: 'center'},
	   		{display: '备注', name : 'remark', width : 150, sortable : true, align: 'center'}
	   	];
	   	
	accButton = [
	   			{name: '新建', bclass: 'add',onpress:createTransferList},
	   			{name: '删除', bclass: 'delete',onpress:transferDel},
	   			{name: '筛选', bclass: 'filter',onpress:public_filter},
	   			{name: '目录报表', bclass: 'report',onpress:transfereports}
	   		];
}

// 移入档案库(会计)
function moveStore(){
	
	var inputs = $('#transfer_list input[name="inputsA"]:checked'),leng = inputs.length,id = [],isTransfer = [];
	
		for(var i=0; i<leng; i++){
			
			if(inputs[i].getAttribute('istransfer') == 0){
				
				id.push(inputs[i].id);
				
			}else{
				
				isTransfer.push(inputs[i].id);
				
			}

		}
		
		if(!id.length && isTransfer.length){
			
			$.dialog.notice({content: '选择的数据已移交', time: 2, icon: 'warning',lock:false});
			return;
			
		}
		
		if(!id.length){
			$.dialog.notice({content: '请选择数据', time: 2, icon: 'warning',lock:false});
			return;
		}
		
		if(id.length && isTransfer.length){
			$.dialog({
				content: '数据中存在已入库清册，是否移交清册？（系统自动过滤已入库清册）',
				icon: 'warning',
				ok: exec,
				cancel: true,
				okVal: '确定',
				cancelVal: '取消'
			});
			return;
		}
		
		$.dialog({
			content: '是否移交清册？',
			icon: 'warning',
			ok: exec,
			cancel: true,
			okVal: '确定',
			cancelVal: '取消'
		});
		//modify at 2013-10-11 by niyang
		function exec (){
			$.post(
					$.appClient.generateUrl({ESIdentify:'setBusiModelForBox'},'x'),
					{data: {transferId: id, path: nodePath, busiModelId: '3'}},
					function (isok){
						if(isok['flag']=='true'){
							$("#transfer_list,#flexme").flexReload();
							$.dialog.notice({content: '移交成功', time: 2, icon: 'succeed',lock:false});
						}else{
							$.dialog.notice({content: isok['msg'], time: 3, icon: 'error',lock:false});
						}
						
					}
				);
		}
		
}

// 删除移交清单(会计)
function accDel(){
	
	var inputs = $('#transfer_list input[name="inputsA"]:checked'),leng = inputs.length,id = [],isTransfer = [];
	
		for(var i=0; i<leng; i++){
			
			if(inputs[i].getAttribute('istransfer') == 0){
				
				id.push(inputs[i].id);
				
			}else{
				
				isTransfer.push(inputs[i].id);
				
			}

		}
		
		if(!id.length && isTransfer.length){
			
			$.dialog.notice({content: '选择的数据已移交，不能删除！', time: 2, icon: 'warning',lock:false});
			return;
			
		}
		
		if(!id.length){
			$.dialog.notice({content: '请选择数据！', time: 2, icon: 'warning',lock:false});
			return;
		}
		
		if(id.length && isTransfer.length){
			$.dialog({
				content: '数据中存在已入库清册，是否删除移交清册？（系统自动过滤已入库清册）',
				icon: 'warning',
				ok: exec,
				cancel: true,
				okVal: '确定',
				cancelVal: '取消'
			});
			return;
		}
		
		$.dialog({
			content: '是否删除移交清册？',
			icon: 'warning',
			ok: exec,
			cancel: true,
			okVal: '确定',
			cancelVal: '取消'
		});
		
		function exec (){
			$.post(
				$.appClient.generateUrl({ESIdentify:'DeleteTransfer'},'x'),
				{path: nodePath, formId: id},
				function (map){
					
					if(map.success){
						map.refresh == 'true' ? getTransferTree() : '';
						$('#transfer_list').flexReload();
					}else{
						//删除失败
						$.dialog.notice({ lock:false, content:'删除失败!', icon:'error', time:2});
					}
				},
				'json'
			);
		}
		
} // 删除移交清单(会计)结束

//根据用户选择日期列出相应数据@方吉祥
$("#transfer_list").flexigrid({
	url:false,
	dataType: 'json',
	colModel : accCol,
	buttons : accButton,
	usepager: true,
	title: '移交清册',
	nomsg: '没有数据',
	showTableToggleBtn: false,
	useRp: true,
	width: width,
	height:height
});
// 移入档案库

//获取tree
function getTransferTree(rf)
{
	// 获取移交清册树@方吉祥
	var setting = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick: function (e,treeId, treeNode) {
					var zTree = $.fn.zTree.getZTreeObj("transfertree");
					zTree.expandNode(treeNode);
					params=treeNode.id;
					nodeId = treeNode.id;
					
					if(!treeNode.pId){
						return false;
					}
					//alert(treeNode.id);
					// status文件鉴定模块
					var url=$.appClient.generateUrl({ESIdentify:'GetTransferList',businessid:status,strucid:strucid,params:params},'x');
					$('#transfer_list').flexOptions({url:url}).flexReload();
					if(treeNode.pId == 1){
						$("#transfer .mDiv .ftitle").html(treeNode.name+' • 移交清册');
					}else if(treeNode.pId.length == 4){
						$("#transfer .mDiv .ftitle").html(treeNode.pId+'年 - '+treeNode.name+' • 移交清册');
					}
					//alert(nodePath);
				}
			},
			async: {
				enable: true
			}
			
	};
	$.post(
		$.appClient.generateUrl({ESIdentify:'GetTransferTree',nodePath:nodePath},'x'),
		function (nodes){
			$.fn.zTree.init($("#transfertree"), setting, nodes);
			if(rf){
				var year = __times.substring(0,4);		//2012-12-12 -> 2012
				var date = __times.substring(0,7);		//2012-12-12 -> 2012-12
				
				var zTree = $.fn.zTree.getZTreeObj("transfertree");
				var PNode = zTree.getNodeByParam('id',year,null);
				var node = zTree.getNodeByParam('id',date,PNode);
				zTree.selectNode(node);	
			}
		},
		'json'
	);
}

getTransferTree();
// 新建移交清单@方吉祥
function createTransferList()
{
	$.post(
		$.appClient.generateUrl({ESIdentify:'add_transfer_list'},'x'),
		{type: archiveType, path: nodePath},
		function (html){
			$.dialog({
				title:'新建移交清单',
				fixed:true,
				content:html,
				okVal:'保存',
			    ok:savetransfer,
			    cancelVal: '关闭',
			    cancel: true
			});
			public_prompt('NewTransferData','public_prompt');	// 在 #NewTransferData 标签里追加一个 #public_prompt DIV
		}
	);
}


// 添加时间插件@方吉祥
$('#times').live('click',function (){WdatePicker({dateFmt:'yyyy-MM-dd'});});


// 新建移交清册单表单验证
$('#NewTransferData textarea[name="remark"]').live('focus',function (){$('#public_prompt').html('可以为空,允许输入25个字符长度');});

/*
$('#NewTransferData input[name="numbers"]').live('focus',function (){$('#public_prompt').html('允许输入数字,6个字符长度');});
$('#NewTransferData input[name="numbers"]').live('keyup',function (){
	
	var transferNumber = $('#NewTransferData input[name="numbers"]').val();

	if(is_number(transferNumber)){
		$('#public_prompt').html('');
		$(this).css({'border':'1px solid #7F9DB9'});
	}else{
		$('#public_prompt').html('输入错误');
		$(this).css({'border':'1px solid #f00'});
	}
	
});
*/
// 
$('#NewTransferData textarea[name="remark"]').live('keyup',function (){
	
	var transfeRemark = $('#NewTransferData textarea[name="remark"]').val();

	if(transfeRemark.length >= 25){
		$('#public_prompt').html('输入错误');
		$(this).css({'border':'1px solid #f00'});
	}else{
		$('#public_prompt').html('');
		$(this).css({'border':'1px solid #7F9DB9'});
	}
});


// 添加验证提示框
function public_prompt(PHTMLTAGID,CHTMLTAGID)
{
	//{'pid':'pid','aid':'aid','width':'','height':'','top':'top','left':'0','defaultValue':'defaultValue'}
	//alert();
	PHTMLTAGID = '#'+PHTMLTAGID;	// 父标签ID
	
	//if(PHTMLTAGID.length < 0){
		$(PHTMLTAGID).css({'position':'relative'});
		var prompt_html = "<div id='"+CHTMLTAGID+"' style='width:100%; height:20px; line-height:20px; text-align:center; font-size:12px; color:#e55; position:absolute; left:0; top:-20px;'></div>";
		$(prompt_html).appendTo(PHTMLTAGID);
	//}
}

function is_number(num){ var rule = /^\d{1,9}$/g; return rule.exec(num) ? true : false;}

// 保存移交清单@方吉祥
function savetransfer()
{
	__times = $('#times').val();
	var transferNumber = $('#NewTransferData input[name="numbers"]');
	var transfeRemark = $('#NewTransferData textarea[name="remark"]');
	//alert(transferNumber.val()); return false; &&   123
	
	/*
	if(!is_number(transferNumber.val())){
		
		transferNumber.css({'border':'1px solid #f00'});
		$('#public_prompt').html('输入错误');
		return false;
		
	}
	*/
	
	// 26长度为
	if(transfeRemark.val().length >26){
		transfeRemark.css({'border':'1px solid #f00'});
		$('#public_prompt').html('输入错误');
		return false;
	}
	
	var checkup = '审批中';
	// 移交部门|移交人|移交日期|档案类型|移交数量(卷)|移交数量(件)|备注|移交开始日期|移交结束日期|状态|状态
	var params = $('#NewTransferData').serialize();
	params += '&checkup='+checkup;
	//alert(params);
	// 节点
	$.ajax({
		type:'post',
		url:$.appClient.generateUrl({ESIdentify:'SaveTransfer',nodePath:nodePath},'x'),
		data:params,
		dataType:'json',
		success:function(result){
			if(result.succeed === 'true'){
				//保存成功
				$.dialog.notice({
					width:120,
					title:'操作提示',
					lock:false,
					content:'添加成功!',
					icon:'succeed',
					time:2
				});
				
				// 
				if(result.refresh == 'true'){
					getTransferTree(true);
				}
				
				var year = __times.substring(0,4);		//2012-12-12 -> 2012
				var date = __times.substring(0,7);		//2012-12-12 -> 2012-12
				if(result.refresh == 'false'){
					
					var zTree = $.fn.zTree.getZTreeObj("transfertree");
					var PNode = zTree.getNodeByParam('id',year,null);
					var node = zTree.getNodeByParam('id',date,PNode);
					zTree.selectNode(node);
				}
					//alert(ex+'--'+node+'--'+PNode+'zTree'+zTree);
				var url = $.appClient.generateUrl({ESIdentify:'GetTransferList',businessid:status,strucid:strucid,params:date},'x');
				$('#transfer_list').flexOptions({url:url}).flexReload();
				
			}else{
				//保存失败
				$.dialog.notice({
					width:120,
					title:'操作提示',
					lock:false,
					content:'保存失败!',
					icon:'error',
					time:2
				});
			}
		}
	});
}


// 筛选
function public_filter()
{
	$.get($.appClient.generateUrl({ESIdentify:'public_filter'},'x'),function (html){
		$.dialog({
			title:'筛选条件设置',
			content:html,
			ok:filterCallBack,
			cancel:true,
			okVal:'确定',
			cancelVal:'取消'
		});
	});
}

// 筛选回调
function filterCallBack()
{
	var datatime = nodeId;
	var params = ['TIMES,like,'+datatime+',true']; // [",,,",",,,",",,,"]
	$('#filter_conditions .filter_condition').each(function (){
		
		var filter_Field = $(this).find('.filter_Field').val();				// 字段名
		var filter_Comparison = $(this).find('.filter_Comparison').val();	// 比较符
		var filter_Value;
		if(filter_Field == 'TIMES'){
			filter_Value = $(this).find('.filter_TransferTimes').val();		// 字段值_时间
		}else if(filter_Field == 'TYPE'){
			filter_Value = $(this).find('.filter_Type').val();				// 字段值_文档类型
		}else if(filter_Field=='USERID' || filter_Field=='ORGID'){
			filter_Value = $(this).find('.filter_Value').attr('id');		// 显示为中文名,要传的值放在ID里
		}else{
			filter_Value = $(this).find('.filter_Value').val();				// 字段值_输入框
		}
		filter_Value = filter_Value ? filter_Value : 'EMPTY';
		var filter_Relation = $(this).find('.filter_Relation').val();		// 关系符
		
		if(filter_Field !='empty'){
			params.push(filter_Field+','+filter_Comparison+','+filter_Value+','+filter_Relation);
		}
	});
	
	params = params.join('@');
	
	//######### 分组规则 #########//
	var hide_val=$("#condition:hidden").val();
	if(hide_val){
		hide_val = hide_val + '@';
	}
	
	params = hide_val + params;
	
	if(!params){
		return true;
	}
	var url = $.appClient.generateUrl({ESIdentify:'GetTransferListByCondition',businessid:status,strucid:strucid,params:encodeURI(params)},'x');
	$("#transfer_list").flexOptions({url:url}).flexReload();
	
}

var USER_ORG_TREE_SETING = {
		view: {
			dblClickExpand: false,
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
			onClick: USER_ORG_TREE_CLICK
		}
};

function USER_ORG_TREE_CLICK(e,treeId, treeNode)
{
	var zTree = $.fn.zTree.getZTreeObj("USER_ORG_TREE");
	zTree.expandNode(treeNode);
	if(__inputObj.attr('name') == 'ORGID'){
		__inputObj.attr('id',treeNode.id);
		__inputObj.val(treeNode.name);
	}else{
		var url = $.appClient.generateUrl({ESIdentify:'FindUserListByOrgid',oid:treeNode.id},'x');
		$("#user_list").flexOptions({url:url}).flexReload();
	}
	
}

//选择用户
$("#filter_conditions input[name='USERID']").die().live('click',function (){
	__inputObj = $(this);
	$.getJSON(
		$.appClient.generateUrl({ESIdentify:'GetOrg'},'x'),
		function (USER_ORG_TREE_NODES){
			$.dialog({
				title:'选择移交人',
				lock:true,
				padding:'0',
				content:"<div class='select_box'><div id='USER_ORG_TREE' class='ztree select_org'></div><div class='select_user'><table id='user_list'></table></div></div>",
				ok:function (){
					var radio = $('#user_list input[name="userid"]:checked').attr('id');
					var userInfo = radio.split('@');
					var uid = userInfo[0];
					var uname = userInfo[1];
					__inputObj.attr('id',uid);
					__inputObj.val(uname);
				},
				okVal:'确定',
				cancel:true,
				cancelVal:'关闭'
			});
			
			$.fn.zTree.init($("#USER_ORG_TREE"), USER_ORG_TREE_SETING, USER_ORG_TREE_NODES);
			//根据用户选择日期列出相应数据@方吉祥
			$("#user_list").flexigrid({
				url:false,
				dataType: 'json',
				colModel : [
					{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
					{display: '选择', name : 'radio', width : 40, align: 'center'},
					{display: '姓名', name : 'userName', width : 80, align: 'center'},
					{display: '部门', name : 'orgName', width : 280, sortable : true, align: 'center'}
				],
				usepager: true,
				nomsg: '没有数据',
				showTableToggleBtn: false,
				useRp: true,
				width: 500,
				height:342
			});
		},
		'json'
	);
});
$("#user_list tr").live('click',function (){
	$(this).find('td:eq(1) div input').attr('checked','checked');
});


//选择机构
$("#filter_conditions input[name='ORGID']").die().live('click',function (){
	__inputObj = $(this);
	$.getJSON(
		$.appClient.generateUrl({ESIdentify:'GetOrg'},'x'),
		function (USER_ORG_TREE_NODES){
			$.dialog({
				title:'选择部门',
				lock:true,
				padding:'0',
				content:"<div class='select_box'><div id='USER_ORG_TREE' class='ztree select_org'></div></div>",
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'关闭'
			});
			
			$.fn.zTree.init($("#USER_ORG_TREE"), USER_ORG_TREE_SETING, USER_ORG_TREE_NODES);
			
		},
		'json'
	);
});



// 删除数据@方吉祥
function transferDel()
{
		
	var inputs = $('#transfer_list input[name="inputsA"]:checked'),leng = inputs.length,id = [];
	
		for(var i=0; i<leng; i++){
				
			id.push(inputs[i].id);
				
		}
		
		if(!id.length){
			$.dialog({
				content: '请选择数据！',
				icon: 'warning',
				time: 2,
				lock: false
			});
			return;
		}
		
		$.dialog({
			content: '删除数据？',
			icon: 'warning',
			okVal: '确定',
			cancelVal: '取消',
			ok: exec,
			cancel: true
		});
		
		function exec()
		{
			$.post(
				$.appClient.generateUrl({ESIdentify:'DeleteTransfer'},'x'),
				{path: nodePath, formId: id},
				function (map){
					
					if(map.success){
						map.refresh == 'true' ? getTransferTree() : '';
						$('#transfer_list').flexReload();
					}else{
						//删除失败
						$.dialog({
							lock:false,
							content:'删除失败!',
							icon:'error',
							time:2
						});
					}
				},
				'json'
			);
		}
		
}

// 目录报表@方吉祥
function transfereports()
{
	var checkedObj = $('#transfer_list input[name="inputsA"]:checked');
		if(!checkedObj.length){
			$.dialog.notice({icon:'warning', time:2, content:'请选择数据', cancelVal:'取消'});
			return false;
		}
		
	var html = ["<div class='reportsfree'>"];
		$.getJSON(
			$.appClient.generateUrl({ESIdentify:'GetReportIdByReporttype', type: archiveType},'x'),
			function (json){
				
				if(!json.length){
					$.dialog.notice({icon:'warning', time:2, content:'无报表模板！请上传报表模板！', cancelVal:'取消'});
					return false;
				}
				
				html.push("<div class='reportselect' id='resourceLevel'>");
				for(var i=0; i<json.length; i++)
				{
					var checked = json.length === 1 ? 'checked="checked"' : '';
						html.push("<p><label for='"+(json[i].id)+"'><input type='radio' "+ checked +" format='"+(json[i].reportstyle)+"' name='RE' id='"+(json[i].id)+"' value='"+ (json[i].type) +"' /><span>"+(json[i].title)+'( '+(json[i].reportstyle)+' )'+"</span></label></p>");
				}
				
				html.push("</div></div>");
				html = html.join('');
				
				$.dialog({
					title:'报表实例选择',
					lock:true,
					content:html,
					ok:printreportCallBack,
					cancel:true,
					okVal:'确定',
					cancelVal:'取消'
				});
			}
		);
		
}

// 报表回调
function printreportCallBack()
{
	var radio = $('#resourceLevel input:checked')[0];
		if(!radio){
			$.dialog.notice({icon:'warning', time:2, content:'请选择报表实例', cancelVal:'取消'});
			return false;
		}
	var id = radio.id;
	var format = radio.getAttribute('format');
	var type = radio.value;
	var reportTitle=radio.nextSibling.innerHTML;
	
	var checkedId = [];
		$('#transfer_list input[name="inputsA"]:checked').each(function (){
			checkedId.push($(this).attr('id'));
		});
		
		// 根据resourceLevel查询报表id
		$.dialog.notice({content: '正在努力打印中,稍后点击“消息提示”进行下载',icon:"success",time:5});
		$.post(
			$.appClient.generateUrl({ESIdentify:'PrintTransferReport'},'x'),
			{id: id, format: format, type: type, checkedId: checkedId,reportTitle:reportTitle,nodePath:nodePath},	
			function (result){
				if(result=='nodata'){
					$.dialog.notice({width: 150,content: '没有满足条件的数据',icon: 'error'});
				}
			},
			'json'
		);
		
}


// 显示卷列表
$('.showinfo').die().live('click',function (){
	var num = parseInt($(this).closest('tr').find('td:[colname="numbers"]').text());
	
	if(num < 1){
		$.dialog.notice({ content:'清册无数据', lock:false, icon:'warning', time:2});
		return;
	}
	
	var istransfer = this.getAttribute('istransfer');
	
	__id = $(this).attr('id');
	//如果是会计档案按盒查看
	if(archiveType=='accounting' && status==2){
		//getPacketList();
		$.dialog({
			title:"移交盒列表",
			content:'<table id="packlist"></table>',
			width:700,
			height:285,
    		id:'artPacketListPanel',
    	    padding:'0px 0px',
    	   	fixed:true,
    	    resize: false,
		    cancelVal: '关闭',
		    cancel: true,
			init:function(){
				
				$("#packlist").flexigrid({
					url: $.appClient.generateUrl({ESIdentify:'getPacketList',transferId:__id}),
					dataType: 'json',
					colModel : [
						{display: '序号', name : 'num', width : 20, align: 'center'},
						{display: '<input type="checkbox" name="path" onclick=selectAll(checked,name,"#packlist") />', name : 'packetIds', width : 20, align: 'center'},
						//{display: '操作', name : 'opreate', width : 40, align: 'center'},
						{display: '盒号', name : 'packetNum', width : 80, align: 'center',metadata:'CaseID'},
						{display: '凭证类型', name : 'boxname', width : 80, align: 'left'},
						{display: '盒厚度', name : 'thickness', width : 40, align: 'center',metadata:'boxThickness'},
						{display: '盒容量', name : 'volume', width : 40, align: 'center'},
						{display: '当前容量', name : 'curVolume', width : 60,  align: 'center',metadata:'curVolume'},
						{display: '保管期限', name : 'expires', width : 60, align: 'center'},
						{display: '年度', name : 'year', width : 60, align: 'center'},
						{display: '会计期间', name : 'accPer', width : 60, align: 'center'},
						{display: '库位号', name : 'repositorypath', width : 200, align: 'left'}
						],
						
					buttons : [
						{name: '删除', bclass: 'delete',onpress: unbindRelationAcc}
					],
					
						usepager: true,
						useRp: true,
						width: 700,
						height:240,
						dblClickResize:true
				});
				
				
				// 会计档案取消关联
				function unbindRelationAcc()
				{
					
					if(istransfer == 1){
						$.dialog.notice({ content:'清册已入库，不能删除！', lock:false, icon:'warning', time:2});
						return;
					}
					
					unbindRelation();
					
				}
				
			}
			
		});
		
	}else{
			
	$.getJSON(
			$.appClient.generateUrl({ESIdentify:'GetTransferdetailColumns',nodePath:__id},'x'),
			function (result){
				__hasChild = result.hasChild;	// 返回是字符串"ture"|"false"
				var column = result.column;
				var colModel = result.colModel;
				
				colModel.unshift({display: '操作', name : 'showedocument', width : 40, align: 'center'});
				colModel.unshift({display: '<input type="checkbox" id="sinputB">', name : 'cbox', width : 40, align: 'center'});
				colModel.unshift({display: '序号', name : 'sortlinenumbers', width : 40, align: 'center'});
				 
				/*if(!column.length){
					$.dialog.notice({content:'无档案明细',icon:'warning',lock:false,time:2});
					return false;
				}*/
				var tblheight = __hasChild == 'false' ? 404 : 178; 
				
				$.dialog({
					title:'档案明细列表',
					lock:true,
					content:'<div style="width:900px; height:500px; float:left; _overflow:hidden"><table id="filedetailmessage"></table><div id="repeat_tbl_div"></div></div>',
					padding:0,
					cancel:true,
					cancelVal:'关闭',
					width:900
				});
				
				
				$("#filedetailmessage").flexigrid({
					url:$.appClient.generateUrl({ESIdentify:'GetFiles',column:column,id:__id,nodePath:nodePath,hasChild:__hasChild}),
					dataType: 'json',
					colModel : colModel,
					buttons : [
						{name: '删除', bclass: 'delete', onpress:unbindRelation}
					],
					usepager: true,
					useRp: true,
					nomsg: '没有数据',
					width:900,
					height:tblheight
				});
			}
	);
	}
});


// 显示卷内列表
$('.showchildinfo').die().live('click',function (){
	
var num = parseInt($(this).closest('tr').find('td:[colname="numbers"]').text());
	
	if(num < 1){
		$.dialog({
			content:'无数据',
			lock:false,
			icon:'warning',
			time:2
		});
		return;
	}
	
	$('#repeat_tbl_div').html('<table id="filechildetailmessage"></table>');
	
	_nodePath = $(this).attr('name');
	$.getJSON(
			$.appClient.generateUrl({ESIdentify:'GetTransferdetailColumns',nodePath:_nodePath},'x'),
			function (result){
				
				var column = result.column;
				var colModel = result.colModel;

				
				
				colModel.unshift({display: '操作', name : 'showedocument', width : 40, align: 'center'});
				colModel.unshift({display: '<input type="checkbox" id="sinputC">', name : 'cbox', width : 40, align: 'center'});
				colModel.unshift({display: '序号', name : 'linenumbers', width : 40, align: 'center'});
				 
				if(!column.length){
					$.dialog.notice({content:'无档案明细',icon:'warning',lock:false,time:2});
					return false;
				}
							
				
				$("#filechildetailmessage").flexigrid({
					url:$.appClient.generateUrl({ESIdentify:'GetTransferdetail',column:column,nodePath:_nodePath,hasChild:__hasChild}),
					dataType: 'json',
					colModel : colModel,
					usepager: true,
					useRp: true,
					nomsg: '没有数据',
					width:900,
					height:178
				});
				
			}
	);
});


// 显示电子文件档案
$('.showedocument').die().live('click',function (){
	
	var path = $(this).attr('name');
	show_file(path);
	//$.dialog({content:'ook',width:800,height:300});
	
});

// 取消关联
function unbindRelation()
{
	var ids = [];
	
	if(archiveType=='accounting' && status==2){
		$('input[name="path"]:checked',$('#packlist')).each(function (){
			ids.push($(this).val());
			});
	}else{
		$('input[name="inputsB"]:checked').each(function (){
			ids.push($(this).attr('id'));
		});
	}
	if(ids.length){
		
		
		$.dialog({
			title:'操作提示',
			lock:true,
			icon:'warning',
			content:'确定删除',
			ok:function (){
				$.ajax({
					type:'get',
					url:$.appClient.generateUrl({ESIdentify:'DeleteBatchTransferReference',id:__id,ids:ids,path:nodePath},'x'),
					success:function (is_ok){
						if(is_ok){
							$.dialog.notice({content:'删除成功',time:2,icon:'succeed'});
							$("#filedetailmessage,#packlist").flexReload();
						}else{
							$.dialog.notice({content:'删除失败',time:2,icon:'error'});
						}
						$("#transfer_list").flexReload();
					}
				});
			},
			cancel:true,
			okVal:'确定',
			cancelVal:'取消'
		});
		
	}else{
		$.dialog.notice({content:'请选择要删除的数据',time:2,icon:'warning',lock:false});
	}
	
}

$(document).on('click','#sinputA', function (){ checkBox(this, $('#transfer_list input[name="inputsA"]'))});
$(document).on('click','#sinputB', function (){ checkBox(this, $('#filedetailmessage input[name="inputsB"]'))});
$(document).on('click','#sinputC', function (){ checkBox(this, $('#filechildetailmessage input[name="inputsC"]'))});