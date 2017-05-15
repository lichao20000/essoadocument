/**
 * @author gengqianfeng 定制收发流程
 */
$(document).ready(function(){
	//初始加载数据
	var url=$.appClient.generateUrl({ESSendReceiveFlow:'getLoaderListInfo'},'x');
	$("#esDataList").flexigrid({
		url: url,
		dataType: 'json',
		colModel : [
		    {display : '数据标识',name :'id',hide:true,width:30,align:'center'},
			{display: '序号', name : 'num', width : 20, align: 'center'}, 
			{display: '<input type="checkbox" name="paths">', name : 'ids', width : 20, align: 'center'},
			{display: '操作', name : 'operate', width : 60, align: 'center'},
			{display: '工作流名称', name : 'name', width : 220, align: 'left'},
			{display: '收集范围', name : 'typeName', width : 120, align: 'left'},
			{display: '状态', name : 'status', width : 60, align: 'left'},
			{display: '版本', name : 'version', width : 80, align: 'right'},
			{display: '描述', name : 'describtion', width : 160, align: 'left'},
			{display: '创建人', name : 'creater', width : 80, align: 'left'},
			{display: '创建时间', name : 'createTime', width : 120, align: 'center'},
			{display: '修改人', name : 'modifyer', width : 80, align: 'left'},
			{display: '修改时间', name : 'modifyTime', width : 120, align: 'center'}
		],
		buttons : [{name: '添加', bclass: 'add', onpress: addFlow },
			{name: '删除', bclass: 'delete', onpress: delFlow },
			{name: '筛选', bclass: 'filter', onpress: filterFlow },
			{name: '还原数据', bclass: 'back', onpress: backFlow },
			{name: '定制流程', bclass: 'relation', onpress: flowChart },
			{name: '流程发布', bclass: 'confirm', onpress: function(){pubOrCloseFlow(1);}},
			{name: '流程关闭', bclass: 'delcode', onpress: function(){pubOrCloseFlow(0);}}
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
		editFlow($(this).closest("tr").prop("id").substr(3));
	});

	//全选
	$("input[name='paths']:checkbox").die().live("click",function(){
		$("#esDataList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	//添加筛选行
	$('#filterContents .newfilter').die().live('click',function (){
		  var t =   $(this).parent().clone().insertAfter($(this).parent());
			t.each(function(){
				$(this).find('input').val('');
			});
		});

	//删除筛选行
	$('#filterContents .delfilter').die().live('click',function (){
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
	
	//添加流程
	function addFlow(){
		var selTreeId=$("#selTreeId").val();
		if(selTreeId==""||selTreeId=="0"){
			$.dialog.notice({icon:"warning",content:"请选择流程类型",time:3});
			return false;
		}
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'flowPage'},'x'),
		    data:{type:'add'},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'添加流程',
		    		width: '500px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确认添加',
				    ok:true,
				    init:function(){
				    	$("#sendReceiveFlow").autovalidate();
				    },
			    	ok:function(){
			    		if(!$("#sendReceiveFlow").validate()){
			    			return false;//验证添加参数
			    		}
			    		//唯一验证
			    		if(!uniqueName(selTreeId,$("#name").val(),"")){
			    			return false;
			    		}
			    		var name=$("#name").val();
			    		var typeNo=$("#selectBusiness").attr("code");
			    		var version=$("#version").val();
			    		var describtion=$("#describtion").val();
			    		var addParam={pid:selTreeId,name:name,typeNo:typeNo,version:version,describtion:describtion};
			    		confirmAddFlow(addParam);//确认添加流类型
					},cancel:function(){
						//关闭添加窗口
					}
			    });
		    },
		    cache:false
		});
	}

	//确认添加流程
	function confirmAddFlow(addParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'addFlow'},'x'),
		    data:addParam,
		    success:function(data){
		    	if(data){
					//提示添加成功
		    		$.dialog.notice({icon:"success",content:"添加流程成功",time:3});
		    		$("#esDataList").flexReload();
				}else{
					//提示添加失败
					$.dialog.notice({icon:"error",content:"添加流程失败",time:3});
					return false;
				}
		    },
		    cache:false
		});
	}

	//修改流程
	function editFlow(id){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'flowPage'},'x'),
		    data:{type:'edit',flowId:id},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'编辑流程',
		    		width: '500px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确认修改',
				    ok:true,
				    init:function(){
				    	$("#sendReceiveFlow").autovalidate();
				    },
			    	ok:function(){ 
			    		if(!$("#sendReceiveFlow").validate()){
			    			return false;
			    		}
			    		var selTreeId=$("#selTreeId").val();
			    		//唯一验证
			    		if(!uniqueName(selTreeId,$("#name").val(),$("#oldFlowName").val())){
			    			return false;
			    		}
			    		//验证修改参数
			    		var name=$("#name").val();
			    		var typeNo=$("#selectBusiness").attr("code");
			    		var version=$("#version").val();
			    		var describtion=$("#describtion").val();
			    		var editParam={flowId:id,name:name,typeNo:typeNo,version:version,describtion:describtion};
			    		confirmEditFlow(editParam);//确定修改流程
					},cancel:function(){
						//关闭修改窗口
					}
			    });
		    },
		    cache:false
		});
	}

	//确认修改流
	function confirmEditFlow(editParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'editFlow'},'x'),
		    data:editParam,
		    success:function(data){
		    	if(data){
		    		//提示修改失败
					$.dialog.notice({icon:"error",content:data,time:3});
					return false;
				}else{
					//提示修改成功
		    		$.dialog.notice({icon:"success",content:"修改流程成功",time:3});
		    		$("#esDataList").flexReload();
				}
		    },
		    cache:false
		});
	}

	//删除流程
	function delFlow(){
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		
		/** lujixiang 20150326 获取流程名称 **/
		var ids = [];
		var names = [] ;
		checks.each(function(){
			var id = $(this).closest("tr").prop("id").substr(3);
			ids.push(id);
			
			var name = $(this).closest("tr").find("td[colname='name'] div").text() ;
			names.push(name);
		}); 
		if(checks.length > 0){
			$.dialog({
		    	title:'删除流程',
				width: '300px',
			   	fixed:true,
			    resize: false,
			    padding:0,
		    	content:"<div style='padding:40px 5px;vertical-align:middle;word-break:break-all;'>确定要<a style='color:red'>删除</a>“<a style='color:red'>" + names + "</a>”吗？</div>",
			    cancelVal: '取消',
			    cancel: true,
			    okVal:'确定',
			    ok:true,
		    	ok:function(){
		    		/** lujixiang 20150326 **/
		    		/**
		    		var ids = [];
		    		checks.each(function(){
		    			var id = $(this).closest("tr").prop("id").substr(3);
		    			ids.push(id);
		    		}); 
		    		**/ 
		    		var delParam = {ids:ids};
		    		confirmDel(delParam);//确定删除流程
				},cancel:function(){
					//关闭删除窗口
				}
		    });
		}else{
			$.dialog.notice({icon:"warning",content:"请选择要删除的流程数据",time:3});
			return false;
		}
	}

	//确定删除流程
	function confirmDel(delParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'delFlow'},'x'),
		    data:delParam,
		    success:function(data){
		    	if(data){
		    		//提示删除失败
		    		$.dialog.notice({icon:"warning",content:data,time:3});
		    		return false;
		    	}else{
		    		//提示删除成功
		    		$.dialog.notice({icon:"success",content:"删除收发流程成功",time:3});
		    		$("#esDataList").flexReload();
		    	}
		    },
		    cache:false
		});
	}

	//筛选
	function filterFlow(){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'filter'},'x'),
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
			    		var url=$.appClient.generateUrl({ESSendReceiveFlow:'getLoaderListInfo',pid:selTreeId },'x');
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
	function backFlow(){
		var selTreeId=$("#selTreeId").val();
		if(selTreeId==""){
			selTreeId="0";
		}
		$("#condition").val("");//清空筛选条件
		var url=$.appClient.generateUrl({ESSendReceiveFlow: 'getLoaderListInfo',pid:selTreeId}, 'x');
		$("#esDataList").flexOptions({newp:1,query:'',url:url}).flexReload();
	}
	
	//定制收发流程
	function flowChart(){
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		if(checks.length == 1){
			var id=checks.closest("tr").prop("id").substr(3);
			$.ajax({
			    url:$.appClient.generateUrl({ESSendReceiveFlow:'flowChart',id:id},'x'),
			    success:function(data){
			    	dia2 = $.dialog({
				    	title:'定制流程',
			    		width: '750px',
			    	   	fixed:true,
			    	    resize: false,
			    	    padding:0,
				    	content:data,
					    cancel: true,
					    cancelVal: '关闭',
					    ok:true,
					    okVal:'确定',
					    ok:function(){
					    	var matrix=getMatrixParam();
					    	if(matrix==null){
					    		$.dialog.notice({icon:"warning",content:"请添加接收文件的单位部门或用户",time:3});
								return false;
					    	}else{
					    		addMatrix(id,matrix);
					    	}
					    },cancel:function(){
					    	//关闭定制流程窗口
					    }
				    });
			    },
			    cache:false
			});
		}else{
			$.dialog.notice({icon:"warning",content:"请选择单条数据进行流程定制",time:3});
			return false;
		}
	}

	//添加流程矩阵
	function addMatrix(id,matrix){
		flowname = $("#row"+id+"").find("td[colname='name']").text();
		var url=$.appClient.generateUrl({ESSendReceiveFlow:'editMatrix'},'x');
		$.post(url,{id:id,matrix:matrix,flowname:flowname},function(data){
			if(data){
				$.dialog.notice({icon:"error",content:data,time:3});	    		
	    		return false;
	    	}else{
	    		$.dialog.notice({icon:"success",content:"定制收发流程矩阵成功",time:3});
	    		$("#esDataList").flexOptions({newp:1}).flexReload();
	    	}
		},"json");
	}
	
	//获取收发矩阵
	function getMatrixParam(){
		var matrix="[";
    	$("#flowChart .confirmPart").each(function(){
    		var code=$(this).attr("code");
    		var copies=$(this).attr("copies");
    		var type=$(this).attr("receiveType");
    		if(code!="" && copies!=""){
    			matrix += '{"code":"'+code+'","copies":"'+copies+'","type":"'+type+'"},';
    		}
    	});
    	return (matrix=="[")?null:(matrix.substring(0, matrix.length-1)+"]");
	}
	
	//流程关闭或发布
	function pubOrCloseFlow(key){
		var status=(key==0)?"关闭":"发布";
		var checks=$("#esDataList").find("input[type='checkbox']:checked");
		if(checks.length == 1){
			if(key==1 && $(checks[0]).attr("matrix")==""){
				$.dialog.notice({icon:"warning",content:"未定制分发流程!",time:3});
				return false;
			}
			var id = checks.closest("tr").prop("id").substr(3);
			var name = checks.closest("tr").find("td[colname='name'] div").text();
			
			var oldStatus=checks.closest("tr").find("td[colname='status'] div").html();
			if(oldStatus==status){
				$.dialog.notice({icon:"warning",content:"此流程已是"+oldStatus+"状态",time:3});	    		
	    		return false;
			}
			var url=$.appClient.generateUrl({ESSendReceiveFlow:'pubOrCloseFlow'},'x');
			$.post(url,{id:id,status:status,name:name},function(data){
				if(data){
					$.dialog.notice({icon:"error",content:data,time:3});	    		
		    		return false;
		    	}else{
		    		$.dialog.notice({icon:"success",content:status+"流程成功",time:3});
		    		$("#esDataList").flexOptions({newp:1}).flexReload();
		    	}
			},"json");
		}else{
			$.dialog.notice({icon:"warning",content:"请选择单条数据进行流程"+status,time:3});
			return false;
		}
	}
	
	//同一个收发流程名称下名称唯一验证
	function uniqueName(pid,name,oldname){
		var flag=true;
		if(name!=oldname){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESSendReceiveFlow:'uniqueName'},'x'),
				data:{pId:pid,name:name,type:'flow'},
				async:false,//同步设置
				success:function(data){
					if(data>0){
						$("#name").addClass("invalid-text");
						$("#name").attr('title',"同一结构下收发流程名称不能重复");
	    				flag=false;
	    				return false;
	    			}
					$("#name").removeClass("invalid-text");
					$("#name").attr('title',"");
				}
			});
		}
		return flag;
	}
});