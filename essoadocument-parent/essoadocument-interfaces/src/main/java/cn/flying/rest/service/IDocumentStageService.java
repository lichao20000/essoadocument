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

import cn.flying.rest.service.utils.MediaTypeEx;



/**
 * 文件收集范围
 * 
 * @author xuekun
 *
 */
public abstract interface IDocumentStageService extends ICommonService {
 
  /**
   * 收集范围树
   * 
   * @param isnode
   * @param pId
   * @return
   */
  @GET
  @Path("getTree/{isnode}/{pId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getTree(@PathParam("isnode") Integer isnode,
      @PathParam("pId") Long pId);
  
  //------------------------导入导出--------------------------------
  /**
   * 根据选中的数据导出
   * @param map
   * @return
   */
  @POST
  @Path("exportSelData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> exportSelData(HashMap<String, Object> map);
  /**
   * 根据节点类型和节点树类型获得关联的元数据字段
   * @param map
   * @return
   */
  @POST
  @Path("getFieldsByTreetype")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String,Object>> getFieldsByTreetype(HashMap<String, Object> map);
  
  /**
   * 
   * @param map
   * @return
   */
  @POST
  @Path("exportFilterData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> exportFilterData(HashMap<String, Object> map);
  
  /**
   * 上传并解析要导入的文件,将解析完成的数据存入缓存.
   * @author wanghongchen 20140430
   * @param request request请求.
   */
  @POST
  @Path("importUpload")
  @Consumes(MediaTypeEx.MULTIPART_FORM_DATA)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String importUpload(@Context HttpServletRequest request,@Context HttpServletResponse response);
  
  /**
   * 获取文件头信息,导入第二步中左上角数据.
   * @author wanghongchen 20140506
   * @param path 结构path.
   * @param userId 用户id.
   * @return 文件头信息.
   */
  @POST
  @Path("showFileColumn")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> showFileColumn(Map<String,String> map);

  /**
   * 获取结构信息,导入第二步右上角数据.
   * @author wanghongchen 20140506
   * @param path 结构path.
   * @return 结构信息
   */
  @POST
  @Path("showStructureColumn")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> showStructureColumn(Map<String,String> map);
  
  /**
   * 获取文件的列模型
   * @author wanghongchen 20140506
   * @param path 结构path.
   * @param userId 用户id.
   * @return
   */
  @POST
  @Path("getFileColumnModel")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<HashMap<String, String>> getFileColumnModel(Map<String,String> map);
  
  /**
   * 获取文件前20条数据，提供预览.
   * @author wanghongchen 20140507
   * @param userId 用户id.
   * @param path 结构path.
   * @return
   */
  @POST
  @Path("getPreFileData")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> getPreFileData(Map<String,String> map);
  
  /**
   * 获取上传文件的结构信息,导入数据第二步标签页用到.
   * @param nodePath 结构path.
   * @param userId 用户id.
   * @return
   */
  @GET
  @Path("getImportStructures/{userId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getImportStructures(@PathParam("userId")String userId);

  /**
   * 向数据库导入数据
   * @author wanghongchen 20140508
   * @param userId 用户id.
   * @param map 导入数据.
   * @return
   */
  @POST
  @Path("realImport/{userId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> realImport(@PathParam("userId")String userId,Map<String , Object> map);
  //---------------------导入导出 end--------------------------
  
  /**
   * 验证收集范围代码唯一性
   * @param code
   * @return
   */
  @GET
  @Path("uniqueCode/{code}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String uniqueCode(@PathParam("code") String code);

  /**
   * 验证收集范围名称唯一性
   * @param stage
   * @return
   */
  @POST
  @Path("uniqueName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String uniqueName(Map<String, Object> stage);
  
  /**
   * 验证收集范围名称唯一性
   * @param stage
   * @return
   */
  @POST
  @Path("getStageChildAndParentIds/{stageId}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getStageChildAndParentIds(@PathParam("stageId") String stageId);
}
