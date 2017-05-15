function keyWordQuery(keyWordValue) {
	var keyword=$.trim(keyWordValue);
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var ajaxUrl = $.appClient.generateUrl({ESTaskSchedul:'task_json'},'x');
	$("#flexme2").flexOptions({url:ajaxUrl,query:keyword,newp:1}).flexReload();
	return false;
}

function serviceKeyWordQuery(serviceKeyWordValue) {
	var keyword=$.trim(serviceKeyWordValue);
	if(keyword=='' || keyword=='请输入关键字') {
		keyword = '';
	}
	var ajaxUrl = $.appClient.generateUrl({ESTaskSchedul:'triggerService_json'},'x');
	$("#triggerServiceGrid").flexOptions({url:ajaxUrl,query:keyword,newp:1}).flexReload();
	return false;
}