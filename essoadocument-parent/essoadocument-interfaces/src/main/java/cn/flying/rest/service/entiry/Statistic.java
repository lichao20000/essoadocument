package cn.flying.rest.service.entiry;

import java.io.Serializable;

public class Statistic implements Serializable{
  private static final long serialVersionUID = -1995514972225743376L;
  private Long id;
  private String  statisticName;//统计名称
  private int  treeType;//统计名称
  private int colCount;//统计条件列数
  private String colTitle;//列标题
  private String currStep;//当前进行统计步骤
  private int classNode;
  private int dataNode;
  private int isSummary;
  private int isLayout;//显示样式
  private int isComplete;//是否完成统计
  private String orgId;//所属的部门
  private String pic;//要展现的图表格式
  
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public String getStatisticName() {
    return statisticName;
  }
  public void setStatisticName(String statisticName) {
    this.statisticName = statisticName;
  }
  public int getTreeType() {
    return treeType;
  }
  public void setTreeType(int treeType) {
    this.treeType = treeType;
  }
  public int getColCount() {
    return colCount;
  }
  public void setColCount(int colCount) {
    this.colCount = colCount;
  }
  public String getColTitle() {
    return colTitle;
  }
  public void setColTitle(String colTitle) {
    this.colTitle = colTitle;
  }
  public String getCurrStep() {
    return currStep;
  }
  public void setCurrStep(String currStep) {
    this.currStep = currStep;
  }
 
  public int getClassNode() {
    return classNode;
  }
  public void setClassNode(int classNode) {
    this.classNode = classNode;
  }
  public int getDataNode() {
    return dataNode;
  }
  public void setDataNode(int dataNode) {
    this.dataNode = dataNode;
  }
  public int getIsSummary() {
    return isSummary;
  }
  public void setIsSummary(int isSummary) {
    this.isSummary = isSummary;
  }
  public int getIsLayout() {
    return isLayout;
  }
  public void setIsLayout(int isLayout) {
    this.isLayout = isLayout;
  }
  public int getIsComplete() {
    return isComplete;
  }
  public void setIsComplete(int isComplete) {
    this.isComplete = isComplete;
  }
  public String getOrgId() {
    return orgId;
  }
  public void setOrgId(String orgId) {
    this.orgId = orgId;
  }
  public String getPic() {
    return pic;
  }
  public void setPic(String pic) {
    this.pic = pic;
  }
  
  

}
