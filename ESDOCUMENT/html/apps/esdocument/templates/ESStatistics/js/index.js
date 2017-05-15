$(document).ready(function(){	
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
	$("#statisticGrid").flexigrid({url :$.appClient.generateUrl({ESStatistics: 'findStatisticList'}, 'x'),
		dataType : 'json',
		colModel : [ 
		{display : '数据标识',name :'id',hide:true,width:30,align:'center'}, 
        {display : '序号',name : 'startNum',width : 30,align : 'center'}, 
	    {display : '<input type="checkbox" id="changeIdList">',name : 'ids',width : 15,align : 'center'}, 
		{display : '统计类型',name : 'statisticType',width : 50,align : 'center'},
	    {
			display : '统计方案名称',
			name : 'statisticName',
			metadata:'statisticName',
			width : 460,
			align : 'left'
		},{
			display : '执行',
			name : 'exec',
			metadata:'exec',
			width : 60,
			align : 'center'
		},{
			display : '修改',
			name : 'operate',
			width : 60,
			align : 'center'
		},{
			display : '删除',
			name : 'del',
			metadata:'del',
			width : 60,
			align : 'center'
		},{
			display : '查看',
			name : 'view',
			metadata:'view',
			width : 60,
			align : 'center'
		}],
		buttons : [ {
			name : '添加',
			bclass : 'add',
			onpress : add
		},{
			name : '删除',
			bclass : 'delete',
			onpress : batchDelete
		}],
		singleSelect:true,
		usepager : true,
		title : '统计方案管理',
		useRp : true,
		rp : 20,
		nomsg : "没有数据",
		showTableToggleBtn : false,
		pagetext : '第',
		outof : '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	var i=0;
	function add(){
			$.ajax({
		    url: $.appClient.generateUrl({ESStatistics:'selectStatisticsType'},'x'),
		    success:function(data){
		    	var dialog=$.dialog({
			    	id:'artAddPanel',
			    	title:'添加统计方案',	
		    	   	fixed:false,
		    	    resize:false,
		    	    padding:0,
			    	content:data,			    				    	
			    	okVal:'确定',
      			    ok:true,
      			    cancelVal: '关闭',
      			    cancel: true,
      			    ok:function(){
      			    	var radio=$("#statisticsTypeDiv").find("input[name='statisticsType']:checked");
      			    	if(radio.val()=="0"){
      			    		add0();
      			    	}else{
      			    		groupStatistics.add();
      			    	}
      			    }
			    });
			   },
			   cache:false
		});
	     }

	function add0(){
		$.ajax({
		    url: $.appClient.generateUrl({ESStatistics:'add'},'x'),
		    success:function(data){
		    	var dialog=$.dialog({
			    	id:'artAddPanel',
			    	title:'添加统计方案',	
		    	   	fixed:false,
		    	    resize:false,
		    	    padding:0,
			    	content:data,
			    	init : function(){
			    		$('#form_add').autovalidate();
				    },
			    	button:[
			    	{name:'上一步',
			    	callback:function(){
				    	return false;
			    	},
			    	focus: true,
			    	disabled:true
			    	},
			    	{name:'下一步',
			    	callback:nextbutton,
			    	focus:true
			    	},
			    	{name:'完成',
			    	callback:function(){
			    		return false;
			    	},
			    	focus: true,
			    	disabled:true
			    	}
			    	],
			    	cancel:function(){
				    	i=0;
				    	$("#statisticGrid").flexReload();
				    },
			    	cancelVal:'关闭'
			    });
			   },
			    cache:false
		});
	}

	    function operate(name,grid){
			$.ajax({
			    url:"<?php echo $esaction->generateUrl(Array('ESStatistics'=>'handle'),'x');?>",
			    success:function(data){
			    	$.dialog({
				    	id:'artOpreatePanel',
				    	title:'年报预览',
			    		width: '60%',
			    	    height: '80%',
			    	   	fixed:false,
			    	    resize:true,
	    				okVal:'确定',
	      			    ok:true,
	      			    cancelVal: '关闭',
	      			    cancel: true,
				    	content:data
				    });
				    },
				    cache:false
			});
	     }
	    //保存方案名称(第一步)
	    function saveTitle(id,title,obj){
	    	var oldTitle=$("input[name='oldTitle']").val();
			var url=$.appClient.generateUrl({ESStatistics:'saveTitle'},'x');
			$.post(url,{id:id,title:title,oldTitle:oldTitle,type:'0'},function(rt){
				if(!rt.success){
					//msg 方案名已经存在 或 保存数据异常
					$.dialog.notice({content:rt.msg , time:3,icon:'warning'});
					i --;
					return false;
				}
				id = rt.id;
				if(-1!=id){
					//第一步添加成功,可以进行第二步操作
					$("#hidden:hidden").val(id);
					//切换标签当前选项 以及显示对应不走的div
					var liObj = $("#mylist li");
					var listObj = $(".list");
		    		liObj.removeClass("selected");
					listObj.hide();
					liObj.eq(i).addClass("selected");
					listObj.eq(i).show();
					obj.button({name:"上一步",callback:function(){
									liObj.removeClass("selected");
									listObj.hide();
									liObj.eq(i-1).addClass("selected");
									listObj.eq(i-1).show();
									i--;
									/*var url=$.appClient.generateUrl({ESStatistics:'changeCollCurrStep'},'x');
										$.get(url,{id:id,currStep:i});*/
									if(i<=0){
										obj.button({name:'上一步',disabled:true});
									}
									if(0<i<3){
										obj.button({name:'下一步',callback:nextbutton,disabled:false});
									}
									if(i!=3){
										obj.button({name:'完成',disabled:true});
									}
									return false;
								}
					})
					
				}else{
					$.dialog.notice({content:'保存失败',time:2,icon:'error'});
				}	
			
			},'json');
			
	    }


	    //保存树节点(第二步)
	function saveNodes(id,treeType){
	   var zTree = $.fn.zTree.getZTreeObj("archives");//获取树对象
	   var nodes= zTree.getCheckedNodes();//获取选中的节点
	   var title = $("#form_add").find("input[name='title']").val();
	    	var data=[];
				for(var j=0;j<nodes.length;j++){//循环遍历选中的树节点，取到每个节点的Path和isParent属性值 //每个节点加入所属树类型
					var string={tree_id:nodes[j].id,isParent:nodes[j].isParent,treeType:treeType};
					data.push(string);
				}
				var url=$.appClient.generateUrl({ESStatistics:'saveTreeNodes'},'x');
				$.post(url,{id:id,treeType:treeType,data:data,title:title},function(result){
					var url=$.appClient.generateUrl({ESStatistics:'getStatisticItems'},'x');
					$.post(url,{id:id},function(result){
						var liObj = $("#mylist li");
						var listObj = $(".list");
						liObj.removeClass("selected");
						listObj.hide();
						liObj.eq(i).addClass("selected");
						listObj.eq(i).show();
						$("#setRule").html('');
						var tObj=$(".hDivBox table:eq(0)",$('#esrules'));
						var trObj=$(tObj).children('thead').children('tr');
							trObj.html('');
						var str='<th axis="col0" align="center"><div style="width: 245px; text-align: center;">文件类型</div></th>';
					    var html='<tbody>';
					    	html+='<tr><td><div style="width: 200px; text-align: left;">列名称(双击列修改名称)</div></td>';
							for(var m=1;m<=result.count;m++){
								if(m==1){
									str+='<th axis="col'+m+'" align="center"><div style="width: 200px; text-align: center;">列'+m+'</div></th>';
							    }else{
							    	str+='<th axis="col'+m+'" align="center"><div style="width: 200px; text-align: center;"><input type="checkbox" name="checkbox" value='+m+' />列'+m+'</div></th>';
							    }
								if(result.head.length>0){
									html+='<td><div style="width: 200px; text-align: left;" class="editTitle" >'+result.head[m-1]+'</div></td>';
								}else{
									html+='<td><div style="width: 200px; text-align: left;" class="editTitle" >列'+m+'</div></td>';
								}
							}
								html+='<tr>';
							trObj.append(str);
						for(var j=0; j < result.data.length;j++){
							var t=result.data[j];
							if((j+1)%2==0){
								html+='<tr>';
							}else{
								html+='<tr class="erow">';
							}
							html+='<td align="center"><div style="width: 245px; text-align: " >'+t.c0.name+'</div></td>';
							for(var m=1;m<=result.count;m++){
								if(t.c0.isnode!="1"){
										if(t['c'+m].nodeType){
											if(!t['c'+m].text){var text='未设置';}else{ var text=t['c'+m].text;}
											var itemId=t['c'+m].id
											var nodeType = t['c'+m].nodeType;
										}else{
											if(!t['c'+m].text){var text='未设置';}
											var itemId=-1;
											var nodeType=treeType;
										}
										html+='<td align="center"><div style="width: 200px; text-align: left;cursor:pointer" treeId="'+t.c0.id+'" treeType="'+nodeType+'" itemId="'+itemId+'" onclick=javascript:getColumnShow(this);>'+text+'</div></td>';
								}else{
									html+='<td align="center"><div style="width: 200px; text-align: left;"></div></td>';
								}
							}
							html+='</tr>';
						}
						html+='</tbody>';
						$("#setRule").append(html);
						//列标题修改或添加时，鼠标划上加入标题显示整个列全值，避免文本太长，查看不全
						var tObjs=$('#setRule').find('tr td div');
						    tObjs.live('mouseover',function(){
							var text = $(this).text();
							$(this).attr('title',text);
						});

					},'json')
				});
	    }

	    //保存方案配置(第四步)
	    function saveOptions(id,obj,count){
	   		var liObj = $("#mylist li");
			var listObj = $(".list");
	    	var url=$.appClient.generateUrl({ESStatistics:'getStatisticItems'},'x');
				$.post(url,{id:id},function(result){
					liObj.removeClass("selected");
					listObj.hide();
					liObj.eq(i).addClass("selected");
					listObj.eq(i).show();
					$("#showRule").html('');
				    var tObj=$("#eslayout table:eq(1)");
						var trObj=$(tObj).children('thead').children('tr');
							trObj.html('');
						var str='<th axis="col0" align="center"><div style="width: 245px; text-align: center;">文件类型</div></th>';
					    var html='<tbody>';
					    	html+='<tr><td><div style="width: 245px; text-align: left;">列名称</div></td>';
							for(var m=1;m<count;m++){
								str+='<th axis="col'+m+'" align="center"><div style="width: 200px; text-align: center;">列'+m+'</div></th>';
								html+='<td><div style="width: 200px; text-align: left;">'+result.head[m-1]+'</div></td>';
							
							}
					trObj.append(str);
					html+='</tr>';
					for(var j=0; j < result.data.length;j++){
						var t=result.data[j];
						if((j+1)%2==0){
							html+='<tr>';
						}else{
							html+='<tr class="erow">';
						}
						html+='<td align="center"><div style="width: 245px; text-align: " >'+t.c0.name+'</div></td>';
						
						for(var m=1;m<count;m++){
							if(t['c'+m]){
							if(!t['c'+m].text){var text='';}else var text=t['c'+m].text;
								html+='<td align="center"><div style="width: 200px; text-align: left;">'+text+'</div></td>';
							}else{
								html+='<td align="center"><div style="width: 200px; text-align: left;"></div></td>';
							}
						}
						html+='</tr>';
					}
					html+='</tbody>';
					$("#showRule").append(html);
					
					$("#classNode").attr("checked",result.classNode == 1 ? true :false);
					$("#dataNode").attr("checked",result.dataNode == 1 ? true :false);
					$("#isLayout").attr("checked",result.isLayout == 1 ? true :false);
					$("#isSummary").attr("checked",result.isSummary == 1 ? true :false);
					$("#pic").val(result.pic);
					
					//列标题修改或添加时，鼠标划上加入标题显示整个列全值，避免文本太长，查看不全
					var tObjs=$('#showRule').find('tr td div');
					    tObjs.live('mouseover',function(){
						var text = $(this).text();
						$(this).attr('title',text);
					    });
					},'json')							
			/*liObj.removeClass("selected");
			listObj.hide();
			liObj.eq(i+1).addClass("selected");
			listObj.eq(i+1).show();*/

			//设置下一步按钮不可用
			obj.button({name:'下一步',
	    	callback:function(){
		    	return false;
	    	},
	    	focus: true,
	    	disabled:true},
	    	//设置完成按钮可用
	    	{name:'完成',
	    	callback:function(){
	    		if(!justRuleExists(id)){
	    			return false;
	    		}
	    		var data={};
	    		var packetObj=$("#mylist");
	    		
	    		//记录日志需要添加的
	    		var names=[];
	    		var classNodeName = $("[name='classNode']:checked",packetObj).attr('class');//分类节点
	    		var dataNodeName = $("[name='dataNode']:checked",packetObj).attr('class');//数据节点
	    		var isLayoutName = $("[name='isLayout']:checked",packetObj).attr('class');//缩进
	    		var isSummaryName = $("[name='isSummary']:checked",packetObj).attr('class');//汇总统计
	    		names.push(classNodeName+'|'+dataNodeName+'|'+isLayoutName+'|'+isSummaryName);
	    		names=names.join(',');
	    		//记录日志需要添加的
	    		
				var classNodeVal=$("[name='classNode']:checked",packetObj).val();//分类节点
				var dataNodeVal=$("[name='dataNode']:checked",packetObj).val();//数据节点
				var isSummaryVal=$("[name='isSummary']:checked",packetObj).val();//汇总统计
				var isLayoutVal=$("[name='isLayout']:checked",packetObj).val();//缩进
				classNodeVal=classNodeVal?classNodeVal:0;
				dataNodeVal=dataNodeVal?dataNodeVal:0;
				isSummaryVal=isSummaryVal?isSummaryVal:0;
				isLayoutVal=isLayoutVal?isLayoutVal:0;
				var pic = $("#pic").val();
				 var title = $("#form_add").find("input[name='title']").val();
	    		data={title:title,statisticId:id,classNode:classNodeVal,dataNode:dataNodeVal,isSummary:isSummaryVal,isLayout:isLayoutVal,pic:pic};
	    					var url=$.appClient.generateUrl({ESStatistics:'saveOptions'},'x');
	    		    		$.post(url,{data:data,names:names},function(msg){
	    		    			if(msg == "success"){
	    		    				i=0;
	    		    				$.dialog.notice({icon:'success',content:"保存成功！",time:3});
	    		    				$("#statisticGrid").flexReload();
	    		    				obj.close();
	    		    			}else{
	    		    				$.dialog.notice({icon:'error',content:msg,time:3});
	    		    			}
	    		    		})
		    	return false;
	    	},
	    	focus: true}
	    	);
			
		}
		//下一步按钮回调函数	
		function nextbutton(){
			var liObj = $("#mylist li");
			var listObj = $(".list");
			var id=$("#hidden:hidden").val();//统计主项id
			if(!id)id=-1;
	    		//第一步保存方案名称
	    		i+=1;
				if(1==i){
					var title=$("input[name='title']").val();
					//添加输入值的验证
					var form = $('#form_add');
					if(!title.trim()){
						$.dialog.notice({icon:'warning',content:'方案名称不能为空',time:2});
						i-=1;
						return false;
					}
					if (!form.validate()) {
						$.dialog.notice({icon:'warning',content:'方案名称在30个字符(15个汉字)内,且不能有特殊字符！',time:2});
						i-=1;
						return false;
					}
					
					//如果没有树节点那么加上标识
					var isHave = $("#nodeTree").attr("nodeTree");
					if("noHave"==isHave){
						$.dialog.notice({icon:'warning',content:'没有需要统计的数据！',time:2});
						i-=1;
						return false;
					}
					//第一步保存统计标题
					saveTitle(id,title,this);
				}

				if(2==i && id){
					//保存第二步树节点
					var zTree = $.fn.zTree.getZTreeObj("archives");//获取树对象
					var nodes= zTree.getCheckedNodes();//获取选中的节点
					if(nodes.length==0){//判断是否有选中节点
						$.dialog.notice({icon:'warning',content:'请选择统计的树节点',time:2});
						i-=1;
						return false;
					}
					var treeType = $('#treeType').val();
					//添加树切换 根据treeType
					saveNodes(id,treeType);
				}
				//第三步
				if(i>=3 && id){
					//添加输入值的验证
					var invalid = $('.invalid-text');
					if (invalid.length>0) {
						$.dialog.notice({icon:'warning',content:'列输入在40字符(20个汉字)内,且不能有特殊字符！',time:2});
						i-=1;
						return false;
					}
					
					var tObjs=$('#setRule').find('tr:eq(0) td');
					var count=tObjs.length;
                    titles=[];
					for(var n=1;n<count;n++){
						var temp=tObjs.eq(n).text().replace(/\;/g,'');
						titles.push(temp);
					}
					var title=titles.join(';');
					var url=$.appClient.generateUrl({ESStatistics:'saveColTitleAndColCount'},'x');
					var data={id:id,title:title,count:count-1};
					var obj =this;
					//保存方法
					$.post(url,{data:data},function(result){
						saveOptions(id,obj,count);
					});
					
				}
				return false;
		}

	 //编辑
	 function modifyStatistic(id,name)
	 {
		$.ajax({
	    url: $.appClient.generateUrl({ESStatistics:'modify'},'x'),
	    type:"POST",
	    data:'id='+id+'&name='+name,
	    success:function(data){
	    	var dialog=$.dialog({
		    	id:'artModifyPanel',
		    	title:'修改统计方案',	//wanghongchen 20140820 添加title
	    	   	fixed:false,
	    	    resize:false,
	    	    padding:0,
		    	content:data,
		    	button:[
		    	{name:'上一步',
		    	callback:function(){
		    	
			    	return false;
		    	},
		    	focus: true,
		    	disabled:true
		    	},
		    	{name:'下一步',
		    	callback:nextbutton,
		    	focus:true
		    	},
		    	{name:'完成',
		    	callback:function(){
		    		return false;
		    	},
		    	focus: true,
		    	disabled:true
		    	}
		    	],
		    	init : function(){
		    		$('#form_add').autovalidate();
			    	},
		    	cancel:function(){i=0},
		    	cancelVal:'关闭'
		    });
		   },
		    cache:false
		});
	 }
	
	 //xiewenda 查看统计方案
	 $(".showbtn").live('click',function(){
		 var thisRow = $(this);
		 var id = thisRow.attr('showId');
			 var statisticType=$(this).closest('tr').find('td[colname="statisticType"]').find('div span').attr("name");
			if(statisticType=="0"){
				 $.ajax({
					    url: $.appClient.generateUrl({ESStatistics:'show',id:id},'x'),
					    success:function(data){
					    	var dialog=$.dialog({
						    	id:'artShowPanel',
						    	title:'查看面板',
					    	   	fixed:false,
					    	   	padding:'0px 0px',
					    	    resize:false,
						    	content:data,
						    	cancel:true,
						    	cancelVal:'关闭'
						    });
					    	var tObjs=$('#showRule').find('tr td div');
						    tObjs.live('mouseover',function(){
								var text = $(this).text();
								$(this).attr('title',text);
						    });
					    },
						   cache:false
					});	 
			}
			if(statisticType=="1"){			
				groupStatistics.groupShow1(id);
			}
	 });
	 //xiewenda  单个删除按钮
	 $(".delbtn").live('click',function(){
		 var thisRow = $(this);
		 var id = thisRow.attr('delId');
		 $.dialog({
		 		content:'确定要删除吗?',
				ok:true,
				okVal:'确定',
				cancel:true,
				cancelVal:'取消',
				ok:function()
				{
					var url=$.appClient.generateUrl({ESStatistics:'delStatisticAndItems'},'x');
					$.post(url,{id:id},function(msg){
						if(msg=="success"){
							$.dialog.notice({width: 150,content: '数据删除成功',icon: 'success',time: 3});
							$("#statisticGrid").flexReload();
						} else {
							$.dialog.notice({width: 150,content: msg, icon: 'error',time: 3});
						}
					});
				}
		 	}); 
	 });
	 //xiewenda 修改方案
	 $(".editbtn").live('click',function(){
		var id= $(this).closest('tr').find('input[name="changeId"]').val();
		var name = $(this).closest('tr').find('td[colname="statisticName"]').find('div').html();
		$(this).closest('tr').append('<input type="hidden" name="edit" value="编辑"/>')
		var statisticType=$(this).closest('tr').find('td[colname="statisticType"]').find('div span').attr("name");
		if(statisticType=="0"){
			modifyStatistic(id,name);
		}
		if(statisticType=="1"){			
			groupStatistics.modifyStatistic(id,name);
		}
	 });
	 //xiewenda 打印方案
	 $(".printbtn").live('click',function(){
		 var id = $(this).attr("printId");
		 var statisticType=$(this).closest('tr').find('td[colname="statisticType"]').find('div span').attr("name");			
		 exeCollection(id,statisticType);
	 });
	 
	 //生成excel文件
	 function exeCollection(id,statisticType)
	 {
		var cont = "<select>"
				+"<option value='2003'>Excel</option>"
				+"<option value='pdf'>PDF</option>"
				+"<option value='rtf'>RTF</option>"
			+"</select>";
	 	 $.dialog({
	 	 	id:'artExePanel',
	 		content:cont,
			title:'选择打印的版本',
			ok:true,
			width:'180px',
			okVal:'确定',
			cancel:true,
			cancelVal:'取消',
			ok:function()
			{
				var version=$('select').val();
				if(!version){$.dialog.notice({content:'请选择打印的版本',time:3,icon:'warning'});return false;}
				var url=$.appClient.generateUrl({ESStatistics:'exeStatistic'},'x');
				$.dialog.notice({time:3,content: '正在进行统计，稍后请很据消息提醒下载'});
				$.post(url,{id:id,version:version,statisticType:statisticType},function(data){
	 				var json = eval('(' + data + ')');
	 				if(json.msg == "success"){
	 					$.dialog.notice({width: 150,content:"统计成功，请到消息中下载！",icon:'succeed',time: 3});
	 				} else {
	 					$.dialog.notice({width: 150,content:json.msg,icon:'error',time: 3});
	 				}
	 			});
			}
	 	})
	 }
	 $('.editTitle').live('dblclick',function(){
		 	var obj = $(this);
		    $("#tooltip").remove();
		 	if($('input',obj).length>0){return;}
		 	var html=obj.text();
		 	var input=document.createElement('input');
		 	input.style.width='190px';
		 	input.style.height='20px';
		 	input.value=html;
		 	obj.empty().append(input);
		 	$(input).focus();
		 	$(input).select();
		 	$(input).attr("verify","desc/40/1/0");
		 	$(input).bind('blur',function(){
		 		if(!validateOnChange(this)){
				$.dialog.notice({icon:'warning',content:'列输入在40个字符(20个汉字)内,且不能有特殊字符！',time:3});
				return false;
		 	 	}else{
		 	 	obj.html(this.value);
		 	 	}
		 	 }); 
	 });
	 function batchDelete(){
		var cbxList = $("#statisticGrid input[name='changeId']:checked");
		if(cbxList.length == 0){
			$.dialog.notice({icon:'warning',content:'请选择要删除的数据!',time:3});
		}else{
			$.dialog({
				title:'警告',
				content:'确定删除勾选数据？',
				cancel:true,
				ok:function(){
					var ids = "";
					cbxList.each(function(){
						ids += $(this).val() + ",";
					});
					ids = ids.substring(0,ids.length-1);
					$.ajax({
						url:$.appClient.generateUrl({ESStatistics:'batchDelete'}),
						type:'post',
						data:{"ids":ids},
						success:function(msg){
							if(msg=='success'){
								$.dialog.notice({icon:'succeed',content:'数据删除成功!',time:3});
								$("#statisticGrid").flexReload();
							}else{
								$.dialog.notice({icon:'error',content:msg,time:3});
							}
						}
					});
				}
			});
		}
	 }
     
	 //全选、取消全选
	 $("#ids").live('click',function(){
		 if($(this).attr('checked')){
		 	$('.cbx').attr('checked',true);
		 }else{
		 	$('.cbx').attr('checked',false);
		 }
	 });
		//引入校验方法
		function validateOnChange(e)
		{
			var $e = $(e);
			var value=$e.val();
			var verify=$e.attr("verify");
			if(verify){
			var p=verify.split('/');
			var reg=p[0];//正则
			if(reg == 'bool'){
				return true;
			}
			var len=p[1];//value值长度
			var isnull=p[2];//是否为空
			var dolength=p[3];//小数点的位数
			eval("var freg = /^\\d+\\.\\d{"+dolength+"}$/;");
			/** guolanrui 20140731 修改原来的浮点型的正则表达式 BUG：207 **/
			
			var msg='';
			switch(reg)
			{
				case 'text': msg='格式必须为文本类型';reg = /\S+/i;break;
				case 'date-': msg='格式必须为日期类型，如：20120101';reg = /^(?:(?!0000)[0-9]{4}(?:(?:0[1-9]|1[0-2])(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])(?:29|30)|(?:0[13578]|1[02])31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)0229)$/i;break;
				case 'date':  msg='格式必须为日期类型，如：2012-01-01';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/i;break;
				case 'time':  msg='格式必须为时间类型，如：2012-01-01 00:00:00';reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) (?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])$/i;break;
				case 'number':	 msg='格式必须为整数类型';reg = /^\d+$/i;break;
				case 'floatOld':  msg='格式必须为浮点类型且必须有'+dolength+'位小数';reg =freg;break;
				case 'float': eval("var fregNew = /^\\d+(\\.\\d{0,"+dolength+"})?$/;"); msg='格式为浮点类型且最多有'+dolength+'位小数';reg =fregNew;break;
				//gengqianfeng 20140913 添加邮箱手机号验证
				case 'email': msg='格式必须为邮箱类型， 如: example@email.com'; reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; break;
				case 'mobile': msg='格式必须为手机号类型，如：18612345678';reg=/^1[3|4|5|8][0-9]\d{8}$/;break;
				case 'special': msg='该输入项不包含特殊字符，如：下划线、等号；（中英文）括号、分号、顿号、逗号、句号、双引号、小括号以及（英文）中括号、横杠、斜杠、反斜杠等';reg=/^([\u4e00-\u9fa5]|[a-zA-Z0-9])+$/;break;
				//guolanrui 20140917 添加备注，描述类正则表达式
				case 'description': msg='该输入项只能由中文、英文、数字、下划线、等号；（中文）括号、分号、顿号；（中英文）逗号、句号、双引号、小括号以及（英文）中括号、横杠组成!';reg = /^[a-zA-Z0-9\u4e00-\u9fa5_，。：；【】《》“”""-=,.()（）、\[\] ]*[^<>]$/;break;
				case 'desc': msg='该输入项只能由中文、英文、数字、下划线、等号；（中文）双引号、括号、分号、顿号；（中英文）逗号、句号、小括号以及（英文）中括号、横杠组成!';reg = /^[a-zA-Z0-9\u4e00-\u9fa5_，。：；【】《》“”\-=,.()（）、\[\] ]*$/;break;
				default:
					break;
			}

	        if(isnull==1 && (value=='' || value=='undefined')){
	    		
	    		if(e.type=='select-one' && $.browser.msie && $.browser.version <= 7.0){
	    		var dObj=$e.parent('div');
	    			if(dObj.length==0){
	    				var div=document.createElement('div');
		    			var span=$e.siblings('span')[0];
		    			div.style.width="162px";
		    			div.style.height="22px";
		    			div.style.float="left";
		    			div.style.border="2px #DD0000 solid";
		    			$e.appendTo(div);
	    				$(span).after(div);
	    			}else{
	    				dObj.css('border','2px #DD0000 solid');
	    			}
	    		}
	    		$e.addClass("invalid-text");
	        	$e.attr('title','此项不能为空');
	        	return false;
	        }
	        if(value!=''){
	        	var strlength =value.replace(/[^\x00-\xff]/g,'aa').length; //字符长度 一个汉字两个字符
	        	if(strlength > len && len > 0){
	        		
	        		$e.addClass("invalid-text");
	        		var charLen = (len%2==0)?(len/2):((len-1)/2);
//	        		$e.attr('title','数据长度不正确');
	        		/** guolanrui 20140731 修改数据长度大于最大长度时的提示消息BUG：211 **/
	        		$e.attr('title','数据长度最大为'+len+'个字符（'+charLen+'个汉字）');
	        		return false;
	        	}  
	    		if(value.search(reg)==-1){
	        		$e.addClass("invalid-text");
	        		$e.attr('title',msg);
	        		return false;
	        	}
	        }
			$e.removeClass('invalid-text');
			if(e.type=='select-one' && $.browser.msie && $.browser.version <= 7.0 && $e.parent('div').length > 0){ $e.parent('div').css('border','');}
			$e.attr('title','');
			return true;
			}
		}

	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#eslist").position().top;
		var flex = $("#statisticGrid").closest("div.flexigrid");
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
	
	sizeChanged();
	// 全选
	$("#changeIdList").die().live('click',function(){
		$("input[name='changeId']").attr('checked',$(this).is(':checked'));
	});
});

