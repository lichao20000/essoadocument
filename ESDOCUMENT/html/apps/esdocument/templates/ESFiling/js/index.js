var filter=null;
var archive=null;
$(document).ready(function() {
	var BZ = 1;
	var adjust_select=[];
	var adjust_selected=[];
	getColModel("","0");
	//全选
	$("input[name='paths']:checkbox").die().live("click",function(){
		$("#esDataList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	// 筛选装置
	filter = function() {
		$.ajax({
			url : $.appClient.generateUrl({ESFiling : 'filter'}, 'x'),
			success : function(data) {
				dia2 = $.dialog({
					title : '筛选数据',
					width : '500px',
					fixed : true,
					resize : false,
					padding : 0,
					content : data,
					cancelVal : '关闭',
					cancel : true,
					okVal : '筛选',
					ok : true,
					ok : function() {
						var stageCode=$("#stageCode").val();
						var stageId=$("#stageId").val();
						var where = {};
						var condition=[];
						if($("#device").attr("code")==""){
							where="";
						}else{
							condition.push("deviceCode,equal,"+$("#device").attr("code")+",false");
							where.condition=condition;
						}
			    		$("#condition").val(where);//保存筛选条件
			    		var url=$.appClient.generateUrl({ESFiling:'findDocumentList',code:stageCode,stageId:stageId},'x');
			    		$("#esDataList").flexOptions({newp: 1, query:where, url: url}).flexReload();
					},
					cancel : function() {
					}
				});
			},
			cache : false
		});
	}
	//还原数据
	back = function() {
		$("#esDataList").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
	};
	//检验收集范围是否定义归档规则
	archive = function() {
		var stageCode=$("#stageCode").val();
		if(stageCode!="0" && stageCode!=""){
			var url=$.appClient.generateUrl({ESFiling:'checkFilingRegulation',code:stageCode},'x');
			$.post(url,function(data){
				if(data){
					$.dialog.notice({icon:'warning',content:data,time:3}); 
					return false;
				}else{
					filing();// 归档
				}
			},"json");
		}
	}
	
	// 归档
	function filing(){
		$.ajax({
			url : $.appClient.generateUrl({ESFiling : 'filter2'}, 'x'),
			success : function(data) {
				dia2 = $.dialog({
					title : '文件归档',
					width : '600px',
					fixed : true,
					resize : false,
					padding : 0,
					content : data,
					button : getButtions(),
					cancelVal : '关闭',
					cancel : true,
					cancel : function() {
						BZ=1;
					}
				});
			},
			cache : false
		});
	}
	
	//处理button
	function getButtions(){
		var buttons = [ {
			id:"pre",
			name : "上一步",
			focus : true,
			callback : function() {
				if(BZ == 2){
					$("#finish").css("display","none");
					$("#pre").css("display","none");
					$("#next").css("display","");
					$("#bus_tree").css("display","none");
					$("#adjustField").css("display","none");
					$("#choiceContents").css("display","");
					var id = $("input[name='identity']:checked").attr("value");
					if(id=="one")
						$("#filterContents").css("display","");
					else
						$("#dis").css("display","");
					BZ--;
					return false;
				}else if(BZ == 3){
					$("#finish").css("display","none");
					$("#pre").css("display","");
					$("#next").css("display","");
					$("#choiceContents").css("display","none");
					$("#adjustField").css("display","none");
					$("#bus_tree").css("display","");
					BZ--;
					return false;
				}				
			}
		}, {
			id:"next",
			name : "下一步",
			focus : true,
			callback : function() {				
				if (BZ == 1) {
					var id = $("input[name='identity']:checked").attr("value");
					if(id=="one"){
						var condition=getFilterCondition();
						/*if(condition.condition.length==0){
							$.dialog.notice({icon:'warning',content:'请添加筛选条件',time:3}); 
							return false;
						}*/
						$("#filterContents").css("display","none");
					}else{
						if($("#choiced tr").length==0){
							$.dialog.notice({icon:'warning',content:'请先选择归档的文件',time:3}); 
							return false;
						}
						$("#dis").css("display","none");
					}
					$("#finish").css("display","none");
					$("#pre").css("display","");
					$("#next").css("display","");
					$("#choiceContents").css("display","none");
					$("#adjustField").css("display","none");
					$("#bus_tree").css("display","");
					BZ++;
					return false;
				}else if(BZ == 2){
					if($("#d_goal").val() === ""){
						$.dialog.notice({icon:'warning',content:'请选择归档目录',time:3}); 
						return false;
					}
					$("#finish").css("display","");
					$("#pre").css("display","");
					$("#next").css("display","none");
					$("#choiceContents").css("display","none");
					$("#bus_tree").css("display","none");
					$("#adjustField").css("display","");
					fillFrontField();//加载元数据字段
					fillBackField();//档案系统元数据
					BZ++;
					return false;
				}
			}
		}, {
			id:"finish",
			name : "完成",
			focus : true,
			callback : function() {
				BZ=1;
				var id = $("input[name='identity']:checked").attr("value");
				if(id == "one")
					return conditionFiling();//依据筛选条件归档文件
				else
					return idsFiling();//依据选择的id归档文件
			}
		} ];
		return buttons;
	}
	
	// 添加行
	$('.newfilter').die().live('click', function() {
		var t = $(this).parent().clone().insertAfter($(this).parent());
		t.each(function(){
			$(this).find('input').val('').attr("readonly",false);
			$(this).find('span').remove();
		});
	});

	//删除行
	$('.delfilter').die().live('click', function() {
		if ($('#contents p').length > 5) {
			$(this).closest('p').remove();
		} else {
			var tds = $(this).closest('p');
			tds.find('input').val('');
			var select = tds.find('select');
			$(select[0]).val("");
			$(select[1]).val("like");
			$(select[2]).val("AND");
		}
	});
	
	//自动对应事件
	$("#autoAdjust").die().live("click",function(){
		var flag = false;
		$("#fillFront tr").each(function(){
			var leftValue = $(this);
			var code = leftValue.find("td[colname='code'] div").html();
			var name = leftValue.find("td[colname='name'] div").html();
			var metaData = leftValue.find("td[colname='esidentifier'] div").html();
			var length = leftValue.find("td[colname='length'] div").html();
			$("#fillBack tr").each(function(){
				var rightValue = $(this);
				if(metaData == rightValue.find("td[colname='METADATA'] div").html() && parseInt(length)<= parseInt(rightValue.find("td[colname='ESLENGTH'] div").html())){
					rightValue.find("td[colname='frontCode'] div").html(code);
					rightValue.find("td[colname='frontName'] div").html(name);
					adjust_selected.push("<tr id="+leftValue.prop("id")+" clsss='erow'>"+leftValue.html()+"</tr>"+"-,-"+code+"-,-"+name);
					removeFrontType(code);
					returnFrontType(rightValue);//列表行双击事件
					flag = true;
					return;
				}
			});
		});
		$("#fillBack tr").each(function(){
			if($(this).find("td[colname='frontName'] div").html()!='&nbsp;'){
				flag = true;
				return false;
			}
		});
		if(!flag){
			$.dialog.notice({icon:'warning',content:"源字段未设置对应的档案元数据，无法自动对应！",time:3}); 
			return false;
		}
	});
	
	//复位事件
	$("#returnAdjust").die().live("click",function(){
		$("#fillBack tr").each(function(){
			rightFieldDbclick($(this));
		});
	});
	
	//依据选择的id归档文件
	function idsFiling(){
		var ids = "";
		$("#choiced tr").each(function(index) {
			ids = ids + $(this).prop("id").substr(3) + ",";
		});
		var direct=$("#d_goal").attr("code");
		var stageId=$("#stageId").val();
		var stageName=$("#stageName").val();
		var directName=$("#d_goal").attr("value");
		var field = getFieldMap();
		if(field == null){
			$.dialog.notice({icon:'warning',content:"未设置归档对应字段",time:3}); 
			return false;
		}
		if(field.length == 1 && field[0] == "false"){
			$.dialog.notice({icon:'warning',content:"未选择收集范围字段",time:3}); 
			return false;
		}
		var url=$.appClient.generateUrl({ESFiling : 'idsFiling'}, 'x');
		$.post(url,{ids:ids.substr(0,ids.length-1),direct:direct,stageId:stageId,field:field,stageName:stageName,directName:directName},function(data){
			if(data == 'true'){
				$.dialog.notice({icon:'success',content:'文件归档成功',time:3}); 
				$("#esDataList").flexOptions({newp: 1, query:''}).flexReload();
				adjust_selected = [];
				return true;
			}else if(data == 'false'){
				$.dialog.notice({icon:'error',content:'文件归档失败',time:3}); 
				return false;
			}else{
				$.dialog.notice({icon:'warning',content:data,time:3}); 
				return false;
			}
		});
	}
	
	//依据筛选条件归档文件
	function conditionFiling(){
		var condition=getFilterCondition();
		var direct=$("#d_goal").attr("code");
		var stageId=$("#stageId").val();
		var stageCode=$("#stageCode").val();
		var stageName=$("#stageName").val();
		var directName=$("#d_goal").attr("value");
		var field = getFieldMap();
		if(field == null){
			$.dialog.notice({icon:'warning',content:"未设置归档对应字段",time:3}); 
			return false;
		}
		if(field.length == 1 && field[0] == "false"){
			$.dialog.notice({icon:'warning',content:"未选择收集范围字段",time:3}); 
			return false;
		}
		var url=$.appClient.generateUrl({ESFiling : 'conditionFiling'}, 'x');
		$.post(url,{condition:condition,direct:direct,stageId:stageId,stageCode:stageCode,field:field,stageName:stageName,directName:directName},function(data){
			if(data == 'true'){
				$.dialog.notice({icon:'success',content:'文件归档成功',time:3}); 
				$("#esDataList").flexOptions({newp: 1, query:''}).flexReload();
				adjust_selected = [];
				return true;
			}else if(data == 'false'){
				$.dialog.notice({icon:'error',content:'文件归档失败',time:3}); 
				return false;
			}else{
				$.dialog.notice({icon:'warning',content:data,time:3}); 
				return false;
			}
		});
	}
	
	//获取字段列表
	function getFieldMap(){
		var flag = false;
		var adjust_map = [];
		$("#fillBack tr").each(function(){
			var code= $(this).find("td[colname='frontCode'] div").html();
			var type= $(this).find("td[colname='ESTYPE'] div").html();
			var meta= $(this).find("td[colname='METADATA'] div").html();
			var isSystem= $(this).find("td[colname='ESISSYSTEM'] div").html();
			var C_Id= "C"+$(this).prop("id").substr(3);
			if(code == "stageCode"){
				flag = true;
			}
			if(code!="" && code!="&nbsp;" && C_Id != ""){
				adjust_map.push(code+"-,-"+C_Id+"-,-"+type+"-,-"+meta+"-,-"+isSystem);
			}			
		});
		if(adjust_map == [] || adjust_map.length == 0){
			return null;
		}
		if(!flag){
			adjust_map = [];
			adjust_map.push("false");
		}
		return adjust_map;
	}
	
	//获取筛选条件
	function getFilterCondition(){
		var $where = {};
		var condition=[];
		$("#contents p").each(function(){
			var sels=$(this).find("select");
			var inp=$(this).find("input[type='text']").val();
			if($(sels[0]).val()!="" && inp!=""){
				var relation ='false';
				if ($(sels[2]).val() == "AND") {
					relation = 'true';
				}
				condition.push($(sels[0]).val()+","+$(sels[1]).val()+","+inp+","+relation);
			}
		});
		$where.condition=condition;
		return $where;
	}
	
	//文档元数据
	function fillFrontField(){
		var metaModel= [
		                {display : '数据标识',name :'id',hide:true,width:30,align:'center'},
		                {display : '序号',name : 'num',width : 20,align : 'center',hide:true}, 
			            {display : '源字段',name : 'name',width : 120,align : 'left'}, 
			            {display : '代码',name : 'code',width : 100,align : 'left',hide:true}, 
			            {display : '类型',name : 'type',width : 100,align : 'left'}, 
			            {display : '长度',name : 'length',width : 50,align : 'right'}, 
			            {display : '默认值',name : 'defaultValue',width : 50,align : 'left',hide:true},
			            {display : '是否为空',name : 'isNull',width : 50,align : 'center',hide:true},
			            {display : '是否为系统字段',name : 'isSystem',width : 80,align : 'center',hide:true}, 
			            {display : '档案系统元数据ID',name : 'metaDataId',width : 80,align : 'right',hide:true}, 
			            {display : '档案系统元数据',name : 'esidentifier',width : 60,align : 'left',hide:true}			             
			           ];
		$("#fillFront").flexigrid({
			url : $.appClient.generateUrl({ESFiling : "findDocumentMetaByStageId",stageId:$("#stageId").val()}, 'x'),
			dataType : 'json',
			colModel : metaModel,
			usepager: false,
			title: '&nbsp;',
			nomsg:"没有数据",
			useRp: true,
			width: 420,
			height:228,
			showTableToggleBtn: true,
			procmsg:'正在加载数据，请稍候...'
		});
		
		//列表行单击事件
		$("#fillFront tr").die().live("click",function(){
			adjust_select=[];
			adjust_select.push("<tr id="+$(this).prop("id")+" clsss='erow'>"+$(this).html()+"</tr>");
			adjust_select.push($(this).find("td[colname='code'] div").html());
			adjust_select.push($(this).find("td[colname='name'] div").html());
			adjust_select.push($(this).find("td[colname='type'] div").html());
			adjust_select.push($(this).find("td[colname='length'] div").html());
		});
	}
	
	//档案系统元数据
	function fillBackField(){
		var metaModel= [
		                {display : '数据标识',name :'id',hide:true,width:30,align:'center'},
		                {display : '源字段',name : 'frontName',width : 120,align : 'center'}, 
		                {display : '源字段代码',name : 'frontCode',width : 100,align : 'center',hide:true}, 			             
			            {display : '目标字段',name : 'ESIDENTIFIER',width : 100,align : 'center'}, 
			            {display : '代码',name : 'METADATA',width : 120,align : 'center',hide:true}, 
			            {display : '类型',name : 'ESTYPE',width : 100,align : 'center'}, 
			            {display : '长度',name : 'ESLENGTH',width : 50,align : 'center'},  
			            {display : '是否为空',name : 'ESISNULL',width : 50,align : 'center',hide:true},
			            {display : '是否为系统字段',name : 'ESISSYSTEM',width : 80,align : 'center',hide:true}, 
			            {display : '描述',name : 'ESDESCRIPTION',width : 60,align : 'center',hide:true}			             
			           ];
		var path=$("#d_goal").attr("code");
		var arr_path=path.split("@");
		$("#fillBack").flexigrid({
			url : $.appClient.generateUrl({ESFiling : "structure_json",id:arr_path[arr_path.length-1]}, 'x'),
			dataType : 'json',
			colModel : metaModel,
			usepager: false,
			title: '&nbsp;',
			nomsg:"没有数据",
			
			width: 420,
			height:228,
			showTableToggleBtn: true,
			procmsg:'正在加载数据，请稍候...'
		});
		
		//列表行单击事件
		$("#fillBack tr").die().live("click",function(){		
			var value=$(this).find("td[colname='frontCode'] div").html();
			if((value == "&nbsp;" || value == "") && (adjust_select != [] && adjust_select.length !=0) ){
				var name=$(this).find("td[colname='ESIDENTIFIER'] div").html();
				var type=$(this).find("td[colname='ESTYPE'] div").html();
				var length=$(this).find("td[colname='ESLENGTH'] div").html();
				if(!judgeType(name,type,length)){
					return false;
				}
				$(this).find("td[colname='frontCode'] div").html(adjust_select[1]);
				$(this).find("td[colname='frontName'] div").html(adjust_select[2]);
				adjust_selected.push(adjust_select[0]+"-,-"+adjust_select[1]+"-,-"+adjust_select[2]);
				removeFrontType(adjust_select[1]);
				returnFrontType($(this));//列表行双击事件	
			}
		});
	}
	
	//判断类型
	function judgeType(name,type,length){
		var bo=true;
		switch(type){
			case '文本':
				if(parseInt(adjust_select[4]) > parseInt(length)){
					$.dialog.notice({icon:'warning',content:"字段["+adjust_select[2]+"]的长度大于字段["+name+"]的长度",time:3}); 
					bo = false;
				}
				break;
			default:
				if(!flagIfType(name,type,length)){
					bo = false;
				}
				break;
		}
		return bo;
	}
	
	function flagIfType(name,type,length){
		if(adjust_select[3] == type){
			if(parseInt(adjust_select[4]) > parseInt(length)){
				$.dialog.notice({icon:'warning',content:"字段["+adjust_select[2]+"]的长度大于字段["+name+"]的长度",time:3}); 
				return false;
			}
			return true;
		}else{
			$.dialog.notice({icon:'warning',content:"字段["+adjust_select[2]+"]与字段["+name+"]的类型不一致",time:3}); 
			return false;
		}
	}
	
	//移除已选字段行
	function removeFrontType(frontCode){
		$("#fillFront tr").each(function(){
			var code=$(this).find("td[colname='code'] div").html();
			if(code==frontCode){
				$(this).remove();
				adjust_select = [];
			}
		});
	}
	
	//列表行双击事件	
	function returnFrontType(tr){
		tr.die().live("dblclick",function(){
			rightFieldDbclick($(this));
		});
	}
	
	//复位事件
	function rightFieldDbclick(tr){
		tr.find("td[colname='frontName'] div").html("");
		var frontCode = tr.find("td[colname='frontCode'] div");
		var code=frontCode.html();
		frontCode.html("");
		for(var i=0;i<adjust_selected.length;i++){
			var adjust = adjust_selected[i].split("-,-");
			if(code == adjust[1]){
				$("#fillFront tr").parent().append(adjust[0]);
				removeArray(adjust_selected,i);
				i=adjust_selected.length;
			}
		}			
		tr.unbind("dblclick");
	}
	
	//清除已删除数据
	function removeArray(arr,dx){
		if(isNaN(dx)||dx >= arr.length){
			return false;
		}
		arr.splice(dx,1);
	}
});