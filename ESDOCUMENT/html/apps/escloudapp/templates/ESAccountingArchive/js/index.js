//预加载的内容及初始化
window.onload = function (){
	$("#estabs").esTabs("open", {title:"会计借阅管理", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "会计借阅管理");
	_flextbl.init();
};
//根据浏览器的类型自动调整整体的宽、高
var _size = {
	init : function() {
		var width_ = $(document).width();
		var height_ = $(document).height();
		var tblWidth_ = width_;
		var tblHeight_ = height_ - 222;
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
var _flextbl = {
	init : function() {
		$("#flexme1").flexigrid({
			url : $.appClient.generateUrl({ESAccountingArchive:'account_json'}),
			dataType : 'json',
			colModel : showColModel,
		    buttons : showButton,
			usepager: true,
			useRp: true,
			showTableToggleBtn: false,
			onDoubleClick:modify,
			rp: 20,
			procmsg:"正在加载，请稍等",
			nomsg:"没有数据",
			pagetext: '第',
			outof: '页 /共',
			width: _size.init().tblWidth,
			height: _size.init().tblHeight,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
	}
};
var __borrowModel='using';
var showColModel=[
		{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
		{display: '操作', name : 'c3', width : 60, sortable : true, align: 'center'},
		{display: '借阅单编号', name : 'c4', width : 100, sortable : true, align: 'center',metadata:'Code'},
		{display: '借阅人', name : 'c5', width : 60, sortable : true, align: 'center',metadata:'Reader'},
		{display: '单位', name : 'c6', width : 80, sortable : true, align: 'center',metadata:'Dept'},
		{display: '电话', name : 'c7', width : 80, sortable : true, align: 'center',metadata:'Telephone'},
		{display: '邮箱', name : 'c8', width : 150, sortable : true, align: 'center',metadata:'Email'},
		{display: '利用目的', name : 'c9', width : 80, sortable : true, align: 'center',metadata:'Usepurpose'},
		{display: '催还提前天数', name : 'c10', width : 60, sortable : true, align: 'center',metadata:'Validdate'},
		{display: '登记人', name : 'c12', width : 60, sortable : true, align: 'center',metadata:'Register'},
		{display: '登记日期', name : 'c13', width : 110, sortable : true, align: 'center',metadata:'Registdate'},
		{display: '状态', name : 'c14', width : 60, sortable : true, align: 'center',metadata:'Status'},
		{display: '备注', name : 'c15', width : 120, sortable : true, align: 'center',metadata:'Description'}
    ];
var showButton=[
		{name: '添加', bclass: 'add',onpress: addAccountBorrowForm},
		{name: '删除', bclass: 'delete',onpress:delAccountBorrowForm},
		{name: '筛选', bclass: 'filter',onpress:filterAccountBorrowForm},
		{name: '还原数据',bclass: 'back',onpress:backAccountIndex},
		{name: '借阅报表',bclass: 'report',onpress:printAccountBorrowPage}
    ];
function hideCata() {
	$("#catagory").fadeOut("fast");
}
function clickBodyDown(event) {
	if (!(event.target.id == "catagory" || event.target.id == "fication" || $(event.target).parents("#catagory").length>0)) {
		hideCata();
	}
}
//借阅明细列表添加行   201307   
function addLineDetail(){
	if(archiveType==''){
		var trs=$("#borrowDetails").find("input[name='id3']");
		if(trs.length==0){
			archiveType='accounting';
		}else{
			var types=[];
			var voidTypes='';
			trs.each(function(){
				var path=$(this).val();
				var bothPath=path.split('|');
				types.push(bothPath[2]);
			});
			voidTypes=types.join('');
			if(voidTypes==''){
				archiveType='accounting';
			}
		}
	}
	
	var nums='';
	var trs=$("#borrowDetails").find("input[name='id3']");
	nums=trs.length+1;
	$("#borrowDetails").flexExtendData([{"id":'demo',"cell":{"num":nums,"id3":'<input type="checkbox" name="id3" id=""  value="'+''+'|'+idm+'|'+archiveType+'"/>','c3':'<div style="width:100px;height:11px;" onclick="editName(this)"></div>','c4':'<div style="width:100px;height:11px;" onclick="editName(this)"></div>','c5':'<input type="radio" name='+nums+' checked value="实体借阅"/>实体借阅<input type="radio" name='+nums+' value="实体借出"/>实体借出','c6':'未借阅','c7':'<input name="mark" type="text" size="12" value="" placeholder="请填写备注"/>'}}]);
}
function editName(obj){
 	if($('input',$(obj)).length>0){return;}
 	var tdObj=$(obj).closest("td");
 	tdObj.children().bind('click',function(){
 		editNameT(this);
 	});
 	var _Iheight=tdObj.children().width()-10;
 	var html=$(obj).text();
 	var Ival='';
 	var input=document.createElement('input');
 	input.style.width=_Iheight+'px';
 	input.style.height='14px';
 	input.value=html;
 	$(obj).replaceWith(input);
 	$(input).focus();
 	$(input).select();
 	input.onblur=function(){
 		$(this).replaceWith($(obj));
 		Ival=this.value;
 		$(this).parent().remove();
 		tdObj.children().text(Ival);
 	};
}
function editNameT(obj){
 	if($('input',$(obj)).length>0){return;}
 	var tdObj=$(obj).closest("td");
	var _Iheight=tdObj.children().width()-10;
 	var html=$(obj).text();
 	var input=document.createElement('input');
 	input.style.width=_Iheight+'px';
 	input.style.height='14px';
 	input.value=html;
 	$(obj).empty().append(input);
 	$(input).focus();
 	$(input).select();
 	input.onblur=function(){
 		obj.innerHTML=this.value;
 	};
}
//判断实体借阅与实体借出时是否在库  201307
$(":radio",$("#borrowDetails")).die().live('change',function(){
	var trObj=$(this).closest('tr');
	var checkedpath = trObj.find("input[name='id3']").val();
	if(checkedpath!=''){
		if(checkedpath.indexOf('|')!=-1){
			 var checkpath=checkedpath.split('|');
			 checkedpath=checkpath[0];
		}
		if(checkedpath!=''){
			var path=checkedpath;
			var thisobj = $(this);
			var url = $.appClient.generateUrl({ESArchiveLending:'getState'},'x');
			$.ajax({
				url:url,
				data:"path=" + path,
				type:'post',
				cache:false,
				success:function(data){
					if(data){
						thisobj.attr({checked:"checked"});
					} else {
						if(thisobj.val()=='电子借阅'){
							thisobj.attr({checked:"checked"});
							thisobj.siblings().attr({disabled:"disabled"});
						}else{
							thisobj.attr({checked:false,disabled:"disabled"});
							thisobj.siblings().eq(1).attr({checked:false,disabled:"disabled"});
							thisobj.siblings().eq(0).attr({checked:"checked"});
						}
						$.dialog.notice({title:'操作提示',content:'此实体档案已经借出！',icon:'warning',time:3});
					}
				}
			});
		}
	}
});
var archiveType='';
//在未提交或已退回時編輯數據時添加借閱明細  201307
function addEditDetails(){
	var url=$.appClient.generateUrl({ESArchiveLending:'record'},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    var linkdialog=$.dialog({
	    	title:'添加借阅明细',
	    	width: '800px',
	    	height:'380px',
	    	padding:'0px',
    	   	fixed:  true,
    	    resize: false,
    	    okVal:'保存',
		    ok:true,
		    cancelVal: '取消',
		    cancel: true,
	    	content:data,
	    	ok:function()
	    	{
				linkBorrowDetail();
				return false;
			},
			init:createFileTree
		 });
    	// 挂接借阅文件信息
		function linkBorrowDetail(){
			var ACode='';
			var title='';
			var files = [];
			var checkboxs = $("#borrowlist").find("input[name='path']:checked");
			if (checkboxs.length > 0 ){
				var nums='';
				var types=[];
				var voidTypes='';
				var paths = [];
				var usingformId='';
				//根据元数据获取相应的标题top
				var ACodeName='';
				var ACodeMeta='';
				var titleName='';
				var titleMeta='';
				if(archiveType=='document'){
					ACodeMeta='ArchivalCode';
					titleMeta='Title';
					ACodeName=$("#borrowlist").flexGetColumnDisplay(['ArchivalCode']);
					titleName=$("#borrowlist").flexGetColumnDisplay(['Title']);
				}else if(archiveType=='accounting'){
					ACodeMeta='RecordID';
					titleMeta='Summary';
					ACodeName=$("#borrowlist").flexGetColumnDisplay(['RecordID']);
					titleName=$("#borrowlist").flexGetColumnDisplay(['Summary']);
				}else if(archiveType=='contract'){
					ACodeMeta='RecordID';
					titleMeta='Title';
					ACodeName=$("#borrowlist").flexGetColumnDisplay(['RecordID']);
					titleName=$("#borrowlist").flexGetColumnDisplay(['Title']);
				}/*else if(archiveType=='technical'){
					ACodeMeta='RecordID';
					titleMeta='Title';
					ACodeName=$("#borrowlist").flexGetColumnDisplay(['RecordID']);
					titleName=$("#borrowlist").flexGetColumnDisplay(['Title']);
				}else if(archiveType=='auditfiles'){
					ACodeMeta='RecordID';
					titleMeta='Title';
					ACodeName=$("#borrowlist").flexGetColumnDisplay(['RecordID']);
					titleName=$("#borrowlist").flexGetColumnDisplay(['Title']);
				}*/
				//根据元数据获取相应的标题top
				var trs=$("#borrowDetails").find("input[name='id3']");
				nums=trs.length;
				if(nums==0){
					var ModleCol=[
									{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
			        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
			        				{display: ACodeName, name : 'c3', width : 60, align: 'left',metadata:ACodeMeta},
			        				{display: titleName, name: 'c4',width : 80,align: 'left',metadata:titleMeta},
			        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
			        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
			        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
			        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'}
							];
					var buttonCol=[
							{name: '选择系统档案', bclass: 'add',onpress:addEditDetails},
	   		        		{name: '手工录入', bclass: 'add',onpress:addLineDetail},
	   		        		{name: '删除', bclass: 'delete',onpress:delEditDetails},
	   		        		{name: '借阅', bclass: 'tranlist',onpress:changeAccountStatus},
	   		        		{name: '借出', bclass: 'export',onpress:changeAccountStatus},
	   		        		{name: '归还', bclass: 'back',onpress:changeAccountStatus}
							];
					$(".bottom").html('<table id="borrowDetails"></table>');
					$("#borrowDetails").flexigrid({
						url:false,
						dataType: 'json',
						editable: true,
						colModel : ModleCol,
						buttons : buttonCol,
						usepager: true,
	    				title: '借阅明细列表',
	    				useRp: true,
	    				rp: 20,
	    				nomsg:"没有数据",
	    				showTableToggleBtn: false,
	    				pagetext: '第',
	    				outof: '页 /共',
	    				width: 580,
	    				height: 190,
	    				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
					});
					$("#borrowDetails").flexReload();
				}else{
					trs.each(function(){
						var path=$(this).val();
						var bpath=path.split('|');
						usingformId=bpath[1];
						paths.push(bpath[0]);
						types.push(bpath[2]);
					});
					paths=paths.join(',');
					voidTypes=types.join('');
				}
				if(usingformId==''){
					usingformId=idm;
				}
				if(voidTypes!='' && types[0]!=archiveType){
					switch(types[0]){
						case 'document': types[0]='文书档案';
							break;
						case 'accounting': types[0]='会计档案';
							break;
						case 'contract': types[0]='合同档案';
							break;
						case 'technical': types[0]='科技档案';
							break;
						case 'auditfiles': types[0]='审计档案';
							break;
					}
					$.dialog.notice({title:'操作提示',content:'请选择 '+types[0]+' 类型的档案！',icon:'warning',time:3});
					return false;
				}
				checkboxs.each(function(){
					var trObj=$(this).closest('tr');
					var checkpath = $(this).val();
					if(paths.length>0){
						if (paths.indexOf(checkpath)==-1) {
							ACode=$("#borrowlist").flexGetColumnValue(trObj,[ACodeMeta]);
	    		         	title=$("#borrowlist").flexGetColumnValue(trObj,[titleMeta]);
	    					files.push(ACode+'|'+title+'|'+checkpath);
						}
					}else{
							ACode=$("#borrowlist").flexGetColumnValue(trObj,[ACodeMeta]);
	    		         	title=$("#borrowlist").flexGetColumnValue(trObj,[titleMeta]);
    						files.push(ACode+'|'+title+'|'+checkpath);
					}
				});
				files=files.join(',');
				if(files==''){
					$.dialog.notice({title:'操作提示',content:'您添加的数据重复，请重新选择！',icon:'warning',time:3});
					return false;
				}else{
					$.post($.appClient.generateUrl({ESAccountingArchive:'linkBorrowDetailsTwo'},'x'),{usingformId:usingformId,nums:nums,files:files,archiveType:archiveType}, function(data){
						if(data){
							$("#borrowDetails").flexOptions({url:$.appClient.generateUrl({ESAccountingArchive:'showDetails',idm:idm},'x')}).flexReload();	
							linkdialog.close();
						}
					},'json');
				}
			}else{
				$.dialog.notice({title:'操作提示',content:'请选择您要添加的数据！',icon:'warning',time:3});
				return false;
			}
		};
		},
		cache:false
	});
}
//在未提交或已退回時編輯數據時去除挂接借阅文件信息
function delEditDetails(){
	var checkboxes=$("#borrowDetails").find("input[name='id3']:checked");
	if(checkboxes.length==0){
		$.dialog.notice({icon:'warning',content:"请选择要删除的数据！",time:3});
		return false;
	}else{
		var sign=0;
		var borrowOuts=[];
		var stus='';
		checkboxes.each(function(){
			var trObj=$(this).closest('tr');
			stus=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			if(stus=='借出'){
				sign=1;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				borrowOuts.push(num);
			}
		});
		borrowOuts=borrowOuts.join(",");
	}
	if(sign==0){
		$.dialog({
			content:'确认要删除吗?',
			ok:true,
			okVal:'确认',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				if(checkboxes.length > 0){
					var ids=[];
					var ID='';
					checkboxes.each(function(){
						var checkboxVal=$(this).val();
						var checkPathVal=checkboxVal.split('|');
						ID=$(this).attr('id');
						if(checkPathVal[0]=='' && ID==''){
							$(this).closest("tr").remove();
						}else{
							ids.push(ID);
						}
					});
					ids=ids.join(',');
					if(ids!=''){
						var url=$.appClient.generateUrl({ESAccountingArchive:'delAccountDetails'},'x');
						$.get(url,{ids:ids},function(data){
							if(data==1){
								$("input[name='ids3']").attr('checked',false);
								$.dialog.notice({width:150,icon:'succeed',content:'数据删除成功!',time:3,title:'3秒后自动关闭!'});
								$("#borrowDetails").flexOptions({newp:1}).flexReload();
								$.post($.appClient.generateUrl({ESAccountingArchive:'getLastTotal'},'x'),{idm:idm},function(result){
									if(result==0){
										archiveType='';
										$(".bottom").html('<table id="borrowDetails"></table>');
										$("#borrowDetails").flexigrid({
											url:false,
											dataType: 'json',
											editable: true,
											colModel : [
																{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
										        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
										        				{display: '凭证编号', name : 'c3', width : 60, align: 'left',metadata:'RecordID'},
										        				{display: '摘要', name: 'c4',width : 80,align: 'left',metadata:'Summary'},
										        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
										        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
										        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
										        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'}
														],
											buttons : [
																{name: '选择系统档案', bclass: 'add',onpress:addEditDetails},
									    		        		{name: '手工录入', bclass: 'add',onpress:addLineDetail},
									    		        		{name: '删除', bclass: 'delete',onpress:delEditDetails},
									    		        		{name: '借阅', bclass: 'tranlist',onpress:changeAccountStatus},
									    		        		{name: '借出', bclass: 'export',onpress:changeAccountStatus},
									    		        		{name: '归还', bclass: 'back',onpress:changeAccountStatus}
														],
											usepager: true,
						    				title: '借阅明细列表',
						    				useRp: true,
						    				rp: 20,
						    				nomsg:"没有数据",
						    				showTableToggleBtn: false,
						    				pagetext: '第',
						    				outof: '页 /共',
						    				width: 580,
						    				height: 190,
						    				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
										});
										$("#borrowDetails").flexReload();
									}
								});
							}
						});
					}
				}
			},
			cache:false
		});
	}else if(sign==1){
		 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+borrowOuts+'行已借出，不允许删除，请重新选择！',icon:'warning',time:3});
    	 $("input[name='ids3']").attr('checked',false);
    	 $("input[name='id3']").attr('checked',false);
		 return false;
	}
}
//修改借阅借出归还的状态
function changeAccountStatus(name){
	var checkbox=$("#borrowDetails").find("input[name='id3']:checked");
     //判断是否改变借阅明细的数据
     if(checkbox.length==0){
    	 $.dialog.notice({icon:'warning',content:'请选择借阅明细的数据！',time:3});
     	 return false;
     }
     var STATUS = '';
     var MARK = '';
     var ID = '';
     var readType='';
     var VAL='';
     var PATH= '';
     var isVAL=0;
     var details=[];
     var flag=0;
     var nums=[];
     var huans=[];
     if(name=='借阅'){
    	 checkbox.each(function(){
			 var trObj=$(this).closest('tr');
			 var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			 STATUS=name;
			 MARK=trObj.find("input[name='mark']").val();
			 ID=trObj.find("input[name='id3']").attr('id');
			 VAL=trObj.find("input[name='id3']").val();
			 if(VAL==''){
				 isVAL=1;
				 var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 readType=trObj.find("input[name='"+nume+"']:checked").val();
				 PATH='';
			 }else{
				 isVAL=2;
				 VAL=VAL.split('|');
				 PATH=VAL[0];
				 if(PATH==''){
					 readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				 }else{
					 readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				 }
			 }
			 if(stat=='借出'){
				 flag=1;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
			 }
			 
			 details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType);
		 });
    	 nums=nums.join(",");
     }else if(name=='借出'){
    	 checkbox.each(function(){
			 var trObj=$(this).closest('tr');
			 var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			 STATUS=name;
			 MARK=trObj.find("input[name='mark']").val();
			 ID=trObj.find("input[name='id3']").attr('id');
			 VAL=trObj.find("input[name='id3']").val();
			 if(VAL==''){
				 isVAL=1;
				 var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 readType=trObj.find("input[name='"+nume+"']:checked").val();
				 PATH='';
			 }else{
				 isVAL=2;
				 VAL=VAL.split('|');
				 PATH=VAL[0];
				 if(PATH==''){
					 readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				 }else{
					 readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				 }
			 }
			 if(stat=='借出'){
				 flag=2;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
			 }
			 
			 details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType);
		 });
    	 nums=nums.join(",");
     }else if(name=='归还'){
    	 checkbox.each(function(){
			 var trObj=$(this).closest('tr');
			 var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			 STATUS=name;
			 MARK=trObj.find("input[name='mark']").val();
			 ID=trObj.find("input[name='id3']").attr('id');
			 VAL=trObj.find("input[name='id3']").val();
			 if(VAL==''){
				 isVAL=1;
				 var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 readType=trObj.find("input[name='"+nume+"']:checked").val();
				 PATH='';
			 }else{
				 isVAL=2;
				 VAL=VAL.split('|');
				 PATH=VAL[0];
				 if(PATH==''){
					 readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				 }else{
					 readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				 }
			 }
			 if(stat=='未借阅' || stat=='借阅'){
				 flag=3;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
			 }else if(stat=='归还'){
				 flag=4;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 huans.push(num);
			 }
			 
			 details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType);
		 });
    	 nums=nums.join(",");
    	 huans=huans.join(",");
     }
     if(isVAL==1){
    	 $.dialog.notice({title:'操作提示',content:'您选择的数据含有未保存的数据，不能'+name+'，请保存后重新选择！',icon:'warning',time:3});
    	 $("input[name='ids3']").attr('checked',false);
    	 $("input[name='id3']").attr('checked',false);
		 return false;
     }else if(isVAL==2){
    	 if(flag==0){
        	 details=details.join(",");
        	 $.post($.appClient.generateUrl({ESAccountingArchive:'changeAccountLinkDetails'},'x'),{details:details},function(data){
        		 if(data){
        			 $("input[name='ids3']").attr('checked',false);
        			 $("#borrowDetails").flexReload();
        		 }
        	 });
         }else if(flag==1){
        	 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行已借出，请重新选择！',icon:'warning',time:3});
        	 $("input[name='ids3']").attr('checked',false);
        	 $("input[name='id3']").attr('checked',false);
    		 return false;
         }else if(flag==2){
        	 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行已借出，请重新选择！',icon:'warning',time:3});
        	 $("input[name='ids3']").attr('checked',false);
        	 $("input[name='id3']").attr('checked',false);
    		 return false;
         }else if(flag==3){
        	 $.dialog.notice({title:'操作提示',content:'第'+nums+'行数据不需要归还，请重新选择！',icon:'warning',time:3});
        	 $("input[name='ids3']").attr('checked',false);
        	 $("input[name='id3']").attr('checked',false);
    		 return false;
         }else if(flag==4){
        	 $.dialog.notice({title:'操作提示',content:'第'+huans+'行数据已归还，请重新选择！',icon:'warning',time:3});
        	 $("input[name='ids3']").attr('checked',false);
        	 $("input[name='id3']").attr('checked',false);
    		 return false;
         }
     }
}
//初始化显示档案著录目录树
function createFileTree(){
	var setting={
		view:{
			dblClickExpand: false,
			showLine: false
		},
		data:{
			simpleData:{
				enable: true
			}
		},
		/*async:{
			enable: true,
			dataType:'json',
			url:$.appClient.generateUrl({ESAccountingArchive:'initFile'},'x'),
			autoParam:["id"]
		},*/
		callback:{
			onClick:nodeClick
		}
	};
	function nodeClick(event, treeId, treeNode){
		zTree = $.fn.zTree.getZTreeObj("filetree");
		zTree.expandNode(treeNode);
		//archiveName=treeNode.name;
		archiveType=treeNode.archivetype;
		if(treeNode.sId!=0 && treeNode.isParent!=true){
			strucid=treeNode.sId;
			var path=treeNode.path;
			var reg=/\//g;
			nodePath=path.replace(reg, '-');
			var url=$.appClient.generateUrl({ESAccountingArchive:'datalist',path:nodePath},'x');
			$("#borrowlistbox").load(url);
		}
	};
	var url = $.appClient.generateUrl({ESAccountingArchive:'getTree',status:2},'x');
	$.ajax({
		url:url,
		dataType: 'json',
		success:function(nodes){
			$.fn.zTree.init($("#filetree"), setting, nodes);
		},
		cache:false
	});
}
//打印借阅单页面的渲染   201307
function printAccountBorrowPage(){
	  var checkObj=$("#flexme1").find("input[name='id']:checked");
	  if(checkObj.length==0){
		  $.dialog.notice({title:'操作提示',icon:'warning',content:'请选择数据！',time:3});
		  return false;
	  }else if(checkObj.length>0){
		  var htmlContent=["<div class='borrowWrap'>"];
		  $.getJSON($.appClient.generateUrl({ESAccountingArchive:'getAcBorrowDataByBorrowModel',borrowModel:__borrowModel},'x'),function(result){
			  if(result.length==0){
				  $.dialog.notice({title:'操作提示',icon:'warning',content:'目前借阅单没有报表！',time:3});
				  return false;
			  }
			  htmlContent.push("<h2>报表格式选择</h2>");
			  htmlContent.push("<div class='borrowSelect' id='borrowLevel'>");
			  if(result.length == 1){
				htmlContent.push("<p><label for='"+(result[0].id)+"'><input type='radio' title='"+(result[0].reportstyle)+"' name='RE' id='"+(result[0].id)+"' value='form' checked='checked' /><span>"+(result[0].title)+'( '+(result[0].reportstyle)+' )'+"</span></label></p>");
			  }else if(result.length == 2){
				htmlContent.push("<p><label for='"+(result[0].id)+"'><input type='radio' title='"+(result[0].reportstyle)+"' name='RE' id='"+(result[0].id)+"' value='form' checked='checked' /><span>"+(result[0].title)+'( '+(result[0].reportstyle)+' )'+"</span></label></p>");
				htmlContent.push("<p><label for='"+(result[1].id)+"'><input type='radio' title='"+(result[1].reportstyle)+"' name='RE' id='"+(result[1].id)+"' value='detail' /><span>"+(result[1].title)+'( '+(result[1].reportstyle)+' )'+"</span></label></p>");
			  }
			  htmlContent.push("</div></div>");
			  htmlContent=htmlContent.join('');
			  $.dialog({
					title:'借阅报表',
					lock:true,
					content:htmlContent,
					ok:printAccountBorrow,
					cancel:true,
					okVal:'确定',
					cancelVal:'取消'
			 });
		  });
	  }
}
//打印借阅单   201307
function printAccountBorrow(){
	  var borrowLV = $('#borrowLevel').find("input[name='RE']:checked");
	  var borrowId=borrowLV.attr('id');
	  var borrowType=borrowLV.attr('title');
	  var reportTitle=borrowLV.next().html();
		if(borrowLV.length==0){
			$.dialog.notice({title:'操作提示',icon:'warning',content:'请选择报表格式！',time:3});
			return false;
		}else{
			var ids=[];
			$("#flexme1").find("input[name='id']:checked").each(function(){
				ids.push($(this).val());
			});
			ids=ids.join(',');
			$.dialog.notice({icon:'success',content: '正在努力打印中,稍后点击“消息提示”进行下载',time:5});
			var url=$.appClient.generateUrl({ESAccountingArchive:'printAccountBorrowPage'},'x');
			$.post(url,{reportTitle:reportTitle,borrowId:borrowId,borrowType:borrowType,ids:ids},function(data){
				
			});
		}
}
//第四次修改--提交审批之前需要做的操作    增加
function approveBefore(){
	//准备可用的参数
	  var borrowPerObj=$("input[name='reader']");
	  var Reader=borrowPerObj.val();
	  //判断是否添加借阅人
	  if(Reader==''){
		  borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
		  $.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
		  return false;
	  }else{
		  var baseBorrow='';
		  var idReader=$("input[name='readerid']").val();
		  if(IreaderD==0){
			  idreader='';
		  }
		  var Reader=$("input[name='reader']").val();
		  var Dept=$("input[name='dept']").val();
		  var Telephone=$("input[name='tel']").val();
		  var Email=$("input[name='email']").val();
		  var Usepurpose=$("select[name='usepurpose']").val();
		  var Validdate=$("input[name='validdate']").val();
		  var Register=$("input[name='register']").val();
		  var Registdate=$("input[name='registdate']").val();
		  var State=$("input[name='status']").val();
		  var Description=$("textarea[name='description']").val();
		  baseBorrow=Reader+'|'+Dept+'|'+Telephone+'|'+Email+'|'+Usepurpose+'|'+Validdate+'|'+Register+'|'+Registdate+'|'+State+'|'+Description;
		  var checkboxes=$("#borrowDetails").find("input[name='id3']");
		  var path=[];
		  var typesour='';
		  if(checkboxes.length>0){
		  		var typesr=[];
		  		var voidTypes='';
   		     	 checkboxes.each(function(){
   		     	 	var path=$(this).val();
					var bothPath=path.split('|');
					typesr.push(bothPath[2]);
   		     	 });
   		     	 voidTypes=typesr.join('');
			  	checkboxes.each(function(){
				   	 var ACode="";
				   	 var title="";
					 var mark= "";
			    	 var type = "";
			    	 var trObj=$(this).closest('tr');
			    	 var checkedpath = $(this).val();
			    	 var checkpath=checkedpath.split('|');
					     checkedpath=checkpath[0];
					 if(checkpath[2]!=''){
					 	 typesour=checkpath[2];
					 }
					 if(checkedpath!=''){
			    		 type=trObj.find("input[name='"+checkedpath+"']:checked").val();
			    	 }else{
			    	 	 var ID=trObj.find("input[name='id3']").attr('id');
			    	 	 if(ID =='' || ID==undefined){
			    	 	 	var nums=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
			    		 	type=trObj.find("input[name='"+nums+"']:checked").val();
			    	 	 }else{
					    	type=trObj.find("input[name='"+ID+"']:checked").val();
			    	 	 }
			    	 }
			    	  if(voidTypes=='' || typesr[0]=='accounting'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['RecordID']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Summary']);
   		     	 	 }else if(typesr[0]=='document'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 }else if(typesr[0]=='contract'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['RecordID']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 }/*else if(typesr[0]=='technical'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 }else if(typesr[0]=='auditfiles'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 }*/
			         mark=trObj.find("input[name='mark']").val();
			    	 path.push(ACode+'|'+title+'|'+type+'|'+mark+'|'+checkedpath);
				});
		  }
		  paths=path.join(',');
		  if(State!='未提交' && State!='已退回'){
			  $.dialog.notice({content:'提交审批中或借阅中,不允许再次提交！',icon:'warning',time:3});
			  return false;
		  }else{
			  var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
			  var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
			  var reg=/^[1-9]\d*$/;
			  if(!reg.test($("input[name='validdate']").val())){
				  $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
				  $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
				  return false;
			  }else if($("input[name='validdate']").val()>30){
				  $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
				  $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
				  return false;
			  }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
				  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
				  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
				  return false;
			  }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
				  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
				  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
				  return false;
			  }
		  }
	  }
	  //添加登记人的审批意见页面的渲染   增加
	  var opinionURL=$.appClient.generateUrl({ESArchiveLending:'approveBefore'},'x');
	  $.ajax({
		  type:'post',
		  url:opinionURL,
		  data:"baseBorrow=" + baseBorrow + "&paths=" + paths+ "&typesour=" + typesour,
		  success:function(html){
			  $.dialog({
				    title:'添加登记人审批意见',
		  			padding:'0px',
		  			fixed:true,
		  			resize:false,
		  			content:html,
		  			cancelVal:'取消',
		  			cancel:true,
		  			okVal:'确定',
		  			ok:function(){
		  				var approveOpinion=$("textarea[name='approveOpinion']").val();
		  				if(approveOpinion==''){
		  					$.dialog.notice({content:'请输入审批意见！',icon:'warning',time:3});
							return false;
		  				}
		  			  //选择审批人界面的渲染及提交审批的处理  增加
		  			  $.ajax({
		  				  url:$.appClient.generateUrl({ESArchiveLending:'approveToUser'},'x'),
		  				  success:function(userHtml){
		  					  $.dialog({
		  						    title:'选择审批人',
		  				  			padding:'0px',
		  				  			fixed:true,
		  				  			resize:false,
		  				  			content:userHtml,
		  				  			cancelVal:'取消',
		  				  			cancel:true,
		  				  			okVal:'确定',
		  				  			ok:function(){
		  				  				//选择审批人界面参数的处理start
		  				  				var perObj=$("#perList").find("input:checked");
		  				  				if(perObj.length==0){
			  				  				$.dialog.notice({content:'请选择审批人！',icon:'warning',time:3});
			  							    return false;
		  				  				}
		  				  				var perId = $("#perList").find("input:checked").attr('id');
		  								var listId=perId.split('|');
		  								var opinionId=listId[0];
		  								//区分来自于会计借阅管理和借阅管理
		  								var distinguish='true';
		  								//区分来自于会计借阅管理和借阅管理
		  								var url=$.appClient.generateUrl({ESArchiveLending:'submitApprove'},'x');
										$.post(url,{distinguish:distinguish,opinionId:opinionId,approveOpinion:approveOpinion,idReader:idReader,formId:idm,paths:paths,baseBorrow:baseBorrow,archiveType:typesour},function(result){
											if(result){
  												//提交成功，关闭所有对话框
  					  				  			var dialogList = $.dialog.list;
  						  				  		for (var i in dialogList) {
  						  				  			dialogList[i].close();
  						  				  		};												
												$.dialog.notice({width: 150,content: '提交成功',icon: 'success',time: 3});
												$('#flexme1').flexReload();
											}else{
												$.dialog.notice({width: 150,content: '提交失败',icon: 'error',time: 3});
											}
										});
		  					    	},
		  							cache:false
		  					  });
		  				  },
		  				  cache:false
		  			  });
		  			  return false;
		  			},
		  			cache:false
			  });
		  },
		  cache:false
	  });
	  return false;
}
	//双击行弹出编辑面板
	var idm='';
	function modify(tr,g,p)
	{
		idm=$("[name='id']",tr).val();
		show_items(idm);
	}
	//查看借阅管理表单的数据信息
	var formReaderId="";
	var arType="";
	function show_items(id)
	{
		idm=id;
		var trObj=$("#"+idm).closest('tr');
		var placeCode=$("#flexme1").flexGetColumnValue(trObj,['Code']);
		var url=$.appClient.generateUrl({ESAccountingArchive:'eidtAccountBorrow',idm:idm},'x');
		$.ajax({
		    url:url,
		    success:function(data){
		    	$.dialog({
			    	title:'借阅单编号：'+placeCode,
			    	width:'45%',
			    	height:350,
					padding:'5px 10px',
					fixed:true,
					resize:true,
					button:[{
						name:'直接借阅',
						focus: true
						},
						{
						name:'提交审批',
						callback:approveBefore
					}],
					okVal:'直接借阅',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
			    	content:data,
			    	ok:function()
			    	{
			    		var form=$('#form_update');
						var thisDialog=this;
						var data=form.serialize();
						var checkboxes=$("#borrowDetails").find("input[name='id3']");
						var checkLength=checkboxes.length;
						var borrowPerObj=form.find("input[name='reader']");
		    		    var borrowPerson=borrowPerObj.val();
		    		    //判断是否添加借阅人
		    		    if(borrowPerson==''){
		    		    	borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
		    		    	$.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
		    		     	return false;
		    		    }
		    		    //判断是否添加借阅明细的数据
		    		    if(checkLength==0){
		    		    	var stat=$("input[id='status']").val();
							if(stat!='未提交' && stat!='已退回'){
								$.dialog.notice({content:'提交审批中或借阅中,不允许更改！',icon:'warning',time:3});
								return false;
							}else{
								var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
								var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
								var reg=/^[1-9]\d*$/;
								if(!reg.test($("input[name='validdate']").val())){
									$("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
								    $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
								    return false;
								}else if($("input[name='validdate']").val()>30){
									$("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
									$.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
									return false;
								}else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
									  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
									  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
									  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
									  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else{
									var url=$.appClient.generateUrl({ESAccountingArchive:'saveAccountModify',idm:idm},'x');
									$.post(url,{data:data,IreaderD:IreaderD},function(result){
										if(result){
											thisDialog.close();
											$.dialog.notice({width: 150,content: '修改成功',icon: 'success',time: 3});
											$('#flexme1').flexReload();
										}else{
											$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
										}
									});
								}
							}
		    		     }else{
			    		     var typesr=[];
			    		     var voidTypes='';
		    		     	 checkboxes.each(function(){
		    		     	 	var path=$(this).val();
								var bothPath=path.split('|');
								typesr.push(bothPath[2]);
		    		     	 });
		    		     	 voidTypes=typesr.join('');
	    		    	 	var editpath=[];
			    			checkboxes.each(function(){
			    				 var Aode="";
			    				 var ttle="";
			    				 var st="";
			    			   	 var ID="";
			    				 var editmark= "";
			    				 var arctype="";
			    		    	 var edittype = "";
			    		    	 var trObj=$(this).closest('tr');
			    		    	 var checkedpath = $(this).val();
			    		    	 var checkpath=checkedpath.split('|');
				    		    	 checkedpath=checkpath[0];
				    		     if(checkpath[2]!=''){
				    		     	arctype=checkpath[2];
				    		     }
			    		    	 if(checkedpath!=''){
			    		    	 	 ID=trObj.find("input[name='id3']").attr('id');
			    		    	 	 edittype=trObj.find("input[name='"+checkedpath+"']:checked").val();
			    		    	 }else{
			    		    	 	 ID=trObj.find("input[name='id3']").attr('id');
			    		    	 	 if(ID=='' || ID==undefined){
				    		    		var nums=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
			    		    		 	edittype=trObj.find("input[name='"+nums+"']:checked").val();
			    		    		 	checkedpath='';
				    		    	 }else{
				    		    	 	 edittype=trObj.find("input[name='"+ID+"']:checked").val();
				    		    	 }
			    		    	 }
			    		    	 if(voidTypes=='' || typesr[0]=='accounting'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['RecordID']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Summary']);
		    		     	 	 }else if(typesr[0]=='document'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 }else if(typesr[0]=='contract'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['RecordID']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 }/*else if(typesr[0]=='technical'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 }else if(typesr[0]=='auditfiles'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 }*/
			    		    	 st=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			    		    	 editmark=trObj.find("input[name='mark']").val();
			    		    	 editpath.push(ID+'|'+edittype+'|'+editmark+'|'+Aode+'|'+ttle+'|'+checkedpath+'|'+st+'|'+arctype);
			    			});
			    			paths=editpath.join(',');
							var stat=$("input[id='status']").val();
							if(stat!='未提交' && stat!='已退回' && stat!='完成'){
								$.dialog.notice({content:'提交审批中或借阅中,不允许更改！',icon:'warning',time:3});
								return false;
							}else{
								var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
								var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
								var reg=/^[1-9]\d*$/;
								if(!reg.test($("input[name='validdate']").val())){
									$("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
								    $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
								    return false;
								}else if($("input[name='validdate']").val()>30){
									$("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
									$.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
									return false;
								}else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
									  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
									  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
									  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
									  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else{
									var url=$.appClient.generateUrl({ESAccountingArchive:'saveAccountModify',idm:idm},'x');
									$.post(url,{data:data,paths:paths,IreaderD:IreaderD},function(result){
										if(result){
											thisDialog.close();
											$.dialog.notice({width: 150,content: '修改成功',icon: 'success',time: 3});
											$('#flexme1').flexReload();
										}else{
											$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
										}
									});
								}
							}
		    		     }
					 },
					 init:initBorrowDetails
			    });
		    	//初始化显示借阅明细页面时,根据表单的状态控制明细中的按钮
		    	function initBorrowDetails(){
					var ACodeMeta='';
					var titleMeta='';
					if(arType=='' || arType=='accounting'){
						ACodeMeta='RecordID';
						titleMeta='Summary';
						arType='accounting';
					}else if(arType=='document'){
						ACodeMeta='ArchivalCode';
						titleMeta='Title';
					}else if(arType=='contract'){
						ACodeMeta='RecordID';
						titleMeta='Title';
					}/*else if(arType=='technical'){
						ACodeMeta='RecordID';
						titleMeta='Title';
					}else if(arType=='auditfiles'){
						ACodeMeta='RecordID';
						titleMeta='Title';
					}*/
					$.post($.appClient.generateUrl({ESAccountingArchive:'getTagByMetadata'},'x'),{arType:arType,ACodeMeta:ACodeMeta,titleMeta:titleMeta},function(result){
						result=jQuery.parseJSON(result);
						if(result){
							for(var i=0;i<result.length;i++){
								if(result[i].esidentifier==ACodeMeta){
									var ACodeName=result[i].tagChineseName;
								}else if(result[i].esidentifier==titleMeta){
									var titleName=result[i].tagChineseName;
								}
							}
							var showcols=[
			        				{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
			        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
			        				{display: ACodeName, name : 'c3', width : 60, align: 'left',metadata:ACodeMeta},
			        				{display: titleName, name: 'c4',width : 80,align: 'left',metadata:titleMeta},
			        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
			        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
			        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
			        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'}
			        			];
			        		var allButtons=[
		    		        		{name: '选择系统档案', bclass: 'add',onpress:addEditDetails},
		    		        		{name: '手工录入', bclass: 'add',onpress:addLineDetail},
		    		        		{name: '删除', bclass: 'delete',onpress:delEditDetails},
		    		        		{name: '借阅', bclass: 'tranlist',onpress:changeAccountStatus},
		    		        		{name: '借出', bclass: 'export',onpress:changeAccountStatus},
		    		        		{name: '归还', bclass: 'back',onpress:changeAccountStatus}
		    		        	];
		    		        var status=$("input[id='status']").val();
				    		if(status=='未提交' || status=='已退回' || status=='完成'){
				    			$(".bottom").html('<table id="borrowDetails"></table>');
				    			$("#borrowDetails").flexigrid({
				    				url:$.appClient.generateUrl({ESAccountingArchive:'showDetails',idm:idm},'x'),
				    				dataType: 'json',
				    				editable: true,
				    				colModel: showcols,
				    				buttons: allButtons,
				    				usepager: true,
				    				title: '借阅明细列表',
				    				useRp: true,
				    				rp: 20,
				    				nomsg:"没有数据",
				    				showTableToggleBtn: false,
				    				pagetext: '第',
				    				outof: '页 /共',
				    				width: 580,
				    				height: 190,
				    				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
				    			});
				    			$("#borrowDetails").flexReload();
				    		}else{
				    			$(".bottom").html('<table id="borrowDetails"></table>');
				    			$("#borrowDetails").flexigrid({
				    				url:$.appClient.generateUrl({ESAccountingArchive:'showDetails',idm:idm},'x'),
				    				dataType: 'json',
				    				editable: true,
				    				colModel: showcols,
				    				usepager: true,
				    				title: '借阅明细列表',
				    				useRp: true,
				    				rp: 20,
				    				nomsg:"没有数据",
				    				showTableToggleBtn: false,
				    				pagetext: '第',
				    				outof: '页 /共',
				    				width: 580,
				    				height: 220,
				    				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
				    			});
				    			$("#borrowDetails").flexReload();
				    		}
						}
					});
		    	}
		    },
			cache:false
		});
	}
  //筛选数据后还原数据
  var uri=$.appClient.generateUrl({ESAccountingArchive:'account_json'});
  function backAccountIndex(){
	  $('#flexme1').flexOptions({url:uri}).flexReload();
  }
  //添加借阅管理表单数据
  var IreaderD=0;
  function addAccountBorrowForm()
  {
  	  idm='';
  	  archiveType='';
	  var url=$.appClient.generateUrl({ESAccountingArchive:'add'},'x');
	  $.ajax({
		  url:url,
		  success:function(data){
			$.dialog({
				title:'添加借阅管理表单',
				width:'45%',
				height:350,
				padding:'5px 10px',
				fixed:true,
				resize:true,
				button:[{
					name:'直接借阅',
					focus: true
					},
					{
					name:'提交审批',
					callback:approveBefore
				}],
				okVal:'直接借阅',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
	    		content:data,
	    		ok:function(){
	    			var form=$("#form_add");
	    			var thisDialog=this;
	    			var data=form.serialize();
	    			var checkboxes=$("#borrowDetails").find("input[name='id3']");
	    		    var path=[];
	    		    var checkLength=checkboxes.length;
	    		    var borrowPerObj=form.find("input[name='reader']");
	    		    var borrowPerson=borrowPerObj.val();
	    		    //判断是否添加借阅人
	    		    if(borrowPerson==''){
	    		    	borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
	    		    	$.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
	    		     	return false;
	    		    }
	    		     //判断是否含有借阅明细的数据
	    		     if(checkLength==0){
	    		    	 var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
	    		    	 var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
	    		     	 var reg=/^[1-9]\d*$/;
						 if(!reg.test($("input[name='validdate']").val())){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
							 $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
							 return false;
						 }else if($("input[name='validdate']").val()>30){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
							 $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
							 return false;
						 }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
							  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
							  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						 }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
							  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
							  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						 }else{
							 var url=$.appClient.generateUrl({ESAccountingArchive:'addAccountForm'},'x');
							 $.post(url,{data:data,IreaderD:IreaderD},function(result){
								if(result){
									thisDialog.close();
									$.dialog.notice({width: 150,content: '添加成功',icon: 'success',time: 3});
									$('#flexme1').flexReload();
								}else{
									$.dialog.notice({width: 150,content: '添加失败',icon: 'error',time: 3});
								}
							 });
						 }
	    		     }else{
	    		     	 var typesr=[];
	    		     	 var voidTypes='';
	    		     	 checkboxes.each(function(){
	    		     	 	var path=$(this).val();
							var bothPath=path.split('|');
							typesr.push(bothPath[2]);
	    		     	 });
	    		     	 voidTypes=typesr.join('');
	    		    	 checkboxes.each(function(){
		    		    	 var ACode= "";
		 	    			 var title= "";
		 	    			 var markl= "";
		    		    	 var type = "";
		    		    	 var arctype="";
		    		    	 var trObj=$(this).closest('tr');
		    		    	 var checkedpath = $(this).val();
		    		    	 chosecheckedpath=checkedpath.split('|');
			    		   	 checkedpath=chosecheckedpath[0];
			    		   	 if(chosecheckedpath[2]!=''){
			    		   	 	arctype=chosecheckedpath[2];
			    		   	 }
		    		    	 if(checkedpath==''){
		    		    		 var nums=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
		    		    		 type=trObj.find("input[name='"+nums+"']:checked").val();
		    		    	 }else{
		    		    		 type=trObj.find("input[name='"+checkedpath+"']:checked").val();
		    		    	 }
		    		    	 if(voidTypes=='' || typesr[0]=='accounting'){
	    		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['RecordID']);
		    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Summary']);
	    		     	 	 }else if(typesr[0]=='document'){
	    		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
		    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
	    		     	 	 }else if(typesr[0]=='contract'){
	    		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['RecordID']);
		    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
	    		     	 	 }/*else if(typesr[0]=='technical'){
	    		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
		    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
	    		     	 	 }else if(typesr[0]=='auditfiles'){
	    		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
		    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
	    		     	 	 }*/
		    		         markl=trObj.find("input[name='mark']").val();
		    		         path.push(ACode+'|'+title+'|'+markl+'|'+type+'|'+checkedpath+'|'+arctype);
		    		     });
		    		     paths=path.join(',');
		    		     var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
		    		     var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
		    		     var reg=/^[1-9]\d*$/;
						 if(!reg.test($("input[name='validdate']").val())){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
							 $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
							 return false;
						 }else if($("input[name='validdate']").val()>30){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
							 $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
							 return false;
						 }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
							  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
							  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						  }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
							  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
							  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						  }else{
							 var url=$.appClient.generateUrl({ESAccountingArchive:'addAccountForm'},'x');
							 $.post(url,{data:data,paths:paths,IreaderD:IreaderD},function(result){
								if(result){
									thisDialog.close();
									$.dialog.notice({width: 150,content: '添加成功',icon: 'success',time: 3});
									$('#flexme1').flexReload();
								}else{
									$.dialog.notice({width: 150,content: '添加失败',icon: 'error',time: 3});
								}
							 });
						 }
	    		     }
	    		},
	    		
	    		cache:false
			});
		  },
		  cache:false
	  });
  }
  //表单管理的全选按钮
  $("input[name='ids']").die().live('click',function(){
	  $("input[name='id']").attr('checked',$(this).is(':checked'));
  });
  //删除会计档案借阅表单  201307
  function delAccountBorrowForm(){
	  var id='';
	  var checkboxesObj=$("input[name='id']:checked");
	  if(checkboxesObj.length=='0'||checkboxesObj.length=='undefined'){
		  $.dialog.notice({icon:'warning',content:'请选择要删除的数据！',time:3});
		  return false;
	  }else{
		  var siug=0;
		  checkboxesObj.each(function(){
			  var trObj=$(this).closest("tr");
			  var STATUS=$("#flexme1").flexGetColumnValue(trObj,['Status']);
			  if(STATUS!='未提交'){
				  siug=1;
			  }else{
				  id+=$(this).val()+',';
			  }
		  });
	  }
	  if(siug==0){
		  id=id.substr(0,id.length-1);
		  if(id==0||id==''||id=='undefined'){
			 return false;
		  }
		  $.dialog({
			  content:'确认要删除吗?',
			  ok:true,
			  okVal:'确认',
			  cancel:true,
			  cancelVal:'取消',
			  ok:function(){
				  var url=$.appClient.generateUrl({ESAccountingArchive:'delAccountBorrowList'},'x');
				  $.get(url,{id:id},function(data){
					  if(data==1){
						  $("input[name='ids']").attr('checked',false);
						  $.dialog.notice({width:150,height:120,icon:'succeed',content:'数据删除成功！',time:3,title:'3秒后自动关闭！'});
						  $("#flexme1").flexOptions({newp:1}).flexReload();
					  }
				  });
			  },
			  cache:false
		  });
	  }else if(siug==1){
		 $.dialog.notice({title:'操作提示',content:'您选择的数据包含提交审批中或借阅中的数据，不允许删除，请重新选择！',icon:'warning',time:3});
    	 $("input[name='ids']").attr('checked',false);
    	 $("input[name='id']").attr('checked',false);
		 return false;
	  }
	 
  }
  //综合筛选查询（添加行,删除行）
  $('.newfilter').die().live('click',function (){
	  $(this).parent().clone().insertAfter($(this).parent());
  });
  $('.delfilter').die().live('click',function (){
	  $('#contents p').length > 1 ? $(this).parent().remove() : '';
  });
  //筛选借阅管理表单数据
  function filterAccountBorrowForm(){
	  var url=$.appClient.generateUrl({ESArchiveLending:'filter'},'x');
	  $.ajax({
		  url:url,
		  success:function(data){
			 $.dialog({
				 title:'筛选面板',
				 fixed:true,
				 resize:false,
				 opacity:0.1,
				 ok:true,
				 okVal:'确定',
				 cancel:true,
				 cancelVal:'取消',
				 content:data,
				 ok:function(){
					var exg = /(\|)$/;
			    	var sql_string = '';
			    	$('#contents p').each(function (i){
			    		var filedvalue = $('.filedvalue').eq(i).val();
			    		if(filedvalue){
			    			var filedname	=	$('.filedname').eq(i).val();
			    			var comparison	=	$('.comparison').eq(i).val();
			    			var relationship=	$('.relationship').eq(i).val();
			    			if(relationship=="AND"){
			    				relationship='true';
			    			}else{
			    				relationship='false';
			    			}
			    			sql_string += filedname+","+comparison+","+filedvalue+","+relationship+"|";
			    		}
			    	});
			    	var str = sql_string.replace(exg,"");
			    	if(str==""){
			    		$.dialog.notice({icon:'warning', content:"查询条件不能为空！", time:3});
			    		return;
			    	}
			    	var url = $.appClient.generateUrl({ESAccountingArchive:'filterAccount_sql',sql:encodeURI(str)},'x');
			    	$('#flexme1').flexOptions({newp: 1,url:url}).flexReload();
				 },
				 cache:false
			 }); 
		  },
		  cache:false
	  });
  }
  
