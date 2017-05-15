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
};
/** lujixiang 20150418 高级检索搜索范围-收集范围 **/
_global={
		stageCode:''
	};
//檔案車
_car = {
	show: function (){ // 顯示
		//this.style.backgroundColor = '#fff';
		$(this).css('backgroundcolor','#fff');
		document.getElementById('product_list').style.display = 'block';
	},
	hide: function (){ // 隱藏
		$(this).css('backgroundcolor','#f5f5f5');
		//this.style.backgroundColor = '#f5f5f5';
		document.getElementById('product_list').style.display = 'none';
	}
};
//檔案車的顯示及隱藏事件
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
$(".searchSubmit2").live('click',function(){
		CheckForm();
		if(document.getElementById('onword')){
			var wordVal=$("#onword").val();
			if(wordVal=='' || wordVal==$('#onword').attr('placeholder')){
				return false;
			}
			var url = $.appClient.generateUrl({ESFullTextSearch:"admin"});
			window.location.href =encodeURI(url+'#tag|'+wordVal+'|'+new Date().getTime());
			return;
		}
	});
	function CheckForm(){ 
		var onword = document.getElementById('onword');
		if(!onword.value || onword.value==$('#onword').attr('placeholder')){
			var times = 0;
			function exec(){
				if(times++%2===0){
					onword.style.background = '#faa';
				}else{
					onword.style.background = '#fff';
				}
			}
			for(var i=0; i<4; i++)
			{
				setTimeout(exec, i*100);
			}
			onword.setAttribute('title','此处关键字不能为空！');
			return false;	
		}

		return true; 
		
	}
	//回车事件
	$(document).keydown(function(event) {
	    if (event.keyCode == 13 && document.activeElement.id == 'onword') {
	    	CheckForm();
			var wordVal=$("#onword").val();
			if(wordVal=='' || $('#onword').val()==$('#onword').attr('placeholder')){
				return false;
			}
			var url = $.appClient.generateUrl({ESFullTextSearch:"admin"});
			window.location.href =encodeURI(url+'#tag|'+wordVal+'|'+new Date().getTime());
			return;
	    }
	});
//查詢結果數據的分頁
_page = {
		page: 1, //当前页码
		total: 0,//总页数
		limit: 10, // 每次向后台取多少条
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
		},
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
				
				if(pageindex % 10 == 1) {				
					$('#rePage ul li').hide();
					$('#rePage ul li:lt('+(pageindex-1)+')').show();
					$('#rePage ul li:lt('+(pageindex-11)+')').hide();
				}
				
				if(reg.test((_page.page-1)/10)){
					var range=((_page.page-1)/10-1)*460;
					
					document.getElementById("rePage").getElementsByTagName("ul")[0].style.left=(-range)+"px";
				}
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
				
				if(pageindex % 10 == 0) {		
					$('#rePage ul li').hide();
					var current = parseInt(pageindex)+10;
					$('#rePage ul li:lt('+current+')').show();
					$('#rePage ul li:lt('+pageindex+')').hide();
				}
				
				if(reg.test(_page.page/10)){
					var range=(_page.page/10)*460;
					
					document.getElementById("rePage").getElementsByTagName("ul")[0].style.left=(-range)+"px";
				}
				_page.page = _page.page*1 + 1;
				
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
			
			_query.retrieveQuery();
			
		}		
};

_globle={
		docClass:''
	};

