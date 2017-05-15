package cn.flying.rest.service.entiry;

/**
 * 文件代码实体类
 * 
 * @author xuekun
 *
 */
public class DocumentType {
  private int id;// 流水号
  private String typeName;// 分类名称
  private String typeNo;// 分类代码
  private int codeType;// 代码类型 1:类型代码, 2:专业代码

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  public String getTypeName() {
    return typeName;
  }

  public void setTypeName(String typeName) {
    this.typeName = typeName;
  }

  public String getTypeNo() {
    return typeNo;
  }

  public void setTypeNo(String typeNo) {
    this.typeNo = typeNo;
  }

  public int getCodeType() {
    return codeType;
  }

  public void setCodeType(int codeType) {
    this.codeType = codeType;
  }


}
