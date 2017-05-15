var systemDataGridPanelId,systemDataloadDataUrl,systemDatagetParamsUrl,addOpinionUrl,delOpinionUrl,setDataStatusUrl,currWfId,currDelAppendixUrl,currHavingRole;

//longjunhao 20130528 修改提示框样式

			
function createPagingBar(gridPanelId){
new Ext.form.ComboBox({	
	id:gridPanelId+'_combo',	
	triggerAction:'all',	  //单击触发按钮显示全部数据
	store:new Ext.data.SimpleStore({	
		fields:['value','display'],	 //注意：这里定义的键值必须与下面的属性(displayField:valueField)对应
		data:[[10,10], [20,20],[50,50],[100,100]]}),	//数据源
	displayField:'display',	  //定义显示的字段		
	width:45,	
	pid:this.id,	
	mode:'local',	  //本地模式  远程:remote						  
	typeAhead:true,	  //允许自动选择匹配的剩余部分文本
	value:'20', 	//默认选择值
	valueField:'value',	  //定义字段值
	readOnly:'true',
	forceSelection:true,	//要求输入的值必须在列表中存在
	listeners:{select :function (){
		Ext.getCmp(gridPanelId+'_gridbbar').pageSize=getSystemDataComboValue_Model(gridPanelId);
		Ext.getCmp(gridPanelId).getStore().reload({params : {start : 0,limit : getSystemDataComboValue_Model(gridPanelId)}});}}	
	});	
}
			
function getSystemDataComboValue_Model(griapanelid){
	var comboValue=Ext.getCmp(griapanelid+'_combo').value;
	return comboValue==10?10:comboValue==20?20:comboValue==50?50:100;
} 


//创建系统数据附件列表
createSystemDataGridPanel = function(wfID,id,title,loadDataUrl,getParamsUrl,addUrl,delUrl,setUrl,delAppendixUrl,havingRole){
    systemDataGridPanelId = id ;
    systemDataloadDataUrl = loadDataUrl ;
    systemDatagetParamsUrl = getParamsUrl ;
    setDataStatusUrl = setUrl ;
    delOpinionUrl = delUrl ;
    currWfId = wfID ;
    addOpinionUrl = addUrl ;
    currHavingRole = havingRole ;
    currDelAppendixUrl = delAppendixUrl ;
    
    createPagingBar(id);
    
	new Ext.grid.GridPanel({id: id,
        //自适应调节	
		title: title,
		store: new Ext.data.Store(),
		iconCls: 'icon-grid',
		autoHeight : 'true',
		collapsible :true ,
		cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer()]),
		sm : new Ext.grid.CheckboxSelectionModel(),//xiaoxiong 20120921 添加复选框
		viewConfig: {
			forceFit:true,
			enableRowBody:true, 
			getRowClass : function(record, rowIndex, p, store){
				p.body = '<p>'+record.data.opinion+'</p>';		
			    return 'x-grid3-row-expanded';
			}
		},
		bbar:new Ext.PagingToolbar({
			id : id+'_gridbbar',
			pageSize : 20,
			store : new Ext.data.Store(),
			displayInfo : true,
			items : [Ext.getCmp(id+'_combo')]
		})
	}) ;  
	//加载附件数据
	createLoadDataAjax();
}
//加载附件数据
createLoadDataAjax = function(){
	Ext.Ajax.request({
		url: systemDatagetParamsUrl,		
		callback:loadSystemDataToGrid 
	});
}

//加载数据到附件数据列表
loadSystemDataToGrid = function(options, success, response) {
	if (success) {
		var json = Ext.util.JSON.decode(response.responseText);
		var newCm = new Ext.grid.ColumnModel(Ext.util.JSON.decode('['+ 'new Ext.grid.RowNumberer()'+','+  json.commentColumnModel+']'));
		newCommentCoM = newCm;
		newCommentRecord = json.commentRecord;		
		var selectPaths = '';
		if(Ext.getCmp('myFormModelsdataList'))selectPaths = Ext.getCmp('myFormModelsdataList').getValue();
		var newDs = new Ext.data.Store({ 
			baseParams: { 
			    selectPaths : selectPaths ,
		    	wfID : currWfId,
		    	havingRole : currHavingRole
	    	},
			proxy:new Ext.data.HttpProxy({
		    	url:systemDataloadDataUrl
			}),
			reader : new Ext.data.JsonReader({
		   		totalProperty : 'commentTotalSize',
		    	root : 'commentDataList'  
			}, Ext.util.JSON.decode(newCommentRecord))
			,listeners : { 
				load : {
			    	 fn : function(store, records, options) {
			         	if(store.getCount()>0){ 
							if(Ext.getCmp('file_gridPanel').collapsed){
							 	Ext.getCmp('file_gridPanel').toggleCollapse(false);
							}
							if(Ext.getCmp(systemDataGridPanelId).collapsed){
								Ext.getCmp(systemDataGridPanelId).toggleCollapse(false);
							}
							if(Ext.getCmp('approvalTBarId')){//xiaoxiong 20120921 有数据时 显示按钮
								Ext.getCmp('approvalTBarId').setVisible(true) ;
							}
			  			} else {
							//xiaoxiong 20111213 当没有数据附件时，将操作按钮组件掩藏
							if(Ext.getCmp('approvalTBarId')){
								Ext.getCmp('approvalTBarId').setVisible(false) ;
							}
			  			} 
			  	 	}
			    }
		 	} 
		});
		var comment_grid = Ext.getCmp(systemDataGridPanelId);
		newCm.defaultSortable = true;
		comment_grid.reconfigure(newDs, newCm);
		//加载数据到bbar
		Ext.getCmp(systemDataGridPanelId+'_gridbbar').bind(newDs);
		newDs.load({
		params : {
			start : 0,
			//limit : 20 
			limit :getSystemDataComboValue_Model(systemDataGridPanelId)
			}
		}); 
	}
}

function showDestoryPkg(path){
	Ext.Ajax.request({
		url:'formBuilderManager.html?method=lookInPkg_before',
		params:{pkgPath:path,wfId:currWfId},				
		callback:function(options, success, response){
			var json = Ext.util.JSON.decode(response.responseText);
			var tempRight = json.tempRight;
			new Ext.Window({  
		    	id: 'myFormModelslookInPkgWindow' , 
		   		layout      : 'fit', 
		   		modal		:true,
		   		width       : 800, 
		   		height      : 600,
		   		autoScroll  : true,
		   		autoLoad:{url: 'formBuilderManager.html?method=lookInPkg&winId=myFormModelslookInPkgWindow&searchType=workFlow&pkgPath='+path+'&tempRight='+tempRight,nocache:true,scripts:true}//跳转
			}).show();  
		}
	});
}

function renderIsDestory(value, p, r){
	var str = '<input type="checkbox" value="{0}" ';
	var str2 = 'onclick=setDestorySystemDataRight(this.checked,{1}) />';
	var str3 = '<a href=# onclick=addAppendixOpinion({2})>回复</a>' ;
	//jiangyuntao 20120320 edit 增加销毁流程可以删除数据附件。
	var delPath = r.data['destoryPath'];
	if(''==delPath)delPath = r.data['pkgPath'];
	if(r.data['isDestory'] == '1'){
		str = str + ' checked=true ';
	}
	if('false' == currHavingRole){
		str = str + ' disabled=true ';
		str = str + str2 ;
		if('' != currDelAppendixUrl){
			str =str + ' <img src="./images/delete.gif"  onclick=delDestorySystemDataAppendix("{2}","{3}") alt="删除附件" />';
			str = String.format(str,r.data['isDestory'],r.data['id'],delPath,r.data['id']) ;
		}else{
			str = String.format(str,r.data['isDestory'],r.data['id']) ;
		}
	}else{
		str = str + str2 + str3;
		str = String.format(str,r.data['isDestory'],r.data['id'],r.data['id']) ;
	}
	//if('' != delAppendixUrl){
	//	str =str + ' <img src=./images/delete.gif  />';
	//}
	return str;
}
/*	
function _renderOperate(value, p, r){ 
	return 'Reply';
}*/
function renderOpinion(value, p, r){ 
	return String.format('<img src=./images/online_member.gif align=top />&nbsp;&nbsp;<font color=#FF0000><b>{0}</b></font>',
		r.data['opinion']);
}

