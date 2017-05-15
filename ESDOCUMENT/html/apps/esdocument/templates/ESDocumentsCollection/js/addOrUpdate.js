$(document).ready(function() {
    var id = $("#id").length > 0 ? $("#id").val() : 0;
    $("#deviceName[class='selectInput']").selectInput({
        url: $.appClient.generateUrl({
            ESDevice: "getTree"
        },
        'x'),
        chkStyle: "radio",
        treatNodes: treatNodes,
        onCheck: checkDevice,
        width: 300,
        height: 300
    });
    function treatNodes(zNodes) {
        var arrays = $("#deviceName").val() != null ? $("#deviceName").val().split(',') : new Array();
        for (var i = 0; i < zNodes.length; i++) {
            if (zNodes[i].code != '') {
                if ($.inArray(zNodes[i].name, arrays) == -1) {
                    zNodes[i].checked = false;
                    $("#deviceCode").attr("value", "");
                    $("#deviceName").val("");
                } else {
                    zNodes[i].checked = true;
                }
            }
            if (zNodes[i].id == 0 || zNodes[i].code == '') {
                zNodes[i].nocheck = true;
            }
        }
    };
    function checkDevice(event, treeId, treeNode) {
    	
    if(!treeNode.id==0 && !treeNode.code==''){
        $("#deviceCode").attr("value", treeNode.code);
        $("#deviceName").val(treeNode.name);
        $("#deviceName").removeClass("invalid-text");
        notIndexOf();//解决ie8不支持indexOf的方法
        if(ruleDocNo.indexOf("deviceCode") !=-1){
			$("#docNo").val("");
			for(var i = 0;i<ruleDocNo.length;i++){
				if(releation[i] == true || releation[i] == 'true'){
    				$("#docNo").val($("#docNo").val()+$('#'+ruleDocNo[i]).val());
    			}else{
    				$("#docNo").val($("#docNo").val()+ruleDocNo[i]);
    			}
			}
			$.ajax({
	            type: "POST",
	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
	            success: function(data) {
	            	if(data != 'false'){
	            		$("#docNo").val($("#docNo").val()+data);
	            	}else{
	            		$("#docNo").val($("#docNo").val()+'0001');
	            	}
	            }
			});
		}
    }
    }
    $("#participatoryName[class='selectInput']").selectInput({
        url: $.appClient.generateUrl({
            ESParticipatory: "getTree"
        },
        'x'),
        chkStyle: "radio",
        onCheck: checkPart,
        treatNodes: treatParts,
        width: 300,
        height: 300
    });
    function checkPart(event, treeId, treeNode) {
    	$("#partId").val('');
    	if(!treeNode.id == 0 && !treeNode.code == ''){
        $("#participatoryCode").attr("value", treeNode.code);
        $("#participatoryName").val(treeNode.name);
        $("#participatoryName").removeClass("invalid-text");
        notIndexOf();//解决ie8不支持indexOf的方法
        if(ruleDocNo.indexOf("participatoryCode") !=-1){
        	$("#docNo").val("");
			for(var i = 0;i<ruleDocNo.length;i++){
				if(releation[i] == true || releation[i] == 'true'){
    				$("#docNo").val($("#docNo").val()+$('#'+ruleDocNo[i]).val());
    			}else{
    				$("#docNo").val($("#docNo").val()+ruleDocNo[i]);
    			}
			}
			$.ajax({
	            type: "POST",
	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
	            success: function(data) {
	            	if(data != 'false'){
	            		$("#docNo").val($("#docNo").val()+data);
	            	}else{
	            		$("#docNo").val($("#docNo").val()+'0001');
	            	}
	            }
			});
		}
    	}
    	//获取目录树节点及下级节点id
    	 var ids=[];
    	 var pId = '';
 		ids.push(treeNode.id);
 		ids=getChildren(ids,treeNode);
 		for(var i=0;i<ids.length;i++){
 			if(ids[i] != '' && ids[i] != 'undefined' && ids[i] != undefined){
 				pId+=","+ids[i];
 			}
 		}
 		pId=(pId.length>0)?pId.substr(1):"";
 		$("#partId").val(pId);
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
    function treatParts(zNodes) {
        var arrays = $("#participatoryName").val() != null ? $("#participatoryName").val().split(',') : new Array();
        for (var i = 0; i < zNodes.length; i++) {
            if (zNodes[i].code != '') {
                if ($.inArray(zNodes[i].name, arrays) == -1) {
                    zNodes[i].checked = false;
                } else {
                    zNodes[i].checked = true;
                }
            }
            if (zNodes[i].id == 0 || zNodes[i].code == '') {
                zNodes[i].nocheck = true;
            }
        }
    }
    var stageId = $("#stageId").val();
    if (stageId == '') {
        stageId = 0;
    }
    $("#stageName[class='selectInput']").selectInput({
        url: $.appClient.generateUrl({
            ESDocumentStage: "getTree",
            id: stageId
        },
        'x'),
        chkStyle: "radio",
        width: 300,
        height: 300,
        onCheck: onCheck,
        treatNodes: treatStage
    });
    function treatStage(zNodes) {
        var arrays = $("#stageName").val() != null ? $("#stageName").val().split(',') : new Array();
        for (var i = 0; i < zNodes.length; i++) {
            if (zNodes[i].code != '') {
                if ($.inArray(zNodes[i].code, arrays) == -1) {
                    zNodes[i].checked = false;
                } else {
                    zNodes[i].checked = true;
                }
            }
            if (zNodes[i].isnode == 1) {
                zNodes[i].nocheck = true;
            }
        }
    }
    function onCheck(event, treeId, treeNode) {
    	if(treeNode.isnode==0){
        $("#stageCode").attr("value", treeNode.code);
        $("#stageName").attr("value", treeNode.name);
        $("#stageName").removeClass("invalid-text");
        $("#stageId").val(treeNode.id);
        $.ajax({
            type: "GET",
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'judegeIsExitesDocnoRule'
            },
            'x'),
            data: {
                stageId: treeNode.id
            },
            success: function(data) {
                if (data != 'false') {
                    addFormFiled(treeNode.id);
                	var url=$.appClient.generateUrl({ESDocumentsCollection: 'getFileCode'},'x');
                	$.post(url,{stageId:treeNode.id,tagIds:data},function(res){
                		var jsondata = eval('(' + res + ')');
                		$("#docNo").val("");
                		ruleDocNo = [];
                		releation = [];
                		for(var i = 0;i<jsondata.nums;i++){
                			if(jsondata["flag"+i] == true || jsondata["flag"+i] == 'true'){
                				$("#docNo").val($("#docNo").val()+$('#'+jsondata[i]).val());
                			}else{
                				$("#docNo").val($("#docNo").val()+jsondata[i]);
                			}
                			ruleDocNo.push(jsondata[i]);
                			releation.push(jsondata["flag"+i]);
                		}
                		$.ajax({
            	            type: "POST",
            	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
            	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
            	            success: function(data) {
            	            	if(data != 'false'){
            	            		$("#docNo").val($("#docNo").val()+data);
            	            	}else{
            	            		$("#docNo").val($("#docNo").val()+'0001');
            	            	}
            	            }
            			});	
                    });
                } else {
                	addFormFiled(treeNode.id);
                    $.dialog.notice({
                        content: '请在文件元数据模块中为该节点设置文件编码规则!',
                        time: 3,
                        icon: 'warning'
                    });
                    $("#docNo").val("");
                    ruleDocNo = [];
                    releation = [];
                    return false;
                }
            }
        });
    	}else{
    		 $("#stageCode").attr("value", "");
    	     $("#stageName").attr("value", "");
    	     $("#stageId").val("");
    	     $("#docNo").val("");
    	}
    };
    $("#documentBtn").click(function(){
    	if($("#treeType").val() == 2){//参见单位部门
    		$("#partId").val(getPidForClick());
    	}
    	if($("#participatoryCode")!='' && $("#partId").val() == ''){
    		getPartIdByCode($("#participatoryCode").val());
    	}
    	$.ajax({
		    url:$.appClient.generateUrl({ESDocumentsCollection:'documentType'},'x'),
		    data:{pId: $("#partId").val()},
		    success:function(data){
		    	$.dialog({
			    	title:'请选择文件类型代码',
		    	   	fixed:false,
		    	    resize: false,
			    	content:data,
				    padding:0,
				    content:data,
				    cancelVal: '关闭',
                    cancel: true,
                    okVal: '选择',
                    ok: true,
                    ok: function() {
                     $("#documentCode").val('');
                     var typeNO=$("input[type='radio'][id='checkName']:checked").attr("typeNO");
                     var typeName=$("input[type='radio'][id='checkName']:checked").attr("typeName");
                      $("#documentCode").val(typeNO);
                      $("#documentName").val(typeName);
                      $("#documentName").removeClass("invalid-text").attr("title","");
                      notIndexOf();//解决ie8不支持indexOf的方法
                      if(ruleDocNo.indexOf("documentCode") !=-1){
                    	$("#docNo").val("");
              			for(var i = 0;i<ruleDocNo.length;i++){
              				if(releation[i] == true || releation[i] == 'true'){
                  				$("#docNo").val($("#docNo").val()+$('#'+ruleDocNo[i]).val());
                  			}else{
                  				$("#docNo").val($("#docNo").val()+ruleDocNo[i]);
                  			}
              			}
              			$.ajax({
            	            type: "POST",
            	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
            	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
            	            success: function(data) {
            	            	if(data != 'false'){
            	            		$("#docNo").val($("#docNo").val()+data);
            	            	}else{
            	            		$("#docNo").val($("#docNo").val()+'0001');
            	            	}
            	            }
            			});
              		  }
                    },
                    cancel: function() {}
			
			    });
			    },
			    cache:false
		});	
    });
    $("#engineeringBtn").click(function(){
    	if($("#treeType").val() == 2){//参见单位部门
    		$("#partId").val(getPidForClick());
    	}
    	if($("#participatoryCode")!='' && $("#partId").val() == ''){
    		getPartIdByCode($("#participatoryCode").val());
    	}
    	$.ajax({
		    url:$.appClient.generateUrl({ESDocumentsCollection:'engineering'},'x'),
		    data:{pId: $("#partId").val()},
		    success:function(data){
		    	$.dialog({
			    	title:'请选择文件专业代码',
		    	   	fixed:false,
		    	    resize: false,
			    	content:data,
				    padding:0,
				    content:data,
				    cancelVal: '关闭',
                    cancel: true,
                    okVal: '选择',
                    ok: true,
                    ok: function() {
                     $("#engineeringCode").val('');
                     var typeNO=$("input[type='radio'][id='checkName']:checked").attr("typeNO");
                     var typeName=$("input[type='radio'][id='checkName']:checked").attr("typeName");
                     $("#engineeringCode").val(typeNO);
                     $("#engineeringName").val(typeName);
                     $("#engineeringName").removeClass("invalid-text");
                     notIndexOf();//解决ie8不支持indexOf的方法
                     if(ruleDocNo.indexOf("engineeringCode") !=-1){
                    	$("#docNo").val("");
             			for(var i = 0;i<ruleDocNo.length;i++){
             				if(releation[i] == true || releation[i] == 'true'){
                 				$("#docNo").val($("#docNo").val()+$('#'+ruleDocNo[i]).val());
                 			}else{
                 				$("#docNo").val($("#docNo").val()+ruleDocNo[i]);
                 			}
             			}
             			$.ajax({
            	            type: "POST",
            	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
            	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
            	            success: function(data) {
            	            	if(data != 'false'){
            	            		$("#docNo").val($("#docNo").val()+data);
            	            	}else{
            	            		$("#docNo").val($("#docNo").val()+'0001');
            	            	}
            	            }
            			});
                     }
                    },
                    cancel: function() {}
			
			    });
			    },
			    cache:false
		});	
    });
    //当treeType为2的时候
    function getPidForClick(){
    	pId = '';
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
        var nodes = treeObj.getSelectedNodes();
        var treeNode = treeObj.getNodeByParam("id", nodes[0].id);
		//获取目录树节点及下级节点id
   	 	var ids=[];
   	 	ids.push(nodes[0].id);
   	 	ids=getChildren(ids,treeNode);
   	 	for(var i=0;i<ids.length;i++){
   	 		if(ids[i] != '' && ids[i] != 'undefined' && ids[i] != undefined){
				pId+=","+ids[i];
			}
		}
		pId=(pId.length>0)?pId.substr(1):"";	
    	return pId;
    }
    function getPartIdByCode(partCode){
    	$.ajax({
            type: "POST",
            url: $.appClient.generateUrl({ESDocumentsCollection: 'getPartIdByCode'},'x'),
            data: {partCode:partCode},
            async:false,
            success: function(data) {
            	if(data != 'false'){
            		$("#partId").val(data);
                }
            }
		});
    }
    //手动输入，失去焦点判断
    $("#documentName,#engineeringName").die('blur').live('blur',function(event){
    	if($("#treeType").val() == 2){//参见单位部门
    		$("#partId").val(getPidForClick());
    	}
		var type = "";
		var name = "";
		if(event.target.id=="documentName"){//类型代码
			if($("#documentName").val()==''){
				return;
			}else{
				type = "ess_document_type";
				name = $("#documentName").val();
			}
		}else if(event.target.id=="engineeringName"){//专业代码
			if($("#documentName").val()==''){
				return;
			}else{
				type = "ess_engineering";
				name = $("#engineeringName").val();
			}
		}
		$.ajax({
            type: "POST",
            url: $.appClient.generateUrl({ESDocumentsCollection: 'checkInputCode'},'x'),
            data: {type:type,name:name,pId:$("#partId").val()},
            success: function(data) {
            	if(type == 'ess_document_type'){//类型代码
            		if(data == 'false'){
                		$("#documentName").addClass("invalid-text").attr("title","你输入的数据当前部门下不存在，请重新输入！");
                	}else if(data == 'repeat'){
                		if($("#documentCode").val() == ''){
                			$("#documentName").addClass("invalid-text").attr("title","当前部门下存在相同的名称，请手动选择！");
                		}
                	}else{
                		$("#documentCode").val(data);
                	}
            	}else if(type == 'ess_engineering'){//专业代码
            		if(data == 'false'){
                		$("#engineeringName").addClass("invalid-text").attr("title","你输入的数据当前部门下不存在，请重新输入！");
                	}else if(data == 'repeat'){
                		if($("#engineeringCode").val() == ''){
                			$("#engineeringName").addClass("invalid-text").attr("title","当前部门下存在相同的名称，请手动选择！");
                		}
                	}else{
                		$("#engineeringCode").val(data);
                	}
            	}
            }
		});
	});
    
    $("#documentName,#engineeringName").die('change').live('change',function(event){
		if(event.target.id=="documentName"){//类型代码
			$("#documentCode").val('');
		}else if(event.target.id=="engineeringName"){//专业代码
			$("#engineeringCode").val('');
		}
    });
    function addFormFiled(stageId) {
        removeFormFiled();
        $.ajax({
            type: "GET",
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'getFileds'
            },
            'x'),
            data: {
                stageId: stageId
            },
            dataType: "json",
            success: function(data) {
                var obj = eval(data);
                $(obj).each(function(index) {
                    var val = obj[index];
                    var isNull = '';
                    var edittage = '';
                    var liwidth = '260px';
                    var datetime="";
                    var defaultValue='';
					if (val.defaultValue!=null){
						defaultValue=val.defaultValue;
					}
                    if (val.type == 'TIME') {
                    	datetime = 'class="Wdate" onClick="WdatePicker({dateFmt:\'HH:mm:ss\'})"';
					}
                    if (val.type == 'DATE') {
                    	datetime = 'class="Wdate" onClick="WdatePicker()"';
                    }
                    if (val.isNull == '1') {
                        isNull = '<font color="red" size="3">*</font>';
                    }
                    if (val.type == 'BOOL') {
                    	edittage = '<select type="text" name="' + val.name + '" id="' + val.name + '" verify="'+val.verify+'" isedit="1" class="notselectInput"><option value="是">是</option><option value="否" selected="'+defaultValue+'">否</option></select>';
					}else{
	                    if (val.length >= 100) {
	                        liwidth = '525px';
	                        edittage = '<textarea  name="' + val.name + '" id="' + val.name + '"   style="width:430px;" verify="'+val.verify+'" isedit="1" class="notselectInput">'+defaultValue+'</textarea>';
	                    } else {
	                        edittage = '<input type="text" name="' + val.name + '" id="' + val.name + '" value="'+defaultValue+'"  verify="'+val.verify+'" isedit="1" '+datetime+' class="notselectInput"/>';
	                    }
					}
                    var trfiled = '<li style="width:' + liwidth + '" ><span>' + val.lable + isNull + '</span><span>' + edittage + '</span></li>';
                    $(".estransfer ul").append(trfiled);
                    
                });
            },
            cache: false,
    	    async: false
        });
    };
    function removeFormFiled() {
        $("input[type='text']", ".estransfer").each(function() {
            if ($(this).attr("isedit") == "1") {
                $(this).closest("li").remove();
            }
        });
        $("textarea", ".estransfer").each(function() {
            if ($(this).attr("isedit") == "1") {
                $(this).closest("li").remove();
            }
        });
        $("select", ".estransfer").each(function() {
            if ($(this).attr("isedit") == "1") {
                $(this).closest("li").remove();
            }
        });
    }
    $("#efiletable").flexigrid({
        url: $.appClient.generateUrl({
            ESDocumentsCollection: 'getLinkFiles',
            id: id
        },
        'x'),
        dataType: 'json',
        colModel: [{
            display: '序号',
            name: 'num',
            width: 20,
            align: 'center'
        },
        {
            display: '<input type="checkbox" id="linkFileSelectAll">',
            name: 'ids',
            width: 20,
            align: 'center'
        },
        {
            display: '文件类型',
            name: 'estype',
            align: 'left',
            editable: true,
            width: 80
        },
        {
            display: '文件名称',
            name: 'estitle',
            align: 'left',
            width: 150
        },
        {   display: '文件版本',
        	name: 'fileVersion',
        	align: 'right',
        	editable: true,
        	width: 60
        },
        {
            display: '创建时间',
            name: 'createTime',
            align: 'center',
            width: 100
        },
        {
            display: '原文路径',
            name: 'ywlj',
            width: 150,
            align: 'left'
        },
        {
            display: '文件校验',
            name: 'esmd5',
            width: 120,
            align: 'left',
            hide: true
        },
        {
            display: '文件大小',
            name: 'essize',
            width: 60,
            align: 'right'
        }],
        buttons: [{
            name: '添加',
            bclass: 'add',
            onpress: function() {
            	addFile();
            }
        },
        {
            name: '删除',
            bclass: 'delete',
            onpress: function() {
                delFile();
            }
        },
        {
            name: '上传',
            bclass: 'fileup',
            onpress: function() {
                uploadFile();

                $("#folder").selectInput({
                    url: $.appClient.generateUrl({
                        ESEFile: 'access'
                    },
                    'x'),
                    chkStyle: "radio",
                    async: true,
                    idKey: 'id',
                    pIdKey: 'parentid',
                    showname: 'estitle',
                  //  width:300,
                    onCheck: function(event, treeId, treeNode) {
                        $("#folder").attr("value", treeNode.espath);
                        $("#folderid").val(treeNode.id);
                    },
                    beforeClick: function(treeId, node) {
                        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                        if (node.isParent) {
                            zTree.expandNode(node);
                        }
                    }
                });
            }
        },{
        	name: '浏览原文',
        	tooltip:'浏览原文',
        	bclass: 'viewfile', 
        	onpress: viewFile
        }],
        title: '电子文件列表',
        useRp: true,
        width: 570,
        height: 200
    });
    $("#linkFileSelectAll").die("click").live("click",
    function() {
        $("#efiletable").find("input[name='id']").attr("checked", this.checked);
    });
    // 去除挂接文件
    function delFile() {
    	var treename = $('#treeName').val();
        var checkboxs = $("#efiletable").find("input[name='id']:checked");
        if (checkboxs.length == 0) {
            $.dialog.notice({
                content: '请选择删除的文件',
                time: 3,
                icon: 'warning'
            });
            return;
        }
        $.dialog({
            content: '确定要删除吗?',
            ok: true,
            okVal: '确定',
            cancel: true,
            cancelVal: '取消',
            ok: function() {
                if (checkboxs.length > 0) {
                	if(id!=0){
	                    var ids = [];
	                    var ywlj=[]
	                    checkboxs.each(function() {
	                        ids.push($(this).closest("tr").attr("id").substr(3));
	                        ywlj.push($(this).closest("tr").prop("data").cell.ywlj);
	                    });
	                    $.ajax({
	                        type: "POST",
	                        url: $.appClient.generateUrl({
	                            ESDocumentsCollection: 'deleteLinkFiles'
	                        },
	                        'x'),
	                        data: {
	                            id: id,
	                            ids: ids,
	                            ywlj:ywlj,
	                            treename:treename
	                        },
	                        dataType: "text",
	                        success: function(data) {
	                            if (data) {
	                                $.dialog.notice({
	                                    content: '删除挂接文件成功!',
	                                    time: 3,
	                                    icon: 'success'
	                                });
	                                $("#efiletable").flexReload();
	                            } else {
	                                $.dialog.notice({
	                                    content: '删除挂接文件失败!',
	                                    time: 3,
	                                    icon: 'error'
	                                });
	                            }
	                        }
	                    });
		            }else{
		            	deleteNoSaveData();
		            }
                }
            }
        });

    };
    function deleteNoSaveData(){	// ids传参
		var cbObj = $('#efiletable input[name="id"]:checked');
		if(cbObj.length<1){
			return;
		}
		var delFirstVal=0;
		cbObj.each(function (){
			var trObj = $(this).closest('tr').attr('datastate');
			if(trObj=='new'){
				if(delFirstVal==0){
					delFirstVal = $(this).closest('tr').find('td').eq(0).text();
				}
				$(this).closest('tr').remove();
			}
		});
		var cbNewObj = $('#efiletable tr');
		if(cbNewObj.length>1){
			cbNewObj.each(function (){
				if("new"==$(this).attr("datastate")){
					if($(this).find("td").eq(0).find("div").eq(0).text()>delFirstVal){
						$(this).find("td").eq(0).find("div").eq(0).text(delFirstVal++);
					}
				}
			});
		}
		return;
	
    }
    function addFile() {
    	var treename = $('#treeName').val();
        $.ajax({
            url: $.appClient.generateUrl({
                ESDocumentsCollection: 'hookFiles'
            },
            'x'),
            async: false,
            success: function(data) {
                var linkdialog = $.dialog({
                    title: '选择未挂接文件',
                    width: 800,
                    height: 'auto',
                    padding: '0px',
                    fixed: true,
                    resize: false,
                    content: data,
                    cancelVal: '关闭',
                    cancel: true,
                    okVal: '添加文件',
                    ok: function() {
                    	var checkboxs = $("#filelist").find("input[name='id']:checked");
                    	var checkboxstable = $("#efiletable").find("input[name='id']");
                    	var flag = false;
                    	if(id==0){
	                        if (checkboxs.length > 0) {
	                            var thisDialog = this;
	                            var linenumber = $("#efiletable tr").length;
	                            checkboxs.each(function() {
	                            	var tr = $(this).closest("tr");
	                                var selectFile = tr.prop("data").cell;
	                            	if(checkboxstable.length>0){
	                                	checkboxstable.each(function() {
	                                        var trtable = $(this).closest("tr");
	                                        var selectFiletable = trtable.prop("data").cell;
	                                        if(selectFile.originalId == selectFiletable.originalId){
	                                        	flag = true;
	                                        }
	                                    });
	                                }
	                            	if(!flag){
		                            	linenumber++;
		                                selectFile.num = linenumber;
		                                $('#efiletable').flexExtendData([{
		                                    "id": selectFile.id,
		                                    "cell": selectFile
		                                }]);
		                            }else{
		                            	$.dialog.notice({content:'您选择的数据存在重复，请重新选择！',time:3,icon:"warning"});
		                            	return;
		                            }
	                            });
	                        }
                    	}else{
                    		var files = [];
    		    			if (checkboxs.length > 0 ){
    		    				var thisDialog=this;
    		    				checkboxs.each(function(){
    		    					var tr = $(this).closest("tr");
    		    					var selectFile = tr.prop("data").cell;
    		    					var file = {};
    		    					if(checkboxstable.length>0){
	                                	checkboxstable.each(function() {
	                                        var trtable = $(this).closest("tr");
	                                        var selectFiletable = trtable.prop("data").cell;
	                                        if(selectFile.originalId == selectFiletable.originalId){
	                                        	flag = true;
	                                        }
	                                    });
	                                }
    		    					if(!flag){
        		    					file.ORIGINAL_ID = selectFile.originalId;
        		    					file.ESSTYPE = selectFile.essType==null?"":selectFile.essType;
        		    					file.ESTYPE = selectFile.estype==null?"":selectFile.estype;//liqiubo 20140729 修复bug90
        		    					file.ywlj = selectFile.estype==null?"":selectFile.ywlj;//xiewenda添加获取原文路径
        		    					//手动挂接
        		    					files.push(file);
		                            }else{
		                            	$.dialog.notice({content:'您选择的数据存在重复，请重新选择！',time:3,icon:"warning"});
		                            	return;
		                            }
    		    				});
    		    				$.post($.appClient.generateUrl({ESDocumentsCollection:'linkFiles'},'x'), {id:id,folderid:$("#folderid").val(),files:files,upload:false,treename:treename}, function(data){
    		    					$("#efiletable").flexReload();
    		    					$.dialog.notice({content:'挂接成功！',time:3,icon:"succeed"});
    		    				});
    		    			}
                    	}
                    	if(flag){
                    		return false;
    					}else{
    						var thisDialog = this;
    						thisDialog.close();	
    					}
                    }
                });
            }
        });
    };
    // 上传文件
    function uploadFile() {
        $.dialog({
            title: '上传文件',
            width: '450px',
            height: '250px',
            fixed: true,
            resize: false,
            content: "<div id='content'><div style='padding: 10px;'><span style='float:left;padding-bottom: 10px;'> &nbsp;文件版本:&nbsp;<input type='text' name='fileVersion' id='fileVersion' value='' style='width:50px;'/></span><span style='float:right;padding-bottom: 10px;'>&nbsp;存放位置:&nbsp;<input type='text' readonly='readonly' name='folder' id='folder' value='' class='selectInput' style='width:200px;'/><input type='hidden' id='folderid' value='' /></span></div><div class='fieldset flash' id='fsUploadProgress'></div></div>",
            cancelVal: '关闭',
            cancel: true,
            padding: '10px',
            button: [{
                id: 'btnAdd',
                name: '添加文件'
            },
            {
                id: 'btnCancel',
                name: '删除所有',
                disabled: true
            },
            {
                id: 'btnStart',
                name: '开始上传',
                disabled: true,
                callback: function() {
                    return false;
                }
            }],
            init: createSWFUpload
        });
    };
    // 创建上传文件组件
    function createSWFUpload() {
        var files = [];
        var upload = new SWFUpload({
            //提交路径
            upload_url: "",
            file_post_name: "file.txt",
            file_size_limit: "1048576",
            file_types: "*.*",
            file_types_description: "所有文件",
            file_upload_limit: "0",
            file_queue_limit: "0",

            // 事件处理
            swfupload_loaded_handler: swfuploadLoaded,
            file_dialog_start_handler: fileDialogStart,
            file_queued_handler: fileQueued,
            file_queue_error_handler: fileQueueError,
            file_dialog_complete_handler: fileDialogComplete,
            upload_start_handler: uploadStart,
            upload_progress_handler: uploadProgress,
            upload_error_handler: uploadError,
            upload_success_handler: uploadSuccess,
            upload_complete_handler: uploadComplete,

            // 按钮的处理
            button_image_url: $("#tplPath").val() + "/public/SWFUpload/img/ButtonUpload72.png",
            button_placeholder_id: "btnAdd",
            button_width: 72,
            button_height: 28,

            // Flash文件地址设置
            flash_url: $("#tplPath").val() + "/public/SWFUpload/js/swfupload.swf",

            custom_settings: {
                progressTarget: "fsUploadProgress",
                cancelButtonId: "btnCancel",
                startButtonId: "btnStart",
                // 上传成功的回调函数
                uploadSuccess: function(file, data, remainder) {
                    var f = $.parseJSON(data);
                    var extName = file.name.substr(file.name.lastIndexOf(".") + 1);
                    //extendFile(f.fileId, f.contentMD5, f.fileSize, f.createTime, file.name, extName, remainder,$("#folderid").val(),$("#fileVersion").val());
                    var createTime = GetCurrentTime();
                    var ywlj = $("#folder").val() + "/" + f.filename + "." + extName
                    extendFile(f.fileId, f.contentMD5, f.fileSize, createTime, file.name, extName, remainder,$("#folderid").val(),$("#fileVersion").val(),ywlj);
                    var linenumber = $("#efiletable tr").length;
                    
                    $('#efiletable').flexExtendData([{
                        "id": f.fileId,
                        "cell": {
                            num: linenumber + 1,
                            ids: "<input type='checkbox' name='id' fileRead='true' fileDown='true' filePrint='true'>",
                            originalId: f.fileId,
                            estype: extName,
                            estitle: f.filename,
                            fileVersion: $("#fileVersion").val(),
                            createTime: createTime,
                            ywlj: ywlj,
                            esmd5: f.contentMD5,
                            essize: f.fileSize
                        }
                    }]);
                    file= null;
                }
            },

            // Debug 设置
            debug: false
        });
        $("#btnCancel").click(function() {
            cancelQueue(upload);
        });
        $("#btnStart").click(function() {
            if ($("#folder").val() == '') {
                $.dialog.notice({
                    content: '请选择文件存放位置!！',
                    time: 3,
                    icon: "warning"
                });
            } else {
        		if($("#fileVersion").hasClass("invalid-text")){
        			return false;//相当于java中的break;
        		}if($("#fileVersion").val()==""){
        			$("#fileVersion").addClass("invalid-text");
        			$("#fileVersion").attr("title","文件版本不能为空！");
        			return false;
        		}
                $.post($.appClient.generateUrl({
                    ESDocumentsCollection: 'getUploadURL'
                },
                'x'),
                function(data) {
                    upload.setUploadURL(data);
                    startQueue(upload);
                    files= [];
                });
            }
        });
        $("input[name='fileVersion']").bind('blur',function(){
    		var fileVersionZZ= /^([\u4e00-\u9fa5]+|[a-zA-Z0-9]+)$/;
    		var fileVersion = $(this).val();
    		fileVersion=fileVersion.replace(/[ ]/g,"");
    		if(fileVersion==''){
    			$(this).addClass("invalid-text");
    			$(this).attr("title","文件版本不能为空！");
    			return false;
    		}
    		if(fileVersionZZ.test(fileVersion)==false){
    			$(this).addClass("invalid-text");
    			$(this).attr("title","该输入项不包含特殊字符");
    			return false;
    		}
    		if(execLen(fileVersion,100)==false){
    			$(this).addClass("invalid-text");
    			$(this).attr("title","文件版本长度不能超过100个字符");
    			return false;
    		}
    	});
        $("input[name='fileVersion']").bind('focus',function(){
    		$(this).removeClass("invalid-text").attr("title","");
    	});
    	function execLen(value,len){
    		 if(value!=''){
    	    	var strlength =value.replace(/[^\x00-\xff]/g,'aa').length; //字符长度 一个汉字两个字符
    	    	if(strlength > len ){
    	    		var charLen = (len%2==0)?(len/2):((len-1)/2);
    	    		return false;
    	    	}  
    	    }
    	} ;	
		// 挂接文件 (上传会调用，故linktotal给值1)
		function extendFile(fileid, md5, filesize, createtime, filename, extName, remainder,folderid,fileVersion,ywlj){
			var treename = $('#treeName').val();
			files.push({LINKTOTAL:1,ORIGINAL_ID:fileid, ESMD5:md5, ESTITLE:filename, ESTYPE:extName, ESSIZE:filesize, EsCreateTime:createtime,fileVersion:fileVersion,ywlj:ywlj});
			if(remainder ===0){
				$.post($.appClient.generateUrl({ESDocumentsCollection:'linkFiles'},'x'), {id:id,folderid:folderid, files:files, upload:true,treename:treename}, function(data){
					
					if($("#efiletable")&&id!=0){
						$("#efiletable").flexReload();
					}
				});
			}
		};
    };

    var obj = $("input[verify^='date']");
    obj.addClass('Wdate');
    obj.click(function() {
        WdatePicker();
    });
    //onClick="WdatePicker({dateFmt:\'HH:mm:ss\'})"
    var timeobj = $("input[verify^='time']");
    timeobj.addClass('Wdate');
    timeobj.click(function() {
        WdatePicker({dateFmt:'HH:mm:ss'});
    });
    $("input[type='radio'][name='collectionType']").change(function(){
        if( $("input[type='radio'][name='collectionType']:checked").val()==2){
        	$("#title").val('');
        	$("#title").attr('disabled',true);
        	$("#title").removeAttr('verify');
        	$("#title").css('border','1px solid #ccc')
        }else{
        	$("#title").attr('verify','text/200/1/0');
        	$("#title").attr('disabled',false);
        	$("#title").removeAttr("style");
        }
    });
    function viewFile(){// 方吉祥修改（在浏览原文时用户勾选数据时选择用户勾选的第一条）
    	var fileId = '';    	
    	var readIds="";
    	var printIds="";
    	var downloadIds="";
    	if (document.getElementById('efiletable')) {    		
    	    if (!$('#efiletable tr').length) {
    	        $.dialog.notice({
    	            content: '不存在电子文件',
    	            time: 3,
    	            icon: 'warning',
    	            lock: false
    	        });
    	        return false;
    	    }
    	    var checked = $('#efiletable input[name="id"]:checked:first').closest('tr');
    	    if (checked.length) {
    	    	for(var i=0;i<checked.length;i++){
    	    		fileId = checked[i].id.split('row');
    	    		readIds += ","+ fileId[1];
    	    	}    	    	
    	    } else { // 默认第一条数据
    	        var rowCount = $('#efiletable tr').length;    	        
    	        for (var r = 0; r < rowCount; r++) {
	                fileId = $('#efiletable tr')[r].id.split('row');
	                readIds += ","+ fileId[1];
    	        }
    	    }
    	    readIds=readIds.length>0?readIds.substr(1):"";    
    	    var stageId="";
    	    if($("#id").val()!=""){
	    	    $.ajax({//数据权限
	    			type:'POST',
	    			url:$.appClient.generateUrl({ESDocumentsCollection: "getStageIdsByDocId"},'x'),
	    			data:{docId:$("#id").val()},
	    			async:false,
	    		    success:function(data){
		    	    	if(data!=""){
		    	    		var arrIds=data.split(",");
		    	    		stageId=arrIds[0];
		    	    		printIds=getRightIds(arrIds,"filePrint",readIds);
		    	    		downloadIds=getRightIds(arrIds,"fileDownload",readIds);	    	    			    	    		
		    	    		var arr1=getTreeAndDataAuth.checkDataAuthEfile(arrIds[0],"fileRead",readIds);
		    	    		if(arr1=="true"){
		    	    			fileId=readIds.split(",")[0];    	    			
		    	    		}else if(arr1!="" && arr1!="false"){
		    	    			fileId=arr1.split(",")[0];  
		    	    			readIds=arr1;
		    	    		}else{
		    	    			var arr2=getTreeAndDataAuth.checkDataAuthEfile(arrIds[1],"fileRead",readIds);	    	    			
		    	    			if(arr2=="true"){
		    	        	    	fileId=readIds.split(",")[0];
		    	        	    }else if(arr2!="" && arr2!="false"){
		    	        	    	fileId=arr2.split(",")[0];
		    	        	    	readIds=arr2;
		    	        	    }else{
		    	        	    	$.dialog.notice({content: '您对文件没有文件浏览权限，不能进行此操作！', time: 3, icon: 'warning'});
		    	            		return false;
		    	        	    }	
		    	    		}
		    	    	}
	    		    }
	    	    }); 
    	    }
    	}    	
    	var treeId= $("#treenodeid").val();    	
    	var treetype = $("#treeType").val();   
    	if(treetype=="1"){
    		treeId=stageId;
    	}
    	//目录权限
    	var tempReadRight=getTreeAndDataAuth.checkTreeAuth(treetype, treeId, "FR");
    	var tempPrintRight=getTreeAndDataAuth.checkTreeAuth(treetype, treeId, "FP");
    	var tempDownloadRight=getTreeAndDataAuth.checkTreeAuth(treetype, treeId, "FD");  
    	if(tempReadRight=="false"){
    		$.dialog.notice({content: '您对文件没有文件浏览权限，不能进行此操作！', time: 3, icon: 'warning'});
    		return false;
    	}
    	if (document.getElementById('efiletable')) {    		
    	    /// ----------
    	    var url = $.appClient.generateUrl({
    	    	ESDocumentsCollection: 'file_view',
    	        id: $("#id").val(),
    	        fileId: fileId,
    	        stageId:$("#stageId").val(),
                tempReadRight:tempReadRight,
				tempPrintRight:tempPrintRight,
				tempDownloadRight:tempDownloadRight,
				rightIds:readIds+";"+printIds+";"+downloadIds
    	    },
    	    'x');
    	    // 修改结束
    	    $.ajax({
    	        url: url,
    	        cache: false,
    	        success: function(data) {
    	            if (data === 'idErr') {
    	                $.dialog.notice({
    	                    content: '参数不正确（id）',
    	                    time: 2,
    	                    icon: 'warning',
    	                    lock: false
    	                });
    	            }
    	            $.dialog({
    	                title: '浏览电子文件',
    	                width: '960px',
    	                fixed: false,
    	                resize: false,
    	                padding: 0,
    	                top: '10px',
    	                content: data
    	            });
    	        }
    	    });
    	} else {
            var url = $.appClient.generateUrl({
            	ESDocumentsCollection: 'file_view',
                id: $("#id").val(),
                fileId: fileId,
                stageId:$("#stageId").val(),
                tempReadRight:tempReadRight,
				tempPrintRight:tempPrintRight,
				tempDownloadRight:tempDownloadRight,
				rightIds:readIds+";"+printIds+";"+downloadIds
            },
            'x');
            $.ajax({
                url: url,
                cache: false,
                success: function(data) {

                    if (data === 'pathErr') {
                        $.dialog.notice({
                            content: '参数不正确（PATH）',
                            time: 2,
                            icon: 'warning',
                            lock: false
                        });
                    }
                    $.dialog({
                        title: '浏览电子文件',
                        width: '960px',
                        fixed: false,
                        resize: false,
                        padding: 0,
                        top: '10px',
                        content: data
                    });
                }
            });
    	}
    };

    function getRightIds(stageIds,auth,fileIds){
    	var rightIds=getTreeAndDataAuth.checkDataAuthEfile(stageIds[0],auth,fileIds);
    	if(rightIds=="true"){
			return  "true"; 			
		}else if(rightIds!="" && rightIds!="false"){
			return rightIds;
		}else{
			rightIds=getTreeAndDataAuth.checkDataAuthEfile(stageIds[1],auth,fileIds);			
			if(rightIds=="true"){
				return  fileIds; 	
			}else if(rightIds!="" && rightIds!="false"){
				return rightIds;
			}else{
    	    	return "false";
    	    }	
		}
    }
    
    //重置文件编码的值
    $(".notselectInput").die('change').live("change",function(){
		notIndexOf();//解决ie8不支持indexOf的方法
		if(ruleDocNo.indexOf($(this).attr("id")) !=-1){
			$("#docNo").val("");
			for(var i = 0;i<ruleDocNo.length;i++){
				if(releation[i] == true || releation[i] == 'true'){
    				$("#docNo").val($("#docNo").val()+$('#'+ruleDocNo[i]).val());
    			}else{
    				$("#docNo").val($("#docNo").val()+ruleDocNo[i]);
    			}
			}
			$.ajax({
	            type: "POST",
	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
	            success: function(data) {
	            	if(data != 'false'){
	            		$("#docNo").val($("#docNo").val()+data);
	            	}else{
	            		$("#docNo").val($("#docNo").val()+'0001');
	            	}
	            }
			});
		}
	});
	$(".Wdate").die('focus').live("focus",function(){
		notIndexOf();//解决ie8不支持indexOf的方法
		if(ruleDocNo.indexOf($(this).attr("id")) !=-1){
			$("#docNo").val("");
			for(var i = 0;i<ruleDocNo.length;i++){
				if(releation[i] == true || releation[i] == 'true'){
    				$("#docNo").val($("#docNo").val()+$('#'+ruleDocNo[i]).val());
    			}else{
    				$("#docNo").val($("#docNo").val()+ruleDocNo[i]);
    			}
			}
			$.ajax({
	            type: "POST",
	            url: $.appClient.generateUrl({ESDocumentsCollection: 'judegIsRepeatBydocNoRule'},'x'),
	            data: {docNoRule: $("#docNo").val(),stageId:$("#stageId").val()},
	            success: function(data) {
	            	if(data != 'false'){
	            		$("#docNo").val($("#docNo").val()+data);
	            	}else{
	            		$("#docNo").val($("#docNo").val()+'0001');
	            	}
	            }
			});
		}
	});	
});

