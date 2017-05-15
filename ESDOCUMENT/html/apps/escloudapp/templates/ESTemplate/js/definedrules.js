
/**
 * 列表显示规则
 * @author ldm
 */


function listfield(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'listfield',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'列表显示字段',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var data='';
					$('#useRole li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					var url=$.appClient.generateUrl({ESTemplate:'listfieldsave'},'x');
						$.post(url,{data:data,moid:molid,stid:structureID},function(result){
							//alert(result);
							
							if(result=="1"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
								return;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
								return;
							}
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
}

/**
 * 表单显示字段
 * @author ldm
 */
function formfield(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'formfield',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'表单显示字段',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var data='';
					$('#useRole li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					var url=$.appClient.generateUrl({ESTemplate:'formfieldsave'},'x');
						$.post(url,{data:data,moid:molid,stid:structureID},function(result){
							//alert(result);
							if(result=="1"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
								return;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
								return;
							}
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
}

/**
 * 检索显示字段
 * @author ldm
 */
function searchfield(){
		
	$.get(
		$.appClient.generateUrl({ESTemplate:'searchfield', moid:molid, stid:structureID},'x'),
		function (htm){
			$.dialog({
		    	title:'检索显示字段',
		    	content:htm,
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'保存',
			    ok:function(){
			    	
			    	var ul_ = document.getElementById('useRole'),
			    		leng = ul_.children.length,
			    		data = [];

			    		for(var i=0; i<leng; i++){
			    			
			    			data.push(ul_.children[i].id+'#'+ul_.children[i].getAttribute('name'));
			    			
			    		}
			    		
			    	$.post(
			    		$.appClient.generateUrl({ESTemplate:'setUsingGridFieldRule'},'x'),
			    		{mId: molid, sId: structureID, data: data},
			    		function (ok){
			    			if(ok){
			    				
			    				$.dialog.notice({content: '设置成功！', icon: 'succeed', lock: false, time: 2});
			    				/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
			    			}else{
			    				
			    				$.dialog.notice({content: '设置成功！', icon: 'succeed', lock: false, time: 2});
			    				
			    			}
			    		}
			    	);
			    }
			});
		}
	);
}
/**
 * 排序规则
 * @author ldm
 */
var custom = "";
function sortrules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'sortrules',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'排序规则',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var datas = new Array();
			    	var html = '';
			    	var exg = /[^\|]\w+$/;
			    	var cname="";
			    	$('#sortsaveRole li').each(function(i){
			    		cname=$(this).attr("cname");
			    		datas[i] = {};
						datas[i]["tagid"]=$(this).attr("id");
						html = $(this).html().match(exg).toString();
						datas[i]["AscOrDesc"]=html;
						datas[i]["tagvalue"]=custom[cname].right;
						
					});
					if(structureID==""){
						$.dialog.notice({icon:'warnning',content:'请先选择结构树',time:3});
						return false;
					}
					var url=$.appClient.generateUrl({ESTemplate:'sortrulessave'},'x');
						$.post(url,{data:datas,moid:molid,stid:structureID},function(result){
							
							if(result=="1"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
								return;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
								return;
							}
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
}
/**
 * 补零规则
 * @author ldm
 */

function zeropaddingrules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'zeropaddingrules',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'补零规则',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var datas = new Array();
			    	var html = '';
			    	var exg = /[^\|]+$/;
			    	$('#zerosaveRole li').each(function(i){
			    		datas[i] = {};
						datas[i]["tagId"]=$(this).attr("id");
						html = $(this).html().match(exg).toString();
						datas[i]["length"]=html;
					});
					if(structureID==""){
						$.dialog.notice({icon:'warnning',content:'请先选择结构树',time:3});
						return false;
					}
					var url=$.appClient.generateUrl({ESTemplate:'zerorulesave'},'x');
						$.post(url,{data:datas,moid:molid,stid:structureID},function(result){
							if(result=="1"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
								return;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
								return;
							}
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
}
/**
 * 综合查询字段
 * @author ldm
 */
function comprehensivefield(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'comprehensivefield',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'综合查询字段',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var data='';
					$('#useRole li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					var url=$.appClient.generateUrl({ESTemplate:'compresave'},'x');
						$.post(url,{data:data,moid:molid,stid:structureID},function(result){
							if(result=="1"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
								return;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
								return;
							}
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
}

/**
 * 关联规则
 * author fangjixiang
 * date 20121010 
 * @modify ldm 
 */
var assourl = "";//关联规则表格路径
var inid = "";//卷内级id
function associationrules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	var url = $.appClient.generateUrl({ESTemplate:'getChildStructure'},'x');
	$.get(url,{stid:structureID},function(result){
		if(result==""){
			$.dialog.notice({icon:'warning',content:'此结构没有子结构',time:3});
		}else{
			//inid = result;
			assnext(structureID,result,molid);
		}
	});
}

/**
 * 关联规则下一步操作
 * @author ldm
 */
function assnext(structureID,innerFileID,molid){
	$.ajax({
		url:$.appClient.generateUrl({ESTemplate:'associationrules',moid:molid,stid:structureID,innerid:innerFileID},'x'),
		success:function(data){
			inid = innerFileID;
		$.dialog({
	    	title:'关联规则',
	    	padding:'0',
	    	fixed:false,
		    resize: false,
		    lock:true,
		    opacity:0.3,
		    content:data
		});
		},
		cache:false
		
	});	
}

/**
 * 报表规则
 * @author ldm
 */
function reportingrules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'reportingrules'},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'报表规则',
	    	   	fixed:false,
	    	    resize: true,
	    	    padding:0,
		    	content:data
		    });
		    },
		    cache:false
	});	

	
}



//弹出字段值编辑窗口#方吉祥
var $_cacheId = []; // global var
var $_cacheIds = []; // global var
var $cache_field_rule_tag = -1; // init
function fieldvaluerules(){
	$_cacheId = []; // init
	$_cacheIds = []; // init
	
	
	if(structureID < 0){
		$.dialog.notice({icon:'warning',content:'请先选择结构',time:2});
		return;
	}
	
	$.post(
		$.appClient.generateUrl({ESTemplate:'fieldvaluerules'},'x'),
	    {sId:parseInt(structureID), mId:parseInt(molid)},
	    function(html){
	    	$.dialog({
		    	title:'字段值规则',
		    	content:html,
		    	cancel:true,
		    	ok:SetComputeFieldRule, // 调用保存方法
		    	cancelVal:'关闭',
		    	okVal:'保存'
		    });
	    	
	    	$('#boxs').css('height','280px');
		    
	    	$('#FIELD_RULE_TAG li').each(function (){
		    	$_cacheId.push($(this).attr('id'));
		    });
		}
	);
}



// 左上列表li单击事件
$('#FIELD_RULE_TAG_LIST li').live('click',function (){
	var that = $(this);
	//is_save(that);
	var flag = false;
	var liObj = $('#FIELD_RULE_TAGS li');
	if($_cacheIds.length != liObj.length){
		flag = true;
	}else if($_cacheIds.length == 0 && liObj.length ==0){
		flag = false;
	}else{
		$('#FIELD_RULE_TAGS li').each(function (i){
			if($_cacheIds[i] != $(this).attr('id')){
				flag = true;
			}
			
		});
	}
	
	if(flag){
		
		$.dialog({
			content:'数据被修改，是否保存',
			icon:'warning',
			ok:function (){
				SetComputeFieldRule('flag=true');
			},
			cancel:function (){
				$('#FIELD_RULE_TAGS').html('');
				if($_cacheIds.length==0){ // 如果没有关联字段把当前被选中的字段值移动到左边
					$('#FIELD_RULE_TAG_LIST').append($('#FIELD_RULE_TAG .esselected'));
				}
				$_cacheIds = [];
				
				$('#FIELD_RULE_TAG_LIST li,#FIELD_RULE_TAG li').removeClass('esselected');
				$(that).addClass('esselected');
				
				$('#second_list').hide();
				$('#boxs').css('height','280px');
				
			},
			okVal:'是',
			cancelVal:'否'
		});
		
	}else{
		
		$('#FIELD_RULE_TAG_LIST li,#FIELD_RULE_TAG li').removeClass('esselected');
		$(this).addClass('esselected');
		
		$('#second_list').hide();
		$('#boxs').css('height','280px');
		
	}
});



// 右上列表li单击事件
$('#FIELD_RULE_TAG li').live('click',function (){
	
	var flag = false;
	var liObj = $('#FIELD_RULE_TAGS li');
	if($_cacheIds.length != liObj.length){
		flag = true;
	}else if($_cacheIds.length == 0 && liObj.length ==0){
		flag = false;
	}else{
		$('#FIELD_RULE_TAGS li').each(function (i){
			if($_cacheIds[i] != $(this).attr('id')){
				flag = true;
			}
		});
	}
	
	
	if(flag){
		
		$.dialog({
			id:'fieldValueRoleModifyDialog',
			content:'数据被修改，是否保存',
			icon:'warning',
			ok:function (){SetComputeFieldRule('flag=true');},
			cancel:true,
			okVal:'是',
			cancelVal:'否'
		});
		
	}else{
		
		$('#FIELD_RULE_TAG_LIST li,#FIELD_RULE_TAG li').removeClass('esselected');
		$(this).addClass('esselected');
		
		$('#second_list').show();
		$('#boxs').css('height','560px');//liqiubo 20140627 增加高度
		
		var frtl = [];
		var frt = [];
		$_cacheIds = []; // init
		//var $cache_top_ids = {};
		var tagId = $(this).attr('id');
		$.post(
			$.appClient.generateUrl({ESTemplate:'Getreferencetieldstortag'},'x'),
			{sId:structureID, mId:molid, tagId:tagId},
		    function(result){
				
				for(var i in result.left)
				{
					frtl.push("<li id='"+result.left[i].tagId+"'>"+result.left[i].display+"</li>");
				}
					
				
							
				for(var i in result.right)
				{
					frt.push("<li id='"+result.right[i].tagId+"'>"+result.right[i].display+"</li>");
					$_cacheIds.push(result.right[i].tagId);
				
				}
				
				$('#FIELD_RULE_TAGS_LIST').html(frtl.join(''));
				$('#FIELD_RULE_TAGS').html(frt.join(''));
			},
			'json'
		);
	}
	
	
	
	
});

//左下列表li单击事件
$('#FIELD_RULE_TAGS_LIST li').live('click',function (){
	$('#FIELD_RULE_TAGS_LIST li,#FIELD_RULE_TAGS li').removeClass('esselected');
	$(this).addClass('esselected');
});



// 右下列表li单击事件
$('#FIELD_RULE_TAGS li').live('click',function (){
	$('#FIELD_RULE_TAGS_LIST li,#FIELD_RULE_TAGS li').removeClass('esselected');
	$(this).addClass('esselected');
});


//保存字段值#方吉祥#保存
function SetComputeFieldRule(flag) // 只为提示用户是否保存传参
{
	var tagIds = [];
	var tagId = $('#FIELD_RULE_TAG .esselected').attr('id');
	
	if(!tagId){
		$.dialog.notice({
    	    icon:'warning',
    	    time:2,
	    	content:'请选择一个字段'
	    });
		return false;
	}
	
	$('#FIELD_RULE_TAGS li').each(function (){
		tagIds.push($(this).attr('id'));
	});
		
	$.post(
	    $.appClient.generateUrl({ESTemplate:'SetComputeFieldRule'},'x'),
	    {sId:parseInt(structureID), mId:parseInt(molid), tagId:parseInt(tagId), tagIds:tagIds.join(',')},
	    function(is_ok){
	    	if(is_ok){

	    		$.dialog.notice({
		    	    icon:'succeed',
		    	    time:2,
			    	content:'保存成功'
			    });
	    		
	    		$_cacheId.push(tagId); // 保存成功将ID放入数组中
	    		$cache_field_rule_tag = -1; // init
	    		
	    		
	    		if(flag=='flag=true'){ // 保存成功后执行相应操作
	    			
	    			$('#FIELD_RULE_TAG_LIST li,#FIELD_RULE_TAG li').removeClass('esselected');
	    			$(this).addClass('esselected');
	    			
	    		}
	    		
	    		$_cacheIds = []; // init
	    		$('#FIELD_RULE_TAGS').html(''); // init
	    		$('#second_list').hide();
    			$('#boxs').css('height','280px');
//	    		if(flag =='init'){ // 非提示保存(正常单击保存按钮)
//		    		$_cacheIds = []; // init
//	    		}
	    		

	    	}else{
	    		$.dialog.notice({
		    	    icon:'error',
		    	    time:2,
			    	content:'保存失败'
			    });
	    		
	    	}
		}
	);
	/**liqiubo 20140313 刷新数据**/
	$('#edit_rule_tbl').flexReload();
}


//删除累加字段值回调
function DeleteComputeFieldRule(that)
{
	$.dialog({
		icon:'warning',
		content:'确定删除',
		okVal:'确定',
		cancelVal:'取消',
		ok:function (){
			
			var tagId = $(that).attr('id');
			var flag = false;
			
			$.each($_cacheId,function (){
				if(this == tagId){ // 判断是否删除
					flag = true;
					return;
				}
			});
			
			if(flag){
				$.post(
				    $.appClient.generateUrl({ESTemplate:'DeleteComputeFieldRule'},'x'),
				    {sId:structureID, mId:molid, tagId:tagId},
				    function(is_ok){
				    	if(is_ok){
				    		$('#FIELD_RULE_TAG_LIST').append(that);
				    		$.dialog.notice({
				    			content:'删除成功',
				    			lock:false,
				    			icon:'succeed',
				    			time:2
				    		});
				    		/**liqiubo 20140313 刷新数据**/
				    		$('#edit_rule_tbl').flexReload();
				    		$cache_field_rule_tag = -1; // init
				    		
				    		var ind = indexOf($_cacheId,tagId);
				    		if (ind > -1) {
				    			
				    			$_cacheId.splice(ind, 1);
				    			
				    	    }
				    		
				    		// init //
				    		//$('#FIELD_RULE_TAGS_LIST').html('');
				    		//$('#FIELD_RULE_TAGS').html('');
				    		$('#second_list').hide();
				    		$('#boxs').css('height','280px');
				    		
				    	}else{
				    		$.dialog.notice({
				    			content:'删除失败',
				    			icon:'error',
				    			lock:false,
				    			time:2
				    		});
				    	}
				    }
				);
			}else{
				$cache_field_rule_tag = -1; // init
				$('#FIELD_RULE_TAG_LIST').append(that);
				$.dialog.notice({
		 			content:'删除成功',
		 			icon:'succeed',
		 			lock:false,
		 			time:2
		 		});
			}
			
			
		},
		cancel:true
	});
	
}

// 获取数组中当前元素所在索引
function indexOf(arrayObj,e)
{
	for(var i in arrayObj)
	{
		if(arrayObj[i] == e) return i;
	}
	return -1;
}

//双击左移
$('#FIELD_RULE_TAG li').live('dblclick',function(){
	/** xiaoxiong 20140807 在双击前添加对当前规则是否存在修改，如果存在修改，即不触发双击事件 **/
	if(art.dialog.list['fieldValueRoleModifyDialog']){
		return ;
	}
	var that = this;
	public_to_left(that);
});

//双击右移
$('#FIELD_RULE_TAG_LIST li').live('dblclick',function (){
	
	var that = $(this);
	public_to_right(that);
	
});

// 双击左移,单击左移按钮共用(#first_list DIV标签)
function public_to_left(that)
{
	DeleteComputeFieldRule(that);
}

//双击右移,单击右移按钮共用(#first_list DIV标签)
function public_to_right(that)
{
	if($cache_field_rule_tag !== -1){ // 可以添加
	
		var liObj = $('#FIELD_RULE_TAG li[id="'+ $cache_field_rule_tag +'"]');
		$('#FIELD_RULE_TAG_LIST').append(liObj); // 把没保存的移到左边
		
		$('#FIELD_RULE_TAG').append($(that));
		
		var id = that.attr('id');
		$cache_field_rule_tag = id;
		//$cache_field_rule_tag = -1; // init
		return;
	}else{
		var id = that.attr('id');
		$cache_field_rule_tag = id;
		$('#FIELD_RULE_TAG').append($(that));
	}
	
}

// 左移
$('#TO_LEFT').live('click',function(){
	
	var that = $('#FIELD_RULE_TAG .esselected');
	if(that.attr('id') == undefined){
		$.dialog.notice({
			content:'请选择字段',
			icon:'warning',
			time:2
		});
		return;
	}
	
	public_to_left(that);
	
});


// 右移
$('#TO_RIGHT').live('click',function(){
	
	var that = $('#FIELD_RULE_TAG_LIST .esselected');
	public_to_right(that);
	
});

// 上移
$('#TO_UP').live('click',function(){
	var ind = $('#FIELD_RULE_TAG .esselected').index()-1;
	//guolanrui 20141014 添加index的判断，避免在IE8下选择最上的字段上移时字段消失BUG：1352
	if(ind>-1){
		$('#FIELD_RULE_TAG .esselected').insertBefore($('#FIELD_RULE_TAG li:eq('+ind+')'));
	}
});

// 下移
$('#TO_DOWN').live('click',function(){
	
	var ind = $('#FIELD_RULE_TAG .esselected').index()+1;
	$('#FIELD_RULE_TAG .esselected').insertAfter($('#FIELD_RULE_TAG li:eq('+ind+')'));
	
});


// 置顶
$('#TO_TOP').live('click',function(){
	
	if($('#FIELD_RULE_TAG .esselected').text() == $('#FIELD_RULE_TAG li:first').text()) return;
	$('#FIELD_RULE_TAG .esselected').insertBefore($('#FIELD_RULE_TAG li:first'));
	
});

// 置底
$('#TO_BOTTOM').live('click',function(){
	
	if($('#FIELD_RULE_TAG .esselected').text() == $('#FIELD_RULE_TAG li:last').text()) return;
	$('#FIELD_RULE_TAG .esselected').insertAfter($('#FIELD_RULE_TAG li:last'));
	
});

// --------  --------- //

//双击左移
$('#FIELD_RULE_TAGS li').live('dblclick',function (){
	
	
	$('#FIELD_RULE_TAGS_LIST').append($(this));
	
});

// 双击右移
$('#FIELD_RULE_TAGS_LIST li').live('dblclick',function (){
	
	
	$('#FIELD_RULE_TAGS').append($(this));
	
});

//左移
$('#TO_LEFT2').live('click',function(){
	var that = $('#FIELD_RULE_TAGS .esselected');
	$('#FIELD_RULE_TAGS_LIST').append($(that));

});

// 右移
$('#TO_RIGHT2').live('click',function(){
	
	$('#FIELD_RULE_TAGS').append($('#FIELD_RULE_TAGS_LIST .esselected'));
	
});

// 上移
$('#TO_UP2').live('click',function(){
	var ind = $('#FIELD_RULE_TAGS .esselected').index()-1;
	//guolanrui 20141014 添加index的判断，避免在IE8下选择最上的字段上移时字段消失BUG：1352
	if(ind>-1){
		$('#FIELD_RULE_TAGS .esselected').insertBefore($('#FIELD_RULE_TAGS li:eq('+ind+')'));
	}
});

// 下移
$('#TO_DOWN2').live('click',function(){
	
	var ind = $('#FIELD_RULE_TAGS .esselected').index()+1;
	$('#FIELD_RULE_TAGS .esselected').insertAfter($('#FIELD_RULE_TAGS li:eq('+ind+')'));
	
});


// 置顶
$('#TO_TOP2').live('click',function(){
	
	if($('#FIELD_RULE_TAGS .esselected').text() == $('#FIELD_RULE_TAGS li:first').text()) return;
	$('#FIELD_RULE_TAGS .esselected').insertBefore($('#FIELD_RULE_TAGS li:first'));
	
});

// 置底
$('#TO_BOTTOM2').live('click',function(){
	
	if($('#FIELD_RULE_TAGS .esselected').text() == $('#FIELD_RULE_TAGS li:last').text()) return;
	$('#FIELD_RULE_TAGS .esselected').insertAfter($('#FIELD_RULE_TAGS li:last'));
	
});

// 筛选列表
function findAll(find,targetId) // find:need find string, target
{
	if($.trim(find)==''){
		$('#'+targetId+' li').show();
	}else{
		$('#'+targetId+' li').hide();
		$('#'+targetId+' li:contains('+ find +')').show();
	}
}



/**
 * 代码值规则
 * @author ldm
 */
function codevaluerules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'codevaluerules'},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'数据字典规则',
	    	   	fixed:false,
	    	    resize: true,
	    	    width: 805,
	    	    padding:0,
		    	content:data
		    });
		    },
		    cache:false
	});	
	}

