(function(){
	
	    var lv = 0;
	    var lvName = ["库房","排架","列","层"];
	    var lvClass = ["storelogo","shelflogo","collogo","layerlogo"];
	    
		$(document).ready(function(){
			$.appClient.generateUrl({
				ESIdentify : "getStoreStructure"
			}, 'x');
		});
	    /**  绑定每一层的点击事件 **/
		$(".moudle").die().live('click',function(){
			var parentId = $(this).attr("value");
			var curName = $(this).attr("name");
			var url = $.appClient.generateUrl({ESIdentify:'getRepositoryListImgByParentId'},'x');
			lv++;
			if(lv<4){
				$.get(url,{parentId:parentId},function(result){
					 var bufferHrml = "";
					 var resValue = $.parseJSON(result);
					 for(var i=0; i<resValue.length; i++){  
						 var title = resValue[i].gridsurpluswidth==""?"":"剩余宽度"+resValue[i].gridsurpluswidth+"CM";
						 //bufferHrml += "<div class = \"moudle\" value = '"+resValue[i].id+"' name = '"+resValue[i].name+"' espath = '"+resValue[i].espath+"' title='"+title+"'><div class = '"+lvClass[lv]+"'></div><div class = 'storeCode'>"+lvName[lv]+"["+resValue[i].name+"]"+"</div></div>";
						 if(resValue[i].name.length>=4){
							// var b = /^[0-9a-zA-Z]*$/g;
							 var temp = resValue[i].name.substr(0,3);
							 bufferHrml += "<div class = \"moudle\" value = '"+resValue[i].id+"' name = '"+resValue[i].name+"' espath = '"+resValue[i].espath+"' title='"+title+"'><div class = '"+lvClass[lv]+"'></div><div class = 'storeCode' title='"+resValue[i].name+"'>"+lvName[lv]+"["+temp+"...]"+"</div></div>";
						 }else{
							 bufferHrml += "<div class = \"moudle\" value = '"+resValue[i].id+"' name = '"+resValue[i].name+"' espath = '"+resValue[i].espath+"' title='"+title+"'><div class = '"+lvClass[lv]+"'></div><div class = 'storeCode'>"+lvName[lv]+"["+resValue[i].name+"]"+"</div></div>";
						 }
					 }
					 $("#storeContainer").html(bufferHrml);
				});
				var navContainer = $("#navContainer");
				var tmpHtml = navContainer.html();
				navContainer.html(tmpHtml + "<div class = 'connector'>-></div><div class = 'nav' value = '"+parentId+"' name = '"+lvName[lv-1]+"["+curName+"]"+"'>"+lvName[lv-1]+"["+curName+"]"+"</div>");
			}else{
				 clear();
				 $(this).children(".layerlogo").addClass("activeSelected");
			}
		});
		 /**  绑定导航条的绑定事件 **/
		$(".nav").die().live('click',function(){
			var parentId = $(this).attr("value");
			var curName= $(this).attr("name");
			if(null != curName && curName.indexOf("库房")>=0){
				lv = 1;
			}else if(null != curName && curName.indexOf("排架")>=0){
				lv = 2;
			}else if(null != curName && curName.indexOf("列")>=0){
				lv = 3;
			}else if(null != curName && curName=="首页"){
				lv = 0;
			}
			var url = $.appClient.generateUrl({ESIdentify:'getRepositoryListImgByParentId'},'x');
			$.get(url,{parentId:parentId},function(result){
				 var bufferHrml = "";
				 var resValue = $.parseJSON(result);
				 for(var i=0; i<resValue.length; i++){  
					 var title = resValue[i].gridsurpluswidth==""?"":"剩余宽度"+resValue[i].gridsurpluswidth+"CM";
					 //bufferHrml += "<div class = \"moudle\" value = '"+resValue[i].id+"' name = '"+resValue[i].name+"' espath = '"+resValue[i].espath+"' title='"+title+"'><div class = '"+lvClass[lv]+"'></div><div class = 'storeCode'>"+lvName[lv]+"["+resValue[i].name+"]"+"</div></div>";
					 if(resValue[i].name.length>=4){
						 var temp = resValue[i].name.substr(0,3);
						 bufferHrml += "<div class = \"moudle\" value = '"+resValue[i].id+"' name = '"+resValue[i].name+"' espath = '"+resValue[i].espath+"' title='"+title+"'><div class = '"+lvClass[lv]+"'></div><div class = 'storeCode' title='"+resValue[i].name+"'>"+lvName[lv]+"["+temp+"...]"+"</div></div>";
					 }else{
						 bufferHrml += "<div class = \"moudle\" value = '"+resValue[i].id+"' name = '"+resValue[i].name+"' espath = '"+resValue[i].espath+"' title='"+title+"'><div class = '"+lvClass[lv]+"'></div><div class = 'storeCode'>"+lvName[lv]+"["+resValue[i].name+"]"+"</div></div>";
					 }
				 }   
				 $("#storeContainer").html(bufferHrml);
			});
			var navContainer = $("#navContainer");
			var tmpHtml = navContainer.html();
			tmpHtml = tmpHtml.substring(0,tmpHtml.lastIndexOf(curName)+curName.length+6);
			navContainer.html(tmpHtml);
			
		});
		/**  用于选择层时候调整样式  **/
		function clear() {
		    $(".moudle").each(function() {
		        if ($(this).children(".layerlogo").hasClass("activeSelected")) {
		            $(this).children(".layerlogo").removeClass("activeSelected");
		        }
		    });
		}
	
})()
