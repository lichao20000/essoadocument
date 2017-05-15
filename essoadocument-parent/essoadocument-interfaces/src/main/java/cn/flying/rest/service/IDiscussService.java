package cn.flying.rest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import cn.flying.rest.service.utils.MediaTypeEx;
/**
 * 交流园地
 * @author rongying
 * 2015-04-13
 */
public interface IDiscussService {

	/**
	 * 获取交流园地首页信息列表或者根据itemId获取对应的回复内容
	 * @author wangtao 
	 * 2013-05-03
	 * @param start 获取列表的起始位置
	 * @param limit 每次获取列表的条数
	 * @param condition 过滤筛选条件 参数格式{'authorId':'作者ID',itemId':0}
	 * @return List<Map>
	 */	
	@POST
	@Path("getTopicList/{start}/{limit}")
	@Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	@Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	public List<Map<String, Object>> getTopicList(@PathParam("start") int start,@PathParam("limit") int limit, HashMap<String, Object> condition);
	
	/**
	 * 保存交流园地发布的信息 注：如果itemId==0表示新增反之则是更新对应的ID条目内容
	 * @author wangtao 
	 * 2013-05-03
	 * @param params 参数格式{'itemId':0,'authorId:'作者ID',authorName:'作者名称','ItemInfo':'发布的内容','imgList':['image1','image2','image3']}
	 * @return Map 返回操作提示{'result':'succeed Or failed':'itemId':ID}
	 */
	@POST
	@Path("saveTopicItem")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public HashMap<String, String> saveTopicItem(HashMap<String, Object> map);
	
	/**
	 * 删除自己发布的内容,需要将对应评论或者回复的内容同时删除
	 * @author wangtao 
	 * 2013-05-03
	 * @param id 删除信息的ID
	 */
	@POST
	@Path("delTopicItem")
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	public Boolean delTopicItem(HashMap<String, String> map);
	
	/**
	 * 添加回复信息
	 * @author wangtao
	 * 2013-05-03
	 * @param itemId 被回复信息的ID
	 * @param param 回复的内容及相关参数。格式{'replyerId':'回复人ID','replyerName':'回复人名称','replyInfo':'回复的内容','authorId':'被回复者ID','authorName':'被回复者名称'}
	 * @return Map 返回操作提示{'result':'succeed Or failed':'replyId':0}
	 */
	@POST
	@Path("addReplyItem/{itemId}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public HashMap<String, String> addReplyItem(@PathParam("itemId") int itemId,HashMap<String, String> map);
	/**
	 * 
	 * @desc：删除回复的数据
	 * @author: mazhaohui 2013-5-9 
	 * @param replyId 主键
	 * @return
	 */
	@POST
	@Path("delReplyById")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Boolean delReplyById(HashMap<String, String> map);
	
}
