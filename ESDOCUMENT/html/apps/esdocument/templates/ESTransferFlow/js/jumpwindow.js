(function($){
	//单击初始化样式
	$('#userRole li,#userRole2 li').live('click',function(){
		if($(this).parent().parent().parent().attr('id')=='userRole'){
			$('#userRole li').removeClass('esselected');
			$(this).addClass('esselected');
		}
		else if ($(this).parent().parent().parent().parent().attr('id')=='userRole') {
			$('#userRole li').removeClass('esselected');
			$(this).addClass('esselected');
		}
		else{
			$('#userRole2 li').removeClass('esselected');
			$(this).addClass('esselected');
		}
	});

	//左移
	$("#esleft,#esleft2").live('click',function(){
		$(this).attr('id')=='esleft' ? $('#useRole .esselected').appendTo('#listRole') : $('#useRole2 .esselected').appendTo('#listRole2');		
	});

	//右移
	$("#esright,#esright2").live('click',function(){

		$(this).attr('id')=='esright' ? $('#listRole .esselected').appendTo(' #useRole') : $('#listRole2 .esselected').appendTo('#useRole2');
	});

	//置顶
	$("#estop,#estop2").live('click',function(){
		if($(this).attr('id')=='estop'){
			if($('#useRole li:first').html()==$('#useRole .esselected').html()){ return; }
			$('#useRole li:first').before($("#useRole .esselected"));
		}else{
			if($('#useRole2 li:first').html()==$('#useRole2 .esselected').html()){ return; }
			$('#useRole2 li:first').before($("#useRole2 .esselected"));
		}
	});

	//置底
	$("#esbottom,#esbottom2").live('click',function(){
		if($(this).attr('id')=='esbottom'){
			if($('#useRole li:last').html()==$('#useRole .esselected').html()){ return; }
			$('#useRole li:last').after($("#useRole .esselected"));
		}else{
			if($('#useRole2 li:last').html()==$('#useRole2 .esselected').html()){ return; }
			$('#useRole2 li:last').after($("#useRole2 .esselected"));
		}
	});

	//上移
	$("#esup,#esup2").live('click',function(){
		if($(this).attr('id')=='esup'){
			var index=$('#useRole .esselected').index()-1;
			if(index>-1){
				$('#useRole li:eq('+index+')').before($("#useRole .esselected"));
			}
		}else{
			var index=$('#useRole2 .esselected').index()-1;
			if(index>-1){
				$('#useRole2 li:eq('+index+')').before($("#useRole2 .esselected"));
			}
		}
	});

	//下移
	$("#esdown,#esdown2").live('click',function(){
		if($(this).attr('id')=='esdown'){
			var index=$('#useRole .esselected').index()+1;
			$('#useRole li:eq('+index+')').after($("#useRole .esselected"));
		}else{
			var index=$('#useRole2 .esselected').index()+1;
			$('#useRole2 li:eq('+index+')').after($("#useRole2 .esselected"));
		}
	});

	//双击
	$('#listRole li,#listRole2 li').live('dblclick',function (){
		$(this).parent().attr('id')=='listRole' ? $('#useRole').append($(this)) : $('#useRole2').append($(this));
	});

	$('#useRole li,#useRole2 li').live('dblclick',function (){
		$(this).parent().attr('id')=='useRole' ? $('#listRole').append($(this)) : $('#listRole2').append($(this));
	});

	//全部左移
//	$("#esleftall").live('click',function(){
//		$("#useRole li").each(function(i){
//			if("none"!=($(this).css("display"))){
//				$(this).appendTo('#listRole');
//			}
//		});
//	});

	//全部右移
//	$("#esrightall").live('click',function(){
//		$("#listRole li").each(function(i){
//			if("none"!=($(this).css("display"))){
//				$(this).appendTo('#useRole');
//			}
//		});
//	});
})(jQuery);

//筛选
function show(value,position){
	if($.trim(value)==''){
		$('#listRole li').show();
		$('#useRole li').show();
		return;
	}else{
		if(position=='left'){
			$('#listRole li').hide();
			$('#listRole li:contains('+value+')').show();
			
		}else if(position=='right'){
			$('#useRole li').hide();
			$('#useRole li:contains('+value+')').show();
			
		}else{
			return;
		}
	}
}

//筛选
function show2(value,position){
	if($.trim(value)==''){
		$('#listRole2 li').show();
		$('#useRole2 li').show();
		return;
	}else{
		if(position=='left'){
			$('#listRole2 li').hide();
			$('#listRole2 li:contains('+value+')').show();
		}else if(position=='right'){
			$('#useRole2 li').hide();
			$('#useRole2 li:contains('+value+')').show();
		}else{
			return;
		}
	}
}	