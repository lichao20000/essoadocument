var _autoSize = function (){
		var width = document.documentElement.clientWidth*0.96;
		var height = document.documentElement.clientHeight-110;	// 可见总高度 - 176为平台头部高度
		var leftWidth = 220;
		if(navigator.userAgent.indexOf("MSIE 6.0")>0){
			
			width = width-6;
			
		}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
			width = width-4;
			height = height-4;
		}
		
		var rightWidth = width - leftWidth-10;
		var tblHeight = height - 143;
		
		_size = {
			left: [leftWidth, height],
			right: [rightWidth, height],
			table: [rightWidth, tblHeight]
		};
};

var _global = {
		
		taskFlag: false, // 借阅,销毁...
		dostate: false, // 已发,已办
		workId: false,
		taskId: false,
		extId: false, // 只有信息发布待办才有, '' = $boardId.','.$id.','.$boardType
		formId: false, // 只有销毁,鉴定才有
		taskSize: false,
		typeParent: 'todo', // 待办业务,已发业务,已办业务
		typeChild: 'all' // 所有,借阅,编研,年报,鉴定,销毁,信息发布
		
	};

var dia = "";
var query = "";//请求
var comdia;//编研弹出
var yeardia;

(function (){
	//type,dostate,workid,taskid,extId
	/*
	 * type = jieyue|bianyan|jianding|xiaohui|publish
	 * dostate = no_handle
	 * workId = 2323
	 * taskId = 23222
	 * #$type.'&'.$workId.'&'.$taskId.'&'.$todo.'&'.$extId.'&'.$formId;
	 * #task|publish|60786|60792|no_handle|1,152,1|38|1364884935673
	 */
	var hash_string = window.location.hash;
	var hash_object = hash_string.split('|');
	//var now_time = new Date().getTime();
	var taskSize = hash_object.length;
	if(hash_object[0] == '#task' && taskSize == 8){
		
		_global.taskFlag = hash_object[1];
		_global.workId = hash_object[2];
		_global.taskId = hash_object[3];
		_global.dostate = hash_object[4];
		_global.extId = hash_object[5];
		_global.formId = hash_object[6];
		_global.taskSize = 6;
		
		window.location.hash = null;
		
	}else{
		window.location.hash = null;
	}
	
})();


var _nav = { // 导航
	
	bind: function (){ // 给导航A标签绑定事件
		
		var all_ = document.getElementById('type_all').children;
		var list_ = document.getElementById('type_list').children;
		
		var that_ = this,ai = all_.length,li = list_.length;
		for(var a=0; a<ai; a++)
		{
			
			all_[a].onclick = function (){
			
				that_.bindEvent(this);
				
			};
			
		}
		
		for(var l=0; l<li; l++)
		{
			list_[l].onclick = function (){
				
				that_.bindEvent(this);
				
			};
		}
		
	},
	bindEvent: function (that){ // 初始化样式并获取数据
		// +++++ 初始化样式 +++++//
		var p_ = that.parentNode;
		if(p_.id==='type_all'){
			_global.typeParent = that.id; // setting
			_global.typeChild = 'all'; // setting
			var pchild = document.getElementById('type_list').children;
			for(var pl=0; pl<pchild.length; pl++)
			{
				pchild[pl].className = '';
			}
		}else{
			_global.typeChild = that.id; // setting
		}
		
		var pchild = p_.children;
		for(var pl=0; pl<pchild.length; pl++)
		{
			if(pchild[pl].className){
				pchild[pl].className = '';
			}
		}
		that.className = 'selected';
		// ----- 初始化样式 ------//
		this.getData(that);
	},
	getData: function (that){
		$('#userFormcheck').removeAttr("checked");
		var url = $.appClient.generateUrl({
					ESCollaborative: 'getCollaborativeDataList',
					parent: _global.typeParent,
					child: _global.typeChild
				},'x');
		// longjunhao 20140620 add 判断业务类型
		$('#mylist').attr('selectType', _global.typeParent);
		$("#mylist").flexOptions({newp: 1, url: url}).flexReload();
		
		// longjunhao 20140925 控制删除按钮显示
		var selectType = _global.typeParent;
		if (selectType == 'send' || selectType == 'have_send') {//待发或已发
			$('#deleteUserFormBtn').show();
		} else {
			$('#deleteUserFormBtn').hide();
			$('.tDiv2').css('height','30px');
		}
	}
		
};


