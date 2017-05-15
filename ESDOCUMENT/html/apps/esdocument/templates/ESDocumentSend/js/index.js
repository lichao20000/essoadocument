/**
 * @author gengqianfeng
 */
$(document).ready(function(){
	var url=$.appClient.generateUrl({ESDocumentSend:'getLoaderListInfo'},'x');
	$("#esDataList").flexigrid({
		url: url,
		dataType: 'json',
		colModel : [
		    {display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
			{display: '序号', name : 'num', width : 20, align: 'center'}, 
			{display: '<input type="checkbox" name="paths">', name : 'ids', width : 20, align: 'center'},
			{display: '操作', name : 'operate', width : 60, align: 'center'},
			{display: '流程矩阵', name : 'matrix', width : 80, align: 'center'},
			{display: '编号', name : 'no', width : 140, align: 'left'},
			{display: '流程名称', name : 'flowName', width : 200, align: 'left'},
			{display: '状态', name : 'status', width : 80, align: 'center'},
			{display: '发起人', name : 'creater', width : 120, align: 'left'},
			{display: '发起时间', name : 'createTime', width : 120, align: 'center'}			
		],
		buttons : [ {name: '新建', bclass: 'add', onpress:addSend },
		            {name: '删除', bclass: 'delete', onpress: delSend },
					{name: '筛选', bclass: 'filter', onpress:filterSend },
					{name: '还原数据', bclass: 'back', onpress:backSend },
					{name: '撤回', bclass: 'refresh', onpress:calSend },
					{name: '发放', bclass: 'autocorre', onpress:pubSend }
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
	
	//编辑事件
	$(".editbtn").die().live("click", function(){
		editSend($(this).closest("tr").prop("id").substr(3),$(this).attr("pid"),$(this).closest("tr").find("td[colname='status'] div").html());
	});
	//编辑事件
	$(".showbtn").die().live("click", function(){
		showSend($(this).closest("tr").prop("id").substr(3),$(this).attr("pid"),$(this).closest("tr").find("td[colname='status'] div").html());
	});

	//全选
	$("input[name='paths']:checkbox").die().live("click",function(){
		$("#esDataList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	//添加筛选行
	$('.newfilter').die().live('click',function (){
		  var t =   $(this).parent().clone().insertAfter($(this).parent());
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
	
	//选择文件
	$("#sendPage .linkFile").die().live("click",function(){
		linkFile();
		/*if($("#flowId").val()!="" && $("#typeNo").val()!=""){
		}else{
		$.dialog.notice({icon:"warning",content:"请先选择流程",time:3});
		}*/
	});
	
	//删除选中文件
	$("#sendPage .delLinkFile").die().live("click",function(){
		if($("#flowId").val()!="" && $("#typeNo").val()!=""){
			delLinkFile();
		}
	});
	
	//查看流程矩阵
	$(".relation").die().live("click",function(){
		scanMatrix($(this).closest("tr").prop("id").substr(3),$(this).attr("pId"));
	});
	
	//新建文件分发单
	function addSend(){
		var selTreeId=$("#selTreeId").val();
		if(selTreeId=="" || selTreeId==0){
			$.dialog.notice({icon:"warning",content:"请选择流程类型",time:3});
			return false;
		}
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'sendPage'},'x'),
		    data:{type:'add',pid:selTreeId},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'添加发放单',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'发放',
				    ok:true,
				    init:function(){
				    	loadSelFile("");
				    	$("#sendPage").autovalidate();
				    },
				    button:[{
						name: '保存待发',
						callback: function () {
							if(!$("#sendPage").validate()){
				    			return false;
				    		}
							var no=$("#no").val();
				    		var fileflow_id=$("#flowId").val();
				    		var fileflow_name=getFileflowName();
				    		var file_id=$("#file_id").val();
				    		var strMatrix=$("#matrix").val();
				    		if(file_id==""){
				    			$.dialog.notice({icon:"warning",content:"请选择文件",time:3});
				    			return false;
				    		}
				    		var _titles = [];
				    		$("#linkFileList").find("tr").each(function(){
				    			var title = $(this).find("td[colname='title'] div").text();
				    			_titles.push(title);
				    		})
				    		
				    		var addParam={selTreeId:selTreeId,no:no,fileflow_id:fileflow_id,fileflow_name:fileflow_name,file_id:file_id,titles:_titles.toString(),strMatrix:strMatrix};
				    		momentumSend(addParam);//待发
						},
						disabled: false,
						focus: true
					}],
			    	ok:function(){
			    		if(!$("#sendPage").validate()){
			    			return false;
			    		}
			    		var no=$("#no").val();
			    		var fileflow_id=$("#flowId").val();
			    		var fileflow_name=getFileflowName();
			    		var file_id=$("#file_id").val();
			    		var strMatrix=$("#matrix").val();
			    		if(file_id==""){
			    			$.dialog.notice({icon:"warning",content:"请选择文件",time:3});
			    			return false;
			    		}
			    		
			    		if(strMatrix == "") strMatrix=getMatrixParams();
			    		var matrix = jQuery.parseJSON(strMatrix);
			    		var nodeType=getParentNode(selTreeId);
			    		var _titles = [];
			    		$("#linkFileList").find("tr").each(function(){
			    			var title = $(this).find("td[colname='title'] div").text();
			    			_titles.push(title);
			    		})
			    		var addParam={nodeType:nodeType,selTreeId:selTreeId,no:no,fileflow_id:fileflow_id,fileflow_name:fileflow_name,file_id:file_id,titles:_titles.toString(),matrix:matrix,strMatrix:strMatrix};
			    		extendSend(addParam);//发放
					},cancel:function(){
						//关闭添加窗口
					}
			    });
		    },
		    cache:false
		});
	}

	function getFileflowName(){
		var fileflow_name="";
		$("#flowId option").each(function(){
			if($("#flowId").val()==$(this).val()){
				fileflow_name = $(this).text();
				return false;//跳出循环
			}
		});
		return fileflow_name;
	}
	
	//待发
	function momentumSend(addParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'momentumSend'},'x'),
		    data:addParam,
		    success:function(data){
		    	if(data){
		    		//提示添加成功
		    		$.dialog.notice({icon:"success",content:"保存待发成功",time:3});
		    		$("#esDataList").flexReload();		    		
				}else{
					//提示添加失败
					$.dialog.notice({icon:"error",content:"保存待发失败",time:3});
					return false;
				}
		    },
		    cache:false
		});
	}
	
	//获取发放流程参数
	function getMatrixParams(){
		var matrix="";
		$("#flowId").find("option").each(function(){
			if($(this).attr("value") == $("#flowId").val()){
				matrix=$(this).attr("matrix");
				return matrix;
			}
		});
		return matrix;
	}
	
	//发放
	function extendSend(addParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'extendSend'},'x'),
		    data:addParam,
		    success:function(data){
		    	if(data){
		    		//提示添加成功
		    		$.dialog.notice({icon:"success",content:"发放成功",time:3});
		    		$("#esDataList").flexReload();
		    		
				}else{
					//提示添加失败
					$.dialog.notice({icon:"error",content:"发放失败",time:3});
					return false;
				}
		    },
		    cache:false
		});
	}

	//直接发放
	function pubSend(){
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		if(checks.length == 1){
			var id = $(checks[0]).closest("tr").prop("id").substr(3);
			$.post($.appClient.generateUrl({ESDocumentSend:'getDocumentSendById'},'x'),{id:id},function(json){
				if(json){
					var status=$(checks[0]).closest("tr").find("td[colname='status'] div").html();
					if(status=="待发"){
						var url=$.appClient.generateUrl({ESDocumentSend:'pubSend'},'x');
						var file_id=json.file_id;
						var pId = json.pId;
						var nodeType=getParentNode(pId);
						var fileflow_id=json.fileflow_id;
						var fileflow_name=json.fileflow_name;
						var no = json.no
						var matrix=jQuery.parseJSON(json.matrix);
						$.post(url,{id:id,pId:pId,no:no,file_id:file_id,nodeType:nodeType,fileflow_id:fileflow_id,fileflow_name:fileflow_name,matrix:matrix},function(data){
							if(data){
								$.dialog.notice({icon:"success",content:"发放成功",time:3});
								$("#esDataList").flexReload();						
							}else{
								$.dialog.notice({icon:"error",content:"发放失败",time:3});
								return false;
							}
						});
					}else{
						//$.dialog.notice({icon:"warning",content:"只有待发状态才可发放",time:3});
						return false;
					}	
				}
			},"json");
					
		}else{
			$.dialog.notice({icon:"warning",content:"请选择要发放的单条数据",time:3});
			return false;
		}
	}
	
	function getParentNode(pId){
		var treeObj = $.fn.zTree.getZTreeObj("esTypeTree");
		var parent= getUpNode(treeObj,pId);
		if(parent.name == "设计变更单"){
			return "1";
		}else{
			return "2";
		}
	}
	
	function getUpNode(treeObj,pId){
		var parent = treeObj.getNodeByParam("id",pId);
		if(parent.pId > 0){			
			return getUpNode(treeObj,parent.pId);
		}else{
			return parent;
		}
	}
	
	//编辑发放单
	function editSend(sendId,pid,status){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'sendPage'},'x'),
		    data:{type:'edit',pid:pid,sendId:sendId},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'编辑发放单',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'发放',
				    ok:true,
				    init:function(){
				    	loadSelFile($("#file_id").val());
				    	$("#sendPage").autovalidate();
				    },
				    button:[{
						name: '保存待发',
						callback: function () {
							if(status=="待发"){
								if(!$("#sendPage").validate()){
					    			return false;
					    		}
								var no=$("#no").val();
					    		var fileflow_id=$("#flowId").val();
					    		var fileflow_name=$("#flowId").attr("flowname");
					    		var file_id=$("#file_id").val();
					    		var strMatrix=$("#matrix").val();
					    		if(file_id==""){
					    			$.dialog.notice({icon:"warning",content:"请选择文件",time:3});
					    			return false;
					    		}
					    		var _titles = [];
					    		$("#linkFileList").find("tr").each(function(){
					    			var title = $(this).find("td[colname='title'] div").text();
					    			_titles.push(title);
					    		})
					    		var editParam={selTreeId:pid,sendId:sendId,no:no,fileflow_id:fileflow_id,fileflow_name:fileflow_name,file_id:file_id,titles:_titles.toString(),strMatrix:strMatrix};
					    		momentumSend(editParam);//待发
							}else{
								//$.dialog.notice({icon:"warning",content:"发放或关闭状态无法再次保存待发",time:3});
								return false;
							}
						},
						disabled: false,
						focus: true
					}],
			    	ok:function(){
			    		if(status=="待发"){
				    		if(!$("#sendPage").validate()){
				    			return false;
				    		}
				    		var no=$("#no").val();
				    		var fileflow_id=$("#flowId").val();
				    		var fileflow_name=$("#flowId").attr("flowname");
				    		var file_id=$("#file_id").val();
				    		var strMatrix=$("#matrix").val();
				    		if(file_id==""){
				    			$.dialog.notice({icon:"warning",content:"请选择文件",time:3});
				    			return false;
				    		}
				    		if(strMatrix == "") strMatrix=getMatrixParams();
				    		var matrix = jQuery.parseJSON(strMatrix);
				    		var nodeType=getParentNode(pid);
				    		var _titles = [];
				    		$("#linkFileList").find("tr").each(function(){
				    			var title = $(this).find("td[colname='title'] div").text();
				    			_titles.push(title);
				    		})
				    		
				    		var editParam={nodeType:nodeType,selTreeId:pid,sendId:sendId,no:no,fileflow_id:fileflow_id,fileflow_name:fileflow_name,file_id:file_id,titles:_titles.toString(),matrix:matrix,strMatrix:strMatrix};
				    		extendSend(editParam);//发放
			    		}else{
			    			//$.dialog.notice({icon:"warning",content:"已经发放不能再次发放！",time:3});
			    			return false;
			    		}
					},cancel:function(){
						//关闭添加窗口
					}
			    });
		    },
		    cache:false
		});
	}
	//编辑发放单
	function showSend(sendId,pid,status){
		$.ajax({
			type:'POST',
			url:$.appClient.generateUrl({ESDocumentSend:'showSendPage'},'x'),
			data:{type:'edit',pid:pid,sendId:sendId},
			success:function(data){
				dia2 = $.dialog({
					title:'查看发放单',
					width: '800px',
					fixed:true,
					resize: false,
					padding:0,
					content:data,
					//cancelVal: '关闭',
					//cancel: true,
					okVal:'关闭',
					ok:true,
					init:function(){
					 loadSelFile($("#file_id").val());
					},
					ok:function(){
						this.close();
					}
				});
			},
			cache:false
		});
	}

	//删除发放单
	function delSend(){
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		if(checks.length > 0){
			var ids = [];
    		checks.each(function(){
    			var id = $(this).closest("tr").prop("id").substr(3);
    			var status=$(this).closest("tr").find("td[colname='status'] div").html();
    			if(status=="关闭"){
    				ids.push(id);
    			}
    		}); 
    		if(ids==null || ids.length==0){
    			$.dialog.notice({icon:"warning",content:"状态为发放的数据不能删除！",time:3});
    			return false;
    		}
			$.dialog({
		    	title:'删除发放单',
				width: '300px',
			   	fixed:true,
			    resize: false,
			    padding:0,
		    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要删除所选数据吗？</div>",
			    cancelVal: '取消',
			    cancel: true,
			    okVal:'确定',
			    ok:true,
		    	ok:function(){		    		
		    		var delParam = {ids:ids};
		    		confirmDel(delParam,checks.length-ids.length,ids.length);//确定删除流程
				},cancel:function(){
					//关闭删除窗口
				}
		    });
		}else{
			$.dialog.notice({icon:"warning",content:"请选择要删除的数据",time:3});
			return false;
		}
	}

	//确定删除发放单
	function confirmDel(delParam,len1,len2){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'delSend'},'x'),
		    data:delParam,
		    success:function(data){
		    	if(data){
		    		//提示删除失败
		    		$.dialog.notice({icon:"error",content:data,time:3});
		    		return false;
		    	}else{
		    		//提示删除成功
		    		$.dialog.notice({icon:"success",content:"成功删除"+len2+"条，有"+len1+"条由于状态为【发放】不能删除",time:3});
		    		$("#esDataList").flexReload();
		    	}
		    },
		    cache:false
		});
	}

	//筛选发放单
	function filterSend(){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'filter'},'x'),
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
			    		var url=$.appClient.generateUrl({ESDocumentSend:'getLoaderListInfo',pid:selTreeId},'x');
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

	//还原数据
	function backSend(){
		var selTreeId=$("#selTreeId").val();
		if(selTreeId==""){
			selTreeId="0";
		}
		$("#condition").val("");//清空筛选条件
		var url=$.appClient.generateUrl({ESDocumentSend: 'getLoaderListInfo',pid:selTreeId}, 'x');
		$("#esDataList").flexOptions({newp:1,query:'',url:url}).flexReload();
	}

	//选择文件
	function linkFile(){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'linkFile'},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'选择文件',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确定选择',
				    ok:true,
				    init:function(){
				    	loadFileList();
				    },
			    	ok:function(){ 
			    		var ids=$("#file_id").val();
			    		var _ids=[] ;
			    		var _ids=getSelectFids(ids);//获取选择文件ids
			    		
			    		if(ids!=_ids.toString()){
				    		var url=$.appClient.generateUrl({ESDocumentSend: 'findDocumentListByIds',ids:_ids.toString()}, 'x');
				    		$("#linkFileList").flexOptions({url:url}).flexReload();
				    		$("#file_id").val(_ids.toString());
			    		}
					},cancel:function(){
						//关闭选择文件窗口
					}
			    });
		    },
		    cache:false
		});
	}
	
	//获取选择文件ids
	function getSelectFids(ids,titles){
		var _ids=[];
		if(ids!=""){
			_ids=ids.split(",");
		}

		var checks=$("#esFile").find("input[type='checkbox']:checked");
		checks.each(function(){
			var id = $(this).closest("tr").prop("id").substr(3);
			if(checkIds(ids,id)){//检测ids内是否包含id
				_ids.push(id);
			}
		});
		return _ids;
	}
	
	//检测ids内是否包含id
	function checkIds(ids,id){
		var _ids=ids.split(",");
		for(var i=0;i<_ids.length;i++){
			if(_ids[i]==id){
				return false;
			}
		}
		return true;
	}
	
	//加载选择文件
	function loadFileList(){
		var code=$("#typeNo").val();
		if(code!=""){
			$.post($.appClient.generateUrl({ESSendReceiveFlow : "getStageByCode"}, 'x'),{code:code},function(data){
				if(data){
					$("#h_search").attr("stageId",data.id);
					var url=$.appClient.generateUrl({ESFiling: 'findDocumentList',code:code,stageId:data.id}, 'x');
					loadGrid("esFile",url,"0",800,288);
					//全选
					$("#div_esFile input[name='chk']:checkbox").die().live("click",function(){
						$("#esFile").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
					});
				}
			},"json");
		}else{
			$("#h_search").attr("stageId","0");
			var url=$.appClient.generateUrl({ESFiling: 'findDocumentList',code:"",stageId:0}, 'x');
			loadGrid("esFile",url,"0",800,288);
			//$.dialog.notice({icon:"warning",content:"请先为选择的流程设定收集范围！",time:3});
			//return false;
		}	
	}
	
	//加载选中文件
	function loadSelFile(ids){
		var url=$.appClient.generateUrl({ESDocumentSend: 'findDocumentListByIds',ids:ids}, 'x');
		loadGrid("linkFileList",url,"0",800,200);
		//全选
		$("#div_linkFileList input[name='chk']:checkbox").die().live("click",function(){
			$("#linkFileList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
		});
	}
	
	//获取数据列
	function loadGrid(val,url,stageId,w,h){
		var colModel=[{display: '序号', name : 'num', width : 20, align: 'center'}, 
						{display: '<input type="checkbox" name="chk" >', name : 'ids', width : 20, align: 'center'},
						{display: '文件标题', name : 'title', width : 220, align: 'left'},
						{display: '文件编码', name : 'docNo', width : 120, align: 'left'},
						{display: '项目名称', name : 'itemName', width : 220, align: 'left'},
						{display: '装置', name : 'device', width : 120, align: 'left'},
						{display: '拟定部门', name : 'part', width : 80, align: 'left'},
						{display: '拟定人', name : 'person', width : 60, align: 'left'},
						{display: '拟定日期', name : 'date', width : 80, align: 'center'}];
		$.post($.appClient.generateUrl({ESFiling : "findMoveCols"}, 'x'),{stageId:stageId},function(data){
			if(data){
				for(var i=0;i<data.length;i++){
					colModel.push({display : data[i].name,name : data[i].code, width : 80, align : 'center'});
				}
			}
			$("#div_"+val).html('<table id="'+val+'"></table>');
			$("#"+val).flexigrid({
				url : url,
				dataType : 'json',
				colModel : colModel,
				usepager: true,
				title: '&nbsp;',
				nomsg:"没有数据",
				useRp: true,
				width: w,
				height:h,
				showTableToggleBtn: true,
				pagetext: '第',
				itemtext: '页',
				outof: '页 /共',
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
				procmsg:'正在加载数据，请稍候...'
			});
		},"json");
	}
	
	//删除选中文件
	function delLinkFile(){
		var ids=$("#file_id").val();
		var checks=$("#linkFileList").find("input[type='checkbox']:checked");
		if(checks.length>=1){
			var _ids=[];
			_ids=ids.split(",");
			checks.each(function(){
				var id = $(this).closest("tr").prop("id").substr(3);
				for(var i=0;i<_ids.length;i++){
					if(_ids[i]==id){
						_ids.splice(i, 1);
					}
				}
			});
			var url=$.appClient.generateUrl({ESDocumentSend: 'findDocumentListByIds',ids:_ids.toString()}, 'x');
			$("#linkFileList").flexOptions({url:url}).flexReload();
			$("#file_id").val(_ids.toString());
		}else{
			$.dialog.notice({icon:"warning",content:"请选择要删除的文件",time:3});
			return false;
		}
	}
	
	//查看流程矩阵
	function scanMatrix(sendId,pId){
		var nodeType=getParentNode(pId);
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentSend:'flowChart'},'x'),
		    data:{sendId:sendId,nodeType:nodeType},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'流程矩阵',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    ok:false,
				    cancel:function(){
						//关闭选择文件窗口
					}
			    });
		    },
		    cache:false
		});
	}
	
	function calSend(){
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		var sendId= $(checks[0]).attr("id");
		var status = $(checks[0]).closest("tr").find("td[colname='status'] div").text();
		if(checks.length == 1 && status == '发放'){
		$.dialog({title:'撤回确认',
				width: '400px',
			   	fixed:true,
			    resize: false,
			    padding:0,
		    	content:"<div style='padding:40px 5px;vertical-align:middle'>撤回后用户和部门将收不到文件，确定要<span style='color:red'>撤回</span>发放单吗？</div>",
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'确定',
			    ok:true,
		    	ok:function(){ 
		    		var pId= $(checks[0]).attr("pId");
		    		var type =getParentNode(pId);
		    		$.ajax({
		    			type:'POST',
		    		    url:$.appClient.generateUrl({ESDocumentSend:'callbackSend'},'x'),
		    		    data:{sendId:sendId,type:type},
		    		    success:function(msg){
		    		    if(msg=="success"){
		    		    	$.dialog.notice({icon:"success",content:"撤回成功！",time:3});
		    		    	$("#esDataList").flexReload();
		    		    }else{
		    		    	$.dialog.notice({icon:"warning",content:msg,time:3});	
		    		    }
		    		    },
		    		    cache:false
		    		});	
				},cancel:function(){
					//关闭选择文件窗口
				}
		    });
		}else{
			$.dialog.notice({icon:"warning",content:"请选择单个已发放的发放单执行撤回！",time:3});
			return false;
		}
	}
});