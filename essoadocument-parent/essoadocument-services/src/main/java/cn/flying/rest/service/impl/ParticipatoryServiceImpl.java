package cn.flying.rest.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ArrayHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.stereotype.Component;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IParticipatoryService;
import cn.flying.rest.service.entiry.Participatory;
import cn.flying.rest.service.utils.Condition;

/**
 * 参建单位部门服务
 * 
 * @author dengguoqi 2014-10-30
 */
@Path("participatory")
@Component
public class ParticipatoryServiceImpl extends BasePlatformService implements
    IParticipatoryService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  private UserQueryService userQueryService;

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }

  @Override
  public HashMap<String, Object> addParticipatoryList(
      HashMap<String, Object> part) {
    String sql = "insert into ess_participatory(name, code, type, user_id, pId,level) values(?,?,?,?,?,?)";
    try {
      Long id = query.insert(sql, new ScalarHandler<Long>(),
          new Object[] { part.get("name"), part.get("code"), part.get("type"),
              part.get("user_id"), part.get("pId"), part.get("level") });
      if (id == 0) {
        return null;
      } else {
        part.put("id", id);

        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", part.get("ip"));
        log.put("userid", part.get("userId"));
        log.put("module", "参见单位");
        log.put("operate", "参见单位：添加单位");
        log.put("loginfo", "添加【" + part.get("name") + "】参见单位");
        this.getLogService().saveLog(log);
        return part;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String deleteParticipatorys(Long[] ids, String userId, String ip) {
    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    String sql = "delete from ess_participatory where id=?";
    String idStr = "";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] { ids[i] };
        idStr += "'"+ids[i] + "',";
      }
      StringBuilder sb = new StringBuilder();
      if(!"".equals(idStr)){
        idStr = idStr.substring(0, idStr.length()-1); 
        List<Map<String,Object>> parts =  getParticipatoryByIds(idStr);
       if(parts!=null){
         sb.append("【");
        for (Map<String, Object> p : parts) {
         sb.append(p.get("name"));
        }
        sb.append("】");
       }
      }
      int[] row = query.batch(sql, params);
      if (row == null) {
        return "未发现参建单位或部门";
      } else {
        // 日志添加
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "参见单位");
        log.put("operate", "参见单位：删除单位");
        log.put("loginfo", "删除名称：" + sb.toString() + "的参见单位");
        this.getLogService().saveLog(log);

        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除参建单位或部门失败";
    }
  }

  @Override
  public long getCount() {
    try {
      Object cnt = query.query("select count(*) from ess_participatory",
          new ScalarHandler<Integer>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  @Override
  public long getCount(String pid, String[] where) {
    String sql = "select count(*) from ess_participatory where 1=1 ";
    if (!"".equals(pid)) {
      sql += " and FIND_IN_SET(pId,'" + pid + "')";
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

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }


  public List<Map<String, Object>> getParticipatoryByIds(String ids) {
    try {
      List<Map<String, Object>> part = query.query(
          "select * from ess_participatory where id in("+ids+")", new MapListHandler());
      if (part == null) {
        return null;
      }
      return part;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }
  
  @Override
  public Map<String, Object> getParticipatoryById(long id) {
    try {
      Map<String, Object> part = query.query(
          "select * from ess_participatory where id=" + id, new MapHandler());
      if (part == null) {
        return null; 
      }
      return part;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Participatory> getParticipatoryByUserId(String userId) {
    String sql = "select * from ess_participatory where FIND_IN_SET(?,user_id) ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { userId });
      if (list != null && !list.isEmpty()) {
        List<Participatory> listPart = new ArrayList<Participatory>();
        for (Map<String, Object> map : list) {
          Participatory part = new Participatory();
          part.setId(Long.parseLong(map.get("id").toString()));
          part.setCode(map.get("code").toString());
          part.setPid(Long.parseLong(map.get("pId").toString()));
          part.setType(map.get("type").toString());
          part.setName(map.get("name").toString());
          part.setUser_id(map.get("user_id").toString());
          listPart.add(part);
        }
        return listPart;
      }
      return null;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getParticipatoryList(long page, long pre,
      String parentId, String[] where) {
    try {
      List<Map<String, Object>> list = null;
      String sql = "select * from ess_participatory where 1=1 ";
      if (!"".equals(parentId)) {
        sql += " and FIND_IN_SET(pId,'" + parentId + "')";
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
  public List<Map<String, Object>> getParticipatoryList(Map<String, Object> map) {
    try {
      List<Map<String, Object>> list = null;
      String sql = "select * from ess_participatory where 1=1";
      if (map.get("pId")!=null && !"".equals(map.get("pId"))) {
    	  String[] arr = map.get("pId").toString().split(",");
          sql += " and FIND_IN_SET(pId,'" + map.get("pId") + "') or id = "+arr[0];
      }
      if (map.get("where") != null && !"".equals(map.get("where"))) {
        sql = sql + " and " + map.get("where");
      }
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      if (map.get("pId")==null || "".equals(map.get("pId"))) {
	      Map<String, Object> map1 = new HashMap<String, Object>();
	      map1.put("id", 0);
	      map1.put("pId", -1);
	      map1.put("name", "参建单位部门列表");
	      map1.put("nocheck", true);
	      map1.put("level", 0);
	      list.add(0, map1);
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public long uniqueCode(String code) {
    try {
      String sql = "select count(id) from ess_participatory where code='"
          + code + "'";
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
  public String updateParticipatory(HashMap<String, String> part) {
    String sql = "update ess_participatory set name=?, code=?, type=?, user_id=?, pId=?,level=? where id=?";
    try {
      int row = query.update(
          sql,
          new Object[] { part.get("name"), part.get("code"), part.get("type"),
              part.get("user_id"), part.get("pid"), part.get("level"),
              part.get("id") });
      if (row == 0) {
        return "未发现参建单位或部门";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", part.get("ip"));
        log.put("userid", part.get("userId"));
        log.put("module", "参见单位");
        log.put("operate", "参见单位：修改单位");
        log.put("loginfo", "修改标识为【" + part.get("id") + "】参见单位信息");
        this.getLogService().saveLog(log);

        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "更新参建单位或部门失败";
    }
  }

  @Override
  public String uniqueName(Map<String, Object> part) {
    String sql = "select count(id) from ess_participatory where pId=? and level=? and name=? ";
    try {
      Object lv = part.get("level");
      if (lv != null) {
        long level = Long.parseLong(lv.toString());
        long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {
            part.get("pId"), level + 1, part.get("name").toString().trim() });
        if (cnt > 0) {
          return "false";
        }
      }
      return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  @Override
  public Map<String, Object> getParticipatoryByCode(String code) {
    try {
      Map<String, Object> part = query.query(
          "select * from ess_participatory where code='" + code + "'",
          new MapHandler());
      if (part == null) {
        return new HashMap<String, Object>();
      }
      return part;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String addMember(long partId, long userId, String office) {
    String sql = "insert into ess_part_user(partId,userId,office) values(?,?,?) ";
    try {
      if (this.getPartMember(partId, userId)) {
        long id = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
            partId, userId, office });
        if (id > 0) {
          return "";
        }
      } else {
        return "员工已经存在，无需添加";
      }
      return "添加员工失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "未发现要添加的本门员工";
    }
  }

  private boolean getPartMember(long partId, long userId) {
    String sql = "select count(id) from ess_part_user where partId=? and userId=? ";
    try {
      long id = query.query(sql, new ScalarHandler<Long>(), new Object[] {
          partId, userId });
      if (id == 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public long getMemberCount(long partId, String[] where) {
    String sql = "select count(id) as cnt  from ess_part_user where partId=? ";
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    try {
      long cnt = query.query(sql, new ScalarHandler<Long>(), partId);
      if (cnt > 0) {
        return cnt;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
    return 0;
  }

  @Override
  public List<Map<String, Object>> getMemberList(long page, long rp,
      long partId, String[] where) {
    String sql = "select * from ess_part_user where partId=? ";
    if (where != null && where.length != 0) {
      Condition condition = Condition.getCondition(where);
      sql = sql + " and " + condition.toSQLString();
    }
    sql += " order by office asc ";
    long start = (page - 1) * rp;
    sql = sql + " limit " + start + ", " + rp;
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), partId);
      if (list.size() > 0) {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : list) {
          UserEntry ue = this.getUserQueryService().getUserInfoById(
              map.get("userId").toString());
          Map<String, Object> userMap = new HashMap<String, Object>();
          userMap.put("dataId", map.get("id"));
          userMap.put("id", ue.getId());
          userMap.put("userid", ue.getUserid());
          userMap.put("empName", ue.getEmpName());
          userMap.put("emailAddress", ue.getEmailAddress());
          userMap.put("mobTel", ue.getMobTel());
          userMap.put("partId", map.get("partId"));
          userMap.put("office", map.get("office"));
          returnList.add(userMap);
        }
        return returnList;
      } else {
        return new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String confirmDelMember(long partId, String[] ids) {
    String sql = "delete from ess_part_user where partId=? and userId=? ";
    try {
      Object[][] params = new Object[ids.length][2];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] { partId, ids[i] };
      }
      int[] row = query.batch(sql, params);
      if (row.length > 0) {
        return "";
      }
      return "删除部门员工失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "未找到要删除的部门员工";
    }
  }

  @Override
  public Map<String, Object> getMemberById(Map<String, Object> param) {
    String id = param.get("id")+"";
    String sql = "select * from ess_part_user where id=?";
    try {
      Map<String,Object> result = query.query(sql, new MapHandler(),id);
      if (result!=null) {
        return result;
      }
      
    } catch (SQLException e) {
      e.printStackTrace();
      return new HashMap<String,Object>();
    }
    return new HashMap<String,Object>();
  }

  @Override
  public String editMember(Map<String, Object> param) {
    String id = param.get("id")+"";
    String officeType = param.get("officeType")+"";
    String sql = "update ess_part_user set office = ? where id=?";
    try {
    int row =  query.update(sql, officeType,id);
    if(row>0) return "success";
    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", param.get("ip"));
    log.put("userid", param.get("userId"));
    log.put("module", "参见单位");
    log.put("operate", "参见单位：修改部门员工");
    log.put("loginfo", "修改【"+param.get("partName")+"】部门,员工【"+param.get("userId")+"】的职位为：【"+getOfficeByType(officeType)+"】");
    this.getLogService().saveLog(log);
    } catch (SQLException e) {
      e.printStackTrace();
      return "修改员工异常，请联系管理员!";
    }
    return "修改员工失败，请联系管理员!";
  }
  
  private String getOfficeByType(String officeType){
    String type = "";
    if("1".equals(officeType)){
      type="正级领导";
    }else if("2".equals(officeType)){
      type="副级领导";
    }else if("3".equals(officeType)){
      type="文控人员";
    }else if("4".equals(officeType)){
      type="普通员工";
    }
    return type;
  }
  
  @Override
  public long isExistUsers(Map<String,Object> map){
    long row = 0;
    String sql = "select count(*) from ess_part_user where partId = "+map.get("partId");
    try {
      row =  query.query(sql,new ScalarHandler<Long>());
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
    return row;
  }
  @Override
  public Map<String, Object> getPartByUserId(long userId) {
    String sql = "select ep.* from  ess_participatory as ep LEFT JOIN ess_part_user as eu ON ep.id=eu.partId where eu.userId=? ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), userId);
      if (list != null && list.size() > 0) {
        return list.get(0);
      }
      return new HashMap<String, Object>();
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }
  
  @Override
  public Map<String, Object> getPartUserById(Map<String, Object> param) {
    String sql = "select * from ess_part_user where 1=1 ";
    if (!"0".equals(param.get("partId") + "")) {
      sql += " and partId=" + param.get("partId");
    }
    sql += " order by office asc ";
    try {
      List<Map<String, Object>> list = null;
      list = this.query.query(sql, new MapListHandler());
      if (list.size() > 0) {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : list) {
          UserEntry ue = getUserQueryService().getUserInfoById(
              map.get("userId").toString());
          if (ifExistsKeyWord(ue, param.get("keyWord").toString())) {
            Map<String, Object> userMap = new HashMap<String, Object>();
            userMap.put("id", Integer.valueOf(ue.getId()));
            userMap.put("userid", ue.getUserid());
            userMap.put("empName", ue.getEmpName());
            userMap.put("emailAddress", ue.getEmailAddress());
            userMap.put("mobTel", ue.getMobTel());
            userMap.put("partId", map.get("partId"));
            userMap.put("office", map.get("office"));
            returnList.add(userMap);
          }
        }
        Map<String, Object> returnMap = new HashMap<String, Object>();
        int size = returnList.size();
        int start = Integer.parseInt(param.get("start").toString());
        int limit = Integer.parseInt(param.get("limit").toString());
        int end = start + limit > size ? size : start + limit;
        returnMap.put("total", Integer.valueOf(size));
        returnMap.put("users", returnList.subList(start, end));
        return returnMap;
      }
      return new HashMap<String, Object>();
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  private boolean ifExistsKeyWord(UserEntry ue, String keyWord) {
    if (("".equals(keyWord)) || (keyWord == null)) {
      return true;
    }
    if (ue.getUserid().contains(keyWord)) {
      return true;
    }
    if (ue.getEmpName().contains(keyWord)) {
      return true;
    }
    if (ue.getEmailAddress().contains(keyWord)) {
      return true;
    }
    if (ue.getMobTel().contains(keyWord)) {
      return true;
    }
    return false;
  }
}