// -------------------------- 档案鉴定规则#方吉祥 ----------------------------------- //
$('#save_head').live('mouseover',function (){ $(this).addClass('extbtnpos');});
$('#save_head').live('mouseout',function (){$(this).removeClass('extbtnpos');});
var $prevTagKey,$prevTagValue,$isSubmit=false;
$('.EMPTYREG').live('keyup',function (){
	var cache = $(this).parent().parent().attr('colname') == "tagKey" ? $prevTagKey : $prevTagValue;
	if($(this).val() && $(this).val() != cache){
		$isSubmit = true;
		$(this).css('border','1px solid #7F9DB9');
	}else{
		$isSubmit = false;
		$(this).css('border','1px solid #f55');
	}
});

//档案鉴定规则窗口
function fileidentificationrules()
{
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'fileidentificationrules'},'x'),
	    success:function(html){
	    	$.dialog({
		    	title:'档案鉴定规则',
		    	padding:'0',
			    content:html,
			    cancel:true,
			    cancelVal:'关闭'
		    });
	    	
	    	$.post(
	    		$.appClient.generateUrl({ESTemplate:'GetOptions'},'x'),
	    		{sId:parseInt(structureID), mId:parseInt(molid)},
	    		function (result){
	    			
	    			var selected = result.selected;
	    			var all = result.all;
	    			
	    			if(all.length){
	    				for(var i in all)
	    				{
	    					if(all[i][0] == selected[0]){
	    						$('#leftOptions').append('<option selected="selected" value="'+ all[i][0] +'">'+ all[i][1] +'</option>');
	    					}else{
	    						$('#leftOptions').append('<option value="'+ all[i][0] +'">'+ all[i][1] +'</option>');
	    					}
	    					
	    					if(all[i][0] == selected[1]){
	    						$('#rightOptions').append('<option selected="selected" value="'+ all[i][0] +'">'+ all[i][1] +'</option>');
	    					}else{
	    						$('#rightOptions').append('<option value="'+ all[i][0] +'">'+ all[i][1] +'</option>');
	    					}
	    					
	    				}
	    				if(selected[0]){
	    					load_code_tbl(); // 调用表格
		    				var url = $.appClient.generateUrl({ESTemplate : 'GetCheckUpRulekeyvalue',sId:parseInt(structureID), mId:parseInt(molid), startDateTagId:selected[0], psTagId:selected[1]}, 'x');
		    				$("#edit_code_tbl").flexOptions({url:url}).flexReload();
	    				}
	    				
	    			}else{
	    				$('#leftOptions').append('<option value="normal">未设置</option>');
	    				$('#rightOptions').append('<option value="normal">未设置</option>');
	    			}
	    				    				
	    		},
	    		'json'
	    	);
	    },
		cache:false
	});	
}

