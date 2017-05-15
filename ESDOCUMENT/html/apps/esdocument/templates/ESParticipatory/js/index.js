/**
* 参建单位模块脚本 dengguoqi 20141021
*/
$(document).ready(function(){	
	var colModel= [
	       		{display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
	   			{display: '序号', name : 'num', width : 20, align: 'center'}, 
				{display: '<input type="checkbox" name="paths">', name : 'ids', width : 20, align: 'center'},
				{display: '操作', name : 'operate', width : 60, align: 'center'},
				{display: '名称', name : 'name', width : 220, align: 'left'},
				{display: '代码', name : 'code', width : 120, align: 'left'},
				{display: '类型', name : 'type', width : 120, align: 'left'},
				{display: '文控人员', name : 'user_id', width : 260, align: 'left'}
			];
	var colModelMember= [
		   			{display: '序号', name : 'num', width : 20, align: 'center'}, 
					{display: '<input type="checkbox" name="conPaths">', name : 'ids', width : 20, align: 'center'},
					{display: '操作', name : 'operate', width : 60, align: 'center'},
					{display: '用户名', name : 'userid', width : 200, align: 'left'},
					{display: '姓名', name : 'name', width : 200, align: 'left'},
					{display: '邮箱', name : 'emailAddress', width : 220, align: 'left'},
					{display: '手机', name : 'mobtel', width : 180, align: 'left'},
					{display: '职位', name : 'office', width : 100, align: 'center'}
				];
	var exchangeStatus=1;
	var setting = {
		view: {
			dblClickExpand: true,
			showLine: true
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
		$("#level").val(treeNode.level);//
		$("#treeName").val(treeNode.name);//
		$("#condition").val("");//清空筛选条件
		var url=$.appClient.generateUrl({ESParticipatory: 'findPartList',id:treeNode.id}, 'x');
		if(treeNode.level>1 && !treeNode.isParent){						
			url=$.appClient.generateUrl({ESParticipatory: 'findPartMemberList',id:treeNode.id}, 'x');
			if(exchangeStatus==1){
				$("#eslist").html('<table id="esStageList"></table>');
			}
			exchangeStatus=2;
			loadPage(url,colModelMember);
			$("#addMember").show();
			$("#filterMember").hide();
		}else{						
			if(exchangeStatus==2){
				$("#eslist").html('<table id="esStageList"></table>');
			}
			exchangeStatus=1;
			loadPage(url,colModel);
			$("#addMember").hide();
			$("#filterMember").show();
		}				
	}

	// 获取参建单位树目录
	flushTree();
	$("#selTreeId").val(0);//默认选择根节点
	
	// 创建参建单位或部门表格
	loadPage($.appClient.generateUrl({ESParticipatory: 'findPartList',id:"0"}, 'x'),colModel);
	
	function loadPage(url,cm){				
		$("#esStageList").flexigrid({
			url: url,
			dataType: 'json',
			colModel :cm,
			buttons : [{name: '添加', bclass: 'add', onpress:function(){add();}},
				{name: '删除', bclass: 'delete', onpress:function(){del();}},
				{name: '添加用户', bclass: 'group',id:'addMember',onpress:function(){addMember();}},
				{name: '筛选', bclass: 'filter',id:'filterMember',onpress:function(){filter();}},
				{name: '还原数据', bclass: 'back', onpress:function(){back();}}
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
			procmsg:'正在加载数据，请稍候...',
			onSuccess:function(){
				if($("#selTreeId").val()==0){
					$("#addMember").hide();						
				}	
			}
		});
		$("#esStageList").flexOptions({newp:1,url:url}).flexReload();
	}
	
	$("#addMember").hide();//默认隐藏添加用户按钮
	
	//编辑事件
	$(".editbtn").die().live("click", function(){
		edit($(this).closest("tr").prop("id").substr(3),$(this).attr("pId"));
	});
	//编辑事件
	$(".editMember").die().live("click", function(){
		editMember($(this).attr("id"));
	});

	//全选
	$("input[name='paths']:checkbox").die().live("click",function(){
		$("#esStageList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	//添加筛选行
	$('.newfilter').die().live('click',function (){
		  var t =   $(this).parent().clone().insertAfter($(this).parent());
			t.each(function(){
				$(this).find('input').val('').attr("readonly",false);
				$(this).find('span').remove();
			});
		});

	//删除筛选行
	$('.delfilter').die().live('click',function (){
			if($('#contents p').length > 5){
				$(this).closest('p').remove();
			}else{
				var tds = $(this).closest('p');
				tds.find('input').val('').attr("readonly",false);
				tds.find('span').remove();
				var select = tds.find('select');
				$(select[0]).val("");
				$(select[1]).val("like");
				$(select[2]).val("AND");
			}
	});
	
	//选择文控人员
	$(".findControler").die().live("click",function(){
		findControler($(this));
	});
	
	//删除文控人员
	$(".delControler").die().live("click",function(){
		$(this).parent("td").children("br").remove();
		$(this).next().remove();
		$(this).remove();
		var val=$(".delControler");
		for(var i=0;i<val.length;i++){
			if(i%2!=0){
				$(val[i]).next().after("<br/>");
			}
		}
	});
	
	//更新树
	function flushTree(){
		// 获取参建单位树目录
		$.getJSON($.appClient.generateUrl({ESParticipatory : "getTree"}, 'x'), function(zNodes) {
			$.fn.zTree.init($("#esStageTree"), setting, zNodes);
			var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
			var root = treeObj.getNodeByParam("id",0);
			root.open = true;
			treeObj.selectNode(root);
			$("#selTreeId").val(root.id);
		});
	}
	
	//筛选选择文控人员
	$("#filterContents .filedname").die().live('change',function(){
		var sel=$(this).val();
		var val=$(this).parent().children("input[type='text']");
		if(sel=="user_id"){
			val.attr('readonly',true);
			val.after('<span class="hei20" style="float:left; margin:7px 0px 0px -30px; border: 0px;"><img title="单击我,选择文控人员" src="'+$("#filterContents").attr("tplPath")+'/ESParticipatory/images/group.png"/></span>');
			val.next("span").click(function(){
				filterControler(val);
	 		});
		}else{
			val.attr('readonly',false);
			val.val("");
			val.next("span").remove();
			val.unbind("click");
		}
	});
	
	//添加参建单位或部门
	function add(){
		var selTreeId=$("#selTreeId").val();
		var level=$("#level").val();
		if(selTreeId==""){
			selTreeId="0";
		}
		if(level == "") level = '0';
		$.ajax({//判断是否存在用户
			type:'POST',
			url:$.appClient.generateUrl({ESParticipatory:'isExistUsers'},'x'),
			data:{partId:selTreeId},
			async:false,
		    success:function(data){
		    	if(data=='0'){
		    		$.ajax({
		    		    url:$.appClient.generateUrl({ESParticipatory:'add'},'x'),
		    		    success:function(data){
		    		    	dia2 = $.dialog({
		    			    	title:'添加参建单位或部门',
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
		    				    	initPartPage(selTreeId);
		    				    	$("#addParticipatoryForm").autovalidate();
		    				    },
		    			    	ok:function(){ 
		    			    		if(!$("#addParticipatoryForm").validate()){
		    			    			return false;
		    			    		}
		    			    		var partName=$("#name").val();
		    			    		var partCode=$("#code").val().toUpperCase();
		    			    		var partType=$("input[name='partType']:checked").next().html();
		    			    		if(!uniqueName($("#name"),"",selTreeId,level)){
		    			    			return false;
		    			    		}
		    			    		if(!uniqueCode($("#code"),"")){
		    			    			return false;
		    			    		}
		    			    		var controler="";
		    			    		$(".delControler").each(function(){
		    			    			controler+=$(this).html()+",";
		    			    		});
		    			    		if(controler==""){
		    			    			$.dialog.notice({icon:"warning",content:"至少选择一个文控人员",time:3});
		    							return false;
		    			    		}
		    			    		var addParam={selTreeId:selTreeId,level:level,partName:partName,partCode:partCode,partType:partType,controler:controler.substring(0, controler.length-1)};
		    			    		confirmAdd(addParam);//确定修改流程
		    					},cancel:function(){
		    					}
		    			    });
		    		    },
		    		    cache:false
		    		});
		    	}else{
		    		$.dialog.notice({icon:"warning",content:"该部门下已存在用户，不能添加部门！",time:3});
		    		return false;
		    	}
		    }
		});
		
	}
	
	//初始化单位部门类型
	function initPartPage(selTreeId){
		if(selTreeId=="0"){
    		$("input[name='partType']").each(function(){
    			if($(this).attr("id").indexOf("partTypeUnits")==0){
    				$(this).show();
    				$(this).next().show();
    			}else{
    				$(this).hide();
    				$(this).next().hide();
    			}
    		});
    	}else{
    		$("input[name='partType']").each(function(){
    			if($(this).attr("id").indexOf("partTypeUnits")==0){
    				$(this).hide();
    				$(this).next().hide();
    			}else{
    				$(this).show();
    				$(this).next().show();
    			}
    		});
    		$("input[name='partType']:visible").first().attr("checked","checked");
    	}
	}
	
	//确认添加流类型
	function confirmAdd(addParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'confirmAdd'},'x'),
		    data:addParam,
		    success:function(data){
		    	if(data){
					//提示添加成功
		    		$.dialog.notice({icon:"success",content:"添加参建单位或部门成功",time:3});
		    		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		    		var nodes = treeObj.getSelectedNodes();
		    		var url=$.appClient.generateUrl({ESParticipatory: 'findPartList',id:nodes[0].id}, 'x');
		    		$("#esStageList").flexOptions({query:'',url:url}).flexReload();
		    		if(nodes && nodes.length > 0){
		    			var child = jQuery.parseJSON(data);
		    			treeObj.addNodes(nodes[0], child);
		    		}
				}else{
					//提示添加失败
					$.dialog.notice({icon:"error",content:"添加参建单位或部门失败",time:3});
					return false;
				}
		    },
		    cache:false
		});
	}

	//编辑选择的参建单位或部门
	function edit(id,pId){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'edit'},'x'),
		    data:{id:id},
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'编辑参建单位或部门',
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
				    	initPartPage(pId);
				    	$("#editParticipatoryForm").autovalidate();
				    },
			    	ok:function(){ 
			    		if(!$("#editParticipatoryForm").validate()){
			    			return false;
			    		}
			    		//验证修改参数
			    		var partName=$("#name").val();
			    		var partCode=$("#code").val().toUpperCase();
			    		var partType=$("input[name='partType']:checked").next().html();
			    		var level = $("#level").val();
			    		var newlevel = parseInt($("#level").val())-1;//用于验证名称是否重复
			    		if(!uniqueName($("#name"),$("#oldName").val(),pId,newlevel)){
			    			return false;
			    		}
			    		if(!uniqueCode($("#code"),$("#oldCode").val().toUpperCase())){
			    			return false;
			    		}			    		
		    			var controler="";
			    		$(".delControler").each(function(){
			    			controler+=$(this).html()+",";
			    		});
			    		if(controler==""){
			    			$.dialog.notice({icon:"warning",content:"至少选择一个文控人员",time:3});
							return false;
			    		}
			    		var editParam={id:id,pid:pId,partName:partName,partCode:partCode,partType:partType,level:level,controler:controler.substring(0, controler.length-1)};			    	
		    			confirmEdit(editParam);//确定修改流程
					},cancel:function(){
						//关闭修改窗口
					}
			    });
		    },
		    cache:false
		});
	}
	//编辑选择的参建单位或部门
	function editMember(id){
		var partName=$("#treeName").val();
		$.ajax({
			type:'POST',
			url:$.appClient.generateUrl({ESParticipatory:'editMember'},'x'),
			data:{id:id,partName:partName},
			success:function(data){
				dia2 = $.dialog({
					title:'编辑员工',
					width: '500px',
					fixed:true,
					resize: false,
					padding:0,
					content:data,
					cancelVal: '关闭',
					cancel: true,
					okVal:'确认修改',
					ok:true,
					ok:function(){ 
					var updateParam = $("#editMemberForm").serialize();
					//验证修改参数
					$.ajax({
						type:"POST",
						url:$.appClient.generateUrl({ESParticipatory:'confirmEditMember'},'x'),
						data:updateParam,
						success:function(msg){
						if(msg=="success"){
							$.dialog.notice({icon:"success",content:"修改成功！",time:3});
							$("#esStageList").flexReload();
			    			}else{
			    			$.dialog.notice({icon:"error",content:msg,time:3});
			    			}
						}
					});
					},cancel:function(){
						//关闭修改窗口
					}
				});
			},
			cache:false
		});
	}

	//单位部门代码唯一验证
	function uniqueName(name,oldName,pId,level){
		var flag=true;
		var partName=name.val();
		if(partName!=oldName){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESParticipatory:'uniqueName'},'x'),
				data:{name:partName,pId:pId,level:level},
				async:false,//同步设置
				success:function(data){
					if(data=="false"){
						name.addClass("invalid-text");
						name.attr('title',"此单位部门名称已存在");
	    				flag=false;
	    				return false;
	    			}
					name.removeClass("invalid-text");
					name.attr('title',"");
				}
			});
		}
		return flag;
	}
	
	//单位部门代码唯一验证
	function uniqueCode(code,oldCode){
		var flag=true;
		var partCode=code.val().toUpperCase();
		if(partCode!=oldCode){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESParticipatory:'uniqueCode'},'x'),
				data:{code:partCode},
				async:false,//同步设置
				success:function(data){
					if(data>0){
						code.addClass("invalid-text");
						code.attr('title',"此单位部门代码已存在");
	    				flag=false;
	    				return false;
	    			}
					code.removeClass("invalid-text");
					code.attr('title',"");
				}
			});
		}
		return flag;
	}
	
	//确认修改流类型
	function confirmEdit(editParam){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'confirmEdit'},'x'),
		    data:editParam,
		    success:function(data){
		    	if(data){
		    		//提示修改失败
					$.dialog.notice({icon:"error",content:data,time:3});
					return false;
				}else{
					//提示修改成功
		    		$.dialog.notice({icon:"success",content:"修改参建单位或部门成功",time:3});
		    		// 获取参建单位树目录
		    		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		    		var pNode=treeObj.getSelectedNodes();
	    			var node=treeObj.getNodeByParam("id",editParam.id,pNode[0]);
	    			node.name=editParam.partName;
	    			treeObj.updateNode(node);
		    		$("#esStageList").flexReload();
				}
		    },
		    cache:false
		});
	}
	
	// 删除选择的参建单位或部门     
	function del(){
		var checks=$("#esStageList").find("input[type='checkbox']:checked");
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		var pNode=treeObj.getSelectedNodes();
		var flag=false;
		if(pNode[0].level>1 && !pNode[0].isParent){
			flag=true;
		}
		if(checks.length > 0){			
    		if(flag){//删除部门员工
    			$.dialog({
			    	title:'删除部门员工',
					width: '300px',
				   	fixed:true,
				    resize: false,
				    padding:0,
			    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要删除所选的部门员工吗？</div>",
				    cancelVal: '取消',
				    cancel: true,
				    okVal:'确定',
				    ok:true,
			    	ok:function(){ 
			    		var ids = [];
			    		checks.each(function(){
			    			var id = $(this).closest("tr").prop("id").substr(3);
			    			ids.push(id);		    			
			    		}); 
			    		confirmDelMember(pNode[0].id,ids);//确定删除部门员工
					},cancel:function(){
					}
			    });
    		}else{//删除参建单位部门
				$.dialog({
			    	title:'删除参建单位或部门',
					width: '300px',
				   	fixed:true,
				    resize: false,
				    padding:0,
			    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要删除所选的参建单位或部门吗？</div>",
				    cancelVal: '取消',
				    cancel: true,
				    okVal:'确定',
				    ok:true,
			    	ok:function(){ 
			    		var ids = [];
			    		checks.each(function(){
			    			var id = $(this).closest("tr").prop("id").substr(3);
			    			ids.push(id);		    			
			    			var node = treeObj.getNodeByParam("id",id,pNode[0]);
			    			ids=getChildren(ids,node);
			    		}); 
			    		confirmDel(ids);//确定要删除参建单位部门
					},cancel:function(){
					}
			    });
    		}
		}else{
			if(flag){
				$.dialog.notice({icon:"warning",content:"请选择要删除的部门员工",time:3});
			}else{
				$.dialog.notice({icon:"warning",content:"请选择要删除的参建单位或部门",time:3});
			}
			return false;
		}
	}
	
	//确定删除部门员工
	function confirmDelMember(partId,ids){
		var url=$.appClient.generateUrl({ESParticipatory:'confirmDelMember'},'x');
		$.post(url,{partId:partId,ids:ids},function(res){
			if(res){
	    		//提示删除失败
	    		$.dialog.notice({icon:"error",content:data,time:3});
	    		return false;
	    	}else{
	    		//提示删除成功
	    		$.dialog.notice({icon:"success",content:"删除选择的部门员工成功",time:3});
	    		$("#esStageList").flexReload();
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
	
	//确认删除
	function confirmDel(ids){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'confirmDel'},'x'),
		    data:{ids:ids},
		    success:function(data){
		    	if(data){
		    		//提示删除失败
		    		$.dialog.notice({icon:"error",content:data,time:3});
		    		return false;
		    	}else{
		    		//提示删除成功
		    		$.dialog.notice({icon:"success",content:"删除选择的参建单位或部门成功",time:3});
		    		// 获取参建单位树目录
		    		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		    		var pNode=treeObj.getSelectedNodes();
		    		for(var i=0;i<ids.length;i++){
		    			var node=treeObj.getNodeByParam("id",ids[i],pNode[0]);
		    			treeObj.removeNode(node);
		    		}
		    		$("#esStageList").flexReload();
		    	}
		    },
		    cache:false
		});
	}

	// 筛选参建单位或部门
	function filter(){
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		var pNode=treeObj.getSelectedNodes();
		var flag=1;
		if(pNode[0].level>1 && !pNode[0].isParent){
			flag=2;
		}
		$.ajax({
		    url:$.appClient.generateUrl({ESParticipatory:'filter',flag:flag},'x'),
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
			    		if(selTreeId==""){
			    			seleTreeId="1";
			    		}
			    		var condition=getFilterCondition();//获取筛选条件
			    		$("#condition").val(condition);//保存筛选条件
			    		var url=$.appClient.generateUrl({ESParticipatory:'findPartList',id:selTreeId},'x');
			    		$("#esStageList").flexOptions({newp: 1, query: condition, url: url}).flexReload();
					},cancel:function(){
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
			var field=$(sels[0]).val();
			if(field!="" && inp!=""){
				var compare=$(sels[1]).val();
				if(field=="office"){
					if(compare=="equal" || compare=="like"){
						compare="equal";
					}else{
						compare="notEqual";
					}
				}
				var relation ='false';
				if ($(sels[3]).val() == "AND") {
					relation = 'true';
				}
				condition.push(field+","+compare+","+inp+","+relation);
			}
		});
		$where.condition=condition;
		return $where;
	}
	
	// 还原数据
	function back(){
		var id=$("#selTreeId").val();
		if(id==""){
			id="1";
		}
		$("#condition").val("");//清空筛选条件
		var url=$.appClient.generateUrl({ESParticipatory: 'findPartList',id:id}, 'x');
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		var nodes = treeObj.getSelectedNodes();
		if(nodes[0].level>1 && !nodes[0].isParent){
			url=$.appClient.generateUrl({ESParticipatory: 'findPartMemberList',id:id}, 'x');
		}
		$("#esStageList").flexOptions({newp:1,query:'',url:url}).flexReload();
	}

	//选择文控人员页面
	function findControler(control){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'controler'},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'选择文控人员',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确定',
				    ok:true,
				    init:function(){
				    	loadControler();//加载文控人员
				    },
			    	ok:function(){ 
			    		var checks=$("#esConList").find("input[type='checkbox']:checked");
			    		if(checks.length > 0){
				    		checks.each(function(){
				    			var userid=$(this).closest("tr").children("td[colname='userid']").children("div").html();
				    			var flag=true;
				    			$(control).prevAll(".button").each(function(){
				    				if($(this).html()==userid){
				    					flag=false;
				    				}
				    			});
				    			if(flag){
				    				var n=$(control).prevAll(".delControler").length;
					    			var tplPath=$("#tplPath").val();
					    			$(control).before('<span class="button delControler" style="padding-right:22px;background:#6F6E81 url('+tplPath+'/public/flexigrid/css/images/close.png) no-repeat right;">'+userid+'</span><span>&nbsp;&nbsp;&nbsp;</span>'+((n%2!=0)?'<br/>':''));
				    			}
				    		}); 
			    		}else{
			    			$.dialog.notice({icon:"warning",content:"请选择控制人员",time:3});
			    			return false;
			    		}
					},cancel:function(){
					}
			    });
		    },
		    cache:false
		});
	}

	//加载文控人员
	function loadControler(){
		$("#esConList").flexigrid({
			url: $.appClient.generateUrl({ESParticipatory: 'findControlerList'}, 'x'),
			dataType: 'json',
			colModel : [
				{display: '序号', name : 'num', width : 20, align: 'center'}, 
				{display: '<input type="checkbox" name="conPaths">', name : 'ids', width : 20, align: 'center'},
				{display: '用户名', name : 'userid', width : 180, align: 'left'},
				{display: '姓名', name : 'name', width : 180, align: 'left'},
				{display: '邮箱', name : 'emailAddress', width : 180, align: 'left'},
				{display: '手机', name : 'mobtel', width : 150, align: 'left'}
			],
			usepager: true,
			title: '&nbsp;',
			nomsg:"没有数据",
			useRp: true,
			width: 800,
			height: 288,
			showTableToggleBtn: false,
			pagetext: '第',
			itemtext: '页',
			outof: '页 /共',
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
			procmsg:'正在加载数据，请稍候...'
		});
		
		//全选
		$("input[name='conPaths']:checkbox").die().live("click",function(){
			$("#esConList").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
		});
	}
	
	//筛选选择文控人员
	function filterControler(val){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'controler'},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'选择文控人员',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确定',
				    ok:true,
				    init:function(){
				    	loadControler();//加载文控人员
				    },
			    	ok:function(){ 
			    		var checks=$("#esConList").find("input[type='checkbox']:checked");
			    		if(checks.length == 1){
			    			var name=checks.closest("tr").children("td[colname='userid']").children("div").html();
							val.val(name);
			    		}else{
			    			$.dialog.notice({icon:"warning",content:"只能选择单个文控人员",time:3});
			    			return false;
			    		}
					},cancel:function(){
					}
			    });
		    },
		    cache:false
		});
	}
	
	//添加员工
	function addMember(){
		var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
		var nodes = treeObj.getSelectedNodes();
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'addMember'},'x'),
		    data:{partId:nodes[0].id,partName:nodes[0].name},
			success:function(data){
		    	dia2 = $.dialog({
			    	title:'添加部门员工',
		    		width: '500px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确定',
				    ok:true, init:function(){
				    	$("#addMemberForm").autovalidate();
				    	$("#userName").next("span").click(function(){
				    		findMember();
				 		});
				    },
			    	ok:function(){ 
			    		if(!$("#addMemberForm").validate()){
			    			return false;
			    		}
			    		var office=$("input[name='officeType']:checked").val();
			    		confirmAddMember($("#partId").val(),$("#userId").val(),office);
					},cancel:function(){
					}
			    });
		    },
		    cache:false
		});
	}
	
	//确定添加员工
	function confirmAddMember(partId,userId,office){
		var url=$.appClient.generateUrl({ESParticipatory:'confirmAddMember'},'x');
		$.post(url,{partId:partId,userId:userId,office:office},function(res){
			if(res){
				$.dialog.notice({icon:"error",content:res,time:3});
    			return false;
			}else{
				$.dialog.notice({icon:"success",content:"添加员工成功",time:3});
				$("#esStageList").flexReload();
			}
		});
	}
	
	//添加部门用户
	function findMember(){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESParticipatory:'controler'},'x'),
		    success:function(data){
		    	dia2 = $.dialog({
			    	title:'选择文控人员',
		    		width: '800px',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true,
				    okVal:'确定',
				    ok:true,
				    init:function(){
				    	loadControler();//加载文控人员
				    },
			    	ok:function(){ 
			    		var checks=$("#esConList").find("input[type='checkbox']:checked");
			    		if(checks.length == 0){
			    			$.dialog.notice({icon:"warning",content:"请选择要添加的员工",time:3});
			    			return false;
			    		}
			    		if(checks.length == 1){
				    		var userId=$(checks[0]).closest("tr").prop("id").substr(3);	
				    		var name=$(checks[0]).closest("tr").children("td[colname='name']").children("div").html();
				    		$("#userId").val(userId);
				    		$("#userName").val(name);
				    		$("#userName").removeClass("invalid-text").attr('title',"");
			    		}else{
			    			$.dialog.notice({icon:"warning",content:"一次只能添加一个员工",time:3});
			    			return false;
			    		}
					},cancel:function(){
					}
			    });
		    },
		    cache:false
		});
	}
});