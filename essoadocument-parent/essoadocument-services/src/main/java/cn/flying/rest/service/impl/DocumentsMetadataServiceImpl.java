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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IDocumentStageService;
import cn.flying.rest.service.IDocumentsMetadataService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.JdbcUtil;
import cn.flying.rest.service.utils.VALUETYPES;

/**
 * 文件元数据和系统元数据
 * 
 * @author xuekun
 *
 */
@Path("documentsMetadata")
@Component
public class DocumentsMetadataServiceImpl extends BasePlatformService implements
    IDocumentsMetadataService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }
  public IDocumentStageService documentStageServiceImpl;
  
  public IDocumentStageService getDocumentStageServiceImpl() {
    return documentStageServiceImpl;
  }
  
  @Resource
  public void setDocumentStageServiceImpl(IDocumentStageService documentStageServiceImpl) {
    this.documentStageServiceImpl = documentStageServiceImpl;
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


  @Override
  public HashMap<String, Object> add(HashMap<String, Object> map) {
    String sql =
        "insert into ess_document_metadata (name,code,type,length,dotLength,defaultValue,stageId,isSystem,isNull,metaDataId,esidentifier) values(?,?,?,?,?,?,?,?,?,?,?)";
    Object[] params =
        {
            map.get("name").toString().trim(),
            map.get("code").toString().trim(),
            map.get("type"),
            map.get("length"),
            map.get("dotLength"),
            map.get("defaultValue"),
            map.get("stageId"),
            map.get("isSystem"),
            map.get("isNull"),
            StringUtils.isEmpty(String.valueOf(map.get("metaDataId"))) ? null : map
                .get("metaDataId"),
            StringUtils.isEmpty(String.valueOf(map.get("esidentifier"))) ? null : map
                .get("esidentifier")};
    Long id = JdbcUtil.insert(query, sql, params);
    if (id == null) {
      return null;
    } else {
      map.put("id", id);
      addColumn(map);// 添加字段到相应临时表
      
      Map<String,Object> log = new HashMap<String,Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "文件元数据");
      log.put("operate", "文件元数据：添加元数据");
      log.put("loginfo", "添加【"+ map.get("name")+"】元数据字段");
      this.getLogService().saveLog(log);
      return map;
    }
  }



  private boolean addColumn(HashMap<String, Object> map) {
    String tableName = "ess_document";// 系统元数据表
    String type =
        JdbcUtil.getColumnType(VALUETYPES.TYPE.valueOf(map.get("type").toString()),
            String.valueOf(map.get("length")), String.valueOf(map.get("dotLength")));
    if (map.containsKey("stageId")) {
      List<Map<String, Object>> list =
          getChildList(Long.parseLong(String.valueOf(map.get("stageId"))));
      for (Map<String, Object> dataMap : list) {
        tableName = "esp_" + dataMap.get("id");
        if (!judgeIfExistsTable(tableName)) {// 判断是否存在动态表 不存在则创建
          createStructureTable(String.valueOf(dataMap.get("id")));// 创建动态表
        }
        saveColumn(tableName, map.get("code").toString().trim(), type);
      }
    } else {
      saveColumn(tableName, map.get("code").toString().trim(), type);
    }
    return true;
  }

  @Override
  public String addDocNoRule(Map<String, String> params) {
    String flag = "false";
    if (StringUtils.isEmpty(params.get("id"))) {
      String sql = " insert into ess_rule_docno(stageId,tagids,serialNum) values(?,?,?)";
      try {
        Long id =
            query.insert(sql, new ScalarHandler<Long>(), new Object[] {params.get("stageId"),
                params.get("tagids"),1});
        if (id != null) {
          flag = "true";
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
    } else {
      String sql1 = "select tagids,serialNum from ess_rule_docno where stageId=?";
      String sql = "update ess_rule_docno set stageId=?,tagids=?,serialNum=? where id=?";
      try {
        Map<String,Object> map = query.query(sql1, new MapHandler(), new Object[] {params.get("stageId")});
        int row = 0;
        if(map.get("tagids")!=null && !"".equals(map.get("tagids").toString()) && !"null".equals(map.get("tagids").toString()) && map.get("tagids").equals(params.get("tagids"))){
            long num = Long.valueOf(map.get("serialNum").toString());
            row = query.update(sql,
                  new Object[] {params.get("stageId"), params.get("tagids"),num, params.get("id")});
        }else{
          row = query.update(sql,
              new Object[] {params.get("stageId"), params.get("tagids"),0, params.get("id")});
        }
        if (row != 0) {
          flag = "true";
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
    return flag;
  }

  private boolean changeColumn(String tableName, String oldCode, String newCode, String type) {
    String sql =
        "alter table " + tableName + " change column " + oldCode + " " + newCode + " " + type;
    boolean flag = false;
    try {
      int row = query.update(sql);
      if (row != 0) {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  private boolean createStructureTable(String id) {
    // 创建结构表
    StringBuilder esp_n = new StringBuilder();
    esp_n.append(" create table if not exists  esp_" + id + " (");
    esp_n.append(" id int(11) NOT NULL AUTO_INCREMENT, ");
    esp_n.append(" documentId int(11),");
    esp_n.append(" PRIMARY KEY (id), ");
    esp_n.append(" CONSTRAINT `PK_ESP_");
    esp_n.append(id);
    esp_n.append("_DOCUMENT_ID`");
    esp_n.append(" FOREIGN KEY (`documentId`) REFERENCES `ess_document` (`id`) ");
    esp_n.append(" ON DELETE CASCADE ON UPDATE CASCADE");
    esp_n.append(") ENGINE=InnoDB DEFAULT CHARSET=utf8");

    boolean result = JdbcUtil.update(query, esp_n.toString());// 暂不创建模拟序列

    return result;
  }

  @Override
  public String delete(Long[] ids,String userId,String ip) {
    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    String sql = "delete from ess_document_metadata where id=?";
    String idStr = "";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        deleteColumn(ids[i]);
        params[i] = new Object[] {ids[i]};
        idStr += ids[i]+",";
      }
      int[] row = query.batch(sql, params);
      if (row == null) {
        return "未发现元数据";
      } else {
        Map<String,Object> log = new HashMap<String,Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "文件元数据");
        log.put("operate", "文件元数据：删除元数据");
        log.put("loginfo", "删除标识为【"+ idStr+"】的装置单元");
        this.getLogService().saveLog(log);
        
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除元数据失败";
    }
  }

  private boolean deleteColumn(Long id) {
    Map<String, Object> metadata = get(id);
    String tableName = "ess_document";
    boolean flag = true;
    if ("1".equals(metadata.get("isSystem"))) {// 系统元数据
      List<Map<String, Object>> list =
          getChildList(Long.parseLong(String.valueOf(metadata.get("stageId"))));
      for (Map<String, Object> dataMap : list) {
        tableName = "esp_" + dataMap.get("id");
        if (!judgeIfExistsTable(tableName)) {
          continue;
        }
        JdbcUtil.update(query, "alter table " + tableName + " drop column " + metadata.get("code"));
      }

    } else {

      JdbcUtil.update(query, "alter table " + tableName + " drop column " + metadata.get("code"));
    }
    return flag;
  }

  @Override
  public Map<String, Object> get(Long id) {
    String sql = "select * from ess_document_metadata where id=?";
    Object[] params = {id};
    return JdbcUtil.query(query, sql, new MapHandler(), params);
  }

  private List<Map<String, Object>> getChildList(Long stageId) {
    Map<String, Object> dataMap = getDocumentStageId(stageId);
    List<Map<String, Object>> list = null;
    if (StringUtils.equals("0", (String) dataMap.get("isnode"))) {
      list = new ArrayList<Map<String, Object>>();
      list.add(dataMap);
    } else {
      String sql = "select * from ess_document_stage where isnode=0 and id_seq like ? or id = ? ";
      Object[] params = {dataMap.get("id_seq") + "" + dataMap.get("id") + ".%", dataMap.get("id") + ""};
      try {
        list = query.query(sql, new MapListHandler(), params);
        if (list == null) {
          list = new ArrayList<Map<String, Object>>();
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
    return list;

  }

  @Override
  public long getCount(HashMap<String, Object> map) {
    String sql = "select count(*) from ess_document_metadata where 1=1 ";
    if (null != map.get("stageId") && !"".equals(map.get("stageId"))) {
      sql += " and  stageId=" + map.get("stageId");
    }
    if (null != map.get("isSystem") && !"".equals(map.get("isSystem"))) {
      sql += " and  isSystem=" + map.get("isSystem");
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("where");
    if (null != where && where.size() != 0) {
      Condition cond = Condition.getConditionByList(where);
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

  private Map<String, Object> getDocNoRule(Long stageId) {
    String sql = "select  * from ess_rule_docno where stageId= ? ";
    Map<String, Object> map = null;
    try {
      map = query.query(sql, new MapHandler(), new Object[] {stageId});
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public Map<String, Object> getDocRule(Long stageId) {
    Map<String, Object> rule = new HashMap<String, Object>();
    Map<String, Object> docNoRule = getDocNoRule(stageId);
    if (docNoRule.containsKey("tagids")) {
      String tagids = (String) docNoRule.get("tagids");
      rule.put("tagids", tagids);
      String[] tags = tagids.split(",");
      StringBuilder tagBuilders = new StringBuilder();
      List<Map<String, Object>> hmList = getParentList(stageId);
      for (int i = 0; i < tags.length; i++) {
        String tag = tags[i];
        if (tag.indexOf("true") > -1) {
          for (Map<String, Object> map : hmList) {
            if (StringUtils.equals(String.valueOf(map.get("id")), tag.split("\\|")[0])) {
              tagBuilders.append(String.valueOf(map.get("name"))).append("|true,");
              break;
            }
          }
        } else {
          tagBuilders.append(tag).append(",");
        }
      }
      String tagtexts = tagBuilders.toString();
      if (!StringUtils.isEmpty(tagtexts)) {
        tagtexts = tagtexts.substring(0, tagtexts.lastIndexOf(","));
      }
      rule.put("tagtexts", tagtexts);
      rule.put("id", docNoRule.get("id"));
    } else {
      rule.put("tagtexts", "");
      rule.put("tagids", "");
      rule.put("id", "");
    }
    return rule;
  }

  private Map<String, Object> getDocumentStageId(Long stageId) {
    String sql = "select * from ess_document_stage where id=?";
    Object[] params = {stageId};
    return JdbcUtil.query(query, sql, new MapHandler(), params);
  }

  private List<Map<String, Object>> getParentList(Long stageId) {
    List<Map<String, Object>> list = null;
    String sql =
        " select * from ess_document_metadata m where exists "
            + " ( select 1 from ess_document_stage a where exists "
            + " ( select 1 from ess_document_stage b where find_in_set( a.id, replace (b.id_seq, '.', ',')) "
            + " or a.id = b.id and b.id = ? ) and m.stageid = a.id or( m.stageId is null and m.isSystem= 0 ) ) ";
    Object[] params = {stageId};
    try {
      list = query.query(sql, new MapListHandler(), params);
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return list;

  }

  @Override
  public List<Map<String, Object>> getStageFieldToAdd(long id) {
    List<Map<String, Object>> left = new ArrayList<Map<String, Object>>();
    List<Map<String, Object>> allMataList = getParentList(id);
    Map<String, Object> dataMap = null;
    for (Map<String, Object> mataMap : allMataList) {
      //如果是文件编码就不作为编码规则字段了
      if("docNo".equals(mataMap.get("code")+""))continue;
      // rongying 20150428 后添加的收集范围名称等元数据字段不作为编码规则字段
      if("stageName".equals(mataMap.get("code")+"") || "deviceName".equals(mataMap.get("code")+"") || 
          "participatoryName".equals(mataMap.get("code")+"") || "documentTypeName".equals(mataMap.get("code")+"") || 
          "engineeringName".equals(mataMap.get("code")+"") || "stageId".equals(mataMap.get("code")+"")){
        continue;
      }
      dataMap = new HashMap<String, Object>();
      dataMap.put("name", mataMap.get("code"));
      dataMap.put("display", mataMap.get("name"));
      dataMap.put("tagId", mataMap.get("id"));
      left.add(dataMap);
    }
    return left;
  }

  private boolean judgeIfExistsTable(String tableName) {
    String databaseName = this.getUrl();
    String sql = " select count(1) cnt from information_schema.tables where table_name=? and table_schema='"+databaseName+"'";
    boolean flag = false;
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {tableName});
      if (cnt != null && !cnt.equals(Long.valueOf(0l))) {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  @Override
  public List<Map<String, Object>> list(Integer page, Integer rp, HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    String sql = "select * from ess_document_metadata where 1=1 ";
    if (null != map.get("stageId") && !"".equals(map.get("stageId"))) {
      sql += " and  stageId=" + map.get("stageId");
    }
    if (null != map.get("isSystem") && !"".equals(map.get("isSystem"))) {
      sql += " and  isSystem=" + map.get("isSystem");
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

  private boolean modifyColumn(String tableName, String code, String type) {
    String sql = "alter table " + tableName + " modify column " + code + " " + type;
    boolean flag = true;
    try {
      int row = query.update(sql);
      if (row != 0) {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      flag = false;
    }
    return flag;
  }

  private void saveColumn(String tableName, String code, String type) {
    StringBuilder sql = new StringBuilder();
    sql.append("alter table ");
    sql.append(tableName);
    sql.append(" add column ");
    sql.append(code);
    sql.append(" ");
    sql.append(type);
    JdbcUtil.update(query, sql.toString());
  }

  @Override
  public String update(HashMap<String, String> map) {
    try {
      String sql =
          "update ess_document_metadata set name=?,code=?,type=?,length=?,dotLength=?,defaultValue=?,stageId=?,isSystem=?,isNull=? , metaDataId=? ,esidentifier = ? where id=?";
      Object[] params =
          {
              map.get("name"),
              map.get("code"),
              map.get("type"),
              map.get("length"),
              map.get("dotLength"),
              map.get("defaultValue"),
              map.get("stageId"),
              map.get("isSystem"),
              map.get("isNull"),
              StringUtils.isEmpty(String.valueOf(map.get("metaDataId"))) ? null : map
                  .get("metaDataId"),
              StringUtils.isEmpty(String.valueOf(map.get("esidentifier"))) ? null : map
                  .get("esidentifier"), map.get("id")};
      String sql1 = "select type from ess_document_metadata where id = "+map.get("id");
      String type = query.query(sql1, new ScalarHandler<String>());
      if(type!=null){
        if(!updateColumn(map)){//rongying 20150428表字段类型修改为另一个报异常
          return "元数据类型转换失败，不能转换为此类型！";
        }
      }
      int row = query.update(sql, params);
      if (row == 0) {
        return "未发现元数据！";
      } else {
        Map<String,Object> log = new HashMap<String,Object>();
        log.put("ip", map.get("ip"));
        log.put("userid", map.get("userId"));
        log.put("module", "文件元数据");
        log.put("operate", "文件元数据：修改元数据");
        log.put("loginfo", "修改元数据标识为【"+ map.get("id")+"】元数据信息");
        this.getLogService().saveLog(log);
        
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  private boolean updateColumn(HashMap<String, String> map) {
    Map<String, Object> metadata = get(Long.parseLong(map.get("id")));
    String type =
        JdbcUtil.getColumnType(VALUETYPES.TYPE.valueOf(map.get("type").toString()),
            String.valueOf(map.get("length")), String.valueOf(map.get("dotLength")));
    String tableName = "ess_document";// 系统元数据表
    boolean flag = true;
    if (map.containsKey("stageId")) {
      List<Map<String, Object>> list =
          getChildList(Long.parseLong(String.valueOf(map.get("stageId"))));
      for (Map<String, Object> dataMap : list) {
        tableName = "esp_" + dataMap.get("id");
        if (!judgeIfExistsTable(tableName)) {
          continue;
        }
        if (((String) metadata.get("code")).equals(map.get("code"))) {
          modifyColumn(tableName, (String) map.get("code"), type);
        } else {
          changeColumn(tableName, (String) metadata.get("code"), (String) map.get("code"), type);
        }
      }
    } else {
      if (((String) metadata.get("code")).equals(map.get("code"))) {
        flag = modifyColumn(tableName, (String) map.get("code"), type);
      } else {
        flag =
            changeColumn(tableName, (String) metadata.get("code"), (String) map.get("code"), type);
      }
    }

    return flag;
  }
  @Override
  public String checkedMetadataExists(Map<String, Object> param) {
    //判断元数据是否存在 分为俩种情况 系统字段和节点字段
    //系统字段在添加修改与所有元数据都不能同名同代码
    //节点字段 与所有父子节点以及系统字段不能同名同代码
    String type = param.get("type")+"";//字段名 name或code
    String value = param.get("value")+"";//字段值
    String id = param.get("id")+"";
    String isSystem = param.get("isSystem")+"";
    String stageId = param.get("stageId")+"";
    String sql = "select count(*) from ess_document_metadata where 1=1";
    try {
    if("0".equals(isSystem)){
      //系统字段
        if(!"".equals(id)){
          //编辑判断
          sql += " and "+type+"=? and id!="+id;
        }else{
          //添加判断
          sql+=" and "+type+"=? ";
        }
    }else{
      //节点字段
      //获得当前节点所有父子节点的 stageId
     String stageIds = documentStageServiceImpl.getStageChildAndParentIds(stageId);
     if(!"".equals(id)){
       //编辑判断
       sql += " and "+type+"=? and (isSystem =0 or stageId in("+stageIds+")) and id!="+id;
     }else{
       //添加判断
       sql+=" and "+type+"=? and (isSystem = 0 or stageId in("+stageIds+"))";
     }
    
    }
    Long row = query.query(sql, new ScalarHandler<Long>(),value);
    if(row>0) return "false";
    
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
    return "true";
  }
  
  @Override
  public String checkedArchiveMetadataRepeat(Map<String, Object> param) {
    String stageId = param.get("stageId")+"";
    String esidentifier = param.get("esidentifier")+"";
    String id = param.get("id")+"";
    String isSystem = param.get("isSystem")+"";
    String sql = "select count(*) from ess_document_metadata where 1=1";
    try {
      if("0".equals(isSystem)){
        sql += " and esidentifier = '"+esidentifier+"'";
      }else{
          //获得当前节点所有父子节点的 stageId
          String stageIds = documentStageServiceImpl.getStageChildAndParentIds(stageId);
          sql += " and (isSystem =0 or stageId in("+stageIds+")) and esidentifier = '"+esidentifier+"'";
      }
    	
      if(!"0".equals(id)){
  		sql += " and id !="+id;
  	  }
    	long row = query.query(sql, new ScalarHandler<Long>());
    	if(row>0) return "false";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
    return "true";
  }
}