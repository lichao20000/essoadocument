/**
 * 
 */
$(document).ready(function() {
    var setting = {
        view: {
            dblClickExpand: false,
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
     //根据 测试要求 取消点击名称打开节点的功能
//        if (treeNode.isParent) {
//            treeObj.expandNode(treeNode);
//        }
        if(treeNode.pId==-1){
        	treeObj.cancelSelectedNode(treeNode);
        	return false;
        }
        $("#selTreeId").val(treeNode.id); //选择树时保存选择节点id
        $("#treename").val(treeNode.name); // 选择树时保存选择节点id
        $("#treecode").val(treeNode.code); // 选择树时保存选择节点id
        var url = $.appClient.generateUrl({
            ESEngineering: 'findEngineeringList',
            participatoryId: treeNode.id
        },
        'x');
        $("#engineeringGrid").flexOptions({
            newp: 1,
            url: url
        }).flexReload();
    };

    // 获取参建单位树目录
    flushTree();
    function flushTree() {
        // 获取参建单位树目录
        $.getJSON($.appClient.generateUrl({
            ESParticipatory: "getTree"
        },
        'x'),
        function(zNodes) {
            $.fn.zTree.init($("#esStageTree"), setting, zNodes);
        });
    };
});