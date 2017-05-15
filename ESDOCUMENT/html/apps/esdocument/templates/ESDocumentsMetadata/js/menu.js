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
    function onClick(e, treeId, treeNode) {
        var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
//        if (treeNode.isParent) {
//            treeObj.expandNode(treeNode);
//        }
        if (treeNode.code != '') {
            $("#treenodeid").val(treeNode.id); // 选择树时保存选择节点id
            var url = $.appClient.generateUrl({
                ESDocumentsMetadata: 'getMetadataList',
                stageId: treeNode.id
            },
            'x');
            $("#esMetadataList").flexOptions({
                newp: 1,
                url: url,
                query: ''
            }).flexReload();
        } else {
            treeObj.cancelSelectedNode(treeNode);
        }
    };
    $.getJSON($.appClient.generateUrl({
        ESDocumentStage: "getTree"
    },
    'x'),
    function(zNodes) {
        $.fn.zTree.init($("#esStageTree"), setting, zNodes);
    });

});