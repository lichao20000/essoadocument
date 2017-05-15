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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.BusinessEditWS;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.Condition;

/**
 * 文件归档模块
 * 
 * @author gengqianfeng
 * 
 */
@Path("filing")
@Component
public class FilingServiceImpl extends BasePlatformService implements
    IFilingService {

  @Resource(name = "queryRunner")
  private QueryRunner query;

  private BusinessEditWS businessEditWS;

  private ILogService logService;
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
  private boolean autoVolume(Map<String, Object> stage,
      List<Map<String, Object>> list, String _stageId, String creater,
      String createtime) {
    String sql = "insert into ess_filing(deviceCode,stageId,documentId,creater,createtime) values(?,?,?,?,?)";
    try {
      Object[][] params = new Object[list.size()][5];
      for (int i = 0; i < list.size(); i++) {
        Map<String, Object> obj = list.get(i);
        params[i] = new Object[] { obj.get("deviceCode"), _stageId,
            obj.get("id"), creater, createtime };
      }
      List<Map<String, Object>> rows = query.insertBatch(sql,
          new MapListHandler(), params);
      if (rows.size() != list.size()) {
        return false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
    return true;
  }

  @Override
  public String checkFilingRegulation(String stageCode) {
    List<Map<String, Object>> list = this.checkSaveData("", stageCode);
    if (list == null || list.size() == 0) {
      return "未发现文件收集范围";
    }
    String regulation = this.getRegulation(list.get(0));
    if ("false".equals(regulation)) {
      return "请先定义归档规则";
    }
    return "";
  }

  private List<Map<String, Object>> checkIfFiling(
      List<Map<String, Object>> list, String _stageId) {
    String sql = "select count(*) from ess_filing where deviceCode=? and stageId=? and documentId=? ";
    try {
      for (int i = 0; i < list.size(); i++) {
        Map<String, Object> obj = list.get(i);
        Long rows = query.query(sql, new ScalarHandler<Long>(), new Object[] {
            obj.get("deviceCode"), _stageId, obj.get("id") });
        if (rows != 0) {
          list.remove(i--);
        }
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean checkPerfect(List<Map<String, Object>> list, String stageId) {
    String sql = "select count(*) from (select dc.* from ess_document as dc";
    if (this.tableIfExists(stageId)) {
      sql += " LEFT JOIN esp_" + stageId + " as esp ON dc.id=esp.documentId ";
    }
    //sql += " LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where deviceCode=? ";
    sql += " ) as tb where deviceCode=? ";
    try {
      for (int i = 0; i < list.size(); i++) {
        Object cnt = query.query(sql, new ScalarHandler<Long>(),
            new Object[] { list.get(i).get("deviceCode") });
        if (cnt == null || Long.parseLong(cnt.toString()) == 0) {
          return false;
        }
      }
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private List<Map<String, Object>> checkSaveData(String stageId,
      String stageCode) {
    String sql = "select * from ess_document_stage where 1=1 ";
    if (stageId != null && !"".equals(stageId)) {
      sql += " and id=" + stageId;
    }
    if (stageCode != null && !"".equals(stageCode)) {
      sql += " and code='" + stageCode + "'";
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String conditionFiling(HashMap<String, Object> fill) {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("stageId", fill.get("stageId").toString());
    map.put("stageCode", fill.get("stageCode").toString());
    map.put("condition", fill.get("condition"));
    map.put("page", 1);
    map.put("pre", 0);
    List<Map<String, Object>> list_doc = this.findDocumentList(map);
    Map<String,List<HashMap<String, String>>> map_listFile = this.findDocumentListFile(list_doc);
    return this.filingDocument(fill, list_doc,map_listFile);
  }

  @SuppressWarnings("unchecked")
  private boolean filingDoc2SOA(HashMap<String, Object> fill,
      List<Map<String, Object>> list_doc, Map<String,List<HashMap<String, String>>> map_listFile) {
    boolean flag = true;
    List<String> cols = (List<String>) fill.get("field");
    for (int i = 0; i < list_doc.size(); i++) {
      Map<String, Object> row = list_doc.get(i);
      List<HashMap<String, String>> filedatas = new ArrayList<HashMap<String, String>>();
      if(!map_listFile.isEmpty() && map_listFile.containsKey(row.get("id")+"")){
    	  filedatas = map_listFile.get(row.get("id")+"");
      }
      HashMap<String, String> data = new HashMap<String, String>();
      for (int j = 0; j < cols.size(); j++) {
        String[] col = cols.get(j).split("-,-");
        String fieldValue = row.get(col[0]) == null ? "" : row.get(col[0])
            .toString();
        if ("stageCode".equals(col[0])) {
          fieldValue = this.getStageIdByCode(fieldValue) + "";
        }
        data.put(col[1], fieldValue);
      }
      @SuppressWarnings("rawtypes")
      HashMap dataMap = new HashMap();
      dataMap.put("data", data);
      dataMap.put("user", fill.get("user").toString());
      dataMap.put("platformId", fill.get("platformId").toString());
      String path = fill.get("direct").toString().replaceAll("/", "-");
      // 归档
      String newEspath = this.getBusinessEditWS().saveData(path, dataMap,
          fill.get("ip").toString());
      if(!filedatas.isEmpty()){
    	  this.getBusinessEditWS().linkFile(newEspath.replaceAll("/", "-"),filedatas);
      }
      if (newEspath == null || "".equals(newEspath)) {
        flag = false;
        i = list_doc.size();
      }
    }
    return flag;
  }

  private long getStageIdByCode(String code) {
    String sql = "select id from ess_document_stage where code=? ";
    try {
      Object id = query.query(sql, new ScalarHandler<Object>(), code);
      if (id == null) {
        return 0;
      }
      return Long.parseLong(id.toString());
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
  }

  private String filingDocument(HashMap<String, Object> fill,
      List<Map<String, Object>> list_doc,Map<String,List<HashMap<String, String>>> map_listFile) {
    String stageId = fill.get("stageId").toString();
    if (list_doc == null || list_doc.size() == 0) {
      return "未发现满足条件的待归档文件";
    }
    if (!this.checkPerfect(list_doc, stageId)) {
      return "收集的文件不完整";
    }
    List<Map<String, Object>> list_stage = this.checkSaveData(stageId, "");
    if (list_stage == null || list_stage.size() == 0) {
      return "未发现文件收集范围";
    }
    Map<String, Object> stage = list_stage.get(0);
    if (stage.get("period") == null || "".equals(stage.get("period"))) {
      return "收集范围未设置归档期限";
    }
    String _stageId = this.getRegulation(stage);
    if ("false".equals(_stageId)) {
      return "请先定义归档规则";
    }
    list_doc = this.checkIfFiling(list_doc, _stageId);
    if (list_doc == null || list_doc.size() == 0) {
      return "筛选文件都已归档";
    }
    if (!this.filingDoc2SOA(fill, list_doc, map_listFile)) {
      return "文件归档失败";
    }
    if (!this.autoVolume(stage, list_doc, _stageId, fill.get("creater")
        .toString(), fill.get("createtime").toString())) {
      return "记录归档记录失败";
    }
    String sql = "update ess_document set filingFlag='1',filingDirect=?  where id=? ";
    try {
      Object[][] params = new Object[list_doc.size()][];
      for (int i = 0; i < list_doc.size(); i++) {
        params[i] = new Object[] { fill.get("direct").toString(),
            list_doc.get(i).get("id") };
      }
      int[] cnt = query.batch(sql, params);
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", fill.get("ip"));
      log.put("userid", fill.get("user"));
      log.put("module", "文件归档");
      log.put("operate", "文件归档：归档数据到档案系统");
      String fileName = "";
      if (cnt.length == list_doc.size()) {
        for (Map<String, Object> map : list_doc) {
        	if(map.get("title")==null){
        		fileName += ","+"【】";
        	}else{
        		fileName += ",【" + map.get("title")+"】";
        	}
        }
        log.put("loginfo", "收集范围名称为【"+fill.get("stageName")+"】节点下的文件标题为" + fileName.substring(1) + "归档到名称为【"+fill.get("directName")+"】的目标节点下成功！");
        this.getLogService().saveLog(log);
        return "true";
      }
      log.put("loginfo", "收集范围名称为【"+fill.get("stageName")+"】节点下的文件标题为" + fileName.substring(1) + "归档到名称为【"+fill.get("directName")+"】的目标节点下失败！");
      this.getLogService().saveLog(log);
      return "false";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  @Override
  public List<Map<String, Object>> findDocumentById(long page, long pre,
      String stageId, String ids) {
    List<Map<String, Object>> returnList = this.getChildrenStageIds(Long
        .parseLong(stageId));
    List<String> childrenStageId = new ArrayList<String>();
    for (Map<String, Object> map : returnList) {
      String mapId = map.get("id").toString();
      if (this.tableIfExists(mapId)) {
        childrenStageId.add(mapId);
      }
    }

    String colName = "";
    if (childrenStageId.size() > 0) {
      colName = this
          .getColsCode(this.getParentStageIds(Long.parseLong(stageId)));
    }
    String sql = "select * from (select dc.*";
    if (!"".equals(colName) && colName != null) {
      String[] str = colName.split(",");
      for (int i = 0; i < str.length; i++) {
        sql += ",esp." + str[i];
      }
    }
    //sql += ",dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc ";
    sql += ",dc.`deviceName` as 'device',dc.`participatoryName` as 'part' from ess_document as dc ";
    if (!"".equals(colName) && colName != null) {
      sql += " LEFT JOIN (";
      for (String childrenStage : childrenStageId) {
        sql += " (select " + colName + " from esp_" + childrenStage
            + ") UNION ";
      }
      sql = sql.substring(0, sql.lastIndexOf("UNION"));
      sql += ") as esp ON dc.id=esp.documentId ";
    }
    //sql += "LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where FIND_IN_SET(id,?)>0 ";
    sql += " ) as tb where FIND_IN_SET(id,?)>0 ";
    long start = (page - 1) * pre;
    sql = sql + " limit " + start + "," + pre;
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), new Object[] { ids });
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
  public List<Map<String, Object>> findDocumentList(Map<String, Object> document) {
	Map<String,List<Map<String,Object>>> result = new HashMap<String,List<Map<String,Object>>>();
    String stageId = document.get("stageId").toString();
    /*if ("".equals(stageId) || "0".equals(stageId)) {
      //return new ArrayList<Map<String, Object>>();
    }*/
    List<Map<String, Object>> returnList = this.getChildrenStageIds(Long
        .parseLong(stageId));
    List<String> childrenStageId = new ArrayList<String>();
    String childrenCode = "";
    for (Map<String, Object> map : returnList) {
      String mapId = map.get("id").toString();
      if (this.tableIfExists(mapId)) {
        childrenStageId.add(mapId);
      }
      childrenCode += "," + map.get("code");
    }
    childrenCode = (childrenCode.length() > 0) ? childrenCode.substring(1) : "";

    String colName = "";
    String parentStageIds = "";
    if (childrenStageId.size() > 0) {
      parentStageIds = this.getParentStageIds(Long.parseLong(stageId));
      colName = this.getColsCode(parentStageIds);
    }
    String sql = "select * from (select dc.*";
    if (!"".equals(colName) && colName != null) {
      String C_name[] = colName.split(",");
      for (String c : C_name) {
        sql += ",esp." + c;
      }
    }
    //sql += ",dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc ";
    sql += ",dc.`deviceName` as 'device',dc.`participatoryName` as 'part' from ess_document as dc ";
    if (!"".equals(colName) && colName != null) {
      sql += " LEFT JOIN (";
      for (String childrenStage : childrenStageId) {
        sql += " (select " + colName + " from esp_" + childrenStage
            + ") UNION ";
      }
      sql = sql.substring(0, sql.lastIndexOf("UNION"));
      sql += ") as esp ON dc.id=esp.documentId ";
    }
    //sql += " LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where filingFlag='0' ";
    sql += " ) as tb where filingFlag='0' ";
    String stageCode = document.get("stageCode").toString();
    if (stageCode != null && !"".equals(stageCode)) {
      sql = sql + " and FIND_IN_SET(stageCode,'" + childrenCode + "') ";
    }
    //String typeNo = document.get("typeNo");
    if (document.get("typeNo") != null && !"".equals(document.get("typeNo").toString())) {
      sql += " and documentCode='" + document.get("typeNo") + "'";
    }
    if (document.get("condition") != null && !"".equals(document.get("condition").toString())) {
    	@SuppressWarnings("unchecked")
	    List<String> where = (List<String>) document.get("condition");
	    if (where != null && where.size() != 0) {
	      Condition condition = Condition.getConditionByList(where);
	      sql = sql + " and " + condition.toSQLString();
	    }
    }
    Object keyWord = document.get("keyWord");
    if (!"".equals(keyWord) && keyWord != null) {
      sql += this.getKeywordCondition(keyWord.toString(), parentStageIds);
    }
    long page = Long.parseLong(document.get("page").toString());
    long pre = Long.parseLong(document.get("pre").toString());
    if (pre != 0) {
      long start = (page - 1) * pre;
      sql = sql + " limit " + start + "," + pre;
    }
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

  private String getKeywordCondition(String keyWord, String stageIds) {
    StringBuffer fs = new StringBuffer();
    fs.append(this.getSearchCols(stageIds) + ",device,part");
    StringBuffer buffer = new StringBuffer();
    for (int i = 0; i < fs.toString().split(",").length; i++) {
      String f = fs.toString().split(",")[i];
      if (i == 0) {
        buffer.append(" and ( " + f + " like binary '%" + keyWord + "%' ");
      } else {
        buffer.append(" or " + f + " like binary '%" + keyWord + "%' ");
      }
    }
    buffer.append(")");
    return buffer.toString();
  }

  @Override
  public List<Map<String, Object>> findDocumentMetaByStageId(long stageId) {
    String sql = "select * from ess_document_metadata where stageId=? or stageId is null and code not in('stageCode','deviceCode','participatoryCode','documentCode','engineeringCode','stageId') order by isEdit desc";
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
  public List<Map<String, Object>> findMoveCols(int key, String stageId) {
    String sql = "select * from ess_document_metadata where FIND_IN_SET(stageId,?) ";
    if (stageId == null || "".equals(stageId) || "0".equals(stageId)) {
      return new ArrayList<Map<String, Object>>();
    }
    if (key == 1) {
      sql = sql + " or (isSystem=0  and code not in('stageName','deviceName','participatoryName','documentTypeName','engineeringName','stageId')) and isEdit is null order by isSystem asc ";
    }
    if (key == 2) {
      sql = sql + " or (isSystem=0  and code not in('stageName','deviceName','participatoryName','documentTypeName','engineeringName','stageId')) order by isSystem asc ";
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

  private BusinessEditWS getBusinessEditWS() {
    if (businessEditWS == null) {
      businessEditWS = this.getService(BusinessEditWS.class);
    }
    return businessEditWS;
  }

  public List<Map<String, Object>> getChildrenStageIds(long stageId) {
    String sql = "select id,code from ess_document_stage where FIND_IN_SET(?,REPLACE(id_seq,'.',',')) and isnode=0 or id=? ";
    try {
      List<Map<String, Object>> list = query.query(sql, new MapListHandler(),
          new Object[] { stageId, stageId });
      if (list == null || list.isEmpty()) {
        list = new ArrayList<Map<String, Object>>();
      }
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  public String getColsCode(String stageId) {
    List<Map<String, Object>> list = this.findMoveCols(0, stageId);
    String colSql = "documentId,";
    for (int i = 0; i < list.size(); i++) {
      colSql = colSql + list.get(i).get("code").toString() + ",";
    }
    return colSql.substring(0, colSql.length() - 1);
  }

  private String getSearchCols(String stageIds) {
    List<Map<String, Object>> list = this.findMoveCols(2, stageIds);
    String colSql = "";
    for (int i = 0; i < list.size(); i++) {
      colSql = colSql + list.get(i).get("code").toString() + ",";
    }
    return colSql.length() > 0 ? colSql.substring(0, colSql.length() - 1)
        : colSql;
  }

  @Override
  public long getCount(Map<String, Object> document) {
    String stageId = document.get("stageId").toString();
    if ("".equals(stageId) || "0".equals(stageId)) {
      return 0;
    }

    List<Map<String, Object>> returnList = this.getChildrenStageIds(Long
        .parseLong(stageId));
    List<String> childrenStageId = new ArrayList<String>();
    String childrenCode = "";
    for (Map<String, Object> map : returnList) {
      String mapId = map.get("id").toString();
      if (this.tableIfExists(mapId)) {
        childrenStageId.add(mapId);
      }
      childrenCode += "," + map.get("code");
    }
    childrenCode = (childrenCode.length() > 0) ? childrenCode.substring(1) : "";

    String colName = "";
    String parentStageIds = "";
    if (childrenStageId.size() > 0) {
      parentStageIds = this.getParentStageIds(Long.parseLong(stageId));
      colName = this.getColsCode(parentStageIds);
    }

    String sql = "select count(*) from (select dc.*";
    if (!"".equals(colName) && colName != null) {
      String[] str = colName.split(",");
      for (int i = 0; i < str.length; i++) {
        sql += ",esp." + str[i];
      }
    }
    //sql += ",dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc ";
    sql += ",dc.`deviceName` as 'device',dc.`participatoryName` as 'part' from ess_document as dc ";
    if (!"".equals(colName) && colName != null) {
      sql += " LEFT JOIN (";
      for (String childrenStage : childrenStageId) {
        sql += " (select " + colName + " from esp_" + childrenStage
            + ") UNION ";
      }
      sql = sql.substring(0, sql.lastIndexOf("UNION"));
      sql += ") as esp ON dc.id=esp.documentId ";
    }
    //sql += " LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where filingFlag='0' ";
    sql += " ) as tb where filingFlag='0' ";
    String stageCode = document.get("stageCode").toString();
    if (stageCode != null && !"".equals(stageCode)) {
      sql = sql + " and FIND_IN_SET(stageCode,'" + childrenCode + "') ";
    }
    String typeNo = document.get("typeNo").toString();
    if (typeNo != null && !"".equals(typeNo)) {
      sql += " and documentCode='" + typeNo + "'";
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) document.get("condition");
    if (where != null && where.size() != 0) {
      Condition condition = Condition.getConditionByList(where);
      sql = sql + " and " + condition.toSQLString();
    }
    Object keyWord = document.get("keyWord");
    if (!"".equals(keyWord) && keyWord != null) {
      sql += this.getKeywordCondition(keyWord.toString(), parentStageIds);
    }
    try {
      Object cnt = query.query(sql, new ScalarHandler<Long>());
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return 0;
    }
    return 0;
  }

  @Override
  public long getCountById(String stageId, String ids) {

    List<Map<String, Object>> returnList = this.getChildrenStageIds(Long
        .parseLong(stageId));
    List<String> childrenStageId = new ArrayList<String>();
    for (Map<String, Object> map : returnList) {
      String mapId = map.get("id").toString();
      if (this.tableIfExists(mapId)) {
        childrenStageId.add(mapId);
      }
    }

    String colName = "";
    if (childrenStageId.size() > 0) {
      colName = this
          .getColsCode(this.getParentStageIds(Long.parseLong(stageId)));
    }
    String sql = "select count(*) from (select dc.*";
    if (!"".equals(colName) && colName != null) {
      String[] str = colName.split(",");
      for (int i = 0; i < str.length; i++) {
        sql += ",esp." + str[i];
      }
    }
    //sql += ",dv.`name` as 'device',pt.`name` as 'part' from ess_document as dc ";
    sql += ",dc.`deviceName` as 'device',dc.`participatoryName` as 'part' from ess_document as dc ";
    if (!"".equals(colName) && colName != null) {
      sql += " LEFT JOIN (";
      for (String childrenStage : childrenStageId) {
        sql += " (select " + colName + " from esp_" + childrenStage
            + ") UNION ";
      }
      sql = sql.substring(0, sql.lastIndexOf("UNION"));
      sql += ") as esp ON dc.id=esp.documentId ";
    }
    //sql += " LEFT JOIN ess_device as dv ON dc.deviceCode=dv.deviceNo LEFT JOIN ess_participatory pt ON dc.participatoryCode=pt.`code`) as tb where FIND_IN_SET(id,?)>0 ";
    sql += " ) as tb where FIND_IN_SET(id,?)>0 ";
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

  private ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return this.logService;
  }

  @Override
  public String getParentStageIds(long stageId) {
    Map<String, Object> stage = this.getStageById(stageId);
    if (stage == null || stage.isEmpty()) {
      return "";
    }
    String id_seq = stage.get("id_seq").toString();
    String parentIds = "";
    id_seq = id_seq.replace('.', ',');
    String[] ids = id_seq.split(",");
    for (int i = 1; i < ids.length; i++) {
      parentIds += "," + ids[i];
    }
    return stageId + parentIds;
  }

  private String getRegulation(Map<String, Object> stage) {
    Object paperWay = stage.get("paperWay");
    if (paperWay != null && ("1".equals(paperWay) || "2".equals(paperWay))) {
      return stage.get("id").toString();
    } else {
      String id_seqs[] = stage.get("id_seq").toString().split(".");
      for (int i = id_seqs.length - 1; i > 0; i--) {
        List<Map<String, Object>> list = this.checkSaveData(id_seqs[i - 1], "");
        Object f_paperWay = list.get(0).get("paperWay");
        if (f_paperWay != null
            && ("1".equals(f_paperWay) || "2".equals(f_paperWay))) {
          return id_seqs[i - 1];
        }
      }
      return "false";
    }
  }

  public Map<String, Object> getStageById(long stageId) {
    String sql = "select * from ess_document_stage where id=? ";
    try {
      Map<String, Object> stage = query.query(sql, new MapHandler(),
          new Object[] { stageId });
      if (stage == null || stage.isEmpty()) {
        stage = new HashMap<String, Object>();
      }
      return stage;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public String idsFiling(HashMap<String, Object> fill) {
    String ids = fill.get("ids").toString();
    String stageId = fill.get("stageId").toString();
    List<Map<String, Object>> list_doc = this.findDocumentById(1,
        ids.split(",").length, stageId, ids);
    Map<String,List<HashMap<String, String>>> map_listFile = this.findDocumentListFile(list_doc);
    return this.filingDocument(fill, list_doc,map_listFile);
  }

  public boolean tableIfExists(String stageId) {
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
  
  private Map<String,List<HashMap<String, String>>> findDocumentListFile(List<Map<String, Object>> list){
	Map<String,List<HashMap<String, String>>> result = new HashMap<String,List<HashMap<String, String>>>();
	for(Map<String, Object> m:list){
		if(m.get("id")!=null && !"".equals(m.get("id").toString())){
			long id = Long.valueOf(m.get("id").toString());
			List<Map<String, Object>> filedatas = this.getDocumentListFileByDocId(id);
			List<HashMap<String, String>> newFiledatas = new ArrayList<HashMap<String, String>>();
			if(filedatas!=null && filedatas.size()>0){
				for(Map<String, Object> m1:filedatas){
					HashMap<String, String> m2 = new HashMap<String, String>();
					m2.put("ORIGINAL_ID", m1.get("esfileid") == null ? "":m1.get("esfileid").toString());
					m2.put("EssType", m1.get("esfiletype") == null ? "":m1.get("esfiletype").toString());
					m2.put("Dept", m1.get("dept") == null ? "":m1.get("dept").toString());
					newFiledatas.add(m2);
				}
			}
			result.put(id+"", newFiledatas);
		}
	}
	return result;
  }
  
  private List<Map<String, Object>> getDocumentListFileByDocId(long id){
	String sql = "select esfileid,esfiletype,dept from ess_document_file where pid = "+id;
	List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
	try {
		list = query.query(sql, new MapListHandler());
		if(list.isEmpty()){
			return new ArrayList<Map<String, Object>>();
		}
	} catch (SQLException e) {
		e.printStackTrace();
		return new ArrayList<Map<String, Object>>();
	}
	return list;
  }
}