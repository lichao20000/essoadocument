package cn.flying.rest.service.impl;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Path;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ColumnListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang.StringUtils;
import org.dom4j.DocumentException;
import org.dom4j.io.SAXReader;
import org.jdom.Attribute;
import org.jdom.DocType;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;
import org.jdom.xpath.XPath;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import cn.flying.rest.admin.entity.EssMessage;
import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.ICollaborativeService;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IParticipatoryService;
import cn.flying.rest.service.IRoleService;
import cn.flying.rest.service.ITransferFlowService;
import cn.flying.rest.service.entiry.EssReport;
import cn.flying.rest.service.entiry.FormComboEntity;
import cn.flying.rest.service.entiry.FormComboValuesEntity;
import cn.flying.rest.service.entiry.Pair;
import cn.flying.rest.service.entiry.Participatory;
import cn.flying.rest.service.entiry.Role;
import cn.flying.rest.service.utils.Base64Util;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.ExportWFDataUtil;
import cn.flying.rest.service.utils.ImportWFDataUtil;
import cn.flying.rest.service.utils.ZipUtil;
import cn.flying.rest.service.workflow.JDBCTemplateWorkflowStore;
import cn.flying.rest.service.workflow.MySpringConfiguration;
import cn.flying.rest.service.workflow.MySpringWorkflowFactory;
import cn.flying.rest.utils.DateUtil;
import cn.flying.rest.utils.SimpleEncodeOrDecode;

import com.opensymphony.module.propertyset.PropertySet;
import com.opensymphony.workflow.FactoryException;
import com.opensymphony.workflow.InvalidActionException;
import com.opensymphony.workflow.InvalidEntryStateException;
import com.opensymphony.workflow.InvalidInputException;
import com.opensymphony.workflow.InvalidRoleException;
import com.opensymphony.workflow.StoreException;
import com.opensymphony.workflow.Workflow;
import com.opensymphony.workflow.WorkflowException;
import com.opensymphony.workflow.basic.BasicWorkflow;
import com.opensymphony.workflow.config.Configuration;
import com.opensymphony.workflow.spi.WorkflowEntry;
import com.opensymphony.workflow.spi.WorkflowStore;

/**
 * 工作流程管理模块
 * 
 * @author gengqianfeng
 * 
 */
