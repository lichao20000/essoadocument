package cn.flying.rest.service.impl;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.ColumnListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.flying.rest.entity.UserEntry;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.IFilingService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IRoleService;
import cn.flying.rest.service.IStatisticService;
import cn.flying.rest.service.entiry.Role;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.ConvertUtil;

/**
 * 角色管理
 * 
 * @author xie
 * 
 */
@Path("role")
@Component
public class RoleServiceImpl extends BasePlatformService implements
    IRoleService {

  @Resource(name = "queryRunner")
  private QueryRunner query;
  private String instanceId;

  private IStatisticService statisticService;

  private ILogService logService;

  private UserQueryService userQueryService;

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

  public ILogService getLogService() {
    if (this.logService == null) {
      this.logService = this.getService(ILogService.class);
    }
    return logService;
  }

  private IFilingService filingService;

  public IFilingService getFilingService() {
    if (this.filingService == null) {
      this.filingService = this.getService(IFilingService.class);
    }
    return this.filingService;
  }

  @Resource
  public void setStatisticService(IStatisticService statisticService) {
    this.statisticService = statisticService;
  }

  @Override
  public String add(HashMap<String, Object> role) {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String dateNowStr = sdf.format(new Date());
    String sql = "insert into ess_role values(null,?,?,?,?,?,?)";
    Object[] param = { role.get("roleId"), role.get("roleName"),
        role.get("roleRemark"), dateNowStr, dateNowStr, role.get("isSystem") };
    int rows = 0;
    try {
      rows = query.update(sql, param);
    } catch (SQLException e) {
      e.printStackTrace();
      return "添加异常，请联系管理员！";
    }
    if (rows > 0) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", role.get("ip"));
      log.put("userid", role.get("userId"));
      log.put("module", "角色管理");
      log.put("operate", "添加角色");
      log.put("loginfo", "添加【" + role.get("roleName") + "】角色");
      this.getLogService().saveLog(log);
      return "success";
    }
    return "添加失败，请联系管理员！";
  }

  private void addChildNodes(Map<String, Object> map,
      List<Map<String, Object>> treeList,
      List<Map<String, Object>> treeListByOrder) {
    for (Map<String, Object> m : treeList) {
      if (m.get("pId").toString().equals(map.get("id").toString())) {
        treeListByOrder.add(m);
        addChildNodes(m, treeList, treeListByOrder);
      }
    }

  }

  @Override
  public String delete(Long[] ids, String userId, String ip) {
    String sql = "delete from ess_role where id=?";
    String idStr = "";
    Object[][] params = new Object[ids.length][];
    for (int i = 0; i < ids.length; i++) {
      params[i] = new Object[] { ids[i] };
      idStr += ids[i] + ",";
    }
    int rows[] = {};
    try {
      rows = query.batch(sql, params);
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除异常，请联系管理员！";
    }
    if (rows.length > 0) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "角色管理");
      log.put("operate", "修改角色");
      log.put("loginfo", "删除角色标识为【" + idStr + "】的角色");
      this.getLogService().saveLog(log);

      return "success";
    }
    return "删除失败，没有找到删除数据！";
  }

  private boolean deleteAuthNodes(List<String> deletePath) {
    Object[][] params = new Object[deletePath.size()][];
    for (int i = 0; i < deletePath.size(); i++) {
      params[i] = new Object[] { deletePath.get(i) };
    }
    String sql = "delete from ess_tree_auth where id = ?";
    int rows[] = {};
    try {
      rows = query.batch(sql, params);
      if (rows.length > 0)
        return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
    return false;
  }

  @Override
  public String deleteDataAuth(String authIds, String userId, String ip) {
    String sql = "delete from ess_data_auth where id=?";
    String[] ids = authIds.split(",");
    Object[][] params = new Object[ids.length][];
    for (int i = 0; i < ids.length; i++) {
      params[i] = new Object[] { ids[i] };
    }
    int rows[] = {};
    try {
      rows = query.batch(sql, params);
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除异常，请联系管理员！";
    }
    if (rows.length > 0) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", ip);
      log.put("userid", userId);
      log.put("module", "角色管理");
      log.put("operate", "删除数据权限");
      log.put("loginfo", "删除标识为【" + authIds + "】的数据权限");
      this.getLogService().saveLog(log);
      return "success";
    }
    return "删除失败，没有找到删除数据！";
  }

  @Override
  public String deleteRelend(int id, String userId, String ip) {
    String sql = "delete from ess_using_role_relend_count where id=?";
    try {
      int row = query.update(sql, id);
      if (row > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", ip);
        log.put("userid", userId);
        log.put("module", "角色管理");
        log.put("operate", "角色借阅删除");
        log.put("loginfo", "删除标识为【" + id + "】的借阅信息");
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "删除异常！";
    }
    return "删除失败！";
  }

  @Override
  public String deleteUserRole(HashMap<String, Object> param) {
    String roleIds = param.get("roleIds") + "";
    String userId = param.get("userId") + "";
    String[] roleArr = {};
    if (!"null".equals(roleIds) && !"".equals(roleIds)) {
      roleArr = roleIds.split(",");
    }
    String sql = "delete from ess_user_role where userId= ? and roleId = ?";
    Object[][] params = new Object[roleArr.length][];
    for (int i = 0; i < roleArr.length; i++) {
      params[i] = new Object[] { userId, roleArr[i] };
    }

    try {
      int[] rows = query.batch(sql, params);
      if (rows.length > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("user"));
        log.put("module", "角色管理");
        log.put("operate", "移除用户角色");
        log.put("loginfo", "移出用户【" + userId + "】标识为【" + roleIds + "】的角色");
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "角色删除异常";
    }
    return "角色删除失败";
  }

  @Override
  public List<Map<String, Object>> getAllMenu() {
    String sql = "select id,pId,name,controller,action from ess_menu";
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    try {
      result = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("id", 0);
    map.put("pId", -1);
    map.put("name", "菜单列表");
    result.add(0, map);
    return result;
  }

  @Override
  public List<Map<String, Object>> getAllRoleServer(
      HashMap<String, Object> param) {
    String idStr = param.get("idStr") + "";
    String startNo = param.get("startNo") + "";
    String keyWord = param.get("keyWord") + "";
    String limit = param.get("limit") + "";
    String[] idArr = idStr.split(",");
    String idStrs = "";
    for (String id : idArr) {
      idStrs += "'" + id + "',";
    }
    String sql = "select * from ess_role where 1=1 ";
    if (!"".equals(idStrs) && !"null".equals(idStrs)) {
      idStrs = idStrs.substring(0, idStrs.length() - 1);
      sql += "and id not in (" + idStrs + ") ";
    }
    if (!"".equals(keyWord) && !"null".equals(keyWord)) {
      sql += "and (roleId like '%" + keyWord + "%' ";
      sql += "or roleName like '%" + keyWord + "%' ";
      sql += "or roleRemark like '%" + keyWord + "%' ) ";
    }

    if (!"null".equals(startNo) && !"null".equals(limit)) {
      sql += "limit " + startNo + "," + limit;
    }
    List<Map<String, Object>> map = new ArrayList<Map<String, Object>>();
    try {
      map = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return map;
    }
    return map;
  }

  @Override
  public List<Map<String, Object>> getArchiveAuthMenu(
      HashMap<String, Object> param) {
    String userId = param.get("userId") + "";
    UserEntry user = this.getUserQueryService().findUserByUserid(
        this.getServiceId(), this.getToken(), userId, null);
    String roleIds = getRolesByUserId(user.getId());
    String[] roleArr = roleIds.split(",");
    List<String> roleIdList = Arrays.asList(roleArr);
    // 全部菜单
    List<Map<String, Object>> allMenus = getAllMenu();
    // 包含1 表示具有admin角色 admin 为最高权限
    if (roleIdList.contains("1")) {
      return allMenus;
    } else {
      // 包含了所有的用户下的角色的菜单显示权限信息
      List<String> authResources = getAuthMenuByUserId(user.getId());
      // 要通过遍历得到所有权限的无重复的并集
      List<String> resourceList = new ArrayList<String>();
      for (String res : authResources) {
        if (res != null) {
          String[] resArr = res.split(",");
          for (String node : resArr) {
            if (!resourceList.contains(node)) {
              resourceList.add(node);
            }
          }
        }
      }
      // 根据无重复并集的菜单权限集合（就是树节点id的集合）得到权限树
      List<Map<String, Object>> authMenus = new ArrayList<Map<String, Object>>();
      for (Map<String, Object> node : allMenus) {
        if (resourceList.contains(node.get("id") + "")) {
          authMenus.add(node);
        }
      }
      return authMenus;
    }
  }

  @Override
  public Map<String, Object> getArchiveAuthMenuByRole(
      HashMap<String, Object> param) {
    String sql = "select * from ess_menu_auth where role_id = ?";
    Map<String, Object> result = new HashMap<String, Object>();
    try {
      result = query.query(sql, new MapHandler(), param.get("roleId"));
      if (result == null) {
        result = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }

  private List<String> getAuthMenuByUserId(int id) {
    String sql = "select resource from ess_user_role a left join ess_menu_auth b on a.roleId = b.role_id where a.userId = ?";
    List<String> list = null;
    try {
      list = query.query(sql, new ColumnListHandler<String>(), id);
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return list;
  }

  @Override
  public List<Map<String, Object>> getAuthTree(HashMap<String, Object> param) {
    /**
     * 1.得到顺序树 2.根据参数获得角色下和所有的授权节点记录 3.根据授权节点组装顺序树的初始状态 4.返回顺序树状态
     */
    // 1根据节点类型nodeType 获得节点树
    String nodeType = param.get("nodeType") + "";
    List<Map<String, Object>> treeList = new ArrayList<Map<String, Object>>();
    treeList = statisticService.getTreeList(Integer.parseInt(nodeType));

    List<Map<String, Object>> treeListByOrder = new ArrayList<Map<String, Object>>();
    // 得到有顺序的树的集合
    for (Map<String, Object> map : treeList) {
      treeListByOrder.add(map);
      // 迭代每一次添加的节点 优先添加其子节点
      this.addChildNodes(map, treeList, treeListByOrder);
      if (treeListByOrder.size() == treeList.size())
        break;
    }
    // 2 根据nodeType 和 roleId 得到所有的授权节点
    List<Map<String, Object>> treeAuthNodes = getTreeAuthNodes(param);
    // 把授权的节点以节点为key 节点信息为value 转换为map
    Map<String, Map<String, Object>> treeAuthNodesMap = new HashMap<String, Map<String, Object>>();
    // 获得所有授权的节点id集合
    Set<String> nodeSet = new HashSet<String>();
    for (Map<String, Object> node : treeAuthNodes) {
      nodeSet.add(node.get("tree_id") + "");
      treeAuthNodesMap.put(node.get("tree_id") + "", node);
    }
    // // 得到所有的pId的无重复集合 为初始化节点树的isLeaf属性做准备
    Set<String> pidSet = new HashSet<String>();
    for (Map<String, Object> node : treeList) {
      pidSet.add(node.get("pId") + "");
    }
    // 4 授权节点初始化
    List<Map<String, Object>> authNodeList = new ArrayList<Map<String, Object>>();
    for (Map<String, Object> node : treeListByOrder) {
      // 判断是否为授权节点
      String nodeId = node.get("id") + "";
      Map<String, Object> authNode = treeAuthNodesMap.get(nodeId);
      // 如果此树节点存在与授权数据中，加入授权节点的id，节点标识为选中，加入授权信息
      if (authNode != null) {
        node.put("authId", authNode.get("id") + "");
        node.put("checked", true);
        node.put("rights", authNode.get("reserved_1") + "");
      } else {
        node.put("authId", "-1");
        node.put("checked", false);
        node.put("rights", "");
      }
      // 是父节点的 授权信息为"" 是否叶子节点为0.
      if (pidSet.contains(nodeId)) {
        node.put("isLeaf", "0");
        // node.put("rights", "");
      } else {
        node.put("isLeaf", "1");
      }

      node.put("nodeType", nodeType);
      authNodeList.add(node);
    }
    return authNodeList;
  }

  @Override
  public long getCount() {
    String sql = "select count(1) from ess_role";
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
  public Long getCountAllRole(HashMap<String, Object> param) {
    String idStr = param.get("idStr") + "";
    String keyWord = param.get("keyWord") + "";
    String[] idArr = idStr.split(",");
    String idStrs = "";
    for (String id : idArr) {
      idStrs += "'" + id + "',";
    }
    String sql = "select count(1) from ess_role where 1=1 ";
    if (!"".equals(idStrs) && !"null".equals(idStrs)) {
      idStrs = idStrs.substring(0, idStrs.length() - 1);
      sql += "and id not in (" + idStrs + ") ";
    }
    if (!"".equals(keyWord) && !"null".equals(keyWord)) {
      sql += "and (roleId like '%" + keyWord + "%' ";
      sql += "or roleName like '%" + keyWord + "%' ";
      sql += "or roleRemark like '%" + keyWord + "%') ";
    }
    Long count = 0L;
    try {
      count = query.query(sql, new ScalarHandler<Long>());
    } catch (SQLException e) {
      e.printStackTrace();
      return count;
    }
    return count;
  }

  @Override
  public long getCountByCondition(HashMap<String, Object> param) {
    String sql = "select count(1) from ess_role where 1=1 ";
    Long num = 0L;
    if (param.get("condition") != null) {
      String condition = (String) param.get("condition");
      // 此方法将过滤条件转换为sql语句 返回拼接后sql的字符串
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql += " and " + where;
    }
    try {
      num = query.query(sql, new ScalarHandler<Long>());
    } catch (SQLException e) {
      e.printStackTrace();
      return num;
    }
    return num;
  }

  @Override
  public List<Map<String, Object>> getDataAuth(HashMap<String, Object> param) {
    // 获取参数
    String roleId = param.get("roleId") + "";
    String treeId = param.get("treeId") + "";
    String nodeType = param.get("nodeType") + "";
    String sql = "select * from ess_data_auth where role_id=? and tree_id=? and nodeType=?";
    Object[] par = { roleId, treeId, nodeType };
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    try {
      result = query.query(sql, new MapListHandler(), par);
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }

  @Override
  public Map<String, Object> getDataAuthById(long id) {
    String sql = "select * from ess_data_auth where id=?";
    Map<String, Object> result = new HashMap<String, Object>();
    try {
      result = query.query(sql, new MapHandler(), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }

  @Override
  public List<Map<String, Object>> getDataTree(HashMap<String, Object> param) {
    List<Map<String, Object>> treeList = statisticService.getTreeList(1);
    List<Map<String, Object>> treeListByOrder = new ArrayList<Map<String, Object>>();
    // 得到有顺序的树的集合
    for (Map<String, Object> map : treeList) {
      treeListByOrder.add(map);
      // 迭代每一次添加的节点 优先添加其子节点
      this.addChildNodes(map, treeList, treeListByOrder);
      if (treeListByOrder.size() == treeList.size())
        break;
    }
    return treeListByOrder;
  }

  @Override
  public Map<String, Object> getLendByRole(int id) {
    Map<String, Object> result = new HashMap<String, Object>();
    String sql = "select * from ess_using_role where roleId = ?";
    try {
      result = query.query(sql, new MapHandler(), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    if (result == null)
      result = new HashMap<String, Object>();
    return result;
  }

  @Override
  public Map<String, Object> getRelendByRole(HashMap<String, Object> param) {
    String roleId = param.get("roleId") + "";
    String start = param.get("start") + "";
    String limit = param.get("limit") + "";
    Map<String, Object> result = new HashMap<String, Object>();
    String sql1 = "select * from ess_using_role_relend_count where roleId = ? limit ?,?";
    String sql2 = "select count(1) from ess_using_role_relend_count where roleId = ?";
    List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    try {
      Long count = query.query(sql2, new ScalarHandler<Long>(), roleId);
      result.put("count", count);
      list = query.query(sql1, new MapListHandler(), roleId,
          Integer.parseInt(start), Integer.parseInt(limit));
      result.put("data", list);
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }

  @Override
  public List<Map<String, Object>> getRoleByCondition(
      HashMap<String, Object> param) {
    String sql = "select * from ess_role where 1=1 ";
    List<Map<String, Object>> result = null;

    if (param.get("condition") != null) {
      String condition = (String) param.get("condition");
      // 此方法将过滤条件转换为sql语句 返回拼接后sql的字符串
      String where = new ConvertUtil().conditonToSql(condition, "&", ",");
      sql += " and " + where;
    }
    if (param.get("page") != null && param.get("pre") != null) {
      sql += " limit " + param.get("page") + ", " + param.get("pre");
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
  public Role getRoleById(long id) {
    String sql = "select * from ess_role where id = ?";
    Role role = null;
    try {
      role = query.query(sql, new BeanHandler<Role>(Role.class), id);
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    return role;
  }

  @Override
  public Role getRoleByRoleId(String roleId) {
    String sql = "select * from ess_role where roleId=? ";
    try {
      Map<String, Object> map = null;
      map = query.query(sql, new MapHandler(), new Object[] { roleId });
      if (map == null || map.isEmpty()) {
        return null;
      } else {
        Role role = new Role();
        role.setId(map.get("id").toString());
        role.setRoleId(map.get("roleId").toString());
        role.setRoleName(map.get("roleName").toString());
        role.setIsSystem(map.get("isSystem").toString());
        role.setRoleRemark(map.get("roleRemark").toString());
        role.setCreateTime(map.get("createTime").toString());
        role.setUpdateTime(map.get("updateTime").toString());
        return role;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getRoleListByUserCode(String userId) {
    UserEntry user = this.getUserQueryService().findUserByUserid(
        this.getServiceId(), this.getToken(), userId, null);
    String sql = "select r.* from ess_role as r LEFT JOIN ess_user_role as u on r.id=u.roleId where u.userId=? ";
    try {
      List<Map<String, Object>> roles = null;
      roles = query.query(sql, new MapListHandler(),
          new Object[] { user.getId() });
      if (roles == null || roles.size() == 0) {
        roles = new ArrayList<Map<String, Object>>();
      }
      return roles;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public List<Map<String, Object>> getRoleListByUserId(long userId) {

    String sql = "select * from ess_role as r LEFT JOIN ess_user_role as u on r.id=u.roleId where u.userId=? ";
    try {
      List<Map<String, Object>> roles = null;
      roles = query.query(sql, new MapListHandler(), new Object[] { userId });
      if (roles == null || roles.size() == 0) {
        roles = new ArrayList<Map<String, Object>>();
      }
      return roles;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String getRolesByUserId(int userId) {
    String sql = "select roleId from ess_user_role where  userId = ?";
    try {
      List<Integer> list = query.query(sql, new ColumnListHandler<Integer>(),
          userId);
      String roleIds = "";
      for (Integer i : list) {
        roleIds += i + ",";
      }
      if (!"".equals(roleIds)) {
        roleIds = roleIds.substring(0, roleIds.length() - 1);
        return roleIds;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "";
    }
    return "";
  }

  private List<Map<String, Object>> getTreeAuthNodes(
      HashMap<String, Object> param) {
    String role_id = param.get("roleId") + "";
    String nodeType = param.get("nodeType") + "";
    String sql = "select * from ess_tree_auth where role_id=? and nodeType=?";
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    try {
      result = query.query(sql, new MapListHandler(), role_id, nodeType);
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }

    return result;
  }

  @Override
  public List<Map<String, Object>> getUserListByRoleId(long roleId) {
    String sql = "select * from  ess_user_role where roleId=? ";
    try {
      List<Map<String, Object>> users = null;
      users = query.query(sql, new MapListHandler(), new Object[] { roleId });
      if (users == null || users.size() == 0) {
        users = new ArrayList<Map<String, Object>>();
      }
      return users;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private UserQueryService getUserQueryService() {
    if (null == this.userQueryService) {
      this.userQueryService = this.getService(UserQueryService.class);
    }
    return this.userQueryService;
  }

  @Override
  public List<Map<String, Object>> getUserRole(HashMap<String, Object> param) {
    String idStr = param.get("selectedRoleId") + "";
    String startNo = param.get("startNo") + "";
    String keyWord = param.get("keyWord") + "";
    String limit = param.get("limit") + "";
    String[] idArr = idStr.split(",");
    String idStrs = "";
    for (String id : idArr) {
      idStrs += "'" + id + "',";
    }
    String sql = "select * from ess_role where 1=1 ";
    if (!"".equals(idStrs) && !"null".equals(idStrs)) {
      idStrs = idStrs.substring(0, idStrs.length() - 1);
      sql += "and id in (" + idStrs + ") ";
    }
    if (!"".equals(keyWord) && !"null".equals(keyWord)) {
      sql += "and (roleId like '%" + keyWord + "%' ";
      sql += "or roleName like '%" + keyWord + "%' ";
      sql += "or roleRemark like '%" + keyWord + "%') ";
    }
    if (!"null".equals(startNo) && !"null".equals(limit)) {
      sql += "limit " + startNo + "," + limit;
    }
    List<Map<String, Object>> map = new ArrayList<Map<String, Object>>();
    try {
      map = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return map;
    }
    return map;
  }

  @Override
  public String judgeIfExistsRoleId(HashMap<String, Object> param) {
    String sql = "select count(1) from ess_role where id != ? and binary roleId =?";
    try {
      long rows = 0;
      rows = query.query(sql, new ScalarHandler<Long>(), param.get("id"),
          param.get("roleId"));
      if (rows > 0)
        return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
    return "false";
  }

  @Override
  public String judgeIfExistsRoleName(HashMap<String, Object> param) {
    String sql = "select count(1) from ess_role where id != ? and binary roleName =?";
    try {
      long rows = 0;
      rows = query.query(sql, new ScalarHandler<Long>(), param.get("id"),
          param.get("roleName"));
      if (rows > 0)
        return "true";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
    return "false";
  }

  @Override
  public List<Map<String, Object>> list(HashMap<String, Object> condition) {
    String sql = "select * from ess_role ";
    if (condition.get("page") != null && condition.get("pre") != null) {
      sql = sql + "limit " + condition.get("page") + ", "
          + condition.get("pre");
    }
    List<Map<String, Object>> result = null;
    try {
      result = query.query(sql, new MapListHandler());
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
    if (result == null) {
      return null;
    }
    return result;
  }

  @Override
  public Map<String, Object> preGetPackageRight(HashMap<String, Object> param) {
    String treeId = param.get("treeId") + "";
    String nodeType = param.get("nodeType") + "";
    Map<String, Object> result = new HashMap<String, Object>();
    if ("1".equals(nodeType)) {
      String sql = "select * from  ess_document_stage where id=?";
      try {

        result = query.query(sql, new MapHandler(), treeId);
      } catch (SQLException e) {
        e.printStackTrace();
        return result;
      }
    }
    return result;
  }

  private boolean saveAuthNodes(String roleId, String userId,
      List<String> savePath) {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String dateNowStr = sdf.format(new Date());
    // 俩种情况 更新或插入
    String sql = "insert into ess_tree_auth (role_id,tree_id,nodeType,operator,updateTime,reserved_1)"
        + " values (?,?,?,?,?,?)";
    String sql1 = "update  ess_tree_auth set operator=?,updateTime=?,reserved_1=? where id=?";
    // savePath 每个字符串为：tree_id|nodeType|reserved_1|authId 拼接成
    // 即对应的ess_tree_auth 里的字段数据, authId唯一标识-1时为插入 或者 更新数据
    List<Object[]> insertList = new ArrayList<Object[]>();
    List<Object[]> updateList = new ArrayList<Object[]>();
    for (int i = 0; i < savePath.size(); i++) {
      String[] arr = savePath.get(i).split("\\|");
      if (!arr[3].equals("-1")) {
        Object[] obj = new Object[] { userId, dateNowStr, arr[2], arr[3] };
        updateList.add(obj);
      } else {
        Object[] obj = new Object[] { roleId, arr[0], arr[1], userId,
            dateNowStr, arr[2] };
        insertList.add(obj);
      }
    }
    Object[][] insertParams = new Object[insertList.size()][];
    for (int i = 0; i < insertList.size(); i++) {
      insertParams[i] = insertList.get(i);
    }

    Object[][] updateParams = new Object[updateList.size()][];
    for (int i = 0; i < updateList.size(); i++) {
      updateParams[i] = updateList.get(i);
    }
    try {
      int[] rows1 = {};
      int[] rows2 = {};
      if (insertParams.length > 0)
        rows1 = query.batch(sql, insertParams);
      if (updateParams.length > 0)
        rows1 = query.batch(sql1, updateParams);
      if (rows1.length > 0 || rows2.length > 0) {
        return true;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
    return false;
  }

  @Override
  public String saveAuthTreeNodes(HashMap<String, Object> param) {
    // 得到传过来的数据
    String roleId = param.get("roleId") + "";
    String userId = param.get("userId") + "";

    @SuppressWarnings("unchecked")
    List<String> savePath = (List<String>) param.get("savePath");
    @SuppressWarnings("unchecked")
    List<String> deletePath = (List<String>) param.get("deletePath");

    boolean save = false;
    boolean delete = false;
    if (savePath.size() > 0) {
      save = saveAuthNodes(roleId, userId, savePath);
      if (!save)
        return "保存授权节点时失败！";
    }
    if (deletePath.size() > 0) {
      delete = deleteAuthNodes(deletePath);
      if (!delete)
        return "删除授权节点时失败！";
    }
    if (save || delete) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", param.get("ip"));
      log.put("userid", userId);
      log.put("module", "角色管理");
      log.put("operate", "更新角色菜单节点");
      log.put("loginfo", "更新标识为【" + roleId + "】的角色节点权限");
      this.getLogService().saveLog(log);
      return "success";
    } else {
      return "保存失败,没找到对应数据！";
    }
  }

  @Override
  public String saveDataAuth(HashMap<String, Object> param) {
    // 获得传输的数据进行操作
    String roleId = param.get("roleId") + "";
    String treeId = param.get("treeId") + "";
    String authId = param.get("authId") + "";
    String userId = param.get("userId") + "";
    String nodeType = param.get("nodeType") + "";
    String rights = param.get("rights") + "";
    String en = param.get("en") + "";
    String cn = param.get("cn") + "";
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String dateNowStr = sdf.format(new Date());
    // 修改或添加两种情况
    // 权限id为-1 是插入数据 反之则是修改数据
    String sql = "";
    Object[] par = {};
    if ("-1".equals(authId)) {
      sql = "insert into ess_data_auth(role_id,tree_id,nodeType,dataAuth,operator,updateTime,en,cn)"
          + " values (?,?,?,?,?,?,?,?)";
      par = new Object[] { roleId, treeId, nodeType, rights, userId,
          dateNowStr, en, cn };
    } else {
      sql = "update ess_data_auth set dataAuth=?,operator=?,updateTime=?,en=?,cn=? where id=?";
      par = new Object[] { rights, userId, dateNowStr, en, cn, authId };
    }
    try {
      int rows = 0;
      rows = query.update(sql, par);
      if (rows > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", userId);
        log.put("module", "角色管理");
        if ("-1".equals(authId)) {
          log.put("operate", "添加角色数据授权");
          log.put("loginfo", "添加标识为【" + roleId + "】的角色数据权限");
        } else {
          log.put("operate", "修改角色数据授权");
          log.put("loginfo", "修改标识为【" + roleId + "】的角色,数据权限标识为【" + authId
              + "】的权限信息");
        }
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存异常，请联系管理员！";
    }

    return "保存失败，没有找到对应数据！";
  }

  @Override
  public String saveMenuAuth(HashMap<String, Object> param) {
    String resourId = param.get("resourId") + "";
    String sql = "";
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String dateNowStr = sdf.format(new Date());
    int rows = 0;
    try {
      if ("null".equals(resourId)) {
        sql = "insert into ess_menu_auth(role_id,resource,createTime,updateTime,creator,mender) values(?,?,?,?,?,?)";
        Object[] par = { param.get("roleId"), param.get("checkedNodes"),
            dateNowStr, dateNowStr, param.get("userId"), param.get("userId") };
        rows = query.update(sql, par);
        if (rows > 0)
          return "success";
      } else {
        sql = "update ess_menu_auth set resource=?,updateTime=?,mender=? where id=?";
        Object[] par = { param.get("checkedNodes"), dateNowStr,
            param.get("userId"), resourId };
        rows = query.update(sql, par);
        if (rows > 0) {
          Map<String, Object> log = new HashMap<String, Object>();
          log.put("ip", param.get("ip"));
          log.put("userid", param.get("userId"));
          log.put("module", "角色管理");
          log.put("operate", "修改角色菜单授权");
          log.put("loginfo", "更新标识为【" + param.get("roleId") + "】的角色菜单权限信息");
          this.getLogService().saveLog(log);
          return "success";
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存异常，请联系管理员！";
    }
    return "保存失败,未找到数据！";
  }

  @Override
  public String saveRelendRoleLend(HashMap<String, Object> param) {
    @SuppressWarnings("unchecked")
    List<Map<String, String>> dataList = (List<Map<String, String>>) param
        .get("data");
    List<Map<String, String>> updateList = new ArrayList<Map<String, String>>();
    List<Map<String, String>> insertList = new ArrayList<Map<String, String>>();
    String roleId = param.get("roleId") + "";
    String userId = param.get("userId") + "";
    for (Map<String, String> item : dataList) {
      String id = item.get("id") + "";
      if (!"-1".equals(id)) {
        updateList.add(item);
      } else {
        insertList.add(item);
      }
    }
    String updateSql = "update ess_using_role_relend_count set relendDays=? where id = ?";
    String insertSql = "insert into ess_using_role_relend_count values(null,?,?,?,?)";
    Object[][] params1 = new Object[updateList.size()][];
    Object[][] params2 = new Object[insertList.size()][];
    if (updateList.size() > 0) {
      for (int i = 0; i < updateList.size(); i++) {
        Map<String, String> map = updateList.get(i);
        params1[i] = new Object[] { map.get("relendDays"), map.get("id") };
      }
    }
    if (insertList.size() > 0) {
      for (int i = 0; i < insertList.size(); i++) {
        Map<String, String> map = insertList.get(i);
        params2[i] = new Object[] { userId, roleId, map.get("relendCount"),
            map.get("relendDays") };
      }
    }
    try {
      int[] rows1 = query.batch(updateSql, params1);
      int[] rows2 = query.batch(insertSql, params2);
      if (rows1.length == params1.length && rows2.length == params2.length)
        return "success";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存数据异常！";
    }

    return "保存数据失败！";
  }

  @Override
  public String saveRoleLends(HashMap<String, Object> param) {
    String roleId = param.get("roleId") + "";
    String userId = param.get("userId") + "";
    String lendId = param.get("lendId") + "";
    String lendCount = param.get("lendCount") + "";
    String lendDays = param.get("lendDays") + "";
    Object[] par = null;
    String sql = null;
    if ("-1".equals(lendId)) {
      sql = "insert into ess_using_role values(null,?,?,?,?,null)";
      par = new Object[] { userId, roleId, lendDays, lendCount };
    } else {
      sql = "update ess_using_role set lendDays = ? ,lendCount = ? where id =?";
      par = new Object[] { lendDays, lendCount, Integer.parseInt(lendId) };
    }
    try {
      int row = query.update(sql, par);
      if (row > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("user"));
        log.put("module", "角色管理");
        if ("-1".equals(lendId)) {
          log.put("operate", "角色借阅授权添加");
          log.put("loginfo", "添加角色标识为【" + roleId + "】角色借阅信息：天数" + lendDays
              + "，次数" + lendCount);
        } else {
          log.put("operate", "角色借阅授权修改");
          log.put("loginfo", "修改角色标识为【" + roleId + "】角色借阅信息：天数" + lendDays
              + "，次数" + lendCount);
        }
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存借阅信息异常！";
    }
    return "保存借阅信息失败！";
  }

  @Override
  public String saveUserRole(HashMap<String, Object> param) {
    String roleIds = param.get("roleIds") + "";
    String userId = param.get("id") + "";
    String[] roleArr = {};
    if (!"null".equals(roleIds) && !"".equals(roleIds)) {
      roleArr = roleIds.split(",");
    }
    String sql = "insert into ess_user_role values(null,?,?)";
    Object[][] params = new Object[roleArr.length][];
    for (int i = 0; i < roleArr.length; i++) {
      params[i] = new Object[] { userId, roleArr[i] };
    }

    try {
      int[] rows = query.batch(sql, params);
      if (rows.length > 0) {
        Map<String, Object> log = new HashMap<String, Object>();
        log.put("ip", param.get("ip"));
        log.put("userid", param.get("userId"));
        log.put("module", "角色管理");
        log.put("operate", "分配角色");
        log.put("loginfo", "为用户标识为【" + userId + "】分配角色标识为【" + roleIds + "】的角色");
        this.getLogService().saveLog(log);
        return "success";
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return "分配角色异常";
    }
    return "分配角色失败";
  }

  @Override
  public String update(HashMap<String, Object> role) {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String dateNowStr = sdf.format(new Date());
    String sql = "update ess_role set roleId=?,roleName=?,roleRemark=?,updateTime=? where id=?";
    Object[] param = { role.get("roleId"), role.get("roleName"),
        role.get("roleRemark"), dateNowStr, role.get("id") };
    int rows = 0;
    try {
      rows = query.update(sql, param);
    } catch (SQLException e) {
      e.printStackTrace();
      return "修改异常，请联系管理员！";
    }
    if (rows > 0) {
      Map<String, Object> log = new HashMap<String, Object>();
      log.put("ip", role.get("ip"));
      log.put("userid", role.get("userId"));
      log.put("module", "角色管理");
      log.put("operate", "修改角色");
      log.put("loginfo", "编辑【" + role.get("roleName") + "】角色");
      this.getLogService().saveLog(log);
      return "success";
    }
    return "修改失败，没找到修改数据！";
  }

  @Override
  public List<Map<String, Object>> getDeskMenuTree(HashMap<String, Object> param) {
    String userId = param.get("userId") + "";
    UserEntry user = this.getUserQueryService().findUserByUserid(
        this.getServiceId(), this.getToken(), userId, null);
    String roleIds = getRolesByUserId(user.getId());
    String[] roleArr = roleIds.split(",");
    List<String> roleIdList = Arrays.asList(roleArr);
    // 全部菜单
    List<Map<String, Object>> allMenus = getAllMenu();
    // 查找已经添加的快捷方式的菜单id集合
    List<String> userApps = getUserAppByUserId(userId);
    // 包含1 表示具有admin角色 admin 为最高权限
    if (roleIdList.contains("1")) {
      for (Map<String, Object> node : allMenus) {
        if (userApps.contains(node.get("id") + "")) {
          node.put("checked", true);
        }
      }
      return allMenus;
    } else {
      // 包含了所有的用户下的角色的菜单显示权限信息
      List<String> authResources = getAuthMenuByUserId(user.getId());
      // 要通过遍历得到所有权限的无重复的并集
      List<String> resourceList = new ArrayList<String>();
      for (String res : authResources) {
        if (res != null) {
          String[] resArr = res.split(",");
          for (String node : resArr) {
            if (!resourceList.contains(node)) {
              resourceList.add(node);
            }
          }
        }
      }
      // 根据无重复并集的菜单权限集合（就是树节点id的集合）得到权限树
      List<Map<String, Object>> authMenus = new ArrayList<Map<String, Object>>();
      for (Map<String, Object> node : allMenus) {
        if (resourceList.contains(node.get("id") + "")) {
          if (userApps.contains(node.get("id") + "")) {
            node.put("checked", true);
          }
          authMenus.add(node);
        }
      }
      return authMenus;
    }
  }

  private List<String> getUserAppByUserId(String userId) {
    String sql = "select * from ess_deskapps where userId = ?";
    try {
      List<String> list = query.query(sql, new ColumnListHandler<String>(
          "menuId"), userId);
      return list;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public String saveUserDeskApps(HashMap<String, Object> param) {
    String userId = param.get("userId") + "";
    // String ip = param.get("ip")+"";
    String appsId = param.get("checkedAppsId") + "";
    String delSql = "delete from ess_deskapps where userId =?";
    String insertSql = "insert into ess_deskapps (userId ,menuId) values(?,?)";
    String[] idArr = appsId.split(",");
    Object[][] params = new Object[idArr.length][];
    for (int i = 0; i < idArr.length; i++) {
      params[i] = new Object[] { userId, idArr[i] };
    }
    try {
      query.update(delSql, userId);
      query.batch(insertSql, params);
      return "success";
    } catch (SQLException e) {
      e.printStackTrace();
      return "保存数据异常！";
    }
  }

  @Override
  public List<Map<String, Object>> getUserDeskAppsDetails(
      HashMap<String, Object> param) {
    String userId = param.get("userId") + "";
    List<String> menuIds = getUserAppByUserId(userId);
    String ids = "";
    for (String id : menuIds) {
      ids += "'" + id + "',";
    }
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    if (!"".equals(ids)) {
      ids = ids.substring(0, ids.lastIndexOf(","));
    } else {
      return result;
    }

    String sql = "select * from ess_menu where id in (" + ids + ")";
    try {
      result = query.query(sql, new MapListHandler());
      if (result != null)
        return result;
    } catch (SQLException e) {
      e.printStackTrace();
      return result;
    }
    return result;
  }

  // ========xiewenda 20150513 文件收集模块目录授权相关方法 start========================\\
  /**
   * 根据用户和所有文件收集的树和目录节点得到此用户的目录权限
   */
  public Map<String, Object> getUserDirAuth(Map<String, Object> param) {
    String userId = param.get("userId") + "";
    UserEntry user = this.getUserQueryService().findUserByUserid(
        this.getServiceId(), this.getToken(), userId, null);
    String roleIds = getRolesByUserId(user.getId());
    param.put("roleIds", roleIds);
    // 得到当前节点目录下用户的所有角色的所有权限
    List<Map<String, Object>> authList = getDirNodeAuth(param);
    // 当前节点下用户角色的 无重复权限集
    Set<String> set = new HashSet<String>();
    for (Map<String, Object> auth : authList) {
      String[] authArr = (auth.get("reserved_1") + "").split(",");
      for (int i = 0; i < authArr.length; i++) {
        set.add(authArr[i]);
      }
    }
    System.out.println(set.toString());
    String auths = "";
    for (String auth : set) {
      auths += auth + ",";
    }
    Map<String, Object> result = new HashMap<String, Object>();
    if (!"".equals(auths))
      auths = auths.substring(0, auths.length() - 1);
    result.put("auth", auths);
    return result;
  }

  public List<Map<String, Object>> getDirNodeAuth(Map<String, Object> param) {
    String treeType = param.get("nodeType") + "";
    String treeId = param.get("treeId") + "";
    String roleIds = param.get("roleIds") + "";
    System.out.println(roleIds);
    String sql = "select reserved_1 from ess_tree_auth where nodeType =? and tree_id=? and role_id in("
        + roleIds + ")";
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    try {
      result = query.query(sql, new MapListHandler(), new Object[] { treeType,
          treeId });
      return result;
    } catch (SQLException e) {
      e.printStackTrace();
      return new ArrayList<Map<String, Object>>();
    }
  }

  // \\=======================文件收集模块目录授权相关方法 end============================//

  @Override
  public Map<String, Object> getTreeAndDataAuth(String userId, String admin) {
    String sql_tree = "select id,tree_id,nodeType,reserved_1 as 'treeAuth' from ess_tree_auth WHERE FIND_IN_SET(role_id,?) ";
    String sql_data = "select id,tree_id,nodeType,dataAuth,en AS 'filter' from ess_data_auth WHERE FIND_IN_SET(role_id,?) ";
    Map<String, Object> authMap = new HashMap<String, Object>();
    try {
      UserEntry user = this.getUserQueryService().findUserByUserid(
          this.getServiceId(), this.getToken(), userId, null);
      if (this.checkIfAdmin(user.getId(), admin)) {
        authMap.put("allAuth", "all");
      } else {
        String roles = this.getRolesByUserId(user.getId());
        // 目录树权限
        List<Map<String, Object>> list_tree = null;
        list_tree = query.query(sql_tree, new MapListHandler(), roles);
        if (list_tree.size() > 0 && list_tree != null) {
          authMap.put("treeAuth", list_tree);
        } else {
          authMap.put("treeAuth", null);
        }
        // 数据权限
        List<Map<String, Object>> list_data = null;
        list_data = query.query(sql_data, new MapListHandler(), roles);
        if (list_data.size() > 0 && list_data != null) {
          authMap.put("dataAuth", list_data);
        } else {
          authMap.put("dataAuth", null);
        }
        authMap.put("allAuth", null);
      }
      return authMap;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  private boolean checkIfAdmin(int userId, String roles) {
    String sql = "select count(id) from ess_user_role where userId=? AND roleId in(select id from ess_role where FIND_IN_SET(roleId,?)) ";
    try {
      long id = query.query(sql, new ScalarHandler<Long>(), userId, roles);
      if (id > 0) {
        return true;
      }
      return false;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  @Override
  public String getDocFilterById(Map<String, Object> doc) {
    Map<String, Object> stage = new HashMap<String, Object>();
    String stageId = doc.get("stageId") + "";
    if ("".equals(stageId) || "0".equals(stageId)) {
      return "false";
    } else {
      stage = this.getFilingService().getStageById(Long.parseLong(stageId));
    }
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) doc.get("condition");
    if (where == null || where.size() == 0) {
      return "true";// 没有设置筛选条件，即为当前用户拥有此节点下所有数据权限
    }
    List<Map<String, Object>> returnList = this.getFilingService()
        .getChildrenStageIds(Long.parseLong(stageId));
    List<String> childrenStageId = new ArrayList<String>();
    String childrenCode = "";
    for (Map<String, Object> map : returnList) {
      String mapId = map.get("id").toString();
      if (this.tableIfExists(mapId)) {
        childrenStageId.add(mapId);
      }
      childrenCode += "," + map.get("code");
    }
    childrenCode = (childrenCode.length() > 0) ? childrenCode.substring(1) : "";
    String colName = "";
    String parentStageIds = "";
    if (childrenStageId.size() > 0) {
      parentStageIds = this.getFilingService().getParentStageIds(
          Long.parseLong(stageId));
      colName = this.getFilingService().getColsCode(parentStageIds);
    }
    String sql = "select tb.id from (select dc.*";
    if (!"".equals(colName) && colName != null) {
      String C_name[] = colName.split(",");
      for (String c : C_name) {
        sql += ",esp." + c;
      }
    }
    sql += " from ess_document as dc ";
    if (!"".equals(colName) && colName != null) {
      sql += " LEFT JOIN (";
      for (String childrenStage : childrenStageId) {
        sql += " (select " + colName + " from esp_" + childrenStage
            + ") UNION ";
      }
      sql = sql.substring(0, sql.lastIndexOf("UNION"));
      sql += ") as esp ON dc.id=esp.documentId ";
    }
    sql += ") as tb where filingFlag='0' ";
    String stageCode = stage.get("code") + "";
    if (stageCode != null && !"".equals(stageCode)) {
      sql = sql + " and FIND_IN_SET(stageCode,'" + childrenCode + "') ";
    }
    String fileId = doc.get("fileId").toString();
    if (fileId != null && !"".equals(fileId)) {
      sql += " and FIND_IN_SET(tb.id,'" + fileId + "') ";
    }

    if (where != null && where.size() != 0) {
      Condition condition = Condition.getConditionByList(where);
      sql = sql + " and " + condition.toSQLString();
    }

    try {
      List<Integer> list = query.query(sql, new ColumnListHandler<Integer>());
      String returnStr = "";
      for (int res : list) {
        returnStr += "," + res;
      }
      return returnStr.length() > 0 ? returnStr.substring(1) : "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
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

  @Override
  public String getFileFilterById(Map<String, Object> map) {
    String sql = " select originalId from (select a.originalId,a.estitle,c.esfiletype,c.esstype from ess_file a, ess_folder b, ess_document_file c "
        + " where c.esfileid = a.originalId  and FIND_IN_SET(a.originalId,?) "
        + " and a.folderId = b.id) as tb WHERE 1=1 ";
    @SuppressWarnings("unchecked")
    List<String> where = (List<String>) map.get("condition");
    if (where == null || where.size() == 0) {
      return "true";// 没有设置筛选条件，即为当前用户拥有此节点下所有数据权限
    }
    if (where != null && where.size() != 0) {
      Condition condition = Condition.getConditionByList(where);
      sql = sql + " and " + condition.toSQLString();
    }
    try {
      List<String> list = query.query(sql, new ColumnListHandler<String>(),
          map.get("fileId"));
      String returnStr = "";
      for (String res : list) {
        returnStr += "," + res;
      }
      return returnStr.length() > 0 ? returnStr.substring(1) : "";
    } catch (SQLException e) {
      e.printStackTrace();
      return "false";
    }
  }
}
