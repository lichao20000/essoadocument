/**
* 文件收集脚本 xuekun 20141028
*/
$(document).ready(function() {

    $("#esDataList").flexigrid({
        url: false,
        dataType: 'json',
        colModel: [
        {display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
        {
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
            display: '操作',
            name: 'operate',
            width: 60,
            align: 'center'
        },
        {
            display: '项目名称',
            name: 'itemName',
            width: 180,
            align: 'left'
        },
        {
            display: '收集范围名称',
            name: 'stageName',
            width: 150,
            align: 'left'
        },
        {
            display: '装置分类名称',
            name: 'deviceName',
            width: 150,
            align: 'left'
        },
        {
            display: '拟定部门名称',
            name: 'participatoryName',
            width: 150,
            align: 'left'
        },
        {
            display: '文件标题',
            name: 'title',
            width: 200,
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
            name: '添加',
            bclass: 'add',
            onpress: function() {
                add();
            }
        },
        {
            name: '删除',
            bclass: 'delete',
            onpress: function() {
                del();
            }
        },
        {
            name: '筛选',
            bclass: 'filter',
            onpress: function() {
                filter();
            }
        },
        {
            name: '还原数据',
            bclass: 'back',
            onpress: function() {
                back();
            }
        },
        {
            name: '导入',
            bclass: 'import',
            tooltip: '数据导入',
            onpress: batchImport
        },
        {
            name: '导出',
            bclass: 'export',
            tooltip: '数据导出',
            onpress: batchExport
        },
        {
            name: '文件发放',
            bclass: 'all',
            onpress: function() {
                send();
            }
        },
        {
            name: '目录报表',
            bclass: 'report',
            onpress: function() {
                printReport();
            }
        }],
        usepager: true,
        title: '&nbsp;',
        useRp: true,
        width: width,
        height: height,
        showTableToggleBtn: true,
        dblClickResize: true,
        pagetext: '第',
        itemtext: '页',
        outof: '页 /共',
        pagestat: ' 显示 {from} 到 {to}条 / 共{total} 条',
        procmsg: '正在加载数据，请稍候...'
    });
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
      //根据 测试要求 取消点击名称打开节点的功能
//        if (treeNode.isParent) {
//            treeObj.expandNode(treeNode);
//        }
        $("#treenodeid").val(treeNode.id);
        $("#treeCode").val(treeNode.code);
        $("#treeName").val(treeNode.name);
        var param ={};
        if (treeNode.id != -1) {
            var treetype = $("#treeType").val();  
            if(getTreeAndDataAuth.checkTreeAuth(treetype,treeNode.id,"DR")=="true"){
            	 if (treetype == '1') {
            		var ids=[];
            		getChildrenNodesId(treetype,treeNode,treeObj,ids);
                 	param={stageId: treeNode.id,ids:ids.join(",")};
                     initGrid(treeNode.id, $.appClient.generateUrl({
                         ESDocumentsCollection: 'getStageDataList'
                     },
                     'x'),param);
                 } else {
                 	var code=[];//当前节点和子节点的code集合
                 	getChildrenNodesCode(treetype,treeNode,treeObj,code);
                 	var param ={code:code.join(","),treetype:treetype,stageId:0};
                     initGrid(0, $.appClient.generateUrl({
                         ESDocumentsCollection: 'findDocumentList'
                     },
                     'x'),param);
                 }
            }           
        }
    };
    function getChildrenNodesCode(treetype,treeNode,treeObj,code){    	
    	if(getTreeAndDataAuth.checkTreeAuth(treetype,treeNode.id,"DR")=="true"){        
    		if(treeNode.code!="")code.push("'"+treeNode.code+"'");
    		var nodes = treeObj.getNodesByParam("pId",treeNode.id,null);
	    	for(var i=0;i<nodes.length;i++){
	    		getChildrenNodesCode(treetype,nodes[i],treeObj,code);
	    	}   
    	}
    }
    
    function getChildrenNodesId(treetype,treeNode,treeObj,ids){
    	if(getTreeAndDataAuth.checkTreeAuth(treetype,treeNode.id,"DR")=="true"){        
    		if(treeNode.id!="")ids.push(treeNode.id);
    		var nodes = treeObj.getNodesByParam("pId",treeNode.id,null);
	    	for(var i=0;i<nodes.length;i++){	    		
	    		getChildrenNodesId(treetype,nodes[i],treeObj,ids);
	    	}   
    	}
    }
    
    function initGrid(stageId, url, param) {
        var colModel = [
        {display : '数据标识',name :'id',hide:true,width:30,align:'center'},
        {
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
            display: '操作',
            name: 'operate',
            width: 60,
            align: 'center'
        },
        {
            display: '项目名称',
            name: 'itemName',
            width: 180,
            align: 'left'
        },
        {
            display: '收集范围名称',
            name: 'stageName',
            width: 150,
            align: 'left'
        },
        {
            display: '装置分类名称',
            name: 'deviceName',
            width: 150,
            align: 'left'
        },
        {
            display: '拟定部门名称',
            name: 'participatoryName',
            width: 150,
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
        
         //lujixiang 20150423 针对不同的文件、节点的字段不同，所以只显示系统字段,同时也屏蔽了stageId、部门编码...等字段
        if (stageId != null) {
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
                loadGrid(url, colModel,param);
            },
            "json");
        } else {
            loadGrid(url, colModel,param);
        }
    };
    function loadGrid(url, colModel,param) {
        $("#eslist").empty().append('<table id="esDataList"></table>');
        $("#esDataList").flexigrid({
            url: url,
            dataType: 'json',
            query:param,
            colModel: colModel,
            buttons: [{
                name: '添加',
                bclass: 'add',
                onpress: function() {
                    add();
                }
            },
            {
                name: '删除',
                bclass: 'delete',
                onpress: function() {
                    del();
                }
            },
            {
                name: '筛选',
                bclass: 'filter',
                onpress: function() {
                    filter();
                }
            },
            {
                name: '还原数据',
                bclass: 'back',
                onpress: function() {
                    back();
                }
            },
            {
                name: '导入',
                bclass: 'import',
                tooltip: '数据导入',
                onpress: batchImport
            },
            {
                name: '导出',
                bclass: 'export',
                tooltip: '数据导出',
                onpress: batchExport
            },
            {
                name: '文件发放',
                bclass: 'all',
                onpress: function() {
                    send();
                }
            },
            {
                name: '目录报表',
                bclass: 'report',
                onpress: function() {
                    printReport();
                }
            }],
            usepager: true,
            title: '&nbsp;',
            useRp: true,
            width: width,
            height: height,
            showTableToggleBtn: true,
            dblClickResize: true,
            pagetext: '第',
            itemtext: '页',
            outof: '页 /共',
            pagestat: ' 显示 {from} 到 {to}条 / 共{total} 条',
            procmsg: '正在加载数据，请稍候...'
        });
    };
    $.getJSON($.appClient.generateUrl({
        ESDocumentsCollection: "getTree"
    },
    'x'),
    function(zNodes) {
        $.fn.zTree.init($("#esStageTree"), setting, zNodes);
    });
    // 删除收集的文件
    function del() {
        var checks = $("#esDataList").find("input[name='checkname']:checked");
        if (checks.length > 0) {
            $.dialog({
                title: '删除文件',
                width: '300px',
                fixed: true,
                resize: false,
                padding: 0,
                content: "<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>所选文件吗？</div>",
                cancelVal: '取消',
                cancel: true,
                okVal: '确定',
                ok: true,
                ok: function() {
                    var ids = "";
                    var flag = false;
                    var treetype = $("#treeType").val(); 
                    checks.each(function() {
                        var id = $(this).val();
                        if(delRight(treetype,id)){
                        	ids += id + ",";
                        }                        
                    });
                    if(ids==""){
                    	$.dialog.notice({icon: "warning",content: "选择的数据没有删除权限！",time: 3});	
                   	    return false;
                    }
                    var delParam = {ids: ids.substring(0, ids.length - 1)}
                    $.ajax({
                        type: 'POST',
                        url: $.appClient.generateUrl({ESDocumentsCollection: 'checkDataIsSend'},'x'),
                        data: delParam,
                        success: function(msg) {
                            if(msg==""){
                            	 confirmDel(delParam);
                            }else if(msg=="false"){
                            	$.dialog.notice({icon: "warning",content: "删除过程出现异常，请联系管理员！",time: 3});	
                           	    return false;
                            }else if(msg=="isBorrow"){
                            	$.dialog.notice({icon: "warning",content: "删除的文件中存在已经借阅或借出的，不能删除！",time: 3});	
                           	    return false;
                            }else{
                            	$.dialog.notice({icon: "warning",content: "删除的文件中存在已经分发的，不能删除！",time: 3});	
                           	    return false; 
                            }
                        },
                        cache: false
                    });
                },
                cancel: function() {}
            });
        } else {
            $.dialog.notice({icon: "warning",content: "请选择要删除的文件！",time: 3});
            return false;
        }
    };
    
    function delRight(treetype,id){
    	var flag=false;
    	$.ajax({
			type:'POST',
			url:$.appClient.generateUrl({ESDocumentsCollection: "getStageIdsByDocId"},'x'),
			data:{docId:id},
			async:false,
		    success:function(data){
		    	if(data){	    		
		    		if(treetype=="1"){
		    			var treeId=data.split(",")[0];	    			
				    	if(getTreeAndDataAuth.checkTreeAuth(treetype, treeId, "DD")=="true"){			    		
				    		var ids=getTreeAndDataAuth.checkDataAuthFile(treeId,"itemDelete",id);			    		
				    		if(ids=="true" || (ids!="" && ids!="false")){				    			
				    			flag= true;
				    		}
				    	}  
		    		}else{
				    	if(getTreeAndDataAuth.checkTreeAuth(treetype, $("#treenodeid").val(), "DD")=="true"){    		    		
				    		var ids=getTreeAndDataAuth.checkDataAuthFile(data.split(",")[0],"itemDelete",id);
				    		if(ids=="true" || (ids!="" && ids!="false")){
				    			flag= true;
				    		}
				    	} 
		    		}
		    	}	
		    }
	    });  
	    return flag;
    };
    
    function confirmDel(delParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'deleteDocument'
            },
            'x'),
            data: delParam,
            success: function(data) {
                if (data) {
                    // 提示删除成功
                    $.dialog.notice({
                        icon: "success",
                        content: "删除选择的文件成功",
                        time: 3
                    });
                    $("#esDataList").flexReload();
                    // 如果删除的是文件 刷新树
                } else {
                    // 提示删除失败
                    $.dialog.notice({
                        icon: "warning",
                        content: "删除选择的文件失败",
                        time: 3
                    });
                    return false;
                }
            },
            cache: false
        })
    };
    function add() {
        var id = $("#treenodeid").val();
        var name = $("#treeName").val();
        var treeType = $("#treeType").val();
        if (id == 0) {
            $.dialog.notice({icon: "warning",content: "请选择树节点!",time: 3});
            return false;
        }
        if(treeType == 2){
        	
        }else if (treeType ==3){
         var treeCode = $("#treeCode").val();
         if(treeCode==""){
        	 $.dialog.notice({icon: "warning",content: "所选装置为装置区不能添加数据!",time: 3}); 
        	 return false;
         }
        }
        $.ajax({
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'add'
            },
            'x'),
            data: {
                id: id,
                name: name,
                treeType: treeType
            },
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
                            
                            /** lujixiang 20150320 从附件收集时必须上传电子文件 **/
                            if(0 == checkboxs.length && "2" == $("input[name='collectionType']:checked").val()){
                            	$.dialog.notice({
                                    icon: "warning",
                                    content: "请上传原文",
                                    time: 3
                                });
                            	return false;
                            }
                            
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
                    cancel: function() {$("#partId").val('')},
                    init: function() {
                        $("#addDataForm").autovalidate();
                        /*$("#docNo").die().live("click",function(){              
                    		var addParam = $("#addDataForm").serialize();
                    		var url=$.appClient.generateUrl({ESDocumentsCollection: 'getFileCode'},'x');
                    		$.post(url,{nodeId:id,postData:addParam},function(res){
                    			if(res){
                    				$("#docNo").val(res);
                    			}
                    		});                        		
                        });*/
                    }
                });
            },
            cache: false
        });
    };
    function confirmbatchCollection(){
    	
    }
    function confirmAdd(addParam) {
    	var treename = $('#treeName').val();
    	addParam.push({'name':'treename','value':treename});
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'addDocument'
            },
            'x'),
            data: addParam,
            dataType: "json",
            success: function(data) {
                if (data) {
                    $.dialog.notice({
                        icon: "success",
                        content: "文件收集成功!",
                        time: 3
                    });
                    $("#esDataList").flexReload();
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "文件收集失败",
                        time: 3
                    });
                    return false
                }
                $("#partId").val('');
            },
            cache: false
        })
    };
    // 筛选文件
    function filter() {
    	var stageId = 0;
    	if($("#treeType").val() == 1){
    		stageId = $("#treeCode").val();
    	}
        $.ajax({
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'filter'
            },
            'x'),
            data:{stageId:stageId},
            success: function(data) {
                $.dialog({
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
                        var condition = filterValue();
                        $("#esDataList").flexOptions({
                            newp: 1,
                            query: condition
                        }).flexReload();
                    },
                    cancel: function() {}
                });
            },
            cache: false
        });
    };
    // 获取筛选条件
    function filterValue() {
        var where = {};
        var temp = [];
        $("#contents p").each(function(i) {
            var esfields = $("select[name='esfields']").eq(i).val();
            var comparison = $("select[name='comparison']").eq(i).val();
            var esfieldvalue = $("input[name='esfieldvalue']").eq(i).val();
            var relation = $("select[name='relation']").eq(i).val();
            if (esfields) {
                if (relation == "AND") {
                    relation = 'true';
                } else {
                    relation = 'false';
                }
                temp.push(esfields + ',' + comparison + ',' + esfieldvalue + ',' + relation);
            }
        });
        where.condition = temp;
        return where;
    };
    
  //还原数据
	function back() {
		$("#esDataList").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
	};
	
    function send() {
        var checks = $("#esDataList").find("input[name='checkname']:checked");
        var file_id = "";
        if (checks.length == 0) {
            $.dialog.notice({
                icon: "warning",
                content: "请选择文件",
                time: 3
            });
            return false;
        } else {
            checks.each(function() {
                var id = $(this).val();
                file_id += id + ","
            });
            file_id = file_id.substring(0, file_id.length - 1);
        }
        $.ajax({
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'send'
            },
            'x'),
            success: function(data) {
                $.dialog({
                    title: '文件发放',
                    width: '500px',
                    fixed: true,
                    resize: false,
                    padding: 0,
                    content: data,
                    cancelVal: '关闭',
                    cancel: true,
                    okVal: '发放',
                    ok: true,
                    init: function() {
                        $("#sendPage").autovalidate();
                    },
                    button: [{
                        name: '保存待发',
                        callback: function() {
                            if (!$("#sendPage").validate()) {
                                return false;
                            }
                            _titles = [];
                            var checkbox = $("#esDataList").find("input[type='checkbox']:checked");
                            $(checkbox).each(function(){
                            	var title = $(this).closest("tr").find("td[colname='title'] div").text();
                            	_titles.push(title);
                            });
                            
                            var no = $("#no").val();
                            var flowname =  $("#flowId").find("option:selected").text();
                            var fileflow_id = $("#flowId").val();
                            var strMatrix = getMatrixParams();
                            var matrix = jQuery.parseJSON(strMatrix);
                            var nodeType=getParentNode($("#selTreeId").val());
                            var addParam = {
                                selTreeId: $("#selTreeId").val(),
                                no: no,
                                titles:_titles.toString(),
                                fileflow_name:flowname,
                                fileflow_id: fileflow_id,
                                file_id: file_id,
                                matrix: matrix,
                                strMatrix:strMatrix,
                                model :"documentsCollection",
                                nodeType: nodeType
                            };
                            momentumSend(addParam); //待发
                        },
                        disabled: false,
                        focus: true
                    }],
                    ok: function() {
                        if (!$("#sendPage").validate()) {
                            return false;
                        }
                        _titles = [];
                        var checkbox = $("#esDataList").find("input[type='checkbox']:checked");
                        $(checkbox).each(function(){
                        	var title = $(this).closest("tr").find("td[colname='title'] div").text();
                        	_titles.push(title);
                        });
                        
                        var no = $("#no").val();
                        var flowname =  $("#flowId").find("option:selected").text();
                        var fileflow_id = $("#flowId").val();
                        var strMatrix = getMatrixParams();
                        var matrix = jQuery.parseJSON(strMatrix);
                        var nodeType=getParentNode($("#selTreeId").val());
                        var addParam = {
                            selTreeId: $("#selTreeId").val(),
                            no: no,
                            titles:_titles.toString(),
                            fileflow_name:flowname,
                            fileflow_id: fileflow_id,
                            file_id: file_id,
                            matrix: matrix,
                            strMatrix: strMatrix,
                            model :"documentsCollection",
                            nodeType: nodeType
                        };
                        extendSend(addParam); //发放
                    },
                    cancel: function() {
                        //关闭添加窗口
                    }
                });
            },
            cache: false
        });
    };
    //待发
    function momentumSend(addParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentSend: 'momentumSend',
            },
            'x'),
            data: addParam,
            success: function(data) {
                if (data) {
                    //提示添加成功
                    $.dialog.notice({
                        icon: "success",
                        content: "新增待发单成功",
                        time: 3
                    });

                } else {
                    //提示添加失败
                    $.dialog.notice({
                        icon: "error",
                        content: "新增待发单失败",
                        time: 3
                    });
                    return false;
                }
            },
            cache: false
        });
    };
    //发放
    function extendSend(addParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentSend: 'extendSend'
            },
            'x'),
            data: addParam,
            success: function(data) {
                if (data) {
                    //提示添加成功
                    $.dialog.notice({
                        icon: "success",
                        content: "新增发放单成功",
                        time: 3
                    });

                } else {
                    //提示添加失败
                    $.dialog.notice({
                        icon: "error",
                        content: "新增发放单失败",
                        time: 3
                    });
                    return false;
                }
            },
            cache: false
        });
    };
    //获取收发类型
    function getParentNode(pId){
		var treeObj = $.fn.zTree.getZTreeObj("sendTree");
		var parent= getUpNode(treeObj,pId);
		if(parent.name == "设计变更单"){
			return "1";
		}else{
			return "2";
		}
	}
    function getUpNode(treeObj,pId){
		var parent = treeObj.getNodeByParam("id",pId);
		if(parent.pId > 0){			
			return getUpNode(treeObj,parent.pId);
		}else{
			return parent;
		}
	}
	//获取发放流程参数
	function getMatrixParams(){
		var matrix="";
		$("#flowId").find("option").each(function(){
			if($(this).attr("value") == $("#flowId").val()){
				matrix=$(this).attr("matrix");
				return matrix;
			}
		});
		return matrix;
	}
    // 全选
    $("#checkIdList").die().live('click',
    function() {
        $("input[name='checkname']").attr('checked', $(this).is(':checked'));
    });
    $(".editbtn").die().live("click",
    function() {
    	var treetype = $("#treeType").val();  	
		var id=$(this).attr("id");
    	var url=$.appClient.generateUrl({ESDocumentsCollection: "getStageIdsByDocId"},'x');
	    $.post(url,{docId:id},function(data){
	    	if(data){
	    		if(treetype=="1"){
	    			var treeId=data.split(",")[0];
			    	if(getTreeAndDataAuth.checkTreeAuth(treetype, treeId, "DU")=="true"){
			    		var ids=getTreeAndDataAuth.checkDataAuthFile(treeId,"itemEdit",id);
			    		if(ids=="true" || (ids!="" && ids!="false")){
			    			edit(id);
			    		}
			    	}  
	    		}else{
			    	if(getTreeAndDataAuth.checkTreeAuth(treetype, $("#treenodeid").val(), "DU")=="true"){    		    		
			    		var ids=getTreeAndDataAuth.checkDataAuthFile(data.split(",")[0],"itemEdit",id);
			    		if(ids=="true" || (ids!="" && ids!="false")){
			    			edit(id);
			    		}
			    	} 
	    		}
	    	}
	    });    	
    });
    function edit(id) {
        $.post($.appClient.generateUrl({
            ESDocumentsCollection: 'edit'
        },
        'x'), {
            id: id
        },
        function(data) {
            $.dialog({
                title: '编辑文件',
                width: '600px',
                fixed: true,
                resize: false,
                padding: 0,
                content: data,
                cancelVal: '关闭',
                cancel: true,
                okVal: '确认修改',
                ok: true,
                ok: function() {
                    var updateParam = $("#editDataForm").serialize();
                    if (!$("#editDataForm").validate()) {
                        return false;
                    } else {
//                    	  var checkboxs = $("#efiletable").find("input[name='id']");
//                          var files = [];
//                          checkboxs.each(function() {
//                              var tr = $(this).closest("tr");
//                              var selectFile = tr.prop("data").cell;
//                              var file = {};
//                              file.ORIGINAL_ID = selectFile.originalId;
//                              file.ESSTYPE = selectFile.essType == null ? "": selectFile.essType;
//                              file.ESTYPE = selectFile.estype == null ? "": selectFile.estype; //liqiubo 20140729 修复bug90
//                              //手动挂接
//                              files.push(file);
//                          });
//                        confirmUpdate($("#id").val(),updateParam,files);
                        if(!judgeDocumentName()){
                        	return false;
                        }
                        if(!judgeEngineeringName()){
                        	return false;
                        }
                        confirmUpdate(updateParam);
                    }
                },
                cancel: function() {$("#partId").val('')},
                init: function() {
                    $("#editDataForm").autovalidate();
                }
            });
            getFileCode($("#stageId").val());//编辑获取编码规则
        });
    };
