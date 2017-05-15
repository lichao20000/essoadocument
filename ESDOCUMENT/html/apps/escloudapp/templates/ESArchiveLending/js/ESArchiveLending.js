(function (window){
	
	var getId = function ( elementId ){
		
		return document.getElementById( elementId );
		
	};
	
	window._initSize = function (){
		var width = document.documentElement.clientWidth*0.96,height = document.documentElement.clientHeight-144;
		var leftWidth = 220,rightWidth = width-230;
		var leftDiv_ = getId('leftDiv'),rightDiv_ = getId('rightdiv');
			rightDiv_.style.width = rightWidth + 'px'; // 右div宽度
			rightDiv_.style.height = height + 'px';
			leftDiv_.style.height =  height-3 + 'px'; // 左右div高度
			window._size = {tbl: {width: rightWidth, height:height-300}, rule: {width: rightWidth, height:height-155}};
			getId('usingTreeDemo').style.padding = '0px';
			getId('usingTreeDemo').style.height = height-40 +"px";
	};
	
})(window);
_initSize();
function hideCata() {
	$("#catagory").fadeOut("fast");
}
function clickBodyDown(event) {
	if (!(event.target.id == "catagory" || event.target.id == "fication" || $(event.target).parents("#catagory").length>0)) {
		hideCata();
	}
}
//shimiao 20140527 为了使用卷数和件数
function checkFileCount(name){
	var reg=/^[0-9]\d*$/;
	var text = $("input[name='"+name+"']");
	if(!reg.test(text.val())){
		text.val("") ;
		return false;
	}else{
		var name1 = name.split('Count')[1];
		if(parseInt(text.val())>parseInt($("input[name='innerFileCount"+name1+"']").val())){
			text.addClass("invalid-text").attr("title","卷数不能超过件数");
			return false;
		}
	}
	text.removeClass("invalid-text").attr("title","");
}


var jmz = {};
jmz.GetLength = function(str) {
    ///<summary>获得字符串实际长度，中文2，英文1</summary>
    ///<param name="str">要获得长度的字符串</param>
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
};

//借阅明细列表添加行
function addLineDetail(){
	var nums='';
	var trs=$("#borrowDetails").find("input[name='id3']");
	nums=trs.length+1;
	var tJson = {'num':nums,
			'id3':'<input type="checkbox" name="id3" id=""  value="'+'||实体"/>',
			'c3':'<div style="width:100px;height:11px;" onclick="editName(this)"></div>',
			'c4':'<div style="width:100px;height:11px;" onclick="editName(this)"></div>',
			'c5':'实体',
			'c6':'未借阅',
			'c9':'<input name="fileCount'+nums+'" type="text" size="12" value="0" onkeyup="checkFileCount(this.name)" placeholder="请输入卷数"/>',
			'c10':'<input name="innerFileCount'+nums+'" type="text" size="12" value="1" placeholder="请输入件数"/>',
			'c7':'<input name="mark" type="text" size="12" value="" placeholder="请填写备注"/>'
		   };
	  var tStr = JSON.stringify(tJson);
	  tStr = tStr.substr(0,tStr.length-1);
	  tStr = DetailsFieldsShow(tStr,nums);
	  tStr += "}";
	$("#borrowDetails").flexExtendData([{"id":'demo',"cell":JSON.parse(tStr)}]);
	DetailValueBlur();
}
function editName(obj){
 	if($('input',$(obj)).length>0){return;}
 	var tdObj=$(obj).closest("td");
 	tdObj.children().bind('click',function(){
 		editNameT(this);
 	});
 	var _Iheight=tdObj.children().width()-10;
 	var html=$(obj).text();
 	var Ival='';
 	var input=document.createElement('input');
 	input.style.width=_Iheight+'px';
 	input.style.height='14px';
 	input.value=html;
 	$(obj).replaceWith(input);
 	$(input).focus();
 	$(input).select();
 	input.onblur=function(){
 		$(this).replaceWith($(obj));
 		Ival=this.value;
 		$(this).parent().remove();
 		tdObj.children().text(Ival);
 	};
}
function editNameT(obj){
 	if($('input',$(obj)).length>0){return;}
 	var tdObj=$(obj).closest("td");
	var _Iheight=tdObj.children().width()-10;
 	var html=$(obj).text();
 	var input=document.createElement('input');
 	input.style.width=_Iheight+'px';
 	input.style.height='14px';
 	input.value=html;
 	$(obj).empty().append(input);
 	$(input).focus();
 	$(input).select();
 	input.onblur=function(){
 		obj.innerHTML=this.value;
 	};
}
//判断实体借阅与实体借出时是否在库
$(":radio",$("#borrowDetails")).die().live('change',function(){
	var trObj=$(this).closest('tr');
	var checkedpath = trObj.find("input[name='id3']").val();
	if(checkedpath!=''){
		if(checkedpath.indexOf('|')!=-1){
			 var checkpath=checkedpath.split('|');
			 checkedpath=checkpath[0];
		}
		if(checkedpath!=''){
			var path=checkedpath;
			var thisobj = $(this);
			var url = $.appClient.generateUrl({ESArchiveLending:'getState'},'x');
			$.ajax({
				url:url,
				data:"path=" + path,
				type:'post',
				cache:false,
				success:function(data){
					if(data){
						thisobj.attr({checked:"checked"});
					} else {
						if(thisobj.val()=='电子借阅'){
							thisobj.attr({checked:"checked"});
							thisobj.siblings().attr({disabled:"disabled"});
						}else{
							thisobj.attr({checked:false,disabled:"disabled"});
							thisobj.siblings().eq(1).attr({checked:false,disabled:"disabled"});
							thisobj.siblings().eq(0).attr({checked:"checked"});
						}
						$.dialog.notice({title:'操作提示',content:'此实体档案已经借出！',icon:'warning',time:3});
					}
				}
			});
		}
	}
});
var archiveType='';
//在未提交或已退回時編輯數據時添加借閱明細
function addEditDetails(){
	var url=$.appClient.generateUrl({ESArchiveLending:'record'},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    var linkdialog=$.dialog({
	    	title:'添加借阅明细',
	    	width: '800px',
	    	height:'380px',
	    	padding:'0px',
    	   	fixed:  true,
    	    resize: false,
    	    okVal:'保存',
		    ok:true,
		    cancelVal: '取消',
		    cancel: true,
	    	content:data,
	    	ok:function()
	    	{
				linkBorrowDetail();
				return false;
			},
			init:createFileTree
		 });
    	// 挂接借阅文件信息
		function linkBorrowDetail(){
			var ACode='';
			var title='';
			var files = [];
			var oValues=[];
			var checkboxs = $("#borrowlist").find("input[name='path']:checked");
			if (checkboxs.length > 0 ){
				var nums='';
				var types=[];
				var voidTypes='';
				var paths = [];
				var usingformId='';
				//根据元数据获取相应的标题top
				var ACodeName='';
				var ACodeMeta='';
				var titleName='';
				var titleMeta='';
				var idParent = 'idParent';
				ACodeMeta='ArchivalCode';
				titleMeta='Title';
				ACodeName=$("#borrowlist").flexGetColumnDisplay(['ArchivalCode']);
				titleName=$("#borrowlist").flexGetColumnDisplay(['Title']);
				//根据元数据获取相应的标题top
				var trs=$("#borrowDetails").find("input[name='id3']");
				var metadataValue = [];
				var detailsOtherValue = [];
				nums=trs.length;
				if(nums==0){
					var ModleCol=[
									{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
			        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
			        				{display: "档号", name : 'c3', width : 60, align: 'left',metadata:'ArchivalCode'},
			        				{display: "题名", name: 'c4',width : 80,align: 'left',metadata:'Title'},
			        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
			        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
			        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
			        				{display: '应归还日期', name: 'shouldReturnDate',width : 60,align: 'center',metadata:'shouldReturnDate'},
			        				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true},
			        				{display: '归还日期', name: 'c12',width : 60,align: 'center',metadata:'RETURN_DATE'},
			        				{display: '卷数', name: 'c9',width : 90,align: 'center',metadata:'fileCount'},
			        				{display: '件数', name: 'c10',width : 90,align: 'center',metadata:'innerFileCount'},
			        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
			        				{display: 'idParent', name: 'idParent',width : 90,align: 'center',metadata:'idParent',hide:true},
			        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'}
							];
					for(var i = 0;i<storeFiled.length;i++){
						ModleCol.push({display:storeFiled[i].field,name:'d'+storeFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+storeFiled[i].id});
						if(storeFiled[i].metadata != null && storeFiled[i].metadata!= 'undefined' && storeFiled[i].metadata!= ''){
							if($("#borrowlist").flexGetColumnDisplay([storeFiled[i].metadata]) != null && storeFiled[i].metadata != 'undefined' && storeFiled[i].metadata != ''&& $("#borrowlist").flexGetColumnDisplay([storeFiled[i].metadata]).length>0){
								metadataValue.push({md:[storeFiled[i].metadata],fv:'c'+storeFiled[i].id});
							}
						}
					}
					var buttonCol=[
								{name: '选择系统档案', bclass: 'add',onpress:addEditDetails},
	    		        		{name: '手工录入', bclass: 'add',onpress:addLineDetail},
	    		        		{name: '删除', bclass: 'delete',onpress:delEditDetails},
	    		        		{name: '借阅', bclass: 'tranlist',onpress:changeStatus},
	    		        		{name: '借出', bclass: 'export',onpress:changeStatus},
	    		        		{name: '续借', bclass: 'export',onpress:changeStatusForRelend},
	    		        		{name: '归还', bclass: 'back',onpress:changeStatus}
						];
					$(".bottom").html('<table id="borrowDetails"></table>');
					$("#borrowDetails").flexigrid({
						url:false,
						dataType: 'json',
						editable: true,
						colModel : ModleCol,
						buttons : buttonCol,
	    				showTableToggleBtn: false,
	    				width: 620,
	    				height: 220
					});
					$("#borrowDetails").flexReload();
					$('.bottom div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">利用库数据</span>');
					$('.bottom div[class="tDiv"]').css("border-top","1px solid #ccc");
				}else{
					trs.each(function(){
						var path=$(this).val();
						var bpath=path.split('|');
						usingformId=bpath[1];
						paths.push(bpath[0]);
						types.push(bpath[2]);
					});
					paths=paths.join(',');
					voidTypes=types.join('');
					for(var i = 0;i<storeFiled.length;i++){
						if(storeFiled[i].metadata != null && storeFiled[i].metadata!= 'undefined' && storeFiled[i].metadata!= ''){
							if($("#borrowlist").flexGetColumnDisplay([storeFiled[i].metadata]) != null && storeFiled[i].metadata != 'undefined' && storeFiled[i].metadata != ''&& $("#borrowlist").flexGetColumnDisplay([storeFiled[i].metadata]).length>0){
								metadataValue.push({md:[storeFiled[i].metadata],fv:'c'+storeFiled[i].id});
							}
						}
					}
				}
				if(usingformId==''){
					usingformId=idm;
				}
				checkboxs.each(function(){
					var trObj=$(this).closest('tr');
					var checkpath = $(this).val();
					if(paths.length>0){
						if (paths.indexOf(checkpath)==-1) {
							ACode=$("#borrowlist").flexGetColumnValue(trObj,[ACodeMeta]);
	    		         	title=$("#borrowlist").flexGetColumnValue(trObj,[titleMeta]);
	    		         	var idParentNum=$("#borrowlist").flexGetColumnValue(trObj,[idParent]);
	    					files.push(ACode+'|'+title+'|'+checkpath+'|'+idParentNum);
	    					 var vstr = "";
	    					 for(var j= 0 ;j<metadataValue.length;j++){
	    						 var dv=$("#borrowlist").flexGetColumnValue(trObj,[metadataValue[j].md]); 
	    						 vstr = vstr +";"+  metadataValue[j].fv+":"+dv;
	    					 }
	    					 if(vstr.length>0){
	    						 detailsOtherValue.push(vstr.substring(1));
	    					 }
						}
					}else{
						ACode=$("#borrowlist").flexGetColumnValue(trObj,[ACodeMeta]);
    		         	title=$("#borrowlist").flexGetColumnValue(trObj,[titleMeta]);
    		         	var idParentNum=$("#borrowlist").flexGetColumnValue(trObj,[idParent]);
    					files.push(ACode+'|'+title+'|'+checkpath+'|'+idParentNum);
    					 var vstr = "";
    					 for(var j= 0 ;j<metadataValue.length;j++){
    						 var dv=$("#borrowlist").flexGetColumnValue(trObj,[metadataValue[j].md]); 
    						 vstr = vstr +";"+  metadataValue[j].fv+":"+dv;
    					 }
    					 if(vstr.length>0){
    						 detailsOtherValue.push(vstr.substring(1));
    					 }
					}
				});
				files=files.join(',');
				detailsOtherValue = detailsOtherValue.join(',');
				if(files==''){
					$.dialog.notice({title:'操作提示',content:'您添加的数据重复，请重新选择！',icon:'warning',time:3});
					return false;
				}else{
					$.post($.appClient.generateUrl({ESArchiveLending:'linkBorrowDetailsTwo'},'x'),{usingformId:usingformId,nums:nums,files:files,archiveType:archiveType,detailsOtherValue:detailsOtherValue}, function(data){
						if(data){
							$("#borrowDetails").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'showDetails',idm:idm},'x')}).flexReload();	
							DetailValueBlur();
							linkdialog.close();
						}
					},'json');
				}
			}else{
				$.dialog.notice({title:'操作提示',content:'请选择您要添加的数据！',icon:'warning',time:3});
				return false;
			}
		};
		},
		cache:false
	});
}
function DetailsFieldsShow(tStr,nums){
	for(var i=0;i<storeFiled.length;i++){
		 tStr +=',\"d' +storeFiled[i].id +"\":\"" ;
		 if(storeFiled[i].propValue != '' && storeFiled[i].propValue !=null && storeFiled[i].propValue !=undefined ){
			 tStr += "<select style='width:80px;' name='c"+storeFiled[i].id+nums+"' id='d"+storeFiled[i].id+nums+"' class='d"+storeFiled[i].id+"' >"
			 tStr +=  "<option value=''>--请选择--</option>";
			 for(var t=0;t<storeFiled[i].propValue.length;t++){
				 tStr += "<option value='"+storeFiled[i].propValue[t].identifier+"'>"+storeFiled[i].propValue[t].title+"</option>";
			 }
			 tStr +=  "</select>\"";
		 }else if(storeFiled[i].type== 'TEXT' || storeFiled[i].type== 'NUMBER' || storeFiled[i].type== 'FLOAT'){
			 tStr += "<input style='width:80px;' name='c"+storeFiled[i].id+nums+"' class='d"+storeFiled[i].id+"' id='d"+storeFiled[i].id+nums+"'  type='text' size='"+storeFiled[i].length+"' value='' />\""
		 }else if(storeFiled[i].type== 'BOOLEAN'){
			 tStr += "<select  name='c"+storeFiled[i].id+nums+"' id='d"+storeFiled[i].id+nums+"'class='d"+storeFiled[i].id+"' style='width:80px;'>"
			 tStr +=  "<option value='0'>否</option>";
			 tStr +=  "<option value='1'>是</option></select>\"";
		 }else if(storeFiled[i].type== 'DATE'){
			 tStr += "<input style='width:80px;' name='c"+storeFiled[i].id+nums+"' class='Wdate' id='d"+storeFiled[i].id+nums+"' class='d"+storeFiled[i].id+"' type='text' size='"+storeFiled[i].length+"' value='' />\""
		 }else if(storeFiled[i].type== 'TIME'){
			 tStr += "<input style='width:80px;' name='c"+storeFiled[i].id+nums+"' class='Wdate1' id='d"+storeFiled[i].id+nums+"' class='d"+storeFiled[i].id+"' type='text' size='"+storeFiled[i].length+"' value='' />\""
		 }
	}
	return tStr;
}
/**   liuhezeng 20140929 判断字符串长度    **/
function getByteLen(val) {    //传入一个字符串
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        if (val[i].match(/[^\x00-\xff]/ig) != null) //全角 
            len += 2; //如果是全角，占用两个字节
        else
            len += 1; //半角占用一个字节
    }
    return len;
 } 

