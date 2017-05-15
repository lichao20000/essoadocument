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

import cn.flying.rest.service.entiry.Standarddocument;
import cn.flying.rest.service.utils.MediaTypeEx;


/**
 * 标准文件
 * 
 * @author xiewenda
 */
public abstract interface IStandarddocumentService {
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
   * 添加新的标准文件
   * 
   * @param role 对应的添加数据
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String add(HashMap<String, Object> standard);

  /**
   * 删除标准文件
   * 
   * @param ids 标准文件要删除的id数组
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("delete/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delete(@PathParam("userId") String userId,@PathParam("ip") String ip,Long ids[]);

  /**
   * 更新标准文件
   * 
   * @param regulation 更新的标准文件数据以及要更新的标准文件的唯一标示id
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String update(HashMap<String, Object> standard);

  /**
   * 获得标准文件的列表
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
   * 根据id获得标准文件信息
   * @param id 标准文件的id
   * @return 标准文件对象
   */
  @GET
  @Path("getStandardById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Standarddocument getStandardById(@PathParam("id") Long id);

  /**
   * 根据过滤条件获得数据
   * 
   * @param condition(包括分页条件，过滤条件)
   * @return 数据集合
   */
  @POST
  @Path("getStandardByCondition")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getStandardByCondition(HashMap<String, Object> param);
  
  @POST
  @Path("deleteFile")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteFile(HashMap<String, Object> param);
  
  /**
   * 唯一验证
   * 
   * @param standardDocumentNo
   * @return
   */
  @POST
  @Path("uniqueNo")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long uniqueNo(String standardDocumentNo);
}
