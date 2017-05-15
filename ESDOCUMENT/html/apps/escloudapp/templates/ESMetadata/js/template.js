var diac = "";//元数据添加框
var diaa = "";//元数据属性添加框

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
				
				var rightWidth = width ;
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
	$(".editbtn").die().live("click", function(){
		getsubdata($(this).closest("tr").prop("id").substr(3),$(this).closest("tr").find("td").eq(3).text(),$(this).closest("tr").find("td").eq(2).text());
	});
	$(".editattr").die().live("click", function(){
		attrdata($(this).closest("tr").prop("id").substr(3));
	});
	var uri2=$.appClient.generateUrl({ESMetadata:'meta_json'});
	$("#flexme2").flexigrid({
		url: uri2,
		dataType: 'json',
		colModel : [
			{display: '<input type="checkbox" name="ids2" />', name : 'id2', width : 40, align: 'center'},
			{display: '操作', name : 'c3', width : 50, sortable : true, align: 'center'},
			{display: '名称', name : 'c4', width : 100, sortable : true, align: 'left'},
			{display: '唯一标识', name : 'c5', width : 150, sortable : true, align: 'left'},
			{display: '类型', name : 'c6', width : 150, sortable : true, align: 'left'},
			{display: '是否参与高级检索', name : 'c7', width : 120, sortable : true, align: 'left',hide:true},
			{display: '描述', name : 'c8', width : 500, sortable : true, align: 'left'}
			],
		buttons : [
			{name: '添加', bclass: 'add',onpress: metadataadd},
			{name: '删除', bclass: 'delete',onpress:delsub}
			],
//		searchitems : [
//			{display: 'ISO', name : 'iso'},
//			{display: 'Name', name : 'name', isdefault: true}
//			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		title: '元数据',
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
	$('#metadata div[class="tDiv2"]').append('<div class="find-dialog"><input id="queryMetadataKeyword" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryMetadataTable()"></span></div>');
	$('#metadata div[class="tDiv"]').css("border-top","1px solid #ccc");
//}


$("#attributetable").flexigrid({
	url: uri3,
	dataType: 'json',
	colModel : [
		{display: '<input type="checkbox" name="ids3" />', name : 'id3', width : 40, align: 'center'},
		{display: '操作', name : 'c3', width : 80, sortable : true, align: 'center'},
		{display: '属性值', name : 'c4', width : 100, sortable : true, align: 'center'},
		{display: '代码值', name : 'c5', width : 100, sortable : true, align: 'center',hide:true},
		{display: '描述', name : 'c6', width : 100, sortable : true, align: 'center'}
		],
	buttons : [
		{name: '添加', bclass: 'add',onpress: attributeadd},
		{name: '删除', bclass: 'delete',onpress:delattr}
		],
//	searchitems : [
//		{display: 'ISO', name : 'iso'},
//		{display: 'Name', name : 'name', isdefault: true}
//		],
	sortname: "c3",
	sortorder: "asc",
	usepager: true,
	title: '元数据属性',
	useRp: true,
	rp: 10,
	rpOptions:[10,20,30],
	procmsg:"正在加载，请稍等",
	nomsg:"没有数据",
	showTableToggleBtn: true,
	pagetext: '第',
	outof: '页 /共',
	width: 650,
	height: 197,
	pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	});
function check_selected(mes)
{
	//判断用户是否选中数据
	var id='';
	var checkboxObj=$("input[name='id1']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog.notice({content:'请选择'+mes+'的数据',time:3,icon:"warning"});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			id+=$(this).val()+',';
			});
		}
	return id;
		
}
//全选

$("input[name='ids']").die().live('click',
		function(){
		$("input[name='id1']").attr('checked',$(this).is(':checked'));
		}
);
/** guolanrui 20140814 将全选框注掉，改为单选 **/
//$("input[name='ids2']").die().live('click',
//		function(){
//		$("input[name='id2']").attr('checked',$(this).is(':checked'));
//		}
//);
$("#flexme2 input[name='id2']").die().live('click',function(){
	$("#flexme2 input[name='id2']").attr('checked',null);
    $(this).attr('checked','checked');
});
$("#flexme2").find("tr").live("click",function(){
	$("#flexme2 input[name='id2']").attr('checked',null);
    $(this).closest('tr').find("input[name='id2']").attr('checked','checked');

});

