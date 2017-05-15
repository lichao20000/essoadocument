$.fn.placeholder = function(){
	var searchText = this;
	var searchValue = searchText.attr('placeholder');
	if( searchText.length > 0 ){
		if ( !( 'placeholder' in document.createElement('input') ) ){
			if($('#NY_searchall').attr('id')=='NY_searchall' ) {
				searchText.css('color','#000000');
			} else {
				searchText.css('color','#A9A9A9');
			}
			searchText.val(searchValue).bind('focus',function(){
				searchText.css('color','#000000');
				if ( this.value==searchValue) {this.value=''; };
			}).bind('blur',function(){
				if ( $.trim(this.value)=='' ){searchText.css('color','#A9A9A9'); this.value=searchValue; };
			});
		}
	}
}
;(function (){

_globle={
	docClass:''
};
// 檔案車
_car = {
	show: function (){ // 顯示
		this.style.backgroundColor = '#fff';
		document.getElementById('product_list').style.display = 'block';
	},
	hide: function (){ // 隱藏
		this.style.backgroundColor = '#f5f5f5';
		document.getElementById('product_list').style.display = 'none';
	}
};

// 普通檢索及高級檢索的核心方法
_query = {
		first: 1,
		validate: function (){
			var searchWord = document.getElementById('searchWord');
				if(!searchWord.value || $('#searchWord').val()==$('#searchWord').attr('placeholder')){
	
					var times = 0;
					function exec(){
						if(times++%2===0){
							searchWord.style.background = '#faa';
						}else{
							searchWord.style.background = '#fff';
						}
					}
					for(var i=0; i<4; i++)
					{
						setTimeout(exec, i*100);
						
					}
					searchWord.setAttribute('title','此处关键字不能为空！');
					return false;	
				}
	
				return true;
		},
		validateRetrieve:function(){
			if(document.getElementById('metadata')){
				if(document.getElementById('unallowabledigitNum')){
					return false;
				}
			}
			return true;
		},
		retrieveQuery: function (){
			postData = {};
			var searchedWord=$.trim($('#searchWord').val())==$('#searchWord').attr('placeholder') ? '' : $('#searchWord').val();
				if(document.getElementById('intr_form')){
					if(!this.validateRetrieve()){
						return;
					}
					// 高級檢索的參數傳遞
					var formData = $('#intr_form').serializeArray(),
						leng = formData.length,
						archiveYear = {}; // 自定义归档年度数组
						var tempArray=[];
						var msiteArray=[];
						var metafieldArray=[];
						for(var i=0; i<leng; i++) // 将JQUERY序列化的数据组装新的格式[{name: 'searchWord', value:'000'}...] ==> {name: 'searchWord', value:'000'}
						{
							var name = formData[i].name;
							if(name === 'archiveYearStart' || name === 'archiveYearEnd'){
							
								archiveYear[name] = formData[i].value;
								
							}/*else if(name.indexOf('archiveClass') > -1){
							
								postData['archiveClass'] = formData[i].value;
								
							}*/else if(name.indexOf('metafield') > -1){
								
								metafieldArray.push(name.replace(/metafield,/, '')+'|'+formData[i].value);
								
							}else if(name.indexOf('retentionPeriod') > -1){

								tempArray.push(formData[i].value);
								
							}else if(name.indexOf('searchWord') > -1){
							
								postData['searchWord'] = $.trim(formData[i].value)==$('#searchWord').attr('placeholder') ? '' : $('#searchWord').val();
								
							}
						}
						//获取选中的档案类型
						postData['archiveClass']=_globle.docClass;
						
						////queryType：按案卷级显示 字符串1表示是 0表示否
						postData['queryType']='1';
						if(document.getElementById('fileLev')){
							var fileLevEle=document.getElementById('fileLev');
							var fileLevelEle=fileLevEle.getElementsByTagName('input');
							if(fileLevelEle[0].checked){
								postData['queryType']='2';
							}
						}
						/*级联下拉框及所属文本框数据的处理
						  archiveOrgs：[] 每个元素由归档省份简码、地市机构ID、部门ID组成
						  （3个值以;分隔，无则以0代替）*/
						/*var cascaEle=document.getElementById('cascade');
						var cascaNodes=cascaEle.childNodes;
						for(var i=0;i<cascaNodes.length;i++){
							var proVal=cascaNodes[i].children[0].value;
							if(proVal!=0){
								var proValue=proVal.split('|');
								proVal=proValue[1];
							}
							var deptId='0';
							if(cascaNodes[i].children[2].children.length >= 2){
								//deptId=cascaNodes[i].children[2].children[1].value;
								deptId = $('#selectSection').nextAll('input').val() || 0;
							}
							msiteArray.push(proVal+';'+cascaNodes[i].children[1].value+';'+deptId);
						}*/
						var cascaNodes = $('#cascade').children();
						for(var i=0; i < cascaNodes.length; i++) {
							var proVal = $(cascaNodes[i]).find('select[name="province"]').val(),
								proVal = proVal.split('|')[1],proVal = proVal || 0;
							var cityVal = $(cascaNodes[i]).find('select[name="city"]').val() || 0;
							var deptId = $(cascaNodes[i]).find('input:hidden').val() || 0,deptId = deptId ? deptId : 0;
							msiteArray.push(proVal + ';'+ cityVal +';' + deptId);
						}
						
						
						/*组合数据的处理*/
						//retentionPeriod保管期限，多个中间以,分隔
						postData['retentionPeriod']=tempArray.join(',');
						//archiveOrgs归档省份mainSite、地市ID（value），多个地市中间以,分隔
						postData['OrgsOrgs']=msiteArray.join(',');
						//searchFields 元数据{"key":"value"} 
						postData['searchField']=metafieldArray.join(',');
						// 组合数据归档年度的处理【归档年度之间以','分割】
						if(archiveYear.archiveYearStart && !archiveYear.archiveYearEnd){
							postData.archiveYear = archiveYear.archiveYearStart+',null';
						}else if(!archiveYear.archiveYearStart && archiveYear.archiveYearEnd){
							postData.archiveYear = 'null,'+archiveYear.archiveYearEnd;
						}else if(!archiveYear.archiveYearStart && !archiveYear.archiveYearEnd){
							postData.archiveYear = 'null,'+'null';
						}else{
							postData.archiveYear = archiveYear.archiveYearStart+','+archiveYear.archiveYearEnd;
						}
						
				}else{ // 普通檢索的參數傳遞
					if(!this.validate()){
						return;
					}
					postData['archiveClass']=_globle.docClass;
					postData['issenior']='nosenior';
					postData.searchWord = $('#searchWord').val()==$('#searchWord').attr('placeholder') ? '' : $('#searchWord').val();
				}
				$.post($.appClient.generateUrl({ESArchiveSeache: "retrieveQuery"}, 'x'),{page:_page.page, limit:_page.limit,data:postData,first:_query.first},function (htm){
					if(htm){
						if(htm.indexOf('error')!=-1){
							$.dialog.notice({title : '3秒后自动关闭',icon : 'warning',content : htm.replace('error: ',''),time : 3});
							return false;
						}else if(htm=='null'){
							if(searchedWord){
								$('.so-result').html('<span style="font-size:15px;font-style:normal;">抱歉，没有找到与关键字 “<em style="color:#cc0000;font-style:normal;font-size:15px;"> '+searchedWord+' </em>” 相关的档案。</span>');
							}else{
								$('.so-result').html('<span style="font-size:15px;font-style:normal;">抱歉，没有找到符合条件的档案。</span>');
							}
							$('.pages').hide();
							return false;
						}else{
							var checked = $('input[name="fileLevel"]').attr('checked') || false;
							var html = '<div class="showButton"><a class="applyToArchivesCar" defaultValue="显示文件级" toggleValue="隐藏文件级" href="#" onclick="NY_toggle(this); return false;" style="float: right; width:66px;position: relative;top: -20px;">显示文件级</a></div>';
//							if(_query.first){
//								_query.first = 0;
								$('#so_result').html(htm);
								if(checked) {
									$('#so_result #result li a.applyToArchivesCar').after(html);
								}
								
								// 初始化數據開始
								if(document.getElementById('rePage')){
									_page.prevCache = document.getElementById('rePage').getElementsByTagName("a")[0];
//									_page.page = 1;
									_page.total=Math.ceil(Number(document.getElementById('total').innerHTML)/_page.limit);
									
									var currentPage=document.getElementById("page_"+_page.page);
									currentPage.className = 'focus';
									currentPage.disabled="disabled";
									currentPage.style.cursor="text";
									
									_page.prevNext();
								}
								// 初始化數據完畢
								return;
//							}else{
//								/** xiaoxiong 20140717 为了在翻页的时候显示耗时信息做了下面处理 **/
//								var splitNo = htm.indexOf("_") ;
//								elapsedTime = htm.substring(0, splitNo) ;
//								htm = htm.substring(splitNo+1, htm.length) ;
//								$('#result').html(htm);
//								$('.s_count span').html(elapsedTime);
//								if(checked) {									
//									$('#so_result #result li a.applyToArchivesCar').after(html);
//								}
//							}
						}
					}
				});
		},
		intricate: function (type){ // 高級檢索
			window.location.href = $.appClient.generateUrl({ESArchiveSeache: "intricate"});
		},
		base: function (type){ // 普通檢索
			window.location.href = $.appClient.generateUrl({ESArchiveSeache: "index"});
		}
};

// 查詢結果數據的分頁
_page = {
		page: 1, //当前页码
		total: 0,//总页数
		limit: 10, // 每次向后台取多少条
		prevCache: {}, //元素节点，前一个被单击的页码li，
		go: function (code){ // num = -1：上一页，1：下一页，不传值则是当前被点击页面
			if(!_page.page || !_page.total){
				return;
			}
			var reg=/^[1-9]\d*$/; // 验证是否为正整数
			var pageindex = $('#rePage ul').find('li a.focus').text();
			if(code === -1 && _page.page - 1 > 0){ // 上一页
				
				var nextGo=document.getElementById('nextGo');
				nextGo.disabled="";
				nextGo.style.cursor="";
				nextGo.style.border='1px solid #5656F2';
				nextGo.style.background="";
				
//				if(pageindex % 10 == 1) {				
//					$('#rePage ul li').hide();
//					$('#rePage ul li:lt('+(pageindex-1)+')').show();
//					$('#rePage ul li:lt('+(pageindex-11)+')').hide();
//				}
//				
//				if(reg.test((_page.page-1)/10)){
//					var range=((_page.page-1)/10-1)*460;
//					
//					document.getElementById("rePage").getElementsByTagName("ul")[0].style.left=(-range)+"px";
//				}
				_page.page = _page.page - 1;
				
				this.aftergo();
				
				if(_page.page==1){
					var prevGo=document.getElementById('prevGo');
					prevGo.disabled="disabled";
					prevGo.style.cursor="text";
					prevGo.style.border='1px solid gray';
					prevGo.style.background="#DFDFDF";
				}
//				$(window).scrollTop($('#result:first-child').offset().top-20);
				$(window).scrollTop(0);
			}else if(code === 1 && _page.page < _page.total){ // 下一页
				
				var prevGo=document.getElementById('prevGo');
				prevGo.disabled="";
				prevGo.style.cursor="";
				prevGo.style.border='1px solid #5656F2';
				prevGo.style.background="";
				
//				if(pageindex % 10 == 0) {		
//					$('#rePage ul li').hide();
//					var current = parseInt(pageindex)+10;
//					$('#rePage ul li:lt('+current+')').show();
//					$('#rePage ul li:lt('+pageindex+')').hide();
//				}
				
//				if(reg.test(_page.page/10)){
//					var range=(_page.page/10)*460;
//					
//					document.getElementById("rePage").getElementsByTagName("ul")[0].style.left=(-range)+"px";
//				}
				_page.page = _page.page + 1;
				
				this.aftergo();
				
				if(_page.page==_page.total){
					var nextGo=document.getElementById('nextGo');
					nextGo.disabled="disabled";
					nextGo.style.cursor="text";
					nextGo.style.border='1px solid gray';
					nextGo.style.background="#DFDFDF";
				}
//				$(window).scrollTop($('#result:first-child').offset().top-20);
				$(window).scrollTop(0);
			}						
		},
		aftergo:function(){
			//前一页页码的处理
			_page.prevCache.className = '';
			_page.prevCache.disabled='';
			_page.prevCache.style.cursor="pointer";
			
			//当前页页码的处理
//			var currentPage=document.getElementById("page_"+_page.page);
//			currentPage.className = 'focus';
//			currentPage.disabled="disabled";
//			currentPage.style.cursor="text";
//			//后续操作的处理
//			_page.prevCache = currentPage;
			_query.retrieveQuery();
			
		},
		prevNext:function(){
			var prevGo=document.getElementById('prevGo');
			var nextGo=document.getElementById('nextGo');
			var NY_top = $('#result:first-child').offset().top;
			
			if(_page.page==1 && _page.page==_page.total){
				prevGo.disabled="disabled";
				prevGo.style.cursor="text";
				prevGo.style.border='1px solid gray';
				prevGo.style.background="#DFDFDF";
				nextGo.disabled="disabled";
				nextGo.style.cursor="text";
				nextGo.style.border='1px solid gray';
				nextGo.style.background="#DFDFDF";
			}else if(_page.page==1 && _page.page!=_page.total){
				nextGo.disabled="";
				nextGo.style.cursor="";
				nextGo.style.border='1px solid #5656F2';
				nextGo.style.background="";
				prevGo.disabled="disabled";
				prevGo.style.cursor="text";
				prevGo.style.border='1px solid gray';
				prevGo.style.background="#DFDFDF";
			}else if(_page.page!=1 && _page.page==_page.total){
				prevGo.disabled="";
				prevGo.style.cursor="";
				prevGo.style.border='1px solid #5656F2';
				prevGo.style.background="";
				nextGo.disabled="disabled";
				nextGo.style.cursor="text";
				nextGo.style.border='1px solid gray';
				nextGo.style.background="#DFDFDF";
			}else if(_page.page!=1 && _page.page!=_page.total){
				prevGo.disabled="";
				prevGo.style.cursor="";
				prevGo.style.border='1px solid #5656F2';
				prevGo.style.background="";
				nextGo.disabled="";
				nextGo.style.cursor="";
				nextGo.style.border='1px solid #5656F2';
				nextGo.style.background="";
			}
//			$(window).scrollTop(NY_top-20);
			$(window).scrollTop(0);
		}	
};
// 换页[扩展，延伸应用]
$('#rePage a').live('click', function (){
	//前一页页码的处理
	_page.prevCache.className = '';
	_page.prevCache.disabled='';
	_page.prevCache.style.cursor="pointer";
	
	//当前页页码的处理
	this.className = 'focus';
	this.disabled='disabled';
	this.style.cursor="text";
	
	//后续操作的处理
	_page.prevCache = this;
	_page.page = Number(this.innerHTML);
	_page.prevNext();
	
	_query.retrieveQuery();
});
//添加所属单位及累加所属单位
_org = {
	orgId: '', // orgId
	orgName: '',
	getTree: function (io,cityOrgId,archiveClass){//orgInput
		var setting = {
				view: {
					showLine: false
				},
				async : {
					enable: true,
				    autoParam : ['id','archiveClass'],
				    url : $.appClient.generateUrl({ESArchiveSeache: "getErDeptList"}, 'x')
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onClick: function (e, treeId, treeNode){
						_org.orgId = treeNode.id;
						_org.orgName = treeNode.name;
						$('#selectSection').val(treeNode.name);
						if(!$('#selectSection').nextAll('input').is('input')) {
							$('#selectSection').after('<input name="deptId,'+treeNode.id+'" type="hidden" value="'+treeNode.id+'" />');
						} else {
							$('#selectSection').nextAll('input').val(treeNode.id).attr('name','deptId,'+treeNode.id);
						}
					},
					onAsyncSuccess: function(e, treeId, treeNode, msg) {					
						if(msg == '') {
							var id = treeNode.tId;
							$('#'+id).css('marginLeft','18px').children('span').remove();
							$('#'+id).children('a').children('span:first').attr('class','button ico_docu');
						}
					}
				}
			};

			$.getJSON(
				$.appClient.generateUrl({ESArchiveSeache: "getDeptList"}, 'x'),{orgId:cityOrgId,archiveClass:archiveClass},
				function (node){
					/*$.dialog({
						title: '选择机构',
						padding: 0,
						content: '<div class="org-list ztree" id="org_tree"></div>',
						cancel: true,
						cancelVal: '关闭',
						okVal: '确定',
						ok: function (){
							//创建包含隐藏域的INPUT，隐藏域中存放mSite和orgId
							var io_ = document.createElement('input');
								io_.type = 'hidden';
								io_.name = 'deptId,'+_org.orgId;
								io_.value = _org.orgId;
								
								io.value = _org.orgName;
								
								if(io.parentNode.children.length!=1){
									io.parentNode.removeChild(io.nextSibling);
								}
								//添加包含所需数据的隐藏域
								io.parentNode.appendChild(io_);
								_org.orgId = '';
								_org.orgName = '';
						}
					});*/
					$.fn.zTree.init($("#org_tree").show(), setting, node);
				}
			);
	},
	addRow: function (a){ // 添加一个机构选择域
		var p_ = a.parentNode;
		var pp_ = p_.parentNode;
		if(pp_.children.length === 1){
			var a_ = document.createElement('a');
				a_.className = 'del';
				a_.href = 'javascript:;';
				p_.replaceChild(a_, a);
		}else{
			p_.removeChild(a);
		}
		var div_= p_.cloneNode(true);
		var a_add=document.createElement('a');
			a_add.className = 'add';
			a_add.href = 'javascript:;';
			div_.appendChild(a_add);
			pp_.appendChild(div_);
		//新增一行时去除type为hidden的INPUT框
		var nextNode=pp_.children[pp_.children.length-1];
		if(nextNode.children[2].children.length==2){
			nextNode.children[2].children[0].value='';
			nextNode.children[2].removeChild(nextNode.children[2].children[1]);
		}
		//把第二个下拉框的对应的城市清除
		nextNode.children[1].length=1;
		
		
	},
	delRow: function (a){ // 删除一个机构选择域
		var p_ = a.parentNode;
		var pp_ = p_.parentNode;
		
			pp_.removeChild(p_);
			
		var ppl = pp_.children.length,lastNode = pp_.children[ppl-1];
			if(lastNode.children.length <5){
				var a_add=document.createElement('a');
					a_add.className = 'add';
					a_add.href = 'javascript:;';
					lastNode.appendChild(a_add);
			}
		
			if(ppl === 1){ // 如果是最后一个就要去掉可能出现的删除按钮，保留添加按钮即可
			
				pp_.children[0].removeChild(pp_.children[0].children[3]);
				
			}
		
	},
	changePro: function(pro){
		var proIndex=pro.selectedIndex;
		
		var proSelected=pro.options[proIndex].value;
		
		var proSelectedValue=proSelected.split('|');
		var proSelectedVal=proSelectedValue[0];
		
		
		//获得城市下拉框的对象
    	var sltCity=pro.parentNode.children[1];
    		
   		//清空城市下拉框，仅留提示选项
    	sltCity.length=1;
    	//清空机构文本框的内容及隐藏域
    	var DeptSpanEle=pro.parentNode.children[2];
    	if(proSelectedValue[1] == 'na') {
    		$(sltCity).attr('disabled','disabled');
    		$(DeptSpanEle.children[0]).attr('disabled','disabled');
    		$('a.add').hide().attr('class','add 1');
    		$('a.del').hide().attr('class','del 1');
    		
    		$('div.cascadeTwo').find('select,input.orgInput').attr('disabled','disabled');
    		$(pro).removeAttr('disabled');
    		
    	} else {
    		$(sltCity).removeAttr('disabled');
    		$(DeptSpanEle.children[0]).removeAttr('disabled');
       		$('a.add').attr('class','add');
    		$('a.del').attr('class','del'); 
    		$('div.cascadeTwo').find('select,input.orgInput').removeAttr('disabled');
    	}
    	if(DeptSpanEle.children.length==2){
    		DeptSpanEle.removeChild(DeptSpanEle.children[1]);
    	}
    	DeptSpanEle.children[0].value='';
    	
    	if(proSelectedVal!=0){
    		$.ajax({
				url:$.appClient.generateUrl({ESArchiveSeache: "getCityCompanyList"}, 'x'),
				type:'post',
				data:"id=" + proSelectedVal,
				success:function(result){
					var citResult=jQuery.parseJSON(result);
					
					if(citResult){
						//得到对应省份的城市数组
	        			var citLength=citResult.length;
	        			
						//将城市数组中的值填充到城市下拉框中
						if(citLength!=0){
							
						 	for(var i=0;i<citLength;i++){
								
								sltCity[i+1]=new Option(citResult[i].cityName,citResult[i].cityId);
		        				
							}
						}
					}
				},
				cache:false
			});
    	}
	},
	changeCit:function(cit){
		var citIndex=cit.selectedIndex;
		
		var citSelectedVal=cit.options[citIndex].value;
		
		//清空机构文本框的内容及隐藏域
		var citToSpanEle=cit.parentNode.children[2];
		if(citToSpanEle.children.length==2){
    		citToSpanEle.removeChild(citToSpanEle.children[1]);
    	}
    	citToSpanEle.children[0].value='';
	}
};

})(); // 闭包结束

