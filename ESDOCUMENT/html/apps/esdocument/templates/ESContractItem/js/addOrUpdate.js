$(document).ready(function(){
	$("#esdevice").selectInput({
		url : $.appClient.generateUrl({
			ESDevice : "getTree",
			maxLevel : 0
		}, 'x'),
		chkStyle : "checkbox",
		onCheck : onCheck,
		width:370,
		height:300,
		treatNodes : treatNodes
	});
	function treatNodes(zNodes) {
		var arrays = $("#esdevice").val() != null ? $("#esdevice").val()
				.split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].code, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
				if (zNodes[i].id == 0) {
					zNodes[i].nocheck = true;
				}
			}else{
				zNodes[i].nocheck=true;
			}
		}
	};
	function onCheck(event, treeId, treeNode) {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		$("#esdeviceNo").val(treeNode.code);
		var ids = "";
		var codes = "";
		var names = "";
		var nodes = zTree.getCheckedNodes(true);
		for(var i=0;i<nodes.length;i++){
			ids = ids+nodes[i].id+",";
			codes = codes+nodes[i].code+",";
			names = names+nodes[i].name+",";
		}
		if (ids.length > 0 ) ids = ids.substring(0, ids.length-1);
		if (codes.length > 0 ) codes = codes.substring(0, codes.length-1);
		if (names.length > 0 ) names = names.substring(0, names.length-1);
		//$("#esdevice").val(codes);
		$("#esdevice").val(names);//存储名称
		$("#esdeviceId").val(ids);
		$("#esdevice").removeClass("invalid-text").attr('title',"");
	}
	$("#escompany").selectInput({
		url : $.appClient.generateUrl({
			ESParticipatory : "getTree",
			maxLevel : 0
		}, 'x'),
		chkStyle : "radio",
		onCheck : onCheck2,
		width:370,
		height:300,
		treatNodes : treatNodes2
	});
	function treatNodes2(zNodes) {
		var arrays = $("#escompany").val() != null ? $("#escompany").val()
				.split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].code, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
				if (zNodes[i].id == 0) {
					zNodes[i].nocheck = true;
				}
			}else{
				zNodes[i].nocheck=true;
			}
		}
	};
	function onCheck2(event, treeId, treeNode) {
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		var ids = "";
		var codes = "";
		if(treeNode.id!=0){
			$("#escompany").val(treeNode.name);
			$("#escompany").removeClass("invalid-text").attr('title',"");
		}
	}
});
