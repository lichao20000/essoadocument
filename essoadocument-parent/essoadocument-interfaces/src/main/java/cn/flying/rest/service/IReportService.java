package cn.flying.rest.service;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;

import cn.flying.rest.service.utils.MediaTypeEx;

/**
 * 报表维护
 * 
 * @author xuekun
 * 
 */
public interface IReportService extends ICommonService {
  /**
   * 
   * @param request
   * @return
   */
  @POST
  @Path("addReport")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String addReport(@Context HttpServletRequest request);

  /**
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("checkTitleUnique")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean checkTitleUnique(String title);
  
  @POST
  @Path("deleteBatch/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteBatch(Map<String,Object> param,@PathParam("userId") String userId,@PathParam("ip") String ip);
  /**
   * 导出报表数据
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("exportReport")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> exportReport(Map<String, String> dataMap);

  @GET
  @Path("getServiceIP")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getServiceIP();

  /**
   * 获取打印地址
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("getWorkflowReportUrl")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getWorkflowReportUrl(Map<String, String> dataMap);

  @POST
  @Path("runReportManager")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String runReportManager(Map<String, Object> params);

  /**
   * 保存编辑的报表模型
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("saveReportTemForEdit")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean saveReportTemForEdit(Map<String, String> dataMap);

  /**
   * 
   * @param map
   * @return
   */
  @POST
  @Path("updateInfomation")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean updateInfomation(HashMap<String, String> map);

}
