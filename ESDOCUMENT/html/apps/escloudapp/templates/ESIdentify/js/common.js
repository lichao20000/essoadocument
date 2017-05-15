var realDestroyNum = 0;
//判断数组元素是否存在 倪阳添加
Array.prototype.in_array = function(e) {
	for(i=0;i<this.length;i++){
		if(this[i] == e)
			return true;
		}
	return false;
}

/**
 * 手动鉴定
 */
function handIdentify(){
	preIdentify("false");
}

/**
 * 自动鉴定
 */
function autoIdentify(){
	preIdentify("true");
}

/**
 * 鉴定销毁之前的验证操作
 * @author wanghongchen 20140516
 */
function preIdentify(autoIdentify)
{
	var obj = $("#flexme");
	var checkboxObj=$("input[name='path']:checked",obj);
	var val='';
	var paths=[];
	var condition = [];
	var checkBoxLen=checkboxObj.length;
	var checkUrl=$.appClient.generateUrl({ESIdentify:'checkIdentify'},'x');
	if(checkBoxLen==0){
		$.ajax({
		    url:$.appClient.generateUrl({ESIdentify:'filter',status:status,strucid:strucid},'x'),
		    async:false,
		    success:function(cont){
		    	$.dialog({
		    		id:'identifySearch',
			    	title:'销毁鉴定筛选数据',
		    		width: 600,
		    	    height: 200,
		    	   	fixed:true,
		    	    resize: false,
			    	content:cont,
			    	okVal:'确定',
				    ok:function(){
				    	var form=$('#esfilter');
						var flag=form.validate();
						if(flag){
							condition=filterValue();
							if(condition.condition.length == 0){
								$.dialog.notice({content:'请选择或筛选销毁数据！',time:3,icon:'warning'});
								return false;
							}
							var destroyGroupCondition = "";
							if(gc.groupCondition){
								destroyGroupCondition = gc.groupCondition;
							}
							$.post(checkUrl,{nodePath:nodePath,condition:condition,autoIdentify:autoIdentify,groupCondition:destroyGroupCondition},function(data){
								identifyDestroyConfirm(data,paths,condition,autoIdentify);
							},"json");
						}
				    },
				    init:function(){
			    		$('#esfilter').autovalidate();
			    	},
				    cancelVal: '关闭',
				    cancel: true 
			    });
			    },
			    cache:false
		});
	}else{
		checkboxObj.each(function(i){
		/**wanghongchen 20141013 此处不需要进行控制 **/		
//			if($(this).attr('edit') != 'false'){/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				paths.push($(this).val());
//			}
		});
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
//		if(paths.length==0){
//			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3});
//			return false;
//		}
		$.post(checkUrl,{paths:paths,nodePath:nodePath,autoIdentify:autoIdentify},function(data){
			identifyDestroyConfirm(data,paths,condition,autoIdentify);
		},"json");
	}
}

/**
 * 提示有多少条数据可以销毁，并确认
 */
function identifyDestroyConfirm(data,paths,condition,autoIdentify){
	if(data.success == 0){
		$.dialog.notice({content:'未设置鉴定规则！',time:3,icon:'warning'});
		return false;
	}
	if(data.destroyNum > 0){
		$.dialog({
			content:data.msg,
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function(){
				identifyFun(paths,condition,autoIdentify);
			}
		});
	}else{
		$.dialog.notice({content:data.msg,time:3});
	}
//	if(data.total == 0){
//		$.dialog.notice({content:'未找到匹配数据！',time:3});
//	}else if(data.total == data.numn){
//		$.dialog.notice({content:'共查到'+data.total+'条数据，正在进行鉴定销毁！',time:3});
//	}else if(data.total == data.lend){
//		$.dialog.notice({content:'共查到'+data.total+'条数据，数据已经借出！',time:3});
//	}else{
//		realDestroyNum = data.numo;
//		if(data.numn == 0 && data.lend == 0){
//			$.dialog({
//				content:'总共匹配了'+data.total+'条数据可进行销毁</br>是否继续操作？',
//				ok:true,
//				okVal:'确定',
//				cancel:true,
//				cancelVal:'取消',
//				ok:function(){
//					identifyFun(paths,condition,autoIdentify);
//				}
//			});
//		}else{
//			var tc = '总共匹配了'+data.total+'条数据，</br>其中：</br>';
//			if(data.numn > 0){
//				tc += data.numn+'条正在鉴定销毁</br>';
//			}
//			if(data.lend > 0){
//				tc += data.lend+'条已经借出</br>';
//			}
//			tc += data.numo+'条可以鉴定销毁</br>是否继续操作？';
//			$.dialog({
//				content:tc,
//				ok:true,
//				okVal:'确定',
//				cancel:true,
//				cancelVal:'取消',
//				ok:function(){
//					identifyFun(paths,condition,autoIdentify);
//				}
//			});
//		}
//	}
}

/**
 * 档案鉴定
 * @author wanghongchen 20140515
 */
function identifyFun(paths,condition,autoIdentify){
	var step1 = "<div style=\"width:350px;\"><div style=\"margin-bottom:40px;padding-bottom:20px;font-size:18px;\"><input id=\"create\" name=\"billType\" type=\"radio\" value=\"create\" style=\"margin-right:5px;float:left;\" checked=\"true\" /><label for=\"create\" style=\"float:left;\">创建销毁单</label></div>" +
			"<div style=\"font-size:18px;clear:both;\"><input id=\"history\" name=\"billType\" type=\"radio\" style=\"margin-right:5px;font-size:20px;float:left;\" value=\"history\" /><label for=\"history\" style=\"float:left;\">历史销毁单</label></div></div>";
	var identifyDestroyBillType = "";  //鉴定销毁时销毁单类型（创建、选择历史）
	$.dialog({
		id:"archiveIdentify",
		title:'第一步：选择创建销毁单类型',
		width:680,
		height:350,
		padding:"0",
		content:step1,
		calcel:true,
		button:[{
			name:"上一步",
			disabled:true,
			callback:function(){
				this.button({
					name:"上一步",
					disabled:true
				},{
					name:"下一步",
					disabled:false
				},{
					name:"保存待发",
					disabled:true
				},{
					name:"提交销毁",
					disabled:true
				});
				this.content(step1);
				return false;
			}
		},{
			name:"下一步",
			callback:function(){
				var that = this;
				identifyDestroyBillType = $('input[name="billType"]:checked').val();
				if(identifyDestroyBillType == "create"){
					this.button({
						name:"上一步",
						disabled:false
					},{
						name:"下一步",
						disabled:true
					},{
						name:"保存待发",
						disabled:false
					},{
						name:"提交销毁",
						disabled:false
					});
					this.title("第二步：填写销毁单");
//					that.close();
					getDestroyForm(that);
//					$.ajax({
//						url:$.appClient.generateUrl({ESIdentify:'destroyBillCreate'},'x'),
//						data:{nodePath:nodePath,condition:condition,paths:paths,nodeName:nodeName,autoIdentify:autoIdentify},
//						type:'post',
//						success:function(data){
//							that.content(data);
//						}
//					});
				}else{
					this.button({
						name:"上一步",
						disabled:false
					},{
						name:"下一步",
						disabled:true
					},{
						name:"保存待发",
						disabled:false
					},{
						name:"提交销毁",
						disabled:true
					});
					this.title("第二步：选择历史销毁单");
					$.ajax({
						url:$.appClient.generateUrl({ESIdentify:'destroyBillHistory',nodePath:nodePath},'x'),
						success:function(data){
							that.content(data);
						}
					});
				}
				
				return false;
			}
		},{
			name:"保存待发",
			disabled:true,
			callback:function(){
				var destroyGroupCondition = "";
				if(gc.groupCondition){
					destroyGroupCondition = gc.groupCondition;
				}
				if(identifyDestroyBillType == "create"){
					var postData = $("#" + $("#formBuilderPanel").find("form")[0].id).serialize();
					var formId = $("#destroyFormId").val();
					var billCreateForm = $("#destroyBillCreateForm");
					$.ajax({
						type : 'POST',
						url : $.appClient.generateUrl({ESArchiveDestroy : 'createDestroyForm'}, 'x'),
						data : {
							postData : postData
							,formId : formId
							,paths : paths
							,condition: condition
							,nodePath:nodePath
							,autoIdentify:autoIdentify
							,groupCondition:destroyGroupCondition
						},
						success : function(res) {
							var json = eval('(' + res + ')');
							if (json.success && json.state) {
								$.dialog.notice({content:'销毁单添加成功！',time:3,icon:"succeed"});
							} else {
								$.dialog.notice({content:'销毁单添加失败！',time:3,icon:"error"});
							}
						},
						error : function() {
							$.dialog.notice({content:'销毁单添加失败！',time:3,icon:"error"});
						}
					});
					
				}else{
					var billId = $('#historyBill tr input[name="inputs"]:checked').val();
					if(billId == null || billId == 'undefined' || billId == ''){
						$.dialog.notice({content:'请选择历史销毁单！',time:3,icon:'warning'});
						return false;
					}else{
						$.ajax({
							type : 'POST',
							url : $.appClient.generateUrl({ESArchiveDestroy : 'createDestroyForm'}, 'x'),
							data : {
								paths : paths
								,condition : condition
								,nodePath : nodePath
								,autoIdentify : autoIdentify
								,billId : billId
								,groupCondition:destroyGroupCondition
							},
							//wanghongchen 20140912 修改提示信息
							success : function(res) {
								var json = eval('(' + res + ')');
								if (json.success && json.state) {
									$.dialog.notice({content:'向历史销毁单添加数据成功！',time:3,icon:"succeed"});
								} else {
									$.dialog.notice({content:'向历史销毁单添加数据失败！',time:3,icon:"error"});
								}
							},
							error : function() {
								$.dialog.notice({content:'向历史销毁单添加数据失败！',time:3,icon:"error"});
							}
						});
					}
				}
			}
		},{
			//wanghongchen 20140917 创建销毁单时可直接提交销毁
			name:"提交销毁",
			disabled:true,
			callback:function(){
				var formId = $("#destroyFormId").val();
				var destroyGroupCondition = "";
				if(gc.groupCondition){
					destroyGroupCondition = gc.groupCondition;
				}
				if(identifyDestroyBillType == "create"){
					var postData = $("#" + $("#formBuilderPanel").find("form")[0].id).serialize();
					var billCreateForm = $("#destroyBillCreateForm");
					$.ajax({
						type : 'POST',
						url : $.appClient.generateUrl({ESArchiveDestroy : 'getDestroyPathList'}, 'x'),
						data : {
							paths : paths
							,condition: condition
							,nodePath:nodePath
							,autoIdentify:autoIdentify
							,groupCondition:destroyGroupCondition
						},
						dataType:'json',
						success : function(json) {
							if (json.success) {
								$.ajax({
									url:$.appClient.generateUrl({ESWorkflow : 'getWFModelByFormId'}, 'x'),
									type:'post',
									data:{formId:formId},
									dataType:'json',
									success:function(wfrt){
										$("#formStartPage").attr("wfmodelid",wfrt.id);
										$("#formStartPage").attr("formid",formId);
										$("#formStartPage").attr("actionId",wfrt.actionId);
										$("#formStartPage").attr("dataList",json.dataList);
										formStartHandle.formStartBeforeSet(wfrt.identifier,wfrt.firstStepId);
									}
								});
							} else {
								$.dialog.notice({content:json.msg,time:3,icon:"error"});
							}
						},
						error : function() {
							$.dialog.notice({content:'销毁单添加失败！',time:3,icon:"error"});
						}
					});
				}else{
					$.dialog.notice({content:'选择历史销毁单只能保存待发，不能提交销毁！',time:3,icon:"warning"});
				}
				return false;
			}
		}]
	});
}

/**
 * 获取表单
 * @param that dialog窗口
 * wanghongchen 20140718 完善销毁
 */
function getDestroyForm(that){
	$.ajax({
		url:$.appClient.generateUrl({ESWorkflow:"getWfList"},'x'),
		type:'post',
		data:{relationBusiness:'destroy'},
		success:function(html){
			if(!html){
				$.dialog.notice({content:"未找到权限内发布的销毁流程！",icon:'warning',time:3});
				that.close();
				return false;
			}else if(html.length < 10){
				var formId = html;
				$.post($.appClient.generateUrl({ESFormStart : 'showMyForm'}, 'x')
		    			,{formid:formId}, function(res){
		    				var json = eval('(' + res + ')');
		    				if(null != json.message){
		    					$.dialog.notice({content:json.message,icon:'warning',time:3});
		    					return ;
		    				}
		    				$.ajax({
								url:$.appClient.generateUrl({ESIdentify:'destroyBillCreate'},'x'),
								data:{extjs:json.extjs},
								type:'post',
								success:function(data){
									that.content(data);
									$("#destroyFormId").val(formId);
								}
							});
				});
				return ;
			}
			$.dialog({
				title:'请选择销毁流程',
				width: '25%',
				fixed:true,
				resize: true,
				okVal:'提交',
				ok:true,
				cancelVal: '取消',
				cancel: function(){
					that.close();
				},
				content:html,
				ok:function(){
					var formId = $('#searchWfSelect option:selected').val();
					$.post($.appClient.generateUrl({ESFormStart : 'showMyForm'}, 'x')
			    			,{formid:formId}, function(res){
			    				var json = eval('(' + res + ')');
			    				if(null != json.message){
			    					$.dialog.notice({content:json.message,icon:'warning',time:3});
			    					return ;
			    				}
			    				$.ajax({
									url:$.appClient.generateUrl({ESIdentify:'destroyBillCreate'},'x'),
									data:{extjs:json.extjs},
									type:'post',
									success:function(data){
										that.content(data);
										$("#destroyFormId").val(formId);
									}
								});
					});
				}
			});
		}
	});
	
}

