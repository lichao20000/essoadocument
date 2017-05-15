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
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ColumnListHandler;
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
import cn.flying.rest.service.IDocumentsCollectionService;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.IFolderWS;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IReportService;
import cn.flying.rest.service.entiry.EssFile;
import cn.flying.rest.service.entiry.EssFileId;
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
 * 文件收集后台服务
 * 
 * @author xuekun
 * 
 */
@Path("documentsCollection")
@Component
public class DocumentsCollectionServiceImpl extends BasePlatformService implements
    IDocumentsCollectionService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private IReportService reportService;
  private IMainFileServer mainFileServer;
  private String instanceId;

  @Value("${app.InstanceId}")
  public void setInstanceId(String instanceId) {
    this.instanceId = instanceId;
  }

  public String getInstanceId() {
    return this.instanceId;
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
  private MessageWS messageWS;

  public MessageWS getMessageWS() {
    if (messageWS == null) {
      this.messageWS = this.getService(MessageWS.class);
    }
    return messageWS;
  }

  private IFilingService filingService;

  public IFilingService getFilingService() {
    if (this.filingService == null) {
      this.filingService = this.getService(IFilingService.class);
    }
    return filingService;
  }

  public IMainFileServer getMainFileServer() {
    if (this.mainFileServer == null) {
      this.mainFileServer = this.getService(IMainFileServer.class);
    }
    return mainFileServer;
  }

  private ILogService logService;

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private IFolderWS folderWS;

  public IFolderWS getFolderWS() {
    if (this.folderWS == null) {
      this.folderWS = this.getService(IFolderWS.class);
    }
    return folderWS;
  }

  // 导入时存放临时数据
  private static Map<String, Map<String, DataTable>> imap =
      new HashMap<String, Map<String, DataTable>>();

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> add(HashMap<String, Object> map) {
    if (map.containsKey("stageId")) {
      Long stageId = Long.parseLong((String) map.get("stageId"));
      List<HashMap<String, String>> file = null;
      if (map.get("fileList") != null) {
        file = (List<HashMap<String, String>>) map.get("fileList");
        file.get(0).put("ip", map.get("ip") + "");
        file.get(0).put("userId", map.get("userId") + "");
        file.get(0).put("treename", map.get("treename") + "");
      }
      map.remove("fileList");
      String collectionType = (String) map.get("collectionType");
      Long dataid = 0l;
      if (StringUtils.equals(collectionType, "1")) {// 普通的文件收集
        dataid = this.insertIntoSysData(map, stageId);
        this.insertIntoStageData(map, dataid, stageId);
        if (file != null) {
          this.getFolderWS().addFile(dataid, 0l, file, false);
        }
      } else {
        List<HashMap<String, String>> filedataList = null;
        if (file != null) {
          int num = 0;// 标记
          for (HashMap<String, String> filedata : file) {// 批量文件收集
                                                         // 从附件中获取文件标题批量保存，批量挂接
            filedataList = new ArrayList<HashMap<String, String>>();
            filedata.put("ip", map.get("ip") + "");
            filedata.put("userId", map.get("userId") + "");
            filedata.put("treename", map.get("treename") + "");
            filedataList.add(filedata);
            String title = filedata.get("ESTITLE");
            /** lujixiang 20150320 **/
            // title = title.substring(0, title.lastIndexOf("."));
            map.put("title", title);
            // 更新文件编码的流水号
            long serialNum = 0;
            if (num > 0 && map.get("docNo") != null && !"".equals(map.get("docNo"))
                && !"null".equals(map.get("docNo"))) {
              String docNo = map.get("docNo").toString();
              String numStr = docNo.substring(docNo.length() - 4);
              for (int i = 0; i < numStr.length(); i++) {
                if (numStr.charAt(i) == '0') {
                  continue;
                } else {
                  serialNum = Long.valueOf(numStr.substring(i, numStr.length())) * 1 + 1;
                  break;
                }
              }
              String serialNumStr = "0001";
              if (serialNum > 0 && serialNum < 10) {
                serialNumStr = "000" + serialNum;
              } else if (serialNum >= 10 && serialNum < 100) {
                serialNumStr = "00" + serialNum;
              } else if (serialNum >= 100 && serialNum < 1000) {
                serialNumStr = "0" + serialNum;
              } else if (serialNum >= 1000) {
                serialNumStr = serialNum + "";
              }
              map.put("docNo", docNo.substring(0, docNo.length() - 4) + serialNumStr);
            }
            dataid = this.insertIntoSysData(map, stageId);
            num++;
            this.insertIntoStageData(map, dataid, stageId);
            this.getFolderWS().addFile(dataid, 0l, filedataList, false);
          }
        }
      }
      /*
       * try{ //修改文件编码的流水号 String sql1 =
       * "update ess_rule_docno set serialNum=serialNum+1 where stageId=?"; query.update(sql1,new
       * Object[] {stageId}); }catch (SQLException e) { e.printStackTrace(); }
       */
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      if ("ESCatalogCheck".equals(map.get("model") + "")) {
        log.put("module", "目录检查");
        log.put("operate", "目录检查：添加文件");
      } else {
        log.put("module", "文件收集");
        log.put("operate", "文件收集：添加文件");
      }

      log.put("loginfo", "为收集范围【" + map.get("stageName") + "】添加标题为【" + map.get("title") + "】收集文件");
      this.getLogService().saveLog(log);
      return (HashMap<String, Object>) get(dataid);
    } else {
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> addForm(Long stageId) {
    List<Map<String, Object>> essTaglist = new ArrayList<Map<String, Object>>();
    List<Map<String, Object>> hmList = getMetaAllList(stageId);
    if (hmList != null) {
      for (Map<String, Object> hm : hmList) {
        Map<String, Object> hashMap = new HashMap<String, Object>();
        hashMap.put("lable", hm.get("name"));
        hashMap.put("name", hm.get("code"));
        hashMap.put("type", hm.get("type"));
        hashMap.put("length", hm.get("length"));
        hashMap.put("dotLength", hm.get("dotLength"));
        hashMap.put("isSystem", hm.get("isSystem"));
        hashMap.put("isNull", hm.get("isNull"));
        hashMap.put("defaultValue", hm.get("defaultValue"));
        Map<String, Object> boolOptions = new HashMap<String, Object>();
        if (null != hm.get("type") && hm.get("type").toString().equals("BOOL")) {
          boolOptions.put("是", "1");
          boolOptions.put("否", "2");
          hashMap.put("options", boolOptions);
        }
        essTaglist.add(hashMap);
      }
      return essTaglist;
    }
    return null;
  }

  @Override
  public List<Map<String, Object>> getStageField(Long stageId) {
    List<Map<String, Object>> essTaglist = new ArrayList<Map<String, Object>>();
    List<Map<String, Object>> hmList = getMetaList(stageId, false);
    if (hmList != null) {
      for (Map<String, Object> hm : hmList) {
        Map<String, Object> hashMap = new HashMap<String, Object>();
        hashMap.put("lable", hm.get("name"));
        hashMap.put("name", hm.get("code"));
        hashMap.put("type", hm.get("type"));
        hashMap.put("length", hm.get("length"));
        hashMap.put("dotLength", hm.get("dotLength"));
        hashMap.put("isSystem", hm.get("isSystem"));
        hashMap.put("isNull", hm.get("isNull"));
        hashMap.put("defaultValue", hm.get("defaultValue"));
        Map<String, Object> boolOptions = new HashMap<String, Object>();
        if (null != hm.get("type") && hm.get("type").toString().equals("BOOL")) {
          boolOptions.put("是", "1");
          boolOptions.put("否", "2");
          hashMap.put("options", boolOptions);
        }
        essTaglist.add(hashMap);
      }
      return essTaglist;
    }
    return null;
  }

  @Override
  public String delete(Long[] ids, String userId, String ip) {
    if (ids == null || ids.length == 0) {
      return "参数错误";
    }
    List<String> originalids = getoriginalids(ids);
    String sql =
        "delete from ess_document where id=? and (transferstatus <> 'edit' or transferstatus is null)";
    String deleteSql = "delete from ess_document_file where find_in_set(pid,?)";
    String idStr = "";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] {ids[i]};
        idStr += ids[i] + ",";
      }
      int[] row = query.batch(sql, params);
      idStr = idStr.substring(0, idStr.length() - 1);
      if (row == null) {
        return "未发现数据";
      } else {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "文件收集");
        log.put("operate", "文件收集：删除文件");
        log.put("loginfo", "删除标识为【" + idStr + "】的文件");
        this.getLogService().saveLog(log);
        query.update(deleteSql, idStr);
        if (!originalids.isEmpty()) {
          this.updateFileState(originalids);
        }
        return "";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除数据失败";
    }
  }

  private List<String> getoriginalids(Long[] ids) {
    StringBuilder pids = new StringBuilder();
    for (int i = 0; i < ids.length; i++) {

      if (i != 0) {
        pids.append(",");
      }
      pids.append(ids[i]);
    }
    List<String> originalids = new ArrayList<String>();
    String sql = "select esfileid from ess_document_file where pid in(" + pids.toString() + ")";
    try {
      List<Map<String, Object>> dataList = query.query(sql, new MapListHandler());
      if (dataList != null) {
        for (Map<String, Object> dataMap : dataList) {
          originalids.add((String) dataMap.get("esfileid"));
        }
      }

    } catch (SQLException e) {
      e.printStackTrace();
    }
    return originalids;
  }

  private boolean updateFileState(List<String> originalids) {
    String sql = "update ess_file set esfilestate = '' where originalid = ? ";
    Object[][] params = new Object[originalids.size()][];
    boolean flag = true;
    for (int i = 0; i < originalids.size(); i++) {
      params[i] = new Object[] {originalids.get(i)};
    }
    try {
      int[] row = query.batch(sql, params);
      if (row == null) {
        flag = false;
      } else {
        flag = true;
        // 更新文件夹的挂接数
        this.getFolderWS().updateFloderHookNumberbatch(originalids, flag);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  @Override
  public Map<String, Object> get(Long id) {
    Map<String, Object> map = null;
    String sql = "select * from ess_document where id=? ";
    Object[] params = {id};
    try {
      map = JdbcUtil.query(query, sql, new MapHandler(), params);
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return map;
  }

  @Override
  public long getCount(HashMap<String, Object> map) {
    StringBuilder sql = new StringBuilder();
    List<Object> paramList = new ArrayList<Object>();

    /** lujixiang 20150324 修改获取记录条数sql **/
    /**
     * sql.append( "select count(1) from ess_document a ,ess_document_stage b where 1=1 "); if
     * (!StringUtils.isEmpty((String) map.get("stageCode"))) { Map<String, Object> stageMap =
     * getStageByCode((String) map.get("stageCode"));
     * sql.append(" and ( b.id_seq like ? or b.id= ?) "); paramList.add("'" + (String)
     * stageMap.get("id_seq") + stageMap.get("id") + ".%"); paramList.add(stageMap.get("id")); } if
     * (null != map.get("deviceCode") && !"".equals(map.get("deviceCode"))) {
     * sql.append(" and  a.deviceCode=? "); paramList.add(map.get("deviceCode")); } if (null !=
     * map.get("participatoryCode") && !"".equals(map.get("participatoryCode"))) {
     * sql.append(" and  a.participatoryCode=?"); paramList.add(map.get("participatoryCode")); }
     **/
    /** lujixiang 20150408 效率低，弃用 --start **/
    /**
     * sql.append(" select count(a.id) FROM"); sql.append(" ess_document a"); sql.append(
     * " LEFT JOIN ess_document_stage b ON a.stageCode = b.`code` and a.stageCode !='' and a.stageCode is not null"
     * ); sql.append(
     * " LEFT JOIN ess_device c ON a.deviceCode = c.deviceNo and a.deviceCode!='' and a.deviceCode is not null"
     * ); sql.append(
     * " LEFT JOIN ess_participatory d ON a.participatoryCode = d.`code` and a.participatoryCode !='' and a.participatoryCode is not null "
     * ); sql.append(" where 1=1 ");
     **/
    /** lujixiang 20150408 效率低，弃用 --start **/

    sql.append(" SELECT COUNT(1) ").append(" FROM ess_document a WHERE 1=1");

    if (!StringUtils.isEmpty((String) map.get("stageCode"))) {
      Map<String, Object> stageMap = getStageByCode((String) map.get("stageCode"));
      sql.append(" and ( b.id_seq like ? or b.id= ?) ");
      paramList.add("'" + (String) stageMap.get("id_seq") + stageMap.get("id") + ".%");
      paramList.add(stageMap.get("id"));
    }

    if (!StringUtils.isEmpty((String) map.get("deviceCode"))) {
      sql.append(" and  a.deviceCode in ");
      sql.append("(" + map.get("deviceCode") + ")");
    }
    if (!StringUtils.isEmpty((String) map.get("participatoryCode"))) {
      sql.append(" and  a.participatoryCode in ");
      sql.append("(" + map.get("participatoryCode") + ")");
    }

    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("where");
    if (null != where && where.size() != 0) {
      Condition cond = Condition.getConditionByList(where);
      sql.append(" and " + cond.toSQLString());
    }
    try {
      Object cnt =
          query.query(sql.toString(), new ScalarHandler<Long>(),
              paramList.toArray(new Object[paramList.size()]));
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  private String getDocNoRule(Long stageId) {
    String sql = "select tagids from ess_rule_docno where stageId= ? ";
    String tagids = null;
    try {
      tagids = query.query(sql, new ScalarHandler<String>(), new Object[] {stageId});
      if (tagids == null || "".equals(tagids) || "null".equals(tagids)) {// 判断当前文件收集范围节点，如果没有设置文件编码规则，则获取父节点的编码规则
        sql = "select id_seq from ess_document_stage where id = ?";
        String seqStr = query.query(sql, new ScalarHandler<String>(), new Object[] {stageId});
        if (seqStr != null && !"".equals(seqStr) && !"".equals(null)) {
          String[] arr = seqStr.split("\\.");
          for (int i = arr.length - 1; i >= 0; i--) {
            sql = "select tagids from ess_rule_docno where stageId= ? ";
            tagids = query.query(sql, new ScalarHandler<String>(), new Object[] {arr[i]});
            if (tagids == null || "".equals(tagids) || "null".equals(tagids)) {
              continue;
            } else {
              break;
            }
          }
          if (tagids == null || "".equals(tagids) || "null".equals(tagids)) {
            tagids = "";
          }
        } else {
          tagids = "";
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return tagids;
  }

  @Override
  public String getDocRuleTteration(Long stageId) {
    String docrule = getDocNoRule(stageId);
    if (!StringUtils.isEmpty(docrule)) {
      return docrule;
      /*
       * Long pId = this.getPidByStageId(stageId); if (pId != 0l) { docrule =
       * getDocRuleTteration(pId); }
       */
    } else {
      return "false";
    }
  }

  @Override
  public List<EssFile> getFileInfoByPath(Long dataId) {
    List<EssFile> essFiles = new ArrayList<EssFile>();
    EssFile file = null;
    EssFileId esFileId = null;
    String sql =
        " select a.folderId, a.esfileState, a.esmd5, a.essize, a.estitle, a.estype, a.createTime, a.originalId, "
            + " a.pdfId, a.swfId, a.fileVersion,c.Dept, c.EssType, b.espath folderPath, c.esFileType "
            + " from ess_file a, ess_folder b, ess_document_file c where c.esfileid = a.originalId "
            + " and c.pId = ? and a.folderId = b.id order by c.id ";
    try {
      List<EssFileId> essFileds =
          query.query(sql, new BeanListHandler<EssFileId>(EssFileId.class), new Object[] {dataId});

      if (essFileds == null) {
        essFileds = new ArrayList<EssFileId>();
      }
      for (int i = 0; i < essFileds.size(); i++) {
        file = new EssFile();
        esFileId = essFileds.get(i);
        esFileId.setFolderPath(getTitlePath(esFileId.getFolderPath()));
        // esFileId.setFileRead("true");
        // esFileId.setFileDown("true");
        // esFileId.setFilePrint("true");
        esFileId.setEssize((((Integer.parseInt(esFileId.getEssize()) / 1000) == 0) ? "1" : (Integer
            .parseInt(esFileId.getEssize()) / 1000)) + " kb");
        file.setId(esFileId);
        essFiles.add(file);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return essFiles;
  }

  /**
   * 获得某节点原数据和系统元数据
   * 
   * @param stageId
   * @return
   */
  private List<Map<String, Object>> getMetaAllList(Long stageId) {
    List<Map<String, Object>> list = null;
    try {
      String sql = " select * from ess_document_metadata m where ";
      if (stageId != null && stageId.longValue() != 0l) {
        sql +=
            " exists "
                + " ( select 1 from ess_document_stage a where exists "
                + "  ( select 1 from ess_document_stage b where (find_in_set( a.id, replace (b.id_seq, '.', ',')) "
                + " or a.id = b.id) and b.id = ? ) and (m.stageid = a.id or( m.stageId is null and m.isSystem= 0 ) ) )";
        list = query.query(sql, new MapListHandler(), stageId);
      } else {
        sql += " m.stageId is null and m.isSystem= 0 ";// 如果不存在
        list = query.query(sql, new MapListHandler());
      }
      // list = query.query(sql, new MapListHandler(), stageId);
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return list;

  }

  @Override
  public List<Map<String, Object>> getMetaData(Long stageId) {
    List<Map<String, Object>> hmList = this.getMetaList(stageId, true);
    List<Map<String, Object>> columnMapList = new ArrayList<Map<String, Object>>();
    HashMap<String, Object> columnMap = null;
    for (Map<String, Object> MetaData : hmList) {
      columnMap = new HashMap<String, Object>();
      // rongying 20150428 过滤掉后添加的系统字段，页面已显示了该字段的值，不再重复显示
      if (MetaData.get("code").equals("stageName") || MetaData.get("code").equals("deviceName")
          || MetaData.get("code").equals("participatoryName")
          || MetaData.get("code").equals("stageId") || MetaData.get("code").equals("stageCode")
          || MetaData.get("code").equals("deviceCode")
          || MetaData.get("code").equals("participatoryCode")
          || MetaData.get("code").equals("itemName") || MetaData.get("code").equals("documentCode")
          || MetaData.get("code").equals("engineeringCode")) {
        continue;
      }
      columnMap.put("display", MetaData.get("name"));
      columnMap.put("name", MetaData.get("code"));
      Integer width = Integer.parseInt(String.valueOf(MetaData.get("length")));
      if (width < 60) {
        width = 60;
      }
      if (width > 200) {
        width = 200;
      }
      columnMap.put("width", String.valueOf(width));
      if (MetaData.get("type").equals(VALUETYPES.TYPE.TEXT.name())) {
        columnMap.put("align", "left");
      } else if (MetaData.get("type").equals(VALUETYPES.TYPE.NUMBER.name())) {
        columnMap.put("align", "right");
      } else {
        columnMap.put("align", "center");
      }
      columnMapList.add(columnMap);
    }
    return columnMapList;
  }

  /**
   * 获得某收集范围和其父节点的元数据集合
   * 
   * @param stageId
   * @return
   */
  private List<Map<String, Object>> getMetaList(Long stageId, boolean includeSystem) {
    List<Map<String, Object>> list = null;
    String sql =
        " select * from ess_document_metadata m where exists "
            + " ( select 1 from ess_document_stage a where exists "
            + " ( select 1 from ess_document_stage b where (find_in_set( a.id, replace (b.id_seq, '.', ',')) "
            + " or a.id = b.id) and b.id = ? ) and m.stageid = a.id ";
    if (includeSystem) {
      sql += "or ( m.stageId is null  and m.isSystem = 0   ) ";
    }
    sql += ") order by m.issystem,m.id ";
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

  @SuppressWarnings("unused")
  private Long getPidByStageId(long stageId) {
    Long pId = null;
    String sql = "select pId from ess_document_stage where id= ? ";
    try {
      Object object = query.query(sql, new ScalarHandler<Object>(), new Object[] {stageId});
      pId = Long.parseLong(object.toString());
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return pId;
  }

  private IReportService getReportService() {
    if (reportService == null) {
      reportService = this.getService(IReportService.class);
    }
    return reportService;
  }

  private Map<String, Object> getStageByCode(String code) {
    Map<String, Object> map = null;
    String sql = "select * from ess_document_stage where code= ? ";
    try {
      map = query.query(sql, new MapHandler(), new Object[] {code});
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  public Map<String, Object> getStageById(Long stageId) {
    Map<String, Object> map = null;
    String sql = "select * from ess_document_stage where id= ? ";
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

  /**
   * 获取一条数据记录
   * 
   * @param stageId
   * @param id
   * @return
   */
  @Override
  public Map<String, Object> getStageData(Long stageId, Long id) {
    StringBuilder fileds = new StringBuilder();
    StringBuilder fileds2 = new StringBuilder();
    List<Map<String, Object>> hmList = getMetaList(stageId, true);
    for (Map<String, Object> hm : hmList) {
      if (hm.get("isSystem").equals("0")) {
        fileds.append(",");
        fileds.append("a.");
        fileds.append(hm.get("code"));
      } else {
        fileds2.append(",");
        fileds2.append("b.");
        fileds2.append(hm.get("code"));
      }
    }
    String tableName = "esp_" + stageId;
    Map<String, Object> dataMap = null;
    StringBuilder sql = new StringBuilder();

    /** lujixiang 20150409 **/
    /**
     * sql.append(" SELECT a.id,"); sql.append(" c.`name` stageName, ");
     * sql.append(" d.`name` deviceName, "); sql.append(" e.`name` participatoryName, ");
     * sql.append(fileds.substring(fileds.indexOf(",") + 1, fileds.length())); sql.append(" FROM ");
     * sql.append(" ess_document a "); if (judgeIfExistsTable(tableName)) {
     * sql.append(" LEFT JOIN ").append(tableName ).append(" b ON a.id = b.documentId "); }
     * sql.append(" LEFT JOIN ess_document_stage c ON a.stageCode = c.`code` ");
     * sql.append(" AND a.stageCode != '' "); sql.append(" AND a.stageCode IS NOT NULL ");
     * sql.append(" LEFT JOIN ess_device d ON a.deviceCode = d.deviceNo ");
     * sql.append(" AND a.deviceCode != '' "); sql.append(" AND a.deviceCode IS NOT NULL ");
     * sql.append( " LEFT JOIN ess_participatory e ON a.participatoryCode = e.`code` ");
     * sql.append(" AND a.participatoryCode != '' ");
     * sql.append(" AND a.participatoryCode IS NOT NULL ");
     **/

    sql.append(" SELECT a.id,");
    sql.append(fileds.substring(fileds.indexOf(",") + 1, fileds.length()));
    if (judgeIfExistsTable(tableName)) {
      sql.append(fileds2);
    }
    sql.append(" FROM ");
    sql.append(" ess_document a ");
    if (judgeIfExistsTable(tableName)) {
      sql.append(" LEFT JOIN ").append(tableName).append(" b ON a.id = b.documentId ");
    }
    sql.append(" WHERE  a.id = ? ");
    Object[] params = {id};
    dataMap = JdbcUtil.query(query, sql.toString(), new MapHandler(), params);
    if (dataMap == null) {
      dataMap = new HashMap<String, Object>();
    }
    return dataMap;
  }

  private Map<String, Object> getStageDataByTableName(String fields, String tablename,
      Integer documentId) {
    Map<String, Object> map = null;
    String sql = "select " + fields + " from " + tablename + " where documentId=?";

    try {
      map = query.query(sql, new MapHandler(), new Object[] {documentId});
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public Long getStageDataCount(Long stageId, String ids, HashMap<String, Object> map) {

    /** lujixiang 20150408 为了保持按阶段、按部门、按装置数据一致性,需要对ess_document查询所有数据时不做任何连接查询 **/
    Map<String, Object> stageMap = new HashMap<String, Object>();
    StringBuilder sql = new StringBuilder();
    Long cnt = 0l;
    Condition cond = null;

    /** 筛选条件 **/
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("where");
    if (null != where && where.size() != 0) {
      cond = Condition.getConditionByList(where);
    }

    if (stageId == 0) {
      /**
       * stageMap.put("code", "文件收集范围"); stageMap.put("id", 0); stageMap.put("id_seq", "");
       **/
      sql.append("select count(1) from ess_document a ");
      if (null != cond) {
        sql.append(" where "
            + cond.toSQLString("a").replaceAll("a.OR", "OR").replaceAll("a.AND", "AND"));
      }
      try {
        cnt = query.query(sql.toString(), new ScalarHandler<Long>());
      } catch (SQLException e) {
        e.printStackTrace();
      }

    } else {
      stageMap = getStageById(stageId);

      String stageCode = (String) stageMap.get("code");
      if (StringUtils.isEmpty(stageCode)) {
        return cnt;
      }

      List<Object> paramList = new ArrayList<Object>();
      sql.append("select count(1) from ess_document a inner join ess_document_stage b on a.stageId=b.id ");
      if (!"0".equals(ids)) {
        sql.append(" and FIND_IN_SET(b.pId,'" + ids + "') ");
      }
      sql.append(" and ( b.id_seq like ? or b.id= ?) ");
      paramList.add((String) stageMap.get("id_seq") + stageMap.get("id") + ".%");
      paramList.add(stageMap.get("id"));

      String deviceCode = (String) map.get("deviceCode");
      if (null != deviceCode && !"".equals(deviceCode)) {
        sql.append(" and a.deviceCode = ?");
        paramList.add(deviceCode);
      }

      if (null != cond) {
        sql.append(" and "
            + cond.toSQLString("a").replaceAll("a.OR", "OR").replaceAll("a.AND", "AND"));
      }

      try {
        cnt =
            query.query(sql.toString(), new ScalarHandler<Long>(),
                paramList.toArray(new Object[paramList.size()]));
      } catch (SQLException e) {
        e.printStackTrace();
      }

    }

    return cnt;
  }

  @Override
  public List<Map<String, Object>> getStageDataList(Integer page, Integer rp, Long stageId,
      String ids, HashMap<String, Object> map) {

    Map<String, Object> stageMap = new HashMap<String, Object>();
    StringBuffer sql = new StringBuffer();
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("where");
    List<Object> paramList = new ArrayList<Object>();
    Condition cond = null;
    if (null != where && where.size() != 0) {
      cond = Condition.getConditionByList(where);
      // sql.append(" and " + cond.toSQLString("a"));
    }

    List<Map<String, Object>> list = null;
    StringBuffer fileds = new StringBuffer();
    List<Map<String, Object>> hmList = getSysMeta(); // 只获取并显示系统字段
    fileds.append("a.id");
    for (Map<String, Object> hm : hmList) {
      fileds.append(",").append("a.");
      fileds.append(hm.get("code"));
    }

    if (stageId == 0) {
      /**
       * stageMap.put("code", "文件收集范围"); stageMap.put("id", 0); stageMap.put("id_seq", "");
       **/
      sql.append(" SELECT ").append(fileds.toString()).append(" FROM ess_document a WHERE 1 = 1 ");

    } else {
      stageMap = getStageById(stageId);

      String stageCode = (String) stageMap.get("code");

      if ("".equals(stageCode)) {
        return new ArrayList<Map<String, Object>>();
      }

      /** lujixiang 20150403 多表效率低，弃用 --start **/
      /**
       * StringBuilder fileds = new StringBuilder(
       * "a.id,a.itemName,a.stageCode,a.deviceCode,a.participatoryCode,a.title,a.docNo,a.person,a.date,a.documentCode,a.engineeringCode"
       * ); List<Map<String, Object>> hmList = getSysMeta();// xiewenda 只获得系统字段 这里如果不对请修改 for
       * (Map<String, Object> hm : hmList) { fileds.append(",a."); fileds.append(hm.get("code")); }
       * List<Map<String, Object>> list = null; List<Object> paramList = new ArrayList<Object>();
       * StringBuilder sql = new StringBuilder(); sql.append(" SELECT ");
       * sql.append(" c.`name` stageName, "); sql.append(" d.`name` deviceName, ");
       * sql.append(" e.`name` participatoryName, "); sql.append(" c.id stageId, ");
       * sql.append(fileds.toString()); sql.append(" FROM "); sql.append(" ess_document a ");
       * sql.append( " inner JOIN ess_document_stage c ON a.stageCode = c.`code` ");
       * sql.append(" AND a.stageCode != '' "); sql.append(" AND a.stageCode IS NOT NULL ");
       * sql.append(" LEFT JOIN ess_device d ON a.deviceCode = d.deviceNo ");
       * sql.append(" AND a.deviceCode != '' "); sql.append(" AND a.deviceCode IS NOT NULL ");
       * sql.append( " LEFT JOIN ess_participatory e ON a.participatoryCode = e.`code` ");
       * sql.append(" AND a.participatoryCode != '' ");
       * sql.append(" AND a.participatoryCode IS NOT NULL "); sql.append(" where 1=1 ");
       * sql.append(" and ( c.id_seq like ? or c.id= ?) ");
       **/
      /** lujixiang 20150403 多表效率低，弃用 --end **/

      /**
       * lujixiang 20150403 连接查询ess_document和ess_document_stage,注意为这两张表建立索引 --start
       **/
      sql.append(" SELECT ").append(fileds.toString()).append(" FROM ess_document a ")
          .append(" INNER JOIN ess_document_stage b ").append(" ON a.stageId = b.id ");
      if (!"0".equals(ids)) {
        sql.append(" and FIND_IN_SET(b.pId,'" + ids + "') ");
      }
      sql.append(" AND (b.id_seq LIKE ? OR b.id = ?)  ");

      /**
       * lujixiang 20150403 连接查询ess_document和ess_document_stage,注意为这两张表建立索引 --end
       **/

      paramList.add((String) stageMap.get("id_seq") + stageMap.get("id") + ".%");
      paramList.add(stageMap.get("id"));

      String deviceCode = (String) map.get("deviceCode");
      if (null != deviceCode && !"".equals(deviceCode)) {
        sql.append(" and a.deviceCode = ?");
        paramList.add(deviceCode);
      }

    }

    if (null != cond) {
      sql.append(" AND "
          + cond.toSQLString("a").replaceAll("a.OR", "OR").replaceAll("a.AND", "AND"));
    }

    if (null != page && null != rp) {
      int start = (page - 1) * rp;
      sql.append(" order by id limit ?,?");
      paramList.add(start);
      paramList.add(rp);
    }
    try {
      System.out.println(sql.toString() + paramList);
      list = query.query(sql.toString(), new MapListHandler(), paramList.toArray());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      } else {
        List<Map<String, Object>> stageMetaList = getMetaList(stageId, false);
        if (stageMetaList != null && stageMetaList.size() > 0) {
          String fields = "";

          for (Map<String, Object> hm : stageMetaList) {
            fields += (String) hm.get("code") + ",";
          }
          fields = fields.substring(0, fields.lastIndexOf(","));
          for (Map<String, Object> documentData : list) {
            Integer dateStageId = (Integer) documentData.get("stageId");
            if (judgeIfExistsTable("esp_" + dateStageId)) {// 判断表是否存在
              Map<String, Object> data =
                  getStageDataByTableName(fields, "esp_" + dateStageId,
                      (Integer) documentData.get("id"));
              documentData.putAll(data);
            }
          }
        }

      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return list;
  }

  @Override
  public long getStageId(Long id) {
    String sql =
        "select b.id from ess_document a,ess_document_stage b where a.stageCode=b.`code` and a.id=?";
    Object[] params = {id};
    try {
      Object cnt = query.query(sql.toString(), new ScalarHandler<Long>(), params);
      if (cnt != null) {
        return Long.parseLong(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return 0;
  }

  private List<Map<String, Object>> getSysMeta() {
    List<Map<String, Object>> list = null;
    String sql = " select * from ess_document_metadata  where isSystem= 0";
    try {
      list = query.query(sql, new MapListHandler());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return list;
  }

  public String getTitlePath(String path) {
    String ids = path.replace("/Folder_", "").replace("@_", ",");
    String titlePath = null;
    String sql =
        "select group_concat(a.estitle separator '/') titlePath  from ess_folder a where id in ("
            + ids + ");";
    try {
      titlePath = query.query(sql, new ScalarHandler<String>());
      if (titlePath == null) {
        titlePath = "";
      }
    } catch (SQLException e) {
      titlePath = "";
      e.printStackTrace();
    }

    return titlePath;
  }

  /**
   * 动态表添加个性字段数据
   * 
   * @param map
   * @return
   */
  private boolean insertIntoStageData(HashMap<String, Object> map, Long dataid, Long stageId) {
    List<Map<String, Object>> columnes = getMetaList(stageId, false);
    if (columnes.size() > 0) {
      String tableName = "esp_" + map.get("stageId").toString();
      if (judgeIfExistsTable(tableName)) {
        StringBuilder sql =
            new StringBuilder("insert into ").append(tableName).append("( documentId");
        StringBuilder dbtag = new StringBuilder("?");
        ArrayList<Object> paramList = new ArrayList<Object>();
        paramList.add(dataid);
        for (int i = 0; i < columnes.size(); i++) {
          sql.append(",");
          dbtag.append(",");
          sql.append(columnes.get(i).get("code"));
          dbtag.append("?");
          paramList.add(map.get(columnes.get(i).get("code")));
        }
        sql.append(") values (").append(dbtag.toString()).append(")");
        JdbcUtil.update(query, sql.toString(), paramList.toArray());
      }
    }
    return true;
  }

  /**
   * 添加系统字段数据到系统表
   * 
   * @param map
   * @return
   */
  private Long insertIntoSysData(HashMap<String, Object> map, Long stageId) {
    List<Map<String, Object>> columnes = getSysMeta();
    if (columnes.size() > 0) {
      /*
       * rongying 20150424 文件编码已在前台页面设置获取，可以直接添加入库，不需要再重设 // 获取文件编码规则 String docRule =
       * getDocRuleTteration(stageId); String[] tags = docRule.split(","); String docNo = ""; //
       * 获取该节点下的所有字段 List<Map<String, Object>> allMeta = getMetaList(stageId, true); for (int i = 0;
       * i < tags.length; i++) { String tag = tags[i]; if (tag.indexOf("true") > -1) { for
       * (Map<String, Object> dataMap : allMeta) { if
       * (StringUtils.equals(String.valueOf(dataMap.get("id")), tag.split("\\|")[0])) { docNo +=
       * map.get(dataMap.get("code")); break; } } } else { docNo += tag.split("\\|")[0]; } }
       * //map.put("docNo", this.getNewDocNo(docNo));
       */
      StringBuilder sql = new StringBuilder("insert into ess_document (");
      StringBuilder dbtag = new StringBuilder();
      ArrayList<Object> paramList = new ArrayList<Object>();
      int aa = 0;
      for (int i = 0; i < columnes.size(); i++) {
        Object value = map.get(columnes.get(i).get("code"));
        if (!"".equals(value)) {
          aa++;
          if (aa > 1) {
            sql.append(",");
            dbtag.append(",");
          }
          sql.append(columnes.get(i).get("code"));
          dbtag.append("?");
          paramList.add(value);
        }
      }
      sql.append(") values (").append(dbtag.toString()).append(")");
      return JdbcUtil.insert(query, sql.toString(), paramList.toArray());
    } else {
      return 0l;
    }
  }

  /**
   * 只显示系统元数据的字段
   */
  @Override
  public List<Map<String, Object>> list(Integer page, Integer rp, HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    StringBuilder sql = new StringBuilder();
    List<Object> paramList = new ArrayList<Object>();
    /** lujixiang 20150409 **/
    /**
     * sql.append(" select "); sql.append(" b.`name` stageName,");
     * sql.append(" c.`name` deviceName,"); sql.append(" d.`name` participatoryName,");
     * sql.append(" a.*"); sql.append(" FROM"); sql.append(" ess_document a"); sql.append(
     * " LEFT JOIN ess_document_stage b ON a.stageCode = b.`code` and a.stageCode !='' and a.stageCode is not null"
     * ); sql.append(
     * " LEFT JOIN ess_device c ON a.deviceCode = c.deviceNo and a.deviceCode!='' and a.deviceCode is not null"
     * ); sql.append(
     * " LEFT JOIN ess_participatory d ON a.participatoryCode = d.`code` and a.participatoryCode !='' and a.participatoryCode is not null "
     * ); sql.append(" where 1=1 ");
     **/
    StringBuffer fileds = new StringBuffer();
    List<Map<String, Object>> hmList = getSysMeta(); // 只获取并显示系统字段
    fileds.append("a.id");
    for (Map<String, Object> hm : hmList) {
      fileds.append(",").append("a.");
      fileds.append(hm.get("code"));
    }
    sql.append(" SELECT ").append(fileds.toString()).append(" FROM ess_document a WHERE 1 = 1 ");

    if (!StringUtils.isEmpty((String) map.get("stageCode"))) {
      Map<String, Object> stageMap = getStageByCode((String) map.get("stageCode"));
      sql.append(" and ( b.id_seq like ? or b.id= ?) ");
      paramList.add("'" + (String) stageMap.get("id_seq") + stageMap.get("id") + ".%");
      paramList.add(stageMap.get("id"));
    }
    if (!StringUtils.isEmpty((String) map.get("deviceCode"))) {
      sql.append(" and  a.deviceCode in ");
      sql.append("(" + map.get("deviceCode") + ")");
    }
    if (!StringUtils.isEmpty((String) map.get("participatoryCode"))) {
      sql.append(" and  a.participatoryCode in ");
      sql.append("(" + map.get("participatoryCode") + ")");
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("where");
    if (null != where && where.size() != 0) {
      Condition cond = Condition.getConditionByList(where);
      sql.append(" and " + cond.toSQLString());
    }
    if (null != page && null != rp) {
      int start = (page - 1) * rp;
      sql.append(" limit ?,?");
      paramList.add(start);
      paramList.add(rp);
    }
    list =
        JdbcUtil.query(query, sql.toString(), new MapListHandler(),
            paramList.toArray(new Object[paramList.size()]));
    if (list == null) {
      list = new ArrayList<Map<String, Object>>();
    }
    return list;
  }

  @Override
  public String printReport(HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    Object reportId = map.get("reportId");
    String localFile = null;
    try {
      StringBuilder sql = new StringBuilder();
      List<Object> paramList = new ArrayList<Object>();
      String parentStageId = "";
      sql.append(" select ");
      sql.append(" a.*");
      sql.append(" FROM");
      sql.append(" ess_document a , ess_document_stage b");
      sql.append(" where a.stagecode=b.code ");
      if (!StringUtils.isEmpty((String) map.get("stageCode"))) {
        Map<String, Object> stageMap = getStageByCode((String) map.get("stageCode"));
        long treenodeid = Long.parseLong(stageMap.get("id").toString());
        List<Map<String, Object>> returnList =
            this.getFilingService().getChildrenStageIds(treenodeid);
        List<String> childrenStageId = new ArrayList<String>();
        for (Map<String, Object> returnMap : returnList) {
          String mapId = returnMap.get("id").toString();
          if (this.tableIfExists(mapId)) {
            childrenStageId.add(mapId);
          }
        }
        String colName = "";
        if (childrenStageId.size() > 0) {
          parentStageId = this.getFilingService().getParentStageIds(treenodeid);
          colName = this.getFilingService().getColsCode(parentStageId);
        }
        String sql1 = "select * from (select dc.*";
        if (!"".equals(colName) && colName != null) {
          String[] str = colName.split(",");
          for (int i = 0; i < str.length; i++) {
            sql1 += ",esp." + str[i];
          }
        }
        sql1 += " from ess_document as dc ";
        if (!"".equals(colName) && colName != null) {
          sql1 += " LEFT JOIN (";
          for (String childrenStage : childrenStageId) {
            sql1 += " (select " + colName + " from esp_" + childrenStage + ") UNION ";
          }
          sql1 = sql1.substring(0, sql1.lastIndexOf("UNION"));
          sql1 += ") as esp ON dc.id=esp.documentId ";
        }
        sql1 += ") as a where 1=1 ";
        sql.setLength(0);
        sql.append(sql1);
      }
      if (!StringUtils.isEmpty((String) map.get("deviceCode"))) {
        sql.append(" and  a.deviceCode=? ");
        paramList.add(map.get("deviceCode"));
      }
      if (!StringUtils.isEmpty((String) map.get("participatoryCode"))) {
        sql.append(" and  a.participatoryCode=?");
        paramList.add(map.get("participatoryCode"));
      }
      @SuppressWarnings("unchecked")
      List<String> where = (List<String>) map.get("where");
      if (null != where && where.size() != 0) {
        Condition cond = Condition.getConditionByList(where);
        sql.append(" and "
            + cond.toSQLString("a").replaceAll("a.OR", "OR").replaceAll("a.AND", "AND"));
      }
      list =
          query.query(sql.toString(), new MapListHandler(),
              paramList.toArray(new Object[paramList.size()]));
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
      List<Map<String, Object>> metaList = this.getFilingService().findMoveCols(2, parentStageId);
      Map<String, String> metaAll = new HashMap<String, String>();
      for (Map<String, Object> metaMap : metaList) {
        metaAll.put((String) metaMap.get("code"), (String) metaMap.get("name"));
      }
      List<Map<String, Object>> newList = new ArrayList<Map<String, Object>>();
      Map<String, Object> newmap = new HashMap<String, Object>();
      for (Map<String, Object> dataMap : list) {
        newmap = new HashMap<String, Object>();
        for (Map.Entry<String, Object> data : dataMap.entrySet()) {
          if (metaAll.containsKey(data.getKey())) {
            newmap.put(metaAll.get(data.getKey()), data.getValue());
          }
        }
        newList.add(newmap);
      }
      Map<String, Object> params = new HashMap<String, Object>();
      params.put("reportId", reportId);
      params.put("reportData", newList);
      params.put("userid", "admin");
      params.put("username", "管理员");
      params.put("reportTitle", "文件收集(PDF)");
      params.put("reportType", "pdf");
      localFile = this.getReportService().runReportManager(params);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return localFile;
  }

  @Override
  public String update(HashMap<String, String> map) {
    if (map.containsKey("id")) {
      Long stageId = Long.parseLong((String) map.get("stageId"));
      String msg = this.updateIntoSysData(map, stageId);
      this.updateIntoStageData(map);

      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "文件收集");
      log.put("operate", "文件收集：修改文件");
      log.put("loginfo", "修改文件收集范围标识为【" + stageId + "】的文件");
      this.getLogService().saveLog(log);

      return msg;
    } else {
      return "参数错误";
    }
  }

  private void updateIntoStageData(HashMap<String, String> map) {
    List<Map<String, Object>> columnes = getMetaList(Long.parseLong(map.get("stageId")), false);
    if (columnes.size() > 0) {
      if (columnes != null && columnes.size() != 0) {
        String tableName = "esp_" + map.get("stageId").toString();
        StringBuilder sql = new StringBuilder("update ").append(tableName).append(" set ");
        ArrayList<Object> paramList = new ArrayList<Object>();
        for (int i = 0; i < columnes.size(); i++) {
          if (i != 0) {
            sql.append(",");
          }
          sql.append(columnes.get(i).get("code")).append("=? ");
          paramList.add(map.get(columnes.get(i).get("code")));
        }
        sql.append(" where documentId =? ");
        paramList.add(map.get("id"));
        JdbcUtil.update(query, sql.toString(), paramList.toArray());
      }
    }

  }

  private String updateIntoSysData(HashMap<String, String> map, Long stageId) {
    try {
      List<Map<String, Object>> columnes = getSysMeta();
      if (columnes.size() > 0) {
        // 获取文件编码规则
        /*
         * String docRule = getDocRuleTteration(stageId); String[] tags = docRule.split(","); String
         * docNo = ""; // 获取该节点下的所有字段 List<Map<String, Object>> allMeta = getMetaList(stageId,true);
         * for (int i = 0; i < tags.length; i++) { String tag = tags[i]; if (tag.indexOf("true") >
         * -1) { for (Map<String, Object> dataMap : allMeta) { if
         * (StringUtils.equals(String.valueOf(dataMap.get("id")), tag.split("\\|")[0])) { docNo +=
         * map.get(dataMap.get("code")); break; } } } else { docNo += tag.split("\\|")[0]; } }
         * map.put("docNo", docNo);
         */

        StringBuilder sql = new StringBuilder("update  ess_document set ");
        ArrayList<Object> paramList = new ArrayList<Object>();
        for (int i = 0; i < columnes.size(); i++) {
          if (i > 0) {
            sql.append(",");
          }
          sql.append(columnes.get(i).get("code")).append("=? ");
          paramList.add((Object) map.get(columnes.get(i).get("code")));
        }
        sql.append(" where id=? ");
        paramList.add(map.get("id"));
        int row = query.update(sql.toString(), paramList.toArray());
        if (row == 0) {
          return "未发现文件数据";
        } else {
          return "";
        }
      } else {
        return "不存在系统元数据";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "更新文件数据失败";
    }
  }

  // ----------------------导入导出-----------------------------------------
  @Override
  public Map<String, Object> exportSelData(HashMap<String, Object> map) {
    String treeNodeId = map.get("treenodeid") + "";
    String treename = map.get("treename") + "";
    String ids = map.get("ids") + "";
    String exportType = map.get("exportType") + "";
    String resource = map.get("resource") + "";

    // 1.根据treeNodeId 获得此节点下的关联数据的字段集合List 集合中的元素为 map key 为字段标识 value为字段名称
    List<Map<String, Object>> fieldList = getFieldListByTreeNodeId(treeNodeId);
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
    // 2.根据ids 也就是选中数据的id 获得所有的数据 List
    List<Map<String, Object>> dataList = getDataListByIds(ids, treeNodeId);
    // 3.得到此选中的数据下的电子文件的数据
    List<Map<String, Object>> fileDataList = getFileDataList(ids);
    // 4.导出判断导出对应类型数据
    Map<String, Object> result = new HashMap<String, Object>();
    // 5. code和name对应的三个树的map 导出数据时需要显示名称
    Map<String, Map<String, String>> treeCodeAndNameMap = getTreeCodeAndNameMap();
    if (dataList == null) {
      result.put("msg", "nothing");
      return result;
    } else {
      if ("formats_Excel".equals(exportType)) {
        // 导出主数据
        ExportExcel exportExcel = new ExportExcel();
        String dataName =
            exportExcel.exportExcelByList(dataList, fieldList, treeCodeAndNameMap, "导出数据表");
        result.put("dataName", dataName);
        // 导文件数据
        if (fileDataList != null) {
          String fileName = exportExcel.exportExcelFile(fileDataList);
          result.put("fileName", fileName);
          // 导出电子文件(在打包的时候进行导出)
          if ("yes".equals(resource)) {
            result.put("resource", "yes");
          }
        }
      } else if ("formats_xml".equals(exportType)) {
        ExportXML exportXml = new ExportXML();
        String fileName = exportXml.exportXml(dataList, fileDataList, fieldMap);
        // xml格式的导出 主数据和电子文件数据信息都在一个xml文件中
        result.put("dataName", fileName);
        // 导出电子文件(在打包的时候进行导出)
        if ("yes".equals(resource)) {
          result.put("resource", "yes");
        }
      } else if ("formats_dbf".equals(exportType)) {
        ExportDBF exportDbf = new ExportDBF();
        String dataName = exportDbf.exportDBFNew(dataList, fieldList, pairMap);
        result.put("dataName", dataName);
      }
    }
    // 打包导出成功的 文件
    String fileName = PackageZip(result, fileDataList);
    result.clear();
    if (fileName != null) {
      // 消息设置
      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", map.get("userId") + "");
      messMap.put("recevier", map.get("userId") + "");
      messMap.put("sendTime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", fileName + "已导出完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + this.getServiceIP() + fileName + "')");
      messMap.put("handlerUrl", "esdocument/" + this.getInstanceId()
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);

      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "文件收集");
      log.put("operate", "文件收集：导出选择文件");
      log.put("loginfo", "导出节点为【" + treename + "】标识为【" + ids + "】的选中数据,导出文件为" + fileName);
      this.getLogService().saveLog(log);

      result.put("msg", "success");
      result.put("path", this.getServiceIP() + fileName);
    } else {
      result.put("msg", "error");
    }
    return result;
  }

  private Map<String, Map<String, String>> getTreeCodeAndNameMap() {
    String sql1 = "select code,name from ess_document_stage";
    String sql2 = "select code,name from ess_participatory";
    String sql3 = "select deviceNo,name from ess_device";
    Map<String, Map<String, String>> TreeCodeAndNameMap =
        new HashMap<String, Map<String, String>>();

    try {
      List<Map<String, Object>> stageList = query.query(sql1, new MapListHandler());
      Map<String, String> stageMap = new HashMap<String, String>();
      if (stageList != null) {
        for (Map<String, Object> map : stageList) {
          stageMap.put(map.get("code") + "", map.get("name") + "");
        }
      }

      List<Map<String, Object>> participatoryList = query.query(sql2, new MapListHandler());
      Map<String, String> participatoryMap = new HashMap<String, String>();
      if (participatoryList != null) {
        for (Map<String, Object> map : participatoryList) {
          participatoryMap.put(map.get("code") + "", map.get("name") + "");
        }
      }

      List<Map<String, Object>> deviceList = query.query(sql3, new MapListHandler());
      Map<String, String> deviceMap = new HashMap<String, String>();
      if (deviceList != null) {
        for (Map<String, Object> map : deviceList) {
          deviceMap.put(map.get("deviceNo") + "", map.get("name") + "");
        }
      }
      TreeCodeAndNameMap.put("stageMap", stageMap);
      TreeCodeAndNameMap.put("participatoryMap", participatoryMap);
      TreeCodeAndNameMap.put("deviceMap", deviceMap);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return TreeCodeAndNameMap;
  }

  @SuppressWarnings("unused")
  private Map<String, Map<String, String>> getTreeNameAndCodeMap() {
    String sql1 = "select code,name from ess_document_stage";
    String sql2 = "select code,name from ess_participatory";
    String sql3 = "select deviceNo,name from ess_device";
    Map<String, Map<String, String>> TreeNameAndCodeMap =
        new HashMap<String, Map<String, String>>();

    try {
      List<Map<String, Object>> stageList = query.query(sql1, new MapListHandler());
      Map<String, String> stageMap = new HashMap<String, String>();
      if (stageList != null) {
        for (Map<String, Object> map : stageList) {
          stageMap.put(map.get("name") + "", map.get("code") + "");
        }
      }

      List<Map<String, Object>> participatoryList = query.query(sql2, new MapListHandler());
      Map<String, String> participatoryMap = new HashMap<String, String>();
      if (participatoryList != null) {
        for (Map<String, Object> map : participatoryList) {
          participatoryMap.put(map.get("name") + "", map.get("code") + "");
        }
      }

      List<Map<String, Object>> deviceList = query.query(sql3, new MapListHandler());
      Map<String, String> deviceMap = new HashMap<String, String>();
      if (deviceList != null) {
        for (Map<String, Object> map : deviceList) {
          deviceMap.put(map.get("name") + "", map.get("deviceNo") + "");
        }
      }
      TreeNameAndCodeMap.put("stageMap", stageMap);
      TreeNameAndCodeMap.put("participatoryMap", participatoryMap);
      TreeNameAndCodeMap.put("deviceMap", deviceMap);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return TreeNameAndCodeMap;
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
  private String PackageZip(Map<String, Object> result, List<Map<String, Object>> fileDataList) {
    String address = this.getAddress();
    String name = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    String tf = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()) + "/";
    new File(address + tf).mkdirs();
    String packfileName = null;
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
            String urlString = getMainFileServer().getFileDownLoadUrl(map.get("originalId") + "");
            // 全路径（包含文件名）
            String destFile = address + tf + map.get("esViewTitle") + "/" + map.get("estitle");
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
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    return address;
  }

  /**
   * 根据选中的数据id 获得所有关联的文件数据
   * 
   * @param ids
   * @return
   */
  private List<Map<String, Object>> getFileDataList(String ids) {
    List<Map<String, Object>> fileList = new ArrayList<Map<String, Object>>();
    if (!"".equals(ids)) {
      try {
        // 三表关联 取出此选中数据的下的文件信息 及存放的电子目录集
        String sql1 =
            "select a.*, b.esViewTitle, c.pid as documentId from ess_file a,ess_folder b,ess_document_file c where "
                + "c.esfileid = a.originalId and a.folderId=b.id and c.pid in(" + ids + ")";
        fileList = query.query(sql1, new MapListHandler());
        return fileList;
      } catch (SQLException e) {
        e.printStackTrace();
        return null;
      }
    }
    return null;
  }

  /**
   * 根据id集合获得所有数据
   * 
   * @param ids
   * @return
   */
  private List<Map<String, Object>> getDataListByIds(String ids, String treeNodeId) {
    List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
    // 因为每条数据下可能关联不同的收集文件类型 所以只能根据每条数据去查询此数据关联的动态表 然后查出完整数据
    List<Map<String, Object>> relationList = getStageIdAndDocumentIdByIds(ids);

    // 根据没个数据的关联关系查数据
    try {
      if (relationList != null) {
        for (Map<String, Object> row : relationList) {
          String tableName = "esp_" + row.get("stageId");
          StringBuilder sb = new StringBuilder("select *,a.id tempId from ess_document as a");
          if (judgeIfExistsTable(tableName)) {
            sb.append(" left join ");
            sb.append(tableName);
            sb.append(" as b on a.id = b.documentId");
            sb.append(" where a.id = ");
            sb.append(row.get("documentId") + "");
          } else {
            sb.append(" where a.id = ");
            sb.append(row.get("documentId") + "");
          }
          String sql2 = sb.toString();
          Map<String, Object> data = query.query(sql2, new MapHandler());
          dataList.add(data);
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return dataList;
  }

  private List<Map<String, Object>> getStageIdAndDocumentIdByIds(String ids) {
    String sql =
        "select b.id documentId,a.id stageId from ess_document_stage a LEFT JOIN ess_document b "
            + "on a.`code` = b.stageCode where b.id in (" + ids + ")";
    try {
      List<Map<String, Object>> rowList = query.query(sql, new MapListHandler());
      return rowList;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * 根据节点id 得到此节点下的所有关联字段(包括系统字段)
   * 
   * @param treeNodeId
   * @return
   */
  private List<Map<String, Object>> getFieldListByTreeNodeId(String treeNodeId) {
    List<Map<String, Object>> nodeList = getChildNodesByParentId(treeNodeId);
    String idStr = "";
    if (nodeList != null) {
      for (Map<String, Object> node : nodeList) {
        idStr += "'" + node.get("id") + "',";
      }
    }
    // 把父节点也加入查询条件
    idStr += treeNodeId;
    String sql =
        "select code,name,type,length from ess_document_metadata where stageId in (" + idStr
            + ") or isSystem = 0 order by id";
    List<Map<String, Object>> fieldList = new ArrayList<Map<String, Object>>();
    try {
      fieldList = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    if (fieldList == null)
      fieldList = new ArrayList<Map<String, Object>>();
    return fieldList;
  }

  /**
   * 
   * @param treeNodeId
   * @return
   */
  private List<Map<String, Object>> getChildNodesByParentId(String treeNodeId) {
    // 先的到父节点下子节点的关系字段值 再关联信息查询子节点
    Map<String, Object> stage = getStageById(Long.parseLong(treeNodeId));
    // 父节点下的子节点字段标识
    String child_id_seq = "";
    if (stage.size() > 0) {
      child_id_seq = stage.get("id_seq") + "" + stage.get("id") + ".";
    } else {
      child_id_seq = "0";
    }
    String sql = "select * from ess_document_stage where  id_seq like '" + child_id_seq + "%'";
    try {
      List<Map<String, Object>> nodeList = query.query(sql, new MapListHandler());
      return nodeList;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public List<Map<String, Object>> getFieldsByTreetype(HashMap<String, Object> map) {
    String treetype = map.get("treetype") + "";
    String treenodeid = map.get("treenodeid") + "";
    // String treeCode = map.get("treeCode")+"";
    List<Map<String, Object>> fieldListMap = null;
    List<Map<String, Object>> fieldListMapNew = new ArrayList<Map<String, Object>>();
    try {
      if ("1".equals(treetype)) {
        // 根据treenodeid 得到所有上级接点id和所有下级点id
        /*
         * String ids = getPidAndCidByTreeId(treenodeid); if ("".equals(ids)) return fieldListMap;
         */
        String sql =
            "select code,name,type,length,isNull from ess_document_metadata where stageId in( "
                + treenodeid + " ) or isSystem = 0";
        fieldListMap = query.query(sql, new MapListHandler());

      } else {
        String sql =
            "select code,name,type,length,isNull from ess_document_metadata where isSystem = 0";
        fieldListMap = query.query(sql, new MapListHandler());
      }
      if (fieldListMap == null) {
        fieldListMapNew = new ArrayList<Map<String, Object>>();
      } else {
        for (Map<String, Object> m : fieldListMap) {
          if (m.get("code").equals("stageCode") || m.get("code").equals("deviceCode")
              || m.get("code").equals("participatoryCode") || m.get("code").equals("documentCode")
              || m.get("code").equals("engineeringCode") || m.get("code").equals("stageId")) {
            continue;
          }
          fieldListMapNew.add(m);
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return fieldListMap;
    }
    return fieldListMapNew;
  }

  /**
   * 更具节点获得所有父节点id和子节点id 包括自身id
   * 
   * @param treenodeid
   * @return
   */
  private String getPidAndCidByTreeId(String treenodeid) {
    // 得到所有上级节点id
    Map<String, Object> stage = getStageById(Long.parseLong(treenodeid));
    String id_seq = stage.get("id_seq") + "";
    String pids = "0";
    if (!"null".equals(id_seq)) {
      pids = "'" + (id_seq + treenodeid).replace(".", "','") + "'";
    }
    // 得到所下级节点id
    List<Map<String, Object>> list = getChildNodesByParentId(treenodeid);
    String cips = "";
    for (Map<String, Object> map2 : list) {
      cips += "'" + map2.get("id") + "',";
    }
    String ids = cips + pids;
    return ids;
  }

  @Override
  public Map<String, Object> exportFilterData(HashMap<String, Object> map) {
    String treenodeid = map.get("treenodeid") + "";
    String treecode = map.get("treecode") + "";
    String treename = map.get("treename") + "";
    String exportType = map.get("exportType") + "";
    String condition = map.get("condition") + "";
    String resource = map.get("resource") + "";
    String treetype = map.get("treetype") + "";

    // 1.根据treeNodeId 获得此节点下的关联数据的字段集合List 集合中的元素为 map key 为字段标识 value为字段名称
    List<Map<String, Object>> fieldList = getFieldListByTreeNodeId(treenodeid);
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
    // 2.根据过滤条件查找数据
    List<Map<String, Object>> dataList =
        getDataListByCondition(condition, treenodeid, treecode, treetype);

    String ids = "";
    for (Map<String, Object> m : dataList) {
      ids += "'" + m.get("id") + "',";
    }
    if (!"".equals(ids)) {
      ids = ids.substring(0, ids.length() - 1);
    } else {
      ids = "-1";
    }

    // 根据每条数据的id 查找所关联的动态表数据 得到完整数据集合
    List<Map<String, Object>> fullDataList = getDataListByIds(ids, treenodeid);

    // 3.得到此选中的数据下的电子文件的数据
    List<Map<String, Object>> fileDataList = getFileDataList(ids);

    Map<String, Object> result = new HashMap<String, Object>();

    // 4. code和name对应的三个树的map 导出数据时需要显示名称
    Map<String, Map<String, String>> treeCodeAndNameMap = getTreeCodeAndNameMap();
    // 5.导出对应类型数据
    if (fullDataList == null || fullDataList.size() < 1) {
      result.put("msg", "nothing");
      return result;
    } else {
      if ("formats_Excel".equals(exportType)) {
        // 导出主数据
        ExportExcel exportExcel = new ExportExcel();
        String dataName =
            exportExcel.exportExcelByList(fullDataList, fieldList, treeCodeAndNameMap, "导出数据表");
        result.put("dataName", dataName);
        // 导文件数据
        if (fileDataList != null) {
          String fileName = exportExcel.exportExcelFile(fileDataList);
          result.put("fileName", fileName);
          // 导出电子文件(在打包的时候进行导出)
          if ("yes".equals(resource)) {
            result.put("resource", "yes");
          }
        }
      } else if ("formats_xml".equals(exportType)) {
        ExportXML exportXml = new ExportXML();
        String fileName = exportXml.exportXml(fullDataList, fileDataList, fieldMap);
        // xml格式的导出 主数据和电子文件数据信息都在一个xml文件中
        result.put("dataName", fileName);
        // 导出电子文件(在打包的时候进行导出)
        if ("yes".equals(resource)) {
          result.put("resource", "yes");
        }
      } else if ("formats_dbf".equals(exportType)) {
        ExportDBF exportDbf = new ExportDBF();
        String dataName = exportDbf.exportDBFNew(fullDataList, fieldList, pairMap);
        result.put("dataName", dataName);
      }
    }
    // 5 打包压缩导出的文件
    String fileName = PackageZip(result, fileDataList);
    result.clear();
    if (fileName != null) {
      // 下载消息
      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", map.get("userId") + "");
      messMap.put("recevier", map.get("userId") + "");
      messMap.put("sendTime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", fileName + "已导出完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + this.getServiceIP() + fileName + "')");
      messMap.put("handlerUrl", "esdocument/" + this.getInstanceId()
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);
      String conditionStr = new ConvertUtil().conditonToChines(condition, "&", ",", fieldMap);
      // 下载日志
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("ip"));
      log.put("userid", map.get("userId"));
      log.put("module", "文件收集");
      log.put("operate", "文件收集：导出筛选文件");
      log.put("loginfo", "导出节点标识为【" + treename + "】过滤条件为" + conditionStr + "的数据,导出文件为" + fileName);
      this.getLogService().saveLog(log);
      result.put("msg", "success");
      result.put("path", this.getServiceIP() + fileName);
    } else {
      result.put("msg", "error");
    }
    return result;
  }

  private List<Map<String, Object>> getDataListByCondition(String condition, String treenodeid,
      String treecode, String treetype) {
    // 将查询条件 格式化sql 查询语句
    String where = "";
    if (condition != null && !"".equals(condition)) {
      where = new ConvertUtil().conditonToSql(condition, "&", ",");
    }
    List<Map<String, Object>> dataList = null;
    String sql2 = "select * from ess_document where 1=1 ";

    try {
      if ("1".equals(treetype)) {
        List<Map<String, Object>> returnList =
            this.getFilingService().getChildrenStageIds(Long.parseLong(treenodeid));
        List<String> childrenStageId = new ArrayList<String>();
        for (Map<String, Object> map : returnList) {
          String mapId = map.get("id").toString();
          if (this.tableIfExists(mapId)) {
            childrenStageId.add(mapId);
          }
        }

        String colName = "";
        if (childrenStageId.size() > 0) {
          colName =
              this.getFilingService().getColsCode(
                  this.getFilingService().getParentStageIds(Long.parseLong(treenodeid)));
        }
        String sql1 = "select * from (select dc.*";
        if (!"".equals(colName) && colName != null) {
          String[] str = colName.split(",");
          for (int i = 0; i < str.length; i++) {
            sql1 += ",esp." + str[i];
          }
        }
        sql1 += " from ess_document as dc ";
        if (!"".equals(colName) && colName != null) {
          sql1 += " LEFT JOIN (";
          for (String childrenStage : childrenStageId) {
            sql1 += " (select " + colName + " from esp_" + childrenStage + ") UNION ";
          }
          sql1 = sql1.substring(0, sql1.lastIndexOf("UNION"));
          sql1 += ") as esp ON dc.id=esp.documentId ";
        }
        sql1 += ") as tb where 1=1 ";
        if (!"".equals(where)) {
          sql1 = sql1 + " and " + where;
        }
        dataList = query.query(sql1, new MapListHandler());

      } else if ("2".equals(treetype)) {
        sql2 = sql2 + " and participatoryCode = ?";
        if (!"".equals(where)) {
          sql2 = sql2 + " and " + where;
        }
        dataList = query.query(sql2, new MapListHandler(), treecode);

      } else if ("3".equals(treetype)) {
        sql2 = sql2 + " and deviceCode = ?";
        if (!"".equals(where)) {
          sql2 = sql2 + " and " + where;
        }
        dataList = query.query(sql2, new MapListHandler(), treecode);
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return dataList;
    }
    return dataList;
  }

  @SuppressWarnings("unchecked")
  @Override
  public String importUpload(HttpServletRequest request, HttpServletResponse response) {
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
  private String preParseDBF(List<FileItem> fileItemList, Map<String, String> filePaths) {
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
            msg =
                "文件\"" + item.getName() + "\"中的\"" + files[0].getName()
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
            msg = "文件\"" + item.getName() + "\"" + "应包含两个文件，一个的后缀名为dbf,另一个的后缀名fpt!";
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
          msg =
              "文件\"" + item.getName() + "\"中的\"" + file.getName()
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
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos); // this.getParentPath(ClassLoader.getSystemResource("").getPath())
    return web_infPath.toString() + "data/";
  }

  /**
   * 解析dbf文件.
   * 
   * @author wanghongchen 20140508
   */
  private String parseDBF(List<FileItem> fileItemList, HttpSession session, String userId) {
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
        dataTablesMsg.put("nowBuildFileName", ((filePaths.size() > 1) ? (no + "、") : "") + " 正在解析“"
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
   * @param fileItemList FileItem对象集合
   * @return 错误信息
   */
  private String parseExcel(List<FileItem> fileItemList, HttpSession session, String userId) {
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
        dataTablesMsg.put("nowBuildFileName", ((filePaths.size() > 1) ? (no + "、") : "") + " 正在解析“"
            + excelFile.substring(excelFile.lastIndexOf("/") + 1) + "”文件");
        dataTablesMsg.put("nowBuldFileNo", no);
        DataTable dataTable = new DataTable();
        File file = new File(excelFile);
        if (excelFile.toLowerCase().endsWith("xls")) {
          dataTable.initByExcel(file, session);
        } else {
          dataTable.initByXlsxExcel(excelFile, session);
        }
        dataTable.setName(file.getName());
        dataTables.put(filePaths.get(excelFile), dataTable);
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
  private String preParseExcel(List<FileItem> fileItemList, Map<String, String> filePaths) {
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
      String treetype = arrStr[0];
      String treenodeid = arrStr[1];
      String treecode = arrStr[2];
      HashMap<String, Object> m = new HashMap<String, Object>();
      m.put("treetype", treetype);
      m.put("treenodeid", treenodeid);
      m.put("treecode", treecode);
      // 根据path 获得当前导入节点对应的数据库元数据集合
      List<Map<String, Object>> fieldMapList = this.getAllFieldsByParentId(m);
      if (fieldMapList != null) {
        for (Map<String, Object> row : fieldMapList) {
          if (row.get("type") != null) {
            row.put("type", ValueType.valueOf(row.get("type") + "").getDescription());
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
  public List<HashMap<String, String>> getFileColumnModel(Map<String, String> map) {
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
        // String treetype = arrStr[0];
        // String treenodeid = arrStr[1];
        String treecode = arrStr[2];
        String treename = arrStr[3];
        // 根据 获得的节点参数 获取此节点下所有的元数据信息
        // if (true) {
        HashMap<String, Object> strMap = new HashMap<String, Object>();
        strMap.put("id", path);
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
  public Map<String, String> realImport(String userId, Map<String, Object> params) {
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> list = (List<Map<String, Object>>) params.get("data");
    // 判断是否为多级导入
    String style = "one"; // 只有一种数据导入
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
    Map<String, String> resMap = new HashMap<String, String>();
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
    String treename = pathArr[3];
    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", params.get("ip"));
    log.put("userid", params.get("userId"));
    log.put("module", "文件收集");
    log.put("operate", "文件收集：导入数据");
    log.put("loginfo", "导入数据节点：【" + treename + "】,导入数据信息：【" + resMap.get("msg") + "】,导入数据标识：【"
        + resMap.get("ids") + "】");
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
  private Map<String, String> singleImport(Map<String, Object> map, String userId,
      Map<String, Object> documentMap) {
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
    List<Map<String, Object>> tagList = this.getAllFieldsByParentId(param);
    for (Map<String, Object> tag : tagList) {
      tagMap.put(tag.get("name") + "", tag.get("code") + "");
    }
    @SuppressWarnings("unchecked")
    List<Map<String, String>> stMatch = (List<Map<String, String>>) map.get("value");
    Map<String, String> kvMap = new HashMap<String, String>();
    for (Map<String, String> stmap : stMatch) {
      kvMap.put(stmap.get("source"), stmap.get("target"));
    }
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTables = imap.get(userId);
    DataTable dataTable = dataTables.get(path);
    List<Map<String, String>> excelDataMapList = dataTable.getDataMapList(0, 0);
    List<HashMap<String, String>> dataMapList = new ArrayList<HashMap<String, String>>();
    for (Map<String, String> hashMap : excelDataMapList) {
      HashMap<String, String> dataMap = new HashMap<String, String>();
      for (String key : kvMap.keySet()) {
        dataMap.put(tagMap.get(kvMap.get(key)), hashMap.get(key));
      }
      dataMap.put("tempId", hashMap.get("tempId"));
      dataMapList.add(dataMap);
    }
    Map<String, String> resMap = new HashMap<String, String>();
    if (documentMap == null) {
      // 无电子文件数据
      Map<String, Object> insertResult = this.saveImportData(path, dataMapList);
      int num1 = Integer.parseInt(insertResult.get("num1") + "");// 全部对应导入条数
      int num2 = Integer.parseInt(insertResult.get("num2") + "");// 动态表未导入条数
      if (num1 >= 0) {

        if (num2 > 0) {
          resMap.put("msg", "成功导入了【" + num1 + "】条数据！有【" + num2 + "】条数据缺少关联数据导入失败！");
        } else {
          resMap.put("msg", "成功导入了【" + num1 + "】条数据！");
        }
        //
        // resMap.put("msg", "成功导入了" + num1 + "条数据！");
        // 返回之中传回所有导入数据的id标识 添加日志信息
        StringBuilder sb = new StringBuilder();
        for (String key : insertResult.keySet()) {
          if (key.indexOf("num") != -1)
            continue;
          sb.append(insertResult.get(key) + ",");
        }
        resMap.put("result", "success");
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
  private Map<String, String> importInnerAndDoc(Map<String, Object> dataMap,
      Map<String, Object> documentMap, String userId) {
    // 用静态map临时存取导入数据
    Map<String, DataTable> dataTables = imap.get(userId);
    // 导入主数据
    String dataPath = dataMap.get("key").toString();
    List<HashMap<String, String>> dataMapList = this.getDataMapList(dataMap, dataTables);
    Map<String, Object> insertDate = this.saveImportData(dataPath, dataMapList);
    // 将主数据导入成功后tempId 对应数据库值 也就是电子文件关联的pid值替换
    // 导入电子文件
    List<HashMap<String, Object>> documentDataMapList =
        this.getDocDataMapList(documentMap, dataTables, insertDate);
    int num1 = Integer.parseInt(insertDate.get("num1") + "");
    int num2 = Integer.parseInt(insertDate.get("num2") + "");
    int documentNum = this.saveDocument(dataPath, documentDataMapList);
    Map<String, String> resMap = new HashMap<String, String>();
    StringBuilder rtStr = new StringBuilder();
    if (num1 >= 0 && documentNum >= 0) {
      rtStr.append("成功导入【").append(num1).append("】条文件数据");
      rtStr.append(",【").append(documentNum).append("】条电子文件数据");
      if (num2 > 0) {
        rtStr.append(",有【").append(num2).append("】条数据缺少关联数据导入失败！");
      }
      StringBuilder sb = new StringBuilder();
      for (String key : insertDate.keySet()) {
        if (key.indexOf("num") != -1)
          continue;
        sb.append(insertDate.get(key) + ",");
      }
      resMap.put("result", "success");
      resMap.put("msg", rtStr.toString());
      resMap.put("ids", sb.toString());
    } else {
      resMap.put("result", "exception");
      resMap.put("msg", "导入数据时发生异常");
    }
    return resMap;
  }

  private int saveDocument(String dataPath, List<HashMap<String, Object>> documentDataMapList) {
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
   * 获取电子文件的tagMap，暂时写死 wanghongchen 20140813
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
  private List<HashMap<String, Object>> getDocDataMapList(Map<String, Object> map,
      Map<String, DataTable> dataTables, Map<String, Object> insertData) {
    Map<String, String> tagMap = this.getDocumentTagMap();
    String path = map.get("key").toString();
    @SuppressWarnings("unchecked")
    List<Map<String, String>> stMatch = (List<Map<String, String>>) map.get("value");
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
      // 这步很重要将pid 主数据在数据库中的真实id
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
    List<Map<String, Object>> tagList = this.getAllFieldsByParentId(param);
    for (Map<String, Object> tag : tagList) {
      tagMap.put(tag.get("name") + "", tag.get("code") + "");
    }
    @SuppressWarnings("unchecked")
    List<Map<String, String>> stMatch = (List<Map<String, String>>) map.get("value");
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
      // dataMap.put("relation", hashMap.get("relation"));
      dataMap.put("tempId", hashMap.get("tempId"));
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
  private Map<String, Object> saveImportData(String path, List<HashMap<String, String>> dataMapList) {
    Map<String, Object> result = new HashMap<String, Object>();
    if (dataMapList.isEmpty()) {
      return result;
    }
    // 获得收集范围和装置号部门号的code集合
    List<String> stageCodeList = getStageCodeList();

    List<String> deviceCodeList = getDeviceCodeList();
    List<String> participatoryCodeList = getParticipatoryCodeList();
    // 到得到收集范围 装置名称 部门名称对应的code
    // Map<String, Map<String, String>> treeNameAndCodeMap =
    // getTreeNameAndCodeMap();
    /*
     * Set<String> columns = new HashSet<String>(); for (String column :
     * dataMapList.get(0).keySet()) { columns.add(column); }
     */
    List<String> sysFileds = null;
    // 查出所有系统字段
    String sql1 = "select code from ess_document_metadata where isSystem=0";
    try {
      sysFileds = query.query(sql1, new ColumnListHandler<String>());
    } catch (SQLException e1) {
      e1.printStackTrace();
    }
    // columns.remove("tempId");
    StringBuilder sql = new StringBuilder("insert into ess_document ");
    String values = "";
    String fields = "";
    for (String column : sysFileds) {
      fields += column + ",";
      values += "?,";
    }
    if (!"".equals(fields) && !"".equals(values)) {
      fields = fields.substring(0, fields.length() - 1);
      values = values.substring(0, values.length() - 1);
      sql.append(" (" + fields + ") ");
      sql.append("values (" + values + ")");
    }

    try {
      // 一条一条插入主表数据插入
      int num1 = 0;
      int num2 = 0;
      // 记录临时id和导入id的关系
      out: for (int i = 0; i < dataMapList.size(); i++) {
        Map<String, String> map = dataMapList.get(i);
        Object[] row = new Object[sysFileds.size()];
        int j = 0;
        for (String column : sysFileds) {
          String name = map.get(column);

          if ("stageCode".equals(column)) {
            String value = map.get("stageCode") + "";
            if (!stageCodeList.contains(value)) {
              num2++;
              continue out;
            }
          } else if ("participatoryCode".equals(column)) {
            String value = map.get("participatoryCode") + "";
            if (!participatoryCodeList.contains(value)) {
              num2++;
              continue out;
            }
          } else if ("deviceCode".equals(column)) {
            String value = map.get("deviceCode") + "";
            if (!deviceCodeList.contains(value)) {
              num2++;
              continue out;
            }
          } else if ("stageId".equals(column)) {
            String value = map.get("stageId") + "";
            if ("null".equals(value) || "".equals(value)) {
              num2++;
              continue out;
            }
          }
          if ("docNo".equals(column)) {
            // 如果任何一个code值是数据库中不存在的 就使外层循环continue 不加入此条倒入数据
            //根据stageCode获取stageId
            Map<String,Object> stage = getStageByCode(map.get("stageCode")+"");
            // 根据stageId获得编码规则重新构造编码规则
            map.put("stageId", stage.get("id")+"");
            String docNo = getDocNoByStageIdAndRow(map);
            Map<String, Object> ruleMap = new HashMap<String, Object>();
            ruleMap.put("docNoRule", docNo);
            ruleMap.put("stageId", map.get("stageId"));
            // 获得流水号
            String serialNum = judegIsRepeatBydocNoRule(ruleMap);
            name = docNo + serialNum;
            map.put("docNo", name);
          }
          row[j] = name;
          j++;
        }
        Long id = query.insert(sql.toString(), new ScalarHandler<Long>(), row);
        // 每插入一条主数据 接着插入动态表数据
        boolean flag = this.insertSep_n(map, id);
        if (flag) {
          num1++;
        } else {
          num2++;
        }
        result.put(map.get("tempId"), id);
      }
      result.put("num1", num1);
      result.put("num2", num2);
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;

  }


  private List<String> getParticipatoryCodeList() {
    String sql = "select code from ess_participatory where (code is not null and code!='')";
    List<String> participatoryCodeList = new ArrayList<String>();
    try {
      participatoryCodeList = query.query(sql, new ColumnListHandler<String>());
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return participatoryCodeList;
  }

  private List<String> getDeviceCodeList() {
    String sql = "select deviceNo from ess_device where (secondNo!='' and secondNo is not null)";
    List<String> deviceCodeList = new ArrayList<String>();
    try {
      deviceCodeList = query.query(sql, new ColumnListHandler<String>());
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return deviceCodeList;
  }

  private List<String> getStageCodeList() {
    String sql = "select code from ess_document_stage where (code is not null and code!='')";
    List<String> stageCodeList = new ArrayList<String>();
    try {
      stageCodeList = query.query(sql, new ColumnListHandler<String>());
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return stageCodeList;
  }

  /**
   * 导入的数据信息获得编码规则
   * 
   * @param map
   * @return
   */
  private String getDocNoByStageIdAndRow(Map<String, String> map) {
    String stageId = map.get("stageId") + "";
    // 获得编码规则
    String docRule = getDocRuleTteration(Long.parseLong(stageId));
    StringBuilder docNo = new StringBuilder();
    if (!"false".equals(docRule)) {
      // 组装编码规则
      String[] arr = docRule.split(",");
      for (int i = 0; i < arr.length; i++) {
        String[] arr1 = arr[i].split("\\|");
        if ("true".equals(arr1[1])) {
          // 根据元数据id获得字段代码
          String code = getCodeMetadataById(arr1[0]);
          docNo.append(map.get(code) + "");
        } else {
          docNo.append(arr1[0]);
        }
      }
    }
    return docNo.toString();
  }

  private String getCodeMetadataById(String id) {
    // TODO Auto-generated method stub
    String sql = "select code from ess_document_metadata where id=?";
    String code = "";
    try {
      code = query.query(sql, new ScalarHandler<String>(), id);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return code;
  }

  /**
   * 根据每一条数据插入其对应的动态表的数据
   * 
   * @param map 数据
   * @param id 主数据的id
   * @return
   */
  public boolean insertSep_n(Map<String, String> map, Long id) {
    String stageCode = map.get("stageCode") + "";// 关联的文件节点的代码
    Map<String, Object> stage = getStageByCode(stageCode);// 文件节点的详细信息
    // 获得动态表的字段 即为所有上级节点的定义字段+本节点的字段
    String ids = stage.get("id_seq") + "" + stage.get("id");
    ids = "'" + ids.replace(".", "','") + "'";
    String sql2 =
        "select code,name,type,length,isNull from ess_document_metadata where stageId in( " + ids
            + " )";
    List<Map<String, Object>> fieldListMap;
    try {
      fieldListMap = query.query(sql2, new MapListHandler());
      String esp_n = "esp_" + stage.get("id");
      if (fieldListMap != null && judgeIfExistsTable(esp_n)) {
        // 数据插入动态表
        StringBuilder sql3 = new StringBuilder("insert into " + esp_n);
        String values2 = "";
        String fields2 = "";
        for (Map<String, Object> field : fieldListMap) {
          Object value = map.get(field.get("code"));
          if (value != null) {
            fields2 += field.get("code") + ",";
            // String type= field.get("type")+"";
            values2 += "'" + value + "',";
          }
        }
        // 加入关联字段
        fields2 += "documentId";
        values2 += id;
        if (!"".equals(fields2) && !"".equals(values2)) {
          sql3.append(" (" + fields2 + ") ");
          sql3.append(" values (" + values2 + ")");
        }
        System.out.println(sql3);
        int row = query.update(sql3.toString());
        if (row > 0)
          return true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
    return false;
  }

  /**
   * 判断表在数据库中是否存在
   * 
   * @param tableName
   * @return
   */
  private boolean judgeIfExistsTable(String tableName) {
    String databaseName = this.getUrl();
    String sql =
        " select count(1) cnt from information_schema.tables where table_name=? and table_schema='"+databaseName+"' ";
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

  // --------------导入导出 end-----------------------------------------

  private String getServiceIP() {
    String url =
        this.getNamingService().findApp(this.getInstanceId(), "documentsCollection",
            this.getServiceId(), this.getToken());
    String temp = url.substring(url.indexOf("rest"), url.length());
    String outFile = url.replace(temp, "data/");
    return outFile;
  }

  @Override
  public Map<String, Object> getDataInfoWhenOnlineView(HashMap<String, String> keyMap) {
    Map<String, Object> resuMap = new HashMap<String, Object>();
    Long stageId = Long.parseLong(keyMap.get("stageId"));
    Long id = Long.parseLong(keyMap.get("id"));
    String tempReadRight = keyMap.get("tempReadRight");
    String tempPrintRight = keyMap.get("tempPrintRight");
    String tempDownloadRight = keyMap.get("tempDownloadRight");
    String rightIds = keyMap.get("rightIds");
    String[] allIds = rightIds.length() > 0 ? rightIds.split(";") : null;
    List<Map<String, Object>> dataInfoList = this.getMetaStageData(stageId, id);
    List<EssFile> essFiles = getFileInfoByPath(id);
    int index = -1;
    if (tempReadRight != null && tempPrintRight != null && tempDownloadRight != null) {
      boolean flag = false;
      for (EssFile file : essFiles) {
        if (!flag) {
          index++;
        }
        if (("true".equals(file.getId().getFileRead())) || ("true".equals(tempReadRight))) {
          if (this.checkIfExistsRight(allIds[0], file.getId().getOriginalId())) {
            file.getId().setFileRead("true");
            flag = true;
          } else {
            file.getId().setFileRead("false");
          }
        }
        if (("true".equals(file.getId().getFilePrint())) || ("true".equals(tempPrintRight))) {
          if (this.checkIfExistsRight(allIds[1], file.getId().getOriginalId())) {
            file.getId().setFilePrint("true");
          }
        }
        if (("true".equals(file.getId().getFileDown())) || ("true".equals(tempDownloadRight))) {
          if (this.checkIfExistsRight(allIds[2], file.getId().getOriginalId())) {
            file.getId().setFileDown("true");
          }
        }
      }
    } else {
      for (EssFile file : essFiles) {
        index++;
        if ("true".equals(file.getId().getFileRead())) {
          break;
        }
      }
    }
    Map<String, Object> titleInfoMap = getTitleInfoMap(id);
    resuMap.put("titleInfo", titleInfoMap);
    resuMap.put("dataInfo", dataInfoList);
    resuMap.put("esFileInfo", essFiles);
    resuMap.put("index", index);
    return resuMap;
  }

  private boolean checkIfExistsRight(String rights, String fileId) {
    if ("true".equals(rights)) {
      return true;
    } else if ("false".equals(rights)) {
      return false;
    } else {
      String[] rightArr = rights.split(",");
      for (int i = 0; i < rightArr.length; i++) {
        if (rightArr[i].equals(fileId)) {
          return true;
        }
      }
      return false;
    }
  }

  @Override
  public String getStageIdsByDocId(String docId) {
    String sql =
        "select s.id,s.pId from ess_document as d LEFT JOIN ess_document_stage s ON d.stageId=s.id where d.id=? ";
    try {
      Map<String, Object> map = query.query(sql, new MapHandler(), docId);
      if (map == null || map.isEmpty()) {
        return "";
      } else {
        return map.get("id") + "," + map.get("pId");
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
  }

  private Map<String, Object> getTitleInfoMap(Long id) {
    Map<String, Object> dataMap = null;
    String sql = "select title '标题' from ess_document where id=?";
    try {
      dataMap = query.query(sql, new MapHandler(), id);
      if (dataMap == null) {
        dataMap = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return dataMap;

  }

  private final List<Map<String, Object>> getMetaStageData(Long stageId, Long id) {
    List<Map<String, Object>> hmList = getMetaList(stageId, true);
    List<Map<String, Object>> essTaglist = new ArrayList<Map<String, Object>>();
    Map<String, Object> dataMap = getStageData(stageId, id);

    for (Map<String, Object> hm : hmList) {
      Map<String, Object> hashMap = new HashMap<String, Object>();
      hashMap.put("lable", hm.get("name"));
      hashMap.put("name", hm.get("code"));
      hashMap.put("type", hm.get("type"));
      hashMap.put("length", hm.get("length"));
      hashMap.put("dotLength", hm.get("dotLength"));
      hashMap.put("isSystem", hm.get("isSystem"));
      hashMap.put("isNull", hm.get("isNull"));
      hashMap.put("defaultValue", hm.get("defaultValue"));
      Object value = dataMap.get(hm.get("code").toString());
      hashMap.put("value", value);
      essTaglist.add(hashMap);
    }
    return essTaglist;
  }

  /**
   * lujixiang 20150402 查看某一记录详情，封装显示样式
   * 
   * @param map
   * @return
   */
  @Override
  public Map<String, String> showDataInfo(HashMap<String, String> map) {

    Long stageId = null == map.get("stageId") ? null : Long.parseLong(map.get("stageId")); // 收集范围id
    Long dataId = null == map.get("dataId") ? null : Long.parseLong(map.get("dataId")); // 记录id

    List<Map<String, Object>> metaStageDatas = this.getFullTextMetaStageData(stageId, dataId); // 字段信息和记录详情

    Map<String, String> returnMap = new HashMap<String, String>();

    returnMap.put("formHtml", createFieldSetObj(metaStageDatas));

    return returnMap;

  }

  /****
   * lujixiang 20150402 创建HTML的fieldset对象
   * 
   * @param metaStageDatas
   * @return
   */
  private static String createFieldSetObj(List<Map<String, Object>> metaStageDatas) {
    StringBuffer fieldSetHtml = new StringBuffer();
    fieldSetHtml
        .append("<table cellSpacing=1 cellPadding=1 style='font-size:12px;background:#DBDBDB;margin:5px;color:#333;font-family:\'monotype\',\'courier new\',sans-serif;line-height:20px;'>");
    int i = 0;
    for (Map<String, Object> metaStageData : metaStageDatas) {

      String nameZh = null == metaStageData.get("lable") ? "" : (String) metaStageData.get("lable"); // 字段中文名
      String value =
          null == metaStageData.get("value") ? "" : metaStageData.get("value").toString(); // 字段值
      int length = null == metaStageData.get("length") ? 0 : (Integer) metaStageData.get("length"); // 字段长度

      if ("".equals(nameZh)) {
        continue;
      }

      switch (length / 50) {

        case 0:
          if (i % 2 == 0) {
            fieldSetHtml.append("<tr style='height:20px;vertical-align:middle;'>");
          }
          fieldSetHtml.append(createFieldObj(nameZh)).append(createValueObj(value, 1, ""));
          if (i % 2 != 0) {
            fieldSetHtml.append("</tr>");
          }
          break;

        case 1:
          if (i != 0 && !fieldSetHtml.toString().endsWith("</tr>")) {
            fieldSetHtml.append(createEmptyObj()).append("</tr>");
          } else {
            i++;
          }
          fieldSetHtml.append("<tr style='height:20px;vertical-align:middle;'>")
              .append(createFieldObj(nameZh)).append(createValueObj(value, 3, "")).append("</tr>");
          break;

        default:
          if (i != 0 && !fieldSetHtml.toString().endsWith("</tr>")) {
            fieldSetHtml.append(createEmptyObj()).append("</tr>");
          } else {
            i++;
          }
          fieldSetHtml.append("<tr style='height:20px;vertical-align:middle;'>")
              .append(createFieldObj(nameZh))
              .append(createValueObj(value, 3, "word-break: break-all; word-wrap:break-word;"))
              .append("</tr>");
          break;
      }

      i++;
    }
    if (!fieldSetHtml.toString().endsWith("</tr>")) {
      fieldSetHtml.append(createEmptyObj());
      fieldSetHtml.append("</tr>");
    }
    fieldSetHtml.append("</table>");
    /** 如果所有字段集合不为空的话 将已经展现的数据删除 **/
    return fieldSetHtml.toString();
  }

  /**
   * lujixiang 20150402 创建字段名HTML组建
   * 
   * @param fieldName
   * @return
   */
  private static String createFieldObj(String fieldName) {
    StringBuffer fieldNameHtml = new StringBuffer();
    fieldNameHtml
        .append("<td width='100' style='background:#FFFFFF;word-break: break-all; word-wrap:break-word;padding:3px 3px 1px 3px;height:20px;vertical-align:middle;'>");// DFE8F6;
    fieldNameHtml.append(fieldName);
    fieldNameHtml.append("</td>");
    return fieldNameHtml.toString();
  }

  /**
   * lujixiang 20150402 创建字段值HTML
   * 
   * @param fieldVale
   * @return
   */
  private static String createValueObj(String fieldVale, int colspan, String style) {
    StringBuffer fieldValueHtml = new StringBuffer();
    fieldValueHtml
        .append("<td width='" + (colspan == 1 ? "270" : "640") + "'")
        .append(
            " style='background:#FFFFFF;padding:3px 3px 1px 3px;word-break: break-all; word-wrap:break-word;height:20px;vertical-align:middle;' ")
        .append(colspan > 1 ? "colspan='" + colspan + "'" : "").append(">");
    /** 增加显示字段值颜色 **/
    fieldValueHtml.append("<span style='color:#06f;'>");
    /** 添加特殊字符支持-HTML特殊字符转义 **/
    fieldValueHtml.append(escapeSimpleHtml(fieldVale));
    fieldValueHtml.append("</span>");
    fieldValueHtml.append("</td>");
    return fieldValueHtml.toString();
  }

  /**
   * HTML特殊字符转换<br>
   * 将不能在HTML页面正常显示的特殊字符进行转码<br>
   * 页面使用Ext.util.Format.htmlDecode()将其解码显示转码前的内容；<br>
   * Ext.grid.EditorGridPanel中显示转码前内容，只需将autoEncode属性设置为true
   * 
   * @param str
   * @return
   */
  public static String escapeSimpleHtml(String str) {
    if (null == str || "".equals(str.trim())) {
      return "";
    }
    /** xiaoxiong 20130708 添加`字符的转义 **/
    return str.replaceAll("&", "&amp;").replaceAll(">", "&gt;").replaceAll("<", "&lt;")
        .replaceAll("\"", "&quot;").replaceAll("`", "&#96;");
  }

  /****
   * 创建空对象
   * 
   * @return
   */
  private static String createEmptyObj() {
    StringBuffer empryHtml = new StringBuffer();
    empryHtml.append("<td width='370' style='background:#FFFFFF;' colspan='2'>");
    empryHtml.append("</td>");
    return empryHtml.toString();
  }

  /**
   * lujixiang 20150402 获取元数据和值
   * 
   * @param stageId
   * @param id
   * @return
   */
  private List<Map<String, Object>> getFullTextMetaStageData(Long stageId, Long id) {
    List<Map<String, Object>> hmList = getMetaList(stageId, true);
    List<Map<String, Object>> essTaglist = new ArrayList<Map<String, Object>>();
    Map<String, Object> dataMap = getStageData(stageId, id);

    for (Map<String, Object> hm : hmList) {
      Map<String, Object> hashMap = new HashMap<String, Object>();
      String code = hm.get("code").toString();

      hashMap.put("lable", hm.get("name"));
      hashMap.put("name", code);
      hashMap.put("type", hm.get("type"));
      hashMap.put("length", hm.get("length"));
      hashMap.put("dotLength", hm.get("dotLength"));
      hashMap.put("isSystem", hm.get("isSystem"));
      hashMap.put("isNull", hm.get("isNull"));
      hashMap.put("defaultValue", hm.get("defaultValue"));

      if ("stageCode".equals(code) || "deviceCode".equals(code) || "participatoryCode".equals(code)
          || "stageId".equals(code) || "documentCode".equals(code)
          || "engineeringCode".equals(code)) {
        continue;
      }

      Object value = dataMap.get(code);
      hashMap.put("value", value);
      essTaglist.add(hashMap);
    }
    return essTaglist;
  }

  /**
   * lujixiang 获取文件浏览权限
   * 
   * @param dataId
   * @return
   */
  public Map<String, Boolean> getFileViewRight(Long dataId) {

    boolean hasElecFile = false; // 是否拥有电子文件
    boolean hasElecFileRight = false; // 是否拥有电子文件浏览权限
    Map<String, Boolean> viewRights = new HashMap<String, Boolean>();

    hasElecFile = this.hasFileByDataId(dataId);
    /** 获取文件浏览权限,暂无实现 **/
    hasElecFileRight = true;
    // ...

    viewRights.put("hasElecFile", hasElecFile);
    viewRights.put("hasElecFileRight", hasElecFileRight);

    return viewRights;
  }

  private boolean hasFileByDataId(Long dataId) {

    String sql = "select count(1) from ess_document_file where pid = ? ";
    Long fileCount = 0l;

    try {
      fileCount = query.query(sql, new ScalarHandler<Long>(), dataId);

    } catch (SQLException e) {
      e.printStackTrace();
    }

    return 0l == fileCount.longValue() ? false : true;

  }

  /**
   * lujixiang 20150413 获取电子文件详情集合,供全文检索使用{fileId:xxx,title:xxx}
   * 
   * @param dataId
   * @return
   */
  public List<Map<String, Object>> getFileInfoById(Long dataId) {

    List<Map<String, Object>> fileInfos = null;
    String sql =
        "select e.esfileid,f.estitle from ess_document_file e " + " inner join ess_file f "
            + " on e.esfileid = f.originalId and e.pid = ?  ";

    try {
      fileInfos = query.query(sql, new MapListHandler(), new Object[] {dataId});
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return fileInfos;
  }

  @Override
  public Map<String, Object> getFileCode(Map<String, Object> map) {
    Map<String, Object> result = new LinkedHashMap<String, Object>();
    // 获取文件编码规则
    if (map.get("tagIds") == null || "".equals(map.get("tagIds").toString())) {
      return new HashMap<String, Object>();
    }
    long stageId = Long.parseLong(map.get("stageId").toString());
    String docRule = map.get("tagIds").toString();
    String[] tags = docRule.split(",");
    // 获取该节点下的所有字=-74
    List<Map<String, Object>> allMeta = getMetaList(stageId, true);
    for (int i = 0; i < tags.length; i++) {
      String tag = tags[i];
      if (tag.indexOf("true") > -1) {
        for (Map<String, Object> dataMap : allMeta) {
          if (StringUtils.equals(String.valueOf(dataMap.get("id")), tag.split("\\|")[0])) {
            result.put(i + "", dataMap.get("code"));
            result.put("flag" + i, true);
            // docNo += map.get(dataMap.get("code"));
            break;
          }
        }
      } else {
        // docNo += tag.split("\\|")[0];
        result.put(i + "", tag.split("\\|")[0]);
        result.put("flag" + i, false);
      }
    }
    result.put("nums", tags.length);
    return result;
  }

  /** rongying 20150424 获取文件编码规则的代码已改，此方法不用 **/
  @SuppressWarnings("unused")
  @Deprecated
  private String getNewDocNo(String docNo) {
    String sql =
        "select docNo from ess_document where SUBSTRING(docNo FROM 1 FOR LENGTH(docNo)-5)=? order by docNo DESC limit 0,1";
    try {
      String str = query.query(sql, new ScalarHandler<String>(), docNo);
      docNo = docNo + "-";
      if (!StringUtils.isEmpty(str)) {
        long no = Long.parseLong(str.substring(str.length() - 4, str.length())) + 1;
        for (int i = 4; i > (no + "").length(); i--) {
          docNo = docNo + "0";
        }
        docNo = docNo + no;
      } else {
        docNo = docNo + "0001";
      }
      return docNo;
    } catch (SQLException e) {
      return docNo + "-0001";
    }
  }

  /**
   * rongying 20150508 判断修改之后的文件编码规则是否重复 重新设置文件编码
   * 
   * @return
   */
  public String judegIsRepeatBydocNoRule(Map<String, Object> map) {
    String serialNum = "false";
    try {
      long num = -1;
      String docNoRuleStr = map.get("docNoRule").toString();
      if (docNoRuleStr != null && !"".equals(docNoRuleStr) && !"null".equals(docNoRuleStr)) {
        String sql =
            "select docNo from ess_document where stageId = '" + map.get("stageId")
                + "' and SUBSTR(docNo FROM 1 FOR LENGTH(docNO)-4)= '" + docNoRuleStr
                + "' and docNo is not null order by id desc";
        List<Map<String, Object>> list = query.query(sql, new MapListHandler());
        if (!list.isEmpty()) {
          String str = list.get(0).get("docNo").toString();
          str = str.substring(docNoRuleStr.length(), str.length());
          if (str.length() == 4) {
            for (int i = 0; i < str.length(); i++) {
              if (str.charAt(i) == '0') {
                continue;
              } else {
                num = Long.valueOf(str.substring(i, str.length())) * 1 + 1;
                break;
              }
            }
          }
          if (num != -1) {// 组装流水号
            if (num > 0 && num < 10) {
              serialNum = "000" + num;
            } else if (num >= 10 && num < 100) {
              serialNum = "00" + num;
            } else if (num >= 100 && num < 1000) {
              serialNum = "0" + num;
            } else if (num >= 1000) {
              serialNum = num + "";
            }
          } else {
            serialNum = "0001";
          }
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return serialNum;
  }

  /**
   * rongying 20150508 获取筛选页面元数据字段值
   * 
   * @param stageId
   * @param map
   * @return
   */
  public List<Map<String, Object>> getMetaDataField(Long stageId) {
    List<Map<String, Object>> hmList = getMetaList(stageId, true);
    List<Map<String, Object>> columnMapList = new ArrayList<Map<String, Object>>();
    HashMap<String, Object> columnMap = null;
    for (Map<String, Object> MetaData : hmList) {
      columnMap = new HashMap<String, Object>();
      if (MetaData.get("code").equals("stageCode") || MetaData.get("code").equals("deviceCode")
          || MetaData.get("code").equals("participatoryCode")
          || MetaData.get("code").equals("documentCode")
          || MetaData.get("code").equals("engineeringCode")
          || MetaData.get("code").equals("stageId")) {
        continue;
      }
      columnMap.put("code", MetaData.get("code"));
      columnMap.put("name", MetaData.get("name"));
      columnMap.put("type", MetaData.get("type"));
      columnMapList.add(columnMap);
    }
    return columnMapList;
  }

  /**
   * rongying 20150518 判断手动输入的类型代码，及专业代码
   * 
   * @param map
   * @return
   */
  public String checkInputCode(Map<String, Object> map) {
    String result = "";
    try {
      String sql = "select id from ess_participatory where 1=1 ";
      if (map.get("pId") != null && !"".equals(map.get("pId"))) {
        String[] arr = map.get("pId").toString().split(",");
        sql += " and FIND_IN_SET(pId,'" + map.get("pId") + "') or id = " + arr[0];
      }
      List<Map<String, Object>> list = query.query(sql, new MapListHandler());
      if (!list.isEmpty()) {
        sql =
            "select typeNo from " + map.get("type") + " where 1=1 and typeName = '"
                + map.get("name") + "'";
        if (map.get("pId") != null && !"".equals(map.get("pId"))) {
          String participatoryId = "";
          for (int i = 0; i < list.size(); i++) {
            participatoryId += list.get(i).get("id") + ",";
          }
          if (!"".equals(participatoryId)) {
            participatoryId = participatoryId.substring(0, participatoryId.length() - 1);
            sql += " and find_in_set(participatoryId,'" + participatoryId + "')";
          }
        }
        List<Map<String, Object>> list1 = query.query(sql, new MapListHandler());
        if (list1.size() == 0) {
          result = "false";
        } else if (list1.size() == 1) {
          result = list1.get(0).get("typeNo").toString();
        } else {
          result = "repeat";
        }
      } else {
        result = "false";
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return result;
  }

  /**
   * 根据部门code获取id
   */
  public String getPartIdByCode(Map<String, Object> map) {
    String success = "";
    try {
      String sql = "select id from ess_participatory where code = '" + map.get("partCode") + "'";
      int id = query.query(sql, new ScalarHandler<Integer>());
      String ids = this.getChildIdList(id);
      success = id + "," + ids;
    } catch (SQLException e) {
      e.printStackTrace();
      success = "false";
    }
    return success;
  }

  /**
   * 根据父节点获取子id
   * 
   * @param pId
   * @return
   */
  private String getChildIdList(long pId) {
    String SQL = "select id from ess_participatory where pId = ?";
    List<Map<String, Object>> tempid = null;
    String ids = "";
    try {
      tempid = query.query(SQL, new MapListHandler(), new Object[] {pId});
      if (tempid == null) {
        return "";
      }
      for (int i = 0; i < tempid.size(); i++) {
        Map<String, Object> map = tempid.get(i);
        String childIds = this.getChildIdList((Integer) map.get("id"));
        ids +=
            map.get("id").toString()
                + ("".equals(childIds) || null == childIds ? "" : "," + childIds) + ",";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
    if (!"".equals(ids)) {
      ids = ids.substring(0, ids.length() - 1);
    }
    return ids;
  }

  @Override
  public String checkDataIsSend(Map<String, Object> map) {
    String ids = map.get("ids") + "";
    String[] idArr = ids.split(",");
    String existsId = "";
    try {
      for (String id : idArr) {
        String sql =
            "select count(*) from ess_filesend where status='发放' and CONCAT(',',file_id,',') LIKE '%,"
                + id + ",%' ";
        Long count = query.query(sql, new ScalarHandler<Long>());
        if (count > 0)
          existsId = existsId + "," + id;
      }
      if ("".equals(existsId)) {
        String sql1 =
            "select count(*) from ess_document where borrowStatus in ('借阅','借出') and find_in_set(id,'"
                + ids + "')";
        Long count1 = query.query(sql1, new ScalarHandler<Long>());
        if (count1 > 0)
          existsId = "isBorrow";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
    return existsId;
  }

  /**
   * 导入时获取父节点和子节点相关的元数据字段
   * 
   * @param map
   * @return
   */
  private List<Map<String, Object>> getAllFieldsByParentId(HashMap<String, Object> map) {
    String treetype = map.get("treetype") + "";
    String treenodeid = map.get("treenodeid") + "";
    List<Map<String, Object>> fieldListMap = null;
    try {
      if ("1".equals(treetype)) {
        // 根据treenodeid 得到所有上级接点id和所有下级点id
        String ids = getPidAndCidByTreeId(treenodeid);
        if ("".equals(ids))
          return fieldListMap;
        String sql =
            "select code,name,type,length,isNull from ess_document_metadata where stageId in( "
                + ids + " ) or isSystem = 0";
        fieldListMap = query.query(sql, new MapListHandler());

      } else {
        String sql =
            "select code,name,type,length,isNull from ess_document_metadata where isSystem = 0";
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

  private boolean tableIfExists(String stageId) {
    String databaseName = getUrl();
    String sql =
        "select TABLE_NAME from information_schema.tables where  TABLE_NAME = 'esp_" + stageId
            + "' and TABLE_SCHEMA='"+databaseName+"' ";
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
}
