package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import cn.flying.rest.platform.utils.MediaTypeEx;
import cn.flying.rest.service.entiry.EssLucene;

/**
 * @see 全文索引库管理web层接口
 * @author liqiubo 20140411
 *
 */
public abstract interface ILuceneService {
	/**
	 * 添加一条索引
	 * @author xuxinjian 20120905
	 * @param essLucene 全文索引库EssLucene的对象
	 */
	@POST
	@Path("addLucene")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public EssLucene addLucene(EssLucene essLucene);
	/**
	 * 根据id删除一条索引
	 * @author xuxinjian 20120905
	 * @param id 索引的id
	 */
	@DELETE
	@Path("deleteLucene/{id}")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Boolean deleteLucene(@PathParam("id") long id);
	/**
	 * 根据id批量删除一组索引
	 * @author xuxinjian 20120905
	 * @param id 索引的id
	 */
	//modify  delete改为POST yanggaofei 20120926
	@POST
	@Path("deleteBatchLucene")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Boolean deleteBatchLucene(long[] id);
	/**
	 * 修改一条索引
	 * @author xuxinjian 20120906
	 * @param essLucene 全文索引库EssLucene的对象
	 */
	@POST
	@Path("updateLucene")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Boolean updateLucene(EssLucene essLucene);
	/**
	 * 查找索引库列表分页显示
	 * @author xuxinjian 20120906
	 * @param pageNum 当前页数
	 * @param pageSize 每页显示数量
	 * @return 索引库列表
	 */
	@GET
	@Path("findLuceneList/{pageNum},{pageSize}")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public List<EssLucene> findLuceneList(@PathParam("pageNum") int pageNum,@PathParam("pageSize") int pageSize);
	/**
	 * 根据目录id查找索引库列表分页显示
	 * @author xuxinjian 20120906
	 * @param id 目录id
	 * @param pageNum 当前页数
	 * @param pageSize 每页显示数量
	 * @return 索引库列表
	 */
	@GET
	@Path("findLuceneList/{id},{pageNum},{pageSize}")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public List<EssLucene> findLuceneList(@PathParam("id")long id,@PathParam("pageNum") int pageNum,@PathParam("pageSize") int pageSize);
	/**
	 * 查找索引库的总条数
	 * @author xuxinjian 20120906
	 * @return 索引库的总条数
	 */
	@GET
	@Path("luceneCountAll")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public int luceneCountAll();
	/**
	 * 根据目录id查找索引库的总条数
	 * @author xuxinjian 20120906
	 * @param id 目录id
	 * @return 索引库的总条数
	 */
	@GET
	@Path("luceneCountAll/{id}")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public int luceneCountAll(@PathParam("id") long id);
	/**
	 * 根据id查找一条索引
	 * @author xuxinjian 20120906
	 * @param id 索引id
	 * @return 索引EssLucene的对象
	 */
	@GET
	@Path("findLucene/{id}")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public EssLucene findLucene(@PathParam("id") long id);
	/**
	 * 根据输入的关键字模糊查询索引库列表
	 * @author xuxinjian 20120906
	 * @param param 输入的参数
	 * @return 索引库列表
	 */
	@GET
	@Path("findLuceneList/{param}")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public List<EssLucene> findLuceneList(@PathParam("param") String param);
	
	/**
	 * 获取已经创建了索引库的节点
	 * liqiubo 20140504
	 * @param map 参数集合 其中主要参数：nodePath 树节点path 如果是空值，则查询全部，start，limit
	 * @return 建立了索引库的列表
	 */
	@POST
    @Path("getCreatedNodesList")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Map<String,Object> getCreatedNodesList(Map<String,String> map);
	
	/**
	 * 获取还没有创建索引库的节点列表,此处应该查找的是叶子节点
	 * liqiubo 20140504
	 * @param map 参数集合 其中主要参数：nodePath 树节点path 如果是空值，则查询全部，start，limit
	 * @return 未建立索引库的列表
	 */
	@POST
    @Path("getNoCreateNodesList")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Map<String,Object> getNoCreateNodesList(Map<String,String> map);
	
	/**
	 * 创建索引库
	 * @param map 主要存放要创建的索引库的节点
	 * @return 返回创建是否成功，以及失败的节点
	 */
	@POST
    @Path("createIndexStore")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Map<String,Object> createIndexStore(Map<String,String> map);
	
	/**
	 * 创建所有库
	 * @return 返回创建是否成功，以及失败的节点
	 */
	@POST
    @Path("createAllIndexStore")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Map<String,Object> createAllIndexStore(Map<String,String> mapParam);
	
	/**
     * 删除索引库
     * @param map 主要存放要删除的索引库的节点
     * @return 返回删除是否成功，以及失败的节点
     */
    @POST
    @Path("deleteIndexStore")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public Map<String,Object> deleteIndexStore(Map<String,String> map);
    
    /**
     * 删除所有库
     * @return 返回删除是否成功，以及失败的节点
     */
    @POST
    @Path("deleteAllIndexStore")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public Map<String,Object> deleteAllIndexStore(Map<String,String> mapParam);
    
