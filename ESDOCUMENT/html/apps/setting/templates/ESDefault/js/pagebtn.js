var _pageBtn = {

	click: function (page){
		var that = this;
		var ulObj = $('#papernavigation');
		var liObj = ulObj.children();
		var liLeng = liObj.length;
		
		if(_global.page == page){ // id='null' || 当前单击页码和前一次页码相同不向后台请求数据
		
			return false;
		
		}else{ // start else 0
			var isBreak = false; // 标识
			_global.page = Number(page); // init
				
			_opens.lists(); // 调用列表******
			
			if(_global.total <= 10){ // 总页数最多不超过10页
			
				var btnHtm = [];
					for(var p = 1; p <= liLeng; p++){
					
						btnHtm.push("<li><a href='javascript:void(0)' id='"+ p +"'>"+ p +"</a></li>");
					
					}
					
				ulObj.innerHTML = btnHtm.join('');
				isBreak = true;
				
			}else{ // start else 1
					
					if(_global.page == 1){ // 第一页
					
						//if(liLeng == 10){ // 正常
						
							var btnHtm = ["<li><a href='javascript:void(0)' class='pagenow' id='1'>1</a></li>"];
							for(var p =2; p < liLeng-1; p++){
								
								btnHtm.push("<li><a href='javascript:void(0)' id='"+ p +"'>"+ p +"</a></li>");
								
							}
							btnHtm.push("<li class='dotted'><span id='null'>...</span></li>","<li><a href='javascript:void(0)' id='"+ _global.total +"'>"+ _global.total +"</a></li>");
							
						ulObj.innerHTML = btnHtm.join('');
						isBreak = true;
					}else if(_global.page == _global.total){ // 最后一页
						
							var btnHtm = ["<li><a href='javascript:void(0)' id='1'>1</a></li>","<li class='dotted'><span id='null'>...</span></li>"];
							var startp = _global.total - 7,newLeng = startp+liLeng;
							for(var p = startp; p < newLeng-2; p++){ // startp=8,liLeng=
								
								btnHtm.push("<li><a href='javascript:void(0)' id='"+ p +"'>"+ p +"</a></li>");
								
							}
							
						ulObj.innerHTML = btnHtm.join('');
						isBreak = true;
					}
			
			} // start else 1
			
			// 重新给以上if语句执行后a标签绑定事件
			for(var li = 0; li < liLeng; li++){
				// css style init
				liObj[li].children[0].id == _global.page ? liObj[li].children[0].className = 'pagenow' : liObj[li].children[0].className = '';
				if(isBreak){
					
					if(liObj[li].children[0].id === 'null') continue;
					
					liObj[li].children[0].onclick = function (){
						
						that.click(this.id);
						
					};
				}
			}
			
			if(isBreak) return;
			
			var medium = Number(document.getElementById('papernavigation').children[4].children[0].id)+0.5;
			if(_global.page < medium){ // 向前
			
				/*
				 * .dotted 被替换成页码则不再让脚本执行节点创建动作
				 * 当页码没有标准那么多不足10个该判断可用(liLeng < 10)
				 * 根据第二个li.a.id=='null'
				 */
				if(ulObj.children[1].children[0].id != 'null' || liLeng < 10) return;
				
				// 不存在添加 '...' a标签
				if(ulObj.children[ulObj.children.length-2].children[0].id != 'null'){
					ulObj.removeChild(ulObj.children[8]);
					_dom.dottedli('papernavigation', 8);
					
				}
			
				ulObj.removeChild(ulObj.children[7]);
				
				var insertpage = Number(liObj[2].children[0].id);
				
				_dom.defaultli('papernavigation', 2, insertpage - 1);
				
				if(insertpage - 3 != 1) return;
				ulObj.removeChild(ulObj.children[1]);
				_dom.defaultli('papernavigation', 1, insertpage - 2);
			
			}else{ // 向后
							
				/*
				 * .dotted 被替换成页码则不再让脚本执行节点创建动作
				 * 当页码没有标准那么多不足10个该判断可用
				 * 根据倒数第二个li.a.id=='null'
				 */
				if(ulObj.children[ulObj.children.length-2].children[0].id != 'null' || liLeng < 10) return;
				
				if(liObj[1].children[0].id != 'null'){
				
					ulObj.removeChild(ulObj.children[1]);
					_dom.dottedli('papernavigation', 1);
				}
				
				
				ulObj.removeChild(ulObj.children[2]);
				
				var insertpage = Number(ulObj.children[6].children[0].id);
				_dom.defaultli('papernavigation', 7, insertpage + 1);
								
				if(insertpage+3 != _global.total) return; // 当前页码+3为总页码时
				ulObj.removeChild(ulObj.children[8]);
				_dom.defaultli('papernavigation', 8, insertpage + 2);
				
			}
			
		
		}  // end else 0

	},
	bind: function (){ // 绑定
		var that_ = this;
		var liObj =$('#papernavigation').children();
		var liLeng = liObj.length;
		_global.total = Number(liObj[liLeng-1].children[0].id);
		
		for(var li = 0; li<liLeng; li++){
			
			liObj[li].children[0].id == _global.page ? liObj[li].children[0].className = 'pagenow' : liObj[li].children[0].className = '';
			
			if(liObj[li].children[0].id === 'null') continue;
			
			liObj[li].children[0].onclick = function (){
				
				that_.click(this.id);
				
			}

		}
	
	}

};

var _dom = {

	dottedli: function (parent, i){ // 父节点,下标
	
		var parent = document.getElementById(parent);
		var text = document.createTextNode('...');
		var span = document.createElement('span');
			span.setAttribute('id', 'null');
			span.appendChild(text);
		var li = document.createElement('li');
			//li.setAttribute('class', 'dotted'); // ie6不支持 :-(
			li.className = 'dotted';
			li.appendChild(span);
			parent.insertBefore(li, parent.children[i]);
			
	},
	defaultli: function (parent, i, page){ // 父节点,下标,页码
	
		var parent = document.getElementById(parent);
		var text = document.createTextNode(page);
		var a = document.createElement('a');
			a.setAttribute('id', page);
			a.setAttribute('href', 'javascript:void(0)');
			a.appendChild(text);
		var li = document.createElement('li');
			li.appendChild(a);
			parent.insertBefore(li, parent.children[i]);
			a.onclick = function (){
			
				_pageBtn.click(this.id);
			
			};
	}
};