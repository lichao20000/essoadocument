/*
 * $Id: MainPanel.js,v 1.54 2009/04/13 11:23:24 gaudenz Exp $
 * Copyright (c) 2008, Gaudenz Alder
 */
MainPanel = function(graph, history)
{	
	var userName = $("#createWorkflowDiv").attr("userName") ;
	var executeLayout = function(layout, animate, ignoreChildCount)
	{
		var cell = graph.getSelectionCell();
		
		if (cell == null ||
			(!ignoreChildCount &&
			graph.getModel().getChildCount(cell) == 0))
		{
			cell = graph.getDefaultParent();
		}

		// Animates the changes in the graph model except
		// for Camino, where animation is too slow
		if (animate && navigator.userAgent.indexOf('Camino') < 0)
		{
			var listener = function(sender, evt)
			{
				mxUtils.animateChanges(graph, evt.getArgAt(0)/*changes*/);
				graph.getModel().removeListener(listener);
			};
			
			graph.getModel().addListener(mxEvent.CHANGE, listener);
		}

        layout.execute(cell);
	};
	//
	// Defines various color menus for different colors
    var fillColorMenu = new Ext.menu.ColorMenu(
    {
    	items: [
    	{
    		text: 'None',
    		handler: function()
    		{
    			graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
    		}
    	},
    	'-'
    	],
        handler : function(cm, color)
        {
    		if (typeof(color) == "string")
    		{
				graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#'+color);
			}
        }
    });

    var gradientColorMenu = new Ext.menu.ColorMenu(
    {
		items: [
        {
            text: 'North',
            handler: function()
            {
                graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_NORTH);
            }
        },
        {
            text: 'East',
            handler: function()
            {
                graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_EAST);
            }
        },
        {
            text: 'South',
            handler: function()
            {
                graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_SOUTH);
            }
        },
        {
            text: 'West',
            handler: function()
            {
                graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, mxConstants.DIRECTION_WEST);
            }
        },
        '-',
		{
			text: 'None',
			handler: function()
			{
        		graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, mxConstants.NONE);
        	}
		},
		'-'
		],
        handler : function(cm, color)
        {
    		if (typeof(color) == "string")
    		{
    			graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, '#'+color);
			}
        }
    });

    var fontColorMenu = new Ext.menu.ColorMenu(
    {
    	items: [
    	{
    		text: 'None',
    		handler: function()
    		{
    			graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, mxConstants.NONE);
    		}
    	},
    	'-'
    	],
        handler : function(cm, color)
        {
    		if (typeof(color) == "string")
    		{
    			graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, '#'+color);
			}
        }
    });

    var lineColorMenu = new Ext.menu.ColorMenu(
    {
    	items: [
		{
			text: 'None',
			handler: function()
			{
				graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
			}
		},
		'-'
		],
        handler : function(cm, color)
        {
    		if (typeof(color) == "string")
    		{
//    			alert(color);
				graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#'+color);
			}
        }
    });

    var labelBackgroundMenu = new Ext.menu.ColorMenu(
    {
		items: [
		{
			text: 'None',
			handler: function()
			{
				graph.setCellStyles(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, mxConstants.NONE);
			}
		},
		'-'
		],
        handler : function(cm, color)
        {
    		if (typeof(color) == "string")
    		{
    			graph.setCellStyles(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, '#'+color);
    		}
        }
    });

    var labelBorderMenu = new Ext.menu.ColorMenu(
    {
		items: [
		{
			text: 'None',
			handler: function()
			{
				graph.setCellStyles(mxConstants.STYLE_LABEL_BORDERCOLOR, mxConstants.NONE);
			}
		},
		'-'
		],
        handler : function(cm, color)
        {
    		if (typeof(color) == "string")
    		{
    			graph.setCellStyles(mxConstants.STYLE_LABEL_BORDERCOLOR, '#'+color);
			}
        }
    });
    
    // Defines the font family menu
    var fonts = new Ext.data.SimpleStore(
    {
        fields: ['label', 'font'],
        data : [
//            ['Helvetica', 'Helvetica']
//           , ['Verdana', 'Verdana'],
//        	['Times New Roman', 'Times New Roman'], 
//        	['Garamond', 'Garamond'],
//        	['Courier New', 'Courier New'] 	
        	 ['宋体', '宋体']
        	, ['隶书', '隶书']
        	,['华文中宋', '华文中宋']
        	,['方正舒体', '方正舒体']
        	,['方正姚体', '方正姚体']
        	,['华文楷体', '华文楷体']
        	,['华文隶书', '华文隶书']
        	,['华文宋体', '华文宋体']
        	,['华文细黑', '华文细黑']
        	,['华文行楷', '华文行楷']
        	,['楷体_GB2312', '楷体_GB2312'] 
        	]
    });
    
    var fontCombo = new Ext.form.ComboBox(
    {
        store: fonts,
        displayField:'label',
        mode: 'local',
        width:90,
        triggerAction: 'all',
        emptyText:'选择字体...',
        selectOnFocus:true,
        editable:false,
        lazyRender:false,
        forceSelection:true,
        
        onSelect: function(entry)
        {
        	if (entry != null)
        	{
				graph.setCellStyles(mxConstants.STYLE_FONTFAMILY, entry.data.font);
				this.setValue(entry.data.font+'pt');//jiangyuntao add 20100309  combo显示选择的字体
				this.collapse();
        	}
        }
    });
    
    // Defines the font size menu
    var sizes = new Ext.data.SimpleStore({
        fields: ['label', 'size'],
        data : [['6pt', 6], ['8pt', 8], ['9pt', 9], ['10pt', 10], ['12pt', 12],
        	['14pt', 14], ['18pt', 18], ['24pt', 24], ['30pt', 30], ['36pt', 36],
        	['48pt', 48],['60pt', 60]]
    });
    
    var sizeCombo = new Ext.form.ComboBox(
    {
        store: sizes,
        displayField:'label',
        mode: 'local',
        width:50,
        triggerAction: 'all',
        emptyText:'12pt',
        selectOnFocus:true,
        onSelect: function(entry)
        {
        	if (entry != null)
        	{
				graph.setCellStyles(mxConstants.STYLE_FONTSIZE, entry.data.size);
				this.setValue(entry.data.size);//jiangyuntao add 20100309  combo显示选择的字体大小
				this.collapse();
        	}
        }
    });
    
	// Handles typing a font size and pressing enter
    sizeCombo.on('specialkey', function(field, evt)
    {
    	if (evt.keyCode == 10 ||
    		evt.keyCode == 13)
    	{
    		var size = parseInt(field.getValue());
    		
    		if (!isNaN(size) &&
    			size > 0)
    		{
    			graph.setCellStyles(mxConstants.STYLE_FONTSIZE, size);
    		}
    	}
    });

    var tplPath =  $("#createWorkflowDiv").attr("tplPath") ;
    baseRequestUrl = window.location.href ;
    baseRequestUrl = baseRequestUrl.substring(0, baseRequestUrl.indexOf('esdocument')-1) ;
    var bodyStyle = "background:url("+baseRequestUrl+tplPath+"/ESTransferFlow/js/workflow/images/grid.gif)" ;
    this.graphPanel = new Ext.Panel(
    {
    	id    : 'oais_workflow_model_graphPanel',
    	region: 'center',
    	listeners  : {beforedestroy:function(){
    		if(document.getElementById('editObj')){showMsg('当前流程含有没有通过验证规则的组件，请进行修改!','3');return false;}//xiaoxiong 20120328 添加验证规则
    		var check;
    		var modelId = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
    		if(modelId==''){
    			if(!Ext.getCmp('outlinePanel')){
    				return false;
    			}else{
    				//xiaoxiong 20120327 添加当只有开始于结束两个组件时 不提示直接关闭定制窗体
    				var cells = graph.getCells(0, 0, 100000, 1000000);
    				if(cells.length > 2){
		    			Ext.MessageBox.confirm('友情提示','你没有执行保存操作，是否继续？',oais_workflow_model_issave);
		    			function oais_workflow_model_issave(btn){
		    				if(btn == 'yes'){
		    					// jiang 20101118 add destroy
		    					if(Ext.getCmp('wfGraphEditorPanelId')){Ext.getCmp('wfGraphEditorPanelId').destroy();}
		    					if(Ext.getCmp('workflowModelwfModelList')) {Ext.getCmp('workflowModelwfModelList').getStore().reload();}	
		    				}
		    			}
    				} else {
    					if(Ext.getCmp('wfGraphEditorPanelId')){Ext.getCmp('wfGraphEditorPanelId').destroy();}
    				}
    			}
			}else{
			//xiaoxiong 20101009 
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(graph.getModel());
				var graphXml = mxUtils.getPrettyXml(node);
				var modelId = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
        		//graphXml = encodeURI(graphXml);
				$.post( $.appClient.generateUrl({ESTransferFlow : 'getWorkFlowXml'}, 'x')
						,{modelId:modelId}, function(oldGraphXml){
							if(oldGraphXml != graphXml){
								if(!Ext.getCmp('workflowModelModify_MxGraph_Window')&&!Ext.getCmp('workflowModelMxGraph_Window')){return false;}
				    		 	Ext.MessageBox.show({    
				        			title:"友情提示",    
				       	 			msg:"请选择后续操作<br>是&nbsp;&nbsp;&nbsp;：保存并退出流程修改界面!<br>否&nbsp;&nbsp;&nbsp;：不保存并退出流程修改界面!<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;取消：取消关闭窗体操作!",    
				        			buttons:Ext.Msg.YESNOCANCEL,   
				        			buttonText : { 
								    	yes    : "保存", 
								    	no     : "退出", 
								    	cancel : "取消" 
									}, 
				        			fn:oais_workflow_model_isDelete,    
				        			icon:Ext.MessageBox.QUESTION});
							} else {
									// jiang 20101118 add destroy
    							if(Ext.getCmp('wfGraphEditorPanelId')){Ext.getCmp('wfGraphEditorPanelId').destroy();}
								if(Ext.getCmp('workflowModelwfModelList')) {Ext.getCmp('workflowModelwfModelList').getStore().reload();}
							}
							enc=null;
							node=null;
							graphXml=null;
							modelId=null;
				});
    			function oais_workflow_model_isDelete(btn){
    				if(btn == 'yes'){
    					saveWorkflowGraphXml(graph);
    				}else if(btn == 'no'){
    					//xiaoxiong 20120327 添加删除已经保存的当前流程信息
    					var modelId = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue() ;
    					var isCreateWin = false ;
    					if(Ext.getCmp('workflowModelMxGraph_Window')){
    						isCreateWin = true ;
    					}
    					// jiang 20101118 add destroy
    					if(Ext.getCmp('wfGraphEditorPanelId')){Ext.getCmp('wfGraphEditorPanelId').destroy();}
						if(Ext.getCmp('workflowModelwfModelList')) {Ext.getCmp('workflowModelwfModelList').getStore().reload();}
						//xiaoxiong 20120327 添加删除已经保存的当前流程信息
						if(isCreateWin){
							$.post( $.appClient.generateUrl({ESTransferFlow : 'dropWfModel'}, 'x')
									,{modelId:modelId}, function(res){
							});
		        		}
    				}
    			}
    			//end
			}
    		return false;
    	}},
    	border:false,
    	bodyStyle:bodyStyle,
    	height: 540,
    	width: 600,
    	autoScroll  : true,  
        tbar:[
        {
        	id: 'save',
            text:'保存',
            iconCls: 'workflow_save',
            tooltip: '保存',
            handler: function()
            {
            	saveWorkflowGraphXml(graph);
            },
            scope:this
        },
        '-',
        
        {
        	id: 'cut',
            text:'剪切',
            iconCls: 'cut-icon',
            tooltip: '剪切',
            handler: function()
            {
        		mxClipboard.cut(graph);
        		Ext.getCmp('paste').setDisabled(false);//xiaoxiong 20120328 控制粘贴按钮是否可用
        	},
            scope:this
        },{
       		id: 'copy',
            text:'复制',
            iconCls: 'copy-icon',
            tooltip: '复制',
            handler: function()
            {
            	var cell=graph.getSelectionCell();
            	if(cell){
            		//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
            		var thisSstyle = cell.getStyle();
	    			var thisCellValue = cell.getValue();
	    			var thisIsEdge= cell.isEdge();
	    			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
            			//if(cell.getValue()=='开始'||cell.getValue()=='结束'){
            			showMsg('不允许复制开始和结束节点','3');return;
            		}
            	}
        		mxClipboard.copy(graph);
        		Ext.getCmp('paste').setDisabled(false);//xiaoxiong 20120328 控制粘贴按钮是否可用
        	},
            scope:this
        },{
        	id:'paste',
             text:'粘贴',
            iconCls: 'paste-icon',
            tooltip: '粘贴',
            handler: function()
            {
            	mxClipboard.paste(graph);
            },
            scope:this
        },
        '-',
        {
       		id: 'delete',
             text:'删除',
            iconCls: 'delete-icon',
            tooltip: '删除',
            handler: function()
            {
            	
            	//jiangyuntao 20120210 edit 删除时增加验证，开始结束节点不允许删除
    			var cells = graph.getSelectionCells();
    			var msg = [];
    			if(cells && cells.length>0){
    				for(var i = 0 ; i < cells.length ; i++){
    					//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
	    				var thisSstyle = cells[i].getStyle();
		    			var thisCellValue = cells[i].getValue();
		    			var thisIsEdge= cells[i].isEdge();
		    			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
		    				msg.push('['+thisCellValue+']');
		    			}
    				}
    				if(msg.length>0){msg.sort();showMsg(msg+'节点不允许删除!','3');return;}
    				Ext.Msg.confirm('消息', '您确定要删除吗?', function(btn){
	            			if (btn == 'yes'){
	            				var currCell=graph.getSelectionCell();
	            				deleteCellfromDB(0,graph);
	        					//graph.removeCells();
	            			}else{
	            				return ;
	            			}
	            		}
	            	);
    			}
            	
            	//-----------------------
            	//增加是否删除选择框
            	//jiangjien20100325
            	//-----------------------
        	},
            scope:this
        },
       // '-',
        {
        	id: 'undo',
            text:'',
            iconCls: 'undo-icon',
            tooltip: '上一步',
            hidden:true, 
            handler: function()
            {
            	history.undo();
            },
            scope:this
        },
        {
        	id: 'redo',
            text:'',
            iconCls: 'redo-icon',
            tooltip: '下一步',
            hidden:true, 
            handler: function()
            {
        		history.redo();
            },
            scope:this
        },
        '-',
        fontCombo,
        ' ',
        sizeCombo,
        '-',
		{
			id: 'bold',
            text: '',
            iconCls:'bold-icon',
            tooltip: '加粗',
            handler: function()
            {
        		graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_BOLD);
        	},
            scope:this
        },
		{
			id: 'italic',
            text: '',
            tooltip: '斜体',
            iconCls:'italic-icon',
            handler: function()
            {
            	graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_ITALIC);
            },
            scope:this
        },
		{
			id: 'underline',
            text: '',
            tooltip: '下划线',
            iconCls:'underline-icon',
            handler: function()
            {
        		graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_UNDERLINE);
        	},
            scope:this
        },
        '-',
        {
            id: 'align',
            text:'',
            iconCls: 'left-icon',
            tooltip: '文字对齐',
            handler: function() { },
            menu:
            {
                id:'reading-menu',
                cls:'reading-menu',
                items: [
                {
                    text:'居左对齐',
                    checked:false,
                    group:'rp-group',
                    scope:this,
                    iconCls:'left-icon',
                    handler: function()
                    {
                		graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
                	}
                },
                {
                    text:'居中对齐',
                    checked:true,
                    group:'rp-group',
                    scope:this,
                    iconCls:'center-icon',
                    handler: function()
                    {
                		graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
                	}
                },
                {
                    text:'居右对齐',
                    checked:false,
                    group:'rp-group',
                    scope:this,
                    iconCls:'right-icon',
                    handler: function()
                    {
                		graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_RIGHT);
                	}
                },
                '-',
                {
                    text:'上对齐',
                    checked:false,
                    group:'vrp-group',
                    scope:this,
                    iconCls:'top-icon',
                    handler: function()
                    {
                		graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
                	}
                },
                {
                    text:'上下居中',
                    checked:true,
                    group:'vrp-group',
                    scope:this,
                    iconCls:'middle-icon',
                    handler: function()
                    {
                		graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
                	}
                },
                {
                    text:'下对齐',
                    checked:false,
                    group:'vrp-group',
                    scope:this,
                    iconCls:'bottom-icon',
                    handler: function()
                    {
                		graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_BOTTOM);
                    }
                }]
            }
        },
        '-',
		{
			id: 'fontcolor',
            text: '',
            tooltip: '字体颜色',
            iconCls:'fontcolor-icon',
            menu: fontColorMenu // <-- submenu by reference
        },
		{
			id: 'linecolor',
            text: '',
            tooltip: '线条颜色',
            iconCls:'linecolor-icon',
            menu: lineColorMenu // <-- submenu by reference
        },
		{
			id: 'fillcolor',
            text: '',
            tooltip: '填充色',
            iconCls:'fillcolor-icon',
            menu: fillColorMenu // <-- submenu by reference
        }],
				
        onContextMenu : function(node, e)
        {
    		var selected = !graph.isSelectionEmpty();
    		var currCell=graph.getSelectionCell();
    		var isbeginorand=false;
    		if(currCell){
    			//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
    			var thisSstyle = currCell.getStyle();
    			var thisCellValue = currCell.getValue();
    			var thisIsEdge= currCell.isEdge();
    			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
    				isbeginorand=true;
    			}
    		}
    		this.menu = new Ext.menu.Menu(
    		{
                id:'feeds-ctx',
                items: [
                {
		            text:'编辑',
		            //jiangyuntao 20110804 edit 增加图标
		            iconCls:'edit',
		            scope:this,
		            disabled: !selected||isbeginorand,//xiaoxiong 20110427 控制开始、结束不能编辑
		            handler: function()
		            {
		                graph.startEditing();
		            }
		        },
			     {
                    text:'删除',
                    iconCls:'delete-icon',
                    disabled: !selected||isbeginorand,
                    scope: this,
                    handler:function()
                    {
                    	//-----------------------
                    	//增加是否删除选择框
                    	//jiangjien20100325
                    	//-----------------------
                    	
                    	//jiangyuntao 20120210 edit 删除时增加验证，开始结束节点不允许删除
    					var cells = graph.getSelectionCells();
    					var msg = [];
    					if(cells){
    						for(var i = 0 ; i < cells.length ; i++){
    							//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
	    						var thisSstyle = cells[i].getStyle();
				    			var thisCellValue = cells[i].getValue();
				    			var thisIsEdge= cells[i].isEdge();
				    			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
				    				msg.push('['+thisCellValue+']');
				    			}
    						}
    						if(msg.length>0){msg.sort();showMsg(msg+'节点不允许删除!','3');return;}
    					}
                    	
                    	Ext.Msg.confirm('消息', '您确定要删除吗?', function(btn){
                    			if (btn == 'yes'){
                    				var selected = !graph.isSelectionEmpty();
			    					var currCell=graph.getSelectionCell();
			                    	deleteCellfromDB(currCell.getId(),graph);
			                    	//graph.removeCells();
                    			}else{
                    				return ;
                    			}
                    		}
                    	);
                    	
                    }
                },'-',{
                    text:'剪切',
                    iconCls:'cut-icon',
                    //disabled: !selected,
                    disabled: !selected||isbeginorand,//xiaoxiong 20110427 控制开始、结束不能剪切
                    scope: this,
                    handler:function()
                    {
                    	mxClipboard.cut(graph);
                    	Ext.getCmp('paste').setDisabled(false);//xiaoxiong 20120328 控制粘贴按钮是否可用
                    }
                },{
                    text:'复制',
                    iconCls:'copy-icon',
                    //disabled: !selected,
                    disabled: !selected||isbeginorand,//xiaoxiong 20110427 控制开始、结束不能复制
                    scope: this,
                    handler:function()
                    {
                    	mxClipboard.copy(graph);
                    	Ext.getCmp('paste').setDisabled(false);//xiaoxiong 20120328 控制粘贴按钮是否可用
                    }
                },{
                    text:'粘贴',
                    iconCls:'paste-icon',
                    disabled: mxClipboard.isEmpty(),
                    scope: this,
                    handler:function()
                    {
                    	mxClipboard.paste(graph);
                    }
//20101011
              	}]
            });
	       //this.menu.on('mouseout',function(){this.hide();}); 
            this.menu.on('hide', this.onContextHide, this);
            this.menu.showAt([e.clientX, e.clientY]);
            hideMwnuObject = this.menu ; //xiaoxiong 20120213 将右击菜单保存到一个全局的变量中 用于点击隐藏此组件
	    },
	
	    onContextHide : function()
	    {
	        if(this.ctxNode)
	        {
	            this.ctxNode.ui.removeClass('x-node-ctx');
	            this.ctxNode = null;
	        }
	    }
    });

    MainPanel.superclass.constructor.call(this,
    {
        region:'center',
        layout: 'fit',
        border:false,
        style:'border-left:1px solid #99BBE8;border-right:1px solid #99BBE8;',
        items: this.graphPanel
    });

    // Redirects the context menu to ExtJs menus
    var self = this; // closure
    graph.panningHandler.popup = function(x, y, cell, evt)
    {
    	self.graphPanel.onContextMenu(null, evt);
    };

    graph.panningHandler.hideMenu = function()
    {
		if (self.graphPanel.menuPanel != null)
    	{
			self.graphPanel.menuPanel.hide();
    	}
    };

    // Fits the SVG container into the panel body
    this.graphPanel.on('resize', function()
    {
        graph.sizeDidChange();
    });

