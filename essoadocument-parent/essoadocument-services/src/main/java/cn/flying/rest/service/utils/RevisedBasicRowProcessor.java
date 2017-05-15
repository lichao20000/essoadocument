package cn.flying.rest.service.utils;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.apache.commons.dbutils.BasicRowProcessor;

/**
 * 继承BasicRowProcessor 重写 toMap方法 修改 数据查询时 别名 不识别的问题
 * 
 * @author xuekun
 * 
 */
public class RevisedBasicRowProcessor extends BasicRowProcessor {
  @Override
  public Map<String, Object> toMap(ResultSet rs) throws SQLException {
    Map<String, Object> result = new CaseInsensitiveHashMap();
    ResultSetMetaData rsmd = rs.getMetaData();
    int cols = rsmd.getColumnCount();

    for (int i = 1; i <= cols; i++) {
      result.put(rsmd.getColumnLabel(i), rs.getObject(i));
    }
    return result;
  }

  /**
   * 私有类 重写hashmap 忽略key的大小写
   * 
   * @author xuekun
   * 
   */
  private static class CaseInsensitiveHashMap extends HashMap<String, Object> {
    private final Map<String, String> lowerCaseMap = new HashMap<String, String>();

    private static final long serialVersionUID = -2848100435296897392L;

    @Override
    public boolean containsKey(Object key) {
      Object realKey = lowerCaseMap.get(key.toString().toLowerCase(Locale.ENGLISH));
      return super.containsKey(realKey);
    }

    @Override
    public Object get(Object key) {
      Object realKey = lowerCaseMap.get(key.toString().toLowerCase(Locale.ENGLISH));
      return super.get(realKey);
    }

    @Override
    public Object put(String key, Object value) {
      Object oldKey = lowerCaseMap.put(key.toLowerCase(Locale.ENGLISH), key);
      Object oldValue = super.remove(oldKey);
      super.put(key, value);
      return oldValue;
    }

    @Override
    public void putAll(Map<? extends String, ?> m) {
      for (Map.Entry<? extends String, ?> entry : m.entrySet()) {
        String key = entry.getKey();
        Object value = entry.getValue();
        this.put(key, value);
      }
    }

    @Override
    public Object remove(Object key) {
      Object realKey = lowerCaseMap.remove(key.toString().toLowerCase(Locale.ENGLISH));
      return super.remove(realKey);
    }
  }
}