//销毁时挂接数据附件
function destroyRecord(){
	var dataList = "";
	var _colModel=[
				{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
				{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
				{display: '操作', name : 'handle',sortable : false, width : 30,align: 'left',callback:function(){addAttachData.showAttachData();return false ;}},
				{display: '数据名称', name: 'title',sortable : true,width : 480,align: 'left',metadata:'Title'},
				{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
			];
	var checkboxs = $("#flexme").find("input[name='path']:checked");
	if (checkboxs.length > 0 ){
		var types=[];
		var voidTypes='';
		var nums='';
		var paths = [];
		//根据元数据获取相应的标题top
		checkboxs.each(function(){
			var trObj=$(this).closest('tr');
			var checkpath = $(this).val();
			dataList+=checkpath+'|';
		});
		$('#formStartPage').attr('dataList', dataList) ;
		var relationBusiness=$('#formStartPage').attr('relationBusiness');//typeWf
		var dataHaveRight=$('#formStartPage').attr('dataHaveRight');
//		addAttachData.getAttachDataList(_colModel,dataList);
		var _url=$.appClient.generateUrl({ESFormStart:'getAttachDataList',dataListStr:dataList, typeWf:relationBusiness, dataHaveRight:dataHaveRight},'x');
		$("#borrowDetails").flexOptions({newp:1,url:_url}).flexReload();
//		$("#borrowDetails").flexigrid({
//			url :_url,
//			dataType: 'json',
//			editable: true,
//			colModel:_colModel,
//			showTableToggleBtn: false,
//			width: '760',
//			height: 'auto'
//		});
	}else{
		$.dialog.notice({title:'操作提示',content:'为选择数据！',icon:'warning',time:3});
		return false;
	}
}

//工程档案和采购档案中隐藏显示案卷列表和卷内列表
function clickShowTable(divObj,bObj){
				$(divObj).toggleClass('hideBody');
				$(bObj).toggleClass('vsble');
				if($(divObj).find('#innerfile').length>0){
					var tObj=$("#flexme");
				}
				if($(divObj).find('#flexme').length>0){
					var tObj=$("#innerfile");
				}
				if(divObj.className.indexOf(" hideBody") ==-1){
					tObj.closest('.bDiv').animate({height:(height/2-55)+'px'},'slow');
				}else{
					tObj.closest('.bDiv').animate({height:(height-27)+'px'},'slow');
				}
}
//筛选增加、减少行 packing 
//shimiao 20140805 条件检索框
$('.esadd').die().live('click',function (){
	var t = $($('#sift tr:last').clone()).insertAfter($(this).closest('tr'));
	//shiyangtao 修改以前添加一行下一行会被该行参数填充 20140820
	var i=0;
	var tds=t.find('td');
	tds.each(function(){
		if(i==0){
			$(this).find('select').val('');
		}
		if(i==1){
			$(this).find('select').val('like');
		}
		if(i==2){
			$(this).find('input').val('');
		}
		if(i==3){
			$(this).find('select').val('AND');
		}
		i++;
	});
	
});

$('.esreduce').die().live('click',function (){
	if($('#sift tr').length > 6){
		$(this).closest('tr').remove();
	}else{
		var tds = $(this).closest('tr').find('td');
		var i= 0 ;
		tds.each(function(){
			if(i==0){
				$(this).find('select').val('');
			}
			if(i==1){
				$(this).find('select').val('like');
			}
			if(i==2){
				$(this).find('input').val('');
			}
			if(i==3){
				$(this).find('select').val('AND');
			}
			i++;
		});
	}
});
//shimiao end

//全选
function selectAll(status,name,obj){
var formObj=$("input[name="+name+"]",$(obj));
	formObj.attr('checked',status);
	if(status){
		$(obj).find("tr").addClass("trSelected");
	}else{
		$(obj).find("tr").removeClass("trSelected");
	}
	
	
}
$('.selectone').die().live('click',function(){
	var status = $(this).attr("checked");
	if(status){
		$(this).closest('tr').addClass("trSelected");
	}else{
		$(this).closest('tr').removeClass("trSelected");
	}
})

//获取筛选条件
function filterValue()
{
	var $where={};
	if(arguments.length==0){//如果flag不存在，取得分组设置上的条件
		if(conditions.length>0){
			$where.groupCondition=conditions;
		}
	}
	 var temp=[];
	 var isAll = true;
	$("#sift tr:gt(0)").each(function(i){
		 var esfields=$("[name='esfields']").eq(i).val();
		 var comparison=$("[name='comparison']").eq(i).val();
		 var esfieldvalue=$("[name='esfieldvalue']").eq(i).val();
		 //liqiubo 20140904 屏蔽下面的验证，允许输入空值，修复bug 921
		 //liqiubo 20140814 加入条件的验证，一旦设置了条件就要看设置的是否完整，否则走查询全部
//		 if(esfields){
//			 if(!esfieldvalue){
//				 isAll = false;
//			 }
//		 }else{
//			 if(esfieldvalue){
//				 isAll = false;
//			 }
//		 }
		 var relation=$("[name='relation']").eq(i).val();
		 if(esfields){
			 if(relation=="AND"){
				 relation='true';
			 }else{
				 relation='false';
			 }
			 temp.push(esfields+','+comparison +','+esfieldvalue+','+relation);
			
		 }
	});
	if(!isAll){
		$where={};
		return $where;
	}
	 $where.condition=temp;
	return $where;
}
/**
 * 筛选中文
 * @author ldm
 * @returns {String}
 */
function getConditionText(){
	var name = '';
	$("#sift tr:gt(0)").each(function(i){
		 var esfields=$("[name='esfields'] option:selected").eq(i).val();
		 var comparison=$("[name='comparison'] option:selected").eq(i).text();
		 var esfieldvalue=$("[name='esfieldvalue']").eq(i);
		 var relation=$("[name='relation'] option:selected").eq(i).text();
		 if(esfields){
			 var esfieldstext=$("[name='esfields'] option:selected").eq(i).text();
			 if(esfieldstext.indexOf('分类号')!=-1){
				 name += String(esfieldstext)+String(comparison)+String(esfieldvalue.attr("estext"))+String(relation);
			 }else{
				 name += String(esfieldstext)+String(comparison)+String(esfieldvalue.val()!=""?esfieldvalue.val():"空")+String(relation);
			 }
			 
		 }
	})
	var ext = /(并且|或者)$/;
	var specialname = name.replace(ext,"");
	return specialname;
}
/** liqiubo 20140919 添加权限控制 修复bug 889 **/
function check_selected_role(mes,name,obj,role)
{
	//判断用户是否选中数据

	var id='';
	var checkboxObj=$("input[name="+name+"]:checked",obj);
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		$.dialog.notice({content:'请选择'+mes+'数据',time:3});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			if('edit'==role){
				if($(this).attr('edit') != 'false'){
					id+=$(this).val()+',';
				}
			}
			if('del'==role){
				if($(this).attr('del') != 'false'){
					id+=$(this).val()+',';
				}
			}
		});
		/** liqiubo 20140919 添加权限控制 **/
		if(id.length==0){
			if('edit'==role){
				$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			}
			if('del'==role){
				$.dialog.notice({content:'当前选择的数据没有删除权限，不能进行此操作！',time:3,icon:'warning'});
			}
			return false;
		}
	}
	return id;
		
}
function check_selected(mes,name,obj)
{
	//判断用户是否选中数据

	var id='';
	var checkboxObj=$("input[name="+name+"]:checked",obj);
	if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
	{
		
		$.dialog.notice({content:'请选择'+mes+'数据',time:3});
		return false;
	}else{
		//遍历选中的数据
		checkboxObj.each(function(i){
			id+=$(this).val()+',';
			})
		}
	return id;
		
}
function uploadFileByMenu(){
	var checkboxObjByUp=$("input[name='path']:checked",$('#flexme'));
	uploadFileSupport(checkboxObjByUp);
}
function uploadFileByInnerFile(){
	var checkboxObjByUp=$("input[name='path']:checked",$('#innerfile'));
	uploadFileSupport(checkboxObjByUp);
}
function uploadFileSupport(checkboxObjByUp){
	var checkBoxLenByUp = checkboxObjByUp.length;
	if(checkBoxLenByUp>1){
		$.dialog.notice({content:'请勾选一条数据后再执行上传操作！',time:3,icon:'warning'});
		return;
	}else if(checkBoxLenByUp==0){
		$.dialog.notice({content:'请勾选一条数据后再执行上传操作！',time:3,icon:'warning'});
		return;
	}
	/** xiaoxiong 20140805 添加权限控制 **/
	if($(checkboxObjByUp[0]).attr('edit') == 'false'){
		$.dialog.notice({content:'当前数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
		return;
	}
	file_Path = checkboxObjByUp[0].value;
	file_Path = file_Path.replace(/\//g,"-");
//	uploadFile();
	checkScanPolicy4UploadFile();
}

//添加面板

	function addData()
	{
		var obj=$('#flexme');
		var value=$("input[name='path']:checked",obj).prop('value');
		if(!value){
			value=$("input[name='path']:last'",obj).val();
			if(!value){
				value=nodePath;
			}
		}
		var reg=/\//g;
		var pkgPath=value.replace(reg, '-');
		var url=$.appClient.generateUrl({ESIdentify:'add',path:pkgPath},'x');
		$.ajax({
		    url:url,
		    success:function(data){
		    	$.dialog({
		    		id: 'artAddPanel',
			    	title:'添加面板',
			    	width: '550px',
		    	   	fixed:false,
		    	   	padding:'0px',
		    	    resize: false,
		    	    okVal:'保存',
				    ok:true,
				    cancelVal: '取消',
				    cancel: true,
			    	content:data,
			    	ok:function()
			    	{
						var form=$('#form_add');
						var thisDialog=this;
						var data=form.serialize();
						var flag=form.validate();
						if(flag){
						var url=$.appClient.generateUrl({ESIdentify:'saveItems'},'x');
							$.post(url,{path:nodePath,data:data},function(result){
								if(result){
									if(result==2){
										$.dialog.notice({width: 150,content: '数据不能为空',icon: 'error',time: 3});
									}else{
										setGroup();
										thisDialog.close();
										$.dialog.notice({width: 150,content: '添加成功',icon: 'succeed',time: 3});
										$('#flexme').flexReload();
									}
								}else{
									$.dialog.notice({width: 150,content: '添加失败',icon: 'error',time: 3});
								}
								
							});

						}
							return false;
						
					 },
		    		init:function(){
		    			var form=$('#form_add');
							form.autovalidate();
		    		}
			    });
		    	
			    },
			    cache:false
		});
		
		
	}
	//删除资料库文件
	function delNotFiling()
	{
		var obj=$("#notfiling");
		delData(obj);
	}
	//文件鉴定删除功能
	function delItems()
	{
		var obj=$("#flexme");
		delData(obj);
	}
	//删除空的案卷
	function delfile(){
		var obj=$('#flexme');
		var checkboxObj=$("input[name='path']:checked",obj);
		var val='';
		var path=[];
		var checkBoxLen=checkboxObj.length;
		if(checkBoxLen==0){
			$.dialog.notice({content:'请选择删除的数据',time:3,icon:'warning'});
			return false;
		}
		var delValidata = true;/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		checkboxObj.each(function(i){
			var trObj=$(this).closest('tr');
			val=obj.flexGetColumnValue(trObj,['relation']);
			if(!val){
				/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				delValidata = false;
				if($(this).attr('del') != 'false'){
					path.push($(this).val());
				}
			}
			
		});
		if(path.length == 0){
			if(delValidata){
				$.dialog.notice({content:'该数据已完成组卷,不能删除,请重新选择',time:3,icon:'warning'});return false;
			}else{
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				$.dialog.notice({content:'当前选择的数据没有删除权限，不能进行此操作！',time:3,icon:'warning'});
				return false;
			}
		}
		var reg=/\//g;
		var paths=path.join(',').replace(reg, '-');
		$.dialog({
				content:'确定要删除勾选的数据吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var url=$.appClient.generateUrl({ESIdentify:'delItems'},'x');
					$.post(url,{path:paths},function(data){
						if(data){
							setGroup();
							$("input[name='path']").attr("checked",false);
							obj.flexReload();
							$.dialog.notice({width: 150,content: '数据删除成功',icon: 'succeed',time: 3});
						} else {
							$.dialog.notice({width: 150,content: '数据删除失败',icon: 'error',time: 3});
						}
						});
				}

			})
	}
	//删除数据
	function delData(obj)
	{
		var checkboxObj=$("input[name='path']:checked",obj);
		
		var val='';
		var path=[];
		var checkBoxLen=checkboxObj.length;
		if(checkBoxLen==0){
			$.dialog.notice({content:'请选择删除的数据',time:3,icon:'warning'});
			return false;
		}
		//++++
		if(deleteItemValidate(checkboxObj)){ // 是否有删除的权限@方吉祥
			return false;
		}
		//----
		var delvalidate = true;/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		checkboxObj.each(function(i){
			var trObj=$(this).closest('tr');
			val=obj.flexGetColumnValue(trObj,['bussystemid']);
			if(!val){
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				delvalidate = false;
				if($(this).attr('del') != 'false'){
					path.push($(this).val());
				}
			}
		});
		if(path.length == 0){
			if(delvalidate){
				$.dialog.notice({content:'该数据为接口数据不能删除,请重新选择',time:3,icon:'warning'});return false;
			}else{
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				$.dialog.notice({content:'当前选择的数据没有删除权限，不能进行此操作！',time:3,icon:'warning'});
				return false;
			}
		}
		var id=path.join(',');
		$.dialog({
				content:'确定要删除勾选的数据吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var url=$.appClient.generateUrl({ESIdentify:'delItems'},'x');
					$.post(url,{path:id},function(data){
						if(data){
							setGroup();
							$("input[name='path']").attr("checked",false);
							obj.flexReload();
							$.dialog.notice({width: 150,content: '数据删除成功',icon: 'succeed',time: 3});
						} else {
							$.dialog.notice({width: 150,content: '数据删除失败',icon: 'error',time: 3});
						}
						});
				}

			})
	}
	//双击行弹出编辑面板
	function modify(tr,g,p)
	{
		var cname=event.srcElement.className;
		var obj = $("[name='path']",tr) ;
		var path=obj.val();
		file_Path=path.replace(/\//g,'-');
		
		if(cname=='link'){
			show_file(path);
			return false;
		}
//		var systemid=$(tr).closest('table').flexGetColumnValue($(tr),['bussystemid']);
		/** xiaoxiong 20140804 获取待显示数据是否可编辑，从而控制保存按钮是否可用 **/
		var edit = obj.attr('edit') ;
		var isGenerate = obj.attr('isGenerate') ;
		show_items(path,isGenerate,edit, tr);
	}
	//资料库查看日志功能
	function showNotFilingLog()
	{
		var obj=$("#notfiling");
		show_note(obj);
	}
	//查看日志
	function showLog()
	{
		var obj=$("#flexme");
		show_note(obj);
	}
	//查看卷内文件日志
	function showInnerFileLog()
	{
		var obj=$('#innerfile');
		show_note(obj);
	}
	//ajax请求查看日志页面
	function show_note(obj)
	{
		
		var path=check_selected('查看','path',obj);
		if(!path)return;
		if($("input[name='path']:checked",obj).length > 1){
			$.dialog.notice({content:'请选择单条数据',time:3,icon:'warning'});
			return false;
		}
		var reg=/\//g;
		var pkgpath=path.replace(reg, '-');
		var url=$.appClient.generateUrl({ESIdentify:'show_note',path:pkgpath},'x');
		$.ajax({
		    url:url,
		    success:function(data){
		    	$.dialog({
		    		id:'artLogPanel',
			    	title:'日志列表',
		    		width: '600px',
		    	    padding:'0px 0px',
		    	   	fixed:true,
		    	    resize: false,
			    	content:data,
				    cancelVal: '关闭',
				    cancel: true 
			    });
		    	
			    },
			    cache:false
		});

	}
	//打印资料库报表
	function printNotFiling(){
		var obj=$('#notfiling');
		var path='';
		var checkboxObj=$("input[name='path']:checked",obj);
		if(checkboxObj.length =='0')
		{
			path='flag';
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				path+=$(this).val()+',';
				})
			}
			
		$.ajax({
	    url: $.appClient.generateUrl({ESIdentify:'directory_reports'},'x'),
	    type:"POST",
	    data:'path='+path+'&status='+status+'&strucid='+strucid,
	    success:function(data){
	    	/** guolanrui 20140813 打印时，当规则中没有设置报表规则时，添加提示消息BUG：675 **/
	    	if(!data){
	    		$.dialog.notice({title:'操作提示',content: '请先为该结构添加报表实例，再进行打印操作！',icon: 'warning',time:3});
				return false;
	    	}
	    	$.dialog({
	    		id:'artPrintNotFilingPanel',
		    	title:'目录报表',
		    	//height:'300px',
		    	//padding:'',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function()
			    {
						var esreport=$("#esreport");
						var condition='';
						if(path=="flag"){
							condition=filterValue();
							var form=$('#esfilter');
							var flag=form.validate();
							if(!flag){
								return false;
							}
						}
						var tmp=$("input[name='report_style']:checked",esreport).val();
						var reportTitle=$("input[name='report_style']:checked",esreport).closest('span').text();
						if(tmp==undefined){
							//gengqianfeng 20140911 修改未选择报表实例提示信息
							$.dialog.notice({title:'操作提示',width: 150,content: '请选择报表实例',icon: 'warning',time:3});
							return false;
						}else{
							$.dialog.notice({content: '正在努力打印中,稍后点击“消息提示”进行下载',time:2});
							temp=tmp.split('-');
							var reportId=temp[0];
							var style=temp[1];
							
							/** guolanrui 20140923 打印前校验是否有符合条件的数据 start **/
							var url1=$.appClient.generateUrl({ESIdentify:'checkReportDataIsExists'});
							var isExists = true;
							$.ajax({
								  url:url1,
								  type : 'POST',
								  dataType:'json',
								  async:false,
								  data:{nodePath:nodePath,path:path,condition:condition,strucid:strucid,status:5,reportId:reportId,style:style,reportTitle:reportTitle},
								  success: function(data1){
									  var success = data1.success;
									  if(success=='false'){
										  isExists = false;
										  $.dialog.notice({content: '没有满足条件的数据',icon: 'warning',time:3});
									  }
								  }
							});
							if(!isExists){
								return;
							}
							/** guolanrui 20140923 打印前校验是否有符合条件的数据 end **/
							
							var url=$.appClient.generateUrl({ESIdentify:'do_report'});
							$.post(url,{nodePath:nodePath,path:path,condition:condition,strucid:strucid,status:5,reportId:reportId,style:style,reportTitle:reportTitle},function(result){
								if(result=='nodata'){
									setTimeout(function(){
										$.dialog.notice({content: '没有满足条件的数据',icon: 'error',time:3});
									},2500);
								}else if (result == 'error') {
									setTimeout(function(){
										$.dialog.notice({width: 150,content: '打印失败',icon: 'error',time:3});
									},2500);
								}

							});
						}
				    },
				    init:function(){
		    			var form=$('#esfilter');
		    				if(form.length > 0){
								form.autovalidate();
							}
		    		},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    cache:false
	});
	
	}
	//打印报表
	function printReport()
	{
		var obj=$('#flexme');
			print_reports(obj);
	}
	//打印卷内文件报表
	function printInnerFile()
	{
		var obj=$('#innerfile');
		var psid=nextPath.substr(parseInt(nextPath.lastIndexOf("@")+1),nextPath.length);//截取path上结构ID
		print_reports(obj,psid);
	}
	//ajax请求目录报表页面
	function print_reports(obj){
		
		/**
		 * 如果是在案卷目录下打印卷内目录---begin---xuekun 20140928
		 */
		var parentNode="";
		if(arguments.length==2){
			
			$("tr",$('#flexme')).each(function(){
				if($(this).hasClass("trSelected")){
					parentNode=$(this);
					return;
				} 
				
			});
			if(parentNode==null){
				parentNode=$("input[name='path'][class='selectone']",$('#flexme'))[0]
			}else{
				parentNode=$("input[name='path'][class='selectone']",parentNode)[0];
			}
			parentNode=$(parentNode).val();
			var reg=/\//g;
			parentNode=parentNode.replace(reg, '-');
		
		}
		/**
		 * 如果是在案卷目录下打印卷内目录----end-----
		 */
		var path='';
		var checkboxObj=$("input[name='path']:checked",obj);
		if(checkboxObj.length =='0')
		{//如果没有选中的数据 打印该该案卷下的卷内数据所有的数据
			path='flag';
		}else{
			//遍历选中的数据
			checkboxObj.each(function(i){
				path+=$(this).val()+',';
				})
			}
			
		if(arguments.length==2){
				var sid=arguments[1];
				var p=nextPath;
		}else{
			var sid=strucid;
			var p=nodePath;
		}
		$.ajax({
	    url: $.appClient.generateUrl({ESIdentify:'directory_reports'},'x'),
	    type:"POST",
	    data:'path='+path+'&status='+status+'&strucid='+sid,
	    success:function(data){
	    	/** guolanrui 20140813 打印时，当规则中没有设置报表规则时，添加提示消息BUG：675 **/
	    	if(!data){
	    		$.dialog.notice({title:'操作提示',content: '请先为该结构添加报表实例，再进行打印操作！',icon: 'warning',time:3});
				return false;
	    	}
	    	$.dialog({
	    		id:'artPrintReportPanel',
		    	title:'目录报表',
		    	height:'300px',
		    	//padding:'',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function()
			    {
						var esreport=$("#esreport");
						var condition='';
						if(path=="flag"){
							condition=filterValue();
							var form=$('#esfilter');
							var flag=form.validate();
							if(!flag){
								return false;
							}
						}
						var tmp=$("input[name='report_style']:checked",esreport).val();
						var reportTitle=$("input[name='report_style']:checked",esreport).closest('span').text();
						if(tmp==undefined){
							//gengqianfeng 20140911 修改未选择报表实例提示信息
							$.dialog.notice({title:'操作提示',width: 150,content: '请选择报表实例',icon: 'warning',time:3});
							return false;
						}else{
							$.dialog.notice({content: '正在努力打印中,稍后点击“消息提示”进行下载',icon:"succeed",time:2});
							temp=tmp.split('-');
							var reportId=temp[0];
							var style=temp[1];
							/** guolanrui 20140923 打印前校验是否有符合条件的数据 start **/
							var url1=$.appClient.generateUrl({ESIdentify:'checkReportDataIsExists'});
							var isExists = true;
							$.ajax({
								  url:url1,
								  type : 'POST',
								  dataType:'json',
								  async:false,
								  data:{nodePath:p,path:path,prePath:parentNode,condition:condition,strucid:sid,status:status,reportId:reportId,style:style,reportTitle:reportTitle},
								  success: function(data1){
									  var success = data1.success;
									  if(success=='false'){
										  isExists = false;
										  $.dialog.notice({content: '没有满足条件的数据',icon: 'warning',time:3});
									  }
								  }
							});
							if(!isExists){
								return;
							}
							/** guolanrui 20140923 打印前校验是否有符合条件的数据 end **/
							var url=$.appClient.generateUrl({ESIdentify:'do_report'});
							//guolanrui 20140924 将nodePath的参数修改，修复后台nodePath不正确导致权限拿不正确 1059
//							$.post(url,{nodePath:prePath,path:path,condition:condition,strucid:sid,status:status,reportId:reportId,style:style,reportTitle:reportTitle},function(result){
//							$.post(url,{nodePath:nodePath,path:path,prePath:parentNode,condition:condition,strucid:sid,status:status,reportId:reportId,style:style,reportTitle:reportTitle},function(result){
							//xuekun 20140928 将nodePath修改如果是打印案卷使用nodePath如果打印卷内使用nextPath
							$.post(url,{nodePath:p,path:path,prePath:parentNode,condition:condition,strucid:sid,status:status,reportId:reportId,style:style,reportTitle:reportTitle},function(result){
								if(result=='nodata'){
									setTimeout(function(){
										$.dialog.notice({content: '没有满足条件的数据',icon: 'error',time:3});
									},2500);
								} else if (result == 'error') {
									setTimeout(function(){
										$.dialog.notice({width: 150,content: '打印失败',icon: 'error',time:3});
									},2500);
								}
							});
						}
				    },
				    init:function(){
		    			var form=$('#esfilter');
		    				if(form.length > 0){
								form.autovalidate();
							}
		    		},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    cache:false
	});

}

//文件整理移交案卷
function collationRemoveFile(){//6案卷整理
	//guolanrui 20140825 添加没有数据时的提示
	var allCheckboxObj=$("input[name='path']",$('#flexme'));
	if(allCheckboxObj.length==0){
		$.dialog.notice({content:'对不起，您没有要移交的数据！',time:3,icon:'warning'});
		return false;
	}
	var obj=$('#flexme');
	var checkboxObj=$("input[name='path']:checked",obj);
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){//guolanrui 20140825 添加批量条件移交
//		$.dialog.notice({content:'请选择移交的数据',time:2});
//		return false;
		removeFileForCond();
	}else{
		checkboxObj.each(function(i){
//		var trObj=$(this).closest('tr');
//		val=obj.flexGetColumnValue(trObj,['relation']);
//		if(val){
			if($(this).attr('edit') != 'false'){/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				path.push($(this).val());
			}
//		}
			
		});
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if(path.length==0){
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
		if(path.length == 0){
			$.dialog.notice({content:'该数据未完成组卷或者为空卷,请重新选择',time:3,icon:'warning'});return false;
		}
		var reg=/\//g;
		var paths=path.join(',').replace(reg, '-');
		$.dialog({
			content:'确定要移入档案库吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				
				var url=$.appClient.generateUrl({ESIdentify:'setFileStatus'},'x');
				$.post(url,{path:paths,status:status},function(data){
					if(data.flag==true){
						setGroup();
						$("input[name='path']").attr("checked",false);
						$.dialog.notice({width: 150,content: '移入档案库成功',icon: 'succeed',time: 3});
						$("#flexme,#innerfile").flexReload();
					} else {
						$.dialog.notice({width: 150,content: '移入档案库失败',icon: 'error',time: 3});
					}
				},'json');
			}
		
		})
	}

}
//文件编目、整理编目文件移交
function catalogueRemoveFile(){//7案卷编目、2整理编目
	//guolanrui 20140825 添加没有数据时的提示
	var allCheckboxObj=$("input[name='path']",$('#flexme'));
	if(allCheckboxObj.length==0){
		$.dialog.notice({content:'对不起，您没有要移交的数据！',time:3,icon:'warning'});
		return false;
	}
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){//guolanrui 20140825 添加批量条件移交
//		$.dialog.notice({content:'请选择移交数据',time:3});
//		return false;
		removeFileForCond();
	}else{
		for(var i=0; i < checkBoxLen; i++) {
			if($(checkboxObj[i]).attr('boxid')) {
				$.dialog.notice({content:'数据已装盒，请按盒移交',time:3});
				return false;
			}
		}	
		var editValidate = true;/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		checkboxObj.each(function(i){
			var trObj=$(this).closest('tr');
			val=$("#flexme").flexGetColumnValue(trObj,['ArchivalCode']);
			if(val){
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				editValidate = false;
				if($(this).attr('edit') != 'false'){
					path.push($(this).val());
				}
			}
			
		});
		if(path.length == 0){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			if(editValidate){
				$.dialog.notice({content:'数据档号不存在,不能移交',time:3,icon:'warning'});return false;
			}else{
				$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
				return false;
			}
		}
		var paths=path.join(',');
		$.dialog({
			content:'确定要移入档案库吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				
				var url=$.appClient.generateUrl({ESIdentify:'setFileStatus'},'x');
				$.post(url,{path:paths,status:status},function(data){
					if(data.flag){
						setGroup();
						$("input[name='path']").attr("checked",false);
						$.dialog.notice({width: 150,content: '移入档案库成功',icon: 'succeed',time: 3});
						$("#flexme,#innerfile").flexReload();
					} else {
						$.dialog.notice({width: 150,content: '移入档案库失败',icon: 'error',time: 3});
					}
				},'json');
			}
		
		})
	}
}
	//文件移交
function remove_file(){//1文件鉴定、3归档入库
	//guolanrui 20140825 添加没有数据时的提示
	var allCheckboxObj=$("input[name='path']",$('#flexme'));
	if(allCheckboxObj.length==0){
		$.dialog.notice({content:'对不起，您没有要移交的数据！',time:3,icon:'warning'});
		return false;
	}
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){//guolanrui 20140825 添加批量条件移交
//		$.dialog.notice({content:'请选择移交的数据',time:3});
//		return false;
//		alert("status:"+status);
		removeFileForCond();
	}else{
		
		for(var i=0; i < checkBoxLen; i++) {
			if($(checkboxObj[i]).attr('boxid')) {
				$.dialog.notice({content:'数据已装盒，请按盒上架',time:3});
				return false;
			}
		}	
		/**判断数据是否存在页数
		 * for(var i=0;i<checkBoxLen;i++){
		var temp=checkboxObj[i];
		var trObj=$(temp).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['Pages']);//页数
		if(archiveType=='accounting'){//如果是会计档案，需要判断是否存在纸质附件数,页数必须存在，电子附件数是不存在页数的，可以移交
			var papers=$("#flexme").flexGetColumnValue(trObj,['PaperAttachments']);//纸质附件数
			if(papers){//如果存在纸质附件数，那么页数也必须存在
				if(val){
					path.push($(temp).val());
				}
			}else{
				path.push($(temp).val());
			}
		}else{//非会计档案数据
			if(val){
				path.push($(temp).val());
			}
		}
	}
	//$.dialog({content:''+path.length});return false;
	if(path.length == 0){
		$.dialog({content:'移交数据的页数不合法,请重新选择'});return false;
	}
	var msg='确定要移交吗';
	if(checkBoxLen!=path.length){
		msg='移交数据中存在页数不合法的数据，点击“确定”只会移交合法的数据';
	}*/
		for(var i=0;i<checkBoxLen;i++){
			var temp=checkboxObj[i];
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			if($(checkboxObj[i]).attr('edit') != 'false'){
				path.push($(temp).val());
			}
		}
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if(path.length==0){
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
		var paths=path.join(',');
		$.dialog({
			content:'确认要移交吗',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				
				var url=$.appClient.generateUrl({ESIdentify:'setFileStatus'},'x');
				$.post(url,{path:paths,status:status},function(data){
					if(true==data.flag){
						setGroup();
						$("input[name='path']").attr("checked",false);
						var msg= '文件移交成功';
						var timer=3;
						if(data.failedList && data.failedList.length > 0){
							msg= data.failedList.join('，')+'会计期间内文件不完整，不能移交<br/>';
							timer=1000;
							$.dialog.notice({content: msg,time: timer});
							$('#flexme,#innerfile').flexReload();
							return;
						}
						$.dialog.notice({content: msg,icon: 'success',time: timer});
						$('#flexme,#innerfile').flexReload();
						
					} else {
						var msg='文件移交失败';
						var timer=5;
						if(data.failedList && data.failedList.length > 0){
							msg= data.failedList.join('，')+'会计期间内文件不完整，不能移交<br/>';;
							timer=1000;
						}
						$.dialog.notice({content: msg,time: timer,icon:'error'});
					}
				},'json');
			}
		
		})
	}
}

function removeFileForCond(){
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'filter',status:status,strucid:strucid},'x'),
	    async:false,
	    success:function(cont){
	    	$.dialog({
	    		id:'removeFileForCond',
		    	title:'数据移交筛选数据',
	    		width: 600,
	    	    height: 200,
	    	   	fixed:true,
	    	    resize: false,
		    	content:cont,
		    	okVal:'确定',
			    ok:function(){
			    	var form=$('#esfilter');
					var flag=form.validate();
					if(flag){
						var condition=filterValue();
						if(condition.condition.length == 0){
							$.dialog.notice({content:'请选择或筛选移交数据！',time:3,icon:'warning'});
							return false;
						}
						var tempGroupCondition = "";
						if(gc.groupCondition){
							tempGroupCondition = gc.groupCondition;
						}
						var setStatusUrl=$.appClient.generateUrl({ESIdentify:'setFileStatusForCond'},'x');
						$.post(setStatusUrl,{nodePath:nodePath,condition:condition,groupCondition:tempGroupCondition,status:status},function(result){
//							alert(result.success);
//							if(result.msg)alert(result.msg);
//							if(result.paths)alert(result.paths);
							if(result.success){
								if(result.msg){
									$.dialog({
										content:result.msg,
										ok:true,
										okVal:'确定',
										cancel:true,
										cancelVal:'取消',
										ok:function(){
											var url=$.appClient.generateUrl({ESIdentify:'setFileStatus'},'x');
											$.post(url,{path:result.paths,status:status},function(data){
												if(data.flag){
													setGroup();
													$("input[name='path']").attr("checked",false);
													$.dialog.notice({width: 150,content: '移入档案库成功',icon: 'succeed',time: 3});
													$("#flexme,#innerfile").flexReload();
												} else {
													$.dialog.notice({width: 150,content: '移入档案库失败',icon: 'error',time: 3});
												}
											},'json');
										}
									})
								}else{
									var url=$.appClient.generateUrl({ESIdentify:'setFileStatus'},'x');
									$.post(url,{path:result.paths,status:status},function(data){
										if(data.flag){
											setGroup();
											$("input[name='path']").attr("checked",false);
											$.dialog.notice({width: 150,content: '移入档案库成功',icon: 'succeed',time: 3});
											$("#flexme,#innerfile").flexReload();
										} else {
											$.dialog.notice({width: 150,content: '移入档案库失败',icon: 'error',time: 3});
										}
									},'json');
								}
							}else{
								$.dialog.notice({content: result.msg,time: 3, icon: 'warning'});
							}
						},'json');
					}
			    },
			    init:function(){
		    		$('#esfilter').autovalidate();
		    	},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    cache:false
	});
}

function innerFileFilter(){
	var obj=$("#innerfile");
	filter(obj);
}
//shiyangtao 增加组合字段的功能 
function combinationfield(stau){//liqiubo 20140904 加入是取的哪个规则的组合字段的参数,修复bug885
	var obj=$('#flexme');
	combination(obj,stau);//liqiubo 20140904 加入是取的哪个规则的组合字段的参数,修复bug885
	
} 
function commomFilter(){
	
	var obj=$('#flexme');
	filter(obj);
}
//增加模糊查询，倪阳添加
var fuzzyQuery = function(gridId, objName){/** xiaoxiong 20140807 添加表格ID与检索组件name的传递，使其支持多个表格模糊检索公用此方法 **/
	var keyword=$.trim($('input[name="'+objName+'"]').val());
	if(keyword=='' || keyword=='请输入关键字') {
		/*$.dialog({content: '请输入关键字！',time: 2, icon: 'error'});
		$('#queryKeyword').focus();
		return false;*/
		keyword = '';
	}
//	var url=$.appClient.generateUrl({ESArchiveLending:'set_json',keyword:encodeURI(keyword),path:nodePath},'x');
//	$("#flexme").flexOptions({newp:1,url:url,query:gc}).flexReload();
	var $where = {} ;
	$where.keyword=keyword;
	$where.groupCondition=conditions;//20140905 数据导出
	$("#"+gridId).flexOptions({newp:1,query:$where}).flexReload();
	return false;
}
/** xiaoxiong 20140807 完善此方法，使其支持多表格多检索与不归档库检索分支处理 **/
$(document).keydown(function(event){
	if(event.keyCode == 13) {
		var activeElementName = document.activeElement.name ;
		if(activeElementName == 'queryKeyword' || activeElementName == 'fileQueryKeyword'){
			fuzzyQuery('flexme', activeElementName);
		} else if(activeElementName == 'innerfileQueryKeyword'){
			fuzzyQuery('innerfile', activeElementName);
		} else if(activeElementName == 'notfilingKeyword'){
			/** xiaoxiong 20140806 添加不归档库模糊检索回车监听 **/
			notfilingQuery();
		} else if(activeElementName == 'boxinnerfileQueryKeyword'){
			/** xiaoxiong 20140807 添加盒内模糊检索回车事件监听 **/
			boxinnerfileQuery();
		} else if(activeElementName == 'boxListQuery'){
			/** xiaoxiong 20140807 添加盒内模糊检索回车事件监听 **/
			boxListQuery();
		}
	}
});
//增加凭证查询，倪阳添加
var queryCertificate = function(){
	var obj=$('#flexme');
	var html = '<label>报账单号：</label><input style="width:160px;" type="text" name="queryKeywordCertificate" />';
	$.dialog({
		id:'queryCertificate',
    	title:'凭证查询',
		width: '23%',
	    height: '12%',
	   	fixed:true,
	    resize: false,
	    padding:'15px 5px',
    	content:html,
    	okVal:'确定',
	    ok:function(){
			var keyword=$.trim($('input[name="queryKeywordCertificate"]').val());
			if(keyword=='') {
				$.dialog.notice({content: '请输入报账单号！',time: 2, icon: 'error'});
				return false;
			}
			var url=$.appClient.generateUrl({ESIdentify:'queryCertificate',number:encodeURI(keyword),path:nodePath},'x');
			$.getJSON(url,function(data){
				if(data.status!='0') {
					gc['condition'] = data;
					$.dialog.get('queryCertificate').close();
					var reurl = $.appClient.generateUrl({ESIdentify:'set_json',path:nodePath},'x');
					$("#flexme").flexOptions({newp:1,url:reurl,query:gc}).flexReload();
				} else {
					$.dialog.notice({content: data.msg,time: 2, icon: 'error'});
				}
				gc['condition'] = undefined;
			});

			//$.dialog.get('queryCertificate').close();
	    	return false;
	    },
	    /*init:function(){
    			var form=$('#esfilter');
					form.autovalidate();
    		},*/
	    cancelVal: '关闭',
	    cancel: true 
    });
}
//不归档库筛选
function notfilingFilter(){
	var obj=$('#notfiling');
	filter(obj);
}
//批量生成档号，倪阳添加
var batchCreateFileNum = function(){
	var obj=$('#flexme');
	fileNumFilter(obj);
};
//请求批量生成档号页面
var fileNumFilter = function(){
	
	//先发个请求验证规则少不少
	
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'createFileNumBatchVerification',status:status,strucid:strucid},'x'),
		async:false,
		dataType:"json",
		success:function(checkData){
			if(checkData.success=='false'){
				$.dialog.notice({width: 250,content:checkData.msg ,icon: 'error',time: 3});
				return false;
			}else{
				var checkboxObj=$("input[name='path']:checked",$('#flexme'));
				if(checkboxObj.length!= 0 )
				{   
					createFileNum();
				}else{
				
				$.ajax({
				    url:$.appClient.generateUrl({ESIdentify:'filter',status:status,strucid:strucid},'x'),
				    success:function(data){
				    	$.dialog({
				    		id:'artFilterPanel',
					    	title:'批量生成档号',
				    		width: '50%',
				    	    height: '40%',
				    	   	fixed:true,
				    	    resize: false,
					    	content:data,
					    	okVal:'确定',
						    ok:function(){
						    	$('button[class="aui_state_highlight"]').attr('disabled',true);
						    	var form=$('#esfilter');
								var thisDialog=this;
								var flag=form.validate();
								if(flag){
									var condition=filterValue();
									$.ajaxSetup({
										beforeSend:function(){
											var div = $("<div style='width:auto;' class='globalmsg'>正在批量生成档号请稍候...</div>");
											$(document.body).append(div);
											$(div).show();
										},
										complete:function(){
											$('.globalmsg').remove();
											var $msgDiv;
											var defaultMsg = "正在处理数据…";
											$.ajaxSetup({
												beforeSend:function(){showMsg();},
												complete:function(){hideMsg();}
											});
											$.setGlobalMsg = function(msg){
												defaultMsg = msg;
											};
											function showMsg(){
												if(!$msgDiv) $msgDiv = createMsgDiv(defaultMsg);
												$msgDiv.html(defaultMsg);
												$msgDiv.show();
											}
											function hideMsg(){
												if($msgDiv) $msgDiv.hide();
											}
											function createMsgDiv(msg){
												var div = $("<div class='globalmsg'>" + msg + "</div>");
												$(document.body).append(div);
												return $(div);
											}
										}
									});
									$.ajax({
										url: $.appClient.generateUrl({ESIdentify:'saveNumFilter',status:status,strucid:strucid,path:nodePath},'x'),
										data: condition,
										timeout: 20000,
										success: function(data){
											$('button[class="aui_state_highlight"]').attr('disabled',false);
											thisDialog.close();
											if(data=='true') {									
												$.dialog.notice({content: '生成成功！',time: 3, icon: 'succeed'});
												$('#flexme').flexReload();
											} else if(data=='false') {
												$.dialog.notice({content: '生成失败，请稍候再试！',time: 3, icon: 'error'});
											} else {
												$.dialog.notice({content: data, time: 3, icon: 'error'});
											}
										},
										error: function(error){
											$('button[class="aui_state_highlight"]').attr('disabled',false);
											if(error.statusText=='timeout') {
												$.dialog.notice({content: '请求服务器超时，请稍候再试！',time: 3, icon: 'error'});
												$('#flexme').flexReload();
											} else {
												$.dialog.notice({content: error.statusText,time: 3, icon: 'error'});
											}								
										}							
									});						
								}
						    	return false;
						    },
						    init:function(){
					    			var form=$('#esfilter');
										form.autovalidate();
					    		},
						    cancelVal: '关闭',
						    cancel: true 
					    });
					    },		    
					    cache:false
				});	}
			}
		}
	});
};
//请求筛选功能页面
function filter(obj)
{	

	$.ajax({
	    url:$.appClient.generateUrl({ESIdentify:'filter',status:status,strucid:strucid,path:nodePath},'x'),
	    success:function(data){
	    	$.dialog({
	    		id:'artFilterPanel',
		    	title:'筛选数据',
	    		width: 500,
	    	    height: 200,
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function(){
			    	var form=$('#esfilter');
					var thisDialog=this;
					var flag=form.validate();
					if(flag){
						var condition=filterValue();
						thisDialog.close();
						condition.type='filter';
						obj.flexOptions({newp:1,query:condition}).flexReload();
						/** xiaoxiong 20140807 在筛选时将关键词检索词情况 **/
						if(obj.attr('id') == 'notfiling'){
							if($('input[name="notfilingKeyword"]'))$('input[name="notfilingKeyword"]').val('请输入关键字');
						} else if(obj.attr('id') == 'innerfile'){
							if($('input[name="innerfileQueryKeyword"]'))$('input[name="innerfileQueryKeyword"]').val('请输入关键字');
						} else {
							if($('input[name="queryKeyword"]'))$('input[name="queryKeyword"]').val('请输入关键字');
							if($('input[name="fileQueryKeyword"]'))$('input[name="fileQueryKeyword"]').val('请输入关键字');
						}
					}
			    	return false;
			    },
			    init:function(){
		    			var form=$('#esfilter');
							form.autovalidate();
		    		},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    
		    cache:false
	});
}
//请求组合字段页面
function combination(obj,stau)//liqiubo 20140904 加入是取的哪个规则的组合字段的参数,修复bug885
{	
	var id='';
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	if(checkboxObj.length > 0)
	{
		//遍历选中的数据
		checkboxObj.each(function(i){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			if($(this).attr('edit') != 'false'){
				id+=$(this).val()+',';
			}
		});
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if(id.length==0){
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
	}
	
	$.ajax({
	    url:$.appClient.generateUrl({ESIdentify:'combination',moid:stau,strucid:strucid,id:id},'x'),//liqiubo 20140904 哪个规则传传下来的哪个 修复bug885
	    success:function(data){
	    	$.dialog({
	    		id:'combinationPanel',
		    	title:'组合字段',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function(){
			    	var form=$('#escombination');
					var thisDialog=this;
					var flag=form.validate();
					if(flag){
						var condition='';
						if(!id){
							condition=filterValue();
							var form=$('#escombination');
								var flag=form.validate();
								if(!flag){
									return false;
								}
						}
						//liqiubo 20140814 如果条件设置不全，则给提示
						if(!id && jQuery.isEmptyObject(condition)){
							$.dialog.notice({width: 150,content: '请设置完整条件！',icon: 'error',time: 3});
							return false;
						}		
						var thisDialog=this;
						var url=$.appClient.generateUrl({ESIdentify:'doBatchCombinationModify'},'x');
						var fieldName=$('#batchCombinationFieldName option:selected',form).val();
						if(!fieldName){
							$('#batchCombinationFieldName').css('border','2px #DD0000 solid');
							$('#batchCombinationFieldName').attr('title','不能为空！');
							return false;
						}
						$.post(url,{pkgPath:id,condition:condition,nodePath:nodePath,fieldName:fieldName},function(result){
							if(result){
								//guolanrui 20140819 增加是否存在符合检索条件的数据的判断，如果没有则给出提示 BUGID：674 
								if(result == "notExistDataForCond"){
									$.dialog.notice({content: '对不起，没有符合条件的数据，请重新输入条件！',icon: 'warning',time: 3});
								}else{
									setGroup();
									thisDialog.close();
									$.dialog.notice({width: 150,content: '修改成功',icon: 'succeed',time: 3});
									$('#flexme,#innerfile').flexReload();
								}
							}else{
								$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
							}
							
						});
						return false;
					}
			    },
			    init:function(){
		    			var form=$('#escombination');
							form.autovalidate();
		    		},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    
		    cache:false
	});
}
//移交清册
function show_transfer_list()
{
	$("#estabs").esTabs("close", {title:"文件鉴定"});
	$('#transfer').load($.appClient.generateUrl({ESIdentify:'transfer_application'},'x'));
	$("#estabs").esTabs("open", {title:"移交清册", content:"#transfer", canClose:true, activated:true});
}

//不归档
function do_notfiling()
{
	var id=check_selected_role('不归档的','path',$('#flexme'),'edit');//liqiubo 20140919 调用的方法换成验证权限的
	if(!id)return;
	var reg=/\//g;
	var path=id.replace(reg, '-');
	$.dialog({
			content:'确定不归档吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var thisdialog=this;
				var url=$.appClient.generateUrl({ESIdentify:'do_notfiling'},'x');
				$.post(url,{path:path},function(data){
					if(data){
						setGroup();
						$("input[name='paths']").attr("checked",false);
						$.dialog.notice({width: 150,content: '操作成功',icon: 'succeed',time: 3});
						$('#flexme').flexReload();
						//liqiubo 20140703 加入刷新不归档库数据的判断
						if($('#notfiling')){
							$('#notfiling').flexReload();
						}
					} else {
						$.dialog.notice({width: 150,content: '操作失败',icon: 'error',time: 3});
					}
					});
				
				
			}

		})
	}
//文件校验
function file_verification(){
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'file_verification',nodePath:nodePath},'x'),
		success:function(data){
			$.dialog({
				id:'accountingVerification',
				title:'会计档案文件校验',
				content:data,
				padding:'10px 10px',
				width:300,
	    	   	fixed:true,
	    	    resize: false,
	    	    okVal:'确定',
			    ok:function(){
			    	var form=$('#verificationRule');
			    	var flag=form.validate();
					if(flag){
						var thisDialog=this;
						var data=form.serialize();
						var yearMonthVal=$("#yearMonth").val();
						if(yearMonthVal==''){
							$("input[name='yearMonthVal']").addClass("invalid-text").attr("title","此项不能为空,请单击选择年度");
							return false;
						}
						var url=$.appClient.generateUrl({ESIdentify:'fileVerification'},'x');
						$.post(url,{nodePath:nodePath,data:data},function(restHTML){
							if(restHTML=='noAccountData'){
								$.dialog.notice({title:'操作提示',icon:'warning',content:'该会计期间内无数据！'});
							}else{
								$.dialog({
									id:'accountingVeriResult',
									title:'会计档案文件校验结果',
						    	   	padding: '10px 20px',
						    	    fixed:true,
						    	    resize: false,
						    		content:restHTML,
						    		cancelVal: '关闭',
						    		cancel: true,
						    		okVal:'导出报表',
						    		ok:true,
						    		ok:function(){
						    			var checkradio = $("#accountInfoTab").find("input[name='oprate']:checked");
						    			if(checkradio.length==0){
						    				$.dialog.notice({title:'操作提示',icon:'warning',content:'请选择数据！'});
						    			}else{
						    				var trObj=checkradio.closest('tr');
						    				var recordType=$("#accountInfoTab").flexGetColumnValue(trObj,['recordType']);
						    				var recordIdMin=$("#accountInfoTab").flexGetColumnValue(trObj,['recordIdMin']);
						    				var recordIdMax=$("#accountInfoTab").flexGetColumnValue(trObj,['recordIdMax']);
						    				var companyName=$("#accountInfoTab").flexGetColumnValue(trObj,['companyName']);
						    				var recordTotal=$("#accountInfoTab").flexGetColumnValue(trObj,['shouldReceive']);
						    				var checkradioVal=checkradio.val();
						    				var checkedradioVal=checkradioVal.split('|');
						    				var companyCode=checkedradioVal[0];
						    				var accountSource=checkedradioVal[1];
						    				var mapData=companyCode+'|'+accountSource+'|'+companyName+'|'+recordIdMin+'|'+recordIdMax+'|'+recordTotal+'|'+recordType;
						    				var url=$.appClient.generateUrl({ESIdentify:'printAccountingReport'});
						    				$.dialog.notice({content: '正在努力打印中,稍后点击“消息提示”进行下载',time:5});
											$.post(url,{nodePath:nodePath,data:data,mapData:mapData},function(result){
												if(result=='nodata'){
													$.dialog.notice({width: 150,content:'数据未归档，暂时不可打印！',icon:'warning'});
												}
												
											});
						    			}
						    			return false;
						    		}
								});
							}
						});
					}
					return false;
				},
			    cancelVal: '取消',
			    cancel: true,
			    init:function(){
			    	var form=$('#verificationRule');
			    	form.autovalidate();
	    		}
				});
			}
	});
}
//资料库
function notfiling()
{
	
	$('#esnotfiling').load($.appClient.generateUrl({ESIdentify:'notfiling',path:nodePath},'x'));
	$("#estabs").esTabs("open", {title:"不归档库", content:"#esnotfiling", canClose:true, activated:true});

}
//设置分组
function set_group()
{
	$.ajax({
	url:$.appClient.generateUrl({ESIdentify:'set_group',path:nodePath},'x'),
	success:function(data){
		$.dialog({
		    title:'分组设置',
		   	fixed:true,
		    resize: false,
	    	content:data,
	    	okVal:'确定',
		    ok:true,
		    cancelVal: '关闭',
		    cancel: true,
		    ok:function()
	    	{
		    	var data='';
		    	var searchfields=[];
				$('#useRole li :hidden').each(function(i){
					data+=$(this).val()+',';
					searchfields[i]=$(this).attr('name');
				});
				var column=data.slice(0, -1);
				var thisDialog=this;
				//$.dialog({content:''+searchfields.join(',')});return;
				var url=$.appClient.generateUrl({ESIdentify:'setGroupColumn'},'x');
					$.post(url,{column:column,path:nodePath,cncolumn:searchfields.join(',')},function(result){
						if(result.success){
							thisDialog.close();
								var zTree = $.fn.zTree.getZTreeObj("treeDemo");
								//var reg=/-/g;
								//var p=nodePath.replace(reg, '/');
								var treeNode = zTree.getNodeByParam("id",$('#treeDemo').attr('selectid'), null);//xuekun 20140913 修改获取选中节点不正确的不过//liqiubo 20140703 通过tree的id查找树节点
//								var treeNode = zTree.getNodeByParam("sId",strucid, null);
								var position=treeNode.name.search(/\[/);
								if(position!=-1)
								{
									treeNode.name=treeNode.name.slice(0,position);
								}
								if(searchfields.length>0)
								{
									treeNode.name+='['+searchfields.join()+']';
									
								}
								zTree.updateNode(treeNode);
								if(treeNode) {
									zTree.removeChildNodes(treeNode);
								}
								if(result.nodes.length!=0)
								{
									zTree.addNodes(treeNode, result.nodes);
								}
								$.dialog.notice({width: 150,content: '设置成功',icon: 'succeed',time: 3});
						}else{
							$.dialog.notice({width: 150,content: '设置失败',icon: 'error',time: 3});
						}
						
					},'json');
					return false;
			 }
		    
	    });
	    },
	    cache:false
	});
}
//排序设置
function set_sort()
{
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'set_sort',path:nodePath},'x'),
		success:function(data){
			$.dialog({
			    title:'排序设置',
			   	fixed:true,
			    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    ok:function()
		    	{
			    	/** guolanrui 20140731 修改排序设置的参数 start **/
			    	var datas = new Array();
//			    	alert(datas.length);
			    	var html = '';
			    	var exg = /[^\|]\w+$/;
			    	$('#useRole1 li').each(function(i){
			    		datas[i] = {};
						datas[i]["tagid"]=$(this).attr("id");
						html = $(this).html().match(exg).toString();
						datas[i]["AscOrDesc"]=html;
//						alert(html);
//						alert(datas[i]["tagid"]);
					});
			    	/** guolanrui 20140731 修改排序设置的参数 end **/
			    	
			    	var data='';
					$('#useRole1 li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					var column=data.slice(0, -1);
					var thisDialog=this;
					var url=$.appClient.generateUrl({ESIdentify:'setOrderColumn'});
						$.post(url,{column:column,path:nodePath,datas:datas},function(result){
							if(result){
								thisDialog.close();
								$.dialog.notice({width: 150,content: '保存成功',icon: 'succeed',time: 3});
								$('#flexme').flexReload();
								
							}else{
								$.dialog.notice({width: 150,content: '保存失败',icon: 'error',time: 3});
							}
							
						});
						return false;
				 }
			    
		    });
		    },
		    cache:false
		});
}


