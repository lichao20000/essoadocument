/**
 * @author gengqianfeng 定制收发流程类型树管理
 */
$(document).ready(function(){
	var setting = {
			view: {
				dblClickExpand: true,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			async:{
				autoParam:['id','column','path','number'],
				enable:true
			},
			callback: {
				onClick: onClick
			}
		};
	
	function onClick(e,treeId, treeNode) {		
		$("#selTreeId").val(treeNode.id);//选择树时保存选择节点id
		$("#condition").val("");//清空筛选条件
		var url=$.appClient.generateUrl({ESSendReceiveFlow:'getLoaderListInfo',pid:treeNode.id},'x');
		$("#esDataList").flexOptions({newp:1,url:url}).flexReload();
	}
		
	reloadTree();//初始加载树结构
	
	//类型添加事件
	$("#esmenu .add").die().live('click',function(){
		addFlowType();
	});
	
	//类型修改事件
	$("#esmenu .edit").die().live('click',function(){
		editFlowType();
	});
	
	//类型删除事件
	$("#esmenu .delete").die().live('click',function(){
		delFlowType();
	});
	
	//添加流程类型
	function addFlowType(){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'flowTypePage'},'x'),
		    data:{type:'add'},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'添加流程类型',
		    		width: '400px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确认添加',
				    ok:true,
				    init:function(){
				    	$("#flowType").autovalidate();
				    },
			    	ok:function(){ 
			    		if(!$("#flowType").validate()){
			    			return false;
			    		}
			    		var selTreeId=$("#selTreeId").val();
			    		if(selTreeId==""){
			    			selTreeId="1";
			    		}
			    		//唯一验证
			    		if(!uniqueName(selTreeId,$("#name").val(),"")){
			    			return false;
			    		}
			    		var addParam={pid:selTreeId,name:$("#name").val(),sort:$("#sort").val()};
			    		confirmAddFlowType(addParam);//确认添加流类型
					},cancel:function(){
						//关闭添加窗口
					}
			    });
		    },
		    cache:false
		});
	}

	//确认添加流类型
	function confirmAddFlowType(addParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'addFlowType'},'x'),
		    data:addParam,
		    success:function(data){
		    	if(data){
		    		//提示添加成功
		    		$.dialog.notice({icon:"success",content:"添加收发流程类型成功",time:3});
		    		var treeObj = $.fn.zTree.getZTreeObj("esTypeTree");
		    		var nodes = treeObj.getSelectedNodes();
		    		var child = jQuery.parseJSON(data);
		    		if(nodes && nodes.length > 0){
		    			treeObj.addNodes(nodes[0], child);
		    		}else{
		    			var root = treeObj.getNodeByParam("id",1);
		    			treeObj.addNodes(root, child);
		    		}		    		
				}else{
					//提示添加失败
					$.dialog.notice({icon:"error",content:data,time:3});
					return false;
				}
		    },
		    cache:false
		});
	}

	//修改流程类型
	function editFlowType(){
		var selTreeId=$("#selTreeId").val();
		if(selTreeId==""){
			$.dialog.notice({icon:"warning",content:"请选择要编辑的树结构",time:3});
			return false;
		}
		if(selTreeId==0){
			$.dialog.notice({icon:"warning",content:"根节点不能编辑",time:3});
			return false;
		}
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'flowTypePage'},'x'),
		    data:{type:'edit',id:selTreeId},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'编辑流程类型',
		    		width: '400px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确认修改',
				    ok:true,
				    init: function(){
				    	$("#flowType").autovalidate();
				    },
			    	ok:function(){ 
			    		if(!$("#flowType").validate()){
			    			return false;
			    		}
			    		//唯一验证
			    		if(!uniqueName(selTreeId,$("#name").val(),$("#oldTypeName").val())){
			    			return false;
			    		}
			    		//验证修改参数
			    		var editParam={id:selTreeId,pid:$("#pid").val(),name:$("#name").val(),sort:$("#sort").val()};
			    		confirmEditFlowType(editParam);//确定修改流类型
					},cancel:function(){
						//关闭修改窗口
					}
			    });
		    },
		    cache:false
		});
	}

	//确认修改流类型
	function confirmEditFlowType(editParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'editFlowType'},'x'),
		    data:editParam,
		    success:function(data){
		    	if(data){
		    		//提示修改失败
					$.dialog.notice({icon:"error",content:data,time:3});
					return false;
				}else{
					//提示修改成功
		    		$.dialog.notice({icon:"success",content:"修改收发流程类型成功",time:3});
		    		reloadTree();//重新加载树结构
				}
		    },
		    cache:false
		});
	}

	//删除流程类型
	function delFlowType(){
		var treeObj = $.fn.zTree.getZTreeObj("esTypeTree");
		var nodes = treeObj.getSelectedNodes();
		if(nodes.length==0){
			$.dialog.notice({icon:"warning",content:"请选择要删除的树节点",time:2});
			return false;
		}
		if(nodes[0].id==0){
			$.dialog.notice({icon:"warning",content:"根节点不能删除",time:2});
			return false;
		}
		$.dialog({
	    	title:'删除流程类型',
			width: '350px',
		   	fixed:true,
		    resize: false,
		    padding:0,
	    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>“<span style='color:red'>"+nodes[0].name+"</span>”吗？</div>",
		    cancelVal: '取消',
		    cancel: true,
		    okVal:'确定',
		    ok:true,
	    	ok:function(){
	    		var ids=[];
	    		ids.push(nodes[0].id);
	    		confirmDel({ids:getChildren(ids,nodes[0])});//确定删除流程类型
			},cancel:function(){
				//关闭删除窗口
			}
	    });
	}

	//获取选中节点下的所有子节点id
	function getChildren(ids,treeNode){
		if (treeNode.isParent){
			for(var obj in treeNode.children){
				ids.push(treeNode.children[obj].id);
				getChildren(ids,treeNode.children[obj]);
			}
		}
		return ids;
	}
	
	//确定删除流程类型
	function confirmDel(delparam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESSendReceiveFlow:'delFlowType'},'x'),
		    data:delparam,
		    success:function(data){
		    	if(data){
		    		//提示删除失败
		    		$.dialog.notice({icon:"error",content:data,time:3});
		    		return false;
		    	}else{
		    		//提示删除成功
		    		$.dialog.notice({icon:"success",content:"删除收发流程类型成功",time:3});
		    		reloadTree();//重新加载树结构
		    		var url=$.appClient.generateUrl({ESSendReceiveFlow:'getLoaderListInfo',pid:$("#selTreeId").val()},'x');
		    		$("#esDataList").flexOptions({newp:1,url:url}).flexReload();
		    	}
		    },
		    cache:false
		});
	}

	//重新加载树结构
	function reloadTree(){
		$.getJSON($.appClient.generateUrl({ESSendReceiveFlow : "getTree"}, 'x'), function(zNodes) {
			$.fn.zTree.init($("#esTypeTree"), setting, zNodes);
			var treeObj = $.fn.zTree.getZTreeObj("esTypeTree");
			var root = treeObj.getNodeByParam("id",0);
			treeObj.selectNode(root);
			$("#selTreeId").val(root.id);
		});
	}
	
	//同一个收发流程类型下名称唯一验证
	function uniqueName(pid,name,oldname){
		var flag=true;
		if(name!=oldname){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESSendReceiveFlow:'uniqueName'},'x'),
				data:{pId:pid,name:name,type:'type'},
				async:false,//同步设置
				success:function(data){
					if(data>0){
						$("#name").addClass("invalid-text");
						$("#name").attr('title',"同一结构下(包含此结构)收发流程类型名称不能重复");
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