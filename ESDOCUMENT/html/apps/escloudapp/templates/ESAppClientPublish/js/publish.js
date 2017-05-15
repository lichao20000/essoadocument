
$(document).ready(function(){
	var $size = {
			init : function (){
				var width = $(document).width()*0.96;
				var height = $(document).height()- 500;	// 可见总高度 - 176为平台头部高度
				var leftWidth = 200;

				var rightWidth = width;
				var tblHeight = height;
				
				var size = {
						leftWidth: leftWidth,
						rightWidth : rightWidth,
						height: height,
						tblWidth : rightWidth,
						tblHeight : tblHeight
					};
				return size;
			}
				
		};
	var type;
	var _nav = { // 导航	
			bind: function (){ // 给导航A标签绑定事件
				var all_ = document.getElementById('type_all').children;
				var that_ = this,ai = all_.length;

				for(var a=0; a<ai; a++)
				{
					all_[a].onclick = function (){
					that_.bindEvent(this);
					};
					
				}
				
			},
			bindEvent: function (that){ // 初始化样式并获取数据
		
				// +++++ 初始化样式 +++++//
				var p_ = that.parentNode;
				if(p_.id==='type_all'){
					type = that.id; // setting

				}
				var pchild = p_.children;
				for(var pl=0; pl<pchild.length; pl++)
				{
					if(pchild[pl].className){
						pchild[pl].className = '';
					}
				}
				that.className = 'selected';
				// ----- 初始化样式 ------//
				this.getData(that);
			},
			getData: function (that){
				
				var url = $.appClient.generateUrl({
					ESAppClientPublish: 'getPublishListInfo',
						type: type
						},'x');
				
				$("#publish").flexOptions({newp: 1, url: url}).flexReload();
				
			}
				
		};
	_nav.bind(); // 绑定导航
	// 生成表格
	$("#publish").flexigrid({
		url: $.appClient.generateUrl({ESAppClientPublish:'getPublishListInfo', type: 'all'},'x'),
		dataType: 'json',
		minwidth: 20,
		colModel : [
			{display: '', name: 'rownum', width: 20, align: 'center'},
			{display: '选择', name : 'ids', width : 40, align: 'center'},
			{display: '标题', name : 'title', metadata:'title', width : 500, sortable : true, align: 'left'},
			],
		sortname: "c0",
		sortorder: "asc",
		usepager: true,
		title: '文章列表',
		useRp: true,
		rp: 20,
		nomsg:"没有数据",
		showTableToggleBtn: true,
		pagetext: '第',
		itemtext: '页',
		outof: '页 /共',
		width: $size.init().tblWidth,
		height: $size.init().tblHeight,
		pagestat:' 显示 {from} 到 {to}条 / 共{total} 条',
		procmsg:'正在加载数据，请稍候...',
		onSuccess:function() {
			$("#publish").find("input[type='checkbox']").click(function(){	 
				 var aa = $('#publish input:checked');
				 for (var i = 0; i < aa.length; i++) {
				  aa[i].checked = false;
				 }
				 this.checked = true;			
			});
			
			$('#publish tr').click(function() {
				 var aa = $('#publish input:checked');
				 for (var i = 0; i < aa.length; i++) {
				  aa[i].checked = false;
				 }
				 $(this).find("input[type='checkbox']").get(0).checked = true;	
			});
		}
	});
	
});
