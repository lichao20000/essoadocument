package cn.flying.rest.service.impl;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.admin.entity.AuditLog;
import cn.flying.rest.admin.restInterface.BaseLogService;
import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.ExportExcel;

/**
 * 日志管理
 * 
 * @author xie
 * 
 */
@Path("documentlog")
@Component
public class LogServiceImpl extends BasePlatformService implements ILogService {

  @Resource(name = "queryRunner")
  private QueryRunner query;

  private String instanceId;

  @Value("${app.InstanceId}")
  public void setInstanceId(String instanceId) {
    this.instanceId = instanceId;
  }

  public String getInstanceId() {
    return this.instanceId;
  }
  
  private MessageWS messageWS;
  public MessageWS getMessageWS() {
    if (messageWS == null) {
      this.messageWS = this.getService(MessageWS.class);
    }
    return messageWS;
  }
  private BaseLogService baseLogService;

  public BaseLogService getBaseLogService() {
    if (null == this.baseLogService) {
      this.baseLogService = this.getService(BaseLogService.class);
    }
    return this.baseLogService;
  }

  private UserQueryService userQueryService;

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }

  @Override
  public Boolean saveLog(Map<String, Object> map) {
    String userid = (String) map.get("userid");
    UserEntry user = this.getUserQueryService().findUserByUserid(
            this.getServiceId(), this.getToken(), userid, null);
    if (user == null || user.getDeptEntry() == null) {
        return false;
    }
    String orgname = user.getDeptEntry().getOrgName();
    HashMap<String, Object> log = new HashMap<String, Object>();
    log.put("address", map.get("ip"));//传递ip
    log.put("log_module", map.get("module"));//操作模块
    log.put("loginfo", map.get("loginfo"));//操作详细
    log.put("operate", map.get("operate"));//操作功能
    log.put("type", "3");//操作类型 1：login 2：access 3：operation(文控中只有这三种)对应日志查询类型
    log.put("organfullname", orgname);
    log.put("userid", user.getId());
    log.put("appId","4");//所有文控系统日志保存时 appId=4 默认
    log.put("username", user.getUserid());
    log.put("instanceId", this.getInstanceId());
    return getBaseLogService().saveAuditLog(log);
  }
  @Override
  public Boolean addLoginLog(Map<String, Object> map) {
    String userid = (String) map.get("userId");
    UserEntry user = this.getUserQueryService().findUserByUserid(
        this.getServiceId(), this.getToken(), userid, null);
    if (user == null || user.getDeptEntry() == null) {
      return false;
    }
    String orgname = user.getDeptEntry().getOrgName();
    HashMap<String, Object> log = new HashMap<String, Object>();
    log.put("address", map.get("ip"));//传递ip
    log.put("type", "1");//操作类型 1：login 2：access 3：operation(文控中只有这三种)对应日志查询类型
    log.put("organfullname", orgname);
    log.put("userid", user.getId());
    log.put("appId","4");//所有文控系统日志保存时 appId=4 默认
    log.put("username", user.getUserid());
    log.put("instanceId", this.getInstanceId());
    return getBaseLogService().saveAuditLog(log);
  }

  @Override
  public HashMap<String, String> getLogById(Long id) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Map<String, Object> getLogListByCondition(Map<String, Object> map1) {
    int start = Integer.valueOf((String) map1.get("start"));
    int limit = Integer.valueOf((String) map1.get("limit"));
    String type = (String) map1.get("type");
    String condition = null != map1.get("condition") ? (String) map1.get("condition") : null;

    int iType = 1;
    // 用户登录-1、功能访问-2、功能操作-3、任务调度-4、数据接口-5 ）
    if (type.equals("login")) {
      iType = 1;
    } else if (type.equals("access")) {
      iType = 2;
    } else if (type.equals("operation")) {
      iType = 3;
    } else if (type.equals("job")) {
      iType = 4;
    } else if (type.equals("native")) {
      iType = 5;
    }
    Map<String, Object> logMap = new HashMap<String, Object>();
    HashMap<String, Object> map2 = new HashMap<String, Object>();
    map2.put("start", (start - 1) * limit);
    map2.put("limit", limit);
    map2.put("keyWord", "");
    map2.put("sort", "log_date");
    map2.put("type", iType + "");
    map2.put("instanceId", this.getInstanceId());
   // if (iType != 1)
      map2.put("appId", "4");
    List<AuditLog> auditLogs = new ArrayList<AuditLog>();
    if (condition == null || condition.equals("")) {
      auditLogs = getBaseLogService().getAuditLogs(map2);
    } else {
      map2.put("condition", condition);
      auditLogs = getBaseLogService().getAuditLogByCondition(map2);
    }
    List<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();
    for (AuditLog log : auditLogs) {
      HashMap<String, String> map = new HashMap<String, String>();
      map.put("address", log.getAddress());
      map.put("appId", log.getAppId());
      map.put("id", log.getId());
      map.put("logdate", log.getLog_date());
      map.put("logtime", log.getLog_time());
      map.put("operatedetail", log.getLoginfo());
      map.put("module", log.getLog_module());
      map.put("orgname", !"null".equals(log.getOrganfullname()) ? log.getOrganfullname() : "");
      map.put("organpath", log.getOrganpath());
      map.put("type", log.getType());
      map.put("username", log.getUsername());
      map.put("instanceId", log.getInstanceId());
      map.put("operate", log.getOperate());
      list.add(map);
    }
    String count = getBaseLogService().getAuditLogCount(map2);
    logMap.put("total", count);
    logMap.put("list", list);
    return logMap;
  }


  @Override
  public String exportLogData(HashMap<String, Object> map) {
    String ids = (String) map.get("ids");
    List<AuditLog> alogs = new ArrayList<AuditLog>();
    StringBuffer buffer = new StringBuffer();
    if (null != ids && !ids.equals("")) {
      alogs = getBaseLogService().getAuditLogByIds(ids);
      buffer.append("id为【" + ids + "】的日志被导出,");
    } else {
      HashMap<String, String> map1 = new HashMap<String, String>();
      if (map.get("condition") != null && !map.get("condition").equals("")) {
        buffer.append("日志类型为【" + getTypeName(getLaterLogType((String) map.get("type"))) + "】,条件为【");
        String[] conNameArr = map.get("conName").toString().split("★■◆●");
        for (int i = 0; i < conNameArr.length; i++) {
          String con = conNameArr[i];
          if (!"".equals(con)) {
            String[] conArr = con.split("●◆■★");
            buffer.append("[" + conArr[0] + conArr[1] + conArr[2] + "]");
            if (conNameArr.length > 1) {
              buffer.append(conArr[3]);
            }
          }
        }
        buffer.append("】的日志被导出");
      } else {
        buffer
            .append("日志类型为【" + getTypeName(getLaterLogType((String) map.get("type"))) + "】的日志被导出");
      }
      int type =  getLaterLogType((String) map.get("type")) ;
     
      map1.put("start", "-1");
      map1.put("limit", "-1");
      map1.put("condition", (String) map.get("condition"));
      map1.put("type",type+"");
      map1.put("instanceId", this.getInstanceId());
      map1.put("appId", "4");
      alogs = getBaseLogService().getAuditLogByCondition(map1);
    }
    if (alogs == null || alogs.size() == 0) {
      return "nodata";
    }
    UserEntry user =
        this.getUserQueryService().findUserByUserid(this.getServiceId(), this.getToken(),
            (String) map.get("userid"), null);
    try {
      user.getId();
    } catch (NullPointerException ex) {
      return "nouser";
    }
    List<String> col = new ArrayList<String>();
    if (alogs != null || alogs.size() > 0) {
      String type = alogs.get(0).getType();
      // 默认 用户登录和任务调度字段输出值一致
      col.add("日志类型");
      col.add("登录日期");
      col.add("登录时间");
      col.add("登录用户");
      col.add("部门");
      col.add("IP地址");
      if ("2".equals(type)) {
        // 功能访问
        col.add("访问模块");
      } else if ("3".equals(type)) {
        // 功能操作
        col.add("操作模块");
        col.add("操作功能");
        col.add("操作明细");
      } else if ("4".equals(type)) {
        // 接口日志
      }
    }

    // xiewenda 20140917 添加导出数据判断 如果为null 则设置为字符串""；
    List<HashMap<String, String>> list = new ArrayList<HashMap<String, String>>();
    for (AuditLog log : alogs) {
      HashMap<String, String> map1 = new HashMap<String, String>();
      map1.put("登录日期", log.getLog_date());
      map1.put("登录时间", log.getLog_time());
      map1.put("登录用户", "null".equals(log.getUsername()) ? "" : log.getUsername());
      map1.put("部门", "null".equals(log.getOrganfullname()) ? "" : log.getOrganfullname());
      map1.put("IP地址", log.getAddress());
      map1.put("操作模块", "null".equals(log.getOperate()) ? "" : log.getOperate());
      map1.put("操作功能", "null".equals(log.getLog_module()) ? "" : log.getLog_module());
      map1.put("访问模块", "null".equals(log.getLog_module()) ? "" : log.getLog_module());
      map1.put("操作明细", "null".equals(log.getLoginfo()) ? "" : log.getLoginfo());
      map1.put("部门Path", "null".equals(log.getOrganpath()) ? "" : log.getOrganpath());
      map1.put("ID", log.getId());
      map1.put("日志类型", getTypeName(Integer.valueOf(log.getType())));
      list.add(map1);
    }
    String orgName = user.getDeptEntry().getOrgName();
    ExportExcel e = new ExportExcel();
    String fileName = e.exportExcelByListLog(list, col, "日志管理");
    buffer.append("导出的文件为：" + fileName);
    HashMap<String, Object> slog = new HashMap<String, Object>();
    slog.put("address", map.get("ip"));
    slog.put("organfullname",orgName);
    slog.put("organpath", "DEPT");
    slog.put("userid", user.getId());
    slog.put("appId", "4");
    slog.put("log_module", "日志管理");
    slog.put("operate", "日志管理：导出数据");
    slog.put("loginfo", buffer.toString());
    slog.put("username", user.getUserid());
    slog.put("type", 3);
    slog.put("instanceId", this.getInstanceId());
    getBaseLogService().saveAuditLog(slog);

    String ipString = getServiceIP();
    String fullFileName = ipString.substring(0, ipString.indexOf("/rest/")) + "/data/" + fileName;

    
      Map<String, String> messMap = new HashMap<String, String>();
      SimpleDateFormat dateFormat1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss") ;
      Date date = new Date();
      messMap.put("sender", user.getUserid());
      messMap.put("recevier",  user.getUserid());
      messMap.put("sendTime", dateFormat1.format(date));
      messMap.put("status", "No");
      messMap.put("workFlowId","-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("stepId", "0");
      messMap.put("content", fileName + "已导出完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler","$.messageFun.downFile('"+fullFileName+"')");
      messMap.put("handlerUrl","esdocument/"+this.getInstanceId()+"/x/ESMessage/handlerMsgPage");
      getMessageWS().addMessage(messMap);
    return fullFileName;
  }

  @Override
  public boolean saveAccessModel(HashMap<String, Object> map) {
    UserEntry user =
        this.getUserQueryService().findUserByUserid(this.getServiceId(), this.getToken(),
            (String) map.get("userid"), null);
    String orgName = user.getDeptEntry().getOrgName();
    HashMap<String, Object> log = new HashMap<String, Object>();
    log.put("address", map.get("ip"));
    log.put("log_module", map.get("model"));
    log.put("organfullname", orgName);
    log.put("organpath", "DEPT");
    log.put("userid", user.getId());
    log.put("appId", "4");
    log.put("username", user.getUserid());
    log.put("type", 2);
    log.put("instanceId", this.getInstanceId());
    try {
      getBaseLogService().saveAuditLog(log);
    } catch (Exception e) {
      return true;
    }
    return true;
  }

  @Override
  public boolean deleteLogData(HashMap<String, Object> map) {
    String ids = (String) map.get("ids");
    boolean flag = false;
    StringBuffer buffer = new StringBuffer();
    if (null != ids && !ids.equals("")) {
      flag = getBaseLogService().deleteAuditLogByIds(ids);
      buffer.append("id为【" + ids + "】的日志被删除！");
    } else {
      HashMap<String, String> map1 = new HashMap<String, String>();
      map1.put("condition", (String) map.get("condition"));
      map1.put("type", getLaterLogType((String) map.get("type")) + "");

      buffer.append("日志类型为【" + getTypeName(getLaterLogType((String) map.get("type"))) + "】,条件为【");
      String[] conNameArr = map.get("conName").toString().split("★■◆●");
      for (int i = 0; i < conNameArr.length; i++) {
        String con = conNameArr[i];
        if (!"".equals(con)) {
          String[] conArr = con.split("●◆■★");
          buffer.append("[" + conArr[0] + conArr[1] + conArr[2] + "]");
          if (conNameArr.length > 1) {
            buffer.append(conArr[3]);
          }
        }
      }
      buffer.append("】的日志被删除！");
      map1.put("instanceId", this.getInstanceId());
      map1.put("appId", "4");
      map1.put("type",getLaterLogType(map.get("type")+"")+"");
      flag = getBaseLogService().deleteAuditLogByCondition(map1);
    }
    UserEntry user =
        this.getUserQueryService().findUserByUserid(this.getServiceId(), this.getToken(),
            (String) map.get("userid"), null);
    String orgName =
        (user.getDeptEntry() != null && user.getDeptEntry().getOrgName() != null) ? user
            .getDeptEntry().getOrgName() : "";
    HashMap<String, Object> log = new HashMap<String, Object>();
    log.put("address", map.get("ip"));
    log.put("organfullname", orgName);
    log.put("organpath", "DEPT");
    log.put("userid", user.getId());
    log.put("appId", "4");
    log.put("log_module", "日志管理");
    log.put("operate", "日志管理：删除数据");
    log.put("loginfo", buffer.toString());
    log.put("username", user.getUserid());
    log.put("type", 3);
    log.put("instanceId", this.getInstanceId());
    getBaseLogService().saveAuditLog(log);
    return flag;
  }

  @Override
  public String getStatisticData(Map<String, Object> map) {
    int type = getLaterLogType((String) map.get("type"));
    map.put("type", type+"");
    map.put("instanceId", this.getInstanceId());
    map.put("appId", "4");
    //添加日志
    UserEntry user =
        this.getUserQueryService().findUserByUserid(this.getServiceId(), this.getToken(),
            (String) map.get("userid"), null);
    String orgName =
        (user.getDeptEntry() != null && user.getDeptEntry().getOrgName() != null) ? user
            .getDeptEntry().getOrgName() : "";
            StringBuilder buffer= new StringBuilder();
            if (map.get("condition") != null && !map.get("condition").equals("")) {
            buffer.append("日志类型为【" + getTypeName(type) + "】,条件为【");
            String[] conNameArr = map.get("conName").toString().split("★■◆●");
            for (int i = 0; i < conNameArr.length; i++) {
              String con = conNameArr[i];
              if (!"".equals(con)) {
                String[] conArr = con.split("●◆■★");
                buffer.append("[" + conArr[0] + conArr[1] + conArr[2] + "]");
                if (conNameArr.length > 1) {
                  buffer.append(conArr[3]);
                }
              }
            }
            buffer.append("】的日志统计！"); 
         }else{
           buffer.append("日志类型为【" + getTypeName(type) + "】,条件为【");
           buffer.append(map.get("selectSaName")); 
           buffer.append("】的日志统计！"); 
         }
    HashMap<String, Object> log = new HashMap<String, Object>();
    log.put("address", map.get("ip"));
    log.put("organfullname", orgName);
    log.put("organpath", "DEPT");
    log.put("userid", user.getId());
    log.put("appId", "4");
    log.put("log_module", "日志管理");
    log.put("operate", "日志管理：日志统计");
    log.put("loginfo", buffer.toString());
    log.put("username", user.getUserid());
    log.put("type", 3);
    log.put("instanceId", this.getInstanceId());
    getBaseLogService().saveAuditLog(log);
    
    return getBaseLogService().getStatisticData(map);
  }

  private String getServiceIP() {
    // return "http://10.3.189.4:8080/escloud/rest/escloud_structureservice";
    return this.getNamingService().findApp(this.getInstanceId(), "participatory",
        this.getServiceId(), this.getToken());

  }

  private int getLaterLogType(String type) {
    int iType = 0;
    if ("login".equals(type)) {
      iType = 1;
    } else if ("access".equals(type)) {
      iType = 2;
    } else if ("operation".equals(type)) {
      iType = 3;
    } else if ("job".equals(type)) {
      iType = 4;
    } else if ("native".equals(type)) {
      iType = 5;
    }
    return iType;
  }

  private String getTypeName(int name) {
    if (name == 1) {
      return "用户登录";
    } else if (name == 2) {
      return "功能访问";
    } else if (name == 3) {
      return "功能操作";
    } else if (name == 4) {
      return "接口日志";
    } else if (name == 5) {
      return "任务调度";
    } else {
      return "";
    }
  }
}
