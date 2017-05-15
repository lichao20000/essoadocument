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
		var len=p[1];//value值长度
		var isnull=p[2];//是否为空
		var dolength=p[3];//小数点的位数
		eval("var freg = /^\\d+\\.\\d{"+dolength+"}$/;");
		/** guolanrui 20140731 修改原来的浮点型的正则表达式 BUG：207 **/
		
		var msg='';
		var tolength='0';
		switch(reg)
		{
			case 'text': msg='格式必须为文本类型';tolength='1';reg = /\S+/i;break;
			case 'simpletext': msg='不允许包含特殊字符，只能输入汉字、字母、数字和下划线！';tolength='1';reg = /^([_a-zA-Z0-9\u4e00-\u9fa5]*)$/;break;
			case 'date-': msg='格式必须为日期类型，如：20120101';tolength='0';reg = /^(?:(?!0000)[0-9]{4}(?:(?:0[1-9]|1[0-2])(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])(?:29|30)|(?:0[13578]|1[02])31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)0229)$/i;break;
			case 'date':  msg='格式必须为日期类型，如：2012-01-01';tolength='0';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i;break;
			case 'time':  msg='格式必须为时间类型，如：2012-01-01 00:00:00';tolength='0';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) (?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;break;
			case 'number':	 msg='格式必须为整数类型';tolength='0';reg = /^\d+$/i;break;
			case 'floatOld':  msg='格式必须为浮点类型且必须有'+dolength+'位小数';tolength='0';reg =freg;break;
			case 'float': eval("var fregNew = /^\\d+(\\.\\d{0,"+dolength+"})?$/;"); msg='格式为浮点类型且最多有'+dolength+'位小数';tolength='0';reg =fregNew;break;
			//gengqianfeng 20140913 添加邮箱手机号验证
			case 'email': msg='格式必须为邮箱类型， 如: example@email.com';tolength='0'; reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; break;
			case 'mobile': msg='格式必须为手机号类型，如：18612345678';tolength='0';reg=/^1[3|4|5|8][0-9]\d{8}$/;break;
			case 'special': msg='该输入项不允许包含'+"|\\'?.\"><;"+'等特殊字符';tolength='1';reg=/^([\u4e00-\u9fa5]|[a-zA-Z0-9]|[^|\\'?."><;])+$/;break;
			case 'english_': msg='该输入项只包含英文大小字符或下划线，如：aBc_';tolength='0';reg=/^[A-Za-z_]+$/;break;
			case 'english':msg='该输入项只包含英文大小字符，如：aBc';tolength='0';reg=/^[A-Za-z]+$/;break;
			//guolanrui 20140917 添加备注，描述类正则表达式
			case 'description': msg='该输入项只能由中文、英文、数字、下划线、等号；（中文）括号、分号、顿号；（中英文）逗号、句号、双引号、小括号以及（英文）中括号、横杠组成!';tolength='1';reg = /^[a-zA-Z0-9\u4e00-\u9fa5_，。：；【】《》“”""-=,.()（）、\[\] ]*[^<>]$/;break;
			//ip
			case 'ip': msg='该输入项只能是0-255之间的整数';tolength='0';reg = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;break;
			//端口号
			case 'portNum': msg='该输入项只能输入0到65535的整数';tolength='0';reg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;break;
			default:
				break;
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
        			/** guolanrui 20140731 修改数据长度大于最大长度时的提示消息BUG：211 **/
        			$e.attr('title','数据长度最大为'+len+'个字符（'+charLen+'个汉字）');
            		return false;
            	}  
        	}else{
        		//gengqianfeng 20140922 字符长度验证提示
        		if(value.length>len && len>0){
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