$(".searchall,#searchBtn").live('click',function(){
	_query.retrieveQuery();
});
_query = {
	first: 1,
	retrieveQuery : function(){
		var wordVal=$.trim($('#searchWord').val())==$('#searchWord').attr('placeholder') ? '' : $('#searchWord').val();
		if(wordVal==''){
			return false;
		}
		
		/** lujixiang 20150417 获取关键词、部门、装置  **/
		postData = {};
		postData['searchWord'] = wordVal ;
		if($("#departmentCode")){
			
			var departmentCode = $("#departmentCode").val();
			var departmentName = $("#departmentName").val();
			if(null != departmentCode || "" != departmentCode){
				postData['departmentCodes'] = departmentCode;
				postData['departmentNames'] = departmentName;
			}
		}
		
		if($("#deviceCode")){
			
			var deviceCode = $("#deviceCode").val();
			var deviceName = $("#deviceName").val();
			if(null != deviceCode || "" != deviceCode){
				postData['deviceCodes'] = deviceCode;
				postData['deviceNames'] = deviceName;
			}
		}
		
		/*if(null != _global.stageCode && '' != _global.stageCode){
			postData['stageCode'] = _global.stageCode;
		}*/
		//重新赋值收集范围
		if($("#stageCode")){
			var stageCode = $("#stageCode").val();
			var stageName = $("#stageName").val();
			if(null != stageCode || "" != stageCode){
				postData['stageCode'] = stageCode;
				postData['stageName'] = stageName;
			}
		}
		
		
		/**
		var page ={
			page : _page.page,
			limit : _page.limit,
			issenior:'nosenior',
			data : $("#searchWord").val()
		};
		**/
		$.post($.appClient.generateUrl({ESFullTextSearch: "retrieveQuery"}, 'x'),{page:_page.page, limit:_page.limit,data:postData},function (htm){
			if(htm){
				if(htm.indexOf('error')!=-1){
					$.dialog.notice({title : '3秒后自动关闭',icon : 'warning',content : htm.replace('error: ',''),time : 3});
					return false;
				}else if(htm=='null'){
					if(wordVal){
						$('.so-result').html('<span style="font-size:15px;font-style:normal;">抱歉，没有找到与关键字 “<em style="color:#cc0000;font-style:normal;font-size:15px;"> '+wordVal+' </em>” 相关的档案。</span>');
					}else{
						$('.so-result').html('<span style="font-size:15px;font-style:normal;">抱歉，没有找到符合条件的档案。</span>');
					}
					$('.pages').hide();
					return false;
				}else{
					var checked = $('input[name="fileLevel"]').attr('checked') || false;
					var html = '<div class="showButton"><a class="applyToArchivesCar" defaultValue="显示文件级" toggleValue="隐藏文件级" href="#" onclick="NY_toggle(this); return false;" style="float: right; width:66px;position: relative;top: -20px;">显示文件级</a></div>';
					if(_query.first){
						//_query.first = 0;
						$('#so_result').html(htm);
						if(checked) {
							$('#so_result #result li a.applyToArchivesCar').after(html);
						}
						// 初始化數據開始
						if(document.getElementById('rePage')){
							_page.prevCache = document.getElementById('rePage').getElementsByTagName("a")[0];
							_page.total=Math.ceil(Number(document.getElementById('total').innerHTML)/_page.limit);
							
							var currentPage=document.getElementById("page_"+_page.page);
							currentPage.className = 'focus';
							currentPage.disabled="disabled";
							currentPage.style.cursor="text";
							_page.prevNext();
						}
						// 初始化數據完畢
						return;
					}else{
						var splitNo = htm.indexOf("_") ;
						elapsedTime = htm.substring(0, splitNo) ;
						htm = htm.substring(splitNo+1, htm.length) ;
						$('#result').html(htm);
						$('.s_count span').html(elapsedTime);
						if(checked) {									
							$('#so_result #result li a.applyToArchivesCar').after(html);
						}
					}
				}
			}
		});
	},
	intricate: function (){ // 高級檢索
		window.location.href = $.appClient.generateUrl({ESFullTextSearch: "intricate"});
	},
	base: function (){ // 普通檢索
		window.location.href = $.appClient.generateUrl({ESFullTextSearch: "index"});
	}
};
//驗證結束
//頁面初始化載入
$(function(){
	$('#searchWord').placeholder();
	$("#estabs").esTabs("open", {title:"全文检索", content:"#ESPaper"});
	$("#estabs").esTabs("select", "全文检索");
	$("#ESPaper").height($(document).height()-145);
	
	
	var hashStr = decodeURI(window.location.hash);
	var hash = hashStr.split('|');
	if(hash[0] == '#tag'){
		$("#navall").addClass("param");
		$('#searchWord').val(hash[1]);
		_query.retrieveQuery();
	}
	$('.page-num').live({
		focus: function() {			
		$(this).css({'border':'1px solid #5656F2'}).next('span').delay(200).animate({left: '+2px'}, 200);
		},
		focusout: function() {
		$(this).css({'border':'1px solid #DEDEDE'}).next('span').delay(400).animate({left: '-43px'}, 300);
		}
	});
	
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
});
//换页[扩展，延伸应用]
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
//申请
function addToArchivesCar(Tit){
	var flag = false;
	var filecode = (Tit.id).split('|')[0];
	notIndexOf();
	if(filecode.indexOf("<font color='red'>")!=-1){
		filecode = filecode.substring(filecode.indexOf("<font color='red'>")+18,filecode.lastIndexOf("</font>"));
	}
	var title = (Tit.id).split('|')[1];
	var docId = (Tit.id).split('|')[2];
	$.ajax({
		url:$.appClient.generateUrl({ESDocumentBorrowing:'addCarForBespeak'},'x'),
		type:"post",
	    data:{docId:docId},
	    dataType: 'json',
	    success:function(data){
	    	if(data==-1){
	    		$.dialog.notice({content:'您选择的数据已经存在申请栏中，请重新选择！',icon:'warning',time:3});
	    		return false;
	    	}else if(data==-2){
	    		$.dialog.notice({content:'您选择的数据已经不存在，请重新创建索引！',icon:'warning',time:3});
	    		return false;
	    	}else if(data >0){
	    		$.ajax({
	    			url:$.appClient.generateUrl({ESDocumentBorrowing:'getRespeakDetails'},'x'),
	    		    success:function(data){
	    		    	var jsondata = eval('(' + data + ')');
	    		    	$(".so-st").html(jsondata.rows.length);
	    		    	$(".product-list").html("");
	    		    	var html = "";
	    		    	if(jsondata.rows.length==0){
	    		    		html += "<h2 class='pl-null'>没有申请数据！</h2>";
	    		    	}else{
	    		    		html += "<h2 class='pl-hd'><b>申请数据清单</b></h2>";
	    		    		html += "<ul class='pl-ul'>";
	    		    		for(var i = 0;i<jsondata.rows.length;i++){
	    		    			html += "<li id='"+jsondata.rows[i].id+"' class='thisli_"+jsondata.rows[i].id+"'>";
	    		    			html += "<span></span>";
	    		    			html += (jsondata.rows[i].cell.title == null)?"<div class='titlestyle'/>":"<div class='titlestyle'>"+jsondata.rows[i].cell.title+"</div>";
			    				html += "<div class='deletestyle'><a href='javascript:delFormArchivesCar("+jsondata.rows[i].id+");'>删除</a></div>";
		    		    		html += "</li>";
	    		    		}
	    		    		html += "</ul>";
	    		    		html += "<div class='pl-hr'><a onclick='javascript:delFormArchivesCar();'>清空</a></div>";
	    		    		html += "<div class='pl-sb'>";
	    		    		html += "<a href='javascript:submitBespeakCar();'>提交预约</a>";
	    		    	}
	    		    	$(".product-list").html(html);
	    		    	$.dialog.notice({content:'申请成功！',icon:'succeed',time:3});
	    	    		return false;
	    		    },
	    		    cache: false,
	    		    async: false
	    		});
	    	}
	    },
	    cache: false,
	    async: false
	 });
}

