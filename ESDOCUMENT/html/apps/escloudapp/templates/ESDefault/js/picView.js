$(function(){
		_i={
				_rightP:function(show){
					show = show||false;
					if(!show){
						$(".arrR").hide();
						$(".btnNext").hide();
					}else{
						$(".arrR").show();
						$(".btnNext").show();
					}
					return this;
				},
				_leftP:function(show){
					show=show||false;
					if(!show){
						$(".arrL").hide();
						$(".btnPrev").hide();
					}else{
						$(".arrL").show();
						$(".btnPrev").show();
					}
					return this;
				}
		}
	$('#showBox').mousemove(function(e){
		if (e.pageX < ($('#showBox').offset().left + $('#showBox').width() / 2)) {
			_i._leftP(true);
			_i._rightP(false);
		} else {
			_i._rightP(true);
			_i._leftP(false);
		};
		return this;
	}).mouseout(function(e){
		_i._rightP(false);
		_i._leftP(false);
		return this;
	});
});