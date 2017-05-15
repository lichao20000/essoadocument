package cn.flying.rest.service.impl;

import java.io.File;
import java.sql.SQLException;
import java.util.ArrayList;
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
import org.springframework.stereotype.Component;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.IDocumentReceiveService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IParticipatoryService;
import cn.flying.rest.service.utils.Condition;

/**
 * 接收文件模块
 * 
 * @author gengqianfeng
 * 
 */
@Path("documentReceive")
@Component
public class DocumentReceiveServiceImpl extends BasePlatformService implements
    IDocumentReceiveService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  private UserQueryService userQueryService;
  private IParticipatoryService participatoryService;

  private IParticipatoryService getParticipatoryService() {
    if (null == this.participatoryService) {
      this.participatoryService = this.getService(IParticipatoryService.class);
    }
    return this.participatoryService;
  }

  @Override
  public String deleteFile(HashMap<String, Object> param) {
    String rootDir = ((String) param.get("rootDir")).replaceAll("\\\\", "/");
    String filePath = (String) param.get("filePath");
    String id = (String) param.get("id");
    File f = new File(rootDir + filePath);
    boolean flag = false;
    if (f.isFile() && f.exists()) {
      flag = f.delete();
    }
    // 如果有id就是编辑功能删除文件，需要修改表记录信息。如果没有id就是添加删除文件，不需要修改表记录信息
    if (id != null && !"null".equals(id)) {
      if (flag) {
        int num = 0;
        String sql = "update ess_filereceive set status='0',receiver=null,receivetime=null,filePath=null,fileName=null where id=?";
        try {
          num = query.update(sql, id);
        } catch (SQLException e) {
          e.printStackTrace();
          return "删除发成异常！";
        }
        if (num == 0)
          return "没有找到修改数据！";
      }
    }
    if (flag) {
      return "success";
    } else {
      return "文件路径不存在！";
    }
  }

  @Override
  public String delReceive(Long[] ids, String userId, String ip) {
    String sql = "update ess_filereceive set do_del=0 where id=? ";
    String idStr = "";
    try {
      Object[][] obj = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        obj[i] = new Object[] { ids[i] };
        idStr += ids[i] + ",";
      }
      int[] cnt = query.batch(sql, obj);
      if (cnt == null || cnt.length == 0) {
        return "未发现删除的接收单";
      }
      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "文件接收");
      log.put("operate", "文件接收：删除接收文件");
      log.put("loginfo", "删除标识为【" + idStr + "】的接收文件");
      this.getLogService().saveLog(log);
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除接收单失败";
    }
  }

  @Override
  public String editReceive(HashMap<String, Object> receive) {
    String sql = "update ess_filereceive set `status`='1', sign=?, mobile=?, reply_content=?, receiver=?,receivetime=?,filePath=?,fileName=? where id=? ";
    String checkSql = "select count(id) from ess_filereceive where `status`='0' and send_id="
        + receive.get("send_id");
    String sendSql = "update ess_filesend set `status`='关闭' where id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { receive.get("sign"), receive.get("mobile"),
              receive.get("reply_content"), receive.get("receiver"),
              receive.get("receivetime"), receive.get("filePath"),
              receive.get("fileName"), receive.get("id") });
      if (row == 0) {
        return "未发现接收单记录";
      } else {

        Object[] cnt = query.query(checkSql, new ArrayHandler());
        if (cnt != null && cnt.length != 0) {
          if (Long.parseLong(cnt[0].toString()) == 0) {
            if (query.update(sendSql, receive.get("send_id")) == 1) {
              Map<String, Object> log = new HashMap<String, Object>();
              log.put("ip", receive.get("ip"));
              log.put("userid", receive.get("receiver"));
              log.put("module", "文件接收");
              log.put("operate", "文件接收：保存接收文件");
              log.put("loginfo", "保存标识为【" + receive.get("id") + "】的接收文件");
              this.getLogService().saveLog(log);
              return "";
            }
          } else {
            Map<String, Object> log = new HashMap<String, Object>();
            log.put("ip", receive.get("ip"));
            log.put("userid", receive.get("receiver"));
            log.put("module", "文件接收");
            log.put("operate", "文件接收：保存接收文件");
            log.put("loginfo", "保存标识为【" + receive.get("id") + "】的接收文件");
            this.getLogService().saveLog(log);
            return "";
          }

        }
        return "接收失败";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "接收失败";
    }
  }

  @Override
  public List<Map<String, Object>> findDocumentReceiveList(
      HashMap<String, Object> param) {
    String userId = param.get("user").toString();
    UserEntry ue = getUserQueryService().getUserByUserName(userId);
    String admin = param.get("admin") + "";
    String sql = "";
    if ("true".equals(admin)) {
      sql = "select * from (select fc.*,fs.no from ess_filereceive fc LEFT JOIN ess_filesend fs ON fc.send_id=fs.id) tb where do_del=1 ";
    } else {
      sql = "select * from (select fc.*,fs.no from ess_filereceive fc LEFT JOIN ess_filesend fs ON fc.send_id=fs.id) tb where do_del=1 and part_code in(select code from ess_participatory where FIND_IN_SET('"
          + userId + "',user_id)>0 ) or receiveId=" + ue.getId();
    }
    int pid = Integer.parseInt(param.get("pid").toString());
    if (pid > 0) {
      sql = sql + " and pId=" + pid;
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) param.get("condition");
    if (where != null && where.size() != 0) {
      Condition condition = Condition.getConditionByList(where);
      sql = sql + " and " + condition.toSQLString();
    }
    sql = sql + " order by status asc,createtime desc";
    int page = Integer.parseInt(param.get("page").toString());
    int pre = Integer.parseInt(param.get("pre").toString());
    long start = (page - 1) * pre;
    sql = sql + " limit " + start + "," + pre;

    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      } else {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : list) {
          Object part_code = map.get("part_code");
          Object receiveId = map.get("receiveId");
          if (part_code == null && receiveId != null) {
            UserEntry uee = getUserQueryService().getUserInfoById(
                receiveId.toString());
            //如果有异常数据就过滤掉了 比如数据中有接收人但是一些原因接收人没查到 
            if(uee==null) continue;
            map.put("part_code", uee.getUserid());
            map.put("part_name", uee.getEmpName());
           
          } else {
            Map<String, Object> part = this.getParticipatoryService()
                .getParticipatoryByCode(part_code.toString());
            map.put("part_name", part.get("name"));
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

  public long getCount(HashMap<String, Object> param) {
    String admin = param.get("admin") + "";
    String sql = "";
    if ("true".equals(admin)) {
      sql = "select count(id) from (select fc.*,fs.no from ess_filereceive fc LEFT JOIN ess_filesend fs ON fc.send_id=fs.id) tb where do_del=1";
    } else {
      sql = "select count(id) from (select fc.*,fs.no from ess_filereceive fc LEFT JOIN ess_filesend fs ON fc.send_id=fs.id) tb where do_del=1 and part_code in(select code from ess_participatory where FIND_IN_SET('"
          + param.get("user").toString() + "',user_id)>0 ) ";
    }
    int pid = Integer.parseInt(param.get("pid").toString());
    if (pid > 0) {
      sql = sql + " and pId=" + pid;
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) param.get("condition");
    if (where != null && where.size() != 0) {
      Condition condition = Condition.getConditionByList(where);
      sql = sql + " and " + condition.toSQLString();
    }
    try {
      Object[] cnt = query.query(sql, new ArrayHandler());
      if (cnt != null && cnt.length != 0) {
        return Long.parseLong(cnt[0].toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  @Override
  public Map<String, Object> getReceiveById(long receiveId) {
    String sql = "select * from ess_filereceive where id=? ";
    try {
      Map<String, Object> obj = query.query(sql, new MapHandler(),
          new Object[] { receiveId });
      if (obj == null || obj.isEmpty()) {
        obj = new HashMap<String, Object>();
      }
      return obj;
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

  @Override
  public Long getReceiveBySendId(Map<String, Object> param) {
    String sendId = param.get("sendId")+"";
    String status = param.get("status")+"";
    String type = param.get("type")+"";
    String sql = "select count(*) from ess_filereceive where send_id=? and status =?";
    if("1".equals(type)){
      sql = "select count(*) from ess_filechange_order where send_id=? and status =?";
    }
    try {
      Long count =  query.query(sql, new ScalarHandler<Long>(),sendId,status);
    return count;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return -1L;
  }
}
