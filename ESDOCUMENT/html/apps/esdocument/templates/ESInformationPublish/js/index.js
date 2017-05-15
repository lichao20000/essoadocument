/*
 * author # fangjixiang
 * date # 20121031
 */

var _size = (function (i){
	var width = $(document).width()*0.96; // 可见总宽度
	var height = $(document).height()-143; // 可见总高度 - 176为平台头部高度
	if(navigator.userAgent.indexOf("MSIE 6.0")>0){
		
		width = width-6; // 6为兼容IE6
		
	}else if(navigator.userAgent.indexOf("MSIE 8.0")>0){
		width = width-4; // 4为兼容IE8
		height = height-4;
	}

	var leftwidth = 220; // 左侧宽度
	var rightwidth = width - leftwidth-10; // 右侧宽度
	var tblheight = height - 115; // 表格插件自己高度
	var editorwidth = rightwidth-20-36; // 20px:滚动条宽度，60px:margin:0 30px;
	var size = {
			leftwidth: leftwidth,
			rightwidth: rightwidth,
			leftheight: height, // 左右高度相同
			rightheight: height, // 左右高度相同
			tblheight: tblheight,
			editorwidth: editorwidth
			
	};
	return size;
	
})();
var _pic_src = '';
var _global = {
		localPath: false,
		boardTree: undefined, // 栏目树节点对象
		boardNode: undefined, // 栏目当前被单击节点对象
		content: undefined, // ckeditor
		workId: undefined, // 待办
		taskId: undefined, // 待办
		topicId: undefined, // 信息
		leader: undefined, // 待办提交给领导审批暂存
		taskFlag: false, // = false|publish|destroy.indentify
		taskEvent: false, // = back|null
		taskSize: 0, // publish = 4
		countTextAer:0
};

/*
 * 清除待办数据验证
 * 初始化待办类型
 * type是待办类型如:publish|identify...
 */
(function (){
	var hashStr = window.location.hash;// #task|type='publish,back'|workId|taskId|boardId|topicId|time
	var hash = hashStr.split('|'); // [#task,type,workId,taskId,boardId,topicId,time]
	if(hash[0] == '#task'){
		var p = hash[1].split(','); // publish,back
		_global.taskFlag = p[0]; // publish
		_global.taskEvent = p[1]; // back
		
		hash.shift(); // [type,workId,taskId,boardId,topicId,time]
		hash.shift(); // [workId,taskId,boardId,topicId,time]
		hash.pop(); // [workId,taskId,boardId,topicId]
		
		_global.taskSize = hash.length;
		window.location.hash = hash.join('|'); // workId|taskId|boardId|topicId
	}
})();

// 更改信息状态(是否发布)
$('.modifyStatus').live('click',function (){
	var that = this;
	var boardId = _global.boardNode.id;
	var topicId = that.id;
	var process = $(that).attr('process');
	
	if(process == -1){ // 未提交审批
		$.dialog({
			
			content:'未提交审批，请提交审批',
			time:2,
			icon:'warning',
			lock:false
		});
	}else if(process == 0){// 审批中
		
		$.dialog({
			content:'审批中，不能修改发布状态',
			time:2,
			icon:'warning',
			lock:false
		});
		
	}else if(process == 2){// 审批中
		
		$.dialog({
			content:'审批被退回，请查看待办',
			time:2,
			icon:'warning',
			lock:false
		});
		
	}else if(process == 1){// 完成审批
		var permission = $(that).html() == '已发布' ? false : true; // 已发布改成为发布
		$.post(
			$.appClient.generateUrl({ESInformationPublish:'ModifyStatus'},'x'),
			{
				boardId: boardId,
				topicId: topicId,
				permission: permission
			},
			function (isok){
				if(isok){
					
					permission ? $(that).html('已发布') : $(that).html('未发布');
					
					$.dialog.notice({content:'修改成功',time:2,icon:'succeed'});
				}else{
					$.dialog.notice({content:'修改失败',time:2,icon:'error'});
				}
			}
		);
	}
	
	
});

