function add_friend_agree(id,url){
	url = url+'/?id='+id;
  $.ajax({
    url:url,
    success:function(resp){
      if(resp != 'error'){
        alert('操作成功');
        resp = $.trim(resp);
        mscCallBack('setting', resp);
      }else{
    	alert('操作失败');
      }
    }
  });
}