$("input[name='ids3']").die().live('click',
		function(){
	$("input[name='id3']").attr('checked',$(this).is(':checked'));
	}
);

$("#flexme1").find("tr").live("click",function(){
	var val = $(this).eq(0).find('input').val();
	var html='<input type="hidden" name="namespaceid" value="'+val+'" />';
	$("#extra").html(html);
	var url = $.appClient.generateUrl({ESMetadata:'meta_json',id:val});
	$("#flexme2").flexOptions({newp:1,url:url}).flexReload();
	
});
function metadataadd()
{
	var url = $.appClient.generateUrl({ESMetadata:'metadataadd'},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	   diac = $.dialog({
	    		id:'name2',
		    	title:'添加元数据',
	    	    padding:0,
	    	   	fixed:true,
	    	    resize: false,
		    	content:data
		    });
	    	
		    },
		    cache:false
	});	
	}
function attributeadd()
{
	if(operate=="add"&&addid==0){
		$.dialog.notice({icon:'warning',content:'您还未添加基本信息',time:2});
		return;
	}
	var url = $.appClient.generateUrl({ESMetadata:'attributeadd'},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    	diaa=$.dialog({
	    		id:'name5',
		    	title:'添加属性',
	    		width: 500,
	    	    height: 150,
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	padding:0,
		    	ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				init : function() {
					$('#attrform').autovalidate();
				},
				ok:function(){

					if(operate=="add"){
						var form=$('#attrform');
						if (!form.validate()) {
							return false;
						}
						/** guolanrui 20140814 添加对特殊符号的正则验证，不允许输入特殊符号 BUG:684 **/
						//TODO
						
						var data=form.serialize();
						$.ajax({
							url:$.appClient.generateUrl({ESMetadata:'addattr'},'x'),
							type: "POST",
							data:{
								metaid:addid,
								param:data
							},
							dataType:"json",
							error:function(){
								$.dialog.notice({icon:'error',content:'添加失败，请重试',time:3});
							},
							success:function(datas){
								if(datas==true){
									
//									$('#attributetable').flexOptions({newp: 1}).flexReload();
									$('#attributetable').flexOptions().flexReload();
									$.dialog.notice({icon:'succeed',content:'操作成功',time:3});
									diaa.close();
									/** guolanrui 20140812 修改原来添加元数据后为其添加一条属性值保存后直接将元数据添加窗口关闭了的BUG：704 **/
//									diac.close();
								}else{
									$.dialog.notice({icon:'error',content:'添加失败，请重试',time:3});
								}
								
							}
						});
					}
					if(operate=="edit"){

						var form=$('#attrform');
						if (!form.validate()) {
							return false;
						}
						/** guolanrui 20140814 添加对特殊符号的正则验证，不允许输入特殊符号 BUG:684 **/
						//TODO
						
						var data=form.serialize();
						var id = metaid;
						$.ajax({
							url:$.appClient.generateUrl({ESMetadata:'addattr'},'x'),
							type: "POST",
							data:{
								metaid:id,
								param:data
							},
							dataType:"json",
							error:function(){
								$.dialog.notice({icon:'error',content:'保存失败，请重试',time:3});
							},
							success:function(datas){
								if(datas==true){
//									$('#attributetable').flexOptions({newp: 1}).flexReload();
//									$('#attributetable').flexOptions({url: uri3}).flexReload();
									$('#attributetable').flexOptions().flexReload();
									$.dialog.notice({icon:'succeed',content:'操作成功',time:3});
									diaa.close();
									//diac.close();
								}else{
									$.dialog.notice({icon:'error',content:'保存失败，请重试',time:3});
								}
								
							}
						});
					}
				}
				
		    });
	    	
		    },
		    cache:false
	});	
}
//删除数据集
function delData()
{
	//alert($id);
	
	var id=check_selected('删除');
	if(id=='' || id==='undefined' || id==0)
	{
		return false;
	}		
	$.dialog({
			id:'deldata',
			content:'确定要删除吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				//alert(id);
				var url=$.appClient.generateUrl({ESMetadata:'do_del'},'x');
				
				$.get(url,{id:id},function(data){
					if(data==1){
						$("input[name='ids']").attr("checked",false);
						$.dialog.notice({icon:'succeed',content:'数据删除成功',time:3,title:'3秒后自动关闭'});
						$('#flexme1').flexOptions({newp: 1}).flexReload();
					}
					});
			}
		});
}
//元数据删除
function delsub(){
	var id='';
	var checkboxObj=$("input[name='id2']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog.notice({content:'请选择要删除的数据',time:3,icon:"warning"});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			id+=$(this).val()+',';
			});
		}
	//alert(id);return;
	
	if(id=='' || id==='undefined' || id==0)
	{
		return false;
	}	
	
	
	$.dialog({
			content:'确定要删除吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				/** guolanrui 20140814 在元数据删除前增加对该元数据是否已被引用的判断,同时给出提示 BUGID:724、729 **/
				var checkUrl = $.appClient.generateUrl({ESMetadata:'checkMetaIsUsed',id:id},'x');
				$.ajax({
				    url:checkUrl,
				    success:function(data){
//				    	alert(data);
				    	if(data == 'true'){//表示已经被引用
				    		/** guolanrui 20140818 元数据被引用，删除时的提示消息 BUG:724 **/
				    		$.dialog.notice({icon:'warning',content:'删除失败，该元数据已经被引用！',time:3,title:'3秒后自动关闭'});
				    	}else{
				    		var url=$.appClient.generateUrl({ESMetadata:'delsub'},'x');
							$.get(url,{id:id},function(data){
								//alert(data);return;
								if(data=="true"){
									$("input[name='ids2']").attr("checked",false);
									$.dialog.notice({icon:'succeed',content:'数据删除成功',time:3,title:'3秒后自动关闭'});
									$('#flexme2').flexOptions({newp: 1}).flexReload();
								}
								if(data=="false"){
									//修改原来的错误提示
									$.dialog.notice({icon:'warning',content:'数据删除失败',time:3,title:'3秒后自动关闭'});
								}
							});
				    	}
				    },
					cache:false
				});	
				
			}
		});
	
}
//元数据属性删除
function delattr(){
	var id='';
	var checkboxObj=$("input[name='id3']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog.notice({content:'请选择要删除的数据',time:3,icon:"warning"});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			id+=$(this).val()+',';
			});
		}
	//alert(id);
	
	if(id=='' || id==='undefined' || id==0)
	{
		return false;
	}		
	$.dialog({
			content:'确定要删除吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				var url=$.appClient.generateUrl({ESMetadata:'delattr'},'x');
				
				$.get(url,{id:id},function(data){
					if(data==1){
						$("input[name='ids3']").attr("checked",false);
						$.dialog.notice({icon:'succeed',content:'数据删除成功',time:3,title:'3秒后自动关闭'});
						$('#attributetable').flexOptions({newp: 1}).flexReload();
					}
					});
				
			}
		});
	
}

