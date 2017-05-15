package cn.flying.rest.service.impl;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang.StringUtils;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.springframework.stereotype.Component;

import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IReportService;
import cn.flying.rest.service.entiry.EssReport;
import cn.flying.rest.service.utils.FileOperateUtil;
import cn.flying.rest.service.utils.PrintReportByThread;
import cn.flying.rest.service.utils.ZipUtil;
import cn.flying.rest.utils.BaseWS;

/**
 * 报表维护
 * 
 * @author xuekun
 * 
 */
@Path("reportService")
@Component
public class ReportServiceImpl extends BaseWS implements IReportService {
  private static final ExecutorService THREAD_POOL_SINGLE_EXECUTOR = Executors
      .newSingleThreadExecutor();

  private static final ThreadPoolExecutor THREAD_POOL_EXECUTOR = new ThreadPoolExecutor(
      10, 15, 60, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());

  /**
   * 创建文件夹
   * 
   * @param dir
   * @throws IOException
   */
  private static void createDirs(File dir) throws IOException {
    if (dir == null || dir.exists()) {
      return;
    }
    createDirs(dir.getParentFile());
    dir.mkdir();
  }

  /**
   * 创建文件
   * 
   * @param fileName
   * @return
   * @throws IOException
   */
  private static File createFile(String fileName) throws IOException {
    File f = new File(fileName);
    if (!f.exists()) {
      createDirs(f.getParentFile()); // 创建父目录
      f.createNewFile(); // 创建当前文件
    }
    return f;
  }
  @Resource(name = "queryRunner")
  private QueryRunner query;

  private ILogService logService;

  private MessageWS messageWS;

  @Override
  public HashMap<String, Object> add(HashMap<String, Object> map) {
    return null;
  }

