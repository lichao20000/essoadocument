package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import cn.flying.rest.service.utils.MediaTypeEx;




public abstract interface IDocumentBorrowingService {

	/**
	 * 获取文件信息
	 * @param sId
	 * @return
	 */
	  @POST
	  @Path("getcolumn")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public List<Map<String, Object>> getColumnModel(HashMap<String, String> map);
	  
	  @POST
	  @Path("count")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	  public int getCount(HashMap<String, String> map);
	  @POST
	  @Path("getUsingFieldForForm")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public Map<String, Object> getUsingFieldForForm(HashMap<String, String> map);
	  @POST
	  @Path("addform")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public boolean addForm(HashMap<String, Object> map);
	  @POST
	  @Path("delform/{userId}/{ip}")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public boolean delForm(String ids,@PathParam("userId") String userId,@PathParam("ip") String ip);
	  @POST
	  @Path("edit")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public HashMap<String,Object> getFormWithId(Long id);
	  @POST
	  @Path("getdetils")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public List<Map<String, Object>> getDetils(Long bid);
	  @POST
	  @Path("save")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public boolean save(HashMap<String, Object> map);
	  /**
	   * 根据用户ID获取借阅权限
	   * @param userid
	   * @return
	   */
	  @POST
	  @Path("getBorrowRoleWithId")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public HashMap<String, Object> getBorrowRoleWithId(Long userid);
	  
	  @POST
	  @Path("changeDetails/{userId}/{ip}")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public int changeDetails(List<HashMap<String,String>> list,@PathParam("userId") String userId,@PathParam("ip") String ip);
	  /**
	   * 直接借阅借出
	   * @param list
	   * @return
	   */
	  @POST
	  @Path("dirChangeStatus")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public int dirChangeStatus(HashMap<String,Object> map);
	  
	  
	  @POST
	  @Path("returnForForm")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public int returnForForm(HashMap<String, String> map);
	  
	  @POST
	  @Path("relendForForm/{userId}/{ip}")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	  public String relendForForm(String num,@PathParam("userId") String userId,@PathParam("ip") String ip);
	  @POST
	  @Path("bespeak")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	  public String bespeak(HashMap<String,Object> map);
	  @POST
	  @Path("getBespeakList")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public List<Map<String, Object>> getBespeakList(Map<String, Object> map);
	  @POST
	  @Path("getBespeakDetail")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public List<Map<String, Object>> getBespeakDetail(HashMap<String, String> map);
	  @POST
	  @Path("lendDocumentUpOrder")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	  public String lendDocumentUpOrder(HashMap<String, String> map);
	  @POST
	  @Path("getCount")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public Long getCountWithTname(HashMap<String, String> map);
	  @POST
	  @Path("getRespeakById")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public List<Map<String, Object>> getRespeakById(String userId);
	  @POST
	  @Path("delFormArchivesCar/{userId}/{ip}")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public Long delFormArchivesCar(String id,@PathParam("userId") String userId,@PathParam("ip") String ip);
	  @POST
	  @Path("getTree")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public List<Map<String, Object>> getTree(HashMap<String, String> map);
	  @POST
	  @Path("printBorrowreport")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	  public String printBorrowreport(HashMap<String, String> map);
	  @POST
	  @Path("endUsingForm")
	  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	  public String endUsingForm(HashMap<String, String> map);
	  
	  @POST
      @Path("delDetails/{userId}/{ip}")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
      public boolean delDetails(HashMap<String, String> map,@PathParam("userId") String userId,@PathParam("ip") String ip);
	  
	  @POST
      @Path("getBorrowFileIdByNum")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
      public String getBorrowFileIdByNum(String borrowNums);
	  
	  @POST
      @Path("getDocumentBorrowStatus")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
      public String getDocumentBorrowStatus(List<HashMap<String,String>> list);

	  @POST
      @Path("editSave")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
      public boolean editSave(HashMap<String, Object> map);
	  
	  @POST
      @Path("getFormDataByFormID")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
      public List<Map<String, Object>> getFormDataByFormID(long formId);
	  
	  @POST
      @Path("getDetailsByFormId")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
      public Map<String, Object> getDetailsByFormId(HashMap<String, String> map);

	  @POST
      @Path("relendOrReturnForForm")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
      public String relendOrReturnForForm(HashMap<String, String> map);
	  
	  @POST
      @Path("relendOrReturnForDetails")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
      public String relendOrReturnForDetails(HashMap<String, String> map);
	  
	  @POST
      @Path("addCarForBespeak")
      @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
      @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
      public int addCarForBespeak(HashMap<String,Object> map);
	  
}