@Path("transferFlow")
@Component
public class TransferFlowServiceImpl extends BasePlatformService implements
    ITransferFlowService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;

  private IParticipatoryService iParticipatoryService;

  @Resource(name = "osworkflowConfiguration")
  private Configuration wfConfiguration;

  private IFilingService iFilingService;

  private UserQueryService userQueryService;

  private IRoleService roleService;

  // private CacheWS cacheWS;

  private ICollaborativeService collaborativeService;

  private MessageWS messageWS;

  private IFilingService filingService;

  public static final String PARM_FORM_ID = "formId";

  public static final String PARM_WF_IDNTIFIER = "wfIdentifier";

  public static final String PARM_FORM_JS = "formJs";

  public static final String PARM_WF_MODEL = "wfModel";

  public static final String PARM_WF_ID = "wfId";

  public static final String PARM_WF_STEP_ID = "wfStepId";

  public static final String PARM_WF_ACTION_ID = "wfActionId";

  public static final String PARM_CURRENT_USER = "currentUser";

  public static final String PLATFORM_SERVICEPROVIDER = "platformSerciceProvider";

  public static final String workflowstatus_run = "Run";

  private static final String xmlHeader = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

  private static final String dataHeader = "<data>";

  private static final String dataFooter = "</data>";

  private String dir = null;

  @Value("${app.InstanceId}")
  private String instanceId;

  private String _upLoadFile(FileItem file, String exportFilePath) {
    String fileName = file.getName();
    if (fileName.lastIndexOf("\\") > 0) {
      fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
    }
    String fileFullPath = exportFilePath + fileName;
    try {
      File dir = new File(exportFilePath);
      if (!dir.exists()) {
        dir.mkdirs();
      }
      InputStream fileIn = null;
      FileOutputStream fileOut = null;
      fileIn = file.getInputStream();
      fileOut = new FileOutputStream(fileFullPath);
      int len = 0;
      byte[] buffer = new byte[8192];
      while ((len = fileIn.read(buffer, 0, 8192)) != -1) {
        fileOut.write(buffer, 0, len);
      }
      fileOut.close();
      fileIn.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return fileFullPath;
  }

  @Override
  public Map<String, Object> actionCheckMethodNew(Map<String, Object> map) {
    String checks = "";
    String action_message = "请您审批";
    List<Map<String, String>> sourceList = new ArrayList<Map<String, String>>();
    List<Map<String, String>> returnDataList = new ArrayList<Map<String, String>>();
    int isNoticeCaller = 0;
    int isValidateForm = 1;
    int isSendMessage = 1;
    int isSendEmail = 0;
    Map<String, Object> sfaction = this.getActionByFlowAndAction(
        Long.parseLong(map.get("modelId").toString()),
        Long.parseLong(map.get("actionId").toString()));
    if (sfaction != null) {
      checks = this.checkIfNull(sfaction.get("postfunction"), checks);
      action_message = this.checkIfNull(sfaction.get("action_message"),
          action_message);
      isNoticeCaller = Integer.parseInt(this.checkIfNull(
          sfaction.get("is_notice_caller"), isNoticeCaller + ""));
      isSendMessage = Integer.parseInt(this.checkIfNull(
          sfaction.get("is_message"), isSendMessage + ""));
      isValidateForm = Integer.parseInt(this.checkIfNull(
          sfaction.get("is_validate_form"), isValidateForm + ""));
      isSendEmail = Integer.parseInt(this.checkIfNull(sfaction.get("is_email"),
          isSendEmail + ""));
    }
    Map<String, Object> flow = this.getModelInit(Long.parseLong(map.get(
        "modelId").toString()));
    String form_relation = "";
    if (flow != null) {
      form_relation = this
          .checkIfNull(flow.get("form_relation"), form_relation);
    }
    List<Map<String, Object>> maps = this.getFunctionByStageId(form_relation
        .substring(5));
    if (null != checks && !checks.trim().equals("") && !checks.equals("null")) {
      String[] todata = checks.split(",");
      for (String str : todata) {
        if (null == str || "".equals(str)) {
          continue;
        }
        returnDataList.add(this.getSourceList(
            this.getFunctionById(Long.parseLong(str)), str));
      }
      for (Map<String, Object> mp : maps) {
        String id = mp.get("id").toString();
        boolean isToData = false;
        for (String str : checks.split(",")) {
          if (id.equals(str)) {
            isToData = true;
          }
        }
        if (!isToData) {
          sourceList.add(this.getSourceList(mp, ""));
        }
      }
    } else {
      for (Map<String, Object> mp : maps) {
        sourceList.add(this.getSourceList(mp, ""));
      }
    }
    Map<String, Object> json = new HashMap<String, Object>();
    json.put("actionIsSaved", null == sfaction ? "0" : "1");
    json.put("action_message", action_message);
    json.put("isNoticeCaller", isNoticeCaller);
    json.put("isValidateForm", isValidateForm);
    json.put("isSendMessage", isSendMessage);
    json.put("isSendEmail", isSendEmail);
    json.put("process_time", sfaction.get("process_time"));
    json.put("returndata", returnDataList);
    json.put("source", sourceList);
    return json;
  }

  private String addAction(Map<String, Object> action) {
    String sql = "insert into ess_transferaction(step_id,name,`condition`, postfunction,flow_id,action_id,is_email,is_message,action_message,notice_users,notice_roles,is_notice_caller,is_validate_form,process_time) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
    try {
      Long id = query
          .insert(
              sql,
              new ScalarHandler<Long>(),
              new Object[] {
                  action.get("step_id"),
                  action.get("name"),
                  action.get("condition"),
                  action.get("postfunction"),
                  action.get("flow_id"),
                  action.get("action_id"),
                  Integer.parseInt(this.checkIfNull(action.get("is_email"), "0")),
                  Integer.parseInt(this.checkIfNull(action.get("is_message"),
                      "1")),
                  action.get("action_message"),
                  action.get("notice_users"),
                  action.get("notice_roles"),
                  Integer.parseInt(this.checkIfNull(
                      action.get("is_notice_caller"), "0")),
                  Integer.parseInt(this.checkIfNull(
                      action.get("is_validate_form"), "0")),
                  Integer.parseInt(this.checkIfNull(action.get("process_time"),
                      "0")) });
      if (id == null || id <= 0) {
        return "保存动作失败";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存动作失败";
    }
  }

  public FormComboEntity addCombo(FormComboEntity combo) {
    String identifier = combo.getIdentifier();
    if (null != this.getComboEntityByIdentifier(identifier))
      return null;
    String sql = "insert into ess_formbuildercombo values(?,?,?,?,?,?)";
    try {
      Long id = query.insert(
          sql,
          new ScalarHandler<Long>(),
          new Object[] { combo.getId(), combo.getIdentifier(),
              combo.getComboValue(), combo.getEstype(), combo.getDataUrl(),
              combo.getDescride() });
      if (id != null) {
        combo.setId(id);
        return combo;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return null;
  }

  public FormComboValuesEntity addComboValue(FormComboValuesEntity comboV) {
    String sql = "insert into ess_formbuildercombovalues values(?,?,?,?)";
    try {
      Long id = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
          comboV.getId(), comboV.getPropertyValue(), comboV.getTextValue(),
          comboV.getComboID() });
      if (id != null) {
        comboV.setId(id);
        return comboV;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return null;
  }

  @Override
  public Map<String, Object> addFun(Map<String, Object> function) {
    String sql_query = "select count(id) from ess_transferfunctions where id=? ";
    String sql_add = "insert into ess_transferfunctions(functionName,restFullClassName,exeFunction,description,relationBusiness,stageId) values(?,?,?,?,?,?) ";
    String sql_edit = "update ess_transferfunctions set functionName=? ,restFullClassName=? ,exeFunction=? ,description=? ,relationBusiness=? ,stageId=?  where id=? ";
    try {
      Long cnt = query.query(sql_query, new ScalarHandler<Long>(),
          new Object[] { function.get("id") });
      if (cnt != null && cnt > 0) {
        int row = query.update(
            sql_edit,
            new Object[] { function.get("functionName"),
                function.get("restFullClassName"), function.get("exeFunction"),
                function.get("description"), function.get("relationBusiness"),
                function.get("stageId"), function.get("id") });
        if (row > 0) {
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", function.get("ip"));
          log.put("userid", function.get("userId"));
          log.put("module", "定制文件流转流程");
          log.put("operate", "定制文件流转流程：修改流程调用函数");
          log.put("loginfo", "修改标识为【" + function.get("stageId")
              + "】的流程调用函数,接口名：" + function.get("restFullClassName") + ","
              + "执行方法为：" + function.get("exeFunction"));
          this.getLogService().saveLog(log);

          return function;
        }
      } else {
        Long id = query.insert(
            sql_add,
            new ScalarHandler<Long>(),
            new Object[] { function.get("functionName"),
                function.get("restFullClassName"), function.get("exeFunction"),
                function.get("description"), function.get("relationBusiness"),
                function.get("stageId") });
        if (id != null) {
          function.put("id", id);

          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", function.get("ip"));
          log.put("userid", function.get("userId"));
          log.put("module", "定制文件流转流程");
          log.put("operate", "定制文件流转流程：添加流程调用函数");
          log.put(
              "loginfo",
              "为【" + function.get("stageId") + "】添加调用函数:"
                  + function.get("functionName") + "," + "接口名："
                  + function.get("restFullClassName") + "," + "执行方法为："
                  + function.get("exeFunction"));
          this.getLogService().saveLog(log);
          return function;
        }
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> addType(Map<String, Object> type) {
    String sql = "insert into ess_transferflow_type(pId,name) values(?,?)";
    try {
      long id = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
          type.get("pId"), type.get("name") });
      if (id != 0) {
        type.put("id", id);

        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", type.get("ip"));
        log.put("userid", type.get("userId"));
        log.put("module", "定制文件流转流程");
        log.put("operate", "定制文件流转流程：添加定制流转流程的类型");
        log.put("loginfo", "添加【" + type.get("name") + "】定制流程的类型");
        this.getLogService().saveLog(log);
      }
      return type;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean addWfForward(long userId, long forwardUserId, long forwardId) {
    try {
      String sql = "INSERT INTO ess_transferform_user_forward ( user_id, forward_id,forward_user_id) VALUES(?,?,?)";
      Object id = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
          userId, forwardId, forwardUserId });
      if (id != null) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @SuppressWarnings({ "unchecked", "rawtypes", "deprecation" })
  @Override
  public Map<String, Object> auditingWorkflow(Map<String, Object> params) {
    Map<String, Object> json = new HashMap<String, Object>();
    String selectUsers = params.get("selectUsers").toString();
    String wfId = params.get("wfId").toString();
    String stepId = params.get("stepId").toString();
    String formId = params.get("formId").toString();
    String dataId = params.get("dataId").toString();
    String userId = params.get("userId").toString();
    String remoteAddr = params.get("remoteAddr").toString();

    Map formmap = new HashMap<String, String>();
    String stageId = this.getCollaborativeService()
        .getStageIdByDocId(Long.parseLong(dataId)).get("id").toString();
    List<Map<String, Object>> list = this.getFilingService().findMoveCols(2,
        this.getFilingService().getParentStageIds(Long.parseLong(stageId)));
    for (Map<String, Object> ofe : list) {
      String code = ofe.get("code").toString();
      String value = params.get(code).toString();
      if (null == value)
        value = "";
      formmap.put(code, value);
    }
    this.updateESFFormValue(Long.parseLong(dataId), formmap);

    Workflow wf = this.getWorkflow(userId);
    String caller = wf.getPropertySet(Long.parseLong(wfId)).getString("caller");
    String actionId = params.get("actionId").toString();
    String wfModelId = params.get("flowId").toString();
    Map<String, Object> owf = this.getModelInit(Long.parseLong(wfModelId));
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    try {
      /** 判断当是回退到上一步时 从库中获取当前步骤上一步的处理人 进而实现回退 **/
      if (Integer.parseInt(actionId) > 200000) {
        selectUsers = this.getWfPreStepDealedUsers(wfId, stepId);
      }
      Map<String, Object> parmMap = this.getWorkflowStepParms(false, wfModelId,
          formId, user, Long.parseLong(wfId), selectUsers, actionId, stepId);
      parmMap.put("IP", remoteAddr);
      this.doAction(userId, Long.parseLong(wfId), Integer.parseInt(actionId),
          parmMap);
      Map<String, Object> currentStepEntity = this.getStepUser(
          Long.parseLong(wfModelId), Long.parseLong(stepId));
      int isCountersign = currentStepEntity.get("is_countersign") == null ? 0
          : Integer
              .parseInt(currentStepEntity.get("is_countersign").toString());
      if (isCountersign == 0) {
        getMessageWS().editMessageWorkFlowStatusByWorkFlowId(
            Long.parseLong(wfId), Long.parseLong(stepId));
        this.changWorkFlowState(null, Long.parseLong(wfId), null, "0", stepId);
      } else {
        getMessageWS().editMessageWorkFlowStatusByWorkFlowId(
            Long.parseLong(wfId), Long.parseLong(stepId), userId);
        this.changWorkFlowState(null, Long.parseLong(wfId), userId, "0", stepId);
      }
      this.setNoticeUsersForWf(user, owf.get("identifier").toString(),
          wfModelId, actionId, dataId, wfId, formId, params.get("userFormId")
              .toString());
      if (this.getCurrentStepIsChange(Long.parseLong(wfId)) == 0) {
        Map<String, Object> othercollEntity = new HashMap<String, Object>();
        othercollEntity.put("workflowtype", "3"); // 类型为协同
        othercollEntity.put("state", "1");
        othercollEntity.put("userformId", params.get("userFormId"));
        othercollEntity.put("stepId", stepId);
        this.saveCollaborativeEntity(Long.parseLong(wfId), othercollEntity);
      }
      /****** 判断当前流程的当前步骤是否需要发送邮件 并获取没有邮件的下一步处理人的集合 *****/
      StringBuffer buffer = new StringBuffer();
      Map<String, Object> action = this.getActionByFlowAndAction(
          Long.parseLong(wfModelId), Long.parseLong(actionId));
      if (action != null) {
        String isMail = this.checkIfNull(action.get("is_email"), "");
        int esIsMail = !"".equals(isMail) ? Integer.parseInt(isMail) : 0;
        if (esIsMail == 1) {
          if (null != selectUsers && !selectUsers.equals("")) {
            String[] splitSteps = selectUsers.split("-");
            for (int m = 0; m < splitSteps.length; m++) {
              System.out.println(splitSteps[m]);
              String[] users = splitSteps[m].split(":");
              String[] nextOwner = users[1].split(";");
              for (int i = 0; i < nextOwner.length; i++) {
                UserEntry tempUser = getUserQueryService().getUserInfoById(
                    nextOwner[i]);
                String email = tempUser.getEmailAddress();
                if (email == null || "".equals(email)) {
                  buffer.append(tempUser.getDisplayName()).append("、");
                  System.out.println(tempUser.getDisplayName()
                      + "没有输入邮箱地址，邮件发送失败！");
                } else {
                  // 发送邮件
                  // SimpleMailSender.sendEmail(email, "", "text");
                }
              }
            }
          }
        }
      }
      json.put(
          "message",
          (buffer.length() > 0 ? ("<br>但是【"
              + buffer.deleteCharAt(buffer.length() - 1) + "】没有输入邮箱地址，邮件发送失败！")
              : ""));
      json.put("success", true);
    } catch (Exception e) {// 异常处理
      e.printStackTrace();
      this.killWorkflow(Long.parseLong(wfId));
      getMessageWS().editMessageWorkFlowStatusByWorkFlowId(
          Long.parseLong(wfId), Long.parseLong(stepId));
      this.updateWfState(wfId);
      String exceptionText = "【" + user.getDisplayName()
          + "】审批出现异常，此流程已被终止，请联系系统管理员。<br>工作流ID为:" + wfId + ",步骤ID为：" + stepId;
      EssMessage message = new EssMessage();
      message.setSender(userId);
      message.setRecevier(caller);
      message.setContent(SimpleEncodeOrDecode.simpleEncode("审核出现异常，流程被终止！"));
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      message.setSendTime(sdf.format(new Date()));
      message.setStatus(workflowstatus_run);
      message.setWorkFlowId(0);
      message.setWorkFlowStatus(workflowstatus_run);
      message.setStepId(0);
      /** xiaoxiong 20140710 给消息表添加handler（消息处理函数可执行串）、handlerUrl（消息处理界面地址） **/
      message.setHandler("Show_WfExceptionWind('" + wfId + "','" + stepId
          + "','" + exceptionText + "')");
      message.setHandlerUrl("esdocument/" + this.instanceId
          + "/x/ESMessage/handlerMsgPage");
      getMessageWS().addEssMessage(message);
      json.put("success", false);
    }
    return json;
  }

  private long getCurrentStepIsChange(long wfId) {
    String sql = "select oc.STEP_ID=oh.STEP_ID from os_currentstep as oc LEFT JOIN os_currentstep_prev as cp ON oc.ID=cp.ID LEFT JOIN os_historystep as oh ON cp.PREVIOUS_ID=oh.ID WHERE oc.ENTRY_ID=? ";
    try {
      // 1表示步骤未下一步移动，0表示移动
      List<Map<String, Object>> list = this.getCollaborativeService()
          .getCurrentByWfId(wfId);
      if (list.size() > 0 && list != null) {
        long flag = query.query(sql, new ScalarHandler<Long>(), wfId);
        if (flag == 0 || flag == 1) {
          return flag;
        }
      } else {
        return 1;// 最后一步，无需插入待办数据
      }
      return 0;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  private void autoPublishEnabledWorkFlows() {
    System.out.println("正在发布工作流");
    long keystart = System.currentTimeMillis();
    List<Map<String, Object>> models = this.findTransferList(0, 0, -1, null);
    if (null != models && !models.isEmpty()) {
      for (Map<String, Object> owm : models) {
        if (null != owm.get("status")
            && "1".equals(owm.get("status").toString())) {
          String msg = this.generateWfXml(owm);
          if (!msg.contains("发布成功!")) {
            System.out.println(owm.get("name") + "发布失败!");
          }
        }
      }
    }
    System.out.println("发布工作流所花时间: " + (System.currentTimeMillis() - keystart)
        + "毫秒");
  }

  private boolean canInitialize(String user, String workflowName,
      int initialAction, @SuppressWarnings("rawtypes") Map inputs) {
    return getWorkflow(user).canInitialize(workflowName, initialAction, inputs);
  }

  // @Override
  // public boolean alterEspFlowForm(Long stageId) {
  // List<Map<String, Object>> fields = this.getIFilingService().findMoveCols(0,
  // stageId.toString());
  // boolean result = false;
  // if (this.tableIfExists(stageId.toString())) {
  // // 修改结构表
  // List<Map<String, Object>> exists_fields = this.getTableFields(stageId
  // .toString());
  // for (int i = 0; i < fields.size(); i++) {
  // Map<String, Object> field = fields.get(i);
  // int noExists = exists_fields.size();
  // String type = JdbcUtil.getColumnType(
  // VALUETYPES.TYPE.valueOf(field.get("type").toString()),
  // field.get("length").toString(), field.get("dotLength").toString());
  // String df = "0".equals(field.get("isNull").toString()) ? " DEFAULT NULL "
  // : (field.get("defaultValue") == null || "".equals(field.get(
  // "defaultValue").toString())) ? " NOT NULL " : " DEFAULT "
  // + field.get("defaultValue").toString();
  // for (int j = 0; j < exists_fields.size(); j++) {
  // // 修改字段來自fields
  // Map<String, Object> exists_field = exists_fields.get(j);
  // if (exists_field.get("COLUMN_NAME").equals(field.get("code"))) {
  // if (!exists_field.get("COLUMN_TYPE").toString().equals(type)
  // || !exists_field.get("COLUMN_DEFAULT").equals(
  // field.get("defaultValue"))) {
  // String update_column = "alter table esp_" + stageId
  // + "_form MODIFY column " + field.get("code") + " " + type
  // + " " + df;
  // result = JdbcUtil.update(query, update_column);
  // }
  // exists_fields.remove(j);
  // j--;
  // }
  // }
  // if (noExists == exists_fields.size()) {
  // // 添加字段來自fields
  // String add_column = "alter table esp_" + stageId
  // + "_form add column " + field.get("code") + " " + type + " " + df;
  // result = JdbcUtil.update(query, add_column);
  // }
  // }
  // if (exists_fields.size() != 0) {
  // // 删除字段來自exists_fields
  // for (Map<String, Object> map : exists_fields) {
  // String delete_column = "alter table esp_" + stageId
  // + "_form drop column " + map.get("COLUMN_NAME");
  // result = JdbcUtil.update(query, delete_column);
  // }
  // }
  // } else {
  // // 创建结构表
  // StringBuilder esp_n = new StringBuilder();
  // esp_n.append(" create table if not exists  esp_" + stageId + "_form (");
  // esp_n.append(" id int(11) NOT NULL AUTO_INCREMENT, ");
  // esp_n.append(" flowId int(11),");
  // for (int i = 0; i < fields.size(); i++) {
  // Map<String, Object> field = fields.get(i);
  // String df = "0".equals(field.get("isNull").toString()) ? " DEFAULT NULL "
  // : (field.get("defaultValue") == null || "".equals(field.get(
  // "defaultValue").toString())) ? " NOT NULL " : " DEFAULT "
  // + field.get("defaultValue").toString();
  // esp_n.append(" "
  // + field.get("code")
  // + " "
  // + JdbcUtil.getColumnType(VALUETYPES.TYPE.valueOf(field.get("type")
  // .toString()), field.get("length").toString(),
  // field.get("dotLength").toString()) + df + ",");
  // }
  // esp_n.append(" PRIMARY KEY (id), ");
  // esp_n.append(" CONSTRAINT `PK_ESP_" + stageId + "_FLOW_ID` ");
  // esp_n
  // .append(" FOREIGN KEY (`flowId`) REFERENCES `ess_transferflow` (`id`) ");
  // esp_n.append(" ON DELETE CASCADE ON UPDATE CASCADE");
  // esp_n.append(") ENGINE=InnoDB DEFAULT CHARSET=utf8");
  // result = JdbcUtil.update(query, esp_n.toString());// 暂不创建模拟序列
  // }
  // return result;
  // }

  private List<Role> changeMap2Role(List<Map<String, Object>> roleList) {
    List<Role> roles = new ArrayList<Role>();
    for (Map<String, Object> map : roleList) {
      Role tRole = new Role();
      tRole.setId(map.get("id").toString());
      tRole.setRoleId(map.get("roleId").toString());
      tRole.setRoleName(map.get("roleName").toString());
      tRole.setRoleRemark(map.get("roleRemark").toString());
      tRole.setCreateTime(map.get("createTime").toString());
      tRole.setUpdateTime(map.get("updateTime").toString());
      tRole.setIsSystem(map.get("isSystem").toString());
      roles.add(tRole);
    }
    return roles;
  }

  private UserEntry changeMap2User(Map<String, Object> map) {
    UserEntry ue = new UserEntry(this.checkIfNull(map.get("userid"), ""),
        this.checkIfNull(map.get("firstName"), ""), this.checkIfNull(
            map.get("lastName"), ""), Integer.parseInt(map.get("orgCode")
            .toString()), this.checkIfNull(map.get("mainSite"), ""),
        Integer.parseInt(map.get("userStatus").toString()), this.checkIfNull(
            map.get("mobTel"), ""), this.checkIfNull(map.get("emailAddress"),
            ""), this.checkIfNull(map.get("deptCode"), ""), this.checkIfNull(
            map.get("shengName"), ""),
        this.checkIfNull(map.get("password"), ""));
    ue.setId(Integer.parseInt(map.get("id").toString()));
    return ue;
  }

  private boolean changWorkFlowState(Long userformID, Long wfid,
      String username, String state, String stepID) {
    if (wfid != null && wfid > 0) {
      Map<String, Object> userForm = this.getCollaborativeService()
          .getUserformByWfId(wfid);
      userformID = Long.parseLong(userForm.get("id").toString());
    }
    String sql = "";
    if (state.equals("0")) {
      sql = "update ess_collaborativemanage set state = ?,audit_time = ? where userformid = ? ";
    } else {
      sql = "update ess_collaborativemanage set state = ? where userformid = ? ";
    }
    if (null != username && !"".equals(username))
      sql += " and owner ='" + username + "' ";
    if (null != stepID && !"".equals(stepID))
      sql += " and stepid = " + stepID;
    sql += " and state !='" + state + "'";
    try {
      int row = 0;
      if (state.equals("0")) {
        SimpleDateFormat sdfmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String auditTime = sdfmt.format(new Date());
        row = query.update(sql, new Object[] { state, auditTime, userformID });
      } else {
        row = query.update(sql, new Object[] { state, userformID });
      }
      if (row > 0) {
        return true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return false;
  }

  private String checkIfNull(Object obj, String value) {
    if (obj != null) {
      return obj.toString();
    }
    return value;
  }

  @Override
  public Map<String, Object> commit_opinion(Map<String, Object> map) {
    Map<String, Object> json = new HashMap<String, Object>();
    String opinionStr = map.get("opinionStr").toString();
    String fileAppendixNames = map.get("fileAppendixNames").toString();
    String fileAppendixPaths = map.get("fileAppendixPaths").toString();
    String stepId = map.get("stepId").toString();
    String wfId = map.get("wfId").toString();
    String userId = map.get("userId").toString();
    String userFormActionName = this.checkIfNull(map.get("userFormActionName"),
        "");
    SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd    HH:mm:ss");// 设置日期格式

    // 保存意见
    Map<String, Object> flowOpinion = new HashMap<String, Object>();
    Long newOpinionid = this.getOpioionPrimaryKey();
    if ("".equals(userFormActionName)) {
      userFormActionName = "审批意见";
      flowOpinion.put("content", opinionStr);
    } else {
      flowOpinion.put("content", userFormActionName + "。" + opinionStr);
    }
    flowOpinion.put("id", newOpinionid);
    flowOpinion.put("user_name", userId);
    flowOpinion.put("wf_id", wfId);
    flowOpinion.put("wf_step_id", stepId);
    flowOpinion.put("time", userFormActionName + " " + df.format(new Date()));
    flowOpinion.put("parentid", null);
    flowOpinion.put("forwarduserid", null);
    this.saveWorkFlowOpinion(flowOpinion);

    // 保存意见附件
    if (!"".equals(fileAppendixNames)) {
      String[] fileAppendexNameArray = fileAppendixNames.split("\\|");
      String[] fileAppendexPathArray = fileAppendixPaths.split("\\|");
      Long newid = this.getNewAppendIxID();
      List<Map<String, Object>> fileAppendexList = new ArrayList<Map<String, Object>>();
      for (int j = 0; j < fileAppendexNameArray.length; j++) {
        Map<String, Object> oa = new HashMap<String, Object>();
        oa.put("fileName", fileAppendexNameArray[j]);
        oa.put("dataId", fileAppendexPathArray[j]);
        oa.put("fileSize", 0);
        oa.put("userName", userId);
        oa.put("type", "opinion");
        oa.put("wf_id", wfId);
        oa.put("wf_step_id", stepId);
        oa.put("id", newid);
        newid++;
        fileAppendexList.add(oa);
      }
      this.saveAppendix(fileAppendexList, newOpinionid);
    }

    json.put("success", "true");
    return json;
  }

  private Map<String, String> conditionFields2Map(String conditionFields,
      String splitArray, String split) {
    Map<String, String> map = new HashMap<String, String>();
    String[] lines = conditionFields.split(splitArray);
    if (lines != null && lines.length > 0) {
      for (int i = 0; i < lines.length; i++) {
        String[] fields = lines[i].split(split);
        if (fields != null && fields.length > 0) {
          for (String field : fields) {
            String[] strs = field.split("=");
            if (strs.length == 2) {
              map.put(strs[0] + i, strs[1]);
            } else {
              map.put(strs[0] + i, "");
            }
          }
        }
      }
    }
    return map;
  }

  @Override
  public String copyWorkflow(Map<String, Object> flow) {
    String sql = "select id,name from ess_transferflow where name  LIKE ? AND name NOT LIKE ? order by id desc ";
    String modelId = flow.get("modelId").toString();
    String workflowName = flow.get("workflowName").toString();
    Map<String, Object> copyFlow = new HashMap<String, Object>();
    String esIdentifier = "workflow" + System.currentTimeMillis();
    copyFlow.put("identifier", esIdentifier);
    StringBuffer flowName = new StringBuffer(128);
    try {
      List<Map<String, Object>> flowList = null;
      flowList = query.query(sql, new MapListHandler(), new Object[] {
          workflowName + "-%", workflowName + "-%-%" });
      if (flowList != null && !flowList.isEmpty()) {
        int num = 1;
        for (Map<String, Object> item : flowList) {
          String firstObjName = item.get("name").toString();
          firstObjName = firstObjName
              .substring(firstObjName.lastIndexOf("-") + 1);
          String no = firstObjName.substring(2);
          String regex = "^[0-9]+$";
          Pattern pattern = Pattern.compile(regex);
          if (pattern.matcher(no).matches()) {
            int tempNum = Integer.parseInt(no);
            if (tempNum >= num) {
              num = tempNum + 1;
            }
          }
        }
        flowName.append(workflowName).append("-副本").append(num);
      } else {
        flowName.append(workflowName).append("-副本1");
      }
      if (flowName.toString().getBytes().length > 128) {
        return "复制后工作流名称超长,请将源工作流名称缩短后再进行操作!";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
    Map<String, Object> oldFlow = this.getModelInit(Long.parseLong(modelId));
    copyFlow.put("name", flowName.toString());
    copyFlow.put("describtion", oldFlow.get("describtion").toString());
    copyFlow.put("creater", flow.get("userId").toString());
    copyFlow.put("version", 1);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    copyFlow.put("createtime", sdf.format(new Date()));
    copyFlow.put("form_relation", oldFlow.get("form_relation"));
    copyFlow.put("relation_table", oldFlow.get("relation_table"));
    copyFlow.put("status", 0);
    copyFlow.put("first_step_users",
        this.checkIfNull(oldFlow.get("first_step_users"), ""));
    copyFlow.put("first_step_roles",
        this.checkIfNull(oldFlow.get("first_step_roles"), ""));
    copyFlow.put("type_id", oldFlow.get("type_id").toString());
    copyFlow.put("graphXml", oldFlow.get("graphXml").toString());
    copyFlow.put("flowGraph", oldFlow.get("flowGraph").toString());
    copyFlow.put("business_relation", oldFlow.get("business_relation"));
    Map<String, Object> WF_flow = this.saveOsWfModel(copyFlow);
    if (WF_flow == null) {
      return "工作流模板复制失败！";
    } else {
      Map<String, Object> form = this.getFormById(WF_flow.get("form_relation")
          .toString());
      form.put("flow_id", WF_flow.get("id").toString());
      form.put("status", "1");
      this.saveForm(form);
    }
    return "";
  }

  private String createSetCondition(Map<String, Object> map) {
    String conditionCount = map.get("conditionCount").toString();
    if (null == conditionCount)
      return "";
    if ("".equals(conditionCount.trim()) || "0".equals(conditionCount.trim()))
      return "";
    int condCount = Integer.parseInt(conditionCount);
    StringBuffer out = new StringBuffer("");
    int checkCount = 1;
    out.append("(");
    for (int i = 0; i < condCount; i++) {
      String sf = this.checkIfNull(map.get("fieldName" + i), "");
      if ("".equals(sf)) {
        checkCount++;
        continue;
      }
      sf = sf.trim();
      String value = this.checkIfNull(map.get("hiddenvalue" + i), "");
      if (value.equals(""))
        continue;
      String compare = this.checkIfNull(map.get("compare" + i), "");
      if ("like".equals(compare) || "notLike".equals(compare)) {
        value = "%" + value + "%";
      }
      Object relation = map.get("relation" + (i - checkCount));
      checkCount = 1;
      if (relation != null && !"".equals(relation.toString().trim())) {
        out.append(this.getSignByDesc(relation.toString().trim()))
            .append("&|&");
      }
      Object leftBrackets = map.get("leftBracketsName" + i);
      if (leftBrackets != null && !"".equals(leftBrackets.toString().trim()))
        out.append(leftBrackets.toString().trim()).append("&|&");
      else
        out.append(" ").append("&|&");
      out.append(this.getSignByDesc(sf) + "&|&")
          .append(this.getSignByDesc(compare) + "&|&").append(value)
          .append("&|&");
      Object rightBrackets = map.get("rightBracketsName" + i);
      if (rightBrackets != null && !"".equals(rightBrackets.toString().trim()))
        out.append(rightBrackets.toString().trim()).append("&|&");
      else
        out.append(" ").append("&|&");
    }
    out.append(")");
    if (out.length() < 3)
      return "";
    return out.toString();
  }

  private String createSetConditionNew(Map<String, Object> map) {
    String conditionCount = this.checkIfNull(map.get("conditionCount"), "");
    String conditionFields = this.checkIfNull(map.get("conditionFields"), "");
    try {
      conditionFields = URLDecoder.decode(conditionFields, "utf-8");
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    String split = map.get("split").toString();
    String splitArray = map.get("splitArray").toString();
    if ("".equals(conditionCount.trim()) || "0".equals(conditionCount.trim()))
      return "";
    int condCount = Integer.parseInt(conditionCount);
    StringBuffer out = new StringBuffer("");
    int checkCount = 1;
    Map<String, String> fieldMap = conditionFields2Map(conditionFields,
        splitArray, split);
    out.append("(");
    for (int i = 0; i < condCount; i++) {
      String sf = fieldMap.get("fieldName" + i);
      if (null == sf || "".equals(sf)) {
        checkCount++;
        continue;
      }
      sf = sf.trim();
      String value = this.checkIfNull(fieldMap.get("hiddenvalue" + i), "");
      if (value.equals(""))
        continue;
      String compare = this.checkIfNull(map.get("compare" + i), "");
      if ("like".equals(compare) || "notLike".equals(compare)) {
        value = "%" + value + "%";
      }
      String relation = fieldMap.get("relation" + (i - checkCount));
      checkCount = 1;
      if (relation != null && !relation.trim().equals("")) {
        out.append(this.getSignByDesc(relation)).append("&|&");
      }
      String leftBrackets = fieldMap.get("leftBracketsName" + i);
      if (leftBrackets != null && !"".equals(leftBrackets.trim()))
        out.append(leftBrackets.trim()).append("&|&");
      else
        out.append(" ").append("&|&");
      out.append(this.getSignByDesc(sf) + "&|&")
          .append(this.getSignByDesc(compare) + "&|&").append(value)
          .append("&|&");
      String rightBrackets = fieldMap.get("rightBracketsName" + i);
      if (rightBrackets != null && !"".equals(rightBrackets.trim()))
        out.append(rightBrackets.trim()).append("&|&");
      else
        out.append(" ").append("&|&");
    }
    out.append(")");
    if (out.length() < 3)
      return "";
    return out.toString();
  }

  @Override
  public Map<String, String> deleteCellfromDB(Map<String, Object> flow) {
    Map<String, String> json = new HashMap<String, String>();
    String modelID = flow.get("modelID").toString();
    if (null == modelID || "".equals(modelID)) {
      json.put("check", "false");
      json.put("msg", "删除失败！请尝试先设置开始节点再继续此操作！");
      json.put("msgType", "2");
      return json;
    }
    Long modelid = Long.parseLong(modelID);
    String edges = flow.get("edges").toString();
    String others = flow.get("others").toString();
    if (null != edges && edges.length() > 1) {
      String tempedges[] = edges.substring(1).split(",");
      for (String oneAction : tempedges) {
        // 删除动作之前删除为动作设置的参数
        Map<String, Object> parameter = new HashMap<String, Object>();
        parameter.put("actionId", oneAction);
        parameter.put("flowId", modelid);
        this.delFunctionParameter(parameter);
        Map<String, String> action = new HashMap<String, String>();
        action.put("flow_id", modelID);
        action.put("action_id", oneAction);
        this.removeOsWfActionForCond(action);
      }
    }
    if (null != others && others.length() > 1) {
      String tempothers[] = others.substring(1).split(",");
      for (String oneStep : tempothers) {
        Map<String, String> step = new HashMap<String, String>();
        step.put("flow_id", modelID);
        step.put("step_id", oneStep);
        this.removeOsWfStepForCond(step);
      }
    }
    json.put("check", "true");
    json.put("msg", "删除成功！");
    json.put("msgType", "1");
    return json;
  }

  private void deleteDir(File dir) {
    if (dir == null || !dir.exists() || !dir.isDirectory()) {
      return;
    }
    for (File file : dir.listFiles()) {
      if (file.isFile()) {
        file.delete();
      } else if (file.isDirectory()) {
        deleteDir(file);
      }
    }
    dir.delete();
  }

  private void deleteESSOA_WORKFLOW_XML(String wfIdentifier) {
    SAXBuilder saxBuilder = new SAXBuilder();
    try {
      Document doc = saxBuilder.build(new File(getBaseDir()
          + "ESSOA_WORKFLOWS.xml"));
      Element newElement = new Element("workflow");
      newElement.setAttribute("name", wfIdentifier);
      newElement.setAttribute("type", "file");
      newElement.setAttribute("location", wfIdentifier + ".xml");
      Element root = doc.getRootElement();
      @SuppressWarnings("unchecked")
      List<Element> list = root.getChildren();
      boolean bool = false;
      for (Element e : list) {
        if (e.getAttribute("name").getValue().equals(wfIdentifier)) {
          bool = true;
          break;
        }
      }
      if (bool) {
        doc.removeContent(newElement);
        XMLOutputter out = new XMLOutputter();
        out.output(doc, new FileOutputStream(new File(getBaseDir()
            + "ESSOA_WORKFLOWS.xml")));
        new File(getBaseDir() + wfIdentifier + ".xml").delete();
      }
    } catch (JDOMException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private boolean deleteOpinion(long id) {
    String sql = "delete from ess_transferform_opinion where id=? ";
    try {
      int row = query.update(sql, new Object[] { id });
      if (row == 1) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean deleteOpinionAppendixRelation(long opinion_id,
      long appendix_id) {
    String sql = "delete from ess_opinion_appendix_relation where opinion_id=? and appendix_id=? ";
    try {
      int row = query.update(sql, new Object[] { opinion_id, appendix_id });
      if (row == 1) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public String deleteWorkflow(Map<String, Object> flow) {
    String modelId = flow.get("modelId").toString();
    Map<String, Object> wfmodel = this.getModelInit(Long.parseLong(modelId));
    if (wfmodel == null || wfmodel.isEmpty()) {
      return "";
    }
    try {
      // 删除函数参数
      Map<String, Object> parameter = new HashMap<String, Object>();
      parameter.put("flowId", Long.parseLong(modelId));
      this.delFunctionParameter(parameter);
      // 删除动作
      Map<String, String> action = new HashMap<String, String>();
      action.put("flow_id", modelId);
      this.removeOsWfActionForCond(action);
      // 删除步骤
      Map<String, String> _flow = new HashMap<String, String>();
      _flow.put("flow_id", modelId);
      this.removeOsWfStepForCond(_flow);
      // 删除工作流xml源码
      String identifier = this.checkIfNull(wfmodel.get("identifier"), "");
      if (identifier != null && !"".equals(identifier)) {
        this.deleteESSOA_WORKFLOW_XML(identifier);
      }
      // 取消表单与流程的关联
      String formId = flow.get("formId").toString();
      if (!"".equals(formId)) {
        Map<String, Object> form = this.getFormById(formId);
        form.put("flow_id", modelId);
        this.saveForm(form);
      }
      // 删除流程
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", flow.get("ip"));
      log.put("userid", flow.get("userId"));
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：删除流程实例");
      log.put("loginfo", "删除标识为【" + modelId + "】的文件流转流程实例");
      this.getLogService().saveLog(log);
      return this.removeOsWfModel(Long.parseLong(modelId));
    } catch (Exception e) {
      e.printStackTrace();
      return "删除工作流出现异常！";
    }
  }

  @Override
  public String delFun(long[] ids, String userId, String ip) {
    String sql = "delete from ess_transferfunctions where id=? ";
    try {
      Map<String, String> checkMap = this.checkFunUse(ids);
      if (checkMap != null && !checkMap.isEmpty()) {
        int isUseLength = ("".equals(checkMap.get("isUse"))) ? 0 : checkMap
            .get("isUse").split(",").length;
        if (!"".equals(checkMap.get("noUse"))) {
          String[] noUse = checkMap.get("noUse").split(",");
          Object[][] params = new Object[noUse.length][];
          for (int i = 0; i < noUse.length; i++) {
            params[i] = new Object[] { noUse[i] };
          }
          int[] row = query.batch(sql, params);
          if (row == null) {
            return "未发现要删除的函数";
          }
          // 删除流程
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", ip);
          log.put("userid", userId);
          log.put("module", "定制文件流转流程");
          log.put("operate", "定制文件流转流程：删除调用流程函数");
          log.put("loginfo", "删除标识为【" + noUse + "】的调用流程函数");
          this.getLogService().saveLog(log);
          return "成功删除"
              + noUse.length
              + "条函数"
              + ((isUseLength > 0) ? ",其中" + isUseLength + "条函数已被流程选择，未删除!"
                  : "");
        } else {
          return "该函数已被流程选择,无法删除！";
        }
      } else {
        return "未发现要删除的函数";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除失败";
    }
  }

  private Map<String, String> checkFunUse(long[] ids) {
    String sql = "select count(id) cnt from ess_transferaction where FIND_IN_SET(?,postfunction) ";
    try {
      String isUse = "";
      String noUse = "";
      for (long l : ids) {
        long cnt = query.query(sql, new ScalarHandler<Long>(), l);
        if (cnt == 0) {
          noUse += "," + l;
        } else {
          isUse += "," + l;
        }
      }
      isUse = isUse.length() > 0 ? isUse.substring(1) : "";
      noUse = noUse.length() > 0 ? noUse.substring(1) : "";
      Map<String, String> map = new HashMap<String, String>();
      map.put("isUse", isUse);
      map.put("noUse", noUse);
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private String delFunctionParameter(Map<String, Object> parameter) {
    Map<String, Object> map = this.getFunctionParameter(parameter);
    if (map == null || map.isEmpty()) {
      return "";
    }
    String sql = "delete from ess_transferfunctions_param where flow_id="
        + parameter.get("flowId");
    if (parameter.get("actionId") != null
        && !"".equals(parameter.get("actionId").toString())) {
      sql = sql + " and action_id=" + parameter.get("actionId");
    }
    if (parameter.get("functionId") != null
        && !"".equals(parameter.get("functionId").toString())) {
      sql = sql + " and function_id=" + parameter.get("functionId");
    }
    try {
      int row = query.update(sql);
      return row == 0 ? "删除参数失败" : "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除参数失败";
    }
  }

  @Override
  public String delType(long[] ids, String userId, String ip) {
    String sql_query = "select count(id) from ess_transferflow where type_id=? ";
    String sql = "delete from ess_transferflow_type where id=? ";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        long cnt = query.query(sql_query, new ScalarHandler<Long>(),
            new Object[] { ids[i] });
        if (cnt > 0) {
          return "该类型下已存在流程模板，无法删除";
        }
        params[i] = new Object[] { ids[i] };
      }
      int[] row = query.batch(sql, params);
      if (row == null || row.length == 0) {
        return "未发现要删除的类型";
      }
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：删除定制流转流程的类型");
      log.put("loginfo", "删除类型节点标识为【" + ids + "】定制流程的类型以及类型下流程");
      this.getLogService().saveLog(log);
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除类型失败";
    }
  }

  @Override
  public Map<String, String> detectionWorkflow(Map<String, Object> flow) {
    boolean flag = false;
    String msg = "";
    String modelId = flow.get("modelId").toString();
    String workflowName = flow.get("workflowName").toString();
    String relationFrom = flow.get("relationForm").toString();
    String modelBusiness = flow.get("modelBusiness").toString();
    String userId = flow.get("userId").toString();
    String remoteAddr = flow.get("remoteAddr").toString();
    UserEntry user = this.getUserQueryService().getUserInfo(
        this.getServiceId(), this.getToken(), userId, null);
    flag = this.testWorkflow(Long.parseLong(modelId), user, modelBusiness,
        relationFrom, workflowName);
    if (flag) {
      msg = "检测完成,所有用户都已通过该流程的测试,流程可以正常启动。";
    } else {
      msg = "检测完成,部分用户未通过该流程的测试,您可以通过消息提示下载检测报告查看详情。";
    }

    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", remoteAddr);
    log.put("userid", userId);
    log.put("operate", "工作流管理");
    log.put("loginfo", "测试工作流【" + workflowName + "】");
    this.getLogService().saveLog(log);

    Map<String, String> json = new HashMap<String, String>();
    json.put("isOk", "true");
    json.put("msg", msg);
    return json;
  }

  @Override
  public String doAction(String params) {
    Element rootElement = validateXml(params);
    if (null == rootElement) {
      return "";
    }
    Element tempElement = rootElement.getChild("isFirstStep");
    boolean isFirstStep = Boolean.valueOf(tempElement.getValue());
    tempElement = rootElement.getChild("wfModelId");
    String wfModelId = tempElement.getValue();
    tempElement = rootElement.getChild("formId");
    String formId = tempElement.getValue();
    tempElement = rootElement.getChild("userId");
    UserEntry user = null;
    user = this.getUserQueryService().findUserByUserid(this.getServiceId(),
        this.getToken(), tempElement.getValue(), null);
    tempElement = rootElement.getChild("wfId");
    String wfId = tempElement.getValue();
    tempElement = rootElement.getChild("selectUsers");
    String selectUsers = tempElement.getValue();
    tempElement = rootElement.getChild("actionId");
    String actionId = tempElement.getValue();
    tempElement = rootElement.getChild("stepId");
    String stepId = tempElement.getValue();
    tempElement = rootElement.getChild("remoteAddr");
    String remoteAddr = tempElement.getValue();
    try {
      Map<String, Object> parmMap = getWorkflowStepParms(isFirstStep,
          wfModelId, formId, user, Long.parseLong(wfId), selectUsers, actionId,
          stepId);
      parmMap.put("IP", remoteAddr);
      doAction(user.getUserid(), Long.parseLong(wfId),
          Integer.parseInt(actionId), parmMap);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return "";
  }

  @SuppressWarnings("rawtypes")
  private void doAction(String user, long workflowId, int actionId, Map inputs) {
    try {
      getWorkflow(user).doAction(workflowId, actionId, inputs);
    } catch (InvalidInputException e) {
      e.printStackTrace();
    } catch (WorkflowException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void doStart() throws Exception {
    if (!Boolean
        .valueOf(((MySpringWorkflowFactory) ((MySpringConfiguration) this.wfConfiguration)
            .getFactory()).getRelease())) {
      this.autoPublishEnabledWorkFlows();
    }
  }

  @Override
  public Map<String, String> dropWfModel(Map<String, Object> flow) {
    Map<String, String> json = new HashMap<String, String>();
    String modelId = flow.get("modelId").toString();
    Map<String, Object> wfmodel = this.getModelInit(Long.parseLong(modelId));
    try {
      String form_relation = wfmodel.get("form_relation").toString();
      if (null != form_relation && !"".equals(form_relation)) {
        List<Map<String, Object>> userforms = this
            .excuteQuerySavedWF(form_relation); // 获得表单正在流转的数据
        if (null != userforms && userforms.size() > 0) {
          json.put("message", "删除失败！流程有正在流转的工作流，不允许删除！");
          json.put("msgType", "2");
          json.put("success", "true");
          return json;
        }
        // 删除函数参数
        Map<String, Object> parameter = new HashMap<String, Object>();
        parameter.put("flowId", modelId);
        this.delFunctionParameter(parameter);
        // 删除动作
        Map<String, String> action = new HashMap<String, String>();
        action.put("flow_id", modelId);
        this.removeOsWfActionForCond(action);
        // 删除步骤
        Map<String, String> _flow = new HashMap<String, String>();
        _flow.put("flow_id", modelId);
        this.removeOsWfStepForCond(_flow);
        // 取消表单与流程的关联
        Map<String, Object> form = this.getFormById(form_relation);
        form.put("flow_id", modelId);
        this.saveForm(form);
      }
      this.removeOsWfModel(Long.parseLong(modelId));
    } catch (Exception e) {
      e.printStackTrace();
      json.put("message", "删除工作流出现异常！");
      json.put("msgType", "2");
      json.put("success", "true");
      return json;
    }

    json.put("message", "删除成功！");
    json.put("msgType", "1");
    json.put("success", "true");

    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", flow.get("ip"));
    log.put("userid", flow.get("userId"));
    log.put("module", "定制文件流转流程");
    log.put("operate", "定制文件流转流程：删除流程实例");
    log.put("loginfo", "删除标识为【" + modelId + "】的文件流转流程实例");
    this.getLogService().saveLog(log);

    return json;
  }

  private String editAction(Map<String, Object> action) {
    String sql = "update ess_transferaction set step_id=?, name=?, `condition`=?, postfunction=?, is_email=?, is_message=?, action_message=?, notice_users=?, notice_roles=?, is_notice_caller=?, process_time=? where flow_id=? and action_id=? ";
    try {
      int row = query
          .update(
              sql,
              new Object[] {
                  action.get("step_id"),
                  action.get("name"),
                  action.get("condition"),
                  action.get("postfunction"),
                  action.get("is_email"),
                  action.get("is_message"),
                  action.get("action_message"),
                  action.get("notice_users"),
                  action.get("notice_roles"),
                  action.get("is_notice_caller"),
                  Integer.parseInt(this.checkIfNull(action.get("process_time"),
                      "0")), action.get("flow_id"), action.get("action_id") });
      if (row != 1) {
        return "未发现保存的动作";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存动作失败";
    }
  }

  private Map<String, Object> editModelInit(Map<String, Object> model) {
    String sql = "update ess_transferflow set name=?, describtion=?, form_relation=? ,relation_table=?, business_relation=?, modifyer=?, modifytime=?  where id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { model.get("name"), model.get("describtion"),
              "form-" + model.get("stageId"), "esp_" + model.get("stageId"),
              model.get("selectBusiness"), model.get("creater"),
              model.get("createtime"), model.get("modelId") });
      if (row != 0) {
        this.operateFlowForm(model);
        // this.alterEspFlowForm(Long.parseLong(model.get("stageId").toString()));
        return model;
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String editType(Map<String, Object> type) {
    String sql = "update ess_transferflow_type set name=? where id=? ";
    try {
      int row = query.update(sql,
          new Object[] { type.get("name"), type.get("id") });
      if (row == 0) {
        return "未发现要编辑的类型";
      }
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", type.get("ip"));
      log.put("userid", type.get("userId"));
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：修改定制流转流程的类型");
      log.put("loginfo", "修改类型节点标识为【" + type.get("id") + "】定制流程的类型名称");
      this.getLogService().saveLog(log);
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "编辑类型失败";
    }
  }

  private List<Map<String, Object>> excuteQuerySavedWF(String formId) {
    String sql = "select * from ess_transferform_user ";
    if (formId != null && !"".equals(formId)) {
      sql = sql + " where wf_status = 'flow' and form_id='" + formId + "'";
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @SuppressWarnings("deprecation")
  @Override
  public String excuteWfForward(HashMap<String, Object> map) {
    String flag = "false";
    String userIds = map.get("userIds").toString();
    String wfId = map.get("wfId").toString();
    String userFormId = map.get("userFormId").toString();
    String opinionStr = map.get("opinionStr").toString();
    String fileAppendixNames = map.get("fileAppendixNames").toString();
    String fileAppendixPaths = map.get("fileAppendixPaths").toString();
    String userId = map.get("userId").toString();
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd    HH:mm:ss");// 设置日期格式
    String[] userIdList = userIds.split("\\|");
    for (int i = 0; i < userIdList.length; i++) {
      if (this.isWfForwardExist(user.getId(), Long.parseLong(userIdList[i]),
          Long.parseLong(userFormId))) {
        List<Map<String, Object>> opinionList = this.getWorkFlowOpinion(
            Long.parseLong(wfId), userIdList[i]);
        if (null != opinionList && opinionList.size() > 0) {
          String opinionId = opinionList.get(0).get("id").toString();
          List<Map<String, Object>> fileAppendixs = this
              .getAppendixByOpinion(Long.parseLong(opinionId));
          if (null != fileAppendixs && fileAppendixs.size() > 0) {
            for (int k = 0; k < fileAppendixs.size(); k++) {
              String appendixs = fileAppendixs.get(k).get("id").toString();
              this.deleteOpinionAppendixRelation(Long.parseLong(opinionId),
                  Long.parseLong(appendixs));
              Map<String, Object> append = new HashMap<String, Object>();
              List<String> appendList = new ArrayList<String>();
              appendList.add(appendixs);
              append.put("ids", appendList);
              this.getCollaborativeService().deleteAttachFileData(append);
            }
          }
          this.deleteOpinion(Long.parseLong(opinionId));
        }
      } else {
        this.addWfForward(user.getId(), Long.parseLong(userIdList[i]),
            Long.parseLong(userFormId));
      }
      Map<String, Object> oo = new HashMap<String, Object>();
      oo.put("content", opinionStr);
      oo.put("wf_step_id", 0);
      oo.put("wf_id", Long.parseLong(wfId));
      oo.put("user_name", userId);
      oo.put("time", df.format(new Date()));
      oo.put("forwarduserid", userIdList[i]);
      oo = this.saveWorkFlowOpinion(oo);
      if (!"".equals(fileAppendixNames)) {
        String[] fileAppendexNameArray = fileAppendixNames.split("\\|");
        String[] fileAppendexPathArray = fileAppendixPaths.split("\\|");
        Long newid = this.getNewAppendIxID();
        List<Map<String, Object>> fileAppendexList = new ArrayList<Map<String, Object>>();
        for (int j = 0; j < fileAppendexNameArray.length; j++) {
          Map<String, Object> oa = new HashMap<String, Object>();
          oa.put("fileName", fileAppendexNameArray[j]);
          oa.put("dataId", fileAppendexPathArray[j]);
          oa.put("fileSize", 0);
          oa.put("userName", userId);
          oa.put("type", "opinion");
          oa.put("wf_id", wfId);
          oa.put("wf_step_id", 0);
          oa.put("id", newid);
          newid++;
          fileAppendexList.add(oa);
        }
        this.saveAppendix(fileAppendexList,
            Long.parseLong(oo.get("id").toString()));
      }
      UserEntry currUser = getUserQueryService().getUserInfoById(userIdList[i]);
      Map<String, Object> collEntity = new HashMap<String, Object>();
      collEntity.put("workflowtype", "5"); // 类型为转发
      collEntity.put("state", "1");
      collEntity.put("stepId", "0");
      if ("admin".equals(currUser.getUserid()))
        collEntity.put("organid", 1);
      else {
        List<Participatory> part = this.getParticipatoryService()
            .getParticipatoryByUserId(currUser.getUserid());
        if (part != null && part.size() > 0) {
          collEntity.put("organid", part.get(0).getId());
        } else {
          collEntity.put("organid", 0);
        }
      }
      collEntity.put("owner", currUser.getUserid());
      collEntity.put("userformid", Long.parseLong(userFormId));
      this.executeSaveCollaborativeEntity(Long.parseLong(wfId), collEntity);

      EssMessage em = getMessageWS().getEssMessageByUserNameAndWorkFlowId(
          currUser.getUserid(), 0l, Long.parseLong(userFormId));
      if (em == null) {
        EssMessage message = new EssMessage();
        message.setSender(userId);
        message.setRecevier(currUser.getUserid());
        message.setContent(SimpleEncodeOrDecode.simpleEncode("请查看转发流程"));
        message.setSendTime(DateUtil.getDateTime());
        message.setStatus(workflowstatus_run);
        message.setWorkFlowId(Long.parseLong(wfId));
        message.setWorkFlowStatus(workflowstatus_run);
        message.setStepId(Long.parseLong(userFormId));

        Map<String, String> collMap = this.getCollaborativeService()
            .getCollaborativeMsgByWfId(Long.parseLong(wfId), "1",
                currUser.getUserid());
        if (collMap == null || collMap.isEmpty()) {
          message.setHandler("");
        } else {
          message.setHandler("collaborativeHandle.toTodoFormPage('"
              + collMap.get("id") + "','" + collMap.get("flowId") + "','"
              + collMap.get("formId") + "','" + wfId + "','" + 10000 + "','"
              + collMap.get("dataId") + "','" + collMap.get("status") + "','"
              + collMap.get("title") + "','" + collMap.get("userFormNo")
              + "','" + "5" + "','" + false + "')");
        }
        message.setHandlerUrl("esdocument/" + this.instanceId
            + "/x/ESMessage/handlerMsgPage");
        getMessageWS().addEssMessage(message);
      }
      flag = "true";
      System.out.println("将ID：" + userFormId + "的流程转发给"
          + currUser.getDisplayName() + "成功！");
      // 将转发流程写入日志
      if ("true".equals(flag)) {
        // 写本地日志
        Map<String, Object> localLogMap = new HashMap<String, Object>();
        localLogMap.put("userid", user.getUserid());
        localLogMap.put("module", "我的待办");
        localLogMap.put("ip", map.get("remoteAddr"));
        localLogMap.put("loginfo",
            "将ID：" + userFormId + "的流程转发给" + currUser.getDisplayName() + "成功!");
        localLogMap.put("operate", "我的待办：转发");
        this.getLogService().saveLog(localLogMap);
      }

    }
    return flag;
  }

  // private List<String> wfModelFunction(long wfModelId) {
  // List<String> isRightFunctionID = new ArrayList<String>();
  // /** 自动执行函数ID */
  // String functionId = "";
  // Map<String, Object> owm = this.getModelInit(wfModelId);
  // Map<String, Map<String, Element>> map = this.parseGraphXML(owm);
  // Map<String, Element> actionMap = map.get("action");
  //
  // for (String actionID : actionMap.keySet()) {
  // Map<String, Object> osaction = this.getActionByFlowAndAction(wfModelId,
  // Long.parseLong(actionID));
  // if (!"".equals(osaction) && osaction != null) {
  // functionId = osaction.get("postfunction").toString();
  // }
  // if (!"".equals(functionId) && functionId != null) {
  // isRightFunctionID.add(functionId);
  // }
  // }
  // return isRightFunctionID;
  // }

  private boolean executeSaveCollaborativeEntity(long wfid,
      Map<String, Object> entity) {
    boolean check = false;
    long userformID = -1;
    if (wfid > 0) {
      Map<String, Object> userForm = this.getCollaborativeService()
          .getUserformByWfId(wfid);
      userformID = Long.parseLong(userForm.get("id").toString());
    } else
      userformID = Long.parseLong(entity.get("userformid").toString());
    String sql = "insert into ess_collaborativemanage(stepid,userformid,owner,state,workflowtype,organid,audit_time,createtime,emailOrMessage) values(?,?,?,?,?,?,?,?,?)";
    try {
      int stepId = 10000;
      if (entity.get("stepId") != null) {
        stepId = Integer.parseInt(entity.get("stepId").toString());
      }
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      long row = query.insert(
          sql,
          new ScalarHandler<Long>(),
          new Object[] { stepId, userformID, entity.get("owner"),
              entity.get("state"), entity.get("workflowtype"),
              entity.get("organid"), entity.get("audit_time"),
              sdf.format(new Date()), "0" });
      if (row == 1) {
        check = true;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    // 删除已办数据时不再传入stepID。避免同一流程处理多次出现多条已办的情况。
    this.getCollaborativeService().deleteDealedWFData(userformID,
        entity.get("owner").toString(), null);
    return check;
  }

  private boolean executeUpdateEsOFUserFormValue(String formId, long wfId,
      long userId, long id) {
    String sql = "update ess_transferform_user set wf_id =?,wf_status=?,start_time=? where form_id =? and user_id =? and id=? and wf_status is null";
    try {
      int row = query.update(sql, new Object[] { wfId, "flow",
          new java.sql.Timestamp(new Date().getTime()), formId, userId, id });
      if (row > 0) {
        return true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return false;
  }

  @Override
  public Map<String, Object> exportWorkflow(Map<String, Object> flow) {
    String modelId = flow.get("modelId").toString();
    String expType = flow.get("expType").toString();
    Map<String, Object> json = new HashMap<String, Object>();
    String adress = this.getServiceAddress();
    // 文件存放的路径
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    String pathss = "/" + classPath.toString();
    int pos = pathss.indexOf("WEB-INF");
    String web_infPath = pathss.substring(0, pos);
    // 存放文件在服务器的地址
    String uploaded_file_path = web_infPath + "data/";
    File upload_file = new File(uploaded_file_path);
    if (!upload_file.exists()) {
      upload_file.mkdirs();
    }
    String datetime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
        .format(new Date()).replaceAll("-", "").replaceAll(":", "")
        .replaceAll(" ", "");// 用当前时间做为文件名
    String filePath = uploaded_file_path + datetime;
    File zipFileDir = new File(filePath);
    zipFileDir.mkdir();
    ExportWFDataUtil util = ExportWFDataUtil.newInstance(this);
    if (util.exportWFDataByModelId(Long.parseLong(modelId), expType, filePath
        + "/" + datetime + ".wf")) {
      ZipUtil zu = new ZipUtil();
      try {
        zu.createZip(zipFileDir.getAbsolutePath() + ".zip",
            zipFileDir.getAbsolutePath());
        deleteDir(zipFileDir);
      } catch (Exception e1) {
        e1.printStackTrace();
      }
      json.put("success", "true");
      String fileName = datetime + ".zip";
      String fileUrl = adress + fileName;
      try {
        fileUrl = URLEncoder.encode(fileUrl, "utf-8");
      } catch (UnsupportedEncodingException e1) {
        e1.printStackTrace();
      }
      json.put("fileUrl", fileUrl);

      // 消息设置
      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", flow.get("userId") + "");
      messMap.put("recevier", flow.get("userId") + "");
      messMap.put("sendTime",
          new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", fileName + "统计完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + this.getServiceIP()
          + fileName + "')");
      messMap.put("handlerUrl", "esdocument/" + this.instanceId
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);

      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", flow.get("remoteAddr"));
      log.put("userid", flow.get("userId"));
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：导出工作流实例文件");
      log.put("loginfo", "导出标识为【" + modelId + "】定制流转流程的文件");
      this.getLogService().saveLog(log);
    } else {
      json.put("success", "false");
    }
    return json;
  }

  private String getServiceIP() {
    String url = this.getNamingService().findApp(this.instanceId,
        "transferFlow", this.getServiceId(), this.getToken());
    String temp = url.substring(url.indexOf("rest"), url.length());
    String outFile = url.replace(temp, "data/");
    return outFile;
  }

  @Override
  public Map<String, Object> findRoleList(long page, long pre,
      String searchKeyword) {
    String sql = "select * from ess_role where 1=1 ";
    String count = "select count(id) from ess_role where 1=1 ";
    StringBuffer fs = new StringBuffer();
    fs.append("roleId,roleName,roleRemark,createTime,updateTime,isSystem");
    sql = sql + this.getKeywordCondition(fs, searchKeyword);
    count = count + this.getKeywordCondition(fs, searchKeyword);
    long start = (page - 1) * pre;
    sql = sql + " limit " + start + "," + pre;
    try {
      Map<String, Object> map = new HashMap<String, Object>();
      Long cnt = query.query(count, new ScalarHandler<Long>());
      if (cnt != null) {
        map.put("total", Long.parseLong(cnt.toString()));
      } else {
        map.put("total", 0);
      }
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      map.put("roles", list);
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> findStepUserList(long modelId, long stepId) {
    Map<String, Object> step = this.getStepUser(modelId, stepId);
    List<Map<String, Object>> userList = new ArrayList<Map<String, Object>>();
    Object users = step.get("next_step_users");
    if (null != step && null != users) {
      userList = this.getStepAndNoticeUserList(userList, users, "user");
    }
    Object roles = step.get("next_step_roles");
    if (null != step && null != roles) {
      userList = this.getStepAndNoticeUserList(userList, roles, "role");
    }
    return userList;
  }

  @Override
  public List<Map<String, Object>> findTransferList(long page, long pre,
      long type_id, String[] where) {
    String sql = "select * from ess_transferflow where 1=1 ";
    if (type_id == 0) {
      return new ArrayList<Map<String, Object>>();
    }
    if (type_id >= 0) {
      sql = sql + " and type_id=" + type_id;
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    if (page > 0 && pre > 0) {
      long start = (page - 1) * pre;
      sql = sql + " limit " + start + "," + pre;
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private HashMap<String, Boolean> functionCall(String modelBusiness,
      String relationFromID, long wfmodelId) {
    HashMap<String, Boolean> wrongField = new HashMap<String, Boolean>();
    /** 标识是否有正常结束时函数调用 */
    // boolean endFunction = false;
    /** 利用业务时，调用的函数能否正常结束 */
    // boolean usingFunctionIsRight = true;
    /** 移交业务时，调用的函数能否正常结束 */
    // boolean movingFunctionIsRight = true;
    /** 销毁业务时，调用的函数能否正常结束 */
    // boolean destroyFunctionIsRight = true;
    /** 在写报表的时候判断一下有无流程正常结束函数的调用，并比较表单之间字段长度,如果不正常报表中会体现出来 */
    /** 只对利用、移交、销毁三流程进行函数调用的判断 */
    // List<String> hasFunction = new ArrayList<String>();
    if (modelBusiness.equals("using") || modelBusiness.equals("moving")
        || modelBusiness.equals("destroy")) {
      // 判断有无结束函数
      // List<String> hasFunction = wfModelFunction(wfmodelId);
      // long functionID = getRinghtFunctionID(modelBusiness);
      // for (String rightId : hasFunction) {
      // /** 证明有正常结束函数的调用 */
      // if (Long.parseLong(rightId) == functionID) {
      // endFunction = true;
      // }
      // }
    }
    return wrongField;
  }

  private long generateESFId() {
    Long curid = null;
    String sql = "select max(id)+1 as maxPk from ess_transferform_user";
    try {
      curid = query.query(sql, new ScalarHandler<Long>());
      if (curid == null) {
        curid = 0l;
      }
      curid++;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return curid;
  }

  public String generateWfXml(Map<String, Object> osWfModel) {
    String msg = "工作流程<font color='green'>【" + osWfModel.get("name")
        + "】</font>";
    List<String> stepMsg = new ArrayList<String>();
    List<String> splitMsg = new ArrayList<String>();
    Document doc = new Document();
    DocType dt = new DocType("workflow");
    dt.setInternalSubset("");
    dt.setPublicID("-//OpenSymphony Group//DTD OSWorkflow 2.6//EN");
    dt.setSystemID("http://www.opensymphony.com/osworkflow/workflow_2_8.dtd");
    doc.setDocType(dt);
    // 创建根元素
    Element rootElement = new Element("workflow");
    doc.setRootElement(rootElement);
    doc.setProperty("version", "1.0");
    doc.setProperty("encoding", "UTF-8");
    Element initElement = new Element("initial-actions");
    try {
      int autoCreateReturnToStartNo = 100000;
      int autoCreateReturnToPreNo = 200000;
      Map<String, Map<String, Element>> map = parseGraphXML(osWfModel);
      if (null == map)
        return "解析流程图发生错误,发布失败!";
      Map<String, Element> startMap = map.get("init");
      Element startEl = startMap.get("start");
      Element endEl = startMap.get("end");
      String endId = endEl.getAttribute("id").getValue();
      Element startActionEl = startMap.get("startAction");
      String startTarget = startActionEl.getAttribute("target").getValue();
      this.saveOsWfModel(osWfModel);
      Element initAction = new Element("action");
      initAction.setAttribute("id", startEl.getAttributeValue("id"));
      initAction.setAttribute("name", startEl.getAttributeValue("value"));
      getInitActionElement(initAction, osWfModel, startTarget);
      initElement.addContent(initAction);
      rootElement.addContent(initElement);
      // steps
      Element steps = new Element("steps");
      Element splits = new Element("splits");
      Element joins = new Element("joins");
      Map<String, Element> stepMap = map.get("step");// 步骤
      Map<String, Element> splitMap = map.get("split");// 分支
      Map<String, Element> joinMap = map.get("join");// 聚合
      Map<String, Element> actionMap = map.get("action");// 动作
      /** xiaoxiong 20121011 回退到发起者时 自动将所有已经审批步骤中的会签的状态修改为0 调用 **/
      StringBuffer allStep = new StringBuffer();
      for (String tempKey : stepMap.keySet()) {
        allStep.append(";").append(tempKey);
      }
      if (allStep.length() > 0) {
        allStep.deleteCharAt(0);
      }
      // 处理分支要用到的临时集合
      Map<String, List<Element>> tempSplitAction = new HashMap<String, List<Element>>();
      for (String key : splitMap.keySet()) {
        Element split = new Element("split");
        split.setAttribute("id", key);
        List<Element> tempActionList = new ArrayList<Element>();
        String tempFrom = "";
        for (String actionId : actionMap.keySet()) {
          Element actionEl = actionMap.get(actionId);
          Attribute source = actionEl.getAttribute("source");
          if (null == source)
            return "发布失败!";
          String sourceId = source.getValue();
          Attribute target = actionEl.getAttribute("target");
          if (null == target)
            return "发布失败!";
          String targetId = target.getValue();
          if (targetId.equals(key)) {// 各分支中发送消息 的人
            tempFrom = sourceId;
          }
        }
        for (String actionId : actionMap.keySet()) {
          Element actionEl = actionMap.get(actionId);
          Attribute source = actionEl.getAttribute("source");
          if (null == source)
            return "发布失败!";
          String sourceId = source.getValue();
          Attribute target = actionEl.getAttribute("target");
          if (null == target)
            return "发布失败!";
          String targetId = target.getValue();
          if (splitMap.keySet().contains(sourceId)) {
            tempActionList.add(actionEl);
          }
          if (sourceId.equals(key) && !joinMap.isEmpty()) {
            Element unconditionalResult = new Element("unconditional-result");
            unconditionalResult.setAttribute("old-status", "Finished");
            unconditionalResult.setAttribute("status", "Underway");
            unconditionalResult.setAttribute("step", targetId);
            unconditionalResult
                .setAttribute("owner", "${ower" + targetId + "}");
            // 增加一个发消息的后置函数；
            Map<String, Map<String, String>> postMap = new HashMap<String, Map<String, String>>();
            Map<String, String> postargMap = new HashMap<String, String>();
            if (sourceId.equals(startTarget)) {
              postargMap.put("from", "${caller}");
            } else {
              postargMap.put("from", "${ower" + tempFrom + "}");
            }
            postargMap.put("to", "${ower" + targetId + "}");
            Map<String, Object> queryAction = this.getActionByFlowAndAction(
                Long.parseLong(osWfModel.get("id").toString()),
                Long.parseLong(actionId));
            if (null != queryAction) {
              postargMap.put("text", queryAction.get("action_message") + "");
            } else {
              postargMap.put("text", "请您审批！");
            }
            postargMap.put("step", targetId);
            postMap.put("cn.flying.rest.service.workflow.WorkflowSendMessage",
                postargMap);
            Element functions = new Element("post-functions");
            this.setFunctionsElement(functions, "", postMap);
            unconditionalResult.addContent(functions);
            split.addContent(unconditionalResult);
          }
        }
        tempSplitAction.put(key, tempActionList);
        if (null != split.getChildren() && !split.getChildren().isEmpty())
          splits.addContent(split);
      }
      StringBuffer beanshellContent = new StringBuffer("");
      for (String key : joinMap.keySet()) {
        Element join = new Element("join");
        join.setAttribute("id", key);
        Element conditions = new Element("conditions");
        conditions.setAttribute("type", "AND");
        Element condition = new Element("condition");
        condition.setAttribute("type", "beanshell");
        Element arg = new Element("arg");
        arg.setAttribute("name", "script");
        for (String actionId : actionMap.keySet()) {
          Element actionEl = actionMap.get(actionId);
          Attribute source = actionEl.getAttribute("source");
          if (null == source)
            return "发布失败!";
          String sourceId = source.getValue();
          Attribute target = actionEl.getAttribute("target");
          if (null == target)
            return "发布失败!";
          String targetId = target.getValue();
          if (targetId.equals(key)) {
            beanshellContent.append("\"Finished\".equals(jn.getStep("
                + sourceId + ").getStatus())&&");
          }
        }
      }
      if (beanshellContent.length() > 1) {
        beanshellContent.deleteCharAt(beanshellContent.length() - 1);
        beanshellContent.deleteCharAt(beanshellContent.length() - 1);
      }
      for (String key : joinMap.keySet()) {
        Element join = new Element("join");
        join.setAttribute("id", key);
        Element conditions = new Element("conditions");
        conditions.setAttribute("type", "AND");
        Element condition = new Element("condition");
        condition.setAttribute("type", "beanshell");
        Element arg = new Element("arg");
        arg.setAttribute("name", "script");
        for (String actionId : actionMap.keySet()) {
          Element actionEl = actionMap.get(actionId);
          Attribute source = actionEl.getAttribute("source");
          if (null == source)
            return "发布失败!";
          String sourceId = source.getValue();
          Attribute target = actionEl.getAttribute("target");
          if (null == target)
            return "发布失败!";
          String targetId = target.getValue();
          if (sourceId.equals(key)) {
            arg.addContent(beanshellContent.toString());
            condition.addContent(arg);
            conditions.addContent(condition);
            join.addContent(conditions);
            Element unconditionalResult = new Element("unconditional-result");
            unconditionalResult.setAttribute("old-status", "Finished");
            if (endId.equals(targetId)) {
              unconditionalResult.setAttribute("status", "Finished");
            } else {
              unconditionalResult.setAttribute("status", "Underway");
            }
            unconditionalResult.setAttribute("step", targetId);
            unconditionalResult
                .setAttribute("owner", "${ower" + targetId + "}");
            join.addContent(unconditionalResult);
          }
        }
        joins.addContent(join);
      }
      for (String key : stepMap.keySet()) {
        Element e = stepMap.get(key);
        Element step = new Element("step");
        step.setAttribute("id", key);
        step.setAttribute("name", e.getAttribute("value").getValue());
        this.getExternalPermissionsElement(step, osWfModel, key);
        Element actions = new Element("actions");
        /** xiaoxiong 20121009 记录当前步骤是否存在回退到第一步的动作 **/
        boolean isHasToStartAction = false;
        /** xiaoxiong 20121009 获取当前步骤的上一步骤的集合 **/
        List<String> toPreActions = new ArrayList<String>();

        for (String actionId : actionMap.keySet()) {
          Element actionEl = actionMap.get(actionId);
          Attribute source = actionEl.getAttribute("source");
          if (null == source)
            return "发布失败!";
          String sourceId = source.getValue();
          Attribute target = actionEl.getAttribute("target");
          if (null == target)
            return "发布失败!";
          String targetId = target.getValue();
          if (sourceId.equals(key)) {
            if (targetId.equals(startTarget)) {
              isHasToStartAction = true;
            }
            Element action = new Element("action");
            action.setAttribute("id", actionId);
            action.setAttribute("name", actionEl.getAttribute("value")
                .getValue());
            if (splitMap.keySet().contains(targetId) && !joinMap.isEmpty()) {
              Element results = new Element("results");
              Element unconditionalResult = new Element("unconditional-result");
              unconditionalResult.setAttribute("old-status", "Finished");
              unconditionalResult.setAttribute("split", targetId);
              results.addContent(unconditionalResult);
              action.addContent(results);
              actions.addContent(action);
            } else if (joinMap.keySet().contains(targetId)
                && !splitMap.isEmpty()) {
              Element restrictTo = new Element("restrict-to");
              Element conditions = new Element("conditions");
              conditions.setAttribute("type", "AND");
              Element condition = new Element("condition");
              condition.setAttribute("type", "class");
              Element arg1 = new Element("arg");
              arg1.setAttribute("name", "class.name");
              arg1.addContent("com.opensymphony.workflow.util.StatusCondition");
              Element arg2 = new Element("arg");
              arg2.setAttribute("name", "status");
              arg2.addContent("Underway");
              Element arg3 = new Element("arg");
              arg3.setAttribute("name", "stepId");
              arg3.addContent(key);
              condition.addContent(arg1);
              condition.addContent(arg2);
              condition.addContent(arg3);
              conditions.addContent(condition);
              restrictTo.addContent(conditions);
              action.addContent(restrictTo);
              Element results = new Element("results");
              Element unconditionalResult = new Element("unconditional-result");
              unconditionalResult.setAttribute("old-status", "Finished");
              unconditionalResult.setAttribute("status", "Underway");
              unconditionalResult.setAttribute("join", targetId);
              results.addContent(unconditionalResult);
              action.addContent(results);
              actions.addContent(action);
            } else {
              if (splitMap.keySet().contains(targetId) && joinMap.isEmpty()) {
                if (!tempSplitAction.isEmpty()) {
                  List<Element> actionList = tempSplitAction.get(targetId);
                  Element tempSplitActionResults = new Element("results");
                  for (Element el : actionList) {
                    String tempSplitActionid = el.getAttributeValue("id");
                    if (validatorSplitAction(actionMap, splitMap, key,
                        tempSplitActionid)) {
                      // String tempSplitActionsource =
                      // el.getAttributeValue("source");
                      String tempSplitActiontarget = el
                          .getAttributeValue("target");
                      Element tempSplitActionResult = new Element("result");
                      tempSplitActionResult.setAttribute("old-status",
                          "Finished");
                      tempSplitActionResult.setAttribute("status", "Underway");
                      tempSplitActionResult.setAttribute("step",
                          tempSplitActiontarget);
                      tempSplitActionResult.setAttribute("owner", "${ower"
                          + tempSplitActiontarget + "}");
                      Map<String, Object> osaction = this
                          .getActionByFlowAndAction(
                              Long.parseLong(osWfModel.get("id").toString()),
                              Long.parseLong(tempSplitActionid));
                      Element tempSplitActionConditions = new Element(
                          "conditions");
                      tempSplitActionConditions.setAttribute("type", "AND");
                      Element tempSplitActionCondition = new Element(
                          "condition");
                      tempSplitActionCondition.setAttribute("type", "class");
                      Element tempSplitActionArg1 = new Element("arg");
                      tempSplitActionArg1.setAttribute("name", "class.name");
                      tempSplitActionArg1
                          .addContent("cn.flying.rest.service.workflow.WfSplitValidator");
                      String actionText = actionMap.get(tempSplitActionid)
                          .getAttribute("value").getValue();
                      if (null == osaction || osaction.isEmpty()) {
                        splitMsg.add("分支[<font color='red'>" + actionText
                            + "</font>]没有设置分支条件");
                        continue;
                      }

                      // 增加后置函数的参数
                      Element tempSplitActionArg2 = new Element("arg");
                      tempSplitActionArg2.setAttribute("name", "splitCondtion");
                      String actionSplitCond = osaction.get("condition")
                          .toString();
                      // 如果没有设置分支条件就发布失败。
                      if (null == actionSplitCond || "".equals(actionSplitCond)) {
                        splitMsg.add("分支[<font color='red'>" + actionText
                            + "</font>]没有设置分支条件");
                        continue;
                      }
                      tempSplitActionArg2.addContent(actionSplitCond);
                      tempSplitActionCondition.addContent(tempSplitActionArg2);
                      tempSplitActionCondition.addContent(tempSplitActionArg1);
                      tempSplitActionConditions
                          .addContent(tempSplitActionCondition);
                      tempSplitActionResult
                          .addContent(tempSplitActionConditions);
                      // 增加发送消息
                      Map<String, Map<String, String>> postMap = new HashMap<String, Map<String, String>>();
                      Map<String, String> postargMap = new HashMap<String, String>();
                      if (sourceId.equals(startTarget)) {
                        postargMap.put("from", "${caller}");
                      } else {
                        postargMap.put("from", "${ower" + sourceId + "}");
                      }
                      postargMap.put("to", "${ower" + tempSplitActiontarget
                          + "}");
                      postargMap.put("relationBusiness",
                          osWfModel.get("business_relation").toString());
                      if (null != osaction && !osaction.isEmpty()) {
                        postargMap.put("text", this.checkIfNull(
                            osaction.get("action_message"), ""));
                      } else {
                        postargMap.put("text", "请您审批！");
                      }
                      postargMap.put("step", tempSplitActiontarget);
                      postMap
                          .put(
                              "cn.flying.rest.service.workflow.WorkflowSendMessage",
                              postargMap);
                      Element post_functions = new Element("post-functions");
                      this.setFunctionsElement(post_functions, "", postMap);
                      tempSplitActionResult.addContent(post_functions);
                      tempSplitActionResults.addContent(tempSplitActionResult);
                    }
                  }
                  Element unconditionalResult = new Element(
                      "unconditional-result");
                  unconditionalResult.setAttribute("old-status", "Finished");
                  unconditionalResult.setAttribute("status", "Underway");
                  unconditionalResult.setAttribute("step", sourceId);
                  unconditionalResult.setAttribute("owner", "${ower" + sourceId
                      + "}");
                  tempSplitActionResults.addContent(unconditionalResult);
                  action.addContent(tempSplitActionResults);
                  actions.addContent(action);
                }
              } else {
                // /增加执行一个动作的结果；
                boolean bool = false;
                if (endId.equals(targetId))
                  bool = true;
                Map<String, Object> currentStepEntity = this.getStepUser(
                    Long.parseLong(osWfModel.get("id").toString()),
                    Long.parseLong(sourceId));
                if (currentStepEntity == null || currentStepEntity.isEmpty()) {
                  // 判断提示信息是否重复
                  String tmpMsg = "步骤[<font color='red' name='es_step_id"
                      + sourceId + "'>"
                      + stepMap.get(sourceId).getAttribute("value").getValue()
                      + "</font>]没有保存设置";
                  if (!stepMsg.contains(tmpMsg)) {
                    stepMsg.add(tmpMsg);
                  }
                  continue;
                } else {
                  // 增加验证没有设置审批人时发布失败。
                  if (null == currentStepEntity.get("next_step_roles")
                      && null == currentStepEntity.get("next_step_users")
                      && osWfModel.get("first_step_id") != currentStepEntity
                          .get("step_id")) {
                    String currErrorMsg = "步骤[<font color='red'>"
                        + stepMap.get(sourceId).getAttribute("value")
                            .getValue() + "</font>]没有设置审批人";
                    if (!stepMsg.contains(currErrorMsg))
                      stepMsg.add("步骤[<font color='red'>"
                          + stepMap.get(sourceId).getAttribute("value")
                              .getValue() + "</font>]没有设置审批人");
                    continue;
                  }
                }
                int isCountersign = currentStepEntity.get("is_countersign") == null ? 0
                    : Integer.parseInt(currentStepEntity.get("is_countersign")
                        .toString());
                if (isCountersign == 0) {
                  this.setResultElement(action, bool, targetId, "${ower"
                      + targetId + "}");// @需要增加
                }
                // //// 增加一个动作的后置函数；
                Map<String, Map<String, String>> postMap = new HashMap<String, Map<String, String>>();
                Map<String, String> postargMap = new HashMap<String, String>();
                Map<String, Object> osaction = this.getActionByFlowAndAction(
                    Long.parseLong(osWfModel.get("id").toString()),
                    Long.parseLong(actionId));
                if (sourceId.equals(startTarget)) {
                  postargMap.put("from", "${caller}");
                } else {
                  postargMap.put("from", "${ower" + sourceId + "}");
                }
                postargMap.put("relationBusiness",
                    osWfModel.get("business_relation").toString());
                if (bool) {
                  postargMap.put("to", "${caller}");
                  postargMap.put("isLast", "true");
                  // 修改为自定义消息
                  /** lujixiang 20150421 如果为最后一步，无需设置“处理时间周期”等字段 **/
                  if (null != osaction && !osaction.isEmpty()) {
                    String messageText = (String) osaction
                        .get("action_message");
                    postargMap.put(
                        "text",
                        null == messageText
                            || "".equals(messageText.toString()) ? "审批完成"
                            : messageText.toString());
                  } else {
                    postargMap.put("text", "审批完成！");
                  }

                  /** lujixiang 20150420 每个action在发布之前必须强制编辑“处理时间周期”等字段 **/
                  /**
                   * if (null == osaction || osaction.isEmpty()) {
                   * 
                   * stepMsg.add("动作[<font color='red'>" +
                   * actionEl.getAttribute("value") .getValue() +
                   * "</font>]没有编辑"); continue; }else{ String messageText =
                   * (String)osaction.get("action_message");
                   * postargMap.put("text", null == messageText ||
                   * "".equals(messageText.toString()) ? "请您审批" :
                   * messageText.toString()); }
                   **/
                  /**
                   * if (null != osaction) { String messageText =
                   * osaction.get("action_message") .toString();
                   * postargMap.put("text", "请您审批".equals(messageText) ? "审批完成"
                   * : messageText); // 如果是最好一步且未进行消息设置，则提示为审批完成 } else {
                   * postargMap.put("text", "审批完成！"); }
                   **/
                } else {

                  /** lujixiang 20150420 每个action在发布之前必须强制编辑“处理时间周期”等字段 **/
                  if (null == osaction || osaction.isEmpty()) {

                    stepMsg.add("动作[<font color='red'>"
                        + actionEl.getAttribute("value").getValue()
                        + "]"
                        + "&nbsp;&nbsp;"
                        + stepMap.get(sourceId).getAttribute("value")
                            .getValue()
                        + "---->"
                        + stepMap.get(targetId).getAttribute("value")
                            .getValue() + "</font>没有编辑");
                    continue;
                  } else {
                    String messageText = (String) osaction
                        .get("action_message");
                    postargMap.put(
                        "text",
                        null == messageText
                            || "".equals(messageText.toString()) ? "请您审批"
                            : messageText.toString());
                  }

                  postargMap.put("to", "${ower" + targetId + "}");
                  postargMap.put("isLast", "false");
                  /**
                   * // 修改为自定义消息 if (null != osaction) { postargMap.put("text",
                   * osaction.get("action_message") .toString()); } else {
                   * postargMap.put("text", "请您审批！"); }
                   **/
                }
                postargMap.put("step", targetId);
                postMap.put(
                    "cn.flying.rest.service.workflow.WorkflowSendMessage",
                    postargMap);
                Element functions = new Element("post-functions");
                // 修改支持设置动作是否发送消息，普通动作支持此参数，其他如分支等不修改，因为分支不能进行是否发送消息设置。
                Integer isMessage = new Integer(-1);
                boolean checkPostFunctions = false;
                if (null != osaction && !osaction.isEmpty())
                  isMessage = Integer.parseInt(osaction.get("is_message")
                      .toString());
                if (null == osaction || (null != isMessage && isMessage == 1)) {
                  this.setFunctionsElement(functions, "", postMap);
                  checkPostFunctions = true;
                }
                if (null != osaction && !osaction.isEmpty()) {
                  String functionids = this.checkIfNull(
                      osaction.get("postfunction"), "");
                  Map<String, Map<String, String>> functionMaps = null;
                  Map<String, String> functionMap = null;
                  if (functionids != null && !functionids.equals("")) {
                    String[] fids = functionids.split(",");
                    for (String sID : fids) {
                      functionMaps = new HashMap<String, Map<String, String>>();
                      functionMap = new HashMap<String, String>();
                      Map<String, Object> querymap = this
                          .getFunctionById(Integer.parseInt(sID));
                      if (querymap == null)
                        continue;
                      functionMap
                          .put("modelID", osWfModel.get("id").toString());
                      functionMap.put("actionID", actionId);
                      functionMap.put("restFullClassName",
                          querymap.get("restFullClassName").toString());
                      functionMap.put("exeFunction", querymap
                          .get("exeFunction").toString());
                      functionMaps
                          .put(
                              "cn.flying.rest.service.workflow.WorkFlowFunctionExecute",
                              functionMap);
                      this.setFunctionsElement(functions, "", functionMaps);
                      checkPostFunctions = true;
                    }
                  }
                }
                // 最后一步增加修改状态函数
                if (bool) {
                  Map<String, Map<String, String>> UpdateFormStatePostMap = new HashMap<String, Map<String, String>>();
                  Map<String, String> parmPostMap = new HashMap<String, String>();
                  UpdateFormStatePostMap.put(
                      "cn.flying.rest.service.workflow.WfUpdateFormState",
                      parmPostMap);
                  this.setFunctionsElement(functions, "",
                      UpdateFormStatePostMap);
                  checkPostFunctions = true;
                }
                // 增加一个修改消息状态的函数
                if (!sourceId.equals(startTarget)) {
                  Map<String, Map<String, String>> updateMessageStatePostMap = new HashMap<String, Map<String, String>>();
                  Map<String, String> parmPostMap = new HashMap<String, String>();
                  if (bool) {
                    parmPostMap.put("lastStep", endId);
                    parmPostMap.put("isLast", "true");
                  }
                  parmPostMap.put("step", key);
                  updateMessageStatePostMap
                      .put(
                          "cn.flying.rest.service.workflow.WorkflowUpdateMessageStatus",
                          parmPostMap);
                  this.setFunctionsElement(functions, "",
                      updateMessageStatePostMap);
                  checkPostFunctions = true;
                }
                if (isCountersign == 1) {
                  Element results = new Element("results");
                  Element Result = this.setResultElementForCountersign(bool,
                      targetId, "${ower" + targetId + "}");
                  if (checkPostFunctions)
                    Result.addContent(functions);
                  Element UnconditionalResult = this
                      .setUnconditionalResultElementForCountersign(bool,
                          sourceId, "${ower" + sourceId + "}");
                  results.addContent(Result);
                  results.addContent(UnconditionalResult);
                  action.addContent(results);

                } else {
                  if (checkPostFunctions)
                    action.addContent(functions);
                }
                actions.addContent(action);
              }
            }
            /**
             * 当目标步骤等于当前步骤 发起步骤又不为开始 且当前步骤又不是发起步骤时
             * 对指向当前步骤的动作的发起步骤是不是当前步骤的真正上一步进行判断
             **/
          } else if (targetId.equals(key) && !startTarget.equals(sourceId)
              && !startTarget.equals(key)) {
            boolean isToPreAction = this.validatorIsToPreAction(1, startTarget,
                sourceId, key, null, stepMap, actionMap);
            if (!isToPreAction) {
              /** 如果判断出来的上一步是个分支步骤时 向上再追述一级 暂时只支持分支的来源为一个的情况 **/
              if (splitMap.keySet().contains(sourceId)) {
                for (String item : actionMap.keySet()) {
                  Element tempActionEl = actionMap.get(item);
                  Attribute tempSource = tempActionEl.getAttribute("source");
                  Attribute tempTtarget = tempActionEl.getAttribute("target");
                  if (null == tempSource || null == tempTtarget)
                    continue;
                  String tempSourceId = tempSource.getValue();
                  String tempTargetId = tempTtarget.getValue();
                  if (tempTargetId.equals(sourceId)) {
                    toPreActions.add(tempSourceId);
                    break;
                  }
                }
              } else {
                toPreActions.add(sourceId);
              }
            }
          }
        }
        /** xiaoxiong 20121009 当前步骤又不是第一步 **/
        if (!key.equals(startTarget)) {
          /** xiaoxiong 20121009 如果不存在返回到第一步的回退动作 就自动添加回退到第一步动作 **/
          if (!isHasToStartAction) {
            Element action = new Element("action");
            autoCreateReturnToStartNo++;
            action.setAttribute("id", autoCreateReturnToStartNo + "");
            action.setAttribute("name", "回退到发起者");

            this.setResultElement(action, false, startTarget, "${ower"
                + startTarget + "}");// @需要增加
            // //// 增加一个动作的后置函数；
            Map<String, String> postargMap = new HashMap<String, String>();
            postargMap.put("from", "${ower" + key + "}");
            postargMap.put("relationBusiness",
                osWfModel.get("business_relation").toString());
            postargMap.put("to", "${ower" + startTarget + "}");
            postargMap.put("isLast", "false");
            postargMap.put("text", "请您重新填写");
            postargMap.put("step", startTarget);

            Map<String, Map<String, String>> postMap = new HashMap<String, Map<String, String>>();
            postMap.put("cn.flying.rest.service.workflow.WorkflowSendMessage",
                postargMap);
            Element functions = new Element("post-functions");

            this.setFunctionsElement(functions, "", postMap);
            // 修改消息状态的函数
            Map<String, Map<String, String>> updateMessageStatePostMap = new HashMap<String, Map<String, String>>();
            Map<String, String> parmPostMap = new HashMap<String, String>();
            parmPostMap.put("step", key);
            updateMessageStatePostMap.put(
                "cn.flying.rest.service.workflow.WorkflowUpdateMessageStatus",
                parmPostMap);
            this.setFunctionsElement(functions, "", updateMessageStatePostMap);

            // 当回退到的发起者时 将当前工作流的所有会签状态值修改为0
            Map<String, Map<String, String>> returnToHasCountersignStep = new HashMap<String, Map<String, String>>();
            Map<String, String> returnToHasCountersignStepPostMap = new HashMap<String, String>();
            returnToHasCountersignStepPostMap.put("step", allStep.toString());
            returnToHasCountersignStep.put(
                "cn.flying.rest.service.workflow.RemoveCountersignStepStatus",
                returnToHasCountersignStepPostMap);
            this.setFunctionsElement(functions, "", returnToHasCountersignStep);
            action.addContent(functions);
            actions.addContent(action);
          }
          /** 如果不存在返回到上一步的回退回动作 就自动添加回退到上一步动作 **/
          if (!toPreActions.isEmpty()) {
            for (String preStep : toPreActions) {
              Element action = new Element("action");
              autoCreateReturnToPreNo++;
              action.setAttribute("id", autoCreateReturnToPreNo + "");
              action.setAttribute("name", "回退到上一步");
              this.setResultElement(action, false, preStep, "${ower" + preStep
                  + "}");// @需要增加

              // //// 增加一个动作的后置函数；
              Map<String, String> postargMap = new HashMap<String, String>();
              postargMap.put("from", "${ower" + key + "}");
              postargMap.put("relationBusiness",
                  osWfModel.get("business_relation").toString());
              postargMap.put("to", "${ower" + preStep + "}");
              postargMap.put("isLast", "false");
              postargMap.put("text", "请您重新审批");
              postargMap.put("step", preStep);

              Map<String, Map<String, String>> postMap = new HashMap<String, Map<String, String>>();
              postMap.put(
                  "cn.flying.rest.service.workflow.WorkflowSendMessage",
                  postargMap);
              Element functions = new Element("post-functions");

              this.setFunctionsElement(functions, "", postMap);

              // 修改消息状态的函数
              Map<String, Map<String, String>> updateMessageStatePostMap = new HashMap<String, Map<String, String>>();
              Map<String, String> parmPostMap = new HashMap<String, String>();
              parmPostMap.put("step", key);
              updateMessageStatePostMap
                  .put(
                      "cn.flying.rest.service.workflow.WorkflowUpdateMessageStatus",
                      parmPostMap);
              this.setFunctionsElement(functions, "", updateMessageStatePostMap);
              // 当回退到的发起者时 将当前工作流的所有会签状态值修改为0
              Map<String, Map<String, String>> returnToHasCountersignStep = new HashMap<String, Map<String, String>>();
              Map<String, String> returnToHasCountersignStepPostMap = new HashMap<String, String>();
              returnToHasCountersignStepPostMap.put("step", allStep.toString());
              returnToHasCountersignStep
                  .put(
                      "cn.flying.rest.service.workflow.RemoveCountersignStepStatus",
                      returnToHasCountersignStepPostMap);
              this.setFunctionsElement(functions, "",
                  returnToHasCountersignStep);

              action.addContent(functions);

              actions.addContent(action);
            }
          }
        }
        step.addContent(actions);
        steps.addContent(step);
      }
      Element step = new Element("step");
      step.setAttribute("id", endId);
      step.setAttribute("name", endEl.getAttribute("value").getValue());
      steps.addContent(step);
      rootElement.addContent(steps);
      @SuppressWarnings("rawtypes")
      List splitChildList = splits.getChildren();
      @SuppressWarnings("rawtypes")
      List joinsChildList = joins.getChildren();
      if (splitChildList != null && !splitChildList.isEmpty()) {
        rootElement.addContent(splits);
      }
      if (joinsChildList != null && !joinsChildList.isEmpty()) {
        rootElement.addContent(joins);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return "发布失败!";
    }
    String fileName = osWfModel.get("identifier") + ".xml";
    XMLOutputter out = new XMLOutputter();
    File file = new File(getBaseDir() + fileName);
    try {
      out.output(doc, new FileOutputStream(file));
      modifyESSOA_WORKFLOW_XML(osWfModel.get("identifier").toString());
      try {
        ((MySpringConfiguration) this.wfConfiguration).reload();
      } catch (FactoryException e) {
        e.printStackTrace();
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
      return "发布失败!";
    } catch (IOException e) {
      e.printStackTrace();
      return "发布失败!";
    }
    if (stepMsg.isEmpty() && splitMsg.isEmpty()) {
      msg += "发布成功!";
    } else {
      msg += "发布失败!<br>失败原因如下:<br>";
      int count = 1;
      for (String s : stepMsg) {
        if (count < 10) {
          msg = msg + "&nbsp;&nbsp;" + count + "、" + s + "<br>";
        } else {
          msg = msg + count + "、" + s + "<br>";
        }
        count++;
      }
      for (String s : splitMsg) {
        if (count < 10) {
          msg = msg + "&nbsp;&nbsp;" + count + "、" + s + "<br>";
        } else {
          msg = msg + count + "、" + s + "<br>";
        }
        count++;
      }
      msg = msg.substring(0, msg.length() - 4);
    }
    return msg;
  }

  private Map<String, Object> getActionByFlowAndAction(long flow_id,
      long action_id) {
    String sql = "select * from ess_transferaction where flow_id=? and action_id=? ";
    try {
      Map<String, Object> action = null;
      action = query.query(sql, new MapHandler(), new Object[] { flow_id,
          action_id });
      if (action == null) {
        action = new HashMap<String, Object>();
      }
      return action;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getActionByFlowId(long flow_id) {
    String sql = "select * from ess_transferaction where flow_id=? ";
    try {
      List<Map<String, Object>> action = null;
      action = query.query(sql, new MapListHandler(), new Object[] { flow_id });
      if (action == null) {
        action = new ArrayList<Map<String, Object>>();
      }
      return action;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  private List<org.dom4j.Element> getAllActionFromGraphXml(String xml,
      String cond) throws DocumentException, SAXException {
    String DTD_not_load = "http://apache.org/xml/features/nonvalidating/load-external-dtd";
    String DTD_not_validation = "http://xml.org/sax/features/validation";
    List<org.dom4j.Element> el = null;
    SAXReader saxReader = new SAXReader();
    saxReader.setFeature(DTD_not_load, false);
    saxReader.setFeature(DTD_not_validation, false);
    org.dom4j.Document doc = null;
    try {
      doc = saxReader.read(new ByteArrayInputStream(xml.getBytes("UTF-8")));
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    org.dom4j.Element root = doc.getRootElement();
    el = (List<org.dom4j.Element>) root.selectNodes(cond);
    return el;
  }

  private List<Map<String, Object>> getAppendixByOpinion(long opinionId) {
    try {
      String sql = "select a.* from ess_form_appendix a LEFT JOIN ess_opinion_appendix_relation r ON a.id=r.appendix_id where r.opinion_id=? ";
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { opinionId });
      if (list == null || list.isEmpty()) {
        return new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  public String getBaseDir() {
    if (null != this.dir) {
      return this.dir;
    }
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String appPath = classPath.substring(0, pos);
    this.dir = appPath + "workflows/osWorkflowEntity/";
    return this.dir;
  }

  // private CacheWS getCacheWS() {
  // if (cacheWS == null) {
  // this.cacheWS = this.getService(CacheWS.class);
  // }
  // return this.cacheWS;
  // }

  private ICollaborativeService getCollaborativeService() {
    if (collaborativeService == null) {
      this.collaborativeService = this.getService(ICollaborativeService.class);
    }
    return this.collaborativeService;
  }

  public FormComboEntity getComboEntityByComboValue(String comboValue) {
    FormComboEntity comboEntity = null;
    String sql = "select * from ess_formbuildercombo where combovalue=?";
    try {
      Map<String, Object> map = query.query(sql, new MapHandler(),
          new Object[] { comboValue });
      comboEntity = new FormComboEntity();
      if (map != null) {
        comboEntity.setId(Long.parseLong(map.get("id").toString()));
        comboEntity.setIdentifier(map.get("identifier").toString());
        comboEntity.setComboValue(map.get("combovalue").toString());
        comboEntity.setEstype(map.get("estype").toString());
        comboEntity.setDataUrl(map.get("dataurl").toString());
        comboEntity.setDescribe(map.get("description").toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return comboEntity;
  }

  @Override
  public FormComboEntity getComboEntityByIdentifier(String identifier) {
    FormComboEntity comboEntity = null;
    String sql = "select * from ess_formbuildercombo where identifier=?";
    try {
      Map<String, Object> map = query.query(sql, new MapHandler(),
          new Object[] { identifier });
      comboEntity = new FormComboEntity();
      if (map != null) {
        comboEntity.setId(Long.parseLong(map.get("id").toString()));
        comboEntity.setIdentifier(map.get("identifier").toString());
        comboEntity.setComboValue(map.get("combovalue").toString());
        comboEntity.setEstype(map.get("estype").toString());
        comboEntity.setDataUrl(map.get("dataurl").toString());
        comboEntity.setDescribe(map.get("description").toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return comboEntity;
  }

  @Override
  public long getComboValueCount(long comboId, String[] where) {
    String sql = "select count(*) from ess_formbuildercombovalues where 1=1 ";
    if (comboId == 0) {
      return 0;
    }
    if (comboId > 0) {
      sql = sql + " and id_combo=" + comboId;
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
    return 0;
  }

  @Override
  public List<FormComboValuesEntity> getComboValues(long comboId, long page,
      long pre, String[] where) {
    String sql = "select * from ess_formbuildercombovalues where 1=1 ";
    if (comboId == 0) {
      return new ArrayList<FormComboValuesEntity>();
    }
    if (comboId > 0) {
      sql = sql + " and id_combo=" + comboId;
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    long start = (page - 1) * pre;
    sql = sql + " limit " + start + "," + pre;
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        return new ArrayList<FormComboValuesEntity>();
      } else {
        List<FormComboValuesEntity> returnList = new ArrayList<FormComboValuesEntity>();
        for (int i = 0; i < list.size(); i++) {
          FormComboValuesEntity entity = new FormComboValuesEntity();
          Map<String, Object> obj = list.get(i);
          entity.setId(Long.parseLong(obj.get("id_value").toString()));
          entity.setPropertyValue(obj.get("propertyvalue").toString());
          entity.setTextValue(obj.get("textvalue").toString());
          entity.setComboID(Long.parseLong(obj.get("id_combo").toString()));
          returnList.add(entity);
        }
        return returnList;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getConditionToShowNew(Map<String, Object> condition) {
    String actionId = condition.get("actionId").toString();
    String modelId = condition.get("modelId").toString();
    String formId = condition.get("formId").toString();
    Map<String, Object> action = this.getActionByFlowAndAction(
        Long.parseLong(modelId), Long.parseLong(actionId));
    String leftCondition = "";
    String rightCondition = "";
    String tempIDs = "";
    if (action != null && !action.isEmpty()) {
      String allCondition = this.checkIfNull(action.get("condition"), "");
      if (allCondition != null && !"".equals(allCondition.trim())) {
        leftCondition = allCondition.split("&&&")[0];
        if (allCondition.split("&&&").length == 2) {
          rightCondition = allCondition.split("&&&")[1];
        }
        if (leftCondition.length() > 2) {
          leftCondition = leftCondition.replace("!=", "不等于");
          tempIDs = leftCondition;
          String temp = leftCondition.substring(1, leftCondition.length() - 4);
          String idtemp = tempIDs.substring(1, tempIDs.length() - 4);
          String[] strs = temp.split("\\&\\|\\&");
          String[] idstrs = idtemp.split("\\&\\|\\&");
          for (int i = 0; i < strs.length; i++) {
            if (strs[i].equals("role")) {
              Role role = this.getRoleByRoleId(strs[i + 2]);
              if (role != null)
                leftCondition = leftCondition.replaceFirst("\\&\\|\\&"
                    + strs[i + 2] + "\\&\\|\\&", "\\&\\|\\&"
                    + role.getRoleName().trim() + "\\&\\|\\&");
            } else if (strs[i].equals("part")) {
              Map<String, Object> part = this.getParticipatoryService()
                  .getParticipatoryById(Long.parseLong(strs[i + 2]));
              if (part != null)
                leftCondition = leftCondition.replaceFirst("\\&\\|\\&"
                    + strs[i + 2] + "\\&\\|\\&", "\\&\\|\\&" + part.get("name")
                    + "\\&\\|\\&");
            }
            if (!strs[i].equals(this.setDescBySign(strs[i])))
              leftCondition = leftCondition.replaceFirst("\\&\\|\\&" + strs[i]
                  + "\\&\\|\\&", "\\&\\|\\&" + this.setDescBySign(strs[i])
                  + "\\&\\|\\&");
            if (!idstrs[i].equals(this.setDescBySign(idstrs[i])))
              tempIDs = tempIDs.replaceFirst("\\&\\|\\&" + idstrs[i]
                  + "\\&\\|\\&", "\\&\\|\\&" + this.setDescBySign(idstrs[i])
                  + "\\&\\|\\&");
          }
        }
      }
    }
    List<Map<String, Object>> fieldList = null;
    if (formId != null && !formId.trim().equals("")) {
      fieldList = this
          .getWorkflowMetaList((Long.parseLong(formId.substring(5))));
      if (rightCondition != "") {
        rightCondition = rightCondition.replace("!=", "不等于");
        rightCondition = rightCondition.replace(">=", "大于等于");
        rightCondition = rightCondition.replace("<=", "小于等于");
        String temp = rightCondition.substring(1, rightCondition.length() - 4);
        String[] strs = temp.split("\\&\\|\\&");
        for (int i = 0; i < strs.length; i++) {
          if (strs[i].startsWith("FORMBUILDER_FIELD")) {
            rightCondition = rightCondition.replace(strs[i],
                this.getIndetifierByName(strs[i], fieldList));
          }
          rightCondition = rightCondition.replace(strs[i],
              this.setDescBySign(strs[i]));
        }
      }
    }
    Map<String, Object> json = new HashMap<String, Object>();
    json.put("showfieldstr", fieldList);
    json.put("rightCondition", rightCondition);
    json.put("fieldList", leftCondition);
    json.put("tempIDs", tempIDs);
    return json;
  }

  @Override
  public long getCount(long type_id, String[] where) {
    String sql = "select count(id) from ess_transferflow where 1=1 ";
    if (type_id == 0) {
      return 0;
    }
    if (type_id > 0) {
      sql = sql + " and type_id=" + type_id;
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
    return 0;
  }

  // 　生成条件
  private void getExternalPermissionsElement(
      Element stepExternalPermissionsElement, Map<String, Object> osWfModel,
      String stepId) {
    Element externalPermissionsElement = new Element("external-permissions");
    Element permissionElement = new Element("permission");
    permissionElement.setAttribute("name", "perm" + stepId);
    externalPermissionsElement.addContent(permissionElement);
    Element restrictElement = new Element("restrict-to");
    //
    Element conditionsElement = new Element("conditions");
    conditionsElement.setAttribute("type", "AND");
    // 1 cond
    Element conditionElement1 = new Element("condition");
    conditionElement1.setAttribute("type", "class");
    Element arg1Element = new Element("arg");
    arg1Element.setAttribute("name", "class.name");
    arg1Element.addContent("com.opensymphony.workflow.util.StatusCondition");
    Element arg2Element = new Element("arg");
    arg2Element.setAttribute("name", "status");
    conditionElement1.addContent(arg1Element);
    conditionElement1.addContent(arg2Element);
    // 2 cond
    Element conditionElement2 = new Element("condition");
    conditionElement2.setAttribute("type", "class");
    Element argElement2 = new Element("arg");
    argElement2.setAttribute("name", "class.name");
    argElement2
        .addContent("cn.flying.rest.service.workflow.HasUserOwnerCondition");
    conditionElement2.addContent(argElement2);
    //
    conditionsElement.addContent(conditionElement1);
    conditionsElement.addContent(conditionElement2);
    restrictElement.addContent(conditionsElement);
    permissionElement.addContent(restrictElement);
    stepExternalPermissionsElement.addContent(externalPermissionsElement);
  }

  private IFilingService getFilingService() {
    if (this.filingService == null) {
      this.filingService = this.getService(IFilingService.class);
    }
    return this.filingService;
  }

  @Override
  public String getFlowingWF(long formId) {
    String sql = "select count(id) from ess_transferform_user where wf_status='flow' and form_id=? ";
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>(),
          new Object[] { formId });
      if (cnt != null && cnt != 0) {
        return "存在正在流转的流程数据，不能进行修改操作";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "获取表单状态失败";
    }
  }

  public List<Map<String, Object>> getFlowListByIdentifier(String identifier) {
    String sql = "select * from ess_transferflow where identifier=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query
          .query(sql, new MapListHandler(), new Object[] { identifier });
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String getFlowNewName(String flowName) {
    String sql = "select id,name from ess_transferflow where name  LIKE ? AND name NOT LIKE ? order by id desc ";
    List<Map<String, Object>> allModelList = null;
    try {
      allModelList = query.query(sql, new MapListHandler(), new Object[] {
          flowName + "-%", flowName + "-%-%" });
      if (allModelList != null && !allModelList.isEmpty()) {
        int num = 1;
        for (Map<String, Object> item : allModelList) {
          String firstObjName = item.get("name").toString();
          firstObjName = firstObjName
              .substring(firstObjName.lastIndexOf("-") + 1);
          String no = firstObjName.substring(2);
          String regex = "^[0-9]+$";
          Pattern pattern = Pattern.compile(regex);
          if (pattern.matcher(no).matches()) {
            int tempNum = Integer.parseInt(no);
            if (tempNum >= num) {
              num = tempNum + 1;
            }
          }
        }
        return flowName + "-副本" + num;
      } else {
        return flowName + "-副本1";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
  }

  @Override
  public List<Map<String, Object>> getFormAppendixList(long wfId) {
    String sql = "select dataId from ess_form_appendix where wf_id=? and type='data' ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { wfId });
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getFormById(String form_id) {
    String sql = "select * from ess_transferform where form_id=? ";
    try {
      Map<String, Object> form = null;
      form = query.query(sql, new MapHandler(), new Object[] { form_id });
      if (form == null) {
        form = new HashMap<String, Object>();
      }
      return form;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getFormByTypeId(long type_id) {
    String sql = "select * from ess_document_stage where id=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { type_id });
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String getFormFlowId(String flowIds, String flowId, String status) {
    String newIds = "";
    if (!"".equals(flowIds) && flowIds != null) {
      String[] ids = flowIds.split(",");
      for (int i = 0; i < ids.length; i++) {
        if (!ids[i].equals(flowId)) {
          newIds += "," + ids[i];
        }
      }
    }
    if ("1".equals(status)) {
      newIds += "," + flowId;
    }
    return newIds.length() > 0 ? newIds.substring(1) : "";
  }

  @Override
  public String getFormNewTitle(String title) {
    String sql = "select * from ess_transferform where name like ? and name not like ?  ORDER BY ID DESC ";
    List<Map<String, Object>> backups = null;
    try {
      backups = query.query(sql, new MapListHandler(), new Object[] {
          title + "-副本%", title + "-副本%-%" });
      if (backups == null) {
        backups = new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
    if (backups != null && !backups.isEmpty()) {
      int num = 1;
      for (Map<String, Object> item : backups) {
        String firstObjName = item.get("name").toString();
        firstObjName = firstObjName
            .substring(firstObjName.lastIndexOf("-") + 1);
        String no = firstObjName.substring(2);
        String regex = "^[0-9]+$";
        Pattern pattern = Pattern.compile(regex);
        if (pattern.matcher(no).matches()) {
          int tempNum = Integer.parseInt(no);
          if (tempNum >= num) {
            num = tempNum + 1;
          }
        }
      }
      return title + "-副本" + num;
    } else {
      return title + "-副本1";
    }
  }

  public Map<String, Object> getFunctionById(long id) {
    String sql = "select * from ess_transferfunctions where id=? ";
    try {
      Map<String, Object> function = null;
      function = query.query(sql, new MapHandler(), new Object[] { id });
      if (function == null) {
        function = new HashMap<String, Object>();
      }
      return function;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private List<Map<String, Object>> getFunctionByStageId(String stageId) {
    String sql = "select * from ess_transferfunctions where FIND_IN_SET("
        + stageId + ",stageId) ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public long getFunctionCount(Map<String, Object> map) {
    String sql = "select count(id) from ess_transferfunctions where 1=1 ";
    StringBuffer fs = new StringBuffer();
    fs.append("functionName,restFullClassName,exeFunction,description,relationBusiness,stageId");
    sql = sql + this.getKeywordCondition(fs, map.get("keyWord").toString());
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
    return 0;
  }

  @Override
  public List<Map<String, Object>> getFunctionList(Map<String, Object> function) {
    String sql = "select * from ess_transferfunctions where 1=1 ";
    if (function != null) {
      StringBuffer fs = new StringBuffer();
      fs.append("functionName,restFullClassName,exeFunction,description,relationBusiness,stageId");
      sql = sql
          + this.getKeywordCondition(fs, function.get("keyWord").toString());
      sql = sql + " limit " + function.get("startNo").toString() + ","
          + function.get("limit").toString();
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private Map<String, Object> getFunctionParameter(Map<String, Object> parameter) {
    String sql = "select * from ess_transferfunctions_param where flow_id=? and action_id=? and function_id=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(),
          new Object[] { parameter.get("flowId"), parameter.get("actionId"),
              parameter.get("functionId") });
      if (map == null) {
        map = new HashMap<String, Object>();
      }
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private Map<String, Object> getHistoryOwner(long wfId) {
    String sql = "select eco.`owner`,`user`.user_id from ess_transferform_user user LEFT JOIN ess_collaborativemanage eco ON `user`.id=eco.userformid where `user`.wf_id=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), new Object[] { wfId });
      if (map == null || map.isEmpty()) {
        return new HashMap<String, Object>();
      }
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  public IFilingService getIFilingService() {
    if (iFilingService == null) {
      iFilingService = this.getService(IFilingService.class);
    }
    return iFilingService;
  }

  private String getIndetifierByName(String name,
      List<Map<String, Object>> fieldlist) {
    for (Map<String, Object> en : fieldlist) {
      if (name.equals(en.get("name").toString())) {
        return this.checkIfNull(en.get("esidentifier"), "");
      }
    }
    return name;
  }

  // 生成初始化
  private void getInitActionElement(Element initElement,
      Map<String, Object> osWfModel, String firstStepId) {
    String firstRoles = this.checkIfNull(osWfModel.get("first_step_roles"), "");
    if (null != firstRoles && !firstRoles.equals("")) {
      Element restrictElement = new Element("restrict-to");
      Element conditionsElement = new Element("conditions");
      Element conditionElement = new Element("condition");
      conditionElement.setAttribute("type", "class");
      Element arg1Element = new Element("arg");
      arg1Element.setAttribute("name", "class.name");
      arg1Element
          .addContent("com.opensymphony.workflow.util.OSUserGroupCondition");
      Element arg2Element = new Element("arg");
      arg2Element.setAttribute("name", "group");
      arg2Element.addContent(firstRoles);
      conditionElement.addContent(arg1Element);
      conditionElement.addContent(arg2Element);
      conditionsElement.addContent(conditionElement);
      restrictElement.addContent(conditionsElement);
      initElement.addContent(restrictElement);
    }

    Element prefunctionsElement = new Element("pre-functions");
    Element functionElement = new Element("function");
    functionElement.setAttribute("type", "class");
    Element argElement = new Element("arg");
    argElement.setAttribute("name", "class.name");
    argElement.addContent("com.opensymphony.workflow.util.Caller");
    functionElement.addContent(argElement);
    prefunctionsElement.addContent(functionElement);
    initElement.addContent(prefunctionsElement);

    Element resultsElement = new Element("results");
    Element unconditionalresultElement = new Element("unconditional-result");
    unconditionalresultElement.setAttribute("old-status", "Finished");
    unconditionalresultElement.setAttribute("status", "Underway");
    unconditionalresultElement.setAttribute("step", firstStepId);
    unconditionalresultElement.setAttribute("owner", "${caller}");
    resultsElement.addContent(unconditionalresultElement);
    initElement.addContent(resultsElement);
  }

  private String getKeywordCondition(StringBuffer fs, String searchKeyword) {
    StringBuffer buffer = new StringBuffer();

    /** lujixiang 20150423 添加支持角色搜索多个关键词 **/
    String[] searchWorkArr = searchKeyword.split("\\s+");
    int mark = 0;
    for (int p = 0; p < searchWorkArr.length; p++) {

      if (null == searchWorkArr[p] || "".equals(searchWorkArr[p])) {
        continue;
      }

      if (mark == 0) {
        buffer.append("and ( ");
      } else {
        buffer.append("or ");
      }

      for (int i = 0; i < fs.toString().split(",").length; i++) {
        String f = fs.toString().split(",")[i];
        if (i == 0) {
          buffer
              .append("( " + f + " like binary '%" + searchWorkArr[p] + "%' ");
        } else {
          buffer.append(" or " + f + " like binary '%" + searchWorkArr[p]
              + "%' ");
        }
      }
      buffer.append(")");
      mark++;
    }
    if (searchKeyword != null && !"".equals(searchKeyword)) {
      buffer.append(")");
    }
    return buffer.toString();
  }

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private MessageWS getMessageWS() {
    if (this.messageWS == null) {
      this.messageWS = this.getService(MessageWS.class);
    }
    return this.messageWS;
  }

  @Override
  public Map<String, Object> getModelInit(long modelId) {
    String sql = "select * from ess_transferflow where id=? ";
    try {
      Map<String, Object> model = null;
      model = query.query(sql, new MapHandler(), new Object[] { modelId });
      if (model == null) {
        model = new HashMap<String, Object>();
      }
      return model;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private long getNewAppendIxID() {
    String sql = "select max(id)+1 as newid from ess_form_appendix ";
    try {
      Map<String, Object> obj = query.query(sql, new MapHandler());
      Object newid = obj.get("newid");
      if (!obj.isEmpty() && newid != null) {
        return Long.parseLong(newid.toString());
      }
      return 1l;
    } catch (SQLException e) {
      e.printStackTrace();
      return 1l;
    }
  }

  public Long getNewComboID() {
    String sql = "select max(id_combo) as id from ess_formbuildercombo";
    Long id = null;
    try {
      id = query.query(sql, new ScalarHandler<Long>());
      if (id != null)
        return id + 1L;
    } catch (SQLException e) {
      e.printStackTrace();
      return 1L;
    }
    return 1L;
  }

  public Long getNewComboValueID() {
    String sql = "select max(id_value) as id from ess_formbuildercombovalues";
    Long id = null;
    try {
      id = query.query(sql, new ScalarHandler<Long>());
      if (id != null)
        return id + 1L;
    } catch (SQLException e) {
      e.printStackTrace();
      return 1L;
    }
    return 1L;
  }

  @Override
  public Pair<Boolean, List<Map<String, Object>>> getNextStepFromGraphXML(
      Map<String, Object> osWfModel, String actionId) {
    String graphXml = osWfModel.get("graphXml").toString();
    if (null == graphXml)
      return null;
    Pair<Boolean, List<Map<String, Object>>> returnData = new Pair<Boolean, List<Map<String, Object>>>();
    List<Map<String, Object>> listStep = new ArrayList<Map<String, Object>>();
    try {
      Element el = this.readerGraphXml(graphXml, actionId);
      Attribute target = el.getAttribute("target");
      Attribute edge = el.getAttribute("edge");
      // 如果是动作
      if (null != edge && edge.getValue().equals("1")) {
        String targetId = target.getValue();
        Element nextStepEl = this.readerGraphXml(graphXml, targetId);
        Attribute nextStepValue = nextStepEl.getAttribute("value");
        if (!nextStepValue.getValue().equals("分支")
            && !nextStepValue.getValue().equals("聚合")) {
          listStep.add(this.getStepUser(
              Long.parseLong(osWfModel.get("id").toString()),
              Long.parseLong(targetId)));
          returnData.left = false;
          returnData.right = listStep;
          return returnData;
        } else {
          // 如果下一步是分支或聚合，就接收查找，直到找到步骤为止；
          Attribute nextStepId = nextStepEl.getAttribute("id");
          List<org.dom4j.Element> allActions = this.getAllActionFromGraphXml(
              graphXml, "//mxCell[@edge='1']");
          StringBuffer ids = new StringBuffer();
          for (org.dom4j.Element e : allActions) {
            org.dom4j.Attribute sourceId = e.attribute("source");
            if (nextStepId.getValue().equals(sourceId.getText())) {
              org.dom4j.Attribute stargetId = e.attribute("target");
              ids.append(" step_id = ").append(stargetId.getText())
                  .append(" OR");
            }
          }
          if (!ids.equals("")) {
            ids.deleteCharAt(ids.length() - 1);
            ids.deleteCharAt(ids.length() - 1);
            try {
              String sql = "select * from ess_transferstep where flow_id="
                  + osWfModel.get("id") + " and (" + ids + ") ";
              listStep = query.query(sql, new MapListHandler());
            } catch (SQLException e) {
              e.printStackTrace();
            }
          }
          returnData.left = true;
          returnData.right = listStep;
          return returnData;
        }
      }
    } catch (DocumentException e) {
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    }
    return returnData;
  }

  private List<UserEntry> getNoticesFiltingAuditor(List<UserEntry> userList,
      Long wfID) {
    List<UserEntry> users = new ArrayList<UserEntry>();
    for (UserEntry user : userList) {
      if (!isAuditor(user.getUserid(), wfID))
        users.add(user);
    }
    return users;
  }

  @Override
  public List<Map<String, Object>> getNoticeUsersNew(long flow_id,
      long action_id) {
    Map<String, Object> action = this.getActionByFlowAndAction(flow_id,
        action_id);
    List<Map<String, Object>> userList = new ArrayList<Map<String, Object>>();
    Object users = action.get("notice_users");
    if (null != action && null != users) {
      userList = this.getStepAndNoticeUserList(userList, users, "user");
    }
    Object roles = action.get("notice_roles");
    if (null != action && null != roles) {
      userList = this.getStepAndNoticeUserList(userList, roles, "role");
    }
    return userList;
  }

  private long getOpioionPrimaryKey() {
    String sql = "select MAX(id)+1 from ess_transferform_opinion ";
    try {
      Long id = query.query(sql, new ScalarHandler<Long>());
      if (id != null) {
        return id;
      }
      return 1l;
    } catch (SQLException e) {
      e.printStackTrace();
      return 1l;
    }
  }

  @Override
  public Map<String, Object> getOsWfActionByModelAndActionId(long flowId,
      long actionId) {
    String sql = "select * from ess_transferaction WHERE flow_id=? and action_id=? ";
    try {
      Map<String, Object> action = null;
      action = query.query(sql, new MapHandler(), new Object[] { flowId,
          actionId });
      if (action == null || action.isEmpty()) {
        action = new HashMap<String, Object>();
      }
      return action;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private IParticipatoryService getParticipatoryService() {
    if (iParticipatoryService == null) {
      iParticipatoryService = this.getService(IParticipatoryService.class);
    }
    return iParticipatoryService;
  }

  private Role getRoleByRoleId(String roleId) {
    String sql = "select * from ess_role where roleId=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), new Object[] { roleId });
      Role role = new Role();
      if (map != null) {
        role.setId(map.get("id").toString());
        role.setRoleId(map.get("roleId").toString());
        role.setRoleName(map.get("roleName").toString());
        role.setRoleRemark(map.get("roleRemark").toString());
        role.setCreateTime(map.get("createTime").toString());
        role.setUpdateTime(map.get("updateTime").toString());
        role.setIsSystem(map.get("isSystem").toString());
      }
      return role;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private IRoleService getRoleService() {
    if (this.roleService == null) {
      this.roleService = this.getService(IRoleService.class);
    }
    return this.roleService;
  }

  public List<UserEntry> getRUsers(String userId, UserEntry user,
      Integer isRelation) {
    List<UserEntry> userList = new ArrayList<UserEntry>();
    try {
      UserEntry tempUser = this.getUserQueryService().getUserByUserName(userId);
      /** 过滤掉未启用的用户 **/
      if (tempUser.getUserStatus() == 0) {
        return userList;
      }
      // 是否关联机构
      if (isRelation.intValue() == 1) {
        // 判断提交人和下一步审批人的机构是不是一样；
        List<Participatory> parts = this.getParticipatoryService()
            .getParticipatoryByUserId(userId);
        if (parts.get(0).getCode() == user.getDeptCode()) {
          userList.add(tempUser);
        }
      } else {
        userList.add(tempUser);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return userList;
  }

  private String getServiceAddress() {
    @SuppressWarnings("deprecation")
    String url = this.getNamingService().findApp(this.instanceId,
        "transferFlow", this.getServiceId(), this.getMyAppToken());
    String temp = url.substring(url.indexOf("rest"), url.length());
    String outFile = url.replace(temp, "data/");
    return outFile;
  }

  private String getSignByDesc(String desc) {
    if (desc.equals("单位部门"))
      return "part";
    else if (desc.equals("角色"))
      return "role";
    else if (desc.equals("等于"))
      return "=";
    else if (desc.equals("不等于"))
      return "!=";
    else if (desc.equals("大于"))
      return ">";
    else if (desc.equals("小于"))
      return "<";
    else if (desc.equals("大于等于"))
      return ">=";
    else if (desc.equals("小于等于"))
      return "<=";
    else if (desc.equals("包含"))
      return "like";
    else if (desc.equals("不包含"))
      return "notLike";
    else if (desc.equals("并且"))
      return "and";
    else if (desc.equals("或者"))
      return "or";
    return desc;
  }

  private Map<String, String> getSourceList(Map<String, Object> mp, String id) {
    id = mp.get("id").toString();
    Map<String, String> sourceMap = new HashMap<String, String>();
    sourceMap.put("display", mp.get("functionName").toString());
    sourceMap.put("name", id);
    return sourceMap;
  }

  private List<Map<String, Object>> getStepAndNoticeUserList(
      List<Map<String, Object>> userList, Object obj, String flag) {
    int index = userList.size();
    String objs = obj.toString();
    if (!"".equals(objs)) {
      String[] objIds = objs.split(",");
      for (int i = 0; i < objIds.length; i++) {
        Map<String, Object> userMap = new HashMap<String, Object>();
        userMap.put("id", i + index);
        userMap.put("flag", flag);
        userMap.put("user", objIds[i]);
        if ("user".equals(flag)) {
          UserEntry ue = this.getUserQueryService()
              .getUserByUserName(objIds[i]);
          userMap.put("name", ue.getDisplayName());
        }
        if ("role".equals(flag)) {
          Role role = this.getRoleByRoleId(objIds[i]);
          userMap.put("name", role.getRoleName());
        }
        userList.add(userMap);
      }
    }
    return userList;
  }

  @Override
  public List<Map<String, Object>> getStepByFlowId(long flow_id) {
    String sql = "select * from ess_transferstep where flow_id=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { flow_id });
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getStepUser(long flowId, long stepId) {
    String sql = "select * from ess_transferstep where flow_id=? and step_id=? ";
    try {
      Map<String, Object> step = query.query(sql, new MapHandler(),
          new Object[] { flowId, stepId });
      if (step == null) {
        step = new HashMap<String, Object>();
      }
      return step;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private String getTempPath() {
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos + 8);
    String fileName = web_infPath.toString() + "data/";
    File tmp = new File(fileName);
    if (!tmp.exists()) {
      tmp.mkdir();
    }
    return fileName;
  }

  private Map<String, Object> getTranferFormByFlowId(Object flowID) {
    Map<String, Object> map = null;
    try {
      String sql = "select * from ess_transferform where find_in_set(?,flow_id)";
      map = query.query(sql, new MapHandler(), flowID);
      if (map == null || map.isEmpty()) {
        map = new HashMap<String, Object>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public List<Map<String, Object>> getTree() {
    String sql = "select * from ess_transferflow_type ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      Map<String, Object> map = new HashMap<String, Object>();
      map.put("id", 0);
      map.put("pId", -1);
      map.put("name", "工作流类型");
      list.add(0, map);
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getTypeById(long id) {
    String sql = "select * from ess_transferflow_type where id=? ";
    try {
      Map<String, Object> type = null;
      type = query.query(sql, new MapHandler(), new Object[] { id });
      if (type == null) {
        type = new HashMap<String, Object>();
      }
      return type;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getUserIdsByRole(String roleIds) {
    String sql = "select * from ess_user_role where 1=1 ";
    if (!"".equals(roleIds) && roleIds != null) {
      sql = sql + " and roleId in(" + roleIds + ") ";
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private String getUserNameByUserFormIdAndNowUserId(long userFormID,
      int userId, String type) {
    try {
      StringBuffer sql = new StringBuffer(100);
      sql.append("select ");
      if (type.equals("to")) {
        sql.append(" user_id as userid ");
      } else {
        sql.append(" forward_user_id as userid ");
      }
      sql.append(" from ess_transferform_user_forward where forward_id = "
          + userFormID);
      if (type.equals("to")) {
        sql.append(" and forward_user_id = " + userId);
      } else {
        sql.append(" and user_id = " + userId);
      }
      Map<String, Object> user = query.query(sql.toString(), new MapHandler());
      if (user != null && !user.isEmpty()) {
        UserEntry ue = this.getUserQueryService().getUserInfoById(
            user.get("userid").toString());
        return ue.getUserid();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return "";
  }

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }

  public List<UserEntry> getUsers(String roleId, UserEntry user,
      Integer isRelation) {
    List<UserEntry> userList = new ArrayList<UserEntry>();
    Role role = this.getRoleByRoleId(roleId);
    List<Map<String, Object>> users = this.getRoleService()
        .getUserListByRoleId(Long.parseLong(role.getId()));
    for (Map<String, Object> tempUser : users) {
      UserEntry ue = this.getUserQueryService().getUserInfoById(
          tempUser.get("userId").toString());
      if (ue.getUserStatus() == 0)
        continue;
      // 是否关联机构
      if (isRelation.intValue() == 1) {
        // 判断提交人和下一步审批人的机构是不是一样；
        List<Participatory> parts = this.getParticipatoryService()
            .getParticipatoryByUserId(ue.getUserid());
        if (parts.get(0).getCode() == user.getDeptCode()) {
          userList.add(ue);
        }
      } else {
        userList.add(ue);
      }
    }
    return userList;
  }

  public Map<String, String> getValidatedStep(Long modelID, UserEntry user,
      List<Map<String, Object>> listStep, String firstActionId) {
    Map<String, String> map = new HashMap<String, String>();
    List<Map<String, Object>> actions = this.validateSplitActionIsFrom(
        this.getModelInit(modelID), firstActionId);

    for (Map<String, Object> oneAction : actions) {
      String splitCondtion = oneAction.get("condition").toString();
      if (null != splitCondtion && !"".equals(splitCondtion)) {
        boolean check = this.SplitValidator(splitCondtion, user);
        if (check) {
          Long actionID = Long.parseLong(oneAction.get("action_id").toString());
          Integer currStepID = null;
          try {
            Pair<Boolean, List<Map<String, Object>>> stepData = getNextStepFromGraphXML(
                this.getModelInit(modelID), String.valueOf(actionID));
            List<Map<String, Object>> stepList = stepData.right;
            currStepID = Integer.parseInt(stepList.get(0).get("step_id")
                .toString());
          } catch (Exception e) {
            continue;
          }
          for (Map<String, Object> stepEntity : listStep) {
            if (String.valueOf(currStepID).equals(
                stepEntity.get("step_id").toString())) {
              Pair<Boolean, List<Map<String, Object>>> stepData = getNextStepFromGraphXML(
                  this.getModelInit(modelID), String.valueOf(actionID));
              List<Map<String, Object>> stepList = stepData.right;
              Integer tempStepID = Integer.parseInt(stepList.get(0)
                  .get("step_id").toString());
              map.put("stepID", tempStepID.toString());
              return map;
            }
          }
        }
      }
    }
    return new HashMap<String, String>();
  }

  private List<Map<String, Object>> getWfCurrentStepId(String wfId,
      String conntion) {
    String sql = "select *  from os_currentstep where 1=1 ";
    if (!wfId.equals("")) {
      sql = sql + " and entry_id = " + wfId;
    }
    if (!"".equals(conntion)) {
      sql = sql + " and " + conntion;
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String getWfLastStepId(String flowId, String conntion) {
    String sql = "select step_id  from os_historystep where entry_id = "
        + flowId;
    if (!"".equals(conntion)) {
      sql = sql + " and " + conntion;
    }
    try {
      Map<String, Object> result = query.query(sql, new MapHandler());
      if (result != null && result.size() > 0) {
        return result.get("step_id").toString();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return "";
  }

  public String getWfPreStepDealedUsers(String wfId, String stepId) {
    String preStepDealedUsers = "";
    String sql = "select owner,step_id from os_historystep where ENTRY_ID = "
        + wfId + " AND step_id != " + stepId + " ORDER BY ID DESC";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      String tempPreStepDealedUsers = "";
      int preStepId = 0;
      for (int i = 0; i < list.size(); i++) {
        Map<String, Object> map = list.get(i);
        int tempPreStepId = Integer.parseInt(map.get("step_id").toString());
        UserEntry ue = this.getUserQueryService().getUserByUserName(
            map.get("owner").toString());
        if (preStepId == 0) {
          tempPreStepDealedUsers = ue.getId() + ";";
          preStepId = tempPreStepId;
        } else if (preStepId == tempPreStepId) {
          tempPreStepDealedUsers = tempPreStepDealedUsers + ue.getId() + ";";
        } else {
          break;
        }
      }
      preStepDealedUsers = preStepDealedUsers + preStepId + ':'
          + tempPreStepDealedUsers + '-';
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return preStepDealedUsers;
  }

  public Workflow getWorkflow(String user) {
    Workflow workflow = new BasicWorkflow(user);
    workflow.setConfiguration(wfConfiguration);
    return workflow;
  }

  @Override
  public List<Map<String, Object>> getWorkflowMetaList(long stageId) {
    String sql = "select code,name,esidentifier from ess_document_metadata where stageId=? or isSystem=0 ";
    try {
      List<Map<String, Object>> list = null;
      List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
      list = query.query(sql, new MapListHandler(), new Object[] { stageId });
      if (list == null || list.size() == 0) {
        result = new ArrayList<Map<String, Object>>();
      } else {
        for (Map<String, Object> mataMap : list) {
          // rongying 20150429 后添加的收集范围名称等元数据字段不显示
          if ("stageName".equals(mataMap.get("code") + "")
              || "deviceName".equals(mataMap.get("code") + "")
              || "participatoryName".equals(mataMap.get("code") + "")
              || "documentTypeName".equals(mataMap.get("code") + "")
              || "engineeringName".equals(mataMap.get("code") + "")
              || "stageId".equals(mataMap.get("code") + "")) {
            continue;
          }
          result.add(mataMap);
        }
      }
      return result;
    } catch (SQLException e) {
      e.printStackTrace();
      return new ArrayList<Map<String, Object>>();
    }
  }

  private List<Map<String, Object>> getWorkFlowOpinion(long wfId,
      String forwarduserid) {
    try {
      String sql = "SELECT * FROM ess_transferform_opinion where wf_id=? and forwarduserid=? ";
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { wfId,
          forwarduserid });
      if (list == null || list.isEmpty()) {
        return new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<EssReport> getWorkflowReportList() {
    String sql = " select * from ess_report where REPORTTYPE='workflow' order by ID_REPORT ";
    List<EssReport> result = new ArrayList<EssReport>();
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      for (int i = 0; i < list.size(); i++) {
        Map<String, Object> map = list.get(i);
        EssReport report = new EssReport();
        report.setIdReport(Long.parseLong(map.get("ID_REPORT").toString()));
        report.setResourcelevel(this.checkIfNull(map.get("RESOURCELEVEL"), ""));
        report.setReportstyle(this.checkIfNull(map.get("REPORTSTYLE"), ""));
        report.setTitle(this.checkIfNull(map.get("TITLE"), ""));
        report.setPerpage(this.checkIfNull(map.get("PERPAGE"), ""));
        report.setIshave(this.checkIfNull(map.get("ISHAVE"), ""));
        report.setUplodaer(this.checkIfNull(map.get("UPLODAER"), ""));
        result.add(report);
      }
      return result;
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  private Map<String, Object> getWorkflowStepParms(boolean isFirstStep,
      String wfModelId, String formId, UserEntry user, long wfId,
      String selectUsers, String actionId, String stepId) throws Exception {
    WorkflowStore wfs = null;
    try {
      wfs = ((MySpringConfiguration) this.wfConfiguration).getWorkflowStore();
    } catch (StoreException e1) {
      e1.printStackTrace();
    }
    PropertySet ps = null;
    try {
      ps = ((JDBCTemplateWorkflowStore) wfs).getPropertySet(wfId);
    } catch (StoreException e) {
      e.printStackTrace();
    }
    Map<String, Object> map = new HashMap<String, Object>();
    map.put(PARM_FORM_ID, formId);
    map.put(PARM_CURRENT_USER, user);
    map.put(PARM_WF_ID, String.valueOf(wfId));
    map.put(PARM_WF_STEP_ID, stepId);
    map.put(PARM_WF_ACTION_ID, actionId);
    map.put(PARM_WF_MODEL, wfModelId);
    map.put(PLATFORM_SERVICEPROVIDER, this.compLocator);
    map.put("instanceId", this.instanceId);

    if (null != selectUsers && !selectUsers.equals("")) {
      String[] splitSteps = selectUsers.split("-");
      for (int m = 0; m < splitSteps.length; m++) {
        StringBuffer buffer = new StringBuffer();
        String[] users = splitSteps[m].split(":");
        String[] nextOwner = users[1].split(";");
        for (int i = 0; i < nextOwner.length; i++) {

          UserEntry tempUser = getUserQueryService().getUserInfoById(
              nextOwner[i]);
          if (buffer.toString().contains(tempUser.getUserid())) {
            continue;
          }
          buffer.append(tempUser.getUserid()).append(";");
        }
        if (buffer.toString().endsWith(";")) {
          buffer.deleteCharAt(buffer.length() - 1);
        }
        ps.setString("ower" + users[0], buffer.toString());
      }
    }
    if (isFirstStep) {
      ps.setString("ower" + stepId, user.getUserid());
      ps.setString("caller", user.getUserid());
    }
    return map;
  }

  @Override
  public Map<String, Object> getWorkFlowXml(long modelId) {
    Map<String, Object> model = this.getModelInit(modelId);
    String graphXml = "";
    if (model.get("graphXml") != null) {
      String[] graph = model.get("graphXml").toString().split("\n");
      for (int i = 0; i < graph.length; i++) {
        graphXml = graphXml + graph[i];
      }
    }
    model.put("graphXml", graphXml);
    return model;
  }

  @SuppressWarnings("unchecked")
  @Override
  public String importWorkflow(HttpServletRequest request,
      HttpServletResponse response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    DiskFileItemFactory factory = new DiskFileItemFactory();
    factory.setSizeThreshold(2048);
    ServletFileUpload upload = new ServletFileUpload(factory);
    upload.setHeaderEncoding("UTF-8");
    String userId = null;
    String remoteAddr = null;
    String typeId = null;
    String typename = null;
    FileItem formFile = null;
    List<FileItem> items;
    String fileName = null;
    try {
      items = upload.parseRequest(request);
      for (FileItem item : items) {
        if ("userId".equals(item.getFieldName())) {
          userId = item.getString("UTF-8");
        } else if ("remoteAddr".equals(item.getFieldName())) {
          remoteAddr = item.getString("UTF-8");
        } else if ("typeId".equals(item.getFieldName())) {
          typeId = item.getString("UTF-8");
        } else if ("typename".equals(item.getFieldName())) {
          typename = item.getString("UTF-8");
        } else if (!item.isFormField()) {
          formFile = item;
        }
      }
      fileName = formFile.getName();
    } catch (FileUploadException e) {
      e.printStackTrace();
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    Map<String, Object> result = importWorkflowModel(formFile, userId, typeId);
    if ("true".equals(result.get("isOK"))) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", remoteAddr);
      log.put("userid", userId);
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：导入工作流模板");
      log.put("loginfo", "工作流类型【" + typename + "】导入文件【" + fileName + "】的流程模板成功");
      this.getLogService().saveLog(log);
    } else {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", remoteAddr);
      log.put("userid", userId);
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：导入工作流模板");
      log.put("loginfo", "工作流类型【" + typename + "】导入文件【" + fileName + "】的流程模板失败");
    }
    String resultStr = (String) result.get("result");
    resultStr = null == resultStr ? "" : resultStr;

    return resultStr;
  }

  private Map<String, Object> importWorkflowModel(FileItem formFile,
      String userId, String typeId) {
    ImportWFDataUtil util = ImportWFDataUtil.newInstance(this);
    String tempDataPath = this.getTempPath();
    String fileFullPath = this._upLoadFile(formFile, tempDataPath);
    String tempPath = fileFullPath.replace(".wf", ".xml");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    DocumentBuilder builder;
    String importType = "";
    org.w3c.dom.Document document = null;
    Map<String, Object> json = new HashMap<String, Object>();
    StringBuffer result = new StringBuffer();
    try {
      builder = factory.newDocumentBuilder();
      // 执行转换
      Base64Util.decode(fileFullPath, tempPath);
      document = builder.parse(new File(tempPath));
      // 文件类型 1 表单文件 2 模版文件 3 表单文件和模版文件
      importType = document.getDocumentElement().getAttribute("importType");
    } catch (Exception e) {
      json.put("isOK", "false");
      json.put("errorMsg", "导入流程失败,发生异常");
      json.put("success", true);
      result.append("{\"isOK\":\"false\", ").append("\"errorMsg\":\"导入失败\", ")
          .append("\"success\": true }");
      json.put("result", result.toString());
      return json;
    }
    if ("1".equals(importType)) {
      json.put("importType", importType);
      json.put("isOK", "true");
      json.put("success", true);
      result.append("{\"importType\":" + importType + ", ")
          .append("\"isOK\":\"true\", ").append("\"success\": true }");
      json.put("result", result.toString());
      return json;
    }
    if (util.importWFData(tempPath, userId, typeId)) {
      json.put("importType", importType);
      json.put("isOK", "true");
      json.put("success", true);
      result.append("{\"importType\":" + importType + ", ")
          .append("\"isOK\":\"true\", ").append("\"success\": true }");
      json.put("result", result.toString());
    } else {
      json.put("isOK", "false");
      json.put("success", false);
      result.append("\"isOK\":\"false\", ").append("\"success\": false }");
      json.put("result", result.toString());
    }
    return json;
  }

  @Override
  public String initializeWorkflow(String params) {

    Element rootElement = validateXml(params);
    if (null == rootElement) {
      return "-1";
    }

    Element tempElement = rootElement.getChild("username");
    String username = tempElement.getValue();

    tempElement = rootElement.getChild("wfIdentifier");
    String wfIdentifier = tempElement.getValue();

    return String.valueOf(initializeWorkflow(username, wfIdentifier, null));
  }

  private long initializeWorkflow(String user, String workflowName,
      @SuppressWarnings("rawtypes") Map inputs) {
    long id = -1;
    try {
      Workflow wf = getWorkflow(user);

      id = wf.initialize(workflowName, 2, inputs);

    } catch (InvalidActionException e) {
      // log
      e.printStackTrace();
    } catch (InvalidRoleException e) {
      // log
      e.printStackTrace();
    } catch (InvalidInputException e) {
      // log
      e.printStackTrace();
    } catch (InvalidEntryStateException e) {
      // log
      e.printStackTrace();
    } catch (WorkflowException e) {
      // log
      e.printStackTrace();
    }
    return id;
  }

  private boolean insertFlowForm(Map<String, Object> model) {
    String sql = "insert into ess_transferform(status,name,form_type_id, form_js,form_id,flow_id,creater,createtime,form_js_html,form_js_html_usingsystem,is_create_table) values(?,?,?,?,?,?,?,?,?,?,?) ";
    try {
      long id = query.insert(
          sql,
          new ScalarHandler<Long>(),
          new Object[] { 1, "表单" + model.get("stageId"), model.get("stageId"),
              "", "form-" + model.get("stageId"), model.get("modelId"),
              model.get("creater"), model.get("createtime"), "", "", 1 });
      if (id > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private Map<String, Object> insertModelInit(Map<String, Object> model) {
    String sql = "insert into ess_transferflow(identifier,type_id,name,version,status,describtion,form_relation,business_relation,relation_table,creater,createtime) values(?,?,?,?,?,?,?,?,?,?,?) ";
    try {
      long row = query.insert(
          sql,
          new ScalarHandler<Long>(),
          new Object[] { "workflow" + System.currentTimeMillis(),
              model.get("typeId"), model.get("name"), "1", 0,
              model.get("describtion"), "form-" + model.get("stageId"),
              model.get("selectBusiness"), "esp_" + model.get("stageId"),
              model.get("creater"), model.get("createtime") });
      if (row > 0) {
        model.put("modelId", row);
        this.operateFlowForm(model);
        // this.alterEspFlowForm(Long.parseLong(model.get("stageId").toString()));
        return model;
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean isAuditor(String username, Long wfID) {
    // 只检索协同类型 因此固定加上条件 workflowtype = 3
    String sql = "select userform.id from ess_transferform_user userform right join ess_collaborativemanage coll on userform.id = coll.userformid where coll.owner = '"
        + username + "' and userform.wf_id = " + wfID + " and workflowtype = 3";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null || list.isEmpty()) {
        return false;
      }
      return true;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return false;
  }

  @Override
  public String isHavedWFData(Map<String, Object> flow) {
    String sql = "select count(id) cnt from ess_transferform_user tu where FIND_IN_SET(wf_id,?)";
    String sqlWF = "select ow.id from os_wfentry  ow LEFT JOIN ess_transferflow tf ON ow.`NAME`=tf.identifier where tf.id=? ";
    Object formId = flow.get("formId");
    if (formId != null && !"".equals(formId.toString())) {
      sql = sql + " and form_id='" + formId + "'";
    }
    try {
      List<Long> lwf = query.query(sqlWF, new ColumnListHandler<Long>(),
          new Object[] { flow.get("modelId") });
      String wfs = "";
      for (long wf : lwf) {
        wfs += "," + wf;
      }
      wfs = wfs.length() > 0 ? wfs.substring(1) : "";
      Long cnt = query.query(sql, new ScalarHandler<Long>(),
          new Object[] { wfs });
      if (cnt != null && cnt > 0) {
        return "系统中存在相关的流程数据，为了流程可以正常使用，不能进行删除操作！";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "验证是否存在已流转的数据失败";
    }
  }

  @Override
  public Map<String, Object> isLastStep(Map<String, Object> map) {
    Map<String, Object> json = new HashMap<String, Object>();
    String flowId = map.get("flowId").toString();
    String actionId = map.get("actionId").toString();
    Map<String, Object> flow = this.getModelInit(Long.parseLong(flowId));
    if (this.nextStepIsLastStep(flow, actionId)) {
      json.put("isLastStep", "true");
    } else {
      Pair<Boolean, List<Map<String, Object>>> stepData = this
          .getNextStepFromGraphXML(flow, actionId);
      List<Map<String, Object>> listStep = stepData.right;
      if (null != listStep && !listStep.isEmpty()) {
        if (listStep.size() == 1) {
          if (listStep.get(0).get("step_id").equals(flow.get("first_step_id"))) {
            json.put("isLastStep", "true");
          } else {
            json.put("isLastStep", "false");
          }
        } else {
          json.put("isLastStep", "false");
        }
      } else {
        json.put("isLastStep", "false");
      }
    }
    return json;
  }

  private boolean isWfForwardExist(long userId, long forwardUserId,
      long forwardId) {
    try {
      String sql = "SELECT * FROM ess_transferform_user_forward eouf where eouf.user_id="
          + userId
          + " AND eouf.forward_id="
          + forwardId
          + " AND eouf.forward_user_id=" + forwardUserId;
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list != null && !list.isEmpty()) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public boolean killWorkflow(long workflowId) {
    try {
      if (getWorkflow("admin").canModifyEntryState(workflowId,
          WorkflowEntry.KILLED)) {
        getWorkflow("admin").changeEntryState(workflowId, WorkflowEntry.KILLED);
      } else {
        return false;
      }
    } catch (WorkflowException e) {
      e.printStackTrace();
      return false;
    }
    return true;
  }

  private void modifyESSOA_WORKFLOW_XML(String wfIdentifier) {
    SAXBuilder saxBuilder = new SAXBuilder();
    try {
      Document doc = saxBuilder.build(new File(getBaseDir()
          + "ESSOA_WORKFLOWS.xml"));
      Element newElement = new Element("workflow");
      newElement.setAttribute("name", wfIdentifier);
      newElement.setAttribute("type", "file");
      newElement.setAttribute("location", wfIdentifier + ".xml");
      Element root = doc.getRootElement();
      @SuppressWarnings("unchecked")
      List<Element> list = root.getChildren();
      /** 获取工作流发布的基础路径 **/
      if (root.getAttribute("basedir") == null) {
        root.setAttribute("basedir", getBaseDir());
      }
      boolean bool = false;
      for (Element e : list) {
        if (e.getAttribute("name").getValue().equals(wfIdentifier)) {
          bool = true;
        }
      }
      if (!bool) {
        doc.getRootElement().addContent(newElement);
        XMLOutputter out = new XMLOutputter();
        out.output(doc, new FileOutputStream(new File(getBaseDir()
            + "ESSOA_WORKFLOWS.xml")));
      }
    } catch (JDOMException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public boolean nextStepIsLastStep(Map<String, Object> flow, String actionId) {
    /** 当动作ID大于100000时说明是回退动作 其下一步肯定不是结束 **/
    if (Integer.parseInt(actionId) > 100000) {
      return false;
    }
    String graphXml = flow.get("graphXml").toString();
    try {
      Element nextStepEl = this.readerGraphXml(graphXml, actionId);
      Attribute target = nextStepEl.getAttribute("target");
      Element nextStepTarget = this.readerGraphXml(graphXml, target.getValue());
      Attribute nextStepValue = nextStepTarget.getAttribute("value");
      if (nextStepValue.getValue().equals("结束")) {
        return true;
      }
    } catch (DocumentException e) {
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    }
    return false;
  }

  private String normalStepDetails(List<UserEntry> userRolelist,
      List<UserEntry> userlist, String backStep,
      List<Map<String, Object>> listStep, boolean nextStepIsSplit) {
    StringBuffer buffer = new StringBuffer();
    // buffer.append("<step> ");
    /** 存放哪一步到哪一步 */
    String stepFrom = "";
    /** 验证有无下一步处理人 */
    if (!userlist.isEmpty() || !userRolelist.isEmpty()) {
      /** 有下一步处理人的情况 */
      stepFrom = backStep + " 到 " + listStep.get(0).get("name");
      buffer.append("<res stepAction= ");
      buffer.append("\"" + stepFrom + "\" ");
      buffer.append("state = ");
      buffer.append("\" 正常\" ");
      buffer.append("problem = ");
      buffer.append("\" 无\" ");
      buffer.append("flag = ");
      buffer.append("\" 0\" ");
      buffer.append("isSplit = ");
      buffer.append("\"" + nextStepIsSplit + "\" ");
      buffer.append("/>");
    }
    /** 没有下一步处理人 */
    else {
      stepFrom = backStep + " 到 " + listStep.get(0).get("name");
      buffer.append("<res stepAction= ");
      buffer.append("\"" + stepFrom + "\" ");
      buffer.append("state = ");
      buffer.append("\" 不正常\" ");
      buffer.append("problem = ");
      buffer.append("\" 找不到下一步处理人\" ");
      buffer.append("flag = ");
      buffer.append("\" 1\" ");
      buffer.append("isSplit = ");
      buffer.append("\"" + nextStepIsSplit + "\" ");
      buffer.append("/>");
    }
    // buffer.append("</step> ");
    return buffer.toString();
  }

  public boolean operateFlowForm(Map<String, Object> model) {
    Map<String, Object> form = this.getFormById("form-" + model.get("stageId"));
    if (form == null || form.isEmpty()) {
      return this.insertFlowForm(model);
    } else {
      String flowIds = this.checkIfNull(form.get("flow_id"), "");
      String flowId = this.checkIfNull(model.get("modelId"), "");
      String modelId = this.getFormFlowId(flowIds, flowId, "1");
      return this.updateFlowForm(model, modelId);
    }
  }

  private String operateFunctionParameter(Map<String, Object> parameter) {
    String param = parameter.get("parameter").toString();
    if (param != null && !param.equals("null")) {
      if (param.trim().equals("")) {
        return this.delFunctionParameter(parameter);
      } else {
        return this.saveFunctionParameter(parameter);
      }
    }
    return "";
  }

  private boolean parseBool(String s) {
    if (s == null)
      return false;
    if (s.trim().equals(""))
      return false;
    if (s.trim().equals("true"))
      return true;
    return false;
  }

  @Override
  public List<HashMap<String, String>> parseCondition(String condition) {
    List<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();
    if (condition.length() < 3)
      return null;
    condition = condition.substring(1, condition.length() - 4);
    String strs[] = condition.split("\\&\\|\\&");
    HashMap<String, String> map = null;
    if (condition.indexOf("(") == -1 && !"".equals(strs[0].trim())) {
      for (int k = 0; k < strs.length; k++) {
        if (k % 4 == 0) {
          map = new HashMap<String, String>();
        }
        if (k % 4 == 3)
          map.put("arg" + (k % 4 + 2), strs[k]);
        else
          map.put("arg" + (k % 4 + 1), strs[k]);
        if (k % 4 == 3) {
          list.add(map);
        }
      }
      list.add(map);
      return list;
    } else {
      for (int k = 0; k < strs.length; k++) {
        if (k % 6 == 0) {
          map = new HashMap<String, String>();
        }
        map.put("arg" + k % 6, strs[k]);
        if (k % 6 == 5) {
          list.add(map);
        }
      }
      list.add(map);
      return list;
    }
  }

  private Map<String, Map<String, Element>> parseGraphXML(
      Map<String, Object> osWfModel) {
    Map<String, Map<String, Element>> map = new HashMap<String, Map<String, Element>>();
    Map<String, Element> startMap = new HashMap<String, Element>();
    Map<String, Element> stepMap = new HashMap<String, Element>();
    Map<String, Element> actionMap = new HashMap<String, Element>();
    Map<String, Element> splitMap = new HashMap<String, Element>();
    Map<String, Element> joinMap = new HashMap<String, Element>();
    String graphXml = osWfModel.get("graphXml") + "";
    if (null == graphXml || "".equals(graphXml))
      return null;
    SAXBuilder saxBuilder = new SAXBuilder();
    Document document;
    try {
      document = saxBuilder.build(new ByteArrayInputStream(graphXml
          .getBytes("UTF-8")));
      Element rootE = document.getRootElement().getChild("root");
      @SuppressWarnings("unchecked")
      List<Element> childList = rootE.getChildren();
      String startId = "";
      if (null != childList && !childList.isEmpty()) {
        for (Element e : childList) {
          Attribute id = e.getAttribute("id");
          Attribute vertexAB = e.getAttribute("vertex");
          Attribute edgeAB = e.getAttribute("edge");
          Attribute styleAB = e.getAttribute("style");
          Attribute valueAB = e.getAttribute("value");
          if (null != vertexAB) {// 开始、结束、步骤节点
            if (null != styleAB && styleAB.getValue().contains("ellipse")
                && valueAB.getValue().equals("开始")) {
              startMap.put("start", e);
              startId = id.getValue();
            } else if (null != styleAB
                && styleAB.getValue().contains("ellipse")
                && valueAB.getValue().equals("结束")) {
              startMap.put("end", e);
            } else if (null != styleAB
                && styleAB.getValue().contains("rhombus")
                && valueAB.getValue().equals("分支")) {
              splitMap.put(id.getValue(), e);
            } else if (null != styleAB
                && styleAB.getValue().contains("rhombus")
                && valueAB.getValue().equals("聚合")) {
              joinMap.put(id.getValue(), e);
            } else {
              stepMap.put(id.getValue(), e);
            }
          } else if (null != edgeAB) {// 直线、曲线
            Attribute source = e.getAttribute("source");
            if (null != source && startId.equals(source.getValue())) {
              startMap.put("startAction", e);
            }
            actionMap.put(id.getValue(), e);
          }
        }
      }
    } catch (JDOMException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    map.put("init", startMap);
    map.put("step", stepMap);
    map.put("split", splitMap);
    map.put("join", joinMap);
    map.put("action", actionMap);
    return map;
  }

  private boolean parseTwo(boolean b1, boolean b2, String sign) {
    if (sign == null)
      return false;
    if (sign.trim().equals(""))
      return false;
    if (sign.trim().equals("|") || sign.equals("||") || sign.equals("or"))
      return b1 || b2;
    if (sign.trim().equals("&") || sign.equals("&&") || sign.equals("and"))
      return b1 && b2;
    return false;
  }

  private boolean pasBool(String str) {
    if (str == null)
      return false;
    String strs = str.replaceAll(" ", "");
    if (strs.trim().equals(""))
      return false;
    if (strs.trim().equals("true"))
      return true;
    if (strs.trim().equals("false"))
      return false;
    if (!strs.trim().endsWith("e"))
      return false;
    String tempField = strs;
    String tempsign = strs;
    String a[] = tempField.split("e");
    for (int i = 0; i < a.length; i++) {
      if (a[i].indexOf("f") >= 0) {
        a[i] = a[i].substring(a[i].indexOf("f")) + "e";
      } else if (a[i].indexOf("t") >= 0) {
        a[i] = a[i].substring(a[i].indexOf("t")) + "e";
      }
    }

    tempsign = tempsign.replaceAll("true", " ").replaceAll("false", " ");
    String[] sigs = tempsign.substring(1, tempsign.length() - 1).split(" ");
    boolean check = false;
    for (int i = 0; i < a.length - 1; i++) {
      if (i == 0) {
        check = parseTwo(parseBool(a[i]), parseBool(a[i + 1]), sigs[i]);
      } else {
        check = parseTwo(check, parseBool(a[i + 1]), sigs[i]);
      }

    }
    return check;
  }

  @Override
  public boolean pbk(String str) {
    int charatR = -1;
    int charatY = -1;
    while (str.indexOf("(") > -1) {
      charatR = str.lastIndexOf("(");
      charatY = charatR + str.substring(charatR).indexOf(")");
      String tempBool = str.substring(charatR + 1, charatY);
      str = str.replace("(" + tempBool + ")", this.pasBool(tempBool) + "");
    }
    return this.pasBool(str);
  }

  @Override
  public String publicWorkFlow(Map<String, Object> flow) {
    String modelId = flow.get("modelId").toString();
    Map<String, Object> _flow = this.getModelInit(Long.parseLong(modelId));
    if (_flow != null && !_flow.isEmpty()) {
      String msg = this.generateWfXml(_flow);
      if (msg != null && msg.contains("发布成功")) {
        _flow.put("status", 1);
        this.saveOsWfModel(_flow);

        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", flow.get("ip"));
        log.put("userid", flow.get("userId"));
        log.put("module", "定制文件流转流程");
        log.put("operate", "定制文件流转流程：流程发布");
        log.put("loginfo", "成功发布标识为【" + modelId + "】的文件流转流程实例");
        this.getLogService().saveLog(log);
        return "";
      } else {
        return msg;
      }
    }
    return "发布失败！";
  }

  private List<Map<String, Object>> queryCurrStep(long wfID) {
    List<Map<String, Object>> entitys = new ArrayList<Map<String, Object>>();
    String sql = "SELECT  currStep.STEP_ID,currStep.owner FROM ess_transferform_user userform left join os_currentstep currStep on userform.wf_id=currStep.ENTRY_ID  where currStep.ENTRY_ID = ?";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { wfID });
      Map<String, Object> entity = null;
      for (Map<String, Object> map : list) {
        String owner = map.get("owner").toString();
        if (owner != null) {
          String[] ownerArray = owner.split(";");
          for (String nowOwner : ownerArray) {
            entity = new HashMap<String, Object>();
            entity.put("owner", nowOwner);
            entity.put("stepid", map.get("STEP_ID"));
            entitys.add(entity);
          }
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return entitys;
  }

  // private boolean tableIfExists(String stageId) {
  // String sql =
  // "select TABLE_NAME from information_schema.tables where TABLE_SCHEMA='esdocument'  and TABLE_NAME = 'esp_"
  // + stageId + "_form' ";
  // try {
  // Map<String, Object> table = query.query(sql, new MapHandler());
  // if (table != null && table.get("TABLE_NAME") != null) {
  // return true;
  // }
  // return false;
  // } catch (SQLException e) {
  // e.printStackTrace();
  // return false;
  // }
  // }

  private List<Map<String, Object>> queryESOSWFNOTICEFromActionid(long wfId,
      long formId) {
    String sql = "SELECT * FROM ess_transfernotice WHERE wf_id=" + wfId
        + " AND form_id=" + formId;
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null || list.isEmpty()) {
        return new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  public List<Map<String, Object>> queryWFIDsByFlowID(long flowId) {
    String sql = " select w.ID from ess_transferflow as t LEFT JOIN os_wfentry as w ON t.identifier=w.NAME WHERE t.id=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), flowId);
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private Element readerGraphXml(String xml, String actionId)
      throws DocumentException, SAXException {
    Element el = null;
    SAXBuilder saxBuilder = new SAXBuilder();
    Document doc;
    try {
      // 创建一个新的字符串
      StringReader read = new StringReader(xml);
      // 创建新的输入源SAX解析器将使用InputSource 对象来确定如何读取 XML 输入
      InputSource source = new InputSource(read);
      doc = saxBuilder.build(source);
      Element root = doc.getRootElement();
      Element firstRoot = (Element) root.getChildren().get(0);
      @SuppressWarnings("unchecked")
      List<Element> list = firstRoot.getChildren();
      for (Element e : list) {
        if (e.getAttribute("id").getValue().equals(actionId)) {
          el = e;
          break;
        }
      }
    } catch (JDOMException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    // el = root.getChildren();
    return el;
  }

  private String removeOsWfActionForCond(Map<String, String> action) {
    String sql = "delete from ess_transferaction where 1=1 ";
    String flow_id = action.get("flow_id");
    if (flow_id != null && !"".equals(flow_id)) {
      sql = sql + " and flow_id=" + flow_id;
    }
    String action_id = action.get("action_id");
    if (action_id != null && !"".equals(action_id)) {
      sql = sql + " and action_id=" + action_id;
    }
    String step_id = action.get("step_id");
    if (step_id != null && !"".equals(step_id)) {
      sql = sql + " and step_id=" + step_id;
    }
    try {
      int row = query.update(sql);
      if (row == 0) {
        return "未发现要删除的动作";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除动作失败";
    }
  }

  private String removeOsWfModel(long flow_id) {
    String sql = "delete from ess_transferflow where id=? ";
    try {
      int row = query.update(sql, flow_id);
      if (row != 1) {
        return "未发现要删除的流程";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除流程失败";
    }
  }

  private String removeOsWfStepForCond(Map<String, String> step) {
    String sql = "delete from ess_transferstep where 1=1 ";
    String flow_id = step.get("flow_id");
    if (flow_id != null && !"".equals(flow_id)) {
      sql = sql + " and flow_id=" + flow_id;
    }
    String step_id = step.get("step_id");
    if (step_id != null && !"".equals(step_id)) {
      sql = sql + " and step_id=" + step_id;
    }
    try {
      int row = query.update(sql);
      if (row == 0) {
        return "未发现要删除的步骤";
      }
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除步骤失败";
    }
  }

  @Override
  public String saveAction(Map<String, Object> action) {
    Map<String, Object> isAction = this.getActionByFlowAndAction(
        Long.parseLong(action.get("flow_id").toString()),
        Long.parseLong(action.get("action_id").toString()));
    if (isAction == null || isAction.isEmpty()) {
      return this.addAction(action);
    } else {
      return this.editAction(action);
    }
  }

  @Override
  public String saveActionForNoticeInit(Map<String, Object> action) {
    String sql_add = "insert into ess_transferaction(flow_id,action_id,postfunction,notice_users,notice_roles,process_time) values(?,?,?,?,?,?) ";
    String sql_edit = "update ess_transferaction set postfunction=? ,notice_users=? ,notice_roles=?,process_time=?  where flow_id=? and action_id=? ";
    Map<String, Object> isAction = this.getActionByFlowAndAction(
        Long.parseLong(action.get("modelId").toString()),
        Long.parseLong(action.get("actionId").toString()));
    try {
      if (isAction == null || isAction.isEmpty()) {
        Long id = query.insert(sql_add, new ScalarHandler<Long>(),
            new Object[] { action.get("modelId"), action.get("actionId"),
                action.get("ES_ACTION_SELECTFUNCTION"), action.get("userIds"),
                action.get("roleIds"), action.get("ES_STEP_PROCESSTIME") });
        if (id == null) {
          return "保存知会人失败";
        }
        return "";
      } else {
        int row = query.update(
            sql_edit,
            new Object[] { action.get("ES_ACTION_SELECTFUNCTION"),
                action.get("userIds"), action.get("roleIds"),
                action.get("ES_STEP_PROCESSTIME"), action.get("modelId"),
                action.get("actionId") });
        if (row != 1) {
          return "保存知会人失败";
        }
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存知会人失败";
    }
  }

  @Override
  public String saveActionInit(Map<String, Object> action) {
    String stepId = action.get("stepId").toString();
    String modelId = action.get("modelId").toString();
    String actionId = action.get("actionId").toString();
    String dataImportPara = action.get("dataImportPara").toString();
    String updateStatePara = action.get("updateStatePara").toString();
    Long actionID = 0l;
    Long modelID = 0l;
    if (modelId == null || actionId == null) {
      return "保存动作失败";
    } else {
      actionID = Long.parseLong(actionId);
      modelID = Long.parseLong(modelId);
    }
    Map<String, Object> parameter = new HashMap<String, Object>();
    parameter.put("actionId", actionID);
    parameter.put("flowId", modelID);
    parameter.put("functionId", 1l);
    parameter.put("parameter", dataImportPara);
    String mes = this.operateFunctionParameter(parameter);
    if (!"".equals(mes)) {
      return mes;
    }
    parameter.put("functionId", 2l);
    parameter.put("parameter", updateStatePara);
    mes = this.operateFunctionParameter(parameter);
    if (!"".equals(mes)) {
      return mes;
    }
    if (null != stepId && !stepId.equals("")) {
      Map<String, Object> oldAction = this.getActionByFlowAndAction(
          Long.parseLong(modelId), Long.parseLong(actionId));
      String isEmail = this.checkIfNull(action.get("ES_STEP_ISSENDEMAIL"), "0");
      String isMessage = this.checkIfNull(action.get("ES_STEP_ISSENDMESSAGE"),
          "1");
      String isCaller = this.checkIfNull(action.get("ES_ACTION_ISSENDCALLER"),
          "0");
      oldAction.put("step_id", action.get("stepId").toString());
      oldAction.put("name", action.get("ES_ACTION_NAME").toString());
      oldAction.put("step_id", action.get("stepId").toString());
      oldAction.put("flow_id", action.get("modelId").toString());
      oldAction.put("action_id", action.get("actionId").toString());
      oldAction.put("postfunction", action.get("ES_ACTION_SELECTFUNCTION")
          .toString());
      oldAction.put("is_email",
          ("on".equalsIgnoreCase(isEmail) ? "1" : isEmail));
      oldAction.put("is_message", ("on".equalsIgnoreCase(isMessage) ? "1"
          : isMessage));
      oldAction.put("action_message", action.get("ES_ACTION_MESSAGE")
          .toString());
      oldAction.put("notice_users", action.get("userIds").toString());
      oldAction.put("notice_roles", action.get("roleIds").toString());
      oldAction.put("is_notice_caller", ("on".equalsIgnoreCase(isCaller) ? "1"
          : isCaller));
      /** lujixiang 20150421 添加处理时间周期 **/
      oldAction.put("process_time", action.get("processTime").toString());
      return this.saveAction(oldAction);
    }
    return "";
  }

  private boolean saveAppendix(List<Map<String, Object>> fileAppendexList) {
    String sql = "INSERT INTO ess_form_appendix(id,fileName,fileSize,dataId,wf_id,type,wf_step_id,userName,applyRight,overRight) VALUES(?,?,?,?,?,?,?,?,?,?)";
    try {
      Object[][] params = new Object[fileAppendexList.size()][];
      for (int i = 0; i < fileAppendexList.size(); i++) {
        Map<String, Object> appendex = fileAppendexList.get(i);
        params[i] = new Object[] { appendex.get("id"),
            appendex.get("fileName"), appendex.get("fileSize"),
            appendex.get("dataId"), appendex.get("wf_id"),
            appendex.get("type"), appendex.get("wf_step_id"),
            appendex.get("userName"), appendex.get("applyRight"),
            appendex.get("overRight") };
      }
      long row = query.insertBatch(sql, new ScalarHandler<Long>(), params);
      if (row == fileAppendexList.size()) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private void saveAppendix(List<Map<String, Object>> appendixs, Long opinionId) {
    this.saveAppendix(appendixs);
    for (Map<String, Object> s : appendixs) {
      this.saveRelation(opinionId, Long.parseLong(s.get("id").toString()));
    }
  }

  private void saveCollaborativeEntity(long wfID, Map<String, Object> entity)
      throws Exception {
    List<Map<String, Object>> entitys = this.queryCurrStep(wfID);
    if (entitys == null || entitys.isEmpty()) {
      // 最后一步
      // throw new Exception("通过工作流ID'" + wfID + "'未查询到待办数据，协同中间表插入数据失败!");
    } else {
      for (Map<String, Object> currEntity : entitys) {
        currEntity.put("workflowtype", entity.get("workflowtype")); // 类型为知会
        currEntity.put("state", entity.get("state"));
        currEntity.put("organid", entity.get("organid"));
        currEntity.put("userformid", entity.get("userformId"));
        currEntity.put("stepId", currEntity.get("stepid"));
        if (null != entity.get("owner")) {
          currEntity.put("owner", entity.get("owner"));
        } else if (null != currEntity.get("owner")) {
          List<Participatory> part = this.getParticipatoryService()
              .getParticipatoryByUserId(currEntity.get("owner").toString());
          if (part != null && part.size() > 0) {
            currEntity.put("organid", part.get(0).getId());
          }
        }
        this.executeSaveCollaborativeEntity(wfID, currEntity);
      }
    }
  }

  @SuppressWarnings("deprecation")
  public boolean saveEsOFUserFormValue(String formIdStr,
      Map<String, String> dataMap) {
    try {
      Date date = new java.util.Date();
      long year = date.getYear() + 1900;
      long month = date.getMonth() + 1;
      long day = date.getDate();
      String sql = "";
      String userformno = "";
      Integer formId = Integer.parseInt(formIdStr.substring(5));
      if (formId != -10) {
        userformno = ("NO." + year + (month >= 10 ? month : ("0" + month)))
            + (day >= 10 ? day : ("0" + day)) + "-";
        sql = "select user_formno from ess_transferform_user where wf_id != -10 and tree_year = '"
            + year + "' order by id desc";
        String str = query.query(sql, new ScalarHandler<String>());
        if (!StringUtils.isEmpty(str)) {
          long no = Long
              .parseLong(str.substring(str.length() - 6, str.length())) + 1;
          for (int i = 6; i > (no + "").length(); i--) {
            userformno = userformno + "0";
          }
          userformno = userformno + no;
        } else {
          userformno = userformno + "000001";
        }

      } else {
        userformno = ("NO." + year + (month >= 10 ? month : ("0" + month)))
            + (day >= 10 ? day : ("0" + day)) + "-E";
        sql = "select user_formno from ess_transferform_user where wf_id = "
            + formId + " and tree_year = '" + year + "' order by id desc";
        String str = query.query(sql, new ScalarHandler<String>());
        if (!StringUtils.isEmpty(str)) {
          long no = Long
              .parseLong(str.substring(str.length() - 5, str.length())) + 1;
          for (int i = 5; i > (no + "").length(); i--) {
            userformno = userformno + "0";
          }
          userformno = userformno + no;
        } else {
          userformno = userformno + "00001";
        }
      }
      Long dataID = -1l;
      String dataid = dataMap.get("DATA_ID");
      if (dataid != null && !"".equals(dataid.trim())) {
        dataID = Long.parseLong(dataid);
      }
      sql = "insert into ess_transferform_user (id,user_id,form_id,wf_id,title,start_time,end_time,wf_status,part_id,tree_year,tree_month,dataid,user_formno) values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
      System.out.println(sql);
      Object[] params = new Object[] { Long.parseLong(dataMap.get("ID")),
          Long.parseLong(dataMap.get("USER_ID")), formIdStr,
          Long.parseLong(dataMap.get("WF_ID")), dataMap.get("TITLE"),
          new java.sql.Timestamp(new Date().getTime()), null,
          dataMap.get("WF_STATUS"), Long.parseLong(dataMap.get("ORGAN_ID")),
          year + "", month + "", dataID, userformno

      };
      query.update(sql, params);
      return true;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return false;
  }

  private boolean saveESOSWFNOTICE(Map<String, String> dataMap) {
    String sql = "INSERT INTO ess_transfernotice (id,wf_id,form_id,user_id,action_id,status) VALUES(?,?,?,?,?,?)";
    try {
      Long row = query.insert(
          sql,
          new ScalarHandler<Long>(),
          new Object[] { dataMap.get("id"), dataMap.get("wf_id"),
              dataMap.get("form_id"), dataMap.get("user_id"),
              dataMap.get("action_id"), dataMap.get("status") });
      if (row == 1) {
        return true;
      }
      return false;
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  public Map<String, Object> saveForm(Map<String, Object> form) {
    String sql = "insert into ess_transferform(status,form_js,name,form_id,flow_id,is_create_table,form_type_id,creater,createtime,version,form_js_html,show_type,form_js_html_usingsystem) values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
    String sql_edit = "update ess_transferform set status=?, form_js=?, name=?, form_id=?, flow_id=?, is_create_table=?, form_type_id=?, modifyer=?, modifytime=?, version=?, form_js_html=?, show_type=?, form_js_html_usingsystem=? where form_id=? ";
    try {
      if (form.get("form_id") != null) {
        Map<String, Object> oldForm = this.getFormById(form.get("form_id")
            .toString());
        if (oldForm != null && !oldForm.isEmpty()) {
          String flowId = this.getFormFlowId(
              this.checkIfNull(oldForm.get("flow_id"), ""),
              this.checkIfNull(form.get("flow_id"), ""),
              this.checkIfNull(form.get("status"), "1"));
          int row = query.update(
              sql_edit,
              new Object[] { "".equals(flowId) ? 0 : 1, form.get("form_js"),
                  form.get("name"), form.get("form_id"), flowId,
                  form.get("is_create_table"), form.get("form_type_id"),
                  form.get("modifyer"), form.get("modifytime"),
                  this.checkIfNull(form.get("version"), "1"),
                  form.get("form_js_html"), form.get("show_type"),
                  form.get("form_js_html_usingsystem"), form.get("form_id") });
          if (row == 1) {
            return form;
          }
        }
      }
      Long id = query.insert(
          sql,
          new ScalarHandler<Long>(),
          new Object[] { 1, form.get("form_js"), form.get("name"),
              form.get("form_id"), form.get("flow_id"),
              form.get("is_create_table"), form.get("form_type_id"),
              form.get("creater"), form.get("createtime"), 1,
              form.get("form_js_html"), form.get("show_type"),
              form.get("form_js_html_usingsystem") });
      if (id != null && id > 0) {
        form.put("id", id);
        return form;
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private String saveFunctionParameter(Map<String, Object> parameter) {
    String sql_add = "insert into ess_transferfunctions_param(flow_id,action_id,function_id,parameter) values(?,?,?,?) ";
    String sql_edit = "update ess_transferfunctions_param set parameter=? where flow_id=? and action_id=? and function_id=? ";
    try {
      Map<String, Object> map = this.getFunctionParameter(parameter);
      if (map == null || map.isEmpty()) {
        Long id = query.insert(sql_add, new ScalarHandler<Long>(),
            new Object[] { parameter.get("flowId"), parameter.get("actionId"),
                parameter.get("functionId"), parameter.get("parameter") });
        return id > 0 ? "" : "保存参数失败";
      } else {
        int row = query.update(sql_edit,
            new Object[] { parameter.get("flowId"), parameter.get("actionId"),
                parameter.get("functionId") });
        return row == 1 ? "" : "编辑参数失败";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存参数失败";
    }
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  @Override
  public Map<String, Object> saveOldWorkflow(Map<String, Object> dataMap) {
    Map<String, Object> json = new HashMap<String, Object>();
    String userId = dataMap.get("userId").toString();
    String id = dataMap.get("id").toString();
    String flowId = dataMap.get("flowId").toString();
    String formId = dataMap.get("formId").toString();
    // HashMap dataHaveRightMap = (HashMap)
    // getCacheWS().getObject("FileReadOrDownLoadRight_"+userId) ;
    Map<String, Object> owf = this.getModelInit(Long.parseLong(flowId));
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    String wfIdentifier = owf.get("identifier").toString();
    if (canInitialize(user.getUserid(), wfIdentifier, 2, null)) {
      long wfId = 0;
      try {
        wfId = initializeWorkflow(userId, wfIdentifier, null);
      } catch (Exception e) {
        json.put("message", "表单保存失败");
        json.put("msgType", "error");
      }
      if (wfId >= 1) {
        try {
          Map formmap = new HashMap<String, String>();
          String stageId = this.getCollaborativeService()
              .getStageIdByDocId(Long.parseLong(id)).get("id").toString();
          List<Map<String, Object>> list = this.getFilingService()
              .findMoveCols(
                  2,
                  this.getFilingService().getParentStageIds(
                      Long.parseLong(stageId)));
          for (Map<String, Object> ofe : list) {
            String code = ofe.get("code").toString();
            String value = dataMap.get(code).toString();
            if (null == value)
              value = "";
            formmap.put(code, value);
          }
          formmap.put("WF_ID", String.valueOf(wfId));
          formmap.put("ANNEX", "");
          boolean isOk = this.updateESFFormValue(Long.parseLong(id), formmap);
          if (!isOk) {
            json.put("success", false);
            json.put("message", "表单更新失败");
            json.put("msgType", "error");
            return json;
          }
          System.out.println("esp_" + formId.substring(5) + "->update success");
        } catch (Exception e) {
          json.put("message", "表单更新失败");
          json.put("msgType", "error");
          killWorkflow(wfId);
        }
        json.put("message", "表单保存成功");
        json.put("msgType", "success");
        json.put("success", true);
      } else {
        json.put("message", "表单保存失败");
        json.put("msgType", "error");
        json.put("success", false);
      }
    } else {
      json.put("message", "表单保存失败");
      json.put("msgType", "error");
      json.put("success", false);
      System.out.println("start->error...");
    }
    return json;
  }

  @Override
  public Map<String, Object> saveOsWfModel(Map<String, Object> osWfModel) {
    String sql_insert = "insert into ess_transferflow(type_id,name,version,status,form_relation,business_relation,describtion,graphXml,flowGraph,relation_table,first_step_users,first_step_roles,first_step_id,identifier,creater,createtime)values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
    String sql_update = "update ess_transferflow set type_id=?, name=?, version=?, status=?, form_relation=?, business_relation=?, describtion=?, graphXml=?, flowGraph=?, relation_table=?, first_step_users=?, first_step_roles=?, first_step_id=?, identifier=?, modifyer=?, modifytime=? where id=? ";
    try {
      Object id = osWfModel.get("id");
      if (id == null || "".equals(id.toString())) {
        Long newId = query.insert(
            sql_insert,
            new ScalarHandler<Long>(),
            new Object[] { osWfModel.get("type_id"), osWfModel.get("name"),
                osWfModel.get("version"), osWfModel.get("status"),
                osWfModel.get("form_relation"),
                osWfModel.get("business_relation"),
                osWfModel.get("describtion"), osWfModel.get("graphXml"),
                osWfModel.get("flowGraph"), osWfModel.get("relation_table"),
                osWfModel.get("first_step_users"),
                osWfModel.get("first_step_roles"),
                osWfModel.get("first_step_id"), osWfModel.get("identifier"),
                osWfModel.get("creater"), osWfModel.get("createtime") });
        if (newId != null) {
          osWfModel.put("id", newId);
          return osWfModel;
        }
      } else {
        int row = query.update(
            sql_update,
            new Object[] { osWfModel.get("type_id"), osWfModel.get("name"),
                osWfModel.get("version"), osWfModel.get("status"),
                osWfModel.get("form_relation"),
                osWfModel.get("business_relation"),
                osWfModel.get("describtion"), osWfModel.get("graphXml"),
                osWfModel.get("flowGraph"), osWfModel.get("relation_table"),
                osWfModel.get("first_step_users"),
                osWfModel.get("first_step_roles"),
                osWfModel.get("first_step_id"), osWfModel.get("identifier"),
                osWfModel.get("modifyer"), osWfModel.get("modifytime"),
                osWfModel.get("id") });
        if (row == 1) {
          return osWfModel;
        }
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean saveRelation(long opinionId, long appendixId) {
    String sql = "insert into ess_opinion_appendix_relation(appendix_id,opinion_id) values(?,?) ";
    try {
      long row = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
          appendixId, opinionId });
      if (row == 1) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public String saveSplitCondition(Map<String, Object> condition) {
    Object newFun = condition.get("newFun");
    String conditionStr = "";
    if (newFun != null && "true".equals(newFun.toString())) {
      conditionStr = this.createSetConditionNew(condition);
    } else {
      conditionStr = this.createSetCondition(condition);
    }
    String actionId = condition.get("actionId").toString();
    String modelId = condition.get("modelId").toString();
    String formId = condition.get("formId").toString();
    String stepId = condition.get("stepId").toString();
    String check = condition.get("check").toString();// 判断是第一个设置页面还是第二个
    if (check != null && check.equals("right") && conditionStr.length() > 3) {
      Map<String, Object> flow = this.getModelInit(Long.parseLong(modelId));
      if (flow != null && (formId == null || "".equals(formId)))
        formId = flow.get("form_relation").toString();
      if (formId != "") {
        // 未做处理
      }
    }
    Map<String, Object> action = this.getActionByFlowAndAction(
        Long.parseLong(modelId), Long.parseLong(actionId));
    if (action != null && !action.isEmpty()) {
      String queryCondition = action.get("condition").toString();
      if (queryCondition != null && queryCondition.split("&&&").length > 1) {
        String strs[] = queryCondition.split("&&&");
        if (check.equals("left")) {
          action.put("condition", conditionStr + "&&&" + strs[1]);
        } else {
          action.put("condition", strs[0] + "&&&" + conditionStr);
        }
      } else {
        if (check.equals("left")) {
          action.put("condition", conditionStr + "&&&");
        } else {
          if (queryCondition != null) {
            String strs[] = queryCondition.split("&&&");
            action.put("condition", strs[0] + "&&&" + conditionStr);
          } else {
            action.put("condition", "&&&" + conditionStr);
          }
        }
      }
      if ("&&&".equals(action.get("condition").toString()))
        action.put("condition", "");
      String mes = this.saveAction(action);
      return ("".equals(mes) ? "" : "设置分支条件失败");
    } else {
      action = new HashMap<String, Object>();
      action.put("step_id", stepId == null ? null : Long.parseLong(stepId));
      action.put("action_id",
          actionId == null ? null : Long.parseLong(actionId));
      action.put("flow_id", modelId == null ? null : Long.parseLong(modelId));
      action.put("name", "分支");
      if (check.equals("left")) {
        action.put("condition", conditionStr + "&&&");
      } else {
        action.put("condition", "&&&" + conditionStr);
      }
      if ("&&&".equals(action.get("condition").toString()))
        action.put("condition", "");
      String mes = this.saveAction(action);
      return ("".equals(mes) ? "" : "设置分支条件失败");
    }
  }

  @Override
  public Map<String, Object> saveStepInit(Map<String, Object> step) {
    String sql_insert = "insert into ess_transferstep(flow_id,step_id,name,step_child_id,step_parent_id,next_step_roles,next_step_users,edit_field,is_relationpart,is_countersign,is_relationcaller,edit_field_print) values(?,?,?,?,?,?,?,?,?,?,?,?) ";
    String sql_query = "select * from ess_transferstep where flow_id=? and step_id=? ";
    try {
      Map<String, Object> stepMap = query.query(sql_query, new MapHandler(),
          new Object[] { step.get("modelId"), step.get("stepId") });
      if (stepMap == null) {
        String parentStepId = this.checkIfNull(step.get("parentStepId"), "");
        String childStepId = this.checkIfNull(step.get("step_child_id"), "");
        String is_relationpart = this.checkIfNull(step.get("is_relationpart"),
            "");
        String is_countersign = this
            .checkIfNull(step.get("is_countersign"), "");
        String is_relationcaller = this.checkIfNull(
            step.get("is_relationcaller"), "");
        Long id = query
            .insert(
                sql_insert,
                new ScalarHandler<Long>(),
                new Object[] {
                    step.get("modelId"),
                    step.get("stepId"),
                    step.get("ES_STEP_NAME"),
                    "".equals(childStepId) ? 0 : Integer.parseInt(childStepId),
                    "".equals(parentStepId) ? 0 : Integer
                        .parseInt(parentStepId),
                    step.get("roleIds"),
                    step.get("userIds"),
                    step.get("selectField"),
                    "".equals(is_relationpart) ? 0 : Integer
                        .parseInt(is_relationpart),
                    "".equals(is_countersign) ? 0 : Integer
                        .parseInt(is_countersign),
                    "".equals(is_relationcaller) ? 0 : Integer
                        .parseInt(is_relationcaller),
                    step.get("selectFieldPrint") });
        if (id != null) {
          step.put("id", id);
        } else {
          return null;
        }
      } else {
        step.put("step_child_id", stepMap.get("step_child_id"));
        this.updateStepInit(step);
      }
      Map<String, Object> model = this.getModelInit(Long.parseLong(step.get(
          "modelId").toString()));
      if (model.get("first_step_id") == null
          || "".equals(model.get("first_step_id").toString())) {
        model.put("first_step_id", step.get("stepId"));
        this.saveOsWfModel(model);
      }
      return step;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, String> saveWfModel(Map<String, Object> flow) {
    Map<String, String> json = new HashMap<String, String>();
    String modelId = flow.get("modelId").toString();
    String formId = flow.get("formId").toString();
    String userId = flow.get("userId").toString();
    String typeID = flow.get("typeID").toString();
    if (!modelId.equals("-1")) {
      String isCreateWin = flow.get("isCreateWin").toString();
      String graphXml = flow.get("graphXml").toString();
      String docHtml = flow.get("docHtml").toString();
      docHtml = docHtml.replaceAll("&quot;", "");
      if (docHtml.lastIndexOf("</v:polyline>") > -1)
        docHtml = docHtml.substring(0, docHtml.lastIndexOf("</v:polyline>"));
      docHtml = docHtml + "</DIV></DIV>";
      if (docHtml.indexOf("http://www.w3.org/1999/xhtml") == -1) {
        docHtml = "<div xmlns=\"http://www.w3.org/1999/xhtml\""
            + docHtml.substring(4);
      }
      if (docHtml.indexOf("http://www.w3.org/2000/svg") == -1) {
        docHtml = docHtml.substring(0, docHtml.indexOf("<svg ") + 5)
            + "xmlns=\"http://www.w3.org/2000/svg\""
            + docHtml.substring(docHtml.indexOf("<svg ") + 4);
      }
      try {
        graphXml = URLDecoder.decode(graphXml, "UTF-8");
      } catch (UnsupportedEncodingException e) {
        e.printStackTrace();
      }
      Map<String, Object> model = this.getModelInit(Long.parseLong(modelId));
      model.put("graphXml", graphXml);
      model.put("flowGraph", docHtml);
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      if (null != formId && !formId.equals("")) {
        Map<String, Object> form = this.getFormById(formId);
        form.put("flow_id", modelId);
        form.put("version",
            isCreateWin.equals("1") ? 1 : (form.get("version") == null ? 1
                : Long.parseLong(form.get("version").toString()) + 1));
        form.put("status", "1");
        this.saveForm(form);
        String formIds = this.checkIfNull(flow.get("relation_table"), "esp_"
            + formId.substring(5) + "_form");
        model.put("relation_table", formIds);
        model.put("form_relation", formId);
        model.put("modifyer", userId);
        model.put("modifytime", sdf.format(new Date()));
        model.put("type_id", typeID == null ? null : Long.parseLong(typeID));
        model.put("version",
            isCreateWin.equals("1") ? 1 : (model.get("version") == null ? 1
                : Long.parseLong(model.get("version").toString()) + 1));
        this.saveOsWfModel(model);
      } else {
        model.put("modifyer", userId);
        model.put("modifytime", sdf.format(new Date()));
        model.put("type_id", typeID == null ? null : Long.parseLong(typeID));
        model.put("version",
            isCreateWin.equals("1") ? 1 : (model.get("version") == null ? 1
                : Long.parseLong(model.get("version").toString()) + 1));
        this.saveOsWfModel(model);
      }
      String msg = this.generateWfXml(model);
      String returnMsg = "流程自动发布失败!请手动进行发布操作。";
      if (msg.contains("发布成功")) {
        model.put("status", 1);// 修改状态
        this.saveOsWfModel(model);
        returnMsg = "流程自动发布成功!";
      } else {
        model.put("status", 0);// 修改状态
        this.saveOsWfModel(model);
      }
      json.put("message", returnMsg);
      json.put("success", "true");

      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", flow.get("ip"));
      log.put("userid", flow.get("userId"));
      log.put("module", "定制文件流转流程");
      log.put("operate", "定制文件流转流程：创建新流程");
      log.put("loginfo", "创建名称为【" + model.get("name") + "】的文件流转流程实例，发布状态为："
          + returnMsg);
      this.getLogService().saveLog(log);
    } else {
      json.put("success", "false");
    }
    return json;
  }

  @Override
  public Map<String, Object> saveWFModelInit(Map<String, Object> model) {
    model.put("allowChange", true);
    String modelId = model.get("modelId").toString();
    if ("".equals(modelId) || modelId == null) {
      return this.insertModelInit(model);
    } else {
      Map<String, Object> oldModel = this.getModelInit(Long.parseLong(modelId));
      String selectBusiness = model.get("selectBusiness").toString();
      Object status = oldModel.get("status");
      String business_relation = oldModel.get("business_relation").toString();
      if (status != null && Integer.parseInt(status.toString()) != 1) {
        model = this.editModelInit(model);
        Map<String, Object> form = this.getFormById(oldModel.get(
            "form_relation").toString());
        String flowIds = this.checkIfNull(form.get("flow_id"), "");
        String flowId = this.checkIfNull(oldModel.get("id"), "");
        oldModel.put("stageId", oldModel.get("form_relation").toString()
            .substring(5));
        this.updateFlowForm(oldModel, this.getFormFlowId(flowIds, flowId, "0"));
        return this.editModelInit(model);
      }
      if (!selectBusiness.equals(business_relation)) {
        model.put("allowChange", false);
        return model;
      }
      return this.editModelInit(model);
    }
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  @Override
  public Map<String, Object> saveWorkFlow(Map<String, Object> dataMap) {
    Map<String, Object> json = new HashMap<String, Object>();
    String userId = dataMap.get("userId").toString();
    String id = dataMap.get("id").toString();
    String flowId = dataMap.get("flowId").toString();
    String formId = "";
    Map<String, Object> owf = this.getModelInit(Long.parseLong(flowId));
    Map<String, Object> transferForm = this.getTranferFormByFlowId(flowId);
    if (transferForm.containsKey("form_id")) {
      Object from_id = transferForm.get("form_id");
      formId = from_id.toString();
    }
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    String wfIdentifier = owf.get("identifier").toString();
    if (canInitialize(user.getUserid(), wfIdentifier, 2, null)) {
      try {
        long wfId = 0;
        try {
          wfId = this.initializeWorkflow(userId, wfIdentifier, null);
        } catch (Exception e) {
          e.printStackTrace();
          json.put("success", false);
          json.put("message", "工作流初始化失败！");
          json.put("msgType", "error");
          return json;
        }
        if (wfId >= 1) {
          try {
            Map formmap = new HashMap<String, String>();
            String stageId = this.getCollaborativeService()
                .getStageIdByDocId(Long.parseLong(id)).get("id").toString();
            List<Map<String, Object>> list = this.getFilingService()
                .findMoveCols(
                    2,
                    this.getFilingService().getParentStageIds(
                        Long.parseLong(stageId)));
            for (Map<String, Object> ofe : list) {
              String code = ofe.get("code").toString();
              String value = dataMap.get(code).toString();
              if (null == value)
                value = "";
              formmap.put(code, value);
            }
            boolean isOk = this.updateESFFormValue(Long.parseLong(id), formmap);
            if (!isOk) {
              json.put("success", false);
              json.put("message", "表单更新失败");
              json.put("msgType", "error");
              return json;
            }
          } catch (Exception e) {
            killWorkflow(wfId);
            json.put("success", false);
            json.put("message", "表单更新失败");
            json.put("msgType", "error");
            return json;
          }
          System.out.println("esp_" + formId.substring(5) + "->update success");

          Map<String, String> userform = new HashMap<String, String>();
          Long ID = this.generateESFId();
          userform.put("ID", String.valueOf(ID));
          userform.put("USER_ID", String.valueOf(user.getId()));
          userform.put("USER_NAME", user.getDisplayName());
          userform.put("FORM_TITLE", transferForm.get("name").toString());
          userform.put("TITLE", owf.get("name") + "-" + dataMap.get("docNo"));
          userform.put("WF_ID", wfId + "");
          userform.put("WF_STATUS", null);
          userform.put("DATA_ID", id);
          if (user.getUserid().equals("admin")) {
            userform.put("ORGAN_ID", "1");
          } else {
            List<Participatory> part = this.getParticipatoryService()
                .getParticipatoryByUserId(user.getUserid());
            String organID = "";
            if (part != null && part.size() > 0) {
              organID = part.get(0).getId() + "";
            }
            userform.put("ORGAN_ID", organID);
          }
          this.saveEsOFUserFormValue(formId, userform);
        }
      } catch (Exception e) {
        json.put("message", "待发保存失败");
        json.put("msgType", "error");
        json.put("success", false);
      }
      json.put("message", "表单保存成功");
      json.put("msgType", "success");
      json.put("success", true);
    } else {
      json.put("message", "表单保存失败");
      json.put("msgType", "error");
      json.put("success", false);
      System.out.println("start->error...");
    }
    return json;
  }

  private Map<String, Object> saveWorkFlowOpinion(Map<String, Object> params) {
    String sql = "INSERT into ess_transferform_opinion(id,user_name,content,wf_id,wf_step_id,time,parentid,forwarduserid) values(?,?,?,?,?,?,?,?) ";
    try {
      long id = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
          params.get("id"), params.get("user_name"), params.get("content"),
          params.get("wf_id"), params.get("wf_step_id"), params.get("time"),
          params.get("parentid"), params.get("forwarduserid") });
      if (id > 0) {
        params.put("id", id);
      }
      return params;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private String setDescBySign(String Sign) {
    if (Sign.equals("part"))
      return "单位部门";
    else if (Sign.equals("role"))
      return "角色";
    else if (Sign.equals("="))
      return "等于";
    else if (Sign.equals("!="))
      return "不等于";
    else if (Sign.equals(">="))
      return "大于等于";
    else if (Sign.equals("<="))
      return "小于等于";
    else if (Sign.equals(">"))
      return "大于";
    else if (Sign.equals("<"))
      return "小于";
    else if (Sign.equals("like"))
      return "包含";
    else if (Sign.equals("notLike"))
      return "不包含";
    else if (Sign.equals("and"))
      return "并且";
    else if (Sign.equals("or"))
      return "或者";
    return Sign;
  }

  private void setFunctionsElement(Element functions, String beanshell,
      Map<String, Map<String, String>> classMap) {
    if (null != beanshell && !beanshell.equals("")) {
      Element functionBeanshell = new Element("function");
      functionBeanshell.setAttribute("type", "beanshell");
      Element arg1 = new Element("arg");
      arg1.setAttribute("name", "script");
      arg1.addContent(beanshell);
      functionBeanshell.addContent(arg1);
      functions.addContent(functionBeanshell);
    }
    Set<String> classSet = classMap.keySet();
    for (String classPath : classSet) {
      Map<String, String> tempMap = classMap.get(classPath);
      Element functionClass = new Element("function");
      functionClass.setAttribute("type", "class.name");
      functionClass.setAttribute("name", "function");
      Element argC = new Element("arg");
      argC.setAttribute("name", "class.name");
      argC.addContent(classPath);
      functionClass.addContent(argC);
      Set<String> tempSet = tempMap.keySet();
      for (String arg : tempSet) {
        Element argEl = new Element("arg");
        argEl.setAttribute("name", arg);
        argEl.addContent(tempMap.get(arg));
        functionClass.addContent(argEl);
      }
      functions.addContent(functionClass);
    }
  }

  @SuppressWarnings("deprecation")
  private void setNoticeUsersForWf(UserEntry currentUser, String wfName,
      String wfModelId, String actionId, String fid, String wfid,
      String formId, String formUserId) {
    // 为知会消息增加表单标题
    String formTitle = "";
    if (formId != null && !"".equals(formId)) {
      formTitle = this.getFormById(formId).get("name").toString();
    }
    String subTitle = null;
    if (formTitle != null && !"".equals(formTitle) && formTitle.length() > 10) {
      subTitle = formTitle.substring(0, 10) + "...";
    } else {
      subTitle = formTitle;
    }
    Map<String, Object> actionEntity = this.getActionByFlowAndAction(
        Long.parseLong(wfModelId), Long.parseLong(actionId));
    if (null != actionEntity) {
      List<UserEntry> userList = new ArrayList<UserEntry>();
      String noticeRoles = actionEntity.get("notice_roles").toString();
      String noticeCaller = this.checkIfNull(
          actionEntity.get("is_notice_caller"), "");
      Integer isNoticeCaller = Integer.parseInt(noticeCaller);
      if (null != isNoticeCaller && isNoticeCaller.intValue() == 1) {
        Map<String, Object> listOsUserForm = this.getCollaborativeService()
            .getUserformByWfId(Long.parseLong(wfid));
        if (null != listOsUserForm && !listOsUserForm.isEmpty()) {
          UserEntry tempUser = getUserQueryService().getUserInfoById(
              listOsUserForm.get("user_id") + "");
          if (!userList.contains(tempUser)) {
            userList.add(tempUser);
          }
        }
      }
      if (null != noticeRoles && !noticeRoles.equals("")) {
        if (noticeRoles.startsWith(","))
          noticeRoles = noticeRoles.substring(1);
        String[] roleArray = noticeRoles.split(",");
        for (int i = 0; i < roleArray.length; i++) {
          Role role = this.getRoleByRoleId(roleArray[i]);
          List<Map<String, Object>> idList = this.getRoleService()
              .getUserListByRoleId(Long.parseLong(role.getId()));
          for (Map<String, Object> user : idList) {
            UserEntry tempUser = getUserQueryService().getUserInfoById(
                user.get("userId").toString());
            if (!userList.contains(tempUser)) {
              userList.add(tempUser);
            }
          }
        }
      }
      String noticeUsers = actionEntity.get("notice_users").toString();
      if (null != noticeUsers && !noticeUsers.equals("")) {
        if (noticeUsers.startsWith(","))
          noticeUsers = noticeUsers.substring(1);
        String[] userArray = noticeUsers.split(",");
        for (int i = 0; i < userArray.length; i++) {
          UserEntry tempUser = getUserQueryService().getUserByUserName(
              userArray[i]);
          if (!userList.contains(tempUser)) {
            userList.add(tempUser);
          }
        }
      }
      userList = this.getNoticesFiltingAuditor(userList, Long.parseLong(wfid));
      Map<String, Object> form = this.getFormById(formId);
      List<Map<String, Object>> list = this.queryESOSWFNOTICEFromActionid(
          Long.parseLong(wfid), Long.parseLong(form.get("id").toString()));
      for (UserEntry user : userList) {
        if (!list.isEmpty()) {
          Map<String, String> data = new HashMap<String, String>();
          data.put("wf_id", wfid);
          data.put("form_id", form.get("id").toString());
          data.put("user_id", String.valueOf(user.getId()));
          data.put("action_id", actionId);
          this.saveESOSWFNOTICE(data);
          // 往已办待办中间表保存数据
          Map<String, Object> collEntity = new HashMap<String, Object>();
          collEntity.put("workflowtype", "4"); // 类型为知会
          collEntity.put("state", "1");
          if ("admin".equals(user.getUserid()))
            collEntity.put("organid", 0l);
          else {
            List<Participatory> part = this.getParticipatoryService()
                .getParticipatoryByUserId(user.getUserid());
            if (part != null && part.size() > 0) {
              collEntity.put("organid", part.get(0).getId());
            } else {
              collEntity.put("organid", -1);
            }
          }
          collEntity.put("owner", user.getUserid());
          collEntity.put("stepId", 10000);
          collEntity.put("userformid", Long.parseLong(formUserId));
          this.executeSaveCollaborativeEntity(Long.parseLong(wfid), collEntity);
          EssMessage message = new EssMessage();
          message.setSender(currentUser.getUserid());
          message.setRecevier(user.getUserid());
          message.setContent(SimpleEncodeOrDecode.simpleEncode("(知会)请查看"
              + (subTitle == "" ? "流程" : subTitle)));
          message.setSendTime(DateUtil.getDateTime());
          message.setStatus(workflowstatus_run);
          message.setWorkFlowId(Long.parseLong(wfid));
          message.setWorkFlowStatus(workflowstatus_run);
          message.setStepId(10000);

          Map<String, String> collMap = this.getCollaborativeService()
              .getCollaborativeMsgByWfId(Long.parseLong(wfid), "1",
                  user.getUserid());
          if (collMap == null) {
            message.setHandler("");
          } else {
            message.setHandler("collaborativeHandle.toTodoFormPage('"
                + collMap.get("id") + "','" + collMap.get("flowId") + "','"
                + collMap.get("formId") + "','" + wfid + "','" + 10000 + "','"
                + collMap.get("dataId") + "','" + collMap.get("status") + "','"
                + collMap.get("title") + "','" + collMap.get("userFormNo")
                + "','" + "5" + "','" + false + "')");
          }
          message.setHandlerUrl("esdocument/" + this.instanceId
              + "/x/ESMessage/handlerMsgPage");
          getMessageWS().addEssMessage(message);
          System.out.println("发送知会消息成功：" + wfid);
        } else {
          int n = 0;
          for (int i = 0; i < list.size(); i++) {
            if (user.getId() == Long.parseLong(list.get(i).get("user_id")
                .toString())) {
              n++;
            }
          }
          if (n == 0) {
            Map<String, String> data = new HashMap<String, String>();
            data.put("wf_id", wfid);
            data.put("form_id", form.get("id").toString());
            data.put("user_id", String.valueOf(user.getId()));
            data.put("action_id", actionId);
            this.saveESOSWFNOTICE(data);
            // 往已办待办中间表保存数据
            Map<String, Object> collEntity = new HashMap<String, Object>();
            collEntity.put("workflowtype", "4"); // 类型为知会
            collEntity.put("state", "1");
            if ("admin".equals(user.getUserid()))
              collEntity.put("organid", 1);
            else {
              List<Participatory> part = this.getParticipatoryService()
                  .getParticipatoryByUserId(user.getUserid());
              if (part != null && part.size() > 0) {
                collEntity.put("organid", part.get(0).getId());
              } else {
                collEntity.put("organid", -1);
              }

            }
            collEntity.put("owner", user.getUserid());
            collEntity.put("stepId", 10000);
            collEntity.put("userformid", Long.parseLong(formUserId));
            this.executeSaveCollaborativeEntity(Long.parseLong(wfid),
                collEntity);
            EssMessage message = new EssMessage();
            message.setSender(currentUser.getUserid());
            message.setRecevier(user.getUserid());
            message.setContent(SimpleEncodeOrDecode
                .simpleEncode(subTitle == "" ? "流程" : subTitle));
            message.setSendTime(DateUtil.getDateTime());
            message.setStatus(workflowstatus_run);
            message.setWorkFlowId(Long.parseLong(wfid));
            message.setWorkFlowStatus(workflowstatus_run);
            message.setStepId(10000);
            /**
             * xiaoxiong 20140710 给消息表添加handler（消息处理函数可执行串）、handlerUrl（消息处理界面地址）
             **/
            message.setHandler("Show_WfManagerWind('" + wfName + "','" + wfid
                + "','" + 10000 + "_" + false + "','" + formId + "')");
            message.setHandlerUrl("esdocument/" + this.instanceId
                + "/x/ESMessage/handlerMsgPage");
            getMessageWS().addEssMessage(message);
            System.out.println("发送知会消息成功：" + wfid);
          }
        }
      }
    }
  }

  private void setResultElement(Element actionElement, boolean isLast,
      String newStepId, String owner) {
    Element results = new Element("results");
    Element unconditionalResult = new Element("unconditional-result");
    unconditionalResult.setAttribute("old-status", "Finished");
    if (isLast) {
      unconditionalResult.setAttribute("status", "Finished");
    } else {
      unconditionalResult.setAttribute("status", "Underway");
    }
    unconditionalResult.setAttribute("step", newStepId);
    if (!isLast)
      unconditionalResult.setAttribute("owner", owner);
    results.addContent(unconditionalResult);
    actionElement.addContent(results);
  }

  private Element setResultElementForCountersign(boolean isLast,
      String newStepId, String owner) {
    Element result = new Element("result");
    result.setAttribute("old-status", "Finished");
    if (isLast) {
      result.setAttribute("status", "Finished");
    } else {
      result.setAttribute("status", "Underway");
    }
    result.setAttribute("step", newStepId);
    if (!isLast)
      result.setAttribute("owner", owner);
    Element conditions = new Element("conditions");
    conditions.setAttribute("type", "AND");
    Element condition = new Element("condition");
    condition.setAttribute("type", "class");
    Element arg = new Element("arg");
    arg.setAttribute("name", "class.name");
    arg.addContent("cn.flying.rest.service.workflow.ValidatorCountersign");
    condition.addContent(arg);
    conditions.addContent(condition);
    result.addContent(conditions);
    return result;
  }

  private Element setUnconditionalResultElementForCountersign(boolean isLast,
      String oldStepId, String owner) {
    Element unconditionalResult = new Element("unconditional-result");
    unconditionalResult.setAttribute("old-status", "Finished");
    if (isLast) {
      unconditionalResult.setAttribute("status", "Finished");
    } else {
      unconditionalResult.setAttribute("status", "Underway");
    }
    unconditionalResult.setAttribute("step", oldStepId);
    if (!isLast)
      unconditionalResult.setAttribute("owner", owner);
    Element postfunctions = new Element("post-functions");
    Element function = new Element("function");
    function.setAttribute("type", "class.name");
    function.setAttribute("name", "function");
    Element arg = new Element("arg");
    arg.setAttribute("name", "class.name");
    arg.addContent("cn.flying.rest.service.workflow.ValidatorCountersignStatus");
    function.addContent(arg);
    postfunctions.addContent(function);
    unconditionalResult.addContent(postfunctions);
    return unconditionalResult;
  }

  private void splitManageDetails(
      long wfModelId,
      UserEntry testUser,
      Map<String, Object> owm,
      HashMap<Pair<String, Pair<Boolean, List<Map<String, Object>>>>, String> stepString,
      StringBuffer buffer) {
    buffer.append("<dir user= ");
    buffer.append("\"" + testUser.getDisplayName() + "\" username=\""
        + testUser.getUserid() + "\" > ");

    for (Pair<String, Pair<Boolean, List<Map<String, Object>>>> conntSteps : stepString
        .keySet()) {
      String backStep = conntSteps.left;
      List<Map<String, Object>> listStep = conntSteps.right.right;
      boolean nextStepIsSplit = conntSteps.right.left;
      /*** 分支步骤 */
      if (!"".equals(stepString.get(conntSteps))) {
        List<UserEntry> userlist = new ArrayList<UserEntry>();
        List<UserEntry> userRolelist = new ArrayList<UserEntry>();
        /** 防止步骤既存在role又存在user，过滤后都满足的情况 */
        List<Map<String, Object>> rightUsersStep = new ArrayList<Map<String, Object>>();
        String splitString = "";
        /** 存放返回回来的结果 */
        String actionId = stepString.get(conntSteps);
        for (Map<String, Object> nextStep : listStep) {
          String roles = nextStep.get("next_step_roles").toString();
          String users = nextStep.get("next_step_users").toString();
          Integer isRelation = Integer.parseInt(this.checkIfNull(
              nextStep.get("is_relationpart"), "0"));
          Integer isRelationByCaller = Integer.parseInt(this.checkIfNull(
              nextStep.get("is_relationcaller"), ""));
          if (null != roles && !roles.equals("")) {
            String[] roleArray = roles.split(",");
            for (int i = 0; i < roleArray.length; i++) {
              /** 如果按第一步处理人过滤角色勾选上了进第一个IF，否则按原来跑 */
              if (null != isRelationByCaller
                  && isRelationByCaller.intValue() == 1) {
                userRolelist.addAll(this.getUsers(roleArray[i], testUser,
                    isRelationByCaller));
              } else {
                userRolelist.addAll(this.getUsers(roleArray[i], testUser,
                    isRelation));
              }
            }
            if (!userRolelist.isEmpty()) {
              rightUsersStep.add(nextStep);
            }
          }
          if (null != users && !users.equals("")) {
            String[] rightUsers = users.split(",");
            for (int i = 0; i < rightUsers.length; i++) {
              /** 如果按第一步处理人过滤角色勾选上了进第一个IF，否则按原来跑 */
              if (null != isRelationByCaller
                  && isRelationByCaller.intValue() == 1) {
                userlist.addAll(this.getRUsers(rightUsers[i], testUser,
                    isRelationByCaller));
              } else {
                userlist.addAll(this.getRUsers(rightUsers[i], testUser,
                    isRelation));
              }
            }
            if (!userlist.isEmpty()) {
              rightUsersStep.add(nextStep);
            }
          }
        }
        splitString = this.splitStepDetails(userRolelist, userlist, stepString,
            wfModelId, testUser, actionId, listStep, backStep, nextStepIsSplit,
            rightUsersStep);
        buffer.append(splitString);
      }
      /*** 正常步骤normalStepDetails */
      else {
        for (Map<String, Object> nextStep : listStep) {
          boolean isHasNextOwner = false;
          /** 判断是不是第一步 */
          if (nextStep.get("step_id").equals(owm.get("first_step_id"))) {
            isHasNextOwner = true;
          }
          if (!isHasNextOwner) {
            String roles = nextStep.get("next_step_roles").toString();
            String users = nextStep.get("next_step_users").toString();
            Integer isRelation = Integer.parseInt(this.checkIfNull(
                nextStep.get("is_relationpart"), "0"));
            Integer isRelationByCaller = Integer.parseInt(this.checkIfNull(
                nextStep.get("is_relationcaller"), ""));
            List<UserEntry> userlist = new ArrayList<UserEntry>();
            List<UserEntry> userRolelist = new ArrayList<UserEntry>();
            String splitString = "";
            /** 存放返回回来的结果 */
            if (null != roles && !roles.equals("")) {
              String[] roleArray = roles.split(",");
              for (int i = 0; i < roleArray.length; i++) {
                /** 如果按第一步处理人过滤角色勾选上了进第一个IF，否则按原来跑 */
                if (null != isRelationByCaller
                    && isRelationByCaller.intValue() == 1) {
                  userRolelist.addAll(this.getUsers(roleArray[i], testUser,
                      isRelationByCaller));
                } else {
                  userRolelist.addAll(this.getUsers(roleArray[i], testUser,
                      isRelation));
                }
              }
            }

            if (null != users && !users.equals("")) {
              String[] rightUsers = users.split(",");
              for (int i = 0; i < rightUsers.length; i++) {
                /** 如果按第一步处理人过滤角色勾选上了进第一个IF，否则按原来跑 */
                if (null != isRelationByCaller
                    && isRelationByCaller.intValue() == 1) {
                  userlist.addAll(this.getRUsers(rightUsers[i], testUser,
                      isRelationByCaller));
                } else {
                  userlist.addAll(this.getRUsers(rightUsers[i], testUser,
                      isRelation));
                }
              }
            }
            splitString = this.normalStepDetails(userRolelist, userlist,
                backStep, listStep, nextStepIsSplit);
            buffer.append(splitString);
          }
        }
      }
    }
  }

  private String splitStepDetails(
      List<UserEntry> userRolelist,
      List<UserEntry> userlist,
      HashMap<Pair<String, Pair<Boolean, List<Map<String, Object>>>>, String> stepString,
      long wfModelId, UserEntry testUser, String actionId,
      List<Map<String, Object>> listStep, String backStep,
      boolean nextStepIsSplit, List<Map<String, Object>> rightUsersStep) {
    /** 为了去重，也许存在一个步骤既有角色又有用户，而且通过过滤后都满足条件，rightUsersStep中就会存在重复的 */
    List<Map<String, Object>> rightStep = new ArrayList<Map<String, Object>>();
    StringBuffer buffer = new StringBuffer();
    buffer.append("<split> ");
    String stepFrom = "";// 存放哪一步到哪一步
    boolean splitCount = true;
    if (!userlist.isEmpty() || !userRolelist.isEmpty()) {
      /** 验证有无下一步处理人 */
      for (Map<String, Object> ows : rightUsersStep) {
        if (!rightStep.contains(ows)) {
          rightStep.add(ows);
        }
      }
      /** 验证有无满足分支条件的步骤 */
      Map<String, String> stepMapId = this.getValidatedStep(wfModelId,
          testUser, rightStep, actionId);
      if (stepMapId.isEmpty()) {
        splitCount = false;
      } else {
        splitCount = true;
      }
      /** 满足分支条件 */
      if (splitCount) {
        for (Map<String, Object> step : listStep) {
          if (rightStep.contains(step)) {
            stepFrom = backStep + " 到 " + step.get("name");
            buffer.append("<res splitAction= ");
            buffer.append("\"" + stepFrom + "\" ");
            buffer.append("state = ");
            buffer.append("\" 正常\" ");
            buffer.append("problem = ");
            buffer.append("\" 无\" ");
            buffer.append("flag = ");
            buffer.append("\" 0\" ");
            buffer.append("isSplit = ");
            buffer.append("\"" + nextStepIsSplit + "\" ");
            buffer.append("actionId = ");
            buffer.append("\"" + actionId + "\" ");
            buffer.append("/>");
          }
        }
      }
      /** 不满足分支条件 */
      else {
        for (Map<String, Object> step : listStep) {
          if (rightStep.contains(step)) {
            stepFrom = backStep + " 到 " + step.get("name");
            buffer.append("<res splitAction= ");
            buffer.append("\"" + stepFrom + "\" ");
            buffer.append("state = ");
            buffer.append("\" 不正常\" ");
            buffer.append("problem = ");
            buffer.append("\" 下一步处理人不满足分支条件\" ");
            buffer.append("flag = ");
            buffer.append("\" 1\" ");
            buffer.append("isSplit = ");
            buffer.append("\"" + nextStepIsSplit + "\" ");
            buffer.append("actionId = ");
            buffer.append("\"" + actionId + "\" ");
            buffer.append("/>");
          }
        }
      }
    }
    /** 如果满足下面的条件，就证明某一个步骤在过滤用户或角色的时候下一步处理人就没有满足条件的人，没有下一步处理人 */
    if (rightStep.size() < listStep.size()) {
      for (Map<String, Object> step : listStep) {
        if (!rightStep.contains(step)) {
          stepFrom = backStep + " 到 " + step.get("name");
          buffer.append("<res splitAction= ");
          buffer.append("\"" + stepFrom + "\" ");
          buffer.append("state = ");
          buffer.append("\" 不正常\" ");
          buffer.append("problem = ");
          buffer.append("\" 找不到下一步处理人\" ");
          buffer.append("flag = ");
          buffer.append("\" 1\" ");
          buffer.append("isSplit = ");
          buffer.append("\"" + nextStepIsSplit + "\" ");
          buffer.append("actionId = ");
          buffer.append("\"" + actionId + "\" ");
          buffer.append("/>");
        }
      }
    }
    buffer.append("</split> ");
    return buffer.toString();
  }

  private boolean SplitValidator(String splitCondtion, UserEntry user) {
    try {
      if (null != splitCondtion && !"".equals(splitCondtion)) {
        boolean rightBool = true;
        /** 表单条件 */
        boolean leftBool = false;
        String[] strs = splitCondtion.split("&&&");

        if (strs.length > 0 && strs[0].length() > 1) {
          /** 修该当分支条件只设置左边时 不进行条件校验bug */
          List<Participatory> listPart = this.getParticipatoryService()
              .getParticipatoryByUserId(user.getUserid());

          if (listPart == null || listPart.size() == 0) {
            leftBool = true;
          } else {
            long partId = listPart.get(0).getId();
            List<Map<String, Object>> roles = this.getRoleService()
                .getRoleListByUserId(user.getId());
            String leftCondition = splitCondtion.split("&&&")[0];
            List<HashMap<String, String>> listMap = this
                .parseCondition(leftCondition);
            StringBuffer buffer = new StringBuffer("");
            for (HashMap<String, String> m : listMap) {
              String arg0 = m.get("arg0");
              /** 左括号 **/
              String arg1 = m.get("arg1");
              /** field **/
              String arg2 = m.get("arg2");
              /** compare **/
              String arg3 = m.get("arg3");
              /** value */
              String arg4 = m.get("arg4");
              /** 右括号 */
              String arg5 = m.get("arg5");
              /** and/or */
              if (null != arg0 && arg0.indexOf("(") != -1)
                buffer.append(arg0);
              if (arg1.equals("") || arg2.equals("") || arg3.equals("")) {
                break;
              }
              if (arg1.equals("role")) {
                boolean bo = false;
                for (Map<String, Object> map : roles) {
                  if (arg3.equals(map.get("id").toString())) {
                    bo = true;
                    break;
                  }
                }
                if (bo) {
                  if ("!=".equals(arg2)) {
                    buffer.append("false");
                  } else {
                    buffer.append("true");
                  }
                } else {
                  if ("!=".equals(arg2)) {
                    buffer.append("true");
                  } else {
                    buffer.append("false");
                  }
                }
              } else if (arg1.equals("part")) {
                if (partId == Long.parseLong(arg3)) {
                  if ("!=".equals(arg2)) {
                    buffer.append("false");
                  } else {
                    buffer.append("true");
                  }
                } else {
                  if ("!=".equals(arg2)) {
                    buffer.append("true");
                  } else {
                    buffer.append("false");
                  }
                }
              }
              if (null != arg4 && arg4.indexOf(")") != -1)
                buffer.append(arg4);
              if (arg5 != null) {
                buffer.append(arg5);
              }
            }
            if (buffer.toString().equals(""))
              return false;
            leftBool = pbk(buffer.toString());
          }
        }

        if (strs.length == 2 && strs[0].length() > 0) {
          return leftBool && rightBool;
        } else if (strs.length == 2 && strs[0].length() == 0) {
          return rightBool;
        } else {
          return leftBool;
        }
      } else {
        return false;
      }
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  public boolean startSavedWorkflow(Long wfID, int wfStepId, String fromId,
      long userformID, Long userId, Map<String, String> dataMap, int id,
      String userName, List<Map<String, Object>> pkgList,
      Map<String, Object> collEntity) {
    this.executeUpdateEsOFUserFormValue(fromId, wfID, userId, userformID);
    try {
      this.saveCollaborativeEntity(wfID, collEntity);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return true;
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  @Override
  public Map<String, Object> startSavedWorkflow(Map<String, Object> dataMap) {
    Map<String, Object> json = new HashMap<String, Object>();
    String wfModelId = dataMap.get("wfModelId").toString();
    String formId = dataMap.get("formId").toString();
    String id = dataMap.get("id").toString();
    String formUserId = dataMap.get("formUserId").toString();
    // 获得待发流程的工作流id;
    String wfIds = dataMap.get("wfId") + "";
    if (!"".equals(wfIds)) {
      killWorkflow(Long.parseLong(wfIds));
    }
    String selectUsers = dataMap.get("selectUsers").toString();
    String actionId = dataMap.get("actionId").toString();

    String userId = dataMap.get("userId").toString();
    SimpleDateFormat sdfmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    @SuppressWarnings("unused")
    String currDate = sdfmt.format(new Date());
    // HashMap dataHaveRightMap = (HashMap) getCacheWS().getObject(
    // "FileReadOrDownLoadRight_" + userId);
    Map<String, Object> model = this.getModelInit(Long.parseLong(wfModelId));
    String wfIdentifier = model.get("identifier").toString();
    Integer firstStepId = Integer.parseInt(model.get("first_step_id")
        .toString());
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    if (canInitialize(user.getUserid(), wfIdentifier, 2, null)) {
      long wfId = 0;
      try {
        wfId = initializeWorkflow(user.getUserid(), wfIdentifier, null);
      } catch (Exception e) {
        json.put("message", "工作流初始化失败！");
      }
      if (wfId >= 1) {
        try {
          // 修改附件
          this.updateOpinionByWfId(Long.parseLong(wfIds), wfId);
          // 组装表单数据
          Map formmap = new HashMap<String, String>();
          String stageId = this.getCollaborativeService()
              .getStageIdByDocId(Long.parseLong(id)).get("id").toString();
          List<Map<String, Object>> list = this.getFilingService()
              .findMoveCols(
                  2,
                  this.getFilingService().getParentStageIds(
                      Long.parseLong(stageId)));
          for (Map<String, Object> ofe : list) {
            String code = ofe.get("code").toString();
            String value = dataMap.get(code).toString();
            if (null == value)
              value = "";
            formmap.put(code, value);
          }
          if (formmap.isEmpty()) {
            killWorkflow(wfId);
            json.put("message", "获取表单数据失败！");
            json.put("success", false);
            return json;
          }
          // 启动待发流程时，必须先更新动态表中的值（主要是工作流ID），因为流程流转时分支验证需要用到。
          boolean isSaved = this
              .updateESFFormValue(Long.parseLong(id), formmap);
          if (isSaved) {
            System.out.println(formId + " form is Updated ");
          } else {
            killWorkflow(wfId);
            System.out.println("Update " + formId + " form is Error ");
            json.put("message", "保存表单数据时出现异常，请确认数据是否正确填写！");
            json.put("success", false);
            return json;
          }
          // 组装协同中间表数据
          Long organID = null;
          if (user.getUserid().equals("admin")) {
            organID = 1l;
          } else {
            List<Participatory> part = this.getParticipatoryService()
                .getParticipatoryByUserId(user.getUserid());
            if (part != null && part.size() > 0) {
              organID = part.get(0).getId();
            }
          }
          Map<String, Object> map = getWorkflowStepParms(true, wfModelId,
              formId, user, wfId, selectUsers, actionId,
              String.valueOf(firstStepId));
          doAction(user.getUserid(), wfId, Integer.parseInt(actionId), map);

          long currentStepId = this.getCurrentStepId(wfId);// 当前步骤id
          if (currentStepId == -1) {
            currentStepId = firstStepId;
          }
          Map<String, Object> collEntity = new HashMap<String, Object>();
          collEntity.put("workflowtype", "3"); // 类型为知会
          collEntity.put("state", "1");
          collEntity.put("organid", organID == null ? -1 : organID);
          collEntity.put("userformId", Long.parseLong(formUserId));
          collEntity.put("stepId", currentStepId);
          boolean check = this
              .startSavedWorkflow(wfId, firstStepId, formId,
                  Long.parseLong(formUserId),
                  Long.parseLong(user.getId() + ""), formmap,
                  Integer.parseInt(id), user.getUserid(), null, collEntity);
          if (!check) {
            json.put("message", "工作流启动失败！请确认数据都已正确填写后重新启动！");
            Pair<Boolean, List<Map<String, Object>>> stepData = getNextStepFromGraphXML(
                model, actionId);
            List<Map<String, Object>> listStep = stepData.right;
            if (null != listStep && !listStep.isEmpty()) {
              for (Map<String, Object> step : listStep) {
                this.getMessageWS().removeEssMessageByWorkFlowId(wfId,
                    Long.parseLong(step.get("step_id").toString()));
              }
            }
            killWorkflow(wfId);
            System.out.println("启动失败，消息已删除，启动操作已回滚！");
            json.put("success", false);
            return json;
          }
          try {
            this.setNoticeUsersForWf(user, wfIdentifier, wfModelId, actionId,
                id, String.valueOf(wfId), formId, formUserId);
          } catch (Exception e) {
            e.printStackTrace();
            json.put("message", "工作流启动成功，发送知会消息失败！");
          }
          /** 启动待发流程 将数据附件的状态修改为 待审核 end **/
          System.out.println("start->" + wfId);
        } catch (Exception e) {
          e.printStackTrace();
          json.put("message", "工作流启动失败！");
          json.put("success", false);
          return json;
        }
        /****** 判断当前流程的当前步骤是否需要发送邮件 并获取没有邮件的下一步处理人的集合 start *****/
        StringBuffer buffer = new StringBuffer();
        Map<String, Object> action = this.getActionByFlowAndAction(
            Long.parseLong(wfModelId), Long.parseLong(actionId));
        if (null != action) {
          String eMail = this.checkIfNull(action.get("is_email"), "");
          if (!"".equals(eMail)) {
            Integer esIsMail = Integer.parseInt(eMail);
            if (esIsMail.intValue() == 1) {
              if (null != selectUsers && !selectUsers.equals("")) {
                String[] splitSteps = selectUsers.split("-");
                for (int m = 0; m < splitSteps.length; m++) {
                  String[] users = splitSteps[m].split(":");
                  String[] nextOwner = users[1].split(";");
                  for (int i = 0; i < nextOwner.length; i++) {
                    UserEntry tempUser = this.getUserQueryService()
                        .getUserInfoById(nextOwner[i]);
                    String email = tempUser.getEmailAddress();
                    if (email == null || "".equals(email)) {
                      buffer.append(tempUser.getEmpName()).append("、");
                      System.out.println(tempUser.getEmpName()
                          + "没有输入邮箱地址，邮件发送失败！");
                    }
                  }
                }
              }
            }
          }
        }

        json.put(
            "message",
            "工作流启动成功！"
                + (buffer.length() > 0 ? ("<br>但是【"
                    + buffer.deleteCharAt(buffer.length() - 1) + "】没有输入邮箱地址，邮件发送失败！")
                    : ""));
        /****** 判断当前流程的当前步骤是否需要发送邮件 并获取没有邮件的下一步处理人的集合 end *****/
        json.put("success", true);
      } else {
        json.put("message", "工作流启动失败！");
        json.put("success", false);
      }
    } else {
      json.put("message", "工作流启动失败！");
      json.put("success", false);
      System.out.println("start->error...");
    }
    return json;
  }

  private boolean updateOpinionByWfId(long oldWfId, long wfId) {
    String sql = "update ess_form_appendix set wf_id=? WHERE wf_id=? ";
    try {
      int row = query.update(sql, wfId, oldWfId);
      if (row >= 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private int getCurrentStepId(long wfId) {
    String sql = "select STEP_ID from os_currentstep where ENTRY_ID=" + wfId;
    try {
      int stepId = query.query(sql, new ScalarHandler<Integer>());
      if (stepId > 0) {
        return stepId;
      }
      return -1;
    } catch (SQLException e) {
      e.printStackTrace();
      return -1;
    }
  }

  private boolean startWorkflow(long wfID, String formId, long userformID,
      Map<String, String> userFormdataMap, Map<String, String> ESFdataMap,
      long userId, Map<String, Object> collEntity) {
    this.saveEsOFUserFormValue(formId, userFormdataMap);
    try {
      this.saveCollaborativeEntity(wfID, collEntity);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return true;
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  @Override
  public Map<String, Object> startWorkflow(Map<String, Object> dataMap) {
    Map<String, Object> json = new HashMap<String, Object>();
    String userId = dataMap.get("userId").toString();
    String wfModelId = dataMap.get("flowId").toString();
    String formId = dataMap.get("formId").toString();
    String dataId = dataMap.get("dataId").toString();
    String actionId = dataMap.get("actionId").toString();
    String selectUsers = dataMap.get("selectUsers").toString();
    String logWfID = ""; // 用于记录日志
    // HashMap dataHaveRightMap = (HashMap) getCacheWS().getObject(
    // "FileReadOrDownLoadRight_" + userId);
    // HashMap UsingWfDataAppendixList = (HashMap) getCacheWS().getObject(
    // "UsingWfDataAppendixList_" + userId);
    Map<String, Object> model = this.getModelInit(Long.parseLong(wfModelId));
    Map<String, Object> transferForm = this.getTranferFormByFlowId(wfModelId);
    if (transferForm.containsKey("form_id")) {
      Object from_id = transferForm.get("form_id");
      formId = from_id.toString();
    }

    String wfIdentifier = model.get("identifier").toString();
    Integer firstStepId = Integer.parseInt(model.get("first_step_id")
        .toString());
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    if (this.canInitialize(userId, wfIdentifier, 2, null)) {
      long wfId = 0;
      try {
        wfId = this.initializeWorkflow(userId, wfIdentifier, null);
      } catch (Exception e) {
        e.printStackTrace();
        json.put("message", "工作流初始化失败！");
      }
      if (wfId >= 1) {
        long ID = this.generateESFId();
        logWfID = String.valueOf(ID); // 用于记录日志
        StringBuffer buffer = new StringBuffer();
        try {
          // 保存表单数据
          Map formmap = new HashMap<String, String>();
          String stageId = this.getCollaborativeService()
              .getStageIdByDocId(Long.parseLong(dataId)).get("id").toString();
          List<Map<String, Object>> list = this.getFilingService()
              .findMoveCols(
                  2,
                  this.getFilingService().getParentStageIds(
                      Long.parseLong(stageId)));
          for (Map<String, Object> ofe : list) {
            String code = ofe.get("code").toString();
            String value = dataMap.get(code).toString();
            if (null == value)
              value = "";
            formmap.put(code, value);
          }
          if (formmap.isEmpty()) {
            killWorkflow(wfId);
            json.put("message", "获取表单数据失败！");
            json.put("success", false);
            return json;
          }
          // 启动待发流程时，必须先更新动态表中的值（主要是工作流ID），因为流程流转时分支验证需要用到。
          boolean isSaved = this.updateESFFormValue(Long.parseLong(dataId),
              formmap);
          if (isSaved) {
            System.out.println(formId + " form is Updated ");
          } else {
            killWorkflow(wfId);
            System.out.println("Update " + formId + " form is Error ");
            json.put("message", "保存表单数据时出现异常，请确认数据是否正确填写！");
            json.put("success", false);
            return json;
          }
          Map<String, Object> map = this.getWorkflowStepParms(true, wfModelId,
              formId, user, wfId, selectUsers, actionId,
              String.valueOf(firstStepId));
          this.doAction(userId, wfId, Integer.parseInt(actionId), map);
          System.out.println("start->" + wfId);

          Map<String, Object> form = this.getFormById(formId);
          Map userform = new HashMap<String, String>();
          userform.put("ID", String.valueOf(ID));
          userform.put("USER_ID", String.valueOf(user.getId()));
          userform.put("USER_NAME", user.getDisplayName());
          userform.put("FORM_TITLE", form.get("name"));
          userform.put("TITLE", model.get("name") + "-" + dataMap.get("docNo"));
          userform.put("WF_ID", String.valueOf(wfId));
          userform.put("WF_STATUS", "flow");
          userform.put("DATA_ID", dataId);
          String organID = "-1";
          if (userId.equals("admin")) {
            organID = "1";
            userform.put("ORGAN_ID", String.valueOf(organID));
          } else {
            List<Participatory> part = this.getParticipatoryService()
                .getParticipatoryByUserId(user.getUserid());
            if (part != null && part.size() > 0) {
              organID = part.get(0).getId() + "";
            }
            userform.put("ORGAN_ID", organID);
          }
          long currentStepId = this.getCurrentStepId(wfId);
          if (currentStepId == -1) {
            currentStepId = firstStepId;
          }
          Map<String, Object> collEntity = new HashMap<String, Object>();
          collEntity.put("workflowtype", "3"); // 类型为知会
          collEntity.put("state", "1");
          collEntity.put("organid", organID == null ? -1 : organID);
          collEntity.put("stepId", currentStepId);
          collEntity.put("userformId", ID);
          if (!this.startWorkflow(wfId, formId, ID, userform, formmap,
              user.getId(), collEntity)) {
            json.put("message", "工作流启动失败！请确认数据都已正确填写后重新启动！");
            Pair<Boolean, List<Map<String, Object>>> stepData = this
                .getNextStepFromGraphXML(model, actionId);
            List<Map<String, Object>> listStep = stepData.right;
            if (null != listStep && !listStep.isEmpty()) {
              for (Map<String, Object> step : listStep) {
                getMessageWS().removeEssMessageByWorkFlowId(wfId,
                    Long.parseLong(step.get("step_id") + ""));
              }
            }
            System.out.println("启动失败，消息已删除，启动操作已回滚！");
            json.put("success", false);
            return json;
          }
          this.setNoticeUsersForWf(user, wfIdentifier, wfModelId, actionId,
              dataId, String.valueOf(wfId), formId, String.valueOf(ID));
          /** 判断当前流程的当前步骤是否需要发送邮件 并获取没有邮件的下一步处理人的集合 **/
          Map<String, Object> action = this.getActionByFlowAndAction(
              Long.parseLong(wfModelId), Long.parseLong(actionId));
          if (null != action) {
            String eMail = this.checkIfNull(action.get("is_email"), "");
            if (!"".equals(eMail)) {
              Integer esIsMail = Integer.parseInt(eMail);
              if (esIsMail.intValue() == 1) {
                if (null != selectUsers && !selectUsers.equals("")) {
                  String[] splitSteps = selectUsers.split("-");
                  for (int m = 0; m < splitSteps.length; m++) {
                    String[] users = splitSteps[m].split(":");
                    String[] nextOwner = users[1].split(";");
                    for (int i = 0; i < nextOwner.length; i++) {
                      UserEntry tempUser = this.getUserQueryService()
                          .getUserInfoById(nextOwner[i]);
                      String email = tempUser.getEmailAddress();
                      if (email == null || "".equals(email)) {
                        buffer.append(tempUser.getEmpName()).append("、");
                        System.out.println(tempUser.getEmpName()
                            + "没有输入邮箱地址，邮件发送失败！");
                      }
                    }
                  }
                }
              }
            }
          }

        } catch (Exception e) {
          // getCacheWS().delete("UsingWfDataAppendixList_" + userId);
          // getCacheWS().delete("FileReadOrDownLoadRight_" + userId);
          // getCacheWS().delete("UsingWfDataAppendixPathStrs_" + userId);
          json.put("message", "工作流启动失败！");
          json.put("success", false);
          this.killWorkflow(wfId);
        }
        // getCacheWS().delete("UsingWfDataAppendixList_" + userId);
        // getCacheWS().delete("FileReadOrDownLoadRight_" + userId);
        // getCacheWS().delete("UsingWfDataAppendixPathStrs_" + userId);
        json.put("id", String.valueOf(ID));
        json.put("wfid", wfId);
        json.put(
            "message",
            "工作流启动成功！"
                + (buffer.length() > 0 ? ("<br>但是【"
                    + buffer.deleteCharAt(buffer.length() - 1) + "】没有输入邮箱地址，邮件发送失败！")
                    : ""));
        json.put("success", true);
      } else {
        json.put("message", "工作流启动失败！");
        json.put("success", false);
      }
    } else {
      json.put("message", "工作流初始化失败！");
      json.put("success", false);
      System.out.println("start->error...");
    }
    if ("true".equals(json.get("success").toString())
        || "true".equals(json.get("success").toString())) {
      String remoteAddr = dataMap.get("remoteAddr").toString();
      Map<String, Object> logMap = new HashMap<String, Object>();
      logMap.put("userid", userId);
      logMap.put("module", "文件流转");
      logMap.put("ip", remoteAddr);
      logMap.put("loginfo", "提交表单流程ID[" + logWfID + "]。");
      logMap.put("operate", "文件流转:提交流程");
      this.getLogService().saveLog(logMap);
      // 记录日志 end
    }
    return json;
  }

  @Override
  public String stationWorkflow(Map<String, Object> flow) {
    String modelId = flow.get("modelId").toString();
    String relationFrom = flow.get("relationForm").toString();
    if (!modelId.equals("")
        && (!"".equals(relationFrom) && relationFrom != null)) {
      Map<String, Object> _flow = this.getModelInit(Long.parseLong(modelId));
      String msg = this.generateWfXml(_flow);
      if (msg != null && msg.contains("发布成功")) {
        return "";
      } else {
        return "该流程未发布，不需要进行测试，请发布成功后再进行测试！";
      }
    } else {
      return "该流程未发布，不需要进行测试，请发布成功后再进行测试！";
    }
  }

  @SuppressWarnings("rawtypes")
  public boolean stepActionListDetails(String workFlowName,
      String modelBusiness, String relationFrom, long wfModelId,
      String reallReslut, UserEntry user, boolean hasSplit) {
    /**
     * 判断流程正常结束时有无函数的调用，如果有函数的调用时，验证表单中字段长度 HashMap<错误字段,false> wrongField = new
     * HashMap<String,Boolean>(); 如果为空的话，表示流程正常结束时调用正常
     * */
    HashMap<String, Boolean> flowFunctionCall = new HashMap<String, Boolean>();
    flowFunctionCall = functionCall(modelBusiness, relationFrom, wfModelId);

    /** 正常步骤所有的测试用户是否全通过，reslut = true为存在一些用户不通过 */
    boolean stepReslut = false;
    /** 正分支步骤所有的测试用户是否全通过，reslut = true为存在一些用户不通过 */
    boolean splitReslut = false;
    String wrongUser = "";
    /** 获取xml中测试用户 */
    /** 解析 */
    SAXBuilder saxBuilder = new SAXBuilder();
    List rows1 = null;
    List rows2 = null;
    List rows3 = null;
    org.jdom.Element step1 = null;
    org.jdom.Element step2 = null;
    org.jdom.Element step3 = null;
    Reader reader = new StringReader(reallReslut);
    try {
      org.jdom.Document docs = saxBuilder.build(reader);
      org.jdom.Element root = docs.getRootElement();
      rows1 = (List) XPath.selectNodes(root, "//dir");
      for (int i = 0; i < rows1.size(); i++) {
        /** 标记步骤正常或不正常 */
        StringBuffer flag = new StringBuffer();
        StringBuffer splitflag = new StringBuffer();
        // StringBuffer buffer1 = new StringBuffer();
        // StringBuffer buffer2 = new StringBuffer();
        step1 = (Element) rows1.get(i);
        /** jiangyuntao 20130731 edit 通过username获取，因为中文名可能重复，中文名只用户显示 **/
        wrongUser = step1.getAttribute("username").getValue();
        rows2 = (List) XPath.selectNodes(root, "//dir[@username=\"" + wrongUser
            + "\"]/res");
        rows3 = (List) XPath.selectNodes(root, "//dir[@username=\"" + wrongUser
            + "\"]/split/res");
        for (int j = 0; j < rows2.size(); j++) {
          step2 = (org.jdom.Element) rows2.get(j);
          flag = flag.append(step2.getAttribute("flag").getValue());
        }
        if (!rows3.isEmpty()) {
          for (int k = 0; k < rows3.size(); k++) {
            step3 = (org.jdom.Element) rows3.get(k);
            splitflag = splitflag.append(step3.getAttribute("flag").getValue());
          }
          if (splitflag.toString().contains("1")) {
            splitReslut = true;
          }
        }
        if (flag.toString().contains("1")) {
          stepReslut = true;// 测试用户是否都通过了测试
        }
      }
    } catch (JDOMException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    if (stepReslut || splitReslut || !flowFunctionCall.isEmpty()) {
      /** 如果没通过的，则以报表的形式打印出来 */
      // writeReportToSysDir(workFlowName, modelBusiness, relationFrom,
      // wfModelId,
      // reallReslut, user, hasSplit, flowFunctionCall);
    } else {
      return true;
    }
    return false;
  }

  private void stepManageDetails(UserEntry testUser, Map<String, Object> owm,
      List<Pair<String, Pair<Boolean, List<Map<String, Object>>>>> stepString,
      StringBuffer buffer) {
    for (int i = 0; i < stepString.size(); i++) {
      /** 上一步 */
      String backStep = stepString.get(i).left;
      /** 下一步 */
      Map<String, Object> nextStep = stepString.get(i).right.right.get(0);
      List<Map<String, Object>> listStep = stepString.get(i).right.right;
      boolean isHasNextOwner = false;
      /** 判断是不是第一步 */
      if (nextStep.get("step_id").equals(owm.get("first_step_id"))) {
        isHasNextOwner = true;
      }
      if (!isHasNextOwner) {
        String roles = nextStep.get("next_step_roles").toString();
        String users = nextStep.get("next_step_users").toString();
        Integer isRelation = Integer.parseInt(nextStep.get("is_relationpart")
            .toString());
        Integer isRelationByCaller = Integer.parseInt(nextStep.get(
            "is_relationcaller").toString());
        List<UserEntry> userlist = new ArrayList<UserEntry>();
        List<UserEntry> userRolelist = new ArrayList<UserEntry>();
        String splitString = "";
        /** 存放返回回来的结果 */
        if (null != roles && !roles.equals("")) {
          String[] roleArray = roles.split(",");
          for (int j = 0; j < roleArray.length; j++) {
            /** 如果按第一步处理人过滤角色勾选上了进第一个IF，否则按原来跑 */
            if (null != isRelationByCaller
                && isRelationByCaller.intValue() == 1) {
              userRolelist.addAll(this.getUsers(roleArray[j], testUser,
                  isRelationByCaller));
            } else {
              userRolelist.addAll(this.getUsers(roleArray[j], testUser,
                  isRelation));
            }
          }
        }
        if (null != users && !users.equals("")) {
          String[] rightUsers = users.split(",");
          for (int k = 0; k < rightUsers.length; k++) {
            /** 如果按第一步处理人过滤角色勾选上了进第一个IF，否则按原来跑 */
            if (null != isRelationByCaller
                && isRelationByCaller.intValue() == 1) {
              userlist.addAll(this.getRUsers(rightUsers[k], testUser,
                  isRelationByCaller));
            } else {
              userlist.addAll(this.getRUsers(rightUsers[k], testUser,
                  isRelation));
            }
          }
        }
        splitString = normalStepDetails(userRolelist, userlist, backStep,
            listStep, false);
        buffer.append(splitString);
      }
    }
  }

  private boolean tableIfExists(String stageId) {
    String sql = "select TABLE_NAME from information_schema.tables where  TABLE_NAME = 'esp_"
        + stageId + "' and TABLE_SCHEMA='esdocument' ";
    try {
      Map<String, Object> table = query.query(sql, new MapHandler());
      if (table != null && table.get("TABLE_NAME") != null) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean testWorkflow(long wfmodelId, UserEntry user,
      String modelBusiness, String relationFrom, String workFlowName) {

    boolean hasSplit = false;
    StringBuffer buffer = new StringBuffer();

    List<Map<String, Object>> wfStep = this.getStepByFlowId(wfmodelId);

    Map<String, Object> owm = this.getModelInit(wfmodelId);

    /** 不含分支流程组装的数据集合List<Pair<上一步,Pair<是否含分支,下一步步骤集合>>>* */
    List<Pair<String, Pair<Boolean, List<Map<String, Object>>>>> stepString = new ArrayList<Pair<String, Pair<Boolean, List<Map<String, Object>>>>>();
    /** 含分支流程组装的数据集合HashMap<Pair<上一步,Pair<是否含分支,下一步步骤集合>>>,分支的上一步动作ID> */
    HashMap<Pair<String, Pair<Boolean, List<Map<String, Object>>>>, String> splitString = new HashMap<Pair<String, Pair<Boolean, List<Map<String, Object>>>>, String>();

    Map<String, Map<String, Element>> map = parseGraphXML(owm);
    Map<String, Element> startMap = map.get("init");
    Element startEl = startMap.get("start");
    Element endEl = startMap.get("end");
    String startId = startEl.getAttribute("id").getValue();
    String endId = endEl.getAttribute("id").getValue();

    Map<String, Element> stepMap = map.get("step");
    /** 步骤 */
    Map<String, Element> splitMap = map.get("split");
    /** 分支 */
    Map<String, Element> actionMap = map.get("action");
    /** 动作 */
    for (String actionId : actionMap.keySet()) {
      Pair<String, Pair<Boolean, List<Map<String, Object>>>> stepDetails = new Pair<String, Pair<Boolean, List<Map<String, Object>>>>();
      /** 防止后面的数据覆盖前面的数据，放到循环中 */
      String[] sourceTarget = new String[2];
      Element actionEl = actionMap.get(actionId);
      Attribute source = actionEl.getAttribute("source");
      String sourceId = source.getValue();
      Attribute target = actionEl.getAttribute("target");
      String targetId = target.getValue();
      sourceTarget[0] = sourceId;
      sourceTarget[1] = targetId;
      if (splitMap.keySet().contains(targetId)) {
        hasSplit = true;
        /** 分支 */
        Pair<Boolean, List<Map<String, Object>>> stepData = new Pair<Boolean, List<Map<String, Object>>>();
        stepData = this.getNextStepFromGraphXML(owm, actionId);
        Element sourceEl = stepMap.get(sourceId);
        String sourceStepsName = sourceEl.getAttribute("value").getValue();
        stepDetails.left = sourceStepsName;
        stepDetails.right = stepData;
        splitString.put(stepDetails, actionId);
      } else {
        if (!sourceTarget[0].equals(startId) && !sourceTarget[1].equals(endId)) {
          Pair<Boolean, List<Map<String, Object>>> stepData1 = new Pair<Boolean, List<Map<String, Object>>>();
          stepData1 = this.getNextStepFromGraphXML(owm, actionId);
          Element sourceEl = stepMap.get(sourceId);
          String sourceStepName = "";
          if (!"".equals(sourceEl) && sourceEl != null) {
            sourceStepName = sourceEl.getAttribute("value").getValue();
            stepDetails.left = sourceStepName;
            stepDetails.right = stepData1;
            stepString.add(stepDetails);
            splitString.put(stepDetails, "");
          } else {
            continue;
          }
        }
      }
    }
    /** 获取要测试的用户 */
    Map<String, String> param = new HashMap<String, String>();
    param.put("keyWord", "");
    param.put("userIds", "");
    param.put("start", "");
    param.put("limit", "");
    Map<String, Object> userMap = this.getUserQueryService()
        .findUserList(param);
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> userList = (List<Map<String, Object>>) userMap
        .get("users");
    buffer.append(xmlHeader);
    buffer.append(dataHeader);
    if (hasSplit) {
      /** 同机构同角色只测一个 */
      Set<HashMap<String, List<Role>>> rightUserRO = new HashSet<HashMap<String, List<Role>>>();
      List<Map<String, Object>> rightUser = new ArrayList<Map<String, Object>>();

      for (Map<String, Object> u : userList) {
        /** HashMap<机构,角色> */
        HashMap<String, List<Role>> R = new HashMap<String, List<Role>>();
        List<Map<String, Object>> roleList = this.getRoleService()
            .getRoleListByUserId(Long.parseLong(u.get("id").toString()));
        List<Role> roles = this.changeMap2Role(roleList);
        List<Participatory> parts = this.getParticipatoryService()
            .getParticipatoryByUserId(u.get("userid").toString());
        R.put(parts.get(0).getCode(), roles);
        if (!rightUserRO.contains(R)) {
          rightUserRO.add(R);
          u.put("deptCode", parts.get(0).getCode());
          rightUser.add(u);
        }
      }

      for (Map<String, Object> u : rightUser) {
        this.validateStepAndSpitOwer(splitString, owm, modelBusiness,
            wfmodelId, wfStep, this.changeMap2User(u), user, buffer);
      }
    } else {
      /** 不含有分支的情况 同机构的只测一个(还得获取到分支条件与上一步处理步骤比较且分支中只能仅有一个满足条件) */
      for (Map<String, Object> u : userList) {
        this.validateStepOwer(stepString, owm, wfmodelId, wfStep,
            this.changeMap2User(u), user, buffer);
      }
    }
    buffer.append(dataFooter);
    String reallReslut = buffer.toString();
    return this.stepActionListDetails(workFlowName, modelBusiness,
        relationFrom, wfmodelId, reallReslut, user, hasSplit);
  }

  public boolean updateESFFormValue(long dataId,
      @SuppressWarnings("rawtypes") Map dataMap) {
    StringBuffer updateDocument = new StringBuffer("update ess_document set ");
    String stageId = this.getCollaborativeService().getStageIdByDocId(dataId)
        .get("id").toString();
    List<Map<String, Object>> list = this.getFilingService().findMoveCols(2,
        this.getFilingService().getParentStageIds(Long.parseLong(stageId)));
    if (this.tableIfExists(stageId)) {
      StringBuffer updateEsp = new StringBuffer("update esp_" + stageId
          + " set ");
      for (Map<String, Object> map : list) {
        String code = map.get("code").toString();
        String value = dataMap.get(code).toString();
        if ("".equals(value)) {
          value = map.get("defaultValue").toString();
        }
        String type = map.get("type").toString();
        if ("TEXT".equals(type) || "DATETIME".equals(type)) {
          value = "'" + value + "'";
        }
        if ("DATE".equals(type) && value.length() >= 10) {
          value = "'" + value.substring(0, 10) + "'";
        }
        if (!"".equals(value)) {
          if ("0".equals(map.get("isSystem").toString())) {
            updateDocument.append(" " + code + "=" + value + ", ");
          } else {
            updateEsp.append(" " + code + "=" + value + ", ");
          }
        }
      }
      updateDocument.append(" id=" + dataId + " where id=" + dataId);
      updateEsp.append(" documentId=" + dataId + " where documentId=" + dataId);
      if (this.updateTable(updateDocument.toString())
          && this.updateTable(updateEsp.toString())) {
        return true;
      }
    } else {
      for (Map<String, Object> map : list) {
        String code = map.get("code").toString();
        if ("1".equals(map.get("isSystem").toString())) {
          updateDocument.append(" " + code + "=" + dataMap.get(code).toString()
              + " ");
        }
      }
      updateDocument.append(" id=" + dataId + " where id=" + dataId);
      return this.updateTable(updateDocument.toString());
    }
    return true;
  }

  private boolean updateESOSWFNOTICE(String userid, String wfid, String formid) {
    String sql = "update ess_transfernotice set  status='over' where form_id=? and user_id=? and wf_id=? ";
    try {
      int row = query.update(sql, new Object[] { formid, userid, wfid });
      if (row == 1) {
        return true;
      }
      return false;
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public boolean updateFlowForm(Map<String, Object> model, String modelId) {
    String sql = "update ess_transferform set name=?, form_type_id=?, form_js=?, form_id=?, modifyer=?, modifytime=?, form_js_html=?, form_js_html_usingsystem=?, is_create_table=?,flow_id=?  where form_id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { "表单" + model.get("stageId"), model.get("stageId"), "",
              "form-" + model.get("stageId"), model.get("creater"),
              model.get("createtime"), "", "", 1, modelId,
              "form-" + model.get("stageId") });
      if (row == 1) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean updateStepInit(Map<String, Object> step) {
    String sql_update = "update ess_transferstep set name=?,step_child_id=?, next_step_roles=?, next_step_users=?, edit_field=?, edit_field_print=?,is_countersign=?  where flow_id=? and step_id=? ";
    try {
      String childStepId = this.checkIfNull(step.get("step_child_id"), "");
      String is_countersign = this.checkIfNull(step.get("is_countersign"), "");
      int row = query.update(
          sql_update,
          new Object[] { step.get("ES_STEP_NAME"),
              "".equals(childStepId) ? 0 : childStepId, step.get("roleIds"),
              step.get("userIds"), step.get("selectField"),
              step.get("selectFieldPrint"),
              "".equals(is_countersign) ? 0 : Integer.parseInt(is_countersign),
              step.get("modelId"), step.get("stepId") });
      if (row != 1) {
        return false;
      }
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean updateTable(String sql) {
    try {
      int row = query.update(sql);
      if (row == 1) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public boolean updateWfState(String wfId) {
    String sql = "update ess_transferform_user set wf_status='over' , end_time = ? where wf_id=? ";
    try {
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
      int row = query
          .update(sql, new Object[] { sdf.format(new Date()), wfId });
      if (row == 1) {
        return true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
    return false;
  }

  @Override
  public List<Map<String, Object>> validateSplitActionIsFrom(
      Map<String, Object> osWfModel, String firstActionId) {
    String graphXml = osWfModel.get("graphXml").toString();
    if (null == graphXml)
      return null;
    List<Map<String, Object>> listAction = new ArrayList<Map<String, Object>>();
    try {
      Element firstActionEl = this.readerGraphXml(graphXml, firstActionId);
      // split step id
      Attribute target = firstActionEl.getAttribute("target");
      // split
      Element splitEl = this.readerGraphXml(graphXml, target.getValue());
      Attribute splitIdAtt = splitEl.getAttribute("id");
      List<org.dom4j.Element> rightActions = getAllActionFromGraphXml(graphXml,
          "//mxCell[@source='" + splitIdAtt.getValue() + "']");
      StringBuffer ids = new StringBuffer();
      for (org.dom4j.Element e : rightActions) {
        org.dom4j.Attribute id = e.attribute("id");
        ids.append(" action_id = ").append(id.getText()).append(" OR");
      }
      if (!ids.equals("")) {
        ids.deleteCharAt(ids.length() - 1);
        ids.deleteCharAt(ids.length() - 1);
        String sql = "select * from ess_transferaction where flow_id="
            + osWfModel.get("id") + " and (" + ids + ") ";
        try {
          listAction = query.query(sql, new MapListHandler());
        } catch (SQLException e1) {
          e1.printStackTrace();
        }
      }
    } catch (DocumentException e) {
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    }
    return listAction;
  }

  public String validateStepAndSpitOwer(
      HashMap<Pair<String, Pair<Boolean, List<Map<String, Object>>>>, String> splitString,
      Map<String, Object> owm, String modelBusiness, long wfModelId,
      List<Map<String, Object>> stepList, UserEntry testUser, UserEntry user,
      StringBuffer buffer) {
    if (!splitString.isEmpty()) {
      splitManageDetails(wfModelId, testUser, owm, splitString, buffer);
    }
    buffer.append("</dir>");
    return buffer.toString();
  }

  public String validateStepOwer(
      List<Pair<String, Pair<Boolean, List<Map<String, Object>>>>> stepString,
      Map<String, Object> owm, long wfModelId,
      List<Map<String, Object>> stepList, UserEntry testUser, UserEntry user,
      StringBuffer buffer) {
    if (!stepString.isEmpty()) {
      /** jiangyuntao 20130731 edit 增加username，因为中文名可能重复，中文名只用户显示 **/
      buffer.append("<dir user= ");
      buffer.append("\"" + testUser.getDisplayName() + "\" username=\""
          + testUser.getUserid() + "\"  >");
      this.stepManageDetails(testUser, owm, stepString, buffer);
    }
    buffer.append("</dir>");
    return buffer.toString();
  }

  private Element validateXml(String params) {
    StringReader xmlReader = new StringReader(params);
    SAXBuilder xmlBuilder = null;
    Document document = null;
    xmlBuilder = new SAXBuilder(false);
    try {
      document = xmlBuilder.build(xmlReader);
    } catch (JDOMException e) {
      return null;
    } catch (IOException e) {
      return null;
    }

    if (document == null) {
      return null;
    }

    Element rootElement = document.getRootElement();
    if (rootElement == null) {
      return null;
    }
    return rootElement;
  }

  private boolean validatorIsToPreAction(int level, String startTarget,
      String validatorStepId, String stepId, List<String> overSteps,
      Map<String, Element> stepMap, Map<String, Element> actionMap) {
    boolean isToPreAction = false;
    for (String actionId : actionMap.keySet()) {
      Element actionEl = actionMap.get(actionId);
      Attribute source = actionEl.getAttribute("source");
      Attribute target = actionEl.getAttribute("target");
      if (null == source || null == target)
        continue;
      String sourceId = source.getValue();
      String targetId = target.getValue();
      if (targetId.equals(validatorStepId)) {
        if (level == 1) {// 当是对一及时 创建追溯路径对象
          overSteps = new ArrayList<String>();
        }
        if (sourceId.equals(stepId)) {// 当动作的发起等于验证步骤时 说明是回退动作 跳出
          isToPreAction = true;
          break;
        } else if (sourceId.equals(startTarget)) {// 当动作的发起是第一步时 跳出
          break;
        } else if (overSteps.contains(sourceId)) {// 当追溯路径中已经存在当前步骤 跳出 （此步很重要
                                                  // 避免出现死循环）
          break;
        } else {// 否则继续追溯
          overSteps.add(validatorStepId);
          isToPreAction = this.validatorIsToPreAction(2, startTarget, sourceId,
              stepId, overSteps, stepMap, actionMap);
        }
      }
    }
    return isToPreAction;
  }

  private boolean validatorSplitAction(Map<String, Element> actionMap,
      Map<String, Element> splitMap, String stepId, String splitActionId) {
    for (String actionId : actionMap.keySet()) {
      Element actionEl = actionMap.get(actionId);
      String sourceId = actionEl.getAttributeValue("source");
      if (splitActionId.equals(actionId)) {
        if (splitMap.keySet().contains(sourceId)) {
          for (String id : actionMap.keySet()) {
            Element el = actionMap.get(id);
            String sId = el.getAttributeValue("source");
            String tId = el.getAttributeValue("target");
            if (tId.equals(sourceId) && sId.equals(stepId)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  @Override
  public Map<String, String> verificationIsHasNotDealWf(Map<String, Object> flow) {
    String modelID = flow.get("modelID").toString();
    Map<String, String> json = new HashMap<String, String>();
    if (null == modelID || "".equals(modelID)) {
      json.put("check", "false");
      json.put("msg", "删除失败！请尝试先设置开始节点再继续此操作！");
      return json;
    }
    Long modelid = Long.parseLong(modelID);
    String others = flow.get("others").toString();
    if (null != others && others.length() > 1) {
      String tempothers[] = others.substring(1).split(",");
      Map<String, Object> _flow = this.getModelInit(modelid);
      if (_flow != null && !_flow.isEmpty()) {
        String form_relation = this.checkIfNull(_flow.get("form_relation"), "");
        if (null != form_relation && !"".equals(form_relation.trim())) {
          List<Map<String, Object>> wfids = new ArrayList<Map<String, Object>>();
          wfids = this.queryWFIDsByFlowID(Long.parseLong(_flow.get("id") + ""));
          if (wfids == null || wfids.isEmpty()) {
            json.put("has", "false");
          } else {
            StringBuffer condBuffer = new StringBuffer();
            condBuffer.append(" (");
            for (Map<String, Object> oneid : wfids) {
              condBuffer.append("ENTRY_ID = " + oneid.get("ID")).append(" or ");
            }
            condBuffer.delete(condBuffer.length() - 4, condBuffer.length());
            condBuffer.append(") and (");
            for (String oneStep : tempothers) {
              condBuffer.append("STEP_ID = " + Long.parseLong(oneStep)).append(
                  " or ");
            }
            condBuffer.delete(condBuffer.length() - 4, condBuffer.length());
            condBuffer.append(")");
            List<Map<String, Object>> steps = new ArrayList<Map<String, Object>>();
            steps = this.getWfCurrentStepId("", condBuffer.toString());
            if (steps == null || steps.isEmpty()) {
              json.put("has", "false");
            } else {
              String msg = "";
              String otherNames = flow.get("otherNames").toString();
              String otherNameArray[] = otherNames.substring(1).split(",");
              for (Map<String, Object> item : steps) {
                int n = 0;
                for (String oneStep : tempothers) {
                  if (oneStep.equals(item.get("step_id").toString())) {
                    msg = msg + otherNameArray[n] + "、";
                    break;
                  }
                  n++;
                }
              }
              json.put("msg",
                  "系统中存在处于当前步骤的流程数据，步骤【" + msg.substring(0, msg.length() - 1)
                      + "】不能被删除！");
              json.put("has", "true");
            }
          }
        } else {
          json.put("has", "false");
        }
      } else {
        json.put("has", "false");
      }
    }
    return json;
  }

  @SuppressWarnings("deprecation")
  @Override
  public Map<String, Object> wfForwardAction(Map<String, Object> map) {
    String wfId = map.get("wfId").toString();
    String userFormID = map.get("userFormID").toString();
    String userId = map.get("userId").toString();
    Map<String, Object> json = new HashMap<String, Object>();
    // 1 - > 1 改变转发消息状态
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    String sendUser = this.getUserNameByUserFormIdAndNowUserId(
        Long.parseLong(userFormID), user.getId(), "to");
    getMessageWS().updateEssMessageWorkFlowStatus(Long.parseLong(wfId), "Over",
        Long.parseLong(userFormID), userId, sendUser);
    // 1 - > 2 改变中间表记录状态
    boolean flag = this.changWorkFlowState(Long.parseLong(userFormID),
        Long.parseLong(wfId), userId, "0", "");
    // 回弹消息发送
    EssMessage message = new EssMessage();
    message.setSender(userId);
    message.setRecevier(sendUser);
    message.setContent(SimpleEncodeOrDecode.simpleEncode("文件转发已阅"));
    message.setSendTime(DateUtil.getDateTime());
    message.setStatus(workflowstatus_run);
    message.setWorkFlowId(Long.parseLong(wfId));
    message.setWorkFlowStatus(workflowstatus_run);
    message.setStepId(Long.parseLong(userFormID));
    Map<String, String> collMap = this.getCollaborativeService()
        .getCollaborativeMsgByWfId(Long.parseLong(wfId), "1", sendUser);
    if (collMap == null) {
      message.setHandler("");
    } else {
      message.setHandler("collaborativeHandle.toTodoFormPage('"
          + collMap.get("id") + "','" + collMap.get("flowId") + "','"
          + collMap.get("formId") + "','" + wfId + "','" + 10000 + "','"
          + collMap.get("dataId") + "','" + collMap.get("status") + "','"
          + collMap.get("title") + "','" + collMap.get("userFormNo") + "','"
          + "5" + "','" + false + "')");
    }
    message.setHandlerUrl("esdocument/" + this.instanceId
        + "/x/ESMessage/handlerMsgPage");
    getMessageWS().addEssMessage(message);
    json.put("success", "true");
    if (flag) {
      Map<String, Object> localLogMap = new HashMap<String, Object>();
      localLogMap.put("userid", user.getUserid());
      localLogMap.put("module", "我的待办");
      localLogMap.put("ip", map.get("remoteAddr"));
      localLogMap.put("loginfo", user.getEmpName() + "协同转发已阅!");
      localLogMap.put("operate", "我的待办：协同转发已阅");
      this.getLogService().saveLog(localLogMap);
    }
    return json;
  }

  @SuppressWarnings("deprecation")
  @Override
  public Map<String, Object> WfNoticeAction(Map<String, String> map) {
    String wfId = map.get("wfId").toString();
    String flowId = this.checkIfNull(map.get("flowId"), "");
    String formId = map.get("formId").toString();
    String opinionValue = map.get("opinionValue").toString();
    String userId = map.get("userId").toString();
    Map<String, Object> json = new HashMap<String, Object>();
    UserEntry currentUser = getUserQueryService().getUserInfo(
        this.getServiceId(), this.getToken(), userId, null);
    Map<String, Object> flow = new HashMap<String, Object>();
    if ("".equals(flowId)) {
      flow = getFlowByWfId(wfId);
    } else {
      flow = this.getModelInit(Long.parseLong(flowId));
    }
    @SuppressWarnings("unused")
    String wfIdentifier = flow.get("identifier").toString();
    this.updateESOSWFNOTICE(currentUser.getId() + "", wfId, formId);
    this.changWorkFlowState(0l, Long.parseLong(wfId), userId, "0", ""); // 将中间表状态该为已办
    getMessageWS().editMessageWorkFlowStatusByWorkFlowId(Long.parseLong(wfId),
        Long.parseLong("10000"), userId);
    /** 如果有回复意见，则发送消息。 **/
    if (null != opinionValue && !"".equals(opinionValue)) {
      Map<String, Object> form = this.getFormById(formId);
      String formTitle = "";
      if (formId != null && !"".equals(formId)) {
        formTitle = form.get("name").toString();
      }
      String subTitle = null;
      if (formTitle != null && !"".equals(formTitle) && formTitle.length() > 10) {
        subTitle = formTitle.substring(0, 10) + "...";
      } else {
        subTitle = formTitle;
      }
      Map<String, Object> users = this.getHistoryOwner(Long.parseLong(wfId));
      Pattern pattern = Pattern.compile("[0-9]*");
      List<String> sendedUsers = new ArrayList<String>();
      Set<String> ss = new HashSet<String>();
      ss.add(users.get("user_id").toString());
      ss.add(users.get("owner").toString());
      for (String user : ss) {
        Matcher isNum = pattern.matcher(user);
        if (isNum.matches()) {
          user = getUserQueryService().getUserInfoById(user).getUserid();
        }
        if (sendedUsers.contains(user)) {
          continue;
        }
        // 增加判断，过滤掉当前用户。
        if (!user.equals(currentUser.getUserid())) {
          EssMessage message = new EssMessage();
          message.setSender(userId);
          message.setRecevier(user);
          message.setContent(SimpleEncodeOrDecode.simpleEncode("(知会人回复)请查看"
              + (subTitle == "" ? "流程" : subTitle)));
          message.setSendTime(DateUtil.getDateTime());
          message.setStatus(workflowstatus_run);
          message.setWorkFlowId(Long.parseLong(wfId));
          message.setWorkFlowStatus(workflowstatus_run);
          message.setStepId(10000);
          Map<String, String> collMap = this.getCollaborativeService()
              .getCollaborativeMsgByWfId(Long.parseLong(wfId), "1", user);
          if (collMap == null) {
            message.setHandler("");
          } else {
            message.setHandler("collaborativeHandle.toTodoFormPage('"
                + collMap.get("id") + "','" + collMap.get("flowId") + "','"
                + formId + "','" + wfId + "','" + 10000 + "','"
                + collMap.get("dataId") + "','" + collMap.get("status") + "','"
                + collMap.get("title") + "','" + collMap.get("userFormNo")
                + "','" + collMap.get("workFlowType") + "','" + false + "')");
          }
          message.setHandlerUrl("esdocument/" + this.instanceId
              + "/x/ESMessage/handlerMsgPage");
          getMessageWS().addEssMessage(message);
          sendedUsers.add(user);
          System.out.println("(知会人回复)发送消息成功：" + user);
        }
      }
    }
    json.put("success", "true");
    // 写本地日志
    Map<String, Object> localLogMap = new HashMap<String, Object>();
    localLogMap.put("userid", currentUser.getUserid());
    localLogMap.put("module", "我的待办");
    localLogMap.put("ip", map.get("remoteAddr"));
    localLogMap.put("loginfo", currentUser.getEmpName() + "审批知会流程!");
    localLogMap.put("operate", "我的待办：审批知会流程");
    this.getLogService().saveLog(localLogMap);
    return json;
  }

  private Map<String, Object> getFlowByWfId(String wfId) {
    String sql = "select * from os_wfentry where ID=?";
    try {
      Map<String, Object> entry = query.query(sql, new MapHandler(), wfId);
      if (entry != null) {
        List<Map<String, Object>> list = this.getFlowListByIdentifier(entry
            .get("name").toString());
        if (list.size() > 0 && list != null) {
          return list.get(0);
        }
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String uniqueName(Map<String, Object> flowType) {
    String sql = "select count(id) from ess_transferflow_type where pId=? and name=? ";
    try {
      long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {
          flowType.get("pId"), flowType.get("name").toString().trim() });
      if (cnt > 0) {
        return "false";
      }
      return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  @Override
  public String uniqueFunName(String name) {
    String sql = "select count(id) from ess_transferfunctions where functionName='"
        + name + "'";
    try {
      long cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt > 0) {
        return "false";
      }
      return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  /**
   * lujixiang 20150421 暂停工作流
   * 
   * @param wfId
   * @return
   */
  @Override
  public String haltWorkFlow(String wfId) {

    long flowId = Long.parseLong(wfId);
    return this.haltOsWfModel(flowId);
  }

  private String haltOsWfModel(long flow_id) {
    String sql = "update ess_transferflow set status = 0  where id = ? ";
    try {
      int row = query.update(sql, flow_id);
      if (row != 1) {
        return "未发现要删除的流程";
      }
      return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除流程失败";
    }
  }
}
