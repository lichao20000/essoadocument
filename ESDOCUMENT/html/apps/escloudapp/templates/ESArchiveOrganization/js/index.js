/**
 * @modify at 2013-10-30 by niyang
 */
var treeid="";//左边树id
var treename = "";//左侧书名称
//var orgid="";//成文机构Id
var oaaList="";//机构对应的业务系统
var orgarr = undefined;//多个机构id
var namearr = undefined;//多个机构名称

$(function(){
	
	//左侧树
	var setting = {
				view: {
					dblClickExpand: false,
					showLine: false,
					selectedMulti: false
				},
				edit:{
					enable:true
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				async:{
					enable:true,
					url:$.appClient.generateUrl({ESArchiveOrganization:'getnode'},'x'),
					autoParam:["id"]
				},
				callback: {
					onClick: clickNode
				}
			};
	function clickNode(event,treeId,treeNode){
		treeid = treeNode.id;
		treename = treeNode.name;
		setting.callback = {
			onClick: function(event, treeId, treeNode) {
				this.treeObj = $.fn.zTree.getZTreeObj(treeId);
				this.treeObj.checkNode(treeNode, null, true);
			}
		};

		var tableurl=$.appClient.generateUrl({ESArchiveOrganization:'organ_json'},'x');
		$("#organtable").flexOptions({newp:1,url:tableurl,query:treeid}).flexReload();
		$.fn.zTree.init($("#fication"), setting, treeNode);
	}
	$.getJSON($.appClient.generateUrl({ESArchiveOrganization : "tree"}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#organtree"), setting, zNodes);		
	});
	$("#organtable").flexigrid({
		//url: tableurl,
		dataType: 'json',
		editable: true,
		onClick : function(td, grid,options){
			tdindex = $(td).index();
			if(tdindex==3){
				oaaList=$(td);
				var offset = $(td).offset();
				$('#extraSystem').show().offset({top:offset.top+5,left:offset.left+10});
				$("body").bind("mousedown", extraSystemclickBodyDown);
			}
		},
		colModel : [
		    {display: '序号', name : 'number', width : 40, align: 'center'},
			{display: '<input type="checkbox" name="ids" />', name : 'id2', width : 40, align: 'center'},
			{display: '成文机构', name : 'c3', width : 200, sortable : true, align: 'center'}
			/*{display: '档案门类', name : 'c4', width : 200, sortable : true, align: 'center'},
			{display: '备注', name : 'c5', width : 200, sortable : true, align: 'center',editable: true}*/
			],
		buttons : [
			//{name: '添加', bclass: 'add',onpress:addorgan},
			{name: '添加', bclass: 'add',onpress:batchAddorgan},
			{name: '删除', bclass: 'delete',onpress:delorgan}
			//{name: '保存', bclass: 'save',onpress:save},
			//{name: '筛选', bclass: 'filter',onpress:filter}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '归档机构设置',
		useRp: true,
		rp: 20,
		procmsg:"正在加载，请稍等",
		nomsg:"没有数据",
		resizable:false,
		minColToggle:0,
		showTableToggleBtn: false,
		pagetext: '第',
		outof: '页 /共',
		width: 'auto',
		height: height,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	});

	//201307
	function extraSystemclickBodyDown(event){
		if (!(event.target.id == "extraSystem" || event.target.id == "extraSelect"||$(event.target).parents("#extraSystem").length>0 ||event.target.parentNode.abbr=="c5")) {
			$("#extraSystem").fadeOut("fast");
		}
	}
	$("#extraSelect").find("option").die().live("click",function(){
		oaaList.find("div").html($(this).val());
	});
	//201307
	
//全选

$("input[name='ids']").die().live('click',
		function(){
		$("input[name='id2']").attr('checked',$(this).is(':checked'));
		}
);

/**
 * 添加
 */
function addorgan()
{
	if(treeid==""){
		$.dialog.notice({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 3});
		return;
	}
	var url = $.appClient.generateUrl({ESArchiveOrganization:'organadd'},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    	$.dialog({
	    		id:'name2',
		    	title:'添加归档机构设置',
	    	    height: '40%',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	opacity : 0.1,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    ok:function(){
			    	var data = $("#addorgan").serialize();
			    	var url = $.appClient.generateUrl({ESArchiveOrganization : 'addval'}, 'x');
			    	$.post(url,{data : data,trid:treeid}, function(result) {
			    		if (result == "true") {
			    			$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
			    			$("#organtable").flexReload();
			    			return;
			    		} else {
			    			$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
			    			return;
			    		}
			    	});
			    }
		    });
	    	
		    },
		    cache:false
	});	
}
/**
 * 批量添加 倪阳添加
 */
function batchAddorgan()
{
	if(treeid==""){
		$.dialog.notice({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 3});
		return;
	}
	var url = $.appClient.generateUrl({ESArchiveOrganization:'organadd'},'x');
	$.ajax({
	    url:url,
	    type:'GET',
	    data:'id='+treeid+'&name='+encodeURI(treename),
	    dateType: 'JSON',    
	    success:function(data){
	    	$.dialog({
	    		id:'name2',
		    	title:'归档机构设置',
		    	width: '400px',
	    	    height: '300px',
	    	    padding: '0 0',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	opacity : 0.1,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    ok:function(){			    	
			    	//var data = $("#addorgan").serialize();
			    	var treeObj = $.fn.zTree.getZTreeObj('fication');
			    	var nodes = treeObj.getCheckedNodes(true);
			    	if(nodes.length == 0) {
			    		$.dialog.notice({icon : 'warning',content : '请选择机构',title : '2秒后自动关闭',time : 2});
			    		return false;
			    	}
			    	/*if( nodes.length==1 && nodes[0].ppId == '0000') {
			    		$.dialog.notice({icon : 'warning',content : '请选择 '+nodes[0].name+' 下属机构',title : '3秒后自动关闭',time : 3});
			    		return false;
		    		}*/			    	
			    	//namearr = namearr?namearr:[]; orgarr = orgarr?orgarr:[];
			    	namearr = namearr || []; orgarr = orgarr || [];
			    	for(var i=0; i<nodes.length; i++) {
			    		orgarr.push({ID_PARENT:treeid,ORGID:nodes[i].id,NAME:nodes[i].name,MAINSITE:nodes[i].mainSite});
			    	}
			    	var url = $.appClient.generateUrl({ESArchiveOrganization : 'addval'}, 'x');
			    	$.post(url,{data : orgarr}, function(result) {
			    		if (result == "true") {
			    			$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time :3});
			    			$("#organtable").flexReload();
			    			return;
			    		} else {
			    			$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
			    			return;
			    		}
			    	});
			    	initValue();
			    },
			    cancel:function(){
			    	initValue();
			    }
		    });
	    	
		    },
		    cache:false
	});	
}
/*
 * 初始化值 倪阳添加
 */
