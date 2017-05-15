//wangbo 20140325
var simpleZZ  =  new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
 var interfaceZZ  =  new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
 var tokenZZ = /^\w{2}|\w{15}$/;
 var urlZZ = /^http:\/\/.*$/;
 
$(".editbtn").die().live("click", function(){
	edit_consoleServer($(this).closest("tr"));
});
$(".editbtn1").die().live("click", function(){
	edit_app($(this).closest("tr"));
});
//开启服务
function start_consoleServer(){
			var treeObj = $.fn.zTree.getZTreeObj("appTreeDemo");
			if(treeObj!=null){
				var nodes = treeObj.getSelectedNodes();
				if(nodes.length<=0){
		              return ;
				}else if(nodes[0].name=="应用列表"){
		              return ;
				}
				appId = nodes[0].appId;
			} 
			var checkboxlength = $('#consoleServerGrid input:checked').length;
			if (checkboxlength == 0) {
				$.dialog.notice({icon : 'warning',content : '请选择要启用的服务！',time : 3});
				return;
			}
			var idStr = '';
			var qiyong = 0;
			var jinyong = 0;
			$('#consoleServerGrid input:checked').each(
				function(i) {
					var columns = ['isEnabled'];
					var colValues = $("#consoleServerGrid").flexGetColumnValue($(this).closest("tr"),columns);
					if(colValues=='启用'){
						qiyong=qiyong+1;
					}else{
						jinyong = jinyong+1;
						idStr += $('#consoleServerGrid input:checked:eq(' + i+ ')').val()+ ',';
					}
				});
			    idStr=idStr.substring(0,idStr.length-1);
			    if(jinyong!=0){
			    	var url = $.appClient.generateUrl({ESConsoleServer : 'startConsoleServerList'}, 'x');
			    	$.post(url, {data : idStr}, function(res) {
			    		if(res=='true'){
			    			if(qiyong==0){
			    				$.dialog.notice({
			    					icon : 'succeed',
			    					content :'启用'+jinyong+'个服务成功！',
			    					time : 3
			    				});
			    			}
			    			if(jinyong!=0&&qiyong!=0){
			    				$.dialog.notice({
			    					icon : 'succeed',
			    					content :'成功启用'+jinyong+'个服务，其余'+qiyong+'个都已是启用状态！',
			    					time : 3
			    				});
			    			}
			    			$("#consoleServerGrid").flexReload();
			    			return;
			    		}else{
			    			$.dialog.notice({icon : 'warning',
			    				content :'启用失败！',
			    				time : 3
			    			});
			    			$("#consoleServerGrid").flexReload();
			    			return;
			    		}
			    	});
			    }else{
			    	$.dialog.notice({
    					icon : 'warning',
    					content :'您选择的'+qiyong+'个服务都已是启用状态！',
    					time : 3
    				});
			    }
}
//关闭控制台服务
function stop_consoleServer(){
		var treeObj = $.fn.zTree.getZTreeObj("appTreeDemo");
		if(treeObj!=null){
			var nodes = treeObj.getSelectedNodes();
			if(nodes.length<=0){
	              return ;
			}else if(nodes[0].name=="应用列表"){
	              return ;
			}
			appId = nodes[0].appId;
		} 
		var checkboxlength = $('#consoleServerGrid input:checked').length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请选择要禁用的服务！',time : 3});
			return;
		}
		var contentReason = '<div id="reasonDiv"><span>禁用原因：</span>' +
			'<textarea name="reason" rows="4" cols="45"></textarea>' +
			'</div>';
		// 输入禁用原因
		$.dialog({
	    	title:'输入禁用原因',
	    	modal:true, //蒙层（弹出会影响页面大小） 
    	   	fixed:false,
    	   	stack: true ,
    	    resize: false,
    	    lock : true,
			opacity : 0.1,
			padding: '0px',
			width:400,
			height:100,
		    content:contentReason,
		    okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				var reason = $('#reasonDiv [name="reason"]').val();
				var idStr = '';
				var qiyong = 0;
				var jinyong = 0;
				$('#consoleServerGrid input:checked').each(
					function(i) {
						var columns = ['isEnabled'];
						var colValues = $("#consoleServerGrid").flexGetColumnValue($(this).closest("tr"),columns);
						if(colValues=='禁用'){
							jinyong=jinyong+1;
						}else{
							qiyong = qiyong+1;
							idStr += $('#consoleServerGrid input:checked:eq(' + i+ ')').val()+ ',';
						}
					});
				    idStr=idStr.substring(0,idStr.length-1);
				    if(qiyong!=0){
				    	var url = $.appClient.generateUrl({ESConsoleServer : 'stopConsoleServerList'}, 'x');
				    	$.post(url, {data : idStr,reason:reason}, function(res) {
				    		if(res=='true'){
				    			if(jinyong==0){
				    				$.dialog.notice({
				    					icon : 'succeed',
				    					content :'禁用'+qiyong+'个服务成功！',
				    					time : 3
				    				});
				    			}
				    			if(jinyong!=0&&qiyong!=0){
				    				$.dialog.notice({
				    					icon : 'succeed',
				    					content :'成功禁用'+qiyong+'个服务，其余'+jinyong+'个都已是禁用状态！',
				    					time : 3
				    				});
				    			}
				    			
				    			$("#consoleServerGrid").flexReload();
				    			return;
				    		}else{
				    			$.dialog.notice({icon : 'warning',
				    				content :'启用失败！',
				    				time : 3
				    			});
				    			$("#consoleServerGrid").flexReload();
				    			return;
				    		}
				    	});
				    }else{
				    	$.dialog.notice({
							icon : 'warning',
							content :'您选择的'+jinyong+'个服务都已是禁用状态！',
							time : 3
						});
				    }
			}
	    });
}
 
