/*
表单验证插件
表单【form】中的控件添加verify属性
属性格式【text/30/1/0】 
*/

(function($){
	function validateOnChange(e)
	{
		var $e = $(e);
		var value=$e.val();
		var verify=$e.attr("verify");
		if(verify){
		var p=verify.split('/');
		var reg=p[0];//正则
		if(reg == 'bool'){
			return true;
		}
		var len=p[1];//value值字符长度
		var isnull=p[2];//是否为空
		var dolength=p[3];//小数点的位数
		eval("var freg = /^\\d+\\.\\d{"+dolength+"}$/;");
		/** guolanrui 20140731 修改原来的浮点型的正则表达式 BUG：207 **/
		
		var msg='';
		switch(reg)
		{
			
			case 'text': msg='格式必须为文本类型';reg = /\S+/i;break;
			case 'date-': msg='格式必须为日期类型，如：20120101';reg = /^(?:(?!0000)[0-9]{4}(?:(?:0[1-9]|1[0-2])(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])(?:29|30)|(?:0[13578]|1[02])31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)0229)$/i;break;
			case 'date':  msg='格式必须为日期类型，如：2012-01-01';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i;break;
			case 'time':  msg='格式必须为时间类型，如：00:00:00';reg = /^(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;break;//liqiubo 20140818 更换时间格式的验证
			case 'number':	 msg='格式必须为整数类型';reg = /^\d+$/i;break;
			case 'floatOld':  msg='格式必须为浮点类型且必须有'+dolength+'位小数';reg =freg;break;
			case 'float': eval("var fregNew = /^\\d+(\\.\\d{0,"+dolength+"})?$/;"); msg='格式为浮点类型且最多有'+dolength+'位小数';reg =fregNew;break;
		}

        if(isnull==1 && (value=='' || value=='undefined')){
    		
    		if(e.type=='select-one' && $.browser.msie && $.browser.version <= 7.0){
    		var dObj=$e.parent('div');
    			if(dObj.length==0){
    				var div=document.createElement('div');
	    			var span=$e.siblings('span')[0];
	    			div.style.width="162px";
	    			div.style.height="22px";
	    			div.style.float="left";
	    			div.style.border="2px #DD0000 solid";
	    			$e.appendTo(div);
    				$(span).after(div);
    			}else{
    				dObj.css('border','2px #DD0000 solid');
    			}
    		}
    		$e.addClass("invalid-text");
        	$e.attr('title','此项不能为空');
        	return false;
        }
        if(value!=''){
        	var strlength =value.replace(/[^\x00-\xff]/g,'aa').length; //字符长度 一个汉字两个字符
        	if(strlength > len ){
        		if($e.hasClass("selectInput")){//添加可编辑下拉框格式验证
        			$e.closest('.selectInputSpan').attr("style","border:2px #DD0000 solid;"); 
        		}else{
        		$e.addClass("invalid-text");
        		}
        		var charLen = (len%2==0)?(len/2):((len-1)/2);
//        		$e.attr('title','数据长度不正确');
        		/** guolanrui 20140731 修改数据长度大于最大长度时的提示消息BUG：211 **/
        		
        		$e.attr('title','数据长度最大为'+len+'个字符（'+charLen+'个汉字）');
        		return false;
        	}  
    		if(value.search(reg)==-1){
    			if($e.hasClass("selectInput")){//添加可编辑下拉框格式验证
    				$e.closest('.selectInputSpan').attr("style","border:2px #DD0000 solid;"); 
        			$e.closest('.selectInputSpan').removeAttr("style"); 
        		}else{
        			$e.addClass("invalid-text");
        		}
        		
        		$e.attr('title',msg);
        		return false;
        	}
        }
        
        if($e.hasClass("selectInput")){
			$e.closest('.selectInputSpan').removeAttr("style"); 
		}
        $e.removeClass('invalid-text');
		if(e.type=='select-one' && $.browser.msie && $.browser.version <= 7.0 && $e.parent('div').length > 0){ $e.parent('div').css('border','');}
		$e.attr('title','');
		return true;
		}
	}
	//点击保存时提交
	$.fn.validate=function(){
		var invalidate=true;
		this.each(function(j){
			var len=this.elements.length;
			for(var i=0;i<len;i++){
				var e=this.elements[i];
				var $e = $(e);
				if (e.type != "text" && e.type!="password" && e.type!='select-one' && e.type!='textarea') continue;
				var verify=$e.attr("verify");
				if(verify){
					validateOnChange(e);
				}
				if($e.hasClass("selectInput")){//添加可编辑下拉框格式验证
					var style=$e.closest('.selectInputSpan').attr("style");
					if(style!=undefined){
						if(style.indexOf("border")!=(-1)){
							if(invalidate) e.focus();
							invalidate = invalidate && false;
						}
					}
				}else if ($e.hasClass("invalid-text")){
					if(invalidate) e.focus();
					invalidate = invalidate && false;
				}
			}
		});
		return invalidate;
	}
	//自动验证
	$.fn.autovalidate=function(){
		this.each(function(j){
			var len=this.elements.length;
			for(var i=0;i<len;i++){
				var e=this.elements[i];
				 if (e.type != "text" && e.type!="password" && e.type!='select-one' && e.type!='textarea') continue;
				// var verify=e.getAttribute("verify");
				// if(verify){
				 	$(e).die("keyup").live("keyup", function(){
				 		validateOnChange(this);
				 	});
				 	$(e).die("change").live("change", function(){
				 		validateOnChange(this);
				 	});
				//}
			}
		});
		return this;
	}
})(jQuery);
