
/*
 * 方吉祥
 * 档案销毁模块
 * 信息发布模块
 * 2013/1/29
 * 
 */

// ++++ 档案销毁模块,方吉祥,20130312 ++++ //
var _globalVar = {
	node: undefined, // 审批节点
	havingCheckb: undefined, // true|false
	havingExt: undefined, // true|false
	havingTo:undefined
};
var $archive_destroy = {
	prompt : function (){
		$.dialog.notice({
			content:'请输入您的意见',
			lock:false,
			icon:'warning',
			time:2
		});
	},
	flowsheet_form : function (workId,taskId,template){ // 鉴定,销毁表单
						$.post(
							$.appClient.generateUrl({ESCollaborative:'flowsheet_form'},'x'),
							{workId:workId,taskId:taskId,template:template}, // template = destroy|identify
							function (data){
								var tpl = template == 'destroy' ? '销毁' : '鉴定';
								$.dialog({
									id:'_flowsheet_',
									title:'档案'+tpl+'流程',
									content:data,
									width:800,
									height:430,
									padding:'0',
									cancelVal:'关闭',
									cancel:true
								});
								
								var formId = $('#formId').val();
								
								_globalVar.havingTo = _globalVar.havingCheckb = _globalVar.havingExt = document.getElementById('jointSignApproval') ? 'true' : 'false';
								var p = {
										ESArchiveDestroy:'GetDetailList',
										formId:formId,
										status:'destroy',
										cb: _globalVar.havingCheckb,
										ext: _globalVar.havingExt
									};
								
								$lists.destroy_list($.appClient.generateUrl( p, 'x')); // 初始化销毁单列表
								
									
								if(($('#status').val() == 'identify' && !document.getElementById('fileDepartmentApproval')) || !taskId){
									var p = {
											ESArchiveDestroy:'GetDetailList',
											formId:formId,
											status:'reserve',
											cb: _globalVar.havingCheckb,
											ext: _globalVar.havingExt
										};
									
									var gp = {
											ESArchiveDestroy:'GetUserGroupList',
											formId:formId
										};
									$lists.group_list($.appClient.generateUrl( gp, 'x')); // 组员
									$lists.reserve_list($.appClient.generateUrl( p, 'x')); // 初始化保留列表
									
								}
								
							}
						);

	},
	agree : function (){
		if(!$('#writer_textarea').val()){
			$archive_destroy.prompt();
			return;
		}
		
		if(_globalVar.node=='fileDepartmentApproval'){
			
			_appraisers.init(); // 初始化鉴定人员窗口
			return;
			
		}else if(_globalVar.node=='jointSignApproval'){
			
			_appraisers.init2(); // 初始化鉴定人员窗口
			
		}else if(_globalVar.node=='fileSliceApproval'){
			
			this.define_task('Approve');
			
		}
	},
	back : function (){
		if(!$('#writer_textarea').val()){
			$archive_destroy.prompt();
			return;
		}

		var that = this;
		
		$.dialog({
			content:'确定退回',
			icon: 'warning',
			okVal:'确定',
			cancelVal:'取消',
			ok:function (){
				that.define_task('Reject');
			},
			cancel:true
		});
	},
	/*
	 * node = fileDepartmentApprovalResult:部门领导|fileSliceApprovalResult:最终审批|jointSignApprovalResult:会签
	 *
	 * define_task('');
	 *
	 */
	 
	define_task : function (agree,uid){ 
	
		var taskId = $('#taskId').val();
		var workId = $('#workId').val();
		var formId = $('#formId').val();
		var status = $('#status').val();
		var desc = $('#writer_textarea').val(); // 审批人意见
		var node = _globalVar.node; // fileDepartmentApproval

		var params = {
				taskId: taskId,
				workId: workId,
				formId: formId,
				desc: desc,
				agree: agree,
				node: node,
				difference: status
			};
		if(agree == 'Approve'){
			if(node=='fileDepartmentApproval'){ // 领导
				
				var userInfo = $('#group_tbl tr input[type="radio"]:checked').val(); // 
				params.who = userInfo.split('@')[0];
				
			}else if(node=='jointSignApproval'){ // 会签
				params.who = uid;
			}else if(node=='fileSliceApproval'){ // 审核人
			}
		}
		
		$.post(
			$.appClient.generateUrl({ESCollaborative:'TaskOperationIdentification'},'x'),
			params,
			function (isok){
				if(isok){
					var dialog = $.dialog.list;
					for(var i in dialog){
						dialog[i].close();
					}
					$('#mylist').flexReload();
					
					$.dialog.notice({
						content:'提交成功',
						icon:'succeed',
						lock:false,
						time:2
					});
					
				}else{
					$.dialog.notice({
						content:'提交失败',
						icon:'error',
						lock:false,
						time:2
					});
				}
			}
		);
	}
};

