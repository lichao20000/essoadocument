$(document).ready(function() {
	if( $("#treelevel").val()==1){
		$("#secondNo").val("00");
		$("#secondNo").addClass("inputtextnoedit");
		$('#secondNo').attr("readonly","readonly")//将input元素设置为readonly
	}
	$("#baseUnits").selectInput({
    	url:$.appClient.generateUrl({ESParticipatory : "getTree",unitstype:1}, 'x'),
    	chkStyle: "checkbox",
    	onCheck:checkbase,
    	treatNodes : treatbase,
    	width:420,
		height:300
    });
	function checkbase(event, treeId, treeNode){
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		var nodes = zTree.getCheckedNodes(true);
		var names = "";
		var codes = "";
	   
		for(var i=0;i<nodes.length;i++){
			if(i==0){
    			names += nodes[0].name;
	    		codes += nodes[0].code;
	    	}else{
		    	names += ","+nodes[i].name;
	    		codes += ","+nodes[i].code;
	    	}
		}
		$("#baseUnitsCode").val(codes);
		$("#baseUnits").val(names);
	 	$("#baseUnits").removeClass("invalid-text");
	};
	function treatbase(zNodes){
		var arrays = $("#baseUnits").val() != "" ? $("#baseUnits").val()
				.split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].name, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
			} if(zNodes[i].type != '设计单位'){
				zNodes[i].nocheck=true;
			}
		}
	};
	$("#detailUnits").selectInput({
    	url:$.appClient.generateUrl({ESParticipatory : "getTree",unitstype:2}, 'x'),
    	chkStyle: "checkbox",
    	onCheck:checkdetail,
    	treatNodes : treatdetail,
    	width:420,
		height:300
    });
	function checkdetail(event, treeId, treeNode){
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		var nodes = zTree.getCheckedNodes(true);
		var names = "";
		var codes = "";
	   
		for(var i=0;i<nodes.length;i++){
			if(i==0){
    			names += nodes[0].name;
	    		codes += nodes[0].code;
	    	}else{
		    	names += ","+nodes[i].name;
	    		codes += ","+nodes[i].code;
	    	}
		}
		
		$("#detailUnitsCode").val(codes);
	 	$("#detailUnits").val(names);
	 	$("#detailUnits").removeClass("invalid-text");
	};
	function treatdetail(zNodes){
		var arrays = $("#detailUnits").val() != null ? $("#detailUnits").val()
				.split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].name, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
			} if(zNodes[i].type != '设计单位' ){
				zNodes[i].nocheck=true;
			}
		}
	};
	$("#supervisionUnits").selectInput({
    	url:$.appClient.generateUrl({ESParticipatory : "getTree",unitstype:3}, 'x'),
    	chkStyle: "checkbox",
    	onCheck:checksupervision,
    	treatNodes : treatsupervision,
    	width:420,
		height:300
    });
	function checksupervision(event, treeId, treeNode){
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		var nodes = zTree.getCheckedNodes(true);
		var names = "";
		var codes = "";
	   
		for(var i=0;i<nodes.length;i++){
			if(i==0){
    			names += nodes[0].name;
	    		codes += nodes[0].code;
	    	}else{
		    	names += ","+nodes[i].name;
	    		codes += ","+nodes[i].code;
	    	}
		}
		$("#supervisionUnitsCode").val(codes);
	 	$("#supervisionUnits").val(names);
	 	$("#supervisionUnits").removeClass("invalid-text");
	};
	function treatsupervision(zNodes){
		var arrays = $("#supervisionUnits").val() != null ? $("#supervisionUnits").val()
				.split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].name, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
			} if(zNodes[i].type!='监理单位'){
				zNodes[i].nocheck=true;
			}
		}
	};
	$("#mainPart").selectInput({
    	url:$.appClient.generateUrl({ESParticipatory : "getTree",unitstype:4}, 'x'),
    	chkStyle: "checkbox",
    	onCheck:checkmain,
    	treatNodes : treatmain,
    	width:420,
		height:300
    });
	function checkmain(event, treeId, treeNode){
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		var nodes = zTree.getCheckedNodes(true);
		var names = "";
		var codes = "";
	   
		for(var i=0;i<nodes.length;i++){
			if(i==0){
    			names += nodes[0].name;
	    		codes += nodes[0].code;
	    	}else{
		    	names += ","+nodes[i].name;
	    		codes += ","+nodes[i].code;
	    	}
		}
		$("#mainPartCode").val(codes);
	 	$("#mainPart").val(names);
	 	$("#mainPart").removeClass("invalid-text");
	};
	function treatmain(zNodes){
		var arrays = $("#mainPart").val() != null ? $("#mainPart").val()
				.split(',') : new Array();
		for (var i = 0; i < zNodes.length; i++) {
			if (zNodes[i].code != '') {
				if ($.inArray(zNodes[i].name, arrays) == -1) {
					zNodes[i].checked = false;
				} else {
					zNodes[i].checked = true;
				}
			} if(zNodes[i].type!='部门' ){
				zNodes[i].nocheck=true;
			}
		}
	};
	$("#firstNo,#secondNo,#name").die("blur").live('blur',function(event){
		if(event.target.id=="name"){
			judgeDeviceName();
		}
		if(event.target.id=="firstNo"){
			judgefirstNo();
		}
	    if(event.target.id=="secondNo"){
	    	if($("#firstNo").val() != '' && $("#treelevel").val() != 0){
	    		judgeSecondNo();
	    	}
		}
		$("#deviceNo").val($("#firstNo").val()+$("#secondNo").val());
	});
	
	if($("#treefirstNo").val()!=''){
		$("#firstNo").val($("#treefirstNo").val());
		$("#firstNo").attr("class","inputtextnoedit");
		$("#firstNo").attr("readonly","readonly");
	}
	$("#firstNo,#secondNo,#name").die("focus").live('focus',function(event){
		if(event.target.id=="name"){
			$("#name").removeClass("warning").attr("title","");
		}
		if(event.target.id=="firstNo"){
			$("#firstNo").removeClass("warning").attr("title","");
			$("#secondNo").removeClass("warning").attr("title","");
		}
	    if(event.target.id=="secondNo"){
			$("#secondNo").removeClass("warning").attr("title","");
		}
	});
});