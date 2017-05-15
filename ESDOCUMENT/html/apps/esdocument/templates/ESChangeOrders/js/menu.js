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
	var url=$.appClient.generateUrl({ESChangeOrders:'findChangeList',pid:treeNode.id},'x');
	$("#changeGrid").flexOptions({newp:1,url:url}).flexReload();
}
$(document).ready(function(){
	$.getJSON($.appClient.generateUrl({ESSendReceiveFlow : "getTree"}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#esTypeTree"), setting, zNodes);
		var treeObj = $.fn.zTree.getZTreeObj("esTypeTree");
		//treeObj.removeNode(treeObj.getNodeByParam("id",0));
		var nodes = treeObj.getNodesByParam("pId","0",null);
		for(var i=0;i<nodes.length;i++){
			if(nodes[i].name!="设计变更单"){
				treeObj.removeNode(nodes[i]);
			}
		}		
		/*var root = treeObj.getNodeByParam("name", "设计变更单", null);
		$("#selTreeId").val(root.id);
		treeObj.selectNode(root);*/
	});
});