//添加控制台服务
function add_consoleServer(){
		var appId='';
		var treeObj = $.fn.zTree.getZTreeObj("appTreeDemo");
		if(treeObj!=null){
			var nodes = treeObj.getSelectedNodes();
			if(nodes.length<=0){
	              return ;
			}else if(nodes[0].name=="应用列表"){
	              return ;
			}
			appId = nodes[0].appId;
		} 
		$.ajax({
		        url : $.appClient.generateUrl({
				ESConsoleServer : 'add_consoleServer',appId:appId},'x'),
			    success:function(data){
				    	$.dialog({
					    	title:'添加控制台服务',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	okVal:'保存',
						    ok:true,
						    cancelVal: '关闭',
						    cancel: true,
						    content:data,
						    ok:function()
					    	{

						    	var serviceId = $("#addConsoleServer input[name='serviceId']").val();
						    	var serviceName = $("#addConsoleServer input[name='serviceName']").val();
						    	var interfaceName = $("#addConsoleServer input[name='interfaceName']").val();
						    	var url = $("#addConsoleServer input[name='url']").val();
						    	//var token = $("#addConsoleServer input[name='token']").val();
						    	var enableState = $("#addConsoleServer select[name='enableState']").val();
 						    	//var attachApp = $("#addConsoleServer select[name='attachApp']").val();
						    	var data1 = $("#addConsoleServer").serialize();
						    	var Actionurl = $.appClient.generateUrl({ESConsoleServer : 'addConsoleServer'}, 'x');
						    	if(serviceId==''||serviceName==''||interfaceName==''||url==''||enableState==''){
						    		if(serviceId=='')
						    			$("#addConsoleServer input[name='serviceId']").addClass("warnning");
						    		if(serviceName=='')
						    			$("#addConsoleServer input[name='serviceName']").addClass("warnning");
						    		if(interfaceName=='')
						    			$("#addConsoleServer input[name='interfaceName']").addClass("warnning");
						    		if(url=='')
						    			$("#addConsoleServer input[name='url']").addClass("warnning");
//						    		if(token=='')
//						    			$("#addConsoleServer input[name='token']").addClass("warnning");
						    		if(enableState=='')
						    			$("#addConsoleServer select[name='enableState']").addClass("warnning");
//						    		if(attachApp=='')
//						    			$("#addConsoleServer select[name='attachApp']").addClass("warnning");
						    		return false;
						    	}else if(simpleZZ.test(serviceId)==true){
						    		$("#addConsoleServer input[name='serviceId']").addClass("warnning");
						    		return false;
						    	}else   if(simpleZZ.test(serviceName)==true){
						    		$("#addConsoleServer input[name='serviceName']").addClass("warnning");
						    		return false;
						    	}else 	if(interfaceZZ.test(interfaceName)==true){
						    		$("#addConsoleServer input[name='interfaceName']").addClass("warnning");
						    		return false;
						    	}else   if(urlZZ.test(url)==false){
						    		$("#addConsoleServer input[name='url']").addClass("warnning");
						    		return false;
						    	}
//						    	else 	if(tokenZZ.test(token)==false){
//						    		$("#addConsoleServer input[name='token']").addClass("warnning");
//						    		return false;
//						    	}
						    	else{
						    		var url = $.appClient.generateUrl({ESConsoleServer : 'ValidateServiceName'}, 'x');
						    		$.post(url, {data : serviceName}, function(res) {
						        		if(res=='true'){//说明serviceName不存在
						        			$.post(Actionurl,{data : data1}, function(res){
						        				if (res == 'true' || res) {
						        					$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
						        					$("#consoleServerGrid").flexReload();
						        					return;
						        				} else {
						        					$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
						        					$("#consoleServerGrid").flexReload();
						        					return;
						        				}
						        			});
						        		}else{//说明serviceName已存在
						        			alert("说明已存在");
						            		 $("#addConsoleServer input[name='serviceName']").addClass("warnning");
						        			return false;
						        		}
						        	});
						    	}
							}
					    });
				    },
				    cache:false
			});
} 
function edit_consoleServer(tr){
	var columns = ['id','serviceid','serviceName','interface','url','isEnabled','reason'];
	var colValues = $("#consoleServerGrid").flexGetColumnValue(tr,columns);
		$.ajax({
			type:'post',
		    url : $.appClient.generateUrl({ESConsoleServer : 'edit_consoleServer'},'x'),
		    data:{data:colValues},
		    success:function(data){
		    editdia=$.dialog({
			    	title:'编辑控制台服务',
		    	   	fixed:false,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'保存',
				    ok:true,
				    ok:function()
			    	{
				    	var serviceId = $("#editConsoleServer input[name='serviceId']").val();
				    	var serviceName = $("#editConsoleServer input[name='serviceName']").val();
				    	var interfaceName = $("#editConsoleServer input[name='interfaceName']").val();
				    	var url = $("#editConsoleServer input[name='url']").val();
//				    	var token = $("#editConsoleServer input[name='token']").val();
				    	var enableState = $("#editConsoleServer select[name='enableState']").val();
				    	
				    	var Actionurl = $.appClient.generateUrl({ESConsoleServer : 'addConsoleServer'}, 'x');
				    	var data1 =  $("#editConsoleServer").serialize();
				    	if(serviceId==''||serviceName==''||interfaceName==''||url==''||enableState==''){
				    		if(serviceId=='')
				    			$("#editConsoleServer input[name='serviceId']").addClass("warnning");
				    		if(serviceName=='')
				    			$("#editConsoleServer input[name='serviceName']").addClass("warnning");
				    		if(interfaceName=='')
				    			$("#editConsoleServer input[name='interfaceName']").addClass("warnning");
				    		if(url=='')
				    			$("#editConsoleServer input[name='url']").addClass("warnning");
//				    		if(token=='')
//				    			$("#editConsoleServer input[name='token']").addClass("warnning");
				    		if(enableState=='')
				    			$("#editConsoleServer select[name='enableState']").addClass("warnning");
				    		return false;
				    	}else if(simpleZZ.test(serviceId)==true){
				    		$("#editConsoleServer input[name='serviceId']").addClass("warnning");
				    		return false;
				    	}else   if(simpleZZ.test(serviceName)==true){
				    		$("#editConsoleServer input[name='serviceName']").addClass("warnning");
				    		return false;
				    	}else 	if(interfaceZZ.test(interfaceName)==true){
				    		$("#editConsoleServer input[name='interfaceName']").addClass("warnning");
				    		return false;
				    	}else   if(urlZZ.test(url)==false){
				    		$("#editConsoleServer input[name='url']").addClass("warnning");
				    		return false;
				    	}
//				    	else 	if(tokenZZ.test(token)==false){
//				    		$("#editConsoleServer input[name='token']").addClass("warnning");
//				    		return false;
//				    	}	
				    	else{
				    		$.post(Actionurl,{data : data1}, function(res){
				    			if (res == 'true' || res) {
				    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
				    				$("#consoleServerGrid").flexReload();
				    				return;
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
				    				return;
				    			}
				    		});
				    	}
					 }
			    });
		    	
			    },
			    cache:false
		});
	}
