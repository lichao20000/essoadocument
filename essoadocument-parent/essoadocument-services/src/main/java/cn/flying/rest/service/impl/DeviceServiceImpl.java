package cn.flying.rest.service.impl;

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
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IDeviceService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.JdbcUtil;

/**
 * 装置号维护
 * 
 * @author xuekun
 *
 */
@Path("device")
@Component
public class DeviceServiceImpl extends BasePlatformService implements IDeviceService {
  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }
  @Override
  public HashMap<String, Object> add(HashMap<String, Object> map) {
    String sql =
        "insert into ess_device (pId,name,firstNo,secondNo,deviceNo,baseUnits,detailUnits,mainPart,supervisionUnits,baseUnitsCode,detailUnitsCode,mainPartCode,supervisionUnitsCode,remarks,level) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    Object[] params =
        {map.get("pId"), map.get("name").toString().trim(), map.get("firstNo"), map.get("secondNo"),
            map.get("deviceNo"), map.get("baseUnits"), map.get("detailUnits"), map.get("mainPart"),
            map.get("supervisionUnits"), map.get("baseUnitsCode"), map.get("detailUnitsCode"),
            map.get("mainPartCode"), map.get("supervisionUnitsCode"), map.get("remarks"),
            map.get("level")};
    Long id = JdbcUtil.insert(query, sql, params);
    if (id == null) {
      return null;
    } else {
      Map<String,Object> log = new HashMap<String,Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "装置单元");
      log.put("operate", "装置单元：添加装置");
      log.put("loginfo", "添加【"+ map.get("name")+"】装置");
      this.getLogService().saveLog(log);
      
      map.put("id", id);
      return map;
    }
  }

  @Override
  public String delete(Long[] ids,String userId,String ip) {
    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    List<Map<String,String>> list = new ArrayList<Map<String,String>>();
    List<Map<String,Object>> treeMap = getTree(0);
    //迭代遍历list 得到删除ids下的所有子节点信息
    for (Long id : ids) {
     Map<String,String> map = new HashMap<String,String>();
     for (Map<String, Object> node : treeMap) {
      if((""+id).equals(node.get("id")+"")){
        map.put(node.get("name")+"", getChildName(id+"", treeMap, ""));
      }
    }
     list.add(map);
    }
    try {
      for (int i = 0; i < ids.length; i++) {
        deleteCascade(ids[i]);
      }
    //日志添加
      StringBuilder sb = new StringBuilder();
      for (Map<String,String> tree : list) {
         for (String key : tree.keySet()) {
           String child = tree.get(key);
           if("".equals(child)){
           sb.append("删除装置单元:"+key);
           }else{
           sb.append("删除装置单元:"+key+"及其子装置："+child);
           }
           sb.append(";");
        }
          
      }
      Map<String,Object> log = new HashMap<String,Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "装置单元");
      log.put("operate", "装置单元：删除装置");
      log.put("loginfo", sb.toString());
      this.getLogService().saveLog(log);
      
      return "";
    } catch (Exception e) {
      e.printStackTrace();
      return "删除装置单元或装置分类失败";
    }

  }
  private String getChildName(String id, List<Map<String,Object>> treeMap,String name){
    
    for (Map<String, Object> node : treeMap) {
      if(id.equals(node.get("pId")+"")){
         name+="【"+node.get("name")+"】";
         getChildName(node.get("id")+"",treeMap,name);
      }
    }
    return name;
  }
  private boolean deleteById(long id) {
    String sql = "delete from ess_device where id= ? ";
    Object[] params = {id};
    return JdbcUtil.update(query, sql, params);
  }

  private void deleteCascade(long id) {
    try {
      // 删除装置单元
      deleteById(id);
      // 子装置单元
      List<Map<String, Object>> list = getDeviceByPid(id);
      if (list.size() != 0) {
        for (int i = 0; i < list.size(); i++) {
          // 迭代删除装置单元
          deleteCascade((Integer) list.get(i).get("id"));
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  @Override
  public Map<String, Object> get(Long id) {
    String sql = "select * from ess_device where id=?";
    Object[] params = {id};
    return JdbcUtil.query(query, sql, new MapHandler(), params);
  }

  @Override
  public long getCount(HashMap<String, Object> map) {
    String sql = "select count(*) from ess_device where 1=1 ";
    if (null != map.get("pId") && !"".equals(map.get("pId"))) {
      sql += " and  pId=" + map.get("pId");
    }
    if (null != map.get("where") && !"".equals(map.get("where"))) {
      @SuppressWarnings("unchecked")
      Condition cond = Condition.getConditionByList((List<String>) map.get("where"));
      sql += " and " + cond.toSQLString();
    }
    try {
      Object cnt = query.query(sql, new ScalarHandler<Integer>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  private List<Map<String, Object>> getDeviceByPid(long id) {
    String selectsql = "select id from ess_device where pId= ?";
    Object[] params = {id};
    List<Map<String, Object>> list = JdbcUtil.query(query, selectsql, new MapListHandler(), params);
    return list;
  }

  @Override
  public List<Map<String, Object>> getTree(int maxLevel) {
    List<Map<String, Object>> list = null;
    String sql = "select id,pId,name,firstNo,deviceNo code from ess_device ";
    if (maxLevel > 0) {
      sql += "where level< ? ";
      list = JdbcUtil.query(query, sql, new MapListHandler(), new Object[] {maxLevel});
    } else {
      list = JdbcUtil.query(query, sql, new MapListHandler());
    }

    if (list == null) {
      list = new ArrayList<Map<String, Object>>();
    }
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("id", 0);
    map.put("pId", -1);
    map.put("name", "装置单元");
    map.put("code", "");
    map.put("firstNo", "");
    map.put("nocheck", true);
    list.add(0, map);
    return list;
  }

  @Override
  public Boolean judgeFirstNo(String firstNo, Long id) {
    Boolean flag = true;
    try {
      String sql = "select count(1) from ess_device where firstNo= ? and level!='3' and id!=? ";
      long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {firstNo, id});
      if (cnt > 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;

  }

  @Override
  public Boolean judgeSecondNo(String firstNo, String secondNo, Long id) {
    Boolean flag = true;
    try {
      String sql = "select count(1) from ess_device where  firstNo=? and secondNo=? and id!=? ";
      long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {firstNo, secondNo, id});
      if (cnt > 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;

  }

  @Override
  public List<Map<String, Object>> list(Integer page, Integer rp, HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    String sql = "select * from ess_device where 1=1 ";
    if (null != map.get("pId") && !"".equals(map.get("pId"))) {
      sql += " and  pId=" + map.get("pId");
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("where");
    if (null != where && where.size() != 0) {
      Condition cond = Condition.getConditionByList(where);
      sql += " and " + cond.toSQLString();
    }
    if (null != page && null != rp) {
      int start = (page - 1) * rp;
      sql = sql + " limit " + start + ", " + rp;
    }

    list = JdbcUtil.query(query, sql, new MapListHandler());
    if (list == null) {
      list = new ArrayList<Map<String, Object>>();
    }
    return list;
  }

  @Override
  public String update(HashMap<String, String> map) {
    try {
      String sql =
          "update ess_device set pId=?,name=?,firstNo=?,secondNo=?,deviceNo=?,baseUnits=?,detailUnits=?,mainPart=?,supervisionUnits=?,baseUnitsCode=?,detailUnitsCode=?,mainPartCode=?,supervisionUnitsCode=?,remarks=?,level=? where id=?";
      Object[] params =
          {map.get("pId"), map.get("name").toString().trim(), map.get("firstNo"), map.get("secondNo"),
              map.get("deviceNo"), map.get("baseUnits"), map.get("detailUnits"),
              map.get("mainPart"), map.get("supervisionUnits"), map.get("baseUnitsCode"),
              map.get("detailUnitsCode"), map.get("mainPartCode"), map.get("supervisionUnitsCode"),
              map.get("remarks"), map.get("level"), map.get("id")};

      int row = query.update(sql, params);
      if (row == 0) {
        return "未发现装置单元或装置分类";
      } else {
        Map<String,Object> log = new HashMap<String,Object>();
        log.put("ip", map.get("ip"));
        log.put("userid", map.get("userId"));
        log.put("module", "装置单元");
        log.put("operate", "装置单元：修改装置");
        log.put("loginfo", "修改标识为【"+ map.get("id")+"】的装置信息");
        this.getLogService().saveLog(log);
        
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "更新装置单元或装置分类失败";
    }
  }

  @Override
  public Boolean judgeDeviceName(Map<String,Object> param) {
    String deviceName = param.get("deviceName")+"";
    String id = param.get("id")+"";
    Boolean flag = true;
    try {
      String sql = "select count(1) from ess_device where name=? and id!=? ";
      long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {deviceName,id});
      if (cnt > 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;

  }
  
  @Override
  public Boolean isExistDevice(Map<String,Object> param) {
    Boolean flag = true;
    try {
      String sql = "select count(1) from ess_device where pId = ? ";
      long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {param.get("pId")});
      if (cnt > 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }
}
