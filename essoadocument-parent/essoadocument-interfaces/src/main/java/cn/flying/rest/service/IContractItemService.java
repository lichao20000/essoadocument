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

import cn.flying.rest.service.entiry.Contract;
import cn.flying.rest.service.utils.MediaTypeEx;

public abstract interface IContractItemService {

  /**
   * 添加合同工程
   * 
   * @param part
   * @return 错误信息，无错误返回空字符串
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String addContract(HashMap<String, Object> part);

  /**
   * 删除合同工程
   * 
   * @param ids ID数组
   * @return 错误信息，无错误返回空字符串
   */
  @POST
  @Path("delete/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delContract(Long[] ids,@PathParam("userId") String userId,@PathParam("ip") String ip);

  /**
   * 分页获取
   * 
   * @param page页数
   * @param pre每页条数
   * @return 合同工程列表
   */
  @POST
  @Path("list/{page}/{pre}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Contract> findContractList(@PathParam("page") Long page, @PathParam("pre") Long pre,HashMap<String,Object> map);
  /**
   * 获取总条数
   * @return 条数
   */
  @POST
  @Path("count")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(HashMap<String,Object> map);
  /**
   * 获取单个
   * @param id
   * @return
   */
  @GET
  @Path("get/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> get(@PathParam("id") Long id);
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
  
  /**
   * 唯一验证
   * 
   * @param contractNum
   * @return
   */
  @POST
  @Path("uniqueContractNum")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long uniqueContractNum(String contractNum);
}
