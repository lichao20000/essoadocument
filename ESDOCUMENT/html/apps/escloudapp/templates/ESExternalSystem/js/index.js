//根据浏览器的类型自动调整整体的宽、高
var _size = {
	init : function() {
		var width_ = $(document).width()*0.96;
		var height_ = $(document).height();
		var tblWidth_ = width_;
		var tblHeight_ = height_ - 176 - 81;
		if (window.ActiveXObject) {
			if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
				tblWidth_ = tblWidth_ - 18;
			} else if (navigator.userAgent.indexOf("MSIE 8.0") > 0) {
				tblWidth_ = tblWidth_ - 4;
				tblHeight_ = tblHeight_ - 4;
			}
		}
		var realSize = {
			tblWidth : tblWidth_,
			tblHeight : tblHeight_
		};
		return realSize;
	}
}; 
//初始化对象--初始化、增、删、改
var _tbl = {
		init: function (){
			$("#sys_list").flexigrid({
				url:$.appClient.generateUrl({ESExternalSystem:'getOperationSysList'},'x'),
				dataType:'json',
				//editable: true,
				colModel : [
					{display: '<input type="checkbox" name="ids"/>', name : 'id', width : 40, align: 'center'},
					{display: '操作',  name : 'c3', width : 60, sortable : true, align: 'center'},
					{display: '业务系统代码',  name : 'c4', width : 80, sortable : true, align: 'center',metadata:'system'},
					{display: '业务系统名称',  name : 'c5', width : 120, sortable : true, align: 'center',metadata:'sysName'},
					{display: '访问方式',  name : 'c6', width : 100, sortable : true, align: 'center',metadata:'accessType'},
					{display: 'FTP/IP地址',name : 'c7', width : 120, sortable : true, align: 'center',metadata:'ftpserver'},
					{display: 'FTP用户名', name : 'c8', width : 120, sortable : true, align: 'center',metadata:'ftpuser'},
					{display: 'FTP密码',   name : 'c9', width : 80, sortable : true, align: 'center',metadata:'ftppw'},
					{display: 'FTP端口号', name : 'c10', width : 80, sortable : true, align: 'center',metadata:'ftpport'},
					{display: '业务系统路径',name : 'c11', width : 200, sortable : true, align: 'left',metadata:'sysPath'},
					{display: '业务系统范围',name : 'c12',width : 80, sortable : true, align: 'center',metadata:'publicStatus'},
					{display: '启用状态',name : 'c13', width : 80,sortable : true, align: 'center',metadata:'activting'}
				],
				buttons : [
					{name: '添加', bclass: 'add', onpress: this.add},
					{name: '删除', bclass: 'delete',onpress: this.del}
				],
				title: '业务系统设置',
				usepager: true,
				useRp: true,
				rp: 20,
				procmsg:"正在加载，请稍等",
				nomsg:"没有数据",
				pagetext: '第',
				outof: '页 /共',
				width: _size.init().tblWidth,
				height: _size.init().tblHeight,
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});
		},
		//添加业务系统设置表单页面
		add: function (){
			var url=$.appClient.generateUrl({ESExternalSystem:'add'},'x');
			$.ajax({
				url:url,
				success:function(htmlData){
					$.dialog({
						title:'添加业务系统设置表单',
						fixed:true,
						resize: false,
					    cancelVal: '取消',
					    cancel:true,
						content:htmlData,
						ok:function(){
							var thisDialog=this;
							var form=$("#osForm");
							var FTPserver=$(".esContent input[name='ftpserver']").val();
							var FTPport=$(".esContent input[name='ftpport']").val();
							var FTPuser=$(".esContent input[name='ftpuser']").val();
							var FTPpw=$(".esContent input[name='ftppw']").val();
							var sysPath=$(".esContent input[name='sysPath']").val();
							var accessMode=$(".esContent select[name='accessType']").val();
							var data=form.serialize();
							var flag=form.validate();
							if(accessMode=='ftp方式访问'){
								//ftp项都不能为空，业务系统路径项可以为空
								if(FTPserver==''){
									$("input[name='ftpserver']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
								if(FTPport==''){
									$("input[name='ftpport']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
								if(FTPuser==''){
									$("input[name='ftpuser']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
								if(FTPpw==''){
									$("input[name='ftppw']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
							}else{
								//ftp项可以为空，业务系统路径项不能为空
								if(sysPath==''){
									$("input[name='sysPath']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
							}
							if(flag){
								var regIp=/^(\d|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))(\.(\d|([1-9][0-9])|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))){3}$/;
								var regPort=/^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
								var regPW=/^[a-zA-Z0-9_]{6,22}$/;
								if((!regIp.test($("input[name='ftpserver']").val()))&&($("input[name='ftpserver']").val()!='')){
									$("input[name='ftpserver']").addClass("novalid-text").attr("title","请输入合法的IP");
									$.dialog.notice({content:'FTP/IP地址不合法，请重新输入！',icon:'warning',time:3});
									return false;
								}else if((!regPort.test($("input[name='ftpport']").val()))&&($("input[name='ftpport']").val()!='')){
									$("input[name='ftpport']").addClass("novalid-text").attr("title","请输入合法的端口号");
									$.dialog.notice({content:'端口号不合法，请重新输入！',icon:'warning',time:3});
									return false;
								}else if((!regPW.test($("input[name='ftppw']").val()))&&($("input[name='ftppw']").val()!='')){
									$("input[name='ftppw']").addClass("novalid-text").attr("title","请输入含有字母、数字、下划线的6-22位密码");
									$.dialog.notice({content:'密码不合法，请重新输入！',icon:'warning',time:3});
									return false;
								}else{
									var url=$.appClient.generateUrl({ESExternalSystem:'addItems'},'x');
									$.post(url,{data:data},function(result){
										if(result){
											if(result.indexOf('error')==-1){
												thisDialog.close();
												$.dialog.notice({width:150,content:'添加成功',icon:'succeed',time:3});
												$('#sys_list').flexReload();
											}else{
												$.dialog.notice({width:150,content:'添加失败',icon:'error',time:3});
											}
										}
									});
								}
							}
							return false;
						},
						init:function(){
							var form=$("#osForm");
							form.autovalidate();
						},
						cache:false
					});
				},
				cache:false
			});
		},
		//编辑业务系统设置表单页面
		edit: function(editId){
			var trObj=$("#"+editId).closest('tr');
			var system=$("#sys_list").flexGetColumnValue(trObj,['system']);
			var sysName=$("#sys_list").flexGetColumnValue(trObj,['sysName']);
			var accessType=$("#sys_list").flexGetColumnValue(trObj,['accessType']);
			var ftpserver=$("#sys_list").flexGetColumnValue(trObj,['ftpserver']);
			var ftpuser=$("#sys_list").flexGetColumnValue(trObj,['ftpuser']);
			//var ftppw=$("#sys_list").flexGetColumnValue(trObj,['ftppw']);
			var ftppw= trObj.find('input[name="ftppasswd"]').val();
			var ftpport=$("#sys_list").flexGetColumnValue(trObj,['ftpport']);
			var sysPath=$("#sys_list").flexGetColumnValue(trObj,['sysPath']);
			var publicStatus=$("#sys_list").flexGetColumnValue(trObj,['publicStatus']);
			var activting=$("#sys_list").flexGetColumnValue(trObj,['activting']);
			var baseInf='';
			baseInf=system+'|'+accessType+'|'+ftpserver+'|'+ftpuser+'|'+ftppw+'|'+ftpport+'|'+sysPath+'|'+publicStatus+'|'+activting+'|'+sysName;
			$.ajax({
			    url:$.appClient.generateUrl({ESExternalSystem:'edit_items'},'x'),
			    type:'post',
			    data:'editId='+editId+'&baseInf='+baseInf,
			    success:function(editData){
			    	$.dialog({
			    		title:'编辑业务系统设置表单',
						fixed:true,
						resize: false,
					    cancelVal: '取消',
					    cancel:true,
						content:editData,
				    	ok:function(){
				    		var thisDialog=this;
							var form=$("#osForm");
							var FTPserver=$(".esContent input[name='ftpserver']").val();
							var FTPport=$(".esContent input[name='ftpport']").val();
							var FTPuser=$(".esContent input[name='ftpuser']").val();
							var FTPpw=$(".esContent input[name='ftppw']").val();
							var sysPath=$(".esContent input[name='sysPath']").val();
							var accessMode=$(".esContent select[name='accessType']").val();
							var data=form.serialize();
							var flag=form.validate();
							if(accessMode=='ftp方式访问'){
								//ftp项都不能为空，业务系统路径项可以为空
								if(FTPserver==''){
									$("input[name='ftpserver']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
								if(FTPport==''){
									$("input[name='ftpport']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
								if(FTPuser==''){
									$("input[name='ftpuser']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
								if(FTPpw==''){
									$("input[name='ftppw']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
							}else{
								//ftp项可以为空，业务系统路径项不能为空
								if(sysPath==''){
									$("input[name='sysPath']").addClass("novalid-text").attr("title","此项不能为空");
									return false;
								}
							}
							if(flag){
								var regIp=/^(\d|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))(\.(\d|([1-9][0-9])|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))){3}$/;
								var regPort=/^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
								var regPW=/^[a-zA-Z0-9_]{6,22}$/;
								if((!regIp.test($("input[name='ftpserver']").val()))&&($("input[name='ftpserver']").val()!='')){
									$("input[name='ftpserver']").addClass("novalid-text").attr("title","请输入合法的IP");
									$.dialog.notice({content:'FTP/IP地址不合法，请重新输入！',icon:'warning',time:3});
									return false;
								}else if((!regPort.test($("input[name='ftpport']").val()))&&($("input[name='ftpport']").val()!='')){
									$("input[name='ftpport']").addClass("novalid-text").attr("title","请输入合法的端口号");
									$.dialog.notice({content:'端口号不合法，请重新输入！',icon:'warning',time:3});
									return false;
								}else if((!regPW.test($("input[name='ftppw']").val()))&&($("input[name='ftppw']").val()!='')){
									$("input[name='ftppw']").addClass("novalid-text").attr("title","请输入含有字母、数字、下划线的6-22位密码");
									$.dialog.notice({content:'密码不合法，请重新输入！',icon:'warning',time:3});
									return false;
								}else{
									var url=$.appClient.generateUrl({ESExternalSystem:'addItems'},'x');
									$.post(url,{data:data},function(result){
										if(result){
											if(result.indexOf('error')==-1){
												thisDialog.close();
												$.dialog.notice({width:150,content:'修改成功',icon:'succeed',time:3});
												$('#sys_list').flexReload();
											}else{
												$.dialog.notice({width:150,content:'修改失败',icon:'error',time:3});
											}
										}
									});
								}
							}
							return false;
				    	},
				    	init:function(){
				    		var form=$("#osForm");
							form.autovalidate();
				    	},
				    	cache:false
			    	});
			    },
			    cache:false
			});
		},
		//删除业务系统设置，只允许单个删除
		del: function (){
			var checkboxObj=$("#sys_list input[name='id']:checked");
			if(checkboxObj.length==0 || checkboxObj.length=='undefined'){
				$.dialog.notice({content:'请选择要删除的数据！',icon:'warning',time:3});
				return false;
			}else if(checkboxObj.length>1){
				$.dialog.notice({content:'请一条一条的删除！',icon:'warning',time:3});
				return false;
			}
			if(checkboxObj.length==1){
				var id=$("#sys_list input[name='id']:checked").val();
				if(id==0||id==''||id=='undefined'){return false;}
				$.dialog({
					  content:'确认要删除吗？删除后不能恢复！',
					  ok:true,
					  okVal:'确认',
					  cancel:true,
					  cancelVal:'取消',
					  ok:function(){
						  var url=$.appClient.generateUrl({ESExternalSystem:'del_items'},'x');
						  $.get(url,{id:id},function(data){
							  $.dialog.notice({width:150,icon:'succeed',content:'数据删除成功！',time:3,title:'3秒后自动关闭！'});
							  $("#sys_list").flexReload();
						  });
					  },
					  cache:false
				});
			}
		}
};

//全选/取消全选按钮

$("input[name='ids']").die().live('click', function() {
	$("input[name='id']").attr('checked', $(this).is(':checked'));
});

//查看、编辑业务系统设置的数据

function show_items(id) {
	_tbl.edit(id);
}

//预加载的内容及初始化

window.onload = function (){
	$("#estabs").esTabs("open", {title:"业务系统设置", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "业务系统设置");
	_tbl.init();
};
