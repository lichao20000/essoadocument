
var formAccredit = {
		queryData: function(){
			var keyword = $.trim($('#roleAccreditQuery').val());
			if(keyword == '' || keyword=='请输入关键字') {
				keyword = '';
			}
			$("#formAccreditDataGrid").flexOptions({query:keyword}).flexReload();
		},
		toAccreditPage: function(tr){
			var columns = ['id',"rolecode","rolename"];
			var colValues = $("#formAccreditDataGrid").flexGetColumnValue(tr,columns);
			var colValuesArray = colValues.split("|");
			var id = colValuesArray[0] ;
			var rolecode = colValuesArray[1] ;
			var rolename = colValuesArray[2] ;
			$("#formAccreditDataGrid").attr("rileId",id);
			$.ajax({
					type:'POST',
			        url : $.appClient.generateUrl({ESFormAccredit : 'accreditPage'},'x'),
				    success:function(data){
					    	$.dialog({
					    		id:'accreditDialog',
						    	title:'表单授权-'+rolename+'['+rolecode+']',
						    	modal:true, //蒙层（弹出会影响页面大小） 
					    	   	fixed:false,
					    	   	stack: true ,
					    	    resize: false,
					    	    lock : true,
								opacity : 0.1,
								padding: '2px',
							    content:data
						    });
				    },
				    cache:false
			});
		}
};