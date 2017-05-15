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


/**
 * 公用接口
 * 
 * @author xuekun
 *
 */

public abstract interface ICommonService {
  /**
   * 
   * @param map
   * @return
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public HashMap<String, Object> add(HashMap<String, Object> map);

  /**
   * 从数据库删除数据
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delete/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delete(Long[] ids,@PathParam("userId") String userId,@PathParam("ip") String ip);

  @GET
  @Path("get/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> get(@PathParam("id") Long id);

  @POST
  @Path("count")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(HashMap<String, Object> map);

  /**
   * 通过条件获取数据库数据
   * 
   * @param map
   * @return
   */
  @POST
  @Path("list/{page}/{rp}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> list(@PathParam("page")Integer page,@PathParam("rp")Integer rp,HashMap<String, Object> map);

  /**
   * 更数据库数据
   * 
   * @param map
   * @return
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String update(HashMap<String, String> map);

}
