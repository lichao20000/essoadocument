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
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IDocumentTypeService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.JdbcUtil;

/**
 * 文件类型代码
 * 
 * @author xuekun
 *
 */
@Path("documentType")
@Component
public class DocumentTypeServiceImpl extends BasePlatformService implements IDocumentTypeService {
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
    String sql = "insert into ess_document_type (typeName,typeNo,participatoryId) values(?,?,?)";
    Object[] params = {map.get("typeName").toString().trim(), map.get("typeNo"), map.get("participatoryId")};
    Long id = JdbcUtil.insert(query, sql, params);
    if (id == null) {
      return null;
    } else {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "文件类型代码");
      log.put("operate", "文件类型代码：添加文件类型代码");
      log.put("loginfo", "添加【" + map.get("typeName") + "】文件类型代码");
      this.getLogService().saveLog(log);

      map.put("id", id);
      return map;
    }
  }

  @Override
  public String delete(Long[] ids, String userId, String ip) {

    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    String sql = "delete from ess_document_type where id=?";
    String idStr = "";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] {ids[i]};
        idStr += ids[i] + ",";
      }
      int[] row = query.batch(sql, params);
      if (row == null) {
        return "未发现文件类型代码";
      } else {
        // 日志添加
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "文件类型代码");
        log.put("operate", "文件类型代码：删除文件类型代码");
        log.put("loginfo", "删除标识为【" + idStr + "】的文件类型代码");
        this.getLogService().saveLog(log);

        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除文件类型代码失败";
    }
  }

  @Override
  public Map<String, Object> get(Long id) {
    String sql = "select * from ess_document_type where id=?";
    Object[] params = {id};
    return JdbcUtil.query(query, sql, new MapHandler(), params);
  }

  @Override
  public long getCount(HashMap<String, Object> map) {
    String sql = "select count(*) from ess_document_type where 1=1 ";
    List<Object> params = new ArrayList<Object>();
    if (map.get("participatoryId")!=null && !"".equals(map.get("participatoryId"))) {
        sql += " and find_in_set(participatoryId,'"+map.get("participatoryId")+"')";
    }
    if (null != map.get("keyWord") && !StringUtils.isEmpty(map.get("keyWord").toString())) {
      sql += " and( typeName like ?  or typeNo like ?  )";
      params.add("%" + map.get("keyWord") + "%");
      params.add("%" + map.get("keyWord") + "%");
    }
    try {
      Object cnt = query.query(sql, new ScalarHandler<Integer>(),params.toArray());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0l;
  }

  @Override
  public List<Map<String, Object>> list(Integer page, Integer rp, HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    String sql = "select * from ess_document_type where 1=1 ";
    List<Object> params = new ArrayList<Object>();
    if (map.get("participatoryId")!=null && !"".equals(map.get("participatoryId"))) {
      sql += " and find_in_set(participatoryId,'"+map.get("participatoryId")+"')";
    }
    
    if (null != map.get("keyWord") && !StringUtils.isEmpty(map.get("keyWord").toString())) {
      sql += " and( typeName like ?  or typeNo like ?  )";
      params.add("%" + map.get("keyWord") + "%");
      params.add("%" + map.get("keyWord") + "%");
    }
    if (null != page && null != rp) {
      int start = (page - 1) * rp;
      sql = sql + " limit ?,?";
      params.add(start);
      params.add(rp);
    }

    list = JdbcUtil.query(query, sql, new MapListHandler(),params.toArray());
    if (list == null) {
      list = new ArrayList<Map<String, Object>>();
    }
    return list;
  }

  @Override
  public String update(HashMap<String, String> map) {
    try {
      String sql = "update ess_document_type set typeName=?,typeNo=? where id=?";
      Object[] params = {map.get("typeName").toString().trim(), map.get("typeNo"), map.get("id")};
      int row = query.update(sql, params);
      if (row == 0) {
        return "未发现文件类型代码";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", map.get("ip"));
        log.put("userid", map.get("userId"));
        log.put("module", "文件类型代码");
        log.put("operate", "文件类型代码：修改文件类型代码");
        log.put("loginfo", "修改标识为【" + map.get("id") + "】文件类型代码信息");
        this.getLogService().saveLog(log);

        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "更新文件类型代码失败";
    }
  }
  
  /***
   * 唯一验证
   * @param map
   * @return
   */
  public long uniqueTypeNo(Map<String, Object> map){
    try {
        String sql = "select count(id) from ess_document_type where binary typeNo = ? and participatoryId = ?";
        long num = query.query(sql, new ScalarHandler<Long>(), new Object[] {
          map.get("typeNo"), map.get("participatoryId") 
        });
        if(num > 0){
          return num;
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
      return 0;
  }

}