function check_selected(mes)
{
	//判断用户是否选中数据
	var id='';
	var checkboxObj=$("input[name='id1']:checked");
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog.notice({content:'请选择'+mes+'的数据',time:3,icon:"warning"});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			id+=$(this).val()+',';
			});
		}
	return id;
		
}
/**
 * 改变浏览器尺寸
 */ 
function sizeChanged(){
	if($.browser.msie && $.browser.version==='6.0'){
		$("html").css({overflow:"hidden"});
	}
	var h = $(window).height() - $("#metadata").position().top;
	var flex = $("#flexme2").closest("div.flexigrid");
	var bDiv = flex.find('.bDiv');
    var contentHeight = bDiv.height();
    var headflootHeight = flex.height() - contentHeight; 
    
    bDiv.height(h - headflootHeight);
	flex.height(h);

	// 修改IE表格宽度兼容
	if($.browser.msie && $.browser.version==='6.0'){
		flex.css({width:"-=3px"});
	}
};
//sizeChanged();

});
function queryMetadataTable(){
	var keyWord = $('#queryMetadataKeyword').val();
	if(keyWord=='请输入关键字'|| keyWord==''){
		keyWord = '';
	}
	$("#flexme2").flexOptions({url:$.appClient.generateUrl({ESMetadata:'meta_json'},'x'),query:{keyWord:keyWord},newp:1}).flexReload();
	return false;
}
/**wanghongchen 20140717 检索框回车事件**/
$(document).keydown(function(event){
	if(event.keyCode == 13 && document.activeElement.id == 'queryMetadataKeyword') {
		queryMetadataTable();
	}
});