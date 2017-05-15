package cn.flying.rest.service;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;


/**
 * 角色管理
 * 
 * @author xiewenda
 */
public abstract interface ILogService {



//本地日志
/**
 * 保存日志
 * @author shimiao 保存功能操作的日志 20140428
 * @param map日志的数据 map -> ip loginfo（功能具体操作的内容 ）module （功能模版名称） operate（模版操作的动作） userid用户名 
 * @return boolean
 */
@POST
@Path("saveLog")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
public Boolean saveLog(Map<String, Object> map);

@POST
@Path("addLoginLog")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
public Boolean addLoginLog(Map<String, Object> param);
/**
 * 根据id查询日志
 * @author xuxinjian 20130329
 * @param id 日志id
 * @return 日志
 */
@GET
@Path("getLogById/{id}")
@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
public HashMap<String, String> getLogById(@PathParam("id") Long id);
/**
 * 根据筛选条件查询日志列表
 * @author xuxinjian 20130329
 * @param condition 筛选条件
 * @return 日志列表
 */
@POST
@Path("getLogListByCondition")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
public Map<String,Object> getLogListByCondition(Map<String,Object> map);

/**
 * 根据ids查询档案门类
 * @param ids
 * @return
 */
@POST
@Path("exportLogData")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
public String exportLogData(HashMap<String,Object> map);
/***end shimiao****/

/**
 * shimiao 20140424  用户访问其他应用服务时,map - userid appid apptoken ip model
 * @param map
 * @PathParam("userid")String userid,
        @PathParam("appid")String appid,@PathParam("apptoken")String apptoken,
        @PathParam("ip")String ip,@PathParam("model")String model
 * */
@POST
@Path("saveAccessModel")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
public boolean saveAccessModel(HashMap<String,Object> map);
/**
 * shimiao 20140428 删除日志
 * @param map
 * @return
 */
@POST
@Path("deleteLogData")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
public boolean deleteLogData(HashMap<String,Object> map);

/**
 * shimiao 20140630 得到统计的data
 * @param map
 * @return
 */
@POST
@Path("getStatisticData")
@Consumes(MediaType.APPLICATION_JSON + ";charset=UTF-8")
@Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
public String getStatisticData(Map<String, Object> map);

}