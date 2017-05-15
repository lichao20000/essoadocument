package cn.flying.rest.service.utils;

import java.sql.SQLException;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;

/**
 * 使用QueryRunner 进行数据库操作的工具类
 * 
 * @author xuekun
 *
 */
public class JdbcUtil {
  /**
   * 批量操作
   * 
   * @param query
   * @param sql
   * @param params
   * @return
   */
  public static boolean bach(QueryRunner query, String sql, Object[][] params) {
    boolean flag = true;
    try {
      int[] row = query.batch(sql, params);
      if (row == null) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      flag = false;
    }
    return flag;
  }

  /**
   * 更新
   * 
   * @param query
   * @param sql
   * @param params
   * @return
   */
  public static boolean update(QueryRunner query, String sql, Object[] params) {
    boolean flag = true;
    try {
      int row = query.update(sql, params);
      if (row == 0) {
        flag = false;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      flag = false;
    }
    return flag;
  }


  /**
   * 无参数更新
   * 
   * @param query
   * @param sql
   * @return
   */
  public static boolean update(QueryRunner query, String sql) {
    return update(query, sql, null);
  }

  /**
   * 插入一条记录 返回id
   * 
   * @param query
   * @param sql
   * @param params
   * @return
   */
  public static Long insert(QueryRunner query, String sql, Object[] params) {
    try {
      Long id = query.insert(sql, new ScalarHandler<Long>(), params);
      if (id == 0) {
        return null;
      } else {
        return id;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  /**
   * 使用QueryRunner 查询
   * 
   * @param query
   * @param sql
   * @param SetHandler
   * @param params
   * @return
   */
  public static <T> T query(QueryRunner query, String sql, ResultSetHandler<T> SetHandler,
      Object[] params) {
    try {
      if (params != null && params.length > 0) {
        return query.query(sql, SetHandler, params);
      } else {
        return query.query(sql, SetHandler);
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }

  }

  public static <T> T query(QueryRunner query, String sql, ResultSetHandler<T> SetHandler) {
    return query(query, sql, SetHandler, null);
  }

  /**
   * 获取字段类型
   * 
   * @param type
   * @param columnLength
   * @return
   */
  public static String getColumnType(VALUETYPES.TYPE type, String columnLength,
      String columnDotLength) {
    switch (type) {
      case NUMBER:
        return "int(" + columnLength + ")";
      case FLOAT:
        return "FLOAT(" + columnLength + "," + columnDotLength + ")";
      case DATE:
        //return "DATE";时间类型不能设置长度，默认修改字段后长度为0，校验字段时过不去，改为VARCHAR
        return "VARCHAR(" + columnLength + ")";
      case TIME:
        return "CHAR(" + columnLength + ")";
      case BOOL:
        return "CHAR(" + columnLength + ")";
      default:
        return "VARCHAR(" + columnLength + ")";
    }
  }

  public static String getColumnNullStatu(int columnLength) {
    switch (columnLength) {
      case 1:
        return "";
      default:
        return "";
    }
  }
}
