/*
 * $Id: LibraryPanel.js,v 1.1 2008/07/15 10:34:48 gaudenz Exp $
 * Copyright (c) 2008, Gaudenz Alder
 */
LibraryPanel = function()
{
    LibraryPanel.superclass.constructor.call(this,
    {
        region:'center',
        split:true,
        rootVisible:false,
        lines:false,
        autoScroll:true,
        bodyStyle:'padding-left:10px;',
        border:false,
        style:'border-bottom:1px solid #99BBE8;',
        root: new Ext.tree.TreeNode('Graph Editor'),
        collapseFirst:false
    });

	// Adds 3 main categories for shapes and stores a reference to the treenode
    // under templates, images and symbols respectively
//    this.templates = this.root.appendChild(
//        new Ext.tree.TreeNode({
//            text:' ',
//            cls:'feeds-node',
//            expanded:true
//        })
//    );

//    this.images = this.root.appendChild(
//        new Ext.tree.TreeNode({
//            text:'',
//            cls:'feeds-node',
//            expanded:false
//        })
//    );
    
 //   this.symbols = this.root.appendChild(
 //       new Ext.tree.TreeNode({
 //           text:'Symbols',
 //           cls:'feeds-node',
 //           expanded:false
  //      })
  //  );
};

Ext.extend(LibraryPanel, Ext.tree.TreePanel, {

    addTemplate : function(name, icon, parentNode, cells)
    {
        var exists = this.getNodeById(name);
        
        if(exists)
        {
            if(!inactive)
            {
                exists.select();
                exists.ui.highlight();
            }
            
            return;
        }

        var node = new Ext.tree.TreeNode(
        {
        	text: name,
            icon: icon,
            leaf: true,
            cls: 'feed',
            cells: cells,
            id: name
        });
        
        if (parentNode == null)
        {
//        	parentNode = this.templates;
        	parentNode = this.getRootNode();
        }

        parentNode.appendChild(node);
        
        return node;
    },

    // prevent the default context menu when you miss the node
    afterRender : function()
    {
        LibraryPanel.superclass.afterRender.call(this);
        
        this.el.on('contextmenu', function(e)
        {
            e.preventDefault();
        });
    }
});