function deleteDestoryAppendixOpinion(opinionID){
	Ext.Ajax.request({
		url:delOpinionUrl,
		params:{opinionID:opinionID},				
		callback:function(options, success, response){
			if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
			if(psystemDataGridPanelId!=null&&Ext.getCmp(psystemDataGridPanelId))Ext.getCmp(psystemDataGridPanelId).getStore().reload();//xiaoxiong 20111206 删除恢复意见时自动删除审批界面中的意见
				 if (!success) {showMsg('删除失败!','2');}
				 //if (!success) {Ext.Msg.alert('提示','删除失败!');}
		}
	});
}

function delDestorySystemDataAppendix(pkgPath,appendixId){
	Ext.Ajax.request({
		url:currDelAppendixUrl,
		params:{appendixId:appendixId},				
		callback:function(options, success, response){
				dataListStr = Ext.getCmp(systemDataGridPanelId).getStore().baseParams.selectPaths;
		    	if(!dataListStr || '' == dataListStr){
		    		Ext.getCmp(systemDataGridPanelId).getStore().reload();
		    		return ;
		    	}
		    	var temp = dataListStr.split('|');
		    	var dataList = '' ;
		    	for(var i = 0 ; i < temp.length ; i++){
		    		if(temp[i] != pkgPath) dataList += temp[i]+'|';
		    	}
		    	if(dataList && dataList.length>0)dataList = dataList.substring(0,dataList.length-1);
		    	Ext.getCmp(systemDataGridPanelId).getStore().baseParams.selectPaths = dataList ;
		    	Ext.getCmp(systemDataGridPanelId).getStore().reload();
		    	Ext.getCmp('myFormModelsdataList').setValue(dataList);
//			Ext.getCmp(systemDataGridPanelId).getStore().reload();
				 if (!success) {showMsg('删除失败!','2');}
				 //if (!success) {Ext.Msg.alert('提示','删除失败!');}
		}
	});
}


function setDestorySystemDataRight(status,appendixId){
	Ext.Ajax.request({
		url:setDataStatusUrl,
		params:{status:status==true?'1':'0',appendixId:appendixId},				
		callback:function(options, success, response){
			if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
				 if (!success) {showMsg('设置失败!','2');}
				 //if (!success) {Ext.Msg.alert('提示','设置失败!');}
		}
	});
}

function addAppendixOpinion(appendixId){
	Ext.QuickTips.init(); 
	//xiaoxiong 20111018 修改回复意见后，表单中的组件就没有办法正常的输入值
	if(Ext.getCmp('add_opinion_Reply')){
		Ext.getCmp('opinionReply_from_window').form.reset();
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		Ext.getCmp('add_opinion_Reply').appendixIdForWindow = appendixId ;
		Ext.getCmp('add_opinion_Reply').show() ;
		return ;
	}
	//end
	new Ext.Window({ 
		id:'add_opinion_Reply',  
		title:'' ,  
		layout:'fit',   
		width:550,   
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		appendixIdForWindow : appendixId,
		resizable :false,
		height:200, 
		modal: true,
		items:  		
		//添加窗体form
		new Ext.form.FormPanel({ 
			id: 'opinionReply_from_window',
		 	method:'POST',
		    frame:true,
		 	title: '',
		 	width: 550,
		 	height: 200,  
		 	defaultType: 'textfield',
		    labelAlign:'left',
		 	items: [ 				
		 	//new Ext.form.HtmlEditor({
		 	//    id:'opinionReplyEditor',
		 	//    name:'newcontent',
		 	//    width:550,
		 	//    height:200,
		 	//    allowBlank:false,
		 	//    //jiangyuntao 20111012 edit 处理字体自动切换的BUG
		 	//    fontFamilies:['Tahoma'],
		 	//    defaultFont:'Tahoma',
		 	//    maxLength:512 ,
		 	//    hideLabel:true,
		 	//    listeners:{}
		    // })
		    new Ext.form.TextArea({
		 	    id:'opinionReplyEditor',
		 	    name:'newcontent',
		 	    width:524,
		 	    height:130,
		 	    allowBlank:false,
		 	    maxLength:512 ,
		 	    hideLabel:true
		     })
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.projectid")+"',name:'newprojectid',width:220,allowBlank:false,maxLength:128,clearCls:'stopFloat',hidden:true,hideLabel:true,value:selectedProjID },
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.parentid")+"',name:'newparentid',width:220,allowBlank:false,clearCls:'allowFloat',hidden:true,hideLabel:true,value:ParentId}  
		  	],		
			buttons: [{text: '保存',type:'submit'
				,handler: function(){
				  	if(!Ext.getCmp('opinionReply_from_window').form.isValid()){
					  return;
		 	  		}
		 	  		//jiangyuntao 20111024 edit 增加回复意见超长验证.
		 	  		//if(Ext.getCmp('opinionReplyEditor').getRawValue().length>512){
		 	  		//	Ext.Msg.alert('提示','文本超长,最大输入长度为512！');
		 	  		//	return ;
		 	  		//}
		 	  		
		 	  		
		       		Ext.getCmp('opinionReply_from_window').form.submit({ 
		         		url:addOpinionUrl,
		         		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		         		//params:{appendixID:appendixId},
		         		params:{appendixID:Ext.getCmp('add_opinion_Reply').appendixIdForWindow},
		         		success:function(){		 
		 		    		if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
		 		    		if(psystemDataGridPanelId!=null&&Ext.getCmp(psystemDataGridPanelId))Ext.getCmp(psystemDataGridPanelId).getStore().reload();//xiaoxiong 20111206 回复意见时自动刷新审批界面中的意见
		 		    		//xiaoxiong 20111018 将组件销毁去掉，将窗体隐藏
		 					//Ext.getCmp('opinionReplyEditor').destroy(); 
		 					//Ext.getCmp('add_opinion_Reply').destroy(); 
		 					Ext.getCmp('add_opinion_Reply').hide() ;
		 					//end
		 					//Ext.Msg.alert('提示','保存成功!');//xiaoxiong 20111206 将数据添加成功的提示去掉
		 				},
		         		failure:function(){
		 		    		if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload({params : {start : 0,limit : getSystemDataComboValue_Model(systemDataGridPanelId)}});
		 					showMsg('保存失败!','2');
		 					//Ext.Msg.alert('提示','保存失败!');
		
		 				}
		 			});  
		 		}
		 	 },{
		 	 		text: '复位',type:'reset',handler: function(){
		    		Ext.getCmp('opinionReply_from_window').form.reset();
		    	}
		   	}
		  ]    
		})
	}).show();  
//Ext.getCmp('opinionReplyEditor').relayCmd('inserthtml','');
//Ext.getCmp('opinionReplyEditor').updateToolbar();
}
/*********************************** xiaoxiong 20111205 下面是移交接收代码 START **********************************************/
var psystemDataGridPanelId ;
var psystemDataloadDataUrl ;
var psystemDatagetParamsUrl ;
var psetDataStatusUrl ;
var pdelOpinionUrl ;
var peditOpinionUrl ;
var pcurrWfId ;
var paddOpinionUrl ;
var pcurrHavingRole ;
var pcurrDelAppendixUrl ;
var parentAppendixPath = '' ;
var csystemDataGridPanelId ;
var saveChildSystemDataGridPanelId ;
var saveChildPathStr = "" ;
var movingType = "" ;
var isFormReceiveManager = 'false' ;
/***
 * xiaoxiong 20111205 移交接收在审批时 添加按钮方法
 */
addTbarToSystemDataGridPanel = function(wfID,id,movingButtonType,title,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole){
	if(movingButtonType == 'approval'){
		var tBar = new Ext.Toolbar({id:'approvalTBarId',items:[
			{text:'审批数据' , iconCls:'awaitExecute' ,handler:function(){showApprovalOrUpdateWin(wfID,id,movingButtonType,title,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole)}}
		]}); 
		Ext.getCmp(id).add(tBar) ;
	} else if(movingButtonType == 'update'){
		var tBar = new Ext.Toolbar({id:'approvalTBarId',items:[
			{text:'修改数据' , iconCls:'awaitExecute' ,handler:function(){showApprovalOrUpdateWin(wfID,id,movingButtonType,title,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole)}}
		]}); 
		Ext.getCmp(id).add(tBar) ;
	} else {
		var tBar = new Ext.Toolbar({id:'approvalTBarId',items:[
			{text:'删除' , iconCls:'remove' ,handler:function(){deleteTempTraansferDate(wfID,id,movingButtonType,title,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole)}}
		]}); 
		Ext.getCmp(id).add(tBar) ;
	}
	movingType = movingButtonType ;
	isFormReceiveManager = 'false' ;
}

