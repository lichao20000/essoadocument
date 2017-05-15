$(document).ready(function(){
	$("#itemGrid").flexigrid({
		url: $.appClient.generateUrl({ESDocumentsMetadata: 'getMetadataList',isSystem:0}, 'x'),
		dataType: 'json',
		colModel : [
		    {display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
			{display: '序号', name : 'num', width : 20, align: 'center'}, 
			{display: '<input type="checkbox" id="syscheckIdList" >', name : 'ids', width : 20, align: 'center'},
			{display: '操作', name : 'operate', width : 60, align: 'center'},
			{display: '字段名称', name : 'name', width : 130, align: 'left'},
			{display: '字段代码', name : 'code', width : 120, align: 'left'},
			{display: '档案元数据', name : 'esidentifier', width : 150, align: 'left'},
			{display: '数据类型', name : 'type', width : 100, align: 'center'},
			{display: '长度', name : 'length', width : 60, align: 'right'},
			{display: '默认值', name : 'defaultValue', width : 50, align: 'left'},
			{display: '是否可编辑', name : 'isEdit', width :100,hide:true,align: 'center'}
		],
		buttons : [{name: '添加', bclass: 'add',onpress:function(){sysadd();}},
			{name: '删除', bclass: 'delete',onpress:function(){sysdel();}},
			{name: '筛选', bclass: 'filter',onpress:function(){sysfilter();}},
			{name: '还原数据', bclass: 'back', onpress:function(){sysback();}}
		],
		singleSelect:true,
		usepager : true,
		title : '元数据管理',
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: 700,
		height:350,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	// 删除系统字段 
	function sysdel(){
		 var checks = $("#itemGrid").find("input[name='checkName']:checked");
	        if (checks.length > 0) {
				$.dialog({
			    	title:'删除字段',
					width: '300px',
				   	fixed:true,
				    resize: false,
				    padding:0,
			    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>所选字段吗？</div>",
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
				$.dialog.notice({icon:"warning",content:"请选择要删除的系统字段！",time:3});
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
                    $("#itemGrid").flexOptions({
                        newp: 1
                    }).flexReload();
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
	// 添加装置单元或分类
	function sysadd(){
		$.ajax({
    	    url:$.appClient.generateUrl({ESDocumentsMetadata:'add'},'x'),
    	    success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'添加系统字段',
    	    		width: '500px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    			    cancelVal: '关闭',
    			    cancel: true,
    			    okVal:'确认添加',
				    ok:true,
				    ok: function() {
                        if($("#name").hasClass("warning") ||$("#code").hasClass("warning")){
                      	  $(".warning").focus();
                      	  return false;
                        }
                        var addParam = $("#addDataForm").serialize();
                        if (!$("#addDataForm").validate()) {
                            return false;
                        } else {
                        	 $.ajax({
                 	            type: 'POST',
                 	            url: $.appClient.generateUrl({ESDocumentsMetadata: 'checkedMetadataExists'},'x'),
                 	            data: addParam,
                 	            success: function(data) {
                 	            	if(data=='true'){
                 	            		confirmAdd(addParam);
                 	            	}else{
                 	            		$.dialog.notice({icon: "warning",content: "字段名称或字段代码已存在！",time: 3});
                 	            	}
                 	            },
                 	            cache: false
                 	        })
                          return false; 
                        }
                    },
                    cancel: function() {},
                    init: function() {
                    	$("#isSystem").val(0);
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
	                    $("#itemGrid").flexOptions({
	                        newp: 1
	                    }).flexReload();
	                    dia2.close();
	                } else {
	                    $.dialog.notice({
	                        icon: "error",
	                        content: "添加字段失败",
	                        time: 3
	                    });
	                    dia2.close();
	                    return false;
	                }
	            },
	            cache: false
	        })
	    };
	function sysfilter(){
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
						$("#itemGrid").flexOptions({
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
	function sysback(){
		$("#itemGrid").flexOptions({newp:1,query: ''}).flexReload();
	};
	// 全选
	$("#syscheckIdList").die().live('click',function(){
		$("input[name='checkName']",$("#itemGrid")).attr('checked',$(this).is(':checked'));
	});
	$(".editbtn",$("#itemGrid")).die().live("click", function(){
		edit($(this).attr("id"));
	});
	function edit(id){
		$.post($.appClient.generateUrl({ESDocumentsMetadata:'edit'},'x'),{id:id},function(data){
	    	dia2 = $.dialog({
		    	title:'编辑系统字段',
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
			    	$("#editDataForm").find("input[type='radio']").removeAttr("disabled");
                    if (!$("#editDataForm").validate()) {
                        return false;
                    } else {
                    	var updateParam = $("#editDataForm").serialize();
                    	var flag = true;
                    	 $.ajax({
              	            type: 'POST',
              	            url: $.appClient.generateUrl({ESDocumentsMetadata: 'checkedMetadataExists'},'x'),
              	            data: updateParam,
              	            async:false,
              	            success: function(data) {
              	            	if(data=='true'){
              	            	  confirmUpdate(updateParam);
              	            	}else{
              	            		$.dialog.notice({icon: "warning",content: "字段名称或字段代码已存在！",time: 3});
              	            		flag = false;
              	            	}
              	            },
              	            cache: false
              	        })
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
                    $("#itemGrid").flexOptions().flexReload();
                } else if(data == "false"){
                    $.dialog.notice({
                        icon: "error",
                        content: "修改字段失败",
                        time: 3
                    });
                    return false
                }else{
                    $.dialog.notice({
                        icon: "warning",
                        content: data,
                        time: 3
                    });
                    return false
                }
            },
            cache: false
        })
    };
	//添加行,删除行按钮
	$('.newfilter',$("#itemGrid")).die().live('click',function (){
		$($('#contents>p:last').clone()).appendTo($('#contents'));
		
	});

	$('.delfilter',$("#itemGrid")).die().live('click',function (){
		$('#contents>p').length > 6 ? $('#contents>p:last').remove() : '';
	});
	
	$(".Wdate").live("focus",function(){
		$(this).removeAttr("readonly");
	})
});