// 代码列表
function load_code_tbl(){
	
	var width = 600;
	if(navigator.userAgent.indexOf("MSIE 6.0")>0){
			width = 598;	// 6为兼容IE6
	}
	$("#edit_code_tbl").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
				{display:'<input type="checkbox" id="sinputC" />', name:'cbox', width:24, align:'center'},
				//wanghongchen 20140913 修改列表显示长度
				{display:'期限字段', name:'tagKey', width:260,editable:true, align:'center'},
				//wanghongchen 20140926 时间期限只允许输入数字
				{display:'时间期限', name:'tagValue',validate:/^(?!0)\d{1,5}$/i,  validateMsg:"必须为大于零的数字", width:260,editable:true, align:'center'}
		],
		buttons : [
			{name : '添加', bclass : 'add', onpress : mkcodevalue },
			{name : '删除', bclass : 'delete', onpress : rmcodevalue },
			{name : '保存', bclass : 'save', onpress : setcodevalue }
		],
		title:'代码列表',
		resizable:false,
		width:width,
		height:156
	});
}


// 创建新行
function mkcodevalue()
{
	// value值为该条数据ID,id值为该条数据的idStructure
//	if($('#edit_code_tbl tr[datastate="new"]').length<1){
		$prevTagKey = $('#edit_code_tbl tr:last td[colname="tagKey"]').text();
		$prevTagValue = $('#edit_code_tbl tr:last td[colname="tagValue"]').text();
		$('#edit_code_tbl').flexExtendData([{
			"id" : '',
			"cell" : {
				'cbox':'<input type="checkbox" id="0" name="sinputC" value="-1" />',
				"tagKey":'',
				"tagValue":''
			}
		}]);
		
//	}else{
//		$.dialog.notice({
//			content:'每次添加一条',
//			icon:'warning',
//			time:2
//		});
//	}
	
}

