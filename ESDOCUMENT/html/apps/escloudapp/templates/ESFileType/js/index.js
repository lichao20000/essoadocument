//默认列表
//var tdindex="";
var tds="";
var tdts="";
//var classcode = "";
function setwidtheight(tblw,tblh)
{
	$("#datatbl").flexigrid({
			//url:$.appClient.generateUrl({ESFileType:'getDefaultList'},'x'),
			dataType: 'json',
			editable: true,
			onClick : function(td, grid,options){
				//tdindex = $(td).index();
				var tdcols=$(td).attr('colname');
				if(tdcols=='classCode'){
					tds=$(td);
					var offset = $(td).offset();
					$('#catagory').show().offset({top:offset.top+22,left:offset.left+10});
					$("body").bind("mousedown", clickBodyDown);
				}
				if(tdcols=='storageTerm'){
					tdts=$(td);
					var offset = $(td).offset();
					$('#extra').show().offset({top:offset.top+5,left:offset.left+10});
					$("body").bind("mousedown", extraclickBodyDown);
				}
			},
			colModel : [
				/*
				 * id:1,
				 * recordType:文种,
				 * classCode:分类号,
				 * storageTerm:存储期限,
				 * archiveType:档案类型,
				 * "organ:机构,
				 * description:备注
				 * width被修改时请同时修改 - 文种修改方法中的参数
				 */
				//{display: '序号', 		name : 'id', width : 40, align: 'center'},
				{display: '<input type="checkbox" name="id1" />', name : 'cx', width : 40, align: 'center'},
				{display: '文种分类', name : 'recordclass', width : 70, sortable : true, align: 'left', editable: true},
				{display: '文种', name : 'recordType', width : 300, sortable : true, align: 'left', editable: true},
				{display: '归档状态', name : 'filestatus', width : 100, sortable : true, align: 'left', editable: true},
				{display: '分类号', name : 'classCode', width : 50, sortable : true, align: 'center', editable: true},
				{display: '保管期限', name : 'storageTerm', width : 70, sortable : true, align: 'center'},
				{display: '状态', name : 'status', width : 150, sortable : true, align: 'left',editable:true},
				{display: '备注', name : 'description', width : 150, sortable : true, align: 'left',editable:true}
			],
			buttons : [
				{name: '添加', bclass: 'add', onpress:addFileType},
				{name: '删除', bclass: 'delete',onpress:deldata},
				{name: '保存', bclass: 'save',onpress:save},
				{name: '筛选', bclass: 'filter', onpress:filFileType},
				{name: '还原数据',bclass: 'back',onpress:backData},
				{name: '数据导入',bclass: 'import',onpress: batchImport}
			],
			usepager: true,
			title: '文种设置',
			useRp: true,
			rp: 20,
			procmsg:"正在加载，请稍等",
			nomsg:"没有数据",
			resizable:false,
			minColToggle:0,
			showTableToggleBtn: false,
			pagetext: '第',
			outof: '页 /共',
			width: tblw,
			height: tblh,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'

});
	/*var archive="";
	if(archivetype=="OA"){
		var st = mainsite.toUpperCase();
		if(orgid=='001000'){
			archive = archivetype;
		}else{
			archive = st+archivetype;
		}
	}else{
		archive = archivetype;
	}
	var url=$.appClient.generateUrl({ESFileType:'getDefaultList'},'x');
	$("#datatbl").flexOptions({newp:1,url:url,query:archive}).flexReload();*/
}

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


function clickBodyDown(event) {
	if (!(event.target.id == "catagory" || event.target.id == "fication"||$(event.target).parents("#catagory").length>0 ||event.target.parentNode.abbr=="classCode")) {
		$("#catagory").fadeOut("fast");
	}
}
function extraclickBodyDown(event){
	if (!(event.target.id == "extra" || event.target.id == "extraretention"||$(event.target).parents("#extra").length>0 ||event.target.parentNode.abbr=="storageTerm")) {
		$("#extra").fadeOut("fast");
	}
}
$("#extraretention").die().live("click",function(){
	tdts.find("div").html($(this).val());
	var state = tdts.closest("tr");
	if(state.attr("datastate")!="new"){
		state.attr("datastate","modify");
	}
});
//树的显示
var setting = {
		view: {
			dblClickExpand: false,
			showLine: false,
			selectedMulti: false
		},
		edit:{
			enable:true
		},
		async:{
			enable:true,
			url:$.appClient.generateUrl({ESFileType:'getnode'},'x'),
			autoParam:["id"]
		},
		callback: {
			onClick: ClickNode
		}
	};

$(document).ready(function() {
$.getJSON($.appClient.generateUrl({ESFileType : "tree"}, 'x'), function(zNodes) {
	$.fn.zTree.init($("#fication"), setting, zNodes);
});
});

function ClickNode(e,treeId, treeNode) {
	if(treeNode.pId!=0)
	tds.find("div").html(treeNode.classCode);
	var state = tds.closest("tr");
	if(state.attr("datastate")!="new"){
		state.attr("datastate","modify");
	}
	
}
/**
 * 添加行
 * @author ldm
 */
function addFileType(){
		$("#datatbl").flexExtendData([{"id":'lucky',"cell":{"id":'new',"cx":"<input type='checkbox' name='ids' />",'recordclass':'文种分类','recordType':'','filestatus':'归档状态','classCode':'分类号','storageTerm':'保管期限','status':'状态','description':'备注'}}]);
}
/**
 * 保存
 * @author ldm
 * @returns
 */
