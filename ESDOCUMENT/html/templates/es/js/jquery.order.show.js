/** xiaoxiong 20140711 档案应用消息处理jQuery类库 * */
(function($) {
	$.messageOrder = {
		changeOrderStatus:function(orderid){
			var reply = "/setting/" + getSaasId()+ "/x/ESOrder/changeOrderStatus";
			$.ajax({
				type:'post',
				url : reply,
				data : {
					'orderid' : orderid,
					'status':1
				},
				success : function(res) {
					if (res == 'true') {
						$.dialog.notice({
							icon : 'succeed',
							content : '审批完成!',
							title : '3秒后自动关闭',
							time : 3
						});
						return;
					} else {
						$.dialog.notice({
							icon : 'error',
							content : '申请失败！',
							title : '3秒后自动关闭',
							time : 3
						});
						return;
					}

				}
			});
			
		},	
		changeSaasStatus:function(applyid,superUserName,status){
			var reply = "/setting/" + getSaasId()+ "/x/ESOrder/changeSaasStatus";
			$.ajax({
				type:'post',
				url : reply,
				data : {
					'applyid' : applyid,
					'superUserName':superUserName,
					'status':status
					},
				success : function(res) {
					if (res == 'true') {
						$.dialog.notice({
							icon : 'succeed',
							content : '应用申请审核完成!',
							title : '3秒后自动关闭',
							time : 3
						});
						return;
					} else {
						$.dialog.notice({
							icon : 'error',
							content : '应用申请审核失败！',
							title : '3秒后自动关闭',
							time : 3
						});
						return;
					}

				}
			});
			
		},	
		showOrderReply : function(orderid, handlerurl) {
			var url = "/setting/" + getSaasId() + "/x/ESOrder/reply";
			$.ajax({
				url : url,
				data : {
					'orderid' : orderid
				},
				success : function(data) {
					$.dialog({
						id : "reply_app",
						title : "订购回复",
						content : data,
						/** wanghongchen 20141013 设置宽度**/
						width:600,
						padding : 0,
						button : [ {
							name : '审批',
							tip : 'asdfad',
							callback : function() {
								$.messageOrder.changeOrderStatus(orderid);
								$.messageOrder.refuseApply();
							},
							focus : true
						} ]
					});

				}
			});
		},
		showSassReply : function(applyid,superUserName) {
			var rurl = "/setting/" + getSaasId() + "/x/ESOrder/delSaasReply";
			$.ajax({
				url : rurl,
				data : {
					'applyid' : applyid
				},
				success : function(data) {
					$.dialog({
				    	title:'申请',
				    	modal:true, 
			    	   	fixed:false,
			    	   	stack: true ,
			    	    resize: false,
			    	    height:200,
			    	    lock : true,
						opacity : 0.1,
					    content:data,
						button : [ {
							name : '同意',
							callback : function() {
								var addurl = "/essoaadmin/" + getSaasId() + "/x/ESOrgRegister/addOrEdit";
								$.ajax({
						    		url:addurl,
						    		type:'post',
						    		dataType:'json',
						    		data:{formData:$("#registerForm").serialize()},
						    		success:function(rt){
						    			$.messageOrder.changeSaasStatus(applyid,superUserName,1);
						    		}
						    	});
							
							},
							focus : true
						} ,
						{
							name : '拒绝',
							callback : function() {
							$.messageOrder.changeSaasStatus(applyid,superUserName,0);
							},
							focus : true
						}
						]
					});

				}
			});
		},
		refuseApply : function(){//wanghongchen 20141013 拒绝申请
			var ids = '';
			$("input[type='checkbox'][name='appServerlist']").each(function(i) {
				ids += $(this).val() + ',';
			});
			if(ids.length > 0){
				ids = ids.substring(0, ids.length - 1);
				var Actionurl = $.settingClient.generateUrl({
					ESOrder : 'refuseApply'
				}, 'x');
				$.post(Actionurl, {
					ids : ids
				});
			}
		}
		
	};
})(jQuery);