// 删除
function rmcodevalue()
{
	var startDateTagId = $('#leftOptions').val();
	var psTagId = $('#rightOptions').val();
	var sinputC = $('#edit_code_tbl input[name="sinputC"]:checked'); // 勾选的行
	
	if(!startDateTagId || !psTagId){
		$.dialog.notice({
			content:'起始日期，保管期限不为空',
			icon:'warning',
			time:2
		});
		return;
	}else if(sinputC.length<1){
		$.dialog.notice({
			content:'请选择要删除的数据',
			icon:'warning',
			time:2
		});
		return;
	}
	
	$.dialog({
		content:'确定删除',
		icon:'warning',
		okVal:'确定',
		cancelVal:'取消',
		ok:function (){
			var isNew = false;
			var isDelete = false;
			
			sinputC.each(function (){
				if($(this).closest('tr').attr('datastate')=='new'){
					isNew = true;
				}else{
					isDelete = true;
				}
			});
			
			if(isNew){
				
				$.dialog({
					content:'删除条目中有新建的数据，确定删除',
					icon:'warning',
					okVal:'确定',
					cancelVal:'取消',
					ok:function (){
						sinputC.each(function (){
							if($(this).closest('tr').attr('datastate')=='new'){
								$(this).closest('tr').remove();
							}
						});
						if(isDelete) rmcodevalue_CallBack();
					},
					cancel:true
				});
			}else{
				rmcodevalue_CallBack();
			}
		},
		cancel:true
	});
	
	
}

