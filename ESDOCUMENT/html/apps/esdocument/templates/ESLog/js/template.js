(function (){
	window.size = {};
	
	var width_ = $(document).width()*0.96;		// 可见总宽度
	var height_ = $(document).height()-143;	// 可见总高度 - 176为平台头部高度
	if(navigator.userAgent.indexOf("MSIE 6.0")>0){
		
		width_ = width_-6;	// 6为兼容IE6
		
	}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
		width_ = width_-4;	// 4为兼容IE8
		height_ = height_-4;
	}
	
	var width_treeDiv_ = 220; // 左侧宽度
	var width_tableDiv_ = width_ - width_treeDiv_-10; // 右侧宽度
	
	var height_table_ = height_ - 113;	// 表格高 - 表格插件(flexigrid)内容外高度,25px 是插件按钮高度
	// IE7.0因插件高度未定导致行高和其它浏览器不一致多出4px
	height_table_ = navigator.userAgent.indexOf("MSIE 7.0")>0 ? height_table_ + 4 : height_table_;
	
	window._size = {treeDiv:[width_treeDiv_, height_], tableDiv:[width_tableDiv_, height_], table:[width_tableDiv_, height_table_]};
})();

var _tree = {
	treeObj: {},
	clickNode: { type: undefined},
	nodes: [
			{ id:1, pId:0, name:"系统日志", type: undefined, open:true},
			{ id:2, pId:1, name:"用户登录", type:"login"},
			{ id:3, pId:1, name:"功能访问", type:"access"},
			{ id:4, pId:1, name:"功能操作", type:"operation"}//,
			//{ id:5, pId:1, name:"任务调度", type:"job"}
		],
	setting: {
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
				onClick: function (e, treeId, treeNode){
					
					if(treeNode.type === undefined){
						return;
					}else if(treeNode.type == 'native'){
						_tree.clickNode = treeNode;
						_opens.ext_filter();
						_table.init();
						return;
					}else{
						_tree.clickNode = treeNode;
						_table.init();
					}
					
				}
			}
		}
};

