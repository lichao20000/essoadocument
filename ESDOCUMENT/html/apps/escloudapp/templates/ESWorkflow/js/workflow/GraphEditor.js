GraphEditor = {};
function graphWorkflow(graphXml)
{	
	var tplPath =  $("#workflowDataGridDiv").attr("tplPath") ;
	// longjunhao 20140830 add
	if(tplPath==null){
		tplPath = $("#createWorkflowDiv").attr("tplPath") ;
	}
//    Ext.QuickTips.init();
	// Disables browser context menu
	mxEvent.disableContextMenu(document.body);	
	// Makes the connection are smaller
	mxConstants.DEFAULT_HOTSPOT = 0.3;
	// Creates the graph and loads the default stylesheet
    var graph = new mxGraph();
    // Creates the command history (undo/redo)
    var history = new mxUndoManager();
	//alert(mxUtils);
    // Loads the default stylesheet into the graph
    var node = mxUtils.load(tplPath+'/ESWorkflow/js/workflow/resources/default-style.xml').getDocumentElement();
    var dec = new mxCodec(node.ownerDocument);
	dec.decode(node, graph.getStylesheet());
	// Sets the style to be used when an elbow edge is double clicked
	graph.alternateEdgeStyle = 'vertical';
	// Creates the main containers
	var mainPanel = new MainPanel(graph, history);
	var library = new LibraryPanel();
    // Creates the container for the outline
	var outlinePanel = new Ext.Panel({
		id:'outlinePanel',
		layout: 'fit',
		split: true,
		height: 200,
		border:false,
        style:'border-top:1px solid #99BBE8;',
        region:'south'
    });
    new Ext.form.FormPanel({
    	id:'osWfModel_custom_form_hidden',
    	border:false,
    	method:'POST',
    	items:[
    		new Ext.form.Hidden({id:'osWfModel_custom_form_init_hidden_Model_ID',name:'osWfModel_custom_form_hidden_Model_ID',value:''})
    		,new Ext.form.Hidden({id:'osFormBuilder_custom_form_init_hidden_Form_ID',name:'osFormBuilder_custom_form_init_hidden_Form_ID',value:''})
    		,new Ext.form.Hidden({id:'osWfModel_custom_form_init_hidden_Model_Type_ID',name:'osWfModel_custom_form_init_hidden_Model_Type_ID',value:''})
    		]
    	,renderTo:'wfModel_graph_hidden_form'
    });
	// Creates the enclosing viewport
//    Ext.onReady(function() {
//	var parentWind = null;
//	if(Ext.getCmp('workflowModelModify_MxGraph_Window')){
//		parentWind = Ext.getCmp('workflowModelModify_MxGraph_Window')
//	}else if(Ext.getCmp('workflowModelMxGraph_Window')){
//		parentWind = Ext.getCmp('workflowModelMxGraph_Window');
//	}else{
//		if(Ext.getCmp('formBuilderManagerCreateWorkflow_Window')){
//			parentWind = Ext.getCmp('formBuilderManagerCreateWorkflow_Window');
//		}
//	}
//	parentWind.on('resize', function(pw,w,h) {
//		Ext.getCmp('wfGraphEditorPanelId').setWidth(w-15);
//		Ext.getCmp('wfGraphEditorPanelId').setHeight(h-40);
//	});
    new Ext.Panel(
//        var viewport = new Ext.Viewport(
//    var viewport = new Ext.Container (
    {
    	layout:'border',
    	height:500,// longjunhao 20140821 增加画布的高度
//    	autoWidth:true,
    	width:900,
    	border:false,
    	style:'border-top:1px solid #99BBE8;border-bottom:1px solid #99BBE8;',
    	renderTo:'wfModel_graph',
    	id : 'wfGraphEditorPanelId',
    	items:[
            new Ext.Panel({
            	title: '模板',
		        region:'west',
		        layout:'border',
		        split:true,
		        width: 100,
		        id:'workflowLeftTemps',
//		        collapsible: true,
//		        collapsed :false,
		        border: false,
		        style:'border-left:1px solid #99BBE8;border-right:1px solid #99BBE8;',
		        items:  [ library ,outlinePanel]
	    	})
        	,mainPanel
       	]
    }); // end of new Viewport
    // jiang add destroy 20101118
    Ext.getCmp('wfGraphEditorPanelId').on('destroy',function(){
    	if(null!=graph){
    		graph.destroy();
    		graph = null;
    	}
    	mainPanel=null;
    	library = null;
    	history=null;
    	if(null!=tooltip){
	    	tooltip.destroy();
	    	tooltip = null;
    	}
    	if(Ext.getCmp('workflowModelModify_MxGraph_Window')){Ext.getCmp('workflowModelModify_MxGraph_Window').destroy();return false;};  
		if(Ext.getCmp('workflowModelMxGraph_Window')){Ext.getCmp('workflowModelMxGraph_Window').destroy();return false;}
		if(Ext.getCmp('outlinePanel')){Ext.getCmp('outlinePanel').destroy();}
    	if(Ext.getCmp('wfGraphEditorPanelId')){Ext.getCmp('wfGraphEditorPanelId').destroy();}
    	if(Ext.getCmp('formBuilderManagerCreateWorkflow_Window')){Ext.getCmp('formBuilderManagerCreateWorkflow_Window').destroy();}
    	if(Ext.getCmp('formBuilderManagercheckworkflow_Window')){Ext.getCmp('formBuilderManagercheckworkflow_Window').destroy();}
//    	Ext.getCmp('outlinePanel').destroy();
    	
    });
    // Enables scrollbars for the graph container to make it more
    // native looking, this will affect the panning to use the
    // scrollbars rather than moving the container contents inline
   	mainPanel.graphPanel.body.dom.style.overflow = 'auto';//jiang20091019
   	
    // FIXME: For some reason the auto value is reset to hidden in
    // Safari on the Mac, this is _probably_ caused by ExtJs
   	if (mxClient.IS_MAC &&
   			mxClient.IS_SF)
	{
   		graph.addListener(mxEvent.SIZE, function(graph)
   		{
   			graph.container.style.overflow = 'auto';
   		});
	}

	// Initializes the graph as the DOM for the panel has now been created	
    graph.init(mainPanel.graphPanel.body.dom);
//    graph.setConnectable(true);
//	graph.setDropEnabled(true);
//    graph.setPanning(true);
//    graph.setTooltips(true);//jiang note20100116
    graph.connectionHandler.setCreateTarget(true);

	// Creates rubberband selection
    var rubberband = new mxRubberband(graph);

	// Adds some example cells into the graph
    var parent = graph.getDefaultParent();
	graph.getModel().beginUpdate();
	try
	{
		if(null!=graphXml&&graphXml!=''){
			var doc = mxUtils.parseXml(graphXml); 
			var dec = new mxCodec(doc); 
			dec.decode(doc.documentElement, graph.getModel()); 
		}else{
			var v1 = graph.insertVertex(parent, null,'开始', 20, 20, 100, 40,'ellipse;fillColor=#FF0000;fontColor=#000000');
			var v2 = graph.insertVertex(parent, null,'结束', 600, 260, 100, 40,'ellipse;fillColor=#FF0000;fontColor=#000000');
		}
		//var e1 = graph.insertEdge(parent, null, '����', v1, v2,'straight');
	}
	finally
	{
		// Updates the display
		graph.getModel().endUpdate();
	}
		    
    // Installs the command history after the initial graph
    // has been created
	var listener = function(sender, evt)
	{
		history.undoableEditHappened(evt.getArgAt(0)/*edit*/);
	};
	
	graph.getModel().addListener(mxEvent.UNDO, listener);
	graph.getView().addListener(mxEvent.UNDO, listener);

	// Toolbar object for updating buttons in listeners
	var toolbarItems = mainPanel.graphPanel.getTopToolbar().items;
	mainPanel = null // jiang20101118   
    // Updates the states of all buttons that require a selection
    var selectionListener = function()
    {
    	var selected = !graph.isSelectionEmpty();
    	var cell=graph.getSelectionCell();
    	//jiangyuntao 20110804 edit 增加判断，如果是开始或结束节点，则禁用剪切，复制，粘贴，删除按钮
    	//if(cell&&(cell.getValue()=='开始'||cell.getValue()=='结束')){
    	//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
      	if(cell){
	      	var thisSstyle = cell.getStyle();
			var thisCellValue = cell.getValue();
			var thisIsEdge= cell.isEdge();
			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
	            toolbarItems.get('cut').setDisabled(true);
	    		toolbarItems.get('copy').setDisabled(true);
	    		toolbarItems.get('delete').setDisabled(true);	
	    		//toolbarItems.get('paste').setDisabled(true);
	    		toolbarItems.get('paste').setDisabled(mxClipboard.isEmpty());//xiaoxiong 20120326 修改粘贴按钮是否可用控制
	        }else{
	    		toolbarItems.get('cut').setDisabled(!selected);
	    		toolbarItems.get('copy').setDisabled(!selected);
	    		toolbarItems.get('delete').setDisabled(!selected);
	    		//toolbarItems.get('paste').setDisabled(!selected);
		        toolbarItems.get('paste').setDisabled(mxClipboard.isEmpty());//xiaoxiong 20120326 修改粘贴按钮是否可用控制
	        }
      	}
    	toolbarItems.get('italic').setDisabled(!selected);
    	toolbarItems.get('bold').setDisabled(!selected);
    	toolbarItems.get('underline').setDisabled(!selected);
    	toolbarItems.get('fillcolor').setDisabled(!selected);
    	toolbarItems.get('fontcolor').setDisabled(!selected);
    	toolbarItems.get('linecolor').setDisabled(!selected);
    	toolbarItems.get('align').setDisabled(!selected);
    };
    
    graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionListener);

    // Updates the states of the undo/redo buttons in the toolbar
    var historyListener = function()
    {
    	toolbarItems.get('undo').setDisabled(!history.canUndo());
    	toolbarItems.get('redo').setDisabled(!history.canRedo());
    };

	history.addListener(mxEvent.ADD, historyListener);
	history.addListener(mxEvent.UNDO, historyListener);
	history.addListener(mxEvent.REDO, historyListener);
	
	// Updates the button states once
	selectionListener();
	historyListener();
	
    // Installs outline in outlinePanel
	var outline = new mxOutline(graph, outlinePanel.body.dom);
	
    // Adds the entries into the library
   insertVertexTemplate(library, graph, '节点', tplPath+'/ESWorkflow/js/workflow/images/rectangle.gif', 'rounded=1;fontColor=#000000', 100, 40,'审批步骤');
