/*wangbo 20140318*/

var ipZZ = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
var portZZ = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
var rootDirZZ = /^[a-zA-Z]:(\\[0-9a-zA-Z\u4e00-\u9fa5]*)$/;
$(".editbtn").die().live("click", function(){
	edit_fileEquipment($(this).closest("tr"));
});

//添加文件存储设备
function  add_fileEquipment(){
	$.ajax({
	        url : $.appClient.generateUrl({
			ESFileEquipment : 'add_fileEquipment'},'x'),
		    success:function(data){
			    	$.dialog({
				    	title:'添加文件存储设备',
			    	   	fixed:false,
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
					    	var ip = $("#addFileEquipment input[name='ip']").val();
					    	var port = $("#addFileEquipment input[name='port']").val();
					    	var rootDir = $("#addFileEquipment input[name='rootDir']").val();
					    	var isEnabled = $("#addFileEquipment select[name='isEnabled']").val();
					    	
					    	var url = $.appClient.generateUrl({ESFileEquipment : 'addFileEquipment'}, 'x');
					    	var data1 = $("#addFileEquipment").serialize();
					    	if(ip==''||port==''||rootDir==''||isEnabled==''){
					    		if(ip=='')
					    			$("#addFileEquipment input[name='ip']").addClass("warnning");
					    		if(port=='')
					    			$("#addFileEquipment input[name='port']").addClass("warnning");
					    		if(rootDir=='')
					    			$("#addFileEquipment input[name='rootDir']").addClass("warnning");
					    		if(isEnabled=='')
					    			$("#addFileEquipment select[name='isEnabled']").addClass("warnning");
					    		return false;
					    	}else if(ipZZ.test(ip)==false){
					    		$("#addFileEquipment input[name='ip']").addClass("warnning");
					    		return false;
					    	}else   if(portZZ.test(port)==false){
					    		$("#addFileEquipment input[name='port']").addClass("warnning");
					    		return false;
					    	}else 	if(rootDirZZ.test(rootDir)==false){
					    		$("#addFileEquipment input[name='rootDir']").addClass("warnning");
					    		return false;
					    	}	else{
					    		$.post(url,{data : data1}, function(res){
					    			if (res == 'true') {
					    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
					    				$("#fileEquipGrid").flexReload();
					    				return;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
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

function delete_fileEquipment(){
		var checkboxObj=$("input[name='fileEquipId']:checked");
		if(checkboxObj.length =='0' ||checkboxObj.length !='1')
		{
			$.dialog.notice({icon:'warning',content:'请先选择要删除的文件存储设备并且只能选取一个',time:3});
			return false;
		}else{
		//遍历选中的数据
			$.dialog({
				content:'确定要删除勾选的数据吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var tr = $(checkboxObj).closest("tr");
					var columns  = ['id','priority'];
					var colValues = $("#fileEquipGrid").flexGetColumnValue(tr,columns);
				    var colArray = new Array();
				    colArray = colValues.split("|");
					var url = $.appClient.generateUrl({ESFileEquipment : 'deleteFileEquipment',id:colArray[0],priority:colArray[1]}, 'x');
					$.post(url, function(res){
							if (res == 'true') {
								$.dialog.notice({icon : 'succeed',content : '删除成功',title : '3秒后自动关闭',time : 3});
								$("#fileEquipGrid").flexReload();
								return;
							} else {
								$.dialog.notice({icon : 'error',content : '删除失败',title : '3秒后自动关闭',time : 3});
								return;
							}
				   });
				}
			});
		}
}

function start_fileEquipment(){
	   var checkboxObj=$("input[name='fileEquipId']:checked");
		if(checkboxObj.length =='0'  ||checkboxObj.length !='1')
		{
			$.dialog.notice({icon:'warning',content:'请先选择要启用的文件存储设备且只能选择一个',time:3});
			return false;
		}else{
		//遍历选中的数据
		 
					var url = $.appClient.generateUrl({ESFileEquipment : 'startOrStopFileEquipment',id:$(checkboxObj).val(),mark:1}, 'x');
					$.post(url, function(res){
						if (res == 'true') {
							$.dialog.notice({icon : 'succeed',content : '启用成功',title : '3秒后自动关闭',time : 3});
							$("#fileEquipGrid").flexReload();
							return;
						} else {
							$.dialog.notice({icon : 'error',content : '启用失败',title : '3秒后自动关闭',time : 3});
							return;
						}
					});
			 
		}
}


function stop_fileEquipment(){
		var checkboxObj=$("input[name='fileEquipId']:checked");
		if(checkboxObj.length =='0' ||checkboxObj.length !='1' )
		{
			$.dialog.notice({icon:'warning',content:'请先选择要禁用的文件存储设备且只能选择一个',time:3});
			return false;
		}else{
		//遍历选中的数据
					var url = $.appClient.generateUrl({ESFileEquipment : 'startOrStopFileEquipment',id:$(checkboxObj).val(),mark:0}, 'x');
					$.post(url, function(res){
						if (res == 'true') {
							$.dialog.notice({icon : 'succeed',content : '禁用成功',title : '3秒后自动关闭',time : 3});
							$("#fileEquipGrid").flexReload();
							return;
						} else {
							$.dialog.notice({icon : 'error',content : '禁用失败',title : '3秒后自动关闭',time : 3});
							return;
						}
					});
		}
}

function setFirst_fileEquipment(){
	var checkboxObj=$("input[name='fileEquipId']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length!='1')
	{
		$.dialog.notice({icon:'warning',content:'请先选择文件存储设备并且只能选取一个',time:3});
		return false;
	}else{
 
		var tr = $(checkboxObj).closest("tr");
		var columns  = ['id','priority'];
		var colValues = $("#fileEquipGrid").flexGetColumnValue(tr,columns);
		 var colArray = new Array();
		 colArray = colValues.split("|");
		var url = $.appClient.generateUrl({ESFileEquipment : 'setFirstFileEquipment',id:colArray[0],priority:colArray[1]}, 'x');
		$.post(url, function(res){
			if (res == 'true') {
				$.dialog.notice({icon : 'succeed',content : '设为最优成功',title : '3秒后自动关闭',time : 3});
				$("#fileEquipGrid").flexReload();
				return;
			} else {
				$.dialog.notice({icon : 'error',content : '设为最优失败',title : '3秒后自动关闭',time : 3});
				return;
			}
		});
	}
	
}

function setNetSegment_fileEquipment(){
	var checkboxObj=$("input[name='fileEquipId']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length!='1')
	{
		$.dialog.notice({icon:'warning',content:'请先选择文件存储设备并且只能选取一个',time:3});
		return false;
	}else{
		var tr = $(checkboxObj).closest("tr");
		var columns  = ['id','priority'];
		var colValues = $("#fileEquipGrid").flexGetColumnValue(tr,columns);
	    var colArray = new Array();
	    colArray = colValues.split("|");
		$.ajax({
			type: "POST",
	        url : $.appClient.generateUrl({ESFileEquipment : 'setNetSegment_fileEquipment'},'x'),
			data:{fileStoreId:colArray[0],priority:colArray[1]},
	    	
		    success:function(data){
			    	$.dialog({
				    	title:'网段设置',
			    	   	fixed:false,
			    	    resize: false,
			    	    lock : true,
			    	    zIndex:100,
//						opacity : 0.1,
//				    	okVal:'保存',
//					    ok:true,
//					    cancelVal: '关闭',
//					    cancel: true,
				    	padding:0,
					    content:data
//					    ok:function()
//				    	{
//					    	var ip = $("#addFileEquipment input[name='ip']").val();
//					    	var port = $("#addFileEquipment input[name='port']").val();
//					    	var rootDir = $("#addFileEquipment input[name='rootDir']").val();
//					    	var isEnabled = $("#addFileEquipment select[name='isEnabled']").val();
//					    	
//					    	var url = $.appClient.generateUrl({ESFileEquipment : 'addFileEquipment'}, 'x');
//					    	var data1 = $("#addFileEquipment").serialize();
//					    	if(ip==''||port==''||rootDir==''||isEnabled==''){
//					    		if(ip=='')
//					    			$("#addFileEquipment input[name='ip']").addClass("warnning");
//					    		if(port=='')
//					    			$("#addFileEquipment input[name='port']").addClass("warnning");
//					    		if(rootDir=='')
//					    			$("#addFileEquipment input[name='rootDir']").addClass("warnning");
//					    		if(isEnabled=='')
//					    			$("#addFileEquipment select[name='isEnabled']").addClass("warnning");
//					    		return false;
//					    	}else if(ipZZ.test(ip)==false){
//					    		$("#addFileEquipment input[name='ip']").addClass("warnning");
//					    		return false;
//					    	}else   if(portZZ.test(port)==false){
//					    		$("#addFileEquipment input[name='port']").addClass("warnning");
//					    		return false;
//					    	}else 	if(rootDirZZ.test(rootDir)==false){
//					    		$("#addFileEquipment input[name='rootDir']").addClass("warnning");
//					    		return false;
//					    	}	else{
//					    		$.post(url,{data : data1}, function(res){
//					    			if (res == 'true') {
//					    				$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
//					    				$("#fileEquipGrid").flexReload();
//					    				return;
//					    			} else {
//					    				$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
//					    				return;
//					    			}
//					    		});
//					    	}
//						 }
				    });
			    },
			    cache:false
		});
//		var tr = $(checkboxObj).closest("tr");
//		var columns  = ['id','priority'];
//		var colValues = $("#fileEquipGrid").flexGetColumnValue(tr,columns);
//		var colArray = new Array();
//		colArray = colValues.split("|");
//		var url = $.appClient.generateUrl({ESFileEquipment : 'setNetSegmentFileEquipment',id:colArray[0],priority:colArray[1]}, 'x');
//		$.post(url, function(res){
//			if (res == 'true') {
//				$.dialog.notice({icon : 'succeed',content : '设为最优成功',title : '3秒后自动关闭',time : 3});
//				$("#fileEquipGrid").flexReload();
//				return;
//			} else {
//				$.dialog.notice({icon : 'error',content : '设为最优失败',title : '3秒后自动关闭',time : 3});
//				return;
//			}
//		});
	}
	
}

function edit_fileEquipment(tr){
	var columns = ['id','ip','port','rootDir','isEnabled','priority','description'];
	var colValues = $("#fileEquipGrid").flexGetColumnValue(tr,columns);
		$.ajax({
			type:'post',
		    url : $.appClient.generateUrl({ESFileEquipment : 'edit_fileEquipment'},'x'),
		    data: {data:colValues},
		    success:function(data){
		    editdia=$.dialog({
			    	title:'编辑文件存储设备',
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
				    	var ip = $("#editFileEquipment input[name='ip']").val();
				    	var port = $("#editFileEquipment input[name='port']").val();
				    	var rootDir = $("#editFileEquipment input[name='rootDir']").val();
				    	var isEnabled = $("#editFileEquipment select[name='isEnabled']").val();
				    	
				    	var url = $.appClient.generateUrl({ESFileEquipment : 'addFileEquipment'}, 'x');
				    	var data1 = $("#editFileEquipment").serialize();
				    	if(ip==''||port==''||rootDir==''||isEnabled==''){
				    		if(ip=='')
				    			 $("#editFileEquipment input[name='ip']").addClass("warnning");
				    		if(port=='')
				    			$("#editFileEquipment input[name='port']").addClass("warnning");
				    		if(rootDir=='')
				    			$("#editFileEquipment input[name='rootDir']").addClass("warnning");
				    		if(isEnabled=='')
				    			$("#editFileEquipment select[name='isEnabled']").addClass("warnning");
				    		return false;
				    	}else if(ipZZ.test(ip)==false){
				    		 $("#editFileEquipment input[name='ip']").addClass("warnning");
				    		return false;
				    	}else   if(portZZ.test(port)==false){
				    		$("#editFileEquipment input[name='port']").addClass("warnning");
				    		return false;
				    	}else 	if(rootDirZZ.test(rootDir)==false){
				    		$("#editFileEquipment input[name='rootDir']").addClass("warnning");
				    		return false;
				    	}		else{
				    		$.post(url,{data : data1}, function(res){
				    			if (res == 'true') {
				    				$.dialog.notice({icon : 'succeed',content : '修改成功!',title : '3秒后自动关闭',time : 3});
				    				$("#fileEquipGrid").flexReload();
				    				return;
				    			} else {
				    				$.dialog.notice({icon : 'error',content : '修改失败!',title : '3秒后自动关闭',time : 3});
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

function keyWordQuery(){
	var keyword=$.trim($('input[name="keyWord"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var url=$.appClient.generateUrl({ESFileEquipment:'getFileEquipList',keyWord:keyword},'x');
	$("#fileEquipGrid").flexOptions({url:url,newp:1}).flexReload();
	return false;
}

$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'keyWord') {
		keyWordQuery();
	}
});

$(".checkbox").die().live('click',function(){
	if($(this).is(':checked')==true){
		$(".checkbox").each(function(){
			$(this).attr('checked',false);
		});
		$(this).attr('checked',true);
	}else{
	}
});

 
$("#fileEquipGrid tbody tr").die().live('click',function(){
	var selectTr = $(this);
	$(".checkbox").each(function(){
		if($(this).attr('checked')=="checked"){
			 if($(this).closest("tr")[0]==selectTr[0]){
			 }else{
				 $(this).attr('checked',false);
			 }
		}else{
		}
	});
});
