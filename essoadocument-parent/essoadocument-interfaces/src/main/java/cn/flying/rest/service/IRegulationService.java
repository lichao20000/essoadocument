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
import javax.ws.rs.core.Response;

import cn.flying.rest.service.entiry.Regulation;
import cn.flying.rest.service.utils.MediaTypeEx;


/**
 * 规定规范
 * 
 * @author xiewenda
 */
public abstract interface IRegulationService {


  /**
   * 获得所有的数据条数
   * 
   * @return 数据条数
   */
  @GET
  @Path("count")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount();

  /**
   * 根据条件获得所有的数据条数
   * 
   * @return 数据条数
   */
  @POST
  @Path("getCountByCondition")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCountByCondition(HashMap<String, Object> param);

  /**
   * 根据搜索条件获得所有的数据条数
   * 
   * @return 数据条数
   */
  @POST
  @Path("getCountBySearch")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCountBySearch(HashMap<String, Object> param);

  /**
   * 添加新的规定规范
   * 
   * @param regulation 对应的添加数据
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String add(HashMap<String, Object> regulation);

  /**
   * 删除规定规范
   * 
   * @param ids 规定规范要删除的id数组
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("delete/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delete(@PathParam("userId") String userId,@PathParam("ip") String ip,Long ids[]);

  /**
   * 更新规定规范
   * 
   * @param regulation 更新的规范数据以及要更新的规范的唯一标示id
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String update(HashMap<String, Object> regulation);

  /**
   * 获得规定规范的列表
   * 
   * @param condition 根据条件获取（分页条件，查询条件等）
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @POST
  @Path("list")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> list(HashMap<String, Object> condition);

  /**
   * 根据id获得规定规范
   * 
   * @param id 规定规范唯一标识
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @GET
  @Path("getRegulationById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Regulation getRegulationById(@PathParam("id") Long id);

  /**
   * 根据过滤条件获得数据
   * 
   * @param condition(包括分页条件，过滤条件)
   * @return 数据集合
   */
  @POST
  @Path("getRegulationByCondition")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getRegulationByCondition(HashMap<String, Object> param);

  /**
   * 根据搜索条件模糊匹配数据
   * 
   * @param param 参数包含搜索值
   * @return 数据集合
   */
  @POST
  @Path("getRegulationQuery")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getRegulationQuery(HashMap<String, Object> param);

  /**
   * 下载单份文件
   * 
   * @author xiewenda
   * @param filePath 文件路径
   * @return Response 文件流相应
   */
  @GET
  @Path("download/{rootDir}/{filePath}/{fileName}")
  @Produces(MediaTypeEx.APPLICATION_OCTET_STREAM)
  public Response download(@PathParam("rootDir") String rootDir,
      @PathParam("filePath") String filePath, @PathParam("fileName") String fileName);

  @POST
  @Path("deleteFile")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteFile(HashMap<String, Object> param);
  
  @POST
  @Path("getServiceIP")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getServiceIP();

  /**
   * 唯一验证
   * 
   * @param regulationNo
   * @return
   */
  @POST
  @Path("uniqueNo")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long uniqueNo(String regulationNo);
}
