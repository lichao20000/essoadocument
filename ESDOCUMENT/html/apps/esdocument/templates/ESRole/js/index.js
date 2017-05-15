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
	$("#roleGrid").flexigrid({url :$.appClient.generateUrl({ESRole: 'findRoleList'}, 'x'),
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
		},{
			display : '菜单',
			name : 'menus',
			width : 30,
			sortable : true,
			align : 'center'
				
		},{
			display : '目录',
			name : 'dirs',
			width : 30,
			sortable : true,
			align : 'center'
				
		},{
			display : '数据',
			name : 'datas',
			width : 30,
			sortable : true,
			align : 'center'
		},{
			display : '借阅权限',
			name : 'lends',
			width : 60,
			sortable : true,
			align : 'center'
		},{
			display : '角色标识',
			name : 'roleId',
			metadata:'roleId',
			width : 100,
			align : 'left'
		},{
			display : '角色名称',
			name : 'roleName',
			metadata:'roleName',
			width : 100,
			align : 'left'
		},{
			display : '创建时间',
			name : 'createTime',
			metadata:'createTime',
			width : 150,
			align : 'center'
		},{
			display : '修改时间',
			name : 'updateTime',
			metadata:'updateTime',
			width : 150,
			align : 'center'
		},{
			display : '系统角色',
			name : 'isSystem',
			metadata:'isSystem',
			width : 60,
			align : 'center'
		},{
			display : '描述',
			name : 'roleRemark',
			metadata:'roleRemark',
			width : 300,
			align : 'left'
		}],
		buttons : [ {
			name : '添加',
			bclass : 'add',
			onpress : add_role
		},{
			name : '删除',
			bclass : 'delete',
			onpress : delete_role
		},{
			name : '筛选',
			bclass : 'filter',
			onpress :filter
		},{
			name : '还原数据',
			bclass : 'back',
			onpress :back
		},{
			name : '用户授权',
			bclass : 'refresh',
			onpress :userToRoles
		}],
		singleSelect:true,
		usepager : true,
		title : '角色管理',
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
		var flex = $("#roleGrid").closest("div.flexigrid");
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
	function userToRoles(){
		$.ajax({
	        url : $.appClient.generateUrl({ESRole : 'listUsers'},'x'),
		    success:function(data){
			    	$.dialog({
				    	title:'角色分配',
				    	modal:true, // 蒙层（弹出会影响页面大小）
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
				    	//okVal:'保存',
					    //ok:true,
					    cancelVal: '关闭',
					    padding:0,
					    cancel: true,
					    content:data,
					    ok:function()
				    	{	
						 
					    },
						init: function(){
							
						}
				    });
			    },
			    cache:false
		});
	}
	// 添加角色
	function add_role(){
		$.ajax({
		        url : $.appClient.generateUrl({ESRole : 'add_role'},'x'),
			    success:function(data){
				    	$.dialog({
					    	title:'添加角色',
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
						    	var roleData = $("#addRole").serialize(); 
						    	var url = $.appClient.generateUrl({ESRole : 'addRole'}, 'x');
						    	if($("#addRole input[name='roleId']").hasClass("warnning")||$("#addRole input[name='roleName']").hasClass("warnning")){
						    		return false;
						    	}else if(judgeSummit($("#addRole"))==false){
						    		return false;
						    	}else{
						    		if(!$('#addRole').validate()){return false;}
							    	$.post(url,{data : roleData}, function(msg){
				        				if (msg =="success") {
				        					$.dialog.notice({icon : 'succeed',content : '添加成功',title : '3秒后自动关闭',time : 3});
				        					$("#roleGrid").flexReload();
				        					return;
				        				} else {
				        					$.dialog.notice({icon : 'error',content : msg,title : '3秒后自动关闭',time : 3});
				        					$("#roleGrid").flexReload();
				        					return;
				        				}
				        			});
							    }
						    },
							init: function(){
								$('#addRole').autovalidate();
							}
					    });
				    },
				    cache:false
			});
     } 
	 // 编辑绑定时间
	 $('#roleGrid .editbtn').live("click",function(){
		    var id = "";
		    id = $(this).attr('id');
			$.ajax({
				type:'post',
			    data:{id:id},
		        url : $.appClient.generateUrl({ESRole : 'edit_role'},'x'),
			    success:function(data){
				    	$.dialog({
					    	title:'编辑角色',
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
						    padding:0,
						    content:data,
						    ok:function()
					    	{  
						    if(!$('#editRole').validate()){return false;}
					    	var url = $.appClient.generateUrl({ESRole : 'editRole'}, 'x');
					    	var roleData = $("#editRole").serialize();
					       if($("#editRole input[name='roleId']").hasClass("warnning")||$("#editRole input[name='roleName']").hasClass("warnning")){
					    		return false;
					    	}else if(judgeSummit($("#editRole"))==false){
					    		return false;
					    	}
					        else{
					    		$.post(url,{data : roleData}, function(msg){
					    			if (msg == "success") {
					    				$.dialog.notice({icon : 'succeed',content : '修改成功',title : '3秒后自动关闭',time : 3});
					    				$("#roleGrid").flexReload();
					    				return;
					    			} else {
					    				$.dialog.notice({icon : 'error',content : msg ,title : '3秒后自动关闭',time : 3});
					    				return;
					    			}
					    		});
						    }
						 },
							init: function(){
								$('#editRole').autovalidate();
							}
					    });
				    },
				    cache:false
			});
	 });
	 
	 function judgeSummit(obj){
			var flag=true;
			var id=$("input[name='id']",obj).val();
			var roleName = $("input[name='roleName']",obj).val();
			var roleId = $("input[name='roleId']",obj).val()
			$.ajax({ 
		        type : "post", 
		        url : $.appClient.generateUrl({ESRole : 'judgeIfExistsRoleName'},'x'), 
		        data : {id:id,roleName:roleName}, 
		        async : false, 
		        success : function(data){ 
		        	if(data=='true') {
		        		flag=false;
		        		$("input[name='roleName']",obj).addClass("warnning");
		        		$("input[name='roleName']",obj).attr("title","角色名称为["+roleName+"]的角色已存在");
		        		$.dialog.notice({icon : 'succeed',content : '角色名称已经存在',title : '3秒后自动关闭',time : 3});
		        	}else{
		        		$("input[name='roleName']",obj).removeClass("warnning");
		        		flag=true;
		        	}
		          } 
		        }); 
			if(flag){
				$.ajax({ 
			        type : "post", 
			        url : $.appClient.generateUrl({ESRole : 'judgeIfExistsRoleId'},'x'), 
			        data : {id:id,roleId:roleId}, 
			        async : false, 
			        success : function(data){ 
			        	if(data=='true') {
			        		flag=false;
			        		$("input[name='roleId']",obj).addClass("warnning");
			        		$("input[name='roleId']",obj).attr("title","角色标识为["+roleId+"]的角色已存在");
			        		$.dialog.notice({icon : 'succeed',content : '角色标识已经存在',title : '3秒后自动关闭',time : 3});
			        	}else{
			        		$("input[name='roleId']",obj).removeClass("warnning");
			        		flag=true;
			        	}
			          } 
			        }); 
			}
			return flag;
		}
     // 删除角色
	function delete_role(){
		var checkboxlength = $('#roleGrid input:checked').length;
		if (checkboxlength == 0) {
			$.dialog.notice({icon : 'warning',content : '请选择要删除的数据！',time : 3});
			return;
		}
		var idStr = '';
		var hasSystemRole = false ;
		$('#roleGrid input:checked').each(function(i) {
			if('1' == $(this).attr('isSystem')){
				hasSystemRole = true ;
			}
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
					var url = $.appClient.generateUrl({ESRole : 'batchDelete'}, 'x');
					$.post(url, {idStr : idStr}, function(msg) {
						if(msg=='success'){
							$.dialog.notice({
								icon : 'succeed',
								content :'删除成功！',
								time : 3
							});
							$("#roleGrid").flexReload();
							return;
						}else{
							$.dialog.notice({icon : 'warning',
								content :msg,
								time : 3
							});
							$("#roleGrid").flexReload();
							return;
						}
				});
			}
		});
	}
	// 筛选参建单位或部门
	function filter(){
		$.ajax({
    	    url:$.appClient.generateUrl({ESRole:'filter'},'x'),
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
    		    			var val = filedvalue[i].value;
    		    			if(val.indexOf("&")!=-1 || val.indexOf(",")!=-1){
        		    			$.dialog.notice({content:'字段值不能请输入“&”或“,”特殊字符',icon:'error',time:3});
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
    		    		var url = $.appClient.generateUrl({ESRole:'getRoleByCondition'},'x');
						$('#roleGrid').flexOptions({url: url, newp: 1, query: {condition:condition}}).flexReload();
						thisDialog.close();
					},
					cancel:function(){
						
					}
    		    });
    	    },
    	    cache:false
    	});
	}
	// 添加行,删除行按钮
	$('.newfilter').die().live('click',function (){
		$($('#contents>p:last').clone()).appendTo($('#contents'));
		
	});

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
		$("#roleGrid").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
	};
	// 全局变量
	var g = {
		roleId: undefined,
		treeObj: undefined,
		bussModelId: undefined,
		treeTyp:undefined
	};
	// -------菜单权限-------------
	var menuAuth = {
			resourId: undefined,
			setting: { // 功能树,目录树
				view: {
					dblClickExpand: true,
					showLine: false
					},
				data: {
					simpleData: {
						enable: true
					}
				},
				check: {
					enable:true,
					chkboxType: { "Y": "ps", "N": "ps" }
				},
				callback: {
					onClick: function (e,treeId, treeNode){
						
						g.treeObj.checkNode(treeNode, null, true);	// 当单击节点时前面的复选框同时被选中
					
					}
				}
			}, // setting end
			display: function (that){
				var This = this;
					g.roleId = that.id;//取到要编辑的角色的id
					$.post(
						$.appClient.generateUrl({ESRole:'menu'},'x'),
						function (htm){
							
							$.dialog({
					    		title: '功能权限设置',
					    		padding:'0px',
					    		content: htm,
					    		okVal: '保存',
					    		cancelVal: '取消',
					    		ok: This.save,
					    	    cancel: function (){
					    	    	This.resourId = undefined; // init
					    	    	return true;
					    	    }
						    });
							
							document.getElementById('name').value = $(that).closest('tr').find('td[colname="roleName"] div').html();		// 把角色赋值给#roleName标签
					    	This.getTree();
						}
					);
			},
			getTree: function (){
				var This = this;
					$.post(
						$.appClient.generateUrl({ESRole:'getMenuAuth'},'x'),
						{roleId: g.roleId},
						function (data){
							This.resourId = data.resourId;
							g.treeObj = $.fn.zTree.init($("#zTree"), This.setting, data.nodes);
						},
						'json'
					);
			},
			save: function (){
				var changePath = g.treeObj.getChangeCheckedNodes();
				var nodeleng = changePath.length;
				if(!nodeleng){
					// guolanrui 20140730 当权限没有做任务修改时，给出提示BUG:317
					$.dialog.notice({content: '您没有做任何修改，不需要保存！', icon: 'warning', time: 3, lock: false});
					return false;
				}
				
				var checkNodes = g.treeObj.getCheckedNodes(true);
				var nodeleng = checkNodes.length;
				var checkeds = [];
					for(var n=0; n<nodeleng; n++){
						checkeds.push(checkNodes[n].id);				
					}
					
					$.post(
						$.appClient.generateUrl({ESRole:'saveMenuAuth'},'x'),
						{roleId: g.roleId, checkeds: checkeds.join(','), resourId: menuAuth.resourId},
						function (msg){
							menuAuth.resourId = undefined;
							if(msg=="success"){ // ### temp 具体返回值暂时不清楚
								$.dialog.notice({content: '保存成功', icon: 'succeed', time: 2, lock: false});
							}else{
								$.dialog.notice({content: msg, icon: 'error', time: 2, lock: false});
							}
						}
					);
			}
	};
