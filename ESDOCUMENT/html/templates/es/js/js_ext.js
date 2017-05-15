/**
 * 用于扩展js的方法
 * add 20140923
 */

/**
 * 重新扩展trim方法，统一处理IE8下的js没有该方法的问题
 */
String.prototype.trim = function() {
	var re = /^\s+|\s+$/g;
	return this.replace(re, "");
}
String.prototype.endWith=function(str){
	if(str==null||str==""||this.length==0||str.length>this.length)
	  return false;
	if(this.substring(this.length-str.length)==str)
	  return true;
	else
	  return false;
	return true;
}
