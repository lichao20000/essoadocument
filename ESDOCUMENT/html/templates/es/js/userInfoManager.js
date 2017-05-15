var userInfoManager={
		test : function(){
			var url = "/setting/"+userInfoManager.getSaasId()+"/message/ESMyUserInfo/getMyUserInfo";
			$.ajax({
				url:url,
				success:function(data){
					$.dialog({
						id:"myUserInfo",
						title:"个人信息",
						content:data,
						padding:0,
						width:880,
						height:520
					});
				}
			});
		},
		getSaasId : function() {
			var scripts = document.getElementsByTagName('script');
			var me = null;
			var saasId = null;
			for (i in scripts) {
				// 如果通过第三方脚本加载器加载本文件，请保证文件名含有"appclient"字符
				if (scripts[i].src && scripts[i].src.indexOf('appclient') !== -1)
					me = scripts[i];
			}
			// 如果加载的脚本里没有，在获取自己（同步加载可用）
			me = me || script[script.length - 1];
			saasId = me.src.replace(/\\/g, '/').split('baseurl=')[1];
			saasId = saasId.substring(saasId.indexOf("/",2)+1);
			return saasId.substring(0,saasId.indexOf("/"));
		},
		setSassId:function(obj){
				var saasid=$(obj).attr("saasid");
				//var url = "/setting/" + userInfoManager.getSaasId()+ "/x/ESOrder/changeSaasid";
				var url = "/setting/0/x/ESOrder/changeSaasid";
				$.post(url, {saasid : saasid});
				location.href = $(obj).attr("url");
		}
};