//数据导出@方吉祥
function batchExport()
{
	if($("input[name='path']:checked",$("#flexme")).length){
		// 钩选数据时,display:'none'不显示筛选面板
		url = $.appClient.generateUrl({ESIdentify:'export',display:'none'},'x');
	}else{
		// 未钩选数据时,显示筛选面板
		url = $.appClient.generateUrl({ESIdentify:'export',display:'block',status:status,strucid:strucid},'x');
	}
	
	//alert(nodePath);
	
	$.ajax({
	    url:url,
	    success:function(data){
	    	$.dialog({
	    		id:'artbatchExportPanel',
		    	title:'数据导出',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	width:600,
		    	okVal:'导出',
			    ok:exportCallBack,
			    init:function(){
		    			var form=$('#esfilter');
							form.autovalidate();
		    		},
			    cancelVal: '关闭',
			    cancel:true
		    });
		    },
		    cache:false
	});
}

// 数据导出@方吉祥
function exportCallBack()
{
	var id_length = $("#flexme input[name='path']:checked").length;
	
	var formats = [];
	$('input:checked',$('#esreport')).each(function (){
		formats.push($(this).attr('id'));
	});
	
	// 验证是否选择导出格式
	if(formats.length<1){
		$.dialog.notice({title:'操作提示',content:'至少选择一种导出格式',icon:'warning',time:2});
		return false;
	}
	
	formats = formats.join(',');
	var exportType = $("input[name='export_formats']:checked").val();
	// wanghongchen 20140808 添加导出电子文件选项
	var resource = "no";
	if($("#resource").attr("checked")){
		resource = "yes";
	}
	//wanghongchen 下载提醒移到消息中，添加此提醒 20140811
	$.dialog.notice({content: '正在努力导出中，稍后请在消息中下载',icon:'success',time:3});
	if(id_length){	// 勾选导出
		var ids = [];
		$("#flexme input[name='path']:checked").each(function (){
			ids.push($(this).val());
		});
		ids = ids.join(',');
		$.post(
			$.appClient.generateUrl({ESIdentify:'ExportSelData'},'x'),
			{nodePath:nodePath,ids:ids,formats:formats,exportType:exportType,resource:resource},	//nodePath is global var
			function (result){
				//liqiubo  20141125  不要返回结果了，请求发出就OK了，导出后，下载会以消息的方式告知用户，修复bug 1400
//				if(result == 'error'){
//					$.dialog.notice({content:'导出失败',icon:'error',time:2});
//				}else if(result == 'nothing'){
//					$.dialog.notice({content:'没有筛选到数据',icon:'warning',time:2});
//				}
				//wanghongchen 下载提醒移到消息中 20140811
//				else{
//					var downFile=$.appClient.generateUrl({ESIdentify:'downFile',fileName:result});
//					$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载导出数据</a>',icon: 'succeed'});
//				}
				
			}
		);
	}else{	// 筛选导出
		var form=$('#esfilter');
			var flag=form.validate();
			if(!flag){
				return false;
			}
		var columns = [];
		var condition = [];

		$('[name="esfields"]',$('#esfilter')).each(function (){
			columns.push($(this).val());
		});	
		columns = columns.join('@');
		condition = filterValue();
		var fieldName=getConditionText();
		$.post(
			$.appClient.generateUrl({ESIdentify:'exportData'}),
			{nodePath:nodePath,columns:columns,condition:condition,formats:formats,fieldName:fieldName,exportType:exportType,resource:resource},	//nodePath is global var
			function (result){
				//liqiubo  20141125  不要返回结果了，请求发出就OK了，导出后，下载会以消息的方式告知用户，修复bug 1400
//				if(result == 'error'){
//					$.dialog.notice({content:'导出失败',icon:'error',time:2});
//				}else if(result == 'nothing'){
//					$.dialog.notice({content:'没有筛选到数据',icon:'warning',time:2});
//				}
				//wanghongchen 下载提醒移到消息中 20140811
//				else{
//					var downFile=$.appClient.generateUrl({ESIdentify:'downFile',fileName:result});
//					$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载导出数据</a>',icon: 'succeed'});
//				}
			}
		);
		
	}
	
}

