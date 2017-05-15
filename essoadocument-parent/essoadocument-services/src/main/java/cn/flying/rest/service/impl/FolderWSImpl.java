package cn.flying.rest.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;

import cn.flying.rest.file.IMainFileServer;
import cn.flying.rest.naming.INamingService;
import cn.flying.rest.service.IFolderWS;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.entiry.EssFile;
import cn.flying.rest.service.entiry.EssFileId;
import cn.flying.rest.service.entiry.EssFolder;
import cn.flying.rest.service.utils.JdbcUtil;
import cn.flying.rest.utils.BaseWS;

import com.alibaba.fastjson.JSON;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

@Path("folderservice")
@Component
public class FolderWSImpl extends BaseWS implements IFolderWS {
  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }
  @Override
  public EssFolder addChilderFolder(Long pid,String userId,String ip, EssFolder folder) {
    String sql = " insert into ess_folder(estitle,parentid,esViewTitle)values(?,?,?)";
    Long id =
        JdbcUtil.insert(query, sql,
            new Object[] {folder.getEstitle().trim(), pid, folder.getEsViewTitle()});
    // 查找到当前文件的上一层的id如果pid=0 path则设为folder_id
    folder.setId(id);
    if (pid >= 0) {
      if (pid == 0) {
        folder.setEspath("/Folder_" + id);
      } else {
        String folderpath = this.selectFolderById(pid).getEspath();
        folder.setEspath(folderpath + "@_" + id);
      }
      
    }
    Map<String,Object> log = new HashMap<String,Object>();
    log.put("ip", ip);
    log.put("userid",userId);
    log.put("module", "电子文件管理");
    log.put("operate", "电子文件管理：添加电子文件夹");
    log.put("loginfo", "添加【"+folder.getEsViewTitle()+"】的电子文件夹");
    this.getLogService().saveLog(log);
    this.updateChilderFolderEspath(folder);
    return folder;
  }

  @Override
  public Boolean addFile(Long id, Long folderId, List<HashMap<String, String>> file, Boolean isUpload) {
    boolean flag = true;
 //   List<HashMap<String, String>> file1 = (List<HashMap<String, String>>) params.get("file");
    List<String> ids = new ArrayList<String>();
    List<String> ywlj = new ArrayList<String>();
    Map<String, Integer> updateMapadd = new HashMap<String, Integer>();
    Map<String, Integer> updateMapreduce = new HashMap<String, Integer>();
    String originalId = null;
    Map<String, Object> fileInfo = null;
    String filefolderid = String.valueOf(folderId);
    for (HashMap<String, String> dataMap : file) {
      originalId = dataMap.get("ORIGINAL_ID");
      ywlj.add(dataMap.get("ywlj"));
      ids.add(originalId);
      if (!isUpload) {
        fileInfo = getFileInfoByOriginalId(originalId);
        if (fileInfo == null) {
          continue;
        }
        filefolderid = fileInfo.get("folderId").toString();
      }

      if (!StringUtils.isEmpty(filefolderid)) {
        if (updateMapadd.containsKey(filefolderid)) {
          updateMapadd.put(filefolderid, updateMapadd.get(filefolderid) + 1);
        } else {
          updateMapadd.put(filefolderid, 1);
        }
        if (updateMapreduce.containsKey(filefolderid)) {
          updateMapreduce.put(filefolderid, updateMapreduce.get(filefolderid) - 1);
        } else {
          updateMapreduce.put(filefolderid, -1);
        }
      }
    }
    if (isUpload) {
      this.storeFileDate(file, folderId);
      // 更新未挂接数
      updateNotHookNumberbatch(updateMapadd);

    }
    if (id != 0) {
      flag = this.linkFile(id, file);
      this.modifyFileStatus(ids, "是");
      updateHookNumberbatch(updateMapadd);
      updateNotHookNumberbatch(updateMapreduce);
      // 更新挂接数
      if (flag) {
        // 更新数据的附件数
        int temAccessoryNum = 0;
        Integer AccessoryNum = this.getAccessoryNum(id);
        if ("".equals(AccessoryNum) || null == AccessoryNum || "null".equals(AccessoryNum)) {
          temAccessoryNum = 0;
        } else {
          temAccessoryNum = AccessoryNum;
        }
        // 删除附件后的还有的附件数
        int AccessoryN = temAccessoryNum + file.size();

        flag = this.updateAccessoryNum(AccessoryN, id);
      }
    }
    if(flag){
      Map<String,Object> log = new HashMap<String,Object>();
      log.put("ip", file.get(0).get("ip"));
      log.put("userid",file.get(0).get("userId"));
      log.put("module", "文件收集");
      log.put("operate", "文件收集：挂接电子文件");
      if(isUpload){
        log.put("loginfo", "文件节点为:【"+file.get(0).get("treename")+"】文件标识为:【"+id+"】的文件下上传并挂接，原文路径为：【"+ywlj+"】标识为：【"+ids+"】的电子文件");
      }else{
        log.put("loginfo", "文件节点为:【"+file.get(0).get("treename")+"】文件标识为:【"+id+"】的文件下挂接，原文路径为：【"+ywlj+"】标识为：【"+ids+"】的电子文件");
      }
      this.getLogService().saveLog(log);
    }
    return flag;
  }

  @Override
  public Boolean addNoLinkFile(Long folderid, List<HashMap<String, String>> file) {
    boolean flag = false;
    if ("".equals(folderid)) {
      return false;
    }
    // 存储file文件
    flag = this.storeFileDate(file, folderid);
    // 更新未挂接数
    this.updateNotHookNumber(folderid, file.size());
    return flag;
  }

  public int countHookNum(Long folderId) {

    int CounthookNum = 0;
    //String tempids = this.getChildIdList(folderId + ",", folderId);
    String tempids = this.getChildIdListByFolderId(folderId);
    try {
      String sql =
          "select sum(hookingnum) counthookNum  from ess_folder where id in ( " + tempids + " )";
      Object cnt = query.query(sql, new ScalarHandler<Integer>());
      if (cnt != null) {
        CounthookNum = Integer.parseInt(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return CounthookNum;
  }

  public int countNotHookNUm(long folderId) {

    int CoutNotHookNum = 0;
    //String tempids = this.getChildIdList(folderId + ",", folderId);
    String tempids = this.getChildIdListByFolderId(folderId);
    try {
      String sql =
          "select sum(nothooknum) nothooknum from ess_folder where id in ( " + tempids + " )";
      Object cnt = query.query(sql, new ScalarHandler<Integer>());
      if (cnt != null) {
        CoutNotHookNum = Integer.parseInt(cnt.toString());
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return CoutNotHookNum;
  }

  public Boolean DeleteFile(Long id, List<String> ids) {
    Boolean flag = false;
    // 获取现已有的附件的数量
    Integer temAccessoryNum = this.getAccessoryNum(id);

    // 删除附件后的还有的附件数
    int AccessoryN = temAccessoryNum - ids.size();
    if (AccessoryN < 0) {
      AccessoryN = 0;
    }
    // 更新附件数
    this.updateAccessoryNum(AccessoryN, id);

    String deleteSql = "delete from ess_document_file where pid= ? and EsFileId=?";
    try {
      Object[][] params = new Object[ids.size()][];
      for (int i = 0; i < ids.size(); i++) {
        params[i] = new Object[] {id, ids.get(i)};
      }
      int[] row = query.batch(deleteSql, params);
      if (row == null) {
        flag = false;
      } else {
        flag = true;
        Map<String, Object> fileInfo = null;
        Map<String, Integer> updateMapreduce = new HashMap<String, Integer>();
        Map<String, Integer> updateMapadd = new HashMap<String, Integer>();
        for (int i = 0; i < ids.size(); i++) {
          if (flag) {
            fileInfo = this.getFileInfoByOriginalId(ids.get(i));
            if (fileInfo == null) {
              continue;
            }
            String filefolderid = fileInfo.get("folderId").toString();
            if (!StringUtils.isEmpty(filefolderid)) {
              if (updateMapadd.containsKey(filefolderid)) {
                updateMapadd.put(filefolderid, updateMapadd.get(filefolderid) + 1);
              } else {
                updateMapadd.put(filefolderid, 1);
              }
              if (updateMapreduce.containsKey(filefolderid)) {
                updateMapreduce.put(filefolderid, updateMapreduce.get(filefolderid) - 1);
              } else {
                updateMapreduce.put(filefolderid, -1);
              }
            }
          }
        }
        this.modifyFileStatus(ids, "");
        updateHookNumberbatch(updateMapreduce);
        updateNotHookNumberbatch(updateMapadd);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return flag;
  }

  @Override
  public Boolean DeleteFileInfo(Long id,String userId,String ip, Map<String,Object> param) {
    boolean flag = false;
    @SuppressWarnings("unchecked")
    List<String> ids = (List<String>) param.get("ids");
    @SuppressWarnings("unchecked")
    List<String> ywlj = (List<String>) param.get("ywlj");
    flag = this.DeleteFile(id, ids);
    this.updateDocumentFlag(id, "0");

    if(flag){
      Map<String,Object> log = new HashMap<String,Object>();
      log.put("ip", ip);
      log.put("userid",userId);
      log.put("module", "文件收集");
      log.put("operate", "文件收集：删除挂接电子文件");
      log.put("loginfo", "删除文件节点为:【"+ param.get("treename")+"】文件标识为:【"+id+"】的文件下原文路径为:【"+ywlj+"】标识为：【"+ids+"】的电子文件");
      this.getLogService().saveLog(log);
    }
    return flag;
  }

  @Override
  public String editSubFolder(int id, Map<String, String> map) {
    String estitle = map.get("estitle");
    String fileViewName = map.get("esViewTitle");
    String sql = "update ess_folder set estitle=?,esViewTitle=? where id=?";
    try {
      int row = query.update(sql, new Object[] {estitle, fileViewName, id});
      if (row == 0) {
        return "false";
      } else {
        Map<String,Object> log = new HashMap<String,Object>();
        log.put("ip", map.get("ip"));
        log.put("userid", map.get("userId"));
        log.put("module", "电子文件管理");
        log.put("operate", "电子文件管理：修改电子文件夹");
        log.put("loginfo", "修改标识为【"+id+"】的电子文件夹名称");
        this.getLogService().saveLog(log);
        return "true";
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return "false";
  }

  /**
   * 获取数据的附件数
   * 
   * @param id
   * @return
   */
  public Integer getAccessoryNum(Long id) {
    Integer Attachments = null;
    try {
      String sql = "select Attachments from ess_document where id= ?";
      Attachments = query.query(sql, new ScalarHandler<Integer>(), new Object[] {id});
    } catch (Exception e) {
      e.printStackTrace();
    }
    return Attachments;

  }
  
  /** lujixiang 20150320 此方法使用递归获取所有子文件id错误，弃用  **/
  @Deprecated
  public String getChildIdList(String ids, long pid) {
    String SQL = "select id from ess_folder where parentid= ?";
    List<Map<String, Object>> tempid = null;
    try {
      tempid = query.query(SQL, new MapListHandler(), new Object[] {pid});
      if (tempid == null) {
        tempid = new ArrayList<Map<String, Object>>();
      }
      for (int i = 0; i < tempid.size(); i++) {
        Map<String, Object> map = tempid.get(i);
        ids += map.get("id").toString() + ",";
        this.getChildIdList(ids, (Integer) map.get("id"));
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    ids = ids.substring(0, ids.length() - 1);
    return ids;
  }
  
  /**
   * lujixiang 20150320 获取父文件下所有子孙文件夹id(不包含父文件id)
   * @param pid : 父节点id
   * @return 子孙文件夹id : 10,12,...
   */
  public String getChildIdList( long pid) {
      String SQL = "select id from ess_folder where parentid= ?";
      List<Map<String, Object>> tempid = null;
      String ids = "" ;
      try {
          tempid = query.query(SQL, new MapListHandler(), new Object[] {pid});
          if (tempid == null ) {
              return "" ;
          }
          for (int i = 0; i < tempid.size(); i++) {
              Map<String, Object> map = tempid.get(i);
               /** 递归获取孙子文件夹id **/
               String childIds = this.getChildIdList((Integer) map.get("id")) ;
               /** 当前子文件夹id和孙子文件夹id**/
               ids += map.get("id").toString() + ( "".equals(childIds) || null == childIds ? "" : "," + childIds ) + ",";
          }
      } catch (SQLException e) {
          e.printStackTrace();
          return "" ;
      }
      if (!"".equals(ids)) {
          ids = ids.substring(0, ids.length() - 1);
      }
      
      return ids;
  }

  /**
   * 根据文件夹Id获取文件数(未挂接的) editer gaoyide cause by 之前没有获取子文件夹下的文件数,默认情况下获取所有为挂接文件数
   */
  @Override
  public Long getFileCountByFolderIdForNoLink(Long folderId, HashMap<String, String> keyword) {
    Long count = null;
    //String tempids = this.getChildIdList(folderId + ",", folderId);
    StringBuffer SQL = new StringBuffer();
    SQL.append("select count(1) from ess_file where esfilestate != 1 and esfilestate != '是' ");
    if(folderId != 0){
      String tempids = this.getChildIdListByFolderId(folderId);
      SQL.append("and  folderId in (" + tempids + ")");
    }
    if (!"".equals(keyword.get("keyword")) && !"null".equals(keyword.get("keyword")) && keyword.get("keyword") != null) {
      SQL.append(" and estitle like '%" + keyword.get("keyword") + "%'");
    } 
    try {
      count = query.query(SQL.toString(), new ScalarHandler<Long>());
      if (count == null) {
        count = 0L;
      }
    } catch (Exception e) {
      e.printStackTrace();
      count = 0L;
    }
    return count;
  }

  public Map<String, Object> getFileInfoByOriginalId(String originalId) {
    String sql = "select * from ess_file where originalId = ? ";
    Map<String, Object> file = null;
    try {
      file = query.query(sql, new MapHandler(), new Object[] {originalId});
    } catch (Exception e) {
      e.printStackTrace();
    }
    return file;
  }

  public String getFolderPathByOriginalId(String originalId) {
    String sql =
        "select ESPATH from ess_file, ess_folder where ess_file.folderId=ess_folder.id and originalId = ?";
    String ESPATH = null;
    try {
      ESPATH = query.query(sql, new ScalarHandler<String>(), new Object[] {originalId});
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return ESPATH;
  }

  @Override
  public Long getNotHookFileNum(Long folderId) {
    Long sumNumber = null;
    //String tempids = this.getChildIdList(folderId + ",", folderId);
    String tempids = this.getChildIdListByFolderId(folderId);
    String SQL =
        "select count(1) from ess_file where  esfileState='' and folderId in (" + tempids + ")";
    try {
      sumNumber = query.query(SQL, new ScalarHandler<Long>());
      if (sumNumber == null) {
        sumNumber = 0l;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return sumNumber;
  }

  public String getTitlePath(String path) {

    // 把各个层次的id放入到newpath的集合中去
    String path2 = path.replace("/", "—");
    String path1 = path2.replace("@_", "_");
    int first = path1.indexOf("_");
    String[] newpath = path1.substring(first + 1, path1.length()).split("_");
    String titlePath = "";
    for (int i = 0; i < newpath.length; i++) {
      String sql = "select estitle from ess_folder where id= ? ";
      String estitle = null;
      try {
        estitle = query.query(sql, new ScalarHandler<String>(), new Object[] {newpath[i]});
      } catch (SQLException e) {
        e.printStackTrace();
      }
      titlePath = titlePath + "/" + estitle;
    }
    return titlePath;
  }

  @Override
  public Long getTotalNum(Long folderId) {
    Long counttotal = null;
    try {
      /** lujixiang 20150320 修改获取子孙文件夹id **/
      // String tempids = this.getChildIdList(folderId + ",", folderId);
      //String childIds = this.getChildIdList(folderId) ;
      //String tempids = ("".equals(childIds) ? "" : childIds + ",") + folderId.toString() ;
      String tempids = this.getChildIdListByFolderId(folderId);
      String sql = "select count(1) from ess_file where  folderId in ( " + tempids + " )";
      counttotal = query.query(sql, new ScalarHandler<Long>());
      if (counttotal == null) {
        counttotal = 0l;
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return counttotal;
  }

  public Boolean isHookLink(String fileId) {
    StringBuilder builder = new StringBuilder();
    builder.append("select esfileState from ESS_FILE WHERE originalId='" + fileId + "'");
    boolean isHook = false;
    try {
      Object fileState = query.query(builder.toString(), new ScalarHandler<Object>());
      if ("1".equals(fileState.toString()) || "是".equals(fileState.toString())) {
        isHook = true;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return isHook;
  }

  public Boolean linkFile(Long id, List<HashMap<String, String>> fileInfo) {
    boolean flag = false;
    String sql = "insert into ess_document_file(pid,dept,esfileid,esfiletype) values(?,?,?,?)";
    try {
      Object[][] params = new Object[fileInfo.size()][];
      for (int i = 0; i < fileInfo.size(); i++) {
        String dept = fileInfo.get(i).get("Dept") == null ? "" : fileInfo.get(i).get("Dept");
        String esfileid =
            fileInfo.get(i).get("ORIGINAL_ID") == null ? "" : fileInfo.get(i).get("ORIGINAL_ID");
        String esstype = fileInfo.get(i).get("ESTYPE") == null ? "" : fileInfo.get(i).get("ESTYPE");
        params[i] = new Object[] {id, dept, esfileid, esstype};
      }
      int[] row = query.batch(sql, params);
      if (row == null) {
        flag = false;
      } else {
        flag = true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      flag = false;
    }
    return flag;
  }

  public void modifyFileStatus(List<String> fileInfo, String state) {
    String sql = "update ess_file set esfileState=? where originalId= ?";
    Object[][] params = new Object[fileInfo.size()][];
    try {
      for (int i = 0; i < fileInfo.size(); i++) {
        params[i] = new Object[] {state, fileInfo.get(i)};
      }
      query.batch(sql, params);
    } catch (SQLException e) {
      e.printStackTrace();
    }

  }

  @Override
  public List<EssFile> selectFileByFolderIdForESFILE(Long folderId, int pageNum, int pageSize) {

	/** lujixiang 20150320 修改获取子孙文件夹id **/
    // String tempids = this.getChildIdList(folderId + ",", folderId);
	//String childIds = this.getChildIdList(folderId) ;
    //String tempids = ("".equals(childIds) ? "" : childIds + ",") + folderId.toString() ;  
    String tempids = this.getChildIdListByFolderId(folderId);
    List<EssFile> essFiles = new ArrayList<EssFile>();
    EssFile esfile = null;
    EssFileId essFileId = null;
    List<EssFileId> list = new ArrayList<EssFileId>();

    try {
      int start = (pageNum - 1) * pageSize;
      String sql = "select * from ess_file where folderId in (" + tempids + ") limit ?,?";
      list =
          query.query(sql, new BeanListHandler<EssFileId>(EssFileId.class), new Object[] {start,
              pageSize});
      Map<Integer, String> map = new HashMap<Integer, String>();
      for (int i = 0; i < list.size(); i++) {
        essFileId = list.get(i);
        Integer fid = essFileId.getFolderId();
        if (!map.containsKey(fid)) {
          String FolderPath = getFolderPathByOriginalId(essFileId.getOriginalId());
          if (FolderPath != null) {
            map.put(fid, getTitlePath(FolderPath));
          } else {
            map.put(fid, "暂时无法获取原文路径");
          }
        }
        essFileId.setFolderPath(map.get(fid));
        esfile = new EssFile();
        esfile.setId(essFileId);
        essFiles.add(esfile);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }

    return essFiles;
  }

  @Override
  public List<EssFile> selectFileByFolderIdForNoLink(Long folderId, int pageNum, int pageSize,
      HashMap<String, String> keyword) {
    //String tempids = this.getChildIdList(folderId + ",", folderId);
    List<EssFile> essFiles = new ArrayList<EssFile>();
    EssFile esfile = null;
    List<EssFileId> list = null;
    StringBuffer SQL = new StringBuffer();
    SQL.append("select * from ess_file where esfilestate != 1 and esfilestate != '是' ");
    if(folderId != 0){
      String tempids = this.getChildIdListByFolderId(folderId);
      SQL.append("and  folderId in (" + tempids + ")");
    }
    if (!"".equals(keyword.get("keyword")) && !"null".equals(keyword.get("keyword")) && keyword.get("keyword") != null) {
      SQL.append(" and estitle like '%" + keyword.get("keyword") + "%'");
    } 
    SQL.append(" order by folderId limit ?,?");
    try {
      list =
          query.query(SQL.toString(), new BeanListHandler<EssFileId>(EssFileId.class),
              new Object[] {(pageNum - 1) * pageSize, pageSize});
      if (list == null) {
        list = new ArrayList<EssFileId>();
      }
      Map<Integer, String> map = new HashMap<Integer, String>();
      for (EssFileId essFileId : list) {
        Integer fid = essFileId.getFolderId();
        if (!map.containsKey(fid)) {
          String FolderPath = getFolderPathByOriginalId(essFileId.getOriginalId());
          if (FolderPath != null) {
            map.put(fid, getTitlePath(FolderPath));
          } else {
            map.put(fid, "暂时无法获取原文路径");
          }
        }
        essFileId.setFolderPath(map.get(fid));
        esfile = new EssFile();
        esfile.setId(essFileId);
        essFiles.add(esfile);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return essFiles;
  }

  @Override
  public EssFolder selectFolderById(Long id) {
    EssFolder essFolder = null;
    String SQL = "select * from ess_folder where id= ? ";
    try {
      essFolder = query.query(SQL, new BeanHandler<EssFolder>(EssFolder.class), new Object[] {id});
      if (essFolder == null) {
        essFolder = new EssFolder();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return essFolder;
  }

  @Override
  public List<EssFolder> selectFolderByPid(Long pid) {
    List<EssFolder> folders = null;
    EssFolder folder = null;
    String SQL =
        "select id, estitle,espath,userid, parentid,esViewTitle from ess_folder where parentid= ?";
    try {
      folders =
          query.query(SQL, new BeanListHandler<EssFolder>(EssFolder.class), new Object[] {pid});
      if (folders == null) {
        folders = new ArrayList<EssFolder>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    // 循环出挂接的文件数量
    for (int i = 0; i < folders.size(); i++) {
      folder = folders.get(i);
      
      /** lujixiang 20150319 从ess_file表中获取真实的未挂接数和挂接数  **/
       int hooknum = this.countHookNum(folder.getId());
       int notHookNum = this.countNotHookNUm(folder.getId());
      //int totalNum = this.getTotalNum(folder.getId()).intValue() ;
      //int notHookNum = this.getNotHookFileNum(folder.getId()).intValue() ;
      
      
      String path = folder.getEspath();
      String newpath = path.replace("/", "-");
      Long id1 = folder.getId();
      Boolean s = this.selectFolderByPid1(id1).size() > 0;
      folder.setNewpath(newpath);
      folder.setEspath(this.getTitlePath(path));
      folder.setIsParent(s);
       folder.setHookingNum(hooknum);
      //folder.setHookingNum(totalNum - notHookNum);
      folder.setNotHookNum(notHookNum);
    }
    return folders;
  }

  private List<EssFolder> selectFolderByPid1(long id) {
    List<EssFolder> folders = null;
    try {
      String SQL = "select id, estitle,espath,userid, parentid from ess_folder where parentid= ?";
      folders =
          query.query(SQL, new BeanListHandler<EssFolder>(EssFolder.class), new Object[] {id});
      if (folders == null) {
        folders = new ArrayList<EssFolder>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return folders;
  }

  @Override
  public List<EssFile> selectNotHookFileByFolderId(Long folderId, int pageNum, int pageSize) {
    //String tempids = this.getChildIdList(folderId + ",", folderId);
    String tempids = this.getChildIdListByFolderId(folderId);
    List<EssFile> essFiles = new ArrayList<EssFile>();
    EssFile esfile = null;
    EssFileId essFileId = null;
    List<EssFileId> list = new ArrayList<EssFileId>();
    try {
      int start = (pageNum - 1) * pageSize;
      String sql =
          "select * from ess_file where  esfileState='' and folderId in(" + tempids + ") limit ?,?";
      list =
          query.query(sql, new BeanListHandler<EssFileId>(EssFileId.class), new Object[] {start,
              pageSize});
      Map<Integer, String> map = new HashMap<Integer, String>();
      for (int i = 0; i < list.size(); i++) {
        essFileId = list.get(i);
        Integer fid = essFileId.getFolderId();
        if (!map.containsKey(fid)) {
          String FolderPath = getFolderPathByOriginalId(essFileId.getOriginalId());
          if (FolderPath != null) {
            map.put(fid, getTitlePath(FolderPath));
          } else {
            map.put(fid, "暂时无法获取原文路径");
          }
        }
        essFileId.setFolderPath(map.get(fid));
        esfile = new EssFile();
        esfile.setId(essFileId);
        essFiles.add(esfile);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }

    return essFiles;
  }

  public Boolean storeFileDate(List<HashMap<String, String>> file, Long folderid) {
    boolean flag = true;
    if (file != null) {
      for (int i = 0; i < file.size(); i++) {
        String ORIGINAL_ID =
            file.get(i).get("ORIGINAL_ID") == null ? "0" : file.get(i).get("ORIGINAL_ID");
        String ESMD5 = file.get(i).get("ESMD5") == null ? "" : file.get(i).get("ESMD5");
        String ESTITLE = file.get(i).get("ESTITLE") == null ? "" : file.get(i).get("ESTITLE");
        String ESSIZE = file.get(i).get("ESSIZE") == null ? "0" : file.get(i).get("ESSIZE");
        String ESTYPE = file.get(i).get("ESTYPE") == null ? "" : file.get(i).get("ESTYPE");
        String PDF_ID = file.get(i).get("PDF_ID") == null ? "" : file.get(i).get("PDF_ID");
        String SWF_ID = file.get(i).get("SWF_ID") == null ? "" : file.get(i).get("SWF_ID");
        String EFIlE_STATE =
            file.get(i).get("EFIlE_STATE") == null ? "" : file.get(i).get("EFIlE_STATE");
        String fileVersion = file.get(i).get("fileVersion") == null ? "" : file.get(i).get("fileVersion");
        StringBuilder addFileSql = new StringBuilder();
        addFileSql.append("insert into ess_file(originalId,esmd5,estitle,essize,estype,"
            + "pdfId,swfId,folderId,createtime,esfileState,fileVersion) values(");

        addFileSql.append("'" + ORIGINAL_ID + "',");
        addFileSql.append("'" + ESMD5 + "',");
        addFileSql.append("'" + ESTITLE + "',");
        addFileSql.append("'" + ESSIZE + "',");
        addFileSql.append("'" + ESTYPE + "',");
        addFileSql.append("'" + PDF_ID + "',");
        addFileSql.append("'" + SWF_ID + "',");
        addFileSql.append("'" + String.valueOf(folderid) + "',");
        addFileSql.append("'" + System.currentTimeMillis() + "',");
        addFileSql.append("'" + EFIlE_STATE + "',");
        addFileSql.append("'" + fileVersion + "'");
        addFileSql.append(")");

        try {
          query.update(addFileSql.toString());
        } catch (Exception e) {
          e.printStackTrace();
          flag = false;
          throw new RuntimeException(e.getMessage(), e);
        }
      }

    }
    return flag;
  }

  public boolean updateAccessoryNum(Integer Attachments, Long id) {
    boolean flag = true;;
    try {
      String sql = "update ess_document set Attachments = ? where id= ? ";
      int row = Attachments = query.update(sql, new Object[] {Attachments, id});
      if (row == 0) {
        flag = false;
      }
    } catch (Exception e) {
      e.printStackTrace();
      flag = false;
    }
    return flag;

  }

  private boolean updateChilderFolderEspath(EssFolder folder) {
    try {
      String sql = " update ess_folder set espath=? where id=? ";
      Object[] params = {folder.getEspath(), folder.getId()};
      int row = query.update(sql, params);
      if (row == 0) {
        return false;
      } else {
        return true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  public Boolean updateDocumentFlag(Long dataId, String updateVal) {
    StringBuilder builder = new StringBuilder();
    builder.append("update ess_document ");
    // liqiubo 20140925 当要更新成0的时候，就给为null值，否则判断电子文件挂接的时候出现问题，修复bug 1215
    if ("0".equals(updateVal)) {
      builder.append(" set documentFlag = null where id=" + dataId);
    } else {
      builder.append(" set documentFlag = '" + updateVal + "' where id=" + dataId);
    }
    if (!"1".equals(updateVal)) {
      builder.append(" and ((select count(id) from ess_document_file where pid=" + dataId + ")=0)");
    }
    try {
      query.update(builder.toString());
      return true;
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  public void updateHookNumber(long folderId, int hooknum) {
    StringBuilder sql = new StringBuilder();
    sql.append("UPDATE ess_folder SET HOOKINGNUM = case when");
    sql.append(" HOOKINGNUM is null then ");
    if (hooknum >= 0) {
      sql.append(hooknum);
      sql.append(" else HOOKINGNUM");
      sql.append("+").append(hooknum);
    } else {
      sql.append(0);
      sql.append(" else HOOKINGNUM");
      sql.append(hooknum);
    }
    sql.append(" end where id=").append(folderId);
    try {
      query.update(sql.toString());
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e.getMessage(), e);
    }


  }

  public void updateHookNumberbatch(Map<String, Integer> updateMap) {
    for (String s : updateMap.keySet()) {
      updateHookNumber(Long.parseLong(s), updateMap.get(s));
    }
  }

  public void updateNotHookNumber(long folderId, int notHooknum) {
    StringBuilder sql = new StringBuilder();
    sql.append("update ess_folder set nothooknum = case when");
    sql.append(" nothooknum is null then ");
    if (notHooknum >= 0) {
      sql.append(notHooknum);
      sql.append(" else nothooknum");
      sql.append("+").append(notHooknum);
    } else {
      sql.append(0);
      sql.append(" else nothooknum");
      sql.append(notHooknum);
    }
    sql.append(" end where id=").append(folderId);
    try {
      query.update(sql.toString());
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e.getMessage(), e);
    }
  }

  public void updateNotHookNumberbatch(Map<String, Integer> updateMap) {
    for (String s : updateMap.keySet()) {
      updateNotHookNumber(Long.parseLong(s), updateMap.get(s));
    }
  }
  @Override
  public Map<String,String> getViewUrl(String originalId, String company, String clientIp) {
      Map<String,String> map = new HashMap<String,String>();
      IMainFileServer fileService = this.getService(IMainFileServer.class) ;
      INamingService iNamingService = this.getNamingService() ;
      String baseUrl =  iNamingService.findService(this.getInstanceId(),IMainFileServer.class.getName(), "1", "1") ;
      String baseUrl1= baseUrl.substring(baseUrl.indexOf("://")+3);
      String localIP= baseUrl1.substring(0,baseUrl1.indexOf(":"));
      baseUrl = baseUrl.substring(0, baseUrl.indexOf("fileStoreMainServer")+20);
      // 返回的json字符串的file为相对路径
      Map<String,String> postData = new HashMap<String,String>();
      postData.put("localIP", localIP);
      postData.put("clientIP", clientIp);
      postData.put("fileId", originalId);
      
      String rstJson = fileService.getNewViewUrl(postData);
      Gson gson = new Gson();
      Map<String, String> rstMap = gson.fromJson(rstJson, new TypeToken<Map<String,String>>(){}.getType());
      String msg = rstMap.get("msg");
      String swfUrl = rstMap.get("url");
      map.put("file", "".equals(swfUrl) ? msg : swfUrl);
      map.put("success", "".equals(swfUrl) ? "false":"true");
      return map;
  }
  /**
   * 检查是否存在swf文件
   * @author longjunhao 20140922
   * @param fileId
   * @return
   */
  @Override
  public String checkSwfFile(String fileId) {
    IMainFileServer fileService = this.getService(IMainFileServer.class) ;
    String url = fileService.getSwfFileUrl(fileId);
    return "".equals(url)?"false":"true";
  }
  @Override
  public String getSrcFileDownloadUrlNew(String fileId,String cilentIP) {
      IMainFileServer fileService = this.getService(IMainFileServer.class) ;
      Map<String,String> postData = new HashMap<String,String>();
      postData.put("clientIP", cilentIP);
      postData.put("fileId", fileId);
      
      String fileUrl = fileService.getNewFileDownLoadUrl(postData);
      String fileName = fileService.getFileNameById(fileId);
      Map<String,String> rst = new HashMap<String,String>();
      rst.put("fileName", fileName);
      rst.put("fileUrl", fileUrl);
      Gson gson = new Gson();
      return gson.toJson(rst);
  }
  /**
   * rongying 20150418 根据父文件夹id查询其本身及所有子文件夹id
   * @param pid
   * @return
   */
  private String getChildIdListByFolderId(long pid) {
    String SQL = "select id from ess_folder where concat(REPLACE(espath,'_',','),'@') LIKE '/Folder%,"
        + pid + "@%' ";
    List<Map<String, Object>> tempid = null;
    String ids = "";
    try {
      tempid = query.query(SQL, new MapListHandler());
      if (tempid == null) {
        return "";
      }
      for (int i = 0; i < tempid.size(); i++) {
        Map<String, Object> map = tempid.get(i);
        ids += map.get("id") + ",";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
    if (!"".equals(ids)) {
      ids = ids.substring(0, ids.length() - 1);
    }

    return ids;
  }
  /**
   * 更新文件夹下挂接的文件数，提供外部调用
   * @param originalids 
   * @param flag
   */
  public void updateFloderHookNumberbatch(List<String> originalids,boolean flag){
	  Map<String, Object> fileInfo = null;
      Map<String, Integer> updateMapreduce = new HashMap<String, Integer>();
      Map<String, Integer> updateMapadd = new HashMap<String, Integer>();
      for (int i = 0; i < originalids.size(); i++) {
        if (flag) {
          fileInfo = this.getFileInfoByOriginalId(originalids.get(i));
          if (fileInfo == null) {
            continue;
          }
          String filefolderid = fileInfo.get("folderId").toString();
          if (!StringUtils.isEmpty(filefolderid)) {
            if (updateMapadd.containsKey(filefolderid)) {
              updateMapadd.put(filefolderid, updateMapadd.get(filefolderid) + 1);
            } else {
              updateMapadd.put(filefolderid, 1);
            }
            if (updateMapreduce.containsKey(filefolderid)) {
              updateMapreduce.put(filefolderid, updateMapreduce.get(filefolderid) - 1);
            } else {
              updateMapreduce.put(filefolderid, -1);
            }
          }
        }
      }
      updateHookNumberbatch(updateMapreduce);
      updateNotHookNumberbatch(updateMapadd);
  }
}
