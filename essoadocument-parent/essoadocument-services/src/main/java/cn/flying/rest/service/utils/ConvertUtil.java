package cn.flying.rest.service.utils;

import java.util.Map;

/**
 * 转换的工具类
 * 
 * @author xie
 * 
 */
public class ConvertUtil {
  /**
   * xiewenda
   * 
   * @see 此方法将过滤的条件字符串转化为sql语句字符串
   * @param condition 按照一定规则拼接的过滤条件的字符串 例如：'id,equels,11,and & name,like,aa,or'
   * @param Sep1 第一层分割符 例如 &
   * @param Sep2 第二层分割符 例如 ,
   * @return sql语句字符串 例如： id=11 and name like '%aa%'
   */
  public String conditonToSql(String condition, String Sep1, String Sep2) {
    if (condition == null || "".equals(condition))
      return "";
    String[] where = condition.split(Sep1);
    StringBuilder sb = new StringBuilder();
    for (String str : where) {
      if ("".equals(str.trim()))
        continue;
      String[] arr = str.split(Sep2);
      //时间类型的字需要将用mysql函数转换后在进行比较
        sb.append(arr[0]);
        if ("equal".equals(arr[1])) {
          sb.append(" = ");
          sb.append("'" + arr[2] + "'");
        } else if ("greaterThan".equals(arr[1])) {
          sb.append(" > ");
          sb.append("'" + arr[2] + "'");
        } else if ("lessThan".equals(arr[1])) {
          sb.append(" < ");
          sb.append("'" + arr[2] + "'");
        } else if ("notEqual".equals(arr[1])) {
          sb.append(" != ");
          sb.append("'" + arr[2] + "'");
        } else if ("greaterEqual".equals(arr[1])) {
          sb.append(" >= ");
          sb.append("'" + arr[2] + "'");
        } else if ("lessEqual".equals(arr[1])) {
          sb.append(" <= ");
          sb.append("'" + arr[2] + "'");
        } else if ("like".equals(arr[1])) {
          sb.append(" like ");
          sb.append(" '%" + arr[2] + "%'");
        } else if ("notLike".equals(arr[1])) {
          sb.append(" not like ");
          sb.append("'%" + arr[2] + "%'");
        }
        sb.append(" " + arr[3] + " ");
      }
    return sb.toString().substring(0, sb.toString().length() - 4);
  }
  /**
   * xiewenda
   * 为了过滤日志添加显示中过滤条件
   * @see 此方法将过滤的条件字符串转化为sql语句字符串
   * @param condition 按照一定规则拼接的过滤条件的字符串 例如：'age,equal,11,and & name,like,aa,or'
   * @param Sep1 第一层分割符 例如 &
   * @param Sep2 第二层分割符 例如 ,
   * @param filedMap 字段的code—>name 的map集合
   * @return sql语句字符串 例如： 【年龄等于11】并且【名称包含aa】
   * 
   */
  public String conditonToChines(String condition, String Sep1, String Sep2,Map<String,String> filedMap){
    if (condition == null || "".equals(condition))
      return "";
    String[] where = condition.split(Sep1);
    StringBuilder sb = new StringBuilder();
    String result = "";
    for (String str : where) {
      if ("".equals(str.trim()))
          continue;
     String[] arr = str.split(Sep2);
     String filed = filedMap.get(arr[0]);
     sb.append("【");
     //比较符
     if(!"null".equals(filed)){
       sb.append(filed);//字段名
       if("equal".equals(arr[1])){
         sb.append("等于");
       }else if("greaterThan".equals(arr[1])){
         sb.append("大于");
       }else if("lessThan".equals(arr[1])){
         sb.append("小于");
       }else if("notEqual".equals(arr[1])){
         sb.append("不等于");
       }else if("greaterEqual".equals(arr[1])){
         sb.append("大于等于");
       }else if("lessEqual".equals(arr[1])){
         sb.append("小于等于");
       }else if("like".equals(arr[1])){
         sb.append("包含");
       }else if("notLike".equals(arr[1])){
         sb.append("不包含");
       }
       //值
       sb.append(arr[2]);
       sb.append("】");
       //关联关系
       if("and".equals(arr[3].toLowerCase())||"true".equals(arr[3])){
         sb.append("并且");
       }else{
         sb.append("或者");
       }
       if(sb.length()>2)
       result = sb.substring(0, sb.length()-2);
     }
    }
    return result;
  }
}