// jiang add 20090805 start
    var editFieldPrint;//fuhongyi 20101027 工作流打印全局的变量
	var allFieldPrint;//fuhongyi 20101027 工作流打印全局的变量
	graph.dblClick = function(evt, cell){
		graph.fireEvent(mxEvent.DOUBLE_CLICK,new mxEventObject([evt,cell]));
		if (!mxEvent.isConsumed(evt) && cell != null){
			var style = cell.getStyle();
			var parent = cell.getParent();
			var parentId = parent.getId();
			var cellValue = cell.getValue();
			var geometry = cell.getGeometry();
			var childAt = cell.getChildAt();
			var isEdge= cell.isEdge();//判断是不是直线或曲线{true、false、1}
			var wind=null;
			var showFormMask=null ;//xiaoxiong 20101019 
			if(!wind){
				///  开始节点（椭圆形）
				if(style!=null&&style.length>=7&&style.substring(0,7)=='ellipse'&&isEdge==false&&cellValue=='开始'){
					var esModelName = '';
					var esDescription = '';
					var selectBusiness = '';
					var formRelation = '';
					$.ajax({ 
						url : $.appClient.generateUrl({ESTransferFlow : 'getModelInit'}, 'x'), 
				    	type : "post", 
			          	data : {modelId:Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue()}, 
			          	dataType:"json",
			          	async : false, // 同步
			          	success : function(res){
							esModelName = res.name;
							esDescription = res.describtion;
							selectBusiness = res.business_relation;
							formRelation = res.form_relation;
						} 
					}); 
					$.ajax({
						url:$.appClient.generateUrl({ESTransferFlow:'osModelInitPage'},'x'),
						success:function(data){
							wind = null;
							$.dialog({
								id:'OsModel_Init_Wind_Id',
								title:'工作流初始化设置',
								width:400,
								height:300,
								padding:'5px 10px',
								fixed:true,
								resize:true,
								okVal:'保存',
							    ok:true,
							    cancelVal: '关闭',
							    cancel: function(){
							    	graph.refresh();
							    	return true;
							    },
							    close:function(){
							    	graph.refresh();
							    },
					    		content:data,
					    		init:function(){
					    			$('#osModel_init_ES_MODEL_NAME').val(esModelName);
									$('#osModel_init_ES_DESCRIPTION').val(esDescription);
									$('#selectBusiness').val(selectBusiness);
									if(formRelation!=null && formRelation!='undefined'){
										var code = formRelation.length>5 ? formRelation.substring(5) : "";
										$('#selectBusiness').attr("code",code);
									}
					    			$('#osModel_init_formA').autovalidate();
					    		},
					    		ok:function(){
					    			//验证form表单
					    			if(!$("#osModel_init_formA").validate()) return false;
					    			var isCreateWin = '0' ;
					        		if(Ext.getCmp('workflowModelMxGraph_Window')){
					        			isCreateWin = '1' ;
					        		}
					        		var params={"name":$('#osModel_init_ES_MODEL_NAME').val(),
					        				"describtion":$('#osModel_init_ES_DESCRIPTION').val(),
					        				"selectBusiness":$('#selectBusiness').val(),
					        				"stageId":$('#selectBusiness').attr("code"),
					        				"modelId":Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue(),
					        				"typeId":Ext.getCmp('osWfModel_custom_form_init_hidden_Model_Type_ID').getValue(),
					        				"isCreateWin":isCreateWin,//未使用
					        				"userName":userName};
							    	$.post($.appClient.generateUrl({ESTransferFlow : 'saveWFModelInit'}, 'x')
							    			,{data:params}, function(json){
						        				if (json) {
								 				    if(!json.allowChange){
								 				    	$.dialog.notice({icon : 'error',content : '包含流程实例,不允许修改收集范围！',time : 3});
								 				    	return false;
								 				    }
								 					Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').setValue(json.modelId);
								 					Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').setValue(json.stageId);
								 				    $.dialog.notice({icon : 'success',content : '保存成功！',time : 3});
								 				   $("#modelDataGrid").flexReload();
						        				} else {
						        					$.dialog.notice({icon : 'error',content : '您输入的工作流名称已经存在，请修改后再进行此操作！',time : 3});
						        					return false;
						        				}
				        			},"json");
					    		},
					    		cache:false
							});
						},
						cache:false
					});
					
				}else if(isEdge==true||isEdge==1||isEdge=='1'){///动作直线或曲线
					var modelid = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
					if(modelid == ''){
						$.dialog.notice({icon : 'warning',content : '请先双击开始节点进行流程初始化设置，再进行流程动作设置！',title : '3秒后自动关闭',time : 3});
 				    	return false;
					}
					var sourceCell = cell.getTerminal(true);
					var targetCell = cell.getTerminal(false);
					if(sourceCell && targetCell){
					}else{
						$.dialog.notice({icon : 'warning',content : '请确认线条已连接至开始、步骤、分支、或结束',title : '3秒后自动关闭',time : 3});
 				    	return false;
					}
					var sourceCellStyle = sourceCell.getStyle();
					// 设置分支条件 
					if(sourceCellStyle!=null&&sourceCellStyle.length>=7&&sourceCellStyle.substring(0,7)=='rhombus'&&sourceCell.getValue()=='分支'){
						var formId ="form-"+ Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue();
						$.ajax({
						    url:$.appClient.generateUrl({ESTransferFlow:'osModelConditionPage'},'x'),
						    data:{modelId:modelid,formId:formId,actionId:cell.getId()},
						    type:'post',
						    success:function(data){
						    	$.dialog({
						    		id:'OsModel_Spit_Wind_Id',
							    	title:'设置分支条件',
						    		width: '770px',
						    	    height: '270px',
						    	    padding:'0px',
						    	   	fixed:true,
						    	    resize: false,
							    	content:data,
							    	okVal:'确定',
								    ok:function(){
								    	return modelStep.saveSplitCondition(modelid,formId,cell);
								    },
								    cancelVal: '关闭',
								    cancel: true,
								    cache:false
							    });
							},
							cache:false
						});
					}else if(sourceCellStyle!=null&&sourceCellStyle.length>=7&&sourceCellStyle.substring(0,7)=='rhombus'&&sourceCell.getValue()=='聚合'){
					
					}else{//设置动作函数
						var wfmodelID = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
						var actionId = cell.getId();
						var returndata=[];
						var actionIsSaved ='0';//0为未保存
						var actionIsStartAndEnd="0";//是否是开始或结束的动作
						if(sourceCellStyle!=null&&sourceCellStyle.length>=7&&sourceCellStyle.substring(0,7)=="ellipse"){
							actionIsStartAndEnd="1";
						}	
						var targetCellStyle = targetCell.getStyle();
						if(targetCellStyle!=null&&targetCellStyle.length>=7&&targetCellStyle.substring(0,7)=="ellipse"){
							actionIsStartAndEnd="1";
						}
						$.ajax({
							url:$.appClient.generateUrl({ESTransferFlow:'osModelActionPage'},'x'),
							data:{modelId:wfmodelID,actionId:actionId,stepName:cell.getValue(),actionIsStartAndEnd:actionIsStartAndEnd},
							type:'post',
							success:function(data){
								$.dialog({
									id:'OsModel_Action_Wind_Id',
									title:'设置动作属性',
									width:'800px',
									height:'520px',
									padding:'0px',
									fixed:true,
									resize:false,
									okVal:'保存',
								    ok:true,
								    cancelVal: '关闭',
								    cancel: function(){
								    	graph.refresh();
								    	return true;
								    },
								    close:function(){
								    	graph.refresh();
								    },
						    		content:data,
						    		ok:function(){
						    			if(!$('#OsModel_Action_Form_Id').validate())return false ;
						    			var flag = modelStep.btnSaveAction(wfmodelID,cell,graph);
						    			if(flag == false) {
						    				return false;
						    			}
						    		},
						    		init:function(){
						    			var form=$('#OsModel_Action_Form_Id');
										form.autovalidate();
						    		},
						    		cache:false
								});
							},
							cache:false
						});
					}
				}
				// 分支节点：设置流程走向的条件（spit）
				else if(style!=null&&style.length>=7&&style.substring(0,7)=='rhombus'&&isEdge==false){

				}
				else if(style!=null&&style.length>=7&&style.substring(0,7)=='ellipse'&&isEdge==false&&cellValue=='结束'){
				}
				else{ ///节点矩形
					var formid = "form-"+ Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue();
					var modelid = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
					if(modelid==''){
						$.dialog.notice({icon : 'warning',content : '请先双击开始节点进行流程初始化设置，再进行流程步骤设置！',title : '3秒后自动关闭',time : 3});
 				    	return false;
 				    }
					var model = graph.getModel();
					var stepid = cell.getId();					
					var cells = this.getCells(0, 0, 100000, 1000000);
					var firstCell = null ;
					for(var i=0;i<cells.length;i++){
						var sourceCell = cells[i].getTerminal(true);
						if(null!=sourceCell&&sourceCell.getId()==2){
							tempCell = cells[i].getTerminal(false);
							if(stepid==tempCell.getId()){
								firstCell = tempCell;
							}
						}
					}
					graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#000000');
					if(null==firstCell){
						$.ajax({
							url:$.appClient.generateUrl({ESTransferFlow:'osModelStepPage'},'x'),
							data:{isFirstCell:false,formId:formid,modelId:modelid,stepId:cell.getId(),stepName:cell.getValue()},
							type:'post',
							success:function(data){
								$.dialog({
									id:'OsModel_Step_Wind_Id',
									title:'设置步骤属性',
									width:'820px',
									height:'500px',
									padding:'20px',
									fixed:true,
									resize:false,
									okVal:'保存',
								    ok:true,
								    cancelVal: '关闭',
								    cancel: function(){
								    	graph.refresh();
								    	return true;
								    },
								    close:function(){
								    	graph.refresh();
								    },
						    		content:data,
						    		ok:function(){
						    			if(!$('#OsModel_Step_Form_Id').validate())return false ;
						    			var flag = modelStep.btnSaveStepNotFirstCell(formid,modelid,cell,graph);
						    			if (flag == false) {
						    				return false;
						    			}
						    		},
						    		init:function(){
						    			var form=$('#OsModel_Step_Form_Id');
										form.autovalidate();
						    		},
						    		cache:false
								});
							},
							cache:false
						});						
					}else{						
						// 开始 之后的第一个节点
						$.ajax({
							url:$.appClient.generateUrl({ESTransferFlow:'osModelStepPage'},'x'),
							data:{isFirstCell:true,formId:formid,modelId:modelid,stepId:cell.getId(),stepName:cell.getValue()},
							type:'post',
							success:function(data){
								$.dialog({
									id:'OsModel_Step_Wind_Id',
									title:'设置步骤属性',
									width:'820px',
									height:'500px',
									padding:'20px',
									fixed:true,
									resize:false,
									okVal:'保存',
								    ok:true,
								    cancelVal: '关闭',
								    cancel: function(){
								    	graph.refresh();
								    	return true;
								    },
								    close:function(){
								    	graph.refresh();
								    },
						    		content:data,
						    		ok:function(){
						    			if(!$('#OsModel_Step_Form_Id').validate())return false ;
						    			var flag = modelStep.btnSaveStepFirstCell(formid,modelid,cell,graph);
						    			if (flag == false) {
						    				return false;
						    			}
						    		},
						    		init:function(){
						    			var form=$('#OsModel_Step_Form_Id');
										form.autovalidate();
						    		},
						    		cache:false
								});
							},
							cache:false
						});
						
					}
					
					 //fuhonyi 20101108 设置打印表单
					function initPrint(){
						$.post( $.appClient.generateUrl({ESTransferFlow : 'getReportDataList'}, 'x')
								,{flag:"true"}, function(res){
								var json=eval('(' + res + ')');
					        	var allTitle = new Array();
					        	allTitle= json.dataList;
					        	var allField ='';
								for (var i=0; i<allTitle.length; i++){
									allField +="['"+ allTitle[i].id_report+"','"+allTitle[i].title +"']";
									if(i+1!=allTitle.length){
										allField = allField +',';
									}
								}		
								var allFields =Ext.util.JSON.decode('['+allField+']'); 
								if(allFieldPrint !=null){
									allFields= allFieldPrint;
								}
								if(editFieldPrint ==null ||editFieldPrint=='' ){
									editFieldPrint = Ext.util.JSON.decode('[]');
								}

								/** xiaoxiong 20130807 添加组建是否存在判断 **/
								if(Ext.getCmp('osModel_step_selectEditField_print')){
									/** niuhe 20130620 加载加载双向选择列表Store中的数据 **/
									Ext.getCmp('osModel_step_selectEditField_print').fromMultiselect.store.loadData(allFields);
									Ext.getCmp('osModel_step_selectEditField_print').toMultiselect.store.loadData(editFieldPrint);
									Ext.getCmp('osModel_step_selectEditField_print').saveBefore = editFieldPrint;
								}

					    });
					}
				
				}
		}
			if(wind){
				wind.show(true); 
				if(showFormMask)showFormMask.hide();}
		}
	}
};
Ext.extend(MainPanel, Ext.Panel);