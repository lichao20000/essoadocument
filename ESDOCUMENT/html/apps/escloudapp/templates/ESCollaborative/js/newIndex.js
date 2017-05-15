/** guolanrui 20140529 我的待办功能中新的js * */
var _newOpen = {

	iface : function(p) {
		var userFormNo, id, userId, formId, wfId, stepId, isDealed, dataId, workFlowType, wfState, title = false, isLast;
		if (typeof p === 'object') {
			userFormNo = p.getAttribute('userFormNo');
			id = p.getAttribute('id');
			userId = p.getAttribute('userId');
			formId = p.getAttribute('formId');
			wfId = p.getAttribute('wfId');
			stepId = p.getAttribute('stepId');
			isDealed = p.getAttribute('isDealed');
			dataId = p.getAttribute('dataId');
			workFlowType = p.getAttribute('workFlowType');
			wfState = p.getAttribute('wfState');
			title = p.getAttribute('title');
			isLast = p.getAttribute('isLast');
		}
		var selectType = $('#mylist').attr('selectType');
		// id,formId,wfId,wfState
		var data = formId;
		if (selectType == 'todo') {//待办
			formApprovalHandle.approvalForm(userFormNo, wfId, stepId + "_" + isLast, formId,workFlowType);
		} else if (selectType == 'send') {//待发
			collaborativeHandle.toSendFormPage(id,formId,wfId,userFormNo);
		} else if (selectType == 'have_send') {//已发
			collaborativeHandle.toHaveSendFormPage(formId,wfId,stepId,'1',title,userFormNo); 
		} else if (selectType == 'have_todo') {//已办
			collaborativeHandle.toHaveSendFormPage(formId,wfId,stepId,'1',title,userFormNo); 
		}
		
	}
};
