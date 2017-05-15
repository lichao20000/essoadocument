package cn.flying.rest.service.entiry;

import java.io.Serializable;

public class StatisticItems implements Serializable{
  private static final long serialVersionUID = -3607098991798817640L;
  private Long id;//逻辑主键
  private int tree_id;//统计树节点标识id
  private Long statistic_id;//关联的统计规则的id
  private String ruleField;//规则字段
  private String ruleMethod;//规则方法
  private int colNo;//列号
  private String ruleCondition;//统计的规则条件
  private int nodeType;//节点类型
  private int isCollection;
  private String collIdentifier;
  private int structureId;
  private String cncondition;//统计条件显示规则
  private String encondition;//统计条件生成规则
  
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public int getTree_id() {
    return tree_id;
  }
  public void setTree_id(int tree_id) {
    this.tree_id = tree_id;
  }
  public Long getStatistic_id() {
    return statistic_id;
  }
  public void setStatistic_id(Long statistic_id) {
    this.statistic_id = statistic_id;
  }
  public String getRuleField() {
    return ruleField;
  }
  public void setRuleField(String ruleField) {
    this.ruleField = ruleField;
  }
  public String getRuleMethod() {
    return ruleMethod;
  }
  public void setRuleMethod(String ruleMethod) {
    this.ruleMethod = ruleMethod;
  }
  public int getColNo() {
    return colNo;
  }
  public void setColNo(int colNo) {
    this.colNo = colNo;
  }
  public String getRuleCondition() {
    return ruleCondition;
  }
  public void setRuleCondition(String ruleCondition) {
    this.ruleCondition = ruleCondition;
  }
 
  public int getNodeType() {
    return nodeType;
  }
  public void setNodeType(int nodeType) {
    this.nodeType = nodeType;
  }
  public int getIsCollection() {
    return isCollection;
  }
  public void setIsCollection(int isCollection) {
    this.isCollection = isCollection;
  }
  public String getCollIdentifier() {
    return collIdentifier;
  }
  public void setCollIdentifier(String collIdentifier) {
    this.collIdentifier = collIdentifier;
  }
  public int getStructureId() {
    return structureId;
  }
  public void setStructureId(int structureId) {
    this.structureId = structureId;
  }
  public String getCncondition() {
    return cncondition;
  }
  public void setCncondition(String cncondition) {
    this.cncondition = cncondition;
  }
  public String getEncondition() {
    return encondition;
  }
  public void setEncondition(String encondition) {
    this.encondition = encondition;
  }
  
}
