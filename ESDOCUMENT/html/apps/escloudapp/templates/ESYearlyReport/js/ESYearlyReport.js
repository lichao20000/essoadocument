	var curSelectedNode, treeObject;
	var againSelectedNode, againTreeObject;
	var managerLevel = $("#managerLevel").val();
	var provinceCode = $("#provinceCode").val();
	var orgId = $("#orgId").val();
	// 添加节点
	$("#yearnewsAdd").click(function(){
		if(curSelectedNode){
			// longjunhao 20140524 修改为能添加任何层级的节点
//			if((parseInt(curSelectedNode.level_number) + 1) == parseInt(managerLevel)){
			if (true) {
				var dlg = $.dialog({
					content:"<form id='yearNodeForm' onsubmit='return false;' style='margin-bottom:10px;'>" +
							"输入节点名称: <input id='newTreenode' style='width:180px;' type='text' size='40' verify='text/50/1/0'>" +
							"</form>",
					title:"添加新节点",
					okVal:"确定",
					cancelVal:"取消",
					cancel:true,
					ok:function(){
						if(!$("#yearNodeForm").validate()) return false;
						var newTreenodeName = $("#newTreenode").val();
						var level_number = parseInt(curSelectedNode.level_number) + 1;
						var province_code = provinceCode;
						var organization_id = orgId;
						$.getJSON($.appClient.generateUrl({ESYearlyReport:"addTreenode"},"x"),{parentid:curSelectedNode.id,name:newTreenodeName,level_number:level_number,province_code:province_code,organization_id:organization_id},function(data){
							if(data.result && data.result === "ok"){
								treeObject.addNodes(curSelectedNode, data.treenode, true);
								treeObject.expandNode(curSelectedNode, true);
								dlg.close();
								$.dialog.notice({content:"添加新节点成功",time:2,icon:'succeed'});
							} else {
								$.dialog.notice({content:"节点名称已存在！", time:2,icon:'warning'});
							}
						});
						return false;
					},
					init:function(){
						$("#yearNodeForm").autovalidate();
					}
				});
			} 
		} else {
			$.dialog.notice({content:"请选择节点，指定新节点添加的位置！",icon:'warning',time:3});
		}
	});
	var winW=$(window).width();
	var width='auto';
	if($.browser.msie && $.browser.version==='6.0'){
		width=winW-$(".esleft").width()-5;
	}
	var height='';
	var winH=$(window).height();
	var eslefttop=$("#esyrmenu").offset().top;
	esleftH=winH-eslefttop-1;
	var height=winH-eslefttop-115;
	window.onresize=function()
	{
		var winW=$(window).width();
		if($.browser.msie && $.browser.version==='6.0'){
			width=winW-$("#esyrmenu").width()-5;
		}
		var winH=$(window).height();
		//alert(winH);
		var height=winH-eslefttop-115;
		$(".flexigrid").css({width:width});	
	}
	
   	$("#yearList").flexigrid({
		dataType: 'json',
		editable: true,
		colModel : [
			{display: '<input id="yearcheckall" type="checkbox" name="yearcheckall">', name : 'yearcheckcol', width : 40, align: 'center'},
			{display: '操作', name : 'operate', width : 49, align: 'left'},
			{display: '类型', name : 'yeartype', width : 60, sortable : true, align: 'center',metadata:'i'},
			{display: '年度', name : 'fillyear', width : 50, sortable : true, align: 'center',metadata:'h'},
			{display: '填报单位', name : 'fillunit', width : 80, sortable : true, align: 'center',metadata:'g'},
			{display: '制表人', name : 'filluser', width : 50, sortable : true, align: 'center',metadata:'f'},
//			{display: '是否上报', name : 'isReported', width : 50, sortable : true, editable: true, align: 'center',dropdown:["是","否"],metadata:'d'},
//			{display: '上报日期', name : 'reportdate', sortable : true, width : 110, align: 'center',metadata:'c'},
//			{display: '汇总日期', name : 'summarydate', sortable : true, width : 110, align: 'center',metadata:'b'},
//			{display: '年报类型', name : 'mark', sortable : true, width : 100, align: 'center',metadata:'a'},
//			{display: '状态', name : 'status', sortable : true, width : 60, align: 'center',metadata:'j'},
			{display: '填报日期', name : 'filldate', width : 80, sortable : true, align: 'center',metadata:'e'}
		],
		buttons : [
			{name: '添加', bclass: 'add',onpress: addYear},
			{name: '删除', bclass: 'delete',onpress: deleteYear},
			{name: '年报汇总', bclass: 'tranlist',onpress: showSummaryYearWin},
			{name: '年报导出', bclass: 'export',onpress: showYearNewspaperExportWin},
			{name: '接收上报盘', bclass: 'back',onpress: showAcceptReportedPlateWin},
			{name: '形成上报盘', bclass: 'transfer',onpress: reportedPlateExport}
			////{name: '年报导出', bclass: 'export',onpress: exportYear},
//			{name: '人员信息维护', bclass: 'usergroup', onpress: openPersonal},
//			{name: '设备信息维护', bclass: 'drive_network', onpress: openDevice},
//			{name: '复制', bclass: 'summary', onpress: copydata}
		],
		onCellChange: cellChange,
		usepager: true,
		title: '年报列表',
		useRp: true,
		rp: 20,
		width: width,
		height: height
	});   	
   	
	// 相应单元格编辑事件，修改年报上报状态
	function cellChange(td, grid){
		var isReport = td.text();
		var yearId = td.closest("tr").attr("id").substring(3);
		$.post($.appClient.generateUrl({ESYearlyReport:'setIsReport'},'x'), {yearId:yearId, isReport:isReport}, function(data){
			if(data){
				$("#yearList").flexReload();
				$.dialog.notice({content:"修改年报上报标识成功！", time:2,icon:'succeed'});
			} else {
				$("#yearList").flexReload();
				$.dialog.notice({content:"此年报审批没通过，不能上报！", time:2,icon:'warning'});
			}
		});
	}
	// 全选复选框
	$("#yearcheckall").die("click").live("click", function(){
		$("#yearList").find("input[name='yearcheck']").attr("checked", this.checked);
	});
	// 编辑节点名称
	$("#yearnewsEdit").click(function(){
		if(curSelectedNode){
			if(curSelectedNode.id == "0") return;
//			if(curSelectedNode.organization_id == orgId){
				var dlg = $.dialog({
					content:"<form id='yearNodeForm' onsubmit='return false;' style='margin-bottom:10px;'>" +
					"编辑节点名称: <input id='newTreenode' style='width:180px;' type='text' size='40' verify='text/50/1/0' value='" + curSelectedNode.name + "'>" +
					"</form>",
					title:"编辑节点",
					okVal:"确定",
					cancelVal:"取消",
					cancel:true,
					ok:function(){
						if (!$('#yearNodeForm').validate()) {return false;}
						var newTreenode = {}
						newTreenode.id = curSelectedNode.id;
						newTreenode.level_number = curSelectedNode.level_number;
						newTreenode.province_code = curSelectedNode.province_code;
						newTreenode.organization_id = curSelectedNode.organization_id;
						newTreenode.parentid = curSelectedNode.parentid;
						newTreenode.name = $("#newTreenode").val();
						$.getJSON($.appClient.generateUrl({ESYearlyReport:"editTreenode"},"x"),newTreenode,function(data){
							if(data.result && data.result === "ok"){
								curSelectedNode.name = newTreenode.name;
								treeObject.updateNode(curSelectedNode);
								dlg.close();
								$.dialog.notice({content:"修改节点名称成功！",time:2,icon:'succeed'});
							} else {
								$.dialog.notice({content:"节点名称已存在！", time:2,icon:'warning'});
							}
						});
						return false;
					},
					init : function() {
						$('#yearNodeForm').autovalidate();
					}
				});
//			} else {
//				$.dialog.notice({content:"您只能修改与自己相同机构的节点。",time:3,icon:'warning'});
//			} 
		} else {
			$.dialog.notice({content:"请选择要修改的节点！",time:2,icon:'warning'});
		}
	});
	
	// 删除年报
	$("#yearnewsDel").click(function(){
		if(curSelectedNode){
			if(curSelectedNode.id == "0") return;
			var dlg=$.dialog({
				//content:"删除年报不可恢复。<br><br>确定要删除节点【" + curSelectedNode.name + "】及其下面所有节点的所有年报吗？",
				content:"确定删除该节点吗?",
				title:"删除节点",
				okVal:"确定",
				cancelVal:"取消",
				cancel:true,
				ok:function(){
					$.getJSON($.appClient.generateUrl({ESYearlyReport:"deleteTreenode"},"x"),{id:curSelectedNode.id},function(data){
						if(data.result && data.result == "ok"){
							treeObject.removeNode(curSelectedNode);
							dlg.close();
							$.dialog.notice({content:"删除节点成功！",time:2,icon:'succeed'});
							curSelectedNode = null;
						}else if(data.result && data.result == "nodeFail"){
							dlg.close();
							$.dialog.notice({title:'操作提示',content:'该节点下有子节点，不能删除！',icon:'warning',time:3});
							//$("#returnMsg").text(data.result);
							return false;
						}else if(data.result && data.result == "fail"){
							dlg.close();
							$.dialog.notice({title:'操作提示',content:'该节点下有年报，不能删除！',icon:'warning',time:3});
							return false;
						}
					});
					return false;
				}
			});
		} else {
			$.dialog.notice({content:"请选择要删除的节点！",time:2,icon:'warning'});
		}
	});

	var settingFiling = {
		async: {
			enable: true,
			dataType: 'json',
			url: $.appClient.generateUrl({ESYearlyReport:'getTree', managerLevel:managerLevel, provinceCode:provinceCode, orgId:orgId},'x'),
			autoParam: ["id"]
		},
		view: {
			dblClickExpand: false,
			showLine: false
		},
		data: {
			simpleData: {
				enable: true,
				pIdKey: 'parentid'
			}
		},
		edit: {
			enable: true
		},
		callback: {
			onClick: treeClick
		}
	};
	/**
	 * edit by gaoyide 20140916
	 * bug:1049
	 */
	var isRoot = false;//用来判断上一次点击的节点是不是根节点。
	function treeClick(e,treeId, treeNode) {
		treeObject.expandNode(treeNode);
		curSelectedNode = treeNode;
		if(treeNode.level==0){//判断是否为根节点，0是，右侧按钮成灰色不可用 gaoyde20140916
			isRoot=true;
			$(".fbutton").unbind("click");
			$(".fbutton div").hover(function(){$(this).css("background","#CDCDCD");},function(){$(this).css("background","#CDCDCD");});
			$(".fbutton div").css("cursor","default");
			$(".fbutton div").css("background","#CDCDCD");
		}else if(isRoot){
			isRoot=false;
			$(".fbutton div").css("cursor","pointer");
			$(".fbutton div").css("background","#6F6E81");
			$(".fbutton div").hover(function(){
				$(this).css("background","#133959");
				},function(){
					$(this).css("background","#6F6E81");
			});
			/*start gaoyide20140924  bug1206 */
			$('#esyrright .add').parent().parent().bind("click",addYear);
			$('#esyrright .delete').parent().parent().bind("click",deleteYear);
			$('#esyrright .tranlist').parent().parent().bind("click",showSummaryYearWin);
			$('#esyrright .export').parent().parent().bind("click",showYearNewspaperExportWin);
			$('#esyrright .back').parent().parent().bind("click",showAcceptReportedPlateWin);
			$('#esyrright .transfer').parent().parent().bind("click",reportedPlateExport);
			/*end*/
		}
		if(curSelectedNode.id > 0 && parseInt(curSelectedNode.level_number) >= parseInt(managerLevel)){
			var curNodeFullText = getNodeFullText(curSelectedNode);
			$('#esyrright').attr('curNodeFullName',curNodeFullText);// 记录选择节点的全名称 X-X-X
			$("#yearList").flexOptions({url:$.appClient.generateUrl({ESYearlyReport:'getYearnewsList', treeId:curSelectedNode.id, managerLevel:managerLevel, provinceCode:provinceCode, orgId:orgId},'x'), newp:1}).flexReload();
		} else {
			$("#yearList").flexAddData();
		}
	}
	
	// 获取选择节点的完整路径名 longjunhao 20140724
	function getNodeFullText(treeNode) {
		var nodeFullText = '';
		var nodeText = treeNode.name;
		var l = treeNode.level;
		var tempNode;
		for (var i=1; i<l; i++) {
			if (i==1) {
				tempNode = treeNode.getParentNode();
			} else {
				tempNode = tempNode.getParentNode();
			}
			nodeText += "-" + tempNode.name;
		}
		var aryText = nodeText.split('-');
		var max = aryText.length;
		for (var i=0; i<aryText.length; i++) {
			nodeFullText += aryText[max-i-1];
			if (i<max-1) {
				nodeFullText += '-';
			}
		}
		return nodeFullText;
	}
	
	// 初始化树，获取树对象便于操作
	$.fn.zTree.init($("#ESYearlyReport"), settingFiling);
	treeObject =  $.fn.zTree.getZTreeObj("ESYearlyReport");
	
	// 编辑按钮相应处理
	$("#yearList").find(".editbtn").die().live("click", function(){
		var yearId = $(this).closest("tr").attr("id").substr(3);
		var trObj=$(this).closest('tr');
		var datacs = $("#yearList").flexGetColumnValue(trObj,['a']);
		var status = $("#yearList").flexGetColumnValue(trObj,['j']);
		if(yearId){
			editYear(yearId,datacs,status);
		}
	});
	
	// 设置对应按钮相应处理
	$("#yearList").find(".relation").die("click").live("click", function(){
		var $tr = $(this).closest("tr");
		var yearId = $tr.attr("id").substring(3);
		var typeId = $.trim($tr.find("td[abbr='yeartype']").text());
		typeId = typeId=="档基2表"?2:3;
		if(yearId){
			setRelationYear(yearId, typeId);
		}
	});
	
	// 添加年报，只有档基3
	function addYear(name, grid) {
		var html  = "<input id='radio3' name='yearTypeBtn' type='radio' value='3' checked><label for='radio3' > 档基三表 </label>";
		if(curSelectedNode && curSelectedNode.id > 0){
			newYear(3, curSelectedNode.id);
		} else {
			$.dialog.notice({content:"请选择左侧节点，指定新年报的目录！",time:2,icon:'warning'});
		}
	}
	// 新建年报
	function newYear(yearType, treeId){
		var curNodeFullText = $('#esyrright').attr('curNodeFullName');
		curNodeFullText = curNodeFullText.substring(curNodeFullText.indexOf('-')+1,curNodeFullText.length);
		$.ajax({
		    url:$.appClient.generateUrl({ESYearlyReport:'add'},'x'),
		    data:{treeId:treeId, yearType:yearType,nodeText:curNodeFullText},
		    type:'post',
		    success:function(data){
		    	$.dialog({
		    		id:"addYearDialog",
			    	title:'新增年报',
			    	width:750,
			    	height:500,
		    	    padding: '0px 0px',
			    	content:data,
			    	fixed:true,
			    	close:function(){
			    		$("#yearList").flexReload();
			    	}
			    });
			},
			cache:false
		});
    };
    // 删除选择年报
    function deleteYear(){
    	var checkboxs = $("#yearList").find("input[name='yearcheck']:checked");
    	if(checkboxs.length==0){
			$.dialog.notice({content:'请选择删除的年报',time:2,icon:'warning'});
			return false;
		}
		/*var trObj = $(checkboxs).closest('tr');
		var yearstatus = $("#yearList").flexGetColumnValue(trObj,['j']);
		if(yearstatus == '审批中'){
			$.dialog({content:'正在审批的年报不能删除',time:2});
			return false;
		}*/
		if(checkboxs.length > 0){
    		if(curSelectedNode && curSelectedNode.id > 0) {
				var yeaDialog=$.dialog({
					content: "删除操作不可恢复，确定要删除选择的年报吗？",
					okVal:'确定',
					cancel: true,
					cancelVal:'取消',
					ok: function(){
						var ids = [];
						checkboxs.each(function(){
							ids.push($(this).closest("tr").attr("id").substr(3));
						});
						$.post($.appClient.generateUrl({ESYearlyReport:'delete'},'x'), {ids:ids}, function(data){
							if(data){
								yeaDialog.close();
								$("#yearList").flexReload();
								$.dialog.notice({content:"删除选择年报成功！", time:2,icon:'succeed'});
							}else{
								yeaDialog.close();
								$.dialog.notice({title:'操作提示',content:'存在不符合条件的年报，不能删除，请重新选择！',icon:'warning',time:3});
								return false;
							}
						});
					}
				});
			}
		}
    }
    
    /**
     * 展示年报导出选择窗口
     */
    function showYearNewspaperExportWin() {
    	var checkboxs = $("#yearList").find("input[name='yearcheck']:checked");
    	if(checkboxs.length < 1){
    		$.dialog.notice({content:"请选择一份年报！", width:200, time:2,icon:'warning'});
    		return;
    	}
    	if(checkboxs.length > 1){
    		$.dialog.notice({content:"您一次只能导出一份年报！", time:2,icon:'warning'});
    		return;
    	}
    	var content = "<div style='display:inline;'>" +
			"<label><input type='radio' name='exportType' value='excel' checked='checked'/>Excel</label>" +
			"<label><input type='radio' name='exportType' value='xml' />Xml</label>" +
		"</div>";
		var dlg = $.dialog({
			content:content,
			title:"选择年报导出格式",
			width:200,
			okVal:"确定",
			cancelVal:"取消",
			cancel:true,
			ok:function(){
				var extype = $("input[name='exportType']:checked").val();
				exportYear(extype);
			}
		});
    }
    
    /**
     * 展示年报汇总选择窗口 longjunhao 20140604
     */
    function showSummaryYearWin() {
    	if (curSelectedNode == null || !curSelectedNode.isParent) {
    		$.dialog.notice({content:"该节点没有下一级节点，请重新选择！", width:300, time:2,icon:'warning'});
    		return;
    	}
    	var content = "<div style='display:inline;'>" +
    		"<label><input type='radio' name='exType' value='excel' checked='checked'/>Excel</label>" +
    		"<label><input type='radio' name='exType' value='xml' />Xml</label>" +
    	"</div>";
		var dlg = $.dialog({
			content:content,
			title:"选择汇总格式",
			width:200,
			okVal:"确定",
			cancelVal:"取消",
			cancel:true,
			ok:function(){
				var extype = $("input[name='exType']:checked").val();
				summaryYear(extype);
			}
		});
	
    }
    
    /**
     * 年报汇总（汇总格式excel和xml） longjunhao 20140528
     */ 
    function summaryYear(exType){
    	if (curSelectedNode == null || !curSelectedNode.isParent) {
    		$.dialog.notice({content:"该节点没有下一级节点，请重新选择！", width:300, time:2,icon:'warning'});
    		return;
    	}
    	if (exType == null || exType != "xml") {
    		exType = "excel";
    	}
    	var treeId = curSelectedNode.id;
    	// 拼接节点名
//    	var nodeText = getNodeTextByNode(curSelectedNode);
    	var nodeText = $('#esyrright').attr('curNodeFullName');
		$.post($.appClient.generateUrl({ESYearlyReport:'summary'},'x'), {treeId:treeId, exType:exType, textNode:nodeText}, function(data){
			if(data){
				var obj = eval('(' + data + ')');
				if(obj.success && obj.fileUrl) {
//					var addr = decodeURIComponent(obj.fileUrl);
					var addr = obj.fileUrl;
					var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDown',fileUrl:addr});
					$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载导出数据</a>',icon: 'succeed'});
//					window.open(addr,"_blank");
				}
			}else{
				$.dialog.notice({content:"汇总失败！",time:2,icon:"error"});
			}
		});
    }
    
    // 形成上报盘，批量导出年报xml格式
    function reportedPlateExport() {
    	if (curSelectedNode == null) {
    		$.dialog.notice({content:"请选择一个节点！", width:200, time:2,icon:'warning'});
    		return;
    	}
    	var treeId = curSelectedNode.id;
    	// 拼接节点名
//    	var nodeText = getNodeTextByNode(curSelectedNode);
    	var nodeText = $('#esyrright').attr('curNodeFullName');
    	$.post($.appClient.generateUrl({ESYearlyReport:'reportedPlateExport'},'x'),{treeId:treeId,nodeText:nodeText},function(data){
    		if(data){
				var obj = eval('(' + data + ')');
				if(obj.success && obj.fileUrl) {
//					var addr = encodeURI(obj.fileUrl);
					var addr = obj.fileUrl;
					var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDown',fileUrl:addr});
					$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载导出数据</a>',icon: 'succeed'});
//					window.open(addr,"_blank");
				}
			}else{
				$.dialog.notice({content:"形成上报盘失败！",time:2,icon:"error"});
			}
		});
    }
    
    /**
     * 年报导出
     */ 
    function exportYear(exType){
    	var checkboxs = $("#yearList").find("input[name='yearcheck']:checked");
    	if(checkboxs.length < 1){
    		$.dialog.notice({content:"请选择一份年报！", width:200, time:2,icon:'warning'});
    	}
    	if(checkboxs.length > 1){
    		$.dialog.notice({content:"您一次只能导出一份年报！", time:2,icon:'warning'});
    		return;
    	}
    	if(checkboxs.length = 1){
			var yearId = $(checkboxs[0]).closest("tr").attr("id").substr(3);
			$.get($.appClient.generateUrl({ESYearlyReport:'export'},'x'),{yearId:yearId,type:exType},function(addr){
//				addr = decodeURIComponent(addr);
				var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDown',fileUrl:addr});
				$.dialog.notice({width: 150,content: '<a href="'+downFile+'">下载导出数据</a>',icon: 'succeed'});
//				window.open(addr,"_blank");
			});
    	}
    }
    
    // 接收上报盘，导入年报xml格式
    function acceptReportedPlate(isRepeat,dlg) {
    	$("[name='isRepeat']").val(isRepeat);
		$.ajax({
			async : false,
			url:$.appClient.generateUrl({ESYearlyReport:'acceptReportedPlate'},'x'),
			success:function(url){
				$('#importXml').ajaxSubmit({
					url:url,
					dataType:"text",
					success:function(data){
						var obj = eval('(' + data + ')');
						if (obj && obj.success=="true") {
							$("#yearList").flexReload();
							dlg.close();
						} else {
							$.dialog({title:'操作提示',icon:'error',content:"接收上报盘失败"});
						}
					},
					error:function(){
						$.dialog({title:'操作提示',icon:'error',content:"系统错误，请联系管理员"});
					}
				});
			}
		});
    }
    
    // 拼接节点名 废弃
    function getNodeTextByNode(tmpNode) {
    	var nodeTextArray = new Array();
    	while (tmpNode.getParentNode()) {
    		nodeTextArray.push([tmpNode.name]);
    		tmpNode = tmpNode.getParentNode();
    	}
    	nodeTextArray = nodeTextArray.reverse();
    	var nodeText = "";
    	for (var i=0; i<nodeTextArray.length; i++) {
    		if (i == nodeTextArray.length-1) {
    			nodeText += nodeTextArray[i];
    		} else {
    			nodeText += nodeTextArray[i] + "-";
    		}
    	}
    	return nodeText;
    }
	// 修改年报
	function editYear(yearId,datacs,status){
		if(curSelectedNode && curSelectedNode.id > 0){
			var canEdit = true;//(curSelectedNode.organization_id == orgId);
			$.ajax({
			    url:$.appClient.generateUrl({ESYearlyReport:'edit'},'x'),
			    type:'post',
			    data:'yearId=' + yearId + '&canEdit=' + canEdit + '&datacs=' + datacs + '&status=' + status + '&treeId=' + curSelectedNode.id,
			    success:function(data){
			    	$.dialog({
			    		id:"yearDialog",
				    	title:'编辑年报',
				    	width:750,
				    	height:500,
			    	    padding: '0px 0px',
				    	content:data,
				    	fixed:true,
				    	close:function(){
				    		if(canEdit) $("#yearList").flexReload();
				    	}
				    });
				},
				cache:false
			});
		} else {
			$.dialog.notice({content:"请先选择左侧目录再选定要修改的年报！",time:2,icon:'warning'});
		}
    };
    // 设置对应函数
    function setRelationYear(yearId, typeId){
    	$.ajax({
		    url:$.appClient.generateUrl({ESYearlyReport:'setRelation', yearId:yearId, typeId:typeId},'x'),
		    success:function(data){
		    	$.dialog({
		    		id:"yearConditionDialog",
			    	title:'设置对应',
			    	width:920,
			    	height:500,
		    	    padding: '0px 0px',
			    	content:data,
			    	fixed:true
			    });},
			    cache:false
		});
    }
    
	// 打开切换到人员信息维护
	function openPersonal(){
		if(managerLevel*1 > 0) {
		 	if($("#personalList").length == 0){
		     	$("#personalDiv").append($("<table id='personalList'></table>"));
		     	$("#estabs").esTabs("open", {title:"人员信息维护", content:"#personalDiv", canClose:true});
			   	$("#personalList").flexigrid({
					url: $.appClient.generateUrl({ESYearlyReport:'getPersonalList', managerLevel:managerLevel, provinceCode:provinceCode, orgId:orgId},'x'),
					dataType: 'json',
					colModel : [
						{display: '<input id="personcheckall" type="checkbox" name="personcheckall">', name : 'personcheckcol', width : 40, align: 'center'},
						{display: '操作', name : 'operate', width : 100, align: 'center'},
						{display: '机构', name : 'organization', width : 100, sortable : true, align: 'center'},
						{display: '姓名', name : 'name', width : 80, sortable : true, align: 'center'},
						{display: '性别', name : 'gender', width : 60, sortable : true, align: 'center'},
						{display: '出生日期', name : 'birthday', width : 100, sortable : true, align: 'center'},
						{display: '专/兼职', name : 'fullparttime', width : 100, sortable : true, align: 'center'},
						{display: '文化程度', name : 'culturallevel', width : 100, sortable : true, align: 'center'},
						{display: '档案专业程度', name : 'fileprofessionaldegree', width : 100, sortable : true, align: 'center'},
						{display: '是否接受在职教育', name : 'on_job_training', width : 100, sortable : true, align: 'center'},
						{display: '档案干部专业技术职务', name : 'post', width : 100, sortable : true, align: 'center'}
					],
					buttons : [
						{name: '添加', bclass: 'add', onpress: addperson},
						{name: '删除', bclass: 'delete', onpress: deleteperson},
						{name: '筛选', bclass: 'filter', onpress: filterperson},
						{name: '还原', bclass: 'refresh', onpress: reset}
					],
					usepager: true,
					title: '人员列表',
					useRp: true,
					rp: 20,
					showTableToggleBtn: true,
					width: winW,
					height: height
				});	
			} else {
				$("#estabs").esTabs("select", "人员信息维护");
			} 
		} else {
			$.dialog.notice({content:"您无权进行人员信息维护！",time:2,icon:'warning'});
		}
	}
	//还原
	function reset(){
		$("#personalList").flexOptions({query:''}).flexReload();
	}
	function getSelectHtml(data, selected, id, verify){
		var html = [];
		html.push("<select verify='" + verify + "' id='" + id + "'>");
		$.each(data, function(k,v){
			html.push("<option ");
			if(selected == v[0]) html.push("selected='selected' ");
			html.push("value='");
			html.push(v[0]);
			html.push("'>");
			html.push(v[1]);
			html.push("</option>");
		});
		html.push("</select>");
		return html.join("");
	}
	// 获取人员对话框界面html
	function getPersonHtml(person){
		var p = $.extend({name:"",birthday:"",gender:"",organization:"",fullparttime:"",culturallevel:"",fileprofessionaldegree:"",post:"",id:"",genderzit:"",on_job_training:''}, person);
		if(p.birthday == null) p.birthday = "";
		var culturallevel = [["博士研究生","博士研究生"],
				["硕士研究生","硕士研究生"],
				["研究生班研究生","研究生班研究生"],
				["双学士","双学士"],
				["大学本科","大学本科"],
				["大专","大专"],
				["中专","中专"],
				["高中","高中"],
				["初中及以下","初中及以下"]];
		var culturallevelHtml = getSelectHtml(culturallevel, p.culturallevel, "edit_culturallevel", "text/10/0/0");
		var fileprofessionaldegree = [["博士研究生","博士研究生"],
				["硕士研究生","硕士研究生"],
				["研究生班研究生","研究生班研究生"],
				["大学本科","大学本科"],
				["大专","大专"],
				["中专","中专"],
				["职业高中","职业高中"]];
		var fileprofessionaldegreeHtml = getSelectHtml(fileprofessionaldegree, p.fileprofessionaldegree, "edit_fileprofessionaldegree", "text/25/0/0");
		var post = [["研究馆员","研究馆员"],
				["副研究馆员","副研究馆员"],
				["馆员","馆员"],
				["助理馆员","助理馆员"],
				["管理员","管理员"]];
		var postHtml = getSelectHtml(post, p.post, "edit_post", "text/25/0/0");
		var fullparttime = [["专职","专职"],["兼职","兼职"]];
		var fullparttimeHtml = getSelectHtml(fullparttime, p.fullparttime, "edit_fullparttime", "text/5/0/0");
		var gender = [["男","男"],["女","女"]];
		var genderHtml = getSelectHtml(gender, p.gender, "edit_gender", "text/2/0/0");
		var genderzit = [["否","否"],["是","是"]];
		var on_job_training = getSelectHtml(genderzit, p.on_job_training, "edit_on_job_training", "text/2/0/0");
		var html = [];
		html.push("<form id='personForm' onsubmit='return false;'><div id='edit_person' class='editdiv'>");
		html.push("<div>姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：<input type='text' verify='text/20/0/0' id='edit_name' value='" + p.name + "'>&nbsp;&nbsp;&nbsp;性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：" + genderHtml + "</div>");
		html.push("<div>出生日期：<input type='text' verify='text/10/1/0' id='edit_birthday' value='" + p.birthday + "' onfocus='WdatePicker({dateFmt:\"yyyy-MM-dd\"});'>&nbsp;&nbsp;&nbsp;机&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;构：<input type='text' verify='text/25/0/0' id='edit_organization' value='"+ p.organization +"'></div>");
		html.push("<div>专&nbsp;/&nbsp;&nbsp;兼职：" + fullparttimeHtml + "&nbsp;&nbsp;&nbsp;文化程度：" + culturallevelHtml + "</div>");
		html.push("<div>档案专业程度：" + fileprofessionaldegreeHtml + "&nbsp;&nbsp;&nbsp;&nbsp;接受在职培训教育：" + on_job_training + "</div>");
		html.push("<div>档案干部专业技术职务：" + postHtml + "<input type='hidden' id='edit_id' value='" + p.id + "'></div>");
		html.push("</div></form>");
		return html.join("");
	}
	// 添加人员信息
	function addperson(){
		$.dialog({
			title: "添加人员信息",
			content: getPersonHtml(),
			padding: "20px",
			cancelVal: "关闭",
			cancel: true,
			okVal: "保存",
			ok: function(){
				if(!$("#personForm").validate()) return false;
				var dlg = this;
				var newperson = {};
				$("#edit_person").find("input,select").each(function(){
					newperson[this.id.substring("5")] = $(this).val();
				});
				var ectval = $('#edit_on_job_training').val(); 
				newperson["level_number"] = managerLevel;
				newperson["province_code"] = provinceCode;
				newperson["record_id"] = orgId;
				newperson["on_job_training"] = ectval;
				$.post($.appClient.generateUrl({ESYearlyReport:"addPerson"}, "x"),{person:newperson}, function(data){
					if(data){
						dlg.close();
						$("#personalList").flexReload();
					}
				});
				return false;
			},
			init: function(){
				$("#personForm").autovalidate();
			}
		});
	}
	// 删除人员
	function deleteperson(){
		var checkboxs = $("#personalList").find("input[name='personcheck']:checked");
		if(checkboxs.length==0){
			$.dialog.notice({content:'请选择删除的人员',time:2,icon:'warning'});
			return false;
		}
		if(checkboxs.length > 0){
			$.dialog({
				content: "删除操作不可恢复，确定要删除选择的人员吗？",
				cancel: true,
				ok: function(){
					var ids = [];
					checkboxs.each(function(){
						ids.push($(this).closest("tr").attr("id").substr(3));
					});
					$.post($.appClient.generateUrl({ESYearlyReport:'deletePerson'},'x'), {ids:ids}, function(data){
						if(data){
							$("#personalList").flexReload();
						}
					});
				}
			});
		}
	}
	// 筛选人员
	function filterperson(){
		$.get($.appClient.generateUrl({ESYearlyReport:"personcondition"}, "x"), {}, function(data){
			$.dialog({
				title: "选择条件",
				width: "500px",
				padding: "10px, 10px",
				content: data,
				cancel: true,
				ok: function(){
					var conds = generateCondition();
					$("#personalList").flexOptions({query:conds}).flexReload();
				}
			});
		});
	}
	// 编辑按钮相应处理
	$("#personalList").find(".editbtn").die("click").live("click", function(){
		var person = $(this).closest("tr").prop("data");
		if(person && person.cell){
			$.dialog({
				title: "编辑人员信息",
				content: getPersonHtml(person.cell),
				padding: "20px",
				cancelVal: "关闭",
				cancel: true,
				okVal: "保存",
				ok: function(){
					if(!$("#personForm").validate()) return false;
					var dlg = this;
					var newperson = {};
					$("#edit_person").find("input,select").each(function(){
						newperson[this.id.substring("5")] = $(this).val();
					});
					newperson["level_number"] = managerLevel;
					newperson["province_code"] = provinceCode;
					newperson["record_id"] = orgId;
					$.post($.appClient.generateUrl({ESYearlyReport:"editPerson"}, "x"),{person:newperson}, function(data){
						if(data){
							dlg.close();
							$("#personalList").flexReload();
						}
					});
					return false;
				},
				init: function(){
					$("#personForm").autovalidate();
				}
			});
		}
	});
	// 全选复选框
	$("#personcheckall").die("click").live("click", function(){
		$("#personalList").find("input[name='personcheck']").attr("checked", this.checked);
	});
	// 打开切换到设备信息维护
	function openDevice(){
		if(managerLevel*1 > 0) {
			if($("#deviceList").length == 0){
		     	$("#deviceDiv").append($("<table id='deviceList'></table>"));
		     	$("#estabs").esTabs("open", {title:"设备信息维护", content:"#deviceDiv", canClose:true});
			   	$("#deviceList").flexigrid({
					url: $.appClient.generateUrl({ESYearlyReport:'getDeviceList',managerLevel:managerLevel,provinceCode:provinceCode,orgId:orgId},'x'),
					dataType: 'json',
					colModel : [
						{display: '<input id="devicecheckall" type="checkbox" name="devicecheckall">', name : 'devicecheckcol', width : 40, align: 'center'},
						{display: '操作', name : 'operate', width : 100, align: 'center'},
						{display: '机构', name : 'organization', width : 100, sortable : true, align: 'center'},
						{display: '设备类型', name : 'divice_type', width : 100, sortable : true, align: 'center'},
						{display: '设备名称', name : 'divice_name', width : 150, sortable : true, align: 'center'},
						{display: '数量', name : 'amount', width : 100, sortable : true, align: 'center'}
					],
					buttons : [
						{name: '添加', bclass: 'add', onpress: adddevice},
						{name: '删除', bclass: 'delete', onpress: deletedeivice},
						{name: '筛选', bclass: 'filter', onpress: filterdevice},
						{name: '还原', bclass: 'refresh', onpress: refresh}
					],
					sortname: "c3",
					sortorder: "asc",
					usepager: true,
					title: '设备列表',
					useRp: true,
					rp: 20,
					showTableToggleBtn: true,
					width: winW,
					height: height
				});	
			} else {
				$("#estabs").esTabs("select", "设备信息维护");
			} 
		} else {
			$.dialog.notice({content:"您无权进行设备信息维护！",time:2,icon:'warning'});
		}
	}
	function refresh(){
		$("#deviceList").flexOptions({query:''}).flexReload();
	}
	// 获取人员对话框界面html
	function getDeviceHtml(device){
		var d = $.extend({organization:"",divice_type:"",divice_name:"",amount:"",id:""}, device);
		var deviceType = [["缩微摄影机","微缩设备-缩微摄影机"],
						["冲洗机","微缩设备-冲洗机"],
						["拷贝机","微缩设备-拷贝机"],
						["阅读器","微缩设备-阅读器"],
						["阅读复印机","微缩设备-阅读复印机"],
						["服务器","电子计算机-服务器"],
						["微机","电子计算机-微机"],
						["复印机","复印机"],
						["集中式","空调机-集中式"],
						["分散式","空调机-分散式"],
						["去湿机","去湿机"],
						["消毒设备","消毒设备"]]
		var deviceTypeHtml = getSelectHtml(deviceType, d.divice_type, "edit_divicetype", "text/25/0/0");
		var html = [];
		html.push("<form id='deviceForm' onsubmit='return false;'><div id='edit_device' class='editdiv'>");
		html.push("<div>设备名称：<input type='text' verify='text/25/1/0' id='edit_divicename' value='" + d.divice_name + "'>&nbsp;&nbsp;&nbsp;数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;量：<input type='text' verify='number/10/1/0' id='edit_amount' value='" + d.amount + "'></div>");
		html.push("<div>设备类型：" + deviceTypeHtml + "&nbsp;&nbsp;&nbsp;机&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;构：<input type='text' verify='text/25/0/0' id='edit_organization' value='"+ d.organization +"'><input type='hidden' id='edit_id' value='" + d.id + "'></div>");
		html.push("</div></form>");
		return html.join("");
	}
	// 添加设备
	function adddevice(){
		$.dialog({
			title: "添加设备信息",
			content: getDeviceHtml(),
			padding: "20px",
			cancelVal: "关闭",
			cancel: true,
			okVal: "保存",
			ok: function(){
				if(!$("#deviceForm").validate()) return false;
				var dlg = this;
				var newdevice = {};
				$("#edit_device").find("input,select").each(function(){
					newdevice[this.id.substring("5")] = $(this).val();
				});
				newdevice["level_number"] = managerLevel;
				newdevice["province_code"] = provinceCode;
				newdevice["organization_id"] = orgId;
				$.post($.appClient.generateUrl({ESYearlyReport:"addDevice"}, "x"),{device: newdevice}, function(data){
					if(data){
						dlg.close();
						$("#deviceList").flexReload();
					}
				});
				return false;
			},
			init: function(){
				$("#deviceForm").autovalidate();
			}
		});
	}
	// 删除设备
	function deletedeivice(){
		var checkboxs = $("#deviceList").find("input[name='devicecheck']:checked");
		if(checkboxs.length==0){
			$.dialog.notice({content:'请选择删除的设备',time:2,icon:'warning'});
			return false;
		}
		if(checkboxs.length > 0){
			$.dialog({
				content: "删除操作不可恢复，确定要删除选择的设备吗？",
				cancel: true,
				ok: function(){
					var ids = [];
					checkboxs.each(function(){
						ids.push($(this).closest("tr").attr("id").substr(3));
					});
					$.post($.appClient.generateUrl({ESYearlyReport:'deleteDevice'},'x'), {ids:ids}, function(data){
						if(data){
							$("#deviceList").flexReload();
						}
					});
				}
			});
		}
	}
	// 筛选设备
	function filterdevice(){
		$.get($.appClient.generateUrl({ESYearlyReport:"devicecondition"}, "x"), {}, function(data){
			$.dialog({
				title: "选择条件",
				width: "700px",
				padding: "10px, 10px",
				content: data,
				cancel: true,
				ok: function(){
					var conds = generateCondition();
					$("#deviceList").flexOptions({query:conds}).flexReload();
				}
			});
		});
	}
	// 编辑按钮相应处理
	$("#deviceList").find(".editbtn").die("click").live("click", function(){
		var device = $(this).closest("tr").prop("data");
		if(device && device.cell){
			$.dialog({
				title: "编辑设备信息",
				content: getDeviceHtml(device.cell),
				padding: "20px",
				cancelVal: "关闭",
				cancel: true,
				okVal: "保存",
				ok: function(){
					if(!$("#deviceForm").validate()) return false;
					var dlg = this;
					var newdevice = {};
					$("#edit_device").find("input,select").each(function(){
						newdevice[this.id.substring("5")] = $(this).val();
					});
					newdevice["level_number"] = managerLevel;
					newdevice["province_code"] = provinceCode;
					newdevice["organization_id"] = orgId;
					$.post($.appClient.generateUrl({ESYearlyReport:"editDevice"}, "x"),{device:newdevice}, function(data){
						if(data){
							dlg.close();
							$("#deviceList").flexReload();
						}
					});
					return false;
				},
				init: function(){
					$("#deviceForm").autovalidate();
				}
			});
		}
	});
	// 全选复选框
	$("#devicecheckall").die("click").live("click", function(){
		$("#deviceList").find("input[name='devicecheck']").attr("checked", this.checked);
	});
	// 拼接筛选条件
	function generateCondition(){
		var plength = $("#contents p").length;
		var fields = $("[name='esfields']");
		var fieldtypes = $("[name='esfieldtype']");
		var comparisons = $("[name='comparison']");
		var esfieldvalues = $("[name='esfieldvalue']");
		var relations = $("[name='relation']");
		var sql = [];
		var sql_string = "";
		for(var i=0; i<plength; i++)
		{
			if(fields.eq(i).val() != "-" && esfieldvalues.eq(i).val()){
				var filedname		=	fields.eq(i).val();
				var filedtype		=	fieldtypes.eq(i).val();
				var comparison		=	comparisons.eq(i).val();
				var filedvalue		=	esfieldvalues.eq(i).val();
				var relationship	=	relations.eq(i).val();
				if(comparison == "like" || comparison == "not like"){
					sql.push(filedname+" "+comparison+" '%"+filedvalue+"%' "+relationship+" ");
				} else {
					sql.push(filedname+" "+comparison+" '"+filedvalue+"' "+relationship+" ");
				}
			}
		}
		if(sql.length > 0) {
			sql_string = sql.join("");
			sql_string = sql_string.substr(0, sql_string.length - 4);
		}
		return sql_string;
	}
	//提交审批年报
	function submityear(){
		var checkboxvalue=$("input[name='yearPaperId']").val();
		var trObj=$("#tRow"+checkboxvalue).closest('tr');
		var path = [];
		var yearclass = $("#yearList").flexGetColumnValue(trObj,['i']);
		var yeary = $("#yearList").flexGetColumnValue(trObj,['h']);
		var yearstatus = $("#yearList").flexGetColumnValue(trObj,['j']);
		var yearperson = $("#yearList").flexGetColumnValue(trObj,['f']);
		var yearunit = $("#yearList").flexGetColumnValue(trObj,['g']);
		var yearId = checkboxvalue;
		var datacs = $("#yearList").flexGetColumnValue(trObj,['a']);
		if(yearstatus == '未审批' || yearstatus == '审批不通过' && checkboxvalue){
			path.push( checkboxvalue + '|' + yearclass + '|' + yeary + '|' + yearstatus + '|' + yearperson + '|' + yearunit + '|' + yearId + '|' + datacs );
			$.ajax({
				url:$.appClient.generateUrl({ESYearlyReport:'submitok'},'x'),
				type:'post',
				data:'path=' + path,
				success:function(data){
					$.dialog({
						title: "档案年报审批单",
						width:540,
						content: data,
						padding: "15x 0px 0px 15px",
						cancelVal: "关闭",
						cancel: true,
						okVal: "确定",
						ok: function(){
							var bewrite =  $("#bewrite").val();
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
										$.ajax({
										    url:$.appClient.generateUrl({ESYearlyReport:'submityear'},'x'),
										    type:'post',
										    data:'checkboxvalue=' + checkboxvalue + '&bewrite=' + bewrite + '&yearclass=' + yearclass + '&yearunit=' + yearunit + '&yearperson=' + yearperson + '&yearstatus=' + yearstatus+ '&datacs=' + datacs+ '&yeary=' + yeary+'&approveUserId='+approveUserId,
										    success:function(data){
										    	$.dialog({id:'yearDialog'}).close();
										    	$("#yearList").flexReload();
										    	$.dialog.notice({content:'提交成功，请等待审批',time:3,icon:'success',width:200});
											},
											cache:false
									    });
									}else{
										$.dialog({
											title: '选择审批领导',
											content: htm,
											okVal: '确定',
											cancelVal: '取消',
											cancel: true,
											ok:function(){
												var forms = document.getElementById('check_approval_list').elements,fl=forms.length;
												var approveUserId='';
												for(var f=0; f<fl; f++)
												{
													if(forms[f].checked){
														approveUserId = forms[f].id;
														break;
													}
												}
												if(approveUserId ==''){
													return false;
												}
												$.ajax({
												    url:$.appClient.generateUrl({ESYearlyReport:'submityear'},'x'),
												    type:'post',
												    data:'checkboxvalue=' + checkboxvalue + '&bewrite=' + bewrite + '&yearclass=' + yearclass + '&yearunit=' + yearunit + '&yearperson=' + yearperson + '&yearstatus=' + yearstatus+ '&datacs=' + datacs+ '&yeary=' + yeary+'&approveUserId='+approveUserId,
												    success:function(data){
												    	$.dialog({id:'yearDialog'}).close();
												    	$("#yearList").flexReload();
												    	$.dialog.notice({content:'提交成功，请等待审批',time:3,width:200,icon:'success'});
													},
													cache:false
											    });
											}
										});
									}
								}
							);
						}
					});
				},
				cache:false
			});
		} else {
    		$.dialog.notice({content:'只能提交未审批或者退回的年报',time:3,width:200,icon:'warning'});
			return false;
		}
	}
	//复制
	function copydata(){
		var checkboxObj = $("input[name='yearcheck']:checked",$('#yearList'));
		if(checkboxObj.length == 0){
    		$.dialog.notice({content:'请选择要复制的数据',time:3,width:200,icon:'warning'});
			return false;
    	} else if (checkboxObj.length > 1) {
    		$.dialog.notice({content:'只能复制一份数据',time:3,width:200,icon:'warning'});
			return false;
    	}
		var yearId = checkboxObj.val();
		if(curSelectedNode && curSelectedNode.id > 0 && (curSelectedNode.organization_id == orgId)){
			$.ajax({
				url:$.appClient.generateUrl({ESYearlyReport:'copydata'},'x'),
				type:'post',
				success:function(data){
					$.dialog({
						title: "复制",
						width:300,
						height:100,
						content: data,
						padding: "5px",
						cancelVal: "关闭",
						cancel: true,
						okVal: "确定",
						ok: function(){
							var treeId = $("input[name='copyid']").val();
							if(againSelectedNode && againSelectedNode.id > 0 && (againSelectedNode.organization_id == orgId)){
								$.ajax({
								    url:$.appClient.generateUrl({ESYearlyReport:'yearnewspaperCopy'},'x'),
								    type:'post',
								    data:'yearId=' + yearId + '&treeId=' + treeId,
								    success:function(data){
										var trObj=$("#tRow"+yearId).closest('tr');
								    	var yearType = $("#yearList").flexGetColumnValue(trObj,['i']);
								    	if(data){
								    		$.dialog.notice({content:yearType+'复制成功！',time:3,width:220,icon:'succeed'});
								    	} else {
								    		$.dialog.notice({content:'已存在'+yearType+'，复制失败！',time:3,width:220,icon:'error'});
								    	}
									},
									cache:false
								});
							}else{
								$.dialog.notice({content:"您只能复制自己所在机构层级节点下的年报！", time:2,icon:'warning'});
							}
						}
					});
				}
			});
		}else{
			$.dialog.notice({content:"您只能复制自己所在机构层级节点下的年报！", time:2,icon:'warning'});
		}
	}
	
	//回退后显示相应的页面
	function _task(){
		var hashStr = window.location.hash;// 例如：：：#back|13|信息|2012||自建年报|2012|1364892473714
		if(hashStr!=''){
			var hash = hashStr.split('|');
			if(hash[0] == '#back'){
				var yearPaperId=hash[1];
				var yearPaperStatus = hash[2];
				var treeiD = hash[3];
				var yearPaperDatacs = hash[7];
				var strObj=treeObject;
				var node = strObj.getNodeByParam("id",treeiD,null);
				strObj.selectNode(node); // 选中状态树状态
				var nodes = strObj.getSelectedNodes(); // 获取选中节点数据
				curSelectedNode=nodes[0];
				treeClick(event,treeiD,curSelectedNode);
				if(yearPaperId){
					editYear(yearPaperId,yearPaperDatacs,yearPaperStatus);
				}
			}
			window.location.hash = null;
		}
	}
	
	// longjunhao add 20140526 拼装年报xml内容
	function getYearNewsPaperXmlInfo(obj) {
		var saveYearnews = {};
		var moreInfo = "<?xml version=\"1.0\"?>\r\n" 
			+ "<datas>\r\n";
		obj.find("input").each(function(i, v){
			var datatype = $(this).attr("datatype");
			var value;
			if(datatype=="number"){
				var eipReg=/^(-?\d+)(\.\d+)?$/;
				if((!eipReg.test($(this).val()))&&($(this).val()!='')){
					checkNum=1;
					$(this).addClass("invalid-text").attr("title","请输入合法的数字");
				}
				value = Number($(this).val());
			} else {
				value = String($(this).val()); 
			}
			var sign = $(this).attr("id").substring(8).toLowerCase();
			var reg = /^(y[csm])(\d+)$/;
			if (reg.test(sign)) {
				moreInfo += "<" + sign + ">" + value + "</" + sign + ">\r\n";
			} else {
				saveYearnews[sign] = value;
			}
		});
		moreInfo += "</datas>";
		saveYearnews["moreinfo"] = moreInfo;
		return saveYearnews;
	}
	
	/**
	 * 接收上报盘导入界面
	 * longjunhao 20140603
	 */
	function showAcceptReportedPlateWin()
	{
		if (!curSelectedNode) {
			$.dialog.notice({content:"请选择一个接收节点再进行此操作！", time:2,icon:'warning'});
			return false;
		}
		var content = 
		"<div id='importXmlDiv'>" +
			"<form id='importXml' enctype='multipart/form-data' method='post'>" +
				"<div style='border:solid 1px #AAAAAA;padding:7px 0 10px 10px;margin:2px;width:480px;height:80px;'>" +
					"<span style='position: relative;left:10px; top:-17px;background-color:#FFF;font-weight:bold;color:#909090;'>选择文件</span>"+
			        "<div style='margin-bottom:12px'><div style='width:220px;height:20px;line-height:20px;float:left;'>上传档案室基本情况年报：</div><input type='file' style='width:250px;height:19px;' name='dj3yn' /></div>" +
			        "<div style='margin-bottom:12px'><div style='width:220px;height:20px;line-height:20px;float:left;'>上传档案室数字档案基本情况年报：</div><input type='file' style='width:250px;height:19px;' name='dj3fyn' /></div>" +
				"</div>" +
				"<input type='hidden' name='treeId' value=''/>" + 
				"<input type='hidden' name='nodeText' value=''/>" +
				"<input type='hidden' name='isRepeat' value=''/>" +
			"</form>" +
		"</div>"; 
		// 获取
		var dlg = $.dialog({
			content:content,
			title:'接收上报盘 - 选择上报盘文件',
			okVal:"确定",
			cancelVal:"取消",
    	    fixed:true,
    	    resize: false,
			cancel:true,
			ok:function(){
				// 检测两个个文件是否已经选择
				if(!$("[name='dj3yn']").val() || !$("[name='dj3fyn']").val()) {
					$.dialog.notice({icon:'error',content:"请按照上报盘的系统规则，选择一个正规的上报盘文件再进行此操作！", time:2});
					return false;
				}
				var treeId = curSelectedNode.id;
		    	// 拼接节点名
//		    	var nodeText = getNodeTextByNode(curSelectedNode);
		    	var nodeText = $('#esyrright').attr('curNodeFullName');
		    	$("[name='treeId']").val(treeId);
		    	$("[name='nodeText']").val(nodeText);
		    	// check 上报盘中填报单位的值要与选择接收节点的名称一致
				$.ajax({
					async : false,
					url:$.appClient.generateUrl({ESYearlyReport:'checkBeforeAcceptReportedPlate'},'x'),
					success:function(url){
						$('#importXml').ajaxSubmit({
							url:url,
							dataType:"text",
							success:function(data){
								var obj = eval('(' + data + ')');
								if(obj && obj.success=='true'){
									// 检测成功，接收上报盘
									acceptReportedPlate(false,dlg);
								} else if (obj.repeatMsg) {
									$.dialog({
										content:obj.repeatMsg,
										title:'操作提示',
										okVal:"确定",
										cancelVal:"取消",
							    	    fixed:true,
							    	    resize: false,
										cancel:true,
										ok:function(){
											acceptReportedPlate(true,dlg);
										}
									});
								} else {
							    	$.dialog.notice({title:'操作提示',icon:'warning',content:obj.errorMsg,time:3});
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
		});
	
	}
	
	
//页面初始化的加载
window.onload = function (){
	
	setTimeout(_task, 1000);
	
};
