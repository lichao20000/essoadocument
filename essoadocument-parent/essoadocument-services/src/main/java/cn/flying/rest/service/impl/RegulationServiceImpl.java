package cn.flying.rest.service.impl;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.ArrayHandler;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IRegulationService;
import cn.flying.rest.service.entiry.Regulation;
import cn.flying.rest.service.utils.ConvertUtil;

/**
 * 规定规范
 * 
 * @author xie
 * 
 */
@Path("regulation")
@Component
public class RegulationServiceImpl extends BasePlatformService implements IRegulationService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  private String instanceId ;
  
  @Value("${app.InstanceId}")
  public void setInstanceId(String instanceId) {
      this.instanceId = instanceId;
  }
    
  public String getInstanceId(){
      return this.instanceId ;
  }
  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }
  @Override
  public long getCount() {
    String sql = "select count(1) from ess_regulation";
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
  public String add(HashMap<String, Object> regulation) {
    String sql = "insert into ess_regulation values(null,?,?,?,?,?,?)";
    int rows = 0;
    Object[] param =
        {regulation.get("no"), regulation.get("chineseName"), regulation.get("englishName"),
            regulation.get("publishTime"), regulation.get("filePath"), regulation.get("fileName")};
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
    log.put("ip", regulation.get("ip"));
    log.put("userid", regulation.get("userId"));
    log.put("module", "规定规范");
    log.put("operate", "规定规范：文件添加");
    log.put("loginfo", "添加编号为【"+regulation.get("no")+"】的规定规范文件");
    this.getLogService().saveLog(log);
    return "success";
  }

  @Override
  public String delete(String userId,String ip,Long[] ids) {
    String sql = "delete from ess_regulation where id=?";
    if (ids == null || ids.length == 0) {
      return "error";
    }
    int[] rows = null;
    String idStr= "";
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
    log.put("ip",ip);
    log.put("userid", userId);
    log.put("module", "规定规范");
    log.put("operate", "规定规范：删除规范");
    log.put("loginfo", "删除标识为【"+idStr+"】的规定规范");
    this.getLogService().saveLog(log);
    return "success";
  }

  @Override
  public String update(HashMap<String, Object> regulation) {
    String sql =
        "update ess_regulation set no=?,chineseName=?,englishName=?,publishTime=?,filePath=?,fileName=? where id=?";
    int rows = 0;
    Object[] param =
        {regulation.get("no"), regulation.get("chineseName"), regulation.get("englishName"),
            regulation.get("publishTime"), regulation.get("filePath"), regulation.get("fileName"),
            regulation.get("id")};
    try {
      rows = query.update(sql, param);
    } catch (SQLException e) {
      e.printStackTrace();
      return "exception";
    }
    if (rows == 0)
      return "error";
    Map<String,Object> log = new HashMap<String,Object>();
    log.put("ip", regulation.get("ip"));
    log.put("userid", regulation.get("userId"));
    log.put("module", "规定规范");
    log.put("operate", "规定规范：文件修改");
    log.put("loginfo", "修改文件标识为【"+regulation.get("id")+"】的规定规范文件");
    this.getLogService().saveLog(log);
    return "success";
  }

  @Override
  public List<Map<String, Object>> list(HashMap<String, Object> condition) {
    String sql = "select * from ess_regulation ";
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
  public Regulation getRegulationById(Long id) {
    String sql = "select * from ess_regulation where id = ?";
    Regulation regulation = null;
    try {
      regulation = query.query(sql, new BeanHandler<Regulation>(Regulation.class), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return regulation;
  }

  /**
   * xiewenda
   * 
   * @see 此方法将过滤的条件字符串转化为sql语句字符串
   * @param condition 按照一定规则拼接的过滤条件的字符串 例如：'id,equels,11,and & name,like,aa,or'
   * @param Sep1 第一层分割符 例如 &
   * @param Sep2 第二层分割符 例如 ,
   * @return sql语句字符串 例如：where id=11 and name like '%aa%'
   */
  public String conditonToSql(String condition, String Sep1, String Sep2) {
    if (condition == null || "".equals(condition))
      return "";
    String[] where = condition.split(Sep1);
    StringBuilder sb = new StringBuilder("where ");
    for (String str : where) {
      String[] arr = str.split(Sep2);
      sb.append(arr[0]);
      if ("equal".equals(arr[1])) {
        sb.append(" = ");
        sb.append("'" + arr[2] + "'");
      } else if ("greaterThan".equals(arr[1])) {
        sb.append(" > ");
        sb.append("'" + arr[2] + "'");
      } else if ("lessThan".equals(arr[1])) {
        sb.append(" < ");
        sb.append("'" + arr[2] + "'");
      } else if ("notEqual".equals(arr[1])) {
        sb.append(" != ");
        sb.append("'" + arr[2] + "'");
      } else if ("greaterEqual".equals(arr[1])) {
        sb.append(" >= ");
        sb.append("'" + arr[2] + "'");
      } else if ("lessEqual".equals(arr[1])) {
        sb.append(" <= ");
        sb.append("'" + arr[2] + "'");
      } else if ("like".equals(arr[1])) {
        sb.append(" like");
        sb.append(" '%" + arr[2] + "%' ");
      } else if ("notLike".equals(arr[1])) {
        sb.append(" not like");
        sb.append(" '%" + arr[2] + "%' ");
      }
      sb.append(" " + arr[3] + " ");
    }
    return sb.toString().substring(0, sb.toString().length() - 4);
  }

  @Override
  public List<Map<String, Object>> getRegulationByCondition(HashMap<String, Object> param) {
    String sql = "select * from ess_regulation where 1=1";
    List<Map<String, Object>> result = null;

    if (param.get("condition") != null) {
      String condition = (String) param.get("condition");
      // 此方法将过滤条件转换为sql语句 返回拼接后sql的字符串
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql += " and " +where;
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
  public Response download(String rootDir, String filePath, String fileName) {
    String fullPath = rootDir.replaceAll("-", "/") + filePath.replaceAll("-", "/");
    // "D:-soft-eclipse4.3.2-workspace-ESDOCUMENT-html-files-esdocument-20141113-2014111316040735.jpg";
    try {
      fileName = URLEncoder.encode(fileName, "UTF-8");
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    File f = new File(fullPath);
    if (f.isFile() && f.exists()) {
      return Response.ok(new File(fullPath))
          .header("Content-Disposition", "attachment;filename=\"" + fileName + "\"")
          .header("Content-Length", f.length()).build();
    } else {
      return Response.ok("not found").status(404).build();
    }
  }

  @Override
  public List<Map<String, Object>> getRegulationQuery(HashMap<String, Object> param) {
    String sql = "select * from ess_regulation ";
    List<Map<String, Object>> result = null;

    if (param.get("searchValue") != null && !"null".equals(param.get("searchValue"))) {
      String searchValue = (String) param.get("searchValue");
      sql =
          sql + "where no like '%" + searchValue + "%' or chineseName like '%" + searchValue
              + "%' or englishName like '%" + searchValue + "%'";
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
    String sql = "select count(1) from ess_regulation where 1=1";
    Long num = 0L;
    if (param.get("condition") != null) {
      String condition = (String) param.get("condition");
      // 此方法将过滤条件转换为sql语句 返回拼接后sql的字符串
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql +=" and "+ where;
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
  public long getCountBySearch(HashMap<String, Object> param) {
    String sql = "select count(1) from ess_regulation ";
    if (param.get("searchValue") != null && !"null".equals(param.get("searchValue"))) {
      String searchValue = (String) param.get("searchValue");
      sql =
          sql + "where no like '%" + searchValue + "%' or chineseName like '%" + searchValue
              + "%' or englishName like '%" + searchValue + "%'";
    }
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
  public String deleteFile(HashMap<String, Object> param) {
    String rootDir =((String)param.get("rootDir")).replaceAll("\\\\", "/");
    String filePath = (String) param.get("filePath");
    String id = (String)param.get("id");
    File f = new File(rootDir + filePath);
    boolean flag = false;
    if (f.isFile() && f.exists()) {
      flag = f.delete();
    }
    //如果有id就是编辑功能删除文件，需要修改表记录信息。如果没有id就是添加删除文件，不需要修改表记录信息
    if (id != null && !"null".equals(id)) {
      if (flag) {
        int num = 0;
        String sql = "update ess_regulation set filePath=null,fileName=null where id=?";
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
  public String getServiceIP() {
    String url = this.getNamingService().findApp(this.getInstanceId(),"regulation", this.getServiceId(),
        this.getToken());                                          
      return url;
  }
  
  /***
   * 判断重复
   * @param regulationNo
   * @return
   */
  public long uniqueNo(String regulationNo){
    try {
        String sql = "select count(id) from ess_regulation where binary no='"
            + regulationNo + "'";
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