//提交预约
function submitBespeakCar(){
	$.ajax({
		 url:$.appClient.generateUrl({ESDocumentBorrowing:'respeak'},'x'),
		 data:{},
		 //dataType: 'json',
		 success:function(data){
		    $.dialog({
			    title:'添加预约明细',
			    width: '600px',
			    height:'380px',
			    padding:'0px',
		    	fixed:  true,
		    	resize: false,
		        okVal:'确定',
				ok:true,
				cancelVal: '取消',
				cancel: true,
				content:data,
				ok:function(){
					if (!$("#form_add").validate()) {
						return false;
					}
			    	var flag = addBespeak();
					var thisDialog=this;
					if(!flag){
						return false;
					}else{
						thisDialog.close();	
					}
			    },
			    init: function() {
			    	$("#form_add").autovalidate();
			    }
		    });
		 },
		 cache: false,
		 async: false
	});    		
}

function addBespeak(){
	var flag = true;
	var result = addOrEditBorrowData($("#form_add"),'add');
	var index = 0;
	var docIdsArray = new Array();
	var checkboxes=$("#respeakDetails").find("tr");
	var checkLength=checkboxes.length;
    if(checkLength>0){
    	checkboxes.each(function(){
    		 var borrowdetail=new Object();// 放借阅
    		 var trObj=$(this).closest('tr');
	    	 borrowdetail['docId'] = trObj.find("td[colname='docId'] div").text();// 文件id
	    	 docIdsArray[index++] = borrowdetail;
    	});
    	$.ajax({
    		url:$.appClient.generateUrl({ESDocumentBorrowing:'bespeak'},'x'),
    		type:"post",
    	    data:{docIdsArray:docIdsArray,borrowform:result['borrowform']},
    	    success:function(data){
    	    	if(data == "true"){
    	    		$.ajax({
    		    		url:$.appClient.generateUrl({ESDocumentBorrowing:'getRespeakDetails'},'x'),
    		    		success:function(data){
    		    		   var jsondata = eval('(' + data + ')');
    		    		   $(".so-st").html(jsondata.rows.length);
    		    		   $(".product-list").html("");
    		    		   var html = "";
    		    		   if(jsondata.rows.length==0){
    		    			   html += "<h2 class='pl-null'>没有申请数据！</h2>";
    		    		   }else{
    		    			   html += "<h2 class='pl-hd'><b>申请数据清单</b></h2>";
    		    			   html += "<ul class='pl-ul'>";
    		    			   for(var i = 0;i<jsondata.rows.length;i++){
    		    				   html += "<li id='"+jsondata.rows[i].id+"' class='thisli_"+jsondata.rows[i].id+"'>";
    		    				   html += "<span></span>";
    		    				   html += (jsondata.rows[i].cell.title == null)?"<div class='titlestyle'/>":"<div class='titlestyle'>"+jsondata.rows[i].cell.title+"</div>";
    		    				   html += "<div class='deletestyle'><a href='javascript:delFormArchivesCar("+jsondata.rows[i].id+");'>删除</a></div>";
    		    				   html += "</li>";
    		    			   }
    		    			   html += "</ul>";
    		    			   html += "<div class='pl-hr'><a onclick='javascript:delFormArchivesCar();'>清空</a></div>";
    		    			   html += "<div class='pl-sb'>";
    		    			   html += "<a href='javascript:submitBespeakCar();'>提交预约</a>";
    		    		   }
    		    		   $(".product-list").html(html);
    		    		   $.dialog.notice({content:'预约成功！',icon:'succeed',time:3});
    		    		   flag = true;
    		    		},
    		    		cache: false,
    		    		async: false
    		    	});
    	    	}else if(data == "false"){
    	    		$.dialog.notice({content:'预约失败！',icon:'succeed',time:3});
    	    		flag = true;
    	    	}else{
    	    		$.dialog.notice({content:data,icon:'warning',time:3});
    	    		flag = false;
    	    	}
    	    },
    	    cache: false,
    	    async: false
    	 });
    }
	return flag;
}