//function batchImport()
//{
//	    $.dialog({
//	    		id:'importDialog',
//	    		title:'上传文件',
//	    		width: '450px',
//	    	   	height: '250px',
//	    	    fixed:true,
//	    	    resize: false,
//	    		content:"<div id='content'>一次最多选择上传1个文件<div class='fieldset flash' id='fsUploadProgress'></div></div>",
//	    		cancelVal: '关闭',
//	    		cancel: true,
//	    		padding: '10px',
//	    		button: [
//	        		{id:'btnUpload', name: '添加文件'},
//	                {id:'btnCancel', name: '删除所有', disabled: true},
//	                {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
//	    		],
//	    		init:createNewSWFUpload
//	    });	  
//		    
//	}

/**
 * 生成数据导入第一步界面
 * wanghongchen 20140429
 */
function batchImport()
{
	var url=$.appClient.generateUrl({ESIdentify:'importStep1'},'x');
	$.ajax({
	    url:url,
	    data:{nodePath:nodePath},
	    success:function(data){
	    	$.dialog({
	    		id:'importDialog',
	    		title:'数据导入（第一步）',
	    		width: '860px',
	    	   	height: '460px',
	    	    fixed:true,
	    	    resize: false,
	    		content:data,
	    		cancelVal: '关闭',
	    		cancel: true,
	    		padding: '10px',
	    		button: [
	        		{id:'btnNext', name: '下一步', callback:importSetting}
	    		],
	    		cancel:function(){
	    			this.close();
	    		}
	    	});	 
	    }
	});
}

/**
 * 导入设置字段对应界面
 * wanghongchen 20140429
 */
function importSetting()
{
	$.ajax({
		async : false,
		url:$.appClient.generateUrl({ESIdentify:'getImportUrl'},'x'),
		success:function(url){
			$('#importStep1').ajaxSubmit({
				url:url,
				dataType:"text",
				success:function(data){
					if(data == "success"){
						importSettingSuccess();
						art.dialog.list["importDialog"].hide();
					}else{
				    	$.dialog.notice({icon:'warning',content:data,time:2});
					}
				},
				error:function(){
					$.dialog.notice({icon:'error',content:"系统错误，请联系管理员"});
				}
			});
		}
	});
	return false;
}
function importSettingSuccess()
{
	$.ajax({
		async : false,
		url:$.appClient.generateUrl({ESIdentify:'importSetting'},'x'),
		data:{nodePath:nodePath},
		success:function(data){
			$.dialog({
				id:'importSetting',
				title:'数据导入（第二步）',
				width: '860px',
				height: '460px',
				fixed:true,
				resize: false,
				content:data,
				cancelVal: '关闭',
				cancel: true,
				padding: '0',
				button: [
				    {id:'btnNext', name: '上一步',callback:function(){art.dialog.list["importDialog"].show();}},
				    {id:'btnImport', name: '导入',callback:realImport}
				],
				cancel:function(){
					art.dialog.list["importDialog"].close();
				}
			});	 
		}
	});
}

/**
 * excel,dbf导入实现
 */
function realImport(){
	var list = new Array();
	var matchFlag = false;
	$("#tabs li").each(function(){
		var matchMap = new Array();
		var tid = $(this).attr("id");
		var tType = tid.split("~~")[0];
		var tPath = tid.split("~~")[1];
		$("#structure-table-"+tType+" tr").each(function(){
			var tv1 =  $.trim($(this).find("td:nth-child(1) div").text());
			var tv2 = $(this).find("td:nth-child(2) div").text();
			if(tv1 != null &&tv1 != ""){
				matchMap.push({"source":tv1,"target":tv2});
			}
		});
		if(matchMap.length <= 0){
			$.dialog.notice({icon:'warning',content:'标签"'+$(this).find("a").text()+'"尚未对应字段！',time:3});
			matchFlag = true;
			return false;
		}
		list.push({"key":tPath,"value":matchMap});
	});
	//wanghongchen 20140818 如果存在未设置对应关系的tag返回false
	if(matchFlag){
		return false;
	}
	//wanghongchen 20140814 修改提示消息
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'realImport',path:nodePath},'x'),
		data:{mData:list},
		type:"post",
		dataType:'json',
		success:function(data){
			if(data.success){
				$('#flexme').flexReload();
				$.dialog.notice({icon:'succeed',content:data.msg,time:5});
				//wanghongchen 20140818 成功后关闭销毁第一步的界面
				art.dialog.list["importDialog"].close();
			}else{
				$.dialog.notice({icon:'warning',content:data.msg,time:5});
			}
		}
	});
}

