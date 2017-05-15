var _global = {
	boardId: false, // 信息ID
	page: 1,  // 默认转入列表页面时开始页数
	limit: 20,  // 默认转入列表页面时条数
	total: false, // 总页数
	interval: false, // 定时器
	picthumlist: document.getElementById('picthumlist'), // 浏览图片ul列表对象
	thepicworld: document.getElementById('thepicworld'),
	browser: false
};

var _opens = {
		list:function(){
			window.open($.appClient.generateUrl({ESArchiveShow:'list_paper',page: _global.page, limit: _global.limit, boardId: _global.boardId}));
		},
		task: function (info){ // 打开待办页面
			// info = wfId & formId & stepId & workFlowType
			var p = info.split('&');
			formApprovalHandle.approvalForm('', p[0], p[2]+'_0', p[1], p[3]);
		},
		detail_archiveNews: function (info){ // 打开详细页面
			var p = info.split('&'); // boardId&topicId
			window.open($.appClient.generateUrl({ESArchiveNewsMove:'detail_paper',boardId: p[0], topicId: p[1]}),"_back");	
		}
};

/**   档案规范    **/
$('.subMoudleFunClickCls,#ArchiveNews').live('click',function(){
			var url = {};
			var controller = $(this).attr("controller");
			if(typeof controller === "string" && controller.length > 0){
				url[$(this).attr("controller")] = $(this).attr("action");
				window.open($.appClient.generateUrl(url));
			}
		});

/**   我的待办  **/
$.post(
		$.appClient.generateUrl({ESCollaborative:'listWorkFlowToDo'},'x'),
		{page: 1, rp: 6},
		function (htm){
			$('#preTaskListsContainer').html(htm);
		}
	);

/** 左侧导航的counter   **/
$.post(
		$.appClient.generateUrl({ESCollaborative:'listWorkFlowAll'},'x'),
		{page: 1, rp: 6},
		function (htm){
			var count = parseInt(htm,10);
			if(count>0){
				$('#preTasksCounter').text(htm);
				$('#preTasksCounter').css("display","block");
			}else if(count==0)
				$('#preTasksCounter').css("display","none");
		}
	);


//单击列表展示内容详细页面
$('.details').live('click', function (){
	var info = this.getAttribute('info');
		_opens.task(info);
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
		    					function (htm){
//		    						location.reload();
									// longjunhao 20140928 局部更新
		    						userDeskAppsDetails();
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
						$('.notice-box').css('margin-top',$('.inner-btn li a').height()+15);
					} else {
						$('.notice-box').css('margin-top','');
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
	
	$("#myTaksListMoreId,.tasksListCls").click(function() {
		var url = {};
		var controller = $(this).attr("controller");
		var action = $(this).attr("action");
		if(typeof controller === "string" && controller.length > 0){
			// longjunhao 20140829 add 访问日志，为了避免添加日志失败，导致不能进入功能，改为同步请求
			//在java端后台的请求总是返回ture，除非请求过程中报错。
			var modelName = $(this).html().replace(/[ ]/g,"");
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESLog : 'saveAccessModel'},'x'),
		        data: {model:modelName},
				async:false, // 同步
			    success:function(data){
			    },
			    cache:false
			});
			url[$(this).attr("controller")] = $(this).attr("action");
			window.open($.appClient.generateUrl(url), "_self");
		}
	});
	
/***    桌面默认功能初始化 Section End     **/
/** 查询最新公告 longjunhao 20140812 */
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
	
	/**  liuhezeng 20140923 添加自适应控制  **/
	$('.row-2').width($('.row-1').width()/2);
	$('.message-task').css("width",$('.row-1').width()/2-16+"px");
	$('#userDeskAppsMenuId').width($('.row-2').width()+7);
	
	
