$(document).ready(function() {
	
    $("#engineeringGrid").flexigrid({
        url:false,
        dataType: 'json',
        colModel: [
        {display : '数据标识',name :'id',hide:true,width:30,align:'center'},          
        {
            display: '序号',
            name: 'num',
            width: 30,
            align: 'center'
        },
        {
            display: '<input type="checkbox" id="engineeringList">',
            name: 'ids',
            width: 15,
            align: 'center'
        },
        {
            display: '操作',
            name: 'operate',
            width: 30,
            sortable: true,
            align: 'center'
        },
        {
            display: '文件专业名称',
            name: 'typeName',
            metadata: 'typeName',
            width: 250,
            align: 'left'
        },
        {
            display: '文件专业代码',
            name: 'typeNo',
            metadata: 'typeNo',
            width: 200,
            align: 'left'
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
        singleSelect: true,
        usepager: true,
        title: '文件类型管理',
        useRp: true,
        rp: 20,
        nomsg: "没有数据",
        showTableToggleBtn: false,
        pagetext: '第',
        outof: '页 /共',
        width: width,
        height: height,
        pagestat: ' 显示 {from} 到 {to}条 / 共{total} 条'
    });

    // 全选
    $("#engineeringList").die().live('click',
    function() {
        $("input[name='checkName']").attr('checked', $(this).is(':checked'));
    });
    function del() {
        var checks = $("#engineeringGrid").find("input[name='checkName']:checked");
        if (checks.length > 0) {
            $.dialog({
                title: '删除文件专业代码',
                width: '300px',
                fixed: true,
                resize: false,
                padding: 0,
                content: "<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>所选文件专业代码吗？</div>",
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
			$.dialog.notice({icon:"warning",content:"请选择要删除的文件专业代码！",time:3});
			return false;
		}
    };
    function confirmDel(delParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESEngineering: 'deleteEngineering'
            },
            'x'),
            data: delParam,
            success: function(data) {
                if (data) {
                    // 提示删除成功
                    $.dialog.notice({
                        icon: "success",
                        content: "删除选择的文件专业代码成功",
                        time: 3
                    });
                    $("#engineeringGrid").flexOptions().flexReload();
                } else {
                    // 提示删除失败
                    $.dialog.notice({
                        icon: "warning",
                        content: "删除选择的文件专业代码失败",
                        time: 3
                    });
                    return false;
                }
            },
            cache: false
        })
    };
    function add() {
     	if($("#selTreeId").val()==0){
 	       $.dialog.notice({
                icon: "warning",
                content: "请选择参建单位!",
                time: 3
            });
            return false;
     	}
        $.ajax({
            url: $.appClient.generateUrl({
                ESEngineering: 'add'
            },
            'x'),
            success: function(data) {
                dia2 = $.dialog({
                    title: '添加文件专业代码',
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
                    	$("#participatoryId").val($("#selTreeId").val());
                        var addParam = $("#addDataForm").serialize();
                        if (!$("#addDataForm").validate()) {
                            return false;
                        }
                        var typeNo = $("#typeNo").val();
    		    		if(!uniqueTypeNo(typeNo,"",$("#participatoryId").val())){
    		    			return false;
    		    		}
                        confirmAdd(addParam);
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
                ESEngineering: 'addEngineering'
            },
            'x'),
            data: addParam,
            success: function(data) {
                if (data) {
                    $.dialog.notice({
                        icon: "success",
                        content: "添加文件专业代码成功!",
                        time: 3
                    });
                    $("#engineeringGrid").flexOptions().flexReload();
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "添加文件专业代码失败",
                        time: 3
                    });
                    return false
                }
            },
            cache: false
        })
    };
    $(".editbtn").die().live("click",
    function() {
        edit($(this).attr("id"));
    });
    function edit(id) {
        $.post($.appClient.generateUrl({
            ESEngineering: 'edit'
        },
        'x'), {
            id: id
        },
        function(data) {
            dia2 = $.dialog({
                title: '编辑文件专业代码',
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
                    var updateParam = $("#editDataForm").serialize();
                    if (!$("#editDataForm").validate()) {
                        return false;
                    }
                    var typeNo = $("#typeNo").val();
                    var participatoryId = $("#selTreeId").val();
		    		if(!uniqueTypeNo(typeNo,$("#oldTypeNo").val(),participatoryId)){
		    			return false;
		    		}
                    confirmUpdate(updateParam);
                },
                cancel: function() {},
                init: function() {
                    $("#editDataForm").autovalidate();
                }
            });
        });
    };
    function confirmUpdate(updateParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
                ESEngineering: 'updateEngineering'
            },
            'x'),
            data: updateParam,
            success: function(data) {
                if (data == "") {
                    $.dialog.notice({
                        icon: "success",
                        content: "修改文件专业代码成功!",
                        time: 3
                    });
                    $("#engineeringGrid").flexOptions().flexReload();
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "修改文件专业代码失败",
                        time: 3
                    });
                    return false
                }
            },
            cache: false
        })
    };
    
  //=================xiewenda 添加导入导出功能=================================
    var dataTable = "ess_engineering";
    function batchExport() {
        var checkTr = $("#engineeringGrid input[name='checkName']:checked");
        var doucmentid = checkTr.val();
        if (checkTr.length > 0) {
            // 钩选数据时,display:'none'不显示筛选面板
        url = $.appClient.generateUrl({ESEngineering: 'export',display: 'none'},'x');
        } else {
            url = $.appClient.generateUrl({ESEngineering: 'export',display: 'block',dataTable:dataTable},'x');
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
        var checkTr = $("#engineeringGrid input[name='checkName']:checked");
        var id_length = checkTr.length;
        var exportType = $("input[name='export_formats']:checked").val();
        // 验证是否选择导出格式
        if (exportType == "") {
            $.dialog.notice({title: '操作提示',content: '至少选择一种导出格式',icon: 'warning',time: 3});
            return false;
        }
        var treenodeid =$("#selTreeId").val();
        var treename =$("#treename").val();
        // 添加导出电子文件选项
        var resource = "no";
        $.dialog.notice({icon: 'success',content: '正在努力导出中，稍后请在消息中下载',time: 3});
        if (id_length) { // 勾选导出
            var ids = [];
            $(checkTr).each(function() {
                ids.push($(this).val());
            });
            ids = ids.join(',');
            $.post(
            $.appClient.generateUrl({ESDocumentStage: 'ExportSelData'},'x'),
            { treenodeid: treenodeid,ids: ids,exportType: exportType,treename:treename,resource: resource,dataTable:dataTable},
            function(result) {
                if (result == 'error') {
                    $.dialog.notice({content: '导出失败！',icon: 'error',time: 3});
                } else if (result == 'nothing') {
                    $.dialog.notice({content: '没有筛选到数据！',icon: 'warning',time: 3});
                }else{
                    $.dialog.notice({icon: 'success',content: '导出成功！',time: 3});
                }
            }
         );
        } else { // 筛选导出

        	/** lujixiang 20150326 添加导出全部数据判断 **/
        	var condition = [];
        	
        	if(!$("#export_all").is(':checked')){
        	
	            var filedname = $("#filterContents .filedname");
	            var comparison = $("#filterContents .comparison");
	            var filedvalue = $("#filterContents .filedvalue");
	            var relationship = $("#filterContents .relationship");
	            
	            for (var i = 0; i < filedname.size(); i++) {
	                if (filedname[i].value == "") continue;
	                if (filedvalue[i].value == "") {
	                    $.dialog.notice({content: '请输入完整的条件!',icon: 'error',time: 3});
	                    return false;
	                }
	                var relation = "";
	                if (relationship[i].value == "AND") {
	                	relation = 'true';
	                } else {
	                	relation = 'false';
	                }
	                //需要验证禁止输入", ||" filedvalue值
	                temp = filedname[i].value + "," + comparison[i].value + "," + filedvalue[i].value + "," + relation ;
	                condition.push(temp);
	            }
	            if (condition.length < 1) {
	                $.dialog.notice({content: '请输入过滤的条件!',icon: 'warning',time: 3});
	                return false;
	            }
            
        	}
            $.post($.appClient.generateUrl({ESDocumentStage: 'exportFilterData'}),
            {
                treenodeid: treenodeid,
                condition: condition,
                exportType: exportType,
                treename: treename,
                resource: resource,
                dataTable:dataTable
            },
            function(result) {

                if (result == 'error') {
                    $.dialog.notice({content: '导出失败！',icon: 'error',time: 3});
                } else if (result == 'nothing') {
                    $.dialog.notice({content: '没有筛选到数据！',icon: 'warning',time: 3});
                }else{
                    $.dialog.notice({icon: 'success',content: '导出成功！',time: 3});
                }
            });

        }

    }

    //------------导入---------------
    /**
	 * 生成数据导入第一步界面
	 */
    function batchImport() {
       
        var treenodeid =$("#selTreeId").val();
        var treename = $("#treename").val();
        var treecode = $("#treecode").val();
        if (treenodeid  == "0") {
            $.dialog.notice({content: '请选择导入数据节点',icon: 'warning',time: 3});
            return;
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
			url:$.appClient.generateUrl({ESDocumentStage:'realImport'},'x'),
			data:{mData:list,path:path},
			type:"post",
			dataType:'json',
			success:function(data){
				if(data.result=="success"){
					$.dialog.notice({icon:'succeed',content:data.msg,time:3});					
					art.dialog.list["importDialog"].close();
					$('#engineeringGrid').flexReload();
				}else{
					$.dialog.notice({icon:'warning',content:data.msg,time:3});
				}
			}
		});
	}
	//------导入导出 end----------------------------------------------------------

	//文件专业代码唯一验证
	function uniqueTypeNo(typeNo,oldTypeNo,participatoryId){
		var flag=true;
		if(typeNo!=oldTypeNo){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESEngineering:'uniqueTypeNo'},'x'),
				data:{typeNo:typeNo,participatoryId:participatoryId},
				async:false,//同步设置
				success:function(data){
					if(data>0){
						$("#typeNo").addClass("invalid-text");
						$("#typeNo").attr('title',"此结构下文件专业代码已存在");
	    				flag=false;
	    				return false;
	    			}
					$("#typeNo").removeClass("invalid-text");
					$("#typeNo").attr('title',"");
				}
			});
		}
		return flag;
	}
});