  @Override
  public String addReport(HttpServletRequest request) {
    EssReport er = new EssReport();
    DiskFileItemFactory factory = new DiskFileItemFactory();
    factory.setSizeThreshold(2048);
    ServletFileUpload upload = new ServletFileUpload(factory);
    upload.setHeaderEncoding("UTF-8");
    boolean addFlag = true;
    try {
      @SuppressWarnings("unchecked")
      List<FileItem> items = upload.parseRequest(request);
      for (FileItem item : items) {
        if (item.getFieldName().equals("reportname")) {
          er.setTitle(item.getString("UTF-8"));
        }
        if (item.getFieldName().equals("reportstyle")) {
          er.setReportstyle(item.getString("UTF-8"));
        }
        if (item.getFieldName().equals("uploader")) {
          er.setUplodaer(item.getString("UTF-8"));
        }

        if (item.getFieldName().equals("file")) {
          er.setReportmodel(item.getString("UTF-8"));
        }
        // 添加获取报表的类型的标识，如出入库报表，移交清册报表（inout，transfer）
        if (item.getFieldName().equals("reportType")) {
          er.setReportType(item.getString("UTF-8"));
        }

        if (item.getFieldName().equals("reportid")) {
          String reportId = item.getString("UTF-8");
          if (null != reportId && !reportId.equals("")) {
            er.setIdReport(Long.parseLong(reportId));
            addFlag = false;
          }

        }

        if (item == null || item.isFormField()) {
          continue;
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    if (addFlag) {
      this.saveReport(er);
    } else {
      this.updateEssReport(er);
    }

    return "ok";
  }

  @Override
  public boolean checkTitleUnique(String title) {
    boolean flag = true;
    try {
      String sql = "select count(1) from ess_report t where t.title = ? ";
      long cnt = query.query(sql, new ScalarHandler<Long>(),
          new Object[] { title });
      if (cnt > 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  /**
   * 清空文件夹 工具方法
   */
  public void clearDirectoryFiles(String directoryPath) {
    if ((null != directoryPath) && (!"".equals(directoryPath.trim()))) {
      try {
        File directoryFile = new File(directoryPath);
        if ((null != directoryFile) && (directoryFile.isDirectory())) {
          String[] filePathes = directoryFile.list();
          if ((null != filePathes) && (filePathes.length > 0)) {
            File tmpFile = null;
            for (int i = 0; i < filePathes.length; i++) {
              try {
                tmpFile = new File(directoryPath + "//" + filePathes[i]);
                if (tmpFile.isDirectory()) {
                  clearDirectoryFiles(directoryPath + "//" + filePathes[i]);
                }
                if (tmpFile.canWrite() || tmpFile.delete()) {
                  tmpFile.delete();
                }
              } catch (Exception ex) {
                ex.printStackTrace();
              }
            }
          }
        }
        directoryFile.delete();
      } catch (Exception ex) {
        ex.printStackTrace();
      }
    }
  }

  @Override
  public String deleteBatch(Map<String,Object> param, String userId, String ip) {
    String[] ids =  param.get("ids").toString().split(",");
    String title = param.get("title").toString();
   if (ids == null || ids.length== 0) {
      return "参数错误";
    }
    String sql = "delete from ess_report where id_report=?";
    try {
      Object[][] params = new Object[ids.length][];
      for (int i = 0; i < ids.length; i++) {
        params[i] = new Object[] { ids[i] };
      }
      int[] row = query.batch(sql, params);
      if (row == null) {
        return "未发现报表数据";
      } else {
        // 日志添加
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "报表维护");
        log.put("operate", "报表维护：删除报表");
        log.put("loginfo", "删除标题为【" + title.toString() + "】的报表");
        this.getLogService().saveLog(log);
        return "true";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
   
  }

  @Override
  public Map<String, Object> exportReport(Map<String, String> dataMap) {
    Map<String, Object> object = new HashMap<String, Object>();
    boolean success = false;
    String userId = dataMap.get("userId");
    String checked = dataMap.get("checked");
    String isAll = dataMap.get("isAll");
    String title = dataMap.get("title");
    title = title.replace(",", "】【");
    String[] results = new String[5];
    if (null != isAll && isAll.equals("true")) {
      String id_reportStr = this.getAllReportIds();
      if (null != id_reportStr && !"".equals(id_reportStr)) {
        String[] id_reports = id_reportStr.split(",");
        results = this.exportReport(id_reports);
      } else {
        object.put("message", "暂无报表文件可以导出！");// 暂无报表文件可以导出！
        success = false;
      }
    } else {
      if (null != checked) {
        String[] id_reports = checked.split(",");
        // 获得导出结果
        results = this.exportReport(id_reports);
      }
    }
    // 往前台回馈
    if (results[0] != null && results[0].equals("true")) {
      success = true;
      object.put("fileName", results[3]);
      object.put("filePath", results[4]);
      if (Integer.valueOf(results[1]) > 0 && Integer.valueOf(results[2]) > 0) {
        object.put("message", "成功导出报表文件" + results[2] + "份," + results[1]
            + "份报表无模板文件！");// 成功导出报表文件"份报表无模板文件!"

        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", dataMap.get("userIp"));
        log.put("userid", userId);
        log.put("module", "报表维护");
        log.put("operate", "报表维护：导出报表");
        log.put("loginfo", object.get("message")+"导出报表标题为：【"+title+"】");
        this.getLogService().saveLog(log);

      } else if (Integer.valueOf(results[1]) > 0
          && Integer.valueOf(results[2]) <= 0) {
        success = false;
        object.put("message", "您选择的报表不存在报表文件");// 您选择的报表不存在报表文件
      } else {
        object.put("message", "成功导出报表文件" + results[2] + "份!");
        
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", dataMap.get("userIp"));
        log.put("userid", userId);
        log.put("module", "报表维护");
        log.put("operate", "报表维护：导出报表");
        log.put("loginfo", object.get("message")+"导出报表标题为：【"+title+"】");
        this.getLogService().saveLog(log);
      }
    } else {
      success = false;
      object.put("message", "导出报表文件失败");// 导出报表文件失败
    }
    object.put("success", success);

    String ip = this.getReportServiceIP();
    String downloadUrl = ip + results[3];
    Map<String, String> messMap = new HashMap<String, String>();
    messMap.put("sender", userId);
    messMap.put("recevier", userId);
    messMap.put("sendTime",
        new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
    messMap.put("status", "No");
    messMap.put("workFlowId", "-14");
    messMap.put("workFlowStatus", "Run");
    messMap.put("content", results[3] + "已导出完毕，请及时点击下载");
    messMap.put("style", "color:red");
    messMap.put("handler", "$.messageFun.downFile('" + downloadUrl + "')");
    messMap.put("handlerUrl", "esdocument/0/x/ESMessage/handlerMsgPage");
    messMap.put("stepId", "0");
    getMessageWS().addMessage(messMap);
    return object;
  }

  /**
   * 导出报表文件
   * 
   * @param reportIds
   *          导出报表id集合
   * @return 导出信息集合
   */
  public String[] exportReport(String[] reportIds) {
    long time = System.currentTimeMillis();
    String jrXMLPath = this.getSystemReportPath();
    File dbFile = new File(jrXMLPath + "exportReport_" + time);
    if (!dbFile.exists()) {
      dbFile.mkdirs();
    }
    String[] results = new String[5];
    // 无报表模板的报表数
    int i = 0;
    // 有报表模板的报表数
    int j = 0;
    for (String id_report : reportIds) {
      Map<String, Object> report = this.get(Long.valueOf(id_report));
      // if (null != report.getISHAVE() && !"不存在".equals(report.getISHAVE())) {
      // 得到jrxml报表内容
      String fileStr = (String) report.get("reportmodel");
      // 在文件名前面加个s (因为IRpeort不能让jrxml以数字开头)
      String fileName = jrXMLPath + "exportReport_" + time + "//flying_"
          + report.get("title") + ".jrxml";
      // 写出文件
      FileOperateUtil.writeTextFile(fileStr, fileName);
      j++;
      // } else {
      // i++;
      // }
    }
    try {
      if (j > 0) {
        new ZipUtil().createZip(jrXMLPath + "exportReport_" + time + ".zip",
            jrXMLPath + "exportReport_" + time + "//", "exportReport_" + time);
      }
      this.clearDirectoryFiles(jrXMLPath + "exportReport_" + time + "//");
      results[0] = "true";
      results[1] = String.valueOf(i);// 无报表模板的数量
      results[2] = String.valueOf(j);// 成功导出的数量
      results[3] = "exportReport_" + time + ".zip";// fileName
      results[4] = jrXMLPath + "exportReport_" + time + ".zip";// filePath
    } catch (Exception e) {
      results[0] = "false";
      System.out.println("报表文件打包失败");
      e.printStackTrace();
    }
    return results;
  }

  @Override
  public Map<String, Object> get(Long id) {
    Map<String, Object> map = null;
    try {
      String sql = "select id_report idReport,ishave,title,uplodaer ,reportType, reportstyle,reportmodel from ess_report where id_report=?";
      map = query.query(sql, new MapHandler(), new Object[] { id });
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  public String getAllReportIds() {
    String id_reports = null;
    String sql = "select GROUP_CONCAT(ID_REPORT) from ESS_REPORT";
    try {
      id_reports = query.query(sql, new ScalarHandler<String>());
      if (id_reports == null) {
        id_reports = "";
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return id_reports;
  }

  @Override
  public long getCount(HashMap<String, Object> map) {
    Long count = 0l;
    try {
      String sql = "select count(1) cnt from ess_report where 1=1 ";
      if(map.get("reportType") != null && !"".equals(map.get("reportType").toString()) && 
          !"null".equals(map.get("reportType").toString())){
        sql += " and reportType = '"+map.get("reportType")+"'";
      }
      List<Object> params = new ArrayList<Object>();
      String keyWord = (String) map.get("keyWord");
      if (!StringUtils.isEmpty(keyWord)) {
        sql += " and (title like ?  or uplodaer like ? or reportstyle like ? ";
        if(keyWord.indexOf("W")!=-1 || keyWord.indexOf("O")!=-1 || keyWord.indexOf("R")!=-1 || keyWord.indexOf("D")!=-1
        		||keyWord.indexOf("w")!=-1 || keyWord.indexOf("o")!=-1 || keyWord.indexOf("r")!=-1 || keyWord.indexOf("d")!=-1){
            sql += " or reportstyle like 'rtf'"; 
        }
        sql +=")";
        params.add("%" + keyWord + "%");
        params.add("%" + keyWord + "%");
        params.add("%" + keyWord + "%");
      }

      Object cnt = query.query(sql, new ScalarHandler<Object>(),
          params.toArray());
      if (cnt != null) {
        count = Long.parseLong(cnt.toString());
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return count;
  }

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private MessageWS getMessageWS() {
    if (messageWS == null) {
      messageWS = this.getService(MessageWS.class);
    }
    return messageWS;
  }

  /**
   * 获取路径
   * 
   * @return
   */
  private String getPath() {
    URL url = getClass().getProtectionDomain().getCodeSource().getLocation();
    String path = "/" + url.toString();
    int index = path.indexOf("WEB-INF");
    path = path.substring(6, index) + "report/";
    return path;

  }

  /**
   * 获取报表模版路径
   * 
   * @param reportId
   * @return
   */
  private File getReportFile(long reportId) {
    Map<String, Object> report = this.get(reportId);
    String jrxml = (String) report.get("reportmodel");
    try {
      ByteArrayInputStream in = new ByteArrayInputStream(
          jrxml.getBytes("UTF-8"));
      String filename = report.get("idreport") + "-"
          + System.currentTimeMillis() + ".jrxml";
      System.out.println("打印报表name：" + filename);// 测试使用
      String filePath = getPath() + filename;
      File file = new File(filePath);
      file = createFile(file.getAbsolutePath());
      int bytesRead = 0;
      FileOutputStream newFile = new FileOutputStream(file, true);
      byte[] buffer = new byte[8192];
      while ((bytesRead = in.read(buffer, 0, 8192)) != -1) {
        newFile.write(buffer, 0, bytesRead);
      }
      newFile.close();
      in.close();
      return file;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  public String getReportServiceIP() {
    String ipString = this.getServiceIP();
    String temp = ipString.substring(ipString.indexOf("rest"),
        ipString.length());
    String outFile = ipString.replace(temp, "reportModel") + "/";
    return outFile;

  }

  @Override
  public String getServiceIP() {
    return this.getNamingService().findApp(this.getInstanceId(),
        "reportService", this.getServiceId(), this.getToken());
  }

  public String getSystemReportPath() {
    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath = this.getClass().getProtectionDomain().getCodeSource()
        .getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "reportModel/";

    address = UPLOADED_FILE_PATH;

    return address;
  }

  @SuppressWarnings({ "unused", "rawtypes" })
  @Override
  public String getWorkflowReportUrl(Map<String, String> dataMap) {
    String userId = dataMap.get("userId");
    String printForm = dataMap.get("printForm");
    String userFormNo = dataMap.get("userFormNo");
    String reportsIds = dataMap.get("reportsIds");
    String reportTitle = dataMap.get("reportTitle");
    String[] reportIdVector = reportsIds.split(",");
    String[] savePath = null;
    List listPdf = null;
    if (reportIdVector.length > 1) {
      savePath = new String[reportIdVector.length];
      listPdf = new ArrayList();
    }
    // 获取报表ID
    long reportId = Long.parseLong(reportIdVector[0]);
    File file = this.getReportFile(reportId);
    Map<String, Object> report = get(reportId);
    // 报表的类型
    String reportType = report.get("reportType").toString();
    // 报表输出格式
    String reportStype = report.get("reportstyle").toString();
    // 获取表单数据
    List<Map<String, String>> reportData = new ArrayList<Map<String, String>>();
    // 组装打印所需的列表字段和对应的值
    if (null != printForm && printForm.length() > 0) {
      String[] printForms = printForm.split("&");
      Map<String, String> dm = new HashMap<String, String>();
      for (String str : printForms) {
        if (!"".equals(str) && null != str) {
          String[] str1 = str.split("=");
          dm.put(str1[0], str1.length > 1 ? str1[1].replace("undefined", "")
              : "");
        }
      }
      dm.put("表单编号", userFormNo);
      reportData.add(dm);
    }
    long date = System.currentTimeMillis();
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String creat_date = sdf.format(date);
    Map<String, String> msgMap = new HashMap<String, String>();
    msgMap.put("id_foreign", null);
    msgMap.put("userId", userId);
    msgMap.put("userName", userId);
    msgMap.put("creat_date", creat_date);
    msgMap.put("infoType", "printReport");
    msgMap.put("infoName", reportTitle);
    msgMap.put("printStatus", "false");
    msgMap.put("downloadStatus", "未下载");
    msgMap.put("address", "#");
    long idInfo = this.saveInfomation(msgMap);

    String ipString = this.getServiceIP();
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("file", file);
    map.put("list", reportData);
    map.put("reportstyle", reportStype);
    map.put("isCompare", "false");
    map.put("reportService", this);
    map.put("ipString", ipString);
    map.put("id", idInfo);
    map.put("userId", userId);
    map.put("fileInfo", reportTitle);
    map.put("instanceId", this.getInstanceId());
    PrintReportByThread printReportByThread = new PrintReportByThread(map,
        getMessageWS());
    THREAD_POOL_EXECUTOR.execute(printReportByThread);
    String urlid = null;
    return urlid;
  }

  @Override
  public List<Map<String, Object>> list(Integer page, Integer rp,
      HashMap<String, Object> map) {
    List<Map<String, Object>> list = null;
    try {
      String sql = "select id_report idReport,ishave,title,uplodaer ,reportType, reportstyle from ess_report where 1=1 ";
      if(map.get("reportType") != null && !"".equals(map.get("reportType").toString()) && 
          !"null".equals(map.get("reportType").toString())){
        sql += " and reportType = '"+map.get("reportType")+"'";
      }
      List<Object> params = new ArrayList<Object>();
      String keyWord = (String) map.get("keyWord");
      if (!StringUtils.isEmpty(keyWord)) {
        sql += " and (title like ?  or uplodaer like ? or reportstyle like ? ";
        if(keyWord.indexOf("W")!=-1 || keyWord.indexOf("O")!=-1 || keyWord.indexOf("R")!=-1 || keyWord.indexOf("D")!=-1
        		||keyWord.indexOf("w")!=-1 || keyWord.indexOf("o")!=-1 || keyWord.indexOf("r")!=-1 || keyWord.indexOf("d")!=-1){
            sql += " or reportstyle like 'rtf'"; 
        }
        sql +=")";
        params.add("%" + keyWord + "%");
        params.add("%" + keyWord + "%");
        params.add("%" + keyWord + "%");
      }
      if (null != page && null != rp) {
        int start = (page - 1) * rp;
        sql = sql + " limit ?,?";
        params.add(start);
        params.add(rp);
      }
      list = query.query(sql, new MapListHandler(), params.toArray());
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return list;
  }

  @Override
  public String runReportManager(Map<String, Object> params) {
    File file = this.getReportFile(Long.parseLong(params.get("reportId")
        .toString()));
    SAXBuilder saxBuilder = new SAXBuilder();
    saxBuilder
        .setFeature(
            "http://apache.org/xml/features/nonvalidating/load-external-dtd",
            false);
    saxBuilder.setFeature("http://xml.org/sax/features/validation", false);
    org.jdom.Document docs = null;
    try {
      docs = saxBuilder.build(file);
      // 测试使用
      if (file == null) {
        System.out.println("打印报表：file是null");
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    Element root = null;
    try {
      root = docs.getRootElement();
      // 测试使用
      if (root == null) {
        System.out.println("打印报表：root是null");
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> reportData = (List<Map<String, Object>>) params
        .get("reportData");
    if (null == reportData || reportData.size() == 0) {
      if (file != null) {
        file.delete();
      }
      return "nodata";
    }
    long date = System.currentTimeMillis();
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String creat_date = sdf.format(date);
    Map<String, String> dataMap = new HashMap<String, String>();
    dataMap.put("id_foreign", null);
    dataMap.put("userId", params.get("userid").toString());
    dataMap.put("userName", params.get("username").toString());
    dataMap.put("creat_date", creat_date);
    dataMap.put("infoType", "printReport");
    dataMap.put("infoName", params.get("reportTitle").toString());
    dataMap.put("printStatus", "false");
    dataMap.put("downloadStatus", "未下载");
    dataMap.put("address", "#");
    Long idInfo = this.saveInfomation(dataMap);

    Map<String, Object> map = new HashMap<String, Object>();
    map.put("file", file);
    map.put("list", reportData);
    map.put("reportstyle", params.get("reportType"));
    map.put("ipString", this.getServiceIP());
    map.put("id", idInfo);
    map.put("isCompare", "false");
    map.put("userId", params.get("userid").toString());
    map.put("fileInfo", params.get("reportTitle").toString());
    map.put("instanceId", 0);
    map.put("reportService", this);
    PrintReportByThread printReportByThread = new PrintReportByThread(map,
        getMessageWS());
    THREAD_POOL_SINGLE_EXECUTOR.execute(printReportByThread);
    return "true";
  }

  /**
   * 保存打印报表信息
   * 
   * @param dataMap
   * @return
   */
  public Long saveInfomation(Map<String, String> dataMap) {
    Long id = null;
    StringBuilder builder = new StringBuilder();
    builder
        .append("INSERT INTO ess_reportInfomation(id_foreign,userId,userName,creat_date,infoType,infoName,printStatus,downloadStatus,address) ");
    builder.append("values(?,?,?,?,?,?,?,?,?)");
    Object[] params = {
        dataMap.get("id_foreign") == null ? 0 : dataMap.get("id_foreign"),
        dataMap.get("userId"), dataMap.get("userName"),
        dataMap.get("creat_date"), dataMap.get("infoType"),
        dataMap.get("infoName"), dataMap.get("printStatus"),
        dataMap.get("downloadStatus"), dataMap.get("address") };
    try {
      id = query.insert(builder.toString(), new ScalarHandler<Long>(), params);
      if (id == null) {
        id = 0l;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return id;
  }

  private Long saveReport(EssReport er) {
    Long id = null;
    try {
      String sql = "insert into ess_report (title,reportstyle,uplodaer,reportmodel,reportType)values(?,?,?,?,?)";
      id = query.insert(sql, new ScalarHandler<Long>(),
          new Object[] { er.getTitle(), er.getReportstyle(), er.getUplodaer(),
              er.getReportmodel(), er.getReportType() });
      if (id == null) {
        id = 0l;
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
    return id;
  }

  @Override
  public Boolean saveReportTemForEdit(Map<String, String> dataMap) {
    String title = dataMap.get("title");
    String reportid = dataMap.get("reportid");
    String reportstyle = dataMap.get("reportstyle");
    String userId = dataMap.get("userId");
    StringBuilder sql = new StringBuilder();
    boolean flag = true;

    try {
      sql.append("update ess_report set TITLE=?,REPORTSTYLE=?,UPLODAER=? where ID_REPORT=?");
      Object[] params = { title, reportstyle, userId, reportid };
      int row = query.update(sql.toString(), params);
      if (row == 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      flag = false;
    }
    if (flag) {
      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", dataMap.get("ip"));
      log.put("userid", userId);
      log.put("module", "报表维护");
      log.put("operate", "报表维护：保存报表");
      log.put("loginfo", "保存标题为【" + title + "】的报表信息");
      this.getLogService().saveLog(log);
    }

    return flag;
  }

  @Override
  public String update(HashMap<String, String> map) {
    return null;
  }

  private boolean updateEssReport(EssReport er) {
    boolean flag = false;
    try {
      String sql = "update  ess_report set title=?,reportstyle=?,uplodaer=?,reportmodel=?,reportType=? where id_report=?";
      int row = query.update(sql,
          new Object[] { er.getTitle(), er.getReportstyle(), er.getUplodaer(),
              er.getReportmodel(), er.getReportType(), er.getIdReport() });
      if (row != 0) {
        flag = true;
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
    return flag;
  }

  @Override
  public boolean updateInfomation(HashMap<String, String> map) {
    Set<String> ketSet = map.keySet();
    StringBuilder builder = new StringBuilder();
    builder.append("UPDATE ess_reportInfomation SET ");
    for (String key : ketSet) {
      if ("id".equals(key)) {
        continue;
      }
      builder.append(key).append(" = '").append(map.get(key)).append("', ");
    }
    builder.deleteCharAt(builder.lastIndexOf(","));
    builder.append("WHERE id = ").append(map.get("id"));
    boolean flag = true;
    try {
      int row = query.update(builder.toString());
      if (row == 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }

    return flag;
  }

  @Override
  public String delete(Long[] ids, String userId, String ip) {
    // TODO Auto-generated method stub
    return null;
  }
}
