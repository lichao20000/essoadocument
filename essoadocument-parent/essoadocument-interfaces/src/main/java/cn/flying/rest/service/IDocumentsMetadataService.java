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
 * 文件元数据和系统元数据
 * 
 * @author xuekun
 *
 */
public interface IDocumentsMetadataService extends ICommonService {

  /**
   * 添加文件编码规则
   * 
   * @param stageId
   * @param tagids
   * @return
   */
  @POST
  @Path("addDocNoRule")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String addDocNoRule(Map<String, String> params);

  /**
   * 获得文件编码规则
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getDocRule/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getDocRule(@PathParam("stageId") Long stageId);

  /**
   * 获取节点字段
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getStageFieldToAdd/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getStageFieldToAdd(@PathParam("id") long id);
  

  @POST
  @Path("checkedMetadataExists")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String checkedMetadataExists(Map<String, Object> param);
  
  @POST
  @Path("checkedArchiveMetadataRepeat")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String checkedArchiveMetadataRepeat(Map<String, Object> param);

}
