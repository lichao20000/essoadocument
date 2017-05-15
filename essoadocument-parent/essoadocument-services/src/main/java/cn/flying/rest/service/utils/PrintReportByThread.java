package cn.flying.rest.service.utils;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.service.IReportService;

public class PrintReportByThread implements Runnable {

  private Map<String, Object> dataMap;

  private MessageWS messageWS;

  public PrintReportByThread(Map<String, Object> dataMap, MessageWS messageWS) {
    this.dataMap = dataMap;
    this.messageWS = messageWS;
  }

  @Override
  public void run() {
    String outFile = "#";
    File file = (File) dataMap.get("file");
    String reportstyle = dataMap.get("reportstyle").toString();
    int id = Integer.parseInt(dataMap.get("id").toString());
    String ipString = dataMap.get("ipString").toString();
    IReportService reportService = (IReportService) dataMap.get("reportService");
    try {
      @SuppressWarnings("unchecked")
      List<HashMap<String, Object>> list = (List<HashMap<String, Object>>) dataMap.get("list");
      String localFile = ReportBuilder.getInstance().runReport(list, file, reportstyle);
      if (null != localFile) {
        String filename = localFile.substring(localFile.lastIndexOf("/") + 1, localFile.length());
        if (null != filename && !filename.equals("")) {
          String temp = ipString.substring(ipString.indexOf("rest"), ipString.length());
          outFile = ipString.replace(temp, "report") + "/" + filename;
        }
        HashMap<String, String> map = new HashMap<String, String>();
        map.put("id", String.valueOf(id));
        map.put("printStatus", "true");
        map.put("address", outFile);
        reportService.updateInfomation(map);
      } else {
        HashMap<String, String> map = new HashMap<String, String>();
        map.put("id", String.valueOf(id));
        map.put("printStatus", "false");
        map.put("address", outFile);
        reportService.updateInfomation(map);
      }
      if (messageWS != null) {
        Map<String, String> messMap = new HashMap<String, String>();
        SimpleDateFormat dateFormat1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date();
        messMap.put("sender", (String) dataMap.get("userId"));
        messMap.put("recevier", (String) dataMap.get("userId"));
        messMap.put("sendTime", dateFormat1.format(date));
        messMap.put("status", "No");
        messMap.put("workFlowId", -14l + "");
        messMap.put("workFlowStatus", "Run");
        messMap.put("stepId", String.valueOf(id) + "");
        messMap.put("content", (String) dataMap.get("fileInfo"));
        messMap.put("style", "color:red");
        messMap.put("handler",
            "$.messageFun.downFile('" + outFile + "','" + file.getName()
                + "','downLoadFile','" + String.valueOf(id) + "')");
        messMap.put("handlerUrl", "esdocument/" + dataMap.get("instanceId")
            + "/x/ESMessage/handlerMsgPage");
        messageWS.addMessage(messMap);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
