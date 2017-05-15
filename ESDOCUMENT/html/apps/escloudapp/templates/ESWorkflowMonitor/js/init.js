$(document).ready(function() {
	
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
				
				var rightWidth = width - leftWidth;
				var tblHeight = height - 147;
				$("#workflowControl_tree").height(height-33);
				
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
	var zTreeObj;
	var zTreeNodes;
	var setting = {
		view : {
			selectedMulti : false,
			showLine : false
		},
		callback : {
			onClick : onZTreeObjClick
		}
	};

	function onZTreeObjClick(e,treeId, treeNode) {
		$("#workflowControlDataGrid").flexOptions({url:$.appClient.generateUrl({ESWorkflowMonitor: 'getWfMonitorDataList',formType:treeNode.id,status:$("#workflowControlDataGrid").attr('status')}, 'x')}).flexReload();
		$("#workflowControlDataGrid").attr('formType',treeNode.id);
	}
	
	$.ajax({
		dataType : "json",
		url : $.appClient.generateUrl({ESFormBuilder:'showFormTypeTree'}, 'x'),
		error : function() {
			alert('请求失败');
		},
		success : function(data) { // 请求成功后处理函数。
			zTreeNodes = data; // 把后台封装好的简单Json格式赋给treeNodes
			zTreeObj = $.fn.zTree.init($("#workflowControlTree"), setting, zTreeNodes);
    		zTreeObj.selectNode(zTreeObj.getNodes()[0]);
		}
	});
	
	/** 生成grid **/
	$("#workflowControlDataGrid").flexigrid({url :$.appClient.generateUrl({ESWorkflowMonitor: 'getWfMonitorDataList',status:$("#workflowControlDataGrid").attr('status')}, 'x'),
		dataType : 'json',
		colModel : [ 
	        {display : '',name : 'startNum',width : 30,align : 'center'}, 
		    {
				display : 'id',
				name : 'id',
				metadata:'id',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : 'userId',
				name : 'userId',
				metadata:'userId',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : 'formId',
				name : 'formId',
				metadata:'formId',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : 'wfId',
				name : 'wfId',
				metadata:'wfId',
				hide:true,
				sortable : false,
				align : 'left'
			},{
				display : '编号',
				name : 'wfNo',
				metadata : 'wfNo',
				width : 120,
				sortable : true,
				align : 'left'
			},{
				display : '工作流模版名称',
				name : 'wfModelName',
				metadata : 'wfModelName',
				width : 200,
				sortable : true,
				align : 'left'
			},{
				display : '关联表单名称',
				name : 'formModelName',
				metadata : 'formModelName',
				width : 200,
				sortable : true,
				align : 'left'
			},{
				display : '发起者',
				name : 'startPersonName',
				metadata : 'startPersonName',
				width : 100,
				sortable : true,
				align : 'left'
			},{
				display : '发起时间',
				name : 'start_time',
				metadata : 'start_time',
				width : 120,
				sortable : true,
				align : 'left'
			},{
				display : '查看流程图',
				name : 'lookWfPicture',
				metadata : 'lookWfPicture',
				width : 80,
				sortable : true,
				align : 'center'
			},{
				display : '操作',
				name : 'operate',
				metadata : 'operate',
				width : 80,
				sortable : false,
				align : 'left'
		}],
		buttons : [{
			name: '正在流转', 
			bclass: 'more',
			id:'do_more',
			more:[
                 {name: '全部', bclass: 'formbuilder_newWorkFlow',onpress:function(){workflowMonitor.changeStatus('all','全部')}},
 				 {name: '正在流转', bclass: 'formbuilder_addLink',onpress:function(){workflowMonitor.changeStatus('flow','正在流转')}},
 				 {name: '已经完成', bclass: 'formbuilder_dropLink',onpress:function(){workflowMonitor.changeStatus('over','已经完成')}}
 				]}],
		singleSelect:true,
		usepager : true,
		title : '表单授权',
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
		var h = $(window).height() - $("#workflowControlDataGridDiv").position().top;
		var flex = $("#workflowControlDataGrid").closest("div.flexigrid");
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
	$('#workflowControlDataGridDiv div[class="tDiv2"]').append('<div class="find-dialog"><input id="workflowMonitorQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="workflowMonitor.query()"></span></div>');
//	sizeChanged();
	
	/** 授权按钮 **/
	$("#workflowControlDataGrid .editbtn").die().live("click", function(){
		workflowMonitor.toAccreditPage($(this).closest("tr"));
	});  

	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'workflowMonitorQuery') {
			workflowMonitor.query();
		}
	});
	$('#do_more .more').attr('class','filter') ;
	
});