function delete_consoleServer(){
	var treeObj = $.fn.zTree.getZTreeObj("appTreeDemo");
	if(treeObj!=null){
		var nodes = treeObj.getSelectedNodes();
		if(nodes.length<=0){
              return ;
		}else if(nodes[0].name=="应用列表"){
              return ;
		}
	} 
	var checkboxlength = $('#consoleServerGrid input:checked').length;
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
			$('#consoleServerGrid input:checked').each(
				function(i) {
					idStr += $('#consoleServerGrid input:checked:eq(' + i+ ')').val()+ ',';
				});
			    idStr=idStr.substring(0,idStr.length-1);
				var url = $.appClient.generateUrl({ESConsoleServer : 'deleteConsoleServerList'}, 'x');
				debugger;
				$.post(url, {data : idStr}, function(res) {
					if(res=='true'){
						$.dialog.notice({
							icon : 'succeed',
							content :'删除成功！',
							time : 3
						});
						$("#consoleServerGrid").flexReload();
						return;
					}else{
						$.dialog.notice({icon : 'warning',
							content :'不允许删除',
							time : 3
						});
						$("#consoleServerGrid").flexReload();
						return;
					}
				});
		}
	});
}

function consoleServerQuery(){
	var appId = 0;
	var treeObj = $.fn.zTree.getZTreeObj("appTreeDemo");
	if(treeObj!=null){
		var nodes = treeObj.getSelectedNodes();
		if(nodes.length<=0){
		}else if(nodes[0].name=="应用列表"){
		} else {
			appId = nodes[0].appId;
		}
	} 
	var keyword=$.trim($('input[name="keyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var url=$.appClient.generateUrl({ESConsoleServer:'getConsoleServerList',keyWord:keyword,appId:appId},'x');
	$("#consoleServerGrid").flexOptions({url:url,newp: 1 }).flexReload();
	return false;
}
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'keyWord') {
		consoleServerQuery();
	}
});
 