var $lists = {
		destroy_list: function (url,whoIs){ // 销毁列表 whoIs = true|false
			var that = this;
			var col = [
						{display: '查看', name : 'see', width : 24, sortable : true, align: 'center'},
						{display: '档号', name : 'code', width : 100, sortable : true, align: 'center'},
						{display: '题名', name : 'title', width : 100, sortable : true, align: 'center'},
						{display: '归档日期', name : 'date', width :100, sortable : true, align: 'center'},
						{display: '成文日期', name : 'createDate', width :100, sortable : true, align: 'center'},
						{display: '责任者', name : 'creator', width :100, sortable : true, align: 'center'},
						{display: '保管期限', name : 'years', width :100, sortable : true, align: 'center'}
					];
			var btn = [{name: '筛选', tooltip:'筛选', bclass: 'filter', onpress:that.dfilter}, {name:'还原', tooltip:'还原数据', bclass:'refresh', onpress:that.drefresh}];
			
			if(_globalVar.havingTo == 'true'){
				btn.unshift({name:'移入保留清单', tooltip:'移入保留清单', bclass:'undo', onpress:that.toReserve});
				col.unshift({display: '序号', name : 'line', width : 24, sortable : true, align: 'center'}, {display: '<input type="checkbox" id="sinputD" />', name : 'cb', width : 24, sortable : true, align: 'center'});
			}else{
				col.unshift({display: '序号', name : 'line', width : 24, sortable : true, align: 'center'});
			}
			
			$('#destroy_list').flexigrid({
				title: '销毁清单',
				url: url,
				dataType: 'json',
				colModel : col,
				buttons: btn,
				usepager: true,
				useRp: true,
				rp: 20,
				procmsg: "正在加载，请稍等",
				nomsg: "没有数据",
				resizable: false,
				pagetext: '第',
				outof: '页 /共',
				width: 748,
				height: 200,
				pagestat: ' 显示 {from} 到 {to}条 / 共{total} 条'
			});
		
		},	
		reserve_list: function (url,whoIs){ // 保留列表
			var that = this;
			var btn = [{name: '筛选', tooltip:'筛选', bclass: 'filter', onpress:that.rfilter}, {name:'还原', tooltip:'还原数据', bclass:'refresh', onpress:that.rrefresh}];
			var col = [
						{display: '查看', name : 'see', width : 24, sortable : true, align: 'center'},
						{display: '档号', name : 'code', width : 100, sortable : true, align: 'center'},
						{display: '题名', name : 'title', width : 100, sortable : true, align: 'center'},
						{display: '归档日期', name : 'date', width :100, sortable : true, align: 'center'},
						{display: '成文日期', name : 'createDate', width :100, sortable : true, align: 'center'},
						{display: '责任者', name : 'creator', width :100, sortable : true, align: 'center'},
						{display: '保管期限', name : 'years', width :100, sortable : true, align: 'center'},
						{display: '延长保管期限(年)', name : 'ext_years', width :100, sortable : true, align: 'center'},
						{display: '保留原因', name : 'because', width :100, sortable : true, align: 'center'}
					];
			
			
			if(_globalVar.havingTo == 'true'){
				btn.unshift({name:'移入销毁清单', tooltip:'移入销毁清单', bclass:'redo', onpress:that.toDestroy});
				col.unshift({display: '序号', name : 'line', width : 24, sortable : true, align: 'center'}, {display: '<input type="checkbox" id="sinputR" />', name : 'cb', width : 24, sortable : true, align: 'center'});
			}else{
				col.unshift({display: '序号', name : 'line', width : 24, sortable : true, align: 'center'});
			}
			
			$('#reserve_list').flexigrid({
					title: '保留清单',
					url: url,
					dataType: 'json',
					colModel : col,
					buttons: btn,
					usepager: true,
					useRp: true,
					rp: 20,
					procmsg:"正在加载，请稍等",
					nomsg:"没有数据",
					resizable:false,
					pagetext: '第',
					outof: '页 /共',
					width: 748,
					height: 200,
					pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});
	},
	group_list : function (url){
		$('#group_list').flexigrid({
			url: url,
			dataType: 'json',
			colModel : [
				{display: '序号', name : 'linenumber', width : 24, align: 'center'},
				{display: '组长', name : 'radio', width : 40, align: 'center'},
				{display: '姓名', name : 'userName', width : 100, align: 'center'},
				{display: '机构', name : 'orgName', width :100, align: 'center'},
				{display: '职务', name : 'deptPost', width :100, align: 'center'},
				{display: '联系方式', name : 'mobTel', width :100, align: 'center'}
			],
			usepager: true,
			title: '鉴定组成员',
			useRp: true,
			rp: 20,
			procmsg:"正在加载，请稍等",
			nomsg:"没有数据",
			resizable:false,
			pagetext: '第',
			outof: '页 /共',
			width: 748,
			height: 200,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
	},
	dfilter: function (){
		_tool.filter('destroy');
	},
	drefresh: function (){
		_tool.refresh('destroy');
	},
	rfilter: function (){
		_tool.filter('reserve');		
	},
	rrefresh: function (){
		_tool.refresh('reserve');	
	},
	toDestroy : function (){ // 移入销毁清单
		if(!$('#reserve_list input:checked').length){
			_validate.alert('请选择移入数据','warning');
			return;
		}
		$.dialog({
			content: '确定移入销毁清单',
			icon: 'warning',
			okVal: '确定',
			cancelVal: '取消',
			ok: function (){ _tool.sendData('destroy');},
			cancel:true
		});
	},
	toReserve : function (){ // 移入保留清单
		var leng = $('#destroy_list input:checked').length;
		if(!leng){
			_validate.alert('请选择移入数据','warning');
			return;
		}
		
		var htm = ['<div class="write_reason">'];
			htm.push('<div class="items"><h2>延长保管期限(1-99年)</h2><p><input type="text" id="Years" /></p></div>');
			htm.push('<div class="items"> <h2>延长保管说明(10-200字符)</h2> <p><textarea id="Reason"></textarea></p></div>');
			htm.push('</div>');
		
		$.dialog({
			title: '请输入保管期限和保留原因 (共 '+ leng +'条)',
			content: htm.join(''),
			okVal: '确定',
			cancelVal: '取消',
			ok:function (){
				
				if(!_validate.yearsExt('Years')){
					return false;
				}
				if(!_validate.yearsExtDesc('Reason')){
					return false;
				}
									
				_tool.sendData('reserve');
			},
			cancel:true
		});
		
	}
};

//---------------------------添加鉴定人员---------------------------------------//


//用户树
var _userTree = {

	initTree : {
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
			enable:true,
			type:'get',
			url:$.appClient.generateUrl({ESIdentify:'GetOrgList'},'x'),
			autoParam:["id=oid"]
		},
		callback: {
			onClick: function (event, nodeId, treeNode){
				var url = $.appClient.generateUrl({ESArchiveDestroy:'FindUserListByOrgid',oid:treeNode.id},'x');
				$("#user_tbl").flexOptions({url:url}).flexReload();
			}
		}
	},
	init2Tree : {
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
			enable:true,
			type:'get',
			url:$.appClient.generateUrl({ESIdentify:'GetOrgList'},'x'),
			autoParam:["id=oid"]
		},
		callback: {
			onClick: function (event, nodeId, treeNode){
				var url = $.appClient.generateUrl({ESArchiveDestroy:'FindUserListByOrgid',oid:treeNode.id},'x');
				$("#terminator_tbl").flexOptions({url:url}).flexReload();
			}
		}
	}
};

