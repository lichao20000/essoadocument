/**
 * 筛选收集范围树
 */
$(document).ready(function() {
	$("#stageName[class='selectInput']").selectInput({
		url : $.appClient.generateUrl({
			ESDocumentStage : "getTree"
		}, 'x'),
		chkStyle : "checkbox",
		height : 300,
		onCheck : onCheck,
		treatNodes : treatStage
	});
	function treatStage(zNodes) {
		var arrays = $("#stageName").val() != null ? $("#stageName")
				.val().split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].code, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
			}
			if (zNodes[i].id == 0) {
				zNodes[i].nocheck = true;
			}
		}
	};
	function onCheck(event, treeId, treeNode) {
		    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
     		var nodes = zTree.getCheckedNodes(true);
     		var stageIds = '';
     		var stageNames='';
     		for (var i=0, l=nodes.length; i<l; i++) {
     			if(nodes[i].id!=''){
     				stageIds += nodes[i].id + ",";
     				stageNames +=nodes[i].name + ",";
     			}
     		}
     		if (stageIds.length > 0 ) stageIds = stageIds.substring(0, stageIds.length-1);
     		if (stageNames.length > 0 ) stageNames =stageNames.substring(0, stageNames.length-1);
			$("#stageName").val(stageNames);
			$("#stageId").val(stageIds);
	};
});