// 增,删,改
var _curl = {
	/*
	 * 
	 * btype 值为：1 表示发布文章
	 * btype 值为：21 表示发布档案规范
	 * btype 值为：22 表示发布图说档案
	 * 根据btype的值获取不同的模型的值
	 * 
	*/
	saveOrprocess: function (isStartProcess,publish){ // 新建文章,档案规范|提交审批
		var topicId = $('#saveButton').attr('name') == 'default' ? '' : $('#saveButton').attr('name'); //如果是编辑主题则存在ID，新增则不存在
		//var isPublish = document.getElementById('isPublish').checked ? 1 : 0; //是否发布
		var isPublic = 0; //用户判断是否公开，只有集团才有的权限0表示不公开1表示公开，默认为0
		//var isComment = document.getElementById('isComment').checked ? 1 : 0; //是否需要评论，0表示不需要评论1表示需要评论，默认为0
		if(!$('#form1').validateCkeditor()){
			$.dialog.notice({content: '请正确填写信息！', time: 2,  icon:'warning'});
			return;
		};
		var title =_global.boardNode.type != 22?document.getElementById('editortitle').value:document.getElementById('editortitle1').value;// 标题
/*//		var titleSummary = document.getElementById('title_summary').value;// 标题摘要
		ntitle = title.replace(/[^\x00-\xff]/g,'xx');
		if(ntitle.length > 100){
			$.dialog.notice({content: '标题的内容不能超过个50个汉字!', time: 2, lock: false, icon:'warning'});
			return;
		}*/
		var summary = document.getElementById('summary').value;// 摘要
/*		summary11 = summary.replace(/[^\x00-\xff]/g,'xx');
		if(summary11.length > 500){
			$.dialog.notice({content: '摘要的内容不能超过个250个汉字!', time: 2, lock: false, icon:'warning'});
			return;
		}
		if(summary == '请输入内容摘要'){
			summary = '';
		}
		if(title == '请输入标题'){
			$.dialog.notice({content: '标题不能为空!', time: 2, lock: false, icon:'warning'});
			return;
		}*/
		var params = {
				topicId: topicId, // 文章ID
				status: '1', // 是否发布
				appStatus:'0',
				publicStatus: isPublic, // 是否公开
				commentStatus: '0', // 是否评论,0暂时写死
				boardId: _global.boardNode.id, // 栏目ID
				title: title,
				itemsText: [{text:'',summary:summary}],
				isStartProcess: isStartProcess // 是否启动流程
			};
		var picSrc = '';
		if(_pic_src.length>0){
			picSrc = _pic_src.substring(1,_pic_src.length);
			params['picSrc'] = picSrc;
		}
		if(isStartProcess === 'true'){
			
			if(typeof _global.leader === 'undefined'){
				return false;
			}
			
			params.leader = _global.leader;
		}
		
		if(_global.boardNode.type == 21){//发布档案规范
			
			var fileInfo = $('#InsertPosition .fileInfo');
			if(fileInfo.length<1){
			
				$.dialog.notice({content: '请上传附件', time: 2, lock: false, icon:'warning'});
				return;
			}
			
			var fileList = [];
			fileInfo.each(function (){
				var fileSize = $(this).attr('fsize'); // 文件大小
				var addressMark = $(this).attr('mark'); // 文件唯一名称
				var fileName = $(this).attr('name'); // 文件名称
				var id = $(this).attr('id') == 'null' ? '' : $(this).attr('id'); // 文件名称
				fileList.push({fileName:fileName,fileSize:fileSize,addressMark:addressMark, id:id});
			});
			
			params.itemsFile = fileList;
			var text = _global.content.getData();// 内容
			var tt = [];
			tt.push({text:text,summary:summary})
			params.itemsText = tt;
		}else if(_global.boardNode.type ==22){// 保存图说档案
			var imgPath = $('#InsertPosition .imgPath');
			if(imgPath.length<1){
			
				$.dialog.notice({content: '请上传图片', time: 2, lock: false, icon:'warning'});
				return;
			}
			
			var picList= [],iname = [];//图片路径列表
			var flag = false;
			imgPath.each(function (i){
				var con = CKEDITOR.instances[$(this).attr('text')].getData();
				con = con.replace(/[^\x00-\xff]/g,'xx');
				if(con.length > 1000){
					flag = true;
				}
				if(i==0){
					picList.push({address:$(this).attr('path'), shown:1, fileSize:0,realWidth:$(this).attr('realWidth'),realHeight:$(this).attr('realHeight'), fileName: $(this).attr('iname'),text:CKEDITOR.instances[$(this).attr('text')].getData()});
				}else{
					picList.push({address:$(this).attr('path'), shown:0, fileSize:0,realWidth:$(this).attr('realWidth'),realHeight:$(this).attr('realHeight'), fileName: $(this).attr('iname'),text:CKEDITOR.instances[$(this).attr('text')].getData()});
				}
			});
			if(flag){
				$.dialog.notice({content:'图片内容描述不能超过500汉字', time:2, icon:'error', lock:false});	
				return false;
			}
			params.itemsFile = picList;
		}else{
			var text = _global.content.getData();// 内容
			if(text==null || $.trim(text.replace(/&nbsp;/g,''))==''){
				$.dialog.notice({content:'正文内容不能为空!', time:2, icon:'warning', lock:false});	
				return false;
			}
			var tt = [];
			tt.push({text:text,summary:summary})
			params.itemsText = tt;
		}
		if(publish !=undefined && publish !=null && publish=='true'){
			var html="<div id='showSumPics' class ='showSumPics'>" +
			"<input type='button' id='updateSumPic' class='buttons submit' name='default' value='上传APP端封面' style='margin:5px 0px 0 10px;width:90px; ' />" +
			"<div id='InsertCoverImagePosition'  class='insert_position'></div>" +
			"<div id='title_for' class='title_for'>*上传封面则会同时发布到手机APP端！</div>"
			"</div>";
			$.dialog({
				title:'上传封面图片',
				width: '300px',
				height:'120px',
				padding:0,
				content:html,
				ok:function(){
					
					var fileId = '0';
					if($('#InsertCoverImagePosition .imgPath').length>0){
						
						fileId = $('#InsertCoverImagePosition .imgPath').attr('fileId');
					}
					params.status = 1;
					if(fileId!='0')params.appStatus = 1;
					params.imgId = fileId;
					var param=$.param(params);//序列化参数
					//通过ajax异步保存数据
					$.ajax({
						type:'post',
						data:param,
						dataType:'json',
						url:$.appClient.generateUrl({ESInformationPublish:'savePublishTopicAndStartProcess'},'x'),
						success:function (msg){
							if(msg.flag=='true'){
								$('.imgPath').attr('new','false');
								if(_global.taskFlag){ // 如果是待办过来的数据启动再次提交流程
									_curl.aginSubmit();
									return false;
								}
								if(msg.topicId!=''){
									$.dialog({
										content:'保存成功，是否继续录入',
										icon:'succeed',
										ok:_table.add,
										okVal:'是',
										cancel:_table.show,
										cancelVal:'否',
										ok: function (){
											if(_global.boardNode.id == 5){
												document.getElementById('editPic').style.display = 'block';
												document.getElementById('ArchiveTbl').style.display = 'none';
												// 初始化
												$('#editortitle1').val('请输入标题');
												$('#summary').val('请输入内容摘要');
												_global.content.setData('');
												$('#saveButton').attr('name','default');
												document.getElementById('saveButton').value = '保存';
												document.getElementById('saveButton').style.display = 'block';
												document.getElementById('process_now').style.display = 'none';
												document.getElementById('isPublish').checked = 0;
												document.getElementById('isPublic').checked = 0;
												
												_public.innerHtm();
											}else{
												document.getElementById('editor').style.display = 'block';
												document.getElementById('ArchiveTbl').style.display = 'none';
												// 初始化
												$('#editortitle').val('请输入标题');
												$('#summary').val('请输入内容摘要');
												_global.content.setData('');
												$('#saveButton').attr('name','default');
												document.getElementById('saveButton').value = '保存';
												document.getElementById('saveButton').style.display = 'block';
												document.getElementById('process_now').style.display = 'none';
												document.getElementById('isPublish').checked = 0;
												document.getElementById('isPublic').checked = 0;
												
												_public.innerHtm();
											}
											
										}
									});
								}else{
									$.dialog.notice({content:'保存发布成功！', time:2, icon:'succeed', lock:false});
									return ;
								}
							}
						},
						cache:false
					});
				},
				cancel:true,
				okVal:'发布',
				cancelVal:'取消'
			});
		}else{
			
			params.status = 0;
			params.appStatus = 0;
			var param=$.param(params);//序列化参数
			//通过ajax异步保存数据
			$.ajax({
				type:'post',
				data:param,
				dataType:'json',
				url:$.appClient.generateUrl({ESInformationPublish:'savePublishTopicAndStartProcess'},'x'),
				success:function (msg){
					if(msg.flag=='true'){
						$('.imgPath').attr('new','false');
						if(_global.taskFlag){ // 如果是待办过来的数据启动再次提交流程
							_curl.aginSubmit();
							return false;
						}
						if(msg.topicId!=''){
							$.dialog({
								content:'保存成功，是否继续录入',
								icon:'succeed',
								ok:_table.add,
								okVal:'是',
								cancel:_table.show,
								cancelVal:'否',
								ok: function (){
									if(_global.boardNode.id == 5){
										document.getElementById('editPic').style.display = 'block';
										document.getElementById('ArchiveTbl').style.display = 'none';
										// 初始化
										$('#editortitle1').val('请输入标题');
										$('#summary').val('请输入内容摘要');
										_global.content.setData('');
										$('#saveButton').attr('name','default');
										document.getElementById('saveButton').value = '保存';
										document.getElementById('saveButton').style.display = 'block';
										document.getElementById('process_now').style.display = 'none';
										document.getElementById('isPublish').checked = 0;
										document.getElementById('isPublic').checked = 0;
										
										_public.innerHtm();
									}else{
										document.getElementById('editor').style.display = 'block';
										document.getElementById('ArchiveTbl').style.display = 'none';
										// 初始化
										$('#editortitle').val('请输入标题');
										$('#summary').val('请输入内容摘要');
										_global.content.setData('');
										$('#saveButton').attr('name','default');
										document.getElementById('saveButton').value = '保存';
										document.getElementById('saveButton').style.display = 'block';
										document.getElementById('process_now').style.display = 'none';
										document.getElementById('isPublish').checked = 0;
										document.getElementById('isPublic').checked = 0;
										_public.innerHtm();
									}
									
								}
							});
							return ;
						}else{
							$.dialog.notice({content:'保存成功！', time:2, icon:'succeed', lock:false});
							return ;
						}
					}else if(msg.flag==''){
						$.dialog.notice({content:'保存失败', time:2, icon:'error', lock:false});
						return;
					}
				},
				cache:false
			});
		}
		
	},
	edit: function (topicId){ // 编辑文章,规范
		_pic_src = '';
		// 显示档案规范DIV标签
		$.ajax({
			type:'get',
			url:$.appClient.generateUrl({ESInformationPublish:'GetPublishTopic', topicId:topicId, boardId:_global.boardNode.id},'x'),
			dataType:'json',
			success:function (res){
				$('#ArchiveTbl').hide();	// 隐藏文章列表
				if(_global.boardNode.type == 22){
					$('#editPic').show();	// 隐藏文章列表
				}else{
					$('#editor').show();	// 隐藏文章列表
				}
				_public.innerHtm();
				$('#saveButton').attr('name',res.topicId); // 保存
				if(_global.boardNode.type == 22){
					$('#editortitle1').val(res.title); // 标题
				}else{
					$('#editortitle').val(res.title); // 标题
				}
				if(_global.boardNode.type != 22){
					$('#summary').val(res.summary); // 摘要
				}
				$('#saveButton,#saveAndStartProcessButton').attr('name',res.topicId); // 保存
//				$('#title_summary').val(res.itemsText[0].topicSummary); // 标题摘要
				_global.content.setData(res.text); // 内容
				$('#isPublish').checked = parseInt(res.status); // 发布
				$('#isPublic').checked = parseInt(res.publicStatus); // 公开
				// $('#isComment').checked = parseInt(res.commentStatus); // 评论,暂时未起用
				
				// ---- 初始化按钮 ---- //
				if(_global.taskFlag){ // 待办数据
					if(_global.taskEvent == 'back'){
						$('#saveButton').val('提交');
						$('#saveButton').show();
						$('#process_now').hide();
					}
				}else{ // 正常打开的编辑
					
					if(res.workflowid == 'null'){ // 未提交
						$('#process_now').hide();
						$('#saveButton').val('保存');
						$('#saveButton').attr('name',res.topicId); // 保存
						$('#saveButton').show();
						
					}else{ // 已经提交产生workId
						
						var prompt = null;
						if(res.process == 0){ // 0审批中
							
							$('#saveButton,#common_btns').hide();
							$('#process_now').html('温馨提示：该信息在审批中，暂时不能进行操作');
							$('#process_now').show();
							
						}else if(res.process == 2){ // 2退回
							
							$('#saveButton,#common_btns').hide();
							$('#process_now').html('温馨提示：该信息被退回，请回待办处理');
							$('#process_now').show();
						}else if(res.process == 1){ // 1完成
							$('#saveButton').hide();
							$('#saveButton').attr('name','default'); // 提交审批
							$('#common_btns,#process_now').show();
							$('#process_now').html('温馨提示：提交审批后将生成一条新信息,原信息不变');
						
						}else{ // -1未提交审批
							$('#process_now').hide();
							$('#saveButton').val('保存');
							$('#common_btns,#saveButton').show();
						}
						
					}
				
				}
				// ---- 初始化按钮结束 ---- //
					
					
					if(_global.boardNode.type == 21){ // 档案规范
						$('#InsertPosition').html('');
						var addhtml = '',leng = res.itemsFile.length;
						if(leng > 0){
							for(var i=0; i<leng; i++){
								var fsize = res.itemsFile[i].fileSize;
								var mark = res.itemsFile[i].addressMark;
								var name = res.itemsFile[i].fileName;
								var id = res.itemsFile[i].id;
								var ext = mark.split('.'),icon = null;
								
								if(ext[1] == 'doc' || ext[1] == 'docx'){
									
									icon = 'doc.gif';
									
								}else if(ext[1] == 'xls' || ext[1] == 'xlsx'){
									
									icon = 'xls.gif';
									
								}else if(ext[1] == 'ppt' || ext[1] == 'pptx'){
									icon = 'ppt.gif';
								}else if(ext[1] == 'pdf'){
								
									icon = 'pdf.gif';
								}else if(ext[1] == 'txt'){
								
									icon = 'txt.gif';
								}else if(ext[1] == 'zip' || ext[1] == 'rar'){
									icon = 'zip.gif';
								}else{
									icon = 'default.gif';
								}
								
								addhtml += '<div class="files_div" style="width:'+_size.editorwidth+'px;" >';
								addhtml += '<span class="file_icon"><img width=26  alt="'+ name +'" title="'+ name +'" src="'+ _global.localPath+ icon  +'" /></span>';
								addhtml += '<p class="file_name">附件名：'+ name +'</p>';
								addhtml += res.process == -1 || res.process == 1 ? '<a href="javascript:void(0)" class="rm_file" id="'+ id +'" mark="'+ mark +'">删除附件</a>' : '';
								addhtml += '<p class="file_size">附件大小：'+ fsize +'</p>';
								addhtml += "<input type='hidden' class='fileInfo' mark='"+mark+"' id='"+ id +"' name='"+name+"' fsize='"+fsize+"' />";
								addhtml += '</div>';
							}
						}
						$('#InsertPosition').append(addhtml);
						
					}else if(_global.boardNode.type == 22){ // 图说档案
						$('#InsertPosition').html('');
						var addhtml = '',leng = res.itemsFile.length;
						if(leng > 0){
							for(var i=0; i<leng; i++){ // -1未提交审批,1完成
								
								addhtml += "<div class='pic_beds'><div class='pic_bed'><div class='pic_bed_in'>";
								addhtml += '<img width="100" src="'+(res.itemsFile[i].address)+'" alt="'+ res.itemsFile[i].fileName +'" title="'+ res.itemsFile[i].fileName +'"  />';
								addhtml += "</div></div>";
								addhtml +=	"<div class='editorcontent1' > <textarea  id='editorcontentnew"+_global.countTextAer+"' style='width:700px;'></textarea></div>";
								addhtml += res.process == -1 || res.process == 1 ? "<span class='close_pic' title='删除图片'></span>" : "";
								addhtml += '<input type="hidden" new= "false" class="imgPath" path="'+(res.itemsFile[i].address)+'" text="editorcontentnew'+_global.countTextAer+'" iname="'+ res.itemsFile[i].fileName +'" realHeight="'+res.itemsFile[i].realHeight+'" realWidth="'+res.itemsFile[i].realWidth+'"/>';
								addhtml += "</div>";
								_global.countTextAer ++;
							}
						}
						$('#InsertPosition').append(addhtml);
						for(var i=0; i<leng; i++){
							CKEDITOR.replace(
									'editorcontentnew'+(_global.countTextAer-(leng-i-1)-1),
									{
									toolbarStartupExpanded:false,
							        toolbar :'Basic',
									enterMode:CKEDITOR.ENTER_BR,
									height: '45',
									resize_enabled: false,
									width: '700'	
								}).setData(res.itemsFile[i].text);
							CKEDITOR.instances['editorcontentnew'+(_global.countTextAer-(leng-i-1)-1)].on("instanceReady", function () {
						        this.on("blur", function(){
						        	if(this.getData().replace(/[^\x00-\xff]/g,'xx').length>1000){
						        		$('.'+$(this).attr('id')).css('border','1px solid red');
						        		$.dialog.notice({content:'图片内容描述不能超过500汉字', time:2, icon:'error', lock:false});	
										return false;
						        	}else{
						        		$('.'+$(this).attr('id')).css('border','0px');
						        	}
						        });  
						    });  
						}
					}
					
					
					
				} // success fn is end
				
		});
	}, // edit is end
	del: function (that){ // 删除附件
		
		var fileId = that.id;
		var mark = that.getAttribute('mark');
		
		$.dialog({
			content:'确定删除吗',
			icon:'warning',
			okVal:'确定',
			cancelVal:'取消',
			ok:function(){
			  	$.post(
			  		$.appClient.generateUrl({ESInformationPublish:'DeleteFile'},'x'),
			  		{fileId: fileId, mark: mark},
			  		function(isok){
				  		if(isok){
				  			$(that).parent().remove();
				  		}
			  		}
			  	);
			},
			cancel:true
		});
	},
	aginSubmit: function (){
		
		var params = {
				taskId: _global.taskId,
				workId: _global.workId,
				topicId: _global.topicId,
				agree: 'Approve',
				leader: _global.leader,
				status: document.getElementById('isPublish').checked ?  1 : 0
			};
		
		$.post(
			$.appClient.generateUrl({ESCollaborative:'AginStartstartInfoPublishFlow'},'x'),
			params,
			function (isok){
				if(isok){
					_global.taskFlag = false; // init
					window.location.hash = null;
					$('#rightfree .mDiv .ftitle').html(_global.boardNode.name+' • 信息列表'); // init
					_table.show(); // init
					
					$.dialog.notice({
						content:'提交成功',
						icon:'succeed',
						lock:false,
						time:2
					});
					
				}else{
					$.dialog.notice({
						content:'提交失败',
						icon:'error',
						lock:false,
						time:2
					});
				}
			}
		);
	}
};

