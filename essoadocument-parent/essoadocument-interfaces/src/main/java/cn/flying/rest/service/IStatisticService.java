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

import cn.flying.rest.service.entiry.Statistic;
import cn.flying.rest.service.entiry.StatisticItems;
import cn.flying.rest.service.utils.MediaTypeEx;


/**
 * 文件统计
 * 
 * @author xiewenda
 */
public abstract interface IStatisticService {


  /**
   * 获得所有的数据条数
   * 
   * @return 数据条数
   */
  @GET
  @Path("count")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount();

  /**
   * 添加新的统计规则
   * 
   * @param statistic 对应的添加数据
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String add(HashMap<String, Object> statistic);

  /**
   * 删除统计规则
   * 
   * @param ids 规定规范要删除的id数组
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("delete")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delete(Long ids[]);

  /**
   * 更新统计规则
   * 
   * @param statistic 更新的规范数据以及要更新的规范的唯一标示id
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String update(HashMap<String, Object> statistic);

  /**
   * 获得统计规则的列表
   * 
   * @param condition 根据条件获取（分页条件，查询条件等）
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @POST
  @Path("list")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> list(HashMap<String, Object> condition);

  /**
   * 根据id获得统计规则
   * 
   * @param id 统计规则的唯一标识
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @GET
  @Path("getStatisticById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Statistic getStatisticById(@PathParam("id") Long id);

  /**
   * 保存统计标题 统计第一步
   * 
   * @param id 统计规则唯一标识
   * @param title 统计标题
   * @return 保存的id和操作是否成功的提示 集合
   */
  @POST
  @Path("saveTitle")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> saveTitle(Map<String, Object> param);

  @POST
  @Path("saveTreeNodes")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public boolean saveTreeNodes(Map<String, Object> param);

