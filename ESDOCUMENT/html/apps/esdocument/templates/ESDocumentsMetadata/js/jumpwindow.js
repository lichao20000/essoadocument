/*
 * modify date 20121009
 * modify author fangjixiang
 */

$(document).ready(function(){
//单击初始化样式
$('#userRole li').live('click',function(){
	if($(this).parent().parent().parent().attr('id')=='userRole'){
		$('#userRole li').removeClass('esselected');
		$(this).addClass('esselected');
	}
	else if ($(this).parent().parent().parent().parent().attr('id')=='userRole') {
		$('#userRole li').removeClass('esselected');
		$(this).addClass('esselected');
	}
	
});

//左移
$("#esleft").live('click',function(){
	var str = /(\|true)+/;
	var html = $('#useRole .esselected').html();
	if(str.test(html)==true){
		var newhtml = html.replace(str,"");
		$('#useRole .esselected').html(newhtml);
		$('#listRole').append($('#useRole .esselected'));
		return;
	}
	 $('#useRole .esselected').remove();
	
});

//右移
$("#esright").live('click',function(){
	var html = $('#listRole .esselected').html();
	html+='|true';
	$('#listRole .esselected').html(html);
	$('#listRole .esselected').appendTo('#useRole');
});

//置顶
$("#estop").live('click',function(){
		if($('#useRole li:first').html()==$('#useRole .esselected').html()){ return; }
		$('#useRole li:first').before($("#useRole .esselected"));
});

//置底
$("#esbottom").live('click',function(){
		if($('#useRole li:last').html()==$('#useRole .esselected').html()){ return; }
		$('#useRole li:last').after($("#useRole .esselected"));
});

//上移
$("#esup").die().live('click',function(){
		var index=$('#useRole .esselected').index()-1;
		if(index>-1){
			$('#useRole li:eq('+index+')').before($("#useRole .esselected"));
		}
});

//下移
$("#esdown").die().live('click',function(){
	var index=$('#useRole .esselected').index()+1;
	$('#useRole li:eq('+index+')').after($("#useRole .esselected"));
});

//单击
$('#listRole li').live('dblclick',function (){
	var html = $('#listRole .esselected').html();
	html+='|true';
	$('#listRole .esselected').html(html);
	$('#listRole .esselected').appendTo('#useRole');
});

$('#useRole li').live('dblclick',function (){
	var str = /(\|true)+/;
	var html = $('#useRole .esselected').html();
	if(str.test(html)==true){
		var newhtml = html.replace(str,"");
		$('#useRole .esselected').html(newhtml);
		$('#listRole').append($('#useRole .esselected'));
		return;
	}
	 $('#useRole .esselected').remove();
});
$("#chan").die().live('click',function(){
	var length = $("input[name='comlen']").val();
	if(length=="" || typeof length == "undefined" ){
		$.dialog.notice({icon:'warning',content:'请先填写连接符',time:3,title:'3秒后自动关闭'});
		return;
	}
	length+='|false';
	var html='<li id="">'+length+'</li>';
	$('#useRole').append(html);
});
if($("#tagtexts").val()!=''){
	$.each($("#tagtexts").val().split(","),function(i,v){
		treatTagid(v);
	});
}
function treatTagid(val){
	$('#listRole li').each(function(){
		if(val.indexOf($(this).text())>-1){
			var html='<li id="'+$(this).attr("id")+'">'+val+'</li>';
			$('#useRole').append(html);
			$(this).remove();
			return ;
		}
	});
	if(val.indexOf('false')>-1){
		var html='<li id="">'+val+'</li>';
		$('#useRole').append(html);
	}
};	
});
//筛选
function show(value,position)
{
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
};