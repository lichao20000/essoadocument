package cn.flying.rest.service.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.file.IMainFileServer;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IDocumentStageService;
import cn.flying.rest.service.IDocumentTypeService;
import cn.flying.rest.service.IEngineeringService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.ConvertUtil;
import cn.flying.rest.service.utils.DataTable;
import cn.flying.rest.service.utils.ExportDBF;
import cn.flying.rest.service.utils.ExportExcel;
import cn.flying.rest.service.utils.ExportXML;
import cn.flying.rest.service.utils.FileOperateUtil;
import cn.flying.rest.service.utils.Header;
import cn.flying.rest.service.utils.HttpSimulator;
import cn.flying.rest.service.utils.JdbcUtil;
import cn.flying.rest.service.utils.PackageZip;
import cn.flying.rest.service.utils.Pair;
import cn.flying.rest.service.utils.ParseDBF;
import cn.flying.rest.service.utils.ParseUtil;
import cn.flying.rest.service.utils.VALUETYPES;
import cn.flying.rest.service.utils.ValueType;
import cn.flying.rest.service.utils.ZipUtil;

/**
 * 文件收集范围
 * 
 * @author xuekun
 * 
 */
@Path("documentStage")
@Component
public class DocumentStageServiceImpl extends BasePlatformService implements
    IDocumentStageService {
  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  private IMainFileServer mainFileServer;
  private IDocumentTypeService documentTypeService;//文件类型代码接口
  private IEngineeringService engineeringService;//文件专业代码接口
  
  private String instanceId;

  @Value("${app.InstanceId}")
  public void setInstanceId(String instanceId) {
    this.instanceId = instanceId;
  }

  public String getInstanceId() {
    return this.instanceId;
  }

  private MessageWS messageWS;

  public MessageWS getMessageWS() {
    if (messageWS == null) {
      this.messageWS = this.getService(MessageWS.class);
    }
    return messageWS;
  }

  public IMainFileServer getMainFileServer() {
    if (this.mainFileServer == null) {
      this.mainFileServer = this.getService(IMainFileServer.class);
    }
    return mainFileServer;
  }
  
  public IDocumentTypeService getDocumentTypeService() {
    if (this.documentTypeService == null) {
      this.documentTypeService = this.getService(IDocumentTypeService.class);
    }
    return documentTypeService;
  }
  
  public IEngineeringService getEngineeringService() {
    if (this.engineeringService == null) {
      this.engineeringService = this.getService(IEngineeringService.class);
    }
    return engineeringService;
  }
  
  @Override
  public HashMap<String, Object> add(HashMap<String, Object> map) {
    String sql = "insert into ess_document_stage (pId,name,code,period,level,isnode,id_seq,paperWay) values(?,?,?,?,?,?,?,?)";
    Object[] params = { map.get("pId"), map.get("name").toString().trim(), map.get("code"),
        map.get("period"), map.get("level"), map.get("isnode"),
        map.get("id_seq"), map.get("paperWay") };
    Long id = JdbcUtil.insert(query, sql, params);
    if (id == null) {
      return null;
    } else {
      map.put("id", id);
      // 新建的收集范围如果是文件的 检查其父节点是否存在字段如果存在 则创建临时表 添加字段
      if (StringUtils.equals(map.get("isnode").toString(), "0")) {
        addColumn(id);
      }
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "文件收集范围");
      log.put("operate", "文件收集范围：添加收集范围");
      log.put("loginfo", "添加【" + map.get("name") + "】收集范围");
      this.getLogService().saveLog(log);
      return map;
    }
  }

  /**
   * 如果父节点已经存在数据字段 xuekun 2015年2月3日 下午5:23:36
   * 
   * @param id
   * @param id_seq
   * @return
   */
  private boolean addColumn(Long id) {
    String sql = "select a.* from ess_document_metadata a,ess_document_stage b where find_in_set(stageId,replace(b.id_seq,'.',',')) and b.id=?";
    List<Map<String, Object>> list = null;
    try {
      list = query.query(sql, new MapListHandler(), id);
      if (list != null && list.size() > 0) {
        // 创建动态表
        createStructureTable(id);

        for (Map<String, Object> metaMap : list) {
          addColumn(id, metaMap);
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return true;
  }

  private boolean addColumn(Long id, Map<String, Object> map) {
    String tableName = "esp_" + id;// 系统元数据表
    String type = JdbcUtil
        .getColumnType(VALUETYPES.TYPE.valueOf(map.get("type").toString()),
            String.valueOf(map.get("length")),
            String.valueOf(map.get("dotLength")));
    saveColumn(tableName, (String) map.get("code"), type);
    return true;
  }

  private boolean createStructureTable(Long id) {
    // 创建结构表
    StringBuilder esp_n = new StringBuilder();
    esp_n.append(" create table if not exists  esp_" + id + " (");
    esp_n.append(" id int(11) NOT NULL AUTO_INCREMENT, ");
    esp_n.append(" documentId int(11),");
    esp_n.append(" PRIMARY KEY (id), ");
    esp_n.append(" CONSTRAINT `PK_ESP_");
    esp_n.append(id);
    esp_n.append("_DOCUMENT_ID`");
    esp_n
        .append(" FOREIGN KEY (`documentId`) REFERENCES `ess_document` (`id`) ");
    esp_n.append(" ON DELETE CASCADE ON UPDATE CASCADE");
    esp_n.append(") ENGINE=InnoDB DEFAULT CHARSET=utf8");

    boolean result = JdbcUtil.update(query, esp_n.toString());// 暂不创建模拟序列

    return result;
  }

  @Override
  public String delete(Long[] ids, String userId, String ip) {

    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    StringBuilder sb = new StringBuilder();
    try {
      for (int i = 0; i < ids.length; i++) {
        //根据id查找删除的所有关联数据
        List<Map<String,Object>> stages= getChildStageName(ids[i]);
        if(stages!=null){
        for (Map<String, Object> s : stages) {
            sb.append("【"+s.get("name")+"】");
        }
        }
        //先记录在删除
        deleteCascade(ids[i]);

      }

      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "文件收集范围");
      log.put("operate", "文件收集范围：删除收集范围");
      log.put("loginfo", "删除名称：" + sb.toString() + "的收集范围");
      this.getLogService().saveLog(log);
      return "";
    } catch (Exception e) {
      e.printStackTrace();
      return "未发现文件收集范围";
    }
  }

  private List<Map<String, Object>> getChildStageName(Long id) {
    
    String sql = "select * from ess_document_stage s1 where s1.id=? or s1.id_seq like (select CONCAT(s.id_seq,s.id,'.%') from ess_document_stage s where s.id=?)";
    List<Map<String,Object>> list = null;
    try {
      list = query.query(sql, new MapListHandler(),id,id);
      return list;
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return null;
  }

  private void deleteById(long id) {
    String sql = "delete from ess_document_stage where id= ? ";
    Map<String, Object> dataMap = get(id);
    Object[] params = { id };
    if (JdbcUtil.update(query, sql, params)) {// 如果删除了文件收集节点相应的要删除该节点动态表和元数据和收集的数据
      deleteStructureTable(id);// 删除动态表
      deleteMetadata(dataMap);// 删除该节点元数据
      deleteDocument((String) dataMap.get("code"));// 删除该节点收集的数据
    }
    ;
  }

  private void deleteCascade(long id) {
    try {
      // 删除文件收集范围
      deleteById(id);
      // 获取子节点
      List<Map<String, Object>> list = getDocumentStageByPid(id);
      if (list.size() != 0) {
        for (int i = 0; i < list.size(); i++) {
          // 迭代删除文件收集范围
          deleteCascade((Integer) list.get(i).get("id"));
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  private void deleteDocument(String stageCode) {
    String sql = " delete from ess_document where stageCode=? ";
    Object[] params = { stageCode };
    JdbcUtil.update(query, sql, params);
  }

  private void deleteMetadata(Map<String, Object> dataMap) {
    String stageIds = getStageChildIds(dataMap);
    String sql = "delete from ess_document_metadata where stageid in("
        + stageIds + ")";
    JdbcUtil.update(query, sql);
  }

  private void deleteStructureTable(long id) {
    // 创建结构表
    StringBuilder esp_n = new StringBuilder();
    esp_n.append("DROP TABLE IF EXISTS ");
    esp_n.append("esp_");
    esp_n.append(id);
    JdbcUtil.update(query, esp_n.toString());
  }

  @Override
  public Map<String, Object> get(Long id) {
    String sql = "select * from ess_document_stage where id=?";
    Object[] params = { id };
    return JdbcUtil.query(query, sql, new MapHandler(), params);
  }

  @Override
  public long getCount(HashMap<String, Object> map) {
    String sql = "select count(*) from ess_document_stage where 1=1 ";
    if (null != map.get("codeType") && !"".equals(map.get("codeType"))) {
      sql += " and  codeType=" + map.get("codeType");
    }
    if (null != map.get("pId") && !"".equals(map.get("pId"))) {
      sql += " and  FIND_IN_SET(pId,'" + map.get("pId") + "') ";
    }
    if (null != map.get("where") && !"".equals(map.get("where"))) {
      @SuppressWarnings("unchecked")
      Condition cond = Condition.getConditionByList((List<String>) map
          .get("where"));
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

  private List<Map<String, Object>> getDocumentStageByPid(long id) {
    String selectsql = "select id from ess_document_stage where pId= ?";
    Object[] params = { id };
    List<Map<String, Object>> list = JdbcUtil.query(query, selectsql,
        new MapListHandler(), params);
    return list;
  }

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private String getStageChildIds(Map<String, Object> dataMap) {
    String ids = null;
    String sql = "select group_concat(id) from ess_document_stage where  id_seq like ? or id = ?";
    Object[] params = { dataMap.get("id_seq") + "" + dataMap.get("id") + ".%",
        dataMap.get("id") };
    try {
      ids = query.query(sql, new ScalarHandler<String>(), params);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return ids;

  }
  public String getStageChildAndParentIds(String stageId) {
    Map<String,Object> dataMap = getStageById(Long.parseLong(stageId));
    String ids = null;
    ids = dataMap.get("id_seq")+"";
    if(!"null".equals(ids)){
    ids = ids.replaceAll("\\.", ",");
    ids +=dataMap.get("id");
    }
    String sql = "select group_concat(id) from ess_document_stage where  id_seq like ? or id in ("+ids+")";
    Object[] params = { dataMap.get("id_seq") + "" + dataMap.get("id") + ".%" };
    try {
      ids = query.query(sql, new ScalarHandler<String>(), params);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return ids;
    
  }

  @Override
  public List<Map<String, Object>> getTree(Integer isnode, Long pId) {
    List<Map<String, Object>> list = null;
    String sql = "select * from ess_document_stage where 1=1 ";
    if (isnode != -1) {
      sql += " and isnode=" + isnode;
    }
    if (pId != 0) {
      Map<String, Object> data = get(pId);
      sql += "and (id_seq like '" + data.get("id_seq") + data.get("id") + "."
          + "%' or id= " + pId + " )";
    }
    list = JdbcUtil.query(query, sql, new MapListHandler());
    if (list == null) {
      list = new ArrayList<Map<String, Object>>();
    }

    if (pId == 0) {
      Map<String, Object> map = new HashMap<String, Object>();
      map.put("id", 0);
      map.put("pId", -1);
      map.put("name", "文件收集（归档）范围");
      map.put("nocheck", true);
      map.put("code", "");
      map.put("paperWay", "0");
      map.put("isnode", 1);
      map.put("id_seq", "");
      list.add(0, map);
    }
    return list;
  }

  @Override
  public List<Map<String, Object>> list(Integer page, Integer rp,
      HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    String sql = "select * from ess_document_stage where 1=1 ";
    if (null != map.get("pId") && !"".equals(map.get("pId"))) {
      sql += " and  FIND_IN_SET(pId,'" + map.get("pId") + "') ";
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
      String sql = "update ess_document_stage set pId=?,name=?,code=?,period=?,level=?,isnode=?,paperWay=? where id=?";
      Object[] params = { map.get("pId"), map.get("name").toString().trim(), map.get("code"),
          map.get("period"), map.get("level"), map.get("isnode"),
          map.get("paperWay"), map.get("id") };
      int row = query.update(sql, params);
      if (row == 0) {
        return "未发现文件收集范围";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", map.get("ip"));
        log.put("userid", map.get("userId"));
        log.put("module", "文件收集范围");
        log.put("operate", "文件收集范围：修改收集范围");
        log.put("loginfo", "修改标识为【" + map.get("id") + "】的收集范围信息");
        this.getLogService().saveLog(log);
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "更新文件收集范围失败";
    }
  }

  public String updateDocNoRule(Long id, String tagids) {
    String flag = "false";
    if (!StringUtils.isEmpty(tagids)) {
      String sql = " update  ess_rule_docno set tagids=? where id=?";
      try {
        int row = query.update(sql, new ScalarHandler<Long>(), new Object[] {
            tagids, id });
        if (row != 0) {
          flag = "true";
        }
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }
    return flag;
  }

  // ----------------------导入导出-----------------------------------------

  // 导入时存放临时数据
  private static Map<String, Map<String, DataTable>> imap = new HashMap<String, Map<String, DataTable>>();

  @Override
  public Map<String, Object> exportSelData(HashMap<String, Object> map) {
     String treename = map.get("treename") + "";
    String ids = map.get("ids") + "";
    String exportType = map.get("exportType") + "";
    // String resource = map.get("resource") + "";
    String dataTable = map.get("dataTable") + "";

    // 1.根据treeNodeId 获得此节点下的关联数据的字段集合List 集合中的元素为 map key 为字段标识 value为字段名称
    List<Map<String, Object>> fieldList = getFieldListByTatbleName(dataTable);
    // 转化fieldList 使 一条记录的code字段标识 对应字段的名称name map里 key为code value为name
    HashMap<String, String> fieldMap = new HashMap<String, String>();
    // 得到每个字段的类型和长度 组成一个成对数据pair 以字段标识code为键 pair为value 存入map中
    Map<String, Pair<Integer, String>> pairMap = new HashMap<String, Pair<Integer, String>>();
    for (Map<String, Object> m : fieldList) {
      fieldMap.put(m.get("code") + "", m.get("name") + "");

      Integer length = Integer.parseInt(m.get("length").toString());
      String type = m.get("type") + "";
      pairMap.put(m.get("code") + "", new Pair<Integer, String>(length, type));
    }

    List<Map<String, Object>> dataList = getDataListByIds(ids, dataTable);
    // 4.导出判断导出对应类型数据
    Map<String, Object> result = new HashMap<String, Object>();
    if (dataList == null) {
      result.put("msg", "nothing");
      return result;
    } else {
      if ("formats_Excel".equals(exportType)) {
        // 导出主数据
        ExportExcel exportExcel = new ExportExcel();
        String dataName = exportExcel.exportExcel(dataList, fieldMap, "导出数据表");
        result.put("dataName", dataName);

      } else if ("formats_xml".equals(exportType)) {
        ExportXML exportXml = new ExportXML();
        String fileName = exportXml.exportXml(dataList, null, fieldMap);
        // xml格式的导出 主数据和电子文件数据信息都在一个xml文件中
        result.put("dataName", fileName);
      } else if ("formats_dbf".equals(exportType)) {
        ExportDBF exportDbf = new ExportDBF();
        String dataName = exportDbf.exportDBFNew(dataList, fieldList, pairMap);
        result.put("dataName", dataName);
      }
    }
    // 打包导出成功的 文件
    String fileName = PackageZip(result, null);
    result.clear();
    if (fileName != null) {
      // 消息设置
      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", map.get("userId") + "");
      messMap.put("recevier", map.get("userId") + "");
      messMap.put("sendTime",
          new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", fileName + "已导出完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + this.getServiceIP()
          + fileName + "')");
      messMap.put("handlerUrl", "esdocument/" + this.getInstanceId()
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);

      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      if("ess_document_stage".equals(dataTable)){
        log.put("module", "文件收集范围");
        log.put("operate", "文件收集范围：导出数据");
        }else if("ess_document_type".equals(dataTable)){
          log.put("module", "文件类型代码");
          log.put("operate", "文件类型代码：导出数据");
        }else if("ess_engineering".equals(dataTable)){
          log.put("module", "文件专业代码");
          log.put("operate", "文件专业代码：导出数据");
        }
      log.put("loginfo", "导出节点为【"+treename+"】标识为【" + ids + "】的数据,导出文件为"+fileName);
      this.getLogService().saveLog(log);

      result.put("msg", "success");
      result.put("path", this.getServiceIP() + fileName);
    } else {
      result.put("msg", "error");
    }
    return result;
  }

  /**
   * 拷贝文件 wanghongchen 20140808
   * 
   * @param oldPath
   * @param newPath
   */
  private void copyFile(String oldPath, String newPath) {
    try {
      int byteread = 0;
      File oldfile = new File(oldPath);
      if (oldfile.exists()) { // 文件存在时
        InputStream inStream = new FileInputStream(oldPath); // 读入原文件
        FileOutputStream fs = new FileOutputStream(newPath);
        byte[] buffer = new byte[1444];
        while ((byteread = inStream.read(buffer)) != -1) {
          fs.write(buffer, 0, byteread);
        }
        fs.close();
        inStream.close();
      }
    } catch (Exception e) {
      e.printStackTrace();

    }
  }

  /**
   * 将导出的数据根据路径信息打包
   * 
   * @param result
   * @param fileDataList
   * @return
   */
  private String PackageZip(Map<String, Object> result,
      List<Map<String, Object>> fileDataList) {
    String address = this.getAddress();
    String packfileName = null;
    String name = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    String tf = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date())
        + "/";
    new File(address + tf).mkdirs();
    String dataName = result.get("dataName") + "";
    String fileName = result.get("fileName") + "";
    String resource = result.get("resource") + "";
    // 主数据不为空 导出主数据
    if (!"null".equals(dataName)) {
      copyFile(address + dataName, address + tf + dataName);
      // 电子文件不为空 导出电子文件
      if (!"null".equals(fileName)) {
        copyFile(address + fileName, address + tf + fileName);
      }
      if ("yes".equals(resource)) {
        if (fileDataList.size() > 0) {
          for (Map<String, Object> map : fileDataList) {
            String tempFolder = map.get("esViewTitle") + "";
            // 从文件服务器端得到的 下载路径
            String urlString = getMainFileServer().getFileDownLoadUrl(
                map.get("originalId") + "");
            // 全路径（包含文件名）
            String destFile = address + tf + map.get("esViewTitle") + "/"
                + map.get("estitle");
            File tmpDir = new File(address + tf + tempFolder);
            if (!tmpDir.exists()) {
              tmpDir.mkdirs();
            }
            HttpSimulator.executeDownload(urlString, destFile);
          }
        }
      }
      packfileName = name + ".zip";
    }
    if (packfileName != null)
      PackageZip.zip(address + tf, address + packfileName);
    return packfileName;
  }

  /**
   * 获取压缩文件地址
   * 
   * @return
   */
  private String getAddress() {
    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    String path = classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    return address;
  }

  /**
   * 根据id集合获得所有数据
   * 
   * @param ids
   * @return
   */
  private List<Map<String, Object>> getDataListByIds(String ids,
      String dataTable) {
    List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
    try {
      if (dataTable != null && !"".equals(dataTable)) {
        String sql = "select * from " + dataTable + " where id in(" + ids + ") ";
		if(dataTable.equals("ess_document_stage")){
			String where = this.getChildIdsByPid(ids);
		    if(where!=null && !"".equals(where) && !"null".equals(where)){
		    	sql += where;
		    }
    	}
        dataList = query.query(sql, new MapListHandler());
        //获取文件收集范围将节点类型，未来组卷方式具体值
        if(!dataList.isEmpty() && dataTable.equals("ess_document_stage")){
        	for(Map<String, Object> map:dataList){
        		if(map.get("isnode").equals("1")){
        			map.put("isnode", "节点");
        		}else if(map.get("isnode").equals("0")){
        			map.put("isnode", "文件");
        		}
        		if(map.get("paperWay").equals("0")){
        			map.put("paperWay", "");
        		}else if(map.get("paperWay").equals("1")){
        			map.put("paperWay", "单项工程");
        		}else if(map.get("paperWay").equals("2")){
        			map.put("paperWay", "整体项目");
        		}
        	}
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return dataList;
  }

  private Map<String, Object> getStageById(Long stageId) {
    Map<String, Object> map = null;
    String sql = "select * from ess_document_stage where id= ? ";
    try {
      map = query.query(sql, new MapHandler(), new Object[] { stageId });
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public List<Map<String, Object>> getFieldsByTreetype(
      HashMap<String, Object> map) {
    String treetype = map.get("treetype") + "";
    String treenodeid = map.get("treenodeid") + "";
    // String treeCode = map.get("treeCode")+"";
    List<Map<String, Object>> fieldListMap = null;
    try {
      if ("1".equals(treetype)) {
        String sql = "select code,name,type,length,isNull from ess_document_metadata where stageId = ? or isSystem = 0";
        fieldListMap = query.query(sql, new MapListHandler(), treenodeid);

      } else {
        String sql = "select code,name,type,length,isNull from ess_document_metadata where isSystem = 0";
        fieldListMap = query.query(sql, new MapListHandler());
      }
      if (fieldListMap == null)
        fieldListMap = new ArrayList<Map<String, Object>>();
    } catch (SQLException e) {
      e.printStackTrace();
      return fieldListMap;
    }
    return fieldListMap;
  }

  @Override
  public Map<String, Object> exportFilterData(HashMap<String, Object> map) {
    String treenodeid = map.get("treenodeid") + "";
    String treename = map.get("treename") + "";
    // String treecode = map.get("treecode") + "";
    String exportType = map.get("exportType") + "";
    @SuppressWarnings("unchecked")
    List<String> condition = (List<String>) map.get("where");
    String con = "";
    if(condition!=null&&condition.size()>0){
    for (String c : condition) {
         con+=c+"&";
    }
    }
    // String resource = map.get("resource") + "";
    // String treetype = map.get("treetype") + "";
    String dataTable = map.get("dataTable") + "";
    // 1.根据treeNodeId 获得此节点下的关联数据的字段集合List 集合中的元素为 map key 为字段标识 value为字段名称
    List<Map<String, Object>> fieldList = getFieldListByTatbleName(dataTable);
    // 转化fieldList 使 一条记录的code字段标识 对应字段的名称name map里 key为code value为name
    Map<String, String> fieldMap = new HashMap<String, String>();
    // 得到每个字段的类型和长度 组成一个成对数据pair 以字段标识code为键 pair为value 存入map中
    HashMap<String, Pair<Integer, String>> pairMap = new HashMap<String, Pair<Integer, String>>();
    for (Map<String, Object> m : fieldList) {
      fieldMap.put(m.get("code") + "", m.get("name") + "");

      Integer length = Integer.parseInt(m.get("length").toString());
      String type = m.get("type") + "";
      pairMap.put(m.get("code") + "", new Pair<Integer, String>(length, type));
    }
    // 2.根据过滤条件查找数据
    List<Map<String, Object>> dataList = getDataListByCondition(condition,
        treenodeid, dataTable);

    Map<String, Object> result = new HashMap<String, Object>();
    // 4.导出判断导出对应类型数据
    if (dataList == null || dataList.size() < 1) {
      result.put("msg", "nothing");
      return result;
    } else {
      if ("formats_Excel".equals(exportType)) {
        // 导出主数据
        ExportExcel exportExcel = new ExportExcel();
        String dataName = exportExcel.exportExcel(dataList, fieldMap, "导出数据表");
        result.put("dataName", dataName);

      } else if ("formats_xml".equals(exportType)) {
        ExportXML exportXml = new ExportXML();
        String fileName = exportXml.exportXml(dataList, null, fieldMap);
        result.put("dataName", fileName);

      } else if ("formats_dbf".equals(exportType)) {
        ExportDBF exportDbf = new ExportDBF();
        String dataName = exportDbf.exportDBFNew(dataList, fieldList, pairMap);
        result.put("dataName", dataName);
      }
    }
    // 5 打包压缩导出的文件
    String fileName = PackageZip(result, null);
    result.clear();
    // 6 写入日志
    if (fileName != null) {
      // 消息设置
      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", map.get("userId") + "");
      messMap.put("recevier", map.get("userId") + "");
      messMap.put("sendTime",
          new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", fileName + "已导出完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + this.getServiceIP()
          + fileName + "')");
      messMap.put("handlerUrl", "esdocument/" + this.getInstanceId()
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);

      String conditionStr = new ConvertUtil().conditonToChines(con,"&", ",", getFieldNameByTableName(dataTable));
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      if("ess_document_stage".equals(dataTable)){
        log.put("module", "文件收集范围");
        log.put("operate", "文件收集范围：导出数据");
        }else if("ess_document_type".equals(dataTable)){
          log.put("module", "文件类型代码");
          log.put("operate", "文件类型代码：导出数据");
        }else if("ess_engineering".equals(dataTable)){
          log.put("module", "文件专业代码");
          log.put("operate", "文件专业代码：导出数据");
        } 
      log.put("loginfo", "导出文件节点为【"+treename+"】筛选条件为"+conditionStr+"的数据,导出文件为"+fileName);
      this.getLogService().saveLog(log);
      result.put("msg", "success");
      result.put("path", this.getServiceIP() + fileName);
    } else {
      result.put("msg", "error");
    }
    return result;
  }
  /**
   * 根据表的不同 得到不同模块 过滤字段的中文map
   * @param dataTable
   * @return
   */
  private Map<String,String> getFieldNameByTableName(String dataTable){
    Map<String,Map<String,String>> tableFeildMap = new HashMap<String,Map<String,String>>();
    Map<String,String> filed1 = new HashMap<String,String>();
    filed1.put("name", "名称");
    filed1.put("code", "分类代码");
    filed1.put("period", "保管期限");
    filed1.put("npaperWay", "未来组卷方式");
    tableFeildMap.put("ess_document_stage", filed1);
    
    Map<String,String> filed2 = new HashMap<String,String>();
    filed2.put("typeName", "文件类型名称");
    filed2.put("typeNo", "文件类型代码");
    tableFeildMap.put("ess_document_type", filed2);
    
    Map<String,String> filed3 = new HashMap<String,String>();
    filed3.put("typeName", "文件专业名称");
    filed3.put("typeNo", "文件专业代码");
    tableFeildMap.put("ess_engineering", filed3);
    return tableFeildMap.get(dataTable);
  }
  /**
   * 为了导出不同模块的根据不同的表 固定不同的导出数据字段信息
   * @param dataTable
   * @return
   */
  private List<Map<String, Object>> getFieldListByTatbleName(String dataTable) {
    Map<String, List<Map<String, Object>>> TableNameField = new HashMap<String, List<Map<String, Object>>>();
    // 写死表的字段信息 ess_document_stage 表
    List<Map<String, Object>> stage = new ArrayList<Map<String, Object>>();
    Map<String, Object> stage1 = new HashMap<String, Object>();
    stage1.put("name", "id");
    stage1.put("code", "id");
    stage1.put("type", "NUMBER");
    stage1.put("length", 11);
    stage1.put("isNull", "否");
    stage.add(stage1);

    Map<String, Object> stage2 = new HashMap<String, Object>();
    stage2.put("name", "名称");
    stage2.put("code", "name");
    stage2.put("type", "TEXT");
    stage2.put("length", 200);
    stage2.put("isNull", "否");
    stage.add(stage2);

    Map<String, Object> stage3 = new HashMap<String, Object>();
    stage3.put("name", "代码");
    stage3.put("code", "code");
    stage3.put("type", "TEXT");
    stage3.put("length", 50);
    stage3.put("isNull", "否");
    stage.add(stage3);

    Map<String, Object> stage4 = new HashMap<String, Object>();
    stage4.put("name", "保管期限");
    stage4.put("code", "period");
    stage4.put("type", "TEXT");
    stage4.put("length", 50);
    stage4.put("isNull", "是");
    stage.add(stage4);

    Map<String, Object> stage5 = new HashMap<String, Object>();
    stage5.put("name", "节点类型");
    stage5.put("code", "isnode");
    stage5.put("type", "TEXT");
    stage5.put("length", 10);
    stage5.put("isNull", "否");
    stage.add(stage5);

    Map<String, Object> stage6 = new HashMap<String, Object>();
    stage6.put("name", "未来组卷方式");
    stage6.put("code", "paperWay");
    stage6.put("type", "TEXT");
    stage6.put("length", 10);
    stage6.put("isNull", "否");
    stage.add(stage6);
    
    Map<String, Object> stage7 = new HashMap<String, Object>();
    stage7.put("name", "pId");
    stage7.put("code", "pId");
    stage7.put("type", "NUMBER");
    stage7.put("length", 11);
    stage7.put("isNull", "否");
    stage.add(stage7);

    TableNameField.put("ess_document_stage", stage);

    // ess_document_type 表
    List<Map<String, Object>> type = new ArrayList<Map<String, Object>>();

    Map<String, Object> type1 = new HashMap<String, Object>();
    type1.put("name", "id");
    type1.put("code", "id");
    type1.put("type", "NUMBER");
    type1.put("length", 11);
    type1.put("isNull", "否");
    type.add(type1);

    Map<String, Object> type2 = new HashMap<String, Object>();
    type2.put("name", "文件类型名称");
    type2.put("code", "typeName");
    type2.put("type", "TEXT");
    type2.put("length", 200);
    type2.put("isNull", "否");
    type.add(type2);

    Map<String, Object> type3 = new HashMap<String, Object>();
    type3.put("name", "文件类型代码");
    type3.put("code", "typeNo");
    type3.put("type", "TEXT");
    type3.put("length", 200);
    type3.put("isNull", "否");
    type.add(type3);

    TableNameField.put("ess_document_type", type);
    // ess_engineering 表
    List<Map<String, Object>> engineering = new ArrayList<Map<String, Object>>();

    Map<String, Object> engineering1 = new HashMap<String, Object>();
    engineering1.put("name", "id");
    engineering1.put("code", "id");
    engineering1.put("type", "NUMBER");
    engineering1.put("length", 11);
    engineering1.put("isNull", "否");
    engineering.add(engineering1);

    Map<String, Object> engineering2 = new HashMap<String, Object>();
    engineering2.put("name", "文件专业名称");
    engineering2.put("code", "typeName");
    engineering2.put("type", "TEXT");
    engineering2.put("length",200);
    engineering2.put("isNull", "否");
    engineering.add(engineering2);

    Map<String, Object> engineering3 = new HashMap<String, Object>();
    engineering3.put("name", "文件专业代码");
    engineering3.put("code", "typeNo");
    engineering3.put("type", "TEXT");
    engineering3.put("length", 200);
    engineering3.put("isNull", "否");
    engineering.add(engineering3);

    TableNameField.put("ess_engineering", engineering);

    return TableNameField.get(dataTable);
  }

  private List<Map<String, Object>> getDataListByCondition(
      List<String> condition, String treenodeid, String dataTable) {
    List<Map<String, Object>> list = null;
    String sql = "select * from " + dataTable + " where 1=1 ";
    if (treenodeid != null && !"".equals(treenodeid)) {

      if ("ess_document_stage".equals(dataTable)) {
        if (!"".equals(treenodeid) && !"0".equals(treenodeid)
            && treenodeid != null) {
          sql += " and  FIND_IN_SET(pId,'" + treenodeid + "') ";
        }
      } else {
        sql += " and  participatoryId=" + treenodeid;
      }
    }
    if (null != condition && condition.size() != 0) {
      Condition cond = Condition.getConditionByList(condition);
      sql += " and " + cond.toSQLString();
    }
    System.out.println(sql);
    list = JdbcUtil.query(query, sql, new MapListHandler());
    //获取文件收集范围将节点类型，未来组卷方式具体值
    if(!list.isEmpty() && dataTable.equals("ess_document_stage")){
    	for(Map<String, Object> map:list){
    		if(map.get("isnode").equals("1")){
    			map.put("isnode", "节点");
    		}else if(map.get("isnode").equals("0")){
    			map.put("isnode", "文件");
    		}
    		if(map.get("paperWay").equals("0")){
    			map.put("paperWay", "");
    		}else if(map.get("paperWay").equals("1")){
    			map.put("paperWay", "单项工程");
    		}else if(map.get("paperWay").equals("2")){
    			map.put("paperWay", "整体项目");
    		}
    	}
    }
    return list;
  }

  @SuppressWarnings("unchecked")
  @Override
  public String importUpload(HttpServletRequest request,
      HttpServletResponse response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    HttpSession session = request.getSession();
    DiskFileItemFactory factory = new DiskFileItemFactory();
    factory.setSizeThreshold(2048);
    ServletFileUpload upload = new ServletFileUpload(factory);
    upload.setHeaderEncoding("UTF-8");
    String type = null;
    String userId = null;
    List<FileItem> fileItemList = new ArrayList<FileItem>();
    List<FileItem> items;
    try {

      items = upload.parseRequest(request);
      for (FileItem item : items) {
        if (item.getFieldName().equals("type")) {
          type = item.getString("UTF-8");
        } else if (item.getFieldName().equals("userId")) {
          userId = item.getString("UTF-8");
        } else if (!item.isFormField()) {
          fileItemList.add(item);
        }
      }
    } catch (FileUploadException e) {
      e.printStackTrace();
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    List<String> fnames = new ArrayList<String>();
    for (FileItem item : fileItemList) {
      if (item.getName() == null || "".equals(item.getName())) {
        continue;
      }
      fnames.add(item.getFieldName());
    }
    if (fnames.size() == 1 && fnames.get(0).endsWith("_document")) {
      return "不能只导入电子文件级数据！";
    }
    String msg = veryfyFileItem(fileItemList, type);
    if (msg.length() == 0) {
      if ("excel".equals(type)) {
        msg = parseExcel(fileItemList, session, userId);
      } else if ("dbf".equals(type)) {
        msg = parseDBF(fileItemList, session, userId);
      }
      if (msg.length() == 0) {
        msg = "success";
      }
    }
    return msg;
  }

  /**
   * 解析dbf文件 edit wanghongchen 20140723 修改dbf文件导入失败问题
   * 
   * @param fileItemList
   * @param filePaths
   * @return
   */
  private String preParseDBF(List<FileItem> fileItemList,
      Map<String, String> filePaths) {
    String msg = "";
    String tempPath = getTempPath();
    for (FileItem item : fileItemList) {
      if (item.getName() == null || "".equals(item.getName())) {
        continue;
      }
      if (item.getName().toLowerCase().endsWith("zip")) {
        ZipUtil zip = new ZipUtil();
        String fileFullPath = _upLoadFile(item, tempPath);
        // ninglong20111031 使用当前时间作为解压后的临时目录
        String tempZip = tempPath + System.currentTimeMillis();
        File fileZip = new File(tempZip);
        if (fileZip.exists()) {
          zip.clearDirectoryFiles(tempZip);
        }
        tempZip = ZipUtil.extZipFileList(fileFullPath, tempZip);
        File[] files = fileZip.listFiles();
        if (files == null) {
          msg = "文件\"" + item.getName() + "\"已被损坏，请重新打包！";// 的文件类型与选择的文件类型不一致
          break;
        }
        if (files.length > 2 || files.length == 0) {
          msg = "文件\"" + item.getName() + "\"包含两个以上的文件,请重新打包导入！";// 文件 的文件内容为空
          break;
        }
        if (files.length == 1) {
          msg = new ParseDBF().checkFile(files[0]);
          if (msg.length() > 0)
            break;
          boolean hasMeno = new ParseDBF().checkFileHasMeno(files[0]);
          if (!hasMeno) {// 如果此dbf包含备注类型
            msg = "文件\"" + item.getName() + "\"中的\"" + files[0].getName()
                + "\"包含备注类型的字段，请将其与相对应的后缀名为fpt的文件一起打包！";// 文件 的文件内容为空
          } else {
            FileOperateUtil.copyFileToDir(files[0], new File(tempPath));
            filePaths.put(tempPath + files[0].getName(), item.getFieldName());
          }
        } else {// 包含dbf和fpt
          // 第一个文件是dbf第二个是fpt
          if (files[0].getName().toLowerCase().endsWith("dbf")
              && files[1].getName().toLowerCase().endsWith("fpt")) {
            msg = new ParseDBF().checkFile(files[0]);
            if (msg.length() > 0)
              break;
            FileOperateUtil.copyFileToDir(files[0], new File(tempPath));
            FileOperateUtil.copyFileToDir(files[1], new File(tempPath));
            filePaths.put(tempPath + files[0].getName(), item.getFieldName());
            // 第一个文件是fpt第二个是dbf
          } else if (files[0].getName().toLowerCase().endsWith("fpt")
              && files[1].getName().toLowerCase().endsWith("dbf")) {
            msg = new ParseDBF().checkFile(files[1]);
            if (msg.length() > 0)
              break;
            FileOperateUtil.copyFileToDir(files[0], new File(tempPath));
            FileOperateUtil.copyFileToDir(files[1], new File(tempPath));
            filePaths.put(tempPath + files[1].getName(), item.getFieldName());
          } else {
            msg = "文件\"" + item.getName() + "\""
                + "应包含两个文件，一个的后缀名为dbf,另一个的后缀名fpt!";
            break;
          }
        }
        zip.clearDirectoryFiles(tempZip);// 删除临时文件
      } else {
        String fullPath = _upLoadFile(item, tempPath);
        File file = new File(fullPath);
        msg = new ParseDBF().checkFile(file);
        if (msg.length() > 0)
          break;
        boolean hasMeno = new ParseDBF().checkFileHasMeno(file);
        if (!hasMeno) {// 如果此dbf包含备注类型
          msg = "文件\"" + item.getName() + "\"中的\"" + file.getName()
              + "\"包含备注类型的字段，请将其与相对应的后缀名为fpt的文件一起打包！";// 文件 的文件内容为空
        } else {
          filePaths.put(tempPath + file.getName(), item.getFieldName());
        }
      }
    }
    return msg;
  }

  /**
   * 上传文件
   * 
   * @author wanghongchen 20140505
   * @param file
   * @param exportFilePath
   * @return
   */
  private String _upLoadFile(FileItem file, String exportFilePath) {
    String fileName = file.getName();
    if (fileName.lastIndexOf("\\") > 0) {
      fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
    }
    String fileFullPath = exportFilePath + fileName;
    try {
      File dir = new File(exportFilePath);
      if (!dir.exists()) {
        dir.mkdirs();
      }
      InputStream fileIn = null;
      FileOutputStream fileOut = null;
      fileIn = file.getInputStream();
      fileOut = new FileOutputStream(fileFullPath);
      int len = 0;
      byte[] buffer = new byte[8192];
      while ((len = fileIn.read(buffer, 0, 8192)) != -1) {
        fileOut.write(buffer, 0, len);
      }
      fileOut.close();
      fileIn.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return fileFullPath;
  }

  /**
   * 临时数据存放的位置
   * 
   * @author wanghongchen 20140505
   * @return
   */
  private String getTempPath() {
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos); // this.getParentPath(ClassLoader.getSystemResource("").getPath())
    return web_infPath.toString() + "data/";
  }

  /**
   * 解析dbf文件.
   * 
   * @author wanghongchen 20140508
   */
  private String parseDBF(List<FileItem> fileItemList, HttpSession session,
      String userId) {
    String msg = "";
    Map<String, String> filePaths = new LinkedHashMap<String, String>();
    msg = preParseDBF(fileItemList, filePaths);
    if (msg.length() > 0) {
      return msg;
    }
    try {
      Map<String, DataTable> dataTables = new HashMap<String, DataTable>();
      session.removeAttribute("dataTables");
      HashMap<String, Object> dataTablesMsg = new HashMap<String, Object>();
      /** 文件数量 **/
      dataTablesMsg.put("fileCount", fileItemList.size());
      dataTablesMsg.put("nowBuldFileNo", 1);
      /** 当前解析文件的总数 **/
      dataTablesMsg.put("allCount", 10000);
      /** 当前解析完多少行 **/
      dataTablesMsg.put("buildedNo", 0);
      /** 当前解析的工作薄 **/
      dataTablesMsg.put("sheetName", "");
      session.setAttribute("dataTablesMsg", dataTablesMsg);
      int no = 1;
      for (String dbfFile : filePaths.keySet()) {
        dataTablesMsg.put(
            "nowBuildFileName",
            ((filePaths.size() > 1) ? (no + "、") : "") + " 正在解析“"
                + dbfFile.substring(dbfFile.lastIndexOf("/") + 1) + "”文件");
        dataTablesMsg.put("nowBuldFileNo", no);
        DataTable dataTable = new DataTable();
        File file = new File(dbfFile);
        dataTable.initByDbf(file, session);
        dataTable.setName(file.getName());
        dataTables.put(filePaths.get(dbfFile), dataTable);
        no++;
      }
      imap.put(userId, dataTables); // 用静态map临时存取导入数据
    } catch (Exception e) {
      e.printStackTrace();
      msg = "解析文件出现问题，请检查文件是否损坏！";
    }
    return msg;
  }

  /**
   * 解析excel
   * 
   * @param fileItemList
   *          FileItem对象集合
   * @return 错误信息
   */
  private String parseExcel(List<FileItem> fileItemList, HttpSession session,
      String userId) {
    String msg = "";
    Map<String, String> filePaths = new LinkedHashMap<String, String>();
    msg = preParseExcel(fileItemList, filePaths);
    if (msg.length() > 0) {
      return msg;
    }
    try {
      HashMap<String, DataTable> dataTables = new HashMap<String, DataTable>();
      session.removeAttribute("dataTables");
      HashMap<String, Object> dataTablesMsg = new HashMap<String, Object>();
      /** 文件数量 **/
      dataTablesMsg.put("fileCount", fileItemList.size());
      dataTablesMsg.put("nowBuldFileNo", 1);
      /** 当前解析文件的总数 **/
      dataTablesMsg.put("allCount", 10000);
      /** 当前解析完多少行 **/
      dataTablesMsg.put("buildedNo", 0);
      /** 当前解析的工作薄 **/
      dataTablesMsg.put("sheetName", "");
      session.setAttribute("dataTablesMsg", dataTablesMsg);
      int no = 1;
      for (String excelFile : filePaths.keySet()) {
        dataTablesMsg.put(
            "nowBuildFileName",
            ((filePaths.size() > 1) ? (no + "、") : "") + " 正在解析“"
                + excelFile.substring(excelFile.lastIndexOf("/") + 1) + "”文件");
        dataTablesMsg.put("nowBuldFileNo", no);
        DataTable dataTable = new DataTable();
        File file = new File(excelFile);
        String tempExcelFile = excelFile;//保存之前的文件路径
        if (excelFile.toLowerCase().endsWith("xls")) {
          dataTable.initByExcel(file, session);
        } else {
          excelFile = file.toString();
          dataTable.initByXlsxExcel(excelFile, session);
        }
        dataTable.setName(file.getName());
        dataTables.put(filePaths.get(tempExcelFile), dataTable);
        no++;
      }
      // 用静态map临时存取导入数据
      imap.put(userId, dataTables);
    } catch (Exception e) {
      e.printStackTrace();
      msg = "解析文件出现问题，请检查文件是否损坏！";
    }
    return msg;
  }

  /**
   * 上传文件.
   * 
   * @param fileItemList
   * @return
   */
  private String preParseExcel(List<FileItem> fileItemList,
      Map<String, String> filePaths) {
    String msg = "";
    String tempPath = getTempPath();
    for (FileItem item : fileItemList) {
      if (item.getName() == null || "".equals(item.getName())) {
        continue;
      }
      String fileFullPath = _upLoadFile(item, tempPath);

      filePaths.put(fileFullPath, item.getFieldName());
    }
    return msg;
  }

  /**
   * 导入上传文件验证
   * 
   * @author wanghongchen 20140505
   * @param fileItemList
   * @return
   */
  private String veryfyFileItem(List<FileItem> fileItemList, String type) {
    String msg = "";
    if (fileItemList.size() == 0) {
      msg = "未找到所上传文件，请确认已选择文件！";
      return msg;
    }
    boolean flag = false;
    for (FileItem item : fileItemList) {
      String fileName = item.getName();
      if ("".equals(fileName)) {
        continue;
      }
      flag = true;
      if (item.getSize() <= 0) {
        msg = "文件\"" + fileName + "\"文件内容为空！";// 文件 的文件内容为空
        break;
      }
      if ("excel".equals(type)) {
        if (!ParseUtil.verifyExcel(fileName)) {
          msg = "文件\"" + fileName + "\"不是EXCEL文件！";
          break;
        }
      } else if ("dbf".equals(type)) {
        if (!fileName.toLowerCase().endsWith("zip")) {
          if (!ParseUtil.isDBF(fileName)) {
            msg = "文件\"" + fileName + "\"不是DBF文件！";
            break;
          }
        }
      } else {
        msg = "文件\"" + fileName + "\"不支持的文件格式！";
        break;
      }
    }
    if (!flag) {
      msg = "未找到所上传文件，请确认已选择文件！";
    }
    return msg;
  }

  @Override
  public Map<String, Object> showFileColumn(Map<String, String> map) {
    String path = map.get("path");
    String userId = map.get("userId");
    Map<String, Object> rtMap = new HashMap<String, Object>();
    List<Map<String, String>> rtList = new ArrayList<Map<String, String>>();
    List<Header> list = new ArrayList<Header>();
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTables = imap.get(userId);
    DataTable dataTable = dataTables.get(path);
    list = dataTable.getHeaders();
    if (null != list && list.size() > 0) {// 添加对空文件头的判断
      Map<String, String> vmap = null;
      for (Header title : list) {
        if ("".equals(title.getName())) {
          continue;
        }
        if ("_NullFlags".equals(title.getName())) {
          continue;
        }
        vmap = new HashMap<String, String>();
        vmap.put("sourceField", title.getName());
        vmap.put("type", title.getType());
        vmap.put("minLength", String.valueOf(title.getMinLength()));
        vmap.put("maxLength", String.valueOf(title.getMaxLength()));
        vmap.put("isnull", title.isNull());
        rtList.add(vmap);
      }
      rtMap.put("column", rtList);
      rtMap.put("total", rtList.size());
      rtMap.put("msg", "success");
    } else {
      rtMap.put("msg", "错误的文件头格式");
    }
    return rtMap;
  }

  @Override
  public Map<String, Object> showStructureColumn(Map<String, String> map) {
    String path = map.get("path");
    Map<String, Object> rtMap = new HashMap<String, Object>();
    List<Map<String, Object>> rtList = null;
    if (!path.endsWith("_document")) {
      rtList = new ArrayList<Map<String, Object>>();
      String[] arrStr = path.split("-");
      String treentype = arrStr[3];// 表名 path中第四个参数是表的名字
      // 根据path 获得当前导入节点对应的数据库元数据集合
      List<Map<String, Object>> fieldMapList = getFieldListByTatbleName(treentype);
      if (fieldMapList != null) {
        for (Map<String, Object> row : fieldMapList) {
          if (row.get("type") != null) {
            row.put("type", ValueType.valueOf(row.get("type") + "")
                .getDescription());
          }
          rtList.add(row);
        }
      }

    } else {
      rtList = getDocumentTags();
    }
    rtMap.put("total", rtList.size());
    rtMap.put("list", rtList);
    return rtMap;
  }

  @Override
  public List<HashMap<String, String>> getFileColumnModel(
      Map<String, String> map) {
    String path = map.get("path");
    String userId = map.get("userId");
    List<HashMap<String, String>> columnMapList = new ArrayList<HashMap<String, String>>();
    List<Header> list = new ArrayList<Header>();
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTabless = imap.get(userId);
    DataTable dataTable = dataTabless.get(path);
    list = dataTable.getHeaders();
    for (Header header : list) {
      HashMap<String, String> columnMap = new HashMap<String, String>();
      if (null == header.getName() || "".equals(header.getName().trim())) {
        continue;
      }
      columnMap.put("display", header.getName());
      columnMap.put("name", header.getName());
      columnMap.put("width", "80");
      columnMap.put("align", "left");
      columnMapList.add(columnMap);
    }
    return columnMapList;
  }

  @Override
  public Map<String, Object> getPreFileData(Map<String, String> map) {
    String path = map.get("path");
    String userId = map.get("userId");
    Map<String, Object> rtMap = new HashMap<String, Object>();
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTabless = imap.get(userId);
    DataTable dataTable = dataTabless.get(path);
    List<Map<String, String>> dataMapList = dataTable.getDataMapList(0, 0);
    rtMap.put("total", dataMapList.size());
    rtMap.put("list", dataMapList);
    return rtMap;
  }

  @Override
  public List<Map<String, Object>> getImportStructures(String userId) {
    List<Map<String, Object>> strMapList = new ArrayList<Map<String, Object>>();
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTables = imap.get(userId);
    Set<String> set = dataTables.keySet();
    Map<String, String> tmap = new HashMap<String, String>();
    tmap.put("userId", userId);
    for (String path : set) {
      if (path.endsWith("_document")) {
        Map<String, Object> documentMap = new HashMap<String, Object>();
        documentMap.put("id", path);
        documentMap.put("title", "电子文件级");
        documentMap.put("type", "document");
        documentMap.put("path", path);
        tmap.put("path", path);
        // 将excel数据的力模型组装进去，提示导入第二步界面性能
        documentMap.put("previewDataColumn", getFileColumnModel(tmap));
        strMapList.add(documentMap);
      } else {
        if (path != null && "".equals(path))
          ;
        String[] arrStr = path.split("-");

        String treenodeid = arrStr[0];
        String treecode = arrStr[1];
        String treename = arrStr[2];
        // 根据 获得的节点参数 获取此节点下所有的元数据信息
        // if (true) {
        HashMap<String, Object> strMap = new HashMap<String, Object>();
        strMap.put("id", treenodeid);
        strMap.put("title", treename + "级目录数据");
        strMap.put("type", treecode);
        strMap.put("path", path);
        // 将excel数据的力模型组装进去，提示导入第二步界面性能
        tmap.put("path", path);
        strMap.put("previewDataColumn", getFileColumnModel(tmap));
        strMapList.add(strMap);
        // }
      }
    }
    return strMapList;
  }

  private List<Map<String, Object>> getDocumentTags() {
    List<Map<String, Object>> rtList = new ArrayList<Map<String, Object>>();
    Map<String, Object> tagMap = null;
    tagMap = new HashMap<String, Object>();
    // 修改字段名称为中文
    tagMap.put("name", "文件标识");
    tagMap.put("type", "文本");
    tagMap.put("length", "60");
    tagMap.put("isNull", "否");
    rtList.add(tagMap);

    tagMap = new HashMap<String, Object>();
    tagMap.put("name", "文件类型");
    tagMap.put("type", "文本");
    tagMap.put("length", "45");
    tagMap.put("isNull", "否");
    rtList.add(tagMap);

    tagMap = new HashMap<String, Object>();
    tagMap.put("name", "文件标题");
    tagMap.put("type", "文本");
    tagMap.put("length", "50");
    tagMap.put("isNull", "否");
    rtList.add(tagMap);

    return rtList;
  }

  @Override
  public Map<String, Object> realImport(String userId,
      Map<String, Object> params) {
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> list = (List<Map<String, Object>>) params
        .get("data");
    // 判断是否为多级导入
    String style = "one"; // 只有一个文件导入
    if (list.size() == 2) {
      boolean hasDoc = false;
      for (Map<String, Object> map : list) {
        if (map.get("key").toString().endsWith("_document")) {
          hasDoc = true;
        }
      }
      if (hasDoc) {
        style = "innerAndDoc";
      }
    }
    Map<String, Object> resMap = new HashMap<String, Object>();
    if (style.equals("one")) {
      resMap = this.singleImport(list.get(0), userId, null);
    } else if (style.equals("innerAndDoc")) {
      Map<String, Object> dataMap = null;
      Map<String, Object> documentMap = null;
      for (Map<String, Object> map : list) {
        String key = map.get("key").toString();
        if (key.endsWith("_document")) {
          documentMap = map;
        } else {
          dataMap = map;
        }
      }
      resMap = this.singleImport(dataMap, userId, documentMap);
    }
    String path = params.get("path").toString();
    String[] pathArr = path.split("-");
    String treename = pathArr[2];
    String tableName = pathArr[3];
    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", params.get("ip"));
    log.put("userid", params.get("userId"));
    if("ess_document_stage".equals(tableName)){
    log.put("module", "文件收集范围");
    log.put("operate", "文件收集范围：导入数据");
    }else if("ess_document_type".equals(tableName)){
      log.put("module", "文件类型代码");
      log.put("operate", "文件类型代码：导入数据");
    }else if("ess_engineering".equals(tableName)){
      log.put("module", "文件专业代码");
      log.put("operate", "文件专业代码：导入数据");
    }
    log.put("loginfo", "导入数据节点：【"+treename+"】导入数据信息:【"+resMap.get("msg")+"】,导入数据标识：【"+resMap.get("ids")+"】");
    this.getLogService().saveLog(log);
    // 删掉缓存
    imap.remove(userId); // 用静态map临时存取导入数据
    return resMap;
  }

  /**
   * 导入单个文件
   * 
   * @param map
   * @param userId
   * @return
   */
  private Map<String, Object> singleImport(Map<String, Object> map,
      String userId, Map<String, Object> documentMap) {
    String path = map.get("key").toString();
    String[] pathArr = path.split("-");
    String treetype = pathArr[3];
    HashMap<String, String> tagMap = new HashMap<String, String>();
    List<Map<String, Object>> tagList = getFieldListByTatbleName(treetype);
    for (Map<String, Object> tag : tagList) {
      tagMap.put(tag.get("name") + "", tag.get("code") + "");
    }
    @SuppressWarnings("unchecked")
    List<Map<String, String>> stMatch = (List<Map<String, String>>) map
        .get("value");
    Map<String, String> kvMap = new HashMap<String, String>();
    for (Map<String, String> stmap : stMatch) {
      kvMap.put(stmap.get("source"), stmap.get("target"));
    }
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTables = imap.get(userId);
    DataTable dataTable = dataTables.get(path);
    // 要导入的excel中的数据
    List<Map<String, String>> excelDataMapList = dataTable.getDataMapList(0, 0);
    Map<String, Object> result = this.judgeDataIsRepeat(excelDataMapList, kvMap, tagMap, treetype, pathArr);
    @SuppressWarnings("unchecked")
	List<HashMap<String,String>> dataMapList = (List<HashMap<String,String>>)result.get("data");
    List<Map<String, Object>> stagenameList = new ArrayList<Map<String,Object>>();
    Map<String, Object> resMap = new HashMap<String, Object>();
    if (documentMap == null) {
      // 无电子文件数据
      Map<String, Object> insertResult = this.saveImportData(path, dataMapList);
      if (insertResult.size() >= 0) {
    	 if("ess_document_stage".equals(treetype)){
    		 for(HashMap<String,String> m : dataMapList){
    			 if(m.get("isnode").equals("节点")){
    				 stagenameList = this.getNodeDataByid(Long.valueOf(pathArr[0]),true);
    				 break;
    			 }else{
    				 continue;
    			 }
    		 }
    	 }
        if(dataMapList.size() < excelDataMapList.size()){
        	StringBuffer buffer = new StringBuffer();
        	buffer.append("已发现");
        	if(!"ess_document_stage".equals(treetype) && Integer.parseInt(result.get("codeCount").toString()) > 0){
        		buffer.append("【"+Integer.parseInt(result.get("codeCount").toString())+"】条数据中代码重复！");
        	}
        	if(result.get("nodeName")!=null && !"".equals(result.get("nodeName")) && !"null".equals(result.get("nodeName")) 
        			&& Integer.parseInt(result.get("codeCount").toString()) > 0){
        		String strName = result.get("nodeName").toString().substring(0, result.get("nodeName").toString().length()-1);
        		buffer.append("名称为【"+strName+"】数据中代码或名称重复！共【"+Integer.parseInt(result.get("codeCount").toString())+"】条数据无法导入！");
        	}
        	buffer.append("成功导入了" + insertResult.size() + "条数据！");
        	resMap.put("msg", buffer.toString());
          
        }else{
          resMap.put("msg", "成功导入了" + insertResult.size() + "条数据！");
        }
        //返回之中传回所有导入数据的id标识 添加日志信息
        StringBuilder sb = new StringBuilder();
        for (String key : insertResult.keySet()) {
             sb.append(insertResult.get(key)+",");
        }
        resMap.put("result", "success");
        if(!stagenameList.isEmpty()){
        	 resMap.put("stagenameList", stagenameList);
        }else{
        	 resMap.put("stagenameList", "null");
        }
        resMap.put("ids", sb.toString());
      } else {
        resMap.put("result", "exception");
        resMap.put("msg", "导入时发生了异常！");
      }
    } else {
      // 有电子文件数据
      resMap = importInnerAndDoc(map, documentMap, userId);
    }
    return resMap;
  }

  /**
   * 导入数据和电子文件
   * 
   * @param innerFileMap
   * @param documentMap
   * @param userId
   */
  private Map<String, Object> importInnerAndDoc(Map<String, Object> dataMap,
      Map<String, Object> documentMap, String userId) {
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTables = imap.get(userId);
    // 导入主数据
    String dataPath = dataMap.get("key").toString();
    List<HashMap<String, String>> dataMapList = this.getDataMapList(dataMap,
        dataTables);
    Map<String, Object> insertDate = this.saveImportData(dataPath, dataMapList);
    // 将主数据导入成功后tempId 对应数据库值 也就是电子文件关联的pid值替换
    // 导入电子文件
    List<HashMap<String, Object>> documentDataMapList = this.getDocDataMapList(
        documentMap, dataTables, insertDate);
    int documentNum = this.saveDocument(dataPath, documentDataMapList);
    Map<String, Object> resMap = new HashMap<String, Object>();
    StringBuilder rtStr = new StringBuilder();
    if (insertDate.size() >= 0 && documentNum >= 0) {
      rtStr.append("成功导入").append(insertDate.size()).append("条文件数据");
      rtStr.append(",").append(documentNum).append("条电子文件数据");
      resMap.put("result", "success");
      resMap.put("msg", rtStr.toString());
    } else {
      resMap.put("result", "exception");
      resMap.put("msg", "导入数据时发生异常");
    }
    return resMap;
  }

  private int saveDocument(String dataPath,
      List<HashMap<String, Object>> documentDataMapList) {
    if (documentDataMapList.isEmpty()) {
      return 0;
    }
    Set<String> columns = new HashSet<String>();
    columns.add("pid");
    columns.add("esfileid");
    columns.add("esfiletype");
    StringBuilder sql = new StringBuilder("insert into ess_document_file ");
    String values = "";
    String fields = "";
    for (String column : columns) {
      fields += column + ",";
      values += "?,";
    }
    if (!"".equals(fields) && !"".equals(values)) {
      fields = fields.substring(0, fields.length() - 1);
      values = values.substring(0, values.length() - 1);
      sql.append(" (" + fields + ") ");
      sql.append("values (" + values + ")");
    }
    // sql语句组装完毕 开始组装插入数据参数 批量插入
    Object[][] params = new Object[documentDataMapList.size()][];
    for (int i = 0; i < documentDataMapList.size(); i++) {
      Map<String, Object> map = documentDataMapList.get(i);
      Object[] row = new Object[columns.size()];
      int j = 0;
      for (String column : columns) {
        row[j] = map.get(column);
        j++;
      }
      params[i] = row;
    }
    try {
      if (params.length > 0) {
        int[] rows = query.batch(sql.toString(), params);
        return rows.length;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return -1;
    }
    return 0;

  }

  /**
   * 获取电子文件的tagMap
   * 
   * @return
   */
  public Map<String, String> getDocumentTagMap() {
    Map<String, String> tagMap = new HashMap<String, String>();
    tagMap.put("文件标识", "esfileid");
    tagMap.put("文件类型", "esfiletype");
    tagMap.put("文件标题", "estitle");
    return tagMap;
  }

  /**
   * 电子文件级，根据导入对应关系获取数据库字段与值的对应关系
   * 
   * @param map
   * @param dataTables
   * @return
   */
  private List<HashMap<String, Object>> getDocDataMapList(
      Map<String, Object> map, Map<String, DataTable> dataTables,
      Map<String, Object> insertData) {
    Map<String, String> tagMap = this.getDocumentTagMap();
    String path = map.get("key").toString();
    @SuppressWarnings("unchecked")
    List<Map<String, String>> stMatch = (List<Map<String, String>>) map
        .get("value");
    Map<String, String> kvMap = new HashMap<String, String>();
    // 页面数据的对应关系
    for (Map<String, String> stmap : stMatch) {
      kvMap.put(stmap.get("source"), stmap.get("target"));
    }
    DataTable dataTable = dataTables.get(path);
    List<Map<String, String>> excelDataMapList = dataTable.getDataMapList(0, 0);
    List<HashMap<String, Object>> dataMapList = new ArrayList<HashMap<String, Object>>();
    for (Map<String, String> hashMap : excelDataMapList) {
      HashMap<String, Object> dataMap = new HashMap<String, Object>();
      for (String key : kvMap.keySet()) {
        dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
      }
      // 这步很重要将pid 对应主数据在数据库中的真实id
      dataMap.put("pid", insertData.get(hashMap.get("tempId")));
      dataMapList.add(dataMap);
    }
    return dataMapList;
  }

  /**
   * 根据导入对应关系获取数据库字段与值的对应关系
   * 
   * @param map
   * @param dataTables
   * @return
   */
  private List<HashMap<String, String>> getDataMapList(Map<String, Object> map,
      Map<String, DataTable> dataTables) {
    String path = map.get("key").toString();
    String[] pathArr = path.split("-");
    String treetype = pathArr[0];
    String treenodeid = pathArr[1];
    String treecode = pathArr[2];
    HashMap<String, Object> param = new HashMap<String, Object>();
    param.put("treetype", treetype);
    param.put("treenodeid", treenodeid);
    param.put("treecode", treecode);

    HashMap<String, String> tagMap = new HashMap<String, String>();
    List<Map<String, Object>> tagList = this.getFieldsByTreetype(param);
    for (Map<String, Object> tag : tagList) {
      tagMap.put(tag.get("name") + "", tag.get("code") + "");
    }

    // 数据库字段名称 和 导入数据字段的对应关系
    @SuppressWarnings("unchecked")
    List<Map<String, String>> stMatch = (List<Map<String, String>>) map
        .get("value");
    Map<String, String> kvMap = new HashMap<String, String>();
    for (Map<String, String> stmap : stMatch) {
      kvMap.put(stmap.get("source"), stmap.get("target"));
    }
    DataTable dataTable = dataTables.get(path);
    List<Map<String, String>> excelDataMapList = dataTable.getDataMapList(0, 0);
    List<HashMap<String, String>> dataMapList = new ArrayList<HashMap<String, String>>();
    for (Map<String, String> hashMap : excelDataMapList) {
      HashMap<String, String> dataMap = new HashMap<String, String>();
      for (String key : kvMap.keySet()) {
        dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
      }
      dataMapList.add(dataMap);
    }
    return dataMapList;
  }

  /**
   * 将建立好的 数据map 导入到数据库
   * 
   * @param path
   * @param dataMapList
   * @return
   */
  private Map<String, Object> saveImportData(String path,
      List<HashMap<String, String>> dataMapList) {
    Map<String, Object> result = new HashMap<String, Object>();
    if (dataMapList.isEmpty()) {
      return result;
    }
    String[] pathArr = path.split("-");
    String treenodeid = pathArr[0];
    String treentype = pathArr[3];

    Set<String> columns = dataMapList.get(0).keySet();
    StringBuilder sql = new StringBuilder("insert into " + treentype + " ");
    String values = "";
    String fields = "";
    Integer level = 0;
    String id_seq = "";
    Map<String,Map<String,String>> tempmap = new HashMap<String,Map<String,String>>();
    int count = 0;// 统计参数个数
    for (String column : columns) {
      if ("id".equals(column))
        continue;
      if ("ess_document_stage".equals(treentype)) {
	      if ("pId".equals(column))
	          continue;
      }
      fields += column + ",";
      values += "?,";
      count++;
    }
    // 不同的表具有不同的 关系字段值 插入时需要保存
    if ("ess_document_stage".equals(treentype)) {
    	if (!"".equals(fields) && !"".equals(values)) {
    		fields = fields.substring(0, fields.length() - 1);
    	    values = values.substring(0, values.length() - 1);
    	}
    }else{
    	fields += "participatoryId ,";
        values += "'" + treenodeid + "',";
        if (!"".equals(fields) && !"".equals(values)) {
            fields = fields.substring(0, fields.length() - 1);
            values = values.substring(0, values.length() - 1);
            sql.append(" (" + fields + ") ");
            sql.append("values (" + values + ")");
        }
    }

    try {

      for (int i = 0; i < dataMapList.size(); i++) {
    	Map<String,String> temp = new HashMap<String,String>();//存储导入数据以前的id,以后的id
        Map<String, String> map = dataMapList.get(i);
        Object[] row = new Object[count];// 根据传参的个数 定义集合大小
        int j = 0;
        for (String column : columns) {
          if ("id".equals(column))
            continue;
          if ("ess_document_stage".equals(treentype)) {
        	  if ("pId".equals(column))
                  continue;
        	  if(map.get(column).equals("节点")){
        		  row[j] = "1";
        		  j++; continue;
        	  }else if(map.get(column).equals("文件")){
        		  row[j] = "0";
        		  j++; continue;
        	  }
        	  if(map.get(column) == null || "".equals(map.get(column)) || "null".equals(map.get(column))){
        		  row[j] = "0";
        		  j++; continue;
        	  }else if(map.get(column).equals("单项工程")){
        		  row[j] = "1";
        		  j++; continue;
        	  }else if(map.get(column).equals("整体项目")){
        		  row[j] = "2";
        		  j++; continue;
        	  }
          }
          row[j] = map.get(column);
          j++;
        }
        if ("ess_document_stage".equals(treentype)) {
    	  String filedTemp = "";//临时存储的字段
      	  String valueTemp = "";//临时存储的值
    	  if(tempmap.containsKey(map.get("pId"))){
    		  filedTemp += ",pId,level,id_seq";
    		  String p = tempmap.get(map.get("pId")).get("pId");
    		  Integer l = Integer.parseInt(tempmap.get(map.get("pId")).get("level"))+1;
    		  String seq = tempmap.get(map.get("pId")).get("id_seq")+ p + ".";
              valueTemp += ",'" + p + "' , '" + l + "' ,'" + seq+ "'";
    	  }else{
    		  Map<String, Object> stage = getStageById(Long.parseLong(treenodeid));
              if (Long.parseLong(treenodeid)== 0 || !stage.isEmpty()) {
            	 if (Long.parseLong(treenodeid)== 0){
            		 level = 1;
                     id_seq = treenodeid + ".";
            	 }else{
            		 level = Integer.parseInt(stage.get("level") + "") + 1;
                     id_seq = stage.get("id_seq") + "" + stage.get("id") + ".";
            	}
                filedTemp += ",pId,level,id_seq";
                valueTemp += ",'" + treenodeid + "' , '" + level + "' ,'" + id_seq + "'";
              }
    	  }
    	  if (!"".equals(filedTemp) && !"".equals(valueTemp)) {
    	      sql.append(" (" + fields + filedTemp +") ");
    	      sql.append("values (" + values + valueTemp + ")");
    	  }
        }
        Long id = query.insert(sql.toString(), new ScalarHandler<Long>(), row);
        if ("ess_document_stage".equals(treentype)) {//文件收集范围导入之间的父子关系
        	 sql = new StringBuilder("insert into " + treentype + " ");
             temp.put("pId", id+"");
             temp.put("level", level+"");
             temp.put("id_seq", id_seq);
             if(!tempmap.containsKey(map.get("id"))){//存入map中
             	tempmap.put(map.get("id"), temp);
             }
        }
        result.put(id+"", id);
      }

    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;

  }

  private String getServiceIP() {
    String url = this.getNamingService().findApp(this.getInstanceId(),
        "documentStage", this.getServiceId(), this.getToken());
    String temp = url.substring(url.indexOf("rest"), url.length());
    String outFile = url.replace(temp, "data/");
    return outFile;
  }

  // --------------导入导出 end-----------------------------------------

  @Override
  public String uniqueCode(String code) {
    String sql = "select count(id) from ess_document_stage where code=? ";
    try {
      long cnt = query.query(sql, new ScalarHandler<Long>(),
          new Object[] { code });
      if (cnt > 0) {
        return "false";
      }
      return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }

  @Override
  public String uniqueName(Map<String, Object> stage) {
    String sql = "select count(id) from ess_document_stage where pId=? and level=? and name=? ";
    try {
      Object lv = stage.get("level");
      if (lv != null) {
        long level = Long.parseLong(lv.toString());
        long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {
            stage.get("pId"), level, stage.get("name")});
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
  
  /***
   * 文件类型代码，专业代码，文件收集范围判断重复
   * @param excelDataMapList 需要导入的数据
   * @param kvMap 键值对集合
   * @param tagMap 
   * @param treetype 表
   * @param pathArr path
   * @return
   */
  private Map<String, Object> judgeDataIsRepeat(List<Map<String, String>> excelDataMapList,Map<String, String> kvMap,
      Map<String, String> tagMap,String treetype,String[] pathArr){
	Map<String, Object> result = new HashMap<String, Object>();
    List<HashMap<String, String>> dataMapList = new ArrayList<HashMap<String, String>>();
    Map<String, String> repeatmap = new HashMap<String, String>();
    String nodeName = "";//存储重复的数据名称
    int codeCount = 0;
    for (Map<String, String> hashMap : excelDataMapList) {
      HashMap<String, String> dataMap = new HashMap<String, String>();
      A:for (String key : kvMap.keySet()) {
        if(treetype.equals("ess_document_type")){//文件类型代码
          Map<String, Object> mapType = new HashMap<String,Object>();
          if(tagMap.get(kvMap.get(key)).equals("typeNo")){
            mapType.put("typeNo", hashMap.get(key));
            mapType.put("participatoryId", pathArr[0]);
            long count = this.getDocumentTypeService().uniqueTypeNo(mapType);
            if(count > 0){
            	codeCount++;
            	dataMap = new HashMap<String, String>();
            	break A;
            }
          }
          dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
        }else if(treetype.equals("ess_engineering")){//文件专业代码
          Map<String, Object> mapType = new HashMap<String,Object>();
          if(tagMap.get(kvMap.get(key)).equals("typeNo")){
            mapType.put("typeNo", hashMap.get(key));
            mapType.put("participatoryId", pathArr[0]);
            long count = this.getEngineeringService().uniqueTypeNo(mapType);
            if(count > 0){
            	codeCount++;
            	dataMap = new HashMap<String, String>();
                break A;
            }
          }
          dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
        }else if(treetype.equals("ess_document_stage")){//文件收集范围
        	if(repeatmap.containsKey(hashMap.get("pId"))){
        		codeCount++;
        		if(!repeatmap.containsKey(hashMap.get("id"))){//将过滤后的数据id存起来
        			repeatmap.put(hashMap.get("id"), hashMap.get("id"));
        		}
        		dataMap = new HashMap<String, String>();
        		break A;
        	}
        	if(tagMap.get(kvMap.get(key)).equals("code")){
	            String isrepeat = this.uniqueCode(hashMap.get(key));
	            if(isrepeat.equals("false")){
	            	codeCount++;
	            	repeatmap.put(hashMap.get("id"), hashMap.get("id"));
	            	nodeName += "["+hashMap.get("名称")+"],";
	            	dataMap = new HashMap<String, String>();
	                break A;
	            }
        	}
        	if(tagMap.get(kvMap.get(key)).equals("name")){
	            // 不同的表具有不同的 关系字段值 
	            Map<String, Object> stage = getStageById(Long.parseLong(pathArr[0]));
	            if(Long.parseLong(pathArr[0]) == 0 || !stage.isEmpty()){
	            	 Map<String, Object> mapStage = new HashMap<String,Object>();
	            	if(Long.parseLong(pathArr[0]) == 0){
	            		mapStage.put("pId", pathArr[0]);
		                 mapStage.put("level", 1);
		                 mapStage.put("name", hashMap.get(key));
	            	}else{
	            		Integer level = Integer.parseInt(stage.get("level") + "") + 1;
		                mapStage.put("pId", pathArr[0]);
		                mapStage.put("level", level);
		                mapStage.put("name", hashMap.get(key));
	            	}
	            	String namerepeat =  this.uniqueName(mapStage);
	                if(namerepeat.equals("false")){
	               	 codeCount++;
		            	 repeatmap.put(hashMap.get("id"), hashMap.get("id"));
		            	 nodeName += "["+hashMap.get("名称")+"],";
	               	 dataMap = new HashMap<String, String>();
	                    break A;
	                } 
	            }
        	}
            dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
          }else{
          dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
        }
      }
      if(!dataMap.isEmpty()){
    	  dataMapList.add(dataMap);
      }
    }
    result.put("data", dataMapList);
    result.put("codeCount", codeCount);
    result.put("nodeName", nodeName);
    return result;
  }
  
  /**
   * 获取父节点下的子级id_seq
   * @param ids
   * @return
   */
  private String getChildIdsByPid(String ids){
	  StringBuffer buffer = new StringBuffer();
	  try {
	     String sql = "select CONCAT(s.id_seq,s.id,'.') id_seq from ess_document_stage s where find_in_set(id,'"+ids+"')";
	     List<Map<String,Object>> list = query.query(sql, new MapListHandler());
	     for(Map<String,Object> map : list){
	    	 if(map.get("id_seq")!=null && !"".equals(map.get("id_seq")) && !"null".equals(map.get("id_seq"))){
	    		 buffer.append(" or id_seq like '"+map.get("id_seq")+"%' ");
	    	 }
	     }
	  }catch(SQLException e){
		  e.printStackTrace();
	  }
	  return buffer.toString();
	  
  }
  
  /**
   * 根据树节点获取节点id
   * @param id
   * @return
   */
  private List<Map<String,Object>> getNodeDataByid(long id,boolean isnode){
	  List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
	  try {
	     String sql = "select * from ess_document_stage where id_seq like (select CONCAT(s.id_seq,s.id,'.%') id_seq from ess_document_stage s where id = "+id+")";
	     if(id == 0){
	    	 sql = "select * from ess_document_stage where id_seq like '0.%'";
	     }
	     if(isnode){
	    	 sql += " and isnode = 1";
	     }
	     list = query.query(sql, new MapListHandler());
	  }catch(SQLException e){
		  e.printStackTrace();
	  }
	  return list;
	  
  }
}