//    function confirmUpdate(id,updateParam,files) {
    function confirmUpdate(updateParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'updateDocument'
            },
            'x'),
            data: updateParam,
            success: function(data) {
                if (data == "") {
//                    $.post($.appClient.generateUrl({
//                        ESDocumentsCollection: 'linkFiles'
//                    },
//                    'x'), {
//                        id:id,
//                        files: files,
//                        upload: false
//                    },
//                    function(data) {
//
//                    });
                    $.dialog.notice({
                        icon: "success",
                        content: "修改文件成功!",
                        time: 3
                    });
                    $("#esDataList").flexReload();
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "修改文件失败!",
                        time: 3
                    });
                    return false
                }
            },
            cache: false
        })
    };
    //添加行,删除行按钮
    $('.newfilter').die().live('click',
    function() {
        $($('#contents>p:last').clone()).appendTo($('#contents'));

    });

    $('.delfilter').die().live('click',
    function() {
        $('#contents>p').length > 5 ? $('#contents>p:last').remove() : '';
    });
    function printReport() {
    	//选择报表模版
        var checks = $("#esDataList").find("input[name='checkname']:checked");
        if (checks.length > 0) {
            var display = "none";
            exportReport(display);
        } else {
        	var display = "black";
        	exportReport(display);
        }
    };
    function exportReport(display) {
    	var stageId = 0;
    	if($("#treeType").val() == 1){
    		stageId = $("#treeCode").val();
    	}
    	$.ajax({
		    url:$.appClient.generateUrl({ESDocumentsCollection:'report'},'x'),
		    data:{display:display,stageId:stageId},
		    success:function(data){
		    	$.dialog({
			    	title:'请选择报表',
		    	   	fixed:false,
		    	    resize: false,
			    	content:data,
				    padding:0,
				    content:data,
				    cancelVal: '关闭',
                    cancel: true,
                    okVal: '打印',
                    ok: true,
                    ok: function() {
                    	var condition = {};
                    	var checks = $("#esDataList").find("input[name='checkname']:checked");
                        if (checks.length > 0) {
                            var temp = [];
                            checks.each(function() {
                                temp.push('id,equal,' + $(this).val() + ',false');
                            });
                            condition.condition = temp;
                        } else {
                        	condition = filterValue();
                        }
                    	var reportId=$("input[type='radio'][name='id']:checked").val();
                    	 $.dialog.notice({
                             content: '正在努力打印中,稍后点击“消息提示”进行下载',
                             time: 3
                         });
                         $.ajax({
                             type: 'POST',
                             url: $.appClient.generateUrl({
                                 ESDocumentsCollection: 'printReport'
                             },
                             'x'),
                             data: {
                                 code: $("#treeCode").val(),
                                 treetype: $("#treeType").val(),
                                 reportId:reportId,
                                 query: condition
                             },
                             success: function(data) {
                                 if (data == 'true') {
                                     $.dialog.notice({
                                         icon: "success",
                                         content: "打印报表成功!",
                                         time: 3
                                     });
                                 } else if (data == 'nodata') {
                                     $.dialog.notice({
                                         icon: "error",
                                         content: "没有满足条件的数据!",
                                         time: 3
                                     });
                                 } else {
                                     $.dialog.notice({
                                         icon: "error",
                                         content: "打印报表失败!",
                                         time: 3
                                     });
                                 }
                             },
                             cache: false
                         });
                    },
                    cancel: function() {}
			
			    });
			    },
			    cache:false
		});	
    	
       

    };
    $('input[type="button"]').click(function() {
        $("#treeType").val($(this).attr("treetype"));
        $("#treenodeid").val(0);
        $("#treeCode").val("");
        $.getJSON($.appClient.generateUrl({
            ESDocumentsCollection: "getTree"
        },
        'x'), {
            treetype: $(this).attr("treetype")
        },
        function(zNodes) {
            $.fn.zTree.init($("#esStageTree"), setting, zNodes);
        });
    });
