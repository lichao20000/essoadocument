var setting = {
	view: {
		dblClickExpand: true,
		showLine: false
	},
	data: {
		simpleData: {
			enable: true
		}
	},
	async:{
		autoParam:['id','column','path','number'],
		enable:true
	},
	callback: {
		onClick: onClick
	}
};

function onClick(e,treeId, treeNode) {	
	$("#stageCode").val(treeNode.code);
	$("#stageId").val(treeNode.id);
	$("#stageName").val(treeNode.name);
	$("#condition").val("");//清空筛选条件
	getColModel(treeNode.code,treeNode.id);
}

//获取数据列
function getColModel(stageCode,stageId){
	var url=$.appClient.generateUrl({ESFiling: 'findDocumentList',code : stageCode, stageId: stageId },'x');
	var colModel= [{display : '序号',name : 'num',width : 20,align : 'center'}, 
		             {display : '<input type="checkbox" name="paths">',name : 'ids',width : 20,align : 'center'},
		             {display : '项目名称',name : 'itemName',width : 180,align : 'left'},
		             {display : '收集范围名称',name: 'stageName', width: 150,align: 'left'},
		             {display : '装置分类名称',name: 'device',width: 150, align: 'left'},
		             {display : '文件标题',name : 'title',width : 180,align : 'left'}, 
		             {display : '文件编码',name : 'docNo',width : 120,align : 'left'}, 
		             {display : '拟定部门名称',name: 'part',width: 150,align: 'left'},
		             {display : '文件类型名称',name: 'documentTypeName',width: 100,align: 'left'},
		             {display : '文件专业名称',name: 'engineeringName',width: 100,align: 'left'},
		             {display : '拟定人',name : 'person',width : 60,align : 'left'}, 
		             {display : '拟定日期',name : 'date',width : 80,align : 'center'}
		             ];
	loadGrid(url,colModel,stageId);
}

function loadGrid(url,colModel,stageId){
	$.post($.appClient.generateUrl({ESFiling : "findMoveCols"}, 'x'),{stageId:stageId},function(data){
		if(data){
			for(var i=0;i<data.length;i++){
				if(data[i].type == "TEXT"){
					colModel.push({display : data[i].name,name : data[i].code, width : 80, align : 'left'});
				}else if(data[i].type == "NUMBER"){
					colModel.push({display : data[i].name,name : data[i].code, width : 80, align : 'right'});
				}else{
					colModel.push({display : data[i].name,name : data[i].code, width : 80, align : 'center'});
				}
			}
		}
		var flag = stageId>0 ? false : true;
		$("#eslist").empty().append('<table id="esDataList"></table>');
		$("#esDataList").flexigrid({
			url : url,
			dataType : 'json',
			colModel : colModel,
			buttons : [{name : '按装置号筛选',bclass : 'filter', disable:flag, onpress : filter},
			           {name : '还原数据',bclass : 'back', disable:flag, onpress : back},
			           {name : '归档',bclass : 'export', disable:flag, onpress : archive}],
			usepager: true,
			title: '&nbsp;',
			nomsg:"没有数据",
			useRp: true,
			width: width,
			height:height,
			showTableToggleBtn: true,
			pagetext: '第',
			itemtext: '页',
			outof: '页 /共',
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
			procmsg:'正在加载数据，请稍候...'
		});
	},"json");
}

$(document).ready(function(){
    $.getJSON($.appClient.generateUrl({
        ESDocumentsCollection: "getTree"
    },
    'x'),
    function(zNodes) {
    	$.fn.zTree.init($("#esStageTree"), setting, zNodes);
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");        
    });
});