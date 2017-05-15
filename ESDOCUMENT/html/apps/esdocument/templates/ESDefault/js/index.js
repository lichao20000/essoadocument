$("#myTaksListMoreId,.tasksListCls").click(function() {
	var url = {};
	var controller = $(this).attr("controller");
	var action = $(this).attr("action");
	if(typeof controller === "string" && controller.length > 0){
//		var modelName = $(this).html().replace(/[ ]/g,"");
//		$.ajax({
//			type:'POST',
//	        url : $.appClient.generateUrl({ESLog : 'saveAccessModel'},'x'),
//	        data: {model:modelName},
//			async:false, // 同步
//		    success:function(data){
//		    },
//		    cache:false
//		});
		url[controller] = action;
		window.open($.appClient.generateUrl(url), "_self");
	}
});
var _opens = {
		list:function(){
			window.open($.appClient.generateUrl({ESArchiveShow:'list_paper',page: _global.page, limit: _global.limit, boardId: _global.boardId}));
		},
		task: function (info){ // 打开待办页面
			var p = info.split('&');
			collaborativeHandle.toTodoFormPage(p[0],p[1],p[2], p[3], p[4], p[5],p[6],p[7],p[8],p[9],p[10]);		
		},
		detail_archiveNews: function (info){ // 打开详细页面
			var p = info.split('&'); // boardId&topicId
			window.open($.appClient.generateUrl({ESInformationPublish:'detail_paper',boardId: p[0], topicId: p[1]}),"_back");	
		}
};

//我的待办
$.post(
		$.appClient.generateUrl({ESCollaborative:'listWorkFlowToDo'},'x'),
		{page: 1, rp: 6},
		function (htm){
			$('#preTaskListsContainer').html(htm);
		}
	);

//左侧导航的counter
$.post(
		$.appClient.generateUrl({ESCollaborative:'listWorkFlowAll'},'x'),
		function (htm){
			var count = parseInt(htm,10);
			if(count>0){
				$('#preTasksCounter').text(htm);
				$('#preTasksCounter').css("display","block");
			}else if(count==0)
				$('#preTasksCounter').css("display","none");
		}
	);

$(".details").live('click',function(){
	var info = this.getAttribute('info');
	_opens.task(info);
});

$('.subMoudleFunClickCls,#ArchiveNews').live('click',function(){
	var url = {};
	var controller = $(this).attr("controller");
	if(typeof controller === "string" && controller.length > 0){
		url[$(this).attr("controller")] = $(this).attr("action");
		window.open($.appClient.generateUrl(url));
	}
});
$.post(
		$.appClient.generateUrl({ESDefault:'getArchiveNewsLists'},'x'),
		function (data){
			$('#ArchiveNewsLists').html(data);
		}
	);
$('.details_archiveNews').live('click', function (){
	var info = this.getAttribute('info');
	_opens.detail_archiveNews(info);
});

