package cn.flying.rest.service.impl;

import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.restInterface.UserQueryService;
import cn.flying.rest.service.IDocumentBorrowingService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.IReportService;
import cn.flying.rest.service.IRoleService;
import cn.flying.rest.admin.restInterface.MessageWS;
import cn.flying.rest.entity.UserEntry;

@Path("documentBorrowing")
@Component
public class DocumentBorrowingServiceImpl extends BasePlatformService implements
		IDocumentBorrowingService {

	@Resource(name = "queryRunner")
	private QueryRunner query;
	private IReportService reportService;
	private ILogService logService;
	private MessageWS messageWS;
	private UserQueryService userQueryService;
	private IRoleService roleService;
	public ILogService getLogService() {
	   if (this.logService == null) {
	      this.logService = this.getService(ILogService.class);
	   }
	   return logService;
	}
	
	private MessageWS getMessageWS() {
	   if (messageWS == null) {
	      messageWS = this.getService(MessageWS.class);
	   }
	   return messageWS;
	}
	private UserQueryService getUserQueryService() {
	    if (null == this.userQueryService) {
	      this.userQueryService = this.getService(UserQueryService.class);
	    }
	    return this.userQueryService;
	}
	private IRoleService getRoleService() {
	    if (null == this.roleService) {
	      this.roleService = this.getService(IRoleService.class);
	    }
	    return this.roleService;
	}
	
	@Override
	public List<Map<String, Object>> getColumnModel(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		String sql = "";
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		long start = (Long.parseLong(map.get("page")) - 1)
				* (Long.parseLong(map.get("rp")));
		long rp = (Long.parseLong(map.get("rp")));
		try {
  		    sql = "select a.* from ess_document a,ess_document_stage c ";
            sql += " where a.stageCode = c.code ";
			if ("1".equals(map.get("type"))) {
              String sql1 = "select id_seq from ess_document_stage where id= "+map.get("id");
              String id_seq = query.query(sql1, new ScalarHandler<String>());
              if(id_seq==null || "null".equals(id_seq) || "".equals(id_seq)){
                id_seq = "";
              }
              sql += " and (c.id_seq like '"+id_seq+map.get("id")+".%' or c.id = "+map.get("id")+") ";
			} else if ("2".equals(map.get("type"))) {
			  if (!StringUtils.isEmpty((String) map.get("id"))) {
			    sql += " and  a.participatoryCode= '"+map.get("id")+"' ";
			  }
			} else if ("3".equals(map.get("type"))) {
			  if (!StringUtils.isEmpty((String) map.get("id"))) {
                sql += " and  a.deviceCode= '"+map.get("id")+"' ";
              }
			}
			if (!"".equals(map.get("keyWord")) && !"null".equals(map.get("keyWord"))) {
              sql = this.getDataByKeyWord(sql, map.get("keyWord"));
            }
            sql += " limit " + start + "," + rp + "";
            list = query.query(sql, new MapListHandler());
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return list;
	}

	@Override
	public int getCount(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		String sql = "";
		int count = 0;
		try {
		  sql = "select count(*) from ess_document a,ess_document_stage c ";
          sql += " where a.stageCode = c.code ";
          if ("1".equals(map.get("type"))) {
            String sql1 = "select id_seq from ess_document_stage where id= "+map.get("id");
            String id_seq = query.query(sql1, new ScalarHandler<String>());
            if(id_seq==null || "null".equals(id_seq) || "".equals(id_seq)){
              id_seq = "";
            }
            sql += " and (c.id_seq like '"+id_seq+map.get("id")+".%' or c.id = "+map.get("id")+") ";
          } else if ("2".equals(map.get("type"))) {
            if (!StringUtils.isEmpty((String) map.get("id"))) {
              sql += " and  a.participatoryCode= '"+map.get("id")+"' ";
            }
          } else if ("3".equals(map.get("type"))) {
            if (!StringUtils.isEmpty((String) map.get("id"))) {
              sql += " and  a.deviceCode= '"+map.get("id")+"' ";
            }
          }
          if (!"".equals(map.get("keyWord")) && !"null".equals(map.get("keyWord"))) {
            sql = this.getDataByKeyWord(sql, map.get("keyWord"));
          }
          count = query.query(sql, new ResultSetHandler<Integer>() {
			public Integer handle(ResultSet rs) throws SQLException {
				rs.next();
				return rs.getInt(1);
			}
          });
		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
		return count;
	}
	
	/***
	 * 关键字检索
	 * @param sql
	 * @param keyWord
	 * @return
	 */
	private String getDataByKeyWord(String sql, String keyWord){
        sql += " and (stageCode like '%" + keyWord + "%' ";
        sql += "or deviceCode like '%" + keyWord + "%' ";
        sql += "or participatoryCode like '%" + keyWord + "%' ";
        sql += "or documentCode like '%" + keyWord + "%' ";
        sql += "or engineeringCode like '%" + keyWord + "%' ";
        sql += "or itemName like '%" + keyWord + "%' ";
        sql += "or title like '%" + keyWord + "%' ";
        sql += "or docNo like '%" + keyWord + "%' ";
        sql += "or person like '%" + keyWord + "%' ";
        sql += "or date like '%" + keyWord + "%' ";
        sql += "or Attachments like '%" + keyWord + "%' ";
        sql += "or documentFlag like '%" + keyWord + "%') ";
        return sql;
	}

	/**
	 * 获取借阅表内容
	 * 
	 * @param map
	 *            : page,rp,data,status
	 */
	@Override
	public Map<String, Object> getUsingFieldForForm(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		Map<String, Object> retMap = new HashMap<String, Object>();
		String condition = "";
		if(map.get("query")!=null && !"".equals(map.get("query")) && !"null".equals(map.get("query"))){
		  condition = this.getCondition(map.get("query"), "");
		}
		long start = (Long.parseLong(map.get("page")) - 1)
				* (Long.parseLong(map.get("rp")));
		long rp = (Long.parseLong(map.get("rp")));
		try {
		  String sql = "select * from ess_borrowing_form where 1=1 " + condition ;
		  if(!this.isAdminRole(map.get("userid"))){
			  sql = sql +" and regPerson = '"+map.get("userid")+"' ";
		  }
		  if(map.get("statusForTree") != null && map.get("statusForTree").equals("0")){
            sql = sql +" and status ='未结束' ";
          }else if(map.get("statusForTree") != null && map.get("statusForTree").equals("1")){
            sql = sql +" and status ='已结束' ";
          }
		  if(map.get("type")!= null && map.get("type").equals("year")){
		    sql = sql +" and regDate like '"+ map.get("id")+ "%'";
		  }else if(map.get("type")!= null && map.get("type").equals("mouth")){
		    sql = sql +" and regDate like '"+map.get("pId")+"-"+map.get("id")+"%'";
		  }
		  sql = sql + " limit "+ start + "," + rp;
		  List<Map<String, Object>> list = query.query(sql,new MapListHandler());
		  if (!list.isEmpty()) {
		    //shouldreturndate应归还日期,没有归还时添加颜色标识
		    Map<String, String> mapForChange = new HashMap<String, String>();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date date = new Date();
		    String sql2 = "select f.id,max(d.shouldreturndate) from ess_borrowing_form f,ess_borrrowing_detail d where f.borrowNum=d.borrowNum and d.status !='未借阅' and d.status !='预约' and d.status != '归还' group by f.id ";
		    List<Map<String, Object>> list2 = query.query(sql2,new MapListHandler());
		    for(Map<String, Object> data2:list2){
		      boolean flag = false;
		      if(data2.get("max(d.shouldreturndate)")!=null && !"".equals(data2.get("max(d.shouldreturndate)")) && !"null".equals(data2.get("max(d.shouldreturndate)"))){
		        Date d1 = sdf.parse(String.valueOf(data2.get("max(d.shouldreturndate)")));
                if(d1.getTime()<date.getTime()){
                    flag = true;
                }
		      }
		      mapForChange.put(String.valueOf(data2.get("id")),flag+"");
		    }
		    for(Map<String, Object> data:list){
		      if(mapForChange.get(String.valueOf(data.get("id")))!=null && mapForChange.get(String.valueOf(data.get("id"))).equals("true")){
	              data.put("changeColor","#e3b4a7");
	          }else{
	              data.put("changeColor","");
	          }
		    }
		    String sql1 = "select count(*) from ess_borrowing_form where 1=1 " + condition ;
		      if(!this.isAdminRole(map.get("userid"))){
				  sql = sql +" and regPerson = '"+map.get("userid")+"' ";
			  }
	          if(map.get("statusForTree") != null && map.get("statusForTree").equals("0")){
	            sql1 = sql1 +" and status ='未结束' ";
	          }else if(map.get("statusForTree") != null && map.get("statusForTree").equals("1")){
	            sql1 = sql1 +" and status ='已结束' ";
	          }
	          if(map.get("type")!= null && map.get("type").equals("year")){
	            sql1 = sql1 +" and regDate like '"+ map.get("id")+ "%'";
	          }else if(map.get("type")!= null && map.get("type").equals("mouth")){
	            sql1 = sql1 +" and regDate like '"+map.get("pId")+"-"+map.get("id")+"%'";
	          }
	          int count = query.query(sql1,
	              new ResultSetHandler<Integer>() {
								public Integer handle(ResultSet rs)
										throws SQLException {
									rs.next();
									return rs.getInt(1);
								}
							});
				retMap.put("total", count);
				retMap.put("list", list);
			} else {
				retMap.put("total", 0);
				retMap.put("list", list);
			}
		  return retMap;
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        }
		return new HashMap<String, Object>();
	}

	@SuppressWarnings("unchecked")
	@Override
	public boolean addForm(HashMap<String, Object> map) {
		// TODO Auto-generated method stub
	    long ii = 0;
		HashMap<String, String> form = (HashMap<String, String>) map
				.get("form");
		List<HashMap<String, String>> list = (List<HashMap<String, String>>) map
				.get("detail");
		String sql1 = "insert into ess_borrrowing_detail(documentCode,borrowtype,status,happen_date,shouldreturndate,return_date,pnum,borrowNum,remark,itemName,stageCode,deviceCode,participatoryCode,engineeringCode,title,docNo,docId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		String sql2 = "INSERT INTO ess_borrowing_form (borrowNum,borrowPerson,regDate,unit,telphone,email,overdueDays,regPerson,status,idcardnum,pnum,remark,uid,readerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		try {
		  if(list!=null && list.size()>0){
			Object[][] params = new Object[list.size()][17];
			for (int i = 0; i < list.size(); i++) {
				HashMap<String, String> m = list.get(i);
				params[i][0] = m.get("documentCode");
				params[i][1] = m.get("type");
				params[i][2] = m.get("status");
				params[i][3] = m.get("happendate");
				params[i][4] = m.get("shouldreturndate");
				params[i][5] = m.get("return_date");
				params[i][6] = m.get("pnum");
				params[i][7] = form.get("borrownum");
				params[i][8] = m.get("remark");
				params[i][9] = m.get("itemName");
                params[i][10] = m.get("stageCode");
                params[i][11] = m.get("deviceCode");
                params[i][12] = m.get("participatoryCode");
                params[i][13] = m.get("engineeringCode");
                params[i][14] = m.get("title");
                params[i][15] = m.get("docNo");
                params[i][16] = m.get("docId");
			}
			ii += query.batch(sql1, params).length;
		  }
		  if(form!=null && !"".equals(form)){
			ii += query.insert(
					sql2,
					new ScalarHandler<Long>(),
					new Object[] { form.get("borrownum"),
							form.get("borrowperson"), form.get("regDate"),
							form.get("unit"), form.get("telphone"),
							form.get("email"), form.get("overduedays"),
							form.get("regperson"), "未结束",
							form.get("idcardnum"), form.get("pnum"),
							form.get("mark"), form.get("uid"),form.get("readerId") });
		  }
		  
		  if (ii > 0){
		    Map<String,Object> log = new HashMap<String,Object>();
            log.put("ip", map.get("ip"));
            log.put("userid", map.get("userId"));
            log.put("module", "文件借阅");
            log.put("operate", "文件借阅：添加借阅表单");
            log.put("loginfo", "添加编号为【"+ form.get("borrownum")+"】的借阅表单");
            this.getLogService().saveLog(log);
			return true;
		  }
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}

	@Override
	public boolean delForm(String ids,String userId,String ip) {
		// TODO Auto-generated method stub
	    String sql = "select borrowNum from ess_borrowing_form where find_in_set (id,'"+ids+"')";
		String sql1 = "delete from ess_borrowing_form where find_in_set (id,'"+ids+"')";
		try {
		  List<Map<String,Object>> list = query.query(sql, new MapListHandler());
		  String borrowNums = "";
		  if(!list.isEmpty()){
		    for(Map<String,Object> map:list){
		      Object obj = map.get("borrowNum");
		      if(obj!=null && !"".equals(obj.toString()) && !"null".equals(obj.toString())){
		        borrowNums += obj+",";
		      }
		    }
		    borrowNums = borrowNums.substring(0,borrowNums.length());
		    String sql2 = "delete from ess_borrrowing_detail where find_in_set (borrowNum,'"+borrowNums+"')";
		    String sql3 = "delete from ess_document_bespeak where find_in_set (borrowNum,'"+borrowNums+"') and status != '申请'";
		    long i = query.update(sql1);
		    i += query.update(sql2);
            i += query.update(sql3);
            //xiewenda 20150612 i>0即表示删除成功 修复空借阅单删除提示错误
            if (i >0){
              Map<String,Object> log = new HashMap<String,Object>();
              log.put("ip", ip);
              log.put("userid", userId);
              log.put("module", "文件借阅");
              log.put("operate", "文件借阅：删除借阅表单");
              log.put("loginfo", "删除编号为【"+ borrowNums+"】的借阅表单");
              this.getLogService().saveLog(log);
              return true;
            }
		  }
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}

	@Override
	public HashMap<String, Object> getFormWithId(Long id) {
		// TODO Auto-generated method stub

		String sql1 = "select * from ess_borrowing_form where id =?";

		try {
			HashMap<String, Object> form_map = (HashMap<String, Object>) query
					.query(sql1, new MapHandler(), new Object[] { id });

			if (!form_map.isEmpty()) {
				// retmap.put("form", form_map);
				// retmap.put("detail", detail_list);
				return form_map;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;
	}

	@Override
	public List<Map<String, Object>> getDetils(Long bid) {
		// TODO Auto-generated method stub
		String sql = "select a.*,b.stageName,b.deviceName,b.participatoryName,b.documentTypeName,b.engineeringName ";
        sql += "from ess_borrrowing_detail a,ess_document b";
        sql += " where a.docId = b.id and borrowNum = ? order by a.id";
		try {
			List<Map<String, Object>> detail_list = query.query(sql,
					new MapListHandler(), new Object[] { bid });
			if (!detail_list.isEmpty()){
			  for(Map<String, Object> data:detail_list){
	              String flag = "";
	              if(data.get("shouldreturndate")!=null && !"".equals(data.get("shouldreturndate")) && !"null".equals(data.get("shouldreturndate")) 
	                  && (data.get("return_date")==null || "".equals(data.get("return_date")) || "null".equals(data.get("return_date")))){
	                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	                Date date = new Date();
	                Date d1 = sdf.parse(String.valueOf(data.get("shouldreturndate")).split(" ")[0]);
	                if(date.getTime()>d1.getTime()){
	                  if(!"归还".equals(String.valueOf(data.get("status")))){
	                      flag = "#e3b4a7";
	                  }
	                }
	              }
	              data.put("changeColor", flag);
	            }
			  return detail_list;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
		return new ArrayList<Map<String, Object>>();
	}

	@SuppressWarnings("unchecked")
	@Override
	public boolean save(HashMap<String, Object> map) {
		// TODO Auto-generated method stub
	    long i1 = 0;
		HashMap<String, String> form = (HashMap<String, String>) map
				.get("form");
		List<HashMap<String, String>> list = (List<HashMap<String, String>>) map
				.get("detail");
		String sql = "select id from ess_borrrowing_detail where borrowNum='"+form.get("borrownum")+"'";
		String sql1 = "update ess_borrrowing_detail set documentCode=?,borrowtype=?,status=?,happen_date=?,shouldreturndate=?,return_date=?,pnum=?,borrowNum=?,remark=?,itemName=?,stageCode=?,deviceCode=?,participatoryCode=?,engineeringCode=?,title=?,docNo=?,docId=? where id = ?";
		String sql2 = "update ess_borrowing_form set borrowNum=?,borrowPerson=?,regDate=?,unit=?,telphone=?,email=?,overdueDays=?,regPerson=?,status=?,idcardnum=?,pnum=?,remark=?,uid=?,readerId=? where id =?";
		try {
			if(list!=null && list.size()>0){
			    List<Map<String, Object>> ids = query.query(sql,new MapListHandler());
    			Object[][] params1 = new Object[list.size()][18];
    			for (int i = 0; i < list.size(); i++) {
                  HashMap<String, String> m = list.get(i);
                  params1[i][0] = m.get("documentCode");
                  params1[i][1] = m.get("type");
                  params1[i][2] = m.get("status");
                  params1[i][3] = m.get("happendate");
                  params1[i][4] = m.get("shouldreturndate");
                  params1[i][5] = m.get("return_date");
                  params1[i][6] = m.get("pnum");
                  params1[i][7] = form.get("borrownum");
                  params1[i][8] = m.get("remark");
                  params1[i][9] = m.get("itemName");
                  params1[i][10] = m.get("stageCode");
                  params1[i][11] = m.get("deviceCode");
                  params1[i][12] = m.get("participatoryCode");
                  params1[i][13] = m.get("engineeringCode");
                  params1[i][14] = m.get("title");
                  params1[i][15] = m.get("docNo");
                  params1[i][16] = m.get("docId");
                  params1[i][17] = ids.get(i).get("id");
                }
    			i1 += query.batch(sql1, params1).length;
			}
			String formStatus = form.get("status");
			i1 += query
					.update(sql2,
							new Object[] { form.get("borrownum"),
									form.get("borrowperson"),
									form.get("regDate"), form.get("unit"),
									form.get("telphone"), form.get("email"),
									form.get("overduedays"),
									form.get("regperson"), formStatus,
									form.get("idcardnum"), Integer.parseInt(form.get("pnum")),
									form.get("mark"), form.get("uid"),form.get("readerId"),form.get("id") });
			if (i1 > 0){
			  StringBuilder sb = new StringBuilder();
			  sb.append("电话：修改前【"+form.get("oldtelphone")+"】修改后【"+form.get("telphone")+"】\n");
			  sb.append("邮箱：修改前【"+form.get("oldemail")+"】修改后【"+form.get("email")+"】\n");
			  sb.append("催还提前天数：修改前【"+form.get("overduedays")+"】修改后【"+form.get("oldoverduedays")+"】\n");
			  sb.append("身份证：修改前【"+form.get("oldidcardnum")+"】修改后【"+form.get("idcardnum")+"】\n");
			  sb.append("备注：修改前【"+form.get("oldmark")+"】修改后【"+form.get("mark")+"】\n");
			  Map<String,Object> log = new HashMap<String,Object>();
		      log.put("ip", map.get("ip"));
		      log.put("userid", map.get("userId"));
		      log.put("module", "文件借阅");
		      log.put("operate", "文件借阅：修改借阅信息");
		      log.put("loginfo", "修改编号为【"+ form.get("borrownum")+"】借阅单的借阅信息详细为\n"+sb.toString());
		      this.getLogService().saveLog(log);
		      return true;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
	}

	@Override
	public HashMap<String, Object> getBorrowRoleWithId(Long userid) {
		// TODO Auto-generated method stub
		String sql = "select roleId from ess_user_role where userId = "+ userid;
		HashMap<String, Object> map = new HashMap<String, Object>();
		try {
			List<Map<String, Object>> list = query.query(sql,
					new MapListHandler());
			String roleid = "";
			for (Map<String, Object> object : list) {
			  String obj = String.valueOf(object.get("roleId"));
			  if(!"".equals(obj) && !"null".equals(obj) && obj != null){
			    roleid += obj + ",";
			  }
            }
			if(!"".equals(roleid) && !"null".equals(roleid) && roleid != null){
			  roleid = roleid.substring(0, roleid.length()-1);
			  String sql1 = "select max(lendDays),max(lendCount) from ess_using_role where find_in_set (roleId,'"+roleid+"')";
			  HashMap<String, Object> m1 = (HashMap<String, Object>) query.query(sql1, new MapHandler());
              String lendDays = m1.get("max(lendDays)")+"";
              String lendCount = m1.get("max(lendCount)")+"";
			  map.put("lendDays", lendDays);
              map.put("lendCount", lendCount);
              String sql2 = "select * from ess_using_role_relend_count where find_in_set (roleId,'"+roleid+"')";
              List<Map<String, Object>> l = query.query(sql2,new MapListHandler());
              map.put("relend", l);
              //获取当前借阅人借出的件数
              if(!"".equals(lendDays) && !"".equals(lendCount) && !"null".equals(lendDays) && !"null".equals(lendCount)
                  && lendDays !=null && lendDays != null && !"0".equals(lendDays) && !"0".equals(lendCount)){
                String sql4 = "select borrowNum from ess_borrowing_form where uid = "+userid;
                List<Map<String, Object>> l4 = query.query(sql4,new MapListHandler());
                String borrowNums = "";
                if(!l4.isEmpty()){
                  for (Map<String, Object> object : l4) {
                    String obj = String.valueOf(object.get("borrowNum"));
                    if(!"".equals(obj) && !"null".equals(obj) && obj != null){
                      borrowNums += obj + ",";
                    }
                  }
                  if(!"".equals(borrowNums) && !"null".equals(borrowNums) && borrowNums != null){
                    borrowNums = borrowNums.substring(0, borrowNums.length()-1);
                    String sql5 = "select sum(pnum) from ess_borrrowing_detail where find_in_set (borrowNum,'"+borrowNums+"') and status = '已借出'";
                    HashMap<String, Object> m5 = (HashMap<String, Object>) query.query(sql5, new MapHandler());
                    map.put("pnum", m5.get("sum(pnum)"));
                  }else{
                    map.put("pnum", 0);
                  }
                }else{
                  map.put("pnum", 0);
                }
              }
			}else{
			  map.put("notRole", true); 
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return map;
	}

	// 续借,修改应归还时间
	public HashMap<String, String> changetimes(List<Map<String, Object>> list,
			int i) {
		HashMap<String, String> hm = new HashMap<String, String>();
		for (Map<String, Object> map : list) {
			String key = String.valueOf(map.get("id"));
			String s = String.valueOf(map.get("shouldreturndate"));
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
			Date dd;
			try {
				dd = df.parse(s);
				Calendar calendar = Calendar.getInstance();
				calendar.setTime(dd);
				calendar.add(Calendar.DAY_OF_MONTH, i);// 加一天
				hm.put(key, df.format(calendar.getTime()));
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
		return hm;
	}

	@Override
	public int changeDetails(List<HashMap<String, String>> list,String userId,String ip) {
		// TODO Auto-generated method stub
		String statu = list.get(0).get("borrowstatus");
		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date date = calendar.getTime();
		String happen_date = sdf.format(date);
		if (!statu.equals("归还") && !statu.equals("续借"))
			calendar.add(
					Calendar.DAY_OF_YEAR,
					"借阅".equals(statu) ? 0 : Integer.parseInt(list.get(0).get(
							"lendDays")));
		date = calendar.getTime();
		String shouldreturndate = sdf.format(date);
		int row = -1;
		if ("续借".equals(statu)) {
			StringBuffer sb = new StringBuffer(99);
			for (HashMap<String, String> hashMap : list) {
				sb.append(hashMap.get("id") + ",");
			}
			if (sb.length() > 0)
				sb.deleteCharAt(sb.length() - 1);
			try {
				String sql = "select id,shouldreturndate from ess_borrrowing_detail where id in ("
						+ sb + ")";
				List<Map<String, Object>> l = query.query(sql,
						new MapListHandler());
				HashMap<String, String> hm = changetimes(l,
						Integer.parseInt(list.get(0).get("relendDays")));

				sql = "update ess_borrrowing_detail set status = '续借',shouldreturndate=?,relendcount=? where id = ?";
				Object[][] params = new Object[list.size()][3];
				for (int i = 0; i < list.size(); i++) {
					String curId = list.get(i).get("id");
					String rc = list.get(i).get("rc");
					params[i][0] = hm.get(curId);
					params[i][1] = rc;
					params[i][2] = curId;
				}
				row = query.batch(sql, params).length;
				String sql1 = "update ess_document_bespeak set status = '续借' where borrowNum = '"+list.get(0).get("borrowNum")+"'";
	            row += query.update(sql1);
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} else if ("归还".equals(statu)) {
			String sql1 = "update ess_borrrowing_detail set status=?,return_date=? where id = ?";
			String sql2 = "update ess_document_bespeak set status=? where borrowNum = ?";
			String sql3 = "update ess_document set borrowStatus = '0' where id = ?";
			Object[][] params1 = new Object[list.size()][3];
			Object[][] params2 = new Object[list.size()][2];
			Object[][] params3 = new Object[list.size()][1];
			for (int i = 0; i < list.size(); i++) {
				params1[i][0] = "归还";
				params1[i][1] = happen_date;
				params1[i][2] = list.get(i).get("id");
			}
			for (int i = 0; i < list.size(); i++) {
			  params2[i][0] = "归还";
			  params2[i][1] = list.get(i).get("borrowNum");
            }
			for (int i = 0; i < list.size(); i++) {
				params3[i][0] = list.get(i).get("docId");
			}
			try {
				row = query.batch(sql1, params1).length;
				row += query.batch(sql2, params2).length;
				row += query.batch(sql3, params3).length;
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} else {// 借阅借出
			String sql = "update ess_borrrowing_detail set status=?,happen_date=?,shouldreturndate=?,pnum=?,remark=? where borrowNum = ? and docId = ?";
			String sql2 = "update ess_borrowing_form set status='未结束' where borrowNum = '"+list.get(0).get("borrowNum")+"'";
			String sql3 = "update ess_document set borrowStatus = '"+statu+"' where id = ?";
			Object[][] params = new Object[list.size()][7];
			for (int i = 0; i < list.size(); i++) {
				params[i][0] = "已" + list.get(i).get("borrowstatus");
				params[i][1] = happen_date;
				params[i][2] = shouldreturndate;
				params[i][3] = list.get(i).get("pnum");
				params[i][4] = list.get(i).get("remark");
				params[i][5] = list.get(i).get("borrowNum");
				params[i][6] = list.get(i).get("docId");
			}
			Object[][] params3 = new Object[list.size()][1];
			for (int i = 0; i < list.size(); i++) {
				params3[i][0] = list.get(i).get("docId");
			}
			try {
				row = query.batch(sql, params).length;
				row += query.batch(sql3, params3).length;
				if(!list.get(0).get("formStatus").equals("未结束")){
				    query.update(sql2);
				}
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		//操作的文件标题
		StringBuilder sb = new StringBuilder();
		for(HashMap<String,String> m :list){
		  sb.append("【"+m.get("title")+"】");
		}
		if(row>0){
		    Map<String,Object> log = new HashMap<String,Object>();
	        log.put("ip", ip);
	        log.put("userid", userId);
	        log.put("module", "文件借阅");
	        log.put("operate", "文件借阅："+statu+"表单数据");
	        log.put("loginfo", "编号为【"+list.get(0).get("borrowNum")+"】的借阅表单下标题为:"+sb.toString()+"的借阅文件办理了"+statu);
	        this.getLogService().saveLog(log);
	        //添加或删除催还消息
	        if(statu.equals("归还") || statu.equals("续借")|| statu.equals("借出")){
	          Map<String, String> sendMap = new HashMap<String, String>();
	          if(list.get(0).get("readerId")!=null && !"".equals(list.get(0).get("readerId"))){
	            sendMap.put("userId", list.get(0).get("readerId"));
	          }else{
	            sendMap.put("userId", userId);
	          }
	          sendMessageHashUser(sendMap);
	        }
		}
		return row;
	}

	@SuppressWarnings("unchecked")
	@Override
	public int dirChangeStatus(HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		String type = (String) map.get("type");
		HashMap<String, String> form = (HashMap<String, String>) map
				.get("form");
		List<HashMap<String, String>> list = (List<HashMap<String, String>>) map
				.get("detail");
		String lenddays = list.get(0).get("lenddays");

		Calendar calendar = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date date = calendar.getTime();
		String happen_date = sdf.format(date);
		if (!type.equals("归还") && !type.equals("续借"))
			calendar.add(Calendar.DAY_OF_YEAR,
					"借阅".equals(type) ? 0 : Integer.parseInt(lenddays));
		date = calendar.getTime();
		String shouldreturndate = sdf.format(date);

		type = type.replace("直接", "");
		String sql1 = "insert into ess_borrrowing_detail(documentCode,borrowtype,status,happen_date,shouldreturndate,return_date,pnum,borrowNum,remark,itemName,stageCode,deviceCode,participatoryCode,engineeringCode,title,docNo,docId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		String sql2 = "INSERT INTO ess_borrowing_form (borrowNum,borrowPerson,regDate,unit,telphone,email,overdueDays,regPerson,status,idcardnum,pnum,remark,uid,readerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		String sql3 = "update ess_document set borrowStatus = '"+type+"' where id = ?";
		try {
			Object[][] params = new Object[list.size()][17];
			for (int i = 0; i < list.size(); i++) {
				HashMap<String, String> m = list.get(i);
				params[i][0] = m.get("documentCode");
                params[i][1] = m.get("type");
                params[i][2] = "已"+type;
                params[i][3] = happen_date;
                params[i][4] = shouldreturndate;
                params[i][5] = m.get("return_date");
                params[i][6] = m.get("pnum");
                params[i][7] = form.get("borrownum");
                params[i][8] = m.get("remark");
                params[i][9] = m.get("itemName");
                params[i][10] = m.get("stageCode");
                params[i][11] = m.get("deviceCode");
                params[i][12] = m.get("participatoryCode");
                params[i][13] = m.get("engineeringCode");
                params[i][14] = m.get("title");
                params[i][15] = m.get("docNo");
                params[i][16] = m.get("docId");
			}
			long i = query.batch(sql1, params).length;
			Object[][] params3 = new Object[list.size()][1];
			for (int j = 0; j < list.size(); j++) {
				params3[j][0] = list.get(j).get("docId");
			}
			i += query.batch(sql3, params3).length;
			i += query.insert(
					sql2,
					new ScalarHandler<Long>(),
					new Object[] { form.get("borrownum"),
							form.get("borrowperson"), form.get("regDate"),
							form.get("unit"), form.get("telphone"),
							form.get("email"), form.get("overduedays"),
							form.get("regperson"), "未结束",
							form.get("idcardnum"), form.get("pnum"),
							form.get("mark"), form.get("uid"), form.get("readerId") });
			if (i >= 2){
  			  Map<String,Object> log = new HashMap<String,Object>();
              log.put("ip", map.get("ip"));
              log.put("userid", map.get("userId"));
              log.put("module", "文件借阅");
              log.put("operate", "文件借阅：直接"+type+"表单数据");
              log.put("loginfo", "直接"+type+"编号为【"+ form.get("borrownum")+"】的借阅表单");
              this.getLogService().saveLog(log);
              //添加或删除催还消息
              if(type.equals("借出")){
                Map<String, String> sendMap = new HashMap<String, String>();
                if(form.get("readerId")!=null && !"".equals(form.get("readerId"))){
                  sendMap.put("userId", form.get("readerId"));
                }else{
                  sendMap.put("userId", map.get("userId").toString());
                }
                sendMessageHashUser(sendMap);
              }
              return 1;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 0;
	}

	@Override
	public int returnForForm(HashMap<String, String> map) {
		// TODO Auto-generated method stub
	  Calendar calendar = Calendar.getInstance();
	  SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
      Date date = calendar.getTime();
      String return_date = sdf.format(date);
		String sql = "update ess_borrrowing_detail set status='归还',return_date = '"+return_date+"' "
				+ "where find_in_set (borrowNum,'"+map.get("borrowNums")+"') and status<>'未借阅' and status<>'归还'";
		String sql1 = "update ess_document set borrowStatus = '0' where find_in_set (id,('"+map.get("docId")+"'))";
		String sql2 = "update ess_document_bespeak set status='归还' where find_in_set (borrowNum,'"+map.get("borrowNums")+"') and status<>'预约' and status<>'归还'";
        int row = -1;
		try {
			row = query.update(sql);
			row += query.update(sql1);
			row += query.update(sql2);
			if(row>0){
			    Map<String,Object> log = new HashMap<String,Object>();
	            log.put("ip", map.get("ip"));
	            log.put("userid", map.get("userId"));
	            log.put("module", "文件借阅");
	            log.put("operate", "文件借阅：归还借阅表单");
	            log.put("loginfo", "归还编号为【"+ map.get("borrowNums")+"】的借阅表单");
	            this.getLogService().saveLog(log);
	            Map<String, String> sendMap = new HashMap<String, String>();
	            sendMap.put("userId", map.get("userId"));
	            sendMessageHashUser(sendMap);
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return row;
	}

	@Override
	public String relendForForm(String num,String userId,String ip) {
		// TODO Auto-generated method stub
	  StringBuffer mes = new StringBuffer();
	  try {
		// 根据用户查询续借权限
	    String sql = "select uid from ess_borrowing_form where borrowNum = "+ num;
	    Map<String, Object> hm = query.query(sql, new MapHandler());
	    if(!"".equals(hm.get("uid").toString()) && !"null".equals(hm.get("uid").toString()) && hm.get("uid") != null){
	      sql = "select roleId from ess_user_role where userId = "+ hm.get("uid");
          List<Map<String, Object>> role = query.query(sql,new MapListHandler());
          String roleid = "";
          for (Map<String, Object> object : role) {
              String obj = String.valueOf(object.get("roleId"));
              if(!"".equals(obj) && !"null".equals(obj) && obj != null){
                roleid += obj + ",";
              }
          }
          String sql1 = "select * from ess_using_role_relend_count b where find_in_set (b.roleId,'"+roleid+"')";
	      // 根据借阅单编号查出该订单下
	      String sql2 = "select * from ess_borrrowing_detail where borrowNum = "+ num+" order by id";
	      List<Map<String, Object>> list1 = query.query(sql1,new MapListHandler());
	      List<Map<String, Object>> list2 = query.query(sql2,new MapListHandler());
	      int[] relendcounts = new int[list2.size()];// 存放续借次数
	      int[] relenddays = new int[list1.size()];// 存放续借天数
	      int index = 0;
	      if(list1.size() == 0){
            return "此用户没有续借次数！";
          }
	      String relendNum = "";//记录续借成功的行数
	      String notrelendNum = "";//记录续借失败的行数
	      String notNum = "";//记录不能续借的行数
	      int n = 0;//行数
	      List<Map<String, Object>> list3 = new ArrayList<Map<String, Object>>();
	      for (Map<String, Object> map : list2) {
	         n++;
	         if("已借出".equals(map.get("status")) || "续借".equals(map.get("status"))){
	            if (Integer.parseInt(map.get("relendcount").toString()) >= list1
	                      .size()) {
	               notrelendNum += n+",";
	               continue;
	            }
	            else {
	                relendNum += n+",";
	                relendcounts[index++] = Integer.parseInt(map.get(
	                            "relendcount").toString()) + 1;
	                list3.add(map);
	            }
	           }else{
	             notNum += n+",";
	             continue;
	           }
	        }
	        index = 0;
            for (Map<String, Object> map : list1) {
              relenddays[index++] = Integer.parseInt(map.get("relendDays")
                      .toString());
            }
            HashMap<String, String> mp = new HashMap<String, String>();
            for (Map<String, Object> map : list3) {
              List<Map<String, Object>> l = new ArrayList<Map<String, Object>>();
              Map<String, Object> m = new HashMap<String, Object>();
              m.put("id", map.get("id"));
              m.put("shouldreturndate", map.get("shouldreturndate"));
              l.add(m);
              int rd = Integer.parseInt(map.get("relendcount").toString());
              mp.put(String.valueOf(map.get("id")),
                      changetimes(l, relenddays[rd]).get(map.get("id").toString()));
            }
            sql = "update ess_borrrowing_detail set status = '续借',shouldreturndate=?,relendcount=? where id = ?";
            Object[][] params = new Object[list3.size()][3];
            for (int i = 0; i < list3.size(); i++) {
              String curId = String.valueOf(list3.get(i).get("id"));
              String rc = String.valueOf(relendcounts[i]);
              params[i][0] = mp.get(curId);
              params[i][1] = rc;
              params[i][2] = curId;
            }
            int row = query.batch(sql, params).length;
            sql = "update ess_document_bespeak set status = '续借' where borrowNum = "+ num;
            row += query.update(sql);
            if(relendNum!=null && !"".equals(relendNum) && !"null".equals(relendNum)){
              relendNum = relendNum.substring(0, relendNum.length()-1);
              mes.append("<br>").append("第【"+relendNum+"】行数据续借成功！");
            }
            if(notrelendNum!=null && !"".equals(notrelendNum) && !"null".equals(notrelendNum)){
              notrelendNum = notrelendNum.substring(0, notrelendNum.length()-1);
              mes.append("<br>").append("第【"+notrelendNum+"】行数据已经没有续借次数了！");
            }
            if(notNum!=null && !"".equals(notNum) && !"null".equals(notNum)){
              notNum = notNum.substring(0, notNum.length()-1);
              mes.append("<br>").append("第【"+notNum+"】行数据不是已借出或续借状态，无法续借！");
            }
            if(mes.toString()!=null && !"".equals(mes.toString()) && !"null".equals(mes.toString())){
               StringBuffer result = new StringBuffer();
               if(relendNum!=null && !"".equals(relendNum) && !"null".equals(relendNum)){
                Map<String,Object> log = new HashMap<String,Object>();
                log.put("ip", ip);
                log.put("userid", userId);
                log.put("module", "文件借阅");
                log.put("operate", "文件借阅：续借借阅表单数据");
                log.put("loginfo", "续借编号为【"+ num+"】的借阅表单");
                this.getLogService().saveLog(log);
                Map<String, String> sendMap = new HashMap<String, String>();
                sendMap.put("userId", userId);
                sendMessageHashUser(sendMap);
              }
              return  result.append("您选择的借阅单中：").append(mes).toString();
            }else if(row>0){
                Map<String,Object> log = new HashMap<String,Object>();
                log.put("ip", ip);
                log.put("userid", userId);
                log.put("module", "文件借阅");
                log.put("operate", "文件借阅：续借借阅表单数据");
                log.put("loginfo", "续借编号为【"+ num+"】的借阅表单");
                this.getLogService().saveLog(log);
                Map<String, String> sendMap = new HashMap<String, String>();
                sendMap.put("userId", userId);
                sendMessageHashUser(sendMap);
                return "true";
            }else{
              return "false";
            }
	      }else{      
	        return "false";
	      }
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "false";
		}
	}

	@Override
	public String bespeak(HashMap<String, Object> map) {
		// TODO Auto-generated method stub
	  long retl = 0;
	  try {
		@SuppressWarnings("unchecked")
		HashMap<String, String> form = (HashMap<String, String>) map.get("borrowform");
		@SuppressWarnings("unchecked")
		List<HashMap<String, String>> list = (List<HashMap<String, String>>) map.get("docIdsArray");
		String mes = getRespeakStatusBydocId(map.get("userId").toString(),form.get("readerId").toString());
		if(mes!=null && !"".equals(mes) && !"null".equals(mes)){
		  return "您申请的第【"+mes+"】行数据此借阅用户已经预约了，请重新选择！";
		}
		String docIdStr = "";
		for(HashMap<String, String> hm:list){
			docIdStr += hm.get("docId")+",";
		}
		docIdStr = docIdStr.substring(0,docIdStr.length()-1);
		String sql = "select * from ess_document where find_in_set(id,'"+docIdStr+"')";
		List<Map<String, Object>> detail = query.query(sql, new MapListHandler());
		String sql1 = "insert into ess_borrowing_form (borrowNum,borrowPerson,regDate,unit,telphone,email,overdueDays,regPerson,status,idcardnum,pnum,remark,uid,readerId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
        String sql2 = "insert into ess_borrrowing_detail(documentCode,borrowtype,status,happen_date,shouldreturndate,return_date,pnum,borrowNum,remark,itemName,stageCode,deviceCode,participatoryCode,engineeringCode,title,docNo,docId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        String sql3 = "update ess_document_bespeak set status = '预约',borrowNum = '"+form.get("borrownum")+"',readerId = '"+form.get("readerId")+"' where status = '申请' and userId = '"+map.get("userId")+"'";
        retl += query.insert(
            sql1,
            new ScalarHandler<Long>(),
            new Object[] { form.get("borrownum"), form.get("borrowperson"),
            	form.get("regDate"), form.get("unit"),
            	form.get("telphone"), form.get("email"),
            	form.get("overduedays"), form.get("regperson"),
            	form.get("status"), form.get("idcardnum"),
            	detail.size(), form.get("remark"), form.get("uid"),form.get("readerId") });   
        if(detail!=null && detail.size()>0){
            Object[][] params = new Object[detail.size()][17];
            for (int i = 0; i < list.size(); i++) {
              Map<String, Object> m = detail.get(i);
              params[i][0] = m.get("documentCode");
              params[i][1] = "实体";
              params[i][2] = "预约";
              params[i][3] = "";
              params[i][4] = "";
              params[i][5] = "";
              params[i][6] = 1;
              params[i][7] = form.get("borrownum");
              params[i][8] = "";
              params[i][9] = m.get("itemName");
              params[i][10] = m.get("stageCode");
              params[i][11] = m.get("deviceCode");
              params[i][12] = m.get("participatoryCode");
              params[i][13] = m.get("engineeringCode");
              params[i][14] = m.get("title");
              params[i][15] = m.get("docNo");
              params[i][16] = m.get("id");
            }
            retl += query.batch(sql2, params).length;
        }
        retl += query.update(sql3);
        if(retl>0){
          Map<String,Object> log = new HashMap<String,Object>();
          log.put("ip", map.get("ip"));
          log.put("userid", map.get("userId"));
          log.put("module", "文件借阅");
          log.put("operate", "文件借阅：预约借阅表单");
          log.put("loginfo", "预约编号为【"+ form.get("borrownum")+"】的借阅表单");
          this.getLogService().saveLog(log);
          return "true";
        }else{
          return "false";
        }
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return "false";
      }
	}

	@Override
	public List<Map<String, Object>> getBespeakList(Map<String,Object> map) {
		// TODO Auto-generated method stub
		String type = map.get("type").toString();
		long start = (Long.parseLong(map.get("page").toString()) - 1)
		          * (Long.parseLong(map.get("rp").toString()));
		long rp = (Long.parseLong(map.get("rp").toString()));
		String sql = "select * from ess_document_bespeak where 1=1 ";
		if ("all".equals(type)) {
		  sql += " and status ='预约'";
		} else if ("order".equals(type)) {
			sql += " and status <>'预约' and status <>'归还' and status <>'申请'";
		} else {
			sql += " and status ='归还'";
		}
		if(!this.isAdminRole(map.get("userId").toString())){
			  sql = sql +" and userId = '"+map.get("userId")+"' ";
		}
		sql += " group by docId limit " + start + "," + rp + "";
		try {
			List<Map<String, Object>> list = query.query(sql,new MapListHandler());
			return list;
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public List<Map<String, Object>> getBespeakDetail(HashMap<String, String> map) {
		// TODO Auto-generated method stub
	    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
		if(map.get("docId")!=null && !"".equals(map.get("docId"))){
	    String sql ="select borrowNum from ess_document_bespeak where docId = "+map.get("docId");
		try {
			String type = map.get("type");
			if(type!=null && !"".equals(type) && !"null".equals(type)){
				if ("all".equals(type)) {
					sql += " and status ='预约'";
				} else if ("order".equals(type)) {
					sql += " and status <>'预约' and status <>'归还' and status <>'申请'";
				} else {
					sql += " and status ='归还'";
				}
			}
			if(!this.isAdminRole(map.get("userId"))){
				  sql = sql +" and userId = '"+map.get("userId")+"' ";
			}
		    List<Map<String, Object>> list = query.query(sql,new MapListHandler());
		    if(!list.isEmpty()){
		      String borrowNum = "";
		      for(Map<String, Object> m : list){
		        if(m.get("borrowNum")!=null && !"".equals(m.get("borrowNum").toString()) 
		            && !"null".equals(m.get("borrowNum").toString())){
		          borrowNum += m.get("borrowNum")+",";
		        }
		      }
		      if(borrowNum!=null && !"".equals(borrowNum)){
		        borrowNum = borrowNum.substring(0,borrowNum.length()-1);
		        String sql1 = "select * from ess_borrowing_form where find_in_set (borrowNum,'"+borrowNum+"')";
	              result = query.query(sql1,new MapListHandler());
	              if(!result.isEmpty()){
	                //shouldreturndate应归还日期,没有归还时添加颜色标识
	                Map<String, String> mapForChange = new HashMap<String, String>();
	                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	                Date date = new Date();
	                String sql2 = "select f.id,max(d.shouldreturndate) from ess_borrowing_form f,ess_borrrowing_detail d where f.borrowNum=d.borrowNum and d.status !='未借阅' and d.status != '归还' group by f.id ";
	                List<Map<String, Object>> list2 = query.query(sql2,new MapListHandler());
	                for(Map<String, Object> data2:list2){
	                  boolean flag = false;
	                  if(data2.get("max(d.shouldreturndate)")!=null && !"".equals(data2.get("max(d.shouldreturndate)")) && !"null".equals(data2.get("max(d.shouldreturndate)"))){
	                    Date d1 = sdf.parse(String.valueOf(data2.get("max(d.shouldreturndate)")));
	                    if(d1.getTime()<date.getTime()){
	                        flag = true;
	                    }
	                  }
	                  mapForChange.put(String.valueOf(data2.get("id")),flag+"");
	                }
	                for(Map<String, Object> data:result){
	                  if(mapForChange.get(String.valueOf(data.get("id")))!=null && mapForChange.get(String.valueOf(data.get("id"))).equals("true")){
	                      data.put("changeColor","#e3b4a7");
	                  }else{
	                      data.put("changeColor","");
	                  }
	                }
	              }
		      }
		    }
		
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return new ArrayList<Map<String, Object>>();
		} catch (ParseException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      }
		return result;
	}

	@Override
	public String lendDocumentUpOrder(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		String type = map.get("type");// 是借阅还是借出
		String bnum = map.get("bNum");// 借阅单编号
		String docId = map.get("docId");// 借阅文件id
		try {
		  //xiewenda 20150612 修改sql 用借阅单编号去获取借阅单信息 主要用到借阅人uid
		  //String sql1 = "select a.documentCode,a.itemName,a.stageCode,a.deviceCode,a.participatoryCode,a.engineeringCode,a.title,a.docNo,b.readerId,c.uid from ess_document a,ess_document_bespeak b,ess_borrowing_form c where b.borrowNum = c.borrowNum and a.id = "+docId;
		  String sql1 = "select * from ess_borrowing_form where borrowNum="+bnum;
          Map<String, Object> hm = query.query(sql1, new MapHandler());
		  List<HashMap<String, String>> isLendlist = new ArrayList<HashMap<String, String>>();
		  HashMap<String, String> isLendmap = new HashMap<String, String>();
		  isLendmap.put("docId", map.get("docId"));
		  isLendmap.put("isBespeak", "true");
		  isLendlist.add(isLendmap);
		  String isLend = this.getDocumentBorrowStatus(isLendlist);
		  if(!"false".equals(isLend)){
		    if("true".equals(isLend)){
		      int lendDays = 0;//借阅天数
              int lendCount = 0;//借阅件数
              int idlendnum = 0;//已借出件数
              if("借出".equals(type)){
                HashMap<String, Object> rolemap = this.getBorrowRoleWithId(Long.valueOf(hm.get("uid")+""));
                if(rolemap.containsKey("notRole") && rolemap.get("notRole").equals(true)){
                  return "请为当前用户添加借阅角色！";
                }
                if(rolemap.get("lendDays")==null || "".equals(rolemap.get("lendDays").toString()) ||
                    "null".equals(rolemap.get("lendDays").toString())){
                  return "请为当前用户的借阅角色设置借出天数！";
                }else if(rolemap.get("lendCount")==null || "".equals(rolemap.get("lendCount").toString()) ||
                    "null".equals(rolemap.get("lendCount").toString())){
                  return "请为当前用户的借阅角色设置借出件数！";
                }else if("0".equals(rolemap.get("lendDays").toString()) || "0".equals(rolemap.get("lendCount").toString())){
                  return "当前用户的借阅角色借出天数或借出件数为0，请重新设置！";
                }
                if(rolemap.get("pnum")==null || "".equals(rolemap.get("pnum").toString()) ||
                    "null".equals(rolemap.get("pnum").toString())){
                  idlendnum = 0;
                }else{
                  idlendnum = Integer.parseInt(rolemap.get("pnum").toString());
                }
                lendDays = Integer.parseInt(rolemap.get("lendDays").toString());
                lendCount = Integer.parseInt(rolemap.get("lendCount").toString());
                if(idlendnum >= lendCount){
                  return "当前用户的借阅角色最大借出件数为"+lendCount+"件，已全部借出，请重新选择！";
                }else if((1+idlendnum)>lendCount || 1>lendCount){
                  return "当前用户的借阅角色最大借出件数为"+lendCount+"，已借出"+idlendnum+"件，请重新选择！";
                }
              }
              Calendar calendar = Calendar.getInstance();
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
              Date date = calendar.getTime();
              String happen_date = sdf.format(date);
              calendar.add(Calendar.DAY_OF_YEAR,"借阅".equals(type) ? 0 : lendDays);
              date = calendar.getTime();
              String shouldreturndate = sdf.format(date);
              String sql2 = "update ess_borrrowing_detail set status='已"+ type+"',happen_date='"+happen_date+"',shouldreturndate='"+shouldreturndate+"' where borrowNum = '"+ bnum + "' and docId = "+docId;
             long res = query.update(sql2);
             String sql3 = "update ess_borrowing_form set status ='未结束',pnum = pnum+1 where borrowNum = '"+ bnum + "'";
             String sql4 = "update ess_document_bespeak set status = '已"+type+"' where borrowNum = '"+ bnum + "' and docId = "+docId;
             String sql5 = "update ess_document set borrowStatus = '"+type+"' where id = "+docId;
             res+=query.update(sql3);
             res+=query.update(sql4);
             res+=query.update(sql5);
             if(res > 0){
               Map<String,Object> log = new HashMap<String,Object>();
               log.put("ip", map.get("ip"));
               log.put("userid", map.get("userId"));
               log.put("module", "文件借阅");
               log.put("operate", "文件借阅："+type+"预约的借阅表单数据");
               log.put("loginfo", type+"编号为【"+ bnum+"】的借阅表单");
               this.getLogService().saveLog(log);
               //添加或删除催还消息
               if(type.equals("借出")){
                 Map<String, String> sendMap = new HashMap<String, String>();
                 sendMap.put("userId", map.get("userId").toString());
                 sendMessageHashUser(sendMap);
               }
               return "true";
             }else{
               return "false";
             }
	        }else{
	          return "您选择的数据已被其他借阅单借阅或借出，不能"+type+"，请重新选择！";
	       }
		 }else{
		   return "false";
		 }
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "false";
	}

	@Override
	public Long getCountWithTname(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		String tName = map.get("tname");
		String condition = map.get("condition");
		if ("all".equals(condition))
			condition = "status = '预约'";
		if ("order".equals(condition))
			condition = "status not in('归还','预约','申请')";
		if ("noOrder".equals(condition))
			condition = "status = '归还'";
		StringBuffer sql = new StringBuffer(99);
		sql.append("select * from ").append(tName).append(" where 1=1");
		if (!"".equals(condition) && null != condition) {
			sql.append(" and ").append(condition);
		}
		if(!this.isAdminRole(map.get("userId").toString())){
			  sql.append(" and userId = '"+map.get("userId")+"' ");
		}
		try {
			//Long c = query.query(sql.toString(), new ScalarHandler<Long>());
		    sql.append(" group by docId");
			List<Map<String, Object>> list = query.query(sql.toString(),new MapListHandler());
			int c = list.size();
			return (long)c;
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public List<Map<String, Object>> getRespeakById(String userId) {
      // TODO Auto-generated method stub
      try {
          String sql = "select * from ess_document_bespeak where status = '申请' and userId = '"+userId+"' order by id";
          List<Map<String, Object>> list = query.query(sql, new MapListHandler());
          return list;
      } catch (SQLException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
          return new ArrayList<Map<String, Object>>();
      }
    }

	@Override
	public Long delFormArchivesCar(String id,String userId,String ip) {
		// TODO Auto-generated method stub
	  try {
	    if (!"".equals(id)&&!"0".equals(id)) {
           String sql = "delete from ess_document_bespeak where find_in_set (id, '"+id+"')";
           int rows = query.update(sql);
           if(rows>0){
             Map<String,Object> log = new HashMap<String,Object>();
             log.put("ip", ip);
             log.put("userid", userId);
             log.put("module", "全文检索");
             log.put("operate", "全文检索：删除申请文件");
             log.put("loginfo", "删除标识为【"+ id+"】申请预约的借阅文件");
             this.getLogService().saveLog(log);
           }
           return (long) rows;
        } else {
            String sql1 = "delete from ess_document_bespeak where status = '申请'";
            int rows = query.update(sql1);
            if(rows>0){
              Map<String,Object> log = new HashMap<String,Object>();
              log.put("ip", ip);
              log.put("userid", userId);
              log.put("module", "全文检索");
              log.put("operate", "全文检索：清空申请预约文件");
              log.put("loginfo", "清空所有申请预约的借阅文件");
              this.getLogService().saveLog(log);
            }
            return (long) rows;
        }
	  } catch (SQLException e) {
         // TODO Auto-generated catch block
         e.printStackTrace();
	  }
	  return (long) 0;
	}

	// 判断年份是否存在
	public boolean isNewS(List<String> list, String s) {
		for (String string : list) {
			if (s.equals(string))
				return true;
		}
		return false;
	}

	@Override
	public List<Map<String, Object>> getTree(HashMap<String, String> map) {
		// TODO Auto-generated method stub
	  String id = map.get("id");
      String type = map.get("type");
      String statusForTree = map.get("statusForTree");
      List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
      try {
        if(id.equals("1")){
          //获取所有的年份
          String sql = "select regDate from ess_borrowing_form where 1=1";
          if(!this.isAdminRole(map.get("userid"))){
			  sql = sql +" and regPerson = '"+map.get("userid")+"' ";
		  }
          if(statusForTree != null && statusForTree.equals("0")){
              sql = sql +" and status ='未结束' ";
          }else if(statusForTree != null && statusForTree.equals("1")){
              sql = sql +" and status ='已结束' ";
          }
          sql = sql +" order by regDate";
          List<Map<String, Object>> list = query.query(sql,new MapListHandler());
          if(!list.isEmpty()){
            for (Map<String, Object> m1 : list) {
              HashMap<String,Object> dm = new HashMap<String,Object>();
              String date = m1.get("regDate").toString();
              date = date.split("-")[0];
              boolean flag = false;
              for(Map<String, Object> m2:result){
                  if(m2.get("id").equals(date)){
                      flag = true;
                  }
              }
              if(flag){
                  continue;
              }
              dm.put("id", date);
              dm.put("name", date+"年份");
              dm.put("isParent", true);
              dm.put("pId", id);
              dm.put("open", true);
              result.add(dm);
            }
            return result;
          }else{
            return new ArrayList<Map<String,Object>>();
          }
        }else if(type.equals("year")){// 点年获取月份
          String sql ="select regDate from ess_borrowing_form where regDate like '"+id+"-%' ";
          if(!this.isAdminRole(map.get("userid"))){
			  sql = sql +" and regPerson = '"+map.get("userid")+"' ";
		  }
          if(statusForTree != null && statusForTree.equals("0")){
              sql = sql +" and status ='未结束' ";
          }else if(statusForTree != null && statusForTree.equals("1")){
              sql = sql +" and status ='已结束' ";
          }
          List<Map<String, Object>> list2 = query.query(sql,new MapListHandler());
          if(!list2.isEmpty()){
            for (Map<String, Object> m3 : list2) {
              HashMap<String,Object> dm = new HashMap<String,Object>();
              String date = m3.get("regDate").toString();
              date = date.split("-")[1];
              boolean flag = false;
              for(Map<String, Object> m4:result){
                  if(m4.get("id").equals(date)){
                      flag = true;
                  }
              }
              if(flag){
                  continue;
              }
              dm.put("id", date);
              dm.put("name", date+"月");
              dm.put("isParent", false);
              dm.put("pId", id);
              dm.put("open", true);
              result.add(dm);
            }
            return result;
          }else{
            return new ArrayList<Map<String,Object>>();
          }
        }
      } catch (SQLException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	  }
      return new ArrayList<Map<String,Object>>();
	}

	@Override
	public String printBorrowreport(HashMap<String, String> map) {
		// TODO Auto-generated method stub
	    String reportId = map.get("reportId");
	    String reportTitle = map.get("reportTitle");
	    String reportStyle = map.get("reportStyle");
	    String borrowId = map.get("borrowId");
	    String borrowNum = map.get("borrowNum");
	    String condition = map.get("condition");
		List<Map<String, String>> list = new ArrayList<Map<String, String>>();
		try {
		  // 获得报表所需数据
		    String sql = "select d.borrowNum,d.title,d.docNo,a.stageName,a.stageName,a.deviceName,a.participatoryName,"
		        + "a.documentTypeName,a.engineeringName,d.status,d.pnum,d.happen_date,d.shouldreturndate,d.return_date,f.borrowPerson,f.regDate"
		        + ",f.unit,f.telphone,f.email,f.idcardnum,f.remark from ess_borrowing_form f,ess_borrrowing_detail d,ess_document a where f.borrowNum = d.borrowNum and "
		        + "a.id = d.docId and d.status <> '未借阅' ";
		    if(condition!=null && !"".equals(condition)){
		      condition = this.getCondition(condition,"f");
		      sql += condition;
		    }else if(borrowId!=null && !"".equals(borrowId)){
		      sql += " and find_in_set(f.id,'"+borrowId+"')";
		    }
		    sql += " order by f.id";
		    List<Map<String, Object>> detail = query.query(sql, new MapListHandler());
		    if(!detail.isEmpty()){
		      for(Map<String, Object> m:detail){
                HashMap<String, String> hm = new HashMap<String, String>();
                hm.put("借阅单编号", String.valueOf(m.get("borrowNum")));
                hm.put("文件标题", String.valueOf(m.get("title")));
                hm.put("文件编码", String.valueOf(m.get("docNo")));
                hm.put("收集范围", String.valueOf(m.get("stageName")));
                hm.put("装置名称", String.valueOf(m.get("deviceName")));
                hm.put("拟定部门", String.valueOf(m.get("participatoryName")));
                hm.put("类型代码名称", String.valueOf(m.get("documentName")));
                hm.put("专业代码名称", String.valueOf(m.get("engineeringName")));
                m.put("状态", String.valueOf(m.get("status")));
                m.put("件数", String.valueOf(m.get("pnum")));
                hm.put("发生日期", String.valueOf(m.get("happen_date")));
                hm.put("应归还日期", String.valueOf(m.get("shouldreturndate")));
                hm.put("归还日期", String.valueOf(m.get("return_date")));
                hm.put("借阅人", String.valueOf(m.get("borrowPerson")));
                hm.put("登记日期", String.valueOf(m.get("regDate")));
                hm.put("单位", String.valueOf(m.get("unit")));
                hm.put("电话", String.valueOf(m.get("telphone")));
                hm.put("邮箱", String.valueOf(m.get("email")));
                hm.put("身份证", String.valueOf(m.get("idcardnum")));
                m.put("备注", String.valueOf(m.get("remark")));
                list.add(hm);
              }
		      Map<String, Object> params = new HashMap<String, Object>();
		      
	            params.put("reportId", reportId);
	            params.put("reportData", list);
	            params.put("userid", "admin");
	            params.put("username", "管理员");
	            params.put("reportTitle", reportTitle+"("+reportStyle+")");
	            if(reportStyle.equals("PDF")){
	               reportStyle = "pdf";
	            }else if(reportStyle.equals("WORD")){
	               reportStyle = "rtf";
	            }else if(reportStyle.equals("EXCEL")){
	               reportStyle = "xls";
	            }
	            params.put("reportType", reportStyle);
	            this.getReportService().runReportManager(params);
	            
	            String[] borrowNumArr = borrowNum.split(",");
	            StringBuilder sb = new StringBuilder();
	            for (String num : borrowNumArr) {
                  sb.append("【"+num+"】");
                }
	            
	            Map<String,Object> log = new HashMap<String,Object>();
	            log.put("ip", map.get("ip"));
	            log.put("userid", map.get("userId"));
	            log.put("module", "文件借阅");
	            log.put("operate", "文件借阅：打印借阅报表");
	            log.put("loginfo", "打印编号为:"+ sb.toString()+"的借阅表单");
	            this.getLogService().saveLog(log);
	            return "true";
		  }else{
		    return "2";
		  }
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			 return "false";
		}
	}

	private IReportService getReportService() {
		if (reportService == null) {
			reportService = this.getService(IReportService.class);
		}
		return reportService;
	}
	@Override
	public String endUsingForm(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		String sql = "update ess_borrowing_form set status = '已结束' where find_in_set (id,'"+map.get("id")+"')";
		try {
			int i = query.update(sql);
			Map<String,Object> log = new HashMap<String,Object>();
            log.put("ip", map.get("ip"));
            log.put("userid", map.get("userId"));
            log.put("module", "文件借阅");
            log.put("operate", "文件借阅：结束借阅表单");
            log.put("loginfo", "结束编号为【"+ map.get("borrowNum")+"】的借阅表单");
            this.getLogService().saveLog(log);
			return String.valueOf(i);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "0";
	}
	
	@Override
    public boolean delDetails(HashMap<String, String> map,String userId,String ip) {
        // TODO Auto-generated method stub
        String sql = "delete from ess_borrrowing_detail where find_in_set (docId,('"+map.get("docId")+"')) and borrowNum = '"+map.get("borrowNum")+"'";
        String sql2 = "select pnum from ess_borrowing_form where borrowNum = '"+map.get("borrowNum")+"'";
        String sql3 = "update ess_borrowing_form set pnum=? where borrowNum = '"+map.get("borrowNum")+"'";
        String sql4 = "delete from ess_document_bespeak where find_in_set (docId,('"+map.get("docId")+"')) and borrowNum = '"+map.get("borrowNum")+"' and status='预约'";
        String title = map.get("title")+"";
        String[] titleArr = title.split(",");
        StringBuilder sb = new StringBuilder();
        for (String t : titleArr) {
          sb.append("【"+t+"】");
        }
        try {
            int num = query.update(sql);
            int pnum = query.query(sql2, new ScalarHandler<Integer>());
            pnum = pnum-num;
            query.update(sql3, new Object[] { pnum });
            query.update(sql4);
            Map<String,Object> log = new HashMap<String,Object>();
            log.put("ip", ip);
            log.put("userid", userId);
            log.put("module", "文件借阅");
            log.put("operate", "文件借阅：删除借阅文件");
            log.put("loginfo", "删除编号为【"+ map.get("borrowNum")+"】借阅单下的借阅库数据标题为:"+sb.toString()+"的借阅文件");
            this.getLogService().saveLog(log);
            return true;
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return false;
    }
	
	@Override
	public String getBorrowFileIdByNum(String borrowNums){
	  // TODO Auto-generated method stub
	  String idStr="";
	  String sql = "select docId from ess_borrrowing_detail where FIND_IN_SET (borrowNum,('"+borrowNums+"'))"
	      + " and status in ('已借阅','已借出')";
	  List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
	  try {
	    list = query.query(sql, new MapListHandler());
	    if(!list.isEmpty()){
	      for(Map<String, Object> m:list){
	        if(m.get("docId")!=null && !"".equals(m.get("docId").toString()) && !"null".equals(m.get("docId").toString()) 
	             ){
	          idStr += m.get("docId")+",";
	        }
	      }
	      idStr = idStr.substring(0,idStr.length()-1);
	      return idStr;
	    }else{
	      return "true";
	    }
	  } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return "false";
      }
	}
	
	@Override
	public String getDocumentBorrowStatus(List<HashMap<String, String>> list){
      try {
        String docIds = "";
        String nums = "";
        for (int i = 0; i < list.size(); i++) {
          if(list.get(i).get("docId")!=null && !"".equals(list.get(i).get("docId"))&&
              !"null".equals(list.get(i).get("docId"))){
            docIds += list.get(i).get("docId")+",";
          }
        }
        docIds = docIds.substring(0,docIds.length()-1);
        String sql = "select * from ess_document where FIND_IN_SET (id,('"+docIds+"'))";
        List<Map<String, Object>> data = query.query(sql, new MapListHandler());
        List<Map<String, Object>> bespeak = new ArrayList<Map<String, Object>>();
        for (int i = 0; i < list.size(); i++) {
        	for (int j = 0; j < data.size(); j++) {
        		if(list.get(i).get("docId").toString().equals(data.get(j).get("id").toString())){
        			if(data.get(j).get("borrowStatus")!=null && ("借阅".equals(data.get(j).get("borrowStatus").toString()) 
        					|| "借出".equals(data.get(j).get("borrowStatus").toString()))){
        	        	 nums+=list.get(i).get("num")+",";
        	        	 bespeak.add(data.get(j));
        	          }
        		}else{
        			continue;
        		}
        	}
        }
        if(nums!=null && !"".equals(nums)){
          nums = nums.substring(0,nums.length()-1);
          if(list.get(0).get("isBespeak").equals("false")){
    		  this.setBespeakDetailByBorrowData(bespeak,list.get(0).get("regperson"),list.get(0).get("readerId"),list.get(0).get("borrowNum"));
    	  }
          return nums;
        }else{
          return "true";
        }
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return "false";
      }
	}  
	
	/**
	 * 根据查询借阅人，文件id查询
	 * @param docId
	 * @param userId
	 * @return
	 */
    private String getRespeakStatusBydocId(String userId,String readerId){
      // TODO Auto-generated method stub
      String num = "";
      try {
        String sql = "select docId from ess_document_bespeak where status = '申请' and userId = '"+userId+"' order by id";
        List<Map<String,Object>> docIds = query.query(sql, new MapListHandler());
        String docIdStr = "";
        if(!docIds.isEmpty()){
          for(Map<String,Object> m:docIds){
            if(m.get("docId")!=null && !"".equals(m.get("docId")) && !"null".equals(m.get("docId"))){
              docIdStr += m.get("docId")+",";
            }
          }
          docIdStr = docIdStr.substring(0,docIdStr.length()-1);
          sql = "select id from ess_document_bespeak where readerId = '"+readerId+"' and status = '预约' and find_in_set(docId,'"+docIdStr+"') order by id";
          List<Map<String,Object>> list = query.query(sql, new MapListHandler());
          if(!list.isEmpty()){
            int i = 0;
            for(Map<String,Object> map:list){
              i++;
              if(map.get("id")!=null && !"".equals(map.get("id")) && !"null".equals(map.get("id"))){
                num += i+",";
              }
            }
            num = num.substring(0,num.length()-1);
          }
        }
        return num;
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return "";
      }
    }
    
    @SuppressWarnings("unchecked")
    @Override
    public boolean editSave(HashMap<String, Object> map) {
        // TODO Auto-generated method stub
        long i1 = 0;
        HashMap<String, String> form = (HashMap<String, String>) map
                .get("form");
        List<HashMap<String, String>> list = (List<HashMap<String, String>>) map
                .get("detail");
        String sql1 = "update ess_borrowing_form set pnum=? where id =?";
        String sql2 = "insert into ess_borrrowing_detail(documentCode,borrowtype,status,happen_date,shouldreturndate,return_date,pnum,borrowNum,remark,itemName,stageCode,deviceCode,participatoryCode,engineeringCode,title,docNo,docId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        StringBuilder logsb = new StringBuilder();
        try {
            if(list!=null && list.size()>0){
                Object[][] params2 = new Object[list.size()][17];
                for (int i = 0; i < list.size(); i++) {
                  HashMap<String, String> m = list.get(i);
                  params2[i][0] = m.get("documentCode");
                  params2[i][1] = m.get("type");
                  params2[i][2] = m.get("status");
                  params2[i][3] = m.get("happendate");
                  params2[i][4] = m.get("shouldreturndate");
                  params2[i][5] = m.get("return_date");
                  params2[i][6] = m.get("pnum");
                  params2[i][7] = form.get("borrownum");
                  params2[i][8] = m.get("remark");
                  params2[i][9] = m.get("itemName");
                  params2[i][10] = m.get("stageCode");
                  params2[i][11] = m.get("deviceCode");
                  params2[i][12] = m.get("participatoryCode");
                  params2[i][13] = m.get("engineeringCode");
                  params2[i][14] = m.get("title");
                  params2[i][15] = m.get("docNo");
                  params2[i][16] = m.get("docId");
                  
                  logsb.append("标题为：【"+ m.get("title")+"】借阅件数为：【"+m.get("pnum")+"】借阅备注为：【"+m.get("remark")+"】\n\r");
                }
                long i2 = query.batch(sql2, params2).length;
            }
            i1 += query
                    .update(sql1,
                            new Object[] {Integer.parseInt(form.get("pnum")),form.get("id") });
            if (i1 > 0){
              Map<String,Object> log = new HashMap<String,Object>();
              log.put("ip", map.get("ip"));
              log.put("userid", map.get("userId"));
              log.put("module", "文件借阅");
              log.put("operate", "文件借阅：添加借阅信息");
              log.put("loginfo", "标编号为【"+ form.get("borrownum")+"】借阅单添加借阅文件\n\r"+logsb.toString());
              this.getLogService().saveLog(log);
              return true;
            }
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return false;
    }
    
    private boolean sendMessageHashUser(Map<String, String> map){
      getMessageWS().deleteMessageByUserName(map);
      List<Map<String, Object>> list = this.getUsingDetailData(map);
      
      /**   liuhezeng 20141009 此处先要过滤出来所有的发送者的催还消息，然后先删除借阅者所有的催还消息之后再发给发送者   **/
      List<String> receiverUserIdMaps = new ArrayList<String>();
      for(Map<String, Object> temp:list){
          if(temp.get("userId") != null && !receiverUserIdMaps.contains(String.valueOf(temp.get("userId"))) && !String.valueOf(temp.get("userId")).equals("-1")  ){
              receiverUserIdMaps.add(String.valueOf(temp.get("userId")));
              map.put("userId", String.valueOf(temp.get("userId")));
              getMessageWS().deleteMessageByUserName(map);
          }
      }
      
      Calendar calendar = Calendar.getInstance() ;
      Date currentDate = calendar.getTime() ;
      SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd") ;
      for(Map<String, Object> temp:list){
          String retuenDate = String.valueOf(temp.get("shouldreturndate"));
          Map<String, String> messMap = new HashMap<String, String>();
          try {
              Date returnDate = dateFormat.parse(retuenDate) ;
              /**wanghongchen 20140723 时间改为24小时制**/
              SimpleDateFormat dateFormat1 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss") ;
              Date date = new Date();
              messMap.put("sender", map.get("userId"));
              messMap.put("recevier", map.get("userId"));
              messMap.put("sendTime", dateFormat1.format(date));
              messMap.put("status", "No");
              messMap.put("workFlowId", -13+"");
              messMap.put("workFlowStatus", "Run");
              messMap.put("stepId", String.valueOf(temp.get("did")));
              /** xiaoxiong 20140710 给消息表添加handler（消息处理函数可执行串）、handlerUrl（消息处理界面地址）、style（提示信息显示样式） **/
              if(currentDate.before(returnDate) || currentDate.equals(returnDate)){
                  messMap.put("content", simpleEncode(String.valueOf(temp.get("userName")) + "：请把借阅单【"+String.valueOf(temp.get("borrowNum"))+"】中文件标题为" + String.valueOf(temp.get("title")) + "的文件在" + retuenDate + "前归还！"));
                  messMap.put("style", "color:green");
                  messMap.put("handler", "$.messageFun.showDocumentReturn('文件借阅催还','showMessageFormUsingForm'," + Long.parseLong(String.valueOf(temp.get("fid"))) + ")");
              } else {
                  messMap.put("content",  simpleEncode(String.valueOf(temp.get("userName")) + "：请把借阅单【"+String.valueOf(temp.get("borrowNum"))+"】中文件标题为" + String.valueOf(temp.get("title")) + "的文件在<font color='green'>" + retuenDate + "</font>前归还！"));
                  messMap.put("style", "color:red");
                  messMap.put("handler", "$.messageFun.showDocumentReturn('文件借阅催还','showMessageFormUsingForm'," + Long.parseLong(String.valueOf(temp.get("fid"))) + ")");
              }
              messMap.put("handlerUrl", "esdocument/0/x/ESMessage/handlerMsgPage");
              boolean f = getMessageWS().addMessage(messMap); 
              if(temp.get("userId") != null){
                  messMap.put("recevier", temp.get("userId").toString());
                  if(currentDate.before(returnDate) || currentDate.equals(returnDate)){
                      messMap.put("content", simpleEncode(String.valueOf(temp.get("userName")) + "：请把借阅单【"+String.valueOf(temp.get("borrowNum"))+"】中文件标题为" + String.valueOf(temp.get("title")) + "的文件在" + retuenDate + "前归还！"));
                      messMap.put("style", "color:green");
                      messMap.put("handler", "$.messageFun.showDocumentReturn('文件借阅催还','showMessageForRegister'," + Long.parseLong(String.valueOf(temp.get("fid"))) +")");
                  } else {
                      messMap.put("content",  simpleEncode(String.valueOf(temp.get("userName")) + "：请把借阅单【"+String.valueOf(temp.get("borrowNum"))+"】中文件标题为" + String.valueOf(temp.get("title")) + "的文件在<font color='green'>" + retuenDate + "</font>前归还！"));
                      messMap.put("style", "color:red");
                      messMap.put("handler", "$.messageFun.showDocumentReturn('文件借阅催还','showMessageForRegister'," + Long.parseLong(String.valueOf(temp.get("fid"))) + ")");
                  }
                  messMap.put("handlerUrl", "esdocument/0/x/ESMessage/handlerMsgPage");
                  boolean f1 = getMessageWS().addMessage(messMap); 
              }
          } catch (ParseException e) {
              e.printStackTrace();
          }
      }
      return true;
    }
    
    private List<Map<String, Object>> getUsingDetailData(Map<String, String> map){
      try {
        StringBuffer buffer = new StringBuffer();
        buffer.append("select f.id fid,d.id did,f.borrowNum,f.borrowPerson username,f.readerId userId,d.title,d.docNo,d.shouldreturndate from ess_borrowing_form f join ess_borrrowing_detail d on f.borrowNum=d.borrowNum where (d.status = '已借出' or d.status = '续借') ");
        buffer.append(" and (d.return_date is null or d.return_date ='') ");
        buffer.append(" and d.shouldreturndate is not null ");
        Date date = new Date();
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DATE, 1);
        String d = (new SimpleDateFormat("yyyy-MM-dd")).format(cal.getTime());
        buffer.append(" and (date_sub(d.shouldreturndate, interval  f.overdueDays day ) <  '" + d+"'  ");    
        buffer.append(" or d.shouldreturndate< '" + d+"' )");
        if(map.get("userId") !=null && !map.get("userId").equals("") && !map.get("userId").equals("U_ANONYMOUS")){
            buffer.append(" and f.readerId = '"+ map.get("userId")+"'");
        }
        List<Map<String, Object>> reuslt = query.query(buffer.toString(), new MapListHandler());
        return reuslt;
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return new ArrayList<Map<String,Object>>();
      }
      
    }
    
    /**
     * 页面参数转码
     * 
     * @param s
     *            转码参数
     * @return 转码之后的参数 2007-01-23
     */
    private String simpleEncode(String s){
        try {
            if (null == s)
                return "";
            s = java.net.URLEncoder.encode(s, "UTF-8");
            s = s.replace('%', '~');
        } catch (UnsupportedEncodingException e) {
        }
        return s;
    }

    @Override
    public List<Map<String, Object>> getFormDataByFormID(long formId) {
      // TODO Auto-generated method stub
      List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
      try{
        String sql = "select * from ess_borrowing_form where id = "+formId;
        list = query.query( sql, new MapListHandler());
      }catch(Exception e){
        e.printStackTrace();
      }
      return list;
    }

    @Override
    public Map<String, Object> getDetailsByFormId(HashMap<String, String> map) {
      // TODO Auto-generated method stub
      long start = (Long.parseLong(map.get("page")) - 1)
          * (Long.parseLong(map.get("rp")));
      long rp = (Long.parseLong(map.get("rp")));
      Map<String, Object> result = new HashMap<String, Object>();
      try{
        String sql = "select borrowNum from ess_borrowing_form where id = "+map.get("formId");
        String borrowNum = query.query(sql, new ScalarHandler<String>());
        if(borrowNum!=null && !"".equals(borrowNum) && !"null".equals(borrowNum)){
          sql = "select d.*,a.stageName,a.deviceName,a.participatoryName,a.documentTypeName,a.engineeringName from ess_borrrowing_detail d,ess_document a where d.docId = a.id and d.borrowNum = '"+borrowNum+"' and (d.status = '已借出' or d.status = '续借') order by d.id";
          sql += " limit " + start + "," + rp + "";
          List<Map<String, Object>> list = query.query( sql, new MapListHandler());
          if(!list.isEmpty()){
            sql = "select count(*) from ess_borrrowing_detail where borrowNum = '"+borrowNum+"' and (status = '已借出' or status = '续借')";
            long count = query.query(sql, new ScalarHandler<Long>());
            result.put("total", (int)count);
            result.put("list", list);
          }else{
            result.put("total", 0);
            result.put("list", list);
          }
        }else{
          result.put("total", 0);
          result.put("list", new ArrayList<Map<String, Object>>());
        }
      }catch(Exception e){
        e.printStackTrace();
      }
      return result;
    }

    @Override
    public String relendOrReturnForForm(HashMap<String, String> map) {
      // TODO Auto-generated method stub
      try{
        if(map.get("type")!=null && map.get("type").equals("续借")){
          // 根据用户查询续借权限
          String mes = this.checkRelendCountForRelend(map.get("borrowNum"),map.get("ip"),map.get("userId"),"");
          if(mes!=null && mes.equals("true")){
            Map<String, String> sendMap = new HashMap<String, String>();
            sendMap.put("userId", map.get("userId"));
            sendMessageHashUser(sendMap);
            return "true";
          }else if(mes!=null && mes.equals("false")){
            return "false";
          }else{
            Map<String, String> sendMap = new HashMap<String, String>();
            sendMap.put("userId", map.get("userId"));
            sendMessageHashUser(sendMap);
            return mes;
          }
        }else if(map.get("type")!=null && map.get("type").equals("归还")){
          String aa = this.getBorrowFileIdByNum(map.get("borrowNum"));
          if(!"".equals(aa) && !"true".equals(aa) && !"false".equals(aa)){
            Calendar calendar = Calendar.getInstance();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date date = calendar.getTime();
            String return_date = sdf.format(date);
            String sql = "update ess_borrrowing_detail set status = '归还',return_date = '"+return_date+"' where borrowNum = '"+map.get("borrowNum")+"' and (status = '已借出' or status = '续借')";
            String sql1 = "update ess_document a,ess_borrrowing_detail d set borrowStatus = '0' where a.id = d.docId";
            String sql2 = "update ess_document_bespeak set status='归还' where borrowNum = '"+map.get("borrowNum")+"' and (status = '已借出' or status = '续借')";
            int row = -1;
            row = query.update(sql);
            row += query.update(sql1);
            row += query.update(sql2);
            if(row>0){
               Map<String,Object> log = new HashMap<String,Object>();
               log.put("ip", map.get("ip"));
               log.put("userid", map.get("userId"));
               log.put("module", "文件借阅");
               log.put("operate", "文件借阅：归还借阅表单");
               log.put("loginfo", "归还编号为【"+ map.get("borrowNum")+"】的借阅表单");
               this.getLogService().saveLog(log);
               Map<String, String> sendMap = new HashMap<String, String>();
               sendMap.put("userId", map.get("userId"));
               sendMessageHashUser(sendMap);
               return "true";
             }else{
               return "false";
             }
          }else{
            return "您选择借阅单下没有要归还的数据，请重新选择！";
          }
        }else{
          return "false";
        }
      } catch (SQLException e) {
            // TODO Auto-generated catch block
          e.printStackTrace();
          return "false";
      }
    }

    @Override
    public String relendOrReturnForDetails(HashMap<String, String> map) {
      // TODO Auto-generated method stub
      try{
        String ids = map.get("ids");
        if(ids!=null && !"".equals(ids)){
          String id = ids.split(",")[0];
          String sqla = "select borrowNum from ess_borrrowing_detail where id ="+Integer.parseInt(id);
          String borrowNum = query.query(sqla, new ScalarHandler<String>());
          if(map.get("type")!=null && map.get("type").equals("续借")){
            // 根据用户查询续借权限
            String mes = this.checkRelendCountForRelend(borrowNum,map.get("ip"),map.get("userId"),map.get("docId"));
            if(mes!=null && mes.equals("true")){
              Map<String, String> sendMap = new HashMap<String, String>();
              sendMap.put("userId", map.get("userId"));
              sendMessageHashUser(sendMap);
              return "true";
            }else if(mes!=null && mes.equals("false")){
              return "false";
            }else{
              Map<String, String> sendMap = new HashMap<String, String>();
              sendMap.put("userId", map.get("userId"));
              sendMessageHashUser(sendMap);
              return mes;
            }
          }else if(map.get("type")!=null && map.get("type").equals("归还")){
            Calendar calendar = Calendar.getInstance();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date date = calendar.getTime();
            String return_date = sdf.format(date);
            String sql = "update ess_borrrowing_detail set status = '归还',return_date = '"+return_date+"' where find_in_set (id,'"+ids+"') and (status = '已借出' or status = '续借')";
            String sql1 = "update ess_document a,ess_borrrowing_detail d set borrowStatus = '0' where a.id = d.docId";
            String sql2 = "update ess_document_bespeak set status='归还' where borrowNum = '"+borrowNum+"' and status in('已借出','续借') and docId = "+map.get("docId");
            int row = -1;
            row = query.update(sql);
            row += query.update(sql1);
            row += query.update(sql2);
            if(row>0){
               Map<String,Object> log = new HashMap<String,Object>();
               log.put("ip", map.get("ip"));
               log.put("userid", map.get("userId"));
               log.put("module", "文件借阅");
               log.put("operate", "文件借阅：归还借阅表单");
               log.put("loginfo", "归还编号为【"+ borrowNum+"】的借阅表单");
               this.getLogService().saveLog(log);
               Map<String, String> sendMap = new HashMap<String, String>();
               sendMap.put("userId", map.get("userId"));
               sendMessageHashUser(sendMap);
               return "true";
             }else{
               return "false";
             }
          }else{
            return "false";
          }
        }else{
          return "false";
        }
      } catch (SQLException e) {
            // TODO Auto-generated catch block
          e.printStackTrace();
          return "false";
      }
    }
    
    private String checkRelendCountForRelend(String borrowNum,String ip,String userId,String docId){
      String str = "";
      try{
        // 根据用户查询续借权限
        String sql = "select uid from ess_borrowing_form where borrowNum = '"+ borrowNum+"'";
        Map<String, Object> hm = query.query(sql, new MapHandler());
        if(!"".equals(hm.get("uid").toString()) && !"null".equals(hm.get("uid").toString()) && hm.get("uid") != null){
          sql = "select roleId from ess_user_role where userId = "+ hm.get("uid");
          List<Map<String, Object>> role = query.query(sql,new MapListHandler());
          String roleid = "";
          for (Map<String, Object> object : role) {
              String obj = String.valueOf(object.get("roleId"));
              if(!"".equals(obj) && !"null".equals(obj) && obj != null){
                roleid += obj + ",";
              }
          }
          String sql1 = "select * from ess_using_role_relend_count b where find_in_set (b.roleId,'"+roleid+"')";
          // 根据借阅单编号查出该订单下
          String sql2 = "select id,shouldreturndate,relendcount from ess_borrrowing_detail where borrowNum = "+ borrowNum+" and (status = '已借出' or status = '续借')";
          if(!"".equals(docId)){
            sql2 += "  and docId = "+Integer.parseInt(docId);
          }
          sql2 += " order by id";
          List<Map<String, Object>> list1 = query.query(sql1,new MapListHandler());
          List<Map<String, Object>> list2 = query.query(sql2,new MapListHandler());
          int[] relendcounts = new int[list2.size()];// 存放续借次数
          int[] relenddays = new int[list1.size()];// 存放续借天数
          int index = 0;
          if(list1.size() == 0){
            str =  "此用户没有续借次数！";
          }
          String relendNum = "";//记录续借成功的行数
          String notrelendNum = "";//记录续借失败的行数
          int n = 0;//行数
          List<Map<String, Object>> list3 = new ArrayList<Map<String, Object>>();
          for (Map<String, Object> map : list2) {
             n++;
             if (Integer.parseInt(map.get("relendcount").toString()) >= list1
                          .size()) {
                  notrelendNum += n+",";
                  continue;
              }else {
                  relendNum += n+",";
                  relendcounts[index++] = Integer.parseInt(map.get(
                                "relendcount").toString()) + 1;
                  list3.add(map);
              }
          }
          index = 0;
          for (Map<String, Object> map : list1) {
             relenddays[index++] = Integer.parseInt(map.get("relendDays")
                      .toString());
          }
          HashMap<String, String> mp = new HashMap<String, String>();
          for (Map<String, Object> map : list3) {
              List<Map<String, Object>> l = new ArrayList<Map<String, Object>>();
              Map<String, Object> m = new HashMap<String, Object>();
              m.put("id", map.get("id"));
              m.put("shouldreturndate", map.get("shouldreturndate"));
              l.add(m);
              int rd = Integer.parseInt(map.get("relendcount").toString());
              mp.put(String.valueOf(map.get("id")),
                      changetimes(l, relenddays[rd]).get(map.get("id").toString()));
          }
          sql = "update ess_borrrowing_detail set status = '续借',shouldreturndate=?,relendcount=? where id = ?";
          Object[][] params = new Object[list3.size()][3];
          for (int i = 0; i < list3.size(); i++) {
            String curId = String.valueOf(list3.get(i).get("id"));
            String rc = String.valueOf(relendcounts[i]);
            params[i][0] = mp.get(curId);
            params[i][1] = rc;
            params[i][2] = curId;
          }
          int row = query.batch(sql, params).length;
          sql = "update ess_document_bespeak set status = '续借' where borrowNum = '"+borrowNum+"'";
          if(!"".equals(docId)){
            sql += "  and docId = "+Integer.parseInt(docId);
          }
          row += query.update(sql);
          StringBuffer mes = new StringBuffer();
          if(relendNum!=null && !"".equals(relendNum) && !"null".equals(relendNum)){
              relendNum = relendNum.substring(0, relendNum.length()-1);
              mes.append("<br>").append("第【"+relendNum+"】行数据续借成功！");
          }
          if(notrelendNum!=null && !"".equals(notrelendNum) && !"null".equals(notrelendNum)){
              notrelendNum = notrelendNum.substring(0, notrelendNum.length()-1);
              mes.append("<br>").append("第【"+notrelendNum+"】行数据已经没有续借次数了！");
          }
          if(mes.toString()!=null && !"".equals(mes.toString()) && !"null".equals(mes.toString())){
            StringBuffer result = new StringBuffer();
            if(relendNum!=null && !"".equals(relendNum) && !"null".equals(relendNum)){
             Map<String,Object> log = new HashMap<String,Object>();
             log.put("ip", ip);
             log.put("userid", userId);
             log.put("module", "文件借阅");
             log.put("operate", "文件借阅：续借借阅表单数据");
             log.put("loginfo", "续借编号为【"+ borrowNum+"】的借阅表单");
             this.getLogService().saveLog(log);
             Map<String, String> sendMap = new HashMap<String, String>();
             sendMap.put("userId", userId);
             sendMessageHashUser(sendMap);
             if(notrelendNum!=null && !"".equals(notrelendNum) && !"null".equals(notrelendNum)){
               str = result.append("您选择的借阅单中：").append(mes).toString();
             }else{
               str = "true";
             }
           }else{
             if(notrelendNum!=null && !"".equals(notrelendNum) && !"null".equals(notrelendNum)){
               str = result.append("您选择的借阅单中：").append(mes).toString();
             }else{
               str = "false";
             }
           }
         }else{
           str = "false";
         }
        }else{
          str = "false";
        }
       }catch(Exception e){
         e.printStackTrace();
       }
      return str;
    }
    
    /**
     * 组装筛选条件
     * @param condition
     * @return
     */
    private String getCondition(String condition,String tableId){
      condition = condition.replaceAll("\"", "");
      String[] cons = condition.split(",");
      Map<String, String> conmap = new HashMap<String, String>();
      conmap.put("equal", " = ");
      conmap.put("greaterThan", " > ");
      conmap.put("lessThan", " < ");
      conmap.put("notEqual", " <> ");
      conmap.put("greaterEqual", " >= ");
      conmap.put("lessEqual", " <= ");
      conmap.put("like", " like ");
      conmap.put("notLike", " not like ");
      if (cons.length > 0 && !"".equals(condition)) {
          condition = condition.substring(0, condition.length() - 1);
          cons = condition.split(",");
          condition = " AND";
          for (String s : cons) {
              String[] t = s.split(":");
              if(tableId!=null && !"".equals(tableId)){
                condition += " "+tableId+"."+t[0];
              }else{
                condition += " "+t[0];
              }
              condition += conmap.get(t[1]);
              if (t[1].equals("like") || t[1].equals("notLike")) {
                  condition += "'%" + t[2] + "%'";
              } else {
                  condition += "'" + t[2] + "'";
              }
              condition += " " + t[3];
          }
          if (condition.endsWith("AND") || condition.endsWith("OR")) {
              condition = condition.substring(0, condition.length() - 3);
          }
      }
      return condition;
    }

    @Override
    public int addCarForBespeak(HashMap<String, Object> map) {
      // TODO Auto-generated method stub
      long retl = 0;
      try {
        String sql = "select count(*) from ess_document_bespeak where status = '申请' and docId = "+map.get("docId")+" and userId = '"+map.get("userId")+"'";
        long num = query.query(sql,new ScalarHandler<Long>());
        if(num > 0){
          return -1;
        }
        String sql1 = "select * from ess_document where id = "+map.get("docId");
        Map<String, Object> map1 = query.query(sql1, new MapHandler());
        if(map1 == null){
        	return -2;
        }
        String sql2 = "insert into ess_document_bespeak(title,documentCode,status,borrowNum,docId,docNo,itemName,stageName,deviceName,participatoryName,engineeringCode,userId,readerId,documentTypeName,engineeringName) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        retl += query.insert(
            sql2,
            new ScalarHandler<Long>(),
            new Object[] { map1.get("title"), map1.get("documentCode"),
                    "申请", "",
                    map.get("docId"), map1.get("docNo"),
                    map1.get("itemName"), map1.get("stageName"),
                    map1.get("deviceName"), map1.get("participatoryName"),
                    map1.get("engineeringCode"),map.get("userId"),"",map1.get("documentTypeName"),map1.get("engineeringName")});
        if(retl>0){
          Map<String,Object> log = new HashMap<String,Object>();
          log.put("ip", map.get("ip"));
          log.put("userid", map.get("userId"));
          log.put("module", "全文检索");
          log.put("operate", "全文检索：申请借阅文件");
          log.put("loginfo", "申请文件标识为【"+ map.get("docId")+"】，文件标题为【"+map1.get("title")+"】的文件！");
          this.getLogService().saveLog(log);
          return (int) retl;
        }else{
          return 0;
        }
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
        return 0;
      }
    }
    
    /**
     * 判断当前用户是否具有admin角色
     * @param userId 用户标识
     * @return
     */
    private boolean isAdminRole(String userId){
        UserEntry user = this.getUserQueryService().findUserByUserid(
            this.getServiceId(), this.getToken(), userId, null);
        String roleIds = this.getRoleService().getRolesByUserId(user.getId());
        String[] roleArr = roleIds.split(",");
        List<String> roleIdList = Arrays.asList(roleArr);
        // 包含1 表示具有admin角色 admin 为最高权限
        if (roleIdList.contains("1")) {
        	return true;
        } else {
        	return false;
        }
    }
    
    private void setBespeakDetailByBorrowData(List<Map<String, Object>> list,String regperson,String readerId,String borrowNum){
    	try{
    		
        	String sql1 = "insert into ess_document_bespeak(title,documentCode,status,borrowNum,docId,docNo,itemName,stageName,deviceName,participatoryName,engineeringCode,userId,readerId,documentTypeName,engineeringName) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        	String sql2 = "update ess_borrrowing_detail set status = '预约' where borrowNum = ? and docId = ?";
			String docIdStr = "";
        	for(Map<String, Object> map :list){
                if(map.get("id")!=null && !"".equals(map.get("id")) && !"null".equals(map.get("id"))){
                      docIdStr += map.get("id")+",";
                }
            }
            docIdStr = docIdStr.substring(0,docIdStr.length()-1);
            String sql = "select docId from ess_document_bespeak where readerId = '"+readerId+"' and status = '预约' and find_in_set(docId,'"+docIdStr+"') and borrowNum = '"+borrowNum+"' order by id";
            List<Map<String, Object>> docIdlist = query.query(sql, new MapListHandler());
            List<String> docIds = new ArrayList<String>();
            for(Map<String, Object> docIdmap:docIdlist){
            	docIds.add(docIdmap.get("docId").toString());
            }
            Object[][] params1 = new Object[list.size()-docIdlist.size()][15];
            Object[][] params2 = new Object[list.size()][2];
			for (int i = 0; i < list.size(); i++) {
				Map<String, Object> m = list.get(i);
				params2[i][0] = borrowNum;
				params2[i][1] = m.get("id");
				if(docIds.contains(m.get("id").toString())){
					continue;
				}
				params1[i][0] = m.get("title");
				params1[i][1] = m.get("documentCode");
				params1[i][2] = "预约";
				params1[i][3] = borrowNum;
				params1[i][4] = m.get("id");
				params1[i][5] = m.get("docNo");
				params1[i][6] = m.get("itemName");
				params1[i][7] = m.get("stageName");
				params1[i][8] = m.get("deviceName");
				params1[i][9] = m.get("participatoryName");
				params1[i][10] = m.get("engineeringCode");
				params1[i][11] = regperson;
				params1[i][12] = readerId;
				params1[i][13] = m.get("documentTypeName");
				params1[i][14] = m.get("engineeringName");
			}
			query.batch(sql1, params1);
			query.batch(sql2, params2);
    	}catch(SQLException e){
    		e.printStackTrace();
    	}
    	
    }
}