//查看打印报表，倪阳添加
  var showAccountingReport = function() {
    	var html = [];
    	html.push('<table id="infomation"></table><script type="text/javascript">');
    	html.push('$("#infomation").flexigrid({');
    	html.push("	url: $.appClient.generateUrl({ESArchiveLending:'getInfomation'},'x'),dataType: 'json',");
    	html.push('colModel : [');
    	html.push("{display: '序号', name : 'id', width : 40, align: 'center'}, {display: '打印状态', name : 'printStatus', width : 80,  align: 'center'},{display: '操作人', name : 'userName', width : 60,  align: 'center'},{display: '文件名称', name : 'infoName', width : 180,  align: 'center'},{display: '下载状态', name : 'downloadStatus', width : 60,  align: 'center'},{display: '下载地址', name : 'downurl', width : 160,  align: 'center'}],");
    	html.push('title: "打印借阅报表",');
    	html.push('usepager: true,');
    	html.push('useRp: true,');
    	html.push('width: 672,height:200});');
    	html.push('var openUrl = function(obj){');
    	html.push("var path_data = $(obj).attr('path_data');");
    	html.push("var path_id = $(obj).attr('path_id');");
    	html.push("$.get($.appClient.generateUrl({ESArchiveLending:'updateInfomation',id:path_id},'x'),function(data){});");
    	html.push("obj.href = path_data;");
    	html.push("$('#infomation').flexReload();");
    	html.push("return true;}");
    	html.push('</script>');
    	var html = html.join('');
    	$.dialog({
        	title:'下载借阅报表',
    	    height: '40%',
    	    width: '50%',
    	    padding: '0 0',
    	   	fixed:true,
    	    resize: false,
        	content:html,
        	opacity : 0.1,
        	okVal:'保存',
    	    ok:false,
    	    cancelVal: '关闭',
    	    cancel: true
        });	
    }	