/**
 * @author liudaiming
 * @deprecated 动态加载、替换css/js
 */
var file = {

	/**
	 * 创建节点元素
	 * 
	 * @param src
	 * @param filetype
	 * @returns
	 */
	"createfile" : function(src, filetype) {
		if (filetype == "js") {
			var file = document.createElement("script");
			file.setAttribute("type", "text/javascript");
			file.setAttribute("src", src);
			
			
		} else if (filetype == "css") {
			var file = document.createElement("link");
			file.setAttribute("rel", "stylesheet");
			file.setAttribute("type", "text/css");
			file.setAttribute("href", src);
		}
		
		return file;
	},
	/**
	 * 加载文件
	 * 
	 * @param src
	 * @param filetype
	 */
	"loadfile" : function(src, filetype) {
		var file = this.createfile(src, filetype);
		if(typeof file != undefined){
			document.getElementsByTagName("head")[0].appendChild(file);
		}
		/*
		if (typeof file == "css"){
			document.getElementsByTagName("head")[0].appendChild(file);
		}
		if(typeof file=="js"){
			document.getElementsByTagName("body")[0].appendChild(file);
		}
	*/
			
	},
	/**
	 * 替换文件
	 * 
	 * @param oldsrc
	 * @param newsrc
	 * @param filetype
	 */
	"replacefile" : function(oldsrc, newsrc, filetype) {
		var targetelement, targetattr;
		switch (filetype) {
		case 'js':
			targetelement = 'script';
			targetattr = 'src';
			break;
		case 'css':
			targetelement = 'link';
			targetattr = 'href';
			break;
		default:
			break;
		}
		var allfile = document.getElementsByTagName(targetelement);
		for ( var i = allfile.length; i >= 0; i--) {
			if (allfile[i]
					&& allfile[i].getAttribute(targetattr) != null
					&& allfile[i].getAttribute(targetattr).indexOf(oldsrc) != -1) {
				var newelement = this.createfile(newsrc, filetype);
				allfile[i].parentNode.replaceChild(newelement, allfile[i]);
			}
		}
	},
	/**
	 * 删除文件
	 * 
	 * @param src
	 * @param filetype
	 */
	"removefile" : function(src, filetype) {
		var targetelement, targetattr;
		switch (filetype) {
		case 'js':
			targetelement = 'script';
			targetattr = 'src';
			break;
		case 'css':
			targetelement = 'link';
			targetattr = 'href';
			break;
		default:
			break;
		}
		var allfile = document.getElementsByTagName(targetelement);
		for ( var i = allfile.length; i >= 0; i--) {
			if (allfile[i] && allfile[i].getAttribute(targetattr) != null
					&& allfile[i].getAttribute(targetattr).indexOf(src) != -1) {
				allfile[i].parentNode.removeChild(allfile[i]);
			}
		}
	}
};