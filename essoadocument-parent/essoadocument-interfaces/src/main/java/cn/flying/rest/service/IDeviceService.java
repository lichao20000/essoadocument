package cn.flying.rest.service;

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
 * 装置单元号维护
 * 
 * @author xuekun
 *
 */
public abstract interface IDeviceService extends ICommonService {
  /**
   * 
   * xuekun 2015年1月13日 下午5:14:18
   * 
   * @param maxLevel
   * @return
   */
  @GET
  @Path("getTree/{maxLevel}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getTree(@PathParam("maxLevel") int maxLevel);
  

  /**
   * 判断装置主项号是否重复 xuekun 2015年1月13日 下午5:14:14
   * 
   * @param firstNo
   * @return
   */
  @GET
  @Path("judgeFirstNo/{firstNo}/{id}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean judgeFirstNo(@PathParam("firstNo") String firstNo,@PathParam("id") Long id);

  /**
   * 判断装置子项号是否重复 xuekun 2015年1月13日 下午5:14:09
   * 
   * @param firstNo
   * @param secondNo
   * @return
   */
  @GET
  @Path("judgeSecondNo/{firstNo}/{secondNo}/{id}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean judgeSecondNo(@PathParam("firstNo")String firstNo, @PathParam("secondNo")String secondNo,@PathParam("id") Long id);
  
  /**
   * 判断装置分类名称是否重复 rongying 20150428
   * 
   * @param deviceName
   * @return
   */
  @POST
  @Path("judgeDeviceName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean judgeDeviceName(Map<String,Object> param);
  
  /**
   * 判断装置区是否存在装置 rongying 20150514
   * 
   * @param deviceName
   * @return
   */
  @POST
  @Path("isExistDevice")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean isExistDevice(Map<String,Object> param);

}
