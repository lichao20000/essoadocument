$(document).ready(function() {
	var orgZTree;
	var orgTreeNodes;
	var orgSetting = {
		isSimpleData : true, // 数据是否采用简单 Array 格式，默认false
		showLine : true, // 是否显示节点间的连线
		checkable : false, // 每个节点上是否显示 CheckBox
		data : {
			simpleData : {
				enable : true,
			}
		},
		async : {
			enable : true,
			type : "get",
			autoParam : [ 'id' ],
			url : $.appClient.generateUrl({ESOrgAndUser : 'expandOrgListTree'}, 'x')
		},
		callback : {
			onClick : getUserListByOrgId
		}
	};
	$.ajax({
		async : false,
		cache : false,
		type : 'POST',
		dataType : "json",
		url : $.appClient.generateUrl({	ESOrgAndUser : 'getOrgListTreeNew'	}, 'x'),// 请求的action路径
		error : function() {// 请求失败处理函数
			alert('请求失败');
		},
		success : function(data) { // 请求成功后处理函数。
			orgTreeNodes = data; // 把后台封装好的简单Json格式赋给treeNodes
			orgZTree = $.fn.zTree.init($("#wfModelStep_Select_Organ_Tree"), orgSetting,orgTreeNodes);
//			orgZTree.selectNode(orgZTree.getNodes()[0]);
		}
	});
	function getUserListByOrgId(event, treeId, treeNode) {
		if (treeNode.name == "系统机构") {
			$('#wfModelStep_Select_Tree').attr('selectNodeId',0);// 记录点击的树节点ID
			modelStep.userOrganListSearchKeyWord(0, "");
		}else{
			var orgSeq = treeNode.idseq + treeNode.id;
			$('#wfModelStep_Select_Tree').attr('selectNodeId',treeNode.id);// 记录点击的树节点ID
			modelStep.userOrganListSearchKeyWord(treeNode.id, "");
		}
	}
});