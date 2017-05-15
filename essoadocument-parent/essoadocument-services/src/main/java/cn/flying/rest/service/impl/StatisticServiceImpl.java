package cn.flying.rest.service.impl;

import java.io.File;
import java.net.URL;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ColumnListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IDocumentStageService;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IStatisticService;
import cn.flying.rest.service.entiry.Statistic;
import cn.flying.rest.service.entiry.StatisticItems;
import cn.flying.rest.service.utils.BuildExcel;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.JFreeChartUtil;
import cn.flying.rest.service.utils.JFreeChartUtil.ChartType;
import cn.flying.rest.service.utils.JdbcUtil;
import cn.flying.rest.service.utils.PdfUtil;
import cn.flying.rest.service.utils.RtfUtil;


/**
 * 文件统计
 * 
 * @author xie
 * 
 */
@Path("statistic")
@Component
public class StatisticServiceImpl extends BasePlatformService implements IStatisticService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private String instanceId;

  @Value("${app.InstanceId}")
  public void setInstanceId(String instanceId) {
    this.instanceId = instanceId;
  }

  public String getInstanceId() {
    return this.instanceId;
  }
  private String url;

  public String getUrl() {
    return url;
  }
  
  @Value("${c3p0.url}")
  public void setUrl(String url) {
    url = url.substring(url.indexOf("://")+3, url.indexOf("?"));
    url = url.substring(url.indexOf("/")+1);
    this.url = url;
  }
  private ILogService logService;

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private MessageWS messageWS;

  public MessageWS getMessageWS() {
    if (messageWS == null) {
      this.messageWS = this.getService(MessageWS.class);
    }
    return messageWS;
  }
  private IFilingService filingService;

  public IFilingService getFilingService() {
    if (this.filingService == null) {
      this.filingService = this.getService(IFilingService.class);
    }
    return filingService;
  }
  private IDocumentStageService documentStageService;

  public IDocumentStageService getDocumentStageService() {
    if (documentStageService == null) {
      this.documentStageService = this.getService(IDocumentStageService.class);
    }
    return documentStageService;
  }

  @Override
  public long getCount() {
    String sql = "select count(1) from ess_statistic";
    Long num = 0L;
    try {
      num = query.query(sql, new ScalarHandler<Long>());
    } catch (SQLException e) {
      e.printStackTrace();
      return num;
    }
    return num;
  }

  @Override
  public String add(HashMap<String, Object> statistic) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String delete(Long[] ids) {
    String sql = "delete from ess_statistic where id=?";
    if (ids == null || ids.length == 0) {
      return "error";
    }
    int[] rows = null;
    Object[][] params = new Object[ids.length][];
    for (int i = 0; i < ids.length; i++) {
      params[i] = new Object[] {ids[i]};
    }
    try {
      rows = query.batch(sql, params);
    } catch (SQLException e) {
      e.printStackTrace();
      return "exception";
    }
    if (rows == null) {
      return "error";
    }
    return "success";
  }

  @Override
  public String update(HashMap<String, Object> statistic) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<Map<String, Object>> list(HashMap<String, Object> condition) {
    String sql = "select * from ess_statistic ";
    List<Map<String, Object>> result = null;
    if (condition.get("page") != null && condition.get("pre") != null) {
      sql += "limit " + condition.get("page") + ", " + condition.get("pre");
    }
    try {
      result = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return result;
  }

  @Override
  public Statistic getStatisticById(Long id) {
    String sql = "select * from ess_statistic where id = ?";
    Statistic statistic = null;
    try {
      statistic = query.query(sql, new BeanHandler<Statistic>(Statistic.class), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return statistic;
  }



  @Override
  public Map<String, Object> saveTitle(Map<String, Object> param) {
    String userId = param.get("userId")+"";
    String ip = param.get("ip")+"";
    Long id = Long.parseLong(param.get("id")+"");
    String title = param.get("title")+"";
    String oldTitle = param.get("oldTitle")+"";
    Map<String, Object> resultMap = new HashMap<String, Object>();
    boolean exist = checkTitleExist(id, title);
    if (exist) {
      resultMap.put("success", false);
      resultMap.put("msg", "方案名称已存在");
      return resultMap;
    }
    // 进行数据的更新或插入操作 返回插入的id
     Long  insertId = insertOrUpdate(id, title);
    // 如果id不等于-1 说明保存成功了
    if (insertId != -1) {
      resultMap.put("success", true);
      resultMap.put("id", insertId);

      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "文件统计");
      log.put("operate", "文件统计：第一步");
      if(id==-1){
      log.put("loginfo", "添加标题【" + title + "】的统计方案");
      }else{
      log.put("loginfo", "修改统计方案【"+oldTitle+"】的统计方案名称为【"+title+"】");
      }
      this.getLogService().saveLog(log);
    } else {
      resultMap.put("success", false);
      resultMap.put("msg", "操作执行异常,请联系管理员！");
    }
    return resultMap;
  }

  /**
   * 查询title是否存在
   * 
   * @param id
   * @param title
   * @return 存在返回true 不存在false
   */
  public boolean checkTitleExist(Long id, String title) {
    String sql = "select count(1) from ess_statistic where binary statisticName = ?";
    // 俩种情况 一种添加id=-1,修改id有值
    if (id != -1) {
      sql += " and id != " + id;
    }
    Long num = 0L;
    try {
      num = query.query(sql, new ScalarHandler<Long>(), title);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    if (num > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 保存统计标题
   * 
   * @param id
   * @param title
   * @return 此统计的唯一标识id值 返回-1保存失败
   */
  private Long insertOrUpdate(Long id, String title) {
    String sql = null;
    int rows = 0;
    try {
      if (id != -1) {
        sql = "update ess_statistic set statisticName = ?,currStep= ? where id=?";
        rows = query.update(sql, new Object[] {title, 2, id});

      } else {
        sql =
            "insert into ess_statistic (statisticName,treeType,colCount,colTitle,currStep,isComplete,classNode,dataNode,isSummary,isLayout)"
                + "values (?,?,?,?,?,?,?,?,?,?)";
        rows = query.update(sql, new Object[] {title, 1, 1, "列1", 2, 0, 1, 1, 0, 1});

      }
      if (rows > 0) {
        sql = "select id from ess_statistic where statisticName=?";
        id = query.query(sql, new ScalarHandler<Long>(), title);
        return id;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return -1L;
    }
    return -1L;
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean saveTreeNodes(Map<String,Object> param) {
    String userId = param.get("userId")+""; 
    String ip = param.get("ip")+""; 
    List<Map<String, Object>> treeNodes = (List<Map<String, Object>>)param.get("nodes"); 
    Long id = Long.parseLong(param.get("id")+"");
    int nodeType = Integer.parseInt(param.get("nodeType")+"");
    String title = param.get("title")+"";
    
    List<StatisticItems> addItems = new ArrayList<StatisticItems>();
    // 查询当前统计信息
    Statistic statistic = getStatisticById(id);
    // 得到当前id统计规则下的所有的统计条目
    List<StatisticItems> oldItems = getStatisticItemsBySidAndNodeType(id, nodeType);
    // 根据已有的条目的树节点信息获得此次需要添加的树节点
    List<Map<String, Object>> addTress = getAddTrees(treeNodes, oldItems);
    // 根据已有条目的信息 获得此次添加节点需要删除的条目
    List<StatisticItems> delItems = getDelItems(treeNodes, oldItems);
    List<Integer> tree_ids = new ArrayList<Integer>();
    // 根据要添加的树节点组装要添加的条目集合
    int colCount = statistic.getColCount();
    for (Map<String, Object> tree : addTress) {
      Integer tree_id = Integer.parseInt((String) tree.get("tree_id"));
      if (tree_ids.contains(tree_id))
        continue;

      // boolean isParent = "true".equals(tree.get("isParent")) ? true : false;
      for (int i = 1; i <= colCount; i++) {
        StatisticItems item = new StatisticItems();
        item.setTree_id(tree_id);
        item.setStatistic_id(id);
        item.setColNo(i);
        item.setNodeType(nodeType);
        addItems.add(item);
      }
      tree_ids.add(tree_id);
    }
    // 数据更新成功返回true
    boolean flag = updateStatistic(addItems, delItems, nodeType, id);
    if (flag) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "文件统计");
      log.put("operate", "文件统计：第二步");
      log.put("loginfo", "保存标题为【" + title+ "】统计方案的统计节点信息");
      this.getLogService().saveLog(log);
    }
    return flag;
  }

  /**
   * 获得统计项 根据统计id 和 节点类型
   * 
   * @param id 统计id
   * @param nodeType 节点类型 （即所属的树类型）
   * @return
   */
  private List<StatisticItems> getStatisticItemsBySidAndNodeType(long id, int nodeType) {
    String sql = "select * from ess_statistic_items where statistic_id = ? and nodeType = ?";
    List<StatisticItems> oldItems = null;
    try {
      oldItems =
          query.query(sql, new BeanListHandler<StatisticItems>(StatisticItems.class), id, nodeType);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    if (oldItems == null)
      oldItems = new ArrayList<StatisticItems>();
    return oldItems;
  }

  /**
   * 根据要填加条目，要删除条目，以及此统计规则的id修改统计数据
   * 
   * @param addItems
   * @param delItems
   * @param id
   * @return true 成功， false 失败
   */
  private boolean updateStatistic(List<StatisticItems> addItems, List<StatisticItems> delItems,
      int nodeType, long id) {
    boolean flag = false;
    try {
      Object[][] params = new Object[addItems.size()][];
      Object[][] params2 = new Object[delItems.size()][];
      int i = 0;
      for (StatisticItems item : addItems) {
        params[i] =
            new Object[] {item.getTree_id(), item.getStatistic_id(), item.getColNo(),
                item.getNodeType()};
        i++;
      }
      int i2 = 0;
      for (StatisticItems item : delItems) {
        params2[i2] = new Object[] {item.getId()};
        i2++;
      }
      // 添加条目（只涉及同一nodetype）
      String sql =
          "insert into ess_statistic_items (tree_id,statistic_id,colNo,nodeType) "
              + "values(?,?,?,?)";
      // 删除条目（只涉及同一nodetype）
      String sql2 = "delete from ess_statistic_items where id=?";
      query.batch(sql, params);
      query.batch(sql2, params2);
      // 还要删除非nodeType的所有条目 因为一个统计项只能存在一种树的统计节点
      String sql3 = "delete from ess_statistic_items where statistic_id = ? and nodeType != ?";
      query.update(sql3, id, nodeType);
      // 删除和添加成功后 修改统计步骤
      int row = 0;
      String sql4 = "update ess_statistic set currStep =? ,treeType=? where id =?";
      row = query.update(sql4, 3, nodeType, id);
      if (row > 0)
        flag = true;

    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
    return flag;
  }

  /**
   * 根据添加树节点和存在的条目信息，得到要删除的条目
   * 
   * @param treeNodes
   * @param oldItems
   * @return 要删除的条目集合
   */
  private List<StatisticItems> getDelItems(List<Map<String, Object>> treeNodes,
      List<StatisticItems> oldItems) {
    List<StatisticItems> delItems = new ArrayList<StatisticItems>();
    // 无重复的树的节点集合
    HashSet<String> tree_ids = new HashSet<String>();
    for (Map<String, Object> tree : treeNodes) {
      tree_ids.add(tree.get("tree_id") + "");
    }
    for (StatisticItems item : oldItems) {
      if (!tree_ids.contains(item.getTree_id() + "")) {
        delItems.add(item);
      }
    }
    return delItems;
  }

  private List<Map<String, Object>> getAddTrees(List<Map<String, Object>> treeNodes,
      List<StatisticItems> oldItems) {
    // 保存需要添加的树的节点信息
    List<Map<String, Object>> addTrees = new ArrayList<Map<String, Object>>();
    // 根据已有的条目获得已添加的树的节点id集合(set集合无重复值)
    HashSet<String> tree_ids = new HashSet<String>();
    for (StatisticItems item : oldItems) {
      tree_ids.add(item.getTree_id() + "");
    }
    // 遍历此次添加的树节点 根据已添加的节点id 获得需要添加的树节点
    for (Map<String, Object> tree : treeNodes) {
      if (!tree_ids.contains(tree.get("tree_id") + "")) {
        addTrees.add(tree);
      }
    }
    return addTrees;
  }

  /**
   * 根据统计规则的id 获得此规则下所有条目
   * 
   * @param id 规则标识
   * @return 统计条目集合
   */
  public List<StatisticItems> getStatisticItemsBySid(long sid) {
    String sql = "select * from ess_statistic_items where statistic_id=?";
    List<StatisticItems> oldItems = null;
    try {
      oldItems = query.query(sql, new BeanListHandler<StatisticItems>(StatisticItems.class), sid);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    if (oldItems == null)
      oldItems = new ArrayList<StatisticItems>();
    return oldItems;
  }

  @Override
  public List<Map<String, Map<String, Object>>> getStatisticShowData(long id) {
    Statistic statistic = new Statistic();
    statistic = getStatisticById(id);
    // 树集合
    List<Map<String, Object>> treeList = new ArrayList<Map<String, Object>>();
    treeList = getTreeList(statistic.getTreeType());
    List<Map<String, Object>> treeListByOrder = new ArrayList<Map<String, Object>>();
    // 得到有顺序的树的集合
    for (Map<String, Object> map : treeList) {
      treeListByOrder.add(map);
      // 迭代每一次添加的节点 优先添加其子节点
      this.addChildNodes(map, treeList, treeListByOrder);
      if (treeListByOrder.size() == treeList.size())
        break;
    }

    // 将节点List 转换为题节点id为key 节点信息为value的 map 并且以树的先后顺序排列id
    Map<String, Map<String, Object>> treeMap = new HashMap<String, Map<String, Object>>();
    for (Map<String, Object> map : treeList) {
      treeMap.put(map.get("id") + "", map);
    }
    // 得到统计信息

    // boolean isLayout = "1".equals(statistic.getIsLayout()) ? true : false;
    // 得到所有条目的信息
    List<StatisticItems> staItems = new ArrayList<StatisticItems>();
    staItems = getStatisticItemsBySid(id);
    // 将查出的统计条目信息 根据tree_id 分组，同一组的条目即为同一行不同列的数据
    Map<String, List<StatisticItems>> groupItem = groupByTreeId(staItems);
    // 缩进量获取
    Map<String, Integer> indentMap = getIndentMap(treeList);
    boolean isLayout = statistic.getIsLayout() == 1 ? true : false;
    // 组装行数据
    List<Map<String, Map<String, Object>>> data = new ArrayList<Map<String, Map<String, Object>>>();

    for (Map<String, Object> tree : treeListByOrder) {
      List<StatisticItems> onerow = groupItem.get(tree.get("id") + "");
      if (null == onerow)
        continue;
      Map<String, Map<String, Object>> oneRowMap =
          createOneRow(onerow, treeMap, statistic, indentMap, isLayout);
      data.add(oneRowMap);
    }
    return data;
  }

  private Map<String, Integer> getIndentMap(List<Map<String, Object>> treeList) {
    Map<String, Integer> indentMap = new HashMap<String, Integer>();
    for (Map<String, Object> tree : treeList) {
      int level = Integer.parseInt(tree.get("level").toString());
      indentMap.put(tree.get("id") + "", level);
    }
    return indentMap;
  }

  /**
   * 按节点的树形结构排序
   * 
   * @param map
   * @param treeList
   * @param treeListByOrder
   */
  private void addChildNodes(Map<String, Object> map, List<Map<String, Object>> treeList,
      List<Map<String, Object>> treeListByOrder) {
    for (Map<String, Object> m : treeList) {
      if (m.get("pId").toString().equals(map.get("id").toString())) {
        treeListByOrder.add(m);
        map.put("isParent", "1");
        addChildNodes(m, treeList, treeListByOrder);
      }
    }
  }

  /**
   * 根据参数数据 拼接一行的显示数据
   * 
   * @param onerow 同一行中的条目信息即同一行的不同列 tree_id相同
   * @param treeMap 以节点tree_id 为key的节点树信息
   * @param statistic 统计信息
   * @param indentMap 相关缩进量
   * @param isLayout 是否缩进
   * @return 拼接出来的一定规定的行数据
   */
  private Map<String, Map<String, Object>> createOneRow(List<StatisticItems> onerow,
      Map<String, Map<String, Object>> treeMap, Statistic statistic,
      Map<String, Integer> indentMap, boolean isLayout) {
    Map<String, Map<String, Object>> rowMap = new HashMap<String, Map<String, Object>>();
    String tree_id = onerow.get(0).getTree_id() + "";

    int treeType = statistic.getTreeType();// 1=>收集范围树 2=>部门树 3=>装置树

    Map<String, Object> cell0 = treeMap.get(tree_id);
    if (isLayout) {
      int count = indentMap.get(tree_id);
      String name = cell0.get("name") + "";
      for (int i = 0; i < count; i++) {
        name = "&nbsp;&nbsp;&nbsp;&nbsp;" + name;
      }
      cell0.put("name", name);
    }
    if (treeType == 2) {
      String isParent = cell0.get("isParent") + "";
      if ("1".equals(isParent)) {
        cell0.put("isnode", "1");
      }
    } else if (treeType == 3) {
      String isParent = cell0.get("isParent") + "";
      if ("1".equals(isParent)) {
        cell0.put("isnode", "1");
      }
    }
    rowMap.put("c0", cell0);
    // 统计条目表 只保存未设置的列第一列（存储id）
    // 根据统计项总数和实际设置统计项信息填充未设置统计项的对应数据
    int colCount = statistic.getColCount();
    List<StatisticItems> items = new ArrayList<StatisticItems>();
    for (int i = 0; i < colCount; i++) {
      StatisticItems itemRow = null;
      for (StatisticItems item : onerow) {
        if ((i + 1) == item.getColNo()) {
          itemRow = item;
          break;
        }
      }
      items.add(i, itemRow);
    }
    for (int i = 0, length = items.size(); i < length; i++) {
      rowMap.put("c" + (i + 1), createCell(items.get(i)));// item.getColNo()
    }
    return rowMap;
  }

  private Map<String, Object> createCell(StatisticItems statisticItems) {
    Map<String, Object> cell = new HashMap<String, Object>();
    if (null != statisticItems) {
      cell.put("id", statisticItems.getId() + "");
      cell.put("nodeType", statisticItems.getNodeType());
      cell.put("text", statisticItems.getCollIdentifier());
    } else {
      cell.put("id", "-1");
      cell.put("sId", "");
      cell.put("text", "");
    }
    return cell;
  }

  private Map<String, List<StatisticItems>> groupByTreeId(List<StatisticItems> staItems) {
    Map<String, List<StatisticItems>> result = new HashMap<String, List<StatisticItems>>();
    HashSet<String> set = new HashSet<String>();
    for (StatisticItems item : staItems) {
      String tree_id = item.getTree_id() + "";
      if (set.contains(tree_id)) {
        result.get(tree_id).add(item);
      } else {
        List<StatisticItems> list = new ArrayList<StatisticItems>();
        list.add(item);
        result.put(tree_id, list);
        set.add(tree_id + "");
      }
    }
    return result;
  }

  /**
   * 得到节点List集合
   * 
   * @param treeType 属于哪张表
   * 
   * @return
   */

  public List<Map<String, Object>> getTreeList(int treeType) {
    List<Map<String, Object>> list = null;
    String sql = "";
    Map<String, Object> map = new HashMap<String, Object>();
    if (treeType == 1) {
      sql = "select * from ess_document_stage order by pId,id";
      map.put("id", 0);
      map.put("sId", 0);
      map.put("pId", -1);
      map.put("name", "文件收集（归档）范围");
      map.put("level", 0);
    } else if (treeType == 2) {
      sql = "select * from ess_participatory order by pId,id";
      map.put("id", 0);
      map.put("sId", 0);
      map.put("pId", -1);
      map.put("name", "参建部门列表");
      map.put("level", 0);
    } else if (treeType == 3) {
      sql = "select * from ess_device order by pId,id";
      map.put("id", 0);
      map.put("sId", 0);
      map.put("pId", -1);
      map.put("name", "装置单元");
      map.put("level", 0);
    }
    list = JdbcUtil.query(query, sql, new MapListHandler());
    if (list == null) {
      list = new ArrayList<Map<String, Object>>();
    }
    list.add(0, map);
    return list;
  }

  @Override
  public String delStatisticAndItems(long id, String userId, String ip) {
    // 先删除条目在删除统计项
    String sql = "delete from ess_statistic_items where statistic_id = ?";
    int row = 0;
    try {
      query.update(sql, id);
      String sql2 = "delete from ess_statistic where id = ?";
      row = query.update(sql2, id);
      if (row > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "文件统计");
        log.put("operate", "文件统计：删除统计项");
        log.put("loginfo", "删除标识为【" + id + "】的统计项");
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除异常，请联系管理员！";
    }
    return "删除失败";
  }

  @Override
  public String batchDelete(String ids, String userId, String ip) {
    // 先删除条目在删除统计项
    //查询一次删除标题
   
   List<String> titleList = new ArrayList<String>();
    int[] row = {};
    try {
      String sql1= "select statisticName from ess_statistic where id in("+ids+")";
      titleList = query.query(sql1, new ColumnListHandler<String>());
      String sql = "delete from ess_statistic_items where statistic_id = ?";
      String[] idArr = ids.split(",");
      Object[][] params = new Object[idArr.length][];
      for (int i = 0; i < idArr.length; i++) {
        params[i] = new Object[] {idArr[i]};
      }
      query.batch(sql, params);
      String sql2 = "delete from ess_statistic where id = ?";
      row = query.batch(sql2, params);
      StringBuilder sb = new StringBuilder();
      for (String s : titleList) {
        sb.append("【"+s+"】");
      }
      if (row.length > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "文件统计");
        log.put("operate", "文件统计：批量删除统计项");
        log.put("loginfo", "删除标题为:" + sb.toString() + "的统计方案");
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "批量删除异常，请联系管理员！";
    }
    return "批量删除失败";
  }

  @Override
  public String saveColTitleAndColCount(HashMap<String, Object> param) {
    String sql = "update ess_statistic set colTitle = ? ,colCount = ? where id = ?";
    int rows = 0;
    try {
      rows =
          query.update(sql,
              new Object[] {param.get("colTitle"), param.get("colCount"), param.get("id")});
      if (rows > 0) {
        return "success";
      }

    } catch (SQLException e) {
      e.printStackTrace();
      return "添加列异常，请联系管理员！";
    }
    return "添加失败，没找到统计项！";
  }

  @Override
  public String delColumnByColNo(HashMap<String, Object> param) {
    int rows = 0;
    try {
      String sql = "delete from ess_statistic_items where statistic_id =? and colNo = ?";
      query.update(sql, new Object[] {param.get("id"), param.get("colNo")});

      String sql2 = "update ess_statistic set colCount=(colCount-1), colTitle= ? where id = ?";
      rows = query.update(sql2, new Object[] {param.get("colTitle"), param.get("id")});
      if (rows > 0) {
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除列异常，请联系管理员！";
    }
    return "删除失败，没有找到的统计项！";
  }

  @Override
  public String deleteCheckColumn(HashMap<String, Object> param) {
    int rows = 0;
    String colTitle = param.get("colTitle") + "";
    String statistic_id = param.get("id") + "";
    int count = colTitle.split(";").length;
    String colNos = param.get("colNo") + "";
    try {
      String sql =
          "delete from ess_statistic_items where statistic_id =? and colNo in(" + colNos + ")";
      query.update(sql, new Object[] {statistic_id});
      String[] colArr = colNos.split(",");
      String sql3 =
          "update ess_statistic_items set colNo=colNo-1 where statistic_id = ? and colNo > ?";
      for (int i = colArr.length - 1; i >= 0; i--) {
        query.update(sql3, new Object[] {statistic_id, colArr[i]});
      }

      String sql2 = "update ess_statistic set colCount=?, colTitle= ? where id = ?";
      rows = query.update(sql2, new Object[] {count, colTitle, statistic_id});
      if (rows > 0) {
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除列异常，请联系管理员！";
    }
    return "删除失败，没有找到的统计项！";
  }

  @Override
  public StatisticItems getStatisticItemById(long id) {
    String sql = "select * from ess_statistic_items where id = ?";
    StatisticItems item = new StatisticItems();
    try {
      item = query.query(sql, new BeanHandler<StatisticItems>(StatisticItems.class), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return item;
    }
    return item;
  }

  @Override
  public List<Map<String, Object>> getFieldListByTreeIdAndTreeType(int treeId, int treeType) {
    // 对于文件收集范围级别的 是节点元数据和系统元数据并存的所以在查找字段是时需要加上节点id
    List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    try {
      if (treeType == 1) {
        String sql = "select * from ess_document_metadata where stageId = ? or isSystem =? and code not in('stageCode','deviceCode','participatoryCode','documentCode','engineeringCode','stageId')";
        list = query.query(sql, new MapListHandler(), treeId, 0);
      } else {
        String sql = "select * from ess_document_metadata where isSystem = ? and code not in('stageCode','deviceCode','participatoryCode','documentCode','engineeringCode','stageId')";
        list = query.query(sql, new MapListHandler(), 0);
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return list;
    }
    return list;
  }

  @Override
  public Map<String, Object> getTreeNodeByTreeIdAndTreeType(int treeId, int treeType) {
    String sql = "";
    if (treeType == 1) {
      sql = "select * from ess_document_stage where id = ?";
    } else if (treeType == 2) {
      sql = "select * from ess_participatory where id = ?";
    } else if (treeType == 3) {
      sql = "select * from ess_device where id = ?";
    }
    Map<String, Object> map = new HashMap<String, Object>();
    try {
      map = query.query(sql, new MapHandler(), treeId);
    } catch (SQLException e) {
      e.printStackTrace();
      return map;
    }
    return map;
  }

  @Override
  public String saveStatisticItemRules(Map<String, Object> param) {
    // 先把保存的信息提取
    String statisticId = param.get("statisticId") + "";// 统计主体id
    String title = param.get("title")+"";//标题
    String countObj = param.get("countObj")+"";//统计项
    String itemId = param.get("itemId") + ""; // 要保存的条目标识
    String treeId = param.get("treeId") + ""; // 对应的树节点标识
    String treeType = param.get("treeType") + "";// 节点树的类型
    String colNo = param.get("colNo") + "";// 列数
    String countField = param.get("countField") + "";// 统计字段
    String countType = param.get("countType") + "";// 统计的方式
    String countIdentity = param.get("countIdentity") + "";// 统计的标识
    String cncondition = param.get("cncondition") + "";// 显示的过滤条件
    String encondition = param.get("encondition") + "";// 用于拼接sql的过滤条件
    String condition = param.get("condition") + "";// 过滤条件集合
    String ruleCondition = null;
    if (null != condition && !"".equals(condition)) {
      List<String> conditionList = Arrays.asList(condition.split("@"));
      Condition cond = new Condition();
      if (null != conditionList && !conditionList.isEmpty()) {
        cond = Condition.getConditionByList(conditionList);
        ruleCondition = cond.toSQLString();
      }
    }
    // 保存数据有俩种情况 itemId为-1时说明此列信息还没有保存 插入 不为-1为更新
    try {
      if ("-1".equals(itemId)) {
        String sql =
            "insert into ess_statistic_items (tree_id,statistic_id,nodeType,colNo,ruleField,ruleMethod,collIdentifier,ruleCondition,cncondition,encondition)"
                + "values (?,?,?,?,?,?,?,?,?,?)";
        Object[] par =
            {treeId, statisticId, treeType, colNo, countField, countType, countIdentity,
                ruleCondition, cncondition, encondition};
        int rows = 0;
        rows = query.update(sql, par);
        if (rows > 0) {
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", param.get("ip"));
          log.put("userid", param.get("userId"));
          log.put("module", "文件统计");
          log.put("operate", "文件统计：第三步");
          log.put("loginfo", "设置标题为【" + title + "】的统计方案的统计项【"+countObj+"】的第【"+colNo+"】列的统计规则【" + countIdentity + "】过滤条件【"
              + cncondition + "】");
          this.getLogService().saveLog(log);
          return "success";
        }

      } else {
        String sql2 =
            "update ess_statistic_items set ruleField=?,ruleMethod=?,collIdentifier=?,ruleCondition=?,cncondition=?,encondition=?"
                + " where id=?";
        Object[] par2 =
            {countField, countType, countIdentity, ruleCondition, cncondition, encondition, itemId};
        int rows2 = 0;
        rows2 = query.update(sql2, par2);
        if (rows2 > 0) {
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", param.get("ip"));
          log.put("userid", param.get("userId"));
          log.put("module", "文件统计");
          log.put("operate", "文件统计：第三步");
          log.put("loginfo", "设置标题为【" + title + "】的统计方案的统计项【"+countObj+"】的第【"+colNo+"】列的统计规则【" + countIdentity + "】过滤条件【"
              + cncondition + "】");
          this.getLogService().saveLog(log);
          return "success";
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存数据异常，请联系管理员！";
    }
    return "没有找到对应数据,请联系管理员！";
  }

  @Override
  public String saveOptions(Map<String, Object> param) {
    String title = param.get("title")+"";
    String sql =
        "update ess_statistic set currStep = ?,isComplete=?,classNode =?,dataNode=?,isSummary=?,isLayout=?,pic=? where id=?";
    Object[] par =
        {4, 1, param.get("classNode"), param.get("dataNode"), param.get("isSummary"),
            param.get("isLayout"), param.get("pic"), param.get("statisticId")};
    int rows = 0;
    try {
      rows = query.update(sql, par);
      if (rows > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：第四步");
        log.put("loginfo", "保存标题为【" + title + "】的统计的布局设置");
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存异常，请联系管理员！";
    }
    return "保存失败，请联系管理员！";
  }

  @Override
  public String updateOption(Map<String, Object> param) {
    String sql = "update ess_statistic set classNode =?,dataNode=?,isLayout=? where id=?";
    Object[] par =
        {param.get("classNode"), param.get("dataNode"), param.get("isLayout"), param.get("id")};
    int rows = 0;
    try {
      rows = query.update(sql, par);
      if (rows > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：第四步");
        log.put("loginfo", "修改标识为【" + param.get("id") + "】的统计的布局设置");
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存异常，请联系管理员！";
    }
    return "保存失败，请联系管理员！";
  }

  // 得到当前路径
  private String getPath() {
    URL url = getClass().getProtectionDomain().getCodeSource().getLocation();
    String path = url.toString();// 格式 file:D:/ url.getPath() 格式 /D:/
    int index = path.indexOf("WEB-INF");
    path = path.substring(6, index) + "data/";
    File filePath = new File(path);
    if (!filePath.exists()) {
      filePath.mkdirs();
    }
    return path;
  }

  @Override
  public Map<String, Object> exeStatistic(Map<String, Object> param) {
    long id = Long.parseLong((param.get("id") + ""));
    String version = param.get("version") + "";
    Statistic statistic = new Statistic();
    statistic = getStatisticById(id);
    int nodeType = statistic.getTreeType();
    // 第一步 获得所有统计项
    List<StatisticItems> items = getStatisticItemsBySidAndNodeType(id, nodeType);
    // 第二部 将所有统计项的统计规则计算结果 并按行保存 即tree_id为key 条目即不同列的统计规则为 map 不同列 对应不同统计值 为value
    Map<String, Map<String, String>> staticticMap = getStaticticResultSortTreeId(items);
    // 得树集合无序
    List<Map<String, Object>> treeList = new ArrayList<Map<String, Object>>();
    treeList = getTreeList(nodeType);
    List<Map<String, Object>> treeListByOrder = new ArrayList<Map<String, Object>>();
    // 递归 得到有顺序的树的集合
    for (Map<String, Object> map : treeList) {
      treeListByOrder.add(map);
      addChildNodes(map, treeList, treeListByOrder);
      if (treeListByOrder.size() == treeList.size())
        break;
    }
    // 缩进量获取
    Map<String, Integer> indentMap = getIndentMap(treeList);
    boolean isLayout = statistic.getIsLayout() == 1 ? true : false;

    // 根据有序树显示统计条目顺序排列
    Map<String, String> pathNameMap = new HashMap<String, String>();// 名称重复处理
    // 汇总统计项
    boolean isSummary = statistic.getIsSummary() == 1 ? true : false;
    if (isSummary) {
      this.executeSummary(staticticMap, items, treeListByOrder, nodeType);
    }

    Map<String, Map<String, String>> resultsOrder =
        new LinkedHashMap<String, Map<String, String>>();
    for (Map<String, Object> tree : treeListByOrder) {// 用businessTree循环，保证显示行顺序
      String tree_id = tree.get("id") + "";
      String name = tree.get("name") + "";
      if (isLayout) {
        int count = indentMap.get(tree_id);
        for (int i = 0; i < count; i++) {
          name = "  " + name;
        }
      }
      Map<String, String> row = staticticMap.get(tree_id);
      if (row == null) {
        continue;
      }
      pathNameMap.put(tree_id, name);
      resultsOrder.put(tree_id, row);
    }
    Map<String, Map<String, String>> writes = getCollectionResultShow(statistic, resultsOrder);

    String[] colNames = statistic.getColTitle().split(";");
    List<String> titles = Arrays.asList(colNames);
    BuildExcel build = null;
    String filename = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    String imageFileName = this.getPath() + "image" + filename + ".jpg";
    File imageFile = null;
    String pic = statistic.getPic();
    if (pic != null && !"none".equals(pic)) {
      // 添加统计图
      imageFile = new File(imageFileName);
      int charType = 14;
      if ("2pie".equals(pic)) {
        charType = ChartType.MULTIPLE_PIE_CHART.getValue();
      } else if ("3pie".equals(pic)) {
        charType = ChartType.MULTIPLE_PIE_CHART3D.getValue();
      } else if ("2line".equals(pic)) {
        charType = ChartType.LINE_CHART_VERTICAL.getValue();
      } else if ("3line".equals(pic)) {
        charType = ChartType.LINE_CHART3D_VERTICAL.getValue();
      } else if ("2bar".equals(pic)) {
        charType = ChartType.BER_CHART_VERTICAL.getValue();
      } else if ("3bar".equals(pic)) {
        charType = ChartType.BER_CHART3D_VERTICAL.getValue();
      }
      JFreeChartUtil.createChart(imageFile, charType, "文件统计", "文件类型", "数量",
          getDataset(writes, pathNameMap, titles), true, 600);
    }
    boolean flag = false;
    if ("2003".equals(version)) {
      build = BuildExcel.getInstance(true);
      filename += ".xls";
      flag = build.write(writes, pathNameMap, titles, this.getPath() + filename, imageFile);
    }

    else if ("pdf".equals(version)) {
      filename += ".pdf";
      flag = PdfUtil.write(writes, pathNameMap, titles, this.getPath() + filename, imageFile);
    } else if ("rtf".equals(version)) {
      filename += ".rtf";
      flag = RtfUtil.write(writes, pathNameMap, titles, this.getPath() + filename, imageFile);
    }
    Map<String, Object> retMap = new HashMap<String, Object>();
    String fileFullPath = this.getServiceIP() + filename;
    if (flag) {

      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", param.get("userId") + "");
      messMap.put("recevier", param.get("userId") + "");
      messMap.put("sendTime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", filename + "统计完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + fileFullPath + "')");
      messMap.put("handlerUrl", "esdocument/" + this.getInstanceId()
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);

      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", param.get("ip") + "");
      log.put("userid", param.get("userId") + "");
      log.put("module", "文件统计");
      log.put("operate", "文件统计：导出统计数据");
      log.put("loginfo", "导出为【" + filename + "" + "】的统计文件");
      this.getLogService().saveLog(log);

      retMap.put("msg", "success");

    } else {
      retMap.put("msg", "统计失败,请联系管理员！");
    }
    return retMap;
  }

  /**
   * 汇总
   * 
   * @param results
   * @param items 当前统计所有统计条目
   * @param treeListByOrder 有序的树集合
   */
  private void executeSummary(Map<String, Map<String, String>> results, List<StatisticItems> items,
      List<Map<String, Object>> treeListByOrder, int treeType) {
    Map<String, Map<String, Object>> treeIdMap = new HashMap<String, Map<String, Object>>();
    for (Map<String, Object> map : treeListByOrder) {
      treeIdMap.put(map.get("id") + "", map);
    }
    if (treeType == 1) {
      // 判断当前条目的节点是否具备汇总条件 （即为收集范围非文件节点，或父节点）
      for (StatisticItems i : items) {
        String tree_id = i.getTree_id() + "";
        String colNo = i.getColNo() + "";
        Map<String, Object> node = treeIdMap.get(tree_id);
        if ("1".equals(node.get("isnode") + "")) {
          // 符合汇总条件查询当前节点下所有的文件类型节点id
          List<Integer> treeIds = getChildernIsFile(node);
          if (results.get(tree_id) == null) {
            Map<String, String> map = new HashMap<String, String>();
            map.put(colNo, "0");
            results.put(tree_id, map);
          }
          if (treeIds != null && treeIds.size() > 0) {
            for (Integer id : treeIds) {
              if (results.containsKey(id + "")) {
                String value = results.get(id + "").get(colNo);
                Long count = 0L;
                Long count2 = 0L;
                if (value != null)
                  count = Long.parseLong(value);
                String oldvalue = results.get(tree_id).get(colNo);
                if (oldvalue != null)
                  count2 = Long.parseLong(oldvalue);
                results.get(tree_id).put(colNo, (count + count2) + "");
              }
            }
          }
        }
      }
    }else {
      Map<String, Map<String, String>> SummaryTempMap = new HashMap<String, Map<String, String>>();
      for (String  treeId : results.keySet()) {
        Map<String,Object> node = treeIdMap.get(treeId);
        String treepId = node.get("pId")+"";
       this.iteratorTreeSummary(treeId,treepId,treeIdMap,results,SummaryTempMap);      
      }
      results.putAll(SummaryTempMap);
    }
  }
  private void iteratorTreeSummary(String treeId,String treepId, Map<String, Map<String, Object>> treeIdMap,Map<String,Map<String, String>> results, Map<String, Map<String, String>> summaryTempMap){
    if("0".equals(treepId)) return;
      Map<String,String> row = results.get(treeId);
      if(summaryTempMap.get(treepId)==null){
        Map<String, String> map = new HashMap<String, String>();
        for(String key : row.keySet()){
          map.put(key, row.get(key));
        }
        summaryTempMap.put(treepId, map);
      } else{
        Map<String, String> map =  summaryTempMap.get(treepId);
        for(String key : row.keySet()){
          Long count = 0L;
          if(map.get(key)!=null){
           count = Long.parseLong(map.get(key)+"");
          }
         Long count2 =Long.parseLong(row.get(key)+"");
          map.put(key,(count+count2)+"");
        }
        summaryTempMap.put(treepId, map);
      }
      
      Map<String,Object> node = treeIdMap.get(treepId);
      treepId = node.get("pId")+"";
      iteratorTreeSummary(treeId,treepId,treeIdMap,results,summaryTempMap);
  }
  private List<Integer> getChildernIsFile(Map<String, Object> node) {
    String id_seq = node.get("id_seq") + "" + node.get("id") + ".";
    String sql = "select id from ess_document_stage where id_seq like ? and isnode=0";
    try {
      List<Integer> treeIdList = query.query(sql, new ColumnListHandler<Integer>("id"), id_seq);
      return treeIdList;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * 获取dataset用于生成统计图表
   * 
   * @param writes
   * @param pathNameMap
   * @param titles
   * @return
   */
  private CategoryDataset getDataset(Map<String, Map<String, String>> writes,
      Map<String, String> pathNameMap, List<String> titles) {
    Iterator<Entry<String, Map<String, String>>> iterMain = writes.entrySet().iterator();
    DefaultCategoryDataset d = new DefaultCategoryDataset();
    while (iterMain.hasNext()) {
      Entry<String, Map<String, String>> entryMain = iterMain.next();
      String keyMain = entryMain.getKey();
      String keyMainName = pathNameMap.get(keyMain);
      // String keyMainName = this.getFullDisplayPathforCnForYear(keyMain);
      Map<String, String> itemMap = entryMain.getValue();
      for (int i = 0; i < titles.size(); i++) {
        String colNo = String.valueOf(i + 1);
        if (itemMap.containsKey(colNo)) {
          d.addValue(itemMap.get(colNo) == null ? 0 : Double.parseDouble(itemMap.get(colNo)),
              titles.get(i), keyMainName);
        } else {
          d.addValue(0, titles.get(i), keyMainName);
        }
      }
    }
    return d;
  }

  /**
   * 树分类节点与结构节点显示与否
   * 
   * @param statistic
   * @param results
   * @return
   */
  private Map<String, Map<String, String>> getCollectionResultShow(Statistic statistic,
      Map<String, Map<String, String>> results) {
    boolean containClassNode = "1".equals(statistic.getClassNode()) ? true : false;
    boolean containDataNode = "1".equals(statistic.getDataNode()) ? true : false;
    if (containClassNode && containDataNode || !containClassNode && !containDataNode) {
      return results;
    }
    boolean isSummary = "1".equals(statistic.getIsSummary()) ? true : false;
    Map<String, Map<String, String>> showResults = new LinkedHashMap<String, Map<String, String>>();
    Iterator<String> it = results.keySet().iterator();
    while (it.hasNext()) {
      String keyPath = it.next();
      String tree_id = showResults.get(keyPath).get("tree_id");
      if (!containClassNode && "0".equals(tree_id) || !containDataNode && !"0".equals(tree_id)
          && isSummary) {
        continue;
      }
      showResults.put(keyPath, results.get(keyPath));
    }
    return showResults;
  }


  /**
   * 按树节点 生成统计结果的 map
   * 
   * @param items 所有统计项
   * @return
   */
  private Map<String, Map<String, String>> getStaticticResultSortTreeId(List<StatisticItems> items) {
    Map<String, Map<String, String>> results = new HashMap<String, Map<String, String>>();
    for (StatisticItems item : items) {
      String tree_id = item.getTree_id() + "";
      // 对此条目进行统一
      if (null != item.getRuleField() && !"".equals(item.getRuleField())
          && null != item.getRuleMethod() && !"".equals(item.getRuleMethod())) {
        String fieldValue = statisticOneField(item);

        if (results.get(tree_id) != null) {
          results.get(tree_id).put(item.getColNo() + "", fieldValue);
        } else {
          Map<String, String> colMap = new HashMap<String, String>();
          colMap.put(item.getColNo() + "", fieldValue);
          results.put(tree_id, colMap);
        }
      }

    }
    return results;
  }

  /**
   * 根据统计项 获得统计值
   * 
   * @param item
   * @return
   */
  private String statisticOneField(StatisticItems item) {
    String method = item.getRuleMethod();
    String field = item.getRuleField();
    String condition = item.getRuleCondition();
    int treeId = item.getTree_id();
    int treeType = item.getNodeType();
    String function = "";
    if ("distinct".equals(method)) {
      function = "count( distinct(" + field + ") )";
    } else {
      function = method + "(" + field + ")";
    }
    StringBuilder sql = new StringBuilder("select " + function + " from ess_document where 1=1 ");
    Object rows = null;
    try {
      Map<String, Object> treeMap = getTreeNodeByTreeIdAndTreeType(treeId, treeType);
      String code = "";
      if (treeMap != null) {
        if (treeType == 1) {
          // 对与文件收集范围的几点数据获取 有特殊性必须获得此节点下所有子节点在获取数据
          // xiewenda 2015/4/1统计字段只允许是系统字段 避免节点下个性化字段太复杂
          List<Map<String, Object>> childNodeList = getChildNodesByTree(treeMap);
          code = "'" + treeMap.get("code") + "'";
          for (Map<String, Object> map : childNodeList) {
            code += ",'" + map.get("code") + "'";
          }
          sql.append(" and stageCode in (" + code + ")");
          /*
           * int num=1; String pTable = "esp_"+treeMap.get("id"); if(judgeIfExistsTable(pTable)){
           * sql.append(" select t.* from ess_document t "); sql.append(" left join ");
           * sql.append(pTable+" t"+num); sql.append(" on t.id=t"+num+".documentId");
           * sql.append(" where t.stageCode='"+treeMap.get("code")+"'"); }else{
           * sql.append(" select t.* from ess_document t");
           * sql.append(" where t.stageCode='"+treeMap.get("code")+"'"); } for (Map<String, Object>
           * map : childNodeList) { code+=",'"+map.get("code")+"'"; String table = "esp_" +
           * map.get("id"); num++; if (judgeIfExistsTable(table)) {
           * sql.append(" union all select t.* from ess_document t "); sql.append(" left join ");
           * sql.append(table+" t"+num); sql.append(" on t.id=t"+num+".documentId");
           * sql.append(" where t.stageCode='"+map.get("code")+"'"); }else{
           * sql.append(" union all select t.* from ess_document t");
           * sql.append(" where t.stageCode='"+map.get("code")+"'"); } }
           * sql.append(") as a where stageCode(?)");
           */
        } else if (treeType == 2) {
          code = treeMap.get("code") + "";
          sql.append(" and participatoryCode= '" + code + "'");
        } else if (treeType == 3) {
          code = treeMap.get("deviceNo") + "";
          sql.append(" and deviceCode= '" + code + "'");
        }
        if (condition != null && !"".equals(condition)) {
          sql.append(" and " + condition);
        }
        // System.out.println(code);
        // System.out.println(sql.toString());
        rows = query.query(sql.toString(), new ScalarHandler<Object>());
        System.out.println(rows);
        if (rows != null) {
          return rows + "";
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return null;
  }

  private List<Map<String, Object>> getChildNodesByTree(Map<String, Object> treeMap) {
    // 父节点下的子节点字段标识
    String child_id_seq = treeMap.get("id_seq") + "" + treeMap.get("id") + ".";
    String sql = "select * from ess_document_stage where  id_seq like '%" + child_id_seq + "%'";
    try {
      List<Map<String, Object>> nodeList = query.query(sql, new MapListHandler());
      return nodeList;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  // 通过收集范围的节点id获得其编码值
  private String getCodeByIdandType(int treeId, int treeType) {
    String sql = "";
    if (treeType == 1) {
      sql = "select code from ess_document_stage where id=?";
    } else if (treeType == 2) {
      sql = "select code from ess_participatory where id=?";
    } else if (treeType == 3) {
      sql = "select deviceNo from ess_device where id=?";
    }

    String code = null;
    try {
      code = query.query(sql, new ScalarHandler<String>(), treeId);
    } catch (SQLException e) {
      e.printStackTrace();
      return code;
    }
    return code;
  }

  /**
   * 判断表在数据库中是否存在
   * 
   * @param tableName
   * @return
   */
  private boolean judgeIfExistsTable(String tableName) {
    String databaseName = this.getUrl();
    String sql =
        " select count(1) cnt from information_schema.tables where table_name=? and table_schema='"+databaseName+"'";
    boolean flag = false;
    try {
      Long cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] {tableName});
      if (cnt != null && !cnt.equals(Long.valueOf(0l))) {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  private String getServiceIP() {
    String url =
        this.getNamingService().findApp(this.getInstanceId(), "statistic", this.getServiceId(),
            this.getToken());
    String temp = url.substring(url.indexOf("rest"), url.length());
    String outFile = url.replace(temp, "data/");
    return outFile;
  }

  @Override
  public String justRuleExists(Map<String, Object> param) {
    String sql =
        "select count(*) from ess_statistic_items where statistic_id = ? and  (ruleField is not NULL AND ruleField!='')";
    try {
      Long row = query.query(sql, new ScalarHandler<Long>(), param.get("statisticId"));
      if (row > 0) {
        return "true";
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return "false";
  }

  @Override
  public String addColItems(HashMap<String, Object> param) {
    List<Map<String, Object>> data = (List<Map<String, Object>>) param.get("data");
    String treeType = param.get("treeType") + "";
    String colNo = param.get("colCount") + "";
    String id = param.get("id") + "";
    String sql = "update ess_statistic set colTitle = ? ,colCount = ? where id = ?";
    String sql1 =
        "insert into ess_statistic_items (tree_id,statistic_id,nodeType,colNo) values(?,?,?,?)";
    int rows[] = {};
    int row = 0;
    Object[][] params = new Object[data.size()][];
    for (int i = 0; i < data.size(); i++) {
      params[i] = new Object[] {data.get(i).get("tree_id") + "", id, treeType, colNo};
    }
    try {
      row = query.update(sql, new Object[] {param.get("colTitle"), colNo, id});
      if (row > 0) {
        rows = query.batch(sql1, params);
      }
      if (rows.length > 0) {
        return "success";
      }

    } catch (SQLException e) {
      e.printStackTrace();
      return "添加列异常，请联系管理员！";
    }
    return "添加失败，没找到统计项！";
  }
  
  //gengqianfeng 分组统计start
  @Override
  public List<Map<String, Object>> getGroupOptions(long stageId) {
    String parentIds = "";
    if (stageId > 0) {
      parentIds = this.getFilingService().getParentStageIds(stageId);
    }
    String sql = "select code,name from ess_document_metadata where isSystem=0 ";
    if (!"".equals(parentIds)) {
      sql = sql + " OR  FIND_IN_SET(stageId,'" + parentIds + "')";
    }
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler());
      if (list != null && list.size() > 0) {
        return list;
      }
      return new ArrayList<Map<String, Object>>();
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public Map<String, Object> getStatisticsGroups(long statistics_id) {
    String sql = "select * from ess_statistic_group where statistic_id=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), statistics_id);
      if (map == null || map.isEmpty()) {
        return new HashMap<String, Object>();
      }
      Map<String, Object> stage = this.getDocumentStageService().get(
          Long.parseLong(map.get("tree_id") + ""));
      map.put("stageName", stage.get("name") + "");
      Statistic s = this.getStatisticById(statistics_id);
      map.put("statisticName", s.getStatisticName());
      return map;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String saveGroupStageId(Map<String, Object> group) {
    String sql_insert = "INSERT INTO ess_statistic_group(statistic_id,tree_id) VALUES(?,?)";
    String sql_update = "UPDATE ess_statistic_group SET tree_id=? WHERE statistic_id=? ";
    try {
      String statisticId = group.get("statisticsId") + "";
      String stageId = group.get("stageId") + "";
      Map<String, Object> map = this.getStatisticsGroups(Long
          .parseLong(statisticId));
      if (map == null || map.isEmpty()) {
        long id = query.insert(sql_insert, new ScalarHandler<Long>(),
            statisticId, stageId);
        if (id > 0) {
          this.updateGroupStatisticsStep(statisticId, 3);
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", group.get("ip"));
          log.put("userid", group.get("userId"));
          log.put("module", "文件统计");
          log.put("operate", "文件统计：第二步");
          log.put("loginfo", "添加分组统计标示为【" + group.get("statisticsId")
              + "】的分组条目");
          this.getLogService().saveLog(log);
          return "";
        }
      } else {
        int row = query.update(sql_update, stageId, statisticId);
        if (row > 0) {
          return "";
        }
      }
      return "保存分组节点失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存分组节点异常";
    }
  }

  @Override
  public String saveGroup(Map<String, Object> group) {
    String sql = "update ess_statistic_group set groups=?,havings=? WHERE statistic_id=? and tree_id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { group.get("groups"), group.get("havings"),
              group.get("statisticsId"), group.get("stageId") });
      if (row == 1) {
        this.updateGroupStatisticsStep(group.get("statisticsId") + "", 4);
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", group.get("ip"));
        log.put("userid", group.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：第三步");
        log.put("loginfo", "保存分组统计标示为【" + group.get("statisticsId") + "】的分组条目");
        this.getLogService().saveLog(log);
        return "";
      }
      return "保存分组失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存分组异常";
    }
  }

  @Override
  public String getStatisticsFields(Map<String, Object> field) {
    String sql = "select ruleField from ess_statistic_items WHERE statistic_id=? and tree_id=? order by colNo asc ";
    try {
      List<String> list = null;
      list = query.query(sql, new ColumnListHandler<String>(),
          field.get("statistic_id"), field.get("tree_id"));
      String ruleFields = "";
      Statistic s = this.getStatisticById(Long.parseLong(field
          .get("statistic_id") + ""));
      String[] titles = s.getColTitle().split(";");
      for (int i = 0; i < list.size(); i++) {
        String ruleField = list.get(i);
        String title = (titles.length > i && !"".equals(s.getColTitle())) ? titles[i]
            : "列" + (i + 1);
        ruleFields = ruleFields + "," + ruleField + ";" + title;
      }
      return ruleFields.length() > 0 ? ruleFields.substring(1) : "";
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String saveFields(Map<String, Object> field) {
    String statisticsId = field.get("statisticsId") + "";
    String stageId = field.get("stageId") + "";
    field.put("statistic_id", statisticsId);
    field.put("tree_id", stageId);
    String oldField = this.getStatisticsFields(field);
    String newField = field.get("fields") + "";
    String updateField = "";
    String delField = "";
    String insertField = "";
    String[] old_arr = oldField.split(",");
    String[] new_arr = newField.split(",");
    for (int i = 0; i < new_arr.length; i++) {
      boolean flag = false;
      for (int j = 0; j < old_arr.length; j++) {
        if (new_arr[i].split(":")[0].equals(old_arr[j].split(";")[0])) {
          updateField += "," + new_arr[i];// 要修改的
          old_arr = this.deleteArrById(old_arr, j);
          j = old_arr.length;
          flag = true;
        }
      }
      if (!flag) {
        insertField += "," + new_arr[i];// 新增的
      }
    }
    // 要删除的
    for (String str : old_arr) {
      delField += "," + str.split(";")[0];
    }
    if (!"".equals(delField) && delField.length() > 0) {
      if (this.deleteStatisticsFields(statisticsId, stageId,
          delField.substring(1))) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", field.get("ip"));
        log.put("userid", field.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：第四步");
        log.put("loginfo",
            "刪除分组统计标示为【" + statisticsId + "】,统计字段为【" + delField.substring(1)
                + "】的统计项条目");
        this.getLogService().saveLog(log);
      }
    }
    if (!"".equals(updateField) && updateField.length() > 0) {
      if (this.updateStatisticsFields(statisticsId, stageId,
          updateField.substring(1))) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", field.get("ip"));
        log.put("userid", field.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：第四步");
        log.put("loginfo", "修改分组统计标示为【" + statisticsId + "】,统计字段为【"
            + updateField.substring(1) + "】的统计项条目");
        this.getLogService().saveLog(log);
      }
    }
    if (!"".equals(insertField) && insertField.length() > 0) {
      if (this.insertStatisticsFields(statisticsId, stageId,
          insertField.substring(1))) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", field.get("ip"));
        log.put("userid", field.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：第四步");
        log.put("loginfo", "添加分组统计标示为【" + statisticsId + "】,统计字段为【"
            + insertField.substring(1) + "】的统计项条目");
        this.getLogService().saveLog(log);
      }
    }
    String whereMes = this.saveGroupWheres(field);
    if (!"".equals(whereMes)) {
      return whereMes;
    }
    this.updateGroupStatisticsStep(statisticsId, 5);
    return "";
  }

  private String[] deleteArrById(String[] arr, int index) {
    String returnStr = "";
    for (int i = 0; i < arr.length; i++) {
      if (i != index) {
        returnStr += "," + arr[i];
      }
    }
    return (returnStr.length() > 0) ? returnStr.substring(1).split(",")
        : new String[0];
  }

  private String saveGroupWheres(Map<String, Object> field) {
    String sql = "update ess_statistic_group set wheres=? WHERE statistic_id=? and tree_id=? ";
    try {
      int row = query.update(
          sql,
          new Object[] { field.get("wheres"), field.get("statisticsId"),
              field.get("stageId") });
      if (row == 1) {
        return "";
      }
      return "保存统计条件失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存统计条件异常";
    }
  }

  private boolean deleteStatisticsFields(String statisticsId, String stageId,
      String del_str) {
    String sql = "DELETE FROM ess_statistic_items WHERE statistic_id=? and tree_id=? AND ruleField=? ";
    try {
      String[] del_arr = del_str.split(",");
      Object[][] obj = new Object[del_arr.length][3];
      for (int i = 0; i < del_arr.length; i++) {
        obj[i] = new Object[] { statisticsId, stageId, del_arr[i].split(":")[0] };
      }
      int[] row = query.batch(sql, obj);
      if (row.length > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean insertStatisticsFields(String statisticsId, String stageId,
      String insert_str) {
    String sql = "insert INTO ess_statistic_items(nodeType,statistic_id,tree_id,colNo,ruleField,ruleMethod) values(1,?,?,?,?,'sum') ";
    try {
      String[] insert_arr = insert_str.split(",");
      Object[][] obj = new Object[insert_arr.length][4];
      for (int i = 0; i < insert_arr.length; i++) {
        String[] arr = insert_arr[i].split(":");
        obj[i] = new Object[] { statisticsId, stageId, arr[1], arr[0] };
      }
      long row = query.insertBatch(sql, new ScalarHandler<Long>(), obj);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean updateStatisticsFields(String statisticsId, String stageId,
      String update_str) {
    String sql = "UPDATE ess_statistic_items set colNo=? WHERE statistic_id=? AND tree_id=? AND ruleField=? ";
    try {
      String[] update_arr = update_str.split(",");
      Object[][] obj = new Object[update_arr.length][4];
      for (int i = 0; i < update_arr.length; i++) {
        String[] arr = update_arr[i].split(":");
        obj[i] = new Object[] { arr[1], statisticsId, stageId, arr[0] };
      }
      int[] row = query.batch(sql, obj);
      if (row.length > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public List<Map<String, Object>> getStatisticsEditFields(
      Map<String, Object> field) {
    String sql = "select i.id,i.ruleField,m.name,i.colNo,i.ruleMethod,i.collIdentifier from ess_statistic_items as i "
        + "LEFT JOIN ess_document_metadata as m ON i.ruleField=m.code "
        + "WHERE i.statistic_id=? and i.tree_id=? order by i.colNo asc ";
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql, new MapListHandler(), field.get("statistic_id"),
          field.get("tree_id"));
      if (list != null && list.size() > 0) {
        Statistic s = this.getStatisticById(Long.parseLong(field
            .get("statistic_id") + ""));
        String[] titles = s.getColTitle().split(";");
        if (titles.length == list.size()) {
          List<Map<String, Object>> returnList = new ArrayList<Map<String, Object>>();
          for (int i = 0; i < list.size(); i++) {
            Map<String, Object> map = list.get(i);
            map.put("title", titles[i]);
            returnList.add(map);
          }
          return returnList;
        }
        return list;
      }
      return new ArrayList<Map<String, Object>>();
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean updateGroupStatisticsStep(String statisticsId, long stepNum) {
    String sql = "update ess_statistic set currStep=? WHERE id=? ";
    try {
      int row = query.update(sql, stepNum, statisticsId);
      if (row > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public String updateStatisticsFieldCount(Map<String, Object> itemCount) {
    String sql = "update ess_statistic_items SET ruleMethod=?,collIdentifier=? where id=? ";
    try {
      int row = query.update(sql, itemCount.get("ruleMethod"),
          itemCount.get("collIdentifier"), itemCount.get("id"));
      if (row > 0) {
        return "";
      }
      return "修改字段统计规则失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "修改字段统计规则异常";
    }
  }

  @Override
  public String groupOver(Map<String, Object> over) {
    String sql = "update ess_statistic SET isSummary=?,pic=?,isComplete=? where id=? ";
    try {
      int row = query.update(sql, over.get("isSummary"), over.get("pic"), 1,
          over.get("id"));
      if (row > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", over.get("ip"));
        log.put("userid", over.get("userId"));
        log.put("module", "文件统计");
        log.put("operate", "文件统计：统计完成");
        log.put("loginfo", "保存分组统计标示为【" + over.get("id") + "】的统计条目");
        this.getLogService().saveLog(log);
        return "";
      }
      return "分组统计失败";
    } catch (SQLException e) {
      e.printStackTrace();
      return "分组统计异常";
    }
  }

  @Override
  public String delStatisticAndGroup(long id) {
    try {
      Map<String, Object> group = this.getStatisticsGroups(id);
      if (group == null || group.isEmpty()) {
        return "true";
      } else if (group.get("groups") == null && group.get("havings") == null
          && group.get("wheres") == null) {
        return "true";
      } else {
        String sql_del = "update ess_statistic_group set groups='',havings='',wheres='' WHERE statistic_id=?";
        int row = query.update(sql_del, id);
        if (row > 0) {
          String sql_query = "select count(id) from ess_statistic_items WHERE statistic_id=? LIMIT 0,1";
          long cnt = query.query(sql_query, new ScalarHandler<Long>(), id);
          if (cnt > 0) {
            String sql_del2 = "DELETE from ess_statistic_items WHERE statistic_id=?";
            int row2 = query.update(sql_del2, id);
            if (row2 > 0) {
              return "true";
            } else {
              return "删除统计字段失败！";
            }
          } else {
            return "true";
          }
        } else {
          return "删除统计分组失败！";
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }
  @SuppressWarnings("unchecked")
  @Override
  public Map<String, Object> exeGroupStatistic(Map<String, Object> param) {
    long id = Long.parseLong((param.get("id") + ""));
    String version = param.get("version") + "";
    Statistic statistic = new Statistic();
    statistic = getStatisticById(id);
    int nodeType = statistic.getTreeType();

    // 获取统计项
    List<StatisticItems> items = getStatisticItemsBySidAndNodeType(id, nodeType);

    // 获取统计结果列表
    Map<String, Object> returnObj = getStaticticGroupResultSortTreeId(items,
        statistic.getId());

    Map<String, Map<String, String>> statisticMap = (Map<String, Map<String, String>>) returnObj
        .get("writes");
    List<Map<String, Object>> trees = (List<Map<String, Object>>) returnObj
        .get("trees");

    Map<String, Map<String, String>> results = new LinkedHashMap<String, Map<String, String>>();
    Map<String, String> pathNameMap = new HashMap<String, String>();// 名称重复处理
    // path不重复
    for (Map<String, Object> tree : trees) {// 用businessTree循环，保证显示行顺序
      String tree_id = tree.get("id") + "";
      Map<String, String> row = statisticMap.get(tree_id);
      if (null == row) {
        continue;
      }
      String name = tree.get("name") + "";
      pathNameMap.put(tree_id, name);
      results.put(tree_id, row);
    }

    Map<String, Map<String, String>> writes = getCollectionResultShow(
        statistic, results);

    String[] colNames = statistic.getColTitle().split(";");
    List<String> titles = Arrays.asList(colNames);
    BuildExcel build = null;
    String filename = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    String imageFileName = this.getPath() + "image" + filename + ".jpg";
    File imageFile = null;
    String pic = statistic.getPic();
    if (pic != null && !"none".equals(pic)) {
      // 添加统计图
      imageFile = new File(imageFileName);
      int charType = 14;
      if ("2pie".equals(pic)) {
        charType = ChartType.MULTIPLE_PIE_CHART.getValue();
      } else if ("3pie".equals(pic)) {
        charType = ChartType.MULTIPLE_PIE_CHART3D.getValue();
      } else if ("2line".equals(pic)) {
        charType = ChartType.LINE_CHART_VERTICAL.getValue();
      } else if ("3line".equals(pic)) {
        charType = ChartType.LINE_CHART3D_VERTICAL.getValue();
      } else if ("2bar".equals(pic)) {
        charType = ChartType.BER_CHART_VERTICAL.getValue();
      } else if ("3bar".equals(pic)) {
        charType = ChartType.BER_CHART3D_VERTICAL.getValue();
      }
      JFreeChartUtil.createChart(imageFile, charType, "分组统计", "分组类型", "数量",
          getDataset(writes, pathNameMap, titles), true, 800);
    }
    boolean flag = false;
    if ("2003".equals(version)) {
      build = BuildExcel.getInstance(true);
      filename += ".xls";
      flag = build.write(writes, pathNameMap, titles,
          this.getPath() + filename, imageFile);
    }

    else if ("pdf".equals(version)) {
      filename += ".pdf";
      flag = PdfUtil.write(writes, pathNameMap, titles, this.getPath()
          + filename, imageFile);
    } else if ("rtf".equals(version)) {
      filename += ".rtf";
      flag = RtfUtil.write(writes, pathNameMap, titles, this.getPath()
          + filename, imageFile);
    }
    Map<String, Object> retMap = new HashMap<String, Object>();
    String fileFullPath = this.getServiceIP() + filename;
    if (flag) {

      Map<String, String> messMap = new HashMap<String, String>();
      messMap.put("sender", param.get("userId") + "");
      messMap.put("recevier", param.get("userId") + "");
      messMap.put("sendTime",
          new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
      messMap.put("status", "No");
      messMap.put("workFlowId", "-14");
      messMap.put("workFlowStatus", "Run");
      messMap.put("content", filename + "统计完毕，请及时点击下载");
      messMap.put("style", "color:red");
      messMap.put("handler", "$.messageFun.downFile('" + fileFullPath + "')");
      messMap.put("handlerUrl", "esdocument/" + this.getInstanceId()
          + "/x/ESMessage/handlerMsgPage");
      messMap.put("stepId", "0");
      getMessageWS().addMessage(messMap);

      // 日志添加
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", param.get("ip") + "");
      log.put("userid", param.get("userId") + "");
      log.put("module", "文件统计");
      log.put("operate", "文件统计：导出统计数据");
      log.put("loginfo", "导出为【" + filename + "" + "】的统计文件");
      this.getLogService().saveLog(log);

      retMap.put("msg", "success");

    } else {
      retMap.put("msg", "统计失败,请联系管理员！");
    }
    return retMap;
  }

  private Map<String, Object> getStaticticGroupResultSortTreeId(
      List<StatisticItems> items, long statisticsId) {
    Map<String, Map<String, String>> writes = new HashMap<String, Map<String, String>>();
    String tree_id = "";
    String fields = "";
    String wheres = "";
    String groups = "";
    String havings = "";
    String esp = "";
    Map<String, String> colNo = new HashMap<String, String>();
    for (StatisticItems item : items) {
      tree_id = item.getTree_id() + "";
      // 对此条目进行统一
      if (null != item.getRuleField() && !"".equals(item.getRuleField())
          && null != item.getRuleMethod() && !"".equals(item.getRuleMethod())) {
        String method = item.getRuleMethod();
        String field = item.getRuleField();
        if ("distinct".equals(method)) {
          fields += ",count( distinct(" + field + ") )";
        } else {
          fields += "," + method + "(" + field + ")";
        }
        colNo.put(field, item.getColNo() + "");
      }
    }
    fields = fields.length() > 0 ? fields.substring(1) : "";
    Map<String, Object> group = this.getStatisticsGroups(statisticsId);
    if (!"".equals(group.get("wheres") + "") && group.get("wheres") != null) {
      Condition condition = Condition.getCondition(group.get("wheres")
          .toString().split("&"));
      wheres = condition.toSQLString();
    }
    groups = group.get("groups") + "";
    if (!"".equals(group.get("havings") + "") && group.get("havings") != null) {
      Condition condition = Condition.getCondition(group.get("havings")
          .toString().split("&"));
      havings = condition.toSQLString();
    }
    List<Map<String, Object>> returnList = this.getFilingService()
        .getChildrenStageIds(Long.parseLong(tree_id));
    List<String> childrenStageId = new ArrayList<String>();
    for (Map<String, Object> map : returnList) {
      String mapId = map.get("id").toString();
      if (this.tableIfExists(mapId)) {
        childrenStageId.add(mapId);
      }
    }
    if (childrenStageId.size() > 0 && childrenStageId != null) {
      String colName = this.getFilingService().getColsCode(
          this.getFilingService().getParentStageIds(Long.parseLong(tree_id)));
      esp += " LEFT JOIN (";
      for (String childrenStage : childrenStageId) {
        esp += " (select " + colName + " from esp_" + childrenStage
            + ") UNION ";
      }
      esp = esp.substring(0, esp.lastIndexOf("UNION"));
      esp += ") as esp ON dc.id=esp.documentId ";
    }
    StringBuilder sql = new StringBuilder("select dc.id," + group.get("groups")
        + "," + fields + " from ess_document as dc " + esp + " where stageId="
        + tree_id);
    if (!"".equals(wheres)) {
      sql.append(" and " + wheres);
    }
    if (!"".equals(groups)) {
      sql.append(" group by " + groups);
    }
    if (!"".equals(havings)) {
      sql.append(" having " + havings);
    }
    System.out.println(sql.toString());
    Map<String, Object> returnObj = new HashMap<String, Object>();
    List<Map<String, Object>> treeList = new ArrayList<Map<String, Object>>();
    try {
      List<Map<String, Object>> list = null;
      list = query.query(sql.toString(), new MapListHandler());
      if (list != null && list.size() > 0) {
        for (Map<String, Object> map : list) {

          Map<String, Object> treeObj = new HashMap<String, Object>();
          String[] gs = groups.split(",");
          treeObj.put("id", map.get("id") + "");
          String name = "";
          for (int i = 0; i < gs.length; i++) {
            treeObj.put(gs[i], map.get(gs[i]) + "");
            name += "-" + map.get(gs[i]);
          }
          treeObj.put("name", name.length() > 0 ? name.substring(1) : "");
          treeList.add(treeObj);

          Map<String, String> w = new HashMap<String, String>();
          String[] cols = fields.split(",");
          for (int i = 0; i < cols.length; i++) {
            w.put(colNo.get(cols[i]), map.get(cols[i]) + "");
          }
          writes.put(map.get("id") + "", w);
        }
        returnObj.put("trees", treeList);
        returnObj.put("writes", writes);
        return returnObj;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return returnObj;
  }
  private boolean tableIfExists(String stageId) {
    String databaseName = this.getUrl();
    String sql = "select TABLE_NAME from information_schema.tables where  TABLE_NAME = 'esp_"
        + stageId + "' and TABLE_SCHEMA='"+databaseName+"' ";
    try {
      Map<String, Object> table = query.query(sql, new MapHandler());
      if (table != null && table.get("TABLE_NAME") != null) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }
  //gengqianfeng 分组统计end

}
