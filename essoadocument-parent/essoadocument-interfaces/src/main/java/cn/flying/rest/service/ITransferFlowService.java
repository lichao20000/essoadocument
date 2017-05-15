package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;

import com.opensymphony.workflow.Workflow;

import cn.flying.rest.service.entiry.EssReport;
import cn.flying.rest.service.entiry.FormComboEntity;
import cn.flying.rest.service.entiry.FormComboValuesEntity;
import cn.flying.rest.service.entiry.Pair;
import cn.flying.rest.service.utils.MediaTypeEx;

/**
 * 工作流管理模块
 * 
 * @author gengqianfeng
 * 
 */
public interface ITransferFlowService {

  /**
   * 获取动作页面数据
   * 
   * @param map
   * @return
   */
  @POST
  @Path("actionCheckMethodNew")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> actionCheckMethodNew(Map<String, Object> map);

  @POST
  @Path("addCombo")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public FormComboEntity addCombo(FormComboEntity combo);

  @POST
  @Path("addComboValue")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public FormComboValuesEntity addComboValue(FormComboValuesEntity comboV);

  /**
   * 添加函数
   * 
   * @param function
   * @return
   */
  @POST
  @Path("addFun")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> addFun(Map<String, Object> function);

  /**
   * 添加类型
   * 
   * @param type
   * @return
   */
  @POST
  @Path("addType")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> addType(Map<String, Object> type);

  /**
   * 修改表单动态表
   * 
   * @param flowId
   * @param stageId
   * @return
   */
  // @GET
  // @Path("alterEspFlowForm/{stageId}")
  // @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  // public boolean alterEspFlowForm(@PathParam("stageId") Long stageId);

