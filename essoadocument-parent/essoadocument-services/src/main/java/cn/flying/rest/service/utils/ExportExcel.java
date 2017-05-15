package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;


/**
 * @see 文件鉴定数据的导出 导出格式为excel
 * 
 */
public class ExportExcel {

  // //读spring配置文件
  // public static BeanFactory factory = new
  // FileSystemXmlApplicationContext("web/WEB-INF/spring.xml");
  //
  // static TagManager tagManager=(TagManager) factory.getBean("tagManager");

  /**
   * 导出电子文件数据 wanghongchen edit 20141020 修改此方法
   * 
   * @param datalist
   * @return
   */
  public HashMap<String, String> exportExcelDocument(List<Map<String, String>> datalist) {
    HashMap<String, String> map = new HashMap<String, String>();
    if (datalist == null || datalist.size() == 0) {
      return map;
    }
    /**
     * 设置导出的目录（服务器的地址WEB-INF同等级的Data目录下）
     */

    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    List<String> header = new ArrayList<String>();
    header.add("原文路径");
    header.add("文件类别");
    header.add("文件校验");
    header.add("创建时间");
    header.add("文件大小");
    header.add("文件标识");
    header.add("文件类型");
    header.add("tempID");
    // 声明一个工作薄
    HSSFWorkbook workbook = new HSSFWorkbook();
    // 生成一个表格
    HSSFSheet sheet = workbook.createSheet("电子文件条目");
    // 产生表格标题行
    Row row = sheet.createRow(0); // yanggaofei 20130307 modify
    row.setHeight((short) 400);
    for (int i = 0; i < header.size(); i++) {
      Cell cell = row.createCell(i);
      cell.setCellValue(header.get(i));
    }
    int columns = header.size(); // 设置总的列数的宽度
    int rownum = datalist.size(); // 表格的行的长度
    // 写入datalist中的数据
    for (int i = 0; i < rownum; i++) {
      row = sheet.createRow(i + 1);
      for (int j = 0; j < columns; j++) {
        Cell cell = row.createCell(j);
        // 设置单元格的值
        if (header.get(j).equals("文件标识")) {
          cell.setCellValue(datalist.get(i).get("ESFILEID"));
        } else {
          cell.setCellValue(datalist.get(i).get(header.get(j)));
        }
      }
    }
    // 将文件存到服务器指定位置
    Date currentTime = new Date();
    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmssSSS");
    String dateString = formatter.format(currentTime);
    try {
      File file = new File(address + "" + dateString + ".xls");
      file = createFile(file.getAbsolutePath());
      FileOutputStream fout = new FileOutputStream(file);
      workbook.write(fout);
      fout.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
    map.put("path", dateString + ".xls");
    return map;
  }

  private static File createFile(String fileName) throws IOException {
    File f = new File(fileName);
    if (!f.exists()) {
      createDirs(f.getParentFile()); // 创建父目录
      f.createNewFile(); // 创建当前文件
    }
    return f;
  }

  private static void createDirs(File dir) throws IOException {
    if (dir == null || dir.exists()) {
      return;
    }
    createDirs(dir.getParentFile());
    dir.mkdir();
  }

  // **************************************************************************************************************


  public String exportExcelByList(List<Map<String, Object>> listData,
      List<Map<String, Object>> headers, Map<String, Map<String, String>> treeCodeAndNameMap, String sheetname) {
    if (listData == null || listData.size() == 0) {
      return null;
    }
    /**
     * 设置导出的目录（服务器的地址WEB-INF同等级的Data目录下）
     */

    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";

    address = UPLOADED_FILE_PATH;

    // 声明一个工作薄
    HSSFWorkbook workbook = new HSSFWorkbook();
    // 生成一个表格
    HSSFSheet sheet = workbook.createSheet(sheetname);
    // 产生表格标题行
    HSSFRow row = sheet.createRow(0);
    // row.setHeight((short)400);

    // 在导出数据的最后加入一个临时字段 保存导出数据的唯一标识 和 电子文件级做关联
    Map<String, Object> tempField = new HashMap<String, Object>();
    tempField.put("name", "tempId");
    tempField.put("code", "tempId");//此id为插入数据的ess_document 下的id
    headers.add(tempField);

    for (int i = 0; i < headers.size(); i++) {
      HSSFCell cell = row.createCell(i);
      cell.setCellValue(headers.get(i).get("name").toString());
    }

    int columns = headers.size(); // 设置总的列数的宽度
    int rownum = listData.size(); // 表格的行的长度
    // 写入datalist中的数据
    for (int i = 0; i < rownum; i++) {
      HSSFRow row1 = sheet.createRow(i + 1);
      for (int j = 0; j < columns; j++) {
        HSSFCell cell1 = row1.createCell(j);
        // 设置单元格的值
        //字段名
       String field = headers.get(j).get("code")+"";
       String value = listData.get(i).get(field) + "";
       //将收集范围 装置号 拟定部门 文件类型代码 文件专业代码 转变为名称 
       /* if("stageCode".equals(field)){
          value = listData.get(i).get("stageName")+"";
        }else if("participatoryCode".equals(field)){
          value =  listData.get(i).get("participatoryName")+"";
        }else if("deviceCode".equals(field)){
          value = listData.get(i).get("deviceName")+"";
        }else if("documentCode".equals(field)){
          value = listData.get(i).get("documentTypeName")+"";
        }else if("engineeringCode".equals(field)){
          value = listData.get(i).get("engineeringName")+"";
        }
        if("stageName".equals("stageName")){
          continue;
        }else if("participatoryName".equals("participatoryName")){
          continue;
        }else if("deviceName".equals("deviceName")){
          continue;
        }else if("documentTypeName".equals("documentTypeName")){
          continue;
        }else if("engineeringName".equals("engineeringName")){
          continue;
        }*/
        if (!"null".equals(value))
          cell1.setCellValue(value);
      }
    }

    // 将文件存到服务器指定位置
    Date currentTime = new Date();
    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
    String dateString = formatter.format(currentTime);

    try {
      String fileName = dateString + ".xls";
      String fullName = address + "" + fileName;
      File file = new File(fullName);
      if (!file.exists()) {
        createDirs(file.getParentFile()); // 创建父目录
        file.createNewFile(); // 创建当前文件
      }
      FileOutputStream fout = new FileOutputStream(fullName);
      workbook.write(fout);
      fout.close();
      return fileName;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * 导出电子文件级数据（文控系统）
   * 
   * @param datalist
   * @return
   */
  public String exportExcelFile(List<Map<String, Object>> datalist) {
    if (datalist == null || datalist.size() == 0) {
      return null;
    }
    /**
     * 设置导出的目录（服务器的地址WEB-INF同等级的Data目录下）
     */

    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    List<String> header = new ArrayList<String>();
    header.add("原文路径");
    header.add("文件校验");
    header.add("文件标识");
    header.add("文件大小");
    header.add("文件类型");
    header.add("创建时间");
    header.add("tempId");
    List<String> fieldKeyList = new ArrayList<String>();
    fieldKeyList.add("esFilePath");// 原文路径
    fieldKeyList.add("esmd5");// 文件校验
    fieldKeyList.add("originalId");// 文件标识
    fieldKeyList.add("essize");// 文件大小
    fieldKeyList.add("estype");// 文件类型
    fieldKeyList.add("createTime");// 创建时间
    fieldKeyList.add("documentId");// 临时pid
    // 声明一个工作薄
    HSSFWorkbook workbook = new HSSFWorkbook();
    // 生成一个表格
    HSSFSheet sheet = workbook.createSheet("电子文件条目");
    // 产生表格标题行
    Row row = sheet.createRow(0); // yanggaofei 20130307 modify
    row.setHeight((short) 400);
    for (int i = 0; i < header.size(); i++) {
      Cell cell = row.createCell(i);
      cell.setCellValue(header.get(i));
    }
    int columns = header.size(); // 设置总的列数的宽度
    int rownum = datalist.size(); // 表格的行的长度
    // 写入datalist中的数据
    for (int i = 0; i < rownum; i++) {
      row = sheet.createRow(i + 1);
      for (int j = 0; j < columns; j++) {
        Cell cell = row.createCell(j);
        sheet.setColumnWidth(j, 30 * 256);
        // 设置单元格的值
        if (fieldKeyList.get(j).equals("esFilePath")) {
          cell.setCellValue(datalist.get(i).get("esViewTitle") + "/"
              + datalist.get(i).get("estitle"));
        } else if (fieldKeyList.get(j).equals("createTime")) {
          Object time = datalist.get(i).get(fieldKeyList.get(j));
          if (time != null) {
            cell.setCellValue(DateUtil.formatDateTime(Long.parseLong(time + "")));
          }
        } else {
          Object value = datalist.get(i).get(fieldKeyList.get(j));
          if (value != null) {
            cell.setCellValue(value + "");
          }
        }
      }
    }
    // 将文件存到服务器指定位置
    Date currentTime = new Date();
    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmssSSS");
    String dateString = formatter.format(currentTime);
    try {
      File file = new File(address + "" + dateString + ".xls");
      file = createFile(file.getAbsolutePath());
      FileOutputStream fout = new FileOutputStream(file);
      workbook.write(fout);
      fout.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
    String fileName = dateString + ".xls";
    return fileName;
  }


  // 导出文控日志文件
  public String exportExcelByListLog(List<HashMap<String, String>> listData, List<String> headers,
      String sheetname) {
    /**
     * 设置导出的目录（服务器的地址WEB-INF同等级的Data目录下）
     */
    // 存放文件在服务器的地址
    String address = "";
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";

    address = UPLOADED_FILE_PATH;

    // 声明一个工作薄
    HSSFWorkbook workbook = new HSSFWorkbook();
    // gengqianfeng 20141016 数据量大时生成多个sheet
    int rownum = listData.size(); // 表格的行的长度
    int rowmax = 65535;// execel单表最大容量值
    int sheetnum = (rownum % rowmax == 0) ? (rownum / rowmax) : (rownum / rowmax + 1);
    for (int s = 0; s < sheetnum; s++) {
      // 生成一个表格
      HSSFSheet sheet = workbook.createSheet(sheetname + (sheetnum == 1 ? "" : s + 1));
      // 产生表格标题行
      HSSFRow row = sheet.createRow(0);
      for (int i = 0; i < headers.size(); i++) {
        HSSFCell cell = row.createCell(i);
        cell.setCellValue(headers.get(i).toString());
      }
      int columns = headers.size(); // 设置总的列数的宽度
      int rowsheet = (rownum % rowmax == 0) || (s < sheetnum - 1) ? rowmax : rownum % rowmax;
      // 写入datalist中的数据
      for (int i = 0; i < rowsheet; i++) {
        HSSFRow row1 = sheet.createRow(i + 1);
        for (int j = 0; j < columns; j++) {
          HSSFCell cell = row1.createCell(j);
          // 设置单元格的值
          cell.setCellValue(listData.get(i).get(headers.get(j)));
        }
      }
    }
    // 将文件存到服务器指定位置
    Date currentTime = new Date();
    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
    String dateString = formatter.format(currentTime);
    try {
      File fDir = new File(address);
      if (!fDir.exists()) {
        fDir.mkdir();
      }
      String fileName = dateString + ".xls";
      String fuleName = address + "" + fileName;
      FileOutputStream fout = new FileOutputStream(fuleName);
      workbook.write(fout);
      fout.close();
      return fileName;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
  
  /**
   * 通用导出（文控系统）
   * 
   * @param datalist
   * @return
   */
  public String exportExcel(List<Map<String, Object>> datalist,Map<String, String> fieldMap, String sheetName) {
    if (datalist == null || datalist.size() == 0) {
      return null;
    }
    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    //得到此表字段
    Set<String> header = fieldMap.keySet();
    // 声明一个工作薄
    HSSFWorkbook workbook = new HSSFWorkbook();
    // 生成一个表格
    HSSFSheet sheet = workbook.createSheet(sheetName);
    // 产生表格标题行
    Row row = sheet.createRow(0);
    row.setHeight((short) 400);
    int count = 0;
    for (String key : header) {
      Cell cell = row.createCell(count++);
      cell.setCellValue(fieldMap.get(key));
    }
    int rownum = datalist.size(); // 表格的行的长度
    // 写入datalist中的数据
    for (int i = 0; i < rownum; i++) {
      row = sheet.createRow(i + 1);
      Map<String, Object> data = datalist.get(i);
      int j = 0;
      for (String column : header) {
        Cell cell = row.createCell(j);
        sheet.setColumnWidth(j, 15 * 256);
        // 设置单元格的值
          Object value = data.get(column);
          if (value != null) {
            cell.setCellValue(value + "");
        }
          j++;
      }
    }
    // 将文件存到服务器指定位置
    Date currentTime = new Date();
    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmssSSS");
    String dateString = formatter.format(currentTime);
    try {
      File file = new File(address + "" + dateString + ".xls");
      file = createFile(file.getAbsolutePath());
      FileOutputStream fout = new FileOutputStream(file);
      workbook.write(fout);
      fout.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
    String fileName = dateString + ".xls";
    return fileName;
  }
}
