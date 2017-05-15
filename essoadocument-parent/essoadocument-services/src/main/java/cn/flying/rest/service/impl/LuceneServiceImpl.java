package cn.flying.rest.service.impl;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.ResultSet;
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
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.KeyedHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.fileupload.FileItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.file.IMainFileServer;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IDocumentsCollectionService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.ILuceneService;
import cn.flying.rest.service.IndexStoreService;
import cn.flying.rest.service.entiry.EssIndexNodes;
import cn.flying.rest.service.entiry.EssLucene;
import cn.flying.rest.service.utils.DateUtil;
import cn.flying.rest.service.utils.DeleteFileUtil;
import cn.flying.rest.service.utils.FulltextWriter;
import cn.flying.rest.service.utils.ModuleWriteManager;
import cn.flying.rest.service.utils.StaticUtil;
import cn.flying.rest.service.utils.TagExcelImportUtil;
import cn.flying.rest.service.utils.ThreadPoolManager;

/**
 * @see 全文索引库管理web层接口的实现类
 * 
 */
@Path("lucene")
@Component
public class LuceneServiceImpl extends BasePlatformService implements ILuceneService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
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
  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private IDocumentsCollectionService documentsCollectionService;

  public IDocumentsCollectionService getDocumentsCollectionService() {
    if (this.documentsCollectionService == null) {
      this.documentsCollectionService = this.getService(IDocumentsCollectionService.class);
    }
    return documentsCollectionService;
  }

  private IndexStoreService indexstoreservice;
  private CreateIndex createindex;

  @Resource
  public void setCreateindex(CreateIndex createindex) {
    this.createindex = createindex;
  }


  private IndexStoreService getIndexstoreservice() {
    if (indexstoreservice == null) {
      indexstoreservice = this.getService(IndexStoreService.class);
    }
    return indexstoreservice;
  }
  
  private IMainFileServer iMainFileServer;
  
  private IMainFileServer getMainFileServer(){
  	if(iMainFileServer == null){
  		iMainFileServer = this.getService(IMainFileServer.class) ;
  	}
  	return iMainFileServer ;
  }

  @Override
  public Map<String, Object> getCreatedNodesList(Map<String, String> map) {
    // 查找ess_index_node表，获取节点的path，启用的状态，索引库所在的路径
    String nodePath = map.get("nodePath");
    if (nodePath == null || "".equals(nodePath.trim()) || "0".equals(nodePath.trim())
        || "null".equals(nodePath.trim())) {
      nodePath = null;
    }
    int limit = Integer.parseInt(map.get("limit"));
    int start =
        Integer.parseInt((map.get("start") == null || "".equals(map.get("start")) ? "0" : map
            .get("start")));
    Map<String, Object> mapList = this.getCreatedNodesList(start, limit, nodePath);
    Map<String, Object> maprtn = new HashMap<String, Object>();
    @SuppressWarnings("unchecked")
    List<Map<String, String>> lst = (List<Map<String, String>>) mapList.get("list");
    Map<String, String> titleMap = this.getFullTreeNodeName(lst, "treeNodeId");
    for (Map<String, String> m : lst) {
      m.put("fullName", titleMap.get(String.valueOf(m.get("treeNodeId"))));
    }
    maprtn.put("total", mapList.get("total"));
    maprtn.put("list", lst);
    return maprtn;
  }

  @Override
  public Map<String, Object> getNoCreateNodesList(Map<String, String> map) {
    String nodePath = map.get("nodePath");
    int limit = Integer.parseInt(map.get("limit"));
    int start =
        Integer.parseInt((map.get("start") == null || "".equals(map.get("start")) ? "0" : map
            .get("start")));
    if (nodePath == null || "0".equals(nodePath.trim()) || "".equals(nodePath.trim())
        || "null".equals(nodePath.trim())) {
      nodePath = null;
    }
    Map<String, Object> mapList = this.getNoCreateNodesList(start, limit, nodePath);
    Map<String, Object> maprtn = new HashMap<String, Object>();
    maprtn.put("total", mapList.get("total"));
    @SuppressWarnings("unchecked")
    List<Map<String, String>> lst = (List<Map<String, String>>) mapList.get("list");
    Map<String, String> titleMap = this.getFullTreeNodeName(lst, "id");
    for (Map<String, String> m : lst) {
      m.put("estitle", titleMap.get(String.valueOf(m.get("ID"))));
    }
    maprtn.put("list", lst);
    return maprtn;
  }

  public Map<String, Object> getNoCreateNodesList(int start, int limit, String id_seq) {
    StringBuffer sql = new StringBuffer();
    sql.append("SELECT * FROM ess_document_stage WHERE IFNULL(ISCREATEINDEX,0) <> 1 AND ISNODE=0 AND ID_SEQ >0 ");
    if (id_seq != null) {
      sql.append(" AND concat(ID_SEQ,ID,'.') LIKE '" + id_seq + ".%' ");
    }
    if (limit > 0) {
      sql.append(" limit " + start + "," + limit);
    }
    Map<String, Object> maprtn = new HashMap<String, Object>();
    try {
      List<Map<String, Object>> lst = query.query(sql.toString(), new MapListHandler());
      maprtn.put("list", lst);
      String countSql =
          "SELECT COUNT(*) FROM ess_document_stage WHERE IFNULL(ISCREATEINDEX,0) <> 1 AND ISNODE=0 AND ID_SEQ >0";
      if (id_seq != null) {
        countSql = countSql + " AND concat(ID_SEQ,ID,'.') LIKE '" + id_seq + ".%' ";
      }
      // int count = query.query(countSql.toString(), new
      // BeanHandler<Integer>(Integer.class));
      // String count = query.query(countSql, new
      // BeanHandler<String>(String.class));
      int row = query.query(countSql.toString(), new ResultSetHandler<Integer>() {
        public Integer handle(ResultSet rs) throws SQLException {
          rs.next();
          return rs.getInt(1);
        }
      });
      maprtn.put("total", row + "");
      return maprtn;
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return maprtn;
    }
  }

  @Override
  public Map<String, Object> createIndexStore(Map<String, String> map) {
    Map<String, Object> returnMap = new HashMap<String, Object>();
    // 获取配置的索引库路径
    String fullIndexPath = StaticUtil.fullIndexPath;
    if (fullIndexPath == null || "".equals(fullIndexPath)) {
      fullIndexPath = this.getFullIndexPath();
      if (fullIndexPath == null || "".equals(fullIndexPath)) {
        returnMap.put("successful", "false");
        return returnMap;
      }
      StaticUtil.fullIndexPath = fullIndexPath;
    }
    String successful = "true";
    String ids = map.get("ids");
    if (ids == null || "".equals(ids.trim()) || "all".equals(ids)) {
      returnMap.put("successful", "false");
      return returnMap;
    }
    String[] idsArray = ids.split(",");
    //判断索引库是否存在
    List<Map<String, Object>> result=getIndexNodeForTreeNodes(ids.replace("@1", ""));
    if(result!=null&&result.size()>0){
      returnMap.put("successful", "部分索引库已存在，请重新选择！");
      return returnMap;
    }
    /** 创建索引库线程 **/
    class createIndexThread implements Callable<Boolean> {
      String[] idsArray;
      /** 待创建索引的树节点ID@结构ID **/
      Map<String, String> map;
      /** 前台传递下来的参数 **/
      String instanceId;

      /** 应用实例编号 **/
      CountDownLatch latchcount; //rongying 20150508 添加计数器

      createIndexThread(String[] idsArray, Map<String, String> map, String instanceId,CountDownLatch latchcount) {
        this.idsArray = idsArray;
        this.map = map;
        this.instanceId = instanceId;
        this.latchcount = latchcount;
      }

      public Boolean call() throws Exception {
        return createIndexs(idsArray, map, instanceId , latchcount);
      }
    }
    if (idsArray.length > 0) {
      /** 调用线程进行创建索引库创建 **/
      ThreadPoolManager m = ThreadPoolManager.getInstance();
      try {
    	  CountDownLatch latch = new CountDownLatch(idsArray.length);//两个工人的协作
    	/** lujixiang 20150415 为每个节点创建新的线程  **/
    	for (String tempId : idsArray) {
			String[] tempIdArray = {tempId};
    		m.runTaskforFree(new createIndexThread(tempIdArray, map, String.valueOf(0), latch));
		}
    	latch.await();//调用此方法会一直阻塞当前线程，直到计时器的值为0
      } catch (InterruptedException e) {
        e.printStackTrace();
      } catch (ExecutionException e) {
        e.printStackTrace();
      }
    }
    returnMap.put("successful", successful);
    //xiewenda 加入日志
    String nodename = (map.get("nodename")+"").replace(",","】,【");
    if ("true".equals(successful) && !"true".equals(map.get("reCreate"))) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("userIp"));
      log.put("userid", map.get("userId"));
      log.put("module", "索引库管理");
      log.put("operate", "索引库管理：创建索引");
      log.put("loginfo", "为节点【" + nodename + "】创建索引库");
      this.getLogService().saveLog(log);
    }

    return returnMap;

  }

  private boolean createIndexs(String[] idsArray, Map<String, String> map, String instanceId,CountDownLatch latchcount) {
    SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");// 设置日期格式
    String createDate = null;
    StringBuffer successBuffer = new StringBuffer();
    StringBuffer failureBuffer = new StringBuffer();
    List<String> structureIds = new ArrayList<String>();
    for (String idAll : idsArray) {
      String[] idArray = idAll.split("@");
      String nodeId = idArray[0];
      String id_structure = idArray[1];
      boolean flag = createindex.createOneNodeIndex(instanceId, nodeId, id_structure, getMainFileServer(),latchcount);
      if (flag) {
        successBuffer.append(idAll).append(",");
        // 写入ess_index_node 表，更新 ess_business_treenodes 表
        EssIndexNodes esIndexNode = new EssIndexNodes();
        esIndexNode.setStruId(id_structure);
        esIndexNode.setNodeAddress(StaticUtil.fullIndexPath + "/" + instanceId + "/" + nodeId);
        esIndexNode.setActiveStatus(1);
        esIndexNode.setTreeNodeId(Integer.parseInt(nodeId));
        createDate = df.format(new Date());
        esIndexNode.setCreateTime(createDate);
        esIndexNode.setChildStruId("");
        this.updateIdentifier(esIndexNode);
        structureIds.add(nodeId + "_" + id_structure);
      } else {
        failureBuffer.append(idAll).append(",");
      }
    }
    return true;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map<String, Object> createAllIndexStore(Map<String, String> mapParam) {
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    // 创建索引库，修改为创建目录树节点下的所有库
    String nodePath = null;
    if (!"0".equals(mapParam.get("ids"))) {
      nodePath = mapParam.get("ids");
    }
    Map<String, String> map = new HashMap<String, String>();
    Map<String, Object> mapList = this.getNoCreateNodesList(0, 0, nodePath);
    List<Map<String, String>> idsList = new ArrayList<Map<String, String>>();
    idsList = (List<Map<String, String>>) mapList.get("list");
    String ids = "";
    if(idsList.isEmpty()){
        rtnMap.put("successful", "没有需要创建索引库的节点！");
        return rtnMap;
    }
    for (Map<String, String> m : idsList) {
      if(String.valueOf(m.get("id_structure"))==null || !"".equals(String.valueOf(m.get("id_structure")))){
        ids = ids + String.valueOf(m.get("id")) + "@1"+",";
      }else{
        ids = ids + String.valueOf(m.get("id")) + "@" + String.valueOf(m.get("id_structure")) + ",";
      }
    }
    map.put("ids", ids.substring(0, ids.length() - 1));
    map.put("nodename",mapParam.get("nodename"));
    map.put("userId", mapParam.get("userId"));
    map.put("userIp", mapParam.get("userIp"));
    rtnMap = this.createIndexStore(map);
    return rtnMap;
  }

  @Override
  public Map<String, Object> deleteIndexStore(Map<String, String> map) {
    String ids = map.get("ids");
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    if (ids == null || "".equals(ids.trim()) || "all".equals(ids)) {
      rtnMap.put("successful", "没有要删除的索引库！");
      return rtnMap;
    }
    String newIds = "";
    for (String oneId : ids.split(",")) {
      newIds = newIds + oneId.split("@")[2] + ",";
    }
    ids = newIds;
    if (ids.endsWith(",")) {
      ids = ids.substring(0, ids.lastIndexOf(","));
    }
    String[] idsArray = ids.split(",");
    Map<String, Object> valMap = this.deleteIndexStore(ids);
    boolean success = (Boolean) valMap.get("successful");
    if (!success) {
      rtnMap.put("successful", "false");
      return rtnMap;
    }
    @SuppressWarnings("unchecked")
    Map<String, String> addressMap = (Map<String, String>) valMap.get("addressMap");
    DeleteFileUtil deleteFile = new DeleteFileUtil();
    String successful = "true";
    String dir = null;
    String[] dirs = null;
    for (String id : idsArray) {
      dir =
          addressMap.get(id).substring(addressMap.get(id).lastIndexOf("/") + 1,
              addressMap.get(id).length());
      dirs = dir.split("_");
      // gaoyd getIndexStoreWSForSingle().closeIndexStore(dirs[1],
      // dirs[0]);
      // 此处开始删除索引库的文件夹
      boolean result = false;
      result = deleteFile.DeleteFolder(addressMap.get(id));
      if (!result) {
        successful = "false";
      }
    }
    rtnMap.put("successful", successful);
  //xiewenda 加入日志
    String nodename = map.get("nodename").toString().replace(",","】,【");
    if ("true".equals(successful) && !"true".equals(map.get("reCreate"))) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", map.get("userIp"));
      log.put("userid", map.get("userId"));
      log.put("module", "索引库管理");
      log.put("operate", "索引库管理：删除索引");
      log.put("loginfo", "删除节点【" + nodename + "】的索引库");
      this.getLogService().saveLog(log);
    }
    return rtnMap;
  }

  public Map<String, Object> deleteIndexStore(String ids) {
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    Map<String, String> addressMap = new HashMap<String, String>();
    String searchSql =
        "select id,nodeAddress,struId,treeNodeId from ess_index_nodes where id in(" + ids + ")";
    String treeIds = "";
    boolean successful = true;
    try {
      List<Map<String, Object>> list = query.query(searchSql, new MapListHandler());
      for (Map<String, Object> map : list) {
        addressMap.put(String.valueOf(map.get("id")), map.get("nodeAddress").toString());
        treeIds += map.get("treeNodeId") + ",";
      }
      String delSql = "delete from ess_index_nodes where id in(" + ids + ")";
      query.update(delSql);
      String updateSql =
          "update ess_document_stage set iscreateindex = 0 where id in("
              + treeIds.substring(0, treeIds.length() - 1) + ")";
      query.update(updateSql);

    } catch (SQLException e) {
      successful = false;
      e.printStackTrace();
    }
    rtnMap.put("successful", successful);
    rtnMap.put("addressMap", addressMap);
    return rtnMap;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map<String, Object> deleteAllIndexStore(Map<String, String> mapParam) {
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    String nodePath = null;
    // 清空索引库，修改为清空目录树节点下的所有库
    if (!"0".equals(mapParam.get("ids"))) {
      nodePath = mapParam.get("ids");
    }
    Map<String, String> map = new HashMap<String, String>();
    Map<String, Object> mapList = this.getCreatedNodesList(0, 0, nodePath);
    List<Map<String, String>> idsList = new ArrayList<Map<String, String>>();
    idsList = (List<Map<String, String>>) mapList.get("list");
    String ids = "";
    for (Map<String, String> m : idsList) {
      ids =
          ids + String.valueOf(m.get("treeNodeId")) + "@" + String.valueOf(m.get("struId")) + "@"
              + String.valueOf(m.get("id")) + ",";
    }
    if (!"".equals(ids))
      map.put("ids", ids.substring(0, ids.length() - 1));
    map.put("userId", mapParam.get("userId"));
    map.put("userIp", mapParam.get("userIp"));
    map.put("nodename", mapParam.get("nodeNameAll"));
    rtnMap = this.deleteIndexStore(map);
    return rtnMap;
  }

  @Override
  public Map<String, Object> reCreateIndexStore(Map<String, String> mapParam) {
    // 重建索引库 就是先删除，再创建
    String ids = mapParam.get("ids");
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    // 这里也要加控制，一旦正在建立，就别重建了
    if (StaticUtil.luceneCreatingIndex) {
      // 正在建立索引，不允许建立
      rtnMap.put("successful", "false");
      return rtnMap;
    }
    if (ids == null || "".equals(ids.trim()) || "all".equals(ids)) {
      rtnMap.put("successful", "false");
      return rtnMap;
    }
    //为了重建索引库使不显示删除索引的日志 给参数中加个重建标识
    mapParam.put("reCreate", "true");
    String delStr = (String) this.deleteIndexStore(mapParam).get("successful");
    
    if (!"true".equals(delStr)) {
      rtnMap.put("successful", "false");
      return rtnMap;
    }
    String createStr = (String) this.createIndexStore(mapParam).get("successful");
    
    if (!"true".equals(createStr)) {
      rtnMap.put("successful", "false");
      return rtnMap;
    }
    rtnMap.put("successful", "true");
    //xiewenda 加入日志
    String nodename = mapParam.get("nodename").toString().replace(",","】,【");
    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", mapParam.get("userIp"));
    log.put("userid", mapParam.get("userId"));
    log.put("module", "索引库管理");
    log.put("operate", "索引库管理：重建索引");
    log.put("loginfo", "为节点【" + nodename + "】重新建立索引库");
    this.getLogService().saveLog(log);

    return rtnMap;
  }

  @Override
  public Map<String, Object> optimizeIndexStore(Map<String, String> mapParam) {
    String ids = mapParam.get("ids");
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    if (ids == null || "".equals(ids.trim()) || "all".equals(ids)) {
      rtnMap.put("successful", "false");
      return rtnMap;
    }
    String[] idsArray = ids.split(",");
    for (String id : idsArray) {
      String[] array = id.split("@");
      boolean isOpt = this.optimizeIndexStore(array[1], array[0]);
      if (!isOpt) {
        rtnMap.put("successful", "false");
        return rtnMap;
      }
    }
    rtnMap.put("successful", "true");
    //xiewenda 加入日志
    String nodename = mapParam.get("nodename").toString().replace(",","】,【");
    Map<String, Object> log = new HashMap<String, Object>();
    log.put("ip", mapParam.get("userIp"));
    log.put("userid", mapParam.get("userId"));
    log.put("module", "索引库管理");
    log.put("operate", "索引库管理：优化索引");
    log.put("loginfo", "为节点【" + nodename + "】优化索引库");
    this.getLogService().saveLog(log);
    return rtnMap;
  }

  public boolean optimizeIndexStore(String id, String nodeId) {
    try {
      ModuleWriteManager writeManager =
          FulltextWriter.getInstance().getModuleWriteManager(id, nodeId);
      if (writeManager != null) {
        writeManager.optimize();
      }
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
    return true;
  }

  // 每天晚上11点触发
  // @Scheduled(cron="0 0 23  * * ? ")
  @SuppressWarnings("null")
  public void updateIndexStore() {
    // 更新索引库，对今天的新来的数据进行添加，对修改的数据进行修改
    StaticUtil.isIndexStoreUpdate = true;// 告知建立索引时候，现在做的是晚上的增量索引
    StaticUtil.luceneCreatingIndex = true;// 上锁，现在不允许建立索引了
    // 先查出来所有要更新的索引库的节点
    Set<String> executeSet = new HashSet<String>();
    List<EssIndexNodes> updateNodeList = null;// dao.getNeedUpdateIndexNode();
    for (EssIndexNodes e : updateNodeList) {
      executeSet.add(e.getTreeNodeId() + "_" + e.getStruId());
    }
    this.getIndexstoreservice().runIndexTask(executeSet);
  }

  private Map<String, String> getFullTreeNodeName(List<Map<String, String>> map,
      String treeIdFieldName) {
    Map<String, String> allTitleMap = this.getAllTreeNodeTitle();
    Map<String, String> rtnMap = new HashMap<String, String>();
    for (Map<String, String> m : map) {
      String id = String.valueOf(m.get(treeIdFieldName));
      String fullTitle = "";
      if (m.get("ID_SEQ") == null || "".equals(m.get("ID_SEQ"))) {
        continue;
      } else {
        String[] id_seq = m.get("ID_SEQ").split("\\.");
        for (String s : id_seq) {
          /** rongying 20150306 修改索引库名称前面有null字符串的问题 **/
          // fullTitle = fullTitle + allTitleMap.get(s) + "/";
          if (!s.equals("0")) {
            fullTitle = fullTitle + allTitleMap.get(s) + "/";
          }
        }
        fullTitle = fullTitle + allTitleMap.get(id);
      }
      rtnMap.put(id, fullTitle);
    }
    return rtnMap;
  }

  @SuppressWarnings("unchecked")
  public Map<String, String> getAllTreeNodeTitle() {
    String sql = "SELECT * FROM ess_document_stage";
    Map<String, String> map = new HashMap<String, String>();
    try {
      ResultSetHandler<Map<String, Map<String, Object>>> h = new KeyedHandler<String>("id");
      Map<String, Map<String, Object>> m = query.query(sql, h);
      Set enties = m.entrySet();
      if (enties != null) {
        Iterator iterator = enties.iterator();
        while (iterator.hasNext()) {
          Map.Entry<String, Object> entry = (Entry<String, Object>) iterator.next();
          String id = String.valueOf(entry.getKey());
          Map<String, String> mm = (Map<String, String>) entry.getValue();
          map.put(id, mm.get("name").toString());
        }
      }
      /*
       * String id = m.get("id").toString(); Map<String,Object> m2 = m.get(id); map.put(id,
       * m2.get("name").toString());
       */
      return map;
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return map;
    }
  }

  @Override
  public void updateIndexStoreEditTime(String treeNodeId) {
    // gaoyd dao.updateIndexStoreEditTime(treeNodeId);
  }

  @Override
  public Map<String, Object> getOtherNodes(Map<String, String> map) {
    String ids = map.get("ids");
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    if (ids == null || "".equals(ids)) {
      rtnMap.put("nohave", "1");
      return rtnMap;
    }
    Set<String> struIds = new HashSet<String>();
    Set<String> treeNodes = new HashSet<String>();
    String[] idsArray = ids.split(",");
    for (String idAll : idsArray) {
      String[] idArray = idAll.split("@");
      String id = idArray[0];
      String id_structure = idArray[1];
      struIds.add(id_structure);
      treeNodes.add(id);
    }
    Map<String, Object> mapList = null;// dao.getOtherTreeNodes(struIds,
    // treeNodes);
    @SuppressWarnings({"unchecked", "null"})
    List<Map<String, String>> lst = (List<Map<String, String>>) mapList.get("list");
    if (lst == null || lst.isEmpty()) {
      rtnMap.put("nohave", "1");
      return rtnMap;
    }
    Map<String, String> titleMap = this.getFullTreeNodeName(lst, "id");
    for (Map<String, String> m : lst) {
      m.put("estitle", titleMap.get(m.get("id")));
    }
    rtnMap.put("list", lst);
    rtnMap.put("nohave", "0");
    rtnMap.put("total", lst.size());
    return rtnMap;
  }

  @Override
  public Map<String, Object> getOtherNodesForCreated(Map<String, String> map) {
    String ids = map.get("ids");
    Map<String, Object> rtnMap = new HashMap<String, Object>();
    if (ids == null || "".equals(ids)) {
      rtnMap.put("nohave", "1");
      return rtnMap;
    }
    Set<String> struIds = new HashSet<String>();
    Set<String> nodeIds = new HashSet<String>();
    String[] idsArray = ids.split(",");
    for (String idAll : idsArray) {
      String[] idArray = idAll.split("@");
      // String tree_id = idArray[0];
      String id_structure = idArray[1];
      String id = idArray[2];
      struIds.add(id_structure);
      nodeIds.add(id);
    }
    Map<String, Object> mapList = null;// dao.getOtherNodesForCreated(struIds,
    // nodeIds);
    @SuppressWarnings({"unchecked", "null"})
    List<Map<String, String>> lst = (List<Map<String, String>>) mapList.get("list");
    if (lst == null || lst.isEmpty()) {
      rtnMap.put("nohave", "1");
      return rtnMap;
    }
    Map<String, String> titleMap = this.getFullTreeNodeName(lst, "TREENODEID");
    for (Map<String, String> m : lst) {
      m.put("estitle", titleMap.get(m.get("TREENODEID")));
    }
    rtnMap.put("list", lst);
    rtnMap.put("nohave", "0");
    rtnMap.put("total", lst.size());
    return rtnMap;
  }

  public List<Map<String, Object>> getIndexNodeForTreeNodes(String treeNodes) {
   String sql = "select * from ess_index_nodes where treeNodeId in("+treeNodes+")";
   try {
     List<Map<String, Object>> result= query.query(sql, new MapListHandler());
     return result;
  } catch (SQLException e) {
    e.printStackTrace();
  }
   return null;
  }

  @Override
  public String getFullIndexPath() {
    try {
      String sql =
          "SELECT APPCONFIGVALUE FROM ESS_APPCONFIG WHERE APPCONFIGKEY = 'FULLINDEX_LOCALTEXTPATH'";
      String rs = query.query(sql, new ResultSetHandler<String>() {
        @Override
        public String handle(ResultSet rs) throws SQLException {
          // TODO Auto-generated method stub
          rs.next();
          return rs.getString("APPCONFIGVALUE");
        }
      });
      if (rs != null && !"".equals(rs)) {
        return rs;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
  public String getAppConfigValue(String key) {
    return null;// dao.getAppConfigValue(key);
  }

  @Override
  public HashMap<String, String> getExtraKeywords(HashMap<String, String> params) {
    /*
     * String serarchKeyword = params.get("serarchKeyword"); String start = params.get("start");
     * String limit = params.get("limit");
     */
    return null;// dao.getExtraKeywords(serarchKeyword, start, limit) ;
  }

  @Override
  public Boolean addExtraKeyword(HashMap<String, String> params) {
    boolean flag = true;// dao.addExtraKeyword(params.get("keyword")) ;
    if (flag) {
      List<String> newWords = new ArrayList<String>();
      newWords.add(params.get("keyword"));
      // gaoyd getSearchWS().addExtraKeywrods(newWords);
      HashMap<String, String> localLogMap = new HashMap<String, String>();
      localLogMap.put("userid", params.get("userId"));
      localLogMap.put("module", "全文索引外挂词库管理");
      localLogMap.put("type", "operation");
      localLogMap.put("ip", params.get("userIp"));
      localLogMap.put("loginfo", "添加外挂词【" + params.get("keyword") + "】");
      localLogMap.put("operate", "全文索引外挂词库管理:添加");
      // getLogService().saveLog(localLogMap);
    }
    return flag;
  }

  @Override
  public Boolean updateExtraKeyword(HashMap<String, String> params) {
    boolean flag = true;// dao.updateExtraKeyword(params);
    if (flag) {
      List<String> removeWorks = new ArrayList<String>();
      removeWorks.add(params.get("oldKeyword"));
      // gaoyd getSearchWS().removeExtraKeywrods(removeWorks);
      List<String> newWords = new ArrayList<String>();
      newWords.add(params.get("keyword"));
      // gaoyd getSearchWS().addExtraKeywrods(newWords);
      HashMap<String, String> localLogMap = new HashMap<String, String>();
      localLogMap.put("userid", params.get("userId"));
      localLogMap.put("module", "全文索引外挂词库管理");
      localLogMap.put("type", "operation");
      localLogMap.put("ip", params.get("userIp"));
      localLogMap.put("loginfo", "编辑外挂词【" + params.get("keyword") + "】");
      localLogMap.put("operate", "全文索引外挂词库管理:编辑");
      // getLogService().saveLog(localLogMap);
    }
    return flag;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Boolean removeExtraKeywords(HashMap<String, String> params) {
    boolean flag = false;// dao.removeExtraKeywords(params.get("ids")) ;
    if (flag) {
      List<String> removeWorks = Arrays.asList(params.get("oldKeywords").split(","));
      // gaoyd getSearchWS().removeExtraKeywrods(removeWorks);
      HashMap<String, String> localLogMap = new HashMap<String, String>();
      localLogMap.put("userid", params.get("userId"));
      localLogMap.put("module", "全文索引外挂词库管理");
      localLogMap.put("type", "operation");
      localLogMap.put("ip", params.get("userIp"));
      localLogMap.put("loginfo", "删除外挂词【" + params.get("oldKeywords") + "】");
      localLogMap.put("operate", "全文索引外挂词库管理:删除");
      // getLogService().saveLog(localLogMap);
    }
    return null;// dao.removeExtraKeywords(params.get("ids")) ;
  }

  /**
   * 临时数据存放的位置
   * 
   * @return
   */
  private String getTempPath() {
    String classPath =
        this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
    int pos = classPath.indexOf("WEB-INF");
    String web_infPath = classPath.substring(0, pos);
    return web_infPath.toString() + "data/";
  }

  /**
   * 上传文件
   * 
   * @param file
   * @param exportFilePath
   * @return
   */
  private String _upLoadFile(FileItem file, String exportFilePath) {
    String dataTime =
        DateUtil.getDateTime(DateUtil.DATE_TIME_PATTERN, new Date()).replace("-", "")
            .replaceAll(":", "").replaceAll(" ", "");
    String fileName = file.getName();
    if (fileName.lastIndexOf("\\") > 0) {
      fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
    }
    String fileFullPath = exportFilePath + dataTime + fileName;
    try {
      File dir = new File(exportFilePath);
      if (!dir.exists()) {
        dir.mkdirs();
      }
      InputStream fileIn = null;
      FileOutputStream fileOut = null;
      fileIn = file.getInputStream();
      fileOut = new FileOutputStream(fileFullPath);
      int len = 0;
      byte[] buffer = new byte[8192];
      while ((len = fileIn.read(buffer, 0, 8192)) != -1) {
        fileOut.write(buffer, 0, len);
      }
      fileOut.close();
      fileIn.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return fileFullPath;
  }

  private String importExtraKeywords(FileItem item, String userId, String userIp) {
    String filePath = _upLoadFile(item, getTempPath());
    TagExcelImportUtil teiu = new TagExcelImportUtil(filePath);
    List<Map<String, String>> tagList = teiu.read();
    if (tagList == null || tagList.size() < 1) {
      return "2";// 上传的文件为空文件，请重现选择文件！
    }
    List<String> hasedList = null;// dao.getAllExtraKeywords();
    List<String> words = new ArrayList<String>();
    boolean isHased = false;
    String importWordsCollection = "";
    for (Map<String, String> rowMap : tagList) {
      if (!hasedList.contains(rowMap.get("外挂词"))) {
        words.add(rowMap.get("外挂词"));
        importWordsCollection += (rowMap.get("外挂词") + ",");
      } else {
        isHased = true;
      }
    }
    if (words.isEmpty()) {
      return "3";// 上传文件内的外挂词全部已经存在，不能重复导入！
    } else {
      // gaoyd dao.addExtraKeyword(words);
      // gaoyd getSearchWS().addExtraKeywrods(words);
      HashMap<String, String> localLogMap = new HashMap<String, String>();
      localLogMap.put("userid", userId);
      localLogMap.put("module", "全文索引外挂词管理");
      localLogMap.put("type", "operation");
      localLogMap.put("ip", userIp);
      localLogMap.put("loginfo", "导入名称为【" + importWordsCollection + "】的外挂词");
      localLogMap.put("operate", "全文索引外挂词管理:导入外挂词");
      // getLogService().saveLog(localLogMap);
      if (isHased) {
        return "4";// 上传文件内的外挂词部分已存在，没有重复导入！
      } else {
        return "";
      }
    }
  }

  private String getServiceIP() {
    /*
     * return this.getNamingService().findApp(this.getInstanceId(), "escloud_luceneservice",
     * this.getServiceId(), this.getMyAppToken());
     */
    return "";
  }

  @Override
  public String getImportUrl(String userId, String userIp) {
    return getServiceIP() + "/importData/" + userId + "/userIp" + userIp;
  }

  public boolean updateIdentifier(EssIndexNodes essindexnode) {
    try {
      String sql =
          "insert into ess_index_nodes(nodeHost,nodeAddress,struId,moduleType,moduleArray,activeStatus,searchedOrder,createTime,updateTime,childStruId,treeNodeId) values(?,?,?,?,?,?,?,?,?,?,?)";
      int row =
          query.update(
              sql,
              new Object[] {essindexnode.getNodeHost() == null ? "" : essindexnode.getNodeHost(),
                  essindexnode.getNodeAddress() == null ? "" : essindexnode.getNodeAddress(),
                  essindexnode.getStruId(), 0,
                  essindexnode.getModuleArray() == null ? "" : essindexnode.getModuleArray(),
                  essindexnode.getActiveStatus(),
                  essindexnode.getSearchedOrder() == null ? 0 : essindexnode.getSearchedOrder(),
                  essindexnode.getCreateTime(), essindexnode.getUpdateTime(),
                  essindexnode.getChildStruId(), essindexnode.getTreeNodeId()});
      String updatesql = "update ess_document_stage set iscreateindex = 1 where id = ?";
      int row2 = query.update(updatesql, new Object[] {essindexnode.getTreeNodeId()});
      if (row == 1 && row2 == 1)
        return true;
      else
        return false;
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return false;
    }
  }

  /**
   * 获取已经创建索引库节点列表
   * 
   * @param start
   * @param limit
   * @return
   */
  public Map<String, Object> getCreatedNodesList(int start, int limit, String nodePath) {
    StringBuffer sql = new StringBuffer();
    sql.append("select a.*,b.id_seq from ess_index_nodes a, ess_document_stage b where a.treeNodeId = b.id ");
    if (nodePath != null) {
      sql.append(" and concat(b.id_seq,a.treeNodeId,'.')  like '" + nodePath + ".%' ");
    }
    if (limit > 0) {
      sql.append(" limit " + start + "," + limit);
    }
    Map<String, Object> maprtn = new HashMap<String, Object>();
    try {
      List<Map<String, Object>> list = query.query(sql.toString(), new MapListHandler());
      maprtn.put("list", list);
      String countSql =
          "select count(*) from ess_index_nodes a, ess_document_stage b where a.treeNodeId = b.id ";
      if (nodePath != null) {
        countSql = countSql + " and concat(b.id_seq,a.treeNodeId,'.')  like '" + nodePath + ".%' ";
      }
      int row = query.query(countSql.toString(), new ResultSetHandler<Integer>() {
        public Integer handle(ResultSet rs) throws SQLException {
          rs.next();
          return rs.getInt(1);
        }
      });
      maprtn.put("total", row + "");
      return maprtn;
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public EssLucene addLucene(EssLucene essLucene) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Boolean deleteLucene(long id) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Boolean deleteBatchLucene(long[] id) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Boolean updateLucene(EssLucene essLucene) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<EssLucene> findLuceneList(int pageNum, int pageSize) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<EssLucene> findLuceneList(long id, int pageNum, int pageSize) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public int luceneCountAll() {
    // TODO Auto-generated method stub
    return 0;
  }

  @Override
  public int luceneCountAll(long id) {
    // TODO Auto-generated method stub
    return 0;
  }

  @Override
  public EssLucene findLucene(long id) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<EssLucene> findLuceneList(String param) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Boolean isHased(HashMap<String, String> params) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Map<String, String> getHasMetaDataTags(Long tagId) {
    String databaseName = this.getUrl();
    String par = "esp_" + tagId;
    String sql =
        "select COLUMN_NAME from information_schema.COLUMNS where table_name = ? and COLUMN_NAME not in ('id','documentId') and table_schema = '"+databaseName+"'";
    Map<String, String> map = new HashMap<String, String>();
    try {
      List<Map<String, Object>> list = query.query(sql, new MapListHandler(), new Object[] {par});
      for (Map<String, Object> m : list) {
        map.put(m.get("COLUMN_NAME").toString(), m.get("COLUMN_NAME").toString());
      }
      if (!map.isEmpty()) {
        return map;
      }
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
      return new HashMap<String, String>();
    }
    return map;
  }

  @Override
  public List<HashMap<String, String>> searchAllEspnDataMap(String nodeId, String id_structure,
      String childStruId, List<String> queryCols, HashMap<String, String> cidToMetadataMap,
      int startNo, int limit, boolean isFile) {
    List<HashMap<String, String>> datas = new ArrayList<HashMap<String, String>>();
    List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    //xiewenda 2015/03/11 重写此方法的逻辑,以主表数据牵引获取子表数据，这样即使没有子数据，主表数据仍然可以创建索引
    try {
      String stageCode = getStageCodeById(nodeId);
      /** lujixiang 20150409  注释此段代码，还原以前查询数据， 无需连接查询中文字段   **/
      /**
      // 把文件表里的字段也添加索引
      StringBuilder sql2 = new StringBuilder();
      //String sql2 = "select * from ess_document where stageCode =? ";
      //获取装置名称、收集范围、专业代码、类型代码、拟定部门代码对应的名称，加入索引库
      sql2.append(" select a.*, ");
      sql2.append(" b.`name` stageName, ");
      sql2.append(" c.`name` deviceName, ");
      sql2.append(" d.`name` participatoryName, ");
      sql2.append(" e.`typeName` documentName, ");
      sql2.append(" f.`typeName` engineeringName from ");
      sql2.append(" ess_document a ");
      sql2.append(" inner JOIN ess_document_stage b ON a.stageCode = b.`code` AND a.stageCode != '' AND a.stageCode IS NOT NULL ");
      sql2.append(" LEFT JOIN ess_device c ON a.deviceCode = c.`deviceNo`  AND a.deviceCode != '' AND a.deviceCode IS NOT NULL ");
      sql2.append(" LEFT JOIN ess_participatory d ON a.participatoryCode = d.`code` AND a.participatoryCode != '' AND a.participatoryCode IS NOT NULL ");
      sql2.append(" LEFT JOIN ess_document_type e ON a.documentCode = e.`typeNo`  AND a.documentCode != '' AND a.documentCode IS NOT NULL ");
      sql2.append(" LEFT JOIN ess_engineering f ON a.engineeringCode = f.`typeNo` AND a.engineeringCode != '' AND a.engineeringCode IS NOT NULL ");
      sql2.append(" where a.stageCode =?");
      
       **/
      
      String sql2 = "select * from ess_document where stageCode =? ";
      list = query.query(sql2, new MapListHandler(), stageCode);
      for (Map<String, Object> map : list) {
        //改为LinkedHashMap,插入数据时按一定顺序
        HashMap<String, String> hm = new LinkedHashMap<String, String>();
        for (String ts : map.keySet()) {
          hm.put(ts, String.valueOf(map.get(ts)));
        }
        datas.add(hm);

      }
      if (judgeIfExistsTable("esp_" + nodeId)) {
        StringBuffer sql = new StringBuffer("select id,documentId ");
        for (String string : queryCols) {
          sql.append("," + string);
        }
        sql.append(" from esp_").append(nodeId).append(" order by id limit ").append(startNo)
            .append(",").append(limit);
        list = query.query(sql.toString(), new MapListHandler());
        for (Map<String, String> hm : datas) {
          String id = hm.get("id");
          for (Map<String, Object> data : list) {
            if (id.equals(data.get("documentId")+"")) {
              for (String column : queryCols) {
                hm.put(cidToMetadataMap.get(column)+"", data.get(column)+"");
              }
            }
          }
        }
      }
      /*
       * //把文件表里的字段也添加索引 String sql2 ="select * from ess_document "; list = query.query(sql2, new
       * MapListHandler()); for (Map<String, Object> map : list) { String id =
       * String.valueOf(map.get("id")); for (HashMap<String, String> hm : datas) {
       * if(Integer.parseInt(hm.get("documentId"))==Integer.parseInt(id)){ Set<String> set =
       * map.keySet(); Iterator<String> it = set.iterator(); while(it.hasNext()){ String ts =
       * it.next(); if(!"id".equals(ts)) hm.put(ts, String.valueOf( map.get(ts))); } } } }
       */
      return datas;
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  private String getStageCodeById(String nodeId) {
    String sql = "select code from ess_document_stage where id=?";
    try {
      String code = query.query(sql, new ScalarHandler<String>(), nodeId);
      return code;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
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
  
  /** lujixiang 20150416 获取已建立索引的文件收集范围   **/
  public List<Map<String, Object>> getIndexedStageType(){
	  
	String sql = "select e.code code, e.name name from ess_document_stage e inner join ess_index_nodes n on e.id = n.treeNodeId " ;
	List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
	try {
		list = query.query(sql, new MapListHandler());
		
	} catch (SQLException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}  
	return list;
	  
  }
  
  
}