/***
 * xiaoxiong 20120920 删除移交数据处理方法
 */
deleteTempTraansferDate = function(wfID,id,movingButtonType,formId,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole){
	var selectedRows = Ext.getCmp(id).getSelectionModel().getSelections();
	if(selectedRows.length == 0){showMsg('请先选择要删除的数据，再进行此操作！','3');return ;}
	//if(selectedRows.length == 0){Ext.Msg.alert('友情提示','请先选择要删除的数据，再进行此操作！');return ;}
	Ext.Msg.confirm('提示','您确定要删除所选数据吗？',function(noconddelete){
		if(noconddelete=='yes'){
			var selectPath = '' ;
			for(var i=0;i<selectedRows.length;i++){
				selectPath = selectPath+selectedRows[i].data.pkgPath+';';
			}
			selectPath = selectPath.substring(0,selectPath.length-1);
			var pkgPathStr_ajax = Ext.getCmp('myFormModelsdataList').getValue() ;
			var volumeCount = 0 ;
			var piecesCount = 0 ;
			var pageCount = 0 ;
			var fileCount = 0 ;
			Ext.Ajax.request({
				url:'formBuilderManager.html?content.method=deleteDataForMoving&businessName=receiveTransfer',
				params:{checkedpkg:selectPath , pkgPathStr:pkgPathStr_ajax , from:'transfer' , volumeCount:volumeCount , piecesCount:piecesCount , pageCount:pageCount , fileCount:fileCount},
				callback:function(options,success,response){
					if(success) {
						var json=Ext.util.JSON.decode(response.responseText);
						var dataListStr_response=json.pkgPathStr; 
						
						var nf = Ext.getCmp('formBuilder_formId'+formId).findByType('numberfield');
					 	for (var i = 0; i < nf.length; i++) {
							if(nf[i].fieldLabel == '总卷数'){nf[i].allowDecimals=false ; nf[i].setValue(json.volumeCount) ;} 
							else if(nf[i].fieldLabel == '总件数'){nf[i].allowDecimals=false ; nf[i].setValue(json.piecesCount) ;} 
							else if(nf[i].fieldLabel == '总页数'){nf[i].allowDecimals=false ; nf[i].setValue(json.pageCount) ;} 
							else if(nf[i].fieldLabel == '电子文件总个数'){nf[i].allowDecimals=false ; nf[i].setValue(json.fileCount) ;} 
					 	}
		 	
						Ext.getCmp('myFormModelsdataList').setValue(dataListStr_response);
						showMsg('删除数据成功！','1') ;
//						Ext.Msg.alert('友情提示','删除数据成功！') ;
						Ext.getCmp(id).getStore().baseParams.selectPaths = dataListStr_response ; ;
						Ext.getCmp(id).getStore().reload() ;
					}
				}
			});
		}else{
			return ;
		}
	});
}


//结构数据双击事件
addItemDataClickActionForApprovalOrUpdateGridPanel = function(id,childId){
	Ext.getCmp(id).on('rowdblclick',function(grid,rowIndex){
		if(Ext.getCmp(id).getSelectionModel().hasSelection()){
			if(Ext.getCmp(id).getSelectionModel().getSelected().data.view!=''){
				parentAppendixPath = Ext.getCmp(id).getSelectionModel().getSelected().data.path ;
				csystemDataGridPanelId = childId ;
				pcreateLoadDataAjax();
				if(id == saveChildSystemDataGridPanelId){
					saveChildPathStr = saveChildPathStr + "_" + parentAppendixPath ;
					Ext.getCmp(saveChildSystemDataGridPanelId+'_Toolbar').enable() ;
				} else {
					saveChildPathStr = parentAppendixPath ;
					Ext.getCmp(saveChildSystemDataGridPanelId+'_Toolbar').disable() ;
				}
			}
		}
	});
}

//xiaoxiong 20111208 显示下级数据
function showItemDataAction(path,isChild){
	parentAppendixPath = path ;
	csystemDataGridPanelId = saveChildSystemDataGridPanelId ;
	pcreateLoadDataAjax();
	if(isChild == '1'){
		saveChildPathStr = saveChildPathStr + "_" + path ;
		Ext.getCmp(saveChildSystemDataGridPanelId+'_Toolbar').enable() ;
	} else {
		saveChildPathStr = path ;
		Ext.getCmp(saveChildSystemDataGridPanelId+'_Toolbar').disable() ;
	}
	/**zhengfang 20130528 点击了‘查看下级数据的按钮之后，就将子结构数据grid展开’**/
	if(Ext.getCmp(saveChildSystemDataGridPanelId).collapsed)Ext.getCmp(saveChildSystemDataGridPanelId).expand();
	
}

/***
 * xiaoxiong 20111205 审批数据 弹出窗体
 */
showApprovalOrUpdateWin = function(wfID,id,movingButtonType,title,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole){
	//if(Ext.getCmp(id).getStore().getCount()==0){
	//	if(movingButtonType == 'approval'){
	//		Ext.Msg.alert('消息','没有需要审批的数据！');
	//	} else {
	//		Ext.Msg.alert('消息','没有需要修改的数据！');
	//	}
	//	return;
	//}
	parentAppendixPath = '' ;
	csystemDataGridPanelId = '' ;
	if(title == '移交接收数据修改'){
		/* niuhe 20130815 完善移交接收管理日志-修改接收库数据的日志模块名 */
		createApprovalOrUpdateGridPanel(wfID,id+'ApprovalOrUpdateGridPanel_parent','父结构数据',movingButtonType,'center',1014,610,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole, 'receiveTransfer') ;
		createChildApprovalOrUpdateGridPanel(id+'ApprovalOrUpdateGridPanel_child','子结构数据',movingButtonType, 'receiveTransfer') ;
	}else{
		createApprovalOrUpdateGridPanel(wfID,id+'ApprovalOrUpdateGridPanel_parent','父结构数据',movingButtonType,'center',1014,610,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole, '') ;
		createChildApprovalOrUpdateGridPanel(id+'ApprovalOrUpdateGridPanel_child','子结构数据',movingButtonType, '') ;
	}
	
	saveChildSystemDataGridPanelId = id+'ApprovalOrUpdateGridPanel_child' ;
	
	if(movingButtonType == 'approval'){
		//添加双击事件
		addItemDataClickActionForApprovalOrUpdateGridPanel(id+'ApprovalOrUpdateGridPanel_parent',id+'ApprovalOrUpdateGridPanel_child') ;
		//添加双击事件
		addItemDataClickActionForApprovalOrUpdateGridPanel(id+'ApprovalOrUpdateGridPanel_child',id+'ApprovalOrUpdateGridPanel_child') ;
	}
	
	new Ext.Window({ 
			id : id + 'ApprovalOrUpdateWin' ,
			title : title ,
			width : 1014,
			height : 650,
			layout : 'border',
			maximizable : false,
			//resizable : false,
			items : [Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent') , Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child')],
			modal : true,
			border : false,
			bodyBorder : false
	});
	
	//自适应 start
	Ext.getCmp(id + 'ApprovalOrUpdateWin').on('resize', function(pw,w,h) {
		if(Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').collapsed){
			Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight(pw.getInnerHeight() - 26);
		} else {
			Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight((pw.getInnerHeight())*0.5);
		}
		if(Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').collapsed){
			Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight(pw.getInnerHeight() - 26);
		} else {
			Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight((pw.getInnerHeight())*0.5);
		}
	});
    Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').addListener('collapse', function(fp) {
    	if(Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').collapsed){
	      	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()-26);
    	  	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').expand();
    	} else {
	      	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()-26);
    	}
    	Ext.getCmp(id + 'ApprovalOrUpdateWin').doLayout(); 
    }); 
    Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').addListener('expand', function(fp) {
    	if(Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').collapsed){
    		Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()-26);
    	} else {
    		Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()*0.5);
	      	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()*0.5);
    	}
	    Ext.getCmp(id + 'ApprovalOrUpdateWin').doLayout();
    });
    Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').addListener('collapse', function(fp) {
    	if(Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').collapsed){
		     Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()-26);
	    	 Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').expand(); 
    	} else {
		     Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight(Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight()-26);
    	}
	    Ext.getCmp(id + 'ApprovalOrUpdateWin').doLayout();
    }); 
    Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').addListener('expand', function(fp) {
    	if(Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').collapsed){
	      	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight((Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight())-26);
    	} else {
	      	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_parent').setHeight((Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight())*0.5);
	      	Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').setHeight((Ext.getCmp(id + 'ApprovalOrUpdateWin').getInnerHeight())*0.5);
    	}
	    Ext.getCmp(id + 'ApprovalOrUpdateWin').doLayout();
    });
    //自适应 end
	Ext.getCmp(id + 'ApprovalOrUpdateWin').show() ;
	/**zhengfang 20130528 初始化的时候将子结构数据grid隐藏起来**/
	    Ext.getCmp(id + 'ApprovalOrUpdateWin').addListener('show', function(fp) {
    		Ext.getCmp(id+'ApprovalOrUpdateGridPanel_child').collapse();
    	}); 
}
/***
 * xiaoxiong 20111205 审批窗体中的数据展现
 */
