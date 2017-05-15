
var treeid="";//左边树id
//var orgid="";//成文机构Id
var treename="";//左边树名字
var tds="";//点击的表格<树>
var tdts = "";//点击的表格<下拉框>
var oaaList="";//机构对应的业务系统
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
					url:$.appClient.generateUrl({ESOrgUserSeting:'getnode'},'x'),
					autoParam:["id"]
				},
				callback: {
					onClick: clickNode
				}
			};

	$("#organtable").flexigrid({
		//url: tableurl,
		dataType: 'json',
		editable: true,
		onClick : function(td, grid,options){
			//tdindex = $(td).index();
			var tdcol= $(td).attr('colname');
			if(tdcol=='c3'){
				tds=$(td);
				var offset = $(td).offset();
				$('#catagorys').show().offset({top:offset.top+22,left:offset.left+10});
				$("body").bind("mousedown", clickBodyDowns);
			}
			if(tdcol=='c4'){
				tdts=$(td);
				var offset = $(td).offset();
				$('#extra').show().offset({top:offset.top+1,left:offset.left+6});
				$("body").bind("mousedown", extraclickBodyDown);
			}
			if(tdcol=='c5'){
				oaaList=$(td);
				var offset = $(td).offset();
				$('#extraSystem').show().offset({top:offset.top+1,left:offset.left+30});
				$("body").bind("mousedown", extraSystemclickBodyDown);
			}
		},
		colModel : [
		    {display: '序号', name : 'number', width : 40, align: 'center'},
			{display: '<input type="checkbox" name="ids" />', name : 'id2', width : 40, align: 'center'},
			{display: '分类号', name : 'c3', width : 172,align: 'center',editable: true},
			{display: '保管期限', name : 'c4', width : 150,align: 'center'},
			{display: '档案类型', name : 'c5', width : 200,align: 'center'},
			{display: '机构', name : 'c6', width : 200,align: 'center'},
			{display: '备注', name : 'c7', width : 200,align: 'center',editable: true}
			],
		buttons : [
			{name: '添加', bclass: 'add',onpress:addorgan},
			{name: '删除', bclass: 'delete',onpress:delorgan},
			{name: '保存', bclass: 'save',onpress:save},
			{name: '筛选', bclass: 'filter',onpress:filter},
			{name: '批量导入', bclass: 'import',onpress:batchImport}
			],
		usepager: true,
		title: '机构对应设置',
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

	
	// 批量导入
	function batchImport()
	{
		$.dialog({
			title:'上传文件(仅一个文件)',
			id: 'importPanel',
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
	
	function clickBodyDowns(event) {
		if (!(event.target.id == "catagorys" || event.target.id == "fications"||$(event.target).parents("#catagorys").length>0 ||event.target.parentNode.abbr=="c3")) {
			$("#catagorys").fadeOut("fast");
		}
	}
	function extraclickBodyDown(event){
		if (!(event.target.id == "extra" || event.target.id == "extraretention"||$(event.target).parents("#extra").length>0 ||event.target.parentNode.abbr=="c4")) {
			$("#extra").fadeOut("fast");
		}
	}
	//201309
	function extraSystemclickBodyDown(event){
		if (!(event.target.id == "extraSystem" || event.target.id == "extraSelect"||$(event.target).parents("#extraSystem").length>0 ||event.target.parentNode.abbr=="c5")) {
			$("#extraSystem").fadeOut("fast");
		}
	}
	$("#extraSelect").die().live("click",function(){
		oaaList.find("div").html($(this).val());
	});
	//201309
	$("#extraretention").die().live("click",function(){
		tdts.find("div").html($(this).val());
	});
	

	//分类树
	var classic = {
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
					url:$.appClient.generateUrl({ESOrgUserSeting:'getclassicnode'},'x'),
					autoParam:["id"]
				},
				callback: {
					onClick: clickNode
				}
			};
	//分类树2
	var classics = {
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
					url:$.appClient.generateUrl({ESOrgUserSeting:'getclassicnode'},'x'),
					autoParam:["id"]
				},
				callback: {
					onClick: click
				}
			};

	/**
	 * 初始化树
	 */
	
$.getJSON($.appClient.generateUrl({ESOrgUserSeting : "classictree"}, 'x'), function(zNodes) {
	$.fn.zTree.init($("#fication"), classic, zNodes);
	
});
$.getJSON($.appClient.generateUrl({ESOrgUserSeting : "classictree"}, 'x'), function(zNodes) {
	$.fn.zTree.init($("#fications"), classics, zNodes);
	
});
$.getJSON($.appClient.generateUrl({ESOrgUserSeting : "tree"}, 'x'), function(zNodes) {
	$.fn.zTree.init($("#organtree"), setting, zNodes);
	
});
	
	function clickNode(event,treeId,treeNode){
		if($(event.target).closest("div").attr("id")== "catagory"){
			$("#addorgan input[name='classic']").val(treeNode.classCode);
			
			
			//$("#addorgan input[name='orgid']").val(treeNode.id);
			//orgid = treeNode.id;
		}else{
			treeid = treeNode.id;
			treename = treeNode.name;
			var tableurl=$.appClient.generateUrl({ESOrgUserSeting:'organ_json',trid:treeid},'x');
			$("#organtable").flexOptions({newp:1,url:tableurl}).flexReload();
			//$.fn.zTree.init($("#fication"), setting, treeNode);
		}
	}
	function click(event,treeId,treeNode){
		tds.find("div").html(treeNode.classCode);
	}

	
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
		$.dialog({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 1});
		return;
	}
	var url = $.appClient.generateUrl({ESOrgUserSeting:'organadd'},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    	$.dialog({
	    		id:'name2',
		    	title:'机构对应设置',
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
			    	var classic = $("#addorgan input[name='classic']").val();
			    	if(classic==""){
			    		$.dialog({icon : 'warning',content : '请选择分类树',title : '3秒后自动关闭',time : 1});
			    		return false;
			    	}
			    	var data = $("#addorgan").serialize();
			    	var url = $.appClient.generateUrl({ESOrgUserSeting : 'addval'}, 'x');
			    	$.post(url,{data : data,trid:treeid,trname:treename}, function(result) {
			    		if (result == "1") {
			    			$.dialog({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 1});
			    			$("#organtable").flexReload();
			    			return;
			    		} else {
			    			$.dialog({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 1});
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
 * 删除
 */
function delorgan(){
	var id='';
	var checkboxObj=$("input[name='id2']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog({content:'请选择要删除的数据',time:3});
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
				var url=$.appClient.generateUrl({ESOrgUserSeting:'delval'},'x');
				
				$.post(url,{id:id},function(result){
						if (result == "1") {
			    			$.dialog({icon : 'succeed',content : '删除成功',title : '3秒后自动关闭',time : 1});
			    			$("#organtable").flexReload();
			    			return;
			    		} else {
			    			$.dialog({icon : 'error',content : '删除失败',title : '3秒后自动关闭',time : 1});
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
		$.dialog({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 1});
		return;
	}

	var data = new Array();
	$("#organtable").find("tr").each(function(i){
			var s1 = $(this).find("td").eq(1).find("input").val();
			var s2 = $(this).find("td").eq(2).find("div").text();
			var s3 = $(this).find("td").eq(3).find("div").text();
			var s4 = $(this).find("td").eq(4).find("div").text();
			var s6 = $(this).find("td").eq(6).find("div").text();
			data[i]={"id":s1,"classCode":s2,"storageTerm":s3,"archiveType":s4,"description":s6};
	});
	var url=$.appClient.generateUrl({ESOrgUserSeting:'saveval'},'x');
	$.post(url,{param:data},function(result){
		if (result == "1") {
			$.dialog({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 1});
			$("#organtable").flexReload();
			return;
		} else {
			$.dialog({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 1});
			return;
		}
	});
}
/**
 * 筛选
 */
function filter(){
	if(treeid==""){
		$.dialog({icon : 'warning',content : '请先选择左侧机构',title : '3秒后自动关闭',time : 2});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESOrgUserSeting:'filter'},'x'),
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
			    	//alert(str);return;
			    	if(str==""){
			    		$.dialog({icon:'warning', content:"查询条件不能为空", time:3});
			    		return;
			    	}
			    	var url = $.appClient.generateUrl({ESOrgUserSeting:'filter_json',trid:treeid},'x');
					$('#organtable').flexOptions({newp: 1,url:url,query:str}).flexReload();
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
/**
 * 动态生成仿select下拉列表框
 */
/**
 * 改变浏览器尺寸
 */ 
/*
function sizeChanged(){
	if($.browser.msie && $.browser.version==='6.0'){
		$("html").css({overflow:"hidden"});
	}
	var h = $(window).height() - $(".esright").position().top;
	var flex = $("#organtable").closest("div.flexigrid");
	var bDiv = flex.find('.bDiv');
    var contentHeight = bDiv.height();
    var headflootHeight = flex.height() - contentHeight; 
    
    bDiv.height(h - headflootHeight);
	flex.height(h);
	$("#esleft").height(h);

	// 修改IE表格宽度兼容
	if($.browser.msie && $.browser.version==='6.0'){
		flex.css({width:"-=3px"});
	}
};
sizeChanged();

*/
});