/**
 * 文件收集范围 xuekun 20141028
 */
$(document).ready(function() {
    $("#esStageList").flexigrid({
        url: $.appClient.generateUrl({ESDocumentStage: 'findStageList'},'x'),
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
            display: '名称',
            name: 'name',
            width: 350,
            align: 'left'
        },
        {
            display: '分类代码',
            name: 'code',
            width: 230,
            align: 'left'
        },
        {
            display: '保管期限',
            name: 'period',
            width: 80,
            align: 'center'
        },{
	    	display: '未来组卷方式',
	        name: 'paperWay',
	        width: 120,
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
                filter()
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
        }

        ],
        usepager: true,
        title: '&nbsp;',
        useRp: true,
        width: width,
        height: height
    });
    function add() {
        $.ajax({
            url: $.appClient.generateUrl({
                ESDocumentStage: 'add'
            },
            'x'),
            success: function(data) {
                dia2 = $.dialog({
                    title: '添加文件收集范围',
                    width: '500px',
                    fixed: true,
                    resize: false,
                    padding: 0,
                    content: data,
                    cancelVal: '关闭',
                    cancel: true,
                    okVal: '确认添加',
                    ok: true,
                    ok: function() {
                        $("#level").val(parseInt($("#treelevel").val()) + 1);
                        $("#pId").val($("#treenodeid").val());
                        $("#id_seq").val($("#treeid_seq").val()+$("#treenodeid").val()+".");
                        var addParam = $("#addDataForm").serialize();
                        if (!$("#addDataForm").validate()) {
                            return false;
                        } else {
                        	if(!uniqueName($("#name"),"",$("#pId").val(),$("#level").val())){
    			    			return false;
    			    		}
    			    		if(!uniqueCode($("#code"),"")){
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
                ESDocumentStage: 'addStage'
            },
            'x'),
            data: addParam,
            success: function(data) {
                if (data) {
                    $.dialog.notice({
                        icon: "success",
                        content: "添加文件收集范围成功!",
                        time: 3
                    });
                    $("#esStageList").flexOptions({
                        newp: 1
                    }).flexReload();
                    var child = jQuery.parseJSON(data);
                    if(child.isnode==1){
                    	 var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
                         var node = treeObj.getNodeByParam("id", $("#treenodeid").val());
                       
                         if (node) {
                             treeObj.addNodes(node, [child]);
                         }
                    }
                   
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "添加文件收集范围失败",
                        time: 3
                    });
                    return false
                }
            },
            cache: false
        })
    };
    
    //收集范围名称唯一验证
	function uniqueName(name,oldName,pId,level){
		var flag=true;
		var partName=name.val().trim();
		if(partName!=oldName.trim()){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESDocumentStage:'uniqueName'},'x'),
				data:{name:partName,pId:pId,level:level},
				async:false,//同步设置
				success:function(data){
					if(data=="false"){
						name.addClass("invalid-text");
						name.attr('title',"此收集范围名称已存在");
	    				flag=false;
	    				return false;
	    			}
					name.removeClass("invalid-text");
					name.attr('title',"");
				}
			});
		}
		return flag;
	}
	
	//收集范围代码唯一验证
	function uniqueCode(code,oldCode){
		var flag=true;
		var partCode=code.val();
		if(partCode!=oldCode){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESDocumentStage:'uniqueCode'},'x'),
				data:{code:partCode},
				async:false,//同步设置
				success:function(data){
					if(data=="false"){
						code.addClass("invalid-text");
						code.attr('title',"此收集范围代码已存在");
	    				flag=false;
	    				return false;
	    			}
					code.removeClass("invalid-text");
					code.attr('title',"");
				}
			});
		}
		return flag;
	}
	
    function del() {
        var checks = $("#esStageList").find("input[name='checkName']:checked");
        if (checks.length > 0) {
            $.dialog({
                title: '删除文件收集范围',
                width: '300px',
                fixed: true,
                resize: false,
                padding: 0,
                content: "<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>所选文件收集范围吗？</div>",
                cancelVal: '取消',
                cancel: true,
                okVal: '确定',
                ok: true,
                ok: function() {
                    var ids = "";
                    checks.each(function() {
                        var id = $(this).val();
                        ids += id + ","
                    });
                    var delParam = {
                        ids: ids.substring(0, ids.length - 1)
                    }
                    confirmDel(delParam);
                },
                cancel: function() {}
            });
        }else{
        	$.dialog.notice({
				icon: "warning",
				content: "请选择要删除的数据!",
				time: 3
			});
			return false;
        }
    };
    function confirmDel(delParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentStage: 'deleteStage'
            },
            'x'),
            data: delParam,
            success: function(data) {
                if (data) {
                    // 提示删除成功
                    $.dialog.notice({
                        icon: "success",
                        content: "删除选择的文件收集范围成功",
                        time: 3
                    });
                    $("#esStageList").flexOptions({
                        newp: 1
                    }).flexReload();
                    // 如果删除的是文件收集范围 刷新树
                        var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
                        var nodes = treeObj.getSelectedNodes();
                        var ids = new Array(); // 定义一数组
                        ids = delParam.ids.split(","); // 字符分割
                        for (i = 0; i < ids.length; i++) {
                            var treeNode = treeObj.getNodeByParam("id", ids[i]);
                            if (treeNode&&treeNode.isnode==1) {
                                treeObj.removeNode(treeNode);
                            }
                        }
                } else {
                    // 提示删除失败
                    $.dialog.notice({
                        icon: "warning",
                        content: "删除选择的文件收集范围失败",
                        time: 3
                    });
                    return false;
                }
            },
            cache: false
        })
    };
    function filter() {
        $.ajax({
            url: $.appClient.generateUrl({
                ESDocumentStage: 'filter'
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
                        var condition = filterValue();
                        $("#esStageList").flexOptions({
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
        var $where = {};
        var temp = [];
        $("#contents p").each(function(i) {
            var esfields = $("select[name='esfields']").eq(i).val();
            var comparison = $("select[name='comparison']").eq(i).val();
            var esfieldvalue = $("input[name='esfieldvalue']").eq(i).val();
            var relation = $("select[name='relation']").eq(i).val();
            //判断一下组卷的值 这个也可以在选择组卷方式字段是 变为下拉框选择
            if(esfields == "paperWay"){
            	if(comparison=="equal" || comparison=="like"){
            		comparison="equal";
            	}else{
            		comparison="notEqual";
            	}
            }            
            if (esfields) {
                if (relation == "AND") {
                    relation = 'true';
                } else {
                    relation = 'false';
                }
                temp.push(esfields + ',' + comparison + ',' + esfieldvalue + ',' + relation);
            }
        });
        $where.condition = temp;
        return $where;
    };
    // 全选
    $("#checkIdList").die().live('click',
    function() {
        $("input[name='checkName']").attr('checked', $(this).is(':checked'));
    });
    $(".editbtn").die().live("click",
    function() {
        edit($(this).attr("id"));
    });
    function edit(id) {
        $.post($.appClient.generateUrl({
            ESDocumentStage: 'edit'
        },
        'x'), {
            id: id
        },
        function(data) {
            dia2 = $.dialog({
                title: '编辑文件收集范围',
                width: '500px',
                fixed: true,
                resize: false,
                padding: 0,
                content: data,
                cancelVal: '关闭',
                cancel: true,
                okVal: '确认修改',
                ok: true,
                ok: function() {
                    if (!$("#editDataForm").validate()) {
                        return false;
                    } else {
                    	if(!uniqueName($("#name"),$("#oldName").val(),$("#pId").val(),$("#level").val())){
			    			return false;
			    		}
			    		if(!uniqueCode($("#code"),$("#oldCode").val())){
			    			return false;
			    		}
			    		//去掉disabled属性  让节点值传到后台
			    		$("#editDataForm").find("input[name='isnode']").removeAttr("disabled");
	                    var updateParam = $("#editDataForm").serialize();
                     var flag = confirmUpdate(updateParam,$("#code").val(), $("#id").val(), $("#name").val(),$("input[name='isnode']:checked").val());
                     if(!flag){
                    	//修改失败重新加入disabled属性  让前台不能编辑
                    	 $("#editDataForm").find("input[name='isnode']").attr("disabled",true);
                     }
                     return flag;
                    }
                },
                cancel: function() {},
                init: function() {
                    $("#editDataForm").autovalidate();
                }
            });
        });
    };
    function confirmUpdate(updateParam, code,id, name,isnode) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESDocumentStage: 'updateStage'
            },
            'x'),
            data: updateParam,
            success: function(data) {
                if (data == "") {
	                    $.dialog.notice({
	                        icon: "success",
	                        content: "修改文件收集范围成功!",
	                        time: 3
	                    });
	                    $("#esStageList").flexReload();
	                    var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
	                    var treeNode = treeObj.getNodeByParam("id", id);
	                    if(treeNode){
	                        if(isnode==0){
	                            treeObj.removeNode(treeNode);
	                        }else{
	                        	treeNode.name = name;
		                        treeObj.updateNode(treeNode);
	                        }
                    	}else{
                    		
		                    if(isnode==1){
	                    	 var node = treeObj.getNodeByParam("id", $("#treenodeid").val());
	                         if (node) {
	                        	 var editnode = {'id':id,'pId':node.id,'name':name,'code':code,'isnode':1};　//创建一个数组
	                        	 treeObj.addNodes(node, editnode);
	                         }
		                    }
                    	}
	                    return true;
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "修改文件收集范围失败",
                        time: 3
                    });
                    return false
                }
            },
            cache: false
        })
    };

    function back() {
        $("#esStageList").flexOptions({ newp: 1,query: ''}).flexReload();
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
    $("input[name='isnode']").die().live('click',function(){
    	var type=$(this).val();
    	//var paperWayTr= $("#paperWay").closest("tr");
    	if(type==0)
    	{
    		//paperWayTr.hide();
    		$('#paperWay').attr("disabled","disabled");
    	}
    	else if(type==1)
    	{
    		//paperWayTr.show();
    		$('#paperWay').removeAttr("disabled");
    	}
    });
    
//=================xiewenda 添加导入导出功能=================================
    var dataTable = "ess_document_stage";
    function batchExport() {
        var checkTr = $("#esStageList input[name='checkName']:checked");
        var doucmentid = checkTr.val();
        if (checkTr.length > 0) {
            // 钩选数据时,display:'none'不显示筛选面板
        url = $.appClient.generateUrl({ESDocumentStage: 'export',display: 'none'},'x');
        } else {
        url = $.appClient.generateUrl({ESDocumentStage: 'export',display: 'block',dataTable:dataTable},'x');
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
        var checkTr = $("#esStageList input[name='checkName']:checked");
        var id_length = checkTr.length;
        var exportType = $("input[name='export_formats']:checked").val();
        // 验证是否选择导出格式
        if (exportType == "") {
            $.dialog.notice({ title: '操作提示',content: '至少选择一种导出格式',icon: 'warning',time: 2});
            return false;
        }
        var treenodeid = $("#treenodeid").val();
        var treename = $("#treename").val();
      //  var treetype = $("#treeid_seq").val();
        // 添加导出电子文件选项
        var resource = "no";
        if (id_length) { // 勾选导出
            var ids = [];
            $(checkTr).each(function() {
                ids.push($(this).val());
            });
            ids = ids.join(',');
            $.post(
            $.appClient.generateUrl({ESDocumentStage: 'ExportSelData'},'x'),
            { treenodeid: treenodeid,treename:treename,ids: ids,exportType: exportType,resource: resource,dataTable:dataTable},
            function(result) {
                if (result == 'error') {
                    $.dialog.notice({content: '导出失败',icon: 'error',time: 2 });
                } else if (result == 'nothing') {
                    $.dialog.notice({content: '没有筛选到数据',icon: 'warning',time: 2});
                }else{
                	$.dialog.notice({content: '正在努力导出中，稍后请在消息中下载',icon: 'success',time: 3});
                }
            }
         );
        } else { // 筛选导出
            /*var form = $('#filterContents');
            var flag = form.validate();
            if (!flag) {
                return false;
            }*/
            var filedname = $("#filterContents .filedname");
            var comparison = $("#filterContents .comparison");
            var filedvalue = $("#filterContents .filedvalue");
            var relationship = $("#filterContents .relationship");
            
            var condition = [];
            for (var i = 0; i < filedname.size(); i++) {
                if (filedname[i].value == "") continue;
                if (filedvalue[i].value == "") {
                    $.dialog.notice({content: '请输入完整的条件!',icon: 'error',time: 3});
                    return false;
                }
                var comValue=comparison[i].value;
                if(filedname[i].value == "paperWay"){
                	if(comValue=="equal" || comValue=="like"){
                		comValue="equal";
                	}else{
                		comValue="notEqual";
                	}
                }   
                var relation = "";
                if (relationship[i].value == "AND") {
                	relation = 'true';
                } else {
                	relation = 'false';
                }
                //需要验证禁止输入", ||" filedvalue值
                temp = filedname[i].value + "," + comValue + "," + filedvalue[i].value + "," + relation ;
                condition.push(temp);
            }
            //获取目录树节点及下级节点id
            var pId = ''; 
	        var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
	        var ids=[];
	        ids.push(treenodeid);
		    var node = treeObj.getNodeByParam("id",treenodeid);
		    ids=getChildren(ids,node);				
		    for(var i=0;i<ids.length;i++){
			   pId+=","+ids[i];
			}
		    pId=(pId.length>0)?pId.substr(1):"";
            
            $.post($.appClient.generateUrl({ ESDocumentStage: 'exportFilterData'}),
            {
                treenodeid: pId,
                treename: treename,
               // treecode: treecode,
                condition: condition,
                exportType: exportType,
                resource: resource,
                dataTable:dataTable
            },
            function(result) {

                if (result == 'error') {
                    $.dialog.notice({content: '导出失败',icon: 'error',time: 3});
                } else if (result == 'nothing') {
                    $.dialog.notice({content: '没有筛选到数据',icon: 'warning',time: 3});
                }else{
                	$.dialog.notice({content: '正在努力导出中，稍后请在消息中下载',icon: 'success',time: 3});                	
                }
                //wanghongchen 下载提醒移到消息中 20140811
                //					else{
                //						$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载导出数据</a>',icon: 'succeed'});
                //					}
            });

        }

    }
    
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

    //------------导入---------------
    /**
	 * 生成数据导入第一步界面
	 */
    function batchImport() {
       
        var treenodeid = $("#treenodeid").val();
        var treename = $("#treename").val();
        var treecode = $("#treecode").val();
        if (treenodeid  == "0") {
        	treecode = "root";
        }
        var url = $.appClient.generateUrl({ESDocumentStage: 'importStep1'},'x');
        $.ajax({
            url: url,
            data: {
            	treenodeid: treenodeid,
                treename : treename,
                treecode : treecode,
                treetype : dataTable
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
	 */
    function importSetting() {
        $.ajax({
            async: false,
            url: $.appClient.generateUrl({ESDocumentStage: 'getImportUrl'},'x'),
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
        $.ajax({
            async: false,
            url: $.appClient.generateUrl({ESDocumentStage: 'importSetting'},'x'),
            data: {},
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
		 var treename = $("#treename").val();
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
		//wanghongchen 20140818 如果存在未设置对应关系的tag返回false
		if(matchFlag){
			return false;
		}
		$.ajax({
			url:$.appClient.generateUrl({ESDocumentStage:'realImport'},'x'),
			data:{mData:list,path:path},
			type:"post",
			dataType:'json',
			success:function(data){
				if(data.result=="success"){
					$.dialog.notice({icon:'success',content:data.msg,time:3});
					art.dialog.list["importDialog"].close();
					var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
                    var nodes = treeObj.getSelectedNodes();
                    var treeNode = treeObj.getNodeByParam("id", nodes[0].id);
					// 如果导入的是文件收集范围 刷新树
                    if(data.stagenameList != "null"){
                        treeObj.removeChildNodes(nodes[0]);
                        treeObj.addNodes(treeNode, data.stagenameList);
                    }
                    var ids=[];
            		ids.push(treeNode.id);
            		ids=getChildren(ids,treeNode);
            		var pId="";
            		for(var i=0;i<ids.length;i++){
            			pId+=","+ids[i];
            		}
            		pId=(pId.length>0)?pId.substr(1):"";
                    var url = $.appClient.generateUrl({ESDocumentStage: 'findStageList',id: pId},'x');
                    $("#esStageList").flexOptions({url: url, query: ''}).flexReload();
				}else{
					$.dialog.notice({icon:'warning',content:data.msg,time:3});
				}
			}
		});
	}
	//------导入导出 end----------------------------------------------------------
	
});