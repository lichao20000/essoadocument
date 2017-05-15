/**
 *   jiangyuntao 20100809 add   表达式自动计算
 */
	
	var newAr = [];
	
	var signArr = ['+','-','*','/','(',')'];  //符号数组

   /**
    *   自动计算方法，根据传入的表达式数组，为相应的组件绑定事件
    */
	function autoCalculate(exprelist){
		
		pushFieldsToArr(exprelist,newAr); //获得表达式集合中包含的所有组件ID（已去除重复）

		addAllKeyup(exprelist);  //增加Keyup事件;
		
		addAllPropertychange(getAgainCalculateFields(getFields(exprelist),exprelist));  //增加Propertychange事件;
		
	}

   /**
    *   增加Keyup事件
	*   exprelist  所有表达式数组
    */
	function addAllKeyup(exprelist){

		for( var i = 0,len = exprelist.length; i < len ; i++){

			addOneKeyup(exprelist[i]); 
			
		}

	}
	
   /**
    *   增加Propertychange事件
	*   PropertychangeArr  需要增加Propertychange事件的表达式数组   
	*   如a = b + c , d = a + e 则需要为a增加Propertychange事件，事件的表达式为 d = a + e ;
	*   因为 a 需要被别的表达式计算，而a又参与计算d .
    */
	function addAllPropertychange(PropertychangeArr){
		
		for( var i = 0,len = PropertychangeArr.length; i < len ; i++ ){
			
			addOnePropertychange(PropertychangeArr[i]); 
			
		}
	
	}

   /**
	*   验证事件源的value  只抓取数字和小数点  
	*/
	function crawlLegalValue(src){
		
		/*if(src.value.indexOf('.') != src.value.lastIndexOf('.')){
		
			temps = src.value.split('.');

			src.value = temps[0]+'.'+temps[1];
		
		}
		
		src.value = src.value.replace(/[^0-9.]+/ig,"");*/
		
	}
	
	
   /**
    *   为一个组件增加Keyup事件
    */
	function addOneKeyup(expre){

		var expres = expre.split('=');  //将表达式按=号拆分  a = b + c

		var onefield = expres[0];       //需要增加keyup事件的组件  a
       
		var currar = [];

		var singlear = [];

		pushOneFieldsToArr(expre,currar);

		showSingleArr(currar,singlear);

		for(var i = 0,len = singlear.length; i < len; i++){
			
			addkeyupEvent(document.getElementById(singlear[i]),function(){  
			
			crawlLegalValue(this);  //抓取合法的value值，
		
			var valuePre = replaceFieldToValue(expres[1]);   //keyup事件计算实际参与计算的表达式  b + c 将 b 和 c替换为对应的值  如b = 3 c = 4  替换后为 3 + 4
		
			document.getElementById(onefield).value = eval(valuePre)=='Infinity'?0:eval(valuePre);  //将组件的值赋为表达式的计算结果。如为Infinity 则赋为0
			
			if(document.getElementById(onefield).value == 0) document.getElementById(onefield).value = '';
			
		});
		
		}

	}


	
   /**
    *   为一个组件增加Propertychange事件
	*   field   增加事件的组件ID
	*   expre   一个计算部分包含field的表达式  
    */
	function addOnePropertychange(expre){   
		
		var sourceAndExpres = expre.split(':');

		var field = sourceAndExpres[0];

		var expres = sourceAndExpres[1].split('=');  //将表达式按=号拆分  a = b + c

		var onefield = expres[0];       //需要增加keyup事件的组件  a

		addpropertychangeEvent(document.getElementById(field),function(){
		
			var valuePre = replaceFieldToValue(expres[1]);   //keyup事件计算实际参与计算的表达式  b + c 将 b 和 c替换为对应的值  如b = 3 c = 4  替换后为 3 + 4
			
			document.getElementById(onefield).value = eval(valuePre)=='Infinity'?0:eval(valuePre);  //将组件的值赋为表达式的计算结果。如为Infinity 则赋为0
			
			if(document.getElementById(onefield).value == 0) document.getElementById(onefield).value = '';
			
		});

	}

   /**
    *   获得需要增加Propertychange事件的表达式数组
	*   fields  所有被计算的组件ID
	*   return 
    */
	function getAgainCalculateFields(fields,exprelist){
	
		var propertychangeArr = [];

		for(var i = 0 , len = exprelist.length ; i<len ; i++){
			
			var sourceAndExpre = isAgainCalculateFields(fields,exprelist[i]);

			if(sourceAndExpre != ''){
			   
				var sourceAndExpres = sourceAndExpre.split('&');
				
				for(var j = 0 , slen = sourceAndExpres.length ; j<slen ; j++){
				
					propertychangeArr.push(sourceAndExpres[j]);

				}
				
			}

		}

		return propertychangeArr;
	
	}


   /**
    *   判断一个表达式是否需要增加Propertychange事件 
	*   是 返回时间源 和 表达式   如  需要给  a  增加事件表达式  c = a + b 多个则已-隔开  如a：h = a + d & d: h = a + d
	*   否 返回''
    */
	function isAgainCalculateFields(fields,expre){

		var AgainCalculateFields = '';
	    
		var tempexpre = expre.split('=');

		var tempfields = tempexpre[1].replace(/\+/g,' ').replace(/\-/g,' ').replace(/\*/g,' ').replace(/\//g,' ').replace(/\(/g,'').replace(/\)/g,'').split(' ');

		for (var i = 0 , len = tempfields.length ; i < len ; i++){

			for(var j = 0 , tlen = fields.length ; j < tlen ; j ++){

				if(tempfields[i] == fields[j]) AgainCalculateFields = AgainCalculateFields + '&'+fields[j]+':'+expre;  
			
			}
			
		}
		
		if(AgainCalculateFields.length>1)return AgainCalculateFields.substring(1);

		return '';

	}

   /**
    *   获得所有被计算的组件ID  如  a = b + c ， d = a + e  则返回a，d
	*   return  fields
    */
	function getFields(exprelist){

		var fields = [];

		for( var i = 0,len = exprelist.length; i < len ; i++ ){
		
			fields.push(exprelist[i].split('=')[0]);

		}

		return fields;

	}

   /**
    *   为一个组件追加keyup事件
    */
	function addkeyupEvent(src,func) {
		// jiang 20100121
		if(null!=src){
			var oldonkeyup = src.onkeyup;

			if (typeof src.onkeyup != 'function') { //如果组件没有绑定onpropertychange事件

				src.onkeyup = func;

			} else {  //如果已绑定进行追加

				src.onkeyup =function() {

					oldonkeyup();

					func();

				}

			}
		}
	

	}
	
   /**
    *   为一个组件追加propertychange事件
    */
	function addpropertychangeEvent(src,func) {

		var oldpropertychange = src.onpropertychange;    

		if (typeof src.onpropertychange != 'function') {   //如果组件没有绑定onpropertychange事件

			src.onpropertychange = func;

		} else {  //如果已绑定进行追加

			src.onpropertychange =function() {

				oldpropertychange();

				func();

			}

		}

	}

   /**
    *   将一个表单式中的ID替换为对应的值，默认值为0  如a = 3  则将a+b 替换为  3+b
    */
	function replaceFieldToValue(expression){

		var tempexpre = expression;

		for(var i = 0; i<newAr.length ; i++){        //newAr是所有表达式中涉及的ID数组   如有 a = b + c ; d = a * e 则newAr中有 a b c d e 5个元素 
			
			if(tempexpre.indexOf(newAr[i])>=0){      //jiangyuntao 20101122 edit  性能优化
				//jiang add 20110120
				if(document.getElementById(newAr[i])!=null){
					var onevalue = document.getElementById(newAr[i]).value;  //获得newAr中一个组件的值

					if(onevalue){

						if(isNaN(onevalue)){   //如果值不是数字  替换为0

							tempexpre = replaceByCount(tempexpre,newAr[i],0,3);  

						}else{   //否则替换为值

							tempexpre = replaceByCount(tempexpre,newAr[i],onevalue,3);  

						}

					}else{

						tempexpre = replaceByCount(tempexpre,newAr[i],0,3);

					}
				}
				
			
			}

		}

		return tempexpre;

	}


   /**
    *   将source串 的 target串 替换为replacement串  替换count次  (由于替换串为变量，无法使用正则进行匹配，因此使用此方法)
    */

	function replaceByCount(source,target,replacement,count){

		for(var i = 0; i<count ; i++){

			//source = source.replace(target,replacement);
			source = currReplace(source,target,replacement);

		}

		return source;

	}
	
	
	/**
	 *    替换字符串方法，效果如  'a1+a12' 将'a1'替换为'b1' 结果为'b1+a12' 而不是'b1+b12'
	 */
	function currReplace(s,oldV,newV){
		s = s+'+';
	    for(var i=0;i<signArr.length;i++){
			s=s.replace(oldV+signArr[i],newV+signArr[i]);
		}
		return s.substr(0,s.length-1);
	}
	
	
   /**
    *   获得表达式集合中包含的所有组件ID（已去除重复）
    */
	function pushFieldsToArr(expre,newAr){

		var arr = [];

		if(expre.length==0){

			pushOneFieldsToArr(expre,arr);

		}else{

			for(var i = 0 ; i<expre.length ; i++){

				pushOneFieldsToArr(expre[i],arr);

			}

		}

		showSingleArr(arr,newAr);

	}
	
   /**
    *   将一个表达式中包含的组件ID放入arr数组
    */
	function pushOneFieldsToArr(oneexpre,arr){

		var tempexpre = oneexpre.split('=');

		var fields = tempexpre[1].replace(/\+/g,' ').replace(/\-/g,' ').replace(/\*/g,' ').replace(/\//g,' ').replace(/\(/g,'').replace(/\)/g,'').split(' ');

		for(var j = 0 ; j < fields.length ; j++){

			arr.push(fields[j]);

		}

	}
	
   /**
    *   去除数组重复，arr为有重复的数组  newAr为去重复后的数组
    */
	function showSingleArr(arr,newAr){ 

		var o={}; 

		var ar=arr; 

		for(var i=0;i<ar.length;i++){ 

			if(o[ar[i]]===undefined){ 

				o[ar[i]]="daf"; 

				newAr.push(ar[i]); 

			} 

		} 

	}