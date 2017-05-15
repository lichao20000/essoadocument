
var menuSliding = function(config){
	var panel = null;
	var timeout = null;
	var w = null;
	var p = 0;
	var t = 0;
	
	var init = function(config){
		if (typeof config.panel == 'undefined') {
			return false;
		}
		
		panel = document.getElementById(config.panel);
		var temp = panel.getElementsByTagName('ul');
		t = temp.length;
		if (temp.length < 1) 
			return false;
		w = temp[0].clientWidth;
		
		return true;
	};
	var move = function(isLeft){
		var pml = p * w * -1;
		
		var to = null;
		if (isLeft) {
			if (p - 1 < 0) 
				return false;
			p--;
			to = pml + w;
		}
		else {
			if (p + 1 >= t) 
				return false;
			p++;
			to = pml - w;
			
		}
		if (timeout != null) {
			clearTimeout(timeout);
		}
		var c = parseInt(panel.style.marginLeft);
		if (isNaN(c)) 
			c = 0;
		animation(c, to);
		
		return false;
	};
	var animation = function(startPoint, endPoint){
		slidingAnimation({
			startPoint: startPoint,
			endPoint: endPoint,
			time: 1,
			pixel: 20,
			endHook: function(){
				timeout = null;
				
			},
			action: function(e){
			
				panel.style.marginLeft = e.cp + 'px';
			},
			catchTimeout: function(timeo){
				timeout = timeo;
			}
		});
		
	};
	if (!init(config)) {
		return false;
	}
	document.getElementById(config.left).onclick = function(){
		move(true);
	};
	document.getElementById(config.right).onclick = function(){
		move(false);
	};
};

var divPro = function(id){
	var obj = document.getElementById(id);
	return {
		obj: obj
	};
};

var slidingAnimation = function(config){
	startPoint = config.startPoint;
	endPoint = config.endPoint;
	if (startPoint == endPoint) {
		if (typeof config.endHook == 'function') 
			config.endHook();
		return;
	}
	if (endPoint > startPoint) {
		startPoint += config.pixel;
		if (endPoint < startPoint) 
			startPoint = endPoint;
	}
	else {
		startPoint -= config.pixel;
		if (endPoint > startPoint) 
			startPoint = endPoint;
	}
	config.action({
		cp: startPoint
	});
	config.startPoint = startPoint;
	var timeout = setTimeout(function(){
		slidingAnimation(config);
	}, config.time);
	if (typeof config.catchTimeout == 'function') 
		config.catchTimeout(timeout);
};

var slidingSH = function(config){
	var timeout = null;
	var panelPro = null;
	var range = null;
	var popup = null;
	var timeout_over = null;
	var timeout_out = null;
	
	var showPanel = function showPanel(){
		move(false);
	};
	var hidePanel = function(){
		move(true);
	};
	var move = function(isUp){
	
		if (timeout != null) 
			clearTimeout(timeout);
		endPoint = isUp ? 0 : range;
		var startPoint = panelPro.obj.clientHeight;
		
		animate(startPoint, endPoint);
		
	};
	var animate = function(startPoint, endPoint){
		slidingAnimation({
			startPoint: startPoint,
			endPoint: endPoint,
			time: 0.1,
			pixel: 20,
			endHook: function(){
				timeout = null;
			},
			action: function(e){
			
				panelPro.obj.style.height = e.cp + 'px';
			},
			catchTimeout: function(to){
				timeout = to;
			}
		});
	};

	if (typeof config.panel == 'undefined') 
		return;
	panelPro = divPro(config.panel);
	range = panelPro.obj.clientHeight;
	panelPro.obj.onmouseover = function(){
		clearTimeout(timeout_out);
	};
	panelPro.obj.onmouseout = function(){
		clearTimeout(timeout_over);
		timeout_out = setTimeout(function(){
			hidePanel();
		}, 100);
	};
	panelPro.obj.style.overflow = 'hidden';
	panelPro.obj.style.height = '0px';
	
	
	popup = document.getElementById(config.popup);
	popup.onmouseover = function(){
		clearTimeout(timeout_out);
		timeout_over = setTimeout(function(){
			showPanel();
			
			
		}, 100);
	};
	popup.onmouseout = function(e){
		//return;
		clearTimeout(timeout_over);
		timeout_out = setTimeout(function(){
			hidePanel();
		}, 100);
		
	};
};


