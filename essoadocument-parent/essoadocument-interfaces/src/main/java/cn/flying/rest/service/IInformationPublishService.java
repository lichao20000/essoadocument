package cn.flying.rest.service;

import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import cn.flying.rest.service.utils.MediaTypeEx;


/**
 * 信息发布管理
 * 
 * @author xiewenda
 */
public abstract interface IInformationPublishService {
  /**
   * 得到所有的栏目类型 也就是树节点
   * @return
   */
  @GET
  @Path("selectAllType")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String,Object>> selectAllType();
  
  @POST
  @Path("savePublishTopic")
  @ Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> savePublishTopic(Map<String, Object> param);
  
  @POST
  @Path("getPublishTopicList")
  @ Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> getPublishTopicList(Map<String, Object> param);
  
  @POST
  @Path("GetPublishTopic")
  @ Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> GetPublishTopic(Map<String, Object> param);
  
  @POST
  @Path("deletePublishTopic")
  @ Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deletePublishTopic(Map<String, Object> param);
  
  @POST
  @Path("updateTopicStatus")
  @ Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateTopicStatus(Map<String, Object> param);

}