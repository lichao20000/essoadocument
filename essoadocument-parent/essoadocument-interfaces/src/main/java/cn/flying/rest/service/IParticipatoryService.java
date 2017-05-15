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

import cn.flying.rest.service.entiry.Participatory;
import cn.flying.rest.service.utils.MediaTypeEx;

/**
 * 参建单位或部门服务接口
 * 
 * @author dengguoqi 2014-10-30
 */
public abstract interface IParticipatoryService {
  /**
   * 添加参建单位或部门<br>
   * Path：add
   * 
   * @param part
   * @return 错误信息，无错误返回空字符串
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public HashMap<String, Object> addParticipatoryList(
      HashMap<String, Object> part);

  /**
   * 删除指定的参建单位或部门<br>
   * Path：delete
   * 
   * @param ids
   *          ID数组
   * @return 错误信息，无错误返回空字符串
   */
  @POST
  @Path("delete/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteParticipatorys(Long[] ids,
      @PathParam("userId") String userId, @PathParam("ip") String ip);

  /**
   * 获取参建单位或部门总数<br>
   * Path: count
   * 
   * @return
   */
  @GET
  @Path("count")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount();

  /**
   * 获取参建单位或部门总数<br>
   * Path: count
   * 
   * @return
   */
  @POST
  @Path("count/{pid}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(@PathParam("pid") String pid, String[] where);

  /**
   * 获取指定的参建单位或部门
   * 
   * @param id
   *          参建单位或部门ID
   * @return
   */
  @GET
  @Path("getParticipatoryById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getParticipatoryById(@PathParam("id") long id);

  /**
   * 根据用户标示获取参建单位实体对象
   * 
   * @param userId
   * @return
   */
  @GET
  @Path("getParticipatoryByUserId/{userId}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Participatory> getParticipatoryByUserId(
      @PathParam("userId") String userId);

  /**
   * 分页获取参建单位或部门<br>
   * Path：list/{page}/{pre}/{parentId}
   * 
   * @param page
   *          第几页
   * @param pre
   *          每页条数
   * @param parentId
   *          父级ID
   * @param where
   *          条件，SQL语句使用的where字句，不含where关键词
   * @return
   */
  @POST
  @Path("list/{page}/{pre}/{parentId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getParticipatoryList(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("parentId") String parentId, String[] where);

  /**
   * 指定条件获取参建单位或部门
   * 
   * @param where
   *          条件，SQL语句使用的where字句，不含where关键词
   * @return
   */
  @POST
  @Path("list")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getParticipatoryList(Map<String, Object> map);

  /**
   * 唯一验证
   * 
   * @param code
   * @return
   */
  @POST
  @Path("uniqueCode")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long uniqueCode(String code);

  /**
   * 修改参建单位或部门，已经对象ID更新<br>
   * Path：update
   * 
   * @param part
   * @return 错误信息，无错误返回空字符串
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateParticipatory(HashMap<String, String> part);

  /**
   * 验证参建单位名称唯一性
   * 
   * @param part
   * @return
   */
  @POST
  @Path("uniqueName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String uniqueName(Map<String, Object> part);

  /**
   * 根据代码获取参建单位实体
   * 
   * @param code
   * @return
   */
  @GET
  @Path("getParticipatoryByCode/{code}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getParticipatoryByCode(
      @PathParam("code") String code);

  /**
   * 添加部门员工
   * 
   * @param partId
   * @param userId
   * @param office
   * @return
   */
  @GET
  @Path("addMember/{partId}/{userId}/{office}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String addMember(@PathParam("partId") long partId,
      @PathParam("userId") long userId, @PathParam("office") String office);

  /**
   * 获取部门员工总条数
   * 
   * @param partId
   * @param where
   * @return
   */
  @POST
  @Path("getMemberCount/{partId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getMemberCount(@PathParam("partId") long partId, String[] where);

  /**
   * 获取部门员工列表
   * 
   * @param page
   * @param rp
   * @param partId
   * @param where
   * @return
   */
  @POST
  @Path("getMemberList/{page}/{rp}/{partId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getMemberList(@PathParam("page") long page,
      @PathParam("rp") long rp, @PathParam("partId") long partId, String[] where);

  /**
   * 删除部门员工
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("confirmDelMember/{partId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String confirmDelMember(@PathParam("partId") long partId, String[] ids);
  /**
   * 得到部门员工
   * @return
   */
  @POST
  @Path("getMemberById")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> getMemberById(Map<String,Object> param);
  
  /**
   * 编辑部门员工
   * @return
   */
  @POST
  @Path("editMember")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String editMember(Map<String,Object> param);
  
  /**
   * 判断该部门下是否存在用户
   * @param partId
   * @return
   */
  @POST
  @Path("isExistUsers")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long isExistUsers(Map<String,Object> map);
  /**
   * 通过用户id获取参见单位部门
   * 
   * @param userId
   * @return
   */
  @GET
  @Path("getPartByUserId/{userId}")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getPartByUserId(@PathParam("userId") long userId);
  
  /**
   * 通过部门id获取部门用户
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getPartUserById")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getPartUserById(Map<String, Object> param);
}
