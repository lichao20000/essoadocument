package cn.flying.rest.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IInformationPublishService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.ConvertUtil;
import cn.flying.rest.service.utils.DateUtil;

@Path("informationPublish")
@Component
public class InformationPublishServerImpl extends BasePlatformService implements
    IInformationPublishService {
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
  public List<Map<String, Object>> selectAllType() {
    String sql = "select * from ess_publish_board";
    List<Map<String, Object>> result = null;
    try {
      result = query.query(sql, new MapListHandler());
      if (result == null) {
        result = new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }


  @Override
  public Map<String, Object> savePublishTopic(Map<String, Object> param) {
    String topicId = param.get("topicId") + "";
    String title = param.get("title") + "";
    String status = param.get("status") + "";
    String publicStatus = param.get("publicStatus") + "";
    String commentStatus = param.get("commentStatus") + "";
    String boardId = param.get("boardId") + "";
    String userId = param.get("userId") + "";
    String imageId = param.get("imgId")+"";
    String appStatus = param.get("appStatus")+"";
    @SuppressWarnings("unchecked")
    List<Map<String, String>> itemsText = (List<Map<String, String>>) param.get("itemsText");
    String summary = itemsText.get(0).get("summary");
    String text = itemsText.get(0).get("text");
    Map<String,String> statusMap = new HashMap<String,String>();
    statusMap.put("-1","只pc端发布");
    statusMap.put("-2","pc端和app同时发布");
    String statusType = "";
    if("1".equals(status) && "1".equals(appStatus)){
       statusType = "-2";
    }else if("1".equals(status)){
       statusType = "-1";
    }
    // 编辑和添加
    String sql = "";
    Map<String, Object> result = new HashMap<String, Object>();
    String date = DateUtil.formatDateTime(System.currentTimeMillis());
    try {
      if (!"".equals(topicId) && !"null".equals(topicId)) {
        Object[] values = {title, userId, status, publicStatus, date, imageId,appStatus,topicId};
        sql =
            "update ess_publish_topic set title=?,authorId=?,status=?,publicStatus=?,createTime=?,topicImageId=?,appStatus=? where id=?";
        int row = query.update (sql, values);
        if (row > 0) {
          Object[] values2 = {summary, text, date, topicId};
          sql = "update ess_publish_text set summary=?,text=?,updateTime=? where topicId=?";
          int row2 = query.update( sql, values2);
          if (row2 > 0) {
            Map<String,Object> log = new HashMap<String,Object>();
            log.put("ip", param.get("ip"));
            log.put("userid", param.get("userId"));
            log.put("module", "信息发布管理");
            log.put("operate", "信息发布管理：修改信息");
            if("".equals(statusType)){
              log.put("loginfo", "修改【"+ getTypeByBoardId(boardId)+"】标识为【"+topicId+"】的信息");
            }else{
              log.put("loginfo", "修改【"+ getTypeByBoardId(boardId)+"】标识为【"+topicId+"】的信息,并修改发布状态为【"+statusMap.get(statusType)+"】");
            }
            this.getLogService().saveLog(log);
            
            result.put("flag", "true");
            result.put("topicId", topicId);
            return result;
          }
        }

      } else {
        Object[] values = {boardId, title, userId, status, publicStatus, commentStatus,date,imageId,appStatus,};
        sql =
            "insert into ess_publish_topic (boardId,title,authorId,status,publicStatus,commentStatus,createTime,topicImageId,appStatus) values(?,?,?,?,?,?,?,?,?)";
        Long id = query.insert(sql,new ScalarHandler<Long>(), values);
        if (id > 0) {
          sql = "insert into ess_publish_text (topicId,summary,text,updateTime) values(?,?,?,?)";
          Object[] values2 = {id, summary, text, date};
          Long id2 = query.insert(sql,new ScalarHandler<Long>(),values2);
          if (id2 > 0) {
            Map<String,Object> log = new HashMap<String,Object>();
            log.put("ip", param.get("ip"));
            log.put("userid", param.get("userId"));
            log.put("module", "信息发布管理");
            log.put("operate", "信息发布管理：添加信息");
            if("".equals(statusType)){
              log.put("loginfo", "为【"+ getTypeByBoardId(boardId)+"】添加标题为【"+title+"】的信息");
            }else{
              log.put("loginfo", "为【"+ getTypeByBoardId(boardId)+"】添加标题为【"+title+"】的信息。发布状态为【"+statusMap.get(statusType)+"】");
            }
            this.getLogService().saveLog(log);
            
            result.put("flag", "true");
            result.put("topicId", id);
            return result;
          }
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
     
      return result;
    }
    return result;
  }


  @Override
  public Map<String, Object> getPublishTopicList(Map<String, Object> param) {
    Integer page = Integer.parseInt(param.get("page") + "");
    Integer pre = Integer.parseInt(param.get("pre") + "");
    String condition = param.get("condition") + "";
    // String userId = param.get("userId")+"";
    String boardId = param.get("boardId") + "";
    String accessType = param.get("accessType") + "";
    StringBuilder sql = new StringBuilder("select * from ess_publish_topic where 1=1");
    StringBuilder sqlCount = new StringBuilder("select count(1) from ess_publish_topic where 1=1");
    if ("2".equals(accessType)) {
      sql.append(" and status = 1");
      sqlCount.append(" and status = 1");
    }
    if (condition != null && !"".equals(condition)) {
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql.append(" and " + where);
      sqlCount.append(" and " + where);
    }
    Map<String, Object> result = new HashMap<String, Object>();
    try {
      sqlCount.append(" and boardId = ?");
      Long count = query.query(sqlCount.toString(), new ScalarHandler<Long>(),boardId);
      sql.append(" and boardId = ?");
      sql.append(" order by createTime desc");
      sql.append(" limit ?,?");
      Object[] par = {boardId, page, pre};
      List<Map<String, Object>> data = query.query(sql.toString(), new MapListHandler(), par);
      result.put("total", count);
      result.put("items", data);
      
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }


  @Override
  public Map<String, Object> GetPublishTopic(Map<String, Object> param) {
    String boardId = param.get("boardId") + "";
    String topicId = param.get("topicId") + "";
    String accessType = param.get("accessType") + "";
    Map<String, Object> result = null;
    try {
      if ("2".equals(accessType)) {
        String updateSql = "update ess_publish_topic set browseTimes=browseTimes+1 where id=?";

         query.update(updateSql, topicId);
      }
      String sql =
          "select a.*,b.topicId,b.summary,b.text from ess_publish_topic a left join  ess_publish_text b on a.id = b.topicId where a.boardId = ? and a.id = ?";
      result = query.query(sql, new MapHandler(), boardId, topicId);
      if (result == null)
        result = new HashMap<String, Object>();
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }


  @Override
  public String deletePublishTopic(Map<String, Object> param) {
    String boardId = param.get("boardId") + "";
    String ids = param.get("ids") + "";
    String sql1 = "delete from ess_publish_text where topicId in (" + ids + ")";
    String sql2 = "delete from ess_publish_topic where id in (" + ids + ")";
    try {
      int row1 = query.update(sql1);
      int row2 = query.update(sql2);
      if (row1 == row2) {
        Map<String,Object> log = new HashMap<String,Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("userId"));
        log.put("module", "信息发布管理");
        log.put("operate", "信息发布管理：删除信息");
        log.put("loginfo", "删除【"+getTypeByBoardId(boardId)+"】标识为【"+ids+"】的信息");
        this.getLogService().saveLog(log);
        
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除数据异常！";
    }
    return "删除数据失败！";
  }


  @Override
  public String updateTopicStatus(Map<String, Object> param) {

    String boardId = param.get("boardId") + "";
    String topicId = param.get("topicId") + "";
    String fileId = param.get("fileId") + "";
    String canType = param.get("canType") + "";// -1:发布 0：取消app端发布 1：取消pc端发布
    String time = DateUtil.formatDateTime(System.currentTimeMillis());
    StringBuilder sql = new StringBuilder("update ess_publish_topic set createTime='"+time+"'");
    if ("-1".equals(canType)) {
      sql.append(",status = 1");
      if (!"0".equals(fileId)) {
        sql.append(" ,appStatus=1, topicImageId = '" + fileId+"'");
        canType ="-2";
      }
     
    } else if ("0".equals(canType)) {
      sql.append(",appStatus = 0");
    } else if ("1".equals(canType)) {
      sql.append(",status = 0");
    }
    sql.append(" where id = " + topicId);
    try {
      int row  = query.update(sql.toString());
      if(row>0){
        
        Map<String,Object> log = new HashMap<String,Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("userId"));
        log.put("module", "信息发布管理");
        log.put("operate", "信息发布管理：更新发布状态");
        Map<String,String> status = new HashMap<String,String>();
        status.put("-1","只pc端发布");
        status.put("-2","pc端和app同时发布");
        status.put("0","取消app端发布");
        status.put("1","取消pc端发布");
        log.put("loginfo", "更新【"+getTypeByBoardId(boardId)+"】标识为【"+topicId+"】的信息状态【"+status.get(canType)+"】");
        this.getLogService().saveLog(log);
        
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "更新发布状态异常！";
    }
    return "更新发布状态失败！";
  }
   
  private String getTypeByBoardId(String boardId){
    Map<String,String> typeMap = new HashMap<String,String>();
    typeMap.put("1", "文控新闻");
    typeMap.put("2", "文控公告");
    typeMap.put("3", "文控其他");
    return typeMap.get(boardId);
  }
  
}