/*
 * 复选框全选,取消全选,选中一个
 * checkBox.selectOne(this);
 * checkBox.selectAll(this,tblId));
 */
var checkBox = {
	selectOne : function (that){ // 单选|取消单选
		if($(that).attr('checked')=='checked'){
			$(that).closest('tr').addClass('trSelected');
		}else{
			$(that).closest('tr').removeClass('trSelected');
		}
	},
	selectAll : function (that,tblId){ // 全选|取消全选
		if($(that).attr('checked')=='checked'){
			$(that).attr('checked','checked');
			$('#'+tblId).find('tr').addClass('trSelected');
			$('#'+tblId).find('tr input[type="checkbox"]').attr('checked','checked');
		}else{
			$(that).removeAttr('checked');
			$('#'+tblId).find('tr').removeClass('trSelected');
			$('#'+tblId).find('tr input[type="checkbox"]').removeAttr('checked');
		}
	},
	cancelOne : function (cbObj){ // $('#id=4')
		cbObj.removeAttr('checked');
	},
	cancelAll : function (tblId){ // $('$tbl')
		var inputs = tblId.find('input[checked="checked"]');
		var l = inputs.length;
		for(var i=0; i<l; i++)
		{
		
			inputs.eq(i).removeAttr('checked');
		
		}
	}
};

