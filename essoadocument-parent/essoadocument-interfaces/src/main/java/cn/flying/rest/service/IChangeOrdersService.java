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

import cn.flying.rest.service.utils.MediaTypeEx;

public interface IChangeOrdersService {

  /**
   * 删除设计变更单
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delOrder/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delOrder(long[] ids, @PathParam("userId") String userId,
      @PathParam("ip") String ip);

  /**
   * 编辑变更单
   * 
   * @param order
   * @return
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String editOrders(HashMap<String, Object> order);

  /**
   * 通过id获取单条变更单记录
   * 
   * @param id
   *          变更单id
   * @return
   */
  @GET
  @Path("findChangeOrdersById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> findChangeOrdersById(@PathParam("id") long id);

  /**
   * 获取变更单列表
   * 
   * @param page
   *          第几页
   * @param pre
   *          每页显示多少条
   * @param wherea
   *          筛选条件
   * @return
   */
  @POST
  @Path("list/{page}/{pre}/{user}/{admin}/{pId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findChangeOrdersList(
      @PathParam("page") long page, @PathParam("pre") long pre,
      @PathParam("user") String user, @PathParam("admin") String admin,
      @PathParam("pId") long pId,String[] where);

  /**
   * 获取变更单列表总条数
   * 
   * @param where
   *          筛选条件
   * @return
   */
  @POST
  @Path("count/{user}/{admin}/{pId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(@PathParam("user") String user,
      @PathParam("admin") String admin,@PathParam("pId") long pId, String[] where);

  @POST
  @Path("deleteFile")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteFile(HashMap<String, Object> param);
}