// ------- 目录授权 -------
	var dirAuth = {
			setting: { // 功能树,目录树
				view: {
					dblClickExpand: true,
					showLine: false
					},
				data: {
					simpleData: {
						enable: true
					}
				},
				check: {
					enable:true,
					chkboxType: { "Y": "ps", "N": "ps" }
				},
				callback: {
					onClick: function (e,treeId, treeNode){
							/**
							 * xiaoxiong 20140804
							 * 添加单击节点时，只能将未选中的节点选中，而不能将选中的节点取消 *
							 */
						   //alert($(treeNode).attr('isLeaf'));
							var rights = $(treeNode).attr('rights') ; 	
							if(treeNode.checked){
								if($(treeNode).attr('isLeaf') == '1'){
									dirAuth.displayRights(rights);
								} else {
									dirAuth.displayRights(rights);
									//dirAuth.readOnlyRights();
								}
							} else {
								g.treeObj.checkNode(treeNode, null, true);	// 当单击节点时前面的复选框同时被选中
								if($(treeNode).attr('isLeaf') == '1'){
									if(rights == ''){
										dirAuth.displayRights("DR,FR");/** 默认：条目浏览，文件浏览 **/
										$(treeNode).attr('rights','DR,FR') ;
										$(treeNode).attr('name',$(treeNode).attr('realname')+'[DR,FR]') ;
									} else {
										$(treeNode).attr('name',$(treeNode).attr('realname')+'['+rights+']') ;
										dirAuth.displayRights(rights);
									}
								} else {
									dirAuth.displayRights(rights);
									//dirAuth.readOnlyRights();
									var checkedNodes = [] ;
									checkedNodes = dirAuth.getAllLeftChildren(checkedNodes, treeNode);
									var checkedNodesLength = checkedNodes.length ;
									for(var i=0; i<checkedNodesLength; i++) {
										//if($(checkedNodes[i]).attr('isLeaf') == '1'){
											rights = $(checkedNodes[i]).attr('rights') ;
											if(rights == ''){
												$(checkedNodes[i]).attr('rights','DR,FR') ;
												$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'[DR,FR]') ;
											} else {
												$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'['+rights+']') ;
											}
											g.treeObj.updateNode(checkedNodes[i]);
									//	}
									}
								}
								g.treeObj.updateNode(treeNode);
							}
					},
					onCheck : function (e, treeId, treeNode){
						var rights = $(treeNode).attr('rights') ;
						if(treeNode.checked){
							if($(treeNode).attr('isLeaf') == '1'){
								if(rights == ''){
									dirAuth.displayRights("DR,FR");/** 默认：条目浏览，文件浏览 * */
									$(treeNode).attr('rights','DR,FR') ;
									$(treeNode).attr('name',$(treeNode).attr('realname')+'[DR,FR]') ;
								} else {
									dirAuth.displayRights(rights);
									$(treeNode).attr('name',$(treeNode).attr('realname')+'['+rights+']') ;
								}
							} else {
								dirAuth.displayRights(rights);
								//dirAuth.readOnlyRights();
								var checkedNodes = [] ;
								checkedNodes = dirAuth.getAllLeftChildren(checkedNodes, treeNode);
								var checkedNodesLength = checkedNodes.length ;
								for(var i=0; i<checkedNodesLength; i++) {
									//if($(checkedNodes[i]).attr('isLeaf') == '1'){
										rights = $(checkedNodes[i]).attr('rights') ;
										if(rights == ''){
											$(checkedNodes[i]).attr('rights','DR,FR') ;
											$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'[DR,FR]') ;
										} else {
											$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'['+rights+']') ;
										}
										g.treeObj.updateNode(checkedNodes[i]);
									//}
								}
							}
							g.treeObj.selectNode(treeNode);
							g.treeObj.updateNode(treeNode);
						} else {
							$(treeNode).attr('name',$(treeNode).attr('realname')) ;
							//dirAuth.readOnlyRights() ;
							g.treeObj.selectNode(treeNode);
							g.treeObj.updateNode(treeNode);
							var checkedNodes = [] ;
							checkedNodes = dirAuth.getAllLeftChildren(checkedNodes, treeNode);
							var checkedNodesLength = checkedNodes.length ;
							for(var i=0; i<checkedNodesLength; i++) {
								//if($(checkedNodes[i]).attr('isLeaf') == '1'){
									rights = $(checkedNodes[i]).attr('rights') ;
									if(rights == ''){
										$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')) ;
									} else {
										$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')) ;
									}
									g.treeObj.updateNode(checkedNodes[i]);
								//}
							}
						}
					}
				}
			}, // setting end
			getAllLeftChildren: function (childrens,treeNode){
				/*if(treeNode.isLeaf == '1')*/childrens.push(treeNode);
				if (treeNode.isParent){
					for(var obj in treeNode.children){
						dirAuth.getAllLeftChildren(childrens,treeNode.children[obj]);
					}
			    }
				return childrens;
			},
			display: function (that){

				g.roleId = that.id;
				g.nodeType = 1;
				$.post(
					$.appClient.generateUrl({ESRole:'dir'},'x'),
				    function(htm){
						
				    	$.dialog({
				    		title: '目录权限设置',
				    		padding: '0px',
					    	content: htm,
					    	ok: dirAuth.operation,
					    	okVal: '确定',
					    	cancel: true,
					    	cancelVal: '关闭'
					    });
					    
				    	dirAuth.getTree();
				    	document.getElementById('name').value = $(that).closest('tr').find('td[colname="roleName"] div').html();		// 把角色赋值给#roleName标签
				    
						document.getElementById('mode').onchange = function(){
						 g.nodeType = this.value;
						 dirAuth.getTree(); 
						};
				    }
				);
			},
			getTree: function (){
				$.post(
					$.appClient.generateUrl({ESRole:'getAuthTree'},'x'),
					{roleId: g.roleId, nodeType: g.nodeType},
					function (nodes){
						if(!nodes.length) {
							document.getElementById('zTree').innerHTML = '<div class="folder-prompt">未设置目录权限！</div>';
							return;
						}
						g.treeObj = $.fn.zTree.init($("#zTree"), dirAuth.setting, nodes);
					
					},
					'json'
				);
			},
			displayRights: function(rights){
				var array = rights.split(',');
				$('#dircheckedAll').removeAttr('checked') ;
				$('#diritemRead').removeAttr('checked') ;
				$('#diritemEdit').removeAttr('checked') ;
				$('#diritemDelete').removeAttr('checked') ;
				$('#dirfileDownload').removeAttr('checked') ;
				$('#dirfileRead').removeAttr('checked') ;
				$('#dirfilePrint').removeAttr('checked') ;
				$('#dircheckedAll').removeAttr('disabled') ;
				$('#diritemRead').removeAttr('disabled') ;
				$('#diritemEdit').removeAttr('disabled') ;
				$('#diritemDelete').removeAttr('disabled') ;
				$('#dirfileDownload').removeAttr('disabled') ;
				$('#dirfileRead').removeAttr('disabled') ;
				$('#dirfilePrint').removeAttr('disabled') ;
				if(array.length == 6){
					$('#dirRight input').attr('checked', 'checked') ;
				} else {
					for(var i=0;i<array.length;i++){
						if(array[i] == 'DR'){
							$('#diritemRead').attr('checked', 'checked') ;
						} else if(array[i] == 'DU'){
							$('#diritemEdit').attr('checked', 'checked') ;
						} else if(array[i] == 'DD'){
							$('#diritemDelete').attr('checked', 'checked') ;
						} else if(array[i] == 'FD'){
							$('#dirfileDownload').attr('checked', 'checked') ;
						} else if(array[i] == 'FR'){
							$('#dirfileRead').attr('checked', 'checked') ;
						} else if(array[i] == 'FP'){
							$('#dirfilePrint').attr('checked', 'checked') ;
						}
					}
				}
			},
			readOnlyRights: function(){
				$('#dircheckedAll').attr('disabled', 'disabled') ;
				$('#diritemRead').attr('disabled', 'disabled') ;
				$('#diritemEdit').attr('disabled', 'disabled') ;
				$('#diritemDelete').attr('disabled', 'disabled') ;
				$('#dirfileDownload').attr('disabled', 'disabled') ;
				$('#dirfileRead').attr('disabled', 'disabled') ;
				$('#dirfilePrint').attr('disabled', 'disabled') ;
			},
			operation: function (){
				
				var changePath = g.treeObj.getChangeCheckedNodes();
				var deletePath = [];
				var	savePath = [];
				var nodeleng = changePath.length;
					if(!nodeleng){
						var checkedNodes = g.treeObj.getCheckedNodes();
						var checkedNodesLength = checkedNodes.length ;
						if(checkedNodesLength == 0){
							// guolanrui 20140730 当权限没有做任务修改时，给出提示消息BUG：317
							$.dialog.notice({content: '您没有做任何修改，不需要保存！', icon: 'warning', time: 3, lock: false});
							return false;
						} else {
							var hasUpdate = false ;
							for(var i=0; i<checkedNodesLength; i++) {
								if($(checkedNodes[i]).attr('rights') != $(checkedNodes[i]).attr('oldrights')){
									savePath.push(checkedNodes[i].id+'|'+checkedNodes[i].nodeType+'|'+checkedNodes[i].rights+'|'+checkedNodes[i].authId);
									hasUpdate = true ;
								}
							}
							if(!hasUpdate){
								$.dialog.notice({content: '您没有做任何修改，不需要保存！', icon: 'warning', time: 3, lock: false});
								return false;
							}
						}
					}
					/** guolanrui 20140912 解决IE8下数组不支持indexOf的BUG:848 start * */
					if (!Array.prototype.indexOf){
						Array.prototype.indexOf = function(elt /* , from */){
						    var len = this.length >>> 0;
						　　var from = Number(arguments[1]) || 0;
						    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
						    if (from < 0){
						    	from += len;
						    }
						　　for (; from < len; from++){
						      	if (from in this && this[from] === elt){
						    	  return from;
						      	}
						    }
						    return -1;
						};
					}
					/** guolanrui 20140912 解决IE8下数组不支持indexOf的BUG:848 end * */
					for(var i=0; i<nodeleng; i++)
					{
						if(changePath[i].checked){
							if(savePath.indexOf(1)==-1)savePath.push(changePath[i].id+'|'+changePath[i].nodeType+'|'+changePath[i].rights+'|'+changePath[i].authId);
							}else{
								deletePath.push(changePath[i].authId);
							}
					}
					
					$.post(
						$.appClient.generateUrl({ESRole:'saveAuthTreeNodes'},'x'),
						{roleId: g.roleId,nodeType:g.nodeType,savePath: savePath, deletePath: deletePath},
						function (msg){
							
								if(msg=="success"){ // ### temp 具体返回值暂时不清楚
									$.dialog.notice({content: '保存成功', icon: 'succeed', time: 2, lock: false});
								}else{
									$.dialog.notice({content:msg, icon: 'error', time: 2, lock: false});
								}
						}
					);
			}
	};
	dataAuth = {
			node: {},
			options: {},
			strus: [], // 数据节点被单击时返回是卷,卷内信息(如果卷内存在) 例:[{sid:6, title:文件目录,
						// path:-archive_1-5@_-@6}]
			activeGridId: '', // xiaoxiong 20140909 将其修改为记录当前活动的grid的ID
			condition: {en: [], cn: []},
			stru: {}, // 用来储存数据表格中的新建,删除,修改时候用到的当前卷或卷内数据 {sid:6, title:文件目录,
						// path:-archive_1-5@_-@6}
			authId: '-1', // 权限修改时id为当前行的authId,新建时id为'-1'
			setting: { // 数据权限树设置
				view: {
					dblClickExpand: true,
					showLine: false
				},
				
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onClick: function (e,treeId, treeNode){
						
						dataAuth.node = treeNode;
						
						if(treeNode.id <= 0){
							document.getElementById('dataTbl').innerHTML = '<div style="width:520px; height:440px; line-height:100px; text-align:center; color:red; border-left:1px solid #ccc;">未设置结构</div>';
							return;
						}
						
						$.post(
							$.appClient.generateUrl({ESRole:'preGetPackageRight'},'x'),
							{nodeType:treeNode.nodeType,treeId:treeNode.id},
							function(strus){
								
								if(!strus.length)
									return;
								
								dataAuth.strus = strus;
								if(strus.length == 1){
									
									document.getElementById('dataTbl').innerHTML = "<table id='defaultTbl'></table><table id='fileTbl'></table>";
									dataAuth.defaultTbl(140);
									dataAuth.fileTbl(140, 'file', 1);

								}else if(strus.length == 2){
									
									document.getElementById('dataTbl').innerHTML = "<table id='defaultTbl'></table><table id='struTbl'></table><table id='fileTbl'></table>";
									dataAuth.defaultTbl(140);
									dataAuth.struTbl(140);
									dataAuth.fileTbl(140, dataAuth.strus[1].path, 2);
								}
								if(strus[0]['secflag'] == 'true') {
									$('input[class="transfer"]:first').attr('checked',true);
									$('input[class="transfer"]:last').closest('span').hide();
								} else {
									$('input[class="transfer"]:first').removeAttr('checked');
									$('input[class="transfer"]:last').closest('span').show();
								}
								if(strus[0]['dataflag'] == 'true') {
									$('input[class="transfer"]:last').attr('checked',true);
								} else {
									$('input[class="transfer"]:last').removeAttr('checked');
								}						
							},
							'json'
						);
						
					}
				}
			},
			display: function ( that ){ // 打开数据权限设置面板
				
				g.roleId = that.id;
				g.bussModelId = 1;
				
				$.post(
					$.appClient.generateUrl({ESRole:'data'},'x'),
				    function(htm){
				    	$.dialog({
				    		title:'数据权限设置',
				    		padding:'0px',
				    	    ok: true,
					    	content:htm,
					    	okVal:'关闭'
					    });
					    
				    	dataAuth.getTree();
				    	document.getElementById('name').value = $(that).closest('tr').find('td[colname="roleName"] div').html();		// 把角色赋值给#roleName标签
				    	document.getElementById('dataTbl').innerHTML = '<div style="width:520px; height:440px; line-height:100px; text-align:center; color:red; border-left:1px solid #ccc;">请选择目录节点！</div>';
				    	/*
						 * document.getElementById('mode').onchange = function
						 * (){ g.bussModelId = this.value; dataAuth.getTree(); };
						 */
				    	
				    }
				);
				
			},
			add: function (gridId, stru){ // 添加数据权限规则面板
					dataAuth.activeGridId = gridId;
					// alert(gridId);
					// alert(dataAuth.strus.length);
					dataAuth.stru = stru;
					var isfile = '0';
					if(gridId=='fileTbl'){
						isfile = '1';
					}else if(dataAuth.strus.length == 2 && gridId=='defaultTbl'){
						isfile = '2';
					}
					$.post(
					    $.appClient.generateUrl({ESRole:'add_rule'},'x'),
					    // {sId: dataAuth.stru.sid, isfile:(gridId=='fileTbl'?'1':'0')},
					    {roleId:g.roleId, treeId: dataAuth.stru.id,nodeType:dataAuth.stru.nodeType, isfile:isfile},
					    function(htm){
					    	$.dialog({
					    		id:'addDataRuleDialog',
						    	title: '添加规则面板',
						    	padding: '0px',
						    	content: htm,
						    	okVal: '保存',
						    	width:650,
						    	cancelVal: '取消',
					    	    ok: dataAuth.save,
					    	    cancel: function (){
					    	    	dataAuth.authId = '-1'; // init
									dataAuth.condition= {cn: [], en:[]}; // init
					    	    }
						    });
					    }
					);
			},
			modify: function (tr){
				var isfile = '0';
				if(dataAuth.activeGridId=='fileTbl'){
					isfile = '1';
				}else if(dataAuth.strus.length == 2 && dataAuth.activeGridId=='defaultTbl'){
					isfile = '2';
				}
				$.post(
				    $.appClient.generateUrl({ESRole:'edit_rule'},'x'),
				    {treeId: dataAuth.stru.id,nodeType: dataAuth.stru.nodeType, authId: dataAuth.authId, isfile:isfile},
				    function(htm){
				    	$.dialog({
				    		id:'addDataRuleDialog',
					    	title: '编辑规则面板',
					    	padding: '0px',
					    	content: htm,
					    	okVal: '保存',
					    	cancelVal: '取消',
				    	    ok: dataAuth.save,
				    	    cancel: function (){
				    	    	dataAuth.authId = 'NULL'; // init
								dataAuth.condition= {cn: [], en:[]}; // init
				    	    }
					    });
				    
				    }
				);
			},
			remove: function (gridId, stru){
					dataAuth.activeGridId = gridId;
					dataAuth.stru = stru;
					var authId = [];
					$('#' + gridId +' input[type="checkbox"]:checked').each(function (){
						authId.push(this.id);
					});
				
					if(!authId.length){
						$.dialog.notice({content:'请选择要删除的数据', icon:'warning', time: 2});
						return;
					}
				
					$.dialog({
						content: '确定删除',
						ok: '确定',
						cancelVal: '取消',
						icon: 'warning',
						ok: function (){
							$.post(
								$.appClient.generateUrl({ESRole:'deleteDataAuth'},'x'),
								/** xiaoxiong 20140731 添加角色ID与业务类型标示 * */
								{authId: authId.join(","), roleId: g.roleId },
								function (msg){
									if(msg="success"){
										$('#' + gridId).flexReload();
										$.dialog.notice({content: '删除成功！',icon:'success',time:2});
									}else{
										$.dialog.notice({content:msg,icon:'error',time:2});
									}
									
								}
							);
						},
						cancel: true
					});
			},
			save: function (){
					var uls = document.getElementById('condition').children,ulleng = uls.length;
					for(var u=0; u<ulleng; u++)
					{
						var key = uls[u].children[0].children[0];
						if(key.value === 'EMPTY') continue;
						
						var comparison = uls[u].children[1].children[0],compleng = comparison.length,comparisonCn = null;
						var value = uls[u].children[2].children[0];
						var relation = uls[u].children[3].children[0];
							for(var c=0; c<compleng; c++)
							{
								if(comparison.options[c].selected){
									comparisonCn = comparison.options[c].text;
									break;
								}
							}
							
						var keyCn = dataAuth.options[key.value];
						var relationCn = relation.value === 'true' ? '并且' : '或者'; // 获取字段关系符中文
							dataAuth.condition.en.push(key.value +','+ comparison.value +','+ value.value +','+ relation.value);
							dataAuth.condition.cn.push(keyCn + comparisonCn + value.value + relationCn);
					}
// alert(222);
					if(!dataAuth.condition.en.length){
						// guolanrui 20140730 当没有设置任何条件的时候就是对全部数据生效
						dataAuth.condition.en.push('all');
						dataAuth.condition.cn.push('全部数据');
// return;
					}
// alert(33);
					// 六个权限
				/*var rDiv = document.getElementById('rights').children,rDivleng = rDiv.length-2,rights = {};
					for(var r=0; r<rDivleng; r++){ // 屏蔽全选和反选按钮
						var cbox = rDiv[r].firstChild;
							rights[cbox.id] = cbox.checked ? '1' : '0';
					}*/
					//获取权限的字符串集合
					var authValue = $('#rights input[name="auth"]:checked');
					var rights = "";
					authValue.each(function(){
						rights+=$(this).attr("id")+",";
					});
					if(rights!=""){
						rights = rights.substring(0,rights.length-1);
					}
					var cn = dataAuth.condition.cn.join("");
					if(cn!="全部数据"){
					cn = cn.substring(0,cn.length-2);
					}
					var en = dataAuth.condition.en.join("&");
				var data = {
						roleId: g.roleId,
						//bussModelId: g.bussModelId,
						treeId: dataAuth.node.treeId,
						authId:dataAuth.authId,
						nodeType: dataAuth.stru.nodeType,
						rights : rights,
						en:en,
						cn:cn
					};
				
				$.post(
					$.appClient.generateUrl({ESRole:'saveDataAuth'},'x'),
					data,
					function (msg){
						if(msg=="success"){
							dataAuth.authId = '-1'; // init
							dataAuth.condition= {cn: [], en:[]}; // init
							$("#"+dataAuth.activeGridId).flexReload() ;
							art.dialog.list['addDataRuleDialog'].close();
							$.dialog.notice({content:"保存成功！", icon: 'success', time:3});
						}else{
// dataAuth.authId = 'NULL'; // init
							dataAuth.condition= {cn: [], en:[]}; // init
							$.dialog.notice({content:msg, icon: 'warning', time:3});
						}
					},
					'json'
				);
				return false;
			},
			getTree: function (){ // 数据树
				$.post(
					$.appClient.generateUrl({ESRole:'getDataTree'},'x'),
					{roleId: g.roleId, nodeType: 1},
					function (nodes){
						
						if(!nodes.length) {
							document.getElementById('zTree').innerHTML = '<div class="folder-prompt">未设置目录权限！</div>';
							document.getElementById('dataTbl').innerHTML = '<div class="data-prompt">未设置目录权限！</div>';
							return;
						}else{
							document.getElementById('dataTbl').innerHTML = '<div class="data-prompt">请选择目录节点！</div>';
						}
						
						g.treeObj = $.fn.zTree.init($("#zTree"), dataAuth.setting, nodes);

					},
					'json'
				);
			},
			defaultTbl: function (height){
// var titleStr = dataAuth.node.name +' • '+ dataAuth.strus[0].title;
				var titleStr = dataAuth.strus[0].name;
				var titleTpl = titleStr;
				if(titleStr.length>15){
					titleStr = titleStr.substring(0, 13) + '...';
				}
// $("#dataTbl").find('div[class="tDiv2"]').append('<div><span
// style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid
// #ccc;">'+titleStr+'</span></div>');
				//var url = $.appClient.generateUrl({ESRole:'getDataAuth', roleId:g.roleId, treeId:dataAuth.strus[0].id, nodeType:dataAuth.strus[0].nodeType},'x');
				var url = $.appClient.generateUrl({ESRole: 'getDataAuth', roleId: g.roleId, treeId:dataAuth.strus[0].id,nodetype:dataAuth.strus[0].nodeType},'x');
				$("#defaultTbl").flexigrid({
					url: url,
					dataType: 'json',
					colModel : [
						{display: '<input type="checkbox" id="checked_default" />', name : 'cbox', width : 30, align: 'center'},
						{display: '操作', name : 'operation', width : 30, sortable : true, align: 'center'},
						{display: '条件', name : 'condition', width :100, sortable : true, align: 'left',hide:true},
						{display: '权限类型', name : 'permission', width : 100, sortable : true, align: 'left',hide:true},
						{display: '条件', name : 'conditionCn', width :140, sortable : true, align: 'left' },
						{display: '权限类型', name : 'permissionCn', width : 300, sortable : true, align: 'left' }
// 20140507 wangbo 加了两列显示中文条件和权限类型
					],
					buttons : [
			           {name: '新建', bclass: 'add', onpress: function (){dataAuth.add('defaultTbl', dataAuth.strus[0]);}},
			           {name: '删除', bclass: 'delete', onpress: function (){dataAuth.remove('defaultTbl', dataAuth.strus[0]);}}
			           ],
// title: (dataAuth.node.name +' • '+ dataAuth.strus[0].title),
					useRp: false,
					resizable: false,
					nomsg:"没有数据",
					showTableToggleBtn: false,
					width: (dataAuth.strus.length==1?580:560),
					height: height
				});
				$("#dataTbl").find('div[class="tDiv2"]').eq(0).prepend('<span title="'+titleTpl+'" style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">'+titleStr+'</span>');
			},
			struTbl: function (height){
// var titleStr = dataAuth.node.name +' • '+ dataAuth.strus[1].title;
				var titleStr = dataAuth.strus[1].title;
				var titleTpl = titleStr;
				if(titleStr.length>15){
					titleStr = titleStr.substring(0, 13) + '...';
				}
				var url = $.appClient.generateUrl({ESRole: 'getDataAuth', roleId: g.roleId,treeId:dataAuth.strus[1].id, nodeType : dataAuth.strus[1].nodeType},'x');
				$("#struTbl").flexigrid({
					url: url,
					dataType: 'json',
					colModel : [
						{display: '<input type="checkbox" id="checked_stru" />', name : 'cbox', width : 30, align: 'center'},
						{display: '操作', name : 'operation', width : 30, sortable : true, align: 'center'},
						{display: '条件', name : 'condition', width :200, sortable : true, align: 'left',hide:true},
						{display: '权限类型', name : 'permission', width : 200, sortable : true, align: 'left',hide:true},
						{display: '条件', name : 'conditionCn', width :140, sortable : true, align: 'left'},
						{display: '权限类型', name : 'permissionCn', width :300, sortable : true, align: 'left'}
// 20140507 wangbo 加了两列显示中文条件和权限类型
					],
					buttons : [
						{name: '新建', bclass: 'add', onpress: function (){dataAuth.add('struTbl', dataAuth.strus[1]);}},
						{name: '删除', bclass: 'delete', onpress: function (){dataAuth.remove('struTbl', dataAuth.strus[1]);}}
					],
// title: (dataAuth.node.name +' • '+ dataAuth.strus[1].title),
					useRp: false,
					resizable: false,
					nomsg:"没有数据",
					showTableToggleBtn: false,
					width: 560,
					height: height
				});
				$("#dataTbl").find('div[class="tDiv2"]').eq(1).prepend('<span title="'+titleTpl+'" style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">'+titleStr+'</span>');
			},
			fileTbl: function (height, nodeType, level){
// var titleStr = dataAuth.node.name +' • '+ dataAuth.strus[1].title;
				var titleStr = '电子文件级';
				var fielStru = {} ;
				fielStru.treeId = dataAuth.strus[level-1].id ;
				fielStru.nodeType = nodeType;
				//fielStru.secflag = dataAuth.strus[level-1].secFlag ;
				//fielStru.dataflag = dataAuth.strus[level-1].dataflag ;
				var titleTpl = titleStr;
				if(titleStr.length>15){
					titleStr = titleStr.substring(0, 13) + '...';
				}
				var url = $.appClient.generateUrl({ESRole: 'getDataAuth',roleId: g.roleId, treeId:dataAuth.strus[level-1].id,nodetype:nodeType},'x');
				$("#fileTbl").flexigrid({
					url: url,
					dataType: 'json',
					colModel : [
					            {display: '<input type="checkbox" id="checked_file" />', name : 'cbox', width : 30, align: 'center'},
					            {display: '操作', name : 'operation', width : 30, sortable : true, align: 'center'},
					            {display: '条件', name : 'condition', width :200, sortable : true, align: 'left',hide:true},
					            {display: '权限类型', name : 'permission', width : 200, sortable : true, align: 'left',hide:true},
					            {display: '条件', name : 'conditionCn', width :140, sortable : true, align: 'left'},
					            {display: '权限类型', name : 'permissionCn', width :300, sortable : true, align: 'left'}
// 20140507 wangbo 加了两列显示中文条件和权限类型
					            ],
					            buttons : [
					                       {name: '新建', bclass: 'add', onpress: function (){dataAuth.add('fileTbl', fielStru);}},
					                       {name: '删除', bclass: 'delete', onpress: function (){dataAuth.remove('fileTbl', fielStru);}}
					                       ],
// title: (dataAuth.node.name +' • '+ dataAuth.strus[1].title),
					                       useRp: false,
					                       resizable: false,
					                       nomsg:"没有数据",
					                       showTableToggleBtn: false,
					                       width: (dataAuth.strus.length==1?580:560),
					                       height: height
				});
				$("#dataTbl").find('div[class="tDiv2"]').eq(level).prepend('<span title="'+titleTpl+'" style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">'+titleStr+'</span>');
			},
			checkbox: function (that){
				var divDom = document.getElementById('rights').children;
				var leng = divDom.length-2; // 去掉全选/反选按钮
				var checkedAll = divDom[leng].children[0]; // 全选按钮
				var cancelChecked = divDom[leng+1].children[0]; // 反选按钮
				
				if(that.id === 'checkedAll'){ // 全选按钮
					
					if(cancelChecked.checked) // 不选中反选按钮
						cancelChecked.checked = false;
						
					if(that.checked){ // 全选!除全选/反选外所有
						for(var i=0; i<leng; i++){
							divDom[i].children[0].checked = true;
						}
					}else{ // 取消所有
						for(var i=0; i<leng; i++){
							divDom[i].children[0].checked = false;
						}
					}
					return;
				}else if(that.id === 'cancelChecked'){ // 反选按钮
					
					var tmpCheckboxs = 0;
					for(var i=0; i<leng; i++){
						
						if(divDom[i].children[0].checked){
							
							divDom[i].children[0].checked = false;
							
						}else{
							
							divDom[i].children[0].checked = true;
							tmpCheckboxs++;
							
						}
						
					}
					
					tmpCheckboxs === leng ? checkedAll.checked = true : checkedAll.checked = false;
					return;
					
				}else{ // 非全选/反选按钮
					// guolanrui 20141010
					// 添加对权限个数的判断，防止案卷级或者电子文件级只有3个权限时，勾选有问题BUG:1248
					  if(that.id === 'fileRead'){
						  if(leng == 6){// guolanrui 20141010 表示有6个权限复选框
							  if(divDom[0].children[0].checked){
								  divDom[3].children[0].checked = true;
							  }else{
								  divDom[1].children[0].checked = false;
								  divDom[2].children[0].checked = false;
							  }
						  }else{// guolanrui 20141010 表示只有3个权限复选框
							  if(!divDom[0].children[0].checked){
								  divDom[1].children[0].checked = false;
								  divDom[2].children[0].checked = false;
							  } 
						  }
					  }
					  if(that.id === 'itemRead'){
						  if(leng == 6){// guolanrui 20141010 表示有6个权限复选框
							  if(!divDom[3].children[0].checked){
								  divDom[0].children[0].checked = false;
								  divDom[1].children[0].checked = false;
								  divDom[2].children[0].checked = false;
								  divDom[4].children[0].checked = false;
								  divDom[5].children[0].checked = false;
							  }
						  }else{
							  if(!divDom[0].children[0].checked){
								  divDom[1].children[0].checked = false;
								  divDom[2].children[0].checked = false;
							  }
						  }
					  }
					  if(that.id === 'fileDownload'){
						  if(leng == 6){// guolanrui 20141010 表示有6个权限复选框
							  if(divDom[2].children[0].checked){
								  divDom[0].children[0].checked = true;
								  divDom[1].children[0].checked = true;
								  divDom[3].children[0].checked = true;
							  }
						  }else{
							  if(divDom[2].children[0].checked){
								  divDom[0].children[0].checked = true;
								  divDom[1].children[0].checked = true;
							  }
						  }
					  }
					  if(that.id === 'itemEdit'){
						  if(leng == 6){// guolanrui 20141010 表示有6个权限复选框
							  if(divDom[4].children[0].checked){
								  divDom[3].children[0].checked = true;
							  }
						  }else{
							  if(divDom[1].children[0].checked){
								  divDom[0].children[0].checked = true;
							  } 
						  }
					  }
					  if(that.id === 'filePrint'){
						  if(leng == 6){// guolanrui 20141010 表示有6个权限复选框
							  if(divDom[1].children[0].checked){
								  divDom[0].children[0].checked = true;
								  divDom[3].children[0].checked = true;
							  }
						  }else{
							  if(divDom[1].children[0].checked){
								  divDom[0].children[0].checked = true;
							  }
						  }
					  }
					  if(that.id === 'itemDelete'){
						  if(leng == 6){// guolanrui 20141010 表示有6个权限复选框
							  if(divDom[5].children[0].checked){
								  divDom[3].children[0].checked = true;
								  divDom[4].children[0].checked = true;
							  }
						  }else{
							  if(divDom[2].children[0].checked){
								  divDom[0].children[0].checked = true;
								  divDom[1].children[0].checked = true;
							  }
						  }
					  }
					
						if(cancelChecked.checked) // 不选中反选按钮
							cancelChecked.checked = false;		
			
						var tmpCheckboxs = 0;
						for(var i=0; i<leng; i++){
							
							if(divDom[i].children[0].checked)
								tmpCheckboxs++;
			
						}
						
						if(tmpCheckboxs === leng){ // 存在选中状态
							
							if(!checkedAll.checked) // 全选没有设置checked属性,避免重复设置
								checkedAll.checked = true;
							
						}else{
						
							if(checkedAll.checked) // 全选设置checked属性时,避免重复移除
								checkedAll.checked = false;
						}
						
				}
			},
			// 是否跨部门 
			isSelectSection:function() {
				var treeId = dataAuth.node.treeId;
				var istransdepartment = $('input[class="transfer"]:first').attr("checked") == "checked" ? 'true' : 'false';
				var url = $.appClient.generateUrl({ESRole:'setTransDepartment',treeid:treeId,istransdepartment:istransdepartment},'x');
				$.get(url, function(data){
					if(data) {
						$.dialog.notice({content: '设置成功', time: 2, icon: 'succeed'});
						$.get($.appClient.generateUrl({ESRole:'getTransDepartment',treeid:treeId},'x'),function(data) {
							if(data=='true') {
								$('input[class="transfer"]:last').closest('span').hide();
							} else {
								$('input[class="transfer"]:last').closest('span').show();
							}					
						});
					} else {
						$.dialog.notice({content: '设置失败，请稍候再试！', time: 3, icon: 'error'});
					}
				});
			},
			// 设置数据权限是否优先级(相对于部门而言) 倪阳添加 2013-10-31
			isDataAuthPriority: function() {
				var treeId = dataAuth.node.treeId;
				var isDataAuthPriority = $('input[class="transfer"]:last').attr("checked") == "checked" ? 'true' : 'false';
				var url = $.appClient.generateUrl({ESRole:'setDataAuthPriority',treeid:treeId,isDataAuthPriority:isDataAuthPriority},'x');
				$.get(url, function(data){
					if(data) {
						$.dialog.notice({content: '设置成功', time: 2, icon: 'succeed'});
					} else {
						$.dialog.notice({content: '设置失败，请稍候再试！', time: 3, icon: 'error'});
					}
				});
			}
	};
	
	var _initValue={
			dataLendDays:0,
			dataLendCount:0
	}
	var lends= {
			display: function (that){
					g.roleId = that.id;//取到要编辑的角色的id
					$.post(
						$.appClient.generateUrl({ESRole:'lends'},'x'),
						{id:g.roleId},
						function (htm){
							$.dialog({
					    		title: '借阅授权',
					    		padding:'0px',
					    		content: htm,
					    		okVal: '保存',
					    		cancelVal: '取消',
					    		ok: lends.saveRole,
					    	    cancel: function (){
					    	    	//This.resourId = undefined; // init
					    	    	return true;
					    	    }
						    });
							$("#relendsGrid").flexigrid({
								url : $.appClient.generateUrl({ESRole:'getRelendByRole',roleId:g.roleId},'x'),
								dataType : 'json',
								editable : true,
								colModel : [
										{display:'', name:'order',  width:20, align:'center',hide:true},
										{display:'续借次数', name:'relendCount',  width:150, align:'center'},
										{display:'续借天数', name:'relendDays',editable : true,  width:150, align:'center'},
										{display:'id', name:'id',  width:20, align:'center',hide:true}
								],
								buttons:[
								         {name : '增加一次续借', bclass : 'add', onpress :lends.addLend },  
								         {name : '减少一次续借', bclass : 'delete', onpress : lends.deleteLend}, 
								         {name : '保存', bclass : 'save', onpress : lends.saveLend}  
								         ],
								 		resizable : false,
								 		width : 600,
								 		height : 100,
								 		 usepager : true,
									 		useRp : true,
									 		rp : 20,
									 		nomsg : "没有数据",
									 		pagetext : '第',
									 		outof : '页 /共',
									 		//procmsg : '刷新中，请稍等...',
									 		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
							});
						}
					);
			},
			saveRole:function(){
				var reg=/^[1-9]\d*$/;
				if(!reg.test($('#lendCount').val())){
					$("#lendCount").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
					return false;
				}else{
					$("#lendCount").removeClass("invalid-text").attr("title","");
				}
				if(!reg.test($('#lendDays').val())){
					$("#lendDays").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
					return false;
				}else{
					$("#lendDays").removeClass("invalid-text").attr("title","");
				}
				var roleId = g.roleId ;
				var lendCount = $("#lendCount").val();
				var lendDays = $('#lendDays').val();
				var lendId = $('#lendId').val();
				$.post(
						$.appClient.generateUrl({ESRole:'saveRoleLend'},'x'),
						{ roleId:roleId,lendId:lendId,lendCount:lendCount,lendDays:lendDays},
						function(msg){
							if(msg=='success'){
								$.dialog.notice({
									icon : 'succeed',
									content :  '保存成功！',
									time :2,
									lock:false
								});
								_initValue.datalendDays = $('#lendDays').val();
							}else{
								$.dialog.notice({
									icon : 'error',
									content : msg,
									time : 2,
									lock:false
								});
							}
							$("#relendsGrid").flexReload();
					    }
					);
			},
			addLend :function(){
				if($("#relendsGrid").find("tr:last").find("td[colname='order']").find("div").html()!=null){
					var id = $("#relendsGrid").find("tr:last").find("td[colname='order']").find("div").html();
					$("#relendsGrid").flexExtendData([{
						'id':++id,
						'cell':{'order':id,
								'id':'-1',
								'relendCount':'第'+id+'续借',
								'relendDays':'1'
							   }
					}]);
				}else{
					$("#relendsGrid").flexExtendData([{
						'id':1,
						'cell':{'order':1,
								'id':'-1',
								'relendCount':'第'+1+'续借',
								'relendDays':'1'
							   }
					}]);
				}
			},
			deleteLend:function(){
				if($("#relendsGrid").find("tr:last").find("td[colname='order']").find("div").html()==null){
					$.dialog.notice({
						icon : 'warning',
						content :  '没有续借次数，不能删除',
						time :2,
						lock:false
					});
					return false;
				}
				var delTr = $("#relendsGrid").find("tr:last");
				var reLendId = $(delTr).find("td[colname='id'] div").text();
				if(reLendId == "-1"){
					delTr.remove();
					return;
				}
				
				$.post(
						$.appClient.generateUrl({ESRole:'deleteRelend'},'x'),
						{ reLendId:reLendId},
						function (msg){
							if(msg == "success"){
								$('#relendsGrid').flexReload();
								$.dialog.notice({
									icon :'succeed',
									content :'删除成功！',
									time :2,
									lock:false
								});
							}else{
								$.dialog.notice({
									content:msg,
									icon:'error',
									time:2
								});
							}
						}
					);
			},
			saveLend:function(){
				var saveTrObj = $('#relendsGrid tr[datastate="new"],#relendsGrid tr[datastate="modify"]');
				if(!saveTrObj.length){
					$.dialog.notice({
						title:'',
						content:'请添加新数据',
						icon:'warning',
						time:2
					});
					return;
				}
				
				var datas = []; // [{},...]
				saveTrObj.each(function (){
					var data = {};
						data.id = $(this).find('td[colname="id"]').text();
						data.relendDays = $(this).find('td[colname="relendDays"]').text();
						data.relendCount = $(this).find('td[colname="relendCount"]').text();
						datas.push(data);
				});
				
				
				$.post(
					$.appClient.generateUrl({ESRole:'saveLendCount'},'x'),
					{ datas:datas,roleId:g.roleId},
					function (msg){
						if(msg=="success"){
							$('#relendsGrid').flexReload();
							$.dialog.notice({
								icon : 'succeed',
								content :  '保存成功！',
								time :2,
								lock:false
							});
						}else{
							$.dialog.notice({
								content:msg,
								icon:'error',
								time:2
							});
						}
					},
					'json'
				);
			},
			roleId:''
	}

	
	// 菜单权限
	$('.menus').live('click', function (){
		menuAuth.display(this);
		
	});
	// 目录权限
	$('.dirs').live('click', function (){
		dirAuth.display(this);
		
	});

	// 数据权限
	$('.datas').live('click', function (){
		dataAuth.display(this);
	});
	
	// 借阅权限
	$('#roleGrid .lends').live('click', function (){
		lends.display(this);
	});
	sizeChanged();
	// 全选
	$("#changeIdList").die().live('click',function(){
		$("input[name='changeId']").attr('checked',$(this).is(':checked'));
	});
	
	//数据权限checkbox
	$('#rights input').live('click', function (){
		dataAuth.checkbox(this);	
	});
	//打开数据权限编辑
	$(document).on('click', '#defaultTbl .edits', function (){
		dataAuth.activeGridId = 'defaultTbl' ;
		dataAuth.stru = dataAuth.strus[0];
		dataAuth.authId = this.id;
		dataAuth.modify($(this).closest("tr"));
		
	});
	//打开数据权限编辑
	$(document).on('click', '#fileTbl .edits', function (){
		dataAuth.activeGridId = 'fileTbl';
		dataAuth.stru = dataAuth.strus[0];
		dataAuth.authId = this.id;
		
//		alert($(this).closest("tr"));
		dataAuth.modify($(this).closest("tr"));
		
	});
	//打开数据权限编辑
	$(document).on('click', '#struTbl .edits', function (){
		dataAuth.activeGridId = 'struTbl' ;
		dataAuth.stru = dataAuth.strus[1];
		dataAuth.authId = this.id;
		dataAuth.modify(this);
		
	});
	//添加行
	$('#condition .add').live('click', function (){
		var oldNode = $(this).parent().parent();
		var newNode = oldNode.clone();
		newNode[0].children[0].children[0].value = 'EMPTY';
		newNode[0].children[1].children[0].value = 'equal';
		newNode[0].children[2].children[0].value = '';
		newNode[0].children[3].children[0].value = 'true';
		newNode.appendTo('#condition');
	});

	// 删除行
	$('#condition .del').live('click', function (){
		if(document.getElementById('condition').children.length >5){
			$(this).parent().parent().remove();
		}else{
			var oldNode = $(this).parent().parent();
			oldNode[0].children[0].children[0].value = 'EMPTY';
			oldNode[0].children[1].children[0].value = 'equal';
			oldNode[0].children[2].children[0].value = '';
			oldNode[0].children[3].children[0].value = 'true';
		}
		
	});
	
});