var _table = {
	total: false, // 用于保存接口日志总条数,该参数只在第一次得到
	init: function (){
		
		document.getElementById('table').innerHTML = "<table id='log-table'></table>";
		
		var col_ = url_ = title_ = button_ = type_ = false;
			button_ = [{name: '筛选', bclass: 'filter', tooltip: '筛选', onpress: _opens.filter},
			           {name: '取消筛选', bclass: 'refresh', tooltip: '取消筛选', onpress: _opens.refresh},
			           {name: '备份', bclass: 'export', tooltip: '备份', onpress: _opens.exporData},
			           {name: '删除', bclass: 'delete', tooltip: '删除', onpress: _opens.deleteData},
			           {name:'统计',bclass:'paper',tooltip:'统计',onpress:_opens.statistics}];
			col_ = [
			        {display: '行号', name:'line', width: 50, align: 'center'},
			        {display: '<input type="checkbox" id="checkAll" >', name:'cb', width: 20, align: 'center'},
			        {display: '查看', name:'details', width: 50, align: 'center'},
			    	{display: '日期', name: 'logdate', width: 80, sortable: true, align: 'center'},
		    		{display: '时间', name: 'logtime', width: 80, sortable: true, align: 'center'},
		    		{display: '登录用户', name: 'username', width: 150, sortable: true, align: 'left'},
		    		{display: '部门', name: 'orgname', width: 180, sortable: true, align: 'left'},
		    		{display: 'IP 地址', name: 'address', width: 80, sortable: true, align: 'left'}
		    		
		    	];
		
		if(_tree.clickNode.type === undefined){
			
			url_ = false;
			title_ = '日志列表';
			
		}else if(_tree.clickNode.type === 'native'){ // 数据接口日志
			
			col_ = [
			       
					{display: '行号', name:'line', width: 50, align: 'center'},
					{display: '<input type="checkbox" id="checkAll" >', name:'cb', width: 20, align: 'center'},
					{display: '查看', name:'details', width: 50, align: 'center'},
		    		{display: '结果代码', name: 'code', width: 70, sortable: true, align: 'left'},
		    		{display: '说明', name: 'desc', width: 150, sortable: true, align: 'left'},
		    		{display: '日志时间', name: 'createTime', width: 150, sortable: true, align: 'center'},
		    		{display: '备注', name: 'remark', width: 150, sortable: true, align: 'left'},
		    		{display: 'SIP时间', name: 'sipTime', width: 150, sortable: true, align: 'center'},
		    		{display: 'SIP文件名', name: 'sipName', width: 150, sortable: true, align: 'left'},
		    		{display: '操作人', name: 'operName', width: 150, sortable: true, align: 'left'},
		    		{display : '数据标识',name :'id',hide:true,width:30,align:'center'}
		    	];
			
			title_ = _tree.clickNode.name +' ? 日志列表';
			button_ = [{name: '筛选', bclass: 'filter', tooltip: '筛选', onpress: _opens.ext_filter},{name: '重新导入', bclass: 'import', tooltip: '重新导入', onpress: _opens.reImport},{name: '反馈错误', bclass: 'autocorre', onpress: _opens.feedback}];
			url_ = false;
			
		}else{
			if(_tree.clickNode.type === 'job'){//任务调度日志    gaoyide20141011
				col_ = [
				      
				        {display: '行号', name:'line', width: 50, align: 'center'},
				        {display: '<input type="checkbox" id="checkAll" >', name:'cb', width: 20, align: 'center'},
				        {display: '查看', name:'details', width: 50, align: 'center'},
				    	{display: '调度日期', name: 'logdate', width: 150, sortable: true, align: 'center'},
			    		{display: '调度时间', name: 'logtime', width: 150, sortable: true, align: 'center'},
			    		{display: '调度结果', name: 'module', width: 150, sortable: true, align: 'left'},
			    		{display: '调度明细', name: 'operatedetail', width: 300, sortable: true, align: 'left'}
			    		
			    		
			    	];
			}
			if( _tree.clickNode.type === 'access'){
			
				col_.push({display: '访问模块', name: 'module', width: 100, sortable: true, align: 'left'});
				
			}else if(_tree.clickNode.type === 'operation' ){
				
				col_.push({display: '操作功能', name: 'module', width: 100, sortable: true, align: 'left'},{display: '操作明细', name: 'operatedetail', width: 150, sortable: true, align: 'left'});
			}
			col_.push({display : '数据标识',name :'id',hide:true,width:30,align:'center'});
			url_ = $.appClient.generateUrl({ESLog: 'GetLogListByCondition'},'x');
			title_ = _tree.clickNode.name +' ? 日志列表';
			type_ = _tree.clickNode.type;			
		}
		
		$("#log-table").flexigrid({
			url: url_,
			dataType: 'json',
			colModel : col_,
			buttons : button_,
			usepager: true,
			title: title_,
			useRp: true,
			showTableToggleBtn:false,
			width: _size.table[0],
			height: _size.table[1],
			rp: 20,
			query: {
				type: type_
			},
			nomes: '没有数据',
			pagetext: '第',
			outof: '页 /共',
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
		
	}
};

var _opens = {
		//shimiao 20140428 日志管理添加按钮操作
		getCondition :function(type,functionName,title){
			 // 
			if(type === undefined){
				
				$.dialog({
					content: '请选择日志类型',
					icon: 'warning',
					time: 2
				});
				return;
			}
			$.post(
				$.appClient.generateUrl({ESLog:'filter'},'x'),
				{type : type},
				function (htm){
				
					$.dialog({
						title: title,
						content: htm,
						padding: '0px',
						okVal: '确定',
						cancelVal: '取消',
						cancel: true,
						ok: function (){
							//分割（★■◆●"loginfo"●◆■★"="●◆■★"3"●◆■★or/and★■◆●）
							var ulDom = document.getElementById('condition').children;
							var leng = ulDom.length;
							
							var  logType = type;
							var condition = "",conName="";
							for(var i=0; i<leng; i++){
								
								var key = ulDom[i].children[0].children[0];
								
								if(key.value === 'EMPTY') continue; // 没选择就跳出该次
									
								var comparison = ulDom[i].children[1].children[0];
								var value = ulDom[i].children[2].children[0];
								var relation = ulDom[i].children[3].children[0];
								
								var keytmp = key.value;
								var valuetmp = value.value;

								if(keytmp === 'userid'){ // 判断用户是从列表里选择的人员还是手输入的人员
								
									//gengqianfeng 20141016 导出筛选条件修改
									keytmp = 'username';
									if(value.name){
										valuetmp = value.name;
									}
									
								}else if(key.value === 'orgid'){
								
									if(value.name){
										valuetmp = value.name;
									}else{
										keytmp = 'orgname';
									}
									
								}
								if(!(keytmp && valuetmp)){
									$.dialog.notice({content:'请输入完整的条件!',icon:'warning',time:3});
									return;
								}
								
								if(condition){
									conName=conName+"★■◆●" +key.options[key.selectedIndex].text +"●◆■★" +comparison[comparison.selectedIndex].text + "●◆■★" + valuetmp +"●◆■★" +relation.value;
									condition = condition +"★■◆●" +keytmp +"●◆■★" + comparison.value + "●◆■★" + valuetmp +"●◆■★" +relation.value;
								}else{
									condition = keytmp +"●◆■★" + comparison.value + "●◆■★" + valuetmp +"●◆■★" +relation.value;
									conName = key.options[key.selectedIndex].text +"●◆■★" + comparison[comparison.selectedIndex].text + "●◆■★" + valuetmp +"●◆■★" +relation.value;
								}
							}
							//gengqianfeng 20140923 日志备份提示
							if(title=='批量导出'){
								$.dialog.notice({content: '正在努力备份中,稍后点击“消息提示”进行下载',icon:'succeed',time:1});
							}
							$.post(
									$.appClient.generateUrl({ESLog:functionName}),
									{condition:condition,type:type,conName:conName},
									function (success){
										if(success === 'true'){
											$.dialog.notice({content:title+'成功!',icon:'succeed',time:1});
										}else if(success === 'false'){
											$.dialog.notice({content:title+'失败!',icon:'error',time:2});
										}else if(success){
											//gengqianfeng 20140923 日志备份提示
											if(title=='批量导出'){
//												var downFile = $.appClient.generateUrl({ESLog:'downFile',fileName:success},'x');
//												$.dialog.notice({
//													content:"<a href='"+downFile+"'>下载导出数据</a>",
//													icon:'face-smile'
//												});
												if(success=='nouser'){
													setTimeout(function(){
														$.dialog.notice({content: '账号已超时,请重新登录',icon: 'warning',time:3});
													},2500);
												}
												if(success=='nodata'){
													setTimeout(function(){
														$.dialog.notice({content: '没有满足条件的数据',icon: 'warning',time:3});
													},2500);
												}
											}
										}else{
											//gengqianfeng 20140923 日志备份提示
											if(title=='批量导出'){
												setTimeout(function(){
													$.dialog.notice({width: 150,content: '导出数据失败',icon: 'error',time:2});
												},2500);
											}
										}
										
										url_ = $.appClient.generateUrl({ESLog: 'GetLogListByCondition'},'x');
										type_ = _tree.clickNode.type;
										$('#log-table').flexOptions({url: url_, newp: 1, query: {type:type_}}).flexReload();
									}
							);
						}
					});
				
				}
			);


		},
		statistics:function(){
			$.post(
					$.appClient.generateUrl({ESLog: 'statistics'},'x'),
					{type:_tree.clickNode.type},
					function (htm){
						$.dialog({
							title: '日志统计',
							content: htm,
							padding: '0px',
							okVal: '取消',
							ok: true
						});
					}
				);
		},
		deleteData:function(){
			if($('#log-table input[name="checks"]:checked').length>0){
			var logData = $('#log-table input[name="checks"]:checked');
			var ids = '';
			for(var i=0;i<logData.length;i++){
				if(ids.length){
					ids = ids + ',' +logData[i].getAttribute('value');
				}else{
					ids = logData[i].getAttribute('value');
				}
			}
			$.dialog({
				content: '确定删除日志数据?',
				okVal: '确定',
				icon: 'warning',
				cancelVal: '取消',
				ok: function (){
					$.post(
							$.appClient.generateUrl({ESLog:'deleteLogData'}),
							{ids:ids},
							function (success){
								if(success === 'true'){
									$.dialog.notice({content:'删除数据成功',icon:'succeed',time:1});
									
								}else{
									$.dialog.notice({content:'删除数据失败',icon:'error',time:2});
								}
								var url_ = $.appClient.generateUrl({ESLog: 'GetLogListByCondition'},'x');
								title_ = _tree.clickNode.name +' ? 日志列表';
								type_ = _tree.clickNode.type;		
								$("#log-table").flexOptions({url: url_, newp: 1, query: {type:type_}}).flexReload();
							}
							
						);
				},
				cancel: true
			});
			
			}else{
				_opens.getCondition(_tree.clickNode.type,"deleteLogData","批量删除");
			}
		},
		//shimiao 20140421 日志功能的添加
		exporData:function(){
			if($('#log-table input[name="checks"]:checked').length>0){
				var logData = $('#log-table input[name="checks"]:checked');
				var ids = '';
				for(var i=0;i<logData.length;i++){
					if(ids.length>0){
						ids = ids + ',' +logData[i].getAttribute('value');
					}else{
						ids = logData[i].getAttribute('value');
					}
				}
				//gengqianfeng 20140923 日志备份提示
				$.dialog.notice({content: '正在努力备份中,稍后点击“消息提示”进行下载',icon:'succeed',time:1});
				$.post(
					$.appClient.generateUrl({ESLog:'ExportLogData'}),
					{ids:ids},
					function (fileName){
						//gengqianfeng 20140923 日志备份提示
						if(fileName){
//							var downFile = $.appClient.generateUrl({ESLog:'downFile',fileName:fileName},'x');
//							$.dialog.notice({
//								content:"<a href='"+downFile+"'>下载导出数据</a>",
//								icon:'face-smile'
//							});
							if(fileName=='nouser'){
								setTimeout(function(){
									$.dialog.notice({content: '账号已超时,请重新登录',icon: 'warning',time:3});
								},2500);
							}
							if(fileName=='nodata'){
								setTimeout(function(){
									$.dialog.notice({content: '没有满足条件的数据',icon: 'warning',time:3});
								},2500);
							}
						}else{
							setTimeout(function(){
								$.dialog.notice({width: 150,content: '导出数据失败',icon: 'error',time:2});
							},2500);
						}
					}
				);
			}else{
				_opens.getCondition(_tree.clickNode.type,"ExportLogData","批量导出");
			}
		},

	filter: function (){ // 筛选
		
		if(_tree.clickNode.type === undefined){
			
			$.dialog({
				content: '请选择日志类型',
				icon: 'warning',
				time: 2
			});
			return;
		}
		
		$.post(
			$.appClient.generateUrl({ESLog:'filter'},'x'),
			{type : _tree.clickNode.type},
			function (htm){
			
				$.dialog({
					title: '筛选面板',
					content: htm,
					padding: '0px',
					okVal: '确定',
					cancelVal: '取消',
					cancel: true,
					ok: function (){
						var ulDom = document.getElementById('condition').children;
						var leng = ulDom.length;
						
						var  logType = _tree.clickNode.type;
						var condition = "";
						for(var i=0; i<leng; i++){
							
							var key = ulDom[i].children[0].children[0];
							
							if(key.value === 'EMPTY') continue; // 没选择就跳出该次
								
							var comparison = ulDom[i].children[1].children[0];
							var value = ulDom[i].children[2].children[0];
							var relation = ulDom[i].children[3].children[0];
							
							var keytmp = key.value;
							var valuetmp = value.value;
							
							if(keytmp === 'userid'){ // 判断用户是从列表里选择的人员还是手输入的人员
								
								//gengqianfeng 20141016 导出筛选条件修改
								keytmp = 'username';
								if(value.name){
									valuetmp = value.name;
								}
								
							}else if(key.value === 'orgid'){
							
								if(value.name){
									valuetmp = value.name;
								}else{
									keytmp = 'orgname';
								}
								
							}
							if(!(keytmp && valuetmp)){
								$.dialog.notice({content:'请输入完整的条件!',icon:'error',time:3});
								return;
							}
							if(condition){
								condition = condition +"★■◆●" +keytmp +"●◆■★" + comparison.value + "●◆■★" + valuetmp +"●◆■★" +relation.value;
							}else{
								condition = keytmp +"●◆■★" + comparison.value + "●◆■★" + valuetmp +"●◆■★" +relation.value;
							}
						}
						if(!condition) return;
						var url = $.appClient.generateUrl({ESLog:'GetLogListByCondition'},'x');
						$('#log-table').flexOptions({url: url, newp: 1, query: {condition:condition,type:logType}}).flexReload();
					}
				});
			
			}
		);
	
	},
	//gengqianfeng 20141010 取消筛选
	refresh: function (){//取消筛选
		if(_tree.clickNode.type === undefined){
			$.dialog({
				content: '请选择日志类型',
				icon: 'warning',
				time: 2
			});
			return;
		}
		var url = $.appClient.generateUrl({ESLog:'GetLogListByCondition'},'x');
		$('#log-table').flexOptions({url: url, newp: 1, query: {type:_tree.clickNode.type}}).flexReload();
	},
	ext_filter: function (){ // 系统日志
		$.post(
			$.appClient.generateUrl({ESLog:'ext_filter'},'x'),
			function (htm){
				$.dialog({
					title: '筛选面板',
					content: htm,
					padding: '0px',
					okVal: '确定',
					cancelVal: '取消',
					cancel: true,
					ok: function (){

						var condition = $('#native_form').serializeArray();
						_curd.find(condition);
						_curd.system = $('#native_system').val();
						_curd.logdate = $('#native_logdate').val();
						_curd.range = $('#native_range').val();
					}
				});
			}
		);
		
	},
	reImport: function (){
		
		/*if(!$('#log-table input[name="checks"]:checked').length){
			$.dialog({
				content: '请选择数据',
				icon: 'warning',
				time: 2
			});
			return;
		}*/
		$.dialog({
			content: '确定重新导入?',
			okVal: '确定',
			icon: 'warning',
			cancelVal: '取消',
			ok: function (){
				_curd.importAndfeedback('import');
			},
			cancel: true
		});
		
	},
	feedback: function (){
		
			if(!$('#log-table input[name="checks"]:checked').length){
				$.dialog({
					content: '请选择数据',
					icon: 'warning',
					time: 2
				});
				return;
			}
		$.dialog({
			content: '确定反馈错误?',
			icon: 'warning',
			okVal: '确定',
			cancelVal: '取消',
			ok: function (){
				_curd.importAndfeedback('feedback');
			},
			cancel: true
		});
	},
	detail: function (that){ // 明细
		
		var logType = _tree.clickNode.type;
		var field = [];
		var tr = that.parentNode.parentNode.parentNode, td = tr.children;
		
		if(logType === 'native'){
			
			var action = that.className.indexOf('details') !== -1 ? 'ShowSIPXml' : 'ShowUploadinfo';
			
			field = ['line', 'cb', 'details', 'code','desc','createTime','remark','sipTime','sipName', 'operName'];
			var data =  {system: _curd.system, logdate: _curd.logdate, range: _curd.range};
			var fl = field.length;
			for(var i=3; i<fl; i++)
			{
				data[field[i]] = td[i].firstChild.innerHTML;
				
			}

			$.post(
				$.appClient.generateUrl({ESLog: action},'x'),
				data,
				function (htm){
					
					if(htm.substring(0,6) === 'error:'){
						var error = htm.split(':');
						$.dialog.notice({content: error[1], icon: 'warning', time:2});
						return;
					}
					
					if(action === 'ShowUploadinfo'){
						//如不是正确的json格式数据直接显示在页面
						try{
							var list = eval(htm),listHtm = '',listlength = list.length;
						} catch(e) {
							$.dialog({
								title: '日志明细面板',
								content: '<div class="format-list-box">'+ htm +'</div>',
								okVal: '取消',
								padding: 0,
								ok: true
							});
							return false;
						}
						
						for(var li=0; li<listlength; li++)
						{
							listHtm += '<ul class="format-list">';
							var innerline = 0;
							for(var data in list[li])
							{
								var css = innerline++%2==0 ? 'even' : 'odd';
								listHtm += '<li class="'+ css +'">'+ data +'</li><li class="long '+ css +'">'+ list[li][data] +'</li>';
							}
							listHtm += '</ul>';
							
						}
						
						$.dialog({
							title: '日志明细面板',
							content: '<div class="format-list-box">'+ listHtm +'</div>',
							okVal: '取消',
							padding: 0,
							ok: true
						});
						
						return;
					}
					
					$.dialog({
						title: '日志明细面板',
						content: htm,
						okVal: '取消',
						padding: '5px',
						ok: true
					});
					
				});
			
			
			return;
		}
		
		$.post(
			$.appClient.generateUrl({ESLog: logType+'_detail'},'x'),
			function (htm){
				$.dialog({
					title: '日志明细面板',
					content: htm,
					padding: '0px',
					okVal: '取消',
					ok: true
				});
				//xiewenda 20140923将'orgName','IPaddress'字段值互换位置修复页面显示数据不对应问题
				if(logType === 'access'){
					
					field = ['line','loginDate','loginTime','userName','orgName','IPaddress','module'];
					
				}else if(logType === 'operation'){
					
					field = ['line','loginDate','loginTime','userName','orgName','IPaddress','operate','operateDetail'];
				
				}else if(logType === 'login'){
					field = ['line','loginDate','loginTime','userName','orgName','IPaddress',];
				}else if(logType === 'job'){
					field = ['line','loginDate','loginTime','module','operateDetail'];  
				}
				
				var fl = field.length;
				for(var i=1; i<fl; i++)
				{
					if(field[i] === 'operateDetail'){
						document.getElementById(field[i]).value = td[i+2].firstChild.innerHTML;
						break;
					}
					
					document.getElementById(field[i]).innerHTML = td[i+2].firstChild.innerHTML;
					
				}
				
				
			}
		);
		
	}
};

var _curd = {
	system: false,
	logName: false,
	range: false,
	find: function (p){
		
		if(_tree.clickNode.type === 'native'){
			var url_ = $.appClient.generateUrl({ESLog: 'GetNativeLogArchive'},'x');
			$("#log-table").flexOptions({url: url_, newp: 1, query: p}).flexReload();
		}
		
	},
	importAndfeedback : function (whereButton){
		
		var data =  {system: _curd.system, logdate: _curd.logdate, range: _curd.range, list: []};
		
		var checked = $('#log-table input[name="checks"]:checked'),cl = checked.length;
		var field = ['line', 'cb', 'details', 'code','desc','createTime','remark','sipTime','sipName', 'operName'];
		var fl = field.length;
		var lineNumber = [];
			for(var c=0; c<cl; c++)
			{
				var code = Number(checked[c].getAttribute('code'));
					if(checked[c].checked){
						var tr = checked[c].parentNode.parentNode.parentNode,map={};
							if(code > 900){
								
								for(var td=3; td<fl; td++)
								{
									
									map[field[td]] = tr.children[td].children[0].innerHTML;
									
								}
								
								data.list.push(map);
								
							}else{
								
								if(whereButton === 'import'){ // 反馈错误不需要提示“勾选数据中存在非档案系统错误”
									lineNumber.push(tr.children[0].children[0].innerHTML);
								}
								
							}
						
					}
			}
			
			if(lineNumber.length)
			{
				$.dialog.notice({icon: 'warning', content: '勾选数据中存在非档案系统错误(第'+ lineNumber.join(',') + '行)',time:3});
				return;
			}
		
		var action = whereButton === 'import' ? 'ImportInternalData' : 'FeedbackExternalSys';
			$.post(
				$.appClient.generateUrl({ESLog: action},'x'),
				data,
				function (htm){
					
					if(htm.substring(0,6) === 'error:'){
						var error = htm.split(':');
						$.dialog.notice({content: error[1], icon: 'warning', time:2});
						return;
					}else{
						$('#log-table').flexReload();
						$.dialog.notice({content: htm, icon: 'succeed', time:2});
					}
			});
	}
		
};
// +++++++ 选择用户或部门 +++++++++ //
var _userAndorg = { // 选择用户或者部门
	who: false,
	inputObj: {},
	node: {},
	setting: {
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
//			url:$.appClient.generateUrl({ESIdentify:'GetOrgList'},'x'),
			//gengqianfeng 20141015 修改扩展机构树
			url:$.appClient.generateUrl({ESLog : 'expandOrgListTree'},'x'),
			autoParam:["id"]
		},
		callback: {
			onClick: function (event, nodeId, treeNode){
				
				_userAndorg.node = treeNode;
				
				if(_userAndorg.who !== 'user') return;
				var url = $.appClient.generateUrl({ESLog:'FindUserListByOrgidForUsingStatic',oid:treeNode.id},'x');
				$("#user-list").flexOptions({url:url}).flexReload();
				
			}
		}
	},
	init: function (){
		var that = this;
		if(that.who === 'user'){
			var htm = ["<div style='width:800px; height:400px; float:left; overflow:hidden;'>"];
				htm.push("<div style='width:250px; height:400px; float:left; overflow:scroll;'><div id='org-list' class='ztree'><p style='width:220px; line-height:100px; text-align:center; float:left; color:red;'>请稍后...<p></div></div>");
				htm.push("<div style='width:550px; height:400px; float:left; overflow:hidden;'><table id='user-list'></table></div>");
				htm.push('</div>');
				htm.push('<style>');
				htm.push('.ztree li a span{color:#444;}');
				htm.push('</style>');
			var title = '选择用户面板';
		}else{
			var htm = ["<div style='width:350px; height:400px; float:left; overflow:hidden;'>"];
				htm.push("<div style='width:350px; height:400px; float:left; overflow:scroll;'><div id='org-list' class='ztree'><p style='width:320px; line-height:100px; text-align:center; float:left; color:red;'>请稍后...<p></div></div>");
				htm.push('</div>');
				htm.push('<style>');
				htm.push('.ztree li a span{color:#444;}');
				htm.push('</style>');
			var title = '选择部门';
		}
		
		
		$.dialog({
			title: title,
			id: 'userOrg',
			padding: '0px',
			content: htm.join(''),
			okVal: '确定',
			cancelVal: '关闭',
			cancel: true,
			ok: function (){
			
				if(that.who === 'user'){
				
					var tr = document.getElementById('user-list').children[0].children;
					var trl = tr.length;
					for(var i=0; i<trl; i++){
						//lijg@李建国@中国联通总部管理部门@党组纪检组组长、党组成员@18607318340@001000
						var input = tr[i].children[1].children[0].children[0];
						
						if(input.checked){
							var info = input.value.split('??');
							_userAndorg.inputObj.name = info[0];
							_userAndorg.inputObj.value = info[0];
							$.dialog.list.userOrg.close();
						}
						
					}
					
				}else{
					
					_userAndorg.inputObj.value = _userAndorg.node.name;
					_userAndorg.inputObj.name = _userAndorg.node.id;
					$.dialog.list.userOrg.close();
					
				}
				
			}
		});
		
		$.getJSON(
			//gengqianfeng 20141015  添加获取所有机构标示
			$.appClient.generateUrl({ESLog:'getOrgListTree',oid:'all'},'x'),
			
			function (nodes){
				//xiewenda 20140918 在加载完成后 调用一个函数加载所有的角色信息  //gengqiangeng 20141015 日志不分权限初始加载所有用户
				var url = $.appClient.generateUrl({ESLog:'FindUserListByOrgidForUsingStatic',oid:'all'},'x');
				$.fn.zTree.init($('#org-list'), that.setting, nodes);
				// 用户列表
				$("#user-list").flexigrid({
					url:url,
					dataType: 'json',
					colModel : [
						{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
						{display: '选择', name : 'radio', width : 40, align: 'center'},
						{display: '用户名', name : 'userName', width : 80, align: 'left'},
						{display: '姓名', name : 'displayName', width : 80, align: 'left'},
						{display: '部门', name : 'orgName', width : 280, align: 'left'},
						{display: '职务', name : 'deptPost', width : 280, align: 'left'},
						{display: '联系方式', name : 'mobTel', width : 280, align: 'left'}
					],
					usepager: true,
					nomsg: '没有数据',
					useRp:true,
					width:550,
					height:333
				});
			}
		);
	}
};

$("#user-list tr").live('click', function (){
				
	this.children[1].children[0].children[0].checked = true;
	
});

$("#user-list input").live('click', function (){
				
	var info = this.value.split('??');
	_userAndorg.inputObj.name = info[0];
	_userAndorg.inputObj.value = info[0];
	$.dialog.list.userOrg.close();
	
});
// ------ 选择用户或部门 -------- //

$('.details').live('click', function (){
	
		_opens.detail(this);
	
});

$('#log-table tr').live('dblclick', function (){
	
	var that = _tree.clickNode.type === 'native' ? this.children[1].firstChild.firstChild : this.firstChild.firstChild.firstChild;
	_opens.detail(that);
});

$('.link').live('click', function (){
	
	_opens.detail(this);

});

// 添加行
$('#condition .add').live('click', function (){
	
	var oldNode = $(this).parent().parent();
	var newNode = oldNode.clone();
		newNode[0].children[0].children[0].value = '请选择';
		
		if(_tree.clickNode.type !== 'native'){
			newNode[0].children[1].children[0].value = '等于';
			newNode[0].children[2].innerHTML = '<input type="text" />';
			newNode[0].children[3].children[0].value = '并且';
		}else{
			newNode[0].children[1].innerHTML = '<input type="text" />';
		}
		
		newNode.appendTo('#condition');
	
});

// 删除行
$('#condition ul li .del').live('click', function (){
	//gengqianfeng 20140917 日志筛选删除事件修改
	if($('#condition').children().length >5){
		$(this).parent('li').parent('ul').remove();
	}else{
		var lis = $(this).parent('li').parent('ul').children('li');
		$(lis[0]).find('select').val('EMPTY');
		$(lis[1]).find('select').val('=');
		lis[2].innerHTML='<input type="text" />';
		$(lis[3]).find('select').val('and');
	}
});


// 切换事件
$('#condition select[name="key"]').live('change',function (){

	var val = this.value;
	var obj = this.parentNode.parentNode.children[2];
	var inputObj = {};
	
	if(val === 'logtype'){ // 日志类型
	
		obj.innerHTML = '<select><option value="access">功能访问</option><option value="operation">功能操作</option></select>';
		
	}else if(val === 'log_date'){ // 登录日期
		var obj1 = $("input[id*='logdate']");
		
		obj.innerHTML = '<input type="text" id="logdate'+obj1.length+'" />';
		document.getElementById('logdate'+obj1.length).onfocus = function (){WdatePicker({dateFmt:'yyyy-MM-dd'});};
		//xiewenda 20140918  添加绑定的 onclick 单击是也会弹出时间框
		document.getElementById('logdate'+obj1.length).onclick = function (){WdatePicker({dateFmt:'yyyy-MM-dd'});};
	}else if(val === 'log_time'){ // 登录时间
		var obj1 = $("input[id*='logtime']");
		obj.innerHTML = '<input type="text" id="logtime'+obj1.length+'" />';
		document.getElementById('logtime'+obj1.length).onfocus = function (){WdatePicker({dateFmt:'HH:mm:ss',isShowToday:false});};
		//xiewenda 20140918  添加绑定的 onclick 单击是也会弹出时间框
		document.getElementById('logtime'+obj1.length).onclick = function (){WdatePicker({dateFmt:'HH:mm:ss',isShowToday:false});};
	}else if(val === 'userid'){ // 登录用户
		var id = new Date().getTime();
		obj.style.position = 'relative';
		obj.innerHTML = '<input type="text" /><span id="'+ id +'" class="org"></span>';
		
		document.getElementById(id).onclick = function (){
			_userAndorg.who = 'user';
			_userAndorg.inputObj = obj.children[0]; // 把当前input Dom 临时存放到
			_userAndorg.init();

		};
	 //xiewenda 20140929 将id为username的select options的选择也添加上弹框效果
	}else if(val === 'username'){ // 登录用户
		var id = new Date().getTime();
		obj.style.position = 'relative';
		obj.innerHTML = '<input type="text" /><span id="'+ id +'" class="org"></span>';
		
		document.getElementById(id).onclick = function (){
			_userAndorg.who = 'user';
			_userAndorg.inputObj = obj.children[0]; // 把当前input Dom 临时存放到
			_userAndorg.init();

		};
		
	}else if(val === 'organfullname'){ // 部门
	
		var id = new Date().getTime();
		obj.style.position = 'relative';
		obj.innerHTML = '<input type="text" /><span id="'+ id +'" class="org"></span>';
		document.getElementById(id).onclick = function (){
			_userAndorg.who = 'org';
			_userAndorg.inputObj = obj.children[0]; // 把当前input Dom 临时存放到
			_userAndorg.init();

		};
		
	}else{
		obj.innerHTML = '<input type="text" />';
	}
	
});


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
	checkBox.selectAll(this,'log-table');
});
// 单选
$(document).on('click', '#log-table input[name="checks"]', function(){
	checkBox.selectOne(this);
});

window.onload = function (){

	$("#estabs").esTabs("open", {title:"日志管理", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "日志管理");
	
	var tree_ = document.getElementById('ztree');
	var table_ = document.getElementById('table');
	
	tree_.style.width = _size.treeDiv[0]+'px';
	tree_.style.height = _size.treeDiv[1]+'px';
	table_.style.width = _size.tableDiv[0]+'px';
	table_.style.height = _size.tableDiv[1]+'px';
	
	$.fn.zTree.init($("#log-tree"), _tree.setting, _tree.nodes);
	$("#log-tree_2_span").click();
	_table.init();
};