//   insertVertexTemplate(library, graph, '节点', tplPath+'/ESWorkflow/js/workflow/images/rectangle.gif', 'rounded=1', 100, 40);
  //  insertVertexTemplate(library, graph,'开始', tplPath+'/ESWorkflow/js/workflow/images/ellipse.gif', 'ellipse;fillColor=#FF0000;fontColor=#000000', 100, 40,'开始');
//	insertVertexTemplate(library, graph, '结束', tplPath+'/ESWorkflow/js/workflow/images/ellipse.gif', 'ellipse;strokeColor=#99CC00;fillColor=#99CC00;fontColor=#000000', 100, 40,'结束');
    insertVertexTemplate(library, graph, '分支',tplPath+'/ESWorkflow/js/workflow/images/rhombus.gif', 'rhombus;fontColor=#000000', 100, 40,'分支');
    insertVertexTemplate(library, graph, '聚合',tplPath+'/ESWorkflow/js/workflow/images/rhombus.gif', 'rhombus;fontColor=#000000', 100, 40,'聚合');
    insertEdgeTemplate(library, graph, '直线', tplPath+'/ESWorkflow/js/workflow/images/straight.gif', 'straight', 100, 100,'同意');
	insertEdgeTemplate(library, graph, '曲线', tplPath+'/ESWorkflow/js/workflow/images/connect.gif', '', 100, 100,'同意');