createApprovalOrUpdateGridPanel = function(wfID,id,title,movingButtonType,region,width,height,loadDataUrl,getParamsUrl,addUrl,delUrl,editUrl,setUrl,delAppendixUrl,havingRole, businessIdentifierParam){
    psystemDataGridPanelId = id ;
    psystemDataloadDataUrl = loadDataUrl ;
    psystemDatagetParamsUrl = getParamsUrl ;
    pcurrWfId = wfID ;
    pcurrHavingRole = havingRole ;
    pcurrDelAppendixUrl = delAppendixUrl ;
    psetDataStatusUrl = setUrl ;
    paddOpinionUrl = addUrl ;
    pdelOpinionUrl = delUrl ;
    peditOpinionUrl = editUrl
    
    createPagingBar(id);
    
    if(movingButtonType == 'approval'){
		new Ext.grid.GridPanel({
			id: id,
			title: title,
			store: new Ext.data.Store(),
			iconCls: 'icon-grid',
			region : region,
			width : width,
			height : height,
			collapsible :true ,
			cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer()]),
			viewConfig: {
				//forceFit:true,
				enableRowBody:true, 
				focusRow : Ext.emptyFn,
				getRowClass : function(record, rowIndex, p, store){
					p.body = '<p>'+record.data.opinion+'</p>';		
				    return 'x-grid3-row-expanded';
				}
				,onLoad : Ext.emptyFn   
	            ,listeners : {   
	                beforerefresh : function(v) {   
	                    v.scrollTop = v.scroller.dom.scrollTop;   
	                    v.scrollHeight = v.scroller.dom.scrollHeight;   
	                },   
	                refresh : function(v) {   
	                    v.scroller.dom.scrollTop = v.scrollTop   
	                            + (v.scrollTop == 0   
	                                    ? 0   
	                                    : v.scroller.dom.scrollHeight   
	                                            - v.scrollHeight);   
	                }   
	            }
			},
			bbar:new Ext.PagingToolbar({
				id : id+'_gridbbar',
				pageSize : 20,
				store : new Ext.data.Store(),
				displayInfo : true,
				items : [Ext.getCmp(id+'_combo')]
			})
		}) ; 
    } else {
		new Ext.grid.EditorGridPanel({
			id: id,
			title: title,
			store: new Ext.data.Store(),
			iconCls: 'icon-grid',
			clicksToEdit :1,
			region : region,
			width : width,
			height : height,
			collapsible :true ,
			autoEncode:true,/** niuhe 20130605 HTML特殊字符转义，将编码后的"<>&等特殊字符解码显示 **/
			cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer()]),
			viewConfig: {
				//forceFit:true,
				enableRowBody:true, 
				focusRow : Ext.emptyFn,
				focusCell : Ext.emptyFn,
				ensureVisible: Ext.emptyFn,
				getRowClass : function(record, rowIndex, p, store){
					p.body = '<p>'+record.data.opinion+'</p>';		
				    return 'x-grid3-row-expanded';
				}
				,onLoad : Ext.emptyFn   
	            ,listeners : {   
	                beforerefresh : function(v) {   
	                    v.scrollTop = v.scroller.dom.scrollTop;   
	                    v.scrollHeight = v.scroller.dom.scrollHeight;   
	                },   
	                refresh : function(v) {   
	                    v.scroller.dom.scrollTop = v.scrollTop   
	                            + (v.scrollTop == 0   
	                                    ? 0   
	                                    : v.scroller.dom.scrollHeight   
	                                            - v.scrollHeight);   
	                }   
	            }
			},
			tbar : new Ext.Toolbar({
				items : [{text : '保存' , 
						id : id+'_Toolbar' ,
						iconCls : 'save' ,
						handler : function(){
								var thisGrid = Ext.getCmp(id) ;
								var storeRecord = thisGrid.getStore().getModifiedRecords();
								//var selectedRecord  = thisGrid.getStore().query('path',-1);
								var jsonData = '[' ;
								for(var i = 0 ; i < storeRecord.length;i++){
									jsonData +='{\"path\":\"'+storeRecord[i].id+'\",\"data\":'+ Ext.util.JSON.encode(storeRecord[i].data)+'},';
								}
								//for(var i = 0 ; i < selectedRecord.length;i++){
								//   jsonData +='{\"path\":\"'+selectedRecord.items[i].id+'\",\"data\":'+ Ext.util.JSON.encode(selectedRecord.items[i].data)+'},';
								//}
								jsonData = jsonData.substring(0,jsonData.length-1) + ']';
								var updateField = '[' ; 
								var params = '' ; 
							   for(var i = 0 ; i < storeRecord.length;i++){
							      updateField +='{\"path\":\"'+storeRecord[i].data.path+'\"';
							       	for(var key in storeRecord[i].getChanges()){ 
								 				params += key+',' ;
										}
							      updateField +=',\"updateField\":\"'+ params +'\"},';
							     params = '' ;      ;
								  }
							   //for(var i = 0 ; i < selectedRecord.length;i++){
							   //   updateField +='{\"path\":\"'+storeRecord[i].data.path+'\"';
							   //    	for(var key in selectedRecord[i].getChanges()){ 
								// 				params += key+',' ;
								//		}
							   //   updateField +=',\"updateField\":\"'+ params +'\"},';
							   //  params = '' ;      ;
							  // }
							   updateField = updateField.substring(0,updateField.length-1) + ']';
							   if(jsonData==']'){showMsg('没有需要保存的数据！','3');return;}
//							   if(jsonData==']'){Ext.Msg.alert('消息','没有需要保存的数据！');return;}
							   var tempPath = storeRecord[0].data.path ;
							   var contentPath = tempPath.substring(0 , tempPath.lastIndexOf("/")+1) + tempPath.substring(tempPath.lastIndexOf("@"),tempPath.length) ;
							   var businessName = tempPath.split("/")[1] ;
							   /** niuhe 20130815 移交接收业务名 **/
							   var tmpUrl = 'businessEdit.html?content.method=saveGridData';
							   if(businessIdentifierParam == 'receiveTransfer'){
							   		tmpUrl = tmpUrl + '&businessName=' + businessName + '&modelName=receiveTransfer';
							   }else{
							   		tmpUrl = tmpUrl + '&businessName=' + businessName;
							   }
							   Ext.Ajax.request({
						   		    url : tmpUrl,
							        params : {data:jsonData,contentPath:contentPath,updateField:updateField,fromWF:'1'},		
								    callback:function(options,success,response){
								    	var json=Ext.util.JSON.decode(response.responseText);
								    	if(json.success==false){
								    		if(json.iskeyword==true){
								    			showMsg('保存失败，原因是：'+json.messages+'是关键字，不可重复！','2');
//								    			Ext.Msg.alert('消息','保存失败，原因是：'+json.messages+'是关键字，不可重复！');
								    		}else if(json.which){
								    			showMsg('保存失败，原因是：'+json.which+'为必填字段，必须填写!','2');
//								    			Ext.Msg.alert('消息','保存失败，原因是：'+json.which+'为必填字段，必须填写!');
								    		}else{
								    			showMsg('请在列表中填写数据!','3');
//								    			Ext.Msg.alert('消息','请在列表中填写数据!');
								    		}
								    	} else {
								    		thisGrid.getStore().reload() ;
								    		thisGrid.getStore().commitChanges() ;
								    		var childStore = Ext.getCmp(saveChildSystemDataGridPanelId).getStore() ;
								    		if(childStore.getCount()>0)childStore.reload() ;
								    		showMsg('保存成功！','1') ;
//								    		Ext.Msg.alert('消息','保存成功！') ;
								    	}
								    }
							   });
						}
					}]
			}),
			bbar:new Ext.PagingToolbar({
				id : id+'_gridbbar',
				pageSize : 20,
				store : new Ext.data.Store(),
				displayInfo : true,
				items : [Ext.getCmp(id+'_combo')]
			})
		}) ; 
    }
	//加载父结构数据
	pcreateLoadDataAjax(); 
}

