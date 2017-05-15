package cn.flying.rest.service.workflow;

import java.util.Map;

import cn.flying.rest.platform.IServiceProvider;
import cn.flying.rest.service.ITransferFlowService;
import cn.flying.rest.service.impl.TransferFlowServiceImpl;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.FunctionProvider;
import com.opensymphony.workflow.WorkflowException;

/**
 * 工作流最后一步修改 已发工作流 状态；
 */
public class WfUpdateFormState implements FunctionProvider {

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

  @SuppressWarnings("rawtypes")
  public void execute(Map transientVars, Map arg1, PropertySet pSet)
      throws WorkflowException {
    /** 平台服务调度器-调用服务的重要接口 **/
    IServiceProvider iServiceProvider = (IServiceProvider) transientVars
        .get(TransferFlowServiceImpl.PLATFORM_SERVICEPROVIDER);
    String wfId = (String) transientVars
        .get(TransferFlowServiceImpl.PARM_WF_ID);
    ITransferFlowService transferFlowService = iServiceProvider
        .findService(ITransferFlowService.class);
    transferFlowService.updateWfState(wfId);
  }

}
