/*
表单验证插件
表单【form】中的控件添加verify属性
属性格式【text/30/1/0】 
*/
(function($){
	function validateOnChange(e)
	{
		var $e = $(e);
		var value=$.trim($e.val());
		var verify=$e.attr("verify");
		if(verify){
		var p=verify.split('/');
		var reg=p[0];//正则
		if(reg == 'bool'){
			return true;
		}
		var len=p[1];//value值长度
		var isnull=p[2];//是否为空
		var dolength=p[3];//小数点的位数
		var tolength='0';
		eval("var freg = /^\\d+\\.\\d{"+dolength+"}$/;");
		var msg='';
		switch(reg)
		{
			case 'text': msg='格式必须为文本类型';tolength='1';reg = /\S+/i;break;
			case 'date-': msg='格式必须为日期类型，如：20120101';tolength='0';reg = /^(?:(?!0000)[0-9]{4}(?:(?:0[1-9]|1[0-2])(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])(?:29|30)|(?:0[13578]|1[02])31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)0229)$/i;break;
			case 'date':  msg='格式必须为日期类型，如：2012-01-01';tolength='0';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i;break;
			//case 'time':  msg='格式必须为时间类型，如：2012-01-01 00:00:00';tolength='0';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) (?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;break;
			case 'time':  msg='格式必须为时间类型，如：2012-01-01 00:00:00';tolength='0';reg = /^(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;break;
			case 'Time':  msg='格式必须为时间类型，如：00:00:00';tolength='0';reg = /^([01]?[0-9]|2[0-3]:[0-5][0-9]:[0-5][0-9])$/i;break;
			case 'number':	 msg='格式必须为整数类型';tolength='0';reg = /^\d+$/i;break;
			case 'floatOld':  msg='格式必须为浮点类型且必须有'+dolength+'位小数';tolength='0';reg =freg;break;
			case 'float': eval("var fregNew = /^\\d+(\\.\\d{0,"+dolength+"})?$/;"); msg='格式为浮点类型且最多有'+dolength+'位小数';tolength='0';reg =fregNew;break;
			case 'email': msg='格式必须为邮箱类型， 如: example@email.com'; tolength='0';reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; break;
			case 'mobile': msg='格式必须为手机号类型，如：18612345678';tolength='0';reg=/^1[3|4|5|8][0-9]\d{8}$/;break;
			case 'special': msg='该输入项只能输入中文、英文、数字或下划线';tolength='1';reg=/^([\u4e00-\u9fa5]|[a-zA-Z0-9_])+$/;break;
			case 'unspecial': msg='该输入项不允许包含'+"|\\?&,'.\"><;"+'等英文特殊字符';tolength='1';reg = /^([\u4e00-\u9fa5]|[a-zA-Z0-9]|[^|\\'?&,."><;])+$/;break;
			case 'unspecial-': msg='该输入项只能输入!@#$%^&*?_+\-=等英文特殊字符';tolength='1';reg = /^([!@#$%^&*?_+\-=])+$/;break;
			case 'china-english': msg='该输入项只能输入中文或英文字母,不能有空格';tolength='1';reg = /^[\u4e00-\u9fa5a-zA-Z]+$/;break;
			//case 'china-english_': msg='该输入项只能输入中文或英文字母，不能有空格';tolength='1';reg = /^([\u4e00-\u9fa5a-zA-Z])+$/;break;
			case 'china': msg='该输入项只能输入中文，下划线、等号；（中文）双引号、括号、分号、顿号；（中英文）逗号、句号、小括号以及（英文）中括号、斜杠、横杠';tolength='1';reg = /^([\u4e00-\u9fa5_，。：；【】《》“”\-=,.()（）、\[\] ])+$/;break;
			case 'english': msg='该输入项只能输入英文字母';reg = /^[A-Za-z]+$/;tolength='0';break;
			case 'english-num_': msg='该输入项只能输入英文字母、数字、空格或_-';tolength='0';reg = /^[a-zA-Z0-9_\-\s]+$/;break;
			case 'english-num': msg='该输入项只能输入英文字母、数字';tolength='0';reg = /^[a-zA-Z0-9]+$/;break;
			case 'englishname': msg='该输入项只能输入英文字母、数字、空格或_-';tolength='0';reg = /^[a-zA-Z0-9_\-\s]+$/;break;
			case 'china-english-num': msg='该输入项只能输入中文、英文字母或数字';tolength='1';reg = /^([\u4e00-\u9fa5]|[a-zA-Z0-9])+$/;break;
			case 'desc': msg='该输入项只能由中文、英文、数字、下划线、等号；（中文）双引号、括号、分号、顿号；（中英文）逗号、句号、小括号以及（英文）中括号、斜杠、横杠组成!';reg = /^[a-zA-Z0-9\u4e00-\u9fa5_，。：；【】《》“”\-=,.()（）、\[\] ]*$/;break;
			case 'flowFun': msg='该输入项不包含中文或'+"[`~!@#$^&*()=|{}':;',\\[]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"+'等特殊字符';tolength='1';reg=/^[^\u4e00-\u9fa5`~!@#$^&*()=|{}':;',\\\[\]<>\/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]+$/;break;
			case 'boolean': msg='该输入项只能为“是”或“否”';tolength='0';reg =/^[\u662f|\u5426]$/;break;
			case 'identity': msg='该输入项只能输入整数,最后一位可以是X或x英文字符的18位身份证号码';tolength='0';reg =/^((\d{18})|(\d{17}[X])|(\d{17}[x]))*$/;break;
			default:
				break;
		}
		if($e.hasClass('FOCUS_EVENT')){
	        if(value!=''){
	        	if(tolength=='1'){
	        		var strlength =value.replace(/[^\x00-\xff]/g,'aa').length; //字符长度 一个汉字两个字符
		        	if(strlength > len && len > 0){
		        		e.style.border="1px #DD0000 solid";
		        		var charLen = (len%2==0)?(len/2):((len-1)/2);
		        		$e.attr('title','数据长度最大为'+len+'个字符（'+charLen+'个汉字）');
		        		return false;
		        	}  
	        	}else{
	        		if(value.length>len && len>0 ){
	        			e.style.border="1px #DD0000 solid";
	        			$e.attr('title','数据长度最大为'+len+'个字符');
	        			return false;
	        		}
	    		}
	    		if(value.search(reg)==-1){
	    			e.style.border="1px #DD0000 solid";
	        		$e.attr('title',msg);
	        		return false;
	        	}
	        }
	        if(isnull==1 && (value=='' || value=='undefined')){
	        	e.style.border="1px #DD0000 solid";
	        	$e.attr('title','此项不能为空');
	        	return false;
	        }
	        e.style.border="1px solid blue";
			if(e.type=='select-one' && $.browser.msie && $.browser.version <= 7.0 && $e.parent('div').length > 0){ $e.parent('div').css('border','');}
			$e.attr('title','');
			return true;
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
        	if(tolength=='1'){
        		var strlength =value.replace(/[^\x00-\xff]/g,'aa').length; //字符长度 一个汉字两个字符
	        	if(strlength > len && len > 0){
	        		$e.addClass("invalid-text");
	        		var charLen = (len%2==0)?(len/2):((len-1)/2);
	        		$e.attr('title','数据长度最大为'+len+'个字符（'+charLen+'个汉字）');
	        		return false;
	        	}  
        	}else{
        		if(value.length>len && len>0 ){
        			$e.addClass("invalid-text");
        			$e.attr('title','数据长度最大为'+len+'个字符');
        			return false;
        		}
    		}
    		if(value.search(reg)==-1){
        		$e.addClass("invalid-text");
        		$e.attr('title',msg);
        		return false;
        	}
        }
		$e.removeClass('invalid-text');
		if(e.type=='select-one' && $.browser.msie && $.browser.version <= 7.0 && $e.parent('div').length > 0){ $e.parent('div').css('border','');}
		if(!$e.hasClass('warning'))
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
				if($e.hasClass("invalid-text")){
					if(invalidate) e.focus();
					invalidate = invalidate && false;
				}
				
			}
		});
		
		return invalidate;
	}
	
	//发布消息模块文本编辑器的保存验证
	$.fn.validateCkeditor=function(){
		var invalidate=true;
		var falg=false;
		this.each(function(j){
			var len=this.elements.length;
			for(var i=0;i<len;i++){
				var e=this.elements[i];
				var $e = $(e);
				if (e.type != "text" && e.type!="password" && e.type!='select-one' && e.type!='textarea') continue;
				var verify=$e.attr("verify");
				if(verify){
					falg = validateOnChange(e);
				}
				if(falg){
				e.style.border="1px solid rgb(204, 204, 204)";
				}else{
				invalidate=false;
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
			 	$(e).die("keyup").live("keyup", function(){
			 		validateOnChange(this);
			 	});
			 	$(e).die("change").live("change", function(){
			 		validateOnChange(this);
			 	});
			 	$(e).die('focus').live("focus",function(){
			 		validateOnChange(this);
			 	});
			 	$(e).die('blur').live("blur",function(){
			 		validateOnChange(this);
			 	});
			 	//xiewenda 2015/03/19 时间类型的判断
			 	if($(e).hasClass('Wdate')){
			 		$(e).die("focus").live("focus", function(){
				 		validateOnChange(this);
				 	});
			 	}
			}
		});
		return this;
	}
})(jQuery);
