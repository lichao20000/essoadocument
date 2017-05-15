var conditions=[];
var setting = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick: onClick
			}
		};
		function onClick(e,treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.expandNode(treeNode);
			if(treeNode.sId!=0){
				strucid=treeNode.sId;
				var url=$.appClient.generateUrl({ESRecycleBin:'datalist'},'x');
				if(treeNode.path){
					var path=treeNode.path;
					var reg=/\//g;
					nodePath=path.replace(reg, '-');//全局Path
					archiveType=treeNode.archivetype;
					//$.dialog.notice({width: 150,content: nodePath,icon: 'face-smile'});
					$("#esone").load(url,{bname:treeNode.name,path:nodePath});
				}
				
				
			}
			
		}
		$(document).ready(function(){
			$.getJSON($.appClient.generateUrl({
				ESIdentify : "getTree",status:4
			}, 'x'), function(zNodes) {
				$.fn.zTree.init($("#treeDemo"), setting, zNodes);

			});

		});