package cn.flying.rest.service.utils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 系统全局使用静态变量的类
 * @author fy
 *
 */
public class StaticUtil {

  public static boolean luceneCreatingIndex = false;//索引库是否正在创建索引
  public static boolean isIndexStoreUpdate = false;//是否是索引库的更新操作
  public static String isIndexStoreUpdateStr = "isIndexStoreUpdate";//用于在条件中的map中解析时候用的字符串
  public static Map<String,List<String>> IndexStoreNodeIds = new HashMap<String, List<String>>();
  public static String fullIndexPath = "";//全文索引库路径
  public static Map<String,String> ArchiveClassMap = new HashMap<String, String>();//存储档案类型的静态变量
}