// 鉴定人员
var _appraisers = {
		init : function (){
			var btn = [
						{name:'删除', bclass:'delete', onpress: this.rm},
						{name:'提交', bclass:'save', onpress: this.save}
					];
			$.getJSON(
				$.appClient.generateUrl({ESIdentify:'GetOrg'},'x'),
				function (nodes){
					var html = ['<div class="user_box">'];
					html.push('<div class="group_list" id="group_list"><table id="group_tbl"></table></div>');
					html.push('<div class="ztree user_ztree" id="user_ztree"></div>');
					html.push('<div class="user_tbl"><table id="user_tbl"></table></div>');
					html.push('</div>');
					
					var formId = $('#formId').val(); // 表单id

					$.dialog({
						id:'appraiser_window',
						title:'选择鉴定人员',
						content:html.join(''),
						padding:'0',
						cancelVal:'关闭',
						cancel:true
					});
					
					$.fn.zTree.init($('#user_ztree'),_userTree.initTree,nodes);
					// 用户列表
					$("#user_tbl").flexigrid({
						url:false,
						dataType: 'json',
						colModel : [
							{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
							{display: '选择', name : 'radio', width : 40, align: 'center'},
							{display: '姓名', name : 'userName', width : 80, align: 'center'},
							{display: '部门', name : 'orgName', width : 280, align: 'center'},
							{display: '职务', name : 'deptPost', width : 280, align: 'center'},
							{display: '联系方式', name : 'mobTel', width : 280,align: 'center'}
						],
						usepager: true,
						nomsg: '没有数据',
						useRp:true,
						width:640,
						height:242
					});
					
					// 组员列表
					$("#group_tbl").flexigrid({
						url: $.appClient.generateUrl({ESArchiveDestroy:'GetUserGroupList', formId: formId},'x'),
						dataType: 'json',
						buttons : btn,
						//editable : true,
						colModel : [
							{display: '序号', name : 'linenumber', width : 24, align: 'center'}, 
							{display: '<input type="checkbox" id="sinput" />', name : 'cb', width : 24, align: 'center'},
							{display: '组长', name : 'radio', width : 24, align: 'center'},
							{display: '姓名', name : 'userName', width : 100, align: 'center'},
							{display: '机构', name : 'orgName', width : 100, align: 'center'},
							{display: '职务', name : 'deptPost', width : 100, align: 'center'},
							{display: '联系方式', name : 'mobTel', width : 100, align: 'center'}
						],
						usepager: false,
						width:900,
						height:145
					});
				});
		},
		init2 : function (){
			$.getJSON(
					$.appClient.generateUrl({ESIdentify:'GetOrg'},'x'),
					function (nodes){
						var html = ['<div class="terminator_box">'];
						html.push('<div class="ztree terminator_ztree" id="terminator_ztree"></div>');
						html.push('<div class="terminator_tbl"><table id="terminator_tbl"></table></div>');
						html.push('</div>');
						
						$.dialog({
							id:'terminatorWindow',
							title:'选择审核人',
							content:html.join(''),
							padding:'0',
							cancelVal:'关闭',
							cancel:true
						});
						
						$.fn.zTree.init($('#terminator_ztree'),_userTree.init2Tree,nodes);
						// 用户列表
						$("#terminator_tbl").flexigrid({
							url:false,
							dataType: 'json',
							colModel : [
								{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
								{display: '选择', name : 'radio', width : 40, align: 'center'},
								{display: '姓名', name : 'userName', width : 80, align: 'center'},
								{display: '部门', name : 'orgName', width : 280, align: 'center'},
								{display: '职务', name : 'deptPost', width : 280, align: 'center'},
								{display: '联系方式', name : 'mobTel', width : 280,align: 'center'}
							],
							usepager: true,
							nomsg: '没有数据',
							useRp:true,
							width:640,
							height:440
						});
					});
		},
		add : function (that){ // 添加鉴定人员
				var is_allow_add = true; // 默认某用户可添加,当列表中存在该用户时不可添加
				var radio = that.find('input');
				radio.attr('checked','checked');
				var infos = radio.val();
				
				var infoa = infos.split('@'); // yanbo@闫波@中国联通总部管理部门@总经理@88888888888,
				var uid = infoa[0]; // 用户ID
				var une = infoa[1]; // 中文名
				var org = infoa[2]; // 机构
				var dep = infoa[3]; // 职务
				var tel = infoa[4]; // 联系
				
				var lineNumber = $("#group_tbl tr").length;
			
				// 遍历当前选择列表中存在该用户则不再添加
				for(var i=0; i<lineNumber; i++){
					if($('#group_tbl tr:eq('+i+')').find('input[name="info"]').val() == infos){ 
						is_allow_add = false;
						return;
					}
				}
			
				if(!is_allow_add) return;
			
				var infoData = [{
							"id":"",
							"cell":{
								"linenumber":lineNumber+1,
								"cb":"<input type='checkbox' name='inputs' />",
								"radio":"<input type='radio' value='"+ infos +"' name='info' />",
								"userName":une,
								"orgName":org,
								"deptPost":dep,
								"mobTel":tel
								}
						}];
				
				$("#group_tbl").flexExtendData(infoData);
			
		},
		rm : function (){ // 删除鉴定人员
				
				var checkbox = $('#group_tbl input[type="checkbox"]:checked');
				
				if(!checkbox.length){
					$.dialog.notice({content:'请选择要删除的用户', icon:'warning', time:2});
					return;
				}else{
					$.dialog({
						content:'确定删除',
						icon:'warning',
						okVal:'确定',
						cancelVal:'取消',
						ok:function (){
							// 删除用户
							checkbox.each(function (){
								$(this).closest('tr').remove();
							});
							
							// 重新排序
							$('#group_tbl tr').each(function (i){
								$(this).find('td:first div').text(i+1);
							});
						},
						cancel:true
					});
			}
		},
		terminator : function (that){
			// zhaosr@赵世荣@中国联通总部管理部门@普通员工@18607318340@001000
			var radio = that.find('input');
				radio.attr('checked','checked');
			var infos = radio.val();
			var infoa = infos.split('@'); // yanbo@闫波@中国联通总部管理部门@总经理@88888888888,
			var uid = infoa[0]; // 用户ID
			var une = infoa[1]; // 中文名
			$.dialog({
				content: '<div><span style="font-size:14px; font-weight:bold; color:#000;">审核人：</span><span style="font-size:14px; font-weight:bold; color:#f00;">'+une+'</span></div>',
				icon: 'warning',
				okVal: '提交',
				cancelVal: '返回',
				ok:function (){$archive_destroy.define_task('Approve',uid)},
				cancel:true
			});
		},
		save : function (){
			if(!$('#group_tbl input').length){
				$.dialog.notice({content:'请添加组员', icon:'warning', time:2});
				return;
			}
			
			var radio = $('#group_tbl input[type="radio"]:checked');
			if(!radio.length){
				$.dialog.notice({content:'请选择组长', icon:'warning', time:2});
				return;
			}

			var users = [];
			var zz = null;
			var formId = $('#formId').val();
			
			$('#group_tbl tr').each(function (){
				//identification_id,userid,name,organName,post,contact,iszz
				var infos = $(this).find('input[type="radio"]').val();
				
				if($(this).find('input[type="radio"]').attr('checked')){
					zz = infos;
				}else{
					users.push(infos);
				}
			});
			
			$.post(
				$.appClient.generateUrl({ESCollaborative:'SaveUserGroup'},'x'),
				{formId:formId, zz:zz, users:users.join(','), workId:$('#workId').val()},
				function (isok){
					if(isok){
						$archive_destroy.define_task('Approve'); // 同意传true
					}else{
						$.dialog.notice({
							content:'保存失败',
							icon:'error',
							lock:false,
							time:2
						});
					}
				}
			);

			
		}
		
};

//---------------------------添加鉴定人员结束---------------------------------------//




// 验证
var _validate = { // 暂时未用到2013/2/28
	isEmpty : function (that){ // 判空
		
	},
	isEqual : function (that,str){ // 判相同
		//var original = $(that).val();
		if($(that).val() == str){
			$(that).val('');
			return true;
		}
		return false;
	},
	isEqual0 : function (that,str){
		if(!$(that).val()){
			$(that).val(str);
			return true;
		}
		return false;
	},
	clear : function (that,str){ // 清空
		
		$(that).val('');
	}
};

function fileView (path){
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'isHasFileReadRight',path:path},'x'),
		cache:false,
		success:function(isHas){
			if(isHas === 'false'){
				$.dialog.notice({content: '您对当前数据下的所有原文都没有文件浏览权限，不能进行此操作！', time: 5, icon: 'warning', lock: false});
				return ;
			}
			var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path},'x');
			$.ajax({
				url:url,
				cache:false,
				success:function(data){
					$.dialog({
						id:'artFilesPanel',
						title:'浏览电子文件',
						width: '960px',
						fixed:false,
						resize: false,
						padding: 0,
						top: '10px',
						content:data
					});
				}
			});
		}
	});
};

