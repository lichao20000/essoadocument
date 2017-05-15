/*!
 * appClient 1.0.0
 * Date: 2012-09-07 13:00
 */
;
(function($) {
	$.settingClient = {
		baseUrl : getAppPath(),
		flexpaperConfig : {
			Scale : 0.6, 
			ZoomTransition : 'easeOut',
			ZoomTime : 0.5, 
			ZoomInterval : 0.2,
			FitPageOnLoad : false,
			FitWidthOnLoad : false, 
			FullScreenAsMaxWindow : false,
			ProgressiveLoading : true,
			MinZoomSize : 0.2,
			MaxZoomSize : 5,
			SearchMatchAll : false,
			InitViewMode : 'Portrait',
			RenderingOrder : 'flash,html',
			 
			ViewModeToolsVisible : true,
			ZoomToolsVisible : true,
			NavToolsVisible : true,
			CursorToolsVisible : true,
			SearchToolsVisible : true,
			localeChain: 'zh_CN'
		},
		generateUrl : function(path, url) {
			this.baseUrl;
			if (typeof url === 'string' && url.length > 0) {
				url = this.baseUrl.substring(0,
						this.baseUrl.lastIndexOf("/") + 1)
						+ url;
			} else {
				url = this.baseUrl;
			}
			var i = 1;
			var urlArray = [];
			urlArray.push(url);
			if ($.isPlainObject(path)) {
				$.each(path, function(k, v) {
					switch (i) {
					case 1:
						urlArray.push("/", k, "/", v);
						break;
					case 2:
						urlArray.push("?", k, "=", v);
						break;
					default:
						urlArray.push("&", k, "=", v);
						break;
					}
					i++;
				});
			}
			return urlArray.join("");
		}
	};

	function getAppPath() {
		var scripts = document.getElementsByTagName('script');
		var me = null;
		var u = null;
		for (i in scripts) {
			// 如果通过第三方脚本加载器加载本文件，请保证文件名含有"appclient"字符
			if (scripts[i].src && scripts[i].src.indexOf('appclient') !== -1)
				me = scripts[i];
		}
		// 如果加载的脚本里没有，在获取自己（同步加载可用）
		me = me || script[script.length - 1];
		u = me.src.replace(/\\/g, '/').split('baseurl=')[1].substring();
		u = "/setting" + u.substring(u.indexOf("/", 2));
		return u;
	}
	;
})(jQuery);