package cn.flying.rest.service.impl;

import java.io.File;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ArrayHandler;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IStandarddocumentService;
import cn.flying.rest.service.entiry.Standarddocument;
import cn.flying.rest.service.utils.ConvertUtil;

/**
 * 标准文件实现类
 * 
 * @author xie
 * 
 */
@Path("standarddocument")
@Component
public class StandarddocumentServiceImpl extends BasePlatformService implements
    IStandarddocumentService {

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
  public long getCount() {
    String sql = "select count(1) from ess_standarddocument";
    Long num = 0L;
    try {
      num = query.query(sql, new ScalarHandler<Long>());
    } catch (SQLException e) {
      e.printStackTrace();
      return num;
    }
    return num;
  }

  @Override
  public String add(HashMap<String, Object> standard) {
    String sql = "insert into ess_standarddocument values(null,?,?,?,?,?,?,?)";
    int rows = 0;
    Object[] param =
        {standard.get("no"), standard.get("chineseName"), standard.get("description"),
            standard.get("filePath"), standard.get("fileName"), standard.get("regulation_id"),
            standard.get("regulation_name")};
    try {
      rows = query.update(sql, param);
    } catch (SQLException e) {
      e.printStackTrace();
      return "execption";
    }
    if (rows == 0) {
      return "error";
    }
    Map<String,Object> log = new HashMap<String,Object>();
    log.put("ip", standard.get("ip"));
    log.put("userid", standard.get("userId"));
    log.put("module", "标准文件");
    log.put("operate", "标准文件：文件添加");
    log.put("loginfo", "添加编号为【"+standard.get("no")+"】的标准文件");
    this.getLogService().saveLog(log);
    return "success";
  }

  @Override
  public String delete(String userId,String ip,Long[] ids) {
    String sql = "delete from ess_standarddocument where id=?";
    if (ids == null || ids.length == 0) {
      return "error";
    }
    int[] rows = null;
    String idStr = "";
    Object[][] params = new Object[ids.length][];
    for (int i = 0; i < ids.length; i++) {
      params[i] = new Object[] {ids[i]};
      idStr+=ids[i]+",";
    }
    try {
      rows = query.batch(sql, params);
    } catch (SQLException e) {
      e.printStackTrace();
      return "exception";
    }
    if (rows == null) {
      return "error";
    }
    Map<String,Object> log = new HashMap<String,Object>();
    log.put("ip", ip);
    log.put("userid", userId);
    log.put("module", "标准文件");
    log.put("operate", "标准文件：文件删除");
    log.put("loginfo", "删除标识为【"+idStr+"】的标准文件");
    this.getLogService().saveLog(log);
    return "success";
  }

  @Override
  public String update(HashMap<String, Object> standard) {
    String sql =
        "update ess_standarddocument set no=?,chineseName=?,description=?,filePath=?,fileName=?,regulation_id=?,regulation_name=? where id=?";
    int rows = 0;
    Object[] param =
        {standard.get("no"), standard.get("chineseName"), standard.get("description"),
            standard.get("filePath"), standard.get("fileName"), standard.get("regulation_id"),
            standard.get("regulation_name"), standard.get("id")};
    try {
      rows = query.update(sql, param);
    } catch (SQLException e) {
      e.printStackTrace();
      return "exception";
    }
    if (rows == 0)
      return "error";
    Map<String,Object> log = new HashMap<String,Object>();
    log.put("ip", standard.get("ip"));
    log.put("userid", standard.get("userId"));
    log.put("module", "标准文件");
    log.put("operate", "标准文件：修改");
    log.put("loginfo", "修改标识为【"+standard.get("id")+"】的标准文件");
    this.getLogService().saveLog(log);
    return "success";
  }

  @Override
  public List<Map<String, Object>> list(HashMap<String, Object> condition) {
    String sql = "select * from ess_standarddocument ";
    List<Map<String, Object>> result = null;
    if (condition.get("page") != null && condition.get("pre") != null) {
      sql += "limit " + condition.get("page") + ", " + condition.get("pre");
    }
    try {
      result = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return result;
  }

  @Override
  public Standarddocument getStandardById(Long id) {
    String sql = "select * from ess_standarddocument where id = ?";
    Standarddocument standard = null;
    try {
      standard = query.query(sql, new BeanHandler<Standarddocument>(Standarddocument.class), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return standard;
  }

  @Override
  public List<Map<String, Object>> getStandardByCondition(HashMap<String, Object> param) {
    String sql = "select * from ess_standarddocument where 1=1 ";
    List<Map<String, Object>> result = null;

    if (param.get("condition") != null) {
      String condition = (String) param.get("condition");
      // 此方法将过滤条件转换为sql语句 返回拼接后的条件sql的字符串
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql += " and "+where;
    }
    if (param.get("page") != null && param.get("pre") != null) {
      sql += " limit " + param.get("page") + ", " + param.get("pre");
    }
    try {
      result = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return result;
  }

  @Override
  public long getCountByCondition(HashMap<String, Object> param) {
    String sql = "select count(1) from ess_standarddocument where 1=1 ";
    Long num = 0L;
    if (param.get("condition") != null) {
      String condition = (String) param.get("condition");
      // 此方法将过滤条件转换为sql语句 返回拼接后sql的字符串
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql += " and "+where;
    }
    try {
      num = query.query(sql, new ScalarHandler<Long>());
    } catch (SQLException e) {
      e.printStackTrace();
      return num;
    }
    return num;
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
    // 如果有id就是编辑功能时删除文件，需要修改表记录信息。如果没有id就是添加时删除文件，不需要修改表记录信息
    if (id != null && !"null".equals(id)) {
      if (flag) {
        int num = 0;
        String sql = "update ess_standarddocument set filePath=null,fileName=null where id=?";
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

  /***
   * 判断重复
   * @param standardDocumentNo
   * @return
   */
  public long uniqueNo(String standardDocumentNo){
    try {
        String sql = "select count(id) from ess_standarddocument where binary no='"
            + standardDocumentNo + "'";
        Object[] cnt = query.query(sql, new ArrayHandler());
        if (cnt != null && cnt.length == 1) {
          return Long.parseLong(cnt[0].toString());
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
      return 0;
  }
}