//左侧导航
$(".leftnav li").click(function(){
	_query.first = 1;
	//页数重置为1
	_page.page=1;
	
	$(this).siblings().removeClass("param");
	$(this).addClass("param");
	var liType=$(this).attr('id');
	var docType=liType.substring(3);
	if(docType=='all'){
		_globle.docClass='';
	}else{
		_globle.docClass=docType;
	}
	
	_query.retrieveQuery();
	
});


//切换省分公司获取地级市
$("#province").live('change',function(){
	_org.changePro(this);
});
//切换市分公司时处理相关数据
$("#city").live('change',function(){
	_org.changeCit(this);
});
//liqiubo 20140730 重新处理此方法，修复bug276
function show_fileDetail(str){
	var content = $(str).attr("justdoit");
	var contentVal = '<div style=\'height:500px;overflow-y:auto;overflow-x:hidden;position:relative;padding:5px;\'>'+Base64.decode(content)+'</div>';
	$.dialog({
		title:'文本内容',
		width: '500px',
		height:'120px',
		padding:0,
		fixed:  false,
		autoOpen:true,
		fixPosition:true,
		resizable:false,
		modal:true,
		bgiframe:true,
		content:contentVal
	});
}
//查看电子文件
//function show_file(path){
//	var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path},'x');
//	$.ajax({
//		url:url,
//		cache:false,
//		success:function(data){
//			$.dialog({
//		    	title:'浏览电子文件',
//    			width: '960px',
//   	    	   	fixed: false,
//	    	    resize: false,
//	    	    padding: 0,
//	    	    top: '10px',
//		    	content:data
//		    });
//		}
//	});
//}
/** xiaoxiong 20140805 添加浏览权限参数viewRight **/
function show_file(path, viewRight){
	if(viewRight == "true"){
		addAttachData.show_file(path);
	}else{
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESArchiveSeache:'showPkg'},'x'),
		    data:{path:path},
		    success:function(data){
		    	$.dialog({
		    		id:'myFormModelShowPkgWin',
		    		title:'数据附件',
		    		width: '800px',
		    		height:'520px',
		    		padding:'0px',
		    		fixed:  false,
		    		autoOpen:true,
		    		fixPosition:true,
		    		resizable:false,
		    		modal:true,
		    		bgiframe:true,
		    		content:data
		    	});
	    	},
			cache:false
		});
	}
}
//返回的结果中查看当前信息的明细
$(".tapOpen h3 a").live('mouseover',function(){
	var off=$(this).offset();
	var par=this.parentNode.parentNode;
	var chis=par.childNodes;
	if(chis.length==2){
		var snippetEle=chis[1];
		snippetEle.style.display='block';
		$(snippetEle).offset({top:off.top+6,left:off.left+730});
	}
});
$(".tapOpen h3 a").live('mouseout',function(){
	var par=this.parentNode.parentNode;
	var chis=par.childNodes;
	if(chis.length==2){
		var snippetEle=chis[1];
		snippetEle.style.display='none';
	}
});


