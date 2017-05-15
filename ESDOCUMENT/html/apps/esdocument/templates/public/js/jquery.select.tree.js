(function($){
	var _setting = {
			chkStyle:"",
			inputId:"",
			inputObj:null,
			treeDIVId:"",
			treeDIVObj:null,
			treeUlId:"",
			treeUlObj:null,
			url:""
			
	};
	$.treeSelected ={
			_showMenu:function(){
				if($(_setting.treeDIVObj).css("display")=='none'){
					var inputOffset = _setting.inputObj.offset();
					_setting.treeDIVObj.css({left:inputOffset.left + "px", top:inputOffset.top + _setting.inputObj.outerHeight() + "px"}).slideDown("fast");
					$("body").bind("mousedown", $.treeSelected._onBodyDown);
					}
			},
		    _onBodyDown:function(event){
				if (!(event.target.id == "menuBtn"  || $(event.target).parents("#menuContent").length>0)) {
					$.treeSelected._hidenMenu();
				}
			},
			_hidenMenu:function(){
				_setting.treeDIVObj.fadeOut("fast");
				$("body").unbind("mousedown", $.treeSelected._onBodyDown);
			},
			_beforeClick:function(treeId, treeNode) {
				var zTree = $.fn.zTree.getZTreeObj(_setting.treeUlId);
				zTree.checkNode(treeNode, !treeNode.checked, null, true);
				return false;
			},
			
			_onCheck:function(e, treeId, treeNode) {
				var zTree = $.fn.zTree.getZTreeObj(_setting.treeUlId);
				nodes = zTree.getCheckedNodes(true);
				v = "";
				for (var i=0, l=nodes.length; i<l; i++) {
					v += nodes[i].name + ",";
				}
				if (v.length > 0 ) v = v.substring(0, v.length-1);
				
				_setting.inputObj.attr("value", v);
			},
			_init:function(settings){
				$.treeSelected._initsetting(settings);
				var selectSetting = {
						check: {
							chkStyle:settings.chkStyle,
							enable: true,
							radioType: "all",
							chkboxType: {"Y":"", "N":""}
						},
						view: {
							dblClickExpand: false,
							fontCss :{"color":"#000"}
						},
						data: {
							simpleData: {
								enable: true
							}
						},
						callback: {
							beforeClick: $.treeSelected._beforeClick,
							onCheck: $.treeSelected._onCheck
						}
					};
			$.getJSON(_setting.url, function(zNodes) {
			    	for(var i=0;i<zNodes.length;i++){
			    		if(zNodes[i].id==0){
			    			zNodes[i].nocheck=true;
			    		}
					}
					$.fn.zTree.init(_setting.treeUlObj, selectSetting, zNodes);
			});
				
			},
			_initsetting:function(settings){
				_setting.inputId=settings.inputId;
				_setting.chkStyle=settings.chkStyle;
				_setting.inputObj=$("#"+settings.inputId);
				_setting.treeDIVId=settings.treeDIVId;
				_setting.treeDIVObj=$("#"+settings.treeDIVId);
				_setting.treeUlId=settings.treeUlId;
				_setting.treeUlObj=$("#"+settings.treeUlId);
				_setting.url=settings.url;
				$("#"+settings.inputId+",#"+settings.selectId).bind("click", $.treeSelected._showMenu);
			}
	}
})(jQuery);