package cn.flying.rest.service.workflow;

import java.util.Map;

import cn.flying.rest.admin.entity.EssMessage;
import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.IServiceProvider;
import cn.flying.rest.service.ITransferFlowService;
import cn.flying.rest.service.impl.TransferFlowServiceImpl;
import cn.flying.rest.utils.DateUtil;
import cn.flying.rest.utils.SimpleEncodeOrDecode;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.FunctionProvider;
import com.opensymphony.workflow.WorkflowException;
import com.opensymphony.workflow.spi.WorkflowEntry;

/**
 * 工作流发送消息
 */
public class WorkflowSendMessage implements FunctionProvider {
  /**
   * 执行此方法
   * 
   * @param transientVars
   *          Map：是客户端代码调用Workflow.doAction()时传进来的。 这个参数可以基于用户的不同的输入使函数有不同的行为。
   *          这个参数也包含了一些特别变量，这些变量对于访问workflow的信息是很有帮助的。
   *          它也包含了所有的在Registers中配置的变量和下面两种特别的变量： entry
   *          (com.opensymphony.workflow.spi.WorkflowEntry) and context
   *          (com.opensymphony.workflow.WorkflowContext)。
   * 
   * @param args
   *          Map是一个包含在所有的<function/>标签中的<arg/>标签的Map。 这些参数都是String类型的。这意味着<arg
   *          name="foo">this is ${someVar}</arg> 标签中定义的参数将在arg
   *          Map中通过"foo"，可以映射到"this is [contents of someVar]"字串。
   * 
   * @param propertySet
   *          包含所有的在workflow实例中持久化的变量。
   * 
   */
  @SuppressWarnings({ "rawtypes", "deprecation" })
  public void execute(Map transientVars, Map args, PropertySet ps)
      throws WorkflowException {
    String formId = (String) transientVars
        .get(TransferFlowServiceImpl.PARM_FORM_ID);
    UserEntry currentUser = (UserEntry) transientVars
        .get(TransferFlowServiceImpl.PARM_CURRENT_USER);
    /** 平台服务调度器-调用服务的重要接口 **/
    IServiceProvider iServiceProvider = (IServiceProvider) transientVars
        .get(TransferFlowServiceImpl.PLATFORM_SERVICEPROVIDER);
    /** xiaoxiong 20140711 添加消息所属实例的获取 **/
    String instanceId = (String) transientVars.get("instanceId");
    if (args.get("from") != null && args.get("to") != null
        && args.get("step") != null && args.get("text") != null) {
      String to = args.get("to").toString();
      int stepId = Integer.parseInt(args.get("step").toString());
      WorkflowEntry entry = (WorkflowEntry) transientVars.get("entry");
      long wfId = entry.getId();
      String workflowName = entry.getWorkflowName();
      String text = args.get("text").toString();
      String messageText = text;
      String handler = null;
      if (!text.equals("审批完成！")) {
        ITransferFlowService transferFlowService = iServiceProvider
            .findService(ITransferFlowService.class);
        Map<String, Object> form = transferFlowService.getFormById(formId);
        messageText = messageText + form.get("name") + "！";
      }
      if (null != args.get("isLink") && args.get("isLink").equals("false")) {
        messageText = SimpleEncodeOrDecode.simpleEncode(messageText);
      } else {
        int isLast = 0;
        if (null != args.get("isLast")) {
          String isLastStr = args.get("isLast").toString().trim();
          if (Boolean.parseBoolean(isLastStr)) {
            isLast = 1;
          }
        }
        messageText = SimpleEncodeOrDecode.simpleEncode(messageText);
        handler = "formApprovalHandle.approvalForm('" + workflowName + "','"
            + wfId + "','" + stepId + "_" + isLast + "','" + formId + "')";
      }
      try {
        String[] toArray = to.split(";");
        String[] tos = to.split(";");
        MessageWS messageWS = iServiceProvider.findService(MessageWS.class);
        for (int i = 0; i < toArray.length; i++) {
          String tp = tos[i];
          EssMessage message = new EssMessage();
          message.setSender(currentUser.getUserid());
          message.setRecevier(tp);
          message.setContent(messageText);
          message.setSendTime(DateUtil.getDateTime());
          message.setStatus(TransferFlowServiceImpl.workflowstatus_run);
          message.setWorkFlowId(wfId);
          message.setWorkFlowStatus(TransferFlowServiceImpl.workflowstatus_run);
          message.setStepId(stepId);
          /** xiaoxiong 20140710 给消息表添加handler（消息处理函数可执行串）、handlerUrl（消息处理界面地址） **/
          message.setHandler(handler);
          message.setHandlerUrl("esdocument/" + instanceId
              + "/x/ESMessage/handlerMsgPage");
          messageWS.addEssMessage(message);
          System.out.println(currentUser.getUserid() + "->" + tp + "消息发送成功...");
        }
      } catch (Exception e) {
        System.out.println("消息发送失败...");
      }
    } else {
      System.out.println("消息发送失败...");
    }
  }

}