//加载附件数据
pcreateLoadDataAjax = function(){
	Ext.Ajax.request({
		url: psystemDatagetParamsUrl + '&parentAppendixPath=' + parentAppendixPath,
		callback:ploadSystemDataToGrid 
	});
}

//加载数据到附件数据列表
ploadSystemDataToGrid = function(options, success, response) {
	if (success) {
		var json = Ext.util.JSON.decode(response.responseText);
		var newCm = new Ext.grid.ColumnModel(Ext.util.JSON.decode("["+ "new Ext.grid.RowNumberer()"+","+  json.commentColumnModel+"]"));
		newCommentCoM = newCm;
		newCommentRecord = json.commentRecord;		
		//var selectPaths = '';
		//if(Ext.getCmp('myFormModelsdataList'))selectPaths = Ext.getCmp('myFormModelsdataList').getValue();
		var newDs = new Ext.data.Store({ 
			baseParams: { 
			    //selectPaths : selectPaths ,
		    	wfID : pcurrWfId,
		    	havingRole : pcurrHavingRole,
		    	structureId : json.structureId,
		    	CacheName : json.CacheName,
		    	hasResourceTag : json.hasResourceTag,
		    	appendixsPath : parentAppendixPath ,
		    	isFormReceiveManager : isFormReceiveManager
	    	},
			proxy:new Ext.data.HttpProxy({
		    	url:psystemDataloadDataUrl
			}),
			reader : new Ext.data.JsonReader({
		   		totalProperty : 'commentTotalSize',
		    	root : 'commentDataList'  
			}, Ext.util.JSON.decode(newCommentRecord))
		});
		var panelId = '' ;
		if(parentAppendixPath == ''){
			panelId = psystemDataGridPanelId ;
		} else {
			panelId = csystemDataGridPanelId ;
		}
		var comment_grid = Ext.getCmp(panelId);
		comment_grid.setTitle(json.structureTitle) ;
		newCm.defaultSortable = true;
		comment_grid.reconfigure(newDs, newCm);
		//加载数据到bbar
		Ext.getCmp(panelId+'_gridbbar').bind(newDs);
		newDs.load({
		params : {
			start : 0,
			//limit : 20 
			limit :getSystemDataComboValue_Model(panelId)
			}
		}); 
	}
}

/** xiaoxiong 20111206 创建空的dataGrid 组件 **/
function createChildApprovalOrUpdateGridPanel(id,title,movingButtonType, businessIdentifierParam){
	createPagingBar(id);
	
	if(movingButtonType == 'approval'){
		new Ext.grid.GridPanel({
			id: id,
			title: title,
			store: new Ext.data.Store(),
			iconCls: 'icon-grid',
			region : 'south',
			width : 1014,
			height : 10,
			collapsible :true ,
			cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer()]),
			viewConfig: {
				//forceFit:true,
				enableRowBody:true, 
				focusRow : Ext.emptyFn,
				getRowClass : function(record, rowIndex, p, store){
					p.body = '<p>'+record.data.opinion+'</p>';		
				    return 'x-grid3-row-expanded';
				}
				,onLoad : Ext.emptyFn   
	            ,listeners : {   
	                beforerefresh : function(v) {   
	                    v.scrollTop = v.scroller.dom.scrollTop;   
	                    v.scrollHeight = v.scroller.dom.scrollHeight;   
	                },   
	                refresh : function(v) {   
	                    v.scroller.dom.scrollTop = v.scrollTop   
	                            + (v.scrollTop == 0   
	                                    ? 0   
	                                    : v.scroller.dom.scrollHeight   
	                                            - v.scrollHeight);   
	                }   
	            }
			},
			tbar : new Ext.Toolbar({
				items : [{text : '上一级' , 
						id : id+'_Toolbar' ,
						iconCls : 'GridBack' ,
						disabled : true ,
						handler : function(){
							if(saveChildPathStr != ""){
								if(saveChildPathStr.indexOf('_') > -1){
									var parentPathArray = saveChildPathStr.split('_') ;
									showItemDataAction(parentPathArray[parentPathArray.length-2]) ;
									saveChildPathStr = parentPathArray[0] ;
									for(var j=1 ; j<parentPathArray.length-1 ; j++){
										saveChildPathStr =  saveChildPathStr + "_" + parentPathArray[j] ;
									}
									if(saveChildPathStr.indexOf('_') == -1){
										Ext.getCmp(id+'_Toolbar').disable() ;
									}
								} else {
									showItemDataAction(saveChildPathStr) ;
									saveChildPathStr = "" ;
									Ext.getCmp(id+'_Toolbar').disable() ;
								}
							}
						}
					}]
			}),
			bbar:new Ext.PagingToolbar({
				id : id+'_gridbbar',
				pageSize : 20,
				store : new Ext.data.Store(),
				displayInfo : true,
				items : [Ext.getCmp(id+'_combo')]
			})
		}) ; 
	} else {
		new Ext.grid.EditorGridPanel({
			id: id,
			title: title,
			store: new Ext.data.Store(),
			iconCls: 'icon-grid',
			region : 'south',
			clicksToEdit :1,
			width : 1014,
			height : 310,
			collapsible :true ,
			autoEncode:true,/** niuhe 20130605 HTML特殊字符转义，将编码后的"<>&等特殊字符解码显示 **/
			cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer()]),
			viewConfig: {
				//forceFit:true,
				enableRowBody:true, 
				focusRow : Ext.emptyFn,
				focusCell : Ext.emptyFn,
				ensureVisible: Ext.emptyFn,
				getRowClass : function(record, rowIndex, p, store){
					p.body = '<p>'+record.data.opinion+'</p>';		
				    return 'x-grid3-row-expanded';
				}
				,onLoad : Ext.emptyFn   
	            ,listeners : {   
	                beforerefresh : function(v) {   
	                    v.scrollTop = v.scroller.dom.scrollTop;   
	                    v.scrollHeight = v.scroller.dom.scrollHeight;   
	                },   
	                refresh : function(v) {   
	                    v.scroller.dom.scrollTop = v.scrollTop   
	                            + (v.scrollTop == 0   
	                                    ? 0   
	                                    : v.scroller.dom.scrollHeight   
	                                            - v.scrollHeight);   
	                }   
	            }
			},
			tbar : new Ext.Toolbar({
				items : [{text : '上一级' , 
						id : id+'_Toolbar' ,
						iconCls : 'GridBack' ,
						disabled : true ,
						handler : function(){
							if(saveChildPathStr != ""){
								if(saveChildPathStr.indexOf('_') > -1){
									var parentPathArray = saveChildPathStr.split('_') ;
									showItemDataAction(parentPathArray[parentPathArray.length-2]) ;
									saveChildPathStr = parentPathArray[0] ;
									for(var j=1 ; j<parentPathArray.length-1 ; j++){
										saveChildPathStr =  saveChildPathStr + "_" + parentPathArray[j] ;
									}
									if(saveChildPathStr.indexOf('_') == -1){
										Ext.getCmp(id+'_Toolbar').disable() ;
									}
								} else {
									showItemDataAction(saveChildPathStr) ;
									saveChildPathStr = "" ;
									Ext.getCmp(id+'_Toolbar').disable() ;
								}
							}
						}
					},{text : '保存' , 
						id : id+'_Toolbar_save' ,
						iconCls : 'save' ,
						handler : function(){
								var thisGrid = Ext.getCmp(id) ;
								var storeRecord = thisGrid.getStore().getModifiedRecords();
								//var selectedRecord  = thisGrid.getStore().query('path',-1);
								var jsonData = '[' ;
								for(var i = 0 ; i < storeRecord.length;i++){
									jsonData +='{\"path\":\"'+storeRecord[i].id+'\",\"data\":'+ Ext.util.JSON.encode(storeRecord[i].data)+'},';
								}
								//for(var i = 0 ; i < selectedRecord.length;i++){
								//   jsonData +='{\"path\":\"'+selectedRecord.items[i].id+'\",\"data\":'+ Ext.util.JSON.encode(selectedRecord.items[i].data)+'},';
								//}
								jsonData = jsonData.substring(0,jsonData.length-1) + ']';
								var updateField = '[' ; 
								var params = '' ; 
							   for(var i = 0 ; i < storeRecord.length;i++){
							      updateField +='{\"path\":\"'+storeRecord[i].data.path+'\"';
							       	for(var key in storeRecord[i].getChanges()){ 
								 				params += key+',' ;
										}
							      updateField +=',\"updateField\":\"'+ params +'\"},';
							     params = '' ;      ;
								  }
							   //for(var i = 0 ; i < selectedRecord.length;i++){
							   //   updateField +='{\"path\":\"'+storeRecord[i].data.path+'\"';
							   //    	for(var key in selectedRecord[i].getChanges()){ 
								// 				params += key+',' ;
								//		}
							   //   updateField +=',\"updateField\":\"'+ params +'\"},';
							   //  params = '' ;      ;
							  // }
							   updateField = updateField.substring(0,updateField.length-1) + ']';
							   if(jsonData==']'){showMsg('没有需要保存的数据！','3');return;}
//							   if(jsonData==']'){Ext.Msg.alert('消息','没有需要保存的数据！');return;}
							   var tempPath = storeRecord[0].data.path ;
							   var contentPath = tempPath.substring(0 , tempPath.lastIndexOf("/")+1) + tempPath.substring(tempPath.lastIndexOf("@"),tempPath.length) ;
							   var businessName = tempPath.split("/")[1] ;
							   /** niuhe 20130815 移交接收业务名 **/
							   var tmpUrl = 'businessEdit.html?content.method=saveGridData';
							   if(businessIdentifierParam == 'receiveTransfer'){
							   		tmpUrl = tmpUrl + '&businessName=' + businessName + '&modelName=receiveTransfer';
							   }else{
							   		tmpUrl = tmpUrl + '&businessName=' + businessName;
							   }
							   Ext.Ajax.request({
						   		    url : tmpUrl,
							        params : {data:jsonData,contentPath:contentPath,updateField:updateField,fromWF:'1'},		
								    callback:function(options,success,response){
								    	var json=Ext.util.JSON.decode(response.responseText);
								    	if(json.success==false){
								    		if(json.iskeyword==true){
								    			showMsg('保存失败，原因是：'+json.messages+'是关键字，不可重复！','2');
//								    			Ext.Msg.alert('消息','保存失败，原因是：'+json.messages+'是关键字，不可重复！');
								    		}else if(json.which){
								    			showMsg('保存失败，原因是：'+json.which+'为必填字段，必须填写!','2');
//								    			Ext.Msg.alert('消息','保存失败，原因是：'+json.which+'为必填字段，必须填写!');
								    		}else{
								    			showMsg('请在列表中填写数据!','3');
//								    			Ext.Msg.alert('消息','请在列表中填写数据!');
								    		}
								    	} else {
								    		thisGrid.getStore().reload() ;
								    		thisGrid.getStore().commitChanges() ;
								    		Ext.getCmp(psystemDataGridPanelId).getStore().reload();
								    		showMsg('保存成功！','1') ;
//								    		Ext.Msg.alert('消息','保存成功！') ;
								    	}
								    }
							   });
						}
					}]
			}),
			bbar:new Ext.PagingToolbar({
				id : id+'_gridbbar',
				pageSize : 20,
				store : new Ext.data.Store(),
				displayInfo : true,
				items : [Ext.getCmp(id+'_combo')]
			})
		}) ; 
	}
}

