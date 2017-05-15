var _flexme1_width = $(document).width();

var _flexme1_height = $(document).height()-110-88;

//左侧树
var setting = {
			view: {
				dblClickExpand: false,
				showLine: false
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onClick: onClick
			}
		};
         var zNodes =[
       			{ id:1, pId:0, name:"表单类型", open:true},
       			
       			  { id:11, pId:1, name:"档案借阅流程",open:true},
       			    
       			  { id:12, pId:1, name:"档案销毁流程",open:true}
       			  
       		];
		   function onClick(e,treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj("treeDemo");
			zTree.expandNode(treeNode);
		}
		$(document).ready(function(){
			$.fn.zTree.init($("#treeDemo"), setting, zNodes);
		});
		
		//编辑按钮的操作
		$(".editbtn").die().live("click", function(){
			getformdata($(this).closest("tr").prop("id").substr(3));
		});
		//表单内table数据的添加显示
		var uri=$.appClient.generateUrl({ESFormManage:'form_json'});
		$("#flexme1").flexigrid({
		    url:uri,
		    dataType: 'json',
		colModel : [
			{display: '<input type="checkbox" name="ids2">', name : 'id2', width : 80, align: 'center'},
			{display: '操作', name : 'c3', width : 100, sortable : true, align: 'center'},
			{display: '表单名称', name : 'c4', width : 120, sortable : true, align: 'center'},
			{display: '状态', name : 'c5', width : 60, sortable : true, align: 'center'},
			{display: '创建人', name : 'c6', width : 90, sortable : true, align: 'center'},
			{display: '创建时间', name : 'c7', width : 120, sortable : true, align: 'center'},
			{display: '修改人', name : 'c8', width : 90, sortable : true, align: 'center'},
			{display: '修改时间', name : 'c9', width : 120, sortable : true, align: 'center'},
			{display: '版本', name : 'c10', width : 60, sortable : true, align: 'center'},
			{display: '备注', name : 'c11', width : 60, sortable : true, align: 'center'}
			],
		buttons : [
			{name: '添加', bclass: 'add',onpress: addForm},
			{name: '删除', bclass: 'delete',onpress:delform},
			{name: '发布', bclass: 'delete'}
			],
		searchitems : [
			{display: 'ISO', name : 'iso'},
			{display: 'Name', name : 'name', isdefault: true}
			],
		sortname: "c3",
		sortorder: "asc",
		usepager: true,
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		outof: '页 /共',
		width: _flexme1_width,
		height: _flexme1_height,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
		//添加表单
		function addForm()
		{
			var url = $.appClient.generateUrl({ESFormManage:'add'},'x');
			$.ajax({
				url:url,
		    	success:function(data){
		    		$.dialog({
			    		title:'添加表单',
		    			width: '40%',
		    	    	height: '40%',
		    	   		fixed:true,
		    	    	resize: false,
		    	    	okVal:'保存',
					    ok:true,
					    okId:'btnStart',
					    cancelVal: '关闭',
					    cancel: true,
			    		content:data,
			    		ok: function () {
//			    			var form=$('#formId');
//			    			var thisDialog=this;
//			    			var data=form.serialize();
//			    			//alert(data);
//			    			var url=$.appClient.generateUrl({ESFormManage:'saveForm'},'x');
//							$.post(url,{data:data},function(result){
//										if(result){
//											thisDialog.close();
//											$.dialog.notice({width: 150,content: '添加成功',icon: 'face-smile',time: 3});
//											$('#flexme1').flexReload();
//										}else{
//											$.dialog.notice({width: 150,content: '添加失败',icon: 'face-sad',time: 3});
//										}
//							});	
			    			$('#flexme1').flexReload();
			    			return false;
			    		},
			    	});
			    },
			    	cache:false
			});
		}
		//全选按钮
		$("input[name='ids2']").die().live('click',
			function(){
				$("input[name='id2']").attr('checked',$(this).is(':checked'));
			}
		);
		//表单的删除
		function delform(){
			var id='';
			var checkboxObj=$("input[name='id2']:checked");
			if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
			{
				$.dialog.notice({content:'请选择要删除的数据',time:3,icon:'warning'});
				return false;
			}else{
				//遍历选中的表单复选框
				checkboxObj.each(function(i){
					id+=$(this).val()+',';
					});
				}
			id=id.substr(0,id.length-1);
			//alert(id);
			if(id=='' || id==='undefined' || id==0)
			{
				return false;
			}		
			$.dialog({
					content:'确定要删除吗?',
					ok:true,
					okVal:'确定',
					cancel:true,
					cancelVal:'取消',
					ok:function(){
						var url=$.appClient.generateUrl({ESFormManage:'delform'},'x');
						$.get(url,{id:id},function(data){
							//alert(data);return;
							if(data==1){
								$("input[name='ids2']").attr("checked",false);
								$.dialog.notice({width: 150,height:120,icon:'succeed',content:'数据删除成功',time:3,title:'3秒后自动关闭'});
								$('#flexme1').flexOptions({newp: 1}).flexReload();
							}
						});
					}
				});
		}
			

		
	