package cn.flying.rest.service.entiry;

/**
 * 装置单元
 * 
 * @author xuekun
 *
 */
public class Device {
  private long id;// 流水号
  private long pId;// 父节点id
  private String name;// 装置名称
  private String firstNo;// 主项号
  private String secondNo;// 子项号
  private String deviceNo;// 装置单元号 =主项号+子项号
  private String baseUnits;// 基础设计单位
  private String detailUnits;// 详细设计单位
  private String mainPart;// 负责部门
  private String supervisionUnits;// 监理单位
  private String remarks;// 备注

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public long getpId() {
    return pId;
  }

  public void setpId(long pId) {
    this.pId = pId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getFirstNo() {
    return firstNo;
  }

  public void setFirstNo(String firstNo) {
    this.firstNo = firstNo;
  }

  public String getSecondNo() {
    return secondNo;
  }

  public void setSecondNo(String secondNo) {
    this.secondNo = secondNo;
  }

  public String getDeviceNo() {
    return deviceNo;
  }

  public void setDeviceNo(String deviceNo) {
    this.deviceNo = deviceNo;
  }

  public String getBaseUnits() {
    return baseUnits;
  }

  public void setBaseUnits(String baseUnits) {
    this.baseUnits = baseUnits;
  }

  public String getDetailUnits() {
    return detailUnits;
  }

  public void setDetailUnits(String detailUnits) {
    this.detailUnits = detailUnits;
  }

  public String getMainPart() {
    return mainPart;
  }

  public void setMainPart(String mainPart) {
    this.mainPart = mainPart;
  }

  public String getSupervisionUnits() {
    return supervisionUnits;
  }

  public void setSupervisionUnits(String supervisionUnits) {
    this.supervisionUnits = supervisionUnits;
  }

  public String getRemarks() {
    return remarks;
  }

  public void setRemarks(String remarks) {
    this.remarks = remarks;
  }

}
