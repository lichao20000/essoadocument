/*
 * Flexigrid for jQuery -  v1.1
 *
 * Copyright (c) 2008 Paulo P. Marinas (code.google.com/p/flexigrid/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {
	$.addFlex = function (t, p) {
		if (t.grid) return false; //return if already exist
		p = $.extend({ //apply default properties
			height: 200, //default height
			width: 'auto', //auto width
			striped: true, //apply odd even stripes
			novstripe: false,
			minwidth: 30, //min width of columns
			minheight: 80, //min height of columns
			resizable: false, //allow table resizing
			url: false, //URL if using data from AJAX
			method: 'POST', //data sending method
			dataType: 'xml', //type of data for AJAX, either xml or json
			errormsg: 'Connection Error',
			usepager: false,
			nowrap: true,
			singleSelect:true,
			page: 1, //current page
			total: 1, //total pages
			useRp: true, //use the results per page select box
			rp: 20, //results per page
			rpOptions: [20, 50, 100], //allowed per-page values 
			title: false,
			idProperty: 'id',
			itemtext: '页',
			pagestat: '显示 {from} 到 {to}条 / 共{total} 条',
			pagetext: '第',
			outof: '页 /共',
			findtext: '查询',
			params: [], //allow optional parameters to be passed around
			procmsg: '正在加载，请稍后...',
			query: '',
			qtype: '',
			nomsg: '没有数据',
			minColToggle: 1, //minimum allowed column to be hidden
			showToggleBtn: true, //show or hide column toggle popup
			showTableToggleBtn: false, //show or hide table
			showBtnClick:false,//show or hide table 触发的回调时间
			hideOnSubmit: true,
			editable: false, //是否可编辑
			autoload: true,
			blockOpacity: 0.5,
			preProcess: false,
			addTitleToCell: false, // add a title attr to cells with truncated contents
			dblClickResize: true, //auto resize column by double clicking
			onDragCol: false,
			onToggleCol: false,
			onChangeSort: false,
			onCellChange: false, // 单元格编辑事件
			onClick: false, // 单元格点击事件， function(td, grid, options){}
			onDoubleClick: false,
			onSuccess: false,
			onError: false,
			onSubmit: false //using a custom populate function
		}, p);
		$(t).show() //show if hidden
			.attr({
				cellPadding: 0,
				cellSpacing: 0,
				border: 0
			}) //remove padding and spacing
			.removeAttr('width'); //remove width properties
		//create grid class
		var g = {
			hset: {},
			rePosDrag: function () {
				var cdleft = 0 - this.hDiv.scrollLeft;
				if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
				$(g.cDrag).css({
					top: g.hDiv.offsetTop + 1
				});
				var cdpad = this.cdpad;
				$('div', g.cDrag).hide();
				
				/*if(typeof thObj !='undefined' && thObj.length>0){
					var obj=thObj.filter(":visible");
				}else{
					var obj=$('thead tr:first th:visible', this.hDiv);
				}*/
				$('thead tr:first th:visible', this.hDiv).each(function (i) {
					//var n = $('thead tr:first th:visible', g.hDiv).index(this);
					var n = i;
					//var cdpos = parseInt($('div', this).width());
					var cdpos = parseInt(this.children[0].style.width.replace(/px/gi,""));
					if (cdleft == 0) cdleft -= Math.floor(p.cgwidth / 2);
					cdpos = cdpos + cdleft + cdpad;
					if (isNaN(cdpos)) {
						cdpos = 0;
					}
					$('div:eq(' + n + ')', g.cDrag).css({
						'left': cdpos + 'px'
					}).show();
					cdleft = cdpos;
				});
			},
			fixHeight: function (newH) {
				newH = false;
				if (!newH) newH = $(g.bDiv).height();
				var hdHeight = $(this.hDiv).height();
				$('div', this.cDrag).each(
					function () {
						$(this).height(newH + hdHeight);
					}
				);
				var nd = parseInt($(g.nDiv).height());
				if (nd > newH) $(g.nDiv).height(newH).width(200);
				else $(g.nDiv).height('auto').width('auto');
				$(g.block).css({
					height: newH,
					marginBottom: (newH * -1)
				});
				var hrH = g.bDiv.offsetTop + newH;
				if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
				$(g.rDiv).css({
					height: hrH
				});
			},
			dragStart: function (dragtype, e, obj) { //default drag function start
				if (dragtype == 'colresize') {//column resize
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					var n = $('div', this.cDrag).index(obj);
					var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
					$(obj).addClass('dragging').siblings().hide();
					$(obj).prev().addClass('dragging').show();
					this.colresize = {
						startX: e.pageX,
						ol: parseInt(obj.style.left),
						ow: ow,
						n: n
					};
					$('body').css('cursor', 'col-resize');
				} else if (dragtype == 'vresize') {//table resize
					var hgo = false;
					$('body').css('cursor', 'row-resize');
					if (obj) {
						hgo = true;
						$('body').css('cursor', 'col-resize');
					}
					this.vresize = {
						h: p.height,
						sy: e.pageY,
						w: p.width,
						sx: e.pageX,
						hgo: hgo
					};
				} else if (dragtype == 'colMove') {//column header drag
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					this.hset = $(this.hDiv).offset();
					this.hset.right = this.hset.left + $('table', this.hDiv).width();
					this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
					this.dcol = obj;
					this.dcoln = $('th', this.hDiv).index(obj);
					this.colCopy = document.createElement("div");
					this.colCopy.className = "colCopy";
					this.colCopy.innerHTML = obj.innerHTML;
					if ($.browser.msie) {
						this.colCopy.className = "colCopy ie";
					}
					$(this.colCopy).css({
						position: 'absolute',
						float: 'left',
						display: 'none',
						textAlign: obj.align
					});
					$('body').append(this.colCopy);
					$(this.cDrag).hide();
				}
				$('body').noSelect();
			},
			dragMove: function (e) {
				if (this.colresize) {//column resize
					var n = this.colresize.n;
					var diff = e.pageX - this.colresize.startX;
					var nleft = this.colresize.ol + diff;
					var nw = this.colresize.ow + diff;
					if (nw > p.minwidth) {
						$('div:eq(' + n + ')', this.cDrag).css('left', nleft);
						this.colresize.nw = nw;
					}
				} else if (this.vresize) {//table resize
					var v = this.vresize;
					var y = e.pageY;
					var diff = y - v.sy;
					if (!p.defwidth) p.defwidth = p.width;
					if (p.width != 'auto' && !p.nohresize && v.hgo) {
						var x = e.pageX;
						var xdiff = x - v.sx;
						var newW = v.w + xdiff;
						if (newW > p.defwidth) {
							this.gDiv.style.width = newW + 'px';
							p.width = newW;
						}
					}
					var newH = v.h + diff;
					if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
						this.bDiv.style.height = newH + 'px';
						p.height = newH;
						this.fixHeight(newH);
					}
					v = null;
				} else if (this.colCopy) {
					$(this.dcol).addClass('thMove').removeClass('thOver');
					if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
						//this.dragEnd();
						$('body').css('cursor', 'move');
					} else {
						$('body').css('cursor', 'pointer');
					}
					$(this.colCopy).css({
						top: e.pageY + 10,
						left: e.pageX + 20,
						display: 'block'
					});
				}
			},
			dragEnd: function () {
				if (this.colresize) {
					var n = this.colresize.n;
					var nw = this.colresize.nw;
					$('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
					$('tr', this.bDiv).each(
						function () {
							var $tdDiv = $('td:visible div:eq(' + n + ')', this);
							$tdDiv.css('width', nw);
							g.addTitleToCell($tdDiv);
						}
					);
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					$('div:eq(' + n + ')', this.cDrag).siblings().show();
					$('.dragging', this.cDrag).removeClass('dragging');
					this.rePosDrag();
					this.fixHeight();
					this.colresize = false;
					var axis=$('th:visible:eq(' + n + ')', this.hDiv).attr("axis");
					var num=axis.match(/\d+/);
					var name = p.colModel[num].name;		// Store the widths in the cookies
					$.cookie('flexiwidths/'+name, nw);
				} else if (this.vresize) {
					this.vresize = false;
				} else if (this.colCopy) {
					$(this.colCopy).remove();
					if (this.dcolt != null) {
						if (this.dcoln > this.dcolt) $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
						else $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
						this.switchCol(this.dcoln, this.dcolt);
						$(this.cdropleft).remove();
						$(this.cdropright).remove();
						this.rePosDrag();
						if (p.onDragCol) {
							p.onDragCol(this.dcoln, this.dcolt);
						}
					}
					this.dcol = null;
					this.hset = null;
					this.dcoln = null;
					this.dcolt = null;
					this.colCopy = null;
					$('.thMove', this.hDiv).removeClass('thMove');
					$(this.cDrag).show();
				}
				$('body').css('cursor', 'default');
				$('body').noSelect(false);
			},
			toggleCol: function (cid, visible) {
				var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
				var n = $('thead th', g.hDiv).index(ncol);
				var cb = $('input[value=' + cid + ']', g.nDiv)[0];
				if (visible == null) {
					visible = ncol.hidden;
				}
				if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) {
					return false;
				}
				if (visible) {
					ncol.hidden = false;
					$(ncol).show();
					cb.checked = true;
				} else {
					ncol.hidden = true;
					$(ncol).hide();
					cb.checked = false;
				}
				$('tbody tr', t).each(
					function () {
						if (visible) {
							$('td:eq(' + n + ')', this).show();
						} else {
							$('td:eq(' + n + ')', this).hide();
						}
					}
				);
				this.rePosDrag();
				if (p.onToggleCol) {
					p.onToggleCol(cid, visible);
				}
				return visible;
			},
			switchCol: function (cdrag, cdrop) { //switch columns
				$('tbody tr', t).each(
					function () {
						if (cdrag > cdrop) $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
						else $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
					}
				);
				//switch order in nDiv
				if (cdrag > cdrop) {
					$('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
				} else {
					$('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
				}
				if ($.browser.msie && $.browser.version < 7.0) {
					$('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
			},
			scroll: function () {
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				this.rePosDrag();
			},
			//获取单行单个字段值
			getColumnValue:function(trObj,searchValue,colModel){
				var trValue='';
				var values='';
				var str='';
				for(var i=0;i<colModel.length;i++){
					for(var j=0;j<searchValue.length;j++){
						if(colModel[i].metadata==searchValue[j])
						{
							var index=$('[axis=col'+i+']',g.hDiv).index();
							trValue=trObj.find("td").eq(index).children().text();
							//xiaoxiong 20140430 修改获取值中存在空值，导致字段与值错位异常
//							if(str=$.trim(trValue)){
								values+=$.trim(trValue)+'|';
//							}
						}
					
					}
					
				}
				return values.slice(0,values.length-1);
			},
			getColumnName:function(searchValue,colModel){
				var ColumnName='';
				var values='';
				var str='';
				for(var i=0;i<colModel.length;i++){
					if(colModel[i].metadata==searchValue)
					{
						ColumnName=colModel[i].name;
						if(str=$.trim(ColumnName)){
							values=str;
						}
					}
				}
				return values;
			
			},
			//获取表格头部的中文名称
			getColumnDisplay:function(searchValue,colModel){
				var ColumnName='';
				var values='';
				var str='';
				for(var i=0;i<colModel.length;i++){
					if(colModel[i].metadata==searchValue)
					{
						ColumnName=colModel[i].display;
						if(str=$.trim(ColumnName)){
							values=str;
						}
					}
				}
				return values;
				
			},
			// 添加一行数据
			extendData: function (data){
				var that = this;
				if($.isArray(data)){
					$('.pReload', that.pDiv).removeClass('loading');
					this.loading = false;
					if (!data) {
						$('.pPageStat', that.pDiv).html(p.errormsg);
						return false;
					}
					var existData = $(t).find("tbody").length > 0
					var tbody = existData ? $(t).find("tbody")[0] : document.createElement('tbody');
					var oRs = $("tr", tbody).length;
					thObj=$('thead tr:first th', this.hDiv);
					if (p.dataType == 'json') {
						$.each(data, function (i, row) {
							row._rowNum = oRs + i;
							var tr = that.generateTrByJson(row);
							/*$("td", tr).each(function () {
								that.modifyCellProp(this);
							});*/
							that.modifyRowProp(tr);
							$(tr).attr("datastate", "new");
							$(tbody).append(tr);
							tr = null;
						});
					} else if (p.dataType == 'xml') {
						var i = 1;
						$("rows row", data).each(function () {
							i++;
							this._rowNum = i;
							var tr = that.generateTrByXml(this);
							$("td", tr).each(function () {
								that.modifyCellProp(this);
							});
							that.modifyRowProp(tr);
							$(tr).attr("datastate", "new");
							$(tbody).append(tr);
							tr = null;
						});
					}
					
				} else {
					$('.pPageStat', that.pDiv).html(p.errormsg);
					return false;
				}
				if (!existData) $(t).append(tbody);
				that.rePosDrag();
				data = null;
				i = null;
				if (p.onSuccess) {
					p.onSuccess(that);
				}
				if (p.hideOnSubmit) {
					$(g.block).remove();
				}
				that.hDiv.scrollLeft = that.bDiv.scrollLeft;
				if ($.browser.opera) {
					$(t).css('visibility', 'visible');
				}
			},
			addData: function (data) { //parse data
				if (p.dataType == 'json') {
					data = $.extend({rows: [], page: 0, total: 0}, data);
				}
				if (p.preProcess) {
					data = p.preProcess(data);
				}
				$('.pReload', this.pDiv).removeClass('loading');
				this.loading = false;
				if (!data) {
					$('.pPageStat', this.pDiv).html(p.errormsg);
					return false;
				}
				if (p.dataType == 'xml') {
					p.total = +$('rows total', data).text();
				} else {
					p.total = data.total;
				}
				if (p.total == 0) {
					$('tr, a, td, div', t).unbind();
					$(t).empty();
//					p.pages = 1;
//					p.page = 1;
					/** xiaoxiong 20140807 当没有数据时，将当前页与总页数的值设置为0 **/
					p.pages = 0;
					p.page = 0;
					this.buildpager();
					$('.pPageStat', this.pDiv).html(p.nomsg);
					return false;
				}
				p.pages = Math.ceil(p.total / p.rp);
				if (p.dataType == 'xml') {
					p.page = +$('rows page', data).text();
				} else {
					p.page = data.page;
				}
				this.buildpager();
				//build new body
				var tbody = document.createElement('tbody');
				thObj=$('thead tr:first th', this.hDiv);
				var oFrag=document.createDocumentFragment();
				if (p.dataType == 'json') {
					$.each(data.rows, function (i, row) {
						row._rowNum = i;
						var tr = g.generateTrByJson(row);
						//$(tbody).append(tr);
						oFrag.appendChild(tr);
						tr = null;
					});
					tbody.appendChild(oFrag);
				} else if (p.dataType == 'xml') {
					var i = 1;
					$("rows row", data).each(function () {
						i++;
						this._rowNum = i;
						var tr = g.generateTrByXml(this);
						$(tbody).append(tr);
						tr = null;
					});
				}
				$('tr', t).unbind();
				$(t).empty();
				//t.innerText='';
				t.appendChild(tbody);
				this.addCellProp();
				this.addRowProp();
				this.rePosDrag();
				tbody = null;
				data = null;
				i = null;
				if (p.onSuccess) {
					p.onSuccess(this);
				}
				if (p.hideOnSubmit) {
					$(g.block).remove();
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				if ($.browser.opera) {
					t.style.visibility='visible';
				}
				// longjunhao 20140820 总数小于分页的起始值时，取上一页的值
				if (p.total <= p.rp*p.pages && p.page > p.pages) {
					p.newp = p.pages;
					g.populate();
				}
			},
			generateTrByJson: function (data) {
				var tr = document.createElement('tr');
				if (data.name) tr.name = data.name;
				if (data.color) {
					tr.style.background=data.color;
				} else {
						if (data._rowNum % 2 && p.striped) tr.className = 'erow';
				}
				
				if (data[p.idProperty]) {
					tr.id = 'row' + data[p.idProperty];
				}
				 var oFrag=document.createDocumentFragment();
				thObj.each( //add cell
					function (i) {
						var td = document.createElement('td');
						var idx = $(this).attr('axis').substr(3);
						//var idx = i;
						td.align = this.align;
						// If each row is the object itself (no 'cell' key)
						if (typeof data.cell == 'undefined') {
							td.innerHTML = data[p.colModel[idx].name];
						} else {
							// If the json elements aren't named (which is typical), use numeric order
							if (typeof data.cell[idx] != "undefined") {
								td.innerHTML = (data.cell[idx] != null) ? data.cell[idx] : '&nbsp;';//null-check for Opera-browser
							} else {
								td.innerHTML = typeof data.cell[p.colModel[idx].name] != 'undefined' && data.cell[p.colModel[idx].name] != null ? data.cell[p.colModel[idx].name] : '&nbsp;';
							}
						}
						td.setAttribute('colname', p.colModel[idx].name); //td上添加列名便于操作
						td.setAttribute('abbr',this.getAttribute('abbr'));
						td.onclick=function(){
							if(p.onClick){
								p.onClick(this, g, p);
							}
						};
				var tdDiv = document.createElement('div');
				var pth = this;
				if (pth != null) {
					if (p.sortname == pth.getAttribute('abbr') && p.sortname) {
						td.className = 'sorted';
					}
					var width=this.children[0].style.width;
					tdDiv.style.width=width;
					tdDiv.style.textAlign=p.colModel[idx].align?p.colModel[idx].align:'center';
					if (pth.hidden) {
						//$(td).css('display', 'none');
						td.style.display='none';
					}
				}
				if (p.nowrap == false) {
					tdDiv.style.whiteSpace= 'normal';
				}
				tdDiv.innerHTML = td.innerHTML;
				//$(td).empty().append(tdDiv).removeAttr('width'); //wrap content
				td.innerHTML='';
				td.appendChild(tdDiv);
				g.addTitleToCell(tdDiv);
				// 添加单击事件 dengguoqi 20120921
				if (p.editable && pth.getAttribute("editable")) {
					$(tdDiv).prop({value:$(tdDiv).text()});
					$(td).click(function(){
						if($(tdDiv).prop("editing")) return;
						if(pth.dropdown){
							g.addDropdownbox(tdDiv, pth.dropdown);
						} else {
							g.addCellEditbox(tdDiv, pth.validate);								
						}
					});
				}
						oFrag.appendChild(td);
						td = null;
					});
				tr.appendChild(oFrag);
				
				// 将数据挂接到tr上
				tr.data = data;
				return tr;
			},
			generateTrByXml: function(data) {
				var tr = document.createElement('tr');
				if ($(data).attr('name')) tr.name = $(data).attr('name');
				if ($(data).attr('color')) {
					$(tr).css('background',$(data).attr('id'));
				} else {
					if (data._rowNum % 2 && p.striped) tr.className = 'erow';
				}
				var nid = $(data).attr('id');
				if (nid) {
					tr.id = 'row' + nid;
				}
				nid = null;
				var robj = data;
				$('thead tr:first th', g.hDiv).each(function () {
					var td = document.createElement('td');
					var idx = $(this).attr('axis').substr(3);
					td.align = this.align;
					
					var text = $("cell:eq(" + idx + ")", robj).text();
					var offs = text.indexOf( '<BGCOLOR=' );
					if( offs >0 ) {
						$(td).css('background',  text.substr(offs+7,7) );
					}
					td.innerHTML = text;							
					$(td).attr('abbr', $(this).attr('abbr'));
					$(tr).append(td);
					td = null;
				});
				if ($('thead', g.gDiv).length < 1) {//handle if grid has no headers
					$('cell', data).each(function () {
						var td = document.createElement('td');
						td.innerHTML = $(this).text();
						$(tr).append(td);
						td = null;
					});
				}
				robj = null;
				return tr;
			},
			changeSort: function (th) { //change sortorder
				if (this.loading) {
					return true;
				}
				$(g.nDiv).hide();
				$(g.nBtn).hide();
				if (p.sortname == $(th).attr('abbr')) {
					if (p.sortorder == 'asc') {
						p.sortorder = 'desc';
					} else {
						p.sortorder = 'asc';
					}
				}
				$(th).addClass('sorted').siblings().removeClass('sorted');
				$('.sdesc', this.hDiv).removeClass('sdesc');
				$('.sasc', this.hDiv).removeClass('sasc');
				$('div', th).addClass('s' + p.sortorder);
				p.sortname = $(th).attr('abbr');
				if (p.onChangeSort) {
					p.onChangeSort(p.sortname, p.sortorder);
				} else {
					this.populate();
				}
			},
			buildpager: function () { //rebuild pager based on new properties
				$('.pcontrol input', this.pDiv).val(p.page);
				$('.pcontrol span', this.pDiv).html(p.pages);
				var r1 = (p.page - 1) * p.rp + 1;
				var r2 = r1 + p.rp - 1;
				if (p.total < r2) {
					r2 = p.total;
				}
				var stat = p.pagestat;
				stat = stat.replace(/{from}/, r1);
				stat = stat.replace(/{to}/, r2);
				stat = stat.replace(/{total}/, p.total);
				$('.pPageStat', this.pDiv).html(stat);
			},
			populate: function () { //get latest data
				if (this.loading) {
					return true;
				}
				if (p.onSubmit) {
					var gh = p.onSubmit();
					if (!gh) {
						return false;
					}
				}
				this.loading = true;
				if (!p.url) {
					return false;
				}
				$('.pPageStat', this.pDiv).html(p.procmsg);
				$('.pReload', this.pDiv).addClass('loading');
				$(g.block).css({
					top: g.bDiv.offsetTop
				});
				if (p.hideOnSubmit) {
					$(this.gDiv).prepend(g.block);
				}
				if ($.browser.opera) {
					$(t).css('visibility', 'hidden');
				}
				if (!p.newp) {
					p.newp = 1;
				}
				if (p.page > p.pages) {
					p.page = p.pages;
				}
				/*原始代码start
				var param = [{
					name: 'page',
					value: p.newp
				}, {
					name: 'rp',
					value: p.rp
				}, {
					name: 'sortname',
					value: p.sortname
				}, {
					name: 'sortorder',
					value: p.sortorder
				}, {
					name: 'query',
					value: p.query
				}, {
					name: 'qtype',
					value: p.qtype
				}];
				if (p.params.length) {
					for (var pi = 0; pi < p.params.length; pi++) {
						param[param.length] = p.params[pi];
					}
				}插件原始代码end*/
				var param={
					page:p.newp,
					rp:p.rp,
					sortname:p.sortname,
					sortorder:p.sortorder,
					query: p.query,
					qtype:p.qtype
					
				}
				if (p.params) {
						param.params=p.params;
				}
				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					success: function (data) {
						if((data+"").indexOf('&#26381;&#21153;&#22320;&#22336;&#27809;&#25214;&#21040;&#65292;&#35831;&#32852;&#31995;&#31649;&#29702;&#21592;&#65281;')>-1){
							$.dialog.notice({icon : 'error',content : data,title : '3秒后自动关闭',time : 3});
							g.addData({});
						} else {
							$.ajax({
								type: p.method,
								url: p.url,
								data: param,
								dataType: p.dataType,
								success: function (data) {
									g.addData(data);
								},
								error: function (XMLHttpRequest, textStatus, errorThrown) {
									try {
										if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
									} catch (e) {}
								}
							});
						}
					}
				});
			},
			doSearch: function () {
				p.query = $('input[name=q]', g.sDiv).val();
				p.qtype = $('select[name=qtype]', g.sDiv).val();
				p.newp = 1;
				this.populate();
			},
			changePage: function (ctype) { //change page
				if (this.loading) {
					return true;
				}
				switch (ctype) {
					case 'first':
						p.newp = 1;
						break;
					case 'prev':
						if (p.page > 1) {
							p.newp = parseInt(p.page) - 1;
						}
						break;
					case 'next':
						if (p.page < p.pages) {
							p.newp = parseInt(p.page) + 1;
						}
						break;
					case 'last':
						p.newp = p.pages;
						break;
					case 'input':
						var nv = parseInt($('.pcontrol input', this.pDiv).val());
						if (isNaN(nv)) {
							nv = 1;
						}
						if (nv < 1) {
							nv = 1;
						} else if (nv > p.pages) {
							nv = p.pages;
						}
						$('.pcontrol input', this.pDiv).val(nv);
						p.newp = nv;
						break;
				}
				if (p.newp == p.page) {
					return false;
				}
				if (p.onChangePage) {
					p.onChangePage(p.newp);
				} else {
					this.populate();
				}
			},
			// 修改单元格属性
			modifyCellProp: function (td){
				$(td).click(function(){
					if(p.onClick){
						p.onClick(td, g, p);
					}
				});
				var tdDiv = document.createElement('div');
				var n = $('td', $(td).parent()).index(td);
				var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
				if (pth != null) {
					if (p.sortname == $(pth).attr('abbr') && p.sortname) {
						td.className = 'sorted';
					}
					tdDiv.style.width=$($('div:first', pth)[0]).width()+'px';
					tdDiv.style.textAlign=pth.divAlign;
					/*$(tdDiv).css({
						textAlign: pth.divAlign,
						//textAlign: 'left',
						width: $($('div:first', pth)[0]).width()
					});*/
					if (pth.hidden) {
						$(td).css('display', 'none');
					}
				}
				if (p.nowrap == false) {
					$(tdDiv).css('white-space', 'normal');
				}
				// 取消空格
				//if (td.innerHTML == '') {
					//td.innerHTML = '&nbsp;';
				//}
				tdDiv.innerHTML = $($('div:first', $(td))[0]).html();
				var prnt = $(td).parent()[0];
				var pid = false;
				if (prnt.id) {
					pid = prnt.id.substr(3);
				}
				if (pth != null) {
					if (pth.process) pth.process(tdDiv, pid);
				}
				$(td).empty().append(tdDiv).removeAttr('width'); //wrap content
				g.addTitleToCell(tdDiv);
				
				// 添加单击事件 dengguoqi 20120921
				if (p.editable && $(pth).attr("editable")) {
					$(tdDiv).prop({value:$(tdDiv).text()});
					$(td).click(function(){
						if($(tdDiv).prop("editing")) return;
						if(pth.dropdown){
							g.addDropdownbox(tdDiv, pth.dropdown);
						} else {
							g.addCellEditbox(tdDiv, pth.validate);								
						}
					});
				}
			},
			addCellProp: function () {
				$('tbody tr td', g.bDiv).each(function () {
					g.modifyCellProp(this);
				});
			},
			// 添加下拉框
			addDropdownbox: function (obj, list) {
				if($.isArray(list) || $.isPlainObject(list)){
					var rect = g.getCellDim(obj);
					var $obj = $(obj);
					var select = $("<select></select>");
					$.each(list, function(i,n){
						if($obj.prop("value") === n){
							$(select).append("<option value='" + n + "' selected>" + n + "</option>");
						} else {
							$(select).append("<option value='" + n + "'>" + n + "</option>");
						}
					});
					$(select).width(rect.wt);
					$obj.html(select);
					$(select).focus();
					$obj.prop("editing",true);
					select.blur(function(){
						// 修改值后，修改行的数字状态属性
						var changed = false;
						if(!($obj.prop("value")===this.value)){
							$obj.closest("td").addClass("editing");
							if($obj.closest("tr").attr("datastate")!="new") $obj.closest("tr").attr("datastate", "modify");
							changed = true;
						}
						$obj.prop("value",this.value);
						$obj.html(this.value);
						$obj.prop("editing",false);	
						if(p.onCellChange && changed) p.onCellChange($obj.closest("td"), g);
					});
				}
			},
			// 添加编辑框
			addCellEditbox: function (obj, validate) {
				var rect = g.getCellDim(obj);
				var $obj = $(obj);
				var input = $("<input type='text' value='"+$obj.prop("value")+"' />");
				input.width(rect.wt - 10);
				input.height(16);
				input.css("border","1px solid #ABADB3");
				if(validate){
					// 执行验证
					input.keyup(function(){
						if(this.value.search(validate.rule) === -1){
							this.title = validate.title;
							$(this).css("border","1px solid red");
							this.incorrect = true;
						} else {
							this.title = "";
							$(this).css("border","1px solid #ABADB3");
							this.incorrect = false;
						}
					});
				}
				$obj.html(input);
				$(input).select();
				$(input).focus();
				$obj.prop("editing",true);
				input.blur(function(){
					// 修改值后，修改行的数字状态属性
					var changed = false;
					if(this.incorrect == true){
						$obj.html($obj.prop("value"));
					} else {
						if(!($obj.prop("value")===this.value)){
							$obj.closest("td").addClass("editing");
							if($obj.closest("tr").attr("datastate")!="new") $obj.closest("tr").attr("datastate", "modify");
							changed = true;
						}
						$obj.prop("value",this.value);
						$obj.html(this.value);
					}
					$obj.prop("editing",false);	
					if(p.onCellChange && changed) p.onCellChange($obj.closest("td"), g);
				});
			},
			getCellDim: function (obj) {// get cell prop for editable event
				var ht = parseInt($(obj).height());
				var pht = parseInt($(obj).parent().height());
				var wt = parseInt(obj.style.width);
				var pwt = parseInt($(obj).parent().width());
				var top = obj.offsetParent.offsetTop;
				var left = obj.offsetParent.offsetLeft;
				var pdl = parseInt($(obj).css('paddingLeft'));
				var pdt = parseInt($(obj).css('paddingTop'));
				return {
					ht: ht,
					wt: wt,
					top: top,
					left: left,
					pdl: pdl,
					pdt: pdt,
					pht: pht,
					pwt: pwt
				};
			},
			// 修改数据行属性
			modifyRowProp: function (tr) {
				$(tr).click(function (e) {
					var obj = (e.target || e.srcElement);
					if (obj.href || obj.type) return true;
					var checkObj=$(tr).find(":checkbox").eq(0);
						var isChecked=checkObj.attr("checked");
						checkObj.attr("checked",isChecked?false:true);
					if (p.singleSelect && ! g.multisel ) {
						$(tr).siblings().removeClass('trSelected');
						$(tr).toggleClass('trSelected');
						
					}else{
						$(tr).toggleClass('trSelected');
					}
				}).mousedown(function (e) {
					if (e.shiftKey) {
						$(tr).toggleClass('trSelected');
						g.multisel = true;
						tr.focus();
						$(g.gDiv).noSelect();
					}
					if (e.ctrlKey)
					{
						$(tr).toggleClass('trSelected'); 
						g.multisel = true; 
						tr.focus();
					}
				}).mouseup(function () {
					if (g.multisel && ! e.ctrlKey) {
						g.multisel = false;
						$(g.gDiv).noSelect(false);
					}
				}).dblclick(function () {
					if (p.onDoubleClick) {
						p.onDoubleClick(tr, g, p);
					}
				}).hover(function (e) {
					if (g.multisel && e.shiftKey) {
						$(tr).toggleClass('trSelected');
					}
				}, function () {});
				if ($.browser.msie && $.browser.version < 7.0) {
					$(tr).hover(function () {
						$(tr).addClass('trOver');
					}, function () {
						$(tr).removeClass('trOver');
					});
				}
			},
			addRowProp: function () {
				$('tbody tr', g.bDiv).each(function () {
					g.modifyRowProp(this);
				});
			},
			
			combo_flag: true,
			combo_resetIndex: function(selObj)
			{
				if(this.combo_flag) {
					selObj.selectedIndex = 0;
				}
				this.combo_flag = true;
			},
			combo_doSelectAction: function(selObj)
			{
				eval( selObj.options[selObj.selectedIndex].value );
				selObj.selectedIndex = 0;
				this.combo_flag = false;
			},			
			//Add title attribute to div if cell contents is truncated
			addTitleToCell: function(tdDiv) {
				if(p.addTitleToCell) {
					var $span = $('<span />').css('display', 'none'),
						$div = (tdDiv instanceof jQuery) ? tdDiv : $(tdDiv),
						div_w = $div.outerWidth(),
						span_w = 0;
					
					$('body').children(':first').before($span);
					$span.html($div.html());
					$span.css('font-size', '' + $div.css('font-size'));
					$span.css('padding-left', '' + $div.css('padding-left'));
					span_w = $span.innerWidth();
					$span.remove();
					
					if(span_w > div_w) {
						$div.attr('title', $div.text());
					} else {
						$div.removeAttr('title');
					}
				}
			},
			autoResize:function(){
				$('div', g.cDrag).each(function () {
					g.autoResizeColumn(this);
				});
			},
			autoResizeColumn: function (obj) {
				if(!p.dblClickResize) {
					return;
				}
				var n = $('div', this.cDrag).index(obj),
					$th = $('th:visible div:eq(' + n + ')', this.hDiv),
					ol = parseInt(obj.style.left),
					ow = $th.width(),
					nw = 0,
					nl = 0,
					$span = $('<span />');
				$('body').children(':first').before($span);
				$span.html($th.html());
				$span.css('font-size', '' + $th.css('font-size'));
				$span.css('padding-left', '' + $th.css('padding-left'));
				$span.css('padding-right', '' + $th.css('padding-right'));
				nw = $span.width();
				$('tr', this.bDiv).each(function () {
					var $tdDiv = $('td:visible div:eq(' + n + ')', this),
						spanW = 0;
					$span.html($tdDiv.html());
					$span.css('font-size', '' + $tdDiv.css('font-size'));
					$span.css('padding-left', '' + $tdDiv.css('padding-left'));
					$span.css('padding-right', '' + $tdDiv.css('padding-right'));
					spanW = $span.width();
					nw = (spanW > nw) ? spanW : nw;
				});
				$span.remove();
				nw = (p.minWidth > nw) ? p.minWidth : nw;
				nl = ol + (nw - ow);
				$('div:eq(' + n + ')', this.cDrag).css('left', nl);
				this.colresize = {
					nw: nw,
					n: n
				};
				g.dragEnd();
			},
			pager: 0
		};
		if (p.colModel) { //create model if any
			thead = document.createElement('thead');
			var tr = document.createElement('tr');
			for (var i = 0; i < p.colModel.length; i++) {
				var cm = p.colModel[i];
				var th = document.createElement('th');
				$(th).attr('axis', 'col' + i);
				if( cm ) {	// only use cm if its defined
					var cookie_width = 'flexiwidths/'+cm.name;		// Re-Store the widths in the cookies
					if( $.cookie(cookie_width) != undefined ) {
						cm.width = $.cookie(cookie_width);
					}
					if( cm.display != undefined ) {
						th.innerHTML = cm.display;
					}
					if (cm.name && cm.sortable) {
						$(th).attr('abbr', cm.name);
					}
					if (cm.align) {
						th.align ='center';
						th.divAlign=cm.align;
					}
					if (cm.width) {
						$(th).attr('width', cm.width);
					}
					if ($(cm).attr('hide')) {
						th.hidden = true;
					}
					if (cm.process) {
						th.process = cm.process;
					}
					if (cm.editable) {
						$(th).attr('editable', true);
					}
					if (cm.dropdown) {
						th.dropdown = cm.dropdown;
					}
					if (cm.validate) {
						th.validate = {rule:cm.validate, title:cm.validateMsg};
					}
				} else {
					th.innerHTML = "";
					$(th).attr('width',30);
				}
				$(tr).append(th);
			}
			$(thead).append(tr);
			$(t).prepend(thead);
		} // end if p.colmodel
		//init divs
		g.gDiv = document.createElement('div'); //create global container
		//暂时注释掉mDiv
		//g.mDiv = document.createElement('div'); //create title container
		g.hDiv = document.createElement('div'); //create header container
		g.bDiv = document.createElement('div'); //create body container
		g.vDiv = document.createElement('div'); //create grip
		g.rDiv = document.createElement('div'); //create horizontal resizer
		g.cDrag = document.createElement('div'); //create column drag
		g.block = document.createElement('div'); //creat blocker
		g.nDiv = document.createElement('div'); //create column show/hide popup
		g.nBtn = document.createElement('div'); //create column show/hide button
		g.iDiv = document.createElement('div'); //create editable layer
		g.tDiv = document.createElement('div'); //create toolbar
		g.sDiv = document.createElement('div');
		g.pDiv = document.createElement('div'); //create pager container
		if (!p.usepager) {
			g.pDiv.style.display = 'none';
		}
		g.hTable = document.createElement('table');
		g.gDiv.className = 'flexigrid';
		if (p.width != 'auto') {
			g.gDiv.style.width = p.width + 'px';
		}
		//add conditional classes
		if ($.browser.msie) {
			$(g.gDiv).addClass('ie');
		}
		if (p.novstripe) {
			$(g.gDiv).addClass('novstripe');
		}
		$(t).before(g.gDiv);
		$(g.gDiv).append(t);
		//set toolbar
		if (p.buttons) {
			g.tDiv.className = 'tDiv';
			var tDiv2 = document.createElement('div');
			tDiv2.className = 'tDiv2';
			
			for (var i = 0; i < p.buttons.length; i++) {
				var btn = p.buttons[i];
				if (!btn.separator) {
					var btnDiv = document.createElement('div');
					btnDiv.className = 'fbutton';
					btnDiv.innerHTML = ("<div><span>") + (btn.hidename ? "&nbsp;" : btn.name) + ("</span></div>");
					//更多操作按钮列表
					if(btn.more){
					$("#morelist").remove();
					var moreDiv = document.createElement('div');//更多按钮列表 
						moreDiv.id='morelist';
					for (var j = 0; j < btn.more.length; j++) {
						
						var bDiv = document.createElement('div');
						bDiv.className = 'fbutton';
						bDiv.innerHTML = ("<div><span>") + (btn.more[j].hidename ? "&nbsp;" : btn.more[j].name) + ("</span></div>");
						$('span', bDiv).addClass(btn.more[j].bclass).css({paddingLeft: 20});
						if (btn.more[j].tooltip){ // add title if exists (RS)
						$('span',bDiv)[0].title = btn.more[j].tooltip;}
						bDiv.onpress = btn.more[j].onpress;
						if (btn.more[j].onpress) {
							$(bDiv).click(function () {
								this.onpress(this.id || this.name, g.gDiv);
							});
						}
						$(moreDiv).append(bDiv);
						
						$('body').append(moreDiv);
						}
					}
					if (btn.bclass) $('span', btnDiv).addClass(btn.bclass).css({
						paddingLeft: 20
					});
					if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
						$('span',btnDiv).css( 'background', 'url('+btn.bimage+') no-repeat center left' );
						$('span',btnDiv).css( 'paddingLeft', 20 );
						
					if (btn.tooltip) // add title if exists (RS)
						$('span',btnDiv)[0].title = btn.tooltip;
						
					btnDiv.onpress = btn.onpress;
					btnDiv.name = btn.name;
					if (btn.id) {
						btnDiv.id = btn.id;
					}
					if(btn.disable)
					{
						$('span', btnDiv).die().css({color:'#FFF'});
						
					}else{
					
						if (btn.onpress) {
							$(btnDiv).click(function () {
								this.onpress(this.id || this.name, g.gDiv);
							});
						}
						if ($.browser.msie && $.browser.version < 7.0) {
							$(btnDiv).hover(function () {
								$(this).addClass('fbOver');
							}, function () {
								$(this).removeClass('fbOver');
							});
						}
					
					}
					$(tDiv2).append(btnDiv);
				} else {
					$(tDiv2).append("<div class='btnseparator'></div>");
				}
			}
			$(g.tDiv).append(tDiv2);
			$(g.tDiv).append("<div style='clear:both'></div>");
			$(g.gDiv).prepend(g.tDiv);
		}
		g.hDiv.className = 'hDiv';
		
		// Define a combo button set with custom action'ed calls when clicked.
		if( p.combobuttons && $(g.tDiv2) )
		{
			var btnDiv = document.createElement('div');
			btnDiv.className = 'fbutton';
			
			var tSelect = document.createElement('select');
			$(tSelect).change( function () { g.combo_doSelectAction( tSelect ) } );
			$(tSelect).click( function () { g.combo_resetIndex( tSelect) } );
			tSelect.className = 'cselect';
			$(btnDiv).append(tSelect);
			
			for (i=0;i<p.combobuttons.length;i++)
			{
				var btn = p.combobuttons[i];
				if (!btn.separator)
				{
					var btnOpt = document.createElement('option');
					btnOpt.innerHTML = btn.name;
					
					if (btn.bclass) 
						$(btnOpt)
						.addClass(btn.bclass)
						.css({paddingLeft:20})
						;
					if (btn.bimage)  // if bimage defined, use its string as an image url for this buttons style (RS)
						$(btnOpt).css( 'background', 'url('+btn.bimage+') no-repeat center left' );
						$(btnOpt).css( 'paddingLeft', 20 );
						
					if (btn.tooltip) // add title if exists (RS)
						$(btnOpt)[0].title = btn.tooltip;
						
					if (btn.onpress)
					{
						btnOpt.value = btn.onpress;
					}
					$(tSelect).append(btnOpt);
				} 
			}
			$('.tDiv2').append(btnDiv);
		}
		//右键菜单		
		if(p.itemMenus){
			var menuDiv = document.createElement('div');//右键菜单列表 
				menuDiv.id='menulist';
			for (var i = 0; i < p.itemMenus.length; i++) {
				var menu = p.itemMenus[i];
				var bDiv = document.createElement('div');
						bDiv.className = 'fbutton';
						bDiv.innerHTML = ("<div><span>") + (menu.hidename ? "&nbsp;" : menu.name) + ("</span></div>");
						$('span', bDiv).addClass(menu.bclass).css({paddingLeft: 15});
						if (menu.tooltip){ // add title if exists (RS
							$('span',bDiv)[0].title = menu.tooltip;
						}
						bDiv.onpress = menu.onpress;
						if (menu.onpress) {
							$(bDiv).click(function () {
								this.onpress(this.id || this.name, g.gDiv);
							});
						}
						$(menuDiv).append(bDiv);
						$('.flexigrid').append(menuDiv);
						if ($.browser.msie && $.browser.version < 7.0) {
							$(bDiv).hover(function () {
								$(this).addClass('fbOver');
							}, function () {
								$(this).removeClass('fbOver');
							});
						}
			}
				
		}
		
		$(t).before(g.hDiv);
		g.hTable.cellPadding = 0;
		g.hTable.cellSpacing = 0;
		$(g.hDiv).append('<div class="hDivBox"></div>');
		$('div', g.hDiv).append(g.hTable);
		var thead = $("thead:first", t).get(0);
		if (thead) $(g.hTable).append(thead);
		thead = null;
		if (!p.colmodel) var ci = 0;
		$('thead tr:first th', g.hDiv).each(function () {
			var thdiv = document.createElement('div');
			if ($(this).attr('abbr')) {
				$(this).click(function (e) {
					if (!$(this).hasClass('thOver')) return false;
					var obj = (e.target || e.srcElement);
					if (obj.href || obj.type) return true;
					g.changeSort(this);
				});
				if ($(this).attr('abbr') == p.sortname) {
					this.className = 'sorted';
					thdiv.className = 's' + p.sortorder;
				}
			}
			if (this.hidden) {
				$(this).hide();
			}
			if (!p.colmodel) {
				$(this).attr('axis', 'col' + ci++);
			}
			$(thdiv).css({
				textAlign: this.align,
				width: this.width + 'px'
			});
			thdiv.innerHTML = this.innerHTML;
			$(this).empty().append(thdiv).removeAttr('width').mousedown(function (e) {
				g.dragStart('colMove', e, this);
			}).hover(function () {
				if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy) {
					$(this).addClass('thOver');
				}
				if ($(this).attr('abbr') != p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					$('div', this).addClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).removeClass('s' + p.sortorder).addClass('s' + no);
				}
				if (g.colCopy) {
					var n = $('th', g.hDiv).index(this);
					if (n == g.dcoln) {
						return false;
					}
					if (n < g.dcoln) {
						$(this).append(g.cdropleft);
					} else {
						$(this).append(g.cdropright);
					}
					g.dcolt = n;
				} else if (!g.colresize) {
					var nv = $('th:visible', g.hDiv).index(this);
					var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'));
					var nw = jQuery(g.nBtn).outerWidth();
					var nl = onl - nw + Math.floor(p.cgwidth / 2);
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					//判断如果在th中存在checkbox不显示nBtn按钮（此按钮用来设置显示列）
					if($('input',$(this)).length==0){
						$(g.nBtn).css({
							'left': nl,
							top: g.hDiv.offsetTop
						}).show();
					}
					var ndw = parseInt($(g.nDiv).width());
					$(g.nDiv).css({
						top: g.bDiv.offsetTop
					});
					if ((nl + ndw) > $(g.gDiv).width()) {
						$(g.nDiv).css('left', onl - ndw + 1);
					} else {
						$(g.nDiv).css('left', nl);
					}
					if ($(this).hasClass('sorted')) {
						$(g.nBtn).addClass('srtd');
					} else {
						$(g.nBtn).removeClass('srtd');
					}
				}
			}, function () {
				$(this).removeClass('thOver');
				if ($(this).attr('abbr') != p.sortname) {
					$('div', this).removeClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).addClass('s' + p.sortorder).removeClass('s' + no);
				}
				if (g.colCopy) {
					$(g.cdropleft).remove();
					$(g.cdropright).remove();
					g.dcolt = null;
				}
			}); //wrap content
		});
		//set bDiv
		g.bDiv.className = 'bDiv';
		$(t).before(g.bDiv);
		$(g.bDiv).css({
			height: (p.height == 'auto') ? 'auto' : p.height + "px"
		}).scroll(function (e) {
			g.scroll()
		}).append(t);
		if (p.height == 'auto') {
			$('table', g.bDiv).addClass('autoht');
		}
		//add td & row properties
		g.addCellProp();
		g.addRowProp();
		//set cDrag
		var cdcol = $('thead tr:first th:first', g.hDiv).get(0);
		if (cdcol != null) {
			g.cDrag.className = 'cDrag';
			g.cdpad = 0;
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'))) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'))) ? 0 : parseInt($('div', cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'))) ? 0 : parseInt($('div', cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'))) ? 0 : parseInt($('div', cdcol).css('paddingRight')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'))) ? 0 : parseInt($(cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'))) ? 0 : parseInt($(cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'))) ? 0 : parseInt($(cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'))) ? 0 : parseInt($(cdcol).css('paddingRight')));
			$(g.bDiv).before(g.cDrag);
			var cdheight = $(g.bDiv).height();
			var hdheight = $(g.hDiv).height();
			$(g.cDrag).css({
				top: -hdheight + 'px'
			});
			$('thead tr:first th', g.hDiv).each(function () {
				var cgDiv = document.createElement('div');
				$(g.cDrag).append(cgDiv);
				if (!p.cgwidth) {
					p.cgwidth = $(cgDiv).width();
				}
				$(cgDiv).css({
					height: cdheight + hdheight
				}).mousedown(function (e) {
					g.dragStart('colresize', e, this);
				}).dblclick(function(e){ 
					g.autoResizeColumn(this); 
				});
				if ($.browser.msie && $.browser.version < 7.0) {
					g.fixHeight($(g.gDiv).height());
					$(cgDiv).hover(function () {
						g.fixHeight();
						$(this).addClass('dragging')
					}, function () {
						if (!g.colresize) $(this).removeClass('dragging')
					});
				}
			});
		}
		//add strip
		if (p.striped) {
			$('tbody tr:odd', g.bDiv).addClass('erow');
		}
		if (p.resizable && p.height != 'auto') {
			g.vDiv.className = 'vGrip';
			$(g.vDiv).mousedown(function (e) {
				g.dragStart('vresize', e)
			}).html('<span></span>');
			$(g.bDiv).after(g.vDiv);
		}
		if (p.resizable && p.width != 'auto' && !p.nohresize) {
			g.rDiv.className = 'hGrip';
			$(g.rDiv).mousedown(function (e) {
				g.dragStart('vresize', e, true);
			}).html('<span></span>').css('height', $(g.gDiv).height());
			if ($.browser.msie && $.browser.version < 7.0) {
				$(g.rDiv).hover(function () {
					$(this).addClass('hgOver');
				}, function () {
					$(this).removeClass('hgOver');
				});
			}
			$(g.gDiv).append(g.rDiv);
		}
		// add pager
		if (p.usepager) {
			g.pDiv.className = 'pDiv';
			g.pDiv.innerHTML = '<div class="pDiv2"></div>';
			$(g.bDiv).after(g.pDiv);
			var html = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input type="text" size="4" value="1" /> ' + p.outof + ' <span> 1 </span> ' + p.itemtext + '</span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
			$('div', g.pDiv).html(html);
			$('.pReload', g.pDiv).click(function () {
				g.populate()
			});
			$('.pFirst', g.pDiv).click(function () {
				g.changePage('first')
			});
			$('.pPrev', g.pDiv).click(function () {
				g.changePage('prev')
			});
			$('.pNext', g.pDiv).click(function () {
				g.changePage('next')
			});
			$('.pLast', g.pDiv).click(function () {
				g.changePage('last')
			});
			$('.pcontrol input', g.pDiv).keydown(function (e) {
				if (e.keyCode == 13) g.changePage('input')
			});
			if ($.browser.msie && $.browser.version < 7) $('.pButton', g.pDiv).hover(function () {
				$(this).addClass('pBtnOver');
			}, function () {
				$(this).removeClass('pBtnOver');
			});
			if (p.useRp) {
				var opt = '',
					sel = '';
				for (var nx = 0; nx < p.rpOptions.length; nx++) {
					if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"';
					else sel = '';
					opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
				}
				$('.pReload', g.pDiv).before("<div class='pGroup'><select name='rp'>" + opt + "</select></div> <div class='btnseparator'></div>");
				//$('.pDiv2', g.pDiv).prepend("<div class='pGroup'><select name='rp'>" + opt + "</select></div> <div class='btnseparator'></div>");
				$('select', g.pDiv).change(function () {
					if (p.onRpChange) {
						p.onRpChange(+this.value);
					} else {
						p.newp = 1;
						p.rp = +this.value;
						g.populate();
					}
				});
			}
			//add search button
			if (p.searchitems) {
				$('.pDiv2', g.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
				$('.pSearch', g.pDiv).click(function () {
					$(g.sDiv).slideToggle('fast', function () {
						$('.sDiv:visible input:first', g.gDiv).trigger('focus');
					});
				});
				//add search box
				g.sDiv.className = 'sDiv';
				var sitems = p.searchitems;
				var sopt = '', sel = '';
				for (var s = 0; s < sitems.length; s++) {
					if (p.qtype == '' && sitems[s].isdefault == true) {
						p.qtype = sitems[s].name;
						sel = 'selected="selected"';
					} else {
						sel = '';
					}
					sopt += "<option value='" + sitems[s].name + "' " + sel + " >" + sitems[s].display + "&nbsp;&nbsp;</option>";
				}
				if (p.qtype == '') {
					p.qtype = sitems[0].name;
				}
				$(g.sDiv).append("<div class='sDiv2'>" + p.findtext + 
						" <input type='text' value='" + p.query +"' size='30' name='q' class='qsbox' /> "+
						" <select name='qtype'>" + sopt + "</select></div>");
				//Split into separate selectors because of bug in jQuery 1.3.2
				$('input[name=q]', g.sDiv).keydown(function (e) {
					if (e.keyCode == 13) {
						g.doSearch();
					}
				});
				$('select[name=qtype]', g.sDiv).keydown(function (e) {
					if (e.keyCode == 13) {
						g.doSearch();
					}
				});
				$('input[value=Clear]', g.sDiv).click(function () {
					$('input[name=q]', g.sDiv).val('');
					p.query = '';
					g.doSearch();
				});
				$(g.bDiv).after(g.sDiv);
			}
		}
		$(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");
		// add title
		if (p.title) {
			//g.mDiv.className = 'mDiv';
			//g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
			//$(g.gDiv).prepend(g.mDiv);
			if (p.showTableToggleBtn) {
				//$(g.mDiv).append('<div class="ptogtitle" title="最小化/最大化 "><span></span></div>');
				//$('div.ptogtitle', g.mDiv).click(function () {
					//if(p.showBtnClick){
						//p.showBtnClick(g.gDiv,this);
					//}else{
						//$(g.gDiv).toggleClass('hideBody');
						//$(this).toggleClass('vsble');
					//}
				//});
				
			}
		}
		//setup cdrops
		g.cdropleft = document.createElement('span');
		g.cdropleft.className = 'cdropleft';
		g.cdropright = document.createElement('span');
		g.cdropright.className = 'cdropright';
		//add block
		g.block.className = 'gBlock';
		var gh = $(g.bDiv).height();
		var gtop = g.bDiv.offsetTop;
		$(g.block).css({
			width: g.bDiv.style.width,
			height: gh,
			background: 'white',
			position: 'relative',
			marginBottom: (gh * -1),
			zIndex: 1,
			top: gtop,
			left: '0px'
		});
		$(g.block).fadeTo(0, p.blockOpacity);
		// add column control
		if ($('th', g.hDiv).length) {
			g.nDiv.className = 'nDiv';
			g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			$(g.nDiv).css({
				marginBottom: (gh * -1),
				display: 'none',
				top: gtop
			}).noSelect();
			var cn = 0;
			$('th div', g.hDiv).each(function () {
				/** xiaoxiong 20140729 将序号、空字段与复选框从字段是否显示列表中去掉 **/
				if('序号' == this.innerHTML || '' == this.innerHTML || this.innerHTML.indexOf("checkbox")>-1 ){
				} else {
					var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
					var chk = 'checked="checked"';
					if (kcol.style.display == 'none') {
						chk = '';
					}
					$('tbody', g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
				}
				cn++;
			});
			if ($.browser.msie && $.browser.version < 7.0) $('tr', g.nDiv).hover(function () {
				$(this).addClass('ndcolover');
			}, function () {
				$(this).removeClass('ndcolover');
			});
			$('td.ndcol2', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
				return g.toggleCol($(this).prev().find('input').val());
			});
			$('input.togCol', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked == false) return false;
				$(this).parent().next().trigger('click');
			});
			$(g.gDiv).prepend(g.nDiv);
			$(g.nBtn).addClass('nBtn')
				.html('<div></div>')
				.attr('title', '隐藏/显示  列')
				.click(function () {
					$(g.nDiv).toggle();
					return true;
				}
			);
			if (p.showToggleBtn) {
				$(g.gDiv).prepend(g.nBtn);
			}
		}
		// add date edit layer
		$(g.iDiv).addClass('iDiv').css({
			display: 'none'
		});
		$(g.bDiv).append(g.iDiv);
		// add flexigrid events
		$(g.bDiv).hover(function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		}, function () {
			if (g.multisel) {
				g.multisel = false;
			}
		});
		$(g.gDiv).hover(function () {}, function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		});
		//add document events
		$(document).mousemove(function (e) {
			g.dragMove(e)
		}).mouseup(function (e) {
			g.dragEnd()
		}).hover(function () {}, function () {
			g.dragEnd()
		});
		//browser adjustments
		if ($.browser.msie && $.browser.version < 7.0) {
			$('.hDiv,.bDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
				width: '100%'
			});
			$(g.gDiv).addClass('ie6');
			if (p.width != 'auto') {
				$(g.gDiv).addClass('ie6fullwidthbug');
			}
		}
		g.rePosDrag();
		g.fixHeight();
		//make grid functions accessible
		t.p = p;
		t.grid = g;
		// load data
		if (p.url && p.autoload) {
			g.populate();
		}
		return t;
	};
	var docloaded = false;
	$(document).ready(function () {
		docloaded = true
	});
	$.fn.flexigrid = function (p) {
		return this.each(function () {
			if (!docloaded) {
				$(this).hide();
				var t = this;
				$(document).ready(function () {
					$.addFlex(t, p);
					
				});
			} else {
				$.addFlex(this, p);
			}
		});
	}; //end flexigrid
	$.fn.flexReload = function (p) { // function to reload grid
		return this.each(function () {
			if (this.grid && this.p.url) this.grid.populate();
		});
	}; //end flexReload
	$.fn.flexOptions = function (p) { //function to update general options
		return this.each(function () {
			if (this.grid) $.extend(this.p, p);
		});
	}; //end flexOptions
	$.fn.flexToggleCol = function (cid, visible) { // function to reload grid
		return this.each(function () {
			if (this.grid) this.grid.toggleCol(cid, visible);
		});
	}; //end flexToggleCol
	$.fn.flexAddData = function (data) { // function to add data to grid
		return this.each(function () {
			if (this.grid) this.grid.addData(data);
		});
	};
	$.fn.noSelect = function (p) { //no select plugin by me :-)
		var prevent = (p == null) ? true : p;
		if (prevent) {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function () {
					return false;
				});
				else if ($.browser.mozilla) {
					$(this).css('MozUserSelect', 'none');
					$('body').trigger('focus');
				} else if ($.browser.opera) $(this).bind('mousedown', function () {
					return false;
				});
				else $(this).attr('unselectable', 'on');
			});
		} else {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
				else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
				else if ($.browser.opera) $(this).unbind('mousedown');
				else $(this).removeAttr('unselectable', 'on');
			});
		}
	}; //end noSelect
  $.fn.flexSearch = function(p) { // function to search grid
    return this.each( function() { if (this.grid&&this.p.searchitems) this.grid.doSearch(); });
  }; //end flexSearch
  $.fn.flexExtendData = function(data){ // 添加一行数据
  	return this.each(function(){
  		if (this.grid) this.grid.extendData(data);
  	});
  };// 
  $.fn.autoResizeColumn = function () { //function to update general options
	  return this.each(function(){
	  		if (this.grid) this.grid.autoResize();
	  	});
	}; 
  $.fn.flexGetColumnValue = function(trObj,searchValue){//获取单行字段值
	 var val='';
	 this.each(function(i){
		  if (this.grid && this.p.colModel.length>0){
			 val+=this.grid.getColumnValue(trObj,searchValue,this.p.colModel);
		  }
	  });
	  return val;
  };
  //获取字段名称
  $.fn.flexGetColumnName = function(searchValue){
  	 var val='';
	 this.each(function(i){
		  if (this.grid && this.p.colModel.length>0){
			 val+=this.grid.getColumnName(searchValue,this.p.colModel);
		  }
	  });
	  return val;
  };
  //获取列的中文名称
  $.fn.flexGetColumnDisplay = function(searchValue){
	  var val='';
	  this.each(function(i){
		  if (this.grid && this.p.colModel.length>0){
			  val+=this.grid.getColumnDisplay(searchValue,this.p.colModel);
		  }
	  });
	  return val;
  };
})(jQuery);