//----xiewenda ---===============导入导出功能===================
    function batchExport() {
        var checkTr = $("#esDataList input[name='checkname']:checked");
        var doucmentid = checkTr.val();
        if (checkTr.length > 0) {
        // 钩选数据时,display:'none'不显示筛选面板
         url = $.appClient.generateUrl({ ESDocumentsCollection: 'export',display: 'none'},'x');
        } else {
            var treetype = $("#treeType").val();
            var treenodeid = $("#treenodeid").val();
            var treeCode = $("#treeCode").val();
            // 未钩选数据时,显示筛选面板
            url = $.appClient.generateUrl({ESDocumentsCollection: 'export',
                display: 'block',
                treetype: treetype,
                treenodeid: treenodeid},
                'x');
        }
        $.ajax({
            url: url,
            success: function(data) {
                $.dialog({
                    id: 'artbatchExportPanel',
                    title: '数据导出',
                    fixed: true,
                    resize: false,
                    content: data,
                    width: 600,
                    okVal: '导出',
                    ok: exportCallBack,
                    init: function() {
                        var form = $('#esfilter');
                        form.autovalidate();
                    },
                    cancelVal: '关闭',
                    cancel: true
                });
            },
            cache: false
        });
    }

    // 数据导出
    function exportCallBack() {
        var checkTr = $("#esDataList input[name='checkname']:checked");
        var id_length = checkTr.length;
        var exportType = $("input[name='export_formats']:checked").val();
        // 验证是否选择导出格式
        if (exportType == "") {
            $.dialog.notice({ title: '操作提示',content: '至少选择一种导出格式',icon: 'warning',time: 2});
            return false;
        }
        var treenodeid = $("#treenodeid").val();
        var treecode = $("#treeCode").val();
        var treename = $("#treeName").val();
        var treetype = $("#treeType").val();
        // 添加导出电子文件选项
        var resource = "no";
        if ($("#resource").attr("checked")) {
            resource = "yes";
        }
        if (id_length) { // 勾选导出
            var ids = [];
            $(checkTr).each(function() {
                ids.push($(this).val());
            });
            ids = ids.join(',');
            $.dialog.notice({ content: '正在努力导出中，稍后请在消息中下载',icon:'succeed',time: 3});
            $.post($.appClient.generateUrl({ESDocumentsCollection: 'ExportSelData'},'x'), {
                treenodeid: treenodeid,
                treename:treename,
                ids: ids,
                exportType: exportType,
                resource: resource
            },
            function(result) {
                if (result.msg == 'error') {
                    $.dialog.notice({content: '导出失败',icon: 'error',time: 3});
                } else if (result.msg == 'nothing') {
                    $.dialog.notice({content: '没有筛选到数据',icon: 'warning',time: 3});
                }else{
                	//下载提醒移到消息中，添加此提醒 
                    $.dialog.notice({ content: '导出完毕，请到消息中下载',icon:'succeed',time: 3});
                }
            });
        } else { // 筛选导出
/*            var form = $('#esfilter');
            var flag = form.validate();
            if (!flag) {
                return false;
            }*/
            var filedname = $(".filedname");
            var comparison = $(".comparison");
            var filedvalue = $(".filedvalue");
            var relationship = $(".relationship");
            var condition = "";
            for (var i = 0; i < filedname.size(); i++) {
                if (filedname[i].value == "") continue;
                if (filedvalue[i].value == "") {
                    $.dialog.notice({content: '请输入完整的条件!',icon: 'error',time: 3});
                    return false;
                }
                //需要验证禁止输入", ||" filedvalue值
                condition = condition + filedname[i].value + "," + comparison[i].value + "," + filedvalue[i].value + "," + relationship[i].value + "&";
            }
            if (condition == "") {
                $.dialog.notice({ content: '请输入过滤的条件!',icon: 'warning',time: 3});
                return false;
            }
            condition = condition.substring(0, condition.length-1);
            $.dialog.notice({ content: '正在努力导出中，稍后请在消息中下载',icon:'succeed',time: 3});
            $.post($.appClient.generateUrl({ESDocumentsCollection: 'exportFilterData'}),
            {
                treenodeid: treenodeid,
                treetype: treetype,
                treecode: treecode,
                treename:treename,
                condition: condition,
                exportType: exportType,
                resource: resource
            },
            function(result) {
                if (result == 'error') {
                    $.dialog.notice({content: '导出失败',icon: 'error',time: 3});
                } else if (result == 'nothing') {
                    $.dialog.notice({content: '没有筛选到数据',icon: 'warning',time: 3});
                }else{
                	//下载提醒移到消息中，添加此提醒 
                    $.dialog.notice({ content: '导出完毕，请到消息中下载',icon:'succeed',time: 3});
                }
            });
        }
    }
    
    //------------导入---------------
    /**
	 * 生成数据导入第一步界面
	 * wanghongchen 20140429
	 */
    function batchImport() {
        var treename = $('#treeName').val();
        var treecode = $('#treeCode').val();
        var treenodeid = $("#treenodeid").val();
        var treetype = $("#treeType").val();
        if(treetype!="1"){
       	 $.dialog.notice({content: '选择阶段下的列表进行数据导入！',icon: 'warning',time: 2});
            return;	
        }
        if (treecode == "") {
            $.dialog.notice({content: '请选择导入数据节点',icon: 'warning',time: 2});
            return;
        }
       
        var url = $.appClient.generateUrl({ESDocumentsCollection: 'importStep1'},'x');
        $.ajax({
            url: url,
            data: {
                treecode: treecode,
                treename: treename,
                treenodeid: treenodeid,
                treetype: treetype
            },
            success: function(data) {
                $.dialog({
                    id: 'importDialog',
                    title: '数据导入（第一步）',
                    width: '860px',
                    height: '460px',
                    fixed: true,
                    resize: false,
                    content: data,
                    cancelVal: '关闭',
                    cancel: true,
                    padding: '10px',
                    button: [{
                        id: 'btnNext',
                        name: '下一步',
                        callback: importSetting
                    }],
                    cancel: function() {
                        this.close();
                    }
                });
            }
        });
    }

    /**
	 * 导入设置字段对应界面
	 * wanghongchen 20140429
	 */
    function importSetting() {
        $.ajax({
            async: false,
            url: $.appClient.generateUrl({ESDocumentsCollection: 'getImportUrl'},'x'),
            success: function(url) {
                $('#importStep1').ajaxSubmit({
                    url: url,
                    dataType: "text",
                    success: function(data) {
                        if (data == "success") {
                            importSettingSuccess();
                            art.dialog.list["importDialog"].hide();
                        } else {
                            $.dialog.notice({icon: 'warning',content: data,time: 3});
                        }
                    },
                    error: function() {
                        $.dialog.notice({icon: 'error',content: "系统错误，请联系管理员",time: 3});
                    }
                });
            }
        });
        return false;
    }
    function importSettingSuccess() {
        var treecode = $('#treeCode').val();
        var treenodeid = $("#treenodeid").val();
        var treetype = $("#treeType").val();
        $.ajax({
            async: false,
            url: $.appClient.generateUrl({ESDocumentsCollection: 'importSetting'},'x'),
            data: {
                treenodeid: treenodeid,
                treetype: treetype,
                treecode: treecode
            },
            success: function(data) {
                $.dialog({
                    id: 'importSetting',
                    title: '数据导入（第二步）',
                    width: '860px',
                    height: '460px',
                    fixed: true,
                    resize: false,
                    content: data,
                    cancelVal: '关闭',
                    cancel: true,
                    padding: '0',
                    button: [{
                        id: 'btnNext',
                        name: '上一步',
                        callback: function() {
                            art.dialog.list["importDialog"].show();
                        }
                    },
                    {
                        id: 'btnImport',
                        name: '导入',
                        callback: realImport
                    }],
                    cancel: function() {
                        art.dialog.list["importDialog"].close();
                    }
                });
            }
        });
    }
    
    /**
	 * excel,dbf导入实现
	 */
	function realImport(){
		
		var list = new Array();
		var matchFlag = false;
		var path = "";
		$("#tabs li").each(function(){
			var matchMap = new Array();
			var tid = $(this).attr("id");
			var tType = tid.split("~~")[0];
			var tPath = tid.split("~~")[1];
			path = tPath;
			$("#structure-table-"+tType+" tr").each(function(){
				var tv1 =  $.trim($(this).find("td:nth-child(1) div").text());
				var tv2 = $(this).find("td:nth-child(2) div").text();
				if(tv1 != null &&tv1 != ""){
					matchMap.push({"source":tv1,"target":tv2});
				}
			});
			if(matchMap.length <= 0){
				$.dialog.notice({icon:'warning',content:'标签"'+$(this).find("a").text()+'"尚未对应字段！',time:3});
				matchFlag = true;
				return false;
			}
			list.push({"key":tPath,"value":matchMap});
		});
		if(matchFlag){
			return false;
		}
		$.ajax({
			url:$.appClient.generateUrl({ESDocumentsCollection:'realImport'},'x'),
			data:{mData:list,path:path},
			type:"post",
			dataType:'json',
			success:function(data){
				if(data.result=="success"){
					$.dialog.notice({icon:'succeed',content:data.msg,time:3});
					$('#esDataList').flexReload();
					art.dialog.list["importDialog"].close();
				}else{
					$.dialog.notice({icon:'warning',content:data.msg,time:3});
				}
			}
		});
	}
});

//-------------导入导出end------------------------------------------

