
//综合查询
$('.newfilter').die().live('click',function (){
	$(this).parent().clone().insertAfter($(this).parent());
});

$('.delfilter').die().live('click',function (){
	$('#contents p').length > 1 ? $(this).parent().remove() : '';
});