//获取当前时间
function GetCurrentTime() {    
	var myDate = new Date();    
	var year = myDate.getFullYear();    
	var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1    
	if (month < 10) {        
		month = "0" + month.toString();    
	}    
	var date = myDate.getDate();    
	if (date < 10) {        
		date = "0" + date.toString();   
	}    
	var hour = myDate.getHours();    
	if (hour < 10) {       
		hour = "0" + hour.toString();   
	}    
	var minute = myDate.getMinutes();   
	if (minute < 10) {        
		minute = "0" + minute.toString();    
	}    
	var second = myDate.getSeconds();  
	if (second < 10) {       
		second = "0" + second.toString();  
	}    
	return year.toString() + "-" + month.toString() + "-" + date.toString() + " " + hour.toString() + ":" + minute.toString() + ":" + second.toString(); //以时间格式返回  
}

//ie8不支持indexof方法
function notIndexOf(){
	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;
	
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;
	
	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}
}
	
/*判断手动输入的类型名称*/
function judgeDocumentName(){
	var flag = true;
	if($("#treeType").val() == 2){//参见单位部门
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
        var nodes = treeObj.getSelectedNodes();
		$("#partId").val(nodes[0].id);
	}
	var type = "ess_document_type";
	var name = $("#documentName").val();
	$.ajax({
        type: "POST",
        url: $.appClient.generateUrl({ESDocumentsCollection: 'checkInputCode'},'x'),
        data: {type:type,name:name,pId:$("#partId").val()},
        async:false,
        success: function(data) {
        	if(data == 'false'){
            	$("#documentName").addClass("invalid-text").attr("title","你输入的数据当前部门下不存在，请重新输入！");
            	flag = false;
            }else if(data == 'repeat'){
            	if($("#documentCode").val() == ''){
            		$("#documentName").addClass("invalid-text").attr("title","当前部门下存在相同的名称，请手动选择！");
            		flag = false;
        		}
            }else{
            	$("#documentCode").val(data);
            }
        }
	});
	return flag;
}
/*判断手动输入的专业名称*/
function judgeEngineeringName(){
	var flag = true;
	if($("#treeType").val() == 2){//参见单位部门
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
        var nodes = treeObj.getSelectedNodes();
		$("#partId").val(nodes[0].id);
	}
	var type = "ess_engineering";
	var name = $("#engineeringName").val();
	$.ajax({
        type: "POST",
        url: $.appClient.generateUrl({ESDocumentsCollection: 'checkInputCode'},'x'),
        data: {type:type,name:name,pId:$("#partId").val()},
        async:false,
        success: function(data) {
        	if(data == 'false'){
            	$("#engineeringName").addClass("invalid-text").attr("title","你输入的数据当前部门下不存在，请重新输入！");
            	flag = false;
            }else if(data == 'repeat'){
            	if($("#engineeringCode").val() == ''){
        			$("#engineeringName").addClass("invalid-text").attr("title","当前部门下存在相同的名称，请手动选择！");
        			flag = false;
        		}
            }else{
            	$("#engineeringCode").val(data);
            }
        }
	});
	return flag;
}
var ruleDocNo = [];
var releation = [];
//编辑的时候调用此方法获取编码规则
function getFileCode(stageId){
	$.ajax({
        type: "GET",
        url: $.appClient.generateUrl({
            ESDocumentsCollection: 'judegeIsExitesDocnoRule'
        },
        'x'),
        data: {
            stageId: stageId
        },
        success: function(data) {
            if (data != 'false') {
            	var url=$.appClient.generateUrl({ESDocumentsCollection: 'getFileCode'},'x');
            	$.post(url,{stageId:stageId,tagIds:data},function(res){
            		var jsondata = eval('(' + res + ')');
            		ruleDocNo = [];
            		releation = [];
            		for(var i = 0;i<jsondata.nums;i++){
            			ruleDocNo.push(jsondata[i]);
            			releation.push(jsondata["flag"+i]);
            		}
            	});
            }
        }
	});
}