//    insertVertexTemplate(library, graph, 'Triangle', tplPath+'/ESWorkflow/js/workflow/images/triangle.gif', 'triangle', 40, 60);
//    insertVertexTemplate(library, graph, 'Container', tplPath+'/ESWorkflow/js/workflow/images/swimlane.gif', 'swimlane', 200, 200, 'Container');
//    insertVertexTemplate(library, graph, 'Double Ellipse', tplPath+'/ESWorkflow/js/workflow/images/doubleellipse.gif', 'ellipse;shape=doubleEllipse', 60, 60);
//    
//	insertVertexTemplate(library, graph, 'Horizontal Line', tplPath+'/ESWorkflow/js/workflow/images/hline.gif', 'line', 120, 10);
//    insertVertexTemplate(library, graph, 'Hexagon', tplPath+'/ESWorkflow/js/workflow/images/hexagon.gif', 'shape=hexagon', 80, 60);
//    insertVertexTemplate(library, graph, 'Cylinder', tplPath+'/ESWorkflow/js/workflow/images/cylinder.gif', 'shape=cylinder', 60, 80);
//    insertVertexTemplate(library, graph, 'Actor', tplPath+'/ESWorkflow/js/workflow/images/actor.gif', 'shape=actor', 40, 60);
//    insertVertexTemplate(library, graph, 'Cloud', tplPath+'/ESWorkflow/js/workflow/images/cloud.gif', 'ellipse;shape=cloud', 80, 60);

  //    insertImageTemplate(library, graph, 'Bell', 'images/bell.png', false);
  //    insertImageTemplate(library, graph, 'Box', 'images/box.png', false);
  //    insertImageTemplate(library, graph, 'Cube', 'images/cube_green.png', false);
