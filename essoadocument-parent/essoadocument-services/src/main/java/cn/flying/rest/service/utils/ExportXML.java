package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.output.DOMOutputter;
import org.jdom.output.XMLOutputter;

public class ExportXML {
  /**
   * dom对象
   */
  private org.w3c.dom.Document dom = null;

  /**
   * dom对象
   */
  private Document document = null;

  /**
   * 复写导出XML类
   * 
   * @author liuhezeng 20140512
   * @param datalist
   * @param cnumbers
   * @param esidentifiers
   * @param cNColsForXml
   * @return 返回导出的参数，格式如({path=20140512111904.xml, success=true})
   */

  public HashMap exportXml(List<HashMap<String, String>> datalist,
      HashMap<String, String> cNColsForXml) {
    HashMap map = new HashMap();

    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    boolean writeFlag = false;
    Document doc = new Document();
    /** 创建根元素 **/
    Element rootElement = new Element("data");
    Date date = new Date();
    DateFormat dateFormat = DateFormat.getDateTimeInstance();
    String nowDate = dateFormat.format(date);
    /** 创建根元素属性 **/
    Attribute versionAttribute = new Attribute("version", "1.0");
    Attribute dateAttribute = new Attribute("createdate", nowDate);
    Attribute struLevelAttribute = new Attribute("struLevelAttribute", (1) + "");
    rootElement.setAttribute(versionAttribute);
    rootElement.setAttribute(dateAttribute);
    rootElement.setAttribute(struLevelAttribute);
    doc.setRootElement(rootElement);
    /** 遍历SimplePkgs加入到根元素下 **/
    for (HashMap<String, String> datamap : datalist) {
      /** 创建package元素(包节点) **/
      Element pkgElement = new Element("Package");
      /** 创建description元素(包的描述信息) **/
      Element descriptionElement = new Element("Description");
      /** 遍历,将字段及值逐一写到描述信息节点下 **/
      for (String f : datamap.keySet()) {
        String str = cNColsForXml.get(f.toString());
        if (null == str) {
          continue;
        }
        /** 是否包含原文路径 **/
        if (str.contains("Is_@Resouce#~Data*0Type")) {
          str = str.replace("Is_@Resouce#~Data*0Type", "E-FILE-");
        }
        String tmpValue = "";
        if (null == datamap.get(f)) {
          tmpValue = "";
        } else {
          tmpValue = datamap.get(f).replaceAll("\n", "").replaceAll("\r", "").toString();
        }

        descriptionElement.addContent(new Element(str).setText(tmpValue));
      }
      /** 将包描述信息加到package元素下 **/
      pkgElement.addContent(descriptionElement);
      /** 将包元素加入到根元素下 **/
      rootElement.addContent(pkgElement);
    }

    try {
      this.setDocument(doc);
      DOMOutputter outter = new DOMOutputter();
      this.setW3CDocument(outter.output(doc));
      writeFlag = true;

      // 将文件存到服务器指定位置
      Date currentTime = new Date();
      SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
      String dateString = formatter.format(currentTime);

      try {

        XMLOutputter out = new XMLOutputter();
        File file = new File(address + "" + dateString + ".xml");
        file = createFile(file.getAbsolutePath());
        try {
          out.output(this.getDocument(), new FileOutputStream(file));
        } catch (FileNotFoundException e) {
          // TODO 自动生成 catch 块
          e.printStackTrace();
        } catch (IOException e) {
          // TODO 自动生成 catch 块
          e.printStackTrace();
        }

      } catch (Exception e) {
        e.printStackTrace();
        writeFlag = false;
      }
      map.put("success", writeFlag);
      map.put("path", dateString + ".xml");
    } catch (JDOMException e) {
      writeFlag = false;
    }
    return map;
  }