    /**
     * 重建索引库
     * @param mapParam
     * @return
     */
    @POST
    @Path("reCreateIndexStore")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public Map<String,Object> reCreateIndexStore(Map<String,String> mapParam);
    
    /**
     * 优化索引库
     * @param mapParam
     * @return
     */
    @POST
    @Path("optimizeIndexStore")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public Map<String,Object> optimizeIndexStore(Map<String,String> mapParam);
    
    /**
     * 更新索引库的edit时间（此时间用来记录对应的esp表当天是否有数据进行操作）
     * @param treeNodeId
     */
    @GET
    @Path("updateIndexStoreEditTime/{treeNodeId}")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public void updateIndexStoreEditTime(@PathParam("treeNodeId") String treeNodeId);
    
    /**
     * 获取同结构下，其他树节点ID
     * @param struIds
     * @param treeNodes
     * @return
     */
    @POST
    @Path("getOtherNodes")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public Map<String,Object> getOtherNodes(Map<String,String> map);
    
    /**
     * 根据id 获取其他同结构下的id（已经建立了索引库的节点）
     * liqiubo 20140710
     */
    @POST
    @Path("getOtherNodesForCreated")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    @Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public Map<String,Object> getOtherNodesForCreated(Map<String,String> map);
    
    /**
     * 根据树节点ID，获取已经建立的索引库节点信息
     * @param treeNodes
     * @return
     */
    @GET
    @Path("getIndexNodeForTreeNodes/{treeNodes}")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public List<Map<String,Object>> getIndexNodeForTreeNodes(@PathParam("treeNodes")String treeNodes);
    /**
     * 获取设置的索引库根路径
     * @return
     */
    @GET
    @Path("getFullIndexPath")
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public String getFullIndexPath();
    
    /***
     * xiaoxiong 20140822
     * 获取系统应用配置值
     * @return
     */
    @GET
    @Path("getAppConfigValue/{key}")
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	public String getAppConfigValue(@PathParam("key")String key);
    
    /****
     * xiaoxiong 20140823
     * 获取全文索引外挂词数据列表
     * @param params
     * @return
     */
    @SuppressWarnings("rawtypes")
    @POST
    @Path("getExtraKeywords")
    @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
    @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
    public HashMap getExtraKeywords(HashMap<String, String> params);
    
    /****
     * xiaoxiong 20140823
     * 判断外挂词是否已存在
     * @param params
     * @return
     */
    @POST
    @Path("isHased")
    @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public Boolean isHased(HashMap<String, String> params);
    
    /****
     * xiaoxiong 20140823
     * 添加外挂词
     * @param params
     * @return
     */
    @POST
    @Path("addExtraKeyword")
    @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public Boolean addExtraKeyword(HashMap<String, String> params);
    
    /****
     * xiaoxiong 20140823
     * 修改外挂词
     * @param params
     * @return
     */
    @POST
    @Path("updateExtraKeyword")
    @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public Boolean updateExtraKeyword(HashMap<String, String> params);
    
    /****
     * xiaoxiong 20140823
     * 删除外挂词集合
     * @param params
     * @return
     */
    @POST
    @Path("removeExtraKeywords")
    @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public Boolean removeExtraKeywords(HashMap<String, String> params);
    
    /**
     * 
     * @author xiaoxiong 20140823
     * 全文索引外挂词文件导入
     * @param request
     * @return
     */
    @GET
    @Path("getImportUrl/{userId}/{userIp}")
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public String getImportUrl(@PathParam("userId")String userId,@PathParam("userIp")String userIp);
    
    /**
     * @author gaoyide
     * 根据结构(目前为树节点)ID获取拥有元数据的字段集合
     */
    @GET
    @Path("getHasMetaDataTags/{ids}")
    @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
    public Map<String,String> getHasMetaDataTags(@PathParam("ids")Long ids);
    
    
    
    
    
	List<HashMap<String, String>> searchAllEspnDataMap(String nodeId,
			String id_structure, String childStruId, List<String> queryCols,
			HashMap<String, String> cidToMetadataMap, int startNo, int limit,
			boolean isFile);
    
   /* *//**
     * 
     * @author xiaoxiong 20140823
     * 全文索引外挂词文件导入
     * @param request
     * @return
     *//*
    @POST
    @Path("importData/{userId}/{userIp}")
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public String importData(@Context HttpServletRequest request, @Context HttpServletResponse response,@PathParam("userId")String userId,@PathParam("userIp")String userIp);
    
    *//**
     * xiaoxiong 20140823
     * 导出外挂词
     * @return
     *//*
    @GET
    @Path("exportData/{userId}/{userIp}")
    @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
    public String exportData(@PathParam("userId")String userId,@PathParam("userIp")String userIp);*/
	
	 /**
     * lujixiang 20150416 获取已建立索引的文件收集范围
     * @return
     */
    @POST
    @Path("getIndexedStageType")
    @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
    public List<Map<String, Object>> getIndexedStageType();
}