// 复选框全选,取消全选,选中一个结束  //
//全选|不全选@方吉祥
$('#sinputA').live('click',function(){
	checkBox.selectAll(this,'ArchiveList');
});
// 单选
$('#ArchiveList input[name="inputsA"]').live('click',function(){
	checkBox.selectOne(this);
});

//----- 栏目树 ----- //
var _tree = {
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
				callback: {
					onClick: function (e,treeId, treeNode){
						//_global.boardTree.expandNode(treeNode);
						_global.boardNode = treeNode;
						if(treeNode.pId  == -1){
							_global.taskFlag = _global.taskEvent = false; // init
							_global.taskSize = 0; // init
							$('#rightfree .mDiv .ftitle').html( treeNode.name+' • 信息列表');
							_table.show();
						}
						if(treeNode.id==-1){
							_table.hide();
						}
					}
				}
				
		},
		init: function (){ // 初始化
			_table.hide();
			var that = this;
			$.getJSON(
				$.appClient.generateUrl({ESInformationPublish:'GetNavList'},'x'),
				function (nodes){
					_global.boardTree = $.fn.zTree.init($("#navlist"), that.setting, nodes);
					/*_tasks.publish(); // 在这里尝试初始化待办数据
					$('#navlist_1_a').hide();
					$('#navlist_1_switch').hide();
					$('#navlist_2_a').click();*/
				}
			);
		}
};
//----- 栏目树结束 ----- //
var _table = {
		init: function (){ // 初始化
			var that = this;
			$("#ArchiveList").flexigrid({
				url:false,
				dataType: 'json',
				colModel : [
				    {display :'数据标识',name :'id',hide:true,width:30,align:'center'}, 
					{display: '序号', name : 'linenumber', width : 24, align: 'center'},
					{display: '<input type="checkbox" id="sinputA">', name : 'checkbox', width: 24, align: 'center'},
					{display: '操作', name : 'editcontent', width : 24, align: 'center'},
					{display: '标题', name : 'title', width : 80, sortable : true, align: 'left'},
					{display: '发布人', name : 'author', width : 80, sortable : true, align: 'left'},
					{display: '发布时间', name : 'createTime', width : 150, sortable : true, align: 'center'},
					{display: '状态', name : 'status', width : 100, sortable : true, align: 'left',metadata:'status'},
					{display: '手机APP-状态', name : 'appStatus', width : 100, sortable : true, align: 'left',metadata:'appStatus'}
				],
				buttons : [
					{name: '新建', bclass: 'add', onpress: that.add},
					{name: '删除', bclass: 'delete', onpress: that.del},
					{name: '筛选', bclass: 'filter', onpress: that.filter},
					{name: '还原', bclass: 'back', onpress: that.removeFilter},
					{name: '发布', bclass: 'confirm', onpress: that.publishNews},
					{name: '取消PC端发布', bclass: 'delete', onpress: that.cancelPublish},
					{name: '取消手机端发布', bclass: 'delete', onpress: that.cancelPublish}
					],
				usepager: true,
				title: '信息列表',
				nomsg: '没有数据',
				showTableToggleBtn: false,
				useRp: true,
				width: _size.rightwidth,
				height:_size.tblheight
			});
		},
		show: function (){ // 显示表格
			document.getElementById('editor').style.display = 'none';
			document.getElementById('ArchiveTbl').style.display = 'block';
			var url = $.appClient.generateUrl({ESInformationPublish:'GetPublishTopicList',boardId:_global.boardNode.id},'x');
			$('#ArchiveList').flexOptions({url: url,query:'',newp: 1}).flexReload();
		},
		hide:function(){
			document.getElementById('editor').style.display = 'none';
			document.getElementById('ArchiveTbl').style.display = 'none';
		},
		add: function (){ // 新建文章
			_pic_src='';
			if(_global.boardNode == undefined||_global.boardNode.id=='-1'){
				$.dialog.notice({content:'请选择栏目信息',icon:'warning',time:2});
				return;
			}else if(_global.boardNode.id == 5){
				
				document.getElementById('editPic').style.display = 'block';
				document.getElementById('ArchiveTbl').style.display = 'none';
				// 初始化
				$('#editortitle1').val('请输入标题');
				$('#summary').val('请输入内容摘要');
				_global.content.setData('');
				$('#saveButton').attr('name','default');
//				$('#saveAndStartProcessButton').attr('name','default');
				document.getElementById('saveButton').value = '保存';
				document.getElementById('saveButton').style.display = 'block';
//				document.getElementById('saveAndStartProcessButton').style.display = 'block';
				document.getElementById('process_now').style.display = 'none';
				
				document.getElementById('isPublish').checked = 0;
				document.getElementById('isPublic').checked = 0;
				//document.getElementById('isComment').checked = 0;
				
				_public.innerHtm();
			}else{
				document.getElementById('editor').style.display = 'block';
				document.getElementById('ArchiveTbl').style.display = 'none';
				
				// 初始化
				$('#editortitle').val('请输入标题');
//				$('#title_summary').val('请输入标题摘要（APP客户端专用）');
				_global.content.setData('');
				$('#summary').val('请输入内容摘要');
				$('#saveButton').attr('name','default');
//				$('#saveAndStartProcessButton').attr('name','default');
				document.getElementById('saveButton').value = '保存';
				document.getElementById('saveButton').style.display = 'block';
//				document.getElementById('saveAndStartProcessButton').style.display = 'block';
				document.getElementById('process_now').style.display = 'none';
				
				document.getElementById('isPublish').checked = 0;
				document.getElementById('isPublic').checked = 0;
				//document.getElementById('isComment').checked = 0;
				
				_public.innerHtm();
			}
			$("iframe").contents().find("body").focus(function(){
				var title = $(this).html();
				if(title == ''){
					$(this).html('');
				}
			});
		},
		del: function (){ // 删除文章
			
			var cb = $('#ArchiveList input[name="inputsA"]:checked');
			var leng = cb.length;
			var ids = [],isProcess = false;
			
			cb.each(function (){ // 0 审批中,2为退回
				if($(this).attr('process') == '0' || $(this).attr('process') == '2'){
					isProcess = true;
				}
				ids.push(this.id);
				
			});
			
			if( _global.boardNode == undefined || _global.boardNode.id == -1){
				
				$.dialog.notice({ content:'请选择一个栏目', time:2, icon:'warning', lock:false});
				return;
			}else if(!leng){
				
				$.dialog.notice({ content:'请选择要删除的信息', time:2, icon:'warning', lock:false});
				return;
			}else if(isProcess){
				$.dialog.notice({ content:'删除的信息中含有审批或退回流程状态', time:2, icon:'warning', lock:false});
				return;
			}


			$.dialog({
				content:'确定删除',
				icon:'warning',
				lock:false,
				ok:function (){
					$.post(
						$.appClient.generateUrl({ESInformationPublish:'DeletePublishTopic'},'x'),
						{boardId:_global.boardNode.id, ids:ids.join(',')},
						function (msg){
							$('#ArchiveList').flexReload();
							if(msg =="success"){
								$.dialog.notice({content:"删除成功！",icon:'success',time:3});
							}else{
								$.dialog.notice({content:msg,icon:'error',time:3});
							}
							
						}
					);
				},
				okVal:'确定',
				cancel:true,
				cancelVal:'取消'
			});
				
		},
		filter: function (){
			if( _global.boardNode == undefined || _global.boardNode.id == -1){
				
				$.dialog.notice({content:'请选择要栏目信息', time:2, icon:'warning', lock:false});
				return;
			}
			$.get(
				$.appClient.generateUrl({ESInformationPublish:'public_filter', tpl: 'topic'},'x'),
				function (htm){
					$.dialog({
						title: '筛选面版',
						content: htm,
						okVal:'确定',
						cancelVal:'取消',
						ok: function (){
							var relation = compare = key = value = null; // 关系符,比较符,键,值
							var condition = [];
							$('#filter_conditions .filter_condition').each(function (){
								key = $(this).find('.filter_Field').val();
								if(key != 'empty'){
									compare = $(this).find('.filter_Comparison').val();
									value = $(this).find('.filter_Value').val();
									relation = $(this).find('.filter_Relation').val();
									condition.push(key+','+compare+','+value+','+relation);
								}
							});
							if(!condition.length) return true; // 用户没有输入任何条件时关闭窗口
							
							var url = $.appClient.generateUrl({ESInformationPublish:'GetPublishTopicList',boardId:_global.boardNode.id,},'x');
							$('#ArchiveList').flexOptions({url:url, query:condition.join('&')}).flexReload();
						},
						cancel:true
					});
				}
			);
		},
		removeFilter: function (){
			var url = $.appClient.generateUrl({ESInformationPublish:'GetPublishTopicList', boardId:_global.boardNode.id},'x');
			$('#ArchiveList').flexOptions({url:url,query: '', newp: 1}).flexReload();
		},
		publishNews:function(){
			var cb = $('#ArchiveList input[name="inputsA"]:checked');
			var leng = cb.length;
			var ids = [],isProcess = false;
			var status = '';
			cb.each(function (){ // 0 审批中,2为退回
				var trObj=$(this).closest('tr');
				status=$("#ArchiveList").flexGetColumnValue(trObj,['status']);
				if($(this).attr('process') == '0' || $(this).attr('process') == '2'){
					isProcess = true;
				}
				ids.push(this.id);
				
			});
			
			if( _global.boardNode == undefined || _global.boardNode.id == -1){
				
				$.dialog.notice({ content:'请选择要栏目信息', time:2, icon:'warning', lock:false});
				return;
			}else if(leng != 1){
				$.dialog.notice({ content:'请选择一条要发布的条目信息', time:2, icon:'warning', lock:false});
				return;
			}else if(isProcess){
				$.dialog.notice({ content:'删除的信息中含有审批或退回流程状态', time:2, icon:'warning', lock:false});
				return;
			}
					
			var html="<div id='showSumPics' class ='showSumPics'>" +
					"<input type='button' id='updateSumPic' class='buttons submit' name='default' value='上传APP端封面' style='margin:5px 0px 0 10px;width:90px; ' />" +
					"<div id='InsertCoverImagePosition'  class='insert_position'></div>" +
					"<div id='title_for' class='title_for'>*上传封面则会同时发布到手机APP端！</div>"
					"</div>";
			$.dialog({
				title:'上传封面图片',
				width: '300px',
		    	height:'120px',
				padding:0,
				content:html,
				ok:function(){
					var fileId = '0';
					if($('#InsertCoverImagePosition .imgPath').length>0){
						
						fileId = $('#InsertCoverImagePosition .imgPath').attr('fileId');
					}
					$.post(
							$.appClient.generateUrl({ESInformationPublish:'updateTopicStatus'},'x'),
							{boardId:_global.boardNode.id,id:ids.join(','),fileId:fileId},
							function (msg){
								$('#ArchiveList').flexReload();
								if(msg == "success"){
									$.dialog.notice({content:'发布成功！',icon:'succeed',time:3});
									
								}else{
									$.dialog.notice({content:msg,icon:'error',time:3});
								}
							}
						);
				},
				cancel:true,
				okVal:'发布',
				cancelVal:'取消'
				
		 });
		},
		cancelPublish:function(input){
			var canType = input=='取消PC端发布'?1:0;
			var cb = $('#ArchiveList input[name="inputsA"]:checked');
			var leng = cb.length;
			var ids = [],isProcess = false;
			var status = '';
			var appStatus = '';
			cb.each(function (){ // 0 审批中,2为退回
				var trObj=$(this).closest('tr');
				status=$("#ArchiveList").flexGetColumnValue(trObj,['status']);
				appStatus = $("#ArchiveList").flexGetColumnValue(trObj,['appStatus']);
				if($(this).attr('process') == '0' || $(this).attr('process') == '2'){
					isProcess = true;
				}
				ids.push(this.id);
				
			});
			if( _global.boardNode == undefined || _global.boardNode.id == -1){
				
				$.dialog.notice({ content:'请选择要栏目信息', time:2, icon:'warning', lock:false});
				return;
			}else if(leng != 1){
				$.dialog.notice({ content:'请选择一条要取消发布的条目信息', time:2, icon:'warning', lock:false});
				return;
			}else if(isProcess){
				$.dialog.notice({ content:'删除的信息中含有审批或退回流程状态', time:2, icon:'warning', lock:false});
				return;
			}else if(status=='未发布' && canType==1 ){
				$.dialog.notice({ content:'您选择的数据PC端还没有发布！', time:2, icon:'warning', lock:false});
				return;
			}else if(appStatus == '未发布' && canType ==0){
				$.dialog.notice({ content:'您选择的数据手机端还没有发布！', time:2, icon:'warning', lock:false});
				return;
			}
			//发布的信息
			$.post(
					$.appClient.generateUrl({ESInformationPublish:'updateTopicStatus'},'x'),
					{boardId:_global.boardNode.id,id:ids.join(','),canType:canType},
					function (msg){
						$('#ArchiveList').flexReload();
						if(msg == "success"){
							$.dialog.notice({content:'取消发布成功！',icon:'succeed',time:3});
						}else{
							$.dialog.notice({content:msg,icon:'error',time:3});
						}
					}
				);
		},
		refresh: function (){
			var url = $.appClient.generateUrl({ESInformationPublish:'GetPublishTopicList', boardId:_global.boardNode.id},'x');
			$('#ArchiveList').flexOptions({url: url, query: '', newp: 1}).flexReload();
		},
		checkApproval: function (startProcess){
			
			function checkedLeader()
			{
				var forms = document.getElementById('check_approval_list').elements,fl=forms.length;
				for(var f=0; f<fl; f++)
				{
					if(forms[f].checked){
						_global.leader = forms[f].id;
						break;
					}
				}
				
				if(typeof _global.leader === 'undefined'){
					
					return false;
					
				}
				
				_curl.saveOrprocess(startProcess);
				
			}
			
			$.post(
				$.appClient.generateUrl({ESInformationPublish:'findLeaderByuserId'},'x'),
				function (htm){
					
					if(htm === 'false'){
						$.dialog.notice({ icon: 'warning', content: '对不起，没找到领导!',time:3});
						return;
					}else if(htm.indexOf('onlyone')!=-1){
						var approveUserId=htm.substring(7);
						if(approveUserId ==''){
							return false;
						}
						_global.leader=approveUserId;
						if(typeof _global.leader === 'undefined'){
							return false;
						}
						_curl.saveOrprocess(startProcess);
					}else{
						$.dialog({
							title: '选择审批领导',
							content: htm,
							okVal: '确定',
							cancelVal: '取消',
							ok: checkedLeader, // 保存并开启流程},
							cancel: true
						});
					}
				}
			);
		}
};

