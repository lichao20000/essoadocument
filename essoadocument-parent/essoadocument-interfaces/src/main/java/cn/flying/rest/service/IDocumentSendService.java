package cn.flying.rest.service;

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
 * 文件发放模块
 * 
 * @author gengqianfeng
 * 
 */
public interface IDocumentSendService {

  /**
   * 删除发放单
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delSend/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delSend(Long[] ids, @PathParam("userId") String userId,
      @PathParam("ip") String ip);

  /**
   * 发放
   * 
   * @param send
   * @return
   */
  @POST
  @Path("extendSend")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> extendSend(Map<String, Object> send);

  /**
   * 获取选择文件列表
   * 
   * @param page
   *          第几页
   * @param pre
   *          每页显示多少条
   * @param stageId
   *          收集范围id
   * @return
   */
  @GET
  @Path("findDocumentList/{page}/{pre}/{stageCode}/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentList(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("stageCode") String stageCode,
      @PathParam("stageId") String stageId);

  /**
   * 获取选中文件列表
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("findDocumentListByIds/{page}/{pre}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentListByIds(
      @PathParam("page") long page, @PathParam("pre") long pre, String ids);

  /**
   * 获取发放文件列表
   * 
   * @param page
   *          第几页
   * @param pre
   *          每页显示多少条
   * @param pId
   *          父级节点id
   * @param where
   *          筛选条件
   * @return
   */
  @POST
  @Path("list/{page}/{pre}/{pId}/{admin}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentSendList(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("pId") long pId, @PathParam("admin") String admin,
      String[] where);

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
   * 获取流程矩阵列表
   * 
   * @param send_id
   * @param page
   * @param pre
   * @return
   */
  @GET
  @Path("findSendMatrixList/{send_id}/{nodeType}/{page}/{pre}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findSendMatrixList(
      @PathParam("send_id") long send_id,
      @PathParam("nodeType") String nodeType, @PathParam("page") long page,
      @PathParam("pre") long pre);

  /**
   * 获取发放文件列表总条数
   * 
   * @param pId
   * @param where
   * @return
   */
  @POST
  @Path("count/{pId}/{admin}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(@PathParam("pId") long pId,
      @PathParam("admin") String admin, String[] where);

  /**
   * 通过id获取选中文件列表总条数
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("getCountById")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCountById(String ids);

  /**
   * 通过id获取发放记录数据
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getDocumentSendById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getDocumentSendById(@PathParam("id") long id);

  /**
   * 获取选择文件列表总条数
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getFileCount/{stageCode}/{stageId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getFileCount(@PathParam("stageCode") String stageCode,
      @PathParam("stageId") String stageId);

  /**
   * 获取对应类型下流程列表
   * 
   * @param pId
   * @return
   */
  @GET
  @Path("getFlowList/{pId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getFlowList(@PathParam("pId") long pId);

  /**
   * 获取流程矩阵总条数
   * 
   * @param send_id
   * @return
   */
  @GET
  @Path("getMatrixCount/{send_id}/{nodeType}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getMatrixCount(@PathParam("send_id") long send_id,
      @PathParam("nodeType") String nodeType);

  /**
   * 待发
   * 
   * @param send
   * @return
   */
  @POST
  @Path("momentumSend")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> momentumSend(Map<String, Object> send);

  /**
   * 待发状态下直接发放
   * 
   * @param id
   * @return
   */
  @POST
  @Path("pubSend")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> pubSend(Map<String, Object> send);

  /**
   * 获取发放单编号
   * 
   * @param flowId
   * @return
   */
  @GET
  @Path("getSendNo/{pId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getSendNo(@PathParam("pId") long pId);

  /**
   * 更新发放单流程名称
   * 
   * @param sendId
   * @param flowName
   * @return
   */
  @POST
  @Path("updateFlowNameBySendid/{sendId}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateFlowNameBySendid(@PathParam("sendId") long sendId,
      String flowName);
  
  @POST
  @Path("callbackSend")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String callbackSend(Map<String, Object> param);

}