// 删除鉴定规则回调
function rmcodevalue_CallBack()
{
	var startDateTagId = $('#leftOptions').val();
	var psTagId = $('#rightOptions').val();
	var params = [];
	$('#edit_code_tbl input[name="sinputC"]:checked').each(function (){
		params.push($(this).closest('tr').find('td[colname="tagKey"]').text()+','+$(this).closest('tr').find('td[colname="tagValue"]').text());
	});
	$.post(
		$.appClient.generateUrl({ESTemplate : 'DeleteCheckUpRulekeyvalue'},'x'),
		{sId:parseInt(structureID), mId:parseInt(molid), startDateTagId:startDateTagId, psTagId:psTagId, params:params.join('@')},
		function ($isok){
			if($isok){
				$.dialog.notice({
					content:'删除成功',
					icon:'succeed',
					time:2
				});
				$('#edit_code_tbl').flexReload();
			}else{
				$.dialog.notice({
					content:'删除失败',
					icon:'error',
					time:2
				});
			}
		}
	);
}

// 保存鉴定参照字段
$('#save_head').live('click',function (){
	var startDateTagId = $('#leftOptions').val();
	var psTagId = $('#rightOptions').val();
	if(startDateTagId=='normal' || psTagId=='normal'){
		$.dialog.notice({
			content:'未设置参照字段',
			icon:'warning',
			time:2
		});
		return;
	}
	
	if(!startDateTagId || !psTagId){
		$.dialog.notice({
			content:'起始日期，保管期限不为空',
			icon:'warning',
			time:2
		});
		return;
	}
	//wanghongchen 20140819 取消保存提醒
//	$.dialog({
//		content:'确定保存',
//		icon:'warning',
//		okVal:'确定',
//		cancelVal:'取消',
//		ok:function (){
			
			$.post(
				$.appClient.generateUrl({ESTemplate : 'SetCheckUpRule'},'x'),
				{sId:parseInt(structureID), mId:parseInt(molid), startDateTagId:parseInt(startDateTagId), psTagId:parseInt(psTagId)},
				function ($isok){
					if($isok){
						$.dialog.notice({
							content:'保存成功',
							icon:'succeed',
							time:2
						});
						load_code_tbl(); // 调用表格
						$('#edit_rule_tbl').flexReload();
					}else{
						$.dialog.notice({
							content:'保存失败',
							icon:'error',
							time:2
						});
					}
				}
			);
//		},
//		cancel:true
//	});
	
});

