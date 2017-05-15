/*
 * modify author: fangjixiang
 * modify date: 20130423
 * modify date: 20130716
 * 
 */
 
// 根据客户端不同屏幕分辩率做到自适应,并将宽高存在window根对象中
(function (){

	window._resize = function (){
		/** guolanrui 20140902 修改界面宽度，避免数据显示不全BUG：869 **/
		var width = $(document).width()*0.96;				// 可见总宽度
		var height = $(document).height()-176 - 76;	// 可见总高度 - 176为平台头部高度
		
			if(navigator.userAgent.indexOf("MSIE 6.0")>0){
			
			width = width-6;	// 6为兼容IE6
				
			}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
				width = width-4;	// 4为兼容IE8
				height = height-4;
			}
			
			// IE7.0因插件高度未定导致行高和其它浏览器不一致多出4px
			height = navigator.userAgent.indexOf("MSIE 7.0")>0 ? height + 4 : height;
			_size = {width: width, height: height};
	};
	
})();

_resize();


/*
 * 
 * 
 */
(function (){

	// 全局变量
var g = {
	roleId: undefined,
	treeObj: undefined,
	bussModelId: undefined
};

var role = {
	getRoles: function (){
		//var This = this;
		// 角色列表@方吉祥
		$("#roles").flexigrid({
			dataType: 'json',
			url : $.appClient.generateUrl({ESArchivePermission:'GetAllRoleList'},'x'), //temp//
			colModel : [
			    /** guolanrui 20140728 将点击列头排序去掉，此处不支持点列头排序功能 BUG：177 **/
			    {display: '序号', name : 'num', width : 25, align: 'center'},
//				{display: '<input type="checkbox" id="checked_role" />', name : 'cb', width : 25, align: 'center'},
//				{display: '操作', name : 'function', width : 25, sortable : true, align: 'center'},
				{display: '功能', name : 'menu', width : 25, align: 'center'},
				{display: '目录', name : 'dir', width : 25, align: 'center'},
				{display: '数据', name : 'data', width : 25, align: 'center'},
				{display: '角色标识', name : 'code', width : 200, align: 'left'},
				{display: '角色名称', name : 'name', width : 300, align: 'left'},
				{display: '角色描述', name : 'remark', width : 500, align: 'left'},
				{display: '系统角色', name : 'isSystem', width : 50, align: 'left'}
			],
			buttons : [
//			           {name: '添加', bclass: 'add', tooltip: '添加角色', onpress: role.add},
//			           {name: '删除', bclass: 'delete', onpress: role.remove},
//			           {name: '刷新', bclass: 'refresh', tooltip: '恢复默认数据', onpress: role.refresh}
			],
			usepager: true,
			title: '角色列表',
			useRp: true,
			rp: 20,
			resizable: false,
			nomsg:"没有数据",
			showTableToggleBtn: false,
			sortable: true,
//			sortname: 'name',  
//			sortorder: 'desc',
			width: _size.width,
			height: _size.height,
			pagetext: '第',
			outof: '页 /共',
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
	},
	add: function (data){
		$.get(
			$.appClient.generateUrl({ESArchivePermission:'add_role'},'x'),
			function (htm){
			
				var allow = {code: false, name: false};
				$.dialog({
					padding:'0px',
			    	title:'添加角色面板',
			    	content:htm,
				    ok: function (){
				    
				    	var allowed = (allow.code && allow.name) ? true : false;
				    	if( !allowed ){
		    				return false;
		    			}
			    		var data = {
			    				id:  document.getElementById('id'),
			    				code: document.getElementById('code'),
			    				name: document.getElementById('name'),
			    				remark: document.getElementById('remark')
			    			};
			    		
			    		if(isAdmin=='isAdmin'){
			    			
			    			var isSystem = document.getElementById('is_custom_role').checked ? '1' : '0';
			    			
			    		}else{
			    			var isSystem = '1';
			    			
			    		}
			    		
		    			$.post(
		    				$.appClient.generateUrl({ESArchivePermission:'addRole'},'x'),
		    				{code: data.code.value, name: data.name.value, isSystem: isSystem, remark: data.remark.value, id: id.value},
		    				function (isok){
		    				
		    					if(isok){
		    					
		    						$('#roles').flexReload();
		    						
		    					}else{

		    						$.dialog.notice({title:false, content: '添加角色失败', icon: 'warning', time:2, lock: false});

		    					}
		    				}
		    			);
				    	
				    },
				    cancel:true,
			    	okVal:'保存',
			    	cancelVal:'取消'
			    });
				
			    /*---- 验证开始 ----*/
			    var id = document.getElementById('id'),
			    	code = document.getElementById('code'),
			   		name = document.getElementById('name'),
			   		remark = document.getElementById('remark'),
			    	prompt = document.getElementById('prompt_message');
			    
			    /* ------ 修改回流数据  ------ */
			    if( typeof data === 'object' ){
			    	allow.code = true;
			    	allow.name = true;
			    	id.value = data.roleId;
			    	code.value = data.roleCode;
			    	name.value = data.roleName;
			    	remark.value = data.roleRemark;
			    	code.style.background = '#f0f0f0';
			    	code.style.border = name.style.border = remark.style.border = '1px solid gray';
			    	code.setAttribute('readonly','readonly');
			    	if(data.isAdmin=='isAdmin'){
				    	if(Number(data.isSystem)){
				    		document.getElementById('is_custom_role').checked = true;
				    	}else{
				    		document.getElementById('is_system_role').checked = true;
				    	}
				    }
			    }
			    
			    code.onfocus = function (){
			    	if( typeof data === 'object' ){
			    		return;
			    	}
			    	prompt.innerHTML = '允许字母，数字，下划线，4-100个字符。例：admin_123';
			    	
			    };
			    code.onblur = function (){
			    	
				    	if( typeof data === 'object' ){
				    		allow.code = true;
				    		return;
				    	}
			    	
			    		if(vali.d(this.value)){
			    			this.style.border = '1px solid gray';
			    		}else{
			    			this.style.border = '1px solid red';
			    			return;
			    		}
			    	
			    	
			    	var This = this;
				    	$.post(
			    			$.appClient.generateUrl({ESArchivePermission:'CheckRoleCode'},'x'),
			    			{roleCode: This.value},
			    			function ( isExist ){
			    				
			    				if( isExist ){
			    					
			    					allow.code = true;
			    					This.style.border = '1px solid gray';
			    					
			    				}else{
			    					allow.code = false;
			    					
			    					This.value = This.value + ' [该角色标识已存在!]';
			    					This.style.border = '1px solid red';
			    				}
			    				
			    			}
			    		);
				    	
			    };
			    
			    name.onfocus = function (){
			    
			    	prompt.innerHTML = '4-100个任意字符';
			    	
			    };
			    name.onblur = function (){
			    
			    	prompt.innerHTML = '';
			    	if(vali.isRange(this.value,4,100)){
			    		
			    		allow.name = true;
			    		this.style.border = '1px solid gray';
			    		
			    	}else{
			    		allow.name = false;
			    		this.style.border = '1px solid red';
			    	}
			    	
			    };
			    
			    remark.onfocus = function (){
			  		prompt.innerHTML = '4-200个任意字符,可以为空';
			    };
			    remark.onblur = function (){
			    	prompt.innerHTML = '';
			    };
			    
			    /*---- 验证结束 ----*/
			}
		);
		
	}, // add is end
	modify: function ( that ){
		$.post(
			$.appClient.generateUrl({ESArchivePermission:'GetRoleByRoleid'},'x'),
			{roleId: that.id},
			function ( data ){
				
				role.add(data);
				
			},
			'json'
		);
	},
	remove: function (){
		var code = [],syscode = [],title = '';
		$('#roles tr input:checked').each(function (){
			
			var isSys = this.getAttribute('issystem');
				
				if(isSys == '0'){ // 0系统角色，1是自定义角色
					syscode.push(this.id);
				}else{
					code.push(this.id);
				}
			
		});
		
		if(!code.length && !syscode.length){ // 没选择任何角色
			$.dialog.notice({content: '请选择要删除的角色！', icon: 'warning', lock: false, time: 2});
			return;
		}
		
		if(code.length && !syscode.length){
			title = '确定删除角色！';
		}
		
		if(!code.length && syscode.length){
			title = '确定删除系统角色！';
		}
		
		if(code.length && syscode.length){ // 
			title = '删除的角色中存在系统角色，是否删除！';
		}
		
		code.push(syscode.join(','));
		
		$.dialog({
			content: title,
			icon: 'warning',
			okVal: '确定',
			cancelVal: '取消',
			cancel: true,
			ok: function (){
				$.post(
					$.appClient.generateUrl({ESArchivePermission:'removeRole'},'x'),
					{roleIds: code},
					function (isok){
						
						if(isok == 'success'){
						
							$('#roles').flexReload();
							
						}else if(isok == 'fail'){
						
							$.dialog.notice({content: '删除角色失败', icon: 'warning', time:2, lock: false});
							
						}else if(isok == 'hasbunding'){
							
							$.dialog.notice({content: '删除角色已经绑定用户', icon: 'warning', time:2, lock: false});
							
						}
					
					}
				);
			
			}
			
		});
		
	},
	
	
	
	/** xiaoxiong 20140505 修改检索组件创建方式 **/
	addSearch: function (){
		$("#ESSystemIndex").find('div[class="tDiv2"]').append('<span style="float:left;margin-bottom:5px;">&nbsp;</span><div class="find-dialog"><input id="dataQuery" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="dataQueryButton"></span></div>');

		$('#dataQueryButton').click(function(e){
			role.search();
		});
			
		$(document).keydown(function(event){
			if(event.keyCode == 13 && document.activeElement.id == 'dataQuery') {
				role.search();
			}
		});
//		/** 1、添加检索组件 **/
//		$('div[class="tDiv2"]').append('<span style="float:left;margin-bottom:5px;">&nbsp;</span><div class="find-dialog"><input id="search_role_input" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="search_role_input" value="请输入关键字" /><span id="search_role_input_button"></span></div>');
//		/** 2、给检索框添加回车事件监听 **/
//		$("#search_role_input").keydown(function(event){
//			if(event.keyCode == 13) {
//				role.search();
//			}
//		});
//		/** 3、给检索按钮添加点击事件监听 **/
//		$("#search_role_input_button").click(function(){
//			role.search();
//		});
	},
	/** xiaoxiong 20140505 修改检索执行方法 **/
	search: function (){
		var keyword = $.trim($('#dataQuery').val());
		if(keyword == '' || keyword=='请输入关键字') {
			keyword = '';
		}
		/** guolanrui 20140728 修改检索刷新后，页面停留在检索前的BUG：161 **/
		$("#roles").flexOptions({url:$.appClient.generateUrl({ESArchivePermission:'GetAllRoleList',keyWord:encodeURI(keyword)}),newp: 1}).flexReload();
	
		
//		var keyword=$.trim($('input[name="search_role_input"]').val());
//		if(keyword=='' || keyword=='请输入关键字') {
//			keyword = '';
//		}
//		var roleCode = {roleCode: keyword};
//		$('#roles').flexOptions({query: roleCode, newp:1}).flexReload();
	},
	refresh: function (){
		document.getElementById('search_role_input').value = '角色检索';
		$('#roles').flexOptions({query: '', newp: 1}).flexReload();
	}
};

role.getRoles();

// -- 角色结束 --------------------------------------------------------------------------

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
					
					g.treeObj.checkNode(treeNode, null, true);	//当单击节点时前面的复选框同时被选中
				
				}
			}
		}, // setting end
		display: function (that){
			var This = this;
				g.roleId = that.id;
				$.post(
					$.appClient.generateUrl({ESArchivePermission:'menu'},'x'),
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
						
						document.getElementById('name').value = that.name;		//把角色赋值给#roleName标签
				    	This.getTree();
					}
				);
		},
		getTree: function (){
			var This = this;
				$.post(
					$.appClient.generateUrl({ESArchivePermission:'getMenuAuth'},'x'),
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
				//guolanrui 20140730 当权限没有做任务修改时，给出提示BUG:317
				$.dialog.notice({content: '您没有做任何修改，不需要保存！', icon: 'warning', time: 3, lock: false});
				return false;
			}
			
			var checkNodes = g.treeObj.getCheckedNodes(true),nodeleng = checkNodes.length;
			var checkeds = [];
				for(var n=0; n<nodeleng; n++){
				
					checkeds.push(checkNodes[n].id);
				
				}
				
				$.post(
					$.appClient.generateUrl({ESArchivePermission:'SaveMenuAuth'},'x'),
					{roleId: g.roleId, checkeds: checkeds.join(','), resourId: menuAuth.resourId},
					function (isok){
						menuAuth.resourId = undefined;
						if(isok){ //### temp 具体返回值暂时不清楚
							$.dialog.notice({content: '保存成功', icon: 'succeed', time: 2, lock: false});
						}else{
							$.dialog.notice({content: '保存失败', icon: 'error', time: 2, lock: false});
						}
					}
				);
		}
};
//-- 菜单权限结束 --------------------------------------------------------------------------

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
						/** xiaoxiong 20140804 添加单击节点时，只能将未选中的节点选中，而不能将选中的节点取消 **/
						var rights = $(treeNode).attr('rights') ; 	
						if(treeNode.checked){
							if($(treeNode).attr('isLeaf') == '1'){
								dirAuth.displayRights(rights);
							} else {
								dirAuth.readOnlyRights();
							}
						} else {
							g.treeObj.checkNode(treeNode, null, true);	//当单击节点时前面的复选框同时被选中
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
								dirAuth.readOnlyRights();
								var checkedNodes = [] ;
								checkedNodes = dirAuth.getAllLeftChildren(checkedNodes, treeNode);
								var checkedNodesLength = checkedNodes.length ;
								for(var i=0; i<checkedNodesLength; i++) {
									if($(checkedNodes[i]).attr('isLeaf') == '1'){
										rights = $(checkedNodes[i]).attr('rights') ;
										if(rights == ''){
											$(checkedNodes[i]).attr('rights','DR,FR') ;
											$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'[DR,FR]') ;
										} else {
											$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'['+rights+']') ;
										}
										g.treeObj.updateNode(checkedNodes[i]);
									}
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
								dirAuth.displayRights("DR,FR");/** 默认：条目浏览，文件浏览 **/
								$(treeNode).attr('rights','DR,FR') ;
								$(treeNode).attr('name',$(treeNode).attr('realname')+'[DR,FR]') ;
							} else {
								dirAuth.displayRights(rights);
								$(treeNode).attr('name',$(treeNode).attr('realname')+'['+rights+']') ;
							}
						} else {
							dirAuth.readOnlyRights();
							var checkedNodes = [] ;
							checkedNodes = dirAuth.getAllLeftChildren(checkedNodes, treeNode);
							var checkedNodesLength = checkedNodes.length ;
							for(var i=0; i<checkedNodesLength; i++) {
								if($(checkedNodes[i]).attr('isLeaf') == '1'){
									rights = $(checkedNodes[i]).attr('rights') ;
									if(rights == ''){
										$(checkedNodes[i]).attr('rights','DR,FR') ;
										$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'[DR,FR]') ;
									} else {
										$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')+'['+rights+']') ;
									}
									g.treeObj.updateNode(checkedNodes[i]);
								}
							}
						}
						g.treeObj.selectNode(treeNode);
						g.treeObj.updateNode(treeNode);
					} else {
						$(treeNode).attr('name',$(treeNode).attr('realname')) ;
						dirAuth.readOnlyRights() ;
						g.treeObj.selectNode(treeNode);
						g.treeObj.updateNode(treeNode);
						var checkedNodes = [] ;
						checkedNodes = dirAuth.getAllLeftChildren(checkedNodes, treeNode);
						var checkedNodesLength = checkedNodes.length ;
						for(var i=0; i<checkedNodesLength; i++) {
							if($(checkedNodes[i]).attr('isLeaf') == '1'){
								rights = $(checkedNodes[i]).attr('rights') ;
								if(rights == ''){
									$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')) ;
								} else {
									$(checkedNodes[i]).attr('name',$(checkedNodes[i]).attr('realname')) ;
								}
								g.treeObj.updateNode(checkedNodes[i]);
							}
						}
					}
				}
			}
		}, // setting end
		getAllLeftChildren: function (childrens,treeNode){
			if(treeNode.isLeaf == '1')childrens.push(treeNode);
			if (treeNode.isParent){
				for(var obj in treeNode.children){
					dirAuth.getAllLeftChildren(childrens,treeNode.children[obj]);
				}
		    }
			return childrens;
		},
		display: function (that){

			g.roleId = that.id;
			g.bussModelId = 1;
			$.post(
				$.appClient.generateUrl({ESArchivePermission:'dir'},'x'),
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
			    	document.getElementById('name').value = that.name;		//把角色赋值给#roleName标签
			    	document.getElementById('mode').onchange = function (){
			    		g.bussModelId = this.value;
						dirAuth.getTree();
					};
			    	
			    }
			);
		},
		getTree: function (){
			$.post(
				$.appClient.generateUrl({ESArchivePermission:'getTreeNodes'},'x'),
				{roleId: g.roleId, bussModelId: g.bussModelId},
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
						//guolanrui 20140730 当权限没有做任务修改时，给出提示消息BUG：317
						$.dialog.notice({content: '您没有做任何修改，不需要保存！', icon: 'warning', time: 3, lock: false});
						return false;
					} else {
						var hasUpdate = false ;
						for(var i=0; i<checkedNodesLength; i++) {
							if($(checkedNodes[i]).attr('rights') != $(checkedNodes[i]).attr('oldrights')){
								savePath.push(checkedNodes[i].path+'|'+checkedNodes[i].rights);
								hasUpdate = true ;
							}
						}
						if(!hasUpdate){
							$.dialog.notice({content: '您没有做任何修改，不需要保存！', icon: 'warning', time: 3, lock: false});
							return false;
						}
					}
				}
				/** guolanrui 20140912 解决IE8下数组不支持indexOf的BUG:848 start **/
				if (!Array.prototype.indexOf){
					Array.prototype.indexOf = function(elt /*, from*/){
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
				/** guolanrui 20140912 解决IE8下数组不支持indexOf的BUG:848 end **/
				for(var i=0; i<nodeleng; i++)
				{
					
					if(changePath[i].checked){
						if(savePath.indexOf(1)==-1)savePath.push(changePath[i].path+'|'+changePath[i].rights);
					}else{
						deletePath.push(changePath[i].path);
					}
					
				}
				
				$.post(
					$.appClient.generateUrl({ESArchivePermission:'saveAuthTreeNode'},'x'),
					{roleId: g.roleId, bussModelId: g.bussModelId, savePath: savePath, deletePath: deletePath},
					function (isok){
						
							if(isok){ //### temp 具体返回值暂时不清楚
								$.dialog.notice({content: '保存成功', icon: 'succeed', time: 2, lock: false});
							}else{
								$.dialog.notice({content: '保存失败', icon: 'error', time: 2, lock: false});
							}
					}
				);
		}
};

