/*
 * author fangjixiang
 * create date 20130412
 * fn insert image
 * version 0.2
 */

(function(){
    //Section 1 : 按下自定义按钮时执行的代码
    var a= {
        exec:function(editor){
        	
        	var htm = '<div style="float:left;">请选择：<input type="file" id="insertImgFile" name="insertImgFile" /></div>';
        	$.dialog({ id: 'id1364871963821', title:false, content: htm});
        	
		  	document.getElementById('insertImgFile').onchange = function (){
				$.ajaxFileUpload({
					url:$.appClient.generateUrl({ESInformationPublish:'insertImg'},'x'),
					secureuri:false,
					fileElementId:'insertImgFile',
					dataType: 'json',
					success: function (data, status){
						$.dialog.list.id1364871963821.close();
						if(data.err == 'normal'){
							CKEDITOR.instances.editorcontent.insertHtml("<img src='"+ data.url +"' title='"+ data.title +"' />");
						}else{
							$.dialog({title:false, content:data.err, time:5, lock:false, icon:'warning'});
						}
					},
					error: function (data, status, e){
						$.dialog({title:false, content:'上传错误，错误信息：'+e, time:2, lock:false, icon:'warning'});
					}
				});
				
				return false;
			};
			/*
			setTimeout(function (){
			
				document.getElementById('id1364871963821').onmouseover = function (){
	  	
					_isOn1364871963821 = true;
				
				};
				document.getElementById('id1364871963821').onmouseout = function (){
				
					_isOpen1364871963821 = false;
					
				};
				
				document.onclick = function (){
				
					if(!_isOn1364871963821 && _isOpen1364871963821){ // 单击事件不在Div标签上并且Div没有显示
						$('#id1364871963821').remove();
						_isOn1364871963821 = _isOpen1364871963821 = false;
					}
				};
			},1000);
			*/
        }
        
    },b='insertImg';
    
    CKEDITOR.plugins.add(b,{
        init:function(editor){
            editor.addCommand(b,a);
            editor.ui.addButton('insertImg',{
                label:'插入图片',
                icon: this.path + 'insertImg.gif',
                command:b
            });
        }
    });
    
   
})();
