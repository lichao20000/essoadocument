	var  zTreeObj;
	var	zTreeNodes;
	var setting = {
			view: {
				selectedMulti: false
			},
			callback:{
				onClick: getFileListByAppId
			}
		};
	$(document).ready(function(){
		$.ajax({  
	        dataType : "json",  
	        url: $.appClient.generateUrl({ESConsoleServer : 'getAppListTree'}, 'x'),//请求的action路径  
	        error: function () {//请求失败处理函数  
	            alert('请求失败');  
	        },  
	        success:function(data){ //请求成功后处理函数。
	        	zTreeNodes =data;   //把后台封装好的简单Json格式赋给treeNodes  
	        	zTreeObj = $.fn.zTree.init($("#appTreeDemo"), setting, zTreeNodes);
	        }  
	    });  
	});
	
	function getFileListByAppId(event, treeId, treeNode){
		if(treeNode.name=='应用列表'){
			return ;
		}
	      $("#consoleServerGrid").flexOptions({url:$.appClient.generateUrl({ESConsoleServer : 'getConsoleServerList',appId:treeNode.appId}, 'x'),newp: 1}).flexReload();
	}