dataAuth = {
		node: {},
		options: {},
		strus: [], // 数据节点被单击时返回是卷,卷内信息(如果卷内存在) 例:[{sid:6, title:文件目录, path:-archive_1-5@_-@6}]
		activeGridId: '', //xiaoxiong 20140909 将其修改为记录当前活动的grid的ID
		condition: {en: [], cn: []},
		stru: {}, // 用来储存数据表格中的新建,删除,修改时候用到的当前卷或卷内数据 {sid:6, title:文件目录, path:-archive_1-5@_-@6}
		authId: 'NULL', // 权限修改时id为当前行的authId,新建时id为'NULL'
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
					
					if(treeNode.sId == 0){
						document.getElementById('dataTbl').innerHTML = '<div style="width:520px; height:440px; line-height:100px; text-align:center; color:red; border-left:1px solid #ccc;">未设置结构</div>';
						return;
					}
					
					$.post(
						$.appClient.generateUrl({ESArchivePermission:'PreGetPackageRight'},'x'),
						{path: treeNode.path,treeid: dataAuth.node.treeId},
						function(strus){
							
							if(!strus.length)
								return;
							
							dataAuth.strus = strus;
							if(strus.length == 1){
								
								document.getElementById('dataTbl').innerHTML = "<table id='defaultTbl'></table><table id='fileTbl'></table>";
								dataAuth.defaultTbl(140);
								dataAuth.fileTbl(140, dataAuth.strus[0].path, 1);

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
				$.appClient.generateUrl({ESArchivePermission:'data'},'x'),
			    function(htm){
			    	$.dialog({
			    		title:'数据权限设置',
			    		padding:'0px',
			    	    ok: true,
				    	content:htm,
				    	okVal:'关闭'
				    });
				    
			    	dataAuth.getTree();
			    	document.getElementById('name').value = that.name;		//把角色赋值给#roleName标签
			    	document.getElementById('dataTbl').innerHTML = '<div style="width:520px; height:440px; line-height:100px; text-align:center; color:red; border-left:1px solid #ccc;">请选择目录节点！</div>';
			    	document.getElementById('mode').onchange = function (){
			    		g.bussModelId = this.value;
			    		dataAuth.getTree();
					};
			    	
			    }
			);
			
		},
		add: function (gridId, stru){ // 添加数据权限规则面板
				dataAuth.activeGridId = gridId;
//				alert(gridId);
//				alert(dataAuth.strus.length);
				dataAuth.stru = stru;
				var isfile = '0';
				if(gridId=='fileTbl'){
					isfile = '1';
				}else if(dataAuth.strus.length == 2 && gridId=='defaultTbl'){
					isfile = '2';
				}
				$.post(
				    $.appClient.generateUrl({ESArchivePermission:'add_rule'},'x'),
//				    {sId: dataAuth.stru.sid, isfile:(gridId=='fileTbl'?'1':'0')},
				    {sId: dataAuth.stru.sid, isfile:isfile},
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
				    	    	dataAuth.authId = 'NULL'; // init
								dataAuth.condition= {cn: [], en:[]}; // init
				    	    }
					    });
				    }
				);
		},
		modify: function (tr){
//			var columns = ['condition','permission'];
//			var colValues = $("#defaultTbl").flexGetColumnValue(tr,columns);
//			alert(colValues);
			var isfile = '0';
			if(dataAuth.activeGridId=='fileTbl'){
				isfile = '1';
			}else if(dataAuth.strus.length == 2 && dataAuth.activeGridId=='defaultTbl'){
				isfile = '2';
			}
			$.post(
			    $.appClient.generateUrl({ESArchivePermission:'edit_rule'},'x'),
			    {sId: dataAuth.stru.sid, authId: dataAuth.authId, isfile:isfile},
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
							$.appClient.generateUrl({ESArchivePermission:'deleteDataAuth'},'x'),
							/** xiaoxiong 20140731 添加角色ID与业务类型标示 **/
							{authId: authId, roleId: g.roleId, bussModelId: g.bussModelId},
							function (isok){
								if(isok){
									$('#' + gridId).flexReload();
								}else{
									$.dialog.notice({content: '保存失败', icon: 'error', lock:false, time:2});
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
//				alert(222);
				if(!dataAuth.condition.en.length){
					//guolanrui 20140730 当没有设置任何条件的时候就是对全部数据生效
					dataAuth.condition.en.push('all');
					dataAuth.condition.cn.push('全部数据');
//					return;
				}
//				alert(33);
				// 六个权限
			var rDiv = document.getElementById('rights').children,rDivleng = rDiv.length-2,rights = {};
				for(var r=0; r<rDivleng; r++){ // 屏蔽全选和反选按钮
					var cbox = rDiv[r].firstChild;
						rights[cbox.id] = cbox.checked ? '1' : '0';
				}
			var data = {
					roleId: g.roleId,
					bussModelId: g.bussModelId,
					treeId: dataAuth.node.treeId,
					path: dataAuth.stru.path
					
				};
				
				data.data = rights;
				data.data.dataAuth = dataAuth.condition.en;
				data.data.id = dataAuth.authId;
			

			$.post(
				$.appClient.generateUrl({ESArchivePermission:'saveDataAuth'},'x'),
				data,
				function (result){
					var isok = result.success;
					if(isok){
						dataAuth.authId = 'NULL'; // init
						dataAuth.condition= {cn: [], en:[]}; // init
						$("#"+dataAuth.activeGridId).flexReload() ;
						art.dialog.list['addDataRuleDialog'].close();
					}else{
//						dataAuth.authId = 'NULL'; // init
						dataAuth.condition= {cn: [], en:[]}; // init
						$.dialog.notice({content: result.msg, icon: 'warning', lock:false, time:3});
					}
				},
				'json'
			);
			return false;
		},
		getTree: function (){ // 数据树
			$.post(
				$.appClient.generateUrl({ESArchivePermission:'getCheckedTreeNodes'},'x'),
				{roleId: g.roleId, bussModelId: g.bussModelId},
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
//			var titleStr = dataAuth.node.name +' • '+ dataAuth.strus[0].title;
			var titleStr = dataAuth.strus[0].title;
			var titleTpl = titleStr;
			if(titleStr.length>15){
				titleStr = titleStr.substring(0, 13) + '...';
			}
//			$("#dataTbl").find('div[class="tDiv2"]').append('<div><span style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">'+titleStr+'</span></div>');
			var url = $.appClient.generateUrl({ESArchivePermission: 'getDataAuth', roleId: g.roleId, path: dataAuth.strus[0].path, bussModelId: g.bussModelId},'x');
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
//					   20140507 wangbo  加了两列显示中文条件和权限类型
				],
				buttons : [
		           {name: '新建', bclass: 'add', onpress: function (){dataAuth.add('defaultTbl', dataAuth.strus[0]);}},
		           {name: '删除', bclass: 'delete', onpress: function (){dataAuth.remove('defaultTbl', dataAuth.strus[0]);}}
//		           {name: '<font style="margin: 0px 2px 0 -14px; float: left;"><input style="width:13px;height:13px;background:none;cursor:default;" onclick="dataAuth.isSelectSection()" class="transfer" type="checkbox" /></font>是否跨部门',tooltip:"1、设置是否拼接用户orgid字段；\n2、勾选为跨部门不拼接orgid；不勾选则要拼接orgid。"},
//		           {name: '<font style="margin: 0px 2px 0 -14px; float: left;"><input style="width:13px;height:13px;background:none;cursor:default;" onclick="dataAuth.isDataAuthPriority()" class="transfer" type="checkbox" /></font>是否数据权限优先',tooltip:"1、设置和orgid的关系是or或and的关系；\n2、不勾选和orgid的关系为and（只看本部门下的数据）； 勾选和orgid的关系为or。"}
//		              20140507 wangbo 注释掉上方两个按钮
		           ],
//				title: (dataAuth.node.name +' • '+ dataAuth.strus[0].title),
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
//			var titleStr = dataAuth.node.name +' • '+ dataAuth.strus[1].title;
			var titleStr = dataAuth.strus[1].title;
			var titleTpl = titleStr;
			if(titleStr.length>15){
				titleStr = titleStr.substring(0, 13) + '...';
			}
			var url = $.appClient.generateUrl({ESArchivePermission: 'getDataAuth', roleId: g.roleId, path: dataAuth.strus[1].path, bussModelId: g.bussModelId},'x');
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
//					   20140507 wangbo  加了两列显示中文条件和权限类型
				],
				buttons : [
					{name: '新建', bclass: 'add', onpress: function (){dataAuth.add('struTbl', dataAuth.strus[1]);}},
					{name: '删除', bclass: 'delete', onpress: function (){dataAuth.remove('struTbl', dataAuth.strus[1]);}}
				],
//				title: (dataAuth.node.name +' • '+ dataAuth.strus[1].title),
				useRp: false,
				resizable: false,
				nomsg:"没有数据",
				showTableToggleBtn: false,
				width: 560,
				height: height
			});
			$("#dataTbl").find('div[class="tDiv2"]').eq(1).prepend('<span title="'+titleTpl+'" style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">'+titleStr+'</span>');
		},
		fileTbl: function (height, innerFilePath, level){
//			var titleStr = dataAuth.node.name +' • '+ dataAuth.strus[1].title;
			var titleStr = '电子文件级';
			var fielStru = {} ;
			fielStru.sid = dataAuth.strus[level-1].sid ;
			fielStru.path = innerFilePath+'-@file' ;
			fielStru.secflag = dataAuth.strus[level-1].secFlag ;
			fielStru.dataflag = dataAuth.strus[level-1].dataflag ;
			var titleTpl = titleStr;
			if(titleStr.length>15){
				titleStr = titleStr.substring(0, 13) + '...';
			}
			var url = $.appClient.generateUrl({ESArchivePermission: 'getDataAuth', roleId: g.roleId, path: innerFilePath+'-@file', bussModelId: g.bussModelId},'x');
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
//					   20140507 wangbo  加了两列显示中文条件和权限类型
				            ],
				            buttons : [
				                       {name: '新建', bclass: 'add', onpress: function (){dataAuth.add('fileTbl', fielStru);}},
				                       {name: '删除', bclass: 'delete', onpress: function (){dataAuth.remove('fileTbl', fielStru);}}
				                       ],
