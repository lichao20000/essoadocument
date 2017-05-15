$(document).ready(
		function() {
			var partSetting = {
				isSimpleData : true,
				showLine : true,
				checkable : false,
				data : {
					simpleData : {
						enable : true,
					}
				},
				async : {
					enable : true,
					autoParam : [ 'id' ]
				},
				callback : {
					onClick : getPartTree
				}
			};
			$.ajax({
				async : false,
				cache : false,
				type : 'POST',
				dataType : "json",
				url : $.appClient.generateUrl({
					ESParticipatory : 'getTree'
				}, 'x'),// 请求的action路径
				error : function() {
					alert('请求失败');
				},
				success : function(data) {
					var partZTree = $.fn.zTree.init($("#select_Part_Tree"),
							partSetting, data);
					var root = partZTree.getNodeByParam("id", "0");
					$("#partId").val("0");
					partZTree.selectNode(root);					
				}
			});

			function getPartTree(event, treeId, treeNode) {
				if (treeNode != '') {
					$("#partId").val(treeNode.id);
					$("#select_User").flexOptions({
						url : $.appClient.generateUrl({
							ESTransferFlow : 'getSelectUserList',
							key : '1',
							ids : treeNode.id,
							searchKeyword : ''
						}, 'x'),
						newp : 1
					}).flexReload();
				}
			}
		});