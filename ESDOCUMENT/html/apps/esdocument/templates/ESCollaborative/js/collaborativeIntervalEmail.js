var collaborativeIntervalEmail = {
	// 流程处理越期轮询发送提醒
	createFlowOutTimeInterval : function() {
		setInterval("collaborativeIntervalEmail.flowOutTimeInterval()", 60000);
	},

	flowOutTimeInterval : function() {
		var url = $.appClient.generateUrl({
			ESCollaborative : 'flowOutOfAuditTime'
		}, 'x');
		$.post(url, function(res) {
			if (res == "true") {
				// 发送成功
			} else {
				// 发送失败
			}
		});
	}
}

collaborativeIntervalEmail.createFlowOutTimeInterval();