/**
 * zip导入界面
 */
function zipImport(){
	var url=$.appClient.generateUrl({ESIdentify:'zipImport'},'x');
	$.ajax({
	    url:url,
	    data:{path:nodePath},
	    success:function(data){
	    	$.dialog({
	    		id:'zipImportDialog',
	    		title:'ZIP数据导入',
	    		width: '420px',
	    	   	height: '100px',
	    	    fixed:true,
	    	    resize: false,
	    		content:data,
	    		cancelVal: '关闭',
	    		cancel: true,
	    		padding: '10px',
	    		button: [
	        		{id:'zipImportBtn', name: '确定', callback:zipImportDeal}
	    		],
	    		cancel:function(){
	    			this.close();
	    		}
	    	});	 
	    }
	});
}

/**
 * zip导入处理
 */
function zipImportDeal(){
	$.ajax({
		async : false,
		url:$.appClient.generateUrl({ESIdentify:'getZipImportUrl'},'x'),
		success:function(url){
			$('#zipImport').ajaxSubmit({
				url:url,
				dataType:"json",
				success:function(data){
					//liqiubo 20141011 现在通过ajax定义返回格式，就不自己转了，修复bug 75
					//wanghognchen 20140910 修改提示消息
//					data = data.replace("<pre>","");
//					data = data.replace("</pre>","");
//					var data = eval('('+data+')');
					if(data.success){
						art.dialog.list["zipImportDialog"].close();
						$.dialog.notice({title:'操作提示',icon:'succeed',content:data.msg,time:5});
						$("#flexme").flexReload();
					}else{
				    	$.dialog.notice({title:'操作提示',icon:'warning',content:data.msg,time:5});
					}
				},
				error:function(){
					$.dialog.notice({title:'操作提示',icon:'error',content:"系统错误，请联系管理员"});
				}
			});
		}
	});
	return false;
}

//批量挂接======modify  yzh  20130813
function batchHanging()
{
	var id='';
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	if(checkboxObj.length > 0)
	{
		//遍历选中的数据
		checkboxObj.each(function(i){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			if($(this).attr('edit') != 'false'){
				id+=$(this).val()+',';
			}
		});
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if(id.length==0){
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESIdentify:'batch_hanging',nodePath:nodePath,moid:status,stid:strucid,ids:id},'x'),
	    success:function(data){
	    	$.dialog({
	    		id:'massHangingDialog',
		    	title:'批量挂接',
	    	   	fixed:true,
	    	   	padding:'10px 20px',
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    ok:function(){
			    	
			    	var condition='';
					if(!id){
						condition=filterValue();
						var form=$('#esfilter');
							var flag=form.validate();
							if(!flag){
								return false;
							}
					}
			    	var thisDialog=this;
			    	if(scanPath=='' || scanPath==undefined || scanPath==null){
						$.dialog.notice({title:'操作提示',icon:'warning',content:'没有配置扫描路径,请联系管理员！',time:3});
						return false;
					}
			    	if(isupload==1){
			    		$.dialog.notice({title:'操作提示',icon:'warning',content:'请上传文件！',time:3});
			  		    return false;
			    	}
			    	
			    	/** liqiubo 20140529 先保存一下规则，然后再去做操作 */
			    	var urlsave = $.appClient.generateUrl({ESTemplate:'savescanrule'},'x');
			    	var datas = "";
			    	$('#rightList li').each(function(i){
			    		var temp = $(this).text().match(trimext).toString().substr(1);
			    		if(temp=="FIELD"){
			    			var id = $(this).attr("id");
			    			datas+=id+','+temp+';';
			    		}
			    		if(temp=="CONNECTOR"){
			    			var name = $(this).text().replace(trimext,"");
			    			datas+=name+','+temp+';';
			    		}
			    		if(temp=="PATH"){
			    			var name = $(this).text().replace(trimext,"");
			    			datas+='/'+','+temp+';';
			    		}
					});
			    	$.post(urlsave,{moid:status,stid:batchModifyStruId,data:datas,path:scanPath},function(result){//liqiubo 20141010 传过去的结构ID，如果当前是从案卷级挂接的，则传过去的是卷内级结构，修复bug 1304
			    		if(result){
			    			//$.dialog.notice({icon:'succeed',content:"保存成功",time:2});
			    			var url=$.appClient.generateUrl({ESIdentify:'massHanging'},'x');
			    			var treeNodeId = $('#treeDemo').attr('treenodeid');
			    			//20140729 liqiubo 加入完全匹配挂接，部分匹配挂接标识
			    			var temp = document.getElementsByName("AllORPart");  
			    			var allOrPart = '';
			    			for(var i=0;i<temp.length;i++)  {     
			    				if(temp[i].checked)           
			    				 allOrPart = temp[i].value;  
			    			}
					    	$.post(url,{status:status,strucid:strucid,treeNodeId:treeNodeId,allOrPart:allOrPart,pkgPath:id,condition:condition},function(result){
					    		if(result=='true'){
						    		$.dialog.notice({width: 150,content: '挂接成功',icon: 'succeed',time: 3});
						    		$("#flexme,#innerfile").flexReload();
					    		}else if(result=='notScanRule'){
					    			$.dialog.notice({title:'操作提示',icon:'warning',content:'没有配置扫描规则,请联系管理员！',time:3});
					    		}else if(result=='notMatchData'){
					    			$.dialog.notice({title:'操作提示',icon:'warning',content:'没有可匹配的数据,请重新定义匹配规则！',time:3});
					    		}else if(result=='false'){
									$.dialog.notice({width: 150,content: '挂接数据失败',icon: 'error',time: 3});
								}
					    		thisDialog.close();
					    	});
			    		}else{
			    			$.dialog.notice({icon:'error',content:"规则保存失败",time:3});
			    		}
			    	})
			    	/** liqiubo 20140529 先保存一下规则，然后再去做操作 end*/
			    	
			    	return false;
			    }
		    });
		},
		cache:false
	});
}
//批量挂接时点击上传文件执行的操作======modify  yzh  20130813
$("#massHanging").find("input[name='upButton']").die().live('click',function(){
	if(scanPath=='' || scanPath==undefined || scanPath==null){
		$.dialog.notice({title:'操作提示',icon:'warning',content:'没有配置扫描路径,请联系管理员！'});
		return false;
	}
	var urlsave = $.appClient.generateUrl({ESTemplate:'savescanrule'},'x');
	var datas = "";
	$('#rightList li').each(function(i){
		var temp = $(this).text().match(trimext).toString().substr(1);
		if(temp=="FIELD"){
			var id = $(this).attr("id");
			datas+=id+','+temp+';';
		}
		if(temp=="CONNECTOR"){
			var name = $(this).text().replace(trimext,"");
			datas+=name+','+temp+';';
		}
		if(temp=="PATH"){
			var name = $(this).text().replace(trimext,"");
			datas+='/'+','+temp+';';
		}
	});
	$.post(urlsave,{moid:status,stid:batchModifyStruId,data:datas,path:scanPath},function(result){//liqiubo 20141010 传过去的结构ID，如果当前是从案卷级挂接的，则传过去的是卷内级结构，修复bug 1304
		if(result){
			$.dialog({
				id:'hangingDialog',
				title:'上传文件',
				width: '450px',
			   	height: '250px',
			    fixed:true,
			    resize: false,
				content:"<div id='content'><div class='fieldset flash' id='fsUploadProgress'></div></div>",
				cancelVal: '关闭',
				cancel: true,
				padding: '10px',
				button: [
		    		{id:'btnUpload', name: '添加文件'},
		            {id:'btnCancel', name: '删除所有', disabled: true},
		            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
				],
				init:makeNewSWFUpload
			});
		}else{
			$.dialog.notice({width: 150,content: '挂接数据失败',icon: 'error',time: 3});
		}
	});
	
});


//上传文件夹
//批量挂接时点击上传文件执行的操作======
/*$("#massHanging").find("input[name='upfileButton']").die().live('click',function(){
	//alert("is not");
	$.dialog({
		id:'hangingFileDialog',
		title:'上传文件夹',
		width: '450px',
	   	height: '250px',
	    fixed:true,
	    resize: false,
		content:"<div id='content'><div class='fieldset flash' id='fsUploadProgress'></div></div>",
		cancelVal: '关闭',
		cancel: true,
		padding: '10px',
		button: [
    		{id:'btnUpload', name: '选择文件夹'},
            {id:'btnCancel', name: '删除所有', disabled: true},
            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
		]
		//init:makeFileNewSWFUpload
	});
});*/
//批量修改
function batchModify()
{
	var id='';
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	if(checkboxObj.length > 0)
	{
		//遍历选中的数据
		checkboxObj.each(function(i){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			if($(this).attr('edit') != 'false'){
				id+=$(this).val()+',';
			}
		});
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if(id.length==0){
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3});
			return false;
		}
		
	}
	
	$.ajax({
    url: $.appClient.generateUrl({ESIdentify:'batch_modify'},'x'),
    type:'POST',
    //xiewenda 20140923 加入操作类型判断参数进行查询数据的条件控制 
    data:'id='+id+'&status='+status+'&strucid='+strucid+'&type=batchmodify',
    success:function(data){
    	$.dialog({
	    	title:'批量修改',
    	    padding:'0px 25px',
    	   	fixed:true,
    	    resize: false,
	    	content:data,
	    	okVal:'确定',
		    ok:function()
		    {
		    	var coFlag = getColumnLen();
		    	if(!coFlag){
		    		return false;
		    	}
					var form1=$("#batchModify");
					var flag1=form1.validate();
							if(!flag1){
								return false;
							}
					var data=form1.serialize();
					var condition='';
					if(!id){
						condition=filterValue();
						var form=$('#esfilter');
							var flag=form.validate();
							if(!flag){
								return false;
							}
					}
					//liqiubo 20140814 如果条件设置不全，则给提示
					if(!id && jQuery.isEmptyObject(condition)){
						$.dialog.notice({width: 150,content: '请设置完整条件！',icon: 'error',time: 3});
						return false;
					}				
					var thisDialog=this;
					var url=$.appClient.generateUrl({ESIdentify:'doBatchModify'},'x');
					var fieldName=$('#batchFieldName option:selected',form1).html();
					$.post(url,{pkgPath:id,condition:condition,nodePath:nodePath,editMap:data,fieldName:fieldName},function(result){
						if(result){
							var issuccess = true;
							var toLenght = null;
							var msg = null;
							if(result.success){
								issuccess = result.success;
							}
							if(result.toLenght){
								toLenght = result.toLenght;
							}
							if(result.msg){
								msg = result.msg;
							}
//							alert(issuccess+'    '+toLenght+'    '+msg);
							//guolanrui 20140819 增加是否存在符合检索条件的数据的判断，如果没有则给出提示 BUGID：674 
							if(result == "notExistDataForCond"){
								$.dialog.notice({content: '对不起，没有符合条件的数据，请重新输入条件！',icon: 'warning',time: 3});
							}else if(issuccess==false || issuccess=="false"){
								if(toLenght != null){
									$.dialog.notice({content: toLenght,icon: 'warning',time: 3});
								}else if(msg != null){
									$.dialog.notice({content: msg,icon: 'warning',time: 5});
								}
							}else{
								setGroup();
								thisDialog.close();
								$.dialog.notice({width: 150,content: '修改成功',icon: 'succeed',time: 3});
								$('#flexme,#innerfile').flexReload();
							}
						}else{
							$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
						}
						
					},'json');
					return false;
		    },
		    init:function(){
    			var form=$('#esfilter');
    				if(form.length > 0){
						form.autovalidate();
					}
    			// longjunhao 20140912 修复bug202
				var form1=$("#batchModify");
				if(form1.length > 0){
					form1.autovalidate();
				}
    			
		    },
		    cancelVal: '关闭',
		    cancel: true 
	    });
	    },
	    cache:false
});	

}
//批量删除
function batchDelete()
{
	
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	
		//++++
		if(deleteItemValidate(checkboxObj)){ // 是否有删除的权限@方吉祥
			return false;
		}
		//----
		
		if(checkboxObj.length==0){
			callbackDel();
		
		}else{
			$.dialog({
					content:'确定要删除勾选的数据吗?',
					ok:true,
					okVal:'确定',
					cancel:callbackDel,
					cancelVal:'取消',
					ok:function()
					{
						var path=[];
						var delvalidate = true;/** liqiubo 20140919 添加权限控制 修复bug 889 **/
						checkboxObj.each(function(i){
							var trObj=$(this).closest('tr');
							val=$('#flexme').flexGetColumnValue(trObj,['bussystemid']);
							if(!val){
							/** liqiubo 20140919 添加权限控制 修复bug 889 **/
								delvalidate = false;
								if($(this).attr('del') != 'false'){
									path.push($(this).val());
								}
							}
							
						});
						if(path.length == 0){
						/** liqiubo 20140919 添加权限控制 修复bug 889 **/
							if(delvalidate){
								$.dialog.notice({content:'该数据为接口数据不能删除,请重新选择',time:3,icon:'warning'});return false;
							}else{
								$.dialog.notice({content:'当前选择的数据没有删除权限，不能进行此操作！',time:3,icon:'warning'});
								return true;
							}
						}
						var pkgPath=path.join(',');
						/*if(checkboxObj.length > 0)
							{
								//遍历选中的数据
								checkboxObj.each(function(i){
									pkgPath+=$(this).val()+',';
								})
							}*/
						var url=$.appClient.generateUrl({ESIdentify:'delItems'},'x');
						$.post(url,{path:pkgPath},function(data){
							if(data){
								setGroup();
								$("input[name='path']").attr("checked",false);
								$('#flexme,#innerfile').flexReload();
								$.dialog.notice({width: 150,content: '数据删除成功',icon: 'succeed',time: 3});
							} else {
								$.dialog.notice({width: 150,content: '数据删除失败',icon: 'error',time: 3});
							}
							});
					}
	
				})
			}
	
}
//批量删除回调函数
function callbackDel()
{
	$.ajax({
   		url:$.appClient.generateUrl({ESIdentify:'batch_delete',status:status,strucid:strucid},'x'),
    	success:function(data){
	    	$.dialog({
		    	title:'批量删除',
	    		width: '50%',
	    		padding:'20px 25px',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function(){
					var form=$('#esfilter');
						var flag=form.validate();
						if(!flag){
							return false;
						}
						var condition=filterValue();
						var  thisDialog=this;
						var fieldName=getConditionText();
						var url=$.appClient.generateUrl({ESIdentify:'doBatchDelete'},'x');
						$.post(url,{condition:condition,nodePath:nodePath,fieldName:fieldName},function(result){
					
								switch(result.result)
								{
									case 'nodata':
										$.dialog.notice({width: 150,content: '无满足条件的数据',icon: 'error',time: 3});
										break;
									case 'nocondition':
										$.dialog.notice({width: 150,content: '请输入删除条件',icon: 'warning',time: 3});
										break;
									case true:
										setGroup();
										thisDialog.close();
										$.dialog.notice({width: 150,content: '删除成功',icon: 'succeed',time: 3});
										$('#flexme,#innerfile').flexReload();
										break;
									default:
										$.dialog.notice({width: 150,content: '删除失败',icon: 'error',time: 3});
										break;
							
								}
							
						},'json');
						
			    	return false;
			    },
			    init:function(){
	    			var form=$('#esfilter');
	    				if(form.length > 0){
							form.autovalidate();
						}
		    	},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    
		   cache:false
	});

}
//展示文件
function show_file(path)
{
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'isHasFileReadRight',path:path},'x'),
		cache:false,
		success:function(isHas){
			if(isHas === 'false'){
				$.dialog.notice({content: '您对当前数据下的所有原文都没有文件浏览权限，不能进行此操作！', time: 5, icon: 'warning', lock: false});
				return ;
			}
			var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path},'x');
			$.ajax({
					url:url,
					cache:false,
					success:function(data){
						$.dialog({
							id:'artFilesPanel',
					    	title:'浏览电子文件',
					    	width: '960px',
				    	   	fixed:false,
				    	    resize: false,
				    	    padding: 0,
				    	    top: '10px',
					    	content:data
					    });
					}
			});
		}
	});
}