//      insertImageTemplate(library, graph,'用户',tplPath+'/ESWorkflow/js/workflow/images/dude3.png', true);
//	  insertImageTemplate(library, graph, 'Message', tplPath+'/ESWorkflow/js/workflow/images/symbols/message.png', true);
  //    insertImageTemplate(library, graph, 'Earth', 'images/earth.png', true);
 //     insertImageTemplate(library, graph, 'Gear', 'images/gear.png', true);
  //    insertImageTemplate(library, graph, 'Home', 'images/house.png', false);
 //     insertImageTemplate(library, graph, 'Package', 'images/package.png', false);
 //     insertImageTemplate(library, graph, 'Printer', 'images/printer.png', false);
 //     insertImageTemplate(library, graph, 'Server', 'images/server.png', false);
 //     insertImageTemplate(library, graph, 'Workplace', 'images/workplace.png', false);
 //     insertImageTemplate(library, graph, 'Wrench', 'images/wrench.png', true);
 //     insertSymbolTemplate(library, graph, 'Cancel', 'images/symbols/cancel_end.png', false);
 //   insertSymbolTemplate(library, graph, 'Error', 'images/symbols/error.png', false);
 //   insertSymbolTemplate(library, graph, 'Event', 'images/symbols/event.png', false);
 //   insertSymbolTemplate(library, graph, 'Fork', 'images/symbols/fork.png', true);
 //   insertSymbolTemplate(library, graph, 'Inclusive', 'images/symbols/inclusive.png', true);
 //   insertSymbolTemplate(library, graph, 'Link', 'images/symbols/link.png', false);
 //   insertSymbolTemplate(library, graph, 'Merge', 'images/symbols/merge.png', true);
//    insertSymbolTemplate(library, graph, 'Message', 'images/symbols/message.png', false);
//    insertSymbolTemplate(library, graph, 'Multiple', 'images/symbols/multiple.png', false);
//    insertSymbolTemplate(library, graph, 'Rule', 'images/symbols/rule.png', false);
  //  insertSymbolTemplate(library, graph, 'Terminate', 'images/symbols/terminate.png', false);
//   insertSymbolTemplate(library, graph, 'Timer', 'images/symbols/timer.png', false);
//    insertEdgeTemplate(library, graph, 'Vertical Connector', 'images/vertical.gif', 'vertical', 100, 100);
 //   insertEdgeTemplate(library, graph, 'Entity Relation', 'images/entity.gif', 'entity', 100, 100);
