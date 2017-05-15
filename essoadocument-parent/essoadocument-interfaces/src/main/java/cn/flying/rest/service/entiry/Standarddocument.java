package cn.flying.rest.service.entiry;

import java.io.Serializable;

public class Standarddocument implements Serializable {
  private static final long serialVersionUID = 6632593178960709632L;
  private Long id;// 主键
  private String no;// 规范编号
  private String chineseName;// 中文名称
  private String description;// 文件描述
  private String filePath;// 关联文件路径
  private String fileName;// 上传的文件显示名称
  private Long regulation_id;// 关联的规范id
  private String regulation_name;// 关联的规范中文名

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getNo() {
    return no;
  }

  public void setNo(String no) {
    this.no = no;
  }

  public String getChineseName() {
    return chineseName;
  }

  public void setChineseName(String chineseName) {
    this.chineseName = chineseName;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getFilePath() {
    return filePath;
  }

  public void setFilePath(String filePath) {
    this.filePath = filePath;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public Long getRegulation_id() {
    return regulation_id;
  }

  public void setRegulation_id(Long regulation_id) {
    this.regulation_id = regulation_id;
  }

  public String getRegulation_name() {
    return regulation_name;
  }

  public void setRegulation_name(String regulation_name) {
    this.regulation_name = regulation_name;
  }


}
