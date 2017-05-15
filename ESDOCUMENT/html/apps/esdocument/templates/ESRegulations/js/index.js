$(document).ready(function(){
	
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 230;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width ;
				var tblHeight = height - 147;
				
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};
	$("#regulationsGrid").flexigrid({url :$.appClient.generateUrl({ESRegulations: 'findRegulationList'}, 'x'),
		dataType : 'json',
		colModel : [
		{display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
        {display : '序号',name : 'startNum',width : 30,align : 'center'}, 
	    {display : '<input type="checkbox" id="changeIdList">',name : 'ids',width : 15,align : 'center'}, 
	    {
			display : '操作',
			name : 'operate',
			width : 30,
			sortable : true,
			align : 'center'
		}, {
			display : '编号',
			name : 'no',
			metadata:'no',
			width : 100,
			align : 'left'
		},{
			display : '中文名称',
			name : 'chineseName',
			metadata:'chineseName',
			width : 300,
			align : 'left'
		},{
			display : '英文名称',
			name : 'englishName',
			metadata:'englishName',
			width : 300,
			align : 'left'
		},{
			display : '发布时间',
			name : 'publishTime',
			metadata:'publishTime',
			width : 80,
			align : 'center'
		}],
		buttons : [ {
			name : '添加',
			bclass : 'add',
			onpress : add
		},{
			name : '删除',
			bclass : 'delete',
			onpress : del
		},{
			name : '筛选',
			bclass : 'filter',
			onpress : filter
		},{
			name: '还原数据',
			bclass: 'back',
			onpress: back
		}],
		singleSelect:true,
		usepager : true,
		title : '规定规范管理',
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#eslist").position().top;
		var flex = $("#regulationsGrid").closest("div.flexigrid");
		var bDiv = flex.find('.bDiv');
	    var contentHeight = bDiv.height();
	    var headflootHeight = flex.height() - contentHeight; 
	    bDiv.height(h - headflootHeight);
		flex.height(h);
		// 修改IE表格宽度兼容
		if($.browser.msie && $.browser.version==='6.0'){
			flex.css({width:"-=3px"});
		}
	};
	// 添加角色
	function add(){
		$.ajax({
		        url : $.appClient.generateUrl({ESRegulations : 'add'},'x'),
			    success:function(data){
				    	$.dialog({
					    	title:'添加规范',
					    	modal:true, // 蒙层（弹出会影响页面大小）
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
					    	{	if(!$('#addRegulation').validate()){return false;}
						    	var objNo=$('#addRegulation').find('input[name="no"]');
					    		var regulationNo = objNo.val();	
					    		if(!uniqueNo(regulationNo,"",objNo)){
					    			return false;
					    		}
						    	var formData = $("#addRegulation").serialize(); 
						    	var Actionurl = $.appClient.generateUrl({ESRegulations : 'toAdd'}, 'x');
						    	/*if($("#addRegulation input[name='roleCode']").hasClass("warnning")||$("#addRole input[name='roleName']").hasClass("warnning")){
						    		return false;
						    	}else if(judgeSummit($("#addRole"))==false){
						    		return false;
						    	}else{*/
							    	$.post(Actionurl,{data : formData}, function(res){
				        				if (res == 'success') {
				        					$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
				        					$("#regulationsGrid").flexReload();
				        					return;
				        				} else {
				        					$.dialog.notice({icon : 'error',content : '添加失败',title : '3秒后自动关闭',time : 3});
				        					$("#regulationsGrid").flexReload();
				        					return;
				        				}
				        			});
							   //}
						    },
							init: function(){
								$('#addRegulation').autovalidate();
							}
					    });
				    },
				    cache:false
			});
     } 
	 //编辑绑定时间
	 $('.editbtn').live("click",function(){
		 var id="";
		 var thisTr = $(this).closest('tr');
		 var id = $(thisTr).find('td[colname="id"] div').text();
		 if(id=="")
		 $.dialog.notice({icon : 'warning',content : '编辑的数据id不正确！',time : 3});
			$.ajax({
				type:'post',
			    data:{id:id},
		        url : $.appClient.generateUrl({ESRegulations : 'edit'},'x'),
			    success:function(data){
				    	$.dialog({
					    	title:'编辑规范',
					    	modal:true, // 蒙层（弹出会影响页面大小）
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
							    if(!$('#editRegulation').validate()){return false;}
							    var objNo=$('#editRegulation').find('input[name="no"]');
					    		var regulationNo = objNo.val();	
					    		if(!uniqueNo(regulationNo,$("#oldNo").val(),objNo)){
					    			return false;
					    		}
						    	var data = $("#editRegulation").serialize(); 
						    	var Actionurl = $.appClient.generateUrl({ESRegulations : 'toEdit'}, 'x');
						    	/*if($("#addRole input[name='roleCode']").hasClass("warnning")||$("#addRole input[name='roleName']").hasClass("warnning")){
						    		return false;
						    	}else if(judgeSummit($("#addRole"))==false){
						    		return false;
						    	}else{*/
							    	$.post(Actionurl,{data : data}, function(res){
				        				if (res == 'success') {
				        					$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
				        					$("#regulationsGrid").flexReload();
				        					return;
				        				} else {
				        					$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
				        					$("#regulationsGrid").flexReload();
				        					return;
				        				}
				        			});
							    //}
						    },
							init: function(){
								$('#editRegulation').autovalidate();
							}
					    });
				    },
				    cache:false
			});
	 });
     // 删除角色
	function del(){
		var checkboxlength = $('#regulationsGrid input:checked').length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
			return;
		}
		var idStr = '';
		var hasSystemRole = false ;
		$('#regulationsGrid input:checked').each(function(i) {
			/*if('是' == $(this).attr('isSystem')){
				hasSystemRole = true ;
			}*/
			idStr += $(this).val()+ ',';
		});
		if(hasSystemRole){
			$.dialog.notice({icon : 'warning',content : '系统角色不能删除！',time : 3});
			return;
		}
		idStr=idStr.substring(0,idStr.length-1);
		$.dialog({
			content : '确定要删除吗？删除后不能恢复！',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				/*$('#regulationsGrid input:checked').each(function() {
					$(this).closest('tr').remove();
				});
				$.dialog.notice({
					icon : 'succeed',
					content :'删除成功！',
					time : 3
				});*/
					var url = $.appClient.generateUrl({ESRegulations : 'delete'}, 'x');
					$.post(url, {idStr: idStr}, function(res) {
						if(res=='success'){
							$.dialog.notice({
								icon : 'succeed',
								content :'删除成功！',
								time : 3
							});
							$("#regulationsGrid").flexReload();
							return;
						}else{
							$.dialog.notice({icon : 'warning',
								content :'不允许删除',
								time : 3
							});
							$("#regulationsGrid").flexReload();
							return;
						}
					});
			}
		});
	}
	// 筛选参建单位或部门
	function filter(){
		$.ajax({
    	    url:$.appClient.generateUrl({ESRegulations:'filter'},'x'),
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
    		    		var thisDialog = this;
    		    		var filedname = $(".filedname");
    		    		var comparison = $(".comparison");
    		    		var filedvalue = $(".filedvalue");
    		    		var relationship = $(".relationship");
    		    		var condition="";
    		    		for(var i=0;i<filedname.size();i++){
    		    			if(filedname[i].value=="")continue;
    		    			if(filedvalue[i].value==""){
    		    				$.dialog.notice({content:'请输入完整的条件!',icon:'error',time:3});
								return false;
    		    			}
    		    			//需要验证禁止输入", & 符号" filedvalue值
    		    			condition = condition+filedname[i].value+","+comparison[i].value+","+filedvalue[i].value+","+relationship[i].value+"&";
    		    		}
    		    		condition=condition.substring(0,condition.length-1);
    		    		if(condition==""){
    		    			$.dialog.notice({content:'请输入过滤的条件!',icon:'warning',time:3});
    		    			return false;
    		    			}
    		    		var url = $.appClient.generateUrl({ESRegulations:'getRegulationByCondition'},'x');
						$('#regulationsGrid').flexOptions({url: url, newp: 1, query: {condition:condition}}).flexReload();
						thisDialog.close();
					},
					cancel:function(){
					}
    		    });
    	    },
    	    cache:false
    	});
	}
	
	
	//添加行,删除行按钮
	$('.newfilter').die().live('click',function (){
		$($('#contents>p:last').clone()).appendTo($('#contents'));
		
	});

	//删除行
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
	//还原数据
	function back() {
		$("#regulationsGrid").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
	};
	
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
			init:createSWFUpload
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
					//getsubstr(data);
					if(json.success=='true'){
					var NY_img = '<img style="cursor:pointer;" id="NI_img" src="/apps/esdocument/templates/public/flexigrid/css/images/cross.png" alt="删除附件" title="删除附件" />';
					//var filePath = $('#editRegulation,#addRegulation').find('input[name="filePath"]').val(json.filePath);
				   // var fileName = $('#editRegulation,#addRegulation').find('input[name="fileName"]').val(json.fileName);
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
		 var filePath = $(this).parent().find('input[name="filePath"]').val();
		 var id = $("#editRegulation").find('input[name="id"]').val();
		 var thisFile = $(this).parent();
		 $.ajax({
			    type:'post',
		        url : $.appClient.generateUrl({ESRegulations : 'deleteFile'},'x'),
		        data:{id:id,filePath:filePath},
			    success:function(data){
		    		if(data=="success"){
			    		thisFile.remove();
		    			$.dialog.notice({icon : 'succeed',content :'删除成功！',time : 3});
			    	}else{
			    		$.dialog.notice({icon : 'warning',content :data,time : 3});
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
	sizeChanged();
	// 全选
	$("#changeIdList").die().live('click',function(){
		$("input[name='changeId']").attr('checked',$(this).is(':checked'));
	});
	
	
	
	$('.Wdate').live('click', function (){
		WdatePicker({dateFmt:'yyyy-MM-dd'});
	});
	
	//编号唯一验证
	function uniqueNo(regulationNo,oldRegulationNo,objNo){
		var flag=true;
		if(regulationNo!=oldRegulationNo){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESRegulations:'uniqueNo'},'x'),
				data:{regulationNo:regulationNo},
				async:false,//同步设置
				success:function(data){
					if(data>0){
						objNo.addClass("invalid-text").attr('title',"此规定规范编号已存在");
	    				flag=false;
	    				return false;
	    			}
					objNo.removeClass("invalid-text").attr('title',"");
				}
			});
		}
		return flag;
	}
});
