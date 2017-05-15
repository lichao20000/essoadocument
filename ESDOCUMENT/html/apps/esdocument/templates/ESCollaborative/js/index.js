/**
 * 我的待办
 */
$(document).ready(function(){	
	var _autoSize = function (){
		var width = document.documentElement.clientWidth*0.96;
		var height = document.documentElement.clientHeight-110;
		var leftWidth = 220;
		if(navigator.userAgent.indexOf("MSIE 6.0")>0){			
			width = width-6;			
		}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
			width = width-4;
			height = height-4;
		}		
		var rightWidth = width - leftWidth-10;
		var tblHeight = height - 143;		
		_size = {
			left: [leftWidth, height],
			right: [rightWidth, height],
			table: [rightWidth, tblHeight]
		};
	};
	
	_autoSize();//初始窗口尺寸

	$('#leftDiv').css({width: _size.left[0], height:_size.left[1]});//左侧菜单尺寸
	$('#rightDiv').css({width: _size.right[0], height: _size.right[1]});//右侧列表尺寸
	
	//初始列表
	$("#mylist").flexigrid({
		url: $.appClient.generateUrl({ ESCollaborative: 'getCollaborativeDataList', parent: 'todo', child: 'all'},'x'),
		dataType: 'json',
		colModel: [
		    {display : '序号',name : 'num',width : 30,align : 'center'}, 
		    {display : '<input id="userFormcheck" type="checkbox" name="userFormIds">', name : 'ids', width : 25,align : 'center'}, 
			{display: '查看', name: 'open', width: 50, sortable: true, align: 'center'},
			{display: '电子文件', name : 'viewfile', width : 60, align: 'center'},
			{display: '编号', name: 'userFormNo', metadata:'userFormNo', width: 150, sortable: true, align: 'left'},					
			{display: 'id', name: 'id', metadata:'id',hide:true, width: 100, sortable: true, align: 'right'},
			{display: '用户ID', name: 'userId',metadata:'userId',hide:true, width: 100, sortable: true, align: 'right'},
			{display: '表单ID', name: 'formId',hide:true, width: 100, sortable: true, align: 'left'},
			{display: '工作流ID', name: 'wfId', hide:true,width: 100, sortable: true, align: 'right'},
			{display: '步骤ID', name: 'stepId',hide:true, width: 100, sortable: true, align: 'right'},					
			{display: '标题', name: 'title', metadata:'title',width: 300, sortable: true, align: 'left'},					
			{display: '是否是已办流程', name: 'isDealed', hide:true,width: 100, sortable: true, align: 'center'},					
			{display: '发起人', name: 'name', width: 100, sortable: true, align: 'left'},
			{display: '发起日期', name: 'start_time',metadata:'start_time', width: 200, sortable: true, align: 'center'},					
			{display: '表单数据ID', name: 'dataId',hide:true, width: 200, sortable: true, align: 'right'},
			{display: '第一个步骤ID', name: 'firstStepId',hide:true, width: 200, sortable: true, align: 'right'},
			{display: '流程类型', name: 'workFlowType', hide:true,width: 200, sortable: true, align: 'right'},
			{display: 'isSelf', name: 'isSelf', hide:true, width: 100, sortable: true, align: 'center'},
			{display: 'isLast', name: 'isLast', hide:true, width: 100, sortable: true, align: 'center'},
			{display: '状态', name: 'wfState',metadata:'wfState', width: 100, sortable: true, align: 'center'}
		],
		buttons :[
		      {"name": "删除", "bclass": "delete", "id": "deleteUserFormBtn","onpress": function (){collaborativeHandle.deleteUserFormData();}},
	          {"name": "筛选", "bclass": "filter", "id": "filterUserFormBtn", "onpress": function (){collaborativeHandle.filterUserFormData();}}, 	          
	          {"name": '还原数据', "bclass": 'back', "onpress":function(){_nav.back();}}
		],
		singleSelect:true,
		usepager: true,
		title: '我的待办',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		width: _size.table[0],
		height: _size.table[1],
		showTableToggleBtn: true,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...',
		onSuccess:function(){
			//控制删除按钮显示
			var selectType = $('#mylist').attr('selectType');
			if (selectType == 'send' || selectType == 'have_send') {//待发或已发
				$('#deleteUserFormBtn').show();
			} else {
				$('#deleteUserFormBtn').hide();
				$('.tDiv2').css('height','30px');
			}				
		}
	});

	var hash_string = window.location.hash;
	var hash_object = hash_string.split('|');
	var taskSize = hash_object.length;
	if(hash_object[0] == '#task' && taskSize == 8){
		_global.taskFlag = hash_object[1];
		_global.workId = hash_object[2];
		_global.taskId = hash_object[3];
		_global.dostate = hash_object[4];
		_global.extId = hash_object[5];
		_global.formId = hash_object[6];
		_global.taskSize = 6;		
		window.location.hash = null;		
	}else{
		window.location.hash = null;
	}	
	
	_nav.bind(); // 绑定导航

	//全选
	$(document).on('click', '#userFormcheck', function() {
		$('#mylist').find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	//浏览点击文件
	$("#mylist .viewfile").die().live("click",function(){
		var id=$(this).attr("dataId");
		var stageId=$(this).attr("stageId");
		if ($(this).attr("title")=="0份") {
	        $.dialog.notice({content: '不存在电子文件',time: 3,icon: 'warning'});
	        return false;
	    }
		viewFile(id,"",stageId);
	});

	function viewFile(id,fileId,stageId){
		var readIds="";
    	var printIds="";
    	var downloadIds="";
    	$.post($.appClient.generateUrl({ESCollaborative: 'getDocFiles'},'x'),{docId:id},function(res){
			if (res=="") {
    	        $.dialog.notice({content: '不存在电子文件',time: 3,icon: 'warning'});
    	        return false;
    	    }
    		readIds=res;
    		$.ajax({//数据权限
    			type:'POST',
    			url:$.appClient.generateUrl({ESDocumentsCollection: "getStageIdsByDocId"},'x'),
    			data:{docId:id},
    		    success:function(arrIds){
		    		printIds=getRightIds(arrIds,"filePrint",readIds);
		    		downloadIds=getRightIds(arrIds,"fileDownload",readIds);	    	    			    	    		
		    		var arr1=getTreeAndDataAuth.checkDataAuthEfile(arrIds[0],"fileRead",readIds);
		    		if(arr1=="true"){
		    			fileId=readIds.split(",")[0];    	    			
		    		}else if(arr1!="" && arr1!="false"){
		    			fileId=arr1.split(",")[0];  
		    			readIds=arr1;
		    		}else{
		    			var arr2=getTreeAndDataAuth.checkDataAuthEfile(arrIds[1],"fileRead",readIds);	    	    			
		    			if(arr2=="true"){
		        	    	fileId=readIds.split(",")[0];
		        	    }else if(arr2!="" && arr2!="false"){
		        	    	fileId=arr2.split(",")[0];
		        	    	readIds=arr2;
		        	    }else{
		        	    	$.dialog.notice({content: '您对文件没有文件浏览权限，不能进行此操作！', time: 3, icon: 'warning'});
		            		return false;
		        	    }	
		    		}
		        	var tempReadRight=getTreeAndDataAuth.checkTreeAuth("1", stageId, "FR");
		        	var tempPrintRight=getTreeAndDataAuth.checkTreeAuth("1", stageId, "FP");
		        	var tempDownloadRight=getTreeAndDataAuth.checkTreeAuth("1", stageId, "FD");
		        	if(tempReadRight=="false"){
		        		$.dialog.notice({content: '您对文件没有文件浏览权限，不能进行此操作！', time: 3, icon: 'warning'});
		        		return false;
		        	}
		    		 var url = $.appClient.generateUrl({
		    			 ESDocumentsCollection: 'file_view',
		    		        id: id,
		    		        fileId:fileId,
		    		        stageId:stageId,
		    		        tempReadRight:tempReadRight,
		    				tempPrintRight:tempPrintRight,
		    				tempDownloadRight:tempDownloadRight,
		    				rightIds:readIds+";"+printIds+";"+downloadIds
		    		    },
		    		    'x');
		    		    // 修改结束
		    		    $.ajax({
		    		        url: url,
		    		        cache: false,
		    		        success: function(data) {
		    		            if (data === 'idErr') {
		    		                $.dialog.notice({
		    		                    content: '参数不正确（id）',
		    		                    time: 2,
		    		                    icon: 'warning',
		    		                    lock: false
		    		                });
		    		            }
		    		            $.dialog({
		    		                title: '浏览电子文件',
		    		                width: '960px',
		    		                fixed: false,
		    		                resize: false,
		    		                padding: 0,
		    		                top: '10px',
		    		                content: data
		    		            });
		    		        }
		    		    });
    		    }
    		});	
    	});    	    		
	}
	
	function getRightIds(stageIds,auth,fileIds){
    	var rightIds=getTreeAndDataAuth.checkDataAuthEfile(stageIds[0],auth,fileIds);
    	if(rightIds=="true"){
			return  "true"; 			
		}else if(rightIds!="" && rightIds!="false"){
			return rightIds;
		}else{
			rightIds=getTreeAndDataAuth.checkDataAuthEfile(stageIds[1],auth,fileIds);			
			if(rightIds=="true"){
				return  fileIds; 	
			}else if(rightIds!="" && rightIds!="false"){
				return rightIds;
			}else{
    	    	return "false";
    	    }	
		}
    }
	
	$(document).on('click', '#mylist .opens', function (){
		_newOpen.iface(this); // 共用接口	
	});
});

var _global = {		
		taskFlag: false, // 借阅,销毁...
		dostate: false, // 已发,已办
		workId: false,
		taskId: false,
		extId: false, // 只有信息发布待办才有,
		formId: false, // 只有销毁,鉴定才有
		taskSize: false,
		typeParent: 'todo', // 待办业务,已发业务,已办业务
		typeChild: 'all' // 所有,借阅,编研,年报,鉴定,销毁,信息发布		
};

//绑定菜单事件
var _nav = {		
	bind: function (){	
		var all_ = document.getElementById('type_all').children;
		var list_ = document.getElementById('type_list').children;		
		for(var a = 0; a < all_.length; a++){			
			all_[a].onclick = function (){			
				_nav.bindEvent(this);				
			};			
		}		
		for(var l = 0; l < list_.length; l++){
			list_[l].onclick = function (){				
				_nav.bindEvent(this);				
			};
		}		
	},
	bindEvent: function (that){
		// 初始化样式并获取数据
		var p_ = that.parentNode;
		if(p_.id==='type_all'){
			_global.typeParent = that.id;
			_global.typeChild = 'all';
			var pchild = document.getElementById('type_list').children;
			for(var pl=0; pl<pchild.length; pl++){
				pchild[pl].className = '';
			}
		}else{
			_global.typeChild = that.id;
		}		
		var pchild = p_.children;
		for(var pl=0; pl<pchild.length; pl++){
			if(pchild[pl].className){
				pchild[pl].className = '';
			}
		}
		that.className = 'selected';
		this.getData(that);
	},
	getData: function (that){
		$('#userFormcheck').removeAttr("checked");
		var url = $.appClient.generateUrl({
					ESCollaborative: 'getCollaborativeDataList',
					parent: _global.typeParent,
					child: _global.typeChild
				},'x');
		$('#mylist').attr('selectType', _global.typeParent);
		$("#mylist").flexOptions({newp: 1, url: url}).flexReload();
		var selectType = _global.typeParent;
		if (selectType == 'send' || selectType == 'have_send') {//待发或已发
			$('#deleteUserFormBtn').show();
		} else {
			$('#deleteUserFormBtn').hide();
			$('.tDiv2').css('height','30px');
		}	
	},
	back: function (){
		var url = $.appClient.generateUrl({
			ESCollaborative: 'getCollaborativeDataList',
			parent: _global.typeParent,
			child: _global.typeChild
		},'x');
		$("#mylist").flexOptions({newp: 1, url: url}).flexReload();
	}
	
};

var _newOpen = {
		iface : function(p) {
			var userFormNo, id, userId, flowId, formId, wfId, stepId, isDealed, dataId, workFlowType, wfState, title = false, isLast,processTime;
			if (typeof p === 'object') {
				userFormNo = p.getAttribute('userFormNo');
				id = p.getAttribute('id');
				userId = p.getAttribute('userId');
				flowId = p.getAttribute('flowId');
				formId = p.getAttribute('formId');
				wfId = p.getAttribute('wfId');
				stepId = p.getAttribute('stepId');
				isDealed = p.getAttribute('isDealed');
				dataId = p.getAttribute('dataId');
				workFlowType = p.getAttribute('workFlowType');
				wfState = p.getAttribute('wf_status');
				title = p.getAttribute('title');
				isLast = p.getAttribute('isLast');
				processTime=p.getAttribute('processTime');
			}
			var selectType = $('#mylist').attr('selectType');
			if (selectType == 'todo') {//待办				
				collaborativeHandle.toTodoFormPage(id,flowId,formId,wfId,stepId,dataId,wfState,title,userFormNo,workFlowType,isLast,processTime);
			} else if (selectType == 'send') {//待发
				collaborativeHandle.toSendFormPage(id,flowId,formId,wfId,stepId,dataId,wfState,userFormNo);
			} else if (selectType == 'have_send') {//已发
				collaborativeHandle.toHaveSendFormPage(id,flowId,formId,wfId,stepId,dataId,'1',title,wfState,userFormNo); 
			} else if (selectType == 'have_todo') {//已办
				collaborativeHandle.toHaveTodoFormPage(id,flowId,formId,wfId,stepId,dataId,'1',title,wfState,userFormNo); 
			}		
		}
	};