package cn.flying.rest.service.entiry;

/**
 * combox(数据字典)基本属性.
 */
public class FormComboEntity {
  /**
   * 主键id.
   */
  private Long id; // Primary key
  /**
   * combox的标识.
   */
  private String identifier;
  /**
   * combox的属性值.
   */
  private String comboValue;
  /**
   * combox的类型.
   */
  private String estype;
  /**
   * 数据路径（为系统类型时 dataUrl有值）.
   */
  private String dataUrl;
  /**
   * 描述.
   */
  private String describe; // 描述

  public String getDescride() {
    return describe;
  }

  public void setDescribe(String describe) {
    this.describe = describe;
  }

  public String getDataUrl() {
    return dataUrl;
  }

  public void setDataUrl(String dataUrl) {
    this.dataUrl = dataUrl;
  }

  public String getComboValue() {
    return comboValue;
  }

  public void setComboValue(String comboValue) {
    this.comboValue = comboValue;
  }

  public String getEstype() {
    return estype;
  }

  public void setEstype(String estype) {
    this.estype = estype;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getIdentifier() {
    return identifier;
  }

  public void setIdentifier(String identifier) {
    this.identifier = identifier;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    final FormComboEntity other = (FormComboEntity) obj;
    if (id == null) {
      if (other.id != null)
        return false;
    } else if (!id.equals(other.id))
      return false;
    if (id != other.id)
      return false;
    if (identifier == null) {
      if (other.identifier != null)
        return false;
    } else if (!identifier.equals(other.identifier))
      return false;
    if (comboValue == null) {
      if (other.comboValue != null)
        return false;
    } else if (!comboValue.equals(other.comboValue))
      return false;
    if (estype == null) {
      if (other.estype != null)
        return false;
    } else if (!estype.equals(other.estype))
      return false;
    if (dataUrl == null) {
      if (other.dataUrl != null)
        return false;
    } else if (!dataUrl.equals(other.dataUrl))
      return false;
    if (describe == null) {
      if (other.describe != null)
        return false;
    } else if (!describe.equals(other.describe))
      return false;
    return true;
  }

  @Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME * result + ((id == null) ? 0 : id.hashCode());
    result = PRIME * result + (int) (id ^ (id >>> 32));
    result = PRIME * result
        + ((identifier == null) ? 0 : identifier.hashCode());
    result = PRIME * result
        + ((comboValue == null) ? 0 : comboValue.hashCode());
    result = PRIME * result + ((estype == null) ? 0 : estype.hashCode());
    result = PRIME * result + ((dataUrl == null) ? 0 : dataUrl.hashCode());
    result = PRIME * result + ((describe == null) ? 0 : describe.hashCode());
    return result;
  }

  @Override
  public String toString() {
    return this.identifier;
  }
}
