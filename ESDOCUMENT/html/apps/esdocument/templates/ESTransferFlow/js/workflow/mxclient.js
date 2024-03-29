// 20101103 modify ;
// support all Browser;
var mxClient = {
// VERSION : '1.0.1.0',
		/** lujixiang 20150422 针对文控系统默认以IE9文档模式渲染,对IE个性化操作导致不兼容**/
//	IS_IE : navigator.userAgent.indexOf('MSIE') >= 0,
	IS_IE : false,
	IS_IE9 : navigator.userAgent.indexOf('MSIE 9') >= 0,
	IS_IE8 : navigator.userAgent.indexOf('MSIE 8') >= 0,
	IS_IE7 : navigator.userAgent.indexOf('MSIE 7') >= 0,
	IS_NS : navigator.userAgent.indexOf('Mozilla/5') >= 0,
	IS_FF2 : navigator.userAgent.indexOf('Firefox/2') >= 0
			|| navigator.userAgent.indexOf('Iceweasel/2') >= 0,
	IS_FF3 : navigator.userAgent.indexOf('Firefox/3') >= 0
			|| navigator.userAgent.indexOf('Iceweasel/3') >= 0,
	IS_OP : navigator.userAgent.indexOf('Opera/9') >= 0,
	IS_SF : navigator.userAgent.indexOf('AppleWebKit/5') >= 0
			&& navigator.userAgent.indexOf('Chrome') < 0,
	IS_GC : navigator.userAgent.indexOf('Chrome') >= 0,
	IS_SVG : navigator.userAgent.indexOf('Firefox/1.5') >= 0
			|| navigator.userAgent.indexOf('Firefox/2') >= 0
			|| navigator.userAgent.indexOf('Firefox/3') >= 0
			|| navigator.userAgent.indexOf('Iceweasel/1.5') >= 0
			|| navigator.userAgent.indexOf('Iceweasel/2') >= 0
			|| navigator.userAgent.indexOf('Iceweasel/3') >= 0
			|| navigator.userAgent.indexOf('Camino/1') >= 0
			|| navigator.userAgent.indexOf('Epiphany/2') >= 0
			|| navigator.userAgent.indexOf('Iceape/1') >= 0
			|| navigator.userAgent.indexOf('Galeon/2') >= 0
			|| navigator.userAgent.indexOf('Opera/9') >= 0
			|| navigator.userAgent.indexOf('Gecko/') >= 0
			|| navigator.userAgent.indexOf('AppleWebKit/5') >= 0
			|| navigator.userAgent.indexOf('MSIE')>=0,

	IS_VML : navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER',
	IS_CANVAS : navigator.appName == 'Netscape',
	IS_MAC : navigator.userAgent.toUpperCase().indexOf('MACINTOSH') > 0,
	IS_LOCAL : document.location.href.indexOf('http://') < 0
			&& document.location.href.indexOf('https://') < 0,
	FADE_RUBBERBAND : false,
	WINDOW_SHADOWS : true,
	TOOLTIP_SHADOWS : true,
	MENU_SHADOWS : true,
	isBrowserSupported : function() {
		return true || false;
	},
	link : function(rel, href, doc) {
		doc = doc || document;
// if (true && !false) {
// doc.write('<link rel="' + rel + '" href="' + href
// + '" charset="gb2312" type="text/css"/>');
// } else {
			var link = doc.createElement('link');
			link.setAttribute('rel', rel);
			link.setAttribute('href', href);
			link.setAttribute('charset', 'gb2312');
			link.setAttribute('type', 'text/css');
			var head = doc.getElementsByTagName('head')[0];
			head.appendChild(link);
// }
	},
	addOnloadCallback : function(callback) {
		if (mxClient.loading == null || mxClient.loading == 0) {
			callback();
		} else {
			if (mxClient.onloadCallbacks == null) {
				mxClient.onloadCallbacks = new Array();
			}
			mxClient.onloadCallbacks.push(callback);
		}
	},
	onload : function() {
		if (mxClient.onloadCallbacks != null) {
			var cb = mxClient.onloadCallbacks;
			mxClient.onloadCallbacks = null;
			for (var i = 0; i < cb.length; i++) {
				cb[i]();
			}
		}
		if(mxClient.IS_IE) {
			window.attachEvent("onunload", function() {
						mxClient.unload();
					});
		}
	},
	include : function(src) {
		if (false || false) {
			var req = new XMLHttpRequest();
			try {
				req.open('GET', src, false);
				req.send();
				window._mxDynamicCode = req.responseText;
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.innerHTML = 'eval(window._mxDynamicCode)';
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(script);
				delete window._mxDynamicCode;
			} catch (e) {
			}
		} else if(mxClient.IS_IE) {
			document.write('<script src="' + src + '"></script>');
		} else {
			var script = document.createElement('script');
			script.setAttribute('type', 'text/javascript');
			script.setAttribute('src', src);
			var onload = function(script) {
				if (script != null) {
					script.onload = null;
					script.onerror = null;
					script.onreadystatechange = null;
				}
				mxClient.loading--;
				if (mxClient.loading == 0) {
					mxClient.onload();
				}
			};
			script.onload = onload;
			script.onerror = onload;
			var head = document.getElementsByTagName('head')[0];
			head.appendChild(script);
			if (mxClient.loading == null) {
				mxClient.loading = 1;
			} else {
				mxClient.loading++;
			}
		}
	},
	unload : function() {
		mxEvent.release(document.documentElement);
		mxEvent.release(window);
	}
};
mxClient.basePath = (typeof(mxBasePath) != 'undefined') ? mxBasePath : '';
mxClient.imageBasePath = (typeof(mxImageBasePath) != 'undefined')
		? mxImageBasePath
		: mxClient.basePath + 'images/';
if (typeof(mxLanguage) != 'undefined') {
	mxClient.language = mxLanguage;
} else {// jiang add 20100415
	if(navigator.userAgent.indexOf('Firefox/3') >= 0 || navigator.userAgent.indexOf('Mozilla/5') >= 0){
		mxClient.language = navigator.language;
	}
	else{
		mxClient.language = (true) ? navigator.userLanguage : navigator.language;
		var dash = mxClient.language.indexOf('-');
		if (dash > 0) {
			mxClient.language = mxClient.language.substring(0, dash);
		}
	}
}
// mxClient.link('stylesheet', 'scripts/workflow/css/common.css');
if(mxClient.IS_IE) {
	if(mxClient.IS_IE8){
//		 document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
//		 document.namespaces.add("o", "urn:schemas-microsoft-com:office:office");
//		 var tplPath = $("#createWorkflowDiv").attr("tplPath") ;
//		  var tplPath = "/apps/esdocument/templates";
//		 mxClient.link('stylesheet',tplPath+'/public/ext/resources/css/ext-all.css');
//		 mxClient.link('stylesheet',tplPath+'/ESTransferFlow/css/workflow/grapheditor.css');
//		 mxClient.link('stylesheet', tplPath+'/ESTransferFlow/css/workflow/css/common.css');
//		 mxClient.link('stylesheet',tplPath+'/ESTransferFlow/css/workflow/info_css.css');		 
	}
}

var mxLog = {
	consoleResource : (mxClient.language != 'none') ? 'console' : '',
	TRACE : false,
	DEBUG : true,
	WARN : true,
	buffer : '',
	init : function() {
		if (mxLog.window == null && document.body != null) {
			var title = (mxResources.get(mxLog.consoleResource) || mxLog.consoleResource)
					+ ' - mxGraph ' + mxClient.VERSION;
			var table = document.createElement('table');
			table.setAttribute('width', '100%');
			table.setAttribute('height', '100%');
			var tbody = document.createElement('tbody');
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.style.verticalAlign = 'top';
			mxLog.textarea = document.createElement('textarea');
			mxLog.textarea.setAttribute('readOnly', 'true');
			mxLog.textarea.style.width = "100%";
			mxLog.textarea.style.height = "100%";
			mxLog.textarea.value = mxLog.buffer;
			td.appendChild(mxLog.textarea);
			tr.appendChild(td);
			tbody.appendChild(tr);
			tr = document.createElement('tr');
			mxLog.td = document.createElement('td');
			mxLog.td.style.verticalAlign = 'top';
			mxLog.td.setAttribute('height', '30px');
			tr.appendChild(mxLog.td);
			tbody.appendChild(tr);
			table.appendChild(tbody);
			mxLog.addButton('Info', function(evt) {
						mxLog.writeln(mxUtils.toString(navigator));
					});
			mxLog.addButton('DOM', function(evt) {
						var content = mxUtils.getInnerHtml(document.body);
						mxLog.debug(content);
					});
			mxLog.addButton('Trace', function(evt) {
						mxLog.TRACE = !mxLog.TRACE;
						if (mxLog.TRACE) {
							mxLog.debug('Tracing enabled');
						} else {
							mxLog.debug('Tracing disabled');
						}
					});
			mxLog.addButton('Copy', function(evt) {
						try {
							mxUtils.copy(mxLog.textarea.value);
						} catch (err) {
							mxUtils.alert(err);
						}
					});
			mxLog.addButton('Show', function(evt) {
						try {
							mxUtils.popup(mxLog.textarea.value);
						} catch (err) {
							mxUtils.alert(err);
						}
					});
			mxLog.addButton('Clear', function(evt) {
						mxLog.textarea.value = '';
					});
			var w = document.body.clientWidth;
			var h = (document.body.clientHeight || document.documentElement.clientHeight);
			mxLog.window = new mxWindow(title, table, w - 320, h - 210, 300,
					160);
			mxLog.window.setMaximizable(true);
			mxLog.window.setScrollable(true);
			mxLog.window.setResizable(true);
			mxLog.window.setClosable(true);
			mxLog.window.destroyOnClose = false;
			if (false && document.compatMode != 'BackCompat') {
				var resizeHandler = function(sender, evt) {
					var elt = mxLog.window.getElement();
					mxLog.textarea.style.height = (elt.offsetHeight - 78)
							+ 'px';
				};
				mxLog.window.addListener(mxEvent.RESIZE_END, resizeHandler);
				mxLog.window.addListener(mxEvent.MAXIMIZE, resizeHandler);
				mxLog.window.addListener(mxEvent.NORMALIZE, resizeHandler);
				var elt = mxLog.window.getElement();
				mxLog.textarea.style.height = '96px';
			}
		}
	},
	addButton : function(lab, funct) {
		var button = document.createElement('button');
		mxUtils.write(button, lab);
		mxEvent.addListener(button, 'click', funct);
		mxLog.td.appendChild(button);
	},
	isVisible : function() {
		if (mxLog.window != null) {
			return mxLog.window.isVisible();
		}
		return false;
	},
	show : function() {
		mxLog.setVisible(true);
	},
	setVisible : function(visible) {
		if (mxLog.window == null) {
			mxLog.init();
		}
		if (mxLog.window != null) {
			mxLog.window.setVisible(visible);
		}
	},
	enter : function(string) {
		if (mxLog.TRACE) {
			mxLog.writeln('Entering ' + string);
			return new Date().getTime();
		}
	},
	leave : function(string, t0) {
		if (mxLog.TRACE) {
			var dt = (t0 != 0)
					? ' (' + (new Date().getTime() - t0) + ' ms)'
					: '';
			mxLog.writeln('Leaving ' + string + dt);
		}
	},
	debug : function(string) {
		if (mxLog.DEBUG) {
			mxLog.writeln(string);
		}
	},
	warn : function(string) {
		if (mxLog.WARN) {
			mxLog.writeln(string);
		}
	},
	write : function(string) {
		if (mxLog.textarea != null) {
			mxLog.textarea.value = mxLog.textarea.value + string;
			mxLog.textarea.scrollTop = mxLog.textarea.scrollHeight;
		} else {
			mxLog.buffer += string;
		}
	},
	writeln : function(string) {
		mxLog.write(string + '\n');
	}
};

var mxObjectIdentity = {
	FIELD_NAME : 'mxObjectId',
	counter : 0,
	get : function(obj) {
		if (typeof(obj) == 'object' && obj[mxObjectIdentity.FIELD_NAME] == null) {
			var ctor = mxUtils.getFunctionName(obj.constructor);
			obj[mxObjectIdentity.FIELD_NAME] = ctor + '#'
					+ mxObjectIdentity.counter++;
		}
		return obj[mxObjectIdentity.FIELD_NAME];
	},
	clear : function(obj) {
		if (typeof(obj) == 'object') {
			delete obj[mxObjectIdentity.FIELD_NAME];
		}
	}
};

{
	function mxDictionary() {
		this.clear();
	};
	mxDictionary.prototype.map = null;
	mxDictionary.prototype.clear = function() {
		this.map = new Array();
	};
	mxDictionary.prototype.get = function(key) {
		var id = mxObjectIdentity.get(key);
		return this.map[id];
	};
	mxDictionary.prototype.put = function(key, value) {
		var id = mxObjectIdentity.get(key);
		var previous = this.map[id];
		this.map[id] = value;
		return previous;
	};
	mxDictionary.prototype.remove = function(key) {
		var id = mxObjectIdentity.get(key);
		var previous = this.map[id];
		delete this.map[id];
		return previous;
	};
	mxDictionary.prototype.getValues = function() {
		var result = new Array();
		for (key in this.map) {
			result.push(key);
		}
		return result;
	};
	mxDictionary.prototype.getValues = function() {
		var result = new Array();
		for (key in this.map) {
			result.push(this.map[key]);
		}
		return result;
	};
}

var mxResources = {
	resources : new Array(),
	add : function(basename, lan) {
		lan = (lan != null) ? lan : mxClient.language;
		if (lan != 'none') {
// try {
// // var req = mxUtils.load(basename + '.properties');
// // jiang 20091020 add
// var req = mxUtils.load('mxApplication.properties');
// if (req.isReady()) {
// mxResources.parse(req.getText());
// }
// } catch (e) {
// }
// try {
// // var req = mxUtils.load(basename + '_' + lan + '.properties');
// // jiang 20091020 add
// var req = mxUtils.load('mxApplication_zh.properties');
//				
// if (req.isReady()) {
// mxResources.parse(req.getText());
// }
// } catch (e) {
// }
		}
	},
	parse : function(text) {
		var lines = text.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var index = lines[i].indexOf('=');
			if (index > 0) {
				var key = lines[i].substring(0, index);
				var idx = lines[i].length;
				if (lines[i].charCodeAt(idx - 1) == 13) {
					idx--;
				}
				var value = lines[i].substring(index + 1, idx);
				mxResources.resources[key] = unescape(value);
			}
		}
	},
	get : function(key, params, defaultValue) {
		var value = mxResources.resources[key];
		if (value == null) {
			value = defaultValue;
		}
		if (value != null && params != null) {
			var result = new Array();
			var index = null;
			for (var i = 0; i < value.length; i++) {
				var c = value.charAt(i);
				if (c == '{') {
					index = '';
				} else if (index != null && c == '}') {
					index = parseInt(index) - 1;
					if (index >= 0 && index < params.length) {
						result.push(params[index]);
					}
					index = null;
				} else if (index != null) {
					index += c;
				} else {
					result.push(c);
				}
			}
			value = result.join('');
		}
		return value;
	}
};

{
	function mxPoint(x, y) {
		this.x = (x != null) ? x : 0;
		this.y = (y != null) ? y : 0;
	};
	mxPoint.prototype.x = null;
	mxPoint.prototype.y = null;
	mxPoint.prototype.equals = function(obj) {
		return obj.x == this.x && obj.y == this.y;
	};
	mxPoint.prototype.clone = function() {
		return mxUtils.clone(this);
	};
}

{
	function mxRectangle(x, y, width, height) {
		mxPoint.call(this, x, y);
		this.width = (width != null) ? width : 0;
		this.height = (height != null) ? height : 0;
	};
	mxRectangle.prototype = new mxPoint();
	mxRectangle.prototype.constructor = mxRectangle;
	mxRectangle.prototype.width = null;
	mxRectangle.prototype.height = null;
	mxRectangle.prototype.getCenterX = function() {
		return this.x + this.width / 2;
	};
	mxRectangle.prototype.getCenterY = function() {
		return this.y + this.height / 2;
	};
	mxRectangle.prototype.add = function(rect) {
		if (rect != null) {
			var minX = Math.min(this.x, rect.x);
			var minY = Math.min(this.y, rect.y);
			var maxX = Math.max(this.x + this.width, rect.x + rect.width);
			var maxY = Math.max(this.y + this.height, rect.y + rect.height);
			this.x = minX;
			this.y = minY;
			this.width = maxX - minX;
			this.height = maxY - minY;
		}
	};
	mxRectangle.prototype.grow = function(amount) {
		this.x -= amount;
		this.y -= amount;
		this.width += 2 * amount;
		this.height += 2 * amount;
	};
	mxRectangle.prototype.getPoint = function() {
		return new mxPoint(this.x, this.y);
	};
	mxRectangle.prototype.equals = function(obj) {
		return obj.x == this.x && obj.y == this.y && obj.width == this.width
				&& obj.height == this.height;
	};
}

var mxUtils = {
	errorResource : (mxClient.language != 'none') ? 'error' : '',
	closeResource : (mxClient.language != 'none') ? 'close' : '',
	errorImage : mxClient.imageBasePath + 'error.gif',
	removeCursors : function(element) {
		if (element.style != null) {
			element.style.cursor = '';
		}
		var children = element.childNodes;
		if (children != null) {
			var childCount = children.length;
			for (var i = 0; i < childCount; i += 1) {
				mxUtils.removeCursors(children[i]);
			}
		}
	},
	repaintGraph : function(graph, pt) {
		var c = graph.container;
		if (c != null && pt != null && (false || false || false)
				&& (c.scrollLeft > 0 || c.scrollTop > 0)) {
			var dummy = document.createElement('div');
			dummy.style.position = 'absolute';
			dummy.style.left = pt.x + 'px';
			dummy.style.top = pt.y + 'px';
			dummy.style.width = '1px';
			dummy.style.height = '1px';
			c.appendChild(dummy);
			c.removeChild(dummy);
		}
	},
	getCurrentStyle : function() {
		if(mxClient.IS_IE) {
			return function(element) {
				return (element != null) ? element.currentStyle : null;
			}
		} else {
			return function(element) {
				return (element != null)
						? window.getComputedStyle(element, '')
						: null;
			}
		}
	}(),
	hasScrollbars : function(node) {
		var style = mxUtils.getCurrentStyle(node);
		return style != null
				&& (style.overflow == 'scroll' || style.overflow == 'auto');
	},
	eval : function(expr) {
		var result = null;
		if (expr.indexOf('function') >= 0 && (true || false || false || false)) {
			try {
				eval('var _mxJavaScriptExpression=' + expr);
				result = _mxJavaScriptExpression;
				delete _mxJavaScriptExpression;
			} catch (e) {
				mxLog.warn(e.message + ' while evaluating ' + expr);
			}
		} else {
			result = eval(expr);
		}
		return result;
	},
	selectSingleNode : function() {
		if(mxClient.IS_IE) {
			return function(doc, expr) {
				return doc.selectSingleNode(expr);
			}
		} else {
			return function(doc, expr) {
				var result = doc.evaluate(expr, doc, null,
						XPathResult.ANY_TYPE, null);
				return result.iterateNext();
			}
		}
	}(),
	getFunctionName : function(f) {
		var str = null;
		if (f != null) {
			if (!false && false) {
				str = f.name;
			} else {
				var tmp = f.toString();
				var idx1 = 9;
				while (tmp.charAt(idx1) == ' ') {
					idx1++;
				}
				var idx2 = tmp.indexOf('(', idx1);
				str = tmp.substring(idx1, idx2);
			}
		}
		return str;
	},
	indexOf : function(array, obj) {
		if (array != null && obj != null) {
			for (var i = 0; i < array.length; i++) {
				if (array[i] == obj) {
					return i;
				}
			}
		}
		return -1;
	},
	remove : function(obj, array) {
		var result = null;
		if (typeof(array) == 'object') {
			var index = mxUtils.indexOf(array, obj);
			while (index >= 0) {
				array.splice(index, 1);
				result = obj;
				index = mxUtils.indexOf(array, obj);
			}
		}
		for (var key in array) {
			if (array[key] == obj) {
				delete array[key];
				result = obj;
			}
		}
		return result;
	},
	isNode : function(value, nodeName, attributeName, attributeValue) {
		if (value != null
				&& !isNaN(value.nodeType)
				&& (nodeName == null || value.nodeName.toLowerCase() == nodeName
						.toLowerCase())) {
			return attributeName == null
					|| value.getAttribute(attributeName) == attributeValue;
		}
		return false;
	},
	getChildNodes : function(node, nodeType) {
		nodeType = nodeType || mxConstants.NODETYPE_ELEMENT;
		var children = new Array();
		var tmp = node.firstChild;
		while (tmp != null) {
			if (tmp.nodeType == nodeType) {
				children.push(tmp);
			}
			tmp = tmp.nextSibling;
		}
		return children;
	},
	createXmlDocument : function() {
		var doc = null;
		if (document.implementation && document.implementation.createDocument) {
			doc = document.implementation.createDocument('', '', null);
		} else if (window.ActiveXObject) {
			doc = new ActiveXObject('Microsoft.XMLDOM');
		}
		return doc;
	},
	parseXml : function(xml) {
// return function(xml) {
// var parser = new DOMParser();
// return parser.parseFromString(xml, 'text/xml');
// }
		if(mxClient.IS_IE) {
			return function(xml) {
				var result = mxUtils.createXmlDocument();
				result.async = 'false';
				result.loadXML(xml);
				return result;
			}
// } else if(mxClient.IS_IE9) {
// return function(xml) {
// // var result = mxUtils.createXmlDocument();
// // result.async = 'false';
// // result.loadXML(xml);
// // return result;
// // try{
// // var xmlDoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
// // xmlDoc.async = false;
// // xmlDoc.loadXML(xml);
// // return xmlDoc;
// // }catch(){
// //
// // }
// var doc = new ActiveXObject("Microsoft.XMLDOM");
// try {
// doc.async = false;
// doc.loadXML(xml);
// while(doc.readyState != 4) {};
// } catch(e) {
// document.write(e.message);
// }
// return doc;
// }
		} else {
			return function(xml) {
				var parser = new DOMParser();
				return parser.parseFromString(xml, 'text/xml');
			}
		}
	}(),
	createXmlElement : function(nodeName) {
		return mxUtils.parseXml('<' + nodeName + '/>').documentElement;
	},
	getPrettyXml : function(node, tab, indent) {
		var result = new Array();
		if (node != null) {
			tab = tab || '  ';
			indent = indent || '';
			if (node.nodeType == mxConstants.NODETYPE_TEXT) {
				result.push(node.nodeValue);
			} else {
				result.push(indent + '<' + node.nodeName);

				var attrs = node.attributes;
				if (attrs != null) {
					for (var i = 0; i < attrs.length; i++) {
						var val = mxUtils.htmlEntities(attrs[i].nodeValue);
						result.push(' ' + attrs[i].nodeName + '="' + val + '"');
					}
				}

				var tmp = node.firstChild;
				if (tmp != null) {
					result.push('>\n');
					while (tmp != null) {
						result.push(mxUtils
								.getPrettyXml(tmp, tab, indent + tab));
						tmp = tmp.nextSibling;
					}
					result.push(indent + '</' + node.nodeName + '>\n');
				} else {
					result.push('/>\n');
				}
			}
		}
		return result.join('');
	},
	removeWhitespace : function(node, before) {
		var tmp = (before) ? node.previousSibling : node.nextSibling;
		while (tmp != null && tmp.nodeType == mxConstants.NODETYPE_TEXT) {
			var next = (before) ? tmp.previousSibling : tmp.nextSibling;
			var text = mxUtils.getTextContent(tmp).replace(/\t/g, '').replace(
					/\r\n/g, '').replace(/\n/g, '').replace(/^\s+/g, '')
					.replace(/\s+$/g, '');
			if (text.length == 0) {
				tmp.parentNode.removeChild(tmp);
			}
			tmp = next;
		}
	},
	htmlEntities : function(s, newline) {
		s = s || '';
		s = s.replace(/&/g, '&amp;');
		s = s.replace(/"/g, '&quot;');
		s = s.replace(/\'/g, '&#39;');
		s = s.replace(/</g, '&lt;');
		s = s.replace(/>/g, '&gt;');
		if (newline == null || newline) {
			s = s.replace(/\n/g, '&#xa;');
		}
		return s;
	},
	isVml : function(node) {
		return node != null && node.tagUrn == 'urn:schemas-microsoft-com:vml';
	},
	getXml : function(node, linefeed) {
		var xml = '';
		if (node != null) {
			xml = node.xml;
			if (xml == null) {
				if(mxClient.IS_IE) {
					xml = node.innerHTML;
				} else {
					var xmlSerializer = new XMLSerializer();
					xml = xmlSerializer.serializeToString(node);
				}
			} else {
				xml = xml.replace(/\r\n\t[\t]*/g, '').replace(/>\r\n/g, '>')
						.replace(/\r\n/g, '\n');
			}
		}
		linefeed = linefeed || '&#xa;';
		xml = xml.replace(/\n/g, linefeed);
		return xml;
	},
	getTextContent : function(node) {
		var result = '';
		if (node != null) {
			if (node.firstChild != null) {
				node = node.firstChild;
			}
			result = node.nodeValue || '';
		}
		return result;
	},
	getInnerHtml : function() {// jiangjien
		if(mxClient.IS_IE) {
			return function(node) {
				if (node != null) {
					return node.innerHTML;
				}
// else if(initNode){
// return initNode.innerHTML;
// }
				return '';
			}
		} else {
			return function(node) {
				if (node != null) {
					var serializer = new XMLSerializer();
					return serializer.serializeToString(node);
				}
				return '';
			}
		}
	}(),
	getOuterHtml : function() {
		if(mxClient.IS_IE) {
			return function(node) {
				if (node != null) {
					var tmp = new Array();
					tmp.push('<' + node.nodeName);
					var attrs = node.attributes;
					for (var i = 0; i < attrs.length; i++) {
						var value = attrs[i].nodeValue;
						if (value != null && value.length > 0) {
							tmp.push(' ');
							tmp.push(attrs[i].nodeName);
							tmp.push('="');
							tmp.push(value);
							tmp.push('"');
						}
					}
					if (node.innerHTML.length == 0) {
						tmp.push('/>');
					} else {
						tmp.push('>');
						tmp.push(node.innerHTML);
						tmp.push('</' + node.nodeName + '>');
					}
					return tmp.join('');
				}
				return '';
			}
		} else {
			return function(node) {
				if (node != null) {
					var serializer = new XMLSerializer();
					return serializer.serializeToString(node);
				}
				return '';
			}
		}
	}(),
	write : function(parent, text, doc) {
		doc = (doc != null) ? doc : document;
		var node = doc.createTextNode(text);
		if (parent != null) {
			parent.appendChild(node);
		}
		return node;
	},
	writeln : function(parent, text, doc) {
		doc = (doc != null) ? doc : document;
		var node = doc.createTextNode(text);
		if (parent != null) {
			parent.appendChild(node);
			parent.appendChild(document.createElement('br'));
		}
		return node;
	},
	br : function(parent, count) {
		count = count || 1;
		var br;
		for (var i = 0; i < count; i++) {
			br = document.createElement('br');
			if (parent != null) {
				parent.appendChild(br);
			}
		}
		return br;
	},
	button : function(label, funct) {
		var button = document.createElement('button');
		mxUtils.write(button, label);
		mxEvent.addListener(button, 'click', function(evt) {
					funct(evt);
				});
		return button;
	},
	para : function(parent, text) {
		var p = document.createElement('p');
		mxUtils.write(p, text);
		if (parent != null) {
			parent.appendChild(p);
		}
		return p;
	},
	linkAction : function(parent, text, editor, action, pad) {
		return mxUtils.link(parent, text, function() {
					editor.execute(action)
				}, pad);
	},
	linkInvoke : function(parent, text, editor, functName, arg, pad) {
		return mxUtils.link(parent, text, function() {
					editor[functName](arg)
				}, pad);
	},
	link : function(parent, text, funct, pad) {
		var a = document.createElement('span');
		a.style.color = 'blue';
		a.style.textDecoration = 'underline';
		a.style.cursor = 'pointer';
		if (pad != null) {
			a.style.paddingLeft = pad + 'px';
		}
		mxEvent.addListener(a, 'click', funct);
		mxUtils.write(a, text);
		if (parent != null) {
			parent.appendChild(a);
		}
		return a;
	},
	fit : function(node) {
		var left = parseInt(node.offsetLeft);
		var width = parseInt(node.offsetWidth);
		var b = document.body;
		var d = document.documentElement;
		var right = (b.scrollLeft || d.scrollLeft)
				+ (b.clientWidth || d.clientWidth);
		if (left + width > right) {
			node.style.left = Math.max((b.scrollLeft || d.scrollLeft), right
							- width)
					+ 'px';
		}
		var top = parseInt(node.offsetTop);
		var height = parseInt(node.offsetHeight);
		var bottom = (b.scrollTop || d.scrollTop)
				+ Math.max(b.clientHeight || 0, d.clientHeight);
		if (top + height > bottom) {
			node.style.top = Math.max((b.scrollTop || d.scrollTop), bottom
							- height)
					+ 'px';
		}
	},
	open : function(filename) {
		if(!mxClient.IS_IE) {
			try {
				netscape.security.PrivilegeManager
						.enablePrivilege('UniversalXPConnect');
			} catch (e) {
				mxUtils.alert('Permission to read file denied.');
				return '';
			}
			var file = Components.classes['@mozilla.org/file/local;1']
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filename);
			if (!file.exists()) {
				mxUtils.alert('File not found.');
				return '';
			}
			var is = Components.classes['@mozilla.org/network/file-input-stream;1']
					.createInstance(Components.interfaces.nsIFileInputStream);
			is.init(file, 0x01, 00004, null);
			var sis = Components.classes['@mozilla.org/scriptableinputstream;1']
					.createInstance(Components.interfaces.nsIScriptableInputStream);
			sis.init(is);
			var output = sis.read(sis.available());
			return output;
		} else {
			var activeXObject = new ActiveXObject('Scripting.FileSystemObject');
			var newStream = activeXObject.OpenTextFile(filename, 1);
			var text = newStream.readAll();
			newStream.close();
			return text;
		}
		return null;
	},
	save : function(filename, content) {
		if(!mxClient.IS_IE) {
			try {
				netscape.security.PrivilegeManager
						.enablePrivilege('UniversalXPConnect');
			} catch (e) {
				mxUtils.alert('Permission to write file denied.');
				return;
			}
			var file = Components.classes['@mozilla.org/file/local;1']
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filename);
			if (!file.exists()) {
				file.create(0x00, 0644);
			}
			var outputStream = Components.classes['@mozilla.org/network/file-output-stream;1']
					.createInstance(Components.interfaces.nsIFileOutputStream);
			outputStream.init(file, 0x20 | 0x02, 00004, null);
			outputStream.write(content, content.length);
			outputStream.flush();
			outputStream.close();
		} else {
			var fso = new ActiveXObject('Scripting.FileSystemObject');
			var file = fso.CreateTextFile(filename, true);
			file.Write(content);
			file.Close();
		}
	},
	saveAs : function(content) {
		var iframe = document.createElement('iframe');
		iframe.setAttribute('src', '');
		iframe.style.visibility = 'hidden';
		document.body.appendChild(iframe);
		try {
			if(!mxClient.IS_IE) {
				var doc = iframe.contentDocument;
				doc.open();
				doc.write(content);
				doc.close();
				try {
					netscape.security.PrivilegeManager
							.enablePrivilege('UniversalXPConnect');
					iframe.focus();
					saveDocument(doc);
				} catch (e) {
					mxUtils.alert('Permission to save document denied.');
				}
			} else {
				var doc = iframe.contentWindow.document;
				doc.write(content);
				doc.execCommand('SaveAs', false, document.location);
			}
		} finally {
			document.body.removeChild(iframe);
		}
	},
	copy : function(content) {
		if (window.clipboardData) {
			window.clipboardData.setData('Text', content);
		} else {
			netscape.security.PrivilegeManager
					.enablePrivilege('UniversalXPConnect');
			var clip = Components.classes['@mozilla.org/widget/clipboard;1']
					.createInstance(Components.interfaces.nsIClipboard);
			if (!clip) {
				return;
			}
			var trans = Components.classes['@mozilla.org/widget/transferable;1']
					.createInstance(Components.interfaces.nsITransferable);
			if (!trans) {
				return;
			}
			trans.addDataFlavor('text/unicode');
			var str = new Object();
			var len = new Object();
			var str = Components.classes['@mozilla.org/supports-string;1']
					.createInstance(Components.interfaces.nsISupportsString);
			var copytext = content;
			str.data = copytext;
			trans.setTransferData('text/unicode', str, copytext.length * 2);
			var clipid = Components.interfaces.nsIClipboard;
			clip.setData(trans, null, clipid.kGlobalClipboard);
		}
	},
	load : function(url) {
		var req = new mxXmlRequest(url, null, 'GET', false);
		req.send();
		return req;
	},
	get : function(url, onload, onerror) {
		return new mxXmlRequest(url, null, 'GET').send(onload, onerror);
	},
	post : function(url, params, onload, onerror) {
		return new mxXmlRequest(url, params).send(onload, onerror);
	},
	submit : function(url, params, doc) {
		return new mxXmlRequest(url, params).simulate(doc);
	},
	loadInto : function(url, doc, onload) {
		if(mxClient.IS_IE) {
			doc.onreadystatechange = function() {
				if (doc.readyState == 4) {
					onload()
				}
			};
		} else {
			doc.addEventListener('load', onload, false);
		}
		doc.load(url);
	},
	getValue : function(array, key, defaultValue) {
		var value = array[key];
		if (value == null) {
			value = defaultValue;
		}
		return value;
	},
	clone : function(obj, transients, shallow) {
		shallow = (shallow != null) ? shallow : false;
		var clone = null;
		if (obj != null && typeof(obj.constructor) == 'function') {
			clone = new obj.constructor();
			for (var i in obj) {
				if (i != mxObjectIdentity.FIELD_NAME
						&& (transients == null || mxUtils
								.indexOf(transients, i) < 0)) {
					if (!shallow && typeof(obj[i]) == 'object') {
						clone[i] = mxUtils.clone(obj[i]);
					} else {
						clone[i] = obj[i];
					}
				}
			}
		}
		return clone;
	},
	equalPoints : function(a, b) {
		if ((a == null && b != null) || (a != null && b == null)
				|| (a != null && b != null && a.length != b.length)) {
			return false;
		} else if (a != null && b != null) {
			for (var i = 0; i < a.length; i++) {
				if (a[i] == b[i] || (a[i] != null && !a[i].equals(b[i]))) {
					return false;
				}
			}
		}
		return true;
	},
	equalEntries : function(a, b) {
		if ((a == null && b != null) || (a != null && b == null)
				|| (a != null && b != null && a.length != b.length)) {
			return false;
		} else if (a != null && b != null) {
			for (var key in a) {
				if (a[key] != b[key]) {
					return false;
				}
			}
		}
		return true;
	},
	toString : function(obj) {
		var output = '';
		for (var i in obj) {
			try {
				if (obj[i] == null) {
					output += i + ' = [null]\n';
				} else if (typeof(obj[i]) == 'function') {
					output += i + ' => [Function]\n';
				} else if (typeof(obj[i]) == 'object') {
					var ctor = mxUtils.getFunctionName(obj[i].constructor);
					output += i + ' => [' + ctor + ']\n';
				} else {
					output += i + ' = ' + obj[i] + '\n';
				}
			} catch (e) {
				output += i + '=' + e.message;
			}
		}
		return output;
	},
	toRadians : function(deg) {
		return Math.PI * deg / 180;
	},
	getBoundingBox : function(rect, rotation) {
		var result = null;
		if (rect != null && rotation != null && rotation != 0) {
			var rad = mxUtils.toRadians(rotation);
			var cos = Math.cos(rad);
			var sin = Math.sin(rad);
			var cx = new mxPoint(rect.x + rect.width / 2, rect.y + rect.height
							/ 2);
			var p1 = new mxPoint(rect.x, rect.y);
			var p2 = new mxPoint(rect.x + rect.width, rect.y);
			var p3 = new mxPoint(p2.x, rect.y + rect.height);
			var p4 = new mxPoint(rect.x, p3.y);
			p1 = mxUtils.getRotatedPoint(p1, cos, sin, cx);
			p2 = mxUtils.getRotatedPoint(p2, cos, sin, cx);
			p3 = mxUtils.getRotatedPoint(p3, cos, sin, cx);
			p4 = mxUtils.getRotatedPoint(p4, cos, sin, cx);
			result = new mxRectangle(p1.x, p1.y, 0, 0);
			result.add(new mxRectangle(p2.x, p2.y, 0, 0));
			result.add(new mxRectangle(p3.x, p3.y, 0, 0));
			result.add(new mxRectangle(p4.x, p4.Y, 0, 0));
		}
		return result;
	},
	getRotatedPoint : function(pt, cos, sin, cx) {
		cx = (cx != null) ? cx : new mxPoint();
		var x = pt.x - c.x;
		var y = pt.y - c.y;
		var x1 = x * cos - y * sin;
		var y1 = y * cos + x * sin;
		return new mxPoint(x1 + c.x, y1 + c.y);
	},
	findNearestSegment : function(state, x, y) {
		var index = -1;
		if (state.absolutePoints.length > 0) {
			var last = state.absolutePoints[0];
			var min = null;
			for (var i = 1; i < state.absolutePoints.length; i++) {
				var current = state.absolutePoints[i];
				var dist = mxUtils.ptSegDistSq(last.x, last.y, current.x,
						current.y, x, y);
				if (min == null || dist < min) {
					min = dist;
					index = i - 1;
				}
				last = current;
			}
		}
		return index;
	},
	contains : function(bounds, x, y) {
		return (bounds.x <= x && bounds.x + bounds.width >= x && bounds.y <= y && bounds.y
				+ bounds.height >= y);
	},
	intersects : function(a, b) {
		return mxUtils.contains(a, b.x, b.y)
				|| mxUtils.contains(a, b.x + b.width, b.y + b.height)
				|| mxUtils.contains(a, b.x + b.width, b.y)
				|| mxUtils.contains(a, b.x, b.y + b.height);
	},
	intersectsHotspot : function(state, x, y, hotspot, min, max) {
		hotspot = (hotspot != null) ? hotspot : 1;
		min = (min != null) ? min : 0;
		max = (max != null) ? max : 0;
		if (hotspot > 0) {
			var cx = state.getCenterX();
			var cy = state.getCenterY();
			var w = state.width;
			var h = state.height;
			var start = mxUtils.getValue(state.style,
					mxConstants.STYLE_STARTSIZE);
			if (start > 0) {
				if (mxUtils.getValue(state.style, mxConstants.STYLE_HORIZONTAL,
						true)) {
					cy = state.y + start / 2;
					h = start;
				} else {
					cx = state.x + start / 2;
					w = start;
				}
			}
			var w = Math.max(min, w * hotspot);
			var h = Math.max(min, h * hotspot);
			if (max > 0) {
				w = Math.min(w, max);
				h = Math.min(h, max);
			}
			var rect = new mxRectangle(cx - w / 2, cy - h / 2, w, h);
			return mxUtils.contains(rect, x, y);
		}
		return true;
	},
	getOffset : function(container) {
		var offsetLeft = 0;
		var offsetTop = 0;
		while (container.offsetParent) {
			offsetLeft += container.offsetLeft;
			offsetTop += container.offsetTop;
			container = container.offsetParent;
		}
		return new mxPoint(offsetLeft, offsetTop);
	},
	getScrollOrigin : function(node) {
		var b = document.body;
		var d = document.documentElement;
		var sl = (b.scrollLeft || d.scrollLeft);
		var st = (b.scrollTop || d.scrollTop);
		var result = new mxPoint(sl, st);
		while (node != null && node != b && node != d) {
			result.x += node.scrollLeft;
			result.y += node.scrollTop;
			node = node.parentNode;
		}
		return result;
	},
	convertPoint : function(container, x, y) {
		var origin = mxUtils.getScrollOrigin(container);
		var offset = mxUtils.getOffset(container);
		offset.x -= origin.x;
		offset.y -= origin.y;
		return new mxPoint(x - offset.x, y - offset.y);
	},
	isNumeric : function(str) {
		return str != null
				&& (str.length == null || (str.length > 0 && str.indexOf('0x') < 0)
						&& str.indexOf('0X') < 0) && !isNaN(str);
	},
	intersection : function(x0, y0, x1, y1, x2, y2, x3, y3) {
		var denom = ((y3 - y2) * (x1 - x0)) - ((x3 - x2) * (y1 - y0));
		var nume_a = ((x3 - x2) * (y0 - y2)) - ((y3 - y2) * (x0 - x2));
		var nume_b = ((x1 - x0) * (y0 - y2)) - ((y1 - y0) * (x0 - x2));
		var ua = nume_a / denom;
		var ub = nume_b / denom;
		if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
			var intersectionX = x0 + ua * (x1 - x0);
			var intersectionY = y0 + ua * (y1 - y0);
			return new mxPoint(intersectionX, intersectionY);
		}
		return null;
	},
	ptSegDistSq : function(x1, y1, x2, y2, px, py) {
		x2 -= x1;
		y2 -= y1;
		px -= x1;
		py -= y1;
		var dotprod = px * x2 + py * y2;
		var projlenSq;
		if (dotprod <= 0.0) {
			projlenSq = 0.0;
		} else {
			px = x2 - px;
			py = y2 - py;
			dotprod = px * x2 + py * y2;
			if (dotprod <= 0.0) {
				projlenSq = 0.0;
			} else {
				projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
			}
		}
		var lenSq = px * px + py * py - projlenSq;
		if (lenSq < 0) {
			lenSq = 0;
		}
		return lenSq;
	},
	relativeCcw : function(x1, y1, x2, y2, px, py) {
		x2 -= x1;
		y2 -= y1;
		px -= x1;
		py -= y1;
		var ccw = px * y2 - py * x2;
		if (ccw == 0.0) {
			ccw = px * x2 + py * y2;
			if (ccw > 0.0) {
				px -= x2;
				py -= y2;
				ccw = px * x2 + py * y2;
				if (ccw < 0.0) {
					ccw = 0.0;
				}
			}
		}
		return (ccw < 0.0) ? -1 : ((ccw > 0.0) ? 1 : 0);
	},
	animateChanges : function(graph, changes) {
		var self = graph;
		var maxStep = 10;
		var step = 0;
		var animate = function() {
			var isRequired = false;
			for (var i = 0; i < changes.length; i++) {
				var change = changes[i];
				if (change.constructor == mxGeometryChange
						|| change.constructor == mxTerminalChange
						|| change.constructor == mxValueChange
						|| change.constructor == mxChildChange
						|| change.constructor == mxStyleChange) {
					var state = self.getView().getState(
							change.cell || change.child, false);
					if (state != null) {
						isRequired = true;
						if (change.constructor != mxGeometryChange
								|| self.model.isEdge(change.cell)) {
							mxUtils.setOpacity(state.shape.node, 100 * step
											/ maxStep);
						} else {
							var scale = graph.getView().scale;
							var dx = (change.geometry.x - change.previous.x)
									* scale;
							var dy = (change.geometry.y - change.previous.y)
									* scale;
							var sx = (change.geometry.width - change.previous.width)
									* scale;
							var sy = (change.geometry.height - change.previous.height)
									* scale;
							if (step == 0) {
								state.x -= dx;
								state.y -= dy;
								state.width -= sx;
								state.height -= sy;
							} else {
								state.x += dx / maxStep;
								state.y += dy / maxStep;
								state.width += sx / maxStep;
								state.height += sy / maxStep;
							}
							self.cellRenderer.redraw(state);
							mxUtils.cascadeOpacity(graph, change.cell, 100
											* step / maxStep);
						}
					}
				}
			}
			mxUtils.repaintGraph(graph, new mxPoint(1, 1));
			if (step < maxStep && isRequired) {
				step++;
				window.setTimeout(animate, delay);
			}
		}
		var delay = 30;
		animate();
	},
	cascadeOpacity : function(graph, cell, opacity) {
		var childCount = graph.model.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			var child = graph.model.getChildAt(cell, i);
			var childState = graph.getView().getState(child);
			if (childState != null) {
				mxUtils.setOpacity(childState.shape.node, opacity);
				mxUtils.cascadeOpacity(graph, child, opacity);
			}
		}
		var edges = graph.model.getEdges(cell);
		if (edges != null) {
			for (var i = 0; i < edges.length; i++) {
				var edgeState = graph.getView().getState(edges[i]);
				if (edgeState != null) {
					mxUtils.setOpacity(edgeState.shape.node, opacity);
				}
			}
		}
	},
	morph : function(graph, cells, dx, dy, step, delay) {
		step = step || 30;
		delay = delay || 30;
		var current = 0;
		var f = function() {
			var model = graph.getModel();
			current = Math.min(100, current + step);
			for (var i = 0; i < cells.length; i++) {
				if (!model.isEdge(!cells[i])) {
					var state = graph.getCellBounds(cells[i]);
					state.x += step * dx / 100;
					state.y += step * dy / 100;
					graph.cellRenderer.redraw(state);
				}
			}
			if (current < 100) {
				window.setTimeout(f, delay);
			} else {
				graph.moveCells(cells, dx, dy);
			}
		};
		window.setTimeout(f, delay);
	},
	fadeIn : function(node, to, step, delay, isEnabled) {
		to = (to != null) ? to : 100;
		step = step || 40;
		delay = delay || 30;
		var opacity = 0;
		mxUtils.setOpacity(node, opacity);
		node.style.visibility = 'visible';
		if (isEnabled || isEnabled == null) {
			var f = function() {
				opacity = Math.min(opacity + step, to);
				mxUtils.setOpacity(node, opacity);
				if (opacity < to) {
					window.setTimeout(f, delay);
				}
			};
			window.setTimeout(f, delay);
		} else {
			mxUtils.setOpacity(node, to);
		}
	},
	fadeOut : function(node, from, remove, step, delay, isEnabled) {
		step = step || 40;
		delay = delay || 30;
		var opacity = from || 100;
		mxUtils.setOpacity(node, opacity);
		if (isEnabled || isEnabled == null) {
			var f = function() {
				opacity = Math.max(opacity - step, 0);
				mxUtils.setOpacity(node, opacity);
				if (opacity > 0) {
					window.setTimeout(f, delay);
				} else {
					node.style.visibility = 'hidden';
					if (remove && node.parentNode) {
						node.parentNode.removeChild(node);
					}
				}
			};
			window.setTimeout(f, delay);
		} else {
			node.style.visibility = 'hidden';
			if (remove && node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}
	},
	setOpacity : function(node, value) {
		if (mxUtils.isVml(node)) {
			if (value >= 100) {
				node.style.filter = null;
			} else {
				node.style.filter = 'alpha(opacity=' + (value / 5) + ')';
			}
		} else if(mxClient.IS_IE) {
			if (value >= 100) {
				node.style.filter = null;
			} else {
				node.style.filter = 'alpha(opacity=' + value + ')';
			}
		} else {
			node.style.opacity = (value / 100);
		}
	},
	createImage : function(src) {
		var imgName = src.toUpperCase()
		var imageNode = null;
		if (imgName.substring(imgName.length - 3, imgName.length).toUpperCase() == 'PNG'
				&& true && !false) {
			imageNode = document.createElement('DIV');
			imageNode.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader (src=\''
					+ src + '\', sizingMethod=\'scale\')';
		} else {
			imageNode = document.createElement('image');
			imageNode.setAttribute('src', src);
		}
		return imageNode;
	},
	sortCells : function(cells, ascending) {
		cells.sort(function(a, b) {
					var acp = mxCellPath.create(a);
					var bcp = mxCellPath.create(b);
					return (acp == bcp) ? 0 : (((acp > bcp) == ascending)
							? 1
							: -1);
				});
		return cells;
	},
	getStylename : function(style) {
		if (style != null) {
			var pairs = style.split(';');
			var stylename = pairs[0];
			if (stylename.indexOf('=') < 0) {
				return stylename;
			}
		}
		return '';
	},
	getStylenames : function(style) {
		var result = new Array();
		if (style != null) {
			var pairs = style.split(';');
			for (var i = 0; i < pairs.length; i++) {
				if (pairs[i].indexOf('=') < 0) {
					result.push(pairs[i]);
				}
			}
		}
		return result;
	},
	indexOfStylename : function(style, stylename) {
		if (style != null && stylename != null) {
			var tokens = style.split(';');
			var pos = 0;
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i] == stylename) {
					return pos;
				}
				pos += tokens[i].length + 1;
			}
		}
		return -1;
	},
	addStylename : function(style, stylename) {
		if (mxUtils.indexOfStylename(style, stylename) < 0) {
			if (style == null) {
				style = '';
			} else if (style.length > 0
					&& style.charAt(style.length - 1) != ';') {
				style += ';';
			}
			style += stylename;
		}
		return style;
	},
	removeStylename : function(style, stylename) {
		var result = new Array();
		if (style != null) {
			var tokens = style.split(';');
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i] != stylename) {
					result.push(tokens[i]);
				}
			}
		}
		return result.join(';');
	},
	removeAllStylenames : function(style) {
		var result = new Array();
		if (style != null) {
			var tokens = style.split(';');
			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i].indexOf('=') >= 0) {
					result.push(tokens[i]);
				}
			}
		}
		return result.join(';');
	},
	setCellStyles : function(model, cells, key, value) {
		if (cells != null && cells.length > 0) {
			model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					if (cells[i] != null) {
						var style = mxUtils.setStyle(model.getStyle(cells[i]),
								key, value);
						model.setStyle(cells[i], style);
					}
				}
			} finally {
				model.endUpdate();
			}
		}
	},
	setStyle : function(style, key, value) {
		var isValue = value != null
				&& (typeof(value.length) == 'undefined' || value.length > 0);
		if (style == null || style.length == 0) {
			if (isValue) {
				style = key + '=' + value;
			}
		} else {
			var index = style.indexOf(key + '=');
			if (index < 0) {
				if (isValue) {
					var sep = (style.charAt(style.length - 1) == ';')
							? ''
							: ';';
					style = style + sep + key + '=' + value;
				}
			} else {
				var tmp = (isValue) ? key + '=' + value : '';
				var cont = style.indexOf(';', index);
				style = style.substring(0, index) + tmp
						+ ((cont >= 0) ? style.substring(cont) : '');
			}
		}
		return style;
	},
	setCellStyleFlags : function(model, cells, key, flag, value) {
		if (cells != null && cells.length > 0) {
			model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					if (cells[i] != null) {
						var style = mxUtils.setStyleFlag(model
										.getStyle(cells[i]), key, flag, value);
						model.setStyle(cells[i], style);
					}
				}
			} finally {
				model.endUpdate();
			}
		}
	},
	setStyleFlag : function(style, key, flag, value) {
		if (style == null || style.length == 0) {
			if (value || value == null) {
				style = key + '=' + flag;
			} else {
				style = key + '=0';
			}
		} else {
			var index = style.indexOf(key + '=');
			if (index < 0) {
				var sep = (style.charAt(style.length - 1) == ';') ? '' : ';';
				if (value || value == null) {
					style = style + sep + key + '=' + flag;
				} else {
					style = style + sep + key + '=0';
				}
			} else {
				var cont = style.indexOf(';', index);
				var tmp = '';
				if (cont < 0) {
					tmp = style.substring(index + key.length + 1);
				} else {
					tmp = style.substring(index + key.length + 1, cont);
				}
				if (value == null) {
					tmp = parseInt(tmp) ^ flag;
				} else if (value) {
					tmp = parseInt(tmp) | flag;
				} else {
					tmp = parseInt(tmp) & ~flag;
				}
				style = style.substring(0, index) + key + '=' + tmp
						+ ((cont >= 0) ? style.substring(cont) : '');
			}
		}
		return style;
	},
	getSizeForString : function(text, fontSize, fontFamily) {
		var div = document.createElement('div');
		div.style.fontSize = fontSize || mxConstants.DEFAULT_FONTSIZE;
		div.style.fontFamily = fontFamily || mxConstants.DEFAULT_FONTFAMILY
		div.style.position = 'absolute';
		div.style.display = 'inline';
		div.style.visibility = 'hidden';
		div.innerHTML = text;
		document.body.appendChild(div);
		var size = new mxRectangle(0, 0, div.offsetWidth, div.offsetHeight);
		document.body.removeChild(div);
		return size;
	},
	getViewXml : function(graph, scale, cells, x0, y0) {
		x0 = (x0 != null) ? x0 : 0;
		y0 = (y0 != null) ? y0 : 0;
		scale = (scale != null) ? scale : 1;
		if (cells == null) {
			var model = graph.getModel();
			cells = [model.getRoot()];
		}
		var view = graph.getView();
		var result = null;
		var eventsEnabled = view.isEventsEnabled();
		view.setEventsEnabled(false);
		var rendering = view.isRendering();
		view.setRendering(false);
		var translate = view.getTranslate();
		view.translate = new mxPoint(x0, y0);
		var temp = new mxTemporaryCellStates(graph.getView(), scale, cells);
		try {
			var enc = new mxCodec();
			result = enc.encode(graph.getView());
		} finally {
			temp.destroy();
			view.translate = translate;
			view.setRendering(rendering);
			view.setEventsEnabled(eventsEnabled);
		}
		return result;
	},
	getScaleForPageCount : function(pageCount, graph, pageFormat, x0, y0) {
		x0 = (x0 != null) ? x0 : 0;
		y0 = (y0 != null) ? y0 : 0;
		if (pageFormat == null) {
			pageFormat = mxConstants.PAGE_FORMAT_A4_PORTRAIT;
		}

		var graphBounds = graph.getGraphBounds().clone();
		var sc = graph.getView().getScale();
		var tr = graph.getView().getTranslate();
		graphBounds.x /= sc;
		graphBounds.x -= tr.x - x0;
		graphBounds.y /= sc;
		graphBounds.y -= tr.y - y0;
		graphBounds.width /= sc;
		graphBounds.height /= sc;
		var graphWidth = graphBounds.width + graphBounds.x;
		var graphHeight = graphBounds.height + graphBounds.y;
		var rowPages = Math.max(1, Math.ceil((graphWidth) / pageFormat.width));
		var columnPages = Math.max(1, Math.ceil((graphHeight)
						/ pageFormat.height));

		var unscaledPageCount = rowPages * columnPages;
		var scale = 1;
		if (pageCount != unscaledPageCount) {

			var unscaledGraphArea = (graphWidth) * (graphHeight);
			var optimalPageArea = (pageFormat.width * pageFormat.height)
					* pageCount;
			var areaRatio = optimalPageArea / unscaledGraphArea;
			var scale = Math.sqrt(areaRatio);

			var scaledGraphX = (graphWidth) * scale;
			var scaledGraphY = (graphHeight) * scale;
			var numScaledRowPages = scaledGraphX / pageFormat.width;
			var numScaledColumnPages = scaledGraphY / pageFormat.height;
			var currentTotalPages = Math.ceil(numScaledRowPages)
					* Math.ceil(numScaledColumnPages);

			while (currentTotalPages > pageCount) {

				var roundRowDownProportion = Math.floor(numScaledRowPages)
						/ numScaledRowPages;
				var roundColumnDownProportion = Math
						.floor(numScaledColumnPages)
						/ numScaledColumnPages;

				var scaleChange;
				if (roundRowDownProportion > roundColumnDownProportion
						&& roundRowDownProportion > 0
						&& roundRowDownProportion < 1) {
					scaleChange = roundRowDownProportion;
				} else if (roundColumnDownProportion > 0
						&& roundColumnDownProportion < 1 != null) {
					scaleChange = roundColumnDownProportion;
				} else {

					if (Math.floor(numScaledRowPages) > 1) {
						scaleChange = (Math.floor(numScaledRowPages - 1) / numScaledRowPages);
					} else if (Math.floor(numScaledColumnPages) > 1) {
						scaleChange = (Math.floor(numScaledColumnPages - 1) / numScaledColumnPages);
					}
				}
				numScaledRowPages = numScaledRowPages * scaleChange;
				numScaledColumnPages = numScaledColumnPages * scaleChange;
				scale = scale * scaleChange;
				currentTotalPages = Math.ceil(numScaledRowPages)
						* Math.ceil(numScaledColumnPages);
			}
			while (currentTotalPages < pageCount) {

				var roundRowUpProportion = Math.ceil(numScaledRowPages)
						/ numScaledRowPages;
				var roundColumnUpProportion = Math.ceil(numScaledColumnPages)
						/ numScaledColumnPages;

				var tempScale;
				if (roundRowUpProportion < roundColumnUpProportion
						&& roundRowUpProportion > 0.001) {
					tempScale = scale * roundRowUpProportion;
				} else if (roundColumnUpProportion > 0.01) {
					tempScale = scale * roundColumnUpProportion;
				} else {

					tempScale = scale
							* (Math.floor(numScaledRowPage + 1) / numScaleRowPage);
				}
				var tempNumScaledRowPages = numScaledRowPages * tempScale;
				var tempNumScaledColumnPages = numScaledColumnPages * tempScale;
				var tempCurrentTotalPages = Math.ceil(numScaledRowPages)
						* Math.ceil(numScaledColumnPages);
				if (tempCurrentTotalPages <= pageCount) {
					scale = tempScale;
					numScaledRowPages = numScaledRowPages * scale;
					numScaledColumnPages = numScaledColumnPages * scale;
					currentTotalPages = Math.ceil(numScaledRowPages)
							* Math.ceil(numScaledColumnPages);
				}
				if (tempCurrentTotalPages >= pageCount) {

					break;
				}
			}
		}
		return scale;
	},
	show : function(graph, doc) {
		if (doc == null) {
			var wnd = window.open();
			doc = wnd.document;
// alert(doc);//jiang 20100116
// alert(graph.innerHTML);//jiang 20100116
		} else {
			doc.open();
		}
		doc.writeln('<html xmlns:v="urn:schemas-microsoft-com:vml">');
		doc.writeln('<head>');
		var base = document.getElementsByTagName('base');
		for (var i = 0; i < base.length; i++) {
			doc.writeln(mxUtils.getOuterHtml(base[i]));
		}
		var links = document.getElementsByTagName('link');
		for (var i = 0; i < links.length; i++) {
			doc.writeln(mxUtils.getOuterHtml(links[i]));
		}
		var styles = document.getElementsByTagName('style');
		for (var i = 0; i < styles.length; i++) {
			doc.writeln(mxUtils.getOuterHtml(styles[i]));
		}
		doc.writeln('</head>');
		var bounds = graph.getGraphBounds();
		var dx = Math.min(bounds.x, 0);
		var dy = Math.min(bounds.y, 0);
		if(mxClient.IS_IE) {
			doc.writeln('<body>');
			doc.writeln(mxUtils.getInnerHtml(graph.container));
			doc.writeln('</body>');
			doc.writeln('</html>');
			var node = doc.body.getElementsByTagName('DIV')[0];
			if (node != null) {
				node.style.position = 'absolute';
				node.style.left = -dx + 'px';
				node.style.top = -dy + 'px';
			}
			doc.close();
		} else {
			doc.writeln('</html>');
			doc.close();

			doc.documentElement.appendChild(doc.createElement('body'));
			var node = graph.container.firstChild;
			while (node != null) {
				var clone = node.cloneNode(true);
				doc.body.appendChild(clone);
				node = node.nextSibling;
			}
		}
		mxUtils.removeCursors(doc.documentElement);
		if (!true) {
			var node = doc.getElementsByTagName('g')[0];
			if (node != null) {
				node.setAttribute('transform', 'translate(' + (-dx) + ','
								+ (-dy) + ')');
				var root = node.ownerSVGElement;
				root.setAttribute('width', bounds.width + Math.max(bounds.x, 0)
								+ 3);
				root.setAttribute('height', bounds.height
								+ Math.max(bounds.y, 0) + 3);
				root.style.position = 'absolute';
				root.style.left = dx + 'px';
				root.style.top = dy + '0px';
			}
		} else {

			doc.execCommand('Refresh', 'false', 'false');
		}
		return doc;
	},
	printScreen : function(graph) {
		var wnd = window.open();
		mxUtils.show(graph, wnd.document);
		var print = function() {
			wnd.focus();
			wnd.print();
			wnd.close();
		};

		if(!mxClient.IS_IE) {
			wnd.setTimeout(print, 500)
		} else {
			print();
		}
	},
	popup : function(content, isInternalWindow) {
		if (isInternalWindow) {
			var div = document.createElement('div');
			div.style.overflow = 'scroll';
			div.style.width = '636px';
			div.style.height = '460px';
			var pre = document.createElement('pre');
			pre.innerHTML = mxUtils.htmlEntities(content, false).replace(/\n/g,
					'<br>').replace(/ /g, '&nbsp;');
			div.appendChild(pre);
			var w = document.body.clientWidth;
			var h = (document.body.clientHeight || document.documentElement.clientHeight);
			var wnd = new mxWindow('Popup Window', div, w / 2 - 320, h / 2
							- 240, 640, 480, false, true);
			wnd.setClosable(true);
			wnd.setVisible(true);
		} else {
			if(!mxClient.IS_IE) {
				var wnd = window.open();
				wnd.document.writeln('<pre>' + mxUtils.htmlEntities(content)
						+ '</pre');
				wnd.document.close();
			} else {
				var wnd = window.open();
				var pre = wnd.document.createElement('pre');
				pre.innerHTML = mxUtils.htmlEntities(content, false).replace(
						/\n/g, '<br>').replace(/ /g, '&nbsp;');
				wnd.document.body.appendChild(pre);
			}
		}
	},
	alert : function(message) {
		alert(message);  // longjunhao 20140718
	},
	prompt : function(message, defaultValue) {
		return prompt(message, defaultValue);
	},
	confirm : function(message) {
		return confirm(message);
	},
	error : function(message, width, close, icon) {
		var div = document.createElement('div');
		div.style.padding = '20px';
		var img = document.createElement('img');
		img.setAttribute('src', icon || mxUtils.errorImage);
		img.setAttribute('valign', 'bottom');
		img.style.verticalAlign = 'middle';
		div.appendChild(img);
		div.appendChild(document.createTextNode('\u00a0'));
		div.appendChild(document.createTextNode('\u00a0'));
		div.appendChild(document.createTextNode('\u00a0'));
		mxUtils.write(div, message);
		var w = document.body.clientWidth;
		var h = (document.body.clientHeight || document.documentElement.clientHeight);
		var warn = new mxWindow(mxResources.get(mxUtils.errorResource)
						|| mxUtils.errorResource, div, (w - width) / 2, h / 4,
				width, null, false, true);
		if (close) {
			mxUtils.br(div);
			var tmp = document.createElement('p');
			var button = document.createElement('button');
			if(mxClient.IS_IE) {
				button.style.cssText = 'float:right';
			} else {
				button.setAttribute('style', 'float:right');
			}
			mxEvent.addListener(button, 'click', function(evt) {
						warn.destroy();
					});
			mxUtils.write(button, mxResources.get(mxUtils.closeResource)
							|| mxUtils.closeResource);
			tmp.appendChild(button);
			div.appendChild(tmp);
			mxUtils.br(div);
			warn.setClosable(true);
		}
		warn.setVisible(true);
		return warn;
	},
	// jiang 20100116 note 拖拉图形
	makeDraggable : function(element, graph, funct, dragElement, dx, dy,
			autoscroll, scalePreview, highlightDropTargets, getDropTarget) {
		// alert('makeDraggable');
		dx = (dx != null) ? dx : 0;
		dy = (dy != null) ? dy : mxConstants.TOOLTIP_VERTICAL_OFFSET;
		highlightDropTargets = (highlightDropTargets != null)
				? highlightDropTargets
				: true;
		getDropTarget = (getDropTarget != null)
				? getDropTarget
				: function(x, y) {
					return graph.getCellAt(x, y);
				};
		mxEvent.addListener(element, 'mousedown', function(evt) {
			if (graph.isEnabled() && !mxEvent.isConsumed(evt)) {
				// alert('mousedown');// jiang 20100116 note
				var sprite = (dragElement != null) ? dragElement
						.cloneNode(true) : element.cloneNode(true);
				if (scalePreview) {
					var scale = graph.view.scale;
					sprite.style.width = (parseInt(sprite.style.width) * scale)
							+ 'px';
					sprite.style.height = (parseInt(sprite.style.height) * scale)
							+ 'px';
					dx *= scale;
					dy *= scale;
				}
				sprite.style.zIndex = 3;
				sprite.style.position = 'absolute';
				mxUtils.setOpacity(sprite, 70);

				var dropTarget = null;
				var initialized = false;
				var startX = evt.clientX;
				var startY = evt.clientY;
				var highlight = null;
				var highlightCell = function() {
				};
				if (highlightDropTargets) {
					highlight = new mxCellHighlight(graph,
							mxConstants.DROP_TARGET_COLOR);

					highlightCell = function(cell) {
						var state = graph.getView().getState(cell);
						highlight.highlight(state);
					};
				}

				var dragHandler = function(evt) {
					var origin = mxUtils.getScrollOrigin();
					var pt = mxUtils.convertPoint(graph.container, evt.clientX,
							evt.clientY);
					sprite.style.left = (evt.clientX + origin.x + dx) + 'px';
					sprite.style.top = (evt.clientY + origin.y + dy) + 'px';
					if (!initialized) {
						initialized = true;
						document.body.appendChild(sprite);
					} else if (graph.autoScroll
							&& (autoscroll == null || autoscroll)) {
						graph
								.scrollPointToVisible(pt.x, pt.y,
										graph.autoExtend);
					}

					dropTarget = getDropTarget(pt.x, pt.y);
					highlightCell(dropTarget);
					
					mxEvent.consume(evt);
				};
				var dropHandler = function(evt) {
					mxEvent.removeListener(document, 'mousemove', dragHandler);
					mxEvent.removeListener(document, 'mouseup', dropHandler);
					if (sprite.parentNode != null) {
						sprite.parentNode.removeChild(sprite);
					}
					if (highlight != null) {
						highlight.destroy();
						highlight = null;
					}
					try {

						var pt = mxUtils.convertPoint(graph.container,
								evt.clientX, evt.clientY);

						var tol = 2 * graph.tolerance;
						if (pt.x >= graph.container.scrollLeft
								&& pt.y >= graph.container.scrollTop
								&& pt.x <= graph.container.scrollLeft
										+ graph.container.clientWidth
								&& pt.y <= graph.container.scrollTop
										+ graph.container.clientHeight
								&& (Math.abs(evt.clientX - startX) > tol || Math
										.abs(evt.clientY - startY) > tol)) {
							funct(graph, evt, dropTarget);
						}
					} finally {
						mxEvent.consume(evt);
					}
				};
				mxEvent.addListener(document, 'mousemove', dragHandler);
				mxEvent.addListener(document, 'mouseup', dropHandler);
				mxEvent.consume(evt);
			}
		});
	}
};

var mxConstants = {
	DEFAULT_HOTSPOT : 0.3,
	MIN_HOTSPOT_SIZE : 8,
	MAX_HOTSPOT_SIZE : 0,
	RENDERING_HINT_EXACT : 'exact',
	RENDERING_HINT_FASTER : 'faster',
	RENDERING_HINT_FASTEST : 'fastest',
	DIALECT_SVG : 'svg',
	DIALECT_VML : 'vml',
	DIALECT_MIXEDHTML : 'mixedHtml',
	DIALECT_PREFERHTML : 'preferHtml',
	DIALECT_STRICTHTML : 'strictHtml',
	NS_SVG : 'http://www.w3.org/2000/svg',
	NS_XHTML : 'http://www.w3.org/1999/xhtml',
	NS_XLINK : 'http://www.w3.org/1999/xlink',

	SVG_SHADOWCOLOR : 'gray',
	SVG_CRISP_EDGES : false,
	SVG_SHADOWTRANSFORM : 'translate(2 3)',
	NODETYPE_ELEMENT : 1,
	NODETYPE_ATTRIBUTE : 2,
	NODETYPE_TEXT : 3,
	NODETYPE_CDATA : 4,
	NODETYPE_ENTITY_REFERENCE : 5,
	NODETYPE_ENTITY : 6,
	NODETYPE_PROCESSING_INSTRUCTION : 7,
	NODETYPE_COMMENT : 8,
	NODETYPE_DOCUMENT : 9,
	NODETYPE_DOCUMENTTYPE : 10,
	NODETYPE_DOCUMENT_FRAGMENT : 11,
	NODETYPE_NOTATION : 12,
	TOOLTIP_VERTICAL_OFFSET : 16,
	DEFAULT_VALID_COLOR : '#00FF00',
	DEFAULT_INVALID_COLOR : '#FF0000',
	HIGHLIGHT_STROKEWIDTH : 3,
	HIGHLIGHT_COLOR : '#00FF00',
	CONNECT_TARGET_COLOR : '#0000FF',
	INVALID_CONNECT_TARGET_COLOR : '#FF0000',
	DROP_TARGET_COLOR : '#0000FF',
	VALID_COLOR : '#00FF00',
	INVALID_COLOR : '#FF0000',
	SELECTION_COLOR : '#00FF00',
	SELECTION_STROKEWIDTH : 1,
	SELECTION_DASHED : true,
	OUTLINE_COLOR : '#0099FF',
	OUTLINE_STROKEWIDTH : (true) ? 2 : 3,
	HANDLE_FILLCOLOR : '#00FF00',
	HANDLE_STROKECOLOR : 'black',
	LABEL_HANDLE_FILLCOLOR : 'yellow',
	CONNECT_HANDLE_FILLCOLOR : '#0000FF',
	LOCKED_HANDLE_FILLCOLOR : '#FF0000',
	OUTLINE_HANDLE_FILLCOLOR : '#00FFFF',
	OUTLINE_HANDLE_STROKECOLOR : '#0033FF',
	DEFAULT_FONTFAMILY : 'Arial,Helvetica',
	DEFAULT_FONTSIZE : 11,
	DEFAULT_MARKERSIZE : 6,
	DEFAULT_IMAGESIZE : 24,
	ENTITY_SEGMENT : 30,
	ARROW_SPACING : 10,
	ARROW_WIDTH : 30,
	ARROW_SIZE : 30,
	PAGE_FORMAT_A4_PORTRAIT : new mxRectangle(0, 0, 826, 1169),
	PAGE_FORMAT_A4_LANDSCAPE : new mxRectangle(0, 0, 1169, 826),
	NONE : 'none',
	STYLE_PERIMETER : 'perimeter',
	STYLE_OPACITY : 'opacity',
	STYLE_TEXT_OPACITY : 'textOpacity',
	STYLE_ROTATION : 'rotation',
	STYLE_FILLCOLOR : 'fillColor',
	STYLE_GRADIENTCOLOR : 'gradientColor',
	STYLE_GRADIENT_DIRECTION : 'gradientDirection',
	STYLE_STROKECOLOR : 'strokeColor',
	STYLE_SEPARATORCOLOR : 'separatorColor',
	STYLE_STROKEWIDTH : 'strokeWidth',
	STYLE_ALIGN : 'align',
	STYLE_VERTICAL_ALIGN : 'verticalAlign',
	STYLE_LABEL_POSITION : 'labelPosition',
	STYLE_VERTICAL_LABEL_POSITION : 'verticalLabelPosition',
	STYLE_IMAGE_ALIGN : 'imageAlign',
	STYLE_IMAGE_VERTICAL_ALIGN : 'imageVerticalAlign',
	STYLE_IMAGE : 'image',
	STYLE_IMAGE_WIDTH : 'imageWidth',
	STYLE_IMAGE_HEIGHT : 'imageHeight',
	STYLE_NOLABEL : 'noLabel',
	STYLE_NOEDGESTYLE : 'noEdgeStyle',
	STYLE_LABEL_BACKGROUNDCOLOR : 'labelBackgroundColor',
	STYLE_LABEL_BORDERCOLOR : 'labelBorderColor',
	STYLE_INDICATOR_SHAPE : 'indicatorShape',
	STYLE_INDICATOR_IMAGE : 'indicatorImage',
	STYLE_INDICATOR_COLOR : 'indicatorColor',
	STYLE_INDICATOR_STROKECOLOR : 'indicatorStrokeColor',
	STYLE_INDICATOR_GRADIENTCOLOR : 'indicatorGradientColor',
	STYLE_INDICATOR_SPACING : 'indicatorSpacing',
	STYLE_INDICATOR_WIDTH : 'indicatorWidth',
	STYLE_INDICATOR_HEIGHT : 'indicatorHeight',
	STYLE_SHADOW : 'shadow',
	STYLE_ENDARROW : 'endArrow',
	STYLE_STARTARROW : 'startArrow',
	STYLE_ENDSIZE : 'endSize',
	STYLE_STARTSIZE : 'startSize',
	STYLE_DASHED : 'dashed',
	STYLE_ROUNDED : 'rounded',
	STYLE_SOURCE_PERIMETER_SPACING : 'sourcePerimeterSpacing',
	STYLE_TARGET_PERIMETER_SPACING : 'targetPerimeterSpacing',
	STYLE_PERIMETER_SPACING : 'perimeterSpacing',
	STYLE_SPACING : 'spacing',
	STYLE_SPACING_TOP : 'spacingTop',
	STYLE_SPACING_LEFT : 'spacingLeft',
	STYLE_SPACING_BOTTOM : 'spacingBottom',
	STYLE_SPACING_RIGHT : 'spacingRight',
	STYLE_HORIZONTAL : 'horizontal',
	STYLE_DIRECTION : 'direction',
	STYLE_ELBOW : 'elbow',
	STYLE_FONTCOLOR : 'fontColor',
	STYLE_FONTFAMILY : 'fontFamily',
	STYLE_FONTSIZE : 'fontSize',
	STYLE_FONTSTYLE : 'fontStyle',
	STYLE_SHAPE : 'shape',
	STYLE_EDGE : 'edgeStyle',
	STYLE_LOOP : 'loopStyle',
	STYLE_ROUTING_CENTER_X : 'routingCenterX',
	STYLE_ROUTING_CENTER_Y : 'routingCenterY',
	FONT_BOLD : 1,
	FONT_ITALIC : 2,
	FONT_UNDERLINE : 4,
	FONT_SHADOW : 8,
	SHAPE_RECTANGLE : 'rectangle',
	SHAPE_ELLIPSE : 'ellipse',
	SHAPE_DOUBLE_ELLIPSE : 'doubleEllipse',
	SHAPE_RHOMBUS : 'rhombus',
	SHAPE_LINE : 'line',
	SHAPE_IMAGE : 'image',
	SHAPE_ARROW : 'arrow',
	SHAPE_LABEL : 'label',
	SHAPE_CYLINDER : 'cylinder',
	SHAPE_SWIMLANE : 'swimlane',
	SHAPE_CONNECTOR : 'connector',
	SHAPE_ACTOR : 'actor',
	SHAPE_CLOUD : 'cloud',
	SHAPE_TRIANGLE : 'triangle',
	SHAPE_HEXAGON : 'hexagon',
	ARROW_CLASSIC : 'classic',
	ARROW_BLOCK : 'block',
	ARROW_OPEN : 'open',
	ARROW_OVAL : 'oval',
	ARROW_DIAMOND : 'diamond',
	ALIGN_LEFT : 'left',
	ALIGN_CENTER : 'center',
	ALIGN_RIGHT : 'right',
	ALIGN_TOP : 'top',
	ALIGN_MIDDLE : 'middle',
	ALIGN_BOTTOM : 'bottom',
	DIRECTION_NORTH : 'north',
	DIRECTION_SOUTH : 'south',
	DIRECTION_EAST : 'east',
	DIRECTION_WEST : 'west',
	ELBOW_VERTICAL : 'vertical',
	ELBOW_HORIZONTAL : 'horizontal',
	EDGESTYLE_ELBOW : 'elbowEdgeStyle',
	EDGESTYLE_ENTITY_RELATION : 'entityRelationEdgeStyle',
	EDGESTYLE_LOOP : 'loopEdgeStyle',
	EDGESTYLE_SIDETOSIDE : 'sideToSideEdgeStyle',
	EDGESTYLE_TOPTOBOTTOM : 'topToBottomEdgeStyle',
	PERIMETER_ELLIPSE : 'ellipsePerimeter',
	PERIMETER_RECTANGLE : 'rectanglePerimeter',
	PERIMETER_RHOMBUS : 'rhombusPerimeter',
	PERIMETER_TRIANGLE : 'trianglePerimeter'
};

{
	function mxEventObject(args) {
		this.args = args || [];
	};
	mxEventObject.prototype.args = null;
	mxEventObject.prototype.consumed = false;
	mxEventObject.prototype.getArgs = function() {
		return this.args;
	};
	mxEventObject.prototype.getArgCount = function() {
		return this.args.length;
	};
	mxEventObject.prototype.getArgAt = function(index) {
		return this.args[index];
	};
	mxEventObject.prototype.isConsumed = function() {
		return this.consumed;
	};
	mxEventObject.prototype.consume = function() {
		this.consumed = true;
	};
}

{
	function mxMouseEvent(evt, state, handle, tooltip) {
		this.evt = evt;
		this.state = state;
		this.handle = handle;
		this.tooltip = tooltip;
	};
	mxMouseEvent.prototype.evt = null;
	mxMouseEvent.prototype.state = null;
	mxMouseEvent.prototype.handle = null;
	mxMouseEvent.prototype.tooltip = null;
	mxMouseEvent.prototype.getEvent = function() {
		return this.evt;
	};
	mxMouseEvent.prototype.getX = function() {
		return this.getEvent().clientX;
	};
	mxMouseEvent.prototype.getY = function() {
		return this.getEvent().clientY;
	};
	mxMouseEvent.prototype.getState = function() {
		return this.state;
	};
	mxMouseEvent.prototype.getCell = function() {
		var state = this.getState();
		if (state != null) {
			return state.cell;
		}
		return null;
	};
	mxMouseEvent.prototype.setState = function(value) {
		this.state = value;
	};
	mxMouseEvent.prototype.getHandle = function() {
		return this.handle;
	};
	mxMouseEvent.prototype.setHandle = function(value) {
		this.handle = value;
	};
	mxMouseEvent.prototype.getTooltip = function() {
		return this.tooltip;
	};
	mxMouseEvent.prototype.setTooltip = function(value) {
		this.tooltip = value;
	};
	mxMouseEvent.prototype.isPopupTrigger = function() {
		return mxEvent.isPopupTrigger(this.getEvent());
	};
	mxMouseEvent.prototype.isConsumed = function() {
		return mxEvent.isConsumed(this.getEvent());
	};
	mxMouseEvent.prototype.consume = function() {
		mxEvent.consume(this.getEvent());
	};
}

{
	function mxEventSource(eventSource) {
		this.setEventSource(eventSource);
	};
	mxEventSource.prototype.eventListeners = null;
	mxEventSource.prototype.eventsEnabled = true;
	mxEventSource.prototype.eventSource = null;
	mxEventSource.prototype.isEventsEnabled = function() {
		return this.eventsEnabled;
	};
	mxEventSource.prototype.setEventsEnabled = function(value) {
		this.eventsEnabled = value;
	};
	mxEventSource.prototype.getEventSource = function() {
		return this.eventSource;
	};
	mxEventSource.prototype.setEventSource = function(value) {
		this.eventSource = value;
	};
	mxEventSource.prototype.addListener = function(name, funct) {
		if (this.eventListeners == null) {
			this.eventListeners = new Array();
		}
		this.eventListeners.push(name);
		this.eventListeners.push(funct);
	};
	mxEventSource.prototype.removeListener = function(funct) {
		if (this.eventListeners != null) {
			var i = 0;
			while (i < this.eventListeners.length) {
				if (this.eventListeners[i + 1] == funct) {
					this.eventListeners.splice(i, 2);
				} else {
					i += 2;
				}
			}
		}
	};
	mxEventSource.prototype.fireEvent = function(name, evt, source) {
		if (this.eventListeners != null && this.isEventsEnabled()) {
			if (evt == null) {
				evt = new mxEventObject();
			}
			if (source == null) {
				source = this.getEventSource();
			}
			if (source == null) {
				source = this;
			}
			var args = [source, evt];
			for (var i = 0; i < this.eventListeners.length; i += 2) {
				var listen = this.eventListeners[i];
				if (listen == null || listen == name) {
					this.eventListeners[i + 1].apply(this, args);
				}
			}
		}
	};
}

var mxEvent = {
	addListener : function() {
		var updateListenerList = function(element, eventName, funct) {
			if (element.mxListenerList == null) {
				element.mxListenerList = new Array();
			}
			var entry = {
				name : eventName,
				f : funct
			};
			element.mxListenerList.push(entry);
		}
		if(mxClient.IS_IE) {
			return function(element, eventName, funct) {
				element.attachEvent("on" + eventName, funct);
				updateListenerList(element, eventName, funct);
			}
		} else {
			return function(element, eventName, funct) {
				element.addEventListener(eventName, funct, false);
				updateListenerList(element, eventName, funct);
			}
		}
	}(),
	redirectMouseEvents : function(element, graph, cell, handle, transparent,
			doubleClick, forceTransparent, transparentSwimlaneContent) {
		transparentSwimlaneContent = (transparentSwimlaneContent != null)
				? transparentSwimlaneContent
				: true;
		var state = graph.getView().getState(cell);

		var getState = function(evt) {
			var result = state;
			var pt = mxUtils.convertPoint(graph.container, evt.clientX,
					evt.clientY);
			if (forceTransparent || (transparent && true)) {
				var tmp = graph.getCellAt(pt.x, pt.y);
				if (cell != tmp) {
					result = graph.getView().getState(tmp);
				}
			}
			if (result != null && transparentSwimlaneContent
					&& graph.isSwimlane(result.cell)
					&& graph.hitsSwimlaneContent(result.cell, pt.x, pt.y)) {
				result = null;
			}
			return result;
		};
		mxEvent.addListener(element, 'mousedown', function(evt) {
					graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(
									evt, getState(evt), handle));
				});
		mxEvent.addListener(element, 'mousemove', function(evt) {
					graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(
									evt, getState(evt), handle));
				});
		mxEvent.addListener(element, 'mouseup', function(evt) {
					graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(
									evt, getState(evt), handle));
				});
		if (doubleClick) {
			mxEvent.addListener(element, 'dblclick', function(evt) {
						var state = getState(evt);
						var cell = (state != null) ? state.cell : null;
						graph.dblClick(evt, cell);
						mxEvent.consume(evt);
					});
		}
	},
	removeListener : function() {
		var updateListener = function(element, eventName, funct) {
			if (element.mxListenerList != null) {
				var listenerCount = element.mxListenerList.length;
				for (var i = 0; i < listenerCount; i++) {
					var entry = element.mxListenerList[i];
					if (entry.f == funct) {
						element.mxListenerList.splice(i, 1);
						break;
					}
				}
				if (element.mxListenerList.length == 0) {
					element.mxListenerList = null;
				}
			}
		}
		if(mxClient.IS_IE) {
			return function(element, eventName, funct) {
				element.detachEvent("on" + eventName, funct);
				updateListener(element, eventName, funct);
			}
		} else {
			return function(element, eventName, funct) {
				element.removeEventListener(eventName, funct, false);
				updateListener(element, eventName, funct);
			}
		}
	}(),
	removeAllListeners : function(element) {
		var list = element.mxListenerList;
		if (list != null) {
			while (list.length > 0) {
				var entry = list[0];
				mxEvent.removeListener(element, entry.name, entry.f);
			}
		}
	},
	release : function(element) {
		if (element != null) {
			mxEvent.removeAllListeners(element);
			var children = element.childNodes;
			if (children != null) {
				var childCount = children.length;
				for (var i = 0; i < childCount; i += 1) {
					mxEvent.release(children[i]);
				}
			}
		}
	},
	addMouseWheelListener : function(funct) {
		if (funct != null) {
			var wheelHandler = function(evt) {

				if (evt == null) {
					evt = window.event;
				}
				var delta = 0;
				if (false && !false && !false) {
					delta = -evt.detail / 2;
				} else {
					delta = evt.wheelDelta / 120;
				}
				if (delta != 0) {
					funct(evt, delta > 0);
				}
			};
			if(!mxClient.IS_IE) {
				var eventName = (false || false)
						? 'mousewheel'
						: 'DOMMouseScroll';
				mxEvent.addListener(window, eventName, wheelHandler);
			} else {

				mxEvent.addListener(document, 'mousewheel', wheelHandler);
			}
		}
	},
	disableContextMenu : function() {
		if(mxClient.IS_IE) {
			return function(element) {
				mxEvent.addListener(element, 'contextmenu', function() {
							return false;
						});
			}
		} else {
			return function(element) {
				element.setAttribute('oncontextmenu', 'return false;');
			}
		}
	}(),
	getSource : function(evt) {
		return (evt.srcElement != null) ? evt.srcElement : evt.target;
	},
	isConsumed : function(evt) {
		return evt.isConsumed != null && evt.isConsumed;
	},
	isLeftMouseButton : function(evt) {
		return evt.button == ((true) ? 1 : 0);
	},
	isRightMouseButton : function(evt) {
		return evt.button == 2;
	},
	isPopupTrigger : function(evt) {
		return mxEvent.isRightMouseButton(evt)
				|| (mxEvent.isShiftDown(evt) && !mxEvent.isControlDown(evt));
	},
	isShiftDown : function(evt) {
		return (evt != null) ? evt.shiftKey : false;
	},
	isAltDown : function(evt) {
		return (evt != null) ? evt.altKey : false;
	},
	isControlDown : function(evt) {
		return (evt != null) ? evt.ctrlKey : false;
	},
	isMetaDown : function(evt) {
		return (evt != null) ? evt.metaKey : false;
	},
	consume : function(evt, preventDefault) {
		if (preventDefault == null || preventDefault) {
			if (evt.preventDefault) {
				evt.stopPropagation();
				evt.preventDefault();
			} else {
				evt.cancelBubble = true;
			}
		}
		evt.isConsumed = true;
		evt.returnValue = false;
	},

	LABEL_HANDLE : -1,

	MOUSE_DOWN : 'mouseDown',
	MOUSE_MOVE : 'mouseMove',
	MOUSE_UP : 'mouseUp',
	ACTIVATE : 'activate',
	RESIZE_START : 'resizeStart',
	RESIZE : 'resize',
	RESIZE_END : 'resizeEnd',
	MOVE_START : 'moveStart',
	MOVE : 'move',
	MOVE_END : 'moveEnd',
	MINIMIZE : 'minimize',
	NORMALIZE : 'normalize',
	MAXIMIZE : 'maximize',
	HIDE : 'hide',
	SHOW : 'show',
	CLOSE : 'close',
	DESTROY : 'destroy',
	REFRESH : 'refresh',
	SIZE : 'size',
	SELECT : 'select',
	FIRED : 'fired',
	GET : 'get',
	RECEIVE : 'receive',
	CONNECT : 'connect',
	DISCONNECT : 'disconnect',
	SUSPEND : 'suspend',
	RESUME : 'resume',
	MARK : 'mark',
	SESSION : 'session',
	ROOT : 'root',
	POST : 'post',
	OPEN : 'open',
	SAVE : 'save',
	BEFORE_ADD_VERTEX : 'beforeAddVertex',
	ADD_VERTEX : 'addVertex',
	AFTER_ADD_VERTEX : 'afterAddVertex',
	EXECUTE : 'execute',
	BEGIN_UPDATE : 'beginUpdate',
	END_UPDATE : 'endUpdate',
	BEFORE_UNDO : 'beforeUndo',
	UNDO : 'undo',
	REDO : 'redo',
	CHANGE : 'change',
	NOTIFY : 'notify',
	LAYOUT_CELLS : 'layoutCells',
	CLICK : 'click',
	SCALE : 'scale',
	TRANSLATE : 'translate',
	SCALE_AND_TRANSLATE : 'scaleAndTranslate',
	UP : 'up',
	DOWN : 'down',
	ADD : 'add',
	ADD_CELLS : 'addCells',
	CELLS_ADDED : 'cellsAdded',
	MOVE_CELLS : 'moveCells',
	CELLS_MOVED : 'cellsMoved',
	RESIZE_CELLS : 'resizeCells',
	CELLS_RESIZED : 'cellsResized',
	TOGGLE_CELLS : 'toggleCells',
	CELLS_TOGGLED : 'cellsToggled',
	ORDER_CELLS : 'orderCells',
	CELLS_ORDERED : 'cellsOrdered',
	REMOVE_CELLS : 'removeCells',
	CELLS_REMOVED : 'cellsRemoved',
	GROUP_CELLS : 'groupCells',
	UNGROUP_CELLS : 'ungroupCells',
	REMOVE_CELLS_FROM_PARENT : 'removeCellsFromParent',
	FOLD_CELLS : 'foldCells',
	CELLS_FOLDED : 'cellsFolded',
	ALIGN_CELLS : 'alignCells',
	LABEL_CHANGED : 'labelChanged',
	CONNECT_CELL : 'connectCell',
	CELL_CONNECTED : 'cellConnected',
	SPLIT_EDGE : 'splitEdge',
	FLIP_EDGE : 'flipEdge',
	START_EDITING : 'startEditing',
	ADD_OVERLAY : 'addOverlay',
	REMOVE_OVERLAY : 'removeOverlay',
	UPDATE_CELL_SIZE : 'updateCellSize',
	ESCAPE : 'escape',
	CLICK : 'click',
	DOUBLE_CLICK : 'doubleClick'
};

{
	function mxXmlRequest(url, params, method, async, username, password) {
		this.url = url;
		this.params = params;
		this.method = method || 'POST';
		this.async = (async != null) ? async : true;
		this.username = username;
		this.password = password;
	};
	mxXmlRequest.prototype.url = null;
	mxXmlRequest.prototype.params = null;
	mxXmlRequest.prototype.method = null;
	mxXmlRequest.prototype.async = null;
	mxXmlRequest.prototype.username = null;
	mxXmlRequest.prototype.password = null;
	mxXmlRequest.prototype.request = null;
	mxXmlRequest.prototype.isReady = function() {
		return this.request.readyState == 4;
	}
	mxXmlRequest.prototype.getDocumentElement = function() {
		var doc = this.getXml();
		if (doc != null) {
			return doc.documentElement;
		}
		return null;
	};
	mxXmlRequest.prototype.getXml = function() {
		var xml = this.request.responseXML;
		if (xml == null || xml.documentElement == null) {
			xml = mxUtils.parseXml(this.request.responseText);
		}
		return xml;
	};
	mxXmlRequest.prototype.getText = function() {
		return this.request.responseText;
	};
	mxXmlRequest.prototype.getStatus = function() {
		return this.request.status;
	};
	mxXmlRequest.prototype.create = function() {
		if (window.XMLHttpRequest) {
			return function() {
				return new XMLHttpRequest();
			};
		} else if (typeof(ActiveXObject) != "undefined") {
			return function() {
				return new ActiveXObject("Microsoft.XMLHTTP");
			};
		}
	}();
	mxXmlRequest.prototype.send = function(onload, onerror) {
		this.request = this.create();
		if (this.request != null) {
			var self = this;
			this.request.onreadystatechange = function() {
				if (self.isReady()) {
					if (onload != null) {
						onload(self);
					}
				}
			}
// alert(this.url);
			this.request.open(this.method, this.url, this.async, this.username,
					this.password);
			this.setRequestHeaders(this.request, this.params);
			this.request.send(this.params);
		}
	};
	mxXmlRequest.prototype.setRequestHeaders = function(request, params) {
		if (params != null) {
			request.setRequestHeader('Content-Type',
					'application/x-www-form-urlencoded');
		}
	};
	mxXmlRequest.prototype.simulate = function(doc, target) {
		doc = doc || document;
		var old = null;
		if (doc == document) {
			old = window.onbeforeunload;
			window.onbeforeunload = null;
		}
		var form = doc.createElement('form');
		form.setAttribute('method', this.method);
		form.setAttribute('action', this.url);
		if (target != null) {
			form.setAttribute('target', target);
		}
		form.style.display = 'none';
		form.style.visibility = 'hidden';
		var pars = (this.params.indexOf('&') > 0)
				? this.params.split('&')
				: this.params.split();
		for (var i = 0; i < pars.length; i++) {
			var pos = pars[i].indexOf('=');
			if (pos > 0) {
				var name = pars[i].substring(0, pos);
				var value = pars[i].substring(pos + 1);
				var textarea = doc.createElement('textarea');
				textarea.setAttribute('name', name);
				value = value.replace(/\n/g, '&#xa;');
				var content = doc.createTextNode(value);
				textarea.appendChild(content);
				form.appendChild(textarea);
			}
		}
		doc.body.appendChild(form);
		form.submit();
		doc.body.removeChild(form);
		if (old != null) {
			window.onbeforeunload = old;
		}
	};
}

var mxClipboard = {
	STEPSIZE : 10,
	insertCount : 1,
	cells : null,
	isEmpty : function() {
		return mxClipboard.cells == null;
	},
	cut : function(graph, cells) {
			// cells = mxClipboard.copy(graph, cells);
			// mxClipboard.insertCount = 0;
			// mxClipboard.removeCells(graph, cells);
			// return cells;
			// xiaoxiong 20120910 添加一个ajax请求
			// 调用verificationIsHasNotDealWf方法获取所要剪切组建是否存在正在活动的流程 如果存在 则给出提示
			// 不允许剪切
			var modelID = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue() ;
			if(modelID == ''){
				cells = mxClipboard.copy(graph, cells);
				mxClipboard.insertCount = 0;
				mxClipboard.removeCells(graph, cells);
				return cells;
			} else {
				includeEdges = true;
				var cells = null;
				if (cells == null) {
					cells = graph.getDeletableCells(graph.getSelectionCells());
				}
				if (includeEdges) {
					cells = graph.getDeletableCells(graph.addAllEdges(cells));
				}
				var tempcells = [];
				cells.sort();
				for(var i = cells.length-1;i>-1;i--){
					if((!tempcells[tempcells.length-1])||cells[i].getId()!=tempcells[tempcells.length-1].getId()){
						tempcells.push(cells[i]); 
					}
				}
										
				var edges = '';
				var others = '';
				var otherNames = '' ;
				for(var j=0;j<tempcells.length;j++){
					if(tempcells[j].isEdge()){
						edges += ',' + tempcells[j].getId();
					}else{
						others += ',' + tempcells[j].getId();
						otherNames += ',' + tempcells[j].getValue();
					}
				}
				var postData = "modelID="+modelID+"&otherNames="+otherNames+"&others="+others ;
				$.post( $.appClient.generateUrl({ESTransferFlow : 'verificationIsHasNotDealWf'}, 'x')
						,{data:postData}, function(res){
							var tempJson = eval('(' + res + ')');
							if(tempJson.has=='false'){
								cells = mxClipboard.copy(graph, cells);
								mxClipboard.insertCount = 0;
								mxClipboard.removeCells(graph, cells);
								return cells;
							} else {
								$.dialog.notice({icon : 'error',content : tempJson.msg.substring(0,tempJson.msg.length-3)+'剪切！',title : '3秒后自动关闭',time : 3});
							}
				});
			}
			
	},
	removeCells : function(graph, cells) {
		graph.removeCells(cells);
	},
	copy : function(graph, cells) {
		cells = cells || graph.getSelectionCells();
		var result = graph.getExportableCells(cells);
		mxClipboard.insertCount = 1;
		mxClipboard.cells = graph.cloneCells(result);
		return result;
	},
	paste : function(graph) {
		if (mxClipboard.cells != null) {
			var cells = graph.getImportableCells(mxClipboard.cells);
			var delta = mxClipboard.insertCount * mxClipboard.STEPSIZE;
			var parent = graph.getDefaultParent();
			cells = graph.importCells(cells, delta, delta, parent);
			mxClipboard.insertCount++;
			graph.setSelectionCells(cells);
		}
	}
};

{
	function mxWindow(title, content, x, y, width, height, minimizable,
			movable, replaceNode, style) {
		if (content != null) {
			minimizable = (minimizable != null) ? minimizable : true;
			this.content = content;
			this.init(x, y, width, height, style);
			this.installMaximizeHandler();
			this.installMinimizeHandler();
			this.installCloseHandler();
			this.setMinimizable(minimizable);
			mxUtils.write(this.title, title || '');
			if (movable == null || movable) {
				this.installMoveHandler();
			}
			if (replaceNode != null && replaceNode.parentNode != null) {
				replaceNode.parentNode.replaceChild(this.div, replaceNode);
			} else {
				document.body.appendChild(this.div);
			}
		}
	};
	mxWindow.prototype = new mxEventSource();
	mxWindow.prototype.constructor = mxWindow;
	mxWindow.prototype.closeImage = mxClient.imageBasePath + 'close.gif';
	mxWindow.prototype.minimizeImage = mxClient.imageBasePath + 'minimize.gif';
	mxWindow.prototype.normalizeImage = mxClient.imageBasePath
			+ 'normalize.gif';
	mxWindow.prototype.maximizeImage = mxClient.imageBasePath + 'maximize.gif';
	mxWindow.prototype.resizeImage = mxClient.imageBasePath + 'resize.gif';
	mxWindow.prototype.visible = false;
	mxWindow.prototype.content = false;
	mxWindow.prototype.minimumSize = new mxRectangle(0, 0, 50, 40);
	mxWindow.prototype.content = false;
	mxWindow.prototype.destroyOnClose = true;
	mxWindow.prototype.init = function(x, y, width, height, style) {
		style = (style != null) ? style : 'mxWindow';
		this.div = document.createElement('div');
		this.div.className = style;
		this.div.style.left = x + 'px';
		this.div.style.top = y + 'px';
		if (!true && mxClient.WINDOW_SHADOWS) {
			this.shadow = document.createElement('div');
			this.shadow.style.background = mxConstants.SVG_SHADOWCOLOR;
			mxUtils.setOpacity(this.shadow, 70);
			this.shadow.style.position = 'absolute';
			this.shadow.style.display = 'inline';
		} else if (true && !mxClient.WINDOW_SHADOWS) {
			this.div.style.filter = '';
		}
		this.table = document.createElement('table');
		this.table.className = style;
		if (width != null) {
			if (!true) {
				this.div.style.width = width + 'px';
			}
			this.table.style.width = width + 'px';
		}
		if (height != null) {
			if (!true) {
				this.div.style.height = height + 'px';
			}
			this.table.style.height = height + 'px';
		}
		var tbody = document.createElement('tbody');
		var tr = document.createElement('tr');
		this.title = document.createElement('td');
		this.title.className = style + 'Title';
		tr.appendChild(this.title);
		tbody.appendChild(tr);
		tr = document.createElement('tr');
		this.td = document.createElement('td');
		this.td.className = style + 'Pane';
		this.contentWrapper = document.createElement('div');
		this.contentWrapper.className = style + 'Pane';
		this.contentWrapper.style.width = '100%';
		this.contentWrapper.appendChild(this.content);

		if (true || this.content.nodeName.toUpperCase() != 'DIV') {
			this.contentWrapper.style.height = '100%';
		}
		this.td.appendChild(this.contentWrapper);
		tr.appendChild(this.td);
		tbody.appendChild(tr);
		this.table.appendChild(tbody);
		this.div.appendChild(this.table);
		var self = this;
		var activator = function(evt) {
			self.activate();
		};
		mxEvent.addListener(this.title, 'mousedown', activator);
		mxEvent.addListener(this.table, 'mousedown', activator);
		if (this.shadow != null) {
			mxEvent.addListener(this.div, 'DOMNodeInserted', function(evt) {
						var node = mxEvent.getSource(evt);
						var loadHandler = function(evt) {
							mxEvent.removeListener(node, 'load', loadHandler);
							self.updateShadow();
						};
						mxEvent.addListener(node, 'load', loadHandler);
						self.updateShadow();
					});
		}
		this.hide();
	};
	mxWindow.prototype.setScrollable = function(scrollable) {
		if (scrollable) {
			this.contentWrapper.style.overflow = 'auto'
		} else {
			this.contentWrapper.style.overflow = 'hidden'
		}
	};
	mxWindow.prototype.updateShadow = function() {
		if (this.shadow != null) {
			this.shadow.style.display = this.div.style.display;
			this.shadow.style.left = (parseInt(this.div.style.left) + 3) + 'px';
			this.shadow.style.top = (parseInt(this.div.style.top) + 3) + 'px';
			this.shadow.style.width = this.div.offsetWidth + 'px';
			this.shadow.style.height = this.div.offsetHeight + 'px';
			if (this.shadow.parentNode != this.div.parentNode) {
				this.div.parentNode.appendChild(this.shadow);
			}
		}
	};
	mxWindow.prototype.activate = function() {
		if (mxWindow.activeWindow != this) {
			var style = mxUtils.getCurrentStyle(this.getElement());
			var index = (style != null) ? style.zIndex : 3;
			if (mxWindow.activeWindow) {
				var elt = mxWindow.activeWindow.getElement();
				if (elt != null && elt.style != null) {
					elt.style.zIndex = index;
				}
			}
			var oldWindow = mxWindow.activeWindow;
			this.getElement().style.zIndex = index + 1;
			mxWindow.activeWindow = this;
			this.fireEvent(mxEvent.ACTIVATE, new mxEventObject([oldWindow]));
		}
	};
	mxWindow.prototype.getElement = function() {
		return this.div;
	};
	mxWindow.prototype.fit = function() {
		mxUtils.fit(this.div);
	};
	mxWindow.prototype.isResizable = function() {
		if (this.resize != null) {
			return this.resize.style.display != 'none';
		}
		return false;
	};
	mxWindow.prototype.setResizable = function(resizable) {
		if (resizable) {
			if (this.resize == null) {
				this.resize = document.createElement('img');
				this.resize.style.position = 'absolute';
				this.resize.style.bottom = '2px';
				this.resize.style.right = '2px';
				this.resize.setAttribute('src', mxClient.imageBasePath
								+ 'resize.gif');
				this.resize.style.cursor = 'nw-resize';
				var self = this;
				mxEvent.addListener(this.resize, 'mousedown', function(evt) {
							self.activate();
							var startX = evt.clientX;
							var startY = evt.clientY;
							var width = self.div.offsetWidth;
							var height = self.div.offsetHeight;

							var dragHandler = function(evt) {
								var dx = evt.clientX - startX;
								var dy = evt.clientY - startY;
								self.setSize(width + dx, height + dy);
								self.updateShadow();
								self.fireEvent(mxEvent.RESIZE, evt);
								mxEvent.consume(evt);
							};
							var dropHandler = function(evt) {
								mxEvent.removeListener(document, 'mousemove',
										dragHandler);
								mxEvent.removeListener(document, 'mouseup',
										dropHandler);
								self.fireEvent(mxEvent.RESIZE_END, evt);
								mxEvent.consume(evt);
							};
							mxEvent.addListener(document, 'mousemove',
									dragHandler);
							mxEvent.addListener(document, 'mouseup',
									dropHandler);
							self.fireEvent(mxEvent.RESIZE_START, evt);
							mxEvent.consume(evt);
						});
				this.div.appendChild(this.resize);
			} else {
				this.resize.style.display = 'inline';
			}
		} else if (this.resize != null) {
			this.resize.style.display = 'none';
		}
	};
	mxWindow.prototype.setSize = function(width, height) {
		width = Math.max(this.minimumSize.width, width);
		height = Math.max(this.minimumSize.height, height);
		if (!true) {
			this.div.style.width = width + 'px';
			this.div.style.height = height + 'px';
		}
		this.table.style.width = width + 'px';
		this.table.style.height = height + 'px';
		if (!true) {
			this.contentWrapper.style.height = (this.div.offsetHeight
					- this.title.offsetHeight - 2)
					+ 'px';
		}
	};
	mxWindow.prototype.setMinimizable = function(minimizable) {
		this.minimize.style.display = (minimizable) ? '' : 'none';
	};
	mxWindow.prototype.installMinimizeHandler = function() {
		this.minimize = document.createElement('img');
		this.minimize.setAttribute('src', this.minimizeImage);
		this.minimize.setAttribute('align', 'right');
		this.minimize.setAttribute('title', 'Minimize');
		this.minimize.style.cursor = 'pointer';
		this.minimize.style.marginRight = '1px';
		this.minimize.style.display = 'none';
		this.title.appendChild(this.minimize);
		var minimized = false;
		var maxDisplay = null;
		var height = null;
		var self = this;
		var funct = function(evt) {
			self.activate();
			if (!minimized) {
				minimized = true;
				self.minimize.setAttribute('src', self.normalizeImage);
				self.minimize.setAttribute('title', 'Normalize');
				self.contentWrapper.style.display = 'none';
				maxDisplay = self.maximize.style.display;
				self.maximize.style.display = 'none';
				height = self.table.style.height;
				if (!true) {
					self.div.style.height = self.title.offsetHeight + 'px';
				}
				self.table.style.height = self.title.offsetHeight + 'px';
				if (self.resize != null) {
					self.resize.style.visibility = 'hidden';
				}
				self.updateShadow();
				self.fireEvent(mxEvent.MINIMIZE, evt);
			} else {
				minimized = false;
				self.minimize.setAttribute('src', self.minimizeImage);
				self.minimize.setAttribute('title', 'Minimize');
				self.contentWrapper.style.display = '';
				self.maximize.style.display = maxDisplay;
				if (!true) {
					self.div.style.height = height;
				}
				self.table.style.height = height;
				if (self.resize != null) {
					self.resize.style.visibility = 'visible';
				}
				self.updateShadow();
				self.fireEvent(mxEvent.NORMALIZE, evt);
			}
			mxEvent.consume(evt);
		};
		mxEvent.addListener(self.minimize, 'mousedown', funct);
	};
	mxWindow.prototype.setMaximizable = function(maximizable) {
		this.maximize.style.display = (maximizable) ? '' : 'none';
	};
	mxWindow.prototype.installMaximizeHandler = function() {
		this.maximize = document.createElement('img');
		this.maximize.setAttribute('src', this.maximizeImage);
		this.maximize.setAttribute('align', 'right');
		this.maximize.setAttribute('title', 'Maximize');
		this.maximize.style.cursor = 'default';
		this.maximize.style.marginLeft = '1px';
		this.maximize.style.cursor = 'pointer';
		this.maximize.style.display = 'none';
		this.title.appendChild(this.maximize);
		var maximized = false;
		var x = null;
		var y = null;
		var height = null;
		var width = null;
		var self = this;
		var funct = function(evt) {
			self.activate();
			if (self.maximize.style.display != 'none') {
				if (!maximized) {
					maximized = true;
					self.maximize.setAttribute('src', self.normalizeImage);
					self.maximize.setAttribute('title', 'Normalize');
					self.contentWrapper.style.display = '';
					self.minimize.style.visibility = 'hidden';
					x = parseInt(self.div.style.left);
					y = parseInt(self.div.style.top);
					height = self.table.style.height;
					width = self.table.style.width;
					self.div.style.left = '0px';
					self.div.style.top = '0px';
					if (!true) {
						self.div.style.height = (document.body.clientHeight - 2)
								+ 'px';
						self.div.style.width = (document.body.clientWidth - 2)
								+ 'px';
					}
					self.table.style.width = (document.body.clientWidth - 2)
							+ 'px';
					self.table.style.height = (document.body.clientHeight - 2)
							+ 'px';
					if (self.resize != null) {
						self.resize.style.visibility = 'hidden';
					}
					if (self.shadow != null) {
						self.shadow.style.display = 'none';
					}
					if (!true) {
						var style = mxUtils
								.getCurrentStyle(self.contentWrapper);
						if (style.overflow == 'auto' || self.resize != null) {
							self.contentWrapper.style.height = (self.div.offsetHeight
									- self.title.offsetHeight - 2)
									+ 'px';
						}
					}
					self.fireEvent(mxEvent.MAXIMIZE, evt);
				} else {
					maximized = false;
					self.maximize.setAttribute('src', self.maximizeImage);
					self.maximize.setAttribute('title', 'Maximize');
					self.contentWrapper.style.display = '';
					self.minimize.style.visibility = '';
					self.div.style.left = x + 'px';
					self.div.style.top = y + 'px';
					if (!true) {
						self.div.style.height = height;
						self.div.style.width = width;
						var style = mxUtils
								.getCurrentStyle(self.contentWrapper);
						if (style.overflow == 'auto' || self.resize != null) {
							self.contentWrapper.style.height = (self.div.offsetHeight
									- self.title.offsetHeight - 2)
									+ 'px';
						}
					}
					self.table.style.height = height;
					self.table.style.width = width;
					if (self.resize != null) {
						self.resize.style.visibility = 'visible';
					}
					self.updateShadow();
					self.fireEvent(mxEvent.NORMALIZE, evt);
				}
				mxEvent.consume(evt);
			}
		};
		mxEvent.addListener(this.maximize, 'mousedown', funct);
		mxEvent.addListener(this.title, 'dblclick', funct);
	};
	mxWindow.prototype.installMoveHandler = function() {
		this.title.style.cursor = 'move';
		var self = this;
		mxEvent.addListener(this.title, 'mousedown', function(evt) {
					var startX = evt.clientX;
					var startY = evt.clientY;
					var x = self.getX();
					var y = self.getY();

					var dragHandler = function(evt) {
						var dx = evt.clientX - startX;
						var dy = evt.clientY - startY;
						self.setLocation(x + dx, y + dy);
						self.fireEvent(mxEvent.MOVE, evt);
						mxEvent.consume(evt);
					};
					var dropHandler = function(evt) {
						mxEvent.removeListener(document, 'mousemove',
								dragHandler);
						mxEvent
								.removeListener(document, 'mouseup',
										dropHandler);
						self.fireEvent(mxEvent.MOVE_END, evt);
						mxEvent.consume(evt);
					};
					mxEvent.addListener(document, 'mousemove', dragHandler);
					mxEvent.addListener(document, 'mouseup', dropHandler);
					self.fireEvent(mxEvent.MOVE_START, evt);
					mxEvent.consume(evt);
				});
	};
	mxWindow.prototype.setLocation = function(x, y) {
		this.div.style.left = x + 'px';
		this.div.style.top = y + 'px';
		this.updateShadow();
	};
	mxWindow.prototype.getX = function() {
		return parseInt(this.div.style.left);
	};
	mxWindow.prototype.getY = function() {
		return parseInt(this.div.style.top);
	};
	mxWindow.prototype.installCloseHandler = function() {
		this.closeImg = document.createElement('img');
		this.closeImg.setAttribute('src', this.closeImage);
		this.closeImg.setAttribute('align', 'right');
		this.closeImg.setAttribute('title', 'Close');
		this.closeImg.style.marginLeft = '2px';
		this.closeImg.style.cursor = 'pointer';
		this.closeImg.style.display = 'none';
		this.title.insertBefore(this.closeImg, this.title.firstChild);
		var self = this;
		mxEvent.addListener(this.closeImg, 'mousedown', function(evt) {
					self.fireEvent(mxEvent.CLOSE, evt);
					if (self.destroyOnClose) {
						self.destroy();
					} else {
						self.setVisible(false);
					}
					mxEvent.consume(evt);
				});
	};
	mxWindow.prototype.setImage = function(image) {
		this.image = document.createElement('img');
		this.image.setAttribute('src', image);
		this.image.setAttribute('align', 'left');
		this.image.style.marginRight = '4px';
		this.image.style.marginLeft = '0px';
		this.image.style.marginTop = '-2px';
		this.title.insertBefore(this.image, this.title.firstChild);
	};
	mxWindow.prototype.setClosable = function(closable) {
		this.closeImg.style.display = (closable) ? '' : 'none';
	};
	mxWindow.prototype.isVisible = function() {
		if (this.div != null) {
			return this.div.style.display != 'none';
		}
		return false;
	};
	mxWindow.prototype.setVisible = function(visible) {
		if (this.div != null && this.isVisible() != visible) {
			if (visible) {
				this.show();
			} else {
				this.hide();
			}
		}
		this.updateShadow();
	};
	mxWindow.prototype.show = function() {
		this.div.style.display = '';
		this.activate();
		var style = mxUtils.getCurrentStyle(this.contentWrapper);
		if (!true && (style.overflow == 'auto' || this.resize != null)) {
			this.contentWrapper.style.height = (this.div.offsetHeight
					- this.title.offsetHeight - 2)
					+ 'px';
		}
		this.fireEvent(mxEvent.SHOW);
	};
	mxWindow.prototype.hide = function() {
		this.div.style.display = 'none';
		this.fireEvent(mxEvent.HIDE);
	};
	mxWindow.prototype.destroy = function() {
		this.fireEvent(mxEvent.DESTROY);
		if (this.div != null) {
			mxEvent.release(this.div);
			this.div.parentNode.removeChild(this.div);
			this.div = null;
		}
		if (this.shadow != null) {
			this.shadow.parentNode.removeChild(this.shadow);
			this.shadow = null;
		}
		this.title = null;
		this.content = null;
		this.contentWrapper = null;
	};
}

{
	function mxForm(className) {
		this.table = document.createElement('table');
		this.table.className = className;
		this.body = document.createElement('tbody');
		this.table.appendChild(this.body);
	};
	mxForm.prototype.table = null;
	mxForm.prototype.body = false;
	mxForm.prototype.getTable = function() {
		return this.table;
	};
	mxForm.prototype.addButtons = function(okFunct, cancelFunct) {
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		tr.appendChild(td);
		td = document.createElement('td');
		var button = document.createElement('button');
		mxUtils.write(button, mxResources.get('ok') || 'OK');
		td.appendChild(button);
		var self = this;
		mxEvent.addListener(button, 'click', function() {
					okFunct();
				});
		button = document.createElement('button');
		mxUtils.write(button, mxResources.get('cancel') || 'Cancel');
		td.appendChild(button);
		mxEvent.addListener(button, 'click', function() {
					cancelFunct();
				});
		tr.appendChild(td);
		this.body.appendChild(tr);
	};
	mxForm.prototype.addText = function(name, value) {
		var input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.value = value;
		return this.addField(name, input);
	};
	mxForm.prototype.addCheckbox = function(name, value) {
		var input = document.createElement('input');
		input.setAttribute('type', 'checkbox');
		this.addField(name, input);
		if (value) {
			input.checked = true;
		}
		return input;
	};
	mxForm.prototype.addTextarea = function(name, value, rows) {
		var input = document.createElement('textarea');
		if(!mxClient.IS_IE) {
			rows--;
		}
		input.setAttribute('rows', rows || 2);
		input.value = value;
		return this.addField(name, input);
	};
	mxForm.prototype.addCombo = function(name, isMultiSelect, size) {
		var select = document.createElement('select');
		if (size != null) {
			select.setAttribute('size', size);
		}
		if (isMultiSelect) {
			select.setAttribute('multiple', 'true');
		}
		return this.addField(name, select);
	};
	mxForm.prototype.addOption = function(combo, label, value, isSelected) {
		var option = document.createElement('option');
		mxUtils.writeln(option, label);
		option.setAttribute('value', value);
		if (isSelected) {
			option.setAttribute('selected', isSelected);
		}
		combo.appendChild(option);
	};
	mxForm.prototype.addField = function(name, input) {
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		mxUtils.write(td, name);
		tr.appendChild(td);
		td = document.createElement('td');
		td.appendChild(input);
		tr.appendChild(td);
		this.body.appendChild(tr);
		return input;
	};
}

{
	function mxImage(src, width, height) {
		this.src = src;
		this.width = width;
		this.height = height;
	};
	mxImage.prototype.src = null;
	mxImage.prototype.width = null;
	mxImage.prototype.height = null;
}

{
	function mxDivResizer(div, container) {
		if (div.nodeName.toLowerCase() == 'div') {
			if (container == null) {
				container = window;
			}
			this.div = div;
			var style = mxUtils.getCurrentStyle(div);
			if (style != null) {
				this.resizeWidth = style.width == 'auto';
				this.resizeHeight = style.height == 'auto';
			}
			var self = this;
			mxEvent.addListener(container, 'resize', function(evt) {
						if (!self.handlingResize) {
							self.handlingResize = true;
							self.resize();
							self.handlingResize = false;
						}
					});
			this.resize();
		}
	};
	mxDivResizer.prototype.resizeWidth = true;
	mxDivResizer.prototype.resizeHeight = true;
	mxDivResizer.prototype.handlingResize = false;
	mxDivResizer.prototype.resize = function() {
		var w = this.getDocumentWidth();
		var h = this.getDocumentHeight();
		var l = parseInt(this.div.style.left);
		var r = parseInt(this.div.style.right);
		var t = parseInt(this.div.style.top);
		var b = parseInt(this.div.style.bottom);
		if (this.resizeWidth && !isNaN(l) && !isNaN(r) && l >= 0 && r >= 0
				&& w - r - l > 0) {
			this.div.style.width = (w - r - l) + 'px';
		}
		if (this.resizeHeight && !isNaN(t) && !isNaN(b) && t >= 0 && b >= 0
				&& h - t - b > 0) {
			this.div.style.height = (h - t - b) + 'px';
		}
	};
	mxDivResizer.prototype.getDocumentWidth = function() {
		return document.body.clientWidth;
	};
	mxDivResizer.prototype.getDocumentHeight = function() {
		return document.body.clientHeight;
	};
}

{
	function mxToolbar(container) {
		this.container = container;
	};
	mxToolbar.prototype = new mxEventSource();
	mxToolbar.prototype.constructor = mxToolbar;
	mxToolbar.prototype.container = null;
	mxToolbar.prototype.enabled = true;
	mxToolbar.prototype.noReset = false;
	mxToolbar.prototype.updateDefaultMode = true;
	mxToolbar.prototype.addItem = function(title, icon, funct, pressedIcon,
			style, factoryMethod) {
		var img = document.createElement((icon != null) ? 'img' : 'button');
		var initialClassName = style
				|| ((factoryMethod != null) ? 'mxToolbarMode' : 'mxToolbarItem');
		img.className = initialClassName;
		img.setAttribute('src', icon);
		if (title != null) {
			if (icon != null) {
				img.setAttribute('title', title);
			} else {
				mxUtils.write(img, title);
			}
		}
		this.container.appendChild(img);
		if (funct != null) {
			mxEvent.addListener(img, 'click', funct);
		}
		var self = this;

		mxEvent.addListener(img, 'mousedown', function(evt) {
					if (pressedIcon != null) {
						img.setAttribute('src', pressedIcon);
					} else {
						img.style.backgroundColor = 'gray';
					}
					if (factoryMethod != null) {
						if (self.menu == null) {
							self.menu = new mxPopupMenu();
							self.menu.init();
						}
						var last = self.currentImg;
						if (self.menu.isMenuShowing()) {
							self.menu.hideMenu();
						}
						if (last != img) {
							self.currentImg = img;
							self.menu.factoryMethod = factoryMethod;
							var point = new mxPoint(img.offsetLeft,
									img.offsetTop + img.offsetHeight);
							self.menu.popup(point.x, point.y, null, evt);
							if (self.menu.isMenuShowing()) {
								img.className = initialClassName + 'Selected'
								self.menu.hideMenu = function() {
									mxPopupMenu.prototype.hideMenu.apply(this);
									img.className = initialClassName;
									self.currentImg = null;
								};
							}
						}
					}
				});
		var mouseHandler = function(evt) {
			if (pressedIcon != null) {
				img.setAttribute('src', icon);
			} else {
				img.style.backgroundColor = '';
			}
		}
		mxEvent.addListener(img, 'mouseup', mouseHandler);
		mxEvent.addListener(img, 'mouseout', mouseHandler);
		return img;
	};
	mxToolbar.prototype.addCombo = function(style) {
		var div = document.createElement('div');
		div.style.display = 'inline';
		div.className = 'mxToolbarComboContainer';
		var select = document.createElement('select');
		select.className = style || 'mxToolbarCombo';
		div.appendChild(select);
		this.container.appendChild(div);
		return select;
	};
	mxToolbar.prototype.addActionCombo = function(title, style) {
		var select = document.createElement('select');
		select.className = style || 'mxToolbarCombo';
		this.addOption(select, title, null);
		mxEvent.addListener(select, 'change', function(evt) {
					var value = select.options[select.selectedIndex];
					select.selectedIndex = 0;
					if (value.funct != null) {
						value.funct(evt);
					}
				});
		this.container.appendChild(select);
		return select;
	};
	mxToolbar.prototype.addOption = function(combo, title, value) {
		var option = document.createElement('option');
		mxUtils.writeln(option, title);
		if (typeof(value) == 'function') {
			option.funct = value;
		} else {
			option.setAttribute('value', value);
		}
		combo.appendChild(option);
		return option;
	};
	mxToolbar.prototype.addSwitchMode = function(title, icon, funct,
			pressedIcon, style) {
		var img = document.createElement('img');
		img.initialClassName = style || 'mxToolbarMode';
		img.className = img.initialClassName;
		img.setAttribute('src', icon);
		img.altIcon = pressedIcon;
		if (title != null) {
			img.setAttribute('title', title);
		}
		var self = this;
		mxEvent.addListener(img, 'click', function(evt) {
			var tmp = self.selectedMode.altIcon;
			if (tmp != null) {
				self.selectedMode.altIcon = self.selectedMode
						.getAttribute('src');
				self.selectedMode.setAttribute('src', tmp);
			} else {
				self.selectedMode.className = self.selectedMode.initialClassName;
			}
			if (self.updateDefaultMode) {
				self.defaultMode = img;
			}
			self.selectedMode = img;
			var tmp = img.altIcon;
			if (tmp != null) {
				img.altIcon = img.getAttribute('src');
				img.setAttribute('src', tmp);
			} else {
				img.className = img.initialClassName + 'Selected';
			}
			self.fireEvent(mxEvent.SELECT, new mxEventObject([null]));
			funct();
		});
		this.container.appendChild(img);
		if (this.defaultMode == null) {
			this.defaultMode = img;
			this.selectedMode = img;
			var tmp = img.altIcon;
			if (tmp != null) {
				img.altIcon = img.getAttribute('src');
				img.setAttribute('src', tmp);
			} else {
				img.className = img.initialClassName + 'Selected';
			}
			funct();
		}
		return img;
	};
	mxToolbar.prototype.addMode = function(title, icon, funct, pressedIcon,
			style) {
		var img = document.createElement('img');
		img.initialClassName = style || 'mxToolbarMode';
		img.className = img.initialClassName;
		img.setAttribute('src', icon);
		img.altIcon = pressedIcon;
		if (title != null) {
			img.setAttribute('title', title);
		}
		if (this.enabled) {
			var self = this;
			mxEvent.addListener(img, 'click', function(evt) {
						self.selectMode(img, funct);
						self.noReset = false;
					});
			mxEvent.addListener(img, 'dblclick', function(evt) {
						self.selectMode(img, funct);
						self.noReset = true;
					});
			if (this.defaultMode == null) {
				this.defaultMode = img;
				this.selectedMode = img;
				var tmp = img.altIcon;
				if (tmp != null) {
					img.altIcon = img.getAttribute('src');
					img.setAttribute('src', tmp);
				} else {
					img.className = img.initialClassName + 'Selected';
				}
			}
		}
		this.container.appendChild(img);
		return img;
	};
	mxToolbar.prototype.selectMode = function(domNode, funct) {
		if (this.selectedMode != domNode) {
			var tmp = this.selectedMode.altIcon;
			if (tmp != null) {
				this.selectedMode.altIcon = this.selectedMode
						.getAttribute('src');
				this.selectedMode.setAttribute('src', tmp);
			} else {
				this.selectedMode.className = this.selectedMode.initialClassName;
			}
			this.selectedMode = domNode;
			var tmp = this.selectedMode.altIcon;
			if (tmp != null) {
				this.selectedMode.altIcon = this.selectedMode
						.getAttribute('src');
				this.selectedMode.setAttribute('src', tmp);
			} else {
				this.selectedMode.className = this.selectedMode.initialClassName
						+ 'Selected';
			}
			this.fireEvent(mxEvent.SELECT, new mxEventObject([funct]));
		}
	};
	mxToolbar.prototype.resetMode = function(forced) {
		if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {

			this.selectMode(this.defaultMode, null);
		}
	};
	mxToolbar.prototype.addSeparator = function(icon) {
		return this.addItem(null, icon, null);
	};
	mxToolbar.prototype.addBreak = function() {
		mxUtils.br(this.container);
	};
	mxToolbar.prototype.addLine = function() {
		var hr = document.createElement('hr');
		hr.style.marginRight = '6px';
		hr.setAttribute('size', '1');
		this.container.appendChild(hr);
	};
	mxToolbar.prototype.destroy = function() {
		mxEvent.release(this.container);
		this.container = null;
		this.defaultMode = null;
		this.selectedMode = null;
		if (this.menu != null) {
			this.menu.destroy();
		}
	};
}

{
	function mxSession(model, urlInit, urlPoll, urlNotify) {
		this.model = model;
		this.urlInit = urlInit;
		this.urlPoll = urlPoll;
		this.urlNotify = urlNotify;
		if (model != null) {
			this.codec = new mxCodec();
			this.codec.lookup = function(id) {
				return model.getCell(id);
			};
		}

		var self = this;
		model.addListener(mxEvent.NOTIFY, function(sender, evt) {
					var changes = evt.getArgAt(0);
					if (changes != null && self.debug
							|| (self.connected && !self.suspended)) {
						self.notify(self.encodeChanges(changes));
					}
				});
	};
	mxSession.prototype = new mxEventSource();
	mxSession.prototype.constructor = mxSession;
	mxSession.prototype.model = null;
	mxSession.prototype.urlInit = null;
	mxSession.prototype.urlPoll = null;
	mxSession.prototype.urlNotify = null;
	mxSession.prototype.codec = null;
	mxSession.prototype.linefeed = '\n';
	mxSession.prototype.escapePostData = true;
	mxSession.prototype.significantRemoteChanges = true;
	mxSession.prototype.sent = 0;
	mxSession.prototype.received = 0;
	mxSession.prototype.debug = false;
	mxSession.prototype.connected = false;
	mxSession.prototype.suspended = false;
	mxSession.prototype.polling = false;
	mxSession.prototype.start = function() {
		if (this.debug) {
			this.connected = true;
			this.fireEvent(mxEvent.CONNECT);
		} else if (!this.connected) {
			var self = this;
			this.get(this.urlInit, function(req) {
						self.connected = true;
						self.fireEvent(mxEvent.CONNECT);
						self.poll();
					});
		}
	};
	mxSession.prototype.suspend = function() {
		if (this.connected && !this.suspended) {
			this.suspended = true;
			this.fireEvent(mxEvent.SUSPEND);
		}
	};
	mxSession.prototype.resume = function(type, attr, value) {
		if (this.connected && this.suspended) {
			this.suspended = false;
			this.fireEvent(mxEvent.RESUME);
			if (!this.polling) {
				this.poll();
			}
		}
	};
	mxSession.prototype.stop = function(reason) {
		if (this.connected) {
			this.connected = false;
		}
		this.fireEvent(mxEvent.DISCONNECT, new mxEventObject([reason]));
	};
	mxSession.prototype.poll = function() {
		if (this.connected && !this.suspended && this.urlPoll != null) {
			this.polling = true;
			var self = this;
			this.get(this.urlPoll, function() {
						self.poll()
					});
		} else {
			this.polling = false;
		}
	};
	mxSession.prototype.notify = function(xml, onLoad, onError) {
		if (xml != null && xml.length > 0) {
			if (this.urlNotify != null) {
				if (this.debug) {
					mxLog.show();
					mxLog.debug('mxSession.notify: ' + this.urlNotify + ' xml='
							+ xml);
				} else {
					if (this.escapePostData) {
						xml = encodeURIComponent(xml);
					}
					mxUtils.post(this.urlNotify, 'xml=' + xml, onLoad, onError);
				}
			}
			this.sent += xml.length;
			this.fireEvent(mxEvent.NOTIFY, new mxEventObject([this.urlNotify,
							xml]));
		}
	};
	mxSession.prototype.get = function(url, onLoad, onError) {

		if (typeof(mxUtils) != 'undefined') {
			var self = this;
			var onErrorWrapper = function(ex) {
				if (onError != null) {
					onError(ex);
				} else {
					self.stop(ex);
				}
			};

			var req = mxUtils.get(url, function(req) {
						if (typeof(mxUtils) != 'undefined') {
							try {
								if (req.isReady() && req.getStatus() != 404) {
									self.received += req.getText().length;
									self.fireEvent(mxEvent.GET,
											new mxEventObject([url, req]));
									if (self.isValidResponse(req)) {
										if (req.getText().length > 0) {
											var node = req.getDocumentElement();
											if (node == null) {
												onErrorWrapper('Invalid response: '
														+ req.getText());
											} else {
												self.receive(node);
											}
										}
										if (onLoad != null) {
											onLoad(req);
										}
									}
								} else {
									onErrorWrapper('Response not ready');
								}
							} catch (ex) {
								onErrorWrapper(ex);
								throw ex;
							}
						}
					},

					function(req) {
						onErrorWrapper('Transmission error');
					});
		}
	};
	mxSession.prototype.isValidResponse = function(req) {

		return req.getText().indexOf('<?php') < 0;
	};
	mxSession.prototype.encodeChanges = function(changes) {
		var xml = '';
		for (var i = 0; i < changes.length; i++) {

			var node = this.codec.encode(changes[i]);
			xml += mxUtils.getXml(node, this.linefeed);
		}
		return xml;
	};
	mxSession.prototype.receive = function(node) {
		if (node != null && node.nodeType == mxConstants.NODETYPE_ELEMENT) {
			var name = node.nodeName.toLowerCase();
			if (name == 'state') {
				var tmp = node.firstChild;
				while (tmp != null) {
					this.receive(tmp);
					tmp = tmp.nextSibling;
				}

				var sid = node.getAttribute('namespace');
				this.model.prefix = sid + '-';
			} else if (name == 'delta') {
				var changes = this.decodeChanges(node);
				if (changes.length > 0) {
					var edit = this.createUndoableEdit(changes);
					this.model.fireEvent(mxEvent.UNDO,
							new mxEventObject([edit]));
					this.model.fireEvent(mxEvent.CHANGE,
							new mxEventObject([changes]));
					this.fireEvent(mxEvent.FIRED, new mxEventObject([changes]));
				}
			}
			this.fireEvent(mxEvent.RECEIVE, new mxEventObject([node]));
		}
	};
	mxSession.prototype.createUndoableEdit = function(changes) {
		var edit = new mxUndoableEdit(this.model, this.significantRemoteChanges);
		edit.changes = changes;
		edit.notify = function() {
			edit.source.fireEvent(mxEvent.CHANGE,
					new mxEventObject([edit.changes]));
			edit.source.fireEvent(mxEvent.NOTIFY,
					new mxEventObject([edit.changes]));
		}
		return edit;
	};
	mxSession.prototype.decodeChanges = function(node) {
		this.codec.document = node.ownerDocument;
		var changes = new Array();
		node = node.firstChild;
		while (node != null) {
			if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {

				var change = null;
				if (node.nodeName == 'mxRootChange') {
					var codec = new mxCodec(node.ownerDocument);
					change = codec.decode(node);
				} else {
					change = this.codec.decode(node);
				}
				if (change != null) {
					change.model = this.model;
					change.execute();
					changes.push(change);
				}
			}
			node = node.nextSibling;
		}
		return changes;
	};
}

{
	function mxUndoableEdit(source, significant) {
		this.source = source;
		this.changes = new Array();
		this.significant = (significant != null) ? significant : true;
	};
	mxUndoableEdit.prototype.source = null;
	mxUndoableEdit.prototype.changes = null;
	mxUndoableEdit.prototype.significant = null;
	mxUndoableEdit.prototype.undone = false;
	mxUndoableEdit.prototype.redone = false;
	mxUndoableEdit.prototype.isEmpty = function() {
		return this.changes.length == 0;
	}
	mxUndoableEdit.prototype.isSignificant = function() {
		return this.significant;
	};
	mxUndoableEdit.prototype.add = function(change) {
		this.changes.push(change);
	};
	mxUndoableEdit.prototype.notify = function() {
	};
	mxUndoableEdit.prototype.die = function() {
	};
	mxUndoableEdit.prototype.undo = function() {
		if (!this.undone) {
			var count = this.changes.length;
			for (var i = count - 1; i >= 0; i--) {
				var change = this.changes[i];
				if (change.execute != null) {
					change.execute();
				} else if (change.undo != null) {
					change.undo();
				}
			}
			this.undone = true;
			this.redone = false;
		}
		this.notify();
	};
	mxUndoableEdit.prototype.redo = function() {
		if (!this.redone) {
			var count = this.changes.length;
			for (var i = 0; i < count; i++) {
				var change = this.changes[i];
				if (change.execute != null) {
					change.execute();
				} else if (change.redo != null) {
					change.redo();
				}
			}
			this.undone = false;
			this.redone = true;
		}
		this.notify();
	};
}

{
	function mxUndoManager(size) {
		this.size = size || 100;
		this.reset();
	};
	mxUndoManager.prototype = new mxEventSource();
	mxUndoManager.prototype.constructor = mxUndoManager;
	mxUndoManager.prototype.size = null;
	mxUndoManager.prototype.history = null;
	mxUndoManager.prototype.indexOfNextAdd = 0;
	mxUndoManager.prototype.reset = function() {
		this.history = new Array();
		this.indexOfNextAdd = 0;
	};
	mxUndoManager.prototype.canUndo = function() {
		return this.indexOfNextAdd > 0;
	};
	mxUndoManager.prototype.undo = function() {
		while (this.indexOfNextAdd > 0) {
			var edit = this.history[--this.indexOfNextAdd];
			edit.undo();
			if (edit.isSignificant()) {
				this.fireEvent(mxEvent.UNDO, new mxEventObject([edit]));
				break;
			}
		}
	};
	mxUndoManager.prototype.canRedo = function() {
		return this.indexOfNextAdd < this.history.length;
	};
	mxUndoManager.prototype.redo = function() {
		var n = this.history.length;
		while (this.indexOfNextAdd < n) {
			var edit = this.history[this.indexOfNextAdd++];
			edit.redo();
			if (edit.isSignificant()) {
				this.fireEvent(mxEvent.REDO, new mxEventObject([edit]));
				break;
			}
		}
	};
	mxUndoManager.prototype.undoableEditHappened = function(undoableEdit) {
		this.trim();
		if (this.size > 0 && this.size == this.history.length) {
			this.history.shift();
		}
		this.history.push(undoableEdit);
		this.indexOfNextAdd = this.history.length;
		this.fireEvent(mxEvent.ADD, new mxEventObject([undoableEdit]));
	};
	mxUndoManager.prototype.trim = function() {
		if (this.history.length > this.indexOfNextAdd) {
			var edits = this.history.splice(this.indexOfNextAdd,
					this.history.length - this.indexOfNextAdd);
			for (var i = 0; i < edits.length; i++) {
				edits[i].die();
			}
		}
	};
}

{
	function mxPath(format) {
		this.format = format;
		this.path = new Array();
		this.translate = new mxPoint(0, 0);
	};
	mxPath.prototype.format = null;
	mxPath.prototype.translate = null;
	mxPath.prototype.path = null;
	mxPath.prototype.isVml = function() {
		return this.format == 'vml';
	};
	mxPath.prototype.getPath = function() {
		return this.path.join('');
	};
	mxPath.prototype.setTranslate = function(x, y) {
		this.translate = new mxPoint(x, y);
	};
	mxPath.prototype.moveTo = function(x, y) {
		if (this.isVml()) {
			this.path.push('m ', Math.floor(this.translate.x + x), ' ', Math
							.floor(this.translate.y + y), ' ');
		} else {
			this.path.push('M ', Math.floor(this.translate.x + x), ' ', Math
							.floor(this.translate.y + y), ' ');
		}
	};
	mxPath.prototype.lineTo = function(x, y) {
		if (this.isVml()) {
			this.path.push('l ', Math.floor(this.translate.x + x), ' ', Math
							.floor(this.translate.y + y), ' ');
		} else {
			this.path.push('L ', Math.floor(this.translate.x + x), ' ', Math
							.floor(this.translate.y + y), ' ');
		}
	};
	mxPath.prototype.curveTo = function(x1, y1, x2, y2, x, y) {
		if (this.isVml()) {
			this.path.push('c ', Math.floor(this.translate.x + x1), ' ', Math
							.floor(this.translate.y + y1), ' ', Math
							.floor(this.translate.x + x2), ' ', Math
							.floor(this.translate.y + y2), ' ', Math
							.floor(this.translate.x + x), ' ', Math
							.floor(this.translate.y + y), ' ');
		} else {
			this.path.push('C ', (this.translate.x + x1), ' ',
					(this.translate.y + y1), ' ', (this.translate.x + x2), ' ',
					(this.translate.y + y2), ' ', (this.translate.x + x), ' ',
					(this.translate.y + y), ' ');
		}
	};
	mxPath.prototype.write = function(string) {
		this.path.push(string, ' ');
	};
	mxPath.prototype.end = function() {
		if (this.format == 'vml') {
			this.path.push('e');
		}
	};
	mxPath.prototype.close = function() {
		if (this.format == 'vml') {
			this.path.push('x e');
		} else {
			this.path.push('Z');
		}
	};
}

{
	function mxPopupMenu(factoryMethod) {
		this.factoryMethod = factoryMethod;
	};
	mxPopupMenu.prototype.submenuImage = mxClient.imageBasePath + 'submenu.gif';
	mxPopupMenu.prototype.zIndex = 10006;
	mxPopupMenu.prototype.factoryMethod = true;
	mxPopupMenu.prototype.useLeftButtonForPopup = false;
	mxPopupMenu.prototype.enabled = true;
	mxPopupMenu.prototype.itemCount = 0;
	mxPopupMenu.prototype.init = function() {
		this.table = document.createElement('table');
		this.table.className = 'mxPopupMenu';
		this.tbody = document.createElement('tbody');
		this.table.appendChild(this.tbody);
		this.div = document.createElement('div');
		this.div.className = 'mxPopupMenu';
		this.div.style.display = 'inline';
		this.div.style.zIndex = this.zIndex;
		this.div.appendChild(this.table);
		if (!true && mxClient.MENU_SHADOWS) {
			this.shadow = document.createElement('div');
			this.shadow.className = 'mxPopupMenuShadow';
			this.shadow.style.zIndex = this.zIndex - 1;
			mxUtils.setOpacity(this.shadow, 70);
		} else if (true && !mxClient.MENU_SHADOWS) {
			this.div.style.filter = '';
		}
		mxEvent.disableContextMenu(this.div);
	};
	mxPopupMenu.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxPopupMenu.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxPopupMenu.prototype.isPopupTrigger = function(me) {
		return me.isPopupTrigger()
				|| (this.useLeftButtonForPopup && mxEvent.isLeftMouseButton(me
						.getEvent()));
	};
	mxPopupMenu.prototype.addItem = function(title, image, funct, parent) {
		parent = parent || this;
		this.itemCount++;
		var tr = document.createElement('tr');
		tr.className = 'mxPopupMenuItem';
		var col1 = document.createElement('td');
		col1.className = 'mxPopupMenuIcon';
		if (image != null) {
			var img = document.createElement('img');
			if (!true) {
				if (this.loading == null) {
					this.loading = 0;
				}
				this.loading++;
				var self = this;
				var loader = function() {
					mxEvent.removeListener(img, 'load', loader);
					self.loading--;
					if (self.loading == 0) {
						self.showShadow();
					}
				};
				mxEvent.addListener(img, 'load', loader);
			}
			img.src = image;
			col1.appendChild(img);
		}
		tr.appendChild(col1);
		var col2 = document.createElement('td');
		col2.className = 'mxPopupMenuItem';
		mxUtils.write(col2, title);
		col2.align = 'left';
		tr.appendChild(col2);
		var col3 = document.createElement('td');
		col3.style.width = '10px';
		col3.style.paddingRight = '6px';
		tr.appendChild(col3);
		if (parent.div == null) {
			this.createSubmenu(parent);
		}
		parent.tbody.appendChild(tr);
		var self = this;
		mxEvent.addListener(tr, 'mousedown', function(evt) {
					self.eventReceiver = tr;
					if (parent.activeRow != tr && parent.activeRow != parent) {
						if (parent.activeRow != null
								&& parent.activeRow.div.parentNode != null) {
							self.hideSubmenu(parent);
						}
						if (tr.div != null) {
							self.showSubmenu(parent, tr);
							parent.activeRow = tr;
						}
					}
					mxEvent.consume(evt);
				});
		mxEvent.addListener(tr, 'mouseup', function(evt) {

					if (self.eventReceiver == tr) {
						if (parent.activeRow != tr) {
							self.hideMenu();
						}
						if (funct != null) {
							funct(evt);
						}
					}
					self.eventReceiver = null;
					mxEvent.consume(evt);
				});
		mxEvent.addListener(tr, 'mousemove', function(evt) {
					if (parent.activeRow != tr && parent.activeRow != parent) {
						if (parent.activeRow != null
								&& parent.activeRow.div.parentNode != null) {
							self.hideSubmenu(parent);
						}
					}
					if(mxClient.IS_IE) {
						tr.style.backgroundColor = '#000066';
						tr.style.color = 'white';
					}
				});
		if(mxClient.IS_IE) {
			mxEvent.addListener(tr, 'mouseout', function(evt) {
						tr.style.backgroundColor = '';
						tr.style.color = '';
					});
		}
		return tr;
	};
	mxPopupMenu.prototype.createSubmenu = function(parent) {
		parent.table = document.createElement('table');
		parent.table.className = 'mxPopupMenu';
		parent.tbody = document.createElement('tbody');
		parent.table.appendChild(parent.tbody);
		parent.div = document.createElement('div');
		parent.div.className = 'mxPopupMenu';
		parent.div.style.position = 'absolute';
		parent.div.style.display = 'inline';
		parent.div.appendChild(parent.table);
		var img = document.createElement('img');
		img.setAttribute('src', this.submenuImage);
		td = parent.firstChild.nextSibling.nextSibling;
		td.appendChild(img);
	};
	mxPopupMenu.prototype.showSubmenu = function(parent, row) {
		if (row.div != null) {
			row.div.style.left = (parent.div.offsetLeft + row.offsetLeft
					+ row.offsetWidth - 1)
					+ 'px';
			row.div.style.top = (parent.div.offsetTop + row.offsetTop) + 'px';
			document.body.appendChild(row.div);
			var left = parseInt(row.div.offsetLeft);
			var width = parseInt(row.div.offsetWidth);
			var b = document.body;
			var d = document.documentElement;
			var right = (b.scrollLeft || d.scrollLeft)
					+ (b.clientWidth || d.clientWidth);
			if (left + width > right) {
				row.div.style.left = (parent.div.offsetLeft - width + ((true)
						? 6
						: -6))
						+ 'px';
			}
			mxUtils.fit(row.div);
		}
	};
	mxPopupMenu.prototype.addSeparator = function(parent) {
		parent = parent || this;
		var tr = document.createElement('tr');
		var col1 = document.createElement('td');
		col1.className = 'mxPopupMenuIcon';
		col1.style.padding = '0 0 0 0px';
		tr.appendChild(col1);
		var col2 = document.createElement('td');
		col2.style.padding = '0 0 0 0px';
		col2.setAttribute('colSpan', '2');
		var hr = document.createElement('hr');
		hr.setAttribute('size', '1');
		col2.appendChild(hr);
		tr.appendChild(col2);
		parent.tbody.appendChild(tr);
	};
	mxPopupMenu.prototype.popup = function(x, y, cell, evt) {
		if (this.div != null && this.tbody != null
				&& this.factoryMethod != null) {
			this.div.style.left = x + 'px';
			this.div.style.top = y + 'px';
			while (this.tbody.firstChild != null) {
				mxEvent.release(this.tbody.firstChild);
				this.tbody.removeChild(this.tbody.firstChild);
			}
			this.itemCount = 0;
			this.factoryMethod(this, cell, evt);
			if (this.itemCount > 0) {
				this.showMenu();
			}
		}
	};
	mxPopupMenu.prototype.isMenuShowing = function() {
		return this.div.parentNode == document.body;
	};
	mxPopupMenu.prototype.showMenu = function() {
		document.body.appendChild(this.div);
		mxUtils.fit(this.div);
		if (this.shadow != null) {
			if (!this.loading) {
				this.showShadow();
			}
		}
	};
	mxPopupMenu.prototype.showShadow = function() {
		if (this.shadow != null && this.div.parentNode == document.body) {
			this.shadow.style.left = (parseInt(this.div.style.left) + 3) + 'px';
			this.shadow.style.top = (parseInt(this.div.style.top) + 3) + 'px';
			this.shadow.style.width = this.div.offsetWidth + 'px';
			this.shadow.style.height = this.div.offsetHeight + 'px';
			document.body.appendChild(this.shadow);
		}
	};
	mxPopupMenu.prototype.hideMenu = function() {
		if (this.div != null) {
			if (this.div.parentNode != null) {
				this.div.parentNode.removeChild(this.div);
			}
			if (this.shadow != null) {
				if (this.shadow.parentNode != null) {
					this.shadow.parentNode.removeChild(this.shadow);
				}
			}
			this.hideSubmenu(this);
		}
	};
	mxPopupMenu.prototype.hideSubmenu = function(parent) {
		if (parent.activeRow != null) {
			this.hideSubmenu(parent.activeRow);
			if (parent.activeRow.div.parentNode != null) {
				parent.activeRow.div.parentNode
						.removeChild(parent.activeRow.div);
			}
			parent.activeRow = null;
		}
	};
	mxPopupMenu.prototype.destroy = function() {
		if (this.div != null) {
			mxEvent.release(this.div);
			if (this.div.parentNode != null) {
				this.div.parentNode.removeChild(this.div);
			}
			this.div = null;
		}
		if (this.shadow != null) {
			mxEvent.release(this.shadow);
			if (this.shadow.parentNode != null) {
				this.shadow.parentNode.removeChild(this.shadow);
			}
			this.shadow = null;
		}
	};
}

{
	function mxAutoSaveManager(graph) {
		var self = this;

		this.changeHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.graphModelChanged(evt.getArgAt(0));
			}
		};
		this.setGraph(graph);
	};
	mxAutoSaveManager.prototype = new mxEventSource();
	mxAutoSaveManager.prototype.constructor = mxAutoSaveManager;
	mxAutoSaveManager.prototype.graph = null;
	mxAutoSaveManager.prototype.autoSaveDelay = 10;
	mxAutoSaveManager.prototype.autoSaveThrottle = 2;
	mxAutoSaveManager.prototype.autoSaveThreshold = 5;
	mxAutoSaveManager.prototype.ignoredChanges = 0;
	mxAutoSaveManager.prototype.lastSnapshot = 0;
	mxAutoSaveManager.prototype.enabled = true;
	mxAutoSaveManager.prototype.changeHandler = null;
	mxAutoSaveManager.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxAutoSaveManager.prototype.setEnabled = function(value) {
		this.enabled = value;
	};
	mxAutoSaveManager.prototype.setGraph = function(graph) {
		if (this.graph != null) {
			this.graph.getModel().removeListener(this.changeHandler);
		}
		this.graph = graph;
		if (this.graph != null) {
			this.graph.getModel().addListener(mxEvent.CHANGE,
					this.changeHandler);
		}
	};
	mxAutoSaveManager.prototype.save = function() {
	};
	mxAutoSaveManager.prototype.graphModelChanged = function(changes) {
		var now = new Date().getTime();
		var dt = (now - this.lastSnapshot) / 1000;
		if (dt > this.autoSaveDelay
				|| (this.ignoredChanges >= this.autoSaveThreshold && dt > this.autoSaveThrottle)) {
			this.save();
			this.reset();
		} else {
			this.ignoredChanges++;
		}
	};
	mxAutoSaveManager.prototype.reset = function() {
		this.lastSnapshot = new Date().getTime();
		this.ignoredChanges = 0;
	};
	mxAutoSaveManager.prototype.destroy = function() {
		this.setGraph(null);
	};
}

{
	function mxShape() {
	};
	mxShape.prototype.SVG_STROKE_TOLERANCE = 8;
	mxShape.prototype.scale = 1;
	mxShape.prototype.dialect = null;
	mxShape.prototype.mixedModeHtml = true;
	mxShape.prototype.preferModeHtml = true;
	mxShape.prototype.bounds = null;
	mxShape.prototype.points = null;
	mxShape.prototype.node = null;
	mxShape.prototype.label = null;
	mxShape.prototype.innerNode = null;
	mxShape.prototype.style = null;
	mxShape.prototype.startOffset = null;
	mxShape.prototype.endOffset = null;
	mxShape.prototype.init = function(container) {
		if (this.node == null) {
			this.node = this.create(container);
			if (container != null) {
				container.appendChild(this.node);
			}
		}
		this.redraw();
		if (this.insertGradientNode != null) {

			var count = 0;
			var id = this.insertGradientNode.getAttribute('id');
			var gradient = document.getElementById(id);
			while (gradient != null
					&& gradient.ownerSVGElement != this.node.ownerSVGElement) {
				count++;
				id = this.insertGradientNode.getAttribute('id') + '-' + count;
				gradient = document.getElementById(id);
			}
			if (gradient == null) {
				this.insertGradientNode.setAttribute('id', id);
				this.node.ownerSVGElement.appendChild(this.insertGradientNode);
				gradient = this.insertGradientNode;
			}
			if (gradient != null) {
				var tmp = (this.innerNode != null) ? this.innerNode : this.node;
				if (tmp != null) {
					tmp.setAttribute('fill', 'url(#' + id + ')');
				}
			}
			if (this.insertGradientNode != null) {
				this.insertGradient(this.insertGradientNode);
				this.insertGradientNode = null;
			}
		}
	};
	mxShape.prototype.insertGradient = function(node) {
		if (node != null) {

			var count = 0;
			var id = node.getAttribute('id');
			var gradient = document.getElementById(id);
			while (gradient != null
					&& gradient.ownerSVGElement != this.node.ownerSVGElement) {
				count++;
				id = node.getAttribute('id') + '-' + count;
				gradient = document.getElementById(id);
			}
			if (gradient == null) {
				node.setAttribute('id', id);
				this.node.ownerSVGElement.appendChild(node);
				gradient = node;
			}
			if (gradient != null) {
				var tmp = (this.innerNode != null) ? this.innerNode : this.node;
				if (tmp != null) {
					tmp.setAttribute('fill', 'url(#' + id + ')');
				}
			}
		}
	};
	mxShape.prototype.isMixedModeHtml = function() {
		return this.mixedModeHtml && !this.isRounded && !this.isShadow
				&& this.gradient == null;
	};
	mxShape.prototype.create = function(container) {
		var node = null;
		if (this.dialect == mxConstants.DIALECT_SVG) {
			node = this.createSvg();
		} else if (this.dialect == mxConstants.DIALECT_STRICTHTML
				|| (this.preferModeHtml && this.dialect == mxConstants.DIALECT_PREFERHTML)
				|| (this.isMixedModeHtml() && this.dialect == mxConstants.DIALECT_MIXEDHTML)) {
			node = this.createHtml();
		} else {
			node = this.createVml();
		}
		return node;
	};
	mxShape.prototype.createHtml = function() {
		var node = document.createElement('DIV');
		this.configureHtmlShape(node);
		return node;
	};
	mxShape.prototype.destroy = function() {
		if (this.node != null) {
			mxEvent.release(this.node);
			if (this.node.parentNode != null) {
				this.node.parentNode.removeChild(this.node);
			}
			this.node = null;
		}
	};
	mxShape.prototype.apply = function(state) {
		var style = state.style;
		this.style = style;
		if (style != null) {
			this.fill = mxUtils.getValue(style, mxConstants.STYLE_FILLCOLOR,
					this.fill);
			this.gradient = mxUtils.getValue(style,
					mxConstants.STYLE_GRADIENTCOLOR, this.gradient);
			this.gradientDirection = mxUtils.getValue(style,
					mxConstants.STYLE_GRADIENT_DIRECTION,
					this.gradientDirection);
			this.opacity = mxUtils.getValue(style, mxConstants.STYLE_OPACITY,
					this.opacity);
			this.stroke = mxUtils.getValue(style,
					mxConstants.STYLE_STROKECOLOR, this.stroke);
			this.strokewidth = mxUtils.getValue(style,
					mxConstants.STYLE_STROKEWIDTH, this.strokewidth);
			this.isShadow = mxUtils.getValue(style, mxConstants.STYLE_SHADOW,
					this.isShadow);
			this.isDashed = mxUtils.getValue(style, mxConstants.STYLE_DASHED,
					this.isDashed);
			this.spacing = mxUtils.getValue(style, mxConstants.STYLE_SPACING,
					this.spacing);
			this.startSize = mxUtils.getValue(style,
					mxConstants.STYLE_STARTSIZE, this.startSize);
			this.endSize = mxUtils.getValue(style, mxConstants.STYLE_ENDSIZE,
					this.endSize);
			this.isRounded = mxUtils.getValue(style, mxConstants.STYLE_ROUNDED,
					this.isRounded);
			this.startArrow = mxUtils.getValue(style,
					mxConstants.STYLE_STARTARROW, this.startArrow);
			this.endArrow = mxUtils.getValue(style, mxConstants.STYLE_ENDARROW,
					this.endArrow);
			this.rotation = mxUtils.getValue(style, mxConstants.STYLE_ROTATION,
					this.rotation);
		}
	};
	mxShape.prototype.createSvgGroup = function(shape) {
		var g = document.createElementNS(mxConstants.NS_SVG, 'g');
		this.innerNode = document.createElementNS(mxConstants.NS_SVG, shape);
		this.configureSvgShape(this.innerNode);
		this.shadowNode = this.createSvgShadow(this.innerNode);
		if (this.shadowNode != null) {
			g.appendChild(this.shadowNode);
		}
		g.appendChild(this.innerNode);
		return g;
	};
	mxShape.prototype.createSvgShadow = function(node) {
		if (this.isShadow && this.fill != null) {
			var shadow = node.cloneNode(true);
			shadow.setAttribute('stroke', mxConstants.SVG_SHADOWCOLOR);
			shadow.setAttribute('fill', mxConstants.SVG_SHADOWCOLOR);
			shadow.setAttribute('transform', mxConstants.SVG_SHADOWTRANSFORM);
			return shadow;
		}
		return null;
	};
	mxShape.prototype.configureHtmlShape = function(node) {
		if (mxUtils.isVml(node)) {
			this.configureVmlShape(node);
		} else {
			node.style.position = 'absolute';
			node.style.overflow = 'hidden';
			var color = this.stroke;
			if (color != null) {
				node.style.borderColor = color;
			}
			if (this.isDashed) {
				node.style.borderStyle = 'dashed';
			} else if (this.strokewidth > 0) {
				node.style.borderStyle = 'solid';
			}
			node.style.borderWidth = this.strokewidth + 'px';
			color = this.fill;
			if (color != null) {
				node.style.backgroundColor = color;
			} else {
				node.style.background = 'url(\'' + mxClient.imageBasePath
						+ 'transparent.gif\')';
			}
			if (this.opacity != null) {
				mxUtils.setOpacity(node, this.opacity);
			}
		}
	};
	mxShape.prototype.configureVmlShape = function(node) {
		node.style.position = 'absolute';
		var color = this.stroke;
		if (color != null) {
			node.setAttribute('strokecolor', color);
		} else {
			node.setAttribute('stroked', 'false');
		}
		color = this.fill;
		if (color != null) {
			node.setAttribute('fillcolor', color);
			if (node.fillNode == null) {
				node.fillNode = document.createElement('vml:fill');
				node.appendChild(node.fillNode);
			}
			node.fillNode.setAttribute('color', color);
			if (this.gradient != null) {
				node.fillNode.setAttribute('type', 'gradient');
				node.fillNode.setAttribute('color2', this.gradient);
				var angle = '180';
				if (this.gradientDirection == mxConstants.DIRECTION_EAST) {
					angle = '270';
				} else if (this.gradientDirection == mxConstants.DIRECTION_WEST) {
					angle = '90';
				} else if (this.gradientDirection == mxConstants.DIRECTION_NORTH) {
					angle = '0';
				}
				node.fillNode.setAttribute('angle', angle);
			}
			if (this.opacity != null) {
				node.fillNode.setAttribute('opacity', this.opacity + '%');
				if (this.gradient != null) {
					node.fillNode
							.setAttribute('o:opacity2', this.opacity + '%');
				}
			}
		} else {
			node.setAttribute('filled', 'false');
			if (node.fillNode != null) {
				mxEvent.release(node.fillNode);
				node.removeChild(node.fillNode);
				node.fillNode = null;
			}
		}
		if ((this.isDashed || this.opacity != null) && this.strokeNode == null) {
			this.strokeNode = document.createElement('vml:stroke');
			node.appendChild(this.strokeNode);
		}
		if (this.strokeNode != null) {
			if (this.isDashed) {
				this.strokeNode.setAttribute('dashstyle', '2 2');
			} else {
				this.strokeNode.setAttribute('dashstyle', 'solid');
			}
			if (this.opacity != null) {
				this.strokeNode.setAttribute('opacity', this.opacity + '%');
			}
		}
		if (this.isShadow && this.fill != null) {
			if (this.shadowNode == null) {
				this.shadowNode = document.createElement('vml:shadow');
				this.shadowNode.setAttribute('on', 'true');
				node.appendChild(this.shadowNode);
			}
		}
		if (node.nodeName == 'vml:rect' && this.isRounded) {
			node.setAttribute('arcsize', '15%');
		}
	}
	mxShape.prototype.configureSvgShape = function(node) {
		var color = this.stroke;
		if (color != null) {
			node.setAttribute('stroke', color);
		} else {
			node.setAttribute('stroke', 'none');
		}
		color = this.fill;
		if (color != null) {
			if (this.gradient != null) {
				var id = this.getGradientId(color, this.gradient, this.opacity);
				if (this.gradientNode != null
						&& this.gradientNode.getAttribute('id') != id) {
					this.gradientNode = null;
					node.setAttribute('fill', '');
				}
				if (this.gradientNode == null) {
					this.gradientNode = this.createSvgGradient(id, color,
							this.gradient, this.opacity, node);
					node.setAttribute('fill', 'url(#' + id + ')');
				}
			} else {

				this.gradientNode = null;
				node.setAttribute('fill', color);
			}
		} else {
			node.setAttribute('fill', 'none');
		}
		if (this.isDashed) {
			node.setAttribute('stroke-dasharray', '3, 3');
		}
		if (this.opacity != null) {
			node.setAttribute('fill-opacity', this.opacity / 100);
			node.setAttribute('stroke-opacity', this.opacity / 100);
		}
	};
	mxShape.prototype.getGradientId = function(start, end, opacity) {
		var op = (opacity != null) ? opacity : 100;
		var dir = null;
		if (this.gradientDirection == null
				|| this.gradientDirection == mxConstants.DIRECTION_SOUTH) {
			dir = 'south';
		} else if (this.gradientDirection == mxConstants.DIRECTION_EAST) {
			dir = 'east';
		} else if (this.gradientDirection == mxConstants.DIRECTION_NORTH) {
			dir = 'north';
		} else if (this.gradientDirection == mxConstants.DIRECTION_WEST) {
			dir = 'west';
		}
		return 'mxGradient-' + start + '-' + end + '-' + op + '-' + dir;
	};
	mxShape.prototype.createSvgGradient = function(id, start, end, opacity,
			node) {
		var op = (opacity != null) ? opacity : 100;
		var gradient = this.insertGradientNode;
		if (gradient == null) {
			var gradient = document.createElementNS(mxConstants.NS_SVG,
					'linearGradient');
			gradient.setAttribute('id', id);
			gradient.setAttribute('x1', '0%');
			gradient.setAttribute('y1', '0%');
			gradient.setAttribute('x2', '0%');
			gradient.setAttribute('y2', '0%');
			if (this.gradientDirection == null
					|| this.gradientDirection == mxConstants.DIRECTION_SOUTH) {
				gradient.setAttribute('y2', '100%');
			} else if (this.gradientDirection == mxConstants.DIRECTION_EAST) {
				gradient.setAttribute('x2', '100%');
			} else if (this.gradientDirection == mxConstants.DIRECTION_NORTH) {
				gradient.setAttribute('y1', '100%');
			} else if (this.gradientDirection == mxConstants.DIRECTION_WEST) {
				gradient.setAttribute('x1', '100%');
			}
			var stop = document.createElementNS(mxConstants.NS_SVG, 'stop');
			stop.setAttribute('offset', '0%');
			stop.setAttribute('style', 'stop-color:' + start + ';stop-opacity:'
							+ (op / 100));
			gradient.appendChild(stop);
			stop = document.createElementNS(mxConstants.NS_SVG, 'stop');
			stop.setAttribute('offset', '100%');
			stop.setAttribute('style', 'stop-color:' + end + ';stop-opacity:'
							+ (op / 100));
			gradient.appendChild(stop);
		}

		this.insertGradientNode = gradient;
		return gradient;
	};
	mxShape.prototype.createPoints = function(moveCmd, lineCmd, curveCmd,
			isRelative) {
		var offsetX = (isRelative) ? this.bounds.x : 0;
		var offsetY = (isRelative) ? this.bounds.y : 0;
		var size = 20 * this.scale;
		var points = moveCmd + ' ' + Math.floor(this.points[0].x - offsetX)
				+ ' ' + Math.floor(this.points[0].y - offsetY) + ' ';
		for (var i = 1; i < this.points.length; i++) {
			var pt = this.points[i];
			var p0 = this.points[i - 1];
			if (isNaN(pt.x) || isNaN(pt.y)) {
				return null;
			}
			if (i == 1 && this.startOffset != null) {
				p0 = p0.clone();
				p0.x += this.startOffset.x;
				p0.y += this.startOffset.y;
			} else if (i == this.points.length - 1 && this.endOffset != null) {
				pt = pt.clone();
				pt.x += this.endOffset.x;
				pt.y += this.endOffset.y;
			}
			var dx = p0.x - pt.x;
			var dy = p0.y - pt.y;
			if ((this.isRounded && i < this.points.length - 1)
					&& (dx != 0 || dy != 0) && this.scale > 0.3) {

				var dist = Math.sqrt(dx * dx + dy * dy);
				var nx1 = dx * Math.min(size, dist / 2) / dist;
				var ny1 = dy * Math.min(size, dist / 2) / dist;
				points += lineCmd + ' ' + Math.floor(pt.x + nx1 - offsetX)
						+ ' ' + Math.floor(pt.y + ny1 - offsetY) + ' ';

				var pe = this.points[i + 1];
				dx = pe.x - pt.x;
				dy = pe.y - pt.y;
				dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
				var nx2 = dx * Math.min(size, dist / 2) / dist;
				var ny2 = dy * Math.min(size, dist / 2) / dist;
				points += curveCmd + ' ' + Math.floor(pt.x - offsetX) + ' '
						+ Math.floor(pt.y - offsetY) + ' '
						+ Math.floor(pt.x - offsetX) + ','
						+ Math.floor(pt.y - offsetY) + ' '
						+ Math.floor(pt.x + nx2 - offsetX) + ' '
						+ Math.floor(pt.y + ny2 - offsetY) + ' ';
			} else {
				points += lineCmd + ' ' + Math.floor(pt.x - offsetX) + ' '
						+ Math.floor(pt.y - offsetY) + ' ';
			}
		}
		return points;
	};
	mxShape.prototype.updateHtmlShape = function(node) {
		if (node != null) {
			if (mxUtils.isVml(node)) {
				this.updateVmlShape(node);
			} else {
				node.style.borderWidth = Math.max(1, Math
								.floor(this.strokewidth * this.scale))
						+ 'px';
				if (this.bounds != null) {
					node.style.left = Math.floor(this.bounds.x) + 'px';
					node.style.top = Math.floor(this.bounds.y) + 'px';
					node.style.width = Math.floor(this.bounds.width) + 'px';
					node.style.height = Math.floor(this.bounds.height) + 'px';
				}
			}
			if (this.points != null && this.bounds != null
					&& !mxUtils.isVml(node)) {
				if (this.divContainer == null) {
					this.divContainer = document.createElement('div');
					node.appendChild(this.divContainer);
				}
				node.style.borderStyle = 'none';
				while (this.divContainer.firstChild != null) {
					mxEvent.release(this.divContainer.firstChild);
					this.divContainer.removeChild(this.divContainer.firstChild);
				}
				if (this.points.length == 2) {
					var p0 = this.points[0];
					var pe = this.points[1];
					var dx = pe.x - p0.x;
					var dy = pe.y - p0.y;
					if (dx == 0 || dy == 0) {
						node.style.borderStyle = 'solid';
					} else {
						node.style.width = Math.floor(this.bounds.width + 1)
								+ 'px';
						node.style.height = Math.floor(this.bounds.height + 1)
								+ 'px';
						var length = Math.sqrt(dx * dx + dy * dy);
						var dotCount = 1 + (length / (20 * this.scale));
						var nx = dx / dotCount;
						var ny = dy / dotCount;
						var x = p0.x - this.bounds.x;
						var y = p0.y - this.bounds.y;
						for (var i = 0; i < dotCount; i++) {
							var tmp = document.createElement('DIV');
							tmp.style.position = 'absolute';
							tmp.style.overflow = 'hidden';
							tmp.style.left = Math.floor(x) + 'px';
							tmp.style.top = Math.floor(y) + 'px';
							tmp.style.width = Math.max(1, 2 * this.scale)
									+ 'px';
							tmp.style.height = Math.max(1, 2 * this.scale)
									+ 'px';
							tmp.style.backgroundColor = this.stroke;
							this.divContainer.appendChild(tmp);
							x += nx;
							y += ny;
						}
					}
				} else if (this.points.length == 3) {
					var mid = this.points[1];
					var n = '0';
					var s = '1';
					var w = '0';
					var e = '1';
					if (mid.x == this.bounds.x) {
						e = '0';
						w = '1';
					}
					if (mid.y == this.bounds.y) {
						n = '1';
						s = '0';
					}
					node.style.borderStyle = 'solid';
					node.style.borderWidth = n + ' ' + e + ' ' + s + ' ' + w
							+ 'px';
				} else {
					node.style.width = Math.floor(this.bounds.width + 1) + 'px';
					node.style.height = Math.floor(this.bounds.height + 1)
							+ 'px';
					var last = this.points[0];
					for (var i = 1; i < this.points.length; i++) {
						var next = this.points[i];
						var tmp = document.createElement('DIV');
						tmp.style.position = 'absolute';
						tmp.style.overflow = 'hidden';
						tmp.style.borderColor = this.stroke;
						tmp.style.borderStyle = 'solid';
						tmp.style.borderWidth = '1 0 0 1px';
						var x = Math.min(next.x, last.x) - this.bounds.x;
						var y = Math.min(next.y, last.y) - this.bounds.y;
						var w = Math.max(1, Math.abs(next.x - last.x));
						var h = Math.max(1, Math.abs(next.y - last.y));
						tmp.style.left = x + 'px';
						tmp.style.top = y + 'px';
						tmp.style.width = w + 'px';
						tmp.style.height = h + 'px';
						this.divContainer.appendChild(tmp);
						last = next;
					}
				}
			}
		}
	};
	mxShape.prototype.updateVmlShape = function(node) {
		node.setAttribute('strokeweight', this.strokewidth * this.scale);
		if (this.bounds != null) {
			node.style.left = Math.floor(this.bounds.x) + 'px';
			node.style.top = Math.floor(this.bounds.y) + 'px';
			node.style.width = Math.floor(this.bounds.width) + 'px';
			node.style.height = Math.floor(this.bounds.height) + 'px';
			if (this.points == null) {
				if (this.rotation != null && this.rotation != 0) {
					node.style.rotation = this.rotation;
				} else if (node.style.rotation != null) {
					node.style.rotation = '';
				}
			}
		}
		if (this.points != null) {
			if (node.nodeName == 'polyline' && node.points != null) {
				var points = '';
				for (var i = 0; i < this.points.length; i++) {
					points += this.points[i].x + ',' + this.points[i].y + ' ';
				}
				node.points.value = points;
				node.style.left = null;
				node.style.top = null;
				node.style.width = null;
				node.style.height = null;
			} else if (this.bounds != null) {
				this.node.setAttribute('coordsize', Math
								.floor(this.bounds.width)
								+ ',' + Math.floor(this.bounds.height));
				var points = this.createPoints('m', 'l', 'c', true);

				{

					{

					}

				}
				node.setAttribute('path', points + ' e');
			}
		}
	};
	mxShape.prototype.updateSvgShape = function(node) {
		var strokeWidth = Math.max(1, this.strokewidth * this.scale);
		node.setAttribute('stroke-width', strokeWidth);
		if (this.points != null && this.points[0] != null) {
			var d = this.createPoints('M', 'L', 'C', false);
			if (d != null) {
				node.setAttribute('d', d);

				{

					{
					}
				}
				node.removeAttribute('x');
				node.removeAttribute('y');
				node.removeAttribute('width');
				node.removeAttribute('height');
			}
		} else if (this.bounds != null) {
			node.setAttribute('x', this.bounds.x);
			node.setAttribute('y', this.bounds.y);
			var w = this.bounds.width;
			var h = this.bounds.height;
			w = w>0?w:0 ;
			h = h>0?h:0 ;
			node.setAttribute('width', w);
			node.setAttribute('height', h);
			if (this.isRounded) {
				var r = Math.min(w / 5, h / 5);
				node.setAttribute('rx', r);
				node.setAttribute('ry', r);
			}
			this.updateSvgTransform(node, node == this.shadowNode);
		}
	};
	mxShape.prototype.updateSvgTransform = function(node, shadow) {
		if (this.rotation != null && this.rotation != 0) {
			var cx = this.bounds.x + this.bounds.width / 2;
			var cy = this.bounds.y + this.bounds.height / 2;
			if (shadow) {
				node.setAttribute('transform', 'rotate(' + this.rotation + ','
								+ cx + ',' + cy + ') '
								+ mxConstants.SVG_SHADOWTRANSFORM);
			} else {
				node.setAttribute('transform', 'rotate(' + this.rotation + ','
								+ cx + ',' + cy + ')');
			}
		} else {
			if (shadow) {
				node.setAttribute('transform', mxConstants.SVG_SHADOWTRANSFORM);
			} else {
				node.removeAttribute('transform');
			}
		}
	};
	mxShape.prototype.reconfigure = function() {
		if (this.dialect == mxConstants.DIALECT_SVG) {
			if (this.innerNode != null) {
				this.configureSvgShape(this.innerNode);
			} else {
				this.configureSvgShape(this.node);
			}
			if (this.insertGradientNode != null) {
				this.insertGradient(this.insertGradientNode);
				this.insertGradientNode = null;
			}
		} else if (mxUtils.isVml(this.node)) {
			this.configureVmlShape(this.node);
		} else {
			this.configureHtmlShape(this.node);
		}
	};
	mxShape.prototype.redraw = function() {
		if (this.dialect == mxConstants.DIALECT_SVG) {
			this.redrawSvg();
		} else if (mxUtils.isVml(this.node)) {
			this.redrawVml();
		} else {
			this.redrawHtml();
		}
	};
	mxShape.prototype.redrawSvg = function() {
		if (this.innerNode != null) {
			this.updateSvgShape(this.innerNode);
			if (this.shadowNode != null) {
				this.updateSvgShape(this.shadowNode);
			}
		} else {
			this.updateSvgShape(this.node);
		}
	};
	mxShape.prototype.redrawVml = function() {
		this.updateVmlShape(this.node);
	};
	mxShape.prototype.redrawHtml = function() {
		this.updateHtmlShape(this.node);
	};
	mxShape.prototype.createPath = function(arg) {
		var x = this.bounds.x;
		var y = this.bounds.y;
		var w = this.bounds.width;
		var h = this.bounds.height;
		var path = null;
		if (this.dialect == mxConstants.DIALECT_SVG) {
			path = new mxPath('svg');
			path.setTranslate(x, y);
		} else {
			path = new mxPath('vml');
		}
		this.redrawPath(path, x, y, w, h, arg);
		return path.getPath();
	};
	mxShape.prototype.redrawPath = function(path, x, y, w, h) {
	};
}

{
	function mxActor(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxActor.prototype = new mxShape();
	mxActor.prototype.constructor = mxActor;
	mxActor.prototype.mixedModeHtml = false;
	mxActor.prototype.preferModeHtml = false;
	mxActor.prototype.createVml = function() {
		var node = document.createElement('vml:shape');
		this.configureVmlShape(node);
		return node;
	};
	mxActor.prototype.redrawVml = function() {
		this.updateVmlShape(this.node);
		var w = Math.floor(this.bounds.width);
		var h = Math.floor(this.bounds.height);
		var s = this.strokewidth * this.scale;
		this.node.setAttribute('coordsize', w + ',' + h);
		this.node.setAttribute('strokeweight', s);
		var d = this.createPath();
		this.node.setAttribute('path', d);
	};
	mxActor.prototype.createSvg = function() {
		return this.createSvgGroup('path');
	};
	mxActor.prototype.redrawSvg = function() {
		var strokeWidth = Math.max(1, this.strokewidth * this.scale);
		this.innerNode.setAttribute('stroke-width', strokeWidth);
		var d = this.createPath();
		this.innerNode.setAttribute('d', d);
		this.updateSvgTransform(this.innerNode, false);
		if (this.shadowNode != null) {
			this.shadowNode.setAttribute('stroke-width', strokeWidth);
			this.shadowNode.setAttribute('d', d);
			this.updateSvgTransform(this.shadowNode, true);
		}
	};
	mxActor.prototype.redrawPath = function(path, x, y, w, h) {
		var width = w / 3;
		path.moveTo(0, h);
		path.curveTo(0, 3 * h / 5, 0, 2 * h / 5, w / 2, 2 * h / 5);
		path.curveTo(w / 2 - width, 2 * h / 5, w / 2 - width, 0, w / 2, 0);
		path.curveTo(w / 2 + width, 0, w / 2 + width, 2 * h / 5, w / 2, 2 * h
						/ 5);
		path.curveTo(w, 2 * h / 5, w, 3 * h / 5, w, h);
		path.close();
	};
}

{
	function mxCloud(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxCloud.prototype = new mxActor();
	mxCloud.prototype.constructor = mxActor;
	mxCloud.prototype.redrawPath = function(path, x, y, w, h) {
		path.moveTo(0.25 * w, 0.25 * h);
		path.curveTo(0.05 * w, 0.25 * h, 0, 0.5 * h, 0.16 * w, 0.55 * h);
		path.curveTo(0, 0.66 * h, 0.18 * w, 0.9 * h, 0.31 * w, 0.8 * h);
		path.curveTo(0.4 * w, h, 0.7 * w, h, 0.8 * w, 0.8 * h);
		path.curveTo(w, 0.8 * h, w, 0.6 * h, 0.875 * w, 0.5 * h);
		path.curveTo(w, 0.3 * h, 0.8 * w, 0.1 * h, 0.625 * w, 0.2 * h);
		path.curveTo(0.5 * w, 0.05 * h, 0.3 * w, 0.05 * h, 0.25 * w, 0.25 * h);
		path.close();
	};
}

{
	function mxRectangleShape(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxRectangleShape.prototype = new mxShape();
	mxRectangleShape.prototype.constructor = mxRectangleShape;
	mxRectangleShape.prototype.createHtml = function() {
		var node = document.createElement('DIV');
		this.configureHtmlShape(node);
		return node;
	};
	mxRectangleShape.prototype.createVml = function() {
		var name = (this.isRounded) ? 'vml:roundrect' : 'vml:rect';
		var node = document.createElement(name);
		this.configureVmlShape(node);
		return node;
	};
	mxRectangleShape.prototype.createSvg = function() {
		var node = this.createSvgGroup('rect');

		if (this.strokewidth * this.scale >= 1 && !this.isRounded) {
			this.innerNode.setAttribute('shape-rendering', 'optimizeSpeed');
		}
		return node;
	};
}

{
	function mxEllipse(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxEllipse.prototype = new mxShape();
	mxEllipse.prototype.constructor = mxEllipse;
	mxEllipse.prototype.mixedModeHtml = false;
	mxEllipse.prototype.preferModeHtml = false;
	mxEllipse.prototype.createVml = function() {

		var node = document.createElement('vml:arc');
		node.setAttribute('startangle', '0');
		node.setAttribute('endangle', '360');
		this.configureVmlShape(node);
		return node;
	};
	mxEllipse.prototype.createSvg = function() {
		return this.createSvgGroup('ellipse');
	};
	mxEllipse.prototype.redrawSvg = function() {
		this.updateSvgNode(this.innerNode);
		this.updateSvgNode(this.shadowNode);
	};
	mxEllipse.prototype.updateSvgNode = function(node) {
		if (node != null) {
			var strokeWidth = Math.max(1, this.strokewidth * this.scale);
			node.setAttribute('stroke-width', strokeWidth);
			node.setAttribute('cx', this.bounds.x + this.bounds.width / 2);
			node.setAttribute('cy', this.bounds.y + this.bounds.height / 2);
			node.setAttribute('rx', this.bounds.width / 2);
			node.setAttribute('ry', this.bounds.height / 2);
		}
	};
}

{
	function mxDoubleEllipse(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxDoubleEllipse.prototype = new mxShape();
	mxDoubleEllipse.prototype.constructor = mxDoubleEllipse;
	mxDoubleEllipse.prototype.mixedModeHtml = false;
	mxDoubleEllipse.prototype.preferModeHtml = false;
	mxDoubleEllipse.prototype.createVml = function() {
		var node = document.createElement('vml:group');
		this.background = document.createElement('vml:arc');
		this.background.setAttribute('startangle', '0');
		this.background.setAttribute('endangle', '360');
		this.configureVmlShape(this.background);
		node.appendChild(this.background);
		this.label = this.background;
		this.isShadow = false;
		this.fill = null;
		this.foreground = document.createElement('vml:oval');
		this.configureVmlShape(this.foreground);
		node.appendChild(this.foreground);
		this.stroke = null;
		this.configureVmlShape(node);
		return node;
	};
	mxDoubleEllipse.prototype.redrawVml = function() {
		var x = Math.floor(this.bounds.x);
		var y = Math.floor(this.bounds.y);
		var w = Math.floor(this.bounds.width);
		var h = Math.floor(this.bounds.height);
		var s = this.strokewidth * this.scale;
		this.updateVmlShape(this.node);
		this.node.setAttribute('coordsize', w + ',' + h);
		this.updateVmlShape(this.background);
		this.background.setAttribute('strokeweight', s);
		this.background.style.top = '0px';
		this.background.style.left = '0px';
		this.updateVmlShape(this.foreground);
		this.foreground.setAttribute('strokeweight', s);
		var inset = 3 + s;
		this.foreground.style.top = inset + 'px';
		this.foreground.style.left = inset + 'px';
		this.foreground.style.width = Math.max(0, w - 2 * inset) + 'px';
		this.foreground.style.height = Math.max(0, h - 2 * inset) + 'px';
	};
	mxDoubleEllipse.prototype.createSvg = function() {
		var g = this.createSvgGroup('ellipse');
		this.foreground = document.createElementNS(mxConstants.NS_SVG,
				'ellipse');
		if (this.stroke != null) {
			this.foreground.setAttribute('stroke', this.stroke);
		} else {
			this.foreground.setAttribute('stroke', 'none');
		}
		this.foreground.setAttribute('fill', 'none');
		g.appendChild(this.foreground);
		return g;
	};
	mxDoubleEllipse.prototype.redrawSvg = function() {
		var s = this.strokewidth * this.scale;
		this.updateSvgNode(this.innerNode);
		this.updateSvgNode(this.shadowNode);
		this.updateSvgNode(this.foreground, 3 * this.scale + s);
	};
	mxDoubleEllipse.prototype.updateSvgNode = function(node, inset) {
		inset = (inset != null) ? inset : 0;
		if (node != null) {
			var strokeWidth = Math.max(1, this.strokewidth * this.scale);
			node.setAttribute('stroke-width', strokeWidth);
			node.setAttribute('cx', this.bounds.x + this.bounds.width / 2);
			node.setAttribute('cy', this.bounds.y + this.bounds.height / 2);
			node.setAttribute('rx', this.bounds.width / 2 - inset);
			node.setAttribute('ry', this.bounds.height / 2 - inset);
		}
	};
}

{
	function mxRhombus(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxRhombus.prototype = new mxShape();
	mxRhombus.prototype.constructor = mxRhombus;
	mxRhombus.prototype.mixedModeHtml = false;
	mxRhombus.prototype.preferModeHtml = false;
	mxRhombus.prototype.createHtml = function() {
		var node = null;
		if (mxClient.IS_CANVAS) {
			node = document.createElement('CANVAS');
			this.configureHtmlShape(node);
			node.style.borderStyle = 'none';
		} else {
			node = document.createElement('DIV');
			this.configureHtmlShape(node);
		}
		return node;
	};
	mxRhombus.prototype.createVml = function() {
		var node = document.createElement('vml:shape');
		this.configureVmlShape(node);
		return node;
	};
	mxRhombus.prototype.createSvg = function() {
		return this.createSvgGroup('path');
	}

	mxRhombus.prototype.redrawVml = function() {
		this.node.setAttribute('strokeweight', this.strokewidth * this.scale);
		this.updateVmlShape(this.node);
		var x = 0;
		var y = 0;
		var w = Math.floor(this.bounds.width);
		var h = Math.floor(this.bounds.height);
		this.node.setAttribute('coordsize', w + ',' + h);
		var points = 'm ' + Math.floor(x + w / 2) + ' ' + y + ' l ' + (x + w)
				+ ' ' + Math.floor(y + h / 2) + ' l ' + Math.floor(x + w / 2)
				+ ' ' + (y + h) + ' l ' + x + ' ' + Math.floor(y + h / 2);
		this.node.setAttribute('path', points + ' x e');
	};
	mxRhombus.prototype.redrawHtml = function() {
		if (this.node.nodeName == 'CANVAS') {
			this.redrawCanvas();
		} else {
			this.updateHtmlShape(this.node);
		}
	};
	mxRhombus.prototype.redrawCanvas = function() {
		this.updateHtmlShape(this.node);
		var x = 0;
		var y = 0;
		var w = this.bounds.width;
		var h = this.bounds.height;
		this.node.setAttribute('width', w);
		this.node.setAttribute('height', h);
		if (!this.isRepaintNeeded) {
			var ctx = this.node.getContext('2d');
			ctx.clearRect(0, 0, w, h);
			ctx.beginPath();
			ctx.moveTo(x + w / 2, y);
			ctx.lineTo(x + w, y + h / 2);
			ctx.lineTo(x + w / 2, y + h);
			ctx.lineTo(x, y + h / 2);
			ctx.lineTo(x + w / 2, y);
			if (this.node.style.backgroundColor != 'transparent') {
				ctx.fillStyle = this.node.style.backgroundColor;
				ctx.fill();
			}
			if (this.node.style.borderColor != null) {
				ctx.strokeStyle = this.node.style.borderColor;
				ctx.stroke();
			}
			this.isRepaintNeeded = false;
		}
	};
	mxRhombus.prototype.redrawSvg = function() {
		this.updateSvgNode(this.innerNode);
		if (this.shadowNode != null) {
			this.updateSvgNode(this.shadowNode);
		}
	};
	mxRhombus.prototype.updateSvgNode = function(node) {
		var strokeWidth = Math.max(1, this.strokewidth * this.scale);
		node.setAttribute('stroke-width', strokeWidth);
		var x = this.bounds.x;
		var y = this.bounds.y;
		var w = this.bounds.width;
		var h = this.bounds.height;
		var d = 'M ' + (x + w / 2) + ' ' + y + ' L ' + (x + w) + ' '
				+ (y + h / 2) + ' L ' + (x + w / 2) + ' ' + (y + h) + ' L ' + x
				+ ' ' + (y + h / 2) + ' Z ';
		node.setAttribute('d', d);
		this.updateSvgTransform(node, node == this.shadowNode);
	};
}

{
	function mxPolyline(points, stroke, strokewidth) {
		this.points = points;
		this.stroke = stroke || 'black';
		this.strokewidth = strokewidth || 1;
	};
	mxPolyline.prototype = new mxShape();
	mxPolyline.prototype.constructor = mxPolyline;
	mxPolyline.prototype.create = function() {
		var node = null;
		if (this.dialect == mxConstants.DIALECT_SVG) {
			node = this.createSvg();
		} else if (this.dialect == mxConstants.DIALECT_STRICTHTML
				|| (this.dialect == mxConstants.DIALECT_PREFERHTML
						&& this.points != null && this.points.length > 0)) {
			node = document.createElement('DIV');
			this.configureHtmlShape(node);
			node.style.borderStyle = 'none';
			node.style.background = '';
		} else {
			node = document.createElement('vml:polyline');
			this.configureVmlShape(node);
			var strokeNode = document.createElement('vml:stroke');
			if (this.opacity != null) {
				strokeNode.setAttribute('opacity', this.opacity + '%');
			}
			node.appendChild(strokeNode);
		}
		return node;
	};
	mxPolyline.prototype.createSvg = function() {
		var g = this.createSvgGroup('path');

		var color = this.innerNode.getAttribute('stroke');
		this.pipe = document.createElementNS(mxConstants.NS_SVG, 'path');
		this.pipe.setAttribute('stroke', color);
		this.pipe.setAttribute('visibility', 'hidden');
		this.pipe.setAttribute('pointer-events', 'stroke');
		g.appendChild(this.pipe);
		return g;
	};
	mxPolyline.prototype.redrawSvg = function() {
		this.updateSvgShape(this.innerNode);
		var d = this.innerNode.getAttribute('d')
		if (d != null) {
			this.pipe.setAttribute('d', d);
			var strokeWidth = this.strokewidth * this.scale;
			if (mxConstants.SVG_CRISP_EDGES
					&& strokeWidth == Math.floor(strokeWidth)
					&& !this.isRounded) {
				this.innerNode.setAttribute('shape-rendering', 'optimizeSpeed');
			} else {
				this.innerNode.setAttribute('shape-rendering', 'auto');
			}
			this.pipe.setAttribute('stroke-width', strokeWidth
							+ mxShape.prototype.SVG_STROKE_TOLERANCE);
		}
	};
}

{
	function mxArrow(points, fill, stroke, strokewidth, arrowWidth, spacing,
			endSize) {
		this.points = points;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
		this.arrowWidth = arrowWidth || mxConstants.ARROW_WIDTH;
		this.spacing = spacing || mxConstants.ARROW_SPACING;
		this.endSize = endSize || mxConstants.ARROW_SIZE;
	};
	mxArrow.prototype = new mxShape();
	mxArrow.prototype.constructor = mxArrow;
	mxArrow.prototype.mixedModeHtml = false;
	mxArrow.prototype.preferModeHtml = false;
	mxArrow.prototype.DEG_PER_RAD = 57.2957795;
	mxArrow.prototype.createVml = function() {
		var node = document.createElement('vml:polyline');
		this.configureVmlShape(node);
		return node;
	};
	mxArrow.prototype.redrawVml = function() {
		this.node.setAttribute('strokeweight', this.strokewidth * this.scale);
		if (this.points != null) {
			var spacing = this.spacing * this.scale;
			var width = this.arrowWidth * this.scale;
			var arrow = this.endSize * this.scale;
			var p0 = this.points[0];
			var pe = this.points[this.points.length - 1];
			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			var length = dist - 2 * spacing - arrow;
			var nx = dx / dist;
			var ny = dy / dist;
			var basex = length * nx;
			var basey = length * ny;
			var floorx = width * ny / 3;
			var floory = -width * nx / 3;
			var p0x = p0.x - floorx / 2 + spacing * nx;
			var p0y = p0.y - floory / 2 + spacing * ny;
			var p1x = p0x + floorx;
			var p1y = p0y + floory;
			var p2x = p1x + basex;
			var p2y = p1y + basey;
			var p3x = p2x + floorx;
			var p3y = p2y + floory;
			var p5x = p3x - 3 * floorx;
			var p5y = p3y - 3 * floory;
			this.node.points.value = p0x + ',' + p0y + ',' + p1x + ',' + p1y
					+ ',' + p2x + ',' + p2y + ',' + p3x + ',' + p3y + ','
					+ (pe.x - spacing * nx) + ',' + (pe.y - spacing * ny) + ','
					+ p5x + ',' + p5y + ',' + (p5x + floorx) + ','
					+ (p5y + floory) + ',' + p0x + ',' + p0y;
		}
	};
	mxArrow.prototype.createSvg = function() {
		var node = document.createElementNS(mxConstants.NS_SVG, 'polygon');
		this.configureSvgShape(node);
		return node;
	};
	mxArrow.prototype.redrawSvg = function() {
		if (this.points != null) {
			var strokeWidth = Math.max(1, this.strokewidth * this.scale);
			this.node.setAttribute('stroke-width', strokeWidth);
			var p0 = this.points[0];
			var pe = this.points[this.points.length - 1];
			var tdx = pe.x - p0.x;
			var tdy = pe.y - p0.y;
			var dist = Math.sqrt(tdx * tdx + tdy * tdy);
			var offset = this.spacing * this.scale;
			var h = Math.min(25, Math.max(20, dist / 5)) * this.scale;
			var w = dist - 2 * offset;
			var x = p0.x + offset;
			var y = p0.y - h / 2;
			var dx = h;
			var dy = h * 0.3;
			var right = x + w;
			var bottom = y + h;
			var points = x + ',' + (y + dy) + ' ' + (right - dx) + ','
					+ (y + dy) + ' ' + (right - dx) + ',' + y + ' ' + right
					+ ',' + (y + h / 2) + ' ' + (right - dx) + ',' + bottom
					+ ' ' + (right - dx) + ',' + (bottom - dy) + ' ' + x + ','
					+ (bottom - dy);
			this.node.setAttribute('points', points);
			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			var theta = Math.atan(dy / dx) * this.DEG_PER_RAD;
			if (dx < 0) {
				theta -= 180;
			}
			this.node.setAttribute('transform', 'rotate(' + theta + ',' + p0.x
							+ ',' + p0.y + ')');
		}
	};
}

{
	function mxText(value, bounds, align, valign, color, family, size,
			fontStyle, spacing, spacingTop, spacingRight, spacingBottom,
			spacingLeft, isRotate, background, border, useTableBounds,
			isAbsolute, isWrapping, isClipping ,cellId) {
		this.cellId = cellId;// /////jiang20100203
		this.value = value;
		this.bounds = bounds;
		this.color = color || 'black';
		this.align = align || 0;
		this.valign = valign || 0;
		this.family = family || mxConstants.DEFAULT_FONTFAMILY;
		this.size = size || mxConstants.DEFAULT_FONTSIZE;
		this.fontStyle = fontStyle || 0;
		this.spacing = parseInt(spacing || 2);
		this.spacingTop = this.spacing + parseInt(spacingTop || 0);
		this.spacingRight = this.spacing + parseInt(spacingRight || 0);
		this.spacingBottom = this.spacing + parseInt(spacingBottom || 0);
		this.spacingLeft = this.spacing + parseInt(spacingLeft || 0);
		this.isRotate = isRotate || false;
		this.background = background;
		this.border = border;
		this.useTableBounds = (useTableBounds != null) ? useTableBounds : true;
		this.isAbsolute = (isAbsolute != null) ? isAbsolute : false;
		this.isWrapping = (isWrapping != null) ? isWrapping : false;
		this.isClipping = (isClipping != null) ? isClipping : false;
	};
	mxText.prototype = new mxShape();
	mxText.prototype.constructor = mxText;
	mxText.prototype.ENABLE_FOREIGNOBJECT = false;
	mxText.prototype.isStyleSet = function(style) {
		return (this.fontStyle & style) == style;
	}
	mxText.prototype.create = function(container) {
		var node = null;
		if (this.dialect == mxConstants.DIALECT_SVG
				&& (!false || !this.ENABLE_FOREIGNOBJECT)) {
			node = this.createSvg();
		} else if (this.dialect == mxConstants.DIALECT_STRICTHTML
				|| this.dialect == mxConstants.DIALECT_PREFERHTML
				|| !mxUtils.isVml(container)) {
			if (this.dialect == mxConstants.DIALECT_SVG) {
				node = this.createForeignObject();
			} else {
				container.style.overflow = 'visible';
				node = this.createHtml();
			}
		} else {
			node = this.createVml();
		}
		return node;
	};
	mxText.prototype.createForeignObject = function() {
		var node = document
				.createElementNS(mxConstants.NS_SVG, 'foreignObject');
		node.style.cursor = 'default';
		return node;
	};
	mxText.prototype.createHtml = function() {
		var node = document.createElement('DIV');
		node.style.cursor = 'default';
		return node;
	};
	mxText.prototype.createVml = function() {
		var node = document.createElement('vml:textbox');
		node.inset = '0px,0px,0px,0px';
		return node;
	};
	mxText.prototype.redrawHtml = function() {
		this.redrawVml();
	};
	mxText.prototype.redrawVml = function() {
		if (this.value != null) {
			var scale = (true) ? 1 : this.scale;
			var table = document.createElement('table');
			table.id = this.cellId;// ////////jiang 20100203
			
			table.style.borderCollapse = 'collapse';
			var tbody = document.createElement('tbody');
			var row = document.createElement('tr');
			var td = document.createElement('td');
// td.id = this.cellId;//////////jiang 20100203
			this.node.style.overflow = (this.isClipping) ? 'hidden' : 'visible';
			if (!mxUtils.isVml(this.node)) {
				this.node.style.marginLeft = '0px';
				this.node.style.marginTop = '0px';
			} else {
				this.node.inset = '0px,0px,0px,0px';
			}
			if (this.isAbsolute
					|| (this.bounds.width == 0 && this.bounds.height == 0)) {
				if (mxUtils.isVml(this.node)) {
					var x0 = parseInt(this.node.parentNode.style.left);
					var y0 = parseInt(this.node.parentNode.style.top);
					this.node.inset = (this.bounds.x - x0) + 'px,'
							+ (this.bounds.y - y0) + 'px,0px,0px';
				} else {
					this.node.style.position = 'absolute';
					this.node.style.left = this.bounds.x + 'px';
					this.node.style.top = this.bounds.y + 'px';
					if (mxUtils.isVml(this.node.parentNode) || true) {
						this.node.style.left = (this.bounds.x
								- parseInt(this.node.parentNode.style.left) || 0)
								+ 'px';
						this.node.style.top = (this.bounds.y
								- parseInt(this.node.parentNode.style.top) || 0)
								+ 'px';
					}
					if (this.bounds.width > 0 || this.bounds.height > 0) {
						this.node.style.width = this.bounds.width + 'px';
						this.node.style.height = this.bounds.height + 'px';
						table.setAttribute('height', '100%');
						table.setAttribute('width', '100%');
					}
				}
			} else {
				if (!mxUtils.isVml(this.node)) {
					this.node.style.width = this.bounds.width + 'px';
					this.node.style.height = this.bounds.height + 'px';
				}
				table.setAttribute('height', '100%');
				table.setAttribute('width', '100%');
			}
			td.style.textAlign = (this.align == mxConstants.ALIGN_RIGHT)
					? 'right'
					: ((this.align == mxConstants.ALIGN_CENTER)
							? 'center'
							: 'left');
			td.style.verticalAlign = (this.valign == mxConstants.ALIGN_BOTTOM)
					? 'bottom'
					: ((this.valign == mxConstants.ALIGN_MIDDLE)
							? 'middle'
							: 'top');
			var container = td;

			if (!this.useTableBounds
					&& (this.background != null || this.border != null)) {
				var tbl = document.createElement('table');
				tbl.style.borderCollapse = 'collapse';
				var tb = document.createElement('tbody');
				var tr = document.createElement('tr');
				container = document.createElement('td');
				container.style.textAlign = td.style.textAlign;
				container.style.verticalAlign = td.style.verticalAlign;
				tr.appendChild(container);
				tb.appendChild(tr);
				tbl.appendChild(tb);
				td.appendChild(tbl);
				if (mxClient.IS_MAC) {
					tbl.setAttribute('align', td.style.textAlign);
				}
			}
			container.style.zoom = this.scale;
			container.style.color = this.color;
			container.style.fontSize = (this.size * scale) + 'px';
			container.style.fontFamily = this.family;
			if (this.isRotate) {
				if (container != td) {
					td.style.verticalAlign = (this.align == mxConstants.ALIGN_RIGHT)
							? 'top'
							: ((this.align == mxConstants.ALIGN_CENTER)
									? 'middle'
									: 'bottom');
					td.style.textAlign = (this.valign == mxConstants.ALIGN_BOTTOM)
							? 'right'
							: ((this.valign == mxConstants.ALIGN_MIDDLE)
									? 'center'
									: 'left');
				}
				container.style.writingMode = 'tb-rl';
				container.style.filter = 'flipv fliph';

				var f = (true) ? 1 : this.scale;
				td.style.paddingTop = (this.spacingRight * f) + 'px';
				td.style.paddingRight = (this.spacingBottom * f) + 'px';
				td.style.paddingBottom = (this.spacingLeft * f) + 'px';
				td.style.paddingLeft = (this.spacingTop * f) + 'px';
			} else {
				var f = (true) ? 1 : this.scale;
				td.style.paddingTop = (this.spacingTop * f) + 'px';
				td.style.paddingRight = (this.spacingRight * f) + 'px';
				td.style.paddingBottom = (this.spacingBottom * f) + 'px';
				td.style.paddingLeft = (this.spacingLeft * f) + 'px';
			}
			if (this.isStyleSet(mxConstants.FONT_BOLD)) {
				container.style.fontWeight = 'bold';
			} else {
				container.style.fontWeight = 'normal';
			}
			if (this.isStyleSet(mxConstants.FONT_ITALIC)) {
				container.style.fontStyle = 'italic';
			}
			if (this.isStyleSet(mxConstants.FONT_UNDERLINE)) {
				container.style.textDecoration = 'underline';
			}
			if (!this.isWrapping) {
				container.style.whiteSpace = 'nowrap';
			}
			if (this.background != null) {
				container.style.background = this.background;
			}
			if (this.border != null) {
				container.style.borderColor = this.border;
				container.style.borderWidth = '1px';
				container.style.borderStyle = 'solid';
			}
			if (!mxUtils.isNode(this.value)) {
				var value = this.value.replace(/\n/g, '<br/>');
				if (true && this.isStyleSet(mxConstants.FONT_SHADOW)) {
					value = '<p style=\"height:1em;filter:Shadow(Color=#666666,'
							+ 'Direction=135,Strength=%);\">' + value + '</p>';
				}
				container.innerHTML = value;
			} else {
				container.appendChild(this.value);
			}
			row.appendChild(td);
			tbody.appendChild(row);
			table.appendChild(tbody);
			if (this.node.nodeName == 'foreignObject') {

				if (this.node.firstChild != null) {
					table = this.node.firstChild.firstChild;
					var oldTd = table.firstChild.firstChild.firstChild;
					oldTd.style.cssText = td.getAttribute('style');
				} else {
					var body = document.createElementNS(mxConstants.NS_XHTML,
							'body');
					body.style.overflow = this.node.style.overflow;
					table.setAttribute('width', '100%');
					table.setAttribute('height', '100%');
					body.appendChild(table);
					this.node.appendChild(body);
				}
			} else {
				this.node.innerHTML = '';
				this.node.appendChild(table);
			}
			var xdiff = 0;
			var ydiff = 0;
			var tmpalign = (this.isRotate) ? this.valign : this.align;
			var tmpvalign = (this.isRotate) ? this.align : this.valign;
			if (this.node.style.overflow != 'hidden') {
				if (this.bounds.width > 0 || this.useTableBounds) {
					xdiff = Math.floor(Math.max(0, table.offsetWidth
									- this.bounds.width));
					if (tmpalign == mxConstants.ALIGN_CENTER
							|| tmpalign == mxConstants.ALIGN_MIDDLE) {
						xdiff = Math.floor(xdiff / 2);
					} else if (tmpalign != mxConstants.ALIGN_RIGHT
							&& tmpalign != mxConstants.ALIGN_BOTTOM) {
						xdiff = 0;
					}
				}
				if (this.bounds.height > 0 || this.useTableBounds) {
					ydiff = Math.floor(Math.max(0, table.offsetHeight
									- this.bounds.height));
					if (tmpvalign == mxConstants.ALIGN_MIDDLE
							|| tmpvalign == mxConstants.ALIGN_CENTER) {
						ydiff = Math.floor(ydiff / 2);
					} else if ((!this.isRotate && tmpvalign != mxConstants.ALIGN_BOTTOM)
							|| (this.isRotate && tmpvalign != mxConstants.ALIGN_LEFT)) {
						ydiff = 0;
					}
				}
				if (xdiff > 0 || ydiff > 0) {
					if (!mxUtils.isVml(this.node)) {
						this.node.style.marginLeft = -xdiff + 'px';
						this.node.style.marginTop = -ydiff + 'px';
					} else {
						var x0 = parseInt(this.node.parentNode.style.left) || 0;
						var y0 = parseInt(this.node.parentNode.style.top) || 0;
						xdiff -= this.bounds.x - x0;
						ydiff -= this.bounds.y - y0;
						this.node.inset = (-xdiff) + 'px,' + (-ydiff)
								+ 'px,0px,0px';
					}
				} else if (mxUtils.isVml(this.node)) {
					var x0 = parseInt(this.node.parentNode.style.left);
					var y0 = parseInt(this.node.parentNode.style.top);
					this.node.inset = (this.bounds.x - x0) + 'px,'
							+ (this.bounds.y - y0) + 'px,'
							+ (y0 - this.bounds.y) + 'px,'
							+ (x0 - this.bounds.x) + 'px';
				}
			}
			if (this.opacity != null) {
				mxUtils.setOpacity(this.node, this.opacity);
			}
			var x = this.bounds.x - xdiff;
			var y = this.bounds.y - ydiff;
			var width = Math.max(this.bounds.width, table.offsetWidth || 0);
			var height = Math.max(this.bounds.height, table.offsetHeight || 0);
			this.boundingBox = new mxRectangle(x, y, width, height);
		} else {
			this.node.innerHTML = '<div style=\'width:100%;height:100%;\'></div>';
			this.boundingBox = this.bounds.clone();
			if (!mxUtils.isVml(this.node)) {
				this.node.style.position = 'absolute';
				this.node.style.left = this.bounds.x + 'px';
				this.node.style.top = this.bounds.y + 'px';
				this.node.style.width = this.bounds.width + 'px';
				this.node.style.height = this.bounds.height + 'px';
			}
		}

		if (this.node.nodeName == 'foreignObject') {
			this.node.setAttribute('x', parseInt(this.node.style.left)
							+ parseInt(this.node.style.marginLeft));
			this.node.setAttribute('y', parseInt(this.node.style.top)
							+ parseInt(this.node.style.marginTop));
			var w = parseInt(this.node.style.width);
			if (!isNaN(w)) {
				this.node.setAttribute('width', w);
			}
			var h = parseInt(this.node.style.height);
			if (!isNaN(h)) {
				this.node.setAttribute('height', h);
			}
		}
	};
	mxText.prototype.createSvg = function() {

		var node = document.createElementNS(mxConstants.NS_SVG, 'g');
		var uline = this.isStyleSet(mxConstants.FONT_UNDERLINE)
				? 'underline'
				: 'none';
		var weight = this.isStyleSet(mxConstants.FONT_BOLD) ? 'bold' : 'normal';
		var s = this.isStyleSet(mxConstants.FONT_ITALIC) ? 'italic' : null;
		var align = (this.align == mxConstants.ALIGN_RIGHT)
				? 'end'
				: (this.align == mxConstants.ALIGN_CENTER) ? 'middle' : 'start';

		node.setAttribute('text-decoration', uline);
		node.setAttribute('text-anchor', align);
		node.setAttribute('font-family', this.family);
		node.setAttribute('font-weight', weight);
		node.setAttribute('font-size', Math.floor(this.size * this.scale)
						+ 'px');
		node.setAttribute('fill', this.color);
		if (s != null) {
			node.setAttribute('font-style', s);
		}
		if (this.background != null || this.border != null) {
			this.backgroundNode = document.createElementNS(mxConstants.NS_SVG,
					'rect');
			this.backgroundNode
					.setAttribute('shape-rendering', 'optimizeSpeed');
			if (this.background != null) {
				this.backgroundNode.setAttribute('fill', this.background);
			} else {
				this.backgroundNode.setAttribute('fill', 'none');
			}
			if (this.border != null) {
				this.backgroundNode.setAttribute('stroke', this.border);
			} else {
				this.backgroundNode.setAttribute('stroke', 'none');
			}
		}
		this.updateSvgValue(node);
		return node;
	};
	mxText.prototype.updateSvgValue = function(node) {
		if (this.currentValue != this.value) {
			while (node.firstChild != null) {
				node.removeChild(node.firstChild);
			}
			if (this.value != null) {
				var lines = this.value.split('\n');

				this.textNodes = new Array(lines.length);
				for (var i = 0; i < lines.length; i++) {
					if (!this.isEmptyString(lines[i])) {
						var tspan = this.createSvgSpan(lines[i]);
						/** xiaoxiong 20140728 给组件添加ID，为了正常显示当前步信息 * */
						tspan.setAttribute('id', "STEPSVG_"+this.cellId);
						node.appendChild(tspan);
						this.textNodes[i] = tspan;
					} else {
						this.textNodes[i] = null;
					}
				}
			}
			this.currentValue = this.value;
		}
	};
	mxText.prototype.redrawSvg = function() {
		if (this.node.nodeName == 'foreignObject') {
			this.redrawHtml()
			return;
		}
		this.updateSvgValue(this.node);
		this.node.setAttribute('font-size', Math.floor(this.size * this.scale)
						+ 'px');
		if (this.opacity != null) {
			this.node.setAttribute('fill-opacity', this.opacity / 100);
			this.node.setAttribute('stroke-opacity', this.opacity / 100);
		}
		var dy = this.size * 1.3 * this.scale;
		var childCount = this.node.childNodes.length;
		var lineCount = (this.textNodes != null) ? this.textNodes.length : 0;
		if (this.backgroundNode != null) {
			childCount--;
		}
		var x = this.bounds.x;
		var y = this.bounds.y;
		x += (this.align == mxConstants.ALIGN_RIGHT)
				? ((this.isRotate) ? this.bounds.height : this.bounds.width)
						- this.spacingRight * this.scale
				: (this.align == mxConstants.ALIGN_CENTER)
						? this.spacingLeft
								+ (((this.isRotate)
										? this.bounds.height
										: this.bounds.width)
										- this.spacingLeft - this.spacingRight)
								/ 2
						: this.spacingLeft * this.scale;
		var y0 = (this.valign == mxConstants.ALIGN_BOTTOM)
				? ((this.isRotate) ? this.bounds.width : this.bounds.height)
						- (lineCount - 1) * dy - this.spacingBottom
						* this.scale - 3
				: (this.valign == mxConstants.ALIGN_MIDDLE) ? (this.spacingTop
						* this.scale
						+ ((this.isRotate)
								? this.bounds.width
								: this.bounds.height) - this.spacingBottom
						* this.scale - (lineCount - 1.5) * dy)
						/ 2 + 1 : this.spacingTop * this.scale + dy - 2;
		y += y0;
		this.node.setAttribute('x', x);
		this.node.setAttribute('y', y);
		if (this.isRotate) {
			var cx = this.bounds.x + this.bounds.width / 2;
			var cy = this.bounds.y + this.bounds.height / 2;
			var offsetX = (this.bounds.width - this.bounds.height) / 2;
			var offsetY = (this.bounds.height - this.bounds.width) / 2;
			this.node.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy
							+ ') ' + 'translate(' + -offsetY + ' ' + (-offsetX)
							+ ')');
		}
		if (this.backgroundNode != null
				&& this.backgroundNode.parentNode == this.node) {
			this.node.removeChild(this.backgroundNode);
		}
		if (this.textNodes != null) {
			for (var i = 0; i < lineCount; i++) {
				var node = this.textNodes[i];
				if (node != null) {
					node.setAttribute('x', x);
					node.setAttribute('y', y);
					node.setAttribute('style', 'pointer-events: all');
				}
				y += dy;
			}
		}
		this.boundingBox = this.bounds.clone();

		if (!false && this.value != null && this.value.length > 0) {
			try {
				var box = this.node.getBBox();
				this.boundingBox = new mxRectangle(Math.min(this.bounds.x,
								box.x - 4 * this.scale || 0), Math.min(
								this.bounds.y, box.y - 4 * this.scale || 0),
						Math.max(this.bounds.width, box.width + 8 * this.scale
										|| 0), Math.max(this.bounds.height,
								box.height + 10 * this.scale || 0));
				if (this.backgroundNode != null && this.node.firstChild != null) {
					this.node.insertBefore(this.backgroundNode,
							this.node.firstChild);
					this.backgroundNode.setAttribute('x', box.x - 4
									* this.scale || 0);
					this.backgroundNode.setAttribute('y', box.y - 4
									* this.scale || 0);
					this.backgroundNode.setAttribute('width', box.width + 8
									* this.scale || 0);
					this.backgroundNode.setAttribute('height', box.height + 8
									* this.scale || 0);
					var strokeWidth = Math.floor(Math.max(1, this.scale));
					this.backgroundNode.setAttribute('stroke-width',
							strokeWidth);
				}
			} catch (ex) {
			}
		}
	};
	mxText.prototype.isEmptyString = function(text) {
		return text.replace(/ /g, '').length == 0;
	};
	mxText.prototype.createSvgSpan = function(text) {

		var node = document.createElementNS(mxConstants.NS_SVG, 'text');
		mxUtils.write(node, text);
		return node;
	};
}

{
	function mxTriangle() {
	};
	mxTriangle.prototype = new mxActor();
	mxTriangle.prototype.constructor = mxTriangle;
	mxTriangle.prototype.redrawPath = function(path, x, y, w, h) {
		var dir = this.style[mxConstants.STYLE_DIRECTION];
		if (dir == mxConstants.DIRECTION_NORTH) {
			path.moveTo(0, h);
			path.lineTo(0.5 * w, 0);
			path.lineTo(w, h);
		} else if (dir == mxConstants.DIRECTION_SOUTH) {
			path.moveTo(0, 0);
			path.lineTo(0.5 * w, h);
			path.lineTo(w, 0);
		} else if (dir == mxConstants.DIRECTION_WEST) {
			path.moveTo(w, 0);
			path.lineTo(0, 0.5 * h);
			path.lineTo(w, h);
		} else {
			path.moveTo(0, 0);
			path.lineTo(w, 0.5 * h);
			path.lineTo(0, h);
		}
		path.close();
	};
}

{
	function mxHexagon() {
	};
	mxHexagon.prototype = new mxActor();
	mxHexagon.prototype.constructor = mxHexagon;
	mxHexagon.prototype.redrawPath = function(path, x, y, w, h) {
		var dir = this.style[mxConstants.STYLE_DIRECTION];
		if (dir == mxConstants.DIRECTION_NORTH
				|| dir == mxConstants.DIRECTION_SOUTH) {
			path.moveTo(0.5 * w, 0);
			path.lineTo(w, 0.25 * h);
			path.lineTo(w, 0.75 * h);
			path.lineTo(0.5 * w, h);
			path.lineTo(0, 0.75 * h);
			path.lineTo(0, 0.25 * h);
		} else {
			path.moveTo(0.25 * w, 0);
			path.lineTo(0.75 * w, 0);
			path.lineTo(w, 0.5 * h);
			path.lineTo(0.75 * w, h);
			path.lineTo(0.25 * w, h);
			path.lineTo(0, 0.5 * h);
		}
		path.close();
	};
}

{
	function mxLine(bounds, stroke, strokewidth) {
		this.bounds = bounds;
		this.stroke = stroke || 'black';
		this.strokewidth = strokewidth || '1';
	};
	mxLine.prototype = new mxShape();
	mxLine.prototype.constructor = mxLine;
	mxLine.prototype.mixedModeHtml = false;
	mxLine.prototype.preferModeHtml = false;
	mxLine.prototype.clone = function() {
		var clone = new mxLine(this.bounds, this.stroke, this.strokewidth);
		clone.isDashed = this.isDashed;
		return clone;
	};
	mxLine.prototype.createVml = function() {
		var node = document.createElement('vml:group');
		node.setAttribute('coordorigin', '0,0');
		node.style.position = 'absolute';
		node.style.overflow = 'visible';
		this.label = document.createElement('vml:rect');
		this.configureVmlShape(this.label);
		this.label.setAttribute('stroked', 'false');
		this.label.setAttribute('filled', 'false');
		node.appendChild(this.label);
		this.innerNode = document.createElement('vml:polyline');
		this.configureVmlShape(this.innerNode);
		node.appendChild(this.innerNode);
		return node;
	};
	mxLine.prototype.redrawVml = function() {
		var x = Math.floor(this.bounds.x);
		var y = Math.floor(this.bounds.y);
		var w = Math.floor(this.bounds.width);
		var h = Math.floor(this.bounds.height);
		this.updateVmlShape(this.node);
		this.node.setAttribute('coordsize', w + ',' + h);
		this.updateVmlShape(this.label);
		this.label.style.left = '0px';
		this.label.style.top = '0px';
		this.innerNode.setAttribute('strokeweight', this.strokewidth
						* this.scale);
		var direction = this.style[mxConstants.STYLE_DIRECTION];
		if (direction == mxConstants.DIRECTION_NORTH
				|| direction == mxConstants.DIRECTION_SOUTH) {
			this.innerNode.points.value = (w / 2) + ',0 ' + (w / 2) + ',' + (h);
		} else {
			this.innerNode.points.value = '0,' + (h / 2) + ' ' + (w) + ','
					+ (h / 2);
		}
	};
	mxLine.prototype.createSvg = function() {
		var g = this.createSvgGroup('path');

		var color = this.innerNode.getAttribute('stroke');
		this.pipe = document.createElementNS(mxConstants.NS_SVG, 'path');
		this.pipe.setAttribute('stroke', color);
		this.pipe.setAttribute('visibility', 'hidden');
		this.pipe.setAttribute('pointer-events', 'stroke');
		g.appendChild(this.pipe);
		return g;
	};
	mxLine.prototype.redrawSvg = function() {
		var strokeWidth = Math.max(1, this.strokewidth * this.scale);
		this.innerNode.setAttribute('stroke-width', strokeWidth);
		if (this.bounds != null) {
			var x = this.bounds.x;
			var y = this.bounds.y;
			var w = this.bounds.width;
			var h = this.bounds.height;
			var d = null;
			var direction = this.style[mxConstants.STYLE_DIRECTION];
			if (direction == mxConstants.DIRECTION_NORTH
					|| direction == mxConstants.DIRECTION_SOUTH) {
				d = 'M ' + (x + w / 2) + ' ' + y + ' L ' + (x + w / 2) + ' '
						+ (y + h);
			} else {
				d = 'M ' + x + ' ' + (y + h / 2) + ' L ' + (x + w) + ' '
						+ (y + h / 2);
			}
			this.innerNode.setAttribute('d', d);
			this.pipe.setAttribute('d', d);
			this.pipe.setAttribute('stroke-width', this.strokewidth
							* this.scale
							+ mxShape.prototype.SVG_STROKE_TOLERANCE);
			this.updateSvgTransform(this.innerNode, false);
			this.updateSvgTransform(this.pipe, false);
		}
	};
}

{
	function mxImageShape(bounds, image, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.image = image;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 0;
		this.isShadow = false;
	};
	mxImageShape.prototype = new mxShape();
	mxImageShape.prototype.constructor = mxImageShape;
	mxImageShape.prototype.create = function() {
		var node = null;
		if (this.dialect == mxConstants.DIALECT_SVG) {

			node = this.createSvgGroup('rect');
			this.innerNode.setAttribute('fill', this.fill);
			this.innerNode.setAttribute('visibility', 'hidden');
			this.innerNode.setAttribute('pointer-events', 'fill');
			this.imageNode = document.createElementNS(mxConstants.NS_SVG,
					'image');
			this.imageNode.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href',
					this.image);
			this.imageNode.setAttribute('style', 'pointer-events:none');
			this.configureSvgShape(this.imageNode);
			this.imageNode.removeAttribute("stroke");
			this.imageNode.removeAttribute("fill");
			node.insertBefore(this.imageNode, this.innerNode);
		} else {
			if (this.dialect == mxConstants.DIALECT_STRICTHTML
					|| this.dialect == mxConstants.DIALECT_PREFERHTML) {
				node = document.createElement('DIV');
				this.configureHtmlShape(node);
				var imgName = this.image.toUpperCase()
				if (imgName.substring(imgName.length - 3, imgName.length) == "PNG"
						&& true && !false) {
					node.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader (src=\''
							+ this.image + '\', sizingMethod=\'scale\')';
				} else {
					var img = document.createElement('img');
					img.setAttribute('src', this.image);
					img.style.width = '100%';
					img.style.height = '100%';
					img.setAttribute('border', '0');
					node.appendChild(img);
				}
			} else {
				node = document.createElement('vml:image');
				node.setAttribute('src', this.image);
				this.configureVmlShape(node);
			}
		}
		return node;
	};
	mxImageShape.prototype.redrawSvg = function() {
		this.updateSvgShape(this.innerNode);
		this.updateSvgShape(this.imageNode);
	};
}

{
	function mxLabel(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxLabel.prototype = new mxShape();
	mxLabel.prototype.constructor = mxLabel;
	mxLabel.prototype.imageSize = mxConstants.DEFAULT_IMAGESIZE;
	mxLabel.prototype.spacing = 2;
	mxLabel.prototype.indicatorSize = 10;
	mxLabel.prototype.indicatorSpacing = 2;
	mxLabel.prototype.createHtml = function() {
		var name = 'DIV';
		var node = document.createElement(name);
		this.configureHtmlShape(node);
		if (this.indicatorColor != null && this.indicatorShape != null) {
			this.indicator = new this.indicatorShape(this.bounds);
			this.indicator.dialect = this.dialect;
			this.indicator.fill = this.indicatorColor;
			this.indicator.gradient = this.indicatorGradientColor;
			this.indicator.init(node);
		} else if (this.indicatorImage != null) {
			this.indicatorImageNode = mxUtils.createImage(this.indicatorImage);
			this.indicatorImageNode.style.position = 'absolute';
			node.appendChild(this.indicatorImageNode);
		}
		if (this.image != null) {
			this.imageNode = mxUtils.createImage(this.image);
			this.stroke = null;
			this.configureHtmlShape(this.imageNode);
			node.appendChild(this.imageNode);
		}
		return node;
	};
	mxLabel.prototype.createVml = function() {
		var node = document.createElement('vml:group');
		var name = (this.isRounded) ? 'vml:roundrect' : 'vml:rect';
		this.rectNode = document.createElement(name);
		this.configureVmlShape(this.rectNode);
		this.isShadow = false;
		this.configureVmlShape(node);
		node.setAttribute('coordorigin', '0,0');
		node.appendChild(this.rectNode);
		if (this.indicatorColor != null && this.indicatorShape != null) {
			this.indicator = new this.indicatorShape(this.bounds);
			this.indicator.dialect = this.dialect;
			this.indicator.fill = this.indicatorColor;
			this.indicator.gradient = this.indicatorGradientColor;
			this.indicator.init(node);
		} else if (this.indicatorImage != null) {
			this.indicatorImageNode = document.createElement('vml:image');
			this.indicatorImageNode.setAttribute('src', this.indicatorImage);
			node.appendChild(this.indicatorImageNode);
		}
		if (this.image != null) {
			this.imageNode = document.createElement('vml:image');
			this.imageNode.setAttribute('src', this.image);
			this.configureVmlShape(this.imageNode);
			node.appendChild(this.imageNode);
		}
		this.label = document.createElement('vml:rect');
		this.label.style.top = '0px';
		this.label.style.left = '0px';
		this.label.setAttribute('filled', 'false');
		this.label.setAttribute('stroked', 'false');
		node.appendChild(this.label);
		return node;
	};
	mxLabel.prototype.createSvg = function() {
		var g = this.createSvgGroup('rect');
		if (this.strokewidth * this.scale >= 1 && !this.isRounded) {
			this.innerNode.setAttribute('shape-rendering', 'optimizeSpeed');
		}
		if (this.indicatorColor != null && this.indicatorShape != null) {
			this.indicator = new this.indicatorShape(this.bounds);
			this.indicator.dialect = this.dialect;
			this.indicator.fill = this.indicatorColor;
			this.indicator.gradient = this.indicatorGradientColor;
			this.indicator.init(g);
		} else if (this.indicatorImage != null) {
			this.indicatorImageNode = document.createElementNS(
					mxConstants.NS_SVG, 'image');
			this.indicatorImageNode.setAttributeNS(mxConstants.NS_XLINK,
					'href', this.indicatorImage);
			g.appendChild(this.indicatorImageNode);
		}
		if (this.image != null) {
			this.imageNode = document.createElementNS(mxConstants.NS_SVG,
					'image');
			this.imageNode.setAttributeNS(mxConstants.NS_XLINK, 'href',
					this.image);
			this.imageNode.setAttribute('style', 'pointer-events:none');
			this.configureSvgShape(this.imageNode);
			g.appendChild(this.imageNode);
		}
		return g;
	};
	mxLabel.prototype.redraw = function() {
		var isSvg = (this.dialect == mxConstants.DIALECT_SVG);
		var isVml = mxUtils.isVml(this.node);
		if (isSvg) {
			this.updateSvgShape(this.innerNode);
			if (this.shadowNode != null) {
				this.updateSvgShape(this.shadowNode);
			}
		} else if (isVml) {
			this.updateVmlShape(this.node);
			this.node.setAttribute('coordsize', this.bounds.width + ','
							+ this.bounds.height);
			this.updateVmlShape(this.rectNode);
			this.rectNode.style.top = '0px';
			this.rectNode.style.left = '0px';
			this.label.style.width = this.bounds.width + 'px';
			this.label.style.height = this.bounds.height + 'px';
		} else {
			this.updateHtmlShape(this.node);
		}
		var imageWidth = 0;
		var imageHeight = 0;
		if (this.imageNode != null) {
			imageWidth = (this.style[mxConstants.STYLE_IMAGE_WIDTH] || this.imageSize)
					* this.scale;
			imageHeight = (this.style[mxConstants.STYLE_IMAGE_HEIGHT] || this.imageSize)
					* this.scale;
		}
		var indicatorSpacing = 0;
		var indicatorWidth = 0;
		var indicatorHeight = 0;
		if (this.indicator != null || this.indicatorImageNode != null) {
			indicatorSpacing = (this.style[mxConstants.STYLE_INDICATOR_SPACING] || this.indicatorSpacing)
					* this.scale;
			indicatorWidth = (this.style[mxConstants.STYLE_INDICATOR_WIDTH] || this.indicatorSize)
					* this.scale;
			indicatorHeight = (this.style[mxConstants.STYLE_INDICATOR_HEIGHT] || this.indicatorSize)
					* this.scale;
		}
		var align = this.style[mxConstants.STYLE_IMAGE_ALIGN];
		var valign = this.style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN];
		var inset = this.spacing * this.scale;
		var width = Math.max(imageWidth, indicatorWidth);
		var height = imageHeight + indicatorSpacing + indicatorHeight;
		var x = (isSvg) ? this.bounds.x : 0;
		if (align == mxConstants.ALIGN_RIGHT) {
			x += this.bounds.width - width - inset;
		} else if (align == mxConstants.ALIGN_CENTER) {
			x += (this.bounds.width - width) / 2;
		} else {
			x += inset;
		}
		var y = (isSvg) ? this.bounds.y : 0;
		if (valign == mxConstants.ALIGN_BOTTOM) {
			y += this.bounds.height - height - inset;
		} else if (valign == mxConstants.ALIGN_TOP) {
			y += inset;
		} else {
			y += (this.bounds.height - height) / 2;
		}
		if (this.imageNode != null) {
			if (isSvg) {
				this.imageNode.setAttribute('x', (x + (width - imageWidth) / 2)
								+ 'px');
				this.imageNode.setAttribute('y', y + 'px');
				this.imageNode.setAttribute('width', imageWidth + 'px');
				this.imageNode.setAttribute('height', imageHeight + 'px');
			} else {
				this.imageNode.style.left = (x + width - imageWidth) + 'px';
				this.imageNode.style.top = y + 'px';
				this.imageNode.style.width = imageWidth + 'px';
				this.imageNode.style.height = imageHeight + 'px';
			}
		}
		if (this.indicator != null) {
			this.indicator.bounds = new mxRectangle(x
							+ (width - indicatorWidth) / 2, y + imageHeight
							+ indicatorSpacing, indicatorWidth, indicatorHeight);
			this.indicator.redraw();
		} else if (this.indicatorImageNode != null) {
			if (isSvg) {
				this.indicatorImageNode.setAttribute('x',
						(x + (width - indicatorWidth) / 2) + 'px');
				this.indicatorImageNode.setAttribute('y',
						(y + imageHeight + indicatorSpacing) + 'px');
				this.indicatorImageNode.setAttribute('width', indicatorWidth
								+ 'px');
				this.indicatorImageNode.setAttribute('height', indicatorHeight
								+ 'px');
			} else {
				this.indicatorImageNode.style.left = (x + (width - indicatorWidth)
						/ 2)
						+ 'px';
				this.indicatorImageNode.style.top = (y + imageHeight + indicatorSpacing)
						+ 'px';
				this.indicatorImageNode.style.width = indicatorWidth + 'px';
				this.indicatorImageNode.style.height = indicatorHeight + 'px';
			}
		}
	};
}

{
	function mxCylinder(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxCylinder.prototype = new mxShape();
	mxCylinder.prototype.constructor = mxCylinder;
	mxCylinder.prototype.mixedModeHtml = false;
	mxCylinder.prototype.preferModeHtml = false;
	mxCylinder.prototype.maxHeight = 40;
	mxCylinder.prototype.create = function(container) {
		if (this.stroke == null) {
			this.stroke = this.fill;
		}
		return mxShape.prototype.create.apply(this, arguments);
	};
	mxCylinder.prototype.createVml = function() {
		var node = document.createElement('vml:group');
		this.background = document.createElement('vml:shape');
		this.label = this.background;
		this.configureVmlShape(this.background);
		node.appendChild(this.background);
		this.fill = null;
		this.isShadow = false;
		this.configureVmlShape(node);
		this.foreground = document.createElement('vml:shape');
		this.configureVmlShape(this.foreground);
		node.appendChild(this.foreground);
		return node;
	};
	mxCylinder.prototype.redrawVml = function() {
		var x = Math.floor(this.bounds.x);
		var y = Math.floor(this.bounds.y);
		var w = Math.floor(this.bounds.width);
		var h = Math.floor(this.bounds.height);
		var s = this.strokewidth * this.scale;
		this.node.setAttribute('coordsize', w + ',' + h);
		this.background.setAttribute('coordsize', w + ',' + h);
		this.foreground.setAttribute('coordsize', w + ',' + h);
		this.updateVmlShape(this.node);
		this.updateVmlShape(this.background);
		this.background.style.top = '0px';
		this.background.style.left = '0px';
		this.background.style.rotation = null;
		this.updateVmlShape(this.foreground);
		this.foreground.style.top = '0px';
		this.foreground.style.left = '0px';
		this.foreground.style.rotation = null;
		this.background.setAttribute('strokeweight', s);
		this.foreground.setAttribute('strokeweight', s);
		var d = this.createPath(false);
		this.background.setAttribute('path', d);
		var d = this.createPath(true);
		this.foreground.setAttribute('path', d);
	};
	mxCylinder.prototype.createSvg = function() {
		var g = this.createSvgGroup('path');
		this.foreground = document.createElementNS(mxConstants.NS_SVG, 'path');
		if (this.stroke != null) {
			this.foreground.setAttribute('stroke', this.stroke);
		} else {
			this.foreground.setAttribute('stroke', 'none');
		}
		this.foreground.setAttribute('fill', 'none');
		g.appendChild(this.foreground);
		return g;
	};
	mxCylinder.prototype.redrawSvg = function() {
		var strokeWidth = Math.max(1, this.strokewidth * this.scale);
		this.innerNode.setAttribute('stroke-width', strokeWidth);
		var d = this.createPath(false);
		this.innerNode.setAttribute('d', d);
		this.updateSvgTransform(this.innerNode, false);
		if (this.shadowNode != null) {
			this.shadowNode.setAttribute('stroke-width', strokeWidth);
			this.shadowNode.setAttribute('d', d);
			this.updateSvgTransform(this.shadowNode, true);
		}
		d = this.createPath(true);
		this.foreground.setAttribute('stroke-width', strokeWidth);
		this.foreground.setAttribute('d', d);
		this.updateSvgTransform(this.foreground, false);
	};
	mxCylinder.prototype.redrawPath = function(path, x, y, w, h, isForeground) {
		var dy = Math.min(this.maxHeight, Math.floor(h / 5));
		if (isForeground) {
			path.moveTo(0, dy);
			path.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
		} else {
			path.moveTo(0, dy);
			path.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
			path.lineTo(w, h - dy);
			path.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, (h - dy));
			path.close();
		}
	};
}

{
	function mxConnector(points, stroke, strokewidth) {
		this.points = points;
		this.stroke = stroke || 'black';
		this.strokewidth = strokewidth || 1;
	};
	mxConnector.prototype = new mxShape();
	mxConnector.prototype.constructor = mxConnector;
	mxConnector.prototype.mixedModeHtml = false;
	mxConnector.prototype.preferModeHtml = false;
	mxConnector.prototype.createHtml = function() {
		var node = document.createElement('DIV');
		this.configureHtmlShape(node);
		node.style.borderStyle = 'none';
		node.style.background = '';
		return node;
	};
	mxConnector.prototype.createVml = function() {
		var node = document.createElement('vml:shape');
		this.strokeNode = document.createElement('vml:stroke');
		this.configureVmlShape(node);
		this.strokeNode.setAttribute('endarrow', this.endArrow);
		this.strokeNode.setAttribute('startarrow', this.startArrow);
		if (this.opacity != null) {
			this.strokeNode.setAttribute('opacity', this.opacity + '%');
		}
		node.appendChild(this.strokeNode);
		return node;
	};
	mxConnector.prototype.redrawVml = function() {
		if (this.node != null && this.strokeNode != null) {
			var startSize = mxUtils
					.getValue(this.style, mxConstants.STYLE_STARTSIZE,
							mxConstants.DEFAULT_MARKERSIZE)
					* this.scale;
			var endSize = mxUtils.getValue(this.style,
					mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE)
					* this.scale;
			var startWidth = 'medium';
			var startLength = 'medium';
			var endWidth = 'medium';
			var endLength = 'medium';
			if (startSize < 6) {
				startWidth = 'narrow';
				startLength = 'short';
			} else if (startSize > 10) {
				startWidth = 'wide';
				startLength = 'long';
			}
			if (endSize < 6) {
				endWidth = 'narrow';
				endLength = 'short';
			} else if (endSize > 10) {
				endWidth = 'wide';
				endLength = 'long';
			}
			this.strokeNode.setAttribute('startarrowwidth', startWidth);
			this.strokeNode.setAttribute('startarrowlength', startLength);
			this.strokeNode.setAttribute('endarrowwidth', endWidth);
			this.strokeNode.setAttribute('endarrowlength', endLength);
			this.updateVmlShape(this.node);
		}
	};
	mxConnector.prototype.createSvg = function() {
		var g = this.createSvgGroup('path');
		var color = this.innerNode.getAttribute('stroke');
		if (this.startArrow != null) {
			this.start = document.createElementNS(mxConstants.NS_SVG, 'path');
			g.appendChild(this.start);
		}
		if (this.endArrow != null) {
			this.end = document.createElementNS(mxConstants.NS_SVG, 'path');
			g.appendChild(this.end);
		}

		this.pipe = document.createElementNS(mxConstants.NS_SVG, 'path');
		this.pipe.setAttribute('stroke', color);
		this.pipe.setAttribute('visibility', 'hidden');
		this.pipe.setAttribute('pointer-events', 'stroke');
		g.appendChild(this.pipe);
		return g;
	};
	mxConnector.prototype.redrawSvg = function() {
		mxShape.prototype.redrawSvg.apply(this, arguments);
		var strokeWidth = this.strokewidth * this.scale;
		var color = this.innerNode.getAttribute('stroke');
		if (mxConstants.SVG_CRISP_EDGES
				&& strokeWidth == Math.floor(strokeWidth) && !this.isRounded) {
			this.node.setAttribute('shape-rendering', 'optimizeSpeed');
		} else {
			this.node.setAttribute('shape-rendering', 'auto');
		}

		if (this.points != null && this.points[0] != null) {
			if (this.start != null) {
				var p0 = this.points[1];
				var pe = this.points[0];
				var size = mxUtils.getValue(this.style,
						mxConstants.STYLE_STARTSIZE,
						mxConstants.DEFAULT_MARKERSIZE);
				this.startOffset = this.redrawSvgMarker(this.start,
						this.startArrow, p0, pe, color, size);
			}
			if (this.end != null) {
				var n = this.points.length;
				var p0 = this.points[n - 2];
				var pe = this.points[n - 1];
				var size = mxUtils.getValue(this.style,
						mxConstants.STYLE_ENDSIZE,
						mxConstants.DEFAULT_MARKERSIZE);
				this.endOffset = this.redrawSvgMarker(this.end, this.endArrow,
						p0, pe, color, size);
			}
		}
		this.updateSvgShape(this.innerNode);
		var d = this.innerNode.getAttribute('d');
		if (d != null) {
			this.pipe.setAttribute('d', this.innerNode.getAttribute('d'));
			this.pipe.setAttribute('stroke-width', strokeWidth
							+ mxShape.prototype.SVG_STROKE_TOLERANCE);
		}
		this.innerNode.setAttribute('fill', 'none');
	};
	mxConnector.prototype.redrawSvgMarker = function(node, type, p0, pe, color,
			size) {
		var offset = null;
		var dx = pe.x - p0.x;
		var dy = pe.y - p0.y;
		var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
		var absSize = size * this.scale;
		var nx = dx * absSize / dist;
		var ny = dy * absSize / dist;
		pe = pe.clone();
		pe.x -= nx * this.strokewidth / (2 * size);
		pe.y -= ny * this.strokewidth / (2 * size);
		nx *= 0.5 + this.strokewidth / 2;
		ny *= 0.5 + this.strokewidth / 2;
		if (type == 'classic' || type == 'block') {
			var d = 'M '
					+ pe.x
					+ ' '
					+ pe.y
					+ ' L '
					+ (pe.x - nx - ny / 2)
					+ ' '
					+ (pe.y - ny + nx / 2)
					+ ((type != 'classic') ? '' : ' L ' + (pe.x - nx * 3 / 4)
							+ ' ' + (pe.y - ny * 3 / 4)) + ' L '
					+ (pe.x + ny / 2 - nx) + ' ' + (pe.y - ny - nx / 2) + ' z';
			node.setAttribute('d', d);
			offset = new mxPoint(-nx * 3 / 4, -ny * 3 / 4);
		} else if (type == 'open') {
			nx *= 1.2;
			ny *= 1.2;
			var d = 'M ' + (pe.x - nx - ny / 2) + ' ' + (pe.y - ny + nx / 2)
					+ ' L ' + (pe.x - nx / 6) + ' ' + (pe.y - ny / 6) + ' L '
					+ (pe.x + ny / 2 - nx) + ' ' + (pe.y - ny - nx / 2) + ' M '
					+ pe.x + ' ' + pe.y;
			node.setAttribute('d', d);
			node.setAttribute('fill', 'none');
			node.setAttribute('stroke-width', this.scale * this.strokewidth);
			offset = new mxPoint(-nx / 4, -ny / 4);
		} else if (type == 'oval') {
			nx *= 1.2;
			ny *= 1.2;
			absSize *= 1.2;
			var d = 'M ' + (pe.x - ny / 2) + ' ' + (pe.y + nx / 2) + ' a '
					+ (absSize / 2) + ' ' + (absSize / 2) + ' 0  1,1 '
					+ (nx / 8) + ' ' + (ny / 8) + ' z';
			node.setAttribute('d', d);
		} else if (type == 'diamond') {
			var d = 'M ' + (pe.x + nx / 2) + ' ' + (pe.y + ny / 2) + ' L '
					+ (pe.x - ny / 2) + ' ' + (pe.y + nx / 2) + ' L '
					+ (pe.x - nx / 2) + ' ' + (pe.y - ny / 2) + ' L '
					+ (pe.x + ny / 2) + ' ' + (pe.y - nx / 2) + ' z';
			node.setAttribute('d', d);
		}
		node.setAttribute('stroke', color);
		if (type != 'open') {
			node.setAttribute('fill', color);
		} else {
			node.setAttribute('stroke-linecap', 'round');
		}
		if (this.opacity != null) {
			node.setAttribute('fill-opacity', this.opacity / 100);
			node.setAttribute('stroke-opacity', this.opacity / 100);
		}
		return offset;
	};
}

{
	function mxSwimlane(bounds, fill, stroke, strokewidth) {
		this.bounds = bounds;
		this.fill = fill;
		this.stroke = stroke;
		this.strokewidth = strokewidth || 1;
	};
	mxSwimlane.prototype = new mxShape();
	mxSwimlane.prototype.constructor = mxSwimlane;
	mxSwimlane.prototype.imageSize = 16;
	mxSwimlane.prototype.defaultStartSize = 40;
	mxSwimlane.prototype.mixedModeHtml = false;
	mxRhombus.prototype.preferModeHtml = false;
	mxSwimlane.prototype.createHtml = function() {
		var node = document.createElement('DIV');
		this.configureHtmlShape(node);
		node.style.background = '';
		node.style.backgroundColor = '';
		node.style.borderStyle = 'none';
		this.label = document.createElement('DIV');
		this.configureHtmlShape(this.label);
		node.appendChild(this.label);
		this.content = document.createElement('DIV');
		var tmp = this.fill;
		this.configureHtmlShape(this.content);
		this.content.style.background = '';
		this.content.style.backgroundColor = '';
		if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true)) {
			this.content.style.borderTopStyle = 'none';
		} else {
			this.content.style.borderLeftStyle = 'none';
		}
		this.content.style.cursor = 'default';
		node.appendChild(this.content);
		var color = this.style[mxConstants.STYLE_SEPARATORCOLOR];
		if (color != null) {
			this.separator = document.createElement('DIV');
			this.separator.style.borderColor = color;
			this.separator.style.borderLeftStyle = 'dashed';
			node.appendChild(this.separator);
		}
		if (this.image != null) {
			this.imageNode = mxUtils.createImage(this.image);
			this.configureHtmlShape(this.imageNode);
			this.imageNode.style.borderStyle = 'none';
			node.appendChild(this.imageNode);
		}
		return node;
	};
	mxSwimlane.prototype.redrawHtml = function() {
		this.updateHtmlShape(this.node);
		this.startSize = parseInt(this.style[mxConstants.STYLE_STARTSIZE])
				|| this.defaultStartSize;
		this.updateHtmlShape(this.label);
		this.label.style.top = '0px';
		this.label.style.left = '0px';
		if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true)) {
			this.startSize = Math.min(this.startSize, this.bounds.height);
			this.label.style.height = (this.startSize * this.scale) + 'px';
			this.updateHtmlShape(this.content);
			var h = this.startSize * this.scale;
			this.content.style.top = h + 'px';
			this.content.style.left = '0px';
			this.content.style.height = Math.max(1, this.bounds.height - h)
					+ 'px';
			if (this.separator != null) {
				this.separator.style.left = Math.floor(this.bounds.width)
						+ 'px';
				this.separator.style.top = Math.floor(this.startSize
						* this.scale)
						+ 'px';
				this.separator.style.width = '1px';
				this.separator.style.height = Math.floor(this.bounds.height)
						+ 'px';
				this.separator.style.borderWidth = Math.floor(this.scale)
						+ 'px';
			}
			if (this.imageNode != null) {
				this.imageNode.style.left = (this.bounds.width - this.imageSize - 4)
						+ 'px';
				this.imageNode.style.top = '0px';
				this.imageNode.style.width = Math.floor(this.imageSize
						* this.scale)
						+ 'px';
				this.imageNode.style.height = Math.floor(this.imageSize
						* this.scale)
						+ 'px';
			}
		} else {
			this.startSize = Math.min(this.startSize, this.bounds.width);
			this.label.style.width = (this.startSize * this.scale) + 'px';
			this.updateHtmlShape(this.content);
			var w = this.startSize * this.scale;
			this.content.style.top = '0px';
			this.content.style.left = w + 'px';
			this.content.style.width = Math.max(0, this.bounds.width - w)
					+ 'px';
			if (this.separator != null) {
				this.separator.style.left = Math.floor(this.startSize
						* this.scale)
						+ 'px';
				this.separator.style.top = Math.floor(this.bounds.height)
						+ 'px';
				this.separator.style.width = Math.floor(this.bounds.width)
						+ 'px';
				this.separator.style.height = '1px';
			}
			if (this.imageNode != null) {
				this.imageNode.style.left = (this.bounds.width - this.imageSize - 4)
						+ 'px';
				this.imageNode.style.top = '0px';
				this.imageNode.style.width = this.imageSize * this.scale + 'px';
				this.imageNode.style.height = this.imageSize * this.scale
						+ 'px';
			}
		}
	};
	mxSwimlane.prototype.createVml = function() {
		var node = document.createElement('vml:group');
		var name = (this.isRounded) ? 'vml:roundrect' : 'vml:rect';
		this.label = document.createElement(name);
		this.configureVmlShape(this.label);
		if (this.isRounded) {
			this.label.setAttribute('arcsize', '20%');
		}
		this.isShadow = false;
		this.configureVmlShape(node);
		node.setAttribute('coordorigin', '0,0');
		node.appendChild(this.label);
		this.content = document.createElement(name);
		var tmp = this.fill;
		this.fill = null;
		this.configureVmlShape(this.content);
		if (this.isRounded) {
			this.content.setAttribute('arcsize', '4%');
		}
		this.fill = tmp;
		this.content.style.borderBottom = '0px';
		node.appendChild(this.content);
		var color = this.style[mxConstants.STYLE_SEPARATORCOLOR];
		if (color != null) {
			this.separator = document.createElement('vml:polyline');
			this.separator.setAttribute('strokecolor', color);
			var strokeNode = document.createElement('vml:stroke');
			strokeNode.setAttribute('dashstyle', '2 2');
			this.separator.appendChild(strokeNode);
			node.appendChild(this.separator);
		}
		if (this.image != null) {
			this.imageNode = document.createElement('vml:image');
			this.imageNode.setAttribute('src', this.image);
			this.configureVmlShape(this.imageNode);
			node.appendChild(this.imageNode);
		}
		return node;
	};
	mxSwimlane.prototype.redrawVml = function() {
		var x = Math.floor(this.bounds.x);
		var y = Math.floor(this.bounds.y);
		var w = Math.floor(this.bounds.width);
		var h = Math.floor(this.bounds.height);
		this.updateVmlShape(this.node);
		this.node.setAttribute('coordsize', w + ',' + h);
		this.updateVmlShape(this.label);
		this.label.style.top = '0px';
		this.label.style.left = '0px';
		this.label.style.rotation = null;
		this.startSize = parseInt(this.style[mxConstants.STYLE_STARTSIZE])
				|| this.defaultStartSize;
		var start = Math.floor(this.startSize * this.scale);
		if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true)) {
			start = Math.min(start, this.bounds.height);
			this.label.style.height = start + 'px';
			this.updateVmlShape(this.content);
			this.content.style.top = start + 'px';
			this.content.style.left = '0px';
			this.content.style.height = Math.max(0, h - start) + 'px';
			if (this.separator != null) {
				this.separator.points.value = w + ',' + start + ' ' + w + ','
						+ h;
			}
			if (this.imageNode != null) {
				var img = Math.floor(this.imageSize * this.scale);
				this.imageNode.style.left = (w - img - 4) + 'px';
				this.imageNode.style.top = '0px';
				this.imageNode.style.width = img + 'px';
				this.imageNode.style.height = img + 'px';
			}
		} else {
			start = Math.min(start, this.bounds.width);
			this.label.style.width = start + 'px';
			this.updateVmlShape(this.content);
			this.content.style.top = '0px';
			this.content.style.left = start + 'px';
			this.content.style.width = Math.max(0, w - start) + 'px';
			if (this.separator != null) {
				this.separator.points.value = '0,' + h + ' ' + (w + start)
						+ ',' + h;
			}
			if (this.imageNode != null) {
				var img = Math.floor(this.imageSize * this.scale);
				this.imageNode.style.left = (w - img - 4) + 'px';
				this.imageNode.style.top = '0px';
				this.imageNode.style.width = img + 'px';
				this.imageNode.style.height = img + 'px';
			}
		}
		this.content.style.rotation = null;
	};
	mxSwimlane.prototype.createSvg = function() {
		var node = this.createSvgGroup('rect');
		if (this.strokewidth * this.scale >= 1 && !this.isRounded) {
			this.innerNode.setAttribute('shape-rendering', 'optimizeSpeed');
		}
		if (this.isRounded) {
			this.innerNode.setAttribute('rx', 10);
			this.innerNode.setAttribute('ry', 10);
		}
		this.content = document.createElementNS(mxConstants.NS_SVG, 'path');
		this.configureSvgShape(this.content);
		this.content.setAttribute('fill', 'none');
		if (this.strokewidth * this.scale >= 1 && !this.isRounded) {
			this.content.setAttribute('shape-rendering', 'optimizeSpeed');
		}
		if (this.isRounded) {
			this.content.setAttribute('rx', 10);
			this.content.setAttribute('ry', 10);
		}
		node.appendChild(this.content);
		var color = this.style[mxConstants.STYLE_SEPARATORCOLOR];
		if (color != null) {
			this.separator = document.createElementNS(mxConstants.NS_SVG,
					'line');
			this.separator.setAttribute('stroke', color);
			this.separator.setAttribute('fill', 'none');
			this.separator.setAttribute('stroke-dasharray', '2, 2');
			this.separator.setAttribute('shape-rendering', 'optimizeSpeed');
			node.appendChild(this.separator);
		}
		if (this.image != null) {
			this.imageNode = document.createElementNS(mxConstants.NS_SVG,
					'image');
			this.imageNode.setAttributeNS(mxConstants.NS_XLINK, 'href',
					this.image);
			this.configureSvgShape(this.imageNode);
			node.appendChild(this.imageNode);
		}
		return node;
	};
	mxSwimlane.prototype.redrawSvg = function() {
		var tmp = this.isRounded;
		this.isRounded = false;
		this.updateSvgShape(this.innerNode);
		this.updateSvgShape(this.content);
		if (this.shadowNode != null) {
			this.updateSvgShape(this.shadowNode);
			if (this.style[mxConstants.STYLE_HORIZONTAL]) {
				this.shadowNode.setAttribute('width', this.startSize
								* this.scale);
			} else {
				this.shadowNode.setAttribute('height', this.startSize
								* this.scale);
			}
		}
		this.isRounded = tmp;
		this.startSize = parseInt(this.style[mxConstants.STYLE_STARTSIZE])
				|| this.defaultStartSize;
		if (mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, true)) {
			this.startSize = Math.min(this.startSize, this.bounds.height);
			this.innerNode.setAttribute('height', this.startSize * this.scale);
			var h = this.startSize * this.scale;
			var points = 'M ' + this.bounds.x + ' ' + (this.bounds.y + h)
					+ ' l 0 ' + (this.bounds.height - h) + ' l '
					+ this.bounds.width + ' 0' + ' l 0 '
					+ (-this.bounds.height + h);
			this.content.setAttribute('d', points);
			this.content.removeAttribute('x');
			this.content.removeAttribute('y');
			this.content.removeAttribute('width');
			this.content.removeAttribute('height');
			if (this.separator != null) {
				this.separator.setAttribute('x1', this.bounds.x
								+ this.bounds.width);
				this.separator.setAttribute('y1', this.bounds.y
								+ this.startSize * this.scale);
				this.separator.setAttribute('x2', this.bounds.x
								+ this.bounds.width);
				this.separator.setAttribute('y2', this.bounds.y
								+ this.bounds.height);
			}
			if (this.imageNode != null) {
				this.imageNode.setAttribute('x', this.bounds.x
								+ this.bounds.width - this.imageSize - 4);
				this.imageNode.setAttribute('y', this.bounds.y);
				this.imageNode.setAttribute('width', this.imageSize
								* this.scale + 'px');
				this.imageNode.setAttribute('height', this.imageSize
								* this.scale + 'px');
			}
		} else {
			this.startSize = Math.min(this.startSize, this.bounds.width);
			this.innerNode.setAttribute('width', this.startSize * this.scale);
			var w = this.startSize * this.scale;
			var points = 'M ' + (this.bounds.x + w) + ' ' + this.bounds.y
					+ ' l ' + (this.bounds.width - w) + ' 0' + ' l 0 '
					+ this.bounds.height + ' l ' + (-this.bounds.width + w)
					+ ' 0';
			this.content.setAttribute('d', points);
			this.content.removeAttribute('x');
			this.content.removeAttribute('y');
			this.content.removeAttribute('width');
			this.content.removeAttribute('height');
			if (this.separator != null) {
				this.separator.setAttribute('x1', this.bounds.x
								+ this.startSize * this.scale);
				this.separator.setAttribute('y1', this.bounds.y
								+ this.bounds.height);
				this.separator.setAttribute('x2', this.bounds.x
								+ this.bounds.width);
				this.separator.setAttribute('y2', this.bounds.y
								+ this.bounds.height);
			}
			if (this.imageNode != null) {
				this.imageNode.setAttribute('x', this.bounds.x
								+ this.bounds.width - this.imageSize - 4);
				this.imageNode.setAttribute('y', this.bounds.y);
				this.imageNode.setAttribute('width', this.imageSize
								* this.scale + 'px');
				this.imageNode.setAttribute('height', this.imageSize
								* this.scale + 'px');
			}
		}
	};
}

{
	function mxGraphLayout(graph) {
		this.graph = graph;
	};
	mxGraphLayout.prototype.graph = null;
	mxGraphLayout.prototype.useBoundingBox = true;
	mxGraphLayout.prototype.moveCell = function(cell, x, y) {
	};
	mxGraphLayout.prototype.execute = function(parent) {
	};
	mxGraphLayout.prototype.getGraph = function() {
		return this.graph;
	};
	mxGraphLayout.prototype.isVertexMovable = function(cell) {
		return this.graph.isCellMovable(cell);
	};
	mxGraphLayout.prototype.isVertexIgnored = function(vertex) {
		return !this.graph.getModel().isVertex(vertex)
				|| !this.graph.isCellVisible(vertex);
	};
	mxGraphLayout.prototype.isEdgeIgnored = function(edge) {
		var model = this.graph.getModel();
		return !model.isEdge(edge) || !this.graph.isCellVisible(edge)
				|| model.getTerminal(edge, true) == null
				|| model.getTerminal(edge, false) == null;
	};
	mxGraphLayout.prototype.setVertexLocation = function(cell, x, y) {
		var model = this.graph.getModel();
		var geometry = model.getGeometry(cell);
		var result = null;
		if (geometry != null) {
			result = new mxRectangle(x, y, geometry.width, geometry.height);

			if (this.useBoundingBox) {
				var state = this.graph.getView().getState(cell);
				if (state != null && state.text != null
						&& state.text.boundingBox != null
						&& state.text.boundingBox.x < state.x) {
					var scale = this.graph.getView().scale;
					var box = state.text.boundingBox;
					x += (state.x - box.x) / scale;
					result.width = box.width;
				}
			}
			if (geometry.x != x || geometry.y != y) {
				geometry = geometry.clone();
				geometry.x = x;
				geometry.y = y;
				model.setGeometry(cell, geometry);
			}
		}
		return result;
	};
	mxGraphLayout.prototype.setEdgeStyleEnabled = function(edge, value) {
		this.graph.setCellStyles(mxConstants.STYLE_NOEDGESTYLE, (value)
						? '0'
						: '1', [edge]);
	};
	mxGraphLayout.prototype.setEdgePoints = function(edge, points) {
		if (edge != null) {
			var model = this.graph.model;
			var geometry = model.getGeometry(edge);
			if (geometry == null) {
				geometry = new mxGeometry();
				geometry.setRelative(true);
			} else {
				geometry = geometry.clone();
			}
			geometry.points = points;
			model.setGeometry(edge, geometry);
		}
	};
	mxGraphLayout.prototype.getVertexBounds = function(cell) {
		var geo = this.graph.getModel().getGeometry(cell);

		if (this.useBoundingBox) {
			var state = this.graph.getView().getState(cell);
			if (state != null && state.text != null
					&& state.text.boundingBox != null) {
				var scale = this.graph.getView().scale;
				var tmp = state.text.boundingBox;
				var dx0 = (tmp.x - state.x) / scale;
				var dy0 = (tmp.y - state.y) / scale;
				var dx1 = (tmp.x + tmp.width - state.x - state.width) / scale;
				var dy1 = (tmp.y + tmp.height - state.y - state.height) / scale;
				geo = new mxRectangle(geo.x + dx0, geo.y + dy0, geo.width - dx0
								+ dx1, geo.height - dy0 + dy1);
			}
		}
		return new mxRectangle(geo.x, geo.y, geo.width, geo.height);
	};
}

{
	function mxStackLayout(graph, horizontal, spacing, x0, y0) {
		mxGraphLayout.call(this, graph);
		this.horizontal = (horizontal != null) ? horizontal : true;
		this.spacing = (spacing != null) ? spacing : graph.gridSize;
		this.x0 = (x0 != null) ? x0 : this.spacing;
		this.y0 = (y0 != null) ? y0 : this.spacing;
	};
	mxStackLayout.prototype = new mxGraphLayout();
	mxStackLayout.prototype.constructor = mxStackLayout;
	mxStackLayout.prototype.horizontal = null;
	mxStackLayout.prototype.spacing = null;
	mxStackLayout.prototype.x0 = null;
	mxStackLayout.prototype.y0 = null;
	mxStackLayout.prototype.keepFirstLocation = false;
	mxStackLayout.prototype.fill = false;
	mxStackLayout.prototype.resizeParent = false;
	mxStackLayout.prototype.wrap = null;
	mxStackLayout.prototype.isHorizontal = function() {
		return this.horizontal;
	};
	mxStackLayout.prototype.moveCell = function(cell, x, y) {
		var model = this.graph.getModel();
		var parent = model.getParent(cell);
		var horizontal = this.isHorizontal();
		if (cell != null && parent != null) {
			var i = 0;
			var last = 0;
			var childCount = model.getChildCount(parent);
			var value = (horizontal) ? x : y;
			var pstate = this.graph.getView().getState(parent);
			if (pstate != null) {
				value -= (horizontal) ? pstate.x : pstate.y;
			}
			for (i = 0; i < childCount; i++) {
				var child = model.getChildAt(parent, i);
				if (child != cell) {
					var bounds = model.getGeometry(child);
					if (bounds != null) {
						var tmp = (horizontal)
								? bounds.x + bounds.width / 2
								: bounds.y + bounds.height / 2;
						if (last < value && tmp > value) {
							break;
						}
						last = tmp;
					}
				}
			}
			var idx = parent.getIndex(cell);
			idx = Math.max(0, i - ((i > idx) ? 1 : 0));
			model.add(parent, cell, idx);
		}
	};
	mxStackLayout.prototype.getParentSize = function(parent) {
		var model = this.graph.getModel();
		var pgeo = model.getGeometry(parent);

		if (this.graph.container != null
				&& ((pgeo == null && model.isLayer(parent)) || parent == this.graph
						.getView().currentRoot)) {
			var width = this.graph.container.offsetWidth;
			var height = this.graph.container.offsetHeight;
			pgeo = new mxRectangle(0, 0, width, height);
		}
		return pgeo;
	};
	mxStackLayout.prototype.execute = function(parent) {
		var horizontal = this.isHorizontal();
		if (parent != null) {
			var model = this.graph.getModel();
			var x0 = this.x0 + 1;
			var y0 = this.y0;
			var pgeo = this.getParentSize(parent);
			var fillValue = 0;
			if (pgeo != null) {
				fillValue = (horizontal) ? pgeo.height : pgeo.width;
			}
			fillValue -= 2 * this.spacing;
			var size = this.graph.getStartSize(parent);
			fillValue -= (horizontal) ? size.height : size.width;
			x0 = this.x0 + size.width;
			y0 = this.y0 + size.height;
			model.beginUpdate();
			try {
				var tmp = 0;
				var last = null;
				var childCount = model.getChildCount(parent);
				for (var i = 0; i < childCount; i++) {
					var child = model.getChildAt(parent, i);
					if (!this.isVertexIgnored(child)
							&& this.isVertexMovable(child)) {
						var geo = model.getGeometry(child);
						if (geo != null) {
							geo = geo.clone();
							if (this.wrap != null && last != null) {
								if ((horizontal && last.x + last.width
										+ geo.width + 2 * this.spacing > this.wrap)
										|| (!horizontal && last.y + last.height
												+ geo.height + 2 * this.spacing > this.wrap)) {
									last = null;
									if (horizontal) {
										y0 += tmp + this.spacing;
									} else {
										x0 += tmp + this.spacing;
									}
									tmp = 0;
								}
							}
							tmp = Math.max(tmp, (horizontal)
											? geo.height
											: geo.width);
							if (last != null) {
								if (horizontal) {
									geo.x = last.x + last.width + this.spacing;
								} else {
									geo.y = last.y + last.height + this.spacing;
								}
							} else if (!this.keepFirstLocation) {
								if (horizontal) {
									geo.x = x0;
								} else {
									geo.y = y0;
								}
							}
							if (horizontal) {
								geo.y = y0;
							} else {
								geo.x = x0;
							}
							if (this.fill && fillValue > 0) {
								if (horizontal) {
									geo.height = fillValue;
								} else {
									geo.width = fillValue;
								}
							}
							model.setGeometry(child, geo);
							last = geo;
						}
					}
				}
				if (this.resizeParent && pgeo != null && last != null
						&& !this.graph.isCellCollapsed(parent)) {
					pgeo = pgeo.clone();
					if (horizontal) {
						pgeo.width = last.x + last.width + this.spacing;
					} else {
						pgeo.height = last.y + last.height + this.spacing;
					}
					model.setGeometry(parent, pgeo);
				}
			} finally {
				model.endUpdate();
			}
		}
	};
}

{
	function mxPartitionLayout(graph, horizontal, spacing, border) {
		mxGraphLayout.call(this, graph);
		this.horizontal = (horizontal != null) ? horizontal : true;
		this.spacing = spacing || 0;
		this.border = border || 0;
	};
	mxPartitionLayout.prototype = new mxGraphLayout();
	mxPartitionLayout.prototype.constructor = mxPartitionLayout;
	mxPartitionLayout.prototype.horizontal = null;
	mxPartitionLayout.prototype.spacing = null;
	mxPartitionLayout.prototype.border = null;
	mxPartitionLayout.prototype.resizeVertices = true;
	mxPartitionLayout.prototype.isHorizontal = function() {
		return this.horizontal;
	};
	mxPartitionLayout.prototype.moveCell = function(cell, x, y) {
		var model = this.graph.getModel();
		var parent = model.getParent(cell);
		if (cell != null && parent != null) {
			var i = 0;
			var last = 0;
			var childCount = model.getChildCount(parent);

			for (i = 0; i < childCount; i++) {
				var child = model.getChildAt(parent, i);
				var bounds = this.getVertexBounds(child);
				if (bounds != null) {
					var tmp = bounds.x + bounds.width / 2;
					if (last < x && tmp > x) {
						break;
					}
					last = tmp;
				}
			}
			var idx = parent.getIndex(cell);
			idx = Math.max(0, i - ((i > idx) ? 1 : 0));
			model.add(parent, cell, idx);
		}
	};
	mxPartitionLayout.prototype.execute = function(parent) {
		var horizontal = this.isHorizontal();
		var model = this.graph.getModel();
		var pgeo = model.getGeometry(parent);

		if (this.graph.container != null
				&& ((pgeo == null && model.isLayer(parent)) || parent == this.graph
						.getView().currentRoot)) {
			var width = this.graph.container.offsetWidth;
			var height = this.graph.container.offsetHeight;
			pgeo = new mxRectangle(0, 0, width, height);
		}
		if (pgeo != null) {
			var children = new Array();
			var childCount = model.getChildCount(parent);
			for (var i = 0; i < childCount; i++) {
				var child = model.getChildAt(parent, i);
				if (!this.isVertexIgnored(child) && this.isVertexMovable(child)) {
					children.push(child);
				}
			}
			var n = children.length;
			if (n > 0) {
				var x0 = this.border;
				var y0 = this.border;
				var other = (horizontal) ? pgeo.height : pgeo.width;
				other -= 2 * this.border;
				var size = this.graph.getStartSize(parent);
				other -= (horizontal) ? size.height : size.width;
				x0 = x0 + size.width;
				y0 = y0 + size.height;
				var tmp = this.border + (n - 1) * this.spacing
				var value = (horizontal)
						? ((pgeo.width - x0 - tmp) / n)
						: ((pgeo.height - y0 - tmp) / n);

				if (value > 0) {
					model.beginUpdate();
					try {
						for (var i = 0; i < n; i++) {
							var child = children[i];
							var geo = model.getGeometry(child);
							if (geo != null) {
								geo = geo.clone();
								geo.x = x0;
								geo.y = y0;
								if (horizontal) {
									if (this.resizeVertices) {
										geo.width = value;
										geo.height = other;
									}
									x0 += value + this.spacing;
								} else {
									if (this.resizeVertices) {
										geo.height = value;
										geo.width = other;
									}
									y0 += value + this.spacing;
								}
								model.setGeometry(child, geo);
							}
						}
					} finally {
						model.endUpdate();
					}
				}
			}
		}
	};
}

{
	function mxCompactTreeLayout(graph, horizontal, invert) {
		mxGraphLayout.call(this, graph);
		this.horizontal = (horizontal != null) ? horizontal : true;
		this.invert = (invert != null) ? invert : false;
	};
	mxCompactTreeLayout.prototype = new mxGraphLayout();
	mxCompactTreeLayout.prototype.constructor = mxCompactTreeLayout;
	mxCompactTreeLayout.prototype.horizontal = null;
	mxCompactTreeLayout.prototype.invert = null;
	mxCompactTreeLayout.prototype.resizeParent = true;
	mxCompactTreeLayout.prototype.moveTree = true;
	mxCompactTreeLayout.prototype.levelDistance = 10;
	mxCompactTreeLayout.prototype.nodeDistance = 20;
	mxCompactTreeLayout.prototype.resetEdges = true;
	mxCompactTreeLayout.prototype.isVertexIgnored = function(vertex) {
		return mxGraphLayout.prototype.isVertexIgnored.apply(this, arguments)
				|| this.graph.getConnections(vertex).length == 0;
	};
	mxCompactTreeLayout.prototype.isHorizontal = function() {
		return this.horizontal;
	};
	mxCompactTreeLayout.prototype.execute = function(parent, root) {
		var model = this.graph.getModel();
		if (root == null) {
			if (this.graph.getEdges(parent, model.getParent(parent),
					this.invert, !this.invert, false).length > 0) {
				root = parent;
			}

			else {
				var roots = this.graph.findTreeRoots(parent, true, this.invert);
				if (roots.length > 0) {
					for (var i = 0; i < roots.length; i++) {
						if (!this.isVertexIgnored(roots[i])
								&& this.graph.getEdges(roots[i], null,
										this.invert, !this.invert, false).length > 0) {
							root = roots[i];
							break;
						}
					}
				}
			}
		}
		if (root != null) {
			parent = model.getParent(root);
			model.beginUpdate();
			try {
				var node = this.dfs(root, parent);
				if (node != null) {
					this.layout(node);
					var x0 = this.graph.gridSize;
					var y0 = x0;
					if (!this.moveTree || model.isLayer(parent)) {
						var g = model.getGeometry(root);
						if (g != null) {
							x0 = g.x;
							y0 = g.y;
						}
					}
					var bounds = null;
					if (this.isHorizontal()) {
						bounds = this.horizontalLayout(node, x0, y0);
					} else {
						bounds = this.verticalLayout(node, null, x0, y0);
					}
					if (bounds != null) {
						var dx = 0;
						var dy = 0;
						if (bounds.x < 0) {
							dx = Math.abs(x0 - bounds.x);
						}
						if (bounds.y < 0) {
							dy = Math.abs(y0 - bounds.y);
						}
						if (parent != null) {
							var size = this.graph.getStartSize(parent);
							dx += size.width;
							dy += size.height;
							if (this.resizeParent
									&& !this.graph.isCellCollapsed(parent)) {
								var g = model.getGeometry(parent);
								if (g != null) {
									var width = bounds.width + size.width
											- bounds.x + 2 * x0;
									var height = bounds.height + size.height
											- bounds.y + 2 * y0;
									g = g.clone();
									if (g.width > width) {
										dx += (g.width - width) / 2;
									} else {
										g.width = width;
									}
									if (g.height > height) {
										if (this.isHorizontal()) {
											dy += (g.height - height) / 2;
										}
									} else {
										g.height = height;
									}
									model.setGeometry(parent, g);
								}
							}
						}
						this.moveNode(node, dx, dy);
					}
				}
			} finally {
				model.endUpdate();
			}
		}
	};
	mxCompactTreeLayout.prototype.moveNode = function(node, dx, dy) {
		node.x += dx;
		node.y += dy;
		this.apply(node);
		var child = node.child;
		while (child != null) {
			this.moveNode(child, dx, dy);
			child = child.next;
		}
	};
	mxCompactTreeLayout.prototype.dfs = function(cell, parent, visited) {
		visited = visited || new Array();
		var id = mxCellPath.create(cell);
		var node = null;
		if (cell != null && visited[id] == null && !this.isVertexIgnored(cell)) {
			visited[id] = cell;
			node = this.createNode(cell);
			var model = this.graph.getModel();
			var prev = null;
			var out = this.graph.getEdges(cell, parent, this.invert,
					!this.invert, false);
			for (var i = 0; i < out.length; i++) {
				var edge = out[i];
				if (!this.isEdgeIgnored(edge)) {
					if (this.resetEdges) {
						this.setEdgePoints(edge, null);
					}
					var target = this.graph.getView().getVisibleTerminal(edge,
							this.invert);
					var tmp = this.dfs(target, parent, visited);
					if (tmp != null && model.getGeometry(target) != null) {
						if (prev == null) {
							node.child = tmp;
						} else {
							prev.next = tmp;
						}
						prev = tmp;
					}
				}
			}
		}
		return node;
	};
	mxCompactTreeLayout.prototype.layout = function(node) {
		if (node != null) {
			var child = node.child;
			while (child != null) {
				this.layout(child);
				child = child.next;
			}
			if (node.child != null) {
				this.attachParent(node, this.join(node));
			} else {
				this.layoutLeaf(node);
			}
		}
	};
	mxCompactTreeLayout.prototype.horizontalLayout = function(node, x0, y0,
			bounds) {
		node.x += x0 + node.offsetX;
		node.y += y0 + node.offsetY;
		bounds = this.apply(node, bounds);
		var child = node.child;
		if (child != null) {
			bounds = this.horizontalLayout(child, node.x, node.y, bounds);
			var siblingOffset = node.y + child.offsetY;
			var s = child.next;
			while (s != null) {
				bounds = this.horizontalLayout(s, node.x + child.offsetX,
						siblingOffset, bounds);
				siblingOffset += s.offsetY;
				s = s.next;
			}
		}
		return bounds;
	};
	mxCompactTreeLayout.prototype.verticalLayout = function(node, parent, x0,
			y0, bounds) {
		node.x += x0 + node.offsetY;
		node.y += y0 + node.offsetX;
		bounds = this.apply(node, bounds);
		var child = node.child;
		if (child != null) {
			bounds = this.verticalLayout(child, node, node.x, node.y, bounds);
			var siblingOffset = node.x + child.offsetY;
			var s = child.next;
			while (s != null) {
				bounds = this.verticalLayout(s, node, siblingOffset, node.y
								+ child.offsetX, bounds);
				siblingOffset += s.offsetY;
				s = s.next;
			}
		}
		return bounds;
	};
	mxCompactTreeLayout.prototype.attachParent = function(node, height) {
		var x = this.nodeDistance + this.levelDistance;
		var y2 = (height - node.width) / 2 - this.nodeDistance;
		var y1 = y2 + node.width + 2 * this.nodeDistance - height;
		node.child.offsetX = x + node.height;
		node.child.offsetY = y1;
		node.contour.upperHead = this.createLine(node.height, 0, this
						.createLine(x, y1, node.contour.upperHead));
		node.contour.lowerHead = this.createLine(node.height, 0, this
						.createLine(x, y2, node.contour.lowerHead));
	};
	mxCompactTreeLayout.prototype.layoutLeaf = function(node) {
		var dist = 2 * this.nodeDistance;
		node.contour.upperTail = this.createLine(node.height + dist, 0);
		node.contour.upperHead = node.contour.upperTail;
		node.contour.lowerTail = this.createLine(0, -node.width - dist);
		node.contour.lowerHead = this.createLine(node.height + dist, 0,
				node.contour.lowerTail);
	};
	mxCompactTreeLayout.prototype.join = function(node) {
		var dist = 2 * this.nodeDistance;
		var child = node.child;
		node.contour = child.contour;
		var h = child.width + dist;
		var sum = h;
		child = child.next;
		while (child != null) {
			var d = this.merge(node.contour, child.contour);
			child.offsetY = d + h;
			child.offsetX = 0;
			h = child.width + dist;
			sum += d + h;
			child = child.next;
		}
		return sum;
	};
	mxCompactTreeLayout.prototype.merge = function(p1, p2) {
		var x = 0;
		var y = 0;
		var total = 0;
		var upper = p1.lowerHead;
		var lower = p2.upperHead;
		while (lower != null && upper != null) {
			var d = this.offset(x, y, lower.dx, lower.dy, upper.dx, upper.dy);
			y += d;
			total += d;
			if (x + lower.dx <= upper.dx) {
				x += lower.dx;
				y += lower.dy;
				lower = lower.next;
			} else {
				x -= upper.dx;
				y -= upper.dy;
				upper = upper.next;
			}
		}
		if (lower != null) {
			var b = this.bridge(p1.upperTail, 0, 0, lower, x, y);
			p1.upperTail = (b.next != null) ? p2.upperTail : b;
			p1.lowerTail = p2.lowerTail;
		} else {
			var b = this.bridge(p2.lowerTail, x, y, upper, 0, 0);
			if (b.next == null) {
				p1.lowerTail = b;
			}
		}
		p1.lowerHead = p2.lowerHead;
		return total;
	};
	mxCompactTreeLayout.prototype.offset = function(p1, p2, a1, a2, b1, b2) {
		var d = 0;
		if (b1 <= p1 || p1 + a1 <= 0) {
			return 0;
		}
		var t = b1 * a2 - a1 * b2;
		if (t > 0) {
			if (p1 < 0) {
				var s = p1 * a2;
				d = s / a1 - p2;
			} else if (p1 > 0) {
				var s = p1 * b2;
				d = s / b1 - p2;
			} else {
				d = -p2;
			}
		} else if (b1 < p1 + a1) {
			var s = (b1 - p1) * a2;
			d = b2 - (p2 + s / a1);
		} else if (b1 > p1 + a1) {
			var s = (a1 + p1) * b2;
			d = s / b1 - (p2 + a2);
		} else {
			d = b2 - (p2 + a2);
		}
		if (d > 0) {
			return d;
		} else {
			return 0;
		}
	};
	mxCompactTreeLayout.prototype.bridge = function(line1, x1, y1, line2, x2,
			y2) {
		var dx = x2 + line2.dx - x1;
		var dy = 0;
		var s = 0;
		if (line2.dx == 0) {
			dy = line2.dy;
		} else {
			var s = dx * line2.dy;
			dy = s / line2.dx;
		}
		var r = this.createLine(dx, dy, line2.next);
		line1.next = this.createLine(0, y2 + line2.dy - dy - y1, r);
		return r;
	};
	mxCompactTreeLayout.prototype.createNode = function(cell) {
		var node = new Object();
		node.cell = cell;
		node.x = 0;
		node.y = 0;
		node.width = 0;
		node.height = 0;
		var geo = this.getVertexBounds(cell);
		if (geo != null) {
			if (this.isHorizontal()) {
				node.width = geo.height;
				node.height = geo.width;
			} else {
				node.width = geo.width;
				node.height = geo.height;
			}
		}
		node.offsetX = 0;
		node.offsetY = 0;
		node.contour = new Object();
		return node;
	};
	mxCompactTreeLayout.prototype.apply = function(node, bounds) {
		var g = this.graph.getModel().getGeometry(node.cell);
		if (node.cell != null && g != null) {
			if (this.isVertexMovable(node.cell)) {
				g = this.setVertexLocation(node.cell, node.x, node.y);
			}
			if (bounds == null) {
				bounds = new mxRectangle(g.x, g.y, g.width, g.height);
			} else {
				bounds = new mxRectangle(Math.min(bounds.x, g.x), Math.min(
								bounds.y, g.y), Math.max(bounds.x
										+ bounds.width, g.x + g.width), Math
								.max(bounds.y + bounds.height, g.y + g.height));
			}
		}
		return bounds;
	};
	mxCompactTreeLayout.prototype.createLine = function(dx, dy, next) {
		var line = new Object();
		line.dx = dx;
		line.dy = dy;
		line.next = next;
		return line;
	};
}

{
	function mxFastOrganicLayout(graph) {
		mxGraphLayout.call(this, graph);
	};
	mxFastOrganicLayout.prototype = new mxGraphLayout();
	mxFastOrganicLayout.prototype.constructor = mxFastOrganicLayout;
	mxFastOrganicLayout.prototype.useInputOrigin = true;
	mxFastOrganicLayout.prototype.resetEdges = true;
	mxFastOrganicLayout.prototype.disableEdgeStyle = true;
	mxFastOrganicLayout.prototype.forceConstant = 50;
	mxFastOrganicLayout.prototype.forceConstantSquared = 0;
	mxFastOrganicLayout.prototype.minDistanceLimit = 2;
	mxFastOrganicLayout.prototype.minDistanceLimitSquared = 4;
	mxFastOrganicLayout.prototype.initialTemp = 200;
	mxFastOrganicLayout.prototype.temperature = 0;
	mxFastOrganicLayout.prototype.maxIterations = 0;
	mxFastOrganicLayout.prototype.iteration = 0;
	mxFastOrganicLayout.prototype.vertexArray;
	mxFastOrganicLayout.prototype.dispX;
	mxFastOrganicLayout.prototype.dispY;
	mxFastOrganicLayout.prototype.cellLocation;
	mxFastOrganicLayout.prototype.radius;
	mxFastOrganicLayout.prototype.radiusSquared;
	mxFastOrganicLayout.prototype.isMoveable;
	mxFastOrganicLayout.prototype.neighbours;
	mxFastOrganicLayout.prototype.indices;
	mxFastOrganicLayout.prototype.allowedToRun = true;
	mxFastOrganicLayout.prototype.isVertexIgnored = function(vertex) {
		return mxGraphLayout.prototype.isVertexIgnored.apply(this, arguments)
				|| this.graph.getConnections(vertex).length == 0;
	};
	mxFastOrganicLayout.prototype.execute = function(parent) {
		var model = this.graph.getModel();
		this.vertexArray = new Array();
		var cells = this.graph.getChildVertices(parent);
		for (var i = 0; i < cells.length; i++) {
			if (!this.isVertexIgnored(cells[i])) {
				this.vertexArray.push(cells[i]);
			}
		}
		var initialBounds = (this.useInputOrigin) ? this.graph.view
				.getBounds(this.vertexArray) : null;
		var n = this.vertexArray.length;
		this.indices = new Array();
		this.dispX = new Array();
		this.dispY = new Array();
		this.cellLocation = new Array();
		this.isMoveable = new Array();
		this.neighbours = new Array();
		this.radius = new Array();
		this.radiusSquared = new Array();
		if (this.forceConstant < 0.001) {
			this.forceConstant = 0.001;
		}
		this.forceConstantSquared = this.forceConstant * this.forceConstant;

		for (var i = 0; i < this.vertexArray.length; i++) {
			var vertex = this.vertexArray[i];
			this.cellLocation[i] = new Array();
			var id = mxCellPath.create(vertex);
			this.indices[id] = i;
			var bounds = this.getVertexBounds(vertex);

			var width = bounds.width;
			var height = bounds.height;
			var x = bounds.x;
			var y = bounds.y;
			this.cellLocation[i][0] = x + width / 2.0;
			this.cellLocation[i][1] = y + height / 2.0;
			this.radius[i] = Math.min(width, height);
			this.radiusSquared[i] = this.radius[i] * this.radius[i];
		}

		model.beginUpdate();
		try {
			for (var i = 0; i < n; i++) {
				this.dispX[i] = 0;
				this.dispY[i] = 0;
				this.isMoveable[i] = this.isVertexMovable(this.vertexArray[i]);

				var edges = this.graph.getConnections(this.vertexArray[i],
						parent);
				var cells = this.graph.getOpposites(edges, this.vertexArray[i]);
				this.neighbours[i] = new Array();
				for (var j = 0; j < cells.length; j++) {
					if (this.resetEdges) {
						this.graph.resetEdge(edges[j]);
					}
					if (this.disableEdgeStyle) {
						this.setEdgeStyleEnabled(edges[j], false);
					}
					var id = mxCellPath.create(cells[j]);
					var index = this.indices[id];

					if (index != null) {
						this.neighbours[i][j] = index;
					}

					else {
						this.neighbours[i][j] = i;
					}
				}
			}
			this.temperature = this.initialTemp;
			if (this.maxIterations == 0) {
				this.maxIterations = 20 * Math.sqrt(n);
			}
			for (this.iteration = 0; this.iteration < this.maxIterations; this.iteration++) {
				if (!this.allowedToRun) {
					return;
				}
				this.calcRepulsion();
				this.calcAttraction();
				this.calcPositions();
				this.reduceTemperature();
			}
			var minx = null;
			var miny = null;
			for (var i = 0; i < this.vertexArray.length; i++) {
				var vertex = this.vertexArray[i];
				if (this.isVertexMovable(vertex)) {
					var bounds = this.getVertexBounds(vertex);
					if (bounds != null) {
						this.cellLocation[i][0] -= bounds.width / 2.0;
						this.cellLocation[i][1] -= bounds.height / 2.0;
						var x = this.graph.snap(this.cellLocation[i][0]);
						var y = this.graph.snap(this.cellLocation[i][1]);
						this.setVertexLocation(vertex, x, y);
						if (minx == null) {
							minx = x;
						} else {
							minx = Math.min(minx, x);
						}
						if (miny == null) {
							miny = y;
						} else {
							miny = Math.min(miny, y);
						}
					}
				}
			}

			var dx = -(minx || 0) + 1;
			var dy = -(miny || 0) + 1;
			if (initialBounds != null) {
				dx += initialBounds.x;
				dy += initialBounds.y;
			}
			this.graph.moveCells(this.vertexArray, dx, dy);
		} finally {
			model.endUpdate();
		}
	};
	mxFastOrganicLayout.prototype.calcPositions = function() {
		for (var index = 0; index < this.vertexArray.length; index++) {
			if (this.isMoveable[index]) {

				var deltaLength = Math.sqrt(this.dispX[index]
						* this.dispX[index] + this.dispY[index]
						* this.dispY[index]);
				if (deltaLength < 0.001) {
					deltaLength = 0.001;
				}

				var newXDisp = this.dispX[index] / deltaLength
						* Math.min(deltaLength, this.temperature);
				var newYDisp = this.dispY[index] / deltaLength
						* Math.min(deltaLength, this.temperature);
				this.dispX[index] = 0;
				this.dispY[index] = 0;
				this.cellLocation[index][0] += newXDisp;
				this.cellLocation[index][1] += newYDisp;
			}
		}
	};
	mxFastOrganicLayout.prototype.calcAttraction = function() {

		for (var i = 0; i < this.vertexArray.length; i++) {
			for (var k = 0; k < this.neighbours[i].length; k++) {
				var j = this.neighbours[i][k];
				if (i != j && this.isMoveable[i] && this.isMoveable[j]) {
					var xDelta = this.cellLocation[i][0]
							- this.cellLocation[j][0];
					var yDelta = this.cellLocation[i][1]
							- this.cellLocation[j][1];
					var deltaLengthSquared = xDelta * xDelta + yDelta * yDelta
							- this.radiusSquared[i] - this.radiusSquared[j];
					if (deltaLengthSquared < this.minDistanceLimitSquared) {
						deltaLengthSquared = this.minDistanceLimitSquared;
					}
					var deltaLength = Math.sqrt(deltaLengthSquared);
					var force = (deltaLengthSquared) / this.forceConstant;
					var displacementX = (xDelta / deltaLength) * force;
					var displacementY = (yDelta / deltaLength) * force;
					this.dispX[i] -= displacementX;
					this.dispY[i] -= displacementY;
					this.dispX[j] += displacementX;
					this.dispY[j] += displacementY;
				}
			}
		}
	};
	mxFastOrganicLayout.prototype.calcRepulsion = function() {
		var vertexCount = this.vertexArray.length;
		for (var i = 0; i < vertexCount; i++) {
			for (var j = i; j < vertexCount; j++) {
				if (!this.allowedToRun) {
					return;
				}
				if (j != i && this.isMoveable[i] && this.isMoveable[j]) {
					var xDelta = this.cellLocation[i][0]
							- this.cellLocation[j][0];
					var yDelta = this.cellLocation[i][1]
							- this.cellLocation[j][1];
					if (xDelta == 0) {
						xDelta = 0.01 + Math.random();
					}
					if (yDelta == 0) {
						yDelta = 0.01 + Math.random();
					}
					var deltaLength = Math.sqrt((xDelta * xDelta)
							+ (yDelta * yDelta));
					var deltaLengthWithRadius = deltaLength - this.radius[i]
							- this.radius[j];
					if (deltaLengthWithRadius < this.minDistanceLimit) {
						deltaLengthWithRadius = this.minDistanceLimit;
					}
					var force = this.forceConstantSquared
							/ deltaLengthWithRadius;
					var displacementX = (xDelta / deltaLength) * force;
					var displacementY = (yDelta / deltaLength) * force;
					this.dispX[i] += displacementX;
					this.dispY[i] += displacementY;
					this.dispX[j] -= displacementX;
					this.dispY[j] -= displacementY;
				}
			}
		}
	};
	mxFastOrganicLayout.prototype.reduceTemperature = function() {
		this.temperature = this.initialTemp
				* (1.0 - this.iteration / this.maxIterations);
	};
}

{
	function mxCircleLayout(graph, radius) {
		mxGraphLayout.call(this, graph);
		this.radius = (radius != null) ? radius : 100;
	};
	mxCircleLayout.prototype = new mxGraphLayout();
	mxCircleLayout.prototype.constructor = mxCircleLayout;
	mxCircleLayout.prototype.radius = null;
	mxCircleLayout.prototype.moveCircle = false;
	mxCircleLayout.prototype.x0 = 0;
	mxCircleLayout.prototype.y0 = 0;
	mxCircleLayout.prototype.resetEdges = true;
	mxCircleLayout.prototype.disableEdgeStyle = true;
	mxCircleLayout.prototype.execute = function(parent) {
		var model = this.graph.getModel();

		model.beginUpdate();
		try {

			var max = 0;
			var top = null;
			var left = null;
			var vertices = new Array();
			var childCount = model.getChildCount(parent);
			for (var i = 0; i < childCount; i++) {
				var cell = model.getChildAt(parent, i);
				if (!this.isVertexIgnored(cell)) {
					vertices.push(cell);
					var bounds = this.getVertexBounds(cell);
					if (top == null) {
						top = bounds.y;
					} else {
						top = Math.min(top, bounds.y);
					}
					if (left == null) {
						left = bounds.x;
					} else {
						left = Math.min(left, bounds.x);
					}
					max = Math.max(max, Math.max(bounds.width, bounds.height));
				} else if (!this.isEdgeIgnored(cell)) {
					if (this.resetEdges) {
						this.graph.resetEdge(cell);
					}
					if (this.disableEdgeStyle) {
						this.setEdgeStyleEnabled(cell, false);
					}
				}
			}
			var vertexCount = vertices.length;
			var r = Math.max(vertexCount * max / Math.PI, this.radius);
			if (this.moveCircle) {
				top = this.x0;
				left = this.y0;
			}
			this.circle(vertices, r, left, top);
		} finally {
			model.endUpdate();
		}
	};
	mxCircleLayout.prototype.circle = function(vertices, r, left, top) {
		var vertexCount = vertices.length;
		var phi = 2 * Math.PI / vertexCount;
		for (var i = 0; i < vertexCount; i++) {
			if (this.isVertexMovable(vertices[i])) {
				this.setVertexLocation(vertices[i], left + r + r
								* Math.sin(i * phi), top + r + r
								* Math.cos(i * phi));
			}
		}
	};
}

{
	function mxParallelEdgeLayout(graph) {
		mxGraphLayout.call(this, graph);
	};
	mxParallelEdgeLayout.prototype = new mxGraphLayout();
	mxParallelEdgeLayout.prototype.constructor = mxParallelEdgeLayout;
	mxParallelEdgeLayout.prototype.spacing = 20;
	mxParallelEdgeLayout.prototype.execute = function(parent) {
		var lookup = this.findParallels(parent);
		this.graph.model.beginUpdate();
		try {
			for (var i in lookup) {
				var parallels = lookup[i];
				if (parallels.length > 1) {
					this.layout(parallels);
				}
			}
		} finally {
			this.graph.model.endUpdate();
		}
	};
	mxParallelEdgeLayout.prototype.findParallels = function(parent) {
		var view = this.graph.getView();
		var model = this.graph.getModel();
		var lookup = new Array();
		var childCount = model.getChildCount(parent);
		for (var i = 0; i < childCount; i++) {
			var child = model.getChildAt(parent, i);
			if (!this.isEdgeIgnored(child)) {
				var id = this.getEdgeId(child);
				if (id != null) {
					if (lookup[id] == null) {
						lookup[id] = new Array();
					}
					lookup[id].push(child);
				}
			}
		}
		return lookup;
	};
	mxParallelEdgeLayout.prototype.getEdgeId = function(edge) {
		var view = this.graph.getView();
		var src = view.getVisibleTerminal(edge, true);
		var trg = view.getVisibleTerminal(edge, false);
		if (src != null && trg != null) {
			src = mxCellPath.create(src);
			trg = mxCellPath.create(trg);
			return (src > trg) ? trg + '-' + src : src + '-' + trg;
		}
		return null;
	};
	mxParallelEdgeLayout.prototype.layout = function(parallels) {
		var edge = parallels[0];
		var view = this.graph.getView();
		var model = this.graph.getModel();
		var src = model.getGeometry(model.getTerminal(edge, true));
		var trg = model.getGeometry(model.getTerminal(edge, false));
		if (src == trg) {
			var x0 = src.x + src.width + this.spacing;
			var y0 = src.y + src.height / 2;
			for (var i = 0; i < parallels.length; i++) {
				this.route(parallels[i], x0, y0);
				x0 += this.spacing;
			}
		} else if (src != null && trg != null) {
			var scx = src.x + src.width / 2;
			var scy = src.y + src.height / 2;
			var tcx = trg.x + trg.width / 2;
			var tcy = trg.y + trg.height / 2;
			var dx = tcx - scx;
			var dy = tcy - scy;
			var len = Math.sqrt(dx * dx + dy * dy);
			var x0 = scx + dx / 2;
			var y0 = scy + dy / 2;
			var nx = dy * this.spacing / len;
			var ny = dx * this.spacing / len;
			x0 += nx * (parallels.length - 1) / 2;
			y0 -= ny * (parallels.length - 1) / 2;
			for (var i = 0; i < parallels.length; i++) {
				this.route(parallels[i], x0, y0);
				x0 -= nx;
				y0 += ny;
			}
		}
	};
	mxParallelEdgeLayout.prototype.route = function(edge, x, y) {
		if (this.graph.isCellMovable(edge)) {
			this.setEdgePoints(edge, [new mxPoint(x, y)]);
		}
	};
}

{
	function mxCompositeLayout(graph, layouts, master) {
		mxGraphLayout.call(this, graph);
		this.layouts = layouts;
		this.master = master;
	};
	mxCompositeLayout.prototype = new mxGraphLayout();
	mxCompositeLayout.prototype.constructor = mxCompositeLayout;
	mxCompositeLayout.prototype.layouts = null;
	mxCompositeLayout.prototype.master = null;
	mxCompositeLayout.prototype.moveCell = function(cell, x, y) {
		if (this.master != null) {
			this.master.move.apply(this.master, arguments);
		} else {
			this.layouts[0].move.apply(this.layouts[0], arguments);
		}
	};
	mxCompositeLayout.prototype.execute = function(parent) {
		var model = this.graph.getModel();
		model.beginUpdate();
		try {
			for (var i = 0; i < this.layouts.length; i++) {
				this.layouts[i].execute.apply(this.layouts[i], arguments);
			}
		} finally {
			model.endUpdate();
		}
	};
}

{
	function mxEdgeLabelLayout(graph, radius) {
		mxGraphLayout.call(this, graph);
	};
	mxEdgeLabelLayout.prototype = new mxGraphLayout();
	mxEdgeLabelLayout.prototype.constructor = mxEdgeLabelLayout;
	mxEdgeLabelLayout.prototype.execute = function(parent) {
		var view = this.graph.view;
		var model = this.graph.getModel();
		var edges = new Array();
		var vertices = new Array();
		var childCount = model.getChildCount(parent);
		for (var i = 0; i < childCount; i++) {
			var cell = model.getChildAt(parent, i);
			var state = view.getState(cell);
			if (state != null) {
				if (!this.isVertexIgnored(cell)) {
					vertices.push(state);
				} else if (!this.isEdgeIgnored(cell)) {
					edges.push(state);
				}
			}
		}
		this.placeLabels(vertices, edges);
	};
	mxEdgeLabelLayout.prototype.placeLabels = function(v, e) {
		var model = this.graph.getModel();

		model.beginUpdate();
		try {
			for (var i = 0; i < e.length; i++) {
				var edge = e[i];
				if (edge != null && edge.text != null
						&& edge.text.boundingBox != null) {
					for (var j = 0; j < v.length; j++) {
						var vertex = v[j];
						if (vertex != null) {
							this.avoid(edge, vertex);
						}
					}
				}
			}
		} finally {
			model.endUpdate();
		}
	};
	mxEdgeLabelLayout.prototype.avoid = function(edge, vertex) {
		var model = this.graph.getModel();
		var labRect = edge.text.boundingBox;
		if (mxUtils.intersects(labRect, vertex)) {
			var dy1 = -labRect.y - labRect.height + vertex.y;
			var dy2 = -labRect.y + vertex.y + vertex.height;
			var dy = (Math.abs(dy1) < Math.abs(dy2)) ? dy1 : dy2;
			var dx1 = -labRect.x - labRect.width + vertex.x;
			var dx2 = -labRect.x + vertex.x + vertex.width;
			var dx = (Math.abs(dx1) < Math.abs(dx2)) ? dx1 : dx2;
			if (Math.abs(dx) < Math.abs(dy)) {
				dy = 0;
			} else {
				dx = 0;
			}
			var g = model.getGeometry(edge.cell);
			if (g != null) {
				g = g.clone();
				if (g.offset != null) {
					g.offset.x += dx;
					g.offset.y += dy;
				} else {
					g.offset = new mxPoint(dx, dy);
				}
				model.setGeometry(edge.cell, g);
			}
		}
	};
}

{
	function mxGraphAbstractHierarchyCell() {
		this.x = new Array();
		this.y = new Array();
		this.temp = new Array();
	};
	mxGraphAbstractHierarchyCell.prototype.maxRank = -1;
	mxGraphAbstractHierarchyCell.prototype.minRank = -1;
	mxGraphAbstractHierarchyCell.prototype.x = null;
	mxGraphAbstractHierarchyCell.prototype.y = null;
	mxGraphAbstractHierarchyCell.prototype.width = 0;
	mxGraphAbstractHierarchyCell.prototype.height = 0;
	mxGraphAbstractHierarchyCell.prototype.nextLayerConnectedCells = null;
	mxGraphAbstractHierarchyCell.prototype.previousLayerConnectedCells = null;
	mxGraphAbstractHierarchyCell.prototype.temp = null;
	mxGraphAbstractHierarchyCell.prototype.getNextLayerConnectedCells = function(
			layer) {
		return null;
	};
	mxGraphAbstractHierarchyCell.prototype.getPreviousLayerConnectedCells = function(
			layer) {
		return null;
	};
	mxGraphAbstractHierarchyCell.prototype.isEdge = function() {
		return false;
	};
	mxGraphAbstractHierarchyCell.prototype.isVertex = function() {
		return false;
	};
	mxGraphAbstractHierarchyCell.prototype.getGeneralPurposeVariable = function(
			layer) {
		return null;
	};
	mxGraphAbstractHierarchyCell.prototype.setGeneralPurposeVariable = function(
			layer, value) {
		return null;
	};
	mxGraphAbstractHierarchyCell.prototype.setX = function(layer, value) {
		if (this.isVertex()) {
			this.x[0] = value;
		} else if (this.isEdge()) {
			this.x[layer - this.minRank - 1] = value;
		}
	};
	mxGraphAbstractHierarchyCell.prototype.getX = function(layer) {
		if (this.isVertex()) {
			return this.x[0];
		} else if (this.isEdge()) {
			return this.x[layer - this.minRank - 1];
		}
		return 0.0;
	};
	mxGraphAbstractHierarchyCell.prototype.setY = function(layer, value) {
		if (this.isVertex()) {
			this.y[0] = value;
		} else if (this.isEdge()) {
			this.y[layer - this.minRank - 1] = value;
		}
	};
}

{
	function mxGraphHierarchyNode(cell) {
		mxGraphAbstractHierarchyCell.apply(this, arguments);
		this.cell = cell;
	};
	mxGraphHierarchyNode.prototype = new mxGraphAbstractHierarchyCell();
	mxGraphHierarchyNode.prototype.constructor = mxGraphHierarchyNode;
	mxGraphHierarchyNode.prototype.cell = null;
	mxGraphHierarchyNode.prototype.connectsAsTarget = new Array();
	mxGraphHierarchyNode.prototype.connectsAsSource = new Array();
	mxGraphHierarchyNode.prototype.hashCode = false;
	mxGraphHierarchyNode.prototype.getRankValue = function(layer) {
		return this.maxRank;
	};
	mxGraphHierarchyNode.prototype.getNextLayerConnectedCells = function(layer) {
		if (this.nextLayerConnectedCells == null) {
			this.nextLayerConnectedCells = new Array();
			this.nextLayerConnectedCells[0] = new Array();
			for (var i = 0; i < this.connectsAsTarget.length; i++) {
				var edge = this.connectsAsTarget[i];
				if (edge.maxRank == -1 || edge.maxRank == layer + 1) {

					this.nextLayerConnectedCells[0].push(edge.source);
				} else {
					this.nextLayerConnectedCells[0].push(edge);
				}
			}
		}
		return this.nextLayerConnectedCells[0];
	};
	mxGraphHierarchyNode.prototype.getPreviousLayerConnectedCells = function(
			layer) {
		if (this.previousLayerConnectedCells == null) {
			this.previousLayerConnectedCells = new Array();
			this.previousLayerConnectedCells[0] = new Array();
			for (var i = 0; i < this.connectsAsSource.length; i++) {
				var edge = this.connectsAsSource[i];
				if (edge.minRank == -1 || edge.minRank == layer - 1) {
					this.previousLayerConnectedCells[0].push(edge.target);
				} else {
					this.previousLayerConnectedCells[0].push(edge);
				}
			}
		}
		return this.previousLayerConnectedCells[0];
	};
	mxGraphHierarchyNode.prototype.isVertex = function() {
		return true;
	};
	mxGraphHierarchyNode.prototype.getGeneralPurposeVariable = function(layer) {
		return this.temp[0];
	};
	mxGraphHierarchyNode.prototype.setGeneralPurposeVariable = function(layer,
			value) {
		this.temp[0] = value;
	};
	mxGraphHierarchyNode.prototype.isAncestor = function(otherNode) {

		if (otherNode != null && this.hashCode != null
				&& otherNode.hashCode != null
				&& this.hashCode.length < otherNode.hashCode.length) {
			if (this.hashCode == otherNode.hashCode) {
				return true;
			}
			if (this.hashCode == null || this.hashCode == null) {
				return false;
			}

			for (var i = 0; i < this.hashCode.length; i++) {
				if (this.hashCode[i] != otherNode.hashCode[i]) {
					return false;
				}
			}
			return true;
		}
		return false;
	};
}

{
	function mxGraphHierarchyEdge(edges) {
		mxGraphAbstractHierarchyCell.apply(this, arguments);
		this.edges = edges;
	};
	mxGraphHierarchyEdge.prototype = new mxGraphAbstractHierarchyCell();
	mxGraphHierarchyEdge.prototype.constructor = mxGraphHierarchyEdge;
	mxGraphHierarchyEdge.prototype.edges = null;
	mxGraphHierarchyEdge.prototype.source = null;
	mxGraphHierarchyEdge.prototype.target = null;
	mxGraphHierarchyEdge.prototype.isReversed = false;
	mxGraphHierarchyEdge.prototype.invert = function(layer) {
		var temp = this.source;
		this.source = this.target;
		this.target = temp;
		this.isReversed = !this.isReversed;
	};
	mxGraphHierarchyEdge.prototype.getNextLayerConnectedCells = function(layer) {
		if (this.nextLayerConnectedCells == null) {
			this.nextLayerConnectedCells = new Array();
			for (var i = 0; i < this.temp.length; i++) {
				this.nextLayerConnectedCells[i] = new Array();
				if (i == this.nextLayerConnectedCells.length - 1) {
					this.nextLayerConnectedCells[i].push(this.source);
				} else {
					this.nextLayerConnectedCells[i].push(this);
				}
			}
		}
		return this.nextLayerConnectedCells[layer - this.minRank - 1];
	};
	mxGraphHierarchyEdge.prototype.getPreviousLayerConnectedCells = function(
			layer) {
		if (this.previousLayerConnectedCells == null) {
			this.previousLayerConnectedCells = new Array();
			for (var i = 0; i < this.temp.length; i++) {
				this.previousLayerConnectedCells[i] = new Array();
				if (i == 0) {
					this.previousLayerConnectedCells[i].push(this.target);
				} else {
					this.previousLayerConnectedCells[i].push(this);
				}
			}
		}
		return this.previousLayerConnectedCells[layer - this.minRank - 1];
	};
	mxGraphHierarchyEdge.prototype.isEdge = function() {
		return true;
	};
	mxGraphHierarchyEdge.prototype.getGeneralPurposeVariable = function(layer) {
		return this.temp[layer - this.minRank - 1];
	};
	mxGraphHierarchyEdge.prototype.setGeneralPurposeVariable = function(layer,
			value) {
		this.temp[layer - this.minRank - 1] = value;
	};
}

{
	function mxGraphHierarchyModel(layout, vertices, roots, parent, ordered,
			deterministic, tightenToSource) {
		var graph = layout.getGraph();
		this.deterministic = deterministic;
		this.tightenToSource = tightenToSource;
		this.roots = roots;
		this.parent = parent;

		this.vertexMapper = new Object();
		this.edgeMapper = new Object();
		this.maxRank = 0;
		var internalVertices = new Array();
		if (vertices == null) {
			vertices = this.graph.getChildVertices(parent);
		}
		if (ordered) {
			this.formOrderedHierarchy(layout, vertices, parent);
		} else {

			this.createInternalCells(layout, vertices, internalVertices);

			for (var i = 0; i < vertices.length; i++) {
				var edges = internalVertices[i].connectsAsSource;
				for (var j = 0; j < edges.length; j++) {
					var internalEdge = edges[j];
					var realEdges = internalEdge.edges;
					for (var k = 0; k < realEdges.length; k++) {
						var realEdge = realEdges[k];
						var targetCell = graph.getView().getVisibleTerminal(
								realEdge, false);
						var targetCellId = mxCellPath.create(targetCell);
						var internalTargetCell = this.vertexMapper[targetCellId];
						if (internalTargetCell != null
								&& internalVertices[i] != internalTargetCell) {
							internalEdge.target = internalTargetCell;
							if (internalTargetCell.connectsAsTarget.length == 0) {
								internalTargetCell.connectsAsTarget = new Array();
							}
							if (mxUtils.indexOf(
									internalTargetCell.connectsAsTarget,
									internalEdge) < 0) {
								internalTargetCell.connectsAsTarget
										.push(internalEdge);
							}
						}
					}
				}

				internalVertices[i].temp[0] = 1;
			}
		}
	};
	mxGraphHierarchyModel.prototype.sinksAtLayerZero = true;
	mxGraphHierarchyModel.prototype.maxRank = null;
	mxGraphHierarchyModel.prototype.vertexMapper = null;
	mxGraphHierarchyModel.prototype.edgeMapper = null;
	mxGraphHierarchyModel.prototype.ranks = null;
	mxGraphHierarchyModel.prototype.roots = null;
	mxGraphHierarchyModel.prototype.parent = null;
	mxGraphHierarchyModel.prototype.dfsCount = 0;
	mxGraphHierarchyModel.prototype.deterministic;
	mxGraphHierarchyModel.prototype.tightenToSource = false;
	mxGraphHierarchyModel.prototype.formOrderedHierarchy = function(layout,
			vertices, parent) {
		var graph = layout.getGraph();
		this.createInternalCells(layout, vertices, internalVertices);

		var tempList = new Array();
		for (var i = 0; i < vertices.length; i++) {
			var edges = internalVertices[i].connectsAsSource;
			for (var j = 0; j < edges.length; j++) {
				var internalEdge = edges[j];
				var realEdges = internalEdge.edges;
				for (var k = 0; k < realEdges.length; k++) {
					var realEdge = realEdges[k];
					var targetCell = this.graph.getView().getVisibleTerminal(
							realEdge, false);
					var targetCellId = mxCellPath.create(targetCell);
					var internalTargetCell = vertexMapper[targetCellId];
					if (internalTargetCell != null
							&& internalVertices[i] != internalTargetCell) {
						internalEdge.target = internalTargetCell;
						if (internalTargetCell.connectsAsTarget.length == 0) {
							internalTargetCell.connectsAsTarget = new Array();
						}

						if (internalTargetCell.temp[0] == 1) {
							internalEdge.invert();
							internalTargetCell.connectsAsSource
									.push(internalEdge);
							tempList.push(internalEdge);
							if (mxUtils.indexOf(
									internalVertices[i].connectsAsTarget,
									internalEdge) < 0) {
								internalVertices[i].connectsAsTarget
										.push(internalEdge);
							}
						} else {
							if (mxUtils.indexOf(
									internalTargetCell.connectsAsTarget,
									internalEdge) < 0) {
								internalTargetCell.connectsAsTarget
										.push(internalEdge);
							}
						}
					}
				}
			}
			for (var j = 0; j < tempList.length; j++) {
				var tmp = tempList[j];
				mxUtils.remove(tmp, internalVertices[i].connectsAsSource);
			}
			tempList = new Array();

			internalVertices[i].temp[0] = 1;
		}
	};
	mxGraphHierarchyModel.prototype.createInternalCells = function(layout,
			vertices, internalVertices) {
		var graph = layout.getGraph();
		for (var i = 0; i < vertices.length; i++) {
			internalVertices[i] = new mxGraphHierarchyNode(vertices[i]);
			var vertexId = mxCellPath.create(vertices[i]);
			this.vertexMapper[vertexId] = internalVertices[i];

			var conns = graph.getConnections(vertices[i], this.parent);
			var outgoingCells = graph.getOpposites(conns, vertices[i]);
			internalVertices[i].connectsAsSource = new Array();

			for (var j = 0; j < outgoingCells.length; j++) {
				var cell = outgoingCells[j];
				if (cell != vertices[i] && !layout.isVertexIgnored(cell)) {

					var edges = graph.getEdgesBetween(vertices[i], cell, true);
					if (edges != null && edges.length > 0) {
						var internalEdge = new mxGraphHierarchyEdge(edges);
						for (var k = 0; k < edges.length; k++) {
							var edge = edges[k];
							var edgeId = mxCellPath.create(edge);
							this.edgeMapper[edgeId] = internalEdge;

							graph.resetEdge(edge);
							if (layout.disableEdgeStyle) {
								layout.setEdgeStyleEnabled(edge, false);
							}
						}
						internalEdge.source = internalVertices[i];
						if (mxUtils.indexOf(
								internalVertices[i].connectsAsSource,
								internalEdge) < 0) {
							internalVertices[i].connectsAsSource
									.push(internalEdge);
						}
					}
				}
			}
			internalVertices[i].temp[0] = 0;
		}
	};
	mxGraphHierarchyModel.prototype.initialRank = function(startAtSinks) {
		sinksAtLayerZero = startAtSinks;
		var startNodes = null;
		if (!startAtSinks && this.roots != null) {
			startNodes = this.roots.slice();
		} else {
			startNodes = new Array();
		}
		if (startAtSinks) {
			for (var key in this.vertexMapper) {
				var internalNode = this.vertexMapper[key];
				if (internalNode.connectsAsSource == null
						|| internalNode.connectsAsSource.length == 0) {
					startNodes.push(internalNode);
				}
				internalNode.temp[0] = -1;
			}
			if (startNodes.length == 0) {
				startAtSinks = false;
			}
		}
		var startNodesCopy = startNodes.slice();
		while (startNodes.length > 0) {
			var internalNode = startNodes[0];
			var layerDeterminingEdges;
			var edgesToBeMarked;
			if (startAtSinks) {
				layerDeterminingEdges = internalNode.connectsAsSource;
				edgesToBeMarked = internalNode.connectsAsTarget;
			} else {
				layerDeterminingEdges = internalNode.connectsAsTarget;
				edgesToBeMarked = internalNode.connectsAsSource;
			}

			var allEdgesScanned = true;

			var minimumLayer = 0;
			for (var i = 0; i < layerDeterminingEdges.length; i++) {
				var internalEdge = layerDeterminingEdges[i];
				if (internalEdge.temp[0] == 5270620) {

					var otherNode;
					if (startAtSinks) {
						otherNode = internalEdge.target;
					} else {
						otherNode = internalEdge.source;
					}
					minimumLayer = Math
							.max(minimumLayer, otherNode.temp[0] + 1);
				} else {
					allEdgesScanned = false;
					break;
				}
			}

			if (allEdgesScanned) {
				internalNode.temp[0] = minimumLayer;
				this.maxRank = Math.max(this.maxRank, minimumLayer);
				if (edgesToBeMarked != null) {
					for (var i = 0; i < edgesToBeMarked.length; i++) {
						var internalEdge = edgesToBeMarked[i];
						internalEdge.temp[0] = 5270620;

						var otherNode;
						if (startAtSinks) {
							otherNode = internalEdge.source;
						} else {
							otherNode = internalEdge.target;
						}
						if (otherNode.temp[0] == -1) {
							startNodes.push(otherNode);

							otherNode.temp[0] = -2;
						}
					}
				}
				startNodes.shift();
			} else {

				var removedCell = startNodes.shift();
				startNodes.push(internalNode);
				if (removedCell == internalNode && startNodes.length == 1) {

					break;
				}
			}
		}
		sinksAtLayerZero = startAtSinks;
		if (startAtSinks) {
			if (this.tightenToSource) {
				for (var i = 0; i < startNodesCopy.length; i++) {
					var internalNode = startNodesCopy[i];
					var currentMinLayer = 1000000;
					var layerDeterminingEdges = internalNode.connectsAsTarget;
					for (var j = 0; j < internalNode.connectsAsTarget.length; j++) {
						var internalEdge = internalNode.connectsAsTarget[j];
						var otherNode = internalEdge.source;
						internalNode.temp[0] = Math.min(currentMinLayer,
								otherNode.temp[0] - 1);
						currentMinLayer = internalNode.temp[0];
					}
				}
			}
		}
	};
	mxGraphHierarchyModel.prototype.fixRanks = function() {
		var rankList = new Array();
		this.ranks = new Array();
		for (var i = 0; i < this.maxRank + 1; i++) {
			rankList[i] = new Array();
			this.ranks[i] = rankList[i];
		}

		var rootsArray = null;
		if (this.roots != null) {
			var oldRootsArray = this.roots;
			rootsArray = new Array();
			for (var i = 0; i < oldRootsArray.length; i++) {
				var cell = oldRootsArray[i];
				var cellId = mxCellPath.create(cell);
				var internalNode = this.vertexMapper[cellId];
				rootsArray[i] = internalNode;
			}
		}
		this.visit(function(parent, node, edge, layer, seen) {
					if (seen == 0 && node.maxRank < 0 && node.minRank < 0) {
						rankList[node.temp[0]].push(node);
						node.maxRank = node.temp[0];
						node.minRank = node.temp[0];
						node.temp[0] = rankList[node.maxRank].length - 1;
					}
					if (parent != null && edge != null) {
						var parentToCellRankDifference = parent.maxRank
								- node.maxRank;
						if (parentToCellRankDifference > 1) {
							edge.maxRank = parent.maxRank;
							edge.minRank = node.maxRank;
							edge.temp = new Array();
							edge.x = new Array();
							edge.y = new Array();
							for (var i = edge.minRank + 1; i < edge.maxRank; i++) {

								rankList[i].push(edge);
								edge.setGeneralPurposeVariable(i,
										rankList[i].length - 1);
							}
						}
					}
				}, rootsArray, false, null);
	};
	mxGraphHierarchyModel.prototype.visit = function(visitor, dfsRoots,
			trackAncestors, seenNodes) {
		if (dfsRoots != null) {
			for (var i = 0; i < dfsRoots.length; i++) {
				var internalNode = dfsRoots[i];
				if (internalNode != null) {
					if (seenNodes == null) {
						seenNodes = new Object();
					}
					if (trackAncestors) {
						internalNode.hashCode = new Array();
						internalNode.hashCode[0] = this.dfsCount;
						internalNode.hashCode[1] = i;
						this.extendedDfs(null, internalNode, null, visitor,
								seenNodes, internalNode.hashCode, i, 0);
					} else {
						this.dfs(null, internalNode, null, visitor, seenNodes,
								0);
					}
				}
			}
			this.dfsCount++;
		}
	};
	mxGraphHierarchyModel.prototype.dfs = function(parent, root,
			connectingEdge, visitor, seen, layer) {
		if (root != null) {
			var rootId = mxCellPath.create(root.cell);
			if (seen[rootId] == null) {
				seen[rootId] = root;
				visitor(parent, root, connectingEdge, layer, 0);

				for (var i = 0; i < root.connectsAsSource.length; i++) {
					var internalEdge = root.connectsAsSource[i];
					var targetNode = internalEdge.target;
					this.dfs(root, targetNode, internalEdge, visitor, seen,
							layer + 1);
				}
			} else {
				visitor(parent, root, connectingEdge, layer, 1);
			}
		}
	};
	mxGraphHierarchyModel.prototype.extendedDfs = function(parent, root,
			connectingEdge, visitor, seen, ancestors, childHash, layer) {

		if (root != null) {
			if (parent != null) {

				if (root.hashCode == null
						|| root.hashCode[0] != parent.hashCode[0]) {
					var hashCodeLength = parent.hashCode.length + 1;
					root.hashCode = parent.hashCode.slice();
					root.hashCode[hashCodeLength - 1] = childHash;
				}
			}
			var rootId = mxCellPath.create(root.cell);
			if (seen[rootId] == null) {
				seen[rootId] = root;
				visitor(parent, root, connectingEdge, layer, 0);

				var outgoingEdges = root.connectsAsSource.slice();
				for (var i = 0; i < root.connectsAsSource.length; i++) {
					var internalEdge = root.connectsAsSource[i];
					var targetNode = internalEdge.target;
					this.extendedDfs(root, targetNode, internalEdge, visitor,
							seen, root.hashCode, i, layer + 1);
				}
			} else {
				visitor(parent, root, connectingEdge, layer, 1);
			}
		}
	};
}

{
	function mxHierarchicalLayoutStage() {
	};
	mxHierarchicalLayoutStage.prototype.execute = function(parent) {
	};
}

{
	function mxMedianHybridCrossingReduction(layout) {
		this.layout = layout;
	};
	mxMedianHybridCrossingReduction.prototype = new mxHierarchicalLayoutStage();
	mxMedianHybridCrossingReduction.prototype.constructor = mxMedianHybridCrossingReduction;
	mxMedianHybridCrossingReduction.prototype.layout = null;
	mxMedianHybridCrossingReduction.prototype.maxIterations = 24;
	mxMedianHybridCrossingReduction.prototype.nestedBestRanks = null;
	mxMedianHybridCrossingReduction.prototype.currentBestCrossings = 0;
	mxMedianHybridCrossingReduction.prototype.iterationsWithoutImprovement = 0;
	mxMedianHybridCrossingReduction.prototype.maxNoImprovementIterations = 2;
	mxMedianHybridCrossingReduction.prototype.execute = function(parent) {
		var model = this.layout.getModel();
		this.nestedBestRanks = new Array();
		for (var i = 0; i < model.ranks.length; i++) {
			this.nestedBestRanks[i] = model.ranks[i].slice();
		}
		var iterationsWithoutImprovement = 0;
		var currentBestCrossings = this.calculateCrossings(model);
		for (var i = 0; i < this.maxIterations
				&& iterationsWithoutImprovement < this.maxNoImprovementIterations; i++) {
			this.weightedMedian(i, model);
			this.transpose(i, model);
			var candidateCrossings = this.calculateCrossings(model);
			if (candidateCrossings < currentBestCrossings) {
				currentBestCrossings = candidateCrossings;
				iterationsWithoutImprovement = 0;
				for (var j = 0; j < this.nestedBestRanks.length; j++) {
					var rank = model.ranks[j];
					for (var k = 0; k < rank.length; k++) {
						var cell = rank[k];
						this.nestedBestRanks[j][cell
								.getGeneralPurposeVariable(j)] = cell;
					}
				}
			} else {

				iterationsWithoutImprovement++;
				for (var j = 0; j < this.nestedBestRanks.length; j++) {
					var rank = model.ranks[j];
					for (var k = 0; k < rank.length; k++) {
						var cell = rank[k];
						cell.setGeneralPurposeVariable(j, k);
					}
				}
			}
			if (currentBestCrossings == 0) {
				break;
			}
		}
		var ranks = new Array();
		var rankList = new Array();
		for (var i = 0; i < model.maxRank + 1; i++) {
			rankList[i] = new Array();
			ranks[i] = rankList[i];
		}
		for (var i = 0; i < this.nestedBestRanks.length; i++) {
			for (var j = 0; j < this.nestedBestRanks[i].length; j++) {
				rankList[i].push(this.nestedBestRanks[i][j]);
			}
		}
		model.ranks = ranks;
	};
	mxMedianHybridCrossingReduction.prototype.calculateCrossings = function(
			model) {
		var numRanks = model.ranks.length;
		var totalCrossings = 0;
		for (var i = 1; i < numRanks; i++) {
			totalCrossings += this.calculateRankCrossing(i, model);
		}
		return totalCrossings;
	};
	mxMedianHybridCrossingReduction.prototype.calculateRankCrossing = function(
			i, model) {
		var totalCrossings = 0;
		var rank = model.ranks[i];
		var previousRank = model.ranks[i - 1];
		var currentRankSize = rank.length;
		var previousRankSize = previousRank.length;
		var connections = new Array();
		for (var j = 0; j < currentRankSize; j++) {
			connections[j] = new Array();
		}
		for (var j = 0; j < rank.length; j++) {
			var node = rank[j];
			var rankPosition = node.getGeneralPurposeVariable(i);
			var connectedCells = node.getPreviousLayerConnectedCells(i);
			for (var k = 0; k < connectedCells.length; k++) {
				var connectedNode = connectedCells[k];
				var otherCellRankPosition = connectedNode
						.getGeneralPurposeVariable(i - 1);
				connections[rankPosition][otherCellRankPosition] = 201207;
			}
		}

		for (var j = 0; j < currentRankSize; j++) {
			for (var k = 0; k < previousRankSize; k++) {
				if (connections[j][k] == 201207) {

					for (var j2 = j + 1; j2 < currentRankSize; j2++) {
						for (var k2 = 0; k2 < k; k2++) {
							if (connections[j2][k2] == 201207) {
								totalCrossings++;
							}
						}
					}
					for (var j2 = 0; j2 < j; j2++) {
						for (var k2 = k + 1; k2 < previousRankSize; k2++) {
							if (connections[j2][k2] == 201207) {
								totalCrossings++;
							}
						}
					}
				}
			}
		}
		return totalCrossings / 2;
	};
	mxMedianHybridCrossingReduction.prototype.transpose = function(
			mainLoopIteration, model) {
		var improved = true;
		var count = 0;
		var maxCount = 10;
		while (improved && count++ < maxCount) {

			var nudge = mainLoopIteration % 2 == 1 && count % 2 == 1;
			improved = false;
			for (var i = 0; i < model.ranks.length; i++) {
				var rank = model.ranks[i];
				var orderedCells = new Array();
				for (var j = 0; j < rank.length; j++) {
					var cell = rank[j];
					var tempRank = cell.getGeneralPurposeVariable(i);
					if (tempRank < 0) {
						tempRank = j;
					}
					orderedCells[tempRank] = cell;
				}
				var leftCellAboveConnections = null;
				var leftCellBelowConnections = null;
				var rightCellAboveConnections = null;
				var rightCellBelowConnections = null;
				var leftAbovePositions = null;
				var leftBelowPositions = null;
				var rightAbovePositions = null;
				var rightBelowPositions = null;
				var leftCell = null;
				var rightCell = null;
				for (var j = 0; j < (rank.length - 1); j++) {

					if (j == 0) {
						leftCell = orderedCells[j];
						leftCellAboveConnections = leftCell
								.getNextLayerConnectedCells(i);
						leftCellBelowConnections = leftCell
								.getPreviousLayerConnectedCells(i);
						leftAbovePositions = new Array();
						leftBelowPositions = new Array();
						for (var k = 0; k < leftAbovePositions.length; k++) {
							leftAbovePositions[k] = leftCellAboveConnections[k]
									.getGeneralPurposeVariable(i + 1);
						}
						for (var k = 0; k < leftBelowPositions.length; k++) {
							leftBelowPositions[k] = leftCellBelowConnections[k]
									.getGeneralPurposeVariable(i - 1);
						}
					} else {
						leftCellAboveConnections = rightCellAboveConnections;
						leftCellBelowConnections = rightCellBelowConnections;
						leftAbovePositions = rightAbovePositions;
						leftBelowPositions = rightBelowPositions;
						leftCell = rightCell;
					}
					rightCell = orderedCells[j + 1];
					rightCellAboveConnections = rightCell
							.getNextLayerConnectedCells(i);
					rightCellBelowConnections = rightCell
							.getPreviousLayerConnectedCells(i);
					rightAbovePositions = new Array();
					rightBelowPositions = new Array();
					for (var k = 0; k < rightAbovePositions.length; k++) {
						rightAbovePositions[k] = rightCellAboveConnections[k]
								.getGeneralPurposeVariable(i + 1);
					}
					for (var k = 0; k < rightBelowPositions.length; k++) {
						rightBelowPositions[k] = rightCellBelowConnections[k]
								.getGeneralPurposeVariable(i - 1);
					}
					var totalCurrentCrossings = 0;
					var totalSwitchedCrossings = 0;
					for (var k = 0; k < leftAbovePositions.length; k++) {
						for (var ik = 0; ik < rightAbovePositions.length; ik++) {
							if (leftAbovePositions[k] > rightAbovePositions[ik]) {
								totalCurrentCrossings++;
							}
							if (leftAbovePositions[k] < rightAbovePositions[ik]) {
								totalSwitchedCrossings++;
							}
						}
					}
					for (var k = 0; k < leftBelowPositions.length; k++) {
						for (var ik = 0; ik < rightBelowPositions.length; ik++) {
							if (leftBelowPositions[k] > rightBelowPositions[ik]) {
								totalCurrentCrossings++;
							}
							if (leftBelowPositions[k] < rightBelowPositions[ik]) {
								totalSwitchedCrossings++;
							}
						}
					}
					if ((totalSwitchedCrossings < totalCurrentCrossings)
							|| (totalSwitchedCrossings == totalCurrentCrossings && nudge)) {
						var temp = leftCell.getGeneralPurposeVariable(i);
						leftCell.setGeneralPurposeVariable(i, rightCell
										.getGeneralPurposeVariable(i));
						rightCell.setGeneralPurposeVariable(i, temp);

						rightCellAboveConnections = leftCellAboveConnections;
						rightCellBelowConnections = leftCellBelowConnections;
						rightAbovePositions = leftAbovePositions;
						rightBelowPositions = leftBelowPositions;
						rightCell = leftCell;
						if (!nudge) {

							improved = true;
						}
					}
				}
			}
		}
	};
	mxMedianHybridCrossingReduction.prototype.weightedMedian = function(
			iteration, model) {
		var downwardSweep = (iteration % 2 == 0);
		if (downwardSweep) {
			for (var j = model.maxRank - 1; j >= 0; j--) {
				this.medianRank(j, downwardSweep);
			}
		} else {
			for (var j = 1; j < model.maxRank; j++) {
				this.medianRank(j, downwardSweep);
			}
		}
	};
	mxMedianHybridCrossingReduction.prototype.medianRank = function(rankValue,
			downwardSweep) {
		var numCellsForRank = this.nestedBestRanks[rankValue].length;
		var medianValues = new Array();
		for (var i = 0; i < numCellsForRank; i++) {
			var cell = this.nestedBestRanks[rankValue][i];
			medianValues[i] = new MedianCellSorter();
			medianValues[i].cell = cell;

			medianValues[i].nudge = !downwardSweep;
			var nextLevelConnectedCells;
			if (downwardSweep) {
				nextLevelConnectedCells = cell
						.getNextLayerConnectedCells(rankValue);
			} else {
				nextLevelConnectedCells = cell
						.getPreviousLayerConnectedCells(rankValue);
			}
			var nextRankValue;
			if (downwardSweep) {
				nextRankValue = rankValue + 1;
			} else {
				nextRankValue = rankValue - 1;
			}
			if (nextLevelConnectedCells != null
					&& nextLevelConnectedCells.length != 0) {
				medianValues[i].medianValue = this.medianValue(
						nextLevelConnectedCells, nextRankValue);
			} else {

				medianValues[i].medianValue = -1.0;

			}
		}
		medianValues.sort(MedianCellSorter.prototype.compare);

		for (var i = 0; i < numCellsForRank; i++) {
			medianValues[i].cell.setGeneralPurposeVariable(rankValue, i);
		}
	};
	mxMedianHybridCrossingReduction.prototype.medianValue = function(
			connectedCells, rankValue) {
		var medianValues = new Array();
		var arrayCount = 0;
		for (var i = 0; i < connectedCells.length; i++) {
			var cell = connectedCells[i];
			medianValues[arrayCount++] = cell
					.getGeneralPurposeVariable(rankValue);
		}
		medianValues.sort(MedianCellSorter.prototype.compare);
		if (arrayCount % 2 == 1) {
			return medianValues[arrayCount / 2];
		} else if (arrayCount == 2) {
			return ((medianValues[0] + medianValues[1]) / 2.0);
		} else {
			var medianPoint = arrayCount / 2;
			var leftMedian = medianValues[medianPoint - 1] - medianValues[0];
			var rightMedian = medianValues[arrayCount - 1]
					- medianValues[medianPoint];
			return (medianValues[medianPoint - 1] * rightMedian + medianValues[medianPoint]
					* leftMedian)
					/ (leftMedian + rightMedian);
		}
	};
	{
		function MedianCellSorter() {
		};
		MedianCellSorter.prototype.medianValue = 0;
		MedianCellSorter.prototype.nudge = false;
		MedianCellSorter.prototype.cell = false;
		MedianCellSorter.prototype.compare = function(a, b) {
			if (a != null && b != null) {
				if (b.medianValue > a.medianValue) {
					return -1;
				} else if (b.medianValue < a.medianValue) {
					return 1;
				} else {
					if (b.nudge) {
						return -1;
					} else {
						return 1;
					}
				}
			} else {
				return 0;
			}
		};
	}
}

{
	function mxMinimumCycleRemover(layout) {
		this.layout = layout;
	};
	mxMinimumCycleRemover.prototype = new mxHierarchicalLayoutStage();
	mxMinimumCycleRemover.prototype.constructor = mxMinimumCycleRemover;
	mxMinimumCycleRemover.prototype.layout = null;
	mxMinimumCycleRemover.prototype.execute = function(parent) {
		var model = this.layout.getModel();
		var seenNodes = new Object();
		var unseenNodes = mxUtils.clone(model.vertexMapper, null, true);

		var rootsArray = null;
		if (model.roots != null) {
			var modelRoots = model.roots;
			rootsArray = new Array();
			for (var i = 0; i < modelRoots.length; i++) {
				var nodeId = mxCellPath.create(modelRoots[i]);
				rootsArray[i] = model.vertexMapper[nodeId];
			}
		}
		model.visit(function(parent, node, connectingEdge, layer, seen) {

					if (node.isAncestor(parent)) {
						connectingEdge.invert();
						mxUtils.remove(connectingEdge, parent.connectsAsSource);
						parent.connectsAsTarget.push(connectingEdge);
						mxUtils.remove(connectingEdge, node.connectsAsTarget);
						node.connectsAsSource.push(connectingEdge);
					}
					var cellId = mxCellPath.create(node.cell);
					seenNodes[cellId] = node;
					delete unseenNodes[cellId];
				}, rootsArray, true, null);
		var possibleNewRoots = null;
		if (unseenNodes.lenth > 0) {
			possibleNewRoots = mxUtils.clone(unseenNodes, null, true);
		}

		var seenNodesCopy = mxUtils.clone(seenNodes, null, true);
		model.visit(function(parent, node, connectingEdge, layer, seen) {

					if (node.isAncestor(parent)) {
						connectingEdge.invert();
						mxUtils.remove(connectingEdge, parent.connectsAsSource);
						node.connectsAsSource.push(connectingEdge);
						parent.connectsAsTarget.push(connectingEdge);
						mxUtils.remove(connectingEdge, node.connectsAsTarget);
					}
					var cellId = mxCellPath.create(node.cell);
					seenNodes[cellId] = node;
					delete unseenNodes[cellId];
				}, unseenNodes, true, seenNodesCopy);
		var graph = this.layout.getGraph();
		if (possibleNewRoots != null && possibleNewRoots.length > 0) {
			var roots = model.roots;
			for (var i = 0; i < possibleNewRoots.length; i++) {
				var node = possibleNewRoots[i];
				var realNode = node.cell;
				var numIncomingEdges = graph.getIncomingEdges(realNode).length;
				if (numIncomingEdges == 0) {
					roots.push(realNode);
				}
			}
		}
	};
}

{
	function mxCoordinateAssignment(layout, intraCellSpacing,
			interRankCellSpacing, orientation, initialX, parallelEdgeSpacing) {
		this.layout = layout;
		this.intraCellSpacing = intraCellSpacing;
		this.interRankCellSpacing = interRankCellSpacing;
		this.orientation = orientation;
		this.initialX = initialX;
		this.parallelEdgeSpacing = parallelEdgeSpacing;
	};
	mxCoordinateAssignment.prototype = new mxHierarchicalLayoutStage();
	mxCoordinateAssignment.prototype.constructor = mxCoordinateAssignment;
	mxCoordinateAssignment.prototype.layout = null;
	mxCoordinateAssignment.prototype.intraCellSpacing = 30;
	mxCoordinateAssignment.prototype.interRankCellSpacing = 10;
	mxCoordinateAssignment.prototype.parallelEdgeSpacing = 10;
	mxCoordinateAssignment.prototype.maxIterations = 8;
	mxCoordinateAssignment.prototype.orientation = mxConstants.DIRECTION_NORTH;
	mxCoordinateAssignment.prototype.initialX = null;
	mxCoordinateAssignment.prototype.limitX = null;
	mxCoordinateAssignment.prototype.currentXDelta = null;
	mxCoordinateAssignment.prototype.widestRank = null;
	mxCoordinateAssignment.prototype.widestRankValue = null;
	mxCoordinateAssignment.prototype.rankWidths = null;
	mxCoordinateAssignment.prototype.rankY = null;
	mxCoordinateAssignment.prototype.fineTuning = true;
	mxCoordinateAssignment.prototype.nextLayerConnectedCache = null;
	mxCoordinateAssignment.prototype.previousLayerConnectedCache = null;
	mxCoordinateAssignment.prototype.execute = function(parent) {
		var model = this.layout.getModel();
		this.currentXDelta = 0.0;
		this.initialCoords(this.layout.getGraph(), model);
		if (this.fineTuning) {
			this.minNode(model);
		}
		var bestXDelta = 100000000.0;
		if (this.fineTuning) {
			for (var i = 0; i < this.maxIterations; i++) {
				if (i != 0) {
					this.medianPos(i, model);
					this.minNode(model);
				}

				if (this.currentXDelta < bestXDelta) {
					for (var j = 0; j < model.ranks.length; j++) {
						var rank = model.ranks[j];
						for (var k = 0; k < rank.length; k++) {
							var cell = rank[k];
							cell.setX(j, cell.getGeneralPurposeVariable(j));
						}
					}
					bestXDelta = this.currentXDelta;
				} else {
					for (var j = 0; j < model.ranks.length; j++) {
						var rank = model.ranks[j];
						for (var k = 0; k < rank.length; k++) {
							var cell = rank[k];
							cell.setGeneralPurposeVariable(j, cell.getX(j));
						}
					}
				}
				this.currentXDelta = 0;
			}
		}
		this.setCellLocations(this.layout.getGraph(), model);
	};
	mxCoordinateAssignment.prototype.minNode = function(model) {
		var nodeList = new Array();
		var map = new Array();
		var rank = new Array();
		for (var i = 0; i <= model.maxRank; i++) {
			rank[i] = model.ranks[i];
			for (var j = 0; j < rank[i].length; j++) {

				var node = rank[i][j];
				var nodeWrapper = new WeightedCellSorter(node, i);
				nodeWrapper.rankIndex = j;
				nodeWrapper.visited = true;
				nodeList.push(nodeWrapper);
				var cellId = mxCellPath.create(node.cell);
				map[cellId] = nodeWrapper;
			}
		}

		var maxTries = nodeList.length * 10;
		var count = 0;
		var tolerance = 1;
		while (nodeList.length > 0 && count <= maxTries) {
			var cellWrapper = nodeList.shift();
			var cell = cellWrapper.cell;
			var rankValue = cellWrapper.weightedValue;
			var rankIndex = parseInt(cellWrapper.rankIndex);
			var nextLayerConnectedCells = cell
					.getNextLayerConnectedCells(rankValue);
			var previousLayerConnectedCells = cell
					.getPreviousLayerConnectedCells(rankValue);
			var numNextLayerConnected = nextLayerConnectedCells.length;
			var numPreviousLayerConnected = previousLayerConnectedCells.length;
			var medianNextLevel = this.medianXValue(nextLayerConnectedCells,
					rankValue + 1);
			var medianPreviousLevel = this.medianXValue(
					previousLayerConnectedCells, rankValue - 1);
			var numConnectedNeighbours = numNextLayerConnected
					+ numPreviousLayerConnected;
			var currentPosition = cell.getGeneralPurposeVariable(rankValue);
			var cellMedian = currentPosition;
			if (numConnectedNeighbours > 0) {
				cellMedian = (medianNextLevel * numNextLayerConnected + medianPreviousLevel
						* numPreviousLayerConnected)
						/ numConnectedNeighbours;
			}
			var positionChanged = false;
			if (cellMedian < currentPosition - tolerance) {
				if (rankIndex == 0) {
					cell.setGeneralPurposeVariable(rankValue, cellMedian);
					positionChanged = true;
				} else {
					var leftCell = rank[rankValue][rankIndex - 1];
					var leftLimit = leftCell
							.getGeneralPurposeVariable(rankValue);
					leftLimit = leftLimit + leftCell.width / 2
							+ this.intraCellSpacing + cell.width / 2;
					if (leftLimit < cellMedian) {
						cell.setGeneralPurposeVariable(rankValue, cellMedian);
						positionChanged = true;
					} else if (leftLimit < cell
							.getGeneralPurposeVariable(rankValue)
							- tolerance) {
						cell.setGeneralPurposeVariable(rankValue, leftLimit);
						positionChanged = true;
					}
				}
			} else if (cellMedian > currentPosition + tolerance) {
				var rankSize = rank[rankValue].length;
				if (rankIndex == rankSize - 1) {
					cell.setGeneralPurposeVariable(rankValue, cellMedian);
					positionChanged = true;
				} else {
					var rightCell = rank[rankValue][rankIndex + 1];
					var rightLimit = rightCell
							.getGeneralPurposeVariable(rankValue);
					rightLimit = rightLimit - rightCell.width / 2
							- this.intraCellSpacing - cell.width / 2;
					if (rightLimit > cellMedian) {
						cell.setGeneralPurposeVariable(rankValue, cellMedian);
						positionChanged = true;
					} else if (rightLimit > cell
							.getGeneralPurposeVariable(rankValue)
							+ tolerance) {
						cell.setGeneralPurposeVariable(rankValue, rightLimit);
						positionChanged = true;
					}
				}
			}
			if (positionChanged) {
				for (var i = 0; i < nextLayerConnectedCells.length; i++) {
					var connectedCell = nextLayerConnectedCells[i];
					var connectedCellId = mxCellPath.create(connectedCell.cell);
					var connectedCellWrapper = map[connectedCellId];
					if (connectedCellWrapper != null) {
						if (connectedCellWrapper.visited == false) {
							connectedCellWrapper.visited = true;
							nodeList.push(connectedCellWrapper);
						}
					}
				}
				for (var i = 0; i < previousLayerConnectedCells.length; i++) {
					var connectedCell = previousLayerConnectedCells[i];
					var connectedCellId = mxCellPath.create(connectedCell.cell);
					var connectedCellWrapper = map[connectedCellId];
					if (connectedCellWrapper != null) {
						if (connectedCellWrapper.visited == false) {
							connectedCellWrapper.visited = true;
							nodeList.push(connectedCellWrapper);
						}
					}
				}
			}
			cellWrapper.visited = false;
			count++;
		}
	};
	mxCoordinateAssignment.prototype.medianPos = function(i, model) {
		var downwardSweep = (i % 2 == 0);
		if (downwardSweep) {
			for (var j = model.maxRank; j > 0; j--) {
				this.rankMedianPosition(j - 1, model, j);
			}
		} else {
			for (var j = 0; j < model.maxRank - 1; j++) {
				this.rankMedianPosition(j + 1, model, j);
			}
		}
	};
	mxCoordinateAssignment.prototype.rankMedianPosition = function(rankValue,
			model, nextRankValue) {
		var rank = model.ranks[rankValue];

		var weightedValues = new Array();
		var cellMap = new Array();
		for (var i = 0; i < rank.length; i++) {
			var currentCell = rank[i];
			weightedValues[i] = new WeightedCellSorter();
			weightedValues[i].cell = currentCell;
			weightedValues[i].rankIndex = i;
			var currentCellId = mxCellPath.create(currentCell.cell);
			cellMap[currentCellId] = weightedValues[i];
			var nextLayerConnectedCells = null;
			if (nextRankValue < rankValue) {
				nextLayerConnectedCells = currentCell
						.getPreviousLayerConnectedCells(rankValue);
			} else {
				nextLayerConnectedCells = currentCell
						.getNextLayerConnectedCells(rankValue);
			}

			weightedValues[i].weightedValue = this.calculatedWeightedValue(
					currentCell, nextLayerConnectedCells);
		}
		weightedValues.sort(WeightedCellSorter.prototype.compare);

		for (var i = 0; i < weightedValues.length; i++) {
			var numConnectionsNextLevel = 0;
			var cell = weightedValues[i].cell;
			var nextLayerConnectedCells = null;
			var medianNextLevel = 0;
			if (nextRankValue < rankValue) {
				nextLayerConnectedCells = cell
						.getPreviousLayerConnectedCells(rankValue).slice();
			} else {
				nextLayerConnectedCells = cell
						.getNextLayerConnectedCells(rankValue).slice();
			}
			if (nextLayerConnectedCells != null) {
				numConnectionsNextLevel = nextLayerConnectedCells.length;
				if (numConnectionsNextLevel > 0) {
					medianNextLevel = this.medianXValue(
							nextLayerConnectedCells, nextRankValue);
				} else {

					medianNextLevel = cell.getGeneralPurposeVariable(rankValue);
				}
			}
			var leftBuffer = 0.0;
			var leftLimit = -100000000.0;
			for (var j = weightedValues[i].rankIndex - 1; j >= 0;) {
				var rankId = mxCellPath.create(rank[j].cell);
				var weightedValue = cellMap[rankId];
				if (weightedValue != null) {
					var leftCell = weightedValue.cell;
					if (weightedValue.visited) {

						leftLimit = leftCell
								.getGeneralPurposeVariable(rankValue)
								+ leftCell.width
								/ 2.0
								+ this.intraCellSpacing
								+ leftBuffer + cell.width / 2.0;
						j = -1;
					} else {
						leftBuffer += leftCell.width + this.intraCellSpacing;
						j--;
					}
				}
			}
			var rightBuffer = 0.0;
			var rightLimit = 100000000.0;
			for (var j = weightedValues[i].rankIndex + 1; j < weightedValues.length;) {
				var rankId = mxCellPath.create(rank[j].cell);
				var weightedValue = cellMap[rankId];
				if (weightedValue != null) {
					var rightCell = weightedValue.cell;
					if (weightedValue.visited) {

						rightLimit = rightCell
								.getGeneralPurposeVariable(rankValue)
								- rightCell.width
								/ 2.0
								- this.intraCellSpacing
								- rightBuffer - cell.width / 2.0;
						j = weightedValues.length;
					} else {
						rightBuffer += rightCell.width + this.intraCellSpacing;
						j++;
					}
				}
			}
			if (medianNextLevel >= leftLimit && medianNextLevel <= rightLimit) {
				cell.setGeneralPurposeVariable(rankValue, medianNextLevel);
			} else if (medianNextLevel < leftLimit) {

				cell.setGeneralPurposeVariable(rankValue, leftLimit);
				this.currentXDelta += leftLimit - medianNextLevel;
			} else if (medianNextLevel > rightLimit) {

				cell.setGeneralPurposeVariable(rankValue, rightLimit);
				this.currentXDelta += medianNextLevel - rightLimit;
			}
			weightedValues[i].visited = true;
		}
	};
	mxCoordinateAssignment.prototype.calculatedWeightedValue = function(
			currentCell, collection) {
		var totalWeight = 0;
		for (var i = 0; i < collection.length; i++) {
			var cell = collection[i];
			if (currentCell.isVertex() && cell.isVertex()) {
				totalWeight++;
			} else if (currentCell.isEdge() && cell.isEdge()) {
				totalWeight += 8;
			} else {
				totalWeight += 2;
			}
		}
		return totalWeight;
	};
	mxCoordinateAssignment.prototype.medianXValue = function(connectedCells,
			rankValue) {
		if (connectedCells.length == 0) {
			return 0;
		}
		var medianValues = new Array();
		for (var i = 0; i < connectedCells.length; i++) {
			medianValues[i] = connectedCells[i]
					.getGeneralPurposeVariable(rankValue);
		}
		medianValues.sort(MedianCellSorter.prototype.compare);
		if (connectedCells.length % 2 == 1) {
			return medianValues[connectedCells.length / 2];
		} else {
			var medianPoint = connectedCells.length / 2;
			var leftMedian = medianValues[medianPoint - 1];
			var rightMedian = medianValues[medianPoint];
			return ((leftMedian + rightMedian) / 2);
		}
	};
	mxCoordinateAssignment.prototype.initialCoords = function(facade, model) {
		this.calculateWidestRank(facade, model);
		for (var i = this.widestRank; i >= 0; i--) {
			if (i < model.maxRank) {
				this.rankCoordinates(i, facade, model);
			}
		}
		for (var i = this.widestRank + 1; i <= model.maxRank; i++) {
			if (i > 0) {
				this.rankCoordinates(i, facade, model);
			}
		}
	};
	mxCoordinateAssignment.prototype.rankCoordinates = function(rankValue,
			graph, model) {
		var rank = model.ranks[rankValue];
		var maxY = 0.0;
		var localX = this.initialX
				+ (this.widestRankValue - this.rankWidths[rankValue]) / 2;

		var boundsWarning = false;
		for (var i = 0; i < rank.length; i++) {
			var node = rank[i];
			if (node.isVertex()) {
				var bounds = this.layout.getVertexBounds(node.cell);
				if (bounds != null) {
					if (this.orientation == mxConstants.DIRECTION_NORTH
							|| this.orientation == mxConstants.DIRECTION_SOUTH) {
						node.width = bounds.width;
						node.height = bounds.height;
					} else {
						node.width = bounds.height;
						node.height = bounds.width;
					}
				} else {
					boundsWarning = true;
				}
				maxY = Math.max(maxY, node.height);
			} else if (node.isEdge()) {

				var numEdges = 1;
				if (node.edges != null) {
					numEdges = node.edges.length;
				} else {
					mxLog.warn('edge.edges is null');
				}
				node.width = (numEdges - 1) * this.parallelEdgeSpacing;
			}
			localX += node.width / 2.0;
			node.setX(rankValue, localX);
			node.setGeneralPurposeVariable(rankValue, localX);
			localX += node.width / 2.0;
			localX += this.intraCellSpacing;
		}
		if (boundsWarning == true) {
			mxLog.warn('At least one cell has no bounds');
		}
	};
	mxCoordinateAssignment.prototype.calculateWidestRank = function(graph,
			model) {
		var y = -this.interRankCellSpacing;

		var lastRankMaxCellHeight = 0.0;
		this.rankWidths = new Array();
		this.rankY = new Array();
		for (var rankValue = model.maxRank; rankValue >= 0; rankValue--) {
			var maxCellHeight = 0.0;
			var rank = model.ranks[rankValue];
			var localX = this.initialX;

			var boundsWarning = false;
			for (var i = 0; i < rank.length; i++) {
				var node = rank[i];
				if (node.isVertex()) {
					var bounds = this.layout.getVertexBounds(node.cell);
					if (bounds != null) {
						if (this.orientation == mxConstants.DIRECTION_NORTH
								|| this.orientation == mxConstants.DIRECTION_SOUTH) {
							node.width = bounds.width;
							node.height = bounds.height;
						} else {
							node.width = bounds.height;
							node.height = bounds.width;
						}
					} else {
						boundsWarning = true;
					}
					maxCellHeight = Math.max(maxCellHeight, node.height);
				} else if (node.isEdge()) {

					var numEdges = 1;
					if (node.edges != null) {
						numEdges = node.edges.length;
					} else {
						mxLog.warn('edge.edges is null');
					}
					node.width = (numEdges - 1) * this.parallelEdgeSpacing;
				}
				localX += node.width / 2.0;
				node.setX(rankValue, localX);
				node.setGeneralPurposeVariable(rankValue, localX);
				localX += node.width / 2.0;
				localX += this.intraCellSpacing;
				if (localX > this.widestRankValue) {
					this.widestRankValue = localX;
					this.widestRank = rankValue;
				}
				this.rankWidths[rankValue] = localX;
			}
			if (boundsWarning == true) {
				mxLog.warn('At least one cell has no bounds');
			}
			this.rankY[rankValue] = y;
			var distanceToNextRank = maxCellHeight / 2.0
					+ lastRankMaxCellHeight / 2.0 + this.interRankCellSpacing;
			lastRankMaxCellHeight = maxCellHeight;
			if (this.orientation == mxConstants.DIRECTION_NORTH
					|| this.orientation == mxConstants.DIRECTION_WEST) {
				y += distanceToNextRank;
			} else {
				y -= distanceToNextRank;
			}
			for (var i = 0; i < rank.length; i++) {
				var cell = rank[i];
				cell.setY(rankValue, y);
			}
		}
	};
	mxCoordinateAssignment.prototype.setCellLocations = function(graph, model) {
		for (var i = 0; i < model.ranks.length; i++) {
			var rank = model.ranks[i];
			for (var h = 0; h < rank.length; h++) {
				var node = rank[h];
				if (node.isVertex()) {
					var realCell = node.cell;
					var positionX = node.x[0] - node.width / 2;
					var positionY = node.y[0] - node.height / 2;
					if (this.orientation == mxConstants.DIRECTION_NORTH
							|| this.orientation == mxConstants.DIRECTION_SOUTH) {
						this.layout.setVertexLocation(realCell, positionX,
								positionY);
					} else {
						this.layout.setVertexLocation(realCell, positionY,
								positionX);
					}
					limitX = Math.max(this.limitX, positionX + node.width);
				} else if (node.isEdge()) {

					var offsetX = 0.0;
					if (node.temp[0] != 101207) {
						for (var j = 0; j < node.edges.length; j++) {
							var realEdge = node.edges[j];
							var newPoints = new Array();
							if (node.isReversed) {

								for (var k = 0; k < node.x.length; k++) {
									var positionX = node.x[k] + offsetX;
									if (this.orientation == mxConstants.DIRECTION_NORTH
											|| this.orientation == mxConstants.DIRECTION_SOUTH) {
										newPoints.push(new mxPoint(positionX,
												node.y[k]));
									} else {
										newPoints.push(new mxPoint(node.y[k],
												positionX));
									}
									limitX = Math.max(limitX, positionX);
								}
								this.processReversedEdge(node, realEdge);
							} else {
								for (var k = node.x.length - 1; k >= 0; k--) {
									var positionX = node.x[k] + offsetX;
									if (this.orientation == mxConstants.DIRECTION_NORTH
											|| this.orientation == mxConstants.DIRECTION_SOUTH) {
										newPoints.push(new mxPoint(positionX,
												node.y[k]));
									} else {
										newPoints.push(new mxPoint(node.y[k],
												positionX));
									}
									limitX = Math.max(limitX, positionX);
								}
							}
							this.layout.setEdgePoints(realEdge, newPoints);

							if (offsetX == 0.0) {
								offsetX = this.parallelEdgeSpacing;
							} else if (offsetX > 0) {
								offsetX = -offsetX;
							} else {
								offsetX = -offsetX + this.parallelEdgeSpacing;
							}
						}
						node.temp[0] = 101207;
					}
				}
			}
		}
	};
	mxCoordinateAssignment.prototype.processReversedEdge = function(graph,
			model) {
	};
	{
		function WeightedCellSorter(cell, weightedValue) {
			this.cell = cell;
			this.weightedValue = weightedValue;
		};
		WeightedCellSorter.prototype.weightedValue = 0;
		WeightedCellSorter.prototype.nudge = false;
		WeightedCellSorter.prototype.visited = false;
		WeightedCellSorter.prototype.rankIndex = null;
		WeightedCellSorter.prototype.cell = null;
		WeightedCellSorter.prototype.compare = function(a, b) {
			if (a != null && b != null) {
				if (b.weightedValue > a.weightedValue) {
					return -1;
				} else if (b.weightedValue < a.weightedValue) {
					return 1;
				} else {
					if (b.nudge) {
						return -1;
					} else {
						return 1;
					}
				}
			} else {
				return 0;
			}
		};
	}
}

{
	function mxHierarchicalLayout(graph, orientation, deterministic) {
		mxGraphLayout.call(this, graph);
		this.orientation = (orientation != null)
				? orientation
				: mxConstants.DIRECTION_NORTH;
		this.deterministic = (deterministic != null) ? deterministic : true;
	};
	mxHierarchicalLayout.prototype = new mxGraphLayout();
	mxHierarchicalLayout.prototype.constructor = mxHierarchicalLayout;
	mxHierarchicalLayout.prototype.INITIAL_X_POSITION = 100;
	mxHierarchicalLayout.prototype.roots = null;
	mxHierarchicalLayout.prototype.intraCellSpacing = 30;
	mxHierarchicalLayout.prototype.interRankCellSpacing = 50;
	mxHierarchicalLayout.prototype.interHierarchySpacing = 60;
	mxHierarchicalLayout.prototype.parallelEdgeSpacing = 10;
	mxHierarchicalLayout.prototype.orientation = mxConstants.DIRECTION_NORTH;
	mxHierarchicalLayout.prototype.fineTuning = true;
	mxHierarchicalLayout.prototype.deterministic;
	mxHierarchicalLayout.prototype.fixRoots = false;
	mxHierarchicalLayout.prototype.layoutFromSinks = true;
	mxHierarchicalLayout.prototype.tightenToSource = true;
	mxHierarchicalLayout.prototype.disableEdgeStyle = true;
	mxHierarchicalLayout.prototype.model = null;
	mxHierarchicalLayout.prototype.getModel = function() {
		return this.model;
	};
	mxHierarchicalLayout.prototype.execute = function(parent, roots) {
		if (roots == null) {
			roots = this.graph.findTreeRoots(parent);
		}
		this.roots = roots;
		if (this.roots != null) {
			var model = this.graph.getModel();
			model.beginUpdate();
			try {
				this.run(parent);
			} finally {
				model.endUpdate();
			}
		}
	};
	mxHierarchicalLayout.prototype.run = function(parent) {
		var hierarchyVertices = new Array();
		var fixedRoots = null;
		var rootLocations = null;
		var affectedEdges = null;
		if (this.fixRoots) {
			fixedRoots = new Array();
			rootLocations = new Array();
			affectedEdges = new Array();
		}
		for (var i = 0; i < this.roots.length; i++) {

			var newHierarchy = true;
			for (var j = 0; newHierarchy && j < hierarchyVertices.length; j++) {
				var rootId = mxCellPath.create(this.roots[i]);
				if (hierarchyVertices[j][rootId] != null) {
					newHierarchy = false;
				}
			}
			if (newHierarchy) {
				var cellsStack = new Array();
				cellsStack.push(this.roots[i]);
				var edgeSet = null;
				if (this.fixRoots) {
					fixedRoots.push(this.roots[i]);
					var location = this.getVertexBounds(this.roots[i])
							.getPoint();
					rootLocations.push(location);
					edgeSet = new Array();
				}
				var vertexSet = new Object();
				while (cellsStack.length > 0) {
					var cell = cellsStack.shift();
					var cellId = mxCellPath.create(cell);
					if (vertexSet[cellId] == null) {
						vertexSet[cellId] = cell;
						if (this.fixRoots) {
							var tmp = this.graph.getIncomingEdges(cell, parent);
							for (var k = 0; k < tmp.length; k++) {
								edgeSet.push(tmp[k]);
							}
						}
						var conns = this.graph.getConnections(cell, parent);
						var cells = this.graph.getOpposites(conns, cell);
						for (var k = 0; k < cells.length; k++) {
							var tmpId = mxCellPath.create(cells[k]);
							if (vertexSet[tmpId] == null) {
								cellsStack.push(cells[k]);
							}
						}
					}
				}
				hierarchyVertices.push(vertexSet);
				if (this.fixRoots) {
					affectedEdges.push(edgeSet);
				}
			}
		}

		var initialX = this.INITIAL_X_POSITION;
		for (var i = 0; i < hierarchyVertices.length; i++) {
			var vertexSet = hierarchyVertices[i];
			var tmp = new Array();
			for (var key in vertexSet) {
				tmp.push(vertexSet[key]);
			}
			this.model = new mxGraphHierarchyModel(this, tmp, this.roots,
					parent, false, this.deterministic, this.tightenToSource);
			this.cycleStage(parent);
			this.layeringStage();
			this.crossingStage(parent);
			initialX = this.placementStage(initialX, parent);
			if (this.fixRoots) {

				var root = fixedRoots[i];
				var oldLocation = rootLocations[i];
				var newLocation = this.getVertexBounds(root).getPoint();
				var diffX = oldLocation.x - newLocation.x;
				var diffY = oldLocation.y - newLocation.y;
				this.graph.moveCells(vertexSet, diffX, diffY);
				var connectedEdges = affectedEdges[i + 1];
				this.graph.moveCells(connectedEdges, diffX, diffY);
			}
		}
	};
	mxHierarchicalLayout.prototype.cycleStage = function(parent) {
		var cycleStage = new mxMinimumCycleRemover(this);
		cycleStage.execute(parent);
	};
	mxHierarchicalLayout.prototype.layeringStage = function() {
		this.model.initialRank(true);
		this.model.fixRanks();
	};
	mxHierarchicalLayout.prototype.crossingStage = function(parent) {
		var crossingStage = new mxMedianHybridCrossingReduction(this);
		crossingStage.execute(parent);
	};
	mxHierarchicalLayout.prototype.placementStage = function(initialX, parent) {
		var placementStage = new mxCoordinateAssignment(this,
				this.intraCellSpacing, this.interRankCellSpacing,
				this.orientation, initialX, this.parallelEdgeSpacing);
		placementStage.fineTuning = this.fineTuning;
		placementStage.execute(parent);
		return placementStage.limitX + this.interHierarchySpacing;
	};
}

{
	function mxGraphModel(root) {
		this.currentEdit = this.createUndoableEdit();
		if (root != null) {
			this.setRoot(root);
		} else {
			this.clear();
		}
	};
	mxGraphModel.prototype = new mxEventSource();
	mxGraphModel.prototype.constructor = mxGraphModel;
	mxGraphModel.prototype.root = null;
	mxGraphModel.prototype.cells = null;
	mxGraphModel.prototype.maintainEdgeParent = true;
	mxGraphModel.prototype.createIds = true;
	mxGraphModel.prototype.prefix = '';
	mxGraphModel.prototype.postfix = '';
	mxGraphModel.prototype.nextId = 0;
	mxGraphModel.prototype.currentEdit = null;
	mxGraphModel.prototype.updateLevel = 0;
	mxGraphModel.prototype.endingUpdate = false;
	mxGraphModel.prototype.clear = function() {
		this.setRoot(this.createRoot());
	};
	mxGraphModel.prototype.isCreateIds = function() {
		return this.createIds;
	};
	mxGraphModel.prototype.setCreateIds = function(value) {
		this.createIds = value;
	};
	mxGraphModel.prototype.createRoot = function() {
		var cell = new mxCell();
		cell.insert(new mxCell());
		return cell;
	};
	mxGraphModel.prototype.getCell = function(id) {
		return (this.cells != null) ? this.cells[id] : null;
	};
	mxGraphModel.prototype.filterCells = function(cells, filter) {
		var result = null;
		if (cells != null) {
			result = new Array();
			for (var i = 0; i < cells.length; i++) {
				if (filter(cells[i])) {
					result.push(cells[i]);
				}
			}
		}
		return result;
	}
	mxGraphModel.prototype.getDescendants = function(parent) {
		return this.filterDescendants(null, parent);
	};
	mxGraphModel.prototype.filterDescendants = function(filter, parent) {
		var result = new Array();
		parent = parent || this.getRoot();

		if (filter == null || filter(parent)) {
			result.push(parent);
		}
		var childCount = this.getChildCount(parent);
		for (var i = 0; i < childCount; i++) {
			var child = this.getChildAt(parent, i);
			result = result.concat(this.filterDescendants(filter, child));
		}
		return result;
	};
	mxGraphModel.prototype.getRoot = function(cell) {
		var root = cell || this.root;
		if (cell != null) {
			while (cell != null) {
				root = cell;
				cell = this.getParent(cell);
			}
		}
		return root;
	};
	mxGraphModel.prototype.setRoot = function(root) {
		this.execute(new mxRootChange(this, root));
		return root;
	};
	mxGraphModel.prototype.rootChanged = function(root) {
		var oldRoot = this.root;
		this.root = root;
		this.nextId = 0;
		this.cells = null;
		this.cellAdded(root);
		return oldRoot;
	};
	mxGraphModel.prototype.isRoot = function(cell) {
		return cell != null && this.root == cell;
	};
	mxGraphModel.prototype.isLayer = function(cell) {
		return this.isRoot(this.getParent(cell));
	};
	mxGraphModel.prototype.isAncestor = function(parent, child) {
		while (child != null && child != parent) {
			child = this.getParent(child);
		}
		return child == parent;
	};
	mxGraphModel.prototype.contains = function(cell) {
		return this.isAncestor(this.root, cell);
	};
	mxGraphModel.prototype.getParent = function(cell) {
		return (cell != null) ? cell.getParent() : null;
	};
	mxGraphModel.prototype.add = function(parent, child, index) {
		if (child != parent && parent != null && child != null) {
			if (index == null) {
				index = this.getChildCount(parent);
			}
			var parentChanged = parent != this.getParent(child);
			this.execute(new mxChildChange(this, parent, child, index));

			if (this.maintainEdgeParent && parentChanged) {
				this.updateEdgeParents(child);
			}
		}
		return child;
	};
	mxGraphModel.prototype.cellAdded = function(cell) {
		if (cell != null) {
			if (cell.getId() == null && this.createIds) {
				cell.setId(this.createId(cell));
			}
			if (cell.getId() != null) {
				var collision = this.getCell(cell.getId());
				if (collision != cell) {

					while (collision != null) {
						cell.setId(this.createId(cell));
						collision = this.getCell(cell.getId());
					}
					if (this.cells == null) {
						this.cells = new Object();
					}
					this.cells[cell.getId()] = cell;
				}
			}
			if (mxUtils.isNumeric(cell.getId())) {
				this.nextId = Math.max(this.nextId, cell.getId());
			}
			var childCount = this.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				this.cellAdded(this.getChildAt(cell, i));
			}
		}
	};
	mxGraphModel.prototype.createId = function(cell) {
		var id = this.nextId;
		this.nextId++;
		return this.prefix + id + this.postfix;
	};
	mxGraphModel.prototype.updateEdgeParents = function(cell, root) {
		root = root || this.getRoot(cell);
		var childCount = this.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			var child = this.getChildAt(cell, i);
			this.updateEdgeParents(child, root);
		}
		var edgeCount = this.getEdgeCount(cell);
		var edges = new Array();
		for (var i = 0; i < edgeCount; i++) {
			edges.push(this.getEdgeAt(cell, i));
		}
		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];

			if (this.isAncestor(root, edge)) {
				this.updateEdgeParent(edge);
			}
		}
		if (this.isEdge(cell)) {
			this.updateEdgeParent(cell);
		}
	};
	mxGraphModel.prototype.updateEdgeParent = function(edge) {
		var source = this.getTerminal(edge, true);
		var target = this.getTerminal(edge, false);
		var cell = null;
		if (source == target) {
			cell = this.getParent(source);
		} else {
			cell = this.getNearestCommonAncestor(source, target);
		}
		if (cell != null && this.getParent(cell) != this.root
				&& this.getParent(edge) != cell) {
			var geo = this.getGeometry(edge);
			if (geo != null) {
				var origin1 = this.getOrigin(this.getParent(edge));
				var origin2 = this.getOrigin(cell);
				var dx = origin2.x - origin1.x;
				var dy = origin2.y - origin1.y;
				geo = geo.translate(-dx, -dy);
				this.setGeometry(edge, geo);
			}
			this.add(cell, edge, this.getChildCount(cell));
		}
	};
	mxGraphModel.prototype.getOrigin = function(cell) {
		var result = null;
		if (cell != null) {
			result = this.getOrigin(this.getParent(cell));
			if (!this.isEdge(cell)) {
				var geo = this.getGeometry(cell);
				if (geo != null) {
					result.x += geo.x;
					result.y += geo.y;
				}
			}
		} else {
			result = new mxPoint();
		}
		return result;
	};
	mxGraphModel.prototype.getNearestCommonAncestor = function(cell1, cell2) {
		var result = null;
		if (cell1 != null && cell2 != null) {
			var path = mxCellPath.create(cell2);
			if (path != null && path.length > 0) {

				var cell = cell1;
				var current = mxCellPath.create(cell);
				while (cell != null && result == null) {
					var parent = this.getParent(cell);

					if (path.indexOf(current + mxCellPath.PATH_SEPARATOR) == 0
							&& parent != null) {
						result = cell;
					}
					current = mxCellPath.getParentPath(current);
					cell = parent;
				}
			}
		}
		return result;
	};
	mxGraphModel.prototype.remove = function(cell) {
		if (cell == this.root) {
			this.setRoot(null);
		} else if (this.getParent(cell) != null) {
			this.execute(new mxChildChange(this, null, cell));
		}
		return cell;
	};
	mxGraphModel.prototype.cellRemoved = function(cell) {
		if (cell != null && this.cells != null) {
			var childCount = this.getChildCount(cell);
			for (var i = childCount - 1; i >= 0; i--) {
				this.cellRemoved(this.getChildAt(cell, i));
			}
			if (this.cells != null && cell.getId() != null) {
				delete this.cells[cell.getId()];
			}
		}
	};
	mxGraphModel.prototype.parentForCellChanged = function(cell, parent, index) {
		var previous = this.getParent(cell);
		if (parent != null) {
			if (parent != previous || previous.getIndex(cell) != index) {
				parent.insert(cell, index);
			}
		} else if (previous != null) {
			var oldIndex = previous.getIndex(cell);
			previous.remove(oldIndex);
		}

		if (!this.contains(previous) && parent != null) {
			this.cellAdded(cell);
		} else if (parent == null) {
			this.cellRemoved(cell);
		}
		return previous;
	};
	mxGraphModel.prototype.getChildCount = function(cell) {
		return (cell != null) ? cell.getChildCount() : 0;
	};
	mxGraphModel.prototype.getChildAt = function(cell, index) {
		return (cell != null) ? cell.getChildAt(index) : null;
	};
	mxGraphModel.prototype.getChildren = function(cell) {
		return (cell != null) ? cell.children : null;
	};
	mxGraphModel.prototype.getChildVertices = function(parent) {
		return this.getChildCells(parent, true, false);
	};
	mxGraphModel.prototype.getChildEdges = function(parent) {
		return this.getChildCells(parent, false, true);
	};
	mxGraphModel.prototype.getChildCells = function(parent, vertices, edges) {
		vertices = (vertices != null) ? vertices : false;
		edges = (edges != null) ? edges : false;
		var childCount = this.getChildCount(parent);
		var result = new Array();
		for (var i = 0; i < childCount; i++) {
			var child = this.getChildAt(parent, i);
			if ((!edges && !vertices) || (edges && this.isEdge(child))
					|| (vertices && this.isVertex(child))) {
				result.push(child);
			}
		}
		return result;
	};
	mxGraphModel.prototype.getTerminal = function(edge, isSource) {
		return (edge != null) ? edge.getTerminal(isSource) : null;
	};
	mxGraphModel.prototype.setTerminal = function(edge, terminal, isSource) {
		var terminalChanged = terminal != this.getTerminal(edge, isSource);
		this.execute(new mxTerminalChange(this, edge, terminal, isSource));
		if (this.maintainEdgeParent && terminalChanged) {
			this.updateEdgeParent(edge);
		}
		return terminal;
	};
	mxGraphModel.prototype.setTerminals = function(edge, source, target) {
		this.beginUpdate();
		try {
			this.setTerminal(edge, source, true);
			this.setTerminal(edge, target, false);
		} finally {
			this.endUpdate();
		}
	};
	mxGraphModel.prototype.terminalForCellChanged = function(edge, terminal,
			isSource) {
		var previous = this.getTerminal(edge, isSource);
		if (terminal != null) {
			terminal.insertEdge(edge, isSource);
		} else if (previous != null) {
			previous.removeEdge(edge, isSource);
		}
		return previous;
	};
	mxGraphModel.prototype.getEdgeCount = function(cell) {
		return (cell != null) ? cell.getEdgeCount() : 0;
	};
	mxGraphModel.prototype.getEdgeAt = function(cell, index) {
		return (cell != null) ? cell.getEdgeAt(index) : null;
	};
	mxGraphModel.prototype.getDirectedEdgeCount = function(cell, outgoing,
			ignoredEdge) {
		var count = 0;
		var edgeCount = this.getEdgeCount(cell);
		for (var i = 0; i < edgeCount; i++) {
			var edge = this.getEdgeAt(cell, i);
			if (edge != ignoredEdge && this.getTerminal(edge, outgoing) == cell) {
				count++;
			}
		}
		return count;
	};
	mxGraphModel.prototype.getConnections = function(cell) {
		return this.getEdges(cell, true, true, false);
	};
	mxGraphModel.prototype.getIncomingEdges = function(cell) {
		return this.getEdges(cell, true, false, false);
	};
	mxGraphModel.prototype.getOutgoingEdges = function(cell) {
		return this.getEdges(cell, false, true, false);
	};
	mxGraphModel.prototype.getEdges = function(cell, incoming, outgoing,
			includeLoops) {
		incoming = (incoming != null) ? incoming : true;
		outgoing = (outgoing != null) ? outgoing : true;
		includeLoops = (includeLoops != null) ? includeLoops : true;
		var edgeCount = this.getEdgeCount(cell);
		var result = new Array();
		for (var i = 0; i < edgeCount; i++) {
			var edge = this.getEdgeAt(cell, i);
			var source = this.getTerminal(edge, true);
			var target = this.getTerminal(edge, false);
			if (includeLoops
					|| ((source != target) && ((incoming && target == cell) || (outgoing && source == cell)))) {
				result.push(edge);
			}
		}
		return result;
	};
	mxGraphModel.prototype.getEdgesBetween = function(source, target, directed) {
		directed = (directed != null) ? directed : false;
		var tmp1 = this.getEdgeCount(source);
		var tmp2 = this.getEdgeCount(target);
		var terminal = source;
		var edgeCount = tmp1;

		if (tmp2 < tmp1) {
			edgeCount = tmp2;
			terminal = target;
		}
		var result = new Array();

		for (var i = 0; i < edgeCount; i++) {
			var edge = this.getEdgeAt(terminal, i);
			var src = this.getTerminal(edge, true);
			var trg = this.getTerminal(edge, false);
			var isSource = src == source;
			if (isSource
					&& trg == target
					|| (!directed && this.getTerminal(edge, !isSource) == target)) {
				result.push(edge);
			}
		}
		return result;
	};
	mxGraphModel.prototype.getOpposites = function(edges, terminal, sources,
			targets) {
		sources = (sources != null) ? sources : true;
		targets = (targets != null) ? targets : true;
		var terminals = new Array();
		if (edges != null) {
			for (var i = 0; i < edges.length; i++) {
				var source = this.getTerminal(edges[i], true);
				var target = this.getTerminal(edges[i], false);

				if (source == terminal && target != null && target != terminal
						&& targets) {
					terminals.push(target);
				}

				else if (target == terminal && source != null
						&& source != terminal && sources) {
					terminals.push(source);
				}
			}
		}
		return terminals;
	};
	mxGraphModel.prototype.getTopmostCells = function(cells) {
		var tmp = new Array();
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var topmost = true;
			var parent = this.getParent(cell);
			while (parent != null) {
				if (mxUtils.indexOf(cells, parent) >= 0) {
					topmost = false;
					break;
				}
				parent = this.getParent(parent);
			}
			if (topmost) {
				tmp.push(cell);
			}
		}
		return tmp;
	};
	mxGraphModel.prototype.isVertex = function(cell) {
		return (cell != null) ? cell.isVertex() : false;
	};
	mxGraphModel.prototype.isEdge = function(cell) {
		return (cell != null) ? cell.isEdge() : false;
	};
	mxGraphModel.prototype.isConnectable = function(cell) {
		return (cell != null) ? cell.isConnectable() : false;
	};
	mxGraphModel.prototype.getValue = function(cell) {
		return (cell != null) ? cell.getValue() : null;
	};
	mxGraphModel.prototype.setValue = function(cell, value) {
		this.execute(new mxValueChange(this, cell, value));
		return value;
	};
	mxGraphModel.prototype.valueForCellChanged = function(cell, value) {
		return cell.valueChanged(value);
	};
	mxGraphModel.prototype.getGeometry = function(cell, geometry) {
		return (cell != null) ? cell.getGeometry() : null;
	};
	mxGraphModel.prototype.setGeometry = function(cell, geometry) {
		if (geometry != this.getGeometry(cell)) {
			this.execute(new mxGeometryChange(this, cell, geometry));
		}
		return geometry;
	};
	mxGraphModel.prototype.geometryForCellChanged = function(cell, geometry) {
		var previous = this.getGeometry(cell);
		cell.setGeometry(geometry);
		return previous;
	};
	mxGraphModel.prototype.getStyle = function(cell) {
		return (cell != null) ? cell.getStyle() : null;
	};
	mxGraphModel.prototype.setStyle = function(cell, style) {
		if (style != this.getStyle(cell)) {
			this.execute(new mxStyleChange(this, cell, style));
		}
		return style;
	};
	mxGraphModel.prototype.styleForCellChanged = function(cell, style) {
		var previous = this.getStyle(cell);
		cell.setStyle(style);
		return previous;
	};
	mxGraphModel.prototype.isCollapsed = function(cell) {
		return (cell != null) ? cell.isCollapsed() : false;
	};
	mxGraphModel.prototype.setCollapsed = function(cell, collapsed) {
		if (collapsed != this.isCollapsed(cell)) {
			this.execute(new mxCollapseChange(this, cell, collapsed));
		}
		return collapsed;
	};
	mxGraphModel.prototype.collapsedStateForCellChanged = function(cell,
			collapsed) {
		var previous = this.isCollapsed(cell);
		cell.setCollapsed(collapsed);
		return previous;
	};
	mxGraphModel.prototype.isVisible = function(cell) {
		return (cell != null) ? cell.isVisible() : false;
	};
	mxGraphModel.prototype.setVisible = function(cell, visible) {
		if (visible != this.isVisible(cell)) {
			this.execute(new mxVisibleChange(this, cell, visible));
		}
		return visible;
	};
	mxGraphModel.prototype.visibleStateForCellChanged = function(cell, visible) {
		var previous = this.isVisible(cell);
		cell.setVisible(visible);
		return previous;
	};
	mxGraphModel.prototype.execute = function(change) {
		change.execute();
		this.beginUpdate();
		this.currentEdit.add(change);
		this.fireEvent(mxEvent.EXECUTE, this, new mxEventObject([change]));
		this.endUpdate();
	};
	mxGraphModel.prototype.beginUpdate = function() {
		this.updateLevel++;
		this.fireEvent(mxEvent.BEGIN_UPDATE);
	};
	mxGraphModel.prototype.endUpdate = function() {
		this.updateLevel--;
		if (!this.endingUpdate) {
			this.endingUpdate = this.updateLevel == 0;
			this.fireEvent(mxEvent.END_UPDATE,
					new mxEventObject([this.currentEdit]));
			try {
				if (this.endingUpdate && !this.currentEdit.isEmpty()) {
					this.fireEvent(mxEvent.BEFORE_UNDO,
							new mxEventObject([this.currentEdit]));
					var tmp = this.currentEdit;
					this.currentEdit = this.createUndoableEdit();
					tmp.notify();
					this.fireEvent(mxEvent.UNDO, new mxEventObject([tmp]));
				}
			} finally {
				this.endingUpdate = false;
			}
		}
	};
	mxGraphModel.prototype.createUndoableEdit = function() {
		var edit = new mxUndoableEdit(this, true);
		edit.notify = function() {
			edit.source.fireEvent(mxEvent.CHANGE,
					new mxEventObject([edit.changes]));
			edit.source.fireEvent(mxEvent.NOTIFY,
					new mxEventObject([edit.changes]));
		}
		return edit;
	};
	mxGraphModel.prototype.mergeChildren = function(from, to, cloneAllEdges) {
		cloneAllEdges = (cloneAllEdges != null) ? cloneAllEdges : true;
		this.beginUpdate();
		try {
			var mapping = new Object();
			this.mergeChildrenImpl(from, to, cloneAllEdges, mapping);

			for (var key in mapping) {
				var cell = mapping[key];
				var terminal = this.getTerminal(cell, true);
				if (terminal != null) {
					terminal = mapping[mxCellPath.create(terminal)];
					this.setTerminal(cell, terminal, true);
				}
				terminal = this.getTerminal(cell, false);
				if (terminal != null) {
					terminal = mapping[mxCellPath.create(terminal)];
					this.setTerminal(cell, terminal, false);
				}
			}
		} finally {
			this.endUpdate();
		}
	};
	mxGraphModel.prototype.mergeChildrenImpl = function(from, to,
			cloneAllEdges, mapping) {
		this.beginUpdate();
		try {
			var childCount = from.getChildCount();
			for (var i = 0; i < childCount; i++) {
				var cell = from.getChildAt(i);
				if (typeof(cell.getId) == 'function') {
					var id = cell.getId();
					var target = (id != null && (!this.isEdge(cell) || !cloneAllEdges))
							? this.getCell(id)
							: null;
					if (target == null) {
						var clone = cell.clone();
						clone.setId(id);

						clone.setTerminal(cell.getTerminal(true), true);
						clone.setTerminal(cell.getTerminal(false), false);

						target = to.insert(clone);
						this.cellAdded(target);
					}
					mapping[mxCellPath.create(cell)] = target;
					this
							.mergeChildrenImpl(cell, target, cloneAllEdges,
									mapping);
				}
			}
		} finally {
			this.endUpdate();
		}
	};
	mxGraphModel.prototype.getParents = function(cells) {
		var parents = new Array();
		if (cells != null) {
			var hash = new Object();
			for (var i = 0; i < cells.length; i++) {
				var parent = this.getParent(cells[i]);
				if (parent != null) {
					var id = mxCellPath.create(parent);
					if (hash[id] == null) {
						hash[id] = parent;
						parents.push(parent);
					}
				}
			}
		}
		return parents;
	};

	mxGraphModel.prototype.cloneCell = function(cell) {
		if (cell != null) {
			return this.cloneCells([cell], true)[0];
		}
		return null;
	};
	mxGraphModel.prototype.cloneCells = function(cells, includeChildren) {
		var mapping = new Object();
		var clones = new Array();
		for (var i = 0; i < cells.length; i++) {
			if (cells[i] != null) {
				clones.push(this.cloneCellImpl(cells[i], mapping,
						includeChildren));
			} else {
				clones.push(null);
			}
		}
		for (var i = 0; i < clones.length; i++) {
			if (clones[i] != null) {
				this.restoreClone(clones[i], cells[i], mapping);
			}
		}
		return clones;
	};
	mxGraphModel.prototype.cloneCellImpl = function(cell, mapping,
			includeChildren) {
		var clone = this.cellCloned(cell);

		mapping[mxObjectIdentity.get(cell)] = clone;
		if (includeChildren) {
			var childCount = this.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				var cloneChild = this.cloneCellImpl(this.getChildAt(cell, i),
						mapping, true);
				clone.insert(cloneChild);
			}
		}
		return clone;
	};
	mxGraphModel.prototype.cellCloned = function(cell) {
		return cell.clone();
	};
	mxGraphModel.prototype.restoreClone = function(clone, cell, mapping) {
		var source = this.getTerminal(cell, true);
		if (source != null) {
			var tmp = mapping[mxObjectIdentity.get(source)];
			if (tmp != null) {
				tmp.insertEdge(clone, true);
			}
		}
		var target = this.getTerminal(cell, false);
		if (target != null) {
			var tmp = mapping[mxObjectIdentity.get(target)];
			if (tmp != null) {
				tmp.insertEdge(clone, false);
			}
		}
		var childCount = this.getChildCount(clone);
		for (var i = 0; i < childCount; i++) {
			this.restoreClone(this.getChildAt(clone, i), this.getChildAt(cell,
							i), mapping);
		}
	};

	function mxRootChange(model, root) {
		this.model = model;
		this.root = root;
		this.previous = root;
	};
	mxRootChange.prototype.execute = function() {
		this.root = this.previous;
		this.previous = this.model.rootChanged(this.previous);
	};
	function mxChildChange(model, parent, child, index) {
		this.model = model;
		this.parent = parent;
		this.previous = parent;
		this.child = child;
		this.index = index;
		this.previousIndex = index;
		this.isAdded = (parent == null);
	};
	mxChildChange.prototype.execute = function() {
		var tmp = this.model.getParent(this.child);
		var tmp2 = (tmp != null) ? tmp.getIndex(this.child) : 0;
		if (this.previous == null) {
			this.connect(this.child, false);
		}
		tmp = this.model.parentForCellChanged(this.child, this.previous,
				this.previousIndex);
		if (this.previous != null) {
			this.connect(this.child, true);
		}
		this.parent = this.previous;
		this.previous = tmp;
		this.index = this.previousIndex;
		this.previousIndex = tmp2;
		this.isAdded = !this.isAdded;
	};
	mxChildChange.prototype.connect = function(cell, isConnect) {
		isConnect = (isConnect != null) ? isConnect : true;
		var source = cell.getTerminal(true);
		var target = cell.getTerminal(false);
		if (source != null) {
			if (isConnect) {
				this.model.terminalForCellChanged(cell, source, true);
			} else {
				this.model.terminalForCellChanged(cell, null, true);
			}
		}
		if (target != null) {
			if (isConnect) {
				this.model.terminalForCellChanged(cell, target, false);
			} else {
				this.model.terminalForCellChanged(cell, null, false);
			}
		}
		cell.setTerminal(source, true);
		cell.setTerminal(target, false);
		var childCount = this.model.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			this.connect(this.model.getChildAt(cell, i), isConnect);
		}
	};
	function mxTerminalChange(model, cell, terminal, isSource) {
		this.model = model;
		this.cell = cell;
		this.terminal = terminal;
		this.previous = terminal;
		this.isSource = isSource;
	};
	mxTerminalChange.prototype.execute = function() {
		this.terminal = this.previous;
		this.previous = this.model.terminalForCellChanged(this.cell,
				this.previous, this.isSource);
	};
	function mxValueChange(model, cell, value) {
		this.model = model;
		this.cell = cell;
		this.value = value;
		this.previous = value;
	};
	mxValueChange.prototype.execute = function() {
		this.value = this.previous;
		this.previous = this.model
				.valueForCellChanged(this.cell, this.previous);
	};
	function mxStyleChange(model, cell, style) {
		this.model = model;
		this.cell = cell;
		this.style = style;
		this.previous = style;
	};
	mxStyleChange.prototype.execute = function() {
		this.style = this.previous;
		this.previous = this.model
				.styleForCellChanged(this.cell, this.previous);
	};
	function mxGeometryChange(model, cell, geometry) {
		this.model = model;
		this.cell = cell;
		this.geometry = geometry;
		this.previous = geometry;
	};
	mxGeometryChange.prototype.execute = function() {
		this.geometry = this.previous;
		this.previous = this.model.geometryForCellChanged(this.cell,
				this.previous);
	};
	function mxCollapseChange(model, cell, collapsed) {
		this.model = model;
		this.cell = cell;
		this.collapsed = collapsed;
		this.previous = collapsed;
	};
	mxCollapseChange.prototype.execute = function() {
		this.collapsed = this.previous;
		this.previous = this.model.collapsedStateForCellChanged(this.cell,
				this.previous);
	};
	function mxVisibleChange(model, cell, visible) {
		this.model = model;
		this.cell = cell;
		this.visible = visible;
		this.previous = visible;
	};
	mxVisibleChange.prototype.execute = function() {
		this.visible = this.previous;
		this.previous = this.model.visibleStateForCellChanged(this.cell,
				this.previous);
	};
	function mxCellAttributeChange(cell, attribute, value) {
		this.cell = cell;
		this.attribute = attribute;
		this.value = value;
		this.previous = value;
	};
	mxCellAttributeChange.prototype.execute = function() {
		var tmp = this.cell.getAttribute(this.attribute);
		if (this.previous == null) {
			this.cell.value.removeAttribute(this.attribute);
		} else {
			this.cell.setAttribute(this.attribute, this.previous);
		}
		this.previous = tmp;
	};
}

{
	function mxCell(value, geometry, style) {
		this.value = value;
		this.setGeometry(geometry);
		this.setStyle(style);
		if (this.onInit != null) {
			this.onInit();
		}
	};
	mxCell.prototype.id = null;
	mxCell.prototype.value = null;
	mxCell.prototype.geometry = null;
	mxCell.prototype.style = null;
	mxCell.prototype.vertex = false;
	mxCell.prototype.edge = false;
	mxCell.prototype.connectable = true;
	mxCell.prototype.visible = true;
	mxCell.prototype.collapsed = false;
	mxCell.prototype.parent = null;
	mxCell.prototype.source = null;
	mxCell.prototype.target = null;
	mxCell.prototype.children = null;
	mxCell.prototype.edges = null;
	mxCell.prototype.mxTransient = ['id', 'value', 'parent', 'source',
			'target', 'children', 'edges'];
	mxCell.prototype.getId = function() {
		return this.id;
	};
	mxCell.prototype.setId = function(id) {
		this.id = id;
	};
	mxCell.prototype.getValue = function() {
		return this.value;
	};
	mxCell.prototype.setValue = function(value) {
		this.value = value;
	};
	mxCell.prototype.valueChanged = function(newValue) {
		var previous = this.getValue();
		this.setValue(newValue);
		return previous;
	};
	mxCell.prototype.getGeometry = function() {
		return this.geometry;
	};
	mxCell.prototype.setGeometry = function(geometry) {
		this.geometry = geometry;
	};
	mxCell.prototype.getStyle = function() {
		return this.style;
	};
	mxCell.prototype.setStyle = function(style) {
		this.style = style;
	};
	mxCell.prototype.isVertex = function() {
		return this.vertex;
	};
	mxCell.prototype.setVertex = function(vertex) {
		this.vertex = vertex;
	};
	mxCell.prototype.isEdge = function() {
		return this.edge;
	};
	mxCell.prototype.setEdge = function(edge) {
		this.edge = edge;
	};
	mxCell.prototype.isConnectable = function() {
		return this.connectable;
	};
	mxCell.prototype.setConnectable = function(connectable) {
		this.connectable = connectable;
	};
	mxCell.prototype.isVisible = function() {
		return this.visible;
	};
	mxCell.prototype.setVisible = function(visible) {
		this.visible = visible;
	};
	mxCell.prototype.isCollapsed = function() {
		return this.collapsed;
	};
	mxCell.prototype.setCollapsed = function(collapsed) {
		this.collapsed = collapsed;
	};
	mxCell.prototype.getParent = function(parent) {
		return this.parent;
	};
	mxCell.prototype.setParent = function(parent) {
		this.parent = parent;
	};
	mxCell.prototype.getTerminal = function(source) {
		return (source) ? this.source : this.target;
	};
	mxCell.prototype.setTerminal = function(terminal, isSource) {
		if (isSource) {
			this.source = terminal;
		} else {
			this.target = terminal;
		}
		return terminal;
	};
	mxCell.prototype.getChildCount = function() {
		return (this.children == null) ? 0 : this.children.length;
	};
	mxCell.prototype.getIndex = function(child) {
		return mxUtils.indexOf(this.children, child);
	};
	mxCell.prototype.getChildAt = function(index) {
		return (this.children == null) ? null : this.children[index];
	};
	mxCell.prototype.insert = function(child, index) {
		if (child != null) {
			index = (index != null) ? index : this.getChildCount();
			child.removeFromParent();
			child.setParent(this);
			if (this.children == null) {
				this.children = new Array();
				this.children.push(child);
			} else {
				this.children.splice(index, 0, child);
			}
		}
		return child;
	};
	mxCell.prototype.remove = function(index) {
		var child = null;
		if (this.children != null && index >= 0) {
			child = this.getChildAt(index);
			if (child != null) {
				this.children.splice(index, 1);
				child.setParent(null);
			}
		}
		return child;
	};
	mxCell.prototype.removeFromParent = function() {
		if (this.parent != null) {
			var index = this.parent.getIndex(this);
			this.parent.remove(index);
		}
	};
	mxCell.prototype.getEdgeCount = function() {
		return (this.edges == null) ? 0 : this.edges.length;
	};
	mxCell.prototype.getEdgeIndex = function(edge) {
		return mxUtils.indexOf(this.edges, edge);
	};
	mxCell.prototype.getEdgeAt = function(index) {
		return (this.edges == null) ? null : this.edges[index];
	};
	mxCell.prototype.insertEdge = function(edge, isOutgoing) {
		if (edge != null) {
			edge.removeFromTerminal(isOutgoing);
			edge.setTerminal(this, isOutgoing);
			if (this.edges == null || edge.getTerminal(!isOutgoing) != this
					|| mxUtils.indexOf(this.edges, edge) < 0) {
				if (this.edges == null) {
					this.edges = new Array();
				}
				this.edges.push(edge);
			}
		}
		return edge;
	};
	mxCell.prototype.removeEdge = function(edge, isOutgoing) {
		if (edge != null) {
			if (edge.getTerminal(!isOutgoing) != this && this.edges != null) {
				var index = this.getEdgeIndex(edge);
				if (index >= 0) {
					this.edges.splice(index, 1);
				}
			}
			edge.setTerminal(null, isOutgoing);
		}
		return edge;
	};
	mxCell.prototype.removeFromTerminal = function(isSource) {
		var terminal = this.getTerminal(isSource);
		if (terminal != null) {
			terminal.removeEdge(this, isSource);
		}
	};
	mxCell.prototype.getAttribute = function(name, defaultValue) {
		var userObject = this.getValue();
		var val = (userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT)
				? userObject.getAttribute(name)
				: null;
		return val || defaultValue;
	};
	mxCell.prototype.setAttribute = function(name, value) {
		var userObject = this.getValue();
		if (userObject != null
				&& userObject.nodeType == mxConstants.NODETYPE_ELEMENT) {
			userObject.setAttribute(name, value);
		}
	};
	mxCell.prototype.clone = function() {
		var clone = mxUtils.clone(this, this.mxTransient);
		clone.setValue(this.cloneValue());
		return clone;
	};
	mxCell.prototype.cloneValue = function() {
		var value = this.getValue();
		if (value != null) {
			if (typeof(value.clone) == 'function') {
				value = value.clone();
			} else if (!isNaN(value.nodeType)) {
				value = value.cloneNode(true);
			}
		}
		return value;
	};
}

{
	function mxGeometry(x, y, width, height) {
		mxRectangle.call(this, x, y, width, height);
	};
	mxGeometry.prototype = new mxRectangle();
	mxGeometry.prototype.constructor = mxGeometry;
	mxGeometry.prototype.TRANSLATE_CONTROL_POINTS = true;
	mxGeometry.prototype.alternateBounds = null;
	mxGeometry.prototype.sourcePoint = null;
	mxGeometry.prototype.targetPoint = null;
	mxGeometry.prototype.points = null;
	mxGeometry.prototype.offset = null;
	mxGeometry.prototype.relative = false;
	mxGeometry.prototype.swap = function() {
		if (this.alternateBounds != null) {
			var old = new mxRectangle(this.x, this.y, this.width, this.height);
			this.x = this.alternateBounds.x;
			this.y = this.alternateBounds.y;
			this.width = this.alternateBounds.width;
			this.height = this.alternateBounds.height;
			this.alternateBounds = old;
		}
	};
	mxGeometry.prototype.getTerminalPoint = function(isSource) {
		return (isSource) ? this.sourcePoint : this.targetPoint;
	};
	mxGeometry.prototype.setTerminalPoint = function(point, isSource) {
		if (isSource) {
			this.sourcePoint = point;
		} else {
			this.targetPoint = point;
		}
		return point;
	};
	mxGeometry.prototype.translate = function(dx, dy) {
		var clone = this.clone();
		if (!clone.relative) {
			clone.x += dx;
			clone.y += dy;
		}
		if (clone.sourcePoint != null) {
			clone.sourcePoint.x += dx;
			clone.sourcePoint.y += dy;
		}
		if (clone.targetPoint != null) {
			clone.targetPoint.x += dx;
			clone.targetPoint.y += dy;
		}
		if (this.TRANSLATE_CONTROL_POINTS && clone.points != null) {
			var count = clone.points.length;
			for (var i = 0; i < count; i++) {
				var pt = clone.points[i];
				pt.x += dx;
				pt.y += dy;
			}
		}
		return clone;
	};
}

var mxCellPath = {
	PATH_SEPARATOR : '.',
	create : function(cell) {
		var result = '';
		if (cell != null) {
			var parent = cell.getParent();
			while (parent != null) {
				var index = parent.getIndex(cell);
				result = index + mxCellPath.PATH_SEPARATOR + result;
				cell = parent;
				parent = cell.getParent();
			}
		}
		var n = result.length;
		if (n > 1) {
			result = result.substring(0, n - 1);
		}
		return result;
	},
	getParentPath : function(path) {
		if (path != null) {
			var index = path.lastIndexOf(mxCellPath.PATH_SEPARATOR);
			if (index >= 0) {
				return path.substring(0, index);
			} else if (path.length > 0) {
				return '';
			}
		}
		return null;
	},
	resolve : function(root, path) {
		var parent = root;
		if (path != null) {
			var tokens = path.split(mxCellPath.PATH_SEPARATOR);
			for (var i = 0; i < tokens.length; i++) {
				parent = parent.getChildAt(parseInt(tokens[i]));
			}
		}
		return parent;
	}
};

var mxPerimeter = {
	RectanglePerimeter : function(bounds, edgeState, terminalState, isSource,
			next) {
		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		var dx = next.x - cx;
		var dy = next.y - cy;
		var alpha = Math.atan2(dy, dx);
		var p = new mxPoint(0, 0);
		var pi = Math.PI;
		var pi2 = Math.PI / 2;
		var beta = pi2 - alpha;
		var t = Math.atan2(bounds.height, bounds.width);
		if (alpha < -pi + t || alpha > pi - t) {
			p.x = bounds.x;
			p.y = cy - bounds.width * Math.tan(alpha) / 2;
		} else if (alpha < -t) {
			p.y = bounds.y;
			p.x = cx - bounds.height * Math.tan(beta) / 2;
		} else if (alpha < t) {
			p.x = bounds.x + bounds.width;
			p.y = cy + bounds.width * Math.tan(alpha) / 2;
		} else {
			p.y = bounds.y + bounds.height;
			p.x = cx + bounds.height * Math.tan(beta) / 2;
		}
		if (edgeState != null
				&& edgeState.view.graph.isOrthogonal(edgeState, terminalState)) {
			if (next.x >= bounds.x && next.x <= bounds.x + bounds.width) {
				p.x = next.x;
			} else if (next.y >= bounds.y && next.y <= bounds.y + bounds.height) {
				p.y = next.y;
			}
			if (next.x < bounds.x) {
				p.x = bounds.x;
			} else if (next.x > bounds.x + bounds.width) {
				p.x = bounds.x + bounds.width;
			}
			if (next.y < bounds.y) {
				p.y = bounds.y;
			} else if (next.y > bounds.y + bounds.height) {
				p.y = bounds.y + bounds.height;
			}
		}
		return p;
	},
	EllipsePerimeter : function(bounds, edgeState, terminalState, isSource,
			next) {
		var x = bounds.x;
		var y = bounds.y;
		var a = bounds.width / 2;
		var b = bounds.height / 2;
		var cx = x + a;
		var cy = y + b;
		var px = next.x;
		var py = next.y;

		var dx = px - cx;
		var dy = py - cy;
		if (dx == 0 && dy != 0) {
			return new mxPoint(cx, cy + b * dy / Math.abs(dy));
		}
		var orthogonal = edgeState != null
				&& edgeState.view.graph.isOrthogonal(edgeState, terminalState);
		if (orthogonal) {
			if (py >= y && py <= y + bounds.height) {
				var ty = py - cy;
				var tx = Math.sqrt(a * a * (1 - (ty * ty) / (b * b))) || 0;
				if (px <= x) {
					tx = -tx;
				}
				return new mxPoint(cx + tx, py);
			}
			if (px >= x && px <= x + bounds.width) {
				var tx = px - cx;
				var ty = Math.sqrt(b * b * (1 - (tx * tx) / (a * a))) || 0;
				if (py <= y) {
					ty = -ty;
				}
				return new mxPoint(px, cy + ty);
			}
		}
		var d = dy / dx;
		var h = cy - d * cx;
		var e = a * a * d * d + b * b;
		var f = -2 * cx * e;
		var g = a * a * d * d * cx * cx + b * b * cx * cx - a * a * b * b;
		var det = Math.sqrt(f * f - 4 * e * g);
		var xout1 = (-f + det) / (2 * e);
		var xout2 = (-f - det) / (2 * e);
		var yout1 = d * xout1 + h;
		var yout2 = d * xout2 + h;
		var dist1 = Math.sqrt(Math.pow((xout1 - px), 2)
				+ Math.pow((yout1 - py), 2));
		var dist2 = Math.sqrt(Math.pow((xout2 - px), 2)
				+ Math.pow((yout2 - py), 2));
		var xout = 0;
		var yout = 0;
		if (dist1 < dist2) {
			xout = xout1;
			yout = yout1;
		} else {
			xout = xout2;
			yout = yout2;
		}
		return new mxPoint(xout, yout);
	},
	RhombusPerimeter : function(bounds, edgeState, terminalState, isSource,
			next) {
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;
		var cx = x + w / 2;
		var cy = y + h / 2;
		var px = next.x;
		var py = next.y;
		if (cx == px) {
			if (cy > py) {
				return new mxPoint(cx, y);
			} else {
				return new mxPoint(cx, y + h);
			}
		} else if (cy == py) {
			if (cx > px) {
				return new mxPoint(x, cy);
			} else {
				return new mxPoint(x + w, cy);
			}
		}
		var tx = cx;
		var ty = cy;
		if (edgeState != null
				&& edgeState.view.graph.isOrthogonal(edgeState, terminalState)) {
			if (px >= x && px <= x + w) {
				tx = px;
			} else if (py >= y && py <= y + h) {
				ty = py;
			}
		}

		if (px < cx) {
			if (py < cy) {
				return mxUtils.intersection(px, py, tx, ty, cx, y, x, cy);
			} else {
				return mxUtils.intersection(px, py, tx, ty, cx, y + h, x, cy);
			}
		} else if (py < cy) {
			return mxUtils.intersection(px, py, tx, ty, cx, y, x + w, cy);
		} else {
			return mxUtils.intersection(px, py, tx, ty, cx, y + h, x + w, cy);
		}
	},
	TrianglePerimeter : function(bounds, edgeState, terminalState, isSource,
			next) {
		var orthogonal = edgeState != null
				&& edgeState.view.graph.isOrthogonal(edgeState, terminalState);
		var direction = (terminalState != null)
				? terminalState.style[mxConstants.STYLE_DIRECTION]
				: null;
		var vertical = direction == mxConstants.DIRECTION_NORTH
				|| direction == mxConstants.DIRECTION_SOUTH;
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;
		var cx = x + w / 2;
		var cy = y + h / 2;
		var start = new mxPoint(x, y);
		var corner = new mxPoint(x + w, cy);
		var end = new mxPoint(x, y + h);
		if (direction == mxConstants.DIRECTION_NORTH) {
			start = end;
			corner = new mxPoint(cx, y);
			end = new mxPoint(x + w, y + h);
		} else if (direction == mxConstants.DIRECTION_SOUTH) {
			corner = new mxPoint(cx, y + h);
			end = new mxPoint(x + w, y);
		} else if (direction == mxConstants.DIRECTION_WEST) {
			start = new mxPoint(x + w, y);
			corner = new mxPoint(x, cy);
			end = new mxPoint(x + w, y + h);
		}
		var dx = next.x - cx;
		var dy = next.y - cy;
		var alpha = (vertical) ? Math.atan2(dx, dy) : Math.atan2(dy, dx);
		var t = (vertical) ? Math.atan2(w, h) : Math.atan2(h, w);
		var base = false;
		if (direction == mxConstants.DIRECTION_NORTH
				|| direction == mxConstants.DIRECTION_WEST) {
			base = alpha > -t && alpha < t;
		} else {
			base = alpha < -Math.PI + t || alpha > Math.PI - t;
		}
		var result = null;
		if (base) {
			if (orthogonal
					&& ((vertical && next.x >= start.x && next.x <= end.x) || (!vertical
							&& next.y >= start.y && next.y <= end.y))) {
				if (vertical) {
					result = new mxPoint(next.x, start.y);
				} else {
					result = new mxPoint(start.x, next.y);
				}
			} else {
				if (direction == mxConstants.DIRECTION_NORTH) {
					result = new mxPoint(x + w / 2 + h * Math.tan(alpha) / 2, y
									+ h);
				} else if (direction == mxConstants.DIRECTION_SOUTH) {
					result = new mxPoint(x + w / 2 - h * Math.tan(alpha) / 2, y);
				} else if (direction == mxConstants.DIRECTION_WEST) {
					result = new mxPoint(x + w, y + h / 2 + w * Math.tan(alpha)
									/ 2);
				} else {
					result = new mxPoint(x, y + h / 2 - w * Math.tan(alpha) / 2);
				}
			}
		} else {
			if (orthogonal) {
				var pt = new mxPoint(cx, cy);
				if (next.y >= y && next.y <= y + h) {
					pt.x = (vertical)
							? cx
							: ((direction == mxConstants.DIRECTION_WEST) ? x
									+ w : x);
					pt.y = next.y;
				} else if (next.x >= x && next.x <= x + w) {
					pt.x = next.x;
					pt.y = (!vertical)
							? cy
							: ((direction == mxConstants.DIRECTION_NORTH) ? y
									+ h : y);
				}
				dx = next.x - pt.x;
				dy = next.y - pt.y;
				cx = pt.x;
				cy = pt.y;
			}
			if ((vertical && next.x <= x + w / 2)
					|| (!vertical && next.y <= y + h / 2)) {
				result = mxUtils.intersection(next.x, next.y, cx, cy, start.x,
						start.y, corner.x, corner.y);
			} else {
				result = mxUtils.intersection(next.x, next.y, cx, cy, corner.x,
						corner.y, end.x, end.y);
			}
		}
		if (result == null) {
			result = new mxPoint(cx, cy);
		}
		return result;
	}
};

{
	function mxPrintPreview(graph, scale, pageFormat, x0, y0, border, title,
			pageSelector) {
		x0 = (x0 != null) ? x0 : 0;
		y0 = (y0 != null) ? y0 : 0;
		scale = (scale != null) ? scale : 1;
		pageSelector = (pageSelector != null) ? pageSelector : true;
		if (pageFormat == null) {
			pageFormat = mxConstants.PAGE_FORMAT_A4_PORTRAIT;
		}
		this.graph = graph;
		this.pageFormat = pageFormat;
		this.scale = scale;
		this.x0 = x0;
		this.y0 = y0;
		this.border = border;
		this.title = title;
		this.pageSelector = pageSelector;
	};
	mxPrintPreview.prototype.graph = null;
	mxPrintPreview.prototype.pageFormat = null;
	mxPrintPreview.prototype.scale = null;
	mxPrintPreview.prototype.x0 = null;
	mxPrintPreview.prototype.y0 = null;
	mxPrintPreview.prototype.border = null;
	mxPrintPreview.prototype.title = null;
	mxPrintPreview.prototype.pageSelector = null;
	mxPrintPreview.prototype.wnd = null;
	mxPrintPreview.prototype.getWindow = function() {
		return this.wnd;
	};
	mxPrintPreview.prototype.open = function() {
		if (this.wnd == null) {
			this.wnd = window.open();
			var doc = this.wnd.document;
			doc.writeln('<html>');
			doc.writeln('<head>');
			if (this.title != null) {
				doc.writeln('<title>' + this.title + '</title>');
			}
			doc.writeln('<style type="text/css">');
			doc.writeln('@media print {');
			doc.writeln('  table.mxPageSelector { display: none; }');
			doc.writeln('  hr { display: none; }');
			doc.writeln('}');
			doc.writeln('@media screen {');

			doc
					.writeln('  table.mxPageSelector { position: fixed; right: 10px; top: 10px;'
							+ 'font-family: Arial; font-size:10pt; color: gray; border-color: gray;'
							+ 'background: white;}');
			doc.writeln('  body { background: gray; }');
			doc.writeln('}');
			doc.writeln('</style>');
			doc.writeln('</head>');
			doc.writeln('<body>');
			mxClient.link('stylesheet', mxClient.basePath + 'css/common.css',
					doc);
			if(mxClient.IS_IE) {
				doc.namespaces.add("v", "urn:schemas-microsoft-com:vml");
				doc.namespaces.add("o",
						"urn:schemas-microsoft-com:office:office");
				mxClient.link('stylesheet', mxClient.basePath
								+ 'css/explorer.css', doc);
			}
			var bounds = this.graph.getGraphBounds().clone();
			var sc = this.graph.getView().getScale() / this.scale;
			var tr = this.graph.getView().getTranslate();

			bounds.x /= sc;
			bounds.x -= tr.x - this.x0;
			bounds.y /= sc;
			bounds.y -= tr.y - this.y0;
			bounds.width /= sc;
			bounds.height /= sc;
			var hpages = Math.max(1, Math.ceil((bounds.x + bounds.width)
							/ this.pageFormat.width));
			var vpages = Math.max(1, Math.ceil((bounds.y + bounds.height)
							/ this.pageFormat.height));

			for (var i = 0; i < vpages; i++) {
				dy = i * this.pageFormat.height / this.scale;
				for (var j = 0; j < hpages; j++) {
					dx = j * this.pageFormat.width / this.scale;
					var div = this.renderPage(this.pageFormat.width,
							this.pageFormat.height, -dx, -dy, this.scale);
					var pageNum = i * hpages + j + 1;
					div.setAttribute('id', 'mxPage-' + pageNum);
					if (this.border != null) {
						div.style.borderColor = this.border;
						div.style.borderStyle = 'solid';
						div.style.borderWidth = '1px';
					}

					div.style.background = 'white';
					if (i < vpages - 1 || j < hpages - 1) {
						div.style.pageBreakAfter = 'always';
					}

					if(mxClient.IS_IE) {

						doc.writeln(div.outerHTML);
						div.parentNode.removeChild(div);
					} else {
						div.parentNode.removeChild(div);
						doc.body.appendChild(div);
					}
					if (i < vpages - 1 || j < hpages - 1) {
						doc.body.appendChild(doc.createElement('hr'));
					}
				}
			}
			doc.writeln('</body>');
			doc.writeln('</html>');
			doc.close();
			mxEvent.release(doc.body);
			if (this.pageSelector && (vpages > 1 || hpages > 1)) {
				var table = this.createPageSelector(vpages, hpages);
				doc.body.appendChild(table);
				if(mxClient.IS_IE) {
					table.style.position = 'absolute';
					var update = function() {
						table.style.top = (doc.body.scrollTop + 10) + 'px';
					};
					mxEvent.addListener(this.wnd, 'scroll', function(evt) {
								update();
							});
					mxEvent.addListener(this.wnd, 'resize', function(evt) {
								update();
							});
				}
			}
		}
		this.wnd.focus();
		return this.wnd;
	};
	mxPrintPreview.prototype.createPageSelector = function(vpages, hpages) {
		var doc = this.wnd.document;
		var table = doc.createElement('table');
		table.className = 'mxPageSelector';
		table.setAttribute('border', '1');
		var tbody = doc.createElement('tbody');
		for (var i = 0; i < vpages; i++) {
			var row = doc.createElement('tr');
			for (var j = 0; j < hpages; j++) {
				var cell = doc.createElement('td');
				cell.style.cursor = 'pointer';
				var pageNum = i * hpages + j + 1;
				mxUtils.write(cell, pageNum, doc);
				this.addPageClickListener(cell, pageNum);
				row.appendChild(cell);
			}
			tbody.appendChild(row);
		}
		table.appendChild(tbody);
		return table;
	};
	mxPrintPreview.prototype.addPageClickListener = function(cell, pageNumber) {
		var self = this;
		mxEvent.addListener(cell, 'click', function(evt) {
			var page = self.wnd.document.getElementById('mxPage-' + pageNumber);
			if (page != null) {
				self.wnd.scrollTo(0, Math.max(0, page.offsetTop - 8));
			}
		});
	};
	mxPrintPreview.prototype.renderPage = function(w, h, dx, dy, scale) {
		var div = document.createElement('div');
		div.style.width = w + 'px';
		div.style.height = h + 'px';
		div.style.overflow = 'hidden';
		div.style.pageBreakInside = 'avoid';
		document.body.appendChild(div);
		var view = this.graph.getView();
		var previousContainer = this.graph.container;
		this.graph.container = div;
		var canvas = view.getCanvas();
		var backgroundPane = view.getBackgroundPane();
		var drawPane = view.getDrawPane();
		var overlayPane = view.getOverlayPane();
		if (this.graph.dialect == mxConstants.DIALECT_SVG) {
			view.createSvg();
		} else if (this.graph.dialect == mxConstants.DIALECT_VML) {
			view.createVml();
		} else {
			view.createHtml();
		}
		var eventsEnabled = view.isEventsEnabled();
		view.setEventsEnabled(false);
		var graphEnabled = this.graph.isEnabled();
		this.graph.setEnabled(false);
		var translate = view.getTranslate();
		view.translate = new mxPoint(dx, dy);
		var temp = null;
		try {

			var model = this.graph.getModel();
			var cells = [model.getRoot()];
			temp = new mxTemporaryCellStates(view, scale, cells);
		} finally {

			if(mxClient.IS_IE) {
				view.overlayPane.innerHTML = '';
			} else {
				var tmp = div.firstChild;
				while (tmp != null) {
					var next = tmp.nextSibling;

					if (tmp.nodeName.toLowerCase() != 'svg'
							&& tmp.style.cursor != 'default') {
						tmp.parentNode.removeChild(tmp);
					}
					tmp = next;
				}
			}
			view.overlayPane.parentNode.removeChild(view.overlayPane);
			this.graph.setEnabled(graphEnabled);
			this.graph.container = previousContainer;
			view.canvas = canvas;
			view.backgroundPane = backgroundPane;
			view.drawPane = drawPane;
			view.overlayPane = overlayPane;
			view.translate = translate;
			temp.destroy();
			view.setEventsEnabled(eventsEnabled);
		}
		return div;
	};
	mxPrintPreview.prototype.print = function() {
		this.open();
		this.wnd.print();
	};
	mxPrintPreview.prototype.close = function() {
		if (this.wnd != null) {
			this.wnd.close();
			this.wnd = null;
		}
	};
}

{
	function mxStylesheet() {
		this.styles = new Object();
		this.putDefaultVertexStyle(this.createDefaultVertexStyle());
		this.putDefaultEdgeStyle(this.createDefaultEdgeStyle());
	};
	mxStylesheet.prototype.styles;
	mxStylesheet.prototype.createDefaultVertexStyle = function() {
		var style = new Object();
		style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
		style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
		style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
		style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
		style[mxConstants.STYLE_FILLCOLOR] = '#C3D9FF';
		style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
		style[mxConstants.STYLE_FONTCOLOR] = '#774400';
		return style;
	};
	mxStylesheet.prototype.createDefaultEdgeStyle = function() {
		var style = new Object();
		style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
		style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
		style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
		style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
		style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
		style[mxConstants.STYLE_FONTCOLOR] = '#446299';
		return style;
	};
	mxStylesheet.prototype.putDefaultVertexStyle = function(style) {
		this.putCellStyle('defaultVertex', style);
	};
	mxStylesheet.prototype.putDefaultEdgeStyle = function(style) {
		this.putCellStyle('defaultEdge', style);
	};
	mxStylesheet.prototype.getDefaultVertexStyle = function() {
		return this.styles['defaultVertex'];
	};
	mxStylesheet.prototype.getDefaultEdgeStyle = function() {
		return this.styles['defaultEdge'];
	};
	mxStylesheet.prototype.putCellStyle = function(name, style) {
		this.styles[name] = style;
	};
	mxStylesheet.prototype.getCellStyle = function(name, defaultStyle) {
		var style = defaultStyle;
		if (name != null && name.length > 0) {
			var pairs = name.split(';');
			if (pairs != null && pairs.length > 0) {
				if (style != null && pairs[0].indexOf('=') >= 0) {
					style = mxUtils.clone(style);
				} else {
					style = new Object();
				}
				for (var i = 0; i < pairs.length; i++) {
					var tmp = pairs[i];
					var pos = tmp.indexOf('=');
					if (pos >= 0) {
						var key = tmp.substring(0, pos);
						var value = tmp.substring(pos + 1);
						if (value == mxConstants.NONE) {
							delete style[key];
						} else if (mxUtils.isNumeric(value)) {
							style[key] = parseFloat(value);
						} else {
							style[key] = value;
						}
					} else {
						var tmpStyle = this.styles[tmp];
						if (tmpStyle != null) {
							for (var key in tmpStyle) {
								style[key] = tmpStyle[key];
							}
						}
					}
				}
			}
		}
		return style;
	};
}

{
	function mxCellState(view, cell, style) {
		this.view = view;
		this.cell = cell;
		this.style = style;
		this.origin = new mxPoint();
		this.absoluteOffset = new mxPoint();
	};
	mxCellState.prototype = new mxRectangle();
	mxCellState.prototype.constructor = mxCellState;
	mxCellState.prototype.view = null;
	mxCellState.prototype.cell = null;
	mxCellState.prototype.style = null;
	mxCellState.prototype.invalid = true;
	mxCellState.prototype.orderChanged = null;
	mxCellState.prototype.origin = null;
	mxCellState.prototype.absolutePoints = null;
	mxCellState.prototype.absoluteOffset = null;
	mxCellState.prototype.terminalDistance = 0;
	mxCellState.prototype.length = 0;
	mxCellState.prototype.segments = null;
	mxCellState.prototype.shape = null;
	mxCellState.prototype.text = null;
	mxCellState.prototype.getPerimeterBounds = function(border) {
		border = border || 0;
		var bounds = new mxRectangle(this.x, this.y, this.width, this.height);
		if (border != 0) {
			bounds.grow(border);
		}
		return bounds;
	};
	mxCellState.prototype.setAbsoluteTerminalPoint = function(point, isSource) {
		if (isSource) {
			if (this.absolutePoints == null) {
				this.absolutePoints = new Array();
			}
			if (this.absolutePoints.length == 0) {
				this.absolutePoints.push(point);
			} else {
				this.absolutePoints[0] = point;
			}
		} else {
			if (this.absolutePoints == null) {
				this.absolutePoints = new Array();
				this.absolutePoints.push(null);
				this.absolutePoints.push(point);
			} else if (this.absolutePoints.length == 1) {
				this.absolutePoints.push(point);
			} else {
				this.absolutePoints[this.absolutePoints.length - 1] = point;
			}
		}
	};
	mxCellState.prototype.destroy = function() {
		this.view.graph.cellRenderer.destroy(this);
		this.view.graph.destroyHandler(this);
	};
	mxCellState.prototype.clone = function() {
		var clone = new mxCellState(this.view, this.cell, this.style);
		if (this.absolutePoints != null) {
			clone.absolutePoints = new Array();
			for (i = 0; i < this.absolutePoints.length; i++) {
				clone.absolutePoints.push(this.absolutePoints[i].clone());
			}
		}
		if (this.origin != null) {
			clone.origin = this.origin.clone();
		}
		if (this.absoluteOffset != null) {
			clone.absoluteOffset = this.absoluteOffset.clone();
		}
		if (this.sourcePoint != null) {
			clone.sourcePoint = this.sourcePoint.clone();
		}
		if (this.boundingBox != null) {
			clone.boundingBox = this.boundingBox.clone();
		}
		clone.terminalDistance = this.terminalDistance;
		clone.segments = this.segments;
		clone.length = this.length;
		clone.x = this.x;
		clone.y = this.y;
		clone.width = this.width;
		clone.height = this.height;
		return clone;
	};
}

{
	function mxGraphSelectionModel(graph) {
		this.graph = graph;
		this.cells = new Array();
	};
	mxGraphSelectionModel.prototype = new mxEventSource();
	mxGraphSelectionModel.prototype.constructor = mxGraphSelectionModel;
	mxGraphSelectionModel.prototype.doneResource = (mxClient.language != 'none')
			? 'done'
			: '';
	mxGraphSelectionModel.prototype.updatingSelectionResource = (mxClient.language != 'none')
			? 'updatingSelection'
			: '';
	mxGraphSelectionModel.prototype.graph = null;
	mxGraphSelectionModel.prototype.singleSelection = false;
	mxGraphSelectionModel.prototype.isSingleSelection = function() {
		return this.singleSelection;
	};
	mxGraphSelectionModel.prototype.setSingleSelection = function(
			singleSelection) {
		this.singleSelection = singleSelection;
	};
	mxGraphSelectionModel.prototype.isSelected = function(cell) {
		if (cell != null) {
			var state = this.graph.getView().getState(cell);
			return this.graph.hasHandler(state);
		}
		return false;
	};
	mxGraphSelectionModel.prototype.isEmpty = function() {
		return this.cells.length == 0;
	};
	mxGraphSelectionModel.prototype.clear = function() {
		this.changeSelection(null, this.cells);
	};
	mxGraphSelectionModel.prototype.setCell = function(cell) {
		if (cell != null) {
			this.setCells([cell]);
		}
	};
	mxGraphSelectionModel.prototype.setCells = function(cells) {
		if (cells != null) {
			if (this.singleSelection) {
				cells = [this.getFirstSelectableCell(cells)];
			}
			var tmp = new Array();
			for (var i = 0; i < cells.length; i++) {
				if (this.graph.isCellSelectable(cells[i])) {
					tmp.push(cells[i]);
				}
			}
			this.changeSelection(tmp, this.cells);
		}
	};
	mxGraphSelectionModel.prototype.getFirstSelectableCell = function(cells) {
		if (cells != null) {
			for (var i = 0; i < cells.length; i++) {
				if (this.graph.isCellSelectable(cells[i])) {
					return cells[i];
				}
			}
		}
		return null;
	};
	mxGraphSelectionModel.prototype.addCell = function(cell) {
		if (cell != null) {
			this.addCells([cell]);
		}
	};
	mxGraphSelectionModel.prototype.addCells = function(cells) {
		if (cells != null) {
			var remove = null;
			if (this.singleSelection) {
				remove = this.cells;
				cells = [this.getFirstSelectableCell(cells)];
			}
			var tmp = new Array();
			for (var i = 0; i < cells.length; i++) {
				if (!this.isSelected(cells[i])
						&& this.graph.isCellSelectable(cells[i])) {
					tmp.push(cells[i]);
				}
			}
			this.changeSelection(tmp, remove);
		}
	};
	mxGraphSelectionModel.prototype.removeCell = function(cell) {
		if (cell != null) {
			this.removeCells([cell]);
		}
	};
	mxGraphSelectionModel.prototype.removeCells = function(cells) {
		if (cells != null) {
			var tmp = new Array();
			for (var i = 0; i < cells.length; i++) {
				if (this.isSelected(cells[i])) {
					// alert(cell[i].getId());
					tmp.push(cells[i]);
				}
			}
			this.changeSelection(null, tmp);
		}
	};
	mxGraphSelectionModel.prototype.changeSelection = function(added, removed) {
		if ((added != null && added.length > 0 && added[0] != null)
				|| (removed != null && removed.length > 0 && removed[0] != null)) {
			var change = new mxSelectionChange(this, added, removed);
			change.execute();
			var edit = new mxUndoableEdit(this, false);
			edit.add(change);
			this.fireEvent(mxEvent.UNDO, new mxEventObject([edit]));
		}
	};
	mxGraphSelectionModel.prototype.cellAdded = function(cell) {
		if (cell != null) {
			var state = this.graph.getView().getState(cell);
			if (!this.graph.hasHandler(state)) {
				this.graph.createHandler(state);
				this.cells.push(cell);
			}
		}
	};
	mxGraphSelectionModel.prototype.cellRemoved = function(cell) {
		if (cell != null) {
			var index = mxUtils.indexOf(this.cells, cell);
			if (index >= 0) {
				var state = this.graph.getView().getState(cell);
				this.graph.destroyHandler(state);
				this.cells.splice(index, 1);
			}
		}
	};
	function mxSelectionChange(selectionModel, added, removed) {
		this.selectionModel = selectionModel;
		this.added = (added != null) ? added.slice() : null;
		this.removed = (removed != null) ? removed.slice() : null;
	};
	mxSelectionChange.prototype.execute = function() {
		var t0 = mxLog.enter('mxSelectionChange.execute');
		window.status = mxResources
				.get(this.selectionModel.updatingSelectionResource)
				|| this.selectionModel.updatingSelectionResource;
		if (this.removed != null) {
			for (var i = 0; i < this.removed.length; i++) {
				this.selectionModel.cellRemoved(this.removed[i]);
			}
		}
		if (this.added != null) {
			for (var i = 0; i < this.added.length; i++) {
				this.selectionModel.cellAdded(this.added[i]);
			}
		}
		var tmp = this.added;
		this.added = this.removed;
		this.removed = tmp;
		window.status = mxResources.get(this.selectionModel.doneResource)
				|| this.selectionModel.doneResource;
		mxLog.leave('mxSelectionChange.execute', t0);
		this.selectionModel.fireEvent(mxEvent.CHANGE, new mxEventObject([
						this.removed, this.added]));
	};
}

{
	function mxCellEditor(graph) {
		this.graph = graph;
		this.textarea = document.createElement('textarea');
		this.textarea.className = 'mxCellEditor';
		this.textarea.style.position = 'absolute';
		this.textarea.style.overflow = 'visible';
		this.textarea.setAttribute('cols', '20');
		this.textarea.setAttribute('rows', '4');
		this.textarea.id = 'editObj' ;

		this.init();
	};
	/** xiaoxiong 20120710 获取字符串的真实长度 * */
	function getRealLength(str) {
	    // /<summary>获得字符串实际长度，中文2，英文1</summary>
	    // /<param name="str">要获得长度的字符串</param>
	    var realLength = 0, len = str.length, charCode = -1;
	    for (var i = 0; i < len; i++) {
	        charCode = str.charCodeAt(i);
	        if (charCode >= 0 && charCode <= 128) realLength += 1;
	        else realLength += 2;
	    }
	    return realLength;
	};

	mxCellEditor.prototype.graph = null;
	mxCellEditor.prototype.textarea = null;
	mxCellEditor.prototype.editingCell = null;
	mxCellEditor.prototype.trigger = null;
	mxCellEditor.prototype.modified = false;
	mxCellEditor.prototype.emptyLabelText = '';
	mxCellEditor.prototype.textNode = '';
	mxCellEditor.prototype.init = function() {
		var self = this;
		mxEvent.addListener(this.textarea, 'blur', function(evt) {
					self.stopEditing(!self.graph.isInvokesStopCellEditing());
				});
		mxEvent.addListener(this.textarea, 'keydown', function(evt) {
					if (self.clearOnChange) {
						self.clearOnChange = false;
						self.textarea.value = '';
					}
					self.setModified(true);
				});
	};
	mxCellEditor.prototype.isModified = function() {
		return this.modified;
	};
	mxCellEditor.prototype.setModified = function(value) {
		this.modified = value;
	};
	mxCellEditor.prototype.startEditing = function(cell, trigger) {
		this.stopEditing(true);
		var state = this.graph.getView().getState(cell);
		if (state != null) {
			this.editingCell = cell;
			this.trigger = trigger;
			this.textNode = null;
			if (state.text != null) {
				if (this.isHideLabel(state)) {
					this.textNode = state.text.node;
					this.textNode.style.visibility = 'hidden';
				}
				var scale = this.graph.getView().scale;
				this.textarea.style.fontSize = state.text.size * scale;
				this.textarea.style.fontFamily = state.text.family;
				this.textarea.style.color = state.text.color;
				if (this.textarea.style.color == 'white') {
					this.textarea.style.color = 'black';
				}
				this.textarea.style.textAlign = (this.graph.model
						.isEdge(state.cell))
						? 'left'
						: (state.text.align || 'left');
				this.textarea.style.fontWeight = state.text
						.isStyleSet(mxConstants.FONT_BOLD) ? 'bold' : 'normal';
			}
			var bounds = this.getEditorBounds(state);
			this.textarea.style.left = bounds.x + 'px';
			this.textarea.style.top = bounds.y + 'px';
			this.textarea.style.width = bounds.width + 'px';
			this.textarea.style.height = bounds.height + 'px';
			this.textarea.style.zIndex = 5;
			var value = this.getInitialValue(state, trigger);

			if (value == null || value.length == 0) {
				value = this.getEmptyLabelText();
				this.clearOnChange = true;
			} else {
				this.clearOnChange = false;
			}
			this.setModified(false);
			this.textarea.value = value;
			this.graph.container.appendChild(this.textarea);
			this.textarea.focus();
			// xiaoxiong 20120326 添加onkeyup事件 验证组建的值是否满足要求
			this.textarea.onkeyup =function() {
				var validatorValue = true ;
				if(this.value.trim().length == 0){
					this.style.border = '1px solid red';
					this.title = '该输入项为必填项，且不能全为空格！' ;
				// } else if(this.value.length > 64){
				} else if(getRealLength(this.value) > 50){
					this.style.border = '1px solid red';
					this.title = '该输入项的最大长度为50个字符,25个汉字' ;
				} else if(this.value.indexOf("'")>-1 || this.value.indexOf("\"")>-1 || this.value.indexOf("\\")>-1){
					this.style.border = '1px solid red';
					this.title = '不能包含英文单引号、双引号和反斜杠！' ;
				} else {
					this.style.border = '0px';
					this.title = '' ;
					validatorValue = false ;
				}
				if(validatorValue){
		            Ext.getCmp('cut').setDisabled(true);
		    		Ext.getCmp('copy').setDisabled(true);
		    		Ext.getCmp('delete').setDisabled(true);	
		    		Ext.getCmp('paste').setDisabled(true);
			    	Ext.getCmp('italic').setDisabled(true);
			    	Ext.getCmp('bold').setDisabled(true);
			    	Ext.getCmp('underline').setDisabled(true);
			    	Ext.getCmp('fillcolor').setDisabled(true);
			    	Ext.getCmp('fontcolor').setDisabled(true);
			    	Ext.getCmp('linecolor').setDisabled(true);
			    	Ext.getCmp('align').setDisabled(true);
			    	Ext.getCmp('save').setDisabled(true);
				} else {
			    	Ext.getCmp('save').setDisabled(false);
				}
			}
			this.textarea.select();
		}
	};
	mxCellEditor.prototype.stopEditing = function(cancel) {
		// xiaoxiong 20120326 添加判断 验证组建的值是否满足要求
		// if(this.textarea.value.trim().length==0 ||
		// this.textarea.value.length>64 || this.textarea.value.indexOf("'")>-1
		// || this.textarea.value.indexOf("\"")>-1 ||
		// this.textarea.value.indexOf("\\")>-1){
		if(this.textarea.value.trim().length==0 || getRealLength(this.textarea.value) > 64 || this.textarea.value.indexOf("'")>-1 || this.textarea.value.indexOf("\"")>-1 || this.textarea.value.indexOf("\\")>-1){
			return false ;
		} else {
			cancel = cancel || false;
			if (this.editingCell != null) {
				if (this.textNode != null) {
					this.textNode.style.visibility = 'visible';
					this.textNode = null;
				}
				if (!cancel && this.isModified()) {
					this.graph.labelChanged(this.editingCell, this
									.getCurrentValue(), this.trigger);
				}
				this.editingCell = null;
				this.trigger = null;
				this.textarea.blur();
				this.textarea.parentNode.removeChild(this.textarea);
			}
		}
	};
	mxCellEditor.prototype.getInitialValue = function(state, trigger) {
		return this.graph.getEditingValue(state.cell, trigger);
	};
	mxCellEditor.prototype.getCurrentValue = function() {
		return this.textarea.value.replace(/\r/g, '');
	};
	mxCellEditor.prototype.isHideLabel = function(state) {
		return true;
	};
	mxCellEditor.prototype.getEditorBounds = function(state) {
		var isEdge = this.graph.getModel().isEdge(state.cell);
		var scale = this.graph.getView().scale;
		var minHeight = (state.text == null) ? 30 : state.text.size * scale
				+ 20;
		var minWidth = (this.textarea.style.textAlign == 'left') ? 120 : 40;
		var spacing = parseInt(state.style[mxConstants.STYLE_SPACING] || 2)
				* scale;
		var spacingTop = (parseInt(state.style[mxConstants.STYLE_SPACING_TOP]
				|| 0))
				* scale + spacing;
		var spacingRight = (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT]
				|| 0))
				* scale + spacing;
		var spacingBottom = (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM]
				|| 0))
				* scale + spacing;
		var spacingLeft = (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT]
				|| 0))
				* scale + spacing;
		var result = new mxRectangle(state.x, state.y, Math.max(minWidth,
						state.width - spacingLeft - spacingRight), Math.max(
						minHeight, state.height - spacingTop - spacingBottom));
		if (isEdge) {
			result.x = state.absoluteOffset.x;
			result.y = state.absoluteOffset.y;
			if (state.text != null && state.text.boundingBox != null) {
				result.x = state.text.boundingBox.x;
				result.y = state.text.boundingBox.y;
			}
		} else if (state.text != null && state.text.boundingBox != null) {
			result.x = Math.min(result.x, state.text.boundingBox.x);
			result.y = Math.min(result.y, state.text.boundingBox.y);
		}
		result.x += spacingLeft;
		result.y += spacingTop;
		if (state.text != null && state.text.boundingBox != null) {
			if (!isEdge) {
				result.width = Math.max(result.width,
						state.text.boundingBox.width);
				result.height = Math.max(result.height,
						state.text.boundingBox.height);
			} else {
				result.width = Math.max(minWidth, state.text.boundingBox.width);
				result.height = Math.max(minHeight,
						state.text.boundingBox.height);
			}
		}
		if (this.graph.getModel().isVertex(state.cell)) {
			var horizontal = mxUtils.getValue(state.style,
					mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
			if (horizontal == mxConstants.ALIGN_LEFT) {
				result.x -= state.width;
			} else if (horizontal == mxConstants.ALIGN_RIGHT) {
				result.x += state.width;
			}
			var vertical = mxUtils.getValue(state.style,
					mxConstants.STYLE_VERTICAL_LABEL_POSITION,
					mxConstants.ALIGN_MIDDLE);
			if (vertical == mxConstants.ALIGN_TOP) {
				result.y -= state.height;
			} else if (vertical == mxConstants.ALIGN_BOTTOM) {
				result.y += state.height;
			}
		}
		return result;
	};
	mxCellEditor.prototype.getEmptyLabelText = function(cell) {
		return this.emptyLabelText;
	};
	mxCellEditor.prototype.getEditingCell = function() {
		return this.editingCell;
	};
	mxCellEditor.prototype.destroy = function() {
		mxEvent.release(this.textarea);
		if (this.textarea.parentNode != null) {
			this.textarea.parentNode.removeChild(this.textarea);
		}
		this.textarea = null;
	};
}

{
	function mxCellRenderer() {
		this.shapes = mxUtils.clone(this.defaultShapes);
	};
	mxCellRenderer.prototype.collapseExpandResource = (mxClient.language != 'none')
			? 'collapse-expand'
			: '';
	mxCellRenderer.prototype.shapes = null;
	mxCellRenderer.prototype.defaultEdgeShape = mxPolyline;
	mxCellRenderer.prototype.defaultVertexShape = mxRectangleShape;
	mxCellRenderer.prototype.defaultShapes = new Object();
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_ARROW] = mxArrow;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_RECTANGLE] = mxRectangleShape;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_ELLIPSE] = mxEllipse;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_DOUBLE_ELLIPSE] = mxDoubleEllipse;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_RHOMBUS] = mxRhombus;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_IMAGE] = mxImageShape;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_LINE] = mxLine;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_LABEL] = mxLabel;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_CYLINDER] = mxCylinder;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_SWIMLANE] = mxSwimlane;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_CONNECTOR] = mxConnector;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_ACTOR] = mxActor;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_CLOUD] = mxCloud;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_TRIANGLE] = mxTriangle;
	mxCellRenderer.prototype.defaultShapes[mxConstants.SHAPE_HEXAGON] = mxHexagon;
	mxCellRenderer.prototype.registerShape = function(key, shape) {
		this.shapes[key] = shape;
	};
	mxCellRenderer.prototype.initialize = function(state) {
		var model = state.view.graph.getModel();
		if (state.view.graph.container != null && state.shape == null
				&& state.cell != state.view.currentRoot
				&& (model.isVertex(state.cell) || model.isEdge(state.cell))) {
			this.createShape(state);
			if (state.shape != null) {
				this.initializeShape(state);
				if (state.view.graph.ordered) {
					this.order(state);
				} else if (model.isEdge(state.cell)) {
					this.orderEdge(state);
				} else if (state.view.graph.keepEdgesInForeground
						&& this.firstEdge != null) {
					if (this.firstEdge.parentNode == state.shape.node.parentNode) {
						state.shape.node.parentNode.insertBefore(
								state.shape.node, this.firstEdge);
					} else {
						this.firstEdge = null;
					}
				}
				state.shape.scale = state.view.scale;
				this.createCellOverlays(state);
				this.installListeners(state);
			}

			var cells = state.view.graph.getSelectionCells();
			if (mxUtils.indexOf(cells, state.cell) >= 0) {
				state.doCreateHandler = true;
			}
		}
	};
	mxCellRenderer.prototype.initializeShape = function(state) {
		state.shape.init(state.view.getDrawPane());
	}
	mxCellRenderer.prototype.order = function(state) {

		var view = state.view;
		var model = view.graph.getModel();
		var parent = model.getParent(state.cell);
		var index = parent.getIndex(state.cell);
		var previousState = null;
		var previous = null;
		while (index > 0) {
			previous = model.getChildAt(parent, index - 1);
			previousState = view.getState(previous);
			if (previousState != null) {
				break;
			}
			index--;
		}
		if (previousState != null) {
			var childCount = model.getChildCount(previous);
			while (childCount > 0) {
				previousState = null;
				var tmp = model.getChildAt(previous, childCount - 1);
				var tmpState = view.getState(tmp);
				if (tmpState == null) {
					break;
				} else {
					previousState = tmpState;
				}
				previous = tmp;
				childCount = model.getChildCount(previous);
			}
		} else {
			previous = parent;
		}
		if (previousState == null) {
			previousState = view.getState(previous);
		}
		var parentNode = null;
		var node = null;
		if (previousState != null && previousState.shape != null) {
			if (previousState.text != null) {
				node = previousState.text.node;
			}

			if (node == null || node.parentNode == previousState.shape.node
					|| node.parentNode != previousState.shape.node.parentNode) {
				node = previousState.shape.node;
			}
			if (node != null) {
				parentNode = node.parentNode;
				node = node.nextSibling;
			}
		} else {
			node = state.shape.node.parentNode.firstChild;
		}
		if (parentNode != null) {
			parentNode.insertBefore(state.shape.node, node);
		}
	};
	mxCellRenderer.prototype.orderEdge = function(state) {
		var view = state.view;
		var model = view.graph.getModel();
		if (view.graph.keepEdgesInForeground) {
			var node = state.shape.node;
			if (this.firstEdge == null || this.firstEdge.parentNode == null
					|| this.firstEdge.parentNode != state.shape.node.parentNode) {
				this.firstEdge = state.shape.node;
			}
		} else if (view.graph.keepEdgesInBackground) {
			var node = state.shape.node;
			var parent = node.parentNode;
			var pcell = model.getParent(state.cell);
			var pstate = view.getState(pcell);
			if (pstate != null && pstate.shape != null
					&& pstate.shape.node != null) {
				var child = pstate.shape.node.nextSibling;
				if (child != null && child != node) {
					parent.insertBefore(node, child);
				}
			} else {
				var child = parent.firstChild;
				if (child != null && child != node) {
					parent.insertBefore(node, child);
				}
			}
		}
	};
	mxCellRenderer.prototype.createShape = function(state) {
		if (state.style != null) {
			var ctor = this.getShapeConstructor(state);
			state.shape = new ctor();
			state.shape.points = state.absolutePoints;
			state.shape.bounds = new mxRectangle(state.x, state.y, state.width,
					state.height);
			state.shape.dialect = state.view.graph.dialect;
			this.configureShape(state);
		}
	};
	mxCellRenderer.prototype.getShapeConstructor = function(state) {
		var graph = state.view.graph;
		var isEdge = graph.getModel().isEdge(state.cell);
		var key = state.style[mxConstants.STYLE_SHAPE];
		var ctor = (key != null) ? this.shapes[key] : null;
		if (ctor == null) {
			ctor = (isEdge) ? this.defaultEdgeShape : this.defaultVertexShape;
		}
		return ctor;
	};
	mxCellRenderer.prototype.configureShape = function(state) {
		state.shape.apply(state);
		var image = state.view.graph.getImage(state);
		if (image != null) {
			state.shape.image = image;
		}
		var indicator = state.view.graph.getIndicatorColor(state);
		var key = state.view.graph.getIndicatorShape(state);
		var ctor = (key != null) ? this.shapes[key] : null;
		if (indicator != null) {
			state.shape.indicatorShape = ctor;
			state.shape.indicatorColor = indicator;
			state.shape.indicatorGradientColor = state.view.graph
					.getIndicatorGradientColor(state);
		} else {
			var indicator = state.view.graph.getIndicatorImage(state);
			if (indicator != null) {
				state.shape.indicatorImage = indicator;
			}
		}
		this.postConfigureShape(state);
	};
	mxCellRenderer.prototype.postConfigureShape = function(state) {
		if (state.shape != null) {
			this.resolveColor(state, 'indicatorColor',
					mxConstants.STYLE_FILLCOLOR);
			this.resolveColor(state, 'indicatorGradientColor',
					mxConstants.STYLE_GRADIENTCOLOR);
			this.resolveColor(state, 'fill', mxConstants.STYLE_FILLCOLOR);
			this.resolveColor(state, 'stroke', mxConstants.STYLE_STROKECOLOR);
			this.resolveColor(state, 'gradient',
					mxConstants.STYLE_GRADIENTCOLOR);
		}
	};
	mxCellRenderer.prototype.resolveColor = function(state, field, key) {
		var value = state.shape[field];
		var graph = state.view.graph;
		var referenced = null;
		if (value == 'inherit') {
			referenced = graph.model.getParent(state.cell);
		} else if (value == 'swimlane') {
			if (graph.model.getTerminal(state.cell, false) != null) {
				referenced = graph.model.getTerminal(state.cell, false);
			} else {
				referenced = state.cell;
			}
			referenced = graph.getSwimlane(referenced);
			key = graph.swimlaneIndicatorColorAttribute;
		} else if (value == 'indicated') {
			state.shape[field] = state.shape.indicatorColor;
		}
		if (referenced != null) {
			var rstate = graph.getView().getState(referenced);
			state.shape[field] = null;
			if (rstate != null) {
				if (rstate.shape != null && field != 'indicatorColor') {
					state.shape[field] = rstate.shape[field];
				} else {
					state.shape[field] = rstate.style[key];
				}
			}
		}
	};
	mxCellRenderer.prototype.getLabelValue = function(state) {
		var graph = state.view.graph;
		var value = graph.getLabel(state.cell);
		if (!graph.isHtmlLabel(state.cell)
				&& (value != null && !mxUtils.isNode(value)) && true) {
			value = mxUtils.htmlEntities(value, false);
		}
		return value;
	};
	mxCellRenderer.prototype.createLabel = function(state) {
		var graph = state.view.graph;
		var isEdge = graph.getModel().isEdge(state.cell);
		if (state.style[mxConstants.STYLE_FONTSIZE] > 0
				|| state.style[mxConstants.STYLE_FONTSIZE] == null) {
			var value = this.getLabelValue(state);
			if (value == null || value.length == 0) {
				return;
			}
			var isForceHtml = (graph.isHtmlLabel(state.cell) || (value != null && mxUtils
					.isNode(value)))
					&& graph.dialect == mxConstants.DIALECT_SVG;
			var isRotate = state.style[mxConstants.STYLE_HORIZONTAL] == false;
			state.text = new mxText(value, new mxRectangle(),
					state.style[mxConstants.STYLE_ALIGN], graph
							.getVerticalAlign(state),
					state.style[mxConstants.STYLE_FONTCOLOR],
					state.style[mxConstants.STYLE_FONTFAMILY],
					state.style[mxConstants.STYLE_FONTSIZE],
					state.style[mxConstants.STYLE_FONTSTYLE],
					state.style[mxConstants.STYLE_SPACING],
					state.style[mxConstants.STYLE_SPACING_TOP],
					state.style[mxConstants.STYLE_SPACING_RIGHT],
					state.style[mxConstants.STYLE_SPACING_BOTTOM],
					state.style[mxConstants.STYLE_SPACING_LEFT], isRotate,
					state.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR],
					state.style[mxConstants.STYLE_LABEL_BORDERCOLOR], isEdge,
					isEdge || isForceHtml, graph.isWrapping(state.cell), graph
							.isLabelClipped(state.cell),state.cell.getId());// ////jiang
																			// 20100203
			state.text.opacity = state.style[mxConstants.STYLE_TEXT_OPACITY];
			state.text.dialect = (isForceHtml)
					? mxConstants.DIALECT_STRICTHTML
					: state.view.graph.dialect;
			this.initializeLabel(state);
			var cursor = graph.getCursorForCell(state.cell);
			if (cursor != null
					|| (graph.isEnabled() && graph.isCellMovable(state.cell))) {
				state.text.node.style.cursor = cursor || 'move';
			}
			mxEvent.addListener(state.text.node, 'mousedown', function(evt) {
						var handle = null;

						if (graph.getModel().isEdge(state.cell)
								&& graph.isCellSelected(state.cell)) {
							handle = mxEvent.LABEL_HANDLE;
						}
						graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
								new mxMouseEvent(evt, state, handle));
					});
			mxEvent.addListener(state.text.node, 'mousemove', function(evt) {
						graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
								new mxMouseEvent(evt, state));
					});
			mxEvent.addListener(state.text.node, 'mouseup', function(evt) {
						graph.fireMouseEvent(mxEvent.MOUSE_UP,
								new mxMouseEvent(evt, state));
					});
			mxEvent.addListener(state.text.node, 'dblclick', function(evt) {
						graph.dblClick(evt, state.cell);
						mxEvent.consume(evt);
					});
		}
	};
	mxCellRenderer.prototype.initializeLabel = function(state) {
		var graph = state.view.graph;
		if (state.text.dialect != mxConstants.DIALECT_SVG) {
			if (graph.dialect == mxConstants.DIALECT_SVG) {

				var node = graph.container;
				var overflow = node.style.overflow;
				state.text.isAbsolute = true;
				state.text.init(node);
				node.style.overflow = overflow;
				return;
			} else if (mxUtils.isVml(state.view.getDrawPane())) {
				if (state.shape.label != null) {
					state.text.init(state.shape.label);
				} else {
					state.text.init(state.shape.node);
				}
				return;
			}
		}
		state.text.init(state.view.getDrawPane());
		state.text.isAbsolute = true;
		if (state.shape != null && state.text != null) {
			state.shape.node.parentNode.insertBefore(state.text.node,
					state.shape.node.nextSibling);
		}
	};
	mxCellRenderer.prototype.createCellOverlays = function(state) {
		var graph = state.view.graph;
		var overlays = graph.getCellOverlays(state.cell);
		if (overlays != null) {
			state.overlays = new Array();
			for (var i = 0; i < overlays.length; i++) {
				var tmp = new mxImageShape(new mxRectangle(),
						overlays[i].image.src);
				tmp.dialect = state.view.graph.dialect;
				tmp.init(state.view.getOverlayPane());
				tmp.node.style.cursor = 'help';
				this.installCellOverlayListeners(state, overlays[i], tmp);
				state.overlays.push(tmp);
			}
		}
	};
	mxCellRenderer.prototype.installCellOverlayListeners = function(state,
			overlay, shape) {
		mxEvent.addListener(shape.node, 'click', function(evt) {
					overlay.fireEvent(mxEvent.CLICK, new mxEventObject([evt,
									state.cell]));
				});
		mxEvent.addListener(shape.node, 'mousedown', function(evt) {
					mxEvent.consume(evt);
				});
		var graph = state.view.graph;
		mxEvent.addListener(shape.node, 'mousemove', function(evt) {
					graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(
									evt, state, overlay, overlay.tooltip));
				});
	};
	mxCellRenderer.prototype.createControl = function(state) {
		var graph = state.view.graph;
		var image = graph.getFoldingImage(state);
		if (graph.foldingEnabled && image != null) {
			if (state.control == null) {
				var b = new mxRectangle(0, 0, image.width, image.height);
				state.control = new mxImageShape(b, image.src);
				state.control.dialect = state.view.graph.dialect;

				var isForceHtml = (graph.isHtmlLabel(state.cell) && state.view.graph.dialect == mxConstants.DIALECT_SVG) || false || false;
				if (isForceHtml) {
					state.control.dialect = mxConstants.DIALECT_PREFERHTML;
					state.control.init(graph.container);
					state.control.node.style.zIndex = 1;
				} else {
					state.control.init(state.view.getOverlayPane());
				}
				var node = state.control.innerNode || state.control.node;
				if (graph.isEnabled()) {
					node.style.cursor = 'pointer';
				}
				mxEvent.addListener(node, 'click', function(evt) {
							if (graph.isEnabled()) {
								var collapse = !graph
										.isCellCollapsed(state.cell);
								graph.foldCells(collapse, false, [state.cell]);
								mxEvent.consume(evt);
							}
						});
				mxEvent.addListener(node, 'mousedown', function(evt) {
							graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
									new mxMouseEvent(evt, state));
							mxEvent.consume(evt);
						});
				var tip = this.collapseExpandResource;
				tip = mxResources.get(tip) || tip;
				var self = this;
				mxEvent.addListener(node, 'mousemove', function(evt) {
							graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
									new mxMouseEvent(evt, state, null, tip));
						});
			}
		} else if (state.control != null) {
			state.control.destroy();
			state.control = null;
		}
	};
	mxCellRenderer.prototype.installListeners = function(state) {
		var graph = state.view.graph;
		if (graph.dialect == mxConstants.DIALECT_SVG) {
			var events = 'all';
			if (graph.getModel().isEdge(state.cell)
					&& state.shape.stroke != null && state.shape.fill == null) {
				events = 'visibleStroke';
			}
			if (state.shape.innerNode != null) {
				state.shape.innerNode.setAttribute('pointer-events', events);
			} else {
				state.shape.node.setAttribute('pointer-events', events);
			}
		}
		var cursor = graph.getCursorForCell(state.cell);
		if (cursor != null || graph.isEnabled()) {
			if (cursor == null) {
				if (graph.getModel().isEdge(state.cell)) {
					cursor = 'pointer';
				} else if (graph.isCellMovable(state.cell)) {
					cursor = 'move';
				}
			}
			if (state.shape.innerNode != null
					&& !graph.getModel().isEdge(state.cell)) {
				state.shape.innerNode.style.cursor = cursor;
			} else {
				state.shape.node.style.cursor = cursor;
			}
		}
		mxEvent.addListener(state.shape.node, 'mousedown', function(evt) {

					graph
							.fireMouseEvent(
									mxEvent.MOUSE_DOWN,
									new mxMouseEvent(
											evt,
											(state.shape != null && mxEvent
													.getSource(evt) == state.shape.content)
													? null
													: state));
				});
		mxEvent.addListener(state.shape.node, 'mousemove', function(evt) {
					graph
							.fireMouseEvent(
									mxEvent.MOUSE_MOVE,
									new mxMouseEvent(
											evt,
											(state.shape != null && mxEvent
													.getSource(evt) == state.shape.content)
													? null
													: state));
				});
		mxEvent.addListener(state.shape.node, 'mouseup', function(evt) {
					graph
							.fireMouseEvent(
									mxEvent.MOUSE_UP,
									new mxMouseEvent(
											evt,
											(state.shape != null && mxEvent
													.getSource(evt) == state.shape.content)
													? null
													: state));
				});
		mxEvent.addListener(state.shape.node, 'dblclick', function(evt) {
					graph.dblClick(evt, (state.shape != null && mxEvent
									.getSource(evt) == state.shape.content)
									? null
									: state.cell);
					mxEvent.consume(evt);
				});
	};
	mxCellRenderer.prototype.redrawLabel = function(state) {
		var value = this.getLabelValue(state);
		if (state.text == null && value != null && value.length > 0) {
			this.createLabel(state);
		} else if (state.text != null && (value == null || value.length == 0)) {
			state.text.destroy();
			state.text = null;
		}
		if (state.text != null) {
			var graph = state.view.graph;
			var wrapping = graph.isWrapping(state.cell);
			var clipping = graph.isLabelClipped(state.cell);
			var bounds = this.getLabelBounds(state);
			if (state.text.value != value || state.text.isWrapping != wrapping
					|| state.text.isClipping != clipping
					|| state.text.scale != state.view.scale
					|| !state.text.bounds.equals(bounds)) {
				state.text.value = value;
				state.text.bounds = bounds;
				state.text.scale = state.view.scale;
				state.text.isWrapping = wrapping;
				state.text.isClipping = clipping;
				state.text.redraw();
			}
		}
	};
	mxCellRenderer.prototype.getLabelBounds = function(state) {
		var graph = state.view.graph;
		var isEdge = graph.getModel().isEdge(state.cell);
		var bounds = new mxRectangle(state.absoluteOffset.x,
				state.absoluteOffset.y);
		if (!isEdge) {
			bounds.x += state.shape.bounds.x;
			bounds.y += state.shape.bounds.y;
			bounds.width = Math.max(1, state.shape.bounds.width);
			bounds.height = Math.max(1, state.shape.bounds.height);
			var isRotate = state.style[mxConstants.STYLE_HORIZONTAL] == false;
			if (graph.isSwimlane(state.cell)) {
				var scale = graph.view.scale;
				var height = (parseInt(state.style[mxConstants.STYLE_STARTSIZE]) || 0)
						* scale;
				if (isRotate) {
					bounds.width = height;
				} else {
					bounds.height = height;
				}
			}
		}
		return bounds;
	};
	mxCellRenderer.prototype.redrawCellOverlays = function(state) {
		var overlays = state.view.graph.getCellOverlays(state.cell);
		var oldCount = (state.overlays != null) ? state.overlays.length : 0;
		var newCount = (overlays != null) ? overlays.length : 0;
		if (oldCount != newCount) {
			if (oldCount > 0) {
				for (var i = 0; i < state.overlays.length; i++) {
					state.overlays[i].destroy();
				}
				state.overlays = null;
			}
			if (newCount > 0) {
				this.createCellOverlays(state);
			}
		}
		if (state.overlays != null) {
			for (var i = 0; i < overlays.length; i++) {
				var bounds = overlays[i].getBounds(state);
				if (state.overlays[i].bounds == null
						|| state.overlays[i].scale != state.view.scale
						|| !state.overlays[i].bounds.equals(bounds)) {
					state.overlays[i].bounds = bounds;
					state.overlays[i].scale = state.view.scale;
					state.overlays[i].redraw();
				}
			}
		}
	};
	mxCellRenderer.prototype.redrawControl = function(state) {
		if (state.control != null) {
			var bounds = this.getControlBounds(state);
			var s = state.view.scale;
			if (state.control.scale != s
					|| !state.control.bounds.equals(bounds)) {
				state.control.bounds = bounds;
				state.control.scale = s;
				state.control.redraw();
			}
		}
	};
	mxCellRenderer.prototype.getControlBounds = function(state) {
		if (state.control != null) {
			var oldScale = state.control.scale;
			var w = state.control.bounds.width / oldScale;
			var h = state.control.bounds.height / oldScale;
			var s = state.view.scale;
			return (state.view.graph.getModel().isEdge(state.cell))
					? new mxRectangle(state.x + state.width / 2 - w / 2 * s,
							state.y + state.height / 2 - h / 2 * s, w * s, h
									* s)
					: new mxRectangle(state.x + w / 2 * s, state.y + h / 2 * s,
							w * s, h * s);
		}
		return null;
	};
	mxCellRenderer.prototype.redraw = function(state) {
		if (state.shape != null) {
			var model = state.view.graph.getModel();
			var isEdge = model.isEdge(state.cell);
			var reconfigure = false;
			this.createControl(state);
			if (state.orderChanged && state.view.graph.ordered) {
				delete state.orderChanged;
				this.order(state);
				if (state.text != null
						&& state.text.node.parentNode == state.shape.node.parentNode) {
					state.shape.node.parentNode.insertBefore(state.text.node,
							state.shape.node.nextSibling);
				}
				reconfigure = true;
			}

			if (!mxUtils.equalEntries(state.shape.style, state.style)) {
				state.shape.apply(state);
				reconfigure = true;
			}
			if (reconfigure) {
				this.configureShape(state);
				state.shape.reconfigure();
			}
			if (state.shape.bounds == null
					|| state.shape.scale != state.view.scale
					|| !state.shape.bounds.equals(state)
					|| !mxUtils.equalPoints(state.shape.points,
							state.absolutePoints)) {

				state.shape.points = state.absolutePoints;
				state.shape.bounds = new mxRectangle(state.x, state.y,
						state.width, state.height);
				state.shape.scale = state.view.scale;
				state.shape.redraw();
			}
			this.redrawLabel(state);
			this.redrawCellOverlays(state);
			this.redrawControl(state);
		}
		if (state.doCreateHandler) {
			delete state.doCreateHandler;
			state.view.graph.createHandler(state);
		}
		if (state.view.graph.hasHandler(state)) {
			state.view.graph.redrawHandler(state);
		}
	};
	mxCellRenderer.prototype.destroy = function(state) {
		if (state.shape != null) {
			if (state.text != null) {
				state.text.destroy();
				state.text = null;
			}
			if (state.overlays != null) {
				for (var i = 0; i < state.overlays.length; i++) {
					state.overlays[i].destroy();
				}
				state.overlays = null;
			}
			if (state.control != null) {
				state.control.destroy();
				state.control = null;
			}
			state.shape.destroy();
			state.shape = null;
		}
	};
}

var mxEdgeStyle = {
	EntityRelation : function(state, source, target, points, result) {
		var view = state.view;
		var graph = view.graph;
		var segment = mxUtils.getValue(state.style,
				mxConstants.STYLE_STARTSIZE, mxConstants.ENTITY_SEGMENT)
				* state.view.scale;
		var isSourceLeft = false;
		if (source != null) {
			var sourceGeometry = graph.getCellGeometry(source.cell);
			if (sourceGeometry.relative) {
				isSourceLeft = sourceGeometry.x <= 0.5;
			} else if (target != null) {
				isSourceLeft = target.x + target.width < source.x;
			}
		} else {
			var tmp = state.absolutePoints[0];
			if (tmp == null) {
				return;
			}
			source = new mxCellState();
			source.x = tmp.x;
			source.y = tmp.y;
		}
		var isTargetLeft = true;
		if (target != null) {
			var targetGeometry = graph.getCellGeometry(target.cell);
			if (targetGeometry.relative) {
				isTargetLeft = targetGeometry.x <= 0.5;
			} else if (source != null) {
				isTargetLeft = source.x + source.width < target.x;
			}
		} else {
			var pts = state.absolutePoints;
			var tmp = pts[pts.length - 1];
			if (tmp == null) {
				return;
			}
			target = new mxCellState();
			target.x = tmp.x;
			target.y = tmp.y;
		}
		var x0 = (isSourceLeft) ? source.x : source.x + source.width;
		var y0 = view.getRoutingCenterY(source);
		var xe = (isTargetLeft) ? target.x : target.x + target.width;
		var ye = view.getRoutingCenterY(target);
		var seg = segment;
		var dx = (isSourceLeft) ? -seg : seg;
		var dep = new mxPoint(x0 + dx, y0);
		dx = (isTargetLeft) ? -seg : seg;
		var arr = new mxPoint(xe + dx, ye);
		if (isSourceLeft == isTargetLeft) {
			var x = (isSourceLeft) ? Math.min(x0, xe) - segment : Math.max(x0,
					xe)
					+ segment;
			result.push(new mxPoint(x, y0));
			result.push(new mxPoint(x, ye));
		} else if ((dep.x < arr.x) == isSourceLeft) {
			var midY = y0 + (ye - y0) / 2;
			result.push(dep);
			result.push(new mxPoint(dep.x, midY));
			result.push(new mxPoint(arr.x, midY));
			result.push(arr);
		} else {
			result.push(dep);
			result.push(arr);
		}
	},
	Loop : function(state, source, target, points, result) {
		var view = state.view;
		var graph = view.graph;
		var pt = (points != null && points.length > 0) ? points[0] : null;
		var s = view.scale;
		if (pt != null) {
			pt = view.transformControlPoint(state, pt);
			if (mxUtils.contains(source, pt.x, pt.y)) {
				pt = null;
			}
		}
		var x = 0;
		var dx = 0;
		var y = view.getRoutingCenterY(source);
		var dy = s * graph.gridSize;
		if (pt == null || pt.x < source.x || pt.x > source.x + source.width) {
			if (pt != null) {
				x = pt.x;
				dy = Math.max(Math.abs(y - pt.y), dy);
			} else {
				x = source.x + source.width + 2 * dy;
			}
		} else if (pt != null) {
			x = view.getRoutingCenterX(source);
			dx = Math.max(Math.abs(x - pt.x), dy);
			y = pt.y;
			dy = 0;
		}
		result.push(new mxPoint(x - dx, y - dy));
		result.push(new mxPoint(x + dx, y + dy));
	},
	ElbowConnector : function(state, source, target, points, result) {
		var pt = (points != null && points.length > 0) ? points[0] : null;
		var vertical = false;
		var horizontal = false;
		if (source != null && target != null) {
			if (pt != null) {
				var left = Math.min(source.x, target.x);
				var right = Math.max(source.x + source.width, target.x
								+ target.width);
				var top = Math.min(source.y, target.y);
				var bottom = Math.max(source.y + source.height, target.y
								+ target.height);
				var view = state.view;
				pt = view.transformControlPoint(state, pt);
				vertical = pt.y < top || pt.y > bottom;
				horizontal = pt.x < left || pt.x > right;
			} else {
				var left = Math.max(source.x, target.x);
				var right = Math.min(source.x + source.width, target.x
								+ target.width);
				vertical = left == right;
				if (!vertical) {
					var top = Math.max(source.y, target.y);
					var bottom = Math.min(source.y + source.height, target.y
									+ target.height);
					horizontal = top == bottom;
				}
			}
		}
		if (!horizontal
				&& (vertical || state.style[mxConstants.STYLE_ELBOW] == mxConstants.ELBOW_VERTICAL)) {
			mxEdgeStyle.TopToBottom(state, source, target, points, result);
		} else {
			mxEdgeStyle.SideToSide(state, source, target, points, result);
		}
	},
	SideToSide : function(state, source, target, points, result) {
		var view = state.view;
		var pt = (points != null && points.length > 0) ? points[0] : null;
		if (pt != null) {
			pt = view.transformControlPoint(state, pt);
		}
		if (source == null) {
			var tmp = state.absolutePoints[0];
			if (tmp == null) {
				return;
			}
			source = new mxCellState();
			source.x = tmp.x;
			source.y = tmp.y;
		}
		if (target == null) {
			var pts = state.absolutePoints;
			var tmp = pts[pts.length - 1];
			if (tmp == null) {
				return;
			}
			target = new mxCellState();
			target.x = tmp.x;
			target.y = tmp.y;
		}
		var l = Math.max(source.x, target.x);
		var r = Math.min(source.x + source.width, target.x + target.width);
		var x = (pt != null) ? pt.x : r + (l - r) / 2;
		var y1 = view.getRoutingCenterY(source);
		var y2 = view.getRoutingCenterY(target);
		if (pt != null) {
			if (pt.y >= source.y && pt.y <= source.y + source.height) {
				y1 = pt.y;
			}
			if (pt.y >= target.y && pt.y <= target.y + target.height) {
				y2 = pt.y;
			}
		}
		if (!mxUtils.contains(target, x, y1)
				&& !mxUtils.contains(source, x, y1)) {
			result.push(new mxPoint(x, y1));
		}
		if (!mxUtils.contains(target, x, y2)
				&& !mxUtils.contains(source, x, y2)) {
			result.push(new mxPoint(x, y2));
		}
		if (result.length == 1) {
			if (pt != null) {
				if (!mxUtils.contains(target, x, pt.y)
						&& !mxUtils.contains(source, x, pt.y)) {
					result.push(new mxPoint(x, pt.y));
				}
			} else {
				var t = Math.max(source.y, target.y);
				var b = Math.min(source.y + source.height, target.y
								+ target.height);
				result.push(new mxPoint(x, t + (b - t) / 2));
			}
		}
	},
	TopToBottom : function(state, source, target, points, result) {
		var view = state.view;
		var pt = (points != null && points.length > 0) ? points[0] : null;
		if (pt != null) {
			pt = view.transformControlPoint(state, pt);
		}
		if (source == null) {
			var tmp = state.absolutePoints[0];
			if (tmp == null) {
				return;
			}
			source = new mxCellState();
			source.x = tmp.x;
			source.y = tmp.y;
		}
		if (target == null) {
			var pts = state.absolutePoints;
			var tmp = pts[pts.length - 1];
			if (tmp == null) {
				return;
			}
			target = new mxCellState();
			target.x = tmp.x;
			target.y = tmp.y;
		}
		var t = Math.max(source.y, target.y);
		var b = Math.min(source.y + source.height, target.y + target.height);
		var x = view.getRoutingCenterX(source);
		if (pt != null && pt.x >= source.x && pt.x <= source.x + source.width) {
			x = pt.x;
		}
		var y = (pt != null) ? pt.y : b + (t - b) / 2;
		if (!mxUtils.contains(target, x, y) && !mxUtils.contains(source, x, y)) {
			result.push(new mxPoint(x, y));
		}
		if (pt != null && pt.x >= target.x && pt.x <= target.x + target.width) {
			x = pt.x;
		} else {
			x = view.getRoutingCenterX(target);
		}
		if (!mxUtils.contains(target, x, y) && !mxUtils.contains(source, x, y)) {
			result.push(new mxPoint(x, y));
		}
		if (result.length == 1) {
			if (pt != null && result.length == 1) {
				if (!mxUtils.contains(target, pt.x, y)
						&& !mxUtils.contains(source, pt.x, y)) {
					result.push(new mxPoint(pt.x, y));
				}
			} else {
				var l = Math.max(source.x, target.x);
				var r = Math.min(source.x + source.width, target.x
								+ target.width);
				result.push(new mxPoint(l + (r - l) / 2, y));
			}
		}
	}
};

var mxStyleRegistry = {
	values : new Array(),
	putValue : function(name, obj) {
		mxStyleRegistry.values[name] = obj;
	},
	getValue : function(name) {
		return mxStyleRegistry.values[name];
	},
	getName : function(value) {
		for (var key in mxStyleRegistry.values) {
			if (mxStyleRegistry.values[key] == value) {
				return key;
			}
		}
		return null;
	}
};
mxStyleRegistry.putValue(mxConstants.EDGESTYLE_ELBOW,
		mxEdgeStyle.ElbowConnector);
mxStyleRegistry.putValue(mxConstants.EDGESTYLE_ENTITY_RELATION,
		mxEdgeStyle.EntityRelation);
mxStyleRegistry.putValue(mxConstants.EDGESTYLE_LOOP, mxEdgeStyle.Loop);
mxStyleRegistry.putValue(mxConstants.EDGESTYLE_SIDETOSIDE,
		mxEdgeStyle.SideToSide);
mxStyleRegistry.putValue(mxConstants.EDGESTYLE_TOPTOBOTTOM,
		mxEdgeStyle.TopToBottom);
mxStyleRegistry.putValue(mxConstants.PERIMETER_ELLIPSE,
		mxPerimeter.EllipsePerimeter);
mxStyleRegistry.putValue(mxConstants.PERIMETER_RECTANGLE,
		mxPerimeter.RectanglePerimeter);
mxStyleRegistry.putValue(mxConstants.PERIMETER_RHOMBUS,
		mxPerimeter.RhombusPerimeter);
mxStyleRegistry.putValue(mxConstants.PERIMETER_TRIANGLE,
		mxPerimeter.TrianglePerimeter);

{
	function mxGraphView(graph) {
		this.graph = graph;
		this.translate = new mxPoint();
		this.graphBounds = new mxRectangle();
		this.states = new mxDictionary();
	};
	mxGraphView.prototype = new mxEventSource();
	mxGraphView.prototype.constructor = mxGraphView;
	mxGraphView.prototype.EMPTY_POINT = new mxPoint();
	mxGraphView.prototype.doneResource = (mxClient.language != 'none')
			? 'done'
			: '';
	mxGraphView.prototype.updatingDocumentResource = (mxClient.language != 'none')
			? 'updatingDocument'
			: '';
	mxGraphView.prototype.captureDocumentGesture = true;
	mxGraphView.prototype.rendering = true;
	mxGraphView.prototype.graph = null;
	mxGraphView.prototype.currentRoot = null;
	mxGraphView.prototype.graphBounds = null;
	mxGraphView.prototype.scale = 1;
	mxGraphView.prototype.translate = null;
	mxGraphView.prototype.updateStyle = false;
	mxGraphView.prototype.getGraphBounds = function() {
		return this.graphBounds;
	};
	mxGraphView.prototype.setGraphBounds = function(value) {
		this.graphBounds = value;
	};
	mxGraphView.prototype.getBounds = function(cells) {
		var result = null;
		if (cells != null && cells.length > 0) {
			var model = this.graph.getModel();
			for (var i = 0; i < cells.length; i++) {
				if (model.isVertex(cells[i]) || model.isEdge(cells[i])) {
					var state = this.getState(cells[i]);
					if (state != null) {
						if (result == null) {
							result = new mxRectangle(state.x, state.y,
									state.width, state.height);
						} else {
							result.add(state);
						}
					}
				}
			}
		}
		return result;
	};
	mxGraphView.prototype.setCurrentRoot = function(root) {
		if (this.currentRoot != root) {
			var change = new mxCurrentRootChange(this, root);
			change.execute();
			var edit = new mxUndoableEdit(this, false);
			edit.add(change);
			this.fireEvent(mxEvent.UNDO, new mxEventObject([edit]));
			this.graph.sizeDidChange();
		}
		return root;
	};
	mxGraphView.prototype.scaleAndTranslate = function(scale, dx, dy) {
		var oldScale = this.scale;
		var oldDx = this.translate.x;
		var oldDy = this.translate.y;
		if (this.scale != scale || this.translate.x != dx
				|| this.translate.y != dy) {
			this.scale = scale;
			this.translate.x = dx;
			this.translate.y = dy;
			if (this.isEventsEnabled()) {
				this.revalidate();
				this.graph.sizeDidChange();
			}
		}
		this.fireEvent(mxEvent.SCALE_AND_TRANSLATE, new mxEventObject([
						oldScale, scale, oldDx, oldDy, dx, dy]));
	};
	mxGraphView.prototype.getScale = function() {
		return this.scale;
	};
	mxGraphView.prototype.setScale = function(scale) {
		var oldScale = this.scale;
		if (this.scale != scale) {
			this.scale = scale;
			if (this.isEventsEnabled()) {
				this.revalidate();
				this.graph.sizeDidChange();
			}
		}
		this.fireEvent(mxEvent.SCALE, new mxEventObject([oldScale, scale]));
	};
	mxGraphView.prototype.getTranslate = function() {
		return this.translate;
	};
	mxGraphView.prototype.setTranslate = function(dx, dy) {
		var oldDx = this.translate.x;
		var oldDy = this.translate.y;
		if (this.translate.x != dx || this.translate.y != dy) {
			this.translate.x = dx;
			this.translate.y = dy;
			if (this.isEventsEnabled()) {
				this.revalidate();
				this.graph.sizeDidChange();
			}
		}
		this.fireEvent(mxEvent.TRANSLATE, new mxEventObject([oldDx, oldDy, dx,
						dy]));
	};
	mxGraphView.prototype.refresh = function() {
		if (this.currentRoot != null) {
			this.clear();
		}
		this.revalidate();
	};
	mxGraphView.prototype.revalidate = function() {
		this.invalidate();
		this.validate();
	};
	mxGraphView.prototype.clear = function(cell, force, recurse) {
		var model = this.graph.getModel();
		cell = cell || model.getRoot();
		force = (force != null) ? force : false;
		recurse = (recurse != null) ? recurse : true;
		this.removeState(cell);
		if (recurse && (force || cell != this.currentRoot)) {
			var childCount = model.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				this.clear(model.getChildAt(cell, i), force);
			}
		} else {
			this.invalidate(cell);
		}
	};
	mxGraphView.prototype.invalidate = function(cell, recurse, includeEdges,
			orderChanged) {
		var model = this.graph.getModel();
		cell = cell || model.getRoot();
		recurse = (recurse != null) ? recurse : true;
		includeEdges = (includeEdges != null) ? includeEdges : true;
		orderChanged = (orderChanged != null) ? orderChanged : false;
		var state = this.getState(cell);
		if (state != null) {
			state.invalid = true;
			if (orderChanged) {
				state.orderChanged = true;
			}
		}
		if (recurse) {
			var childCount = model.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				var child = model.getChildAt(cell, i);
				this.invalidate(child, recurse, includeEdges);
			}
		}
		if (includeEdges) {
			var edgeCount = model.getEdgeCount(cell);
			for (var i = 0; i < edgeCount; i++) {
				this.invalidate(model.getEdgeAt(cell, i), recurse, false);
			}
		}
	};
	mxGraphView.prototype.validate = function(cell) {
		var t0 = mxLog.enter('mxGraphView.validate');
		window.status = mxResources.get(this.updatingDocumentResource)
				|| this.updatingDocumentResource;
		cell = cell
				|| ((this.currentRoot != null) ? this.currentRoot : this.graph
						.getModel().getRoot());
		this.validateBounds(null, cell);
		this.setGraphBounds(this.validatePoints(null, cell));
		this.validateBackground();
		window.status = mxResources.get(this.doneResource) || this.doneResource;
		mxLog.leave('mxGraphView.validate', t0);
	};
	mxGraphView.prototype.validateBackground = function() {
		var bg = this.graph.getBackgroundImage();
		if (bg != null) {
			if (this.backgroundImage == null
					|| this.backgroundImage.image != bg.src) {
				if (this.backgroundImage != null) {
					this.backgroundImage.destroy();
				}
				var bounds = new mxRectangle(0, 0, 1, 1);
				this.backgroundImage = new mxImageShape(bounds, bg.src);
				this.backgroundImage.dialect = this.graph.dialect;
				this.backgroundImage.init(this.backgroundPane);
			}
			this.redrawBackgroundImage(this.backgroundImage, bg);
		} else if (this.backgroundImage != null) {
			this.backgroundImage.destroy();
			this.backgroundImage = null;
		}
		if (this.graph.pageVisible) {
			var fmt = this.graph.pageFormat;
			var ps = this.scale * this.graph.pageScale;
			var bounds = new mxRectangle(this.scale * this.translate.x,
					this.scale * this.translate.y, fmt.width * ps, fmt.height
							* ps);
			if (this.backgroundPageShape == null) {
				this.backgroundPageShape = new mxRectangleShape(bounds,
						'white', 'black');
				this.backgroundPageShape.scale = this.scale;
				this.backgroundPageShape.isShadow = true;
				this.backgroundPageShape.dialect = this.graph.dialect;
				this.backgroundPageShape.init(this.backgroundPane);
				var self = this;
				mxEvent.addListener(this.backgroundPageShape.node, 'dblclick',
						function(evt) {
							self.graph.dblClick(evt);
							mxEvent.consume(evt);
						});

				mxEvent.addListener(this.backgroundPageShape.node, 'mousedown',
						function(evt) {
							self.graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
									new mxMouseEvent(evt));
						});
				mxEvent.addListener(this.backgroundPageShape.node, 'mousemove',
						function(evt) {
							if (graph.tooltipHandler != null
									&& graph.tooltipHandler.isHideOnHover()) {
								graph.tooltipHandler.hide();
							}
							if (graph.isMouseDown && !mxEvent.isConsumed(evt)) {
								self.graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
										new mxMouseEvent(evt));
							}
						});
				mxEvent.addListener(this.backgroundPageShape.node, 'mouseup',
						function(evt) {
							self.graph.fireMouseEvent(mxEvent.MOUSE_UP,
									new mxMouseEvent(evt));
						});
			} else {
				this.backgroundPageShape.scale = this.scale;
				this.backgroundPageShape.bounds = bounds;
				this.backgroundPageShape.redraw();
			}
		} else if (this.backgroundPageShape != null) {
			this.backgroundPageShape.destroy();
			this.backgroundPageShape = null;
		}
	};
	mxGraphView.prototype.redrawBackgroundImage = function(backgroundImage, bg) {
		backgroundImage.scale = this.scale;
		backgroundImage.bounds.x = this.scale * this.translate.x;
		backgroundImage.bounds.y = this.scale * this.translate.y;
		backgroundImage.bounds.width = this.scale * bg.width;
		backgroundImage.bounds.height = this.scale * bg.height;
		backgroundImage.redraw();
	};
	mxGraphView.prototype.validateBounds = function(parentState, cell) {
		var model = this.graph.getModel();
		var state = this.getState(cell, true);
		if (state != null && state.invalid) {
			if (!this.graph.isCellVisible(cell)) {
				this.removeState(cell);
			} else if (cell != this.currentRoot && parentState != null) {
				state.origin.x = parentState.origin.x;
				state.origin.y = parentState.origin.y;
				var geo = this.graph.getCellGeometry(cell);
				if (geo != null) {
					if (!model.isEdge(cell)) {
						var offset = geo.offset || this.EMPTY_POINT;
						if (geo.relative) {
							state.origin.x += geo.x * parentState.width
									/ this.scale + offset.x;
							state.origin.y += geo.y * parentState.height
									/ this.scale + offset.y;
						} else {
							state.absoluteOffset.x = this.scale * offset.x;
							state.absoluteOffset.y = this.scale * offset.y;
							state.origin.x += geo.x;
							state.origin.y += geo.y;
						}
					}
					state.x = this.scale * (this.translate.x + state.origin.x);
					state.y = this.scale * (this.translate.y + state.origin.y);
					state.width = this.scale * geo.width;
					state.height = this.scale * geo.height;
					if (model.isVertex(cell)) {
						this.updateVertexLabelOffset(state);
					}
				}
			}
			var offset = this.graph.getChildOffsetForCell(cell);
			if (offset != null) {
				state.origin.x += offset.x;
				state.origin.y += offset.y;
			}
		}
		if (state != null
				&& (!this.graph.isCellCollapsed(cell) || cell == this.currentRoot)) {
			var childCount = model.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				var child = model.getChildAt(cell, i);
				this.validateBounds(state, child);
			}
		}
	};
	mxGraphView.prototype.updateVertexLabelOffset = function(state) {
		var horizontal = mxUtils.getValue(state.style,
				mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
		if (horizontal == mxConstants.ALIGN_LEFT) {
			state.absoluteOffset.x -= state.width;
		} else if (horizontal == mxConstants.ALIGN_RIGHT) {
			state.absoluteOffset.x += state.width;
		}
		var vertical = mxUtils.getValue(state.style,
				mxConstants.STYLE_VERTICAL_LABEL_POSITION,
				mxConstants.ALIGN_MIDDLE);
		if (vertical == mxConstants.ALIGN_TOP) {
			state.absoluteOffset.y -= state.height;
		} else if (vertical == mxConstants.ALIGN_BOTTOM) {
			state.absoluteOffset.y += state.height;
		}
	};
	mxGraphView.prototype.validatePoints = function(parentState, cell) {
		var minX = null;
		var minY = null;
		var maxX = 0;
		var maxY = 0;
		var model = this.graph.getModel();
		var state = this.getState(cell);
		if (state != null) {
			if (state.invalid) {
				var geo = this.graph.getCellGeometry(cell);
				if (model.isEdge(cell)) {
					var source = this.getVisibleTerminal(cell, true);
					if (source != null && !model.isAncestor(source, cell)) {
						var p = model.getParent(source);
						var pstate = this.getState(p);
						this.validatePoints(pstate, source);
					}
					var target = this.getVisibleTerminal(cell, false);
					if (target != null && !model.isAncestor(target, cell)) {
						var p = model.getParent(target);
						var pstate = this.getState(p);
						this.validatePoints(pstate, target);
					}
					this.setTerminalPoints(state);
					this.updatePoints(state, geo.points, source, target);
					this.updateTerminalPoints(state, source, target);
					this.updateEdgeBounds(state);
					this.updateEdgeLabelOffset(state);
				} else if (geo != null && geo.relative && parentState != null
						&& model.isEdge(parentState.cell)) {
					var origin = this.getPoint(parentState, geo);
					if (origin != null) {
						state.x = origin.x;
						state.y = origin.y;
						origin.x = (origin.x / this.scale) - this.translate.x;
						origin.y = (origin.y / this.scale) - this.translate.y;
						state.origin = origin;

						if (!this.graph.isCellCollapsed(cell)
								|| cell == this.currentRoot) {
							var childCount = model.getChildCount(cell);
							for (var i = 0; i < childCount; i++) {
								this.validateBounds(state, model.getChildAt(
												cell, i));
							}
						}
					}
				}
				state.invalid = false;
				if (this.isRendering() && cell != this.currentRoot) {
					this.graph.cellRenderer.redraw(state);
				}
			}
			if (model.isEdge(cell) || model.isVertex(cell)) {
				var box = (state.text != null && (!this.graph.isHtmlLabel(cell) || !this.graph
						.isLabelClipped(cell))) ? state.text.boundingBox : null;
				if (box != null) {
					minX = Math.min(state.x, box.x);
					minY = Math.min(state.y, box.y);
					maxX = Math.max(state.x + state.width, box.x + box.width);
					maxY = Math.max(state.y + state.height, box.y + box.height);
				} else {
					minX = state.x;
					minY = state.y;
					maxX = state.x + state.width;
					maxY = state.y + state.height;
				}
			}
		}
		if (state != null
				&& (!this.graph.isCellCollapsed(cell) || cell == this.currentRoot)) {
			var childCount = model.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				var child = model.getChildAt(cell, i);
				var bounds = this.validatePoints(state, child);
				minX = (minX != null) ? Math.min(minX, bounds.x) : bounds.x;
				minY = (minY != null) ? Math.min(minY, bounds.y) : bounds.y;
				maxX = Math.max(maxX, bounds.x + bounds.width);
				maxY = Math.max(maxY, bounds.y + bounds.height);
			}
		}
		return new mxRectangle(minX, minY, maxX - minX, maxY - minY);
	};
	mxGraphView.prototype.setTerminalPoints = function(state) {
		var tr = this.translate;
		var s = this.scale;
		var edge = state.cell;
		var orig = state.origin;
		var geo = this.graph.getCellGeometry(edge);
		var pt = geo.getTerminalPoint(true);
		if (pt != null) {
			pt = new mxPoint(s * (tr.x + pt.x + orig.x), s
							* (tr.y + pt.y + orig.y));
			state.setAbsoluteTerminalPoint(pt, true);
		} else {
			state.setAbsoluteTerminalPoint(null, true);
		}
		pt = geo.getTerminalPoint(false);
		if (pt != null) {
			pt = new mxPoint(s * (tr.x + pt.x + orig.x), s
							* (tr.y + pt.y + orig.y));
			state.setAbsoluteTerminalPoint(pt, false);
		} else {
			state.setAbsoluteTerminalPoint(null, false);
		}
	};
	mxGraphView.prototype.updatePoints = function(state, points, source, target) {
		if (state != null) {
			var pts = new Array();
			pts.push(state.absolutePoints[0]);
			var edgeStyle = this.getEdgeStyle(state, points, source, target);
			if (edgeStyle != null) {
				var src = this.getState(source);
				var trg = this.getState(target);
				edgeStyle(state, src, trg, points, pts);
			} else if (points != null) {
				for (var i = 0; i < points.length; i++) {
					if (points[i] != null) {
						var pt = mxUtils.clone(points[i]);
						pts.push(this.transformControlPoint(state, pt));
					}
				}
			}
			var tmp = state.absolutePoints;
			pts.push(tmp[tmp.length - 1]);
			state.absolutePoints = pts;
		}
	};
	mxGraphView.prototype.transformControlPoint = function(state, pt) {
		var origin = state.origin;
		return new mxPoint((pt.x + this.translate.x + origin.x) * this.scale,
				(pt.y + this.translate.y + origin.y) * this.scale);
	}
	mxGraphView.prototype.getEdgeStyle = function(edgeState, points, source,
			target) {
		var edgeStyle = (source != null && source == target) ? mxUtils
				.getValue(edgeState.style, mxConstants.STYLE_LOOP,
						this.graph.defaultLoopStyle) : (!mxUtils.getValue(
				edgeState.style, mxConstants.STYLE_NOEDGESTYLE, false)
				? edgeState.style[mxConstants.STYLE_EDGE]
				: null);
		if (typeof(edgeStyle) == "string") {
			var tmp = mxStyleRegistry.getValue(edgeStyle);
			if (tmp == null && edgeStyle.indexOf('.') > 0) {
				tmp = mxUtils.eval(edgeStyle);
			}
			edgeStyle = tmp;
		}
		if (typeof(edgeStyle) == "function") {
			return edgeStyle;
		}
		return null;
	};
	mxGraphView.prototype.updateTerminalPoints = function(state, source, target) {
		if (target != null) {
			this.updateTerminalPoint(state, target, source, false);
		}
		if (source != null) {
			this.updateTerminalPoint(state, source, target, true);
		}
	};
	mxGraphView.prototype.updateTerminalPoint = function(state, start, end,
			isSource) {
		var pt = this.getPerimeterPoint(state, start, end, isSource);
		state.setAbsoluteTerminalPoint(pt, isSource);
	};
	mxGraphView.prototype.getPerimeterPoint = function(state, start, end,
			isSource) {
		var point = null;
		var term = this.getState(start);
		if (term != null) {
			var perimeter = this.getPerimeterFunction(term);
			var next = this.getNextPoint(state, end, isSource);
			if (perimeter != null && next != null) {
				var bounds = this.getPerimeterBounds(term, state, isSource);
				if (bounds.width > 0 || bounds.height > 0) {
					point = perimeter(bounds, state, term, isSource, next);
				}
			}
			if (point == null) {
				point = this.getPoint(term);
			}
		}
		return point;
	};
	mxGraphView.prototype.getRoutingCenterX = function(state) {
		var f = (state.style != null)
				? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_X])
						|| 0
				: 0;
		return state.getCenterX() + f * state.width;
	};
	mxGraphView.prototype.getRoutingCenterY = function(state) {
		var f = (state.style != null)
				? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_Y])
						|| 0
				: 0;
		return state.getCenterY() + f * state.height;
	};
	mxGraphView.prototype.getPerimeterBounds = function(terminal, edge,
			isSource) {
		var border = 0;
		if (edge != null) {
			border = parseFloat(edge.style[mxConstants.STYLE_PERIMETER_SPACING]
					|| 0)
			border += parseFloat(edge.style[(isSource)
					? mxConstants.STYLE_SOURCE_PERIMETER_SPACING
					: mxConstants.STYLE_TARGET_PERIMETER_SPACING]
					|| 0);
		}
		if (terminal != null) {
			border += parseFloat(terminal.style[mxConstants.STYLE_PERIMETER_SPACING]
					|| 0);
		}
		return terminal.getPerimeterBounds(border * this.scale);
	};
	mxGraphView.prototype.getPerimeterFunction = function(state) {
		var perimeter = state.style[mxConstants.STYLE_PERIMETER];
		if (typeof(perimeter) == "string") {
			var tmp = mxStyleRegistry.getValue(perimeter);
			if (tmp == null && perimeter.indexOf('.') > 0) {
				tmp = mxUtils.eval(perimeter);
			}
			perimeter = tmp;
		}
		if (typeof(perimeter) == "function") {
			return perimeter;
		}
		return null;
	};
	mxGraphView.prototype.getNextPoint = function(state, opposite, isSource) {
		var point = null;
		var pts = state.absolutePoints;
		if (pts != null && (isSource || pts.length > 2 || opposite == null)) {
			var count = pts.length;
			point = pts[(isSource) ? Math.min(1, count - 1) : Math.max(0, count
							- 2)];
		}
		if (point == null && opposite != null) {
			var oppositeState = this.getState(opposite);
			if (oppositeState != null) {
				point = new mxPoint(oppositeState.getCenterX(), oppositeState
								.getCenterY());
			}
		}
		return point;
	};
	mxGraphView.prototype.getVisibleTerminal = function(edge, isSource) {
		var model = this.graph.getModel();
		var result = model.getTerminal(edge, isSource);
		var best = result;
		while (result != null && result != this.currentRoot) {
			if (!this.graph.isCellVisible(best)
					|| this.graph.isCellCollapsed(result)) {
				best = result;
			}
			result = model.getParent(result);
		}
		return best;
	};
	mxGraphView.prototype.updateEdgeBounds = function(state) {
		var points = state.absolutePoints;
		state.length = 0;
		if (points != null && points.length > 0) {
			var p0 = points[0];
			var pe = points[points.length - 1];
			if (p0 == null || pe == null) {

				this.clear(state.cell, true);
			} else {
				if (p0.x != pe.x || p0.y != pe.y) {
					var dx = pe.x - p0.x;
					var dy = pe.y - p0.y;
					state.terminalDistance = Math.sqrt(dx * dx + dy * dy);
				} else {
					state.terminalDistance = 0;
				}
				var length = 0;
				var segments = new Array();
				var pt = p0;
				if (pt != null) {
					var minX = pt.x;
					var minY = pt.y;
					var maxX = minX;
					var maxY = minY;
					for (var i = 1; i < points.length; i++) {
						var tmp = points[i];
						if (tmp != null) {
							var dx = pt.x - tmp.x;
							var dy = pt.y - tmp.y;
							var segment = Math.sqrt(dx * dx + dy * dy);
							segments.push(segment);
							length += segment;
							pt = tmp;
							minX = Math.min(pt.x, minX);
							minY = Math.min(pt.y, minY);
							maxX = Math.max(pt.x, maxX);
							maxY = Math.max(pt.y, maxY);
						}
					}
					state.length = length;
					state.segments = segments;
					var markerSize = 1;
					state.x = minX;
					state.y = minY;
					state.width = Math.max(markerSize, maxX - minX);
					state.height = Math.max(markerSize, maxY - minY);
				}
			}
		}
	};
	mxGraphView.prototype.getPoint = function(state, geometry) {
		var x = state.getCenterX();
		var y = state.getCenterY();
		if (state.segments != null && (geometry == null || geometry.relative)) {
			var gx = (geometry != null) ? geometry.x / 2 : 0;
			var pointCount = state.absolutePoints.length;
			var dist = (gx + 0.5) * state.length;
			var segment = state.segments[0];
			var length = 0;
			var index = 1;
			while (dist > length + segment && index < pointCount - 1) {
				length += segment;
				segment = state.segments[index++];
			}
			if (segment != 0) {
				var factor = (dist - length) / segment;
				var p0 = state.absolutePoints[index - 1];
				var pe = state.absolutePoints[index];
				if (p0 != null && pe != null) {
					var gy = 0;
					var offsetX = 0;
					var offsetY = 0;
					if (geometry != null) {
						gy = geometry.y;
						var offset = geometry.offset;
						if (offset != null) {
							offsetX = offset.x;
							offsetY = offset.y;
						}
					}
					var dx = pe.x - p0.x;
					var dy = pe.y - p0.y;
					var nx = dy / segment;
					var ny = dx / segment;
					x = p0.x + dx * factor + (nx * gy + offsetX) * this.scale;
					y = p0.y + dy * factor - (ny * gy - offsetY) * this.scale;
				}
			}
		} else if (geometry != null) {
			var offset = geometry.offset;
			if (offset != null) {
				x += offset.x;
				y += offset.y;
			}
		}
		return new mxPoint(x, y);
	};
	mxGraphView.prototype.getRelativePoint = function(edgeState, x, y) {
		var model = this.graph.getModel();
		var geometry = model.getGeometry(edgeState.cell);
		if (geometry != null) {
			var pointCount = edgeState.absolutePoints.length;
			if (geometry.relative && pointCount > 1) {
				var totalLength = edgeState.length;
				var segments = edgeState.segments;
				var p0 = edgeState.absolutePoints[0];
				var pe = edgeState.absolutePoints[1];
				var minDist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
				var index = 0;
				var tmp = 0;
				var length = 0;
				for (var i = 2; i < pointCount; i++) {
					tmp += segments[i - 2];
					pe = edgeState.absolutePoints[i];
					var dist = mxUtils
							.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
					if (dist <= minDist) {
						minDist = dist;
						index = i - 1;
						length = tmp;
					}
					p0 = pe;
				}
				var seg = segments[index];
				p0 = edgeState.absolutePoints[index];
				pe = edgeState.absolutePoints[index + 1];
				var x2 = p0.x;
				var y2 = p0.y;
				var x1 = pe.x;
				var y1 = pe.y;
				var px = x;
				var py = y;
				var xSegment = x2 - x1;
				var ySegment = y2 - y1;
				px -= x1;
				py -= y1;
				var projlenSq = 0;
				px = xSegment - px;
				py = ySegment - py;
				var dotprod = px * xSegment + py * ySegment;
				if (dotprod <= 0.0) {
					projlenSq = 0;
				} else {
					projlenSq = dotprod * dotprod
							/ (xSegment * xSegment + ySegment * ySegment);
				}
				var projlen = Math.sqrt(projlenSq);
				if (projlen > seg) {
					projlen = seg;
				}
				var yDistance = Math.sqrt(mxUtils.ptSegDistSq(p0.x, p0.y, pe.x,
						pe.y, x, y));
				var direction = mxUtils.relativeCcw(p0.x, p0.y, pe.x, pe.y, x,
						y);
				if (direction == -1) {
					yDistance = -yDistance;
				}
				return new mxPoint(
						((totalLength / 2 - length - projlen) / totalLength)
								* -2, yDistance / this.scale);
			}
		}
		return new mxPoint();
	};
	mxGraphView.prototype.updateEdgeLabelOffset = function(state) {
		var points = state.absolutePoints;
		state.absoluteOffset.x = state.getCenterX();
		state.absoluteOffset.y = state.getCenterY();
		if (points != null && points.length > 0 && state.segments != null) {
			var geometry = this.graph.getCellGeometry(state.cell);
			if (geometry.relative) {
				var offset = this.getPoint(state, geometry);
				if (offset != null) {
					state.absoluteOffset = offset;
				}
			} else {
				var p0 = points[0];
				var pe = points[points.length - 1];
				if (p0 != null && pe != null) {
					var dx = pe.x - p0.x;
					var dy = pe.y - p0.y;
					var x0 = 0;
					var y0 = 0;
					var off = geometry.offset;
					if (off != null) {
						x0 = off.x;
						y0 = off.y;
					}
					var x = p0.x + dx / 2 + x0 * this.scale;
					var y = p0.y + dy / 2 + y0 * this.scale;
					state.absoluteOffset.x = x;
					state.absoluteOffset.y = y;
				}
			}
		}
	};
	mxGraphView.prototype.getState = function(cell, create) {
		create = create || false;
		var state = null;
		if (cell != null) {
			state = this.states.get(cell);
			if (this.graph.isCellVisible(cell)) {
				if (state == null && create && this.graph.isCellVisible(cell)) {
					state = this.createState(cell);
					this.states.put(cell, state);
				} else if (create && state != null && this.updateStyle) {
					state.style = this.graph.getCellStyle(cell);
				}
			}
		}
		return state;
	};
	mxGraphView.prototype.isRendering = function() {
		return this.rendering;
	};
	mxGraphView.prototype.setRendering = function(value) {
		this.rendering = value;
	};
	mxGraphView.prototype.getStates = function() {
		return this.states;
	};
	mxGraphView.prototype.setStates = function(value) {
		this.states = value;
	};
	mxGraphView.prototype.getCellStates = function(cells) {
		if (cells == null) {
			return this.states;
		} else {
			var result = new Array();
			for (var i = 0; i < cells.length; i++) {
				var state = this.getState(cells[i]);
				if (state != null) {
					result.push(state);
				}
			}
			return result;
		}
	};
	mxGraphView.prototype.removeState = function(cell) {
		var state = null;
		if (cell != null) {
			state = this.states.remove(cell);
			if (state != null) {
				this.graph.cellRenderer.destroy(state);
				state.destroy();
			}
		}
		return state;
	};
	mxGraphView.prototype.createState = function(cell) {
		var style = this.graph.getCellStyle(cell);
		var state = new mxCellState(this, cell, style);
		if (this.isRendering()) {
			this.graph.cellRenderer.initialize(state);
		}
		return state;
	};
	mxGraphView.prototype.getCanvas = function() {
		return this.canvas;
	};
	mxGraphView.prototype.getBackgroundPane = function() {
		return this.backgroundPane;
	};
	mxGraphView.prototype.getDrawPane = function() {
		return this.drawPane;
	};
	mxGraphView.prototype.getOverlayPane = function() {
		return this.overlayPane;
	};
	mxGraphView.prototype.isContainerEvent = function(evt) {
		var source = mxEvent.getSource(evt);
		var bgNode = (this.backgroundImage != null)
				? this.backgroundImage.node
				: null;
		return (source == this.graph.container || source.parentNode == bgNode
				|| source == this.canvas.parentNode || source == this.canvas
				|| source == this.backgroundPane || source == this.drawPane || source == this.overlayPane);
	};
	mxGraphView.prototype.isScrollEvent = function(evt) {
		var offset = mxUtils.getOffset(this.graph.container);
		var pt = new mxPoint(evt.clientX - offset.x, evt.clientY - offset.y);
		var outWidth = this.graph.container.offsetWidth;
		var inWidth = this.graph.container.clientWidth;
		if (outWidth > inWidth && pt.x > inWidth + 2 && pt.x <= outWidth) {
			return true;
		}
		var outHeight = this.graph.container.offsetHeight;
		var inHeight = this.graph.container.clientHeight;
		if (outHeight > inHeight && pt.y > inHeight + 2 && pt.y <= outHeight) {
			return true;
		}
		return false;
	};
	mxGraphView.prototype.init = function() {
		var graph = this.graph;
		var container = graph.container;
		if (container != null) {
			var self = this;
			mxEvent.addListener(container, 'mousedown', function(evt) {

						if (self.isContainerEvent(evt)
								&& ((!true && !false && !false && !false) || !self
										.isScrollEvent(evt))) {
							graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
									new mxMouseEvent(evt));
						}
					});
			mxEvent.addListener(container, 'mousemove', function(evt) {
						if (self.isContainerEvent(evt)) {
							graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
									new mxMouseEvent(evt));
						}
					});
			mxEvent.addListener(container, 'mouseup', function(evt) {
						if (self.isContainerEvent(evt)) {
							graph.fireMouseEvent(mxEvent.MOUSE_UP,
									new mxMouseEvent(evt));
						}
					});
			mxEvent.addListener(container, 'dblclick', function(evt) {
						graph.dblClick(evt);
						mxEvent.consume(evt);
					});

			mxEvent.addListener(document, 'mousedown', function(evt) {
						if (self.isContainerEvent(evt)) {
							graph.panningHandler.hideMenu();
						}
					});
			mxEvent.addListener(document, 'mousemove', function(evt) {
						if (graph.tooltipHandler != null
								&& graph.tooltipHandler.isHideOnHover()) {
							graph.tooltipHandler.hide();
						}
						if (self.captureDocumentGesture && graph.isMouseDown
								&& !mxEvent.isConsumed(evt)) {
							graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
									new mxMouseEvent(evt));
						}
					});
			mxEvent.addListener(document, 'mouseup', function(evt) {
						if (self.captureDocumentGesture) {
							graph.fireMouseEvent(mxEvent.MOUSE_UP,
									new mxMouseEvent(evt));
						}
					});
		}
		if (graph.dialect == mxConstants.DIALECT_SVG) {
			this.createSvg();
		} else if (graph.dialect == mxConstants.DIALECT_VML) {
			this.createVml();
		} else {
			this.createHtml();
		}
	};
	mxGraphView.prototype.createHtml = function() {
		var container = this.graph.container;
		if (container != null) {
			this.canvas = this.createHtmlPane();

			this.backgroundPane = this.createHtmlPane(1, 1);
			this.drawPane = this.createHtmlPane(1, 1);
			this.overlayPane = this.createHtmlPane(1, 1);
			this.canvas.appendChild(this.backgroundPane);
			this.canvas.appendChild(this.drawPane);
			this.canvas.appendChild(this.overlayPane);
			container.appendChild(this.canvas);
		}
	};
	mxGraphView.prototype.createHtmlPane = function(width, height) {
		var pane = document.createElement('DIV');
		if (width != null && height != null) {
			pane.style.position = 'absolute';
			pane.style.left = '0px';
			pane.style.top = '0px';
			pane.style.width = width + 'px';
			pane.style.height = height + 'px';
		} else {
			pane.style.position = 'relative';
		}
		return pane;
	};
	mxGraphView.prototype.createVml = function() {
		var container = this.graph.container;
		if (container != null) {
			var width = container.offsetWidth;
			var height = container.offsetHeight;
			this.canvas = this.createVmlPane(width, height);
			this.backgroundPane = this.createVmlPane(width, height);
			this.drawPane = this.createVmlPane(width, height);
			this.overlayPane = this.createVmlPane(width, height);
			this.canvas.appendChild(this.backgroundPane);
			this.canvas.appendChild(this.drawPane);
			this.canvas.appendChild(this.overlayPane);
			container.appendChild(this.canvas);
		}
	};
	mxGraphView.prototype.createVmlPane = function(width, height) {
		var pane = document.createElement('vml:group');

		pane.style.position = 'absolute';
		pane.style.left = '0px';
		pane.style.top = '0px';
		pane.style.width = width + 'px';
		pane.style.height = height + 'px';
		pane.setAttribute('coordsize', width + ',' + height);
		pane.setAttribute('coordorigin', '0,0');
		return pane;
	};
	mxGraphView.prototype.createSvg = function() {
		var container = this.graph.container;
		this.canvas = document.createElementNS(mxConstants.NS_SVG, 'g');
		this.backgroundPane = document.createElementNS(mxConstants.NS_SVG, 'g');
		this.canvas.appendChild(this.backgroundPane);
		this.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
		this.canvas.appendChild(this.drawPane);
		this.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
		this.canvas.appendChild(this.overlayPane);
		var root = document.createElementNS(mxConstants.NS_SVG, 'svg');

		var self = this;
		var onResize = function(evt) {
			if (self.graph.container != null) {
				var width = self.graph.container.offsetWidth;
				var height = self.graph.container.offsetHeight;
				var bounds = self.getGraphBounds();
				root.setAttribute('width', Math.max(width, bounds.width));
				root.setAttribute('height', Math.max(height, bounds.height));
			}
		};
		mxEvent.addListener(window, 'resize', onResize);
		if(!mxClient.IS_IE) {
			onResize();
		}
		root.appendChild(this.canvas);
		if (container != null) {
			container.appendChild(root);
			var style = mxUtils.getCurrentStyle(container);
			if (style.position == 'static') {
				container.style.position = 'relative';
			}
		}
	};
	mxGraphView.prototype.destroy = function() {
		var root = (this.canvas != null) ? this.canvas.ownerSVGElement : null;
		if (root == null) {
			root = this.canvas;
		}
		if (root != null && root.parentNode != null) {
			this.clear(this.currentRoot, true);
			mxEvent.removeAllListeners(document);
			mxEvent.release(this.graph.container);
			root.parentNode.removeChild(root);
			this.canvas = null;
			this.backgroundPane = null;
			this.drawPane = null;
			this.overlayPane = null;
		}
	};
	function mxCurrentRootChange(view, root) {
		this.view = view;
		this.root = root;
		this.previous = root;
		this.isUp = root == null;
		if (!this.isUp) {
			var tmp = this.view.currentRoot;
			var model = this.view.graph.getModel();
			while (tmp != null) {
				if (tmp == root) {
					this.isUp = true;
					break;
				}
				tmp = model.getParent(tmp);
			}
		}
	};
	mxCurrentRootChange.prototype.execute = function() {
		var tmp = this.view.currentRoot;
		this.view.currentRoot = this.previous;
		this.previous = tmp;
		var translate = this.view.graph
				.getTranslateForRoot(this.view.currentRoot);
		if (translate != null) {
			this.view.translate = new mxPoint(-translate.x, -translate.y);
		}
		var name = (this.isUp) ? mxEvent.UP : mxEvent.DOWN;
		this.view.fireEvent(name, new mxEventObject([this.previous,
						this.view.currentRoot]));
		if (this.isUp) {
			this.view.clear(this.view.currentRoot, true);
			this.view.validate();
		} else {
			this.view.refresh();
		}
		this.isUp = !this.isUp;
	};
}

{
	function mxGraph(container, model, renderHint) {
		this.renderHint = renderHint;
		if(!mxClient.IS_IE) {
			this.dialect = mxConstants.DIALECT_SVG;
		} else if (renderHint == mxConstants.RENDERING_HINT_EXACT && true) {
			this.dialect = mxConstants.DIALECT_VML;
		} else if (renderHint == mxConstants.RENDERING_HINT_FASTEST) {
			this.dialect = mxConstants.DIALECT_STRICTHTML;
		} else if (renderHint == mxConstants.RENDERING_HINT_FASTER) {
			this.dialect = mxConstants.DIALECT_PREFERHTML;
		} else {
			this.dialect = mxConstants.DIALECT_MIXEDHTML;
		}
		this.model = (model != null) ? model : new mxGraphModel();
		this.multiplicities = new Array();
		this.cellRenderer = this.createCellRenderer();
		this.setSelectionModel(this.createSelectionModel());
		this.setStylesheet(this.createStylesheet());
		this.view = this.createGraphView();
		var self = this;
		this.model.addListener(mxEvent.CHANGE, function(sender, evt) {
					self.graphModelChanged(evt.getArgAt(0));
				});
		this.tooltipHandler = new mxTooltipHandler(this);
		this.tooltipHandler.setEnabled(false);
		this.panningHandler = new mxPanningHandler(this);
		this.panningHandler.panningEnabled = false;
		this.connectionHandler = new mxConnectionHandler(this);
		this.connectionHandler.setEnabled(false);
		this.graphHandler = new mxGraphHandler(this);
		if (container != null) {
			this.init(container);
		}
		this.view.revalidate();
	};
	mxResources.add(mxClient.basePath + 'js/resources/graph');
	mxGraph.prototype = new mxEventSource();
	mxGraph.prototype.constructor = mxGraph;
	mxGraph.prototype.EMPTY_ARRAY = new Array();

	mxGraph.prototype.mouseListeners = null;
	mxGraph.prototype.model = null;
	mxGraph.prototype.view = null;
	mxGraph.prototype.stylesheet = null;
	mxGraph.prototype.selectionModel = null;
	mxGraph.prototype.cellEditor = null;
	mxGraph.prototype.cellRenderer = null;
	mxGraph.prototype.multiplicities = null;
	mxGraph.prototype.renderHint = null;
	mxGraph.prototype.dialect = null;
	mxGraph.prototype.gridSize = 10;
	mxGraph.prototype.gridEnabled = true;
	mxGraph.prototype.tolerance = 4;
	mxGraph.prototype.defaultOverlap = 0.5;
	mxGraph.prototype.defaultParent = null;
	mxGraph.prototype.alternateEdgeStyle = null;
	mxGraph.prototype.backgroundImage = null;
	mxGraph.prototype.pageVisible = false;
	mxGraph.prototype.pageFormat = mxConstants.PAGE_FORMAT_A4_PORTRAIT;
	mxGraph.prototype.pageScale = 1.5;
	mxGraph.prototype.enabled = true;
	mxGraph.prototype.escapeEnabled = true;
	mxGraph.prototype.invokesStopCellEditing = true;
	mxGraph.prototype.enterStopsCellEditing = false;
	mxGraph.prototype.exportEnabled = true;
	mxGraph.prototype.importEnabled = true;
	mxGraph.prototype.cellsLocked = false;
	mxGraph.prototype.cellsCloneable = true;
	mxGraph.prototype.foldingEnabled = true;
	mxGraph.prototype.cellsEditable = true;
	mxGraph.prototype.cellsDeletable = true;
	mxGraph.prototype.cellsMovable = true;
	mxGraph.prototype.edgeLabelsMovable = true;
	mxGraph.prototype.vertexLabelsMovable = false;
	mxGraph.prototype.dropEnabled = false;
	mxGraph.prototype.splitEnabled = true;
	mxGraph.prototype.cellsResizable = true;
	mxGraph.prototype.cellsBendable = true;
	mxGraph.prototype.cellsSelectable = true;
	mxGraph.prototype.cellsDisconnectable = true;
	mxGraph.prototype.autoSizeCells = false;
	mxGraph.prototype.autoScroll = true;
	mxGraph.prototype.autoExtend = true;
	mxGraph.prototype.maximumGraphBounds = null;
	mxGraph.prototype.minimumGraphSize = null;
	mxGraph.prototype.minimumContainerSize = null;
	mxGraph.prototype.maximumContainerSize = null;
	mxGraph.prototype.resizeContainer = false;
	mxGraph.prototype.border = 0;
	mxGraph.prototype.ordered = true;
	mxGraph.prototype.keepEdgesInForeground = false;
	mxGraph.prototype.keepEdgesInBackground = true;
	mxGraph.prototype.constrainChildren = true;
	mxGraph.prototype.extendParents = true;
	mxGraph.prototype.extendParentsOnAdd = true;
	mxGraph.prototype.collapseToPreferredSize = true;
	mxGraph.prototype.zoomFactor = 1.2;
	mxGraph.prototype.keepSelectionVisibleOnZoom = false;
	mxGraph.prototype.centerZoom = true;
	mxGraph.prototype.resetViewOnRootChange = true;
	mxGraph.prototype.resetEdgesOnResize = false;
	mxGraph.prototype.resetEdgesOnMove = false;
	mxGraph.prototype.resetEdgesOnConnect = true;
	mxGraph.prototype.allowLoops = false;
	mxGraph.prototype.defaultLoopStyle = mxEdgeStyle.Loop;
	mxGraph.prototype.multigraph = true;
	mxGraph.prototype.connectableEdges = false;
	mxGraph.prototype.allowDanglingEdges = true;
	mxGraph.prototype.cloneInvalidEdges = false;
	mxGraph.prototype.disconnectOnMove = true;
	mxGraph.prototype.labelsVisible = true;
	mxGraph.prototype.htmlLabels = false;
	mxGraph.prototype.swimlaneSelectionEnabled = true;
	mxGraph.prototype.swimlaneNesting = true;
	mxGraph.prototype.swimlaneIndicatorColorAttribute = mxConstants.STYLE_FILLCOLOR;
	mxGraph.prototype.collapsedImage = new mxImage(mxClient.imageBasePath
					+ 'collapsed.gif', 9, 9);
	mxGraph.prototype.expandedImage = new mxImage(mxClient.imageBasePath
					+ 'expanded.gif', 9, 9);
	mxGraph.prototype.warningImage = new mxImage(mxClient.imageBasePath
					+ 'warning' + ((mxClient.IS_MAC) ? '.png' : '.gif'), 16, 16);
	mxGraph.prototype.alreadyConnectedResource = (mxClient.language != 'none')
			? 'alreadyConnected'
			: '';
	mxGraph.prototype.containsValidationErrorsResource = (mxClient.language != 'none')
			? 'containsValidationErrors'
			: '';
	mxGraph.prototype.init = function(container) {
		this.container = container;
		this.cellEditor = this.createCellEditor();
		this.view.init();
		this.tooltipHandler.init();
		this.panningHandler.init();
		this.connectionHandler.init();
		this.sizeDidChange();
		if(mxClient.IS_IE) {
			var self = this;
			mxEvent.addListener(window, 'unload', function() {
						self.destroy();
					});
			mxEvent.addListener(container, 'selectstart', function() {
						return self.isEditing();
					});
		} else {

			var self = this;
			this.focusHandler = function(evt) {
				self.activeElement = mxEvent.getSource(evt);
			};
			this.blurHandler = function(evt) {
				self.activeElement = null;
			}
			mxEvent.addListener(document.body, 'focus', this.focusHandler);
			mxEvent.addListener(document.body, 'blur', this.blurHandler);
		}
	};
	mxGraph.prototype.createSelectionModel = function() {
		return new mxGraphSelectionModel(this);
	};
	mxGraph.prototype.createStylesheet = function() {
		return new mxStylesheet();
	};
	mxGraph.prototype.createGraphView = function() {
		return new mxGraphView(this);
	};
	mxGraph.prototype.createCellRenderer = function() {
		return new mxCellRenderer();
	};
	mxGraph.prototype.createCellEditor = function() {
		return new mxCellEditor(this);
	};
	mxGraph.prototype.getModel = function() {
		return this.model;
	};
	mxGraph.prototype.getView = function() {
		return this.view;
	};
	mxGraph.prototype.getStylesheet = function() {
		return this.stylesheet;
	};
	mxGraph.prototype.setStylesheet = function(stylesheet) {
		this.stylesheet = stylesheet;
	};
	mxGraph.prototype.getSelectionModel = function() {
		return this.selectionModel;
	};
	mxGraph.prototype.setSelectionModel = function(selectionModel) {
		this.selectionModel = selectionModel;
	};
	mxGraph.prototype.getSelectionCellsForChanges = function(changes) {
		var cells = new Array();
		for (var i = 0; i < changes.length; i++) {
			var change = changes[i];
			if (change.constructor != mxRootChange) {
				var cell = null;
				if (change.constructor == mxChildChange && change.isAdded) {
					cell = change.child;
				} else if (change.cell != null
						&& change.cell.constructor == mxCell) {
					cell = change.cell;
				}
				if (cell != null && mxUtils.indexOf(cells, cell) < 0) {
					cells.push(cell);
				}
			}
		}
		return this.getModel().getTopmostCells(cells);
	};
	mxGraph.prototype.graphModelChanged = function(changes) {
		for (var i = 0; i < changes.length; i++) {
			this.processChange(changes[i]);
		}
		this.removeSelectionCells(this.getRemovedCellsForChanges(changes));
		this.view.validate();
		this.sizeDidChange();
	};
	mxGraph.prototype.getRemovedCellsForChanges = function(changes) {
		var result = new Array();
		for (var i = 0; i < changes.length; i++) {
			var change = changes[i];

			if (change.constructor == mxRootChange) {
				break;
			} else if (change.constructor == mxChildChange) {
				if (!change.isAdded) {
					result = result.concat(this.model
							.getDescendants(change.child));
				}
			} else if (change.constructor == mxVisibleChange) {
				result = result.concat(this.model.getDescendants(change.cell));
			}
		}
		return result;
	};
	mxGraph.prototype.processChange = function(change) {

		if (change.constructor == mxRootChange) {
			this.clearSelection();
			this.removeStateForCell(change.previous);
			if (this.resetViewOnRootChange) {
				this.view.scale = 1;
				this.view.translate.x = 0;
				this.view.translate.y = 0;
			}
			this.fireEvent(mxEvent.ROOT);
		}

		else if (change.constructor == mxChildChange) {
			if (change.isAdded) {
				this.view.invalidate(change.child, true, false, true);
			} else if (newParent == null) {
				this.removeStateForCell(change.child);
			}
			var newParent = this.model.getParent(change.child);
			if (newParent != change.previous) {
				if (newParent != null) {
					this.view.invalidate(newParent, false, false);
				}
				if (change.previous != null) {
					this.view.invalidate(change.previous, false, false);
				}
			}
		}

		else if (change.constructor == mxTerminalChange
				|| change.constructor == mxGeometryChange) {
			this.view.invalidate(change.cell);
		}

		else if (change.constructor == mxValueChange) {
			this.view.invalidate(change.cell, false, false);
		} else if (change.constructor == mxStyleChange) {
			this.view.removeState(change.cell);
		} else if (change.cell != null && change.cell.constructor == mxCell) {
			this.removeStateForCell(change.cell);
		}
	};
	mxGraph.prototype.removeStateForCell = function(cell) {
		var childCount = this.model.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			this.removeStateForCell(this.model.getChildAt(cell, i));
		}
		this.view.removeState(cell);
	};

	mxGraph.prototype.addCellOverlay = function(cell, overlay) {
		if (cell.overlays == null) {
			cell.overlays = new Array();
		}
		cell.overlays.push(overlay);
		var state = this.view.getState(cell);
		if (state != null) {
			this.cellRenderer.redraw(state);
		}
		this.fireEvent(mxEvent.ADD_OVERLAY, new mxEventObject([cell, overlay]));
		return overlay;
	};
	mxGraph.prototype.getCellOverlays = function(cell) {
		return cell.overlays;
	};
	mxGraph.prototype.removeCellOverlay = function(cell, overlay) {
		if (overlay == null) {
			this.removeCellOverlays(cell);
		} else {
			var index = mxUtils.indexOf(cell.overlays, overlay);
			if (index >= 0) {
				cell.overlays.splice(index, 1);
				if (cell.overlays.length == 0) {
					cell.overlays = null;
				}
				var state = this.view.getState(cell);
				if (state != null) {
					this.cellRenderer.redraw(state);
				}
				this.fireEvent(mxEvent.REMOVE_OVERLAY, new mxEventObject([cell,
								overlay]));
			} else {
				overlay = null;
			}
		}
		return overlay;
	};
	mxGraph.prototype.removeCellOverlays = function(cell) {
		var overlays = cell.overlays;
		if (overlays != null) {
			cell.overlays = null;
			var state = this.view.getState(cell);
			if (state != null) {
				this.cellRenderer.redraw(state);
			}
			for (var i = 0; i < overlays.length; i++) {
				this.fireEvent(mxEvent.REMOVE_OVERLAY, new mxEventObject([cell,
								overlays[i]]));
			}
		}
		return overlays;
	};
	mxGraph.prototype.clearCellOverlays = function(cell) {
		cell = (cell != null) ? cell : this.model.getRoot();
		this.removeCellOverlays(cell);
		var childCount = this.model.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			var child = this.model.getChildAt(cell, i);
			this.clearCellOverlays(child);
		}
	};
	mxGraph.prototype.setCellWarning = function(cell, warning, img, isSelect) {
		if (warning != null && warning.length > 0) {
			img = (img != null) ? img : this.warningImage;
			var overlay = new mxCellOverlay(img, '<font color=red>' + warning
							+ '</font>');
			if (isSelect) {
				var self = this;
				overlay.addListener(mxEvent.CLICK, function(sender, evt) {
							if (self.isEnabled()) {
								self.setSelectionCell(cell);
							}
						});
			}
			return this.addCellOverlay(cell, overlay);
		} else {
			this.removeCellOverlays(cell);
		}
		return null;
	};

	mxGraph.prototype.startEditing = function() {
		this.startEditingAtCell();
	};
	mxGraph.prototype.startEditingAtCell = function(cell, trigger) {
		if (cell == null) {
			cell = this.getSelectionCell();
			if (cell != null && !this.isCellEditable(cell)) {
				cell = null;
			}
		}
		if (cell != null) {
			this.fireEvent(mxEvent.START_EDITING, new mxEventObject([cell,
							trigger]));
			this.cellEditor.startEditing(cell, trigger);
		}
	};
	mxGraph.prototype.getEditingValue = function(cell, trigger) {
		return this.convertValueToString(cell);
	};
	mxGraph.prototype.stopEditing = function(cancel) {
		// jiang modify 20100423
		if(this.cellEditor)this.cellEditor.stopEditing(cancel);
	};
	mxGraph.prototype.labelChanged = function(cell, newValue, trigger) {
		this.model.beginUpdate();
		try {
			this.cellLabelChanged(cell, newValue, this.isAutoSizeCell(cell));
			this.fireEvent(mxEvent.LABEL_CHANGED, new mxEventObject([cell,
							newValue, trigger]));
		} finally {
			this.model.endUpdate();
		}
		return cell;
	};
	mxGraph.prototype.cellLabelChanged = function(cell, newValue, autoSize) {
		this.model.beginUpdate();
		try {
			this.model.setValue(cell, newValue);
			if (autoSize) {
				this.cellSizeUpdated(cell, false);
			}
		} finally {
			this.model.endUpdate();
		}
	};

	mxGraph.prototype.escape = function(evt) {
		this.stopEditing(true);
		this.connectionHandler.reset();
		this.graphHandler.reset();
		var cells = this.getSelectionCells();
		for (var i = 0; i < cells.length; i++) {
			var state = this.view.getState(cells[i]);
			if (state != null && state.handler != null) {
				state.handler.reset();
			}
		}
	};
	mxGraph.prototype.click = function(evt, cell) {
		this.fireEvent(mxEvent.CLICK, new mxEventObject([evt, cell]));
		if (this.isEnabled() && !mxEvent.isConsumed(evt)) {
			if (cell != null) {
				this.selectCellForEvent(cell, evt);
			} else {
				var swimlane = null;
				if (this.swimlaneSelectionEnabled) {

					var pt = mxUtils.convertPoint(this.container, evt.clientX,
							evt.clientY);

					swimlane = this.getSwimlaneAt(pt.x, pt.y);
				}
				if (swimlane != null) {
					this.selectCellForEvent(swimlane, evt);
				} else if (!this.isToggleEvent(evt)) {
					this.clearSelection();
				}
			}
		}
	};
	mxGraph.prototype.dblClick = function(evt, cell) {
		this.fireEvent(mxEvent.DOUBLE_CLICK, new mxEventObject([evt, cell]));
		if (this.isEnabled() && !mxEvent.isConsumed(evt) && cell != null
				&& this.isCellEditable(cell)) {
			this.startEditingAtCell(cell, evt);
		}
	};
	mxGraph.prototype.scrollPointToVisible = function(x, y, extend, border) {
		if (mxUtils.hasScrollbars(this.container)) {
			var c = this.container;
			border = (border != null) ? border : 20;
			if (x >= c.scrollLeft && y >= c.scrollTop
					&& x <= c.scrollLeft + c.clientWidth
					&& y <= c.scrollTop + c.clientHeight) {
				var dx = c.scrollLeft + c.clientWidth - x;
				if (dx < border) {
					var old = c.scrollLeft;
					c.scrollLeft += border - dx;

					if (extend && old == c.scrollLeft) {
						if (this.dialect == mxConstants.DIALECT_SVG) {
							var root = this.view.getDrawPane().ownerSVGElement;
							var width = parseInt(root.getAttribute('width'))
									+ border - dx;

							root.setAttribute('width', width);
						} else {
							var width = Math.max(c.clientWidth, c.scrollWidth)
									+ border - dx;
							var canvas = this.view.getCanvas();
							canvas.style.width = width + 'px';
						}
						c.scrollLeft += border - dx;
					}
				} else {
					dx = x - c.scrollLeft;
					if (dx < border) {
						c.scrollLeft -= border - dx;
					}
				}
				var dy = c.scrollTop + c.clientHeight - y;
				if (dy < border) {
					var old = c.scrollTop;
					c.scrollTop += border - dy;
					if (old == c.scrollTop && extend) {
						if (this.dialect == mxConstants.DIALECT_SVG) {
							var root = this.view.getDrawPane().ownerSVGElement;
							var height = parseInt(root.getAttribute('height'))
									+ border - dy;

							root.setAttribute('height', height);
						} else {
							var height = Math.max(c.clientHeight,
									c.scrollHeight)
									+ border - dy;
							var canvas = this.view.getCanvas();
							canvas.style.height = height + 'px';
						}
						c.scrollTop += border - dy;
					}
				} else {
					dy = y - c.scrollTop;
					if (dy < border) {
						c.scrollTop -= border - dy;
					}
				}
			}
		}
	}
	mxGraph.prototype.sizeDidChange = function() {
		var bounds = this.getGraphBounds();
		if (this.container != null) {
			var border = this.getBorder();
			var width = bounds.x + bounds.width + 1 + border;
			var height = bounds.y + bounds.height + 1 + border;
			if (this.minimumContainerSize != null) {
				width = Math.max(width, this.minimumContainerSize.width);
				height = Math.max(height, this.minimumContainerSize.height);
			}
			if (this.resizeContainer) {
				var w = width;
				var h = height;
				if (this.maximumContainerSize != null) {
					w = Math.min(this.maximumContainerSize.width, w);
					h = Math.min(this.maximumContainerSize.height, h);
				}
				this.container.style.width = w + 'px';
				this.container.style.height = h + 'px';
			}
			width = Math.max(width, this.container.offsetWidth);
			height = Math.max(height, this.container.offsetHeight);
			if (this.dialect == mxConstants.DIALECT_SVG) {
				var root = this.view.getDrawPane().ownerSVGElement;
				if (this.minimumGraphSize != null) {
					width = Math.max(width, this.minimumGraphSize.width
									* this.view.scale);
					height = Math.max(height, this.minimumGraphSize.height
									* this.view.scale);
				}

				root.setAttribute('width', width);
				root.setAttribute('height', height);
			} else {
				var drawPane = this.view.getDrawPane();
				var canvas = this.view.getCanvas();
				drawPane.style.width = width + 'px';
				drawPane.style.height = height + 'px';
				canvas.style.width = width + 'px';
				canvas.style.height = height + 'px';

				if (this.minimumGraphSize != null) {
					width = Math.max(width, this.minimumGraphSize.width
									* this.view.scale);
					height = Math.max(height, this.minimumGraphSize.height
									* this.view.scale);
					canvas.style.width = width + 'px';
					canvas.style.height = height + 'px';
				}
			}
		}
		this.fireEvent(mxEvent.SIZE, new mxEventObject([bounds]));
	};

	mxGraph.prototype.getCellStyle = function(cell) {
		var stylename = this.model.getStyle(cell);
		var style = null;
		if (this.model.isEdge(cell)) {
			style = this.stylesheet.getDefaultEdgeStyle();
		} else {
			style = this.stylesheet.getDefaultVertexStyle();
		}
		if (stylename != null) {
			style = this.stylesheet.getCellStyle(stylename, style);
		}
		if (style == null) {
			style = mxGraph.prototype.EMPTY_ARRAY;
		}
		return style;
	};
	mxGraph.prototype.setCellStyle = function(style, cells) {
		cells = cells || this.getSelectionCells();
		if (cells != null) {
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					this.model.setStyle(cells[i], style);
				}
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.toggleCellStyle = function(key, defaultValue, cell) {
		cell = cell || this.getSelectionCell();
		this.toggleCellStyles(key, defaultValue, [cell]);
	};
	mxGraph.prototype.toggleCellStyles = function(key, defaultValue, cells) {
		defaultValue = (defaultValue != null) ? defaultValue : false;
		cells = cells || this.getSelectionCells();
		if (cells != null && cells.length > 0) {
			var state = this.view.getState(cells[0]);
			var style = (state != null) ? state.style : this
					.getCellStyle(cells[0]);
			if (style != null) {
				var val = (mxUtils.getValue(style, key, defaultValue)) ? 0 : 1;
				this.setCellStyles(key, val, cells);
			}
		}
	}
	mxGraph.prototype.setCellStyles = function(key, value, cells) {
		cells = cells || this.getSelectionCells();
		mxUtils.setCellStyles(this.model, cells, key, value);
	};
	mxGraph.prototype.toggleCellStyleFlags = function(key, flag, cells) {
		this.setCellStyleFlags(key, flag, null, cells);
	};
	mxGraph.prototype.setCellStyleFlags = function(key, flag, value, cells) {
		cells = cells || this.getSelectionCells();
		if (cells != null && cells.length > 0) {
			if (value == null) {
				var state = this.view.getState(cells[0]);
				var style = (state != null) ? state.style : this
						.getCellStyle(cells[0]);
				if (style != null) {
					var current = parseInt(style[key] || 0);
					value = !((current & flag) == flag);
				}
			}
			mxUtils.setCellStyleFlags(this.model, cells, key, flag, value);
		}
	};

	mxGraph.prototype.alignCells = function(align, cells, param) {
		if (cells == null) {
			cells = this.getSelectionCells();
		}
		if (cells != null && cells.length > 1) {
			if (param == null) {
				for (var i = 0; i < cells.length; i++) {
					var geo = this.getCellGeometry(cells[i]);
					if (geo != null && !this.model.isEdge(cells[i])) {
						if (param == null) {
							if (align == mxConstants.ALIGN_CENTER) {
								param = geo.x + geo.width / 2;
								break;
							} else if (align == mxConstants.ALIGN_RIGHT) {
								param = geo.x + geo.width;
							} else if (align == mxConstants.ALIGN_TOP) {
								param = geo.y;
							} else if (align == mxConstants.ALIGN_MIDDLE) {
								param = geo.y + geo.height / 2;
								break;
							} else if (align == mxConstants.ALIGN_BOTTOM) {
								param = geo.y + geo.height;
							} else {
								param = geo.x;
							}
						} else {
							if (align == mxConstants.ALIGN_RIGHT) {
								param = Math.max(param, geo.x + geo.width);
							} else if (align == mxConstants.ALIGN_TOP) {
								param = Math.min(param, geo.y);
							} else if (align == mxConstants.ALIGN_BOTTOM) {
								param = Math.max(param, geo.y + geo.height);
							} else {
								param = Math.min(param, geo.x);
							}
						}
					}
				}
			}
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					var geo = this.getCellGeometry(cells[i]);
					if (geo != null && !this.model.isEdge(cells[i])) {
						geo = geo.clone();
						if (align == mxConstants.ALIGN_CENTER) {
							geo.x = param - geo.width / 2;
						} else if (align == mxConstants.ALIGN_RIGHT) {
							geo.x = param - geo.width;
						} else if (align == mxConstants.ALIGN_TOP) {
							geo.y = param;
						} else if (align == mxConstants.ALIGN_MIDDLE) {
							geo.y = param - geo.height / 2;
						} else if (align == mxConstants.ALIGN_BOTTOM) {
							geo.y = param - geo.height;
						} else {
							geo.x = param;
						}
						this.model.setGeometry(cells[i], geo);
					}
				}
				this.fireEvent(mxEvent.ALIGN_CELLS, new mxEventObject([cells]));
			} finally {
				this.model.endUpdate();
			}
		}
		return cells;
	};
	mxGraph.prototype.flipEdge = function(edge) {
		if (edge != null && this.alternateEdgeStyle != null) {
			this.model.beginUpdate();
			try {
				var style = this.model.getStyle(edge);
				if (style == null || style.length == 0) {
					this.model.setStyle(edge, this.alternateEdgeStyle);
				} else {
					this.model.setStyle(edge, null);
				}
				this.resetEdge(edge);
				this.fireEvent(mxEvent.FLIP_EDGE, new mxEventObject([edge]));
			} finally {
				this.model.endUpdate();
			}
		}
		return edge;
	};

	mxGraph.prototype.orderCells = function(back, cells) {
		if (cells == null) {
			cells = mxUtils.sortCells(this.getSelectionCells(), true);
		}
		this.model.beginUpdate();
		try {
			this.cellsOrdered(cells, back);
			this.fireEvent(mxEvent.ORDER_CELLS,
					new mxEventObject([back, cells]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};
	mxGraph.prototype.cellsOrdered = function(cells, back) {
		if (cells != null) {
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					var parent = this.model.getParent(cells[i]);
					if (back) {
						this.model.add(parent, cells[i], i);
					} else {
						this.model.add(parent, cells[i], this.model
										.getChildCount(parent)
										- 1);
					}
				}
				this.fireEvent(mxEvent.CELLS_ORDERED, new mxEventObject([cells,
								back]));
			} finally {
				this.model.endUpdate();
			}
		}
	};

	mxGraph.prototype.groupCells = function(group, border, cells) {
		if (cells == null) {
			cells = mxUtils.sortCells(this.getSelectionCells(), true);
		}
		cells = this.getCellsForGroup(cells);
		var bounds = this.getBoundsForGroup(group, cells, border);
		if (cells.length > 1 && bounds != null) {
			var parent = this.model.getParent(cells[0]);
			this.model.beginUpdate();
			try {
				if (group == null) {
					group = this.createGroupCell(cells);
				}

				if (this.getCellGeometry(group) == null) {
					this.model.setGeometry(group, new mxGeometry());
				}
				var index = this.model.getChildCount(group);
				this.cellsAdded(cells, group, index, null, null, false);
				this.cellsMoved(cells, -bounds.x, -bounds.y, false, true);
				index = this.model.getChildCount(parent);
				this.cellsAdded([group], parent, index, null, null, false);
				this.cellsResized([group], [bounds]);
				this.fireEvent(mxEvent.GROUP_CELLS, new mxEventObject([group,
								border, cells]));
			} finally {
				this.model.endUpdate();
			}
		}
		return group;
	};
	mxGraph.prototype.getCellsForGroup = function(cells) {
		var result = new Array();
		if (cells != null && cells.length > 1) {
			var parent = this.model.getParent(cells[0]);
			result.push(cells[0]);
			for (var i = 1; i < cells.length; i++) {
				if (this.model.getParent(cells[i]) == parent) {
					result.push(cells[i]);
				}
			}
		}
		return result;
	};
	mxGraph.prototype.getBoundsForGroup = function(group, children, border) {
		var bounds = this.view.getBounds(children);
		if (children != null && children.length > 0 && bounds != null) {
			var parent = this.model.getParent(children[0]);
			var pstate = this.view.getState(parent);
			var scale = this.view.getScale();
			var tr = this.view.getTranslate();
			var x = bounds.x - pstate.origin.x * scale;
			var y = bounds.y - pstate.origin.y * scale;
			var width = bounds.width;
			var height = bounds.height;
			if (this.isSwimlane(group)) {
				var size = this.getStartSize(group);
				x -= size.width;
				width += size.width;
				y -= size.height;
				height += size.height;
			}
			bounds = new mxRectangle(x / scale - border - tr.x, y / scale
							- border - tr.y, width / scale + 2 * border, height
							/ scale + 2 * border);
		}
		return bounds;
	};
	mxGraph.prototype.createGroupCell = function(cells) {
		var group = new mxCell('');
		group.setVertex(true);
		group.setConnectable(false);
		return group;
	};
	mxGraph.prototype.ungroupCells = function(cells) {
		var result = new Array();
		if (cells == null) {
			cells = this.getSelectionCells();
		}
		if (cells != null) {
			var tmp = new Array();
			for (var i = 0; i < cells.length; i++) {
				if (this.model.getChildCount(cells[i]) > 0) {
					tmp.push(cells[i]);
				}
			}
			cells = tmp;
			if (cells.length > 0) {
				this.model.beginUpdate();
				try {
					for (var i = 0; i < cells.length; i++) {
						var children = this.model.getChildren(cells[i]);
						if (children != null && children.length > 0) {
							children = children.slice();
							var parent = this.model.getParent(cells[i]);
							var index = this.model.getChildCount(parent);
							this.cellsAdded(children, parent, index, null,
									null, true);
							result = result.concat(children);
						}
					}
					this.cellsRemoved(this.addAllEdges(cells));
					this.fireEvent(mxEvent.UNGROUP_CELLS,
							new mxEventObject([cells]));
				} finally {
					this.model.endUpdate();
				}
			}
		}
		return result;
	};
	mxGraph.prototype.removeCellsFromParent = function(cells) {
		if (cells == null) {
			cells = this.getSelectionCells();
		}
		this.model.beginUpdate();
		try {
			var parent = this.getDefaultParent();
			var index = this.model.getChildCount(parent);
			this.cellsAdded(cells, parent, index, null, null, true);
			this.fireEvent(mxEvent.REMOVE_CELLS_FROM_PARENT,
					new mxEventObject([cells]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};

	mxGraph.prototype.cloneCells = function(cells, allowInvalidEdges) {
		allowInvalidEdges = (allowInvalidEdges != null)
				? allowInvalidEdges
				: true;
		var clones = null;
		if (cells != null) {
			var hash = new Object();
			var tmp = new Array();
			for (var i = 0; i < cells.length; i++) {
				var id = mxCellPath.create(cells[i]);
				hash[id] = cells[i];
				tmp.push(cells[i]);
			}
			if (tmp.length > 0) {
				var scale = this.view.scale;
				var trans = this.view.translate;
				clones = this.model.cloneCells(cells, true);
				for (var i = 0; i < cells.length; i++) {
					if (!allowInvalidEdges
							&& this.model.isEdge(clones[i])
							&& this.getEdgeValidationError(clones[i],
									this.model.getTerminal(clones[i], true),
									this.model.getTerminal(clones[i], false)) != null) {
						clones[i] = null;
					} else {
						var g = this.model.getGeometry(clones[i]);
						if (g != null) {
							var state = this.view.getState(cells[i]);
							var pstate = this.view.getState(this.model
									.getParent(cells[i]));
							if (state != null && pstate != null) {
								var dx = pstate.origin.x;
								var dy = pstate.origin.y;
								if (this.model.isEdge(clones[i])) {
									var pts = state.absolutePoints;
									var src = this.model.getTerminal(cells[i],
											true);
									var srcId = mxCellPath.create(src);
									while (src != null && hash[srcId] == null) {
										src = this.model.getParent(src);
										srcId = mxCellPath.create(src);
									}
									if (src == null) {
										g.setTerminalPoint(new mxPoint(pts[0].x
																/ scale
																- trans.x,
														pts[0].y / scale
																- trans.y),
												true);
									}
									var trg = this.model.getTerminal(cells[i],
											false);
									var trgId = mxCellPath.create(trg);
									while (trg != null && hash[trgId] == null) {
										trg = this.model.getParent(trg);
										trgId = mxCellPath.create(trg);
									}
									if (trg == null) {
										var n = pts.length - 1;
										g.setTerminalPoint(new mxPoint(pts[n].x
																/ scale
																- trans.x,
														pts[n].y / scale
																- trans.y),
												false);
									}
									var points = g.points;
									if (points != null) {
										for (var j = 0; j < points.length; j++) {
											points[j].x += dx;
											points[j].y += dy;
										}
									}
								} else {
									g.x += dx;
									g.y += dy;
								}
							}
						}
					}
				}
			}
		}
		return clones;
	};
	mxGraph.prototype.insertVertex = function(parent, id, value, x, y, width,
			height, style) {
		var vertex = this.createVertex(parent, id, value, x, y, width, height,
				style);
		return this.addCell(vertex, parent);
	};
	mxGraph.prototype.createVertex = function(parent, id, value, x, y, width,
			height, style) {
		var geometry = new mxGeometry(x, y, width, height);
		var vertex = new mxCell(value, geometry, style);
		vertex.setId(id);
		vertex.setVertex(true);
		vertex.setConnectable(true);
		return vertex;
	};
	mxGraph.prototype.insertEdge = function(parent, id, value, source, target,
			style) {
		var edge = this.createEdge(parent, id, value, source, target, style);
		return this.addEdge(edge, parent, source, target);
	};
	mxGraph.prototype.createEdge = function(parent, id, value, source, target,
			style) {
		var edge = new mxCell(value, new mxGeometry(), style);
		edge.setId(id);
		edge.setEdge(true);
		edge.geometry.relative = true;
		return edge;
	};
	mxGraph.prototype.addEdge = function(edge, parent, source, target, index) {
		return this.addCell(edge, parent, index, source, target);
	};
	mxGraph.prototype.addCell = function(cell, parent, index, source, target) {
		return this.addCells([cell], parent, index, source, target)[0];
	};
	mxGraph.prototype.addCells = function(cells, parent, index, source, target) {
		if (parent == null) {
			parent = this.getDefaultParent();
		}
		if (index == null) {
			index = this.model.getChildCount(parent);
		}
		this.model.beginUpdate();
		try {
			this.cellsAdded(cells, parent, index, source, target, false);
			this.fireEvent(mxEvent.ADD_CELLS, new mxEventObject([cells, parent,
							index, source, target]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};
	mxGraph.prototype.cellsAdded = function(cells, parent, index, source,
			target, absolute) {
		if (cells != null && parent != null && index != null) {
			this.model.beginUpdate();
			try {
				var parentState = (absolute)
						? this.view.getState(parent)
						: null;
				var o1 = (parentState != null) ? parentState.origin : null;
				var zero = new mxPoint(0, 0);
				for (var i = 0; i < cells.length; i++) {
					var previous = this.model.getParent(cells[i]);
					if (o1 != null && cells[i] != parent && parent != previous) {
						var oldState = this.view.getState(previous);
						var o2 = (oldState != null) ? oldState.origin : zero;
						var geo = this.model.getGeometry(cells[i]);
						if (geo != null) {
							var dx = o2.x - o1.x;
							var dy = o2.y - o1.y;
							this.model.setGeometry(cells[i], geo.translate(dx,
											dy));
						}
					}

					if (parent == previous) {
						index--;
					}
					this.model.add(parent, cells[i], index + i);
					if (this.isExtendParentsOnAdd()
							&& this.isExtendParent(cells[i])) {
						this.extendParent(cells[i]);
					}
					this.constrainChild(cells[i]);
					if (source != null) {
						this.model.setTerminal(cells[i], source, true);
					}
					if (target != null) {
						this.model.setTerminal(cells[i], target, false);
					}
				}
				this.fireEvent(mxEvent.CELLS_ADDED, new mxEventObject([cells,
								parent, index, source, target, absolute]));
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.removeCells = function(cells, includeEdges) {
		includeEdges = (includeEdges != null) ? includeEdges : true;
		if (cells == null) {
			cells = this.getDeletableCells(this.getSelectionCells());
		}
		if (includeEdges) {
			cells = this.getDeletableCells(this.addAllEdges(cells));
		}
		this.model.beginUpdate();
		try {
			this.cellsRemoved(cells);
			this.fireEvent(mxEvent.REMOVE_CELLS, new mxEventObject([cells,
							includeEdges]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};
	mxGraph.prototype.cellsRemoved = function(cells) {
		if (cells != null && cells.length > 0) {
			var scale = this.view.scale;
			var tr = this.view.translate;
			this.model.beginUpdate();
			try {
				var hash = new Object();
				for (var i = 0; i < cells.length; i++) {
					var id = mxCellPath.create(cells[i]);
					hash[id] = cells[i];
				}
				for (var i = 0; i < cells.length; i++) {
					var edges = this.getConnections(cells[i]);
					for (var j = 0; j < edges.length; j++) {
						var id = mxCellPath.create(edges[j]);
// alert(id);
						if (hash[id] == null) {
							var geo = this.model.getGeometry(edges[j]);
							if (geo != null) {
								var state = this.view.getState(edges[j]);
								if (state != null) {
									geo = geo.clone();
									var source = this.view.getVisibleTerminal(
											edges[j], true) == cells[i];
									var pts = state.absolutePoints;
									var n = (source) ? 0 : pts.length - 1;
									geo.setTerminalPoint(new mxPoint(pts[n].x
															/ scale - tr.x,
													pts[n].y / scale - tr.y),
											source);
									this.model.setTerminal(edges[j], null,
											source);
									this.model.setGeometry(edges[j], geo);
								}
							}
						}
					}
					this.model.remove(cells[i]);
				}
				this.fireEvent(mxEvent.CELLS_REMOVED,
						new mxEventObject([cells]));
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.splitEdge = function(edge, cells, newEdge, dx, dy) {
		dx = dx || 0;
		dy = dy || 0;
		if (newEdge == null) {
			newEdge = this.cloneCells([edge])[0];
		}
		var parent = this.model.getParent(edge);
		var source = this.model.getTerminal(edge, true);
		this.model.beginUpdate();
		try {
			this.cellsMoved(cells, dx, dy, false, false);
			this.cellsAdded(cells, parent, this.model.getChildCount(parent),
					null, null, true);
			this.cellsAdded([newEdge], parent,
					this.model.getChildCount(parent), source, cells[0], false);
			this.cellConnected(edge, cells[0], true);
			this.fireEvent(mxEvent.SPLIT_EDGE, new mxEventObject([edge, cells,
							newEdge, dx, dy]));
		} finally {
			this.model.endUpdate();
		}
		return newEdge;
	};

	mxGraph.prototype.toggleCells = function(show, cells, includeEdges) {
		if (cells == null) {
			cells = this.getSelectionCells();
		}
		if (includeEdges) {
			cells = this.addAllEdges(cells);
		}
		this.model.beginUpdate();
		try {
			this.cellsToggled(cells, show);
			this.fireEvent(mxEvent.TOGGLE_CELLS, new mxEventObject([show,
							cells, includeEdges]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};
	mxGraph.prototype.cellsToggled = function(cells, show) {
		if (cells != null && cells.length > 0) {
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					this.model.setVisible(cells[i], show);
				}
			} finally {
				this.model.endUpdate();
			}
		}
	};

	mxGraph.prototype.foldCells = function(collapse, recurse, cells) {
		recurse = (recurse != null) ? recurse : false;
		if (cells == null) {
			cells = this.getFoldableCells(this.getSelectionCells(), collapse);
		}
		this.stopEditing(false);
		this.model.beginUpdate();
		try {
			this.cellsFolded(cells, collapse, recurse);
			this.fireEvent(mxEvent.FOLD_CELLS, new mxEventObject([collapse,
							recurse, cells]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};
	mxGraph.prototype.cellsFolded = function(cells, collapse, recurse) {
		if (cells != null && cells.length > 0) {
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					if (collapse != this.isCellCollapsed(cells[i])) {
						this.model.setCollapsed(cells[i], collapse);
						this.swapBounds(cells[i], collapse);
						if (this.isExtendParent(cells[i])) {
							this.extendParent(cells[i]);
						}
						if (recurse) {
							var children = this.model.getChildren(cells[i]);
							this.foldCells(children, collapse, recurse);
						}
					}
				}
				this.fireEvent(mxEvent.CELLS_FOLDED, new mxEventObject([cells,
								collapse, recurse]));
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.swapBounds = function(cell, willCollapse) {
		if (cell != null) {
			var geo = this.model.getGeometry(cell);
			if (geo != null) {
				geo = geo.clone();
				this.updateAlternateBounds(cell, geo, willCollapse);
				geo.swap();
				this.model.setGeometry(cell, geo);
			}
		}
	};
	mxGraph.prototype.updateAlternateBounds = function(cell, geo, willCollapse) {
		if (cell != null && geo != null) {
			if (geo.alternateBounds == null) {
				var bounds = geo;
				if (this.collapseToPreferredSize) {
					var tmp = this.getPreferredSizeForCell(cell);
					if (tmp != null) {
						bounds = tmp;
						var state = this.view.getState(cell);
						var style = (state != null) ? state.style : this
								.getCellStyle(cell);
						var startSize = mxUtils.getValue(style,
								mxConstants.STYLE_STARTSIZE);
						if (startSize > 0) {
							bounds.height = Math.max(bounds.height, startSize);
						}
					}
				}
				geo.alternateBounds = new mxRectangle(geo.x, geo.y,
						bounds.width, bounds.height);
			} else {
				geo.alternateBounds.x = geo.x;
				geo.alternateBounds.y = geo.y;
			}
		}
	};
	mxGraph.prototype.addAllEdges = function(cells) {
		var allCells = cells.slice();
		allCells = allCells.concat(this.getAllEdges(cells));
		return allCells;
	};
	mxGraph.prototype.getAllEdges = function(cells) {
		var edges = new Array();
		if (cells != null) {
			for (var i = 0; i < cells.length; i++) {
				var edgeCount = this.model.getEdgeCount(cells[i]);
				for (var j = 0; j < edgeCount; j++) {
					edges.push(this.model.getEdgeAt(cells[i], j));
				}
				var children = this.model.getChildren(cells[i]);
				edges = edges.concat(this.getAllEdges(children));
			}
		}
		return edges;
	};

	mxGraph.prototype.updateCellSize = function(cell, ignoreChildren) {
		ignoreChildren = (ignoreChildren != null) ? ignoreChildren : false;
		this.model.beginUpdate();
		try {
			this.cellSizeUpdated(cell, ignoreChildren);
			this.fireEvent(mxEvent.UPDATE_CELL_SIZE, new mxEventObject([cell,
							ignoreChildren]));
		} finally {
			this.model.endUpdate();
		}
		return cell;
	};
	mxGraph.prototype.cellSizeUpdated = function(cell, ignoreChildren) {
		if (cell != null) {
			this.model.beginUpdate();
			try {
				var size = this.getPreferredSizeForCell(cell);
				var geo = this.model.getGeometry(cell);
				if (size != null && geo != null) {
					var collapsed = this.isCellCollapsed(cell);
					geo = geo.clone();
					if (this.isSwimlane(cell)) {
						var state = this.view.getState(cell);
						var style = (state != null) ? state.style : this
								.getCellStyle(cell);
						var cellStyle = this.model.getStyle(cell);
						if (cellStyle == null) {
							cellStyle = '';
						}
						if (mxUtils.getValue(style,
								mxConstants.STYLE_HORIZONTAL, true)) {
							cellStyle = mxUtils.setStyle(cellStyle,
									mxConstants.STYLE_STARTSIZE, size.height
											+ 8);
							if (collapsed) {
								geo.height = size.height + 8;
							}
							geo.width = size.width;
						} else {
							cellStyle = mxUtils
									.setStyle(cellStyle,
											mxConstants.STYLE_STARTSIZE,
											size.width + 8);
							if (collapsed) {
								geo.width = size.width + 8;
							}
							geo.height = size.height;
						}
						this.model.setStyle(cell, cellStyle);
					} else {
						geo.width = size.width;
						geo.height = size.height;
					}
					if (!ignoreChildren && !collapsed) {
						var bounds = this.view.getBounds(this.model
								.getChildren(cell));
						if (bounds != null) {
							var tr = this.view.translate;
							var scale = this.view.scale;
							var width = (bounds.x + bounds.width) / scale
									- geo.x - tr.x;
							var height = (bounds.y + bounds.height) / scale
									- geo.y - tr.y;
							geo.width = Math.max(geo.width, width);
							geo.height = Math.max(geo.height, height);
						}
					}
					this.cellsResized([cell], [geo]);
				}
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.getPreferredSizeForCell = function(cell) {
		var result = null;
		if (cell != null) {
			var state = this.view.getState(cell);
			var style = (state != null) ? state.style : this.getCellStyle(cell);
			if (style != null && !this.model.isEdge(cell)) {
				var fontSize = style[mxConstants.STYLE_FONTSIZE]
						|| mxConstants.DEFAULT_FONTSIZE;
				var dx = 0;
				var dy = 0;
				if (this.getImage(state) != null
						|| style[mxConstants.STYLE_IMAGE] != null) {
					if (style[mxConstants.STYLE_SHAPE] == mxConstants.SHAPE_LABEL) {
						if (style[mxConstants.STYLE_VERTICAL_ALIGN] == mxConstants.ALIGN_MIDDLE) {
							dx += style[mxConstants.STYLE_IMAGE_WIDTH]
									|| mxLabel.prototype.imageSize;
						}
						if (style[mxConstants.STYLE_ALIGN] != mxConstants.ALIGN_CENTER) {
							dy += style[mxConstants.STYLE_IMAGE_HEIGHT]
									|| mxLabel.prototype.imageSize;
						}
					}
				}
				dx += 2 * (style[mxConstants.STYLE_SPACING] || 0);
				dx += style[mxConstants.STYLE_SPACING_LEFT] || 0;
				dx += style[mxConstants.STYLE_SPACING_RIGHT] || 0;
				dy += 2 * (style[mxConstants.STYLE_SPACING] || 0);
				dy += style[mxConstants.STYLE_SPACING_TOP] || 0;
				dy += style[mxConstants.STYLE_SPACING_BOTTOM] || 0;

				var image = this.getFoldingImage(state);
				if (image != null) {
					dx += image.width + 8;
				}
				var value = this.getLabel(cell);
				if (value != null && value.length > 0) {
					if (!this.isHtmlLabel(cell)) {
						value = value.replace(/\n/g, '<br>');
					}
					var size = mxUtils.getSizeForString(value, fontSize,
							style[mxConstants.STYLE_FONTFAMILY]);
					var width = size.width + dx;
					var height = size.height + dy;
					if (!mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL,
							true)) {
						var tmp = height;
						height = width;
						width = tmp;
					}
					if (this.gridEnabled) {
						width = this.snap(width + this.gridSize / 2);
						height = this.snap(height + this.gridSize / 2);
					}
					result = new mxRectangle(0, 0, width, height);
				} else {
					var gs2 = 4 * this.gridSize;
					result = new mxRectangle(0, 0, gs2, gs2);
				}
			}
		}
		return result;
	};
	mxGraph.prototype.resizeCell = function(cell, bounds) {
		return this.resizeCells([cell], [bounds])[0];
	};
	mxGraph.prototype.resizeCells = function(cells, boundsArray) {
		this.model.beginUpdate();
		try {
			this.cellsResized(cells, boundsArray);
			this.fireEvent(mxEvent.RESIZE_CELLS, new mxEventObject([cells,
							boundsArray]));
		} finally {
			this.model.endUpdate();
		}
		return cells;
	};
	mxGraph.prototype.cellsResized = function(cells, boundsArray) {
		if (cells != null && boundsArray != null
				&& cells.length == boundsArray.length) {
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					var bounds = boundsArray[i];
					var geo = this.model.getGeometry(cells[i]);
					if (geo != null
							&& (geo.x != bounds.x || geo.y != bounds.y
									|| geo.width != bounds.width || geo.height != bounds.height)) {
						geo = geo.clone();
						if (geo.relative) {
							var offset = geo.offset;
							if (offset != null) {
								offset.x += bounds.x - geo.x;
								offset.y += bounds.y - geo.y;
							}
						} else {
							geo.x = bounds.x;
							geo.y = bounds.y;
						}
						geo.width = bounds.width;
						geo.height = bounds.height;
						this.model.setGeometry(cells[i], geo);
						if (this.isExtendParent(cells[i])) {
							this.extendParent(cells[i]);
						}
					}
				}
				if (this.resetEdgesOnResize) {
					this.resetEdges(cells);
				}
				this.fireEvent(mxEvent.CELLS_RESIZED, new mxEventObject([cells,
								boundsArray]));
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.extendParent = function(cell) {
		if (cell != null) {
			var parent = this.model.getParent(cell);
			var p = this.model.getGeometry(parent);
			if (parent != null && p != null && !this.isCellCollapsed(parent)) {
				var geo = this.model.getGeometry(cell);
				if (geo != null
						&& (p.width < geo.x + geo.width || p.height < geo.y
								+ geo.height)) {
					p = p.clone();
					p.width = Math.max(p.width, geo.x + geo.width);
					p.height = Math.max(p.height, geo.y + geo.height);
					this.cellsResized([parent], [p]);
				}
			}
		}
	};

	mxGraph.prototype.importCells = function(cells, dx, dy, target, evt) {
		return this.moveCells(cells, dx, dy, true, target, evt);
	};
	mxGraph.prototype.moveCells = function(cells, dx, dy, clone, target, evt) {
		if (cells != null && (dx != 0 || dy != 0 || clone || target != null)) {
			this.model.beginUpdate();
			try {
				if (clone) {
					cells = this.cloneCells(cells, this.isCloneInvalidEdges());
					if (target == null) {
						target = this.getDefaultParent();
					}
				}
				this.cellsMoved(cells, dx, dy, !clone
								&& this.isDisconnectOnMove()
								&& this.isAllowDanglingEdges(), target == null);
				if (target != null) {
					var index = this.model.getChildCount(target);
					this.cellsAdded(cells, target, index, null, null, true);
				}
				this.fireEvent(mxEvent.MOVE_CELLS, new mxEventObject([cells,
								dx, dy, clone, target, evt]));
			} finally {
				this.model.endUpdate();
			}
		}
		return cells;
	};
	mxGraph.prototype.cellsMoved = function(cells, dx, dy, disconnect,
			constrain) {
		if (cells != null && (dx != 0 || dy != 0)) {
			this.model.beginUpdate();
			try {
				if (disconnect) {
					this.disconnectGraph(cells);
				}
				for (var i = 0; i < cells.length; i++) {
					this.translateCell(cells[i], dx, dy);
					if (constrain) {
						this.constrainChild(cells[i]);
					}
				}
				if (this.resetEdgesOnMove) {
					this.resetEdges(cells);
				}
				this.fireEvent(mxEvent.CELLS_MOVED, new mxEventObject([cells,
								dx, dy, disconnect]));
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.translateCell = function(cell, dx, dy) {
		var geo = this.model.getGeometry(cell);
		if (geo != null) {
			geo = geo.translate(dx, dy);
			if (geo.relative && !this.model.isEdge(cell)) {
				if (geo.offset == null) {
					geo.offset = new mxPoint(dx, dy);
				} else {
					geo.offset.X += dx;
					geo.offset.Y += dy;
				}
			}
			this.model.setGeometry(cell, geo);
		}
	}
	mxGraph.prototype.getCellContainmentArea = function(cell) {
		if (cell != null && !this.model.isEdge(cell)) {
			var parent = this.model.getParent(cell);
			if (parent == this.getDefaultParent()
					|| parent == this.getCurrentRoot()) {
				return this.getMaximumGraphBounds();
			} else
				(parent != null && parent != this.getDefaultParent())
			{
				var g = this.model.getGeometry(parent);
				if (g != null) {
					var x = 0;
					var y = 0;
					var w = g.width;
					var h = g.height;
					if (this.isSwimlane(parent)) {
						var size = this.getStartSize(parent);
						x = size.width;
						w -= size.width;
						y = size.height;
						h -= size.height;
					}
					return new mxRectangle(x, y, w, h);
				}
			}
		}
		return null;
	};
	mxGraph.prototype.getMaximumGraphBounds = function() {
		return this.maximumGraphBounds;
	};
	mxGraph.prototype.constrainChild = function(cell) {
		if (cell != null) {
			var geo = this.model.getGeometry(cell);
			var area = (this.isConstrainChild(cell)) ? this
					.getCellContainmentArea(cell) : this
					.getMaximumGraphBounds();
			if (geo != null && area != null) {
				if (!geo.relative
						&& (geo.x < area.x || geo.y < area.y
								|| area.width < geo.x + geo.width || area.height < geo.y
								+ geo.height)) {
					var overlap = this.getOverlap(cell);
					if (area.width > 0) {
						geo.x = Math.min(geo.x, area.x + area.width
										- (1 - overlap) * geo.width);
					}
					if (area.height > 0) {
						geo.y = Math.min(geo.y, area.y + area.height
										- (1 - overlap) * geo.height);
					}
					geo.x = Math.max(geo.x, area.x - geo.width * overlap);
					geo.y = Math.max(geo.y, area.y - geo.height * overlap);
				}
			}
		}
	};
	mxGraph.prototype.resetEdges = function(cells) {
		if (cells != null) {
			var hash = new Object();
			for (var i = 0; i < cells.length; i++) {
				var id = mxCellPath.create(cells[i]);
				hash[id] = cells[i];
			}
			this.model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					var edges = this.model.getEdges(cells[i]);
					if (edges != null) {
						for (var j = 0; j < edges.length; j++) {
							var source = this.view.getVisibleTerminal(edges[j],
									true);
							var sourceId = mxCellPath.create(source);
							var target = this.view.getVisibleTerminal(edges[j],
									false);
							var targetId = mxCellPath.create(target);
							if (hash[sourceId] == null
									|| hash[targetId] == null) {
								this.resetEdge(edges[j]);
							}
						}
					}
					this.resetEdges(this.model.getChildren(cells[i]));
				}
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.resetEdge = function(edge) {
		var geo = this.model.getGeometry(edge);
		if (geo != null && geo.points != null && geo.points.length > 0) {
			geo = geo.clone();
			geo.points = new Array();
			this.model.setGeometry(edge, geo);
		}
		return edge;
	};

	mxGraph.prototype.connectCell = function(edge, terminal, source) {
		this.model.beginUpdate();
		try {
			this.cellConnected(edge, terminal, source);
			this.fireEvent(mxEvent.CONNECT_CELL, new mxEventObject([edge,
							terminal, source]));
		} finally {
			this.model.endUpdate();
		}
		return edge;
	};
	mxGraph.prototype.cellConnected = function(edge, terminal, source) {
		if (edge != null) {
			this.model.beginUpdate();
			try {
				this.model.setTerminal(edge, terminal, source);
				if (this.resetEdgesOnConnect) {
					this.resetEdge(edge);
				}
				this.fireEvent(mxEvent.CELL_CONNECTED, new mxEventObject([edge,
								terminal, source]));
			} finally {
				this.model.endUpdate();
			}
		}
	};
	mxGraph.prototype.disconnectGraph = function(cells) {
		if (cells != null) {
			this.model.beginUpdate();
			try {
				var scale = this.view.scale;
				var tr = this.view.translate;
				var hash = new Object();
				for (var i = 0; i < cells.length; i++) {
					var id = mxCellPath.create(cells[i]);
					hash[id] = cells[i];
				}
				for (var i = 0; i < cells.length; i++) {
					if (this.model.isEdge(cells[i])) {
						var geo = this.model.getGeometry(cells[i]);
						if (geo != null) {
							var state = this.view.getState(cells[i]);
							var pstate = this.view.getState(this.model
									.getParent(cells[i]));
							if (state != null && pstate != null) {
								geo = geo.clone();
								var dx = -pstate.origin.x;
								var dy = -pstate.origin.y;
								var pts = state.absolutePoints;
								var src = this.model
										.getTerminal(cells[i], true);
								if (src != null
										&& this.isCellDisconnectable(cells[i],
												src, true)) {
									var srcId = mxCellPath.create(src);
									while (src != null && hash[srcId] == null) {
										src = this.model.getParent(src);
										srcId = mxCellPath.create(src);
									}
									if (src == null) {
										geo.setTerminalPoint(new mxPoint(
														pts[0].x / scale - tr.x
																+ dx, pts[0].y
																/ scale - tr.y
																+ dy), true);
										this.model.setTerminal(cells[i], null,
												true);
									}
								}
								var trg = this.model.getTerminal(cells[i],
										false);
								if (trg != null
										&& this.isCellDisconnectable(cells[i],
												trg, false)) {
									var trgId = mxCellPath.create(trg);
									while (trg != null && hash[trgId] == null) {
										trg = this.model.getParent(trg);
										trgId = mxCellPath.create(trg);
									}
									if (trg == null) {
										var n = pts.length - 1;
										geo.setTerminalPoint(new mxPoint(
														pts[n].x / scale - tr.x
																+ dx, pts[n].y
																/ scale - tr.y
																+ dy), false);
										this.model.setTerminal(cells[i], null,
												false);
									}
								}
								this.model.setGeometry(cells[i], geo);
							}
						}
					}
				}
			} finally {
				this.model.endUpdate();
			}
		}
	};

	mxGraph.prototype.getCurrentRoot = function() {
		return this.view.currentRoot;
	};
	mxGraph.prototype.getTranslateForRoot = function(cell) {
		return null;
	};
	mxGraph.prototype.getChildOffsetForCell = function(cell) {
		return null;
	};
	mxGraph.prototype.enterGroup = function(cell) {
		cell = cell || this.getSelectionCell();
		if (cell != null && this.isValidRoot(cell)) {
			this.view.setCurrentRoot(cell);
			this.clearSelection();
		}
	};
	mxGraph.prototype.exitGroup = function() {
		var root = this.model.getRoot();
		var current = this.getCurrentRoot();
		if (current != null) {
			var next = this.model.getParent(current);
			while (next != root && !this.isValidRoot(next)
					&& this.model.getParent(next) != root) {
				next = this.model.getParent(next);
			}

			if (next == root || this.model.getParent(next) == root) {
				this.view.setCurrentRoot(null);
			} else {
				this.view.setCurrentRoot(next);
			}
			var state = this.view.getState(current);
			if (state != null) {
				this.setSelectionCell(current);
			}
		}
	};
	mxGraph.prototype.home = function() {
		var current = this.getCurrentRoot();
		if (current != null) {
			this.view.setCurrentRoot(null);
			var state = this.view.getState(current);
			if (state != null) {
				this.setSelectionCell(current);
			}
		}
	};
	mxGraph.prototype.isValidRoot = function(cell) {
		return (cell != null);
	};

	mxGraph.prototype.getGraphBounds = function() {
		return this.view.getGraphBounds();
	}
	mxGraph.prototype.getCellBounds = function(cell, includeEdges,
			includeDescendants) {
		var cells = [cell];
		if (includeEdges) {
			cells = cells.concat(this.model.getEdges(cell));
		}
		var result = this.view.getBounds(cells);
		if (includeDescendants) {
			var childCount = this.model.getChildCount(cell);
			for (var i = 0; i < childCount; i++) {
				var tmp = this.getCellBounds(this.model.getChildAt(cell, i),
						includeEdges, true);
				if (result != null) {
					result.add(tmp);
				} else {
					result = tmp;
				}
			}
		}
	};
	mxGraph.prototype.refresh = function(cell) {
		this.view.clear(cell, cell == null);
		this.view.validate();
		this.sizeDidChange();
		this.fireEvent(mxEvent.REFRESH);
	};
	mxGraph.prototype.snap = function(value) {
		if (this.gridEnabled) {
			value = Math.round(value / this.gridSize) * this.gridSize;
		}
		return value;
	};
	mxGraph.prototype.panGraph = function(dx, dy) {
		var style = mxUtils.getCurrentStyle(this.container);
		if (mxUtils.hasScrollbars(this.container)) {
			this.container.scrollLeft = -dx;
			this.container.scrollTop = -dy;
		} else {
			var canvas = this.view.getCanvas();
			if (this.dialect == mxConstants.DIALECT_SVG) {
				canvas.setAttribute('transform', 'translate(' + dx + ',' + dy
								+ ')');
				if (dx == 0 && dy == 0) {
					if (this.shiftPreview != null) {
						this.shiftPreview.parentNode
								.removeChild(this.shiftPreview);
						this.shiftPreview = null;
						var child = this.container.firstChild;
						while (child != null) {
							if (child != canvas.parentNode) {
								if (child.style != null) {
									child.style.visibility = 'visible';
								}
							}
							child = child.nextSibling;
						}
					}
				} else {
					if (this.shiftPreview == null) {
						this.shiftPreview = document.createElement('div');
						var tmp = new Array();
						var child = this.container.firstChild;
						while (child != null) {
							if (child != canvas.parentNode) {
								tmp.push(mxUtils.getInnerHtml(child));
								if (child.style != null) {
									child.style.visibility = 'hidden';
								}
							}
							child = child.nextSibling;
						}
						this.shiftPreview.innerHTML = tmp.join('');
						this.shiftPreview.style.position = 'absolute';
						this.shiftPreview.style.overflow = 'visible';
						var pt = mxUtils.getOffset(this.container);
						this.shiftPreview.style.left = pt.x + 'px';
						this.shiftPreview.style.top = pt.y + 'px';
						this.container.appendChild(this.shiftPreview);
					}
					this.shiftPreview.style.left = dx + 'px';
					this.shiftPreview.style.top = dy + 'px';
				}
			} else if (this.dialect == mxConstants.DIALECT_VML) {
				canvas.setAttribute('coordorigin', (-dx) + ',' + (-dy));
			} else {
				if (dx == 0 && dy == 0) {
					if (this.shiftPreview != null) {
						this.shiftPreview.parentNode
								.removeChild(this.shiftPreview);
						canvas.style.visibility = 'visible';
						this.shiftPreview = null;
					}
				} else {
					if (this.shiftPreview == null) {
						this.shiftPreview = this.view.getDrawPane()
								.cloneNode(false);
						var tmp = mxUtils.getInnerHtml(this.view
								.getBackgroundPane());
						tmp += mxUtils.getInnerHtml(this.view.getDrawPane());
						this.shiftPreview.innerHTML = tmp;
						var pt = mxUtils.getOffset(this.container);
						this.shiftPreview.style.position = 'absolute';
						this.shiftPreview.style.left = pt.x + 'px';
						this.shiftPreview.style.top = pt.y + 'px';
						canvas.style.visibility = 'hidden';
						this.container.appendChild(this.shiftPreview);
					}
					this.shiftPreview.style.left = dx + 'px';
					this.shiftPreview.style.top = dy + 'px';
				}
			}
		}
	};
	mxGraph.prototype.zoomIn = function() {
		this.zoom(this.zoomFactor);
	};
	mxGraph.prototype.zoomOut = function() {
		this.zoom(1 / this.zoomFactor);
	};
	mxGraph.prototype.zoomActual = function() {
		this.view.translate.x = 0;
		this.view.translate.y = 0;
		this.view.setScale(1);
	};
	mxGraph.prototype.zoom = function(factor) {
		var scale = this.view.scale * factor;
		var state = this.view.getState(this.getSelectionCell());
		if (this.keepSelectionVisibleOnZoom && state != null) {
			var rect = new mxRectangle(state.x * factor, state.y * factor,
					state.width * factor, state.height * factor);

			this.view.scale = scale;
			if (!this.scrollRectToVisible(rect)) {
				this.view.revalidate();
			}
		} else if (this.centerZoom && !mxUtils.hasScrollbars(this.container)) {
			var dx = this.container.offsetWidth;
			var dy = this.container.offsetHeight;
			if (factor > 1) {
				var f = (factor - 1) / (scale * 2);
				dx *= -f;
				dy *= -f;
			} else {
				var f = (1 / factor - 1) / (this.view.scale * 2);
				dx *= f;
				dy *= f;
			}
			this.view.scaleAndTranslate(scale, this.view.translate.x + dx,
					this.view.translate.y + dy);
		} else {
			this.view.setScale(scale);
		}
	};
	mxGraph.prototype.fit = function() {
		var border = 10;
		var w1 = this.container.offsetWidth - 30 - 2 * border;
		var h1 = this.container.offsetHeight - 30 - 2 * border;
		var bounds = this.view.getGraphBounds();
		var w2 = bounds.width / this.view.scale;
		var h2 = bounds.height / this.view.scale;
		var s = Math.min(w1 / w2, h1 / h2);
		if (s > 0.1 && s < 8) {
			this.view.translate.x = (bounds.x != null) ? this.view.translate.x
					- bounds.x / this.view.scale + border : border;
			this.view.translate.y = (bounds.y != null) ? this.view.translate.y
					- bounds.y / this.view.scale + border : border;
			this.view.setScale(s);
		}
	};
	mxGraph.prototype.scrollCellToVisible = function(cell) {
		var x = -this.view.translate.x;
		var y = -this.view.translate.y;
		var state = this.view.getState(cell);
		if (state != null) {
			var bounds = new mxRectangle(x + state.x, y + state.y, state.width,
					state.height);
			if (this.scrollRectToVisible(bounds)) {
				this.view.setTranslate(this.view.translate.x,
						this.view.translate.y);
			}
		}
	};
	mxGraph.prototype.scrollRectToVisible = function(rect) {
		if (rect != null) {
			var isChanged = false;
			if (mxUtils.hasScrollbars(this.container)) {
				var c = this.container;
				var dx = c.scrollLeft - rect.x;
				if (dx > 0) {
					c.scrollLeft -= dx + 2;
				} else {
					dx = rect.x + rect.width - c.scrollLeft - c.clientWidth;
					if (dx > 0) {
						c.scrollLeft += dx + 2;
					}
				}
				var dy = c.scrollTop - rect.y;
				if (dy > 0) {
					c.scrollTop -= dy + 2;
				} else {
					dy = rect.y + rect.height - c.scrollTop - c.clientHeight;
					if (dy > 0) {
						c.scrollTop += dy + 2;
					}
				}
			} else {
				var x = -this.view.translate.x;
				var y = -this.view.translate.y;
				var w = this.container.offsetWidth;
				var h = this.container.offsetHeight;
				var s = this.view.scale;
				if (rect.x + rect.width > x + w) {
					this.view.translate.x -= (rect.x + rect.width - w - x) / s;
					isChanged = true;
				}
				if (rect.y + rect.height > y + h) {
					this.view.translate.y -= (rect.y + rect.height - h - y) / s;
					isChanged = true;
				}
				if (rect.x < x) {
					this.view.translate.x += (x - rect.x) / s;
					isChanged = true;
				}
				if (rect.y < y) {
					this.view.translate.y += (y - rect.y) / s;
					isChanged = true;
				}
				if (isChanged) {
					this.view.refresh();
				}
			}
		}
		return isChanged;
	};
	mxGraph.prototype.getCellGeometry = function(cell) {
		return this.model.getGeometry(cell);
	};
	mxGraph.prototype.isCellVisible = function(cell) {
		return this.model.isVisible(cell);
	};
	mxGraph.prototype.isCellCollapsed = function(cell) {
		return this.model.isCollapsed(cell);
	};
	mxGraph.prototype.isCellConnectable = function(cell) {
		return this.model.isConnectable(cell);
	};
	mxGraph.prototype.isOrthogonal = function(edge, vertex) {
		var tmp = this.view.getEdgeStyle(edge);
		return tmp == mxEdgeStyle.ElbowConnector
				|| tmp == mxEdgeStyle.SideToSide
				|| tmp == mxEdgeStyle.TopToBottom
				|| tmp == mxEdgeStyle.EntityRelation;
	};
	mxGraph.prototype.isLoop = function(state) {
		var src = this.view.getVisibleTerminal(state.cell, true);
		var trg = this.view.getVisibleTerminal(state.cell, false);
		return (src != null && src == trg);
	};
	mxGraph.prototype.isCloneEvent = function(evt) {
		return mxEvent.isControlDown(evt);
	};
	mxGraph.prototype.isToggleEvent = function(evt) {
		return mxEvent.isControlDown(evt);
	};
	mxGraph.prototype.isGridEnabledEvent = function(evt) {
		return evt != null && !mxEvent.isAltDown(evt);
	};
	mxGraph.prototype.isConstrainedEvent = function(evt) {
		return mxEvent.isShiftDown(evt);
	};
	mxGraph.prototype.isForceMarqueeEvent = function(evt) {
		return mxEvent.isAltDown(evt) || mxEvent.isMetaDown(evt);
	};

	mxGraph.prototype.validationAlert = function(message) {
// mxUtils.alert(message);jiang20091110
	};
	mxGraph.prototype.isEdgeValid = function(edge, source, target) {
		return this.getEdgeValidationError(edge, source, target) == null;
	};
	mxGraph.prototype.getEdgeValidationError = function(edge, source, target) {
		if (edge != null && this.model.getTerminal(edge, true) == null
				&& this.model.getTerminal(edge, false) == null) {
			return null;
		}
		if (!this.allowLoops && source == target && source != null) {
			return '';
		}
		if (!this.isValidConnection(source, target)) {
			return '';
		}
		if (source != null && target != null) {
			var error = '';

			if (!this.multigraph) {
				var tmp = this.model.getEdgesBetween(source, target, true);
				if (tmp.length > 1 || (tmp.length == 1 && tmp[0] != edge)) {
					error += (mxResources.get(this.alreadyConnectedResource) || this.alreadyConnectedResource)
							+ '\n';
				}
			}

			var sourceOut = this.model.getDirectedEdgeCount(source, true, edge);
			var targetIn = this.model.getDirectedEdgeCount(target, false, edge);
			for (var i = 0; i < this.multiplicities.length; i++) {
				var err = this.multiplicities[i].check(this, edge, source,
						target, sourceOut, targetIn);
				if (err != null) {
					error += err;
				}
			}
			var err = this.validateEdge(edge, source, target);
			if (err != null) {
				error += err;
			}
			return (error.length > 0) ? error : null;
		}
		return (this.allowDanglingEdges) ? null : '';
	};
	mxGraph.prototype.validateEdge = function(edge, source, target) {
		return null;
	};
	mxGraph.prototype.validateGraph = function(cell, context) {
		cell = (cell != null) ? cell : this.model.getRoot();
		context = (context != null) ? context : new Object();
		var isValid = true;
		var childCount = this.model.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			var tmp = this.model.getChildAt(cell, i);
			var ctx = context;
			if (this.isValidRoot(tmp)) {
				ctx = new Object();
			}
			var warn = this.validateGraph(tmp, ctx);
			if (warn != null) {
				var html = warn.replace(/\n/g, '<br>');
				var len = html.length;
				this.setCellWarning(tmp, html
								.substring(0, Math.max(0, len - 4)));
			} else {
				this.setCellWarning(tmp, null);
			}
			isValid = isValid && warn == null;
		}
		var warning = '';
		if (this.isCellCollapsed(cell) && !isValid) {
			warning += (mxResources.get(this.containsValidationErrorsResource) || this.containsValidationErrorsResource)
					+ '\n';
		}
		if (this.model.isEdge(cell)) {
			warning += this.getEdgeValidationError(cell, this.model
							.getTerminal(cell, true), this.model.getTerminal(
							cell, false))
					|| '';
		} else {
			warning += this.getCellValidationError(cell) || '';
		}
		var err = this.validateCell(cell, context);
		if (err != null) {
			warning += err;
		}

		if (this.model.getParent(cell) == null) {
			this.view.validate();
		}
		return (warning.length > 0 || !isValid) ? warning : null;
	};
	mxGraph.prototype.getCellValidationError = function(cell) {
		var outCount = this.model.getDirectedEdgeCount(cell, true);
		var inCount = this.model.getDirectedEdgeCount(cell, false);
		var value = this.model.getValue(cell);
		var error = '';
		for (var i = 0; i < this.multiplicities.length; i++) {
			var rule = this.multiplicities[i];
			if (rule.source
					&& mxUtils.isNode(value, rule.type, rule.attr, rule.value)
					&& ((rule.max == 0 && outCount > 0)
							|| (rule.min == 1 && outCount == 0) || (rule.max == 1 && outCount > 1))) {
				error += rule.countError + '\n';
			} else if (!rule.source
					&& mxUtils.isNode(value, rule.type, rule.attr, rule.value)
					&& ((rule.max == 0 && inCount > 0)
							|| (rule.min == 1 && inCount == 0) || (rule.max == 1 && inCount > 1))) {
				error += rule.countError + '\n';
			}
		}
		return (error.length > 0) ? error : null;
	};
	mxGraph.prototype.validateCell = function(cell, context) {
		return null;
	};

	mxGraph.prototype.getBackgroundImage = function() {
		return this.backgroundImage;
	};
	mxGraph.prototype.setBackgroundImage = function(image) {
		this.backgroundImage = image;
	};
	mxGraph.prototype.getFoldingImage = function(state) {
		if (state != null) {
			var tmp = this.isCellCollapsed(state.cell);
			if (this.isCellFoldable(state.cell, !tmp)) {
				return (tmp) ? this.collapsedImage : this.expandedImage;
			}
		}
		return null;
	};
	mxGraph.prototype.convertValueToString = function(cell) {
		var value = this.model.getValue(cell);
		if (value != null) {
			if (mxUtils.isNode(value)) {
				return value.nodeName;
			} else if (typeof(value.toString) == 'function') {
				return value.toString();
			}
		}
		return '';
	};
	mxGraph.prototype.getLabel = function(cell) {
		var result = '';
		var style = (cell != null) ? this.getCellStyle(cell) : null;
		if (cell != null && this.labelsVisible
				&& !mxUtils.getValue(style, mxConstants.STYLE_NOLABEL, false)) {
			result = this.convertValueToString(cell);
		}
		return result;
	};
	mxGraph.prototype.isHtmlLabel = function(cell) {
		return this.htmlLabels;
	};
	mxGraph.prototype.isHtmlLabels = function() {
		return this.htmlLabels;
	};
	mxGraph.prototype.setHtmlLabels = function(value) {
		this.htmlLabels = value;
	};
	mxGraph.prototype.isWrapping = function(cell) {
		return false;
	};
	mxGraph.prototype.isLabelClipped = function(cell) {
		return false;
	};
	mxGraph.prototype.getTooltipForEvent = function(me) {
		var tip = null;
		if (me.getTooltip() != null) {
			tip = me.getTooltip();
		} else if (me.getState() != null) {
			tip = this.getTooltipForCell(me.getCell());
		}
		return tip;
	};
	mxGraph.prototype.getTooltipForCell = function(cell) {
		var tip = null;
		if (cell.getTooltip != null) {
			tip = cell.getTooltip();
		} else {
			tip = this.convertValueToString(cell);
		}
		return tip;
	};
	mxGraph.prototype.getCursorForCell = function(cell) {
		return null;
	};
	mxGraph.prototype.getStartSize = function(swimlane) {
		var result = new mxRectangle();
		var style = this.getCellStyle(swimlane);
		if (style != null) {
			var size = parseInt(style[mxConstants.STYLE_STARTSIZE]) || 0;
			if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
				result.height = size;
			} else {
				result.width = size;
			}
		}
		return result;
	};
	mxGraph.prototype.getImage = function(state) {
		return (state != null && state.style != null)
				? state.style[mxConstants.STYLE_IMAGE]
				: null;
	};
	mxGraph.prototype.getVerticalAlign = function(state) {
		return (state != null && state.style != null)
				? state.style[mxConstants.STYLE_VERTICAL_ALIGN]
				: null;
	};
	mxGraph.prototype.getIndicatorColor = function(state) {
		return (state != null && state.style != null)
				? state.style[mxConstants.STYLE_INDICATOR_COLOR]
				: null;
	};
	mxGraph.prototype.getIndicatorGradientColor = function(state) {
		return (state != null && state.style != null)
				? state.style[mxConstants.STYLE_INDICATOR_GRADIENTCOLOR]
				: null;
	};
	mxGraph.prototype.getIndicatorShape = function(state) {
		return (state != null && state.style != null)
				? state.style[mxConstants.STYLE_INDICATOR_SHAPE]
				: null;
	};
	mxGraph.prototype.getIndicatorImage = function(state) {
		return (state != null && state.style != null)
				? state.style[mxConstants.STYLE_INDICATOR_IMAGE]
				: null;
	};
	mxGraph.prototype.getBorder = function() {
		return this.border;
	};
	mxGraph.prototype.setBorder = function(border) {
		this.border = border;
	};
	mxGraph.prototype.isSwimlane = function(cell) {
		if (cell != null) {
			if (this.model.getParent(cell) != this.model.getRoot()) {
				var state = this.view.getState(cell);
				var style = (state != null) ? state.style : this
						.getCellStyle(cell);
				if (style != null && !this.model.isEdge(cell)) {
					return style[mxConstants.STYLE_SHAPE] == mxConstants.SHAPE_SWIMLANE;
				}
			}
		}
		return false;
	};

	mxGraph.prototype.isResizeContainer = function() {
		return this.resizeContainer;
	};
	mxGraph.prototype.setResizeContainer = function(resizeContainer) {
		this.resizeContainer = resizeContainer;
	};
	mxGraph.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxGraph.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxGraph.prototype.isEscapeEnabled = function() {
		return this.escapeEnabled;
	};
	mxGraph.prototype.setEscapeEnabled = function(value) {
		this.escapeEnabled = value;
	};
	mxGraph.prototype.isInvokesStopCellEditing = function() {
		return this.invokesStopCellEditing;
	};
	mxGraph.prototype.setInvokesStopCellEditing = function(value) {
		this.invokesStopCellEditing = value;
	};
	mxGraph.prototype.setEnterStopsCellEditing = function() {
		return this.enterStopsCellEditing;
	};
	mxGraph.prototype.isEnterStopsCellEditing = function(value) {
		this.enterStopsCellEditing = value;
	};
	mxGraph.prototype.isCellLocked = function(cell) {
		var geometry = this.model.getGeometry(cell);
		return this.isCellsLocked()
				|| (geometry != null && this.model.isVertex(cell) && geometry.relative);
	};
	mxGraph.prototype.isCellsLocked = function() {
		return this.cellsLocked;
	};
	mxGraph.prototype.setCellsLocked = function(value) {
		this.cellsLocked = value;
	};
	mxGraph.prototype.getCloneableCells = function(cells) {
		var self = this;
		return this.model.filterCells(cells, function(cell) {
					return self.isCellCloneable(cell);
				});
	};
	mxGraph.prototype.isCellCloneable = function(cell) {
		return this.isCellsCloneable();
	};
	mxGraph.prototype.isCellsCloneable = function() {
		return this.cellsCloneable;
	}
	mxGraph.prototype.setCellsCloneable = function(value) {
		this.cellsCloneable = value;
	};
	mxGraph.prototype.getExportableCells = function(cells) {
		var self = this;
		return this.model.filterCells(cells, function(cell) {
					return self.canExportCell(cell);
				});
	};
	mxGraph.prototype.canExportCell = function(cell) {
		return this.exportEnabled;
	};
	mxGraph.prototype.getImportableCells = function(cells) {
		var self = this;
		return this.model.filterCells(cells, function(cell) {
					return self.canImportCell(cell);
				});
	};
	mxGraph.prototype.canImportCell = function(cell) {
		return this.importEnabled;
	};
	mxGraph.prototype.isCellSelectable = function(cell) {
		return this.isCellsSelectable();
	};
	mxGraph.prototype.isCellsSelectable = function() {
		return this.cellsSelectable;
	};
	mxGraph.prototype.setCellsSelectable = function(value) {
		this.cellsSelectable = value;
	};
	mxGraph.prototype.getDeletableCells = function(cells) {
		var self = this;
		return this.model.filterCells(cells, function(cell) {
					return self.isCellDeletable(cell);
				});
	};
	mxGraph.prototype.isCellDeletable = function(cell) {
		return this.isCellsDeletable();
	};
	mxGraph.prototype.isCellsDeletable = function() {
		return this.cellsDeletable;
	};
	mxGraph.prototype.setCellsDeletable = function(value) {
		this.cellsDeletable = value;
	};
	mxGraph.prototype.isLabelMovable = function(cell) {
		return !this.isCellLocked(cell)
				&& ((this.model.isEdge(cell) && this.edgeLabelsMovable) || (this.model
						.isVertex(cell) && this.vertexLabelsMovable));
	};
	mxGraph.prototype.getMovableCells = function(cells) {
		var self = this;
		return this.model.filterCells(cells, function(cell) {
					return self.isCellMovable(cell);
				});
	};
	mxGraph.prototype.isCellMovable = function(cell) {
		return this.isCellsMovable() && !this.isCellLocked(cell);
	};
	mxGraph.prototype.isCellsMovable = function() {
		return this.cellsMovable;
	};
	mxGraph.prototype.setCellsMovable = function(value) {
		this.cellsMovable = value;
	};
	mxGraph.prototype.isGridEnabled = function() {
		return this.gridEnabled;
	};
	mxGraph.prototype.setGridEnabled = function(gridEnabled) {
		this.gridEnabled = gridEnabled;
	};
	mxGraph.prototype.isSwimlaneNesting = function() {
		return this.swimlaneNesting;
	};
	mxGraph.prototype.setSwimlaneNesting = function(swimlaneNesting) {
		this.swimlaneNesting = swimlaneNesting;
	};
	mxGraph.prototype.isSwimlaneSelectionEnabled = function() {
		return this.swimlaneSelectionEnabled;
	};
	mxGraph.prototype.setSwimlaneSelectionEnabled = function(
			swimlaneSelectionEnabled) {
		this.swimlaneSelectionEnabled = swimlaneSelectionEnabled;
	};
	mxGraph.prototype.isMultigraph = function() {
		return this.multigraph;
	};
	mxGraph.prototype.setMultigraph = function(multigraph) {
		this.multigraph = multigraph;
	};
	mxGraph.prototype.isAllowLoops = function() {
		return this.allowLoops;
	};
	mxGraph.prototype.setAllowDanglingEdges = function(allowDanglingEdges) {
		this.allowDanglingEdges = allowDanglingEdges;
	};
	mxGraph.prototype.isAllowDanglingEdges = function() {
		return this.allowDanglingEdges;
	};
	mxGraph.prototype.setConnectableEdges = function(connectableEdges) {
		this.connectableEdges = connectableEdges;
	};
	mxGraph.prototype.isConnectableEdges = function() {
		return this.connectableEdges;
	};
	mxGraph.prototype.setCloneInvalidEdges = function(cloneInvalidEdges) {
		this.cloneInvalidEdges = cloneInvalidEdges;
	};
	mxGraph.prototype.isCloneInvalidEdges = function() {
		return this.cloneInvalidEdges;
	};
	mxGraph.prototype.setAllowLoops = function(allowLoops) {
		this.allowLoops = allowLoops;
	};
	mxGraph.prototype.isDisconnectOnMove = function() {
		return this.disconnectOnMove;
	};
	mxGraph.prototype.setDisconnectOnMove = function(disconnectOnMove) {
		this.disconnectOnMove = disconnectOnMove;
	};
	mxGraph.prototype.isDropEnabled = function() {
		return this.dropEnabled;
	};
	mxGraph.prototype.setDropEnabled = function(value) {
		this.dropEnabled = value;
	};
	mxGraph.prototype.isSplitEnabled = function() {
		return this.splitEnabled;
	};
	mxGraph.prototype.setSplitEnabled = function(value) {
		this.splitEnabled = value;
	};
	mxGraph.prototype.isCellResizable = function(cell) {
		return this.isCellsResizable() && !this.isCellLocked(cell);
	};
	mxGraph.prototype.isCellsResizable = function() {
		return this.cellsResizable;
	};
	mxGraph.prototype.setCellsResizable = function(value) {
		this.cellsResizable = value;
	};
	mxGraph.prototype.isCellBendable = function(cell) {
		return this.isCellsBendable() && !this.isCellLocked(cell);
	};
	mxGraph.prototype.isCellsBendable = function() {
		return this.cellsBendable;
	};
	mxGraph.prototype.setCellsBendable = function(value) {
		this.cellsBendable = value;
	};
	mxGraph.prototype.isCellEditable = function(cell) {
		return this.isCellsEditable() && !this.isCellLocked(cell);
	};
	mxGraph.prototype.isCellsEditable = function() {
		return this.cellsEditable;
	};
	mxGraph.prototype.setCellsEditable = function(value) {
		this.cellsEditable = value;
	};
	mxGraph.prototype.isCellDisconnectable = function(cell, terminal, source) {
		return this.isCellsDisconnectable() && !this.isCellLocked(cell);
	};
	mxGraph.prototype.isCellsDisconnectable = function() {
		return this.cellsDisconnectable;
	};
	mxGraph.prototype.setCellsDisconnectable = function(value) {
		this.cellsDisconnectable = value;
	};
	mxGraph.prototype.isValidSource = function(cell) {
		return (cell == null && this.allowDanglingEdges)
				|| (cell != null
						&& (!this.model.isEdge(cell) || this.connectableEdges) && this
						.isCellConnectable(cell));
	};
	mxGraph.prototype.isValidTarget = function(cell) {
		return this.isValidSource(cell);
	};
	mxGraph.prototype.isValidConnection = function(source, target) {
		return this.isValidSource(source) && this.isValidTarget(target);
	};
	mxGraph.prototype.setConnectable = function(connectable) {
		this.connectionHandler.setEnabled(connectable);
	};
	mxGraph.prototype.isConnectable = function(connectable) {
		return this.connectionHandler.isEnabled();
	};
	mxGraph.prototype.setTooltips = function(enabled) {
		this.tooltipHandler.setEnabled(enabled);
	};
	mxGraph.prototype.setPanning = function(enabled) {
		this.panningHandler.panningEnabled = enabled;
	};
	mxGraph.prototype.isEditing = function(cell) {
		if (this.cellEditor != null) {
			var editingCell = this.cellEditor.getEditingCell();
			return (cell == null) ? editingCell != null : cell == editingCell;
		}
		return false;
	};
	mxGraph.prototype.isAutoSizeCell = function(cell) {
		return this.isAutoSizeCells();
	};
	mxGraph.prototype.isAutoSizeCells = function() {
		return this.autoSizeCells;
	};
	mxGraph.prototype.setAutoSizeCells = function(value) {
		this.autoSizeCells = value;
	};
	mxGraph.prototype.isExtendParent = function(cell) {
		return !this.getModel().isEdge(cell) && this.isExtendParents();
	};
	mxGraph.prototype.isExtendParents = function() {
		return this.extendParents;
	};
	mxGraph.prototype.setExtendParents = function(value) {
		this.extendParents = value;
	};
	mxGraph.prototype.isExtendParentsOnAdd = function() {
		return this.extendParentsOnAdd;
	};
	mxGraph.prototype.setExtendParentsOnAdd = function(value) {
		this.extendParentsOnAdd = value;
	};
	mxGraph.prototype.isConstrainChild = function(cell) {
		return this.isConstrainChildren();
	};
	mxGraph.prototype.isConstrainChildren = function() {
		return this.constrainChildren;
	};
	mxGraph.prototype.setConstrainChildren = function(value) {
		this.constrainChildren = value;
	};
	mxGraph.prototype.getOverlap = function(cell) {
		return (this.isAllowOverlapParent(cell)) ? this.defaultOverlap : 0;
	};
	mxGraph.prototype.isAllowOverlapParent = function(cell) {
		return false;
	};
	mxGraph.prototype.getFoldableCells = function(cells, collapse) {
		var self = this;
		return this.model.filterCells(cells, function(cell) {
					return self.isCellFoldable(cell, collapse);
				});
	};
	mxGraph.prototype.isCellFoldable = function(cell, collapse) {
		return this.model.getChildCount(cell) > 0;
	};
	mxGraph.prototype.isValidDropTarget = function(cell, cells, evt) {
		return cell != null
				&& ((this.isSplitEnabled() && this.isSplitTarget(cell, cells,
						evt)) || (!this.model.isEdge(cell) && (this
						.isSwimlane(cell) || (this.model.getChildCount(cell) > 0 && !this
						.isCellCollapsed(cell)))));
	};
	mxGraph.prototype.isSplitTarget = function(target, cells, evt) {
		if (this.model.isEdge(target)
				&& cells != null
				&& cells.length == 1
				&& this.isCellConnectable(cells[0])
				&& this.getEdgeValidationError(target, this.model.getTerminal(
								target, true), cells[0]) == null) {
			var src = this.model.getTerminal(target, true);
			var trg = this.model.getTerminal(target, false);
			return (!this.model.isAncestor(cells[0], src) && !this.model
					.isAncestor(cells[0], trg));
		}
		return false;
	};
	mxGraph.prototype.getDropTarget = function(cells, evt, cell) {
		if (!this.isSwimlaneNesting()) {
			for (var i = 0; i < cells.length; i++) {
				if (this.isSwimlane(cells[i])) {
					return null;
				}
			}
		}
		var pt = mxUtils.convertPoint(this.container, evt.clientX, evt.clientY);
		var swimlane = this.getSwimlaneAt(pt.x, pt.y);
		if (cell == null) {
			cell = swimlane;
		} else if (swimlane != null) {

			var tmp = this.model.getParent(swimlane);
			while (tmp != null && this.isSwimlane(tmp) && tmp != cell) {
				tmp = this.model.getParent(tmp);
			}
			if (tmp == cell) {
				cell = swimlane;
			}
		}
		while (cell != null && !this.isValidDropTarget(cell, cells, evt)
				&& !this.model.isLayer(cell)) {
			cell = this.model.getParent(cell);
		}
		return (!this.model.isLayer(cell)) ? cell : null;
	};

	mxGraph.prototype.getDefaultParent = function() {
		var parent = this.defaultParent;
		if (parent == null) {
			parent = this.getCurrentRoot();
			if (parent == null) {
				var root = this.model.getRoot();
				parent = this.model.getChildAt(root, 0);
			}
		}
		return parent;
	};
	mxGraph.prototype.setDefaultParent = function(cell) {
		this.defaultParent = cell;
	};
	mxGraph.prototype.getSwimlane = function(cell) {
		while (cell != null && !this.isSwimlane(cell)) {
			cell = this.model.getParent(cell);
		}
		return cell;
	};
	mxGraph.prototype.getSwimlaneAt = function(x, y, parent) {
		parent = parent || this.getDefaultParent();
		if (parent != null) {
			var childCount = this.model.getChildCount(parent);
			for (var i = 0; i < childCount; i++) {
				var child = this.model.getChildAt(parent, i);
				var result = this.getSwimlaneAt(x, y, child);
				if (result != null) {
					return result;
				} else if (this.isSwimlane(child)) {
					var state = this.view.getState(child);
					if (this.isCellVisible(child)
							&& this.intersects(state, x, y)) {
						return child;
					}
				}
			}
		}
		return null;
	};
	mxGraph.prototype.getCellAt = function(x, y, parent, vertices, edges) {
		vertices = vertices || true;
		edges = edges || true;
		parent = parent || this.getDefaultParent();
		if (parent != null) {
			var childCount = this.model.getChildCount(parent);
			for (var i = childCount - 1; i >= 0; i--) {
				var cell = this.model.getChildAt(parent, i);
				var result = this.getCellAt(x, y, cell, vertices, edges);
				if (result != null) {
					return result;
				} else {
					if (this.isCellVisible(cell)
							&& (edges && this.model.isEdge(cell) || vertices
									&& this.model.isVertex(cell))) {
						var state = this.view.getState(cell);
						if (this.intersects(state, x, y)) {
							return cell;
						}
					}
				}
			}
		}
		return null;
	};
	mxGraph.prototype.intersects = function(state, x, y) {
		if (state != null) {
			var pts = state.absolutePoints;
			if (pts != null) {
				var t2 = this.tolerance * this.tolerance;
				var pt = pts[0];
				for (var i = 1; i < pts.length; i++) {
					var next = pts[i];
					var dist = mxUtils.ptSegDistSq(pt.x, pt.y, next.x, next.y,
							x, y);
					if (dist <= t2) {
						return true;
					}
					pt = next;
				}
			} else if (mxUtils.contains(state, x, y)) {
				return true;
			}
		}
		return false;
	};
	mxGraph.prototype.hitsSwimlaneContent = function(swimlane, x, y) {
		var state = this.getView().getState(swimlane);
		var size = this.getStartSize(swimlane);
		if (state != null) {
			var scale = this.getView().getScale();
			x -= state.x;
			y -= state.y;
			if (size.width > 0 && x > 0 && x > size.width * scale) {
				return true;
			} else if (size.height > 0 && y > 0 && y > size.height * scale) {
				return true;
			}
		}
		return false;
	};
	mxGraph.prototype.getChildVertices = function(parent) {
		return this.getChildCells(parent, true, false);
	}
	mxGraph.prototype.getChildEdges = function(parent) {
		return this.getChildCells(parent, false, true);
	}
	mxGraph.prototype.getChildCells = function(parent, vertices, edges) {
		parent = (parent != null) ? parent : this.getDefaultParent();
		vertices = (vertices != null) ? vertices : false;
		edges = (edges != null) ? edges : false;
		var cells = this.model.getChildCells(parent, vertices, edges);
		var result = new Array();
		for (var i = 0; i < cells.length; i++) {
			if (this.isCellVisible(cells[i])) {
				result.push(cells[i]);
			}
		}
		return result;
	}
	mxGraph.prototype.getConnections = function(cell, parent) {
		return this.getEdges(cell, parent, true, true, false);
	}
	mxGraph.prototype.getIncomingEdges = function(cell, parent) {
		return this.getEdges(cell, parent, true, false, false);
	}
	mxGraph.prototype.getOutgoingEdges = function(cell, parent) {
		return this.getEdges(cell, parent, false, true, false);
	}
	mxGraph.prototype.getEdges = function(cell, parent, incoming, outgoing,
			includeLoops) {
		incoming = (incoming != null) ? incoming : true;
		outgoing = (outgoing != null) ? outgoing : true;
		includeLoops = (includeLoops != null) ? includeLoops : true;
		var edges = new Array();
		var isCollapsed = this.isCellCollapsed(cell);
		var childCount = this.model.getChildCount(cell);
		for (var i = 0; i < childCount; i++) {
			var child = this.model.getChildAt(cell, i);
			if (isCollapsed || !this.isCellVisible(child)) {
				edges = edges.concat(this.model.getEdges(child, incoming,
						outgoing));
			}
		}
		edges = edges.concat(this.model.getEdges(cell, incoming, outgoing));
		var result = new Array();
		for (var i = 0; i < edges.length; i++) {
			var source = this.view.getVisibleTerminal(edges[i], true);
			var target = this.view.getVisibleTerminal(edges[i], false);
			if (includeLoops
					|| ((source != target)
							&& (incoming && target == cell && (parent == null || this.model
									.getParent(source) == parent)) || (outgoing
							&& source == cell && (parent == null || this.model
							.getParent(target) == parent)))) {
				result.push(edges[i]);
			}
		}
		return result;
	}
	mxGraph.prototype.getOpposites = function(edges, terminal, sources, targets) {
		sources = (sources != null) ? sources : true;
		targets = (targets != null) ? targets : true;
		var terminals = new Array();

		var hash = new Object();
		if (edges != null) {
			for (var i = 0; i < edges.length; i++) {
				var source = this.view.getVisibleTerminal(edges[i], true);
				var target = this.view.getVisibleTerminal(edges[i], false);

				if (source == terminal && target != null && target != terminal
						&& targets) {
					var id = mxCellPath.create(target);
					if (hash[id] == null) {
						hash[id] = target;
						terminals.push(target);
					}
				}

				else if (target == terminal && source != null
						&& source != terminal && sources) {
					var id = mxCellPath.create(source);
					if (hash[id] == null) {
						hash[id] = source;
						terminals.push(source);
					}
				}
			}
		}
		return terminals;
	}
	mxGraph.prototype.getEdgesBetween = function(source, target, directed) {
		var edges = this.getEdges(source);
		var result = new Array();

		for (var i = 0; i < edges.length; i++) {
			var src = this.view.getVisibleTerminal(edges[i], true);
			var trg = this.view.getVisibleTerminal(edges[i], false);
			if (trg == target || (!directed && src == target)) {
				result.push(edges[i]);
			}
		}
		return result;
	}
	mxGraph.prototype.getPointForEvent = function(evt) {
		var p = mxUtils.convertPoint(this.container, evt.clientX, evt.clientY);
		var s = this.view.scale;
		var tr = this.view.translate;
		p.x = this.snap(p.x / s - tr.x - this.gridSize / 2);
		p.y = this.snap(p.y / s - tr.y - this.gridSize / 2);
		return p;
	};
	mxGraph.prototype.getCells = function(x, y, width, height, parent, result) {
		var result = result || new Array();
		if (width > 0 || height > 0) {
			var right = x + width;
			var bottom = y + height;
			parent = parent || this.getDefaultParent();
			if (parent != null) {
				var childCount = this.model.getChildCount(parent);
				for (var i = 0; i < childCount; i++) {
					var cell = this.model.getChildAt(parent, i);
					var state = this.view.getState(cell);
					if (this.isCellVisible(cell) && state != null) {
						if (state.x >= x && state.y >= y
								&& state.x + state.width <= right
								&& state.y + state.height <= bottom) {
							result.push(cell);
						} else {
							this.getCells(x, y, width, height, cell, result);
						}
					}
				}
			}
		}
		return result;
	};
	mxGraph.prototype.getCellsBeyond = function(x0, y0, parent, rightHalfpane,
			bottomHalfpane) {
		var result = new Array();
		if (rightHalfpane || bottomHalfpane) {
			if (parent == null) {
				parent = this.getDefaultParent();
			}
			if (parent != null) {
				var childCount = this.model.getChildCount(parent);
				for (var i = 0; i < childCount; i++) {
					var child = this.model.getChildAt(parent, i);
					var state = this.view.getState(child);
					if (this.isCellVisible(child) && state != null) {
						if ((!rightHalfpane || state.x >= x0)
								&& (!bottomHalfpane || state.y >= y0)) {
							result.push(child);
						}
					}
				}
			}
		}
		return result;
	};
	mxGraph.prototype.findTreeRoots = function(parent, isolate, invert) {
		isolate = (isolate != null) ? isolate : false;
		invert = (invert != null) ? invert : false;
		var roots = new Array();
		if (parent != null) {
			var model = this.getModel();
			var childCount = model.getChildCount(parent);
			var best = null;
			var maxDiff = 0;
			for (var i = 0; i < childCount; i++) {
				var cell = model.getChildAt(parent, i);
				if (this.model.isVertex(cell) && this.isCellVisible(cell)) {
					var conns = this.getConnections(cell, (isolate)
									? parent
									: null);
					var fanOut = 0;
					var fanIn = 0;
					for (var j = 0; j < conns.length; j++) {
						var src = this.view.getVisibleTerminal(conns[j], true);
						if (src == cell) {
							fanOut++;
						} else {
							fanIn++;
						}
					}
					if ((invert && fanOut == 0 && fanIn > 0)
							|| (!invert && fanIn == 0 && fanOut > 0)) {
						roots.push(cell);
					}
					var diff = (invert) ? fanIn - fanOut : fanOut - fanIn;
					if (diff > maxDiff) {
						maxDiff = diff;
						best = cell;
					}
				}
			}
			if (roots.length == 0 && best != null) {
				roots.push(best);
			}
		}
		return roots;
	};
	mxGraph.prototype.traverse = function(vertex, directed, func, edge, visited) {
		if (func != null && vertex != null) {
			directed = (directed != null) ? directed : true;
			visited = visited || new Array();
			var id = mxCellPath.create(vertex);
			if (visited[id] == null) {
				visited[id] = vertex;
				var result = func(vertex, edge);
				if (result == null || result) {
					var edgeCount = this.model.getEdgeCount(vertex);
					if (edgeCount > 0) {
						for (var i = 0; i < edgeCount; i++) {
							var e = this.model.getEdgeAt(vertex, i);
							var isSource = this.model.getTerminal(e, true) == vertex;
							if (!directed || isSource) {
								var next = this.model.getTerminal(e, !isSource);
								this.traverse(next, directed, func, e, visited);
							}
						}
					}
				}
			}
		}
	};

	mxGraph.prototype.isCellSelected = function(cell) {
		return this.getSelectionModel().isSelected(cell);
	};
	mxGraph.prototype.isSelectionEmpty = function() {
		return this.getSelectionModel().isEmpty();
	};
	mxGraph.prototype.clearSelection = function() {
		return this.getSelectionModel().clear();
	};
	mxGraph.prototype.getSelectionCount = function() {
		return this.getSelectionModel().cells.length;
	};
	mxGraph.prototype.getSelectionCell = function() {
		return this.getSelectionModel().cells[0];
	};
	mxGraph.prototype.getSelectionCells = function() {
		return this.getSelectionModel().cells.slice();
	};
	mxGraph.prototype.setSelectionCell = function(cell) {
		this.getSelectionModel().setCell(cell);
	};
	mxGraph.prototype.setSelectionCells = function(cells) {
		this.getSelectionModel().setCells(cells);
	};
	mxGraph.prototype.addSelectionCell = function(cell) {
		this.getSelectionModel().addCell(cell);
	};
	mxGraph.prototype.addSelectionCells = function(cells) {
		this.getSelectionModel().addCells(cells);
	};
	mxGraph.prototype.removeSelectionCell = function(cell) {
		this.getSelectionModel().removeCell(cell);
	};
	mxGraph.prototype.removeSelectionCells = function(cells) {
		this.getSelectionModel().removeCells(cells);
	};
	mxGraph.prototype.selectRegion = function(rect, evt) {
		var cells = this.getCells(rect.x, rect.y, rect.width, rect.height);
		this.selectCellsForEvent(cells, evt);
		return cells;
	};
	mxGraph.prototype.selectNextCell = function() {
		this.selectCell(true);
	}
	mxGraph.prototype.selectPreviousCell = function() {
		this.selectCell();
	}
	mxGraph.prototype.selectParentCell = function() {
		this.selectCell(false, true);
	}
	mxGraph.prototype.selectChildCell = function() {
		this.selectCell(false, false, true);
	}
	mxGraph.prototype.selectCell = function(isNext, isParent, isChild) {
		var sel = this.selectionModel;
		var cell = (sel.cells.length > 0) ? sel.cells[0] : null;
		if (sel.cells.length > 1) {
			sel.clear();
		}
		var parent = (cell != null) ? this.model.getParent(cell) : this
				.getDefaultParent();
		var childCount = this.model.getChildCount(parent);
		if (cell == null && childCount > 0) {
			var child = this.model.getChildAt(parent, 0);
			this.setSelectionCell(child);
		} else if ((cell == null || isParent)
				&& this.view.getState(parent) != null
				&& this.model.getGeometry(parent) != null) {
			if (this.getCurrentRoot() != parent) {
				this.setSelectionCell(parent);
			}
		} else if (cell != null && isChild) {
			var tmp = this.model.getChildCount(cell);
			if (tmp > 0) {
				var child = this.model.getChildAt(cell, 0);
				this.setSelectionCell(child);
			}
		} else if (childCount > 0) {
			var i = parent.getIndex(cell);
			if (isNext) {
				i++;
				var child = this.model.getChildAt(parent, i % childCount);
				this.setSelectionCell(child);
			} else {
				i--;
				var index = (i < 0) ? childCount - 1 : i;
				var child = this.model.getChildAt(parent, index);
				this.setSelectionCell(child);
			}
		}
	};
	mxGraph.prototype.selectAll = function(parent) {
		parent = parent || this.getDefaultParent();
		var children = this.model.getChildren(parent);
		if (children != null) {
			this.setSelectionCells(children);
		}
	};
	mxGraph.prototype.selectVertices = function(parent) {
		this.selectCells(true, false, parent);
	};
	mxGraph.prototype.selectEdges = function(parent) {
		this.selectCells(false, true, parent);
	};
	mxGraph.prototype.selectCells = function(vertices, edges, parent) {
		parent = parent || this.getDefaultParent();
		var self = this;
		var filter = function(cell) {
			return self.view.getState(cell) != null
					&& self.model.getChildCount(cell) == 0
					&& ((self.model.isVertex(cell) && vertices) || (self.model
							.isEdge(cell) && edges));
		}
		var cells = this.model.filterDescendants(filter, parent);
		this.setSelectionCells(cells);
	};
	mxGraph.prototype.selectCellForEvent = function(cell, evt) {
		var isSelected = this.isCellSelected(cell);
		if (this.isToggleEvent(evt)) {
			if (isSelected) {
				this.removeSelectionCell(cell);
			} else {
				this.addSelectionCell(cell);
			}
		} else if (!isSelected || this.getSelectionCount() != 1) {
			this.setSelectionCell(cell);
		}
	};
	mxGraph.prototype.selectCellsForEvent = function(cells, evt) {
		if (this.isToggleEvent(evt)) {
			this.addSelectionCells(cells);
		} else {
			this.setSelectionCells(cells);
		}
	};

	mxGraph.prototype.createHandler = function(state) {
		if (state != null) {
			if (this.model.isEdge(state.cell)) {
				var style = this.view.getEdgeStyle(state);
				if (this.isLoop(state) || style == mxEdgeStyle.ElbowConnector
						|| style == mxEdgeStyle.SideToSide
						|| style == mxEdgeStyle.TopToBottom) {
					state.handler = new mxElbowEdgeHandler(state);
				} else {
					state.handler = new mxEdgeHandler(state);
				}
			} else {
				state.handler = new mxVertexHandler(state);
			}
		}
	};
	mxGraph.prototype.redrawHandler = function(state) {
		if (state != null && state.handler != null) {
			state.handler.redraw();
		}
	};
	mxGraph.prototype.hasHandler = function(state) {
		return state != null && state.handler != null;
	};
	mxGraph.prototype.destroyHandler = function(state) {
		if (state != null && state.handler != null) {
			state.handler.destroy();
			state.handler = null;
		}
	};

	mxGraph.prototype.addMouseListener = function(listener) {
		if (this.mouseListeners == null) {
			this.mouseListeners = new Array();
		}
		this.mouseListeners.push(listener);
	};
	mxGraph.prototype.removeMouseListener = function(listener) {
		if (this.mouseListeners != null) {
			for (var i = 0; i < this.mouseListeners.length; i++) {
				if (this.mouseListeners[i] == listener) {
					this.mouseListeners.splice(i, 1);
					break;
				}
			}
		}
	};
	mxGraph.prototype.fireMouseEvent = function(evtName, me, source) {
		if (source == null) {
			source = this;
		}

		if (!true && evtName == mxEvent.MOUSE_DOWN
				&& this.activeElement != null) {
			this.activeElement.blur();
		}

		if (evtName == mxEvent.MOUSE_DOWN) {
			this.isMouseDown = true;
		}
		if ((evtName != mxEvent.MOUSE_UP || this.isMouseDown)
				&& me.getEvent().detail != 2) {
			if (evtName == mxEvent.MOUSE_UP) {
				this.isMouseDown = false;
			}
			if (!this.isEditing()
					&& (false || false || false || me.getEvent().target != this.container)) {
				if (evtName == mxEvent.MOUSE_MOVE && this.isMouseDown
						&& this.autoScroll) {
					var pt = mxUtils.convertPoint(this.container, me.getX(), me
									.getY());
					this.scrollPointToVisible(pt.x, pt.y, this.autoExtend);
				}
				if (this.mouseListeners != null) {
					var args = [source, me];
					me.getEvent().returnValue = true;
					for (var i = 0; i < this.mouseListeners.length; i++) {
						var l = this.mouseListeners[i];
						if (evtName == mxEvent.MOUSE_DOWN) {
							l.mouseDown.apply(l, args);
						} else if (evtName == mxEvent.MOUSE_MOVE) {
							l.mouseMove.apply(l, args);
						} else if (evtName == mxEvent.MOUSE_UP) {
							l.mouseUp.apply(l, args);
						}
					}
				}
				if (evtName == mxEvent.MOUSE_UP) {
					this.click(me.getEvent(), me.getCell());
				}
			}
		}
	};
	// jiang 20101118 graph destroy
	mxGraph.prototype.destroy = function() {
		if (!this.destroyed) {
			// alert('ok');
			this.destroyed = true;
			if (this.tooltipHandler != null) {
				this.tooltipHandler.destroy();
				this.tooltipHandler=null;
			}
			if (this.panningHandler != null) {
				this.panningHandler.destroy();
				this.panningHandler=null;
			}
			if (this.connectionHandler != null) {
				this.connectionHandler.destroy();
				this.connectionHandler=null;
			}
			if (this.graphHandler != null) {
				this.graphHandler.destroy();
				this.graphHandler=null;
			}
			if (this.cellEditor != null) {
				this.cellEditor.destroy();
				this.cellEditor=null;
			}
			if (this.view != null) {
				this.view.destroy();
				this.view=null;
			}
			if (this.focusHandler != null) {
				mxEvent.removeListener(document.body, 'focus',
						this.focusHandler);
				this.focusHandler = null;
			}
			if (this.blurHandler != null) {
				mxEvent.removeListener(document.body, 'blur', this.blurHandler);
				this.blurHandler = null;
			}
			this.activeElement = null;
			this.container = null;
		}
	};
}

{
	function mxCellOverlay(image, tooltip, align, verticalAlign) {
		this.image = image;
		this.tooltip = tooltip;
		this.align = align;
		this.verticalAlign = verticalAlign;
	};
	mxCellOverlay.prototype = new mxEventSource();
	mxCellOverlay.prototype.constructor = mxCellOverlay;
	mxCellOverlay.prototype.image = null;
	mxCellOverlay.prototype.tooltip = null;
	mxCellOverlay.prototype.align = null;
	mxCellOverlay.prototype.verticalAlign = null;
	mxCellOverlay.prototype.defaultOverlap = 0.5;
	mxCellOverlay.prototype.getBounds = function(state) {
		var isEdge = state.view.graph.getModel().isEdge(state.cell);
		var s = state.view.scale;
		var pt = null;
		var w = this.image.width;
		var h = this.image.height;
		if (isEdge) {
			var pts = state.absolutePoints;
			if (pts.length % 2 == 1) {
				pt = pts[pts.length / 2 + 1];
			} else {
				var idx = pts.length / 2;
				var p0 = pts[idx - 1];
				var p1 = pts[idx];
				pt = new mxPoint(p0.x + (p1.x - p0.x) / 2, p0.y + (p1.y - p0.y)
								/ 2);
			}
		} else {
			pt = new mxPoint();
			if (this.align == mxConstants.ALIGN_LEFT) {
				pt.x = state.x;
			} else if (this.align == mxConstants.ALIGN_CENTER) {
				pt.x = state.x + state.width / 2;
			} else {
				pt.x = state.x + state.width;
			}
			if (this.verticalAlign == mxConstants.ALIGN_TOP) {
				pt.y = state.y;
			} else if (this.verticalAlign == mxConstants.ALIGN_MIDDLE) {
				pt.y = state.y + state.height / 2;
			} else {
				pt.y = state.y + state.height;
			}
		}
		return new mxRectangle(pt.x - w * this.defaultOverlap * s, pt.y - h
						* this.defaultOverlap * s, w * s, h * s);
	};
	mxCellOverlay.prototype.toString = function() {
		return this.tooltip;
	};
}

{
	function mxOutline(graph, container) {
		this.source = graph;
		this.graph = new mxGraph(container, graph.getModel(),
				this.graphRenderHint);
		if(!mxClient.IS_IE) {
			var node = this.graph.getView().getCanvas().parentNode;
			node.setAttribute('shape-rendering', 'optimizeSpeed');
			node.setAttribute('image-rendering', 'optimizeSpeed');
		}
		this.graph.setStylesheet(graph.getStylesheet());
		this.graph.setEnabled(false);
		this.graph.labelsVisible = false;
		var self = this;
		graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt) {
					self.update();
				});
		this.graph.addMouseListener(this);
		var self = this;
		var funct = function(sender) {
			self.update();
		};
		this.source.getModel().addListener(mxEvent.CHANGE, funct);
		var view = this.source.getView();
		view.addListener(mxEvent.SCALE, funct);
		view.addListener(mxEvent.TRANSLATE, funct);
		view.addListener(mxEvent.SCALE_AND_TRANSLATE, funct);
		view.addListener(mxEvent.DOWN, funct);
		view.addListener(mxEvent.UP, funct);
		graph.addListener(mxEvent.REFRESH, function(sender) {
					self.graph.setStylesheet(graph.getStylesheet());
					self.graph.refresh();
				});
		this.bounds = new mxRectangle(0, 0, 0, 0);
		this.selectionBorder = new mxRectangleShape(this.bounds, null,
				mxConstants.OUTLINE_COLOR, mxConstants.OUTLINE_STROKEWIDTH);

		this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG)
				? mxConstants.DIALECT_VML
				: mxConstants.DIALECT_SVG;
		this.selectionBorder.init(this.graph.getView().getOverlayPane());
		var s = 3;
		this.sizer = new mxRectangleShape(this.bounds,
				mxConstants.OUTLINE_HANDLE_FILLCOLOR,
				mxConstants.OUTLINE_HANDLE_STROKECOLOR);
		this.sizer.dialect = this.graph.dialect;
		this.sizer.init(this.graph.getView().getOverlayPane());
		if (this.enabled) {
			this.sizer.node.style.cursor = 'pointer';
		}
		mxEvent.addListener(this.sizer.node, 'mousedown', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
							new mxMouseEvent(evt, null, 0));
				});
		this.selectionBorder.node.style.display = (this.showViewport)
				? ''
				: 'none';
		this.sizer.node.style.display = this.selectionBorder.node.style.display;
		this.refresh();
	};
	mxOutline.prototype.graphRenderHint = mxConstants.RENDERING_HINT_FASTER;
	mxOutline.prototype.enabled = true;
	mxOutline.prototype.showViewport = true;
	mxOutline.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxOutline.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxOutline.prototype.refresh = function(revalidate) {
		this.update();
		this.graph.refresh();
	};
	mxOutline.prototype.update = function(revalidate) {
		var bounds = this.source.getGraphBounds();
		var mw = parseInt(this.source.container.clientWidth);
		var mh = parseInt(this.source.container.clientHeight);
		var c = this.graph.container;
		var cw = parseInt(c.clientWidth);
		var ch = parseInt(c.clientHeight);
		if (cw > 0 || ch > 0) {
			var w = Math.max(mw, bounds.width + Math.abs(bounds.x)) + cw * 0.1;
			var h = Math.max(mh, bounds.height + Math.abs(bounds.y)) + ch * 0.1;
			var scale = Math.min(cw / w, ch / h);
			if (this.graph.getView().scale != scale) {
				this.graph.getView().scale = scale
				revalidate = true;
			}
		}
		var navView = this.graph.getView();
		if (navView.currentRoot != this.source.getView().currentRoot) {
			navView.setCurrentRoot(this.source.getView().currentRoot);
		}
		var t = this.source.view.translate;
		var tx = Math.max(0, t.x);
		var ty = Math.max(0, t.y);
		if (navView.translate.x != tx || navView.translate.y != ty) {
			navView.translate.x = tx;
			navView.translate.y = ty;
			revalidate = true;
		}
		var t2 = navView.translate;
		var scale = this.source.getView().scale;
		var scale2 = scale / navView.scale;
		var scale3 = 1.0 / navView.scale;
		var container = this.source.container;
		this.bounds = new mxRectangle((t2.x - t.x) / scale3, (t2.y - t.y)
						/ scale3, (container.clientWidth / scale2),
				(container.clientHeight / scale2));
		this.bounds.x += this.source.container.scrollLeft * navView.scale
				/ scale;
		this.bounds.y += this.source.container.scrollTop * navView.scale
				/ scale;
		this.selectionBorder.bounds = this.bounds;
		this.selectionBorder.redraw();
		var s = 3;
		this.sizer.bounds = new mxRectangle(this.bounds.x + this.bounds.width
						- s, this.bounds.y + this.bounds.height - s, 2 * s, 2
						* s);
		this.sizer.redraw();
		if (revalidate) {
			this.graph.view.revalidate();
		}
	};
	mxOutline.prototype.mouseDown = function(sender, me) {
		if (this.enabled && this.showViewport) {
			this.index = me.getHandle();
			this.startX = me.getX();
			this.startY = me.getY();
			this.active = true;
			if (mxUtils.hasScrollbars(this.source.container)) {
				this.dx0 = this.source.container.scrollLeft;
				this.dy0 = this.source.container.scrollTop;
			} else {
				this.dx0 = 0;
				this.dy0 = 0;
			}
		}
		me.consume();
	};
	mxOutline.prototype.mouseMove = function(sender, me) {
		if (this.active) {
			this.selectionBorder.node.style.display = (this.showViewport)
					? ''
					: 'none';
			this.sizer.node.style.display = this.selectionBorder.node.style.display;
			var dx = me.getX() - this.startX;
			var dy = me.getY() - this.startY;
			var bounds = null;
			if (this.index == null) {
				var scale = this.graph.getView().scale;
				bounds = new mxRectangle(this.bounds.x + dx,
						this.bounds.y + dy, this.bounds.width,
						this.bounds.height);
				this.selectionBorder.bounds = bounds;
				this.selectionBorder.redraw();
				dx /= scale;
				dx *= this.source.getView().scale;
				dy /= scale;
				dy *= this.source.getView().scale;
				this.source.panGraph(-dx - this.dx0, -dy - this.dy0);
			} else {
				var container = this.source.container;
				var viewRatio = container.clientWidth / container.clientHeight;
				dy = dx / viewRatio;
				bounds = new mxRectangle(this.bounds.x, this.bounds.y,
						this.bounds.width + dx, this.bounds.height + dy);
				this.selectionBorder.bounds = bounds;
				this.selectionBorder.redraw();
			}
			var s = 3;
			this.sizer.bounds = new mxRectangle(bounds.x + bounds.width - s,
					bounds.y + bounds.height - s, 2 * s, 2 * s);
			this.sizer.redraw();
			me.consume();
		}
	};
	mxOutline.prototype.mouseUp = function(sender, me) {
		if (this.active) {
			var dx = me.getX() - this.startX;
			var dy = me.getY() - this.startY;
			if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
				if (this.index == null) {

					if (!mxUtils.hasScrollbars(this.source.container)) {
						this.source.panGraph(0, 0);
						dx /= this.graph.getView().scale;
						dy /= this.graph.getView().scale;
						var t = this.source.getView().translate;
						this.source.getView().setTranslate(t.x - dx, t.y - dy);
					}
				} else {
					var w = this.selectionBorder.bounds.width;
					var h = this.selectionBorder.bounds.height;
					var scale = this.source.getView().scale;
					this.source.getView().setScale(scale - (dx * scale) / w);
				}
				this.update();
				me.consume();
			}
			this.index = null;
			this.active = false;
		}
	};
}

{
	function mxMultiplicity(source, type, attr, value, min, max,
			validNeighbors, countError, typeError, validNeighborsAllowed) {
		this.source = source;
		this.type = type;
		this.attr = attr;
		this.value = value;
		this.min = (min != null) ? min : 0;
		this.max = (max != null) ? max : 'n';
		this.validNeighbors = validNeighbors;
		this.countError = mxResources.get(countError) || countError;
		this.typeError = mxResources.get(typeError) || typeError;
		this.validNeighborsAllowed = (validNeighborsAllowed != null)
				? validNeighborsAllowed
				: true;
	};
	mxMultiplicity.prototype.type = null;
	mxMultiplicity.prototype.attr = null;
	mxMultiplicity.prototype.value = null;
	mxMultiplicity.prototype.source = null;
	mxMultiplicity.prototype.min = null;
	mxMultiplicity.prototype.max = null;
	mxMultiplicity.prototype.validNeighbors = null;
	mxMultiplicity.prototype.validNeighborsAllowed = true;
	mxMultiplicity.prototype.countError = null;
	mxMultiplicity.prototype.typeError = null;
	mxMultiplicity.prototype.check = function(graph, edge, source, target,
			sourceOut, targetIn) {
		var sourceValue = graph.model.getValue(source);
		var targetValue = graph.model.getValue(target);
		var error = '';
		if ((this.source && this.checkType(graph, sourceValue, this.type,
				this.attr, this.value))
				|| (!this.source && this.checkType(graph, targetValue,
						this.type, this.attr, this.value))) {
			if (this.countError != null
					&& ((this.source && (this.max == 0 || (sourceOut >= this.max))) || (!this.source && (this.max == 0 || (targetIn >= this.max))))) {
				error += this.countError + '\n';
			}
			var valid = this.validNeighbors;
			if (valid != null && valid.length > 0) {
				var isValid = !this.validNeighborsAllowed;
				for (var j = 0; j < valid.length; j++) {
					if (this.source
							&& this.checkType(graph, targetValue, valid[j])) {
						isValid = this.validNeighborsAllowed;
						break;
					} else if (!this.source
							&& this.checkType(graph, sourceValue, valid[j])) {
						isValid = this.validNeighborsAllowed;
						break;
					}
				}
				if (!isValid && this.typeError != null) {
					error += this.typeError + '\n';
				}
			}
		}
		return (error.length > 0) ? error : null;
	};
	mxMultiplicity.prototype.checkType = function(graph, value, type, attr,
			attrValue) {
		if (value != null) {
			if (!isNaN(value.nodeType)) {
				return mxUtils.isNode(value, type, attr, attrValue);
			} else {
				return value == type;
			}
		}
		return false;
	};
}

{
	function mxLayoutManager(graph) {
		var self = this;

		this.undoHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.beforeUndo(evt.getArgAt(0));
			}
		};
		this.moveHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.cellsMoved(evt.getArgAt(0), evt.getArgAt(5));
			}
		};
		this.setGraph(graph);
	};
	mxLayoutManager.prototype = new mxEventSource();
	mxLayoutManager.prototype.constructor = mxLayoutManager;
	mxLayoutManager.prototype.graph = null;
	mxLayoutManager.prototype.bubbling = true;
	mxLayoutManager.prototype.enabled = true;
	mxLayoutManager.prototype.updateHandler = null;
	mxLayoutManager.prototype.moveHandler = null;
	mxLayoutManager.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxLayoutManager.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxLayoutManager.prototype.isBubbling = function() {
		return this.bubbling;
	};
	mxLayoutManager.prototype.setBubbling = function(value) {
		this.bubbling = value;
	};
	mxLayoutManager.prototype.getGraph = function() {
		return this.graph;
	};
	mxLayoutManager.prototype.setGraph = function(graph) {
		if (this.graph != null) {
			var model = this.graph.getModel();
			model.removeListener(this.undoHandler);
			this.graph.removeListener(this.moveHandler);
		}
		this.graph = graph;
		if (this.graph != null) {
			var model = this.graph.getModel();
			model.addListener(mxEvent.BEFORE_UNDO, this.undoHandler);
			this.graph.addListener(mxEvent.MOVE_CELLS, this.moveHandler);
		}
	};
	mxLayoutManager.prototype.getLayout = function(parent) {
		return null;
	};
	mxLayoutManager.prototype.beforeUndo = function(undoableEdit) {
		var cells = this.getCellsForChanges(undoableEdit.changes);
		var model = this.getGraph().getModel();
		if (this.isBubbling()) {
			var tmp = model.getParents(cells);
			while (tmp.length > 0) {
				cells = cells.concat(tmp);
				tmp = model.getParents(tmp);
			}
		}
		this.layoutCells(mxUtils.sortCells(cells, false));
	};
	mxLayoutManager.prototype.cellsMoved = function(cells, evt) {
		if (cells != null && evt != null) {
			var point = mxUtils.convertPoint(this.getGraph().container,
					evt.clientX, evt.clientY);
			var model = this.getGraph().getModel();
			for (var i = 0; i < cells.length; i++) {
				var layout = this.getLayout(model.getParent(cells[i]));
				if (layout != null) {
					layout.moveCell(cells[i], point.x, point.y);
				}
			}
		}
	};
	mxLayoutManager.prototype.getCellsForChanges = function(changes) {
		var result = new Array();
		var hash = new Object();
		for (var i = 0; i < changes.length; i++) {
			var change = changes[i];
			if (change instanceof mxRootChange) {
				return new Array();
			} else {
				var cells = this.getCellsForChange(change);
				for (var j = 0; j < cells.length; j++) {
					if (cells[j] != null) {
						var id = mxCellPath.create(cells[j]);
						if (hash[id] == null) {
							hash[id] = cells[j];
							result.push(cells[j]);
						}
					}
				}
			}
		}
		return result;
	};
	mxLayoutManager.prototype.getCellsForChange = function(change) {
		var model = this.getGraph().getModel();
		if (change.constructor == mxChildChange) {
			return [change.child, change.previous,
					model.getParent(change.child)];
		} else if (change.constructor == mxTerminalChange
				|| change.constructor == mxGeometryChange) {
			return [change.cell, model.getParent(change.cell)];
		}
		return [];
	};
	mxLayoutManager.prototype.layoutCells = function(cells) {
		if (cells.length > 0) {
			var model = this.getGraph().getModel();
			model.beginUpdate();
			try {
				var last = null;
				for (var i = 0; i < cells.length; i++) {
					if (cells[i] != model.getRoot() && cells[i] != last) {
						last = cells[i];
						this.executeLayout(this.getLayout(last), last);
					}
				}
				this
						.fireEvent(mxEvent.LAYOUT_CELLS,
								new mxEventObject([cells]));
			} finally {
				model.endUpdate();
			}
		}
	};
	mxLayoutManager.prototype.executeLayout = function(layout, parent) {
		if (layout != null && parent != null) {
			layout.execute(parent);
		}
	};
	mxLayoutManager.prototype.destroy = function() {
		this.setGraph(null);
	};
}

{
	function mxSpaceManager(graph, shiftRightwards, shiftDownwards,
			extendParents) {
		var self = this;
		this.resizeHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.cellsResized(evt.getArgAt(0));
			}
		};
		this.foldHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.cellsResized(evt.getArgAt(2));
			}
		};
		this.shiftRightwards = (shiftRightwards != null)
				? shiftRightwards
				: true;
		this.shiftDownwards = (shiftDownwards != null) ? shiftDownwards : true;
		this.extendParents = (extendParents != null) ? extendParents : true;
		this.setGraph(graph);
	};
	mxSpaceManager.prototype = new mxEventSource();
	mxSpaceManager.prototype.constructor = mxSpaceManager;
	mxSpaceManager.prototype.graph = null;
	mxSpaceManager.prototype.enabled = true;
	mxSpaceManager.prototype.shiftRightwards = true;
	mxSpaceManager.prototype.shiftDownwards = true;
	mxSpaceManager.prototype.extendParents = true;
	mxSpaceManager.prototype.resizeHandler = null;
	mxSpaceManager.prototype.foldHandler = null;
	mxSpaceManager.prototype.isCellIgnored = function(cell) {
		return !this.getGraph().getModel().isVertex(cell);
	};
	mxSpaceManager.prototype.isCellShiftable = function(cell) {
		return this.getGraph().getModel().isVertex(cell)
				&& this.getGraph().isCellMovable(cell);
	};
	mxSpaceManager.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxSpaceManager.prototype.setEnabled = function(value) {
		this.enabled = value;
	};
	mxSpaceManager.prototype.isShiftRightwards = function() {
		return this.shiftRightwards;
	};
	mxSpaceManager.prototype.setShiftRightwards = function(value) {
		this.shiftRightwards = value;
	};
	mxSpaceManager.prototype.isShiftDownwards = function() {
		return this.shiftDownwards;
	};
	mxSpaceManager.prototype.setShiftDownwards = function(value) {
		this.shiftDownwards = value;
	};
	mxSpaceManager.prototype.isExtendParents = function() {
		return this.extendParents;
	};
	mxSpaceManager.prototype.setExtendParents = function(value) {
		this.extendParents = value;
	};
	mxSpaceManager.prototype.getGraph = function() {
		return this.graph;
	};
	mxSpaceManager.prototype.setGraph = function(graph) {
		if (this.graph != null) {
			this.graph.removeListener(this.resizeHandler);
			this.graph.removeListener(this.foldHandler);
		}
		this.graph = graph;
		if (this.graph != null) {
			this.graph.addListener(mxEvent.RESIZE_CELLS, this.resizeHandler);
			this.graph.addListener(mxEvent.FOLD_CELLS, this.foldHandler);
		}
	};
	mxSpaceManager.prototype.cellsResized = function(cells) {
		if (cells != null) {
			var model = this.graph.getModel();

			model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					if (!this.isCellIgnored(cells[i])) {
						this.cellResized(cells[i]);
						break;
					}
				}
			} finally {
				model.endUpdate();
			}
		}
	};
	mxSpaceManager.prototype.cellResized = function(cell) {
		var graph = this.getGraph();
		var view = graph.getView();
		var model = graph.getModel();
		var state = view.getState(cell);
		var pstate = view.getState(model.getParent(cell));
		if (state != null && pstate != null) {
			var cells = this.getCellsToShift(state);
			var geo = model.getGeometry(cell);
			if (cells != null && geo != null) {
				var tr = view.translate;
				var scale = view.scale;
				var x0 = state.x - pstate.origin.x - tr.x * scale;
				var y0 = state.y - pstate.origin.y - tr.y * scale;
				var right = state.x + state.width;
				var bottom = state.y + state.height;
				var dx = state.width - geo.width * scale + x0 - geo.x * scale;
				var dy = state.height - geo.height * scale + y0 - geo.y * scale;
				var fx = 1 - geo.width * scale / state.width;
				var fy = 1 - geo.height * scale / state.height;
				model.beginUpdate();
				try {
					for (var i = 0; i < cells.length; i++) {
						if (cells[i] != cell && this.isCellShiftable(cells[i])) {
							this.shiftCell(cells[i], dx, dy, x0, y0, right,
									bottom, fx, fy, this.isExtendParents()
											&& graph.isExtendParent(cells[i]));
						}
					}
				} finally {
					model.endUpdate();
				}
			}
		}
	};
	mxSpaceManager.prototype.shiftCell = function(cell, dx, dy, Ox0, y0, right,
			bottom, fx, fy, extendParent) {
		var graph = this.getGraph();
		var state = graph.getView().getState(cell);
		if (state != null) {
			var model = graph.getModel();
			var geo = model.getGeometry(cell);
			if (geo != null) {
				model.beginUpdate();
				try {
					if (this.isShiftRightwards()) {
						if (state.x >= right) {
							geo = geo.translate(-dx, 0);
						} else {
							var tmpDx = Math.max(0, state.x - x0);
							geo = geo.translate(-fx * tmpDx, 0);
						}
					}
					if (this.isShiftDownwards()) {
						if (state.y >= bottom) {
							geo = geo.translate(0, -dy);
						} else {
							var tmpDy = Math.max(0, state.y - y0);
							geo = geo.translate(0, -fy * tmpDy);
						}
						if (geo != model.getGeometry(cell)) {
							model.setGeometry(cell, geo);

							if (extendParent) {
								graph.extendParent(cell);
							}
						}
					}
				} finally {
					model.endUpdate();
				}
			}
		}
	};
	mxSpaceManager.prototype.getCellsToShift = function(state) {
		var graph = this.getGraph();
		var parent = graph.getModel().getParent(state.cell);
		var down = this.isShiftDownwards();
		var right = this.isShiftRightwards();
		return graph.getCellsBeyond(state.x + ((down) ? 0 : state.width),
				state.y + ((down && right) ? 0 : state.height), parent, right,
				down);
	};
	mxSpaceManager.prototype.destroy = function() {
		this.setGraph(null);
	};
}

{
	function mxSwimlaneManager(graph, horizontal, siblings, bubbling) {
		var self = this;

		this.addHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.cellsAdded(evt.getArgAt(0));
			}
		};
		this.resizeHandler = function(sender, evt) {
			if (self.isEnabled()) {
				self.cellsResized(evt.getArgAt(0));
			}
		};
		this.horizontal = (horizontal != null) ? horizontal : true;
		this.siblings = (siblings != null) ? siblings : true;
		this.bubbling = (bubbling != null) ? bubbling : true;
		this.setGraph(graph);
	};
	mxSwimlaneManager.prototype = new mxEventSource();
	mxSwimlaneManager.prototype.constructor = mxSwimlaneManager;
	mxSwimlaneManager.prototype.graph = null;
	mxSwimlaneManager.prototype.enabled = true;
	mxSwimlaneManager.prototype.horizontal = true;
	mxSwimlaneManager.prototype.siblings = true;
	mxSwimlaneManager.prototype.bubbling = true;
	mxSwimlaneManager.prototype.addHandler = null;
	mxSwimlaneManager.prototype.resizeHandler = null;
	mxSwimlaneManager.prototype.isSwimlaneIgnored = function(swimlane) {
		return !this.getGraph().isSwimlane(swimlane);
	};
	mxSwimlaneManager.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxSwimlaneManager.prototype.setEnabled = function(value) {
		this.enabled = value;
	};
	mxSwimlaneManager.prototype.isHorizontal = function() {
		return this.horizontal;
	};
	mxSwimlaneManager.prototype.setHorizontal = function(value) {
		this.horizontal = value;
	};
	mxSwimlaneManager.prototype.isSiblings = function() {
		return this.siblings;
	};
	mxSwimlaneManager.prototype.setSiblings = function(value) {
		this.siblings = value;
	};
	mxSwimlaneManager.prototype.isBubbling = function() {
		return this.bubbling;
	};
	mxSwimlaneManager.prototype.setBubbling = function(value) {
		this.bubbling = value;
	};
	mxSwimlaneManager.prototype.getGraph = function() {
		return this.graph;
	};
	mxSwimlaneManager.prototype.setGraph = function(graph) {
		if (this.graph != null) {
			this.graph.removeListener(this.addHandler);
			this.graph.removeListener(this.resizeHandler);
		}
		this.graph = graph;
		if (this.graph != null) {
			this.graph.addListener(mxEvent.ADD_CELLS, this.addHandler);
			this.graph.addListener(mxEvent.CELLS_RESIZED, this.resizeHandler);
		}
	};
	mxSwimlaneManager.prototype.cellsAdded = function(cells) {
		if (cells != null) {
			var model = this.getGraph().getModel();
			model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					if (!this.isSwimlaneIgnored(cells[i])) {
						this.swimlaneAdded(cells[i]);
					}
				}
			} finally {
				model.endUpdate();
			}
		}
	};
	mxSwimlaneManager.prototype.swimlaneAdded = function(swimlane) {
		var model = this.getGraph().getModel();

		var geo = null;
		var parent = model.getParent(swimlane);
		var childCount = model.getChildCount(parent);
		for (var i = 0; i < childCount; i++) {
			var child = model.getChildAt(parent, i);
			if (child != swimlane && !this.isSwimlaneIgnored(child)) {
				geo = model.getGeometry(child);
				break;
			}
		}
		if (geo != null) {
			this.resizeSwimlane(swimlane, geo.width, geo.height);
		}
	};
	mxSwimlaneManager.prototype.cellsResized = function(cells) {
		if (cells != null) {
			var model = this.getGraph().getModel();
			model.beginUpdate();
			try {
				for (var i = 0; i < cells.length; i++) {
					if (!this.isSwimlaneIgnored(cells[i])) {
						this.swimlaneResized(cells[i]);
					}
				}
			} finally {
				model.endUpdate();
			}
		}
	};
	mxSwimlaneManager.prototype.swimlaneResized = function(swimlane) {
		var model = this.getGraph().getModel();
		var geo = model.getGeometry(swimlane);
		if (geo != null) {
			var w = geo.width;
			var h = geo.height;
			model.beginUpdate();
			try {
				var parent = model.getParent(swimlane);
				if (this.isSiblings()) {
					var childCount = model.getChildCount(parent);
					for (var i = 0; i < childCount; i++) {
						var child = model.getChildAt(parent, i);
						if (child != swimlane && !this.isSwimlaneIgnored(child)) {
							this.resizeSwimlane(child, w, h);
						}
					}
				}
				if (this.isBubbling() && !this.isSwimlaneIgnored(parent)) {
					this.resizeParent(parent, w, h);
					this.swimlaneResized(parent);
				}
			} finally {
				model.endUpdate();
			}
		}
	};
	mxSwimlaneManager.prototype.resizeSwimlane = function(swimlane, w, h) {
		var model = this.getGraph().getModel();
		var geo = model.getGeometry(swimlane);
		if (geo != null) {
			geo = geo.clone();
			if (this.isHorizontal()) {
				geo.width = w;
			} else {
				geo.height = h;
			}
			model.setGeometry(swimlane, geo);
		}
	};
	mxSwimlaneManager.prototype.resizeParent = function(parent, w, h) {
		var graph = this.getGraph();
		var model = graph.getModel();
		var geo = model.getGeometry(parent);
		if (geo != null) {
			geo = geo.clone();
			var size = graph.getStartSize(parent)
			if (this.isHorizontal()) {
				geo.width = w + size.width;
			} else {
				geo.height = h + size.height;
			}
			model.setGeometry(parent, geo);
		}
	};
	mxSwimlaneManager.prototype.destroy = function() {
		this.setGraph(null);
	};
}

{
	function mxTemporaryCellStates(view, scale, cells) {
		this.view = view;
		scale = (scale != null) ? scale : 1;
		this.oldBounds = view.getGraphBounds();
		this.oldStates = view.getStates();
		this.oldScale = view.getScale();
		view.setStates(new mxDictionary());
		view.setScale(scale);
		if (cells != null) {
			var state = view.createState(new mxCell());

			for (var i = 0; i < cells.length; i++) {
				view.validateBounds(state, cells[i]);
			}
			var minX = null;
			var minY = null;
			var maxX = 0;
			var maxY = 0;
			for (var i = 0; i < cells.length; i++) {
				var bounds = view.validatePoints(state, cells[i]);
				minX = (minX != null) ? Math.min(minX, bounds.x) : bounds.x;
				minY = (minY != null) ? Math.min(minY, bounds.y) : bounds.y;
				maxX = Math.max(maxX, bounds.x + bounds.width);
				maxY = Math.max(maxY, bounds.y + bounds.height);
			}
			if (minX != null && minY != null) {
				view.setGraphBounds(new mxRectangle(minX, minY, maxX - minX,
						maxY - minY));
			}
		}
	};
	mxTemporaryCellStates.prototype.view = null;
	mxTemporaryCellStates.prototype.oldStates = null;
	mxTemporaryCellStates.prototype.oldBounds = null;
	mxTemporaryCellStates.prototype.oldScale = null;
	mxTemporaryCellStates.prototype.destroy = function() {
		this.view.setScale(this.oldScale);
		this.view.setStates(this.oldStates);
		this.view.setGraphBounds(this.oldBounds);
	};
}

{
	function mxGraphHandler(graph) {
		this.graph = graph;
		if (document.body != null) {
			this.graph.addMouseListener(this);
		}
	};
	mxGraphHandler.prototype.graph = null;
	mxGraphHandler.prototype.maxCells = (true) ? 20 : 50;
	mxGraphHandler.prototype.enabled = true;
	mxGraphHandler.prototype.cloneEnabled = true;
	mxGraphHandler.prototype.moveEnabled = true;
	mxGraphHandler.prototype.selectEnabled = true;
	mxGraphHandler.prototype.removeCellsFromParent = true;
	mxGraphHandler.prototype.connectOnDrop = false;
	mxGraphHandler.prototype.scrollOnMove = true;
	mxGraphHandler.prototype.minimumSize = 6;
	mxGraphHandler.prototype.previewColor = 'black';
	mxGraphHandler.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxGraphHandler.prototype.setEnabled = function(value) {
		this.enabled = value;
	};
	mxGraphHandler.prototype.isCloneEnabled = function() {
		return this.cloneEnabled;
	};
	mxGraphHandler.prototype.setCloneEnabled = function(value) {
		this.cloneEnabled = value;
	};
	mxGraphHandler.prototype.isMoveEnabled = function() {
		return this.moveEnabled;
	};
	mxGraphHandler.prototype.setMoveEnabled = function(value) {
		this.moveEnabled = value;
	};
	mxGraphHandler.prototype.isSelectEnabled = function() {
		return this.selectEnabled;
	};
	mxGraphHandler.prototype.setSelectEnabled = function(value) {
		this.selectEnabled = value;
	};
	mxGraphHandler.prototype.isRemoveCellsFromParent = function() {
		return this.removeCellsFromParent;
	};
	mxGraphHandler.prototype.setRemoveCellsFromParent = function(value) {
		this.removeCellsFromParent = value;
	};
	mxGraphHandler.prototype.mouseDown = function(sender, me) {
		if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled()
				&& !this.graph.isForceMarqueeEvent(me.getEvent())
				&& me.getHandle() == null && me.getState() != null) {
			var cell = me.getCell();
			this.cell = null;
			this.delayedSelection = this.graph.isCellSelected(cell);
			if (this.isSelectEnabled() && !this.delayedSelection) {
				this.graph.selectCellForEvent(cell, me.getEvent());
			}
			if (this.isMoveEnabled()) {
				var model = this.graph.model;
				var geo = model.getGeometry(cell);
				if (this.graph.isCellMovable(cell)
						&& ((!model.isEdge(cell)
								|| this.graph.getSelectionCount() > 1
								|| (geo.points != null && geo.points.length > 0)
								|| model.getTerminal(cell, true) == null || model
								.getTerminal(cell, false) == null)
								|| this.graph.allowDanglingEdges || (this.graph
								.isCloneEvent(me.getEvent()) && this.graph
								.isCellsCloneable()))) {
					this.cell = cell;
					this.start(me.getX(), me.getY());
				}
				this.cellWasClicked = true;
				me.consume();
			}
		}
	};
	mxGraphHandler.prototype.getCells = function(initialCell) {
		return this.graph.getMovableCells(this.graph.getSelectionCells());
	};
	mxGraphHandler.prototype.getPreviewBounds = function(cells) {
		var bounds = this.graph.getView().getBounds(cells);
		if (bounds != null) {
			if (bounds.width < this.minimumSize) {
				var dx = this.minimumSize - bounds.width;
				bounds.x -= dx / 2;
				bounds.width = this.minimumSize;
			}
			if (bounds.height < this.minimumSize) {
				var dy = this.minimumSize - bounds.height;
				bounds.y -= dy / 2;
				bounds.height = this.minimumSize;
			}
		}
		return bounds;
	};
	mxGraphHandler.prototype.createPreviewShape = function(bounds) {
		var shape = new mxRectangleShape(bounds, null, this.previewColor);
		shape.isDashed = true;
		return shape;
	};
	mxGraphHandler.prototype.start = function(x, y) {
		var pt = mxUtils.convertPoint(this.graph.container, x, y);
		this.startX = pt.x;
		this.startY = pt.y;
		this.cells = this.getCells(this.cell);
		this.bounds = this.getPreviewBounds(this.cells);
		if (this.bounds != null) {
			this.shape = this.createPreviewShape(this.bounds);
			if (false || false || false) {

				this.shape.dialect = mxConstants.DIALECT_STRICTHTML;
				this.shape.init(this.graph.container);
			} else {

				this.shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG)
						? mxConstants.DIALECT_VML
						: mxConstants.DIALECT_SVG;
				this.shape.init(this.graph.getView().getOverlayPane());
			}
			if (this.shape.dialect == mxConstants.DIALECT_SVG) {
				this.shape.node.setAttribute('style', 'pointer-events:none;');
			} else
				(this.shape.dialect == mxConstants.DIALECT_VML)
			{
				var self = this;
				mxEvent.addListener(this.shape.node, 'mousemove',
						function(evt) {
							var state = self.graph.getView()
									.getState(self.target || self.cell);
							self.graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
									new mxMouseEvent(evt, state));
						});
			}
			this.shape.node.style.visibility = 'hidden';
			this.highlight = new mxCellHighlight(this.graph,
					mxConstants.DROP_TARGET_COLOR, 3);
		}
	};
	mxGraphHandler.prototype.mouseMove = function(sender, me) {
		if (!me.isConsumed() && this.cell != null && this.shape != null
				&& this.shape.node != null) {
			var graph = this.graph;
			var point = mxUtils.convertPoint(graph.container, me.getX(), me
							.getY());
			var dx = point.x - this.startX;
			var dy = point.y - this.startY;
			var tol = graph.tolerance;
			if (this.shape.node.style.visibility == 'visible'
					|| Math.abs(dx) > tol || Math.abs(dy) > tol) {
				var trx = graph.getView().translate;
				var scale = graph.getView().scale;
				if (graph.isGridEnabledEvent(me.getEvent())) {
					var tx = this.bounds.x
							- (this.graph.snap(this.bounds.x / scale - trx.x) + trx.x)
							* scale;
					var ty = this.bounds.y
							- (this.graph.snap(this.bounds.y / scale - trx.y) + trx.y)
							* scale;
					dx = this.graph.snap(dx / scale) * scale - tx;
					dy = this.graph.snap(dy / scale) * scale - ty;
				}
				if (graph.isConstrainedEvent(me.getEvent())) {
					if (Math.abs(dx) > Math.abs(dy)) {
						dy = 0;
					} else {
						dx = 0;
					}
				}
				
				/**
				 * * xiaoxiong 20120509 添加鼠标是否已经移动到编辑窗体的最左侧或者最上侧 如果是的话
				 * 将其组建移动到相应的最边上 不要移出编辑窗体之外 start **
				 */
				if((this.bounds.x + dx)<0){
					if((this.bounds.y + dy)<0){
						this.shape.bounds = new mxRectangle(0,
								0, this.bounds.width,
								this.bounds.height);
					} else {
						this.shape.bounds = new mxRectangle(0,
								this.bounds.y + dy, this.bounds.width,
								this.bounds.height);
					}
				} else if((this.bounds.y + dy)<0){
					this.shape.bounds = new mxRectangle(this.bounds.x + dx,
							0, this.bounds.width,
							this.bounds.height);
				} else {
					this.shape.bounds = new mxRectangle(this.bounds.x + dx,
							this.bounds.y + dy, this.bounds.width,
							this.bounds.height);
				}
				/**
				 * * xiaoxiong 20120509 添加鼠标是否已经移动到编辑窗体的最左侧或者最上侧 如果是的话
				 * 将其组建移动到相应的最边上 不要移出编辑窗体之外 end **
				 */
				
				this.shape.node.style.visibility = 'visible';
				this.shape.redraw();
				var target = null;
				var cell = me.getCell();
				if (this.shape != null
						&& this.shape.dialect == mxConstants.DIALECT_STRICTHTML) {
					cell = graph.getCellAt(point.x, point.y)
				}
				if (graph.isDropEnabled()) {
					target = graph.getDropTarget(this.cells, me.getEvent(),
							cell);
				}
				var parent = target;
				var model = graph.getModel();
				while (parent != null && parent != this.cell) {
					parent = model.getParent(parent);
				}
				var clone = graph.isCloneEvent(me.getEvent())
						&& graph.isCellsCloneable() && this.isCloneEnabled();
				var state = graph.getView().getState(target);
				var highlight = false;
				if (!graph.isCellSelected(target) && state != null
						&& parent == null
						&& (model.getParent(this.cell) != target || clone)) {
					if (this.target != target) {
						this.target = target;
						this.setHighlightColor(mxConstants.DROP_TARGET_COLOR);
					}
					highlight = true;
				} else {
					this.target = null;
					if (this.connectOnDrop && cell != null
							&& this.cells.length == 1
							&& graph.getModel().isVertex(cell)
							&& graph.isCellConnectable(cell)) {
						var state = graph.getView().getState(cell);
						if (state != null) {
							var error = graph.getEdgeValidationError(null,
									this.cell, cell);
							var color = (error == null)
									? mxConstants.VALID_COLOR
									: mxConstants.INVALID_CONNECT_TARGET_COLOR;
							this.setHighlightColor(color);
							highlight = true;
						}
					}
				}
				if (state != null && highlight) {
					this.highlight.highlight(state);
				} else {
					this.highlight.hide();
				}
			}
			me.consume();
		}
	};
	mxGraphHandler.prototype.setHighlightColor = function(color) {
		if (this.highlight != null) {
			this.highlight.setHighlightColor(color);
		}
	};
	mxGraphHandler.prototype.mouseUp = function(sender, me) {
		if (!me.isConsumed()) {
			var graph = this.graph;
			if (this.cell != null && this.shape != null
					&& this.shape.node.style.visibility == 'visible') {
				var point = mxUtils.convertPoint(graph.container, me.getX(), me
								.getY());
				var trx = graph.getView().translate;
				var scale = graph.getView().scale;
				var clone = graph.isCloneEvent(me.getEvent())
						&& graph.isCellsCloneable() && this.isCloneEnabled();
				var dx = (point.x - this.startX) / scale;
				var dy = (point.y - this.startY) / scale;
				if (graph.isGridEnabledEvent(me.getEvent())) {
					var tx = this.bounds.x
							- (graph.snap(this.bounds.x / scale - trx.x) + trx.x)
							* scale;
					var ty = this.bounds.y
							- (graph.snap(this.bounds.y / scale - trx.y) + trx.y)
							* scale;
					dx = graph.snap(dx) - tx / scale;
					dy = graph.snap(dy) - ty / scale;
				}
				if (graph.isConstrainedEvent(me.getEvent())) {
					if (Math.abs(dx) > Math.abs(dy)) {
						dy = 0;
					} else {
						dx = 0;
					}
				}
				var cell = me.getCell();
				if (this.connectOnDrop && this.target == null && cell != null
						&& graph.getModel().isVertex(cell)
						&& graph.isCellConnectable(cell)
						&& graph.isEdgeValid(null, this.cell, cell)) {
					graph.connectionHandler.connect(this.cell, cell, me
									.getEvent());
				} else {
					var cells = graph.getSelectionCells();
					var target = this.target;
					if (graph.isSplitEnabled()
							&& graph
									.isSplitTarget(target, cells, me.getEvent())) {
						graph.splitEdge(target, cells, null, dx, dy);
					} else {
						/**
						 * * xiaoxiong 20120509 添加鼠标是否已经移动到编辑窗体的最左侧或者最上侧 如果是的话
						 * 将其组建移动到相应的最边上 不要移出编辑窗体之外 start **
						 */
						if((this.bounds.x + dx)<0){
							if((this.bounds.y + dy)<0){
								this.moveCells(graph.getSelectionCells(), 0-this.bounds.x, 0-this.bounds.y,
										clone, this.target, me.getEvent());
							} else {
								this.moveCells(graph.getSelectionCells(), 0-this.bounds.x, dy,
										clone, this.target, me.getEvent());
							}
						} else if((this.bounds.y + dy)<0){
								this.moveCells(graph.getSelectionCells(), dx, 0-this.bounds.y,
										clone, this.target, me.getEvent());
						} else {
							this.moveCells(graph.getSelectionCells(), dx, dy,
									clone, this.target, me.getEvent());
						}
						/**
						 * * xiaoxiong 20120509 添加鼠标是否已经移动到编辑窗体的最左侧或者最上侧 如果是的话
						 * 将其组建移动到相应的最边上 不要移出编辑窗体之外 end **
						 */
					}
				}
			} else if (this.isSelectEnabled() && this.delayedSelection
					&& this.cell != null) {
				graph.selectCellForEvent(this.cell, me.getEvent());
			}
		}
		if (this.cellWasClicked) {
			me.consume();
		}
		this.reset();
	};
	mxGraphHandler.prototype.reset = function() {
		this.destroyShapes();
		this.cellWasClicked = false;
		this.delayedSelection = false;
		this.cell = null;
		this.target = null;
	};
	mxGraphHandler.prototype.shouldRemoveCellsFromParent = function(parent,
			cells, evt) {
		if (this.graph.getModel().isVertex(parent)) {
			var pState = this.graph.getView().getState(parent);
			var pt = mxUtils.convertPoint(this.graph.container, evt.clientX,
					evt.clientY);
			return pState != null && !mxUtils.contains(pState, pt.x, pt.y);
		}
		return false;
	};
	mxGraphHandler.prototype.moveCells = function(cells, dx, dy, clone, target,
			evt) {
		if (clone) {
			cells = this.graph.getCloneableCells(cells);
		}
		if (target == null
				&& this.isRemoveCellsFromParent()
				&& this.shouldRemoveCellsFromParent(this.graph.getModel()
								.getParent(this.cell), cells, evt)) {
			target = this.graph.getDefaultParent();
		}

		var cells = this.graph.moveCells(cells, dx, dy, clone, target, evt);
		if (this.isSelectEnabled() && this.scrollOnMove) {
			this.graph.scrollCellToVisible(cells[0]);
		}
		if (clone) {
			this.graph.setSelectionCells(cells);
		}
	};
	mxGraphHandler.prototype.destroyShapes = function() {
		if (this.shape != null) {
			this.shape.destroy();
			this.shape = null;
		}
		if (this.highlight != null) {
			this.highlight.destroy();
			this.highlight = null;
		}
	};
	mxGraphHandler.prototype.destroy = function() {
		this.graph.removeMouseListener(this);
		this.destroyShapes();
	};
}

{
	function mxPanningHandler(graph, factoryMethod) {
		if (graph != null && document.body != null) {
			this.graph = graph;
			this.factoryMethod = factoryMethod;
			this.graph.addMouseListener(this);
		}
	};
	mxPanningHandler.prototype = new mxPopupMenu();
	mxPanningHandler.prototype.constructor = mxPanningHandler;
	mxPanningHandler.prototype.graph = null;
	mxPanningHandler.prototype.usePopupTrigger = true;
	mxPanningHandler.prototype.useLeftButtonForPanning = false;
	mxPanningHandler.prototype.selectOnPopup = true;
	mxPanningHandler.prototype.clearSelectionOnBackground = true;
	mxPanningHandler.prototype.ignoreCell = false;
	mxPanningHandler.prototype.useGrid = false;
	mxPanningHandler.prototype.panningEnabled = true;
	mxPanningHandler.prototype.isPanningEnabled = function() {
		return this.panningEnabled;
	};
	mxPanningHandler.prototype.setPanningEnabled = function(value) {
		this.panningEnabled = value;
	};
	mxPanningHandler.prototype.init = function() {
		mxPopupMenu.prototype.init.apply(this);

		var self = this;
		mxEvent.addListener(this.div, 'mousemove', function(evt) {
					self.graph.tooltipHandler.hide();
				});
	};
	mxPanningHandler.prototype.isPanningTrigger = function(me) {
		var evt = me.getEvent();
		return (this.useLeftButtonForPanning
				&& (this.ignoreCell || me.getState() == null) && mxEvent
				.isLeftMouseButton(evt))
				|| (mxEvent.isControlDown(evt) && mxEvent.isShiftDown(evt))
				|| (this.usePopupTrigger && mxEvent.isPopupTrigger(evt));
	};
	mxPanningHandler.prototype.mouseDown = function(sender, me) {
		if (!me.isConsumed() && this.isEnabled()) {
			this.hideMenu();
			this.dx0 = -this.graph.container.scrollLeft;
			this.dy0 = -this.graph.container.scrollTop;
			this.popupTrigger = this.isPopupTrigger(me);
			this.panningTrigger = this.isPanningEnabled()
					&& this.isPanningTrigger(me);
			this.startX = me.getX();
			this.startY = me.getY();

			if (this.popupTrigger && mxEvent.isRightMouseButton(me.getEvent())
					&& mxClient.IS_MAC && false) {
				this.mouseUp(sender, me);
			} else if (this.panningTrigger) {
				me.consume();
			}
		}
	};
	mxPanningHandler.prototype.mouseMove = function(sender, me) {
		var dx = me.getX() - this.startX;
		var dy = me.getY() - this.startY;
		if (this.active) {
			if (this.useGrid) {
				dx = this.graph.snap(dx);
				dy = this.graph.snap(dy);
			}
			this.graph.panGraph(dx + this.dx0, dy + this.dy0);
			me.consume();
		} else if (this.panningTrigger) {

			this.active = Math.abs(dx) > this.graph.tolerance
					|| Math.abs(dy) > this.graph.tolerance;
		}
	};
	mxPanningHandler.prototype.mouseUp = function(sender, me) {
		var dx = Math.abs(me.getX() - this.startX);
		var dy = Math.abs(me.getY() - this.startY);
		if (this.active) {
			var style = mxUtils.getCurrentStyle(this.graph.container);
			if (!mxUtils.hasScrollbars(this.graph.container)) {
				this.graph.panGraph(0, 0);
				var dx = me.getX() - this.startX;
				var dy = me.getY() - this.startY;
				var scale = this.graph.getView().scale;
				var t = this.graph.getView().translate;
				this.panGraph(t.x + dx / scale, t.y + dy / scale);
			}
			me.consume();
		} else if (this.popupTrigger) {
			if (dx < this.graph.tolerance && dy < this.graph.tolerance) {
				var cell = me.getCell();
				if (this.graph.isEnabled() && this.selectOnPopup
						&& cell != null && !this.graph.isCellSelected(cell)) {
					this.graph.setSelectionCell(cell);
				}
				if (this.clearSelectionOnBackground
						&& !this.graph.isCellSelected(cell)) {
					this.graph.clearSelection();
				}
				this.graph.tooltipHandler.hide();
				var origin = mxUtils.getScrollOrigin();
				var point = new mxPoint(me.getX() + origin.x, me.getY()
								+ origin.y);
				this.popup(point.x, point.y, cell, me.getEvent());
				me.consume();
			}
		}
		this.panningTrigger = false;
		this.popupTrigger = false;
		this.active = false;
	};
	mxPanningHandler.prototype.panGraph = function(dx, dy) {
		this.graph.getView().setTranslate(dx, dy);
	};
	mxPanningHandler.prototype.destroy = function() {
		this.graph.removeMouseListener(this);
		mxPopupMenu.prototype.destroy.apply(this);
	};
}

{
	function mxCellMarker(graph, validColor, invalidColor, hotspot) {
		if (graph != null) {
			this.graph = graph;
			this.validColor = (validColor != null)
					? validColor
					: mxConstants.DEFAULT_VALID_COLOR;
			this.invalidColor = (validColor != null)
					? invalidColor
					: mxConstants.DEFAULT_INVALID_COLOR;
			this.hotspot = (hotspot != null)
					? hotspot
					: mxConstants.DEFAULT_HOTSPOT;
			this.highlight = new mxCellHighlight(graph);
		}
	};
	mxCellMarker.prototype = new mxEventSource();
	mxCellMarker.prototype.constructor = mxCellMarker;
	mxCellMarker.prototype.graph = null;
	mxCellMarker.prototype.enabled = true;
	mxCellMarker.prototype.hotspot = mxConstants.DEFAULT_HOTSPOT;
	mxCellMarker.prototype.hotspotEnabled = false;
	mxCellMarker.prototype.validColor = null;
	mxCellMarker.prototype.invalidColor = null;
	mxCellMarker.prototype.currentColor = null;
	mxCellMarker.prototype.validState = null;
	mxCellMarker.prototype.markedState = null;
	mxCellMarker.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxCellMarker.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxCellMarker.prototype.setHotspot = function(hotspot) {
		this.hotspot = hotspot;
	};
	mxCellMarker.prototype.getHotspot = function() {
		return this.hotspot;
	};
	mxCellMarker.prototype.setHotspotEnabled = function(enabled) {
		this.hotspotEnabled = enabled;
	};
	mxCellMarker.prototype.isHotspotEnabled = function() {
		return this.hotspotEnabled;
	};
	mxCellMarker.prototype.hasValidState = function() {
		return this.validState != null;
	};
	mxCellMarker.prototype.getValidState = function() {
		return this.validState;
	};
	mxCellMarker.prototype.getMarkedState = function() {
		return this.markedState;
	};
	mxCellMarker.prototype.reset = function() {
		this.validState = null;
		if (this.markedState != null) {
			this.markedState = null;
			this.unmark();
		}
	};
	mxCellMarker.prototype.process = function(me) {
		var state = null;
		if (this.isEnabled()) {
			state = this.getState(me);
			var isValid = (state != null) ? this.isValidState(state) : false;
			var color = this.getMarkerColor(me.getEvent(), state, isValid);
			if (isValid) {
				this.validState = state;
			} else {
				this.validState = null;
			}
			if (state != this.markedState || color != this.currentColor) {
				this.currentColor = color;
				if (state != null && this.currentColor != null) {
					this.markedState = state;
					this.mark();
				} else if (this.markedState != null) {
					this.markedState = null;
					this.unmark();
				}
			}
		}
		return state;
	};
	mxCellMarker.prototype.mark = function() {
		this.highlight.setHighlightColor(this.currentColor);
		this.highlight.highlight(this.markedState);
		this.fireEvent(mxEvent.MARK, new mxEventObject([this.markedState]));
	};
	mxCellMarker.prototype.unmark = function() {
		this.mark();
	};
	mxCellMarker.prototype.isValidState = function(state) {
		return true;
	};
	mxCellMarker.prototype.getMarkerColor = function(evt, state, isValid) {
		return (isValid) ? this.validColor : this.invalidColor;
	};
	mxCellMarker.prototype.getState = function(me) {
		var view = this.graph.getView();
		cell = this.getCell(me);
		var state = this.getStateToMark(view.getState(cell));
		return (state != null && this.intersects(state, me)) ? state : null;
	};
	mxCellMarker.prototype.getCell = function(me) {
		return me.getCell();
	};
	mxCellMarker.prototype.getStateToMark = function(state) {
		return state;
	};
	mxCellMarker.prototype.intersects = function(state, me) {
		if (this.hotspotEnabled) {
			var point = mxUtils.convertPoint(this.graph.container, me.getX(),
					me.getY());
			return mxUtils.intersectsHotspot(state, point.x, point.y,
					this.hotspot, mxConstants.MIN_HOTSPOT_SIZE,
					mxConstants.MAX_HOTSPOT_SIZE);
		}
		return true;
	};
	mxCellMarker.prototype.destroy = function() {
		this.graph.getView().removeListener(this.resetHandler);
		this.graph.getModel().removeListener(this.resetHandler);
	};
}

{
	function mxConnectionHandler(graph, factoryMethod) {
		if (graph != null) {
			this.graph = graph;
			this.factoryMethod = factoryMethod;
			this.init();
			if (document.body != null) {
				this.graph.addMouseListener(this);
			}
		}
	};
	mxConnectionHandler.prototype.graph = null;
	mxConnectionHandler.prototype.factoryMethod = true;
	mxConnectionHandler.prototype.connectImage = null;
	mxConnectionHandler.prototype.targetConnectImage = false;
	mxConnectionHandler.prototype.enabled = true;
	mxConnectionHandler.prototype.select = true;
	mxConnectionHandler.prototype.iconZIndex = 10005;
	mxConnectionHandler.prototype.createTarget = false;
	mxConnectionHandler.prototype.marker = null;
	mxConnectionHandler.prototype.error = null;
	mxConnectionHandler.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxConnectionHandler.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxConnectionHandler.prototype.isCreateTarget = function() {
		return this.createTarget;
	};
	mxConnectionHandler.prototype.setCreateTarget = function(value) {
		this.createTarget = value;
	};
	mxConnectionHandler.prototype.init = function() {
		if (this.graph.container != null) {
			this.marker = this.createMarker();
			this.shape = new mxPolyline(new Array(), mxConstants.INVALID_COLOR);
			this.shape.isDashed = true;
			this.shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG)
					? mxConstants.DIALECT_VML
					: mxConstants.DIALECT_SVG;
			this.shape.init(this.graph.getView().getOverlayPane());
			this.shape.node.style.display = 'none';
			if (this.graph.dialect != mxConstants.DIALECT_SVG) {
				mxEvent.redirectMouseEvents(this.shape.node, this.graph, null,
						null, true);
			} else {

				this.shape.pipe.setAttribute('style', 'pointer-events:none;');
				this.shape.innerNode.setAttribute('style',
						'pointer-events:none;');
			}
			var self = this;
			var changeHandler = function(sender) {
				if (self.iconState != null) {
					self.iconState = self.graph.getView()
							.getState(self.iconState.cell);
				}
				if (self.iconState != null) {
					self.redrawIcons(self.icons, self.iconState);
				} else {
					self.destroyIcons(self.icons);
					self.previous = null;
				}
			};
			this.graph.getModel().addListener(mxEvent.CHANGE, changeHandler);
			this.graph.getView().addListener(mxEvent.SCALE, changeHandler);
			this.graph.getView().addListener(mxEvent.TRANSLATE, changeHandler);
			this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE,
					changeHandler);
			var drillHandler = function(sender) {
				self.destroyIcons(self.icons);
			};
			this.graph.addListener(mxEvent.START_EDITING, drillHandler);
			this.graph.getView().addListener(mxEvent.DOWN, drillHandler);
			this.graph.getView().addListener(mxEvent.UP, drillHandler);
		}
	};
	mxConnectionHandler.prototype.createMarker = function() {
		var marker = new mxCellMarker(this.graph);
		marker.hotspotEnabled = true;
		var self = this;

		marker.getCell = function(evt, cell) {
			var cell = mxCellMarker.prototype.getCell.apply(this, arguments);
			self.error = null;
			if (cell != null) {
				if (self.isConnecting()) {
					if (self.previous != null) {
						self.error = self.validateConnection(
								self.previous.cell, cell);
						if (self.error != null && self.error.length == 0) {
							cell = null;
							if (self.isCreateTarget()) {
								self.error = null;
							}
						}
					}
				} else if (!self.isValidSource(cell)) {
					cell = null;
				}
			} else if (self.isConnecting() && !self.isCreateTarget()
					&& !self.graph.allowDanglingEdges) {
				self.error = '';
			}
			return cell;
		};
		marker.isValidState = function(state) {
			if (self.isConnecting()) {
				return self.error == null;
			} else {
				return mxCellMarker.prototype.isValidState.apply(this,
						arguments);
			}
		};

		marker.getMarkerColor = function(evt, state, isValid) {
			return (self.connectImage == null || self.isConnecting())
					? mxCellMarker.prototype.getMarkerColor.apply(this,
							arguments)
					: null;
		};

		marker.intersects = function(state, evt) {
			if (self.connectImage != null || self.isConnecting()) {
				return true;
			}
			return mxCellMarker.prototype.intersects.apply(this, arguments);
		};
		return marker;
	};
	mxConnectionHandler.prototype.isConnecting = function() {
		return this.start != null && this.shape.node.style.display == 'inline';
	};
	mxConnectionHandler.prototype.isValidSource = function(cell) {
		return this.graph.isValidSource(cell);
	};
	mxConnectionHandler.prototype.isValidTarget = function(cell) {
		return true;
	};
	mxConnectionHandler.prototype.validateConnection = function(source, target) {
		if (!this.isValidTarget(target)) {
			return '';
		}
		return this.graph.getEdgeValidationError(null, source, target);
	};
	mxConnectionHandler.prototype.getConnectImage = function(state) {
		return this.connectImage;
	};
	mxConnectionHandler.prototype.createIcons = function(state) {
		var image = this.getConnectImage(state);
		if (image != null && state != null) {
			this.iconState = state;
			var icons = new Array();
			var bounds = new mxRectangle(0, 0, image.width, image.height);
			var icon = new mxImageShape(bounds, image.src);
			icon.dialect = (this.graph.dialect == mxConstants.DIALECT_SVG)
					? mxConstants.DIALECT_STRICTHTML
					: mxConstants.DIALECT_VML;
			icon.init((this.graph.dialect == mxConstants.DIALECT_SVG)
					? this.graph.container
					: this.graph.getView().getOverlayPane());
			icon.node.style.cursor = (true) ? 'all-scroll' : 'pointer';
			icon.node.style.zIndex = this.iconZIndex;
			var self = this;
			mxEvent.addListener(icon.node, 'dblclick', function(evt) {
						self.graph.dblClick(evt, state.cell);
						mxEvent.consume(evt);
					});
			mxEvent.addListener(icon.node, 'mousedown', function(evt) {
						self.icon = icon;
						self.graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
								new mxMouseEvent(evt,
										(self.currentState != null)
												? self.currentState
												: state));
					});
			mxEvent.addListener(icon.node, 'mousemove', function(evt) {
						self.graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
								new mxMouseEvent(evt,
										(self.currentState != null)
												? self.currentState
												: state));
					});
			mxEvent.addListener(icon.node, 'mouseup', function(evt) {
						self.graph.fireMouseEvent(mxEvent.MOUSE_UP,
								new mxMouseEvent(evt,
										(self.currentState != null)
												? self.currentState
												: state));
					});
			icons.push(icon);
			this.redrawIcons(icons, this.iconState);
			return icons;
		}
		return null;
	};
	mxConnectionHandler.prototype.redrawIcons = function(icons, state) {
		if (icons != null && icons[0] != null && state != null) {
			var pos = this.getIconPosition(icons[0], state);
			icons[0].bounds.x = pos.x;
			icons[0].bounds.y = pos.y;
			icons[0].redraw();
		}
	};
	mxConnectionHandler.prototype.getIconPosition = function(icon, state) {
		var scale = this.graph.getView().scale;
		var cx = state.getCenterX();
		var cy = state.getCenterY();
		if (this.graph.isSwimlane(state.cell)) {
			var size = this.graph.getStartSize(state.cell);
			cx = (size.width != 0) ? state.x + size.width * scale / 2 : cx;
			cy = (size.height != 0) ? state.y + size.height * scale / 2 : cy;
		}
		return new mxPoint(cx - icon.bounds.width / 2, cy - icon.bounds.height
						/ 2);
	};
	mxConnectionHandler.prototype.destroyIcons = function(icons) {
		if (icons != null) {
			this.iconState = null;
			for (var i = 0; i < icons.length; i++) {
				icons[i].destroy();
			}
		}
	};
	mxConnectionHandler.prototype.mouseDown = function(sender, me) {
		if (!me.isConsumed()
				&& this.isEnabled()
				&& this.graph.isEnabled()
				&& !this.graph.isForceMarqueeEvent(me.getEvent())
				&& this.previous != null
				&& this.error == null
				&& ((this.icons == null) || (this.icons != null && this.icon != null))
				&& me.getHandle() == null) {
			this.start = mxUtils.convertPoint(this.graph.container, me.getX(),
					me.getY());
			me.consume();
		}
		this.selectedIcon = this.icon;
		this.icon = null;
	};
	mxConnectionHandler.prototype.mouseMove = function(sender, me) {
		if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled()
				&& me.getHandle() == null) {
			var state = this.marker.process(me);
			this.currentState = state;
			if (this.previous != null && this.start != null) {
				var view = this.graph.getView();
				var scale = view.scale;
				var pt = mxUtils.convertPoint(this.graph.container, me.getX(),
						me.getY());
				var point = new mxPoint(this.graph.snap(pt.x / scale) * scale,
						this.graph.snap(pt.y / scale) * scale);
				var current = point;
				if (state != null) {
					var targetPerimeter = view.getPerimeterFunction(state);
					if (targetPerimeter != null) {
						var next = new mxPoint(this.previous.getCenterX(),
								this.previous.getCenterY());
						var tmp = targetPerimeter(view.getPerimeterBounds(
										state, null, false), null, state,
								false, next);
						if (tmp != null) {
							current = tmp;
						}
					} else {
						current = new mxPoint(state.getCenterX(), state
										.getCenterY());
					}
				}
				if (this.selectedIcon != null) {
					var w = this.selectedIcon.bounds.width;
					var h = this.selectedIcon.bounds.height;
					if (state != null && this.targetConnectImage) {
						var pos = this
								.getIconPosition(this.selectedIcon, state);
						this.selectedIcon.bounds.x = pos.x;
						this.selectedIcon.bounds.y = pos.y;
					} else {
						var bounds = new mxRectangle(pt.x, pt.y
										+ mxConstants.TOOLTIP_VERTICAL_OFFSET,
								w, h);
						this.selectedIcon.bounds = bounds;
					}
					this.selectedIcon.redraw();
				}
				var pt = this.start;
				var sourcePerimeter = view.getPerimeterFunction(this.previous);
				if (sourcePerimeter != null) {
					var tmp = sourcePerimeter(view.getPerimeterBounds(
									this.previous, null, true), null,
							this.previous, true, current);
					if (tmp != null) {
						pt = tmp;
					}
				} else {
					pt = new mxPoint(this.previous.getCenterX(), this.previous
									.getCenterY());
				}
				if (state == null) {

					var dx = current.x - pt.x;
					var dy = current.y - pt.y;
					var len = Math.sqrt(dx * dx + dy * dy);
					current.x -= dx * 4 / len;
					current.y -= dy * 4 / len;
				}
				this.shape.points = [pt, current];
				if (this.shape.node.style.display != 'inline') {
					var dx = Math.abs(point.x - this.start.x);
					var dy = Math.abs(point.y - this.start.y);
					if (dx > this.graph.tolerance || dy > this.graph.tolerance) {
						this.shape.node.style.display = 'inline';
					}
				}
				this.drawPreview();
				me.consume();
			} else if (this.previous != state) {
				if (this.previous != null && this.previous.shape != null) {
					this.previous.shape.node.style.cursor = this.previousCursor;
				}
				this.destroyIcons(this.icons);
				this.icons = null;
				if (state != null && this.error == null) {
					this.previousCursor = state.shape.node.style.cursor;
					state.shape.node.style.cursor = (true)
							? 'all-scroll'
							: 'default';
					this.icons = this.createIcons(state);
				}
				this.previous = state;
			}
		}
	};
	mxConnectionHandler.prototype.mouseUp = function(sender, me) {
		if (!me.isConsumed() && this.isConnecting()) {
			if (this.error == null) {
				var source = this.previous.cell;
				var target = this.marker.hasValidState()
						? this.marker.validState.cell
						: null;
				this.connect(source, target, me.getEvent(), me.getCell());
			} else {
				if (this.previous != null && this.marker.validState != null
						&& this.previous.cell == this.marker.validState.cell) {
					this.graph.selectCellForEvent(this.marker.source, evt);
				}

				if (this.error.length > 0) {
					this.graph.validationAlert(this.error);
				}
			}
			this.destroyIcons(this.icons);
			me.consume();
		}
		if (this.start != null) {
			this.reset();
		}
	};
	mxConnectionHandler.prototype.reset = function() {
		this.shape.node.style.display = 'none';
		this.marker.reset();
		this.selectedIcon = null;
		this.previous = null;
		this.error = null;
		this.start = null;
		this.icon = null;
	};
	mxConnectionHandler.prototype.drawPreview = function() {
		var valid = this.error == null;
		var color = this.getEdgeColor(valid);
		if (this.shape.dialect == mxConstants.DIALECT_SVG) {
			this.shape.innerNode.setAttribute('stroke', color);
		} else {
			this.shape.node.setAttribute('strokecolor', color);
		}
		this.shape.strokewidth = this.getEdgeWidth(valid);
		this.shape.redraw();
		mxUtils.repaintGraph(this.graph, this.shape.points[1]);
	};
	mxConnectionHandler.prototype.getEdgeColor = function(valid) {
		return (valid) ? mxConstants.VALID_COLOR : mxConstants.INVALID_COLOR;
	};
	mxConnectionHandler.prototype.getEdgeWidth = function(valid) {
		return (valid) ? 3 : 1;
	};
	mxConnectionHandler.prototype.connect = function(source, target, evt,
			dropTarget) {
		if (source != null
				&& (target != null || this.isCreateTarget() || this.graph.allowDanglingEdges)) {

			var model = this.graph.getModel();
			var edge = null;
			model.beginUpdate();
			try {
				if (target == null && this.isCreateTarget()) {
					target = this.createTargetVertex(evt, source);
					if (target != null) {
						dropTarget = this.graph.getDropTarget([target], evt,
								dropTarget);
						if (dropTarget == null
								|| !this.graph.getModel().isEdge(dropTarget)) {
							var pstate = this.graph.getView()
									.getState(dropTarget);
							if (pstate != null) {
								var tmp = model.getGeometry(target);
								tmp.x -= pstate.origin.x;
								tmp.y -= pstate.origin.y;
							}
						} else {
							dropTarget = this.graph.getDefaultParent();
						}
						this.graph.addCell(target, dropTarget);
					}
				}
				var parent = this.graph.getDefaultParent();
				if (model.getParent(source) == model.getParent(target)) {
					parent = model.getParent(source);
				}
				edge = this.insertEdge(parent, null, null, source, target);
				if (edge != null) {
					var geo = model.getGeometry(edge);
					if (geo == null) {
						geo = new mxGeometry();
						geo.relative = true;
						model.setGeometry(edge, geo);
					}
					if (target == null) {
						var pt = this.graph.getPointForEvent(evt);
						geo.setTerminalPoint(pt, false);
					}
				}
			} finally {
				model.endUpdate();
			}
			if (this.select) {
				this.graph.setSelectionCell(edge);
			}
		}
	};
	mxConnectionHandler.prototype.insertEdge = function(parent, id, value,
			source, target) {
		if (this.factoryMethod == null) {
			return this.graph.insertEdge(parent, id, value, source, target);
		} else {
			var edge = this.createEdge(source, target);
			edge = this.graph.addEdge(edge, parent, source, target);
			return edge;
		}
	};
	mxConnectionHandler.prototype.createTargetVertex = function(evt, source) {
		var clone = this.graph.cloneCells([source])[0];
		var model = this.graph.getModel();
		var geo = model.getGeometry(clone);
		if (geo != null) {
			var point = this.graph.getPointForEvent(evt);
			geo.x = this.graph.snap(point.x - geo.width / 2);
			geo.y = this.graph.snap(point.y - geo.height / 2);
		}
		return clone;
	};
	mxConnectionHandler.prototype.createEdge = function(source, target) {
		var edge = null;
		if (this.factoryMethod != null) {
			edge = this.factoryMethod(source, target);
		}
		if (edge == null) {
			edge = new mxCell('');
			edge.setEdge(true);
			var geo = new mxGeometry();
			geo.relative = true;
			edge.setGeometry(geo);
		}
		return edge;
	};
	mxConnectionHandler.prototype.destroy = function() {
		this.graph.removeMouseListener(this);
		if (this.shape != null) {
			this.shape.destroy();
			this.shape = null;
		}
		if (this.marker != null) {
			this.marker.destroy();
			this.marker = null;
		}
	};
}

{
	function mxRubberband(graph) {
		if (graph != null) {
			this.graph = graph;
			this.graph.addMouseListener(this);
			this.div = document.createElement('div');
			this.div.className = 'mxRubberband';
			mxUtils.setOpacity(this.div, this.defaultOpacity);

			mxEvent.redirectMouseEvents(this.div, this.graph);
			if(mxClient.IS_IE) {
				var self = this;
				mxEvent.addListener(window, 'unload', function() {
							self.destroy();
						});
			}
		}
	};
	mxRubberband.prototype.defaultOpacity = 20;
	mxRubberband.prototype.enabled = true;
	mxRubberband.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxRubberband.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxRubberband.prototype.mouseDown = function(sender, me) {
		if (!me.isConsumed()
				&& this.isEnabled()
				&& this.graph.isEnabled()
				&& (this.graph.isForceMarqueeEvent(me.getEvent()) || (me
						.getState() == null && me.getHandle() == null))) {
			this.start(me.getX(), me.getY());
			me.consume();
		} else {
			this.active = false;
		}
	};
	mxRubberband.prototype.start = function(x, y) {
		var offset = mxUtils.getOffset(this.graph.container);
		var origin = mxUtils.getScrollOrigin(this.graph.container);
		origin.x -= offset.x;
		origin.y -= offset.y;
		this.startX = x + origin.x;
		this.startY = y + origin.y;
		this.redraw(x, y);
		this.div.style.visibility = 'visible';
		this.graph.container.appendChild(this.div);
		this.active = true;
	};
	mxRubberband.prototype.mouseMove = function(sender, me) {
		if (this.active) {
			this.redraw(me.getX(), me.getY());
			me.consume();
		}
	};
	mxRubberband.prototype.mouseUp = function(sender, me) {
		if (this.active) {
			this.reset();
			var rect = new mxRectangle(this.x, this.y, this.width, this.height);
			if (rect.width > this.graph.tolerance
					|| rect.height > this.graph.tolerance) {
				this.graph.selectRegion(rect, me.getEvent());
				me.consume();
			}
		}
	};
	mxRubberband.prototype.reset = function() {
		if (mxClient.FADE_RUBBERBAND) {
			mxUtils.fadeOut(this.div, 30, true, 10, null,
					mxClient.FADE_RUBBERBAND);
		} else {
			this.div.parentNode.removeChild(this.div);
		}
		this.active = false;
	};
	mxRubberband.prototype.redraw = function(x, y) {
		var origin = mxUtils.getScrollOrigin(this.graph.container);
		var offset = mxUtils.getOffset(this.graph.container);
		origin.x -= offset.x;
		origin.y -= offset.y;
		x += origin.x;
		y += origin.y;
		this.x = Math.min(this.startX, x);
		this.y = Math.min(this.startY, y);
		this.width = Math.max(this.startX, x) - this.x;
		this.height = Math.max(this.startY, y) - this.y;
		this.div.style.left = this.x + 'px';
		this.div.style.top = this.y + 'px';
		this.div.style.width = Math.max(1, this.width) + 'px';
		this.div.style.height = Math.max(1, this.height) + 'px';
	};
	mxRubberband.prototype.destroy = function() {
		if (!this.destroyed) {
			this.destroyed = true;
			this.graph.removeMouseListener(this);
			mxEvent.release(this.div);
			if (this.div.parentNode != null) {
				this.div.parentNode.removeChild(this.div);
			}
			this.div = null;
		}
	};
}

{
	function mxVertexHandler(state) {
		if (state != null) {
			this.state = state;
			this.graph = state.view.graph;
			this.graph.addMouseListener(this);
			this.init();
			this.redraw();
		}
	};
	mxVertexHandler.prototype.graph = null;
	mxVertexHandler.prototype.state = null;
	mxVertexHandler.prototype.singleSizer = false;
	mxVertexHandler.prototype.selectionColor = mxConstants.SELECTION_COLOR;
	mxVertexHandler.prototype.index = null;
	mxVertexHandler.prototype.init = function() {
		this.bounds = this.getSelectionBounds(this.state);
		this.selectionBorder = this.createSelectionShape(this.bounds);

		if (!this.graph.isHtmlLabel(this.state.cell) && (false || false)) {

			this.selectionBorder.dialect = mxConstants.DIALECT_STRICTHTML;
			this.selectionBorder.init(this.graph.container);
		} else {

			this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG)
					? mxConstants.DIALECT_VML
					: mxConstants.DIALECT_SVG;
			this.selectionBorder.init(this.graph.getView().getOverlayPane());
		}
		if (this.selectionBorder.dialect == mxConstants.DIALECT_SVG) {
			this.selectionBorder.node.setAttribute('style',
					'pointer-events:none;');
		} else {
			if (this.graph.isCellMovable(this.state.cell)) {
				this.selectionBorder.node.style.cursor = 'move';
			}
			var isHtml = this.selectionBorder.dialect == mxConstants.DIALECT_STRICTHTML;
			mxEvent.redirectMouseEvents(this.selectionBorder.node, this.graph,
					this.state.cell, null, true, isHtml, isHtml);
		}
		if (mxGraphHandler.prototype.maxCells <= 0
				|| this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells) {
			this.sizers = new Array();
			if (this.graph.isCellResizable(this.state.cell)) {
				var i = 0;
				if (!this.singleSizer) {
					this.sizers.push(this.createSizer('nw-resize', i++));
					this.sizers.push(this.createSizer('n-resize', i++));
					this.sizers.push(this.createSizer('ne-resize', i++));
					this.sizers.push(this.createSizer('w-resize', i++));
					this.sizers.push(this.createSizer('e-resize', i++));
					this.sizers.push(this.createSizer('sw-resize', i++));
					this.sizers.push(this.createSizer('s-resize', i++));
				}
				this.sizers.push(this.createSizer('se-resize', i++));
				var geo = this.graph.model.getGeometry(this.state.cell);
				if (geo != null && !geo.relative
						&& !this.graph.isSwimlane(this.state.cell)
						&& this.graph.isLabelMovable(this.state.cell)) {
					this.sizers.push(this.createSizer('default',
							mxEvent.LABEL_HANDLE,
							(this.graph.dialect == mxConstants.DIALECT_SVG)
									? 4
									: 6, mxConstants.LABEL_HANDLE_FILLCOLOR));
				}
			} else if (this.graph.isCellMovable(this.state.cell)
					&& !this.graph.isCellResizable(this.state.cell)
					&& this.state.width < 2 && this.state.height < 2) {
				this.sizers.push(this.createSizer('move', null, null,
						mxConstants.LABEL_HANDLE_FILLCOLOR));
			}
		}
	};
	mxVertexHandler.prototype.getSelectionBounds = function(state) {
		return new mxRectangle(state.x, state.y, state.width, state.height);
	};
	mxVertexHandler.prototype.createSelectionShape = function(bounds) {
		var shape = new mxRectangleShape(bounds, null, this.selectionColor);
		shape.strokewidth = mxConstants.SELECTION_STROKEWIDTH;
		shape.isDashed = mxConstants.SELECTION_DASHED;
		return shape;
	};
	mxVertexHandler.prototype.createSizer = function(cursor, index, size,
			fillColor) {
		size = size
				|| ((this.graph.dialect == mxConstants.DIALECT_SVG) ? 5 : 7);
		var bounds = new mxRectangle(0, 0, size, size);
		var sizer = this.createSizerShape(bounds, index, fillColor);
		if (this.graph.dialect == mxConstants.DIALECT_SVG) {
			sizer.dialect = mxConstants.DIALECT_PREFERHTML;
			sizer.init(this.graph.container);
		} else {
			sizer.dialect = this.graph.dialect;
			sizer.init(this.graph.getView().getOverlayPane());
		}
		var cell = this.state.cell;
		mxEvent.redirectMouseEvents(sizer.node, this.graph, cell, index, false,
				false, false, false);
		sizer.node.style.cursor = cursor;
		var self = this;
		mxEvent.addListener(sizer.node, 'dblclick', function(evt) {
					self.graph.dblClick(evt, self.state.cell);
					mxEvent.consume(evt);
				});
		if (!this.isSizerVisible(index)) {
			sizer.node.style.visibility = 'hidden';
		}
		return sizer;
	};
	mxVertexHandler.prototype.isSizerVisible = function(index) {
		return true;
	};
	mxVertexHandler.prototype.createSizerShape = function(bounds, index,
			fillColor) {
		return new mxRectangleShape(bounds, fillColor
						|| mxConstants.HANDLE_FILLCOLOR,
				mxConstants.HANDLE_STROKECOLOR);
	};
	mxVertexHandler.prototype.moveSizerTo = function(shape, x, y) {
		if (shape != null) {
			shape.bounds.x = x - shape.bounds.width / 2;
			shape.bounds.y = y - shape.bounds.height / 2;
			shape.redraw();
		}
	};
	mxVertexHandler.prototype.mouseDown = function(sender, me) {
		if (!me.isConsumed() && this.graph.isEnabled()
				&& !this.graph.isForceMarqueeEvent(me.getEvent())
				&& this.state == me.getState() && me.getHandle() != null) {
			this.start(me.getX(), me.getY(), me.getHandle());
			me.consume();
		}
	};
	mxVertexHandler.prototype.start = function(x, y, index) {
		var pt = mxUtils.convertPoint(this.graph.container, x, y);
		this.startX = pt.x;
		this.startY = pt.y;
		this.index = index;
	};
	mxVertexHandler.prototype.mouseMove = function(sender, me) {
		if (!me.isConsumed() && this.index != null) {
			var point = mxUtils.convertPoint(this.graph.container, me.getX(),
					me.getY());
			var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
			var scale = this.graph.getView().scale;
			if (this.index == mxEvent.LABEL_HANDLE) {
				if (gridEnabled) {
					point.x = this.graph.snap(point.x / scale) * scale;
					point.y = this.graph.snap(point.y / scale) * scale;
				}
				this.moveSizerTo(this.sizers[8], point.x, point.y);
				me.consume();
			} else if (this.index != null) {
				var dx = point.x - this.startX;
				var dy = point.y - this.startY;
				if (gridEnabled) {
					dx = this.graph.snap(dx / scale) * scale;
					dy = this.graph.snap(dy / scale) * scale;
				}
				this.bounds = this.union(this.state, dx, dy, this.index);
				this.drawPreview();
				me.consume();
			}
		}
	};
	mxVertexHandler.prototype.mouseUp = function(sender, me) {
		if (!me.isConsumed() && this.index != null && this.state != null) {
			var point = mxUtils.convertPoint(this.graph.container, me.getX(),
					me.getY());
			var scale = this.graph.getView().scale;
			var dx = (point.x - this.startX) / scale;
			var dy = (point.y - this.startY) / scale;
			if (this.graph.isGridEnabledEvent(me.getEvent())) {
				dx = this.graph.snap(dx);
				dy = this.graph.snap(dy);
			}
			this.resizeCell(this.state.cell, dx, dy, this.index);
			this.reset();
			me.consume();
		}
	};
	mxVertexHandler.prototype.reset = function() {
		this.index = null;
		this.bounds = new mxRectangle(this.state.x, this.state.y,
				this.state.width, this.state.height);
		this.drawPreview();
	};
	mxVertexHandler.prototype.resizeCell = function(cell, dx, dy, index) {
		var geo = this.graph.model.getGeometry(cell);
		if (index == mxEvent.LABEL_HANDLE) {
			geo = geo.clone();
			if (geo.offset == null) {
				geo.offset = new mxPoint(dx, dy);
			} else {
				geo.offset.x += dx;
				geo.offset.y += dy;
			}
			this.graph.model.setGeometry(cell, geo);
		} else {
			var bounds = this.union(geo, dx, dy, index);
			this.graph.resizeCell(cell, bounds);
		}
	};
	mxVertexHandler.prototype.union = function(bounds, dx, dy, index) {
		if (this.singleSizer) {
			return new mxRectangle(bounds.x, bounds.y, Math.max(0, bounds.width
									+ dx), Math.max(0, bounds.height + dy));
		} else {
			var left = bounds.x;
			var right = left + bounds.width;
			var top = bounds.y;
			var bottom = top + bounds.height;
			if (index > 4) {
				bottom = bottom + dy;
			} else if (index < 3) {
				top = top + dy;
			}
			if (index == 0 || index == 3 || index == 5) {
				left += dx;
			} else if (index == 2 || index == 4 || index == 7) {
				right += dx;
			}
			var width = right - left;
			var height = bottom - top;
			if (width < 0) {
				left += width;
				width = Math.abs(width);
			}
			if (height < 0) {
				top += height;
				height = Math.abs(height);
			}
			
			// return new mxRectangle(left, top, width, height);
			/**
			 * * xiaoxiong 20120608 添加鼠标是否已经移动到编辑窗体的最左侧或者最上侧 如果是的话 将其组建移动到相应的最边上
			 * 不要移出编辑窗体之外 start **
			 */
			if(left<0){
				if(top<0){
					return new mxRectangle(0,
							0, width+left,
							height+top);
				} else {
					return new mxRectangle(0,
							top, width+left,
							height);
				}
			} else if(top<0){
				return new mxRectangle(left,
						0, width,
						height+top);
			} else {
				return new mxRectangle(left,
						top, width,
						height);
			}
			/**
			 * * xiaoxiong 20120608 添加鼠标是否已经移动到编辑窗体的最左侧或者最上侧 如果是的话 将其组建移动到相应的最边上
			 * 不要移出编辑窗体之外 end **
			 */
		}
	};
	mxVertexHandler.prototype.redraw = function() {
		this.bounds = new mxRectangle(this.state.x, this.state.y,
				this.state.width, this.state.height);
		if (this.sizers != null) {
			var s = this.state;
			var r = s.x + s.width;
			var b = s.y + s.height;
			if (this.singleSizer) {
				this.moveSizerTo(this.sizers[0], r, b);
			} else {
				var cx = s.x + s.width / 2;
				var cy = s.y + s.height / 2;
				this.moveSizerTo(this.sizers[0], s.x, s.y);
				if (this.sizers.length > 1) {
					this.moveSizerTo(this.sizers[1], cx, s.y);
					this.moveSizerTo(this.sizers[2], r, s.y);
					this.moveSizerTo(this.sizers[3], s.x, cy);
					this.moveSizerTo(this.sizers[4], r, cy);
					this.moveSizerTo(this.sizers[5], s.x, b);
					this.moveSizerTo(this.sizers[6], cx, b);
					this.moveSizerTo(this.sizers[7], r, b);
					this.moveSizerTo(this.sizers[8], cx + s.absoluteOffset.x,
							cy + s.absoluteOffset.y);
				}
			}
		}
		this.drawPreview();
	};
	mxVertexHandler.prototype.drawPreview = function() {
		this.selectionBorder.bounds = this.bounds;
		this.selectionBorder.redraw();
	};
	mxVertexHandler.prototype.destroy = function() {
		this.graph.removeMouseListener(this);
		this.selectionBorder.destroy();
		this.selectionBorder = null;
		if (this.sizers != null) {
			for (var i = 0; i < this.sizers.length; i++) {
				this.sizers[i].destroy();
				this.sizers[i] = null;
			}
		}
	};
}

{
	function mxEdgeHandler(state) {
		if (state != null) {
			this.state = state;
			this.graph = this.state.view.graph;
			this.graph.addMouseListener(this);
			this.marker = this.createMarker();
			this.init();
		}
	};
	mxEdgeHandler.prototype.graph = null;
	mxEdgeHandler.prototype.state = null;
	mxEdgeHandler.prototype.marker = null;
	mxEdgeHandler.prototype.error = null;
	mxEdgeHandler.prototype.shape = null;
	mxEdgeHandler.prototype.bends = null;
	mxEdgeHandler.prototype.labelShape = null;
	mxEdgeHandler.prototype.cloneEnabled = true;
	mxEdgeHandler.prototype.selectionColor = mxConstants.SELECTION_COLOR;
	mxEdgeHandler.prototype.init = function() {

		this.points = new Array();

		this.abspoints = this.getSelectionPoints(this.state);
		this.shape = this.createSelectionShape(this.abspoints);
		this.shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG)
				? mxConstants.DIALECT_VML
				: mxConstants.DIALECT_SVG;
		this.shape.init(this.graph.getView().getOverlayPane());
		this.shape.node.style.cursor = 'pointer';
		var self = this;
		mxEvent.addListener(this.shape.node, 'dblclick', function(evt) {
					self.graph.dblClick(evt, self.state.cell);
					mxEvent.consume(evt);
				});
		mxEvent.addListener(this.shape.node, 'mousedown', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
							new mxMouseEvent(evt, self.state));
				});
		mxEvent.addListener(this.shape.node, 'mousemove', function(evt) {
					var cell = self.state.cell;

					if (self.index != null) {
						var gridEnabled = self.graph.isGridEnabledEvent(evt);
						var pt = mxUtils.convertPoint(self.graph.container,
								evt.clientX, evt.clientY, gridEnabled);
						cell = self.graph.getCellAt(pt.x, pt.y);
						if (self.graph.isSwimlane(cell)
								&& self.graph.hitsSwimlaneContent(cell, pt.x,
										pt.y)) {
							cell = null;
						}
					}
					self.graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
							new mxMouseEvent(evt, self.graph.getView()
											.getState(cell)));
				});
		mxEvent.addListener(this.shape.node, 'mouseup', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_UP,
							new mxMouseEvent(evt, self.state));
				});

		if (this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells
				|| mxGraphHandler.prototype.maxCells <= 0) {
			this.bends = this.createBends();
		}
		this.label = new mxPoint(this.state.absoluteOffset.x,
				this.state.absoluteOffset.y);
		this.labelShape = new mxRectangleShape(new mxRectangle(),
				mxConstants.LABEL_HANDLE_FILLCOLOR,
				mxConstants.HANDLE_STROKECOLOR);
		this.initBend(this.labelShape);
		this.labelShape.node.style.cursor = 'move';

		mxEvent.addListener(this.labelShape.node, 'dblclick', function(evt) {
					self.graph.dblClick(evt, self.state.cell);
					mxEvent.consume(evt);
				});
		mxEvent.addListener(this.labelShape.node, 'mousedown', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
							new mxMouseEvent(evt, self.state,
									mxEvent.LABEL_HANDLE));
				});
		this.redraw();
	};
	mxEdgeHandler.prototype.getSelectionPoints = function(state) {
		return state.absolutePoints;
	};
	mxEdgeHandler.prototype.createSelectionShape = function(points) {
		var shape = new mxPolyline(points, this.selectionColor);
		shape.strokewidth = mxConstants.SELECTION_STROKEWIDTH;
		shape.isDashed = mxConstants.SELECTION_DASHED;
		return shape;
	};
	mxEdgeHandler.prototype.createMarker = function() {
		var marker = new mxCellMarker(this.graph);
		var self = this;

		marker.getCell = function(me) {
			var cell = mxCellMarker.prototype.getCell.apply(this, arguments);
			var model = self.graph.getModel();
			if (cell == self.state.cell
					|| (cell != null && !self.graph.connectableEdges && model
							.isEdge(cell))) {
				cell = null;
			}
			return cell;
		};
		marker.isValidState = function(state) {
			var model = self.graph.getModel();
			var other = model.getTerminal(self.state.cell, !self.isSource);
			var source = (self.isSource) ? state.cell : other;
			var target = (self.isSource) ? other : state.cell;
			self.error = self.validateConnection(source, target);
			return self.error == null;
		};
		return marker;
	};
	mxEdgeHandler.prototype.validateConnection = function(source, target) {
		return this.graph.getEdgeValidationError(this.state.cell, source,
				target);
	};
	mxEdgeHandler.prototype.createBends = function() {
		var cell = this.state.cell;
		var bends = new Array();
		for (var i = 0; i < this.abspoints.length; i++) {
			if (this.isHandleVisible(i)) {
				var source = i == 0;
				var target = i == this.abspoints.length - 1;
				var terminal = source || target;
				if (terminal || this.graph.isCellBendable(cell)) {
					var bend = this.createHandleShape(i);
					this.initBend(bend);
					if (this.isHandleEnabled(i)) {
						bend.node.style.cursor = 'all-scroll';
						this.installListeners(bend, bends.length);
					}
					bends.push(bend);
					if (!terminal) {
						this.points.push(new mxPoint(0, 0));
					}
				}
			}
		}
		return bends;
	};
	mxEdgeHandler.prototype.isHandleEnabled = function(index) {
		return true;
	};
	mxEdgeHandler.prototype.isHandleVisible = function(index) {
		return !this.abspoints[index].isRouted;
	};
	mxEdgeHandler.prototype.createHandleShape = function(index) {
		return new mxRectangleShape(new mxRectangle(),
				mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
	};
	mxEdgeHandler.prototype.initBend = function(bend) {
		if (this.graph.dialect == mxConstants.DIALECT_SVG) {
			bend.dialect = mxConstants.DIALECT_PREFERHTML;
			bend.init(this.graph.container);
		} else {
			bend.dialect = this.graph.dialect;
			bend.init(this.graph.getView().getOverlayPane());
		}
	};
	mxEdgeHandler.prototype.mouseDown = function(sender, me) {
		if (me.getState() == this.state) {
			if (me.getHandle() == mxEvent.LABEL_HANDLE
					&& !this.graph.isLabelMovable(me.getCell())) {
				me.consume();
			} else if (this.graph.isEnabled()
					&& !this.graph.isForceMarqueeEvent(me.getEvent())
					&& this.marker != null && me.getHandle() != null) {
				this.start(me.getX(), me.getY(), me.getHandle());
				me.consume();
			}
		}
	};
	mxEdgeHandler.prototype.start = function(x, y, index) {
		this.startX = x;
		this.startY = y;
		this.isSource = index == 0;
		this.isTarget = index == this.bends.length - 1;
		this.isLabel = index == mxEvent.LABEL_HANDLE;
		if (this.isSource || this.isTarget) {
			var cell = this.state.cell;
			var terminal = this.graph.model.getTerminal(cell, this.isSource);
			if (terminal == null
					|| this.graph.isCellDisconnectable(cell, terminal,
							this.isSource)) {
				var p0 = this.abspoints[0];
				var pe = this.abspoints[this.abspoints.length - 1];
				this.abspoints = new Array();
				this.abspoints.push(p0);
				this.abspoints.push(pe);
				this.index = index;
			}
		} else {
			this.index = index;
		}
	};
	mxEdgeHandler.prototype.mouseMove = function(sender, me) {
		if (this.index != null && this.marker != null) {
			var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
			var point = mxUtils.convertPoint(this.graph.container, me.getX(),
					me.getY(), gridEnabled);
			if (gridEnabled) {
				var view = this.graph.getView();
				var scale = view.scale;
				point.x = this.graph.snap(point.x / scale) * scale;
				point.y = this.graph.snap(point.y / scale) * scale;
			}
			if (this.isLabel) {
				this.label.x = point.x;
				this.label.y = point.y;
			} else {

				var clone = this.state.clone();
				var geometry = this.graph.getCellGeometry(this.state.cell);
				var points = geometry.points;
				var source = null;
				var target = null;
				if (this.isSource || this.isTarget) {
					this.marker.process(me);
					var currentState = this.marker.getValidState();
					target = this.graph.getView().getVisibleTerminal(
							this.state.cell, !this.isSource);
					if (currentState != null) {
						source = currentState.cell;
					} else {
						clone.setAbsoluteTerminalPoint(point, this.isSource);
						if (this.marker.getMarkedState() == null) {
							this.error = (this.graph.allowDanglingEdges)
									? null
									: '';
						}
					}
					if (!this.isSource) {
						var tmp = source;
						source = target;
						target = tmp;
					}
				} else {
					this.convertPoint(point, gridEnabled);
					if (points == null) {
						points = [point];
					} else {
						points[this.index - 1] = point;
					}
					this.points = points;
					this.active = true;
					source = clone.view.getVisibleTerminal(this.state.cell,
							true);
					target = clone.view.getVisibleTerminal(this.state.cell,
							false);
				}
				// xiaoxiong 20120510 分支不能直接连接到结束或开始节点 (ellipse - > 开始 结束
				// ；rhombus - > 分支)
				if(source != null && target != null && (source.getStyle().substring(0,7)=='rhombus'||source.getStyle().substring(0,7)=='ellipse') && (target.getStyle().substring(0,7) == 'ellipse'||target.getStyle().substring(0,7) == 'rhombus')){
					return ;
				}
				clone.view.updatePoints(clone, points, source, target);
				clone.view.updateTerminalPoints(clone, source, target);

				var color = (this.error == null)
						? this.marker.validColor
						: this.marker.invalidColor;
				this.setPreviewColor(color);
				this.abspoints = clone.absolutePoints;
			}
			this.drawPreview();
			me.consume();
		}
	};
	mxEdgeHandler.prototype.mouseUp = function(sender, me) {
		if (this.index != null && this.marker != null) {
			var edge = this.state.cell;
			if (me.getX() != this.startX || me.getY() != this.startY) {

				if (this.error != null) {
					if (this.error.length > 0) {
						this.graph.validationAlert(this.error);
					}
				} else if (this.isLabel) {
					this.moveLabel(this.state, this.label.x, this.label.y);
				} else if (this.isSource || this.isTarget) {
					if (this.marker.hasValidState()) {
						var edge = this.connect(edge, this.marker
										.getValidState().cell, this.isSource,
								this.graph.isCloneEvent(me.getEvent())
										&& this.cloneEnabled
										&& this.graph.isCellsCloneable());
					} else if (this.graph.allowDanglingEdges) {
						var pt = this.graph.getPointForEvent(me.getEvent());
						var pstate = this.graph.getView().getState(this.graph
								.getModel().getParent(edge));
						if (pstate != null) {
							pt.x -= pstate.origin.x;
							pt.y -= pstate.origin.y;
						}
						this.changeTerminalPoint(edge, pt, this.isSource);
					}
				} else if (this.active) {
					this.changePoints(edge, this.points);
				} else {
					this.graph.getView().invalidate(this.state.cell);
					this.graph.getView().revalidate(this.state.cell);
				}
				this.abspoints = this.state.absolutePoints;
			}

			if (this.marker != null) {
				this.reset();
				if (edge != this.state.cell) {
					this.graph.setSelectionCell(edge);
				}
			}
			me.consume();
		}
	};
	mxEdgeHandler.prototype.reset = function() {
		this.error = null;
		this.index = null;
		this.label = null;
		this.active = false;
		this.isLabel = false;
		this.isSource = false;
		this.isTarget = false;
		this.marker.reset();
		this.setPreviewColor(this.selectionColor);
		this.redraw();
	};
	mxEdgeHandler.prototype.setPreviewColor = function(color) {
		if (this.shape != null && this.shape.node != null) {
			if (this.shape.dialect == mxConstants.DIALECT_SVG) {
				this.shape.innerNode.setAttribute('stroke', color);
			} else {
				this.shape.node.setAttribute('strokecolor', color);
			}
		}
	};
	mxEdgeHandler.prototype.convertPoint = function(point, gridEnabled) {
		var scale = this.graph.getView().getScale();
		var tr = this.graph.getView().getTranslate();
		if (gridEnabled) {
			point.x = this.graph.snap(point.x);
			point.y = this.graph.snap(point.y);
		}
		point.x = point.x / scale - tr.x;
		point.y = point.y / scale - tr.y;
		return point;
	};
	mxEdgeHandler.prototype.moveLabel = function(edgeState, x, y) {
		var model = this.graph.getModel();
		var geometry = model.getGeometry(edgeState.cell);
		if (geometry != null) {
			geometry = geometry.clone();
			var pt = this.graph.getView().getRelativePoint(edgeState, x, y);
			geometry.x = pt.x;
			geometry.y = pt.y;

			var scale = this.graph.getView().scale;
			geometry.offset = new mxPoint(0, 0);
			var pt = this.graph.view.getPoint(edgeState, geometry);
			geometry.offset = new mxPoint((x - pt.x) / scale, (y - pt.y)
							/ scale);
			model.setGeometry(edgeState.cell, geometry);
		}
	};
	mxEdgeHandler.prototype.connect = function(edge, terminal, isSource,
			isClone) {
		var model = this.graph.getModel();
		var parent = model.getParent(edge);
		model.beginUpdate();
		try {
			if (isClone) {
				var clone = edge.clone();
				model.add(parent, clone, model.getChildCount(parent));
				var other = model.getTerminal(edge, !isSource);
				model.setTerminal(clone, other, !isSource);
				edge = clone;
			}
			if (terminal == null) {
				var scale = this.graph.getView().scale;
				var tr = this.graph.getView().translate;
				var pstate = this.graph.getView().getState(parent);
				var dx = (pstate != null) ? pstate.origin.x : 0;
				var dy = (pstate != null) ? pstate.origin.y : 0;
				var current = this.abspoints[(isSource)
						? 0
						: this.abspoints.length - 1];
				var geo = model.getGeometry(edge).clone();
				geo.setTerminalPoint(
						new mxPoint((current.x - dx) / scale - tr.x,
								(current.y - dy) / scale - tr.y), isSource);
				model.setGeometry(edge, geo);
				model.setTerminal(edge, null, isSource);
			} else {
				this.graph.connectCell(edge, terminal, isSource);
			}
		} finally {
			model.endUpdate();
		}
		return edge;
	};
	mxEdgeHandler.prototype.changeTerminalPoint = function(edge, point,
			isSource) {
		var model = this.graph.getModel();
		var geo = model.getGeometry(edge);
		if (geo != null) {
			model.beginUpdate();
			try {
				geo = geo.clone();
				geo.setTerminalPoint(point, isSource);
				model.setGeometry(edge, geo);
				model.setTerminal(edge, null, isSource);
			} finally {
				model.endUpdate();
			}
		}
	};
	mxEdgeHandler.prototype.changePoints = function(edge, points) {
		var model = this.graph.getModel();
		var geo = model.getGeometry(edge);
		if (geo != null) {
			geo = geo.clone();
			geo.points = points;
			model.setGeometry(edge, geo);
		}
	};
	mxEdgeHandler.prototype.getHandleFillColor = function(index) {
		var isSource = index == 0;
		var cell = this.state.cell;
		var terminal = this.graph.getModel().getTerminal(cell, isSource);
		var color = mxConstants.HANDLE_FILLCOLOR;
		if (terminal != null) {
			if (this.graph.isCellDisconnectable(cell, terminal, isSource)) {
				color = mxConstants.CONNECT_HANDLE_FILLCOLOR;
			} else {
				color = mxConstants.LOCKED_HANDLE_FILLCOLOR;
			}
		}
		return color;
	}
	mxEdgeHandler.prototype.redraw = function() {
		this.abspoints = this.state.absolutePoints;
		var cell = this.state.cell;
		var s = (this.graph.dialect == mxConstants.DIALECT_SVG) ? 2 : 3;
		this.label = new mxPoint(this.state.absoluteOffset.x,
				this.state.absoluteOffset.y);
		var bounds = new mxRectangle(this.label.x - s, this.label.y - s, 2 * s,
				2 * s);
		this.labelShape.bounds = bounds;
		this.labelShape.redraw();
		var lab = this.graph.getLabel(cell);
		if (lab != null && lab.length > 0 && this.graph.isLabelMovable(cell)) {
			this.labelShape.node.style.visibility = 'visible';
		} else {
			this.labelShape.node.style.visibility = 'hidden';
		}
		if (this.bends != null && this.bends.length > 0) {
			var model = this.graph.getModel();
			s = (this.graph.dialect == mxConstants.DIALECT_SVG) ? 3 : 4;
			var n = this.abspoints.length - 1;
			var p0 = this.abspoints[0];
			var x0 = this.abspoints[0].x;
			var y0 = this.abspoints[0].y;
			this.bends[0].bounds = new mxRectangle(x0 - s, y0 - s, 2 * s, 2 * s);
			this.bends[0].fill = this.getHandleFillColor(0);
			this.bends[0].reconfigure();
			this.bends[0].redraw();
			var pe = this.abspoints[n];
			var xn = this.abspoints[n].x;
			var yn = this.abspoints[n].y;
			var bn = this.bends.length - 1;
			this.bends[bn].bounds = new mxRectangle(xn - s, yn - s, 2 * s, 2
							* s);
			this.bends[bn].fill = this.getHandleFillColor(bn);
			this.bends[bn].reconfigure();
			this.bends[bn].redraw();
			this.redrawInnerBends(p0, pe);
		}
		this.drawPreview();
	};
	mxEdgeHandler.prototype.redrawInnerBends = function(p0, pe) {
		var s = (this.graph.dialect == mxConstants.DIALECT_SVG) ? 3 : 4;
		var g = this.graph.getModel().getGeometry(this.state.cell);
		var pts = g.points;
		if (pts != null) {
			for (var i = 1; i < this.bends.length - 1; i++) {
				if (this.abspoints[i] != null) {
					var x = this.abspoints[i].x;
					var y = this.abspoints[i].y;
					this.bends[i].bounds = new mxRectangle(x - s, y - s, 2 * s,
							2 * s);
					this.bends[i].redraw();
					this.points[i - 1] = pts[i - 1];
				} else if (this.bends[i] != null) {
					this.bends[i].destroy();
					this.bends[i] = null;
				}
			}
		}
	};
	mxEdgeHandler.prototype.drawPreview = function() {
		if (this.isLabel) {
			var s = (this.graph.dialect == mxConstants.DIALECT_SVG) ? 2 : 3;
			var bounds = new mxRectangle(this.label.x - s, this.label.y - s, 2
							* s, 2 * s);
			this.labelShape.bounds = bounds;
			this.labelShape.redraw();
		} else {
			this.shape.points = this.abspoints;
			this.shape.redraw();
		}
		mxUtils.repaintGraph(this.graph,
				this.shape.points[this.shape.points.length - 1]);
	};
	mxEdgeHandler.prototype.installListeners = function(bend, handle) {
		var self = this;
		mxEvent.addListener(bend.node, 'mousedown', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
							new mxMouseEvent(evt, self.state, handle));
				});
		mxEvent.addListener(bend.node, 'mouseup', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_UP,
							new mxMouseEvent(evt, self.state, handle));
				});
	};
	mxEdgeHandler.prototype.destroy = function() {
		this.graph.removeMouseListener(this);
		this.marker.destroy();
		this.marker = null;
		this.shape.destroy();
		this.shape = null;
		this.labelShape.destroy();
		this.labelShape = null;
		if (this.bends != null) {
			for (var i = 0; i < this.bends.length; i++) {
				if (this.bends[i] != null) {
					this.bends[i].destroy();
					this.bends[i] = null;
				}
			}
		}
	};
}

{
	function mxElbowEdgeHandler(state) {
		if (state != null) {
			this.state = state;
			this.graph = this.state.view.graph;
			this.graph.addMouseListener(this);
			this.marker = this.createMarker();
			this.init();
		}
	};
	mxElbowEdgeHandler.prototype = new mxEdgeHandler();
	mxElbowEdgeHandler.prototype.constructor = mxElbowEdgeHandler;
	mxElbowEdgeHandler.prototype.flipEnabled = true;
	mxElbowEdgeHandler.prototype.doubleClickOrientationResource = (mxClient.language != 'none')
			? 'doubleClickOrientation'
			: '';
	mxElbowEdgeHandler.prototype.createBends = function() {
		var bends = new Array();
		var bend = new mxRectangleShape(new mxRectangle(),
				mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
		this.initBend(bend);
		bend.node.style.cursor = 'all-scroll';
		this.installListeners(bend, bends.length);
		bends.push(bend);
		bends.push(this.createVirtualBend());
		this.points.push(new mxPoint(0, 0));
		bend = new mxRectangleShape(new mxRectangle(),
				mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
		this.initBend(bend);
		bend.node.style.cursor = 'all-scroll';
		this.installListeners(bend, bends.length);
		bends.push(bend);
		return bends;
	};
	mxElbowEdgeHandler.prototype.createVirtualBend = function() {
		var bend = new mxRectangleShape(new mxRectangle(0, 0, 1, 1),
				mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
		this.initBend(bend);
		var crs = this.getCursorForBend();
		bend.node.style.cursor = crs;
		if (this.graph.isCellBendable(this.state.cell)) {
			this.installListeners(bend, 1);
		} else {
			bend.node.style.visibility = 'hidden';
		}
		var self = this;
		mxEvent.addListener(bend.node, 'dblclick', function(evt) {
					if (self.flipEnabled) {
						self.graph.flipEdge(self.state.cell, evt);
						mxEvent.consume(evt);
					}
				});
		var tip = this.doubleClickOrientationResource;
		tip = mxResources.get(tip) || tip;

		mxEvent.addListener(bend.node, 'mousemove', function(evt) {
					self.graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
							new mxMouseEvent(evt, self.state, null, tip));
				});
		return bend;
	};
	mxElbowEdgeHandler.prototype.getCursorForBend = function() {
		return (this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.TopToBottom
				|| this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_TOPTOBOTTOM || ((this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.ElbowConnector || this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_ELBOW) && this.state.style[mxConstants.STYLE_ELBOW] == mxConstants.ELBOW_VERTICAL))
				? 'row-resize'
				: 'col-resize';
	};
	mxElbowEdgeHandler.prototype.convertPoint = function(point, gridEnabled) {
		var scale = this.graph.getView().getScale();
		var tr = this.graph.getView().getTranslate();
		var origin = this.state.origin;
		if (gridEnabled) {
			point.x = this.graph.snap(point.x);
			point.y = this.graph.snap(point.y);
		}
		point.x = point.x / scale - tr.x - origin.x;
		point.y = point.y / scale - tr.y - origin.y;
	};
	mxElbowEdgeHandler.prototype.redrawInnerBends = function(p0, pe) {
		var s = (this.graph.dialect == mxConstants.DIALECT_SVG) ? 3 : 4;
		var g = this.graph.getModel().getGeometry(this.state.cell);
		var pts = g.points;
		var pt = (pts != null) ? pts[0] : null;
		if (pt == null) {
			pt = new mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
		} else {
			pt = new mxPoint(
					this.graph.getView().scale
							* (pt.x + this.graph.getView().translate.x + this.state.origin.x),
					this.graph.getView().scale
							* (pt.y + this.graph.getView().translate.y + this.state.origin.y));
		}

		var bounds = new mxRectangle(pt.x - s, pt.y - s, 2 * s, 2 * s);
		if (this.labelShape.node.style.visibility != 'hidden'
				&& mxUtils.intersects(bounds, this.labelShape.bounds)) {
			s += 1;
			bounds = new mxRectangle(pt.x - s, pt.y - s, 2 * s, 2 * s);
		}
		this.bends[1].bounds = bounds;
		this.bends[1].reconfigure();
		this.bends[1].redraw();
	};
}

{
	function mxKeyHandler(graph, target) {
		if (graph != null) {
			this.graph = graph;
			this.target = target || document.documentElement;
			this.normalKeys = new Array();
			this.controlKeys = new Array();
			var self = this;
			mxEvent.addListener(this.target, "keydown", function(evt) {
						self.keyDown(evt);
					});
			if(mxClient.IS_IE) {
				mxEvent.addListener(window, 'unload', function() {
							self.destroy();
						});
			}
		}
	};
	mxKeyHandler.prototype.graph = null;
	mxKeyHandler.prototype.target = null;
	mxKeyHandler.prototype.normalKeys = null;
	mxKeyHandler.prototype.controlKeys = null;
	mxKeyHandler.prototype.enabled = true;
	mxKeyHandler.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxKeyHandler.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxKeyHandler.prototype.bindKey = function(code, funct) {
		this.normalKeys[code] = funct;
	};
	mxKeyHandler.prototype.bindControlKey = function(code, funct) {
		this.controlKeys[code] = funct;
	};
	mxKeyHandler.prototype.getFunction = function(evt) {
		if (evt != null) {
			return (mxEvent.isControlDown(evt))
					? this.controlKeys[evt.keyCode]
					: this.normalKeys[evt.keyCode];
		}
		return null;
	};
	mxKeyHandler.prototype.isGraphEvent = function(evt) {
		var source = mxEvent.getSource(evt);

		if ((source == this.target || source.parentNode == this.target)
				|| (this.graph.cellEditor != null && source == this.graph.cellEditor.textarea)) {
			return true;
		}
		var elt = source;
		while (elt != null) {
			if (elt == this.graph.container) {
				return true;
			}
			elt = elt.parentNode;
		}
		return false;
	};
	mxKeyHandler.prototype.keyDown = function(evt) {
		if (this.graph.isEnabled() && this.isGraphEvent(evt)
				&& this.isEnabled()) {
			if (this.graph.isEditing()
					&& ((evt.keyCode == 13 && !mxEvent.isControlDown(evt) && !mxEvent
							.isShiftDown(evt)) || (evt.keyCode == 113))) {
				this.enter(evt);
			} else if (evt.keyCode == 27) {
				this.escape(evt);
			} else if (!this.graph.isEditing()) {
				var boundFunction = this.getFunction(evt);
				if (boundFunction != null) {
					boundFunction(evt);
					mxEvent.consume(evt);
				}
			}
		}
	};
	mxKeyHandler.prototype.enter = function(evt) {
		if (this.graph.isEnterStopsCellEditing) {
			this.graph.stopEditing(false);
		}
	};
	mxKeyHandler.prototype.escape = function(evt) {
		if (this.graph.isEscapeEnabled()) {
			this.graph.escape(evt);
		}
	};
	mxKeyHandler.prototype.destroy = function() {
		this.target = null;
	};
}

{
	function mxTooltipHandler(graph, delay) {
		if (graph != null) {
			this.graph = graph;
			this.delay = delay || 500;
			if (document.body != null) {
				this.graph.addMouseListener(this);
			}
		}
	};
	mxTooltipHandler.prototype.zIndex = 10005;
	mxTooltipHandler.prototype.graph = null;
	mxTooltipHandler.prototype.delay = null;
	mxTooltipHandler.prototype.hideOnHover = false;
	mxTooltipHandler.prototype.enabled = true;
	mxTooltipHandler.prototype.isEnabled = function() {
		return this.enabled;
	};
	mxTooltipHandler.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};
	mxTooltipHandler.prototype.isHideOnHover = function() {
		return this.hideOnHover;
	};
	mxTooltipHandler.prototype.setHideOnHover = function(value) {
		this.hideOnHover = value;
	};
	mxTooltipHandler.prototype.init = function() {
		if (document.body != null) {
			this.div = document.createElement('div');
			this.div.className = 'mxTooltip';
			this.div.style.visibility = 'hidden';
			this.div.style.zIndex = this.zIndex;
			if (!true && mxClient.TOOLTIP_SHADOWS) {
				this.shadow = document.createElement('div');
				this.shadow.className = 'mxTooltipShadow';
				this.shadow.style.visibility = 'hidden';
				this.shadow.style.zIndex = this.zIndex;
				mxUtils.setOpacity(this.shadow, 70);
				document.body.appendChild(this.shadow);
			} else if (true && !mxClient.TOOLTIP_SHADOWS) {
				this.div.style.filter = '';
			}
			document.body.appendChild(this.div);
			var self = this;
			mxEvent.addListener(this.div, 'mousedown', function(evt) {
						self.hide();
					});
		}
	};
	mxTooltipHandler.prototype.mouseDown = function(sender, me) {
		this.reset(me, false);
		this.hide();
	};
	mxTooltipHandler.prototype.mouseMove = function(sender, me) {
		if (me.getX() != this.lastX || me.getY() != this.lastY) {
			this.reset(me, true);
			if (this.isHideOnHover() || me.getCell() != this.cell
					|| me.getHandle() != this.index) {
				this.hide();
			}
		}
		this.lastX = me.getX();
		this.lastY = me.getY();
	};
	mxTooltipHandler.prototype.mouseUp = function(sender, me) {
		this.reset(me, true);
		this.hide();
	};
	mxTooltipHandler.prototype.reset = function(me, restart) {
		if (this.thread != null) {
			window.clearTimeout(this.thread);
			this.thread = null;
		}
		if (restart && this.isEnabled() && me.getState() != null
				&& this.div.style.visibility == 'hidden') {
			var x = me.getX();
			var y = me.getY();
			var self = this;
			this.thread = window.setTimeout(function() {
						if (!self.graph.isEditing()
								&& !self.graph.panningHandler.isMenuShowing()) {
							var tip = self.graph.getTooltipForEvent(me);
							self.show(tip, x, y);
							self.cell = me.getCell();
							self.index = me.getHandle();
						}
					}, this.delay);
		}
	};
	mxTooltipHandler.prototype.hide = function() {
		if (this.shadow != null) {
			this.shadow.style.visibility = 'hidden';
		}
		if (this.div != null) {
			this.div.style.visibility = 'hidden';
		}
	};
	mxTooltipHandler.prototype.show = function(tip, x, y) {
		if (tip != null && tip.length > 0) {
			var origin = mxUtils.getScrollOrigin();
			this.div.style.left = (x + origin.x) + 'px';
			this.div.style.top = (y + mxConstants.TOOLTIP_VERTICAL_OFFSET + origin.y)
					+ 'px';
			if (!mxUtils.isNode(tip)) {
				this.div.innerHTML = tip.replace(/\n/g, '<br>');
			} else {
				this.div.innerHTML = '';
				this.div.appendChild(tip);
			}
			this.div.style.visibility = '';
			mxUtils.fit(this.div);
			if (this.shadow != null) {
				this.shadow.style.width = this.div.offsetWidth + 'px';
				this.shadow.style.height = this.div.offsetHeight + 'px';
				this.shadow.style.left = (parseInt(this.div.style.left) + 3)
						+ 'px';
				this.shadow.style.top = (parseInt(this.div.style.top) + 3)
						+ 'px';
				this.shadow.style.visibility = '';
			}
		}
	};
	mxTooltipHandler.prototype.destroy = function() {
		this.graph.removeMouseListener(this);
		mxEvent.release(this.div);
		if (this.div != null && this.div.parentNode != null) {
			this.div.parentNode.removeChild(this.div);
		}
		this.div = null;
		if (this.shadow != null) {
			mxEvent.release(this.shadow);
			if (this.shadow.parentNode != null) {
				this.shadow.parentNode.removeChild(this.shadow);
			}
			this.shadow = null;
		}
	};
}

{
	function mxCellTracker(graph, color, funct) {
		mxCellMarker.call(this, graph, color);
		this.graph.addMouseListener(this);
		if (funct != null) {
			this.getCell = funct;
		}
		if(mxClient.IS_IE) {
			var self = this;
			mxEvent.addListener(window, 'unload', function() {
						self.destroy();
					});
		}
	};
	mxCellTracker.prototype = new mxCellMarker();
	mxCellTracker.prototype.constructor = mxCellTracker;
	mxCellTracker.prototype.mouseDown = function(sender, me) {
	};
	mxCellTracker.prototype.mouseMove = function(sender, me) {
		if (this.isEnabled()) {
			this.process(me);
		}
	};
	mxCellTracker.prototype.mouseUp = function(sender, me) {
		this.reset();
	};
	mxCellTracker.prototype.destroy = function() {
		if (!this.destroyed) {
			this.destroyed = true;
			this.graph.removeMouseListener(this);
			mxCellMarker.prototype.destroy.apply(this);
		}
	};
}

{
	function mxCellHighlight(graph, highlightColor, strokeWidth) {
		if (graph != null) {
			this.graph = graph;
			highlightColor = (highlightColor != null)
					? highlightColor
					: mxConstants.DEFAULT_VALID_COLOR;
			strokeWidth = (strokeWidth != null)
					? strokeWidth
					: mxConstants.HIGHLIGHT_STROKEWIDTH;
			this.shape = new mxRectangleShape(new mxRectangle(), null,
					highlightColor, strokeWidth);
			if (false || false || false) {

				this.shape.dialect = mxConstants.DIALECT_STRICTHTML;
				this.shape.init(this.graph.container);
				mxEvent.redirectMouseEvents(this.shape.node, this.graph, null,
						null, true, true, true);
			} else {
				this.shape.dialect = (graph.dialect != mxConstants.DIALECT_SVG)
						? mxConstants.DIALECT_VML
						: mxConstants.DIALECT_SVG;
				this.shape.init(graph.getView().getOverlayPane());
				var self = this;
				mxEvent.addListener(this.shape.node, 'mousedown',
						function(evt) {
							graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
									new mxMouseEvent(evt, self.state));
						});
				mxEvent.addListener(this.shape.node, 'mousemove',
						function(evt) {
							graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
									new mxMouseEvent(evt, self.state));
						});
				mxEvent.addListener(this.shape.node, 'mouseup', function(evt) {
							graph.fireMouseEvent(mxEvent.MOUSE_UP,
									new mxMouseEvent(evt, self.state));
						});
			}
			this.shape.node.style.display = 'none';
			this.edgeShape = new mxPolyline([new mxPoint(), new mxPoint()],
					highlightColor, strokeWidth);
			this.edgeShape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG)
					? mxConstants.DIALECT_VML
					: mxConstants.DIALECT_SVG;
			this.edgeShape.init(graph.getView().getOverlayPane());
			this.edgeShape.node.style.display = 'none';
			mxEvent.addListener(this.edgeShape.node, 'mousedown',
					function(evt) {
						graph.fireMouseEvent(mxEvent.MOUSE_DOWN,
								new mxMouseEvent(evt, self.state));
					});
			mxEvent.addListener(this.edgeShape.node, 'mousemove',
					function(evt) {
						graph.fireMouseEvent(mxEvent.MOUSE_MOVE,
								new mxMouseEvent(evt, self.state));
					});
			mxEvent.addListener(this.edgeShape.node, 'mouseup', function(evt) {
						graph.fireMouseEvent(mxEvent.MOUSE_UP,
								new mxMouseEvent(evt, self.state));
					});
			var self = this;
			this.resetHandler = function(sender) {
				self.hide();
			};
			this.graph.getView().addListener(mxEvent.SCALE, this.resetHandler);
			this.graph.getView().addListener(mxEvent.TRANSLATE,
					this.resetHandler);
			this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE,
					this.resetHandler);
			this.graph.getView().addListener(mxEvent.DOWN, this.resetHandler);
			this.graph.getView().addListener(mxEvent.UP, this.resetHandler);
			this.graph.getModel()
					.addListener(mxEvent.CHANGE, this.resetHandler);
			this.setHighlightColor((highlightColor != null)
					? highlightColor
					: mxConstants.DEFAULT_VALID_COLOR);
		}
	};
	mxCellHighlight.prototype.graph = true;
	mxCellHighlight.prototype.state = null;
	mxCellHighlight.prototype.resetHandler = null;
	mxCellHighlight.prototype.setHighlightColor = function(color) {
		if (this.shape.dialect == mxConstants.DIALECT_SVG) {
			this.shape.innerNode.setAttribute('stroke', color);
		} else if (this.shape.dialect == mxConstants.DIALECT_VML) {
			this.shape.node.setAttribute('strokecolor', color);
		} else {
			this.shape.node.style.borderColor = color;
		}
		if (this.edgeShape.dialect == mxConstants.DIALECT_SVG) {
			this.edgeShape.innerNode.setAttribute('stroke', color);
		} else {
			this.edgeShape.node.setAttribute('strokecolor', color);
		}
	};
	mxCellHighlight.prototype.hide = function() {
		this.highlight();
	};
	mxCellHighlight.prototype.highlight = function(state) {
		if (this.state != state) {
			if (state == null) {
				this.shape.node.style.display = 'none';
				this.edgeShape.node.style.display = 'none';
			} else {
				var shape = null;
				if (this.graph.model.isEdge(state.cell)) {
					shape = this.edgeShape;
					shape.points = state.absolutePoints;
					this.shape.node.style.display = 'none';
				} else {
					shape = this.shape;
					var bounds = new mxRectangle(state.x, state.y, state.width,
							state.height);
					bounds.x -= 2;
					bounds.y -= 2;
					if (this.shape.dialect == mxConstants.DIALECT_STRICTHTML) {
						bounds.width -= 2;
						bounds.height -= 2;
					} else {
						bounds.width += 4;
						bounds.height += 4;
					}
					shape.bounds = bounds;
					this.edgeShape.node.style.display = 'none';
				}
				shape.node.style.display = 'inline';
				shape.redraw();
				if (shape == this.edgeShape) {
					mxUtils.repaintGraph(this.graph, shape.points[0]);
				}
			}
			this.state = state;
		}
	};
	mxCellHighlight.prototype.destroy = function() {
		this.graph.getView().removeListener(this.resetHandler);
		this.graph.getModel().removeListener(this.resetHandler);
		if (this.shape != null) {
			this.shape.destroy();
			this.shape = null;
		}
		if (this.edgeShape != null) {
			this.edgeShape.destroy();
			this.edgeShape = null;
		}
	};
}

{
	function mxDefaultKeyHandler(editor) {
		if (editor != null) {
			this.editor = editor;
			this.handler = new mxKeyHandler(editor.graph);

			var old = this.handler.escape;
			this.handler.escape = function(evt) {
				old.apply(this, arguments);
				editor.hideProperties();
				editor.fireEvent(mxEvent.ESCAPE, evt);
			};
		}
	};
	mxDefaultKeyHandler.prototype.editor = null;
	mxDefaultKeyHandler.prototype.handler = null;
	mxDefaultKeyHandler.prototype.bindAction = function(code, action, control) {
		var self = this;
		var keyHandler = function() {
			self.editor.execute(action);
		};
		if (control) {
			this.handler.bindControlKey(code, keyHandler);
		} else {
			this.handler.bindKey(code, keyHandler);
		}
	};
	mxDefaultKeyHandler.prototype.destroy = function() {
		this.handler.destroy();
		this.handler = null;
	};
}

{
	function mxDefaultPopupMenu(config) {
		this.config = config;
	};
	mxDefaultPopupMenu.prototype.imageBasePath = null;
	mxDefaultPopupMenu.prototype.config = null;
	mxDefaultPopupMenu.prototype.createMenu = function(editor, menu, cell, evt) {
		if (this.config != null) {
			var conditions = this.createConditions(editor, cell, evt);
			var item = this.config.firstChild;
			this.addItems(editor, menu, cell, evt, conditions, item, null);
		}
	};
	mxDefaultPopupMenu.prototype.addItems = function(editor, menu, cell, evt,
			conditions, item, parent) {
		var addSeparator = false;
		while (item != null) {
			if (item.nodeName == 'add') {
				var condition = item.getAttribute('if');
				if (condition == null || conditions[condition]) {
					var as = item.getAttribute('as');
					as = mxResources.get(as) || as;
					var funct = mxUtils.eval(mxUtils.getTextContent(item));
					var action = item.getAttribute('action');
					var icon = item.getAttribute('icon');
					if (addSeparator) {
						menu.addSeparator(parent);
						addSeparator = false;
					}
					if (icon != null && this.imageBasePath) {
						icon = this.imageBasePath + icon;
					}
					var row = this.addAction(menu, editor, as, icon, funct,
							action, cell, parent);
					this.addItems(editor, menu, cell, evt, conditions,
							item.firstChild, row);
				}
			} else if (item.nodeName == 'separator') {
				addSeparator = true;
			}
			item = item.nextSibling;
		}
	};
	mxDefaultPopupMenu.prototype.addAction = function(menu, editor, lab, icon,
			funct, action, cell, parent) {
		var clickHandler = function() {
			if (typeof(funct) == 'function') {
				funct.call(editor, editor, cell);
			}
			if (action != null) {
				editor.execute(action, cell);
			}
		};
		return menu.addItem(lab, icon, clickHandler, parent);
	};
	mxDefaultPopupMenu.prototype.createConditions = function(editor, cell, evt) {
		var model = editor.graph.getModel();
		var childCount = model.getChildCount(cell);
		var conditions = new Array();
		conditions['nocell'] = cell == null;
		conditions['ncells'] = editor.graph.getSelectionCount() > 1;
		conditions['notRoot'] = model.getRoot() != model.getParent(editor.graph
				.getDefaultParent());
		conditions['cell'] = cell != null;
		var isCell = cell != null && editor.graph.getSelectionCount() == 1;
		conditions['nonEmpty'] = isCell && childCount > 0;
		conditions['expandable'] = isCell
				&& editor.graph.isCellFoldable(cell, false);
		conditions['collapsable'] = isCell
				&& editor.graph.isCellFoldable(cell, true);
		conditions['validRoot'] = isCell && editor.graph.isValidRoot(cell);
		conditions['emptyValidRoot'] = conditions['validRoot']
				&& childCount == 0;
		conditions['swimlane'] = isCell && editor.graph.isSwimlane(cell);
		var condNodes = this.config.getElementsByTagName('condition');
		for (var i = 0; i < condNodes.length; i++) {
			var funct = mxUtils.eval(mxUtils.getTextContent(condNodes[i]));
			var name = condNodes[i].getAttribute('name');
			if (name != null && typeof(funct) == 'function') {
				conditions[name] = funct(editor, cell, evt);
			}
		}
		return conditions;
	};
}

{
	function mxDefaultToolbar(container, editor) {
		this.editor = editor;
		if (container != null && editor != null) {
			this.init(container);
		}
	};
	mxDefaultToolbar.prototype.editor = null;
	mxDefaultToolbar.prototype.toolbar = null;
	mxDefaultToolbar.prototype.resetHandler = null;
	mxDefaultToolbar.prototype.spacing = 4;
	mxDefaultToolbar.prototype.connectOnDrop = false;
	mxDefaultToolbar.prototype.init = function(container) {
		if (container != null) {
			this.toolbar = new mxToolbar(container);

			var self = this;
			this.toolbar.addListener(mxEvent.SELECT, function(sender, evt) {
						var funct = evt.getArgAt(0);
						if (funct != null) {
							self.editor.insertFunction = function() {
								funct.apply(self, arguments);
								self.toolbar.resetMode();
							};
						} else {
							self.editor.insertFunction = null;
						}
					});
			this.resetHandler = function() {
				if (self.toolbar != null) {
					self.toolbar.resetMode(true);
				}
			};
			this.editor.graph.addListener(mxEvent.DOUBLE_CLICK,
					this.resetHandler);
			this.editor.addListener(mxEvent.ESCAPE, this.resetHandler);
		}
	};
	mxDefaultToolbar.prototype.addItem = function(title, icon, action, pressed) {
		var self = this;
		var clickHandler = function() {
			self.editor.execute(action);
		};
		return this.toolbar.addItem(title, icon, clickHandler, pressed);
	};
	mxDefaultToolbar.prototype.addSeparator = function(icon) {
		icon = icon || mxClient.imageBasePath + 'separator.gif';
		this.toolbar.addSeparator(icon);
	};
	mxDefaultToolbar.prototype.addCombo = function() {
		return this.toolbar.addCombo();
	};
	mxDefaultToolbar.prototype.addActionCombo = function(title) {
		return this.toolbar.addActionCombo(title);
	};
	mxDefaultToolbar.prototype.addActionOption = function(combo, title, action) {
		var self = this;
		var clickHandler = function() {
			self.editor.execute(action);
		};
		this.addOption(combo, title, clickHandler);
	};
	mxDefaultToolbar.prototype.addOption = function(combo, title, value) {
		return this.toolbar.addOption(combo, title, value);
	};
	mxDefaultToolbar.prototype.addMode = function(title, icon, mode, pressed,
			funct) {
		var self = this;
		var clickHandler = function() {
			self.editor.setMode(mode);
			if (funct != null) {
				funct(self.editor);
			}
		};
		return this.toolbar.addSwitchMode(title, icon, clickHandler, pressed);
	};
	mxDefaultToolbar.prototype.addPrototype = function(title, icon, ptype,
			pressed, insert) {
		var img = null;
		if (ptype == null) {
			img = this.toolbar.addMode(title, icon, null, pressed);
		} else {

			var factory = function() {
				if (typeof(ptype) == 'function') {
					return ptype();
				} else {
					return ptype.clone();
				}
			};

			var self = this;
			var clickHandler = function(evt, cell) {
				if (typeof(insert) == 'function') {
					insert(self.editor, factory(), evt, cell);
				} else {
					self.drop(factory(), evt, cell);
				}
				self.toolbar.resetMode();
				mxEvent.consume(evt);
			};
			img = this.toolbar.addMode(title, icon, clickHandler, pressed);

			var dropHandler = function(graph, evt, cell) {
				clickHandler(evt, cell);
			};
			this.installDropHandler(img, dropHandler);
		}
		return img;
	};
	mxDefaultToolbar.prototype.drop = function(vertex, evt, target) {
		var graph = this.editor.graph;
		var model = graph.getModel();
		if (target == null || model.isEdge(target) || !this.connectOnDrop
				|| !graph.isCellConnectable(target)) {
			while (target != null
					&& !graph.isValidDropTarget(target, [vertex], evt)) {
				target = model.getParent(target);
			}
			this.insert(vertex, evt, target);
		} else {
			this.connect(vertex, evt, target);
		}
	};
	mxDefaultToolbar.prototype.insert = function(vertex, evt, target) {
		var graph = this.editor.graph;
		if (graph.canImportCell(vertex)) {
			var pt = mxUtils.convertPoint(graph.container, evt.clientX,
					evt.clientY);
			if (graph.isSplitEnabled()
					&& graph.isSplitTarget(target, [vertex], evt)) {
				return graph.splitEdge(target, [vertex], null, pt.x, pt.y);
			} else {
				return this.editor.addVertex(target, vertex, pt.x, pt.y);
			}
		}
		return null;
	};
	mxDefaultToolbar.prototype.connect = function(vertex, evt, source) {
		var graph = this.editor.graph;
		var model = graph.getModel();
		if (source != null && graph.isCellConnectable(vertex)
				&& graph.isEdgeValid(null, source, vertex)) {
			var edge = null;
			model.beginUpdate();
			try {
				var geo = model.getGeometry(source);
				var g = model.getGeometry(vertex).clone();

				g.x = geo.x + (geo.width - g.width) / 2;
				g.y = geo.y + (geo.height - g.height) / 2;
				var step = this.spacing * graph.gridSize;
				var dist = model.getDirectedEdgeCount(source, true) * 20;
				if (this.editor.horizontalFlow) {
					g.x += (g.width + geo.width) / 2 + step + dist;
				} else {
					g.y += (g.height + geo.height) / 2 + step + dist;
				}
				vertex.setGeometry(g);

				var parent = model.getParent(source);
				graph.addCell(vertex, parent);
				graph.constrainChild(vertex);

				edge = this.editor.createEdge(source, vertex);
				if (model.getGeometry(edge) == null) {
					var edgeGeometry = new mxGeometry();
					edgeGeometry.relative = true;
					model.setGeometry(edge, edgeGeometry);
				}
				graph.addEdge(edge, parent, source, vertex);
			} finally {
				model.endUpdate();
			}
			graph.setSelectionCells([vertex, edge]);
			graph.scrollCellToVisible(vertex);
		}
	};
	mxDefaultToolbar.prototype.installDropHandler = function(img, dropHandler) {
		var sprite = document.createElement('img');
		sprite.setAttribute('src', img.getAttribute('src'));
		var self = this;
		var loader = function(evt) {
			sprite.style.width = (2 * img.offsetWidth) + 'px';
			sprite.style.height = (2 * img.offsetHeight) + 'px';
			mxUtils.makeDraggable(img, self.editor.graph, dropHandler, sprite);
			mxEvent.removeListener(sprite, 'load', loader);
		};
		if(mxClient.IS_IE) {
			loader();
		} else {
			mxEvent.addListener(sprite, 'load', loader);
		}
	};
	mxDefaultToolbar.prototype.destroy = function() {
		if (this.resetHandler != null) {
			this.editor.graph.removeListener('dblclick', this.resetHandler);
			this.editor.removeListener('escape', this.resetHandler);
			this.resetHandler = null;
		}
		if (this.toolbar != null) {
			this.toolbar.destroy();
			this.toolbar = null;
		}
	};
}

{
	function mxEditor(config) {
		this.actions = new Array();
		this.addActions();

		if (document.body != null) {
			this.cycleAttributeValues = new Array();
			this.popupHandler = new mxDefaultPopupMenu();
			this.undoManager = new mxUndoManager();
			this.graph = this.createGraph();
			this.toolbar = this.createToolbar();
			this.keyHandler = new mxDefaultKeyHandler(this);

			this.configure(config);
			this.graph.swimlaneIndicatorColorAttribute = this.cycleAttributeName;

			if (!mxClient.IS_LOCAL && this.urlInit != null) {
				this.createSession();
			}
			if (this.onInit != null) {

				var tmp = document.cookie;
				var isFirstTime = tmp.indexOf('mxgraph=seen') < 0;
				if (isFirstTime) {

					document.cookie = 'mxgraph=seen; expires=Fri, 27 Jul 2199 02:47:11 UTC; path=/';
				}
				this.onInit(isFirstTime);
			}
			if(mxClient.IS_IE) {
				var self = this;
				mxEvent.addListener(window, 'unload', function() {
							self.destroy();
						});
			}
		}
	};
	mxResources.add(mxClient.basePath + 'js/resources/editor');
	mxEditor.prototype = new mxEventSource();
	mxEditor.prototype.constructor = mxEditor;

	mxEditor.prototype.askZoomResource = (mxClient.language != 'none')
			? 'askZoom'
			: '';
	mxEditor.prototype.lastSavedResource = (mxClient.language != 'none')
			? 'lastSaved'
			: '';
	mxEditor.prototype.currentFileResource = (mxClient.language != 'none')
			? 'currentFile'
			: '';
	mxEditor.prototype.propertiesResource = (mxClient.language != 'none')
			? 'properties'
			: '';
	mxEditor.prototype.tasksResource = (mxClient.language != 'none')
			? 'tasks'
			: '';
	mxEditor.prototype.helpResource = (mxClient.language != 'none')
			? 'help'
			: '';
	mxEditor.prototype.outlineResource = (mxClient.language != 'none')
			? 'outline'
			: '';
	mxEditor.prototype.outline = null;
	mxEditor.prototype.graph = null;
	mxEditor.prototype.graphRenderHint = null;
	mxEditor.prototype.toolbar = null;
	mxEditor.prototype.status = null;
	mxEditor.prototype.popupHandler = null;
	mxEditor.prototype.undoManager = null;
	mxEditor.prototype.keyHandler = null;

	mxEditor.prototype.actions = null;
	mxEditor.prototype.dblClickAction = 'edit';
	mxEditor.prototype.swimlaneRequired = false;
	mxEditor.prototype.disableContextMenu = true;

	mxEditor.prototype.insertFunction = null;
	mxEditor.prototype.forcedInserting = false;
	mxEditor.prototype.templates = null;
	mxEditor.prototype.defaultEdge = null;
	mxEditor.prototype.defaultEdgeStyle = null;
	mxEditor.prototype.defaultGroup = null;
	mxEditor.prototype.groupBorderSize = null;

	mxEditor.prototype.filename = null;
	mxEditor.prototype.linefeed = '&#xa;';
	mxEditor.prototype.postParameterName = 'xml';
	mxEditor.prototype.escapePostData = false;
	mxEditor.prototype.urlPost = null;
	mxEditor.prototype.urlImage = null;
	mxEditor.prototype.urlInit = null;
	mxEditor.prototype.urlNotify = null;
	mxEditor.prototype.urlPoll = null;

	mxEditor.prototype.horizontalFlow = false;
	mxEditor.prototype.layoutDiagram = false;
	mxEditor.prototype.swimlaneSpacing = 0;
	mxEditor.prototype.maintainSwimlanes = false;
	mxEditor.prototype.layoutSwimlanes = false;

	mxEditor.prototype.cycleAttributeValues = null;
	mxEditor.prototype.cycleAttributeIndex = 0;
	mxEditor.prototype.cycleAttributeName = 'fillColor';

	mxEditor.prototype.helpWindowImage = null;
	mxEditor.prototype.urlHelp = null;
	mxEditor.prototype.tasksWindowImage = null;
	mxEditor.prototype.tasksTop = 20;
	mxEditor.prototype.helpWidth = 300;
	mxEditor.prototype.helpHeight = 260;
	mxEditor.prototype.propertiesWidth = 240;
	mxEditor.prototype.propertiesHeight = null;
	mxEditor.prototype.movePropertiesDialog = false;
	mxEditor.prototype.validating = false;
	mxEditor.prototype.modified = false;
	mxEditor.prototype.isModified = function() {
		return this.modified;
	};
	mxEditor.prototype.setModified = function(value) {
		this.modified = value;
	};
	mxEditor.prototype.addActions = function() {
		this.addAction('save', function(editor) {
					editor.save();
				});
		this.addAction('print', function(editor) {
					var preview = new mxPrintPreview(editor.graph, 1, null, 0,
							0, null, 'Printer-friendly version');
					preview.open();
				});
		this.addAction('show', function(editor) {
					mxUtils.show(editor.graph);
				});
		this.addAction('exportScreen', function(editor) {
					var url = editor.getUrlImage();
					if (url == null || mxClient.IS_LOCAL) {
						editor.execute('show');
					} else {
						var enc = new mxCodec();
						var node = enc.encode(editor.graph.getView());
					}
				});
		this.addAction('exportImage', function(editor) {
					var url = editor.getUrlImage();
					if (url == null || mxClient.IS_LOCAL) {
						editor.execute('show');
					} else {
						var node = mxUtils.getViewXml(editor.graph, 1);
						var xml = mxUtils.getXml(node, '\n');
						mxUtils.submit(url, editor.postParameterName + '='
										+ xml);
					}
				});
		this.addAction('refresh', function(editor) {
					editor.graph.refresh();
				});
		this.addAction('cut', function(editor) {
					if (editor.graph.isEnabled()) {
						mxClipboard.cut(editor.graph);
					}
				});
		this.addAction('copy', function(editor) {
					if (editor.graph.isEnabled()) {
						mxClipboard.copy(editor.graph);
					}
				});
		this.addAction('paste', function(editor) {
					if (editor.graph.isEnabled()) {
						mxClipboard.paste(editor.graph);
					}
				});
		this.addAction('delete', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.removeCells();
					}
				});
		this.addAction('group', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setSelectionCell(editor.groupCells());
					}
				});
		this.addAction('ungroup', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setSelectionCells(editor.graph
								.ungroupCells());
					}
				});
		this.addAction('removeFromParent', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.removeCellsFromParent();
					}
				});
		this.addAction('undo', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.undo();
					}
				});
		this.addAction('redo', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.redo();
					}
				});
		this.addAction('zoomIn', function(editor) {
					editor.graph.zoomIn();
				});
		this.addAction('zoomOut', function(editor) {
					editor.graph.zoomOut();
				});
		this.addAction('actualSize', function(editor) {
					editor.graph.zoomActual();
				});
		this.addAction('fit', function(editor) {
					editor.graph.fit();
				});
		this.addAction('showProperties', function(editor, cell) {
					editor.showProperties(cell);
				});
		this.addAction('selectAll', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectAll();
					}
				});
		this.addAction('selectNone', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.clearSelection();
					}
				});
		this.addAction('selectVertices', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectVertices();
					}
				});
		this.addAction('selectEdges', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectEdges();
					}
				});
		this.addAction('edit', function(editor, cell) {
					if (editor.graph.isEnabled()
							&& editor.graph.isCellEditable(cell)) {
						editor.graph.startEditingAtCell(cell);
					}
				});
		this.addAction('toBack', function(editor, cell) {
					if (editor.graph.isEnabled()) {
						editor.graph.orderCells(true);
					}
				});
		this.addAction('toFront', function(editor, cell) {
					if (editor.graph.isEnabled()) {
						editor.graph.orderCells(false);
					}
				});
		this.addAction('enterGroup', function(editor, cell) {
					editor.graph.enterGroup(cell);
				});
		this.addAction('exitGroup', function(editor) {
					editor.graph.exitGroup();
				});
		this.addAction('home', function(editor) {
					editor.graph.home();
				});
		this.addAction('selectPrevious', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectPreviousCell();
					}
				});
		this.addAction('selectNext', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectNextCell();
					}
				});
		this.addAction('selectParent', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectParentCell();
					}
				});
		this.addAction('selectChild', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.selectChildCell();
					}
				});
		this.addAction('collapse', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.foldCells(true);
					}
				});
		this.addAction('collapseAll', function(editor) {
					if (editor.graph.isEnabled()) {
						var cells = editor.graph.getChildVertices();
						editor.graph.foldCells(true, false, cells);
					}
				});
		this.addAction('expand', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.foldCells(false);
					}
				});
		this.addAction('expandAll', function(editor) {
					if (editor.graph.isEnabled()) {
						var cells = editor.graph.getChildVertices();
						editor.graph.foldCells(false, false, cells);
					}
				});
		this.addAction('bold', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.toggleCellStyleFlags(
								mxConstants.STYLE_FONTSTYLE,
								mxConstants.FONT_BOLD);
					}
				});
		this.addAction('italic', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.toggleCellStyleFlags(
								mxConstants.STYLE_FONTSTYLE,
								mxConstants.FONT_ITALIC);
					}
				});
		this.addAction('underline', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.toggleCellStyleFlags(
								mxConstants.STYLE_FONTSTYLE,
								mxConstants.FONT_UNDERLINE);
					}
				});
		this.addAction('shadow', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.toggleCellStyleFlags(
								mxConstants.STYLE_FONTSTYLE,
								mxConstants.FONT_SHADOW);
					}
				});
		this.addAction('alignCellsLeft', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.alignCells(mxConstants.ALIGN_LEFT);
					}
				});
		this.addAction('alignCellsCenter', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.alignCells(mxConstants.ALIGN_CENTER);
					}
				});
		this.addAction('alignCellsRight', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.alignCells(mxConstants.ALIGN_RIGHT);
					}
				});
		this.addAction('alignCellsTop', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.alignCells(mxConstants.ALIGN_TOP);
					}
				});
		this.addAction('alignCellsMiddle', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.alignCells(mxConstants.ALIGN_MIDDLE);
					}
				});
		this.addAction('alignCellsBottom', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.alignCells(mxConstants.ALIGN_BOTTOM);
					}
				});
		this.addAction('alignFontLeft', function(editor) {
					editor.graph.setCellStyles(mxConstants.STYLE_ALIGN,
							mxConstants.ALIGN_LEFT);
				});
		this.addAction('alignFontCenter', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setCellStyles(mxConstants.STYLE_ALIGN,
								mxConstants.ALIGN_CENTER);
					}
				});
		this.addAction('alignFontRight', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setCellStyles(mxConstants.STYLE_ALIGN,
								mxConstants.ALIGN_RIGHT);
					}
				});
		this.addAction('alignFontTop', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setCellStyles(
								mxConstants.STYLE_VERTICAL_ALIGN,
								mxConstants.ALIGN_TOP);
					}
				});
		this.addAction('alignFontMiddle', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setCellStyles(
								mxConstants.STYLE_VERTICAL_ALIGN,
								mxConstants.ALIGN_MIDDLE);
					}
				});
		this.addAction('alignFontBottom', function(editor) {
					if (editor.graph.isEnabled()) {
						editor.graph.setCellStyles(
								mxConstants.STYLE_VERTICAL_ALIGN,
								mxConstants.ALIGN_BOTTOM);
					}
				});
		this.addAction('zoom', function(editor) {
					var current = editor.graph.getView().scale * 100;
					var scale = parseFloat(mxUtils.prompt(mxResources
									.get(editor.askZoomResource)
									|| editor.askZoomResource, current))
							/ 100;
					if (!isNaN(scale)) {
						editor.graph.getView().setScale(scale);
					}
				});
		this.addAction('toggleTasks', function(editor) {
					if (editor.tasks != null) {
						editor.tasks.setVisible(!editor.tasks.isVisible());
					} else {
						editor.showTasks();
					}
				});
		this.addAction('toggleHelp', function(editor) {
					if (editor.help != null) {
						editor.help.setVisible(!editor.help.isVisible());
					} else {
						editor.showHelp();
					}
				});
		this.addAction('toggleOutline', function(editor) {
					if (editor.outline == null) {
						editor.showOutline();
					} else {
						editor.outline.setVisible(!editor.outline.isVisible());
					}
				});
		this.addAction('toggleConsole', function(editor) {
					mxLog.setVisible(!mxLog.isVisible());
				});
	};
	mxEditor.prototype.createSession = function() {
		var session = null;
		var self = this;

		var sessionChanged = function(session) {
			self.fireEvent(mxEvent.SESSION, new mxEventObject([session]));
		};
		session = this.connect(this.urlInit, this.urlPoll, this.urlNotify,
				sessionChanged);
		session.addListener(mxEvent.FIRED, function(sender, evt) {
					var changes = evt.getArgAt(0);
					if (changes.length < 10) {
						mxUtils.animateChanges(self.graph, changes);
					}
				});
		session.addListener(mxEvent.CONNECT, function(sender, evt) {
					self.resetHistory();
				});
	};
	mxEditor.prototype.configure = function(node) {
		if (node != null) {

			var dec = new mxCodec(node.ownerDocument);
			dec.decode(node, this);

			this.resetHistory();
		}
	};
	mxEditor.prototype.resetFirstTime = function() {
		document.cookie = 'mxgraph=seen; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/';
	};
	mxEditor.prototype.resetHistory = function() {
		this.lastSnapshot = new Date().getTime();
		this.undoManager.reset();
		this.ignoredChanges = 0;
		this.setModified(false);
	};
	mxEditor.prototype.addAction = function(actionname, funct) {
		this.actions[actionname] = funct;
	};
	mxEditor.prototype.execute = function(actionname, cell) {
		var action = this.actions[actionname];
		if (action != null) {
			try {

				var args = arguments;
				args[0] = this;
				action.apply(this, args);
			} catch (e) {
				mxUtils.error(
						'Cannot execute ' + actionname + ': ' + e.message, 280,
						true);
				throw e;
			}
		} else {
			mxUtils.error('Cannot find action ' + actionname, 280, true);
		}
	};
	mxEditor.prototype.addTemplate = function(name, template) {
		this.templates[name] = template;
	};
	mxEditor.prototype.getTemplate = function(name) {
		return this.templates[name];
	};
	mxEditor.prototype.createGraph = function() {
		var graph = new mxGraph(null, null, this.graphRenderHint);
		graph.setTooltips(true);
		graph.setPanning(true);

		this.installDblClickHandler(graph);
		this.installUndoHandler(graph);
		this.installDrillHandler(graph);
		this.installChangeHandler(graph);

		this.installInsertHandler(graph);

		var self = this;
		graph.panningHandler.factoryMethod = function(menu, cell, evt) {
			return self.createPopupMenu(menu, cell, evt);
		};

		graph.connectionHandler.factoryMethod = function(source, target) {
			return self.createEdge(source, target)
		};
		this.createSwimlaneManager(graph);
		this.createLayoutManager(graph);
		return graph;
	};
	mxEditor.prototype.createSwimlaneManager = function(graph) {
		var swimlaneMgr = new mxSwimlaneManager(graph, false);
		var self = this;
		swimlaneMgr.isHorizontal = function() {
			return self.horizontalFlow;
		};
		swimlaneMgr.isEnabled = function() {
			return self.maintainSwimlanes;
		};
		return swimlaneMgr;
	};
	mxEditor.prototype.createLayoutManager = function(graph) {
		var layoutMgr = new mxLayoutManager(graph);
		var self = this;
		layoutMgr.getLayout = function(cell) {
			var layout = null;
			var model = self.graph.getModel();
			if (model.getParent(cell) != null) {

				if (self.layoutSwimlanes && graph.isSwimlane(cell)) {
					if (self.swimlaneLayout == null) {
						self.swimlaneLayout = self.createSwimlaneLayout();
					}
					layout = self.swimlaneLayout;
				}

				else if (self.layoutDiagram
						&& (graph.isValidRoot(cell) || model.getParent(model
								.getParent(cell)) == null)) {
					if (self.diagramLayout == null) {
						self.diagramLayout = self.createDiagramLayout();
					}
					layout = self.diagramLayout;
				}
			}
			return layout;
		};
		return layoutMgr;
	};
	mxEditor.prototype.setGraphContainer = function(container) {
		if (this.graph.container == null) {

			this.graph.init(container);

			this.rubberband = new mxRubberband(this.graph);
			if (this.disableContextMenu) {
				mxEvent.disableContextMenu(container);
			}
			if(mxClient.IS_IE) {
				new mxDivResizer(container);
			}
		}
	};
	mxEditor.prototype.installDblClickHandler = function(graph) {
		var self = this;

		graph.dblClick = function(evt, cell) {
			graph.fireEvent(mxEvent.DOUBLE_CLICK,
					new mxEventObject([evt, cell]));
			if (cell != null && graph.isEnabled()) {
				self.execute(self.dblClickAction, cell);
			}
		}
	};
	mxEditor.prototype.installUndoHandler = function(graph) {
		var self = this;
		var listener = function(sender, evt) {
			var edit = evt.getArgAt(0);
			self.undoManager.undoableEditHappened(edit);
		};
		graph.getModel().addListener(mxEvent.UNDO, listener);
		graph.getView().addListener(mxEvent.UNDO, listener);
		listener = function(sender, evt) {
			var changes = evt.getArgAt(0).changes;
			graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
		};
		this.undoManager.addListener(mxEvent.UNDO, listener);
		this.undoManager.addListener(mxEvent.REDO, listener);
	};
	mxEditor.prototype.installDrillHandler = function(graph) {
		var self = this;
		var listener = function(sender) {
			self.fireEvent(mxEvent.ROOT);
		};
		graph.getView().addListener(mxEvent.DOWN, listener);
		graph.getView().addListener(mxEvent.UP, listener);
	};
	mxEditor.prototype.installChangeHandler = function(graph) {
		var self = this;
		var listener = function(sender, evt) {
			self.setModified(true);

			if (self.validating == true) {
				graph.validateGraph();
			}
			var changes = evt.getArgAt(0);
			for (var i = 0; i < changes.length; i++) {
				var change = changes[i];
				if (change.constructor == mxRootChange
						|| (change.constructor == mxValueChange && change.cell == self.graph.model.root)
						|| (change.constructor == mxCellAttributeChange && change.cell == self.graph.model.root)) {
					self.fireEvent(mxEvent.ROOT);
					break;
				}
			}
		};
		graph.getModel().addListener(mxEvent.CHANGE, listener);
	};
	mxEditor.prototype.installInsertHandler = function(graph) {
		var self = this;
		var insertHandler = {
			mouseDown : function(sender, me) {
				if (self.insertFunction != null
						&& !me.isPopupTrigger()
						&& (self.forcedInserting || (me.getState() == null && me
								.getHandle() == null))) {
					self.graph.clearSelection();
					self.insertFunction(me.getEvent(), me.getCell());

					this.isActive = true;
					me.consume();
				}
			},
			mouseMove : function(sender, me) {
				if (this.isActive) {
					me.consume();
				}
			},
			mouseUp : function(sender, me) {
				if (this.isActive) {
					this.isActive = false;
					me.consume();
				}
			}
		};
		graph.addMouseListener(insertHandler);
	};
	mxEditor.prototype.createDiagramLayout = function() {
		var gs = this.graph.gridSize;
		var layout = new mxStackLayout(this.graph, !this.horizontalFlow,
				this.swimlaneSpacing, 2 * gs, 2 * gs);
		layout.isVertexIgnored = function(cell) {
			return !layout.graph.isSwimlane(cell);
		};
		return layout;
	};
	mxEditor.prototype.createSwimlaneLayout = function() {
		return new mxCompactTreeLayout(this.graph, this.horizontalFlow);
	};
	mxEditor.prototype.createToolbar = function() {
		return new mxDefaultToolbar(null, this);
	};
	mxEditor.prototype.setToolbarContainer = function(container) {
		this.toolbar.init(container);
		if(mxClient.IS_IE) {
			new mxDivResizer(container);
		}
	};
	mxEditor.prototype.setStatusContainer = function(container) {
		if (this.status == null) {
			this.status = container;

			var self = this;
			this.addListener(mxEvent.SAVE, function(sender) {
				var tstamp = new Date().toLocaleString();
				self
						.setStatus((mxResources.get(self.lastSavedResource) || self.lastSavedResource)
								+ ': ' + tstamp);
			});

			this.addListener(mxEvent.OPEN, function(sender) {
				self
						.setStatus((mxResources.get(self.currentFileResource) || self.currentFileResource)
								+ ': ' + self.filename);
			});
			if(mxClient.IS_IE) {
				new mxDivResizer(container);
			}
		}
	};
	mxEditor.prototype.setStatus = function(message) {
		if (this.status != null && message != null) {
			this.status.innerHTML = message;
		}
	};
	mxEditor.prototype.setTitleContainer = function(container) {
		var self = this;
		this.addListener(mxEvent.ROOT, function(sender) {
					container.innerHTML = self.getTitle();
				});
		if(mxClient.IS_IE) {
			new mxDivResizer(container);
		}
	};
	mxEditor.prototype.treeLayout = function(cell, horizontal) {
		if (cell != null) {
			var layout = new mxCompactTreeLayout(this.graph, horizontal);
			layout.execute(cell);
		}
	};
	mxEditor.prototype.getTitle = function() {
		var title = '';
		var graph = this.graph;
		var cell = graph.getCurrentRoot();
		while (cell != null
				&& graph.getModel().getParent(graph.getModel().getParent(cell)) != null) {
			if (graph.isValidRoot(cell)) {
				title = ' > ' + graph.convertValueToString(cell) + title;
			}
			cell = graph.getModel().getParent(cell);
		}
		var prefix = this.getRootTitle();
		return prefix + title;
	};
	mxEditor.prototype.getRootTitle = function() {
		var root = this.graph.getModel().getRoot();
		return this.graph.convertValueToString(root);
	};
	mxEditor.prototype.undo = function() {
		this.undoManager.undo();
	};
	mxEditor.prototype.redo = function() {
		this.undoManager.redo();
	};
	mxEditor.prototype.groupCells = function() {
		var border = (this.groupBorderSize != null)
				? this.groupBorderSize
				: this.graph.gridSize;
		return this.graph.groupCells(this.createGroup(), border);
	};
	mxEditor.prototype.createGroup = function() {
		var model = this.graph.getModel();
		return model.cloneCell(this.defaultGroup);
	};
	mxEditor.prototype.open = function(filename) {
		if (filename != null) {
			var xml = mxUtils.load(filename).getXml();
			this.readGraphModel(xml.documentElement);
			this.filename = filename;
			this.fireEvent(mxEvent.OPEN, new mxEventObject([filename]));
		}
	};
	mxEditor.prototype.readGraphModel = function(node) {
		var dec = new mxCodec(node.ownerDocument);
		dec.decode(node, this.graph.getModel());
		this.resetHistory();
	};
	mxEditor.prototype.save = function(url, linefeed) {
		url = url || this.getUrlPost();
		if (url != null && url.length > 0) {
			var data = this.writeGraphModel(linefeed);
			this.postDiagram(url, data);
			this.setModified(false);
		}
		this.fireEvent(mxEvent.SAVE, new mxEventObject([url]));
	};
	mxEditor.prototype.postDiagram = function(url, data) {
		if (this.escapePostData) {
			data = encodeURIComponent(data);
		}
		var self = this;
		mxUtils.post(url, this.postParameterName + '=' + data, function(req) {
					self.fireEvent(mxEvent.POST, new mxEventObject([req, url,
									data]));
				});
	};
	mxEditor.prototype.writeGraphModel = function(linefeed) {
		linefeed = (linefeed != null) ? linefeed : this.linefeed;
		var enc = new mxCodec();
		var node = enc.encode(this.graph.getModel());
		return mxUtils.getXml(node, linefeed);
	}
	mxEditor.prototype.getUrlPost = function() {
		return this.urlPost;
	};
	mxEditor.prototype.getUrlImage = function() {
		return this.urlImage;
	};
	mxEditor.prototype.connect = function(urlInit, urlPoll, urlNotify, onChange) {
		var session = null;
		if (!mxClient.IS_LOCAL) {
			var session = new mxSession(this.graph.getModel(), urlInit,
					urlPoll, urlNotify);

			var self = this;
			session.addListener(mxEvent.RECEIVE, function(sender, evt) {
						var node = evt.getArgAt(0);
						if (node.nodeName == 'mxGraphModel') {
							self.readGraphModel(node);
						}
					});

			session.addListener(mxEvent.DISCONNECT, onChange);
			session.addListener(mxEvent.CONNECT, onChange);
			session.addListener(mxEvent.NOTIFY, onChange);
			session.addListener(mxEvent.GET, onChange);
			session.start();
		}
		return session;
	};
	mxEditor.prototype.swapStyles = function(first, second) {
		var style = this.graph.getStylesheet().styles[second];
		this.graph.getView().getStylesheet().putCellStyle(second,
				this.graph.getStylesheet().styles[first]);
		this.graph.getStylesheet().putCellStyle(first, style);
		this.graph.refresh();
	};
	mxEditor.prototype.showProperties = function(cell) {
		cell = cell || this.graph.getSelectionCell();

		if (cell == null) {
			cell = this.graph.getCurrentRoot();
			if (cell == null) {
				cell = this.graph.getModel().getRoot();
			}
		}
		if (cell != null) {

			this.graph.stopEditing(true);
			var offset = mxUtils.getOffset(this.graph.container);
			var x = offset.x + 10;
			var y = offset.y;
			if (this.properties != null && !this.movePropertiesDialog) {
				x = this.properties.getX();
				y = this.properties.getY();
			}

			else {
				var bounds = this.graph.getCellBounds(cell);
				if (bounds != null) {
					x += bounds.x + Math.min(200, bounds.width);
					y += bounds.y;
				}
			}

			this.hideProperties();
			var node = this.createProperties(cell);
			if (node != null) {

				this.properties = new mxWindow(mxResources
								.get(this.propertiesResource)
								|| this.propertiesResource, node, x, y,
						this.propertiesWidth, this.propertiesHeight, false);
				this.properties.setVisible(true);
			}
		}
	};
	mxEditor.prototype.isPropertiesVisible = function() {
		return this.properties != null;
	};
	mxEditor.prototype.createProperties = function(cell) {
		var model = this.graph.getModel();
		var value = model.getValue(cell);
		if (mxUtils.isNode(value)) {

			var form = new mxForm('properties');
			var id = form.addText('ID', cell.getId());
			id.setAttribute('readonly', 'true');
			var geo = null;
			var yField = null;
			var xField = null;
			var widthField = null;
			var heightField = null;
			if (model.isVertex(cell)) {
				geo = model.getGeometry(cell);
				if (geo != null) {
					yField = form.addText('top', geo.y);
					xField = form.addText('left', geo.x);
					widthField = form.addText('width', geo.width);
					heightField = form.addText('height', geo.height);
				}
			}
			var tmp = model.getStyle(cell);
			var style = form.addText('Style', tmp || '');

			var attrs = value.attributes;
			var texts = new Array();
			for (var i = 0; i < attrs.length; i++) {

				var val = attrs[i].nodeValue;
				texts[i] = form.addTextarea(attrs[i].nodeName, val,
						(attrs[i].nodeName == 'label') ? 4 : 2);
			}

			var self = this;

			var okFunction = function() {
				self.hideProperties();

				model.beginUpdate();
				try {
					if (geo != null) {
						geo = geo.clone();
						geo.x = parseFloat(xField.value);
						geo.y = parseFloat(yField.value);
						geo.width = parseFloat(widthField.value);
						geo.height = parseFloat(heightField.value);
						model.setGeometry(cell, geo);
					}
					if (style.value.length > 0) {
						model.setStyle(cell, style.value);
					} else {
						model.setStyle(cell, null);
					}

					for (var i = 0; i < attrs.length; i++) {
						var edit = new mxCellAttributeChange(cell,
								attrs[i].nodeName, texts[i].value);
						model.execute(edit);
					}

					if (self.graph.isAutoSizeCell(cell)) {
						self.graph.updateCellSize(cell);
					}
				} finally {
					model.endUpdate();
				}
			}

			var cancelFunction = function() {
				self.hideProperties();
			}
			form.addButtons(okFunction, cancelFunction);
			return form.table;
		}
		return null;
	};
	mxEditor.prototype.hideProperties = function() {
		if (this.properties != null) {
			this.properties.destroy();
			this.properties = null;
		}
	};
	mxEditor.prototype.showTasks = function(tasks) {
		if (this.tasks == null) {
			var div = document.createElement('div');
			div.style.padding = '4px';
			div.style.paddingLeft = '20px';
			var w = document.body.clientWidth;
			var wnd = new mxWindow(mxResources.get(this.tasksResource)
							|| this.tasksResource, div, w - 220, this.tasksTop,
					200);
			wnd.setClosable(true);
			wnd.destroyOnClose = false;

			var self = this;
			var funct = function(sender) {
				mxEvent.release(div);
				div.innerHTML = '';
				self.createTasks(div);
			};
			this.graph.getModel().addListener(mxEvent.CHANGE, funct);
			this.graph.getSelectionModel().addListener(mxEvent.CHANGE, funct);
			this.graph.addListener(mxEvent.ROOT, funct);
			if (this.tasksWindowImage != null) {
				wnd.setImage(this.tasksWindowImage);
			}
			this.tasks = wnd;
			this.createTasks(div);
		}
		this.tasks.setVisible(true);
	};
	mxEditor.prototype.refreshTasks = function(div) {
		if (this.tasks != null) {
			var div = this.tasks.content;
			mxEvent.release(div);
			div.innerHTML = '';
			this.createTasks(div);
		}
	};
	mxEditor.prototype.createTasks = function(div) {
	}
	mxEditor.prototype.showHelp = function(tasks) {
		if (this.help == null) {
			var frame = document.createElement('iframe');
			frame.setAttribute('src', mxResources.get('urlHelp')
							|| this.urlHelp);
			frame.setAttribute('height', '100%');
			frame.setAttribute('width', '100%');
			frame.setAttribute('frameborder', '0');
			frame.style.backgroundColor = 'white';
			var w = document.body.clientWidth;
			var h = (document.body.clientHeight || document.documentElement.clientHeight);
			var wnd = new mxWindow(mxResources.get(this.helpResource)
							|| this.helpResource, frame, (w - this.helpWidth)
							/ 2, (h - this.helpHeight) / 3, this.helpWidth,
					this.helpHeight);
			wnd.setMaximizable(true);
			wnd.setClosable(true);
			wnd.destroyOnClose = false;
			wnd.setResizable(true);
			if (this.helpWindowImage != null) {
				wnd.setImage(this.helpWindowImage);
			}
			if(!mxClient.IS_IE) {
				var handler = function(sender) {
					var h = wnd.div.offsetHeight;
					frame.setAttribute('height', (h - 26) + 'px');
				};
				wnd.addListener(mxEvent.RESIZE_END, handler);
				wnd.addListener(mxEvent.MAXIMIZE, handler);
				wnd.addListener(mxEvent.NORMALIZE, handler);
				wnd.addListener(mxEvent.SHOW, handler);
			}
			this.help = wnd;
		}
		this.help.setVisible(true);
	};
	mxEditor.prototype.showOutline = function() {
		var create = this.outline == null;
		if (create) {
			var div = document.createElement('div');
			div.style.width = "100%";
			div.style.height = "100%";
			div.style.background = 'white';
			var wnd = new mxWindow(mxResources.get(this.outlineResource)
							|| this.outlineResource, div, 600, 480, 200, 200,
					false);

			var outline = new mxOutline(this.graph, div);
			wnd.setClosable(true);
			wnd.setResizable(true);
			wnd.destroyOnClose = false;
			wnd.addListener(mxEvent.RESIZE_END, function() {
						outline.update();
					});
			this.outline = wnd;
			this.outline.outline = outline;
		}
		this.outline.setVisible(true);
		this.outline.outline.refresh();
	};
	mxEditor.prototype.setMode = function(modename) {
		if (modename == 'select') {
			this.graph.panningHandler.useLeftButtonForPanning = false;
			this.graph.setConnectable(false);
		} else if (modename == 'connect') {
			this.graph.panningHandler.useLeftButtonForPanning = false;
			this.graph.setConnectable(true);
		} else if (modename == 'pan') {
			this.graph.panningHandler.useLeftButtonForPanning = true;
			this.graph.setConnectable(false);
		}
	};
	mxEditor.prototype.createPopupMenu = function(menu, cell, evt) {
		this.popupHandler.createMenu(this, menu, cell, evt);
	};
	mxEditor.prototype.createEdge = function(source, target) {
		var e = null;
		if (this.defaultEdge != null) {
			var model = this.graph.getModel();
			e = model.cloneCell(this.defaultEdge);
		} else {
			e = new mxCell('');
			e.setEdge(true);
			var geo = new mxGeometry();
			geo.relative = true;
			e.setGeometry(geo);
		}
		var style = this.getEdgeStyle();
		if (style != null) {
			e.setStyle(style);
		}
		return e;
	};
	mxEditor.prototype.getEdgeStyle = function() {
		return this.defaultEdgeStyle;
	}
	mxEditor.prototype.consumeCycleAttribute = function(cell) {
		return (this.cycleAttributeValues != null
				&& this.cycleAttributeValues.length > 0 && this.graph
				.isSwimlane(cell))
				? this.cycleAttributeValues[this.cycleAttributeIndex++
						% this.cycleAttributeValues.length]
				: null;
	};
	mxEditor.prototype.cycleAttribute = function(cell) {
		if (this.cycleAttributeName != null) {
			var value = this.consumeCycleAttribute(cell);
			if (value != null) {
				cell.setStyle(cell.getStyle() + ';' + this.cycleAttributeName
						+ '=' + value);
			}
		}
	};
	mxEditor.prototype.addVertex = function(parent, vertex, x, y) {
		var model = this.graph.getModel();
		while (parent != null && !this.graph.isValidDropTarget(parent)) {
			parent = model.getParent(parent);
		}
		parent = (parent != null) ? parent : this.graph.getSwimlaneAt(x, y);
		var scale = this.graph.getView().scale;
		var geo = model.getGeometry(vertex);
		var pgeo = model.getGeometry(parent);
		if (this.graph.isSwimlane(vertex) && !this.graph.swimlaneNesting) {
			parent = null;
		} else if (parent == null && this.swimlaneRequired) {
			return null;
		} else if (parent != null && pgeo != null) {
			var state = this.graph.getView().getState(parent);
			if (state != null) {
				x -= state.origin.x * scale;
				y -= state.origin.y * scale;
				if (this.graph.isConstrainedMoving) {
					var width = geo.width;
					var height = geo.height;
					var tmp = state.x + state.width;
					if (x + width > tmp) {
						x -= x + width - tmp;
					}
					tmp = state.y + state.height;
					if (y + height > tmp) {
						y -= y + height - tmp;
					}
				}
			} else if (pgeo != null) {
				x -= pgeo.x * scale;
				y -= pgeo.y * scale;
			}
		}
		geo = geo.clone();
		geo.x = this.graph.snap(x / scale - this.graph.getView().translate.x
				- this.graph.gridSize / 2);
		geo.y = this.graph.snap(y / scale - this.graph.getView().translate.y
				- this.graph.gridSize / 2);
		vertex.setGeometry(geo);
		if (parent == null) {
			parent = this.graph.getDefaultParent();
		}
		this.cycleAttribute(vertex);
		this.fireEvent(mxEvent.BEFORE_ADD_VERTEX, new mxEventObject([vertex,
						parent]));
		model.beginUpdate();
		try {
			vertex = this.graph.addCell(vertex, parent);
			if (vertex != null) {
				this.graph.constrainChild(vertex);
				this.fireEvent(mxEvent.ADD_VERTEX, new mxEventObject([vertex]));
			}
		} finally {
			model.endUpdate();
		}
		if (vertex != null) {
			this.graph.setSelectionCell(vertex);
			this.graph.scrollCellToVisible(vertex);
			this.fireEvent(mxEvent.AFTER_ADD_VERTEX,
					new mxEventObject([vertex]));
		}
		return vertex;
	};
	mxEditor.prototype.destroy = function() {
		if (!this.destroyed) {
			this.destroyed = true;
			if (this.tasks != null) {
				this.tasks.destroy();
			}
			if (this.outline != null) {
				this.outline.destroy();
			}
			if (this.properties != null) {
				this.properties.destroy();
			}
			if (this.keyHandler != null) {
				this.keyHandler.destroy();
			}
			if (this.rubberband != null) {
				this.rubberband.destroy();
			}
			if (this.toolbar != null) {
				this.toolbar.destroy();
			}
			if (this.graph != null) {
				this.graph.destroy();
			}
			this.status = null;
			this.templates = null;
		}
	};
}

var mxCodecRegistry = {
	codecs : new Array(),
	register : function(codec) {
		var name = mxUtils.getFunctionName(codec.template.constructor);
		mxCodecRegistry.codecs[name] = codec;
	},
	getCodec : function(ctor) {
		var codec = null;
		if (ctor != null) {
			var name = mxUtils.getFunctionName(ctor);
			codec = mxCodecRegistry.codecs[name];

			if (codec == null) {
				try {
					codec = new mxObjectCodec(new ctor());
					mxCodecRegistry.register(codec);
				} catch (e) {
				}
			}
		}
		return codec;
	}
};

{
	function mxCodec(document) {
		this.document = document || mxUtils.createXmlDocument();
		this.objects = new Array();
	};
	mxCodec.prototype.document = null;
	mxCodec.prototype.objects = null;
	mxCodec.prototype.encodeDefaults = false;
	mxCodec.prototype.putObject = function(id, obj) {
		this.objects[id] = obj;
		return obj;
	};
	mxCodec.prototype.getObject = function(id) {
		var obj = null;
		if (id != null) {
			obj = this.objects[id];
			if (obj == null) {
				obj = this.lookup(id);
				if (obj == null) {
					var node = this.getElementById(id);
					if (node != null) {
						obj = this.decode(node);
					}
				}
			}
		}
		return obj;
	};
	mxCodec.prototype.lookup = function(id) {
		return null;
	}
	mxCodec.prototype.getElementById = function(id, attr) {
		attr = attr || 'id';
		var expr = '//*[@' + attr + '=\'' + id + '\']';
		return mxUtils.selectSingleNode(this.document, expr);
	};
	mxCodec.prototype.getId = function(obj) {
		var id = null;
		if (obj != null) {
			id = this.reference(obj);
			if (id == null && obj.constructor == mxCell) {
				id = obj.getId();
				if (id == null) {
					id = mxCellPath.create(obj);
					if (id.length == 0) {
						id = 'root';
					}
				}
			}
		}
		return id;
	};
	mxCodec.prototype.reference = function(obj) {
		return null;
	};
	mxCodec.prototype.encode = function(obj) {
		var node = null;
		if (obj != null && obj.constructor != null) {
			var enc = mxCodecRegistry.getCodec(obj.constructor);
			if (enc != null) {
				node = enc.encode(this, obj);
			} else {
				if (isNode(obj)) {
					node = (true) ? obj.value.cloneNode(true) : this.document
							.importNode(obj.value, true);
				} else {
					mxLog.warn('mxCodec.encode: No codec for '
							+ mxUtils.getFunctionName(obj.constructor));
				}
			}
		}
		return node;
	};
	mxCodec.prototype.decode = function(node, into) {
		var obj = null;
		if (node != null && node.nodeType == mxConstants.NODETYPE_ELEMENT) {
			var ctor = null;
			try {
				var ctor = eval(node.nodeName);
			} catch (err) {
			}
			try {
				var dec = mxCodecRegistry.getCodec(ctor);
				if (dec != null) {
					obj = dec.decode(this, node, into);
				} else {
					obj = node.cloneNode(true);
					obj.removeAttribute('as');
				}
			} catch (err) {
				mxLog.debug('Cannot decode ' + node.nodeName + ': '
						+ err.message);
				throw err;
			}
		}
		return obj;
	};
	mxCodec.prototype.encodeCell = function(cell, node, isIncludeChildren) {
		node.appendChild(this.encode(cell));
		if (isIncludeChildren == null || isIncludeChildren) {
			var childCount = cell.getChildCount();
			for (var i = 0; i < childCount; i++) {
				this.encodeCell(cell.getChildAt(i), node);
			}
		}
	};
	mxCodec.prototype.decodeCell = function(node, isRestoreStructures) {
		var cell = null;
		if (node != null && node.nodeType == mxConstants.NODETYPE_ELEMENT) {

			var decoder = mxCodecRegistry.getCodec(node.nodeName);
			if (decoder == null) {
				decoder = mxCodecRegistry.getCodec(mxCell);
			}
			cell = decoder.decode(this, node);
			if (isRestoreStructures == null || isRestoreStructures) {
				var parent = cell.getParent();
				if (parent != null) {
					parent.insert(cell);
				}
				var source = cell.getTerminal(true);
				if (source != null) {
					source.insertEdge(cell, true);
				}
				var target = cell.getTerminal(false);
				if (target != null) {
					target.insertEdge(cell, false);
				}
			}
		}
		return cell;
	};
	mxCodec.prototype.setAttribute = function(node, attribute, value) {
		if (attribute != null && value != null) {
			node.setAttribute(attribute, value);
		}
	};
}

{
	function mxObjectCodec(template, exclude, idrefs, mapping) {
		this.template = template;
		this.exclude = exclude || new Array();
		this.idrefs = idrefs || new Array();
		this.mapping = mapping || new Object();
		this.reverse = new Object();
		for (var i in this.mapping) {
			this.reverse[this.mapping[i]] = i;
		}
	};
	mxObjectCodec.prototype.template = null;
	mxObjectCodec.prototype.exclude = null;
	mxObjectCodec.prototype.idrefs = null;
	mxObjectCodec.prototype.mapping = null;
	mxObjectCodec.prototype.reverse = null;
	mxObjectCodec.prototype.cloneTemplate = function() {
		return new this.template.constructor();
	};
	mxObjectCodec.prototype.getFieldName = function(attributename) {
		if (attributename != null) {
			var mapped = this.reverse[attributename];
			if (mapped != null) {
				attributename = mapped;
			}
		}
		return attributename;
	};
	mxObjectCodec.prototype.getAttributeName = function(fieldname) {
		if (fieldname != null) {
			var mapped = this.mapping[fieldname];
			if (mapped != null) {
				fieldname = mapped;
			}
		}
		return fieldname;
	};
	mxObjectCodec.prototype.isExcluded = function(obj, attr, value, isWrite) {
		return attr == mxObjectIdentity.FIELD_NAME
				|| mxUtils.indexOf(this.exclude, attr) >= 0;
	};
	mxObjectCodec.prototype.isReference = function(obj, attr, value, isWrite) {
		return mxUtils.indexOf(this.idrefs, attr) >= 0;
	};
	mxObjectCodec.prototype.encode = function(enc, obj) {
		var name = mxUtils.getFunctionName(obj.constructor);
		var node = enc.document.createElement(name);
		obj = this.beforeEncode(enc, obj, node);
		this.encodeObject(enc, obj, node);
		return this.afterEncode(enc, obj, node);
	};
	mxObjectCodec.prototype.encodeObject = function(enc, obj, node) {
		enc.setAttribute(node, 'id', enc.getId(obj));
		for (var i in obj) {
			var name = i;
			var value = obj[name];
			if (value != null && !this.isExcluded(obj, name, value, true)) {
				if (mxUtils.isNumeric(name)) {
					name = null;
				}
				this.encodeValue(enc, obj, name, value, node);
			}
		}
	};
	mxObjectCodec.prototype.encodeValue = function(enc, obj, name, value, node) {
		if (value != null) {
			if (this.isReference(obj, name, value, true)) {
				var tmp = enc.getId(value);
				if (tmp == null) {
					mxLog.warn('mxObjectCodec.encode: No ID for '
							+ mxUtils.getFunctionName(obj.constructor) + '.'
							+ name + '=' + value);
					return;
				}
				value = tmp;
			}
			var defaultValue = this.template[name];

			if (name == null || enc.encodeDefaults || defaultValue != value) {
				name = this.getAttributeName(name);
				this.writeAttribute(enc, obj, name, value, node);
			}
		}
	};
	mxObjectCodec.prototype.writeAttribute = function(enc, obj, attr, value,
			node) {
		if (typeof(value) != 'object') {
			this.writePrimitiveAttribute(enc, obj, attr, value, node);
		} else {
			this.writeComplexAttribute(enc, obj, attr, value, node);
		}
	};
	mxObjectCodec.prototype.writePrimitiveAttribute = function(enc, obj, attr,
			value, node) {
		value = this.convertValueToXml(value);
		if (attr == null) {
			var child = enc.document.createElement('add');
			if (typeof(value) == 'function') {
				child.appendChild(enc.document.createTextNode(value));
			} else {
				enc.setAttribute(child, 'value', value);
			}
			node.appendChild(child);
		} else if (typeof(value) != 'function') {
			enc.setAttribute(node, attr, value);
		}
	};
	mxObjectCodec.prototype.writeComplexAttribute = function(enc, obj, attr,
			value, node) {
		var child = enc.encode(value);
		if (child != null) {
			if (attr != null) {
				child.setAttribute('as', attr);
			}
			node.appendChild(child);
		} else {
			mxLog.warn('mxObjectCodec.encode: No node for '
					+ mxUtils.getFunctionName(obj.constructor) + '.' + attr
					+ ': ' + value);
		}
	};
	mxObjectCodec.prototype.convertValueToXml = function(value) {
		if (typeof(value.length) == 'undefined'
				&& (value == true || value == false)) {

			value = (value == true) ? '1' : '0';
		}
		return value;
	};
	mxObjectCodec.prototype.convertValueFromXml = function(value) {
		if (mxUtils.isNumeric(value)) {
			value = parseFloat(value);
		}
		return value;
	}
	mxObjectCodec.prototype.beforeEncode = function(enc, obj, node) {
		return obj;
	};
	mxObjectCodec.prototype.afterEncode = function(enc, obj, node) {
		return node;
	};
	mxObjectCodec.prototype.decode = function(dec, node, into) {
		var id = node.getAttribute('id');
		var obj = dec.objects[id];
		if (obj == null) {
			obj = into || this.cloneTemplate();
			if (id != null) {
				dec.putObject(id, obj);
			}
		}
		node = this.beforeDecode(dec, node, obj);
		this.decodeNode(dec, node, obj);
		return this.afterDecode(dec, node, obj);
	};
	mxObjectCodec.prototype.decodeNode = function(dec, node, obj) {
		if (node != null) {
			this.decodeAttributes(dec, node, obj);
			this.decodeChildren(dec, node, obj);
		}
	};
	mxObjectCodec.prototype.decodeAttributes = function(dec, node, obj) {
		var type = mxUtils.getFunctionName(obj.constructor);
		var attrs = node.attributes;
		if (attrs != null) {
			for (var i = 0; i < attrs.length; i++) {
				this.decodeAttribute(dec, attrs[i], obj);
			}
		}
	};
	mxObjectCodec.prototype.decodeAttribute = function(dec, attr, obj) {
		var name = attr.nodeName;
		if (name != 'as' && name != 'id') {
			var value = this.convertValueFromXml(attr.value);
			var fieldname = this.getFieldName(name);
			if (this.isReference(obj, fieldname, value, false)) {
				var tmp = dec.getObject(value);
				if (tmp == null) {
					mxLog.warn('mxObjectCodec.decode: No object for '
							+ mxUtils.getFunctionName(obj.constructor) + '.'
							+ name + '=' + value);
					return;
				}
				value = tmp;
			}
			if (!this.isExcluded(obj, name, value, false)) {
				obj[name] = value;
			}
		}
	};
	mxObjectCodec.prototype.decodeChildren = function(dec, node, obj) {
		var type = mxUtils.getFunctionName(obj.constructor);
		var child = node.firstChild;
		while (child != null) {
			var tmp = child.nextSibling;
			if (child.nodeType == mxConstants.NODETYPE_ELEMENT
					&& !this.processInclude(dec, child, obj)) {
				this.decodeChild(dec, child, obj);
			}
			child = tmp;
		}
	};
	mxObjectCodec.prototype.decodeChild = function(dec, child, obj) {
		var fieldname = this.getFieldName(child.getAttribute('as'));
		if (fieldname == null || !this.isExcluded(obj, fieldname, child, false)) {
			var value = null;
			var template = obj[fieldname];
			if (child.nodeName == 'add') {
				value = child.getAttribute('value');
				if (value == null) {
					value = mxUtils.eval(mxUtils.getTextContent(child));
				}
			} else {
				value = dec.decode(child, template);

			}
			if (value != null && value != template) {
				if (fieldname != null && fieldname.length > 0) {
					obj[fieldname] = value;
				} else {
					obj.push(value);
				}
			}
		}
	};
	mxObjectCodec.prototype.processInclude = function(dec, node, into) {
		if (node.nodeName == 'include') {
			var name = node.getAttribute('name');
			if (name != null) {
				try {
					var xml = mxUtils.load(name).getDocumentElement();
					if (xml != null) {
						dec.decode(xml, into);
					}
				} catch (e) {
				}
			}
			return true;
		}
		return false;
	};
	mxObjectCodec.prototype.beforeDecode = function(dec, node, obj) {
		return node;
	};
	mxObjectCodec.prototype.afterDecode = function(dec, node, obj) {
		return obj;
	};
}

mxCodecRegistry.register(function() {
	var codec = new mxObjectCodec(new mxCell(), ['children', 'edges',
					'overlays', 'mxTransient'], ['parent', 'source', 'target']);
	codec.isExcluded = function(obj, attr, value, isWrite) {
		return mxObjectCodec.prototype.isExcluded.apply(this, arguments)
				|| (isWrite && attr == 'value' && value.nodeType == mxConstants.NODETYPE_ELEMENT);
	};
	codec.afterEncode = function(enc, obj, node) {
		if (obj.value != null
				&& obj.value.nodeType == mxConstants.NODETYPE_ELEMENT) {

			var tmp = node;
			node = (true) ? obj.value.cloneNode(true) : enc.document
					.importNode(obj.value, true);
			node.appendChild(tmp);

			var id = tmp.getAttribute('id');
			node.setAttribute('id', id);
			tmp.removeAttribute('id');
		}
		return node;
	};
	codec.beforeDecode = function(dec, node, obj) {
		var inner = node;
		var className = mxUtils.getFunctionName(this.template.constructor);
		if (node.nodeName != className) {

			var tmp = node.getElementsByTagName(className)[0];
			if (tmp != null && tmp.parentNode == node) {
				mxUtils.removeWhitespace(tmp, true);
				mxUtils.removeWhitespace(tmp, false);
				tmp.parentNode.removeChild(tmp);
				inner = tmp;
			} else {
				inner = null;
			}
			obj.value = node.cloneNode(true);
			var id = obj.value.getAttribute('id');
			if (id != null) {
				obj.setId(id);
				obj.value.removeAttribute('id');
			}
		} else {
			obj.setId(node.getAttribute('id'));
		}

		if (inner != null) {
			for (var i = 0; i < this.idrefs.length; i++) {
				var attr = this.idrefs[i];
				var ref = inner.getAttribute(attr);
				if (ref != null) {
					inner.removeAttribute(attr);
					var object = dec.objects[ref] || dec.lookup(ref);
					if (object == null) {
						var element = dec.getElementById(ref);
						if (element != null) {
							var decoder = mxCodecRegistry.codecs[element.nodeName]
									|| this;
							object = decoder.decode(dec, element);
						}
					}
					obj[attr] = object;
				}
			}
		}
		return inner;
	};
	return codec;
}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxGraphModel());
			codec.encode = function(enc, obj) {
				var name = mxUtils.getFunctionName(obj.constructor);
				var node = enc.document.createElement(name);
				var rootNode = enc.document.createElement('root');
				enc.encodeCell(obj.getRoot(), rootNode);
				node.appendChild(rootNode);
				return node;
			};
			codec.decodeChild = function(dec, child, obj) {
				if (child.nodeName == 'root') {
					this.decodeRoot(dec, child, obj);
				} else {
					mxObjectCodec.prototype.decodeChild.apply(this, arguments);
				}
			};
			codec.decodeRoot = function(dec, root, model) {
				var rootCell = null;
				var tmp = root.firstChild;
				while (tmp != null) {
					var cell = dec.decodeCell(tmp);
					if (cell != null && cell.getParent() == null) {
						rootCell = cell;
					}
					tmp = tmp.nextSibling;
				}
				if (rootCell != null) {
					model.setRoot(rootCell);
				}
			};
			return codec;
		}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxRootChange(), ['model',
							'previous', 'root']);
			codec.afterEncode = function(enc, obj, node) {
				enc.encodeCell(obj.root, node);
				return node;
			};
			codec.beforeDecode = function(dec, node, obj) {
				if (node.firstChild != null
						&& node.firstChild.nodeType == mxConstants.NODETYPE_ELEMENT) {
					var tmp = node.firstChild;
					obj.root = dec.decodeCell(tmp, false);
					var tmp2 = tmp.nextSibling;
					tmp.parentNode.removeChild(tmp);
					tmp = tmp2;
					while (tmp != null) {
						var tmp2 = tmp.nextSibling;
						dec.decodeCell(tmp);
						tmp.parentNode.removeChild(tmp);
						tmp = tmp2;
					}
				}
				return node;
			};
			codec.afterDecode = function(dec, node, obj) {
				obj.previous = obj.root;
				return obj;
			};
			return codec;
		}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxChildChange(), ['model',
							'previous', 'previousIndex', 'child'], ['parent']);
			codec.isReference = function(obj, attr, value, isWrite) {
				if (attr == 'child' && (obj.previous != null || !isWrite)) {
					return true;
				}
				return mxUtils.indexOf(this.idrefs, attr) >= 0;
			};
			codec.afterEncode = function(enc, obj, node) {
				if (this.isReference(obj, 'child', obj.child, true)) {
					node.setAttribute('child', enc.getId(obj.child));
				} else {

					enc.encodeCell(obj.child, node);
				}
				return node;
			};
			codec.beforeDecode = function(dec, node, obj) {
				if (node.firstChild != null
						&& node.firstChild.nodeType == mxConstants.NODETYPE_ELEMENT) {
					var tmp = node.firstChild;
					obj.child = dec.decodeCell(tmp, false);

					obj.child.setParent(null);
					var tmp2 = tmp.nextSibling;
					tmp.parentNode.removeChild(tmp);
					tmp = tmp2;
					while (tmp != null) {
						var tmp2 = tmp.nextSibling;
						if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT) {

							var id = tmp.getAttribute('id');
							if (dec.lookup(id) == null) {
								dec.decodeCell(tmp);
							}
						}
						tmp.parentNode.removeChild(tmp);
						tmp = tmp2;
					}
				} else {
					var childRef = node.getAttribute('child');
					obj.child = dec.getObject(childRef);
				}
				return node;
			};
			codec.afterDecode = function(dec, node, obj) {
				obj.previous = obj.parent;
				obj.previousIndex = obj.index;
				return obj;
			};
			return codec;
		}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxTerminalChange(), ['model',
							'previous'], ['cell', 'terminal']);
			codec.afterDecode = function(dec, node, obj) {
				obj.previous = obj.terminal;
				return obj;
			};
			return codec;
		}());

{
	var mxGenericChangeCodec = function(obj, variable) {
		var codec = new mxObjectCodec(obj, ['model', 'previous'], ['cell']);
		codec.afterDecode = function(dec, node, obj) {
			if (obj.previous == null) {
				obj.previous = obj[variable];
			}
			return obj;
		}
		return codec;
	};
	mxCodecRegistry
			.register(mxGenericChangeCodec(new mxValueChange(), 'value'));
	mxCodecRegistry
			.register(mxGenericChangeCodec(new mxStyleChange(), 'style'));
	mxCodecRegistry.register(mxGenericChangeCodec(new mxGeometryChange(),
			'geometry'));
	mxCodecRegistry.register(mxGenericChangeCodec(new mxCollapseChange(),
			'collapsed'));
	mxCodecRegistry.register(mxGenericChangeCodec(new mxVisibleChange(),
			'visible'));
	mxCodecRegistry.register(mxGenericChangeCodec(new mxCellAttributeChange(),
			'value'));
}

mxCodecRegistry.register(function() {
			return new mxObjectCodec(new mxGraph(), ['graphListeners',
							'eventListeners', 'view', 'container',
							'cellRenderer', 'editor', 'selection',
							'activeElement', 'focusHandler', 'blurHandler']);
		}());

mxCodecRegistry.register(function() {
	var codec = new mxObjectCodec(new mxGraphView());
	codec.encode = function(enc, view) {
		return this.encodeCell(enc, view, view.graph.getModel().getRoot());
	};
	codec.encodeCell = function(enc, view, cell) {
		var model = view.graph.getModel();
		var state = view.getState(cell);
		var childCount = model.getChildCount(cell);
		var parent = model.getParent(cell);
		var geo = view.graph.getCellGeometry(cell);
		var name = null;
		if (parent == model.getRoot()) {
			name = 'layer';
		} else if (parent == null) {
			name = 'graph';
		} else if (model.isEdge(cell)) {
			name = 'edge';
		} else if (childCount > 0 && geo != null) {
			name = 'group';
		} else if (model.isVertex(cell)) {
			name = 'vertex';
		}
		if (name != null) {
			var node = enc.document.createElement(name);
			var lab = view.graph.getLabel(cell);
			if (lab != null) {
				node.setAttribute('label', view.graph.getLabel(cell));
				if (view.graph.isHtmlLabel(cell)) {
					node.setAttribute('html', true);
				}
			}
			if (parent == null) {
				var bounds = view.getGraphBounds();
				if (bounds != null) {
					node.setAttribute('x', Math.round(bounds.x));
					node.setAttribute('y', Math.round(bounds.y));
					node.setAttribute('width', Math.round(bounds.width));
					node.setAttribute('height', Math.round(bounds.height));
				}
				node.setAttribute('scale', view.scale);
			} else if (state != null && geo != null) {
				for (var i in state.style) {
					var value = state.style[i];
					if (typeof(value) == 'function'
							&& typeof(value) == 'object') {
						value = mxStyleRegistry.getName(value);
					}
					if (value != null && typeof(value) != 'function'
							&& typeof(value) != 'object') {
						node.setAttribute(i, value);
					}
				}
				var abs = state.absolutePoints;
				if (abs != null && abs.length > 0) {
					var pts = Math.round(abs[0].x) + ',' + Math.round(abs[0].y);
					for (var i = 1; i < abs.length; i++) {
						pts += ' ' + Math.round(abs[i].x) + ','
								+ Math.round(abs[i].y);
					}
					node.setAttribute('points', pts);
				} else {
					node.setAttribute('x', Math.round(state.x));
					node.setAttribute('y', Math.round(state.y));
					node.setAttribute('width', Math.round(state.width));
					node.setAttribute('height', Math.round(state.height));
				}
				var offset = state.absoluteOffset;
				if (offset != null) {
					if (offset.x != 0) {
						node.setAttribute('dx', Math.round(offset.x));
					}
					if (offset.y != 0) {
						node.setAttribute('dy', Math.round(offset.y));
					}
				}
			}
		}
		for (var i = 0; i < childCount; i++) {
			node.appendChild(this.encodeCell(enc, view, model.getChildAt(cell,
							i)));
		}
		return node;
	};
	return codec;
}());

mxCodecRegistry.register(function() {
	var codec = new mxObjectCodec(new mxStylesheet());
	codec.encode = function(enc, obj) {
		var node = enc.document.createElement(mxUtils
				.getFunctionName(obj.constructor));
		for (var i in obj.styles) {
			var style = obj.styles[i];
			var styleNode = enc.document.createElement('add');
			if (i != null) {
				styleNode.setAttribute('as', i);
				for (var j in style) {
					var entry = enc.document.createElement('add');
					entry.setAttribute('as', j);
					var type = typeof(style[j]);
					if (type == 'function') {
						var name = mxStyleRegistry.getName(style[j]);
						if (name != null) {
							entry.setAttribute('value', name);
						}
					} else if (type != 'object') {
						entry.setAttribute('value', style[j]);
					}
					styleNode.appendChild(entry);
				}
				if (styleNode.childNodes.length > 0) {
					node.appendChild(styleNode);
				}
			}
		}
		return node;
	};
	codec.decode = function(dec, node, into) {
		var obj = into || new this.template.constructor();
		var id = node.getAttribute('id');
		if (id != null) {
			dec.objects[id] = obj;
		}
		node = node.firstChild;
		while (node != null) {
			if (!this.processInclude(dec, node, obj) && node.nodeName == 'add') {
				var as = node.getAttribute('as');
				if (as != null) {
					var extend = node.getAttribute('extend');
					var style = (extend != null) ? mxUtils
							.clone(obj.styles[extend]) : null;
					if (style == null) {
						if (extend != null) {
							mxLog.warn('mxStylesheetCodec.decode: stylesheet '
									+ extend + ' not found to extend');
						}
						style = new Object();
					}
					var entry = node.firstChild;
					while (entry != null) {
						if (entry.nodeType == mxConstants.NODETYPE_ELEMENT) {
							var key = entry.getAttribute('as');
							if (entry.nodeName == 'add') {
								var text = mxUtils.getTextContent(entry);
								var value = null;
								if (text != null && text.length > 0) {
									value = mxUtils.eval(text);
								} else {
									value = entry.getAttribute('value');
									if (mxUtils.isNumeric(value)) {
										value = parseFloat(value);
									}
								}
								if (value != null) {
									style[key] = value;
								}
							} else if (entry.nodeName == 'remove') {
								delete style[key];
							}
						}
						entry = entry.nextSibling;
					}
					obj.putCellStyle(as, style);
				}
			}
			node = node.nextSibling;
		}
		return obj;
	};
	return codec;
}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxDefaultKeyHandler());
			codec.encode = function(enc, obj) {
				return null;
			};
			codec.decode = function(dec, node, into) {
				if (into != null) {
					var editor = into.editor;
					node = node.firstChild;
					while (node != null) {
						if (!this.processInclude(dec, node, into)
								&& node.nodeName == 'add') {
							var as = node.getAttribute('as');
							var action = node.getAttribute('action');
							var control = node.getAttribute('control');
							into.bindAction(as, action, control);
						}
						node = node.nextSibling;
					}
				}
				return into;
			};
			return codec;
		}());

mxCodecRegistry.register(function() {
	var codec = new mxObjectCodec(new mxDefaultToolbar());
	codec.encode = function(enc, obj) {
		return null;
	};
	codec.decode = function(dec, node, into) {
		if (into != null) {
			var editor = into.editor;
			var model = editor.graph.getModel();
			node = node.firstChild;
			while (node != null) {
				if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {
					if (!this.processInclude(dec, node, into)) {
						if (node.nodeName == 'separator') {
							into.addSeparator();
						} else if (node.nodeName == 'br') {
							into.toolbar.addBreak();
						} else if (node.nodeName == 'hr') {
							into.toolbar.addLine();
						} else if (node.nodeName == 'add') {
							var as = node.getAttribute('as');
							as = mxResources.get(as) || as;
							var icon = node.getAttribute('icon');
							var pressedIcon = node.getAttribute('pressedIcon');
							var action = node.getAttribute('action');
							var mode = node.getAttribute('mode');
							var template = node.getAttribute('template');
							if (action != null) {
								into.addItem(as, icon, action, pressedIcon);
							} else if (mode != null) {
								var funct = mxUtils.eval(mxUtils
										.getTextContent(node));
								into
										.addMode(as, icon, mode, pressedIcon,
												funct);
							} else if (template != null) {
								var cell = editor.templates[template];
								var style = node.getAttribute('style');
								if (style != null) {
									cell = cell.clone();
									cell.setStyle(style);
								}
								var insertFunction = null;
								var text = mxUtils.getTextContent(node);
								if (text != null) {
									insertFunction = mxUtils.eval(text);
								}
								into.addPrototype(as, icon, cell, pressedIcon,
										insertFunction);
							} else {
								var children = mxUtils.getChildNodes(node);
								if (children.length > 0) {
									if (icon == null) {
										var combo = into.addActionCombo(as);
										for (var i = 0; i < children.length; i++) {
											var child = children[i];
											if (child.nodeName == 'separator') {
												into.addOption(combo, '---');
											} else if (child.nodeName == 'add') {
												var lab = child
														.getAttribute('as');
												var act = child
														.getAttribute('action');
												into.addActionOption(combo,
														lab, act);
											}
										}
									} else {
										var select = null;
										var create = function() {
											var template = editor.templates[select.value];
											if (template != null) {
												var clone = template.clone();
												var style = select.options[select.selectedIndex].cellStyle;
												if (style != null) {
													clone.setStyle(style);
												}
												return clone;
											} else {
												mxLog.warn('Template '
														+ template
														+ ' not found');
											}
											return null;
										}
										var img = into.addPrototype(as, icon,
												create);
										select = into.addCombo();

										mxEvent.addListener(select, 'change',
												function() {
													into.toolbar.selectMode(
															img, function(evt) {
																var pt = mxUtils
																		.convertPoint(
																				editor.graph.container,
																				evt.clientX,
																				evt.clientY);
																return editor
																		.addVertex(
																				null,
																				funct(),
																				pt.x,
																				pt.y);
															});
													into.toolbar.noReset = false;
												});
										for (var i = 0; i < children.length; i++) {
											var child = children[i];
											if (child.nodeName == 'separator') {
												into.addOption(select, '---');
											} else if (child.nodeName == 'add') {
												var lab = child
														.getAttribute('as');
												var tmp = child
														.getAttribute('template');
												var option = into.addOption(
														select, lab, tmp
																|| template);
												option.cellStyle = child
														.getAttribute('style');
											}
										}
									}
								}
							}
						}
					}
				}
				node = node.nextSibling;
			}
		}
		return into;
	};
	return codec;
}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxDefaultPopupMenu());
			codec.encode = function(enc, obj) {
				return null;
			};
			codec.decode = function(dec, node, into) {
				var inc = node.getElementsByTagName('include')[0];
				if (inc != null) {
					this.processInclude(dec, inc, into);
				} else if (into != null) {
					into.config = node;
				}
				return into;
			};
			return codec;
		}());

mxCodecRegistry.register(function() {
			var codec = new mxObjectCodec(new mxEditor(), ['modified',
							'lastSnapshot', 'ignoredChanges', 'undoManager',
							'graphContainer', 'toolbarContainer']);
			codec.afterDecode = function(dec, node, obj) {
				var defaultEdge = node.getAttribute('defaultEdge');
				if (defaultEdge != null) {
					node.removeAttribute('defaultEdge');
					obj.defaultEdge = obj.templates[defaultEdge];
				}
				var defaultGroup = node.getAttribute('defaultGroup');
				if (defaultGroup != null) {
					node.removeAttribute('defaultGroup');
					obj.defaultGroup = obj.templates[defaultGroup];
				}
				return obj;
			};
			codec.decodeChild = function(dec, child, obj) {
				if (child.nodeName == 'Array') {
					var role = child.getAttribute('as');
					if (role == 'templates') {
						this.decodeTemplates(dec, child, obj);
						return;
					}
				} else if (child.nodeName == 'ui') {
					this.decodeUi(dec, child, obj);
					return;
				}
				mxObjectCodec.prototype.decodeChild.apply(this, arguments);
			};
			codec.decodeUi = function(dec, node, editor) {
				var tmp = node.firstChild;
				while (tmp != null) {
					if (tmp.nodeName == 'add') {
						var as = tmp.getAttribute('as');
						var elt = tmp.getAttribute('element');
						var style = tmp.getAttribute('style');
						var element = null;
						if (elt != null) {
							element = document.getElementById(elt);
							if (element != null && style != null) {
								element.style.cssText += ';' + style;
							}
						} else {
							var x = parseInt(tmp.getAttribute('x'));
							var y = parseInt(tmp.getAttribute('y'));
							var width = tmp.getAttribute('width');
							var height = tmp.getAttribute('height');
							element = document.createElement('div');
							element.style.cssText = style;
							var wnd = new mxWindow(mxResources.get(as) || as,
									element, x, y, width, height, false, true);
							wnd.setVisible(true);
						}
						if (as == 'graph') {
							editor.setGraphContainer(element);
						} else if (as == 'toolbar') {
							editor.setToolbarContainer(element);
						} else if (as == 'title') {
							editor.setTitleContainer(element);
						} else if (as == 'status') {
							editor.setStatusContainer(element);
						} else if (as == 'map') {
							editor.setMapContainer(element);
						}
					} else if (tmp.nodeName == 'resource') {
						mxResources.add(tmp.getAttribute('basename'));
					} else if (tmp.nodeName == 'stylesheet') {
						mxClient.link('stylesheet', tmp.getAttribute('name'));
					}
					tmp = tmp.nextSibling;
				}
			};
			codec.decodeTemplates = function(dec, node, editor) {
				if (editor.templates == null) {
					editor.templates = new Array();
				}
				var children = mxUtils.getChildNodes(node);
				for (var j = 0; j < children.length; j++) {
					var name = children[j].getAttribute('as');
					var child = children[j].firstChild;
					while (child != null && child.nodeType != 1) {
						child = child.nextSibling;
					}
					if (child != null) {

						editor.templates[name] = dec.decodeCell(child);
					}
				}
			};
			return codec;
		}());
if(!mxClient.IS_IE) {
// mxClient.include('chrome://global/content/contentAreaUtils.js');
}
if (mxClient.loading == null) {
	mxClient.onload();
}

// ********************************************************//
// ********************************************************//
	
	// 选择函数双向列表右侧单击事件处理方法
	function setFunctionParatmeters(opt, record) {
	if(!record)return;
	var functionid = record.data.value;
	var functionID = '';
	var functionparameter = '';
	var parameter = '';
	var thisItems=Ext.getCmp('setfunctionparameter').items;
	
	var thismodelId=Ext.getCmp('hiddenModelId').getValue();
	var thisactionId=Ext.getCmp('hiddenActionId').getValue();
	
	if(thisItems.length>0){
		for(var i=0;i<thisItems.length;i++){
			var itemID= thisItems.get(i).getId();
			Ext.getCmp('setfunctionparameter').remove(itemID);
		}
		if(Ext.getCmp('checkPathbutton'))Ext.getCmp('setfunctionparameter').remove(Ext.getCmp('checkPathbutton').getId());
		if(Ext.getCmp('updateStateFieldButton'))Ext.getCmp('setfunctionparameter').remove(Ext.getCmp('updateStateFieldButton').getId());
	}
	if(!Ext.getCmp('ES_ACTION_SELECTFUNCTION').getValue()){
		Ext.getCmp('setfunctionparameter').hide();
		Ext.getCmp('dataImportFunction').setValue('');
		Ext.getCmp('updateStateFunction').setValue('');
		return;
	}
	var temfunctionid = Ext.getCmp('ES_ACTION_SELECTFUNCTION').getValue().split(',');
	var incheck = 'false';
	for(var ind = 0; ind<temfunctionid.length;ind++ ){
		if(temfunctionid[ind]==functionid)incheck='true';
	}
	if(incheck=='false'){
		Ext.getCmp('setfunctionparameter').hide();
		if(functionid=='1'){
			Ext.getCmp('dataImportFunction').setValue('');
		}else if(functionid=='2'){
			Ext.getCmp('updateStateFunction').setValue('');
		}
		return;
	}
	$.post( $.appClient.generateUrl({ESTransferFlow : 'formCheckMethod'}, 'x')
				,{functionid:functionid, actionID:thisactionId, modelID: thismodelId}, function(res){
				var json = eval('(' + res + ')');
				functionparameter = json.functionname;
				parameter = json.parameter;
				functionID = json.functionID;
				if(functionid == '1'){
					// Ext.getCmp('dataImportFunction').setValue('ID:'+functionID+',functionName:'+functionparameter+'');
					if (Ext.getCmp('dataimportPath')
						&& Ext.getCmp('checkPathbutton')) {

					} else {

					Ext.getCmp('setfunctionparameter')
							.add(new Ext.form.TextField({
										id : 'dataimportPath',
										fieldLabel : '树节点路径',
										width : 300,
										disabled : true
									}));
					Ext.getCmp('setfunctionparameter').add(new Ext.Button({
						text : '选择树节点',
						id : 'checkPathbutton',
						handler : function(){
							selectStructure('OsModel_Action_Form_Id','dataimportPath');
						}
					}));
					Ext.getCmp('setfunctionparameter').doLayout();
					if (record){
						/** niuhe 20130619 将设置函数参数FieldSet组件隐藏 * */					
						// Ext.getCmp('setfunctionparameter').show();
					}
					}
					if (parameter!=null) {
					
					// jiangyuntao edit
					// var paras=parameter.split(",");
					// var thismodelId=Ext.getCmp('hiddenModelId').getValue();
					// var thisactionId=Ext.getCmp('hiddenActionId').getValue();
					// for(var index=0;index<paras.length;index++){
						// var oneparas=paras[index].split(":");
					// var modelid=oneparas[0].split("_")[0];
					// var actionid=oneparas[0].split("_")[1];
					// if(modelid==thismodelId&&actionid==thisactionId){
							// Ext.getCmp('dataimportPath')
						// .setValue(oneparas[1]);
						Ext.getCmp('dataimportPath').setValue(parameter);	
						// Ext.getCmp('dataImportFunction').setValue(parameter);
					// }
					// }
					}
				}
				else if(functionid == '2'){
					// Ext.getCmp('updateStateFunction').setValue('ID:'+functionID+',functionName:'+functionparameter+'');
					if (Ext.getCmp('updateStateField')
						&& Ext.getCmp('updateStateFieldButton')) {

					} else {
						Ext.getCmp('setfunctionparameter')
							.add(new Ext.form.TextField({
										id : 'updateStateField',
										fieldLabel : '状态值',
										width : 300
									}));
					// jiangyuntao 20110819 edit 去掉设置状态按钮
					// Ext.getCmp('setfunctionparameter').add(new Ext.Button({
					// text : '设置状态',
					// id : 'updateStateFieldButton',
					// handler : function(){
							// Ext.getCmp('updateStateFunction').setValue(parameter);
							// var
							// thisbs=Ext.getCmp('updateStateFunction').getValue();
							// functionstate=thisbs.split(',');
							// if(functionstate.length>2){
								// Ext.getCmp('updateStateFunction').setValue(thisbs.substring(0,thisbs.lastIndexOf(',')));
								
							// }
							// Ext.getCmp('updateStateFunction').setValue(Ext.getCmp('updateStateFunction').getValue()+',state:'+Ext.getCmp('updateStateField').getValue());
					// }
					// }));
					Ext.getCmp('setfunctionparameter').doLayout();
					if (record){
						/** niuhe 20130619 将设置函数参数FieldSet组件隐藏 * */					
						// Ext.getCmp('setfunctionparameter').show();
					}
					}
					
					if (parameter!=null) {
					Ext.getCmp('updateStateField').setValue(parameter);
					// Ext.getCmp('updateStateFunction').setValue(parameter);
					// jiangyuntao edit
					// var paras=parameter.split(",");
					// var thismodelId=Ext.getCmp('hiddenModelId').getValue();
					// var thisactionId=Ext.getCmp('hiddenActionId').getValue();
					// for(var index=0;index<paras.length;index++){
					// var oneparas=paras[index].split(":");
					// var modelid=oneparas[0].split("_")[0];
					// var actionid=oneparas[0].split("_")[1];
					// if(modelid==thismodelId&&actionid==thisactionId){
					// Ext.getCmp('updateStateField')
					// .setValue(oneparas[1]);
					
					// }
					// }
					}	
					
					}
		});

		Ext.getCmp('setfunctionparameter').doLayout();
		if (record){
			/** niuhe 20130619 将设置函数参数FieldSet组件隐藏 * */		
			// Ext.getCmp('setfunctionparameter').show();
		}
}

	function deleteCellfromDB(cellId,graph){
			includeEdges = true;
			var cells = null;
			if (cells == null) {
				cells = graph.getDeletableCells(graph.getSelectionCells());
			}
			if (includeEdges) {
				cells = graph.getDeletableCells(graph.addAllEdges(cells));
			}
									
			var tempcells = [];
			cells.sort();
			for(var i = cells.length-1;i>-1;i--){
				if((!tempcells[tempcells.length-1])||cells[i].getId()!=tempcells[tempcells.length-1].getId()){
					tempcells.push(cells[i]); 
				}
			}
									
			var edges = '';
			var others = '';
			var otherNames = '' ;
			for(var j=0;j<tempcells.length;j++){
				if(tempcells[j].isEdge()){
					edges += ',' + tempcells[j].getId();
				}else{
					others += ',' + tempcells[j].getId();
					otherNames += ',' + tempcells[j].getValue();
				}
			}
			// xiaoxiong 20120326 修改在定制时 删除出错
			var modelID = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue() ;
			if(modelID == '' || modelID=='-1'){
				graph.removeCells();
			} else {
			// end
			// xiaoxiong 20120516 添加判断 当时删除步骤时 添加验证要删除步骤在系统中是否存在流转的数据 如果存在不允许删除
			// 否则可以
				if(others == ''){
					var postData = "edges="+edges+"&others="+others+"&modelID="+modelID ;
					$.post( $.appClient.generateUrl({ESTransferFlow : 'deleteCellfromDB'}, 'x')
							,{data:postData}, function(json){
								if(json.check&&json.check=='true'){
									graph.removeCells();
								}
								if(json.msgType == "1"){
									$.dialog.notice({icon : 'success',content : json.msg,title : '3秒后自动关闭',time : 3});
								} else {
									$.dialog.notice({icon : 'error',content : json.msg,title : '3秒后自动关闭',time : 3});
									return false;
								}
					},"json");
				} else {
					var postData = "modelID="+modelID+"&otherNames="+otherNames+"&others="+others ;
					$.post( $.appClient.generateUrl({ESTransferFlow : 'verificationIsHasNotDealWf'}, 'x')
							,{data:postData}, function(tempJson){
								if(tempJson.has=='false'){
									var postData = "edges="+edges+"&others="+others+"&modelID="+modelID ;
									$.post( $.appClient.generateUrl({ESTransferFlow : 'deleteCellfromDB'}, 'x')
											,{data:postData}, function(json){
												if(json.check&&json.check=='true'){
													graph.removeCells();
												}
												if(json.msgType == "1"){
													$.dialog.notice({icon : 'success',content : json.msg,title : '3秒后自动关闭',time : 3});
												} else {
													$.dialog.notice({icon : 'error',content : json.msg,title : '3秒后自动关闭',time : 3});
													return false;
												}
									},"json");
								} else {
									$.dialog.notice({icon : 'error',content : tempJson.msg,title : '3秒后自动关闭',time : 3});
									return false;
								}
					},"json");
					
				}
			}
		}
		
	function deleteWorkflowByCloseWindow(){
			$.post( $.appClient.generateUrl({ESTransferFlow : 'dropWfModel'}, 'x')
				,{modelId:Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue()}, function(json){
					if(Ext.getCmp('workflowModelModify_MxGraph_Window'))Ext.getCmp('workflowModelModify_MxGraph_Window').destroy();  
	    			if(Ext.getCmp('workflowModelMxGraph_Window')){Ext.getCmp('workflowModelMxGraph_Window').destroy();}
	    			if(Ext.getCmp('workflowModelwfModelList')) {Ext.getCmp('workflowModelwfModelList').getStore().reload();}
					if("1" == json.msgType){
						$.dialog.notice({icon : 'success',content : json.message,title : '3秒后自动关闭',time : 3});
						$("#modelDataGrid").flexReload();
					} else {
						$.dialog.notice({icon : 'error',content : json.message,title : '3秒后自动关闭',time : 3});
						return false;
					}
			},"json");
		}
		
	function saveWorkflowGraphXml(graph){
            	var cells = graph.getCells(0, 0, 100000, 1000000);
            	var allcheck=true;
            	var msg='';
            	var edges=[];var edgescount=0;var checkOKCount=0; var rightCheckOKCount=0;
            	var beginCount=0;
            	var endCount=0;
            	var stepCount=0;
            	for(var i=0;i<cells.length;i++){
            		var cell=cells[i];
					var isEdge= cell.isEdge();
					if(isEdge==true||isEdge==1||isEdge=='1'){
						edges[edgescount]=cell;edgescount++;
					}
            	}
				for(var i=0;i<cells.length;i++){
					var cell=cells[i];
					var style = cell.getStyle();
					var parent = cell.getParent();
					// var parentId = parent.getId();
					var cellValue = cell.getValue();
					// var geometry = cell.getGeometry();
					// var childAt = cell.getChildAt();
					var isEdge= cell.isEdge();// 判断是不是直线或曲线{true、false、1}
					if(style!=null&&style.length>=7&&style.substring(0,7)=='ellipse'&&isEdge==false&&cellValue=='开始'){// /
																														// 开始节点（椭圆形）
						beginCount++;
						for(var j=0;j<edges.length;j++){
							var edgecell=edges[j];
							var sourceCell = edgecell.getTerminal(true);
							var targetCell = edgecell.getTerminal(false);
							// alert('cellID:'cell.getId()+",
							// sourceID:"+sourceCell.getId()+",
							// targetCell:"+targetCell.getId());
							if(sourceCell&&sourceCell==cell){
								checkOKCount++;
								if(checkOKCount>1){
									allcheck=false;
									msg+='只能为开始节点设置一个下一步动作！<br>';
									// showMsg('友情提示','只能为开始节点设置一个下一步动作！');return;
								}
							}
						}
						if(checkOKCount==0){
							allcheck=false;
							msg+='没有为开始节点设置下一步动作！<br>';
							// showMsg('友情提示','没有为开始节点设置下一步动作！');return;
						}
						checkOKCount=0;
					}else if(isEdge==true||isEdge==1||isEdge=='1'){ // /动作直线或曲线
						var sourceCell = cell.getTerminal(true);
						var targetCell = cell.getTerminal(false);
						if(!(sourceCell&&targetCell)){
							// showMsg('友情提示','请确认"'+cell.getValue()+'"已连接至开始、步骤、分支、或结束');
							// return;
							allcheck=false;
							msg+='请确认"'+cell.getValue()+'"已连接至开始、步骤、分支、或结束！<br>';
						}
					}else if(style!=null&&style.length>=7&&style.substring(0,7)=='rhombus'&&isEdge==false){// 分支节点：设置流程走向的条件（spit）
						for(var j=0;j<edges.length;j++){
							var edgecell=edges[j];
							var sourceCell = edgecell.getTerminal(true);
							
							var targetCell = edgecell.getTerminal(false);
							if(targetCell&&targetCell==cell){
								checkOKCount++;
								if(sourceCell){
									var thisstyle = sourceCell.getStyle();
									var thisisEdge= sourceCell.isEdge();
								   if(thisstyle!=null&&thisstyle.length>=7&&thisstyle.substring(0,7)=='rhombus'&&thisisEdge==false){
								   		allcheck=false;
										msg+='分支的上个步骤不能是分支！<br>';
								   }
								}
							}
							if(sourceCell&&sourceCell==cell){
								rightCheckOKCount++;
								// if(targetCell){
									// var thisstyle = targetCell.getStyle();
									// var thisisEdge= targetCell.isEdge();
									// if(thisstyle!=null&&thisstyle.length>=7&&thisstyle.substring(0,7)=='rhombus'&&thisisEdge==false){
								   	// allcheck=false;
									// msg+='分支的下个步骤不能是分支！<br>';
								  // }
								// }
							}
						}
						if(checkOKCount==0){
							// showMsg('友情提示','没有动作指向"'+cell.getValue()+'"！');
							// return;
							allcheck=false;
							msg+='没有动作指向"'+cell.getValue()+'"！<br>';
						}
						if(rightCheckOKCount==0){
							allcheck=false;
							msg+='没有为"'+cell.getValue()+'"设置下一步动作！<br>';
							// showMsg('友情提示','没有为"'+cell.getValue()+'"设置下一步动作！');
								// return;
						}
						checkOKCount=0;
						rightCheckOKCount=0;
					}else if(style!=null&&style.length>=7&&style.substring(0,7)=='ellipse'&&isEdge==false&&cellValue=='结束'){
						endCount++;
						for(var j=0;j<edges.length;j++){
							var edgecell=edges[j];
							var targetCell = edgecell.getTerminal(false);
							if(targetCell&&targetCell==cell){
								checkOKCount++;
							}
						}
						if(checkOKCount==0){
							// showMsg('友情提示','没有设置动作指向结束节点！');return;
							allcheck=false;
							msg+='没有设置动作指向结束节点！<br>';
						}
						checkOKCount=0;
					}else{ // /节点矩形
						for(var j=0;j<edges.length;j++){
							var edgecell=edges[j];
							var sourceCell = edgecell.getTerminal(true);
							var targetCell = edgecell.getTerminal(false);
							if(sourceCell&&sourceCell==cell){
								checkOKCount++;
								// if(checkOKCount>1){
									// showMsg('友情提示','只能为"'+cell.getValue()+'"设置一个下一步动作！');return;
								// }
							}
							if(targetCell&&targetCell==cell){
								rightCheckOKCount++;
							}
						}
						if(checkOKCount==0){
							allcheck=false;
							msg+='没有为"'+cell.getValue()+'"设置下一步动作！<br>';
							// showMsg('友情提示','没有为"'+cell.getValue()+'"设置下一步动作！');return;
						}
						if(rightCheckOKCount==0){
							allcheck=false;
							msg+='"'+cell.getValue()+'"没有被动作指向！<br>';
							// showMsg('友情提示','"'+cell.getValue()+'"没有被动作指向！');return;
						}
						checkOKCount=0;
						rightCheckOKCount=0;
						stepCount++;
					}
				}
            	if(stepCount<2){
            		allcheck=false;
					msg+='请设置两个以上步骤！<br>';
            		// showMsg('友情提示','请设置两个以上步骤！');return;
            	}
            	if(beginCount!=1){
            		allcheck=false;
					msg+='必须且只能有一个开始节点！<br>';
            	}
            	if(endCount!=1){
            		allcheck=false;
					msg+='必须且只能有一个结束节点！<br>';
            	}
            	if(!allcheck){
            		showMsg(msg,'3');
            		return false;
            	}
            	var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(graph.getModel());
				if(enc){enc=null;}
// var tempXml = mxUtils.popup(mxUtils.getPrettyXml(node));
				var graphXml = mxUtils.getPrettyXml(node);
				var modelId = Ext.getCmp('osWfModel_custom_form_init_hidden_Model_ID').getValue();
				var formId = "form-"+Ext.getCmp('osFormBuilder_custom_form_init_hidden_Form_ID').getValue();
				if(modelId==''){
					showMsg('保存失败！请双击开始图形进行工作流初始化设置。','2');	
					return false;
				}
				var loadMask = null;
				if(Ext.getCmp('workflowModelMxGraph_Window')){
					loadMask = new Ext.LoadMask(Ext.getCmp('workflowModelMxGraph_Window').body,{msg:'正在保存工作流程，请稍候....',removeMask :true});
					loadMask.show();
				}
				if(Ext.getCmp('workflowModelModify_MxGraph_Window')){
					loadMask = new Ext.LoadMask(Ext.getCmp('workflowModelModify_MxGraph_Window').body,{msg:'正在保存工作流程，请稍候....',removeMask :true});
					loadMask.show();
				}
        		graphXml = encodeURI(graphXml);
        		var docHtml = mxUtils.getInnerHtml(graph.container);
        		// xiaoxiong 20120327 标示是定制的过程 用于后台版本控制
        		var isCreateWin = '0' ;
        		if(Ext.getCmp('workflowModelMxGraph_Window')){
        			isCreateWin = '1' ;
        		}
        		
        		var postData = $("#"+$("#osWfModel_custom_form_hidden").find("form")[0].id).serialize(); 
		    	postData += "&graphXml="+graphXml;
		    	postData += "&modelId="+modelId ;
		    	postData += "&isCreateWin="+isCreateWin ;
		    	postData += "&formId="+formId ;
		    	postData += "&docHtml="+docHtml ;
		    	postData += "&typeID="+Ext.getCmp('osWfModel_custom_form_init_hidden_Model_Type_ID').getValue() ;
		    	postData += "&username="+$("#createWorkflowDiv").attr("userName") ;
        		$.post($.appClient.generateUrl({ESTransferFlow : 'saveWfModel'}, 'x')
		    			,{data:postData,
        					graphXml:graphXml,
        					modelId:modelId ,
        					isCreateWin:isCreateWin ,
        					formId:formId ,
        					docHtml:docHtml ,
        					typeID:Ext.getCmp('osWfModel_custom_form_init_hidden_Model_Type_ID').getValue(),
        					username:$("#createWorkflowDiv").attr("userName")
        			}, function(json){
	        				if (json.success == 'true') {
	        					if(loadMask){
				        			Ext.destroy(loadMask);
				        			loadMask = null;
				        		}
				        		if(graphXml){graphXml=null;}
				        		if(docHtml){docHtml=null;}
				        		var returnMsg = json.message ;
				        		if(returnMsg){
				        			$.dialog.notice({icon : 'success',content : '保存成功！<br>'+returnMsg,title : '3秒后自动关闭',time : 3});
				        		}else{
			 				    	$.dialog.notice({icon : 'success',content : '保存成功！',title : '3秒后自动关闭',time : 3});
				        		}
				        		art.dialog.list['createWorkFlowDialog'].close();
				        		if($("#modelDataGrid"))$('#modelDataGrid').flexReload();
    							if(Ext.getCmp('wfGraphEditorPanelId')){Ext.getCmp('wfGraphEditorPanelId').destroy();}
	        				} else {
			 			 		if(loadMask){
				        			Ext.destroy(loadMask);
				        			loadMask = null;
				        		}
				        		if(graphXml){graphXml=null;}
				        		if(docHtml){docHtml=null;}
	        					$.dialog.notice({icon : 'error',content : '保存失败！请双击开始图形进行工作流初始化设置。',title : '3秒后自动关闭',time : 3});
	        				}
    			},"json");
		}