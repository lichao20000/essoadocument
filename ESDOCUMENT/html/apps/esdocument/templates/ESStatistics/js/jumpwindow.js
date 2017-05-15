(function($) {
	// 单击初始化样式
	$('#groupField li').die().live('click', function() {
		$('#groupField li').removeClass('esselected');
		$(this).addClass('esselected');
	});

	$('#statisticsField li').die().live('click', function() {
		$('#statisticsField li').removeClass('esselected');
		$(this).addClass('esselected');
	});

	// 左移
	$("#esleft,#esleft2").live(
			'click',
			function() {
				$(this).attr('id') == 'esleft' ? $('#groupField .esselected')
						.appendTo('#g_fieldList') : $(
						'#statisticsField .esselected')
						.appendTo('#s_fieldList');
			});

	// 右移
	$("#esright,#esright2").live(
			'click',
			function() {
				$(this).attr('id') == 'esright' ? $('#g_fieldList .esselected')
						.appendTo('#g_fieldList2') : $(
						'#s_fieldList .esselected').appendTo('#s_fieldList2');
			});

	// 置顶
	$("#estop,#estop2").live('click', function() {
		var li = null;
		if ($(this).attr('id') == 'estop') {
			li = $("#groupField .esselected");
		} else {
			li = $("#statisticsField .esselected");
		}
		if (li != null) {
			var ul = li.closest("ul");
			if (ul.find("li:first").html() == li.html()) {
				return;
			} else {
				ul.find("li:first").before(li);
			}
		}
	});

	// 置底
	$("#esbottom,#esbottom2").live('click', function() {
		var li = null;
		if ($(this).attr('id') == 'esbottom') {
			li = $("#groupField .esselected");
		} else {
			li = $("#statisticsField .esselected");
		}
		if (li != null) {
			var ul = li.closest("ul");
			if (ul.find("li:last").html() == li.html()) {
				return;
			} else {
				ul.find("li:last").after(li);
			}
		}
	});

	// 上移
	$("#esup,#esup2").live('click', function() {
		var li = null;
		if ($(this).attr('id') == 'esup') {
			li = $("#groupField .esselected");
		} else {
			li = $("#statisticsField .esselected");
		}
		if (li != null) {
			var ul = li.closest("ul");
			var index = li.index()-1;
			if (index > -1) {
				ul.find('li:eq(' + index + ')').before(li);
			}
		}
	});

	// 下移
	$("#esdown,#esdown2").live('click', function() {
		var li = null;
		if ($(this).attr('id') == 'esdown') {
			li = $("#groupField .esselected");
		} else {
			li = $("#statisticsField .esselected");
		}
		if (li != null) {
			var ul = li.closest("ul");
			var index = li.index()+1;
			if (index < ul.find("li").length) {
				ul.find('li:eq(' + index + ')').after(li);
			}
		}
	});

	// 双击
	$('#g_fieldList li,#g_fieldList2 li').live(
			'dblclick',
			function() {
				$(this).parent().attr('id') == 'g_fieldList' ? $(
						'#g_fieldList2').append($(this)) : $('#g_fieldList')
						.append($(this));
			});

	$('#s_fieldList li,#s_fieldList2 li').live(
			'dblclick',
			function() {
				$(this).parent().attr('id') == 's_fieldList' ? $(
						'#s_fieldList2').append($(this)) : $('#s_fieldList')
						.append($(this));
			});
})(jQuery);

// 筛选
function show(value, position) {
	if ($.trim(value) == '') {
		$('#g_fieldList li').show();
		$('#g_fieldList2 li').show();
		return;
	} else {
		if (position == 'left') {
			$('#g_fieldList li').hide();
			$('#g_fieldList li:contains(' + value + ')').show();

		} else if (position == 'right') {
			$('#g_fieldList2 li').hide();
			$('#g_fieldList2 li:contains(' + value + ')').show();

		} else {
			return;
		}
	}
}

// 筛选
function show2(value, position) {
	if ($.trim(value) == '') {
		$('#s_fieldList li').show();
		$('#s_fieldList2 li').show();
		return;
	} else {
		if (position == 'left') {
			$('#s_fieldList li').hide();
			$('#s_fieldList li:contains(' + value + ')').show();
		} else if (position == 'right') {
			$('#s_fieldList2 li').hide();
			$('#s_fieldList2 li:contains(' + value + ')').show();
		} else {
			return;
		}
	}
}