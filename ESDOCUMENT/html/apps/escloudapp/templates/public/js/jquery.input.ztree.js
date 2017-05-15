/*
* 
* xuekun 20141126 添加可选择下拉框
*
*/
$.fn.extend({

	selectInput : function(options) {
		var e = this,Obj;
		var defaults = {
			bind:"click",
			url:'',
			chkStyle : "checkbox",
			async:false,
			idKey: 'id',
			pIdKey: 'pId',
			showname:'name',
			width:0,
			height:0,
			onCheck:function(event, treeId, treeNode){
		     	   var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		     		nodes = zTree.getCheckedNodes(true);
		     		v = '';
		     		for (var i=0, l=nodes.length; i<l; i++) {
		     			if(nodes[i].code!=''){
		     			v += nodes[i].code + ",";
		     			}
		     		}
		     		if (v.length > 0 ) v = v.substring(0, v.length-1);
		     		$(Obj).attr("value", v);
		        },
			treatNodes:function(zNodes){
				var arrays=$(Obj).val()!=null?$(Obj).val().split(','):new Array();
				for(var i=0;i<zNodes.length;i++){
					if(zNodes[i].code!=''){
						if($.inArray(zNodes[i].code,arrays)==-1){
							zNodes[i].checked=false;
						}else{
							zNodes[i].checked=true;
						}
					}else{
						zNodes[i].nocheck=true;
					}
		    	}
			},
			onClick:function(event, treeId, treeNode){
				var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
				treeObj.checkNode(treeNode, !treeNode.checked,false,false);
				if (treeNode.isParent) {
					treeObj.expandNode(treeNode);
				}
				options.onCheck(event, treeId, treeNode);
			}
			
		};
		var options = $.extend(defaults, options);
		// 初始化层
		this.clearUl = function() {
			$('#treeDemo').remove();
		};
		this.showMenu=function(obj){
			Obj=obj;
			e.clearMenuContent();
			e.createMenuContent();
			if($("#menuContent").css("display")=='none'){
				e.init();
				var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
				var inputOffset = $(Obj).offset();
				$("#menuContent").css({left:inputOffset.left + "px", top:inputOffset.top + $(Obj).outerHeight() + "px"}).slideDown("fast");
			    $("body").bind("mousedown", e.onBodyDown);
			}else{
				e.hidenMenu();
			}
		};
       
		this.onBodyDown=function(event){
			if (!(event.target.id == "menuBtn"  || $(event.target).parents("#menuContent").length>0)) {
				e.hidenMenu();
			}
		};
		this.hidenMenu=function(){
			$("#menuContent").fadeOut("fast");
			$("body").unbind("mousedown", e.onBodyDown);
		};
		this.createMenuContent=	function(){
			var ul = '<div id="menuContent" class="menuContent" style="display:none; position: fixed;z-index:5555;"><ul id="treeDemo" class="ztree selectztree" style="margin-top: 0; color: #000"></ul></div>';
			$("body").append(ul);
			if(options.width!=0){
				$("#treeDemo").width(options.width);
			}else{
				$("#treeDemo").width($(Obj).width()-12);
			}
			if(options.height!=0){
				$("#treeDemo").height(options.height);
			}
		};
		this.clearMenuContent=	function(){
			$("#menuContent").remove();
		};
		this.init = function() {
			var selectSetting = {
					async: {
						enable: options.async,
						dataType: 'json',
						url: options.url,
						autoParam: ["id"]
					},	
					check: {
						chkStyle:options.chkStyle,
						enable: true,
						radioType: "all",
						chkboxType: {"Y":"", "N":""}
					},
					view: {
						dblClickExpand: false,
						fontCss :{"color":"#000"}
					},
					data: {
						key: {
							name: options.showname
						},
						simpleData: {
							enable: true,
							idKey: options.idKey,
							pIdKey: options.pIdKey,
							rootPId: 0
						}
					},
					callback: {
						onCheck: options.onCheck,
						onClick: options.onClick,
					}
				};
			if(options.async==false){
				$.getJSON(options.url, function(zNodes) {
				options.treatNodes(zNodes);
				$.fn.zTree.init($("#treeDemo"), selectSetting, zNodes);
				});
		 }else{
			 
			$.fn.zTree.init($("#treeDemo"),selectSetting);
			 
		 }
		};
		this.each(function() {
			$(this).bind(options.bind,function(){
				e.showMenu(this);
			});

		});
	}
	});