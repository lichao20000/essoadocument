package cn.flying.rest.service.workflow;

import java.util.Map;

import cn.flying.rest.service.impl.TransferFlowServiceImpl;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.Condition;
import com.opensymphony.workflow.StoreException;

/**
 * 会签状态校验器
 */
public class ValidatorCountersign implements Condition {
  /**
   * 确定条件 信息通过或失败
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
   * @return true表示通过 false表示失败
   */
  @SuppressWarnings("rawtypes")
  public boolean passesCondition(Map transientVars, Map args, PropertySet ps)
      throws StoreException {
    try {
      System.out.println(" execute ValidatorCountersign...");
      String stepId = (String) transientVars
          .get(TransferFlowServiceImpl.PARM_WF_STEP_ID);
      String owners = ps.getString("ower" + stepId);
      String[] ownerArray = owners.split(";");
      int numb = ownerArray.length;
      String wfId = (String) transientVars
          .get(TransferFlowServiceImpl.PARM_WF_ID);
      System.out.println("ownerCont = " + numb);
      if (ps.getKeys().contains(wfId + stepId + "WFstepStatus") && numb > 1) {
        int cont = ps.getInt(wfId + stepId + "WFstepStatus");
        return cont == numb - 1;
      } else if (numb == 1) {
        return true;
      } else {
        return 1 == 2;
      }
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }

  }

}