//查看著录项
function show_items(path,systemid,itemEdit,obj)
{
	var fileread = true ;
	if(obj.tagName.toLowerCase()=='tr'){//判断当前点击的元素是否是tr,如果是找到当前行的path
		fileread = $("[name='path']",obj).attr('fileread') == 'true';
	}else{//如果不是tr则找到它的父节点tr
		var trObj=$(obj).closest('tr');
		fileread = $("[name='path']",trObj).attr('fileread') == 'true';
	}
	file_Path=path.replace(/\//g,'-');
	//liqiubo 20140903 加入是否是案卷的参数
	var isGenerate = systemid;
	if('true'==systemid || 'false'==systemid){
		systemid = '';
	}
	var url=$.appClient.generateUrl({ESIdentify:'eidtItem',path:path,boxfile:systemid,itemEdit:itemEdit,fileread:fileread,isGenerate:isGenerate},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    	$.dialog({
	    		id:'artModifyPanel',
		    	title:'查看面板',
		    	width: '550px',
	    	   	fixed:false,
	    	   	padding:'0px',
	    	    resize: false,
	    	    ok:false,
			    cancelVal: '取消',
			    cancel: true,
		    	content:data,
		    	button:[
		    		{
		    		name:'上一条',
		    		callback:function (){
		    			var isReload = true;
		    			var edit = false;
		    			var fileread = false;
		    			var isGenerate = 'true';
			    		if(obj.tagName.toLowerCase()=='tr'){//判断当前点击的元素是否是tr,如果是找到当前行的path
							temp=obj;
							obj=$(obj).prev()[0];
							path=$("[name='path']",obj).val();//path随上一条和下一条动态改变
							edit = $("[name='path']",obj).attr('edit');
							fileread = $("[name='path']",obj).attr('fileread');
							isGenerate = $("[name='path']",obj).attr('isGenerate');
						}else{//如果不是tr则找到它的父节点tr
							var trObj=$(obj).closest('tr');
							temp=obj;
							obj=trObj.prev()[0];
							path=$("[name='path']",obj).val();//path随上一条和下一条动态改变
							edit = $("[name='path']",obj).attr('edit');
							fileread = $("[name='path']",obj).attr('fileread');
							isGenerate = $("[name='path']",obj).attr('isGenerate');
						}
						if(typeof obj=='undefined'){
							obj=temp;
							path=$("[name='path']",temp).val();//到顶时就取当前temp对应的path
							edit = $("[name='path']",temp).attr('edit');
							fileread = $("[name='path']",temp).attr('fileread');
							isGenerate = $("[name='path']",temp).attr('isGenerate');
							var isReload = false;
							$.dialog.notice({content:"这是当前页第一条数据",time:2,icon:'warning'});
							return false;
						}
						getItemInfo(path,obj);
						var linkPath = path.replace(/\//g, '-');
						var refreshUrl=$.appClient.generateUrl({ESIdentify:'getLinkFiles', path:linkPath}, 'x');
						//liqiubo 20140922  修改上一条，下一条时，电子文件信息不刷新的问题，修复bug 326
						if(isReload){
							if('false'==isGenerate){
								reload(refreshUrl,null,edit,fileread);
							}
						}
						return false;
		    		}
		    		},
		    		{
		    		name:'下一条',
		    		callback:function (){
		    			var isReload = true;
		    			var edit = false;
		    			var fileread = false;
		    			var isGenerate = 'true';
		    			if(obj.tagName.toLowerCase()=='tr'){//判断当前点击的元素是否是tr,如果是找到当前行的path
							temp=obj;
							obj=$(obj).next()[0];
							path=$("[name='path']",obj).val();//path随上一条和下一条动态改变
							edit = $("[name='path']",obj).attr('edit');
							fileread = $("[name='path']",obj).attr('fileread');
							isGenerate = $("[name='path']",obj).attr('isGenerate');
						}else{//如果不是tr则找到它的父节点tr
							var trObj=$(obj).closest('tr');
							temp=obj;
							obj=trObj.next()[0];
							path=$("[name='path']",obj).val();//path随上一条和下一条动态改变
							edit = $("[name='path']",obj).attr('edit');
							fileread = $("[name='path']",obj).attr('fileread');
							isGenerate = $("[name='path']",obj).attr('isGenerate');
						}
						if(typeof obj=='undefined'){
							obj=temp;
							path=$("[name='path']",temp).val();//到尾时就取当前temp对应的path
							edit = $("[name='path']",temp).attr('edit');
							fileread = $("[name='path']",temp).attr('fileread');
							isGenerate = $("[name='path']",temp).attr('isGenerate');
							isReload = false;
							$.dialog.notice({content:"这是当前页的最后一条数据",time:2,icon:'warning'});
							return false;
						}
						getItemInfo(path,obj);
						var linkPath = path.replace(/\//g, '-');
						var refreshUrl=$.appClient.generateUrl({ESIdentify:'getLinkFiles', path:linkPath}, 'x');
						if(isReload){//liqiubo 20140922  修改上一条，下一条时，电子文件信息不刷新的问题，修复bug 326
							if('false'==isGenerate){
								reload(refreshUrl,null,edit,fileread);
							}
						}
						return false;
		    		}
		    		},{
		    			id:'dataItemModifySaveBtn',
		    			name:'保存',
		    			/** xiaoxiong 20140804 保存按钮根据是否可编辑控制是否可用 **/
		    			disabled : itemEdit=='true'?false:true,
		    			callback:function (){
		    				var form=$('#form_update');
							var thisDialog=this;
							var data=form.serialize();
							var flag=form.validate();
							if(flag){
							var url=$.appClient.generateUrl({ESIdentify:'saveItems'},'x');
								$.post(url,{path:path,data:data},function(result){
									if(result){
										if(result==2){
											$.dialog.notice({width: 150,content: '数据不能为空',icon: 'error',time: 3});
										}else{
											setGroup();
											//thisDialog.close();
											//xiewenda 20141017获取选中的和最后点击的数据值 在刷新数据后显示原来的状态
											var prepath = $('#flexme input[id="prepath"]').val();
											var selectTr = $('#flexme input[id="selectTr"]').val();
											var f = true;
											if(prepath){
												$('#flexme').flexOptions({onSuccess:function(){
													$('#innerfile').flexOptions({onSuccess:function(){
														if(f){
															var trArr = selectTr.split(",");
															for(var i=0; i<trArr.length;i++){
																$('#flexme tr').find('input[value="'+trArr[i]+'"]').attr("checked","checked");
															}
														 $('#flexme tr').find('input[value="'+prepath+'"]').parent().parent().parent().trigger('click');
														 $('#flexme tr').find('input[value="'+prepath+'"]').attr("checked","checked");
														 f=false;
														}
													}}).flexReload();
												$('#notfiling').flexReload();
												}}).flexReload();
											}else{
												$('#flexme,#innerfile,#notfiling').flexReload();
											}
											$.dialog.notice({width: 150,content: '修改成功',icon: 'succeed',time: 3});
										}
									}else{
										$.dialog.notice({width: 150,content: '修改失败',icon: 'error',time: 3});
									}
									
								});
							}
								return false;
		    			}
		    		}
		    	],
	    		init:function(){
	    			var form=$('#form_update');
						form.autovalidate();
					/** xiaoxiong 20140804 当不可编辑时，将编辑窗体中的所有组件设置为不可编辑 **/
					if(itemEdit == 'false'){
						$('.estransfer input').attr('disabled', true);	
						$('.estransfer select').attr('disabled', true);
						//添加textarea 组件的不可编辑属性
						$('.estransfer textarea').attr('disabled', true);
					}
					$('.esbottom div[class="tDiv2"]').attr('itemEdit', itemEdit);	
					$('.esbottom div[class="tDiv2"]').attr('fileread', fileread);	
	    		}
	    	
		    });
	    	
		    },
		    cache:false
	});
}
//回调函数通过点击上一条，下一条获取数据
function getItemInfo(path,obj)
{
	var checkboxObj = $("[name='path']",obj) ;
	var isGenerate = checkboxObj.attr('isGenerate') ;//liqiubo 20140923 修复bug 1195
	path=checkboxObj.val();
	var itemEdit = false ;
	/** xiaoxiong 20140804 获取待显示数据是否可编辑，从而控制保存按钮是否可用 **/
	if(checkboxObj.attr('edit') == 'true'){
		$('#dataItemModifySaveBtn').attr('disabled', false) ;
		itemEdit = true ;
	} else {
		$('#dataItemModifySaveBtn').attr('disabled', true) ;
	}
	var fileread = checkboxObj.attr('fileread') == 'true';
	file_Path=path.replace(/\//g, '-');
	$(obj).siblings().removeClass("trSelected");
	$(obj).addClass('trSelected');
	var url=$.appClient.generateUrl({ESIdentify:'getNextItem',path:path},'x');
	$.getJSON(url,function(data){
		var length=data.length;
		if( length> 0){
			for(var i=0;i<length;i++){
				$("[name="+data[i].name+"]",$('#form_update')).val(data[i].value);
				if(document.getElementById(data[i].name+"_select"))$("#"+data[i].name+"_select",$('#form_update')).val(data[i].value);//liqiubo 20141011 下拉框的值也改掉，否则出发不了change事件，修复bug 1313
				if(data[i].metadata!=null && data[i].metadata.toLowerCase()=='crossnum'){
					if(!data[i].value){//如果参见号的值为空，则删除查看关联数据的节点
						$('#crossNum').html('');
					}else{
						var sysObj={};
						var arr=data[i].value.match(/\[[a-zA-Z]{0,}\]/g);
						for(var j=0;j<arr.length;j++){
							if(arr[j]!=''){
								switch(arr[j]){
									case '[OA]':
										sysObj.OA='文书档案';
										break ;
									case '[ECM]':
										sysObj.ECM='合同档案';
										break ;
									case '[PMS]':
										sysObj.PMS='工程档案';
										break;
									case '[PUR]':
										sysObj.PUR='采购档案';
										break;
									
								}
							}
							
						}
						var lable='<fieldSet style="width:525px;margin:0px auto;"><legend>关联数据</legend><div style="margin-left:60px;">';
						for(var key in sysObj){
							lable+='<span args='+key+' style="margin-left:30px;margin-bottom:10px;float:left;font-size:13px;display:block"><a href=javascript:getLinkFile("'+key+'","'+data[i].value+'")>'+sysObj[key]+'</a></span>';
						}
						lable+='</div></fieldSet>';
						$('#crossNum').html(lable);
						
					}
				}
			}
			/** xiaoxiong 20140804 当不可编辑时，将编辑窗体中的所有组件设置为不可编辑 **/
			//xiewenda 20140915 添加textarea的disabled属性 
			if(itemEdit){
				$('.estransfer input').attr('disabled', false);	
				$('.estransfer select').attr('disabled', false);
				$('.estransfer textarea').attr('disabled', false);
			} else {
				$('.estransfer input').attr('disabled', true);	
				$('.estransfer select').attr('disabled', true);	
				$('.estransfer textarea').attr('disabled', true);
			}
		}
		
	});
	$('#modifyPath').attr('modifyPath', path.replace(/\//g, '-')) ;
	var refreshUrl=$.appClient.generateUrl({ESIdentify:'getLinkFiles', path:file_Path}, 'x');
	if('false'==isGenerate){//liqiubo 20140912 当是案卷的话，就不显示电子文件信息，修复bug 985
		reload(refreshUrl,obj,itemEdit,fileread);
	}
}
//获取文件列表重新加载   @20130807  modify
function reload(url,obj,itemEdit,fileread){
//			var sysId=$('#flexme').flexGetColumnValue($(obj),['bussystemid']);//表示是否来自其他系统
			$(".esbottom").html("<table id='efiletable'></table>");
			var colModelMac='';
			//xiewenda 20141010  添加附件类型列
			colModelMac=[
			   			{display: '序号', name : 'num', width : 20, align: 'center'},
			   			{display: '<input type="checkbox" id="linkFileSelectAll">', name : 'ids', width : 20, align: 'center'},
			   			{display: '文件类别', name: 'essType', align:'center',editable:true,width:60},
			   			{display: '附件类型', name: 'esFileType', align:'center',width:60},
			   			{display: '创建时间', name: 'createTime', align:'center',width : 124},
			   			{display: '原文路径', name: 'ywlj', width : 300,align:'left'},
			   			{display: '文件校验', name: 'esmd5',width:220,align:'left',hide:true},
			   			{display: '文件大小', name: 'essize',width:60,align:'center'}
			   		    //{display: '所属部门', name: 'dept', editable:true,width:100,align:'left'}
			   		];
			
			/** xiaoxiong 20140805 添加权限控制 **/
//			if(sysId==''){
				var button=[
					{name: '添加', disable:!itemEdit, bclass: 'add'+(itemEdit?'':' not-allowed'), onpress: checkScanPolicy4AddFile},
					{name: '删除', disable:!itemEdit, bclass: 'delete'+(itemEdit?'':' not-allowed'), onpress: delFile},
					{name: '保存', disable:!itemEdit, bclass: 'save'+(itemEdit?'':' not-allowed'), onpress: saveFile},
					{name: '上传', disable:!itemEdit, bclass: 'fileup'+(itemEdit?'':' not-allowed'), onpress: checkScanPolicy4UploadFile},
					{name: '浏览原文', disable:!fileread, bclass: 'viewfile'+(fileread?'':' not-allowed'), onpress: viewFile}
				];
//			}else{
//				var button=[
//					{name: '浏览原文', disable:!fileread, bclass: 'viewfile'+(fileread?'':' not-allowed'), onpress: viewFile}
//				];
//			}
//			sysId='';//重置为空
			$("#efiletable").flexigrid({
						url: url,
						dataType: 'json',
						editable: true,
						colModel :colModelMac,
						buttons :button,
						title: '电子文件列表',
						useRp: true,
						width: 540,
						height: 200
			});
}
//会计档案上一条，x
//生成档号
function createFileNum()
{
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){
		$.dialog.notice({content:'请选择生成档号数据',time:3,icon:'warning'});
		return false;
	}
	var editValidate = true;/** liqiubo 20140919 添加权限控制 修复bug 889 **/
	checkboxObj.each(function(i){
		var trObj=$(this).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['ArchivalCode']);
		if(!val){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			editValidate = false;
			if($(this).attr('edit') != 'false'){
				path.push($(this).val());
			}
		}
		
	});
	if(path.length == 0){
	/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if(editValidate){
			$.dialog.notice({content:'数据档号已存在,请重新选择',icon: 'warning',time:3});return false;
		}else{
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',icon: 'warning',time:3});
			return false;
		}
	}
	var paths=path.join(',');
	var url=$.appClient.generateUrl({ESIdentify:'judgeCombinValues'});
	$.post(url,{path:paths},function(data){
		if(data.success=="false"){
			$.dialog.notice({content:data.msg ,icon: 'error',time: 3});
			return false;
		}else{
			$.dialog({
				content:'确定要生成档号吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var url=$.appClient.generateUrl({ESIdentify:'createFileNum'});
					$.post(url,{path:paths},function(data){
						if(data.success){
							setGroup();
							$("input[name='path']").attr("checked",false);
							$.dialog.notice({width: 150,content: '档号创建成功',icon: 'succeed',time: 3});
							$('#flexme,#innerfile').flexReload();
						}else {
							$.dialog.notice({width: 150,content: '档号创建失败',icon: 'error',time: 3});
						}
						},"json");
				}

			})
		}
		},"json");
	

}
//删除档号(撤件)
function delFileNum()
{
	//liqiubo 20140522 现在只有案卷编目和整理编目使用此方法，在此加判断，要是数据装盒了，就不允许撤件
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	var val='';
	var path=[];
	var haveBoxCount = 0;
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){
		$.dialog.notice({content:'请选择删除档号数据',time:3,icon:'warning'});
		return false;
	}
	var editValidate = true;/** liqiubo 20140919 添加权限控制 修复bug 889 **/
	checkboxObj.each(function(i){
		if($(checkboxObj[i]).attr('boxid')) {
			haveBoxCount ++ ;
		}
		var trObj=$(this).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['ArchivalCode']);
		if(val){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			editValidate = false;
			if($(this).attr('edit') != 'false'){
				path.push($(this).val());
			}
		}
		
	})
	//liqiubo 20140522 加入是否装盒的判断 如果存在装盒的数据，不让撤件
	if(haveBoxCount>0) {
		$.dialog.notice({content:'选择的数据中存在已经装盒的数据，不能够进行撤件',time:3,icon:'warning'});
		return false;
	}
	if(path.length == 0){
		if(editValidate){
			$.dialog.notice({content:'数据档号不存在,请重新选择',time:3,icon:'warning'});return false;
		}else{
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
	}
	var paths=path.join(',');
	$.dialog({
			content:'确定要清除档号吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESIdentify:'delFileNum'});
				$.post(url,{path:paths},function(data){
					var dataJson = eval("("+data+")");
					if(dataJson.success=='true'){
						setGroup();
						$("input[name='paths']").attr("checked",false);
						$.dialog.notice({width: 150,content: '档号清除成功',icon: 'succeed',time: 3});
						$('#flexme,#innerfile').flexReload();
					}else {
						var msg = dataJson.msg;
						$.dialog.notice({width: 200,icon:'error',content:msg, time:3});
					}
					});
			}

		})
}
//档案装盒
function do_pack()
{
	/** xiaoxiong 20140904 添加数据权限的控制 **/
	var itemEditRight = ($('#escontent').attr("itemEditRight")+"") == "false" ;
	itemEditRight = (itemEditRight?false:function(){
    	//liqiubo 20140731 原来此处有一个是否是会计档案的判断，干掉，如果想加回，看上一版代码
    	putFileIntoBox();
		return false;
    });
	$.ajax({
    url:$.appClient.generateUrl({ESIdentify:'packing',nodePath:nodePath},'x'),
    success:function(data){
    	$.dialog({
    		id:'artPackingPanel',
	    	title:'档案装盒',
    		width: 700,
    	    height: 285,
    	    padding:'0px 0px',
    	   	fixed:true,
    	    resize: false,
	    	content:data,
	    	okVal:'装盒',
		    ok:itemEditRight,
		    cancelVal: '关闭',
		    cancel: true 
	    });
	    },
	    
	    cache:false
});
}
//文书档案装盒
function putFileIntoBox()
{
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	var val='';//盒号
	var paperNum='';//纸质附件数
	var path=[];
	var checkBoxLen=checkboxObj.length;
	//判断是否选择数据
	if(checkBoxLen==0){
		$.dialog.notice({content:'请选择装盒的数据',time:3,icon:'warning'});
		return false;
	}
	var temp=[];//用于判断档号是否存在
	var editTemp = [];
	//判断档号是否已存在，档号存在的数据才能进行装盒
	checkboxObj.each(function(i){
		var trObj=$(this).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['ArchivalCode']);
		if(val){
			if($(this).attr('edit') != 'false'){
				temp.push($(this).val());
			}else{
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				editTemp.push($(this).val());
			}
		}
		
	});
	/** liqiubo 20140919 添加权限控制 修复bug 889 **/
	if(editTemp.length>0){
		$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
		return false;
	}
	if(temp.length < checkBoxLen){
		$.dialog.notice({content:'选择的数据档号不存在,不能进行装盒',icon:'warning',time:3});return false;
	}
	var paperName=$("#flexme").flexGetColumnName('PaperAttachments');//判断列表中是否存在纸质附件数字段，如果存在装盒时其值必须存在
	//筛选盒号为空的数据
	checkboxObj.each(function(i){
		var trObj=$(this).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['CaseID']);
		if(paperName){
			paperNum=$("#flexme").flexGetColumnValue(trObj,['PaperAttachments']);
			if(!val && paperNum && paperNum!=0){
				path.push($(this).val());
			}
		}else{
			if(!val){
				path.push($(this).val());
			}
		}
	
		
	})
	
	var reg=/\//g;
	var itemID=path.join(',').replace(reg, '-');
	//选择盒ID
	var checkboxObj=$("input[name='path']:checked",$('#pack'));
	if(checkboxObj.length==0){
		$.dialog.notice({content:'请选择盒',title:'提示',time:3,icon:'warning'});
		return false;
	}
//	if(checkboxObj.length!=1){
//		$.dialog.notice({content:'请选择单条盒',title:'提示',time:3});
//		return false;
//	}
	if(checkboxObj.attr('isHaveRepository')==1){
		$.dialog.notice({content:'该盒已经上架，请选择其他的盒',title:'提示',time:3,icon:'warning'});
		return false;
	}
	if(checkboxObj.length>0){
		//var boxID=checkboxObj.val();
		var boxID=[];
		checkboxObj.each(function(i){
			boxID.push($(this).attr('value'));
		});	
	}