function delFormArchivesCar(id){
	$.ajax({
		 url:$.appClient.generateUrl({ESDocumentBorrowing:'delFormArchivesCar'},'x'),
		 data:{id:id},
		 success:function(data){
			 if(data>0){
				 $.ajax({
		    		url:$.appClient.generateUrl({ESDocumentBorrowing:'getRespeakDetails'},'x'),
		    		success:function(data){
		    		   var jsondata = eval('(' + data + ')');
		    		   $(".so-st").html(jsondata.rows.length);
		    		   $(".product-list").html("");
		    		   var html = "";
		    		   if(jsondata.rows.length==0){
		    			   html += "<h2 class='pl-null'>没有申请数据！</h2>";
		    		   }else{
		    			   html += "<h2 class='pl-hd'><b>申请数据清单</b></h2>";
		    			   html += "<ul class='pl-ul'>";
		    			   for(var i = 0;i<jsondata.rows.length;i++){
		    				   html += "<li id='"+jsondata.rows[i].id+"' class='thisli_"+jsondata.rows[i].id+"'>";
		    				   html += "<span></span>";
		    				   html += (jsondata.rows[i].cell.title == null)?"<div class='titlestyle'/>":"<div class='titlestyle'>"+jsondata.rows[i].cell.title+"</div>";
		    				   html += "<div class='deletestyle'><a href='javascript:delFormArchivesCar("+jsondata.rows[i].id+");'>删除</a></div>";
		    				   html += "</li>";
		    			   }
		    			   html += "</ul>";
		    			   html += "<div class='pl-hr'><a onclick='javascript:delFormArchivesCar();'>清空</a></div>";
		    			   html += "<div class='pl-sb'>";
		    			   html += "<a href='javascript:submitBespeakCar();'>提交预约</a>";
		    		   }
		    		   $(".product-list").html(html);
		    		   $.dialog.notice({content:'删除申请数据成功！',icon:'succeed',time:3});
		    		   return false;
		    		},
		    		cache: false,
		    		async: false
		    	});
	    	}
		},
		cache: false,
		async: false
	});
	
}

