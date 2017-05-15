var dia1 = "";
var dia2 = "";
$(function(){
	//左侧树
	var setting = {
				view: {
					dblClickExpand: true,
					showLine: false,
					selectedMulti: false
				},
				edit:{
					enable:true
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				async:{
					enable:true,
					url:$.appClient.generateUrl({ESClassification:'getnode'},'x'),
					autoParam:["id"]
				},
				callback: {
					beforeRename:beforeRename
					//onClick: clickNode
				}
			};

		$.getJSON($.appClient.generateUrl({ESClassification : "tree"}, 'x'), function(zNodes) {
			
			$.fn.zTree.init($("#fication"), setting, zNodes);
			var zTree = $.fn.zTree.getZTreeObj("fication");
		});
		function clickNode(event, treeId, treeNode){
			var zTree = $.fn.zTree.getZTreeObj("fication");
			zTree.expandNode(treeNode);
		}
		function beforeRename(treeId,treeNode,newName){
			 if (newName.length == 0) {
				 alert("节点名称不能为空.");
				 var zTree = $.fn.zTree.getZTreeObj("fication");
				 setTimeout(function(){zTree.editName(treeNode);}, 10);
				 return false;
				 }
				 return true; 
		}
	//添加节点
	$(".add").click(function(){
		var zTree = $.fn.zTree.getZTreeObj("fication");
		nodes = zTree.getSelectedNodes();
		treeNode = nodes[0];
		if (nodes.length == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择节点再进行操作',time:3});
			return;
		}
		
		$.ajax({
		    url:$.appClient.generateUrl({ESClassification:'add',pid:treeNode.id},'x'),
		    success:function(data){
		      dia1 = $.dialog({
			    	title:'添加面板',
		    	   	fixed:true,
		    	    resize: false,
			    	content:data,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    ok:function()
			    	{   var flag= $('#addform').validate();
				    	var classnum=$('#addform input[name=classnum]').val();
				    	var classify=$('#addform input[name=classify]').val();
				       	if(flag==false||validate($('#addform'))==false){
				    		return false;
				    	}
				    	var zTree = $.fn.zTree.getZTreeObj("fication");
				    	nodes = zTree.getSelectedNodes();
				    	treeNode = nodes[0];
				    	var pid ="";
				    		pid=treeNode.id;
				    	var url=$.appClient.generateUrl({ESClassification:'check'},'x');
				    	$.post(url,{classnum:classnum,classify:classify,pid:pid,id:0},function(result){
				    		var res = eval("("+result+")");
				    		if(!res['checkcode']&&!res['checkname']){
				    			dopreate();
				    		}else{
				    			if(res['checkcode']){
				    				$.dialog.notice({icon:'error',content:'分类号有重复',time:3});
				    				return false;
				    			}
				    			if(res['checkname']){
				    				$.dialog.notice({icon:'error',content:'分类名称有重复',time:3});
				    				return false;
				    			}
				    		}
				    	});
				    	return false;
				    },
		    		init:function(){
		    		  $('#addform').autovalidate();
		    		}
				    	
			    });
		    	
			    },
			    cache:false
		});
	});
	
	function dopreate(){
		var form=$('#addform');
		$("#type").removeAttr("disabled"); 
		var data=form.serialize();
		var zTree = $.fn.zTree.getZTreeObj("fication");
		nodes = zTree.getSelectedNodes();
		treeNode = nodes[0];
		var pid ="";
			pid=treeNode.id;
		$.post($.appClient.generateUrl({ESClassification:'addval'},'x'),{pid:pid,param:data},function(datas){
			if(datas==1){
				if(treeNode.isParent==true){
					zTree.reAsyncChildNodes(treeNode,"refresh");
				}else{
					zTree.reAsyncChildNodes(treeNode.getParentNode(),"refresh");
				}
				$.dialog.notice({icon:'succeed',content:'添加成功',time:3});
				dia1.close();
				
			}else{
				$.dialog.notice({icon:'error',content:'添加失败',time:3});
			}
			
		});
	}
	
	//编辑节点
	$(".edit").click(function(){
		var zTree = $.fn.zTree.getZTreeObj("fication");
		nodes = zTree.getSelectedNodes();
		treeNode = nodes[0];
		if (nodes.length == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择节点再进行操作',time:2});
			return;
		}
		if(treeNode.id==0){
			$.dialog.notice({icon:'warning',content:'根节点不允许编辑',time:2});
			return;
		}
	  $.ajax({
		    url:$.appClient.generateUrl({ESClassification:'edit',id:treeNode.id},'x'),
		    success:function(data){
		    dia2=$.dialog({
			    	title:'编辑面板',
		    	   	fixed:true,
		    	    resize: false,
			    	content:data,
			    	okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
				    ok:function()
			    	{   var classnum=$('#editform input[name=classnum]').val();
			    	    var classify=$('#editform input[name=classify]').val();
				    	var flag= $('#editform').validate();
				       	if(flag==false||validate($('#editform'))==false){
				    		return false;
				    	}
				    	var zTree = $.fn.zTree.getZTreeObj("fication");
				    	nodes = zTree.getSelectedNodes();
				    	treeNode = nodes[0];
				    	var pid ="";
				    		pid=treeNode.id;
				    	var url=$.appClient.generateUrl({ESClassification:'check'},'x');
				    	$.post(url,{classnum:classnum,classify:classify,pid:treeNode.getParentNode().id,id:treeNode.id},function(result){
				    		var res = eval("("+result+")");
				    		if(res['checkcode']||res['checkname']){
				    			if(res['checkcode']){
				    				$.dialog.notice({icon:'error',content:'分类号有重复',time:3});
				    				return false;
				    			}
				    			if(res['checkname']){
				    				$.dialog.notice({icon:'error',content:'分类名称有重复',time:3});
				    				return false;
				    			}
				    		}else{
				    			doeditnext();
				    		}
				    		
				    	});
				    	return false;
			    	},
		    		init:function(){
			    		  $('#editform').autovalidate();
			    	}
			    	
			    });
		    	
			    },
			    cache:false
		});

	});
	function validate(obj){
		var invalidate=true;
		$(obj).each(function(j){
			var len=this.elements.length;
			for(var i=0;i<len;i++){
				var e=this.elements[i];
				var $e = $(e);
				if (e.type != "text" && e.type!="password" && e.type!='select-one' && e.type!='textarea') continue;
				if($e.hasClass("warnning")){
					if(invalidate) e.focus();
					invalidate = invalidate && false;
				}
			}
		});
		return invalidate;
	}
	function doeditnext(){
		var form=$('#editform');
		$("#type").removeAttr("disabled"); 
		var data=form.serialize();
		var url = $.appClient.generateUrl({ESClassification:'edval'},'x');
		var zTree = $.fn.zTree.getZTreeObj("fication");
		nodes = zTree.getSelectedNodes();
		treeNode = nodes[0];
		$.post(url,{id:treeNode.id,param:data},function(datas){
			if(datas==1){
				zTree.reAsyncChildNodes(treeNode.getParentNode(),"refresh");
				$.dialog.notice({icon:'succeed',content:'操作成功',time:3});
				dia2.close();
			}else{
				$.dialog.notice({icon:'error',content:'操作失败',time:3});
			}
		});

	}
//删除
	$(".remove").click(function(){
		var zTree = $.fn.zTree.getZTreeObj("fication");
		nodes = zTree.getSelectedNodes();
		treeNode = nodes[0];
		if (nodes.length == 0) {
			$.dialog.notice({icon:'warning',content:'请先选择节点再进行操作',time:3});
			return;
		}
		if(treeNode.id==0){
			$.dialog.notice({icon:'warning',content:'根节点不允许删除',time:2});
			return;
		}
		$.dialog({
			icon:'warning',
			content : treeNode.isParent?'您确定要删除此分类以及下级分类吗？':'您确定要删除此分类吗？',
			okVal : '确定',
			ok : true,
			cancelVal : '关闭',
			cancel : true,
			ok : function() {
				$.post($.appClient.generateUrl({ESClassification:'del'},'x'),{id:treeNode.id},function(datas){
					if(datas){
						var redreshNode = treeNode.getParentNode().getParentNode();
						if(null == treeNode.getParentNode().getParentNode() || treeNode.getParentNode().getParentNode() == "undefined"){
							redreshNode = treeNode.getParentNode();
						}
						$.dialog.notice({icon:'succeed',content:'操作成功',time:3});
						zTree.reAsyncChildNodes(redreshNode,"refresh");
					}else{
						$.dialog.notice({icon:'error',content:'操作失败',time:3});
					}
				});
			}
		});
	
	});
		
});

	

	
