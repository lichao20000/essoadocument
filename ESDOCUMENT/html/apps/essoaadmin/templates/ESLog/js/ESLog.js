/*wangbo 20140325*/
$(document).ready(function(){
	 
	 $("#logGrid").flexigrid({url :$.appClient.generateUrl({ESLog : 'getLogList'}, 'x'),
			dataType : 'json',
			colModel : [ 
               {display : '',name : 'startNum',width : 30,align : 'center'}, 
			    {display : '<input type="checkbox" id="logIdList">',name : 'ids',width : 50,align : 'center'}, 
			 { 
				name : 'id',
				hide:true
			}, 
			 {
				display : '日志年份',
				name : 'log_year',
				width : 70,
				sortable : true,
				align : 'center'
			},{
				display : '日志月份',
				name : 'log_month',
				width : 70,
				sortable : true,
				align : 'center'
			}, {
				display : '日志日期',
				name : 'log_day',
				width : 70,
				sortable : true,
				align : 'center'
			}, {
				display : 'log_quarter',
				name : 'log_quarter',
				width : 30,
				sortable : true,
				align : 'center',
			}, {
				display : '日志产生日期',
				name : 'log_date',
				width : 150,
				sortable : true,
				align : 'center'
			}, {    
				display : '日志产生时间',
				name : 'log_time',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : '用户ID',
				name : 'userid',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : '用户名',
				name : 'username',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : 'organpath',
				name : 'organpath',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : 'organfullname',
				name : 'organfullname',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : '日志组件',
				name : 'log_module',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : '日志路径',
				name : 'loginfo',
				width : 150,
				sortable : true,
				align : 'center'
			},{
				display : '地址',
				name : 'address',
				width : 150,
				sortable : true,
				align : 'center'
			}],
			buttons : [ {
				name : '删除',
				bclass : 'delete',
				onpress : delete_log
			}, {
				name : '清空',
				bclass : 'deleteAll',
				onpress : delete_allLog
			} ],
			singleSelect:true,
			usepager : true,
			title : '控制台服务管理',
			useRp : true,
			rp : 20,
			nomsg : "没有数据",
			showTableToggleBtn : false,
			pagetext : '第',
			outof : '页 /共',
			width : 'auto',
			height : 'auto',
			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
		});
			 
		 
		 
			//全选
			$("#logIdList").die().live('click',function(){
				$("input[name='logId']").attr('checked',$(this).is(':checked'));
			});
});