// ---- 档案销毁模块结束,方吉祥,20130312 ---- //

// ++++ 信息发布模块,方吉祥,20130312 ++++ //
var _publishInfo = {
		flowsheet_task: function (workId,taskId,extId){
			$.post(
				$.appClient.generateUrl({ESCollaborative:'publish'},'x'),
				{workId:workId, taskId:taskId, extId: extId},
				function (html){
					$.dialog({
						id:'_publish_flowsheet_',
						title: '信息发布审批申请单',
						padding: '0',
						content: html,
						cancelVal: '关闭',
						cancel: true
					});
				}
			);
		}
};


var _publish = {
		
		agree: function (){
			if(!$('#writer_textarea').val()){
				$archive_destroy.prompt();
				return;
			}
			this.define_task('LeadershipApproval','Approve');
		},
		back: function (){
			var that = this;
			if(!$('#writer_textarea').val()){
				$archive_destroy.prompt();
				return;
			}
			$.dialog({
				content:'确定退回',
				icon: 'warning',
				okVal:'确定',
				cancelVal:'取消',
				ok:function (){
					that.define_task('LeadershipApproval','Reject');
				},
				cancel:true
			});
			
		},
		define_task: function (fn,agree){
			var params = {
					taskId: document.getElementById('taskId').value,
					workId: document.getElementById('workId').value,
					boardId: document.getElementById('boardId').value,
					topicId: document.getElementById('topicId').value,
					agree: agree
				};
			if(fn == 'LeadershipApproval'){
				params.desc = document.getElementById('writer_textarea').value;
			}else if(fn == 'AginStartstartInfoPublishFlow'){
				params.status = document.getElementById('status').value;
			}
			
			$.post(
				$.appClient.generateUrl({ESCollaborative:fn},'x'),
				params,
				function (isok){
					if(isok){
						$.dialog.list._publish_flowsheet_.close();
						$('#mylist').flexReload();
						
						$.dialog.notice({
							content:'提交成功',
							icon:'succeed',
							lock:false,
							time:2
						});
						
					}else{
						$.dialog.notice({
							content:'提交失败',
							icon:'error',
							lock:false,
							time:2
						});
					}
				}
			);
		},
		aginSubmit: function (){ // 退回再次提交
			/*
			if(!$('#writer_textarea').val()){
				$archive_destroy.prompt();
				return;
			}
			*/
			this.define_task('AginStartstartInfoPublishFlow','Approve'); // 
		}
};
// ---- 信息发布模块结束,方吉祥,20130312 ---- //

