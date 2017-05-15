$(document).ready(function() {
	$("#esDeviceList").flexigrid({
		url: $.appClient.generateUrl({
			ESDevice: "getDeviceList"
		},
		'x'),
		dataType: 'json',
		colModel: [
		{display : '数据标识',name :'id',hide:true,width:30,align:'center'},           
		{
			display: '序号',
			name: 'num',
			width: 20,
			align: 'center'
		},
		{
			display: '<input type="checkbox" id="checkIdList">',
			name: 'ids',
			width: 20,
			align: 'center'
		},
		{
			display: '操作',
			name: 'operate',
			width: 60,
			align: 'center'
		},
		{
			display: '装置名称',
			name: 'name',
			width: 160,
			align: 'left'
		},
		{
			display: '主项号',
			name: 'firstNo',
			width: 60,
			align: 'right'
		},
		{
			display: '子项号',
			name: 'secondNo',
			width: 60,
			align: 'right'
		},
		{
			display: '装置单元号',
			name: 'deviceNo',
			width: 60,
			align: 'right'
		},
		{
			display: '基础设计单位',
			name: 'baseUnits',
			width: 180,
			align: 'left'
		},
		{
			display: '详细设计单位',
			name: 'detailUnits',
			width: 180,
			align: 'left'
		},
		{
			display: '负责部门',
			name: 'mainPart',
			width: 160,
			align: 'left'
		},
		{
			display: '监理单位',
			name: 'supervisionUnits',
			width: 260,
			align: 'left'
		},
		{
			display: '备注',
			name: 'remarks',
			width: 260,
			align: 'left'
		}],
		buttons: [{
			name: '添加',
			bclass: 'add',
			onpress: function() {
				add()
			}
		},
		{
			name: '删除',
			bclass: 'delete',
			onpress: function() {
				del()
			}
		},
		{
			name: '筛选',
			bclass: 'filter',
			onpress: function() {
				filter()
			}
		},
		{
			name: '还原数据',
			bclass: 'back',
			onpress: function() {
				back()
			}
		}],
		usepager: true,
		title: '&nbsp;',
		useRp: true,
		width: width,
		height: height
	});
	function add() {
		if(  $("#treelevel").val()==1&&$("#treefirstNo").val()!=''&&$("#treefirstNo").val()!=null){
			$.dialog.notice({icon: "warning",content: "如果装置区存在主项号，不允许添加装置！",time: 3});
			return false;
		}
		$.ajax({
			url: $.appClient.generateUrl({ESDevice: 'add'},'x'),
			success: function(data) {
				dia2 = $.dialog({
					title: '添加装置单元或分类',
					width: '500px',
					fixed: true,
					resize: false,
					padding: 0,
					content: data,
					cancelVal: '关闭',
					cancel: true,
					okVal: '确认添加',
					ok: true,
					ok: function() {
						$("#level").val(parseInt($("#treelevel").val()) + 1);
						$("#pId").val($("#treenodeid").val());
						var addParam = $("#addDeviceForm").serialize();
						if (!$("#addDeviceForm").validate()) {
							return false;
						} 
						judgeDeviceName();
						judgefirstNo();
						judgeSecondNo();
						
						var flag=checkSubmit("addDeviceForm");
						if(!flag){
							return false;
						}else {
							//判断子项号不为空时，主项号为必填项
							if($("#secondNo").val()!='' && $("#firstNo").val()==''){
								$("#firstNo").addClass("warning");
								$("#firstNo").attr("title","子项号不为空时，主项号也不能为空！");
								return false;
							}
						    confirmAdd(addParam);
						}

					},
					cancel: function() {},
					init: function() {
						$("#addDeviceForm").autovalidate();
					}
				})
			},
			cache: false
		});
	};
	function confirmAdd(addParam) {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({
				ESDevice: 'addDevice'
			},
			'x'),
			data: addParam,
			success: function(data) {
				if (data) {
					$.dialog.notice({
						icon: "success",
						content: "添加装置单元成功!",
						time: 3
					});
					$("#esDeviceList").flexOptions().flexReload();
					if ($("#treelevel").val() < 2) {
						var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
						var nodes = treeObj.getSelectedNodes();
						var child = jQuery.parseJSON(data);
						if (nodes && nodes.length > 0) {
							treeObj.addNodes(nodes[0], [child]);
						}
					}
				} else {
					$.dialog.notice({
						icon: "error",
						content: "添加装置单元失败",
						time: 3
					});
					return false
				}
			},
			cache: false
		})
	};
	function del() {
		var checks = $("#esDeviceList").find("input[name='changeId']:checked");
		if (checks.length > 0) {
			$.dialog({
				title: '删除装置单元或分类',
				width: '300px',
				fixed: true,
				resize: false,
				padding: 0,
				content: "<div style='padding:40px 5px;vertical-align:middle'>确定要<span style='color:red'>删除</span>所选装置单元吗？</div>",
				cancelVal: '取消',
				cancel: true,
				okVal: '确定',
				ok: true,
				ok: function() {
					var ids = "";
					var devicename = [];
					checks.each(function() {
						var id = $(this).val();
						ids += id + ",";
						var name = $(this).closest('tr').find('td[colname="name"] div').text();
						devicename.push(name);
					});
					var delParam = {
						ids: ids.substring(0, ids.length - 1),
					    devicename:devicename.join(',')
					}
					confirmDel(delParam);
				},
				cancel: function() {}
			});
		}else{
			$.dialog.notice({
				icon: "warning",
				content: "请选择要删除的数据!",
				time: 3
			});
			return false;
		}
	};
	function confirmDel(delParam) {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({
				ESDevice: 'deleteDevice'
			},
			'x'),
			data: delParam,
			success: function(data) {
				if (data) {
					// 提示删除成功
					$.dialog.notice({
						icon: "success",
						content: "删除选择的装置单元成功",
						time: 3
					});
					$("#esDeviceList").flexOptions().flexReload();
					// 如果删除的是装置单元 刷新树
					if ($("#treelevel").val() < 2) {
						var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
						var nodes = treeObj.getSelectedNodes();
						var ids = new Array(); // 定义一数组
						ids = delParam.ids.split(","); // 字符分割
						for (i = 0; i < ids.length; i++) {
							var treeNode = treeObj.getNodeByParam("id", ids[i]);
							if (treeNode) {
								treeObj.removeNode(treeNode);
							}
						}
					}
				} else {
					// 提示删除失败
					$.dialog.notice({
						icon: "warning",
						content: "删除选择的装置单元失败",
						time: 3
					});
					return false;
				}
			},
			cache: false
		})
	};
	function filter() {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({
				ESDevice: 'filter'
			},
			'x'),
			success: function(data) {
				dia2 = $.dialog({
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
						$("#esDeviceList").flexOptions({
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
	$("#checkIdList").die().live('click',
	function() {
		$("input[name='changeId']").attr('checked', $(this).is(':checked'))
	});
	$(".editbtn").die().live("click",
	function() {
		edit($(this).attr("id"));
	});
	function edit(id) {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({
				ESDevice: 'edit'
			},
			'x'),
			data: {
				id: id
			},
			success: function(data) {
				dia2 = $.dialog({
					title: '编辑装置单元或分类',
					width: '500px',
					fixed: true,
					resize: false,
					padding: 0,
					content: data,
					cancelVal: '关闭',
					cancel: true,
					okVal: '确认修改',
					ok: true,
					ok: function() {
						var updateParam = $("#editDeviceForm").serialize();
						if (!$("#editDeviceForm").validate()) {
							return false;
						}
						judgeDeviceName();
						judgefirstNo();
						judgeSecondNo();
						var flag=checkSubmit("editDeviceForm");
						if(!flag){
							return false;
						}else {
							//判断子项号不为空时，主项号为必填项
							if($("#secondNo").val()!='' && $("#firstNo").val()=='' 
								&& $("#firstNo").attr("readonly")!=true && $("#firstNo").attr("readonly")!='readonly'){
								$("#firstNo").addClass("warning");
								$("#firstNo").attr("title","子项号不为空时，主项号也不能为空！");
								return false;
							}
						    confirmUpdate(updateParam, $("#id").val(), $("#name").val(),$("#firstNo").val());
						}
					},
					cancel: function() {},
					init: function() {
						$("#editDeviceForm").autovalidate();
					}
				})
				$.ajax({//判断是否存在装置
					type:'POST',
					url:$.appClient.generateUrl({ESDevice:'isExistDevice'},'x'),
					data:{pId:id},
		    		success:function(data){
						if(data == "false"){
				    		$("#firstNo").attr("readonly","readonly");
				    		$("#secondNo").attr("readonly","readonly");
				    	}
		    		}
				});
			},
			cache: false
		}); 
	};
	function confirmUpdate(updateParam, id, name, firstNo) {
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({
				ESDevice: 'updateDevice'
			},
			'x'),
			data: updateParam,
			success: function(data) {
				if (data == "") {
					$.dialog.notice({
						icon: "success",
						content: "修改装置单元成功!",
						time: 3
					});
					$("#esDeviceList").flexOptions().flexReload();
					if ($("#treelevel").val() < 2) {
						var treeObj = $.fn.zTree.getZTreeObj("esStageTree");
						var treeNode = treeObj.getNodeByParam("id", id);
						treeNode.name = name;
						treeNode.firstNo = firstNo;
						treeObj.updateNode(treeNode);
					}
				} else {
					$.dialog.notice({
						icon: "error",
						content: "修改装置单元失败",
						time: 3
					});
					return false
				}
			},
			cache: false
		})
	};
	function back() {
		$("#esDeviceList").flexOptions({
			newp: 1,
			query: ''
		}).flexReload();
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
    function checkSubmit(id){
    	var flag=true;
    	$("input[type='text']",$("#"+id)).each(function(){
    		if($(this).hasClass("warning")){
    			flag=false;
    		}
    	});
    	return flag;
    }
});

function judgefirstNo(){
	 if(jQuery.trim($("#firstNo").val())!=""){
			var id=-1;
			if($("#id").length>0){
				id=$("#id").val();
			}
		 if($("#treelevel").val()<=1){
			$.ajax({
				type: 'POST',
				url: $.appClient.generateUrl({ESDevice: 'judgefirstNo'},'x'),
				data: {firstNo:$("#firstNo").val(),id:id},
				async:false,
				success: function(data) {
					if(data=='false'){
						$("#firstNo").addClass("warning");
						$("#firstNo").attr("title","主项号不能重复！");
					}else{
						$("#firstNo").removeClass("warning");
						$("#firstNo").attr("title","");
						//judgeSecondNo();
					}
				}
			});
		 }
	}else{
		if($("#treelevel").val()==1){
			$("#firstNo").addClass("warning");
			$("#firstNo").attr("title","主项号不能为空！");
		}
	}
}
function judgeSecondNo(){
   if(jQuery.trim($("#secondNo").val())!=""){
		var id=-1;
		if($("#id").length>0){
			id=$("#id").val();
		}
		$.ajax({
			type: 'POST',
			url: $.appClient.generateUrl({ESDevice: 'judgeSecondNo'},'x'),
			async:false,
			data: {firstNo:$("#firstNo").val(),secondNo:$("#secondNo").val(),id:id},
			success: function(data) {
				if(data=='false'){
					$("#secondNo").addClass("warning");
					$("#secondNo").attr("title","同一装置分类中子项号不能重复！");
				}else{
					$("#secondNo").removeClass("warning");
					$("#secondNo").attr("title","");
				}
			}
		});
		}else{
			if($("#treelevel").val()==2){
				$("#secondNo").addClass("warning");
				$("#secondNo").attr("title","子项号不能为空！")
			}
				
		}
}
function judgeDeviceName(){
	   if(jQuery.trim($("#name").val())!=""){
			var id=-1;
			if($("#id").length>0){
				id=$("#id").val();
			}
			$.ajax({
				type: 'POST',
				url: $.appClient.generateUrl({ESDevice: 'judgeDeviceName'},'x'),
				async:false,
				data: {deviceName:$("#name").val(),id:id},
				success: function(data) {
					if(data=='false'){
							$("#name").addClass("warning");
							$("#name").attr("title","装置分类名称不能重复！")
					}else{
						$("#name").removeClass("warning");
						$("#name").attr("title","");
					}
				}
			});
		}else{
			$("#name").addClass("warning");
			$("#name").attr("title","装置分类名称不能为空！")
		}
	}