// 檔案車的顯示及隱藏事件
	$('#car').hover(function (){
		_car.show.call(this);
		// 档案车内的档案鼠标经过的事件
		$(".pl-ul li").hover(function(){
			$(this).css('background','#f5f5f5');
		},function(){
			$(this).css('background','white');
		});
		
	},function (){
		_car.hide.call(this);
	});

// 单击申请，处理数据的操作【將不重複的數據添加到檔案車】
function addToArchivesCar(movea){
	var ArchiveVal=(movea.id).split('|');
	var id=ArchiveVal[0];
	var title=ArchiveVal[1];
	var file_no=ArchiveVal[2];
	var delId=ArchiveVal[3];
	var ulObj=$("#product_list").get(0).getElementsByTagName("ul");
//		}
	$.ajax({
		url:$.appClient.generateUrl({ESArchiveSeache:'showSubmitData'},'x'),
		beforeSend:function(xhr) {},
        complete:function(){},
		type:'post',
		data:"id=" + id + "&title=" + title  + "&file_no=" + file_no + "&delId=" + delId,
		success:function(resData){
			if(resData.isOne){
				if(resData.success){
					if(ulObj.length==0){
						$("#product_list h2:first").remove();
						//liqiubo 20140929 修改显示的文字，修复bug 1270
						var contentCar="<h2 class='pl-hd'><b>申请数据清单</b></h2><ul class='pl-ul'><li id='"+id+"' class='thisli_"+delId+"'><span></span><div class='titlestyle'><a href='javascript:;'>"+title+"</a></div><div class='deletestyle'><a href='javascript:delFormArchivesCar(\""+id+"\",\""+delId+"\");'>删除</a></div></li></ul><div class='pl-hr'><a onclick='javascript:clearAllApply();'>清空</a></div><div class='pl-sb'><a href='javascript:submitArchivesCar();'>提交审批</a></div>";
						$("#product_list").append(contentCar);
					}else if(ulObj.length==1){
						//做判斷，判斷id是否存在！！！循環取到ID的集合，查看id是否已經存在
						var x=$(".pl-ul").get(0).getElementsByTagName("li");
						var y=[];
						for(var i=0;i<x.length;i++){
							y.push(x[i].id);
						}
						var idStr=y.join(',');
						//若檔案車里已經存在加入的檔案，直接return
						if(idStr.indexOf(id)!=-1){
							return;
						}
						var contentCar="<li id='"+id+"' class='thisli_"+delId+"'><span></span><div class='titlestyle'>"+title+"</div><div class='deletestyle'><a href='javascript:delFormArchivesCar(\""+id+"\",\""+delId+"\");'>删除</a></div></li>";
						$("#product_list ul").append(contentCar);
					}
					$.ajax({
						url:$.appClient.generateUrl({ESArchiveSeache:'addToArchivesCart'},'x'),
						beforeSend:function(xhr) {},
				        complete:function(){},
						type:'post',
						data:"id=" + id + "&title=" + title  + "&file_no=" + file_no + "&delId=" + delId,
						success:function(html){
							$(".so-st").html(html);
						},
						cache:false
					});
				}else{
					$.dialog.notice({content:resData.message,icon:'warning',time:3});
				}
			}else{
				if(!resData.success){
					$.dialog.notice({content:resData.message,icon:'warning',time:3});
				}
				if(resData.content!=null && resData.content != undefined){
					var ps = resData.content.split("||");
					for(var i=0;i<ps.length;i++){
						if(ulObj.length==0){
							$("#product_list h2:first").remove();
							//liqiubo 20140929 修改显示的文字，修复bug 1270
							var contentCar="<h2 class='pl-hd'><b>申请数据清单</b></h2><ul class='pl-ul'><li id='"+ps[i].split('??')[0]+"' class='thisli_"+delId+i+"'><span></span><div class='titlestyle'><a href='javascript:;'>"+ps[i].split('??')[1]+"</a></div><div class='deletestyle'><a href='javascript:delFormArchivesCar(\""+ps[i].split('??')[0]+"\",\""+delId+i+"\");'>删除</a></div></li></ul><div class='pl-hr'><a onclick='javascript:clearAllApply();'>清空</a></div><div class='pl-sb'><a href='javascript:submitArchivesCar();'>提交审批</a></div>";
							$("#product_list").append(contentCar);
						}else if(ulObj.length==1){
							//做判斷，判斷id是否存在！！！循環取到ID的集合，查看id是否已經存在
							var x=$(".pl-ul").get(0).getElementsByTagName("li");
							var y=[];
							for(var j=0;j<x.length;j++){
								y.push(x[j].id);
							}
							var idStr=y.join(',');
							//若檔案車里已經存在加入的檔案，直接return
							if(idStr.indexOf(id)==-1){
								var contentCar="<li id='"+ps[i].split('??')[0]+"' class='thisli_"+delId+i+"'><span></span><div class='titlestyle'>"+ps[i].split('??')[1]+"</div><div class='deletestyle'><a href='javascript:delFormArchivesCar(\""+ps[i].split('??')[0]+"\",\""+delId+i+"\");'>删除</a></div></li>";
								$("#product_list ul").append(contentCar);
							}
						}
					}
					$.ajax({
						url:$.appClient.generateUrl({ESArchiveSeache:'addToArchivesCart'},'x'),
						beforeSend:function(xhr) {},
				        complete:function(){},
						type:'post',
						data: {data:resData.content,delId:delId},
						success:function(html){
							$(".so-st").html(html);
						},
						cache:false
					});
				}
			}
		},
		dataType:'json',
		async:false,
		cache:false
	});
	
}