var _public = {
		innerHtm: function (){
			$('#UploadFile').parent().remove();
			$('#InsertPosition').remove();
//			$('#InsertCoverImagePosition').remove();
			
			if(_global.boardNode.type==21){
				$("#eseditor").after("<div id='common_btns' class='common_btns'><span id='UploadFile' class='addannex'>上传附件</span></div><div id='InsertPosition' style='width:"+_size.editorwidth+"px' class='insert_position'></div>");
			}
			if(_global.boardNode.type==22){
				$('#shortinput').after("<div id='common_btns' class='common_btns' style='margin-top:0px;margin-left:15px;'><span id='UploadFile' class='addannex' >上传图片</span></div><div id='InsertPosition' style='width:"+_size.editorwidth+"px' class='insert_position'></div>");
			}
		}
};


// 待办
var _tasks = {
		publish: function (){ // 信息发布待办
			if(_global.taskFlag == 'publish' && _global.taskSize == 4){ // 退回
				var hash = window.location.hash; // #workId|taskId|boardId|topicId
				var hashObj = hash.split('|'); // [workId,taskId,boardId,topicId]
				
				// hashObj[1]; // type = 'publish/back'
				_global.workId = hashObj[0].substring(1); // #workId.substring(1) 去掉#
				_global.taskId = hashObj[1]; // taskId
				_global.boardNode = {};
				_global.topicId = hashObj[3]; // topicId
				
				var node = _global.boardTree.getNodeByParam('id',hashObj[2],null);
				_global.boardTree.selectNode(node);
				
				var nodes = _global.boardTree.getSelectedNodes(); // 获取选中节点数据
				_global.boardNode = nodes[0]; // 集合中第一个
				
				
				//var that = {id: _global.topicId};
				_curl.edit(_global.topicId); // _global.id
			}
		}
};


