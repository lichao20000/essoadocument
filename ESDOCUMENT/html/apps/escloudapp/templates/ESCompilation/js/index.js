var state;//状态
var orstate;
var issave=false;//是否保存
var inserdia;//插入档案dialog


$(function(){
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()-110;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 230;
				if(navigator.userAgent.indexOf("MSIE 6.0")>0){
					
					width = width-6;
					
				}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
					width = width-4;
					height = height-4;
				}
				
				var rightWidth = width - leftWidth;
				var tblHeight = height - 147;
				
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};

	$(".editbtn").live("click", function(){
		edit($(this).closest("tr").prop("id").substr(3),$(this).closest("tr").find("td").eq(3).text());
	});
	$(".detailsbtn").live("click", function(){
		publishDetail($(this).closest("tr").prop("id").substr(3));
	});
	$("#escompilate").flexigrid({
		dataType: 'json',
		colModel : [
		    {display: '<input type="checkbox" name="ids" />', name : 'id2', width : 40, align: 'center'},
			{display: '操作', name : 'c3', width : 70, sortable : true, align: 'center'},
			{display: '题名', name : 'c4', width : 100, sortable : true, align: 'left'},
			{display: '状态', name : 'c5', width : 70, sortable : true, align: 'center'},
			{display: '编研类别', name : 'c6', width : 70, sortable : true, align: 'center'},
			{display: '摘要', name : 'c7', width : 70, sortable : true, align: 'left'},
			{display: '创建机构', name : 'c8', width : 70, sortable : true, align: 'center'},
			{display: '创建人', name : 'c9', width : 70, sortable : true, align: 'center'},
			{display: '创建日期', name : 'c10', width : 100, sortable : true, align: 'center'},
//			{display: '提交日期', name : 'c11', width : 100, sortable : true, align: 'center'},
			{display: '发布日期', name : 'c12', width : 100, sortable : true, align: 'center'}
			//{display: '审批记录', name : 'c13', width : 100, sortable : true, align: 'center'}
			],
			//xiewenda 20140924 将取消发布的bclass属性从delete改为refresh改变显示图标
		buttons : [
			{name: '新建', bclass: 'add',onpress:add},
			{name: '发布', bclass: 'group',onpress:publish},
			{name: '取消发布', bclass: 'refresh',onpress:cancelpublish},
			{name: '删除', bclass: 'delete',onpress:del}
//			{name: '筛选', bclass: 'filter',onpress:filter}
			],
		usepager: true,
		title: '档案编研设置',
		useRp: true,
		rp: 20,
		procmsg:"正在加载，请稍等",
		nomsg:"没有数据",
		resizable:false,
		minColToggle:0,
		showTableToggleBtn: false,
		pagetext: '第',
		outof: '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	var url = $.appClient.generateUrl({ESCompilation:'get_json'},'x');
	$('#escompilate').flexOptions({newp: 1,url:url,query:{condition:'all'}}).flexReload();
	$('div[class="tDiv2"]').append('<div class="find-dialog"><input id="compilationKeyWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="compilationKeyWord" value="请输入关键字" /><span id="compilationQuery"></span></div>');
	
	$(document).keydown(function(event){
		if(event.keyCode == 13 && document.activeElement.id == 'compilationKeyWord') {
			compilationQuery();
		}
	});

	$("#compilationQuery").die().live("click",function(){
		compilationQuery();
	});

	function compilationQuery(){
		var keyword = $.trim($('#compilationKeyWord').val());
		if(keyword == '' || keyword=='请输入关键字') {
			keyword = '';
		}
		$("#escompilate").flexOptions({newp : 1, query : {keyword:keyword,condition:$('#left_top .turn').attr("state")}}).flexReload();
	}
	
	/**
	 * 添加
	 * @author ldm
	 */
	function add()
	{
		$.ajax({
		    url:$.appClient.generateUrl({ESCompilation:'choosemoudle'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'选择是否使用模板',
			    	lock:true,
		    	    resize:false,
		    	    opacity:0.1,
		    	    width:200,
		    	    height:100,
		    	    padding: 0,
				    ok:function(){
				    	//doaddnext();
				    	var val = $('.display input:checked').val();
				    	var showval = $('.showtemplate textarea[name="dis'+val+'"]').val();
				    	doaddnext(showval);
				    },
		    	    cancel:true,
			    	content:data,
			    	okVal:'确定',
			    	cancelVal:'取消'
			    });
			},
			cache:false
		});
		
		
		
	}
	
	function cancelpublish() {
		var ids='';
		var checkboxObj=$("input[name='id2']:checked");
		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
		{
			$.dialog.notice({icon:'warning',content:'请选择要取消发布的数据',time:3});
			return false;
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				if($(this).closest("tr").find("td:eq(3)").text()=="发布"){
					ids+=$(this).val()+',';
				}
				else{
					$(this).attr('checked',false);
				}
				});
			}
		if(ids=='' || ids==='undefined' || ids==0)
		{
			$.dialog.notice({icon:'warning',content:'只有发布状态的可以取消',time:3});
			return false;
		}	
		ids = ids.substring(0, ids.length-1);
		$.dialog({
				content:'确定要取消发布吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var url=$.appClient.generateUrl({ESCompilation:'unPublish'},'x');
					$.post(url,{ids:ids},function(result){
						if(result){
//							$("input[name='ids']").attr("checked",false);
							$.dialog.notice({icon:'succeed',content:'取消发布成功',time:3});
							$('#escompilate').flexOptions({newp: 1}).flexReload();
						}
					});
					
				}
			});
	}
	
	/**
	 * 发布
	 */
	//xiewenda 20140924 把有编辑和发布的提示消息中结尾有逗号的去掉
	function publish(){
		var ids='';
		var checkboxObj=$("input[name='id2']:checked");
		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
		{
			$.dialog.notice({icon:'warning',content:'请选择要发布的数据',time:3});
			return false;
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				if($(this).closest("tr").find("td:eq(3)").text()=="编辑"){
					ids+=$(this).val()+',';
				}
				else{
					$(this).attr('checked',false);
				}
				});
			}
		if(ids=='' || ids==='undefined' || ids==0)
		{
			$.dialog.notice({icon:'warning',content:'只有编辑状态的可以发布',time:3});
			return false;
		}	
		ids = ids.substring(0, ids.length-1);
		$.dialog({
				content:'确定要发布吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var url=$.appClient.generateUrl({ESCompilation:'publish'},'x');
					$.post(url,{ids:ids},function(result){
						if(result){
//							$("input[name='ids']").attr("checked",false);
							$.dialog.notice({icon:'succeed',content:'发布成功',time:3});
							$('#escompilate').flexOptions({newp: 1}).flexReload();
						}
					});
					
				}
			});
	}
	/**
	 * add操作的下一步
	 */
	function doaddnext(showval){
		state = '编辑';
		orstate ='编辑';
		$('#form input[name="title"]').removeAttr("disabled");
		$('#form textarea[name="summary"]').removeAttr("disabled");
		$('#form input[name="editid"]').removeAttr("disabled");
		$('#loadfile').html("");
		$('#coverimg').removeAttr("disabled");
		$('#select').removeAttr("disabled");
		$('#submit').removeClass("showornot");
		$('#save').removeClass("showornot");
		$('.mybuttons').removeClass("showornot");
		$('#upload').removeClass("showornot");
		
		
		editor.setReadOnly(false);
		var myDate = new Date();
		var createdate = myDate.getFullYear()+'-'+(myDate.getMonth()+1)+'-'+myDate.getDate();
		var url = $.appClient.generateUrl({ESCompilation:'getinfo'},'x');
		$.get(url,{state:state},function(result){
			var res = eval("("+result+")");
			$('#state').html(orstate);
			$('#userorgan').html(res.userOrg);
			$('#username').html(res.userName);
			$('#username').attr("userid",res.userId);
			$('#form input[name="title"]').val("");
			$('#form textarea[name="summary"]').val("");
			$('#form input[name="editid"]').val("");
			$('#coverimg').attr("src","/apps/escloudapp/templates/ESCompilation/img/blank.gif");
			$('#createdate').html(createdate);
			editor.setData(showval);
			$('.submitdate').addClass("showornot");
			$('.publishdate').addClass("showornot");
			$('#showtable').addClass("showornot");
			$('#showedit').removeClass("showornot").css("width",$size.init().tblWidth).css("height",height+110).css("overflow","auto").css("background-color","#fff");
		});
	}
	/**
	 * 编辑
	 */
	function edit(id,stat){
		state = stat;
		$('#loadfile').html("");
		var url = $.appClient.generateUrl({ESCompilation:'getinfolist'},'x');
		$.post(url,{id:id},function(result){
			var res = eval("("+result+")");
			$('#form input[name="title"]').val(res.tm);
			$('#form textarea[name="summary"]').val(res.summary);
			$('#form input[name="editid"]').val(res.id);
			$('#coverimg').attr("src",res.image);
			$('#select option').each(function(i){
				if(res.type==$(this).text()){
					$(this).attr("selected","selected");
				}
			});
			spereator(";",res.accessory);
			//$('#loadfile').
			$('#state').html(res.state);
			$('#userorgan').html(res.createOrg);
			$('#username').html(res.displayName);
			$('#username').attr("userid",res.createPersonId);
			$('#createdate').html(res.createDate);
			$('.submitdate').addClass("showornot");
			$('.publishdate').addClass("showornot");
			
			
			//return;
			if(res.submitDate!=null){
				$('#submitdate').html(res.submitDate);
				$('.submitdate').removeClass("showornot");
			}
			if(res.publishDate!=null){
				$('#publishdate').html(res.publishDate);
				$('.publishdate').removeClass("showornot");
			}
			if(state=="审批中"||state=="发布"){
				
				$('#form input[name="title"]').attr("disabled","disabled");
				$('#form textarea[name="summary"]').attr("disabled","disabled");
				$('#form input[name="editid"]').attr("disabled","disabled");
				$('#coverimg').attr("disabled","disabled");
				$('#select').attr("disabled","disabled");
				$('.mybuttons').addClass("showornot");
				$('#submit').addClass("showornot");
				$('#save').addClass("showornot");
				$('#upload').addClass("showornot");
				editor.setReadOnly(true);
				editor.setData(res.content);
			}else{
				$('#form input[name="title"]').removeAttr("disabled");
				$('#form textarea[name="summary"]').removeAttr("disabled");
				$('#form input[name="editid"]').removeAttr("disabled");
				$('#coverimg').removeAttr("disabled");
				$('#select').removeAttr("disabled");
				$('#submit').removeClass("showornot");
				$('#save').removeClass("showornot");
				$('.mybuttons').removeClass("showornot");
				$('#upload').removeClass("showornot");
				editor.setReadOnly(false);
				editor.setData(res.content);
			}
			$('#showtable').addClass("showornot");
			$('#showedit').removeClass("showornot");
		});
	};
	/**
	 * 隔开数据
	 * @author ldm
	 */
	function spereator(limit,string){
		$("#loadfile").html("");
		if(string!=null){
			var sep = string.split(limit);
			var res = new Array();
			for(var i=0;i<sep.length;i++){
				if(sep[i]!=""){
					var source = sep[i].split("|");
					var title = source[1];
					//var pathindex = source[0].lastIndexOf("/");
					//var title = source[0].substring(pathindex+1,source[0].length);
					var html='<div><a fileId="'+source[0].split(".")[0]+'" fullpath="'+sep[i]+';'+'" href="#">'+title+'</a></div>';
					$("#loadfile").append(html);
				}
			}
		}
		
	}
	/**
	 * 筛选
	 * @author ldm
	 */
	function filter(){
		var state = $('#left_top .turn').attr("state");
		if(state==""){
    		$.dialog.notice({icon:'warning', content:"请选择一个状态查询", time:3});
    		return;
    	}
		$.ajax({
		    url:$.appClient.generateUrl({ESCompilation:'filter'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'筛选面板',
			    	lock:true,
		    	    resize:false,
		    	    opacity:0.1,
				    ok:function(){
				    	var exg = /(\*)$/;
				    	var sql_string = '';
				    	//获取p标签
				    	$('#contents p').each(function (f){
				    		//字段值是否填写
				    		var filedvalue = $('.filedvalue').eq(f).val();//字段值class='filedvalue'
				    		
				    		if(filedvalue){
				    			var filedname	=	$('.filedname').eq(f).val();	//字段名class='filedname'
				    			var comparison	=	$('.comparison').eq(f).val();	//比较符class='comparison'
				    			
				    			var relationship=	$('.relationship').eq(f).val();	//关系符class='relationship'
				    			if(relationship=="AND"){
				    				relationship='true';
				    			}else{
				    				relationship='false';
				    			}
				    			sql_string += filedname+","+comparison+","+filedvalue+","+relationship+"*";
				    		}
				    	});
				    	
				    	var str = sql_string.replace(exg,"");
				    	if(str==""){
				    		$.dialog.notice({icon:'warning', content:"查询条件不能为空", time:3});
				    		return;
				    	}
				    	//alert(str);return;
				    	var url = $.appClient.generateUrl({ESCompilation:'get_json',sql_str:encodeURI(str),state:state},'x');
						$('#escompilate').flexOptions({newp: 1,url:url}).flexReload();
				    },
		    	    cancel:true,
			    	content:data,
			    	okVal:'确定',
			    	cancelVal:'取消'
			    });
			},
			cache:false
		});
	}
	$('.newfilter').die().live('click',function (){
		$(this).parent().clone().insertAfter($(this).parent());
	});

	$('.delfilter').die().live('click',function (){
		$('#contents p').length > 1 ? $(this).parent().remove() : '';
	});
	$('#left_top li').die().live('click',function(){
		$('#showtable').removeClass("showornot");
		$('#showedit').addClass("showornot");
		$('.left_top li').removeClass('turn');
		$(this).addClass('turn');
		var query = $(this).attr("state");
		var url = $.appClient.generateUrl({ESCompilation:'get_json'},'x');
		$('#escompilate').flexOptions({newp: 1,url:url,query:{condition:query}}).flexReload();
	});
	/**
	 * 删除
	 */
	function del(){
		var ids='';
		var checkboxObj=$("input[name='id2']:checked");
		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
		{
			$.dialog.notice({icon:'warning',content:'请选择要删除的数据',time:3});
			return false;
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				if($(this).closest("tr").find("td:eq(3)").text()=="编辑"){
					ids+=$(this).val()+',';
				}
				else{
					$(this).attr('checked',false);
				}
				});
			}
		if(ids=='' || ids==='undefined' || ids==0)
		{
			$.dialog.notice({icon:'warning',content:'只有编辑状态的可以删除',time:3});
			return false;
		}	
		$.dialog({
				content:'确定要删除吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var url=$.appClient.generateUrl({ESCompilation:'del'},'x');
					$.post(url,{param:ids},function(result){
						//alert(result);return;
						if(result){
							$("input[name='ids']").attr("checked",false);
							$.dialog.notice({icon:'succeed',content:'删除成功',time:2});
							$('#escompilate').flexOptions({newp: 1}).flexReload();
						}
						
						});
					
				}
			});
		
	}
	//全选
	$("input[name='ids']").die().live('click',function(){
		$("input[name='id2']").attr('checked',$(this).is(':checked'));
	});
	/**
	 * 编辑器
	 */
    var uploadurl = $.appClient.generateUrl({ESCompilation:'ckupload'},'x');
	editor = CKEDITOR.replace('oneditor', {
		extraPlugins: 'myAddImage',
		filebrowserUploadUrl: uploadurl,
		toolbar:[
					['Source','-','NewPage','Preview','-','Templates'],
				    ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print', 'SpellChecker', 'Scayt'],
				    ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
				    ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'HiddenField'],
				    '/',
				    ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
				    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
				    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
				    ['Link','Unlink','Anchor'],
				    ['AddImage','Table','HorizontalRule','SpecialChar','PageBreak'],
				    '/',
				    ['Styles','Format','Font','FontSize'],
				    ['TextColor','BGColor'],
				    ['Maximize', 'ShowBlocks','-']
				],
		height : '600', // 编辑器高度
		CheckBrowser : true, // 是否在显示编辑器前检查浏览器兼容性,默认为true
		resize_enabled : true
		
	});
	$("#back").click(function(){
		if(state!="编辑"){
			$('#showtable').removeClass("showornot");
			$('#showedit').addClass("showornot");
		}else{
			$.dialog({
				icon:"warning",
				content:"您确定要离开本页面么,如果没有保存，则会丢失数据",
				ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    ok:function(){
			    	$('#showtable').removeClass("showornot");
					$('#showedit').addClass("showornot");
			    }
			});
		}
//		if(issave==false){
//			
//		}
//		issave = false;
		
	});
	/**
	 * 插入编研
	 * @author ldm
	 */
	$('#insertcomply').click(function(){
		//if(state=="审批中"||state=="发布")return;
		var complyurl = $.appClient.generateUrl({ESCompilation:'insertcomply'},'x');
		$.ajax({
			url:complyurl,
			success:function(data){
				$.dialog({
			    	title:'插入编研',
		    	   	fixed:true,
		    	    resize: false,
		    	    width:800,
		    	    height:450,
		    	    padding:0,
    				okVal:'确定',
      			    ok:true,
      			    cancelVal: '关闭',
      			    cancel: true,
			    	content:data,
			    	ok:function(){
			    		var checkboxObj=$("#complycontent input[name='id2']:checked");
			    		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
			    		{
			    			$.dialog.notice({icon:'warning',content:'请选择要插入的数据',time:3});
			    			return false;
			    		}
			    		var path = checkboxObj.closest("tr").find("td").eq(1).text();
			    		var url=$.appClient.generateUrl({ESCompilation:'parseinsertcomply'},'x');
						$.post(url,{path:path},function(result){
							if(result){
								var datas = editor.getData();
								//datas += result;
								editor.insertText(result);
								$.dialog.notice({icon:'succeed',content:'插入编研成功',time:3});
							}
							
						});
			    	}
			    });
			}
		});
	});
	/**
	 * 插入本地文件
	 * @author ldm
	 */
	$('#insertlocal').click(function(){
		inserdia = $.dialog({
			title:'上传文件',
    		width: '450px',
    	   	height: '250px',
    	    fixed:true,
    	    resize: false,
    		content:"<div id='content'>一次最多选择上传10个文件<div class='fieldset flash' id='fsUploadProgress'></div></div>",
    		cancelVal: '关闭',
    		cancel: true,
    		padding: '10px',
			button: [
	    		{id:'btnAdd1', name: '添加文件'},
	            {id:'btnCancel1', name: '删除所有', disabled: true},
	            {id:'btnStart1', name: '开始上传', disabled: true, callback: function(){return false;}}
			],
			init:createSWFUpload
    	});	
	});
	/**
	 * 插入档案
	 * @author ldm
	 */
	$('#insertarchive').click(function(){
		var complyurl = $.appClient.generateUrl({ESCompilation:'insertarchive'},'x');
		$.ajax({
			url:complyurl,
			success:function(data){
			inserdia = $.dialog({
			    	title:'插入档案',
		    	   	fixed:true,
		    	    resize: false,
		    	    padding:0,
		    	    width:800,
		    	    height:380,
    				okVal:'确定',
      			    ok:true,
      			    cancelVal: '关闭',
      			    cancel: true,
			    	content:data,
			    	ok:function(){
			    		var checkboxObj=$("#archivemain input[name='path']:checked");
			    		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
			    		{
			    			$.dialog.notice({icon:'warning',content:'请选择要插入的数据',time:3});
			    			return false;
			    		}
			    		var path = checkboxObj.val();
			    		var archurl = $.appClient.generateUrl({ESCompilation:'paresarchive'},'x');
      			    	$.post(archurl,{path:path},function(res){
      			    		var result = eval("("+res+")");
      			    		if(result.flag){
//      			    			var datas = editor.getData();
//    							datas += result.content.content;
//    							editor.setData(datas);
    							editor.insertText(result.content.content);
    							inserdia.close();
    							$.dialog.notice({icon:'succeed',content:'插入档案成功',time:3});
      			    		}else{
      			    			$.dialog.notice({icon:'error',content:'插入档案失败',time:3});
      			    		}
      			    		
      			    	});
			    		
			    		return false;
			    		
			    	},
			    	
			    	init:createTree
		    	
			    });
			}
		});
	});
	/**
	 * 初始化树
	 * @author ldm
	 */
	function createTree(){
		var setting = {
				view: {
					dblClickExpand: false,
					showLine: false,
					selectedMulti: false
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				async:{
					enable:true,
					url:$.appClient.generateUrl({ESArchiveLending:'initFile'},'x'),
					autoParam:["id"]
				},
				callback: {
					onClick: clickNode
				}
		};
		$.getJSON($.appClient.generateUrl({ESArchiveLending:'getTree',status:4},'x'), function(zNodes) {
			$.fn.zTree.init($("#archivenav"), setting, zNodes);
		});
	}
	function clickNode(event,treeId,treeNode){
		zTree = $.fn.zTree.getZTreeObj("archivenav");
		zTree.expandNode(treeNode);
		archiveType=treeNode.archivetype;
		if(treeNode.sId!=0 && treeNode.isParent!=true){
			strucid=treeNode.sId;
			var path=treeNode.path;
			var reg=/\//g;
			nodePath=path.replace(reg, '-');
			var url=$.appClient.generateUrl({ESCompilation:'datalist',path:nodePath},'x');
				$("#borrowlistbox").load(url);
		}
	}
	
	// 展示发布的编研成果 longjunhao 20140806
	function publishDetail(id){
		window.open($.appClient.generateUrl({ESCompilation:'publishShow',id:id}));	
	}

});
var editor;
function getAjaxResult(t) {
    var _id = this.getId();
    var _doc = this.getFrameDocument();
    var num = t.listenerData;
    //获取页面返回值
    var ret = _doc.getBody().getHtml();
    var data = eval("(" + ret + ")");
    if (data) {
            picurl = data.urls;
            CKEDITOR.tools.callFunction(num, picurl);
    } else if (data.error) {
            CKEDITOR.tools.callFunction(num, '', '上传失败' + data.error);
    }
    this.removeListener('load', getAjaxResult);
}
