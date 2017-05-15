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
		url : $.appClient.generateUrl({	ESOrgAndUser : 'getOrgListTree'	}, 'x'),// 请求的action路径
		error : function() {// 请求失败处理函数
			alert('请求失败');
		},
		success : function(data) { // 请求成功后处理函数。
			orgTreeNodes = data; // 把后台封装好的简单Json格式赋给treeNodes
			orgZTree = $.fn.zTree.init($("#orgListTree"), orgSetting,orgTreeNodes);
			orgZTree.selectNode(orgZTree.getNodes()[0]);
		}
	});
	function getUserListByOrgId(event, treeId, treeNode) {
		if (treeNode.name == "机构设置") {
			$("#userGrid").flexOptions({url : $.appClient.generateUrl({	ESOrgAndUser : 'findUserListByOrgid'}, 'x'),newp:1}).flexReload();
		}else{
			var orgSeq = treeNode.idseq + treeNode.id;
			$("#userGrid").flexOptions({url : $.appClient.generateUrl({	ESOrgAndUser : 'findUserListByOrgid', orgSeq : orgSeq }, 'x'),newp:1}).flexReload();
		}
	}
});