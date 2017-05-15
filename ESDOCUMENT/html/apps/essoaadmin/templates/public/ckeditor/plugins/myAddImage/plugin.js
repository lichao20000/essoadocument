CKEDITOR.plugins.add( 'myAddImage',{
    init : function( editor )
    {   
       /*
       /* 获取CKEditorFuncNum
       */
       var getFuncNum = function(url) {
          var reParam = new RegExp('(?:[\?&]|&amp;)CKEditorFuncNum=([^&]+)', 'i') ;
          var match = url.match(reParam) ;
          return (match && match.length > 1) ? match[1] : '' ;
        };

        CKEDITOR.dialog.add( 'myAddImage', function( editor )
        {
            return {
                    title : '添加图片',
                    minWidth : 400,
                    minHeight : 100,
                    contents : 
                    [
						/*{
						    id : 'serverList',
						    label : '浏览服务器',
						    title : '浏览服务器',
						   // filebrowser : 'uploadButton',
						    elements :
						    [
						      {
						            id : 'photolist',
						            type : 'file',
						            label : '图片浏览',
						            style: 'height:40px',
						            size : 38
						      },
						      {
						           type : 'fileButton',
						           id : 'uploadButton',
						           label : '上传',
						           filebrowser :
						           {
						                action : 'QuickUpload',
						                target : 'addImage:txtUrl',
						                onSelect:function(fileUrl, errorMessage){
						                    //在这里可以添加其他的操作
						                }
						           },
						           onClick: function(){
						                var d = this.getDialog();
						                var _photo =  d.getContentElement('addImage','photo');
						                _funcNum = getFuncNum(_photo.action);
						                var _iframe =  CKEDITOR.document.getById(_photo._.frameId);
						                _iframe.on('load', getAjaxResult, _iframe, _funcNum);
						           },
						           'for' : [ 'addImage', 'photo']
						      }
						    ]
						},*/
                        {
                            id : 'addImage',
                            label : '添加图片',
                            title : '添加图片',
                            filebrowser : 'uploadButton',
                            elements :
                            [
                              {    
                                  id : 'txtUrl',
                                  type : 'text',
                                  label : '图片网址',
                                  required: true
                              },
                              {
                                    id : 'file_txt',
                                    type : 'file',
                                    label : '上传图片',
                                    style: 'height:40px',
                                    size : 38
                              },
                              {
                                   type : 'fileButton',
                                   id : 'uploadButton',
                                   label : '上传',
                                   filebrowser :
                                   {
                                        action : 'QuickUpload',
                                        target : 'addImage:txtUrl',
                                        onSelect:function(fileUrl, errorMessage){
                                            //在这里可以添加其他的操作
                                        }
                                   },
                                   onClick: function(){
                                        var d = this.getDialog();
                                        var _photo =  d.getContentElement('addImage','file_txt');
                                        _funcNum = getFuncNum(_photo.action);
                                        var _iframe =  CKEDITOR.document.getById(_photo._.frameId);
                                        _iframe.on('load', getAjaxResult, _iframe, _funcNum);
                                   },
                                   'for' : [ 'addImage', 'file_txt']
                              }
                            ]
                        }
                        
                   ],
                   onOk : function(){
                       _src = this.getContentElement('addImage', 'txtUrl').getValue();
                       if (_src.match(/(^\s*(\d+)((px)|\%)?\s*$)|^$/i)) {
                           alert('请输入网址或者上传文件');
                           return false;
                       }
                       this.imageElement = editor.document.createElement( 'img' );
                       this.imageElement.setAttribute( 'alt', '' );
                       this.imageElement.setAttribute( 'src', _src );
                       //图片插入editor编辑器
                       editor.insertElement( this.imageElement );
                   }
            };
        });
        editor.addCommand( 'myImageCmd', new CKEDITOR.dialogCommand( 'myAddImage' ) );
        editor.ui.addButton( 'AddImage',
        {
                label : '图片',
                icon:'images/images.gif', //toolbar上icon的地址,要自己上传图片到images下
                command : 'myImageCmd'
        });
    },
    requires : [ 'dialog' ]
});
