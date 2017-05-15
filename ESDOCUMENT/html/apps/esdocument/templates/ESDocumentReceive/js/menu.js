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
	$("#selTreeId").val(treeNode.id);//选择树时保存选择节点id
	var url=$.appClient.generateUrl({ESDocumentReceive:'getLoaderListInfo',pid:treeNode.id},'x');
	$("#esDataList").flexOptions({newp:1,url:url}).flexReload();
}
$(document).ready(function(){
	$.getJSON($.appClient.generateUrl({ESSendReceiveFlow : "getTree"}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#esTypeTree"), setting, zNodes);
		var treeObj = $.fn.zTree.getZTreeObj("esTypeTree");
		var root = treeObj.getNodeByParam("id",0);
		treeObj.selectNode(root);
		$("#selTreeId").val(root.id);
		var node = treeObj.getNodeByParam("name", "设计变更单", null);
		treeObj.removeNode(node);
	});
});