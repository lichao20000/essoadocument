//shimiao 20140715 利用统计重新做调整
var count_for_sort=0;
var formCondition = '' ;
var storeCondition = '' ;
var staticType= 'form';
$(function(){
	    function dispaly(num){
	    	if(num ==1){
	    		$('#usingFormContent').show();
	    		$('#usingStoreContent').hide();
	    		staticType = 'form';
	    		$('#formTitle').attr('style','background: #41b3e5;');
	    		$('#storeTitle').attr('style','background: #4a8bc2;');
	    	}else{
	    		$('#usingFormContent').hide();
	    		$('#usingStoreContent').show();	
	    		staticType = 'store';
	    		$('#storeTitle').attr('style','background: #41b3e5;');
	    		$('#formTitle').attr('style','background: #4a8bc2;');
	    		$("#storeStaticTable").flexReload();
	    	}
	    }
	    $('#formTitle').live('click',function(){
	    	dispaly(1);
	    });
	    $('#storeTitle').live('click',function(){
	    	dispaly(2);
	    });
	    
	    
		var width = document.documentElement.clientWidth*0.96;
		var height = document.documentElement.clientHeight-163;
		
		$('#subnav').css('width',width-10);
		$('#titleStatic').css({'width':width,'height':47+"px"});
		$('#formTitle').attr('style','background: #41b3e5;');
		$('.usingFormContent').css({'width':(width)+"px",'height':(height-35)+"px"});
		$('.formGrid').css({'width':(width)+"px",'height':(height-35)/2+"px"});
		$('.formStaticGrid').css({'width':(width)+"px",'height':(height-30)/2+"px"});
		$('.usingStoreContent').css({'width':(width)+"px",'height':(height-40)+"px"});
		$('.storeGrid').css({'width':(width)+"px",'height':(height-35)/2+"px"});
		$('.storeStaticGrid').css({'width':(width)+"px",'height':(height-30)/2+"px"});
		var storeFiled;
		var formFiled;
		function filterBorrowForm(){
			var url =[];
			if(staticType=='form'){
				url=$.appClient.generateUrl({ESArchiveLending:'filter'},'x');
			}else{
				url=$.appClient.generateUrl({ESArchiveLending:'filterStore'},'x');
			}
			  $.ajax({
				  url:url,
				  success:function(data){
					 $.dialog({
						 title:'筛选面板',
						 fixed:true,
						 resize:false,
						 opacity:0.1,
						 ok:true,
						 okVal:'确定',
						 cancel:true,
						 cancelVal:'取消',
						 content:data,
						 ok:function(){
							 var exg = /(\|)$/;
						    	var sql_string = '';
						    	$('#contents p').each(function (i){
						    		var filedvalue = $('.filedvalue').eq(i).val();
						    		if(filedvalue){
						    			var filedname	=	$('.filedname').eq(i).val();
						    			if(filedname.indexOf("|")>0){
						    				filedname = filedname.split("|")[0];
						    				if(filedvalue == "是"){
						    					filedvalue = "1";
						    				}else if(filedvalue == "否"){
						    					filedvalue = "2";
						    				}
						    			}
						    			var comparison	=	$('.comparison').eq(i).val();
						    			var relationship=	$('.relationship').eq(i).val();
						    			if(relationship=="AND"){
						    				relationship='true';
						    			}else{
						    				relationship='false';
						    			}
						    			sql_string += filedname+","+comparison+","+filedvalue+","+relationship+"|";
						    		}
						    	});
						    	var str = sql_string.replace(exg,"");
						    	if(str==""){
						    		$.dialog.notice({icon:'warning', content:"查询条件不能为空！", time:3});
						    		return;
						    	}
						    	
						    	if(staticType=='form'){
						    		formCondition = encodeURI(str);
						    		var keyWord = $('#queryformGridWord').val();
						    		if(keyWord=='请输入关键字' ){
						    			keyWord ='';
						    		}
						    		var url = $.appClient.generateUrl({ESArchiveLending:'filter_sql',sql:encodeURI(str),id:'',noUser:true,pId:''},'x');
						    		$('#formTable').flexOptions({newp: 1,url:url,query:{keyWord:keyWord}}).flexReload();
						    	}else{
						    		storeCondition = encodeURI(str);
						    		var keyWord = $('#queryStoreGridWord').val();
						    		if(keyWord=='请输入关键字' ){
						    			keyWord ='';
						    		}
						    		$('#storeTable').flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'store_json_keyWord',storeCondition:storeCondition},'x'),query:{keyWord:''},newp:1}).flexReload();
						    	}
						 },
						 cache:false
					 }); 
				  },
				  cache:false
			  });
		  
		}
		function backIndex(){
			if(staticType == 'form'){
				formCondition = '';
				var keyWord = $('#queryformGridWord').val();
				if(keyWord=='请输入关键字' ){
					$("#formTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:true},'x'),query:{keyWord:''},newp:1}).flexReload();
					return false;
				}
				$("#formTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:true},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
			}else{
				formCondition = '';
				var keyWord = $('#queryStoreGridWord').val();
				if(keyWord=='请输入关键字' ){
					$("#storeTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'store_json_keyWord'},'x'),query:{keyWord:''},newp:1}).flexReload();
					return false;
				}
				$("#storeTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord'},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
			}
		}
		function staticItemfun(){
			count_for_sort =0;
			var formFileds = formFiled.join("-");
			$.ajax({
			    url: $.appClient.generateUrl({ESUsingStatistics:'setCondition',type:staticType},'x'),
			    data:{formFileds:formFileds},
			    type:"POST",
			    success:function(data){
			    	$.dialog({
			    		id:'addPanel',
						title:'设置统计方案',
						content:data,
						width:700,
						padding:'5px 20px',
						height: 500,
						okVal:'保存',
						ok:function(){
							var formObj=$('#addPlan');
							var data={};
							var temp=[];
							$('tr:gt(0)',formObj).each(function(i){
								if($('input:checked',this).length>0){
									var fieldVal=$('input:eq(0)',this).val();
									var is_output=$('input:eq(0)',this).attr('checked')?'true':'false';
									var display=$('input:eq(0)',this).closest('td').text();
									var sortNum=$('input[name="sortNum"]',this).val()?$('input[name="sortNum"]',this).val():0;
									var sortRule=$('[name="sortRule"]',this).val()?$('[name="sortRule"]',this).val():'asc';
									var count='rule:'+ ($('[name="rule"]:checked',this).val()?'true':'false');
									 count=count + "|sum:" + ($('[name="sum"]:checked',this).val()?'true':'false');
									 count=count + "|pre:" + ($('[name="pre"]:checked',this).val()?'true':'false');
									 count=count + "|max:" +( $('[name="max"]:checked',this).val()?'true':'false');
									 count=count + "|min:" + ($('[name="min"]:checked',this).val()?'true':'false');
									temp.push({'term':fieldVal,'outputSort':sortNum,'sort':sortRule,'display':display,'count_number':count,'is_output':is_output});
								}
							});
							data.name=$("input[name='name']",formObj).val();
							data.item=temp;
							data.type=staticType;
							var url=$.appClient.generateUrl({ESUsingStatistics:'savePlan'},'x');
							$.post(url,{data:data},function(result){
								if(result){
									$.dialog.notice({content:'添加成功',icon:'succeed',time:2});
									if(staticType == 'form'){
										$("#formStaticTable").flexReload();
									}else{
										$("#storeStaticTable").flexReload();
									}
								}
							});
								return false;
							},
						cancel:true,
						cancelVal:'关闭'
				    });
				   },
				    cache:false
			});
		}
		$.ajax({
			url:$.appClient.generateUrl({ESArchiveLending:'getfieldData',data:'form'},'x'),
			dataType: 'json',
			success:function(data){
				var _flexme1_width = $('.formGrid').width();
				var _flexme1_height =$('.formGrid').height()-115;

				var __borrowModel='using';
				var showColModel=[
						{display: '序号', name : 'num', width : 40, align: 'center'},
						{display: '借阅单编号', name : 'c4', width : 100, sortable : true, align: 'center',metadata:'Code'},
						{display: '借阅人', name : 'c5', width : 60, sortable : true, align: 'center',metadata:'Reader'},
						{display: '单位', name : 'c6', width : 80, sortable : true, align: 'center',metadata:'Dept'},
						{display: '电话', name : 'c7', width : 80, sortable : true, align: 'center',metadata:'Telephone'},
						{display: '邮箱', name : 'c8', width : 150, sortable : true, align: 'center',metadata:'Email'},
						{display: '利用目的', name : 'c9', width : 80, sortable : true, align: 'center',metadata:'Usepurpose'},
						{display: '催还提前天数', name : 'c10', width : 60, sortable : true, align: 'center',metadata:'Validdate'},
						{display: '登记人', name : 'c12', width : 60, sortable : true, align: 'center',metadata:'Register'},
						{display: '登记日期', name : 'c13', width : 110, sortable : true, align: 'center',metadata:'Registdate'},
						{display: '状态', name : 'c14', width : 60, sortable : true, align: 'center',metadata:'Status'},
						{display: '身份证', name : 'c16', width : 60, sortable : true, align: 'center',metadata:'Identity'},
						{display: '卷数', name : 'c17', width : 60, sortable : true, align: 'center',metadata:'FileCount'},
						{display: '件数', name : 'c18', width : 60, sortable : true, align: 'center',metadata:'InnerFileCount'},
						{display: '备注', name : 'c15', width : 120, sortable : true, align: 'center',metadata:'Description'}
				    ];
				formFiled = data.form;
				storeFiled = data.store;
				for(var i = 0;i<formFiled.length;i++){
					if(formFiled[i].type == 'BOOLEAN'){
						showColModel.push({display:formFiled[i].field,name:'d'+formFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+formFiled[i].id,sortable : true,align : 'center',process:formatValue});
					}else{
						showColModel.push({display:formFiled[i].field,name:'d'+formFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+formFiled[i].id});
					}
				}
				var showButton=[
						{name: '筛选', bclass: 'filter',onpress:filterBorrowForm},
						{name: '还原数据',bclass: 'back',onpress:backIndex}
				    ];
				var uri=$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:true});
				$('#formTable').flexigrid({
				  url: uri,
				  dataType: 'json',
				  colModel : showColModel,
				  buttons : showButton,
					usepager: true,
					useRp: true,
					showTableToggleBtn: false,
					width: _flexme1_width,
					height: _flexme1_height
				});
				$('.formGrid div[class="tDiv2"]').prepend('<div class="find-dialog"><input id="queryformGridWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="queryformGridTable"></span></div>');
				$('.formGrid div[class="tDiv"]').css("border-top","1px solid #ccc");
				//利用库
				var showcols1=[
		        				{display: '序号', name : 'num', width : 40, align: 'center'}, 
		        				{display: "档号", name : 'c3', width : 60, align: 'left'},
		        				{display: "题名", name: 'c4',width : 80,align: 'left'},
		        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
		        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
		        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
		        				{display: '卷数', name: 'c9',width : 90,align: 'center',metadata:'fileCount'},
		        				{display: '件数', name: 'c10',width : 90,align: 'center',metadata:'innerFileCount'},
		        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
		        				{display: 'idParent', name: 'idParent',width : 90,align: 'center',metadata:'idParent',hide:true},
		        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'}
		        			];
				for(var i = 0;i<storeFiled.length;i++){
					for(var i = 0;i<storeFiled.length;i++){
						if(storeFiled[i].type == 'BOOLEAN'){
							showcols1.push({display:storeFiled[i].field,name:'d'+storeFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+storeFiled[i].id,sortable : true,align : 'center',process:formatValue});
						}else{
							showcols1.push({display:storeFiled[i].field,name:'d'+storeFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+storeFiled[i].id});
						}
					}
				}
				var showButton1=[
						{name: '筛选', bclass: 'filter',onpress:filterBorrowForm},
						{name: '还原数据',bclass: 'back',onpress:backIndex}
				    ];
				var uri1=$.appClient.generateUrl({ESArchiveLending:'store_json_keyWord'});
				$('#storeTable').flexigrid({
				  url: uri1,
				  dataType: 'json',
				  colModel : showcols1,
				  buttons : showButton,
					usepager: true,
					useRp: true,
					showTableToggleBtn: false,
					width: _flexme1_width,
					height: _flexme1_height
				});
				$('.storeGrid div[class="tDiv2"]').prepend('<div class="find-dialog"><input id="queryStoreGridWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="queryStoreGridTable"></span></div>');
				$('.storeGrid div[class="tDiv"]').css("border-top","1px solid #ccc");
				
			},
			cache:false
		});
		var _Staic_width = $('.formStaticGrid').width();
		var _Staic_height =$('.formStaticGrid').height()-109;
		var showButton1=[
				{name: '添加', bclass: 'add',onpress:staticItemfun}
		    ];
		$('#formStaticTable').flexigrid({
		  url:  $.appClient.generateUrl({ESUsingStatistics:'getList',type:'form'},'x'),
		  dataType: 'json',
		  colModel : [
		  			{display: '序号', name : 'num', width : 120, align: 'center'},
		  			{display: '统计方案名称', name : 'title', width : 400, align: 'left'},
		  			{display: '执行', name : 'execute', width : 100, align: 'center'},
		  			{display: '修改', name : 'modify', width : 100, align: 'center'},
		  			{display: '删除', name : 'delete', width : 100, align: 'center'}
		  			//{display: '查看', name : 'show', width : 100, align: 'center'}
		  			
		  			],
		  buttons : showButton1,
			usepager: true,
			useRp: true,
			showTableToggleBtn: false,
			width: _Staic_width,
			height: _Staic_height
		});
		
		
		var showButton2=[
		 				{name: '添加', bclass: 'add',onpress:staticItemfun}
		 		    ];
		 		$('#storeStaticTable').flexigrid({
		 		  url:  $.appClient.generateUrl({ESUsingStatistics:'getList',type:'store'},'x'),
		 		  dataType: 'json',
		 		  colModel : [
		 		  			{display: '序号', name : 'num', width : 120, align: 'center'},
		 		  			{display: '统计方案名称', name : 'title', width : 400, align: 'left'},
		 		  			{display: '执行', name : 'execute', width : 100, align: 'center'},
		 		  			{display: '修改', name : 'modify', width : 100, align: 'center'},
		 		  			{display: '删除', name : 'delete', width : 100, align: 'center'}
		 		  			//{display: '查看', name : 'show', width : 100, align: 'center'}
		 		  			
		 		  			],
		 		  buttons : showButton2,
		 			usepager: true,
		 			useRp: true,
		 			showTableToggleBtn: false,
		 			width: _Staic_width,
		 			height: _Staic_height
		 		});
		 		
//		 		$.appClient.generateUrl({ESUsingStatistics:'getList',type:'store'},'x')
		$("#queryStoreGridTable").live('click',function(){
			var keyWord = $('#queryStoreGridWord').val();
			if(keyWord=='请输入关键字' ){
				$("#storeTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'store_json_keyWord',storeCondition:''},'x'),query:{keyWord:''},newp:1}).flexReload();
				return false;
			}
			$("#storeTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'store_json_keyWord',storeCondition:storeCondition},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
		
		});
		$("#queryformGridTable").live('click',function(){
			var keyWord = $('#queryformGridWord').val();
			if(keyWord=='请输入关键字' ){
				$("#formTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:true,formCondition:formCondition},'x'),query:{keyWord:''},newp:1}).flexReload();
				return false;
			}
			$("#formTable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:true,formCondition:formCondition},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
		
		});
		 $('.fieldsForNew').live('change',function(){
			 if($(this).attr("checked")!="checked") {
				 var arr = $(this).closest('tr').find('td');
				 var i=0;
				 arr.each(function(){
					 if(i==1){
						if(count_for_sort == parseInt($(this).find('input').val())){
							count_for_sort--;
						} else{
							var num = parseInt($(this).find('input').val());
							var strs = ",";
							$('.fieldsForNew').each(function(){
								var array1 = $(this).closest('tr').find('td');
								var j= 0;
								array1.each(function(){
									if(j==0 && strs.indexOf(','+$(this).find('input').val()+',')<0){
										strs = strs+$(this).find('input').val() +",";
									}else if(j==0){
										return false;
									}
									if(j==1){
										if(parseInt($(this).find('input').val())>num){
											$(this).find('input').val(parseInt($(this).find('input').val())-1);
										}
										return false;
									}
									j++;
								});
								
							});
							count_for_sort--;
						}
						$(this).find('input').val('');
					 }
					 if(i>2){
						 $(this).find('input').attr("checked",false);
					 }
					i++;
				 });
			 }else{
				 var arr = $(this).closest('tr').find('td');
				 var i=0;
				 count_for_sort ++;
				 arr.each(function(){
					 if(i==1){
						 $(this).find('input').val(count_for_sort);
						 return;
					 }
					i++;
				 });
			 }
		 });
});


//删除统计方案
function delCollection(id)
{
	$.dialog({
		content:'确定要删除吗?',
		ok:true,
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function()
		{
			var url=$.appClient.generateUrl({ESUsingStatistics:'deletePlan'},'x');
			$.get(url,{planId:id},function(data){
				if(data){
					$.dialog.notice({width: 150,content: '数据删除成功',icon: 'success',time: 3});
					if(staticType == 'form'){
						$("#formStaticTable").flexReload();
					}else{
						$("#storeStaticTable").flexReload();
					}
				} else {
					$.dialog.notice({width: 150,content: '数据删除失败',icon: 'error',time: 3});
				}
			});
		}
	
	
	});
}
//编辑
function modifyCollection(id,name)
{
	$.ajax({
		url: $.appClient.generateUrl({ESUsingStatistics:'modifyPlan',type:staticType},'x'),
		type:"POST",
		data:'planId='+id+'&name='+name,
		success:function(data){
			$.dialog({
				id:'artModifyCollextionPanel',
				title:'修改统计方案',
				fixed:false,
				resize:false,
				content:data,
				ok:function(){
					var formObj=$('#addPlan');
					var data={};
					var temp=[];
					$('tr:gt(0)',formObj).each(function(i){
						if($('input:checked',this).length>0){
							var _id = null;
							if($('input:eq(0)',this).attr('_id') != undefined) {
								_id = $('input:eq(0)',this).attr('_id');
							}
							var fieldVal=$('input:eq(0)',this).val();
							var is_output=$('input:eq(0)',this).attr('checked')?'true':'false';
							var display=$('input:eq(0)',this).closest('td').text();
							var sortNum=$('input[name="sortNum"]',this).val()?$('input[name="sortNum"]',this).val():0;
							var sortRule=$('[name="sortRule"]',this).val()?$('[name="sortRule"]',this).val():'asc';
							var count=$('[name="rule"]:checked',this).val()?'true':'false';
							var count='rule:'+ ($('[name="rule"]:checked',this).val()?'true':'false');
							 count=count + "|sum:" + ($('[name="sum"]:checked',this).val()?'true':'false');
							 count=count + "|pre:" + ($('[name="pre"]:checked',this).val()?'true':'false');
							 count=count + "|max:" +( $('[name="max"]:checked',this).val()?'true':'false');
							 count=count + "|min:" + ($('[name="min"]:checked',this).val()?'true':'false');
							temp.push({'id':_id,'term':fieldVal,'outputSort':sortNum,'sort':sortRule,'display':display,'count_number':count,'is_output':is_output});
						}
						
					});
					data.id = id;
					data.name=$("input[name='name']",formObj).val();
					data.item=temp;
					var url=$.appClient.generateUrl({ESUsingStatistics:'doPlan'},'x');
					$.post(url,{data:data},function(result){
						if(result){
							$.dialog.notice({content:'编辑成功',icon:'succeed',time:2});
							if(staticType == 'form'){
								$("#formStaticTable").flexReload();
							}else{
								$("#storeStaticTable").flexReload();
							}
						}
					});
					return true;						
				},
				okVal:'保存',
				cancel:true,
				cancelVal:'关闭'
			});
		},
		cache:false
	});
}
function exeCollection(id){
	var html  ="<div id='showDataTable'></div>"
	 $.dialog({
		 title:'统计结果',
		 fixed:true,
		 resize:false,
		 content:html,
		 padding:'0',
		 width:500,
		 height:400,
		 init:function(){
			var url = $.appClient.generateUrl({ESUsingStatistics:'getStaticColModel',id:id},'x'); 
			$.ajax({
				  url:url,
				  dataType: 'json',
				  success:function(data){
					  var array= [];
					  var arr = data.item;
					  var colMs = [];
					  var array_name =[];
					  for(var i=0;i<arr.length;i++){
						  colMs.push({display: arr[i].display, name : arr[i].term, width : 120, align: 'center'});
						  array.push(arr[i].term);
						  array_name.push(arr[i].term+":"+arr[i].display)
						  if(arr[i].count_number.indexOf('true')>0){
							  for(var j=0;j<arr[i].count_number.split('|').length;j++){
								  var vs = arr[i].count_number.split('|')[j];
								  if(vs.split(':')[1]=='true'){
									  if(vs.split(':')[0] == 'rule'){
										  colMs.push({display: arr[i].display+"(计数)", name : 'count('+arr[i].term+')', width : 120, align: 'center'});
										  array.push('count('+arr[i].term+')');
										  array_name.push('count('+arr[i].term+')'+":"+arr[i].display+"(计数)");
									  }else if(vs.split(':')[0] == 'sum'){
										  colMs.push({display: arr[i].display+"(合计)", name : 'sum('+arr[i].term+')', width : 120, align: 'center'});
										  array.push('sum('+arr[i].term+')');
										  array_name.push('sum('+arr[i].term+'):'+arr[i].display+"(合计)");
									  }else if(vs.split(':')[0] == 'pre'){
										  colMs.push({display: arr[i].display+"(均值)", name : 'AVG('+arr[i].term+')', width : 120, align: 'center'});
										  array.push('AVG('+arr[i].term+')');
										  array_name.push('AVG('+arr[i].term+'):'+arr[i].display+"(均值)");
									  }else if(vs.split(':')[0] == 'max'){
										  colMs.push({display: arr[i].display+"(最大值)", name : 'max('+arr[i].term+')', width : 120, align: 'center'});
										  array.push('max('+arr[i].term+')');
										  array_name.push('max('+arr[i].term+'):'+arr[i].display+"(最大值)");
									  }else if(vs.split(':')[0] == 'min'){
										  colMs.push({display: arr[i].display+"(最小值)", name : 'min('+arr[i].term+')', width : 120, align: 'center'});
										  array.push('min('+arr[i].term+')');
										  array_name.push('min('+arr[i].term+'):'+arr[i].display+"(最小值)");
									  }
								  }
							  }
						  }
					  }
					  var keyWord = '';
					  if(staticType=='form'){
						keyWord = $('#queryformGridWord').val();
				    	if(keyWord=='请输入关键字' ){
				    		keyWord ='';
				    	}
					  }else{
						  keyWord = $('#queryStoreGridWord').val();
					    	if(keyWord=='请输入关键字' ){
					    		keyWord ='';
					    	}
					  }
					  showButton1= [
					                {name: '输出',bclass: 'back',onpress:function(){
					                	var fs1 = array.join('|');
					                	var fs2 = array_name.join("|");
					                	var url1 = $.appClient.generateUrl({ESUsingStatistics:'printFile',id:id,fs1:fs1,condition:staticType=='form'?formCondition:storeCondition,type:staticType},'x'); 
					                	$.dialog.notice({width: 150,content: '查看消息提示进行下载！',icon: 'success'});
					                	$.ajax({
					      				  url:url1,
					      				 type:"POST",
					      				 data:{fs2:fs2,keyWord:keyWord},
					      				  success:function(data){
//					      					  fileName
//					      					  $.dialog.notice({width: 150,content: '<a href="'+data+'">下载打印统计</a>',icon: 'face-smile'});
					      				  }
					                	});
					                }}
					                ];
					  
				    	var fs = array.join('|');
					  var url1 = $.appClient.generateUrl({ESUsingStatistics:'getStaticDataForCol',id:id,fs:fs,condition:staticType=='form'?formCondition:storeCondition,type:staticType},'x'); 
					  $('#showDataTable').flexigrid({
						  url:  false,
						  dataType: 'json',
						  colModel : colMs,
			              buttons : showButton1,
			              showTableToggleBtn: false,
			              width: 470,
			              height: 300
					  });
				    	$('#showDataTable').flexOptions({url:url1,query:{keyWord:keyWord}}).flexReload();
				    	$('.flexigrid div.tDiv').css("border-top","1px solid #ccc");
				  }
			});
		}
	});
	//利用库
	
	
	
}

function formatValue(tdDiv){
	
	if(tdDiv.innerHTML == "&nbsp;"){
		tdDiv.innerHTML = "";
		return;
	}
	
	if(tdDiv.innerHTML=='1')
		tdDiv.innerHTML='是';
	else 
		tdDiv.innerHTML='否';
}
//shimiao 20140805 检索条件
$('.newfilter').die().live('click',function (){
	  var t =   $(this).parent().clone().insertAfter($(this).parent());
		t.each(function(){
			$(this).find('input').val('');
		});
		
	});

	$('.delfilter').die().live('click',function (){
		if($('#addrolefree p').length > 6){
			$(this).closest('p').remove();
		}else{
			var tds = $(this).closest('p');
			tds.find('input').val('');
			var select = tds.find('select');
			var i = 0;
			select.each(function(){
				if(i==0){
					$(this).val("");
				}
				if(i==1){
					$(this).val('like');
				}
				if(i==2){
					$(this).val('AND');
				}
				i++;
			});
		}
	});

/***var winW=$(window).width();
var width='auto';
if($.browser.msie && $.browser.version==='6.0'){
	width=winW-$(".esleft").width()-5;
}
var height='';
var winH=$(window).height();
var height=winH-222;

	$("#statistics").flexigrid({
		url: $.appClient.generateUrl({ESUsingStatistics:'getList'},'x'),
		dataType: 'json',
		colModel : [
			{display: '序号', name : 'num', width : 120, align: 'center'},
			{display: '统计方案名称', name : 'title', width : 400, align: 'left'},
			{display: '执行', name : 'execute', width : 100, align: 'center'},
			{display: '修改', name : 'modify', width : 100, align: 'center'},
			{display: '删除', name : 'delete', width : 100, align: 'center'}
			//{display: '查看', name : 'show', width : 100, align: 'center'}
			
			],
		buttons : [
			{name: '添加', bclass: 'add',onpress:add}
			],		
		usepager: true,
		title: '统计方案列表',
		useRp: true,
		width: width,
		height: height
	});	
//添加利用统计
function add()
{
	$.ajax({
	    url: $.appClient.generateUrl({ESUsingStatistics:'setCondition'},'x'),
	    type:"POST",
	    success:function(data){
	    	$.dialog({
	    		id:'addPanel',
				title:'设置统计方案',
				content:data,
				width:'50%',
				padding:'5px 20px',
				height:'60%',
				okVal:'保存',
				ok:function(){
					var formObj=$('#addPlan');
					var data={};
					var temp=[];
					$('tr:gt(0)',formObj).each(function(i){
						if($('input:checked',this).length>0){
							var fieldVal=$('input:eq(0)',this).val();
							var is_output=$('input:eq(0)',this).attr('checked')?'true':'false';
							var display=$('input:eq(0)',this).closest('td').text();
							var sortNum=$('input[name="sortNum"]',this).val()?$('input[name="sortNum"]',this).val():0;
							var sortRule=$('[name="sortRule"]',this).val()?$('[name="sortRule"]',this).val():'asc';
							var count=$('[name="rule"]:checked',this).val()?'true':'false';
							temp.push({'term':fieldVal,'outputSort':sortNum,'sort':sortRule,'display':display,'count_number':count,'is_output':is_output});
						}

					});
					data.name=$("input[name='name']",formObj).val();
					data.item=temp;
					var url=$.appClient.generateUrl({ESUsingStatistics:'savePlan'},'x');
					$.post(url,{data:data},function(result){
						if(result){
							$.dialog.notice({content:'添加成功',icon:'succeed',time:2});
							$("#statistics").flexReload();
						}
					});
						return false;
					},
				cancel:true,
				cancelVal:'关闭'
		    });
		   },
		    cache:false
	});
}
 //删除统计方案
 function delCollection(id)
 {
 	$.dialog({
 		content:'确定要删除吗?',
		ok:true,
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function()
		{
			var url=$.appClient.generateUrl({ESUsingStatistics:'deletePlan'},'x');
			$.get(url,{planId:id},function(data){
				if(data){
					$.dialog.notice({width: 150,content: '数据删除成功',icon: 'success',time: 3});
					$("#statistics").flexReload();
				} else {
					$.dialog.notice({width: 150,content: '数据删除失败',icon: 'error',time: 3});
				}
				});
		}
 		
 	
 	})
 }
 //编辑
 function modifyCollection(id,name)
 {
 			$.ajax({
		    url: $.appClient.generateUrl({ESUsingStatistics:'modifyPlan'},'x'),
		    type:"POST",
		    data:'planId='+id+'&name='+name,
		    success:function(data){
		    	$.dialog({
			    	id:'artModifyCollextionPanel',
			    	title:'修改统计方案',
		    	   	fixed:false,
		    	    resize:false,
			    	content:data,
			    	ok:function(){
						var formObj=$('#addPlan');
						var data={};
						var temp=[];
						$('tr:gt(0)',formObj).each(function(i){
							if($('input:checked',this).length>0){
								var _id = null;
								if($('input:eq(0)',this).attr('_id') != undefined) {
									_id = $('input:eq(0)',this).attr('_id');
								}
								var fieldVal=$('input:eq(0)',this).val();
								var is_output=$('input:eq(0)',this).attr('checked')?'true':'false';
								var display=$('input:eq(0)',this).closest('td').text();
								var sortNum=$('input[name="sortNum"]',this).val()?$('input[name="sortNum"]',this).val():0;
								var sortRule=$('[name="sortRule"]',this).val()?$('[name="sortRule"]',this).val():'asc';
								var count=$('[name="rule"]:checked',this).val()?'true':'false';
								temp.push({'id':_id,'term':fieldVal,'outputSort':sortNum,'sort':sortRule,'display':display,'count_number':count,'is_output':is_output});
							}

						});
						data.id = id;
						data.name=$("input[name='name']",formObj).val();
						data.item=temp;
						var url=$.appClient.generateUrl({ESUsingStatistics:'doPlan'},'x');
						$.post(url,{data:data},function(result){
							if(result){
								$.dialog.notice({content:'编辑成功',icon:'succeed',time:2});
								$("#statistics").flexReload();
							}
						});
							return true;						
				    },
			    	okVal:'保存',
			    	cancel:true,
			    	cancelVal:'关闭'
			    });
			   },
			    cache:false
		});
 }

 //生成excel文件
 function exeCollection(id)
 {
 	 	$.dialog({
 	 	id:'artExeCollectionPanel',
 		content:'<input id="2003" type="radio" name="style" checked="true" value="2003" style="float:left"><label for="2003" style="float:left">Microsoft Excel 2003</label><br><br><input id="2007" type="radio" name="style" value="2007" style="float:left"><label for="2007" style="float:left">Microsoft Excel 2007</label>',
		title:'选择打印的版本',
		ok:true,
		width:'200px',
		okVal:'确定',
		cancel:true,
		cancelVal:'取消',
		ok:function()
		{
			
			var version=$('input[name="style"]:checked').val();
			if(!version){$.dialog.notice({content:'请选择打印的版本',icon:'warning',time:3});return false;}
			var url=$.appClient.generateUrl({ESUsingStatistics:'executePlan',planId:id,version:version},'x');
			$.dialog.notice({width: 150,content: '<a href="'+url+'">下载打印报表</a>',icon: 'success'});
		}
 		
 	
 	})
 }**/