package cn.flying.rest.service;

import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import cn.flying.rest.service.utils.MediaTypeEx;



/**
 * 文件类型代码
 * 
 * @author xuekun
 *
 */
public abstract interface IDocumentTypeService extends ICommonService {

  /**
   * 唯一验证
   * 
   * @param typeNo
   * @return
   */
  @POST
  @Path("uniqueTypeNo")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long uniqueTypeNo(Map<String, Object> map);
}
