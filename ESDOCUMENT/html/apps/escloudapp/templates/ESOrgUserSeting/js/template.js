/*
 * modify author fangjixiang
 * modify date 20130513
 * 
 */
(function (){ // 自适应宽高

	var width = document.documentElement.clientWidth,height = document.documentElement.clientHeight-176,leftwidth = 230;
	if(navigator.userAgent.indexOf("MSIE 6.0")>0){
	
		width = width-6;	// 6为兼容IE6
		
	}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
		width = width-4;	// 4为兼容IE8
		height = height-4;
	}
	
	var rightwidth = width - leftwidth;
	var tblheight = navigator.userAgent.indexOf("MSIE 7.0")>0 ? height-113 + 4 : height-113;
	
	window._size = {leftwidth: leftwidth, rightwidth: rightwidth, height: height, tblheight: tblheight};
	
})();

(function (){

tree = {
		
	setting : {
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
		callback: {
			onClick: function (e,treeId, treeNode) {
				orgid = treeNode.id;
				$('#rightfree .ftitle').html(treeNode.name+' • 用户列表');
				var url = $.appClient.generateUrl({ESUserManage:'FindUserListByOrgid',orgid:orgid},'x');
				$("#u_list").flexOptions({url:url}).flexReload();
			}
		}
	},
	init: function (){
		
		$.getJSON(
			$.appClient.generateUrl({ESArchivePermission:'GetOwnOrgByUserId'},'x'),
			function (nodes){
				$.fn.zTree.init($("#u_tree"), tree.setting, nodes);
			}
		);
		
	}
	
};

table = {
	clickUser: undefined, // 存放给某一个用户绑定角色li
	userId: undefined, // 批量绑定角色
	display: function (){
		
		var user = table.clickUser,uId,title,batch;
		if(user){
			batch = 0;
			uId = user.id;
			title = '对 [ '+ user.title + ' ] 授权';
			
		}else{ // 批量添加
			
			var checkeds = $('#u_list input[name="checks"]:checked'),cl = checkeds.length;
				if(!cl){
					$.dialog({content: '请选择授权用户', icon: 'warning', time: 2, lock: false});
					return;
				}
				
				table.userId = [];
				for(var c=0; c<cl; c++)
				{
				
					table.userId.push(checkeds[c].id);
					
				}
				
				batch = 1;
				uId = table.userId[0];
				title = '批量授权';
		}
		
		$.post(
			$.appClient.generateUrl({ESUserManage:'bind_role'},'x'),
			{uId: uId, batch: batch},
			function (htm){
				
				$.dialog({
					title: title,
					content: htm,
					padding: '15px 20px',
					okVal: '确定',
					cancelVal: '取消',
					cancel: function (){table.clickUser = undefined;},
					ok: table.bindRole
				});
				
				role.bind(); /////////
				document.getElementById('srole').onkeyup = function (){role.find('system', this)};
				document.getElementById('urole').onkeyup= function (){role.find('use', this)};
			}
		);
		
	},
	bindRole: function (){

		var useRole = getId('use_role'),uli = useRole.children,ul = uli.length;
			if(!ul){
				$.dialog({
					content: '确定清空角色',
					icon: 'warning',
					okVal: '确定',
					cancelVal: '取消',
					ok: callBack,
					cancel: true
				});
			}else{
				callBack();
			}
		
			function callBack()
			{
				
				var user = table.clickUser,accountIds,roleIds = [];
					if(user){
						accountIds = [user.id];
					}else{
						
						accountIds = table.userId;
						
					}
					
					for(var u=0; u<ul; u++)
					{
						roleIds.push(uli[u].id);
					}
					
				var data = {accountIds: accountIds, roleIds: roleIds};
				
					$.post(
						$.appClient.generateUrl({ESUserManage:'bindingRolesForAccountid'},'x'),
						data,
						function (isok){
							table.clickUser = undefined;
							
							if(isok){
								$.dialog({content: '授权成功', icon: 'succeed', time: 2, lock: false});
							}else{
								$.dialog({content: '授权失败', icon: 'error', time: 2, lock: false});
							}
						}
					);
				
			}
			
	
	},
	init: function (){

		// 给单个用户赋权限
		$("#u_list").flexigrid({
			dataType: 'json',
			colModel : [
				{display: '<input type="checkbox" id="checkAll" />', name : 'id', width : 40, align: 'center'},
				{display: '操作', name : 'edit', width : 40, sortable : true, align: 'center'},
				{display: '用户名', name : 'userid', width : 100, sortable : true, align: 'center'},
				{display: '姓名', name : 'displayName', width : 100, sortable : true, align: 'center'},
				{display: '电话', name : 'mobTel', width : 120, sortable : true, align: 'center'},
				{display: '邮箱地址', name : 'emailAddress', width : 120, sortable : true, align: 'center'},
				{display: '办公电话', name : 'officeTel', width : 120, sortable : true, align: 'center'},
				{display: '家庭电话', name : 'telephonenumber', width : 120, sortable : true, align: 'center'},
				{display: '机构', name : 'orgName', width : 60, sortable : true, align: 'center'},
				{display: '启用状态', name : 'userStatus', width : 50, sortable : true, align: 'center'}
			],
			buttons : [
				{name: '批量授权', bclass: 'add',onpress: function (){table.display();}}
			],
			usepager: true,
			title: '用户列表',
			useRp: true,
			rp: 20,
			nomsg: '没有数据',
			width: _size.rightwidth,
			height: _size.tblheight,
			showTableToggleBtn: false,
			pagetext: '第',
			outof: '页 /共',
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});

	}
};
	
var getId = function (elementId){

	return document.getElementById(elementId);
};

/**
 * 用户授权窗口,批量授权窗口
 * 处理事件
 * 
 */
role = {
	
	find: function(type, That){
			if(!type){
				return;
			}
			
		var value = That.value,ul = getId(type+'_role'),li = ul.children,lileng = li.length;
		
			if(value){
			
				for(var l=0; l<lileng; l++)
				{
				
					if(li[l].innerHTML.indexOf(value) === -1){
					
						li[l].style.display = 'none';
					
					}else{
					
						li[l].style.display = 'block';
					
					}
				
				}
			
			}else{
			
				for(var l=0; l<lileng; l++)
				{
					
					li[l].style.display = 'block';
					
				}
			
			}
	
	},
	toleft: function (p){
	
		var sysul = getId('system_role');
		var useul = getId('use_role'),li = useul.children,lileng = li.length;
			if(!lileng){
				return;
			}
			
		var tmp = [],tmpleng;
			for(var l=0; l<lileng; l++)
			{
				
				if(li[l].className === 'focus'){
					li[l].className = '';
					tmp.push(li[l]);
				}
	
			}
			
			if(tmpleng = tmp.length){
				for(var t=0; t<tmpleng; t++)
				{
					sysul.appendChild(tmp[t]);
				}
			}
		
	
	},
	toright: function (p){
	
		var useul = getId('use_role');
		var sysul = getId('system_role'),li = sysul.children,lileng = li.length;
			if(!lileng){
			
				return;
			
			}
			
		var tmp = [],tmpleng;
			for(var l=0; l<lileng; l++)
			{
				
				if(li[l].className === 'focus'){
					li[l].className = '';
					tmp.push(li[l]);
				}
	
			}
			
			if(tmpleng = tmp.length){
				for(var t=0; t<tmpleng; t++)
				{
					useul.appendChild(tmp[t]);
				}
			}
	
	},
	dblclick: function (){
	
		var parent = (this.parentNode.id === 'use_role') ? getId('system_role') : getId('use_role');
			this.className = '';
			parent.appendChild(this);
	
	},
	click: function (){
	
		this.className = this.className === 'focus' ? '' : 'focus';
	
	},
	mouseover: function (e){
		
			this.className = this.className.indexOf('focus') === -1 ? 'hover' : 'focus';
		var title = this.innerHTML;
			if(title.length > 15){
				var tmpSpan_ = document.getElementById('tmp_'+this.id);
				if(tmpSpan_){
					document.body.removeChild(tmpSpan_);
				}
				var e_ = window.event || e;
				var span_ = document.createElement('span');
					span_.id = 'tmp_'+this.id;
					span_.className = 'temp-title';
					span_.innerHTML = title;
					span_.style.left = e_.clientX+15+'px';
					span_.style.top = e_.clientY+15+'px';
					document.body.appendChild(span_);
			}
	},
	mouseout: function (){
		
			this.className = this.className.indexOf('focus') === -1 ? '' : 'focus';
		var title = this.innerHTML;
			if(title.length > 15){
				var tmpSpan_ = document.getElementById('tmp_'+this.id);
					if(tmpSpan_){
						document.body.removeChild(tmpSpan_);
					}
			}
	},
	bind: function (){
		
		var sysul = getId('system_role'),sli = sysul.children,slileng = sli.length;
		var useul = getId('use_role'),uli = useul.children,ulileng = uli.length;
		
			for(var sl=0; sl<slileng; sl++)
			{
				sli[sl].ondblclick = role.dblclick;
				sli[sl].onclick = role.click;
				sli[sl].onmouseover = role.mouseover;
				sli[sl].onmouseout = role.mouseout;
			}
			for(var ul=0; ul<ulileng; ul++)
			{
				uli[ul].ondblclick = role.dblclick;
				uli[ul].onclick = role.click;
				uli[ul].onmouseover = role.mouseover;
				uli[ul].onmouseout = role.mouseout;
			}
	
	}
	
};
	
})();


window.onload = function (){
	$("#estabs").esTabs("open", {title:"机构人员设置", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "机构人员设置");
	
	$("#leftfree").css({width:_size.leftwidth,height:_size.height});	// 设置左侧树尺寸
	$("#rightfree").css({width:_size.rightwidth,height:_size.height});	// 设置左侧树尺寸
	tree.init();
	table.init();
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

// 复选框全选,取消全选,选中一个结束  //
//全选|不全选@方吉祥
$(document).on('click', '#checkAll', function(){
	checkBox.selectAll(this, 'u_list');
});
// 单选
$(document).on('click', '#u_list input[name="checks"]', function(){
	checkBox.selectOne(this);
});

$(document).on('click', '.edit', function (){
	table.clickUser = this;
	table.display();
	
});
