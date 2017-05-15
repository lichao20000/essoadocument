/** 添加数据附件相关方法 **/
var addAttachData = {
		addEditDetails : function(){
			var url=$.appClient.generateUrl({ESFormStart:'record'},'x');
			$.ajax({
			    url:url,
			    success:function(data){
				    var linkdialog=$.dialog({
				    	id:'linkdialog',
				    	title:'添加数据附件',
				    	width: '800px',
				    	height:'380px',
				    	padding:'0px',
			    	   	fixed:  true,
			    	    resize: false,
			    	    okVal:'添加',
					    ok:true,
					    cancelVal: '关闭',
					    cancel: true,
				    	content:data,
				    	ok:function()
				    	{
				    		if ($('#formStartPage').attr('wfType')!='') {
				    			addAttachData.addDataDetail();
				    		} else {
				    			linkBorrowDetail();
				    		}
							return false;
						},
						init:addAttachData.createFileTree
					});
				    // 添加数据附件信息(用于新建协同,不对库进行操作)
			    	function linkBorrowDetail(){
			    		var dataList=$('.formStartPage').attr('dataList');
			    		var tempDataList = dataList;
			    		var relationBusiness=$('.formStartPage').attr('relationBusiness');
			    		var __colModel=[
									{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
									{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
									{display: 'documentFlag', name : 'documentFlag',hide:true,sortable : false, width : 160,align: 'left',metadata:'documentFlag'},
									{display: '操作', name : 'handle',sortable : false, width : 30,align: 'left',callback:function(){addAttachData.showAttachData();return false ;}},
									{display: '数据名称', name: 'title',sortable : true,width : 480,align: 'left',metadata:'Title'},
									{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
								];
			    		if(relationBusiness == 'using'){//利用流程增加权限字段
			    			__colModel=[
									{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
									{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
									{display: 'documentFlag', name : 'documentFlag',hide:true,sortable : false, width : 160,align: 'left',metadata:'documentFlag'},
									{display: '操作', name : 'handle',sortable : false, width : 30,align: 'left',callback:function(){addAttachData.showAttachData();return false ;}},
									{display: '数据名称', name: 'title',sortable : true,width : 230,align: 'left',metadata:'Title'},
									{display: '文件浏览', name: 'isRead',sortable : true,width : 45, align: 'center'},
									{display: '浏览天数', name: 'readDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'readDate'},
									{display: '文件下载', name: 'isDownload',sortable : true,width : 45, align: 'center'},
									{display: '下载天数', name: 'downloadDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'downloadDate'},
									{display: '文件打印', name: 'isPrint',sortable : true,width : 45,align: 'center'},
									{display: '打印天数', name: 'printDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'printDate'},
									{display: '实体借阅', name: 'useEntity',sortable : true,width : 45, align: 'center'},
									{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
								];
			    		}
						var ACode='';
						var title='';
						var files = [];
						var checkboxs = $("#borrowlist").find("input[name='path']:checked");
						if (checkboxs.length > 0 ){
							var types=[];
							var voidTypes='';
							var nums='';
							var paths = [];
							var ACodeMeta='RecordID';
							var titleMeta='Title';
							var ACodeName=$("#borrowlist").flexGetColumnDisplay(['RecordID']);
							var titleName=$("#borrowlist").flexGetColumnDisplay(['Title']);
							//根据元数据获取相应的标题top
							var trs=$("#borrowDetails").find("input[name='id3']");
							nums=trs.length;
							if(trs.length==0){
								$("#addAttachDataGridDiv").html('<table id="borrowDetails"></table>');
							}else{
								trs.each(function(){
									var path=$(this).val();
									var bothPath=path.split('|');
									paths.push(bothPath[0]);
									types.push(bothPath[2]);
								});
								paths=paths.join(',');
								voidTypes=types.join('');
							}
							checkboxs.each(function(){
								var trObj=$(this).closest('tr');
								var checkpath = $(this).val();
								if(paths.length>0){
										if (paths.indexOf(checkpath)==-1) {
											 ACode=$("#borrowlist").flexGetColumnValue(trObj,[ACodeMeta]);
				    		         		 title=$("#borrowlist").flexGetColumnValue(trObj,[titleMeta]);
					    					 files.push(ACode+'|'+title+'|'+checkpath);
										}
								}else{
									 ACode=$("#borrowlist").flexGetColumnValue(trObj,[ACodeMeta]);
		    		         		 title=$("#borrowlist").flexGetColumnValue(trObj,[titleMeta]);
			    					 files.push(ACode+'|'+title+'|'+checkpath);
								}
							});
							if(files==''){
								$.dialog.notice({title:'操作提示',content:'您添加的数据重复，请重新选择！',icon:'warning',time:3});
								return false;
							}else{
								var checkDataList = ""; //新添加的数据path集合
								for(var t=0;t<files.length;t++){
									var i=1;
									var getFile=files[t].split('|');
									dataList+=getFile[2]+'|';
									checkDataList+=getFile[2]+'|';
								}
								/** wanghongchen 20140805 销毁流程，查找符合条件数据**/
								if(relationBusiness == 'destroy'){
									$.ajax({
										url : $.appClient.generateUrl({ESArchiveDestroy:'getDestroyDataList'},'x'),
										type : 'post',
										dataType : 'json',
										async : false,
										data : {dataList:checkDataList,strucid:strucid,nodePath:nodePath},
										success : function(destroyRt){
											if(destroyRt.destroyNum == 0){
												$.dialog.notice({content:destroyRt.msg,icon:'warning',time:3});
											}else{
												$.dialog({
													title : "提示",
													content : destroyRt.msg,
													cancel : true,
													ok : function(){
														dataList = tempDataList + destroyRt.dataList;
														linkdialog.close();
														$('.formStartPage').attr('dataList', dataList) ;
														addAttachData.getAttachDataList(__colModel);
													}
												});
											}
										}
									});
								}else{
									linkdialog.close();
									$('.formStartPage').attr('dataList', dataList) ;
									addAttachData.getAttachDataList(__colModel);
								}
							}
						}else{
							$.dialog.notice({title:'操作提示',content:'请选择您要添加的数据！',icon:'warning',time:3});
							return false;
						}
					};
				},
				cache:false
			});
		},
		
		//新的获取数据附件的方法，需要调取后台，为以后分页做准备，同时需要将选择的数据附件扔到缓存当中，为了设置数据权限时使用
		//目前先做将数据存入缓存的部分，分页的部分等权限完成了再做
		getAttachDataList : function(__colModel){
			var dataList=$('#formStartPage').attr('dataList');
    		var relationBusiness=$('#formStartPage').attr('relationBusiness');//typeWf
    		var dataHaveRight=$('#formStartPage').attr('dataHaveRight');
    		
    		var __url=$.appClient.generateUrl({ESFormStart:'getAttachDataList',dataListStr:dataList, typeWf:relationBusiness, dataHaveRight:dataHaveRight},'x');
    		$("#borrowDetails").flexigrid({
    			url :__url,
				editable: true,
				beforeSend:function(xhr) {},
		        complete:function(){},
				dataType : 'json',
    			colModel : __colModel,
    			buttons : [],
    			singleSelect:true,
    			usepager : true,
    			useRp : true,
    			rp : 20,
    			nomsg : "没有数据",
    			showTableToggleBtn : false,
    			pagetext : '第',
    			outof : '页 /共',
    			width : 'auto',
    			height : 290,
    			pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
    		});
    		$("#borrowDetails").flexOptions({url:__url}).flexReload();
			
		},
		
		//初始化显示档案著录目录树
		createFileTree : function(){
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
				var relationBusiness=$('.formStartPage').attr('relationBusiness');
				zTree = $.fn.zTree.getZTreeObj("filetree");
				zTree.expandNode(treeNode);
				//archiveName=treeNode.name;
				archiveType=treeNode.archivetype;
				if(treeNode.sId!=0 && treeNode.isParent!=true){
					strucid=treeNode.sId;
					if(relationBusiness == 'destroy'){
						var oldDestroy = $("#borrowDetails").find("input[name='id3']");
						if(oldDestroy.length > 0){
							var oldDestroyTemp = oldDestroy[0].value; 
							var oldDestroySid = oldDestroyTemp.substring(oldDestroyTemp.lastIndexOf("@")+1,oldDestroyTemp.indexOf("||"));
							if(strucid != oldDestroySid){
								$.ajax({
									url:$.appClient.generateUrl({ESIdentify:'getTreeNodeTitlesByStructureId'},'x'),
									async:false,
									type:'post',
									data:{sid:oldDestroySid},
									success:function(treetitles){
										formStartHandle.showMsg('请选择节点为"'+treetitles+'"的节点的数据！', '3');
									}
								});
								return false;
							}
						}
					}
					var path=treeNode.path;
					var reg=/\//g;
					nodePath=path.replace(reg, '-');
					var url=$.appClient.generateUrl({ESFormStart:'datalist',path:nodePath},'x');
					$("#borrowlistbox").load(url);
					$("#borrowlistbox").css('border-left', '0px');
				}
			};
			var url = $.appClient.generateUrl({ESFormStart:'getTree',status:4},'x');
			$.ajax({
				url:url,
				dataType: 'json',
				success:function(nodes){
					$.fn.zTree.init($("#filetree"), setting, nodes);
				},
				cache:false
			});
		},
		
		//去除数据信息
		delDetails : function(){
			var checkboxes=$("#borrowDetails").find("input[name='id3']:checked");
			if(checkboxes.length==0){
				formStartHandle.showMsg('请选择要删除的数据！', '3');
				return;
			}
			$.dialog({
				content:'确认要删除吗?',
				ok:true,
				okVal:'确认',
				cancel:true,
				cancelVal:'取消',
				ok:function(){
					if(checkboxes.length > 0){
						checkboxes.each(function(){
							$(this).closest("tr").remove();
						});
						$("input[name='ids3']").attr("checked",false);
						addAttachData.setSelectDataPath();
						// 判断，如果不是新建协同，对数据库进行操作
						if ($('.formStartPage').attr('wfType')!='') {
							addAttachData.deleteDataDetail(checkboxes);							
						} else {
							var relationBusiness=$('.formStartPage').attr('relationBusiness');
				    		var __colModel=[
										{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
										{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
										{display: 'documentFlag', name : 'documentFlag',hide:true,sortable : false, width : 160,align: 'left',metadata:'documentFlag'},
										{display: '操作', name : 'handle',sortable : false, width : 30,align: 'left',callback:function(){addAttachData.showAttachData();return false ;}},
										{display: '数据名称', name: 'title',sortable : true,width : 480,align: 'left',metadata:'Title'},
										{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
									];
				    		if(relationBusiness == 'using'){//利用流程增加权限字段
				    			__colModel=[
										{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
										{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
										{display: 'documentFlag', name : 'documentFlag',hide:true,sortable : false, width : 160,align: 'left',metadata:'documentFlag'},
										{display: '操作', name : 'handle',sortable : false, width : 30,align: 'left',callback:function(){addAttachData.showAttachData();return false ;}},
										{display: '数据名称', name: 'title',sortable : true,width : 230,align: 'left',metadata:'Title'},
										{display: '文件浏览', name: 'isRead',sortable : true,width : 45, align: 'center'},
										{display: '浏览天数', name: 'readDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'readDate'},
										{display: '文件下载', name: 'isDownload',sortable : true,width : 45, align: 'center'},
										{display: '下载天数', name: 'downloadDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'downloadDate'},
										{display: '文件打印', name: 'isPrint',sortable : true,width : 45,align: 'center'},
										{display: '打印天数', name: 'printDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'printDate'},
										{display: '实体借阅', name: 'useEntity',sortable : true,width : 45, align: 'center'},
										{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
									];
				    		}
				    		addAttachData.getAttachDataList(__colModel);
						}						
					}
				},
				cache:false
			});
		},
		//修改添加的数据附件的Path字符串
		setSelectDataPath : function(){
			var trs=$("#borrowDetails").find("input[name='id3']");
			if(trs.length==0){
				$('.formStartPage').attr('dataList', '') ;
			}else{
				var dataList = '';
				trs.each(function(){
					var path=$(this).val();
					var bothPath=path.split('|');
					dataList += bothPath[0]+'|';
				});
				$('.formStartPage').attr('dataList', dataList) ;
			}
		},
		showAttachData : function(){
			formStartHandle.showMsg('查看数据',1);
			
		},
		createMsgFileUploadWin: function(){
			
			$.dialog({
				title:'上传文件',
	    		width: '450px',
	    	   	height: '250px',
	    	    fixed:true,
	    	    resize: false,
	    		content:"<div id='contentForAttachFile'><div class='fieldset flash' id='fsUploadProgressForAttachFile'></div></div>",
	    		cancelVal: '关闭',
	    		cancel: true,
	    		padding: '10px',
				button: [
		    		{id:'btnAddForAttachFile', name: '添加文件'},
		            {id:'btnCancelForAttachFile', name: '删除所有', disabled: true},
		            {id:'btnStartForAttachFile', name: '开始上传', disabled: true, callback: function(){return false;}}
				],
				init:addAttachData.createSWFUpload
	    	});	 
		},
		createSWFUpload: function(){
			var tplPath = $('.formStartPage').attr('tplPath') ;
//			alert(tplPath);
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
				button_placeholder_id : "btnAddForAttachFile",
				button_width: 72,
				button_height: 28,
				
				// Flash文件地址设置
				flash_url : tplPath+"/public/SWFUpload/js/swfupload.swf",
				
				custom_settings : {
					progressTarget : "fsUploadProgressForAttachFile",
					cancelButtonId : "btnCancelForAttachFile",
					startButtonId : "btnStartForAttachFile",
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
			$("#btnCancelForAttachFile").click(function(){cancelQueue(upload);});
			$("#btnStartForAttachFile").click(function(){
				$.post($.appClient.generateUrl({ESIdentify:'getUploadURL'},'x'),  function(data){
					upload.setUploadURL(data);
					startQueue(upload);
				});
			});
			// 挂接文件
			function extendFile(fileid, filename, extName, remainder){
				if($('#attachFileDataTable').attr('filePaths') == ''){
					$('#attachFileDataTable').attr('filePaths', fileid) ;
					$('#attachFileDataTable').attr('fileNames', filename) ;
				}else{
					$('#attachFileDataTable').attr('filePaths', $('#attachFileDataTable').attr('filePaths')+'|'+fileid) ;
					$('#attachFileDataTable').attr('fileNames', $('#attachFileDataTable').attr('fileNames')+'|'+filename) ;
				}
				addAttachData.addHandleWfRow(fileid, filename, extName);
			};
		},
		addHandleWfRow: function(fileid, filename, extName){
			 extName = extName.toLowerCase() ;
			 extName = extName+".png"
		     var root = document.getElementById("attachFileDataTable");
		     var newRow = root.insertRow();
		     var newCell1 = newRow.insertCell();
//	  		 newCell1.bgColor= "#F2F5F8";   
//	  		 newCell1.width= "660";   
	  		 newCell1.align= "left";   
//		     newCell1.innerHTML = "<a href='#' style=\"margin-left:5px;\" title=\"点击下载\" onclick=\"window.location.href='baseUtilAction.html?content.method=downloadFile&enco=true&filepath=" + encodeURI(encodeURI(newFilePath)) + "&filename="+encodeURI(encodeURI(filename))+"' ;\" style=\"color:0000ff;text-decoration:underline\">"+filename+"</a><%if(isHandleThisWf){%><a style=\"margin-left:10px;\"  href='#' title=\"点击删除\" onclick=\"formApprovalHandle.deleteHandleWfFileData(this,'"+filename+"') ;\" style=\"color:0000ff;text-decoration:underline\">删除</a><%}%>";
		     newCell1.innerHTML = "<a href='#' style=\"margin-left:5px;\" title=\"点击下载\" onclick=\"formApprovalHandle.downloadFile('"+fileid+"')\" style=\"color:0000ff;text-decoration:underline\"><span class='fileicon'></span>"+filename+"</a><a style=\"margin-left:10px;\"  href='#' title=\"点击删除\" onclick=\"addAttachData.deleteHandleWfFileData(this,'"+filename+"') ;\" style=\"color:0000ff;text-decoration:underline\">删除</a>";
	  		 var allRows = root.getElementsByTagName('tr');
	  		 
	  		 // longjunhao 20140722 判断是否新建协同，若流程已发起，添加到数据库中
	  		 var dataId = $('.formStartPage').attr('dataid');
	  		 if (dataId != "" && dataId != '-1') {
	  			 var wfId = $('.formStartPage').attr('wfId');
	  			collaborativeHandle.addAttachFile2DB(fileid, filename,dataId,wfId);
	  		 }
	  		 
	  	},
		/** 删除文件附件 **/
		deleteHandleWfFileData: function(obj,fileName){
			$.dialog({
				content : '您确定要删除当前文件吗？',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					formApprovalHandle.removeHandleWfRow(obj); 
	   				var filePaths = $('#attachFileDataTable').attr('filePaths') ;
	   				var fileNames = $('#attachFileDataTable').attr('fileNames') ;
	   				if(filePaths.indexOf('|')==-1){
		   			    $('#attachFileDataTable').attr('filePaths', '') ;
						$('#attachFileDataTable').attr('fileNames', '') ;
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
		   			 	 	$('#attachFileDataTable').attr('filePaths', filePathsArray[0]) ;
							$('#attachFileDataTable').attr('fileNames', fileNamesArray[0]) ;
		   			 	}else{
		   			 		filePaths = filePathsArray[0] ;
		   			 		fileNames = fileNamesArray[0] ;
		   			 		for(j=1; j<filePathsArray.length; j++) {
		   			 			filePaths = filePaths+'|'+filePathsArray[j];
		   			 			fileNames = fileNames+'|'+fileNamesArray[j];
			   			 	}
		   			 	 	$('#attachFileDataTable').attr('filePaths', filePaths) ;
							$('#attachFileDataTable').attr('fileNames', fileNames) ;
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
	  	batchEditReadDate : function(_title,_fileReadOrDownLoad){
	  		if(($('#formStartPage').attr('dataList')).length==0){
	  			formStartHandle.showMsg('对不起，没有待设置的数据，不能进行此操作！', '3');
	  			return;
	  		}
	  		$.dialog({
//	  			title:'批量修改浏览天数',
	  			title:_title,
				content : '<div id="batchEditReadDateDIV"><input type="text" name="batchEditReadDateForm" /></div>',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					var dataList = "";
					var valueDate = $("#batchEditReadDateDIV").find("input[name='batchEditReadDateForm']").val();
					var reg = /^[1-9]\d*$/;
					if(!reg.test(valueDate)){
						$("#batchEditReadDateDIV").find("input[name='batchEditReadDateForm']").val("0");
						return false;
					}
//					$("#borrowDetails").find("td[colname='readDate'] div").html(valueDate);
					var checkboxs = $("#borrowDetails").find("input[name='id3']:checked");
					if(checkboxs.length > 0){
						checkboxs.each(function(){
							var trObj=$(this).closest('tr');
							var checkpath = $(this).val();
							var getFile=checkpath.split('|');
							dataList+=getFile[0]+'|';
						});
					}else{
						dataList=$('#formStartPage').attr('dataList');
					}
//					var fileReadOrDownLoad = 'FileRead';
					var fileReadOrDownLoad = _fileReadOrDownLoad;
					var isApp = '1';
					addAttachData.batchChangeFileReadOrDownLoadRight(fileReadOrDownLoad,isApp,dataList,valueDate);
				}
			});
	  	},
	  	batchEditEntityData : function(){
	  		if(($('#formStartPage').attr('dataList')).length==0){
	  			formStartHandle.showMsg('对不起，没有待设置的数据，不能进行此操作！', '3');
	  			return;
	  		}
	  		$.dialog({
	  			title:'批量修改实体借阅',
				content : '<div id="batchEditReadDateDIV"><input type="checkbox" name="batchEditReadDateForm" /></div>',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					var dataList = "";
					var valueDate = "0";
					var tempObj = $("#batchEditReadDateDIV").find("input[name='batchEditReadDateForm']");
					if(tempObj.is(':checked')){
						valueDate = "1";
					}else{
						valueDate = "0";
					}
					var checkboxs = $("#borrowDetails").find("input[name='id3']:checked");
					if(checkboxs.length > 0){
						checkboxs.each(function(){
							var trObj=$(this).closest('tr');
							var checkpath = $(this).val();
							var getFile=checkpath.split('|');
							dataList+=getFile[0]+'|';
						});
					}else{
						dataList=$('#formStartPage').attr('dataList');
					}
					var fileReadOrDownLoad = 'FileLend';
					var isApp = '1';
					addAttachData.batchChangeFileReadOrDownLoadRight(fileReadOrDownLoad,isApp,dataList,valueDate);
				}
			});
	  	},
	  	// 添加数据附件到数据库 longjunhao 20140624
	  	addDataDetail: function(){
	  		var wfId = $('.formStartPage').attr('wfId');
	  		var dataId = $('.formStartPage').attr('dataId');
	  		var stepId = $('.formStartPage').attr('stepId');
	  		var searchDataType = $('.formStartPage').attr('wfType');
	  		var relationBusiness=$('.formStartPage').attr('relationBusiness');
			var checkPaths = '';
			var checkboxs = $("#borrowlist").find("input[name='path']:checked");
			if (checkboxs.length > 0 ){
				checkboxs.each(function(){
					var checkpath = $(this).val();
					checkPaths += checkpath + '|';
				});
				if(relationBusiness == 'destroy'){
					/**wanghongchen 如果是销毁流程，筛选要销毁的数据**/
					$.ajax({
						url : $.appClient.generateUrl({ESArchiveDestroy:'getDestroyDataList'},'x'),
						type : 'post',
						dataType : 'json',
						async : false,
						data : {dataList:checkPaths,strucid:strucid,nodePath:nodePath},
						success : function(destroyRt){
							if(destroyRt.destroyNum == 0){
								$.dialog.notice({content:destroyRt.msg,icon:'warning',time:3});
							}else{
								$.dialog({
									title : "提示",
									content : destroyRt.msg,
									cancel : true,
									ok : function(){
										$.ajax({
											type : 'POST',
											url : $.appClient.generateUrl({ESCollaborative : 'addDataDetail'}, 'x'),
											//wanghongchen 20140912 此处checkPaths传值改为查询出来的数据，解决销毁时添加案卷不能自动选择卷内的问题
											data : { wfId : wfId, checkPaths : destroyRt.dataList, dataId:dataId,stepId:stepId,searchDataType:searchDataType},
											success : function(res) {
												var json = eval('(' + res + ')');
												if (json.success) {
													//刷新数据附件列表
													$("#borrowDetails").flexReload();
													//关闭添加数据附件窗口
													art.dialog.list['linkdialog'].close();
												}
											},
											error : function() {
												formStartHandle.showMsg('添加数据附件失败！', '2');
											}
										});
									}
								});
							}
						}
					});
				}else{
					$.ajax({
						type : 'POST',
						url : $.appClient.generateUrl({ESCollaborative : 'addDataDetail'}, 'x'),
						data : { wfId : wfId, checkPaths : checkPaths, dataId:dataId,stepId:stepId,searchDataType:searchDataType},
						success : function(res) {
							var json = eval('(' + res + ')');
							if (json.success) {
								//刷新数据附件列表
								$("#borrowDetails").flexReload();
								//关闭添加数据附件窗口
								art.dialog.list['linkdialog'].close();
							}
						},
						error : function() {
							formStartHandle.showMsg('添加数据附件失败！', '2');
						}
					});
				}
			}else{
				$.dialog.notice({title:'操作提示',content:'请选择您要添加的数据！',icon:'warning',time:3});
				return false;
			}
	  	},
	  	// 删除数据附件DB longjunhao 20140624
	  	deleteDataDetail: function(checkboxes){
			var checkIds = '';
			var checkPaths = '';
			if (checkboxes.length > 0 ){
				checkboxes.each(function(){
					var checkValue = $(this).val();
					var checks = checkValue.split('||');
					if (checks.length > 1) {
						checkPaths += checks[0] + '|'; 
						checkIds += checks[1] + '|';
					} else {
						checkPaths += checks[0] + '|';
					}
				});
				$.ajax({
					type : 'POST',
					url : $.appClient.generateUrl({ESCollaborative : 'deleteDataDetail'}, 'x'),
					data : {checkIds : checkIds ,checkPaths:checkPaths},
					success : function(res) {
						var json = eval('(' + res + ')');
						if (json.success) {
							//刷新数据附件列表
							$("#borrowDetails").flexReload();
						}
					},
					error : function() {
						formStartHandle.showMsg('删除数据附件失败！', '2');
					}
				});
				/** wanghongchen 20140807 如果是销毁流程，删除附件数据时更改数据销毁状态 **/
				if($('.formStartPage').attr('relationBusiness') == 'destroy'){
					var dataid = $('.formStartPage').attr('dataid');
					var wfId = $('.formStartPage').attr('wfId');
					var type = "save";
					if(wfId != -1){
						type = "deal";
					}
					$.ajax({
						type : 'POST',
						url : $.appClient.generateUrl({ESArchiveDestroy : 'updateDataDestroyStatus'}, 'x'),
						data : {paths:checkPaths,dataid:dataid,wfId:wfId,type:type}
					});
				}
			}else{
				$.dialog.notice({title:'操作提示',content:'请选择您要删除的数据！',icon:'warning',time:3});
				return false;
			}
	  	},
	  	batchChangeFileReadOrDownLoadRight : function(fileReadOrDownLoad,isApp,selectPath,dateRight){//修改权限
	  		var url=$.appClient.generateUrl({ESFormStart:'batchChangeFileReadOrDownLoadRight'},'x');
	  		var __data = {fileReadOrDownLoad:fileReadOrDownLoad, isApp:isApp, selectPath:selectPath, dateRight:dateRight};
	  		if(($('#formStartPage').attr('dataid'))=='-1'){
	  			__data = {fileReadOrDownLoad:fileReadOrDownLoad, selectPath:selectPath, dateRight:dateRight};
	  		}
	  		$.ajax({
				type:'POST',
				beforeSend:function(xhr) {},
		        complete:function(){},
		        url : url,
		        data: __data,
			    success:function(data){
//			    	formStartHandle.showMsg('修改成功……', '1');
//			    	var __colModel=[
//									{display: '序号', name : 'num', width : 20, align: 'center',metadata:'num'}, 
//									{display: '<input type="checkbox" name="ids3" id="">', name : 'id3', width : 30, align: 'center'},
//									{display: 'documentFlag', name : 'documentFlag',hide:true,sortable : false, width : 160,align: 'left',metadata:'documentFlag'},
//									{display: '操作', name : 'handle',sortable : false, width : 30,align: 'center'},
//									{display: '数据名称', name: 'title',sortable : true,width : 230,align: 'left',metadata:'Title'},
//									{display: '文件浏览', name: 'isRead',sortable : true,width : 45, align: 'center'},
//									{display: '浏览天数', name: 'readDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'readDate'},
//									{display: '文件下载', name: 'isDownload',sortable : true,width : 45, align: 'center'},
//									{display: '下载天数', name: 'downloadDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'downloadDate'},
//									{display: '文件打印', name: 'isPrint',sortable : true,width : 45,align: 'center'},
//									{display: '打印天数', name: 'printDate',sortable : true,width : 45,align: 'right',editable:true,metadata:'printDate'},
//									{display: '实体借阅', name: 'useEntity',sortable : true,width : 45, align: 'center'},
//									{display: 'pkgPath', name : 'pkgPath',hide:true,sortable : false, width : 160,align: 'left',metadata:'pkgPath'}
//								];
//			    	addAttachData.getAttachDataList(__colModel);
			    	$("#borrowDetails").flexReload();
			    },
			    cache:false
			});
	  		
	  	},
	  	myFormModelShowPkg_event : function(obj){
//	  		formStartHandle.showMsg('查看数据附件…………！', '1');
	  		var url=$.appClient.generateUrl({ESFormStart:'myFormModelShowPkg'},'x');
//	  		alert(obj);
	  		var trObj=obj.closest('tr');
	  		var selectPath = $("#borrowDetails").flexGetColumnValue(trObj,['pkgPath']);
//	  		alert(selectPath);
			$.ajax({
				type:'POST',
			    url:url,
			    data:{selectPath:selectPath},
			    success:function(data){
			    	if(data == "1"){
			    		addAttachData.show_file(selectPath);
			    	}else{
			    		$.dialog({
			    			id:'myFormModelShowPkgWin',
			    			title:'数据附件',
			    			width: '800px',
			    			height:'520px',
//				    	width: 'auto',
//				    	height:'auto',
			    			padding:'0px',
			    	   	fixed:  false,
//			    	    resize: false,
			    			autoOpen:true,
			    			fixPosition:true,
			    			resizable:false,
			    			modal:true,
			    			bgiframe:true,
			    			content:data
			    		});
			    	}
				},
				cache:false
			});
	  	},
	  	myFormModelShowChildPkg_event : function(obj){
//	  		formStartHandle.showMsg('查看数据附件…………！', '1');
	  		var url=$.appClient.generateUrl({ESFormStart:'myFormModelShowChildPkg'},'x');
//	  		alert(obj);
	  		var trObj=obj.closest('tr');
	  		var selectPath = $("#myFormModelShowPkgChildTABLE").flexGetColumnValue(trObj,['pkgPath']);
//	  		alert(selectPath);
			$.ajax({
				type:'POST',
			    url:url,
			    data:{selectPath:selectPath},
			    success:function(data){
			    	if(data == "1"){
			    		addAttachData.show_file(selectPath);
			    	}else{
			    		$.dialog({
			    			id:'myFormModelShowChildPkgWin',
			    			title:'数据附件',
			    			width: '800px',
			    			height:'520px',
//				    	width: 'auto',
//				    	height:'auto',
			    			padding:'0px',
			    	   	fixed:  false,
//			    	    resize: false,
			    			autoOpen:true,
			    			fixPosition:true,
			    			resizable:false,
			    			modal:true,
			    			bgiframe:true,
			    			content:data
			    		});
			    		
			    	}
				},
				cache:false
			});
	  	},
	  //查看电子文件
	  	show_file : function(path){
	  		var wfId = $('.formStartPage').attr('wfId');
	  		//定义临时权限
	  		var tempReadRight = 'false';
	  		var tempPrintRight = 'false';
	  		var tempDownloadRight = 'false';
	  		
//	  		alert(wfId);
	  		$.ajax({
				url:$.appClient.generateUrl({ESIdentify:'isHasFileReadRight',path:path},'x'),
				cache:false,
				success:function(isHas){
					if(isHas === 'false'){
//						alert(path +'    '+wfId);
						var url1 = $.appClient.generateUrl({ESFormStart:'getTempRightByPath'},'x');
						$.ajax({
							url:url1,
							cache:false,
							data:{path:path,wfId:wfId},
							type : 'POST',
							dataType:'json',
							async:false,
							success:function(data){
								tempReadRight = data.tempReadRight;
								tempPrintRight = data.tempPrintRight;
								tempDownloadRight = data.tempDownloadRight;
								if('true' == tempReadRight){
									var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path,tempReadRight:tempReadRight,tempPrintRight:tempPrintRight,tempDownloadRight:tempDownloadRight},'x');
									$.ajax({
										url:url,
										cache:false,
										async:false,
										success:function(data1){
											$.dialog({
												title:'浏览电子文件',
												width: '960px',
												fixed: false,
												resize: false,
												padding: 0,
												top: '10px',
												content:data1
											});
										}
									});
								}else{
									$.dialog.notice({content: '您对当前数据下的所有原文都没有文件浏览权限，不能进行此操作！', time: 5, icon: 'warning', lock: false});
									return ;
								}
							}
						});
					}else{
						var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path,tempReadRight:tempReadRight,tempPrintRight:tempPrintRight,tempDownloadRight:tempDownloadRight},'x');
						$.ajax({
							url:url,
							cache:false,
							async:false,
							success:function(data1){
								$.dialog({
									title:'浏览电子文件',
									width: '960px',
									fixed: false,
									resize: false,
									padding: 0,
									top: '10px',
									content:data1
								});
							}
						});
					}
				}
	  		});
	  	},
	  	//guolanrui 20141016 重新写上方的JS function 增加临时权限
	  	show_file_new : function(path,wfId){
	  		$.ajax({
	  			url:$.appClient.generateUrl({ESIdentify:'isHasFileReadRight',path:path},'x'),
	  			cache:false,
	  			success:function(isHas){
	  				if(isHas === 'false'){
	  					//TODO guolanrui 20141015 去后台查找临时浏览
	  					
	  					
	  					$.dialog.notice({content: '您对当前数据下的所有原文都没有文件浏览权限，不能进行此操作！', time: 5, icon: 'warning', lock: false});
	  					return ;
	  				}
	  				var url = $.appClient.generateUrl({ESIdentify:'file_view',path:path},'x');
	  				$.ajax({
	  					url:url,
	  					cache:false,
	  					success:function(data){
	  						$.dialog({
	  							title:'浏览电子文件',
	  							width: '960px',
	  							fixed: false,
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
	  	
		
		
		
}

/** 添加数据附件按钮处理方法 **/
$("#addAttachDataBtn").die().live("click", function(){
	addAttachData.addEditDetails();
}); 
/** 删除数据附件按钮处理方法 **/
$("#deleteAttachDataBtn").die().live("click", function(){
	addAttachData.delDetails();
}); 

/** 添加文件附件按钮处理方法 **/
$("#addAttachFileBtn").die().live("click", function(){
	addAttachData.createMsgFileUploadWin();
}); 