// ++++ 公共方法 ++++ //
var _public = {
		flowsheet : function (){
			var workId = $('#workId').val();
			if(isComplete==1){
				var url = endImg;
			}else{
				var url = $.appClient.generateUrl({ESCollaborative:'imgview', workid:workId},'x');
			}
			
			// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
			$.dialog({
				id:'_flowsheetImg_',
				title: '流程图查看',
				content: '<img src = "'+url+'" />',
				width:580,
				height:390,
				padding:'0',
				cancelVal:'关闭',
				cancel:true
			});
			//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$//
		},
		download: function (mainSite, fileId, mark){
			$.post(
				$.appClient.generateUrl({ESInformationPublish:'GetFileUrl'},'x'),
				{fileId: fileId, mark: mark, mainSite: mainSite},
				function (url){
					 // failure:请求资源错误 @ 后台抛错|http://10.0.3.155:8888/%10bwu%60d%1B%7C%13r%11bs
				
					if(url.substring(0, 7) == 'failure'){
						var failure = url.split(':'); // ['failure', '请求资源错误']
						$.dialog.notice({title:'错误提示', content: failure[1], icon:'error', time:2});
						return;
					}else{
						window.open(url);
					}
				}
			);
		}
};
 // ---- 公共方法结束,方吉祥,20130312 ---- //