var _table = {
		
		init: function (){
			
			$("#mylist").flexigrid({
				url: $.appClient.generateUrl({ ESCollaborative: 'getCollaborativeDataList', parent: 'todo', child: 'all'},'x'),
				//url: false,
				dataType: 'json',
				colModel: [
				    {display : '<input id="userFormcheck" type="checkbox" name="userFormIds">', name : 'ids', width : 25,align : 'center'}, 
					{display: '查看', name: 'open', width: 80, sortable: true, align: 'center'},
					{display: '编号', name: 'userFormNo', metadata:'userFormNo', width: 150, sortable: true, align: 'center'},
					
					{display: 'id', name: 'id', metadata:'id',hide:true, width: 100, sortable: true, align: 'center'},
					{display: '用户ID', name: 'userId',metadata:'userId',hide:true, width: 100, sortable: true, align: 'center'},
					{display: '表单ID', name: 'formId',hide:true, width: 100, sortable: true, align: 'center'},
					{display: '工作流ID', name: 'wfId', hide:true,width: 100, sortable: true, align: 'center'},
					{display: '步骤ID', name: 'stepId',hide:true, width: 100, sortable: true, align: 'center'},
					
					{display: '标题', name: 'title', metadata:'title',width: 300, sortable: true, align: 'center'},
					
					{display: '是否是已办流程', name: 'isDealed', hide:true,width: 100, sortable: true, align: 'center'},
					
//					{display: '发起人', name: 'name', width: 100, sortable: true, align: 'center'},
					{display: '发起日期', name: 'start_time',metadata:'start_time', width: 200, sortable: true, align: 'center'},
					
					{display: '表单数据ID', name: 'dataId',hide:true, width: 200, sortable: true, align: 'center'},
					{display: '第一个步骤ID', name: 'firstStepId',hide:true, width: 200, sortable: true, align: 'center'},
					{display: '流程类型', name: 'workFlowType', hide:true,width: 200, sortable: true, align: 'center'},
					{display: 'isSelf', name: 'isSelf', hide:true, width: 100, sortable: true, align: 'center'},
					{display: 'isLast', name: 'isLast', hide:true, width: 100, sortable: true, align: 'center'},
					{display: '状态', name: 'wfState',metadata:'wfState', width: 100, sortable: true, align: 'center'}
				],
				buttons :[
				    {name:'删除', bclass:'delete', id:'deleteUserFormBtn', onpress: function(){collaborativeHandle.deleteUserFormData();}}
				],
				usepager: true,
				title: '列表',
				useRp: true,
				rp: 20,
				procmsg:"正在加载，请稍等",
				nomsg:"没有数据",
				pagetext: '第',
				outof: '页 /共',
				width: _size.table[0],
				height: _size.table[1],
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});
			
			// longjunhao 20140925 控制删除按钮显示
			var selectType = $('#mylist').attr('selectType');
			if (selectType == 'send' || selectType == 'have_send') {//待发或已发
				$('#deleteUserFormBtn').show();
			} else {
				$('#deleteUserFormBtn').hide();
				$('.tDiv2').css('height','30px');
			}
		}
		
};
/** gaoyide 20141008 bug1293**/
var checkBox2 = {
		selectOne : function(that) { // 单选|取消单选
			if ($(that).attr('checked') == 'checked') {
				$(that).closest('tr').addClass('trSelected');
			} else {
				$(that).closest('tr').removeClass('trSelected');
			}
		},
		selectAll : function(that, tblId) { // 全选|取消全选
			if ($(that).attr('checked') == 'checked') {
				$(that).attr('checked', 'checked');
				$('#' + tblId).find('tr').addClass('trSelected');
				$('#' + tblId).find('tr input[type="checkbox"]').attr('checked',
						'checked');
			} else {
				$(that).removeAttr('checked');
				$('#' + tblId).find('tr').removeClass('trSelected');
				$('#' + tblId).find('tr input[type="checkbox"]').removeAttr(
						'checked');
			}
		},
		cancelOne : function(cbObj) { // $('#id=4')
			cbObj.removeAttr('checked');
		},
		cancelAll : function(tblId) { // $('$tbl')
			var inputs = tblId.find('input[checked="checked"]');
			var l = inputs.length;
			for (var i = 0; i < l; i++) {

				inputs.eq(i).removeAttr('checked');

			}
		}
	};
