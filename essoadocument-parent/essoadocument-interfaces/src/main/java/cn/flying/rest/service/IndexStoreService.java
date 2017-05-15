package cn.flying.rest.service;

import java.util.Map;
import java.util.Set;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * 
 * @author zhanglei 20131024
 *
 */
public interface IndexStoreService {
	
	/**
	 * 按索引ID获取条目明细
	 * @author zhanglei 20131024
	 * @param param
	 * @return
	 */
	@POST
	@Path("queryIndexByDoc")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public Map<String,Object> queryIndexByDoc(Map<String,Object> param);
	
	/**
	 * 实时添加索引任务
	 * @author zhanglei 20131114
	 * @param param
	 * @return
	 */
	@POST
	@Path("setupIndex")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	public String setupIndex(Map<String,Object> param);
	
	/**
	 * 即时启动索引同步任务（内部使用）
	 * @author zhanglei 20131104
	 * @param struId -1同步全部结构
	 * return
	 */
	@POST
	@Path("runIndexTask")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	public String runIndexTask(Set<String> executeSet);
	
	/**
	 * 提交剩余未提交的索引变更
	 * @author zhanglei 20131108
	 * return
	 */
	@GET
	@Path("commitIndexChange")
	@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	public String commitIndexChange();
	
	/**
	 * 调试使用
	 * @author zhanglei 20131210
	 * @return
	 */
	@GET
	@Path("debugExecutor")
	@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	public String debugExecutor();
	
	
	/**
	 * 删除索引（调试使用）
	 * @author zhanglei 20140103
	 * @param module
	 * @param param
	 * return
	 */
	@POST
	@Path("deleteIndex/{module}")
	@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	public String deleteIndex(@PathParam("module")String module, Map<String,String> param);
	
	/**
     * 关闭索引库
     * @author
     * @param id
     * @param param
     * return
     */
    @POST
    @Path("closeIndexStore/{id}/{nodeId}")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public boolean closeIndexStore(@PathParam("id")String id, @PathParam("nodeId")String nodeId);
    
    /**
     * 优化索引库
     * @author
     * @param id
     * @param param
     * return
     */
    @POST
    @Path("optimizeIndexStore/{id}/{nodeId}")
    @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
    public boolean optimizeIndexStore(@PathParam("id")String id, @PathParam("nodeId")String nodeId);
	
}