/**
obj 当前点击的对象
path 当前节点path
sId 节点对应的结构ID
ID 当前列的ID
colNo 当前的列号
*/
function getColumnShow(obj){
    var treeId=$(obj).attr('treeId');
    var treeType=$(obj).attr('treeType');
    var itemId=$(obj).attr('itemId');
	$.ajax({
	    url:$.appClient.generateUrl({ESStatistics:'setRules',treeId:treeId,itemId:itemId,treeType:treeType},'x'),
	    success:function(data){
	    	var ruleDialog=$.dialog({
		    	id:'artColumnShowPanel',
		    	title:'规则设置',
	    		width: '500px',
	    	    height: '270px',
	    	   	fixed:false,
	    	   	padding:0,
	    	    resize:true,
				okVal:'节点保存',
  			    ok:function(){
  			    	var id=$("#hidden:hidden").val();
  			    	var identityObj=$("input[name='countIdentity']");
  			    	var countObj=$("input[name='countObj']").val();
  			    	var countIdValue=identityObj.val();
  			    	if(!countIdValue){
  			    		countObj.attr('title','此项不能为空').css('border',"1px solid red ");
  			    		return false;
  			    	}
  			    	obj.innerHTML=countIdValue;
  			    	var index=$(obj).parent('td').index();
  			    	var packetObj=$("#packet");
					var fieldValue=$("[name='countField'] option:selected",packetObj).val();
					var typeValue=$("[name='countType'] option:selected",packetObj).val();
					var textareaVal=$("#hcond",packetObj).val();
					var cncondition = $("textarea").val();
					var data={};
					var title = $("#form_add").find("input[name='title']").val();
					data={title:title,countObj:countObj,countIdentity:countIdValue,countField:fieldValue,countType:typeValue,condition:textareaVal,treeId:treeId,treeType:treeType,itemId:itemId,statisticId:id,colNo:index,cncondition:cncondition,encondition:textareaVal};
					var url=$.appClient.generateUrl({ESStatistics:'saveRules'},'x');
					$.post(url,{data:data},function(msg){
						if(msg=="success"){
							$.dialog.notice({icon:'success',content:"保存成功！",time:3});
						}else{
							$.dialog.notice({icon:'error',content:msg,time:3});
						}
					});
  			    },
  			    cancelVal: '关闭',
  			    cancel: true,
		    	content:data,
		    	//wanghongchen 20140820 添加删除按钮，删除规则
		    	button:[{
					name:"删除",
					callback:function(){
						var id=$("#hidden:hidden").val();
						var index=$(obj).parent('td').index();
						var data={countIdentity:"",countField:"",countType:"",condition:"",treeId:treeId,treeType:treeType,itemId:itemId,statisticId:id,colNo:index,cncondition:"",encondition:""};
						var url=$.appClient.generateUrl({ESStatistics:'saveRules'},'x');
						$.post(url,{data:data},function(result){
							obj.innerHTML="未设置";
						});
					}
				}/*,{
					//wanghongchen 20140920  添加结构保存按钮
					name:"结构保存",
					callback:function(){
						var id=$("#hidden:hidden").val();
      			    	var countObj=$("input[name='countIdentity']");
      			    	var countIdValue=countObj.val();
      			    	if(!countIdValue){
      			    		countObj.attr('title','此项不能为空').css('border',"1px solid red ");
      			    		return false;
      			    	}
      			    	var index=$(obj).parent('td').index();
      			    	var packetObj=$("#packet");
						var fieldValue=$("[name='countField'] option:selected",packetObj).val();
						var typeValue=$("[name='countType'] option:selected",packetObj).val();
						var textareaVal=$("#hcond",packetObj).val();
						var cncondition = $("textarea").val();
						var data={};
						data={struSet:"yes",countIdentity:countIdValue,countField:fieldValue,countType:typeValue,condition:textareaVal,path:path,sId:sId,collId:id,ID:ID,colNo:index,cncondition:cncondition,encondition:textareaVal};
						var url=$.appClient.generateUrl({ESStatistics:'saveRules'},'x');
						$.post(url,{data:data},function(result){
							$(obj).closest("table").find("tr").each(function(){
								var tdivObj = $(this).find("td:eq("+index+") div") 
								if(tdivObj.attr("sid") == sId){
									tdivObj.html(countIdValue)
								}
							});
						});
					}
				}*/]
		    });
		  },
	  cache:false
	});
}
function justRuleExists(id){
	var flag = true;
	$.ajax({
		type:'POST',
	    url:$.appClient.generateUrl({ESStatistics:'justRuleExists'},'x'),
	    data:{statisticId:id},
	    async:false,  
	    success:function(msg){
	    	if(msg == "false"){
				$.dialog.notice({icon:'warning',content:"统计规则未设置，请返回上一步设置规则！",time:3});
				flag =false;
			}else{
				flag =true;
			}
	    },
	    cache:false
	});
	return flag;
}