// 保存鉴定规则
function setcodevalue()
{
	var trObj = $('#edit_code_tbl tr[datastate="new"],#edit_code_tbl tr[datastate="modify"]');
	if(trObj.length<1){
		$.dialog.notice({
			content:'没有要保存的数据',
			icon:'warning',
			time:2
		});
		return;
	}
	var startDateTagId = $('#leftOptions').val();
	var psTagId = $('#rightOptions').val();
	
	if(!startDateTagId|| !psTagId){
		$.dialog({
			content:'起始日期，保管期限不为空',
			icon:'warning',
			time:2
		});
		return;
	}
//	var params = $(trObj).find('td[colname="tagKey"] input').val() + ',' + $(trObj).find('td[colname="tagValue"] input').val();
	
//	if(!$isSubmit){
//		$.dialog.notice({
//			content:'属性值，代码值未填写完整或重复',
//			icon:'warning',
//			time:2
//		});
//		return;
//	}
	var flag=true;
	trObj.each(function(){
		var tagKey=$(this).find('td[colname="tagKey"]').text();
		var tagValue= $(this).find('td[colname="tagValue"]').text();
		var id = $(this).find('input').val();
		var params=tagKey+','+tagValue + "," + id;
		$.ajax({
			type:"post",
			url:$.appClient.generateUrl({ESTemplate : 'SetCheckUpRulekeyvalue'},'x'),
			data:{sId:parseInt(structureID), mId:parseInt(molid), startDateTagId:parseInt(startDateTagId), psTagId:parseInt(psTagId), params:params},
			async:false, 
			success:function (isok){
					flag=flag&&isok;
				}
		});
		
	});
	if(flag){
		$.dialog.notice({icon:'succeed',content:"保存成功",time:2});
		//xiewenda 20141014 首次保存数据成功后 发送显示url重新加载数据
		var url = $.appClient.generateUrl({ESTemplate : 'GetCheckUpRulekeyvalue',sId:parseInt(structureID), mId:parseInt(molid),startDateTagId:parseInt(startDateTagId), psTagId:parseInt(psTagId)}, 'x');
		$("#edit_code_tbl").flexOptions({url:url}).flexReload();
	}else{
		$.dialog.notice({
			content:'保存失败',
			icon:'error',
			time:2
		});
	}
	
}