$(document).on('click', '#userFormcheck', function() {
	checkBox2.selectAll(this, 'mylist');
});
var _task = {
		
		iface: function (p){
			
			var type,taskid,dostate,workid,extId,formId,taskFromHome = false;
			
			if(typeof p === 'string'){ // 从首页过来的待办
				if(_global.taskFlag && _global.taskSize === 6){
					
					type = _global.taskFlag;
					taskid = _global.taskId;
					dostate = _global.dostate;
					if((taskid==false || taskid=='' || taskid==null) && dostate=='no_handle' && type=='jieyue'){
						taskid='getBack';
					}
					workid = _global.workId;
					extId = _global.extId;
					formId = _global.formId;
					taskFromHome = true;
				}else{
					return false;
				}
			}else if(typeof p === 'object'){ // 待办模块
				
				type = p.getAttribute('type');
				taskid = p.getAttribute('taskid');
				dostate = p.getAttribute('dostate');
				workid = p.getAttribute('workid');
				extId = p.getAttribute('id'); // extId = '1,232' = boardId,topicId {author:fangjixiang,date:20130313}
				formId = p.getAttribute('formId'); // extId = '1,232' = boardId,topicId {author:fangjixiang,date:20130313}
				
			}
			
			if(!type || !dostate || !workid || !extId || (_global.typeParent == 'todo' && !taskid)){// 已发已办可能不存在taskid或者为空
				
				$.dialog.notice({title:false, content: '待办数据错误，无法打开！', time: 2, icon: 'warning'});
				return;
			}
			
			if(taskid === '0000' && p.getAttribute('formid')){ // 鉴定，销毁组员待办，当taskid＝'0000'为组员

				var url = $.appClient.generateUrl({ESArchiveDestroy:'index'});
				var template = type === 'jianding' ? 'identify' : 'destroy';
				window.location.href = url+'#task|'+template+',member|'+formId+'|'+new Date().getTime();
				return;
			}
			
			switch(type){
				case 'jieyue': _opens.showdetail(dostate,workid,taskid); break;
				case 'bianyan': _opens.bianyandetail(dostate,workid,taskid); break;
				case 'nianbao': _opens.yeardetail(dostate,workid,taskid); break;
				case 'jianding': $archive_destroy.flowsheet_form(workid,taskid,'identify'); break; // 档案销毁-鉴定流程@方吉祥
				case 'xiaohui': $archive_destroy.flowsheet_form(workid,taskid,'destroy'); break; // 档案销毁-鉴定流程@方吉祥
				case 'publish': _publishInfo.flowsheet_task(workid,taskid,extId); break; // 信息发布流程@方吉祥
				case 'nianjian': _opens.showInspect(workid,taskid); break;
			}
			
			if(taskFromHome){
				
				_global.taskFlag = _global.dostate = _global.workId = _global.taskId = _global.extId = _global.taskSize = false;
				
			}
			
		}
		
};

