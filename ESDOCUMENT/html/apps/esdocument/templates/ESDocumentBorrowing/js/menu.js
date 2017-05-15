//实现replaceAll方法 
String.prototype.replaceAll = function(s1,s2) { 
	    		    		    return this.replace(new RegExp(s1,"gm"),s2); 
	    		    	}
var jmz = {};
jmz.GetLength = function(str) {
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
// 双击行弹出编辑面板
var idm='';
function modify(tr,g,p)
{
	idm=$("[name='id']",tr).val();
	show_items(idm);
}
function getByteLen(val) {    // 传入一个字符串
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        if (val[i].match(/[^\x00-\xff]/ig) != null) // 全角
            len += 2; // 如果是全角，占用两个字节
        else
            len += 1; // 半角占用一个字节
    }
    return len;
 } 

// 添加借阅管理
function addBorrowForm(){
	$.ajax({
	    url:$.appClient.generateUrl({ESDocumentBorrowing:'add'},'x'),
	    success:function(data){
			$.dialog({
				title:'添加借阅管理表单',
				width:630,
				height:550,
				padding:0,
				button:[
				        {name:'直接借阅',callback:function(){
				        	if (!$("#form_add").validate()) {
								return false;
							} 
				        	if(!$("#add_borrowDetails").validate()){
								 return false;
							}
				        	var flag = directForLendUsingForm('借阅');
							var thisDialog=this;
							if(!flag){
								return false;
							}else{
								thisDialog.close();	
							}
				        }},
				        {name:'直接借出',callback:function(){
				        	if (!$("#form_add").validate()) {
								return false;
							}
				        	if(!$("#add_borrowDetails").validate()){
								 return false;
							 }
				        	var flag = directForLendUsingForm('借出');
							var thisDialog=this;
							if(!flag){
								return false;
							}else{
								thisDialog.close();	
							}
				        }},
				        {name:'保存'},
				        {name:'关闭'}
				        ],
				okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
				content:data,
				ok:function(){
					if (!$("#form_add").validate()) {
						return false;
					}
					if(!$("#add_borrowDetails").validate()){
						 return false;
					 }
					var result = addOrEditBorrowData($("#form_add"),'add');
					var url=$.appClient.generateUrl({ESDocumentBorrowing:'addForm'},'x');
					$.post(url,{borrowdetail:result['detailArray'],borrowform:result['borrowform']},function(result){
						if(result){
							$.dialog.notice({width: 150,content: '添加成功',icon: 'succeed',time: 3});
							$('#esDataList').flexReload();
						}else{
							$.dialog.notice({width: 150,content: '添加失败',icon: 'error',time: 3});
							$('#esDataList').flexReload();
						}
					});
				},
				cancel:function(){},
				init: function() {
					$("#form_add").autovalidate();
				}
			});
	    },
	    cache:false
	});
}
// 编辑
$('.editbtn').die().live('click',function(){
	var id = $(this).attr('id');
	$.post($.appClient.generateUrl({ESDocumentBorrowing:'edit'},'x'),{id:id},function(data){
    	dia2 = $.dialog({
	    	title:'编辑借阅单',
	    	width:630,
			height:550,
    	   	fixed:true,
    	    resize: false,
    	    padding:0,
	    	content:data,
		    cancelVal: '关闭',
		    cancel: true,
		    okVal:'确认修改',
		    ok:true,
	    	ok:function(){
	    		if (!$("#form_edit").validate()) {
					return false;
				}
	    		if(!$("#edit_borrowDetails").validate()){
	    			 return false;
	    		}
	    		var flag = saveBorrow();
				var thisDialog=this;
				if(!flag){
					return false;
				}else{
					thisDialog.close();	
				}
			},cancel:function(){$("#esDataList").flexReload();},
			init: function() {
				$("#form_edit").autovalidate();
			}
	    });
	});
	
});
function saveBorrow(){
	var flag = true;
	var result = addOrEditBorrowData($("#form_edit"),'edit');
	var url=$.appClient.generateUrl({ESDocumentBorrowing:'save'},'x');
	$.post(url,{borrowdetail:result['detailArray'],borrowform:result['borrowform']},function(result){
		if(result){
			$.dialog.notice({width: 150,content: '更新成功',icon: 'succeed',time: 3});
			$('#esDataList').flexReload();
			flag = true;
		}else{
			$.dialog.notice({width: 150,content: '更新失败',icon: 'error',time: 3});
			$('#esDataList').flexReload();
			flag = true;
		}
	 });
	 return flag;
}
//查看
$('.showbtn').die().live('click',function(){
	var id = $(this).attr('id');
	$.post($.appClient.generateUrl({ESDocumentBorrowing:'showDetails'},'x'),{id:id},function(data){
    	dia3 = $.dialog({
	    	title:'查看借阅单',
	    	width:630,
			height:550,
    	   	fixed:true,
    	    resize: false,
    	    padding:0,
	    	content:data,
		    okVal:'关闭',
		    ok:true,
	    	ok:function(){
	    		this.close();
			}
	    });
	});
	
});
function delBorrowForm(){
	  var id='';
	  var otherIds = '';//处理过的数据编号
	  var docId = '';//文件id
	  var checkboxesObj=$("input[name='changeId']:checked");
	  if(checkboxesObj.length>0){
		  checkboxesObj.each(function(){
			  var trObj=$(this).closest("tr");
			  var status=$("#esDataList").flexGetColumnValue(trObj,['status']);
			  //xiewendan 20150612 添加表单中借阅文件的判断 如果没有借阅文件也可以直接删除
			  var pnum=$("#esDataList").flexGetColumnValue(trObj,['pnum'])*1;
			  if(status!='已结束' && pnum > 0){
				  var n = $("#esDataList").flexGetColumnValue(trObj,['num']);
				  otherIds += n+",";
				  return;
			  }
			  id+=$(this).val()+',';
		  });
		  if(otherIds!=""){
			  otherIds = otherIds.substr(0,otherIds.length-1);
			  $.dialog.notice({width: 150,content:'您选择的第【'+otherIds+'】行借阅单不是已结束状态，不能删除，请重新选择！',icon:'warning',time:3});
			  return false;
		  }
		  id = id.substr(0,id.length-1);
		  $.dialog({
				  content:'确认要删除吗?',
				  ok:true,
				  okVal:'确认',
				  cancel:true,
				  cancelVal:'取消',
				  ok:function(){
					  var url=$.appClient.generateUrl({ESDocumentBorrowing:'delBorrowList'},'x');
					  $.get(url,{id:id},function(data){
						  if(data){
							 $("input[name='changeId']").attr('checked',false);
							 $.dialog.notice({width: 150,icon:'succeed',content:'你选择的借阅单删除成功！',time:3,title:'3秒后自动关闭！'});
							 $("#esDataList").flexReload();
						 }else{
							$.dialog.notice({width: 150,icon:'error',content:'你选择的借阅单删除失败！',time:3,title:'3秒后自动关闭！'});
						 }
					  });
				  },
				  cache:false
			  });
	  }else{
		  $.dialog.notice({width: 150,icon:'warning',content:'请选择您需要删除的数据！',time:3,title:'3秒后自动关闭！'});
		  return false;
	  }
};
function filterBorrowForm(){
	  var url=$.appClient.generateUrl({ESDocumentBorrowing:'filter'},'x');
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
					 var condition = filterValue();
					 var statusForTree = $('#lendtype').val();
                     $("#esDataList").flexOptions({
                    	 url:$.appClient.generateUrl({ESDocumentBorrowing:'getfieldData',id:treeNodeForGrid.id,pId:treeNodeForGrid.pId},'x'),
                    	 newp:1,
                         query:{condition:condition,statusForTree:statusForTree}
                     }).flexReload();
				 },
				 cache:false
			 }); 
		  },
		  cache:false
	  });
};
//获取筛选条件
function filterValue() {
    var where = "";
    $("#contents p").each(function(i) {
        var esfields = $("select[name='esfields']").eq(i).val();
        var comparison = $("select[name='comparison']").eq(i).val();
        var esfieldvalue = $("input[name='esfieldvalue']").eq(i).val();
        var relation = $("select[name='relation']").eq(i).val();
        if (esfields) {
        	where+=esfields + ':' + comparison + ':' + esfieldvalue + ':' + relation+",";
        }
    });
    if(where!="") where = where.substring(0, where.length);
    return where;
};
function backIndex(){
	 var statusForTree = $('#lendtype').val();
    $("#esDataList").flexOptions({
    	id:'1',
        pId:'',
        query:{condition:'',statusForTree:statusForTree}
    }).flexReload();
};