var _tool = {
		sendData : function (status){
			var tbl = status == 'destroy' ? 'reserve' : 'destroy';
			var ids = [];
			$('#'+tbl+'_list tr').each(function (){
				
				if($(this).find('input').attr('checked')) ids.push($(this).find('input').val());
			});
			
			var data = {ids: ids.join('@'), status: status, formId: document.getElementById('formId').value};
			
			if(status == 'reserve'){
				data.reason = $('#Reason').val();
				data.extendedRetentionPeriod = $('#Years').val();
			}
			
			$.post(
				$.appClient.generateUrl({ESArchiveDestroy:"UpdateDetailStatus"},'x'),
				data,
				function (isok){
					var alert = status == 'destroy' ? '销毁' : '保留';
					if(isok){
						$('#reserve_list').flexReload();
						$('#destroy_list').flexReload();
						// $.dialog.notice({content: '移入'+alert+'清册成功', time: 2, lock:false, icon: 'succeed'});
					}else{
						_validate.alert('移入'+alert+'清册失败','error');
					}
				}
			);
			
		},
		filter: function (whereTbl){
			
			$.get(
				$.appClient.generateUrl({ESArchiveDestroy:"filter_archive"},'x'),
				function(html){
					$.dialog({
						title:'筛选',
						content:html,
						okVal:'确定',
						cancelVal:'取消',
						ok: function (){
							var relation = compare = key = value = null; // 关系符,比较符,键,值
							var formId = $('#formId').val();
							var condition = ['IDENTIFICATION_ID,equal,'+formId+',true','STATUS,equal,'+whereTbl+',true'];
							$('#filter_conditions .filter_condition').each(function (){
								key = $(this).find('.filter_Field').val();
								if(key != 'empty'){
									compare = $(this).find('.filter_Comparison').val();
									value = $(this).find('.filter_Value').val();
									relation = $(this).find('.filter_Relation').val();
									condition.push(key+','+compare+','+value+','+relation);
								}
							});
							
							if(condition.length<3) return true; // 用户没有输入任何条件时关闭窗口
							
							var url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList',filter:true, cb: _globalVar.havingCheckb, ext: _globalVar.havingExt},'x');
							$('#'+whereTbl+'_list').flexOptions({url:url,query:condition.join('@')}).flexReload();
						},
						cancel: true
					});
				}
			);
		},
		refresh: function (whereTbl){ // 销毁清册筛选
			var formId = $('#formId').val();
			var url = $.appClient.generateUrl({ESArchiveDestroy:'GetDetailList', formId:formId, status: whereTbl, cb: _globalVar.havingCheckb, ext: _globalVar.havingExt},'x');
			$('#'+whereTbl+'_list').flexOptions({url:url}).flexReload();
		}
};

