
FormBuilderMain = function(id,formTypeID) {
	this.formJs;
	this.id = id;
	this.formTypeID=formTypeID;
};

FormBuilderMain.FIELDS = [] ;

//custom editors for attributes
FormBuilderMain.getCustomEditors = function() {
	var g = Ext.grid;
	var f = Ext.form;
	var cmEditors = new g.PropertyColumnModel().editors;
	var eds = {};
	var fields = FormBuilderMain.FIELDS;
	for (i in fields) {
		if (fields[i].values) {
			var values = fields[i].values;
			var data = [];
			for (j=0;j<values.length;j++) {data.push([values[j],values[j]]); }
			eds[i] = new g.GridEditor(new f.SimpleCombo({forceSelection:false,data:data,editable:true}));
		} else if (fields[i].type == "boolean") {
			eds[i] = cmEditors['boolean'];
		} else if (fields[i].type == "number") {
			eds[i] = cmEditors['number'];
//			eds[i] = new g.GridEditor(new f.NumberField({
//				maxValue:15
//				
//				}));
//			alert(eds[i].xtype);
//			eds[i].editor.maxValue = 15;
		} else if (fields[i].type == "string") {
			eds[i] = cmEditors['string'];
//			eds[i] = new g.GridEditor(new f.TextField({
//					selectOnFocus : true,
//					maxLength : 2,
//					regex : /^([ ]*[^ ]+[ ]*)*$/,
//					regexText : 'cccccccccccc'
//				}));
		} else {
//			eds[i] = cmEditors['string'];//jiang add 20091119
		}
	}
	return eds;
};