function save(){
	var archive="";
	if(archivetype=="OA"){
		var st = mainsite.toUpperCase();
		if(orgid=='001000'){
			archive = archivetype;
		}else{
			archive = st+archivetype;
		}
	}else{
		archive = archivetype;
	}
//	alert(archive);
//	return;
	
	var mynew = new Array();
	$('#datatbl tr[datastate="new"]').each(function(i){
		var a1 = $(this).find("td").eq(1).text();
		var a2 = $(this).find("td").eq(2).text();
		var a3 = $(this).find("td").eq(3).text();
		var a4 = $(this).find("td").eq(4).text();
		var a5 = $(this).find("td").eq(5).text();
		var a6 = $(this).find("td").eq(6).text();
		var a7 = $(this).find("td").eq(7).text();
		mynew[i]={'recordclass':a1,'recordType':a2,'archiveType':archive,'filestatus':a3,'classCode':a4,'storageTerm':a5,'status':a6,'description':a7};
	});
	var mymodify = new Array();
		$('#datatbl tr[datastate="modify"]').each(function(i){
			var a0 = $(this).find("td").eq(0).find("input").val();
			var a1 = $(this).find("td").eq(1).text();
			var a2 = $(this).find("td").eq(2).text();
			var a3 = $(this).find("td").eq(3).text();
			var a4 = $(this).find("td").eq(4).text();
			var a5 = $(this).find("td").eq(5).text();
			var a6 = $(this).find("td").eq(6).text();
			var a7 = $(this).find("td").eq(7).text();
			mymodify[i]={'id':a0,'recordclass':a1,'archiveType':archive,'organ':organ,'recordType':a2,'filestatus':a3,'classCode':a4,'storageTerm':a5,'status':a6,'description':a7};
		});
	
	
	if(mynew==""&&mymodify==""){
		$.dialog.notice({icon:"warning",content:'没有要保存的数据',time:3});
		return;
	}
	if(mynew!=""){
		var url = $.appClient.generateUrl({ESFileType:'saveFileType'},'x');
		$.post(url,{param:mynew},function(result){
			if(result){
				$.dialog.notice({icon:"succeed",content:'添加成功',time:3});
				$('#datatbl').flexOptions({newp: 1}).flexReload();
				return;
			}
		});
	}
	if(mymodify!=""){
		var url = $.appClient.generateUrl({ESFileType:'modifyFileType'},'x');
		$.post(url,{param:mymodify},function(result){
			if(result){
				$.dialog.notice({icon:"succeed",content:'修改成功',time:3});
				$('#datatbl').flexOptions({newp: 1}).flexReload();
				return;
			}
		});
	}
	
	//$.post();
}

//删除
function deldata(){
	var data = new Array();
	var codeid='';
	var checkboxObj=$("input[name='ids']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		//wanghongchen 20141017 修改消息提醒图标
		$.dialog.notice({content:'请选择要删除的数据',time:3,icon:'warning'});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			codeid+=$(this).val()+',';
			});
		}
	if(codeid=='' || codeid==='undefined' || codeid==0)
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
				var url=$.appClient.generateUrl({ESFileType:'delFileType'},'x');
				$.post(url,{param:codeid},function(result){
					if(result){
						$("input[name='id1']").attr("checked",false);
						$.dialog.notice({icon:'succeed',content:'删除成功',time:2});
						$('#datatbl').flexOptions({newp: 1}).flexReload();
					}
					
					});
				
			}
		});
	
}

//筛选
function filFileType()
{
	var archive="";
	if(archivetype=="OA"){
		var st = mainsite.toUpperCase();
		if(orgid=='001000'){
			archive = archivetype;
		}else{
			archive = st+archivetype;
		}
	}else{
		archive = archivetype;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESFileType:'filter'},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'筛选面板',
		    	lock:true,
	    	    resize:false,
	    	    opacity:0.1,
	    	    //这里调用的方法在filter.js页面里
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
			    	var url = $.appClient.generateUrl({ESFileType:'filter_sql',type:archive,sql_str:encodeURI(str)},'x');
			    	/*$.get($.appClient.generateUrl({ESFileType:'filter_sql'},'x'),{type:archivetype,sql_str:encodeURI(str)},function(result){
			    		alert(result);return;
			    	});*/
					$('#datatbl').flexOptions({newp: 1,url:url}).flexReload();
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

//筛选数据后还原数据
function backData(){
	  $('#datatbl').flexOptions({url:$.appClient.generateUrl({ESFileType:'getDefaultList'},'x')}).flexReload();
}

//全选
$("input[name='id1']").die().live('click',function(){
	$("input[name='ids']").attr('checked',$(this).is(':checked'));
});




$(document).ready(function(){
	$("#estabs").esTabs("open", {title:"文种对应设置", content:"#esmenu, #esone, #eslist"});
	
	//动态添加文种类型div模拟下拉列表
	setwidtheight(SetWidHei()[0],SetWidHei()[1]);
	$('.tDiv .tDiv2 .fbutton:last').after(createSelect);
	
	//modify @date 2013-06-04  根据需求增加
	var index = document.getElementById("select").selectedIndex;
	var v=document.getElementById("select").options[index].value;
	if(v==''){
		document.getElementById("Seledfiletype").innerHTML=msg;
	}
	var url=$.appClient.generateUrl({ESFileType:'getDefaultList'},'x');
	$("#datatbl").flexOptions({newp:1,url:url,query:v}).flexReload();
	
	//modify @date 2013-06-04  根据要求去掉
	//$('.tDiv .tDiv2').after(secondSelect);
});
//设置宽高
function SetWidHei()
{
	var allw = $(document).width();			//可见总宽	1024
	var allh = $(document).height()-110;	//可见总高	630  175是头部高度
	var tblw = allw;
	var tblh = allh - 116;
	//var sizeparams = [leftw,lefth,rightw,righth];
	var widtheight = [tblw,tblh];
	return widtheight;
}