/**
 * 
 */
;
(function($) {
	$.fn.extend({
		// 鼠标滚轮事件
		mousewheel : function(Func) {
			return this.each(function() {
				var _self = this;
				_self.D = 0;// 滚动方向
				if ($.browser.msie || $.browser.chrome
						|| $.browser.safari) {
					_self.onmousewheel = function() {
						_self.D = event.wheelDelta;
						event.returnValue = false;
						Func && Func.call(_self);
					};
				} else {
					_self.addEventListener("DOMMouseScroll",
							function(e) {
								_self.D = e.detail > 0 ? -1 : 1;
								e.preventDefault();
								Func && Func.call(_self);
							}, false);
				}
			});
		},
		// 添加滚动条
		ESScrollBar : function(opts) {
			opts = $.extend({
				color : "#ccc",
				width : "6px",
				maxHeight : 100,
				step : 20
			}, opts);
			return this.each(function() {
					if (this.esscrollbar) return false;
					var t = $(this);
					var dH = t.prop("scrollHeight") - opts.maxHeight;
					if(($.browser.msie && dH > 2) || (!$.browser.msie && dH > 0)){
						t.find("li").css({position : "relative"});
						t.css({overflowY : "hidden",position : "relative"});
						var barH = Math.round(Math.pow(opts.maxHeight,2) / t.prop("scrollHeight"));
						var barDiffH = opts.maxHeight - barH;
						var barStep = Math.round(barDiffH*opts.step/dH);
						// 创建滚动条div
						var bar = $("<div style='height:" + barH + "px;background:" + opts.color + ";width:100%;position:relative;border-right:0px;'></div>");
						var scrollback = $("<div style='height:" + opts.maxHeight + "px;font-size:1px;float:right;position:absolute;right:0px; top:0px; width:"+ opts.width+ ";border-right:0px;'></div>");
						var fLi = t.find("li:first");
						scrollback.append(bar);
						t.append(scrollback);
						// 滚动处理
						$(this).mousewheel(function() {
							if(this.D > 0 && parseInt(fLi.position().top) < 0){
								bar.stop(true, true).animate({top:'-=' + barStep + 'px'}, 100);
								t.find("li").stop(true, true).animate({top:'+=' + opts.step + 'px'}, 100, function(){
									if(parseInt(fLi.position().top) > 0){
										t.find("li").animate({top:'0px'},150);
										bar.css({top:0});
									}									
								});
							} else if(this.D < 0 && parseInt(fLi.position().top) > -dH) {
								bar.stop(true, true).animate({top:'+=' + barStep + 'px'}, 100);
								t.find("li").stop(true, true).animate({top:'-=' + opts.step + 'px'}, 100, function(){
									if(parseInt(fLi.position().top) < -dH){
										t.find("li").animate({top:-dH},150);
										bar.css({top:barDiffH});
									}										
								});
							}
						});
						// 记录变量，实现仅创建一次滚动条
						this.esscrollbar = {
							barHeight: barH,
							barDiffHeight : barDiffH,
							barStep : barStep,
							scrollbar : bar,
							scrollback : scrollback,
							firstLi : fLi
						};
					}
					//setInterval(function(){
					//document.title = ele.scrollHeight;
					//}, 300);
				});
			}
		});
})(jQuery);