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
			/*async:{
				enable:true,
				url:$.appClient.generateUrl({ESClassification:'getnode'},'x'),
				autoParam:["id"]
			},*/
			callback: {
				onClick: ClickNode
			}
		};

$(document).ready(function() {
	$.getJSON($.appClient.generateUrl({
		ESIdentify : "getClassList",archiveType:archiveType
	}, 'x'), function(zNodes) {
		$.fn.zTree.init($("#fication"), setting, zNodes);
	});
});
function ClickNode(e,treeId, treeNode) {
	if(treeNode.pId!=0){
	//custodyterm保管期限字段
		$('input[name="esfieldvalue"]').attr("estext",treeNode.name);
		var esField=$('[name="esfieldvalue"]',$('#esfilter'));
		if(esField.length>0){
			esField.eq(index-1).val(treeNode.classCode);
			return false;
		}
		$("span:contains('分类号')").next().val(treeNode.classCode);
		if(treeNode.custodyterm){
			var selectObj=$("span:contains('保管期限')").next();
//			$("[value="+treeNode.custodyterm+"]",selectObj).attr('selected',true);
			/** xiaoxiong 20140825 将下拉组件修改为可编辑组件，从而对此进行了修改 **/
			$("[class='selectInput']",selectObj).val(treeNode.custodyterm);
		}
		groupFieldForClassificationCode();//liqiubo 20141010 调用一下组合字段方法，修复bug 1302
		
	}
}
	
//组合字段,这个是将add.phtml中的groupField移过来的，为了修复bug 1302
function groupFieldForClassificationCode(){
	//先拿到所有要分组的Key的值
	//然后循环这些值，通过这个Key  去相应的INPUT上获取规则
	//拿到规则后，循环规则
	//是C开头的，按照|拆分，然后比对替换值
	//最后拼接，赋值
	var combinfieldKey = $("input[metadata='ClassificationCode']").attr("combinfieldKey");
	if(combinfieldKey=="no"||combinfieldKey=="undefined"||combinfieldKey==""){
		//liqiubo 20141014 如果没取到，取一下保管期限，看保管期限定义了木有
		var selectObj=$("span:contains('保管期限')").next();
		combinfieldKey = $("[class='selectInput']",selectObj).attr("combinfieldKey");
	}
	if(combinfieldKey=="no"||combinfieldKey=="undefined"||combinfieldKey==""){
		return;
	}else{
		if(combinfieldKey.length>2){
			combinfieldKey=combinfieldKey.substring(1,combinfieldKey.length-1);
			var combinfieldKeys = combinfieldKey.split(",");
			for(var i=0;i<combinfieldKeys.length;i++){
				if(document.getElementsByName($.trim(combinfieldKeys[i]))[0]){
					//最后要把拼好的值给combinfieldKeys[i]
					var combinfieldVal = document.getElementsByName($.trim(combinfieldKeys[i]))[0].getAttribute("combinfieldVal");
					if(combinfieldVal.length>2){
						combinfieldVal = combinfieldVal.substring(1,combinfieldVal.length-1);
						var combinfieldVals = combinfieldVal.split(",");
						var finalVal = "";//最终给赋值的那个值
						for(var j=0;j<combinfieldVals.length;j++){
							if($.trim(combinfieldVals[j]).substring(0,1)=="C"){
								var needVal = $.trim(combinfieldVals[j]).split("|");
								var txtVal = '';
								if(document.getElementsByName(needVal[0])[0]){
									txtVal = document.getElementsByName(needVal[0])[0].value;
								}
								for(var z=0;z<needVal.length;z++){
									if(z>0){
										var replaceVal = needVal[z].split("_");
										if(txtVal==replaceVal[0]){
											txtVal = replaceVal[1];
										}
									}
								}
								finalVal = finalVal+txtVal;
							}else{
								//直接拼接
								finalVal = finalVal + $.trim(combinfieldVals[j]);
							}
						}
						if(finalVal!=""){
							document.getElementsByName($.trim(combinfieldKeys[i]))[0].value=finalVal;
						}
					}
				}
			}
		}else{
			return;
		}
	}	
	
}

	
