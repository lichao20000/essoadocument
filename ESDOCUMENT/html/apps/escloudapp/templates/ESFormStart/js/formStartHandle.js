/** 表单发起相关处理方法 **/
var formStartHandle = {
		showMsg: function(msg, type){
			if(type == '1'){
				$.dialog.notice({icon : 'succeed',content : msg,title : '3秒后自动关闭',time : 3});
			} else if(type == '2'){
				$.dialog.notice({icon : 'error',content : msg,title : '3秒后自动关闭',time : 3});
			} else {
				$.dialog.notice({icon : 'warning',content : msg,title : '3秒后自动关闭',time : 3});
			}
		},
		toFormStartPage: function(formid,startFrom){//formid:是表单ID，startFrom：是启动流程的应用的英文名，为了区别利用流程是从检索启动还是从新建协同启动
			$.post($.appClient.generateUrl({ESFormStart : 'showMyForm'}, 'x')
	    			,{formid:formid}, function(res){
	    				var json = eval('(' + res + ')');
	    				if(null != json.message){
	    					formStartHandle.showMsg(json.message, '3');
	    					return ;
	    				}
	    				formStartHandle.realToFormStartPage(json.formId, json.wfModelId, json.formName, json.buttons, json.actionId, json.actionSize, json.extjs, json.relationBusiness,startFrom,json.comboIDs,json.gridComBoIDs) ;
			});
	},
	realToFormStartPage: function(formId, wfModelId, formName, buttons, actionId, actionSize, extjs, relationBusiness,startFrom,comboIDs,gridComBoIDs){
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormStart : 'formStartPage'},'x'),
	        data: {formId:formId, wfModelId:wfModelId, actionId:actionId, actionSize:actionSize, extjs:extjs, relationBusiness:relationBusiness,startFrom:startFrom,comboIDs:comboIDs,gridComBoIDs:gridComBoIDs},
		    success:function(data){
			    	$.dialog({
			    		id:'formStartDialog',
				    	title:'启动流程['+formName+']',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:760,
						height:460,
						cancelVal : '关闭',
						cancel : function(){
							Ext.getCmp('formBuilderPanel').destroy();
						},
					    content:data,
					    button:eval('['+buttons+']')
				    });
		    },
		    cache:false
		});
	},
	formStartBeforeSet: function(wfIdentifier, stepId){
		/** guolanrui 20140724 给表单添加完整性验证 BUG:50 **/
		if(!Ext.getCmp('formBuilderPanel').findByType('form')[0].form.isValid()){
			formStartHandle.showMsg('表单未通过验证，请重新填写表单后再进行此操作！', '3');
			return;
		}
		
//		alert(Ext.getCmp('formBuilderPanel').findByType('form')[0].form.isValid());
		$.ajax({
			type:'POST',
	        url : $.appClient.generateUrl({ESFormStart : 'formStartHandlePage'},'x'),
	        data: {wfIdentifier:wfIdentifier, stepId:stepId},
		    success:function(data){
			    	$.dialog({
			    		id:'formStartHandleDialog',
				    	title:'处理',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:400,
						height:100,
					    content:data,
					    okVal : '确定',
						ok : true,
						cancelVal : '关闭',
						cancel : true,
						ok : function() {
							formStartHandle.formStart() ;
						}
				    });
		    },
		    cache:false
		});
	},
	//选择决策值被修改时 调用方法
	checkAction: function(aId, aName){
		if($('#formStartPage').attr('actionid') != aId){
			$('#formStartPage').attr('actionid', aId) ;
			$('#nextStepOwer').attr('name', '') ;
			$('#nextStepOwer').val('') ;
		}
	},
	selectWfOwner: function(){
		// longjunhao 20141017 add 获取页面form的值
		var formData = $('#formBuilderPanel form:first').serialize();
		$.ajax({
		   	  type:'POST',
			  url:$.appClient.generateUrl({ESFormStart : 'getStepOwner'},'x'),
			  data:{
				  formData : formData,
				  wfModelId:$('#formStartPage').attr('wfmodelid'),
				  formId:$('#formStartPage').attr('formid'),
				  wfId:$('#formStartPage').attr('wfId'),
				  dataId:$('#formStartPage').attr('dataid'),
				  actionId:$('#formStartPage').attr('actionid')
			  }    		  
			  ,success :function(res){
		        	var json = eval('(' + res + ')');
				    var wfModelId = json.wfModelId;  
				    var findNextStep = json.findNextStep;
				    var nextStepOwner = json.nextStepOwner; 
				    if(nextStepOwner == ''){
					    formStartHandle.showMsg('没有找到流程的下一步处理人！', '3');
					    return;
				    }
//				    for(var i=0;i<nextStepOwner.length;i++){
//				        addStepOwnerToShowStepOwnerWin(nextStepOwner[i]) ;
//				    }  
				    formStartHandle.realSelectWfOwner(nextStepOwner) ;
				    $('#formStartPage').attr('actionId',json.actionId) ;
	          },error: function(){
	        	  formStartHandle.showMsg('获取下一步处理人出错！', '2');
	          }
	       });
	},
	realSelectWfOwner: function(nextStepOwner){
		$.ajax({
		   	  type:'POST',
			  url:$.appClient.generateUrl({ESFormStart : 'selectWfOwnerPage'},'x'),
			  data:{nextStepOwner:nextStepOwner}    		  
			  ,success :function(data){
				  $.dialog({
			    		id:'selectWfOwnerDialog',
				    	title:'选择下一步处理人',
				    	modal:true, //蒙层（弹出会影响页面大小） 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    lock : true,
						opacity : 0.1,
						padding: '0px',
						width:400,
						height:100,
					    content:data,
					    okVal : '确定',
						ok : true,
						cancelVal : '关闭',
						cancel : true,
						ok : function() {
							formStartHandle.selectWfOwnerAction();
						}
				    });
	          },
	          cache:false
	       });
	},
	//下一步处理人全选功能实现
	autoCheckAllChild: function(parentObjId){
	  	  $('#'+parentObjId+' input').attr('checked',$('#'+parentObjId+'_all').attr('checked')=='checked') ;
  	},
  	selectWfOwnerAction: function(){
  		  var selectUsers = ''; 
	   	  var selectUserNames = ''; 
	   	  var currentUserId = $('#nextStepOwners').attr('currentUserId') ;
	   	  var $chkarray = $("#nextStepOwners").find("input[name=\'"+currentUserId+"\']:checked");
	   	  var splitStepId ;
	   	  var tempUsers = '';
	   	  $chkarray.each(function(index){                     
	   		var $item = $chkarray.eq(index) ;
    	     if($item.attr('text')){                 
    	    	splitStepId = $item.attr('stepid');
  				/** 去掉重复用户 **/
  				if((';'+tempUsers).indexOf(';'+$item.attr('value')+';')==-1){
  	  				tempUsers += $item.attr('value') + ';' ;
	  	  			selectUserNames = selectUserNames + $item.attr('text') + ';' ;
  				}                                   
    	     }
    	  });
  		  if(tempUsers !=''){
  			 selectUsers=splitStepId+':'+tempUsers+'-';
  		  }
	      
//	   	  var allNextStepOwnerCheckBoxs = document.getElementById("nextStepOwners").getElementsByTagName('input');
//	  	  if(allNextStepOwnerCheckBoxs.length>0){
//	  	  		var splitStepId ;
//	  	  		var tempUsers = '';
//	  	  		for(var i=0;i<allNextStepOwnerCheckBoxs.length;i++){
//	  	  			alert(allNextStepOwnerCheckBoxs[i].stepid);
//	  	  			if(allNextStepOwnerCheckBoxs[i].checked && allNextStepOwnerCheckBoxs[i].text!=undefined){
//	  	  				splitStepId = allNextStepOwnerCheckBoxs[i].stepId;
//	  	  				/** 去掉重复用户 **/
//	  	  				if((';'+tempUsers).indexOf(';'+allNextStepOwnerCheckBoxs[i].value+';')==-1){
//		  	  				tempUsers = tempUsers + allNextStepOwnerCheckBoxs[i].value + ';' ;
//			  	  			selectUserNames = selectUserNames + allNextStepOwnerCheckBoxs[i].text + ';' ;
//	  	  				}
//	  	  			}
//	  	  		}
//	  	  		alert(tempUsers);
//	  	  		if(tempUsers !=''){
//		  	  		selectUsers=splitStepId+':'+tempUsers+'-';
//	  	  		}
//	  	 }
 		 if(selectUsers==''){
 		 	formStartHandle.showMsg('您没有选择任何的处理人，不能进行此操作！', '3');
 		 	return;
 		 }
	 		 
 		 document.getElementById('nextStepOwer').name = selectUsers ;
	   	 if(($('#formStartPage').attr('actionsize')*1)>1){
	     	 if(selectUserNames!=''){
	     		$('#nextStepOwer').val(selectUserNames.substring(0,selectUserNames.length-1)) ;
	     	 }
	   	 } else {
	   		 /**wanghongchen 20140718 增加对销毁单的判断 **/
	   		 if ($('#mylist').attr('selectType') == 'send' || $("#Destroy_list_tbl").attr("selectType") == 'edit') {
	   			collaborativeHandle.formSend();
	   		 } else {
	   			 formStartHandle.formStart() ;
	   		 }
	   		art.dialog.list['formStartHandleDialog'].close();
	   	 }
  	},
	formStart: function(){
		var selectUsers = document.getElementById('nextStepOwer').name ;
		if(selectUsers == ''){
			formStartHandle.showMsg('没有下一步处理人，流程不能提交！', '3');
			return;
		}
		// longjunhao 20140830 注释掉else
//		if($('#formStartPage').attr('dataid')=='-1'){
			var postData = $("#"+$("#formBuilderPanel").find("form")[0].id).serialize();
			var relationBusiness = $('#formStartPage').attr('relationBusiness');
			$.ajax({    
				   type:'POST',
				   url:$.appClient.generateUrl({ESFormStart : 'startWorkflow'},'x'),
				   data:{postData:postData
					    ,wfModelId:$('#formStartPage').attr('wfmodelid')
					    ,formId:$('#formStartPage').attr('formid')
					    ,actionId:$('#formStartPage').attr('actionid')
					    ,dataList:$('#formStartPage').attr('dataList')
					    ,filePaths:$('#attachFileDataTable').attr('filePaths')
					    ,fileNames:$('#attachFileDataTable').attr('fileNames')
					    ,dataHaveRight:$('#formStartPage').attr('dataHaveRight')
					    ,selectUsers:selectUsers
				   		,condition:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchText').value)
				   		,applyDateCount:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataNumber').value)
				   		,readRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataReadRight').checked)
				   		,downLoadRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataDownLoadRight').checked)
				   		,printRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataPrintRight').checked)
				   		,lendRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataLendRight').checked)
				   },       
			       success :function(res){
	    			    var json = eval('(' + res + ')');
	    			    formStartHandle.showMsg(json.message, 1);
	    			    if(json.success){
	    			    	/** 清空档案车，只有是从检索发起的利用流程，才清空档案车 start **/
	    					if($('#formStartPage').attr('startFrom') == 'ESArchiveSeache'){//表示流程是从检索发起的
	    						$(".so-st").html(0);
	    						var divEle = document.getElementById("product_list");
	    						var childs = divEle.childNodes;
	    						for(var i=childs.length-1;i>= 0;i--){
	    							divEle.removeChild(childs[i]);
	    						}
	    						var h2Ele=document.createElement('h2');
	    						h2Ele.className='pl-null';
	    						var h2Text=document.createTextNode('没有审批申请单!');
	    						h2Ele.appendChild(h2Text);
	    						divEle.appendChild(h2Ele);
	    					}
	    					/** 清空档案车，只有是从检索发起的利用流程，才清空档案车 end **/
	    					/** 添加销毁单 wanghongchen 20140806**/
	    					if(relationBusiness == 'destroy'){
	    						$.ajax({
	    							url : $.appClient.generateUrl({ESArchiveDestroy : 'createDestroyFormForStart'},'x'),
	    							type : 'post',
	    							dataType : 'json',
	    							data : {oswfFormId:json.id,type:'start'},
	    							success : function(destroyRt){
	    								if(!destroyRt.success){
	    									formStartHandle.showMsg('销毁单添加失败！', '2');
	    								}
	    							}
	    						});
	    					}
	    			    }
	    			    /** wanghongchen 20140916 关闭窗口时判断窗口是否存在，防止在档案著录中直接发起销毁流程出错 **/
	    			    if(art.dialog.list['formStartDialog']){
	    			    	art.dialog.list['formStartDialog'].close();
	    			    }
	    			    if(art.dialog.list['archiveIdentify']){
	    			    	art.dialog.list['archiveIdentify'].close();
	    			    }
			       },
			       error: function(){
			        	formStartHandle.showMsg('工作流启动失败！', '2');
			        	art.dialog.list['formStartDialog'].close();
			       }
			});
//		} else {
//			$.ajax({
//				   type:'POST',
//	    		   url:'formBuilderManager.html?method=startSavedWorkflow',  
//	    		   data:{wfModelId:'<%=wfModelId%>',formId:'<%=formId%>',id:'<%=id%>',actionId:actionId,dataHaveRight:formStartDataHaveRight,selectUsers:selectUsers,htmlformvalue:htmlformvalue,wfId:'<%=wfId%>'
//	    		   		,condition:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchText').value)
//				   		,applyDateCount:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataNumber').value)
//				   		,readRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataReadRight').checked)
//				   		,downLoadRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataDownLoadRight').checked)
//				   		,printRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataPrintRight').checked)
//				   		,lendRight:(document.getElementById('helpSearchText')==undefined?"":document.getElementById('helpSearchDataLendRight').checked)
//	    		   },
//	    		   success :function(text){
//			    			     var json = mini.decode(text);
//	    		   				 if(json.success){
//				    			     mini.alert(json.message,'',function(btn){pageClose();});  
//				    			     //刷新待发/已发数据
//				    			     opener.reloadShowData();
//	    		   				 }else{
//		    		   				 mini.alert('工作流启动失败！','',function(btn){pageClose();});
//	    		   				 }
//			       },error:function(){
//			        	mini.alert('工作流启动失败！','',function(btn){pageClose();});
//			       }
//			});
//		}
	},
	
	/** guolanrui 20140611 增加协同的保存待发和查看流程图的function start * */
	// 保存待发的function
	myFormModelssaveWorkflow_event : function() {
		//TODO 获取权限的字符串，然后到后台去解析 start
		
		
		//TODO 获取权限的字符串，然后到后台去解析 end
		
		
		var postData = $("#" + $("#formBuilderPanel").find("form")[0].id).serialize();// form表单数据组成的字符串，后台需要解析
		var relationBusiness = $('#formStartPage').attr('relationBusiness');
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({ESFormStart : 'saveWorkflow'}, 'x'),
			data : {
				postData : postData
				// ,wfModelId:$('#formStartPage').attr('wfmodelid')
				,formId : $('#formStartPage').attr('formid')
				// ,actionId:$('#formStartPage').attr('actionid')
				,dataList : $('#formStartPage').attr('dataList')
				,filePaths : $('#attachFileDataTable').attr('filePaths')
				,fileNames : $('#attachFileDataTable').attr('fileNames')
				,dataHaveRight : $('#formStartPage').attr('dataHaveRight')
			},
			success : function(res) {
				var json = eval('(' + res + ')');
				if (json.success && json.state) {
					formStartHandle.showMsg('工作流保存成功！', 1);
					/** 清空档案车，只有是从检索发起的利用流程，才清空档案车 start **/
					if($('#formStartPage').attr('startFrom') == 'ESArchiveSeache'){//表示流程是从检索发起的
						$(".so-st").html(0);
						var divEle = document.getElementById("product_list");
						var childs = divEle.childNodes;
						for(var i=childs.length-1;i>= 0;i--){
							divEle.removeChild(childs[i]);
						}
						var h2Ele=document.createElement('h2');
						h2Ele.className='pl-null';
						var h2Text=document.createTextNode('没有审批申请单!');
						h2Ele.appendChild(h2Text);
						divEle.appendChild(h2Ele);
					}
					/** 清空档案车，只有是从检索发起的利用流程，才清空档案车 end **/
					/** 添加销毁单 wanghongchen 20140806**/
					if(relationBusiness == 'destroy'){
						$.ajax({
							url : $.appClient.generateUrl({ESArchiveDestroy : 'createDestroyFormForStart'},'x'),
							type : 'post',
							dataType : 'json',
							data : {oswfFormId:json.oswfFormId,type:'save'},
							success : function(destroyRt){
								if(!destroyRt.success){
									formStartHandle.showMsg('销毁单添加失败！', '2');
								}
							}
						});
					}
					art.dialog.list['formStartDialog'].close();
				} else {
					formStartHandle.showMsg('工作流保存失败！', 2);
					art.dialog.list['formStartDialog'].close();
				}
			}, 
			error : function() {
				formStartHandle.showMsg('工作流保存失败！', '2');
				art.dialog.list['formStartDialog'].close();
			}
		});
	},
	// 查看流程图的function
	myFormModelsshowWorkflowGraph_event : function() {
		//gaoyide 20141015
		var Sys = {}; 
        var ua = navigator.userAgent.toLowerCase(); 
        if (window.ActiveXObject) 
            Sys.ie = ua.match(/msie ([\d.]+)/)[1]; 
        //如果浏览器是IE8及IE8一下 
        if(Sys.ie<=8){
        	var obj;
        	try{
        		obj= new ActiveXObject("WScript.Shell");
        	}catch(e){
        		alert("请在Internet选项中设置:对没有标记为安全的activex控件进行初始化和脚本运行”设置成“启用”");
        		return;
        	}
        	var f;
        	try{
        		var setSvg = new ActiveXObject("Adobe.SVGCtl");
        		f = setSvg;
        	}catch(e){
        		f=false;
        	}
        	if(!f){
        		var content = "<div style='display:inline;'><label><input type='radio' name='exportType' value='xml' runat='server' checked/>SVGView.exe</label><p style='font-size:12px'>由于您的IE版本过低,无法正常显示图片.需要下载SCGView插件,安装后才能正常浏览.</p></div>";
        		var dlg = $.dialog({
        			content:content,
        			title:"下载相应的控件",
        			width:300,
        			okVal:"确定",
        			cancelVal:"取消",
        			cancel:true,
        			ok:function(){
        				formStartHandle.downloadSVG();
        			}
        		});
        		return;
        	}
        }
		$.ajax({
			type : 'POST',
			url : $.appClient.generateUrl({ESFormStart : 'showWfGraph'}, 'x'),
			data : {
				modelId:$('.formStartPage').attr('wfmodelid')
				,formId : $('.formStartPage').attr('formid')
				,actionId:$('.formStartPage').attr('actionid')
			},
			success : function(res) {
//				var json = eval('(' + res + ')');
//				alert();
				$.dialog({
		    		id:'mxGraphHtmlDialog',
			    	title:'查看流程图',
			    	modal:true, //蒙层（弹出会影响页面大小） 
		    	   	fixed:false,
		    	   	stack: true ,
		    	    resize: false,
		    	    lock : true,
					opacity : 0.1,
					padding: '0px',
					width:400,
					height:100,
					cancelVal: '关闭',
		    		cancel: true,
				    content:res
			    });
			},
			error : function() {
				formStartHandle.showMsg('获取流程图失败！', '2');
//				art.dialog.list['formStartDialog'].close();
			}
		});
		
		
	},
	downloadSVG: function(){
		var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDownSVG'});
		$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载SVGView.exe</a>',icon: 'succeed'});
	},
	
	// 打印function longjunhao 20140618
	myFormModelsPrint_event: function() {
		var wfId = $('.formStartPage').attr('wfId');
		var formId = $('.formStartPage').attr('formid');
		var modelId = $('.formStartPage').attr('wfmodelid');
		var printStepId = $('.formStartPage').attr('printStepId');
		var userFormNo = $('.formStartPage').attr('userFormNo');
		collaborativeHandle.workFlowPrint(wfId,formId,modelId,printStepId,userFormNo);
	},
	/** guolanrui 20140611 增加协同的保存待发和查看流程图的function end * */

	// 显示第t个Tags标签内容
	displayTag : function(id, t) {
		$('.Tags').hide();
		$('#' + id).show();
		$('#subnav li').removeClass('defalutTagOpen');
		$('#subnav li:eq(' + t + ')').addClass('defalutTagOpen');
	}

	
};