FormBuilderMain.prototype = {
	
	init: function() {
		Ext.QuickTips.init();
		this.idCounter = 0;
		
//			alert(this.formJs);
		
//		this.setConfig(this.formJs.items);
		// jiang add 20091127 field name
		this.formFieldName=0;
		this.autoUpdate = true;
		
		//jiangyuntao 20120906 edit 增加isUpdate属性，用于判断是新建还是修改
		FormBuilderMain.isUpdate = this.id == '-1'?false:true;
		//jiangyuntao 20120906 edit 增加alertText，用于区分修改时新建和新建时新建的提示，修复bug5264
		FormBuilderMain.alertText = "是否保存当前表单内容？";
        if(FormBuilderMain.isUpdate)FormBuilderMain.alertText = "你已经作了一些数据修改，是否要保存当前内容的修改？";
		
		this.formPkIdHiddenForm =  new Ext.form.FormPanel({
    		id:'osWfModel_custom_form_hidden',
    		method:'POST',
    		items:[
    		new Ext.form.Hidden({id:'osFormBuilder_hidden_formPkID',name:'osFormBuilder_hidden_formPkID',value:this.id})
    		]
    	});
		
//		jiang note 20091203
		this.cookies = new Ext.state.CookieProvider();
		this.initResizeLayer();
		this.initUndoHistory();
		this.initTreePanel();
		this.initEditPanel();
		this.initComponentsPanel();
		
		validateFormChange = this.validateFormChange.createDelegate(this); 
		saveForm = this.saveForm.createDelegate(this);
		saveFormAndCloseWin = this.saveFormAndCloseWin.createDelegate(this);
		
//		this.viewport = new Ext.Viewport({
		this.viewport = new Ext.Panel({
			width: 1000,
			height: 600,
			border: false,
			id    : 'esoais_createOrUpdate_form_panel',
			listeners  : {
				beforedestroy:function(){this.setSize(1000,600);validateFormChange();return false; }
		   },
    		tbar    : [{
							text : '新建',
							tooltip : '新建',
							iconCls:'formbuilder_icon-reset',
							scope: this,
							handler:function() {
								/**jiangyuntao 20130709 增加隐藏修改大小/移动的背景 this.resizeLayer.hide();*/
								this.resizeLayer.hide();
								this.markUndo("Reset All");
								//jiangyuntao 20120906 edit 如果点击新建，isUpdate设置为false
								FormBuilderMain.isUpdate = false ;
								this.resetAll();
								hasData = 'false' ;//xiaoxiong 20120516 新建时将是否有流转数据标示置为没有
							}
						}
						,'-'
						,{
							text:'预览',
							tooltip : '预览',
							iconCls:'formbuilder_icon-el',
							scope:this,
							handler:this.runWind
						}
						,'-'
						,{
							text:'保存',
							tooltip : '保存',
							iconCls:'formbuilder_save',
							scope:this,
							//handler:this.saveForm
							handler:function(){
							/**chenjian 20130410 保存时增加隐藏修改大小/移动的背景 this.resizeLayer.hide();*/
							this.resizeLayer.hide();
							this.updateForm(true);setTimeout(function(){this.saveForm();},100);}//xiaoxiong 20110915 修改BUG-NO:1625
						}
						//,'-'
						//,{
						//	text:'编辑代码',
						//	tooltip : '对表单的javascript代码进行编辑',
						//	iconCls:'icon-editEl',
						//	scope:this,
						//	handler:this.editConfig
						//}
						,
						'-',{
							iconCls : 'formbuilder_icon-update',
							text    : '更新',
							tooltip : '更新',
							scope   : this,
							handler : function() { this.updateForm(true); }
						},{
							xtype    : 'checkbox',
							boxLabel : '自动',
							id       : 'FBAutoUpdateCB',
							tooltip  : '自动',
							checked  : this.autoUpdate
						}
//						,'-',{
//							iconCls : 'icon-time',
//							text    : 'Rendering time : <i>unknown</i>',
//							scope   : this,
//							id      : 'FBRenderingTimeBtn',
//							tooltip : 'Click to update form and display rendering time',
//							handler : function() {
//								this.updateForm(true);
//							}
//						}
						,'-'
						,{
							id      : 'FBUndoBtn',
							iconCls : 'formbuilder_icon-undo',
							text    : '撒消',
							disabled: true,
							tooltip : "撒消",
							handler : this.undo,
							scope   : this
						}
				//fuhongyi 20100727 edit 暂时屏蔽		
					/*	,'->',{
							text    : '帮助',
							iconCls : 'icon-help',
							handler : function() {
								showMsg('帮助','暂时没有...');
							}
						}*/
					],
    		renderTo:'OS_Form_Builder_Div',
			layout : 'border',
				items: [
//					{
//					region  : 'north',
//					title   : 'Gui Builder',
//					height  : 52,
//				
//				},
				{
					region: 'west',
					border: false,
					width : 210,
					title: ' ',
					split : true,
					xtype : 'panel',
					layout: 'border',
	        		collapsible: false,
	        		collapsed : false,
					items : [
						this.treePanel,
						this.editPanel
					]
				},
					this.componentsPanel,
				{
					region:'center',
					layout:'fit',
//					height: 520,
					border:false,
					bodyBorder:false,
					autoScroll  : true,
					style:'padding:1px 1px;background:#848484',// jiang20091118
					items:{autoScroll:true,border:false,bodyBorder:false,bodyStyle:'background:#848484;border:dashed green 2px;',id:'FBBuilderPanel'}
				}
				]
			});
			this.builderPanel = Ext.ComponentMgr.get('FBBuilderPanel');
			var root = this.treePanel.root;
			root.fEl = this.builderPanel;
			root.elConfig = this.builderPanel.initialConfig;
			this.builderPanel._node = root;

			var drop = new Ext.dd.DropZone(main.builderPanel.el, {
					ddGroup:'component',
					notifyOver : function(src,e,data) {
							var node = main.getNodeForEl(e.getTarget());
							if (node) {
								data.node = node; node.select();
								this.highlightElement(node.fEl.el);
								if (this.canAppend({}, node) === true) {
									return true;
								} else {
									data.node = null;
									return false;
								}
							} else {
								data.node = null;
								return false;
							}
						}.createDelegate(this),
					notifyDrop : function(src,e,data) {
							if (!data.node || !data.compData) { return; }
							//xiaoxiong 20110426 修改Tabel组件上的一个单元格加载多个组件问题
							if(data.node.elConfig.html != null && data.node.elConfig.html != ' '){
								showMsg('此组件已经有值，值为：' + data.node.elConfig.html + '；' + '不能在此组件上再添加当前组件！','3');
								return ; 
							}
							if(data.node.elConfig.html != null && data.node.elConfig.html == ' ' && data.node.childNodes.length == 1){
								showMsg('此组件已经有子，不能在此组件上再添加当前组件！','3');
								return ; 
							}
							//end
							var c = data.compData.config;
							if (typeof c == 'function') {
								c.call(this,function(config) {
									var n = this.appendConfig(config, data.node, true, true);
									this.setCurrentNode(n, true);
								}, data.node.elConfig);
								return true;
							} else {
								var n = this.appendConfig(this.cloneConfig(data.compData.config), data.node, true, true);
								this.setCurrentNode(n, true);
							}
							return true;
						}.createDelegate(this),
					notifyOut : function(src,e,data) {
							data.node = null;
						}
				});
			main.builderPanel.drop = drop;

			Ext.ComponentMgr.get('FBAutoUpdateCB').on('check', function(c) {
				this.autoUpdate = c.checked;
			}, this);

			this.treePanel.el.on('contextmenu', function(e) {
				e.preventDefault();
			});

			//xiaoxiong 20120215 修改 表单管理-修改组件名称后组件名称没有变化 BUG
			this.treePanel.el.on('mouseover', function(e) {
				Ext.getCmp('propertygrid').focus();
			}, this);
		
			if (!this.loadConfigFromCookies()) { this.resetAll(); }

			// select elements on form with single click
			this.builderPanel.el.on('click', function(e,el) {
					
					var setPropertygrid=Ext.getCmp('propertygrid');
					var currnode = setPropertygrid.currentNode;
					setPropertygrid.getStore().commitChanges();
					//20100115
					var currdata=setPropertygrid.getStore().data;
					var t;
					var v;
					for(var index=0;index<currdata.length;index++){
						t=setPropertygrid.getStore().getAt(index).data.name;
						v=setPropertygrid.getStore().getAt(index).data.value;
						this.changeCnToEn(currnode,t,v);
					}
					
					var p = this.editPanel;
					this.updateNode(setPropertygrid.currentNode);
					
					e.preventDefault();
					var node = this.getNodeForEl(el);
					if (!node) { node = this.treePanel.root; }
					this.highlightElement(node.fEl.el);
					this.setCurrentNode(node, true);
					//jiangjien add20091127
//					this.visualResize(node);
					
//					this.markUndo('设置 <i>' + r.id + '</i> to "' +
//					Ext.util.Format.ellipsis((String)(r.data.value), 20) + '"');
					//var p = this.editPanel;
					//this.updateNode(setPropertygrid.currentNode);
					//this.updateForm(false, currnode.parentNode || currnode);
				}, this);
			
			//xiaoxiong 20120215 修改 表单管理-修改组件名称后组件名称没有变化 BUG	
			this.builderPanel.el.on('mouseover', function(e,el) {
					Ext.getCmp('propertygrid').focus();
				}, this);
				
			// jiang 20091119
			// select elements on form with single dblclick
//			this.builderPanel.el.on('dblclick', function(e,el) {
//					e.preventDefault();
//					var node = this.getNodeForEl(el);
//					if (!node) { node = this.treePanel.root; }
//					this.visualResize(node);
////					this.highlightElement(node.fEl.el);
////					this.setCurrentNode(node, true);
//				}, this);
				
			// menu on form elements
			this.builderPanel.el.on('contextmenu', function(e,el) {
					e.preventDefault();
					var node = this.getNodeForEl(el);
					if (!node) { return; }
					this.highlightElement(node.fEl.el);
					this.setCurrentNode(node, true);
					this.contextMenu.node = node;
					
					//jiangyuntao 20120329 edit 点击整个form右键时，删除这个组件、复制这个组件选项禁用，否则可用。
					if(node.text.split(' ')[0] == 'form'){
						Ext.getCmp('formbuilder_deleteCheckedEI').disable();
						Ext.getCmp('formbuilder_copyCheckedEI').disable();
					}else{
						Ext.getCmp('formbuilder_deleteCheckedEI').enable();
						Ext.getCmp('formbuilder_copyCheckedEI').enable();
					}
					//jiangyuntao 20120329 edit 右键数值组件可设置字段表单式，其他禁用。右键下拉组件时可设置关联数据字典，其他禁用。
					if(node.text.split(' ')[0] == 'numberfield'){
						Ext.getCmp('formbuilder_setExpressionForEI').enable();
					}else{
						Ext.getCmp('formbuilder_setExpressionForEI').disable();
					}
					if(node.text.split(' ')[0] == 'combo'){
						Ext.getCmp('formbuilder_relationComboForEI').enable();
					}else{
						Ext.getCmp('formbuilder_relationComboForEI').disable();
					}
					
					this.contextMenu.showAt(e.getXY());
				}, this);
//			this.getFormJs();//jiang add 20091204
				//------------------------
				// 说明 ： 自动增加 formpanel 
				// 时间 ： 2010-03-24 
				// 作者 ：  jiangjien 
				//------------------------
			// longjunhao 20140901 edit 没用，注释掉
//				var c = Ext.getCmp('formbuilderTBDataView').store.getAt(10).data.config;
//				if (typeof c == 'function') {
//					c.call(this,function(config) {
//						var newNode = this.appendConfig(config, n, true, true);
//					}, n.elConfig);
//				} else {//jiang
					// longjunhao 20140901 edit 没用，注释掉
//					var newNode = this.appendConfig(this.cloneConfig(c), n, true, true);
//				}
			
	},
	
	//jiangyuntao  20100531 关闭定制或修改表单的window时，验证是否已做操作，如果已做操作，给处是否保存提示。
	/**chenjian 20130410 关闭时增加隐藏修改大小/移动的背景 this.resizeLayer.hide();*/
	validateFormChange : function(){
		this.resizeLayer.hide();
		var cleanConfig = this.getTreeConfig();
		cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
		var formId = cleanConfig.id;
		if(formId){
			cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
			if(savedCleanConfig != ''){
				var tempQueryJs = savedCleanConfig.trim().split('\n');  
       			var tempCleanConfig = cleanConfig.trim().split('\n');
       			if(tempQueryJs.length != tempCleanConfig.length){
       				ifsaveFormChange();
       			}else{
       				for(var i = 0;i<tempQueryJs.length ; i++){
       					if(tempQueryJs[i].trim() != tempCleanConfig[i].trim()){
       						ifsaveFormChange();
       						return;
       					}
       				}
       				closeFormWindow();
       			}
			} else {
				formId = formId.substring('formBuilder_formId'.length);
				$.post( $.appClient.generateUrl({ESFormBuilder : 'getFormJs'}, 'x')
						,{formId:formId}, function(res){
						var json = eval("(" + res + ")") ;
		        		var queryJs = json.formJs;
		        		if(queryJs){
		        			var tempQueryJs = queryJs.replace(/\'/g,'"').trim().split('\n');  //将所有‘替换为“，再按\n进行拆分
		        			var tempCleanConfig = cleanConfig.trim().split('\n');
		        			if(tempQueryJs.length != tempCleanConfig.length){
		        				ifsaveFormChange();
		        			}else{
		        				for(var i = 0;i<tempQueryJs.length ; i++){
		        					if(tempQueryJs[i].trim() != tempCleanConfig[i].trim()){
		        						ifsaveFormChange();
		        						return;
		        					}
		        				}
		        				closeFormWindow();
		        			}
		        		}else{
		        			ifsaveFormChange();
		        		}
		    	});
			}
		}else{
			cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
			if(cleanConfig&&cleanConfig.length>4){
				 ifsaveFormChange();
			}else{
				closeFormWindow();
			}
		}
		
		//jiangyuntao  20100531 销毁定制或修改表单的window
		function closeFormWindow(){
			if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window')){
			    Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').destroy();
			}
			if(Ext.getCmp('formBuilderManagerFormBuilder_Window')){
				Ext.getCmp('formBuilderManagerFormBuilder_Window').destroy();
			}
		}
		
		//jiangyuntao  20100531 关闭定制或修改表单window时，如果已做操作，提示是否保存
		function  ifsaveFormChange(){
			 Ext.MessageBox.show({    
        		title:"保存数据",    
       	 		msg:"你已经作了一些数据修改，是否要保存当前内容的修改？",    
        		buttons:Ext.Msg.YESNOCANCEL,    
        		fn:saveFormChange,    
        		icon:Ext.MessageBox.QUESTION});    
    	} 
    	
    	//jiangyuntao  20100531 获得messageBox  btn参数，做出相应的处理
    	function saveFormChange(btn){
        		if(btn=='yes'){
        			//jiangyuntao 20120327 edit 增加saveform参数返回用于判断是否保存成功,如果保存不成功则不关闭定制表单界面.
        	   	 	//jiangyuntao 20120328 edit 修改为是否关闭表单定制窗口由saveForm方法控制。	
					saveFormAndCloseWin() ;//xiaoxiong 20120417 将saveForm();修改为saveFormAndCloseWin() ;
					//var savestatus = saveForm();
        			//if(savestatus==false){
        			//}else{
        			//closeFormWindow();
        			//}
        		}else if(btn =='no'){
        			closeFormWindow();
        		}else{
        			
        		}
        	}

	},
	
	// the tree panel, listing elements
	initTreePanel : function() {
		var tree = new Ext.tree.TreePanel({
			region          : 'north',
		//	title           : "组件树",
			//iconCls         : "icon-el",
			id				: 'formBuilderTree',
//			collapsible     : false,
//			collapsed 		: true,
			border: false,
			floatable       : false,
			autoScroll      : true,
			height          : 200,
			split           : true,
			animate         : false,
			enableDD        : true,
			ddGroup         : 'component',
			containerScroll : true,
			selModel        : new Ext.tree.DefaultSelectionModel(),
			bbar            : [{
				text    : '全部展开',
//				fuhongyi 20100727 修改提示				
//				tooltip : 'Expand all elements',
				tooltip : '全部展开',
				scope   : this,
				handler : function() { this.treePanel.expandAll(); }
			},"-",{
				text    : '全部折叠',
//				fuhongyi 20100727 修改提示	
//				tooltip : 'Collapse all elements',
				tooltip : '全部折叠',
				scope   : this,
				handler : function() { this.treePanel.collapseAll(); }
			}]
		});

    var root = new Ext.tree.TreeNode({
        text      : '组件',
		id        : this.getNewId(),
        draggable : false
    });
    tree.setRootNode(root);

		tree.on('click', function(node, e) {
			/**chenjian 20130417 add 增加为undefined的判断*/
			if(typeof e != 'undefined')e.preventDefault();
			if (!node.fEl || !node.fEl.el) { return; }
			this.highlightElement(node.fEl.el);
			this.setCurrentNode(node);
			window.node = node; // debug
		}, this);

		// clone a node
		var cloneNode = function(node) {
			var config = Ext.apply({}, node.elConfig);
			delete config.id;
			var newNode = new Ext.tree.TreeNode({id:this.getNewId(),text:this.configToText(config)});
			//xiaoxiong 20120911 将复制组建的原型组建的name字段的值修改为“FORMBUILDER_FIELD” 使其标记为新添加组建 start
			var str=FormBuilderMain.JSON.encode(config);
			var tempstr=str.substring(1,str.length-1);
			var temparr=tempstr.split(',');
			var newconfig='{';
			for(var a=0;a<temparr.length;a++){
				var pAndv=temparr[a].split(':');
				if(pAndv[0].trim() == 'name'){
					newconfig=newconfig+'name:\"FORMBUILDER_FIELD\",';
				}else{
					newconfig=newconfig+temparr[a]+',';
				}
			}
			newconfig=newconfig.substring(0,newconfig.length-1)+'}';
			newNode.elConfig = Ext.util.JSON.decode(newconfig);
			//xiaoxiong 20120911 将复制组建的原型组建的name字段的值修改为“FORMBUILDER_FIELD” 使其标记为新添加组建 end

			// clone children
			for(var i = 0; i < node.childNodes.length; i++){
				n = node.childNodes[i];
				if(n) { newNode.appendChild(cloneNode(n)); }
			}

			return newNode;

		}.createDelegate(this);

		// assert node drop
		tree.on('nodedragover', function(de) {
			var p = de.point, t= de.target;
			if(p == "above" || t == "below") {
					t = t.parentNode;
			}
			if (!t) { return false; }
			this.highlightElement(t.fEl.el);
			return (this.canAppend({}, t) === true);
		}, this);

		// copy node on 'ctrl key' drop
		tree.on('beforenodedrop', function(de) {
				if (!de.rawEvent.ctrlKey) {
					this.markUndo("Moved " + de.dropNode.text);
					return true;
				}
				this.markUndo("Copied " + de.dropNode.text);
        var ns = de.dropNode, p = de.point, t = de.target;
        if(!(ns instanceof Array)){
            ns = [ns];
        }
        var n;
        for(var i = 0, len = ns.length; i < len; i++){
						n = cloneNode(ns[i]);
            if(p == "above"){
                t.parentNode.insertBefore(n, t);
            }else if(p == "below"){
                t.parentNode.insertBefore(n, t.nextSibling);
            }else{
                t.appendChild(n);
            }
        }
        n.ui.focus();
        if(de.tree.hlDrop){ n.ui.highlight(); }
        t.ui.endDrop();
        de.tree.fireEvent("nodedrop", de);
				return false;
			}, this);

		// update on node drop
		tree.on('nodedrop', function(de) {
			var node = de.target;
			if (de.point != 'above' && de.point != 'below') {
				node = node.parentNode || node;
			}
			this.updateForm(false, node);
		}, this, {buffer:100});

		// get first selected node
		tree.getSelectedNode = function() {
			return this.selModel.getSelectedNode();
		};

		// context menu to delete / duplicate...
		var contextMenu = new Ext.menu.Menu({items:[{
		//jiangyuntao 20120328 edit 增加ID用于获得此组件
				id      : 'formbuilder_deleteCheckedEI',
				text    : '删除这个组件',
				iconCls : 'icon-deleteEl',
				scope   : this,
				handler : function(item) {
						this.removeNode(contextMenu.node);
					}
			}
			,{
			//jiangyuntao 20120328 edit 增加ID用于获得此组件
				id      :'formbuilder_copyCheckedEI',
				text    : '复制这个组件',
				iconCls : 'icon-dupEl',
				scope   : this,
				handler : function(item) {
						var node = contextMenu.node;
						//xiaoxiong 20110427 修改复制可以生成两个表单问题
						var cleanConfig = this.getTreeConfig();
						cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
						if(cleanConfig&&cleanConfig.xtype == 'form'){
							if(node.text.split(' ')[0] == 'form'){
								showMsg('操作被中止,不允许重复创建表单!','3');
								return ;
							}
						} 
						//end
						this.markUndo("Duplicate " + node.text);
						var newNode = cloneNode(node);
						if (node.isLast()) {
							node.parentNode.appendChild(newNode);
						} else {
							node.parentNode.insertBefore(newNode, node.nextSibling);
						}
						this.updateForm(false, node.parentNode);
					}
			}
			,{
				text    : '修改大小 / 移动',
				tooltip : 'Visual resize the element.<br/>You can move it too if in an <b>absolute</b> layout',
				iconCls : 'icon-resize',
				scope   : this,
				handler : function(item) {
						this.visualResize(contextMenu.node);
					}
			}
			,{
				//jiangyuntao 20120328 edit 增加ID用于获得此组件
				id      : 'formbuilder_setExpressionForEI',
				text    : '设置字段表达式',
				iconCls : 'icon-addEl',
				scope   : this,
				handler : function(item) {
					if(contextMenu.node.elConfig.xtype=='numberfield'){
					var tempId=contextMenu.node.elConfig.tempid;
					var expressionid='';
					var ischeck='true';
					if(tempId.indexOf('expression')>=0){
						//showMsg('消息','此字段已被设置表达式,重新设置将覆盖原有的表达式!');
						ischeck='false';
					}
					var check='false';
					var sign='';
					var saveExpression='';
					var clearExpression='false';
					var checkedRadioId = '';
						//showMsg('消息',contextMenu.node.elConfig.xtype);
						
						var cleanConfig = this.getTreeConfig();
						cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
						var formid=cleanConfig.id;
						if(formid == null){
							formid = "";
						}
						$.post( $.appClient.generateUrl({ESFormBuilder : 'queryExpression'}, 'x')
								,{formid:formid}, function(res){
								
								var json = eval("("+res+")") ; 
								
								erpresslist=json.list;					
								
								if(erpresslist && erpresslist.length>0) ischeck='false'; //jiangyuntao 20101012 edit 如果表单式数组长度大于0，则进行显示。
								descs=json.descs;
								if(ischeck=='true'){
									tempId='expression'+json.count;
								}else{
									for(var i=0;i<erpresslist.length;i++){
										var  showtemp=erpresslist[i].split('=');
										if(showtemp[0]==expressionid){
											var showthis=showtemp[1].replace(/\+/g,' ').replace(/\-/g,' ').replace(/\*/g,' ').replace(/\//g,' ').replace(/\(/g,' ').replace(/\)/g,' ').split(' ');
											for(var index=0;index<showthis.length;index++){
												if(showthis[index].indexOf('radio_') > -1){//xiaoxiong 20101014
													//gaoyide 20141008 bug937
													showtemp[1] = showtemp[1].replace(showthis[index],Ext.getCmp("expressionForm1").findById(showthis[index]).boxLabel);
												}
											}
											erpresslist[i] = erpresslist[i].replace(erpresslist[i].split('=')[1],showtemp[1]);
											erpresslist[i]=erpresslist[i].replace(showtemp[0],Ext.getCmp("expressionForm1").findById(showtemp[0]).boxLabel);
											Ext.getCmp("expressionForm1").form.findField('expression123').setValue(erpresslist[i].split('=')[1]);
											Ext.getCmp("expressionForm1").form.findField('expression_desc').setValue(descs[i]);
											check='true';
											saveExpression=showtemp[1];
										}
									}
								}
							});
						 
						cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
						var nodearys=cleanConfig.split('\n');	
						var tempjsarys=[];
						var radioNoArys='';//xiaoxiong 20101014
						var radioBoxLabelArys='';//xiaoxiong 20101014
						var count=0;
						var tempcheck;
						for(var i=0;i<nodearys.length;i++){
							if(nodearys[i].indexOf('xtype:"numberfield"')>=0){
								count=count+1;
								tempcheck=i;
								do{
									tempcheck=tempcheck+1;
									var tempfind=nodearys[tempcheck];
								}while(tempfind.indexOf('fieldLabel:')<0);
								var tempjs='';
								if(contextMenu.node.elConfig.fieldLabel==tempfind.substring(tempfind.indexOf('"')+1,tempfind.lastIndexOf('"'))){
									expressionid='radio_'+count;
								}
								tempjs=tempjs+'{';
								tempjs=tempjs+'xtype:"radio",';
								tempjs=tempjs+'id:\'radio_'+count+'\',';
								tempjs=tempjs+'name:"check1",';
								tempjs=tempjs+'hideMode :"offsets",';//xiaoxiong 20120410 设置组件的隐藏模式
								tempjs=tempjs+'fieldLabel:"123",';
								tempjs=tempjs+'maxLength:10,';
								tempjs=tempjs+'hideLabel:true,';
								tempjs=tempjs+'boxLabel:"'+count+'_'+tempfind.substring(tempfind.indexOf('"')+1,tempfind.lastIndexOf('"'))+'",';
								tempjs=tempjs+'inputValue:"radiovalue",';
								tempjs=tempjs+'clearCls:"allowFloat"';
								tempjs=tempjs+'},';
								tempjsarys[count-1]=tempjs;
								radioNoArys = radioNoArys + 'radio_' + count + ';';//xiaoxiong 20101014
								radioBoxLabelArys = radioBoxLabelArys + count + '_' + tempfind.substring(tempfind.indexOf('"')+1,tempfind.lastIndexOf('"')) + ';' ;//xiaoxiong 20101014
							}
						}
			
						//xiaoxiong 20101014				
						function getSelectedText(textbox){   
							    if (document.selection){
							       return document.selection.createRange().text;   
							    }   
							    else {   
							       return textbox.value.substring(textbox.selectionStart,   
							           textbox.selectionEnd);   
							    }   
						} 
						//end
						 new Ext.Window({
			     			 id:'showSetExpression',
						     modal  : true,
					     	 width : 550,
					     	  title: '设置表达式',
						     height : 500,
				     		 //maximizable : true,
				     		 resizable : false,//xiaxiong 20101014
		                     autoScroll:false,
						     layout : 'fit',
						     plain : true,
						   //  tbar:new Ext.Toolbar({id:'"+this.name+"toolbar_id' , items:[{handler:function(){if(check=='false'){showMsg('提示','请选择表达式子计算字段');}else{sign='+';check='false';}},text:'+' }
		                 		 // ,'-',{handler:function(){if(check=='false'){showMsg('提示','请选择表达式子计算字段');}else{sign='-';check='false';}}, text:'-'}
		                 		//  ,'-',{handler:function(){if(check=='false'){showMsg('提示','请选择表达式子计算字段');}else{sign='*';check='false';}}, text:'*'}
		                 		 // ,'-',{handler:function(){if(check=='false'){showMsg('提示','请选择表达式子计算字段');}else{sign='/';check='false';}}, text:'/'}
						    //xiaoxiong 20101014
							 tbar:new Ext.Toolbar({id:'"+this.name+"toolbar_id' , items:[
		                 		  {handler:function(){//xiaoxiong 20101108 修改清空方法
		                 		  		if(Ext.getCmp("expressionForm1").form.findField('expression123').getValue() != ''){
		                 		  			//gengqianfeng 20140925 取消清空请求
//		                 		  			$.post( $.appClient.generateUrl({ESFormBuilder : 'dropExpression'}, 'x')
//		                 							,{expressionid:expressionid , formid:formid}, function(res){
		                 		  					//gengqianfeng 20140925 清除标签内容
					                 		  		Ext.getCmp("expressionForm1").form.findField('expression123').setValue('');
					                 		  		Ext.getCmp("expressionForm1").form.findField('expression_desc').setValue('');
					                 		  		clearExpression='true';
//											});
		                 		  		}
		                 		  		saveExpression='';
		                 		  		check='false';
		                 		  		if(sign != ''){
		                 		  			Ext.getCmp('noColorButton' + sign).setVisible(true);
		                 		  			Ext.getCmp('colorButton' + sign).setVisible(false);
		                 		  			}
		                 		  		sign='';
		                 		  		if(checkedRadioId != ''){Ext.getCmp("expressionForm1").findById(checkedRadioId).setValue(false);}
		                 		  	}, 
		                 		  	text:'清空',
		                 		  	iconCls:'formbuilder_cross'
		                 		  	},'-',{handler:function(){if(saveExpression==''){
		                 		  			//gengqianfeng 20140925 保存清空请求
		                 		  			if(clearExpression=='true'){
			                 		  			$.post( $.appClient.generateUrl({ESFormBuilder : 'dropExpression'}, 'x')
			                						,{expressionid:expressionid , formid:formid}, function(res){
					                					if(res){
					                     		  			showMsg('保存成功','1');
					                     		  			clearExpression ='false';
					                     		  		}else{
					                     		  			showMsg('保存失败','3');
					                     		  		}
			                						});
			                 		  		}else{
//			                 		  			showMsg('请选择表达式子计算字段','3');
			                 		  			showMsg('保存成功','1');
			                 		  		}
		                 		  		}else{
      		for(var i=0;i<erpresslist.length;i++){
      			var temp=erpresslist[i].split('=');
      			var firstStr1=temp[0];
      			var firstStr2=temp[1];
      			var firstTemp=firstStr2.replace(/\+/g,' ').replace(/\-/g,' ').replace(/\*/g,' ').replace(/\//g,' ').replace(/\(/g,'').replace(/\)/g,'');
      			var lastStr1=expressionid;
      			var lastStr2=saveExpression;
      			var lastTemp=lastStr2.replace(/\+/g,' ').replace(/\-/g,' ').replace(/\*/g,' ').replace(/\//g,' ').replace(/\(/g,'').replace(/\)/g,'');
      			var firstcheck='false';
      			var lastcheck='false';
      			
      			var tempary1=firstTemp.split(' ');//alert(tempary1);
      			for(var index=0;index<tempary1.length;index++){
      				if(tempary1[index]==lastStr1||tempary1[index]==firstStr1){
      					firstcheck='true';
      				}
      			}
      			
      			var tempary2=lastTemp.split(' ');//alert(tempary2);
      			for(var index=0;index<tempary2.length;index++){
      				if(tempary2[index]==firstStr1||tempary2[index]==lastStr1){
      					lastcheck='true';
      				}
      			}
      			if(firstcheck=='true'&&lastcheck=='true'){showMsg('不合法,设置表达式的字段不能包含在表达式内,多个表达式时不能相互依赖（如A=B+C,C=B+A）','3');return;}
      			
      		}
      		var desc=Ext.getCmp("expressionForm1").form.findField('expression_desc').getValue();
  			$.post( $.appClient.generateUrl({ESFormBuilder : 'saveExpression'}, 'x')
					,{radioNoArys:radioNoArys,radioBoxLabelArys:radioBoxLabelArys,desc:desc,expression:expressionid+'='+saveExpression}, function(res){
					contextMenu.node.elConfig.tempid=tempId;
					Ext.getCmp('showSetExpression').destroy();
					//gengqianfeng 20140925 添加保存成功提示
					if(res){
						showMsg('保存成功','1');
					}else{
						showMsg('保存失败','3');
					}
				});
      		
      	}}, text:'保存',iconCls:'formbuilder_save'}
		                 		  ]}),
							//end
					     	 bodyStyle : 'padding:0px;'
					   });
					  var pwd = new Ext.form.FormPanel({
					  	id:'expressionForm1',
					  	defaults: {itemCls :'floatLeft'},
      labelWidth: 125,
      frame: true,
	  //xiaoxiong 20101014
	  tbar:new Ext.Toolbar({id:'"+this.name+"toolbar_id' , items:[
	  								   {id:'noColorButton + ',handler:function(){if(sign != ''){Ext.getCmp('noColorButton' + sign).setVisible(true);Ext.getCmp('colorButton' + sign).setVisible(false);}sign=' + ';this.hide();Ext.getCmp('colorButton + ').setVisible(true);check='false';if(checkedRadioId != ''){Ext.getCmp("expressionForm1").findById(checkedRadioId).setValue(false);}},text:'+' }
	  								   ,{id:'colorButton + ',text:'<span style=\'color:#ff0000;font-size:16px;font-weight:600;\'>+</span>',style:'background-color:#ffffff',hidden:true }
		                 		  ,'-',{id:'noColorButton - ',handler:function(){if(sign != ''){Ext.getCmp('noColorButton' + sign).setVisible(true);Ext.getCmp('colorButton' + sign).setVisible(false);}sign=' - ';this.hide();Ext.getCmp('colorButton - ').setVisible(true);check='false';if(checkedRadioId != ''){Ext.getCmp("expressionForm1").findById(checkedRadioId).setValue(false);}}, text:'-'}
	  								   ,{id:'colorButton - ',text:'<span style=\'color:#ff0000;font-size:16px;font-weight:600;\'>-</span>',style:'background-color:#ffffff',hidden:true }
		                 		  ,'-',{id:'noColorButton * ',handler:function(){if(sign != ''){Ext.getCmp('noColorButton' + sign).setVisible(true);Ext.getCmp('colorButton' + sign).setVisible(false);}sign=' * ';this.hide();Ext.getCmp('colorButton * ').setVisible(true);check='false';if(checkedRadioId != ''){Ext.getCmp("expressionForm1").findById(checkedRadioId).setValue(false);}}, text:'*'}
	  								   ,{id:'colorButton * ',text:'<span style=\'color:#ff0000;font-size:16px;font-weight:600;\'>*</span>',style:'background-color:#ffffff',hidden:true }
		                 		  ,'-',{id:'noColorButton / ',handler:function(){if(sign != ''){Ext.getCmp('noColorButton' + sign).setVisible(true);Ext.getCmp('colorButton' + sign).setVisible(false);}sign=' / ';this.hide();Ext.getCmp('colorButton / ').setVisible(true);check='false';if(checkedRadioId != ''){Ext.getCmp("expressionForm1").findById(checkedRadioId).setValue(false);}}, text:'/'}
	  								   ,{id:'colorButton / ',text:'<span style=\'color:#ff0000;font-size:16px;font-weight:600;\'>/</span>',style:'background-color:#ffffff',hidden:true }
		                 		  ,'-',{handler:function(){
		                 		  		var tempOldStr = Ext.getCmp("expressionForm1").form.findField('expression123').value ;//selectText 
		                 		  		var selectStr = getSelectedText(Ext.getCmp("expressionForm1").form.findField('expression123')) ;
		                 		  		var tempNewStr = '' ;
		                 		  		if(selectStr != null && selectStr != ''){
		                 		  			var startNo = tempOldStr.indexOf(selectStr) ;
		                 		  			tempNewStr = tempOldStr.substring(0 , startNo) + ' (' + selectStr + ') ' + tempOldStr.substring(startNo + selectStr.length) ;
		                 		  		} else {
		                 		  			tempNewStr = ' (' + tempOldStr + ') ' ;
		                 		  		}
		                 		  		
     									Ext.getCmp("expressionForm1").form.findField('expression123').setValue(tempNewStr);
     									saveExpression = tempNewStr ;
     									}, text:'优先( )'}
		                 		  ,'-',{handler:function(){
     									var v=Ext.getCmp("expressionForm1").form.findField('expression123').value;
     									v = v.trim();
     									var selectStr = getSelectedText(Ext.getCmp("expressionForm1").form.findField('expression123')) ;
     									if(v.indexOf('(')==0 && v.lastIndexOf(')')==v.length-1 && (selectStr == null || selectStr.trim() == '')){
     										v=v.substring(1);
     										v=v.substring(0,v.length-1);
     										Ext.getCmp("expressionForm1").form.findField('expression123').setValue(v);
     										//saveExpression=saveExpression.substring(1);
     										//saveExpression=saveExpression.substring(0,saveExpression.length-1);
     										saveExpression = v ;
     									} else if(selectStr != null && selectStr.trim() != ''){
     										selectStr = selectStr.trim() ;
     										if(selectStr.indexOf('(')==0 && selectStr.lastIndexOf(')')==selectStr.length-1){
     											selectLengh = selectStr.length ;
     											var startNo = v.indexOf(selectStr) ;
     											selectStr=selectStr.substring(1);
     											selectStr=selectStr.substring(0,selectStr.length-1);
     											var tempNewStr = v.substring(0 , startNo) + selectStr + v.substring(startNo + selectLengh) ;
     											Ext.getCmp("expressionForm1").form.findField('expression123').setValue(tempNewStr);
     											//saveExpression=saveExpression.substring(1);
     											//saveExpression=saveExpression.substring(0,saveExpression.length-1);
     											saveExpression = tempNewStr;
     										}
     									}
     									}, text:'取消优先'}]}),
		//end
      bodyStyle:'padding:5px 5px 0',
      width : 550,
      defaults: {
        width : 379,
        inputType: 't'
      },
      defaultType: 'textfield'
      //items: [{
      //	xtype:'label',
     // 	text:'为"'+contextMenu.node.elConfig.fieldLabel+'"设置表达式'
      //}]
    });		
     				//var expressionField=new Ext.form.FieldSet({id:'expressionFieldset1',title:'表达式字段',collapsible:true,clearCls:'allowFloat',autoWidth: true,autoHeight:true});
     				var expressionField=new Ext.form.FieldSet({id:'expressionFieldset1',title:'表达式字段',collapsible:true,clearCls:'allowFloat',autoWidth: true,height:200,autoScroll:true});//xiaoxiong 20100714 edit
					for(var ind=1;ind<=count;ind++){
						//Ext.getCmp("expressionForm1").add(Ext.util.JSON.decode(tempjsarys[ind-1].substring(0,tempjsarys[ind-1].length-1)));
						expressionField.add(Ext.util.JSON.decode(tempjsarys[ind-1].substring(0,tempjsarys[ind-1].length-1)));
					}  
					Ext.getCmp('expressionFieldset1').doLayout();
					Ext.getCmp("expressionForm1").add(expressionField);
					//xiaoxiong 20101014
					for(var ind=1;ind<=count;ind++){
						Ext.getCmp("expressionForm1").findById('radio_'+ind).on('check',function(r,c){
							if(c){
          						if(check=='false'){
          							var tempExpression = Ext.getCmp("expressionForm1").form.findField('expression123').value+sign+this.boxLabel ;
          							Ext.getCmp("expressionForm1").form.findField('expression123').setValue(tempExpression) ;
          							//saveExpression=saveExpression+sign+this.id;
          							saveExpression = tempExpression ;
          							//alert(saveExpression);
          							if(sign != ''){
	          							Ext.getCmp('noColorButton' + sign).setVisible(true);
	          							Ext.getCmp('colorButton' + sign).setVisible(false);
          							}
          							check='true';
          							checkedRadioId = this.id ;
          						}else{
          							showMsg('请先选择符号','3');
          							//this.checked = false ;
          							this.setValue(false) ;
          						}
          					}	
						});
					}
					//xiaoxiong 20120410 将要设置组件隐藏
					Ext.getCmp("expressionForm1").findById(expressionid).setVisible(false);
					Ext.getCmp("expressionForm1").doLayout();
					//Ext.getCmp("expressionForm1").add(Ext.util.JSON.decode('{id:\'isInputFieldLabel\',enableKeyEvents:true,fieldLabel: \'固定参数（如：2）\',name:\'ggg\'}'));
					Ext.getCmp("expressionForm1").add(Ext.util.JSON.decode('{id:\'isInputFieldLabel\',xtype:\'numberfield\',enableKeyEvents:true,fieldLabel: \'固定参数（如：12）\',name:\'ggg\'}'));
					Ext.getCmp("expressionForm1").findById('isInputFieldLabel').on('blur',function(r){
						if(this.getValue()==null||this.getValue()=='')return;
						if(check=='false'){
							if(this.getValue() < 0){showMsg('固定参数不能为负值！','3'); this.setValue(''); return ;}
							var tempExpression = Ext.getCmp("expressionForm1").form.findField('expression123').value+sign+this.getValue() ;
							Ext.getCmp("expressionForm1").form.findField('expression123').setValue(tempExpression) ;
          					//saveExpression=saveExpression+sign+this.getValue();
          					saveExpression = tempExpression;
          					//showMsg('提示',saveExpression);
   							if(sign != ''){
    							Ext.getCmp('noColorButton' + sign).setVisible(true);
    							Ext.getCmp('colorButton' + sign).setVisible(false);
   							}
          					check='true';
          					this.setValue('');
						}else{
							showMsg('请先选择符号','3');
							this.checked = false ;
							this.setValue('');
						}
					});
					/**shimiao 201305  不支持  '""\%**/
					Ext.getCmp("expressionForm1").add(Ext.util.JSON.decode('{id:\'expression1\',xtype:\'textarea\',fieldLabel: \'表达式\',value:"",name: \'expression123\',readOnly:true}'));
					Ext.getCmp("expressionForm1").add(Ext.util.JSON.decode('{xtype:\'textarea\',fieldLabel: \'表达式描述\',regex:/^[^\'\"\\\\%]*$/,regexText:\'表达式描述不包含英文单双引号、反斜杠以及百分号！\',name: \'expression_desc\',disableKeyFilter :false}'));
					   		Ext.getCmp('showSetExpression').add(Ext.getCmp('expressionForm1'));
					   		Ext.getCmp('showSetExpression').setTitle('为"'+contextMenu.node.elConfig.fieldLabel+'"设置表达式');
					   		Ext.getCmp('showSetExpression').show();
						contextMenu.node.elConfig.value='aaa';
					}else{
						showMsg('只有数字字段才能设置表达式','3');
						//new Ext.FormPanel({xtype:"form",id:'formBuilder_formId16',title:"表单",collapsible:true,defaults:{  itemCls:"floatLeft"},style:"padding:19px 45px;background:#848484",autoScroll:true,items:[{    xtype:"numberfield",id:'radio_1',

					}
				}
			}
			//end

			,{//jiang 20100107
				//jiangyuntao 20120328 edit 增加ID用于获得此组件
				id      : 'formbuilder_relationComboForEI',
				text    : '关联数据字典',
				iconCls : 'formbuilder_book_link',
				scope   : this,
				handler : function(item) {
					// 只有是下拉框才能关联枚举
					if(contextMenu.node.elConfig.xtype=='combo'){
						Ext.getCmp('formbuilder_relationComboForEI').contextMenu = contextMenu ;
						formBuilderManage.relationComboMetadata();
						
////							设置的 value值 为 用户选择的 枚举 标识
//							var cb= new Ext.grid.CheckboxSelectionModel({singleSelect:true});
//							//jiangyuntao add
//							var checkColumnModel=new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),
//																		   cb,
//								                                          {header : '下拉框名称',dataIndex : 'comboValue'}, 
//								                                          {header : '类型',dataIndex : 'estype'},
//								                                          {header : '描述',dataIndex : 'describe'}]); 
//							var store = new Ext.data.Store({
//								proxy : new Ext.data.HttpProxy({ 
//		   							url:'formBuilderManager.html?method=getcombo' 
//								}), 
//			  					reader : new Ext.data.JsonReader({ 
//			   						totalProperty : 'size', 
//			   						root : 'data' }, 
//			   						[{name : 'id'}, {name : 'identifier'}, { name : 'comboValue'}, {name : 'estype'}, { name : 'dataurl'},{ name : 'describe'}]) 
//			  					}); 
//			  					store.load({
//			 					 	params : { 
//			   						start : 0, 
//			   						limit : 10 
//			   					} 
//			 				}); 
//			 			   var checkComboGrid = new Ext.grid.GridPanel({
//			                	id:'checkcob',
//			                	store:store,
//							   	cm:checkColumnModel,
//			                	sm:cb,
//			                	stripeRows 	: true,
//							   	width:  420,
//							   	height: 350,
//			                	tbar:new Ext.Toolbar({id:'checkcom_toolbar_id' , items:[{id:'checkcom_checkCom_button_id',iconCls:'tick' ,handler:combo_check,text:'选择' },
//			                		{id:'thiseditWorkflowCombo_button_id' , text:'数据字典',iconCls:'book',handler:editWorkflowCombo_event} 
//			                		
//			                		//jiangyuntao 20120406 edit 为定制表单时选择数据字典增加检索功能。
//			                		,'->','请输入搜索词',new Ext.app.SearchField({id:'newFormbuilder_serarchKeyword',name:'new_userSearchKeyword', width:100, allowBlank:false,
//			                		    onTrigger2Click:function(){
//		   									this.triggers[0].show();this.hasSearch = false;
//		    								var seachkey = Ext.getCmp('newFormbuilder_serarchKeyword').getValue();
//			      							if(!Ext.getCmp('newFormbuilder_serarchKeyword').isValid())return;
//			      							var searchstore = new Ext.data.Store({
//			      								baseParams  : {seachvalue:seachkey},
//												proxy : new Ext.data.HttpProxy({ 
//		   										url:'formBuilderManager.html?method=getcombo' 
//											}), 
//			  								reader : new Ext.data.JsonReader({ 
//			   									totalProperty : 'size', 
//			   									root : 'data' }, 
//			   									[{name : 'id'}, {name : 'identifier'}, { name : 'comboValue'}, {name : 'estype'}, { name : 'dataurl'},{ name : 'describe'}]) 
//			  								}); 
//			  								Ext.getCmp('checkcob').reconfigure(searchstore,checkColumnModel);
//			      							Ext.getCmp('checkcom_pageBar').bind(searchstore);
//			  								searchstore.load({
//			 					 				params : { 
//			   									start : 0, 
//			   									limit : 10 
//			   								} 
//			 							}); 
//			      						},
//			      						onTrigger1Click:function(){
//			      							Ext.getCmp('checkcob').reconfigure(store,checkColumnModel);
//			      							Ext.getCmp('checkcom_pageBar').bind(store);
//			      							store.load({params : {start : 0,limit : 10}});
//			      							this.triggers[0].hide();this.el.dom.value = '';this.hasSearch = false; 
//			      						}})
//			                				            
//			                 	]}) ,
//			                	bbar : new Ext.PagingToolbar({
//			                       id:'checkcom_pageBar',  
//					               pageSize : 10,
//					               store: store,
//					               displayInfo : true
////					               emptyMsg : '',
////					               displayMsg : '"+PkgTagUtils.message(pageContext, "os.pagbarTip")+"'
//			                     }),
//			                	collapsible : false,
//			                	collapsed : false    
//				    		}) ; 
//				        new Ext.Window({
//			     			 id:'showCheckCom',
//					     	 title : '关联数据字典',
//						     modal  : true,
//					     	 width : 420,
//						     height : 350,
//				     		 maximizable : false,
//		                     autoScroll:false,
//						     layout : 'fit',
//						     plain : true,
//					     	 bodyStyle : 'padding:0px;'
//					   });
//				    		
//					   		Ext.getCmp('showCheckCom').add(checkComboGrid);
//					   		Ext.getCmp('showCheckCom').show();
//					   		// jiang20101120 add element destroy;
//					   		Ext.getCmp('showCheckCom').on('close',function(){
//					   			Ext.destroy(cb,checkColumnModel,store,checkComboGrid);
//					   			cb=null;
//					   			checkColumnModel=null;
//					   			store=null;
//					   			checkComboGrid=null;
//					   			Ext.getCmp('showCheckCom').destroy();
//					   		});
//							//contextMenu.node.elConfig.value='store';
////							this.updateForm(true, contextMenu.node);
//					function editWorkflowCombo_event(selectionModel, rowIndex, selectedRecord) {
//						new Ext.Window({
//						id:'thiseditFormBuilderCombo',
//						title : '数据字典',
//						modal  : true,
//						width : 500, 
//						height : 600,
//						maximizable : true,
//			     		autoLoad:{url:'formBuilderManager.html?content.method=toEditFormBuilderCombo&parentWinId=thiseditFormBuilderCombo',nocache:true,scripts:true},
//			   			autoScroll:false,
//						layout : 'fit',
//						plain : true,
//						listeners :{close:function(){Ext.getCmp('checkcob').getStore().reload();}},
//						bodyStyle : 'padding:0px;'
//					})
//						Ext.getCmp('thiseditFormBuilderCombo').show();  
//				}
//						function combo_check() {
//					   			var select = checkComboGrid.getSelectionModel().getSelections();
//					   			if(select[0]==null){
//			      					showMsg('请勾选数据再进行关联!','3');
//			     					return false;
//			   					}
//			   					//alert(select[0].data.identifier);
//			   					contextMenu.node.elConfig.value=select[0].data.identifier;
//			   					Ext.getCmp('showCheckCom').destroy();
//			  					contextMenu.node.elConfig.comboRelation='true';
//			   					showMsg('关联成功！','1');
//					   	}
//					   		checkComboGrid.on('celldblclick',function(){
//				    			 var select = checkComboGrid.getSelectionModel().getSelections();
//			                   	 contextMenu.node.elConfig.value=select[0].data.identifier;
//			                     Ext.getCmp('showCheckCom').destroy();
//			                     contextMenu.node.elConfig.comboRelation='true';
//			                     showMsg('关联成功!','1');
//				    		});
					}else{
						showMsg('该字段不能关联数据字典！','3');
					}
					
					}
			   }
		 ]});
		tree.on('contextmenu', function(node, e) {
				e.preventDefault();
				if (node != this.treePanel.root) {
					contextMenu.node = node;
					
					//jiangyuntao 20120903 edit 点击整个form右键时，删除这个组件、复制这个组件选项禁用，否则可用。
					if(node.text.split(' ')[0] == 'form'){
						Ext.getCmp('formbuilder_deleteCheckedEI').disable();
						Ext.getCmp('formbuilder_copyCheckedEI').disable();
					}else{
						Ext.getCmp('formbuilder_deleteCheckedEI').enable();
						Ext.getCmp('formbuilder_copyCheckedEI').enable();
					}
					//jiangyuntao 20120903 edit 右键数值组件可设置字段表单式，其他禁用。右键下拉组件时可设置关联数据字典，其他禁用。
					if(node.text.split(' ')[0] == 'numberfield'){
						Ext.getCmp('formbuilder_setExpressionForEI').enable();
					}else{
						Ext.getCmp('formbuilder_setExpressionForEI').disable();
					}
					if(node.text.split(' ')[0] == 'combo'){
						Ext.getCmp('formbuilder_relationComboForEI').enable();
					}else{
						Ext.getCmp('formbuilder_relationComboForEI').disable();
					}
					
					
					contextMenu.showAt(e.getXY());
				}
			}, this);
		this.contextMenu = contextMenu;

		this.treePanel = tree;
	},

	// layer used for selection resize
	initResizeLayer : function() {

		this.resizeLayer = new Ext.Layer({cls:'resizeLayer',html:'Resize me'});
		this.resizeLayer.setOpacity(0.5);
		this.resizeLayer.resizer = new Ext.Resizable(this.resizeLayer, {
			handles:'all',
			draggable:true,
			dynamic:true});
		this.resizeLayer.resizer.dd.lock();
		this.resizeLayer.resizer.on('resize', function(r,w,h) {
				var n = this.editPanel.currentNode;
				if (!n || !n.elConfig) { return false; }
				this.markUndo("Resize element to " + w + "x" + h);
				var s = n.fEl.el.getSize();
				if (s.width != w) {
					n.elConfig.width = w;
					if (n.parentNode.elConfig.layout == 'column') {
						delete n.elConfig.columnWidth;
					}
				}
				if (s.height != h) {
					n.elConfig.height = h;
					delete n.elConfig.autoHeight;
				}
				this.updateForm(true, n.parentNode);
				this.setCurrentNode(n);
				this.highlightElement(n.fEl.el);
			}, this);
		this.resizeLayer.resizer.dd.endDrag = function(e) {
				var n = this.editPanel.currentNode;
				if (!n || !n.elConfig) { return false; }
				var pos = this.resizeLayer.getXY();
				var pPos = n.parentNode.fEl.body.getXY();
				var x = pos[0] - pPos[0];
				var y = pos[1] - pPos[1];
				this.markUndo("Move element to " + x + "x" + y);
				n.elConfig.x = x;
				n.elConfig.y = y;
				this.updateForm(true, n.parentNode);
				this.setCurrentNode(n);
				this.highlightElement(n.fEl.el);
		}.createDelegate(this);

	},

	// customized property grid for attributes
	initEditPanel : function() {

		var fields = [];
		for (var i in FormBuilderMain.FIELDS) {
			//alert(i);
			fields.push([i,i]);
		}//jiang20091119
		var newPropertyField = new Ext.form.ComboBox({
				mode           : 'local',
				valueField     : 'value',
				displayField   : 'name',
				width :  150,
				store          : new Ext.data.SimpleStore({
						sortInfo : {field:'name',order:'ASC'},
						fields   : ['value','name'],
						data     : fields
//						data     : [['id','id'],['name','name'],['name','name']]//jiang20091119
					})});
		newPropertyField.on('specialkey', function(tf,e) {
			var name = tf.getValue();
			var ds = this.editPanel.store;
			if (e.getKey() == e.ENTER && name != '' && !ds.getById(name)) {
				var defaultVal = "";
				if (this.attrType(name) == 'object') { defaultVal = "{}"; }
				if (this.attrType(name) == 'number') { defaultVal = 0; }
				ds.add(new Ext.grid.PropertyRecord({name:name, value:defaultVal}, name));
				this.editPanel.startEditing(ds.getCount()-1, 1);
				tf.setValue('');
			}
		}, this);

		var grid = new Ext.grid.PropertyGrid({
				id               :'propertygrid',
				title            : '属性',
				height           : 300,
				width            :         210 ,
				split            : true,
				region           : 'center',
				source           : {"名字": "不告诉你",   
        							"创建时间": new Date(Date.parse('12/15/2007')),   
        							"是否有效": false,   
        							"版本号": .01,   
        							"描述": "嗯，估计没啥可说的"  
				},
//				bbar             : ['增加属性:', newPropertyField ],
				customEditors    : FormBuilderMain.getCustomEditors(),
				beforefieldName :'',
				newPropertyField : newPropertyField
			});

		var valueRenderer = function(value, p, r) {
			if (typeof value == 'boolean') {
				p.css = (value ? "typeBoolTrue" : "typeBoolFalse");
				return (value ? "True" : "False");
			} else if (this.attrType(r.id) == 'object') {
				p.css = "typeObject";
				return value;
			} else {
				return value;
			}
		}.createDelegate(this);
		var propertyRenderer = function(value, p) {
			var t = FormBuilderMain.FIELDS[value];
			qtip = (t ? t.desc : '');
			p.attr = 'qtip="' + qtip.replace(/"/g,'&quot;') + '"';
			return value;
		};
		grid.colModel.getRenderer = function(col){
			return (col == 0 ? propertyRenderer : valueRenderer);
		};

		var contextMenu = new Ext.menu.Menu({items:[{
				id      : 'FBMenuPropertyDelete',
				iconCls : 'icon-delete',
				text    : '删除这个属性',
				scope   : this,
				handler : function(item,e) {
						this.markUndo('Delete property <i>' + item.record.id + '</i>');
						var ds = grid.store;
						delete grid.getSource()[item.record.id];
						ds.remove(item.record);
						delete item.record;
						this.updateNode(grid.currentNode);
						var node = grid.currentNode.parentNode || grid.currentNode;
						this.updateForm.defer(200, this, [false, node]);
					}
			}]});

		// property grid contextMenu
		grid.on('rowcontextmenu', function(g, idx, e) {
				e.stopEvent();
				var r = this.store.getAt(idx);
				if (!r) { return false; }
				var i = contextMenu.items.get('FBMenuPropertyDelete');
				i.setText('Delete property "' + r.id + '"');
				i.record = r;
				contextMenu.showAt(e.getXY());
			}, grid);
/*shimiao 20130530 对字段名称进行设置格式*/
			grid.on('beforeedit',function(e){
			  grid.beforefieldName = e.record.data['value'] ;
			});
       grid.on('afteredit',function(e){
       
           if( e.record.data['name']=='字段名称' || e.record.data['name']=='标题'){
           /*中文，英文，数字 -()（）*/
                var re = /^[a-zA-Z0-9\u4e00-\u9fa5-_()（）]*$/;
                if(!re.test(e.record.data['value'])){
                   showMsg(e.record.data['name'] + '只能由中文、英文、数字、下划线、中划线或（中英文）小括号组成！','3');
                   e.record.data['value']=grid.beforefieldName;
                   }
           }
       });


		// update node text & id
		grid.store.on('update', function(s,r,t) {
			if (t == Ext.data.Record.EDIT) {
				//r.id='title';
				this.markUndo('设置  <i>' + this.getCnByEn(r.id.trim()) + '</i> 为 "' +
					Ext.util.Format.ellipsis((String)(r.data.value), 20) + '"');
				var p = this.editPanel;
				var node = grid.currentNode;
				//20100115
				var currdata=grid.getStore().data;
				var t;
				var v;
				for(var index=0;index<currdata.length;index++){
					t=grid.getStore().getAt(index).data.name;
					v=grid.getStore().getAt(index).data.value;
					this.changeCnToEn(node,t,v);
				}
				this.updateNode(grid.currentNode);
				this.updateForm(false, node.parentNode || node);
			}
		}, this, {buffer:100});

		this.editPanel = grid;

	},

	// Components panel
	initComponentsPanel : function() {

		// components; config is either an object, or a function called with the adding function and parent config
		var check = true;  //是否进入‘加入的第一个组件是不是表单’验证   初始为验证，当第一个加入的是表单后，不再进行验证
		var createformcheck = false;  //是否进入‘重复表单验证’验证    初始为不验证，当加入表单后，都进行验证。
		var data = ExtComponents.getComponents();
		var ds = new Ext.data.SimpleStore({
			fields: ['category','name','description','config'],
			data : data
		});
		var tpl = new Ext.XTemplate(
			'<ul id="FormBuilderComponentSelector">',
			'<tpl for=".">',
				'<li class="component" qtip="{description}">{name}</li>',
			'</tpl>',
			'<div class="x-clear"></div>',
			'</ul>');
		new Ext.DataView({
			store        : ds,
			tpl          : tpl,
			overClass    : 'over',
			//jiangyuntao 20120328 edit 增加ID，用户获得此组件。
			id           : 'formbuilderTBDataView',
			selectedClass: 'selected',
			singleSelect : true,
			itemSelector : '.component'
			,height:32
		});
		
		Ext.getCmp('formbuilderTBDataView').on('click',function(v,idx,node,e){
			var cleanConfig = this.getTreeConfig();
			cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
			if(cleanConfig && cleanConfig.xtype == 'form'){
				check = false;
				createformcheck = true;
			}else{
				check = true;
				createformcheck = false;
			}
		},this);
		
		Ext.getCmp('formbuilderTBDataView').on('dblclick', function(v,idx,node,e) {
//				alert(v);
//				alert(idx);
//				alert(node);
//				alert(e);
				e.preventDefault();
				var n = this.editPanel.currentNode;
				if (!n) { return false; }
				var c = Ext.getCmp('formbuilderTBDataView').store.getAt(idx).data.config;
				if (!c) { return false; }
				//xiaoxiong 20110426 修改在表格上一个单元格内已经赋值静态文本后，在向里边添加组件BUG
				if(n.elConfig.html != null && n.elConfig.html != ' '){
					showMsg('父组件已经有值，值为：' + n.elConfig.html + '；' + '不能在此组件上再添加当前组件！','3');
					return ;
				}
				if(n.elConfig.html != null && n.elConfig.html == ' ' && n.childNodes.length == 1){
					showMsg('此组件已经有子，不能在此组件上再添加当前组件！','3');
					return ; 
				}
				//end
				if (typeof c == 'function') {
					c.call(this,function(config) {
//						alert(config);//jiang20091123
						
						var newNode = this.appendConfig(config, n, true, true);
					}, n.elConfig);
				} else {//jiang
//					config = n.elConfig;
//					var temp=this.getFormFieldName();
//					if(c.xtype=='form'){
//						c.id=this.getNewId();
//					}else if(c.xtype=='textfield'){
//						c.name=temp;
//					}else
//					if(c.xtype=='combo'){
//						c.id=temp;
//						c.name=temp;
						//c.setStore(comStore);
//						triggerAction: , mode: ,valueField :'value',displayField: 'name'
//						c.triggerAction = 'all';
//						c.mode ='local' ;
//						c.valueField = 'value';
//						c. displayField='name' ;
//						c.store=new Ext.data.SimpleStore({fields: ['name','value'],data:[['systemOrgan','systemOrgan'],['systemUser','systemUser']]});
//						alert(c.store);
//					}
//					else if(c.xtype=='textarea'){
//						c.name=temp;
////						c.id=temp;
//					}else if(c.xtype=='numberfield'){
//						c.name=temp;
////						c.id=temp;
//					}else if(c.xtype=='timefield'){
//						c.name=temp;
////						c.id=temp;
//					}else if(c.xtype=='checkbox'){
//						c.name=temp;
////						c.id=temp;
//					}else if(c.xtype=='radio'){
//						c.name=temp;
////						c.id=temp;
//					}else{
//					
//					}
//					alert(Main.JSON.encode(n.elConfig));//jiang20091123 父组件
//					var testnode=this.cloneConfig(c);
//					testnode.title='wocao';

					var cleanConfig = this.getTreeConfig();
					cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
					if(cleanConfig&&cleanConfig.xtype == 'form'){
						if(c.xtype && c.xtype =='form'){
							showMsg('操作被中止,不允许重复创建表单!','3');
							return ;
						}
					}else{
						if(c.xtype && c.xtype !='form'){
							showMsg('请先双击表单按钮','3');
							return ;
						}
					} 
					//  jiangjien and jiangyuntao 20100919
					// 往表格中添加组件时，根据目标组件的宽度调整要添加组件的宽度
					// start-------------------------
					var nconfig = n.elConfig;
					var tempCwidth;
					if(nconfig){
						if(nconfig.width && nconfig.html){
							tempCwidth = c.width;
							c.width=nconfig.width;
						}else{
							tempCwidth = c.width;
						}
					}
					// end -------------------------
					var newNode = this.appendConfig(this.cloneConfig(c), n, true, true);
					//  jiangjien and jiangyuntao 20100919
					// 调整完后重新还原组件的宽度。
					c.width = tempCwidth;
					//var newNode = this.appendConfig(testnode, n, true, true);
				}
			}, this);
		Ext.getCmp('formbuilderTBDataView').on('render', function() {
				var d = new Ext.dd.DragZone(Ext.getCmp('formbuilderTBDataView').el, {
						ddGroup         : 'component',
						containerScroll : true,
						getDragData     : function(e) {
								Ext.getCmp('formbuilderTBDataView').onClick(e);
								var r = Ext.getCmp('formbuilderTBDataView').getSelectedRecords();
								if (r.length == 0) { return false; }
								var el = e.getTarget('.component');
								if(r[0].data.config.xtype && r[0].data.config.xtype !='form' && check){
									showMsg('请先双击表单按钮','3');
									return ;
								}else{
									check = false;
									if(createformcheck && r[0].data.config.xtype && r[0].data.config.xtype =='form'){
										showMsg('操作被中止,不允许重复创建表单!','3');
										return ;
									}
									createformcheck = true;
								}
								
								if (el) {
									 return {ddel:el,compData:r[0].data};
								 }
							},
						getTreeNode : function(data, targetNode) {
								if (!data.compData) { return null; }
								//xiaoxiong 20110426 修改在表格上一个单元格内已经赋值静态文本后，在向里边添加组件BUG
								if(targetNode.elConfig.html != null && targetNode.elConfig.html != ' '){
									showMsg('此节点已经有值，值为：' + targetNode.elConfig.html + '；' + '不能在此节点上再添加当前组件！','3');
									return null; 
								}
								if(targetNode.elConfig.html != null && targetNode.elConfig.html == ' ' && targetNode.childNodes.length == 1){
									showMsg('此组件已经有子，不能在此组件上再添加当前组件！','3');
									return ; 
								}
								//end
								var c = data.compData.config;
								if (typeof c == 'function') {
									c.call(this,function(config) {
										var n = this.appendConfig(config, targetNode, true, true);
										this.setCurrentNode(n, true);
									}, targetNode.elConfig);
								} else {
									var n = this.appendConfig(this.cloneConfig(data.compData.config), targetNode, true, true);
									this.setCurrentNode(n, true);
									return n;
								}
								return null;

							}.createDelegate(this)
					});
				Ext.getCmp('formbuilderTBDataView').dragZone = d;
			}, this);  

		var filter = function(b) { ds.filter('category', new RegExp(b.text)); };
		var tb = ['<b>控件箱 : </b>', {
				text         : '全部',
				toggleGroup  : 'categories',
				enableToggle : true,
				pressed      : true,
				scope        : ds,
				handler      : ds.clearFilter
			}, '-'];
		var cats = [];
		ds.each(function(r) {
			var tokens = r.data.category.split(",");
			Ext.each(tokens, function(token) {
				if (cats.indexOf(token) == -1) {
					cats.push(token);
				}
			});
		});
		Ext.each(cats, function(v) {
			tb.push({
					text         : v,
					toggleGroup  : 'categories',
					enableToggle : true,
					handler      : filter
				});
			});

		var panel = new Ext.Panel({
			region:'north',
			height: 35,
			layout:'fit',
			autoScroll:false,
			items:[Ext.getCmp('formbuilderTBDataView')]
//			,tbar:tb//jiang note
		});

		panel.view = Ext.getCmp('formbuilderTBDataView');
		this.componentsPanel = panel;

	},

	// Undo history
	initUndoHistory : function() {
		this.undoHistoryMax = 20;
		this.undoHistory = [];
	},

	// add current config to undo
	markUndo : function(text) {
		this.undoHistory.push({text:text,config:this.getTreeConfig()});
		if (this.undoHistory.length > this.undoHistoryMax) {
			this.undoHistory.remove(this.undoHistory[0]);
		}
		this.updateUndoBtn();
	},

	// update undo button according to undo history
	updateUndoBtn : function() {
		if (this.undoHistory.length == 0) {
			Ext.ComponentMgr.get('FBUndoBtn').disable().setText('撒消');
		} else {
			Ext.ComponentMgr.get('FBUndoBtn').enable().setText('撒消 : ' +
				this.undoHistory[this.undoHistory.length-1].text);
		}
	},

	// undo last change
	undo : function() {
		var undo = this.undoHistory.pop();
		this.updateUndoBtn();
		if (!undo || !undo.config) { return false; }
		/**chenjian 20130417 modify 撤销操作中,表单名称没撤销掉的问题*/
		var node = this.setConfig(undo.config);
		this.treePanel.expandPath(node.getPath(),'',function(success, node){
			if(success){
				Ext.getCmp('formBuilderTree').fireEvent('click',node); 
			}
		});
		return true;
	},

	// return the node corresponding to an element (search upward)
	getNodeForEl : function(el) {
		var search = 0;
		var target = null;
		while (search < 10) {
			target = Ext.ComponentMgr.get(el.id);
			if (target && target._node) {
				return target._node;
			}
			el = el.parentNode;
			if (!el) { break; }
			search++;
		}
		return null;
	},

	// show the layer to visually resize / move element 
	visualResize : function(node) {
		if (node == this.treePanel.root || !node || !node.fEl) { return; }
		if (node.parentNode && node.parentNode.elConfig && node.parentNode.elConfig.layout == 'fit') {
			showMsg("You won't be able to resize an element" +
				" contained in a 'fit' layout.<br/>Update the parent element instead.",'2');
		} else {
			if (node.parentNode && node.parentNode.elConfig && node.parentNode.elConfig.layout == 'absolute') {
				this.resizeLayer.resizer.dd.unlock();
				this.resizeLayer.resizer.dd.constrainTo(node.parentNode.fEl.body);
			} else {
				this.resizeLayer.resizer.dd.lock();
			}
			this.resizeLayer.setBox(node.fEl.el.getBox());
			this.resizeLayer.show();
		}
	},

	// hide select layers (e is click event)
	hideHighligt : function(e) {
		if (e) { e.preventDefault(); }
		this.builderPanel.el.select('.selectedElement').removeClass('selectedElement');
		this.builderPanel.el.select('.selectedElementParent').removeClass('selectedElementParent');
	},
	// jiangyuntao 20100201 返回没有关联枚举的下拉框 名称；
	ComboIsReation : function(items,tempstr){
		for(var i=0;i<items.length;i++){
			if(items[i].items&&items[i].items.length>0){
				tempstr=this.ComboIsReation(items[i].items,tempstr);
			}
			if(items[i].xtype=='combo'&&items[i].comboRelation=='false'){
				
				tempstr=tempstr+items[i].fieldLabel+',';
			}
		}
		return tempstr;
	}
	,
	//jiangyuntao  20100115   将中文属性名称还原成英文属性名称
	changeCnToEn : function(node,t,v){
		if(t=='标题')node.elConfig.title=v;
		else if(t=='编号')node.elConfig.id=v;
		else if(t=='自动滚动条')node.elConfig.autoScroll=v;
		else if(t=='边框')node.elConfig.border=v;
		else if(t=='边框样式')node.elConfig.bodyStyle=v;
		else if(t=='主体边框')node.elConfig.bodyBorder=v;
		else if(t=='是否允许折叠')node.elConfig.collapsible=v;
		else if(t=='组件类型')node.elConfig.xtype=v;
		else if(t=='样式')node.elConfig.style=v;
		else if(t=='默认属性')node.elConfig.defaults=v;
		else if(t=='名称')node.elConfig.name=v;
		else if(t=='字段名称')node.elConfig.fieldLabel=v;
		else if(t=='宽度')node.elConfig.width=v;
		else if(t=='高度')node.elConfig.height=v;
		else if(t=='字段长度'){
					//node.elConfig.maxLength=v;
					//node.elConfig.maxLength = (v == ''?0:v);//xiaoxiong 20111009 当字段长度没有值时，将其赋值为0
					//jiangyuntao 20111017 edit 默认长度修改为10 
					node.elConfig.maxLength = (v == ''?10:v);
					//xiaoxiong 20110918 根据字段长更新正则验证规则
					if(this.configToText(node.elConfig).indexOf('numberfield') == 0){
						/**chenjian 20130329 修改正则*/
//						var realmaxlenth = v - 4 ;
						//var regexStr = '/^([-]*[0-9]{1,' + realmaxlenth + '})+([.]{1}[0-9]{1,3}){0,1}$/' ;
//						var regexStr = '/^([-]*[0-9]{1,' + realmaxlenth + '})+([.]{1}[0-9]{0,3}){0,1}$/' ;
						var regexStr = '/^([-]*[0-9]{1,' + v + '})+([.]{1}[0-9]{0,3}){0,1}$/' ;
						node.elConfig.regex = regexStr;
						node.elConfig.regexText = '此字段的最大长度为' + v + '，小数精度为3，您输入的值违反了此规则，请重新填写！';
					}
					//end
		}
		else if(t=='日期格式')node.elConfig.format=v;
		else if(t=='选择框名称')node.elConfig.boxLabel=v;
		else if(t=='文本内容')node.elConfig.html=v;
		else if(t=='是否允许为空')node.elConfig.allowBlank=v;
		else if(t=='空值提示')node.elConfig.emptyText=v;
		else if(t=='是否可以收缩')node.elConfig.collapsible=v;
		else if(t=='是否收缩')node.elConfig.collapsed=v;
		else if(t=='不允许下拉')node.elConfig.noShow=v;
	},
	//jiangyuntao  20100115  出入英文属性名称  获得对应的中文属性名称
	getCnByEn : function(en){
		if(en=='title'){return '标题';}
		else if(en=='id'){return '编号';}
		else if(en=='autoScroll'){return '自动滚动条';}
		else if(en=='border'){return '边框';}
		else if(en=='bodyStyle'){return '边框样式';}
		else if(en=='bodyBorder'){return '主体边框';}
		else if(en=='collapsible'){return '是否允许折叠';}
		else if(en=='xtype'){return '组件类型';}
		else if(en=='style'){return '样式';}
		else if(en=='defaults'){return '默认属性';}
		else if(en=='name'){return '名称';}
		else if(en=='fieldLabel'){return '字段名称';}
		else if(en=='width'){return '宽度';}
		else if(en=='height'){return '高度';}
		else if(en=='maxLength'){return '字段长度';}
		else if(en=='format'){return '日期格式';}
		else if(en=='boxLabel'){return '选择框名称';}
		else if(en=='html'){return '文本内容';}
		else if(en=='allowBlank'){return '是否允许为空';}
		else if(en=='emptyText'){return '空值提示';}
		else if(en=='collapsible'){return '是否可以收缩';}
		else if(en=='collapsed'){return '是否收缩';}
		else if(en=='noShow'){return '不允许下拉';}
		else{return en;}
	},
	//jiangyuntao  20100115   是否显示到属性列表    check中包含的为需要显示的
	isShowToGrid : function (v){
		var check='title,fieldLabel,width,height,maxLength,format,boxLabel,html,allowBlank,noShow,collapsible,collapsed';
		if(check.indexOf(v.trim())==-1){
			return 'false';
		}
		return 'true';
	},
	
	
	// set current editing node
	setCurrentNode : function(node, select) {
		try{// chenjian 20120910  add
			var p = this.editPanel;
			p.enable();
			if (!node || !node.elConfig) {
				p.currentNode = null;
				p.setSource({});
				p.disable();
			} else {
				config = node.elConfig;
				//jiangyuntao 20100115   显示propertygrid为中文  start
				var str=FormBuilderMain.JSON.encode(config);
				var tempstr=str.substring(1,str.length-1);
				var temparr=tempstr.split(',');
				var newconfig='{';
				for(var a=0;a<temparr.length;a++){
					var pAndv=temparr[a].split(':');
					//xiaoxiong 20111029 添加 id 判断 整个表单中有两个id 一个是整个组件的id 需要显示 一个是form组件的id 不需要显示
					if(temparr[0].indexOf("timefield") != -1 && pAndv[0].trim() == 'format'){
						continue ;
					}
					if(pAndv[0].trim() != 'id'){
						var isshow=this.isShowToGrid(pAndv[0]);
						if(isshow=='true'){
							newconfig=newconfig+this.getCnByEn(pAndv[0].trim())+temparr[a].substring(temparr[a].indexOf(':'))+',';
						}
					} else if(tempstr.indexOf("xtype") == -1){
						var isshow=this.isShowToGrid(pAndv[0]);
						if(isshow=='true'){
							newconfig=newconfig+this.getCnByEn(pAndv[0].trim())+temparr[a].substring(temparr[a].indexOf(':'))+',';
						}
					}else{
					//newconfig=newconfig+',';
					}
				//end
				}
				newconfig=newconfig.substring(0,newconfig.length-1)+'}';
				//chenjian 20120910 修改之前以逗号来截取时的异常（解决当为表格布局时删除最后一个出错）
				if(newconfig.charAt(0)!="{"){newconfig='{'+newconfig;};
				p.setSource(Ext.util.JSON.decode(newconfig));
				// end
				p.currentNode = node;
				if (node.fEl == this.builderPanel) {
					p.disable();
				}
			}
			if (select) {
				this.treePanel.expandPath(node.getPath());
				node.select();
			}
		}catch(Error){
		}
	},

	// update node text & id (if necessary)
	updateNode : function(node) {
		if (!node) { return; }
		node.setText(this.configToText(node.elConfig));
		if (node.elConfig.id && node.elConfig.id != node.id) {
//            node.getOwnerTree().unregisterNode(node);
			node.id = node.elConfig.id;
//            node.getOwnerTree().registerNode(node);
		}
	},

	// update the form at the specified node (if force or autoUpdate is true)
	updateForm : function(force, node) {
			//node = node || this.treePanel.root;
			node = this.treePanel.root;//xiaoxiong 20120401 为了组件拖动移动位置时可以正常的更新界面而修改
			//var updateTime = (node == this.treePanel.root);
			var time = null;

			// search container to update, upwards
			node = this.searchForContainerToUpdate(node);

			if (force === true || this.autoUpdate) {
				var config = this.getTreeConfig(node, true);
				time = this.setFormConfig(config, node.fEl);
				this.updateTreeEls(node.fEl);
				this.hideHighligt();

				// save into cookies jiang20091203
//				this.cookies.set('formbuilderconfig', this.getTreeConfig());
			}

			//if (time && updateTime) {
				// jiang 20091120
//				Ext.ComponentMgr.get('FBRenderingTimeBtn').setText('Rendering time : <i>' + time + 'ms</i>');
			//}
	},

	// load from cookies if present
	// jiang note 20091203
	loadConfigFromCookies : function() {
//		var c = this.cookies.get('formbuilderconfig');
//		if (c) {
//			try {
//				this.setConfig(c);
//			} catch(e) {
//				return false;
//			}
//			return true;
//		} else {
//			return false;
//		}
	},

	// search upware for a container to update
	searchForContainerToUpdate : function(node) {

		// search for a parent with border or column layout
		var found = null;
		var root = this.treePanel.root;
		var n = node;
		while (n != root) {
			if (n && n.elConfig &&
					(n.elConfig.layout == 'border' ||
						n.elConfig.layout == 'table' ||
						n.elConfig.layout == 'column')) {
				found = n;
			}
			n = n.parentNode;
		}
		if (found !== null) { return found.parentNode; }

		// no column parent, search for first container with items
		n = node;
		while (n != root) {
			if (!n.fEl || !n.fEl.items) {
				n = n.parentNode;
			} else {
				break;
			}
		}
		return n;
	},

	// hilight an element
	highlightElement : function(el) {
			this.resizeLayer.hide();
			if (el == this.builderPanel.el) { return; }
			if (el) {
				var elParent = el.findParent('.x-form-element', 5, true);
				this.hideHighligt();
				if (elParent) { elParent.addClass("selectedElementParent"); }
				el.addClass("selectedElement");
			}
	},

	// get the tree config at the specified node
	getTreeConfig : function(node, addNodeInfos) {
		if (!node) { node = this.treePanel.root; }
		var config = Ext.apply({}, node.elConfig);
		if (!config.id && addNodeInfos) { config.id = node.id; }
		for (k in config) {
			if (this.attrType(k) == 'object') {
				try { config[k] = Ext.decode(config[k]); } catch(e) {}
			}
		}
		if (addNodeInfos) { config._node = node; }
		var items = [];
		node.eachChild(function(n) {
			items.push(this.getTreeConfig(n, addNodeInfos));
		}, this);
		if (items.length > 0) {
			config.items = items;
		} else if (config.xtype == 'form') {
			config.items = {};
		} else {
			delete config.items;
		}
		return config;
	},

	// update node.fEl._node associations
	updateTreeEls : function(el) {
		if (!el) { el = this.builderPanel; }
		if (el._node) {
			el._node.fEl = el;
			// workaround for fieldsets
			if (el.xtype == 'fieldset') {
				el.el.dom.id = el.id;
			}
		}
		if (!el.items) { return; }
		try {
			el.items.each(function(i) {  this.updateTreeEls(i); }, this);
		} catch (e) {}
	},

	// node text created from config of el
	configToText : function(c) {
		var txt = [];
		c = c || {};
		if (c.xtype)      { txt.push(c.xtype); }
		if (c.fieldLabel) { txt.push('[' + c.fieldLabel + ']'); }
		if (c.boxLabel)   { txt.push('[' + c.boxLabel + ']'); }
		if (c.layout)     { txt.push('<i>' + c.layout + '</i>'); }
		if (c.title)      { txt.push('<b>' + c.title + '</b>'); }
		if (c.text)       { txt.push('<b>' + c.text + '</b>'); }
		if (c.region)     { txt.push('<i>(' + c.region + ')</i>'); }
		return (txt.length == 0 ? "Element" : txt.join(" "));
	},

	// return type of attribute
	attrType : function(name) {
		if (!FormBuilderMain.FIELDS[name]) { return 'unknown'; }
		return FormBuilderMain.FIELDS[name].type;
	},

	// return a cloned config
	cloneConfig : function(config) {
		if (!config) { return null; }
		var newConfig = {};
		for (i in config) {
			if (typeof config[i] == 'object') {
				newConfig[i] = this.cloneConfig(config[i]);
			} else if (typeof config[i] != 'function') {
				newConfig[i] = config[i];
			}
			//alert(config[i]);//jiang 20091124
		}
		return newConfig;
	},

	// erase all
	resetAll : function() {
   
		//jiangyuntao 20120328 edit 新建时判断是否已进行表单定制，如果是，则提示是否保存现有成果后，再重置表单编辑区域。
		var cleanConfig = this.getTreeConfig();
		cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
		cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
		var local = this ;
		//jiangyuntao 20120328 edit 通过osFormBuilder_hidden_formPkID的value值获得当前form的ID，用户判断是修改还是新建。
		var pkId = Ext.getCmp('osFormBuilder_hidden_formPkID').getValue();
        var isCreate = (pkId == null || pkId == 'null');
        
        //jiangyuntao 20120906 edit 增加alertText，用于区分修改时新建和新建时新建的提示，修复bug5264
		if(cleanConfig && cleanConfig.length!=4){
			//jiangyuntao 20120912 edit 判断点新建时是否修改，修改时提示是否保存，未修改时直接新建，如果是新建的空表单，再点新建，不提示是否保存。
			if(pkId && pkId != 'null'){
				var ischange = false ;
				$.post( $.appClient.generateUrl({ESFormBuilder : 'getFormJs'}, 'x')
				//longjunhao 20140612 formId
						,{formId:pkId}, function(res){
						var json = eval("(" + res + ")") ;
		        		var queryJs = json.formJs;
		        		if(queryJs){
		        			var tempQueryJs = queryJs.replace(/\'/g,'"').trim().split('\n');  //将所有‘替换为“，再按\n进行拆分
		        			var tempCleanConfig = cleanConfig.trim().split('\n');
		        			if(tempQueryJs.length != tempCleanConfig.length){
		        				ischange = true ;
		        			}else{
		        				for(var i = 0;i<tempQueryJs.length ; i++){
		        					if(tempQueryJs[i].trim() != tempCleanConfig[i].trim()){
		        					//jiangyuntao 20121030 edit 修复bug5706，比较是否已改变时，不比较名称属性。如果已改变，不采用return，采用break；
		        						if(tempCleanConfig[i].trim()!='name:"FORMBUILDER_FIELD",'){
		        							ischange = true ;
		        							break;
		        						}
		        					}
		        				}
		        			}
		        		}else{
		        			ischange = true ;
		        		}
		        		if(ischange){
		        			Ext.MessageBox.show({    
        					title:"保存数据",    
       	 					msg:"是否保存当前表单内容？",    
        					buttons:Ext.Msg.YESNOCANCEL,    
        					fn:function saveFormChange(btn){
        					if(btn=='yes'){
        						saveForm(local);
        					}else if(btn =='no'){
								local.resetAllAndAddForm(local);
        					}else{
        				
        					}
        				},    
        					icon:Ext.MessageBox.QUESTION});  
		        		}else{
		        			local.resetAllAndAddForm(local,true);
		        		}
		    	});
			}else{
				if(cleanConfig.length == 155){
					local.resetAllAndAddForm(local,true);
					return ;
				}else{
					Ext.MessageBox.show({    
        				title:"保存数据",    
       	 				msg:"是否保存当前表单内容？",    
        				buttons:Ext.Msg.YESNOCANCEL,    
        				fn:function saveFormChange(btn){
        					if(btn=='yes'){
        						saveForm(local);
        					}else if(btn =='no'){
								local.resetAllAndAddForm(local);
        					}else{
        				
        					}
        				},    
        			icon:Ext.MessageBox.QUESTION});  
				}
			}
		}else{
			local.resetAllAndAddForm(local,false);
		}
	},
	
	resetAllAndAddForm : function(local,resetId){
		if(resetId)Ext.getCmp('osFormBuilder_hidden_formPkID').setValue('');
        var w = local.viewport.layout.center.getSize().width - 50;
		var node = local.setConfig({items:[]});
		local.setCurrentNode(node, true);
		if(!FormBuilderMain.isUpdate){
			var n = local.editPanel.currentNode;
			var c = Ext.getCmp('formbuilderTBDataView').store.getAt(10).data.config;
			var newNode = local.appendConfig(local.cloneConfig(c), n, true, true);
			local.setCurrentNode(newNode, true);
			//jiangyuntao 20120906 edit 新建时修改窗口title为定制表单
			if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window')){
				Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').setTitle('定制表单');
			}
		}
	},

	// get a new ID
	getNewId : function() {
		return "form-gen-" + (this.idCounter++);
	},
	// jiang add 20091127
	getFormFieldName : function(){
			return "FormField_"+(this.formFieldName++);
	},
	// return true if config can be added to node, or an error message if it cannot
	canAppend : function(config, node) {
		if (node == this.treePanel.root && this.treePanel.root.hasChildNodes()) {
//			return "Only one element can be directly under the GUI Builder";
			return "请选择一个组件再进行增加！";
		}
		var xtype = node.elConfig.xtype;
		if (xtype && ['panel','viewport','form','window','tabpanel','toolbar','fieldset'].indexOf(xtype) == -1) {
		//jiangyuntao 20110727 edit 将错误提示修改为中文
			//return 'You cannot add element under xtype "'+xtype+'"';
			return '不能为"'+xtype+'"增加子组件！请先选择一个容器组件（如表单）后重试。';
		}
		return true;
	},

	// add a config to the tree
	appendConfig : function(config, appendTo, doUpdate, markUndo) {

		if (!appendTo) {
			appendTo = this.treePanel.getSelectedNode() ||
				this.treePanel.root;
		}
		var canAppend = this.canAppend(config,appendTo);
		if (canAppend !== true) {
			showMsg(canAppend,'3');
			return false;
		}
		var items = config.items;
		delete config.items;
		var id = config.id||(config._node ? config._node.id : this.getNewId());
		var newNode = new Ext.tree.TreeNode({id:id,text:this.configToText(config)});
		for(var k in config) { if (config[k]===null) { delete config[k]; }}
		newNode.elConfig = config;
		/**chenjian 20130417 modify 增加config.xtype的判断，防止默认增加的form也被撤销掉*/
		if (markUndo === true && config.xtype!='form') {
			this.markUndo("增加 " + newNode.text);
		}
		appendTo.appendChild(newNode);
		if (items && items.length) {
			for (var i = 0; i < items.length; i++) {
					this.appendConfig(items[i], newNode, false);
			}
		}
		if (doUpdate !== false) {
			this.updateForm(false, newNode);
		}
		return newNode;

	},

	// remove a node
	removeNode : function(node) {
			if (!node || node == this.treePanel.root) { return; }
			//xiaoxiong 20101015			
			var nowObject = this ;
			if((node.text).indexOf('numberfield') == 0){
				var cleanConfig = this.getTreeConfig();
				cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
				var formid=cleanConfig.id;
				if (formid) {
					$.post( $.appClient.generateUrl({ESFormBuilder : 'queryExpression'}, 'x')
							,{formid:formid}, function(res){
							var json = eval("(" + res + ")") ;
							var nowEerpressList=json.list;
							if(nowEerpressList && nowEerpressList.length>0){
								Ext.MessageBox.show({    
				        		title:"提示消息",    
				       	 		msg:"<span style='color:#ff0000;'>此组件可能进行了表达式运算，删除组件前将删除所有的表达式，操作是否继续？<span>",    
				        		buttons:Ext.Msg.YESNO,    
				        		fn:function(btn){
				        			if(btn=='yes'){
				        				realDeteteNode(node,nowObject) ;
				        				$.post( $.appClient.generateUrl({ESFormBuilder : 'deleteExpression'}, 'x')
				        						,{formid:formid}, function(res){
				        							
				        				});
					        		}else if(btn =='no'){
					        			return ;
					        		}
				        		},    
				        		icon:Ext.MessageBox.QUESTION}); 
							} else {
								realDeteteNode(node,nowObject) ;
							}
					});
				} else {
					realDeteteNode(node,nowObject) ;
				}
			} else {
				realDeteteNode(node,nowObject) ;
			}
			
			function realDeteteNode(node,nowObject) {
				//xiaoxiong 20120516 添加是否有流转的数据 如果有 给出提示 否则直接删除
				if(hasData == 'false'){
					nowObject.markUndo("删除 " + node.text);
					var nextNode = node.nextSibling || node.parentNode;
					var pNode = node.parentNode;
					pNode.removeChild(node);
					nowObject.updateForm(false, pNode);
					nowObject.setCurrentNode(nextNode, true);
				} else {
					Ext.Msg.confirm('友情提示','是：不管是否存在数据，强制删除当前组件；<br>否：放弃删除操作！',function(button){
						if(button=='yes'){
							nowObject.markUndo("删除 " + node.text);
							var nextNode = node.nextSibling || node.parentNode;
							var pNode = node.parentNode;
							pNode.removeChild(node);
							nowObject.updateForm(false, pNode);
							nowObject.setCurrentNode(nextNode, true);
						}else{
							return ;
						}
					});
				}
			}
//end
	},

	// update the form
	setFormConfig : function(config, el) {

		el = el || this.builderPanel;

		// empty the form
		if (el.items) {
			while (el.items.first()) {
				el.remove(el.items.first(), true);
			}
		}
		if (el.getLayoutTarget) {
			el.getLayoutTarget().update();
		} else {
			el.update();
		}

		// adding items
		var start = new Date().getTime();
		if (config.items) {
			for (var i=0;i<config.items.length;i++) {
				el.add(config.items[i]);
			}
		}
		el.doLayout();
		var time = new Date().getTime() - start;
		return time;

	},

	// show a window with the json config
	editConfig : function() {
		var size = this.viewport.getSize();
		if (!this.jsonWindow) {
			//var tf = new Ext.form.TextArea();
			var tf = new Ext.form.TextArea({autoValidate:false});//xiaoxiong 20110919 添加autoValidate:false，使其不校验组件的值
			this.jsonWindow = new Ext.Window({
					title       : "Form Config",
					width       : 400,
					height      : size.height - 50,
					autoScroll  : true,
					layout      : 'fit',
					items       : [tf],
					modal       : true,
					closeAction : 'hide'
				});
			this.jsonWindow.tf = tf;
			this.jsonWindow.addButton({
					text    : "关闭",
					scope   : this.jsonWindow,
					handler : function() { this.hide(); }
				});
			this.jsonWindow.addButton({
					text    : "应用",
					scope   : this,
					handler : function() {
						var config = null;
						try {
							this.jsonWindow.el.mask("Please wait...");
							config = Ext.decode(tf.getValue());
							
						} catch (e) {
							config = null;
							this.jsonWindow.el.unmask();
							showMsg("JSON is invalid : " + e.name + "<br/>" + e.message,'3');
							return;
						}
						if (!config) {
							this.jsonWindow.el.unmask();
							showMsg("Config seems invalid",'3');
							return;
						} else {
								this.markUndo("JSON edit");
								try {
									
									this.setConfig({items:[config]});
								} catch(e) {
									this.jsonWindow.el.unmask();
									Ext.Msg.confirm("Error", "Error while adding : " +
										e.name + "<br/>" + e.message + '<br/>' +
										'Do you wish to revert to previous ?', function(b) {
											if (b == 'yes') { this.undo(); }
										}, this);

								}
						}
						this.jsonWindow.el.unmask();
						this.jsonWindow.hide();
					}
				});
		}
		var cleanConfig = this.getTreeConfig();
		cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});
		cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
		this.jsonWindow.tf.setValue(cleanConfig);
		this.jsonWindow.show();
	},
// jiang add 20091118
// show a window with the form
	runWind : function() {
		/**jiangyuntao 20130709 增加隐藏修改大小/移动的背景 this.resizeLayer.hide();*/
		this.resizeLayer.hide();
	
		var size = this.viewport.getSize();
		var runWindow;
		if (!runWindow) {
			var cleanConfig = this.getTreeConfig();
			cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});		
			cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
			runWindow = new Ext.Window({
					//id          : runWindow,
					title       : "预览",
					//width       : 800,
					//jiangyuntao 20110728 edit 将预览弹出的window宽度设置为和表单定制界面中的一直，避免出现表单定制中组件被屏蔽但是预览中可以看到的问题。
					width       : 776,
					height      : 500,
					autoScroll  : true,
					layout      : 'fit',
					items       : eval('['+cleanConfig+']'),
					modal       : true
					//,closeAction : 'hide'
				});
			//this.runWindow.tf = tf;

			//this.runWindow.addButton({
			//		text    : "Close",
			//		scope   : this.jsonWindow,
			//		handler : function() { this.hide(); }
			//	});
			
		}
		
		runWindow.show();
	},
	//jiang add 20091124
	// save form to database
	//jiangyuntao 20120328 edit sourceScope 暂时用于新建时在save方法中重置定制界面，如果将来需要扩展，可以增加参数用于区分。
	//                          修改方法返回值为true或false 不再直接return ；
	saveForm: function(sourceScope){
		
		var cleanConfig = this.getTreeConfig();
		cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
		if(cleanConfig.xtype!="form"){
			showMsg("保存失败!",'2');
			
	        cleanConfig = null;
			return false;
		}
		var items=cleanConfig.items;	
		var returnis=this.ComboIsReation(items,'');
		if(returnis&&returnis.length>0){
			var arr=returnis.substring(0,returnis.length-1).split(',');
			msg='请为下拉字段<br>';
			for(var i=0;i<arr.length;i++){
				msg=msg+'<"'+arr[i]+'"><br>';
			}
			msg=msg+'关联数据字典!';
			showMsg(msg,'3');
			
	        cleanConfig = null;
	        items = null;
	        returnis=null;
	        arr=null;
	        //jiangyuntao 20120327 edit 如果没设置下拉则返回false。
			return false;
		}
		var title = cleanConfig.title;
		
		//jiangyuntao 20120209 edit 修改在js中验证表单名称是否超长.
		var titleLength = title.trim().replace(/[^\x00-\xff]/g, '**').length ;
		if(titleLength>50){showMsg('表单名称超长（最大长度为25个中文字符）!','3');return false;}
		
		var formId = cleanConfig.id;
		
		//jiangyuntao 20120328 edit 如果是点新建进行的保存，则是连续添加，清空ID值做新增操作。
		if(sourceScope){
			formId = '';
			//jiangyuntao 20120906 edit 新建时修改窗口title为定制表单
			if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window')){
				Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').setTitle('定制表单');
			}
		}
		
		cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
		var pkId = Ext.getCmp('osFormBuilder_hidden_formPkID').getValue();///
		var loadMask = null;
		if(Ext.getCmp('formBuilderManagerFormBuilder_Window')){
			loadMask = new Ext.LoadMask(Ext.getCmp('formBuilderManagerFormBuilder_Window').body,{msg:'正在保存表单，请稍候....',removeMask :true});
			loadMask.show();
		}
		if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window')){
			
			loadMask = new Ext.LoadMask(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').body,{msg:'正在保存表单，请稍候....',removeMask :true});
			loadMask.show();
		}
		$.post( $.appClient.generateUrl({ESFormBuilder : 'saveFormBuilder'}, 'x')
    			,{formJs:cleanConfig,formId:formId,formTitle:title,id:pkId,formTypeID:this.formTypeID}, function(res){
	        	var json = eval("(" + res + ")");
	        	if(loadMask){
	        		loadMask.hide() ;//xiaoxiong 20110919 避免在重名时，销毁不掉
        			Ext.destroy(loadMask);
        			loadMask = null;
	        	}
	        	savedCleanConfig = cleanConfig ;
	        	cleanConfig = null;
		        items = null;
		        returnis=null;
		        arr=null;
	        	if(json.success && json.success == 'false'){
	        		showMsg(json.msg,'3');
	        		savedCleanConfig = '' ;
	        		return false;
	        	}else{
	        		Ext.getCmp('osFormBuilder_hidden_formPkID').setValue(json.formPkId);
	        		showMsg('表单保存成功！','1');
	        		$("#formBuilderDataGrid").flexReload();
	        		 //window关闭的时候刷新数据列表.
				 	if(Ext.getCmp('formBuilderManagerformList')){
						Ext.getCmp('formBuilderManagerformList').getStore().reload();
				 	}
				 	//jiangyuntao 20120328 edit 新建保存已定制好的表单时，保存完成后重置定制界面,可理解为连续定制表单，此操作不关闭当前定制界面
				 	if(sourceScope){
				 		var w = sourceScope.viewport.layout.center.getSize().width - 50;
						var node = sourceScope.setConfig({items:[]});
						sourceScope.setCurrentNode(node, true);	
						//jiangyuntao 20120328 edit 保存完成后，如果是点新建保存的，再增加一个空表单。
						var n = sourceScope.editPanel.currentNode;
						var c = Ext.getCmp('formbuilderTBDataView').store.getAt(10).data.config;
						var newNode = sourceScope.appendConfig(sourceScope.cloneConfig(c), n, true, true);
						sourceScope.setCurrentNode(newNode, true);
						Ext.getCmp('osFormBuilder_hidden_formPkID').setValue('');
				 	}else{
				 		if(Ext.getCmp('formBuilderManagerFormBuilder_Window')){
							Ext.getCmp('formBuilderManagerFormBuilder_Window').destroy();
						}
						/** xiaoxiong 20121101 对在新建中点击保存时 将存储到库中的新表单更新到界面 **/
				 		if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window') && (typeof formId == 'undefined')){
				 			main.id = json.formPkId ;
				 			getFormJs(main);
							Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').setTitle('修改表单：'+title);
						}
						//jiangyuntao 20101025 增加修改表单时保存关闭编辑窗体
						//if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window'))Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').destroy();
				 	}	
	        	}
		        return true;
	    });
		
	},
	saveFormAndCloseWin: function(sourceScope){
		
		var cleanConfig = this.getTreeConfig();
		cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});	
		if(cleanConfig.xtype!="form"){
			showMsg("保存失败!",'2');
			
	        cleanConfig = null;
			return false;
		}
		var items=cleanConfig.items;	
		var returnis=this.ComboIsReation(items,'');
		if(returnis&&returnis.length>0){
			var arr=returnis.substring(0,returnis.length-1).split(',');
			msg='请为下拉字段<br>';
			for(var i=0;i<arr.length;i++){
				msg=msg+'<"'+arr[i]+'"><br>';
			}
			msg=msg+'关联数据字典!';
			showMsg(msg,'3');
			
	        cleanConfig = null;
	        items = null;
	        returnis=null;
	        arr=null;
	        //jiangyuntao 20120327 edit 如果没设置下拉则返回false。
			return false;
		}
		var title = cleanConfig.title;
		
		//jiangyuntao 20120209 edit 修改在js中验证表单名称是否超长.
		var titleLength = title.trim().replace(/[^\x00-\xff]/g, '**').length ;
		if(titleLength>50){showMsg('表单名称超长（最大长度为25个中文字符）!','3');return false;}
		
		var formId = cleanConfig.id;
		
		//jiangyuntao 20120328 edit 如果是点新建进行的保存，则是连续添加，清空ID值做新增操作。
		if(sourceScope){
			formId = '';
		}
		
		cleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
		var pkId = Ext.getCmp('osFormBuilder_hidden_formPkID').getValue();///
		var loadMask = null;
		if(Ext.getCmp('formBuilderManagerFormBuilder_Window')){
			loadMask = new Ext.LoadMask(Ext.getCmp('formBuilderManagerFormBuilder_Window').body,{msg:'正在保存表单，请稍候....',removeMask :true});
			loadMask.show();
		}
		if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window')){
			
			loadMask = new Ext.LoadMask(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').body,{msg:'正在保存表单，请稍候....',removeMask :true});
			loadMask.show();
		}
		$.post( $.appClient.generateUrl({ESFormBuilder : 'saveFormBuilder'}, 'x')
    			,{formJs:cleanConfig,formId:formId,formTitle:title,id:pkId,formTypeID:this.formTypeID}, function(res){
	        	var json = eval("(" + res + ")");
	        	if(loadMask){
	        		loadMask.hide() ;//xiaoxiong 20110919 避免在重名时，销毁不掉
        			Ext.destroy(loadMask);
        			loadMask = null;
	        	}
	        	cleanConfig = null;
		        items = null;
		        returnis=null;
		        arr=null;
	        	if(json.success&&json.success == 'false'){
	        		showMsg(json.msg,'3');
	        		return false;
	        	}else{
	        		Ext.getCmp('osFormBuilder_hidden_formPkID').setValue(json.formPkId);
	        		showMsg('表单保存成功！','3');
	        		 //window关闭的时候刷新数据列表.
				 	if(Ext.getCmp('formBuilderManagerformList')){
						Ext.getCmp('formBuilderManagerformList').getStore().reload();
				 	}
				 	//jiangyuntao 20120328 edit 新建保存已定制好的表单时，保存完成后重置定制界面,可理解为连续定制表单，此操作不关闭当前定制界面
				 	if(sourceScope){
				 		var w = sourceScope.viewport.layout.center.getSize().width - 50;
						var node = sourceScope.setConfig({items:[]});
						sourceScope.setCurrentNode(node, true);	
						//jiangyuntao 20120328 edit 保存完成后，如果是点新建保存的，再增加一个空表单。
						var n = sourceScope.editPanel.currentNode;
						var c = Ext.getCmp('formbuilderTBDataView').store.getAt(10).data.config;
						var newNode = sourceScope.appendConfig(sourceScope.cloneConfig(c), n, true, true);
						sourceScope.setCurrentNode(newNode, true);
						Ext.getCmp('osFormBuilder_hidden_formPkID').setValue('');
				 	}else{
				 		if(Ext.getCmp('formBuilderManagerFormBuilder_Window')){
							Ext.getCmp('formBuilderManagerFormBuilder_Window').destroy();
						}
						//jiangyuntao 20101025 增加修改表单时保存关闭编辑窗体
						if(Ext.getCmp('formBuilderManagerModify_FormBuilder_Window'))Ext.getCmp('formBuilderManagerModify_FormBuilder_Window').destroy();
				 	}
				 	
	        	}
		        return true;
	    });
		
	},
	
	// remove all nodes
	removeAll : function() {
		var root = this.treePanel.root;
		while(root.firstChild){
				root.removeChild(root.firstChild);
		}
	},

	// set config (remove then append a whole new config)
	setConfig : function(config) {
		//if (!config || !config.items) { return false; }
		if (!config) { return false; }//xiaoxiong 20110503 修改无法撤消“表单”组件BUG
		// delete all items
		this.removeAll();
		// add all items
		var root = this.treePanel.root;
		var node = null;
		if(config.items){//xiaoxiong 20110503 修改无法撤消“表单”组件BUG
			for (var i = 0; i < config.items.length; i++) {
				try {
					node = this.appendConfig(config.items[i], root);
				} catch(e) {
					showMsg("Error while adding : " + e.name + "<br/>" + e.message,'3');
				}
			}
		}
		//root.expand();
		this.updateForm(true, root);
		/** xiaoxiong 20121101 在表单修改时 记录表单的初始值 用于判断是否进行了修改 **/
		var cleanConfig = this.getTreeConfig();
		cleanConfig = (cleanConfig.items?cleanConfig.items[0]||{}:{});
		savedCleanConfig = FormBuilderMain.JSON.encode(cleanConfig);
		return node || root;
	}
	// jiang add function

};