/**    添加更多click事件   **/
$('#addMoreFuncsToDesk').die().live('click', function (){
	$.post(
			$.appClient.generateUrl({ESDefault:'menu'},'x'),
			function (htm){
				$.dialog({
		    		title: '桌面应用设置',
		    		padding:'0px',
		    		content: htm,
		    		okVal: '保存',
		    		width:300,
		    		height:400,
		    		cancelVal: '取消',
		    		ok: function(){
		    			/**    取出所有的叶子节点的ID     **/
		    			var zTree=$.fn.zTree.getZTreeObj("zTree");
		    			var nodes = zTree.getCheckedNodes(true);
		    			var checkedAppsId = "";
		    			var num = 0;
		    			for(var i =0  ;i<nodes.length ; i++){
		    				 var nodeChildrens=nodes[i].children;
		    				 if(!nodeChildrens){
		    					 checkedAppsId+=(nodes[i].id + ",");
		    					 num++;
		    				 }
		    			}
		    			if(checkedAppsId != ""){
		    				checkedAppsId.substring(0, checkedAppsId.length-1);
		    			}
		    			if (num > 7) {
		    				$.dialog.notice({content:'最多选择7个桌面应用快捷方式！',time:2,icon:'warning'});
		    				return false;
		    			}
		    			$.post(
		    					$.appClient.generateUrl({ESDefault:'saveUserDeskApps'},'x'),
		    					{checkedAppsId:checkedAppsId},
		    					function (msg){
		    						if(msg=="success"){
		    							$.dialog.notice({content:"保存成功！", time:2,icon:'succeed'});
		    							userDeskAppsDetails();
		    						}else{
		    							$.dialog.notice({content:msg, time:2,icon:'error'});
		    						}
		    						
		    					}
		    				);
		    			
		    		},
		    	    cancel: function (){
		    	    	return true;
		    	    }
			    });
				
			}
		);
});
/***    桌面默认功能初始化 Section Start     **/
// longjunhao 20140928 封装为方法，便于局部更新
function userDeskAppsDetails(){
	$.post(
			$.appClient.generateUrl({ESDefault:'getUserDeskAppsDetails'},'x'),
			function (data){
				var json = eval('('+data+")");
				var ulObj = $('ul[name="userDeskAppsMenu"]');
				var deskAppsMenuHtml = "";
				for (var i=0;i<json.length;i++) {
					deskAppsMenuHtml += '<li><a href="#" class="'+json[i].icon+'" controller="'+json[i].controller+'" action="'+json[i].action+'"><div style="position: relative;top: 65px;">'+json[i].name+'</div></a></li>';
				}
				deskAppsMenuHtml += '<li id = "addMoreFuncsToDesk"><a href="#" class="add"></a></li>';
				ulObj.html(deskAppsMenuHtml);
				
				if($(window).height() <= 550){
					$('.inner-btn li a').height(85);
				}else if($(window).height() <= 640){
					$('.inner-btn li a').height(90);
				}else{
					$('.inner-btn li a').height(100);
				}
				if (json.length<4) {
					$('#userDeskAppsMenuId').css('margin-bottom',$('.inner-btn li a').height()+15);
				} else {
					$('#userDeskAppsMenuId').css('margin-bottom','');
				}
				
				$("ul[name='userDeskAppsMenu']").find('a').click(function() {
					var url = {};
					var controller = $(this).attr("controller");
					var action = $(this).attr("action");
					if(typeof controller === "string" && controller.length > 0){
						url[$(this).attr("controller")] = $(this).attr("action");
						window.open($.appClient.generateUrl(url), "_self");
					}
				});
			}
	);
	
}
userDeskAppsDetails();
function editMyUserinfo(){
	$.ajax({
	    url : $.appClient.generateUrl({ESDefault : 'editMyUserinfo'},'x'),
	    type : 'post',
	    success:function(data){
	        $.dialog({
		    	title:'编辑个人信息',
	    	   	fixed:false,
	    	    resize: false,
	    	    lock : true,
				opacity : 0.1,
		    	content:data,
		    	padding:0,
		    	button:[{
		    		id:'imageFile',name:'修改头像',callback:function(){return false;}
		    	},{id:'modifyPassword',name:'修改密码',callback:function(){
		    					var editUserForm = this;
		    					$.ajax({
		    						url : $.appClient.generateUrl({ESDefault : 'modifyPasswordPage'},'x'),
		    						type : 'post',
		    						success:function(resultform){
							    		$.dialog({
							    			id:'modifyPasswordForm',
							    			title:'修改密码',
							    			content : resultform,
							    			okVal : '确定',
							    			ok : true,
							    			cancelVal : '关闭',
							    			cancel : true,
							    			ok : function() {
							    				var oldPassword = $("#modifyPasswordDIV input[name='oldPassword']").val();
							    				var newPassword = $("#modifyPasswordDIV input[name='newPassword']").val();
							    				var repetPassword = $("#modifyPasswordDIV input[name='repetPassword']").val();
							    				if(oldPassword=='' || newPassword==''){
							    					$("#modifyPasswordDIV input[name='oldPassword']").addClass("warnning");
								    				$("#modifyPasswordDIV input[name='newPassword']").addClass("warnning");
							    					return false;
							    				}
							    				if(newPassword != repetPassword){
							    					$("#modifyPasswordDIV input[name='repetPassword']").addClass("warnning");
							    					return false;
							    				}
							    				
//							    				alert(newPassword);
							    				var modifyurl = $.appClient.generateUrl({ESDefault : 'modifyPassword'}, 'x');
							    				$.post(modifyurl,{oldPassword:oldPassword,newPassword:newPassword}, function(result){
							    					var isPasswordValid = result.isPasswordValid;//密码是否正确
							    					var isModifySuccess = result.isModifySuccess;//是否重置成功
							    					if(isPasswordValid=='true'){
							    						if(isModifySuccess=='1'){
							    							$.dialog.notice({icon : 'succeed',content : '修改成功！',title : '3秒后自动关闭',time : 3});
							    							art.dialog.list['modifyPasswordForm'].close();
							    						}else{
							    							$.dialog.notice({icon : 'error',content : '修改失败！',title : '3秒后自动关闭',time : 3});
							    							art.dialog.list['modifyPasswordForm'].close();
							    						}
							    					}else{
							    						$.dialog.notice({icon : 'warning',content : '您输入的密码不正确！',title : '3秒后自动关闭',time : 3});
							    						$("#modifyPasswordDIV input[name='oldPassword']").addClass("warnning");
							    					}
							    					
									    		},'json');
							    				return false;
							    			}
							    		});
		    						}
		    					});
					    		return false;
		    				}
		    			}],
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'保存',
			    ok:true,
			    ok:function()
		    	{ 
			    	var userid = $("#editUser input[name='userid']").val();
			    	var firstname = $("#editUser input[name='firstname']").val();
			    	var lastname = $("#editUser input[name='lastname']").val();
			    	var emailaddress = $("#editUser input[name='emailaddress']").val();
			    	var mobtel = $("#editUser input[name='mobtel']").val();
			    	var userstatus = $("#editUser select[name='userstatus']").val(); 
			     	var url = $.appClient.generateUrl({ESDefault : 'updateUser'}, 'x');
			    	$("#editUser input[name='roleIds']").val(selectedIds);
			    	var userInfo = $("#editUser").serialize();
			    	if(userid==''||firstname==''||lastname==''||mobtel==""||userstatus==""){
			    		if(userid=='')
			    			$("#editUser input[name='userid']").addClass("warnning");
			    		if(firstname=='')
			    			$("#editUser input[name='firstname']").addClass("warnning");
			    		if(lastname=='')
			    			$("#editUser input[name='lastname']").addClass("warnning");
			    		if(mobtel=='')
			    			$("#editUser input[name='mobtel']").addClass("warnning");
			    		if(userstatus=='')
			    			$("#editUser select[name='userstatus']").addClass("warnning");
			    		return false;
			    	}else if(emailaddress!='' && emailaddressZZ.test(emailaddress)==false){
			    		$("#editUser input[name='emailaddress']").addClass("warnning");
			    		return false;
			    	}else if(mobtelZZ.test(mobtel)==false){
			    		$("#editUser input[name='mobtel']").addClass("warnning");
			    		return false;
			    	}else if(nameZZ.test(firstname)==false || lengthZZ.test(firstname)==true){
			    		$("#editUser input[name='firstname']").addClass("warnning");
			    		return false;
			    	}else if(nameZZ.test(lastname)==false || lengthZZ.test(lastname)==true){
			    		$("#editUser input[name='lastname']").addClass("warnning");
			    		return false;
			    	}else{
			    		$.post(url,{data : userInfo}, function(res){
			    			if (res == 'true') {
			    				$('#mainPageCurUser').html(lastname+firstname);//修改主页上的名字
			    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
			    				$("#userGrid").flexReload();
			    				mark  = false;
			    				selectedIds  ='';
			    				return;
			    			} else {
			    				$.dialog.notice({icon : 'error',content : '修改失败',title : '3秒后自动关闭',time : 3});
			    				mark = false;
								selectedIds='';
			    				return;
			    			}
			    		});
			    	}
				},cancel:function()
				{
					  mark = false;
					  selectedIds='';
				}
		    });
	    }
	});
}


/** wanghongchen 20140930 增加头像上传窗口 **/
$("#imageFile").live('click',function(){
	$.dialog({
		id:'updateImageFileDialog',
		title:'上传文件',
	    fixed:true,
	    resize: false,
	    padding:'0px 0px',
		content:"<div class='fieldset flash' id='fsUploadProgress'></div>",
		cancelVal: '关闭',
		cancel: function (){
		},
		button: [
    		{id:'btnAdd', name: '添加文件'},
            {id:'btnCancel', name: '删除文件', disabled: true},
            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
		],
		init:createSWFUpload
	});	    	
});


/**  liuhezeng 20140923 添加自适应控制  **/
$('.row-2').width($('.row-1').width()/2);
$('.message-task').css("width",$('.row-1').width()/2-16+"px");
$('#userDeskAppsMenuId').width($('.row-2').width()+7);
