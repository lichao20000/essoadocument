
var formApprovalHandle = {
		showMsg: function(msg, type){
			if(type == '1'){
				$.dialog.notice({icon : 'succeed',content : msg,title : '3秒后自动关闭',time : 3});
			} else if(type == '2'){
				$.dialog.notice({icon : 'error',content : msg,title : '3秒后自动关闭',time : 3});
			} else {
				$.dialog.notice({icon : 'warning',content : msg,title : '3秒后自动关闭',time : 3});
			}
		},
		approvalForm: function(wfName, wfId, stepId, formId,workFlowType){
		    var realstepId = stepId.split('_')[0] ;
		    var isLast = stepId.split('_')[1] ;
		    if (workFlowType=='5') {
		    	// 转发审批 longjunhao 20140729 add
		    	formApprovalHandle.toApprovalFormPage('', wfId, realstepId, formId, '', isLast, 'true', '5', '');
		    	return;
		    }
			$.ajax({
				type:'POST',
	    		url:$.appClient.generateUrl({ESFormStart : 'wfIsApprovaled'}, 'x'),
	    		data:{formId:formId,wfId:wfId,stepId:realstepId},
	    		success:function(res){       
	    			var json = eval('(' + res + ')');   
	    			var state = json.state;
	    			if(state=='over'){
	    				formApprovalHandle.showMsg('此流程已经审批过！', '3');
				   		return false;
	    			}
	    			var firstStepId = json.firstStepId;   
	    			formApprovalHandle.toApprovalFormPage('', wfId, realstepId, formId, firstStepId, isLast, 'true', '3', '');
	    		}
			});
		},
		toApprovalFormPage: function(dataId, wfId, stepId, formId, firstStepId, isLast, isSelf, workFlowType, isResponseOpinion){
			//'formBuilderManager.html?method=formApproval&wfId='+base64encode(wfId)+'&stepId='+base64encode(realstepId)+'&formId='+base64encode(formId)+'&firstStepId='+base64encode(firstStepId)+'&isLast='+base64encode(isLast)+'&isSelf='+base64encode('true')
			$.post($.appClient.generateUrl({ESFormStart : 'approvalForm'}, 'x')
	    			,{wfId:wfId, stepId:stepId, formId:formId, firstStepId:firstStepId, isLast:isLast, isSelf:isSelf, workFlowType:workFlowType, dataId:dataId, isResponseOpinion:isResponseOpinion}, function(res){
	    				var json = eval('(' + res + ')');
	    				if(null != json.message){
	    					formApprovalHandle.showMsg(json.message, '3');
	    					return ;
	    				}
	    				formApprovalHandle.realToApprovalFormPage(json.dataId, json.userFormNo, json.formId, json.wfModelId, json.formName, json.buttons, json.actionId, json.actionName, json.actionSize, json.wfId, json.stepId, json.isLastStep, json.extjs, json.simpleMsg, json.classicMsg, json.tableMsg, json.isForward, json.isOver, json.isNotice, json.oldFileName, json.oldFilePathList, json.selectPath, firstStepId,json.comboIDs,json.gridComBoIDs,json.relationBusiness) ;
			});
		},
		realToApprovalFormPage: function(dataId, userFormNo, formId, wfModelId, formName, buttons, actionId, actionName, actionSize, wfId, stepId, isLastStep, extjs, simpleMsg, classicMsg, tableMsg, isForward, isOver, isNotice, oldFileName, oldFilePathList, selectPath, firstStepId,comboIDs,gridComBoIDs,relationBusiness){
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESFormStart : 'approvalFormPage'},'x'),
		        data: {dataId:dataId, userFormNo:userFormNo, formId:formId, wfModelId:wfModelId, actionId:actionId, actionName:actionName, actionSize:actionSize, wfId:wfId, stepId:stepId, isLastStep:isLastStep, extjs:extjs, simpleMsg:simpleMsg, classicMsg:classicMsg, tableMsg:tableMsg, isForward:isForward, isOver:isOver, isNotice:isNotice, oldFileName:oldFileName, oldFilePathList:oldFilePathList, selectPath:selectPath, firstStepId:firstStepId,comboIDs:comboIDs,gridComBoIDs:gridComBoIDs,relationBusiness:relationBusiness},
			    success:function(data){
				    	$.dialog({
				    		id:'approvalFormDialog',
					    	title:'审批流程['+formName+'-'+userFormNo+']',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
							padding: '0px',
							width:760,
							cancelVal : '关闭',
							cancel : function(){
								Ext.getCmp('formBuilderPanel').destroy();
							},
							height:460,
						    content:data,
						    button:eval('['+buttons+']')
					    });
			    },
			    cache:false
			});
		},
		formApprovalBeforeSet: function(wfIdentifier, stepId){
			/** guolanrui 20140724 给表单添加完整性验证 BUG:50 **/
			if(!Ext.getCmp('formBuilderPanel').findByType('form')[0].form.isValid()){
				formApprovalHandle.showMsg('表单未通过验证，请重新填写表单后再进行此操作！', '3');
				return;
			}
			// longjunhao 20140920 修复bug953 分支流程审批的时候会出现多个“回退到上一步”
			var wfId = $('.formStartPage').attr('wfId');
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESFormStart : 'formApprovalHandlePage'},'x'),
		        data: {wfId:wfId,wfIdentifier:wfIdentifier, stepId:stepId, isNotice:$('#formApprovalPage').attr('isNotice'), isForward:$('#formApprovalPage').attr('isForward')},
			    success:function(data){
				    	$.dialog({
				    		id:'formApprovalHandleDialog',
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
							button:[{name:'上传附件',callback:function(){formApprovalHandle.createMsgFileUploadWin();return false ;}},
							        {name:'确定',callback:function(){formApprovalHandle.formApproval();return false ;}},
							        {name:'关闭',callback:function(){}}]
					    });
			    },
			    cache:false
			});
		},
		//选择决策值被修改时 调用方法
		checkAction: function(aId, aName){
			if($('#formApprovalPage').attr('actionid') != aId){
				$('#formApprovalPage').attr('actionid', aId) ;
				$('#formApprovalPage').attr('actionName', aName) ;
				$('#nextStepOwer').attr('name', '') ;
				$('#nextStepOwer').val('') ;
				if(aId>100000){
					$('#formApprovalPage').attr('isLastStep', 'true') ;
					if($('#formApprovalPage').attr('isLastStep') == 'true'){
						document.getElementById('selectNextApprovalUsers').style.display = 'none' ;
					} else {
						document.getElementById('selectNextApprovalUsers').style.display = '' ;
					}
				} else {
					$.ajax({
						type:'POST',
						url:$.appClient.generateUrl({ESFormStart : 'isLastStep'},'x'), 
						data:{wfModelId:$('#formApprovalPage').attr('wfmodelid'),actionId:aId},   		  
					  	success :function(res){
				        	var json = eval('(' + res + ')');
							var isLastStep = json.isLastStep;
							$('#formApprovalPage').attr('isLastStep', isLastStep) ;
							if(isLastStep == 'true'){
								document.getElementById('selectNextApprovalUsers').style.display = 'none' ;
							} else {
								document.getElementById('selectNextApprovalUsers').style.display = '' ;
							}
						}
					});
				}
			}
		},
		addInitMsg: function(msg){ 
			$('#msgTextArea').val(msg) ;
			$('#msgTextArea').css('border','1px solid #E2E3EA') ;
		},
		changeCurrFieldStyle: function(src){
			if(src.getAttribute('allowBlank') == 'true'){return ;} 
			if(src.value && src.value.length > 0){ 
				src.style.border = '1px solid #E2E3EA';
			}else{
				src.style.border = '1px solid red';
			} 
		},
		createMsgFileUploadWin: function(){
			$.dialog({
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
		    		{id:'btnAdd', name: '添加文件'},
		            {id:'btnCancel', name: '删除所有', disabled: true},
		            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
				],
				init:formApprovalHandle.createSWFUpload
	    	});	 
		},
		createSWFUpload: function(){
			var tplPath = $('#formApprovalHandleForm').attr('tplPath') ;
			var files = [];
			var upload = new SWFUpload({
				//提交路径
				upload_url: "",
				//upload_url: "http://127.0.0.1:8080/fileStoreMainServer/rest/mainFileServer/getUploadUrl",
				//upload_url: "http://127.0.0.1:8080/fileStoreServer/rest/fileServer/uploadFiles/4/c073f100d2cb1031b11dbcaec5dfa81e",
				file_post_name: "file.txt",		
				file_size_limit : "1048576",	// 100MB  longjunhao 20140905 修改为1024MB=1GB
				file_types : "*.*",
				file_types_description : "所有文件",
				file_upload_limit : "0",
				file_queue_limit : "0",

				// 事件处理
				swfupload_loaded_handler : swfuploadLoaded,
				file_dialog_start_handler : fileDialogStart,
				file_queued_handler : fileQueued,
				file_queue_error_handler : fileQueueError,
				file_dialog_complete_handler : fileDialogComplete,
				upload_start_handler : uploadStart,
				upload_progress_handler : uploadProgress,
				upload_error_handler : uploadError,
				upload_success_handler : uploadSuccess,
				upload_complete_handler : uploadComplete,

				// 按钮的处理
				button_image_url : tplPath+"/public/SWFUpload/img/ButtonUpload72.png",
				button_placeholder_id : "btnAdd",
				button_width: 72,
				button_height: 28,
				
				// Flash文件地址设置
				flash_url : tplPath+"/public/SWFUpload/js/swfupload.swf",
				
				custom_settings : {
					progressTarget : "fsUploadProgress",
					cancelButtonId : "btnCancel",
					startButtonId : "btnStart",
					// 上传成功的回调函数
					uploadSuccess : function(file, data, remainder){
						var f = $.parseJSON(data);
						var extName = file.name.substr(file.name.lastIndexOf(".")+1);
						extendFile(f.fileId, file.name, extName, remainder);
					}
				},
				
				// Debug 设置
				debug: false
			});
			$("#btnCancel").click(function(){cancelQueue(upload);});
			$("#btnStart").click(function(){
				$.post($.appClient.generateUrl({ESIdentify:'getUploadURL'},'x'),  function(data){
					upload.setUploadURL(data);
					startQueue(upload);
				});
			});
			// 挂接文件
			function extendFile(fileid, filename, extName, remainder){
				if($('#handleWfFileDataTable').attr('filePaths') == ''){
					$('#handleWfFileDataTable').attr('filePaths', fileid) ;
					$('#handleWfFileDataTable').attr('fileNames', filename) ;
				}else{
					$('#handleWfFileDataTable').attr('filePaths', $('#handleWfFileDataTable').attr('filePaths')+'|'+fileid) ;
					$('#handleWfFileDataTable').attr('fileNames', $('#handleWfFileDataTable').attr('fileNames')+'|'+filename) ;
				}
				formApprovalHandle.addHandleWfRow('handleWfFileDataTable', fileid, filename, extName);
			};
		},
		addHandleWfRow: function(tableName, fileid, filename, extName){
		     var root = document.getElementById(tableName);
		     var newRow = root.insertRow();
		     var newCell1 = newRow.insertCell();
//	  		 newCell1.bgColor= "#F2F5F8";   
//	  		 newCell1.width= "660";   
	  		 newCell1.align= "left";   
//		     newCell1.innerHTML = "<a href='#' style=\"margin-left:5px;\" title=\"点击下载\" onclick=\"window.location.href='baseUtilAction.html?content.method=downloadFile&enco=true&filepath=" + encodeURI(encodeURI(newFilePath)) + "&filename="+encodeURI(encodeURI(filename))+"' ;\" style=\"color:0000ff;text-decoration:underline\">"+filename+"</a><%if(isHandleThisWf){%><a style=\"margin-left:10px;\"  href='#' title=\"点击删除\" onclick=\"formApprovalHandle.deleteHandleWfFileData(this,'"+filename+"') ;\" style=\"color:0000ff;text-decoration:underline\">删除</a><%}%>";
		     newCell1.innerHTML = "<a href='#' style=\"margin-left:5px;\" title=\"点击下载\" onclick=\"formApprovalHandle.downloadFile('"+fileid+"')\" style=\"color:0000ff;text-decoration:underline\"><span class='fileicon'></span>"+filename+"</a><a style=\"margin-left:10px;\"  href='#' title=\"点击删除\" onclick=\"formApprovalHandle.deleteHandleWfFileData('"+tableName+"', this,'"+filename+"') ;\" style=\"color:0000ff;text-decoration:underline\">删除</a>";
	  		 var allRows = root.getElementsByTagName('tr');
	  	},
		/** 删除文件附件 **/
		deleteHandleWfFileData: function(tableName, obj,fileName){
			$.dialog({
				content : '您确定要删除当前文件吗？',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					formApprovalHandle.removeHandleWfRow(obj); 
	   				var filePaths = $('#'+tableName).attr('filePaths') ;
	   				var fileNames = $('#'+tableName).attr('fileNames') ;
	   				if(filePaths.indexOf('|')==-1){
		   			    $('#'+tableName).attr('filePaths', '') ;
						$('#'+tableName).attr('fileNames', '') ;
	  			    }else{
	  			    	 Array.prototype.remove=function(dx) {
	  				 　               if(isNaN(dx)||dx>this.length){return false;}
	  				 　               for(var i=0,n=0;i<this.length;i++){
	  				 　　　               if(this[i]!=this[dx]){
	  				 　　　　　                this[n++]=this[i];
	  				 　　　               }
	  				 　               }
	  				 　               this.length-=1;
	  				    }
		   			    var filePathsArray = filePaths.split('|');
		   			    var fileNamesArray = fileNames.split('|');
		   			 	for(var i=0; i<fileNamesArray.length; i++) {
			   			 	if(fileNamesArray[i]==fileName){
				   			 	filePathsArray.remove(i);
				   			 	fileNamesArray.remove(i);
				   			 	break ;
			   			 	}
		   			 	}
		   			 	if(filePathsArray.length==1){
		   			 	 	$('#'+tableName).attr('filePaths', filePathsArray[0]) ;
							$('#'+tableName).attr('fileNames', fileNamesArray[0]) ;
		   			 	}else{
		   			 		filePaths = filePathsArray[0] ;
		   			 		fileNames = fileNamesArray[0] ;
		   			 		for(j=1; j<filePathsArray.length; j++) {
		   			 			filePaths = filePaths+'|'+filePathsArray[j];
		   			 			fileNames = fileNames+'|'+fileNamesArray[j];
			   			 	}
		   			 	 	$('#'+tableName).attr('filePaths', filePaths) ;
							$('#'+tableName).attr('fileNames', fileNames) ;
		   			 	}
	  			    }
				}
			});
		},
		/** 界面删除文件附件展现对象 **/
		removeHandleWfRow: function(obj){
		    var tr=obj.parentNode.parentNode; 
			var tbody=tr.parentNode; 
			tbody.removeChild(tr); 
	  	},
		selectWfOwner: function(){
			// longjunhao 20141017 add 获取页面form的值
			var formData = $('#formApprovalPage form:first').serialize();
			$.ajax({
			   	  type:'POST',
				  url:$.appClient.generateUrl({ESFormStart : 'getStepOwner'},'x'),
				  data:{
					  formData : formData,
					  wfModelId:$('#formApprovalPage').attr('wfmodelid'),
					  formId:$('#formApprovalPage').attr('formid'),
					  actionId:$('#formApprovalPage').attr('actionid'),
					  wfId:$('#formApprovalPage').attr('wfId'),
					  stepId:$('#formApprovalPage').attr('stepId')}    		  
				  ,success :function(res){
			        	var json = eval('(' + res + ')');
			        	if(null==json.success||json.success=='false'){
			        		formApprovalHandle.showMsg('没有找到流程的下一步处理人！', '3');
			        		return;
			        	} 
					    var wfModelId = json.wfModelId;  
					    var findNextStep = json.findNextStep;
					    var nextStepOwner = json.nextStepOwner; 
					    var isLastStep = (json.isLastStep || json.isFirstStep);
					    if(isLastStep){
					    	formApprovalHandle.showMsg('当前决策不需要选择下一步处理人！', '3');
					    	return ;
					    } 
					    if(nextStepOwner == ''){
						    formApprovalHandle.showMsg('没有找到流程的下一步处理人！', '3');
						    return;
					    }
//					    for(var i=0;i<nextStepOwner.length;i++){
//					        addStepOwnerToShowStepOwnerWin(nextStepOwner[i]) ;
//					    }  
					    formApprovalHandle.realSelectWfOwner(nextStepOwner) ;
					    $('#formApprovalPage').attr('actionId',json.actionId) ;
		          },error: function(){
		        	  formApprovalHandle.showMsg('获取下一步处理人出错！', '2');
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
								formApprovalHandle.selectWfOwnerAction();
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
//		   	  var $chkarray = $('#nextStepOwners input[checked]');
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
		      
//		   	  var allNextStepOwnerCheckBoxs = document.getElementById("nextStepOwners").getElementsByTagName('input');
//		  	  if(allNextStepOwnerCheckBoxs.length>0){
//		  	  		var splitStepId ;
//		  	  		var tempUsers = '';
//		  	  		for(var i=0;i<allNextStepOwnerCheckBoxs.length;i++){
//		  	  			alert(allNextStepOwnerCheckBoxs[i].stepid);
//		  	  			if(allNextStepOwnerCheckBoxs[i].checked && allNextStepOwnerCheckBoxs[i].text!=undefined){
//		  	  				splitStepId = allNextStepOwnerCheckBoxs[i].stepId;
//		  	  				/** 去掉重复用户 **/
//		  	  				if((';'+tempUsers).indexOf(';'+allNextStepOwnerCheckBoxs[i].value+';')==-1){
//			  	  				tempUsers = tempUsers + allNextStepOwnerCheckBoxs[i].value + ';' ;
//				  	  			selectUserNames = selectUserNames + allNextStepOwnerCheckBoxs[i].text + ';' ;
//		  	  				}
//		  	  			}
//		  	  		}
//		  	  		alert(tempUsers);
//		  	  		if(tempUsers !=''){
//			  	  		selectUsers=splitStepId+':'+tempUsers+'-';
//		  	  		}
//		  	 }
	 		 if(selectUsers==''){
	 		 	formApprovalHandle.showMsg('您没有选择任何的处理人，不能进行此操作！', '3');
	 		 	return;
	 		 }
		 		 
	 		 document.getElementById('nextStepOwer').name = selectUsers ;
		   	 if(($('#formApprovalPage').attr('actionsize')*1)>1){
		     	 if(selectUserNames!=''){
			     	 $('#nextStepOwer').val(selectUserNames.substring(0,selectUserNames.length-1)) ;
		     	 }
		   	 } else {
		   		var msgText = $('#msgTextArea').val() ;
				if(typeof msgText == "undefined" || msgText == ""){
					if(selectUserNames!=''){
				     	 $('#nextStepOwer').val(selectUserNames.substring(0,selectUserNames.length-1)) ;
			     	}
				} else {
					formApprovalHandle.formApproval() ;
					art.dialog.list['formApprovalHandleDialog'].close();
				}
		   	 }
	  	},
	  	formApproval: function(){
	  		if($('#formApprovalPage').attr('isForward') == 'true'){
	  			/** 转发审批 **/
	  			var msgText = $('#msgTextArea').val() ;
				if(typeof msgText == "undefined" || msgText == ""){
					$('#msgTextArea').css('border','1px solid red') ;
					formApprovalHandle.showMsg('意见内容不能为空；请填写完审批意见后，再进行此操作！', '3') ;
					return ;
				}
				$.ajax({
			    	  type:'POST',
			          url : $.appClient.generateUrl({ESFormStart : 'commit_opinion'},'x') ,
				      data:{wfModelId:$('#formApprovalPage').attr('wfmodelid'),
				    	  	actionId:$('#formApprovalPage').attr('actionid'),
				    	  	opinionStr:msgText,
				    	  	fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
				    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths'),
				    	  	wfId:$('#formApprovalPage').attr('wfId'),
				    	  	stepId:"-5",
				    	  	formId:$('#formApprovalPage').attr('formid'),
				    	  	userFormId:$('#formApprovalPage').attr('dataid'),
				    	  	userFormActionName:$('#formApprovalPage').attr('actionName')},
			          success:function(res){}
			    });
				$.ajax({
		 			type:'POST',
		          	url:$.appClient.generateUrl({ESFormStart : 'wfForwardAction'},'x'),
			        data:{wfId:$('#formApprovalPage').attr('wfId'),
			        		formId:$('#formApprovalPage').attr('formid'),
			        		userFormID:$('#formApprovalPage').attr('dataid')},
		          	success:function(res){
					   	var json = eval('(' + res + ')');
					   	if(json.success){
					   		formApprovalHandle.showMsg('转发处理成功！', '1') ;
					   		// 判断是否在我的待办中审批 longjunhao 20140728
		    				if ($("#mylist").attr("selectType") == "todo") {
		    					$("#mylist").flexReload();
		    				}
					   		// 刷新首页
		    				formApprovalHandle.refreshHomePageToDo();
					   	}else{
					   		formApprovalHandle.showMsg('转发处理失败！', '3') ;
					   	}
					   	art.dialog.list['approvalFormDialog'].close() ;
	    				art.dialog.list['formApprovalHandleDialog'].close() ;
					}
				});
	  			return ;
	  		}
	  		if($('#formApprovalPage').attr('isNotice') == 'true'){
	  			/** 知会审批 **/
	  			var msgText = $('#msgTextArea').val() ;
	  			$.ajax({
			    	  type:'POST',
			          url : $.appClient.generateUrl({ESFormStart : 'commit_opinion'},'x') ,
				      data:{wfModelId:$('#formApprovalPage').attr('wfmodelid'),
				    	  	actionId:$('#formApprovalPage').attr('actionid'),
				    	  	opinionStr:msgText,
				    	  	fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
				    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths'),
				    	  	wfId:$('#formApprovalPage').attr('wfId'),
				    	  	stepId:'10000',
				    	  	formId:$('#formApprovalPage').attr('formid'),
				    	  	userFormId:$('#formApprovalPage').attr('dataid'),
				    	  	userFormActionName:$('#formApprovalPage').attr('actionName')},
			          success:function(res){}
			    });
	  			$.ajax({
		 			type:'POST',
		 			url:$.appClient.generateUrl({ESFormStart : 'WfNoticeAction'},'x'),
	    			data:{
	    				wfId:$('#formApprovalPage').attr('wfId'),
	    				formId:$('#formApprovalPage').attr('formId'),
	    				opinionValue:msgText},
	    			success:function callback(text) {
	    				formApprovalHandle.showMsg('知会处理成功！', '1') ;
	    				// 判断是否在我的待办中审批 longjunhao 20140728
	    				if ($("#mylist").attr("selectType") == "todo") {
	    					$("#mylist").flexReload();
	    				}
	    				// 刷新首页
	    				formApprovalHandle.refreshHomePageToDo();
	    				art.dialog.list['approvalFormDialog'].close() ;
			        	art.dialog.list['formApprovalHandleDialog'].close() ;
		   			}
				});
	  			return ;
	  		}
			$.ajax({
					type:'POST',
		    		url : $.appClient.generateUrl({ESFormStart : 'isApprovalOver'},'x') ,   
		    		data : {wfId:$('#formApprovalPage').attr('wfId'),
		    				stepId:$('#formApprovalPage').attr('stepId')},       
		    		success : function(res){
		    			var json = eval('(' + res + ')');
		    			var state = json.state;
		    			if(state!=null && state=='over'){
		    				formApprovalHandle.showMsg('此流程已经审批过！', '3') ;
		    				art.dialog.list['approvalFormDialog'].close() ;
		    				art.dialog.list['formApprovalHandleDialog'].close() ;
		    				return ;
		    			}
				       	var msgText = $('#msgTextArea').val() ;
						if(typeof msgText == "undefined" || msgText == ""){
							$('#msgTextArea').css('border','1px solid red') ;
							formApprovalHandle.showMsg('意见内容不能为空；请填写完审批意见后，再进行此操作！', '3') ;
							return ;
						}
						if($('#formApprovalPage').attr('isLastStep')=='false' && $('#nextStepOwer').val() == ''){
							formApprovalHandle.showMsg('请您先选择下一步处理人，再进行此操作！', '3');
							return ;
						}
					    $.ajax({
					    	  type:'POST',
					          url : $.appClient.generateUrl({ESFormStart : 'commit_opinion'},'x') ,
						      data:{wfModelId:$('#formApprovalPage').attr('wfmodelid'),
						    	  	actionId:$('#formApprovalPage').attr('actionid'),
						    	  	opinionStr:msgText,
						    	  	fileAppendixNames:$('#handleWfFileDataTable').attr('fileNames'),
						    	  	fileAppendixPaths:$('#handleWfFileDataTable').attr('filePaths'),
						    	  	wfId:$('#formApprovalPage').attr('wfId'),
//						    	  	stepId:'<%=isNotice?"10000":(isForward?"-5":stepId)%>',
						    	  	stepId:$('#formApprovalPage').attr('stepId'),
						    	  	formId:$('#formApprovalPage').attr('formid'),
						    	  	userFormId:$('#formApprovalPage').attr('dataid'),
						    	  	userFormActionName:$('#formApprovalPage').attr('actionName')},
					          success:function(res){}
					    });
						var selectUsers = document.getElementById('nextStepOwer').name ;
						var postData = $("#"+$("#formBuilderPanel").find("form")[0].id).serialize();
						var wfId = $('#formApprovalPage').attr('wfId');
						var relationBusiness = $('#formApprovalPage').attr('relationBusiness');
						$.ajax({
								type:'POST',
								url : $.appClient.generateUrl({ESFormStart : 'auditingWorkflow'},'x') ,
						    	data:{
						    		postData:postData,
						    		wfId:$('#formApprovalPage').attr('wfId'),
						    		stepId:$('#formApprovalPage').attr('stepId'),
						    		actionId:$('#formApprovalPage').attr('actionid'),
						    		formId:$('#formApprovalPage').attr('formId'),
						    		dataHaveRight:$('#formApprovalPage').attr('dataHaveRight'),
						    		selectUsers:selectUsers
						    	},       
						        success :function(res){
				      		  		var json = eval('(' + res + ')');
				      		  		if(json.success){
				      		  		/**wanghongchen 20140806 更新销毁单销毁数量**/
				      					if(relationBusiness == 'destroy'){
				      						$.ajax({
				      							url : $.appClient.generateUrl({ESArchiveDestroy : 'updateDestroyNum'}, 'x'),
				      							type : 'post',
				      							data : {wfId:wfId, type:'deal'}
				      						});
				      					}
				      		  			formApprovalHandle.showMsg('审批成功！', '1');
					      		  		art.dialog.list['approvalFormDialog'].close() ;
					    				art.dialog.list['formApprovalHandleDialog'].close() ;
					    				// 判断是否在我的待办中审批 longjunhao 20140623
					    				if ($("#mylist").attr("selectType") == "todo") {
					    					$("#mylist").flexReload();
					    				}
					    				// 判断是否在鉴定销毁中审批 wanghongchen 20140728 wanghongchen
					    				if($("#Destroy_list_tbl")){
		    			    				$("#Destroy_list_tbl").flexReload();
		    			    			}
					    				// 刷新首页
					    				formApprovalHandle.refreshHomePageToDo();
				      		  		} else {
				      		  			formApprovalHandle.showMsg('审批失败！', '2');
					      		  		art.dialog.list['approvalFormDialog'].close() ;
					    				art.dialog.list['formApprovalHandleDialog'].close() ;
				      		  		}
						      	}	
						});
		    		}
			});
		},
		checkWfMsgShowType: function(divId){
			$('#'+divId+'Div').removeClass('displaynone') ;
	   		var divIds = ["Classic" , "Simple" , "Table"] ;
	   		for(var j = 0; j<divIds.length ; j ++){
		   		if(divIds[j] != divId){
			   		$('#'+divIds[j]+'Div').addClass('displaynone') ;
		   		}
	   		}
		},
		showOpinionFiles: function(id,usernameCn){
			$.ajax({
			   	  type:'POST',
				  url:$.appClient.generateUrl({ESFormStart : 'showOpinionFilesPage'},'x'),
				  data:{id:id}    		  
				  ,success :function(data){
					  $.dialog({
				    		id:'showOpinionFilesDialog',
					    	title:'【'+usernameCn+'】上传的附件',
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
							ok : false,
							cancelVal : '关闭',
							cancel : true
					    });
		          },
		          cache:false
		       });
		},
		downloadFile: function(fileId){
			$.ajax({
				url: $.appClient.generateUrl({ESFormStart : 'downloadFile',fileId:fileId},'x'),
				success: function(url){
					window.location=url;
				}
			});
		},
		formForward: function(wfId, userFormId){
			$.ajax({
				type:'POST',
		        url : $.appClient.generateUrl({ESFormStart : 'formForwardPage'},'x'),
		        data: {wfId:wfId, userFormId:userFormId},
			    success:function(data){
				    	$.dialog({
				    		id:'formForwardSetDialog',
					    	title:'设置接收者',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
							padding: '0px',
							width:500,
						    content:data,
						    button:[{name:'上传附件',callback:function(){formApprovalHandle.createFormForwardSetFileUploadWin();return false ;}},
							        {name:'转发',callback:function(){formApprovalHandle.formForwardAction();return false ;}},
							        {name:'关闭',callback:function(){}}]
					    });
			    },
			    cache:false
			});
		},
		formForwardAction: function(){
			var userIds = $("#forwardToUsersDiv").attr('userIds');
			if(userIds == ''){
				formApprovalHandle.showMsg('请您先设置待转发人员，再进行此操作！', '3');
				return ;
			}
			var msgText = $('#msgTextArea').val() ;
			if(typeof msgText == "undefined" || msgText == ""){
				$('#msgTextArea').css('border','1px solid red') ;
				formApprovalHandle.showMsg('意见内容不能为空；请填写完审批意见后，再进行此操作！', '3') ;
				return ;
			}
			userIds = userIds.substring(1, userIds.length-1) ;
			$.ajax({
		    	  type:'POST',
		          url : $.appClient.generateUrl({ESFormStart : 'excuteWfForward'},'x') ,
			      data:{userIds:userIds,
			    	  	wfId:$('#formApprovalPage').attr('wfId'),
			    	  	userFormId:$('#formApprovalPage').attr('dataid'),
			    	  	opinionStr:msgText,
		    	  		fileAppendixNames:$('#formForwardFileDataTable').attr('fileNames'),
			    	  	fileAppendixPaths:$('#formForwardFileDataTable').attr('filePaths')
			    	  	},
		          success:function(res){
		        	  if(res == 'true'){
		        		  formApprovalHandle.showMsg('转发操作成功！', '1') ;
		        	  } else {
		        		  formApprovalHandle.showMsg('转发操作失败！', '2') ;
		        	  }
		          }
		    });
			art.dialog.list['formForwardSetDialog'].close();
		},
		createFormForwardSetFileUploadWin: function(){
			$.dialog({
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
		    		{id:'btnAdd', name: '添加文件'},
		            {id:'btnCancel', name: '删除所有', disabled: true},
		            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
				],
				init:formApprovalHandle.createSWFFormForwardSetUpload
	    	});	 
		},
		createSWFFormForwardSetUpload: function(){
			var tplPath = $('#formForwardSetDiv').attr('tplPath') ;
			var files = [];
			var upload = new SWFUpload({
				//提交路径
				upload_url: "",
				//upload_url: "http://127.0.0.1:8080/fileStoreMainServer/rest/mainFileServer/getUploadUrl",
				//upload_url: "http://127.0.0.1:8080/fileStoreServer/rest/fileServer/uploadFiles/4/c073f100d2cb1031b11dbcaec5dfa81e",
				file_post_name: "file.txt",		
				file_size_limit : "1048576",	// 100MB  longjunhao 20140905 修改为1024MB=1GB
				file_types : "*.*",
				file_types_description : "所有文件",
				file_upload_limit : "0",
				file_queue_limit : "0",

				// 事件处理
				swfupload_loaded_handler : swfuploadLoaded,
				file_dialog_start_handler : fileDialogStart,
				file_queued_handler : fileQueued,
				file_queue_error_handler : fileQueueError,
				file_dialog_complete_handler : fileDialogComplete,
				upload_start_handler : uploadStart,
				upload_progress_handler : uploadProgress,
				upload_error_handler : uploadError,
				upload_success_handler : uploadSuccess,
				upload_complete_handler : uploadComplete,

				// 按钮的处理
				button_image_url : tplPath+"/public/SWFUpload/img/ButtonUpload72.png",
				button_placeholder_id : "btnAdd",
				button_width: 72,
				button_height: 28,
				
				// Flash文件地址设置
				flash_url : tplPath+"/public/SWFUpload/js/swfupload.swf",
				
				custom_settings : {
					progressTarget : "fsUploadProgress",
					cancelButtonId : "btnCancel",
					startButtonId : "btnStart",
					// 上传成功的回调函数
					uploadSuccess : function(file, data, remainder){
						var f = $.parseJSON(data);
						var extName = file.name.substr(file.name.lastIndexOf(".")+1);
						extendFile(f.fileId, file.name, extName, remainder);
					}
				},
				
				// Debug 设置
				debug: false
			});
			$("#btnCancel").click(function(){cancelQueue(upload);});
			$("#btnStart").click(function(){
				$.post($.appClient.generateUrl({ESIdentify:'getUploadURL'},'x'),  function(data){
					upload.setUploadURL(data);
					startQueue(upload);
				});
			});
			// 挂接文件
			function extendFile(fileid, filename, extName, remainder){
				if($('#formForwardFileDataTable').attr('filePaths') == ''){
					$('#formForwardFileDataTable').attr('filePaths', fileid) ;
					$('#formForwardFileDataTable').attr('fileNames', filename) ;
				}else{
					$('#formForwardFileDataTable').attr('filePaths', $('#formForwardFileDataTable').attr('filePaths')+'|'+fileid) ;
					$('#formForwardFileDataTable').attr('fileNames', $('#formForwardFileDataTable').attr('fileNames')+'|'+filename) ;
				}
				formApprovalHandle.addHandleWfRow('formForwardFileDataTable', fileid, filename, extName);
			};
		},
		approvalWfForward: function(id,wfId,formId,isResponseOpinion){
			formApprovalHandle.toApprovalFormPage(id, wfId, '', formId, '', 'false', 'true', '5', isResponseOpinion);
		},
		approvalNoticeForm: function(wfName, wfId, stepId, formId){
			var realstepId = stepId.split('_')[0] ;
		    var isLast = stepId.split('_')[1] ;
			formApprovalHandle.toApprovalFormPage('', wfId, realstepId, formId, '', isLast, 'true', '3', '');
		},
		showWorkflowGraph: function() {
			//gaoyide
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
	        				formApprovalHandle.downloadSVG();
	        			}
	        		});
	        		return;
	        	}
	        }
			$.ajax({
				type : 'POST',
				url : $.appClient.generateUrl({ESFormStart : 'showWfGraph'}, 'x'),
				data : {
					modelId:$('#formApprovalPage').attr('wfmodelid')
					,formId : $('#formApprovalPage').attr('formid')
					,actionId:$('#formApprovalPage').attr('actionid')
					,wfId:$('#formApprovalPage').attr('wfId')
					,stepId:$('#formApprovalPage').attr('stepId')
				},
				success : function(res) {
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
				}
			});
		},
		downloadSVG: function(){
			var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDownSVG'});
			$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载SVGView.exe</a>',icon: 'succeed'});
		},
		createFilesUploadWin: function(){
			$.dialog({
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
		    		{id:'btnAdd', name: '添加文件'},
		            {id:'btnCancel', name: '删除所有', disabled: true},
		            {id:'btnStart', name: '开始上传', disabled: true, callback: function(){return false;}}
				],
				init:formApprovalHandle.createFilesUpload
	    	});	 
		},
		createFilesUpload: function(){
			var tplPath = $('#formApprovalPage').attr('tplPath') ;
			var files = [];
			var upload = new SWFUpload({
				//提交路径
				upload_url: "",
				//upload_url: "http://127.0.0.1:8080/fileStoreMainServer/rest/mainFileServer/getUploadUrl",
				//upload_url: "http://127.0.0.1:8080/fileStoreServer/rest/fileServer/uploadFiles/4/c073f100d2cb1031b11dbcaec5dfa81e",
				file_post_name: "file.txt",		
				file_size_limit : "1048576",	// 100MB  longjunhao 20140905 修改为1024MB=1GB
				file_types : "*.*",
				file_types_description : "所有文件",
				file_upload_limit : "0",
				file_queue_limit : "0",

				// 事件处理
				swfupload_loaded_handler : swfuploadLoaded,
				file_dialog_start_handler : fileDialogStart,
				file_queued_handler : fileQueued,
				file_queue_error_handler : fileQueueError,
				file_dialog_complete_handler : fileDialogComplete,
				upload_start_handler : uploadStart,
				upload_progress_handler : uploadProgress,
				upload_error_handler : uploadError,
				upload_success_handler : uploadSuccess,
				upload_complete_handler : uploadComplete,

				// 按钮的处理
				button_image_url : tplPath+"/public/SWFUpload/img/ButtonUpload72.png",
				button_placeholder_id : "btnAdd",
				button_width: 72,
				button_height: 28,
				
				// Flash文件地址设置
				flash_url : tplPath+"/public/SWFUpload/js/swfupload.swf",
				
				custom_settings : {
					progressTarget : "fsUploadProgress",
					cancelButtonId : "btnCancel",
					startButtonId : "btnStart",
					// 上传成功的回调函数
					uploadSuccess : function(file, data, remainder){
						var f = $.parseJSON(data);
						var extName = file.name.substr(file.name.lastIndexOf(".")+1);
						extendFile(f.fileId, file.name, extName, remainder);
					}
				},
				
				// Debug 设置
				debug: false
			});
			$("#btnCancel").click(function(){cancelQueue(upload);});
			$("#btnStart").click(function(){
				$.post($.appClient.generateUrl({ESIdentify:'getUploadURL'},'x'),  function(data){
					upload.setUploadURL(data);
					startQueue(upload);
				});
			});
			// 挂接文件
			function extendFile(fileid, filename, extName, remainder){
				formApprovalHandle.addWfUploadingFile('formBuilderFiles', fileid, filename, extName);
			};
		},
		addWfUploadingFile: function(tableName, fileid, filename, extName){
			$.ajax({
				type:'POST',
				url:$.appClient.generateUrl({ESFormStart:'addWfFile'},'x') ,             
				data:{wfID:$('#formApprovalPage').attr('wfId'), 
					firstStepId:$('#formApprovalPage').attr('firstStepId'), 
					fileid:fileid, 
					filename:filename},
				success:function(dataId){
					if(dataId*1>0){
						if($('#formBuilderFiles').attr('filePaths') == ''){
							$('#formBuilderFiles').attr('filePaths', fileid) ;
							$('#formBuilderFiles').attr('fileNames', filename) ;
						} else {
							$('#formBuilderFiles').attr('filePaths', $('#formBuilderFiles').attr('filePaths')+'|'+fileid) ;
							$('#formBuilderFiles').attr('fileNames', $('#formBuilderFiles').attr('fileNames')+'|'+filename) ;
						}
						formApprovalHandle.addWfUploadedFile(tableName, fileid, filename, extName, dataId, 'true') ;
					} else {
						formStartHandle.showMsg('上传【'+filename+'】文件失败！', '2');
					}
				}
			}); 
		},
		addWfUploadedFile: function(tableName, fileid, filename, extName, dataId, enabledDelete){
		     var root = document.getElementById(tableName);
		     var newRow = root.insertRow();
		     var newCell1 = newRow.insertCell();
	  		 newCell1.align= "left";   
		     newCell1.innerHTML = "<a href='#' style=\"margin-left:5px;\" title=\"点击下载\" onclick=\"formApprovalHandle.downloadFile('"+fileid+"')\" style=\"color:0000ff;text-decoration:underline\"><span class='fileicon'></span>"+filename+"</a><a style=\"margin-left:10px;display:"+(enabledDelete=='false'?'none':'')+"\"  href='#' title=\"点击删除\" onclick=\"formApprovalHandle.deleteWfUploadedFile('"+tableName+"', this,'"+filename+"', '"+dataId+"') ;\" style=\"color:0000ff;text-decoration:underline\">删除</a>";
	  		 var allRows = root.getElementsByTagName('tr');
	  	},
		deleteWfUploadedFile: function(tableName, obj, fileName, dataId){
			$.dialog({
				content : '您确定要删除当前文件吗？',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					if(dataId == ''){
						formApprovalHandle.realDeleteWfUploadedFile(tableName, obj, fileName) ;
					} else {
						$.ajax({
							type:'POST',
							url:$.appClient.generateUrl({ESFormStart:'deleteWfFile'},'x') ,             
							data:{dataId:dataId},
							success:function(res){
								formApprovalHandle.realDeleteWfUploadedFile(tableName, obj, fileName) ;
							}
						}); 
					}
				}
			});
		},
		realDeleteWfUploadedFile: function(tableName, obj, fileName){
			formApprovalHandle.removeHandleWfRow(obj); 
		    var filePaths = $('#'+tableName).attr('filePaths') ;
		    var fileNames = $('#'+tableName).attr('fileNames') ;
		    if(filePaths.indexOf('|')==-1){
		    	$('#'+tableName).attr('filePaths', '') ;
		    	$('#'+tableName).attr('fileNames', '') ;
		    }else{
		    	Array.prototype.remove=function(dx) {
		    		if(isNaN(dx)||dx>this.length){return false;}
		    		for(var i=0,n=0;i<this.length;i++){
		    			if(this[i]!=this[dx]){
		    				this[n++]=this[i]
		    			}
		    		}
		    		this.length-=1
		    	}
		    	var filePathsArray = filePaths.split('|');
		    	var fileNamesArray = fileNames.split('|');
		    	for(var i=0; i<fileNamesArray.length; i++) {
		    		if(fileNamesArray[i]==fileName){
		    			filePathsArray.remove(i);
		    			fileNamesArray.remove(i);
		    			break ;
		    		}
		    	}
		    	if(filePathsArray.length==1){
		    		$('#'+tableName).attr('filePaths', filePathsArray[0]) ;
		    		$('#'+tableName).attr('fileNames', fileNamesArray[0]) ;
		    	}else{
		    		filePaths = filePathsArray[0] ;
		    		fileNames = fileNamesArray[0] ;
		    		for(j=1; j<filePathsArray.length; j++) {
		    			filePaths = filePaths+'|'+filePathsArray[j];
		    			fileNames = fileNames+'|'+fileNamesArray[j];
		    		}
		    		$('#'+tableName).attr('filePaths', filePaths) ;
		    		$('#'+tableName).attr('fileNames', fileNames) ;
		    	}
		    }
		},
		// 刷新首页的我的待办 longjunhao 2140728
		refreshHomePageToDo : function() {
	    	if($('#preTaskListsContainer')){
	    		$.post($.appClient.generateUrl({ESCollaborative:'listWorkFlowToDo'},'x'),
    				{page: 1, rp: 6},
    				function (htm){
    					$('#preTaskListsContainer').html(htm);
    					
    				}
    			);
	    	}
	    	//刷新左侧待办事项 gaoyide 20141021
	    	if($('#preTasksCounter')){
	    		$.post(
	    				$.appClient.generateUrl({ESCollaborative:'listWorkFlowAll'},'x'),
	    				{page: 1, rp: 6},
	    				function (htm){
	    					var count = parseInt(htm,10);
	    					if(count>0){
	    						$('#preTasksCounter').text(htm);
	    						$('#preTasksCounter').css("display","block");
	    					}else if(count==0)
	    						$('#preTasksCounter').css("display","none");
	    				}
	    			);
	    	}
		}
};
