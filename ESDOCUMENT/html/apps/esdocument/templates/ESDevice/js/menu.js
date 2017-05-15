/**
 * 装置单元模块脚本 dengguoqi 20141021
 */
$(document).ready(function() {
    var setting = {
        view: {
            dblClickExpand: true,
            showLine: false
        },
        data: {
            keep: {
                parent: true
            },
            simpleData: {
                enable: true
            }
        },
        async: {
            autoParam: ['id', 'column', 'path', 'number'],
            enable: false
        },
        callback: {
            onClick: onClick,
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
      //根据 测试要求 取消点击名称打开节点的功能
//        if (treeNode.isParent) {
//            treeObj.expandNode(treeNode);
//        }
        $("#treenodeid").val(treeNode.id); 
        $("#treelevel").val(treeNode.level);
        $("#treefirstNo").val(treeNode.firstNo);
        var url = $.appClient.generateUrl({
            ESDevice: 'getDeviceList',
            id: treeNode.id
        },
        'x');
        $("#esDeviceList").flexOptions({
            newp: 1,
            url: url,
            query: ''
        }).flexReload();
    };
    $.getJSON($.appClient.generateUrl({
        ESDevice: "getTree",
        maxLevel: 3
    },
    'x'),
    function(zNodes) {
        $.fn.zTree.init($("#esStageTree"), setting, zNodes);
        zTreeOnAsyncSuccess();
    });
});