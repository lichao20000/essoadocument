package cn.flying.rest.service.workflow;

import java.util.Map;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.FunctionProvider;
import com.opensymphony.workflow.WorkflowException;

/***
 * 将会签状态初始化为0
 */
public class RemoveCountersignStepStatus implements FunctionProvider {

  @SuppressWarnings("rawtypes")
  public void execute(Map transientVars, Map args, PropertySet pSet)
      throws WorkflowException {
    System.out.println(" execute RemoveCountersignStepStatus...");
    String wfId = (String) transientVars.get("wfId");
    String stepId = args.get("step").toString();
    if (stepId.contains(";")) {// 回退到发起者时 可能会回退多步调用
      String[] stepIds = stepId.split(";");
      for (String item : stepIds) {
        if (pSet.getKeys().contains(wfId + item + "WFstepStatus")) {
          pSet.setInt(wfId + item + "WFstepStatus", 0);
        }
      }
    } else {// 回退到上一步 或 只回退一步时调用
      if (pSet.getKeys().contains(wfId + stepId + "WFstepStatus")) {
        pSet.setInt(wfId + stepId + "WFstepStatus", 0);
      }
    }
  }
}