// 在档案车里根据每一条档案的ID删除不需要的档案操作
function delFormArchivesCar(id,delId){
	var url = $.appClient.generateUrl({ESArchiveSeache:'delFormArchivesCart'},'x');
	$.ajax({
		url:url,
		type:'post',
		data:"id=" + id,
		beforeSend:function(xhr) {},
        complete:function(){},
		success:function(html){
			if(html==0){
				var divEle = document.getElementById("product_list");
				var childs = divEle.childNodes;
				for(var i=childs.length-1;i>= 0;i--){
				    divEle.removeChild(childs[i]);
				}
				var h2Ele=document.createElement('h2');
					h2Ele.className='pl-null';
				var h2Text=document.createTextNode('没有申请数据!');//liqiubo 20140929 修改显示的文字，修复bug 1270
					h2Ele.appendChild(h2Text);
					divEle.appendChild(h2Ele);
//				_car.hide.call($("#car").get(0));
			}else{
				$('.pl-ul').get(0).removeChild($('.thisli_'+delId).get(0));
			}
			$(".so-st").html(html);
		},
		cache:false
	});
}
function clearAllApply(){
	var url = $.appClient.generateUrl({ESArchiveSeache:'clearFormArchivesCart'},'x');
	$.ajax({
		url:url,
		type:'post',
		beforeSend:function(xhr) {},
        complete:function(){},
		success:function(html){
			//$("#product_list").html("");
			var divEle = document.getElementById("product_list");
			var childs = divEle.childNodes;
			for(var i=childs.length-1;i>= 0;i--){
			    divEle.removeChild(childs[i]);
			}
			var h2Ele=document.createElement('h2');
				h2Ele.className='pl-null';
		    var h2Text=document.createTextNode('没有申请数据!');//liqiubo 20140929 修改显示的文字，修复bug 1270
				h2Ele.appendChild(h2Text);
				divEle.appendChild(h2Ele);
			$(".so-st").html(html);
		},
		cache:false
	});	
}

