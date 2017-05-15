	var orgSetting = {  
	    isSimpleData : true,              //数据是否采用简单 Array 格式，默认false  
	    showLine : true,                  //是否显示节点间的连线  
	    checkable : false,                  //每个节点上是否显示 CheckBox  
	    data : {
			simpleData : {
				enable : true,
			}
		},
	    async : {
	    	enable : true,
	    	type : "get",
	    	autoParam :['id'],
	    	url:$.appClient.generateUrl({ESOrgAndUser:'expandOrgListTree'},'x')
	    },
	    callback:{
			onClick: getUserListByOrgId,
			onRightClick: orgZTreeOnRightClick
		}
	};  
	var orgZTree;  
	var orgTreeNodes;  
	$(document).ready(function(){
		 $("body").bind(//鼠标点击事件不在节点上时隐藏右键菜单  
	                "mousedown",  
	                function(event) {  
	                    if (!(event.target.id == "rMenu" || $(event.target)  
	                            .parents("#rMenu").length > 0)) {  
	                        $("#rMenu").hide();  
	                    }  
	                });
		 loadOrgListTree(0);
	}); 
	//wanghongchen 20140612 
	function loadOrgListTree(appId){
		 $.ajax({   
		        async : false,  
		        cache:false,  
		        type: 'POST',  
		        dataType : "json",  
		        url: $.appClient.generateUrl({ESOrgAndUser:'getOrgListTree',appId:appId}, 'x'),//请求的action路径  
		        error: function () {//请求失败处理函数  
		            alert('请求失败');  
		        },  
		        success:function(data){ //请求成功后处理函数。    
		        	orgTreeNodes = data;   //把后台封装好的简单Json格式赋给treeNodes  
		            orgZTree = $.fn.zTree.init($("#orgListTree"),orgSetting, orgTreeNodes);  
		        }  
		    });
	}
	function getUserListByOrgId(event, treeId, treeNode){
        if(treeNode.name=="机构设置"){
        	return;
        }
		var orgSeq = treeNode.idseq+treeNode.id;
		$("#userGrid").flexOptions({url:$.appClient.generateUrl({ESOrgAndUser: 'findUserListByOrgid',orgSeq:orgSeq}, 'x')}).flexReload();
	}
 
    //显示右键菜单  
    function showRMenu(type, x, y) {  
        $("#rMenu ul").show();  
        if (type=="root") {  
            $("#m_del").hide();  
            $("#m_edit").hide();  
        }  
        $("#rMenu").css({"top":y+"px", "left":x+"px", "display":"block"});  
    }  
    //隐藏右键菜单  
    function hideRMenu() {  
        $("#rMenu").hide();  
    }  
    //鼠标右键事件-创建右键菜单  
    function orgZTreeOnRightClick(event, treeId, treeNode) {  
        if (!treeNode) {  
        	orgZTree.cancelSelectedNode();  
            showRMenu("root", event.clientX, event.clientY);  
        } else if (treeNode && !treeNode.noR) { //noR属性为true表示禁止右键菜单  
            if (treeNode.newrole && event.target.tagName != "a" && $(event.target).parents("a").length == 0) {  
            	orgZTree.cancelSelectedNode();  
                showRMenu("root", event.clientX, event.clientY);  
            } else {  
            	orgZTree.selectNode(treeNode);  
                showRMenu("node", event.clientX, event.clientY);  
            }  
        }  
    }  