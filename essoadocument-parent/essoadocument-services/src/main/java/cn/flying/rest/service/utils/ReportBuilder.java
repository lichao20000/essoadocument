package cn.flying.rest.service.utils;

import java.io.File;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.jasperreports.engine.JRExporterParameter;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRXmlDataSource;
import net.sf.jasperreports.engine.export.JExcelApiExporter;
import net.sf.jasperreports.engine.export.JExcelApiExporterParameter;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.engine.export.JRPdfExporterParameter;
import net.sf.jasperreports.engine.export.JRRtfExporter;

import org.jdom.Attribute;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.jdom.output.DOMOutputter;
import org.jdom.xpath.XPath;

/**
 * 报表构建类
 * 
 * @author zhanglei 20130315
 *
 */
public class ReportBuilder {
  public static final String DTD_not_load =
      "http://apache.org/xml/features/nonvalidating/load-external-dtd";
  public static final String DTD_not_validation = "http://xml.org/sax/features/validation";

  /**
   * 计算插空行的行数
   * 
   * @param count
   * @return
   */
  private static int getAddNumber(int count, int rows) {
    if (rows == 0)
      return 0;

    if (count % rows == 0) {
      return 0;
    } else {
      if (count > rows) {
        return rows - count % rows;
      } else {

        return rows - count;
      }
    }
  }

  public static ReportBuilder getInstance() {
    return new ReportBuilder();
  }

  private String twobarCodeFolder;

  private ReportBuilder() {}

