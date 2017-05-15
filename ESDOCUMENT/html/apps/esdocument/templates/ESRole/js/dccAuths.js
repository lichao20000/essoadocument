/**
 * @author gengqianfeng
 */
$(document).ready(function() {

	getTreeAndDataAuth.getAuths();// 加载权限

});

var dccAuths = {
	allAuths : undefined,
	treeAuths : [],
	dataAuths : []
};

var getTreeAndDataAuth = {

	// 获取权限
	getAuths : function() {
		var url = $.appClient.generateUrl({
			ESRole : 'getTreeAndDataAuth'
		}, 'x');
		$.post(url, function(auths) {
			var json = eval('(' + auths + ')');
			if (json != null) {
				if (json.allAuth != null) {
					dccAuths.allAuths = json.allAuth;
				} else {
					dccAuths.treeAuths = json.treeAuth;
					dccAuths.dataAuths = json.dataAuth;
				}
			}
		});
	},

	/**
	 * nodeType-节点类型("1"、阶段，"2"、部门，"3"、装置) treeId-id
	 * auth-权限标识(DR,DU,DD,FR,FD,FP)
	 */
	checkTreeAuth : function(nodeType, treeId, auth) {
		if (getTreeAndDataAuth.checkIfAdmin()) {
			return "true";
		}
		nodeType += "";
		treeId += "";
		auth += "";
		var treeAuthList = dccAuths.treeAuths;
		if (treeAuthList != null && treeAuthList != []) {
			for (var i = 0; i < treeAuthList.length; i++) {
				var treeAuth = treeAuthList[i];
				if (treeAuth.nodeType == nodeType) {
					if (parseInt(treeAuth.tree_id) == treeId) {
						var auths = treeAuth.treeAuth;
						if (auths != '') {
							var arr = auths.split(",");
							for (var j = 0; j < arr.length; j++) {
								if (arr[j] == auth) {
									return "true";
								}
							}
						}
					}
				}
			}
			return "false";
		}
		return "false";
	},

	// 验证数据权限是否存在-auth(fileRead,fileDownload,filePrint,itemRead,itemEdit,itemDelete)
	// 普通文件
	checkDataAuthFile : function(treeId, auth, fileId) {
		if (getTreeAndDataAuth.checkIfAdmin()) {
			return "true";
		}
		var returnIds = "";
		var dataAuthList = dccAuths.dataAuths;
		if (dataAuthList != null && dataAuthList != []) {
			var flag = "true";
			for (var i = 0; i < dataAuthList.length; i++) {
				var dataAuth = dataAuthList[i];
				var nodeType = dataAuth.nodeType;
				if (nodeType == "1") {
					if (parseInt(dataAuth.tree_id) == treeId) {
						flag = "false";
						var auths = dataAuth.dataAuth;
						if (auths.length > 0) {
							var arr = auths.split(",");
							for (var j = 0; j < arr.length; j++) {
								if (arr[j] == auth) {
									var filter = dataAuth.filter;
									if (filter == "") {
										return "true";
									}
									var newIds = getTreeAndDataAuth
											.checkDataFilter(treeId, nodeType,
													fileId, filter);
									returnIds = getTreeAndDataAuth.joinIds(
											returnIds, newIds);
									j = arr.length;
								}
							}
						}
					}
				}
			}
			if (flag == "true") {
				return "true";
			}
			return returnIds;
		}
		return "false";
	},

	// 验证数据权限是否存在-auth(fileRead,filePrint,fileDownload)
	// 电子文件
	checkDataAuthEfile : function(treeId, auth, fileId) {
		if (getTreeAndDataAuth.checkIfAdmin()) {
			return "true";
		}
		var returnIds = "";
		var dataAuthList = dccAuths.dataAuths;
		if (dataAuthList != null && dataAuthList != []) {
			var flag = "true";
			for (var i = 0; i < dataAuthList.length; i++) {
				var dataAuth = dataAuthList[i];
				var nodeType = dataAuth.nodeType;
				if (nodeType == "file") {
					if (parseInt(dataAuth.tree_id) == treeId) {
						flag = "false";
						var auths = dataAuth.dataAuth;
						if (auths.length > 0) {
							var arr = auths.split(",");
							for (var j = 0; j < arr.length; j++) {
								if (arr[j] == auth) {
									var filter = dataAuth.filter;
									if (filter == "") {
										return "true";
									}
									var newIds = getTreeAndDataAuth
											.checkDataFilter(treeId, nodeType,
													fileId, filter);
									returnIds = getTreeAndDataAuth.joinIds(
											returnIds, newIds);
									j = arr.length;
								}
							}
						}
					}
				}
			}
			if (flag == "true") {
				return "true";
			}
			return returnIds;
		}
		return "false";
	},

	joinIds : function(returnIds, newIds) {
		if (returnIds != "") {
			if (newIds != "") {
				var arr1 = returnIds.split(",");
				var arr2 = newIds.split(",");
				var len = arr1.length;
				for (var i = 0; i < arr2.length; i++) {
					var flag = true;
					for (var j = 0; j < len; j++) {
						if (arr2[i] == arr1[j]) {
							flag = false;
							j = len;
						}
					}
					if (flag) {
						returnIds += "," + arr2[i];
					}
				}
				return returnIds;
			} else {
				return returnIds;
			}
		} else {
			return newIds;
		}
	},

	checkIfAdmin : function() {
		if (dccAuths.allAuths == "all") {
			return true;
		}
		return false;
	},

	checkDataFilter : function(treeId, nodeType, fileId, filter) {
		var returnIds = "";
		if (nodeType == "1") {
			$.ajax({
				type : 'POST',
				url : $.appClient.generateUrl({
					ESRole : 'checkDocByFilter'
				}, 'x'),
				data : {
					treeId : treeId,
					fileId : fileId,
					filter : filter
				},
				async : false,
				success : function(res) {
					returnIds = res;// 返回具有权限的ids字符串
				}
			});
		} else if (nodeType == "file") {
			$.ajax({
				type : 'POST',
				url : $.appClient.generateUrl({
					ESRole : 'checkFileByFilter'
				}, 'x'),
				data : {
					fileId : fileId,
					filter : filter
				},
				async : false,
				success : function(res) {
					returnIds = res;// 返回具有权限的ids字符串
				}
			});
		} else {
			return "";
		}
		return returnIds;
	}
};