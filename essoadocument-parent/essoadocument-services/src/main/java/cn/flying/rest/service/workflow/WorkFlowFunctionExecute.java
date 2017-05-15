package cn.flying.rest.service.workflow;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.service.impl.TransferFlowServiceImpl;
import cn.flying.rest.service.utils.HttpRequester;
import cn.flying.rest.service.utils.HttpRespons;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.FunctionProvider;
import com.opensymphony.workflow.WorkflowException;

/**
 * @author xiaoxiong 20140527 工作流挂接方法默认执行类；所有的函数都自动调用此类
 */
public class WorkFlowFunctionExecute implements FunctionProvider {

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
  @Override
  public void execute(Map transientVars, Map args, PropertySet pSet)
      throws WorkflowException {
    /** 平台服务调度器-调用服务的重要接口 **/
    // IServiceProvider iServiceProvider = (IServiceProvider) transientVars
    // .get(TransferFlowServiceImpl.PLATFORM_SERVICEPROVIDER);
    String restFullClassName = args.get("restFullClassName").toString();
    String instanceId = (String) transientVars.get("instanceId");
    String exeFunction = args.get("exeFunction").toString();

    System.out.println(restFullClassName + "        " + exeFunction);

    String formId = transientVars.get(TransferFlowServiceImpl.PARM_FORM_ID)
        .toString();
    String userId = ((UserEntry) transientVars
        .get(TransferFlowServiceImpl.PARM_CURRENT_USER)).getUserid();
    String wfId = transientVars.get(TransferFlowServiceImpl.PARM_WF_ID)
        .toString();
    String stepId = transientVars.get(TransferFlowServiceImpl.PARM_WF_STEP_ID)
        .toString();
    String actionId = transientVars.get(
        TransferFlowServiceImpl.PARM_WF_ACTION_ID).toString();
    String wfModelId = transientVars.get(TransferFlowServiceImpl.PARM_WF_MODEL)
        .toString();

    System.out
        .println("  |     formId  :" + formId + "  |     userId  :" + userId
            + "  |     wfId  :" + wfId + "  |     stepId  :" + stepId
            + "  |     actionId  :" + actionId + "  |     wfModelId  :"
            + wfModelId);

    Map<String, String> postData = new HashMap<String, String>();
    postData.put("userId", userId);
    postData.put("formId", formId);
    postData.put("wfId", wfId);
    postData.put("stepId", stepId);
    postData.put("actionId", actionId);
    postData.put("wfModelId", wfModelId);

    // IdentificationWS identificationWS = iServiceProvider.findService(new
    // clazz(restFullClassName));

    HttpRequester reqest = new HttpRequester();
    /***************** 通过URL请求找到NameingService服务，之后取出类的地址 ****************/
    try {
      Properties prop = new Properties();
      prop.load(new FileInputStream(this.getConfigAddress()));
      String restUrl = prop.getProperty("flyingsoft.rest.namingservice.url");
      HttpRespons response = reqest.sendGet(restUrl + "/findService/"
          + instanceId + "/" + restFullClassName + "/*/*");
      /** 此处拼接最后的需要访问的服务还有方法 **/
      String excuteUrlAddress = response.getContent().toString()
          .replaceAll("\r", "").replaceAll("\n", "").replaceAll(" ", "").trim()
          + "/"
          + exeFunction
          + "/"
          + userId
          + "/"
          + formId
          + "/"
          + wfId
          + "/"
          + stepId + "/" + actionId + "/" + wfModelId;
      reqest.sendGet(excuteUrlAddress);
    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private String getConfigAddress() {
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    String path = classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "WEB-INF/conf/config.properties";
    return UPLOADED_FILE_PATH;
  }

  // public static void main(String[] args) {
  // HttpRequester reqest = new HttpRequester();
  // try {
  // HttpRespons response = reqest
  // .sendGet("http://168.168.169.8:6666/namingService/rest/namingService/findService/0/cn.flying.rest.restInterface.IdentificationWS/*/*");
  // System.out.println(response.getContent());
  // } catch (IOException e) {
  // e.printStackTrace();
  // }
  // }
}
