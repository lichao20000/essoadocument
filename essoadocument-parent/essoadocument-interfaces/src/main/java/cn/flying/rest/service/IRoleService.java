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

import cn.flying.rest.service.entiry.Role;
import cn.flying.rest.service.utils.MediaTypeEx;

/**
 * 角色管理
 * 
 * @author xiewenda
 */
public abstract interface IRoleService {
  /**
   * 添加新的角色
   * 
   * @param role
   *          对应的添加数据
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("add")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String add(HashMap<String, Object> role);

  /**
   * 删除规定规范
   * 
   * @param ids
   *          要删除的角色id数组
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("delete/{userId}/{ip}")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String delete(Long ids[], @PathParam("userId") String userId,
      @PathParam("ip") String ip);

  /**
   * 批量删除
   * 
   * @param id
   * @return
   */
  @POST
  @Path("deleteDataAuth/{authIds}/{userId}/{ip}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteDataAuth(@PathParam("authIds") String authIds,
      @PathParam("userId") String userId, @PathParam("ip") String ip);

  /**
   * 根据id删除一个续借项
   * 
   * @param id
   * @return
   */
  @POST
  @Path("deleteRelend/{id}/{userId}/{ip}")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteRelend(@PathParam("id") int id,
      @PathParam("userId") String userId, @PathParam("ip") String ip);

  /**
   * 删除用户关联角色
   * 
   * @param param
   * @return
   */
  @POST
  @Path("deleteUserRole")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String deleteUserRole(HashMap<String, Object> param);

  /**
   * 获得所有的菜单
   * 
   * @return
   */
  @POST
  @Path("getAllMenu")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getAllMenu();

  /**
   * 根据角色的授权情况获得角色列表
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getAllRoleServer")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getAllRoleServer(
      HashMap<String, Object> param);

  @POST
  @Path("getArchiveAuthMenu")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getArchiveAuthMenu(
      HashMap<String, Object> param);
  
  
  @POST
  @Path("getDeskMenuTree")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getDeskMenuTree(
      HashMap<String, Object> param);
  
  @POST
  @Path("getUserDeskAppsDetails")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getUserDeskAppsDetails(
      HashMap<String, Object> param);
  
  @POST
  @Path("saveUserDeskApps")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveUserDeskApps(HashMap<String, Object> param);

  /**
   * 获得角色授权菜单记录
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getArchiveAuthMenuByRole")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getArchiveAuthMenuByRole(
      HashMap<String, Object> param);

  /**
   * 得到授权目录的信息
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getAuthTree")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getAuthTree(HashMap<String, Object> param);

  /**
   * 统计总的数据条数
   * 
   * @return 总条数
   */
  @GET
  @Path("count")
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCount();

  /**
   * 统计关联角色的总数
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getCountAllRole")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public Long getCountAllRole(HashMap<String, Object> param);

  /**
   * 根据条件获得所有的数据条数
   * 
   * @param param
   *          (包括分页条件，过滤条件)
   * @return 数据条数
   */
  @POST
  @Path("getCountByCondition")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public long getCountByCondition(HashMap<String, Object> param);

