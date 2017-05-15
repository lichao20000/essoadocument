package cn.flying.rest.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;

import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.ICatalogCheckService;

@Path("catalogcheck")
@Component
public class CatalogCheckServiceImpl extends BasePlatformService implements ICatalogCheckService {
  @Resource(name = "queryRunner")
  private QueryRunner query;


  @Override
  public List<Map<String, Object>> findNoDataNodeList(Long stageId, Long deviceId) {
    String deviceCode = this.getDeviceCode(deviceId);

    return this.getIterativeNoDataNodeByPid(stageId, deviceCode);
  }

  /**
   * 通过id 获取装置号
   * 
   * @param stageId
   * @return
   */
  private String getDeviceCode(Long deviceId) {
    String sql = "select deviceNo from ess_device where id= ?";
    String deviceNo = null;
    try {
      deviceNo = query.query(sql, new ScalarHandler<String>(), new Object[] {deviceId});
    } catch (Exception e) {
      e.printStackTrace();
    }
    return deviceNo;
  }

  /**
   * 迭代获取 错误树形表格结构数据
   * 
   * @param stageId
   * @param deviceCode
   * @return
   */
  private List<Map<String, Object>> getIterativeNoDataNodeByPid(Long stageId, String deviceCode) {
    List<Map<String, Object>> list = null;
    String sql =
        "select a.* from ess_document_stage a where a.pid=? "
            + "and not exists ( select 1 from ess_document b where a. code = b.stageCode ";

    if (!StringUtils.isEmpty(deviceCode)) {
      sql += " and b.deviceCode = '" + deviceCode + "')";
    } else {
      sql += " and (b.deviceCode='' or b.deviceCode is null) )";
    }
    List<Map<String, Object>> datalist = null;
    Map<String, Object> dataMap = null;
    try {
      datalist = query.query(sql, new MapListHandler(), new Object[] {stageId});
      if (datalist != null) {
        list = new ArrayList<Map<String, Object>>();
        for (int i = 0; i < datalist.size(); i++) {
          dataMap = datalist.get(i);
          if (StringUtils.equals((String) dataMap.get("isnode"), "0")) {
            list.add(dataMap);
          } else {
            List<Map<String, Object>> childrenlist =
                getIterativeNoDataNodeByPid(Long.parseLong(dataMap.get("id").toString()),
                    deviceCode);
            if (childrenlist != null && childrenlist.size() != 0) {
              dataMap.put("children", childrenlist);
              list.add(dataMap);
            }

          }
        }
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return list;
  }

  /**
   * 获取收集范围编码
   * 
   * @param deviceId
   * @return
   */
  public String getStageCode(Long stageId) {
    String sql = "select code from ess_document_stage where id= ?";
    String stageCode = null;
    try {
      stageCode = query.query(sql, new ScalarHandler<String>(), new Object[] {stageId});
    } catch (Exception e) {
      e.printStackTrace();
    }
    return stageCode;
  }
}
