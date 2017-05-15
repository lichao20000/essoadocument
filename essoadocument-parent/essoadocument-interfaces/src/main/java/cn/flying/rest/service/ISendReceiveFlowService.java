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
 * 文件收发流程接口
 * 
 * @author gengqianfeng
 * 
 */
public abstract interface ISendReceiveFlowService {

  /**
   * 添加收发流程
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("addFlow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public HashMap<String, Object> addSendReceiveFlow(HashMap<String, Object> flow);

  /**
   * 添加文件收发流程类型
   * 
   * @param type
   * @return
   */
  @POST
  @Path("addTree")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public HashMap<String, Object> addTree(HashMap<String, Object> type);

  /**
   * 删除收发流程
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delFlow/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delSendReceiveFlow(Long[] ids,
      @PathParam("userId") String userId, @PathParam("ip") String ip);

  /**
   * 删除文件收发流程类型
   * 
   * @param id
   * @return
   */
  @POST
  @Path("delTree/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delTree(Long[] ids, @PathParam("userId") String userId,
      @PathParam("ip") String ip);

  /**
   * 添加收发流程矩阵
   * 
   * @param id
   * @param matrix
   * @return
   */
  @POST
  @Path("editMatrix")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String editMatrix(Map<String, Object> matrix);

  /**
   * 分页加载文件收发流程列表
   * 
   * @param page
   *          第几页
   * @param pre
   *          每页显示多少条
   * @param pid
   *          父节点id
   * @param where
   *          筛选条件
   * @return
   */
  @POST
  @Path("list/{page}/{pre}/{pid}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findSendReceiveFlowList(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("pid") long pid, String[] where);

  /**
   * 获取文件收发流程总条数
   * 
   * @param pid
   * @param where
   * @return
   */
  @POST
  @Path("count/{pid}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(@PathParam("pid") long pid, String[] where);

  /**
   * 获取默认选择单位部门
   * 
   * @param code
   * @return
   */
  @POST
  @Path("getPartByCode")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getPartByCode(String code);

  /**
   * 通过id获取收发流程
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getFlowById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getSendReceiveFlowById(@PathParam("id") long id);

  /**
   * 通过编号获取收集范围实体
   * 
   * @param code
   * @return
   */
  @GET
  @Path("getStageByCode/{code}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStageByCode(@PathParam("code") String code);

  /**
   * 加载文件收发流程类型树
   * 
   * @return
   */
  @GET
  @Path("getTree")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getTree();
  
  /**
   * 根据树的父名称获得树
   * @return
   */
  @POST
  @Path("getTreeByParentName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getTreeByParentName(Map<String,Object> param);

  /**
   * 通过id获取收发文件流程类型
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getTreeById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getTreeById(@PathParam("id") long id);

  /**
   * 发布收发流程
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("pubOrCloseFlow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String pubOrCloseFlow(HashMap<String, Object> flow);

  /**
   * 修改收发流程
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("updateFlow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateSendReceiveFlow(HashMap<String, Object> flow);

  /**
   * 修改文件收发流程类型
   * 
   * @param type
   * @return
   */
  @POST
  @Path("updateTree")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateTree(HashMap<String, Object> type);
  
  /**
   * 唯一验证
   * 
   * @param contractNum
   * @return
   */
  @POST
  @Path("uniqueName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long uniqueName(HashMap<String, String> map);
}
