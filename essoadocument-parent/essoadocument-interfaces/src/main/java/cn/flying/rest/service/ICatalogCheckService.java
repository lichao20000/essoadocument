package cn.flying.rest.service;

import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import cn.flying.rest.service.utils.MediaTypeEx;

/**
 * 目录检查
 * 
 * @author xuekun
 *
 */
public abstract interface ICatalogCheckService {
  /**
   * 目录检查 获取没有文件的目录 目前看 分为两种 检查方法 1:检查所有节点,2:检查没有子节点的节点
   * 
   * @param page
   * @param rp
   * @param stageId
   * @param deviceId
   * @return
   */
  @GET
  @Path("findNoDataNodeList/{stageId}/{deviceId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> findNoDataNodeList(@PathParam("stageId") Long stageId,
      @PathParam("deviceId") Long deviceId);


}
