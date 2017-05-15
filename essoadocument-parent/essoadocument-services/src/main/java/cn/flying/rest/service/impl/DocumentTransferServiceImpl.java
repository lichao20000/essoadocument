package cn.flying.rest.service.impl;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.lang.StringUtils;
import org.dom4j.DocumentException;
import org.dom4j.io.SAXReader;
import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.dao.DocumentTransferDao;
import cn.flying.rest.entity.CollaborativeEntity;
import cn.flying.rest.entity.Pair;
import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.IDocumentTransferService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.JdbcUtil;
import cn.flying.rest.service.workflow.JDBCTemplateWorkflowStore;
import cn.flying.rest.service.workflow.MySpringConfiguration;

import com.opensymphony.module.propertyset.PropertySet;
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

@Path("documentTransfer")
@Component
public class DocumentTransferServiceImpl extends BasePlatformService implements
    IDocumentTransferService {
  @Resource(name = "queryRunner")
  private QueryRunner query;
  @Autowired
  private DocumentTransferDao documentTransferDao;
  @Resource(name = "osworkflowConfiguration")
  private Configuration wfConfiguration;
  private UserQueryService userQueryService;
  
  private String url;

  public String getUrl() {
    return url;
  }
  
  @Value("${c3p0.url}")
  public void setUrl(String url) {
    url = url.substring(url.indexOf("://")+3, url.indexOf("?"));
    url = url.substring(url.indexOf("/")+1);
    this.url = url;
  }


  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }

  private MessageWS messageWS;

  private MessageWS getMessageWS() {
    if (this.messageWS == null) {
      this.messageWS = this.getService(MessageWS.class);
    }
    return this.messageWS;
  }
  private ILogService logService;

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }
  @Override
  public Map<String, Object> checkTransfer(Map<String, Object> map) {// map 包含 id,stageId,
    String rightCond = "1=1";// 权限信息 留下接口
    StringBuilder msg = new StringBuilder();
    boolean flag = false;
    if (map.containsKey("id")) {

      flag = documentTransferDao.checkTransfer(Long.parseLong(map.get("id").toString()), rightCond);
      if (flag) {// 该条数据可以进行发起移交流程
        // 验证是否存在流程
        flag = documentTransferDao.checkIfExitsFlow(Long.parseLong(map.get("stageId").toString()));
        if (flag) {
          msg.append("该数据所在收集范围存在已发布流程，该条数据可以进行流转！");
        } else {
          msg.append("该收集范围不存在已发布流程！");
        }
      } else {
        msg.append("该条数据正在进行流转！");
      }

    } else {
      msg.append("未找到匹配数据！");
    }
    Map<String, Object> rtMap = new HashMap<String, Object>();
    rtMap.put("msg", msg.toString());
    rtMap.put("transfer", flag);
    return rtMap;
  }

  @Override
  public Map<String, Object> getWfList(Map<String, String> dataMap) {
    String stageId = dataMap.get("stageId");
    /** 表单分类Id **/
    List<HashMap<String, Object>> formList = new ArrayList<HashMap<String, Object>>();
    Map<String, Object> resultMap = documentTransferDao.getWfList(stageId);
    long resultSize = (Long) resultMap.get("size");
    if (resultSize > 0) {
      List<Long> formIds = new ArrayList<Long>();
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> allform = (List<Map<String, Object>>) resultMap.get("data");
      if (null != allform && allform.size() > 0) {
        HashMap<String, Object> item = null;
        for (Map<String, Object> ofe : allform) {
          if (formIds.contains(Long.parseLong(ofe.get("id").toString())))
            continue;
          formIds.add(Long.parseLong(ofe.get("id").toString()));
          item = new HashMap<String, Object>();
          item.put("flowId", ofe.get("id"));
          item.put("flowName", ofe.get("name"));
          item.put("wfDescription", ofe.get("describtion"));
          formList.add(item);
        }
      }
    }
    Map<String, Object> returns = new HashMap<String, Object>();
    returns.put("size", formList.size());
    returns.put("data", formList);
    return returns;
  }

  @Override
  public Map<String, Object> showMyForm(HashMap<String, String> map) {
    Long id = Long.parseLong(map.get("id"));
    Long flowId = Long.parseLong(map.get("flowId"));
    Long stageId = Long.parseLong(map.get("stageId"));
    // String userId = map.get("userId").toString();
    Map<String, Object> transferFlow = documentTransferDao.getTransferFlow(flowId);
    long first_step = 0L;
    if (transferFlow.containsKey("first_step_id")) {
      first_step = Long.parseLong(transferFlow.get("first_step_id").toString());
    }
    String edit_field = "";
    if (first_step != 0L) {
      Map<String, Object> transferStepMap = documentTransferDao.getTransferStep(flowId, first_step);
      if (transferStepMap.containsKey("edit_field")) {
        edit_field = transferStepMap.get("edit_field").toString();
      }
    }
    String[] editFields = new String[] {};
    if (!StringUtils.isEmpty(edit_field)) {
      editFields = edit_field.split(",");

    }
    // UserEntry user =
    // getUserQueryService().getUserInfo(this.getServiceId(), this.getToken(), userId, null);

    List<Map<String, Object>> hmList = getMetaAllList(stageId);
    List<Map<String, Object>> essTaglist = new ArrayList<Map<String, Object>>();
    Map<String, Object> dataMap = getStageData(stageId, id);

    for (Map<String, Object> hm : hmList) {
      Map<String, Object> hashMap = new HashMap<String, Object>();
      hashMap.put("lable", hm.get("name"));
      hashMap.put("name", hm.get("code"));
      hashMap.put("type", hm.get("type"));
      hashMap.put("length", hm.get("length"));
      hashMap.put("dotLength", hm.get("dotLength"));
      hashMap.put("isSystem", hm.get("isSystem"));
      hashMap.put("isNull", hm.get("isNull"));
      hashMap.put("defaultValue", hm.get("defaultValue"));
      boolean isEdit = false;
      for (int i = 0; i < editFields.length; i++) {
        if (StringUtils.equals(editFields[i], hm.get("code").toString())) {
          isEdit = true;
          break;
        }
      }
      hashMap.put("isEdit", isEdit);
      Object value = dataMap.get(hm.get("code").toString());
      if (null != hm.get("type") && hm.get("type").toString().equals("BOOL")) {
        if (value != null) {
          value = Boolean.parseBoolean(value.toString()) == true ? "是" : "否";
        }
        if (isEdit) {
          Map<String, Object> boolOptions = new HashMap<String, Object>();
          boolOptions.put("是", "是");
          boolOptions.put("否", "否");
          hashMap.put("options", boolOptions);
        }
      }
      hashMap.put("value", value);
      essTaglist.add(hashMap);
    }
    Map<String, Object> resultmap = new HashMap<String, Object>();
    resultmap.put("data", essTaglist);
    resultmap.put("step", first_step);

    return resultmap;
  }

  private boolean judgeIfExistsTable(String tableName) {
    String databaseName = this.getUrl();
    String sql =
        " select count(1) cnt from information_schema.tables where table_name=? and table_schema='"+databaseName+"'";
    boolean flag = false;
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {tableName});
      if (cnt != null && !cnt.equals(Long.valueOf(0l))) {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  public Map<String, Object> getStageData(Long stageId, Long id) {
    StringBuilder fileds = new StringBuilder();
    List<Map<String, Object>> hmList = getMetaAllList(stageId);
    for (Map<String, Object> hm : hmList) {
      fileds.append(",");
      if (hm.get("isSystem").equals("0")) {
        fileds.append("a.");
      } else {
        fileds.append("b.");
      }
      fileds.append(hm.get("code"));
    }
    String tableName = "esp_" + stageId;

    String selectFields = fileds.toString();
    selectFields = selectFields.substring(1);
    Map<String, Object> dataMap = null;
    StringBuilder sql = new StringBuilder();
    sql.append(" SELECT ");
    sql.append(selectFields);
    sql.append(" FROM ");
    sql.append(" ess_document a ");
    if (judgeIfExistsTable(tableName)) {
      sql.append(" LEFT JOIN ").append(tableName).append(" b ON a.id = b.documentId ");
    }
    sql.append(" WHERE  a.id = ? ");
    Object[] params = {id};
    dataMap = JdbcUtil.query(query, sql.toString(), new MapHandler(), params);
    if (dataMap == null) {
      dataMap = new HashMap<String, Object>();
    }
    return dataMap;
  }

  // /**
  // * 获得某收集范围和其父节点的节点元数据集合
  // *
  // * @param stageId
  // * @return
  // */
  // private List<Map<String, Object>> getMetaList(Long stageId) {
  // List<Map<String, Object>> list = null;
  // String sql =
  // " select * from ess_document_metadata m where exists "
  // + " ( select 1 from ess_document_stage a where exists "
  // +
  // " ( select 1 from ess_document_stage b where (find_in_set( a.id, replace (b.id_seq, '.', ',')) "
  // + " or a.id = b.id) and b.id = ? ) and m.stageid = a.id ) ";
  // Object[] params = {stageId};
  // try {
  // list = query.query(sql, new MapListHandler(), params);
  // if (list == null) {
  // list = new ArrayList<Map<String, Object>>();
  // }
  // } catch (SQLException e) {
  // e.printStackTrace();
  // }
  // return list;
  // }
  /**
   * 获得某节点原数据和系统元数据
   * 
   * @param stageId
   * @return
   */
  private List<Map<String, Object>> getMetaAllList(Long stageId) {
    List<Map<String, Object>> list = null;
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    String sql =
        " select * from ess_document_metadata m where exists "
            + " ( select 1 from ess_document_stage a where exists "
            + " ( select 1 from ess_document_stage b where (find_in_set( a.id, replace (b.id_seq, '.', ',')) "
            + " or a.id = b.id) and b.id = ? ) and m.stageid = a.id or( m.stageId is null and m.isSystem= 0 ) ) ";
    Object[] params = {stageId};
    try {
      list = query.query(sql, new MapListHandler(), params);
      if (list == null) {
        result = new ArrayList<Map<String, Object>>();
      }else{
        for (Map<String, Object> mataMap : list) {
          // rongying 20150429 后添加的收集范围名称等元数据字段不显示
          if("stageName".equals(mataMap.get("code")+"") || "deviceName".equals(mataMap.get("code")+"") || 
              "participatoryName".equals(mataMap.get("code")+"") || "documentTypeName".equals(mataMap.get("code")+"") || 
              "engineeringName".equals(mataMap.get("code")+"") || "stageId".equals(mataMap.get("code")+"")){
            continue;
          }
          result.add(mataMap);
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return result;

  }

  @Override
  public List<Map<String, Object>> startTransferFlow(HashMap<String, String> map) {
    return null;
  }

  @Override
  public Map<String, Object> getWFModelByflowId(Map<String, String> param) {
    Map<String, Object> transferFlow =
        documentTransferDao.getTransferFlow(Long.parseLong(param.get("flowId")));
    long first_step = 0L;
    if (transferFlow.containsKey("first_step_id")) {
      first_step = Long.parseLong(transferFlow.get("first_step_id").toString());
    }
    Map<String, Object> actionMap =
        documentTransferDao.getTransferAction(Long.parseLong(param.get("flowId")), first_step);
    String actionId = actionMap.get("action_id").toString();
    transferFlow.put("actionId", actionId);
    return transferFlow;
  }

  @Override
  public String startWorkflow(Map<String, String> dataMap) {

    Map<String, Object> json = new HashMap<String, Object>();
    String userId = dataMap.get("userId");
    String flowId = dataMap.get("flowId");
    String formId = dataMap.get("formId");// stageId
    String dataId = dataMap.get("dataId");
    String actionId = dataMap.get("actionId");
    String selectUsers = dataMap.get("selectUsers");
    Map<String, Object> model = documentTransferDao.getTransferFlow(Long.parseLong(flowId));
    String wfIdentifier = model.get("identifier").toString();
    Integer firstStepId = Integer.parseInt(model.get("first_step_id").toString());
    UserEntry user = getUserQueryService().getUserByUserName(userId);
    if (this.canInitialize(userId, wfIdentifier, 2, null)) {
      long wfId = 0;
      try {
        wfId = this.initializeWorkflow(userId, wfIdentifier, null);
      } catch (Exception e) {
        e.printStackTrace();
        json.put("message", "工作流初始化失败！");
      }
      if (wfId > 1) {
        int ID = documentTransferDao.generateESFId(Long.parseLong(formId));
        StringBuffer buffer = new StringBuffer();// xiaoxiong 20120327 没有邮件的下一步处理人的集合
        try {
          // 保存表单数据
          boolean isSaved =
              this.updateESFFormValue(Long.parseLong(dataId.toString()), formId, dataMap);
          if (isSaved) {
            System.out.println("ESF_" + formId + "->save success");
          } else {
            this.killWorkflow(wfId);
            System.out.println("ESF_" + formId + "->save Error ");
            json.put("message", "保存表单数据时出现异常，请确认数据是否正确填写！");
            json.put("success", false);
            return json.toString();
          }
          Map<String, Object> map =
              this.getWorkflowStepParms(true, flowId, formId, user, wfId, selectUsers, actionId,
                  String.valueOf(firstStepId));
          this.doAction(userId, wfId, Integer.parseInt(actionId), map);
          System.out.println("start->" + wfId);

          Map<String, Object> userform = new HashMap<String, Object>();
          userform.put("id", String.valueOf(ID));
          userform.put("user_id", String.valueOf(user.getId()));
          userform.put("user_name", user.getDisplayName());
          userform.put("form_title", model.get("name").toString());
          userform.put("wf_id", String.valueOf(wfId));
          userform.put("wf_status", "flow");
          String organID = null;

          if (userId.equals("admin")) {
            organID = "1";
            userform.put("part_id", String.valueOf(organID));
          } else {
            organID = user.getDeptEntry().getOrgid();
            userform.put("part_id", organID);
          }
          CollaborativeEntity collEntity = new CollaborativeEntity();
          collEntity.setWfType("3"); // 类型为协同 协同类型从数据库查询OWNER和OWNER的ORGANID，不需从前台传入
          collEntity.setState("1");
          collEntity.setUserformID(ID);
          collEntity.setOrganID(Long.parseLong(organID));

          if (!documentTransferDao.startWorkflow(wfId, Long.parseLong(formId), ID, userform,
              collEntity)) {
            json.put("message", "工作流启动失败！请确认数据都已正确填写后重新启动！");
            Pair<Boolean, List<Map<String, Object>>> stepData =
                this.getNextStepFromGraphXML(model, actionId);
            List<Map<String, Object>> listStep = stepData.right;
            if (null != listStep && !listStep.isEmpty()) {
              for (Map<String, Object> step : listStep) {
                this.getMessageWS().removeEssMessageByWorkFlowId(wfId,
                    Long.parseLong(step.get("step_id").toString()));
              }
            }
            System.out.println("启动失败，消息已删除，启动操作已回滚！");
            json.put("success", false);
            return json.toString();
          }
          // this.saveAppendix(filePaths, dataList, fileNames, wfId, firstStepId, userId,
          // dataHaveRightMap);
          // this.setNoticeUsersForWf(user, wfIdentifier, wfModelId, actionId, String.valueOf(ID),
          // String.valueOf(wfId), formId);

          /** 判断当前流程的当前步骤是否需要发送邮件 并获取没有邮件的下一步处理人的集合 **/
          // OsWfAction action =
          // workflowDao.getWfActionByWfModelIDandAction(Long.parseLong(wfModelId),
          // Long.parseLong(actionId));
          // if (null != action) {
          // Integer esIsMail = action.getEsIsMail();
          // if (esIsMail != null) {
          // if (esIsMail.intValue() == 1) {
          // if (null != selectUsers && !selectUsers.equals("")) {
          // String[] splitSteps = selectUsers.split("-");
          // for (int m = 0; m < splitSteps.length; m++) {
          // String[] users = splitSteps[m].split(":");
          // String[] nextOwner = users[1].split(";");
          // for (int i = 0; i < nextOwner.length; i++) {
          // UserEntry tempUser = getUserQueryService().getUserInfoById(nextOwner[i]);
          // String email = tempUser.getEmailAddress();
          // if (email == null || "".equals(email)) {
          // buffer.append(tempUser.getDisplayName()).append("、");
          // System.out.println(tempUser.getDisplayName() + "没有输入邮箱地址，邮件发送失败！");
          // }
          // }
          // }
          // }
          // }
          // }
          // }
        } catch (Exception e) {
          // request.getSession().removeAttribute("FileReadOrDownLoadRight") ;//xiaoxiong 20110825
          // 将数据附件的权限从用户的SESSION中删除
          // request.getSession().removeAttribute("UsingWfDataAppendixList") ;//xiaoxiong 20110825
          // 将数据附件的值从用户的SESSION中删除
          // request.getSession().removeAttribute("UsingWfDataAppendixPathStrs") ;//xiaoxiong
          // 20110825 将数据附件的Path从用户的SESSION中删除
          // getCacheWS().delete("UsingWfDataAppendixList_" + userId);
          // getCacheWS().delete("FileReadOrDownLoadRight_" + userId);
          // getCacheWS().delete("UsingWfDataAppendixPathStrs_" + userId);
          json.put("message", "工作流启动失败！");
          json.put("success", false);
          this.killWorkflow(wfId);
        }
        // request.getSession().removeAttribute("FileReadOrDownLoadRight") ;//xiaoxiong 20110825
        // 将数据附件的权限从用户的SESSION中删除
        // request.getSession().removeAttribute("UsingWfDataAppendixList") ;//xiaoxiong 20110825
        // 将数据附件的值从用户的SESSION中删除
        // request.getSession().removeAttribute("UsingWfDataAppendixPathStrs") ;//xiaoxiong 20110825
        // 将数据附件的Path从用户的SESSION中删除
        // getCacheWS().delete("UsingWfDataAppendixList_"+userId);
        // getCacheWS().delete("FileReadOrDownLoadRight_"+userId);
        // getCacheWS().delete("UsingWfDataAppendixPathStrs_"+userId);
        json.put("id", String.valueOf(ID));
        json.put("wfid", wfId);
        json.put(
            "message",
            "工作流启动成功！"
                + (buffer.length() > 0 ? ("<br>但是【" + buffer.deleteCharAt(buffer.length() - 1) + "】没有输入邮箱地址，邮件发送失败！")
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
     if ("true".equals(json.get("success")+"")){
     String remoteAddr = dataMap.get("remoteAddr");
     HashMap<String,Object> logMap = new HashMap<String,Object>();
     logMap.put("ip", remoteAddr);
     logMap.put("userid",userId);
     logMap.put("module", "文件流转");
     logMap.put("loginfo", "提交表单流程ID["+json.get("wfid")+"]。");
     logMap.put("operate", "文件流转:提交流程");
     getLogService().saveLog(logMap);
     // 记录日志 end
     }
    return json.toString();

  }

  private Element readerGraphXml(String xml, String actionId) throws DocumentException,
      SAXException {
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

  private Map<String, Object> getStepByFlowIdAndStepId(long flowId, long stepId) {
    String sql = "select * from ess_transferstep where flow_id=? and step_id=? ";
    try {
      Map<String, Object> step = null;
      step = query.query(sql, new MapHandler(), new Object[] {flowId, stepId});
      if (step == null) {
        step = new HashMap<String, Object>();
      }
      return step;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  private List<org.dom4j.Element> getAllActionFromGraphXml(String xml, String cond)
      throws DocumentException, SAXException {
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

  public Pair<Boolean, List<Map<String, Object>>> getNextStepFromGraphXML(
      Map<String, Object> osWfModel, String actionId) {
    String graphXml = osWfModel.get("graphXml").toString();
    if (null == graphXml)
      return null;
    Pair<Boolean, List<Map<String, Object>>> returnData =
        new Pair<Boolean, List<Map<String, Object>>>();
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
        if (!nextStepValue.getValue().equals("分支") && !nextStepValue.getValue().equals("聚合")) {
          listStep.add(this.getStepByFlowIdAndStepId(
              Long.parseLong(osWfModel.get("id").toString()), Long.parseLong(targetId)));
          returnData.left = false;
          returnData.right = listStep;
          return returnData;
        } else {
          // 如果下一步是分支或聚合，就接收查找，直到找到步骤为止；
          Attribute nextStepId = nextStepEl.getAttribute("id");
          List<org.dom4j.Element> allActions =
              this.getAllActionFromGraphXml(graphXml, "//mxCell[@edge='1']");
          StringBuffer ids = new StringBuffer();
          for (org.dom4j.Element e : allActions) {
            org.dom4j.Attribute sourceId = e.attribute("source");
            if (nextStepId.getValue().equals(sourceId.getText())) {
              org.dom4j.Attribute stargetId = e.attribute("target");
              ids.append(" step_id = ").append(stargetId.getText()).append(" OR");
            }
          }
          if (!ids.equals("")) {
            ids.deleteCharAt(ids.length() - 1);
            ids.deleteCharAt(ids.length() - 1);
            try {
              String sql =
                  "select * from ess_transferstep where flow_id=" + osWfModel.get("id") + " and ("
                      + ids + ") ";
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

  private boolean canInitialize(String user, String workflowName, int initialAction, @SuppressWarnings("rawtypes") Map inputs) {
    return getWorkflow(user).canInitialize(workflowName, initialAction, inputs);
  }

  /**
   * 获取工作流
   * 
   * @param user 用户
   * @return 工作流
   */
  private Workflow getWorkflow(String user) {
    Workflow workflow = new BasicWorkflow(user);
    workflow.setConfiguration(wfConfiguration);
    return workflow;
  }

  /**
   * 初始化工作流
   * 
   * @param user 用户
   * @param workflowName 工作流名称
   * @param inputs 输入参数
   * @return inputs 工作流编号
   */
  private long initializeWorkflow(String user, String workflowName, Map<String, Object> inputs) {
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

  public boolean updateESFFormValue(long dataId, String formId, Map<String, String> dataMap) {
    StringBuffer updateDocument = new StringBuffer(" update ess_document set ");
    String stageId = formId;
    List<Map<String, Object>> list = documentTransferDao.getEditMataList(stageId);
    if (this.tableIfExists(stageId)) {
      StringBuffer updateEsp = new StringBuffer("update esp_" + stageId + " set ");
      for (Map<String, Object> map : list) {
        String code = map.get("code").toString();
        if ("0".equals(map.get("isSystem").toString())) {
          updateDocument.append(" " + code + "=" + dataMap.get(code).toString() + ", ");
        } else {
          updateEsp.append(" " + code + "=" + dataMap.get(code).toString() + " ,");
        }
      }
      updateDocument.append(" where id=" + dataId);
      updateEsp.append(" where documentId=" + dataId);
      if (this.updateTable(updateDocument.toString()) && this.updateTable(updateEsp.toString())) {
        return true;
      }
    } else {
      for (Map<String, Object> map : list) {
        String code = map.get("code").toString();
        if ("0".equals(map.get("isSystem").toString())) {
          updateDocument.append(" " + code + "=" + dataMap.get(code).toString() + " ");
        }
      }
      updateDocument.append(" where id=" + dataId);
      return this.updateTable(updateDocument.toString());
    }
    return true;
  }

  private boolean tableIfExists(String stageId) {
    String sql =
        "select TABLE_NAME from information_schema.tables where  TABLE_NAME = 'esp_" + stageId
            + "' and TABLE_SCHEMA='esdocument' ";
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

  public boolean killWorkflow(long workflowId) {
    try {
      if (getWorkflow("admin").canModifyEntryState(workflowId, WorkflowEntry.KILLED)) {
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

  private Map<String, Object> getWorkflowStepParms(boolean isFirstStep, String wfModelId,
      String formId, UserEntry user, long wfId, String selectUsers, String actionId, String stepId)
      throws Exception {

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
    // map.put(WorkflowManager.PARM_PKG_SERVER, pkgServer);
    map.put("formId", formId);
    map.put("currentUser", user);
    map.put("wfid", String.valueOf(wfId));
    map.put("step", stepId);
    map.put("actionId", actionId);
    map.put("flowId", wfModelId);
    map.put("platformSerciceProvider", this.compLocator);
    map.put("instanceId", 0);
    if (null != selectUsers && !selectUsers.equals("")) {
      String[] splitSteps = selectUsers.split("-");
      for (int m = 0; m < splitSteps.length; m++) {
        StringBuffer buffer = new StringBuffer();
        String[] users = splitSteps[m].split(":");
        String[] nextOwner = users[1].split(";");
        for (int i = 0; i < nextOwner.length; i++) {
          UserEntry tempUser = getUserQueryService().getUserInfoById(nextOwner[i]);
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
    } else {
    }
    if (isFirstStep) {
      ps.setString("ower" + stepId, user.getUserid());
      ps.setString("caller", user.getUserid());
    }
    return map;
  }

  /**
   * 执行工作流Action
   * 
   * @param user 用户
   * @param workflowId 工作流编号
   * @param actionId Action编号
   * @throws WorkflowException
   * @throws InvalidInputException
   */
  private void doAction(String user, long workflowId, int actionId, @SuppressWarnings("rawtypes") Map inputs) {
    try {
      getWorkflow(user).doAction(workflowId, actionId, inputs);
    } catch (InvalidInputException e) {
      e.printStackTrace();
    } catch (WorkflowException e) {
      e.printStackTrace();
    }
  }

  @Override
  public Boolean setTransferstaus(Map<String, String> dataMap) {
    String sql = "update ess_document set transferstatus=? where id=?";
    boolean flag = false;
    try {
      int row = query.update(sql, dataMap.get("transferStatus"), dataMap.get("dataid"));
      if (row != 0) {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }
}
