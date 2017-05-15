package cn.flying.rest.dao.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Repository;

import cn.flying.rest.dao.DocumentTransferDao;
import cn.flying.rest.entity.CollaborativeEntity;
import cn.flying.rest.service.utils.JdbcUtil;

/**
 * 
 * @author xuekun
 * 
 */
@Repository
public class DocumentTransferDaoImpl implements DocumentTransferDao {
  @Resource(name = "queryRunner")
  private QueryRunner query;

  @Override
  public boolean checkTransfer(Long id, String rightCond) {
    boolean flag = false;
    Map<String, Object> map = null;
    try {
      StringBuilder sql = new StringBuilder(
          "select id,transferstatus from ess_document where 1=1 and id = ?");
      StringBuilder conSql = new StringBuilder();
      sql.append(conSql).append(
          " and  (transferstatus is null or transferstatus ='' )");
      map = query.query(sql.toString(), new MapHandler(), new Object[] { id });
      if (map != null) {
        flag = true;// 该条数据可以移交
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return flag;
  }

  @Override
  public boolean checkIfExitsFlow(Long stageId) {
    boolean flag = false;
    // 获取该收集范围数据
    Map<String, Object> documentStage = this.getDocumentStage(stageId);

    if (this.getTransferFlows(stageId).size() != 0) {
      flag = true;
    } else {
      String id_seq = documentStage.get("id_seq").toString().substring(2);
      String[] stageIds = id_seq.split("\\.");
      for (int i = 0; i < stageIds.length; i++) {
        if (getTransferFlows(Long.parseLong(stageIds[i])).size() != 0) {
          flag = true;// 存在该父节点存在流程
          break;
        }
      }
    }

    return flag;
  }

  public Map<String, Object> getDocumentStage(Long stageId) {
    String sql = "select * from ess_document_stage where id=?";
    Object[] params = { stageId };
    return JdbcUtil.query(query, sql, new MapHandler(), params);
  }

  @Override
  public List<Map<String, Object>> getTransferFlows(Long stageId) {
    String sql = "select a.* from ess_transferflow a, ess_transferform b where find_in_set(replace (b.form_id, 'form-', ''),?) and find_in_set(a.id,b.flow_id) and a.status = 1";
    List<Map<String, Object>> list = null;
    try {
      Map<String, Object> stage = this.getDocumentStage(stageId);
      list = query.query(sql, new MapListHandler(), new Object[] { stageId
          + "," + stage.get("pId") });
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return list;
  }

  public Long getTransferFlowCount(Long stageId) {
    String sql = "select count(1) from ess_transferflow a, ess_transferform b where find_in_set(replace (b.form_id, 'form-', ''),?) and find_in_set(a.id,b.flow_id) and a.status = 1";
    Long cnt = null;
    try {
      Map<String, Object> stage = this.getDocumentStage(stageId);
      cnt = query.query(sql, new ScalarHandler<Long>(), new Object[] { stageId
          + "," + stage.get("pId") });
      if (cnt == null) {
        cnt = 0l;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return cnt;
  }

  @Override
  public Map<String, Object> getWfList(String stageId) {
    Map<String, Object> map = new HashMap<String, Object>();
    Map<String, Object> documentStage = this.getDocumentStage(Long
        .parseLong(stageId));

    if (this.getTransferFlows(Long.parseLong(stageId)).size() != 0) {
      map.put("data", getTransferFlows(Long.parseLong(stageId)));
      map.put("size", getTransferFlowCount(Long.parseLong(stageId)));

    } else {
      String id_seq = documentStage.get("id_seq").toString().substring(2);
      String[] stageIds = id_seq.split("\\.");
      for (int i = 0; i < stageIds.length; i++) {
        if (getTransferFlowCount(Long.parseLong(stageIds[i])) != 0) {
          map.put("data", getTransferFlows(Long.parseLong(stageIds[i])));
          map.put("size", getTransferFlowCount(Long.parseLong(stageIds[i])));
          break;
        }
      }
    }
    return map;
  }

  @Override
  public Map<String, Object> getTransferFlow(Long id) {
    String sql = "select * from ess_transferflow where id = ?";
    Map<String, Object> map = null;
    try {
      map = query.query(sql, new MapHandler(), new Object[] { id });
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public Map<String, Object> getTransferStep(Long flowId, Long stepId) {
    Map<String, Object> stepMap = null;
    try {
      String sql = "select * from ess_transferstep where flow_id =? and step_id =? ";
      stepMap = query.query(sql, new MapHandler(), new Object[] { flowId,
          stepId });
      if (stepMap == null) {
        stepMap = new HashMap<String, Object>();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return stepMap;
  }

  @Override
  public Map<String, Object> getTransferAction(Long flowId, Long stepId) {
    String sql = "select * from ess_transferaction where flow_id=? and step_id=? ";
    Map<String, Object> map = null;
    try {
      map = query.query(sql, new MapHandler(), new Object[] { flowId, stepId });
      if (map == null) {
        map = new HashMap<String, Object>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return map;
  }

  @Override
  public List<Map<String, Object>> getEditMataList(String stageId) {
    List<Map<String, Object>> list = null;
    String sql = " select * from ess_document_metadata m where exists "
        + " ( select 1 from ess_document_stage a where exists "
        + "  ( select 1 from ess_document_stage b where find_in_set( a.id, replace (b.id_seq, '.', ',')) "
        + " or a.id = b.id and b.id = ? ) and (m.stageid = a.id or( m.stageId is null and m.isSystem= 0 ) ) )";

    Object[] params = { stageId };
    try {
      list = query.query(sql, new MapListHandler(), params);
      if (list == null) {
        list = new ArrayList<Map<String, Object>>();
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return list;
  }

  /**
   * 用于生成动态表的Id.
   * 
   * @param fromId
   *          表单模板id.
   * @return 返回动态生成表单的id.
   */
  @Override
  public int generateESFId(long formId) {
    int curid = 1;
    try {
      Integer maxId = query.query(
          "select max(ID)+1 as maxPk from ess_transferform_user ",
          new ScalarHandler<Integer>());
      if (maxId != null) {
        curid = maxId++;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return curid;
  }

  @Override
  public boolean startWorkflow(long wfID, long formId, int userformID,
      Map<String, Object> userFormdataMap, CollaborativeEntity collEntity) {
    // Session session = null;
    // Connection cn = null;
    try {
      // session = this.getSession();
      // cn = session.connection();
      // cn.setAutoCommit(false);
      this.saveEsOFUserFormValue(formId, userFormdataMap);
      this.saveCollaborativeEntity(wfID, collEntity);
      // cn.commit();
      return true;
    } catch (Exception e) {
      e.printStackTrace();
      // try {
      // cn.rollback();
      // } catch (SQLException e1) {
      // e1.printStackTrace();
      // }
      return false;
    }
  }

  @SuppressWarnings("deprecation")
  public boolean saveEsOFUserFormValue(long formId, Map<String, Object> dataMap) {
    try {
      Date date = new java.util.Date();
      long year = date.getYear() + 1900;
      long month = date.getMonth() + 1;
      long day = date.getDate();
      String sql = "";
      String userformno = "";
      if (formId != -10) {
        userformno = ("NO." + year + (month >= 10 ? month : ("0" + month)))
            + (day >= 10 ? day : ("0" + day)) + "-";
        sql = "Select user_formno from ess_transferform_user where wf_id != -10 and tree_year = ? order by id desc";
        String str = query.query(sql, new ScalarHandler<String>(),
            new Object[] { year });
        if (!StringUtils.isEmpty(str)) {
          long no = Long
              .parseLong(str.substring(str.length() - 6, str.length())) + 1;
          for (int i = 6; i > (no + "").length(); i--) {
            userformno = userformno + "0";
          }
          userformno = userformno + no;
        } else {
          userformno = userformno + "000001";
        }
      } else {
        userformno = ("NO." + year + (month >= 10 ? month : ("0" + month)))
            + (day >= 10 ? day : ("0" + day)) + "-E";
        sql = "select user_formno from ess_transferform_user where wf_id = ? and tree_year = ? order by id desc";
        String str = query.query(sql, new ScalarHandler<String>(),
            new Object[] { formId, year });
        if (!StringUtils.isEmpty(str)) {
          long no = Long
              .parseLong(str.substring(str.length() - 5, str.length())) + 1;
          for (int i = 5; i > (no + "").length(); i--) {
            userformno = userformno + "0";
          }
          userformno = userformno + no;

        } else {
          userformno = userformno + "00001";
        }
      }
      sql = "INSERT INTO ess_transferform_user (id,user_id,form_id,wf_id,title,start_time,end_time,wf_status,part_id,tree_year,tree_month,dataId,user_formno) values(?,?,?,?,?,?,?,?,?,?,?,?,?)";
      System.out.println(sql);
      Long dataID = -1l;
      String dataid = (String) dataMap.get("data_id");
      if (dataid != null && !"".equals(dataid.trim())) {
        dataID = Long.parseLong(dataid);
      }
      Object[] params = { dataMap.get("id"), dataMap.get("user_id"), formId,
          dataMap.get("wf_id"),
          dataMap.get("form_title") + "_" + dataMap.get("USER_NAME"),
          new java.sql.Timestamp(new Date().getTime()), null,
          dataMap.get("wf_status"), dataMap.get("part_id"), year + "",
          month + "", dataID, userformno };
      query.update(sql, params);
      return true;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return false;
  }

  /**
   * 往已办待办中间表中插入一条数据.
   * 
   * @param wfID
   *          工作流id.
   * @param entity
   *          附件实体类对象.
   */
  private void saveCollaborativeEntity(long wfID, CollaborativeEntity entity)
      throws Exception {
    List<CollaborativeEntity> entitys = this.queryCurrStep(wfID);
    if (entitys == null || entitys.isEmpty())
      throw new Exception("通过工作流ID'" + wfID + "'未查询到待办数据，协同中间表插入数据失败!");
    for (CollaborativeEntity currEntity : entitys) {
      currEntity.setState(entity.getState());
      currEntity.setWfType(entity.getWfType());
      currEntity.setOrganID(entity.getOrganID());
      currEntity.setUserformID(entity.getuserformID());
      if (null != entity.getOwner())
        currEntity.setOwner(entity.getOwner());
      else if (null != currEntity.getOwner())
        // currEntity.setOrganID(Long.parseLong(getUserByUserId(currEntity.getOwner()).getDeptEntry()
        // .getOrgid()));
        this.executeSaveCollaborativeEntity(wfID, currEntity);
    }
  }

  private boolean executeSaveCollaborativeEntity(long wfid,
      CollaborativeEntity entity) {
    boolean check = false;
    String sql = "insert into ess_collaborativeManage(stepid,userformid,owner,state,workflowtype,organid,audit_time) values(?,?,?,?,?,?,?)";
    try {
      int row = query.update(
          sql,
          new Object[] { entity.getStepID(), entity.getuserformID(),
              entity.getOwner(), entity.getState(), entity.getWfType(),
              entity.getOrganID(), "" });
      if (row > 0)
        check = true;
    } catch (Exception e) {
      e.printStackTrace();
    }
    // 删除已办数据时不再传入stepID。避免同一流程处理多次出现多条已办的情况。
    this.deleteDealedWFData(entity.getuserformID(), entity.getOwner(), null);
    return check;
  }

  /**
   * 删除类型为协同的已办数据（只保留最后一条，避免同一流程处理了多步在已办中出现多条记录）
   * 
   * @param userformID
   *          es_oswf_user_form表ID
   * @param username
   *          用户名
   * @return
   */
  private boolean deleteDealedWFData(Long userformID, String username,
      String stepID) {
    boolean check = false;
    // 只检索协同类型 因此固定加上条件 workflowtype = 3
    String sql = "delete from ess_collaborativeManage where userformid = "
        + userformID + " and state = 0 and workflowtype = 3 ";
    if (null != username && !"".equals(username))
      sql += " and owner ='" + username + "'";
    if (null != stepID && !"".equals(stepID))
      sql += " and stepid ='" + stepID + "'";
    try {
      int row = query.update(sql);
      if (row > 0)
        check = true;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return check;
  }

  /**
   * 根据工作流ID查询待办数据，用于填充至协同管理关系表es_oswf_collaborativeManage.
   * 
   * @param wfID
   *          工作流ID.
   * @return List<CollaborativeEntity> 返回中间表数据实体集合.实体中step_id 和owner 有值.
   */
  private List<CollaborativeEntity> queryCurrStep(long wfID) throws Exception {
    List<CollaborativeEntity> entitys = new ArrayList<CollaborativeEntity>();
    String sql = "SELECT  currStep.STEP_ID,currStep.Owner FROM ess_transferuser_form userform left join os_currentstep currStep on userform.wf_id=currStep.ENTRY_ID  where currStep.ENTRY_ID = ?";
    try {
      List<Map<String, Object>> dataList = query.query(sql,
          new MapListHandler(), new Object[] { wfID });

      CollaborativeEntity entity = null;
      for (Map<String, Object> dataMap : dataList) {
        Object owner = dataMap.get("Owner");
        if (owner != null && !StringUtils.isEmpty(owner.toString())) {
          String[] ownerArray = (owner.toString()).split(";");
          for (String nowOwner : ownerArray) {
            entity = new CollaborativeEntity();
            entity.setOwner(nowOwner);
            entity.setStepID(Long.parseLong(dataMap.get("STEP_ID").toString()));
            entitys.add(entity);
          }
        }
      }
    } catch (Exception e) {
      throw e;
    }
    return entitys;
  }
}
