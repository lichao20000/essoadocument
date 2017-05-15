//	var  zTreeObj;
//	var	zTreeNodes;
//	var appsetting = {
//			view: {
//				selectedMulti: false
//			},
//			callback:{
//				onClick: getRoleListByAppId
//			}
//		};
//	$(document).ready(function(){
//		$.ajax({  
//	        dataType : "json",  
//	        url: $.appClient.generateUrl({ESOrgAndUser : 'getAppList'}, 'x'),//请求的action路径  
//	        error: function () {//请求失败处理函数  
//	            alert('请求失败');  
//	        },  
//	        success:function(data){ //请求成功后处理函数。
//	        	zTreeNodes =data;   //把后台封装好的简单Json格式赋给treeNodes  
//	        	zTreeObj = $.fn.zTree.init($("#appTree"), appsetting, zTreeNodes);
//	        	var nodes = zTreeObj.getNodes()[0].children;
//	        	if (nodes.length>0) {
//	        		zTreeObj.selectNode(nodes[0]);
//	        		loadOrgListTree(nodes[0].id);
//	        	}
//	        }  
//	    });  
//	});
//	
//	function loadOrgListTree(appId){
//		 $.ajax({   
//		        async : false,  
//		        cache:false,  
//		        type: 'POST',  
//		        dataType : "json",  
//		        url: $.appClient.generateUrl({ESOrgAndUser:'getOrgListTree',appId:appId}, 'x'),//请求的action路径  
//		        error: function () {//请求失败处理函数  
//		            alert('请求失败');  
//		        },  
//		        success:function(data){ //请求成功后处理函数。    
//		        	orgTreeNodes = data;   //把后台封装好的简单Json格式赋给treeNodes  
//		            orgZTree = $.fn.zTree.init($("#orgListTree"),orgSetting, orgTreeNodes);  
//		        }  
//		    });
//	}
//	function getRoleListByAppId(event, treeId, treeNode){
//		if(treeNode.name=="应用列表"){
//			return;
//		}
//		loadOrgListTree(treeNode.id);
//		$("#userGrid").find("tbody").children().remove()();
//	}