//				title: (dataAuth.node.name +' • '+ dataAuth.strus[1].title),
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
				//guolanrui 20141010 添加对权限个数的判断，防止案卷级或者电子文件级只有3个权限时，勾选有问题BUG:1248
				  if(that.id === 'fileRead'){
					  if(leng == 6){//guolanrui 20141010 表示有6个权限复选框
						  if(divDom[0].children[0].checked){
							  divDom[3].children[0].checked = true;
						  }else{
							  divDom[1].children[0].checked = false;
							  divDom[2].children[0].checked = false;
						  }
					  }else{//guolanrui 20141010 表示只有3个权限复选框
						  if(!divDom[0].children[0].checked){
							  divDom[1].children[0].checked = false;
							  divDom[2].children[0].checked = false;
						  } 
					  }
				  }
				  if(that.id === 'itemRead'){
					  if(leng == 6){//guolanrui 20141010 表示有6个权限复选框
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
					  if(leng == 6){//guolanrui 20141010 表示有6个权限复选框
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
					  if(leng == 6){//guolanrui 20141010 表示有6个权限复选框
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
					  if(leng == 6){//guolanrui 20141010 表示有6个权限复选框
						  if(divDom[1].children[0].checked){
							  divDom[0].children[0].checked = true;
							  divDom[3].children[0].checked = true;
						  }
					  }else{
						  if(divDom[1].children[0].checked){
							  divDom[0].children[0].checked = true;
//							  divDom[3].children[0].checked = true;
						  }
					  }
				  }
				  if(that.id === 'itemDelete'){
					  if(leng == 6){//guolanrui 20141010 表示有6个权限复选框
						  if(divDom[5].children[0].checked){
//							  divDom[0].children[0].checked = true;
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
		//是否跨部门 倪阳添加 2013-10-14
		isSelectSection:function() {
			var treeId = dataAuth.node.treeId;
			var istransdepartment = $('input[class="transfer"]:first').attr("checked") == "checked" ? 'true' : 'false';
			var url = $.appClient.generateUrl({ESArchivePermission:'setTransDepartment',treeid:treeId,istransdepartment:istransdepartment},'x');
			$.get(url, function(data){
				if(data) {
					$.dialog.notice({content: '设置成功', time: 2, icon: 'succeed'});
					$.get($.appClient.generateUrl({ESArchivePermission:'getTransDepartment',treeid:treeId},'x'),function(data) {
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
		//设置数据权限是否优先级(相对于部门而言) 倪阳添加 2013-10-31
		isDataAuthPriority: function() {
			var treeId = dataAuth.node.treeId;
			var isDataAuthPriority = $('input[class="transfer"]:last').attr("checked") == "checked" ? 'true' : 'false';
			var url = $.appClient.generateUrl({ESArchivePermission:'setDataAuthPriority',treeid:treeId,isDataAuthPriority:isDataAuthPriority},'x');
			$.get(url, function(data){
				if(data) {
					$.dialog.notice({content: '设置成功', time: 2, icon: 'succeed'});
				} else {
					$.dialog.notice({content: '设置失败，请稍候再试！', time: 3, icon: 'error'});
				}
			});
		}
};

var unit = {
	treeObj: undefined,
	setting: { // 归档单位树
			view: {
					dblClickExpand: true,
					showLine: false
				},
			data: {
				simpleData: {
					enable: true
				}
			},
			async: {
					enable: true,
					url: $.appClient.generateUrl({ESUserManage:'GetOrgList'},'x'),
					autoParam: ["id"]
			},
			check: {
				enable:true,
				chkboxType: { "Y": "", "N": "" }
			},
			callback: {
				onClick: function (e,treeId, treeNode){
					
					unit.treeObj.checkNode(treeNode, null, true);	//当单击节点时前面的复选框同时被选中
				
				}
			}
	}, // setting end
	display: function (){// 归档单位界面
				
			var unitNameArea = document.getElementById('unit_name'),displayUnitBtn = document.getElementById('display_unit');
			var unitName = unitNameArea.value;
			
				if(!vali.isRange(unitName, 1, 20)){
					
					unitNameArea.style.border = '1px solid #f00';
					displayUnitBtn.style.background = '#f00';
					return;
					
				}else{
					
					unitNameArea.style.border = '1px solid #587AB0';
					displayUnitBtn.style.background = '#587AB0';
					
				}
				
			// 根据用户输入"归档单位"去查找归档单位对应的编码标识
			var unitCode = 'NULL'; // 防止找不到
				for(var o in dataAuth.options){
					
					if(dataAuth.options[o] == unitName){
					
						unitCode = o; // C32
						break;
					}
				
				}
				
				if(unitCode === 'NULL'){
					unitNameArea.style.border = '1px solid #f00';
					displayUnitBtn.innerHTML = '未找到归档单位';
					displayUnitBtn.style.background = '#f00';
					return;
				}else{
					unitNameArea.style.border = '1px solid #587AB0';
					displayUnitBtn.innerHTML = '归档单位';
					displayUnitBtn.style.background = '#587AB0';
				}
			
				
					
			var htm_ = "<div class='company-list-tree'><div class='ztree' id='company_list'><span class='wait-loading'></span></div>";
			
				$.dialog({
					title: '归档单位选择',
					padding: '0px',
					content: htm_,
					okVal: '确定',
					cancelVal: '取消',
					ok: function (){
						
							dataAuth.condition.cn = []; // init
							dataAuth.condition.en = []; // init
							
							/*
							 * 取得用户选择的单位
							 * 拼接筛选条件和写日志数据
							 * 
							 */
							var nodes = unit.treeObj.getCheckedNodes(true);
							var unitNames = [];
							for(var n in nodes){
								
								if(	nodes[n].id.length === 11){
									
									dataAuth.condition.en.push(unitCode +',equal,'+ nodes[n].id + ',true');
									dataAuth.condition.cn.push(unitName +'等于'+ nodes[n].name + '并且');
									unitNames.push(nodes[n].name);
									
								}
							}
						
						var title = document.getElementById('unit_title');
						
							//title.innerHTML = title.innerHTML + ' (共'+ dataAuth.condition.en.length +'个)';
							title.innerHTML = ' (共'+ dataAuth.condition.en.length +'个)';
							document.getElementById('unit_list').innerHTML = unitNames.join('，');
							document.getElementById('display_unit').innerHTML = '重设'+ unitName;
						
						
					},
					cancel: true
				});
				
				unit.getTree();
		},
		getTree: function (){
			$.post(
				$.appClient.generateUrl({ESArchivePermission:'GetOwnOrgByUserId'},'x'),
				function (nodes){
					
					unit.treeObj = $.fn.zTree.init($("#company_list"), unit.setting, nodes);

				},
				'json'
			);
		}
};
	

var vali = { // 验证
		
		d: function (s){ // 4-100
		
			var d = /^\w{4,100}$/;
			return d.exec(s) ? true : false;
			
		},
		isRange: function (s,min,max){
		
			return s.length <= max && s.length >= min ? true : false;
		
		},
		isEmpty: function (s){
			
			return s.length ? true : false;
			
		},
		word_min1: function (s){
			var d = /^\w{1,30}$/;
			return d.exec(s) ? true : false;
		}
		
	};

/*
 * 复选框全选,取消全选,选中一个
 * checkBox.selectOne(this);
 * checkBox.selectAll(this,tblId));
 */
var checkBox = {
	selectOne : function (that){ // 单选|取消单选
		if($(that).attr('checked')=='checked'){
			$(that).closest('tr').addClass('trSelected');
		}else{
			$(that).closest('tr').removeClass('trSelected');
		}
	},
	selectAll : function (that,tblId){ // 全选|取消全选
		if($(that).attr('checked')=='checked'){
			$(that).attr('checked','checked');
			$('#'+tblId).find('tr').addClass('trSelected');
			$('#'+tblId).find('tr input[type="checkbox"]').attr('checked','checked');
		}else{
			$(that).removeAttr('checked');
			$('#'+tblId).find('tr').removeClass('trSelected');
			$('#'+tblId).find('tr input[type="checkbox"]').removeAttr('checked');
		}
	},
	cancelOne : function (cbObj){ // $('#id=4')
		cbObj.removeAttr('checked');
	},
	cancelAll : function (tblId){ // $('$tbl')
		var inputs = tblId.find('input[checked="checked"]');
		var l = inputs.length;
		for(var i=0; i<l; i++)
		{
			inputs.eq(i).removeAttr('checked');
		}
	}
};

//全选|不全选@方吉祥
$('#checked_role').live('click',function(){
	checkBox.selectAll(this, 'roles');
});
$('#checked_default').live('click',function(){
	checkBox.selectAll(this, 'defaultTbl');
});
$('#checked_stru').live('click',function(){
	checkBox.selectAll(this, 'struTbl');
});
$('#checked_file').live('click',function(){
	checkBox.selectAll(this, 'fileTbl');
});
// 单选
$('input[checkone="1"]').live('click',function(){
	checkBox.selectOne(this);
});

// 修改角色
$('#roles .edits').live('click', function (){

	role.modify(this);
	
});

//菜单权限
$('.menus').live('click', function (){
	menuAuth.display(this);
});

//目录权限
$('.dirs').live('click', function (){
	dirAuth.display(this);
});

//数据权限
$('.datas').live('click', function (){
	dataAuth.display(this);
});

//打开数据权限编辑
$(document).on('click', '#defaultTbl .edits', function (){
	dataAuth.activeGridId = 'defaultTbl' ;
	dataAuth.stru = dataAuth.strus[0];
	dataAuth.authId = this.id;
	
//	alert($(this).closest("tr"));
	dataAuth.modify($(this).closest("tr"));
	
});
//打开数据权限编辑
$(document).on('click', '#struTbl .edits', function (){
	dataAuth.activeGridId = 'struTbl' ;
	dataAuth.stru = dataAuth.strus[1];
	dataAuth.authId = this.id;
	dataAuth.modify(this);
	
});
//xiaoxiong 20140909 电子文件级数据权限编辑处理方法
$(document).on('click', '#fileTbl .edits', function (){
	dataAuth.activeGridId = 'fileTbl' ;
	var level = dataAuth.strus.length ;
	var fielStru = {} ;
	fielStru.sid = dataAuth.strus[level-1].sid ;
	fielStru.path = dataAuth.strus[level-1].path+'-@file' ;
	fielStru.secflag = dataAuth.strus[level-1].secFlag ;
	fielStru.dataflag = dataAuth.strus[level-1].dataflag ;
	dataAuth.stru = fielStru;
	dataAuth.authId = this.id;
	dataAuth.modify(this);
	
});

//打开归档单位窗口
$(document).on('click', '#display_unit', function (){

	unit.display();
	
});

//数据权限checkbox
$('#rights input').live('click', function (){
	dataAuth.checkbox(this);	
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
//	alert(document.getElementById('condition').children.length);
	//guolanrui 20140904 修改删除行时的BUG：876
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


window.onload = function (){
	$("#estabs").esTabs("open", {title:"档案权限管理", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "档案权限管理");
	role.addSearch();
};
	
})();
