var id='';//变更id
var mychangeurl = '';//变更的url
var isfileter = 0;//是否筛选
var mycondition = false;//筛选条件
var str = '';//筛选语句
$(function(){
	$("#flexme1").flexigrid({
		dataType: 'json',
		colModel : [
		    {display: '<input type="checkbox" name="ids">', name : 'id', width : 40, align: 'center'},
			{display: '库房编号', name : 'num', width : 80, align: 'left'}, 
			{display: '档号', name : 'c3', width : 100,  align: 'left'},
			{display: '题名', name : 'c4', width : 200, align: 'left'},
			{display: '页数', name : 'c10', width : 100,  align: 'left'},
			{display: '份数', name : 'c11', width : 100,  align: 'left'},
			{display: '类型', name : 'c5', width : 80,  align: 'left'},
			{display: '状态', name : 'c6', width : 80,  align: 'left'},
			{display: '出入库原因', name : 'c7', width : 180,  align: 'left'},
			{display: '办理人', name : 'c8', width : 100,  align: 'left'},
			{display: '办理日期', name : 'c9', width : 100,  align: 'left'},
			],
		buttons : [
			{name: '筛选', bclass: 'filter',onpress:filter},
			{name: '打印', bclass: 'report',onpress:printfile}
			],
		
		usepager: true,
		title: '出入库管理',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		pagetext: '第',
		outof: '页 /共',
		height: height,
		width:'auto',
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	$(".esleft li:eq(0)").addClass('turn');
	var url=$.appClient.generateUrl({ESInOut:'get_json'},'x');
	$("#flexme1").flexOptions({newp:1,url:url,query:"入库"}).flexReload();
	/**
	  * 出入库管理状态变更
	  * @author ldm
	  */
	
	function statechange(name,grid)
	{
		id='';
		var checkboxObj=$("input[name='id2']:checked");
		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
		{
			
			$.dialog.notice({icon:'warning',content:'请选择要变更的数据',time:3});
			return false;
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				id+=$(this).val()+',';
				});
			}
		if(id=='' || id==='undefined' || id==0)
		{
			return false;
		}
		mychangeurl = $.appClient.generateUrl({ESInOut:'change_json'},'x');
		$.ajax({
			url: $.appClient.generateUrl({ESInOut:'statuschanges'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'状态变更',
		    	   	fixed:true,
		    	   	padding:0,
		    	    resize: false,
    				okVal:'确定',
      			    ok:true,
      			    cancelVal: '关闭',
      			    cancel: true,
			    	content:data,
			    	ok:function(){
			    		var data = new Array();
			    		var url = $.appClient.generateUrl({ESInOut:'savechange'},'x');
			    		$("#statechange").find("tr").each(function(i){
			    			if(true){
			    				var s1 = $(this).attr("id").substr(3);
				    			var s2 = $(this).find("td").eq(3).find("div").text();
				    			var s3 = $(this).find("td").eq(4).find("div").text();
				    			data[i]={"ID":s1,"STATUS":s2,"REASON":s3};
			    			}
			    		});
			    		//alert(data);
			    		$.post(url,{param:data},function(result){
			    			if(result==1){
			    				$.dialog.notice({icon:"succeed",content:"修改成功",time:3});
			    				$("#flexme1").flexReload();
			    			}
			    		});
			    	}
		    	
			    });
			   },
			    cache:false
		});

	}
	/**
	 * 状态批量变更
	 * @author ldm
	 */
	function batchmodify(){
		var modifyurl = $.appClient.generateUrl({ESInOut:'batchmodify'},'x');
		$.ajax({
			url:modifyurl,
			success:function(data){
				$.dialog({
			    	title:'批量状态变更',
		    	   	fixed:true,
		    	    resize: false,
    				okVal:'确定',
      			    ok:true,
      			    cancelVal: '关闭',
      			    cancel: true,
			    	content:data,
			    	ok:function(){
			    		var str = getsql();
			    		if(str==false){
			    			return false;
			    		}
			    		var fieldvalue = getConditionText();
			    		var state = $("#batchform select option:selected").val();
			    		var reason = $("#batchform #reason").val();
			    		var url = $.appClient.generateUrl({ESInOut:'batchopreate'},'x');
			    		$.post(url,{param:str,state:state,reason:reason,fieldvalue:fieldvalue},function(result){
			    			if(result){
			    				$.dialog.notice({icon:"succeed",content:"修改成功",time:2});
			    				$("#flexme1").flexReload();
			    			}else{
			    				$.dialog.notice({icon:"error",content:"修改失败",time:2});
			    			}
			    		});
			    	}
		    	
			    });
			}
		});
	}

	/**
	 * 出入库管理筛选条件
	 * @author ldm
	 */
	function filter(){
		
		$.ajax({
		    url:$.appClient.generateUrl({ESInOut:'filter'},'x'),
		    success:function(data){
		    	$.dialog({
		    		//gengqianfeng 20140928 修改筛选标题
			    	title:'筛选数据',
			    	lock:true,
		    	    resize:false,
		    	    opacity:0.1,
				    ok:function(){
				    	var str = getsql();
				    	if(str==false){
				    		return;
				    	}
				    	var url = $.appClient.generateUrl({ESInOut:'filter_json',status:encodeURI(status)},'x');
				    	$('#flexme1').flexOptions({url:url,newp:1,query:str}).flexReload();
				    	isfileter = 1;
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
	/**
	 * 筛选语句
	 * @author ldm
	 */
	function getsql(){
    	var exg = /(\*)$/;
    	var sql_string = '';
    	//获取p标签
    	$('#contents p').each(function (f){
    		//字段值是否填写
    		var filedname	=	$('.filedname').eq(f).val();	//字段名class='filedname'
    		if(filedname){
    			var filedvalue = $('.filedvalue').eq(f).val();//字段值class='filedvalue'
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
    	str = sql_string.replace(exg,"");
    	if(str==""){
    		$.dialog.notice({icon:'warning', content:"查询条件不能为空", time:3});
    		return false;
    	}
    	return str;
	}
	/**
	 * 筛选中文
	 * @author ldm
	 * @returns {String}
	 */
	function getConditionText(){
		var name = '';
		$("#contents p").each(function(i){
			 var esfields=$(".filedname option:selected").eq(i).val();
			 var comparison=$(".comparison option:selected").eq(i).text();
			 var esfieldvalue=$(".filedvalue").eq(i);
			 var relation=$(".relationship option:selected").eq(i).text();
			 if(esfields){
				 var esfieldstext=$(".filedname option:selected").eq(i).text();
					 name += String(esfieldstext)+String(comparison)+String(esfieldvalue.val()!=""?esfieldvalue.val():"空")+String(relation);
			 }
		})
		var ext = /(并且|或者)$/;
		var specialname = name.replace(ext,"");
		return specialname;
	}
	/**
	 * 出入库打印
	 * @author ldm
	 */
	function printfile(){
		
		mycondition=false;
		var myprintid=[];
		var checkboxObj=$("input[name='id2']:checked");
		if(isfileter==0){
			if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
			{
				$.dialog.notice({icon:'warning',content:'请先选择数据',time:2});
				return false;
			}else{
				//遍历选中的数据
				checkboxObj.each(function(i){
					myprintid.push(this.value);
					});
			}
		}else{
			if(checkboxObj.length>0){
				checkboxObj.each(function(i){
					myprintid.push(this.value);
				});
			}else{
				mycondition = str;
			}
			
		}
	
		$.ajax({
		    url:$.appClient.generateUrl({ESInOut:'printview'},'x'),
		    success:function(data){
		    	$.dialog({
			    	title:'打印选项',
			    	lock:true,
		    	    resize:false,
		    	    opacity:0.1,
				    ok:function(){
				    	var obj=$("#myprint input[name='type']:checked");
				    	var type=obj.val();
				    	var myid = obj.attr("id");
				    	var reportTitle=obj.next().html();
				    	$.dialog.notice({content: '正在努力打印中,稍后点击“消息提示”进行下载',time:5,icon:"succeed"});
				    	var url = $.appClient.generateUrl({ESInOut:'myprint'},'x');
				    	$.post(url,{id:myid,type:type,myprintid:myprintid,mycondition:mycondition,reportTitle:reportTitle},function(result){
				    		if(result=='nodata'){
								$.dialog.notice({width: 150,content: '没有满足条件的数据',icon: 'error',time:3});
							}
				    	});
				    },
		    	    cancel:true,
			    	content:data,
			    	okVal:'打印',
			    	cancelVal:'取消'
			    });
			},
			cache:false
		});
		
	}
	/**
	 * 获取勾选的Id
	 * @author ldm
	 */
	function getselected(){
		var printid='';
		var checkboxObj=$("input[name='id2']:checked");
		if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
		{
			
			$.dialog.notice({icon:'warning',content:'请先选择数据',time:3});
			return false;
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				printid+=$(this).val()+',';
				});
		}
		return printid;
	}
	/**
	 * 全选
	 */
	$("input[name='ids']").die().live('click',
			function(){
			$("input[name='id2']").attr('checked',$(this).is(':checked'));
			}
	);
});
