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
 * 我的待办模块
 * 
 * @author gengqianfeng
 * 
 */
public abstract interface ICollaborativeService {

  /**
   * 添加附件数据
   * 
   * @param type
   * @param datas
   * @return
   */
  @POST
  @Path("addAttachFileData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String addAttachFileData(Map<String, Object> params);

  /**
   * 删除附件数据
   * 
   * @param params
   * @return
   */
  @POST
  @Path("deleteAttachFileData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteAttachFileData(Map<String, Object> params);

  /**
   * 删除待办数据
   * 
   * @param userFormId
   * @param owner
   * @param stepId
   * @return
   */
  @GET
  @Path("deleteDealedWFData")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean deleteDealedWFData(@PathParam("userFormId") long userFormId,
      @PathParam("owner") String owner, @PathParam("stepId") String stepId);

  /**
   * 删除待发、已发数据，已发只能删除自己发起的且已完成的流程数据
   * 
   * @param params
   * @return
   */
  @POST
  @Path("deleteUserformData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> deleteUserformData(Map<String, Object> params);

  /**
   * 发起或审批页面字符串
   * 
   * @param params
   * @return
   */
  @POST
  @Path("getActions")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getActions(Map<String, Object> params);

  /**
   * 获取表单附件
   * 
   * @param flowId
   * @param stepId
   * @param type
   * @return
   */
  @GET
  @Path("getAppendixList/{flowId}/{stepId}/{type}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getAppendixList(
      @PathParam("flowId") long flowId, @PathParam("stepId") long stepId,
      @PathParam("type") String type);

  /**
   * 根据流程状态获取待办列表总条数
   * 
   * @param params
   * @return
   */
  @POST
  @Path("getCollaborativeDataCountByWFstatus")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCollaborativeDataCountByWFstatus(Map<String, Object> params);

  /**
   * 获取待办列表
   * 
   * @param params
   * @return
   */
  @POST
  @Path("getCollaborativeDataList")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getCollaborativeDataList(Map<String, Object> params);

  /**
   * 渲染表单
   * 
   * @param params
   * @return
   */
  @POST
  @Path("getCollaborativeForm")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getCollaborativeForm(
      Map<String, Object> params);

  /**
   * 获取步骤处理用户
   * 
   * @param params
   * @return
   */
  @POST
  @Path("getStepOwner")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStepOwner(Map<String, Object> params);

  /**
   * 通过流程id获取用户表单实体
   * 
   * @param wfId
   * @return
   */
  @GET
  @Path("getUserformByWfId/{wfId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getUserformByWfId(@PathParam("wfId") long wfId);

  /**
   * 通过id获取用户表单实体
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getUserformById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getUserformById(@PathParam("id") long id);

  /**
   * 查看流程图
   * 
   * @param params
   * @return
   */
  @POST
  @Path("showWfGraph")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> showWfGraph(Map<String, Object> params);

  /**
   * 工作流打印
   * 
   * @param params
   * @return
   */
  @POST
  @Path("workFlowPrint")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> workFlowPrint(Map<String, Object> params);

  /**
   * 通过数据id获取收集范围对象
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getStageIdByDocId/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStageIdByDocId(@PathParam("id") long id);

  /**
   * 判断当前流程步骤是否已经审批过
   * 
   * @param map
   * @return
   */
  @POST
  @Path("wfIsApprovaled")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> wfIsApprovaled(Map<String, String> map);

  /**
   * 判断路程是否审批过
   * 
   * @param map
   * @return
   */
  @POST
  @Path("isApprovalOver")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> isApprovalOver(Map<String, Object> map);

  /**
   * 通过wfid获取待办数据
   * 
   * @param wfId
   * @param state
   * @param userId
   * @return
   */
  @GET
  @Path("getCollaborativeMsgByWfId/{wfId}/{state}/{userId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> getCollaborativeMsgByWfId(
      @PathParam("wfId") long wfId, @PathParam("state") String state,
      @PathParam("userId") String userId);

  /**
   * 获取审批意见列表
   * 
   * @param wfId
   * @return
   */
  @GET
  @Path("getOpinionList/{wfId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getOpinionList(@PathParam("wfId") long wfId);

  /**
   * 获取当前步骤对象
   * 
   * @param wfId
   * @return
   */
  @GET
  @Path("getCurrentByWfId/{wfId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getCurrentByWfId(@PathParam("wfId") long wfId);

  /**
   * 待办处理时间越期提醒
   */
  @GET
  @Path("flowOutOfAuditTime")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String flowOutOfAuditTime();

  /**
   * 获取电子文件字符串
   * 
   * @param pid
   * @return
   */
  @GET
  @Path("getDocFiles/{docId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getDocFiles(@PathParam("docId") long pid);
}
