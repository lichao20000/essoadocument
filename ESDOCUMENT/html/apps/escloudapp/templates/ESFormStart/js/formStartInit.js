
var formStartInit = {
		init : function(){
			$.post( $.appClient.generateUrl({ESFormBuilder : 'getFormJs'}, 'x')
	    			,{formId:modelTypeId}, function(res){
        				if (res == 'true') {
        					treeObj.removeNode(selectedNode);
        					$.dialog.notice({icon : 'succeed',content : '删除成功！',title : '3秒后自动关闭',time : 3});
        				} else {
        					$.dialog.notice({icon : 'error',content : '删除失败！',title : '3秒后自动关闭',time : 3});
        				}
			});
		}
}