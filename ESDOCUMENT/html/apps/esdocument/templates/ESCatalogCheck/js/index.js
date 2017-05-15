$(document).ready(function() {
    $("#errlist").css({
        width: width,
        height: height / 2 + 95
    });
    $("#esDataList").flexigrid({
        url: false,
        dataType: 'json',
        colModel: [{
            display: '序号',
            name: 'num',
            width: 20,
            align: 'center'
        },
        {
            display: '<input type="checkbox" id="checkIdList">',
            name: 'ids',
            width: 20,
            align: 'center'
        },
        {
            display: '项目名称',
            name: 'itemName',
            width: 220,
            align: 'left'
        },
        {
            display: '收集范围名称',
            name: 'stageName',
            width: 120,
            align: 'left'
        },
        {
            display: '装置分类名称',
            name: 'deviceName',
            width: 120,
            align: 'left'
        },
        {
            display: '拟定部门名称',
            name: 'participatoryName',
            width: 120,
            align: 'left'
        },
        {
            display: '文件标题',
            name: 'title',
            width: 360,
            align: 'left'
        },
        {
            display: '文件编码',
            name: 'docNo',
            width: 120,
            align: 'left'
        },
        {
            display: '拟定人',
            name: 'person',
            width: 60,
            align: 'left'
        },
        {
            display: '拟定日期',
            name: 'date',
            width: 80,
            align: 'center'
        }],
        buttons: [{
            name: '按装置号筛选',
            bclass: 'filter',
            onpress: function() {
                filter();
            }
        },
        {
            name: '自动检查',
            bclass: 'export',
            onpress: function() {
                archiveCheck();
            }
        }],
        usepager: true,
        title: '&nbsp;',
        nomsg: "没有数据",
        useRp: true,
        width: width,
        height: height / 2 - 100,
        showTableToggleBtn: true,
        dblClickResize: true,
        pagetext: '第',
        itemtext: '页',
        outof: '页 /共',
        pagestat: ' 显示 {from} 到 {to}条 / 共{total} 条',
        procmsg: '正在加载数据，请稍候...'
    });
    var rowNumberIndex = 0;
    $('#errorList').treegrid({
        iconCls: 'icon-save',
        fit: true,
       // nowrap: false,
        rownumbers: false,
        animate: true,
        collapsible: true,
        striped: false,
        loadMsg: "数据加载中。。。。",
        url: false,
        idField: 'id',
        treeField: 'name',
      //  singleSelect: false,
        toolbar: "#tb",
        //singleSelect: true,
        rowStyler: function(index, row) {
            return 'height:35px';
        },

        // pagination:true,
        columns: [[{
            title: '序号',
            field: 'id',
            align: 'center',
            width: 50,
            formatter: function(val, row, index) {
                rowNumberIndex++;
                return rowNumberIndex;
            }
        },
        {
            title: '名称',
            field: 'name',
            rowspan: 1,
            width: 420,
            align: 'left'
        },
        {
            title: '分类代码',
            field: 'code',
            rowspan: 2,
            width: 250,
            align: 'left',
            formatter: function(val, row, index) {
                if (row.isnode != 1) {
                    return val;
                } else {
                    return "";
                }
            }
        },
        {
            title: '保管期限',
            field: 'period',
            rowspan: 2,
            width: 250,
            align: 'center',
            formatter: function(val, row, index) {
                if (row.isnode != 1) {
                    return val;
                } else {
                    return "";
                }
            }
        }
        //        ,{
        //            title: '操作',
        //            field: 'isnode',
        //            width: 100,
        //            rowspan: 2,
        //            align: 'center',
        //            formatter: function(val, rec) {
        //                if (val == "1") {
        //                    return;
        //                } else {
        //                    return "<a href='javascript:void(0)' onClick='stageDocument(\"" + rec.id + "\")'>收集文件</a> ";
        //                }
        //            }
        //        },
        ]],
        onBeforeLoad: function() {
            rowNumberIndex = 0;
        },
        onClickRow: function(row) {
            if (row.isnode == 0) {
                stageDocument(row.id,row.name);
            } else {
                $("#errorList").treegrid("unselect", row.id);
            }
        }
    });
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
        $("#treenodeid").val(treeNode.id); // 选择树时保存选择节点id
        $("#deviceId").val("0"); // 选择树时保存选择节点id
        $("#devicename").val("0"); // 选择树时保存选择节点名称
        if (treeNode.id != 0) {
            initGrid(treeNode.id);
        }
    };
    $.getJSON($.appClient.generateUrl({
        ESDocumentsCollection: "getTree"
    },
    'x'),
    function(zNodes) {
        $.fn.zTree.init($("#esStageTree"), setting, zNodes);
    });
    function initGrid(stageId) {
        var colModel = [{
            display: '序号',
            name: 'num',
            width: 20,
            align: 'center'
        },
        {
            display: '<input type="checkbox" id="checkIdList">',
            name: 'ids',
            width: 20,
            align: 'center'
        },
        {
            display: '项目名称',
            name: 'itemName',
            width: 220,
            align: 'left'
        },
        {
            display: '收集范围名称',
            name: 'stageName',
            width: 120,
            align: 'left'
        },
        {
            display: '装置分类名称',
            name: 'deviceName',
            width: 120,
            align: 'left'
        },
        {
            display: '拟定部门名称',
            name: 'participatoryName',
            width: 120,
            align: 'left'
        }/*,
        {
            display: '文件标题',
            name: 'title',
            width: 360,
            align: 'left'
        },
        {
            display: '文件编码',
            name: 'docNo',
            width: 120,
            align: 'left'
        },
        {
            display: '拟定人',
            name: 'person',
            width: 60,
            align: 'left'
        },
        {
            display: '拟定日期',
            name: 'date',
            width: 80,
            align: 'center'
        }*/];
        
        /** lujixiang 20150330 列名重复 **/
        
        $.post($.appClient.generateUrl({
            ESDocumentsCollection: "getMetaData"
        },
        'x'), {
            stageId: stageId
        },
        function(data) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    colModel.push(data[i]);
                }
            }
            loadGrid(stageId, colModel);
        },
        "json");

    };
    function loadGrid(stageId, colModel) {
        $("#eslist").empty().append('<table id="esDataList"></table>');
        $('#errorList').treegrid('loadData', {
            total: 0,
            rows: []
        });
        $("#esDataList").flexigrid({
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'getStageDataList',
            },
            'x'),
            dataType: 'json',
            query:{stageId: stageId},
            colModel: colModel,
            buttons: [{
                name: '按装置号筛选',
                bclass: 'filter',
                onpress: function() {
                    filter(this,stageId);
                }
            },
            {
                name: '自动检查',
                bclass: 'export',
                onpress: function() {
                    archiveCheck();
                }
            }],
            usepager: true,
            title: '&nbsp;',
            nomsg: "没有数据",
            useRp: true,
            width: width,
            height: height / 2 - 100,
            showTableToggleBtn: true,
            pagetext: '第',
            itemtext: '页',
            outof: '页 /共',
            pagestat: ' 显示 {from} 到 {to}条 / 共{total} 条',
            procmsg: '正在加载数据，请稍候...'
        });
    };
    // 全选
    $("#checkIdList").die().live('click',
    function() {
        $("input[name='checkname']").attr('checked', $(this).is(':checked'));
    });
    // 筛选装置
    function filter(obj,stageId) {
        $.ajax({
            url: $.appClient.generateUrl({
                ESCatalogCheck: 'filter'
            },
            'x'),
            success: function(data) {
                dia2 = $.dialog({
                    title: '筛选数据',
                    width: '600px',
                    fixed: true,
                    resize: false,
                    padding: 0,
                    content: data,
                    cancelVal: '关闭',
                    cancel: true,
                    okVal: '筛选',
                    ok: true,
                    ok: function() {
                        var deviceCode = $("#deviceNo").val();
                        checkDevice(deviceCode,stageId);
                    },
                    cancel: function() {}
                });
            },
            cache: false
        });
    };
    //选择装置
    function checkDevice(deviceCode,stageId) {
        var where = {};
        where.deviceCode = deviceCode;
        where.stageId = stageId;
        $("#esDataList").flexOptions({
            newp: 1,
            query: where
        }).flexReload();
    };
    // 检查
    function archiveCheck() {
        $('#eslist').animate({
            height: (height / 2 + 15) + 'px'
        },
        'slow');
        var stageId = $("#treenodeid").val();
        $("#errorList").treegrid({
            url: $.appClient.generateUrl({
                ESCatalogCheck: "findNoDataNodeList"
            },
            'x'),
            queryParams: {
                stageId: stageId,
                deviceId: $("#deviceId").val()
            },
            method: "post"
        });
    };

});
function stageDocument(stageId,stageName) {
    $.ajax({
        url: $.appClient.generateUrl({
            ESDocumentsCollection: 'stageDocument'
        },
        'x'),
        data: {
            stageId: stageId,
            stageName: stageName,
            deviceId: $("#deviceId").val(),
            deviceName: $("#devicename").val()
        },
        type: "POST",
        success: function(data) {
            $.dialog({
                title: '添加文件数据',
                width: '600px',
                fixed: true,
                resize: false,
                padding: 0,
                content: data,
                cancelVal: '关闭',
                cancel: true,
                okVal: '确认添加',
                ok: true,
                ok: function() {
                    if (!$("#addDataForm").validate()) {
                        return false;
                    } else {
                    	var checkboxs = $("#efiletable").find("input[name='id']");
                        if(checkboxs.length>0){
                        	var files = [];
                            checkboxs.each(function() {
                                var tr = $(this).closest("tr");
                                var selectFile = tr.prop("data").cell;
                                var file = {};
                                file.ORIGINAL_ID = selectFile.originalId;
                                file.ESTITLE=selectFile.estitle;
                                file.ESSTYPE = selectFile.essType == null ? "": selectFile.essType;
                                file.ESTYPE = selectFile.estype == null ? "": selectFile.estype; //liqiubo 20140729 修复bug90
                                files.push(file);
                            });
                            $("#fileList").val(JSON.stringify(files));
                        }
                        var addParam = $("#addDataForm").serializeArray();
                        if(!judgeDocumentName()){
                        	return false;
                        }
                        if(!judgeEngineeringName()){
                        	return false;
                        }
                        confirmAdd(addParam);
                    }

                },
                cancel: function() {},
                init: function() {
                    $("#addDataForm").autovalidate();
                }
            });
        },
        cache: false
    });
};
function confirmAdd(addParam) {
    $.ajax({
        type: 'POST',
        url: $.appClient.generateUrl({
            ESDocumentsCollection: 'addDocument'
        },
        'x'),
        data: addParam,
        success: function(data) {
            if (data) {
                $.dialog.notice({
                    icon: "success",
                    content: "文件收集成功!",
                    time: 3
                });
                $("#esDataList").flexOptions({
                    newp: 1
                }).flexReload();
            } else {
                $.dialog.notice({
                    icon: "error",
                    content: "文件收集失败",
                    time: 3
                });
                return false
            }
        },
        cache: false
    })
};