var workflowMonitor = {
		query: function(){
			var keyword = $.trim($('#workflowMonitorQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#workflowControlDataGrid").flexOptions({query:keyword}).flexReload();
		},
		changeStatus: function(status, title){
			$("#workflowControlDataGrid").flexOptions({url:$.appClient.generateUrl({ESWorkflowMonitor: 'getWfMonitorDataList',formType:$("#workflowControlDataGrid").attr('formType'),status:status}, 'x')}).flexReload();
			$("#workflowControlDataGrid").attr('status',status);
			$('#do_more .filter').html(title) ;
		},
		// 停止工作流程 longjunhao 20140612
		stopWorkflow: function(wfId,type,relationBusiness,title,relationTitle,fromUser,fromDate){
			var content = 'kill'==type?'流程正在流转，您确定要终止吗？':'流程正在流转，您确定要结束吗？';
			$.dialog({
				title:'消息',
				content:content,
				okVal:'确定',
				cancelVal:'取消',
				ok:function(){
					$.post($.appClient.generateUrl({ESWorkflowMonitor : 'stopWorkflow'}, 'x')
						,{wfId:wfId,type:type,relationBusiness:relationBusiness,title:title,relationTitle:relationTitle,fromUser:fromUser,fromDate:fromDate}, 
						function(res){
							var json = eval('('+res+')');
							if (json.success == 'true') {
								if ('kill' == json.type) {
									$.dialog.notice({content:'流程终止成功！',icon:'success',title:'消息',time:1});
								} else {
									$.dialog.notice({content:'流程结束成功！',icon:'success',title:'消息',time:1});
								}
								$("#workflowControlDataGrid").flexReload();
							} else {
								$.dialog.notice({icon:'warning',content:'存在正在流转的流程数据，不能进行修改操作！',title:'消息',time:2});
							}
						});
				},
				cancel:true
			});
		},
		// 查看流程图 longjunhao 20140612
		showWorkflowGraph: function(formId,modelId,stepId,wfId,status){
			//gaoyide 20141015
			var Sys = {}; 
	        var ua = navigator.userAgent.toLowerCase(); 
	        if (window.ActiveXObject) 
	            Sys.ie = ua.match(/msie ([\d.]+)/)[1]; 
	        //如果浏览器是IE8及IE8一下 
	        if(Sys.ie<=8){
	        	var obj;
	        	try{
	        		obj= new ActiveXObject("WScript.Shell");
	        	}catch(e){
	        		alert("请在Internet选项中设置:对没有标记为安全的activex控件进行初始化和脚本运行”设置成“启用”");
	        		return;
	        	}
	        	var f;
	        	try{
	        		var setSvg = new ActiveXObject("Adobe.SVGCtl");
	        		f = setSvg;
	        	}catch(e){
	        		f=false;
	        	}
	        	if(!f){
	        		var content = "<div style='display:inline;'><label><input type='radio' name='exportType' value='xml' runat='server' checked/>SVGView.exe</label><p style='font-size:12px'>由于您的IE版本过低,无法正常显示图片.需要下载SCGView插件,安装后才能正常浏览.</p></div>";
	        		var dlg = $.dialog({
	        			content:content,
	        			title:"下载相应的控件",
	        			width:300,
	        			okVal:"确定",
	        			cancelVal:"取消",
	        			cancel:true,
	        			ok:function(){
	        				workflowMonitor.downloadSVG();
	        			}
	        		});
	        		return;
	        	}
	        }
			$.ajax({
				type : 'POST',
				url:$.appClient.generateUrl({ESWorkflowMonitor : 'showWfGraph'},'x'),
				data:{formId:formId,modelId:modelId,stepId:stepId,wfId:wfId,status:status},
				success:function(data){
					$.dialog({
			    		id:'mxGraphHtmlDialog',
				    	title:'查看流程图',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:400,
						height:100,
						cancelVal: '关闭',
			    		cancel: true,
					    content:data
				    });
			    },
			    error : function() {
					$.dialog.notice({icon : 'error',content : '获取流程图失败！',title : '消息',time : 3});
				}
			});
		},
		downloadSVG: function(){
			var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDownSVG'});
			$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载SVGView.exe</a>',icon: 'succeed'});
		}
}