function DetailValueBlur(){
	var data = storeFiled;
	for(var i=0;i<data.length;i++){
		   var id = data[i].id;
		   if(data[i].type== 'TEXT'){
			   $(".d"+id).attr('l1',parseInt(data[i].length));
			   $(".d"+id).attr('isNull',parseInt(data[i].isNull));
			   $(".d"+id).blur(function(){
				   var id = this.id;
				   var l1 = $(this).attr('l1');
				   var isNull = $(this).attr('isNull');
				   var length  = getByteLen($("#"+id).val());
					if( isNull == 1 &&　 $("#"+id).val()==''){
						$("#"+id).addClass("invalid-text").attr("title","此项不能为空");
						return false;
					}else if(length > l1){
						$("#"+id).addClass("invalid-text").attr("title","该输入输入项的长度限制在"+parseInt(l1/2)+"个汉字以内");
						return false;
						}
					$(this).removeClass("invalid-text").attr("title","");
				   });
				
		   }else if(data[i].type=='NUMBER'){
			   var reg=/^[0-9]*$/;
			   $(".d"+id).attr('l1',parseInt(data[i].length));
			   $(".d"+id).attr('isNull',parseInt(data[i].isNull));
			   $(".d"+id).blur(function(){
				   var id = this.id;
				   var length  = getByteLen($("#"+id).val());
				   var l1 = $(this).attr('l1');
				   var isNull = $(this).attr('isNull');
				   if(!reg.test(this.value) && (this.value!='')){
				   		$("#"+id).val('');
						return false;
				   }else if( isNull == 1 &&　 $("#"+id).val()==''){
						$("#"+id).addClass("invalid-text").attr("title","此项不能为空");
						return false;
					}else if(length > l1){
						$("#"+id).addClass("invalid-text").attr("title","该输入输入项的长度限制在"+l1+"个数字以内" );
						return false;
						}
				   $(this).removeClass("invalid-text").attr("title","");
			   });
		   }else if(data[i].type== 'FLOAT'){
			   $(".d"+id).attr('l1',parseInt(data[i].length));
			   $(".d"+id).attr('l2',parseInt(data[i].doLength));
			   $(".d"+id).attr('isNull',parseInt(data[i].isNull));
			   var s = "";
			   for(var t=0;t<parseInt(l1-l2);t++){
					s +="X";
				   }
			   for(var t=0;t<parseInt(l2);t++){
				   if(i==0){
					   s +=".";
				   } 
					s +="X";
			   }
			   $(".d"+id).attr('s',s);
			   $(".d"+id).blur(function(){
				   var id = this.id;   
				   var l1 = $(this).attr('l1');
				   var l2 = $(this).attr('l2');
				   var s = $(this).attr('s');
				   var isNull = $(this).attr('isNull');
				   var str="/^[0-9]{1,"+(parseInt(l1)-parseInt(l2))+"}(\\.[0-9]{1,"+l2+"}){0,1}$/";
				   str = str.replace(/\/\//g,"\/");
				   var reg = eval(str);
				   if(!reg.test(this.value) && (this.value!='')){
				   		$("#"+id).addClass("invalid-text").attr("title",'输入值非法！正确格式：'+ s);
						return false;
				   }else if( isNull == 1 &&　 $("#c"+id).val()==''){
						$("#"+id).addClass("invalid-text").attr("title","此项不能为空");
						return false;
							}
					if(parseInt(l2)>0){
						if(this.value.indexOf(".")>0){
							var v = this.value;
							var tg = this.value.split('.')[1].length;
							for(var t= 0;t<(parseInt(l2)-tg);t++){
								v += '0';
							}
							$("#"+id).val(v);
						}else{
							var v = this.value+'.';
							for(var t= 0;t<l2;t++){
								v += '0';
							}
						$("#"+id).val(v);
						}
					}
				   $(this).removeClass("invalid-text").attr("title","");
			   });
			}else if(data[i].type== 'DATE'){
				var isNull = parseInt(data[i].isNull);
				$('.Wdate[name="c'+id+'"]').attr('isNull',isNull);
				$('.Wdate[name="c'+id+'"]').blur(function(){
					var id = $(this).attr('id');
					   var isNull = $(this).attr('isNull');
						if( isNull == 1 &&　 $("#"+id).val()==''){
							$("#"+id).addClass("invalid-text").attr("title","此项不能为空");
							return false;
						}else{
							$(this).removeClass("invalid-text").attr("title","");
						}
				});
			}else if(data[i].type== 'TIME'){
				var isNull = parseInt(data[i].isNull);
				$('.Wdate1[name="c'+id+'"]').attr('isNull',isNull);
				$('.Wdate1[name="c'+id+'"]').blur(function(){
					var id = $(this).attr('id');
					   var isNull = $(this).attr('isNull');
						if( isNull == 1 &&　 $("#"+id).val()==''){
							$("#"+id).addClass("invalid-text").attr("title","此项不能为空");
							return false;
						}else{
							$(this).removeClass("invalid-text").attr("title","");
						}
				});
			}else{
				 var isNull = parseInt(data[i].isNull);
				 $(".d"+id).attr('isNull',isNull);
				 $(".d"+id).blur(function(){
					  var id = $(this).attr('id');
				   var isNull = $(this).attr('isNull');
					if( isNull == 1 &&　 $("#"+id).val()==''){
						$("#"+id).addClass("invalid-text").attr("title","此项不能为空");
						return false;
					}else{
						$(this).removeClass("invalid-text").attr("title","");
					}
				   });
			}
				
		 }
	
		$("input[name='mark']").keyup(function(){
			if(getByteLen($(this).val())>200){
				$(this).addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
				return false;
			}
			$(this).removeClass("invalid-text").attr("title","");
		});
		$('.Wdate').die().live('click', function (){WdatePicker({dateFmt:'yyyy-MM-dd'});});
		$('.Wdate1').die().live('click', function (){WdatePicker({dateFmt:'HH:mm:ss'});});
}
//在未提交或已退回時編輯數據時去除挂接借阅文件信息
function delEditDetails(){
	var checkboxes=$("#borrowDetails").find("input[name='id3']:checked");
	if(checkboxes.length==0){
		$.dialog.notice({content:"请选择要删除的数据！",icon:"warning",time:3});
		return false;
	}else{
		var sign=0;
		var borrowOuts=[];
	}
	if(sign==0){
		$.dialog({
			content:'确认要删除吗?',
			ok:true,
			okVal:'确认',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				if(checkboxes.length > 0){
					var ids=[];
					var usingFormId='';
					var ID='';
					checkboxes.each(function(){
						var checkboxVal=$(this).val();
						var checkPathVal=checkboxVal.split('|');
						usingFormId=checkPathVal[1];
						ID=$(this).attr('id');
						if(checkPathVal[0]=='' && ID==''){
							$(this).closest("tr").remove();
						}else{
							ids.push(ID);
						}
					});
					ids=ids.join(',');
					if(ids!=''){
						var url=$.appClient.generateUrl({ESArchiveLending:'delDetails'},'x');
						$.get(url,{usingFormId:usingFormId,ids:ids},function(data){
							if(data==1){
								$("input[name='ids3']").attr('checked',false);
								$.dialog.notice({width:150,icon:'succeed',content:'数据删除成功!',time:3,title:'3秒后自动关闭!'});
								$("#borrowDetails").flexOptions({newp:1}).flexReload();
								$.post($.appClient.generateUrl({ESArchiveLending:'getLastTotal'},'x'),{idm:idm},function(result){
									if(result==0){
										archiveType='';
										$(".bottom").html('<table id="borrowDetails"></table>');
										var showCol = [
														{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
								        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
								        				{display: '档号', name : 'c3', width : 60, align: 'left',metadata:'ArchivalCode'},
								        				{display: '题名', name: 'c4',width : 80,align: 'left',metadata:'Summary'},
								        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
								        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
								        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
								        				{display: '卷数', name: 'c9',width : 90,align: 'center',metadata:'fileCount'},
								        				{display: '件数', name: 'c10',width : 90,align: 'center',metadata:'innerFileCount'},
								        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
								        				{display: 'idParent', name: 'idParent',width : 90,align: 'center',metadata:'idParent',hide:true},
								        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'},
								        				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true}
												];
										for(var i = 0;i<storeFiled.length;i++){
											showCol.push({display:storeFiled[i].field,name:'d'+storeFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+storeFiled[i].id});
										}
										$("#borrowDetails").flexigrid({
											url:false,
											dataType: 'json',
											editable: true,
											colModel : showCol,
											buttons : [
																{name: '选择系统档案', bclass: 'add',onpress:addEditDetails},
									    		        		{name: '手工录入', bclass: 'add',onpress:addLineDetail},
									    		        		{name: '删除', bclass: 'delete',onpress:delEditDetails},
									    		        		{name: '借阅', bclass: 'tranlist',onpress:changeStatus},
									    		        		{name: '借出', bclass: 'export',onpress:changeStatus},
									    		        		{name: '续借', bclass: 'export',onpress:changeStatusForRelend},
									    		        		{name: '归还', bclass: 'back',onpress:changeStatus}
														],
											usepager: true,
						    				title: '借阅明细列表',
						    				useRp: true,
						    				rp: 20,
						    				nomsg:"没有数据",
						    				showTableToggleBtn: false,
						    				pagetext: '第',
						    				outof: '页 /共',
						    				width: 580,
						    				height: 190,
						    				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
										});
										$("#borrowDetails").flexReload();
										$('.bottom div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">利用库数据</span>');
										$('.bottom div[class="tDiv"]').css("border-top","1px solid #ccc");
										
									}
								});
							}
						});
					}
				}
			},
			cache:false
		});
	}else if(sign==1){
		 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+borrowOuts+'行已借出，不允许删除，请重新选择！',icon:'warning',time:3});
    	 $("input[name='ids3']").attr('checked',false);
    	 $("input[name='id3']").attr('checked',false);
		 return false;
	}
}
//修改借阅借出归还的状态
function changeStatus1(name){
	var checkbox=$("#borrowDetails").find("input[name='id3']:checked");
     //判断是否改变借阅明细的数据
     if(checkbox.length==0){
    	 $.dialog.notice({content:'请选择借阅明细的数据！',icon:"warning",time:3});
     	 return false;
     }
     var STATUS = '';
     var MARK = '';
     var ID = '';
     var readType='';
     var VAL='';
     var PATH= '';
     var isVAL=0;
     var details=[];
     var orderDetails=[];
     var flag=0;
     var nums=[];
     var huans=[];//已归还的行数
     var jieyues=[];//已借阅的行数
     var jiechus=[];//已借出的行数
     var orders=[];//已预约的行数
     
     var innerFileCount = 0;
     var orderInnerFileCount = 0;
     var flagInner = false;
     var paths = "";
     var idd = "";
     var isOrderFlag = false;
     var isTooMaxFlag = false;
//     alert(name);
     if(name=='借阅'){
    	 flagInner = true;
    	 checkbox.each(function(){
			 var trObj=$(this).closest('tr');
			 var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			 STATUS=name;
			 var count= $("#borrowDetails").flexGetColumnValue(trObj,['innerFileCount']);
			 if($("#borrowDetails").flexGetColumnValue(trObj,['path'])!=''){
				 paths = paths + $("#borrowDetails").flexGetColumnValue(trObj,['path'])+"|";
			 }
			 MARK=trObj.find("input[name='mark']").val();
			 ID=trObj.find("input[name='id3']").attr('id');
			 idd = idd + ID+ "|";
			 VAL=trObj.find("input[name='id3']").val();
			 if(VAL==''){
				 isVAL=1;
				 var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 readType=trObj.find("input[name='"+nume+"']:checked").val();
				 PATH='';
			 }else{
				 isVAL=2;
				 VAL=VAL.split('|');
				 PATH=VAL[0];
				 if(PATH==''){
					 readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				 }else{
					 readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				 }
			 }
			 if(stat=='借出' ){
				 flag=2;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
				 jiechus.push(num);
			 }else if(stat=='借阅' ){
				 flag=1;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
				 jieyues.push(num);
			 }else if(stat == "归还"){
				 flag=5;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 huans.push(num);
			 }else if( stat=='预约'){
				 //TODO guolanrui 20141009 调用其他的方法校验是否可以借阅，并且给出合理提示
				 flag=6;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
				 orders.push(num);
				 orderInnerFileCount = orderInnerFileCount + parseInt(count);
				 orderDetails.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
				 var readerId =   $("input[name='readerid']").val();
				 var identity = $("input[name='identity']").val();
				 var readerName = $("input[name='reader']").val();
				 if(!isTooMaxFlag){
					 lendArchiveForOrder(name,idm,PATH,ID,readerId,identity,readerName,isTooMaxFlag);
				 }
				 isOrderFlag = true;
			 }else if(stat=='续借'){
				 flag=7;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
			 }
			 innerFileCount = innerFileCount + parseInt(count);
			 details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
		 });
    	 nums=nums.join(",");
    	 if(isOrderFlag){
    		 return false;
    	 }
     }else if(name=='借出'){
    	 flagInner = true;
    	 checkbox.each(function(){
			 var trObj=$(this).closest('tr');
			 var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			 var count= $("#borrowDetails").flexGetColumnValue(trObj,['innerFileCount']);
			 if($("#borrowDetails").flexGetColumnValue(trObj,['path'])!=''){
				 paths = paths + $("#borrowDetails").flexGetColumnValue(trObj,['path'])+"|";
			 }
			 STATUS=name;
			 MARK=trObj.find("input[name='mark']").val();
			 ID=trObj.find("input[name='id3']").attr('id');
			 idd = idd + ID+ "|";
			 VAL=trObj.find("input[name='id3']").val();
			 if(VAL==''){
				 isVAL=1;
				 var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 readType=trObj.find("input[name='"+nume+"']:checked").val();
				 PATH='';
			 }else{
				 isVAL=2;
				 VAL=VAL.split('|');
				 PATH=VAL[0];
				 if(PATH==''){
					 readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				 }else{
					 readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				 }
			 }
			 if(stat=='借出' ){
				 flag=2;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
				 jiechus.push(num);
			 }else if(stat=='借阅' ){
				 flag=1;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
				 jieyues.push(num);
			 }else if(stat == "归还"){
				 flag=5;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 huans.push(num);
			 }else if( stat=='预约'){
				 //TODO guolanrui 20141009 调用其他的方法校验是否可以借出，并且给出合理提示
				 flag=6;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
				 orders.push(num);
				 var readerId =   $("input[name='readerid']").val();
				 var identity = $("input[name='identity']").val();
				 var readerName = $("input[name='reader']").val();
				 if(!isTooMaxFlag){
					 lendArchiveForOrder(name,idm,PATH,ID,readerId,identity,readerName,isTooMaxFlag);
				 }
				 isOrderFlag = true;
			 }
			 innerFileCount = innerFileCount + parseInt(count);
			 details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
		 });
    	 nums=nums.join(",");
    	 if(isOrderFlag){
    		 return false;
    	 }
     }else if(name=='归还'){
    	 flagInner = false;
    	 checkbox.each(function(){
			 var trObj=$(this).closest('tr');
			 var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			 STATUS=name;
			 MARK=trObj.find("input[name='mark']").val();
			 ID=trObj.find("input[name='id3']").attr('id');
			 VAL=trObj.find("input[name='id3']").val();
			 if(VAL==''){
				 isVAL=1;
				 var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 readType=trObj.find("input[name='"+nume+"']:checked").val();
				 PATH='';
			 }else{
				 isVAL=2;
				 VAL=VAL.split('|');
				 PATH=VAL[0];
				 if(PATH==''){
					 readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				 }else{
					 readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				 }
			 }
			 if(stat=='未借阅'){
				 flag=3;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
			 }else if(stat=='归还'){
				 flag=4;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 huans.push(num);
			 }else if( stat=='预约'){
				 flag=6;
				 var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				 nums.push(num);
			 }
			 
			 details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
		 });
    	 nums=nums.join(",");
    	 huans=huans.join(",");
     }
     if(isVAL==1){
    	 $.dialog.notice({title:'操作提示',content:'您选择的数据含有未保存的数据，不能'+name+'，请保存后重新选择！',icon:'warning',time:3});
    	 $("input[name='ids3']").attr('checked',false);
    	 $("input[name='id3']").attr('checked',false);
		 return false;
     }else if(isVAL==2){
    	  if(flag==1){
	        	 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行已借阅，请重新选择！',icon:'warning',time:3});
	        	 $("input[name='ids3']").attr('checked',false);
	        	 $("input[name='id3']").attr('checked',false);
	    		 return false;
	         }else if(flag==2){
	        	 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行已借出，请重新选择！',icon:'warning',time:3});
	        	 $("input[name='ids3']").attr('checked',false);
	        	 $("input[name='id3']").attr('checked',false);
	    		 return false;
	         }else if(flag==3){
	        	 $.dialog.notice({title:'操作提示',content:'第'+nums+'行数据不需要归还，请重新选择！',icon:'warning',time:3});
	        	 $("input[name='ids3']").attr('checked',false);
	        	 $("input[name='id3']").attr('checked',false);
	    		 return false;
	         }else if(flag==4){
	        	 $.dialog.notice({title:'操作提示',content:'第'+huans+'行数据已归还，请重新选择！',icon:'warning',time:3});
	        	 $("input[name='ids3']").attr('checked',false);
	        	 $("input[name='id3']").attr('checked',false);
	    		 return false;
	         }else if(flag == 5 ){
	        	 $.dialog.notice({title:'操作提示',content:'第'+huans+'行数据已归还，不能'+name+'！',icon:'warning',time:3});
	        	 $("input[name='ids3']").attr('checked',false);
	        	 $("input[name='id3']").attr('checked',false);
	    		 return false;
	         }else if(flag == 6 ){
	        	 //TODO guolanui 20141010 添加借出或者借阅的判断
	        	 if(name=='归还'){
	        		 $.dialog.notice({title:'操作提示',content:'第'+nums+'行数据已预约，不能'+name+'！',icon:'warning',time:3});
	        		 $("input[name='ids3']").attr('checked',false);
	        		 $("input[name='id3']").attr('checked',false);
//	        	 }else{//表示是 借出或者借阅，调用借阅的方法，判断数据是否已归还，是否超出最大借出件数和文件份数
//	        		 alert(idm);
//	        		 orders=orders.join(",");
//	        		 alert(orders);
//	        		 alert(orderInnerFileCount);
//	        		 orderDetails=orderDetails.join(",");
//	        		 alert(orderDetails);
//	        		 orderDetails.each(function(){
//	        			 alert(1);
//	        		 });
	        	 }
	    		 return false;
	         }else if(flag == 7 ){
	        	 $.dialog.notice({title:'操作提示',content:'第'+nums+'行数据已续借，不能'+name+'！',icon:'warning',time:3});
	        	 $("input[name='ids3']").attr('checked',false);
	        	 $("input[name='id3']").attr('checked',false);
	    		 return false;
	         }else{
	        	 if( flagInner ){
	        		var readerid =   $("input[name='readerid']").val();
					var identity = $("input[name='identity']").val();
					var readerName = $("input[name='reader']").val();
	      		   $.post($.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),{idm:idm,path:paths.substr(0,paths.length-1),idd:idd.substr(0,idd.length-1),readerid:readerid,identity:identity,readerName:readerName},function(res){
	      			   if(res){
	        				if(res.maxLendCount==0 || res.maxLendCount-innerFileCount<0){
	        					 $.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+res.maxLendCount+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
	        					 return false;
	        				}else{
	        					if(res.data!=null&&res.data!=''){
	        						var readerid =   $("input[name='readerid']").val();
	    							var identity = $("input[name='identity']").val();
	    							var readerName = $("input[name='reader']").val();
	        						details=details.join(",");
	        			        	 $.post($.appClient.generateUrl({ESArchiveLending:'changeLinkDetails'},'x'),{details:details,readerid:readerid,contentIds:res.contentIds,identity:identity,readerName:readerName},function(succ){
	        			        		 if(succ){
	        			        			//resPage
	     	        						var url=$.appClient.generateUrl({ESArchiveLending:'resPage'},'x');
	     	        						$.ajax({
	     	        						    url:url,
	     	        						    success:function(data){
	     	        						    var reslutData=$.dialog({
	     	        						    	title:'查看结果',
	     	        						    	width: '450px',
	     	        						    	height:'200px',
	     	        						    	padding:'0px',
	     	        					    	   	fixed:  true,
	     	        					    	    resize: false,
	     	        						    	content:data,
	     	        								init:showResultData
	     	        							 });
	     	        						    function orderResultData(){
	     	        						    	 var checkObj=$("#resultData").find("input[name='orderCheck']:checked");
	     	   	        					   	  if(checkObj.length==0){
	     	   	        					   		  $.dialog.notice({title:'操作提示',icon:'warning',content:'请选择预约数据！',time:3});
	     	   	        					   		  return false;
	     	   	        					   	  }else{
	     	   	        					   		  var ids = [];
	     	   	        					   	$("#resultData").find("input[name='orderCheck']:checked").each(function(){
	     	   	        							ids.push($(this).val());
	     	   	        						});
	     	   	        					 ids=ids.join(',');
	     	   	        					   		  $.post(
	     	   	        					   			$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
	     	   	        					   			{ids:ids,status:'预约'},
	     	   	        					   			function(res){
	     		   	        					   			 if(res){
	     		   	        					   				 reslutData.cancel= true;
	     		   	        				        			 $("input[name='ids3']").attr('checked',false);
	     		   	        				        			 $("#borrowDetails").flexReload();
	     		   	        				        			 $.dialog.notice({
	     		   	        										icon : 'succeed',
	     		   	        										content :  '预约成功！',
	     		   	        										time :2,
	     		   	        										lock:false
	     		   	        				        			 });
	     		   	        								}else{
	     		   	        									$.dialog.notice({
	     		   	        										content:'预约失败！',
	     		   	        										icon:'error',
	     		   	        										time:2
	     		   	        									});
	     		   	        				        		 }
	     	   	        					   			}
	     	   	        					   		  );
	     	   	        					    	
	     	        						    }
	     	        						    }
	     	  	      						function showResultData(){
	     	  	      							var showcols1=[
	     	  	  					        				{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
	     	  	  					        				{display: '<input type="checkbox"  name="id3">', name : 'box', width : 40, align: 'center',metadata:'box'}, 
	     	  	  					        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
	     	  	  					        				{display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
	     	  	  					        				{display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
	     	  	  					        				{display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'},
	     	  	  					        				{display: '操作', name : 'edit', width : 150, align: 'center',metadata:'edit'}
	     	  	  					        			];
	     	  	  				    		var allButtons1=[
	     	  	  				    		        		{name: '预约', bclass: 'order',onpress:orderResultData}
	     	  	  				    		        	];
	     	  	  				    			$("#resultData").flexigrid({
	     	  	  				    				url:false,
	     	  	  				    				dataType: 'json',
	     	  	  				    				editable: false,
	     	  	  				    				colModel: showcols1,
	     	  	  				    				buttons: allButtons1,
	     	  	  				    				showTableToggleBtn: false,
	     	  	  				    				pagetext: '第',
	     	  	  				    				outof: '页 /共',
	     	  	  				    				width: 450,
	     	  	  				    				height: 200
	     	  	  				    			});
	     	  		  				    			for(var i=0;i<res.data.length;i++){
	     	  		  				    				if(res.Message[res.data[i].path]!=null && res.Message[res.data[i].path]!= undefined && res.Message[res.data[i].path]!=''){
	     	  		  				    				if(res.Message[res.data[i].path].indexOf('借出')>0){
		     	  		  				    					$("#resultData").flexExtendData([{
	     	  		  				    						'id':res.data[i].id,
	     	  		  				    						'cell':{
	     	  		  				    							'num':i+1,
	     	  		  				    							'box':'<input type="checkbox" name="orderCheck" id="" value="'+res.data[i].id+'"/>',
	     	  		  				    							'path':res.data[i].path,
	     	  		  				    							'id':res.data[i].id,
	     	  		  				    							'title':res.data[i].title,
	     	  		  				    							'code':res.data[i].archive_code,
	     	  		  				    							'edit':res.Message[res.data[i].path]
	     	  		  				    						}
	     	  		  				    					}]);
	     	  		  				    				}else{
	     	  		  				    				$("#resultData").flexExtendData([{
     	  		  				    						'id':res.data[i].id,
     	  		  				    						'cell':{
     	  		  				    							'num':i+1,
     	  		  				    							'path':res.data[i].path,
     	  		  				    							'id':res.data[i].id,
     	  		  				    							'title':res.data[i].title,
     	  		  				    							'code':res.data[i].archive_code,
     	  		  				    							'edit':res.Message[res.data[i].path]
     	  		  				    						}
     	  		  				    					}]);
	     	  		  				    				}
	     	  		  				    				}else{
	     	  		  				    					$("#resultData").flexExtendData([{
	     	  		  				    						'id':res.data[i].id,
	     	  		  				    						'cell':{
	     	  		  				    							'num':i+1,
	     	  		  				    							'box':'<input type="checkbox" name="orderCheck" id="" value="'+res.data[i].id+'"/>',
	     	  		  				    							'path':res.data[i].path,
	     	  		  				    							'id':res.data[i].id,
	     	  		  				    							'title':res.data[i].title,
	     	  		  				    							'code':res.data[i].archive_code
	     	  		  				    						}
	     	  		  				    					}]);
	     	  		  				    				}
	     	  		      						}
	     	  	      						}
	     	  	      						}
	     	        						});
	        			        		 }
	        			        	 }
	        			        	 );
	        					
	        						
	        					}else{
	        						 details=details.join(",");
	        						var readerid =   $("input[name='readerid']").val();
	        						var identity = $("input[name='identity']").val();
	        						var readerName = $("input[name='reader']").val();
	        			        	 $.post($.appClient.generateUrl({ESArchiveLending:'changeLinkDetails'},'x'),{details:details,readerid:readerid,identity:identity,readerName:readerName},function(data){
	        			        		 if(data){
	        			        			 $("input[name='ids3']").attr('checked',false);
	        			        			 $("#borrowDetails").flexReload();
	        			        		 }
	        			        	 }
	        			        	 );
	        					}
	        				}
	        			 }
	        		 },'json');
	      	   }else{
	        	 details=details.join(",");
	        	 var readerid =  $("input[name='readerid']").val();
	        		var identity = $("input[name='identity']").val();
					var readerName = $("input[name='reader']").val();
	        	 $.post($.appClient.generateUrl({ESArchiveLending:'changeLinkDetails'},'x'),{details:details,readerid:readerid,identity:identity,readerName:readerName},function(data){
	        		 if(data){
	        			 //wanghongchen 20141008 增加提示信息
	        			 $.dialog.notice({content:name+"成功！",icon:"succeed"});
	        			 $("input[name='ids3']").attr('checked',false);
	        			 $("#borrowDetails").flexReload();
	        		 }else{
	        			 $.dialog.notice({content:name+"失败！",icon:"error"});
	        		 }
	        	 }
	        	 );
	      	   }
	        	if(null != $("#flexme1") && $("#flexme1") != undefined){
	        		$("#flexme1").flexReload();
	        	}
	         }
     }
}
//guolanrui 20141011 修改此方法，修改原来对预约数据不能操作的逻辑，同时修改所有提示消息的逻辑
function changeStatus(name){
	var checkbox=$("#borrowDetails").find("input[name='id3']:checked");
	//判断是否改变借阅明细的数据
	if(checkbox.length==0){
		$.dialog.notice({content:'请选择借阅明细的数据！',icon:'warning',time:3});
		return false;
	}
	var STATUS = '';
	var MARK = '';
	var ID = '';
	var readType='';
	var VAL='';
	var PATH= '';
	var isVAL=0;
	var details=[];
	var orderDetails=[];
	var flag=0;
	var nums=[];
	var huans=[];//已归还的行数
	var jieyues=[];//已借阅的行数
	var jiechus=[];//已借出的行数
	var orders=[];//已预约的行数
	var tooMaxs=[];//超出最大借阅份数的行
	var inLends=[];//处于借阅或借出的行数
	var successRows=[];//成功借出或借阅的行数
	
	var innerFileCount = 0;
	var orderInnerFileCount = 0;
	var flagInner = false;
	var paths = "";
	var idd = "";
	var isOrderFlag = false;//原状态为预约的标识
	var isTooMaxFlag = false;//超过最大借出份数的标识
	
	var isAllOrderFlag = true;//勾选的全部数据都是预约的标识
//     alert(name);
	if(name=='借阅'){
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			if( stat!='预约'){
				isAllOrderFlag = false;
//				break;
			}
		});	
		flagInner = true;
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			STATUS=name;
			var count= $("#borrowDetails").flexGetColumnValue(trObj,['innerFileCount']);
			if($("#borrowDetails").flexGetColumnValue(trObj,['path'])!=''){
				paths = paths + $("#borrowDetails").flexGetColumnValue(trObj,['path'])+"|";
			}
			MARK=trObj.find("input[name='mark']").val();
			ID=trObj.find("input[name='id3']").attr('id');
			idd = idd + ID+ "|";
			VAL=trObj.find("input[name='id3']").val();
			if(VAL==''){
				isVAL=1;
				var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				readType=trObj.find("input[name='"+nume+"']:checked").val();
				PATH='';
			}else{
				isVAL=2;
				VAL=VAL.split('|');
				PATH=VAL[0];
				if(PATH==''){
					readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				}else{
					readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				}
			}
			if(stat=='借出' ){
				flag=2;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				jiechus.push(num);
			}else if(stat=='借阅' ){
				flag=1;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				jieyues.push(num);
			}else if(stat == "归还"){
				flag=5;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				huans.push(num);
			}else if( stat=='预约'){
				//TODO guolanrui 20141009 调用其他的方法校验是否可以借阅，并且给出合理提示
				flag=6;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				orders.push(num);
//				orderInnerFileCount = orderInnerFileCount + parseInt(count);
//				orderDetails.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
				var readerId =   $("input[name='readerid']").val();
				var identity = $("input[name='identity']").val();
				var readerName = $("input[name='reader']").val();
				var isInLendFlag = false;//是否正在借阅或借出
				var isSuccessFlag = false;//是否成功
				if(!isTooMaxFlag && isAllOrderFlag){
//					lendArchiveForOrder(name,idm,PATH,ID,readerId,identity,readerName,isTooMaxFlag,isInLendFlag);
					$.ajax({
						url: $.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),
						async:false,
						data:{idm:idm,idd:ID,path:PATH,readerId:readerId,readerName:readerName,identity:identity},
						type : 'POST',
						dataType:'json',
						success: function(res){
//						    $.post($.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),{idm:idm,idd:ids,path:path,readerId:readerId,readerName:readerName,identity:identity},function(res){
							 if(res){ 
								if(res.maxLendCount==0 || res.maxLendCount-1<0){
//									 $.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+res.maxLendCount+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
									 isTooMaxFlag = true;
								}else{
									if(res.data!=null&&res.data!=''){
//										 $.dialog.notice({title:'操作提示',content:'您'+name+"的档案还在借出或者借阅中！",icon:'warning',time:3});
										 isInLendFlag = true;
									}else{
										$.ajax({
												url:$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
												data:{ids:ID,status:name,readerId:readerId}, 
												async:false,
												type : 'POST',
												success:function(data){
													if(data){
														isSuccessFlag = true;
														 $.dialog.notice({
			   	        										icon : 'succeed',
			   	        										content :  '归还成功！',
			   	        										time :2,
			   	        										lock:false
			   	        				        			 });
													}else{
														
														$.dialog.notice({
		   	        										icon : 'error',
		   	        										content :  '归还失败！',
		   	        										time :2,
		   	        										lock:false
		   	        				        			 });
													}
//													$("input[name='ids3']").attr('checked',false);
//								        			$("#borrowDetails").flexReload();
												}
										}); 
									}
								}
							 }
						 }
					 });
				}
				if(isInLendFlag){//正在借阅或借出的行数
					inLends.push(num);
				}else if(isTooMaxFlag){//超出最大借阅份数
					tooMaxs.push(num);
				}else if(isSuccessFlag){//借阅成功的
					successRows.push(num);
				}
				isOrderFlag = true;
			}else if(stat=='续借'){
				flag=7;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
			}
			if(!isOrderFlag){
				innerFileCount = innerFileCount + parseInt(count);
				details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
			}
		});
		nums=nums.join(",");
		orders = orders.join(",");
		inLends = inLends.join(",");
		tooMaxs = tooMaxs.join(",");
		successRows = successRows.join(",");
		if(isAllOrderFlag){
			var msg = '您选择'+orders+'行预约数据中：';
			if(successRows.length>0){
				msg = msg + '第'+successRows+'行数据'+name+'成功；';
			}
			if(inLends.length>0){
				msg = msg + '第'+inLends+'行数据还在借出或者借阅中；';
			}
			if(tooMaxs.length>0){
				msg = msg + '第'+tooMaxs+'行数据由于超出最大借出件数，不能'+name+'；';
			}
			$.dialog.notice({title:'操作提示',content:msg,icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			$("#borrowDetails").flexReload();
			return false;
		}
	}else if(name=='借出'){
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			if( stat!='预约'){
				isAllOrderFlag = false;
//				break;
			}
		});	
		flagInner = true;
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			var count= $("#borrowDetails").flexGetColumnValue(trObj,['innerFileCount']);
			if($("#borrowDetails").flexGetColumnValue(trObj,['path'])!=''){
				paths = paths + $("#borrowDetails").flexGetColumnValue(trObj,['path'])+"|";
			}
			STATUS=name;
			MARK=trObj.find("input[name='mark']").val();
			ID=trObj.find("input[name='id3']").attr('id');
			idd = idd + ID+ "|";
			VAL=trObj.find("input[name='id3']").val();
			if(VAL==''){
				isVAL=1;
				var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				readType=trObj.find("input[name='"+nume+"']:checked").val();
				PATH='';
			}else{
				isVAL=2;
				VAL=VAL.split('|');
				PATH=VAL[0];
				if(PATH==''){
					readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				}else{
					readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				}
			}
			if(stat=='借出' ){
				flag=2;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				jiechus.push(num);
			}else if(stat=='借阅' ){
				flag=1;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				jieyues.push(num);
			}else if(stat == "归还"){
				flag=5;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				huans.push(num);
			}else if( stat=='预约'){
				//TODO guolanrui 20141009 调用其他的方法校验是否可以借出，并且给出合理提示
				flag=6;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				orders.push(num);
				var readerId =   $("input[name='readerid']").val();
				var identity = $("input[name='identity']").val();
				var readerName = $("input[name='reader']").val();
				var isInLendFlag = false;//是否正在借阅或借出
				if(isAllOrderFlag){
					if(!isTooMaxFlag){
						$.ajax({
							url: $.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),
							async:false,
							data:{idm:idm,idd:ID,path:PATH,readerId:readerId,readerName:readerName,identity:identity},
							type : 'POST',
							dataType:'json',
							success: function(res){
								 if(res){ 
									if(res.maxLendCount==0 || res.maxLendCount-1<0){
										 isTooMaxFlag = true;
									}else{
										if(res.data!=null&&res.data!=''){
											 isInLendFlag = true;
										}else{
											$.ajax({
													url:$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
													data:{ids:ID,status:name,readerId:readerId}, 
													async:false,
													type : 'POST',
													success:function(data){
														if(data){
															isSuccessFlag = true;
														}
//														$("input[name='ids3']").attr('checked',false);
//									        			$("#borrowDetails").flexReload();
													}
											}); 
										}
									}
								 }
							 }
						 });
					}
					if(isInLendFlag){//正在借阅或借出的行数
						inLends.push(num);
					}else if(isTooMaxFlag){//超出最大借阅份数
						tooMaxs.push(num);
					}else if(isSuccessFlag){//借阅成功的
						successRows.push(num);
					}
				}
				isOrderFlag = true;
			}
			if(!isOrderFlag){
				innerFileCount = innerFileCount + parseInt(count);
				details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
			}
		});
		nums=nums.join(",");
		orders = orders.join(",");
		inLends = inLends.join(",");
		tooMaxs = tooMaxs.join(",");
		successRows = successRows.join(",");
		if(isAllOrderFlag){
			var msg = '您选择'+orders+'行预约数据中：';
			if(successRows.length>0){
				msg = msg + '第'+successRows+'行数据'+name+'成功；';
			}
			if(inLends.length>0){
				msg = msg + '第'+inLends+'行数据还在借出或者借阅中；';
			}
			if(tooMaxs.length>0){
				msg = msg + '第'+tooMaxs+'行数据由于超出最大借出件数，不能'+name+'；';
			}
			$.dialog.notice({title:'操作提示',content:msg,icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			$("#borrowDetails").flexReload();
			return false;
		}
	}else if(name=='归还'){
		flagInner = false;
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var stat=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			STATUS=name;
			MARK=trObj.find("input[name='mark']").val();
			ID=trObj.find("input[name='id3']").attr('id');
			VAL=trObj.find("input[name='id3']").val();
			if(VAL==''){
				isVAL=1;
				var nume=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				readType=trObj.find("input[name='"+nume+"']:checked").val();
				PATH='';
			}else{
				isVAL=2;
				VAL=VAL.split('|');
				PATH=VAL[0];
				if(PATH==''){
					readType=trObj.find("input[name='"+ID+"']:checked").val(); 
				}else{
					readType=trObj.find("input[name='"+PATH+"']:checked").val(); 
				}
			}
			if(stat=='未借阅'){
				flag=3;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
			}else if(stat=='归还'){
				flag=4;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				huans.push(num);
			}else if( stat=='预约'){
				flag=6;
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
			}
			
			details.push(ID+"|"+STATUS+"|"+MARK+"|"+PATH+"|"+readType+"|"+stat);
		});
		nums=nums.join(",");
		huans=huans.join(",");
	}
	if(isVAL==1){
		$.dialog.notice({title:'操作提示',content:'您选择的数据含有未保存的数据，不能'+name+'，请保存后重新选择！',icon:'warning',time:3});
		$("input[name='ids3']").attr('checked',false);
		$("input[name='id3']").attr('checked',false);
		return false;
	}else if(isVAL==2){
		if(flag==1){
			$.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行已借阅，请重新选择！',icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			return false;
		}else if(flag==2){
			$.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行已借出，请重新选择！',icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			return false;
		}else if(flag==3){
			$.dialog.notice({title:'操作提示',content:'第'+nums+'行数据不需要归还，请重新选择！',icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			return false;
		}else if(flag==4){
			$.dialog.notice({title:'操作提示',content:'第'+huans+'行数据已归还，请重新选择！',icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			return false;
		}else if(flag == 5 ){
			$.dialog.notice({title:'操作提示',content:'第'+huans+'行数据已归还，不能'+name+'！',icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			return false;
		}else if(flag == 6 ){
			//TODO guolanui 20141010 添加借出或者借阅的判断
			if(name=='归还'){
				$.dialog.notice({title:'操作提示',content:'第'+nums+'行数据已预约，不能'+name+'！',icon:'warning',time:3});
				$("input[name='ids3']").attr('checked',false);
				$("input[name='id3']").attr('checked',false);
			}
			return false;
		}else if(flag == 7 ){
			$.dialog.notice({title:'操作提示',content:'第'+nums+'行数据已续借，不能'+name+'！',icon:'warning',time:3});
			$("input[name='ids3']").attr('checked',false);
			$("input[name='id3']").attr('checked',false);
			return false;
		}else{
			if( flagInner ){
				var readerid =   $("input[name='readerid']").val();
				var identity = $("input[name='identity']").val();
				var readerName = $("input[name='reader']").val();
				$.post($.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),{idm:idm,path:paths.substr(0,paths.length-1),idd:idd.substr(0,idd.length-1),readerid:readerid,identity:identity,readerName:readerName},function(res){
					if(res){
						if(res.maxLendCount==0 || res.maxLendCount-innerFileCount<0){
							$.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+res.maxLendCount+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
							return false;
						}else{
							if(res.data!=null&&res.data!=''){
								var readerid =   $("input[name='readerid']").val();
								var identity = $("input[name='identity']").val();
								var readerName = $("input[name='reader']").val();
								details=details.join(",");
								$.post($.appClient.generateUrl({ESArchiveLending:'changeLinkDetails'},'x'),{details:details,readerid:readerid,contentIds:res.contentIds,identity:identity,readerName:readerName},function(succ){
									if(succ){
										//resPage
										var url=$.appClient.generateUrl({ESArchiveLending:'resPage'},'x');
										$.ajax({
											url:url,
											success:function(data){
												var reslutData=$.dialog({
													title:'查看结果',
													width: '450px',
													height:'200px',
													padding:'0px',
													fixed:  true,
													resize: false,
													content:data,
													init:showResultData
												});
												function orderResultData(){
													var checkObj=$("#resultData").find("input[name='orderCheck']:checked");
													if(checkObj.length==0){
														$.dialog.notice({title:'操作提示',icon:'warning',content:'请选择预约数据！',time:3});
														return false;
													}else{
														var ids = [];
														$("#resultData").find("input[name='orderCheck']:checked").each(function(){
															ids.push($(this).val());
														});
														ids=ids.join(',');
														$.post(
																$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
																{ids:ids,status:'预约'},
																function(res){
																	if(res){
																		reslutData.cancel= true;
																		$("input[name='ids3']").attr('checked',false);
																		$("#borrowDetails").flexReload();
																		$.dialog.notice({
																			icon : 'succeed',
																			content :  '预约成功！',
																			time :2,
																			lock:false
																		});
																	}else{
																		$.dialog.notice({
																			content:'预约失败！',
																			icon:'error',
																			time:2
																		});
																	}
																}
														);
														
													}
												}
												function showResultData(){
													var showcols1=[
													               {display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
													               {display: '<input type="checkbox"  name="id3">', name : 'box', width : 40, align: 'center',metadata:'box'}, 
													               {display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
													               {display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
													               {display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
													               {display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'},
													               {display: '操作', name : 'edit', width : 150, align: 'center',metadata:'edit'}
													               ];
													var allButtons1=[
													                 {name: '预约', bclass: 'order',onpress:orderResultData}
													                 ];
													$("#resultData").flexigrid({
														url:false,
														dataType: 'json',
														editable: false,
														colModel: showcols1,
														buttons: allButtons1,
														showTableToggleBtn: false,
														pagetext: '第',
														outof: '页 /共',
														width: 450,
														height: 200
													});
													for(var i=0;i<res.data.length;i++){
														if(res.Message[res.data[i].path]!=null && res.Message[res.data[i].path]!= undefined && res.Message[res.data[i].path]!=''){
															if(res.Message[res.data[i].path].indexOf('借出')>0){
																$("#resultData").flexExtendData([{
																	'id':res.data[i].id,
																	'cell':{
																		'num':i+1,
																		'box':'<input type="checkbox" name="orderCheck" id="" value="'+res.data[i].id+'"/>',
																		'path':res.data[i].path,
																		'id':res.data[i].id,
																		'title':res.data[i].title,
																		'code':res.data[i].archive_code,
																		'edit':res.Message[res.data[i].path]
																	}
																}]);
															}else{
																$("#resultData").flexExtendData([{
																	'id':res.data[i].id,
																	'cell':{
																		'num':i+1,
																		'path':res.data[i].path,
																		'id':res.data[i].id,
																		'title':res.data[i].title,
																		'code':res.data[i].archive_code,
																		'edit':res.Message[res.data[i].path]
																	}
																}]);
															}
														}else{
															$("#resultData").flexExtendData([{
																'id':res.data[i].id,
																'cell':{
																	'num':i+1,
																	'box':'<input type="checkbox" name="orderCheck" id="" value="'+res.data[i].id+'"/>',
																	'path':res.data[i].path,
																	'id':res.data[i].id,
																	'title':res.data[i].title,
																	'code':res.data[i].archive_code
																}
															}]);
														}
													}
												}
											}
										});
									}
								}
								);
								
								
							}else{
								details=details.join(",");
								var readerid =   $("input[name='readerid']").val();
								var identity = $("input[name='identity']").val();
								var readerName = $("input[name='reader']").val();
								$.post($.appClient.generateUrl({ESArchiveLending:'changeLinkDetails'},'x'),{details:details,readerid:readerid,identity:identity,readerName:readerName},function(data){
									if(data){
										$("input[name='ids3']").attr('checked',false);
										$("#borrowDetails").flexReload();
									}
								}
								);
							}
						}
					}
				},'json');
			}else{
				details=details.join(",");
				var readerid =  $("input[name='readerid']").val();
				var identity = $("input[name='identity']").val();
				var readerName = $("input[name='reader']").val();
				$.post($.appClient.generateUrl({ESArchiveLending:'changeLinkDetails'},'x'),{details:details,readerid:readerid,identity:identity,readerName:readerName},function(data){
					if(data){
						//wanghongchen 20141008 增加提示信息
						$.dialog.notice({content:name+"成功！",icon:"succeed"});
						$("input[name='ids3']").attr('checked',false);
						$("#borrowDetails").flexReload();
					}else{
						$.dialog.notice({content:name+"失败！",icon:"error"});
					}
				}
				);
			}
			if(null != $("#flexme1") && $("#flexme1") != undefined){
				$("#flexme1").flexReload();
			}
		}
	}
}

function lendArchiveForOrder(name,idm,path,ids,readerId,identity,readerName,isTooMaxFlag,isInLendFlag){
	$.ajax({
		url: $.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),
		async:false,
		data:{idm:idm,idd:ids,path:path,readerId:readerId,readerName:readerName,identity:identity},
		type : 'POST',
		dataType:'json',
		success: function(res){
//		    $.post($.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),{idm:idm,idd:ids,path:path,readerId:readerId,readerName:readerName,identity:identity},function(res){
			 if(res){ 
				if(res.maxLendCount==0 || res.maxLendCount-1<0){
					 $.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+res.maxLendCount+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
					 isTooMaxFlag = true;
					 return false;
				}else{
					if(res.data!=null&&res.data!=''){
						 $.dialog.notice({title:'操作提示',content:'您'+name+"的档案还在借出或者借阅中！",icon:'warning',time:3});
						 isInLendFlag = true;
    					 return false; 
					}else{
						$.ajax({
								url:$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
								data:{ids:ids,status:name,readerId:readerId}, 
								async:false,
								type : 'POST',
								success:function(data){
									if(data){
//										$.dialog.notice({icon:'succeed',content:name+'数据成功',time:3,title:'3秒后自动关闭!'});
//										$("#orderUsingPaths").flexReload();/** xiaoxiong 20140921 借出后，自动刷新上面的表格 **/
									}else{
//										$.dialog.notice({title:'操作提示',content:name+'数据失败！',icon:'error',time:3});
									}
									$("input[name='ids3']").attr('checked',false);
				        			$("#borrowDetails").flexReload();
								}
						}); 
					}
				}
			 }
		 }
	 });
 }

//初始化显示档案著录目录树
function createFileTree(){
	var setting={
		view:{
			dblClickExpand: false,
			showLine: false
		},
		data:{
			simpleData:{
				enable: true
			}
		},
		callback:{
			onClick:nodeClick
		}
	};
	function nodeClick(event, treeId, treeNode){
		zTree = $.fn.zTree.getZTreeObj("filetree");
		zTree.expandNode(treeNode);
		//archiveName=treeNode.name;
		archiveType=treeNode.archivetype;
		if(treeNode.sId!=0 && treeNode.isParent!=true){
			strucid=treeNode.sId;
			var path=treeNode.path;
			var reg=/\//g;
			nodePath=path.replace(reg, '-');
			var url=$.appClient.generateUrl({ESArchiveLending:'datalist',path:nodePath,sId:strucid},'x');
			$("#borrowlistbox").load(url);
		}
	};
	var url = $.appClient.generateUrl({ESArchiveLending:'getTree',status:4},'x');
	$.ajax({
		url:url,
		dataType: 'json',
		success:function(nodes){
			$.fn.zTree.init($("#filetree"), setting, nodes);
		},
		cache:false
	});
}
var formFiled = [];
var storeFiled = [];
var treeNodeForGrid;

$.ajax({
	url:$.appClient.generateUrl({ESArchiveLending:'getfieldData',data:'form'},'x'),
	dataType: 'json',
	success:function(data){
		var _flexme1_width = $('#rightdiv').width();
		var _flexme1_height =$('#rightdiv').height()-115;

		var __borrowModel='using';
		var showColModel=[
				{display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
				{display: '操作', name : 'c3', width : 60, sortable : true, align: 'center'},
				{display: '借阅单编号', name : 'c4', width : 100, sortable : true, align: 'center',metadata:'Code'},
				{display: '借阅人', name : 'c5', width : 60, sortable : true, align: 'center',metadata:'Reader'},
				{display: '登记日期', name : 'c13', width : 110, sortable : true, align: 'center',metadata:'Registdate'},
				{display: '单位', name : 'c6', width : 80, sortable : true, align: 'center',metadata:'Dept'},
				{display: '电话', name : 'c7', width : 80, sortable : true, align: 'center',metadata:'Telephone'},
				{display: '邮箱', name : 'c8', width : 150, sortable : true, align: 'center',metadata:'Email'},
				{display: '利用目的', name : 'c9', width : 80, sortable : true, align: 'center',metadata:'Usepurpose'},
				{display: '催还提前天数', name : 'c10', width : 60, sortable : true, align: 'center',metadata:'Validdate'},
				{display: '登记人', name : 'c12', width : 60, sortable : true, align: 'center',metadata:'Register'},
				{display: '状态', name : 'c14', width : 60, sortable : true, align: 'center',metadata:'Status'},
				{display: '身份证', name : 'c16', width : 60, sortable : true, align: 'center',metadata:'Identity'},
				{display: '卷数', name : 'c17', width : 60, sortable : true, align: 'center',metadata:'FileCount'},
				{display: '件数', name : 'c18', width : 60, sortable : true, align: 'center',metadata:'InnerFileCount'},
				{display: '备注', name : 'c15', width : 120, sortable : true, align: 'center',metadata:'Description'},
				{display: '是否可编辑', name : 'edit', width : 120, sortable : true, align: 'center',metadata:'edit',hide:true},
				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true}
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
		var moreButton =[
			{name: '内部利用单', bclass: 'handIdentify',onpress:addBorrowFormInside},
			{name: '外部利用单', bclass: 'autoIdentify',onpress:addBorrowFormInside}  
		                 ];
		var showButton=[
				{name: '添加', bclass: 'add',id:'do_more',more:moreButton},
				{name: '删除', bclass: 'delete',onpress:delBorrowForm},
				{name: '筛选', bclass: 'filter',onpress:filterBorrowForm},
				{name: '还原数据',bclass: 'back',onpress:backIndex},
				{name: '借阅报表',bclass: 'report',onpress:printBorrowPage},
				{name: '查看预约',bclass: 'filter',onpress:showOrderData},
				{name: '结束',bclass : 'wf_delete',onpress:endUsingForm},
				{name: '续借',bclass: 'export',onpress:relendForForm},
				{name: '归还',bclass: 'back',onpress:returnForForm}
				//{name: '提交审批', bclass: 'code',onpress:approveBorrowForm}
		    ];
		var statusForTree = $('input[name="statusForTree"]:checked').val();
		var uri=$.appClient.generateUrl({ESArchiveLending:'form_json_new',statusForTree:statusForTree,pId:'',id:''});
		$("#flexme1").flexigrid({
		  url: uri,
		  dataType: 'json',
		  colModel : showColModel,
		  buttons : showButton,
			usepager: true,
			useRp: true,
			showTableToggleBtn: false,
			onDoubleClick:modify,
			width: _flexme1_width,
			height: _flexme1_height
		});
		$('#rightdiv div[class="tDiv2"]').append('<div class="find-dialog"><input id="queryflexme1Word" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span id="queryflexme1Table"></span></div>');
		$('#rightdiv div[class="tDiv"]').css("border-top","1px solid #ccc");
		$('#queryflexme1Table').live('click',function(){
			var keyWord = $('#queryflexme1Word').val();
			if(keyWord=='请输入关键字' ){
				keyWord = '';
			}
			var statusForTree = $('input[name="statusForTree"]:checked').val();
			treeNode = treeNodeForGrid;
			$("#flexme1").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:false,id:treeNode.id,pId:treeNode.pId},'x'),newp:1,query:{keyWord:keyWord,statusForTree:statusForTree}}).flexReload();
			}
			);
		$('#queryflexme1Word').live('keypress',function(event){
			if(event.keyCode == "13") {
				var keyWord = $('#queryflexme1Word').val();
				if(keyWord=='请输入关键字' ){
					keyWord = '';
				}
				treeNode = treeNodeForGrid;
				var statusForTree = $('input[name="statusForTree"]:checked').val();
				$("#flexme1").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_keyWord',noUser:false,id:treeNode.id,pId:treeNode.pId},'x'),newp:1,query:{keyWord:keyWord,statusForTree:statusForTree}}).flexReload();
			}  
		});
	},
	cache:false
});

	var settingDate = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			async: {
				enable: true,
				dataType: 'json',
				url: $.appClient.generateUrl({ESArchiveLending:'subTreeDate',statusForTree:0},'x'),
				autoParam: ["id","pId"]
			},
			callback: {
				onClick : nodeDateClick
			}
		};
		function nodeDateClick(event, treeId, treeNode){
			zTree = $.fn.zTree.getZTreeObj("usingTreeDemo");
			zTree.expandNode(treeNode);
			treeNodeForGrid = treeNode;
			$('#queryflexme1Word').val('请输入关键字');
			var statusForTree = $('input[name="statusForTree"]:checked').val();
			 $("#flexme1").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_new',id:treeNode.id,pId:treeNode.pId},'x'),newp:1,query:{statusForTree:statusForTree}}).flexReload();
		};
		var url = $.appClient.generateUrl({ESArchiveLending:'initTree'},'x');
		$.ajax({
			url:url,
			dataType: 'json',
			success:function(nodes){
				$.fn.zTree.init($("#usingTreeDemo"), settingDate, nodes);
				$("#usingTreeDemo_1_span").click();
			},
			cache:false
		});
  function showOrderData(){
	  var htmlContent = "<div><div class='orderUsingPath'><table id='orderUsingPaths'></table></div><div class='orderUsingForm'><table id='orderUsingForm'></table></div></div>";
	  $.dialog({
			title:'查看结果',
			width: '600px',
	    	height:'500px',
			lock:true,
			padding:0,
			content:htmlContent,
			init:showResultData
	 });
	  function showResultData(){
		  	function lendArchiveUpOrder(name){
		  		 
				var radios = $("#orderUsingForm").find("input[name='boxForForm']:checked");
                if(radios.length != 1){
                	$.dialog.notice({title:'操作提示',content:'请选择一条要'+name+'的数据！',icon:'warning',time:3});
        			return false;
                }
                var idm = "";
                var path = "";
                var ids = "";
                var readerId = "";
                var flag = true;
                var identity  ="";
                var readerName = "";
                radios.each(function(){
				     idm = $(this).val().split('|')[0];
				     path = $(this).val().split('|')[1];
				     readerId = $(this).val().split('|')[2];
				     ids = $(this).val().split('|')[3];
				     var trObj=$(this).closest("tr");
					  var hasDetail=$("#orderUsingForm").flexGetColumnValue(trObj,['hasDetail']);
					  identity = $("#orderUsingForm").flexGetColumnValue(trObj,['Identity']);
					  readerName = $("#orderUsingForm").flexGetColumnValue(trObj,['Reader']);
					  if(hasDetail == 1){
						  $.dialog.notice({title:'操作提示',content:'您要'+name+'的档案，还在借出或者借阅中!',icon:'warning',time:3});
						  flag =  false;
					  }
//					  alert($(this).val()+'   |   '+hasDetail+'|'+identity+'|'+readerName);
                    });
                if(!flag){
                	return false;
                }
	      		    $.post($.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),{idm:idm,idd:ids,path:path,readerId:readerId,readerName:readerName,identity:identity},function(res){
	        			 if(res){ 
	        				if(res.maxLendCount==0 || res.maxLendCount-1<0){
	        					 $.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+res.maxLendCount+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
	        					 return false;
	        				}else{
	        					if(res.data!=null&&res.data!=''){
	        						 $.dialog.notice({title:'操作提示',content:'您'+name+"的档案还在借出或者借阅中！",icon:'warning',time:3});
		        					 return false; 
	        					}else{
	        						 $.post(
											$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
											{ids:ids,status:name,readerId:readerId}, 
											function(data){
												if(data){
													$.dialog.notice({icon:'succeed',content:name+'数据成功',time:3,title:'3秒后自动关闭!'});
													$("#orderUsingPaths").flexReload();/** xiaoxiong 20140921 借出后，自动刷新上面的表格 **/
												}else{
													$.dialog.notice({title:'操作提示',content:name+'数据失败！',icon:'error',time:3});
												}
												var obj = $("input:radio[name:'orderCheck']:checked");
												obj.each(function(){
													$(this).closest('tr').remove();
												});
												$("#orderUsingForm tr").remove();
											}
										 ); 
	        					}
	        				}
	        			 }
	        		 },'json');
	      	   

		  	}
			var showcols1=[
						{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
						{display: '', name: 'box', width : 40, align: 'center',metadata:'box'}, 
      				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
      				{display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
      				{display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
      				{display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'},
      				{display: '状态', name: 'status',width : 90,align: 'center',metadata:'status'}
	        			];
			$("#orderUsingPaths").flexigrid({
				url:false,
				dataType: 'json',
				editable: false,
				colModel: showcols1,
				buttons:[],
				showTableToggleBtn: false,
				usepager: true,
				useRp: true,
				rp: 20,
				nomsg:"没有数据",
				pagetext: '第',
				outof: '页 /共',
				width:600,
				height: 160,
				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
			});
			//xiaoxiong 20140921 添加行选择事件监听
			$("#orderUsingPaths tr").live('click',function(){
				$(this).find('div input').change();
				$(this).find('div input').attr('checked',true);
			});
			$("#orderUsingPaths").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'showOrderPaths',type:'all'},'x')}).flexReload();
  			var showColModel1=[
  			                {display: '', name : 'id', width : 40, align: 'center'},
  			   				{display: '借阅单编号', name : 'c4', width : 100, sortable : true, align: 'center',metadata:'Code'},
  			   				{display: '借阅人', name : 'c5', width : 60, sortable : true, align: 'center',metadata:'Reader'},
  			   				{display: '单位', name : 'c6', width : 80, sortable : true, align: 'center',metadata:'Dept'},
  			   				{display: '电话', name : 'c7', width : 80, sortable : true, align: 'center',metadata:'Telephone'},
  			   				{display: '邮箱', name : 'c8', width : 150, sortable : true, align: 'center',metadata:'Email'},
  			   				{display: '利用目的', name : 'c9', width : 80, sortable : true, align: 'center',metadata:'Usepurpose'},
  			   				{display: '催还提前天数', name : 'c10', width : 60, sortable : true, align: 'center',metadata:'Validdate'},
  			   				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true},
  			   				{display: '登记人', name : 'c12', width : 60, sortable : true, align: 'center',metadata:'Register'},
  			   				{display: '登记日期', name : 'c13', width : 110, sortable : true, align: 'center',metadata:'Registdate'},
  			   				{display: '状态', name : 'c14', width : 60, sortable : true, align: 'center',metadata:'Status'},
  			   				{display: '身份证', name : 'c16', width : 60, sortable : true, align: 'center',metadata:'Identity'},
  			   				{display: '卷数', name : 'c17', width : 60, sortable : true, align: 'center',metadata:'FileCount'},
  			   				{display: '件数', name : 'c18', width : 60, sortable : true, align: 'center',metadata:'InnerFileCount'},
  			   				{display: '借阅人Id', name : 'readerId', width : 60, sortable : true, align: 'center',metadata:'readerId',hide:true},
  			   				{display: '备注', name : 'c15', width : 120, sortable : true, align: 'center',metadata:'Description'},
  			   				{display: 'hasDetail', name : 'hasDetail', width : 120, sortable : true, align: 'center',metadata:'hasDetail',hide:true}
  			   				];
  			   		for(var i = 0;i<formFiled.length;i++){
  			   			showColModel1.push({display:formFiled[i].field,name:'d'+formFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+formFiled[i].id});
  			   		}
  			 var buttons1 = [
  			                 	{name: '借出', bclass: 'export',onpress:lendArchiveUpOrder},
  			                 	{name: '借阅', bclass: 'tranlist',onpress:lendArchiveUpOrder}
  			                 ];
  					$("#orderUsingForm").flexigrid({
  						url:false,
  						dataType: 'json',
  						editable: true,
  						colModel: showColModel1,
  						buttons:buttons1,
  						usepager: true,
  						useRp: true,
  						rp: 20,
  						nomsg:"没有数据",
  						showTableToggleBtn: false,
  						pagetext: '第',
  						outof: '页 /共',
  						width:600,
  						height: 160,
  						pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
  					});
				
		}
	  $('.orderUsingPath div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">预约的档案数据</span>').append("<select name='mySelect' style='float:left;margin:2px 0px 3px 5px ;width:120px' ><option value='all' selected>全部预约数据</option><option value='notOrder'>已归还数据</option><option value='order'>未归还数据</option></select>");
		$('.orderUsingPath div[class="tDiv"]').css("border-top","1px solid #ccc");
		 $('.orderUsingForm div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">预约的利用单数据</span>');
			$('.orderUsingForm div[class="tDiv"]').css("border-top","1px solid #ccc");
			$(".orderUsingPath").find("select[name='mySelect']").change(function (){
				var v = $(this).val();
				$("#orderUsingForm tr").remove();
				$("#orderUsingPaths").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'showOrderPaths',type:v},'x')}).flexReload();
			});
  }
  function endUsingForm(){
	  var id='';
	  var checkboxesObj=$("input[name='id']:checked");
	  if(checkboxesObj.length!='1'||checkboxesObj.length=='undefined'){
		  $.dialog.notice({content:'请选择一条要结束的数据！',icon:'warning',time:3});
		  return false;
	  }else{
		  var flag = false;
		  checkboxesObj.each(function(){
			  var trObj=$(this).closest("tr");
			  var status=$("#flexme1").flexGetColumnValue(trObj,['Status']);
			  if(status == '结束'){
				  flag = true;
			  }
			  id=$(this).val();
		  });
		  if(flag){
			  $.dialog.notice({content:'您选择的利用单已经结束了！',icon:'warning',time:3});
			  return
		  }else{
			  $.dialog({
				  content:'确认要结束吗?',
				  ok:true,
				  okVal:'确认',
				  cancel:true,
				  cancelVal:'取消',
				  ok:function(){
					  var url=$.appClient.generateUrl({ESArchiveLending:'endUsingForm'},'x');
					  $.get(url,{id:id},function(data){
						  if(data.success == 'true'){
							  $.dialog.notice({content:'结束成功！',icon:'success',time:3});
							  $("#flexme1").flexReload();
							  return;
						  }else{
							  $.dialog.notice({content:data.message,icon:'error',time:3});
							  $("#flexme1").flexReload();
							  return;
						  }
					  },'json'
					  );
				  },
				  cache:false
			  });
		  }
	  } 
  }
  function relendForForm(){
	  var id='';
	  var checkboxesObj=$("input[name='id']:checked");
	  var flag = false;
	  checkboxesObj.each(function(){
		  var trObj=$(this).closest("tr");
		  var status=$("#flexme1").flexGetColumnValue(trObj,['Status']);
		  if(status == '结束'){
			  flag = true
		  }
		  id=$(this).val();
	  });
	  if(checkboxesObj.length!='1'||checkboxesObj.length=='undefined'){
		  $.dialog.notice({content:'请选择一条要续借的数据！',icon:'warning',time:3});
		  return false;
	  }else if(!flag){
		  var url=$.appClient.generateUrl({ESArchiveLending:'relendForForm'},'x');
		  $.get(url,{id:id},function(res){
			  if(res.success){
				  $.dialog.notice({content:'续借成功',icon : 'succeed',time:3});
				  $("#flexme1").flexReload();
				  return;
			  }else{
				  if(res.message!=null && res.message!= undefined && res.message!= ''){
					  $.dialog.notice({content:res.message,icon:'warning',time:3});
					  $("#flexme1").flexReload();
					  return;
				  }
				//resPage
					var url=$.appClient.generateUrl({ESArchiveLending:'resPage'},'x');
					$.ajax({
					    url:url,
					    success:function(data){
					    var reslutData=$.dialog({
					    	title:'查看结果',
					    	width: '450px',
					    	height:'200px',
					    	padding:'0px',
				    	   	fixed:  true,
				    	    resize: false,
					    	content:data,
							init:showResultData
						 });
						function showResultData(){
							var showcols1=[
				        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
				        				{display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
				        				{display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
				        				{display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'},
				        				{display: '操作结果', name : 'res', width : 150, align: 'center',metadata:'res'}
				        			];
			    			$("#resultData").flexigrid({
			    				url:false,
			    				dataType: 'json',
			    				editable: false,
			    				colModel: showcols1,
			    				showTableToggleBtn: false,
			    				pagetext: '第',
			    				outof: '页 /共',
			    				width: 450,
			    				height: 200
			    			});
				    			for(var i=0;i<res.data.length;i++){
				    			$("#resultData").flexExtendData([{
								'id':res.data[i].id,
								'cell':{
									'path':res.data[i].path,
									'id':res.data[i].storeId,
									'title':res.data[i].title,
									'code':res.data[i].archiveCode,
									'res':'已经没有续借次数了！'
									   }
							}]);
  						}
						}
						$("#flexme1").flexReload();
						}
					});
			  }
		  },'json'
		  );
	  }else if(flag){
		  $.dialog.notice({content:'您选择的利用单已经结束了！',icon:'warning',time:3});
		  return
	  }
  }
  
  function returnForForm(){
	  var id='';
	  var checkboxesObj=$("input[name='id']:checked");
	  var flag = false;
	  checkboxesObj.each(function(){
		  var trObj=$(this).closest("tr");
		  var status=$("#flexme1").flexGetColumnValue(trObj,['Status']);
		  if(status == '结束'){
			  flag =true;
		  }
		  id=$(this).val();
	  });
	  if(checkboxesObj.length!='1'||checkboxesObj.length=='undefined'){
		  $.dialog.notice({content:'请选择一条要归还的数据！',icon:'warning',time:3});
		  return false;
	  }else if(!flag){
		  var siug=0;
		  var url=$.appClient.generateUrl({ESArchiveLending:'returnForForm'},'x');
		  $.get(url,{id:id},function(res){
			  if(null != res.success && res.success == "pathIsNull"){
				  $.dialog.notice({content:res.msg,icon:'warning',time:3});
				  return;
			  }
			  if(res.success){
				  $.dialog.notice({content:'归还成功',icon : 'succeed',time:3});
				  $("#flexme1").flexReload();
				  return;
			  }else{
						if(res.message!=null &&res.message != undefined && res.message != ''){
							  $.dialog.notice({content:res.message,icon:'warning',time:3});
							  $("#flexme1").flexReload();
							  return;
						}
						var htmlContent= "<div><div class='resPath'><table id ='resPath' ></table></div><div class='resForm'><table id ='resForm' ></table></div></div>";
						    $.dialog({
								title:'查看结果',
								width: '450px',
						    	height:'500px',
								lock:true,
								content:htmlContent,
								init:showResultData
						 });
						 
    						function showResultData(){

    							var showcols1=[
											{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
											{display: '', name : 'box', width : 40, align: 'center',metadata:'box'}, 
					        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
					        				{display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
					        				{display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
					        				{display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'},
					        				{display: '状态', name: 'status',width : 90,align: 'center',metadata:'status'}
	  					        			];
				    			$("#resPath").flexigrid({
				    				url:false,
				    				dataType: 'json',
				    				editable: false,
				    				colModel: showcols1,
				    				showTableToggleBtn: false,
				    				pagetext: '第',
				    				outof: '页 /共',
				    				width: 450,
				    				height: 190
				    			});
	  				    			for(var i=0;i<res.data.length;i++){
	  				    			$("#resPath").flexExtendData([{
										'id':res.data[i].id,
										'cell':{
											'num':i+1,
											'box':'<input type="radio" name="orderCheck11"  value="'+res.data[i].path+'" onChange="changeOrderCheck1(\''+res.data[i].path+'\')" />',
												'path':res.data[i].path,
												'title':res.data[i].title,
												'code':res.data[i].archiveCode,
												'status':'预约'
											   }
									}]);
	      						}
	  				    		function lendUsingFormData(name){ 
									var radios = $("input[name='boxForForm']:checked");
                                  if(radios.length != 1){
                                  	$.dialog.notice({title:'操作提示',content:'请选择一条要要借出的数据！',icon:'warning',time:3});
                          			return false;
                                  }
                                  var idm = "";
                                  var path = "";
                                  var ids = "";
                                  var readerId = "";
                                  var readerName = "";
                                  var identity = "";
                                  radios.each(function(){
									     idm = $(this).val().split('|')[0];
									     path = $(this).val().split('|')[1];
									     readerId = $(this).val().split('|')[2];
									     ids = $(this).val().split('|')[3];
									     var trObj=$(this).closest("tr");
									     readerName=$("#flexme1").flexGetColumnValue(trObj,['Reader']);
						                    identity = $("#flexme1").flexGetColumnValue(trObj,['Identity']);
                                      });
	  				      		    $.post($.appClient.generateUrl({ESArchiveLending:'getMaxArchiveCount'},'x'),{idm:idm,idd:ids,path:path,readerId:readerId,identity:identity,readerName:readerName},function(res){
	  				        			 if(res){ 
	  				        				if(res.maxLendCount==0 || res.maxLendCount-1<0){
	  				        					 $.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+res.maxLendCount+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
	  				        					 return false;
	  				        				}else{
	  				        					if(res.data!=null&&res.data!=''){
	  				        						//resPage
	  				        						var url=$.appClient.generateUrl({ESArchiveLending:'resPage'},'x');
	  				        						$.ajax({
	  				        						    url:url,
	  				        						    success:function(data){
	  				        						    var reslutData=$.dialog({
	  				        						    	title:'查看结果',
	  				        						    	width: '450px',
	  				        						    	height:'200px',
	  				        						    	padding:'0px',
	  				        					    	   	fixed:  true,
	  				        					    	    resize: false,
	  				        						    	content:data,
	  				        								init:showResultData
	  				        							 });
	  				        						    function orderResultData(){
	  				        						    	 var checkObj=$("#resultData").find("input[name='orderCheck']:checked");
	  				   	        					   	  if(checkObj.length==0){
	  				   	        					   		  $.dialog.notice({title:'操作提示',icon:'warning',content:'请选择预约数据！',time:3});
	  				   	        					   		  return false;
	  				   	        					   	  }else{
	  				   	        					   		  var ids = [];
	  				   	        					   	$("#resultData").find("input[name='orderCheck']:checked").each(function(){
	  				   	        							ids.push($(this).val());
	  				   	        						});
	  				   	        					 ids=ids.join(',');
	  				   	        					   		  $.post(
	  				   	        					   			$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
	  				   	        					   			{ids:ids,status:'预约'},
	  				   	        					   			function(res){
	  					   	        					   			 if(res){
	  					   	        					   				 reslutData.cancel= true;
	  					   	        				        			 $("input[name='ids3']").attr('checked',false);
	  					   	        				        			 $("#borrowDetails").flexReload();
	  					   	        				        			 $.dialog.notice({
	  					   	        										icon : 'succeed',
	  					   	        										content :  '预约成功！',
	  					   	        										time :2,
	  					   	        										lock:false
	  					   	        				        			 });
	  					   	        								}else{
	  					   	        									$.dialog.notice({
	  					   	        										content:'预约失败！',
	  					   	        										icon:'error',
	  					   	        										time:2
	  					   	        									});
	  					   	        				        		 }
	  				   	        					   			});
	  				   	        					    	
	  				        						    }
	  				        						    }
	  				  	      						function showResultData(){
	  				  	      							var showcols11=[
	  				  	  					        				{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
	  				  	  					        				{display: '<input type="checkbox" name="ids3"/>', name : 'box', width : 40, align: 'center',metadata:'box'}, 
	  				  	  					        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
	  				  	  					        				{display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
	  				  	  					        				{display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
	  				  	  					        				{display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'}
	  				  	  					        			];
	  				  	  				    		var allButtons11=[
	  				  	  				    		        		{name: '预约', bclass: 'order',onpress:orderResultData}
	  				  	  				    		        	];
	  				  	  				    			$("#resultData").flexigrid({
	  				  	  				    				url:false,
	  				  	  				    				dataType: 'json',
	  				  	  				    				editable: false,
	  				  	  				    				colModel: showcols11,
	  				  	  				    				buttons: allButtons11,
	  				  	  				    				showTableToggleBtn: false,
	  				  	  				    				pagetext: '第',
	  				  	  				    				outof: '页 /共',
	  				  	  				    				width: 450,
	  				  	  				    				height: 200
	  				  	  				    			});
	  				  		  				    			for(var i=0;i<res.data.length;i++){
	  				  		  				    			$("#resultData").flexExtendData([{
	  				  											'id':res.data[i].id,
	  				  											'cell':{
	  				  													'num':i+1,
	  				  													'box':'<input type="checkbox" name="orderCheck" id="" value="'+res.data[i].id+'"/>',
	  				  													'path':res.data[i].path,
	  				  													'id':res.data[i].id,
	  				  													'title':res.data[i].title,
	  				  													'code':res.data[i].archive_code
	  				  												   }
	  				  										}]);
	  				  		      						}
	  				  	      						}
	  				  	      						}
	  				        						});
	  				        					}else{
	  				        						 $.post(
	  														$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
	  														{ids:ids,status:name,readerId:readerId,identity:identity,readerName:readerName}, 
	  														function(data){
	  															if(data){
	  																$.dialog.notice({icon:'succeed',content:name+'数据成功',time:3,title:'3秒后自动关闭!'});
	  															}else{
	  																$.dialog.notice({title:'操作提示',content:name+'数据失败！',icon:'error',time:3});
	  															}
	  															$("#resForm tr").remove();
	  															var obj =$("#resPath").find("input[name:'orderCheck11']:checked");
	  															obj.each(function(){
	  																$(this).closest('tr').remove();
		  														});
	  														}
	  													 ); 
	  				        					}
	  				        				}
	  				        			 }
	  				        		 },'json');
		  				    		}
	  				    			var showColModel1=[
	  				    			   				{display: '', name : 'id', width : 40, align: 'center'},
	  				    			   				//{display:'操作', name : 'c3', width : 30, sortable : true, align: 'center',metadata:'edit'},
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
	  				    			   				{display: '借阅人Id', name : 'readerId', width : 60, sortable : true, align: 'center',metadata:'readerId',hide:true},
	  				    			   				{display: '备注', name : 'c15', width : 120, sortable : true, align: 'center',metadata:'Description'}
	  				    			   		    ];
	  				    			var allButtons1 = [
														{name: '借出', bclass: 'back',onpress:lendUsingFormData},
														{name: '借阅', bclass: 'back',onpress:lendUsingFormData}
												        	]
	  				    			   		for(var i = 0;i<formFiled.length;i++){
	  				    			   			showColModel1.push({display:formFiled[i].field,name:'d'+formFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+formFiled[i].id});
	  				    			   		}
	  				    			 
	  				    					$("#resForm").flexigrid({
	  				    						url:false,
	  				    						dataType: 'json',
	  				    						editable: true,
	  				    						colModel: showColModel1,
	  				    						buttons:allButtons1,
	  				    						usepager: true,
	  				    						useRp: true,
	  				    						rp: 20,
	  				    						nomsg:"没有数据",
	  				    						showTableToggleBtn: false,
	  				    						pagetext: '第',
	  				    						outof: '页 /共',
	  				    						width:450,
	  				    						height: 160,
	  				    						pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	  				    					});
	  				    					$("#flexme1").flexReload();
    						}
				  
			  }
		  },'json'
		  );
	  }else if(flag){
		  $.dialog.notice({content:'您选择的利用单已经结束了！',icon:'warning',time:3});
		  return false;
	  }
  }
  //打印借阅单页面的渲染
  function printBorrowPage(){
	  var checkObj=$("#flexme1").find("input[name='id']:checked");
	  if(checkObj.length==0){
		  $.dialog.notice({title:'操作提示',icon:'warning',content:'请选择数据！',time:3});
		  return false;
	  }else if(checkObj.length>0){
		  var htmlContent=["<div class='borrowWrap'>"];
		  $.getJSON($.appClient.generateUrl({ESArchiveLending:'getBorrowDataByBorrowModel',borrowModel:"using"},'x'),function(result){
			  if(result.length==0){
				  $.dialog.notice({title:'操作提示',icon:'warning',content:'目前借阅单没有报表！',time:3});
				  return false;
			  }
			  htmlContent.push("<h2>报表格式选择</h2>");
			  htmlContent.push("<div class='borrowSelect' id='borrowLevel'>");
//			  if(result.length == 1){
//				var reportStyleForOut = '';
//				if((result[0].reportstyle) == 'pdf'){
//					reportStyleForOut = 'PDF';
//				}else if((result[0].reportstyle) == 'xls'){
//					reportStyleForOut = 'EXCEL';
//				}else if((result[0].reportstyle) == 'rtf'){
//					reportStyleForOut = 'WORD';
//				}
//				htmlContent.push("<p><label for='"+(result[0].id)+"'><input type='radio' title='"+(result[0].reportstyle)+"' name='RE' id='"+(result[0].id)+"' value='form' checked='checked' /><span>"+(result[0].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
//			  }else if(result.length == 2){
//			  	var reportStyleForOut = '';
//				if((result[0].reportstyle) == 'pdf'){
//					reportStyleForOut = 'PDF';
//				}else if((result[0].reportstyle) == 'xls'){
//					reportStyleForOut = 'EXCEL';
//				}else if((result[0].reportstyle) == 'rtf'){
//					reportStyleForOut = 'WORD';
//				}
//				var reportStyleForOut1 = '';
//				if((result[1].reportstyle) == 'pdf'){
//					reportStyleForOut1 = 'PDF';
//				}else if((result[1].reportstyle) == 'xls'){
//					reportStyleForOut1 = 'EXCEL';
//				}else if((result[1].reportstyle) == 'rtf'){
//					reportStyleForOut1 = 'WORD';
//				}
//				htmlContent.push("<p><label for='"+(result[0].id)+"'><input type='radio' title='"+(result[0].reportstyle)+"' name='RE' id='"+(result[0].id)+"' value='form' checked='checked' /><span>"+(result[0].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
//				htmlContent.push("<p><label for='"+(result[1].id)+"'><input type='radio' title='"+(result[1].reportstyle)+"' name='RE' id='"+(result[1].id)+"' value='detail' /><span>"+(result[1].title)+'( '+reportStyleForOut1+' )'+"</span></label></p>");
//			  }else if(result.length >2){
				  for(var i=0;i<result.length;i++){
					  var reportStyleForOut = '';
					  if((result[i].reportstyle) == 'pdf'){
						  reportStyleForOut = 'PDF';
					  }else if((result[i].reportstyle) == 'xls'){
						  reportStyleForOut = 'EXCEL';
					  }else if((result[i].reportstyle) == 'rtf'){
						  reportStyleForOut = 'WORD';
					  }
					  if(i==0){
						  htmlContent.push("<p><label for='"+(result[i].id)+"'><input type='radio' title='"+(result[i].reportstyle)+"' name='RE' id='"+(result[i].id)+"' value='form' checked='checked' /><span>"+(result[i].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
					  }else{
						  htmlContent.push("<p><label for='"+(result[i].id)+"'><input type='radio' title='"+(result[i].reportstyle)+"' name='RE' id='"+(result[i].id)+"' value='detail' /><span>"+(result[i].title)+'( '+reportStyleForOut+' )'+"</span></label></p>");
					  }
				  }
//			  }
			  htmlContent.push("</div></div>");
			  htmlContent=htmlContent.join('');
			  $.dialog({
					title:'借阅报表',
					lock:true,
					content:htmlContent,
					ok:printBorrow,
					cancel:true,
					okVal:'确定',
					cancelVal:'取消'
			 });
		  });
	  }
  }
  //打印借阅单
  function printBorrow(){
	  var borrowLV = $('#borrowLevel').find("input[name='RE']:checked");
	  var borrowId=borrowLV.attr('id');
	  var borrowType=borrowLV.attr('title');
	  var reportTitle=borrowLV.next().html();
		if(borrowLV.length==0){
			$.dialog.notice({title:'操作提示',icon:'warning',content:'请选择报表格式！',time:3});
			return false;
		}else{
			var ids=[];
			$("#flexme1").find("input[name='id']:checked").each(function(){
				ids.push($(this).val());
			});
			ids=ids.join(',');
			$.dialog.notice({content: '正在努力打印中,稍后点击“报表下载”进行下载',icon:'success',time:5});
			var url=$.appClient.generateUrl({ESArchiveLending:'printBorrowPage'},'x');			
			$.post(url,{borrowId:borrowId,borrowType:borrowType,ids:ids,reportTitle:reportTitle},function(data){
				
			});
		}
  }
  //第四次修改--提交审批之前需要做的操作    增加
  function approveBefore(){
	//准备可用的参数
	  var borrowPerObj=$("input[name='reader']");
	  var Reader=borrowPerObj.val();
	  //判断是否添加借阅人
	  if(Reader==''){
		  borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
		  $.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
		  return false;
	  }else{
		  var baseBorrow='';
		  var idReader=$("input[name='readerid']").val();
		  if(IreaderD==0){
			  idreader='';
		  }
		  var Reader=$("input[name='reader']").val();
		  var Dept=$("input[name='dept']").val();
		  var Telephone=$("input[name='tel']").val();
		  var Email=$("input[name='email']").val();
		  var Usepurpose=$("select[name='usepurpose']").val();
		  var Validdate=$("input[name='validdate']").val();
		  var Register=$("input[name='register']").val();
		  var Registdate=$("input[name='registdate']").val();
		  var State=$("input[name='status']").val();
		  var Description=$("textarea[name='description']").val();
		  baseBorrow=Reader+'|'+Dept+'|'+Telephone+'|'+Email+'|'+Usepurpose+'|'+Validdate+'|'+Register+'|'+Registdate+'|'+State+'|'+Description;
		  var checkboxes=$("#borrowDetails").find("input[name='id3']");
		  var path=[];
		  var typesour='';
		  if(checkboxes.length>0){
		  		var typesr=[];
		  		var voidTypes='';
   		     	 checkboxes.each(function(){
   		     	 	var path=$(this).val();
					var bothPath=path.split('|');
					typesr.push(bothPath[2]);
   		     	 });
   		     	 voidTypes=typesr.join('');
			  	checkboxes.each(function(){
				   	 var ACode="";
				   	 var title="";
					 var mark= "";
			    	 var type = "";
			    	 var trObj=$(this).closest('tr');
			    	 var checkedpath = $(this).val();
			    	 var checkpath=checkedpath.split('|');
					     checkedpath=checkpath[0];
					 if(checkpath[2]!=''){
					 	 typesour=checkpath[2];
					 }
					 if(checkedpath!=''){
			    		 type=trObj.find("input[name='"+checkedpath+"']:checked").val();
			    	 }else{
			    	 	 var ID=trObj.find("input[name='id3']").attr('id');
			    	 	 if(ID =='' || ID==undefined){
			    	 	 	var nums=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
			    		 	type=trObj.find("input[name='"+nums+"']:checked").val();
			    	 	 }else{
					    	type=trObj.find("input[name='"+ID+"']:checked").val();
			    	 	 }
			    	 }
	     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 /*else if(typesr[0]=='technical'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 }else if(typesr[0]=='auditfiles'){
   		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
   		     	 	 }*/
			         mark=trObj.find("input[name='mark']").val();
			    	 path.push(ACode+'|'+title+'|'+type+'|'+mark+'|'+checkedpath);
				});
		  }
		  paths=path.join(',');
		  var edit=$("input[id='editForm']").val();
		  if(State=='结束' || edit == 'false'){
			  var myDate = new Date();
			  var m = myDate.getMonth()+1;
			  m = m>10?m:("0"+m)
			  var dateStr = myDate.getFullYear()+"-"+m+"-"+myDate.getDate();    
			  if(dateStr == $('#times').val()){
				$.dialog.notice({content:'利用单不能编辑，流程中没有借出档案实体！',icon:'warning',time:3});
				return false;
			  }else{
				  $.dialog.notice({content:'利用单已经结束或者过期，不用保存！',icon:'warning',time:3});
				  return false;
			 }
		  }else{
			  var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
			  var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
			  var reg=/^[1-9]\d*$/;
			  /**   liuhezeng 20140929 添加备注长度验证 **/
				$("textarea[name='description']").keyup(function(){
					if(getByteLen($(this).val())>200){
						$(this).addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
						return false;
					}
					$(this).removeClass("invalid-text").attr("title","");
				});
			  
			  if(!reg.test($("input[name='validdate']").val())){
				  $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
				  $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
				  return false;
			  }else if($("input[name='validdate']").val()>30){
				  $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
				  $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
				  return false;
			  }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
				  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
				  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
				  return false;
			  }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
				  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
				  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
				  return false;
			  }
		  }
	  }
	  //添加登记人的审批意见页面的渲染   增加
	  var opinionURL=$.appClient.generateUrl({ESArchiveLending:'approveBefore'},'x');
	  $.ajax({
		  type:'post',
		  url:opinionURL,
		  data:"baseBorrow=" + baseBorrow + "&paths=" + paths+ "&typesour=" + typesour,
		  success:function(html){
			  $.dialog({
				    title:'添加登记人审批意见',
		  			padding:'0px',
		  			fixed:true,
		  			resize:false,
		  			content:html,
		  			cancelVal:'取消',
		  			cancel:true,
		  			okVal:'确定',
		  			ok:function(){
		  				var approveOpinion=$("textarea[name='approveOpinion']").val();
		  				if(approveOpinion==''){
		  					$.dialog.notice({content:'请输入审批意见！',icon:'warning',time:3});
							return false;
		  				}
		  			  //选择审批人界面的渲染及提交审批的处理  增加
		  			  $.ajax({
		  				  url:$.appClient.generateUrl({ESArchiveLending:'approveToUser'},'x'),
		  				  success:function(userHtml){
		  					  $.dialog({
		  						    title:'选择审批人',
		  				  			padding:'0px',
		  				  			fixed:true,
		  				  			resize:false,
		  				  			content:userHtml,
		  				  			cancelVal:'取消',
		  				  			cancel:true,
		  				  			okVal:'确定',
		  				  			ok:function(){
			  				  			//选择审批人界面参数的处理start
		  				  				var perObj=$("#perList").find("input:checked");
		  				  				if(perObj.length==0){
			  				  				$.dialog.notice({content:'请选择审批人！',icon:'warning',time:3});
			  							    return false;
		  				  				}
		  				  				var perId = $("#perList").find("input:checked").attr('id');
		  								var listId=perId.split('|');
		  								var opinionId=listId[0];
		  								//区分来自于会计借阅管理和借阅管理
		  								var distinguish='false';
		  								//区分来自于会计借阅管理和借阅管理
		  								var url=$.appClient.generateUrl({ESArchiveLending:'submitApprove'},'x');
  										$.post(url,{distinguish:distinguish,opinionId:opinionId,approveOpinion:approveOpinion,idReader:idReader,formId:idm,paths:paths,baseBorrow:baseBorrow,archiveType:typesour},function(result){
  											if(result){
  												//提交成功，关闭所有对话框
  					  				  			var dialogList = $.dialog.list;
  						  				  		for (var i in dialogList) {
  						  				  			dialogList[i].close();
  						  				  		};  												
  												$.dialog.notice({width: 150,content: '提交成功',icon : 'succeed',time: 3});
  												$('#flexme1').flexReload();
  											}else{
  												$.dialog.notice({width: 150,content: '提交失败',icon: 'error',time: 3});
  											}
  										});
		  					    	},
		  							cache:false
		  					  });
		  				  },
		  				  cache:false
		  			  });
		  			  return false;
		  			},
		  			cache:false
			  });
		  },
		  cache:false
	  });
	  return false;
  }
    //双击行弹出编辑面板
	var idm='';
	function modify(tr,g,p)
	{
		idm=$("[name='id']",tr).val();
		show_items(idm);
	}
	//查看借阅管理表单的数据信息
	var formReaderId="";
	var arType="";
	function show_items(id)
	{
		idm=id;
		var trObj=$("#"+idm).closest('tr');
		var placeCode=$("#flexme1").flexGetColumnValue(trObj,['Code']);
		var url=$.appClient.generateUrl({ESArchiveLending:'eidtBorrow',idm:idm},'x');
		$.ajax({
		    url:url,
		    success:function(data){
		    	$.dialog({
			    	title:'借阅单编号：'+placeCode,
			    	width:630,
					height:600,
					padding:'5px 10px',
					fixed:true,
					resize:true,
					button:[{
						name:'保存',
						focus: true
						}],
					okVal:'保存',
				    ok:true,
				    cancelVal: '关闭',
				    cancel: true,
			    	content:data,
			    	ok:function()
			    	{
			    		var form=$('#form_update');
						var thisDialog=this;
						var data=form.serialize();
						var checkboxes=$("#borrowDetails").find("input[name='id3']");
						var checkLength=checkboxes.length;
						var borrowPerObj=form.find("input[name='reader']");
		    		    var borrowPerson=borrowPerObj.val();
		    		    //判断是否添加借阅人
		    		    if(borrowPerson==''){
		    		    	borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
		    		    	$.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
		    		     	return false;
		    		    }
		    		    //判断是否添加借阅明细的数据
		    		    if(checkLength==0){
		    		    	var stat=$("input[id='status']").val();
		    		    	var edit=$("input[id='editForm']").val();
							if(stat=='结束' || edit=='false'){
								var myDate = new Date();
								var m = myDate.getMonth()+1;
								m = m>10?m:("0"+m)
								var dateStr = myDate.getFullYear()+"-"+m+"-"+myDate.getDate();    
								if(dateStr == $('#times').val()){
									$.dialog.notice({content:'利用单不能编辑，流程中没有借出档案实体！',icon:'warning',time:3});
									return false;
								}else{
									$.dialog.notice({content:'利用单已经结束或者过期，不用保存！',icon:'warning',time:3});
									return false;
								}
							}else{
								var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
								var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
								var reg=/^[1-9]\d*$/;
								 for(var i = 0;i<formFiled.length;i++){
									if($('#c'+formFiled[i].id).hasClass("invalid-text")){
			    		     			 return false;
			    		     		 }
			    		     		 if(formFiled[i].isNull == 1 && $('#c'+formFiled[i].id).val()=='' ){
			    		     			 $('#c'+formFiled[i].id).addClass("invalid-text").attr("title","此项不能为空");
			    		     			 return false;
			    		     		 }else{
			    		     			$('#c'+formFiled[i].id).removeClass("invalid-text");
			    		     		 }
			    		     	 }
								 /**  验证邮箱长度   **/
				    		     	if($("input[name='email']").val().length>50){
				    		     		  $("input[name='email']").addClass("invalid-text").attr("title","邮箱的最大长度为50个字符！");
										  $.dialog.notice({content:'邮箱输入不合法，请重新输入！',icon:'warning',time:3});
										  return false;
				    		     	}
				    		     	/**    验证单位长度   **/
				    		     	if(jmz.GetLength($("input[name='dept']").val())>50){
				    		     		  $("input[name='dept']").addClass("invalid-text").attr("title","单位的最大长度为25个汉字！");
										  $.dialog.notice({content:'单位输入不合法，请重新输入！',icon:'warning',time:3});
										  return false;
				    		     	}
				    		     	
				    		     	/**  验证备注长度    **/
				    		     	if(jmz.GetLength($("textarea[name='description']").val())>200){
				    		     		  $("textarea[name='description']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
										  $.dialog.notice({content:'备注输入不合法，请重新输入！',icon:'warning',time:3});
										  return false;
				    		     	}
				    		     	
								if(!reg.test($("input[name='validdate']").val())){
									$("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
								    $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
								    return false;
								}else if($("input[name='validdate']").val()>30){
									$("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
									$.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
									return false;
								}else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
									  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
									  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
									  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
									  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else{
									var url=$.appClient.generateUrl({ESArchiveLending:'saveModify',idm:idm},'x');
									$.post(url,{data:data,IreaderD:IreaderD},function(result){
										if(result){
											thisDialog.close();
											$.dialog.notice({width: 150,content: '修改成功',icon : 'succeed',time: 3});
											$('#flexme1').flexReload();
										}else{
											$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
										}
									});
								}
							}
		    		     }else{
		    		     	var typesr=[];
		    		     	var voidTypes='';
		    		     	 checkboxes.each(function(){
		    		     	 	var path=$(this).val();
								var bothPath=path.split('|');
								typesr.push(bothPath[2]);
		    		     	 });
		    		     	 voidTypes=typesr.join('');
	    		    	 	var editpath=[];
	    		    	 	var oValue=[];
	    		    	 	var flag = true;
	    		    	 	var illegalFields = "";
			    			checkboxes.each(function(){
			    				 var Aode="";
			    				 var ttle="";
			    				 var st="";
			    			   	 var ID="";
			    				 var editmark= "";
			    				 var arctype="";
			    		    	 var edittype = "";
			    		    	 var trObj=$(this).closest('tr');
			    		    	 var checkedpath = $(this).val();
			    		    	 var updateId = $(this).attr('id');
			    		    	 var checkpath=checkedpath.split('|');
				    		    	 checkedpath=checkpath[0];
				    		    	 ID = checkpath[1];
				    		    	 var nums = $("#borrowDetails").flexGetColumnValue(trObj,['num']);
				    		     if(checkpath[2]!=''){
				    		     	arctype=checkpath[2];
				    		     }
				    		    	edittype=arctype;
			    		    	 for(var i = 0;i<formFiled.length;i++){
			    		    		 if($('#c'+formFiled[i].id).hasClass("invalid-text")){
			    		     			 return false;
			    		     		 }
			    		     		 if(formFiled[i].isNull == 1 && $('#c'+formFiled[i].id).val()=='' ){
			    		     			 $('#c'+formFiled[i].id).addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
			    		     			 return false;
			    		     		 }else{
			    		     			$('#c'+formFiled[i].id).removeClass("invalid-text");
			    		     		 }
			    		     		 
			    		     	 }
	    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
		    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 /*else if(typesr[0]=='technical'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 }else if(typesr[0]=='auditfiles'){
		    		     	 	 	 Aode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
			    		         	 ttle=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
		    		     	 	 }*/
			    		    	 st=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			    		    	 editmark=trObj.find("input[name='mark']").val();
			    		    	 editpath.push(ID+'@@'+updateId+'|'+edittype+'|'+editmark+'|'+Aode+'|'+ttle+'|'+checkedpath+'|'+st+'|'+arctype);
			    		    	 //guolanrui 20141013 添加对备注字段的超长的验证
			    		    	 if(getByteLen(editmark)>200){
			    		    		 	trObj.find("input[name='mark']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
			    		    		 	flag = false;
			    				 }
			    		    	 //shimiao 20140805 校验利用库的数据
			    		    	 for(var i = 0;i<storeFiled.length;i++){
			    		    		 if($('#d'+storeFiled[i].id+nums).hasClass("d"+storeFiled[i].id+" invalid-text")){
			    		    			 flag = false;
			    		    			 illegalFields+=('#d'+storeFiled[i].id+nums+"|");
			    		    		 }
			    		    		 if(storeFiled[i].isNull == 1 && $('#d'+storeFiled[i].id+nums).val()=='' ){
			    		    			 $('#d'+storeFiled[i].id +nums).addClass("invalid-text").attr("title","此项不能为空");
			    		    			 flag = false;
			    		    		 }else{
			    		    			 $('#d'+storeFiled[i].id+nums).removeClass("invalid-text");
			    		    		 }
			    		    	 }
			    		    	 var otherValue = "";
			    		    	 for(var i = 0;i<storeFiled.length;i++){
			    		    		 otherValue +='c'+storeFiled[i].id +"@:@"+ $("#d"+storeFiled[i].id+nums).val()+"|"; 
			    		    	 }
			    		         otherValue = otherValue.substr(0,otherValue.length-1);
			    		         oValue.push(otherValue);
			    			});
			    			if(!flag){
			    				/**  liuhezeng 20140929 添加不合法验证标红显示  **/
			    				var spliteStr = illegalFields.split("|");
			    				for(var i = 0 ; i<spliteStr.length;i++){
			    					$(spliteStr[i]).addClass("invalid-text");
			    				}
			    				$.dialog.notice({width: 150,content: '利用库的某些字段不合法!',icon: 'warning',time: 3});
			    				return false;
			    			}
			    			paths=editpath.join(',');
			    			oValues = oValue.join(',');
							var stat=$("input[id='status']").val();
							var edit=$("input[id='editForm']").val();
							if(stat== '结束' || edit=='false'){
								var myDate = new Date();
								var m = myDate.getMonth()+1;
								m = m>10?m:("0"+m)
								var dateStr = myDate.getFullYear()+"-"+m+"-"+myDate.getDate();    
								if(dateStr == $('#times').val()){
									$.dialog.notice({content:'利用单不能编辑，流程中没有借出档案实体！',icon:'warning',time:3});
									return false;
								}else{
								$.dialog.notice({content:'利用单已经结束或者过期，不用保存！',icon:'warning',time:3});
								return false;
								}
							}else{
								 for(var i = 0;i<formFiled.length;i++){
									 if($('#c'+formFiled[i].id).hasClass("invalid-text")){
			    		     			 return false;
			    		     		 }
			    		     		 if(formFiled[i].isNull == 1 && $('#c'+formFiled[i].id).val()=='' ){
			    		     			 $('#c'+formFiled[i].id).addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
			    		     			 return false;
			    		     		 }else{
			    		     			$('#c'+formFiled[i].id).removeClass("invalid-text");
			    		     		 }
			    		     	 }
								var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
								var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
								var reg=/^[1-9]\d*$/;
								/**  验证邮箱长度   **/
			    		     	if($("input[name='email']").val().length>50){
			    		     		  $("input[name='email']").addClass("invalid-text").attr("title","邮箱的最大长度为50个字符！");
									  $.dialog.notice({content:'邮箱输入不合法，请重新输入！',icon:'warning',time:3});
									  return false;
			    		     	}
			    		     	/**    验证单位长度   **/
			    		     	if(jmz.GetLength($("input[name='dept']").val())>50){
			    		     		  $("input[name='dept']").addClass("invalid-text").attr("title","单位的最大长度为25个汉字！");
									  $.dialog.notice({content:'单位输入不合法，请重新输入！',icon:'warning',time:3});
									  return false;
			    		     	}
			    		     	
			    		     	/**  验证备注长度    **/
			    		     	if(jmz.GetLength($("textarea[name='description']").val())>200){
			    		     		  $("textarea[name='description']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
									  $.dialog.notice({content:'备注输入不合法，请重新输入！',icon:'warning',time:3});
									  return false;
			    		     	}
								if(!reg.test($("input[name='validdate']").val())){
									$("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
								    $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
								    return false;
								}else if($("input[name='validdate']").val()>30){
									$("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
									$.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
									return false;
								}else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
									  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
									  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
									  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
									  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
									  return false;
								}else{
									var url=$.appClient.generateUrl({ESArchiveLending:'saveModify',idm:idm},'x');
									$.post(url,{data:data,paths:paths,oValues:oValues,IreaderD:IreaderD},function(result){
										if(result){
											thisDialog.close();
											$.dialog.notice({width: 150,content: '修改成功',icon : 'succeed',time: 3});
											$('#flexme1').flexReload();
										}else{
											$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
										}
									});
								}
							}
		    		     }
					 },
					 init:initBorrowDetails
			    });
		    	//初始化显示借阅明细页面时,根据表单的状态控制明细中的按钮
		    	function initBorrowDetails(){
					var ACodeMeta='';
					var titleMeta='';
					ACodeMeta='ArchivalCode';
					titleMeta='Title';
							var showcols=[
					        				{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
					        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
					        				{display: "档号", name : 'c3', width : 60, align: 'left',metadata:ACodeMeta},
					        				{display: "题名", name: 'c4',width : 80,align: 'left',metadata:titleMeta},
					        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
					        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
					        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
					        				{display: '应归还日期', name: 'shouldReturnDate',width : 60,align: 'center',metadata:'shouldReturnDate'},
					        				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true},
					        				{display: '归还日期', name: 'c12',width : 60,align: 'center',metadata:'RETURN_DATE'},
					        				{display: '卷数', name: 'c9',width : 90,align: 'center',metadata:'fileCount'},
					        				{display: '件数', name: 'c10',width : 90,align: 'center',metadata:'innerFileCount'},
					        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
					        				{display: 'idParent', name: 'idParent',width : 90,align: 'center',metadata:'idParent',hide:true},
					        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'}
					        			];
//							storeFiled
							for(var i = 0;i<storeFiled.length;i++){
								showcols.push({display:storeFiled[i].field,name:'d'+storeFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+storeFiled[i].id});
							}
							var checkboxesObj = $("#flexme1").find("input[name='checkbox']:checked");
							var edit = $("input[id='editForm']").val();
							  var allButtons=[
							                  {name: '选择系统档案', bclass: 'add',onpress:addEditDetails},
							                  {name: '手工录入', bclass: 'add',onpress:addLineDetail},
							                  {name: '删除', bclass: 'delete',onpress:delEditDetails},
							                  {name: '借阅', bclass: 'tranlist',onpress:changeStatus},
							                  {name: '借出', bclass: 'export',onpress:changeStatus},
							                  {name: '续借', bclass: 'export',onpress:changeStatusForRelend},
							                  {name: '归还', bclass: 'back',onpress:changeStatus}
							                  ];
							  if(edit=='false'){
								   allButtons=[
								                  {name: '续借', bclass: 'export',onpress:changeStatusForRelend},
								                  {name: '归还', bclass: 'back',onpress:changeStatus}
								                  ];
							  }
				    		var status=$("input[id='status']").val();
				    		if( status=='未结束'){
				    			$(".bottom").html('<table id="borrowDetails"></table>');
				    			$("#borrowDetails").flexigrid({
				    				url:$.appClient.generateUrl({ESArchiveLending:'showDetails',idm:idm},'x'),
				    				dataType: 'json',
				    				editable: true,
				    				colModel: showcols,
				    				buttons: allButtons,
				    				title: '借阅明细列表',
				    				width: 620,
				    				height: 220,
				    				onSuccess:function(){
				    					DetailValueBlur();
				    				}
				    			});
				    			$("#borrowDetails").flexReload();
				    			$('.bottom div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">利用库数据</span>');
				    			$('.bottom div[class="tDiv"]').css("border-top","1px solid #ccc");
				    			
				    		}else {
				    			$(".bottom").html('<table id="borrowDetails"></table>');
				    			$("#borrowDetails").flexigrid({
				    				url:$.appClient.generateUrl({ESArchiveLending:'showDetails',idm:idm},'x'),
				    				dataType: 'json',
				    				editable: true,
				    				colModel: showcols,
				    				usepager: true,
				    				title: '借阅明细列表',
				    				useRp: true,
				    				rp: 20,
				    				nomsg:"没有数据",
				    				showTableToggleBtn: false,
				    				pagetext: '第',
				    				outof: '页 /共',
				    				width: 620,
				    				height: 230,
				    				pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
				    				onSuccess:function(){
				    					DetailValueBlur();
				    				}
				    			});
				    			$("#borrowDetails").flexReload();
				    			$('.bottom div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">利用库数据</span>');
				    			$('.bottom div[class="tDiv"]').css("border-top","1px solid #ccc");
				    		}
		    	}
		    },
			cache:false
		});
	}
  //筛选数据后还原数据
  function backIndex(){
	  $('#queryflexme1Word').val('请输入关键字');
	  var statusForTree = $('input[name="statusForTree"]:checked').val();
	  //guolanrui 20140901 增加一个标识，防止刷数据时重复记录日志
	  $("#flexme1").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_new',id:treeNodeForGrid.id,pId:treeNodeForGrid.pId},'x'),newp:1,query:{statusForTree:statusForTree}}).flexReload();
	  var logurl=$.appClient.generateUrl({ESLog:'saveLog'},'x');
	  $.ajax({  url:logurl,
			 async : false,
			 type : "POST", 
			 dataType : "json", 
			 data:{model:'借阅管理',type:'operation',loginfo:'借阅管理:还原数据',operate:'借阅管理:还原数据'},
			 success :function(result){
			 }
	  });		 
  }
  //直接借阅、借出
  function directForLendUsingForm(status){
		var form=$("#form_add");
		var thisDialog=this;
		var data=form.serialize();
		var checkboxes=$("#borrowDetails").find("input[name='id3']");
	    var path=[];
	    var oValue=[];
	    var checkLength=checkboxes.length;
	    var borrowPerObj=form.find("input[name='reader']");
	    var borrowPerson=borrowPerObj.val();
	    //判断是否添加借阅人
	    if(borrowPerson==''){
	    	borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
	    	$.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
	     	return false;
	    }
	     //判断是否含有借阅明细的数据
	     if(checkLength==0){
	    	 $.dialog.notice({content:'请您输入或者选择要借阅的利用库数据！',icon:'warning',time:3});
		     	return false;
	     }else{
	     	 var typesr=[];
	     	 var voidTypes='';
	     	 checkboxes.each(function(){
	     	 	var path=$(this).val();
				var bothPath=path.split('|');
				typesr.push(bothPath[2]);
	     	 });
	     	 voidTypes=typesr.join('');
	     	 var flag = true;
	     	 var illegalFields = "";
	    	 checkboxes.each(function(){
		    	 var ACode= "";
   			 var title= "";
   			 var markl= "";
		    	 var type = "";
		    	 var arctype="";
		    	 var fileCount="";
		    	 var innerFileCount="";
		    	 var nums = "";
		    	 var trObj=$(this).closest('tr');
		    	 var checkedpath = $(this).val();
		    	 chosecheckedpath=checkedpath.split('|');
  		   	 checkedpath=chosecheckedpath[0];
  		   	 if(chosecheckedpath[2]!=''){
  		   	 	arctype=chosecheckedpath[2];
  		   	 }
  		   	 nums=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
  		   	 type= $("#borrowDetails").flexGetColumnValue(trObj,['type']);
		    	 var idParent = $("#borrowDetails").flexGetColumnValue(trObj,['idParent']);
		    	 if(idParent==''){
		    		 fileCount = trObj.find("input[name^='fileCount']").val();
		    		 innerFileCount = trObj.find("input[name^='innerFileCount']").val();
		    	 }else{
		    		 fileCount = $("#borrowDetails").flexGetColumnValue(trObj,['fileCount']);
		    		 innerFileCount = $("#borrowDetails").flexGetColumnValue(trObj,['innerFileCount']);
		    	 }
		    	
     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
	         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
	     	 	 
		         markl=trObj.find("input[name='mark']").val();
		         path.push(ACode+'|'+title+'|'+markl+'|'+type+'|'+checkedpath+'|'+arctype+'|'+fileCount+'|'+innerFileCount+'|'+idParent);
		       //guolanrui 20141013 添加对备注字段的超长的验证
		    	 if(getByteLen(markl)>200){
		    		 	trObj.find("input[name='mark']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
		    		 	flag = false;
				 }
		         var otherValue = "";
		         for(var i = 0;i<storeFiled.length;i++){
		    		 if($('#d'+storeFiled[i].id+nums).hasClass("d"+storeFiled[i].id+" invalid-text")){
		    			 flag = false;
		    			 illegalFields+=('#d'+storeFiled[i].id+nums+"|");
		    		 }
		    		 if(storeFiled[i].isNull == 1 && $('#d'+storeFiled[i].id+nums).val()=='' ){
		    			 $('#d'+storeFiled[i].id +nums).addClass("invalid-text").attr("title","此项不能为空");
		    			 flag = false;
		    		 }else{
		    			 $('#d'+storeFiled[i].id+nums).removeClass("invalid-text");
		    		 }
		    	 }
		         for(var i = 0;i<storeFiled.length;i++){
		    		 otherValue +=  'c'+storeFiled[i].id +":"+ $("#d"+storeFiled[i].id+nums).val()+"|"; 
		    	 }
		         otherValue = otherValue.substr(0,otherValue.length-1);
		         oValue.push(otherValue);
	    	 });
	    	 if(!flag){
	    		 /**  liuhezeng 20140929 添加不合法验证标红显示  **/
 				var spliteStr = illegalFields.split("|");
 				for(var i = 0 ; i<spliteStr.length;i++){
 					$(spliteStr[i]).addClass("invalid-text");
 				}
	    		 $.dialog.notice({width: 150,content: '利用库的某些字段不合法',icon: 'warning',time: 3});
			     return false;
	    	 }
		     paths=path.join(',');
		     oValues=oValue.join(',');
		     var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
		     var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
		     var reg=/^[1-9]\d*$/;
		     var regUser=/^((\d{18})|(\d{17}[X])|(\d{17}[x]))*$/;
		     for(var i = 0;i<formFiled.length;i++){
		    	 if($('#c'+formFiled[i].id).hasClass("invalid-text")){
	     			 return false;
	     		 }
	     		 if(formFiled[i].isNull == 1 && $('#c'+formFiled[i].id).val()=='' ){
	     			 $('#c'+formFiled[i].id).addClass("invalid-text").attr("title","此项不能为空");
	     			 return false;
	     		 }else{
	     			$('#c'+formFiled[i].id).removeClass("invalid-text");
	     		 }
	     	 }
		     if($("input[name='readerid']").val()=='' || $("input[name='readerid']").val()=='-1'){
				 if((!regUser.test($("input[name='identity']").val()))){
					 $.dialog.notice({content:'请输入合法的身份证号！',icon:'warning',time:3});
					  $("input[name='identity']").addClass("invalid-text").attr("title","请输入合法的身份证号");
					  return false;
					}else if($("input[name='identity']").val() == null || $("input[name='identity']").val()==''){
						$.dialog.notice({content:'此项不能为空！',icon:'warning',time:3});
						$("input[name='identity']").addClass("invalid-text").attr("title","此项不能为空");	
						return false;
					}else{
						$("input[name='identity']").removeClass("invalid-text").attr("title","");
					}
			 }
		     
		     /**   liuhezeng 20140929 添加备注长度验证 **/
		 	$("textarea[name='description']").keyup(function(){
		 		if(getByteLen($(this).val())>200){
		 			$(this).addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
		 			return false;
		 		}
		 		$(this).removeClass("invalid-text").attr("title","");
		 	});
		     
			 if(!reg.test($("input[name='validdate']").val())){
				 $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
				 $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
				 return false;
			 }else if($("input[name='validdate']").val()>30){
				 $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
				 $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
				 return false;
			 }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
				  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
				  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
				  return false;
			  }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
				  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
				  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
				  return false;
			  }else{
				 var url=$.appClient.generateUrl({ESArchiveLending:'directForLendUsingForm'},'x');
				 var flag = false;
				 $.ajax({  url:url,
					 async : false,
					 type : "POST", 
					 dataType : "json", 
					 data:{data:data,paths:paths,oValues:oValues,IreaderD:IreaderD,status:status},
					 success :function(result,stats){
					if(result.successAll){
						$.dialog.notice({width: 150,content: '直接'+status+'成功',icon : 'succeed',time: 3});
						$('#flexme1').flexReload();
						flag = true;
					}else{
						if(!result.success){
							 $.dialog.notice({title:'操作提示',content:'最大的借出件数为：'+result.maxId+'份,您勾选的数据的件数已经超出。',icon:'warning',time:3});
							 flag = false;
        				}else if(result.checkPath != null && result.checkPath != undefined && result.checkPath){
        					$('#flexme1').flexReload();
        					var usingFormId = result.id;
        					 var htmlContent = "<div class='orderUsingDetail'><table id='orderUsingdetailtable'></table></div>";
        					  $.dialog({
        							title:'查看结果',
        							width: 580,
				    				height: 220,
        							lock:true,
        							padding:0,
        							content:htmlContent,
        							init:showResultData
        					 });
        					  function showResultData(){
        						  var ACodeMeta='';
        							var titleMeta='';
        							ACodeMeta='ArchivalCode';
        							titleMeta='Title';
        									var showcols=[
        							        				{display: '序号', name : 'num', width : 40, align: 'center',metadata:'num'}, 
        							        				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 40, align: 'center'},
        							        				{display: "档号", name : 'c3', width : 60, align: 'left',metadata:ACodeMeta},
        							        				{display: "题名", name: 'c4',width : 80,align: 'left',metadata:titleMeta},
        							        				{display: '借阅类型', name: 'c5',width : 183,align: 'left',metadata:'type'},
        							        				{display: '状态', name: 'c6',width : 50,align: 'center',metadata:'status'},
        							        				{display: '发生日期', name: 'c8',width : 60,align: 'center',metadata:'date'},
        							        				{display: '卷数', name: 'c9',width : 90,align: 'center',metadata:'fileCount'},
        							        				{display: '件数', name: 'c10',width : 90,align: 'center',metadata:'innerFileCount'},
        							        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
        							        				{display: 'idParent', name: 'idParent',width : 90,align: 'center',metadata:'idParent',hide:true},
        							        				{display: '备注', name: 'c7', width :90,align: 'center',metadata:'mark'},
        							        				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true}
        							        			];
//        									storeFiled
        									for(var i = 0;i<storeFiled.length;i++){
        										showcols.push({display:storeFiled[i].field,name:'d'+storeFiled[i].id,width:80,sortable : true, align: 'center',metadata:'d'+storeFiled[i].id});
        									}
        									
        									 function orderResultData1(){
     	        						    	 var checkObj=$("#orderUsingdetailtable").find("input[name='id3']:checked");
     	   	        					   	  if(checkObj.length==0){
     	   	        					   		  $.dialog.notice({title:'操作提示',icon:'warning',content:'请选择预约数据！',time:3});
     	   	        					   		  return false;
     	   	        					   	  }else{
     	   	        					   		  var ids = [];
	     	   	        					   	$("#orderUsingdetailtable").find("input[name='id3']:checked").each(function(){
	     	   	        							ids.push($(this).attr('id'));
	     	   	        						});
	     	   	        					   	ids=ids.join(',');
     	   	        					   		  $.post(
     	   	        					   			$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
     	   	        					   			{ids:ids,status:'预约'},
     	   	        					   			function(res1){
     		   	        					   			 if(res1){
     		   	        				        			 $("#orderUsingdetailtable").flexReload();
     		   	        				        			 $.dialog.notice({
     		   	        										icon : 'succeed',
     		   	        										content :  '预约成功！',
     		   	        										time :2,
     		   	        										lock:false
     		   	        				        			 });
     		   	        								}else{
     		   	        									$.dialog.notice({
     		   	        										content:'预约失败！',
     		   	        										icon:'error',
     		   	        										time:2
     		   	        									});
     		   	        				        		 }
     	   	        					   			}
     	   	        					   		  );
     	   	        					    	
     	        						    }
     	        						    }
        									 
        									  var allButtons=[
        									                  {name: '预约', bclass: 'order',onpress:orderResultData1}
        									                  ];
        										$("#orderUsingdetailtable").flexigrid({
        											url:false,
        											dataType: 'json',
        											editable: true,
        											colModel : showcols,
        											buttons : allButtons,
        						    				showTableToggleBtn: false,
        						    				width: 580,
        						    				height: 190
        										});
        										$("#orderUsingdetailtable").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'showDetails',idm:usingFormId,status:'order'},'x')}).flexReload();	
        										
        					  }
        					  flag = true;
						}
					}
				 }
					 });
				 return flag;
			 }
	     }
	
  }
  //添加借阅管理表单数据
  var IreaderD=0;
  function addBorrowFormInside(input)
  {
	  var flag = false;
	  if(input == '外部利用单'){
		  flag = false;
	  }else{
		  flag = true;
	  }
  	  idm='';
  	  archiveType='';
	  var url=$.appClient.generateUrl({ESArchiveLending:'add',flag:flag},'x');
	  $.ajax({
		  url:url,
		  success:function(data){
			$.dialog({
				title:'添加借阅管理表单',
				width:630,
				height:600,
				padding:0,
				button:[{
					name:'直接借阅',
					callback:function(){
						var flag =  directForLendUsingForm('借阅');
						var thisDialog=this;
						if(!flag){
							return false;
						}else{
							thisDialog.close();	
						}
					}
					},{
						name:'直接借出',
						callback:function(){
							var flag = directForLendUsingForm('借出');
							var thisDialog=this;
							if(!flag){
								return false;
							}else{
								thisDialog.close();
							}
						}
						},{
					name:'保存',
					focus: true
					}],
				okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
	    		content:data,
	    		ok:function(){
	    			var form=$("#form_add");
	    			var thisDialog=this;
	    			var data=form.serialize();
	    			var checkboxes=$("#borrowDetails").find("input[name='id3']");
	    		    var path=[];
	    		    var oValue=[];
	    		    var checkLength=checkboxes.length;
	    		    var borrowPerObj=form.find("input[name='reader']");
	    		    var borrowPerson=borrowPerObj.val();
	    		    //判断是否添加借阅人
	    		    if(borrowPerson==''){
	    		    	borrowPerObj.addClass("invalid-text").attr("title","此项不能为空");
	    		    	$.dialog.notice({content:'请添加借阅人信息！',icon:'warning',time:3});
	    		     	return false;
	    		    }
	    		     //判断是否含有借阅明细的数据
	    		     if(checkLength==0){
	    		    	 var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
	    		    	 var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
	    		     	 var reg=/^[1-9]\d*$/;
	    		     	  var regUser=/^((\d{18})|(\d{17}[X])|(\d{17}[x]))*$/;
	    		     	 for(var i = 0;i<formFiled.length;i++){
	    		     		if($('#c'+formFiled[i].id).hasClass("invalid-text")){
	    		     			 return false;
	    		     		 }
	    		     		 if(formFiled[i].isNull == 1 && $('#c'+formFiled[i].id).val()=='' ){
	    		     			 $('#c'+formFiled[i].id).addClass("invalid-text").attr("title","此项不能为空");
	    		     			 return false;
	    		     		 }else{
	    		     			$('#c'+formFiled[i].id).removeClass("invalid-text");
	    		     		 }
	    		     	 }
	    		     	if($("input[name='readerid']").val()=='' || $("input[name='readerid']").val()=='-1'){
							 if((!regUser.test($("input[name='identity']").val()))){
								 $.dialog.notice({content:'请输入合法的身份证号！',icon:'warning',time:3});
								  $("input[name='identity']").addClass("invalid-text").attr("title","请输入合法的身份证号");
								  return false;
								}else if($("input[name='identity']").val() == null || $("input[name='identity']").val()==''){
									$.dialog.notice({content:'此项不能为空！',icon:'warning',time:3});
									$("input[name='identity']").addClass("invalid-text").attr("title","此项不能为空");	
									return false;
								}else{
									$("input[name='identity']").removeClass("invalid-text").attr("title","");
								}
						 }
	    		     	/**  验证邮箱长度   **/
	    		     	if($("input[name='email']").val().length>50){
	    		     		  $("input[name='email']").addClass("invalid-text").attr("title","邮箱的最大长度为50个字符！");
							  $.dialog.notice({content:'邮箱输入不合法，请重新输入！',icon:'warning',time:3});
							  return false;
	    		     	}
	    		     	/**    验证单位长度   **/
	    		     	if(jmz.GetLength($("input[name='dept']").val())>50){
	    		     		  $("input[name='dept']").addClass("invalid-text").attr("title","单位的最大长度为25个汉字！");
							  $.dialog.notice({content:'单位输入不合法，请重新输入！',icon:'warning',time:3});
							  return false;
	    		     	}
	    		     	
	    		     	/**  验证备注长度    **/
	    		     	if(jmz.GetLength($("textarea[name='description']").val())>200){
	    		     		  $("textarea[name='description']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
							  $.dialog.notice({content:'备注输入不合法，请重新输入！',icon:'warning',time:3});
							  return false;
	    		     	}
	    		     	
	    		     	
						 if(!reg.test($("input[name='validdate']").val())){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
							 $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
							 return false;
						 }else if($("input[name='validdate']").val()>30){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
							 $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
							 return false;
						 }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
							  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
							  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						 }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
							  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
							  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						 }else if(parseInt($("input[name='fileCount']").val())>parseInt($("input[name='innerFileCount']").val())){
							 $("input[name='fileCount']").addClass("invalid-text").attr("title","卷数不能超过件数");
							  $.dialog.notice({content:'卷数不能超过件数',icon:'warning',time:3});
							  return false;
						 }else{
							 var url=$.appClient.generateUrl({ESArchiveLending:'addForm'},'x');
							 $.post(url,{data:data,IreaderD:IreaderD},function(result){
								if(result){
									thisDialog.close();
									$.dialog.notice({width: 150,content: '添加成功',icon: 'succeed',time: 3});
									$('#flexme1').flexReload();
								}else{
									$.dialog.notice({width: 150,content: '添加失败',icon: 'error',time: 3});
								}
							 });
						 }
	    		     }else{
	    		     	 var typesr=[];
	    		     	 var voidTypes='';
	    		     	 checkboxes.each(function(){
	    		     	 	var path=$(this).val();
							var bothPath=path.split('|');
							typesr.push(bothPath[2]);
	    		     	 });
	    		     	 voidTypes=typesr.join('');
	    		     	 var flag = true;
	    		     	var illegalFields = "";
	    		    	 checkboxes.each(function(){
		    		    	 var ACode= "";
		 	    			 var title= "";
		 	    			 var markl= "";
		    		    	 var type = "";
		    		    	 var arctype="";
		    		    	 var fileCount="";
		    		    	 var innerFileCount="";
		    		    	 var nums = "";
		    		    	 var trObj=$(this).closest('tr');
		    		    	 var checkedpath = $(this).val();
		    		    	 chosecheckedpath=checkedpath.split('|');
			    		   	 checkedpath=chosecheckedpath[0];
			    		   	 if(chosecheckedpath[2]!=''){
			    		   	 	arctype=chosecheckedpath[2];
			    		   	 }
			    		   	 nums=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
			    		   	 type= $("#borrowDetails").flexGetColumnValue(trObj,['type']);
		    		    	 var idParent = $("#borrowDetails").flexGetColumnValue(trObj,['idParent']);
		    		    	 if(idParent==''){
		    		    		 fileCount = trObj.find("input[name^='fileCount']").val();
		    		    		 innerFileCount = trObj.find("input[name^='innerFileCount']").val();
		    		    	 }else{
		    		    		 fileCount = $("#borrowDetails").flexGetColumnValue(trObj,['fileCount']);
		    		    		 innerFileCount = $("#borrowDetails").flexGetColumnValue(trObj,['innerFileCount']);
		    		    	 }
		    		    	
    		     	 	 	 ACode=$("#borrowDetails").flexGetColumnValue(trObj,['ArchivalCode']);
	    		         	 title=$("#borrowDetails").flexGetColumnValue(trObj,['Title']);
	    		     	 	 
		    		         markl=trObj.find("input[name='mark']").val();
		    		         path.push(ACode+'|'+title+'|'+markl+'|'+type+'|'+checkedpath+'|'+arctype+'|'+fileCount+'|'+innerFileCount+'|'+idParent);
		    		       //guolanrui 20141013 添加对备注字段的超长的验证
		    		    	 if(getByteLen(markl)>200){
		    		    		 	trObj.find("input[name='mark']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
		    		    		 	flag = false;
		    				 }
		    		         var otherValue = "";
		    		         for(var i = 0;i<storeFiled.length;i++){
		    		    		 if($('#d'+storeFiled[i].id+nums).hasClass(storeFiled[i].id+" invalid-text")){
		    		    			 flag = false;
		    		    			 illegalFields+=('#d'+storeFiled[i].id+nums+"|");
		    		    		 }
		    		    		 if(storeFiled[i].isNull == 1 && $('#d'+storeFiled[i].id+nums).val()=='' ){
		    		    			 $('#d'+storeFiled[i].id +nums).addClass("invalid-text").attr("title","此项不能为空");
		    		    			 flag =  false;
		    		    		 }else{
		    		    			 $('#d'+storeFiled[i].id+nums).removeClass("invalid-text");
		    		    		 }
		    		    	 }
		    		         for(var i = 0;i<storeFiled.length;i++){
		    		    		 otherValue +=  'c'+storeFiled[i].id +":"+ $("#d"+storeFiled[i].id+nums).val()+"|"; 
		    		    	 }
		    		         otherValue = otherValue.substr(0,otherValue.length-1);
		    		         oValue.push(otherValue);
	    		    	 });
	    		    	 if(!flag){
	    		    		 /**  liuhezeng 20140929 添加不合法验证标红显示  **/
			    				var spliteStr = illegalFields.split("|");
			    				for(var i = 0 ; i<spliteStr.length;i++){
			    					$(spliteStr[i]).addClass("invalid-text");
			    				}
	    		    		 $.dialog.notice({width: 150,content: '利用库的某些字段不合法',icon: 'warning',time: 3});
	    				     return false;
	    		    	 }
		    		     paths=path.join(',');
		    		     oValues=oValue.join(',');
		    		     var regEmail=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
		    		     var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
		    		     var reg=/^[1-9]\d*$/;
		    		     var regUser=/^((\d{18})|(\d{17}[X])|(\d{17}[x]))*$/;
		    		     for(var i = 0;i<formFiled.length;i++){
		    		    		if($('#c'+formFiled[i].id).hasClass("invalid-text")){
		    		     			 return false;
		    		     		 }
	    		     		 if(formFiled[i].isNull == 1 && $('#c'+formFiled[i].id).val()=='' ){
	    		     			 $('#c'+formFiled[i].id).addClass("invalid-text").attr("title","此项不能为空");
	    		     			 return false;
	    		     		 }else{
	    		     			$('#c'+formFiled[i].id).removeClass("invalid-text");
	    		     		 }
	    		     	 }
		    		     if(($("input[name='readerid']").val()=='' || $("input[name='readerid']").val()=='-1') ){
							  if((!regUser.test($("input[name='identity']").val()))){
								  $("input[name='identity']").addClass("invalid-text").attr("title","请输入合法的身份证号");
								}else if($("input[name='identity']").val() == null || $("input[name='identity']").val()==''){
									$("input[name='identity']").addClass("invalid-text").attr("title","此项不能为空");	
								}else{
									$("input[name='identity']").removeClass("invalid-text").attr("title","");
								}
		    		     }
		    		     
		    		     /**  验证邮箱长度   **/
		    		     	if($("input[name='email']").val().length>50){
		    		     		  $("input[name='email']").addClass("invalid-text").attr("title","邮箱的最大长度为50个字符！");
								  $.dialog.notice({content:'邮箱输入不合法，请重新输入！',icon:'warning',time:3});
								  return false;
		    		     	}
		    		     	/**    验证单位长度   **/
		    		     	if(jmz.GetLength($("input[name='dept']").val())>50){
		    		     		  $("input[name='dept']").addClass("invalid-text").attr("title","单位的最大长度为25个汉字！");
								  $.dialog.notice({content:'单位输入不合法，请重新输入！',icon:'warning',time:3});
								  return false;
		    		     	}
		    		     	
		    		     	/**  验证备注长度    **/
		    		     	if(jmz.GetLength($("textarea[name='description']").val())>200){
		    		     		  $("textarea[name='description']").addClass("invalid-text").attr("title","备注的最大长度为100个汉字！");
								  $.dialog.notice({content:'备注输入不合法，请重新输入！',icon:'warning',time:3});
								  return false;
		    		     	}
		    		     	
		    		     
						 if(!reg.test($("input[name='validdate']").val())){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
							 $.dialog.notice({content:'催还提前天数不能为空且只能输入大于零的数字！',icon:'warning',time:3});
							 return false;
						 }else if($("input[name='validdate']").val()>30){
							 $("input[name='validdate']").addClass("invalid-text").attr("title","借出天数不能超过30天");
							 $.dialog.notice({content:'很抱歉,借出天数不能超过30天！',icon:'warning',time:3});
							 return false;
						 }else if((!regTel.test($("input[name='tel']").val()))&&($("input[name='tel']").val()!='')){
							  $("input[name='tel']").addClass("invalid-text").attr("title","请输入合法的电话号码");
							  $.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						  }else if((!regEmail.test($("input[name='email']").val()))&&($("input[name='email']").val()!='')){
							  $("input[name='email']").addClass("invalid-text").attr("title","请输入合法的邮箱");
							  $.dialog.notice({content:'邮箱不合法，请重新输入！',icon:'warning',time:3});
							  return false;
						 }else{
							 var url=$.appClient.generateUrl({ESArchiveLending:'addForm'},'x');
							 $.post(url,{data:data,paths:paths,oValues:oValues,IreaderD:IreaderD},function(result){
								if(result){
									thisDialog.close();
									$.dialog.notice({width: 150,content: '添加成功',icon: 'succeed',time: 3});
									$('#flexme1').flexReload();
								}else{
									$.dialog.notice({width: 150,content: '添加失败',icon: 'error',time: 3});
								}
							 });
						 }
	    		     }
	    		},
	    		cache:false
			});
		  },
		  cache:false
	  });
  }

  
  //表单管理的全选按钮
  $("input[name='ids']").die().live('click',function(){
	  $("input[name='id']").attr('checked',$(this).is(':checked'));
  });
  //删除借阅管理表单内的数据
  function delBorrowForm(){
	  var id='';
	  var checkboxesObj=$("input[name='id']:checked");
	  if(checkboxesObj.length!='1'||checkboxesObj.length=='undefined'){
		  $.dialog.notice({content:'请选择一条要删除的数据！',icon:'warning',time:3});
		  return false;
	  }else{
		  var siug=0;
		  checkboxesObj.each(function(){
			  var trObj=$(this).closest("tr");
			  var edit=$("#flexme1").flexGetColumnValue(trObj,['edit']);
			  var status=$("#flexme1").flexGetColumnValue(trObj,['Status']);
			  if(!(edit=='true' || status=='结束')){
				  $.dialog.notice({content:'您选的数据不能删除！',icon:'error',time:3});
				  return false;
			  }
			  id+=$(this).val()+',';
		  });
	  }
		  id=id.substr(0,id.length-1);
		  if(id==0||id==''||id=='undefined'){
			 return false;
		  }
		  $.dialog({
			  content:'确认要删除吗?',
			  ok:true,
			  okVal:'确认',
			  cancel:true,
			  cancelVal:'取消',
			  ok:function(){
				  var url=$.appClient.generateUrl({ESArchiveLending:'delBorrowList'},'x');
				  $.get(url,{id:id},function(data){
					  if(data==1){
						  $("input[name='ids']").attr('checked',false);
						  $.dialog.notice({width:150,height:120,icon:'succeed',content:'数据删除成功！',time:3,title:'3秒后自动关闭！'});
						  $("#flexme1").flexOptions({newp:1}).flexReload();
					  }
				  });
			  },
			  cache:false
		  });
	 
  }
  //综合筛选查询（添加行,删除行）
//  $('.newfilter').die().live('click',function (){
//	  $(this).parent().clone().insertAfter($(this).parent());
//  });
//  $('.delfilter').die().live('click',function (){
//	  $('#contents p').length > 1 ? $(this).parent().remove() : '';
//  });
  //shimiao 20140805 筛选条件
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
  //筛选借阅管理表单数据
  function filterBorrowForm(){
	  $('#queryflexme1Word').val('请输入关键字');
	  var url=$.appClient.generateUrl({ESArchiveLending:'filter'},'x');
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
				    	var statusForTree = $('input[name="statusForTree"]:checked').val();
				    	var url = $.appClient.generateUrl({ESArchiveLending:'filter_sql',sql:encodeURI(str),id:treeNodeForGrid.id,pId:treeNodeForGrid.pId,statusForTree:statusForTree},'x');
				    	$('#flexme1').flexOptions({newp: 1,url:url}).flexReload();
				 },
				 cache:false
			 }); 
		  },
		  cache:false
	  });
  }
	
	
  //添加借阅申请管理表单
  function applyForm()
	{
		var url = $.appClient.generateUrl({ESArchiveLending:'apply'},'x');
		$.ajax({
			url:url,
	    	success:function(data){
	    		$.dialog({
		    		title:'借阅申请审批单',
	    			width: '50%',
	    	    	height: '40%',
	    	   		fixed:true,
	    	    	resize: true,
	    	    	okVal:'提交',
				    ok:true,
				    cancelVal: '取消',
				    cancel: true,
		    		content:data,
		    		ok:function(){
		    			var form=$("#form");
		    			var thisDialog=this;
		    			var data=form.serialize();
		    			var url=$.appClient.generateUrl({ESArchiveLending:'subForm'},'x');
						$.post(url,{data:data},function(result){
									if(result){
										thisDialog.close();
										$.dialog.notice({width: 150,content: '提交成功',icon : 'succeed',time: 3});
									}else{
										$.dialog.notice({width: 150,content: '提交失败',icon: 'error',time: 3});
									}
						});
		    			return false;
		    		}
		    	});
		    },
		    	cache:false
		});
	}
  
//查看打印报表，倪阳添加
var showAccountingReport = function() {
  	var html = [];
  	html.push('<table id="infomation"></table><script type="text/javascript">');
  	html.push('$("#infomation").flexigrid({');
  	html.push("	url: $.appClient.generateUrl({ESArchiveLending:'getInfomation'},'x'),dataType: 'json',");
  	html.push('colModel : [');
  	html.push("{display: '序号', name : 'id', width : 40, align: 'center'}, {display: '打印状态', name : 'printStatus', width : 80,  align: 'center'},{display: '操作人', name : 'userName', width : 60,  align: 'center'},{display: '文件名称', name : 'infoName', width : 180,  align: 'center'},{display: '下载状态', name : 'downloadStatus', width : 60,  align: 'center'},{display: '下载地址', name : 'downurl', width : 160,  align: 'center'}],");
  	html.push('title: "打印目录报表",');
  	html.push('usepager: true,');
  	html.push('useRp: true,');
  	html.push('width: 672,height:200});');
  	html.push('var openUrl = function(obj){');
  	html.push("var path_data = $(obj).attr('path_data');");
  	html.push("var path_id = $(obj).attr('path_id');");
  	html.push("$.get($.appClient.generateUrl({ESArchiveLending:'updateInfomation',id:path_id},'x'),function(data){});");
  	html.push("obj.href = path_data;");
  	html.push("$('#infomation').flexReload();");
  	html.push("return true;}");
  	html.push('</script>');
  	var html = html.join('');
  	$.dialog({
      	title:'下载目录报表',
  	    height: '40%',
  	    width: '50%',
  	    padding: '0 0',
  	   	fixed:true,
  	    resize: false,
      	content:html,
      	opacity : 0.1,
      	okVal:'保存',
  	    ok:false,
  	    cancelVal: '关闭',
  	    cancel: true
      });	
  }	
var changeOrderForAllForm = function(v){
	$("#orderUsingForm").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'getFormDataOfPath',path:v},'x')}).flexReload();
}
var changeStatusForRelend = function(name){
	//id3
	var checkboxs = $("#borrowDetails").find("input[name='id3']:checked");
	var nums = [];
	var flag = false;
	if (checkboxs.length > 0 ){
		var ids = "";
		checkboxs.each(function(){
			var trObj=$(this).closest("tr");
			 ID=trObj.find("input[name='id3']").attr('id');
			 ids += ID + ",";
			var stus=$("#borrowDetails").flexGetColumnValue(trObj,['status']);
			if(stus !='借出' && stus!='续借' ){
				var num=$("#borrowDetails").flexGetColumnValue(trObj,['num']);
				nums.push(num);
				flag = true;
			}
		});
		nums = nums.join(",");
		if(flag){
			 $.dialog.notice({title:'操作提示',content:'您选择的数据第'+nums+'行不能续借，请重新选择！',icon:'warning',time:3});
	    	 $("input[name='ids3']").attr('checked',false);
	    	 $("input[name='id3']").attr('checked',false);
			 return false;
		}
		ids = ids.substr(0,ids.length-1);
		var	formId1 = idm;
		var	readerId =$("input[name='readerid']").val();  
		var identity = $("input[name='identity']").val();
		var readerName = $("input[name='reader']").val();
		$.post(
				$.appClient.generateUrl({ESArchiveLending:'checkCanLendArchive'},'x'),
				{readerId:readerId,formId:formId1,ids:ids,identity:identity,readerName:readerName}, 
				function(res){
						if(res.successs){
							 $.post(
								$.appClient.generateUrl({ESArchiveLending:'updateDetailToOrder'},'x'),
								{ids:ids,status:'续借',readerId:readerId,identity:identity,readerName:readerName}, 
								function(data){
									if(data){
										$.dialog.notice({icon:'succeed',content:'续借数据成功',time:3,title:'3秒后自动关闭!'});
									}else{
										$.dialog.notice({title:'操作提示',content:'续借数据失败！',icon:'error',time:3});
									}
									$("#borrowDetails").flexReload();
								}
							 );
						}else{
							if(res.message != null && res.message != undefined){
								$.dialog.notice({title:'操作提示',content:res.message,icon:'error',time:3});
								}else if(res.data != null && res.data != undefined){
	
	        						//resPage
	        						var url=$.appClient.generateUrl({ESArchiveLending:'resPage'},'x');
	        						$.ajax({
	        						    url:url,
	        						    success:function(data){
	        						    var reslutData=$.dialog({
	        						    	title:'查看结果',
	        						    	width: '450px',
	        						    	height:'200px',
	        						    	padding:'0px',
	        					    	   	fixed:  true,
	        					    	    resize: false,
	        						    	content:data,
	        								init:showResultData
	        							 });
	  	      						function showResultData(){
	  	      							var showcols1=[
	  	  					        				{display: 'path', name: 'path',width : 90,align: 'center',metadata:'path',hide:true},
	  	  					        				{display: 'id', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
	  	  					        				{display: '题名', name: 'title',width : 90,align: 'center',metadata:'title'},
	  	  					        				{display: '档号', name: 'code',width : 90,align: 'center',metadata:'code'},
	  	  					        				{display: '操作结果', name : 'res', width : 150, align: 'center',metadata:'res'}
	  	  					        			];
	  	  				    			$("#resultData").flexigrid({
	  	  				    				url:false,
	  	  				    				dataType: 'json',
	  	  				    				editable: false,
	  	  				    				colModel: showcols1,
	  	  				    				showTableToggleBtn: false,
	  	  				    				pagetext: '第',
	  	  				    				outof: '页 /共',
	  	  				    				width: 450,
	  	  				    				height: 200
	  	  				    			});
	  		  				    			for(var i=0;i<res.data.length;i++){
	  		  				    			$("#resultData").flexExtendData([{
	  											'id':res.data[i].id,
	  											'cell':{
		  												'res':'已经没有续借次数了！',
	  													'path':res.data[i].path,
	  													'id':res.data[i].storeId,
	  													'title':res.data[i].title,
	  													'code':res.data[i].archiveCode
	  												   }
	  										}]);
	  		      						}
	  	      						}
	  	      						}
	        						});
	        					
								}
						}
				},
				'json');
	}else{
		$.dialog.notice({title:'操作提示',content:'请选择您要的续借数据！',icon:'warning',time:3});
		return false;
	}
}
function changeOrderCheck1(v){
	$("#resForm").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'getFormDataOfPath',path:v},'x')}).flexReload();
	}