function renderChildDataStatue(value, p, r){
	var str = '<input type="checkbox" value="{0}" ';
	//var str2 = 'onclick=setChildSystemDataRight(this.checked,{1},{2}) />';
	var str2 = 'onclick=setChildSystemDataRight(this.checked,"' + r.data['id'] + '","' + r.data['path'] + '") />';
	var str3 = '<a href=# onclick=addChildAppendixOpinion("' + r.data['path'] + '")>回复</a>' ;
	if(r.data['isDestory'] == '1'){
		str = str + ' checked=true ';
	}
	if('false' == currHavingRole){
		str = str + ' disabled=true ';
		str = str + str2 ;
		if('' != currDelAppendixUrl){
			str =str + ' <img src="./images/delete.gif"  onclick=delDestorySystemDataAppendix("{2}","{3}") alt="删除附件" />';
			str = String.format(str,r.data['isDestory'],r.data['id'],r.data['path'],r.data['id']) ;
		}else{
			str = String.format(str,r.data['isDestory'],r.data['id'],r.data['path']) ;
		}
	}else{
		str = str + str2 + str3;
		str = String.format(str,r.data['isDestory'],r.data['id'],r.data['path']) ;
	}
	//if('' != delAppendixUrl){
	//	str =str + ' <img src=./images/delete.gif  />';
	//}
	return str;
}

/** zhouwenhai 20130513 去掉多选框.*/
function renderChildDataStatue1(value, p, r){
	var str = '<a href=# onclick=addChildAppendixOpinion("' + r.data['path'] + '")>回复</a>' ;
	return str;
}


function addChildAppendixOpinion(pkgPath){
	Ext.QuickTips.init(); 
	//xiaoxiong 20111018 修改回复意见后，表单中的组件就没有办法正常的输入值
	if(Ext.getCmp('add_opinion_Reply_child')){
		Ext.getCmp('opinionReply_from_window_child').form.reset();
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		//Ext.getCmp('add_opinion_Reply').appendixIdForWindow = appendixId ;
		Ext.getCmp('add_opinion_Reply_child').pkgPathForWindow = pkgPath ;
		//Ext.getCmp('add_opinion_Reply_child').parentAppendixPathForWindow = parentAppendixPath ;
		Ext.getCmp('add_opinion_Reply_child').show() ;
		return ;
	}
	//end
	new Ext.Window({ 
		id:'add_opinion_Reply_child',  
		title:'' ,  
		layout:'fit',   
		width:550,   
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		//appendixIdForWindow : appendixId,
		pkgPathForWindow : pkgPath,
		//parentAppendixPathForWindow : parentAppendixPath,
		resizable :false,
		height:200, 
		modal: true,
		items:  		
		//添加窗体form
		new Ext.form.FormPanel({ 
			id: 'opinionReply_from_window_child',
		 	method:'POST',
		    frame:true,
		 	title: '',
		 	width: 550,
		 	height: 200,  
		 	defaultType: 'textfield',
		    labelAlign:'left',
		 	items: [ 				
		 	//new Ext.form.HtmlEditor({
		 	//    id:'opinionReplyEditor_child',
		 	//    name:'newcontent',
		 	//    width:550,
		 	//    height:200,
		 	//    allowBlank:false,
		 	//    //jiangyuntao 20111012 edit 处理字体自动切换的BUG
		 	//    fontFamilies:['Tahoma'],
		 	//    defaultFont:'Tahoma',
		 	//    maxLength:4000 ,
		 	//    hideLabel:true,
		 	//    listeners:{}
		    // })
		    
		    new Ext.form.TextArea({
		 	    id:'opinionReplyEditor_child',
		 	    name:'newcontent',
		 	    width:524,
		 	    height:130,
		 	    allowBlank:false,
		 	    maxLength:512 ,
		 	    hideLabel:true
		     })
		     
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.projectid")+"',name:'newprojectid',width:220,allowBlank:false,maxLength:128,clearCls:'stopFloat',hidden:true,hideLabel:true,value:selectedProjID },
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.parentid")+"',name:'newparentid',width:220,allowBlank:false,clearCls:'allowFloat',hidden:true,hideLabel:true,value:ParentId}  
		  	],		
			buttons: [{text: '保存',type:'submit'
				,handler: function(){
				  	if(!Ext.getCmp('opinionReply_from_window_child').form.isValid()){
					  return;
		 	  		}
		 	  		//jiangyuntao 20111024 edit 增加回复意见超长验证.
		 	  		//if(Ext.getCmp('opinionReplyEditor_child').getRawValue().length>512){
		 	  		//	Ext.Msg.alert('提示','文本超长,最大输入长度为512！');
		 	  		//	return ;
		 	  		//}
		 	  		
		 	  		
		       		Ext.getCmp('opinionReply_from_window_child').form.submit({ 
		         		url:paddOpinionUrl,
		         		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		         		//params:{appendixID:appendixId},
		         		params:{pkgPath:Ext.getCmp('add_opinion_Reply_child').pkgPathForWindow},
		         		success:function(){		 
		 		    		Ext.getCmp(csystemDataGridPanelId).getStore().reload();
		 		    		Ext.getCmp(psystemDataGridPanelId).getStore().reload();
		 		    		if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
		 		    		//xiaoxiong 20111018 将组件销毁去掉，将窗体隐藏
		 					//Ext.getCmp('opinionReplyEditor_child').destroy(); 
		 					//Ext.getCmp('add_opinion_Reply_child').destroy(); 
		 					Ext.getCmp('add_opinion_Reply_child').hide() ;
		 					//end
		 					//Ext.Msg.alert('提示','保存成功!');//xiaoxiong 20111206 将数据添加成功的提示去掉
		 				},
		         		failure:function(){
		 		    		Ext.getCmp(csystemDataGridPanelId).getStore().reload({params : {start : 0,limit : getSystemDataComboValue_Model(csystemDataGridPanelId)}});
		 		    		showMsg('保存失败!','2');
//		 					Ext.Msg.alert('提示','保存失败!');
		
		 				}
		 			});  
		 		}
		 	 },{
		 	 		text: '复位',type:'reset',handler: function(){
		    		Ext.getCmp('opinionReply_from_window_child').form.reset();
		    	}
		   	}
		  ]    
		})
	}).show();  
//Ext.getCmp('opinionReplyEditor_child').relayCmd('inserthtml','');
//Ext.getCmp('opinionReplyEditor_child').updateToolbar();
}

