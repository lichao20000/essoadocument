package cn.flying.rest.service.impl;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.ArrayHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IContractItemService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.entiry.Contract;
import cn.flying.rest.service.utils.Condition;
import cn.flying.rest.service.utils.JdbcUtil;

@Path("contractitem")
@Component
public class ContractItemServiceImpl extends BasePlatformService implements
		IContractItemService {
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
	public String addContract(HashMap<String, Object> part) {
		// TODO Auto-generated method stub
		String sql = "INSERT INTO ESS_CONTRACT(ESCONTRACTNAME,ESCONTRACTNUM,ESPROJECTNAME,ESDEVICE,ESCOMPANY,ESPERSON,ESPERSTEL) "
				+ "VALUES(?,?,?,?,?,?,?)";
		try {
			int row = query.update(
					sql,
					new Object[] { part.get("contractname"),
							part.get("contractnum"), part.get("projectname"),
							part.get("device"), part.get("company"),
							part.get("person"), part.get("persontel"), });
			if (row == 0) {
				return "添加合同工程失败";
			} else {
			  Map<String,Object> log = new HashMap<String,Object>();
		      log.put("ip", part.get("ip"));
		      log.put("userid", part.get("userId"));
		      log.put("module", "合同工程");
		      log.put("operate", "合同工程：添加合同工程");
		      log.put("loginfo", "添加【"+ part.get("contractname")+"】合同工程");
		      this.getLogService().saveLog(log);
		      
			return "";
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "添加合同工程失败";
		}
	}

	@Override
	public String delContract(Long[] ids,String userId,String ip) {
		// TODO Auto-generated method stub
		if (ids == null || ids.length == 0) {
			return "参数错误";
		}
		String sql = "DELETE FROM ESS_CONTRACT WHERE ID = ?";
		String idStr="";
		try {
			Object[][] params = new Object[ids.length][];
			for (int i = 0; i < ids.length; i++) {
				params[i] = new Object[] { ids[i] };
				idStr+=ids[i]+",";
			}
			int[] row = query.batch(sql, params);
			if (row == null) {
				return "未发现该合同!";
			} else {
			//日志添加
		      Map<String,Object> log = new HashMap<String,Object>();
		      log.put("ip", ip);
		      log.put("userid", userId);
		      log.put("module", "合同工程");
		      log.put("operate", "合同工程：删除合同");
		      log.put("loginfo", "删除标识为【"+ idStr+"】的合同");
		      this.getLogService().saveLog(log);
				return "";
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "未发现该合同!";
		}
	}

	@Override
	public List<Contract> findContractList(Long page, Long pre, HashMap<String,Object> map) {
		// TODO Auto-generated method stub
		try {
			List<Contract> list = null;
			String sql = "SELECT * FROM ESS_CONTRACT where 1=1";
			if (null != map.get("where") && !"".equals(map.get("where"))) {
		      @SuppressWarnings("unchecked")
              Condition cond = Condition.getConditionByList((List<String>) map.get("where"));
		      sql += " and " + cond.toSQLString();
		    }
			long start = (page - 1) * pre;
			sql = sql + " limit " + start + ", " + pre;
			list = query.query(sql, new BeanListHandler<Contract>(
					Contract.class));
			return list;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public long getCount(HashMap<String,Object> map) {
		// TODO Auto-generated method stub
		String sql = "SELECT COUNT(*) FROM ESS_CONTRACT where 1=1";
		if (null != map.get("where") && !"".equals(map.get("where"))) {
          @SuppressWarnings("unchecked")
          Condition cond = Condition.getConditionByList((List<String>) map.get("where"));
          sql += " and " + cond.toSQLString();
        }
		try {
			long row = query.query(sql,new ScalarHandler<Long>());
			return row;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return 0;
	}
	public static void main(String[] args) {
	}
	@Override
	public Map<String, Object> get(Long id) {
		// TODO Auto-generated method stub
		String sql = "SELECT * FROM ESS_CONTRACT WHERE ID=?";
		Object[] params = { id };
		Map<String, Object> m = JdbcUtil.query(query, sql, new MapHandler(),
				params);
		return m;
	}

	@Override
	public String update(HashMap<String, String> map) {
		try {
		String sql = "update  ESS_CONTRACT set escontractname=?,escontractnum=?,esprojectname=?,esdevice=?,escompany=?,esperson=?,esperstel=? where id =?";
		Object[] params = { map.get("escontractname"),
				map.get("escontractnum"), map.get("esprojectname"),
				map.get("esdevice"), map.get("escompany"), map.get("esperson"),
                map.get("esperstel"), map.get("id") };
        
            int row = query.update(sql, params);
            if (row == 0) {
		        return "未发现合同工程";
		      } else {
		        Map<String,Object> log = new HashMap<String,Object>();
	              log.put("ip", map.get("ip"));
	              log.put("userid", map.get("userId"));
	              log.put("module", "合同工程");
	              log.put("operate", "合同工程：修改合同工程");
	              log.put("loginfo", "修改标识为【"+ map.get("id")+"】合同工程信息");
	              this.getLogService().saveLog(log);
		        
		        return "";
		      }
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "更新合同工程失败";
		}
	}
	
	/***
	 * 判断重复
	 * @param contractNum
	 * @return
	 */
	public long uniqueContractNum(String contractNum){
	  try {
	      String sql = "select count(id) from ESS_CONTRACT where escontractnum='"
	          + contractNum + "'";
	      Object[] cnt = query.query(sql, new ArrayHandler());
	      if (cnt != null && cnt.length == 1) {
	        return Long.parseLong(cnt[0].toString());
	      }
	    } catch (SQLException e) {
	      e.printStackTrace();
	    }
	    return 0;
	}
}