  /**
   * 通过统计方案ID获取统计项数据用于显示。
   * 
   * @param Id
   * @return
   */
  @POST
  @Path("getStatisticShowData/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Map<String, Object>>> getStatisticShowData(@PathParam("id") long id);

  /**
   * 通过统计方案id删除统计项以及条目
   * 
   * @param id
   * @return
   */
  @POST
  @Path("delStatisticAndItems/{id}/{userId}/{ip}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delStatisticAndItems(@PathParam("id") long id,@PathParam("userId") String userId,@PathParam("ip") String ip);

  /**
   * 根据统计规则的id 获得所有统计条目
   * 
   * @param id 统计规则的唯一标识
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @POST
  @Path("getStatisticItemsBySid/{sid}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<StatisticItems> getStatisticItemsBySid(@PathParam("sid") long sid);

  /**
   * 根据删除统计的ids 批量删除数据
   * 
   * @param ids 以id集合
   * @return 成功返success 失败返回错误信息
   */
  @POST
  @Path("batchDelete/{ids}/{userId}/{ip}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String batchDelete(@PathParam("ids") String ids,@PathParam("userId") String userId,@PathParam("ip") String ip);

  /**
   * 保存添加的列和列标题
   * 
   * @param 参数值
   * @return 成功返success 失败返回错误信息
   */
  @POST
  @Path("saveColTitleAndColCount")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveColTitleAndColCount(HashMap<String, Object> param);

  /**
   * 根据列号删除统计项条目 （也就是删除一列的统计信息）
   * 
   * @param 参数值
   * @return 成功返success 失败返回错误信息
   */
  @POST
  @Path("delColumnByColNo")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delColumnByColNo(HashMap<String, Object> param);
  
  /**
   * 根据选中的列号删除统计项条目 （也就是删除列号的统计信息）
   * 
   * @param 参数值
   * @return 成功返success 失败返回错误信息
   */
  @POST
  @Path("deleteCheckColumn")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteCheckColumn(HashMap<String, Object> param);

  /**
   * 根据统计条目的id 获得统计信息
   * 
   * @param id 统计规则的唯一标识
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @GET
  @Path("getStatisticItemById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public StatisticItems getStatisticItemById(@PathParam("id") long id);

  /**
   * 根据节点id 和 具体表 得到此节点下对应的元数据
   * 
   * @param treeId 节点id
   * @param treeType 表类型
   * @return 元数据集合
   */
  @POST
  @Path("getFieldListByTreeIdAndTreeType/{treeId}/{treeType}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getFieldListByTreeIdAndTreeType(@PathParam("treeId") int treeId,
      @PathParam("treeType") int treeType);

  /**
   * 根据节点id 和 树类型 获得节点的信息
   * 
   * @param treeId
   * @param treeType
   * @return
   */
  @POST
  @Path("getTreeNodeByTreeIdAndTreeType/{treeId}/{treeType}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getTreeNodeByTreeIdAndTreeType(@PathParam("treeId") int treeId,
      @PathParam("treeType") int treeType);
  
  @POST
  @Path("saveStatisticItemRules")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveStatisticItemRules(Map<String,Object> param);
  
  @POST
  @Path("saveOptions")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveOptions(Map<String,Object> param);
  
  @POST
  @Path("updateOption")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateOption(Map<String,Object> param);
  
  @POST
  @Path("exeStatistic")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String,Object> exeStatistic(Map<String,Object> param);
  
  @POST
  @Path("getTreeList")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String,Object>> getTreeList(int type);
  
 //gengqianfeng 分组统计代码 start
  /**
   * 判断一个统计中是否存在有效的统计规则
   * @param param
   * @return
   */
  @POST
  @Path("justRuleExists")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String justRuleExists(Map<String,Object> param);
  /**
   * 添加列条目
   * 
   * @param 参数值
   * @return 成功返success 失败返回错误信息
   */
  @POST
  @Path("addColItems")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String addColItems(HashMap<String, Object> param);
  
  /**
   * 获取分组下拉选项列表
   * 
   * @param stageId
   * @return
   */
  @GET
  @Path("getGroupOptions/{stageId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getGroupOptions(
      @PathParam("stageId") long stageId);

  /**
   * 获取分组对象
   * 
   * @param statistics_id
   * @return
   */
  @GET
  @Path("getStatisticsGroups/{statistics_id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getStatisticsGroups(
      @PathParam("statistics_id") long statistics_id);

  /**
   * 保存分组统计节点id
   * 
   * @param group
   * @return
   */
  @POST
  @Path("saveGroupStageId")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveGroupStageId(Map<String, Object> group);

  /**
   * 保存分组对象
   * 
   * @param group
   * @return
   */
  @POST
  @Path("saveGroup")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveGroup(Map<String, Object> group);

  /**
   * 获取统计字段
   * 
   * @param filed
   * @return
   */
  @POST
  @Path("getStatisticsFields")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getStatisticsFields(Map<String, Object> field);

  /**
   * 保存统计字段
   * 
   * @param field
   * @return
   */
  @POST
  @Path("saveFields")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveFields(Map<String, Object> field);

  /**
   * 获取统计字段编辑列表
   * 
   * @param field
   * @return
   */
  @POST
  @Path("getStatisticsEditFields")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getStatisticsEditFields(
      Map<String, Object> field);

  /**
   * 修改统计字段统计规则
   * 
   * @param itemCount
   * @return
   */
  @POST
  @Path("updateStatisticsFieldCount")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String updateStatisticsFieldCount(Map<String, Object> itemCount);

  /**
   * 分组统计完成
   * 
   * @param over
   * @return
   */
  @POST
  @Path("groupOver")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String groupOver(Map<String, Object> over);

  /**
   * 执行分组统计
   * 
   * @param param
   * @return
   */
  @POST
  @Path("exeGroupStatistic")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> exeGroupStatistic(Map<String, Object> param);

  /**
   * 改变收集范围清除数据
   * 
   * @param id
   * @return
   */
  @GET
  @Path("delStatisticAndGroup/{id}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delStatisticAndGroup(@PathParam("id") long id);
//gengqianfeng 分组统计代码 end
}