function deleteChildDataAppendixOpinion(opinionID){
	Ext.Ajax.request({
		url:pdelOpinionUrl,
		params:{opinionID:opinionID},				
		callback:function(options, success, response){
			Ext.getCmp(csystemDataGridPanelId).getStore().reload();
			Ext.getCmp(psystemDataGridPanelId).getStore().reload();
				if (!success) {showMsg('删除失败!','2');}
//				 if (!success) {Ext.Msg.alert('提示','删除失败!');}
		}
	});
}

function editAppendixOpinion(opinionID,currOpinion){
	Ext.QuickTips.init(); 
	//xiaoxiong 20111018 修改回复意见后，表单中的组件就没有办法正常的输入值
	if(Ext.getCmp('edit_opinion_Reply')){
		Ext.getCmp('opinionReply_from_window_edit').form.reset();
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		Ext.getCmp('edit_opinion_Reply').appendixIdForWindow = opinionID ;
		Ext.getCmp('opinionReplyEditor_edit').setValue(currOpinion);
		Ext.getCmp('edit_opinion_Reply').show() ;
		return ;
	}
	//end
	new Ext.Window({ 
		id:'edit_opinion_Reply',  
		title:'' ,  
		layout:'fit',   
		width:550,   
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		appendixIdForWindow : opinionID ,
		resizable :false,
		height:200, 
		modal: true,
		items:  		
		//添加窗体form
		new Ext.form.FormPanel({ 
			id: 'opinionReply_from_window_edit',
		 	method:'POST',
		    frame:true,
		 	title: '',
		 	width: 550,
		 	height: 200,  
		 	defaultType: 'textfield',
		    labelAlign:'left',
		 	items: [ 				
		 	//new Ext.form.HtmlEditor({
		 	//    id:'opinionReplyEditor_edit',
		 	//    name:'newcontent',
		 	//    width:550,
		 	//    height:200,
		 	//    allowBlank:false,
		 	//    //jiangyuntao 20111012 edit 处理字体自动切换的BUG
		 	//    fontFamilies:['Tahoma'],
		 	//    defaultFont:'Tahoma',
		 	//    maxLength:4000 ,
		 	//    hideLabel:true,
		 	//    listeners:{}
		     //})
		     
		     new Ext.form.TextArea({
		 	    id:'opinionReplyEditor_edit',
		 	    name:'newcontent',
		 	    width:524,
		 	    height:130,
		 	    allowBlank:false,
		 	    maxLength:512 ,
		 	    hideLabel:true
		     })
		     
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.projectid")+"',name:'newprojectid',width:220,allowBlank:false,maxLength:128,clearCls:'stopFloat',hidden:true,hideLabel:true,value:selectedProjID },
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.parentid")+"',name:'newparentid',width:220,allowBlank:false,clearCls:'allowFloat',hidden:true,hideLabel:true,value:ParentId}  
		  	],		
			buttons: [{text: '保存',type:'submit'
				,handler: function(){
				  	if(!Ext.getCmp('opinionReply_from_window_edit').form.isValid()){
					  return;
		 	  		}
		 	  		//jiangyuntao 20111024 edit 增加回复意见超长验证.
		 	  		//if(Ext.getCmp('opinionReplyEditor_edit').getRawValue().length>512){
		 	  		//	Ext.Msg.alert('提示','文本超长,最大输入长度为512！');
		 	  		//	return ;
		 	  		//}
		 	  		
		 	  		
		       		Ext.getCmp('opinionReply_from_window_edit').form.submit({ 
		         		url:'formBuilderManager.html?method=editSystemDataOpinion',
		         		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		         		//params:{appendixID:appendixId},
		         		params:{opinionID:Ext.getCmp('edit_opinion_Reply').appendixIdForWindow},
		         		success:function(){		 
		 		    		if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
		 		    		if(psystemDataGridPanelId!=null&&Ext.getCmp(psystemDataGridPanelId))Ext.getCmp(psystemDataGridPanelId).getStore().reload();//xiaoxiong 20111206 回复意见时自动刷新审批界面中的意见
		 		    		//xiaoxiong 20111018 将组件销毁去掉，将窗体隐藏
		 					//Ext.getCmp('opinionReplyEditor_edit').destroy(); 
		 					//Ext.getCmp('edit_opinion_Reply').destroy(); 
		 					Ext.getCmp('edit_opinion_Reply').hide() ;
		 					//end
		 					//Ext.Msg.alert('提示','保存成功!');//xiaoxiong 20111206 将数据添加成功的提示去掉
		 				},
		         		failure:function(){
		 		    		if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload({params : {start : 0,limit : getSystemDataComboValue_Model(systemDataGridPanelId)}});
		 		    		showMsg('保存失败!','2');
//		 					Ext.Msg.alert('提示','保存失败!');
		
		 				}
		 			});  
		 		}
		 	 },{
		 	 		text: '复位',type:'reset',handler: function(){
		    		Ext.getCmp('opinionReply_from_window_edit').form.reset();
		    	}
		   	}
		  ]    
		})
	}).show();  
//Ext.getCmp('opinionReplyEditor_edit').relayCmd('inserthtml','');
Ext.getCmp('opinionReplyEditor_edit').setValue(currOpinion);
//Ext.getCmp('opinionReplyEditor').updateToolbar();
}