// modified Ext.util.JSON to display a readable config
FormBuilderMain.JSON = new (function(){
    var useHasOwn = {}.hasOwnProperty ? true : false;
    var pad = function(n) { return n < 10 ? "0" + n : n; };
    var m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"' : '\\"',
        "\\": '\\\\'
    };
    var encodeString = function(s){
        if (/["\\\x00-\x1f]/.test(s)) {
            return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                var c = m[b];
                if(c){ return c; }
                c = b.charCodeAt();
                return "\\u00" +
                    Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
            }) + '"';
        }
        return '"' + s + '"';
    };

		var indentStr = function(n) {
			var str = "", i = 0;
			while (i<n) {
				str += "  ";
				i++;
			}
			return str;
		};

    var encodeArray = function(o, indent){
				indent = indent || 0;
        var a = ["["], b, i, l = o.length, v;
            for (i = 0; i < l; i += 1) {
                v = o[i];
                switch (typeof v) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if (b) {
                            a.push(',');
                        }
                        a.push(v === null ? "null" : FormBuilderMain.JSON.encode(v, indent + 1));
                        b = true;
                }
            }
            a.push("]");
            return a.join("");
    };

    var encodeDate = function(o){
        return '"' + o.getFullYear() + "-" +
                pad(o.getMonth() + 1) + "-" +
                pad(o.getDate()) + "T" +
                pad(o.getHours()) + ":" +
                pad(o.getMinutes()) + ":" +
                pad(o.getSeconds()) + '"';
    };

    this.encode = function(o, indent){
				indent = indent || 0;
        if(typeof o == "undefined" || o === null){
            return "null";
        }else if(o instanceof Array){
            return encodeArray(o, indent);
        }else if(o instanceof Date){
            return encodeDate(o);
        }else if(typeof o == "string"){
            return encodeString(o);
        }else if(typeof o == "number"){
            return isFinite(o) ? String(o) : "null";
        }else if(typeof o == "boolean"){
            return String(o);
        }else {
            var a = ["{\n"], b, i, v;
						if (o.items instanceof Array) {
							var items = o.items;
							delete o.items;
							o.items = items;
						}
            for (i in o) {
								if (i === "_node") { continue; }
                if(!useHasOwn || o.hasOwnProperty(i)) {
                    v = o[i];
										if (i === "id" && /^form-gen-/.test(o[i])) { continue; }
										if (i === "id" && /^ext-comp-/.test(o[i])) { continue; }
										//xiaoxiong 20110918 添加正则验证
										if (i === "regex") {if(b){ a.push(',\n'); } a.push(indentStr(indent), i, ":",String(v));b = true;continue ; }
                    switch (typeof v) {
                    case "undefined":
                    case "function":
                    case "unknown":
                        break;
                    default:
                        if(b){ a.push(',\n'); }
												a.push(indentStr(indent), i, ":",
                                v === null ? "null" : this.encode(v, indent + 1));
                        b = true;
                    }
                }
            }
						a.push("\n" + indentStr(indent-1) + "}");
						return a.join("");
        }
    };

})();