var _opens = {
		
		showdetail: function (todo,workid,recordid){ // 借阅
			query = workid;
			//alert(query);return;
			var mytodo=todo;
			var url="";
			if(mytodo=="no_handle"){
				if(recordid=='getBack'){
					url= $.appClient.generateUrl({ESCollaborative:'getback',workid:workid},'x');
				}else{
					url= $.appClient.generateUrl({ESCollaborative:'detail',workid:workid,recordid:recordid},'x');
				}
			}else{
				url=$.appClient.generateUrl({ESCollaborative:'dodetail',workid:workid},'x');
			}
			$.ajax({
				url:url,
				success:function(data){
					dia = $.dialog({
				    	title:'详细信息',
				    	padding:0,
			    	   	fixed:true,
			    	    resize: false,
				    	content:data
				    });
				}
			});
		},
		bianyandetail: function (todo,workid,recordid){ //编研
			var mytodo=todo;
			var url="";
			
			if(mytodo=="no_handle"){
					url= $.appClient.generateUrl({ESCollaborative:'compdetail',workid:workid,recordid:recordid},'x');
			}else{
				url=$.appClient.generateUrl({ESCollaborative:'comdodetail',workid:workid},'x');
			}
			$.ajax({
				url:url,
				success:function(data){
					comdia = $.dialog({
				    	title:'详细信息',
				    	padding:0,
			    	   	fixed:true,
			    	    resize: false,
				    	content:data
				    });
				}
			});
		},
		yeardetail: function (todo,workid,recordid){ //年报流程中渲染的页面
			var mytodo=todo; 
			var url="";
			if(mytodo=="no_handle"){
				url= $.appClient.generateUrl({ESCollaborative:'yeardetail',workid:workid,recordid:recordid},'x');
			}else{
				url=$.appClient.generateUrl({ESCollaborative:'yeardodetail',workid:workid},'x');
			}
			$.ajax({
				url:url,
				success:function(data){
					    yeardia = $.dialog({
				    	title:'详细信息',
				    	padding:0,
			    	   	fixed:true,
			    	    resize: false,
				    	content:data
				    });
				}
			});
		},
		//查看督办流程 by niyang
		showInspect: function(workid,taskid) {
			$.ajax({
				url:$.appClient.generateUrl({ESCollaborative:'getInspectTodoDetail',workid:workid},'x'),
				success:function(data){
					dia = $.dialog({
				    	title:'查看督办详细信息',
				    	width: '480',
				    	height: '350',
				    	padding: '10 10',
			    	   	fixed:true,
			    	    resize: false,
				    	content:data,
				    	ok: function(){
				    		var url = $.appClient.generateUrl({ESCollaborative:'taskInspectOperation',workid:workid,taskid:taskid},'x');
				    		$.get(url,function(data) {				    			
				    			if(data.status) {
				    				$.dialog.notice({title:'操作提示',content:'成功！',icon:'succeed',time:2});				    				
				    				$('#mylist').flexReload();
				    			} else {
				    				$.dialog.notice({title:'操作提示',content:'失败！',icon:'error'});
				    				return false;
				    			}
				    		});
				    	},
				    	okVal: '确定'
				    });
				}
			});

		}
};





$(document).on('click', '#mylist .opens', function (){
//	alert(11);
	_newOpen.iface(this); // 共用接口
	
});

// longjunhao 20140925 取消了双击打开流程表单的操作,避免与checkbox冲突
/**
$(document).on('dblclick', '#mylist tr', function (){
//	alert(22);
	var that = this.firstChild.firstChild.firstChild;
//	_task.iface(that); // 共用接口
	// longjunhao 20140911 修复bug 1051 改为双击直接打开流程
	_newOpen.iface(that); // 共用接口
	
});
*/
function addCkeditor(id){  
    var editor2 = CKEDITOR.instances[id];  
    if(editor2) editor2.destroy(true);//销毁编辑器 content2,然后新增一个  
        editor = CKEDITOR.replace(id,{
    		toolbar:[],
    		height : '300', // 编辑器高度
    		CheckBrowser : true, // 是否在显示编辑器前检查浏览器兼容性,默认为true
    		resize_enabled : true
    		
    	});  
        $('.cke_top').html("编研内容");
}

$(document).ready(function(){
	
	_autoSize();
	$("#estabs").esTabs("open", {title:"协同管理", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "协同管理");
	
	$('#leftDiv').css({width: _size.left[0], height: _size.left[1]});
	$('#rightDiv').css({width: _size.right[0], height: _size.right[1]});
	_task.iface('task from home'); // 是否是首页过来的待办数据,task from home 参数无意义但传值类型为string
	_nav.bind(); // 绑定导航
	_table.init(); // 初始化表格
});

window.onresize = function (){
	_autoSize();
	$('#leftDiv').css({width: _size.left[0], height: _size.left[1]});
	$('#rightDiv').css({width: _size.right[0], height: _size.right[1]});
	$('#rightDiv .flexigrid').css({width: _size.table[0]});
	$('#rightDiv .bDiv').css({height: _size.table[1]});
};