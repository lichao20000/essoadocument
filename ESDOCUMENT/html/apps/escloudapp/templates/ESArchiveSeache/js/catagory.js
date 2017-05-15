//分类库树结构
var setting = {
			view: {
				dblClickExpand: false,
				showLine: false,
				selectedMulti: false
				
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			edit:{
				enable:true
			},
			callback: {
				onClick: ClickNode
			}
		};

function ClickNode(e,treeId, treeNode) {
	if(treeNode.pId!=0){
		$("input[name='ClassificationCode']",$("#oncha")).val(treeNode.classCode);
	}
}
function hideCata() {
	$("#catagory").fadeOut("fast");
}
function clickBodyDown(event) {
	if (!(event.target.id == "catagory" || event.target.id == "fication" || $(event.target).parents("#catagory").length>0)) {
		hideCata();
	}
}
	

	