  /**
   * 件盒级xml导出
   * 
   * @param innerFilelist
   * @param documentList
   * @param cNColsForXml
   * @return
   */
  public HashMap exportXml(List<Map<String, String>> innerFilelist,
      List<Map<String, String>> documentList, HashMap<String, String> cNColsForXml) {
    HashMap map = new HashMap();

    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    boolean writeFlag = false;
    Document doc = new Document();
    /** 创建根元素 **/
    Element rootElement = new Element("data");
    Date date = new Date();
    DateFormat dateFormat = DateFormat.getDateTimeInstance();
    String nowDate = dateFormat.format(date);
    /** 创建根元素属性 **/
    Attribute versionAttribute = new Attribute("version", "1.0");
    Attribute dateAttribute = new Attribute("createdate", nowDate);
    Attribute struLevelAttribute = new Attribute("struLevelAttribute", (2) + "");
    rootElement.setAttribute(versionAttribute);
    rootElement.setAttribute(dateAttribute);
    rootElement.setAttribute(struLevelAttribute);
    doc.setRootElement(rootElement);
    for (Map<String, String> datamap : innerFilelist) {
      /** 创建package元素(包节点) **/
      Element pkgElement = new Element("Package");
      /** 创建description元素(包的描述信息) **/
      Element descriptionElement = new Element("Description");
      /** 遍历,将字段及值逐一写到描述信息节点下 **/
      for (String f : datamap.keySet()) {
        String str = cNColsForXml.get(f.toString());
        if (null == str) {
          continue;
        }
        String tmpValue = "";
        if (null == datamap.get(f)) {
          tmpValue = "";
        } else {
          tmpValue = datamap.get(f).replaceAll("\n", "").replaceAll("\r", "").toString();
        }

        descriptionElement.addContent(new Element(str).setText(tmpValue));
      }
      /** 将包描述信息加到package元素下 **/
      pkgElement.addContent(descriptionElement);
      /** 导出电子文件 **/
      String innerFileId = datamap.get("ID");
      List<Map<String, String>> tempDocMaps = new ArrayList<Map<String, String>>();
      for (Map<String, String> documentMap : documentList) {
        if (documentMap.get("tempID").equals(innerFileId)) {
          tempDocMaps.add(documentMap);
        }
      }
      Element docContentElement = new Element("Content");

      for (Map<String, String> tempDocMap : tempDocMaps) {
        Element docPkgElement = new Element("Package");
        Element docDescElement = new Element("Description");
        for (String k : tempDocMap.keySet()) {
          // if(k.equals("ESFILEID")){
          // continue;
          // }
          docDescElement.addContent(new Element(k).setText(tempDocMap.get(k)));
        }
        docPkgElement.addContent(docDescElement);
        docContentElement.addContent(docPkgElement);
      }
      pkgElement.addContent(docContentElement);
      /** 将包元素加入到根元素下 **/
      rootElement.addContent(pkgElement);
    }

    try {
      this.setDocument(doc);
      DOMOutputter outter = new DOMOutputter();
      this.setW3CDocument(outter.output(doc));
      writeFlag = true;

      // 将文件存到服务器指定位置
      Date currentTime = new Date();
      SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
      String dateString = formatter.format(currentTime);

      try {

        XMLOutputter out = new XMLOutputter();
        File file = new File(address + "" + dateString + ".xml");
        file = createFile(file.getAbsolutePath());
        try {
          out.output(this.getDocument(), new FileOutputStream(file));
        } catch (FileNotFoundException e) {
          e.printStackTrace();
        } catch (IOException e) {
          e.printStackTrace();
        }

      } catch (Exception e) {
        e.printStackTrace();
        writeFlag = false;
      }
      map.put("path", dateString + ".xml");
    } catch (JDOMException e) {
      writeFlag = false;
    }
    return map;
  }

