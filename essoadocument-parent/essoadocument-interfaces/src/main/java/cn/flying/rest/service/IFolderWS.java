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
import javax.ws.rs.core.MediaType;

import cn.flying.rest.platform.utils.MediaTypeEx;
import cn.flying.rest.service.entiry.EssFile;
import cn.flying.rest.service.entiry.EssFolder;


/**
 * @see 电子文件中心WEB层接口
 * @author yanggaofei 20120910
 * 
 */
public interface IFolderWS {

  /**
   * 根据当前文件夹的id查找子文件夹
   * 
   * @author xuekun
   * @param pid 当前文件的id 是其子文件的父id modify yanggaofei 20121015
   * @return 下一层文件 的列表 其中isParent 属性为true时，表示其下有子文件夹，当为false时，表明没有子文件
   */
  @GET
  @Path("getSubFolder/{pid}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<EssFolder> selectFolderByPid(@PathParam("pid") Long pid);

  /**
   * 
   * @param id
   * @return
   */
  @GET
  @Path("getNowFolder/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public EssFolder selectFolderById(@PathParam("id") Long id);

  /**
   * 建立子文件夹（添加一条新纪录父id为上一层文件夹的id）
   * 
   * @param id
   * @param folder
   * @return
   */
  @POST
  @Path("addSubFolder/{pid}/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public EssFolder addChilderFolder(@PathParam("pid") Long pid,@PathParam("userId") String userId,@PathParam("ip") String ip, EssFolder folder);

  /**
   * 根据文件夹的id 查找此文件夹下的文件（分页显示）
   * 
   * @param pageNum 第几页
   * @param pageSize 一页显示多少行
   * @return 返回文件夹下文件的列表
   */
  @GET
  @Path("selectFileByFolderIdForESFILE/{folderId}/{pageNum}/{pageSize}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<EssFile> selectFileByFolderIdForESFILE(@PathParam("folderId") Long folderId,
      @PathParam("pageNum") int pageNum, @PathParam("pageSize") int pageSize);

  /**
   * 查看当前文件夹下的文件的总数
   * 
   * @param FolderId
   * @return
   */
  @GET
  @Path("getTotalNum/{folderId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Long getTotalNum(@PathParam("folderId") Long folderId);

  /**
   * 更改文件夹名称
   * 
   * @param id
   * @param map
   * @return
   */
  @POST
  @Path("editSubFolder/{id}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String editSubFolder(@PathParam("id") int id, Map<String, String> map);

  /**
   * 查看当前文件夹下未挂接的文件总数
   * 
   * @param folderId 文件夹的id
   * @return 当前文件夹下为挂接文件的总数
   */
  @GET
  @Path("getNotHookFileNum/{folderId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Long getNotHookFileNum(@PathParam("folderId") Long folderId);

  /**
   * 查看当前文件夹下未挂接的文件列表
   * 
   * @param FolderId 文件夹的id
   * @param pageNum 第几页
   * @param pageSize 每页显示多少条
   * @return 未挂接的文件的列表
   */
  @GET
  @Path("selectNotHookFileByFolderId/{folderId}/{pageNum}/{pageSize}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<EssFile> selectNotHookFileByFolderId(@PathParam("folderId") Long folderId,
      @PathParam("pageNum") int pageNum, @PathParam("pageSize") int pageSize);

  /**
   * 向file表中添加数据，更新未挂接数 电子文件中心上传使用
   * 
   * @author xuekun
   * @param file 要存的信息
   * @param folderid 文件夹ID
   * @return 成功返回true 失败返回false.
   */
  @POST
  @Path("addNoLinkFile/{folderid}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean addNoLinkFile(@PathParam("folderid") Long folderid,
      List<HashMap<String, String>> file);

  /**
   * 根据文件夹的id 查找此文件夹下的文件（分页显示）(未挂接)
   * 
   * @param pageNum 第几页
   * @param pageSize 一页显示多少行
   * @return 返回文件夹下文件的列表
   */
  @POST
  @Path("selectFileByFolderIdForNoLink/{folderId}/{pageNum}/{pageSize}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<EssFile> selectFileByFolderIdForNoLink(@PathParam("folderId") Long folderId,
      @PathParam("pageNum") int pageNum, @PathParam("pageSize") int pageSize,
      HashMap<String, String> keyword);

  /**
   * 根据文件夹Id获取其中的文件个数 liqiubo 20140916 现在根据业务 要拿全部的，所以此处开始获取全部的了，由于本方法只有一个地使用，故直接修改
   * 
   * @param FolderId 文件夹ID
   * @return 包含文件数
   */
  @POST
  @Path("getFileCountByFolderIdForNoLink/{folderId}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Long getFileCountByFolderIdForNoLink(@PathParam("folderId") Long folderId,
      HashMap<String, String> keyword);

  /**
   * 同时向file和Esp_N_File表中添加数据
   * 
   * @author yanggaofei 20121017
   * @param file 要存的信息
   * @param flag 当flag为true时，同时向两张表添加数据，当flag为false时只向File表中添加数据
   * @return 成功返回true 失败返回false.
   */
  @POST
  @Path("addFile/{id}/{folderid}/{flag}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Boolean addFile(@PathParam("id") Long id, @PathParam("folderid") Long folderid,
      List<HashMap<String, String>> file, @PathParam("flag") Boolean flag);

  /**
   * 根据id 删除对应的文件关联表中的数据
   * 
   * @param path 指定的path
   * @param ids 要删除的数据的id 的集合
   * @return 成功true失败返回false
   */
  @POST
  @Path("deleteFileInfo/{id}/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Boolean DeleteFileInfo(@PathParam("id") Long id,@PathParam("userId") String userId,@PathParam("ip") String ip, Map<String,Object> param);

  /**
   * 获取浏览文件的url，包括二维码文件
   * 
   * @author zhanglei 20130428
   * @param path
   * @param originalId 原文件Id
   * @param company
   * @param clientIp
   * @return
   */
  @GET
  @Path("getViewUrl/{originalId}/{company}/{clientIp}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, String> getViewUrl(@PathParam("originalId") String originalId, @PathParam("company") String company,
      @PathParam("clientIp") String clientIp);
  /**
   * 检查是否存在swf文件
   * xuekun 2015年3月18日 下午2:20:53
   * @param fileId
   * @return
   */
  @POST
  @Path("checkSwfFile")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String checkSwfFile(String fileId);
  /**
   * 获取文件的下载路径，及文件名称
   * xuekun 2015年3月18日 下午2:30:30
   * @param fileId
   * @param cilentIP
   * @return
   */
  @POST
  @Path("getSrcFileDownloadUrlNew/{fileId}/{cilentIP}")
  @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
  public String getSrcFileDownloadUrlNew(@PathParam("fileId") String fileId,@PathParam("cilentIP") String cilentIP);
  
  
  /**
   * 更新文件夹下挂接的文件数，提供外部调用
   * @param originalids 
   * @param flag
   */
  @POST
  @Path("updateFloderHookNumberbatch")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public void updateFloderHookNumberbatch(List<String> originalids,boolean flag);
}
