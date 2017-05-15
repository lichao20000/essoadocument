package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import cn.flying.rest.platform.utils.MediaTypeEx;

public interface IDocumentTransferService {
  /**
   * 数据权限检查 文件移交接收 xuekun 2015年1月8日 下午5:08:38 判断是否存在流程 逻辑是从当前数据节点 寻找流程 如果不存在向上级寻找如果不存发布的流程在则 不能发起流程
   * 
   * @param map
   * @return
   */
  @POST
  @Path("checkTransfer")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> checkTransfer(Map<String, Object> map);

  /**
   * 获取流程集合的方法（根据表单权限去获取，为发起流程使用）
   * 
   * @param dataMap
   * @return
   */
  @POST
  @Path("getWfList")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getWfList(Map<String, String> dataMap);

  /**
   * 在显示表单发起界面前，获取表单相关信息 xuekun 2015年2月25日 下午4:06:32
   * 
   * @param map
   * @return
   */
  @POST
  @Path("showMyForm")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> showMyForm(HashMap<String, String> map);

  /**
   * 启动流程 xuekun 2015年2月28日 上午10:50:29
   * 
   * @param map
   * @return
   */
  @POST
  @Path("startTransferFlow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> startTransferFlow(HashMap<String, String> map);

  /**
   * 根据formId获取工作流信息 xuekun 2015年3月2日 上午11:13:20
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getWFModelByflowId")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getWFModelByflowId(Map<String, String> param);
  /**
   * 发起流程
   * xuekun 2015年3月2日 下午4:34:24
   * @param dataMap
   * @return
   */
  @POST
  @Path("startWorkflow")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String startWorkflow(Map<String, String> dataMap);
  @POST
  @Path("setTransferstaus")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean setTransferstaus(Map<String, String> dataMap);
}