//提交档案车
//function submitArchivesCar(){
//	var url = $.appClient.generateUrl({ESArchiveLending:'apply'},'x');
//	$.ajax({
//		url:url,
//    	success:function(data){
//    		$.dialog({
//	    		title:'借阅申请审批单',
//    			width: '55%',
//    	   		fixed:true,
//    	    	resize: true,
//    	    	okVal:'提交',
//			    ok:true,
//			    cancelVal: '取消',
//			    cancel: true,
//	    		content:data,
//	    		ok:function(){
//	    			var form=$("#form");
//	    			var thisDialog=this;
//	    			var data=form.serialize();
//	    			var checkboxObj=$("input[name='path']:checked",$('#readingList'));
//			    	var val='';
//			    	var path=[];
//			    	var checkBoxLen=checkboxObj.length;
//			    	//判断是否选择数据
//			    	if(checkBoxLen==0){
//			    		$.dialog.notice({content:'请选择装盒的数据',time:3});
//						return false;
//			    	}
//			    	//表单元素的验证
//			    	var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
//					var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
//					var reg=/^[1-9]\d*$/;
//					if(!reg.test($("input[name='jysc_f6']").val())){
//						$("input[name='jysc_f6']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
//					    $.dialog.notice({content:'借阅时长不能为空且只能输入大于零的数字！',icon:'warning',time:3});
//					    return false;
//					}else if($("input[name='jysc_f6']").val()>30){
//						$("input[name='jysc_f6']").addClass("invalid-text").attr("title","借出天数不能超过30天");
//						$.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
//						return false;
//					}else if((!regTel.test($("input[name='dh_f4']").val()))&&($("input[name='dh_f4']").val()!='')){
//						  $("input[name='dh_f4']").addClass("invalid-text").attr("title","请输入合法的电话号码");
//						  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
//						  return false;
//					}else if((!regEmail.test($("input[name='yx_f5']").val()))&&($("input[name='yx_f5']").val()!='')){
//						  $("input[name='yx_f5']").addClass("invalid-text").attr("title","请输入合法的邮箱");
//						  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
//						  return false;
//					}
//		    		var checkfun = checkboxObj.each(function(i){
//		    			var type = "";
//			    		var trObj=$(this).closest('tr');
//				    	var mark = $("input[name='remark']",trObj).val();
//				    	if(mark == ""){
//							mark = "&nbsp;";
//					    }
//				    	type = $("input:radio:checked",trObj).val();
//			    		val=$("#readingList").flexGetColumnValue(trObj,['a']);
//			    		if(val == ""){
//							val = "&nbsp;";
//				    	}
//			    		valt=$("#readingList").flexGetColumnValue(trObj,['b']);
//			    		if(valt == ""){
//							valt = "&nbsp;";
//				    	}
//						/** 验证实体借阅 
//			    		if(type == '实体借出'){
//							if(mark == "&nbsp;"){
//								$("input[name='remark']").each(function(i){
//									$("input[name='remark']").css({ border: "" });
//								});
//								$("input[name='remark']",trObj).css({ border: "1px solid red" });
//								$.dialog('请填写实体借出原因');
//								exit;
//								return false;
//								
//							}
//				    	}
//				    	**/
//			    		if(val){
//			    			path.push( val + '|' + valt + '|' + type + '|' + mark + '|' + '借阅明细' + '|' + $(this).val());
//			    		}
//				    });
//				    $.post($.appClient.generateUrl({ESInformationPublish:'findLeaderByuserId'},'x'),function (htm){
//						if(htm === 'false'){
//							$.dialog.notice({ icon: 'warning', content: '对不起，没找到领导!'});
//							return;
//						}else if(htm.indexOf('onlyone')!=-1){
//							var approveUserId=htm.substring(7);
//							if(approveUserId ==''){
//								return false;
//							}
//							var url=$.appClient.generateUrl({ESArchiveSeache:'submitborrowbykey'},'x');
//							$.post(url,{data:data,path:path,approveUserId:approveUserId},function(result){
//								if(result){
//									thisDialog.close();
//									$.dialog.notice({width: 150,content: '提交成功',icon: 'face-smile',time: 3});
//									//清空档案车
//									$(".so-st").html(0);
//									var divEle = document.getElementById("product_list");
//									var childs = divEle.childNodes;
//									for(var i=childs.length-1;i>= 0;i--){
//									    divEle.removeChild(childs[i]);
//									}
//									var h2Ele=document.createElement('h2');
//										h2Ele.className='pl-null';
//									var h2Text=document.createTextNode('没有审批申请单!');
//										h2Ele.appendChild(h2Text);
//										divEle.appendChild(h2Ele);
//								}else{
//									$.dialog.notice({width: 150,content: '提交失败',icon: 'face-sad',time: 3});
//								}
//							});
//						}else{
//							$.dialog({
//								title: '选择审批领导',
//								content: htm,
//								okVal: '确定',
//								cancelVal: '取消',
//								cancel: true,
//								ok:function(){
//									var forms = document.getElementById('check_approval_list').elements,fl=forms.length;
//									var approveUserId='';
//									for(var f=0; f<fl; f++)
//									{
//										if(forms[f].checked){
//											approveUserId = forms[f].id;
//											break;
//										}
//									}
//									if(approveUserId ==''){
//										return false;
//									}
//									var url=$.appClient.generateUrl({ESArchiveSeache:'submitborrowbykey'},'x');
//									$.post(url,{data:data,path:path,approveUserId:approveUserId},function(result){
//										if(result){
//											thisDialog.close();
//											$.dialog.notice({width: 150,content: '提交成功',icon: 'face-smile',time: 3});
//											//清空档案车
//											$(".so-st").html(0);
//											var divEle = document.getElementById("product_list");
//											var childs = divEle.childNodes;
//											for(var i=childs.length-1;i>= 0;i--){
//											    divEle.removeChild(childs[i]);
//											}
//											var h2Ele=document.createElement('h2');
//												h2Ele.className='pl-null';
//											var h2Text=document.createTextNode('没有审批申请单!');
//												h2Ele.appendChild(h2Text);
//												divEle.appendChild(h2Ele);
//										}else{
//											$.dialog.notice({width: 150,content: '提交失败',icon: 'face-sad',time: 3});
//										}
//									});
//								}
//							});
//						}
//					});
//	    			return false;
//	    		}
//	    	});
//	    },
//	    	cache:false
//	});
//}