var _validate = {
	alert : function (notice,icon){
		$.dialog({
			content: notice,
			 time: 2,
			 icon: icon
		});
	},
	yearsExt : function (id){ // 验证延长保管期限
		var dom  = document.getElementById(id);
		var regExp = new RegExp("^[1-9]{1}[0-9]?$"); // 1-99数字
		if(regExp.exec(dom.value)){
			dom.style.border = '1px solid gray';
			return true;
		}else{
			dom.style.border = '1px solid #f00';			
			return false;
		}
	},
	yearsExtDesc : function (id){
		var dom  = document.getElementById(id);
		var domV = dom.value;
		if(domV.length <10 || domV.length>200){
			dom.style.border = '1px solid #f00';
			return false;
		}else{
			dom.style.border = '1px solid gray';			
			return true;
		}
	}
};

//复选框全选,取消全选,选中一个  //
//checkBox.selectOne(this);
//checkBox.selectAll(this,$('#Destroy_list_tbl'));
//checkBox.removeSelect([$('#sinput')]);
var checkBox = {
	selectOne : function (cbObj){ // 单选|取消单选
		if(cbObj.attr('checked')=='checked'){
			cbObj.closest('tr').addClass('trSelected');
		}else{
			cbObj.closest('tr').removeClass('trSelected');
		}
	},
	selectAll : function (cbObj,tblId){ // 全选|取消全选
		if(cbObj.attr('checked')=='checked'){
			cbObj.attr('checked','checked');
			tblId.find('tr').addClass('trSelected');
			tblId.find('tr input[name="inputs"]').attr('checked','checked');
		}else{
			cbObj.removeAttr('checked');
			tblId.find('tr').removeClass('trSelected');
			tblId.find('tr input[name="inputs"]').removeAttr('checked');
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

var _radio = {
	selectOne : function (that){
		that.find('input[type="radio"]').attr('checked','checked');
	}
};
// 复选框全选,取消全选,选中一个结束  //

//全选
$('#sinput').live('click',function (){
	checkBox.selectAll($(this),$('#group_tbl'));
});

$('#sinputD').live('click',function (){
	checkBox.selectAll($(this),$('#destroy_list'));
});

$('#sinputR').live('click',function (){
	checkBox.selectAll($(this),$('#reserve_list'));
});

//单选
$('input[name="inputs"]').live('click',function (){
	checkBox.selectOne($(this));
});
  
//查看文档销毁-鉴定,信息发布流程图
$('.process').live('click',function (){
  	if(this.id == 'identify_flowsheet' || this.id == 'destroy_flowsheet' || this.id == 'publish_flowsheet'){
  		_public.flowsheet();
  	}
});

  // 查看文档销毁-鉴定退回
$('.back').live('click',function (){
  	_globalVar.node = this.id;
  	if(this.id == 'publish_back'){
  		_publish.back();
  		return;
  	}else if(this.id == 'fileDepartmentApproval' || this.id == 'fileSliceApproval' || this.id == 'jointSignApproval'){
  		$archive_destroy.back();
  	}
});
  //领导同意
$('.agree').live('click',function (){
  	_globalVar.node = this.id;
  	if(this.id == 'publish_agree'){
  		_publish.agree();
  		return;
  	}else if(this.id == 'fileDepartmentApproval' || this.id == 'fileSliceApproval' || this.id == 'jointSignApproval'){
  		$archive_destroy.agree();
  	}
  	
});

/*
 * 待办退回提交人
 * 跳转至修改模块
 * 20130321
 */
$('.modify').live('click',function (){
  	if(this.id == 'publish_modifySubmit'){ // 信息发布修改
  		var data = [document.getElementById('workId').value];
  		data.push(document.getElementById('taskId').value);
  		data.push(document.getElementById('boardId').value);
  		data.push(document.getElementById('topicId').value);
  		var baseUrl = $.appClient.generateUrl({ESInformationPublish:'index'});
  		// 数据顺序一定,hash值共7个
  		window.location.href = baseUrl+'#task|publish,back|'+data.join('|')+'|'+new Date().getTime();
  	}else if(this.id == 'identify_modifySubmit' || this.id == 'destroy_modifySubmit'){ // 档案销毁退回修改按钮
  		
  		var baseUrl = $.appClient.generateUrl({ESArchiveDestroy:'index'});
  		var id = [document.getElementById('workId').value];
  		id.push(document.getElementById('taskId').value);
  		id.push(document.getElementById('formId').value);
  		var type = this.id.split('_'); // ['destroy','modifySubmit']
  		
  		window.location.href = baseUrl+'#task|'+type[0]+',back|'+ id.join('|') +'|'+new Date().getTime();
  	}
});

// 下载附件
$('.dl').live('click',function (){
  	_public.download($(this).attr('mainSite'), $(this).attr('id'), $(this).attr('mark'));
});

//单击radio控件添加组员
$('#user_tbl tr input[type="radio"]').live('click',function (){
  	_appraisers.add($(this).closest('tr'));
});
// 双击行添加组员
$('#user_tbl tr').live('dblclick',function (){
  	_appraisers.add($(this));
});

$("#terminator_tbl input[type='radio']").live('click',function (){
  	_appraisers.terminator($(this).closest('tr'));
});
//双击行添加组员
$('#terminator_tbl tr').live('dblclick',function (){
  	_appraisers.terminator($(this));
});
  
//显示电子档原文
  $('.link').live('click',function (){
  	fileView(this.id);
  });

//当前审批人意见
$('#writer_textarea').live('blur',function (){ // 用户输入意见框

	if($(this).val() == ''){
		$(this).css('border','1px solid #f00');
	}else{
		$(this).css('border','1px solid #fff');
	}
});

// 延长保管期限,保留原因
$('#Years').live('blur', function (){
	_validate.yearsExt('Years');
});
$('#Reason').live('blur', function (){
	_validate.yearsExtDesc('Reason');
});