function jump(page,total,flag,obj) {
	if(isNaN(page) || parseInt(page) < 1 || parseInt(page) > total || $.trim(page) == '') {
		$(obj).closest('span').prev('input.page-num').focus().select();
		return false;		
	}
	_page.page = page;
	_page.aftergo();
	
}

//ie8不支持indexof方法
function notIndexOf(){
	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
	    var len = this.length >>> 0;
	
	    var from = Number(arguments[1]) || 0;
	    from = (from < 0)
	         ? Math.ceil(from)
	         : Math.floor(from);
	    if (from < 0)
	      from += len;
	
	    for (; from < len; from++)
	    {
	      if (from in this &&
	          this[from] === elt)
	        return from;
	    }
	    return -1;
	  };
	}
}

/** lujixiang 20150401 显示文件详情 **/
function getDetailData(stageId, dataId){
	
			
	if(null == stageId || "" == stageId || null == dataId || "" == dataId){
		
		$.dialog.notice({content:'获取数据参数失败！',icon:'error',time:3});
		return ;
	}	
	
	$.ajax({
		type:'POST',
		url:$.appClient.generateUrl({ESDocumentsCollection:'showData'},'x'),
		data:{stageId:stageId, dataId:dataId},
		success:function(data){
			$.dialog({
				id:'collectionDataShowWin',
				title:'文件浏览',
				width: '800px',
				height:'330px',
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


/** lujixiang 20150410 浏览数据和电子文件 **/
/**
 * @stageId : 收集范围id
 * @dataId : 收集数据id
 * @hasElec : 是否拥有电子文件
 * @hasElecRight : 是否拥有浏览电子文件的权限
 */
function viewFile(stageId, dataId){
	
	if(null == stageId || "" == stageId || null == dataId || "" == dataId){
		
		$.dialog.notice({content:'获取数据参数失败！',icon:'error',time:3});
		return ;
	}	
	
	$.ajax({
		type:'POST',
		url:$.appClient.generateUrl({ESDocumentsCollection:'getFileViewRight'},'x'),
		data:{dataId:dataId},
		dataType:'json',
		success:function(data){
			
			if(data.hasElecFile && data.hasElecFileRight){
				
				var url = $.appClient.generateUrl({
		        	ESDocumentsCollection: 'file_view',
		            id: dataId,
		            fileId: '',
		            stageId:stageId
		        },
		        'x');
		        $.ajax({
		            url: url,
		            cache: false,
		            success: function(data) {

		                if (data === 'pathErr') {
		                    $.dialog.notice({
		                        content: '参数不正确（PATH）',
		                        time: 2,
		                        icon: 'warning',
		                        lock: false
		                    });
		                }
		                $.dialog({
		                    title: '浏览电子文件',
		                    width: '960px',
		                    fixed: false,
		                    resize: false,
		                    padding: 0,
		                    top: '10px',
		                    content: data
		                });
		            }
		        });
				
			}else{
				
				$.dialog.notice({content:'无数据权限,或文件已删除',icon:'error',time:3});
				return ;
			}
		},
		cache:false
	});
	
	
}


//lujixiang 20150414 查看电子文件
function show_fileDetail(obj, attacheMentCount){
	
	/** 默认选中第一个 **/
	var attacheMentTtile = $(obj).parent().find("#attacheMent_title_0").val();
	var attacheMent = $(obj).parent().find("#attacheMent_0").val();
	
	var val = '<div class="paper" style="width:500px;float:left;margin-left:0px;">' +
					'<div class="leftnav" style="float:left;width:220px;height:500px;">' + 
						'<ul> ' +	
							'<li class="param" onclick="navClick(this,0)">' +	
							'<input type="hidden" id="tempAttachMent_0" value="' + attacheMent  +'" >' + 
							'<a href="javascript:void(0)" title="' + attacheMentTtile +'">'+ (attacheMentTtile.length > 8 ? attacheMentTtile.substr(0,8)+"..." : attacheMentTtile) +'</a></li> ';
							
	for(var i = 1; i < attacheMentCount; i++ ){
		var tempTitle = $(obj).parent().find("#attacheMent_title_"+i).val();
		var tempValue = $(obj).parent().find("#attacheMent_"+i).val();
		val += ('<li onclick="navClick(this,'+i+')">' +
					'<input type="hidden" id="tempAttachMent_'+ i +'" value="' + tempValue +'" >' + 
					'<a href="javascript:void(0)" title="' + tempTitle + '">' + (tempTitle.length > 8 ? tempTitle.substr(0,8) : tempTitle) + '</a></li>') ;
	}						
		val	+=		'</ul>' +
				'</div>' + 
				'<div style="float:left;width:200px;height:500px;" id="attachMentContent"> '+ Base64.decode(attacheMent) +
				'</div>' +
			'</div>';
	// var content = $(str).attr("justdoit");
	// var contentVal = '<div style=\'height:500px;overflow-y:auto;overflow-x:hidden;position:relative;padding:5px;\'>'+Base64.decode(content)+'</div>';
	$.dialog({
		title:'文本内容',
		width:'500px',
		height:'500px',
		padding:0,
		fixed:  false,
		autoOpen:true,
		fixPosition:true,
		resizable:false,
		modal:true,
		bgiframe:true,
		content:val
	});
}

function navClick(obj,i){
	
	/** 切换导航条样式 **/
	$(".paper li").siblings().removeClass("param");
	$(obj).addClass("param");
	/** 切换文本内容 **/
	$("#attachMentContent").html(Base64.decode($("#tempAttachMent_"+i).val())) ;
	
}

//根据用户选择的文种类型获取元数据并加入到页面,如果有则显示出来，若没有则不显示
/*$('#docClass span i').live('click', function (){
	//清空所有的已选档案类型的状态
	var spanEles=document.getElementById('docClass').childNodes;
	for(var j=0;j<spanEles.length;j++){
		spanEles[j].children[0].style.background='';
		spanEles[j].children[0].style.color='';
	}
	//当前项标注为选中状态
	this.children[0].style.background='#f00';
	this.children[0].style.color='white';
	if('clearall' == this.id){
		_global.stageCode = '' ;
	}else{
		_global.stageCode = this.id ;
	}
	
	// var docClass = this.id;
	// clearConditon(docClass);
	
});*/