// parse DocRefs
var fields = {};
var fileName;
var infos;
var type;
var desc;
for (fileName in DocRefs) {
	for (key in DocRefs[fileName]) {
		infos = DocRefs[fileName][key];
		if (infos.type == "Function") { continue; }
		desc = "<i>"+fileName+"</i><br/><b>"+infos.type+"</b> "+infos.desc;
		if (!fields[key]) {
			fields[key] = { desc:desc };
			if (infos.type == "Boolean") {
				type = "boolean";
			} else if (infos.type == "Number") {
				type = "number";
			} else if (infos.type.match(/Array/)) {
				type = "object";
			} else if (infos.type.match(/Object/)) {
				type = "object";
			} else {
				type = "string";
			}
			fields[key].type = type;
		} else {
			fields[key].desc += "<hr/>" + desc;
		}
	}
}
Ext.apply(fields, {
	xtype  : {desc:"",type:"string",values:'component box viewport panel window dataview colorpalette datepicker tabpanel button splitbutton cycle toolbar tbitem tbseparator tbspacer tbfill tbtext tbbutton tbsplit paging editor treepanel field textfield trigger textarea numberfield datefield combo checkbox radio hidden form fieldset htmleditor timefield grid editorgrid progress'.split(' ')},
	region : {desc:"",type:"string",values:'center west north south east'.split(' ')},
	hideMode         : {desc:"",type:"string",values:'visibility display offsets'.split(' ')},
	msgTarget        : {desc:"",type:"string",values:'qtip title under side'.split(' ')},
	shadow           : {desc:"",type:"string",values:'sides frame drop'.split(' ')},
	tabPosition      : {desc:"",type:"string",values:'top bottom'.split(' ')},
	columnWidth      : {desc:"Size of column (0 to 1 for percentage, >1 for fixed width",type:"number"},
	fieldLabel       : {desc:"Label of the field",type:"string"},
	x                : {desc:"X position in pixels (for absolute layouts",type:"string"},
	y                : {desc:"Y position in pixels (for absolute layouts",type:"string"},
	anchor           : {desc:"Anchor size (width) in %",type:"string"}
});
fields.layout.values = [];
for (i in Ext.Container.LAYOUTS) { fields.layout.values.push(i); }
fields.vtype.values = [];
for (i in Ext.form.VTypes) { fields.vtype.values.push(i); }
fields.defaultType.values = fields.defaults.xtype;
FormBuilderMain.FIELDS = fields;





