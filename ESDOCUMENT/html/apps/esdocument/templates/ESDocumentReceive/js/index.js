/**
 * @author gengqianfeng
 */
$(document).ready(function(){
	var url=$.appClient.generateUrl({ESDocumentReceive:'getLoaderListInfo'},'x');
	$("#esDataList").flexigrid({
		url: url,
		dataType: 'json',
		colModel : [
		    {display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
			{display: '序号', name : 'num', width : 30, align: 'center'}, 
			{display: '<input type="checkbox" name="paths">', name : 'ids', width : 20, align: 'center'},
			{display : '操作',name : 'operate',width : 30,align : 'center'},
			{display: '查看文件', name : 'scanFile', width : 50, align: 'center'},
			{display: '发放单编号', name : 'no', width : 140, align: 'left'},
			{display: '接收（单位/用户）标识', name : 'part_code',hide:true, width : 150, align: 'left'},
			{display: '接收（单位/用户）名称', name : 'part_name', width : 150, align: 'left'},
			{display: '份数', name : 'copies', width : 40, align: 'right'},
			{display: '状态', name : 'status', width : 80, align: 'left'},
			{display: '发起人', name : 'creater', width : 120, align: 'left'},
			{display: '发起时间', name : 'createtime', width : 120, align: 'center'},
			{display: '接收操作人', name : 'receiver', width : 120, align: 'left'},
			{display: '接收签字人', name : 'sign', width : 120, align: 'left'},
			{display: '接收时间', name : 'receivetime', width : 120, align: 'center'}
		],
		buttons : [{name: '删除', bclass: 'delete', onpress: delReceive },
		           {name: '筛选', bclass: 'filter', onpress: filterReceive },
		           {name: '还原数据', bclass: 'back', onpress: backReceive }
		],
		usepager: true,
		title: '&nbsp;',
		nomsg:"没有数据",
		useRp: true,
		width: width,
		height:height,
		showTableToggleBtn: true,
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...'
	});
	//全选
	$("input[name='paths']:checkbox").die().live("click",function(){
		$("#esDataList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	//编辑事件
	$(".editbtn").die().live("click", function(){
		editReceive($(this));
	});
	
	//添加筛选行
	$('.newfilter').die().live('click',function (){
		var t = $(this).parent().clone().insertAfter($(this).parent());
		t.each(function(){
			$(this).find('input').val('');
		});
	});

	//删除筛选行
	$('.delfilter').die().live('click',function (){
		if($('#contents p').length > 5){
			$(this).closest('p').remove();
		}else{
			var tds = $(this).closest('p');
			tds.find('input').val('');
			var select = tds.find('select');
			$(select[0]).val("");
			$(select[1]).val("like");
			$(select[2]).val("AND");
		}
	});
	
	//查看接收文件
	$(".detailsbtn2").die().live("click",function(){
		scanReceiveFile($(this).attr("fileId"));
	});
	
	//查看接收文件
	function scanReceiveFile(fileId){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentReceive:'scanFile'},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'查看接收文件',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    init:function(){
				    loadSelFile(fileId);
				    },cancel:function(){
						//关闭添加窗口
					}
			    });
		    },
		    cache:false
		});
	}
	
	//处理接收单
	function editReceive(val){
		var receiveId=val.closest("tr").prop("id").substr(3);
		var send_id=val.attr("sendId");
		$.ajax({
		    url:$.appClient.generateUrl({ESDocumentReceive:'edit',receiveId:receiveId},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'处理接收单',
		    		width: '500px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确认接收',
				    ok:true,
				    init:function(){
				    	$("#editReceive").autovalidate();
				    },
			    	ok:function(){
			    		var status=val.closest("tr").find("td[colname='status'] div").html();
			    		if(!$("#editReceive").validate()){
			    			return false;
			    		}
		    			if(status=="已接收"){
		    				$.dialog.notice({icon:"warning",content:"不可重复接收",time:3});
							return false;
		    			}
		    			var count = $('#loadfile div').length;
		    			if(count<1){
		    				$.dialog.notice({icon:"warning",content:"请上传签字单后确认接收！",time:3});
							return false;
		    			}
		    			var fileName = $('#loadfile').find("input[name='fileName']").val();
		    			if(fileName.length > 30){
		    				$.dialog.notice({icon:"warning",content:"文件名最大长度为30，请重新上传！",time:3});
							return false;
		    			}
			    		var editParam=$("#editReceive").serialize();
			    		editParam+="&send_id="+send_id;
			    		confirmEditReceive(editParam);//确认修改发放单
					},cancel:function(){
						//关闭添加窗口
					}
			    });
		    },
		    cache:false
		});
	}

	//确认处理接收单
	function confirmEditReceive(editParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentReceive:'editReceive'},'x'),
		    data:editParam,
		    success:function(data){
		    	if(data){
		    		//提示修改失败
					$.dialog.notice({icon:"error",content:data,time:3});
					return false;
				}else{
					//提示修改成功
		    		$.dialog.notice({icon:"success",content:"处理接收单成功",time:3});
		    		$("#esDataList").flexOptions({newp:1}).flexReload();
				}
		    },
		    cache:false
		});
	}
	
	//删除接收单
	function delReceive(){
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		if(checks.length > 0){
			$.dialog({
		    	title:'删除接收单',
				width: '300px',
			   	fixed:true,
			    resize: false,
			    padding:0,
		    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>“<span style='color:red'>选择的接收单</span>(已接收)”吗？</div>",
			    cancelVal: '取消',
			    cancel: true,
			    okVal:'确定',
			    ok:true,
		    	ok:function(){
		    		var ids = [];
		    		checks.each(function(){
		    			var id = $(this).closest("tr").prop("id").substr(3);
		    			var status=$(this).closest("tr").find("td[colname='status'] div").html();
		    			if(status=="已接收"){
		    				ids.push(id);
		    			}
		    		}); 
		    		if(ids==null || ids.length==0){
		    			$.dialog.notice({icon:"warning",content:"未选择已接收的接收单",time:3});
		    			return false;
		    		}
		    		var delParam = {ids:ids};
		    		confirmDel(delParam);//确定删除流程
				},cancel:function(){
					//关闭删除窗口
				}
		    });
		}else{
			$.dialog.notice({icon:"warning",content:"请选择要删除的接收单",time:3});
			return false;
		}
	}

	//确定删除接收单
	function confirmDel(delParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentReceive:'delReceive'},'x'),
		    data:delParam,
		    success:function(data){
		    	if(data){
		    		//提示删除失败
		    		$.dialog.notice({icon:"warning",content:data,time:3});
		    		return false;
		    	}else{
		    		//提示删除成功
		    		$.dialog.notice({icon:"success",content:"删除接收单成功",time:3});
		    		$("#esDataList").flexOptions({newp:1}).flexReload();
		    	}
		    },
		    cache:false
		});
	}
	
	//筛选接收单
	function filterReceive(){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentReceive:'filter'},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
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
			    		var selTreeId=$("#selTreeId").val();
			    		var condition=getFilterCondition();//获取筛选条件
			    		$("#condition").val(condition);//保存筛选条件
			    		var url=$.appClient.generateUrl({ESDocumentReceive:'getLoaderListInfo',pid:selTreeId},'x');
			    		$("#esDataList").flexOptions({newp: 1, query:condition, url: url}).flexReload();
					},cancel:function(){
						//关闭筛选窗口
					}
			    });
		    },
		    cache:false
		});
	}

	//获取筛选条件
	function getFilterCondition(){
		var $where = {};
		var condition=[];
		$("#contents p").each(function(){
			var sels=$(this).find("select");
			var comp=$(sels[1]).val();
			var inp=$(this).find(".filedvalue").val();			
			if($(sels[0]).val()=="status" || $(sels[0]).val()=="part_code" || $(sels[0]).val()=="receiveId"){
				if(comp=="equal"||comp=="like"){
					comp="equal";
				}else{
					comp="notEqual";
				}
				if($(sels[0]).val()=="status"){
					inp=$(sels[2]).val();
				}
			}
			if($(sels[0]).val()!="" && inp!=""){
				var relation ='false';
				if ($(sels[3]).val() == "AND") {
					relation = 'true';
				}
				condition.push($(sels[0]).val()+","+comp+","+inp+","+relation);
			}
		});
		$where.condition=condition;
		return $where;
	}

	//还原数据
	function backReceive(){
		var selTreeId=$("#selTreeId").val();
		if(selTreeId==""){
			selTreeId="0";
		}
		$("#condition").val("");//清空筛选条件
		var url=$.appClient.generateUrl({ESDocumentReceive: 'getLoaderListInfo',pid:selTreeId}, 'x');
		$("#esDataList").flexOptions({newp:1,query:'',url:url}).flexReload();
	}
	
	//加载选中文件
	function loadSelFile(ids){
		var colModel=[
						{display: '序号', name : 'num', width : 20, align: 'center'}, 
						{display: '电子文件', name : 'viewfile', width : 60, align: 'center'},
						{display: '文件标题', name : 'title', width : 220, align: 'left'},
						{display: '文件编码', name : 'docNo', width : 120, align: 'left'},
						{display: '项目名称', name : 'itemName', width : 220, align: 'left'},
						{display: '装置', name : 'device', width : 120, align: 'left'},
						{display: '拟定部门', name : 'part', width : 80, align: 'left'},
						{display: '拟定人', name : 'person', width : 60, align: 'left'},
						{display: '拟定日期', name : 'date', width : 80, align: 'center'}
					];
		$.post($.appClient.generateUrl({ESFiling : "findMoveCols"}, 'x'),function(data){
			if(data){
				for(var i=0;i<data.length;i++){
					colModel.push({display : data[i].name,name : data[i].code, width : 80, align : 'center'});
				}
			}
			$("#esFile").flexigrid({
				url: $.appClient.generateUrl({ESDocumentSend: 'findDocumentListByIds',ids:ids}, 'x'),
				dataType: 'json',
				colModel : colModel,
				usepager: true,
				title: '&nbsp;',
				nomsg:"没有数据",
				useRp: true,
				width: 800,
				height:260,
				showTableToggleBtn: true,
				pagetext: '第',
				itemtext: '页',
				outof: '页 /共',
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
				procmsg:'正在加载数据，请稍候...'
			});
		},"json");
	}
	
	/**
	 * 插入本地文件
	 * @author ldm
	 */
	$('#fileUp').live('click',function(){
		var file = $('#loadfile').find('a');
		if(file.size()>0) {
		$.dialog.notice({icon : 'warning',content :'请先删除已关联文件！',time : 3});
		return;
		}
		 $.dialog({
			title:'上传文件',
			width: '450px',
		   	height: '250px',
		    fixed:true,
		    resize: false,
			content:"<div id='content'>你只能上传一个文件<div class='fieldset flash' id='fsUploadProgress'></div></div>",
			cancelVal: '关闭',
			cancel: true,
			padding: '10px',
			button: [
	    		{id:'btnAdd1', name: '添加文件'},
	            {id:'btnCancel1', name: '删除所有', disabled: true},
	            {id:'btnStart1', name: '开始上传', disabled: true, callback: function(){return false;}}
			],
			init:function(){createSWFUpload()}
		});	
	});
	function createSWFUpload(){
		var upload1 = new SWFUpload({
			//提交路径
			upload_url:$.appClient.generateUrl({ESRegulations:'upload'},'x'),
			//向后台传递额外的参数
			//提交到服务器的参数信息，这样就添加了一个param参数，值是uploadParams在服务器端用request.getParameter(“param”)就可以拿到值
			//上传文件的名称
			file_post_name: "file_txt",
			
			file_size_limit : "1048576",	// 100MB  longjunhao 20140905 修改为1024MB=1GB
			file_types : "*.*",
			file_types_description : "文件",
			file_upload_limit : "1",
			file_queue_limit : "0",

			// 事件处理
			swfupload_loaded_handler : swfuploadLoaded,
			file_dialog_start_handler : fileDialogStart,
			file_queued_handler : fileQueued,
			file_queue_error_handler : fileQueueError,
			file_dialog_complete_handler : fileDialogComplete,
			upload_start_handler : uploadStart,
			upload_progress_handler : uploadProgress,
			upload_error_handler : uploadError,
			upload_success_handler : uploadSuccess,
			upload_complete_handler : uploadComplete,

			// 按钮的处理
			button_image_url : "/apps/esdocument/templates/public/SWFUpload/img/ButtonUpload72.png",
			button_placeholder_id : "btnAdd1",
			button_width: 72,
			button_height: 28,
			
			// Flash文件地址设置
			flash_url : "/apps/esdocument/templates/public/SWFUpload/js/swfupload.swf",
			
			custom_settings : {
				progressTarget : "fsUploadProgress",
				cancelButtonId : "btnCancel1",
				startButtonId : "btnStart1",
				// 上传成功的回调函数
				uploadSuccess : function(file, data){
					var json = eval('(' + data + ')');
					var stats = upload1.getStats();
					stats.successful_uploads--;
					upload1.setStats(stats);
					if(json.success=='true'){
					var NY_img = '<img style="cursor:pointer;" id="NI_img" src="/apps/esdocument/templates/public/flexigrid/css/images/cross.png" alt="删除附件" title="删除附件" />';
					$('#loadfile').empty();
					//上传成功页面显示附件信息
					$('#loadfile').append('<div><a href="javascript:void(0)" title="点击下载附件">'+json.fileName+'</a><input type="hidden" name="filePath" value="'+json.filePath+'"/><input type="hidden" name="fileName" value="'+json.fileName+'"/></div>');
					//鼠标划上事件
					$('#loadfile div').hover(
						function() {
							$('#NI_img').remove();
							$(this).find('a').after(NY_img);
						},
						function() {
							$('#NI_img').remove();
						}
					);
				  }
				}
			},
			
			// Debug 设置
			debug: false
		});
		$("#btnCancel1").click(function(){cancelQueue(upload1);});
		$("#btnStart1").click(function(){
				startQueue(upload1);
		});
	}
	//点击删除图标执行删除操作
	 $('#NI_img').live('click',function(){
		 var filePath =$(this).parent().find('input[name="filePath"]').val();
		 var id = $("#editReceive").find('input[name="id"]').val();
		 var row = $('#esDataList').find('input[receiveid='+id+']').parent().parent().parent();
		 var thisFile = $(this).parent();
		 $.ajax({
			    type:'post',
		        url : $.appClient.generateUrl({ESDocumentReceive : 'deleteFile'},'x'),
		        data:{id:id,filePath:filePath},
			    success:function(msg){
		    		if(msg=="success"){
		    		thisFile.remove();
		    		row.find('td[colname="status"] div').html("未接收");
	    			$.dialog.notice({icon : 'succeed',content :'删除成功！',time : 3});
			    	}else{
		    		$.dialog.notice({icon : 'warning',content :msg,time : 3});
				    }
			    }
		  });
	  });
	 
	 //点击附件下载事件
	 $("#loadfile a").live('click',function(){
		 var filePath = $(this).parent().find('input[name="filePath"]').val();
	     var fileName = $(this).parent().find('input[name="fileName"]').val();
		 $.ajax({
			    type:'post',
		        url : $.appClient.generateUrl({ESRegulations : 'download'},'x'),
		        data:{filePath:filePath,fileName:fileName},
			    success:function(url){
		    	window.location=url;
			    }
		  });
	 });
});