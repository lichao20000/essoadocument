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
    baseRequestUrl = baseRequestUrl.substring(0, baseRequestUrl.indexOf('escloudapp')-1) ;
    var bodyStyle = "background:url("+baseRequestUrl+tplPath+"/ESWorkflow/js/workflow/images/grid.gif)" ;
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
				$.post( $.appClient.generateUrl({ESWorkflow : 'getWorkFlowXml'}, 'x')
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
							$.post( $.appClient.generateUrl({ESWorkflow : 'dropWfModel'}, 'x')
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
					var selectBusiness = 'empty';
					$.ajax({ 
						url : $.appClient.generateUrl({ESWorkflow : 'getModelInit'}, 'x'), 
				    	type : "post", 
			          	data : {modelId:Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue()}, 
			          	async : false, // 同步
			          	success : function(res){
		    				var json = eval('(' + res + ')');
							var startRoles=[];
//							var allRoles =Ext.util.JSON.decode('['+json.allRoles+']'); 
							var allBusiness = [];
							esModelName = json.esModelName;
							esDescription = json.esDescription;
							var relationBusiness = json.relationBusiness;
							selectBusiness = relationBusiness;
						} 
					}); 
					
					$.ajax({
						url:$.appClient.generateUrl({ESWorkflow:'osModelInitPage'},'x'),
						success:function(data){
							wind = null;
							$.dialog({
								id:'OsModel_Init_Wind_Id',
								title:'工作流初始化设置',
								width:400,
								height:320,
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
					    		ok:function(){
					    			//验证form表单
					    			if(!$("#osModel_init_formA").validate()) return false;
					    			var isCreateWin = '0' ;
					        		if(Ext.getCmp('workflowModelMxGraph_Window')){
					        			isCreateWin = '1' ;
					        		}
							    	var postData = $("#osModel_init_formA").serialize(); 
							    	postData += "&modelId="+Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
							    	postData += "&relationBusiness="+$('#selectBusiness').val();
							    	postData += "&isCreateWin="+isCreateWin ;
							    	postData += "&userName="+userName ;
							    	$.post($.appClient.generateUrl({ESWorkflow : 'saveWFModelInit'}, 'x')
							    			,{data:postData}, function(res){
							    				var json = eval('(' + res + ')');
						        				if (json.success == 'true') {
								 				    if(json.allowChange && json.allowChange == 'false'){
								 				    	$.dialog.notice({icon : 'error',content : '包含流程实例,不允许修改关联业务！',title : '3秒后自动关闭',time : 3});
								 				    	return ;
								 				    }
								 					var modelId = json.modelId;
								 					Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').setValue(modelId);
								 				    $.dialog.notice({icon : 'succeed',content : '保存成功！',title : '3秒后自动关闭',time : 3});
						        				} else {
						        					$.dialog.notice({icon : 'error',content : '您输入的工作流名称已经存在，请修改后再进行此操作！',title : '3秒后自动关闭',time : 3});
						        				}
				        			});
					    		},
					    		init:function(){
					    			var form=$('#osModel_init_formA');
									form.autovalidate();
					    		},
					    		cache:false
							});
							$('#osModel_init_ES_MODEL_NAME').val(esModelName);
							$('#osModel_init_ES_DESCRIPTION').val(esDescription);
							$('#selectBusiness').val(selectBusiness);
						},
						cache:false
					});
					
				}else if(isEdge==true||isEdge==1||isEdge=='1'){///动作直线或曲线
					var modelid = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
					if(Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue()==''){showMsg('请先双击开始节点进行流程初始化设置，再进行流程动作设置！','3');return}
					var sourceCell = cell.getTerminal(true);
					var targetCell = cell.getTerminal(false);
					if(sourceCell&&targetCell){
					}else{
						showMsg('请确认线条已连接至开始、步骤、分支、或结束','3');return;
					}
					var sourceCellStyle = sourceCell.getStyle();
					// 设置分支条件 
					if(sourceCellStyle!=null&&sourceCellStyle.length>=7&&sourceCellStyle.substring(0,7)=='rhombus'&&sourceCell.getValue()=='分支'){
						//jiangyuntao  20100201   生成第一个分支页面  start
//						showFormMask=new Ext.LoadMask(Ext.getBody(),{msg:'正在加载规则，请稍候....'});
//						if(showFormMask)showFormMask.show();
						
						//============== start  暂时注释掉，待完善 longjunhao 20140704
						var formId = Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue()
						$.ajax({
						    url:$.appClient.generateUrl({ESWorkflow:'osModelConditionPage'},'x'),
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
						
						//=============== end
						
//						function validateBrackets(left,right){
//							var leftCount = 0 ;
//							var rightCount = 0 ;
//							for(var j=0;j<i;j++){
//								var currLeftValue = '';
//								if(Ext.getCmp(left+j)) currLeftValue = Ext.getCmp(left+j).getValue();
//								var currRightValue = '';
//								if(Ext.getCmp(right+j))currRightValue = Ext.getCmp(right+j).getValue();
//								if(currLeftValue)leftCount = leftCount+currLeftValue.length;
//								if(currRightValue)rightCount = rightCount+currRightValue.length;
//							}
//							if(leftCount != rightCount){
//								showMsg('左右括号不匹配!','3');
//								return false;
//							}
//							return true;
//						}
						/**chenjian 20130327 add 验证分支条件选择角色或机构"输入值"不输入内容保存的问题
						 * 20130415 modify 
						 * */
//						function validateCombo(comboValue,inputValue){
//							var comboCount = 0 ;
//							var inputCount = 0 ;
//							for(var j=0;j<i;j++){
//								var comboxNumber = 0;
//								var inputNumber = 0;
//								var currComboValue = '';
//								if(Ext.getCmp(comboValue+j)) currComboValue = Ext.getCmp(comboValue+j).getValue();
//								var currInputRightValue = '';
//								if(Ext.getCmp(inputValue+j))currInputRightValue = Ext.getCmp(inputValue+j).getValue();
//								if(currComboValue){
//									comboCount = comboCount+currComboValue.length;
//									comboxNumber = currComboValue.length;
//								}
//								if(currInputRightValue){
//									inputCount = inputCount+currInputRightValue.length;
//									inputNumber = currInputRightValue.length;
//								}
//								if(currComboValue == '机构'){
//									if(comboxNumber != 0 && inputNumber == 0){
//										showMsg('输入值不能为空，请从下拉列表中选择机构名称!','3');
//										return false;
//										break;
//									}
//								}else if(currComboValue == '角色'){
//									if(comboxNumber != 0 && inputNumber == 0){
//											showMsg('输入值不能为空，请从下拉列表中选择角色!','3');
//											return false;break;
//									}
//								}else if(currComboValue ==0 && inputNumber !=0){
//									showMsg('字段名不能为空，请先填写字段名称!','3');
//									return false;
//								}
//							}
//							if((comboCount !=0 && inputCount !=0 ) || (comboCount ==0 && inputCount ==0)){
//								return true;
//							}
//						
//						}
				
//						function createRowContidion(){
//							//左括号
//							new Ext.form.ComboBox({id:'wfLeftBrackets'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['',''],['(','('],['((','(('],['(((','((('],['((((','(((('],['(((((','(((((']]}),
//            					valueField:"name",editable:false,displayField:"value",mode:'local',hiddenName:'leftBracketsName'+i,
//           						hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//							});
//							
//							//右括号
//							new Ext.form.ComboBox({id:'wfRightBrackets'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['',''],[')',')'],['))','))'],[')))',')))'],['))))','))))'],[')))))',')))))']]}),
//            					valueField:"name",displayField:"value",mode:'local',hiddenName:'rightBracketsName'+i,
//           						hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//							});
//							
//							new Ext.form.ComboBox({id:'fieldCombo'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['机构','机构'],['角色','角色']]}),
//								/** jiangyuntao 20130328 edit 修改为select事件，修复bug7055 **/
//            					valueField:"name",displayField:"value",mode:'local',forceSelection:true,hiddenName:'fieldName'+i,editable:false,listeners: {select :function(){var tempid='inputField'+this.id.substring(10);Ext.getCmp(tempid).setValue(''); }},
//           						hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//							});
//							new Ext.grid.GridPanel({ 
//		          			id:'inputField'+i+'_Grid',
//		                     store:new Ext.data.Store([]),
//		                     cm:new Ext.grid.ColumnModel([])  ,
//		                     sm:new Ext.grid.CheckboxSelectionModel({singleSelect:true}),
//		                     stripeRows 	: true, enableHdMenu:false,  
//		                     width:  453,
//		                     height: 300,
//		                     tbar:new Ext.Toolbar({items:[{id:'inputField'+i+'_tbar' ,handler:function(){ 
//		                     				var tempGridComboID=this.id.substring(0,this.id.lastIndexOf('_'));
//		                     				var select = Ext.getCmp(''+tempGridComboID+'_Grid').getSelectionModel().getSelections();
//		                     				//jiangyuntao 20110817 edit 修改为角色描述而不是角色的name
//		                     				//Ext.getCmp(tempGridComboID).setValue(select[0].data.name);
//		                     				Ext.getCmp(tempGridComboID).setValue(select[0].data.description);
//		                     				Ext.getCmp(tempGridComboID).collapse();
//		                     				var hiddenvalueid='hiddenvalue'+tempGridComboID.substring(10) ;
//		                     				Ext.getCmp(hiddenvalueid).setValue(select[0].data.id); }
//		                     			,text:'选择' } 
//															,'->','请输入搜索词',new Ext.app.SearchField({id:'inputField'+i+'_serarchKeyword',name:'userSearchKeyword', width:200,
//															  //jiangyuntao 20111010 edit 增加必填项属性
//															   allowBlank:false,   
//		                                                       onTrigger2Click:function(){
//				  													   var tempgridComboID=this.id.substring(0,this.id.lastIndexOf('_'));
//				                                                       var userList_serarchKeyword=Ext.getCmp(tempgridComboID+'_serarchKeyword').getValue();
//				  													   if (null == userList_serarchKeyword || userList_serarchKeyword.trim() == ''){Ext.getCmp(tempgridComboID).collapse();Ext.getCmp(tempgridComboID+'_Grid').hide();showMsg('请先输入关键词且不能全为空格，再进行操作！','3');return ;}
//				                                                       this.triggers[0].show();this.hasSearch = false;
//				                                                       Ext.getCmp(tempgridComboID+'_Grid').getStore().baseParams = {keyWord:userList_serarchKeyword,start:0, limit:10} ;
//				                                                       Ext.getCmp(tempgridComboID+'_Grid').getStore().reload() ;
//		  													   }, 
//										                      onTrigger1Click:function(){ 
//												  						var tempgridComboID=this.id.substring(0,this.id.lastIndexOf('_'));
//												  						Ext.getCmp(tempgridComboID+'_Grid').getStore().baseParams = {keyWord:"",start:0, limit:10} ;
//					                                                    Ext.getCmp(tempgridComboID+'_Grid').getStore().reload() ;
//					                                                    this.triggers[0].hide();this.el.dom.value = '';this.hasSearch = false; 
//										                      }
//		                                                 }) 
//		                                                 ]}),
//		          			bbar : new Ext.PagingToolbar({id:'inputField'+i+'_pageBar',store:new Ext.data.Store({}),pageSize : 10,displayInfo : true,withComBox:false}),//xiaoxiong 20110919 添加withComBox:false,属性，屏蔽分页下拉框
//		                     collapsible : false,
//		                     listeners: {celldblclick:function(){
//		                     		var tempgridid=this.id.substring(0,this.id.indexOf('_'));
//		                     		var select = this.getSelectionModel().getSelections();
//		                     		//jiangyuntao 20110817 edit 修改为角色描述而不是角色的name
//		                     		//Ext.getCmp(tempgridid).setValue(select[0].data.name);
//		                     		Ext.getCmp(tempgridid).setValue(select[0].data.description);
//		                     		var hiddenvalueid='hiddenvalue'+tempgridid.substring(10) ;Ext.getCmp(hiddenvalueid).setValue(select[0].data.id);
//		                     		Ext.getCmp(tempgridid).collapse();
//		                     }},
//		                     collapsed : false 
//		                 }) ;
//						  new Ext.tree.TreePanel({  
//		             		id:'inputField'+i+'_tree',listeners: {click: function(node){var tempid=this.id.substring(0,this.id.indexOf('_'));Ext.getCmp(tempid).setValue(node.text);var hiddenvalueid='hiddenvalue'+tempid.substring(10) ;Ext.getCmp(hiddenvalueid).setValue(node.id);Ext.getCmp(tempid).collapse(); }},
//	               			autoScroll:true, animate:false, enableDD:false,
//		              		containerScroll: true,region:'center',border:false,width:  453, height: 300,
//		             		root:new Ext.tree.AsyncTreeNode({text: '机构设置', draggable:false, id:'-1'}),
//		               		loader: new Ext.tree.TreeLoader({ dataUrl:'' })
//		           	});
//							new Ext.form.ComboBox({
//    							id:'inputField'+i,
//								store:new Ext.data.SimpleStore({fields:[],data:[[]]}),
//								shadow:false,
//								mode: 'local',
//								triggerAction:'all',
//								listWidth :455,
//								maxHeight: 310,
//								tpl: '<tpl for="."><div style="height:300px"><div id="inputField'+i+'_div"></div></div></tpl>',
//								selectedClass:'',
//								name:'inputValue'+i,anchor:'100%',forceSelection:true,editable:false,hideLabel:true,
//								listeners: {expand: function(){var valueid='fieldCombo'+this.id.substring(10); 
//																	var selectValue=Ext.getCmp(valueid).getValue();
//																	var temptreeid=this.id+'_tree';var tempGridid=this.id+'_Grid'; 
//																	if(selectValue=='机构'){ 
//																	    //jiangyuntao 20110817 增加传入参数wfModel=-1，action方法中此参数不为null查询所有机构
////																		Ext.getCmp(temptreeid).loader.dataUrl = 'treeUtil.html?content.method=getOrganTreeNodes4SetWf&wfModel=-1';
//																		Ext.getCmp(temptreeid).on('beforeload', function(node){Ext.getCmp(temptreeid).loader.dataUrl = $.appClient.generateUrl({ESWorkflow : 'getOrganTreeNodes4SetWf',wfModel:'-1',node:node.id},'x'); });  
//																		Ext.getCmp(temptreeid).render(this.id+'_div');Ext.getCmp(temptreeid).root.expand();Ext.getCmp(temptreeid).show();Ext.getCmp(tempGridid).hide();
//																	}else{
//																		Ext.getCmp(tempGridid).render(this.id+'_div');Ext.getCmp(tempGridid).show();Ext.getCmp(temptreeid).hide();
//																		//jiangyuntao 20110817 edit 修改为获得所有角色方法
//																		var thisStore=new Ext.data.Store({baseParams:{start:0,limit:10,keyWord:''},proxy : new Ext.data.HttpProxy({url:$.appClient.generateUrl({ESWorkflow: 'getAllDataList'}, 'x')}),reader : new Ext.data.JsonReader({totalProperty : 'totalSize',root : 'dataList' },[{name : 'id'}, { name : 'name'}, {name : 'description'}])});
//																		//alert(Ext.getCmp(this.id+'_store'));
//																		Ext.getCmp(this.id+'_pageBar').bind(thisStore);
//																		Ext.getCmp(tempGridid).reconfigure(thisStore,
//																		/**chenjian 20130321 add 新增角色类型、所属机构两列*/
//																		/** jiangyuntao 20130712 edit 取消显示角色类型，这里指显示工作流类型的，没有必要显示 ，修复bug7959 **/
//																			new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),new Ext.grid.CheckboxSelectionModel({singleSelect:true}),{header : 'id',dataIndex : 'id',hidden:true},{header : '角色名称',dataIndex : 'name',width:150},{header : '角色描述',dataIndex : 'description',width:150}]));
//																		thisStore.load();
//																		
//																	}  
//																}},
//								onSelect:Ext.emptyFn
//							});
//							
//							new Ext.form.ComboBox({
//          					   id:'signCombo'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['等于','等于'],['不等于','不等于']]}),
//              				   valueField:"name", displayField:"value",mode:'local',forceSelection:true, hiddenName:'compare'+i,value:'等于',editable:false, hideLabel:true, triggerAction:'all', allowBlank:true,name:'compare4',anchor:'100%'
//							});
//							new Ext.form.ComboBox({
//        						id:'relationCombo'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['或者','或者'],['并且','并且']]}),
//         						valueField:"name",displayField:"value",mode:'local',forceSelection:true,hiddenName:'relation'+i,editable:false,value: '并且',hideLabel:true,triggerAction:'all',allowBlank:true,name:'relation4',anchor:'100%'
//							});
//						}
//
//						var i = 0;
//						createRowContidion();
//
//						var delfieldArr = [];
//						function delRowCondition(){
//							var thiscount = parseInt(this.id.substring(9));
//							delfieldArr.push(thiscount);
//							var temp = thiscount;
//							for(var j = 0 ; j < delfieldArr.length ; j++){
//								if(thiscount > delfieldArr[j]) temp-- ;
//							}
//							var formitems = Ext.getCmp('setCondition').items;
//							if(formitems && formitems.length>1){
//								if(formitems.length<8)addRowCondition();
//								var itemID= formitems.get(temp+1).getId();  //加1是因为第一行是标题，不参与行删除
//								Ext.getCmp('setCondition').remove(itemID);
//							}
//						}
//						function addRowCondition(){
//							i++;
//							createRowContidion();
//							conditionFormarchiveGrid.add({	columnWidth:1.5,layout:'column',
//				            		items:[
//				            			{
//				            		    	columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('wfLeftBrackets'+i)
//				          				},{
//				            				columnWidth:0.15,layout:'form',border:false,items:Ext.getCmp('fieldCombo'+i)
//				          				},{
//				           					columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('signCombo'+i)
//				               			},{
//				             				columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('inputField'+i)
//				        				},{
//				        					columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('wfRightBrackets'+i)
//				        				},{
//				        					columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('relationCombo'+i)
//				         			},new Ext.form.Hidden({id:'hiddenvalue'+i,name:'hiddenvalue'+i,value:''})
//									 ,{
//				        					columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'add-icon',tooltip:'增加一行',handler:addRowCondition,bodyBorder:false,id:'addrowbut'+i})]
//				         			},{
//				        					columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'del-icon',tooltip:'删除一行',handler:delRowCondition,bodyBorder:false,id:'delrowbut'+i})]
//				         			}]
//				         		});
//											//alert(Ext.getCmp);
//							//Ext.getCmp('OsModel_Spit_Wind_Id').setWidth(180);
//							//conditionFormarchiveGrid.setWidth(180);
//							if(Ext.getCmp('OsModel_Spit_Wind_Id'))Ext.getCmp('OsModel_Spit_Wind_Id').doLayout();
//							
//						}

//						var conditionFormarchiveGrid;  
//						conditionFormarchiveGrid=new Ext.FormPanel({
//							id:'setCondition',
//							//labelAlign:'right',frame:true,autoHeight:true,width:684,labelWidth:80,
//							labelAlign:'right',frame:true,width:704,autoHeight:true,labelWidth:80,
//				     		items:[{columnWidth:0.95,layout:'column', 
//				                  items:[
//				                  { columnWidth:0.1,html:'<b>左括号</b>'}, 
//				                  { columnWidth:0.15,html:'<b>字段名</b>'}, 
//				                 			{ columnWidth:0.2,html:'<b>比较符</b>'}, 
//				            	 { columnWidth:0.2,html:'<b>输入值</b>'}, 
//				            	 { columnWidth:0.1,html:'<b>右括号</b>'}, 
//				   		         { columnWidth:0.1,html:'<b>关系符</b>'},
//								 { columnWidth:0.05,html:'<b>增加</b>'},
//								 { columnWidth:0.05,html:'<b>删除</b>'}
//								 ] 
//				      	      },{	columnWidth:1.5,layout:'column',  // Brackets
//				            		items:[
//				            		    {
//				            		    	columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('wfLeftBrackets'+0)
//				          				},{
//				          					columnWidth:0.15,layout:'form',border:false,items:Ext.getCmp('fieldCombo'+0)
//				          				},{
//				           					columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('signCombo'+0)
//				               			},{
//				             				columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('inputField'+0)
//				        				},{
//				        					columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('wfRightBrackets'+0)
//				        				},{
//				        					columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('relationCombo'+0)
//				         			},new Ext.form.Hidden({id:'hiddenvalue0',name:'hiddenvalue0',value:''})
//									 ,{
//				        					columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'add-icon',tooltip:'增加一行',handler:addRowCondition,bodyBorder:false,id:'addrowbut0'})]
//				         			},{
//				        					columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'del-icon',tooltip:'删除一行',handler:delRowCondition,bodyBorder:false,id:'delrowbut0'})]
//				         			}]
//				         		}
//								],  
//             	buttons:[{  
//           		text:'确定',handler:function () {
//           			var check = validateBrackets('wfLeftBrackets','wfRightBrackets'); 
//           			if(!check) return ;
//           			/**chenjian 20130327 add 验证分支条件选择角色或机构"输入值"不输入内容保存的问题*/
//           			var checkVaildataCombo = validateCombo('fieldCombo','inputField');
//           			if(!checkVaildataCombo)return;
//           			var postData = $("#"+$("#setCondition").find("form")[0].id).serialize(); 
//			    	postData += "&conditionCount="+(i+1)+"&check=left&actionId="+cell.getId()+"&modelId="+Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue()+"&stepId="+cell.getTerminal(true).getId()+"&formId="+Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue() ;
//			    	$.post( $.appClient.generateUrl({ESWorkflow : 'saveSplitCondition'}, 'x')
//		    			,{data:postData}, function(res){
//		    				var json = eval("(" + res + ")") ;
//		    				if(json.success == "true"){
//		    					showMsg('设置分支条件成功！','1');
//		    				} else {
//		    					showMsg('设置分支条件失败！','2');
//		    				}
//		    			});
//           		}  
//           	},  
//           	{text:'取消',handler:function () {  
//           		Ext.getCmp('OsModel_Spit_Wind_Id').hide();
//           		for(var i=0;i<currCheckCount;i++){
//           			if(Ext.getCmp('relationCombo'+i))Ext.getCmp('relationCombo'+i).destroy();
//           			if(Ext.getCmp('inputField'+i))Ext.getCmp('inputField'+i).destroy();
//           			if(Ext.getCmp('signCombo'+i))Ext.getCmp('signCombo'+i).destroy();
//           			if(Ext.getCmp('fieldCombo'+i))Ext.getCmp('fieldCombo'+i).destroy();          
//           			if(Ext.getCmp('otherfieldCombo'+i))Ext.getCmp('otherfieldCombo'+i).destroy();
//           			if(Ext.getCmp('othersignCombo'+i))Ext.getCmp('othersignCombo'+i).destroy();
//           			if(Ext.getCmp('otherinputvalue'+i))Ext.getCmp('otherinputvalue'+i).destroy();
//           			if(Ext.getCmp('otherrelationCombo'+i))Ext.getCmp('otherrelationCombo'+i).destroy();
//           		}
//           			if(Ext.getCmp('setOtherCondition')){Ext.getCmp('setOtherCondition').destroy();}
//           			Ext.getCmp('setCondition').destroy();
//           			if(Ext.getCmp('setConditionTabP')){Ext.getCmp('setConditionTabP').destroy();}
//           			Ext.getCmp('OsModel_Spit_Wind_Id').destroy();
//           			graph.refresh();
//            		}  
//            	}]  
//            });  
//			var currCheckCount = i ;
//			addRowCondition();addRowCondition();addRowCondition();addRowCondition();addRowCondition();
			

	//jiangyuntao  20100201   生成第一个分支页面  end			
		//jiangyuntao 20100202  	生成第二个分支页面	start	要动态生成表单字段下拉 ，因此在callback中生成第二个分支页面form    window在第二个界面加载时生成
//			      			$.post( $.appClient.generateUrl({ESWorkflow : 'getConditionToShow'}, 'x')
//										,{modelId:Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue(),formId:Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue(),actionId:cell.getId()}, function(res){
//		      					var json=eval('(' + res + ')');
//			      				var fieldList=json.fieldList;
//			      				var tempIDs=json.tempIDs;
//			      				
//			      				var data;
//								var rightCondition=json.rightCondition;
//								var showfieldstr=json.showfieldstr;
//								var fieldName=json.fieldName;
//								var fieldType=json.fieldType;
//								//var rightIDs=json.rightIDs;
//								
//			      				//jiangyuntao 20100203  第一个分支界面已设置的条件自动选择				
//			      				if(fieldList&&fieldList.length>2){
//			      					var condition=fieldList.substring(1,fieldList.length-4);
//			      					var tempConID=tempIDs.substring(1,tempIDs.length-4);
//									var strs=condition.split('&|&');
//									var idstr=tempConID.split('&|&');
//									var j=0;
//									for(var i=0;i<strs.length;i++){
//										if(j>5)addRowCondition();
//										if(strs[i]&&strs[i].indexOf('(')>-1){Ext.getCmp('wfLeftBrackets'+j).setValue(strs[i]);i++} else if(strs[i] == ' ')i++;
//										Ext.getCmp('fieldCombo'+j).setValue(strs[i]);i++;
//           								Ext.getCmp('signCombo'+j).setValue(strs[i]);i++;
//             							Ext.getCmp('inputField'+j).setValue(strs[i]);Ext.getCmp('hiddenvalue'+j).setValue(idstr[i]);i++;
//										if(strs[i]&&strs[i].indexOf(')')>-1){Ext.getCmp('wfRightBrackets'+j).setValue(strs[i]);i++} else if(strs[i] == ' ')i++;
//        								if(strs[i]&&Ext.getCmp('relationCombo'+j)){Ext.getCmp('relationCombo'+j).setValue(strs[i]);}
//										j++;
//									}
//			      				}
//
////								var a = fieldName.split(',');
////								var b =fieldType.split(',');
//			      				if(showfieldstr){
//									data=Ext.util.JSON.decode('['+showfieldstr+']');
//									/*******chenjian 20130410 modify 添加增加按钮 start************/
////									for(var i=0;i<6;i++){
//									function createOtherRowContidion(){
//									
//										//左括号
//										new Ext.form.ComboBox({id:'otherleftBrackets'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['',''],['(','('],['((','(('],['(((','((('],['((((','(((('],['(((((','(((((']]}),
//			            					valueField:"name",editable:false,displayField:"value",mode:'local',hiddenName:'leftBracketsName'+i,
//			           						hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//										});
//										//右括号
//										new Ext.form.ComboBox({id:'otherrightBrackets'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['',''],[')',')'],['))','))'],[')))',')))'],['))))','))))'],[')))))',')))))']]}),
//			            					valueField:"name",displayField:"value",mode:'local',hiddenName:'rightBracketsName'+i,
//			           						hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//										});
//									
//										new Ext.form.ComboBox({id:'otherfieldCombo'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:data}),
//            								valueField:"name",displayField:"value",mode:'local',forceSelection:true,hiddenName:'fieldName'+i,editable:false,
//            								//listeners: {change :function(){var tempid='inputField'+this.id.substring(10);Ext.getCmp(tempid).setValue(''); }},
//           									hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//           									
//										});
//										new Ext.form.TextField({id:'otherinputvalue'+i,name:'hiddenvalue0',anchor:'100%',hideLabel:true});
//										new Ext.form.ComboBox({
//          					   				id:'othersignCombo'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['等于','等于'],['不等于','不等于'],['大于','大于'],['小于','小于'],['大于等于','大于等于'],['小于等于','小于等于'],['包含','包含'],['不包含','不包含']]}),
//              				   				valueField:"name", displayField:"value",mode:'local',forceSelection:true, hiddenName:'compare'+i,value:'等于',editable:false, hideLabel:true, triggerAction:'all', allowBlank:true,anchor:'100%'
//              				   				
//										});
//										new Ext.form.ComboBox({
//        									id:'otherrelationCombo'+i,store:new Ext.data.SimpleStore({fields: ['name','value'],data:[['或者','或者'],['并且','并且']]}),
//         									valueField:"name",displayField:"value",mode:'local',forceSelection:true,hiddenName:'relation'+i,editable:false,value: '并且',hideLabel:true,triggerAction:'all',allowBlank:true,anchor:'100%'
//										});
////									}
//								}
//									var i = 0;
//									createOtherRowContidion();
//									var delotherfieldArr = [];
//									function delRowConditionfromForm(){
//										var thisothercount = parseInt(this.id.substring(14));
//										
//										delotherfieldArr.push(thisothercount);
//										var othertemp = thisothercount;
//										for(var j = 0 ; j < delotherfieldArr.length ; j++){
//												if(thisothercount > delotherfieldArr[j]) othertemp-- ;
//											}
//											var otherformitems = Ext.getCmp('setOtherCondition').items;
//											if(otherformitems && otherformitems.length>1){
//												if(otherformitems.length<8)addOtherRowCondition();
//												var otheritemID= otherformitems.get(othertemp+1).getId();  /**加1是因为第一行是标题，不参与行删除*/
//												Ext.getCmp('setOtherCondition').remove(otheritemID);
//											}
//									}
//					
//				/**function delRowConditionfromForm(){
//					var thiscount = this.id.substring(17);
//					Ext.getCmp('otherfieldCombo'+thiscount).setValue('');
//					Ext.getCmp('otherinputvalue'+thiscount).setValue('');
//				}*/
//									function addOtherRowCondition(){
//										i++;
//										createOtherRowContidion();
//										otherConditionForm.add({columnWidth:1.5,layout:'column',
//										
//											items:[
//												{
//													columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('otherleftBrackets'+i)
//												},{
//													columnWidth:0.15,layout:'form',border:false,items:Ext.getCmp('otherfieldCombo'+i)
//												},{
//													columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('othersignCombo'+i)
//												},{
//													columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('otherinputvalue'+i)
//												},{
//													columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('otherrightBrackets'+i)
//												},{
//													columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('otherrelationCombo'+i)
//												}//,new Ext.form.Hidden({id:'hiddenvalue'+i,name:'hiddenvalue'+i,value:''})
//												 ,{
//									        		columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'add-icon',tooltip:'增加一行',handler:addOtherRowCondition,bodyBorder:false,id:'addOtherrowbut'+i})]
//									         	},{
//									        		columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'del-icon',tooltip:'删除一行',handler:delRowConditionfromForm,bodyBorder:false,id:'delOtherrowbut'+i})]
//									         	}
//											]
//										});
//											if(Ext.getCmp('OsModel_Spit_Wind_Id'))Ext.getCmp('OsModel_Spit_Wind_Id').doLayout();
//									}
//						var otherConditionForm;	
//						otherConditionForm=	new Ext.FormPanel({
//							id:'setOtherCondition',
////							labelAlign:'right',frame:true,autoHeight:true,width:704,labelWidth:80,
//							labelAlign:'right',frame:true,width:704,autoHeight:true,labelWidth:80,
//     		items:[{columnWidth:0.95,layout:'column', 
//                  items:[
//                  { columnWidth:0.1,html:'<b>左括号</b>'}, 
//                  { columnWidth:0.15,html:'<b>字段名</b>'}, 
//                  { columnWidth:0.2,html:'<b>比较符</b>'}, 
//            	  { columnWidth:0.2,html:'<b>输入值</b>'}, 
//            	  { columnWidth:0.1,html:'<b>右括号</b>'}, 
//   		          { columnWidth:0.1,html:'<b>关系符</b>'},
//   		          { columnWidth:0.05,html:'<b>增加</b>'},
//   		          { columnWidth:0.05,html:'<b>删除</b>'}] 
//      	      },{	columnWidth:1.5,layout:'column',
//            		items:[
//            			{
//            				columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('otherleftBrackets'+0)//左括号
//            			},
//            			{
//            				columnWidth:0.15,layout:'form',border:false,items:Ext.getCmp('otherfieldCombo'+0)//字段名
//          				},{
//           					columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('othersignCombo'+0)//比较符
//               			},{
//             				/**columnWidth:0.2,layout:'form',border:false,items:new Ext.form.TextField({id:'otherinputvalue'+0,name:'hiddenvalue0',width:250,hideLabel:true})*/
//             				columnWidth:0.2,layout:'form',border:false,items:Ext.getCmp('otherinputvalue'+0)//输入值
//        				},
//        				{
//            				columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('otherrightBrackets'+0)//右括号
//            			},
//        				{
//        					columnWidth:0.1,layout:'form',border:false,items:Ext.getCmp('otherrelationCombo'+0)//关系符
//         			    }//,new Ext.form.Hidden({id:'hiddenvalue0',name:'hiddenvalue0',value:''})
//         				,{
//				        	columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'add-icon',tooltip:'增加一行',handler:addOtherRowCondition,bodyBorder:false,id:'addOtherrowbut'+0})]
//				         },{
//				        	columnWidth:0.05,layout:'form',border:false,items:[new Ext.Button({iconCls:'del-icon',tooltip:'删除一行',handler:delRowConditionfromForm,bodyBorder:false,id:'delOtherrowbut'+0})]
//				         			}]
//         		}],  
//         		/************************end*****************************/
//             	buttons:[{  
//           		text:'确定',handler:function () { 
//           			var check = validateBrackets('otherleftBrackets','otherrightBrackets'); 
//           			if(!check) return ;
//           			var postData = $("#"+$("#setOtherCondition").find("form")[0].id).serialize(); 
//			    	postData += "&conditionCount=6&check=right&actionId="+cell.getId()+"&modelId="+Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue()+"&stepId="+cell.getTerminal(true).getId()+"&formId="+Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue() ;
//			    	$.post( $.appClient.generateUrl({ESWorkflow : 'saveSplitCondition'}, 'x')
//		    			,{data:postData}, function(res){
//		    				var json = eval("(" + res + ")") ;
//		    				if(json.success == "true"){
//		    					showMsg('设置分支条件成功！','1');
//		    				} else {
//		    					showMsg('设置分支条件失败！','2');
//		    				}
//		    			});
//           		}  
//           	},  
//           	{text:'取消',handler:function () {  
//           		Ext.getCmp('OsModel_Spit_Wind_Id').hide();
//           		//xiaoxiong 20110920 给下边的销毁组件添加一个判断，如果存在再销毁
//           		for(var i=0;i<currOtherCheckCount;i++){
//           			if(Ext.getCmp('relationCombo'+i))Ext.getCmp('relationCombo'+i).destroy();
//           			if(Ext.getCmp('inputField'+i))Ext.getCmp('inputField'+i).destroy();
//           			if(Ext.getCmp('signCombo'+i))Ext.getCmp('signCombo'+i).destroy();
//           			if(Ext.getCmp('fieldCombo'+i))Ext.getCmp('fieldCombo'+i).destroy();          
//           			if(Ext.getCmp('otherfieldCombo'+i))Ext.getCmp('otherfieldCombo'+i).destroy();
//           			if(Ext.getCmp('othersignCombo'+i))Ext.getCmp('othersignCombo'+i).destroy();
//           			if(Ext.getCmp('otherinputvalue'+i))Ext.getCmp('otherinputvalue'+i).destroy();
//           			if(Ext.getCmp('otherrelationCombo'+i))Ext.getCmp('otherrelationCombo'+i).destroy();
//           		}
//           			if(Ext.getCmp('setOtherCondition')){Ext.getCmp('setOtherCondition').destroy();}
//           			if(Ext.getCmp('setCondition')){Ext.getCmp('setCondition').destroy();}
//           			if(Ext.getCmp('setConditionTabP')){Ext.getCmp('setConditionTabP').destroy();}
//           			Ext.getCmp('OsModel_Spit_Wind_Id').destroy();
//           			graph.refresh();
//            		}  
//            	}]  
//            });  	
//            var currOtherCheckCount = i ;
//			addOtherRowCondition();addOtherRowCondition();addOtherRowCondition();addOtherRowCondition();addOtherRowCondition();
//					//jiangyuntao 20100203  第二个分支界面已设置的条件自动选择				
//				if(rightCondition&&rightCondition.length>2){
//									var condition=rightCondition.substring(1,rightCondition.length-4);
//									var strs=condition.split('&|&');
//									var j=0;
//									for(var i=0;i<strs.length;i++){
//									
//										if(strs[i]&&strs[i].indexOf('(')>-1){Ext.getCmp('otherleftBrackets'+j).setValue(strs[i]);i++} else if(strs[i] == ' ')i++;
//										Ext.getCmp('otherfieldCombo'+j).setValue(strs[i]);i++;
//           								Ext.getCmp('othersignCombo'+j).setValue(strs[i]);i++;
//             							Ext.getCmp('otherinputvalue'+j).setValue(strs[i]);i++;
//										if(strs[i]&&strs[i].indexOf(')')>-1){Ext.getCmp('otherrightBrackets'+j).setValue(strs[i]);i++} else if(strs[i] == ' ')i++;
//        								if(strs[i]&&Ext.getCmp('otherrelationCombo'+j)){Ext.getCmp('otherrelationCombo'+j).setValue(strs[i]);}
//										j++;
//									
//									}
//								}					
////			wind = new Ext.Window({//xiaoxiong 20110919 修改窗体样式
////							id:'OsModel_Spit_Wind_Id',title:'设置分支条件',layout:'fit',resizable  : false,
////							width:738,autoHeight : true,modal:true,resize:false,plain: true,autoDestroy:true,
////							items: new Ext.TabPanel({ id:'setConditionTabP',activeTab:0,    //设置默认选择的选项卡 
////					        width:728,border:false, height:268, deferredRender :false,//延迟加载
////					        layoutOnTabChange:true,
////					        items:[ 
////					            { 
////					                title:"根据机构设置分支条件",autoScroll:true,border:false,
////					                items:conditionFormarchiveGrid
////					            } , { 
////					                title:"根据表单字段设置分支条件", autoScroll:true,border:false,
////					                items:otherConditionForm
////					            } 
////					          ] 
////					    	})
////					    	,closable : false  
////						});
////						wind.show();
////						if(showFormMask)showFormMask.hide();//xiaoxiong 20101019
////								}else{
////									wind = new Ext.Window({//xiaoxiong 20120328 修改窗体样式 避免出现滚动条
////							id:'OsModel_Spit_Wind_Id',title:'设置分支条件',layout:'fit',resizable  : false,
////							//width:720,height:280,modal:true,resize:false,plain: true,autoDestroy:true,
////							width:738,autoHeight : true,modal:true,resize:false,plain: true,autoDestroy:true,
////							items: new Ext.TabPanel({ id:'setConditionTabP',activeTab:0,    //设置默认选择的选项卡 
////					        //width:720, height:280, deferredRender :false,//延迟加载
////					        width:728, border:false,height:268, deferredRender :false,//延迟加载
////					        layoutOnTabChange:true,
////					        items:[ 
////					            { 
////					                title:"根据机构设置分支条件", autoScroll:true,
////					                items:conditionFormarchiveGrid
////					            }, 
////					            { 
////					                title:"根据表单字段设置分支条件", 
////					                html:"你还没有为工作流模板关联表单"
////					            } 
////					          ] 
////					    	})
////					    	,closable : false 
////						});
////						wind.show();
////						if(showFormMask)showFormMask.hide();//xiaoxiong 20101019
//						//wind.addListener('close',function(){
//							//graph.refresh();
//						//});						
//								
//								}
//						});
				//jiangyuntao 20100202  	生成第二个分支页面	end		
						
					}else if(sourceCellStyle!=null&&sourceCellStyle.length>=7&&sourceCellStyle.substring(0,7)=='rhombus'&&sourceCell.getValue()=='聚合'){
					
					}else{//设置动作函数
						var wfmodelID = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
						var actionId = cell.getId();
						//jiangyuntao 20100129  将已设置的方法在双向列表右边显示
						var returndata=[];
						var actionIsSaved ='0';    //jiangyuntao 20101013 判断当前动作是否已保存   0为未保存
					
						$.ajax({
							url:$.appClient.generateUrl({ESWorkflow:'osModelActionPage'},'x'),
							data:{modelId:wfmodelID,actionId:actionId,stepName:cell.getValue()},
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
								modelStep.stepOrganSelectForActionEvent(wfmodelID,actionId);
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
					var formid = Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue();
					var modelid = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
					if(modelid==''){showMsg('请先双击开始节点进行流程初始化设置，再进行流程步骤设置！','3');return}
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
							url:$.appClient.generateUrl({ESWorkflow:'osModelStepPage'},'x'),
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
								modelStep.stepOrganSelect(modelid,cell.getId());
							},
							cache:false
						});
						
					}else{
						// 开始 之后的第一个节点
						$.ajax({
							url:$.appClient.generateUrl({ESWorkflow:'osModelStepPage'},'x'),
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
						$.post( $.appClient.generateUrl({ESWorkflow : 'getReportDataList'}, 'x')
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
				//initPrint();
				if(showFormMask)showFormMask.hide();}
		}
	}
// jiang add 20090805 end

};

Ext.extend(MainPanel, Ext.Panel);
