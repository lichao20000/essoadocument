package cn.flying.rest.service.impl;

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

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.ISendReceiveFlowService;
import cn.flying.rest.service.utils.Condition;

/**
 * 文件收发流程实现类
 * 
 * @author gengqianfeng
 * 
 */
@Path("sendreceiveflow")
@Component
public class SendReceiveFlowServiceImpl extends BasePlatformService implements
    ISendReceiveFlowService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;

  @Override
  public HashMap<String, Object> addSendReceiveFlow(HashMap<String, Object> flow) {
    String sql = "insert into ess_fileflow(pId,name,status,typeNo,version,describtion,creater,createtime) values(?,?,?,?,?,?,?,?) ";
    try {
      Long id = query.insert(sql, new ScalarHandler<Long>(),
          new Object[] { flow.get("pid"), flow.get("name"), flow.get("status"),
              flow.get("typeNo"), flow.get("version"), flow.get("describtion"),
              flow.get("creater"), flow.get("createtime") });
      if (id == 0) {
        return null;
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", flow.get("ip"));
        log.put("userid", flow.get("userId"));
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：添加收发流程");
        log.put("loginfo", "添加【" + flow.get("name") + "】文件收发流程实例");
        this.getLogService().saveLog(log);

        flow.put("id", id);
        return flow;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public HashMap<String, Object> addTree(HashMap<String, Object> type) {
    String sql = "insert into ess_fileflow_type(pId,name,sort) values(?,?,?)";
    try {
      Long id = query.insert(sql, new ScalarHandler<Long>(), new Object[] {
          type.get("pid"), type.get("name"), type.get("sort") });
      if (id == 0) {
        return null;
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", type.get("ip"));
        log.put("userid", type.get("userId"));
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：添加收发类型");
        log.put("loginfo", "添加【" + type.get("name") + "】收发流程类型");
        this.getLogService().saveLog(log);

        type.put("id", id);
        return type;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String delSendReceiveFlow(Long[] ids, String userId, String ip) {
    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    String sql = "delete from ess_fileflow where id=? ";
    String idStr = "";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] { ids[i] };
        idStr += ids[i] + ",";
      }
      int[] row = query.batch(sql, params);
      if (row == null) {
        return "未发现收发流程";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：删除收发流程实例");
        log.put("loginfo", "删除标识为【" + idStr + "】文件流收发转流程实例");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除收发流程失败";
    }
  }

  @Override
  public String delTree(Long[] ids, String userId, String ip) {
    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    String sql = "delete from ess_fileflow_type where id=? ";
    String sqlFlow = "delete from ess_fileflow where pId=? ";
    String sqlSend = "delete from ess_filesend where pId=? ";
    String sqlReceive = "delete from ess_filereceive where pId=?";
    String idStr = "";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] { ids[i] };
        idStr += ids[i] + ",";
      }
      int[] row = query.batch(sql, params);
      int[] rowF = query.batch(sqlFlow, params);
      int[] rowS = query.batch(sqlSend, params);
      int[] rowR = query.batch(sqlReceive, params);
      if (row == null || rowF == null || rowS == null || rowR == null) {
        return "未发现收发流程类型";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：删除收发流程类型");
        log.put("loginfo", "删除标识为【" + idStr + "】文件收发流程类型列表");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除收发流程类型失败";
    }
  }

  @Override
  public String editMatrix(Map<String, Object> matrix) {
    long id = Long.parseLong(matrix.get("id").toString());
    String strMatrix = matrix.get("matrix").toString();
    String flowname= matrix.get("flowname")+"";
    String ip= matrix.get("ip")+"";
    String userId= matrix.get("userId")+"";

    String sql = "update ess_fileflow set status=?, flow_matrix=? where id=? ";
    try {
      int row = query.update(sql, new Object[] {
          (("[]".equals(strMatrix) || strMatrix == null) ? "关闭" : "发布"),
          strMatrix, id });
      if (row == 0) {
        return "未发现收发流程";
      } else {
        String status = "[]".equals(strMatrix) || strMatrix == null ? "关闭" : "发布";
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：定制流程分发矩阵");
        log.put("loginfo", "修改流程实例【" + flowname + "】的分发矩阵图,并修改流程状态为【"+status+"】");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "定制收发流程矩阵失败";
    }
  }

  @Override
  public List<Map<String, Object>> findSendReceiveFlowList(long page, long pre,
      long pid, String[] where) {
    try {
      List<Map<String, Object>> list = null;
      String sql = "select *  from ess_fileflow where 1=1 ";
      if (pid > 0) {
        sql = sql + " and pId=" + pid;
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
      } else {
        List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> map : list) {
          if (map.get("typeNo") != null) {
            Map<String, Object> stage = this.getStageByCode(map.get("typeNo")
                .toString());
            map.put("typeName",
                (stage.get("name") == null) ? "" : stage.get("name").toString());
            returnList.add(map);
          }
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
  public long getCount(long pid, String[] where) {
    String sql = "select count(id) from ess_fileflow as tb where 1=1 ";
    if (pid > 0) {
      sql = sql + " and pId=" + pid;
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

  @Override
  public List<Map<String, Object>> getPartByCode(String code) {
    String sql = "select * from ess_participatory where code in('" + code
        + "')";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
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
  public Map<String, Object> getSendReceiveFlowById(long id) {
    String sql = "select * from ess_fileflow where id=" + id;
    try {
      Map<String, Object> flow = null;
      flow = query.query(sql, new MapHandler());
      if (flow == null) {
        flow = new HashMap<String, Object>();
      }
      return flow;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getStageByCode(String code) {
    Map<String, Object> map = null;
    String sql = "select * from ess_document_stage where code= ? ";
    try {
      map = query.query(sql, new MapHandler(), new Object[] { code });
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public List<Map<String, Object>> getTree() {
    String sql = "select * from ess_fileflow_type order by pId ASC,sort ASC ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      Map<String, Object> mp = new HashMap<String, Object>();
      mp.put("id", 0);
      mp.put("pId", -1);
      mp.put("name", "文件收发流程类型");
      mp.put("sort", 1);
      list.add(0, mp);
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getTreeById(long id) {
    String sql = "select * from ess_fileflow_type where id=" + id;
    try {
      Map<String, Object> type = null;
      type = query.query(sql, new MapHandler());
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
  public String pubOrCloseFlow(HashMap<String, Object> flow) {
    String sql = "update ess_fileflow set status=?, modifyer=?, modifytime=?  where id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { flow.get("status"), flow.get("modifyer"),
              flow.get("modifytime"), flow.get("id") });
      if (row == 0) { 
        return "未发现收发流程";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", flow.get("ip"));
        log.put("userid", flow.get("userId"));
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：修改流程状态");
        log.put("loginfo", "修改流程【" + flow.get("name")+ "】发布状态为【"+flow.get("status")+"】");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return flow.get("status") + "收发流程失败";
    }
  }

  @Override
  public String updateSendReceiveFlow(HashMap<String, Object> flow) {
    String sql = "update ess_fileflow set name=?, typeNo=?, version=?, describtion=?, modifyer=?, modifytime=?  where id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { flow.get("name"), flow.get("typeNo"),
              flow.get("version"), flow.get("describtion"),
              flow.get("modifyer"), flow.get("modifytime"), flow.get("id") });
      if (row == 0) {
        return "未发现收发流程";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", flow.get("ip"));
        log.put("userid", flow.get("userId"));
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：修改定制流程");
        log.put("loginfo", "修改【" + flow.get("name") + "】文件收发程实例信息");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "修改收发流程失败";
    }
  }

  @Override
  public String updateTree(HashMap<String, Object> type) {
    String sql = "update ess_fileflow_type set pId=?, name=?, sort=? where id=? ";
    try {
      int row = query.update(sql,
          new Object[] { type.get("pid"), type.get("name"), type.get("sort"),
              type.get("id") });
      if (row == 0) {
        return "未发现收发流程类型";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", type.get("ip"));
        log.put("userid", type.get("userId"));
        log.put("module", "定制文件收发流程");
        log.put("operate", "定制文件收发流程：修改文件收发类型");
        log.put("loginfo", "修改【" + type.get("name") + "】文件收发类型");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "修改收发流程类型失败";
    }
  }

  @Override
  public List<Map<String, Object>> getTreeByParentName(Map<String, Object> param) {
    
    return null;
  }
  
  @Override
  public long uniqueName(HashMap<String, String> map) {
    try {
      String sql = "";
      long pId = Long.valueOf(map.get("pId"));
      String name = map.get("name");
      if(map.get("type").equals("type")){
        sql = "select count(id) from ess_fileflow_type where (pId="+pId+" or id = "+pId+") and name='"+name+"'";
      }else if(map.get("type").equals("flow")){
        sql = "select count(id) from ess_fileflow where pId="+pId+" and name='"+name+"'";
      }
      long cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt > 0) {
        return cnt;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }
  
}
