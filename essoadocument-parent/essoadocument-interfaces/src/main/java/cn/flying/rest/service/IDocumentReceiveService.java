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
 * 接收文件模块
 * 
 * @author gengqianfeng
 * 
 */
public interface IDocumentReceiveService {

  /**
   * 删除
   * 
   * @param ids
   * @return
   */
  @POST
  @Path("delReceive/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delReceive(Long[] ids,@PathParam("userId") String userId,@PathParam("ip") String ip);

  /**
   * 接收处理
   * 
   * @param receive
   * @return
   */
  @POST
  @Path("editReceive")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String editReceive(HashMap<String, Object> receive);

  /**
   * 获取接收文件列表
   * 
   * @param param
   * @return
   */
  @POST
  @Path("list")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findDocumentReceiveList(
      HashMap<String, Object> param);

  /**
   * 获取接收文件列表总条数
   * 
   * @param param
   * @return
   */
  @POST
  @Path("count")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount(HashMap<String, Object> param);

  /**
   * 通过id获取接收单记录
   * 
   * @param receiveId
   * @return
   */
  @GET
  @Path("getReceiveById/{receiveId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getReceiveById(
      @PathParam("receiveId") long receiveId);
  
  @POST
  @Path("deleteFile")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteFile(HashMap<String, Object> param);
  
  @POST
  @Path("getReceiveBySendId")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Long getReceiveBySendId(Map<String, Object> param);
}