  /**
   * 案卷卷内级xml导出 edit wanghongchen 20140911 修改此方法，完善xml导出
   * 
   * @param filelist
   * @param innerFilelist
   * @param documentList
   * @param cNColsForXml
   * @param innerCNColsForXml
   * @return
   */
  public HashMap exportXml(List<Map<String, String>> filelist,
      List<Map<String, String>> innerFilelist, List<Map<String, String>> documentList,
      HashMap<String, String> cNColsForXml, HashMap<String, String> innerCNColsForXml) {
    HashMap map = new HashMap();

    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    boolean writeFlag = false;
    Document doc = new Document();
    /** 创建根元素 **/
    Element rootElement = new Element("data");
    Date date = new Date();
    DateFormat dateFormat = DateFormat.getDateTimeInstance();
    String nowDate = dateFormat.format(date);
    /** 创建根元素属性 **/
    Attribute versionAttribute = new Attribute("version", "1.0");
    Attribute dateAttribute = new Attribute("createdate", nowDate);
    Attribute struLevelAttribute = new Attribute("struLevelAttribute", (3) + "");
    rootElement.setAttribute(versionAttribute);
    rootElement.setAttribute(dateAttribute);
    rootElement.setAttribute(struLevelAttribute);
    doc.setRootElement(rootElement);
    for (Map<String, String> datamap : filelist) {
      /** 创建package元素(包节点) **/
      Element pkgElement = new Element("Package");
      /** 创建description元素(包的描述信息) **/
      Element descriptionElement = new Element("Description");
      /** 遍历,将字段及值逐一写到描述信息节点下 **/
      for (String f : datamap.keySet()) {
        String str = cNColsForXml.get(f.toString());
        if (null == str) {
          continue;
        }
        String tmpValue = "";
        if (null == datamap.get(f)) {
          tmpValue = "";
        } else {
          tmpValue = datamap.get(f).replaceAll("\n", "").replaceAll("\r", "").toString();
        }

        descriptionElement.addContent(new Element(str).setText(tmpValue));
      }
      /** 将包描述信息加到package元素下 **/
      pkgElement.addContent(descriptionElement);
      /** 卷内数据导出 **/
      String fileId = datamap.get("ID");
      // HashMap<String,String> tempInnerMap = new HashMap<String,String>();
      List<Map<String, String>> tempInnerFilelist = new ArrayList<Map<String, String>>();
      for (Map<String, String> innerDataMap : innerFilelist) {
        if (innerDataMap.get("relation").equals(fileId)) {
          // tempInnerMap.putAll(innerDataMap);
          tempInnerFilelist.add(innerDataMap);
        }
      }
      if (tempInnerFilelist.size() > 0) {
        Element innerContentElement = new Element("Content");
        for (Map<String, String> tempInnerMap : tempInnerFilelist) {
          Element innerPkgElement = new Element("Package");
          Element innerDescElement = new Element("Description");
          for (String f : tempInnerMap.keySet()) {
            String str = innerCNColsForXml.get(f.toString());
            if (null == str) {
              continue;
            }
            String tmpValue = "";
            if (null == tempInnerMap.get(f)) {
              tmpValue = "";
            } else {
              tmpValue = tempInnerMap.get(f).replaceAll("\n", "").replaceAll("\r", "").toString();
            }
            innerDescElement.addContent(new Element(str).setText(tmpValue));
          }
          innerPkgElement.addContent(innerDescElement);
          /** 导出电子文件 **/
          String innerFileId = tempInnerMap.get("ID");
          // HashMap<String, String> tempDocMap = new HashMap<String, String>();
          List<Map<String, String>> tempDocMapList = new ArrayList<Map<String, String>>();
          for (Map<String, String> documentMap : documentList) {
            if (documentMap.get("tempID").equals(innerFileId)) {
              // tempDocMap.putAll(documentMap);
              tempDocMapList.add(documentMap);
            }
          }
          if (tempDocMapList.size() > 0) {
            Element docContentElement = new Element("Content");
            for (Map<String, String> tempDocMap : tempDocMapList) {
              Element docPkgElement = new Element("Package");
              Element docDescElement = new Element("Description");
              for (String k : tempDocMap.keySet()) {
                // if(k.equals("ESFILEID")){
                // continue;
                // }
                docDescElement.addContent(new Element(k).setText(tempDocMap.get(k)));
              }
              docPkgElement.addContent(docDescElement);
              docContentElement.addContent(docPkgElement);
            }
            innerPkgElement.addContent(docContentElement);
          }
          innerContentElement.addContent(innerPkgElement);
        }
        pkgElement.addContent(innerContentElement);
      }
      /** 将包元素加入到根元素下 **/
      rootElement.addContent(pkgElement);
    }

    try {
      this.setDocument(doc);
      DOMOutputter outter = new DOMOutputter();
      this.setW3CDocument(outter.output(doc));
      writeFlag = true;
      // 将文件存到服务器指定位置
      Date currentTime = new Date();
      SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
      String dateString = formatter.format(currentTime);

      try {

        XMLOutputter out = new XMLOutputter();
        File file = new File(address + "" + dateString + ".xml");
        file = createFile(file.getAbsolutePath());
        try {
          out.output(this.getDocument(), new FileOutputStream(file));
        } catch (FileNotFoundException e) {
          e.printStackTrace();
        } catch (IOException e) {
          e.printStackTrace();
        }

      } catch (Exception e) {
        e.printStackTrace();
        writeFlag = false;
      }
      map.put("path", dateString + ".xml");
    } catch (JDOMException e) {
      writeFlag = false;
    }
    return map;
  }