var initValue = function(){
	var treeObj = $.fn.zTree.getZTreeObj('fication');
	treeObj.checkAllNodes(false);
	if(namearr != undefined) {
		namearr = undefined;
	}
	if(orgarr != undefined) {
		orgarr = undefined;
	}
}

/**
 * 删除
 */
function delorgan(){
	if(treeid==""){
		$.dialog.notice({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 1});
		return;
	}
	var id='';
	var checkboxObj=$("input[name='id2']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog.notice({content:'请选择要删除的数据',icon:'warning',time:3});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			id+=$(this).val()+',';
			});
		}
	if(id=='' || id==='undefined' || id==0)
	{
		return false;
	}		
	$.dialog({
			content:'确定要删除吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				var url=$.appClient.generateUrl({ESArchiveOrganization:'delval'},'x');
				
				$.post(url,{id:id},function(result){
						if (result == "true") {
			    			$.dialog.notice({icon : 'succeed',content : '删除成功',title : '3秒后自动关闭',time : 3});
			    			$("#organtable").flexReload();
			    			$("input[name='ids']").attr('checked',false);
			    			return;
			    		} else {
			    			$.dialog.notice({icon : 'error',content : '删除失败',title : '3秒后自动关闭',time : 3});
			    			return;
			    		}
					});
				
			}
		});
}
/**
 * 保存
 */
function save(){
	if(treeid==""){
		$.dialog.notice({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 3});
		return;
	}
	var data = new Array();
	$("#organtable").find("tr").each(function(i){
		var s1 = $(this).find("td").eq(1).find("input").val();
		var s3 = $(this).find("td").eq(3).find("div").text();
		var s4 = $(this).find("td").eq(4).find("div").text();
		data[i]={"id":s1,"archivetype":s3,"description":s4};

	});
	if(data==""){
		return;
	}
	var url=$.appClient.generateUrl({ESArchiveOrganization:'saveval'},'x');
	$.post(url,{param:data},function(result){
		if (result) {
			$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
			$("#organtable").flexReload();
			return;
		} else {
			$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
			return;
		}
	});
}
/**
 * 筛选
 */
function filter(){
	if(treeid==""){
		$.dialog.notice({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 3});
		return;
	}

	$.ajax({
	    url:$.appClient.generateUrl({ESArchiveOrganization:'filter'},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'筛选面板',
		    	lock:true,
	    	    resize:false,
	    	    opacity:0.1,
			    ok:function(){
			    	var exg = /(-)$/;
			    	var sql_string = '';
			    	//获取p标签
			    	$('#contents p').each(function (f){
			    		//字段值是否填写
			    		var filedvalue = $('.filedvalue').eq(f).val();//字段值class='filedvalue'
			    		
			    		if(filedvalue){
			    			var filedname	=	$('.filedname').eq(f).val();	//字段名class='filedname'
			    			var comparison	=	$('.comparison').eq(f).val();	//比较符class='comparison'
			    			
			    			var relationship=	$('.relationship').eq(f).val();	//关系符class='relationship'
			    			if(relationship=="AND"){
			    				relationship='true';
			    			}else{
			    				relationship='false';
			    			}
			    			sql_string += filedname+","+comparison+","+filedvalue+","+relationship+"-";
			    		}
			    	});
			    	
			    	var str = sql_string.replace(exg,"");
			    	if(str==""){
			    		$.dialog.notice({icon:'warning', content:"查询条件不能为空", time:3});
			    		return;
			    	}
			    	var url = $.appClient.generateUrl({ESArchiveOrganization:'organ_json',orgid:treeid,sql_str:encodeURI(str)},'x');
					$('#organtable').flexOptions({newp: 1,url:url}).flexReload();
			    },
	    	    cancel:true,
		    	content:data,
		    	okVal:'确定',
		    	cancelVal:'取消'
		    });
		},
		cache:false
	});
}
$('.newfilter').die().live('click',function (){
	$(this).parent().clone().insertAfter($(this).parent());
});

$('.delfilter').die().live('click',function (){
	$('#contents p').length > 1 ? $(this).parent().remove() : '';
});



});