$(document).ready(function(){
	//数据类型切换 字段长度默认值修改
	$("#type").change(function(){
		switch($(this).val()){
			case 'TEXT':
				$("#toLength").val(40);
				$("#toLength").removeAttr("readonly");
				break;
			case 'NUMBER':
				$("#toLength").val(9);
				$("#toLength").removeAttr("readonly");
				break;
			case 'DATE':
				$("#toLength").val(10);
				$("#toLength").attr("readonly","readonly"); 
				$("#toLength").addClass("inputtextnoedit");
				break;
			case 'FLOAT':
				$("#toLength").val(15);
				$("#toLength").removeAttr("readonly");
				break;
			case 'TIME':
				$("#toLength").val(8);
				$("#toLength").attr("readonly","readonly"); 
				$("#toLength").addClass("inputtextnoedit");
				break;
			default :
				$("#toLength").val(5);
				$("#toLength").attr("readonly","readonly"); 
				$("#toLength").addClass("inputtextnoedit");
		}
		$("#toLength").removeClass("invalid-text").attr('title',"");
	});
});