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
import cn.flying.rest.service.IDiscussService;
import cn.flying.rest.service.ILogService;

/**
 * 交流园地
 * @author rongying 2015-04-13
 *
 */
@Path("discuss")
@Component
public class DiscussServiceImpl extends BasePlatformService implements IDiscussService {
  @Resource(name = "queryRunner")
  private QueryRunner query;
  private ILogService logService;
  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }
  /**
	 * 获取交流园地首页信息列表或者根据itemId获取对应的回复内容
	 * @author rongying 20150413
	 * @param start 获取列表的起始位置
	 * @param limit 每次获取列表的条数
	 * @param condition 过滤筛选条件 参数格式{'authorId':'作者ID',itemId':0}
	 * @return List<Map>
	 */	
	@Override
	public List<Map<String, Object>> getTopicList(int start,int limit, HashMap<String, Object> condition){
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			//itemId = 0 表示获取所有发布信息
			if("0".equals(condition.get("itemId"))){
				StringBuilder builder = new StringBuilder();
				builder.append(" SELECT id,authorId,authorName,createTime,is_del,msg,replyCount ");
				builder.append("FROM ess_discuss_msg ORDER BY createTime DESC ");
				builder.append(" LIMIT "+start+","+limit);
				list = query.query(builder.toString(), new MapListHandler());
				if(!list.isEmpty()){
					for(Map<String, Object> map:list){
						String sql = " SELECT  img_list from ess_discuss_img WHERE msgId= "+map.get("id");
						List<String> imgList = new ArrayList<String>();
						String imgs = query.query(sql,new ScalarHandler<String>());
						imgList.add(imgs);
						map.put("img_list", imgList);
					}
				}
			}else{ //获取评论信息
				StringBuilder replyBuilder = new StringBuilder();
				replyBuilder.append(" SELECT id,msgId,replyContent,replyerId,replyerName,replyTime ");
				replyBuilder.append(" FROM ess_discuss_reply WHERE msgId='"+condition.get("itemId").toString()+"' ORDER BY replyTime DESC ");
				replyBuilder.append(" LIMIT "+start+","+limit);
				list = query.query(replyBuilder.toString(), new MapListHandler());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	};

	/**
	 * 保存交流园地发布的信息 注：如果itemId==0表示新增反之则是更新对应的ID条目内容
	 * @author rongying 20150413
	 * @param params 参数格式{'itemId':0,'authorId:'作者ID',authorName:'作者名称','ItemInfo':'发布的内容','imgList':['image1','image2','image3']}
	 * @return Map 返回操作提示{'result':'succeed Or failed':'itemId':ID}
	 */
	@SuppressWarnings("unchecked")
	@Override
	public HashMap<String, String> saveTopicItem(HashMap<String, Object> map){
		HashMap<String,String> map1 = new HashMap<String,String>();
		try {
			String sql = "insert into ess_discuss_msg (authorId,authorName,msg,createTime) values (?,?,?,?)";
			String authorId = map.get("authorId") == null ? "" : map.get("authorId").toString();
			String authorName = map.get("authorName") == null ? "" : map.get("authorName").toString();
			String msg = map.get("itemInfo") == null ? "" : map.get("itemInfo").toString();
			String createTime = map.get("createTime") == null ? "" : map.get("createTime").toString();
			int row = query.update(sql,new Object[] { authorId,authorName, msg,createTime });
			//获取新增记录的自增主键 
			HashMap<String, Object> id = (HashMap<String, Object>) query.query("SELECT max(id) from ess_discuss_msg", new MapHandler());
            map1.put("itemId", String.valueOf(id.get("max(id)")));
			if(row>0){
	            List<String> imgList = (List<String>)map.get("img_list");
	    		sql = "insert into ess_discuss_img (msgId,img_list) values (?,?)";
	    		if(imgList.size()>0){
	    			Object[][] params = new Object[imgList.size()][2];
		    		for(int i=0;i<imgList.size();i++){
						String imgStr = imgList.get(i)==null?"":imgList.get(i).toString();
						params[i][0] = id;
						params[i][1] = imgStr;
					}
		    		row += query.insertBatch(sql, new ScalarHandler<Long>(), params);
	    		}
	    		map1.put("result", "succeed");
	    		// 写本地日志
	    		Map<String,Object> log = new HashMap<String,Object>();
	            log.put("ip", map.get("remoteAddr"));
	            log.put("userid", map.get("userId"));
	            log.put("module", "交流园地");
	            log.put("operate", "交流园地：发布信息");
	            log.put("loginfo", map.get("userName")+"成功发布新信息！");
	            this.getLogService().saveLog(log);
			}else{
				map1.put("result", "failed");
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return map1;
	}
	
	/**
	 * 删除自己发布的内容,需要将对应评论或者回复的内容同时删除
	 * @author rongying 20150413
	 * @param id 删除信息的ID
	 */
	@Override
	public Boolean delTopicItem(HashMap<String, String> map){
		boolean flag = false;
		try {
			Integer id = Integer.parseInt(map.get("id"));
			String sql = "DELETE FROM ess_discuss_msg WHERE ID = " + id;
			String sql1 = "DELETE FROM ess_discuss_img WHERE msgId = " + id;
			String sql2 = "DELETE FROM ess_discuss_reply WHERE msgId = " + id;
			int row = query.update(sql);
			if(row > 0){
				query.update(sql1);
				query.update(sql2);
				flag = true;
				// 写本地日志
	    		Map<String,Object> log = new HashMap<String,Object>();
	            log.put("ip", map.get("remoteAddr"));
	            log.put("userid", map.get("userId"));
	            log.put("module", "交流园地");
	            log.put("operate", "交流园地：删除信息");
	            log.put("loginfo", map.get("userName")+"删除了信息");
	            this.getLogService().saveLog(log);
			}else{
				flag = false;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return flag;
	}
	
	/**
	 * 添加回复信息
	 * @author rongying 20150413
	 * @param itemId 被回复信息的ID
	 * @param param 回复的内容及相关参数。格式{'replyerId':'回复人ID','replyerName':'回复人名称','replyInfo':'回复的内容','authorId':'被回复者ID','authorName':'被回复者名称'}
	 * @return Map 返回操作提示{'result':'succeed Or failed':'replyId':0}
	 */
	@Override
	public HashMap<String, String> addReplyItem(int itemId,HashMap<String, String> map){
		try {
			String sql = "insert into ess_discuss_reply (msgId,replyContent,replyerId,replyerName,replyTime) values (?,?,?,?,?)";
			String replyContent = map.get("replyContent") == null ? "" : map.get("replyContent").toString();
			String replyerId = map.get("replyerId") == null ? "" : map.get("replyerId").toString();
			String replyerName = map.get("replyerName") == null ? "" : map.get("replyerName").toString();
			String replyTime = map.get("replyTime") == null ? "" : map.get("replyTime").toString();
			int row = query.update(sql,new Object[] {itemId,replyContent,replyerId, replyerName,replyTime });
			//获取新增记录的自增主键 
			HashMap<String, Object> id = (HashMap<String, Object>) query.query("SELECT max(id) from ess_discuss_reply", new MapHandler());
			map.put("replyId", String.valueOf(id.get("max(id)")));
			if(row>0){
				sql = "update  ess_discuss_msg set replyCount= (CASE WHEN replyCount IS NULL THEN 1 ELSE  replyCount+1 END) where id = "+itemId;
				query.update(sql);
				map.put("result", "succeed");
	    		// 写本地日志
	    		Map<String,Object> log = new HashMap<String,Object>();
	            log.put("ip", map.get("remoteAddr"));
	            log.put("userid", map.get("replyerId"));
	            log.put("module", "交流园地");
	            log.put("operate", "交流园地：信息回复");
	            log.put("loginfo", map.get("replyerName")+"回复了信息！");
	            this.getLogService().saveLog(log);
			}else{
				map.put("result", "failed");
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return map;
	}
	
	/**
	 * 
	 * @desc：删除回复的数据
	 * @author: caojain 20140409
	 * @param replyId 主键
	 * @return
	 */
	@Override
	public Boolean delReplyById(HashMap<String, String> map) {
		boolean flag = false;
		try {
			Integer replyId = Integer.parseInt(map.get("id"));
			//查询回复对应的话题id
			String selSql = "SELECT msgId FROM ess_discuss_reply where id = " + replyId;
			int msgId = query.query(selSql, new ScalarHandler<Integer>());
			String sql = "DELETE FROM ess_discuss_reply WHERE id = " + replyId;
			int row = query.update(sql);
			if(row > 0){
				sql = "update ess_discuss_msg set replyCount=replyCount-1 where id = " + msgId;
				query.update(sql);
				flag = true;
				// 写本地日志
	    		Map<String,Object> log = new HashMap<String,Object>();
	            log.put("ip", map.get("remoteAddr"));
	            log.put("userid", map.get("userId"));
	            log.put("module", "交流园地");
	            log.put("operate", "交流园地：删除信息回复");
	            log.put("loginfo", map.get("userName")+"删除了信息的回复！");
	            this.getLogService().saveLog(log);
			}else{
				flag = false;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return flag;
	}
}
