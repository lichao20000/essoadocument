package cn.flying.rest.service.entiry;



public class EssFolder {

  private long id;
  private String estitle;
  private String espath;
  private long userid;
  private long parentid;
  private long hookingNum;// 标识文件夹下挂接的数量
  private long notHookNum;// 标识文件夹下为挂接的数量
  private Boolean isParent;
  private String newpath;// 页面展示字段和espath相同把/转化为-
  private String esViewTitle;// 用于电子文件中心显示的标题 也就是截取后的名字



  public long getId() {
    return this.id;
  }


  public long getHookingNum() {
    return hookingNum;
  }

  public void setHookingNum(long hookingNum) {
    this.hookingNum = hookingNum;
  }

  public long getNotHookNum() {
    return notHookNum;
  }

  public void setNotHookNum(long notHookNum) {
    this.notHookNum = notHookNum;
  }

  public long getUserid() {
    return userid;
  }

  public void setUserid(long userid) {
    this.userid = userid;
  }


  public long getParentid() {
    return parentid;
  }

  public void setParentid(long parentid) {
    this.parentid = parentid;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getEstitle() {
    return this.estitle;
  }

  public void setEstitle(String estitle) {
    this.estitle = estitle;
  }

  public String getEspath() {
    return this.espath;
  }

  public void setEspath(String espath) {
    this.espath = espath;
  }

  public Boolean getIsParent() {
    return isParent;
  }

  public void setIsParent(Boolean isParent) {
    this.isParent = isParent;
  }

  public String getNewpath() {
    return newpath;
  }

  public void setNewpath(String newpath) {
    this.newpath = newpath;
  }

  public String getEsViewTitle() {
    return esViewTitle;
  }

  public void setEsViewTitle(String esViewTitle) {
    this.esViewTitle = esViewTitle;
  }

}