function editChildDataAppendixOpinion(opinionID,currOpinion){
	Ext.QuickTips.init(); 
	//xiaoxiong 20111018 修改回复意见后，表单中的组件就没有办法正常的输入值
	if(Ext.getCmp('edit_opinion_Reply_child')){
		Ext.getCmp('opinionReply_from_window_child_edit').form.reset();
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		//Ext.getCmp('add_opinion_Reply').appendixIdForWindow = appendixId ;
		Ext.getCmp('edit_opinion_Reply_child').pkgPathForWindow = opinionID ;
		//Ext.getCmp('edit_opinion_Reply_child').parentAppendixPathForWindow = parentAppendixPath ;
		Ext.getCmp('opinionReplyEditor_child_edit').setValue(currOpinion);
		Ext.getCmp('edit_opinion_Reply_child').show() ;
		return ;
	}
	//end
	new Ext.Window({ 
		id:'edit_opinion_Reply_child',  
		title:'' ,  
		layout:'fit',   
		width:550,   
		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		//appendixIdForWindow : appendixId,
		pkgPathForWindow : opinionID,
		//parentAppendixPathForWindow : parentAppendixPath,
		resizable :false,
		height:200, 
		modal: true,
		items:  		
		//添加窗体form
		new Ext.form.FormPanel({ 
			id: 'opinionReply_from_window_child_edit',
		 	method:'POST',
		    frame:true,
		 	title: '',
		 	width: 550,
		 	height: 200,  
		 	defaultType: 'textfield',
		    labelAlign:'left',
		 	items: [ 				
		 	//new Ext.form.HtmlEditor({
		 	//    id:'opinionReplyEditor_child_edit',
		 	//    name:'newcontent',
		 	//    width:550,
		 	//    height:200,
		 	//    allowBlank:false,
		 	//    //jiangyuntao 20111012 edit 处理字体自动切换的BUG
		 	//    fontFamilies:['Tahoma'],
		 	//    defaultFont:'Tahoma',
		 	//    maxLength:4000 ,
		 	//    hideLabel:true,
		 	//    listeners:{}
		    // })
		    
		    new Ext.form.TextArea({
		 	    id:'opinionReplyEditor_child_edit',
		 	    name:'newcontent',
		 	    width:524,
		 	    height:130,
		 	    allowBlank:false,
		 	    maxLength:512 ,
		 	    hideLabel:true
		     })
		     
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.projectid")+"',name:'newprojectid',width:220,allowBlank:false,maxLength:128,clearCls:'stopFloat',hidden:true,hideLabel:true,value:selectedProjID },
		 	//{fieldLabel: '"+PkgTagUtils.message(pageContext,"Project.comment.tag.parentid")+"',name:'newparentid',width:220,allowBlank:false,clearCls:'allowFloat',hidden:true,hideLabel:true,value:ParentId}  
		  	],		
			buttons: [{text: '保存',type:'submit'
				,handler: function(){
				  	if(!Ext.getCmp('opinionReply_from_window_child_edit').form.isValid()){
					  return;
		 	  		}
		 	  		//jiangyuntao 20111024 edit 增加回复意见超长验证.
		 	  		//if(Ext.getCmp('opinionReplyEditor_child_edit').getRawValue().length>512){
		 	  		//	Ext.Msg.alert('提示','文本超长,最大输入长度为512！');
		 	  		//	return ;
		 	  		//}
		 	  		
		       		Ext.getCmp('opinionReply_from_window_child_edit').form.submit({ 
		         		url:peditOpinionUrl,
		         		//jiangyuntao 20111024 edit 修改不销毁组件，导致的appendixId值无法传递出现的BUG。
		         		//params:{appendixID:appendixId},
		         		params:{opinionID:Ext.getCmp('edit_opinion_Reply_child').pkgPathForWindow},
		         		success:function(){		 
		 		    		Ext.getCmp(csystemDataGridPanelId).getStore().reload();
		 		    		Ext.getCmp(psystemDataGridPanelId).getStore().reload();
		 		    		//xiaoxiong 20111018 将组件销毁去掉，将窗体隐藏
		 					//Ext.getCmp('opinionReplyEditor_child_edit').destroy(); 
		 					//Ext.getCmp('edit_opinion_Reply_child').destroy(); 
		 					Ext.getCmp('edit_opinion_Reply_child').hide() ;
		 					//end
		 					//Ext.Msg.alert('提示','保存成功!');//xiaoxiong 20111206 将数据添加成功的提示去掉
		 				},
		         		failure:function(){
		 		    		Ext.getCmp(csystemDataGridPanelId).getStore().reload({params : {start : 0,limit : getSystemDataComboValue_Model(csystemDataGridPanelId)}});
		 		    		showMsg('修改失败!','2');
//		 					Ext.Msg.alert('提示','修改失败!');
		
		 				}
		 			});  
		 		}
		 	 },{
		 	 		text: '复位',type:'reset',handler: function(){
		    		Ext.getCmp('opinionReply_from_window_child_edit').form.reset();
		    	}
		   	}
		  ]    
		})
	}).show();  
	//Ext.getCmp('opinionReplyEditor_child_edit').relayCmd('inserthtml','');
	Ext.getCmp('opinionReplyEditor_child_edit').setValue(currOpinion);
}

function setChildSystemDataRight(status,appendixId,pkgPath){
	Ext.Ajax.request({
		url:psetDataStatusUrl+'&saveChildPathStr='+saveChildPathStr,
		params:{status:status==true?'1':'0',appendixId:appendixId,pkgPath:pkgPath,WfId:currWfId},				
		callback:function(options, success, response){
			if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
			var parentPanelId = saveChildSystemDataGridPanelId.substring(0,saveChildSystemDataGridPanelId.lastIndexOf('_'))+'_parent' ;
			if(Ext.getCmp(parentPanelId))Ext.getCmp(parentPanelId).getStore().reload();
			if(Ext.getCmp(csystemDataGridPanelId))Ext.getCmp(csystemDataGridPanelId).getStore().reload();
				if (!success) {showMsg('设置失败!','2');}
//				 if (!success) {Ext.Msg.alert('提示','设置失败!');}
		}
	});
}

function receiveTransferBitstreamViewEvent(value, bistreamPath) {
	if (value.indexOf('RTSP') >= 0) {
		Ext.Ajax.request({
			url : 'baseUtilAction.html?content.method=getbitstreamMediaParamter&file='
					+ value,
			callback : function(options, success, response) {
				var json = Ext.util.JSON.decode(response.responseText);
				window.open(json.file);
			}
		});
	} else {
		new Ext.Window({
					id : 'graphBitstreamViewwindow',
					title : "<fmt:message key='Bitstream.view.title' />",
					layout : 'fit',
					modal : true,
					width : 1000,
					height : 630,
					autoScroll : true,
					resizable : false,
					autoLoad : {
						url : 'bitstreamView.html',
						params : {
							pkgpath : bistreamPath,
							bitstream : value,
							winId:'graphBitstreamViewwindow'
						},
						nocache : true,
						scripts : true
					}
				});
		Ext.getCmp('graphBitstreamViewwindow').show();
	}
}

systemDataGridPanelInit = function(wfID,id,title,loadDataUrl,getParamsUrl,addUrl,delUrl,setUrl,delAppendixUrl,havingRole){
    systemDataGridPanelId = id ;
    systemDataloadDataUrl = loadDataUrl ;
    systemDatagetParamsUrl = getParamsUrl ;
    setDataStatusUrl = setUrl ;
    delOpinionUrl = delUrl ;
    currWfId = wfID ;
    addOpinionUrl = addUrl ;
    currHavingRole = havingRole ;
    currDelAppendixUrl = delAppendixUrl ;
    isFormReceiveManager = 'true' ;
}

function renderIsReceive(value, p, r){
	var str = '<input type="checkbox" value="{0}" ';
	var str2 = 'onclick=setReceiveSystemDataRight(this.checked,{1},\''+(r.data['path']==null?r.data['pkgPath']:r.data['path'])+'\') />';
	var str3 = '<a href=# onclick=addAppendixOpinion({2})>回复</a>' ;
	//jiangyuntao 20120320 edit 增加销毁流程可以删除数据附件。
	var delPath = r.data['destoryPath'];
	if(''==delPath)delPath = r.data['pkgPath'];
	if(r.data['isDestory'] == '1'){
		str = str + ' checked=true ';
	}
	if('false' == currHavingRole){
		str = str + ' disabled=true ';
		str = str + str2 ;
		if('' != currDelAppendixUrl){
			str =str + ' <img src="./images/delete.gif"  onclick=delDestorySystemDataAppendix("{2}","{3}") alt="删除附件" />';
			str = String.format(str,r.data['isDestory'],r.data['id'],delPath,r.data['id']) ;
		}else{
			str = String.format(str,r.data['isDestory'],r.data['id']) ;
		}
	}else{
		str = str + str2 + str3;
		str = String.format(str,r.data['isDestory'],r.data['id'],r.data['id']) ;
	}
	//if('' != delAppendixUrl){
	//	str =str + ' <img src=./images/delete.gif  />';
	//}
	return str;
}
/** zhouwenhai 20130513 去掉多选框.*/
function renderIsReceive1(value, p, r){
	var str = '<a href=#  onclick=addAppendixOpinion("' + r.data['id'] + '")>回复</a>' ;
	return str;
}

function setReceiveSystemDataRight(status,appendixId,path){
	Ext.Ajax.request({
		url:setDataStatusUrl+'&saveChildPathStr='+saveChildPathStr,
		params:{status:status==true?'1':'0',appendixId:appendixId,dataPath:path,WfId:currWfId},				
		callback:function(options, success, response){
			if(Ext.getCmp(systemDataGridPanelId))Ext.getCmp(systemDataGridPanelId).getStore().reload();
			if (!success) {showMsg('设置失败!','2');}else{if(Ext.getCmp(saveChildSystemDataGridPanelId)!=null && Ext.getCmp(saveChildSystemDataGridPanelId).title!='子结构数据'){Ext.getCmp(saveChildSystemDataGridPanelId).getStore().reload();}}
//			if (!success) {Ext.Msg.alert('提示','设置失败!');}else{if(Ext.getCmp(saveChildSystemDataGridPanelId)!=null && Ext.getCmp(saveChildSystemDataGridPanelId).title!='子结构数据'){Ext.getCmp(saveChildSystemDataGridPanelId).getStore().reload();}}
		}
	});
}
/*********************************** xiaoxiong 20111205 下面是移交接收代码 END **********************************************/