// 根据用户选择的文种类型获取元数据并加入到页面,如果有则显示出来，若没有则不显示
$('#docClass span').live('click', function (){
	//清空所有的已选档案类型的状态
	var spanEles=document.getElementById('docClass').childNodes;
	for(var j=0;j<spanEles.length;j++){
		spanEles[j].children[0].style.background='';
		spanEles[j].children[0].style.color='';
	}
	//当前项标注为选中状态
	this.children[0].style.background='#f00';
	this.children[0].style.color='white';
	var docClass = this.id;
	clearConditon(docClass);
	
});
//点击档案类型回调
function clearConditon(docClass){
	//清空保管期限的勾选状态，显示所有的选择项
	$("#retentionPeriod input").attr('checked',false);
	//根据档案类型来判断“按案卷级”checkbox是否存在
	$(".fileLev input").attr('checked',false);
	if(docClass=='clearall'){
		_globle.docClass='';
		
		//清空案卷级
		$(".fileLev input").attr('checked',false);
		$(".fileLev").hide();
		//清空著录项
		$('#meta').hide();
		$('#metadata').html('');
	}else{
		_globle.docClass=docClass;
		//去请求后台，动态添加著录项
		$.post($.appClient.generateUrl({ESArchiveSeache: "getArchiveClassFields"}, 'x'),{docClass: docClass},function (htm){
			if(htm){
				// 加验证后台是否有元数据[可以不加]
				$('#meta').show();
				$('#metadata').html(htm);
				
			}else{
				//如果没有内容【li=='';】隐藏内容，填入内容为空
				$('#meta').hide();
				$('#metadata').html(htm);
			}
		});
	}
	
}
/*机构部门的选择、添加、删除事件的操作*/
// 选择机构部门
$('.orgInput').live('click',function() {
	$(this).toggle(
		function() {
			var archiveClass=_globle.docClass;
			if(archiveClass==''){
				archiveClass='all';
			}
			
			//显示出机构文本框后添加的判断
			
			var _p=this.parentNode,_pp=_p.parentNode;
			var cityVal = $(this).closest('div.cascadeTwo').children('select[name="city"]').val();
			if(cityVal==0){
				//$.dialog({title:'操作提示',content:'请先选择省分公司及市分公司！',icon:'warning'});
				$.dialog.notice({width: 220,content: '请先选择省分公司及市分公司！',icon: 'warning',time: 3});
				$(this).die();
				return false;
			}
			$(this).attr('id','selectSection');
			var orgId=_pp.children[1].value;
			_org.getTree(this,orgId,archiveClass);
			$('#org_tree').css({top:$(this).position().top+22});
		},
		function() {
			var cityVal = $(this).closest('div.cascadeTwo').children('select[name="city"]').val();
			if(cityVal==0){
				$.dialog.notice({width: 220,content: '请先选择省分公司及市分公司！',icon: 'warning',time: 3});
				return false;
			}
			$(this).removeAttr('id');
			$('#org_tree').fadeOut('fast');
		}
	);
	$(this).trigger('click'); 
});