//标题 得到焦点和失去焦点
$('#editortitle').live('focus',function (){
	$(this).css({'border':'1px solid #248ED0'});
	$(this).val()=='请输入标题' ? $(this).val('') : $(this).val();
});
$('#editortitle').live('blur',function (){
	$(this).css({'border':'1px solid #ddd'});
	$(this).val()=='' ? $(this).val('请输入标题') : $(this).val();
});

$('#editortitle1').live('focus',function (){
	$(this).css({'border':'1px solid #248ED0'});
	$(this).val()=='请输入标题' ? $(this).val('') : $(this).val();
});
$('#editortitle1').live('blur',function (){
	$(this).css({'border':'1px solid #ddd'});
	$(this).val()=='' ? $(this).val('请输入标题') : $(this).val();
});
//摘要 得到焦点和失去焦点
$('#summary').focus(function (){
	$(this).css({'border':'1px solid #248ED0'});
	$(this).val()=='请输入内容摘要' ? $(this).val('') : $(this).val();
});
$('#summary').blur(function (){
	$(this).css({'border':'1px solid #ccc'});
	$(this).val()=='' ? $(this).val('请输入内容摘要') : $(this).val();
});

//摘要 得到焦点和失去焦点
//$('#title_summary').focus(function (){
//	$(this).css({'border':'1px solid #248ED0'});
//	$(this).val()=='请输入标题摘要（APP客户端专用）' ? $(this).val('') : $(this).val();
//});
//$('#title_summary').blur(function (){
//	$(this).css({'border':'1px solid #ccc'});
//	$(this).val()=='' ? $(this).val('请输入标题摘要（APP客户端专用）') : $(this).val();
//});