// ******************* 文件鉴定规则 结束 ******************* //
/**
 * 扫描规则
 * @author ldm
 */
function scanningrules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	var trimext = /\|\w+/;
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'scanningrules',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'扫描规则',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var url = $.appClient.generateUrl({ESTemplate:'savescanrule'},'x');
			    	var datas = "";
			    	var ms = $("#topRole input[name='filepath']").attr("path");//liqiubo 20140819 现在路径显示中文名，所以改成从属性值中获取路径，修复bug 755
			    	if(ms==""){
			    		$.dialog.notice({icon:'warning',content:"远程路径不能为空",time:2});
			    		return false;
			    	}
			    	$('#extrasaveRole li').each(function(i){
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
					/**liqiubo 20140708 加入判断，如果没有设置规则，不允许保存**/
			    	//没有设置规则 允许其保存 与删除等效 等效与删除扫描规则
//			    	if(datas==null || datas ==""){
//			    		$.dialog.notice({icon:'warning',content:"规则设置不完整，请继续设置完整",time:2});
//			    		return false;
//			    	}
			    	$.post(url,{moid:molid,stid:structureID,data:datas,path:ms},function(result){
			    		if(result){
			    			$.dialog.notice({icon:'succeed',content:"保存成功",time:2});
			    			/**liqiubo 20140313 刷新数据**/
							$('#edit_rule_tbl').flexReload();
			    		}
			    	})
			    	//return false;//设置结束了 就应该关闭对话框
				},
	    	    button: [
	    	          {
	    	        	  name: '删除',
	    	              callback: function () {
	    	            	  var url = $.appClient.generateUrl({ESTemplate:'savescanrule'},'x');
	    	            	  $.post(url,{moid:molid,stid:structureID,data:"",path:""},function(result){
	    				    		if(result){
	    				    			$.dialog.notice({icon:'succeed',content:"删除成功",time:2});
	    				    			/**liqiubo 20140313 刷新数据**/
	    								$('#edit_rule_tbl').flexReload();
	    								$("#topRole input[name='filepath']").attr("path","");
	    								$("#topRole input[name='filepath']").attr("value","");
	    								$('#extrasaveRole').html("");
	    								
	    				    		}
	    				    	})
	    	                  return false;
	    	              },
	    	              autofocus: true
	    	          }
	    	      ]
		    });
	    	
		    },
		    cache:false
	});	
	}
