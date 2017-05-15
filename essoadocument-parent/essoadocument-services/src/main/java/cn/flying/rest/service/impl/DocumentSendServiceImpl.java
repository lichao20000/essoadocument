package cn.flying.rest.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ArrayHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.IDocumentSendService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.Condition;

/**
 * 文件发放模块
 * 
 * @author gengqianfeng
 * 
 */
@Path("documentSend")
@Component
public class DocumentSendServiceImpl extends BasePlatformService implements
    IDocumentSendService {

  @Resource(name = "queryRunner")
  private QueryRunner query;

  @Value("${app.InstanceId}")
  private String instanceId;

  private ILogService logService;

  private UserQueryService userQueryService;

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }
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
  private Map<String, Object> addChangeOrders(Map<String, Object> send) {
    String sql = "insert into ess_filechange_order(send_id,pId,file_id,part_code,receiveId,copies,code,creater,createtime,status) values('"
        + send.get("id")
        + "','"
        + send.get("pId")
        + "','"
        + send.get("file_id")
        + "',?,?,?,?,'"
        + send.get("creater") + "','" + send.get("createtime") + "','0') ";
    try {
      String[] row = send.get("matrix").toString().split(";");
      Object[][] obj = new Object[row.length][4];
      //String no = this.getChangeOrderNo("");
      for (int i = 0; i < row.length; i++) {
        String[] c = row[i].split(",");
        String type = c[2];
        if ("part".equals(type)) {
          obj[i][0] = c[0];
          obj[i][1] = null;
        } else {
          obj[i][0] = null;
          obj[i][1] = c[0];
        }
        obj[i][2] = c[1];
        //rongying 20150508 设计变更单接收的发放单编号暂时修改为发放单的编号一致
        /*if (i != 0) {
          no = this.getChangeOrderNo(no);
        }
        obj[i][3] = no;*/
        obj[i][3] = send.get("no");
      }
      List<Map<String, Object>> list = query.insertBatch(sql,
          new MapListHandler(), obj);
      if (list.size() == row.length) {
        return send;
      } else {
        return null;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @SuppressWarnings("deprecation")
  private String getChangeOrderNo(String noStr) {
    Date date = new java.util.Date();
    long year = date.getYear() + 1900;
    long month = date.getMonth() + 1;
    long day = date.getDate();
    String userformno = "";
    try {
      userformno = ("NO." + year + (month >= 10 ? month : ("0" + month)))
          + (day >= 10 ? day : ("0" + day)) + "-";
      String str = noStr;
      if ("".equals(noStr)) {
        String sql = "select code from ess_filechange_order where YEAR(NOW())=SUBSTR(createtime,1,4) ORDER BY code DESC limit 0,1";
        str = query.query(sql, new ScalarHandler<String>());
      }
      if (!StringUtils.isEmpty(str)) {
        long no = Long.parseLong(str.substring(str.length() - 6, str.length())) + 1;
        for (int i = 6; i > (no + "").length(); i--) {
          userformno = userformno + "0";
        }
        userformno = userformno + no;
      } else {
        userformno = userformno + "000001";
      }
      return userformno;
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
  }

  @SuppressWarnings("deprecation")
  @Override
  public String getSendNo(long pId) {
    Date date = new java.util.Date();
    long year = date.getYear() + 1900;
    long month = date.getMonth() + 1;
    long day = date.getDate();
    String userformno = "";
    try {
      userformno = ("NO." + year + (month >= 10 ? month : ("0" + month)))
          + (day >= 10 ? day : ("0" + day)) + "-";
      String sql = "select no from ess_filesend where pId=? and YEAR(NOW())=SUBSTR(createtime,1,4) ORDER BY no DESC limit 0,1";
      String str = query.query(sql, new ScalarHandler<String>(), pId);
      if (!StringUtils.isEmpty(str)) {
        long no = Long.parseLong((str.length() > 6) ? str.substring(
            str.length() - 6, str.length()) : str) + 1;
        for (int i = 6; i > (no + "").length(); i--) {
          userformno = userformno + "0";
        }
        userformno = userformno + no;
      } else {
        userformno = userformno + "000001";
      }
      return userformno;
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
  }

  private Map<String, Object> addReceive(Map<String, Object> send) {
    String sql = "insert into ess_filereceive(pId,send_id,file_id,part_code,receiveId,copies,creater,createtime,status) values('"
        + send.get("pId")
        + "','"
        + send.get("id")
        + "','"
        + send.get("file_id")
        + "',?,?,?,'"
        + send.get("creater")
        + "','"
        + send.get("createtime") + "','0') ";
    try {
      String[] row = send.get("matrix").toString().split(";");
      Object[][] obj = new Object[row.length][3];
      for (int i = 0; i < row.length; i++) {
        String[] c = row[i].split(",");
        String type = c[2];
        if ("part".equals(type)) {
          obj[i][0] = c[0];
          obj[i][1] = null;
        } else {
          obj[i][0] = null;
          obj[i][1] = c[0];
        }
        obj[i][2] = c[1];
      }
      List<Map<String, Object>> list = query.insertBatch(sql,
          new MapListHandler(), obj);
      if (list.size() == row.length) {
        return send;
      } else {
        return null;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String delSend(Long[] ids, String userId, String ip) {
    String sql = "delete from ess_filesend where id=? ";
    String sqlReceive = "delete from ess_filereceive where send_id=? ";
    String sqlOrder = "delete from ess_filechange_order where send_id=? ";
    String idStr = "";
    try {
      Object[][] obj = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        obj[i] = new Object[] { ids[i] };
        idStr += "";
      }
      int[] cnt = query.batch(sql, obj);
      int[] cntR = query.batch(sqlReceive, obj);
      int[] cntC = query.batch(sqlOrder, obj);
      if (cnt == null || cnt.length == 0 || cntR == null || cntR.length == 0
          || cntC == null || cntC.length == 0) {
        return "未发现删除的发放单";
      }

      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "文件发放");
      log.put("operate", "文件发放：删除发放单");
      log.put("loginfo", "删除标识为【" + idStr + "】的发放单");
      this.getLogService().saveLog(log);
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除发放单失败";
    }
  }

  @Override
  public Map<String, Object> extendSend(Map<String, Object> send1) {
    Map<String, Object> send = new HashMap<String,Object>();
    send.put("ip", send1.get("ip"));
    send.put("userId", send1.get("userId"));
    //xiewenda 在这里调用保存方法是 不加保存日志
    send1.put("nolog", "true");
    send = this.momentumSend(send1);
    return this.send(send);
  }

  @Override
  public List<Map<String, Object>> findDocumentList(long page, long pre,
      String stageCode, String stageId) {
    if ("".equals(stageId) || "0".equals(stageId)) {
      return new ArrayList<Map<String, Object>>();
    }
    String sql = "select * from (select dc.*";
    boolean flag = this.tableIfExists(stageId);
    if (flag) {
      sql += "," + this.getColsCode(stageId);
    }
    //sql += ",dv.`name` as 'device',dv.id as 'stageId',pt.`name` as 'part' from ess_document as dc ";
    sql += ",dc.`deviceName` as 'device',dc.`participatoryName` as 'part' from ess_document as dc ";
    if (flag) {
      sql += " LEFT JOIN esp_" + stageId + " as esp ON dc.id=esp.documentId ";
    }
    //sql += " LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where 1=1 ";
    sql += " ) as tb where 1=1 ";
    if (stageCode != null && !"".equals(stageCode)) {
      sql = sql + " and stageCode='" + stageCode + "' ";
    }
    long start = (page - 1) * pre;
    sql = sql + " limit " + start + ", " + pre;
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
  public List<Map<String, Object>> findDocumentListByIds(long page, long pre,
      String ids) {
    //String sql = "select * from (select dc.*,dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where FIND_IN_SET(id,?)>0 ";
    String sql = "select a.*,a.deviceName as 'device',a.participatoryName as 'part' from ess_document as a where FIND_IN_SET(a.id,?)>0";
    long start = (page - 1) * pre;
    sql = sql + " limit " + start + "," + pre;
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), ids);
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      } else {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> listCount = this.getDocumentFileCount(ids);
        for (Map<String, Object> map : list) {
          String id = map.get("id").toString();
          int num = 0;
          for (int i = 0; i < listCount.size(); i++) {
            Map<String, Object> mapCount = listCount.get(i);
            String idCount = mapCount.get("pid").toString();
            if (id.equals(idCount)) {
              map.put("fileCount", mapCount.get("cnt"));
              i = listCount.size();
            } else {
              num++;
            }
          }
          if (num == listCount.size()) {
            map.put("fileCount", 0);
          }
          returnList.add(map);
        }
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private List<Map<String, Object>> getDocumentFileCount(String ids) {
    String sql = "select pid,count(id) as cnt from ess_document_file where FIND_IN_SET(pid,?) GROUP BY pid ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), ids);
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
  public List<Map<String, Object>> findDocumentSendList(long page, long pre,
      long pId, String admin, String[] where) {
    try {
      List<Map<String, Object>> list = null;
      String sql = "select tb.* from ess_filesend  as tb where 1=1 ";
      String hands[] = admin.split("-&-");
      if ("false".equals(hands[0])) {
        sql += " and creater='" + hands[1] + "'";
      }
      if (pId > 0) {
        sql = sql + " and pId=" + pId;
      }
      if (where != null && where.length != 0) {
        Condition condition = Condition.getCondition(where);
        sql = sql + " and " + condition.toSQLString();
      }
      long start = (page - 1) * pre;
      sql = sql + " limit " + start + ", " + pre;
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
  public List<Map<String, Object>> findMoveCols(int key, String stageId) {
    String sql = "select name,code,isSystem from ess_document_metadata where stageId=? ";
    if (stageId == null || "".equals(stageId) || "0".equals(stageId)) {
      stageId = "";
    }
    if (key == 1) {
      sql = sql + " or isSystem=0";
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { stageId });
      if (list == null || list.size() == 0) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> findSendMatrixList(long send_id,
      String nodeType, long page, long pre) {
    String sql = "select ef.*,ep.`name` as 'partName',ep.user_id from ess_filereceive ef LEFT JOIN ess_participatory ep ON ef.part_code=ep.`code` WHERE ef.send_id=? limit ?,?";
    if ("1".equals(nodeType)) {
      sql = "select ef.*,ep.`name` as 'partName',ep.user_id from ess_filechange_order ef LEFT JOIN ess_participatory ep ON ef.part_code=ep.`code` WHERE ef.send_id=? limit ?,?";
    }
    try {
      List<Map<String, Object>> list = null;
      long start = (page - 1) * pre;
      list = query.query(sql, new MapListHandler(), new Object[] { send_id,
          start, pre });
      if (list == null || list.size() == 0) {
        list = new ArrayList<Map<String, Object>>();
      } else {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : list) {
          Object part_code = map.get("part_code");
          Object receiveId = map.get("receiveId");
          if (part_code == null && receiveId != null) {
            UserEntry ue = this.getUserQueryService().getUserInfoById(
                receiveId.toString());
            map.put("part_code", ue.getUserid());
            map.put("partName", ue.getLastName() + ue.getFirstName());
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

  private String getColsCode(String stageId) {
    String colSql = "documentId,";
    List<Map<String, Object>> list = this.findMoveCols(0, stageId);
    for (int i = 0; i < list.size(); i++) {
      colSql = colSql + list.get(i).get("code").toString() + ",";
    }
    return colSql.substring(0, colSql.length() - 1);
  }

  @Override
  public long getCount(long pId, String admin, String[] where) {
    String sql = "select count(id) from ess_filesend where 1=1 ";
    String hands[] = admin.split("-&-");
    if ("false".equals(hands[0])) {
      sql += " and creater='" + hands[1] + "' ";
    }
    if (pId > 0) {
      sql = sql + " and pId=" + pId;
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    try {
      Object[] cnt = query.query(sql, new ArrayHandler());
      if (cnt != null && cnt.length == 1) {
        return Long.parseLong(cnt[0].toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  @Override
  public long getCountById(String ids) {
    //String sql = "select count(id) from (select dc.*,dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where FIND_IN_SET(id,?)>0 ";
    String sql = "select count(id) from ess_document where FIND_IN_SET(id,?)>0";
    try {
      Object cnt = query.query(sql, new ScalarHandler<Long>(),
          new Object[] { ids });
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
      return 0;
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  @Override
  public Map<String, Object> getDocumentSendById(long id) {
    String sql = "select * from ess_filesend where id=" + id;
    try {
      Map<String, Object> send = query.query(sql, new MapHandler());
      if (send == null) {
        send = new HashMap<String, Object>();
      }
      return send;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public long getFileCount(String stageCode, String stageId) {
    if (stageId == null || "0".equals(stageId)) {
      return 0;
    }
    String sql = "select count(*) from (select dc.*";
    boolean flag = this.tableIfExists(stageId);
    if (flag) {
      sql += "," + this.getColsCode(stageId);
    }
    //sql += ",dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc ";
    sql += ",dc.`deviceName` as 'device',dc.`participatoryName` as 'part' from ess_document as dc ";
    if (flag) {
      sql += " LEFT JOIN esp_" + stageId + " as esp ON dc.id=esp.documentId ";
    }
    //sql += " LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where 1=1 ";
    sql += " ) as tb where 1=1 ";
    if (stageCode != null && !"".equals(stageCode)) {
      sql = sql + " and stageCode='" + stageCode + "' ";
    }
    try {
      Object[] cnt = query.query(sql, new ArrayHandler());
      if (cnt != null && cnt.length == 1) {
        return Long.parseLong(cnt[0].toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  @Override
  public List<Map<String, Object>> getFlowList(long pId) {
    try {
      List<Map<String, Object>> list = null;
      String sql = "select id,name,flow_matrix,typeNo from ess_fileflow where status='发布' and pId="
          + pId;
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

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  @Override
  public long getMatrixCount(long send_id, String nodeType) {
    String sql = "select count(ef.id) from ess_filereceive ef LEFT JOIN ess_participatory ep ON ef.part_code=ep.`code` WHERE ef.send_id="
        + send_id;
    if ("1".equals(nodeType)) {
      sql = "select count(ef.id) from ess_filechange_order ef LEFT JOIN ess_participatory ep ON ef.part_code=ep.`code` WHERE ef.send_id="
          + send_id;
    }
    try {
      Object[] cnt = query.query(sql, new ArrayHandler());
      if (cnt != null && cnt.length == 1) {
        return Long.parseLong(cnt[0].toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  @Override
  public Map<String, Object> momentumSend(Map<String, Object> send) {
    String sql = "insert into ess_filesend(no,pId,status,fileflow_id,fileflow_name,file_id,creater,createtime,matrix) values(?,?,?,?,?,?,?,?,?)";
    String model = send.get("model")+"";
    try {
      if ("".equals(send.get("sendId")) || send.get("sendId") == null) {
        Long id = query.insert(
            sql,
            new ScalarHandler<Long>(),
            new Object[] { send.get("no"), send.get("pId"), send.get("status"),
                send.get("fileflow_id"), send.get("fileflow_name"),
                send.get("file_id"), send.get("creater"),
                send.get("createtime"), send.get("strMatrix") });
        
        if (id == 0) {
          return null;
        } else {
          send.put("id", id);
          // 日志添加
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", send.get("ip"));
          log.put("userid",send.get("userId") );
          if("documentsCollection".equals(model)){
            log.put("module", "文件收集");
            log.put("operate", "文件收集：保存待发放文件单");
          }else{
            log.put("module", "文件发放");
            log.put("operate", "文件发放：保存待发放文件单");
          }
          log.put("loginfo", "保存发放单编号为：【"+send.get("no")+"】"+"流程名称：【"+send.get("fileflow_name")+"】发放文件标题为：【"+send.get("titles")+"】");
          if("true".equals(send.get("nolog")+"")){
            send.put("loginfo", "发放文件标题为：【"+send.get("titles")+"】");
          }else{
          this.getLogService().saveLog(log);
          }
          return send;
        }
      } else {
        // 日志添加
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", send.get("ip"));
        log.put("userid",send.get("userId") );
        if("documentsCollection".equals(model)){
          log.put("module", "文件收集");
          log.put("operate", "文件收集：修改文件发放单");
        }else{
          log.put("module", "文件发放");
          log.put("operate", "文件发放：修改文件发放单");
        }
        log.put("loginfo", "修改发放单编号为：【"+send.get("no")+"】"+"流程名称：【"+send.get("fileflow_name")+"】发放文件标题为：【"+send.get("titles")+"】");
        this.getLogService().saveLog(log);
        return this.updateSend(send);
      }
      
      
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> pubSend(Map<String, Object> send) {
    this.send(send);
    send = this.getDocumentSendById(Long.parseLong(send.get("id").toString()));
    send.put("sendId", send.get("id"));
    send.put("status", "发放");
    send.put("strMatrix", send.get("matrix"));
    return this.updateSend(send);// 修改发放状态
  }

  private Map<String, Object> send(Map<String, Object> send) {
    if (send != null) {
      String model = send.get("model")+"";
      String no = send.get("no")+"";
      String  fileflow_name= send.get("fileflow_name")+"";
      String  userId= send.get("userId")+"";
      String  ip= send.get("ip")+"";
      try {
        if ("1".equals(send.get("nodeType").toString())) {
          send = this.addChangeOrders(send);
          // 日志添加
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", ip);
          log.put("userid", userId);
          if("documentsCollection".equals(model)){
            log.put("module", "文件收集");
            log.put("operate", "文件收集：变更单发放");
          }else{
          log.put("module", "文件发放");
          log.put("operate", "文件发放：变更单发放");
          }
          log.put("loginfo", "执行编号为：【"+no+"】流程名称【"+fileflow_name+"】"+send.get("loginfo")+"数据发放成功");
          this.getLogService().saveLog(log);
          return send;
        } else {
          send = this.addReceive(send);
          // 日志添加
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", ip);
          log.put("userid", userId);
          if("documentsCollection".equals(model)){
            log.put("module", "文件收集");
            log.put("operate", "文件收集：文件发放");
          }else{
          log.put("module", "文件发放");
          log.put("operate", "文件发放：文件发放");
          }
          log.put("loginfo", "执行编号为：【"+no+"】流程名称【"+fileflow_name+"】"+send.get("loginfo")+"数据发放成功");
          this.getLogService().saveLog(log);
          return send;
        }
      } catch (ClassCastException e) {
        e.printStackTrace();
        return null;
      }
    } else {
      return null;
    }
  }
  
  private boolean tableIfExists(String stageId) {
    String databaseName = this.getUrl();
    String sql = "select TABLE_NAME from information_schema.tables where  TABLE_NAME = 'esp_"
        + stageId + "' and TABLE_SCHEMA='"+databaseName+"' ";
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

  private Map<String, Object> updateSend(Map<String, Object> send) {
    String sql = "update ess_filesend set no=?, pId=?, status=?, fileflow_id=?,fileflow_name=?, file_id=?,matrix=? where id=? ";
    try {
      int id = query.update(
          sql,
          new Object[] { send.get("no"), send.get("pId"), send.get("status"),
              send.get("fileflow_id"), send.get("fileflow_name"),
              send.get("file_id"), send.get("strMatrix"), send.get("sendId") });
      if (id == 0) {
        return null;
      } else {
        send.put("id", send.get("sendId"));
        return send;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String updateFlowNameBySendid(long sendId, String flowName) {
    String sql = "update ess_filesend set fileflow_name=? where id=?";
    try {
      int row = query.update(sql, new Object[] { flowName, sendId });
      if (row == 1) {
        return "true";
      }
      return "false";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  @Override
  public String callbackSend(Map<String, Object> param) {
    String sendId  = param.get("sendId")+"";
    String type  = param.get("type")+"";
    String sql1 = "delete from ess_filereceive where send_id = ?";
    String sql2 = "update ess_filesend set status='待发' where id=?";
    if("1".equals(type)){
      sql1 = "delete from ess_filechange_order where send_id = ?";
    }
    try {
    int row1 = query.update(sql1,sendId);
    if(row1>0){
      int row2 =query.update(sql2,sendId);
      if(row2>0) return "success";
    }
    } catch (SQLException e) {
      e.printStackTrace();
      return "撤回异常，请联系管理员！";
    }
    
    return "撤回失败，没找到撤回数据！";
  }
}
