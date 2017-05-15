package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import cn.flying.rest.service.utils.MediaTypeEx;

/**
 * 文件归档模块
 * 
 * @author gengqianfeng
 * 
 */
public abstract interface IFilingService {

  /**
   * 检验收集范围节点是否定义归档规则
   * 
   * @param stageCode
   * @return
   */
  @GET
  @Path("checkFilingRegulation/{stageCode}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String checkFilingRegulation(@PathParam("stageCode") String stageCode);

  /**
   * 依据筛选条件归档文件
   * 
   * @return
   */
  @POST
  @Path("conditionFiling")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String conditionFiling(HashMap<String, Object> fill);

  /**
   * 通过id获取选中文件列表
   * 
   * @param page
   * @param pre
   * @param ids
   * @return
   */
  @POST
  @Path("findDocumentById/{page}/{pre}/{stageId}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentById(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("stageId") String stageId, String ids);

  /**
   * 获取待归档文件列表
   * 
   * @param page
   *          第几页
   * @param pre
   *          每页显示多少条
   * @param condition
   *          筛选条件
   * @return
   */
  @POST
  @Path("list")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentList(Map<String, Object> document);

  /**
   * 获取元数据列表
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("findDocumentMetaByStageId/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentMetaByStageId(
      @PathParam("stageId") long stageId);

  /**
   * 获取动态数据列
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("findMoveCols/{stageId}/{key}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findMoveCols(@PathParam("key") int key,
      @PathParam("stageId") String stageId);

  /**
   * 获取待归档文件记录总数
   * 
   * @param condition
   *          筛选条件
   * @return
   */
  @POST
  @Path("count")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(Map<String, Object> document);

  /**
   * 通过id获取选中文件列表总条数
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("getCountById/{stageId}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCountById(@PathParam("stageId") String stageId, String ids);

  /**
   * 获取收集范围父节点id
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getParentStageIds/{stageId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getParentStageIds(@PathParam("stageId") long stageId);

  /**
   * 依据选择的id归档文件
   * 
   * @param code
   * @param ids
   * @return
   */
  @POST
  @Path("idsFiling")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String idsFiling(HashMap<String, Object> fill);
  
  @GET
  @Path("getChildrenStageIds/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getChildrenStageIds(@PathParam("stageId") long stageId);

  @GET
  @Path("tableIfExists/{stageId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean tableIfExists(@PathParam("stageId") String stageId);

  @GET
  @Path("getColsCode/{stageId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getColsCode(@PathParam("stageId") String stageId);

  @GET
  @Path("getStageById/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStageById(@PathParam("stageId") long stageId);
}