  /**
   * @see 生成报表数据对应的document
   * @author lijianguang 2012-10-29
   * @param reportData
   * @return
   */
  private org.w3c.dom.Document generateReportDocument(List<HashMap<String, Object>> reportData) {
    // 创建document对象
    Document doc = new Document();
    // 创建根元素
    Element rootElement = new Element("data");
    Date date = new Date();
    DateFormat dateFormat = DateFormat.getDateTimeInstance();
    String nowDate = dateFormat.format(date);
    // 创建属性
    Attribute versionAttribute = new Attribute("version", "0.1");
    Attribute dateAttribute = new Attribute("createdate", nowDate);
    // 添加根元素的属性
    rootElement.setAttribute(versionAttribute);
    rootElement.setAttribute(dateAttribute);

    for (HashMap<String, Object> hm : reportData) {
      // 创建package元素
      Element pkgElement = new Element("Package");
      // 创建description元素
      Element descriptionElement = new Element("Description");
      for (String f : hm.keySet()) {
        // 添加description的子元素
        Element element = new Element(f.toString());
        Object text = hm.get(f);
        if (text != null) {
          element.setText(hm.get(f).toString());
        } else {
          element.setText("");
        }
        descriptionElement.addContent(element);

      }
      // 把description元素添加到package元素下
      pkgElement.addContent(descriptionElement);

      // 把package元素添加到根元素下
      rootElement.addContent(pkgElement);
    }
    doc.setRootElement(rootElement);
    try {
      DOMOutputter outter = new DOMOutputter();
      return outter.output(doc);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * 分组、插空行 修改zhanglei 20130314
   * 
   * @param datas
   * @param rows
   * @param groupCols 分组字段
   * @param pageSeq 用于计算文书卷内目录页数
   * @param requestColumns 插空行时要保留的字段值
   * @param twobarCode 不为null则添加二维码（只对分组） edit with gaoyide20140917 season bug:1130 打印库房报表内顺序是乱的
   *        把hashmap换成了linkedhashmap
   * @return
   * 
   */
  private org.w3c.dom.Document getDoc(List<HashMap<String, Object>> reportDatas, int rows,
      String[] groupCols, String pageSeq, String[] requestColumns, String twobarCode) {

    List<HashMap<String, Object>> newReportData = new ArrayList<HashMap<String, Object>>();
    newReportData.addAll(reportDatas);
    int addCount = getAddNumber(newReportData.size(), rows);
    if (null != requestColumns && addCount > 0) {
      HashMap<String, Object> tempMap = new HashMap<String, Object>();
      if (newReportData.size() > 0) {
        HashMap<String, Object> lastDataMap = newReportData.get(0);
        // 获取要保留的字段的值
        for (String s : requestColumns) {
          tempMap.put(s, lastDataMap.get(s));
        }
      }
      for (int i = 0; i < addCount; i++) {
        newReportData.add(tempMap);
      }
    } else {
      for (int i = 0; i < addCount; i++) {
        newReportData.add(new HashMap<String, Object>());
      }
    }
    return this.generateReportDocument(newReportData);

  }

  /**
   * 获取查询报表数据Document的路径（从报表模板文件xml节点获取）
   * 
   * @param xmlFile
   * @param childXpath
   * @return
   */
  private String getQueryString(File xmlFile, String childXpath) {
    try {
      SAXBuilder saxBuilder = new SAXBuilder();
      saxBuilder.setFeature(DTD_not_load, false);
      saxBuilder.setFeature(DTD_not_validation, false);
      org.jdom.Document doc = saxBuilder.build(xmlFile);
      Element root = doc.getRootElement();
      Element queryString = (Element) XPath.selectSingleNode(root, childXpath);
      if (null == queryString) {
        return "/data/descendant::Package/Description";
      }
      return queryString.getValue();
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  /**
   * 生成报表文件 修改zhanglei 20130314
   * 
   * @param reportData 数据
   * @param file 报表模板文件
   * @param outStyle 报表类型
   * @return 报表文件绝对路径
   */
  public String runReport(List<HashMap<String, Object>> reportData, File file, String outStyle) {
    String jasperPath = null;
    try {
      String jrxmlPath = file.getAbsolutePath();
      jrxmlPath = jrxmlPath.replaceAll("\\\\", "/");

      // System.out.println(jrxmlPath);
      SAXBuilder saxBuilder = new SAXBuilder();
      saxBuilder.setFeature(DTD_not_load, false);
      saxBuilder.setFeature(DTD_not_validation, false);
      org.jdom.Document docs = saxBuilder.build(file);
      Element root = docs.getRootElement();
      // 如果报表设计文件里面没有rows field(则认为不需要补空行---适用于一页打印一个的报表)
      int rows = 0;// 每页行数
      String[] groupArr = null;// 分组的字段
      String pageSeq = null;// 分组的字段
      String[] requestColumns = null;// 获取报表中定义的插空行时要保留的字段
      String twobarCode = null;// 二维码
      // <jasperReport> -> <field name="" class=""> -> <fieldDescription>
      @SuppressWarnings("unchecked")
      List<Element> fieldList = root.getChildren("field");
      for (int i = 0; i < fieldList.size(); i++) {
        Element element = (Element) fieldList.get(i);
        String eleName = element.getAttributeValue("name");
        String fieldDescription = element.getChildText("fieldDescription");
        if (fieldDescription == null || "".equals(fieldDescription))
          continue;
        if ("rows".equals(eleName)) {
          rows = Integer.parseInt(fieldDescription);
        } else if ("group".equals(eleName)) {
          groupArr = fieldDescription.split(";");
        } else if ("pageSeq".equals(eleName)) {
          String[] value = fieldDescription.split(";");
          if (value.length > 0)
            pageSeq = value[0];
        } else if ("requestColumns".equals(eleName)) {
          requestColumns = fieldDescription.split(";");
        } else if ("twobarCode".equals(eleName)) {
          twobarCode = fieldDescription;
        }
      }

      org.w3c.dom.Document currentDoc =
          this.getDoc(reportData, rows, groupArr, pageSeq, requestColumns, twobarCode);
      jasperPath = jrxmlPath.substring(0, jrxmlPath.lastIndexOf("jrxml")) + "jasper";
      JasperCompileManager.compileReportToFile(jrxmlPath, jasperPath);
      String queryString = this.getQueryString(file, "child::queryString");
      System.setProperty("Djava.awt.headless", "true");
      Map<String, Object> mapParam = new HashMap<String, Object>();// Parameter类型
      JasperPrint jap =
          JasperFillManager.fillReport(jasperPath, mapParam, new JRXmlDataSource(currentDoc,
              queryString));
      String outputFile = null;
      if ("pdf".equals(outStyle)) {
        outputFile = jrxmlPath.substring(0, jrxmlPath.lastIndexOf("jrxml")) + "pdf";
        JRPdfExporter pdfExporter = new JRPdfExporter();
        pdfExporter.setParameter(JRPdfExporterParameter.JASPER_PRINT, jap);
        pdfExporter.setParameter(JRPdfExporterParameter.OUTPUT_FILE_NAME, outputFile);
        pdfExporter.exportReport();
      } else if ("xls".equals(outStyle)) {
        outputFile = jrxmlPath.substring(0, jrxmlPath.lastIndexOf("jrxml")) + "xls";
        JExcelApiExporter exporter = new JExcelApiExporter();
        exporter.setParameter(JExcelApiExporterParameter.JASPER_PRINT, jap);
        exporter.setParameter(JExcelApiExporterParameter.OUTPUT_FILE_NAME, outputFile);
        exporter.setParameter(JExcelApiExporterParameter.IS_REMOVE_EMPTY_SPACE_BETWEEN_ROWS,
            Boolean.TRUE);
        exporter.setParameter(JExcelApiExporterParameter.IS_WHITE_PAGE_BACKGROUND, Boolean.FALSE);
        exporter.setParameter(JExcelApiExporterParameter.IS_ONE_PAGE_PER_SHEET, Boolean.FALSE);
        exporter.setParameter(JExcelApiExporterParameter.IS_DETECT_CELL_TYPE, Boolean.TRUE);
        exporter.setParameter(JExcelApiExporterParameter.IS_FONT_SIZE_FIX_ENABLED, Boolean.FALSE);
        exporter.exportReport();
      } else if ("rtf".equals(outStyle)) {
        outputFile = jrxmlPath.substring(0, jrxmlPath.lastIndexOf("jrxml")) + "rtf";
        JRRtfExporter exporter = new JRRtfExporter();
        exporter.setParameter(JRExporterParameter.JASPER_PRINT, jap);
        exporter.setParameter(JRExporterParameter.OUTPUT_FILE_NAME, outputFile);
        exporter.exportReport();
      }
      return outputFile;
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      // 删除二维码、jrxml、jasper文件
      if (twobarCodeFolder != null) {
        FileUtil.deleteAllFile(twobarCodeFolder);
      }
      // TODO
      if (file != null)
        file.delete();
      if (jasperPath != null)
        new File(jasperPath).delete();
    }
    return null;
  }

}