//保存按钮点击事件
$("#saveButton").click(function(){
	if(_global.taskFlag){ // 如果是待办过来的数据启动再次提交流程
		_table.checkApproval('false'); // 是首页过来的待办则会走重新提交方法
	}else{
		_curl.saveOrprocess('false');// 只保存不走流程
	}
	
});
$("#saveAndStatus").click(function(){
	_curl.saveOrprocess('false','true');
});
$("#saveAndStatus1").click(function(){
	_curl.saveOrprocess('false','true');
});

$("#saveButton1").click(function(){
	if(_global.taskFlag){ // 如果是待办过来的数据启动再次提交流程
		_table.checkApproval('false'); // 是首页过来的待办则会走重新提交方法
	}else{
		_curl.saveOrprocess('false');// 只保存不走流程
	}
	
});

$('#returnButton').click(function(){
	document.getElementById('editor').style.display = 'none';
	document.getElementById('ArchiveTbl').style.display = 'block';
	$('#ArchiveList').flexReload();
})
//编辑
$('.editbtn').live('click',function (){
	_curl.edit(this.id);
});

$('#ArchiveList tr').live('dblclick', function (){

	_curl.edit(this.id.replace(/row/, ''));
	
});

//移除一组文档规范表单
$('.rm_file').live('click',function (){
	_curl.del(this);
});