//	insertEdgeTemplate(library, graph, 'Arrow', 'images/arrow.gif', 'arrow', 100, 100);
    
    // Overrides createGroupCell to set the group style for new groups to 'group'
    var previousCreateGroupCell = graph.createGroupCell;
    
    graph.createGroupCell = function()
    {
    	var group = previousCreateGroupCell.apply(this, arguments);
    	group.setStyle('group');
    	
    	return group;
    };

    graph.connectionHandler.factoryMethod = function()
    {
		if (GraphEditor.edgeTemplate != null)
		{
    		return graph.cloneCells([GraphEditor.edgeTemplate])[0];
    	}
		
		return null;
    };

    // Uses the selected edge in the library as a template for new edges
    library.getSelectionModel().on('selectionchange', function(sm, node)
    {
    	if (node != null &&node.attributes.cells != null)
    	{
    		var cell = node.attributes.cells[0];
    		if (cell != null &&graph.getModel().isEdge(cell))
    		{
    			GraphEditor.edgeTemplate = cell;
    		}
    	}
    });

    // Redirects tooltips to ExtJs tooltips. First a tooltip object
    // is created that will act as the tooltip for all cells.
  	var tooltip = new Ext.ToolTip(
		{
        target: graph.container,
        html: ''
    });
    
    // Disables the built-in event handling
    tooltip.disabled = true;
    
    // Installs the tooltip by overriding the hooks in mxGraph to
    // show and hide the tooltip.
    graph.tooltipHandler.show = function(tip, x, y)
    {
    	if (tip != null &&
    		tip.length > 0)
    	{
    		// Changes the DOM of the tooltip in-place if
    		// it has already been rendered
	    	if (tooltip.body != null)
	    	{
	    		// TODO: Use mxUtils.isNode(tip) and handle as markup,
	    		// problem is dom contains some other markup so the
	    		// innerHTML is not a good place to put the markup
	    		// and this method can also not be applied in
	    		// pre-rendered state (see below)
	    		//tooltip.body.dom.innerHTML = tip.replace(/\n/g, '<br>');
				tooltip.body.dom.firstChild.nodeValue = tip;
	    	}
	    	
	    	// Changes the html config value if the tooltip
	    	// has not yet been rendered, in which case it
	    	// has no DOM nodes associated
	    	else
	    	{
	    		tooltip.html = tip;
	    	}
	    	
	    	tooltip.showAt([x, y + mxConstants.TOOLTIP_VERTICAL_OFFSET]);
	    }
    };
    
    graph.tooltipHandler.hide = function()
    {
    	tooltip.hide();
    };

    // Updates the document title if the current root changes (drilling)
	var drillHandler = function(sender)
	{
		//alert('drillHandler');//jiang 20100116
		var model = graph.getModel();
		var cell = graph.getCurrentRoot();
		var title = '';
		
		while (cell != null &&
			  model.getParent(model.getParent(cell)) != null)
		{
			// Append each label of a valid root
			if (graph.isValidRoot(cell))
			{
				title = ' > ' +
				graph.convertValueToString(cell) + title;
			}
			
			cell = graph.getModel().getParent(cell);
		}
		
		document.title = 'Graph Editor' + title;
	};
		
	graph.getView().addListener(mxEvent.DOWN, drillHandler);
	graph.getView().addListener(mxEvent.UP, drillHandler);

	// Keeps the selection in sync with the history
	var undoHandler = function(sender, evt)
	{
		var changes = evt.getArgAt(0).changes;
		graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
	};
	
	history.addListener(mxEvent.UNDO, undoHandler);
	history.addListener(mxEvent.REDO, undoHandler);

	// Transfer initial focus to graph container for keystroke handling
	graph.container.focus();
	    
    // Handles keystroke events
    var keyHandler = new mxKeyHandler(graph);
    
    // Ignores enter keystroke. Remove this line if you want the
    // enter keystroke to stop editing
    keyHandler.enter = function() {};
    
    keyHandler.bindKey(8, function()
    {
    	graph.foldCells(true);
    });
    
    keyHandler.bindKey(13, function()
    {
    	graph.foldCells(false);
    });
    
    keyHandler.bindKey(33, function()
    {
    	graph.exitGroup();
    });
    
    keyHandler.bindKey(34, function()
    {
    	graph.enterGroup();
    });
    
    keyHandler.bindKey(36, function()
    {
    	graph.home();
    });

    keyHandler.bindKey(35, function()
    {
    	graph.refresh();
    });
    
    keyHandler.bindKey(37, function()
    {
    	graph.selectPreviousCell();
    });
        
    keyHandler.bindKey(38, function()
    {
    	graph.selectParentCell();
    });

    keyHandler.bindKey(39, function()
    {
    	graph.selectNextCell();
    });
    
    keyHandler.bindKey(40, function()
    {
    	graph.selectChildCell();
    });
    
    keyHandler.bindKey(46, function()
    {
    	//------------------------------------------
    	//删除一个步骤和一个动作应该把数据库中对应的记录清除；
    	//jiangjien20100325
    	//------------------------------------------
    	//增加是否删除选择框
    	//------------------------------------------
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
    			//if(cells[i].getValue()=='开始'){
    			//	msg.push('[开始]');
            	//}
            	//else if(cells[i].getValue()=='结束'){
            	//	msg.push('[结束]');
            	//}
    		}
    		if(msg.length>0){msg.sort();showMsg(msg+'节点不允许删除!','3');return;}
	    	Ext.Msg.confirm('消息', '您确定要删除吗?', function(btn){
	    			if (btn == 'yes'){
	    				deleteCellfromDB(0,graph);
						//graph.removeCells();
	    			}else{
	    				return ;
	    			}
	    		}
	    	);
    	}
    	
    });
    
    keyHandler.bindKey(107, function()
    {
    	graph.zoomIn();
    });
    
    keyHandler.bindKey(109, function()
    {
    	graph.zoomOut();
    });
    
    keyHandler.bindKey(113, function()
    {
    	graph.startEditingAtCell();
    });
  
    keyHandler.bindControlKey(65, function()
    {
    	graph.selectAll();
    });

    keyHandler.bindControlKey(89, function()
    {
    	history.redo();
    });
    
    keyHandler.bindControlKey(90, function()
    {
    //	history.undo();
    });
    
    keyHandler.bindControlKey(88, function()
    {
    	//jiangyuntao 20120210 edit 增加控制开始结束节点不允许剪切
    	var cell = graph.getSelectionCell();
    	if(cell){
    		//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
   			var thisSstyle = cell.getStyle();
			var thisCellValue = cell.getValue();
			var thisIsEdge= cell.isEdge();
			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
				showMsg('['+thisCellValue+']节点不允许进行剪切操作!','3');return;
			}
    		//if(cell.getValue()=='开始'){
   			//	showMsg('友情提示','[开始]节点不允许进行剪切操作!');return;
    		//}
 			//else if(cell.getValue()=='结束'){
     		//	showMsg('友情提示','[结束]节点不允许进行剪切操作!');return;
           //}
    	}
    	mxClipboard.cut(graph);
    });
    
    keyHandler.bindControlKey(67, function()
    {
    	//jiangyuntao 20120210 edit 增加控制开始结束节点不允许复制
    	var cell = graph.getSelectionCell();
    	if(cell){
    		//xiaoxiong 20120910 修改开始与结束组建的精确验证 避免中间组建的名称为开始或结束时无法进行相应操作
   			var thisSstyle = cell.getStyle();
			var thisCellValue = cell.getValue();
			var thisIsEdge= cell.isEdge();
			if(thisSstyle!=null&&thisSstyle.length>=7&&thisSstyle.substring(0,7)=='ellipse'&&thisIsEdge==false&&(thisCellValue=='开始'||thisCellValue=='结束')){
				showMsg('['+thisCellValue+']节点不允许进行复制操作!','3');return;
			}
    		//if(cell.getValue()=='开始'){
   			//	showMsg('友情提示','[开始]节点不允许进行复制操作!');return;
    		//}
 			//else if(cell.getValue()=='结束'){
     		//	showMsg('友情提示','[结束]节点不允许进行复制操作!');return;
            //}
    	}
    	mxClipboard.copy(graph);
    });
    
    keyHandler.bindControlKey(86, function()
    {
    	mxClipboard.paste(graph);
    });
    
    keyHandler.bindControlKey(71, function()
    {
    	graph.setSelectionCell(graph.groupCells(null, 20));
    });
    
    keyHandler.bindControlKey(85, function()
    {
    	graph.setSelectionCells(graph.ungroupCells());
    });
