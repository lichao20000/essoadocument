var g = {	
		treeNode: undefined
	};
$(document).ready(function() {
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
        async: {
            autoParam: ['id', 'column', 'path', 'number'],
            enable: true
        },

        callback: {
            onClick: onClick

        }
    };

    function zTreeOnAsyncSuccess() {
        var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
        var rootNode = treeObj.getNodeByParam("id", 0);
        if (rootNode) {
            treeObj.selectNode(rootNode);
        }
    };
    function onClick(e, treeId, treeNode) {
        var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
//        if (treeNode.isParent) {
//            treeObj.expandNode(treeNode);
//        }
        //g.treeNode = treeNode;
        $("#treenodeid").val(treeNode.id); // 选择树时保存选择节点id
        $("#treelevel").val(treeNode.level); // 选择树时保存选择节点id
        $("#treeid_seq").val(treeNode.id_seq); // 选择树时保存选择节点id
        $("#treename").val(treeNode.name); // 选择树时保存选择节点id
        $("#treecode").val(treeNode.code); // 选择树时保存选择节点id
        $("#treepaperWay").val(treeNode.paperWay); // 选择树时保存选择节点id
        var ids=[];
		ids.push(treeNode.id);
		ids=getChildren(ids,treeNode);
		var pId="";
		for(var i=0;i<ids.length;i++){
			pId+=","+ids[i];
		}
		pId=(pId.length>0)?pId.substr(1):"";
        var url = $.appClient.generateUrl({
            ESDocumentStage: 'findStageList',
            id: pId
        },
        'x');
        $("#esStageList").flexOptions({
            newp: 1,
            url: url,
            query: ''
        }).flexReload();

    };
    $.getJSON($.appClient.generateUrl({
        ESDocumentStage: "getTree",
        isnode: 1
    },
    'x'),
    function(zNodes) {
        $.fn.zTree.init($("#esStageTree"), setting, zNodes);
        zTreeOnAsyncSuccess();
    });

  //获取选中节点下的所有子节点id
	function getChildren(ids,treeNode){
		if (treeNode.isParent){
			for(var obj in treeNode.children){
				ids.push(treeNode.children[obj].id);
				getChildren(ids,treeNode.children[obj]);
			}
		}
		return ids;
	}
});