/** xiaoxiong 20140711 档案应用消息处理jQuery类库 **/
;
(function($) {
	$.messageFun = {
		showArchiveReturn:function(title,url,formCode,formId,storeId){
			$.ajax({
				  url: $.appClient.generateUrl({ESArchiveLending:url},'x'),
				  data: {formCode:formCode,formId:formId,storeId:storeId},
				  type : 'POST',
				  success: function(data){
					  $.dialog({
				    		id:title,
					    	title:'查看借阅',
					    	width:600,
					    	height:500,
					    	padding:0,
				    	   	fixed:false,
				    	    resize: true,
						    content:data
					    });
				  }
			});
		},
		downFileForMessage:function(fileUrl,fileName,method,id){
			/**wanghongchen 20140723 修复下载消息下不下来问题**/
//			window.location=fileUrl;
			// longjunhao 20140728 修复bug134 档案收集-无法下载报表
			var downFile=$.appClient.generateUrl({ESYearlyReport:'fileDown',fileUrl:fileUrl});
			//window.open(downFile,"_blank");
			/**  此处将该open方法修改为直接访问，避免WinXP系统下面无法下载文件的问题  **/
			window.location.href = downFile;
		},
		downFileNotReportForMessage:function(fileName,method){
			window.location=fileName;
		},
		//wanghongchen 添加下载文件方法，fileUrl为下载文件的地址
		downFile:function(fileUrl){
			var downUrl = $.appClient.generateUrl({ESDefault:'fileDown',fileUrl:fileUrl});
			/**  此处将该open方法修改为直接访问，避免WinXP系统下面无法下载文件的问题  **/
			window.location.href = downUrl;
		}
	};
})(jQuery);