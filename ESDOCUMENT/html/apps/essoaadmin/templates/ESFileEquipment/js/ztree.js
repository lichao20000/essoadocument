	var  zTreeObj;
	var	zTreeNodes;
	var setting = {
			view: {
				selectedMulti: false
			},
			callback:{
				onClick: getRoleListByAppId
			}
		};
	$(document).ready(function(){
		$.ajax({  
	        dataType : "json",  
	        url: $.appClient.generateUrl({ESFileEquipment : 'getAppList'}, 'x'),//请求的action路径  
	        error: function () {//请求失败处理函数  
	            alert('请求失败');  
	        },  
	        success:function(data){ //请求成功后处理函数。
	        	zTreeNodes =data;   //把后台封装好的简单Json格式赋给treeNodes  
	        	zTreeObj = $.fn.zTree.init($("#fileEquipAppTreeDemo"), setting, zTreeNodes);
	        }  
	    });  
	});
	
	function getRoleListByAppId(event, treeId, treeNode){
//		alert(treeNode.appId);
	      $("#fileEquipGrid").flexOptions({url:$.appClient.generateUrl({ESFileEquipment: 'getFileEquipList',appId:treeNode.appId}, 'x')}).flexReload();
	}