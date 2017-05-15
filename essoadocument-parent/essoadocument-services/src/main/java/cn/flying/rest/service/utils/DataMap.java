package cn.flying.rest.service.utils;

import java.sql.Date;
import java.util.HashMap;
import java.util.Set;


/**
 * 管理数据描述.数据描述＝名称－值 ; 例如 field=esidentifier value=dc. 
 * @author 黄本华
 * @version 1.1 2005-11-20
 */
public class DataMap extends HashMap<Field, Value>{
    private static final long serialVersionUID = -1797702563693806162L;
    /**
     * 无参的构造方法.
     */
    public DataMap(){}
    /**
     * 构造方法.将值都放入到集合中.
     * @param dmap
     */
    public DataMap(DataMap dmap){ super.putAll(dmap); }
    
    /**
     * 构造方法，将HashaMap转换为DataMap.
     * @param hmap map数据集合.
     * @author liukaiyuan 20090310 
     **/
    public DataMap(HashMap<String,String> hmap){ 
        Set<String> set =  hmap.keySet();
        for (String string : set) {
            Object o = hmap.get(string) ;
            if (o instanceof String){
                add(string, (String)o);
            }
            else if (o instanceof Integer){
                addNumber(string,o);
            }
            else if (o instanceof Double){//zhangyuanxi 20101228 添加double类型
                addFloat(string,o);
            }
            
        }
      }
    /**
     * 添加文本值对象.
     * @param f 字段.
     * @param v 文本值.
     * @return ValueText 返回文本值对象.
     */
     public ValueText add(String f,String v){
          return (ValueText)put(new Field(f),new ValueText(v));
      }
      /**
       * 添加数字值对象.
       * @param f 字段.
       * @param v 数字值.
       * @return ValueNumber 返回数字值对象.
       */
      public ValueNumber add(String f,double v){
          return (ValueNumber)put(new Field(f),new ValueNumber((long)v));
      }
      /**
       * 添加日期值对象.
       * @param f 字段.
       * @param v 日期值.
       * @return ValueDate 返回日期值对象.
       */
      public ValueDate add(String f,Date v){
          return (ValueDate)put(new Field(f),new ValueDate(v));
      }
      /**
       * 添加boolean值对象.
       * @param f 字段.
       * @param v  boolean值.
       * @return ValueBool 返回boolean值对象.
       */
      public ValueBool add(String f,boolean v){
          return (ValueBool)put(new Field(f),new ValueBool(v));
      }
      /**
       * 添加值对象.
       * @param f 字段.
       * @param v 值对象.
       * @return Value 返回值对象.
       */
      public Value add(String f,Value v){
          return (Value)put(new Field(f),v);
      }
      /**
       * 添加文本值对象.
       * @param f 字段.
       * @param v 文本值.
       * @return ValueText 返回文本值对象.
       */
      public ValueText addText(String f,Object v){
          return (ValueText)put(new Field(f),new ValueText(v + ""));
      }
      /**
       * 添加数字值对象.
       * @param f 字段.
       * @param v 数字值对象.
       * @return ValueNumber 返回数字值对象.
       */
      public ValueNumber addNumber(String f,Object v){
          return (ValueNumber)put(new Field(f),new ValueNumber(Long.valueOf(v + "")));
      }
      /**
       * 添加日期对象.
       * @param f 字段.
       * @param v 日期值.
       * @return ValueDate 返回日期值对象.
       */
      public ValueDate addDate(String f,Object v){
          return (ValueDate)put(new Field(f),new ValueDate(Date.valueOf(v + "")));
      }
      /**
       * 添加boolean对象.
       * @param f 字段.
       * @param v boolean对象值.
       * @return ValueBool 返回boolean值对象.
       */
      public ValueBool addBool(String f,Object v){
          return (ValueBool)put(new Field(f),new ValueBool(Boolean.valueOf(v + "")));
      }
      /**
       * 添加对象.
       * @param f 字段.
       * @param v 对象值.
       * @return Value 返回值对象.
       */
      public Value addObject(String f,Object v){
          return (Value)put(new Field(f),(Value)v);
      }
      /**
       * 获得某字段的值对象.
       * @param f 字段.
       * @return Value 返回字段的值对象.
       */
      public final Value get(String f){
          return get(new Field(f));
      }
      /**
       * 得到某字段的值对象.
       * @param f 字段.
       * @return Value 返回字段的值对象.
       */
      public final Value get(Field f){
          Value v = super.get(f);
          if(v==null)return new ValueText(null);
          return v;
      }
      /**
       * 删除某字段.
       * @param s 字段.
       * @return Value 返回删除的字段值对象.
       */
      public Value remove(String s){      
          return super.remove(new Field(s));
      }
      /**
       * 判断是否包含某个字段.
       * @param f 字段.
       * @return  boolean false DataMap里面不包含该字段. true DataMap里面包含这字段.
       */
      public boolean contains(Field f){
          return super.containsKey(f);
      }
      /**
       * 判断是否包含该字段.
       * @param f 字段.
       * @return boolean false DataMap里面不包含该字段. true DataMap里面包含这字段.
       */
      public boolean contains(String f){
          return super.containsKey(new Field(f));
      }
      /**
       * dataMap中添加增加float类型的数据.
       * @author zhangyuanxi 20101228 
       * @param f 字段
       * @param v float类型的数据.
       * @return ValueNumber 返回数字对象.
       */
      public ValueNumber addFloat(String f,Object v){
          return (ValueNumber)put(new Field(f),new ValueFloat(v.toString()));
      }
      //test
      public static void main(String[] args){
        DataMap dmap = new DataMap();
        dmap.addFloat("s", 0.0);
    //  dmap.add("", "");
    //  dmap.add("a", "");
    //  dmap.add("", "a");
    //  dmap.add("a", "a");
    //  dmap.add("a.a", "aaa");
    //  dmap.add("日期.创建日期  ".trim(),Date.valueOf("2005-12-01"));
    //  dmap.remove("a");
    //  System.out.println(dmap.contains("a"));
    //  for(Field f: dmap.keySet()){
    //      String ff = f.toString();
    //      System.out.println(f + "-->" + dmap.get(f));
    //      System.out.println(ff + "-->" + dmap.get(ff));
    //  }
        
        
        
      }
}
