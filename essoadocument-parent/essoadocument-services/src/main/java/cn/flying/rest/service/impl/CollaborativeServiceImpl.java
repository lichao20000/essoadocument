package cn.flying.rest.service.impl;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ColumnListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.stereotype.Component;

import com.opensymphony.workflow.Workflow;
import com.opensymphony.workflow.loader.ActionDescriptor;
import com.opensymphony.workflow.loader.ResultDescriptor;
import com.opensymphony.workflow.loader.WorkflowDescriptor;

import cn.flying.rest.admin.entity.EssMessage;
import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.ICollaborativeService;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IParticipatoryService;
import cn.flying.rest.service.IReportService;
import cn.flying.rest.service.IRoleService;
import cn.flying.rest.service.ITransferFlowService;
import cn.flying.rest.service.entiry.Pair;
import cn.flying.rest.service.entiry.Participatory;
import cn.flying.rest.service.entiry.Role;
import cn.flying.rest.service.utils.SimpleMailSender;

/**
 * 我的待办模块
 * 
 * @author gengqianfeng
 * 
 */
@Path("collaborative")
@Component
public class CollaborativeServiceImpl extends BasePlatformService implements
    ICollaborativeService {
  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  private UserQueryService userQueryService;
  private ITransferFlowService transferFlowService;
  private IFilingService filingService;
  private IReportService reportService;
  private IParticipatoryService participatoryService;
  private IRoleService roleService;
  private MessageWS messageWS;

  @Override
  public String addAttachFileData(Map<String, Object> params) {
    @SuppressWarnings("unchecked")
    List<String> datas = (List<String>) params.get("datas");
    String wfId = params.get("wfId").toString();
    String stepId = params.get("stepId").toString();
    String type = params.get("type").toString();
    String userId = params.get("userId").toString();
    String userFormNo = params.get("userFormNo") + "";
    String sql = "insert into ess_form_appendix(fileName,fileSize,dataId,wf_id,type,wf_step_id,userName) values(?,?,?,?,?,?,?)";
    try {
      List<Map<String, Object>> appendixs = this.getAppendixList(
          Long.parseLong(wfId), Long.parseLong(stepId), type);
      String validateStr = "";
      String name = "";
      for (String data : datas) {
        String[] mes = data.split(",");
        boolean flag = false;
        for (Map<String, Object> appendix : appendixs) {
          if (mes[0].equals(appendix.get("dataId").toString())) {
            flag = true;
          }
        }
        if (!flag) {
          validateStr += ";" + mes[1] + "," + mes[2] + "," + mes[0] + ","
              + wfId + "," + type + "," + stepId + "," + userId;
        }
        name += mes[1] + ",";
      }
      validateStr = "".equals(validateStr) ? "" : validateStr.substring(1);
      name = "".equals(name) ? "" : name.substring(0, name.length() - 1);
      String[] str = validateStr.split(";");
      Object[][] obj = new Object[str.length][];
      for (int i = 0; i < obj.length; i++) {
        obj[i] = str[i].split(",");
      }
      long row = query.insertBatch(sql, new ScalarHandler<Long>(), obj);
      if (row > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", params.get("ip"));
        log.put("userid", userId);
        log.put("module", "我的待办");
        if (type.equals("data")) {
          log.put("operate", "我的待办：添加数据附件");
          log.put("loginfo", "添加流程编号为【" + userFormNo + "】,附件名称为【" + name
              + "】的数据附件信息！");
        } else if (type.equals("file")) {
          log.put("operate", "我的待办：添加文件附件");
          log.put("loginfo", "添加流程编号为【" + userFormNo + "】,附件名称为【" + name
              + "】的文件附件信息！");
        } else {
          log.put("operate", "我的待办：添加附件");
          log.put("loginfo", "添加流程编号为【" + userFormNo + "】,附件名称为【" + name
              + "】的附件信息！");
        }
        this.getLogService().saveLog(log);
        String ids = row + "";
        HashMap<String, Object> idmap = (HashMap<String, Object>) query.query(
            "SELECT max(id) from ess_form_appendix", new MapHandler());
        long id = Long.valueOf(idmap.get("max(id)") + "");
        for (int i = 1; i <= (id - row) * 1; i++) {
          ids += "," + (row + i);
        }
        return ids;
      }
      return "false";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  private String checkIfNull(Object obj, String value) {
    if (obj != null) {
      return obj.toString();
    }
    return value;
  }

  private int chineseLength(String value) {
    int valueLength = 0;
    String chinese = "[\u0391-\uFFE5]";
    /* 获取字段值的长度，如果含中文字符，则每个中文字符长度为2，否则为1 */
    for (int i = 0; i < value.length(); i++) {
      /* 获取一个字符 */
      String temp = value.substring(i, i + 1);
      /* 判断是否为中文字符 */
      if (temp.matches(chinese)) {
        /* 中文字符长度为2 */
        valueLength += 2;
      } else {
        /* 其他字符长度为1 */
        valueLength += 1;
      }
    }
    return valueLength;
  }

  private boolean deleteAppendixByFlowId(long wfId, String type) {
    String sql = "delete from ess_form_appendix where wf_id=? ";
    if (!"".equals(type)) {
      sql += " and type='" + type + "'";
    }
    try {
      int row = query.update(sql, wfId);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public String deleteAttachFileData(Map<String, Object> params) {
    @SuppressWarnings("unchecked")
    List<String> ids = (List<String>) params.get("ids");
    String type = params.get("type") + "";
    String userFormNo = params.get("userFormNo") + "";
    String sql = "delete from ess_form_appendix where id=? ";
    String strIds = "";
    try {
      Object[][] obj = new Object[ids.size()][];
      for (int i = 0; i < obj.length; i++) {
        obj[i] = new Object[] { ids.get(i) };
        strIds += ids.get(i) + ",";
      }
      strIds = strIds.substring(0, strIds.length() - 1);
      int[] cnt = query.batch(sql, obj);
      if (cnt == null || cnt.length == 0) {
        if (type.equals("data")) {
          return "删除数据附件失败！";
        } else if (type.equals("file")) {
          return "删除文件附件失败！";
        } else {
          return "删除附件失败！";
        }
      }
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", params.get("ip"));
      log.put("userid", params.get("userId"));
      log.put("module", "我的待办");
      if (type.equals("data")) {
        log.put("operate", "我的待办：删除数据附件");
        log.put("loginfo", "删除流程编号为【" + userFormNo + "】,附件标识为【" + strIds
            + "】的数据附件信息！");
      } else if (type.equals("file")) {
        log.put("operate", "我的待办：删除文件附件");
        log.put("loginfo", "删除流程编号为【" + userFormNo + "】,附件标识为【" + strIds
            + "】的文件附件信息！");
      } else {
        log.put("operate", "我的待办：删除附件");
        log.put("loginfo", "删除流程编号为【" + userFormNo + "】,附件标识为【" + strIds
            + "】的附件信息！");
      }
      this.getLogService().saveLog(log);
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除附件失败！";
    }
  }

  private long deleteCollaborativeByUFids(String[] userformids) {
    String sql = "delete from ess_collaborativemanage where userformid=? ";
    try {
      Object[][] obj = new Object[userformids.length][];
      for (int i = 0; i < userformids.length; i++) {
        obj[i] = new Object[] { userformids[i] };
      }
      int[] row = query.batch(sql, obj);
      if (row == null) {
        return 0;
      }
      return row.length;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  @Override
  public boolean deleteDealedWFData(long userFormId, String owner, String stepId) {
    String sql = "delete from ess_collaborativemanage where userformid=? and owner=? ";
    if (stepId != null || !"".equals(stepId)) {
      sql += " and stepid=" + stepId;
    }
    try {
      int row = query.update(sql, new Object[] { userFormId, owner });
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean deleteNoticeByFlowId(long wfId) {
    String sql = "delete from ess_transfernotice where wf_id=? ";
    try {
      int row = query.update(sql, wfId);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean deleteOpinionByFlowId(long wfId) {
    String sql = "delete from ess_transferform_opinion where wf_id=? ";
    try {
      int row = query.update(sql, wfId);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private long deleteUserFormByIds(String[] ids) {
    String sql = "delete from ess_transferform_user where id=? ";
    try {
      Object[][] obj = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        obj[i] = new Object[] { ids[i] };
      }
      int[] row = query.batch(sql, obj);
      if (row == null) {
        return 0;
      }
      return row.length;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  @Override
  public Map<String, String> deleteUserformData(Map<String, Object> params) {
    Map<String, String> json = new HashMap<String, String>();
    String data = params.get("data").toString();
    String userFormNo = params.get("userFormNo").toString();
    String title = params.get("title").toString();
    String start_time = params.get("start_time").toString();
    String wfState = params.get("wfState").toString();
    // 删除待发、已发数据，只能删除自己发起的且已完成的流程数据
    StringBuffer loginfo = new StringBuffer();
    String[] id_userId = data.split(",");
    String ids = "";
    int flowCount = 0;
    int noSelfCount = 0;
    int dataLen = "".equals(data) ? 0 : id_userId.length;
    for (int i = 0; i < dataLen; i++) {
      String[] arr = id_userId[i].split(":");
      String id = arr[0];
      String userId = arr[1];
      UserEntry ue = this.getUserQueryService().getUserInfoById(userId);
      if (ue.getUserid().equals(params.get("userId").toString())) {
        if ("流转".equals(wfState.split(",")[i])) {
          flowCount++;
        } else {
          ids += "," + id;
          Map<String, Object> userForm = this.getUserformById(Long
              .parseLong(id));
          long wfId = Long.parseLong(this.checkIfNull(userForm.get("wf_id"),
              "-100"));
          this.deleteNoticeByFlowId(wfId);
          List<Map<String, Object>> opinion = this.getOpinionByWfId(wfId);
          for (Map<String, Object> op : opinion) {
            this.deleteOpinionAppendixByOpinionId(Long.parseLong(op.get("id")
                .toString()));
          }
          this.deleteAppendixByFlowId(wfId, "");
          this.deleteOpinionByFlowId(wfId);
          loginfo.append("【编号=" + userFormNo.split(",")[i] + "、标题="
              + title.split(",")[i] + "、发起日期=" + start_time.split(",")[i]
              + "、状态=" + wfState.split(",")[i] + "】,");
        }
      } else {
        noSelfCount++;
      }
    }
    ids = ids.length() > 0 ? ids.substring(1) : "";
    if (!"".equals(ids) && ids.length() > 0) {
      long row = this.deleteUserFormByIds(ids.split(","));
      if (row == ids.split(",").length) {
        this.deleteCollaborativeByUFids(ids.split(","));
        StringBuffer msg = new StringBuffer("删除成功");
        if (flowCount > 0) {
          msg.append(",其中：" + flowCount + "条正在流转");
        }
        if (noSelfCount > 0) {
          msg.append(",其中：" + noSelfCount + "条非自己发起");
        }
        json.put("msg", msg.toString());
        json.put("msgType", "1");
        json.put("success", "true");
      } else {
        json.put("msg", "删除失败");
        json.put("msgType", "2");
        json.put("success", "false");
      }
    } else {
      json.put("msg", "没有满足条件的删除数据");
      json.put("msgType", "3");
      json.put("success", "false");
    }
    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", params.get("remoteAddr"));
    log.put("userid", params.get("userId"));
    log.put("module", "我的待办");
    log.put("operate", "我的待办：删除待办数据");
    log.put("loginfo", "删除信息：" + loginfo.toString());
    this.getLogService().saveLog(log);
    return json;
  }

  private List<Map<String, Object>> getOpinionByWfId(long wfId) {
    String sql = "select * from ess_transferform_opinion where wf_id=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), wfId);
      if (list == null || list.size() == 0) {
        return new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean deleteOpinionAppendixByOpinionId(long opinionId) {
    String sql = "delete from ess_opinion_appendix_relation where opinion_id=? ";
    try {
      int row = query.update(sql, opinionId);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private Map<String, Object> excuteQueryDealedWFData(int userId,
      String userName, String stageIds, String start, String limit,
      String parent, String child, String state, String condition) {
    List<Map<String, String>> formList = new ArrayList<Map<String, String>>();
    long allDateListSize = this.getCollaborativeDealedCountByPage(userId,
        userName, stageIds, parent, child, state, condition);
    if (allDateListSize > 0) {
      List<Map<String, Object>> allQueryDealdeWFList = this
          .getCollaborativeDealedListByPage(userId, userName, stageIds, start,
              limit, parent, child, state, condition);
      for (Map<String, Object> wfMap : allQueryDealdeWFList) {
        Map<String, String> map = new HashMap<String, String>();
        @SuppressWarnings("unchecked")
        Map<String, Object> ofe = (Map<String, Object>) wfMap
            .get("osUserFormEntity");
        Long stepId = (Long) wfMap.get("stepId");
        map.put(
            "open",
            String
                .format(
                    "<a href=\"#\" onclick=\"prepareDealFormBuilderBottomGridPanelShowForm_Event();\" title=\"打开\"><img src=\"./img/view.gif\" align=\"middle\" /></a>",
                    "", "", ""));
        map.put(
            "userFormNo",
            (Long.parseLong(ofe.get("wf_id").toString()) > 0 || Long
                .parseLong(ofe.get("wf_id").toString()) == -10) ? ofe.get(
                "user_formno").toString() : " -- ");
        map.put("id", ofe.get("id").toString());
        map.put("userId", ofe.get("user_id").toString());// 流程发起人的用户ID
        map.put("formId", ofe.get("form_id").toString());
        map.put("wfId", ofe.get("wf_id").toString());
        String startTime = this.checkIfNull(ofe.get("start_time"), "");
        map.put("title", ofe.get("title") + "");
        map.put("start_time", startTime);
        map.put("wf_status", this.checkIfNull(ofe.get("wf_status"), ""));
        if ("0".equals(state)) {
          String s = "flow".equals(ofe.get("wf_status").toString()) ? "流转"
              : ("over".equals(ofe.get("wf_status").toString()) ? "完成"
                  : ("kill".equals(ofe.get("wf_status").toString()) ? "终止"
                      : "人为结束"));
          map.put("wfState", s);
        } else {
          map.put("wfState", stepId.longValue() == 10000 ? "知会" : "待办");// 知会 待办
        }
        map.put("stepId", stepId.toString());
        map.put("workFlowType", ofe.get("workflowtype").toString());
        map.put("isDealed", "false");
        map.put("isSelf", ofe.get("user_id").equals(userId + "") ? "1" : "0");// 添加isSelf（当前步的处理人是不是自己）
        map.put("isLast", "0");
        long flowId = this.getFlowIdByWfId(Long.parseLong(ofe.get("wf_id")
            .toString()));
        map.put("flowId", flowId + "");
        map.put("processTime", "true");
        if (Long.parseLong(ofe.get("form_id").toString().substring(5)) != -10) {
          if (flowId != 0) {
            Map<String, Object> owm = this.getTransferFlowService()
                .getModelInit(flowId);
            String wfFirstStepId = this.checkIfNull(owm.get("first_step_id"),
                "");
            map.put("firstStepId", wfFirstStepId);
          } else {
            map.put("firstStepId", "");
          }
        } else {
          map.put("firstStepId", "");
        }
        Object obj_dataId = ofe.get("dataId");
        if (obj_dataId != null && !"".equals(obj_dataId.toString())) {
          map.put("dataId", obj_dataId.toString());
          Map<String, Object> stage = this.getStageIdByDocId(Long
              .parseLong(obj_dataId.toString()));
          map.put("stageId", stage.get("id") + "");
          map.put("dataNo",
              this.getDocFileCount(Long.parseLong(obj_dataId.toString())) + "");
        } else {
          map.put("dataId", "");
          map.put("stageId", "0");
          map.put("dataNo", "0");
        }
        if (ofe.get("caller") != null
            && !"".equals(ofe.get("caller").toString())) {
          UserEntry callerUser = getUserQueryService().getUserInfo(
              this.getServiceId(), this.getToken(),
              ofe.get("caller").toString(), null);
          if (callerUser != null) {
            map.put("caller", callerUser.getDisplayName());
          } else {
            map.put("caller", "丢失");
          }
        } else {
          map.put("caller", "");
        }
        // year 和month 为首页我的待办显示
        String showTime = map.get("start_time");
        map.put("year", showTime.split("-")[0]);
        map.put("month", showTime.split("-")[1]);
        map.put("displayName", ofe.get("title").toString());
        formList.add(map);
      }
    }
    Map<String, Object> returnMap = new HashMap<String, Object>();
    returnMap.put("size", allDateListSize);
    returnMap.put("formList", formList);
    return returnMap;
  }

  @SuppressWarnings("unused")
  private String getProcessTime(long flowId, long stepId, long wfId) {
    String sql = "select step_id,process_time from ess_transferaction where flow_id=? and step_id<? ORDER BY step_id DESC LIMIT 0,1 ";
    String sql_his = "select TIMESTAMPDIFF(HOUR,START_DATE,CURRENT_DATE()) as h from os_historystep where ENTRY_ID=? and STEP_ID=? ";
    try {
      Map<String, Object> step = query.query(sql, new MapHandler(), flowId,
          stepId);
      if (step != null) {
        String hisStepId = step.get("step_id").toString();
        String processTime = step.get("process_time").toString();
        Long h = query.query(sql_his, new ScalarHandler<Long>(), wfId,
            hisStepId);
        if (h != null && h < Long.parseLong(processTime)) {
          return "true";
        }
      }
      return "false";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  private long getDocFileCount(long pid) {
    String sql = "select count(id) as cnt from ess_document_file where pid=? ";
    try {
      long cnt = query.query(sql, new ScalarHandler<Long>(), pid);
      if (cnt > 0) {
        return cnt;
      }
      return 0;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  @Override
  public String getDocFiles(long pid) {
    String sql = "select esfileid from ess_document_file where pid=? ";
    try {
      List<String> list = query
          .query(sql, new ColumnListHandler<String>(), pid);
      String fileIds = "";
      for (String fileId : list) {
        fileIds += "," + fileId;
      }
      return fileIds.length() > 0 ? fileIds.substring(1) : "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
  }

  private Map<String, Object> excuteQuerySaveWFData(String userId,
      String stageIds, String start, String limit, String parent, String child,
      String state, UserEntry user, String condition) {
    List<Map<String, String>> formList = new ArrayList<Map<String, String>>();
    long allDateListSize = this.getSaveWFDataCountByPage(userId, stageIds,
        parent, child, state, condition);
    if (allDateListSize > 0) {
      List<Map<String, Object>> allQuerySavedWFList = this
          .getSaveWFDataListByPage(userId, stageIds, start, limit, parent,
              child, state, condition);
      for (Map<String, Object> ofe : allQuerySavedWFList) {
        HashMap<String, String> map = new HashMap<String, String>();
        map.put("wf_status", this.checkIfNull(ofe.get("wf_status"), ""));
        if (state.equals("0")) {
          map.put(
              "open",
              String
                  .format(
                      "<a href=\"#\" onclick=\"prepareFinishFormBuilderTopGridPanelShowForm_Event();\" title=\"打开\"><img src=\"./images/view.gif\" align=\"middle\" /></a>",
                      "", "", ""));
          map.put("wfState",
              "flow".equals(ofe.get("wf_status").toString()) ? "流转"// 流转
                  : ("over".equals(ofe.get("wf_status").toString()) ? "完成"
                      : ("kill".equals(ofe.get("wf_status").toString()) ? "终止"
                          : "人为结束")));// 完成
          map.put(
              "userFormNo",
              (Long.parseLong(ofe.get("wf_id").toString()) > 0 || Long
                  .parseLong(ofe.get("wf_id").toString()) == -10) ? ofe.get(
                  "user_formno").toString() : " -- ");// 编号
        } else {
          map.put(
              "open",
              String
                  .format(
                      "<a href=\"#\" onclick=\"prepareFinishFormBuilderBottomGridPanelShowForm_Event();\" title=\"打开\"><img src=\"./images/view.gif\" align=\"middle\" /></a>",
                      "", "", ""));
          map.put("wfState", null == ofe.get("wf_status") ? "待发" : null);// 待发
          map.put("userFormNo", ofe.get("user_formno").toString());// 编号
        }
        map.put("id", ofe.get("id").toString());
        map.put("userId", ofe.get("user_id").toString());
        long flowId = this.getFlowIdByWfId(Long.parseLong(ofe.get("wf_id")
            .toString()));
        map.put("flowId", flowId + "");
        map.put("formId", ofe.get("form_id").toString());
        map.put("wfId", ofe.get("wf_id").toString());
        String startTime = this.checkIfNull(ofe.get("start_time"), "");
        map.put("title", ofe.get("title") + "");
        map.put("start_time", startTime);
        Object obj_dataId = ofe.get("dataId");
        if (obj_dataId != null && !"".equals(obj_dataId.toString())) {
          map.put("dataId", obj_dataId.toString());
          Map<String, Object> stage = this.getStageIdByDocId(Long
              .parseLong(obj_dataId.toString()));
          map.put("stageId", stage.get("id") + "");
          map.put("dataNo",
              this.getDocFileCount(Long.parseLong(obj_dataId.toString())) + "");
        } else {
          map.put("dataId", "");
          map.put("stageId", "0");
          map.put("dataNo", "0");
        }
        map.put("isSelf",
            ofe.get("user_id").toString().equals(user.getId() + "") ? "1" : "0");// 添加isSelf（当前步的处理人是不是自己）
        map.put("isLast", "0");
        String showTime = map.get("start_time");
        map.put("year", showTime.split("-")[0]);
        map.put("month", showTime.split("-")[1]);
        map.put("displayName", ofe.get("title").toString());
        formList.add(map);
      }
    }
    Map<String, Object> returnMap = new HashMap<String, Object>();
    returnMap.put("size", allDateListSize);
    returnMap.put("formList", formList);
    return returnMap;
  }

  @SuppressWarnings("rawtypes")
  @Override
  public String getActions(Map<String, Object> map) {
    String userId = map.get("userId").toString();
    String wfId = map.get("wfId").toString();
    String flowId = map.get("flowId").toString();
    String stepId = map.get("stepId").toString();
    String isFrom = this.checkIfNull(map.get("isFrom"), "");
    /** 区分来自发起页面还是审批页面 **/
    Workflow wf = this.getTransferFlowService().getWorkflow(userId);
    Map<String, Object> flow = this.getTransferFlowService().getModelInit(
        Long.parseLong(flowId));
    WorkflowDescriptor wfDescriptor = wf.getWorkflowDescriptor(flow.get(
        "identifier").toString());
    StringBuffer buffer = new StringBuffer(400);
    if (null != wfDescriptor) {
      List actionDesc = wfDescriptor.getStep(Integer.parseInt(stepId))
          .getActions();
      actionDesc = this.sortActionDesc(actionDesc);
      Iterator it = actionDesc.iterator();
      int n = 0;
      String changeActionFun = "collaborativeHandle.checkAction";
      if (isFrom != null && "formApprovalPage".equals(isFrom)) {
        changeActionFun = "collaborativeHandle.checkActionForm";
      }
      while (it.hasNext()) {
        ActionDescriptor ad = (ActionDescriptor) it.next();
        if (ad.getId() > 200000 && !"".equals(wfId)) {
          long preStepId = this.getWfPreStepId(Long.parseLong(wfId),
              Integer.parseInt(stepId));
          ResultDescriptor unconditionalResult = ad.getUnconditionalResult();
          if (preStepId == unconditionalResult.getStep()) {
            buffer
                .append(
                    "<div><input name='actionRadioGroup' style='margin-top:10px;")
                .append((n == 0) ? "" : "margin-left:5px;")
                .append("' id='actionRadio").append(ad.getId())
                .append("' type='radio' ").append((n == 0) ? "checked" : "")
                .append(" onclick=\"" + changeActionFun + "('")
                .append(ad.getId()).append("','").append(ad.getName())
                .append("')\"/><label for='actionRadio").append(ad.getId())
                .append("'>").append(ad.getName()).append("</label></div>");
          }
        } else {
          buffer
              .append(
                  "<div><input name='actionRadioGroup' style='margin-top:10px;")
              .append((n == 0) ? "" : "margin-left:5px;")
              .append("' id='actionRadio").append(ad.getId())
              .append("' type='radio' ").append((n == 0) ? "checked" : "")
              .append(" onclick=\"" + changeActionFun + "('")
              .append(ad.getId()).append("','").append(ad.getName())
              .append("')\"/><label for='actionRadio").append(ad.getId())
              .append("'>").append(ad.getName()).append("</label></div>");
        }
        n++;
      }
    }
    return buffer.toString();
  }

  @Override
  public List<Map<String, Object>> getAppendixList(long wfId, long stepId,
      String type) {
    String sql = "select * from ess_form_appendix where wf_id=? ";
    if (type != null && !"".equals(type)) {
      sql += " and type='" + type + "'";// data-数据附件，file-文件附件
    }
    // if (stepId > 0) {
    // sql += " and wf_step_id=" + stepId;
    // }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { wfId });
      if (list == null || list.isEmpty()) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public long getCollaborativeDataCountByWFstatus(Map<String, Object> params) {
    String userId = params.get("userId").toString();// 当前登录用户ID
    String stageIds = this.checkIfNull(params.get("stageIds"), "");
    String parent = params.get("parent").toString();
    String wfstatus = this.checkIfNull(params.get("wfstatus"), "");// 流程状态--flow-流转，over-完成，kill-终止，-人为结束
    String condition = this.checkIfNull(params.get("condition"), "");
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    String userName = user.getUserid();

    String state = "0";
    if ("todo".equals(parent)) {
      // 待办
      state = "1";
      return this.getCollaborativeDealedCount(userName, stageIds, wfstatus,
          state, condition);
    } else if ("send".equals(parent)) {
      // 待发
      state = "1";
      return this.getSaveWFDataCount(user.getId() + "", stageIds, wfstatus,
          state, condition);
    } else if ("have_send".equals(parent)) {
      // 已发
      state = "0";
      return this.getSaveWFDataCount(user.getId() + "", stageIds, wfstatus,
          state, condition);
    } else if ("have_todo".equals(parent)) {
      // 已办
      state = "0";
      return this.getCollaborativeDealedCount(userName, stageIds, wfstatus,
          state, condition);
    }
    return 0;
  }

  @Override
  public Map<String, Object> getCollaborativeDataList(Map<String, Object> params) {
    String userId = params.get("userId").toString();// 当前登录用户ID
    String stageIds = params.get("stageIds").toString();
    String start = params.get("start").toString();
    String limit = params.get("limit").toString();
    String parent = params.get("parent").toString();// 大类：值有待办、待发、已发、已办4种
    String child = params.get("child").toString();// 小类： 有销毁、鉴定、借阅、编研、年报等情况
    String condition = this.checkIfNull(params.get("condition"), "");
    UserEntry user = this.getUserQueryService().getUserInfo(
        this.getServiceId(), this.getToken(), userId, null);
    String userName = user.getUserid();
    String state = "0";
    Map<String, Object> dataMap = new HashMap<String, Object>();

    if ("todo".equals(parent)) {
      // 待办
      state = "1";
      dataMap = this.excuteQueryDealedWFData(user.getId(), userName, stageIds,
          start, limit, parent, child, state, condition);
    } else if ("send".equals(parent)) {
      // 待发
      state = "1";
      dataMap = this.excuteQuerySaveWFData(user.getId() + "", stageIds, start,
          limit, parent, child, state, user, condition);
    } else if ("have_send".equals(parent)) {
      // 已发
      state = "0";
      dataMap = this.excuteQuerySaveWFData(user.getId() + "", stageIds, start,
          limit, parent, child, state, user, condition);
    } else if ("have_todo".equals(parent)) {
      // 已办
      state = "0";
      dataMap = this.excuteQueryDealedWFData(user.getId(), userName, stageIds,
          start, limit, parent, child, state, condition);
    }
    return dataMap;
  }

  private long getCollaborativeDealedCount(String userName, String stageIds,
      String wfstatus, String state, String condition) {
    String endTime = "";
    String startTime = "";
    try {
      String stateSQL = "";
      if (wfstatus != null && !wfstatus.equals("")) {
        stateSQL = " and userform.wf_status = '" + wfstatus + "'";
      }
      String sql = "SELECT count(*) datacount FROM ess_collaborativemanage relation left join ess_transferform_user userform  on userform.id = relation.userformid where state = '"
          + state + "'" + stateSQL;
      sql += " and owner = '" + userName + "'";
      if (null != startTime && !"".equals(startTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '" + startTime
            + "' ";
      }
      if (null != endTime && !"".equals(endTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '" + endTime
            + "' ";
      }
      if (stageIds != null && !"".equals(stageIds)) {
        sql += " and FIND_IN_SET(SUBSTR(userform.form_id,6),'" + stageIds
            + "')";
      }
      if (condition != null && !condition.equals("")) {
        sql += condition;
      }
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

  private long getCollaborativeDealedCountByPage(int userId, String userName,
      String stageIds, String parent, String child, String state,
      String condition) {
    String endTime = "";
    String startTime = "";
    try {
      String sql = "SELECT count(relation.id) datacount FROM ess_collaborativemanage relation left join ess_transferform_user userform  on userform.id = relation.userformid,os_historystep his  where his.id=(select MAX(id) from os_historystep where entry_id=userform.wf_id) and state = '"
          + state + "'";
      String roles = this.getRoleService().getRolesByUserId(userId);
      if (!"1".equals(roles)) {
        sql += " and relation.owner = '" + userName + "'";
      }
      if (condition != null && !condition.equals("")) {
        sql += " and " + condition;
      }
      if (null != startTime && !"".equals(startTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '" + startTime
            + "' ";
      }
      if (null != endTime && !"".equals(endTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '" + endTime
            + "' ";
      }
      if (stageIds != null && !"".equals(stageIds)) {
        sql += " and FIND_IN_SET(SUBSTR(userform.form_id,6),'" + stageIds
            + "')";
      }
      Long cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
      return 0;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  private List<Map<String, Object>> getCollaborativeDealedListByPage(
      int userId, String userName, String stageIds, String start, String limit,
      String parent, String child, String state, String condition) {
    String endTime = "";
    String startTime = "";
    try {
      String roles = this.getRoleService().getRolesByUserId(userId);
      String sql = "SELECT userform.*,relation.*,his.caller,his.action_id as 'hisActionId' FROM ess_collaborativemanage relation left join ess_transferform_user userform on userform.id = relation.userformid,os_historystep his  where state = "
          + state;
      sql += " and his.id=(select MAX(id) from os_historystep where entry_id=userform.wf_id) ";
      // 包含1 说明具有admin角色的权限 查询所有
      if (!"1".equals(roles)) {
        sql += " and relation.owner = '" + userName + "'";
      }
      if (condition != null && !condition.equals("")) {
        sql += " and " + condition;
      }

      if (null != startTime && !"".equals(startTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '" + startTime
            + "' ";
      }
      if (null != endTime && !"".equals(endTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '" + endTime
            + "' ";
      }
      if (stageIds != null && !"".equals(stageIds)) {
        sql += " and FIND_IN_SET(SUBSTR(userform.form_id,6),'" + stageIds
            + "')";
      }
      if (state.equals("0")) {
        sql += " order by audit_time desc";
      } else {
        sql += " order by start_time desc";
      }
      sql += " limit " + start + "," + limit;
      List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
      list = query.query(sql, new MapListHandler());
      List<Map<String, Object>> newList = new ArrayList<Map<String, Object>>();
      for (Map<String, Object> map : list) {
        long stepId = Long.parseLong(map.get("stepid").toString());
        map.put("osUserFormEntity", map);
        map.put("stepId", stepId);
        map.put("statisticsstatus",
            this.checkIfNull(map.get("statistic_status"), "false"));
        newList.add(map);
      }
      return newList;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, String> getCollaborativeMsgByWfId(long wfId, String state,
      String userId) {
    Map<String, String> map = new HashMap<String, String>();
    Map<String, Object> ofe = this.getCollaborativeDealedByWfId(wfId, state,
        userId);
    if (ofe == null || ofe.isEmpty()) {
      return map;
    }
    Long stepId = (Long) ofe.get("stepId");
    map.put("userFormNo",
        (Long.parseLong(ofe.get("wf_id").toString()) > 0 || Long.parseLong(ofe
            .get("wf_id").toString()) == -10) ? ofe.get("user_formno")
            .toString() : " -- ");
    map.put("id", ofe.get("id").toString());
    map.put("userId", ofe.get("user_id").toString());// 流程发起人的用户ID
    map.put("formId", ofe.get("form_id").toString());
    map.put("wfId", ofe.get("wf_id").toString());
    String startTime = this.checkIfNull(ofe.get("start_time"), "");
    map.put("title", ofe.get("title") + "_" + startTime);
    map.put("start_time", startTime);
    if ("0".equals(state)) {
      String s = "flow".equals(ofe.get("wf_status").toString()) ? "流转"
          : ("over".equals(ofe.get("wf_status").toString()) ? "完成" : ("kill"
              .equals(ofe.get("wf_status").toString()) ? "终止" : "人为结束"));
      map.put("wfState", s);
    } else {
      map.put("wfState", stepId.longValue() == 10000 ? "知会" : "待办");// 知会 待办
    }
    map.put("stepId", stepId.toString());
    map.put("workFlowType", ofe.get("workflowtype").toString());
    map.put("isDealed", "false");
    map.put("isSelf", ofe.get("user_id").equals(userId + "") ? "1" : "0");// 添加isSelf（当前步的处理人是不是自己）
    map.put("isLast", "0");
    if (Long.parseLong(ofe.get("form_id").toString().substring(5)) != -10) {
      long flowId = this.getFlowIdByWfId(Long.parseLong(ofe.get("wf_id")
          .toString()));
      if (flowId != 0) {
        map.put("flowId", flowId + "");
        map.put("processTime", "true");
        Map<String, Object> owm = this.getTransferFlowService().getModelInit(
            flowId);
        String wfFirstStepId = owm.get("first_step_id").toString();
        map.put("firstStepId", wfFirstStepId);
      } else {
        map.put("firstStepId", "");
      }
    } else {
      map.put("firstStepId", "");
    }
    map.put("dataId", ofe.get("dataId") + "");
    if (ofe.get("caller") != null && !"".equals(ofe.get("caller").toString())) {
      UserEntry callerUser = getUserQueryService().getUserInfo(
          this.getServiceId(), this.getToken(), ofe.get("caller").toString(),
          null);
      map.put("caller", callerUser.getDisplayName());
    } else {
      map.put("caller", "");
    }
    return map;
  }

  private Map<String, Object> getCollaborativeDealedByWfId(long wfId,
      String state, String userName) {
    String endTime = "";
    String startTime = "";
    try {
      String sql = "SELECT userform.*,relation.*,his.caller FROM ess_collaborativemanage relation left join ess_transferform_user userform on userform.id = relation.userformid,os_historystep his  where state = "
          + state + " and wf_id=" + wfId;
      sql += " and his.id=(select MAX(id) from os_historystep where entry_id=userform.wf_id) ";
      sql += " and relation.owner = '" + userName + "'";
      if (null != startTime && !"".equals(startTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '" + startTime
            + "' ";
      }
      if (null != endTime && !"".equals(endTime)) {
        sql += " and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '" + endTime
            + "' ";
      }
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler());
      if (map != null) {
        long stepId = map.get("stepid") == null ? 0l : Long.parseLong(map.get(
            "stepid").toString());
        map.put("stepId", stepId);
        map.put("statisticsstatus",
            this.checkIfNull(map.get("statistic_status"), "false"));
      } else {
        map = new HashMap<String, Object>();
      }
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getCollaborativeForm(
      Map<String, Object> params) {
    String flowId = this.checkIfNull(params.get("flowId"), "");
    String stepId = this.checkIfNull(params.get("stepId"), "");
    String dataId = params.get("dataId").toString();

    Map<String, Object> stage = this.getStageIdByDocId(Long.parseLong(dataId));
    if (stage.isEmpty()) {
      return new ArrayList<Map<String, Object>>();
    }
    String parentIds = this.getFilingService().getParentStageIds(
        Long.parseLong(stage.get("id").toString()));

    List<Map<String, Object>> metadataList = this.getFilingService()
        .findMoveCols(2, parentIds);
    String edit_field = "";
    if (!"".equals(flowId) && !"".equals(stepId)) {
      Map<String, Object> step = this.getTransferFlowService().getStepUser(
          Long.parseLong(flowId), Long.parseLong(stepId));
      if (step != null) {
        edit_field = this.checkIfNull(step.get("edit_field"), "");
      }
    }
    List<Map<String, Object>> documents = this.getFilingService()
        .findDocumentById(1, 1, stage.get("id").toString(), dataId);
    Map<String, Object> document = documents.get(0);

    List<Map<String, Object>> formList = new ArrayList<Map<String, Object>>();
    for (int i = 0; i < metadataList.size(); i++) {
      Map<String, Object> metaMap = metadataList.get(i);
      String code = metaMap.get("code").toString();
      metaMap.put("new_value", this.checkIfNull(document.get(code), ""));
      String[] edit_fields = edit_field.split(",");
      boolean flag = false;
      for (int j = 0; j < edit_fields.length; j++) {
        if (edit_fields[j].equals(code)) {
          metaMap.put("is_edit", "1");
          flag = true;
          j = edit_fields.length;
        }
      }
      if (!flag) {
        metaMap.put("is_edit", "0");
      }
      formList.add(metaMap);
    }
    return formList;
  }

  @Override
  public List<Map<String, Object>> getCurrentByWfId(long wfId) {
    String sql = "select * from os_currentstep where ENTRY_ID=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { wfId });
      if (list == null || list.isEmpty()) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private IFilingService getFilingService() {
    if (this.filingService == null) {
      this.filingService = this.getService(IFilingService.class);
    }
    return this.filingService;
  }

  private int getFlowIdByWfId(long wfId) {
    String sql = "select flow.id from ess_transferflow flow LEFT JOIN os_wfentry wf ON flow.identifier=wf.`NAME` where wf.ID=? ";
    try {
      Integer id = query.query(sql, new ScalarHandler<Integer>(),
          new Object[] { wfId });
      if (id != null) {
        return Integer.parseInt(id.toString());
      }
      return -1;
    } catch (SQLException e) {
      e.printStackTrace();
      return -1;
    }
  }

  private ILogService getLogService() {
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

  private List<Map<String, Object>> getOwners(long wfId, long stepId) {
    String sql = "select cm.* from ess_transferform_user uf LEFT JOIN ess_collaborativemanage cm ON uf.id=cm.userformid WHERE stepId="
        + stepId;
    if (wfId > 0) {
      sql += " and wf_id=" + wfId;
    }
    sql += " group by cm.owner ";
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

  private IParticipatoryService getParticipatoryService() {
    if (participatoryService == null) {
      participatoryService = this.getService(IParticipatoryService.class);
    }
    return participatoryService;
  }

  private IReportService getReportService() {
    if (reportService == null) {
      reportService = this.getService(IReportService.class);
    }
    return reportService;
  }

  private IRoleService getRoleService() {
    if (roleService == null) {
      roleService = this.getService(IRoleService.class);
    }
    return roleService;
  }

  private long getSaveWFDataCount(String userName, String stageIds,
      String wfstatus, String state, String condition) {
    String startedTime = "";
    String endedTime = "";
    try {
      StringBuffer sql = new StringBuffer();
      sql.append("SELECT count(*) datacount FROM ess_transferform_user where 1 = 1");
      if ("0".equals(state)) {
        sql.append(" and wf_status IS NOT NULL ");
        String stateSQL = "";
        if (wfstatus != null && !wfstatus.equals("")) {
          stateSQL = " and wf_status = '" + wfstatus + "'";
          sql.append(stateSQL);
        }
      } else
        sql.append(" and wf_status IS NULL ");
      sql.append(" and ( 1=2 ");
      sql.append(" or user_id = " + userName);
      sql.append(" )");
      if (null != startedTime && !"".equals(startedTime)) {
        sql.append(" and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '"
            + startedTime + "' ");
      }
      if (null != endedTime && !"".equals(endedTime)) {
        sql.append(" and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '"
            + endedTime + "' ");
      }
      if (stageIds != null && !"".equals(stageIds)) {
        sql.append(" and FIND_IN_SET(SUBSTR(form_id,6),'" + stageIds + "')");
      }
      if (condition != null && !condition.equals("")) {
        sql.append(condition);
      }
      Long cnt = query.query(sql.toString(), new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
      return 0;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  private long getSaveWFDataCountByPage(String userId, String stageIds,
      String parent, String child, String state, String condition) {
    String startedTime = "";
    String endedTime = "";
    try {
      StringBuffer sql = new StringBuffer();
      sql.append("SELECT count(*) datacount FROM ess_transferform_user where 1 = 1");
      if (condition != null && !condition.equals("")) {
        sql.append(condition);
      }
      if ("0".equals(state))
        sql.append(" and wf_status IS NOT NULL ");
      else
        sql.append(" and wf_status IS NULL ");
      sql.append(" and ( 1=1 ");
      if (!"1".equals(userId)) {
        sql.append(" and user_id = " + userId);
      }
      sql.append(" )");
      if (null != startedTime && !"".equals(startedTime)) {
        sql.append(" and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '"
            + startedTime + "' ");
      }
      if (null != endedTime && !"".equals(endedTime)) {
        sql.append(" and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '"
            + endedTime + "' ");
      }
      if (stageIds != null && !"".equals(stageIds)) {
        sql.append(" and FIND_IN_SET(SUBSTR(form_id,6),'" + stageIds + "')");
      }
      Long cnt = query.query(sql.toString(), new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
      return 0;
    } catch (Exception e) {
      e.printStackTrace();
      return 0;
    }
  }

  private List<Map<String, Object>> getSaveWFDataListByPage(String userId,
      String stageIds, String start, String limit, String parent, String child,
      String state, String condition) {
    String startedTime = "";
    String endedTime = "";
    try {
      StringBuffer sql = new StringBuffer();
      sql.append("SELECT * FROM ess_transferform_user userform where 1 = 1");
      if ("0".equals(state))
        sql.append(" and wf_status IS NOT NULL ");
      else
        sql.append(" and wf_status IS NULL ");
      sql.append(" and ( 1=1 ");
      if (!"1".equals(userId)) {
        sql.append(" and user_id = " + userId);
      }
      sql.append(" )");
      if (null != startedTime && !"".equals(startedTime)) {
        sql.append(" and to_char(start_time,'yyyy-MM-dd hh:mi:ss') > '"
            + startedTime + "' ");
      }
      if (null != endedTime && !"".equals(endedTime)) {
        sql.append(" and to_char(start_time,'yyyy-MM-dd hh:mi:ss') < '"
            + endedTime + "' ");
      }
      if (stageIds != null && !"".equals(stageIds)) {
        sql.append(" and FIND_IN_SET(SUBSTR(form_id,6),'" + stageIds + "')");
      }
      if (condition != null && !condition.equals("")) {
        sql.append(condition);
      }
      sql.append(" order by start_time desc");
      sql.append(" limit ").append(start).append(",").append(limit);
      List<Map<String, Object>> list = null;
      list = query.query(sql.toString(), new MapListHandler());
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
  public Map<String, Object> getStageIdByDocId(long id) {
    String sql = "select stage.* from ess_document_stage stage LEFT JOIN ess_document doc ON stage.`code`=doc.stageCode where doc.id=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), new Object[] { id });
      if (map == null || map.isEmpty()) {
        map = new HashMap<String, Object>();
      }
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
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

  @SuppressWarnings({ "unchecked", "rawtypes" })
  @Override
  public Map<String, Object> getStepOwner(Map<String, Object> params) {
    Map<String, Object> json = new HashMap<String, Object>();
    // 获取页面传递过来的参数
    String flowId = params.get("flowId").toString();
    String wfId = params.get("wfId").toString();
    String actionId = params.get("actionId").toString();
    String formId = params.get("formId").toString();
    String stepId = params.get("stepId").toString();
    String jsFormId = this.checkIfNull(params.get("jsFormId"), "");
    String userId = params.get("userId").toString();
    String dataId = params.get("dataId").toString();
    String formUserId = params.get("formUserId").toString();
    Map<String, Object> flow = this.getTransferFlowService().getModelInit(
        Long.parseLong(flowId));
    Map<String, Object> transferform = this.getTranferFormByFlowId(flowId);
    formId = transferform.get("form_id").toString();
    // 返回流程类型
    json.put("relationBusiness", flow.get("business_relation"));
    json.put("firstStepId", flow.get("first_step_id").toString());

    Workflow wf = this.getTransferFlowService().getWorkflow(userId);
    String caller = "";
    if (null != wfId && !"".equals(wfId) && !"-1".equals(wfId)) {
      caller = wf.getPropertySet(Long.parseLong(wfId)).getString("caller");
    }
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    UserEntry callerUser = null;
    if (!"".equals(caller)) {
      callerUser = getUserQueryService().getUserInfo(this.getServiceId(),
          this.getToken(), caller, null);
    } else {
      callerUser = user;
    }
    if (this.getTransferFlowService().nextStepIsLastStep(flow, actionId)) {
      json.put("success", true);
      json.put("isLastStep", true);
      json.put("isRealHasNextOwner", true);// 用于标示在过滤掉禁用的用户后，是否有下一步处理人
    } else {
      Map formmap = new HashMap<String, String>();
      String htmlformvalue = this.checkIfNull(params.get("htmlformvalue"), "");
      if (null != htmlformvalue && !"".equals(htmlformvalue.trim())) {
        String[] fieldandvalues = htmlformvalue.split("&,&");
        for (String ones : fieldandvalues) {
          String one[] = ones.split("&:&");
          if (one.length > 1) {
            formmap.put(one[0], one[1]);
          } else {
            formmap.put(one[0], "");
          }
        }
      } else {
        Map<String, Object> stage = this.getStageIdByDocId(Long
            .parseLong(dataId));
        String stageIds = this.getFilingService().getParentStageIds(
            Long.parseLong(stage.get("id").toString()));
        List<Map<String, Object>> list = this.getFilingService().findMoveCols(
            2, stageIds);
        for (Map<String, Object> ofe : list) {
          String code = ofe.get("code").toString();
          String value = params.get(code).toString();
          if (null == value)
            value = "";
          formmap.put(code, value);
        }
      }
      /** 判断当前动作是不是发布时自动创建的回退动作 **/
      Pair<Boolean, List<Map<String, Object>>> stepData = new Pair<Boolean, List<Map<String, Object>>>();
      int tempActionId = Integer.parseInt(actionId);
      if (tempActionId > 100000 && tempActionId < 200000) {
        json.put("isFirstStep", true);
        json.put("isRealHasNextOwner", true);
        json.put("wfModelId", flowId);
        json.put("success", true);
        json.put("isValidateForm", 1);
        json.put("actionId", actionId);
        json.put("formId", formId);
        json.put("wfId", wfId);
        json.put("stepId", stepId);
        json.put("jsFormId", jsFormId);
        json.put("id", formUserId);
        return json;
      } else if (tempActionId > 200000) {
        json.put("isReturnPreStep", true);
        json.put("isRealHasNextOwner", true);
        json.put("wfModelId", flowId);
        json.put("success", true);
        json.put("isValidateForm", 1);
        json.put("actionId", actionId);
        json.put("formId", formId);
        json.put("wfId", wfId);
        json.put("stepId", stepId);
        json.put("jsFormId", jsFormId);
        json.put("id", formUserId);
        return json;
      } else {
        stepData = this.getTransferFlowService().getNextStepFromGraphXML(flow,
            actionId);
      }
      boolean nextStepIsSplit = stepData.left;
      List<Map<String, Object>> listStep = stepData.right;
      StringBuffer ownerSb = new StringBuffer(500);
      Map map = null; // 满足分支条件后跳转到的stepID
      boolean findNextStep = false; // 进行分支条件校验后是否有满足的stepID ， 默认为没有
      if (nextStepIsSplit) {
        map = this.getValidatedStep(flow.get("form_relation").toString(), wfId,
            formmap, Long.parseLong(flowId), user, listStep, actionId, dataId);
      }

      if (null != listStep && !listStep.isEmpty()) {
        @SuppressWarnings("unused")
        int index = 0;
        boolean isHasNextOwner = false;
        for (Map<String, Object> stepEntity : listStep) {
          boolean nextStepOwnerCheck = true;
          boolean isShow = true;
          if (nextStepIsSplit
              && map != null
              && stepEntity.get("step_id").toString()
                  .equals(map.get("stepID").toString())) {
            isShow = false;
            findNextStep = true;
          } else if (!nextStepIsSplit) {
            isShow = false;
            findNextStep = true;
          }
          if (nextStepIsSplit
              && map != null
              && !stepEntity.get("step_id").toString()
                  .equals(map.get("stepID").toString())) {
            continue;
          }
          StringBuffer splitSetBuffer = new StringBuffer();
          String title = stepEntity.get("name").toString();
          if (nextStepIsSplit) {
            title = title + "-分支";
          } else {
            // 判断是不是第一步
            if (stepEntity.get("step_id").equals(flow.get("first_step_id"))) {
              isHasNextOwner = true;
              json.put("isFirstStep", true);
              break;
            }
          }
          String roles = stepEntity.get("next_step_roles").toString();
          String users = stepEntity.get("next_step_users").toString();
          Integer isRelation = Integer.parseInt(stepEntity.get(
              "is_relationpart").toString());
          Integer isRelationByCaller = Integer.parseInt(stepEntity.get(
              "is_relationcaller").toString());
          boolean rolecheck = false;
          if (null != roles && !roles.equals("")) {
            String[] roleArray = roles.split(",");
            for (int i = 0; i < roleArray.length; i++) {
              List<UserEntry> userlist = null;
              if (null != isRelationByCaller
                  && isRelationByCaller.intValue() == 1) {
                userlist = this.getUsers(roleArray[i], callerUser,
                    isRelationByCaller);
              } else {
                userlist = this.getUsers(roleArray[i], user, isRelation);
              }
              if (!userlist.isEmpty())
                rolecheck = true;
              if (!isShow && userlist.size() > 1)
                nextStepOwnerCheck = false;
            }
          }
          if (rolecheck == false && (users == null || "".equals(users)))
            continue;

          // splitSetBuffer
          // .append("<input id='allStepUser_"
          // + stepEntity.get("step_id")
          // +
          // "_all' type='checkbox' required='true' onclick=\"collaborativeHandle.autoCheckAllChild('allStepUser_"
          // + stepEntity.get("step_id") + "')\")/>");
          // splitSetBuffer.append("<label for='allStepUser_"
          // + stepEntity.get("step_id") + "_all'>全选</label>");
          //
          // splitSetBuffer
          // .append("<fieldset id='allStepUser_"
          // + stepEntity.get("step_id")
          // +
          // "' style='width:100%;border:solid 1px #99BCE8;padding:5px;position:relative;visibility:"
          // + (isShow ? "hidden" : "visible") + "'>");
          // splitSetBuffer.append("<legend style='font-size:12px;'>" + title
          // + "</legend>");
          if (null != roles && !roles.equals("")) {
            String[] roleArray = roles.split(",");
            for (int i = 0; i < roleArray.length; i++) {
              StringBuffer fieldSetBuffer = new StringBuffer();
              // if (!nextStepOwnerCheck) {
              // fieldSetBuffer
              // .append("<input id='selectNextOwner_FieldSet_Id"
              // + index
              // + "_"
              // + i
              // +
              // "_all' type='checkbox' required='true' onclick=\"collaborativeHandle.autoCheckAllChild('selectNextOwner_FieldSet_Id"
              // + index + "_" + i + "')\")/>");
              // fieldSetBuffer.append("<label for='selectNextOwner_FieldSet_Id"
              // + index + "_" + i + "_all'>全选</label>");
              // }
              //
              // fieldSetBuffer
              // .append("<fieldset id='selectNextOwner_FieldSet_Id"
              // + index
              // + "_"
              // + i
              // +
              // "' style='width:97%;border:solid 1px #99BCE8;position:relative;padding:5px;'>");
              // Role role =
              // this.getRoleService().getRoleByRoleId(roleArray[i]);
              // fieldSetBuffer.append("<legend style='font-size:12px;'>"
              // + role.getRoleName() + "</legend>");

              List<UserEntry> userlist = null;
              if (null != isRelationByCaller
                  && isRelationByCaller.intValue() == 1) {
                userlist = this.getUsers(roleArray[i], callerUser,
                    isRelationByCaller);
              } else {
                userlist = this.getUsers(roleArray[i], user, isRelation);
              }
              if (!userlist.isEmpty()) {
                boolean isTrue = false;
                // /// 角色处理人：
                for (UserEntry u : userlist) {
                  // 对用户是否启用进行判断
                  if (u.getUserStatus() == 0) {
                    continue;
                  }
                  isTrue = true;
                  if (!isShow) {
                    isHasNextOwner = true;
                  }// xiaoxiong 20111008 添加是否显示判断，所过不显示，下一步处理人还是没有
                  String name = u.getDisplayName();
                  /** 调整下一步处理人布局 **/
                  String showName = this.getPartNameByUser(u);
                  fieldSetBuffer.append("<input id='" + u.getUserid()
                      + "' name='" + userId + "' title='" + name + "' value='"
                      + u.getId() + "' text='" + showName + "' stepId='"
                      + stepEntity.get("step_id")
                      + "' width='60' type='checkbox' "
                      + (nextStepOwnerCheck ? "checked" : "")
                      + " required='true' />");
                  /*** 审批人过多时界面不美观，给label加一个宽度属性， ***/
                  fieldSetBuffer.append("<label for='" + u.getUserid()
                      + "' title='" + name + "'>" + showName + "</label>");
                }
                // fieldSetBuffer.append("</fieldset>");
                if (isTrue) {
                  splitSetBuffer.append(fieldSetBuffer);
                }
              }
            }
            // //其它处理人：
            StringBuffer fieldSetBuffer = new StringBuffer();
            if (null != users && !users.equals("")) {

              // if (!nextStepOwnerCheck) {
              // fieldSetBuffer
              // .append("<input id='selectNextOwner_FieldSet_otherUser_Id"
              // + index
              // +
              // "_all' type='checkbox' required='true' onclick=\"collaborativeHandle.autoCheckAllChild('selectNextOwner_FieldSet_otherUser_Id"
              // + index + "')\"/>");
              // fieldSetBuffer
              // .append("<label for='selectNextOwner_FieldSet_otherUser_Id"
              // + index + "_all'>全选</label>");
              // }
              //
              // fieldSetBuffer
              // .append("<fieldset id='selectNextOwner_FieldSet_otherUser_Id"
              // + index
              // +
              // "' style='width:97%;border:solid 1px #99BCE8;position:relative;padding:5px;' >");
              // fieldSetBuffer
              // .append("<legend style='font-size:12px;'>其它处理单位部门</legend>");

              String[] ids = users.split(",");
              if (!isShow && ids.length > 1)
                nextStepOwnerCheck = false;
              for (int i = 0; i < ids.length; i++) {
                UserEntry u = getUserQueryService().getUserInfoById(ids[i]);
                // 对用户是否启用进行判断
                if (u.getUserStatus() == 0) {
                  continue;
                }
                if (!isShow) {
                  isHasNextOwner = true;
                }// 添加是否显示判断，所过不显示，下一步处理人还是没有
                String name = u.getDisplayName();
                String showName = this.getPartNameByUser(u);
                fieldSetBuffer.append("<input id=" + u.getUserid() + " name='"
                    + userId + "' title='" + name + "' value='" + u.getId()
                    + "' text='" + showName + "' stepId='"
                    + stepEntity.get("step_id")
                    + "' width='60' type='checkbox' "
                    + (nextStepOwnerCheck ? "checked" : "")
                    + " required='true' />");
                fieldSetBuffer.append("<label for='" + u.getUserid()
                    + "' title='" + name + "'>" + showName + "</label>");
              }
              // fieldSetBuffer.append("</fieldset>");
              splitSetBuffer.append(fieldSetBuffer);
            }
          } else if (null != users && !users.equals("")) {
            StringBuffer fieldSetBuffer = new StringBuffer();

            // if (!nextStepOwnerCheck) {
            //
            // fieldSetBuffer
            // .append("<input id='selectNextOwner_FieldSet_otherUser_Id_all' type='checkbox' required='true' onclick=\"collaborativeHandle.autoCheckAllChild('selectNextOwner_FieldSet_otherUser_Id')\"/>");
            // fieldSetBuffer
            // .append("<label for='selectNextOwner_FieldSet_otherUser_Id_all'>全选</label>");
            // }
            //
            // fieldSetBuffer
            // .append("<fieldset id='selectNextOwner_FieldSet_otherUser_Id' style='width:97%;border:solid 1px #99BCE8;position:relative;padding:5px;' >");
            // fieldSetBuffer
            // .append("<legend style='font-size:12px;'>其它处理单位部门</legend>");

            String[] ids = users.split(",");
            if (!isShow && ids.length > 1)
              nextStepOwnerCheck = false;
            for (int i = 0; i < ids.length; i++) {
              UserEntry u = getUserQueryService().getUserByUserName(ids[i]);
              if (u.getUserStatus() == 0) {
                continue;
              }
              if (!isShow) {
                isHasNextOwner = true;
              }// 添加是否显示判断，所过不显示，下一步处理人还是没有
              String name = u.getDisplayName();
              String showName = this.getPartNameByUser(u);
              fieldSetBuffer.append("<input id='" + u.getUserid() + "' name='"
                  + userId + "' title='" + name + "' value='" + u.getId()
                  + "' text='" + showName + "' stepId='"
                  + stepEntity.get("step_id") + "' width='60' type='checkbox' "
                  + (nextStepOwnerCheck ? "checked" : "")
                  + " required='true' />");
              /** 审批人过多时界面不美观，给label加一个宽度属性 ***/
              fieldSetBuffer.append("<label for='" + u.getUserid()
                  + "' title='" + name + "'>" + showName + "</label>");

            }
            // fieldSetBuffer.append("</fieldset>");
            splitSetBuffer.append(fieldSetBuffer);
          } else {
          }
          // splitSetBuffer.append("</fieldset>");
          ownerSb.append(splitSetBuffer.toString());
          index++;
        }

        if (!findNextStep) {
          ownerSb
              .append("<h1 color=\"red\" style=\"line-height:100px;\" align=\"center\">没有找到下一步处理单位部门，请联系系统管理员！</h1>");// 没有找到下一步处理单位部门，请联系系统管理员！
        }
        json.put("isRealHasNextOwner", isHasNextOwner);
        json.put("wfModelId", flowId);
        json.put("nextStepOwner", ownerSb.toString());

        // 还要考虑不验证表单的情况，因此这边需要返回true
        json.put("success", true);
      } else {
        json.put("success", false);
      }
      json.put("isLastStep", false);
      json.put("findNextStep", findNextStep);
    }
    Map<String, Object> action = this.getTransferFlowService()
        .getOsWfActionByModelAndActionId(Long.parseLong(flowId),
            Long.parseLong(actionId));
    if (null != action) {
      String v_form = this.checkIfNull(action.get("is_validate_form"), "");
      json.put("isValidateForm",
          "".equals(v_form) ? 1 : Integer.parseInt(v_form));
    } else {
      json.put("isValidateForm", 1);
    }
    json.put("actionId", actionId);
    json.put("formId", formId);
    json.put("wfId", wfId);
    json.put("stepId", stepId);
    json.put("userId", userId);
    json.put("jsFormId", jsFormId);
    json.put("id", formUserId);
    return json;
  }

  private String getPartNameByUser(UserEntry u) {
    String showName = "";
    List<Participatory> lp = this.getParticipatoryService()
        .getParticipatoryByUserId(u.getUserid());
    if (lp.size() > 0 && lp != null) {
      showName = lp.get(0).getName();
      if ("".equals(showName)) {
        Map<String, Object> part = this.getParticipatoryService()
            .getPartByUserId(u.getId());
        if (part != null) {
          showName = part.get("name") + "";
        } else {
          showName = new String(u.getDisplayName());
        }
      }
    }
    if (chineseLength(showName) > 24)
      showName = showName.substring(0, 12) + "..";
    return showName;
  }

  private ITransferFlowService getTransferFlowService() {
    if (null == this.transferFlowService) {
      this.transferFlowService = this.getService(ITransferFlowService.class);
    }
    return this.transferFlowService;
  }

  @Override
  public Map<String, Object> getUserformById(long id) {
    String sql = "select * from ess_transferform_user where id=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), new Object[] { id });
      if (map == null || map.isEmpty()) {
        map = new HashMap<String, Object>();
      }
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getUserformByWfId(long wfId) {
    String sql = "select * from ess_transferform_user where wf_id=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), new Object[] { wfId });
      if (map == null || map.isEmpty()) {
        map = new HashMap<String, Object>();
      }
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }

  private List<UserEntry> getUsers(String roleId, UserEntry user,
      Integer isRelation) {
    Role role = this.getRoleService().getRoleByRoleId(roleId);
    List<UserEntry> userList = new ArrayList<UserEntry>();
    List<Map<String, Object>> users = this.getRoleService()
        .getUserListByRoleId(Long.parseLong(role.getId()));
    for (Map<String, Object> tempUser : users) {
      UserEntry ue = this.getUserQueryService().getUserInfoById(
          tempUser.get("userId").toString());
      if (ue.getUserStatus() == 0)
        continue;
      // 是否关联部门
      if (isRelation.intValue() == 1) {
        List<Participatory> part_1 = this.getParticipatoryService()
            .getParticipatoryByUserId(ue.getUserid());
        List<Participatory> part_2 = this.getParticipatoryService()
            .getParticipatoryByUserId(user.getUserid());
        if (part_1.size() > 0 && part_2.size() > 0) {
          String code_1 = part_1.get(0).getCode();
          String code_2 = part_2.get(0).getCode();
          if (code_1.equals(code_2)) {
            userList.add(ue);
          }
        }

      } else {
        userList.add(ue);
      }
    }
    return userList;
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  private Map getValidatedStep(String formId, String wfID,
      Map<String, String> formvalue, Long modelID, UserEntry user,
      List<Map<String, Object>> listStep, String firstActionId, String dataId) {
    Map map = new HashMap();
    Map<String, Object> wf = this.getTransferFlowService()
        .getModelInit(modelID);
    List<Map<String, Object>> actions = this.getTransferFlowService()
        .validateSplitActionIsFrom(wf, firstActionId);
    for (Map<String, Object> oneAction : actions) {
      String splitCondtion = oneAction.get("condition").toString();
      if (null != splitCondtion && !"".equals(splitCondtion)) {
        this.SplitValidator(splitCondtion, formId, wfID, formvalue, user,
            dataId);
        if (true) {
          Long actionID = Long.parseLong(oneAction.get("action_id").toString());
          Integer currStepID = null;
          try {
            Pair<Boolean, List<Map<String, Object>>> stepData = this
                .getTransferFlowService().getNextStepFromGraphXML(wf,
                    String.valueOf(actionID));
            List<Map<String, Object>> stepList = stepData.right;
            currStepID = Integer.parseInt(stepList.get(0).get("step_id")
                .toString());
          } catch (Exception e) {
            continue;
          }
          for (Map<String, Object> stepEntity : listStep) {
            if (String.valueOf(currStepID).equals(
                stepEntity.get("step_id").toString())) {
              Pair<Boolean, List<Map<String, Object>>> stepData = this
                  .getTransferFlowService().getNextStepFromGraphXML(wf,
                      String.valueOf(actionID));
              List<Map<String, Object>> stepList = stepData.right;
              Integer tempStepID = Integer.parseInt(stepList.get(0)
                  .get("step_id").toString());
              map.put("stepID", tempStepID);
              return map;
            }
          }
        }
      }
    }
    return null;
  }

  private long getWfPreStepId(long wfId, long stepId) {
    String sql = "select step_id from os_historystep where ENTRY_ID = " + wfId
        + " AND step_id != " + stepId + " ORDER BY ID DESC";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list != null && list.size() > 0) {
        return Long.parseLong(list.get(0).get("step_id").toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return -1;
  }

  @Override
  public Map<String, Object> isApprovalOver(Map<String, Object> map) {
    Map<String, Object> json = new HashMap<String, Object>();
    String wfId = map.get("wfId").toString();
    String stepId = map.get("stepId").toString();
    String userId = map.get("userId").toString();
    EssMessage message = getMessageWS().getEssMessageByUserNameAndWorkFlowId(
        userId, Long.parseLong(wfId), Long.parseLong(stepId));
    if (null != message) {
      if (message.getWorkFlowStatus().equalsIgnoreCase("Run")
          || message.getWorkFlowStatus().equalsIgnoreCase("empty")) {
        json.put("state", "flow");
      } else {
        json.put("state", "over");
      }
    } else {
      json.put("state", "flow");
    }
    return json;
  }

  @Override
  public Map<String, Object> showWfGraph(Map<String, Object> params) {
    Map<String, Object> returnMap = new HashMap<String, Object>();

    String flowId = params.get("flowId").toString();
    String wfId = params.get("wfId").toString();
    String userId = params.get("userId").toString();
    UserEntry user = getUserQueryService().getUserInfo(this.getServiceId(),
        this.getToken(), userId, null);
    Map<String, Object> flow = this.getTransferFlowService().getModelInit(
        Long.parseLong(flowId));
    String value = flow.get("flowGraph").toString();
    returnMap.put("mxGraphHtml", value);
    returnMap.put("wfHisStep", null);
    String currentStepId = "";
    if (null != wfId && !wfId.equals("") && !wfId.equals("undefined")) {// 添加undefined判断
      List<Map<String, Object>> listStep = this.getCurrentByWfId(Long
          .parseLong(wfId));
      if (listStep.size() > 0 && !listStep.isEmpty()) {
        currentStepId = listStep.get(0).get("STEP_ID").toString();
      }
      List<Map<String, Object>> listHisStep = this.getHistoryStep(
          Long.parseLong(wfId), currentStepId);
      List<Map<String, Object>> wfHisStep = new ArrayList<Map<String, Object>>();
      for (Map<String, Object> map : listHisStep) {
        Map<String, String> hisMap = this.getOperateStep(flowId, wfId,
            map.get("STEP_ID").toString(), "his");
        Map<String, Object> hisStep = new HashMap<String, Object>();
        String owner = hisMap.get("stepOwer");
        String hisOwner = map.get("OWNER") + "";
        if ("".equals(owner) || owner == null) {
          // 发起人
          if (!"".equals(hisOwner)) {
            UserEntry ue = this.getUserQueryService().getUserByUserName(
                hisOwner);
            owner = ue.getEmpName();
          } else {
            continue;
          }
        }
        hisStep.put("wfHisStep", hisMap.get("step"));
        hisStep.put("wfHisStepOwer", owner);
        wfHisStep.add(hisStep);
      }
      returnMap.put("wfHisStep", wfHisStep);
      /** edit 增加是否待发流程判断，如果是待发流程，不做高亮处理 **/
      if (params.get("status") == null
          || "".equals(params.get("status").toString())) {
      } else {
        Workflow wf = this.getTransferFlowService().getWorkflow(
            user.getUserid());
        @SuppressWarnings("rawtypes")
        List currentSteps = wf.getCurrentSteps(Long.parseLong(wfId));
        if (null == currentSteps || currentSteps.isEmpty()) {
          // 修改流程图展现
          String lastStepId = this.getTransferFlowService().getWfLastStepId(
              wfId, " action_id = -1");
          if (!"".equals(lastStepId)) {
            returnMap.put("wfStep", "3");
            String status = params.get("status").toString();
            if (status == null || "".equals(status)) {
              Map<String, Object> oufe = this.getUserformByWfId(Long
                  .parseLong(wfId));
              status = oufe.get("wf_status").toString();
            }
            if (status.equals("kill")) {
              status = "已终止";// 已终止
            } else if (status.equals("complete")) {
              status = "人为结束";
            } else {
              status = "未知";// 未知
            }
            returnMap.put("wfStepOwer", status);
            return returnMap;
          } else {
            returnMap.put("wfStep", "3");
            returnMap.put("wfStepOwer", "流程已经结束!");
            return returnMap;
          }
        }
      }
    }
    Map<String, String> currentMap = this.getOperateStep(flowId, wfId,
        currentStepId, "current");
    returnMap.put("wfStep", currentMap.get("step"));
    returnMap.put("wfStepOwer", currentMap.get("stepOwer"));
    if ("".equals(currentMap.get("stepOwer"))) {
      String sponsor = user.getDisplayName();// 发起人
      returnMap.put("wfStepOwer", "sponsor:" + sponsor);
    }

    return returnMap;
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  private List sortActionDesc(List actionDescList) {
    List list = new ArrayList();
    if (null == actionDescList)
      return actionDescList;
    for (Object obj : actionDescList) {
      ActionDescriptor ad = (ActionDescriptor) obj;
      if ("同意".equals(ad.getName())) {
        list.add(ad);
        break;
      }
    }
    for (Object obj : actionDescList) {
      ActionDescriptor ad = (ActionDescriptor) obj;
      if ("回退".equals(ad.getName())) {
        list.add(ad);
        break;
      }
    }
    for (Object obj : actionDescList) {
      ActionDescriptor ad = (ActionDescriptor) obj;
      if ("不同意".equals(ad.getName())) {
        list.add(ad);
        break;
      }
    }
    for (Object obj : actionDescList) {
      ActionDescriptor ad = (ActionDescriptor) obj;
      if (!"同意".equals(ad.getName()) && !"不同意".equals(ad.getName())
          && !"回退".equals(ad.getName())) {
        list.add(ad);
      }
    }
    return list;
  }

  private boolean SplitValidator(String splitCondtion, String formId,
      String wfId, Map<String, String> formValue, UserEntry user, String dataId) {
    try {
      if (null != splitCondtion && !"".equals(splitCondtion)) {
        boolean rightBool = false;// 表单条件
        boolean leftBool = false;// 机构、角色条件
        String[] strs = splitCondtion.split("&&&");
        if (strs.length > 1) {
          if (formValue != null) {
            String rightCondition = strs[1];
            List<HashMap<String, String>> listMap = this
                .getTransferFlowService().parseCondition(rightCondition);
            StringBuffer cond = new StringBuffer("");
            for (HashMap<String, String> m : listMap) {
              String arg0 = m.get("arg0"); // 左括号
              String arg1 = m.get("arg1");// field
              String arg2 = m.get("arg2");// compare
              String arg3 = m.get("arg3");// value
              String arg4 = m.get("arg4");// 右括号
              String arg5 = m.get("arg5");// and/or
              if (null != arg0 && arg0.indexOf("(") != -1)
                cond.append(arg0);
              Map<String, String> thisValue = formValue;
              String tempValue = thisValue.get(arg1);
              /************** xiaoxiong 20111101 end ****************/
              if (null == tempValue) {
                rightBool = false;
              } else {
                /**
                 * chenjian 20130329 add 分支条件校验修改
                 * 如果捕获到异常了，作为字符串的方式去比较，如果正常则按数字去比较 modify
                 * 捕获到异常后,不满足条件时将rightBool值重置
                 */
                if (arg2.equals("=")) {
                  try {
                    if (Double.parseDouble(tempValue) == Double
                        .parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (tempValue.compareTo(arg3) == 0) {
                      rightBool = true;
                    } else {
                      /** jiangyuntao 20130712 edit 修改逻辑错误 **/
                      rightBool = false;
                    }
                  }
                  // rightBool=tempValue.equals(arg3);
                } else if (arg2.equals("!=")) {
                  try {

                    if (Double.parseDouble(tempValue) != Double
                        .parseDouble(arg3)) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (tempValue.compareTo(arg3) != 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }
                  // rightBool=!tempValue.equals(arg3);
                } else if (arg2.equals(">")) {
                  try {
                    if (Double.parseDouble(tempValue) > Double
                        .parseDouble(arg3)) {// xiaoxiong 20100723 edit 修改分支问题
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (tempValue.compareTo(arg3) > 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                } else if (arg2.equals("<")) {
                  try {
                    if (Double.parseDouble(tempValue) < Double
                        .parseDouble(arg3)) {// xiaoxiong 20100723 edit 修改分支问题
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (tempValue.compareTo(arg3) < 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                } else if (arg2.equals("like")) {
                  rightBool = tempValue.contains(arg3);
                } else if (arg2.equals("notLike")) {
                  rightBool = !tempValue.contains(arg3);
                } else if (arg2.equals(">=")) {
                  try {
                    if (Double.parseDouble(tempValue) >= Double
                        .parseDouble(arg3)) {// xiaoxiong 20100723 edit 修改分支问题
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (tempValue.compareTo(arg3) >= 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                } else if (arg2.equals("<=")) {
                  try {
                    if (Double.parseDouble(tempValue) <= Double
                        .parseDouble(arg3)) {// xiaoxiong 20100723 edit 修改分支问题
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  } catch (NumberFormatException n) {
                    if (tempValue.compareTo(arg3) <= 0) {
                      rightBool = true;
                    } else {
                      rightBool = false;
                    }
                  }

                }
              }

              cond.append(rightBool);
              if (null != arg4 && arg4.indexOf(")") != -1)
                cond.append(arg4);
              if (arg5 != null)
                cond.append(arg5);

            }

            rightBool = this.getTransferFlowService().pbk(cond.toString());
          } else {
            rightBool = false;
          }
        }
        if (strs.length > 0 && strs[0].length() > 1) { // 修该当分支条件只设置左边时
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
                .getTransferFlowService().parseCondition(leftCondition);
            StringBuffer buffer = new StringBuffer("");
            for (HashMap<String, String> m : listMap) {
              String arg0 = m.get("arg0"); // 左括号
              String arg1 = m.get("arg1");// field
              String arg2 = m.get("arg2");// compare
              String arg3 = m.get("arg3");// value
              String arg4 = m.get("arg4");// 右括号
              String arg5 = m.get("arg5");// and/or
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
                  // jiangyuntao add 增加不等于判断
                  if ("!=".equals(arg2)) {
                    buffer.append("false");
                  } else {
                    buffer.append("true");
                  }
                } else {
                  // jiangyuntao add 增加不等于判断
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
            leftBool = this.getTransferFlowService().pbk(buffer.toString());
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

  @Override
  public Map<String, Object> wfIsApprovaled(Map<String, String> map) {
    Map<String, Object> json = new HashMap<String, Object>();
    String flowId = map.get("flowId");
    String wfId = map.get("wfId");
    String stepId = map.get("stepId");
    String userId = map.get("userId");
    EssMessage message = getMessageWS().getEssMessageByUserNameAndWorkFlowId(
        userId, Long.parseLong(wfId), Long.parseLong(stepId));
    if (null != message) {
      if ("".equals(flowId) || flowId == null) {
        flowId = this.getFlowIdByWfId(Long.parseLong(wfId)) + "";
      }
      Map<String, Object> owm = this.getTransferFlowService().getModelInit(
          Long.parseLong(flowId));
      json.put("firstStepId", owm.get("first_step_id") + "");
      json.put("state", "flow");
    } else {
      json.put("state", "over");
    }
    return json;
  }

  @Override
  public Map<String, Object> workFlowPrint(Map<String, Object> dataMap) {
    Map<String, Object> json = new HashMap<String, Object>();
    String wfId = dataMap.get("wfId").toString();
    String formId = dataMap.get("formId").toString(); // 工作流表单ID
    String stepId = dataMap.get("stepId").toString();// 工作流中的步骤
    String printForm = dataMap.get("printForm").toString();// 组装的打印需要的值
    String userFormNo = dataMap.get("userFormNo").toString(); // 表单编号
    String userId = dataMap.get("userId").toString();
    String reportsIds = null;
    // 处理异常情况
    if (null != wfId && !"".equals(wfId) && null != stepId
        && !"".equals(stepId)) {
      Map<String, Object> step = this.getTransferFlowService().getStepUser(
          Long.parseLong(wfId), Long.parseLong(stepId));
      if (!step.isEmpty() && step != null) {
        reportsIds = step.get("edit_field_print").toString();
      }
    }
    // 判断如果此步骤没有设置打印报表则提示
    if (null == reportsIds || "".equals(reportsIds.trim())) {
      Map<String, Object> jsonIds = new HashMap<String, Object>();
      jsonIds.put("success", false);
      jsonIds.put("exportUrl", "");
      jsonIds.put("message", "您没有可打印的报表");
      return jsonIds;
    }
    try {
      printForm = URLDecoder.decode(printForm, "utf-8");
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    Map<String, Object> form = this.getTransferFlowService()
        .getFormById(formId);
    Map<String, String> paramMap = new HashMap<String, String>();
    paramMap.put("userId", userId);
    paramMap.put("reportsIds", reportsIds);
    paramMap.put("printForm", printForm);
    paramMap.put("userFormNo", userFormNo);
    paramMap.put("reportTitle", "打印表单：" + form.get("name") + "(" + userFormNo
        + ")");
    @SuppressWarnings("unused")
    String urlid = this.getReportService().getWorkflowReportUrl(paramMap);
    json.put("success", true);
    json.put("exportUrl", "success");
    json.put("message", "打印成功，请到消息管理下载！");
    return json;
  }

  private Map<String, String> getOperateStep(String flowId, String wfId,
      String stepId, String type) {
    Map<String, String> returnMap = new HashMap<String, String>();
    if (null != stepId && !stepId.equals("undefined") && !stepId.equals("")) {
      Map<String, Object> step = this.getTransferFlowService().getStepUser(
          Long.parseLong(flowId), Long.parseLong(stepId));
      if (null != step && !step.isEmpty()) {
        StringBuffer sb = new StringBuffer("");
        if (null != flowId && null != stepId) {
          List<Map<String, Object>> owners = this.getOwners(
              Long.parseLong(wfId), Long.parseLong(stepId));
          if (null != owners && !owners.isEmpty()) {
            for (Map<String, Object> owner : owners) {
              UserEntry recevierUser = getUserQueryService().getUserInfo(
                  this.getServiceId(), this.getToken(),
                  owner.get("owner") + "", null);
              if ("current".equals(type)) {
                if (recevierUser != null) {
                  sb.append(recevierUser.getDisplayName()).append(
                      "-o-" + owner.get("state") + ",");
                } else {
                  sb.append(owner.get("owner")).append(
                      "-o-" + owner.get("state") + ",");
                }
              } else {
                if (recevierUser != null) {
                  sb.append(recevierUser.getDisplayName()).append(",");
                } else {
                  sb.append(owner.get("owner")).append(",");
                }
              }
            }
          }
        }
        returnMap.put("stepOwer", sb.toString());
        returnMap.put("step", stepId);
      } else {
        returnMap.put("step", "0");
        returnMap.put("stepOwer", "");
      }
    } else {
      returnMap.put("step", "0");
      returnMap.put("stepOwer", "");
    }
    return returnMap;
  }

  private List<Map<String, Object>> getHistoryStep(long wfId, String stepId) {
    String sql = "select * from os_historystep where ENTRY_ID=? and ACTION_ID!=-1 and OWNER is not null ";
    if (!"".equals(stepId)) {
      sql += " and STEP_ID!=" + stepId;
    }
    sql += " group by STEP_ID ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), wfId);
      if (list.size() > 0 && !list.isEmpty()) {
        return list;
      }
      return new ArrayList<Map<String, Object>>();
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getOpinionList(long wfId) {
    String sql = "select eo.*,RIGHT(eo.time,22) as 'createTime',TRIM(REPLACE(eo.time,RIGHT(eo.time,22),'')) as 'title' from ess_transferform_opinion as eo  WHERE eo.wf_id=? ORDER BY RIGHT(eo.time,22) ASC ";
    String sql_appendix = "select ea.fileName,ea.dataId from ess_opinion_appendix_relation as er LEFT JOIN ess_form_appendix as ea ON er.appendix_id=ea.id AND ea.type='opinion' WHERE er.opinion_id=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), wfId);
      if (list == null || list.size() == 0) {
        list = new ArrayList<Map<String, Object>>();
      } else {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : list) {
          UserEntry ue = this.getUserQueryService().getUserByUserName(
              map.get("user_name") + "");
          if (ue != null) {
            map.put("userName", ue.getEmpName());
          } else {
            map.put("userName", map.get("user_name"));
          }
          List<Map<String, Object>> appendixList = query.query(sql_appendix,
              new MapListHandler(), map.get("id"));
          if (appendixList.size() > 0) {
            map.put("appendixList", appendixList);
          } else {
            map.put("appendixList", "");
          }
          int flowId = this.getFlowIdByWfId(wfId);
          long stepId = Long.parseLong(map.get("wf_step_id") + "");
          Map<String, Object> step = this.getTransferFlowService().getStepUser(
              flowId, stepId);
          if (step != null && !step.isEmpty()) {
            map.put("stepName", step.get("name"));
          } else {
            map.put("stepName", "");
          }
          returnList.add(map);
        }
        return returnList;
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String flowOutOfAuditTime() {
    String sql = "select ec.id,ec.owner,ec.stepid,et.id as 'flow_id',et.name as 'flow_name',ow.ID as 'wf_id',TIMESTAMPADD(HOUR,ta.process_time,ec.createtime) as 'out_time' from ess_collaborativemanage as ec "
        + "LEFT JOIN ess_transferform_user as tu ON ec.userformid=tu.id "
        + "LEFT JOIN os_wfentry as ow ON tu.wf_id=ow.ID "
        + "LEFT JOIN ess_transferflow as et ON ow.NAME=et.identifier "
        + "LEFT JOIN ess_transferaction as ta ON et.id=ta.flow_id AND ec.stepid=ta.step_id AND ta.process_time!=0 "
        + "WHERE ec.state='1' AND ec.emailOrMessage='0' AND NOW()-TIMESTAMPADD(HOUR,ta.process_time,ec.createtime)>0 ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list.size() > 0 && list != null) {
        for (Map<String, Object> map : list) {
          // 邮件发送
          String owner = map.get("owner") + "";
          UserEntry tempUser = this.getUserQueryService().getUserByUserName(
              owner);
          String email_message = "您好：" + tempUser.getDisplayName()
              + "，在文控系统里，你的流程名为【" + map.get("flow_name") + "】已越期（越期截止时间:"
              + map.get("out_time") + "），请及时登录文控系统处理。";
          String email_address = tempUser.getEmailAddress();
          if (email_address == null || "".equals(email_address)) {
            System.out.println(tempUser.getEmpName() + "没有输入邮箱地址，邮件发送失败！");
          } else {
            SimpleMailSender.sendEmail("流程待办处理越期", email_address,
                email_message, "text");
          }
          // 修改发送信息状态
          this.updateProcessTimeStatus(map.get("id") + "", map.get("stepid")
              + "", owner);
        }
        return "true";
      } else {
        return "true";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  private boolean updateProcessTimeStatus(String id, String stepid, String owner) {
    String sql = "UPDATE ess_collaborativemanage SET emailOrMessage='1' WHERE id=? and stepid=? and owner=? ";
    try {
      int row = query.update(sql, id, stepid, owner);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }
}