//    Ext.getCmp('workflowLeftTemps').collapse();
//    Ext.getCmp('workflowLeftTemps').expand();
    setTimeout(function(){
    	Ext.getCmp('workflowLeftTemps').setWidth(100);
    	Ext.getCmp('wfGraphEditorPanelId').doLayout();},40);
}; // end of main

function insertSymbolTemplate(panel, graph, name, icon, rhombus)
{
    var imagesNode = panel.symbols;
    var style = (rhombus) ? 'rhombusImage' : 'roundImage';
    return insertVertexTemplate(panel, graph, name, icon, style+';image='+icon, 50, 50, '', imagesNode);
};

function insertImageTemplate(panel, graph, name, icon, round)
{
    var imagesNode = panel.images;
    var style = (round) ? 'roundImage' : 'image';
    return insertVertexTemplate(panel, graph, name, icon, style+';image='+icon, 50, 50, name, imagesNode);
};

function insertVertexTemplate(panel, graph, name, icon, style, width, height, value, parentNode)
{
	//alert('insertVertexTemplate');//jiang 20100116
		var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
		cells[0].vertex = true;
		
		var funct = function(graph, evt, target)
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				var validDropTarget = (target != null) ?
					graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;
				
				if (target != null &&
					!validDropTarget &&
					graph.getModel().getChildCount(target) == 0 &&
					graph.getModel().isVertex(target) == cells[0].vertex)
				{
					graph.getModel().setStyle(target, style);
					select = [target];
				}
				else
				{
					if (target != null &&
						!validDropTarget)
					{
						target = null;
					}
					
					var pt = graph.getPointForEvent(evt);
					
					// Splits the target edge or inserts into target group
					if (graph.isSplitEnabled() &&
						graph.isSplitTarget(target, cells, evt))
					{
						graph.splitEdge(target, cells, null, pt.x, pt.y);
						select = cells;
					}
					else
					{
						cells = graph.getImportableCells(cells);
						
						if (cells.length > 0)
						{
							select = graph.importCells(cells, pt.x, pt.y, target);
						}
					}
				}
				
				if (select != null &&
					select.length > 0)
				{
					graph.scrollCellToVisible(select[0]);
					graph.setSelectionCells(select);
				}
			}
		};
		
		// Small hack to install the drag listener on the node's DOM element
		// after it has been created. The DOM node does not exist if the parent
		// is not expanded.
		var node = panel.addTemplate(name, icon, parentNode, cells);
		var installDrag = function(expandedNode)
		{
			if (node.ui.elNode != null)
			{
				// Creates the element that is being shown while the drag is in progress
				var dragPreview = document.createElement('div');
				dragPreview.style.border = 'dashed black 1px';
				dragPreview.style.width = width+'px';
				dragPreview.style.height = height+'px';
				
				mxUtils.makeDraggable(node.ui.elNode, graph, funct, dragPreview, 0, 0,
						graph.autoscroll, true);
			}
		};
		
		if (!node.parentNode.isExpanded())
		{
			panel.on('expandnode', installDrag);
		}
		else
		{
			installDrag(node.parentNode);
		}
		
		return node;
};

