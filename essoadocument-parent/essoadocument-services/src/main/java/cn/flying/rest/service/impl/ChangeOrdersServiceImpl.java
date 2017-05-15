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
import org.springframework.stereotype.Component;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.IChangeOrdersService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IParticipatoryService;
import cn.flying.rest.service.utils.Condition;

@Path("changeOrders")
@Component
public class ChangeOrdersServiceImpl extends BasePlatformService implements
    IChangeOrdersService {

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
        String sql = "update ess_filechange_order set status='0',receiver=null,receivetime=null,filePath=null,fileName=null where id=?";
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
  public String delOrder(long[] ids, String userId, String ip) {
    String sql = "update ess_filechange_order set do_del=0 where id=? ";
    String idStr = "";
    try {
      Object[][] param = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        param[i] = new Object[] { ids[i] };
        idStr += ids[i] + ",";
      }
      int[] cnt = query.batch(sql, param);
      if (cnt == null || cnt.length == 0) {
        return "未发现要删除的设计变更单";
      }
      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "设计变更单");
      log.put("operate", "设计变更单：删除设计变更单");
      log.put("loginfo", "删除标识为【" + idStr + "】的设计变更单");
      this.getLogService().saveLog(log);
      return "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除设计变更单失败";
    }
  }

  @Override
  public String editOrders(HashMap<String, Object> order) {
    String sql = "update ess_filechange_order set status='1', sign=?, mobile=?, reply_content=?,receiver=?, receivetime=?,filePath=?,fileName=?  where id=? ";
    String checkSql = "select count(id) from ess_filechange_order where `status`='0' and send_id="
        + order.get("send_id");
    String sendSql = "update ess_filesend set `status`='关闭' where id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { order.get("sign"), order.get("mobile"),
              order.get("reply_content"), order.get("receiver"),
              order.get("receivetime"), order.get("filePath"),
              order.get("fileName"), order.get("id") });
      if (row != 1) {
        return "未发现处理设计变更单";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", order.get("ip"));
        log.put("userid", order.get("userId"));
        log.put("module", "设计变更单");
        log.put("operate", "设计变更单：修改设计变更单");
        log.put("loginfo", "修改标识为【" + order.get("id") + "】的计变更单信息");
        this.getLogService().saveLog(log);

        Object[] cnt = query.query(checkSql, new ArrayHandler());
        if (cnt != null && cnt.length != 0) {
          if (Long.parseLong(cnt[0].toString()) == 0) {
            if (query.update(sendSql, order.get("send_id")) == 1) {
              return "";
            }
          } else {
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
  public Map<String, Object> findChangeOrdersById(long id) {
    String sql = "select * from ess_filechange_order where id=" + id;
    try {
      Map<String, Object> obj = null;
      obj = query.query(sql, new MapHandler());
      if (obj == null || obj.isEmpty()) {
        obj = new HashMap<String, Object>();
      }
      return obj;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> findChangeOrdersList(long page, long pre,
      String user, String admin,long pId, String[] where) {
    UserEntry ue = getUserQueryService().getUserByUserName(user);
    String sql = "";
    if ("true".equals(admin)) {
      sql = "select * from ess_filechange_order where do_del=1 ";
    } else {
      sql = "select * from ess_filechange_order where do_del=1 and part_code in(select code from ess_participatory where FIND_IN_SET('"
          + user + "',user_id)>0) or receiveId=" + ue.getId();
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    if(pId!=0){
      sql = sql + " and pId="+pId;
    }
    sql = sql + " order by status asc,code desc";
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

  @Override
  public long getCount(String user, String admin,long pId, String[] where) {
    UserEntry ue = getUserQueryService().getUserByUserName(user);
    String sql = "";
    if ("true".equals(admin)) {
      sql = "select count(id) from ess_filechange_order where do_del=1 ";
    } else {
      sql = "select count(id) from ess_filechange_order where do_del=1 and part_code in(select code from ess_participatory where FIND_IN_SET('"
          + user + "',user_id)>0) or receiveId=" + ue.getId();
    }
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    if(pId!=0){
      sql = sql + " and pId="+pId;
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

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }
}