  /**
   * 得到权限数据
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getDataAuth")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getDataAuth(HashMap<String, Object> param);

  /**
   * 根据id获得一个授权项
   * 
   * @param id
   * @return
   */
  @POST
  @Path("getDataAuthById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getDataAuthById(@PathParam("id") long id);

  /**
   * 获得授权数据的树节点
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getDataTree")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getDataTree(HashMap<String, Object> param);

  /**
   * 根据用户得到借阅信息
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getLendByRole/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getLendByRole(@PathParam("id") int id);

  /**
   * 获得角色下的续借数据
   * 
   * @param param
   * @return
   */
  @POST
  @Path("getRelendByRole")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getRelendByRole(HashMap<String, Object> param);

  /**
   * 根据过滤条件获得数据
   * 
   * @param param
   *          (包括分页条件，过滤条件)
   * @return 数据集合
   */
  @POST
  @Path("getRoleByCondition")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getRoleByCondition(
      HashMap<String, Object> param);

  /**
   * 根据角色id获得角色信息
   * 
   * @param id
   *          角色id
   * @return 角色实体
   */
  @GET
  @Path("getRoleById/{id}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Role getRoleById(@PathParam("id") long id);

  /**
   * 通过角色标示获取角色对象
   * 
   * @param roleId
   * @return
   */
  @GET
  @Path("getRoleByRoleId/{roleId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Role getRoleByRoleId(@PathParam("roleId") String roleId);

  @GET
  @Path("getRoleListByUserCode/{userId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getRoleListByUserCode(
      @PathParam("userId") String userId);

  /**
   * 根据用户id获取所有角色列表
   * 
   * @param userId
   * @return
   */
  @GET
  @Path("getRoleListByUserId/{userId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getRoleListByUserId(
      @PathParam("userId") long userId);

  @POST
  @Path("getRolesByUserId")
  @Consumes(MediaTypeEx.TEXT_PLAIN_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getRolesByUserId(int userId);

  /**
   * 通过角色id获取所有用户id
   * 
   * @param roleId
   * @return
   */
  @GET
  @Path("getUserListByRoleId/{roleId}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getUserListByRoleId(
      @PathParam("roleId") long roleId);

  @POST
  @Path("getUserRole")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getUserRole(HashMap<String, Object> param);

  /**
   * 判断角色标识是否存在
   * 
   * @param param
   * @return 存在返回 true 不存在返回false
   */
  @POST
  @Path("judgeIfExistsRoleId")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String judgeIfExistsRoleId(HashMap<String, Object> param);

  /**
   * 判断角色名是否存在
   * 
   * @param param
   * @return 存在返回 true 不存在返回false
   */
  @POST
  @Path("judgeIfExistsRoleName")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String judgeIfExistsRoleName(HashMap<String, Object> param);

  /**
   * 获得角色列表
   * 
   * @param condition
   *          根据条件获取（分页条件，查询条件等）
   * @return 如果失败返回错误信息，成功返回查询的数据
   */
  @POST
  @Path("list")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> list(HashMap<String, Object> condition);

  /**
   * 得到本节点关联的结构详情
   * 
   * @param param
   * @return
   */
  @POST
  @Path("preGetPackageRight")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> preGetPackageRight(HashMap<String, Object> param);

  /**
   * 保存授权的节点
   * 
   * @param param
   * @return
   */
  @POST
  @Path("saveAuthTreeNodes")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveAuthTreeNodes(HashMap<String, Object> param);

  /**
   * 保存数据权限
   * 
   * @param param
   * @return
   */
  @POST
  @Path("saveDataAuth")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveDataAuth(HashMap<String, Object> param);

  /**
   * 保存授权菜单
   * 
   * @param param
   *          参数
   * @return 成功返回'success' 失败返回异常信息
   */
  @POST
  @Path("saveMenuAuth")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveMenuAuth(HashMap<String, Object> param);

  /**
   * 保存续借条目
   * 
   * @param param
   * @return
   */
  @POST
  @Path("saveRelendRoleLend")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveRelendRoleLend(HashMap<String, Object> param);

  /**
   * 保存借阅
   * 
   * @param param
   * @return
   */
  @POST
  @Path("saveRoleLends")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveRoleLends(HashMap<String, Object> param);

  /**
   * 
   * @param param
   * @return
   */
  @POST
  @Path("saveUserRole")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String saveUserRole(HashMap<String, Object> param);

  /**
   * 更新规定规范
   * 
   * @param role
   *          更新的角色数据以及要更新的角色的唯一标示id
   * @return 如果失败返回错误信息，成功返回空字符串
   */
  @POST
  @Path("update")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String update(HashMap<String, Object> role);
  
  //========xiewenda 20150513 文件收集模块目录授权相关方法 start========================\\
  @POST
  @Path("getUserDirAuth")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getUserDirAuth(Map<String, Object> param);
  
  @POST
  @Path("getDirNodeAuth")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public List<Map<String, Object>> getDirNodeAuth(Map<String, Object> param);
//\\=======================文件收集模块目录授权相关方法   end============================//
  
  /**
   * 获取当前登录用户目录树和数据权限
   * @param userId
   * @return
   */
  @GET
  @Path("getTreeAndDataAuth/{userId}/{admin}")
  @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
  public Map<String, Object> getTreeAndDataAuth(
      @PathParam("userId") String userId,@PathParam("admin") String admin);

  /**
   * 验证是否存在满足筛选条件的文件
   * @param doc
   * @return
   */
  @POST
  @Path("getDocFilterById")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getDocFilterById(Map<String, Object> doc);

  /**
   * 验证是否存在满足筛选条件的电子文件
   * @param doc
   * @return
   */
  @POST
  @Path("getFileFilterById")
  @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
  @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
  public String getFileFilterById(Map<String, Object> map);
}