//删除图片
$('.close_pic').live('click',function (){
	var obj = this;
	var image = $(this).parent().find('input').attr('path');
	var isNew = $(this).parent().find('input').attr('new');
	if(isNew == 'true'){
		$.ajax({
			type:'post',
			data:{filePath:image},
			async:false,
			url:$.appClient.generateUrl({ESInformationPublish:'deletePics'},'x'),
			success:function (res){
				obj.parentNode.parentNode.removeChild(obj.parentNode);
			},
			cache:false
			});
	}else{
		_pic_src=','+image;
		obj.parentNode.parentNode.removeChild(obj.parentNode);
	}
});

$(document).ready(function(){
	$("#estabs").esTabs("open", {title:"信息发布管理", content:"#ESSystemIndex"});
	$("#estabs").esTabs("select", "信息发布管理");
	
	$('#leftfree').css({'width':_size.leftwidth,'height':_size.leftheight}); // 设置左边DIV宽,高 1px 为右边边框
	$('#rightfree').css({'width':_size.rightwidth,'height':_size.rightheight});	// 设置右边DIV宽,高
	
	$('#ArchiveTbl').css({'width':(_size.rightwidth-30),'height':_size.rightheight});
	$('#editor').css({'width':(_size.rightwidth-30),'height':_size.rightheight});
	document.getElementById('public_buttons').style.width = (_size.rightwidth-30)+'px';
	
	$('#auto_scroll').css({'width':(_size.rightwidth-30),'height':_size.rightheight-50});	// 设置右边DIV宽 50= {power_status.height:40px,power_status.paddingTop:10px}
	$('#auto_scroll1').css({'width':(_size.rightwidth-30),'height':_size.rightheight-50});	// 设置右边DIV宽 50= {power_status.height:40px,power_status.paddingTop:10px}
	$('.shortinput,#eseditor').css({'width':_size.editorwidth}); // 设置输入框外层DIV宽度，10px:padding:0 5px;
	
	$('#editortitle').css({'width':_size.editorwidth-61}); // 设置输入框(input)宽度61={.h2.width:50px,this.padding:2*3px,this.border:1px}
	$('#summary').css({'width':_size.editorwidth-16}); // 设置输入框(input)宽度16={this.padding:2*3px,this.marginLeft:4px,this.border:1px}
	
//	$('#title_summary').css({'width':_size.editorwidth-16}); // 设置输入框(input)宽度16={this.padding:2*3px,this.marginLeft:4px,this.border:1px}
//	
//	$('#title_summary').css({'width':_size.editorwidth-16}); 
	_tree.init();
	_table.init();
	
	// ckeditor 编辑器配置
	_global.content = CKEDITOR.replace(
		'editorcontent',
		{
		toolbar:
			[
		     ['Source','-','Save','NewPage','Preview','-','Templates'],
		     ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print', 'SpellChecker', 'Scayt'],
		     ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
		     ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
		     '/',
		     ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
		     ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
		     ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
		     ['insertImg','Table','HorizontalRule','SpecialChar','PageBreak'],
		     ['Link','Unlink','Anchor'],
		     '/',
		     ['Styles','Format','Font','FontSize'],
		     ['TextColor','BGColor']
		    ],
		enterMode:CKEDITOR.ENTER_BR,
		height: '400',
		resize_enabled: false,
		width: _size.editorwidth+12	// 18像素是插件自己会减去padding:0 6px;
	});
	function strlen(str) { //<summary>获得字符串实际长度，中文2，英文1</summary> //<param name="str">要获得长度的字符串</param> 
		var regExp = new RegExp(" ","g"); 
		str = str.replace(regExp , ""); 
		str = str.replace(/\r\n/g,""); 
		var realLength = 0, len = str.length, charCode = -1; 
		for (var i = 0; i < len; i++) {
			charCode = str.charCodeAt(i); 
			if (charCode >= 0 && charCode <= 128) 
				realLength += 1; else realLength += 2; 
		} 
		return realLength; 
	}; 
	$("#editortitle,#editortitle1").blur(function(){
			if(jmz.GetLength($(this).val())> 100){
				$(this).focus();
				$(this).css("border","1px solid red");
				$(this).attr("title", "标题的内容不能超过个50个汉字!");
				return;
			}else{
				$(this).removeAttr("title");
				$(this).css("border","1px solid rgb(204, 204, 204)");
			}
		});
	
	$("#summary").blur(function(){
		if(jmz.GetLength($(this).val())> 500){
			$(this).focus();
			$(this).css("border","1px solid red");
			$(this).attr("title", "摘要的内容不能超过个250个汉字!");
			return;
		}else{
			$(this).removeAttr("title");
			$(this).css("border","1px solid rgb(204, 204, 204)");
		}
	});
	
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
    
});

