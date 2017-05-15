package cn.flying.rest.dao;

import java.util.List;
import java.util.Map;

import cn.flying.rest.entity.CollaborativeEntity;


/**
 * 
 * @author xuekun
 *
 */
public interface DocumentTransferDao {
  /**
   * 文控系统 文件流转前对数据进行验证，检查是否存在正在流转的数据 xuekun 2015年2月9日 下午1:55:41 目前一次只能流转一条数据
   * 
   * @param map
   * @param rightCond
   * @return
   */
  public boolean checkTransfer(Long id, String rightCond);

  /**
   * 判断该节点是否存在流程 xuekun 2015年2月25日 上午10:30:54
   * 
   * @param stage
   * @return
   */
  public boolean checkIfExitsFlow(Long stageId);

  /**
   * 获取该节点存在的所有流程 xuekun 2015年2月25日 上午10:47:18
   * 
   * @param stageId
   * @return
   */
  public Map<String, Object> getTransferFlow(Long id);

  /**
   * 获取符合条件的流程 xuekun 2015年2月25日 下午3:39:54
   * 
   * @param stageId
   * @return
   */
  public Map<String, Object> getWfList(String stageId);

  /**
   * 获得某个收集范围下的所有 流程模版 xuekun 2015年2月26日 上午9:50:03
   * 
   * @param stageId
   * @return
   */
  public List<Map<String, Object>> getTransferFlows(Long stageId);

  /**
   * 通过流程模版Id和步骤Id获取一条步骤数据 xuekun 2015年2月26日 上午9:53:58
   * 
   * @param flowId
   * @param stepId
   * @return
   */
  public Map<String, Object> getTransferStep(Long flowId, Long stepId);

  public Map<String, Object> getTransferAction(Long flowId, Long stepId);

  /**
   * 获取某节点下所有的节点 xuekun 2015年3月2日 下午5:12:58
   * 
   * @param formId
   * @return
   */
  public List<Map<String, Object>> getEditMataList(String stageId);

  public int generateESFId(long formId);

  boolean startWorkflow(long wfID, long formId, int userformID,
      Map<String, Object> userFormdataMap, CollaborativeEntity collEntity);

}