/*暂时隐藏ADD行
// 添加机构部门
$('.cascade .add').live('click', function (e){
	_org.addRow(this);
});
// 删除机构部门
$('.del').live('click', function (e){
	_org.delRow(this);
});
*/

// 驗證開始
$('input[validate="date"]').live('click', function (){ 
	WdatePicker({isShowClear:false,dateFmt:"yyyyMMdd"});
});
$('input[validate="number"]').live('focus', function (){
	if(isNaN(this.value)){
		this.value = '';
	}
	
	this.style.textDecoration = 'none';
	this.style.color = '#000';
	this.style.border='1px solid #5989A5';
	this.title='';
	this.id='';
});
$('input[validate="number"]').live('blur', function (){
	if(isNaN(this.value)){
		this.id='unallowabledigitNum';
		this.style.textDecoration = 'line-through';
		this.style.color = 'red';
		this.style.border='2px #DD0000 solid';
		this.title='此处只能输入数字！';
	}else{
		this.style.textDecoration = 'none';
		this.style.color = '#000';
		this.style.border='1px solid #5989A5';
		this.title='';
		this.id='';
	}
});

//单击搜索按钮时重新请求加载内容及页码
$(".searchall,#searchBtn").live('click',function(){
	_query.first = 1;
	if($('#searchWord').val()==$('#searchWord').attr('placeholder') && $('#NY_searchall').attr('id')=='NY_searchall') {
		_query.retrieveQuery();
		return;
	}
	if(document.getElementById('rePage')){
		_page.prevCache = document.getElementById('rePage').getElementsByTagName("a")[0];
		_page.page = 1;
		_page.total=Math.ceil(Number(document.getElementById('total').innerHTML)/_page.limit);
	}
	_query.retrieveQuery();
});

//查看案卷文件级 倪阳添加
function NY_toggle(obj) {
	var text = $(obj).text();
	var defaultValue = $(obj).attr('defaultValue');
	var toggleValue = $(obj).attr('toggleValue');
	var flagValue = $(obj).closest('li').children('ul');
	if(text === defaultValue) {
		if(flagValue.is('ul')) {
			$(obj).closest('li').children('ul,div.pages').show();
			//$(window).scrollTop($('#result:first-child').offset().top-20);
			$(obj).text(toggleValue);
		} else {
			postData['queryType'] = 3;
			var parentEspath = $(obj).closest('div').prev().attr('id');
			postData['parentEspath'] = parentEspath.split('|')[0];
			$.post($.appClient.generateUrl({ESArchiveSeache: "retrieveQuery"}, 'x'),{page:_page.page, limit:_page.limit,data:postData,first:1},function (data){
				if(data.error != '') {
					$(obj).closest('li').append(data);
					//$(window).scrollTop($('#result:first-child').offset().top-20);
					$(obj).text(toggleValue);
				} else {
					$.dialog.notice({title : '3秒后自动关闭',content: '请求失败，请稍后再试！',icon: 'warning',time: 3});
				}
			});					
		}
		
		
	} else {
		$(obj).closest('li').children('ul,div.pages').hide();
		$(obj).text(defaultValue);
	}	
}

//获取卷内文件
var getFileListPage = function(obj,page,total) {
//	var ulObj = $(obj).closest('ul');
//	var aObjValue = parseInt( $(obj).closest('div.pages').find('div.page ul').find('a.focus').text() );
//	if(aObjValue == page) {
//		return false;
//	}
//	postData['queryType'] = 3;
//	if(page === -1) {
//		var page = aObjValue-1;
//		if(page <= 0) return false;
//		if(aObjValue % 10 == 1) {				
//			$('#filepages ul li').hide();
//			$('#filepages ul li:lt('+(aObjValue-1)+')').show();
//			$('#filepages ul li:lt('+(aObjValue-11)+')').hide();
//		}
//		ulObj.find('a.focus').removeAttr('class').parent('li').prev('li').find('a').addClass('focus');
//	}else if(page === -2) {
//		var page = aObjValue+1;
//		if(page > total) return false;
//		if(aObjValue % 10 == 0) {		
//			$('#filepages ul li').hide();
//			var current = parseInt(aObjValue)+10;
//			$('#filepages ul li:lt('+current+')').show();
//			$('#filepages ul li:lt('+aObjValue+')').hide();
//		}
//		ulObj.find('a.focus').removeAttr('class').parent('li').next('li').find('a').addClass('focus');
//	} else {
//		ulObj.find('a.focus').removeAttr('class');
//		$(obj).addClass('focus');
//	}
//	$.post($.appClient.generateUrl({ESArchiveSeache: "retrieveQuery"}, 'x'),{page:page, limit:_page.limit,data:postData,first:0},function (data){
//		if(!data.error) {
//			var fileList = $(obj).closest('div.pages').prevAll('ul.filelist');
//			fileList.empty().append(data);
////			$(window).scrollTop($(obj).closest('div.pages').prevAll('div.showButton').offset().top-80);
//			$(window).scrollTop(0);
//		} else {
//			$.dialog.notice({title : '3秒后自动关闭',content: '请求失败，请稍后再试！',icon: 'warning',time: 3});
//		}
//	});		
}
//分页跳转
function jump(page,total,flag,obj) {
	if(isNaN(page) || parseInt(page) < 1 || parseInt(page) > total || $.trim(page) == '') {
		$(obj).closest('span').prev('input.page-num').focus().select();
		return false;		
	}
	_page.page = page;
	
	_page.aftergo();
	
//	if(flag === 'innerfile') {
//		$('#filepages ul li').hide();
//		$('#filepages ul li:lt('+maxPage+')').show();
//		$('#filepages ul li:lt('+minPage+')').hide();
//		$('#filepages ul li:eq('+page+')').find('a').click();		
//	} else {
//		$('#rePage ul li').hide();
//		$('#rePage ul li:lt('+maxPage+')').show();
//		$('#rePage ul li:lt('+minPage+')').hide();
//		$('#rePage ul li:eq('+page+')').find('a').click();			
//	}
}


