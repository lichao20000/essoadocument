package cn.flying.rest.service.entiry;

import java.io.Serializable;
import java.sql.Timestamp;

public class File implements Serializable {

  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  private int id;
  private String projectname;
  private String deviceno;
  private String title;
  private String fileencoding;
  private String draftdepartmment;
  private String draftperson;
  private Timestamp draftdate;

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public String getProjectname() {
    return projectname;
  }

  public void setProjectname(String projectname) {
    this.projectname = projectname;
  }

  public String getDeviceno() {
    return deviceno;
  }

  public void setDeviceno(String deviceno) {
    this.deviceno = deviceno;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getFileencoding() {
    return fileencoding;
  }

  public void setFileencoding(String fileencoding) {
    this.fileencoding = fileencoding;
  }

  public String getDraftdepartmment() {
    return draftdepartmment;
  }

  public void setDraftdepartmment(String draftdepartmment) {
    this.draftdepartmment = draftdepartmment;
  }

  public String getDraftperson() {
    return draftperson;
  }

  public void setDraftperson(String draftperson) {
    this.draftperson = draftperson;
  }

  public Timestamp getDraftdate() {
    return draftdate;
  }

  public void setDraftdate(Timestamp draftdate) {
    this.draftdate = draftdate;
  }

}
