(function (window){
	
	var getId = function ( elementId ){
		
		return document.getElementById( elementId );
		
	};
	
	window._initSize = function (){
		var width = document.documentElement.clientWidth*0.96,height = document.documentElement.clientHeight-115;
		var winH = $(document).height();
		var usingModel = getId('usingModel');
		var setUsingModel = getId('setUsingModel');
		var rolegridDiv = $("#rolegrid");
		usingModel.style.width  = width+"px";
		usingModel.style.height  = "48px";
		setUsingModel.style.width  = width+"px";
		setUsingModel.style.height  = (height-30)+"px";
		rolegridDiv.css("height",winH-190);
		$('#setUsingModel').css('margin','0px');
		window._size = {tbl: {width: width, height:height-312}, rule: {width: width, height:height-155}};
	};
	
})(window);
_initSize();
var _initValue={
		dataLendDay:0,
		dataLendCount:0
}
var initRole= {
		saveRole:function(){
			var reg=/^[1-9]\d*$/;
			if(!reg.test($('#lendCount').val())){
				$("#lendCount").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
				return false;
			}else{
				$("#lendCount").removeClass("invalid-text").attr("title","");
			}
			if(!reg.test($('#lendDay').val())){
				$("#lendDay").addClass("invalid-text").attr("title","此项不能为空且只能输入大于零的数字");
				return false;
			}else{
				$("#lendDay").removeClass("invalid-text").attr("title","");
			}
			var roleId = initRole.roleId ;
			var lendCount = $("#lendCount").val();
			var lendDay = $('#lendDay').val();
			$.post(
					$.appClient.generateUrl({ESArchiveUsingModel:'saveRoleLend'},'x'),
					{ roleId:roleId,lendCount:lendCount,lendDay:lendDay},
					function(SUCCESS){
						if(SUCCESS=='true'){
							$.dialog.notice({
								icon : 'succeed',
								content :  '保存成功！',
								time :2,
								lock:false
							});
							_initValue.dataLendDay = $('#lendDay').val();
						}else{
							$.dialog.notice({
								icon : 'error',
								content : '保存失败！',
								time : 2,
								lock:false
							});
						}
						$("#threeTable").flexReload();
				    }
				);
		},
		addLend :function(){
			if($("#threeTable").find("tr:last").find("td[colname='order']").find("div").html()!=null){
				var id = $("#threeTable").find("tr:last").find("td[colname='order']").find("div").html();
				$("#threeTable").flexExtendData([{
					'id':++id,
					'cell':{'order':id,
							'lendNumber':'第'+id+'续借',
							'lendCount':'1'
						   }
				}]);
			}else{
				$("#threeTable").flexExtendData([{
					'id':1,
					'cell':{'order':1,
							'RELENDCOUNTID':'',
							'lendNumber':'第'+1+'续借',
							'lendCount':'1'
						   }
				}]);
			}
		},
		deleteLend:function(){
			if($("#threeTable").find("tr:last").find("td[colname='order']").find("div").html()==null){
				$.dialog.notice({
					icon : 'error',
					content :  '没有续借次数，不能删除',
					time :2,
					lock:false
				});
				return false;
			}
			$.post(
					$.appClient.generateUrl({ESArchiveUsingModel:'deleteRelendMax'},'x'),
					{ roleId:initRole.roleId},
					function (SUCCESS){
						if(SUCCESS){
							$('#threeTable').flexReload();
							$.dialog.notice({
								icon : 'succeed',
								content :  '删除成功！',
								time :2,
								lock:false
							});
						}else{
							$.dialog.notice({
								content:'删除失败！',
								icon:'error',
								time:2
							});
						}
					}
				);
		},
		saveLend:function(){
			var saveTrObj = $('#threeTable tr[datastate="new"],#threeTable tr[datastate="modify"]');
			if(!saveTrObj.length){
				$.dialog.notice({
					title:'',
					content:'请添加新数据',
					icon:'warning',
					time:2
				});
				return;
			}
			
			var datas = []; // [{},...]
			saveTrObj.each(function (){
				var data = {};
					data.RELENDCOUNTID = $(this).find('td[colname="RELENDCOUNTID"]').text().trim();
					data.lendCount = $(this).find('td[colname="lendCount"]').text();
					data.lendNumber = $(this).find('td[colname="lendNumber"]').text();
					datas.push(data);
			});
			
			
			$.post(
				$.appClient.generateUrl({ESArchiveUsingModel:'saveLendCount'},'x'),
				{ datas:datas,roleId:initRole.roleId},
				function (is_ok){
					if(is_ok.SUCCESS){
						$('#threeTable').flexReload();
						$.dialog.notice({
							icon : 'succeed',
							content :  '保存成功！',
							time :2,
							lock:false
						});
					}else{
						$.dialog.notice({
							content:is_ok.MESSAGE,
							icon:'error',
							time:2
						});
					}
				},
				'json'
			);
		},
		moveCommonToVip:function (){
			//点击选择的时候是否保存借阅天数
			if(_initValue.dataLendDay==undefined){
				$.dialog.notice({
					icon : 'error',
					content : '请保存借阅天数和借阅件数！',
					time : 2,
					lock:false
				});
				return false;
			}
			var id='';
			var checkboxObj=$("input[name='commUser']:checked");
			if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择数据',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					id+=$(this).val()+',';
					});
				}
			id = id.substr(0,id.length-1);
			
			if(id=='' || id==='undefined' || id==0)
			{
				return false;
			}		
			$.post(
					$.appClient.generateUrl({ESArchiveUsingModel:'removeCommonUserToVip'},'x'),
					{ roleId:initRole.roleId,userId:id},
					function (SUCCESS){
						if(SUCCESS){
							$('#twoTable').flexReload();
							$('#fourTable').flexReload();
						}
					},
					'json'
				);
		},
		moverVipToCommon:function (){
			var id='';
			var checkboxObj=$("input[name='vipUser']:checked");
			if(checkboxObj.length =='0' || checkboxObj.length==='undefined')
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择数据',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					id+=$(this).val().split('|')[0]+',';
					});
				}
			id = id.substr(0,id.length-1);
			
			if(id=='' || id==='undefined' || id==0)
			{
				return false;
			}		
			$.post(
					$.appClient.generateUrl({ESArchiveUsingModel:'moveVipToCommon'},'x'),
					{ roleId:initRole.roleId,userId:id},
					function (SUCCESS){
						if(SUCCESS){
							$('#twoTable').flexReload();
							$('#fourTable').flexReload();
						}
					},
					'json'
				);
		},
		editVipUser:function(){
			var id='';
			var userName = '';
			var dep ='';
			var checkboxObj=$("input[name='vipUser']:checked");
			if(checkboxObj.length !=1)
			{
				
				$.dialog.notice({content:'请选择一条数据',time:3,icon:'error'});
				return false;
			}else{
				checkboxObj.each(function(i){
					id=$(this).val().split('|')[0];
					userName=$(this).val().split('|')[1];
					dep=$(this).val().split('|')[2];
					});
				}
			var url = $.appClient.generateUrl({ESArchiveUsingModel:'editVipUser'},'x');
			$.ajax({
				type: 'POST',
			    url:url,
			    data:{userId:id,roleId:initRole.roleId,userName:userName,dep:dep},
			    success:function(data){
			    	diac = $.dialog({
			    		id:'name2',
				    	title:'编辑',
				    	width: 500,
				    	padding:2,
			    	    height: $('#oneForm').height()*2+30,
			    	   	fixed:true,
			    	    resize: false,
				    	content:data
				    });
				    },
				    cache:false
			});	
		},
		roleId:''
}
function trim(str){   
    return str.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'');   
} 
function queryFourTable(){
	var keyWord = $('#queryFourWord').val();
	if(keyWord=='请输入关键字'|| trim(keyWord)==''){
		$("#fourTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getVipUser',roleId:initRole.roleId},'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#fourTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getVipUser',roleId:initRole.roleId},'x'),query:{keyWord:trim(keyWord)},newp:1}).flexReload();

}
function queryTwoTable(){
	var keyWord = $('#queryTwoWord').val();
	if(keyWord=='请输入关键字' ){
		$("#twoTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getCommonUser',roleId:initRole.roleId},'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#twoTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getCommonUser',roleId:initRole.roleId},'x'),query:{keyWord:trim(keyWord)},newp:1}).flexReload();
}
function queryRoleTableTable(){
	var keyWord = $('#queryRoleTableWord').val();
	if(keyWord=='请输入关键字' ){
		$("#roleTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel : 'getRoleData'}, 'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#roleTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel : 'getRoleData'}, 'x'),query:{keyWord:trim(keyWord)},newp:1}).flexReload();
}
function queryMetadataTable(){
	var keyWord = $('#queryMetadataKeyword').val();
	if(keyWord=='请输入关键字' ){
		$("#metadata_tbl").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'meta_json'},'x'),query:{keyWord:''},newp:1}).flexReload();
		return false;
	}
	$("#metadata_tbl").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'meta_json'},'x'),query:{keyWord:trim(keyWord)},newp:1}).flexReload();

}
function displayModel(t)	// 1
{
	$('.models').hide();
	$('#model'+t).show();
	$('#subnav li').removeClass('defalutTagOpen');
	$('#subnav li:eq('+(t-1)+')').addClass('defalutTagOpen');
	if(t==2){
		$("#tempUserTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getTempUsers'},'x')}).flexReload();
	}
}

displayModel(1);
function Role_Grid(){
	$("#roleTable").flexigrid({
		url : $.appClient.generateUrl({ESArchiveUsingModel : 'getRoleData'}, 'x'),
		dataType : 'json',
		editable : true,
		colModel : [
				{display:'', name:'radio', width:24, align:'center'},
				{display:'角色描述', name:'roleRemark',  width:150, align:'center',metadata:'roleRemark'},
				{display:'角色名称', name:'roleName',  width:150, align:'center',metadata:'roleName'},
				{display:'id', name:'id',  width:150, align:'center',hide:true,metadata:'id'},
				{display:'roleCode', name:'roleCode',  width:150, align:'center',hide:true,metadata:'roleCode'}
		],
		buttons:[],
		usepager : true,
		useRp : true,
		resizable : false,
		width : 250,
		height : _size.tbl.height+129,
		rp : 20,
		nomsg : "没有数据",
		pagetext : '第',
		outof : '页 /共',
		procmsg : '刷新中，请稍等...',
		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条',
		onSuccess:function(){
				var roleRemark = $("#roleTable").find("tr:first").find("td[colname='roleRemark']").find("div").html();
				var roleName = $("#roleTable").find("tr:first").find("td[colname='roleName']").find("div").html();
				var id = $("#roleTable").find("tr:first").find("td[colname='id']").find("div").html();
				if(roleRemark!=null){
					$("input[name='roleName']").val(roleRemark);
					$("#roleDesc").text(roleName);
					initRole.roleId = id;
					$.post(
						$.appClient.generateUrl({ESArchiveUsingModel:'getRoleLend'},'x'),
						{ roleId:initRole.roleId},
						function (data){
							_initValue.dataLendDay = data.lendDay;
							_initValue.dataLendCount = data.lendCount;
							$("#lendDay").val(data.lendDay);
							$("#lendCount").val(data.lendCount);
						},
						'json'
						);
					$("#threeTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getLendData',roleId:id},'x')}).flexReload();
					$("#twoTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getCommonUser',roleId:initRole.roleId},'x')}).flexReload();
					$("#fourTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getVipUser',roleId:initRole.roleId},'x')}).flexReload();
				}
		}
	});
	$("#roleTable tr").live('click',function(){
		$(this).find('div input').change();
		$(this).find('div input').attr('checked',true);
	});
	$('#theBigGrid').width((_size.tbl.width-255)+"px").height(_size.tbl.height+273);
	$('#oneForm').width("375px").css({'margin-right':'5px'});
	$('#threetGrid').width((_size.tbl.width-755)+"px").height($('#oneForm').height()+5);
	$('#twoGrid').width("377px").height($('#theBigGrid').height()- $('#oneForm').height()+5).css({'margin-right':'5px'});
	$('#fourGrid').width((_size.tbl.width-760)+"px").height($('#theBigGrid').height()- $('#oneForm').height()-44);
	$("#threeTable").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
				{display:'', name:'order',  width:20, align:'center',hide:true},
				{display:'续借次数', name:'lendNumber',  width:150, align:'center'},
				{display:'续借天数', name:'lendCount',editable : true,  width:150, align:'center'},
				{display:'RELENDCOUNTID', name:'RELENDCOUNTID',  width:20, align:'center',hide:true}
		],
		buttons:[
		         {name : '增加一次续借', bclass : 'add', onpress :initRole.addLend },  
		         {name : '减少一次续借', bclass : 'delete', onpress : initRole.deleteLend}, 
		         {name : '保存', bclass : 'save', onpress : initRole.saveLend}  
		         ],
		 		resizable : false,
		 		width : $('#theBigGrid').width()-$('#oneForm').width(),
		 		height : $('#oneForm').height()-113,
		 		 usepager : true,
			 		useRp : true,
			 		rp : 20,
			 		nomsg : "没有数据",
			 		pagetext : '第',
			 		outof : '页 /共',
			 		procmsg : '刷新中，请稍等...',
			 		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	$("#twoTable").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
		        {display:'<input type="checkbox" name="commUserList" >', name:'cbox', width:24, align:'center'},
				{display:'userId', name:'id',  width:120, align:'center',hide:true},
				{display:'序号', name:'seqid',  width:30, align:'center'},
				{display:'姓名', name:'userName',  width:120, align:'center',hide:true},
				 {display:'姓名', name:'displayName',  width:120, align:'center'},
				{display:'机构单位', name:'userOrg',  width:120, align:'center'},
				{display:'续借次数', name:'lendCount',  width:100, align:'center'},
				{display:'操作', name:'edit',  width:55, align:'center'}
		],
		 buttons:[
		          {name : '选择', bclass : 'export', onpress : initRole.moveCommonToVip}  
                  ],
		         usepager : true,
			 		useRp : true,
			 		resizable : false,
			 		width : $('#twoGrid').width(),
			 		height : $('#twoGrid').height()-160 ,
			 		rp : 20,
			 		nomsg : "没有数据",
			 		pagetext : '第',
			 		outof : '页 /共',
			 		procmsg : '刷新中，请稍等...',
			 		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条'
	});
	$("#fourTable").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
		            {display:'<input type="checkbox" name="vipUserList" >', name:'cbox', width:24, align:'center'},
		            {display:'userId', name:'id',  width:120, align:'center',hide:true},
		            {display:'操作', name:'edit',  width:55, align:'center'},
		            {display:'姓名', name:'userName',  width:120, align:'center',hide:true},
		            {display:'姓名', name:'displayName',  width:120, align:'center'},
		            {display:'机构单位', name:'userOrg',  width:120, align:'center'},
		            {display:'借出天数', name:'lendDay',  width:100, align:'center'}
		            ],
		            buttons:[
		                     {name : '选择', bclass : 'back', onpress : initRole.moverVipToCommon},
		                     {name : '编辑', bclass : 'all', onpress : initRole.editVipUser}  
		                     ],
		                     singleSelect:true,
		             		usepager : true,
		             		title : '工作流管理',
		             		useRp : true,
		             		rp : 20,
		             		nomsg : "没有数据",
		             		showTableToggleBtn : false,
		             		pagetext : '第',
		             		outof : '页 /共',
		             		width :  $('#theBigGrid').width()-$('#oneForm').width()-5,
		             		height : $('#twoGrid').height()-161,
		             		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
}
var initTempUser = {
		addTempUser:function(){
			var url = $.appClient.generateUrl({ESArchiveUsingModel:'addTempUser'},'x');
			$.ajax({
			    url:url,
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'addTempUser',
				    	title:'添加用户',
				    	fixed:false,
			    	    resize: true,
			    	    okVal:'确定',
			    		cancelVal:'取消',
			    		cancel:true,
			    		width: "250px",
			    	    height: "200px",
			    		ok:function (){
			    			
			    				if($("#userName").val() == null || trim($("#userName").val())==''){
			    					$("#userName").addClass("invalid-text").attr("title","此项不能为空");
			    					return false;
			    				}else{
			    					$("#userName").removeClass("invalid-text").attr("title","");
			    				}
			    		
			    				if($("#dep").val() == null || trim($("#dep").val())==''){
			    					$("#dep").addClass("invalid-text").attr("title","此项不能为空");
			    					return false;
			    				}else{
			    					$("#dep").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				var reg=/^((\d{18})|(\d{17}[X])|(\d{17}[x]))*$/;
			    				if((!reg.test($("#identity").val()))){
			    					$("#identity").addClass("invalid-text").attr("title","请输入合法的身份证号");
			    					return false;
			    				}else if($("#identity").val() == null || trim($("#identity").val())==''){
			    					$("#identity").addClass("invalid-text").attr("title","此项不能为空");	
			    					return false;
			    				}else{
			    					$("#identity").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
			    				if((!regTel.test($("#phone").val()))){
			    					$("#phone").addClass("invalid-text").attr("title","请输入合法的电话号码");
			    					return false;
			    				}else if($("#phone").val() == null || trim($("#phone").val())==''){
			    					$("#phone").addClass("invalid-text").attr("title","此项不能为空");	
			    					return false;
			    				}else{
			    					$("#phone").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				reg=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
			    				if((!reg.test($("#email").val()))){
			    					$("#email").addClass("invalid-text").attr("title","请输入合法的邮箱");
			    					return false;
			    				}else if($("#email").val() == null || trim($("#email").val())==''){
			    					$("#email").addClass("invalid-text").attr("title","此项不能为空");	
			    					return false;
			    				}else{
			    					$("#email").removeClass("invalid-text").attr("title","");
			    				}
			    				var userName = $("#userName").val();
			    				var identity = $("#identity").val();
			    				var dep = $("#dep").val();
			    				var phone = $("#phone").val(); 
			    				var email = $("#email").val();
			    				$.post(
			    						$.appClient.generateUrl({ESArchiveUsingModel:'checkTempUserIdLive'},'x'),
			    						{userName:$("#userName").val(),identity:$("#identity").val()},
			    						function(success){
			    							if(success > 0){
			    								$.dialog.notice({
			    									icon : 'error',
			    									content :  '用户名重复！',
			    									time :2,
			    									lock:false
			    								});
			    								return false;
			    							}else{
			    								$.post(
			    			    						$.appClient.generateUrl({ESArchiveUsingModel:'saveTempUser'},'x'),
			    			    						{userName:userName,dep:dep,identity:identity,phone:phone,email:email},
			    			    						function (SUCCESS){
			    			    							if(SUCCESS){
			    			    								$.dialog.notice({
			    			    									icon : 'succeed',
			    			    									content :  '保存成功',
			    			    									time :2,
			    			    									lock:false
			    			    								});
			    			    							}else{
			    			    								$.dialog.notice({
			    			    									content:"保存失败！",
			    			    									icon:'error',
			    			    									time:2
			    			    								});
			    			    							}
			    			    							$("#tempUserTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getTempUsers'},'x')}).flexReload();
			    			    						}
			    			    					);
			    							}
			    						}
			    				);
			    				
			    		},
					    content:data
				    });
				    },
				    cache:false
			});
		},
		editTempUser:function(input){
			var id='';
			var userName = '';
			var dep ='';
			var identity ='';
			var phone ='';
			var email ='';
			var checkboxObj= "";
			if(input!='编辑'){
				checkboxObj = input;
			}else{
				checkboxObj=$("input[name='tempUser']:checked");
			}
			if(checkboxObj.length !=1)
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择一条数据',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					id=$(this).val().split('|')[0];
					userName=$(this).val().split('|')[1];
					dep=$(this).val().split('|')[2];
					identity=$(this).val().split('|')[3];
					phone=$(this).val().split('|')[4];
					email=$(this).val().split('|')[5];
					
					});
				}
			if(id=='' || id==='undefined' || id==0)
			{
				return false;
			}		
			
			$.ajax({
				type:'POST',
			    url:$.appClient.generateUrl({ESArchiveUsingModel:'editTempUser'},'x'),
			    data:{ id:id,userName:userName,dep:dep,identity:identity,phone:phone,email:email},
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'saveTempUser',
				    	title:'编辑用户',
				    	fixed:false,
			    	    resize: true,
			    	    okVal:'确定',
			    		cancelVal:'取消',
			    		cancel:true,
			    		width: "250px",
			    	    height: "200px",
			    		ok:function (){
			    			
			    				if($("#userName").val() == null || trim($("#userName").val())==''){
			    					$("#userName").addClass("invalid-text").attr("title","此项不能为空");
			    					return false;
			    				}else{
			    					$("#userName").removeClass("invalid-text").attr("title","");
			    				}
			    		
			    				if($("#dep").val() == null || trim($("#dep").val())==''){
			    					$("#dep").addClass("invalid-text").attr("title","此项不能为空");
			    					return false;
			    				}else{
			    					$("#dep").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				var reg=/^((\d{18})|(\d{17}[X])|(\d{17}[x]))*$/;
			    				if((!reg.test($("#identity").val()))){
			    					$("#identity").addClass("invalid-text").attr("title","请输入合法的身份证号");
			    					return false;
			    				}else if($("#identity").val() == null || trim($("#identity").val())==''){
			    					$("#identity").addClass("invalid-text").attr("title","此项不能为空");	
			    					return false;
			    				}else{
			    					$("#identity").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				var regTel=/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})$))$/g;
			    				if((!regTel.test($("#phone").val()))){
			    					$("#phone").addClass("invalid-text").attr("title","请输入合法的电话号码");
			    					return false;
			    				}else if($("#phone").val() == null || trim($("#phone").val())==''){
			    					$("#phone").addClass("invalid-text").attr("title","此项不能为空");	
			    					return false;
			    				}else{
			    					$("#phone").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				reg=/^[\w]+([-.][\w]+)*@[\w]+([-.]\w+)*\.[\w]+(\.[\w]+)?$/;
			    				if((!reg.test($("#email").val()))){
			    					$("#email").addClass("invalid-text").attr("title","请输入合法的邮箱");
			    					return false;
			    				}else if($("#email").val() == null || trim($("#email").val())==''){
			    					$("#email").addClass("invalid-text").attr("title","此项不能为空");	
			    					return false;
			    				}else{
			    					$("#email").removeClass("invalid-text").attr("title","");
			    				}
			    				
			    				$.post(
			    						$.appClient.generateUrl({ESArchiveUsingModel:'saveTempUser'},'x'),
			    						{id:id,userName:$("#userName").val(),dep: $("#dep").val(),identity:$("#identity").val(),phone:$("#phone").val(),email:$("#email").val()},
			    						function (SUCCESS){
			    							if(SUCCESS){
			    								$.dialog.notice({
			    									icon : 'succeed',
			    									content :  '保存成功',
			    									time :2,
			    									lock:false
			    								});
			    							}else{
			    								$.dialog.notice({
			    									content:"保存失败！",
			    									icon:'error',
			    									time:2
			    								});
			    							}
			    							$("#tempUserTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getTempUsers'},'x')}).flexReload();
			    						}
			    					);
			    		},
					    content:data
				    });
				    },
				    cache:false
			});
			
		},
		deleteTampUser:function(){
			var id='';
			var checkboxObj=$("input[name='tempUser']:checked");
			if(checkboxObj.length <1)
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择数据',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					id+=$(this).val().split('|')[0]+',';
					});
				}
			
			if(id=='' || id==='undefined' || id==0)
			{
				return false;
			}	
			id = id.substr(0,id.length-1);
			$.post(
					$.appClient.generateUrl({ESArchiveUsingModel:'deleteTampUsers'},'x'),
					{ id:id},
					function (SUCCESS){
						if(SUCCESS){
							$.dialog.notice({
								icon : 'succeed',
								content :  '保存成功',
								time :2,
								lock:false
							});
						}else{
							$.dialog.notice({
								content:"保存失败！",
								icon:'error',
								time:2
							});
						}
						$("#tempUserTable").flexReload();
					
					}
				);
		},
		queryTempUser:function(){
			var keyWord = $('#queryTempWord').val();
			if(keyWord=='请输入关键字'|| trim(keyWord)==''){
				$("#tempUserTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getTempUsers'},'x'),query:{keyWord:''}}).flexReload();
			}else{
				$("#tempUserTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getTempUsers'},'x'),query:{keyWord:trim(keyWord)}}).flexReload();
			}
		}
}
var initUsing= {
		addForm : function (){
			initUsing.metaDataId = 0;
			$.ajax({
				type:'POST',
			    url:$.appClient.generateUrl({ESArchiveUsingModel:'addField'},'x'),
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'saveTempUser',
				    	title:'添加字段',
				    	fixed:false,
			    	    resize: true,
			    	    okVal:'确定',
			    		cancelVal:'取消',
			    		padding:0,
			    		cancel:true,
			    		width: "250px",
			    	    height: "300px",
			    		ok:function (){
			    			if($("#field").val()==''){
			    					$("#field").addClass("invalid-text").attr("title","此项不能为空");
			    					return false;
			    			}
			    			$("#field").removeClass("invalid-text").attr("title","");
			    			if($("#doLength").hasClass("invalid-text")){
			    				return false;
			    			}
			    			if($("#length").hasClass("invalid-text")){
			    				return false;
			    			}
			    			var length = $("#length").val();
			    			var doLength = $("#doLength").val()==''?0:$("#doLength").val();
			    			var type= $("#type").val();
			    			var field = $("#field").val();
			    			var metaData = $("#metaData").val();
			    			var isNull = $("#isNull").val();
			    			var desc = $("#desc").val();
			    			$.post( 
			    			    $.appClient.generateUrl({ESArchiveUsingModel:'saveField'},'x'),
			    			    {field:field,doLength:doLength,length:length,type:type,metaData:metaData,isNull:isNull,desc:desc,data:'form',metaDataId:initUsing.metaDataId},
			    			    function(data){
			    			    	if(data.success=='true'){
			    			    		$.dialog.notice({
											icon : 'succeed',
											content :  '保存成功',
											time :2,
											lock:false
										});
			    			    	}else{
			    			    		$.dialog.notice({
											icon : 'error',
											content :  data.message,
											time :2,
											lock:false
										});
			    			    	}
			    			    	$("#usingFormTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'form'},'x')}).flexReload();
			    			    	
			    			    }
			    			,'json'
			    			);
			    		},
			    		content:data
			    		});
			    },
			 cache:false
			});
			
		},
		editForm :function(input){
			initUsing.metaDataId = 0;
			var checkboxObj= "";
			if(input!='编辑'){
				checkboxObj = input;
			}else{
				checkboxObj=$("input[name='fieldCheckform']:checked");
			}
			if(checkboxObj.length !=1 )
			{
				
				$.dialog.notice({content:'请选择一条数据，进行编辑！',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					var v = $(this).val();
					if(v.split('|')[1]=='false'){
						$.dialog.notice({content:'这个字段是系统字段，不能修改！',time:3,icon:'warning'});
						return false;
					}
					var id = v.split('|')[0];
					var field = v.split('|')[2];
					var metaData = v.split('|')[4];
					var type = v.split('|')[5];
					var isNull = v.split('|')[6];
					var length = v.split('|')[7];
					var doLength = v.split('|')[8];
					var desc = v.split('|')[9];
					var metaDataId = v.split('|')[10];
					initUsing.metaDataId = metaDataId;
					$.ajax({
						type:'POST',
					    url:$.appClient.generateUrl({ESArchiveUsingModel:'editField'},'x'),
					    data:{id:id,field:field,metaData:metaData,type:type,isNull:isNull,length:length,doLength:doLength,desc:desc,metaDataId:metaDataId},
					    success:function(data){
					    	comdia = $.dialog({
					    		id:'editTempUser',
						    	title:'编辑字段',
						    	fixed:false,
					    	    resize: true,
					    	    okVal:'确定',
					    		cancelVal:'取消',
					    		padding:0,
					    		cancel:true,
					    		width: "250px",
					    	    height: "300px",
					    		ok:function (){
					    			
					    			if($("#field").val()==''){
					    					$("#field").addClass("invalid-text").attr("title","此项不能为空");
					    					return false;
					    			}
					    			$("#field").removeClass("invalid-text").attr("title","");
					    			if($("#doLength").hasClass("invalid-text")){
					    				return false;
					    			}
					    			if($("#length").hasClass("invalid-text")){
					    				return false;
					    			}
					    			var length = $("#length").val();
					    			var type= $("#type").val();
					    			var field = $("#field").val();
					    			var metaData = $("#metaData").val();
					    			var isNull = $("#isNull").val();
					    			var desc = $("#desc").val();
					    			var doLength = $("#doLength").val()==''?0:$("#doLength").val();
					    			$.post( 
					    			    $.appClient.generateUrl({ESArchiveUsingModel:'saveField'},'x'),
					    			    {id:id,field:field,doLength:doLength,length:length,type:type,metaData:metaData,isNull:isNull,desc:desc,data:'form',metaDataId:initUsing.metaDataId},
					    			    function(data){
					    			    	if(data.success=='true'){
					    			    		$.dialog.notice({
													icon : 'succeed',
													content :  '保存成功',
													time :2,
													lock:false
												});
					    			    	}else{
					    			    		$.dialog.notice({
													icon : 'error',
													content :  data.message,
													time :2,
													lock:false
												});
					    			    	}
					    			    	$("#usingFormTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'form'},'x')}).flexReload();
					    			    }
					    			,'json'
					    			);
					    		},
					    		content:data
					    		});
					    },
					 cache:false
					});
					
					
					});
				}
		},
		deleteForm:function(){
			initUsing.metaDataId = 0;
			var checkboxObj=$("input[name='fieldCheckform']:checked");
			if(checkboxObj.length !=1 )
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择一条数据，进行删除！',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					var v = $(this).val();
					if(v.split('|')[1]=='false'){
						$.dialog.notice({content:'这个字段是系统字段，不能删除！',time:3,icon:'warning'});
						return false;
					}else{
						var id = v.split('|')[0];
						$.post( 
			    			    $.appClient.generateUrl({ESArchiveUsingModel:'deleteField'},'x'),
			    			    {id:id,data:'form'},
			    			    function(data){
			    			    	if(data){
			    			    		$.dialog.notice({
											icon : 'succeed',
											content :  '删除成功！',
											time :2,
											lock:false
										});
			    			    	}else{
			    			    		$.dialog.notice({
											icon : 'error',
											content : '删除失败！',
											time :2,
											lock:false
										});
			    			    	}
			    			    	$("#usingFormTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'form'},'x')}).flexReload();
			    			    }
						);
					}
				});
			}
		},	
		addStore : function (){
			initUsing.metaDataId = 0;
			$.ajax({
				type:'POST',
			    url:$.appClient.generateUrl({ESArchiveUsingModel:'addField'},'x'),
			    success:function(data){
			    	comdia = $.dialog({
			    		id:'saveTempUser',
				    	title:'添加字段',
				    	fixed:false,
			    	    resize: true,
			    	    okVal:'确定',
			    		cancelVal:'取消',
			    		cancel:true,
			    		padding:0,
			    		width: "250px",
			    	    height: "300px",
			    		ok:function (){
			    			
			    			if($("#field").val()==''){
			    					$("#field").addClass("invalid-text").attr("title","此项不能为空");
			    					return false;
			    			}
			    			$("#field").removeClass("invalid-text").attr("title","");
			    			if($("#doLength").hasClass("invalid-text")){
			    				return false;
			    			}
			    			if($("#length").hasClass("invalid-text")){
			    				return false;
			    			}
			    			var length = $("#length").val();
			    			var doLength = $("#doLength").val()==''?0:$("#doLength").val();
			    			var type= $("#type").val();
			    			var field = $("#field").val();
			    			var metaData = $("#metaData").val();
			    			var isNull = $("#isNull").val();
			    			var desc = $("#desc").val();
			    			$.post( 
			    			    $.appClient.generateUrl({ESArchiveUsingModel:'saveField'},'x'),
			    			    {field:field,doLength:doLength,length:length,type:type,metaData:metaData,isNull:isNull,desc:desc,data:'store',metaDataId:initUsing.metaDataId},
			    			    function(data){
			    			    	if(data.success=='true'){
			    			    		$.dialog.notice({
											icon : 'succeed',
											content :  '保存成功',
											time :2,
											lock:false
										});
			    			    	}else{
			    			    		$.dialog.notice({
											icon : 'error',
											content :  data.message,
											time :2,
											lock:false
										});
			    			    	}
			    			    	$("#usingStoreTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'store'},'x')}).flexReload();
			    			    }
			    			,'json'
			    			);
			    		},
			    		content:data
			    		});
			    },
			 cache:false
			});
			
		},
		editStore :function(input){
			initUsing.metaDataId = 0;
			var checkboxObj="";
			if(input!='编辑'){
				checkboxObj = input;
			}else{
				checkboxObj=$("input[name='fieldCheckstore']:checked");
			}
			if(checkboxObj.length !=1 )
			{
				$.dialog.notice({content:'请选择一条数据，进行编辑！',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					var v = $(this).val();
					if(v.split('|')[1]=='false'){
						$.dialog.notice({content:'这个字段是系统字段，不能修改！',time:3,icon:'warning'});
						return false;
					}
					var id = v.split('|')[0];
					var field = v.split('|')[2];
					var metaData = v.split('|')[4];
					var type = v.split('|')[5];
					var isNull = v.split('|')[6];
					var length = v.split('|')[7];
					var doLength = v.split('|')[8];
					var desc = v.split('|')[9];
					var metaDataId = v.split('|')[10];
					initUsing.metaDataId = metaDataId;
					$.ajax({
						type:'POST',
					    url:$.appClient.generateUrl({ESArchiveUsingModel:'editField'},'x'),
					    data:{id:id,field:field,metaData:metaData,type:type,isNull:isNull,length:length,doLength:doLength,desc:desc,metaDataId:metaDataId},
					    success:function(data){
					    	comdia = $.dialog({
					    		id:'editTempUser',
						    	title:'编辑字段',
						    	fixed:false,
					    	    resize: true,
					    	    okVal:'确定',
					    		cancelVal:'取消',
					    		cancel:true,
					    		padding:0,
					    		width: "250px",
					    	    height: "300px",
					    		ok:function (){
					    			
					    			if($("#field").val()==''){
					    					$("#field").addClass("invalid-text").attr("title","此项不能为空");
					    					return false;
					    			}
					    			$("#field").removeClass("invalid-text").attr("title","");
					    			if($("#doLength").hasClass("invalid-text")){
					    				return false;
					    			}
					    			if($("#length").hasClass("invalid-text")){
					    				return false;
					    			}
					    			var length = $("#length").val();
					    			var doLength = $("#doLength").val()==''?0:$("#doLength").val();
					    			var type= $("#type").val();
					    			var field = $("#field").val();
					    			var metaData = $("#metaData").val();
					    			var isNull = $("#isNull").val();
					    			var desc = $("#desc").val();
					    			$.post( 
					    			    $.appClient.generateUrl({ESArchiveUsingModel:'saveField'},'x'),
					    			    {id:id,field:field,doLength:doLength,length:length,type:type,metaData:metaData,isNull:isNull,desc:desc,data:'store',metaDataId:initUsing.metaDataId},
					    			    function(data){
					    			    	if(data.success=='true'){
					    			    		$.dialog.notice({
													icon : 'succeed',
													content :  '保存成功',
													time :2,
													lock:false
												});
					    			    	}else{
					    			    		$.dialog.notice({
													icon : 'error',
													content :  data.message,
													time :2,
													lock:false
												});
					    			    	}
					    			    	$("#usingStoreTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'store'},'x')}).flexReload();
					    			    }
					    			,'json'
					    			);
					    		},
					    		content:data
					    		});
					    },
					 cache:false
					});
					
					
					});
				}
		},
		deleteStore:function(){
			initUsing.metaDataId = 0;
			var checkboxObj=$("input[name='fieldCheckstore']:checked");
			if(checkboxObj.length !=1 )
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择一条数据，进行删除！',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					var v = $(this).val();
					if(v.split('|')[1]=='false'){
						//wanghongchen 20141017 修改消息提醒图标
						$.dialog.notice({content:'这个字段是系统字段，不能删除！',time:3,icon:'warning'});
						return false;
					}else{
						var id = v.split('|')[0];
						$.post( 
			    			    $.appClient.generateUrl({ESArchiveUsingModel:'deleteField'},'x'),
			    			    {id:id,data:'store'},
			    			    function(data){
			    			    	if(data){
			    			    		$.dialog.notice({
											icon : 'succeed',
											content :  '删除成功！',
											time :2,
											lock:false
										});
			    			    	}else{
			    			    		$.dialog.notice({
											icon : 'error',
											content : '删除失败！',
											time :2,
											lock:false
										});
			    			    	}
			    			    	$("#usingStoreTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'store'},'x')}).flexReload();
			    			    }
					);
					}
				});
			}
		},
		metaDataId:''
}
function usingStoreGrid(){
	$('#usingStoreGrid').width( (_size.tbl.width)+"px").height(_size.tbl.height+237);
	$("#usingStoreTable").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
				{display : '<input type="checkbox" name="sinputB">', name:'cbox', width:40, align:'center'},
				{display : 'id',	name : 'id',	width : 100,align : 'center',hide:true},
				{display : 'METADATAID',	name : 'METADATAID',	width : 100,align : 'center',hide:true},
				{display : '字段名',	name : 'ESIDENTIFIER',	width : 100,align : 'center'},
				{display : '元数据',	name : 'METADATA',width : 200,align : 'center'},
				{display : '类型',name : 'ESTYPE',width : 60,align : 'center' },
				{display : '是否为必填项',name : 'ESISNULL', width : 50, align : 'center'},
				{display : '字段长度', name : 'ESLENGTH', width:80, validate:/^\d{1,5}$/i,  validateMsg:"必须为数字",align :'center'},
				{display : '小数点位数', name : 'ESDOTLENGTH',  width : 80, validate:/^\d+$/i, validateMsg:"必须为数字",align :'center'},
				{display : '描述', name : 'ESDESCRIPTION', width : 150, align : 'center'},
				{display : '系统字段', name : 'system', width : 150, align : 'center'}
		            ],
		            buttons:[
		                     {name : '添加', bclass : 'add', onpress : initUsing.addStore},
		                     {name : '编辑', bclass : 'all', onpress : initUsing.editStore},  
		                     {name : '删除', bclass : 'delete', onpress : initUsing.deleteStore}  
		                     ],
		                     singleSelect:true,
		             		usepager : true,
		             		title : '工作流管理',
		             		useRp : true,
		             		rp : 20,
		             		nomsg : "没有数据",
		             		showTableToggleBtn : false,
		             		pagetext : '第',
		             		outof : '页 /共',
		             		width :  _size.tbl.width,
		             		height : _size.tbl.height+122,
		             		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	$("#usingStoreTable tr").live('dblclick',function(){
		initUsing.editStore($(this).find('div input'));
	});
}
function usingFormGrid(){
	$('#usingFormGrid').width( (_size.tbl.width)+"px").height(_size.tbl.height+237);
	$("#usingFormTable").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
				{display : '<input type="checkbox" name="sinputA">', name:'cbox', width:40, align:'center'},
				{display : '字段名',	name : 'ESIDENTIFIER',	width : 100,align : 'center'},
				{display : 'id',	name : 'id',	width : 100,align : 'center',hide:true},
				{display : 'METADATAID',	name : 'METADATAID',	width : 100,align : 'center',hide:true},
				{display : '元数据',	name : 'METADATA',width : 200,align : 'center'},
				{display : '类型',name : 'ESTYPE',width : 60,align : 'center' },
				{display : '是否为必填项',name : 'ESISNULL', width : 50, align : 'center'},
				{display : '字段长度', name : 'ESLENGTH', width:80, validate:/^\d{1,5}$/i,  validateMsg:"必须为数字",align :'center'},
				{display : '小数点位数', name : 'ESDOTLENGTH',  width : 80, validate:/^\d+$/i, validateMsg:"必须为数字",align :'center'},
				{display : '描述', name : 'ESDESCRIPTION', width : 150, align : 'center'},
				{display : '系统字段', name : 'system', width : 150, align : 'center'}
		            ],
		            buttons:[
		                     {name : '添加', bclass : 'add', onpress : initUsing.addForm},
		                     {name : '编辑', bclass : 'all', onpress : initUsing.editForm},  
		                     {name : '删除', bclass : 'delete', onpress : initUsing.deleteForm}  
		                     ],
		                     singleSelect:true,
		             		usepager : true,
		             		title : '工作流管理',
		             		useRp : true,
		             		rp : 20,
		             		nomsg : "没有数据",
		             		showTableToggleBtn : false,
		             		pagetext : '第',
		             		outof : '页 /共',
		             		width :  _size.tbl.width,
		             		height : _size.tbl.height+122,
		             		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	$("#usingFormTable tr").live('dblclick',function(){
		initUsing.editForm($(this).find('div input'));
	});
}
function tempUserGrid(){
	$('#tempUserGrid').width( (_size.tbl.width)+"px").height(_size.tbl.height+237);
	$("#tempUserTable").flexigrid({
		url : false,
		dataType : 'json',
		editable : true,
		colModel : [
		            {display:'<input type="checkbox" name="tempUserTitle">', name:'cbox', width:24, align:'center'},
		            {display:'userId', name:'id',  width:120, align:'center',hide:true},
		            {display:'操作', name:'edit',  width:55, align:'center'},
		            {display:'姓名', name:'userName',  width:120, align:'center'},
		            {display:'单位', name:'dep',  width:120, align:'center'},
		            {display:'身份证号', name:'identity',  width:120, align:'center'},
		            {display:'电话', name:'phone',  width:120, align:'center'},
		            {display:'Email', name:'email',  width:120, align:'center'}
		            ],
		            buttons:[
		                     {name : '添加', bclass : 'add', onpress : initTempUser.addTempUser},
		                     {name : '编辑', bclass : 'all', onpress : initTempUser.editTempUser},  
		                     {name : '删除', bclass : 'delete', onpress : initTempUser.deleteTampUser}  
		                     ],
		                     singleSelect:true,
		             		usepager : true,
		             		title : '工作流管理',
		             		useRp : true,
		             		rp : 20,
		             		nomsg : "没有数据",
		             		showTableToggleBtn : false,
		             		pagetext : '第',
		             		outof : '页 /共',
		             		width :  _size.tbl.width,
		             		height : _size.tbl.height+122,
		             		pagestat : ' 显示 {from} 到 {to}条 / 共{total} 条' 
	});
	$("#tempUserTable tr").live('dblclick',function(){
		initTempUser.editTempUser($(this).find('div input'));
	});
}
Role_Grid();
tempUserGrid();
usingFormGrid();
usingStoreGrid();
$(document).ready(function() { 
	$('#fourGrid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">特殊用户</span>').append('<div class="find-dialog" style = "width:140px;"><input style = "width:115px;" id="queryFourWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryFourTable()"></span></div>');
	$('#fourGrid div[class="tDiv"]').css("border-top","1px solid #ccc");
	$('#twoGrid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">普通用户</span>').prepend('<div class="find-dialog"><input id="queryTwoWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryTwoTable()"></span></div>');
	$('#twoGrid div[class="tDiv"]').css("border-top","1px solid #ccc");
	$('#rolegrid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;border-right:1px solid #ccc;">角色列表</span>').prepend('<div class="find-dialog" style="width:140px;"><input id="queryRoleTableWord" style="width:115px;" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryRoleTableTable()"></span></div>');
	$('#rolegrid div[class="tDiv"]').css("border-top","1px solid #ccc");
	$('#saveRole').click(function(){
		initRole.saveRole();
	});
	$(".chooseRightUser").die().live("click", function(){
		removeCommenToVip($(this).closest("tr").prop("id").substr(3));
	});
	$(".chooseLeftUser").die().live("click", function(){
		moveVipToCommon($(this).closest("tr").prop("id").substr(3));
	});
	
	
	$("#casualUser").click(function(){
		displayModel(2);
	});
	$("#setPermission").click(function(){
		displayModel(1);
	});
	$("#usingFormField").click(function(){
		displayModel(3);
	});
	$("#usingFormStoreField").click(function(){
		displayModel(4);
	});
	$("#tempUserTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getTempUsers'},'x')}).flexReload();
	$('#tempUserGrid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;padding-right:3px;border-right:1px solid #ccc;">临时用户</span>').append('<div class="find-dialog"><input id="queryTempWord" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="initTempUser.queryTempUser()"></span></div>');
	$('#tempUserGrid div[class="tDiv"]').css("border-top","1px solid #ccc");
	$("#usingFormTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'form'},'x')}).flexReload();
	$("#usingStoreTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getUsingFields',data:'store'},'x')}).flexReload();
	
}); 
function changeRadio(str){
	if(initRole.roleId != str.split('|')[0]){
		initRole.roleId = str.split('|')[0];
		$("input[name='roleName']").val(str.split('|')[1]);
		$("#roleDesc").text(str.split('|')[2]);
		$.post(
			$.appClient.generateUrl({ESArchiveUsingModel:'getRoleLend'},'x'),
			{ roleId:initRole.roleId},
			function (data){
				_initValue.dataLendDay = data.lendDay;
				_initValue.dataLendCount = data.lendCount;
				$("#lendDay").val(data.lendDay);
				$("#lendCount").val(data.lendCount);
			},
			'json'
		);
		$("#threeTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getLendData',roleId:initRole.roleId},'x')}).flexReload();
		$("#twoTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getCommonUser',roleId:initRole.roleId},'x')}).flexReload();
		$("#fourTable").flexOptions({url:$.appClient.generateUrl({ESArchiveUsingModel:'getVipUser',roleId:initRole.roleId},'x')}).flexReload();
		}
}
function removeCommenToVip(userId){
	if(_initValue.dataLendDay==undefined){
		$.dialog.notice({
			icon : 'error',
			content : '请保存借阅天数和借阅件数！',
			time : 2,
			lock:false
		});
		return false;
	}
	$.post(
			$.appClient.generateUrl({ESArchiveUsingModel:'removeCommonUserToVip'},'x'),
			{ roleId:initRole.roleId,userId:userId},
			function (SUCCESS){
				if(SUCCESS){
					$('#twoTable').flexReload();
					$('#fourTable').flexReload();
				}
			},
			'json'
		);
}
function moveVipToCommon(userId){
	$.post(
			$.appClient.generateUrl({ESArchiveUsingModel:'moveVipToCommon'},'x'),
			{ roleId:initRole.roleId,userId:userId},
			function (SUCCESS){
				if(SUCCESS){
					$('#twoTable').flexReload();
					$('#fourTable').flexReload();
				}
			},
			'json'
		);
}
$(function(){
	var $_metadata=''; 
	$('#metaData').live('dblclick',function (){
		// 元数据选择回调函数
		function metadata_Call_back ()
		{
			var checkboxObj=$("input[name='metadata']:checked");
			if(checkboxObj.length !=1)
			{
				//wanghongchen 20141017 修改消息提醒图标
				$.dialog.notice({content:'请选择一条数据',time:3,icon:'warning'});
				return false;
			}else{
				checkboxObj.each(function(i){
					initUsing.metaDataId = $(this).val().split('|')[0];
					$_metadata=$(this).val().split('|')[1];
					});
				}
			$('#metaData').val($_metadata);
			metadata_dialog.close();
		}
	
		
		metadata_dialog = $.dialog({
			title:'元数据选择',
			content:'<div id="metadata_grid"><table id="metadata_tbl"></table></div>',
			width:600,
			padding:'0',
			//shimiao 20140723 取消元数据设置
			button:[{
				name:'取消元数据',
				callback:function(){
					initUsing.metaDataId = 0;
					$('#metaData').val("");
					metadata_dialog.close();
				}
			},{
			name:'确定',
			focus: true
				}],
			okVal:'确定',
			cancelVal:'取消',
			ok:metadata_Call_back,
			cancel:true
			
		});
		
		$("#metadata_tbl").flexigrid({
			url: $.appClient.generateUrl({ESArchiveUsingModel:'meta_json'}),
			dataType: 'json',
			onClick:function(td, grid, options){
				$(td).parent().find('td:eq(0) input').attr('checked','checked');
				$_metadata = $(td).parent().find('td:eq(2)').text();
			},
			colModel : [
				{display: '', name : 'radio', width : 40, align: 'center'},
				{display: '名称', name : 'name', width : 80, sortable : true, align: 'center'},
				{display: '唯一标识', name : 'ident', width : 80, sortable : true, align: 'center'},
				{display: '类型', name : 'type', width : 80, sortable : true, align: 'center'},
				{display: '是否参与高级检索', name : 'search', width : 80, sortable : true, align: 'center'},
				{display: '描述', name : 'desc', width : 100, sortable : true, align: 'center'}
				],
			buttons:[],
			usepager: true,
			useRp: true,
			resizable: false,
			rp:20,
			procmsg:"数据加载中,请稍后...",
			nomsg:"没有数据",
			pagetext: '第',
			outof: '页 /共',
			width: 600,
			height: 270,
			pagestat:' 显示 {from} 到 {to}条 / 共{total} 条'
		});
		$('#metadata_grid div[class="tDiv2"]').prepend('<span style="float:left;margin:2px 0px 3px 5px ;">元数据列表</span>').prepend('<div class="find-dialog" style="width:140px;"><input id="queryMetadataKeyword" style="width:115px;" onblur="if($(this).val()==\'\')$(this).val(\'请输入关键字\')" onfocus="if($(this).val()==\'请输入关键字\')$(this).val(\'\')" type="text" name="keyWord" value="请输入关键字" /><span onclick="queryMetadataTable()"></span></div>');
		$('#metadata_grid div[class="tDiv"]').css("border-top","1px solid #ccc");
		$("#metadata_tbl").find("tr").live("click",function(){
		    $(this).find("input[type='radio']").attr('checked','checked');
		});
	});
});
$("input[name='commUserList']").die().live('click', function() {
	$("input[name='commUser']").attr('checked', $(this).is(':checked'));
});
$("input[name='vipUserList']").die().live('click', function() {
	$("input[name='vipUser']").attr('checked', $(this).is(':checked'));
});
$("input[name='tempUserTitle']").die().live('click', function() {
	$("input[name='tempUser']").attr('checked', $(this).is(':checked'));
});
$("input[name='sinputA']").die().live('click', function() {
	$("input[name='fieldCheckform']").attr('checked', $(this).is(':checked'));
});
$("input[name='sinputB']").die().live('click', function() {
	$("input[name='fieldCheckstore']").attr('checked', $(this).is(':checked'));
});