//提交档案车
//第一步，判断当前有几个利用流程，如果没有利用流程，直接给提示
function submitArchivesCar(){
	var url = $.appClient.generateUrl({ESFormStart:'showUsingWfList'},'x');
	$.ajax({
		url:url,
		success:function(result){
			if(!result){
				$.dialog.notice({icon : 'warning',content : '对不起，您没有发起利用流程的权限，请联系管理员！',title : '3秒后自动关闭',time : 3});
				return false;
			}else if(result.length<10){//表示是只有一个利用流程，如果是多个的话，需要出页面，长度会远远大于10的，如果是一个，直接是表单ID，长度不会大约10
				formStartHandle.toFormStartPage(result,'ESArchiveSeache');
				return;
			}else{
				//TODO 获取档案车中的数据 path和title,后期还要获取条目是否挂接了电子文件，用于判断是否可以设置下载，打印，浏览权限
				
				$.dialog({
					title:'请选择利用流程',
					width: '25%',
//					height:160,
					fixed:true,
					resize: true,
					okVal:'提交',
					ok:true,
					cancelVal: '取消',
					cancel: true,
					content:result,
					ok:function(){
						var formId = $('#searchUsingWfSelect option:selected') .val();//选中流程的关联表单ID
						formStartHandle.toFormStartPage(formId,'ESArchiveSeache');
//						var __colModel=[
//										{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
//										{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
//										{display: '操作', name : 'handle',sortable : false, width : 30,align: 'left',callback:function(){addAttachData.showAttachData();return false ;}},
//										{display: '数据名称', name: 'title',sortable : true,width : 230,align: 'left',metadata:'Title'},
//										{display: '文件浏览', name: 'isRead',sortable : true,width : 45, align: 'center'},
//										{display: '浏览天数', name: 'readDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'readDate'},
//										{display: '文件下载', name: 'isDownload',sortable : true,width : 45, align: 'center'},
//										{display: '下载天数', name: 'downloadDate',sortable : true,width : 45,align: 'right',editable:true},
//										{display: '文件打印', name: 'isPrint',sortable : true,width : 45,align: 'center'},
//										{display: '打印天数', name: 'printDate',sortable : true,width : 45,align: 'right',editable:true},
//										{display: '实体借阅', name: 'useEntity',sortable : true,width : 45, align: 'center'},
//										{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
//									];
//						addAttachData.getAttachDataList(__colModel);
					}
				});
			}
		},
		cache:false
	});
}









// 驗證結束
// 頁面初始化載入
$(function(){
	$('#searchWord').placeholder();
	$("#estabs").esTabs("open", {title:"档案搜索", content:"#ESPaper"});
	$("#estabs").esTabs("select", "档案搜索");
	$("#ESPaper").height($(document).height()-145);
	
	
	var hashStr = decodeURI(window.location.hash);
	var hash = hashStr.split('|');
	if(hash[0] == '#tag'){
		$("#navall").addClass("param");
		$('#searchWord').val(hash[1]);
		_query.retrieveQuery();
	}
	
	
	//ENTER键的使用
	document.onkeyup = function (e){
		var e_ = window.event || e;
		/** xiaoxiong 20140716 将分页跳转框与检索框的回车事区分开 **/
		if(e_.keyCode===13){
			if(document.activeElement.id == 'searchWord'){
				_query.first = 1;
				if($('#searchWord').val()==$('#searchWord').attr('placeholder') && $('#NY_searchall').attr('id')=='NY_searchall') {
					return;
				}
				if(document.getElementById('rePage')){
					_page.prevCache = document.getElementById('rePage').getElementsByTagName("a")[0];
					_page.page = 1;
					_page.total=Math.ceil(Number(document.getElementById('total').innerHTML)/_page.limit);
				}
				_query.retrieveQuery();
			} else {
				var page = $('#searchChangePageObj').val();
				var totalPage = $('#searchChangePageObj').attr('totalPage');
				jump(page,totalPage,'file',$('#searchChangePageObj'));
			}
			
		} 
	};
	
	$('input.orgInput').live({
		mouseover: function(){
			var closeHtml = '<a title="删除" href="#" onclick="$(this).closest(\'div.cascadeTwo\').find(\'input.orgInput\').val(\'\');$(this).closest(\'div.cascadeTwo\').find(\'#district input:hidden\').remove();return false;"><img style="position: absolute; margin-top: 4px;margin-left: -18px; cursor:pointer; z-index: 2" src="/apps/escloudapp/templates/public/flexigrid/css/images/cross.png"></a>';
			if($(this).val()!='') {
				if($(this).nextAll('a').is('a')) {
					$(this).nextAll('a').show().mouseover(function(){
						$(this).show();
					}).mouseout(function(){
						$(this).hide();
					});
				} else {
					$(this).after(closeHtml);
				} 
			}
		},
		mouseout: function(){
			$(this).next('a').hide();
		}
	});
	
	$(document).mousedown(function(event) {
		if(event.target.id.indexOf('org_tree') < 0 && event.target.id != 'selectSection') {
			if($('#org_tree').is(':visible')) {
				$('.orgInput').unbind();
			}
			$('#selectSection').removeAttr('id');
			$('#org_tree').hide();
		}
	});
	
	$('.page-num').live({
		focus: function() {			
			$(this).css({'border':'1px solid #5656F2'}).next('span').delay(200).animate({left: '+2px'}, 200);//liqiubo 20140916 确定按钮出来后，与文本框有点间隙，修复bug 313
		
		},
		focusout: function() {
			$(this).css({'border':'1px solid #DEDEDE'}).next('span').delay(400).animate({left: '-43px'}, 300);
			
		}
		
	});
});
