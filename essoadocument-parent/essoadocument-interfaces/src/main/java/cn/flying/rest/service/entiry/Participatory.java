package cn.flying.rest.service.entiry;

/**
 * 参建单位或部门
 * 
 * @author dengguoqi 2014-11-4
 * 
 */
public class Participatory {
  private long id;
  private String name;
  private String code;
  private String type;
  private String user_id;
  private long pid;

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getUser_id() {
    return user_id;
  }

  public void setUser_id(String user_id) {
    this.user_id = user_id;
  }

  public long getPid() {
    return pid;
  }

  public void setPid(long pid) {
    this.pid = pid;
  }

}