  /**
   * 设置 document的方法
   * 
   * @param dom dom对象
   */
  public void setW3CDocument(org.w3c.dom.Document dom) {
    this.dom = dom;
  }

  /**
   * 获取document方法
   * 
   * @return document
   */
  public org.w3c.dom.Document getW3CDocument() {
    return this.dom;
  }

  /**
   * 设置dom文件
   * 
   * @param document dom文件
   */
  private void setDocument(Document document) {
    this.document = document;
  }

  /**
   * 获取dom文件
   * 
   * @return dom文件
   */
  private Document getDocument() {
    return this.document;
  }

  /**
   * @param args
   */
  public static void main(String[] args) {
    // TODO Auto-generated method stub

  }

  /**
   * 将filepath转换为xml
   * 
   * @param filePath 文件路径
   */
  public void convertToXML(String filePath) {
    XMLOutputter out = new XMLOutputter();
    File file = new File(filePath);
    try {
      out.output(this.getDocument(), new FileOutputStream(file));
    } catch (FileNotFoundException e) {
      // TODO 自动生成 catch 块
      e.printStackTrace();
    } catch (IOException e) {
      // TODO 自动生成 catch 块
      e.printStackTrace();
    }

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

  /**
   * 导出xml (文控系统)
   * 
   * @param dataList
   * @param fileDataList
   * @param fieldMap
   * @return
   */
  public String exportXml(List<Map<String, Object>> dataList,
      List<Map<String, Object>> fileDataList, Map<String, String> fieldMap) {
    String address = ""; // 存放文件在服务器的地址
    // 文件存放的路径
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    String path = "/" + classPath.toString();
    int pos = path.indexOf("WEB-INF");
    String web_infPath = path.substring(0, pos);
    String UPLOADED_FILE_PATH = web_infPath + "data/";
    address = UPLOADED_FILE_PATH;
    Document doc = new Document();
    /** 创建根元素 **/
    Element rootElement = new Element("data");
    Date date = new Date();
    DateFormat dateFormat = DateFormat.getDateTimeInstance();
    String nowDate = dateFormat.format(date);
    /** 创建根元素属性 **/
    Attribute versionAttribute = new Attribute("version", "1.0");
    Attribute dateAttribute = new Attribute("createdate", nowDate);
    Attribute struLevelAttribute = new Attribute("struLevelAttribute", (1) + "");
    rootElement.setAttribute(versionAttribute);
    rootElement.setAttribute(dateAttribute);
    rootElement.setAttribute(struLevelAttribute);
    doc.setRootElement(rootElement);
    Map<String, String> fileFieldMap = new HashMap<String, String>();
    fileFieldMap.put("esFilePath", "原文路径");
    fileFieldMap.put("esmd5", "文件校验");
    fileFieldMap.put("originalId", "文件标识");
    fileFieldMap.put("essize", "文件大小");
    fileFieldMap.put("estype", "文件类型");
    fileFieldMap.put("createTime", "创建时间");
    /** 遍历SimplePkgs加入到根元素下 **/
    for (Map<String, Object> datamap : dataList) {
      /** 创建package元素(包节点) **/
      Element pkgElement = new Element("Package");
      /** 创建description元素(包的描述信息) **/
      Element descriptionElement = new Element("Description");
      /** 遍历,将字段及值逐一写到描述信息节点下 **/
      for (String f : datamap.keySet()) {
        String str = fieldMap.get(f);
        if (null == str) {
          continue;
        }
        /** 是否包含原文路径 **/
        if (str.contains("Is_@Resouce#~Data*0Type")) {
          str = str.replace("Is_@Resouce#~Data*0Type", "E-FILE-");
        }
        String tmpValue = "";
        if (null == datamap.get(f)) {
          tmpValue = "";
        } else {
          tmpValue = datamap.get(f).toString().replaceAll("\n", "").replaceAll("\r", "").toString();
        }

        descriptionElement.addContent(new Element(str).setText(tmpValue));
       
      }
      
      List<Map<String, Object>> tempDocMapList = new ArrayList<Map<String, Object>>();
      if (fileDataList != null) {
      //循环到这里主数据信息加入完毕 开始加入电子文件数据
      /** 导出电子文件 **/
      String documentId = datamap.get("tempId") + "";
        for (Map<String, Object> fileMap : fileDataList) {
          if (fileMap.get("documentId").toString().equals(documentId)) {
            tempDocMapList.add(fileMap);
          }
        }
      }
      if (tempDocMapList.size() > 0) {
        Element docContentElement = new Element("Content");
        for (Map<String, Object> tempDocMap : tempDocMapList) {
          Element docPkgElement = new Element("Package");
          Element docDescElement = new Element("Description");
          for (String k : fileFieldMap.keySet()) {
            // 如果是文件路径 需要拼接一下
            if ("esFilePath".equals(k)) {
              docDescElement.addContent(new Element(fileFieldMap.get(k)).setText(tempDocMap
                  .get("esViewTitle") + "/" + tempDocMap.get("estitle")));
            } else if ("createTime".equals(k)) {
              // 如果是时间需要转换一下
              Long time = Long.parseLong(tempDocMap.get(k) + "");
              docDescElement.addContent(new Element(fileFieldMap.get(k)).setText(DateUtil
                  .formatDateTime(time)));
            } else {
              docDescElement.addContent(new Element(fileFieldMap.get(k)).setText(tempDocMap
                  .get(k) + ""));
            }

          }
          docPkgElement.addContent(docDescElement);
          docContentElement.addContent(docPkgElement);
        }
        descriptionElement.addContent(docContentElement);
      }
      /** 将包描述信息加到package元素下 **/
      pkgElement.addContent(descriptionElement);
      /** 将包元素加入到根元素下 **/
      rootElement.addContent(pkgElement);
    }

    try {
      this.setDocument(doc);
      DOMOutputter outter = new DOMOutputter();
      this.setW3CDocument(outter.output(doc));

      // 将文件存到服务器指定位置
      Date currentTime = new Date();
      SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
      String dateString = formatter.format(currentTime);

      try {

        XMLOutputter out = new XMLOutputter();
        File file = new File(address + "" + dateString + ".xml");
        file = createFile(file.getAbsolutePath());
        try {
          out.output(this.getDocument(), new FileOutputStream(file));
        } catch (Exception e) {
          e.printStackTrace();
          return null;
        }

      } catch (Exception e) {
        e.printStackTrace();
        return null;
      }
      return dateString + ".xml";
    } catch (JDOMException e) {
      e.printStackTrace();
      return null;
    }
  }

}
