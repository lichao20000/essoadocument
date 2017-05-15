/**
	@author ldm
	库房结构
*/
var editdia;//编辑弹出框
var roomid='';//库房树id
var ext = /^\d+$/;
var sframe = /^([1-9]\d*)|0$/;
var sframegt0 = /^([1-9]\d*)$/;
$(".editattr").die().live("click", function(){
	edit_warehouse($(this).closest("tr").prop("id").substr(3),$(this).closest("tr").find("td").eq(2));
});
function add_warehouse()
{
	$.ajax({
	    url : $.appClient.generateUrl({
		ESStoreroom : 'add_warehouse'},'x'),
	    success:function(data){
	    	$.dialog({
	    		id: 'addWarehouseDialog',
		    	title:'添加库房',
	    	   	fixed:false,
	    	    resize: false,
	    	    lock : true,
				opacity : 0.1,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    okId : 'saveBtn',
			    ok:function()
		    	{
			    	var code = $("#addwarehouse input[name='code']").val();
			    	var area = $("#addwarehouse input[name='area']").val();
			    	var frame = $("#addwarehouse input[name='framenumber']").val();
			    	var col = $("#addwarehouse input[name='col']").val();
			    	var layer = $("#addwarehouse input[name='layer']").val();
			    	var gridwidth = $("#addwarehouse input[name='gridwidth']").val();
			    	
			    	if(ext.test(area)==false){
			    		$.dialog.notice({icon:'warning',content:'面积必须为整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	if(sframegt0.test(frame)==false || frame > 100){
			    		$.dialog.notice({icon:'warning',content:'排架数量必须为小于或等于100的正整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	
			    	if(sframegt0.test(col)==false || col > 100){
			    		$.dialog.notice({icon:'warning',content:'列必须为小于或等于100的正整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	
			    	if(sframegt0.test(layer)==false || layer > 10){
			    		$.dialog.notice({icon:'warning',content:'层必须为小于或等于10的正整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	
			    	if(col == '' || layer == ''){
			    		$.dialog.notice({icon:'warning',content:'层和列必须输入',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	
			    	if(sframegt0.test(gridwidth)==false ){
			    		$.dialog.notice({icon:'warning',content:'每格宽度必须为正整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	
			    	if(gridwidth == ''){
			    		$.dialog.notice({icon:'warning',content:'每格宽度必须输入',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	// longjunhao 20140811 修复bug 513 验证次数不对
			    	$.post($.appClient.generateUrl({ESStoreroom : 'validatewareCode'}, 'x'),{code:code},function(data){
			    		if(data=='true'){
			    			// longjunhao 20141010 edit 把保存按钮置为不可用，避免重复点击
					    	$('#saveBtn').attr('disabled',"true");
			    			$.post($.appClient.generateUrl({ESStoreroom : 'addwarehouse'}, 'x'),{data : $("#addwarehouse").serialize()}, function(res){
					    		if (res == true) {
					    			$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 2});
					    			$("#flexme1").flexReload();
					    			art.dialog.list['addWarehouseDialog'].close();
					    			return true;
					    		} else {
					    			$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 2});
					    			$('#saveBtn').removeAttr("disabled"); 
					    			return false;
					    		}
					    	});
			    		}else{
			    			codeResult=false;
			    			$.dialog.notice({icon:'warning',content:'库房编号是唯一的，请重新输入',title:'操作提示',time:3});
				    		return false;
			        	}
			    	});
			    	return false;
				 }
		    });
	    	
		    },
		    cache:false
	});
}
//编辑库房
function edit_warehouse(id,atms){
	atm = atms.text();
	roomid=id;
	$.ajax({
	    url : $.appClient.generateUrl({ESStoreroom : 'edit_warehouse',id:roomid},'x'),
	    success:function(data){
	    editdia=$.dialog({
		    	title:'编辑库房',
	    	   	fixed:false,
	    	    resize: false,
	    	    lock : true,
				opacity : 0.1,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    ok:function()
		    	{
			      	var extra = "";
			    	if($("#flexme1").find("tr")!=null){
			    		$("#flexme1").find("tr").each(function(){
			    			if($(this).find("td").eq(2).text()==atm){
			    				return;
			    			}else{
			    				extra += $(this).find("td").eq(2).text()+",";
			    			}
			    		});
			    	}
			    	var code = $("#editwarehouse input[name='code']").val();
			    	if(extra.indexOf(code)!="-1"){
			    		$.dialog.notice({icon:'warning',content:'库房编号必须唯一，请重新输入',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	var url = $.appClient.generateUrl({ESStoreroom : 'editwarehouse',id:roomid}, 'x');
			    	var area = $("#editwarehouse input[name='area']").val();
			    	var frame = $("#editwarehouse input[name='framenumber']").val();
			    	if(ext.test(area)==false){
			    		$.dialog.notice({icon:'warning',content:'面积必须为整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	if(sframe.test(frame)==false){
			    		$.dialog.notice({icon:'warning',content:'柜架必须为非负整数',title:'1秒后自动关闭',time:2});
			    		return false;
			    	}
			    	var data = $("#editwarehouse").serialize();
			    	$.post(url,{
			    		data : data
			    	}, function(res) {
			    		if (res == true) {
			    			$.dialog.notice({icon : 'succeed',content : '编辑成功',title : '3秒后自动关闭',	time : 2});
			    			$("#flexme1").flexReload();
			    			return;
			    		} else {
			    			$.dialog.notice({icon : 'error',content : '编辑失败',title : '3秒后自动关闭',time : 2});
			    			return;
			    		}
			    	});
	            }
		    });
	    	
		},
		cache:false
	});
}
//删除库房
function deletestoreroom() {
	var checkboxlength = $('#flexme1 input:checked').length;
	if (checkboxlength == 0) {
		$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
		return;
	}
	$.dialog({
		content : '确定要删除吗？删除后不能恢复！',
		okVal : '确定',
		ok : true,
		cancelVal : '关闭',
		cancel : true,
		ok : function() {
			var idStr = '';
			$('#flexme1 input:checked').each(
				function(i) {
					idStr += $('#flexme1 input:checked:eq(' + i+ ')').val()+ ',';
				});
				var url = $.appClient.generateUrl({ESStoreroom : 'deleteStoreroomList'}, 'x');
				$.getJSON(url, {data : idStr}, function(res) {
					if(res){
						$.dialog.notice({
							icon : 'succeed',
							content :'删除成功！',
							time : 3
						});
						$("#flexme1").flexReload();
						return;
					}else{
						$.dialog.notice({icon : 'warning',
							content :'库房中有档案存在，不允许删除',
							time : 3
						});
						$("#flexme1").flexReload();
						return;
					}
				});
		}
	});
}
//库房报表页面的渲染
var __warehouseModel='storm';
function warehouseReport(){
	  var checkObj=$("#flexme1").find("input[name='storeroomid']:checked");
	  //alert(checkObj.length);return;
	  if(checkObj.length==0){
		  $.dialog.notice({title:'操作提示',icon:'warning',content:'请选择数据！',time:3});
		  return false;
	  }else if(checkObj.length>0){
		  var htmlContent=["<div class='warehouseWrap'>"];
		  $.getJSON($.appClient.generateUrl({ESStoreroom:'getWarehouseDataByModel',warehouseModel:__warehouseModel},'x'),function(result){
			  //alert(result);
			  if(result.length==0){
				  $.dialog.notice({title:'操作提示',icon:'warning',content:'目前库房没有报表！',time:3});
				  return false;
			  }
			  htmlContent.push("<h2>报表格式选择</h2>");
			  htmlContent.push("<div class='warehouseSelect' id='warehouseLevel'>");
//			  if(result.length == 1){
//				var reportStyleForOut = '';
//				if((result[0].reportstyle) == 'pdf'){
//					reportStyleForOut = 'PDF';
//				}else if((result[0].reportstyle) == 'xls'){
//					reportStyleForOut = 'EXCEL';
//				}else if((result[0].reportstyle) == 'rtf'){
//					reportStyleForOut = 'WORD';
//				}
//				htmlContent.push("<p><label for='"+(result[0].id)+"'><input type='radio' title='"+(result[0].reportstyle)+"' name='RE' id='"+(result[0].id)+"' value='form' checked='checked' /><span>"+(result[0].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
//			  }else if(result.length == 2){
//				var reportStyleForOut = '';
//				if((result[0].reportstyle) == 'pdf'){
//					reportStyleForOut = 'PDF';
//				}else if((result[0].reportstyle) == 'xls'){
//					reportStyleForOut = 'EXCEL';
//				}else if((result[0].reportstyle) == 'rtf'){
//					reportStyleForOut = 'WORD';
//				}
//				var reportStyleForOut1 = '';
//				if((result[1].reportstyle) == 'pdf'){
//					reportStyleForOut1 = 'PDF';
//				}else if((result[1].reportstyle) == 'xls'){
//					reportStyleForOut1 = 'EXCEL';
//				}else if((result[1].reportstyle) == 'rtf'){
//					reportStyleForOut1 = 'WORD';
//				}
//				htmlContent.push("<p><label for='"+(result[0].id)+"'><input type='radio' title='"+(result[0].reportstyle)+"' name='RE' id='"+(result[0].id)+"' value='form' checked='checked' /><span>"+(result[0].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
//				htmlContent.push("<p><label for='"+(result[1].id)+"'><input type='radio' title='"+(result[1].reportstyle)+"' name='RE' id='"+(result[1].id)+"' value='detail' /><span>"+(result[1].title)+'( '+reportStyleForOut1+' )'+"</span></label></p>");
//			  }else if(result.length >2){
				  for(var i=0;i<result.length;i++){
					  var reportStyleForOut = '';
					  if((result[i].reportstyle) == 'pdf'){
						  reportStyleForOut = 'PDF';
					  }else if((result[i].reportstyle) == 'xls'){
						  reportStyleForOut = 'EXCEL';
					  }else if((result[i].reportstyle) == 'rtf'){
						  reportStyleForOut = 'WORD';
					  }
					  if(i==0){
						  htmlContent.push("<p><label for='"+(result[i].id)+"'><input type='radio' title='"+(result[i].reportstyle)+"' name='RE' id='"+(result[i].id)+"' value='form' checked='checked' /><span>"+(result[i].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
					  }else{
						  htmlContent.push("<p><label for='"+(result[i].id)+"'><input type='radio' title='"+(result[i].reportstyle)+"' name='RE' id='"+(result[i].id)+"' value='detail' /><span>"+(result[i].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
					  }
				  }
//			  }
			  htmlContent.push("</div></div>");
			  htmlContent=htmlContent.join('');
			  $.dialog({
					title:'库房报表',
					lock:true,
					content:htmlContent,
					ok:printWarehouseReport,
					cancel:true,
					okVal:'确定',
					cancelVal:'取消'
			 });
		  });
	  }
}
//库房报表下载
function printWarehouseReport(){
	  var warehouseLV = $('#warehouseLevel').find("input[name='RE']:checked");
	  var warehouseId=warehouseLV.attr('id');
	  var warehouseType=warehouseLV.attr('title');
	  var reportTitle=warehouseLV.next().html();
		if(warehouseLV.length==0){
			$.dialog.notice({title:'操作提示',icon:'warning',content:'请选择报表格式！',time:3});
			return false;
		}else{
			var ids=[];
			$("#flexme1").find("input[name='storeroomid']:checked").each(function(){
				ids.push($(this).val());
			});
			ids=ids.join(',');
			$.dialog.notice({content: '正在努力打印中,稍后点击“消息提示”进行下载',icon:"success",time:5});
			var url=$.appClient.generateUrl({ESStoreroom:'printWarehousePage'},'x');
			$.post(url,{warehouseId:warehouseId,warehouseType:warehouseType,ids:ids,reportTitle:reportTitle},function(fileName){
				
			});
		}
}