//	if(checkBoxLen>1 && boxID.length !=1){
	if(boxID.length !=1){
		$.dialog.notice({content:'请选择单条盒',title:'提示',time:3,icon:'warning'});
		return false;
	}
	
	var url=$.appClient.generateUrl({ESIdentify:'doPacking'});
	
	//选择数据ID
	var recheckDataObj=$("#flexme input[name='path'][class='selectone']:checked");
	var reitemID = [];
	var boxIDs = [];
	recheckDataObj.each(function(i){
		var boxID = $(this).attr('boxid');
		if( boxID ) {
			boxIDs.push(boxID);
		}				
		reitemID.push($(this).val());
	});	
	if( boxIDs.in_array(checkboxObj.val()) || boxIDs.join(',').split(',').in_array(checkboxObj.val()) ) {
		$.dialog.notice({content:'选择的数据已经装入该盒',title:'提示',icon: 'warning',time:3});
		return false;
	}
	if(path.length == 0){
		//thisDialog.close();
		if(paperName){
			$.dialog.notice({content:'数据不存在纸质附件或者盒号已存在,请重新选择数据',title:'提示',time:3,icon:'warning'});return false;
		}else{
			/*//选择数据ID
    		var recheckDataObj=$("#flexme input[name='path'][class='selectone']:checked");
    		var reitemID = [];
    		var boxIDs = [];
			recheckDataObj.each(function(i){
				var boxID = $(this).attr('boxid');
				if( boxID ) {
    				boxIDs.push(boxID);
    			}				
    			reitemID.push($(this).val());
    		});
			//$.dialog({content:'盒号已存在,请重新选择数据',time:3});*/
//			if( boxIDs.in_array(checkboxObj.val()) || boxIDs.join(',').split(',').in_array(checkboxObj.val()) ) {
//    			$.dialog.notice({content:'选择的数据已经装入该盒',title:'提示',icon: 'warning',time:3});
//    			return false;
//    		}
			$.dialog({
				content: '数据已经装盒，是否再次进行装盒？',
				icon: 'warning',
				ok: function(){
					$.post(url,{strucID:strucid,boxID:boxID.join(','),itemID:reitemID.join(','),type:archiveType},function(result){
						var resultJson = eval("("+result+")");
						if(resultJson.flag=='full'){
							$.dialog.notice({width: 150,content: '盒已装满，'+recheckDataObj.length+'条数据装盒成功',icon: 'succeed',time: 3});
							$('#pack,#flexme,#innerfile').flexReload();
						}else if(resultJson.flag=='success'){
							setGroup();
							$.dialog.notice({width: 150,content: recheckDataObj.length+'条数据装盒成功',icon: 'succeed',time: 3});
							$('#pack,#flexme,#innerfile').flexReload();
						}else {
							var msg = resultJson.msg;
							$.dialog.notice({width: 350,content: msg,icon: 'error',time: 3});
						}
					});
				},
				cancel: true,
				okVal: '确定',
				cancelVal: '取消'
			});
			//$.dialog.notice({content:'选择的数据已经装盒,不允许重复装盒',title:'提示',icon: 'warning',time:3});
			return false;
		}
	}
	
	$.dialog({
		content: '是否装盒？',
		icon: 'warning',
		ok: function(){	
			$.post(url,{strucID:strucid,boxID:boxID.join(','),itemID:itemID,type:archiveType},function(result){	
				var resultJson = eval("("+result+")");
				if(resultJson.flag=='full'){
					$.dialog.notice({width: 150,content: '盒已装满，装盒成功',icon: 'succeed',time: 3});
					$('#pack,#flexme,#innerfile').flexReload();
				}else if(resultJson.flag=='success'){
					setGroup();
					$.dialog.notice({width: 150,content: '装盒成功',icon: 'succeed',time: 3});
					$('#pack,#flexme,#innerfile').flexReload();
				}else {
					var msg = resultJson.msg;
					$.dialog.notice({content: msg,icon: 'error',time: 3});
				}
				});
		},
		cancel: true,
		okVal: '确定',
		cancelVal: '取消'
	});
}

//如果是会计档案装盒，根据用户输入装盒数据的规则
function putAccountFileIntoBox(boxID)
{
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'packingRule',nodePath:nodePath},'x'),
		success:function(data){
			$.dialog({
				id:'packingRulePanel',
				title:'数据装盒规则设置',
				content:data,
				padding:'0px',
				width:530,
	    	   	fixed:true,
	    	    resize: false,
	    	    okVal:'确定',
			    ok:function(){
			    	var form=$('#recordRule');
			    	var flag=form.validate();
					if(flag){
						var thisDialog=this;
						var data=form.serialize();
						var trs = $('#recordRule tr[id^="row"]');
						var length = trs.length;
						var j = 0;
						var s_min='',s_max='',s_companyCode='',s_ledgerSource='';
						for(var i=0; i<length; i++){
							var min = $(trs[i]).children('td[colname="recordIdMin"]').find('input').val();
							var max = $(trs[i]).children('td[colname="maxrecordCode"]').find('input').val();
							var ledgerSource = $(trs[i]).children('td[colname="ledgerSource"]').text();
							var companyCode = $(trs[i]).children('td[colname="companyCode"]').text();
							if(max) {
								s_min+= min+',';
								s_max+= max+',';
								s_companyCode+=companyCode+',';
								s_ledgerSource+=ledgerSource+',';
							}
							if(min > max) {
								j++;
							}
						}
						/*data['minRecordIDValue'] = s_min;
						data['maxRecordIDValue'] = s_max;
						data['companyCode'] = s_companyCode;
						data['ledgerSource'] = s_ledgerSource;*/
						data+='&minRecordIDValue='+s_min+'&maxRecordIDValue='+s_max+'&companyCode='+s_companyCode+'&ledgerSource='+s_ledgerSource;
						var url=$.appClient.generateUrl({ESIdentify:'addInfoAccountToBox'},'x');
						if(j!=length){
							if($.trim(s_min.replace(/,/g,'')) == '' || s_min == null) {
								$.dialog.notice({title:'操作提示',content:'最小凭证号和最大凭证号不能为空！',icon:'warning',time:3});
								return false;
							}
							$.dialog({
			    				content: '是否装盒？',
			    				icon: 'warning',
			    				ok: function(){
									$.post(url,{path:nodePath,boxID:boxID,data:data},function(result){
										result=jQuery.parseJSON(result);
										if(result.flag){
											thisDialog.close();
											if(result.toBoxSize){
												$.dialog.notice({width: 200,content:'有'+result.toBoxSize+'条'+result.msg,icon: 'succeed',time: 3});
											}else{
												$.dialog.notice({width: 200,content:result.msg,icon: 'succeed',time: 3});
											}
											$('#pack,#flexme').flexReload();
										}else{
											if(result.data){
												$.dialog.notice({width: 200,content:result.msg,icon: 'error'});
											}else{
												$.dialog.notice({width: 200,content:result.msg ,icon: 'error'});
											}
										}										
									});
								},
			    				cancel: true,
			    				okVal: '确定',
			    				cancelVal: '取消'
			    			});
						}else{
							$.dialog.notice({title:'操作提示',content:'最大凭证号不能小于最小凭证号！',icon:'warning',time:3});
							return false;
						}
					}
					return false;
				},
			    cancelVal: '取消',
			    cancel: true,
			    init:function(){
			    	var form=$('#recordRule');
			    	form.autovalidate();
	    		}
				});
			}
	});
}
//组卷
function  generatePaper()
{
	alert(1);
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	//判断是否选择数据
	if(checkBoxLen==0){
//		$.dialog.notice({content:'请选择组卷的数据',time:3});
		/** xiaoxiong 20140811 添加综合条件组卷 **/
		generatePaperForCondition() ;
		return false;
	}
	var editValidata = true;
	//筛选“关系”字段为空的数据，用户判断是否已组完卷
	checkboxObj.each(function(i){
		var trObj=$(this).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['relation']);
		if(!val){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			editValidata = false;
			if($(this).attr('edit') != 'false'){
				path.push($(this).val());
			}
		}
	});
	
	if(path.length == 0){
		if(editValidata){
			$.dialog.notice({content:'该数据已完成组卷，请重新选择数据',time:3,icon:'warning'});return false;
		}else{
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
    }
    if(checkBoxLen > path.length ){
    	$.dialog.notice({content:'部分数据已完成组卷，请重新选择数据',time:3,icon:'warning'});return false;
    }
    var paths=path.join(',');
    $.ajax({
    	type: "POST",
    	data:"path="+paths,
    	url:$.appClient.generateUrl({ESIdentify:'generatePaper'},'x'),
    	success:function(data){
	    	if(data=='false'){
	    		$.dialog.notice({width: 200,content: '请设置关联规则后再进行组卷',icon: 'succeed',time: 3});
	    		return false;
	    	}
	    	$.dialog({
	    		id:'artgeneratePaperPanel',
		    	title:'组卷面板',
		    	width: '800px',
		    	padding:'0px',
	    	   	fixed:false,
	    	    resize: false,
	    	    okVal:'保存',
			    ok:true,
			    cancelVal: '取消',
			    cancel: true,
		    	content:data,
		    	ok:function()
		    	{   
					var saveTrObj = $('#generatePaperGrid tr[datastate="new"]');
					var datas = []; // [{},...]
					saveTrObj.each(function (){
						datas.push($(this).prop("data").cell);
					});
				    var url=$.appClient.generateUrl({ESIdentify:'doGeneratePaper'},'x');
					var thislog=this;
					$.post(url,
						{datas:datas,itemPath:parentPath,nodePath:nodePath},
						function(result){
							if(result == 'true'){
								setGroup();
								thislog.close();
								$.dialog.notice({width: 150,content: '组卷成功',icon: 'succeed',time: 3});
								$('#flexme').flexReload();
							}else{
								$.dialog.notice({width: 150,content: '组卷失败',icon: 'error',time: 3});
							}
					});
					return false;
				 },
	    		init:function(){
	    			var form=$('#generate');
						form.autovalidate();
	    		}
		    });
	    },
	    cache:false
    });
}

/** xiaoxiong 20140811 综合条件组卷 **/
function  generatePaperForCondition(){
	$.ajax({
	    url:$.appClient.generateUrl({ESIdentify:'filter',status:status,strucid:strucid},'x'),
	    success:function(data){
	    	$.dialog({
	    		id:'artFilterPanel',
		    	title:'筛选组卷',
	    		width: 500,
	    	    height: 200,
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function(){
			    	var form=$('#esfilter');
					var thisDialog=this;
					var flag=form.validate();
					if(flag){
						var condition=filterValue();
						var tempGroupCondition = "";
						if(gc.groupCondition){
							tempGroupCondition = gc.groupCondition;
						}
						$.post($.appClient.generateUrl({ESIdentify:'generatePaper'},'x'),
								   {'condition':condition.condition, 'nodePath':nodePath, 'groupCondition':tempGroupCondition},function(data){
						    	if(data=='false'){
						    		$.dialog.notice({width: 200,content: '请设置关联规则后再进行组卷',icon: 'succeed',time: 3});
						    		return false;
						    	}
						    	if(data==''){
						    		$.dialog.notice({width: 200,content: '当前条件下没有您可以浏览的未组卷的数据！',icon: 'succeed',time: 3});
						    		return false;
						    	}
						    	$.dialog({
						    		id:'artgeneratePaperPanel',
							    	title:'组卷面板',
							    	width: '800px',
							    	padding:'0px',
						    	   	fixed:false,
						    	    resize: false,
						    	    okVal:'保存',
								    ok:true,
								    cancelVal: '取消',
								    cancel: true,
							    	content:data,
							    	ok:function()
							    	{   
										var saveTrObj = $('#generatePaperGrid tr[datastate="new"]');
										var datas = []; // [{},...]
										saveTrObj.each(function (){
											datas.push($(this).prop("data").cell);
										});
									    var url=$.appClient.generateUrl({ESIdentify:'doGeneratePaper'},'x');
										var thislog=this;
										$.post(url,
											{datas:datas,itemPath:parentPath,nodePath:nodePath},
											function(result){
												if(result == 'true'){
													setGroup();
													thislog.close();
													$.dialog.notice({width: 150,content: '组卷成功',icon: 'succeed',time: 3});
													$('#flexme').flexReload();
												}else{
													$.dialog.notice({width: 150,content: '组卷失败',icon: 'error',time: 3});
												}
										});
										return false;
									 },
						    		init:function(){
						    			var form=$('#generate');
											form.autovalidate();
						    		}
							    });
						    	thisDialog.close();
					    });
					}
			    	return false;
			    },
			    init:function(){
		    			var form=$('#esfilter');
							form.autovalidate();
		    		},
			    cancelVal: '关闭',
			    cancel: true 
		    });
	    },
	    cache:false
	});
}

function innerCancelRelationValue()
{
	var obj=$('#innerfile');
	cancelRelationValue(obj,'撤件');
}
function innerCancelRelation()
{
	var obj=$('#flexme');
	cancelRelationValue(obj,'撤件');
}
function fileCancelRelationValue(){
		var obj=$('#flexme');
		cancelRelationValue(obj,'拆卷');
}
//文件整理撤件
function cancelRelationValue(obj,msg){

var checkboxObj=$("input[name='path']:checked",obj);
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){
		$.dialog.notice({content:'请选择'+msg+'的数据',time:2});
		return false;
	}
	checkboxObj.each(function(i){
		//var trObj=$(this).closest('tr');
		//val=obj.flexGetColumnValue(trObj,['relation']);
		//if(val){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if($(this).attr('edit') != 'false'){
			path.push($(this).val());
		}
		//}
		
	});
	/** liqiubo 20140919 添加权限控制 修复bug 889 **/
	if(path.length==0){
		$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
		return false;
	}
	/*if(path.length == 0){
		$.dialog.notice({content:'该数据未完成组卷,请重新选择',time:3});return false;
	}*/
	var paths=path.join(',');
	$.dialog({
			content:'确定要'+msg+'吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESIdentify:'unwindInnerFile'});
				$.post(url,{path:paths},function(data){
					if(data){
						setGroup();
						//$("input[name='path']").attr("checked",false);
						$.dialog.notice({width: 150,content: msg+'成功',icon: 'succeed',time: 3});
						$('#flexme,#innerfile').flexReload();
					}else {
						$.dialog.notice({width: 150,icon:'error',content:msg+"失败!", time:3});
					}
					});
			}

		})
}

//资料库退回功能
function sendNotFilingBack()
{
	var obj=$('#notfiling');
	send_back(obj);
}
//卷内目录退回功能
function sendInnerFileBack()
{
	var obj=$('#flexme');
	var checkboxObj=$("input[name='path']:checked",obj);
	var val='';
	var path=[];
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){
		$.dialog.notice({content:'请选择退回的数据',time:2,icon:'warning'});
		return false;
	}
	checkboxObj.each(function(i){
		//var trObj=$(this).closest('tr');
		//val=obj.flexGetColumnValue(trObj,['relation']);
		//if(!val){
		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
		if($(this).attr('edit') != 'false'){
			path.push($(this).val());
		}
		//}
		
	});
	/** liqiubo 20140919 添加权限控制 修复bug 889 **/
	if(path.length==0){
		$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
		return false;
	}
	/*if(path.length == 0){
		$.dialog.notice({content:'该数据已完成组卷,请重新选择',time:3});return false;
	}*/
	var reg=/\//g;
	var paths=path.join(',').replace(reg, '-');
	$.dialog({
			content:'确定要退回吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESIdentify:'send_back'});
				$.post(url,{path:paths,status:status},function(data){
					if(data){
						setGroup();
						//$("input[name='path']").attr("checked",false);
						$.dialog.notice({width: 150,content: '退回成功',icon: 'succeed',time: 3});
						obj.flexReload();
					}else {
						$.dialog.notice({width: 150,icon:'error',content:"退回失败!", time:3});
					}
					});
			}

		})
}
//文件编目、整理编目中退回功能，需要判断档号是否存在，若存在不能退回，反正则不然
function backToUp(){
	var obj=$('#flexme');
	var checkboxObj=$("input[name='path']:checked",obj);
	var val='';
	var path=[];
	var haveBoxCount = 0;
	var checkBoxLen=checkboxObj.length;
	if(checkBoxLen==0){
		$.dialog.notice({content:'请选择退回的数据',time:2,icon:'warning'});
		return false;
	}
	var editValidate = true;
	var archivalCodeNum = 0;
	var noEditNum = 0;
	checkboxObj.each(function(i){
		//liqiubo 20140522 加入是否装盒的判断
		if($(checkboxObj[i]).attr('boxid')) {
			haveBoxCount ++ ;
		}
		var trObj=$(this).closest('tr');
		val=obj.flexGetColumnValue(trObj,['ArchivalCode']);//这个拿的是档号
		if($(this).attr('edit') != 'false'){
			if(!val){
				path.push($(this).val());
			}else{
				archivalCodeNum++;
			}
		}else{
			noEditNum++;
		}
		
	});
	//liqiubo 20140522 加入是否装盒的判断 如果存在装盒的数据，不让退回
	if(haveBoxCount>0) {
		$.dialog.notice({content:'选择的数据中存在已经装盒的数据，不能够进行退回',time:3,icon:'warning'});
		return false;
	}
	if(path.length == 0){
		if(archivalCodeNum>0){
			$.dialog.notice({content:'选择的数据中，存在已经生成档号的数据,不能退回',time:3,icon:'warning'});return false;
		}else{
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
			return false;
		}
	}
	//liqiubo 20140928  加入提示，修复bug 1252
	if(noEditNum>0){
		//说明存在没有编辑权限的数据，给个提示
		$.dialog({
			content:'选择的数据中存在没有编辑权限的数据，是否继续将有编辑权限的数据进行退回？',
			ok:true,
			okVal:'是',
			cancel:true,
			cancelVal:'否',
			ok:function()
			{
				backToUpSupport(path,status);
			}

		});
	}else{
		backToUpSupport(path,status);
	}
	
}

function backToUpSupport(path,status){
	var reg=/\//g;
	var paths=path.join(',').replace(reg, '-');
	$.dialog({
			content:'确定要退回吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESIdentify:'send_back'});
				$.post(url,{path:paths,status:status},function(data){
					if(data){
					setGroup();
						//$("input[name='path']").attr("checked",false);
						$.dialog.notice({width: 150,content: '退回成功',icon: 'succeed',time: 3});
						$("#flexme,#innerfile").flexReload();
					}else {
						$.dialog.notice({width: 150,icon:'error',content:"退回失败!", time:3});
					}
					});
			}

		});
}
//文件退回
function sendBack()
{
	var obj=$('#flexme');
	send_back(obj);
}
//退回(回调函数)
function send_back(obj)
{
	var id=check_selected_role('退回的','path',obj,'edit');//liqiubo 20140919 调用的方法换成验证权限的
	if(!id)return;
	var reg=/\//g;
	var path=id.replace(reg, '-');
	$.dialog({
			content:'确定要退回吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESIdentify:'send_back'},'x');
				$.post(url,{path:path,status:status},function(data){
					if(data){
					setGroup();
						$("input[name='paths']").attr("checked",false);
						$.dialog.notice({width: 150,content: '文件退回成功',icon: 'succeed',time: 3});
						obj.flexReload();
						//liqiubo 20140703 不归档退回后，加入判断刷新档案数据
						if($('#flexme')){
							$('#flexme').flexReload();
						}
					} else {
						$.dialog.notice({width: 150,content: '文件退回失败',icon: 'error',time: 3});
					}
					});
			}

		})
	}
