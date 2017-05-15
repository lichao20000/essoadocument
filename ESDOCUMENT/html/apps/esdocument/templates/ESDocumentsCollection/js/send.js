$(document).ready(function() {
	var depSetting = {
			view: {
				dblClickExpand: false,
				showLine: false,
				fontCss : {color:"black"}
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			async:{
				autoParam:['id','column','path','number'],
				enable:true
			},
			callback: {
				onClick: onDepClick
			}
		};
	$.getJSON($.appClient.generateUrl({ESSendReceiveFlow : "getTree"}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#sendTree"), depSetting, zNodes);
	});
	function onDepClick(e,treeId, treeNode){
		$("#selTreeId").val(treeNode.id);
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentsCollection:'sendFlow'},'x'),
		    data:{id:treeNode.id},
		    success:function(data){
		    	$("#flowId").empty();
		    	$("#flowId").append("<option value=''>请选择</option>");
		    	var obj = eval(data);
                $(obj).each(function(index) {
                  var val = obj[index];
                  var option='<option value="'+val.id+'" matrix='+val.flow_matrix+' typeNo="'+val.typeNo+'">'+val.name+'</option>';
                  $("#flowId").append(option);
                });
		    },
		    cache:false
		});
		//根据选择的收发类型，获取对应的编号
		$.post($.appClient.generateUrl({ESDocumentSend:'getSendNo',pId:$("#selTreeId").val()},'x'),function(data){
			$("#no").val(data);
			if($("#no").val()!='' && $("#no").val()!=null){
				$("#no").removeClass("invalid-text").attr("title","");
			}
		});
	};
	//下拉框添加事件
	$("select[name='flowId']").live('focus',function(){
		if($("#flowId option:selected").val() == ""){
			$(this).addClass('invalid-text').attr('title','此项不能为空');
		}
	});
	$("#flowId").die().live("change",function(){
		if($("#flowId option:selected").val() == ""){
			$(this).addClass('invalid-text').attr('title','此项不能为空');
		}else{
			$(this).removeClass('invalid-text').attr('title','');
		}
		var copies=0;
		var matrix=jQuery.parseJSON($(this).find("option:selected").attr("matrix"));
		for(var i=0;i<matrix.length;i++){
			copies=copies+matrix[i].copies*1;
		}
		$(this).closest("tr").next().find("font").html(copies);
		//获取流程的类型编号
		var typeNo=$(this).find("option:selected").attr("typeNo");
		$("#typeNo").val(typeNo);
	});
	
	$("#scanMatrix").die().live('click',function(){
		scanMatrix();
	});
	
	//查看流程
	function scanMatrix(){
		var id = $("#flowId").val();
		var typeNo = $("#typeNo").val();
		if(id!="" && id!=null && typeNo!=null && typeNo!=""){
			$.ajax({
			    url:$.appClient.generateUrl({ESDocumentSend:'flowChart1',id:id},'x'),
			    success:function(data){
			    	dia2 = $.dialog({
				    	title:'查看流程',
			    		width: '750px',
			    	   	fixed:true,
			    	    resize: false,
			    	    padding:0,
				    	content:data,
					    cancel: true,
					    cancelVal: '关闭',
					    ok:false,
					    cancel:function(){
					    	//关闭定制流程窗口
					    }
				    });
			    },
			    cache:false
			});
		}
	}
});