//关键词规则
function keywordsrules(){
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'keywordsrules'},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'关键词规则',
	    		//width: '50%',
	    	   	fixed:false,
	    	    resize: true,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
					var form=$('#form_add');
					var data=form.serialize();
					var url=$.appClient.generateUrl({ESIdentify:'do_add'},'x');
						$.post(url,{data:data},function(result){
							$.dialog.notice({icon:'succeed',content:'添加成功'+result,time:3});
							$('#flexme1').flexOptions({newp: 1}).flexReload();
						});
				 }
		    });
	    	
		    },
		    cache:false
	});	
	}
/**
 * 二维码规则
 * @author ldm
 */
function twodimensioncoderules(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'twodimensioncoderules',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
		    	title:'二维码规则',
	    	   	fixed:false,
	    	    resize: true,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var data='';
					$('#useRole li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					var url=$.appClient.generateUrl({ESTemplate:'twobarsave'},'x');
						$.post(url,{data:data,moid:molid,stid:structureID},function(result){
							$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
							/**liqiubo 20140313 刷新数据**/
							$('#edit_rule_tbl').flexReload();
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
	}
/**
 * 追加携带
 * @author wangtao
 * @date 2013-02-04
 */
function addrules(){
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'getBringFieldToAdd',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	comdia = $.dialog({
	    		id:'bringFieldToAddPanel',
		    	title:'追加携带',
	    	   	fixed:false,
	    	    resize: true,
	    	    okVal:'保存',
	    	    cancelVal:'关闭',
	    	    cancel:true,
			    content:data,
			     ok:function()
		    	{
			    	var data='';
					$('#useRole li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					var url=$.appClient.generateUrl({ESTemplate:'setBringFieldToAdd'},'x');
						$.post(url,{data:data,moid:molid,stid:structureID},function(result){
							if(result=="1"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								/**liqiubo 20140313 刷新数据**/
								$('#edit_rule_tbl').flexReload();
								return;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
								return;
							}
						});
						return false;
				 }
		    });
		    },
		    cache:false
	});	
}

/**
 * 组合字段
 * @author ldm
 */
var comdia = '';
function combinationfield(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'combinationfield',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	comdia = $.dialog({
		    	title:'组合字段',
	    	   	fixed:false,
	    	    resize: true,
			    content:data
		    });
		    },
		    cache:false
	});	
}

/***
 * xiaoxiong 20140819
 * 盒号规则设置处理方法
 */
function boxRule(){
	if(structureID==""){
		$.dialog.notice({icon:'warning',content:'请先选择左侧结构树',time:3});
		return;
	}
	$.ajax({
	    url:$.appClient.generateUrl({ESTemplate:'boxRule',moid:molid,stid:structureID},'x'),
	    success:function(data){
	    	$.dialog({
	    		id:'boxRuleSetDialog',
		    	title:'盒号规则',
	    	   	fixed:false,
	    	    resize: false,
		    	content:data,
		    	okVal:'保存',
			    ok:true,
			    cancelVal: '关闭',
			    cancel: true,
			    content:data,
			    ok:function()
		    	{
			    	var data='';
					$('#useRole li').each(function(i){
						data+=$(this).attr("id")+',';
					});
					if(data.length > 0){
						data = data.substring(0, data.length-1) ;
					}
					var url=$.appClient.generateUrl({ESTemplate:'saveBoxRule'},'x');
						$.post(url,{id:$('#boxRuleDataId').val(),oldids:$('#boxRuleDataIds').val(),ids:data,busiModelId:molid,structureId:structureID},function(result){
							if(result=="true"){
								$.dialog.notice({icon:'succeed',content:'保存成功',time:3});
								$('#edit_rule_tbl').flexReload();
								art.dialog.list['boxRuleSetDialog'].close() ;
							}else{
								$.dialog.notice({icon:'error',content:'保存失败',time:3});
							}
						});
						return false;
				 }
		    });
	    	
		    },
		    cache:false
	});	
}