//入库
function putInto()
{
	var id=check_selected('移交的');
	if(id=='' || id==='undefined' || id==0)
	{
		return false;
	}
	var reg=/\//g;
	var path=id.replace(reg, '-');
	$.dialog({
			content:'确定要移交吗?',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESIdentify:'putInto'},'x');
				$.post(url,{path:path},function(data){
					if(data){
						setGroup();
						$("input[name='paths']").attr("checked",false);
						$.dialog.notice({width: 150,content: '文件入库成功',icon: 'succeed',time: 3});
						$('#flexme').flexReload();
					} else {
						$.dialog.notice({width: 150,content: '文件入库失败',icon: 'error',time: 3});
					}
					});
			}

		})
}
function autoResize()
{
	$("#flexme").autoResizeColumn();
}
function hideMenu() {
	$("#morelist").hide();
}
function onBodyDown(event) {
	var explorer = window.navigator.userAgent;
	if (!(event.target.id == "do_more" || $(event.target).parents("#do_more").length>0)) {
		if(explorer.indexOf("MSIE 6.0") >= 0) { $('select[name="rp"]').eq(-2).show()};
		hideMenu();
	}else{
		var off=$('#do_more').offset();
		$('#morelist').toggle().offset({top:off.top+25,left:off.left});
		if(explorer.indexOf("MSIE 6.0") >= 0) { 
			$('select[name="rp"]').eq(-2).hide();
			if($('#morelist').css('display') == 'none') {
				$('select[name="rp"]').eq(-2).show();
			}
		}
	}
}
function hideCata() {
	$("#catagory,#deadline").fadeOut("fast");
}
function clickBodyDown(event) {
	if (!(event.target.id == "catagory" || event.target.id == "fication" || $(event.target).parents("#catagory").length>0) && event.target.id!="deadline") {
		hideCata();
	}
}
//插件
function insertFile(){
var checkboxObj=$("input[name='path']:checked",$('#flexme'));
    	var val='';
    	var path=[];
    	var editPath = [];//装无编辑权限的
    	var relationPath=[];//装组完卷的
    	var checkBoxLen=checkboxObj.length;
    	//判断是否选择数据
    	if(checkBoxLen==0){
    		$.dialog.notice({content:'请选择插件的数据',time:3,icon:'warning'});
			return false;
    	}
    	var editValidata = true;
		checkboxObj.each(function(i){
			var trObj=$(this).closest('tr');
			val=$("#flexme").flexGetColumnValue(trObj,['relation']);
			if(!val){
			/** liqiubo 20140919 添加权限控制 修复bug 889 **/
				editValidata = false;
				if($(this).attr('edit') != 'false'){
					path.push($(this).val());
				}else{
					editPath.push($(this).val());
				}
			}else{
				relationPath.push($(this).val());
			}
    	});
    	
    	if(path.length == 0){
    		if(editValidata){
    			$.dialog.notice({content:'该数据已完成组卷，请重新选择数据',time:3,icon:'warning'});return false;
    		}else{
    		/** liqiubo 20140919 添加权限控制 修复bug 889 **/
    			$.dialog.notice({content:'当前选择的数据没有编辑权限，不能进行此操作！',time:3,icon:'warning'});
    			return false;
    		}
	    }
    	//各种验证
    	if(relationPath.length>0 ){
    		$.dialog.notice({content:'部分数据已完成组卷，请重新选择数据',time:3,icon:'warning'});return false;
    	}
    	//liqiubo 20140928 加入部分数据无编辑权限时的提示，修复bug 1251
    	if(editPath.length>0){
    		$.dialog({
    			content:'部分选择的数据没有编辑权限，是否继续将有权限的数据进行插件？',
    			ok:function(){insertFileSupport(path,parentPath);},
    			okVal:'是',
    			cancelVal:'否',
    			cancel:true
    		});
    	}else{
    		insertFileSupport(path,parentPath);
    	}
	    
}




function insertFileSupport(path,parentPath){
	var paths=path.join(',');
	var url=$.appClient.generateUrl({ESIdentify:'getArchivesList',path:parentPath},'x');
	$.ajax({
	    url:url,
	    success:function(data){
	    	$.dialog({
	    		id:'artInsertFilePanel',
		    	title:'案卷列表',
		    	width: '550px',
		    	padding:'0px',
	    	   	fixed:false,
	    	    resize: false,
	    	    okVal:'保存',
			    ok:true,
			    cancelVal: '取消',
			    cancel: true,
		    	content:data,
		    	ok:function()
		    	{
					var prePath=$("input[name='path']:checked",$('#getArchivesList')).val();
					if(!prePath){
						$.dialog.notice({content:'请选择案卷',time:2,icon:'warning'});
						return false;
					}
					var reg=/\//g;
					var filePath=prePath.replace(reg, '-');
					var url=$.appClient.generateUrl({ESIdentify:'saveFilingData'},'x');
						var thislog=this;
						$.post(url,{itemPath:filePath,path:paths},function(result){
							if(result){
								setGroup();
								thislog.close();
								$.dialog.notice({width: 150,content: '插件成功',icon: 'succeed',time: 3});
								$('#flexme').flexReload();
							}else{
								$.dialog.notice({width: 150,content: '插件失败',icon: 'error',time: 3});
							}
							
						});

					return false;
					
				 }
		    });
	    	
		    },
		    cache:false
	});
}

//动态设置分组
function setGroup(){
	var url=$.appClient.generateUrl({ESIdentify:'setGroup'},'x');
	$.getJSON(url,{path:nodePath},function(result){
		if(result.success){
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			var treeNodeId =result.treeNodeId;
			//var treeNode = zTree.getNodeByParam("sId",treeNodeId, null);
			//var treeNode = zTree.getNodeByParam("id",treeNodeId);//每次刷新编辑节点而不是父节点下面的所有节点
			var treeNode = zTree.getNodeByParam("id",$('#treeDemo').attr('selectid'));
			if(treeNode.childPath&&!treeNode.esorder){
				setLinkGroup(treeNode.childPath,2);
			}
//	        if(treeNode.parentPath&&!treeNode.esorder){
//	    	   setLinkGroup(treeNode.parentPath,1);
//			}
			if(treeNode) {
				zTree.removeChildNodes(treeNode);
			}
			if(result.nodes.length!=0)
			{
				zTree.addNodes(treeNode, result.nodes);
			}
		}
	
	});

}
function setLinkGroup(path,type){
	var url=$.appClient.generateUrl({ESIdentify:'setGroup'},'x');
	path=path.replace(/\//gi,'-');
	$.getJSON(url,{path:path},function(result){
		if(result.success){
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			var treeNodeId =result.treeNodeId;
			//var treeNode = zTree.getNodeByParam("sId",treeNodeId, null);
			//var treeNode = zTree.getNodeByParam("id",treeNodeId);//每次刷新编辑节点而不是父节点下面的所有节点
			if(result.nodes.length!=0){ 
				id=treeNodeId+''+result.nodes[0].sId;
				if(type==2){
					id=id+''+'innerFile';
				}else{
					id=id+''+'File';
				}
				var treeNode = zTree.getNodeByParam("id",id);
			    if(treeNode) {
				  zTree.removeChildNodes(treeNode);
			    }
				zTree.addNodes(treeNode, result.nodes);
				zTree.updateNode(treeNode);
			}
		}
	
	});

}
//档案著录中盒列表页面
function getPacketList()
{
	$.ajax({
    url:$.appClient.generateUrl({ESIdentify:'packing',nodePath:nodePath},'x'),
    success:function(data){
    	$.dialog({
    		id:'artPacketListPanel',
	    	title:'盒列表',
    		width: 700,
    	    height: 285,
    	    padding:'0px 0px',
    	   	fixed:true,
    	    resize: false,
	    	content:data,
		    cancelVal: '关闭',
		    cancel: true 
	    });
	    },
	    
	    cache:false
});
}
/**
	生成二维码
	存在两种情况：1：勾选数据 2：筛选条件
	@date 2013-03-14
	@author wangtao
*/
function createCode()
{
	var checkboxObj=$("input[name='path']:checked",$('#flexme'));
	if(checkboxObj.length > 0)
	{
		$.dialog({
			content:'确定生成二维码？',
			ok:function(){
				var pathList=[];
				//遍历选中的数据
				checkboxObj.each(function(i){
					pathList.push(this.value);
				});
				var url=$.appClient.generateUrl({ESIdentify:'createCode'},'x');
				$.post(url,{pathList:pathList},function(fileUrl){
					if(fileUrl.search(/failure/gi)==-1){
						var downFile=$.appClient.generateUrl({ESIdentify:'downFile',fileName:fileUrl});
						$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载二维码文件</a>'});
					}else{
						$.dialog.notice({content:fileUrl.replace(/failure\:/gi,''),time:3,icon:'error'});
					}
				});
			},
			okVal:'是',
			cancelVal:'否',
			cancel:true
		});
	}else{
		createCodeFilter();
	}
}


function perDelData(){
	perDelDataExcute('#flexme');
}
function perDelDataInnerFile(){
	perDelDataExcute('#innerfile');
}
/**
 * 回收站删除数据
 * @param flexName
 */
function perDelDataExcute(flexName){
	var obj=$(flexName);
	var id=check_selected('删除的','path',obj);
		if(!id)return;
		$.dialog({
				content:'删除的数据将不可恢复！',
				icon:'warning',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var url=$.appClient.generateUrl({ESRecycleBin:'perDelData'},'x');
					$.post(url,{path:id},function(data){
						if(data){
							$("input[name='path']").attr("checked",false);
							$.dialog.notice({width: 150,content: '数据删除成功',icon: 'success',time: 3});
							obj.flexReload();
						} else {
							$.dialog.notice({width: 150,content: '数据删除失败',icon: 'error',time: 3});
						}
						});
				}

			});
}

//清空
function perEmptyData(){
	//liqiubo 20141008 修改提示，吧删除改为清空，修复bug 1088
	$.dialog({
			content:'清空的数据将不可恢复！',
			icon:'warning',
			ok:true,
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var url=$.appClient.generateUrl({ESRecycleBin:'perEmptyData'},'x');
				$.post(url,{path:nodePath},function(data){
					if(data){
						$("input[name='path']").attr("checked",false);
						$.dialog.notice({width: 150,content: '数据清空成功',icon: 'succeed',time: 3});
						$('#flexme').flexReload();
					} else {
						$.dialog.notice({width: 150,content: '数据清空失败',icon: 'error',time: 3});
					}
					});
			}
			});
}

//数据恢复
function revertData(){
	revertDataExcute('#flexme');
}

function revertDataInnerFile(){
	revertDataExcute('#innerfile');
}
function revertDataExcute(flexName){
	var obj=$(flexName);
	var path=check_selected('恢复的','path',obj);
		if(!path)return;
		$.dialog({
				content:'确定要将数据恢复吗?',
				icon:'warning',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var url=$.appClient.generateUrl({ESRecycleBin:'revertData'},'x');
					$.post(url,{path:path},function(data){
						if(data){
							$("input[name='path']").attr("checked",false);
							$.dialog.notice({width: 150,content: '数据恢复成功',icon: 'success',time: 3});
							obj.flexReload();
						} else {
							$.dialog.notice({width: 150,content: '数据恢复失败',icon: 'error',time: 3});
						}
						});
				}

			});
}

function createCodeFilter(){
$.ajax({
	    url:$.appClient.generateUrl({ESIdentify:'filter',status:status,strucid:strucid},'x'),
	    success:function(data){
	    	$.dialog({
	    		id:'artCreateCodeFilterPanel',
		    	title:'筛选数据',
	    		width: '50%',
	    	    height: '40%',
	    	   	fixed:true,
	    	    resize: false,
		    	content:data,
		    	okVal:'确定',
			    ok:function(){
			    	var form=$('#esfilter');
					var flag=form.validate();
					if(flag){
						var condition=filterValue();
						var url=$.appClient.generateUrl({ESIdentify:'createCode'},'x');
						$.post(url,{nodePath:nodePath,condition:condition},function(fileUrl){
							if(fileUrl.search(/failure/gi)==-1){
								var downFile=$.appClient.generateUrl({ESIdentify:'downFile',fileName:fileUrl});
								$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载二维码文件</a>'});
							}else{
								$.dialog.notice({content:fileUrl.replace(/failure\:/gi,''),time:3,icon:'error'});
							}
						});
					}
			    	return false;
			    },
			    init:function(){
		    			var form=$('#esfilter');
							form.autovalidate();
		    		},
			    cancelVal: '关闭',
			    cancel: true 
		    });
		    },
		    
		    cache:false
	});
}

/* 验证数据是否可以删除 |方吉祥 |20130609 */
function deleteItemValidate(checkboxObj)
{
	var cbol = checkboxObj.length,notice = false,linenumber = [];
	for(var ci=0; ci<cbol; ci++)
	{
		if(checkboxObj[ci].getAttribute('del') === 'false'){ // 不能删除标识为false
			
			linenumber.push(checkboxObj[ci].getAttribute('ln'));
			notice = true;
		}
	}
	
	if(notice){
		$.dialog.notice({icon : 'warning',content : '以下 '+ linenumber.length +' 条(序号：'+ linenumber.join(',') +')数据你无权限删除!',title : '3秒后自动关闭',time : 3});
	}
	
	return notice;
}
/* 验证数据是否可以删除   结束 */

/* 选中列表 */
function checkBox(checked, checkeds){
	
	if(!checked || !checkeds || !checkeds.length){
		return;
	}
	function onCheck(ed, checkeds){
		var cl = checkeds.length;
			for(var i=0; i<cl; i++)
			{		
				checkeds[i].checked = ed;
				var parent = checkeds[i].parentNode.parentNode.parentNode,cla = parent.className;
					cla = cla.indexOf('trSelected') === -1 ? cla : cla.replace(/trSelected/, '');
					parent.className = ed ? cla+' trSelected' : cla;
			}
			
	}
	
	if(checked.checked){
		
		onCheck(true, checkeds);
		
	}else{
		onCheck(false, checkeds);
	}
	
};
//查看打印报表，倪阳添加
var showAccountingReport = function() {
	var html = [];
	html.push('<table id="infomation"></table><script type="text/javascript">');
	html.push('$("#infomation").flexigrid({');
	html.push("url: $.appClient.generateUrl({ESArchiveLending:'getInfomation'},'x'),dataType: 'json',");
	html.push('colModel : [');
	html.push("{display: '序号', name : 'id', width : 40, align: 'center'}, {display: '打印状态', name : 'printStatus', width : 80,  align: 'center'},{display: '操作人', name : 'userName', width : 60,  align: 'center'},{display: '文件名称', name : 'infoName', width : 180,  align: 'center'},{display: '下载状态', name : 'downloadStatus', width : 60,  align: 'center'},{display: '下载地址', name : 'downurl', width : 160,  align: 'center'}],");
	html.push('title: "打印报表",');
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
    	title:'下载报表',
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

//liqiubo 20140519 加入flexme的flexGrid公用的数据刷新还原方法
function flexmeReset(){
	/** xiaoxiong 20140909 取消筛选时，判断分组条件是否存在，存在的话，将分组条件传递到后台 **/
	var $where={};
	if(conditions.length>0){
		$where.groupCondition=conditions;
	}
	$('#flexme').flexOptions({query:$where}).flexReload();
	
}

//-------------------- 选择用户 -------------------//
var checkedUser = null;
//选择用户窗口
$('#fuzr,#jianxr').live('click', function (){
	_selectUser.init();
	checkedUser = $(this);
});

//用户中文名写入输入框#双击某行
$('#user_list tr').live('dblclick',function (){
	_selectUser.select($(this));
	$.dialog.list._selectUser_.close();
});

var _userTree = {
	setting: {
		view: {
			dblClickExpand: true,
			showLine: false
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		async: {
			enable:true,
			type:'get',
			url:getUserTreeUrl,
			autoParam:["id=oid"]
		},
		callback: {
			onClick: function (event, nodeId, treeNode){
				var url = $.appClient.generateUrl({ESArchiveDestroy:'FindUserListByOrgid',oid:treeNode.id},'x');
				$("#user_list").flexOptions({url:url}).flexReload();
			}
		}
	}
};

function getUserTreeUrl(){
	return $.appClient.generateUrl({ESIdentify:'GetOrgList'},'x');
}

var _selectUser = {
	init : function (){
		$.getJSON(
			$.appClient.generateUrl({ESIdentify:'GetOrg'},'x'),
			function (nodes){
				var html = ['<div class="select_user_box">'];
				html.push('<div class="ztree org_tree" id="org_tree"></div>');
				html.push('<div class="user_list"><table id="user_list"></table></div>');
				html.push('</div>');
				$.dialog({
					id:'_selectUser_',
					title:'选择鉴定人员',
					content:html.join(''),
					padding:'0',
					cancelVal:'关闭',
					cancel:true
				});
				$.fn.zTree.init($('#org_tree'),_userTree.setting,nodes);
				// 用户列表
				$("#user_list").flexigrid({
					url:false,
					dataType: 'json',
					colModel : [
						{display: '序号', name : 'linenumber', width : 40, align: 'center'}, 
						{display: '选择', name : 'radio', width : 40, align: 'center'},
						{display: '姓名', name : 'userName', width : 80, align: 'center'},
						{display: '部门', name : 'orgName', width : 280, align: 'center'},
						{display: '职务', name : 'deptPost', width : 280, align: 'center'},
						{display: '联系方式', name : 'mobTel', width : 280,align: 'center'}
					],
					usepager: true,
					nomsg: '没有数据',
					useRp:true,
					width:640,
					height:440
				});
			},
			'json'
		);
		
	},
	select : function (that){
	
		var value = that.find('input[type="radio"]').val();
		var info = value.split('@');
		var une = info[1]; // 中文名
		checkedUser.parent().find('input[type="text"]').val(une);
		
	}
};
// -------------------- 选择用户结束 -------------------//
function generatePaperQuick(){
	var checkboxObj=$("input[name='path']:checked",$("#flexme"));
	var checkBoxLen=checkboxObj.length;
	//判断是否选择数据
	if(checkBoxLen==0){
		return false;
	}
	var params = new Array();
	checkboxObj.each(function(i){
		var trObj=$(this).closest('tr');
		val=$("#flexme").flexGetColumnValue(trObj,['relation']);
		if(""!=val){//这里判断是否已经组卷
		}else{
			var trObj=$(this).closest('tr');
			var obj = new Object();
			//obj['generat_mode']=obj.flexGetColumnValue(trObj,['generat_mode']);//获取组卷方式 判断是单项还是整体
			obj['stageId']=$("#flexme").flexGetColumnValue(trObj,['stageId']);//获取收集范围
			obj['id'] = $(this).val()//获取文件ID
			obj['nodePath'] = nodePath;
			params.push(obj);
		}
	});
	$.ajax({
		url:$.appClient.generateUrl({ESIdentify:'generatingAutomatic'},'x'),
		data:{params:params},
		type:'post',
		success:function(data){
			if(data){
				$.dialog.notice({content:'组卷成功！',time:3,icon:'succeed'});
				$("#flexme").flexReload();
			}
		}
	});
}
