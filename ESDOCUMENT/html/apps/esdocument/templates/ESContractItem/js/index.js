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
	$("#itemGrid").flexigrid({url :$.appClient.generateUrl({ESContractItem: 'findContractList'}, 'x'),
		dataType : 'json',
		colModel : [ 
		{display : '数据标识',name :'id',hide:true,width:30,align:'center'},            
        {display : '序号',name : 'startNum',width : 30,align : 'center'}, 
	    {display : '<input type="checkbox" name="checkIdList">',name : 'ids',width : 15,align : 'center'}, 
	    {
			display : '操作',
			name : 'operate',
			width : 30,
			sortable : true,
			align : 'center'
		}, {
			display : '合同工程名称',
			name : 'escontractname',
			metadata:'escontractname',
			width : 200,
			align : 'left'
		},{
			display : '合同号',
			name : 'escontractnum',
			metadata:'escontractnum',
			width : 120,
			align : 'left'
		},{
			display : '项目名称',
			name : 'esprojectname',
			metadata:'esprojectname',
			width : 200,
			align : 'left'
		},{
			display : '负责装置',
			name : 'esdevice',
			metadata:'esdevice',
			width : 200,
			align : 'left'
		},{
			display : '中标单位',
			name : 'escompany',
			metadata:'escompany',
			width : 150,
			sortable : true,
			align : 'left'
		}, {
			display : '联系人',
			name : 'esperson',
			metadata:'esperson',
			width : 80,
			sortable : true,
			align : 'left'
		},{
			display : '联系方式',
			name : 'esperstel',
			metadata:'esperstel',
			width : 80,
			align : 'left'
		}],
		buttons : [ {
			name : '添加',
			bclass : 'add',
			onpress : function(){add();}
		}, {
			name : '删除',
			bclass : 'delete',
			onpress : function(){del();}
		},{
			name: '筛选',
			bclass: 'filter',
			onpress: function() {filter();}
		},
		{
			name: '还原数据',
			bclass: 'back',
			onpress: function() {back();}
		}],
		singleSelect:true,
		usepager : true,
		title : '合同工程',
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
	// 删除合同工程    
	function del(){
		var checkboxs = $('#itemGrid').find("input[name='changeId']:checked");
    	if(checkboxs.length==0){
			$.dialog.notice({content:'请选择删除的合同',time:2,icon:'warning'});
			return false;
		} 
		$.dialog({
	    	title:'删除合同工程',
			width: '300px',
		   	fixed:true,
		    resize: false,
		    padding:0,
	    	content:"<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>“<span style='color:red'>所选合同工程</span>”吗？</div>",
		    cancelVal: '取消',
		    cancel: true,
		    okVal:'确定',
		    ok:true,
	    	ok:function(){ 
	    		delContract();
			},cancel:function(){
			}
	    });
	};
	function delContract(){
		
		var checkboxs = $('#itemGrid').find("input[name='changeId']:checked");
    	if(checkboxs.length==0){
			$.dialog.notice({content:'请选择删除的合同',time:2,icon:'warning'});
			return false;
		}
    	var yeaDialog=$.dialog({
			content: "删除操作不可恢复，确定要删除选择的合同吗？",
			okVal:'确定',
			cancel: true,
			cancelVal:'取消',
			ok: function(){
				var ids = [];
				checkboxs.each(function(){
					var id = $(this).val();
					ids += id + ","
				});
				var delParam = {
						ids: ids.substring(0, ids.length - 1)
					}
				$.post($.appClient.generateUrl({ESContractItem:'delContract'},'x'), {ids:delParam}, function(data){
					if(data){
						yeaDialog.close();
						$("#itemGrid").flexReload();
						$.dialog.notice({content:"删除选择合同成功！", time:2,icon:'succeed'});
						$("#checkIdList").flexOptions().flexReload();
					}else{
						yeaDialog.close();
						$.dialog.notice({title:'操作提示',content:data,icon:'warning',time:3});
						return false;
					}
				});
			}
		});
	}
	
	//添加合同工程
	function add(){
		$.ajax({
    	    url:$.appClient.generateUrl({ESContractItem:'add'},'x'),
    	    success:function(data){
    	    	dia2 = $.dialog({
    		    	title:'添加合同工程',
    	    		width: '500px',
    	    	   	fixed:true,
    	    	    resize: false,
    	    	    padding:0,
    		    	content:data,
    			    cancelVal: '关闭',
    			    cancel: true,
    			    okVal:'确认添加',
				    ok:true,
    		    	ok:function(){ 
    		    		var addParam = $("#addContractItemForm").serialize();
    		    		var escontractnum=$("#escontractnum").val();
				    	if(!uniqueContractNum(escontractnum,"")){
				    		return false;
				    	}
				    	/** lujixiang 20150326 修复验证逻辑判断bug
						var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
						var esperstel = $("input[name='esperstel']").val();
						if(esperstel!=""){
							
							if((!regTel.test(esperstel))){
								$("input[name='esperstel']").addClass("invalid-text").attr("title","请输入合法的电话号码！");
								$.dialog.notice({content:'电话号码不合法，请重新输入！',icon:'warning',time:3});
								return false;
							}
						}
						
						**/
						
						if (!$("#addContractItemForm").validate()) {
							return false;
						}
						
						addContract(addParam);
					},cancel:function(){
					},
					init: function() {
						$("#addContractItemForm").autovalidate();
					}
    		    });
    	    },
    	    cache:false
    	});
	};
	function addContract(addParam){
		var obj = new Object();
		obj['escontractname'] = $('#escontractname').val();
		obj['escontractnum'] = $('#escontractnum').val();
		obj['esprojectname'] = $('#esprojectname').val();
		obj['esdevice'] = $('#esdevice').val();
		obj['escompany'] = $('#escompany').val();
		obj['esperson'] = $('#esperson').val();
	    obj['esperstel'] = $('#esperstel').val();
		$.post($.appClient.generateUrl({ESContractItem:'addContract'},'x'), {contract:obj}, function(data){
			if(data=='""'){
	    			$.dialog.notice({icon:'succeed',content:'添加成功!',time:3});
	    			$("#itemGrid").flexOptions().flexReload();
					return false;
	    		}else{
	    			$.dialog.notice({icon:'error',content:data,time:3});
					return false;
	    		}
			}
		)
	}
	function sizeChanged(){
		if($.browser.msie && $.browser.version==='6.0'){
			$("html").css({overflow:"hidden"});
		}
		var h = $(window).height() - $("#eslist").position().top;
		var flex = $("#itemGrid").closest("div.flexigrid");
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
	$("input[name='checkIdList']:checkbox").die().live('click',function(){
		$("#itemGrid").find("input[type='checkbox']").attr('checked',$(this).is(':checked'));
	});
	
	$(".editbtn").die().live("click", function(){
		edit_contractItem($(this).attr("id"));
	});
	function edit_contractItem(id){
		$.post($.appClient.generateUrl({ESContractItem:'edit'},'x'),{id:id},function(data){
	    	dia2 = $.dialog({
		    	title:'编辑合同工程',
	    		width: '500px',
	    	   	fixed:true,
	    	    resize: false,
	    	    padding:0,
		    	content:data,
			    cancelVal: '关闭',
			    cancel: true,
			    okVal:'确认修改',
			    ok:true,
		    	ok:function(){ 
		    		var updateParam = $("#editContractItemForm").serialize();
					if (!$("#editContractItemForm").validate()) {
						return false;
					}
					var escontractnum=$("#escontractnum").val();
			    	if(!uniqueContractNum(escontractnum,$("#oldEscontractnum").val())){
			    		return false;
			    	}
					confirmUpdate(updateParam);
				},cancel:function(){
				},
				init: function() {
					$("#editContractItemForm").autovalidate();
				}
		    });
		});
	};
	function confirmUpdate(updateParam) {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({
				ESContractItem: 'updateContract'
			},
			'x'),
			data: updateParam,
			success: function(data) {
				if (data == "") {
					$.dialog.notice({
						icon: "success",
						content: "修改合同工程成功!",
						time: 3
					});
					$("#itemGrid").flexOptions().flexReload();
				} else {
					$.dialog.notice({
						icon: "error",
						content: "修改合同工程失败",
						time: 3
					});
					return false
				}
			},
			cache: false
		})
	};
	
	//合同号唯一验证
	function uniqueContractNum(num,oldNum){
		var flag=true;
		if(num!=oldNum){
			$.ajax({
				type:"POST",
				url:$.appClient.generateUrl({ESContractItem:'uniqueContractNum'},'x'),
				data:{contractNum:num},
				async:false,//同步设置
				success:function(data){
					if(data>0){
						$("#escontractnum").addClass("invalid-text");
						$("#escontractnum").attr('title',"此合同号已存在");
	    				flag=false;
	    				return false;
	    			}
					$("#escontractnum").removeClass("invalid-text");
					$("#escontractnum").attr('title',"");
				}
			});
		}
		return flag;
	}
		
	//筛选按钮
	function filter() {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({ESContractItem: 'filter'},'x'),
			success: function(data) {
				$.dialog({
					title: '筛选数据',
					width: '600px',
					fixed: true,
					resize: false,
					padding: 0,
					content: data,
					cancelVal: '关闭',
					cancel: true,
					okVal: '筛选',
					ok: true,
					ok: function() {
						var condition = filterValue();
						$("#itemGrid").flexOptions({
							newp: 1,
							query: condition
						}).flexReload();
					},
					cancel: function() {}
				})
			},
			cache: false
		})
	};
	
	// 获取筛选条件
	function filterValue() {
		var where = {};
		var temp = [];
		$("#contents p").each(function(i) {
			var esfields = $("select[name='esfields']").eq(i).val();
			var comparison = $("select[name='comparison']").eq(i).val();
			var esfieldvalue = $("input[name='esfieldvalue']").eq(i).val();
			var relation = $("select[name='relation']").eq(i).val();
			if (esfields) {
				if (relation == "AND") {
					relation = 'true';
				} else {
					relation = 'false';
				}
				temp.push(esfields + ',' + comparison + ',' + esfieldvalue + ',' + relation);
			}
		});
		where.condition = temp;
		return where;
	};
    //添加行,删除行按钮
    $('.newfilter').die().live('click',
    function() {
        $($('#contents>p:last').clone()).appendTo($('#contents'));

    });

    $('.delfilter').die().live('click',
    function() {
        $('#contents>p').length > 5 ? $('#contents>p:last').remove() : '';
    });

    //还原数据
	function back() {
		$("#itemGrid").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
	};
});