function insertEdgeTemplate(panel, graph, name, icon, style, width, height, value, parentNode)
{
		var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
		cells[0].geometry.setTerminalPoint(new mxPoint(0, height), true);
		cells[0].geometry.setTerminalPoint(new mxPoint(width, 0), false);
		cells[0].edge = true;
		
		var funct = function(graph, evt, target)
		{
			cells = graph.getImportableCells(cells);
			
			if (cells.length > 0)
			{
				var validDropTarget = (target != null) ?
					graph.isValidDropTarget(target, cells, evt) : false;
				var select = null;
				
				if (target != null &&
					!validDropTarget)
				{
					target = null;
				}
				
				var pt = graph.getPointForEvent(evt);
				var scale = graph.view.scale;
				
				pt.x -= graph.snap(width / 2);
				pt.y -= graph.snap(height / 2);
				
				select = graph.importCells(cells, pt.x, pt.y, target);
				
				// Uses this new cell as a template for all new edges
				GraphEditor.edgeTemplate = select[0];
				
				graph.scrollCellToVisible(select[0]);
				graph.setSelectionCells(select);
			}
		};
		
		// Small hack to install the drag listener on the node's DOM element
		// after it has been created. The DOM node does not exist if the parent
		// is not expanded.
		var node = panel.addTemplate(name, icon, parentNode, cells);
		var installDrag = function(expandedNode)
		{
			if (node.ui.elNode != null)
			{
				// Creates the element that is being shown while the drag is in progress
				var dragPreview = document.createElement('div');
				dragPreview.style.border = 'dashed black 1px';
				dragPreview.style.width = width+'px';
				dragPreview.style.height = height+'px';
				
				mxUtils.makeDraggable(node.ui.elNode, graph, funct, dragPreview, -width / 2, -height / 2,
						graph.autoscroll, true);
			}
		};
		
		if (!node.parentNode.isExpanded())
		{
			panel.on('expandnode', installDrag);
		}
		else
		{
			installDrag(node.parentNode);
		}
		
		return node;
};

// Defines a global functionality for displaying short information messages
Ext.example = function(){
    var msgCt;

    function createBox(t, s){
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    }
    return {
        msg : function(title, format){
            if(!msgCt){
                msgCt = Ext.DomHelper.append(document.body, {id:'msg-div'}, true);
            }
            msgCt.alignTo(document, 't-t');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
            m.slideIn('t').pause(1).ghost("t", {remove:true});
        }
    };
}();