  /**
   * 流程审批
   * 
   * @param params
   * @return
   */
  @POST
  @Path("auditingWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> auditingWorkflow(Map<String, Object> params);

  /**
   * 提交流程审批意见
   * 
   * @param map
   * @return
   */
  @POST
  @Path("commit_opinion")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> commit_opinion(Map<String, Object> map);

  /**
   * 复制流程
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("copyWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String copyWorkflow(Map<String, Object> flow);

  /**
   * 删除工作流步骤
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("deleteCellfromDB")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> deleteCellfromDB(Map<String, Object> flow);

  /**
   * 删除流程
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("deleteWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteWorkflow(Map<String, Object> flow);

  /**
   * 删除函数
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delFun/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delFun(long[] ids, @PathParam("userId") String page,
      @PathParam("ip") String ip);

  /**
   * 删除类型
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delType/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delType(long[] ids, @PathParam("userId") String page,
      @PathParam("ip") String ip);

  /**
   * 测试流程
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("detectionWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> detectionWorkflow(Map<String, Object> flow);

  /**
   * 执行流程
   * 
   * @param params
   * @return
   */
  @GET
  @Path("doAction/{params}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String doAction(@PathParam("params") String params);

  /**
   * 启动流程
   */
  @GET
  @Path("doStart")
  public void doStart() throws Exception;

  /**
   * 根据流程id删除工作流
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("dropWfModel")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> dropWfModel(Map<String, Object> flow);

  /**
   * 编辑类型
   * 
   * @param type
   * @return
   */
  @POST
  @Path("editType")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String editType(Map<String, Object> type);

  /**
   * 转发
   * 
   * @param map
   * @return
   */
  @POST
  @Path("excuteWfForward")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String excuteWfForward(HashMap<String, Object> map);

  /**
   * 导出工作流
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("exportWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> exportWorkflow(Map<String, Object> flow);

  /**
   * 获取角色列表
   * 
   * @param page
   * @param pre
   * @param searchKeyword
   * @return
   */
  @POST
  @Path("findRoleList/{page}/{pre}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> findRoleList(@PathParam("page") long page,
      @PathParam("pre") long pre, String searchKeyword);

  /**
   * 获取步骤用户选中列表
   * 
   * @param modelId
   * @param stepId
   * @return
   */
  @GET
  @Path("findStepUserList/{modelId}/{stepId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findStepUserList(
      @PathParam("modelId") long modelId, @PathParam("stepId") long stepId);

  /**
   * 获取工作流列表
   * 
   * @param page
   * @param pre
   * @param type_id
   * @param where
   * @return
   */
  @POST
  @Path("list/{page}/{pre}/{type_id}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findTransferList(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("type_id") long type_id, String[] where);

  /**
   * 通过流程id获取动作列表
   * 
   * @param flow_id
   * @return
   */
  @GET
  @Path("getActionByFlowId/{flow_id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getActionByFlowId(
      @PathParam("flow_id") long flow_id);

  @GET
  @Path("getComboEntityByComboValue/{comboValue}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public FormComboEntity getComboEntityByComboValue(
      @PathParam("comboValue") String comboValue);

  @GET
  @Path("getComboEntityByIdentifier/{identifier}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public FormComboEntity getComboEntityByIdentifier(
      @PathParam("identifier") String identifier);

  @POST
  @Path("getComboValueCount/{comboId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getComboValueCount(@PathParam("comboId") long comboId,
      String[] where);

  @POST
  @Path("getComboValues/{comboId}/{page}/{pre}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<FormComboValuesEntity> getComboValues(
      @PathParam("comboId") long comboId, @PathParam("page") long page,
      @PathParam("pre") long pre, String[] where);

  /**
   * 获取分支信息
   * 
   * @param condition
   * @return
   */
  @POST
  @Path("getConditionToShowNew")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getConditionToShowNew(Map<String, Object> condition);

  /**
   * 获取工作流列表总条数
   * 
   * @param type_id
   * @return
   */
  @POST
  @Path("count/{type_id}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(@PathParam("type_id") long type_id, String[] where);

  /**
   * 获取表单流转状态
   * 
   * @param formId
   * @return
   */
  @GET
  @Path("getFlowingWF/{formId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getFlowingWF(@PathParam("formId") long formId);

  /**
   * 通过唯一标示获取流程列表
   * 
   * @param identifier
   * @return
   */
  @GET
  @Path("getFlowListByIdentifier/{identifier}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public List<Map<String, Object>> getFlowListByIdentifier(
      @PathParam("identifier") String identifier);

  /**
   * 获取新流程名称
   * 
   * @param flowName
   * @return
   */
  @GET
  @Path("getFlowNewName/{flowName}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getFlowNewName(@PathParam("flowName") String flowName);

  /**
   * 通过流程id获取关联的文档id
   * 
   * @param wfId
   * @return
   */
  @GET
  @Path("getFormAppendixList/{wfId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getFormAppendixList(
      @PathParam("wfId") long wfId);

  /**
   * 通过form_id获取表单
   * 
   * @param form_id
   * @return
   */
  @GET
  @Path("getFormById/{form_id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getFormById(@PathParam("form_id") String form_id);

  /**
   * 通过类型获取表单列表
   * 
   * @param type_id
   * @return
   */
  @GET
  @Path("getFormByTypeId/{type_id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getFormByTypeId(
      @PathParam("type_id") long type_id);

  /**
   * 验证流程是否关联表单
   * 
   * @param flowIds
   * @param flowId
   * @param status
   * @return
   */
  @GET
  @Path("getFormFlowId/{flowIds}/{flowId}/{status}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getFormFlowId(@PathParam("flowIds") String flowIds,
      @PathParam("flowId") String flowId, @PathParam("status") String status);

  /**
   * 获取表单新标题
   * 
   * @param title
   * @return
   */
  @GET
  @Path("getFormNewTitle/{title}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getFormNewTitle(@PathParam("title") String title);

  /**
   * 通过id获取函数
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getFunctionById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getFunctionById(@PathParam("id") long id);

  /**
   * 获取函数总条数
   * 
   * @param map
   * @return
   */
  @POST
  @Path("getFunctionCount")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getFunctionCount(Map<String, Object> map);

  /**
   * 获取函数列表
   * 
   * @param function
   * @return
   */
  @POST
  @Path("getFunctionList")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getFunctionList(Map<String, Object> function);

  /**
   * 通过模型id获取单条工作流数据
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getModelInit/{modelId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getModelInit(@PathParam("modelId") long modelId);

  @GET
  @Path("getNewComboID")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Long getNewComboID();

  @GET
  @Path("getNewComboValueID")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Long getNewComboValueID();

  /**
   * 获取下一步骤
   * 
   * @param osWfModel
   * @param actionId
   * @return
   */
  @POST
  @Path("getNextStepFromGraphXML/{actionId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Pair<Boolean, List<Map<String, Object>>> getNextStepFromGraphXML(
      Map<String, Object> osWfModel, @PathParam("actionId") String actionId);

  /**
   * 获取已选中的知会人列表
   * 
   * @param flow_id
   * @param action_id
   * @return
   */
  @GET
  @Path("getNoticeUsersNew/{flow_id}/{action_id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getNoticeUsersNew(
      @PathParam("flow_id") long flow_id, @PathParam("action_id") long action_id);

  /**
   * 通过流程id和动作id获取动作对象
   * 
   * @param flowId
   * @param actionId
   * @return
   */
  @GET
  @Path("getOsWfActionByModelAndActionId/{flowId}/{actionId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getOsWfActionByModelAndActionId(
      @PathParam("flowId") long flowId, @PathParam("actionId") long actionId);

  /**
   * 通过流程id获取步骤列表
   * 
   * @param flow_id
   * @return
   */
  @GET
  @Path("getStepByFlowId/{flow_id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getStepByFlowId(
      @PathParam("flow_id") long flow_id);

  /**
   * 通过流id和步骤id获取处理人员
   * 
   * @param flowId
   * @param stepId
   * @return
   */
  @GET
  @Path("getStepUser/{flowId}/{stepId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStepUser(@PathParam("flowId") long flowId,
      @PathParam("stepId") long stepId);

  /**
   * 获取类型树
   * 
   * @return
   */
  @GET
  @Path("getTree")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getTree();

  /**
   * 通过id获取单个类型
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getTypeById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getTypeById(@PathParam("id") long id);

  /**
   * 通过角色获取用户ids
   * 
   * @param roleId
   * @return
   */
  @POST
  @Path("getUserIdsByRole")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getUserIdsByRole(String roleIds);

  /**
   * 获取流程最后一步id
   * 
   * @param flowId
   * @param conntion
   * @return
   */
  @GET
  @Path("getWfLastStepId/{flowId}/{conntion}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getWfLastStepId(@PathParam("flowId") String flowId,
      @PathParam("conntion") String conntion);

  /**
   * 获取工作流对象
   * 
   * @param user
   * @return
   */
  @GET
  @Path("getWorkflow/{user}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Workflow getWorkflow(@PathParam("user") String user);

  /**
   * 获取表单元数据列表
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getWorkflowMetaList/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getWorkflowMetaList(
      @PathParam("stageId") long stageId);

  /**
   * 获取工作流报表列表
   * 
   * @return
   */
  @GET
  @Path("getWorkflowReportList")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<EssReport> getWorkflowReportList();

  /**
   * 通过模型id获取graphXml
   * 
   * @param modelId
   * @return
   */
  @GET
  @Path("getWorkFlowXml/{modelId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getWorkFlowXml(@PathParam("modelId") long modelId);

  /**
   * 流程导入
   * 
   * @param request
   * @param response
   * @return
   */
  /** lujixiang 针对IE总是针对ajaxSubmit方法返回的json数据下载，现返回信息修改为字符串类型 **/
  @POST
  @Path("importWorkflow")
  @Consumes(MediaTypeEx.MULTIPART_FORM_DATA)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String importWorkflow(
      @Context HttpServletRequest request, @Context HttpServletResponse response);

  /**
   * 初始化工作流
   * 
   * @param params
   * @return 工作流id
   */
  @GET
  @Path("initializeWorkflow/{params}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String initializeWorkflow(@PathParam("params") String params);

  /**
   * 判断是否存在已流转的数据
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("isHavedWFData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String isHavedWFData(Map<String, Object> flow);

  /**
   * 验证是否为最后一步
   * 
   * @param map
   * @return
   */
  @POST
  @Path("isLastStep")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> isLastStep(Map<String, Object> map);

  /**
   * 终止流程
   * 
   * @param workflowId
   * @return
   */
  @GET
  @Path("killWorkflow/{workflowId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean killWorkflow(@PathParam("workflowId") long workflowId);

  /**
   * 验证下一步是否为最后一步
   * 
   * @param flow
   * @param actionId
   * @return
   */
  @POST
  @Path("nextStepIsLastStep/{actionId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public boolean nextStepIsLastStep(Map<String, Object> flow,
      @PathParam("actionId") String actionId);

  /**
   * 解析分支条件
   * 
   * @param condition
   * @return
   */
  @GET
  @Path("parseCondition/{condition}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<HashMap<String, String>> parseCondition(
      @PathParam("condition") String condition);

  @GET
  @Path("pbk/{str}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean pbk(@PathParam("str") String str);

  /**
   * 发布工作流
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("publicWorkFlow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String publicWorkFlow(Map<String, Object> flow);

  /**
   * 保存流程动作
   * 
   * @param action
   * @return
   */
  @POST
  @Path("saveAction")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveAction(Map<String, Object> action);

  /**
   * 保存知会人信息
   * 
   * @param action
   * @return
   */
  @POST
  @Path("saveActionForNoticeInit")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveActionForNoticeInit(Map<String, Object> action);

  /**
   * 保存动作信息
   * 
   * @param action
   * @return
   */
  @POST
  @Path("saveActionInit")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveActionInit(Map<String, Object> action);

  /**
   * 表单保存
   * 
   * @param from
   * @return
   */
  @POST
  @Path("saveForm")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveForm(Map<String, Object> from);

  /**
   * 保存待发
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("saveOldWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveOldWorkflow(Map<String, Object> dataMap);

  /**
   * 保存工作流
   * 
   * @param osWfModel
   * @return
   */
  @POST
  @Path("saveOsWfModel")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveOsWfModel(Map<String, Object> osWfModel);

  /**
   * 保存分支信息
   * 
   * @param condition
   * @return
   */
  @POST
  @Path("saveSplitCondition")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveSplitCondition(Map<String, Object> condition);

  /**
   * 保存步骤信息
   * 
   * @param step
   * @return
   */
  @POST
  @Path("saveStepInit")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveStepInit(Map<String, Object> step);

  /**
   * 保存工作流
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("saveWfModel")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> saveWfModel(Map<String, Object> flow);

  /**
   * 保存开始模型工作流
   * 
   * @param model
   * @return
   */
  @POST
  @Path("saveWFModelInit")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveWFModelInit(Map<String, Object> model);

  /**
   * 启动待发流程
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("startSavedWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> startSavedWorkflow(Map<String, Object> dataMap);

  /**
   * 流程启动
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("startWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> startWorkflow(Map<String, Object> dataMap);

  /**
   * 判断流程是否需要测试
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("stationWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String stationWorkflow(Map<String, Object> flow);

  /**
   * 修改流程表单
   * 
   * @param model
   * @param modelId
   * @return
   */
  @POST
  @Path("updateFlowForm")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean updateFlowForm(Map<String, Object> model,
      @PathParam("modelId") String modelId);

  /**
   * 修改流程状态
   * 
   * @param wfId
   * @return
   */
  @GET
  @Path("updateWfState/{wfId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public boolean updateWfState(@PathParam("wfId") String wfId);

  @POST
  @Path("validateSplitActionIsFrom/{firstActionId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> validateSplitActionIsFrom(
      Map<String, Object> osWfModel,
      @PathParam("firstActionId") String firstActionId);

  /**
   * 判断待删除工作流步骤是否存在待办数据
   * 
   * @param flow
   * @return
   */
  @POST
  @Path("verificationIsHasNotDealWf")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> verificationIsHasNotDealWf(Map<String, Object> flow);

  /**
   * 转发审批
   * 
   * @param map
   * @return
   */
  @POST
  @Path("wfForwardAction")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> wfForwardAction(Map<String, Object> map);

  /**
   * 知会审批
   * 
   * @param map
   * @return
   */
  @POST
  @Path("WfNoticeAction")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> WfNoticeAction(Map<String, String> map);

  /**
   * 保存待发 xuekun 2015年3月12日 上午9:27:18
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("saveWorkFlow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveWorkFlow(Map<String, Object> dataMap);

  /**
   * 验证流程类型名称唯一性
   * 
   * @param flowType
   * @return
   */
  @POST
  @Path("uniqueName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String uniqueName(Map<String, Object> flowType);

  /**
   * 函数名称唯一性验证
   * 
   * @param name
   * @return
   */
  @POST
  @Path("uniqueFunName")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String uniqueFunName(String name);
  
  /** lujixiang 20150421 
   * 暂停工作流
   * 
   * @param wfId
   * @return
   */
  @POST
  @Path("haltWorkFlow")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String haltWorkFlow(String wfId);
}