$('.formForStatus').find('input[name="statusForTree"]').live('change',function(){
	var statusForTree = $(this).val();
	$('.usingTreeDemo li').remove();
	var settingDate = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			async: {
				enable: true,
				dataType: 'json',
				url: $.appClient.generateUrl({ESArchiveLending:'subTreeDate',statusForTree:statusForTree},'x'),
				autoParam: ["id","pId"]
			},
			callback: {
				onClick : nodeDateClick
			}
		};
		function nodeDateClick(event, treeId, treeNode){
			zTree = $.fn.zTree.getZTreeObj("usingTreeDemo");
			zTree.expandNode(treeNode);
			treeNodeForGrid = treeNode;
			$('#queryflexme1Word').val('请输入关键字');
			var statusForTree = $('input[name="statusForTree"]:checked').val();
			 $("#flexme1").flexOptions({url:$.appClient.generateUrl({ESArchiveLending:'form_json_new',id:treeNode.id,pId:treeNode.pId},'x'),newp:1,query:{statusForTree:statusForTree}}).flexReload();
		};
		var url = $.appClient.generateUrl({ESArchiveLending:'initTree'},'x');
		$.ajax({
			url:url,
			dataType: 'json',
			success:function(nodes){
				$.fn.zTree.init($("#usingTreeDemo"), settingDate, nodes);
				$("#usingTreeDemo_1_span").click();
			},
			cache:false
		});
});
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

