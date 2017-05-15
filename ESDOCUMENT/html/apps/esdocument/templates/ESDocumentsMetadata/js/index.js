/**
 * 文件元数据 xuekun 20141028
 */
$(document).ready(function(){
	$("#esMetadataList").flexigrid({
		url:false,
		dataType: 'json',
		colModel : [
		    {display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
			{display: '序号', name : 'num', width : 20, align: 'center'}, 
			{display: '<input type="checkbox" id="checkIdList">', name : 'ids', width : 20, align: 'center'},
			{display: '操作', name : 'operate', width : 60, align: 'center'},
			{display: '字段名称', name : 'name', width : 220, align: 'left'},
			{display: '字段代码', name : 'code', width : 150, align: 'left'},
			{display: '档案元数据', name : 'esidentifier', width : 150, align: 'left'},
			{display: '数据类型', name : 'type', width : 150, align: 'center'},
			{display: '长度', name : 'length', width : 150, align: 'right'},
			{display: '默认值', name : 'defaultValue', width : 120, align: 'left'}
		],
		buttons : [{name: '添加', bclass: 'add',onpress:function(){add();}},
			{name: '删除', bclass: 'delete',onpress:function(){del();}},
			{name: '筛选', bclass: 'filter',onpress:function(){filter();}},
			{name: '还原数据', bclass: 'back', onpress:function(){back();}},
			{name: '系统字段', bclass: 'all',onpress:function(){all();}},
			{name: '文件编码规则', bclass: 'all',onpress:function(){docNoRules();}}
		],
		usepager: true,
		title: '&nbsp;',
		useRp: true,
		width: width,
		height:height
	});
	function add(){
		if($("#treenodeid").val()==''){
			$.dialog.notice({
                icon: "warning",
                content: "请选择树节点!",
                time: 3
            });
			return false;
		}
		$.ajax({
    	    url:$.appClient.generateUrl({ESDocumentsMetadata:'add'},'x'),
    	    success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'添加文件字段',
    	    		width: '500px',
    	    		id:"addmeta",
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    			    cancelVal: '关闭',
    			    cancel: true,
    			    okVal:'确认添加',
				    ok:true,
				    ok: function() {
                        $("#stageId").val($("#treenodeid").val());
                        if($("#name").hasClass("warning") ||$("#code").hasClass("warning")){
                        	  $(".warning").focus();
                        	  return false;
                        }
                        var addParam = $("#addDataForm").serialize();
                        if (!$("#addDataForm").validate()) {
                            return false;
                        } else {
                        	confirmAdd(addParam);
                        }
                        return false;
                    },
                    cancel: function() {},
                    init: function() {
                    	$("#isSystem").val(1);
                        $("#addDataForm").autovalidate();
                    }
    		    });
    	    },
    	    cache:false
    	});
	};
	 function confirmAdd(addParam) {
	        $.ajax({
	            type: 'POST',
	            url: $.appClient.generateUrl({
	            	ESDocumentsMetadata: 'addMetadata'
	            },
	            'x'),
	            data: addParam,
	            success: function(data) {
	                if (data) {
	                    $.dialog.notice({
	                        icon: "success",
	                        content: "添加字段成功!",
	                        time: 3
	                    });
	                    $("#esMetadataList").flexOptions().flexReload();
	                    art.dialog.list['addmeta'].close();
	                } else {
	                    $.dialog.notice({
	                        icon: "error",
	                        content: "添加字段失败",
	                        time: 3
	                    });
	                    return false
	                }
	            },
	            cache: false
	        })
	    };
	function del(){
		if($("#treenodeid").val()==''){
			$.dialog.notice({
                icon: "warning",
                content: "请选择树节点!",
                time: 3
            });
			return false;
		}
		 var checks = $("#esMetadataList").find("input[name='checkName']:checked");
	        if (checks.length > 0) {
				$.dialog({
			    	title:'删除字段',
					width: '400px',
				   	fixed:true,
				    resize: false,
				    padding:0,
			    	content:"<div style='padding:30px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>所选字段吗？<br/>删除后文件中此字段数据将全被清除，请慎重操作！</div>",
				    cancelVal: '取消',
				    cancel: true,
				    okVal:'确定',
				    ok:true,
			    	ok:function(){ 
		    		    var ids = "";
	                    checks.each(function() {
	                        var id = $(this).val();
	                        ids += id + ","
	                    });
	                    var delParam = {
	                        ids: ids.substring(0, ids.length - 1)
	                    }
	                    confirmDel(delParam);
					},cancel:function(){
					}
			    });
	        }else{
				$.dialog.notice({icon:"warning",content:"请选择要删除的文件元数据！",time:3});
				return false;
			}
	};
	function confirmDel(delParam) {
        $.ajax({
            type: 'POST',
            url: $.appClient.generateUrl({
            	ESDocumentsMetadata: 'deleteMetadata'
            },
            'x'),
            data: delParam,
            success: function(data) {
                if (data) {
                    // 提示删除成功
                    $.dialog.notice({
                        icon: "success",
                        content: "删除选择的字段成功",
                        time: 3
                    });
                    $("#esMetadataList").flexOptions().flexReload();
                } else {
                    // 提示删除失败
                    $.dialog.notice({
                        icon: "warning",
                        content: "删除选择的字段失败",
                        time: 3
                    });
                    return false;
                }
            },
            cache: false
        })
    };
	function filter(){
		$.ajax({
    	    url:$.appClient.generateUrl({ESDocumentsMetadata:'filter'},'x'),
    	    success:function(data){
    	    	 $.dialog({
    		    	title:'筛选数据',
    	    		width: '600px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    			    cancelVal: '关闭',
    			    cancel: true,
    			    okVal:'筛选',
				    ok:true,
    		    	ok:function(){ 
    		    		var condition = filterValue();
						$("#esMetadataList").flexOptions({
							newp: 1,
							query: condition
						}).flexReload();
					},cancel:function(){
					}
    		    });
    	    },
    	    cache:false
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
	function back(){
		$("#esMetadataList").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
	};
	function all(){
		$.ajax({
    	    url:$.appClient.generateUrl({ESDocumentsMetadata:'systemMetadata'},'x'),
    	    success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'系统字段',
    	    		width: '700px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    			    cancelVal: '关闭',
    			    cancel: true,
    			    cancel:function(){
					}
    		    });
    	    },
    	    cache:false
    	});
	};
	// 全选
	$("#checkIdList").die().live('click',function(){
		$("input[name='checkName']",$("#esMetadataList")).attr('checked',$(this).is(':checked'));
	});
	$(".editbtn",$("#esMetadataList")).die().live("click", function(){
		edit($(this).attr("id"));
	});
	function edit(id){
		$.post($.appClient.generateUrl({ESDocumentsMetadata:'edit'},'x'),{id:id},function(data){
	    	dia2 = $.dialog({
		    	title:'编辑字段',
	    		width: '500px',
	    	   	fixed:true,
	    	    resize: false,
	    	    padding:0,
		    	content:data,
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'确认修改',
			    ok:true,
			    ok: function() {
			    	$("#isSystem").val(1);
			    	var toLength = $("#toLength").val()*1;
			    	var startLength = $("#startLength").val()*1;
			    	var dotLength = $("#dotLength").val()*1;
			    	var startDotLength = $("#startDotLength").val()*1;
			    	if(toLength<startLength){
			    		$.dialog.notice({icon: "warning",content: "修改字段长度不能小于原字段长度！",time: 3});
			    		return false;
			    	}
			    	if(dotLength<startDotLength){
			    		$.dialog.notice({icon: "warning",content: "修改小数点位数不能小于原小数点位数！",time: 3});
			    		return false;
			    	}
			    	if($("#name").hasClass("warning") ||$("#code").hasClass("warning")){
                  	  $(".warning").focus();
                  	  return false;
			    	}
                    var updateParam = $("#editDataForm").serialize();
                    if (!$("#editDataForm").validate()) {
                        return false;
                    } else {
                    	confirmUpdate(updateParam);
                    }
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
            	ESDocumentsMetadata: 'updateMetadata'
            },
            'x'),
            data: updateParam,
            success: function(data) {
                if (data == "") {
                    $.dialog.notice({
                        icon: "success",
                        content: "修改字段成功!",
                        time: 3
                    });
                    $("#esMetadataList").flexReload();
                } else {
                    $.dialog.notice({
                        icon: "error",
                        content: "修改字段失败",
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
    function docNoRules(){
    	
	    var id=$("#treenodeid").val();
		if(id==''){
			$.dialog.notice({
                icon: "warning",
                content: "请选择树节点!",
                time: 3
            });
			return false;
		}
    	$.ajax({
    	    url:$.appClient.generateUrl({ESDocumentsMetadata:'docNoRulesToAdd'},'x'),
    	    data:{id:id},
    	    type:"get",
    	    success:function(data){
    	     $.dialog({
    		    	title:'文件编码规则',
    	    	   	fixed:false,
    	    	    resize: true,
    	    	    okVal:'保存',
    	    	    cancelVal:'关闭',
    	    	    cancel:true,
    			    content:data,
    			     ok:function()
    		    	{
    			    	if (!$("#docNoField").validate()) {
    			    		return false;
    			    	} 
    			    	var datas='';
    			    	var ids='';
    			    	var length=$('#useRole li').length;
    					$('#useRole li').each(function(i){
    						var litext=$(this).text();
    						datas+=litext;
    						
    						if(litext.indexOf('true')>-1){
    							var id=$(this).attr("id");
    							ids+=id+"|true"
    						}else{
    							ids+=litext;
    						}
    						if((i+1)!=length){
    							ids+=",";
    							datas+=",";
    						}
    					});
    					 var addParam = {
    							 tagids: ids,
    							 stageId:$("#stageId").val(),
    							 id:$("#id").val()
    		                    };
    					 addDocnoRule(addParam);
    				 },
    				 init: function() {
 						$("#docNoField").autovalidate();
 					}
    		    });
    		    },
    		    cache:false
    	});	
    };
	function addDocnoRule(addParam){
		$.ajax({
    	    url:$.appClient.generateUrl({ESDocumentsMetadata:'addDocNoRule'},'x'),
    	    data:addParam,
    	    type:"post",
    	    success:function(data){
    	    	if(data){
    	    		$.dialog.notice({
                        icon: "success",
                        content: "修改文件编码规则成功!",
                        time: 3
                    });
    	    	}else{
    	    		$.dialog.notice({
                        icon: "error",
                        content: "修改文件编码规则失败!",
                        time: 3
                    });
    	    	}
    	    }
    	  });
	};
	$("#esidentifier").live('click',function(){
		metadata_dialog = $.dialog({
			title:'元数据选择',
			content:'<div id="metadata_grid"><table id="metadata_tbl"></table></div>',
			width:600,
			padding:'0',
			button:[{
				name:'取消元数据',
				callback:function(){
					$("#esidentifier").val("");
					$("#metaDataId").val("");
				}
			},{
			name:'确定',
			focus: true
				}],
			okVal:'确定',
			cancelVal:'取消',
			ok:function(){
				var flag = metadata_Call_back();
				if(!flag){
					return false;
				}else{
					this.close();
				}
			},
			cancel:true
			
		});
		$("#metadata_tbl").flexigrid({
			url: $.appClient.generateAppidUrl('escloudapp',{ESTemplate:'meta_json'}),
			dataType: 'json',
			colModel : [
				{display: '', name : 'radio', width : 40, align: 'center'},
				{display: '名称', name : 'name', width : 80, sortable : true, align: 'left'},
				{display: '唯一标识', name : 'ident', width : 80, sortable : true, align: 'left'},
				{display: '类型', name : 'type', width : 80, sortable : true, align: 'center'},
				{display: '是否参与高级检索', name : 'search', width : 80, sortable : true, align: 'center'},
				{display: '描述', name : 'desc', width : 100, sortable : true, align: 'left'}
				],
				buttons:[],
			usepager: true,
			useRp: true,
			resizable: false,
			rp:20,
			procmsg:"数据加载中,请稍后...",
			nomsg:"没有数据",
			pagetext: '第',
			outof: '页 /共',
			width: 600,
			height: 270,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
		$('#metadata_grid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;">元数据列表</span>').append('<div class="find-dialog"><input id="queryMetaWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryMetaTable()"></span></div>');
		$('#metadata_grid div[class="tDiv"]').css("border-top","1px solid #ccc");
	});
	//xiewenda 20150506 添加元数据的默认值输入得校验规则
	$("#type").live("change",function(){
		var type = $("#type").val();
		var toLength = $("#toLength").val();
		var dotLength = "0";
		var reg = "";
		if(type=="TEXT"){
			reg = "unspecial";
		}else if(type=="NUMBER"){
			reg = "number";
		}else if(type=="DATE"){
			reg = "date";
		}else if(type=="FLOAT"){
			reg = "float";
			if($("#dotLength").val()){
			dotLength = $("#dotLength").val();
			}
		}else if(type=="TIME"){
			reg = "Time";
		}else if(type=="BOOL"){
			reg = "boolean";
		}
		if(toLength!=""&&reg!=""){
			var verify = reg+"/"+toLength+"/0/"+dotLength;
			$("#defaultValue").attr("verify",verify);
		}
		//改变元数据类型 关联的元数据也要重置
		$("#esidentifier").val("");
		$("#metaDataId").val("");
	});
	//xiewenda 20150506 添加元数据的默认值输入得校验规则
	$("#toLength,#dotLength").live("change",function(){
		var type = $("#type").val();
		var toLength = $("#toLength").val();
		var dotLength = "0";
		var reg = "";
		if(type=="TEXT"){
			reg = "unspecial";
		}else if(type=="NUMBER"){
			reg = "number";
		}else if(type=="DATE"){
			reg = "date";
		}else if(type=="FLOAT"){
			reg = "float";
			if($("#dotLength").val()){
			dotLength = $("#dotLength").val();
			}
		}else if(type=="TIME"){
			reg = "Time";
		}else if(type=="BOOL"){
			reg = "boolean";
		}
		if(toLength!=""&&reg!=""){
			var verify = reg+"/"+toLength+"/0/"+dotLength;
			$("#defaultValue").attr("verify",verify);
		}
	})
	$("#name,#code,#esidentifier").die("blur").live("blur",function(){
		var obj = $(this);
		if(!obj.hasClass('warning') && obj.val()!=""){
			var type = obj.attr("name");
			var stageId =$("#stageId").val();
			var isSystem =$("#isSystem").val();
			var id =$("#id").val();
		 $.ajax({
	            type: 'POST',
	            url: $.appClient.generateUrl({ESDocumentsMetadata: 'checkedMetadataExists'},'x'),
	            data: {type:type,id:id,stageId:stageId,isSystem:isSystem,value:obj.val()},
	            async:false,
	            success: function(data) {
	            	if(data=='true'){
	            		obj.removeClass("warning");
	            		obj.attr('title','');
	            	}else{
	            		obj.addClass("warning");
	            		if(type=="name"){
	            			if(isSystem=='0'){
	            				obj.attr('title','元数据中已存此字段名称！');
	            			}else{
	            				obj.attr('title','上下级目录或系统元数据中已存在此字段名称！');
	            			}
	            		} else if(type=="code"){
	            			if(isSystem=='0'){
	            				obj.attr('title','元数据中已存此字段代码！');
	            			}else{
	            				obj.attr('title','上下级目录或系统元数据中已存在此字段代码！');
	            			}
	            		}else if(type=="esidentifier"){
	            			if(isSystem=='0'){
	            				obj.attr('title','元数据中已关联此档案元数据！');
	            			}else{
	            				obj.attr('title','上下级目录或系统元数据中已关联此档案元数据！');
	            			}
	            		}
	            	}
	            },
	            cache: false
	        })
		}
	})
});

function queryMetaTable(){
	var keyWord = $('#queryMetaWord').val();
	if(keyWord=='请输入关键字' ){
		$("#metadata_tbl").flexOptions({url:$.appClient.generateAppidUrl('escloudapp',{ESArchiveUsingModel:'meta_json'},'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#metadata_tbl").flexOptions({url:$.appClient.generateAppidUrl('escloudapp',{ESArchiveUsingModel:'meta_json'},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
}

//回车事件
$(document).keydown(function(event) {
    if (event.keyCode == 13 && document.activeElement.id == 'queryMetaWord') {
    	queryMetaTable();
    }
});
//元数据选择回调函数
function metadata_Call_back (){	
	var flag = true;
	var tr = $("#metadata_grid").find("input[name='metadata']:checked").closest('tr');
    var metaDataType = $(tr).find("td[colname='type'] div").text();
    var type =$("#type").val();
    if(metaDataType!=type){
    	$.dialog.notice({icon: "warning",content: "关联数据类型不匹配！",time: 3 });
    	return false;
    }
    var meatdataStr = $("#metadata_grid").find("input[name='metadata']:checked").val();
    var esidentifier = $(tr).find('td:eq(2)').text();
    var stageId = $("#stageId").val();
    var isSystem = $("#isSystem").val();
    if(stageId==''){
    	stageId = '0';
    }
    if(isSystem!='0'){
    	isSystem=='1';
    }
    $.ajax({//判断选择的档案元数据是否重复
           url: $.appClient.generateUrl({ESDocumentsMetadata: 'checkedArchiveMetadataRepeat'},'x'),
           data: {stageId:stageId,isSystem:isSystem,esidentifier:esidentifier,id:$("#id").val()},
           type:'POST',
           async:false,
           success: function(data) {
           	if(data=='true'){
           		$("#esidentifier").val(esidentifier);
           		$("#metaDataId").val(meatdataStr.split("|")[0]);
           		flag = true;
           	}else if(data=='false'){
           		if(isSystem=='0'){
           			$.dialog.notice({icon: "warning",content: "元数据中已关联此档案元数据，请重新选择！",time: 3});	
           		}else{
           		$.dialog.notice({icon: "warning",content: "上下级目录或系统元数据中已关联此档案元数据，请重新选择！",time: 3});
           		}
           		flag = false;
           	}
           },
          cache: false
    });
    return flag;
}
