
var comboMetadata = {
		showMsg: function(msg, type){
			if(type == '1'){
				$.dialog.notice({icon : 'succeed',content : msg,title : '3秒后自动关闭',time : 3});
			} else if(type == '2'){
				$.dialog.notice({icon : 'error',content : msg,title : '3秒后自动关闭',time : 3});
			} else {
				$.dialog.notice({icon : 'warning',content : msg,title : '3秒后自动关闭',time : 3});
			}
		},
		/** 验证表单是否合法 longjunhao 20140801 废弃 **/
		validateComboForm: function (){
			var modelTypeNameObj = $("#metadadaForm input[name='name']") ;
	    	var modelTypeName = modelTypeNameObj.val().trim() ;
	    	if(modelTypeName == ''){
	    		modelTypeNameObj.addClass("warnning") ;
	    		modelTypeNameObj.attr("title","不能为空！");
	    		return false ;
	    	} else {
	    		modelTypeNameObj.attr("title","");
	    	}
	    	return true ;
		},
		/** 验证表单是否合法 longjunhao 20140801 废弃 **/
		validateComboItemForm: function (){
			var nameObj = $("#metadadaitemForm input[name='item']") ;
			var orderObj = $("#metadadaitemForm input[name='order']") ;
			var name = nameObj.val().trim() ;
			var order = orderObj.val().trim() ;
			var flag = true ;
			if(name == ''){
				nameObj.addClass("warnning") ;
				nameObj.attr("title","不能为空！");
				flag =  false ;
			} else {
				nameObj.attr("title","");
			}
			if(order == ''){
				orderObj.addClass("warnning") ;
				orderObj.attr("title","不能为空！");
				flag =  false ;
			} else {
				orderObj.attr("title","");
			}
			return flag ;
		},
		selectCombo: function(){
			var checkboxs = $('#comboMetadataTitleDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var indetifier ;
			checkboxs.each(function(i) {
				var columns = ["indetifier"];
				indetifier = $("#comboMetadataTitleDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
			});
			
			Ext.getCmp('formbuilder_relationComboForEI').contextMenu.node.elConfig.value = indetifier;
			Ext.getCmp('formbuilder_relationComboForEI').contextMenu.node.elConfig.comboRelation = 'true';
			formBuilderManage.showMsg('关联成功！','1');
			art.dialog.list['relationComboMetadataDialog'].close() ;
		},
		addCombo: function(){
			//id,name,description
			var data = "-1,," ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormBuilder : 'addOrEditComboPage'},'x'),
			        data: {data:data},
				    success:function(data){
				    	$.dialog({
				    		id:'addCombDialog',
					    	title:'添加数据字典',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	okVal:'保存',
						    ok:true,
						    cancelVal: '关闭',
						    cancel: true,
						    content:data,
						    ok:function(){
//						    	if(!comboMetadata.validateComboForm())return false ;
						    	if(!$('#metadadaForm').validate())return false ;
						    	var postData = $("#metadadaForm").serialize(); 
						    	$.post( $.appClient.generateUrl({ESFormBuilder : 'saveCombo'}, 'x')
						    			,{data : postData}, function(res){
						    				comboMetadata.showMsg('数据保存成功！','1');
						    				$("#comboMetadataTitleDataGrid").flexReload();
			        			});
						    },
						    init:function(){
				    			var form=$('#metadadaForm');
								form.autovalidate();
				    		}
					    });
				    },
				    cache:false
			});
		},
		editCombo: function(tr){
			var checkboxs = $('#comboMetadataTitleDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var id ;
			var indetifier ;
			var name ;
			var description ;
			checkboxs.each(function(i) {
				var columns = ['id',"indetifier","name","description"];
				var colValues = $("#comboMetadataTitleDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				id = colValuesArray[0] ;
				indetifier = colValuesArray[1] ;
				name = colValuesArray[2] ;
				description = colValuesArray[3] ;
			});
			if(indetifier == "COMBO_TYPE_USER" || indetifier == "COMBO_TYPE_ORGAN"){
				formBuilderManage.showMsg('系统内置字典不能进行此操作！','3') ;
				return;
			}
			//id,name,description
			var data = id+","+name+","+description ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormBuilder : 'addOrEditComboPage'},'x'),
			        data: {data:data},
				    success:function(data){
					    	$.dialog({
					    		id:'editCombDialog',
						    	title:'编辑数据字典',
						    	modal:true, //蒙层（弹出会影响页面大小） 
					    	   	fixed:false,
					    	   	stack: true ,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
						    	okVal:'保存',
							    ok:true,
							    cancelVal: '关闭',
							    cancel: true,
							    content:data,
							    ok:function(){
//							    	if(!comboMetadata.validateComboForm())return false ;
							    	if(!$('#metadadaForm').validate())return false ;
							    	var postData = $("#metadadaForm").serialize(); 
							    	$.post( $.appClient.generateUrl({ESFormBuilder : 'saveCombo'}, 'x')
							    			,{data : postData}, function(res){
							    				comboMetadata.showMsg('数据修改成功！','1');
							    				$("#comboMetadataTitleDataGrid").flexReload();
				        			});
							    },
							    init:function(){
					    			var form=$('#metadadaForm');
									form.autovalidate();
					    		}
						    });
				    },
				    cache:false
			});
		},
		deleteCombo: function(){
			var checkboxs = $('#comboMetadataTitleDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			}
			var id ;
			var indetifier ;
			var name;
			var type;
			checkboxs.each(function(i) {
				var columns = ['id',"indetifier","name","type"];
				var colValues = $("#comboMetadataTitleDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				id = colValuesArray[0] ;
				indetifier = colValuesArray[1] ;
				name = colValuesArray[2] ;
				type = colValuesArray[3] ;
			});
			if(indetifier == "COMBO_TYPE_USER" || indetifier == "COMBO_TYPE_ORGAN"){
				formBuilderManage.showMsg('系统内置字典不能进行此操作！','3') ;
				return;
			}
			$.dialog({
				content : '您确定要删除吗？',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESFormBuilder : 'deleteCombo'}, 'x')
							,{id : id,indetifier : indetifier,name : name,type : type}, function(res){
								if(res == 'true'){
									comboMetadata.showMsg('删除数据成功！','1');
									$("#comboMetadataTitleDataGrid").flexReload();
								}else{
									comboMetadata.showMsg(res,'3');
									$("#comboMetadataTitleDataGrid").flexReload();
								}
							});
				}
			});
		},
		addComboItem: function(){
			var checkboxs = $('#comboMetadataTitleDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先在上面的表格中选择一个数据字典数据后，再进行此操作！','3') ;
				return;
			}
			var id ;
			var indetifier;
			checkboxs.each(function(i) {
				id = $(this).val() ;
				var columns = ["indetifier"];
				indetifier = $("#comboMetadataTitleDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
			});
			if(indetifier == "COMBO_TYPE_USER" || indetifier == "COMBO_TYPE_ORGAN"){
				formBuilderManage.showMsg('系统内置字典不能进行此操作！','3') ;
				return;
			}
			//comboid,id,item,order
			var data = id+",-1,," ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormBuilder : 'addOrEditComboItemPage'},'x'),
			        data: {data:data},
				    success:function(data){
				    	$.dialog({
				    		id:'addComboItemDialog',
					    	title:'添加数据字典可选项',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	okVal:'保存',
						    ok:true,
						    cancelVal: '关闭',
						    cancel: true,
						    content:data,
						    ok:function(){
//						    	if(!comboMetadata.validateComboItemForm())return false ;
						    	if(!$('#metadadaitemForm').validate())return false ;
						    	var postData = $("#metadadaitemForm").serialize(); 
						    	$.post( $.appClient.generateUrl({ESFormBuilder : 'saveComboItem'}, 'x')
						    			,{data : postData}, function(res){
						    				comboMetadata.showMsg('数据保存成功！','1');
						    				$("#comboMetadataDataGrid").flexReload();
			        			});
						    },
						    init:function(){
				    			var form=$('#metadadaitemForm');
								form.autovalidate();
				    		}
					    });
				    },
				    cache:false
			});
		},
		editComboItem: function(tr){
			var checkboxs = $('#comboMetadataTitleDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先在上面的表格中选择一个数据字典数据后，再进行此操作！','3') ;
				return;
			}
			var comboid ;
			var indetifier;
			checkboxs.each(function(i) {
				comboid = $(this).val() ;
				var columns = ["indetifier"];
				indetifier = $("#comboMetadataTitleDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
			});
			if(indetifier == "COMBO_TYPE_USER" || indetifier == "COMBO_TYPE_ORGAN"){
				formBuilderManage.showMsg('系统内置字典不能进行此操作！','3') ;
				return;
			}
			
			var checkboxs = $('#comboMetadataDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择一条数据，再进行此操作！','3') ;
				return;
			} else if(checkboxlength > 1){
				formBuilderManage.showMsg('只能选择一条数据，再进行此操作！','3') ;
				return;
			}
			
			var id ;
			var item ;
			var order ;
			checkboxs.each(function(i) {
				var columns = ["item","order"];
				var colValues = $("#comboMetadataDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
				var colValuesArray = colValues.split("|");
				id = $(this).val() ;
				item = colValuesArray[0] ;
				order = colValuesArray[1] ;
			});
			
			//comboid,id,item,order
			var data = comboid+","+id+","+item+","+order ;
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormBuilder : 'addOrEditComboItemPage'},'x'),
			        data: {data:data},
				    success:function(data){
				    	$.dialog({
				    		id:'addComboItemDialog',
					    	title:'编辑数据字典可选项',
					    	modal:true, //蒙层（弹出会影响页面大小） 
				    	   	fixed:false,
				    	   	stack: true ,
				    	    resize: false,
				    	    lock : true,
							opacity : 0.1,
					    	okVal:'保存',
						    ok:true,
						    cancelVal: '关闭',
						    cancel: true,
						    content:data,
						    ok:function(){
//						    	if(!comboMetadata.validateComboItemForm())return false ;
						    	if(!$('#metadadaitemForm').validate())return false ;
						    	var postData = $("#metadadaitemForm").serialize(); 
						    	$.post( $.appClient.generateUrl({ESFormBuilder : 'saveComboItem'}, 'x')
						    			,{data : postData}, function(res){
						    				comboMetadata.showMsg('数据保存成功！','1');
						    				$("#comboMetadataDataGrid").flexReload();
			        			});
						    },
						    init:function(){
				    			var form=$('#metadadaitemForm');
								form.autovalidate();
				    		}
					    });
				    },
				    cache:false
			});
		},
		deleteComboItems:function(){
			var checkboxs = $('#comboMetadataTitleDataGrid input:checked') ;
			var checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先在上面的表格中选择一个数据字典数据后，再进行此操作！','3') ;
				return;
			}
			var indetifier ;
			checkboxs.each(function() {
				var columns = ["indetifier"];
				indetifier = $("#comboMetadataTitleDataGrid").flexGetColumnValue($(this).closest("tr"),columns);
			});
			if(indetifier == "COMBO_TYPE_USER" || indetifier == "COMBO_TYPE_ORGAN"){
				formBuilderManage.showMsg('系统内置字典不能进行此操作！','3') ;
				return;
			}
			
			checkboxs = $('#comboMetadataDataGrid input:checked') ;
			checkboxlength = checkboxs.length;
			if (checkboxlength == 0) {
				formBuilderManage.showMsg('请先选择待删除数据，再进行此操作！','3') ;
				return;
			}
			var ids = '';
			checkboxs.each(function() {
				ids += ','+$(this).val() ;
			});
			ids = ids.substring(1, ids.length);
			$.dialog({
				content : '您确定要删除吗？',
				okVal : '确定',
				ok : true,
				cancelVal : '关闭',
				cancel : true,
				ok : function() {
					$.post( $.appClient.generateUrl({ESFormBuilder : 'deleteComboItems'}, 'x')
							,{ids : ids}, function(res){
								comboMetadata.showMsg('删除数据成功！','1');
								$("#comboMetadataDataGrid").flexReload();
							});
				}
			});
		},
		queryComboMetadaTitleList: function(){
			var keyword = $.trim($('#comboMetadataTitleQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#comboMetadataTitleDataGrid").flexOptions({query:keyword}).flexReload();
			return false;
		}
}