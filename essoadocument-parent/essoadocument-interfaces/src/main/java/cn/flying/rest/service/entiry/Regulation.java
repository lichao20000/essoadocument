package cn.flying.rest.service.entiry;

import java.io.Serializable;

public class Regulation implements Serializable {
  private static final long serialVersionUID = 2370475443902537521L;
  private Long id;// 主键
  private String no;// 规范编号
  private String chineseName;// 中文名称
  private String englishName;// 英文名称
  private String publishTime;// 发布时间
  private String filePath;// 关联文件路径
  private String fileName;// 上传的文件显示名称

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

  public String getEnglishName() {
    return englishName;
  }

  public void setEnglishName(String englishName) {
    this.englishName = englishName;
  }


  public String getPublishTime() {
    return publishTime;
  }

  public void setPublishTime(String publishTime) {
    this.publishTime = publishTime;
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


}
