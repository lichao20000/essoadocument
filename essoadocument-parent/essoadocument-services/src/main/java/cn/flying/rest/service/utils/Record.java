package cn.flying.rest.service.utils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * 修改values的数据结构 为了减少系统内存开销 将其格式从List<Pair<Header,ValueCell>>修改为HashMap<String,ValueCell>
 */
public class Record implements Serializable {
  private static final long serialVersionUID = 1L;
  private DataMap dataMap;
  private HashMap<String, ValueCell> values = new HashMap<String, ValueCell>();
  private boolean validateResult = true;
  private boolean isNull = true;

  /** 是否为空标示 **/
  public boolean isValidateResult() {
    return validateResult;
  }

  public void setValidateResult(boolean validateResult) {
    this.validateResult = this.validateResult && validateResult;
  }

  public boolean isNull() {
    return isNull;
  }

  public void setIsNull(boolean isNull) {
    this.isNull = isNull;
  }

  public HashMap<String, ValueCell> getValues() {
    return values;
  }
  
  public Map<String,String> getData() {
    Map<String,String> rtMap = new HashMap<String,String>();
    Iterator<Entry<String, ValueCell>> iterator = values.entrySet().iterator();
    Entry<String, ValueCell> entry = null;
    while (iterator.hasNext()) {
      entry = iterator.next();
      rtMap.put(entry.getKey(), entry.getValue().getValue());
    }
    return rtMap;
  }

  public DataMap getDataMap() {
    if (dataMap == null && !values.isEmpty()) {
      dataMap = new DataMap();
      Iterator<Entry<String, ValueCell>> iterator = values.entrySet().iterator();
      Entry<String, ValueCell> entry = null;
      while (iterator.hasNext()) {
        entry = iterator.next();
        dataMap.put(new Field(entry.getKey()), new ValueText(entry.getValue().getValue()));
      }
    }
    return dataMap;
  }

  public DataMap getDataMap(Map<String, Header> hm) {
    DataMap dataMap = new DataMap();
    if (!values.isEmpty()) {
      List<String> headers = new ArrayList<String>(hm.keySet());
      Iterator<Entry<String, ValueCell>> iterator = values.entrySet().iterator();
      Entry<String, ValueCell> entry = null;
      String fieldName = null;
      String fieldValue = null;
      while (iterator.hasNext()) {
        entry = iterator.next();
        fieldName = entry.getKey();
        fieldValue = entry.getValue().getValue();
        if (headers.contains(fieldName)) {
          Header header = hm.get(fieldName);
          /** 将下面组装导入数据的字段名修改为header.getName() 避免名称不同引起导入数据为空 **/
          if (fieldValue == null || "".equals(fieldValue)) {
            if (ValueType.NUMBER.getDescription().equals(header.getType())) {
              dataMap.put(new Field(header.getName()), new ValueText(""));
            } else if (ValueType.FLOAT.getDescription().equals(header.getType())) {
              dataMap.put(new Field(header.getName()), new ValueText(""));
            } else if (ValueType.BOOL.getDescription().equals(header.getType())) {
              dataMap.put(new Field(header.getName()), new ValueText("否"));
            } else if (ValueType.TIME.getDescription().equals(header.getType())) {
              dataMap.put(new Field(header.getName()), new ValueText(""));
            } else {
              dataMap.put(new Field(header.getName()), new ValueText(fieldValue));
            }
          } else {
            dataMap.put(new Field(header.getName()), new ValueText(fieldValue));
          }
        }
      }
    }
    return dataMap;
  }

}
