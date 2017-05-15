$(document).ready(function() {
    $("#device").selectInput({
        url: $.appClient.generateUrl({
            ESDevice: "getTree",
            maxLevel: 0
        },
        'x'),
        chkStyle: "radio",
        onCheck: onCheck,
        width: 370,
        height: 300,
        treatNodes: treatNodes
    });
    function treatNodes(zNodes) {
        var arrays = $("#device").val() != null ? $("#device").val().split(',') : new Array();
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
            } else {
                zNodes[i].nocheck = true;
            }
        }
    };
    function onCheck(event, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        if(!treeNode.id==0 && !treeNode.code==''){
	        $("#deviceNo").val(treeNode.code);
	        $("#device").val(treeNode.name);
	        $("#deviceId").val(treeNode.id);
	        $("#devicename").val(treeNode.name);
        }
    }
});