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

import cn.flying.rest.platform.utils.MediaTypeEx;
import cn.flying.rest.service.entiry.EssFile;

/**
 * 文件收集
 * 
 * @author xuekun
 *
 */
public abstract interface IDocumentsCollectionService extends ICommonService {
  /**
   * 获取表单
   * 
   * @param stageId
   * @param id
   * @return
   */
  @GET
  @Path("addForm/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> addForm(@PathParam("stageId") Long stageId);



  /**
   * 级联获取文件编码规则
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getDocRuleTteration/{stageId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getDocRuleTteration(@PathParam("stageId") Long stageId);

  /**
   * 获取文件附件
   * 
   * @param params
   * @return
   */
  @GET
  @Path("getFileInfoByPath/{dataId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<EssFile> getFileInfoByPath(@PathParam("dataId") Long dataId);

  /**
   * 获取节点字段
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getMetaData/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getMetaData(@PathParam("stageId") Long stageId);

  /**
   * 
   * @param stageId
   * @param id
   * @return
   */
  @GET
  @Path("getStageData/{stageId}/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStageData(@PathParam("stageId") Long stageId,
      @PathParam("id") Long id);

  /**
   * 获取节点数据长度
   * 
   * @param stageId
   * @param map
   * @return
   */
  @POST
  @Path("getStageDataCount/{stageId}/{ids}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Long getStageDataCount(@PathParam("stageId") Long stageId,@PathParam("ids") String ids, HashMap<String, Object> map);

  /**
   * 添加节点数据
   * 
   * @param page
   * @param rp
   * @param stageId
   * @param map
   * @return
   */
  @POST
  @Path("getStageDataList/{page}/{rp}/{stageId}/{ids}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getStageDataList(@PathParam("page") Integer page,
      @PathParam("rp") Integer rp, @PathParam("stageId") Long stageId,@PathParam("ids") String ids, HashMap<String, Object> map);

  /**
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getStageId/{id}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getStageId(@PathParam("id") Long id);

  /**
   * 通过条件获取数据库数据
   * 
   * @param map
   * @return
   */
  @POST
  @Path("printReport")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String printReport(HashMap<String, Object> map);
  
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
  public Map<String,String> realImport(@PathParam("userId")String userId,Map<String , Object> map);
  //---------------------导入导出 end--------------------------
  @POST
  @Path("getDataInfoWhenOnlineView")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> getDataInfoWhenOnlineView(HashMap<String, String> keyMap);

  /**
   * 
   * xuekun 2015年3月23日 下午2:36:23
   * @param stageId
   * @return
   */
  @GET
  @Path("getStageField/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getStageField(@PathParam("stageId") Long stageId);
  
  /**
   * lujixiang 20150402 获取
   * @param stageId
   * @return
   */
  @POST
  @Path("showDataInfo")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> showDataInfo(HashMap<String, String> map);
  
  /**
   * lujixiang 20150402 获取电子文件浏览权限
   * @param stageId
   * @return
   */
  @GET
  @Path("getFileViewRight/{dataId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Boolean> getFileViewRight(@PathParam("dataId") Long dataId);
  
	/**
	 * lujixiang 20150413  获取电子文件详情集合,供全文检索使用{fileId:xxx,title:xxx}   
	 * 
	 * @param dataId
	 * @return
	 */
	public List<Map<String, Object>> getFileInfoById(Long dataId);
	
	/**
   * 获取文件编码
   * 
   * @param stageId
   * @param map
   * @return
   */
  @POST
  @Path("getFileCode")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> getFileCode(Map<String, Object> map);
  
  /**
   * 判断文件编码是否重复，重置编码流水号
   * @param map
   */
  @POST
  @Path("judegIsRepeatBydocNoRule")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String judegIsRepeatBydocNoRule(Map<String, Object> map);
  
  /**
   * 获取筛选页面系统字段值
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getMetaDataField/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getMetaDataField(@PathParam("stageId") Long stageId);
  
  /**
   * 判断手动输入的类型代码，及专业代码
   * @param map
   */
  @POST
  @Path("checkInputCode")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String checkInputCode(Map<String, Object> map);
  
  /**
   * 根据部门代码获取id
   * @param map
   */
  @POST
  @Path("getPartIdByCode")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getPartIdByCode(Map<String, Object> map);
  
  @POST
  @Path("checkDataIsSend")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String checkDataIsSend(Map<String, Object> map);

  /**
   * 通过文件id获取收集范围节点（id，pId）
   * @param docId
   * @return
   */
  @GET
  @Path("getStageIdsByDocId/{docId}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getStageIdsByDocId(@PathParam("docId") String docId);
}