function printBorrowPage(){
	var display = '';//标识
    //选择报表模版
	var checkObj=$("#esDataList").find("input[name='changeId']:checked");
    if (checkObj.length > 0) {
       var display = "none";
    } else {
       var display = "black";
    }
    $.ajax({
	    url:$.appClient.generateUrl({ESDocumentBorrowing:'report',display:display},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'请选择报表',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
			    padding:0,
			    content:data,
			    cancelVal: '关闭',
                cancel: true,
                okVal: '打印',
                ok: true,
                ok: function() {
                	var borrowId = '';
                	var borrowNum = '';
                	var checks = $("#esDataList").find("input[type='checkbox']:checked").each(function(){
                		borrowId += $(this).val()+",";
                		borrowNum += $(this).closest("tr").find("td[colname='borrowNum'] div").text()+",";
        			});
                	borrowId=borrowId.substring(0, borrowId.length-1);
                	borrowNum=borrowNum.substring(0, borrowNum.length-1);
                	var radioObj=$("#selectreport").find("input[name='id']:checked");
				   	  	if(radioObj.length!='1'||radioObj.length=='undefined'){
				   	  		$.dialog.notice({width: 150,content:'请选择借阅报表实例！',icon:'warning',time:3});
				   	  		return false;
				   	  	}else{
				   	  		var reportId = '';//报表id
				   	  		var reportTitle = '';//报表标题
				   	  		var reportStyle = '';//报表格式
				   	  		var condition = filterValue();
				   	  		radioObj.each(function(){
				   	  			var trObj = $(this).closest("tr");
				   	  			reportId = $(this).val();
				   	  			reportTitle = $("#selectreport").flexGetColumnValue(trObj,['title']);
				   	  			reportStyle = $("#selectreport").flexGetColumnValue(trObj,['reportstyle']); 
				   	  		});
				   	  		$.dialog.notice({
				   	  			icon: "success",
				   	  			content: '正在努力打印中,稍后点击“消息提示”进行下载',
				   	  			time: 3
				   	  		});
				   	  		$.ajax({
				   	  			type: 'POST',
				   	  			url: $.appClient.generateUrl({
				   	  				ESDocumentBorrowing: 'printBorrowreport'},'x'),
				   	  			data: {
				   	  				borrowId: borrowId,
				   	  				borrowNum: borrowNum,
				   	  				reportId:reportId,
				   	  				reportTitle:reportTitle,
				   	  				reportStyle:reportStyle,
				   	  				query:{condition:condition}
				   	  			},
				   	  			success: function(data) {
                            	if (data == 'true') {
                            		$.dialog.notice({icon: "success",content: "打印报表成功!",time: 3});
                            	} else if (data == '2') {
                            		$.dialog.notice({icon: "warning",content: "没有满足条件的数据!",time: 3});
                            		return false;
                            	} else {
                                 $.dialog.notice({icon: "error",content: "打印报表失败!",time: 3});
                            	}
				   	  			},
				   	  			cache: false
				   	  		});
				   	  	}
                },
                cancel: function() {}
		    });
		    },
		    cache:false	
    	});	
}
var orderUsingDocId = 0;
var pathsStatus = '';
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
		  var showcols1=[
			{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
			{display: '', name: 'box', width : 20, align: 'center',metadata:'box'}, 
			{display: '文件id', hide:true, name : 'docId', width : 40, align: 'center',metadata:'docId'},
			{display: '借阅单编号', name: 'borrowNum',width : 90,align: 'left',metadata:'borrowNum',hide:true},
			{display: '文件标题', name : 'title', width : 100, align: 'left',metadata:'title'},
			{display: '文件编码', name : 'docNo', width : 100, align: 'left',metadata:'docNo'},
			{display: '状态', name: 'status',width : 90,align: 'center',metadata:'status'},
			{display: '项目名称', name : 'itemName', width : 120, align: 'left',metadata:'itemName'},
			{display: '收集范围名称', name : 'stageName', width : 120, align: 'left',metadata:'stageName'},
			{display: '装置分类名称', name : 'deviceName', width : 120, align: 'left',metadata:'deviceName'},
			{display: '拟定部门名称', name : 'participatoryName', width : 120, align: 'left',metadata:'participatoryName'},
			{display: '文件类型代码', hide:true, name : 'documentCode', width : 50, align: 'left',metadata:'documentCode'},
			{display: '文件类型名称', name : 'documentTypeName', width : 100, align: 'left',metadata:'documentTypeName'},
			{display: '文件专业代码', hide:true, name : 'engineeringCode', width : 50, align: 'left',metadata:'engineeringCode'},
			{display: '文件专业名称', name : 'engineeringName', width : 100, align: 'left',metadata:'engineeringName'},
			{display: '借阅人id', hide:true, name : 'readerId', width : 40, align: 'center',metadata:'readerId'}
			];
			$("#orderUsingPaths").flexigrid({
				 
				url:$.appClient.generateUrl({ESDocumentBorrowing:'getBespeakList',type:'all'},'x'),
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
			$("#orderUsingPaths tr").live('click',function(){
				var trObj=$(this).closest('tr');
				var docId = $("#orderUsingPaths").flexGetColumnValue(trObj,['docId']);
				pathsStatus = $("#orderUsingPaths").flexGetColumnValue(trObj,['status']);
				orderUsingDocId = docId;
				var type = $(".orderUsingPath").find("select[name='mySelect']").val();
				$("#orderUsingForm").flexOptions({url:$.appClient.generateUrl({ESDocumentBorrowing:'getBespeakDetail',docId:docId,type:type},'x')}).flexReload();
			});
			var showColModel1=[
			    {display: '数据标识', name: 'id',width : 90,align: 'center',metadata:'id',hide:true},
                {display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
				{display: '<input type="checkbox" name="paths">', name : 'ids', width : 20, align: 'center',metadata:'box'},
				{display: '借阅单编号', name : 'borrowNum', width : 120, align: 'left',metadata:'borrowNum'},
				{display: '借阅人', name : 'borrowPerson', width : 80, align: 'left',metadata:'borrowPerson'},
				{display: '登记日期', name : 'regDate', width : 100, align: 'center',metadata:'regDate'},
				{display: '单位', name : 'unit', width : 180, align: 'left',metadata:'unit'},
				{display: '电话', name : 'telphone', width : 80, align: 'left',metadata:'telphone'},
				{display: '邮箱', name : 'email', width : 120, align: 'left',metadata:'email'},
				{display: '催还提前天数', name : 'overdueDays', width : 60, align: 'right',metadata:'overdueDays'},
				{display: '登记人', name : 'regPerson', width : 80, align: 'left',metadata:'regPerson'},
				{display: '状态', name : 'status', width : 60, align: 'center',metadata:'status'},
				{display: '身份证', name : 'idcardnum', width : 150, align: 'left',metadata:'idcardnum'},
				{display: '件数', name : 'pnum', width : 60, align: 'right',metadata:'pnum'},
				{display: '备注', name : 'remark', width : 120, align: 'left',metadata:'remark'},
				{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true}
			];
			 var buttons1 = [
	         	{name: '借出', bclass: 'export',onpress:lendDocumentUpOrder},
	         	{name: '借阅', bclass: 'tranlist',onpress:lendDocumentUpOrder}
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
	  $('.orderUsingPath div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">预约的文件数据</span>').append("<select name='mySelect' style='float:left;margin:2px 0px 3px 5px ;width:120px' ><option value='all' selected>全部预约数据</option><option value='noOrder'>已归还数据</option><option value='order'>未归还数据</option></select>");
	  $('.orderUsingPath div[class="tDiv"]').css("border-top","1px solid #ccc");
	  $('.orderUsingForm div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">预约的利用单数据</span>');
	  $('.orderUsingForm div[class="tDiv"]').css("border-top","1px solid #ccc");
	  $(".orderUsingPath").find("select[name='mySelect']").change(function (){
			var v = $(this).val();
			$("#orderUsingForm tr").remove();
			$("#orderUsingPaths").flexOptions({url:$.appClient.generateUrl({ESDocumentBorrowing:'getBespeakList',type:v},'x')}).flexReload();
		});
};
function lendDocumentUpOrder(name){
	var checkObj=$("#orderUsingForm").find("input[name='changeId']:checked");
	if(checkObj.length!='1'||checkObj.length=='undefined'){
		 $.dialog.notice({width: 150,content:'请选择一条要'+name+'的数据！',icon:'warning',time:3});
		 return false;
	 }
	var trObj=$(checkObj[0]).closest('tr');
	var bNum=$("#orderUsingForm").flexGetColumnValue(trObj,['borrowNum']);// 借阅单编号
	var status=$("#orderUsingForm").flexGetColumnValue(trObj,['status']);// 借阅状态
	if(status == "已结束"){
		$.dialog.notice({width: 150,content:'您选择的借阅单处于已结束状态，不能'+name+'，请重新选择！',icon:'warning',time:3});
		return false;
	}
	if(pathsStatus != "预约"){
		if(pathsStatus != "续借" && pathsStatus != "归还"){
			$.dialog.notice({width: 150,content:'您选择的数据'+pathsStatus+'，不能'+name+'，请重新选择！',icon:'warning',time:3});
			return false;
		}else{
			$.dialog.notice({width: 150,content:'您选择的数据已'+pathsStatus+'，不能'+name+'，请重新选择！',icon:'warning',time:3});
			return false;
		}
	}
	var url = $.appClient.generateUrl({ESDocumentBorrowing : "lendDocumentUpOrder"},'x');
	$.ajax({
		url:url,
		data:{type:name,bNum:bNum,docId:orderUsingDocId},
		success:function(data){
			if(data == "true"){
				$.dialog.notice({width: 150,icon:'success',content:name+'成功！',time:3});
				$("#orderUsingPaths").flexReload();
				$("#orderUsingForm").flexReload();
				$("#esDataList").flexReload();
			}else if(data == "false"){
				$.dialog.notice({width: 150,icon:'error',content:name+'失败！',time:3});
				return false;
			}else{
				$.dialog.notice({width: 150,icon:'warning',content:data,time:3});
				return false;
			}
		},
		cache:false
	},'json');
}
function endUsingForm(){
	 var id='';//借阅单id
	 var borrowNum = '';//借阅单编号
	 var otherIds = '';
	 var checkboxesObj=$("#esDataList").find("input[name='changeId']:checked");
	 if(checkboxesObj.length>0){
		  checkboxesObj.each(function(){
			  var trObj=$(this).closest("tr");
			  var status=$("#esDataList").flexGetColumnValue(trObj,['status']);
			  if(status == '已结束'){
				  var n = $("#esDataList").flexGetColumnValue(trObj,['num']);
				  otherIds += n+",";
				  return;
			  }
			  id+=$(this).val()+",";
			  borrowNum+=$("#esDataList").flexGetColumnValue(trObj,['borrowNum'])+",";
		  });
		  if(otherIds!=""){
				otherIds = otherIds.substr(0,otherIds.length-1);
				$.dialog.notice({width: 150,content:'您选择的第【'+otherIds+'】行借阅单处于已结束状态，无法结束，请重新选择！',icon:'warning',time:3});
				return false;
		  }
		  id = id.substr(0,id.length-1);
		  borrowNum = borrowNum.substr(0,borrowNum.length-1);
		  $.ajax({
				url:$.appClient.generateUrl({ESDocumentBorrowing : "getBorrowFileIdByNum"},'x'),
				data:{borrowNum:borrowNum},
				success:function(data){
					if(data=="true" || data==""){
						$.dialog({
							  content:'确认要结束吗?',
							  ok:true,
							  okVal:'确认',
							  cancel:true,
							  cancelVal:'取消',
							  ok:function(){
								  var url=$.appClient.generateUrl({ESDocumentBorrowing:'endUsingForm'},'x');
								  $.get(url,{id:id,borrowNum:borrowNum},function(data){
									  if(data !='0'){
										  $.dialog.notice({width: 150,icon:'succeed',content:'你选择的借阅单结束成功！',time:3,title:'3秒后自动关闭！'});
										  $("#esDataList").flexReload();
									  }else{
										  $.dialog.notice({width: 150,content:'你选择的借阅单结束失败！',icon:'error',time:3});
										  return false;
									  }
								  },'json'
								  );
							  },
							  cache:false,
							  async: false
						  });
					}else if(data!="false" && data!="true" && data!=""){
						$.dialog.notice({width: 150,content:'您选择借阅单下存在未归还的借阅或借出数据，不能结束！',icon:'warning',time:3});
						return false;
					}else{
						$.dialog.notice({width: 150,content:'你选择的借阅单结束失败！',icon:'error',time:3});
						return false;
					}
				},
				cache:false,
				async: false
		  });
	 }else{
		$.dialog.notice({width: 150,content:'请选择您需要结束的借阅单！',icon:'warning',time:3});
		return false;
	}
};

function addDetails(){
	var url=$.appClient.generateUrl({ESDocumentBorrowing:'record'},'x');
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
		    		var flag =  linkBorrowDetail();
					var thisDialog=this;
					if(!flag){
						return false;
					}else{
						thisDialog.close();	
					}
				 },
				 init:createFileTree(1)
		    });
	    	// 挂接借阅文件信息
		    function linkBorrowDetail(){
		    	var flag = '';
		    	var ACode='';
		    	var title='';
		    	var files = [];
		    	var oValues=[];
		    	var checkboxs = $("#borrowlist").find("input:checked");
		    	if (checkboxs.length > 0 ){
		    		// 判断重复添加
		    		/* */
		    		var columns = ['itemName','stageCode','stageName','deviceCode','deviceName','participatoryCode','participatoryName','documentTypeName','documentCode','engineeringName','engineeringCode','title','docNo'];
		    		var canDelCount = 0;
		    		var flowCount = 0;
		    		var __colMol=[
		    		    			{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
		    		    			{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 20, align: 'center'},
		    		    			{display: '文件id', hide:true, name : 'docId', width : 40, align: 'center',metadata:'docId'},
		    		    			{display: '文件标题', name : 'title', width : 100, align: 'left',metadata:'title'},
		    		    			{display: '文件编码', name : 'docNo', width : 100, align: 'left',metadata:'docNo'},
		    		      			{display: '借阅类型', name: 'type',width : 50,align: 'left',metadata:'type'},
		    		    			{display: '状态', name: 'status',width : 50,align: 'center',metadata:'status'},
		    		    			{display: '发生日期', name: 'date',width : 60,align: 'center',metadata:'date'},
		    		    			{display: '应归还日期', name: 'shouldReturnDate',width : 60,align: 'center',metadata:'shouldReturnDate'},
		    		    			{display: '归还日期', name: 'RETURN_DATE',width : 60,align: 'center',metadata:'RETURN_DATE'},
		    		    			{display: '项目名称', name : 'itemName', width : 120, align: 'left',metadata:'itemName'},
		    		    			{display: '收集范围代码', hide:true, name : 'stageCode', width : 40, align: 'left',metadata:'stageCode'},
		    		    			{display: '收集范围名称', name : 'stageName', width : 120, align: 'left',metadata:'stageName'},
		    		    			{display: '装置分类代码', hide:true, name : 'deviceCode', width : 40, align: 'left',metadata:'deviceCode'},
		    		    			{display: '装置分类名称', name : 'deviceName', width : 120, align: 'left',metadata:'deviceName'},
		    		    			{display: '拟定部门代码', hide:true, name : 'participatoryCode', width : 40, align: 'left',metadata:'participatoryCode'},
		    		    			{display: '拟定部门名称', name : 'participatoryName', width : 120, align: 'left',metadata:'participatoryName'},
		    		    			{display: '文件类型代码', hide:true, name : 'documentCode', width : 50, align: 'left',metadata:'documentCode'},
		    		    			{display: '文件类型名称', name : 'documentTypeName', width : 100, align: 'left',metadata:'documentTypeName'},
		    		    			{display: '文件专业代码', hide:true, name : 'engineeringCode', width : 50, align: 'left',metadata:'engineeringCode'},
		    		    			{display: '文件专业名称', name : 'engineeringName', width : 100, align: 'left',metadata:'engineeringName'},
		    		    			{display: '件数', name: 'innerFileCount',width : 90,align: 'right',metadata:'innerFileCount'},
		    		    			{display: '备注', name: 'mark', width :90,align: 'left',metadata:'mark'},
		    		    			{display: '是否改变颜色', name : 'changeColor', width : 120, sortable : true, align: 'center',metadata:'changeColor',hide:true}
		    		    		];
		    		/** gaoyd * */
		    		var ids = '';
		    		checkboxs.each(function() {
		    			ids+=$(this).val()+",";
		    		});
		    		ids=ids.substr(0,ids.length-1);
			    	var j = 0;
			    	var numTab = '';
			    	var tab = false;
			    	var checkboxes=$("#borrowDetails").find("tr");
			    	var oldId = new Array();
			    	checkboxs.each(function() {
			    		tab = true;
			    		var selecId = $(this).val();
			    		if(checkboxes.length>0){
			    			checkboxes.each(function() {
			    				var $tabObj = $(this).closest("tr");
			    				var id=$("#borrowDetails").flexGetColumnValue($tabObj,['docId']);// 文件id
			    				var status=$("#borrowDetails").flexGetColumnValue($tabObj,['status']);// 文件id
			    				if(id==selecId){
			    					j++;tab = false;oldId.push(id);
			    			    	return;
			    			    }else{
			    			    	tab = true;
			    			    }
			    			});		
			    		 }
			    		if(j==0){
			    		 notIndexOf();
			    		 if(tab==true && oldId.indexOf(selecId)==-1){
				    		 var nums = $("#borrowDetails tr").length+1;
				    		 var colValues = $("#borrowlist").flexGetColumnValue($(this).closest("tr"),columns);
				    		 var colValuesArray = colValues.split("|");
				    		 $('#borrowDetails').flexExtendData([{
				    		    "id" : '',
				    		    "cell" : {
				    		    	'num':nums,
				    		    	'id3':'<input type="checkbox" id="'+nums+'" name="changeId" value="0" />',
				    		    	'docId':$(this).val(),
				    		    	'itemName':colValuesArray[0],
				    		    	'stageCode':colValuesArray[1],
				    		    	'stageName':colValuesArray[2],
				    		    	'deviceCode':colValuesArray[3],
				    		    	'deviceName':colValuesArray[4],
				    		    	'participatoryCode':colValuesArray[5],
				    		    	'participatoryName':colValuesArray[6],
				    		    	'documentTypeName':colValuesArray[7],
				    		    	'documentCode':colValuesArray[8],
				    		    	'engineeringName':colValuesArray[9],
				    		    	'engineeringCode':colValuesArray[10],
				    		    	'title':colValuesArray[11],
				    		    	'docNo':colValuesArray[12],
				    		    	'borrowtype':"实体",
				    		    	'status':"未借阅",
				    		    	'happen_date':"",
				    		    	'shouldreturndate':"",
				    		    	'return_date':"",
				    		    	'pnum':'<input name="innerFileCount" type="text" verify="number/10/1/0" size="12" value="1" placeholder="请输入件数"/>',
				    		    	'remark':'<input name="mark" type="text" size="12" verify="unspecial/512/0/0" value="" placeholder="请填写备注"/>'
				    		    }
				    		 }]);
				    		 $("#add_borrowDetails").autovalidate();
				    		 $("#edit_borrowDetails").autovalidate();
			    		  }
			    		}
			    	});
			    	if(j>0){
			    		$.dialog.notice({title:'操作提示',content:'您选择的数据重复，请重新选择！',icon:'warning',time:3});
	    		    	flag = false;
		    		}else{
				    	flag = true;
				    	var borrownum = $("#borrownum").val();
			    		 if(borrownum != "" && borrownum != null && borrownum != 'undefined' ){
				    		var detailArray = new Array();
				    		var borrowform = new Object();// 借阅单
				    		var index=0;// 下标
				    		var checkbox1 = $("#borrowDetails").find("tr");
				    		checkbox1.each(function(){
				    			var borrowdetail=new Object();// 放借阅
				    			var trObj=$(this).closest('tr');
				    			var id = $("#borrowDetails").flexGetColumnValue(trObj,['id']);
				    			if(id == ""){
				    				borrowdetail['docId'] = $("#borrowDetails").flexGetColumnValue(trObj,['docId']);// 文件id
						   	    	borrowdetail['itemName'] = $("#borrowDetails").flexGetColumnValue(trObj,['itemName']);// 项目名称
						   	    	borrowdetail['stageCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['stageCode']);// 收集范围代码
						   	    	borrowdetail['deviceCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['deviceCode']);// 装置号
						   	    	borrowdetail['participatoryCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['participatoryCode']);// 部门代码
						   	    	borrowdetail['documentCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['documentCode']);// 类型代码
						   	    	borrowdetail['engineeringCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['engineeringCode']);// 专业代码
						   	    	borrowdetail['title'] = $("#borrowDetails").flexGetColumnValue(trObj,['title']);// 文件标题
						   	    	borrowdetail['docNo'] = $("#borrowDetails").flexGetColumnValue(trObj,['docNo']);// 文件编码
						   	    	borrowdetail['type'] = $("#borrowDetails").flexGetColumnValue(trObj,['borrowtype']);// 类型
						   	    	borrowdetail['status'] = $("#borrowDetails").flexGetColumnValue(trObj,['status']);// 状态
						   	    	borrowdetail['happendate'] = $("#borrowDetails").flexGetColumnValue(trObj,['happen_date']);// 发生日期
						   	    	borrowdetail['shouldreturndate'] = $("#borrowDetails").flexGetColumnValue(trObj,['shouldreturndate']);// 应归还日期
						   	    	borrowdetail['return_date'] = $("#borrowDetails").flexGetColumnValue(trObj,['return_date']);// 归还日期
						   	    	borrowdetail['pnum'] = trObj.find("input[name='innerFileCount']").val();//件数
						   		    borrowdetail['remark'] = trObj.find("input[name='mark']").val();// 备注
						   	    	detailArray[index++] = borrowdetail;
				    			}
				    		});
			    			borrowform['borrownum'] = $("#borrownum").val();// 借阅单编号
			    			borrowform['pnum'] = checkbox1.length;
			    			borrowform['id'] = $("#formid").val();
			    			var url=$.appClient.generateUrl({ESDocumentBorrowing:'editSave'},'x');
			    			$.post(url,{borrowdetail:detailArray,borrowform:borrowform},function(result){});
			    		 }
		    		 }
		    	}else{
		    		$.dialog.notice({width: 150,title:'操作提示',content:'请选择您要添加的数据！',icon:'warning',time:3});
		    		return false;
		    	}
		    	return flag;
		    }
		    
	    }
	})
}

function createFileTree(treetype){
	var setting={
			view:{
				dblClickExpand: true,
				showLine: false
			},
			data:{
				simpleData: {
					enable: true
				}
			},
			async: {
				enable: true,
				autoParam:['id','column','path','number']
			},
			callback:{
				onClick:nodeClick
			}
		};
		function nodeClick(event, treeId, treeNode){
			zTree = $.fn.zTree.getZTreeObj("filetree");
			//zTree.expandNode(treeNode);
			var strucid=treeNode.id;
			var code = treeNode.code;
			if(treetype=="1"){
				var url=$.appClient.generateUrl({ESDocumentBorrowing:'datalist',type:treetype,sId:strucid},'x');
			}else{
				var url=$.appClient.generateUrl({ESDocumentBorrowing:'datalist',type:treetype,sId:code},'x');
			}
			$("#borrowlistbox").load(url);
		};
		$("#treeType").val(treetype);
		$("#treenodeid").val(0);
		$("#treeCode").val("");
		
		var url = $.appClient.generateUrl({ESDocumentsCollection : "getTree"},'x');
		$.ajax({
			url:url,
			data:{treetype:treetype},
			dataType: 'json',
			success:function(nodes){
				$.fn.zTree.init($("#filetree"), setting, nodes);
			},
			cache:false
		});
}

// 添加行,删除行按钮
$('.newfilter').die().live('click',function (){
	$($('#contents>p:last').clone()).appendTo($('#contents'));
	
});

$('.delfilter').die().live('click',function (){
	if($('#contents p').length > 5){
		$(this).closest('p').remove();
	}else{
		var tds = $(this).closest('p');
		tds.find('input').val('');
		var select = tds.find('select');
		$(select[0]).val("1");
		$(select[1]).val("like");
		$(select[2]).val("AND");
	}
});
// 选择用户
$('#btn').die().live('click',function userToRoles(){
	$.ajax({
        url : $.appClient.generateUrl({ESDocumentBorrowing : 'listUsers'},'x'),
	    success:function(data){
		    	$.dialog({
			    	title:'选择用户',
			    	modal:true, // 蒙层（弹出会影响页面大小）
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
			    	// okVal:'保存',
				    // ok:true,
				    cancelVal: '关闭',
				    padding:0,
				    cancel: true,
				    content:data,
				    ok:function()
			    	{	
				      var checkboxesObj=$("input[name='userId']:checked");
				   	  if(checkboxesObj.length!='1'||checkboxesObj.length=='undefined'){
				   		  $.dialog.notice({width: 150,content:'请选择一名用户！',icon:'warning',time:3});
				   		  return false;
				   	  }else{
				   		  var siug=0;
				   		  checkboxesObj.each(function(){
					   		  var trObj=$(this).closest("tr");
					   		  var readerId=$("#userGrid").flexGetColumnValue(trObj,['userid']);
					   		  var name=$("#userGrid").flexGetColumnValue(trObj,['Name']);
					   		  var id = $("#userGrid").flexGetColumnValue(trObj,['id']);
					   		  var dept = $("#userGrid").flexGetColumnValue(trObj,['orgname']);
					   		  var email = $("#userGrid").flexGetColumnValue(trObj,['emailAddress']);
					   		  var tel = $("#userGrid").flexGetColumnValue(trObj,['mobTel']);
					   		  $('#bName').val(name);
					   		  $('input[name=dept]').val(dept);
					   		  $('input[name=email]').val(email);
					   		  $('input[name=tel]').val(tel);
					   		  $('#uid').val(id);
					   		  $('#readerId').val(readerId);
				   		  })
				   		  $("#bName").removeClass("invalid-text");
				   		  $("#bName").attr('title',"");
				   	  }
				    },
					init: function(){
						
					}
			    });
		    },
		    cache:false
	});
});

//删除借阅文件信息
function delDetails(){
	var id= '';
	var borrowNum= '';
	var otherIds = '';
	var docId = '';
	var title='';
	var checkboxes=$("#borrowDetails").find("input[name='changeId']:checked");
	if(checkboxes.length>0){
		borrowNum += $("#borrownum").val();
		checkboxes.each(function(){
			var trObj=$(this).closest('tr');
			var status = $("#borrowDetails").flexGetColumnValue(trObj,['status']);
			var n = $("#borrowDetails").flexGetColumnValue(trObj,['num']);
			if(status != "未借阅" && status != "归还" && status != "预约"){
				otherIds += n+",";
				return;
			}
			id += $("#borrowDetails").flexGetColumnValue(trObj,['id'])+",";
			docId += $("#borrowDetails").flexGetColumnValue(trObj,['docId'])+",";
			title += $("#borrowDetails").flexGetColumnValue(trObj,['title'])+",";
		});
		if(otherIds!=""){
			otherIds = otherIds.substr(0,otherIds.length-1);
			$.dialog.notice({width: 150,content:'您选择的数据第【'+otherIds+'】行不是未借阅，预约或归还状态，不能删除，请重新选择！',icon:'warning',time:3});
			return false;
		}else{
			id = id.substr(0,id.length-1);
			docId = docId.substr(0,docId.length-1);
			title = title.substr(0,title.length-1);
			$.dialog({
				content:'确认要删除吗?',
				ok:true,
				okVal:'确认',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					var url=$.appClient.generateUrl({ESDocumentBorrowing:'delDetails'},'x');
					 $.post(url,{id:id,docId:docId,borrowNum:borrowNum,title:title},function(data){
						 if(data){
							 $("input[name='changeId']").attr('checked',false);
							 $.dialog.notice({width: 150,icon:'succeed',content:'你选择的数据删除成功！',time:3,title:'3秒后自动关闭！'});
							 $("#borrowDetails").flexReload();
						  }else{
							 $.dialog.notice({width: 150,icon:'error',content:'你选择的数据删除失败！',time:3,title:'3秒后自动关闭！'});
							 return false;
						  }
					});
				},
				cache:false
			});
		}
	}else{
		$.dialog.notice({width: 150,icon:'warning',content:'请选择您需要删除的数据！',time:3,title:'3秒后自动关闭！'});
		return false;
	}
}

var lendDays=-1;
var lendCount=-1;
var relend = new Array();
// 借阅借出
function changeStatus(name){
	var lendnums = 0;//借出总件数
	var checkbox=$("#borrowDetails").find("input[name='changeId']:checked");
	// 判断是否改变借阅明细的数据
	if(checkbox.length==0){
		$.dialog.notice({width: 150,content:'请选择借阅明细的数据！',icon:'warning',time:3});
		return false;
	}
	var formStatus = '';
	var checkObj=$("#esDataList").find("input[name='changeId']:checked");
	checkObj.each(function(){
		  var trObj=$(checkObj[0]).closest('tr');
		  formStatus += $("#esDataList").flexGetColumnValue(trObj,['status']);
		  borrowNum =+ $("#esDataList").flexGetColumnValue(trObj,['borrowNum']);
	});
	if(formStatus == '已结束'){
		$.dialog.notice({width: 150,content:'您选择的借阅单已结束，无法'+name+'，请重新选择',icon:'warning',time:3});
		return false;
	}
	var rownum =0;
	var isLend =false;
	var isLending = [];// 已借出或借阅的行数
	var ba = new Array();
	var username = $('#bName').val();
	var userid = $('#uid').val();
	var readerId = $('#readerId').val();
	var islendnum = 0;//借出的件数
	var notRole = '';
	if(name!="归还"){
		if(name=="借出"){
		 $.ajax({
			    url:$.appClient.generateUrl({ESDocumentBorrowing:'getBorrowRoleWithId'},'x'),
			    data:{userid:$('#uid').val()},
			    dataType: 'json',
			    success:function(data){
			    	data = eval(data);
			    	lendCount = data.lendCount;
				    lendDays = data.lendDays;
				    islendnum = data.pnum;
				    notRole = data.notRole;
			    },
			    cache: false,
			    async: false
			});
		 	if(notRole == true){
		 		$.dialog.notice({width: 150,title:'操作提示',content:'请为当前用户添加借阅角色！',icon:'warning',time:3});
		 		return false;
		 	}
		 	if(lendDays=="null" || lendDays==null || lendDays==""){
		 		$.dialog.notice({width: 150,title:'操作提示',content:'请为当前用户的借阅角色设置借出天数！',icon:'warning',time:3});
		 		return false;
		 	}else if(lendCount=="null" || lendCount==null ||lendCount==""){
		 		$.dialog.notice({width: 150,title:'操作提示',content:'请为当前用户的借阅角色设置借出件数！',icon:'warning',time:3});
		 		return false;
		 	}else if(lendCount==0 || lendDays==0){
		 		$.dialog.notice({width: 150,title:'操作提示',content:'当前用户的借阅角色借出天数或借出件数为0，请重新设置！',icon:'warning',time:3});
		 		return false;
		 	}
		}
		var returnNums = '';//已归还的数据编号
		var otherNums = '';//已处理的数据编号
		var relendNums = '';//续借的数据编号
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var pnum = trObj.find("input[name='innerFileCount']").val();
			var remark = trObj.find("input[name='mark']").val();// 备注
			if(pnum == undefined && remark == undefined){
				pnum = $("#borrowDetails").flexGetColumnValue(trObj,['pnum']);
				remark = $("#borrowDetails").flexGetColumnValue(trObj,['remark']);
			}
			var id = $("#borrowDetails").flexGetColumnValue(trObj,['id']);
			var docId = $("#borrowDetails").flexGetColumnValue(trObj,['docId']);
			var n = $("#borrowDetails").flexGetColumnValue(trObj,['num']);
			var title = $("#borrowDetails").flexGetColumnValue(trObj,['title']);
			lendnums+=pnum*1;
    		var sta = $("#borrowDetails").flexGetColumnValue(trObj,['status']);
    		if(sta!='未借阅' && sta!='预约'){
    			if(sta=='归还'){
    				returnNums += n+",";
    			}else if(sta == '续借' && name != '续借'){
    				relendNums += n+",";
    			}else{
    				otherNums += n+",";
    			}
    			return;
    		}
    		if(id == ""){
    			f = true;
    		}
    		var m =new Object();
    		m['num']=n;
    		m['id']=id;
    		m['pnum'] = pnum;
    		m['remark'] = remark;
    		m['docId'] = docId;
    		m['borrowstatus'] = name;
    		m['lendDays'] = lendDays;
    		m['borrowNum'] = $("#borrownum").val();
    		m['readerId'] = readerId;
    		m['regperson'] = $("input[name='register']").val();
    		m['isBespeak'] = false;
    		m['formStatus'] = formStatus;
    		m['title'] = title;
    		ba.push(m);
		});
		if(returnNums!=""){
			returnNums = returnNums.substr(0,returnNums.length-1);
			$.dialog.notice({width: 150,content:'您选择的数据中第【'+returnNums+'】行已归还，不能'+name+'，请重新选择！',icon:'warning',time:3});
			return false;
		}
		if(otherNums!=""){
			otherNums = otherNums.substr(0,otherNums.length-1);
			$.dialog.notice({width: 150,content:'您选择的数据中第【'+otherNums+'】行不是未借阅或预约状态，不能'+name+'，请重新选择！',icon:'warning',time:3});
			return false;
		}
		if(relendNums!=""){
			relendNums = relendNums.substr(0,relendNums.length-1);
			$.dialog.notice({width: 150,content:'您选择的数据中第【'+relendNums+'】行已续借，不能'+name+'，请重新选择！',icon:'warning',time:3});
			return false;
		}
		if(name=="借出"){
			if(islendnum==null || islendnum == "" || islendnum == "null"){
				 islendnum = 0*1;
			 }
			 if(islendnum>=lendCount){
				$.dialog.notice({width: 150,title:'操作提示',content:'当前用户的借阅角色最大借出件数为'+lendCount+'件，已全部借出，请重新选择！',icon:'warning',time:3});
				return false;
			 }else if((lendnums+islendnum)>lendCount || lendnums>lendCount){
				$.dialog.notice({width: 150,title:'操作提示',content:'当前用户的借阅角色最大借出件数为'+lendCount+'，已借出'+islendnum+'件，请重新选择！',icon:'warning',time:3});
				return false;
			 }
		}
		if(ba.length>0){
			$.ajax({
				type:'POST',
			    url:$.appClient.generateUrl({ESDocumentBorrowing:'getDocumentBorrowStatus'},'x'),
			    data:{details:ba},
			    success:function(data){
			    	if(data != "false"){
			    		if(data == "true"){
			    			$.ajax({
			    				type:'POST',
			    			    url:$.appClient.generateUrl({ESDocumentBorrowing:'changeDetails'},'x'),
			    			    data:{details:ba},
			    			    dataType: 'json',
			    			    success:function(data){
			    			    	if(data>0){
			    			    		$.dialog.notice({width: 150,content: name+'成功',icon: 'succeed',time: 3});
			    			    		$('#borrowDetails').flexReload();
			    			    	}else{
			    			    		$.dialog.notice({width: 150,content: name+'失败',icon: 'error',time: 3});
			    			    	}
			    			    },
			    			    cache: false,
			    			    async: false
			    			});
			    		}else{
			    			$.dialog.notice({width: 150,content: '您选择的数据第【'+data+'】行已借阅或已借出，不能'+name+'，数据已添加到预约栏，请查看预约！',icon: 'succeed',time: 3});
			    			$('#borrowDetails').flexReload();
			    		}
			    	}
			    },
			    cache: false,
			    async: false
			});
		}
	}else{// 归还
		var ids = new Array();
		var returnIds = '';
		var bespeakIds = '';
		var otherIds = '';
		checkbox.each(function(){
			var trObj=$(this).closest('tr');
			var id = $("#borrowDetails").flexGetColumnValue(trObj,['id']);
			var status = $("#borrowDetails").flexGetColumnValue(trObj,['status']);
			var docId = $("#borrowDetails").flexGetColumnValue(trObj,['docId']);
			var n = $("#borrowDetails").flexGetColumnValue(trObj,['num']);
			var title = $("#borrowDetails").flexGetColumnValue(trObj,['title']);
			if(status=='未借阅'){
				otherIds += n+",";
				return;
			}if(status=='预约'){
				bespeakIds += n+",";
				return;
			}else if(status=='归还'){
				returnIds += n+",";
				return;
			}
			var m = new Object();
			m['id'] = id;
			m['borrowstatus'] = name;
			m['borrowNum'] = $("#borrownum").val();
			m['docId'] = docId;
			m['readerId'] = readerId;
			m['title'] = title;
			ids.push(m);
		});
		if(otherIds!=""){
			otherIds = otherIds.substr(0,otherIds.length-1);
			$.dialog.notice({width: 150,title:'操作提示',content:'您选择的数据第【'+otherIds+'】行未借阅，无法归还，请重新选择！',icon:'warning',time:3});
			return false;
		}
		if(bespeakIds!=""){
			bespeakIds = bespeakIds.substr(0,bespeakIds.length-1);
			$.dialog.notice({width: 150,title:'操作提示',content:'您选择的数据第【'+otherIds+'】行处于预约状态，无法归还，请重新选择！',icon:'warning',time:3});
			return false;
		}
		if(returnIds!=""){
			returnIds = returnIds.substr(0,returnIds.length-1);
			$.dialog.notice({width: 150,title:'操作提示',content:'您选择的数据第【'+returnIds+'】行已归还，请重新选择！',icon:'warning',time:3});
			return false;
		}
		if(ids.length>0){
			$.ajax({
				type:'POST',
			    url:$.appClient.generateUrl({ESDocumentBorrowing:'changeDetails'},'x'),
			    data:{details:ids},
			    dataType: 'json',
			    success:function(data){
			    	if(data>0){
						$.dialog.notice({width: 150,content: name+'成功',icon: 'succeed',time: 3});
			    		$('#borrowDetails').flexReload();
			    	}else{
			    		$.dialog.notice({width: 150,content: name+'失败',icon: 'error',time: 3});
			    	}
			    },
			    cache: false,
			    async: false
			});
		}
	}
}
// 续借
function relendDetails(name){
	var f = false;
	var checkbox=$("#borrowDetails").find("input[name='changeId']:checked");
	var userid = $('#uid').val();
	var readerId = $('#readerId').val();
	var notRole = '';
	// 判断是否改变借阅明细的数据
	if(checkbox.length==0){
		$.dialog.notice({width: 150,content:'请选择借阅明细的数据！',icon:'warning',time:3});
		return false;
	}
	var formStatus = '';
	var checkObj=$("#esDataList").find("input[name='changeId']:checked");
	checkObj.each(function(){
		  var trObj=$(checkObj[0]).closest('tr');
		  formStatus += $("#esDataList").flexGetColumnValue(trObj,['status']);
	});
	if(formStatus == '已结束'){
		$.dialog.notice({width: 150,content:'您选择的借阅单已结束，无法'+name+'，请重新选择！',icon:'warning',time:3});
		return false;
	}
		$.ajax({
		    url:$.appClient.generateUrl({ESDocumentBorrowing:'getBorrowRoleWithId'},'x'),
		    data:{userid:userid},
		    dataType: 'json',
		    success:function(data){
		    	data = eval(data);
		    	lendDays = data.lendDays;
		    	lendCount = data.lendCount;
		    	relend = data.relend;
		    	notRole = data.notRole;
		    },
		    cache: false,
		    async: false
		});
	 if(notRole == true){
    	$.dialog.notice({width:150,title:'操作提示',content:'请为当前用户添加借阅角色！',icon:'warning',time:3});
		return false;
	 }
	 if(relend.length<=0){
		$.dialog.notice({width:150,content:'此用户没有续借次数！',icon:'warning',time:3});
		return false;
	 }
	var ids = new Array();
	var notRelend = '';//不能续借的数据
	var notRelendCount = '';//没有续借次数的数据
	checkbox.each(function(){
		var trObj=$(this).closest('tr');
		var borrownum = $("#borrowDetails").flexGetColumnValue(trObj,['pnum']);
		var id = $("#borrowDetails").flexGetColumnValue(trObj,['id']);
		var status = $("#borrowDetails").flexGetColumnValue(trObj,['status']);
		var rc = $("#borrowDetails").flexGetColumnValue(trObj,['relendcount']);
		var n = $("#borrowDetails").flexGetColumnValue(trObj,['num']);
		var title = $("#borrowDetails").flexGetColumnValue(trObj,['title']);
		if(status!="已借出" && status!="续借"){
			notRelend += n+",";
			return;
		}
		if(rc>=relend.length){
			notRelendCount += n+",";
			return;
		}
		var m = new Object();
		m['id'] = id;
		m['borrowstatus'] = name;
		m['relendDays'] = relend[rc].relendDays;
		m['rc'] = parseInt(rc)+1;
		m['borrowNum'] = $("#borrownum").val();//借阅单编号
		m['readerId'] = readerId;
		m['title'] = title;
		ids.push(m);
	});
	if(notRelend!=""){
		notRelend = notRelend.substr(0,notRelend.length-1);
		$.dialog.notice({width:150,content:'您选择的借阅单中第【'+notRelend+'】行数据不是已借出或续借状态，无法续借，请重新选择！',icon:'warning',time:3});
		return false;
	}
	if(notRelendCount!=""){
		notRelendCount = notRelendCount.substr(0,notRelendCount.length-1);
		$.dialog.notice({width:150,content:'您选择的借阅单中第【'+notRelendCount+'】行数据已经没有续借次数了，无法续借，请重新选择！',icon:'warning',time:3});
		return false;
	}
	if(ids.length>0){
		$.ajax({
			type:'POST',
		    url:$.appClient.generateUrl({ESDocumentBorrowing:'changeDetails'},'x'),
		    data:{details:ids},
		    dataType: 'json',
		    success:function(data){
		    	if(data>0){
		    		$.dialog.notice({width: 150,content: name+'成功',icon: 'succeed',time: 3});
		    		$('#borrowDetails').flexReload();
		    	}else{
		    		$.dialog.notice({width: 150,content: name+'失败',icon: 'error',time: 3});
		    	}
		    },
		    cache: false,
		    async: false
		});
	}
}
// 根据借阅单续借
function relendForForm(){
	var flag=false;
	var borrowNums ="";
	var checkboxes=$("#esDataList").find("input[name='changeId']:checked");
	if(checkboxes.length!=1){
		$.dialog.notice({width:150,content:'请选择您一条需要续借的借阅单！',icon:'warning',time:3});
		return false;
	}else{
		checkboxes.each(function(){
			var trObj=$(this).closest('tr');
			borrowNums=$("#esDataList").flexGetColumnValue(trObj,['borrowNum']);
			var status=$("#esDataList").flexGetColumnValue(trObj,['status']);
			if(status == '已结束'){
				flag = true;
				return;
			}
		});
		if(flag){
			$.dialog.notice({width: 150,content:'您选择的借阅单处于已结束状态，不能续借，请重新选择！',icon:'warning',time:3});
			return false;
		}
		$.ajax({
			 url:$.appClient.generateUrl({ESDocumentBorrowing:'relendForForm'},'x'),
			    data:{borrowNums:borrowNums},
			    success:function(data){
			    	if(data == "true"){
			    		$.dialog.notice({width:150,icon: 'succeed',content:"续借成功！",time:3});
			    		$('#esDataList').flexReload();
			    	}else if(data == "false"){
			    		$.dialog.notice({width:150,icon: 'error',content:"续借失败！",time:3});
			    		return false;
			    	}else{
			    		$.dialog.notice({width:150,icon: 'warning',content:data,time:3});
			    		return false;
			    	}
			    },
			    cache: false,
			    async: false
		 });
	}
}
// 根据借阅单归还
function returnForForm(){
	var borrowNum ="";
	var id = "";
	var docId = "";//文件id
	var otherIds = "";
	var checkboxesObj=$("#esDataList").find("input[name='changeId']:checked");
	if(checkboxesObj.length>0){
		  checkboxesObj.each(function(){
			  var trObj=$(this).closest("tr");
			  var status=$("#esDataList").flexGetColumnValue(trObj,['status']);
			  if(status == '已结束'){
				  var n = $("#esDataList").flexGetColumnValue(trObj,['num']);
				  otherIds += n+",";
				  return;
			  }
			  id+=$(this).val()+",";
			  borrowNum+=$("#esDataList").flexGetColumnValue(trObj,['borrowNum'])+",";
		  });
		  if(otherIds!=""){
				otherIds = otherIds.substr(0,otherIds.length-1);
				$.dialog.notice({width:150,content:'您选择的第【'+otherIds+'】行借阅单处于已结束状态，无法归还，请重新选择！',icon:'warning',time:3});
				return false;
		  }
		  id = id.substr(0,id.length-1);
		  borrowNum = borrowNum.substr(0,borrowNum.length-1);
		  $.ajax({
				url:$.appClient.generateUrl({ESDocumentBorrowing : "getBorrowFileIdByNum"},'x'),
				data:{borrowNum:borrowNum},
				success:function(data){
					if(data=="true" || data==""){
						$.dialog.notice({content:'您选择借阅单下没有要归还的数据，请重新选择！',icon:'warning',time:3});
						return false;
					}else if(data!="false" && data!="true" && data!=""){
						docId += data;
						$.ajax({
							 url:$.appClient.generateUrl({ESDocumentBorrowing:'returnForForm'},'x'),
							    data:{borrowNum:borrowNum,docId:docId,id:id},
							    dataType: 'json',
							    success:function(data){
							    	if(data>0){
							    		$.dialog.notice({width:150,content:'您选择的借阅单中数据归还成功！',icon:'succeed',time:3});
							    		$('#esDataList').flexReload();
							    	}else{
							    		$.dialog.notice({width:150,content:'您选择的借阅单中数据归还失败！',icon:'error',time:3});
							    		return false;
							    	}
							    },
							    cache: false,
							    async: false
						 });
					}else{
						$.dialog.notice({width:150,content:'您选择的借阅单中数据归还失败！',icon:'error',time:3});
						return false;
					}
				},
				cache:false,
				async: false
		  });
	 }else{
		$.dialog.notice({width:150,content:'请选择您需要归还的借阅单！',icon:'warning',time:3});
		return false;
	}
}
// 直接借阅、直接借出
function directForLendUsingForm(borrowtype){
	var flag = true;
	var checkboxes=$("#borrowDetails").find("input[name='changeId']");
	var checkLength=checkboxes.length;
    if(checkLength==0){
    	$.dialog.notice({width:150,content:'请您选择要'+borrowtype+'的文件数据！',icon:'warning',time:3});
    	return false;
    }
	var result = addOrEditBorrowData($("#form_add"),'add');
	var lendnums = result['lendnums'];
	var detailArray = result['detailArray'];
	var lendCount=0;
	var lendDays=0;
	var islendnum=0;//已借出的件数
	var notRole = '';//借阅角色
	if(borrowtype=="借出"){
		$.ajax({
			url:$.appClient.generateUrl({ESDocumentBorrowing:'getBorrowRoleWithId'},'x'),
			data:{userid:$('#uid').val()},
			dataType: 'json',
			success:function(data){
				data = eval(data);
				lendCount = data.lendCount;
				lendDays = data.lendDays;
				islendnum = data.pnum;
				notRole = data.notRole;
			},
			cache: false,
			async: false
		});
		if(notRole == true){
			$.dialog.notice({width:150,title:'操作提示',content:'请为当前用户添加借阅角色！',icon:'warning',time:3});
			return false;
		}
		if(lendDays=="null" || lendDays==null || lendDays==""){
			$.dialog.notice({width:150,title:'操作提示',content:'请为当前用户的借阅角色设置借出天数！',icon:'warning',time:3});
			return false;
		}else if(lendCount=="null" || lendCount==null ||lendCount==""){
			$.dialog.notice({width:150,title:'操作提示',content:'请为当前用户的借阅角色设置借出件数！',icon:'warning',time:3});
			return false;
		}else if(lendCount==0 || lendDays==0){
			$.dialog.notice({width:150,title:'操作提示',content:'当前用户的借阅角色借出天数或借出件数为0，请重新设置！',icon:'warning',time:3});
			return false;
		}
		for ( var i = 0; i < detailArray.length; i++) {
			detailArray[i]['lenddays'] = lendDays;
		}
		if(islendnum==null || islendnum == "" || islendnum == "null"){
			islendnum = 0*1;
		}
		if(islendnum>=lendCount){
			$.dialog.notice({width:150,title:'操作提示',content:'当前用户的借阅角色最大借出件数为'+lendCount+'件，已全部借出，请重新选择！',icon:'warning',time:3});
			return false;
		}else if((lendnums+islendnum)>lendCount || lendnums>lendCount){
			$.dialog.notice({width:150,title:'操作提示',content:'当前用户的借阅角色最大借出件数为'+lendCount+'，已借出'+islendnum+'件，请重新选择！',icon:'warning',time:3});
			return false;
		}
    }
	var url=$.appClient.generateUrl({ESDocumentBorrowing:'dirChangeStatus'},'x');
	$.ajax({
		 url:url,
		 type:"post",
		 data:{borrowdetail:detailArray,borrowform:result['borrowform'],borrowtype:borrowtype},
		 datatype:"json",
		 success:function(result){
			 if(result>0){
		    		$.dialog.notice({width: 150,content: '直接'+borrowtype+'成功',icon: 'succeed',time: 3});
		    		$('#esDataList').flexReload();
		    		flag = true;
		    	}else{
		    		$.dialog.notice({width: 150,content: '直接'+borrowtype+'失败',icon: 'error',time: 3});
		    		$('#esDataList').flexReload();
		    		flag = true;
		    	}
			 },
		 cache: false,
	});
    return flag;
}

function addOrEditBorrowData(form,type){
	var result = new Object();//返回结果
	var detailArray = new Array();//借阅详细
	var index=0;// 下标
	var borrowform = new Object();// 借阅单
	var checkboxes=$("#borrowDetails").find("input[name='changeId']");
	var checkLength=checkboxes.length;
    if(checkLength>0){
     	var lendnums = 0;//借出总件数
    	checkboxes.each(function(){
    		 var borrowdetail=new Object();// 放借阅
	    	 var trObj=$(this).closest('tr');
	    	 borrowdetail['docId'] = $("#borrowDetails").flexGetColumnValue(trObj,['docId']);// 文件id
	    	 borrowdetail['itemName'] = $("#borrowDetails").flexGetColumnValue(trObj,['itemName']);// 项目名称
	    	 borrowdetail['stageCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['stageCode']);// 收集范围代码
	    	 borrowdetail['deviceCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['deviceCode']);// 装置号
	    	 borrowdetail['participatoryCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['participatoryCode']);// 部门代码
	    	 borrowdetail['documentCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['documentCode']);// 类型代码
	    	 borrowdetail['engineeringCode'] = $("#borrowDetails").flexGetColumnValue(trObj,['engineeringCode']);// 专业代码
	    	 borrowdetail['title'] = $("#borrowDetails").flexGetColumnValue(trObj,['title']);// 文件标题
	    	 borrowdetail['docNo'] = $("#borrowDetails").flexGetColumnValue(trObj,['docNo']);// 文件编码
	    	 borrowdetail['type'] = $("#borrowDetails").flexGetColumnValue(trObj,['borrowtype']);// 类型
	    	 borrowdetail['status'] = $("#borrowDetails").flexGetColumnValue(trObj,['status']);// 状态
	    	 borrowdetail['happendate'] = $("#borrowDetails").flexGetColumnValue(trObj,['happen_date']);// 发生日期
	    	 borrowdetail['shouldreturndate'] = $("#borrowDetails").flexGetColumnValue(trObj,['shouldreturndate']);// 应归还日期
	    	 borrowdetail['return_date'] = $("#borrowDetails").flexGetColumnValue(trObj,['return_date']);// 归还日期
	    	 if(type == 'edit'){
	    		 borrowdetail['id'] = $("#borrowDetails").flexGetColumnValue(trObj,['id']);
	    		 var pnum = $("#borrowDetails").flexGetColumnValue(trObj,['pnum']);
	    		 var remark = $("#borrowDetails").flexGetColumnValue(trObj,['remark']);
		 		 if(pnum == "" || pnum == null){
		 		    borrowdetail['pnum'] = trObj.find("input[name='innerFileCount']").val();// 件数
		 		 }else{
		 			borrowdetail['pnum'] = pnum;
		 		 }
		 		 if(remark == "" || remark == null){
		 		   borrowdetail['remark'] = trObj.find("input[name='mark']").val();// 备注
		 		 }else{
		 			borrowdetail['remark'] = remark;
		 		 }
	    	 }else{
	    		 borrowdetail['pnum'] = trObj.find("input[name='innerFileCount']").val();//件数
		    	 borrowdetail['remark'] = trObj.find("input[name='mark']").val();// 备注
	    	 }
	    	 lendnums += borrowdetail['pnum']*1;
	    	 detailArray[index++] = borrowdetail;
    	});
    }
	borrowform['regperson'] = $("input[name='register']").val()// 登记人
	borrowform['borrowperson'] = $("input[name='reader']").val();// 借阅人
	if(type == 'edit'){
		borrowform['borrownum'] = $("#borrownum").val();// 借阅单编号
		borrowform['id'] = $("#formid").val();
		borrowform['oldtelphone'] =$("input[name='oldtel']").val();
		borrowform['oldoverduedays'] = $("input[name='oldvaliddate']").val();
		borrowform['oldemail'] = $("input[name='oldemail']").val();
		borrowform['oldidcardnum'] = $("input[name='oldidentity']").val();
		borrowform['oldmark'] = $("textarea[name='olddescription']").val();
	}else{
		var date = $('#times').val();// 日期
		var borrowNum = date.replaceAll("-","");
		borrowNum+= getBorrowDateFormat();//重新设置借阅单编号
		borrowform['borrownum'] = borrowNum;// 借阅单编号
	}
	borrowform['regDate'] = $("input[name='registdate']").val();
	borrowform['unit'] = $("input[name='dept']").val();
	borrowform['telphone'] =$("input[name='tel']").val();
	borrowform['email'] = $("input[name='email']").val();
	borrowform['overduedays'] = $("input[name='validdate']").val();
	borrowform['status'] = $("input[name='status']").val();
	borrowform['idcardnum'] = $("input[name='identity']").val();
	borrowform['pnum'] = checkboxes.length;
	borrowform['mark'] = $("textarea[name='description']").val();
	borrowform['uid'] = $('#uid').val();
	borrowform['readerId'] = $('#readerId').val();
	result['detailArray'] = detailArray;
	result['borrowform'] = borrowform;
	result['lendnums'] = lendnums;
	return result;
}

//全选
$("input[name='ids3']:checkbox").die().live('click',function(){
	$("#borrowDetails").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
});

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
function getDateFormat(){
	var nowDate = new Date();
	var month = '';
	var date = '';
	if((nowDate.getMonth()+1)<10){
		month = "0"+(nowDate.getMonth()+1);
	}else{
		month = nowDate.getMonth()+1;
	}
	if(nowDate.getDate()<10){
		date = "0"+nowDate.getDate();
	}else{
		date = nowDate.getDate();
	}
	return nowDate.getFullYear()+month+date;
}
function getBorrowDateFormat(){
	var now = new Date();
	 var hours = now.getHours()+"";
	 var minutes = now.getMinutes()+"";
	 var milliSeconds = now.getMilliseconds()+"";
	 var seconds = now.getSeconds()+"";
	 if(hours.length==1){
		 hours = "0" + hours;
	 }
	 if(minutes.length==1){
		 minutes = "0" + minutes;
	 }
	 if(seconds.length==1){
		 seconds = "0" + seconds;
	 }
	 if(milliSeconds.length==1 ){
		 milliSeconds = "00" + milliSeconds;
	 }else if(milliSeconds.length>1 &&　milliSeconds.length<3){
		 milliSeconds = "0" + milliSeconds;
	 }
	 return hours+minutes+seconds+milliSeconds;
}


