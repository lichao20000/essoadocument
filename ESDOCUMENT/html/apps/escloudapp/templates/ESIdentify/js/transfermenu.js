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

		var zNodes =[
			{ id:1, pId:0, name:"移交清册", open:true},
			{ id:11, pId:1, name:"2011年", open:true},
			{ id:12, pId:11, name:"1月",open:true},
			{ id:13, pId:11, name:"2月",open:true},
			{ id:3, pId:1, name:"2012年",open:true},
			{ id:4, pId:3, name:"1月",open:true},
			{ id:15, pId:3, name:"2月",open:true}
		
			
		];

		function onClick(e,treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("transfertree");
			zTree.expandNode(treeNode);
		}

		$(document).ready(function(){
			$.fn.zTree.init($("#transfertree"), setting, zNodes);
		});